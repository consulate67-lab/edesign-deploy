import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { isAdminClaims } from './admin-auth.js';
import * as remote from './remote.js';
import * as telegram from './telegram.js';

const HEARTBEAT_MS = 30_000;
const MAX_PAYLOAD = 8 * 1024 * 1024;
// Aktif oturumu izleyen yönetici kalmazsa kullanıcı ekranı bu süre sonunda paylaşılmaz olur.
const ORPHAN_GRACE_MS = 3 * 60_000;
const CHAT_MAX = 2000;
const HELLO_FIELD_MAX = 500;

let db = null;
/** userId → { info, sockets, view, url, title, connectedAt, lastActiveAt } */
const users = new Map();
const admins = new Set();
/** Aktif oturumlar: sessionId → { userId, watchers: Set<admin ws>, orphanTimer } */
const activeSessions = new Map();

// ---------------------------------------------------------------- gönderim

const sendRaw = (sockets, data, except) => {
    for (const ws of sockets) {
        if (ws !== except && ws.readyState === ws.OPEN) ws.send(data);
    }
};
const send = (ws, msg) => sendRaw([ws], JSON.stringify(msg));
const fail = (ws, message) => send(ws, { t: 'error', message });

export const notifyUser = (userId, msg) => sendRaw(users.get(userId)?.sockets ?? [], JSON.stringify(msg));
export const notifyAdmins = (msg) => sendRaw(admins, JSON.stringify(msg));

// ---------------------------------------------------------------- presence

const toPresence = (userId, p) => ({
    userId,
    username: p.info.username,
    full_name: p.info.full_name,
    company_name: p.info.company_name,
    view: p.view,
    url: p.url,
    title: p.title,
    connectedAt: p.connectedAt,
    lastActiveAt: p.lastActiveAt,
});

export const isOnline = (userId) => users.has(userId);
export const presenceOf = (userId) => (users.has(userId) ? toPresence(userId, users.get(userId)) : null);
export const presenceList = () => [...users].map(([id, p]) => toPresence(id, p));

const broadcastPresence = () => notifyAdmins({ t: 'presence', users: presenceList() });

/** last_seen_at'i en fazla dakikada bir günceller. */
export const touchLastSeen = (database, userId) => database.run(
    `UPDATE users SET last_seen_at = NOW()
      WHERE id = ? AND (last_seen_at IS NULL OR last_seen_at < NOW() - INTERVAL '1 minute')`,
    [userId]
).catch((e) => console.warn('[realtime] last_seen_at güncellenemedi:', e.message));

// ---------------------------------------------------------------- oturumlar

const adminNameOf = async (adminId) => {
    const admin = adminId ? await db.get('SELECT username, full_name FROM users WHERE id = ?', [adminId]) : null;
    return admin?.full_name || admin?.username || 'Destek';
};

const trackActive = (session) => {
    let entry = activeSessions.get(session.id);
    if (!entry) {
        entry = { userId: session.user_id, watchers: new Set(), orphanTimer: null };
        activeSessions.set(session.id, entry);
    }
    return entry;
};

const addWatcher = (entry, ws) => {
    entry.watchers.add(ws);
    clearTimeout(entry.orphanTimer);
    entry.orphanTimer = null;
};

const scheduleOrphanEnd = (sessionId) => {
    const entry = activeSessions.get(sessionId);
    if (!entry || entry.watchers.size > 0 || entry.orphanTimer) return;
    entry.orphanTimer = setTimeout(() => {
        endSession(sessionId, 'Yönetici bağlantısı kesildi.').catch((e) => console.error('[realtime] oturum kapatılamadı:', e));
    }, ORPHAN_GRACE_MS);
    entry.orphanTimer.unref();
};

const announceStatus = (session, reason) => {
    const msg = { t: 'remote:status', sessionId: session.id, status: session.status, ...(reason && { reason }) };
    notifyUser(session.user_id, msg);
    notifyAdmins(msg);
};

