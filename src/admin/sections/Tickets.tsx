import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft, Building2, FileText, Globe, LifeBuoy, Mail, Monitor, MonitorSmartphone, Phone, RefreshCw, Send, User, Laptop,
} from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { adminApi } from '../adminApi';
import { useAdmin } from '../adminContext';
import type { SupportTicket, TicketStatus } from '../contracts';
import { C, GRADIENT, TICKET_STATUS, browserSummary, btn, displayName, errorText, fmtDateTime, fmtRelative, fmtTime, inputStyle, viewLabel } from '../format';
import { useMediaQuery, useNow } from '../hooks';
import { Avatar, Badge, CountBadge, Empty, ErrorBox, SectionHeader, Spinner } from '../ui';

type Filter = TicketStatus | 'all';
const FILTERS: { id: Filter; label: string }[] = [
    { id: 'open', label: 'Açık' },
    { id: 'answered', label: 'Yanıtlandı' },
    { id: 'closed', label: 'Kapalı' },
    { id: 'all', label: 'Tümü' },
];

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: '0.8rem' }}>
        <span style={{ color: C.accent, display: 'flex', marginTop: 1 }}>{icon}</span>
        <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.66rem', color: C.dim, fontWeight: 700 }}>{label}</div>
            <div style={{ color: C.text, wordBreak: 'break-word' }}>{children}</div>
        </div>
    </div>
);

