import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { record, EventType, type eventWithTime } from 'rrweb';
import type { RemoteSession } from '../../admin/contracts';
import { api } from '../../api';
import { getUserRealtime, type Realtime, type RealtimeStatus, type WsOf } from '../realtime';
import { applyRemoteAction, isProtected } from './applyAction';
import { CobrowseOverlay } from './CobrowseOverlay';

export type CobrowsePhase = 'idle' | 'waiting' | 'invite' | 'connecting' | 'active';

export interface CobrowseChatMessage {
    id: string;
    from: 'user' | 'admin';
    text: string;
    at: string;
    pending?: boolean;
}

export interface CobrowseState {
    /** idle: yok · waiting: kullanıcı istedi, destek bekleniyor · invite: onay soruluyor · connecting: onaylandı, yönetici bağlanıyor · active: ekran paylaşılıyor */
    phase: CobrowsePhase;
    sessionId: string | null;
    adminName: string | null;
    chat: CobrowseChatMessage[];
    unread: number;
    connection: RealtimeStatus;
    /** Kısa süreli bilgi mesajı (ör. "Oturum sona erdi"). */
    notice: string | null;
}

export interface CobrowseController {
    getState(): CobrowseState;
    subscribe(cb: () => void): () => void;
    accept(): void;
    decline(): void;
    end(): void;
    cancelWaiting(): void;
    sendChat(text: string): void;
    setChatOpen(open: boolean): void;
    dismissNotice(): void;
}

/** Kayıttan tamamen hariç tutulan arayüz kökü işareti (banner, imleç, onay penceresi). */
export const COBROWSE_UI_ATTR = 'data-cobrowse-ui';

const CONSENT_KEY = 'cobrowse_consented';
const FLUSH_MS = 150;
const MAX_BUFFERED = 8 * 1024 * 1024;
const RESUME_BUFFERED = 1024 * 1024;

const initialState = (): CobrowseState => ({
    phase: 'idle', sessionId: null, adminName: null, chat: [], unread: 0,
    connection: 'closed', notice: null,
});

let state: CobrowseState = initialState();
const listeners = new Set<() => void>();
let chatOpen = false;
let noticeTimer: ReturnType<typeof setTimeout> | null = null;

const setState = (patch: Partial<CobrowseState>) => {
    state = { ...state, ...patch };
    for (const l of [...listeners]) l();
};

const notify = (notice: string) => {
    setState({ notice });
    if (noticeTimer) clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => setState({ notice: null }), 6000);
};

// --- onay kaydı (sayfa yenilenince sunucunun yeniden gönderdiği remote:joined için) ---