const closeSession = (session, reason) => {
    const entry = activeSessions.get(session.id);
    if (entry) clearTimeout(entry.orphanTimer);
    activeSessions.delete(session.id);
    announceStatus(session, reason);
};

const endSession = async (sessionId, reason) => {
    const session = await remote.transitionSession(db, sessionId, ['requested', 'active'], 'ended');
    if (session) closeSession(session, reason);
    return session;
};

/** Oturum aktifleşti: kullanıcıda kayıt başlar, yöneticilere durum gider. */
const activate = async (session, watcher) => {
    const entry = trackActive(session);
    if (watcher) addWatcher(entry, watcher);
    else for (const ws of admins) if (ws.adminId === session.admin_id) addWatcher(entry, ws);
    scheduleOrphanEnd(session.id);
    notifyUser(session.user_id, { t: 'remote:joined', sessionId: session.id, adminName: await adminNameOf(session.admin_id) });
    notifyAdmins({ t: 'remote:status', sessionId: session.id, status: 'active' });
};

/** REST: kullanıcı online destek istedi. */
export const announceRequest = (session) => {
    notifyAdmins({ t: 'remote:request', session: remote.serializeSession(session) });
};

/** REST: yönetici kullanıcıyı davet etti. */
export const sendInvite = (session, adminName) => {
    notifyUser(session.user_id, { t: 'remote:invite', sessionId: session.id, adminName });
    announceRequest(session);
};

// ---------------------------------------------------------------- mesajlar

const activeEntryFor = (ws, sessionId) => {
    const entry = activeSessions.get(sessionId);
    if (!entry || (ws.role === 'user' && entry.userId !== ws.userId)) return null;
    return entry;
};

const relayChat = (ws, msg) => {
    const entry = activeEntryFor(ws, msg.sessionId);
    if (!entry) return fail(ws, 'Oturum aktif değil.');
    const text = typeof msg.text === 'string' ? msg.text.trim() : '';
    if (!text || text.length > CHAT_MAX) return fail(ws, `Mesaj 1-${CHAT_MAX} karakter olmalı.`);
    const data = JSON.stringify({ t: 'chat', sessionId: msg.sessionId, text, from: ws.role, at: new Date().toISOString() });
    sendRaw(users.get(entry.userId)?.sockets ?? [], data, ws);
    sendRaw(entry.watchers, data, ws);
};

const userHandlers = {
    hello: (ws, msg) => {
        const p = users.get(ws.userId);
        const field = (v) => (typeof v === 'string' ? v.slice(0, HELLO_FIELD_MAX) : null);
        Object.assign(p, { view: field(msg.view), url: field(msg.url), title: field(msg.title), lastActiveAt: new Date().toISOString() });
        touchLastSeen(db, ws.userId);
        broadcastPresence();
    },

    'remote:accept': async (ws, msg) => {
        const session = await remote.getSession(db, msg.sessionId);
        if (session?.user_id !== ws.userId || session.status !== 'requested' || session.initiated_by !== 'admin') {
            return fail(ws, 'Davet bulunamadı ya da süresi doldu.');
        }
        const active = await remote.transitionSession(db, session.id, ['requested'], 'active');
        if (!active) return fail(ws, 'Davet bulunamadı ya da süresi doldu.');
        await activate(active);
        telegram.notify(telegram.formatRemoteAnswer(active, true));
    },

    'remote:decline': async (ws, msg) => {
        const session = await remote.getSession(db, msg.sessionId);
        if (session?.user_id !== ws.userId || session.status !== 'requested' || session.initiated_by !== 'admin') {
            return fail(ws, 'Davet bulunamadı ya da süresi doldu.');
        }
        const declined = await remote.transitionSession(db, session.id, ['requested'], 'declined');
        if (!declined) return;
        closeSession(declined);
        telegram.notify(telegram.formatRemoteAnswer(declined, false));
    },

    'remote:end': async (ws, msg) => {
        const session = await remote.getSession(db, msg.sessionId);
        if (session?.user_id !== ws.userId) return fail(ws, 'Oturum bulunamadı.');
        await endSession(session.id, 'Kullanıcı oturumu sonlandırdı.');
    },

    rr: (ws, msg) => {
        const entry = activeEntryFor(ws, msg.sessionId);
        if (!entry) return fail(ws, 'Oturum aktif değil.');
        if (!Array.isArray(msg.events)) return fail(ws, 'Geçersiz ekran verisi.');
        sendRaw(entry.watchers, JSON.stringify({ t: 'rr', sessionId: msg.sessionId, events: msg.events }));
    },

    chat: relayChat,
};