const Conversation: React.FC<{ ticketId: number; onBack?: () => void }> = ({ ticketId, onBack }) => {
    const { ticketEvent, reloadTickets, inviteUser, go, presenceById } = useAdmin();
    const pushToast = useUiStore(s => s.pushToast);
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const wide = useMediaQuery('(min-width: 1200px)');
    const now = useNow(60000);
    const eventSeq = ticketEvent?.ticketId === ticketId ? ticketEvent.seq : 0;

    useEffect(() => {
        let alive = true;
        adminApi.ticket(ticketId)
            .then(t => { if (alive) { setTicket(t); setError(null); void reloadTickets(); } })
            .catch(e => { if (alive) setError(errorText(e)); });
        return () => { alive = false; };
    }, [ticketId, eventSeq, reloadTickets]);

    const messageCount = ticket?.messages?.length ?? 0;
    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messageCount, ticketId]);

    const send = async () => {
        const body = reply.trim();
        if (!body || !ticket) return;
        setSending(true);
        try {
            const msg = await adminApi.reply(ticket.id, body);
            setTicket(t => t && { ...t, status: t.status === 'closed' ? t.status : 'answered', messages: [...(t.messages ?? []), msg] });
            setReply('');
            void reloadTickets();
        } catch (e) {
            pushToast({ kind: 'error', title: 'Yanıt gönderilemedi', description: errorText(e), ttl: 6000 });
        } finally {
            setSending(false);
        }
    };

    const setStatus = async (status: TicketStatus) => {
        if (!ticket || ticket.status === status) return;
        try {
            const t = await adminApi.setTicketStatus(ticket.id, status);
            setTicket(prev => prev && { ...prev, ...t, messages: prev.messages });
            void reloadTickets();
        } catch (e) {
            pushToast({ kind: 'error', title: 'Durum değiştirilemedi', description: errorText(e), ttl: 6000 });
        }
    };

    if (error) return <div style={{ padding: 18 }}><ErrorBox>{error}</ErrorBox></div>;
    if (!ticket) return <div style={{ padding: 18, display: 'flex', gap: 8, color: C.muted }}><Spinner /> Yükleniyor…</div>;

    const ctx = ticket.context ?? {};
    const u = ticket.user;
    const online = presenceById.get(ticket.user_id);

    const info = (
        <div data-admin-ticket-context style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={displayName(u)} size={36} online={!!online} />
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{displayName(u)}</div>
                    <div style={{ fontSize: '0.72rem', color: online ? C.greenText : C.dim }}>{online ? `Çevrimiçi · ${viewLabel(online.view)}` : 'Çevrimdışı'}</div>
                </div>
            </div>
            {u?.company_name && <InfoRow icon={<Building2 size={14} />} label="Firma">{u.company_name}</InfoRow>}
            {u?.username && <InfoRow icon={<Mail size={14} />} label="E-posta"><a href={`mailto:${u.username}`} style={{ color: C.accentText }}>{u.username}</a></InfoRow>}
            {u?.phone_number && <InfoRow icon={<Phone size={14} />} label="Telefon"><a href={`tel:${u.phone_number.replace(/[^\d+]/g, '')}`} style={{ color: C.accentText }}>{u.phone_number}</a></InfoRow>}
            <div style={{ height: 1, background: C.border }} />
            <InfoRow icon={<Monitor size={14} />} label="Talep açtığı ekran">{viewLabel(ctx.view)}</InfoRow>
            {(ctx.docName || ctx.moduleId) && <InfoRow icon={<FileText size={14} />} label="Açık belge">{ctx.docName || '—'}{ctx.moduleId ? ` (${ctx.moduleId})` : ''}</InfoRow>}
            <InfoRow icon={<Laptop size={14} />} label="Tarayıcı"><span title={ctx.userAgent}>{browserSummary(ctx.userAgent)}</span></InfoRow>
            {ctx.screen && <InfoRow icon={<Monitor size={14} />} label="Ekran boyutu">{ctx.screen}</InfoRow>}
            {ctx.url && <InfoRow icon={<Globe size={14} />} label="Adres"><span style={{ fontSize: '0.72rem', color: C.muted }}>{ctx.url}</span></InfoRow>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <button type="button" data-admin-ticket-remote onClick={() => void inviteUser(ticket.user_id)} style={btn('primary', true)}>
                    <MonitorSmartphone size={14} /> Online destek başlat
                </button>
                <button type="button" onClick={() => go('users', { userId: ticket.user_id })} style={btn('secondary', true)}>
                    <User size={14} /> Kullanıcı profili
                </button>
            </div>
        </div>
    );

    return (
        <div data-admin-conversation={ticket.id} style={{ display: 'flex', height: '100%', minHeight: 0 }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
                    {onBack && <button type="button" onClick={onBack} style={{ ...btn('ghost', true), padding: 6 }} aria-label="Listeye dön"><ArrowLeft size={16} /></button>}
                    <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>#{ticket.id} · {ticket.subject}</div>
                        <div style={{ fontSize: '0.72rem', color: C.dim }}>{displayName(u)} · açıldı {fmtDateTime(ticket.created_at)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 10, background: C.soft, border: `1px solid ${C.border}` }}>
                        {(['open', 'answered', 'closed'] as TicketStatus[]).map(s => (
                            <button key={s} type="button" data-admin-ticket-status={s} onClick={() => void setStatus(s)}
                                style={{
                                    padding: '4px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.74rem', fontWeight: 700,
                                    background: ticket.status === s ? TICKET_STATUS[s].color : 'transparent', color: ticket.status === s ? 'white' : C.muted,
                                }}>
                                {TICKET_STATUS[s].label}
                            </button>
                        ))}
                    </div>
                </div>
                <div ref={scrollRef} className="adm-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(ticket.messages ?? []).map(m => {
                        const mine = m.sender === 'admin';
                        return (
                            <div key={m.id} data-admin-message={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: 'min(560px, 80%)', padding: '9px 12px', borderRadius: 14, fontSize: '0.86rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                    background: mine ? GRADIENT : '#eef0fb', border: mine ? 'none' : `1px solid ${C.border}`,
                                    color: mine ? 'white' : C.text, borderBottomRightRadius: mine ? 4 : 14, borderBottomLeftRadius: mine ? 14 : 4,
                                }}>
                                    {m.body}
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center', marginTop: 4, fontSize: '0.66rem', opacity: 0.75 }}>
                                        {m.via === 'telegram' && <span data-admin-via-telegram style={{ padding: '0 6px', borderRadius: 999, background: C.sky, color: 'white', fontWeight: 700 }}>Telegram</span>}
                                        <span title={fmtDateTime(m.created_at)}>{mine ? 'Destek' : displayName(u)} · {fmtTime(m.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {!ticket.messages?.length && <Empty>Mesaj yok.</Empty>}
                </div>
                <div style={{ padding: 12, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <textarea data-admin-reply value={reply} onChange={e => setReply(e.target.value)} rows={3}
                        placeholder={ticket.status === 'closed' ? 'Talep kapalı; yanıt yazarsanız kullanıcıya yine iletilir.' : 'Yanıtınızı yazın… (Ctrl+Enter ile gönder)'}
                        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void send(); } }}
                        style={{ ...inputStyle, resize: 'vertical', minHeight: 64, maxHeight: 240, lineHeight: 1.45 }} />
                    <button type="button" data-admin-reply-send disabled={sending || !reply.trim()} onClick={() => void send()} style={{ ...btn('primary'), opacity: sending || !reply.trim() ? 0.6 : 1 }}>
                        {sending ? <Spinner color="white" size={15} /> : <Send size={15} />} Gönder
                    </button>
                </div>
            </div>
            {wide ? (
                <aside className="adm-scroll" style={{ width: 270, flexShrink: 0, borderLeft: `1px solid ${C.border}`, padding: 16, overflowY: 'auto' }}>{info}</aside>
            ) : null}
            {!wide && (
                <details style={{ position: 'absolute', right: 16, top: 70, zIndex: 5, background: C.cardSolid, border: `1px solid ${C.borderStrong}`, borderRadius: 12, padding: '6px 10px', maxWidth: 280 }}>
                    <summary style={{ cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: C.muted }}>Kullanıcı bilgisi · {fmtRelative(ticket.last_message_at, now)}</summary>
                    <div style={{ paddingTop: 10 }}>{info}</div>
                </details>
            )}
        </div>
    );
};

export const Tickets: React.FC = () => {
    const { tickets, ticketsError, reloadTickets, focus, clearFocus } = useAdmin();
    const [filter, setFilter] = useState<Filter>('open');
    const [selected, setSelected] = useState<number | null>(focus?.ticketId ?? null);
    const [refreshing, setRefreshing] = useState(false);
    const twoPane = useMediaQuery('(min-width: 900px)');
    const now = useNow(30000);

    useEffect(() => {
        if (!focus?.ticketId) return;
        clearFocus();
    }, [focus, clearFocus]);

    const counts = useMemo(() => {
        const c: Record<Filter, { total: number; unread: number }> = {
            open: { total: 0, unread: 0 }, answered: { total: 0, unread: 0 }, closed: { total: 0, unread: 0 }, all: { total: 0, unread: 0 },
        };
        for (const t of tickets) {
            c[t.status].total++;
            c[t.status].unread += t.unread_for_admin ? 1 : 0;
            c.all.total++;
            c.all.unread += t.unread_for_admin ? 1 : 0;
        }
        return c;
    }, [tickets]);

    const list = useMemo(() => tickets
        .filter(t => filter === 'all' || t.status === filter)
        .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at)), [tickets, filter]);

    const refresh = async () => {
        setRefreshing(true);
        await reloadTickets();
        setRefreshing(false);
    };

    const listPane = (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
            <div style={{ display: 'flex', gap: 4, padding: 10, borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
                {FILTERS.map(f => (
                    <button key={f.id} type="button" data-admin-ticket-filter={f.id} onClick={() => setFilter(f.id)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 9, border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700,
                            background: filter === f.id ? 'rgba(99,102,241,0.12)' : 'transparent', color: filter === f.id ? '#4338ca' : C.muted,
                        }}>
                        {f.label} <span style={{ color: C.dim, fontWeight: 600 }}>{counts[f.id].total}</span>
                        <CountBadge n={counts[f.id].unread} />
                    </button>
                ))}
                <button type="button" onClick={() => void refresh()} title="Yenile" style={{ ...btn('ghost', true), marginLeft: 'auto', padding: 6, border: 'none' }}>
                    {refreshing ? <Spinner size={14} /> : <RefreshCw size={14} />}
                </button>
            </div>
            <div className="adm-scroll" style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
                {ticketsError && <div style={{ padding: 8 }}><ErrorBox>{ticketsError}</ErrorBox></div>}
                {list.length === 0 && !ticketsError && <Empty>Bu durumda talep yok.</Empty>}
                {list.map(t => {
                    const active = t.id === selected;
                    return (
                        <button key={t.id} type="button" data-admin-ticket={t.id} onClick={() => setSelected(t.id)} className={active ? undefined : 'adm-nav-btn'}
                            style={{
                                display: 'flex', gap: 10, width: '100%', padding: '10px 10px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left',
                                fontFamily: 'inherit', color: C.text, background: active ? 'rgba(99,102,241,0.12)' : 'transparent', boxShadow: active ? `inset 3px 0 0 ${C.accent}` : 'none', marginBottom: 2,
                            }}>
                            <Avatar name={displayName(t.user)} size={32} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <span style={{ flex: 1, fontWeight: t.unread_for_admin ? 800 : 600, fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</span>
                                    <span style={{ fontSize: '0.68rem', color: C.dim, whiteSpace: 'nowrap' }}>{fmtRelative(t.last_message_at, now)}</span>
                                </div>
                                <div style={{ fontSize: '0.74rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                                    {displayName(t.user)}{t.last_message ? ` — ${t.last_message}` : ''}
                                </div>
                                <div style={{ display: 'flex', gap: 6, marginTop: 5, alignItems: 'center' }}>
                                    <Badge color={TICKET_STATUS[t.status].color}>{TICKET_STATUS[t.status].label}</Badge>
                                    <CountBadge n={t.unread_for_admin} />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div data-admin-section="tickets" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <SectionHeader icon={<LifeBuoy size={20} />} title="Destek talepleri" subtitle="Kullanıcı talepleri canlı güncellenir. Telegram'dan verilen yanıtlar da burada görünür." />
            <div style={{
                flex: 1, minHeight: 480, height: 'calc(100vh - 210px)', display: 'flex', borderRadius: 16, overflow: 'hidden', position: 'relative',
                background: C.card, border: `1px solid ${C.border}`,
            }}>
                {(twoPane || selected === null) && (
                    <div style={{ width: twoPane ? 340 : '100%', flexShrink: 0, borderRight: twoPane ? `1px solid ${C.border}` : 'none' }}>{listPane}</div>
                )}
                {selected !== null ? (
                    <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                        <Conversation key={selected} ticketId={selected} onBack={twoPane ? undefined : () => setSelected(null)} />
                    </div>
                ) : twoPane && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim, fontSize: '0.88rem' }}>
                        Görüntülemek için soldan bir talep seçin.
                    </div>
                )}
            </div>
        </div>
    );
};
