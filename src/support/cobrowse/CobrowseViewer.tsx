import 'rrweb/dist/style.css';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ClipboardEvent as ReactClipboardEvent, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { Replayer, EventType, type eventWithTime } from 'rrweb';
import type { RemoteAction, RemoteSession } from '../../admin/contracts';
import type { Realtime } from '../realtime';

export interface CobrowseViewerProps {
    /** Yönetici token'ıyla kurulmuş bağlantı (createRealtime(() => sessionStorage.getItem('admin_token'))). */
    realtime: Realtime;
    session: RemoteSession;
    adminName?: string;
    onClose(): void;
}

type ViewerStatus = 'connecting' | 'waiting_user' | 'connected' | 'ended';

interface ChatItem { id: string; from: 'user' | 'admin'; text: string; at: string; pending?: boolean }

interface Target {
    id: number;
    kind: 'text' | 'select';
    locked: boolean;
    options?: { value: string; label: string; selected: boolean }[];
    /** Seçim listesi için sahne içindeki konum (ölçekli px). */
    left: number;
    top: number;
}

const LIVE_BUFFER_MS = 200;
const POINTER_MS = 50;
const WHEEL_MS = 60;
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const SPECIAL_KEYS = new Set(['Enter', 'Escape', 'Tab', 'Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown']);
const TEXT_TYPES = new Set(['', 'text', 'search', 'email', 'url', 'tel', 'number']);

const STATUS_LABEL: Record<ViewerStatus, string> = {
    connecting: 'Bağlanıyor',
    waiting_user: 'Kullanıcı onayı bekleniyor',
    connected: 'Bağlı',
    ended: 'Sona erdi',
};
const STATUS_COLOR: Record<ViewerStatus, string> = {
    connecting: '#f59e0b', waiting_user: '#3b82f6', connected: '#16a34a', ended: '#6b7280',
};

const btn = (bg: string, color = '#fff', disabled = false): CSSProperties => ({
    border: 'none', borderRadius: 8, padding: '6px 12px', background: bg, color, cursor: disabled ? 'not-allowed' : 'pointer',
    font: `600 12px/1.2 ${FONT}`, whiteSpace: 'nowrap', opacity: disabled ? 0.5 : 1,
});

const isLockedField = (el: Element) => {
    if (el.tagName === 'INPUT') {
        const type = ((el as HTMLInputElement).type || '').toLowerCase();
        if (type === 'password' || type === 'file' || el.hasAttribute('data-rr-is-password')) return true;
    }
    return !!el.closest('[data-private], .rr-mask');
};

const isScrollable = (el: Element) => {
    const win = el.ownerDocument.defaultView;
    if (!win) return false;
    const st = win.getComputedStyle(el);
    const y = /(auto|scroll|overlay)/.test(st.overflowY) && el.scrollHeight > el.clientHeight + 1;
    const x = /(auto|scroll|overlay)/.test(st.overflowX) && el.scrollWidth > el.clientWidth + 1;
    return x || y;
};

const timeOf = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

const userLabel = (s: RemoteSession) =>
    s.user?.full_name || s.user?.username || `Kullanıcı #${s.user_id}`;