const adminHandlers = {
    'remote:join': async (ws, msg) => {
        const session = await remote.getSession(db, msg.sessionId);
        if (!session) return fail(ws, 'Oturum bulunamadı.');
        if (session.status === 'active') {
            addWatcher(trackActive(session), ws);
            send(ws, { t: 'remote:status', sessionId: session.id, status: 'active' });
            notifyUser(session.user_id, { t: 'snapshot', sessionId: session.id });
            return;
        }
        if (session.status !== 'requested') return fail(ws, 'Oturum sona ermiş.');
        if (session.initiated_by !== 'user') return fail(ws, 'Kullanıcı daveti henüz onaylamadı.');
        const active = await remote.transitionSession(db, session.id, ['requested'], 'active', ws.adminId);
        if (!active) return fail(ws, 'Oturum sona ermiş.');
        await activate(active, ws);
    },

    'remote:end': async (ws, msg) => {
        if (!(await endSession(msg.sessionId, 'Yönetici oturumu sonlandırdı.'))) fail(ws, 'Oturum zaten kapalı.');
    },

    ctl: (ws, msg) => {
        const entry = activeEntryFor(ws, msg.sessionId);
        if (!entry) return fail(ws, 'Oturum aktif değil.');
        if (typeof msg.action?.type !== 'string') return fail(ws, 'Geçersiz işlem.');
        notifyUser(entry.userId, { t: 'ctl', sessionId: msg.sessionId, action: msg.action });
    },

    snapshot: (ws, msg) => {
        const entry = activeEntryFor(ws, msg.sessionId);
        if (!entry) return fail(ws, 'Oturum aktif değil.');
        notifyUser(entry.userId, { t: 'snapshot', sessionId: msg.sessionId });
    },

    chat: relayChat,
};

const handleMessage = async (ws, data) => {
    let msg;
    try {
        msg = JSON.parse(data.toString());
    } catch {
        return fail(ws, 'Geçersiz mesaj.');
    }
    if (typeof msg?.t !== 'string') return fail(ws, 'Geçersiz mesaj.');
    if (msg.t === 'ping') return send(ws, { t: 'pong' });
    if (msg.t === 'pong') return;
    if ('sessionId' in msg && typeof msg.sessionId !== 'string') return fail(ws, 'Geçersiz oturum.');
    const handler = (ws.role === 'admin' ? adminHandlers : userHandlers)[msg.t];
    if (!handler) return fail(ws, 'Bu işlem için yetkiniz yok.');
    await handler(ws, msg);
};

// ---------------------------------------------------------------- bağlantı

const registerAdmin = async (ws, claims) => {
    const admin = await db.get('SELECT id, username, full_name, role FROM users WHERE id = ?', [claims.id]);
    if (admin?.role !== 'admin') return ws.close(4403, 'forbidden');
    const pending = await remote.listSessions(db, { status: 'requested' });
    if (ws.readyState !== ws.OPEN) return;
    Object.assign(ws, { role: 'admin', adminId: admin.id, adminName: admin.full_name || admin.username });
    admins.add(ws);
    send(ws, { t: 'presence', users: presenceList() });
    for (const session of pending) send(ws, { t: 'remote:request', session: remote.serializeSession(session) });
};

