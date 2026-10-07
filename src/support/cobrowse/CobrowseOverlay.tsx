import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import type { CobrowseController } from './CobrowseClient';

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const KEYFRAMES = `
@keyframes cobrowse-pulse { 0%,100% { opacity: 1 } 50% { opacity: .35 } }
@keyframes cobrowse-spin { to { transform: rotate(360deg) } }
@keyframes cobrowse-in { from { opacity: 0; transform: translate(-50%, -8px) } to { opacity: 1; transform: translate(-50%, 0) } }
`;

const pill: CSSProperties = {
    position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 2147483001,
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px 8px 14px', borderRadius: 999,
    background: '#1f2937', color: '#fff', font: `500 13px/1.3 ${FONT}`, boxShadow: '0 8px 24px rgba(0,0,0,.25)',
    animation: 'cobrowse-in 160ms ease-out', maxWidth: 'calc(100vw - 24px)',
};

const btn = (bg: string, color = '#fff'): CSSProperties => ({
    border: 'none', borderRadius: 8, padding: '6px 12px', background: bg, color, cursor: 'pointer',
    font: `600 12px/1.2 ${FONT}`, whiteSpace: 'nowrap',
});

const Spinner = () => (
    <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', animation: 'cobrowse-spin 800ms linear infinite', flex: 'none' }} />
);

const timeOf = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

