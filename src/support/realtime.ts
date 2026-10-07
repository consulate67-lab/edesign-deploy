import type { WsMessage } from '../admin/contracts';
import { api, wsUrl } from '../api';

export type RealtimeStatus = 'connecting' | 'open' | 'closed';
export type WsType = WsMessage['t'];
export type WsOf<T extends WsType> = Extract<WsMessage, { t: T }>;

export interface RealtimeOptions {
    /** Test / özel sunucu için adres; verilmezse wsUrl(token) kullanılır. */
    url?: string | ((token: string) => string);
    /** Bağlantı her açıldığında, kuyruk boşaltılmadan önce çağrılır (ör. hello göndermek için). */
    onOpen?: (rt: Realtime) => void;
    /** Bağlantı yokken bekletilecek en fazla mesaj (rr/ping/pong hiç bekletilmez). */
    maxQueue?: number;
    minDelayMs?: number;
    maxDelayMs?: number;
}

export interface Realtime {
    /** Açıksa hemen gönderir, değilse kuyruğa alır. rr/ping/pong bağlantı yokken atılır; false döner. */
    send(msg: WsMessage): boolean;
    on<T extends WsType>(type: T, handler: (msg: WsOf<T>) => void): () => void;
    onAny(handler: (msg: WsMessage) => void): () => void;
    readonly status: RealtimeStatus;
    onStatus(cb: (status: RealtimeStatus) => void): () => void;
    /** Soketin gönderim tamponunda bekleyen bayt (ağ yavaşsa rr akışını kısmak için). */
    readonly bufferedAmount: number;
    /** close() ile durdurulduysa true; reconnect() ile yeniden başlar. */
    readonly stopped: boolean;
    /** Bağlantıyı (gerekirse) hemen yeniden kurar; durdurulmuşsa yeniden başlatır. */
    reconnect(): void;
    /** Bağlantıyı kapatır, yeniden bağlanmayı durdurur; kuyruk temizlenir. Dinleyiciler korunur. */
    close(): void;
}

const NEVER_QUEUE = new Set<WsType>(['rr', 'ping', 'pong']);
const STICKY_MS = 60_000;

