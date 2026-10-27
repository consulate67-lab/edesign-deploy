import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Eye, History, MonitorSmartphone, PlugZap, RefreshCw, Send } from 'lucide-react';
import { adminApi } from '../adminApi';
import { useAdmin } from '../adminContext';
import type { AdminDesignWork, PresenceEntry, RemoteSession } from '../contracts';
import { C, REMOTE_STATUS, btn, displayName, errorText, fmtDateTime, fmtDuration, fmtRelative, viewLabel } from '../format';
import { useNow } from '../hooks';
import { Avatar, Badge, Card, CountBadge, Dot, Empty, Modal, SectionHeader, Spinner } from '../ui';
import { transformXmlWithXslt } from '../../xsltTransformer';

const SessionRow: React.FC<{ s: RemoteSession; now: number; onConnect?: () => void }> = ({ s, now, onConnect }) => {
    const st = REMOTE_STATUS[s.status];
    return (
        <div data-admin-session={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: C.soft, border: `1px solid ${st.color}40` }}>
            <Avatar name={displayName(s.user)} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName(s.user)}</span>
                    <Badge color={st.color}>{st.label}</Badge>
                    <span style={{ fontSize: '0.68rem', color: C.dim }}>{s.initiated_by === 'user' ? 'Kullanıcı istedi' : 'Davet'}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: C.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.status === 'active' && s.started_at ? `${fmtDuration(s.started_at, now)} süredir bağlı` : s.status === 'requested' ? `${fmtRelative(s.created_at, now)}` : fmtDateTime(s.ended_at ?? s.created_at)}
                    {s.ticket_id ? ` · Talep #${s.ticket_id}` : ''}
                    {s.note ? ` · “${s.note}”` : ''}
                </div>
            </div>
            {onConnect && (
                <button type="button" data-admin-connect={s.id} onClick={onConnect} style={btn(s.status === 'active' ? 'secondary' : 'primary', true)}>
                    <MonitorSmartphone size={14} /> {s.status === 'active' ? 'Ekrana dön' : s.initiated_by === 'admin' ? 'Bekle' : 'Bağlan'}
                </button>
            )}
        </div>
    );
};

const PreviewPane: React.FC<{ label: string; xslt: string; xml: string }> = ({ label, xslt, xml }) => {
    const html = useMemo(() => {
        if (!xslt.trim()) return '<p style="padding:16px;font-family:sans-serif;color:#64748b">İçerik yok.</p>';
        if (!xml.trim()) {
            return `<pre style="margin:0;padding:12px;font:12px/1.45 ui-monospace,monospace;white-space:pre-wrap;word-break:break-word">${xslt.slice(0, 12000).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!))}${xslt.length > 12000 ? '\n…' : ''}</pre>`;
        }
        try {
            return transformXmlWithXslt(xml, xslt);
        } catch (e) {
            return `<p style="padding:16px;font-family:sans-serif;color:#b91c1c">Önizleme oluşturulamadı: ${String(e instanceof Error ? e.message : e)}</p>`;
        }
    }, [xslt, xml]);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
            <div style={{ padding: '8px 12px', fontSize: '0.78rem', fontWeight: 700, color: C.text, background: C.soft, borderBottom: `1px solid ${C.border}` }}>{label}</div>
            <iframe title={label} srcDoc={html} sandbox="" style={{ flex: 1, width: '100%', minHeight: 360, border: 0, background: '#fff' }} />
        </div>
    );
};

const DesignWorkBody: React.FC<{ query: { designId?: number; userId?: number } }> = ({ query }) => {
    const [work, setWork] = useState<AdminDesignWork | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let cancelled = false;
        void adminApi.designWork(query)
            .then((r) => { if (!cancelled) { setWork(r); setBusy(false); } })
            .catch((e) => { if (!cancelled) { setError(errorText(e)); setBusy(false); } });
        return () => { cancelled = true; };
    }, [query]);

    if (busy) return <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}><Spinner size={22} /></div>;
    if (error) return <div style={{ padding: 16, color: C.redText, fontSize: '0.85rem' }}>{error}</div>;
    if (!work) return null;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.78rem', color: C.muted, lineHeight: 1.5 }}>
                    {displayName(work.user)}
                    {work.user.company_name ? ` · ${work.user.company_name}` : ''}
                    {' · '}{work.moduleId}
                    {' · '}son kayıt {fmtDateTime(work.updatedAt)}
                    {work.paid ? ' · onaylı' : ' · taslak'}
                    {work.presence ? ` · şu an ${viewLabel(work.presence.view)}` : ''}
                </div>
                <Badge color={work.changed ? C.amber : C.green}>
                    {work.changed ? 'Son kayıt varsayılandan farklı' : 'Son kayıt varsayılanla aynı'}
                </Badge>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>
                <PreviewPane label="Varsayılan (ilk şablon)" xslt={work.baseXslt} xml={work.xml} />
                <PreviewPane label="Son kayıt" xslt={work.savedXslt} xml={work.xml} />
            </div>
        </div>
    );
};