const readConsented = (): string[] => {
    try {
        const v = JSON.parse(sessionStorage.getItem(CONSENT_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    } catch { return []; }
};
const markConsented = (id: string) => {
    try {
        sessionStorage.setItem(CONSENT_KEY, JSON.stringify([id, ...readConsented().filter((x) => x !== id)].slice(0, 5)));
    } catch { /* yok say */ }
};
const isConsented = (id: string) => readConsented().includes(id);

// --- kayıt (rrweb) ---

let rt: Realtime | null = null;
let stopRecord: (() => void) | null = null;
let buffer: eventWithTime[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let resyncTimer: ReturnType<typeof setInterval> | null = null;
let needResync = false;
let lastSnapshotAt = 0;
let pendingJoined: WsOf<'remote:joined'> | null = null;

const maskInput = (text: string, el: HTMLElement) =>
    isProtected(el) ? '*'.repeat(Math.min(text.length, 12)) : text;

function flush() {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    if (!buffer.length) return;
    const events = buffer;
    buffer = [];
    const sessionId = state.sessionId;
    if (state.phase !== 'active' || !sessionId || !rt) return;
    if (rt.status !== 'open' || rt.bufferedAmount > MAX_BUFFERED) {
        needResync = true;
        return;
    }
    if (!rt.send({ t: 'rr', sessionId, events })) needResync = true;
}

function emit(e: eventWithTime) {
    if (e.type === EventType.Meta) flush();
    buffer.push(e);
    if (e.type === EventType.FullSnapshot) {
        lastSnapshotAt = Date.now();
        needResync = false;
        flush();
    } else if (!flushTimer) {
        flushTimer = setTimeout(flush, FLUSH_MS);
    }
}

function takeSnapshot(force = false) {
    if (!stopRecord) return;
    if (!force && Date.now() - lastSnapshotAt < 1000) return;
    try { record.takeFullSnapshot(true); } catch (e) { console.warn('[cobrowse] anlık görüntü alınamadı', e); }
}

function startRecording() {
    if (stopRecord) { takeSnapshot(); return; }
    lastSnapshotAt = 0;
    needResync = false;
    stopRecord = record({
        emit,
        checkoutEveryNms: 60_000,
        blockClass: 'rr-block',
        blockSelector: `[${COBROWSE_UI_ATTR}]`,
        maskTextClass: 'rr-mask',
        maskTextSelector: '[data-private]',
        // Metin alanları maskInputFn'den geçer; o da yalnızca parola ve gizli işaretli alanları maskeler.
        maskInputOptions: { password: true, text: true, email: true, search: true, tel: true, url: true, number: true, textarea: true },
        maskInputFn: maskInput,
        recordCanvas: false,
        inlineStylesheet: true,
        sampling: { mousemove: 50, scroll: 150, input: 'last' },
    }) ?? null;
    if (resyncTimer) clearInterval(resyncTimer);
    resyncTimer = setInterval(() => {
        if (needResync && rt?.status === 'open' && rt.bufferedAmount < RESUME_BUFFERED) takeSnapshot(true);
    }, 1000);
}

function stopRecording() {
    if (stopRecord) {
        try { stopRecord(); } catch { /* yok say */ }
        stopRecord = null;
    }
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    if (resyncTimer) { clearInterval(resyncTimer); resyncTimer = null; }
    buffer = [];
    needResync = false;
    hidePointer();
}

// --- uzak imleç ---

let host: HTMLDivElement | null = null;
let reactRoot: Root | null = null;
let cursorEl: HTMLDivElement | null = null;
let cursorTimer: ReturnType<typeof setTimeout> | null = null;

function ensureCursor() {
    if (cursorEl || !host) return cursorEl;
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:2147483646;opacity:0;'
        + 'transition:transform 120ms linear, opacity 200ms ease;will-change:transform;';
    el.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))">'
        + '<path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="#ef4444" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>'
        + '<span style="position:absolute;left:18px;top:16px;background:#ef4444;color:#fff;font:600 11px/1 system-ui,sans-serif;'
        + 'padding:3px 6px;border-radius:6px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.3)">Destek</span>';
    host.appendChild(el);
    cursorEl = el;
    return el;
}

function showPointer(x: number, y: number) {
    const el = ensureCursor();
    if (!el) return;
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    el.style.opacity = '1';
    if (cursorTimer) clearTimeout(cursorTimer);
    cursorTimer = setTimeout(hidePointer, 3000);
}

function hidePointer() {
    if (cursorTimer) { clearTimeout(cursorTimer); cursorTimer = null; }
    if (cursorEl) cursorEl.style.opacity = '0';
}

// --- oturum akışı ---

function begin(m: WsOf<'remote:joined'>) {
    pendingJoined = null;
    const same = state.sessionId === m.sessionId;
    setState({
        phase: 'active', sessionId: m.sessionId, adminName: m.adminName || 'Destek',
        chat: same ? state.chat : [], unread: same ? state.unread : 0,
    });
    startRecording();
}

function finish(notice?: string) {
    stopRecording();
    pendingJoined = null;
    setState({ phase: 'idle', sessionId: null, adminName: null, chat: [], unread: 0 });
    if (notice) notify(notice);
}

const isMine = (sessionId: string) => !!state.sessionId && state.sessionId === sessionId;

const handlers = {
    invite(m: WsOf<'remote:invite'>) {
        if (state.phase === 'active' && !isMine(m.sessionId)) return;
        if (isMine(m.sessionId) && (state.phase === 'active' || state.phase === 'connecting')) return;
        if (state.phase === 'waiting' && isMine(m.sessionId)) {
            // Kullanıcı bu oturumu kendisi istedi; onay zaten verildi.
            rt?.send({ t: 'remote:accept', sessionId: m.sessionId });
            setState({ phase: 'connecting', adminName: m.adminName });
            return;
        }
        setState({ phase: 'invite', sessionId: m.sessionId, adminName: m.adminName, chat: [], unread: 0 });
    },
    joined(m: WsOf<'remote:joined'>) {
        if (state.phase === 'active' && isMine(m.sessionId)) {
            setState({ adminName: m.adminName || state.adminName });
            takeSnapshot();
            return;
        }
        if (state.phase === 'active') return;
        if (isConsented(m.sessionId)) {
            begin(m);
            return;
        }
        // Bu sekmede onay verilmemiş oturum: kayda başlamadan önce sor.
        pendingJoined = m;
        setState({ phase: 'invite', sessionId: m.sessionId, adminName: m.adminName, chat: [], unread: 0 });
    },
    status(m: WsOf<'remote:status'>) {
        if (!isMine(m.sessionId)) return;
        if (m.status === 'ended') finish('Canlı destek oturumu sona erdi.');
        else if (m.status === 'declined') finish(state.phase === 'waiting' ? 'Destek isteği kapatıldı.' : undefined);
    },
    end(m: WsOf<'remote:end'>) {
        if (isMine(m.sessionId)) finish('Canlı destek oturumu sona erdi.');
    },
    ctl(m: WsOf<'ctl'>) {
        if (state.phase !== 'active' || !isMine(m.sessionId)) return;
        try {
            applyRemoteAction(m.action, { getNode: (id) => record.mirror.getNode(id), showPointer });
        } catch (e) {
            console.warn('[cobrowse] işlem uygulanamadı', m.action.type, e);
        }
    },
    snapshot(m: WsOf<'snapshot'>) {
        if (state.phase === 'active' && isMine(m.sessionId)) takeSnapshot(true);
    },
    chat(m: WsOf<'chat'>) {
        if (!isMine(m.sessionId) || state.phase === 'idle') return;
        const from = m.from ?? 'admin';
        const at = m.at ?? new Date().toISOString();
        if (from === 'user') {
            const i = state.chat.findIndex((c) => c.pending && c.text === m.text);
            if (i >= 0) {
                const chat = state.chat.slice();
                chat[i] = { ...chat[i], pending: false, at };
                setState({ chat });
                return;
            }
        }
        setState({
            chat: [...state.chat, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, from, text: m.text, at }].slice(-200),
            unread: from === 'admin' && !chatOpen ? state.unread + 1 : state.unread,
        });
    },
};