const buildUrl = (url: RealtimeOptions['url'], token: string) =>
    typeof url === 'function' ? url(token)
        : url ? `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
            : wsUrl(token);

export function createRealtime(getToken: () => string | null, opts: RealtimeOptions = {}): Realtime {
    const maxQueue = opts.maxQueue ?? 200;
    const minDelay = opts.minDelayMs ?? 1000;
    const maxDelay = opts.maxDelayMs ?? 30_000;

    let ws: WebSocket | null = null;
    let status: RealtimeStatus = 'closed';
    let stopped = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const queue: WsMessage[] = [];
    const typed = new Map<WsType, Set<(msg: WsMessage) => void>>();
    const any = new Set<(msg: WsMessage) => void>();
    const statusCbs = new Set<(s: RealtimeStatus) => void>();

    const setStatus = (s: RealtimeStatus) => {
        if (s === status) return;
        status = s;
        for (const cb of [...statusCbs]) {
            try { cb(s); } catch (e) { console.error('[realtime] status handler', e); }
        }
    };

    // Sunucu bağlanır bağlanmaz etkin oturumu / bekleyen daveti bildirir; dinleyiciler (ör. tembel yüklenen
    // ortak ekran istemcisi) o an henüz kayıtlı olmayabilir. Son mesaj kısa süre saklanıp sonradan
    // abone olanlara da iletilir; oturum bitince silinir.
    const sticky = new Map<WsType, { msg: WsMessage; at: number }>();
    const remember = (msg: WsMessage) => {
        if (msg.t === 'remote:joined' || msg.t === 'remote:invite') sticky.set(msg.t, { msg, at: Date.now() });
        const ended = msg.t === 'remote:end' || (msg.t === 'remote:status' && (msg.status === 'ended' || msg.status === 'declined'));
        if (!ended) return;
        for (const [t, s] of sticky) {
            if ('sessionId' in s.msg && s.msg.sessionId === msg.sessionId) sticky.delete(t);
        }
    };

    const dispatch = (msg: WsMessage) => {
        remember(msg);
        for (const h of [...(typed.get(msg.t) ?? [])]) {
            try { h(msg); } catch (e) { console.error(`[realtime] ${msg.t} handler`, e); }
        }
        for (const h of [...any]) {
            try { h(msg); } catch (e) { console.error('[realtime] handler', e); }
        }
    };

    const clearTimer = () => {
        if (timer) { clearTimeout(timer); timer = null; }
    };

    const scheduleReconnect = (slow = false) => {
        if (stopped) return;
        clearTimer();
        const base = Math.min(maxDelay, minDelay * 2 ** Math.min(attempt, 10));
        const delay = (slow ? maxDelay : base) * (0.8 + Math.random() * 0.4);
        attempt++;
        timer = setTimeout(connect, delay);
    };

    const rawSend = (msg: WsMessage) => {
        try {
            ws!.send(JSON.stringify(msg));
            return true;
        } catch (e) {
            console.warn('[realtime] gönderilemedi', e);
            return false;
        }
    };

    function connect() {
        clearTimer();
        if (stopped) return;
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
        const token = getToken();
        if (!token) {
            setStatus('closed');
            scheduleReconnect();
            return;
        }
        let url: string;
        try {
            url = buildUrl(opts.url, token);
        } catch (e) {
            console.warn('[realtime] adres oluşturulamadı', e);
            setStatus('closed');
            scheduleReconnect(true);
            return;
        }
        setStatus('connecting');
        const sock = new WebSocket(url);
        ws = sock;
        sock.onopen = () => {
            if (ws !== sock) return;
            attempt = 0;
            setStatus('open');
            try { opts.onOpen?.(api_); } catch (e) { console.error('[realtime] onOpen', e); }
            while (queue.length && ws === sock && sock.readyState === WebSocket.OPEN) rawSend(queue.shift()!);
        };
        sock.onmessage = (ev) => {
            if (ws !== sock || typeof ev.data !== 'string') return;
            let msg: WsMessage;
            try {
                msg = JSON.parse(ev.data);
            } catch {
                return;
            }
            if (!msg || typeof msg !== 'object' || typeof (msg as { t?: unknown }).t !== 'string') return;
            if (msg.t === 'ping') rawSend({ t: 'pong' });
            dispatch(msg);
        };
        sock.onerror = () => { /* onclose ardından gelir */ };
        sock.onclose = (ev) => {
            if (ws !== sock) return;
            ws = null;
            setStatus('closed');
            // 1008 / 4401 / 4403: yetki sorunu; sunucuyu sık zorlamamak için yavaş dene.
            scheduleReconnect(ev.code === 1008 || ev.code === 4401 || ev.code === 4403);
        };
    }

    const api_: Realtime = {
        send(msg) {
            if (ws && ws.readyState === WebSocket.OPEN) return rawSend(msg);
            if (NEVER_QUEUE.has(msg.t) || stopped) return false;
            queue.push(msg);
            if (queue.length > maxQueue) queue.splice(0, queue.length - maxQueue);
            return true;
        },
        on(type, handler) {
            let set = typed.get(type);
            if (!set) { set = new Set(); typed.set(type, set); }
            const h = handler as (msg: WsMessage) => void;
            set.add(h);
            const held = sticky.get(type);
            if (held && Date.now() - held.at < STICKY_MS) {
                setTimeout(() => {
                    if (!set!.has(h) || sticky.get(type) !== held) return;
                    try { h(held.msg); } catch (e) { console.error(`[realtime] ${type} handler`, e); }
                }, 0);
            }
            return () => { set!.delete(h); };
        },
        onAny(handler) {
            any.add(handler);
            return () => { any.delete(handler); };
        },
        get status() { return status; },
        onStatus(cb) {
            statusCbs.add(cb);
            return () => { statusCbs.delete(cb); };
        },
        get bufferedAmount() { return ws?.bufferedAmount ?? 0; },
        get stopped() { return stopped; },
        reconnect() {
            stopped = false;
            attempt = 0;
            if (ws && ws.readyState === WebSocket.OPEN) return;
            if (ws && ws.readyState === WebSocket.CONNECTING) return;
            connect();
        },
        close() {
            stopped = true;
            clearTimer();
            queue.length = 0;
            const sock = ws;
            ws = null;
            if (sock) {
                sock.onopen = sock.onmessage = sock.onclose = sock.onerror = null;
                try { sock.close(1000, 'client close'); } catch { /* yok say */ }
            }
            setStatus('closed');
        },
    };

    connect();
    return api_;
}

// ---------------------------------------------------------------------------
// Kullanıcı tarafı tekil bağlantı

let userRt: Realtime | null = null;
let userOpts: RealtimeOptions = {};
let lastView: string | null = null;

const readView = () => {
    try { return sessionStorage.getItem('app_view'); } catch { return null; }
};

/** Kullanıcı bağlantısının ayarı (ör. testte url). Bağlantı açıksa yeni ayarla yeniden kurulur; dinleyiciler korunur. */
export function configureUserRealtime(opts: Pick<RealtimeOptions, 'url' | 'onOpen'>) {
    userOpts = opts;
    if (userRt && !userRt.stopped) {
        userRt.close();
        userRt.reconnect();
    }
}

const sendHello = (rt: Realtime) => {
    rt.send({ t: 'hello', view: lastView ?? readView(), url: location.href, title: document.title });
};

/** Kullanıcı oturum token'ıyla tekil WS bağlantısı (gerekirse bağlanır; çıkıştan sonra yeniden başlatır). */
export function getUserRealtime(): Realtime {
    if (!userRt) {
        userRt = createRealtime(() => api.getToken(), {
            url: (token) => buildUrl(userOpts.url, token),
            onOpen: (rt) => {
                sendHello(rt);
                userOpts.onOpen?.(rt);
            },
        });
    } else if (userRt.stopped) {
        userRt.reconnect();
    }
    return userRt;
}

/** Ekran değişince çağrılır; bağlantı açıksa sunucuya hello gönderir (açılınca zaten gönderilir). */
export function reportView(view?: string) {
    if (view !== undefined) lastView = view;
    else lastView = null;
    if (userRt && userRt.status === 'open') sendHello(userRt);
}

/** Çıkışta: bağlantıyı kapatır (dinleyiciler korunur, sonraki getUserRealtime() yeniden bağlar). */
export function disconnectUserRealtime() {
    userRt?.close();
}
