import React, { useState } from 'react';
import { Activity, History, MonitorSmartphone, PlugZap, RefreshCw, Send } from 'lucide-react';
import { useAdmin } from '../adminContext';
import type { RemoteSession } from '../contracts';
import { C, REMOTE_STATUS, btn, displayName, fmtDateTime, fmtDuration, fmtRelative, viewLabel } from '../format';
import { useNow } from '../hooks';
import { Avatar, Badge, Card, CountBadge, Dot, Empty, SectionHeader, Spinner } from '../ui';

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

export const RemoteSupport: React.FC = () => {
    const { presence, remote, reloadRemote, connect, inviteUser, rtStatus } = useAdmin();
    const [inviting, setInviting] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);
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

    return (
        <div data-admin-section="remote">
            <SectionHeader icon={<MonitorSmartphone size={20} />} title="Online destek"
                subtitle="Kullanıcının ekranını onayıyla canlı görün, gerekirse onun adına tıklayıp yazın. Şifre alanları kullanıcı tarafında gizlenir."
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
                                        </div>
                                        <div style={{ fontSize: '0.68rem', color: C.dim }}>
                                            {fmtDuration(p.connectedAt, now)} süredir çevrimiçi · son hareket {fmtRelative(p.lastActiveAt, now)}
                                        </div>
                                    </div>
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
        </div>
    );
};
