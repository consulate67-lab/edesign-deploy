import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, Headset, Loader2, MessageCirclePlus, MonitorSmartphone, Send, ShieldCheck, WifiOff, X } from 'lucide-react';
import type { SupportTicket, TicketStatus } from '../admin/contracts';
import { getUserRealtime } from './realtime';
import { collectSupportContext, supportApi, SUPPORT_UNREACHABLE } from './supportApi';
import { theme } from '../theme';

const HIDDEN_KEY = 'support_widget_hidden';
const ACCENT = theme.gradient;
const CONSENT_TEXT = 'Destek ekibi ekranınızı canlı görebilecek ve sizin adınıza tıklayıp yazabilecek. Şifre alanları gizlenir. Bağlantıyı istediğiniz an bitirebilirsiniz.';

const STATUS: Record<TicketStatus, { label: string; color: string }> = {
    open: { label: 'Açık', color: '#d97706' },
    answered: { label: 'Yanıtlandı', color: '#0284c7' },
    closed: { label: 'Kapalı', color: '#64748b' },
};

type Screen = { kind: 'list' } | { kind: 'new' } | { kind: 'ticket'; id: number } | { kind: 'consent'; ticketId?: number };

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));
const toDate = (iso: string) => new Date(/^\d{4}-\d{2}-\d{2} \d/.test(iso) ? `${iso.replace(' ', 'T')}Z` : iso);
const fmtTime = (iso: string) => {
    const d = toDate(iso);
    if (Number.isNaN(d.getTime())) return '';
    const sameDay = d.toDateString() === new Date().toDateString();
    return sameDay
        ? d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const input: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 10, border: `1px solid ${theme.borderStrong}`,
    background: '#fff', color: theme.text, fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none',
};

const button = (primary: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
    fontFamily: 'inherit', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap',
    ...(primary
        ? { background: ACCENT, color: 'white', border: 'none', boxShadow: theme.shadowBrand }
        : { background: theme.surface, color: theme.text, border: `1px solid ${theme.borderStrong}` }),
});

const iconBtn: React.CSSProperties = {
    background: 'transparent', border: 'none', color: theme.textMuted, cursor: 'pointer', display: 'flex', padding: 5, borderRadius: 8,
};

/**
 * Giriş yapmış kullanıcı için sağ altta destek düğmesi: talepler, yeni talep (ekran / belge / tarayıcı bilgisi otomatik eklenir),
 * yanıtlar (canlı) ve onaylı online destek isteği.
 */