export function CobrowseViewer({ realtime, session, adminName, onClose }: CobrowseViewerProps) {
    const sessionId = session.id;
    const [status, setStatus] = useState<ViewerStatus>(() =>
        session.status === 'ended' || session.status === 'declined' ? 'ended'
            : session.status === 'requested' && session.initiated_by === 'admin' ? 'waiting_user' : 'connecting');
    const [endReason, setEndReason] = useState<string | null>(session.status === 'declined' ? 'Kullanıcı isteği reddetti.' : null);
    const subscribeConn = useCallback((cb: () => void) => realtime.onStatus(cb), [realtime]);
    const getConn = useCallback(() => realtime.status, [realtime]);
    const conn = useSyncExternalStore(subscribeConn, getConn, getConn);
    const [control, setControl] = useState(false);
    const [chat, setChat] = useState<ChatItem[]>([]);
    const [draft, setDraft] = useState('');
    const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);
    const [box, setBox] = useState({ width: 0, height: 0 });
    const [stats, setStats] = useState<{ eps: number; age: number | null }>({ eps: 0, age: null });
    const [hasSnapshot, setHasSnapshot] = useState(false);
    const [target, setTarget] = useState<Target | null>(null);
    const [textValue, setTextValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const stageRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const chatListRef = useRef<HTMLDivElement>(null);
    const replayerRef = useRef<Replayer | null>(null);
    // Üst bileşen güncel oturum nesnesi verse de canlı oynatıcı yeniden kurulmasın diye ilk hâl.
    const initialSessionRef = useRef({ status: session.status, initiatedBy: session.initiated_by });
    const scaleRef = useRef(1);
    const endedRef = useRef(status === 'ended');
    const lastPointerRef = useRef(0);
    const wheelRef = useRef<{ id?: number; key: string; dx: number; dy: number; timer: ReturnType<typeof setTimeout> | null; last: { key: string; x: number; y: number; at: number } | null }>({ key: '', dx: 0, dy: 0, timer: null, last: null });

    const scale = viewport && box.width > 0 && box.height > 0
        ? Math.min(box.width / viewport.width, box.height / viewport.height, 1)
        : 1;

    useEffect(() => { scaleRef.current = scale; }, [scale]);
    useEffect(() => { endedRef.current = status === 'ended'; }, [status]);

    const sendCtl = (action: RemoteAction) => {
        if (endedRef.current) return;
        realtime.send({ t: 'ctl', sessionId, action });
    };

    // --- bağlantı, oturum ve canlı oynatıcı ---
    useEffect(() => {
        const initial = initialSessionRef.current;
        let disposed = false;
        let joined = false;
        let ended = initial.status === 'ended' || initial.status === 'declined';
        let gotSnapshot = false;
        let openedOnce = realtime.status === 'open';
        let replayer: Replayer | null = null;
        let snapTimer: ReturnType<typeof setTimeout> | null = null;
        let lastArrival = 0;
        const arrivals: { at: number; n: number }[] = [];

        const scheduleSnapshotCheck = () => {
            if (snapTimer) clearTimeout(snapTimer);
            const check = () => {
                if (disposed || ended || gotSnapshot) return;
                realtime.send({ t: 'snapshot', sessionId });
                snapTimer = setTimeout(check, 4000);
            };
            snapTimer = setTimeout(check, 2000);
        };

        const join = () => {
            if (ended) return;
            joined = true;
            realtime.send({ t: 'remote:join', sessionId });
            scheduleSnapshotCheck();
        };

        const markEnded = (reason: string | null) => {
            ended = true;
            if (snapTimer) clearTimeout(snapTimer);
            setStatus('ended');
            setEndReason(reason);
            setControl(false);
        };

        const ensureReplayer = (first: eventWithTime) => {
            const root = rootRef.current;
            if (!root) return null;
            const r = new Replayer([], {
                root,
                liveMode: true,
                mouseTail: false,
                UNSAFE_replayCanvas: false,
                useVirtualDom: false,
                showWarning: false,
                triggerFocus: false,
                pauseAnimation: false,
                insertStyleRules: [
                    '.rr-block { background: transparent !important; }',
                    '[data-cobrowse-ui] { display: none !important; }',
                ],
            });
            r.on('resize', (d) => {
                const dim = d as { width: number; height: number };
                if (dim?.width && dim?.height) setViewport({ width: dim.width, height: dim.height });
            });
            r.startLive(first.timestamp - LIVE_BUFFER_MS);
            replayerRef.current = r;
            return r;
        };

        const unsubs = [
            realtime.on('rr', (m) => {
                if (m.sessionId !== sessionId || disposed || !Array.isArray(m.events)) return;
                let n = 0;
                for (const raw of m.events) {
                    const e = raw as eventWithTime;
                    if (!e || typeof e !== 'object' || typeof e.type !== 'number' || typeof e.timestamp !== 'number') continue;
                    if (e.type === EventType.Meta) {
                        if (!replayer) replayer = ensureReplayer(e);
                        setViewport({ width: e.data.width, height: e.data.height });
                    } else if (e.type === EventType.FullSnapshot) {
                        if (!gotSnapshot) { gotSnapshot = true; setHasSnapshot(true); }
                    } else if (!gotSnapshot) {
                        continue;
                    }
                    if (!replayer) continue;
                    try { replayer.addEvent(e); n++; } catch (err) { console.warn('[cobrowse] olay oynatılamadı', err); }
                }
                const now = Date.now();
                lastArrival = now;
                arrivals.push({ at: now, n });
                if (!ended) setStatus('connected');
            }),
            realtime.on('remote:status', (m) => {
                if (m.sessionId !== sessionId) return;
                if (m.status === 'active') {
                    if (!joined) join();
                    setStatus((s) => (s === 'connected' || s === 'ended' ? s : 'connecting'));
                } else if (m.status === 'requested') {
                    if (initial.initiatedBy === 'admin') setStatus('waiting_user');
                } else if (m.status === 'declined') {
                    markEnded(m.reason || 'Kullanıcı isteği reddetti.');
                } else if (m.status === 'ended') {
                    markEnded(m.reason || null);
                }
            }),
            realtime.on('remote:end', (m) => {
                if (m.sessionId === sessionId) markEnded(null);
            }),
            realtime.on('chat', (m) => {
                if (m.sessionId !== sessionId) return;
                const from = m.from ?? 'user';
                const at = m.at ?? new Date().toISOString();
                setChat((list) => {
                    if (from === 'admin') {
                        const i = list.findIndex((c) => c.pending && c.text === m.text);
                        if (i >= 0) {
                            const next = list.slice();
                            next[i] = { ...next[i], pending: false, at };
                            return next;
                        }
                    }
                    return [...list, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, from, text: m.text, at }].slice(-300);
                });
            }),
            realtime.on('error', (m) => setError(m.message)),
            realtime.onStatus((s) => {
                if (s === 'open') {
                    if (openedOnce && joined && !ended) {
                        join();
                        realtime.send({ t: 'snapshot', sessionId });
                    }
                    openedOnce = true;
                }
            }),
        ];

        const ticker = setInterval(() => {
            const now = Date.now();
            while (arrivals.length && now - arrivals[0].at > 5000) arrivals.shift();
            const total = arrivals.reduce((a, b) => a + b.n, 0);
            setStats({ eps: total / 5, age: lastArrival ? Math.round((now - lastArrival) / 1000) : null });
        }, 1000);

        if (!ended && (initial.status === 'active' || (initial.status === 'requested' && initial.initiatedBy === 'user'))) join();

        return () => {
            disposed = true;
            for (const u of unsubs) u();
            clearInterval(ticker);
            if (snapTimer) clearTimeout(snapTimer);
            if (replayer) {
                try { replayer.pause(); } catch { /* yok say */ }
                try { replayer.destroy(); } catch { /* yok say */ }
            }
            replayerRef.current = null;
        };
    }, [realtime, sessionId]);

    // --- sahne boyutu ---
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setBox({ width: Math.max(0, width - 16), height: Math.max(0, height - 16) });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const el = chatListRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [chat.length]);

    // --- müdahale: koordinat ve düğüm çözümleme ---
    const toReplayPoint = (clientX: number, clientY: number) => {
        const r = overlayRef.current!.getBoundingClientRect();
        const s = scaleRef.current || 1;
        return { x: (clientX - r.left) / s, y: (clientY - r.top) / s };
    };

    const hitTest = (x: number, y: number): { el: Element; id: number } | null => {
        const rep = replayerRef.current;
        const doc = rep?.iframe.contentDocument;
        if (!rep || !doc) return null;
        let el = doc.elementFromPoint(x, y);
        let ox = x;
        let oy = y;
        while (el && el.tagName === 'IFRAME') {
            const inner = (el as HTMLIFrameElement).contentDocument;
            if (!inner) break;
            const r = el.getBoundingClientRect();
            ox -= r.left;
            oy -= r.top;
            const next = inner.elementFromPoint(ox, oy);
            if (!next) break;
            el = next;
        }
        const mirror = rep.getMirror();
        let n: Node | null = el;
        while (n) {
            const id = mirror.getId(n);
            if (id > 0 && n.nodeType === 1) return { el: n as Element, id };
            n = n.parentNode;
        }
        return null;
    };

    const idOf = (el: Element) => replayerRef.current?.getMirror().getId(el) ?? -1;

    const nodeById = (id: number) => (replayerRef.current?.getMirror().getNode(id) ?? null) as Element | null;

    const onOverlayClick = (e: ReactMouseEvent) => {
        stageRef.current?.focus({ preventScroll: true });
        const p = toReplayPoint(e.clientX, e.clientY);
        const hit = hitTest(p.x, p.y);
        if (!hit) return;
        const stageRect = overlayRef.current!.getBoundingClientRect();
        const pos = { left: e.clientX - stageRect.left, top: e.clientY - stageRect.top };
        const select = hit.el.closest('select');
        if (select) {
            const id = idOf(select);
            if (id <= 0) return;
            const options = Array.from(select.querySelectorAll('option')).map((o) => ({
                value: o.value, label: o.textContent?.trim() || o.value, selected: o.selected,
            }));
            setTarget({ id, kind: 'select', locked: isLockedField(select) || select.disabled, options, ...pos });
            return;
        }
        sendCtl({ type: 'click', id: hit.id });
        const field = hit.el.closest('input, textarea, [contenteditable=""], [contenteditable="true"]');
        const isText = field && (field.tagName === 'TEXTAREA'
            || (field.tagName === 'INPUT' && (TEXT_TYPES.has(((field as HTMLInputElement).type || '').toLowerCase()) || isLockedField(field)))
            || (field.tagName !== 'INPUT' && field.tagName !== 'TEXTAREA'));
        if (field && isText) {
            const id = idOf(field);
            const locked = isLockedField(field) || ((field as HTMLInputElement).type || '').toLowerCase() === 'password';
            if (id > 0) {
                setTarget({ id, kind: 'text', locked, ...pos });
                const v = field.tagName === 'INPUT' || field.tagName === 'TEXTAREA' ? (field as HTMLInputElement).value : field.textContent || '';
                setTextValue(locked ? '' : v);
                return;
            }
        }
        setTarget(null);
    };

    const onOverlayMove = (e: ReactMouseEvent) => {
        const now = performance.now();
        if (now - lastPointerRef.current < POINTER_MS) return;
        lastPointerRef.current = now;
        const p = toReplayPoint(e.clientX, e.clientY);
        sendCtl({ type: 'pointer', x: Math.round(p.x), y: Math.round(p.y) });
    };

    // Tekerlek: pasif olmayan dinleyici gerekir (sayfanın kaymasını engellemek için).
    useEffect(() => {
        const overlay = overlayRef.current;
        if (!control || !overlay) return;
        const w = wheelRef.current;
        const fire = () => {
            w.timer = null;
            const rep = replayerRef.current;
            const doc = rep?.iframe.contentDocument;
            if (!rep || !doc || (!w.dx && !w.dy)) return;
            let el: Element | null = w.id != null ? (rep.getMirror().getNode(w.id) as Element | null) : null;
            const recent = w.last && w.last.key === w.key && Date.now() - w.last.at < 600 ? w.last : null;
            let x: number;
            let y: number;
            let maxX: number;
            let maxY: number;
            if (el && el.nodeType === 1) {
                x = recent ? recent.x : el.scrollLeft;
                y = recent ? recent.y : el.scrollTop;
                maxX = el.scrollWidth - el.clientWidth;
                maxY = el.scrollHeight - el.clientHeight;
            } else {
                el = null;
                const se = doc.scrollingElement ?? doc.documentElement;
                x = recent ? recent.x : se.scrollLeft;
                y = recent ? recent.y : se.scrollTop;
                maxX = se.scrollWidth - se.clientWidth;
                maxY = se.scrollHeight - se.clientHeight;
            }
            const nx = Math.round(Math.max(0, Math.min(maxX, x + w.dx)));
            const ny = Math.round(Math.max(0, Math.min(maxY, y + w.dy)));
            w.dx = 0;
            w.dy = 0;
            w.last = { key: w.key, x: nx, y: ny, at: Date.now() };
            if (endedRef.current) return;
            realtime.send({ t: 'ctl', sessionId, action: el ? { type: 'scroll', id: w.id, x: nx, y: ny } : { type: 'scroll', x: nx, y: ny } });
        };
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const r = overlay.getBoundingClientRect();
            const s = scaleRef.current || 1;
            const px = (e.clientX - r.left) / s;
            const py = (e.clientY - r.top) / s;
            const rep = replayerRef.current;
            const doc = rep?.iframe.contentDocument;
            if (!rep || !doc) return;
            let el: Element | null = doc.elementFromPoint(px, py);
            while (el && el !== doc.documentElement && el !== doc.body && !isScrollable(el)) el = el.parentElement;
            const id = el && el !== doc.documentElement && el !== doc.body ? rep.getMirror().getId(el) : -1;
            const key = id > 0 ? `el:${id}` : 'win';
            if (key !== w.key) {
                if (w.timer) { clearTimeout(w.timer); fire(); }
                w.key = key;
                w.id = id > 0 ? id : undefined;
            }
            const mult = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? doc.documentElement.clientHeight : 1;
            w.dx += e.deltaX * mult;
            w.dy += e.deltaY * mult;
            if (!w.timer) w.timer = setTimeout(fire, WHEEL_MS);
        };
        overlay.addEventListener('wheel', onWheel, { passive: false });
        return () => {
            overlay.removeEventListener('wheel', onWheel);
            if (w.timer) { clearTimeout(w.timer); w.timer = null; }
        };
    }, [control, realtime, sessionId]);

    const onStageKeyDown = (e: ReactKeyboardEvent) => {
        if (!control || e.target !== e.currentTarget) return;
        const printable = e.key.length === 1;
        const altGr = e.ctrlKey && e.altKey;
        if (!printable && !SPECIAL_KEYS.has(e.key)) return;
        if ((e.ctrlKey || e.metaKey) && !altGr && e.key.toLowerCase() === 'v') return;
        let key = e.key;
        if (!altGr) {
            if (e.altKey) key = `Alt+${key}`;
            if (e.metaKey) key = `Meta+${key}`;
            if (e.ctrlKey) key = `Ctrl+${key}`;
        }
        if (!printable && e.shiftKey) key = `Shift+${key}`;
        e.preventDefault();
        sendCtl({ type: 'key', key });
    };

    const onStagePaste = (e: ReactClipboardEvent) => {
        if (!control || e.target !== e.currentTarget) return;
        const text = e.clipboardData.getData('text');
        if (!text) return;
        e.preventDefault();
        if (target?.kind === 'text' && !target.locked) {
            const el = nodeById(target.id);
            const current = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? (el as HTMLInputElement).value : el?.textContent ?? '';
            sendCtl({ type: 'input', id: target.id, value: current + text });
        } else {
            for (const ch of Array.from(text).slice(0, 200)) sendCtl({ type: 'key', key: ch === '\n' ? 'Enter' : ch });
        }
    };

    const sendText = () => {
        if (!target || target.kind !== 'text' || target.locked) return;
        sendCtl({ type: 'input', id: target.id, value: textValue });
    };

    const sendChat = () => {
        const text = draft.trim();
        if (!text || status === 'ended') return;
        realtime.send({ t: 'chat', sessionId, text });
        setChat((list) => [...list, { id: `local-${Date.now()}`, from: 'admin' as const, text, at: new Date().toISOString(), pending: true }].slice(-300));
        setDraft('');
    };

    const end = () => {
        if (status !== 'ended') realtime.send({ t: 'remote:end', sessionId });
        setStatus('ended');
        setEndReason('Oturumu siz bitirdiniz.');
        setControl(false);
    };

    const close = () => {
        if (status !== 'ended') realtime.send({ t: 'remote:end', sessionId });
        onClose();
    };

    const requestSnapshot = () => {
        if (status !== 'ended') realtime.send({ t: 'snapshot', sessionId });
    };

    const canControl = status === 'connected' && hasSnapshot;
    const controlOn = control && canControl;
    const scaledW = viewport ? Math.round(viewport.width * scale) : 0;
    const scaledH = viewport ? Math.round(viewport.height * scale) : 0;
    const quality = stats.age == null ? '#9ca3af' : stats.age <= 3 ? '#16a34a' : stats.age <= 15 ? '#f59e0b' : '#dc2626';

    const placeholder = status === 'ended' ? null
        : !hasSnapshot ? (status === 'waiting_user' ? 'Kullanıcı onayı bekleniyor…'
            : status === 'connecting' ? 'Kullanıcıya bağlanılıyor…' : 'Ekran görüntüsü bekleniyor…')
            : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 420, background: '#0f172a', color: '#e5e7eb', font: `13px/1.4 ${FONT}`, borderRadius: 10, overflow: 'hidden' }}>
            {/* Araç çubuğu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#111827', borderBottom: '1px solid #1f2937', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: `${STATUS_COLOR[status]}22`, color: STATUS_COLOR[status], fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[status] }} />
                    {STATUS_LABEL[status]}
                </span>
                <strong style={{ color: '#fff' }}>{userLabel(session)}</strong>
                {session.user?.company_name && <span style={{ color: '#9ca3af' }}>· {session.user.company_name}</span>}
                {session.note && <span style={{ color: '#9ca3af', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={session.note}>· “{session.note}”</span>}
                <span style={{ flex: 1 }} />
                <span title="Son 5 sn'deki olay hızı ve son olayın yaşı" style={{ color: quality, fontVariantNumeric: 'tabular-nums' }}>
                    {conn !== 'open' ? 'Sunucu bağlantısı yok' : `${stats.eps.toFixed(1)} olay/sn · ${stats.age == null ? 'olay yok' : `son olay ${stats.age} sn önce`}`}
                </span>
                <button type="button" style={btn('#1f2937', '#e5e7eb', status === 'ended')} disabled={status === 'ended'} onClick={requestSnapshot}>Tam görüntü iste</button>
                <button type="button" style={btn(controlOn ? '#ea580c' : '#1f2937', '#fff', !canControl)} disabled={!canControl}
                    aria-pressed={controlOn} onClick={() => { setControl((v) => !v); setTarget(null); stageRef.current?.focus({ preventScroll: true }); }}>
                    {controlOn ? 'Müdahale açık' : 'Müdahale et'}
                </button>
                <button type="button" style={btn('#b91c1c', '#fff', status === 'ended')} disabled={status === 'ended'} onClick={end}>Bitir</button>
                <button type="button" style={btn('#374151')} onClick={close}>Kapat</button>
            </div>

            {error && (
                <div style={{ padding: '6px 12px', background: '#7f1d1d', color: '#fecaca', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{error}</span>
                    <button type="button" style={btn('transparent', '#fecaca')} onClick={() => setError(null)}>✕</button>
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                {/* Sahne */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div ref={stageRef} tabIndex={0} onKeyDown={onStageKeyDown} onPaste={onStagePaste}
                        style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', outline: controlOn ? '2px solid #ea580c' : 'none', outlineOffset: -2, minHeight: 0 }}>
                        <div style={{ position: 'relative', width: scaledW || '100%', height: scaledH || '100%', overflow: 'hidden', background: viewport ? '#fff' : 'transparent', boxShadow: viewport ? '0 4px 20px rgba(0,0,0,.4)' : 'none' }}>
                            <div ref={rootRef} style={{ position: 'absolute', left: 0, top: 0, width: viewport?.width, height: viewport?.height, transform: `scale(${scale})`, transformOrigin: '0 0' }} />
                            {controlOn && (
                                <div ref={overlayRef} onClick={onOverlayClick} onMouseMove={onOverlayMove}
                                    style={{ position: 'absolute', inset: 0, cursor: 'crosshair', zIndex: 5 }} />
                            )}
                            {controlOn && target?.kind === 'select' && target.options && (
                                <div style={{ position: 'absolute', zIndex: 6, left: Math.min(target.left, Math.max(0, scaledW - 220)), top: Math.min(target.top, Math.max(0, scaledH - 220)), width: 220, maxHeight: 220, overflowY: 'auto', background: '#fff', color: '#111827', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.35)', padding: 4 }}>
                                    <div style={{ padding: '4px 8px', fontSize: 11, color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{target.locked ? 'Bu liste değiştirilemez' : 'Seçenek seçin'}</span>
                                        <button type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }} onClick={() => setTarget(null)}>✕</button>
                                    </div>
                                    {target.options.map((o, i) => (
                                        <button key={`${o.value}-${i}`} type="button" disabled={target.locked}
                                            onClick={() => { sendCtl({ type: 'select', id: target.id, value: o.value }); setTarget(null); }}
                                            style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: target.locked ? 'default' : 'pointer', background: o.selected ? '#ffedd5' : 'transparent', color: '#111827', font: `13px ${FONT}` }}>
                                            {o.label || '—'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {placeholder && (
                            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#9ca3af', pointerEvents: 'none' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 15, color: '#e5e7eb', marginBottom: 4 }}>{placeholder}</div>
                                    <div style={{ fontSize: 12 }}>Kullanıcı bağlandığında ekranı burada canlı görünecek.</div>
                                </div>
                            </div>
                        )}
                        {status === 'ended' && (
                            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(15,23,42,.6)' }}>
                                <div style={{ textAlign: 'center', background: '#111827', padding: '16px 22px', borderRadius: 10, border: '1px solid #374151' }}>
                                    <div style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>Oturum sona erdi</div>
                                    {endReason && <div style={{ color: '#9ca3af', marginTop: 4 }}>{endReason}</div>}
                                    <button type="button" style={{ ...btn('#374151'), marginTop: 12 }} onClick={onClose}>Kapat</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {controlOn && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#111827', borderTop: '1px solid #1f2937', minHeight: 40 }}>
                            {target?.kind === 'text' ? (
                                target.locked ? (
                                    <span style={{ color: '#fca5a5' }}>Bu alan gizli (parola / özel alan); uzaktan yazılamaz.</span>
                                ) : (
                                    <form style={{ display: 'flex', gap: 6, flex: 1 }} onSubmit={(e) => { e.preventDefault(); sendText(); }}>
                                        <input value={textValue} onChange={(e) => setTextValue(e.target.value)} placeholder="Seçili alana yazılacak metin"
                                            style={{ flex: 1, border: '1px solid #374151', borderRadius: 8, padding: '6px 10px', background: '#0b1220', color: '#e5e7eb', font: `13px ${FONT}`, outline: 'none' }} />
                                        <button type="submit" style={btn('#ea580c')}>Metin gönder</button>
                                    </form>
                                )
                            ) : (
                                <span style={{ color: '#9ca3af' }}>
                                    Tıklayın, kaydırın ya da ekran seçiliyken yazın. Bir metin alanına tıklarsanız tüm değeri buradan gönderebilirsiniz.
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Sohbet */}
                <div style={{ width: 280, flex: 'none', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #1f2937', background: '#111827' }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #1f2937', fontWeight: 600, color: '#fff' }}>Kullanıcı ile mesajlaşma</div>
                    <div ref={chatListRef} style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {chat.length === 0 && <div style={{ color: '#6b7280', textAlign: 'center', padding: 12 }}>Henüz mesaj yok.</div>}
                        {chat.map((m) => (
                            <div key={m.id} style={{ alignSelf: m.from === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                                <div style={{ background: m.from === 'admin' ? '#ea580c' : '#1f2937', color: '#fff', borderRadius: 10, padding: '6px 10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', opacity: m.pending ? 0.7 : 1 }}>{m.text}</div>
                                <div style={{ fontSize: 10, color: '#6b7280', textAlign: m.from === 'admin' ? 'right' : 'left', marginTop: 2 }}>
                                    {m.from === 'admin' ? (adminName ? `${adminName} (siz)` : 'Siz') : userLabel(session)} · {timeOf(m.at)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <form style={{ display: 'flex', gap: 6, padding: 8, borderTop: '1px solid #1f2937' }} onSubmit={(e) => { e.preventDefault(); sendChat(); }}>
                        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Mesaj yazın…" maxLength={2000} disabled={status === 'ended'}
                            style={{ flex: 1, minWidth: 0, border: '1px solid #374151', borderRadius: 8, padding: '6px 10px', background: '#0b1220', color: '#e5e7eb', font: `13px ${FONT}`, outline: 'none' }} />
                        <button type="submit" style={btn('#ea580c', '#fff', !draft.trim() || status === 'ended')} disabled={!draft.trim() || status === 'ended'}>Gönder</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