const controller: CobrowseController = {
    getState: () => state,
    subscribe(cb) {
        listeners.add(cb);
        return () => { listeners.delete(cb); };
    },
    accept() {
        const id = state.sessionId;
        if (!id || state.phase !== 'invite') return;
        markConsented(id);
        rt?.send({ t: 'remote:accept', sessionId: id });
        if (pendingJoined && pendingJoined.sessionId === id) begin(pendingJoined);
        else setState({ phase: 'connecting' });
    },
    decline() {
        const id = state.sessionId;
        if (id) rt?.send({ t: 'remote:decline', sessionId: id });
        finish();
    },
    end() {
        const id = state.sessionId;
        if (id) rt?.send({ t: 'remote:end', sessionId: id });
        finish('Canlı destek bağlantısını bitirdiniz.');
    },
    cancelWaiting() {
        const id = state.sessionId;
        if (id) rt?.send({ t: 'remote:end', sessionId: id });
        finish();
    },
    sendChat(text) {
        const body = text.trim();
        const id = state.sessionId;
        if (!body || !id || !rt) return;
        rt.send({ t: 'chat', sessionId: id, text: body });
        setState({
            chat: [...state.chat, { id: `local-${Date.now()}`, from: 'user' as const, text: body, at: new Date().toISOString(), pending: true }].slice(-200),
        });
    },
    setChatOpen(open) {
        chatOpen = open;
        if (open && state.unread) setState({ unread: 0 });
    },
    dismissNotice() {
        if (noticeTimer) { clearTimeout(noticeTimer); noticeTimer = null; }
        setState({ notice: null });
    },
};

/** Testler ve diğer modüller için (ör. destek penceresinde durum göstermek). */
export const cobrowseController: CobrowseController = controller;

let unsubs: (() => void)[] = [];

function attach() {
    const r = getUserRealtime();
    if (rt === r && unsubs.length) return;
    detach();
    rt = r;
    unsubs = [
        r.on('remote:invite', handlers.invite),
        r.on('remote:joined', handlers.joined),
        r.on('remote:status', handlers.status),
        r.on('remote:end', handlers.end),
        r.on('ctl', handlers.ctl),
        r.on('snapshot', handlers.snapshot),
        r.on('chat', handlers.chat),
        r.onStatus((s) => {
            setState({ connection: s });
            if (s === 'closed' && r.stopped) finish();
            else if (s === 'open' && stopRecord) needResync = true;
        }),
    ];
    setState({ connection: r.status });
}

function detach() {
    for (const u of unsubs) u();
    unsubs = [];
    rt = null;
}

/** Onay penceresi / banner / imleç arayüzünü kurar ve kullanıcı WS bağlantısını dinler. Tekrar çağrılabilir (girişten sonra bağlantıyı yeniden başlatır). */
export function mountCobrowseClient() {
    attach();
    if (host) return;
    host = document.createElement('div');
    host.id = 'cobrowse-root';
    host.setAttribute(COBROWSE_UI_ATTR, '');
    host.className = 'rr-block';
    host.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;overflow:visible;z-index:2147483000;';
    const reactHost = document.createElement('div');
    host.appendChild(reactHost);
    document.body.appendChild(host);
    reactRoot = createRoot(reactHost);
    reactRoot.render(createElement(CobrowseOverlay, { controller }));
}

/** Arayüzü kaldırır; etkin oturum varsa kaydı durdurur (sunucuya bitiş gönderilmez). */
export function unmountCobrowseClient() {
    stopRecording();
    detach();
    reactRoot?.unmount();
    reactRoot = null;
    host?.remove();
    host = null;
    cursorEl = null;
    state = initialState();
}

/**
 * Kullanıcı onayıyla online destek isteği açar (onay metnini çağıran gösterir).
 * Yönetici bağlanınca kayıt otomatik başlar; o zamana dek "Destek ekibi bekleniyor…" göstergesi çıkar.
 */
export async function requestOnlineSupport(note?: string, ticketId?: number): Promise<RemoteSession> {
    mountCobrowseClient();
    const session = await api.request('/support/remote', {
        method: 'POST',
        body: JSON.stringify({ ...(note ? { note } : {}), ...(ticketId != null ? { ticketId } : {}) }),
    }) as RemoteSession;
    if (!session || typeof session.id !== 'string') throw new Error('Online destek isteği oluşturulamadı.');
    markConsented(session.id);
    if (state.phase !== 'active') {
        setState({ phase: session.status === 'active' ? 'connecting' : 'waiting', sessionId: session.id, adminName: null, chat: [], unread: 0 });
    }
    return session;
}