const registerUser = async (ws, claims) => {
    const info = await db.get('SELECT id, username, full_name, company_name FROM users WHERE id = ?', [claims.id]);
    if (!info) return ws.close(4401, 'unauthorized');
    const open = await remote.findOpenSession(db, info.id);
    const adminName = open ? await adminNameOf(open.admin_id) : null;
    if (ws.readyState !== ws.OPEN) return;

    Object.assign(ws, { role: 'user', userId: info.id });
    const now = new Date().toISOString();
    const p = users.get(info.id) ?? { sockets: new Set(), view: null, url: null, title: null, connectedAt: now, lastActiveAt: now };
    p.info = info;
    p.sockets.add(ws);
    users.set(info.id, p);
    touchLastSeen(db, info.id);
    broadcastPresence();

    // Sayfa yenilenince süren oturumun kaydı yeniden başlar; bekleyen davet tekrar gösterilir.
    if (open?.status === 'active') send(ws, { t: 'remote:joined', sessionId: open.id, adminName });
    else if (open?.initiated_by === 'admin') send(ws, { t: 'remote:invite', sessionId: open.id, adminName });
};

const onClose = (ws) => {
    if (ws.role === 'admin') {
        admins.delete(ws);
        for (const [sessionId, entry] of activeSessions) {
            if (entry.watchers.delete(ws)) scheduleOrphanEnd(sessionId);
        }
    } else if (ws.role === 'user') {
        const p = users.get(ws.userId);
        p?.sockets.delete(ws);
        if (p && p.sockets.size === 0) {
            users.delete(ws.userId);
            broadcastPresence();
        }
    }
};

const onConnection = (ws, req, secret) => {
    ws.alive = true;
    ws.on('pong', () => { ws.alive = true; });
    ws.on('error', (e) => console.warn('[realtime] soket hatası:', e.message));
    ws.on('close', () => onClose(ws));

    let claims;
    try {
        claims = jwt.verify(new URL(req.url, 'http://localhost').searchParams.get('token') || '', secret);
    } catch {
        return ws.close(4401, 'unauthorized');
    }

    // Mesajlar sırayla işlenir (rr olaylarının sırası korunur); kimlik doğrulama bitene kadar bekler.
    let queue = (isAdminClaims(claims) ? registerAdmin(ws, claims) : registerUser(ws, claims));
    queue = queue.catch((e) => {
        console.error('[realtime] bağlantı kurulamadı:', e);
        ws.close(1011, 'server error');
    });
    ws.on('message', (data) => {
        queue = queue
            .then(() => ws.role && handleMessage(ws, data))
            .catch((e) => {
                console.error('[realtime] mesaj işlenemedi:', e);
                fail(ws, 'Sunucu hatası.');
            });
    });
};

const expireStaleRequests = async () => {
    for (const row of await remote.expireStaleRequests(db)) {
        announceStatus({ id: row.id, user_id: row.user_id, status: 'ended' }, 'İstek zaman aşımına uğradı.');
    }
};

export const attachRealtime = async (server, { db: database, secret }) => {
    db = database;
    const wss = new WebSocketServer({ server, path: '/ws', maxPayload: MAX_PAYLOAD });
    wss.on('connection', (ws, req) => onConnection(ws, req, secret));

    // Yeniden başlatma sonrası aktif oturumlar izleyici bekler; gelmezse kapanır.
    for (const session of await remote.listSessions(db, { status: 'active', limit: 500 })) {
        trackActive(session);
        scheduleOrphanEnd(session.id);
    }

    const heartbeat = setInterval(() => {
        for (const ws of wss.clients) {
            if (!ws.alive) {
                ws.terminate();
                continue;
            }
            ws.alive = false;
            ws.ping();
        }
        expireStaleRequests().catch((e) => console.error('[realtime] eski istekler kapatılamadı:', e.message));
    }, HEARTBEAT_MS);
    wss.on('close', () => clearInterval(heartbeat));
    return wss;
};