export function CobrowseOverlay({ controller }: { controller: CobrowseController }) {
    const s = useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
    const [chatOpen, setChatOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const listRef = useRef<HTMLDivElement>(null);

    const showChat = chatOpen && s.phase === 'active';

    useEffect(() => {
        controller.setChatOpen(showChat);
    }, [controller, showChat]);

    useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [s.chat.length, showChat]);

    const send = () => {
        if (!draft.trim()) return;
        controller.sendChat(draft);
        setDraft('');
    };

    return (
        <>
            <style>{KEYFRAMES}</style>

            {s.notice && s.phase === 'idle' && (
                <div style={pill} role="status">
                    <span>{s.notice}</span>
                    <button type="button" style={btn('transparent', '#d1d5db')} onClick={controller.dismissNotice} aria-label="Kapat">✕</button>
                </div>
            )}

            {(s.phase === 'waiting' || s.phase === 'connecting') && (
                <div style={pill} role="status">
                    <Spinner />
                    <span>{s.phase === 'waiting' ? 'Destek ekibi bekleniyor…' : `${s.adminName || 'Destek ekibi'} bağlanıyor…`}</span>
                    <button type="button" style={btn('#374151')} onClick={controller.cancelWaiting}>İptal</button>
                </div>
            )}

            {s.phase === 'invite' && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 2147483002, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="cobrowse-consent-title"
                        style={{ width: 'min(440px, 100%)', background: '#fff', color: '#111827', borderRadius: 14, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,.35)', font: `14px/1.5 ${FONT}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <span style={{ width: 36, height: 36, borderRadius: 10, background: '#fff7ed', color: '#ea580c', display: 'grid', placeItems: 'center', fontSize: 20 }}>🖥️</span>
                            <div>
                                <div id="cobrowse-consent-title" style={{ fontWeight: 700, fontSize: 16 }}>Canlı destek isteği</div>
                                {s.adminName && <div style={{ color: '#6b7280', fontSize: 12 }}>{s.adminName} · Destek ekibi</div>}
                            </div>
                        </div>
                        <p style={{ margin: '0 0 18px' }}>
                            Destek ekibi ekranınızı görmek ve size yardımcı olmak istiyor. Ekranınızı görebilecek ve sizin adınıza tıklayıp yazabilecek. İzin veriyor musunuz?
                        </p>
                        <p style={{ margin: '0 0 18px', color: '#6b7280', fontSize: 12 }}>
                            Parola alanları hiçbir zaman paylaşılmaz. Bağlantıyı istediğiniz an üstteki çubuktan bitirebilirsiniz.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button type="button" style={{ ...btn('#f3f4f6', '#111827'), padding: '9px 16px', fontSize: 13 }} onClick={controller.decline}>Reddet</button>
                            <button type="button" autoFocus style={{ ...btn('#ea580c'), padding: '9px 16px', fontSize: 13 }} onClick={controller.accept}>İzin ver</button>
                        </div>
                    </div>
                </div>
            )}

            {s.phase === 'active' && (
                <>
                    <div role="status" style={{
                        ...pill, top: 8, borderRadius: 12, padding: '7px 8px 7px 14px',
                        background: 'linear-gradient(90deg, #dc2626, #ea580c)', boxShadow: '0 6px 20px rgba(220,38,38,.45)',
                    }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#fff', animation: 'cobrowse-pulse 1.4s ease-in-out infinite', flex: 'none' }} />
                        <span style={{ fontWeight: 600 }}>
                            Canlı destek bağlı — {s.adminName || 'Destek'} ekranınızı görüyor
                            {s.connection !== 'open' && <span style={{ fontWeight: 400, opacity: .85 }}> (bağlantı yeniden kuruluyor…)</span>}
                        </span>
                        <button type="button" style={{ ...btn('rgba(255,255,255,.18)'), position: 'relative' }} onClick={() => setChatOpen((v) => !v)}>
                            Mesajlar
                            {s.unread > 0 && (
                                <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 9, background: '#fff', color: '#dc2626', font: `700 11px/18px ${FONT}`, textAlign: 'center', padding: '0 4px' }}>{s.unread}</span>
                            )}
                        </button>
                        <button type="button" style={btn('#fff', '#b91c1c')} onClick={controller.end}>Bağlantıyı bitir</button>
                    </div>

                    {showChat && (
                        <div style={{
                            position: 'fixed', top: 58, left: '50%', transform: 'translateX(-50%)', zIndex: 2147483001,
                            width: 'min(360px, calc(100vw - 24px))', background: '#fff', color: '#111827', borderRadius: 12,
                            boxShadow: '0 12px 36px rgba(0,0,0,.28)', font: `13px/1.45 ${FONT}`, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        }}>
                            <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong>Destek ile mesajlaşma</strong>
                                <button type="button" style={btn('transparent', '#6b7280')} onClick={() => setChatOpen(false)} aria-label="Kapat">✕</button>
                            </div>
                            <div ref={listRef} style={{ maxHeight: 260, minHeight: 80, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 6, background: '#f9fafb' }}>
                                {s.chat.length === 0 && <div style={{ color: '#9ca3af', textAlign: 'center', padding: 12 }}>Henüz mesaj yok.</div>}
                                {s.chat.map((m) => (
                                    <div key={m.id} style={{ alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                        <div style={{
                                            background: m.from === 'user' ? '#ea580c' : '#fff', color: m.from === 'user' ? '#fff' : '#111827',
                                            border: m.from === 'user' ? 'none' : '1px solid #e5e7eb', borderRadius: 10, padding: '6px 10px',
                                            whiteSpace: 'pre-wrap', wordBreak: 'break-word', opacity: m.pending ? .7 : 1,
                                        }}>{m.text}</div>
                                        <div style={{ fontSize: 10, color: '#9ca3af', textAlign: m.from === 'user' ? 'right' : 'left', marginTop: 2 }}>
                                            {m.from === 'admin' ? (s.adminName || 'Destek') : 'Siz'} · {timeOf(m.at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form style={{ display: 'flex', gap: 6, padding: 8, borderTop: '1px solid #e5e7eb' }} onSubmit={(e) => { e.preventDefault(); send(); }}>
                                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Mesajınızı yazın…" maxLength={2000}
                                    style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 8, padding: '7px 10px', font: `13px ${FONT}`, outline: 'none', color: '#111827', background: '#fff' }} />
                                <button type="submit" style={btn('#ea580c')} disabled={!draft.trim()}>Gönder</button>
                            </form>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