const DesignWorkModal: React.FC<{ query: { designId?: number; userId?: number }; onClose: () => void }> = ({ query, onClose }) => (
    <Modal title="Tasarım karşılaştırması" onClose={onClose} width={1100} height="85vh">
        <DesignWorkBody key={`${query.designId ?? ''}-${query.userId ?? ''}`} query={query} />
    </Modal>
);

export const RemoteSupport: React.FC = () => {
    const { presence, remote, reloadRemote, connect, inviteUser, rtStatus } = useAdmin();
    const [inviting, setInviting] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [designQuery, setDesignQuery] = useState<{ designId?: number; userId?: number } | null>(null);
    const now = useNow(15000);

    const pending = remote.filter(s => s.status === 'requested');
    const active = remote.filter(s => s.status === 'active');
    const recent = remote.filter(s => s.status === 'ended' || s.status === 'declined').slice(0, 20);
    const busyUsers = new Set([...pending, ...active].map(s => s.user_id));

    const invite = async (userId: number) => {
        setInviting(userId);
        await inviteUser(userId);
        setInviting(null);
    };

    const openDesign = (p: PresenceEntry) => {
        if (p.design?.id) setDesignQuery({ designId: p.design.id });
        else setDesignQuery({ userId: p.userId });
    };

    return (
        <div data-admin-section="remote">
            <SectionHeader icon={<MonitorSmartphone size={20} />} title="Online destek"
                subtitle="Çevrimiçi kullanıcının hangi tasarımda olduğunu ve varsayılan / son kayıt halini görebilirsiniz. Ekran paylaşımı yalnızca davet ve onayla açılır."
                actions={<button type="button" style={btn('ghost', true)} onClick={async () => { setRefreshing(true); await reloadRemote(); setRefreshing(false); }}>
                    {refreshing ? <Spinner size={14} /> : <RefreshCw size={14} />} Yenile
                </button>} />
            {rtStatus !== 'open' && (
                <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: C.amberText, fontSize: '0.82rem' }}>
                    {rtStatus === 'connecting' ? 'Gerçek zamanlı sunucuya bağlanılıyor…' : 'Gerçek zamanlı bağlantı kurulamadı; çevrimiçi listesi ve ortak ekran çalışmaz. Bağlantı otomatik yeniden denenir.'}
                </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                <Card title={<><Activity size={16} color={C.green} /> Çevrimiçi kullanıcılar <Badge color={C.green}>{presence.length}</Badge></>}>
                    {presence.length === 0 ? <Empty>Şu an çevrimiçi kullanıcı yok.</Empty> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {presence.map(p => (
                                <div key={p.userId} data-admin-presence={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 12, background: C.soft }}>
                                    <Avatar name={displayName(p)} size={32} online />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {displayName(p)}{p.company_name && <span style={{ color: C.dim, fontWeight: 500 }}> · {p.company_name}</span>}
                                        </div>
                                        <div style={{ fontSize: '0.73rem', color: C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Dot color={C.green} size={6} /> {viewLabel(p.view)}
                                            {p.design && <span style={{ color: C.text }}> · {p.design.name}{p.design.moduleId ? ` (${p.design.moduleId})` : ''}</span>}
                                        </div>
                                        <div style={{ fontSize: '0.68rem', color: C.dim }}>
                                            {fmtDuration(p.connectedAt, now)} süredir çevrimiçi · son hareket {fmtRelative(p.lastActiveAt, now)}
                                        </div>
                                    </div>
                                    <button type="button" data-admin-presence-design={p.userId}
                                        onClick={() => openDesign(p)} style={btn('ghost', true)}
                                        title="Varsayılan şablon ve son kayıt (ekran izlenmez)">
                                        <Eye size={13} /> Tasarım
                                    </button>
                                    <button type="button" data-admin-presence-invite={p.userId} disabled={inviting === p.userId || busyUsers.has(p.userId)}
                                        onClick={() => void invite(p.userId)} style={{ ...btn('secondary', true), opacity: busyUsers.has(p.userId) ? 0.5 : 1 }}
                                        title={busyUsers.has(p.userId) ? 'Bu kullanıcıyla açık bir oturum var' : 'Ekran paylaşımı daveti gönder'}>
                                        {inviting === p.userId ? <Spinner size={13} /> : <Send size={13} />} Davet et
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card title={<><PlugZap size={16} color={C.amber} /> Bekleyen ve aktif oturumlar <CountBadge n={pending.filter(s => s.initiated_by === 'user').length} /></>}>
                        {pending.length + active.length === 0 ? <Empty>Bekleyen ya da aktif oturum yok.</Empty> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[...active, ...pending].map(s => <SessionRow key={s.id} s={s} now={now} onConnect={() => connect(s)} />)}
                            </div>
                        )}
                    </Card>
                    <Card title={<><History size={16} color={C.muted} /> Son oturumlar</>}>
                        {recent.length === 0 ? <Empty>Geçmiş oturum yok.</Empty> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {recent.map(s => <SessionRow key={s.id} s={s} now={now} />)}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            {designQuery && <DesignWorkModal query={designQuery} onClose={() => setDesignQuery(null)} />}
        </div>
    );
};