export const SupportWidget: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [hidden, setHidden] = useState(() => sessionStorage.getItem(HIDDEN_KEY) === '1');
    const [screen, setScreen] = useState<Screen>({ kind: 'list' });
    const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [reply, setReply] = useState('');
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [remoteState, setRemoteState] = useState<'idle' | 'sent' | 'active'>('idle');
    const [remoteAdmin, setRemoteAdmin] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const load = useCallback(async () => {
        try {
            setTickets(await supportApi.tickets());
            setError(null);
        } catch (e) {
            setError(errorText(e));
        }
    }, []);

    useEffect(() => {
        void load();
        const rt = getUserRealtime();
        const unsubs = [
            rt.on('ticket:update', () => { void load(); }),
            rt.on('remote:joined', m => { setRemoteState('active'); setRemoteAdmin(m.adminName); }),
            rt.on('remote:end', () => setRemoteState('idle')),
            rt.on('remote:status', m => { if (m.status === 'ended' || m.status === 'declined') setRemoteState('idle'); }),
        ];
        return () => unsubs.forEach(u => u());
    }, [load]);

    useEffect(() => {
        if (!open) return;
        const run = () => { void load(); };
        run();
        const id = setInterval(run, 30000);
        return () => clearInterval(id);
    }, [open, load]);

    const current = screen.kind === 'ticket' ? tickets?.find(t => t.id === screen.id) ?? null : null;
    const currentUnread = current?.unread_for_user ?? 0;
    const currentId = current?.id;
    const messageCount = current?.messages?.length ?? 0;

    useEffect(() => {
        if (!open || !currentId || !currentUnread) return;
        supportApi.markRead(currentId)
            .then(() => setTickets(list => list && list.map(t => t.id === currentId ? { ...t, unread_for_user: 0 } : t)))
            .catch(() => { /* bir sonraki yüklemede tekrar denenir */ });
    }, [open, currentId, currentUnread]);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messageCount, currentId, open]);

    const unread = (tickets ?? []).reduce((n, t) => n + (t.unread_for_user ? 1 : 0), 0);

    const createTicket = async () => {
        if (!subject.trim() || !message.trim()) {
            setFormError('Konu ve mesaj alanlarını doldurun.');
            return;
        }
        setBusy(true);
        setFormError(null);
        try {
            const t = await supportApi.create(subject.trim(), message.trim(), collectSupportContext());
            setTickets(list => [t, ...(list ?? []).filter(x => x.id !== t.id)]);
            setSubject('');
            setMessage('');
            setScreen({ kind: 'ticket', id: t.id });
        } catch (e) {
            setFormError(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    const sendReply = async () => {
        if (!current || !reply.trim()) return;
        setBusy(true);
        setFormError(null);
        try {
            const m = await supportApi.reply(current.id, reply.trim());
            setTickets(list => list && list.map(t => t.id === current.id
                ? { ...t, status: 'open', messages: [...(t.messages ?? []), m], last_message: m.body, last_message_at: m.created_at }
                : t));
            setReply('');
        } catch (e) {
            setFormError(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    const requestRemote = async (ticketId?: number) => {
        setBusy(true);
        setFormError(null);
        try {
            const { requestOnlineSupport } = await import('./cobrowse/CobrowseClient');
            await requestOnlineSupport(note.trim() || undefined, ticketId);
            setRemoteState('sent');
            setNote('');
        } catch (e) {
            const msg = errorText(e);
            setFormError(/fetch|network|ulaşılamadı/i.test(msg) ? SUPPORT_UNREACHABLE : msg);
        } finally {
            setBusy(false);
        }
    };

    const go = (s: Screen) => {
        setFormError(null);
        if (s.kind === 'consent') setRemoteState(r => (r === 'active' ? r : 'idle'));
        setScreen(s);
    };

    if (hidden) {
        return (
            <button type="button" data-support-restore title="Destek düğmesini göster" onClick={() => { setHidden(false); sessionStorage.removeItem(HIDDEN_KEY); }}
                style={{
                    position: 'fixed', right: 0, bottom: 90, zIndex: 900, width: 22, height: 54, borderRadius: '10px 0 0 10px', border: 'none',
                    background: ACCENT, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: theme.shadowBrand, opacity: 0.75, padding: 0,
                }}>
                <Headset size={13} />
                {unread > 0 && <span style={{ position: 'absolute', top: -4, left: -4, width: 10, height: 10, borderRadius: 999, background: '#ef4444' }} />}
            </button>
        );
    }

    const header = (title: React.ReactNode, back?: Screen) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 12px 12px 14px', background: ACCENT, color: 'white', flexShrink: 0 }}>
            {back && <button type="button" aria-label="Geri" onClick={() => go(back)} style={{ ...iconBtn, color: 'white' }}><ArrowLeft size={17} /></button>}
            <div style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
            <button type="button" aria-label="Küçült" title="Küçült" data-support-minimize onClick={() => setOpen(false)} style={{ ...iconBtn, color: 'white' }}><ChevronDown size={18} /></button>
        </div>
    );

    const unreachable = error && (
        <div data-support-error style={{ margin: 12, padding: '12px 12px', borderRadius: 12, background: theme.redSoft, border: '1px solid rgba(239, 68, 68, 0.3)', color: theme.redText, fontSize: '0.8rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <WifiOff size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
                {error === SUPPORT_UNREACHABLE ? 'Destek sunucusuna ulaşılamadı. Biraz sonra tekrar deneyin.' : error}
                <div><button type="button" onClick={() => void load()} style={{ ...iconBtn, color: theme.primary, padding: '4px 0', fontSize: '0.78rem', fontWeight: 700 }}>Tekrar dene</button></div>
            </div>
        </div>
    );

    let body: React.ReactNode;
    if (screen.kind === 'new') {
        body = (
            <>
                {header('Yeni destek talebi', { kind: 'list' })}
                <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input data-support-subject value={subject} onChange={e => setSubject(e.target.value)} placeholder="Konu" maxLength={140} style={input} autoFocus />
                    <textarea data-support-message value={message} onChange={e => setMessage(e.target.value)} placeholder="Sorununuzu veya isteğinizi yazın" rows={6}
                        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void createTicket(); } }}
                        style={{ ...input, resize: 'vertical', lineHeight: 1.45 }} />
                    <div style={{ fontSize: '0.72rem', color: theme.textSubtle, lineHeight: 1.45 }}>
                        Talebinize bulunduğunuz ekran, açık belge adı, tarayıcı ve ekran boyutu bilgisi otomatik eklenir.
                    </div>
                    {formError && <div style={{ color: theme.redText, fontSize: '0.78rem' }}>{formError === SUPPORT_UNREACHABLE ? 'Destek sunucusuna ulaşılamadı.' : formError}</div>}
                    <button type="button" data-support-submit disabled={busy} onClick={() => void createTicket()} style={{ ...button(true), opacity: busy ? 0.7 : 1 }}>
                        {busy ? <Loader2 size={15} className="sw-spin" /> : <Send size={15} />} Gönder
                    </button>
                </div>
            </>
        );
    } else if (screen.kind === 'consent') {
        body = (
            <>
                {header('Online destek', screen.ticketId ? { kind: 'ticket', id: screen.ticketId } : { kind: 'list' })}
                <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {remoteState === 'active' ? (
                        <div data-support-remote-active style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', padding: '20px 6px', color: theme.text }}>
                            <div style={{ width: 52, height: 52, borderRadius: 999, background: theme.redSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MonitorSmartphone size={24} color={theme.redText} />
                            </div>
                            <div style={{ fontWeight: 800 }}>{remoteAdmin || 'Destek ekibi'} bağlandı</div>
                            <div style={{ fontSize: '0.8rem', color: theme.textMuted, lineHeight: 1.5 }}>
                                Ekranınız şu an canlı paylaşılıyor. Mesajlaşmak ya da bağlantıyı bitirmek için sayfanın üstündeki kırmızı çubuğu kullanın.
                            </div>
                            <button type="button" onClick={() => go({ kind: 'list' })} style={button(false)}>Taleplerime dön</button>
                        </div>
                    ) : remoteState === 'sent' ? (
                        <div data-support-remote-sent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', padding: '20px 6px', color: theme.text }}>
                            <div style={{ width: 52, height: 52, borderRadius: 999, background: theme.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MonitorSmartphone size={24} color={theme.greenText} />
                            </div>
                            <div style={{ fontWeight: 800 }}>İsteğiniz destek ekibine iletildi</div>
                            <div style={{ fontSize: '0.8rem', color: theme.textMuted, lineHeight: 1.5 }}>
                                Bir yetkili bağlandığında ekranınızın üstünde bilgi çubuğu görünür. Bağlantıyı oradan istediğiniz an bitirebilirsiniz.
                            </div>
                            <button type="button" onClick={() => go({ kind: 'list' })} style={button(false)}>Taleplerime dön</button>
                        </div>
                    ) : (
                        <>
                            <div data-support-consent style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 12, background: theme.primarySoft, border: '1px solid rgba(109, 40, 217, 0.25)', color: theme.text, fontSize: '0.82rem', lineHeight: 1.55 }}>
                                <ShieldCheck size={20} color={theme.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                                <span>{CONSENT_TEXT}</span>
                            </div>
                            <textarea data-support-remote-note value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Kısaca neye yardım lazım? (isteğe bağlı)" style={{ ...input, resize: 'vertical' }} />
                            {formError && <div style={{ color: theme.redText, fontSize: '0.78rem' }}>{formError}</div>}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" onClick={() => go(screen.ticketId ? { kind: 'ticket', id: screen.ticketId } : { kind: 'list' })} style={{ ...button(false), flex: 1 }}>Vazgeç</button>
                                <button type="button" data-support-remote-confirm disabled={busy} onClick={() => void requestRemote(screen.ticketId)} style={{ ...button(true), flex: 2, opacity: busy ? 0.7 : 1 }}>
                                    {busy ? <Loader2 size={15} className="sw-spin" /> : <MonitorSmartphone size={15} />} Onaylıyorum, destek iste
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    } else if (screen.kind === 'ticket') {
        body = (
            <>
                {header(current ? current.subject : 'Talep', { kind: 'list' })}
                {!current ? (unreachable || <div style={{ padding: 16, color: theme.textSubtle, fontSize: '0.84rem' }}>Talep bulunamadı.</div>) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, fontSize: '0.74rem', color: theme.textSubtle }}>
                            <span style={{ padding: '1px 8px', borderRadius: 999, background: `${STATUS[current.status].color}26`, color: STATUS[current.status].color, fontWeight: 800 }}>{STATUS[current.status].label}</span>
                            #{current.id}
                            <button type="button" data-support-remote onClick={() => go({ kind: 'consent', ticketId: current.id })} style={{ ...button(false), marginLeft: 'auto', padding: '4px 8px', fontSize: '0.72rem' }}>
                                <MonitorSmartphone size={13} /> Online destek iste
                            </button>
                        </div>
                        <div ref={scrollRef} data-support-thread style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(current.messages ?? []).map(m => {
                                const mine = m.sender === 'user';
                                return (
                                    <div key={m.id} data-support-msg={m.sender} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                                        <div style={{
                                            maxWidth: '82%', padding: '8px 11px', borderRadius: 14, fontSize: '0.82rem', lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                            background: mine ? ACCENT : theme.surfaceAlt, color: mine ? 'white' : theme.text,
                                            border: mine ? 'none' : `1px solid ${theme.border}`,
                                            borderBottomRightRadius: mine ? 4 : 14, borderBottomLeftRadius: mine ? 14 : 4,
                                        }}>
                                            {m.body}
                                            <div style={{ fontSize: '0.64rem', opacity: 0.7, marginTop: 3, textAlign: 'right' }}>{mine ? 'Siz' : 'Destek ekibi'} · {fmtTime(m.created_at)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {formError && <div style={{ color: theme.redText, fontSize: '0.76rem', padding: '0 12px 6px' }}>{formError}</div>}
                        <div style={{ display: 'flex', gap: 8, padding: 10, borderTop: `1px solid ${theme.border}`, alignItems: 'flex-end' }}>
                            <textarea data-support-reply value={reply} onChange={e => setReply(e.target.value)} rows={2}
                                placeholder={current.status === 'closed' ? 'Talep kapandı; yazarsanız yeniden açılır.' : 'Mesajınız… (Ctrl+Enter)'}
                                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void sendReply(); } }}
                                style={{ ...input, resize: 'none', lineHeight: 1.4 }} />
                            <button type="button" data-support-reply-send aria-label="Gönder" disabled={busy || !reply.trim()} onClick={() => void sendReply()}
                                style={{ ...button(true), padding: 10, opacity: busy || !reply.trim() ? 0.6 : 1 }}>
                                {busy ? <Loader2 size={16} className="sw-spin" /> : <Send size={16} />}
                            </button>
                        </div>
                    </>
                )}
            </>
        );
    } else {
        body = (
            <>
                {header(<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Headset size={17} /> Destek</span>)}
                <div style={{ display: 'flex', gap: 8, padding: 12, borderBottom: `1px solid ${theme.border}` }}>
                    <button type="button" data-support-new onClick={() => go({ kind: 'new' })} style={{ ...button(true), flex: 1 }}><MessageCirclePlus size={15} /> Yeni talep</button>
                    <button type="button" data-support-remote onClick={() => go({ kind: 'consent' })} style={{ ...button(false), flex: 1 }}><MonitorSmartphone size={15} /> Online destek iste</button>
                </div>
                <div data-support-list style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
                    {unreachable}
                    {!error && !tickets && <div style={{ padding: 16, color: theme.textSubtle, fontSize: '0.82rem', display: 'flex', gap: 8 }}><Loader2 size={15} className="sw-spin" /> Yükleniyor…</div>}
                    {tickets && tickets.length === 0 && !error && (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: theme.textSubtle, fontSize: '0.82rem', lineHeight: 1.5 }}>
                            Henüz destek talebiniz yok. Bir sorun yaşarsanız "Yeni talep" ile bize yazın; yanıtlarımız burada görünür.
                        </div>
                    )}
                    {tickets?.map(t => (
                        <button key={t.id} type="button" data-support-ticket={t.id} onClick={() => go({ kind: 'ticket', id: t.id })}
                            onMouseEnter={e => { e.currentTarget.style.background = theme.surfaceAlt; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', padding: '10px 10px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: theme.text }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ flex: 1, fontWeight: t.unread_for_user ? 800 : 600, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subject}</span>
                                {t.unread_for_user > 0 && <span data-support-unread style={{ minWidth: 18, height: 18, borderRadius: 999, background: '#ef4444', color: 'white', fontSize: '0.66rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', boxSizing: 'border-box' }}>{t.unread_for_user}</span>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: theme.textSubtle }}>
                                <span style={{ color: STATUS[t.status].color, fontWeight: 700 }}>{STATUS[t.status].label}</span>
                                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>· {t.last_message ?? t.messages?.[t.messages.length - 1]?.body ?? ''}</span>
                                <span style={{ whiteSpace: 'nowrap' }}>{fmtTime(t.last_message_at)}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </>
        );
    }

    return (
        <div data-support-widget style={{ fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                @keyframes sw-spin { to { transform: rotate(360deg); } }
                .sw-spin { animation: sw-spin 0.9s linear infinite; }
                @keyframes sw-pop { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: none; } }
                [data-support-widget] textarea::placeholder, [data-support-widget] input::placeholder { color: ${theme.textSubtle}; }
                [data-support-widget] textarea:focus, [data-support-widget] input:focus { border-color: ${theme.primary} !important; box-shadow: ${theme.focusRing}; }
                [data-support-fab]:hover [data-support-hide] { opacity: 1 !important; }
            `}</style>
            {open && (
                <div data-support-panel role="dialog" aria-label="Destek" style={{
                    position: 'fixed', right: 16, bottom: 76, zIndex: 900, width: 'min(370px, calc(100vw - 24px))', height: 'min(560px, calc(100vh - 100px))',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 18, background: theme.surface, color: theme.text,
                    border: `1px solid ${theme.border}`, boxShadow: '0 24px 60px rgba(15, 23, 42, 0.28), 0 4px 12px rgba(15, 23, 42, 0.12)', animation: 'sw-pop 0.18s ease-out',
                }}>
                    {body}
                </div>
            )}
            <div data-support-fab style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 900 }}>
                <button type="button" data-support-toggle aria-label={open ? 'Desteği küçült' : 'Destek'} title={open ? 'Küçült' : 'Destek'}
                    onClick={() => setOpen(o => !o)}
                    style={{
                        width: 48, height: 48, borderRadius: 999, border: 'none', cursor: 'pointer', background: ACCENT, color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: theme.shadowBrand, position: 'relative',
                    }}>
                    {open ? <X size={20} /> : <Headset size={21} />}
                    {!open && unread > 0 && (
                        <span data-support-badge style={{ position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 999, background: '#ef4444', color: 'white', fontSize: '0.66rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', boxSizing: 'border-box', border: '2px solid #fff' }}>
                            {unread}
                        </span>
                    )}
                </button>
                {!open && (
                    <button type="button" data-support-hide title="Destek düğmesini gizle" aria-label="Destek düğmesini gizle"
                        onClick={() => { setHidden(true); sessionStorage.setItem(HIDDEN_KEY, '1'); }}
                        style={{
                            position: 'absolute', top: -8, left: -8, width: 18, height: 18, borderRadius: 999, border: `1px solid ${theme.borderStrong}`, boxShadow: theme.shadowSm,
                            background: theme.surface, color: theme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: 0,
                            transition: 'opacity 0.15s',
                        }}>
                        <X size={10} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SupportWidget;
