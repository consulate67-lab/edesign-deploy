import React, { useCallback, useEffect, useState } from 'react';
import {
    Activity, Banknote, FileStack, Images, LayoutDashboard, LifeBuoy, MonitorSmartphone, PlugZap, Receipt, RefreshCw, UserPlus, Users, Wifi, BadgeCheck,
} from 'lucide-react';
import { adminApi } from '../adminApi';
import { useAdmin } from '../adminContext';
import type { AdminStats } from '../contracts';
import { C, TICKET_STATUS, btn, displayName, errorText, fmtMoney, fmtNumber, fmtRelative, fmtDuration, viewLabel } from '../format';
import { useNow } from '../hooks';
import { Avatar, Badge, Card, CountBadge, Empty, ErrorBox, SectionHeader, Spinner } from '../ui';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; color: string; onClick?: () => void; hint?: string }> = ({ icon, label, value, color, onClick, hint }) => (
    <div role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onClick={onClick} title={hint}
        onKeyDown={e => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
        data-admin-stat={label}
        style={{
            position: 'relative', overflow: 'hidden', padding: '16px 16px 14px', borderRadius: 16, cursor: onClick ? 'pointer' : 'default',
            background: `linear-gradient(160deg, #ffffff 55%, ${color}14)`, border: `1px solid ${color}40`, borderTop: `3px solid ${color}`,
            boxShadow: `0 6px 20px ${color}1f`, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0,
        }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, borderRadius: 999, background: `${color}1f` }} />
        <div style={{ width: 34, height: 34, borderRadius: 10, background: color, color: 'white', boxShadow: `0 6px 14px ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <div style={{ fontSize: '1.55rem', fontWeight: 800, color: C.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        <div style={{ fontSize: '0.76rem', color: C.muted, fontWeight: 600 }}>{label}</div>
    </div>
);

export const Overview: React.FC = () => {
    const { tickets, presence, remote, go, connect, ticketEvent } = useAdmin();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const now = useNow(30000);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setStats(await adminApi.stats());
            setError(null);
        } catch (e) {
            setError(errorText(e));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let alive = true;
        const run = () => adminApi.stats().then(s => { if (alive) { setStats(s); setError(null); } }).catch(e => { if (alive) setError(errorText(e)); });
        void run();
        const id = setInterval(run, 30000);
        return () => { alive = false; clearInterval(id); };
    }, [ticketEvent, remote.length]);

    const recent = [...tickets].sort((a, b) => b.last_message_at.localeCompare(a.last_message_at)).slice(0, 6);
    const pending = remote.filter(s => s.status === 'requested' && s.initiated_by === 'user');
    const active = remote.filter(s => s.status === 'active');

    return (
        <div data-admin-section="overview">
            <SectionHeader icon={<LayoutDashboard size={20} />} title="Genel bakış" subtitle="Kullanıcılar, tasarımlar, gelir ve destek durumunun özeti."
                actions={<button type="button" onClick={() => void load()} style={btn('ghost', true)} disabled={loading}>{loading ? <Spinner size={14} /> : <RefreshCw size={14} />} Yenile</button>} />
            {error && <div style={{ marginBottom: 16 }}><ErrorBox>İstatistikler alınamadı: {error}</ErrorBox></div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
                <StatCard icon={<Users size={18} />} label="Kullanıcılar" value={stats ? fmtNumber(stats.users) : '…'} color="#6366f1" onClick={() => go('users')} />
                <StatCard icon={<UserPlus size={18} />} label="Son 7 gün yeni" value={stats ? fmtNumber(stats.newUsers7d) : '…'} color="#8b5cf6" />
                <StatCard icon={<FileStack size={18} />} label="Tasarımlar" value={stats ? fmtNumber(stats.designs) : '…'} color="#0ea5e9" />
                <StatCard icon={<BadgeCheck size={18} />} label="Ücretli tasarımlar" value={stats ? fmtNumber(stats.paidDesigns) : '…'} color="#14b8a6" />
                <StatCard icon={<LifeBuoy size={18} />} label="Açık talepler" value={stats ? fmtNumber(stats.openTickets) : '…'} color="#f59e0b" onClick={() => go('tickets')} />
                <StatCard icon={<Wifi size={18} />} label="Çevrimiçi" value={stats ? fmtNumber(Math.max(stats.onlineUsers, presence.length)) : '…'} color="#10b981" onClick={() => go('remote')} />
                <StatCard icon={<PlugZap size={18} />} label="Bekleyen online destek" value={stats ? fmtNumber(Math.max(stats.pendingRemote, pending.length)) : '…'} color="#ef4444" onClick={() => go('remote')} />
                <StatCard icon={<Banknote size={18} />} label="Toplam gelir" value={stats ? fmtMoney(stats.revenueTotal) : '…'} color="#22c55e" />
                <StatCard icon={<Receipt size={18} />} label="Kesime hazır fatura" value={stats ? fmtNumber(stats.invoicesReady) : '…'} color="#d946ef" onClick={() => go('invoices')} hint="Ödemesi alınmış, faturası henüz kesilmemiş firmalar" />
                <StatCard icon={<Images size={18} />} label="Galeri tasarımları" value={stats ? fmtNumber(stats.galleryDesigns) : '…'} color="#ec4899" onClick={() => go('gallery')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                <Card title={<><PlugZap size={16} color={C.red} /> Bekleyen online destek {pending.length > 0 && <CountBadge n={pending.length} />}</>}
                    actions={<button type="button" style={btn('ghost', true)} onClick={() => go('remote')}>Tümü</button>}>
                    {pending.length === 0 && active.length === 0 ? <Empty>Bekleyen istek yok.</Empty> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[...pending, ...active].map(s => (
                                <div key={s.id} data-admin-pending={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: s.status === 'active' ? '#ecfdf5' : '#fffbeb', border: `1px solid ${s.status === 'active' ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.45)'}` }}>
                                    <Avatar name={displayName(s.user)} size={30} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName(s.user)}</div>
                                        <div style={{ fontSize: '0.74rem', color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {s.status === 'active' ? 'Bağlı' : `${fmtRelative(s.created_at, now)} istedi`}{s.note ? ` · ${s.note}` : ''}
                                        </div>
                                    </div>
                                    <button type="button" data-admin-connect={s.id} style={btn(s.status === 'active' ? 'secondary' : 'primary', true)} onClick={() => connect(s)}>
                                        <MonitorSmartphone size={14} /> {s.status === 'active' ? 'Ekrana dön' : 'Bağlan'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card title={<><LifeBuoy size={16} color={C.amber} /> Son destek talepleri</>}
                    actions={<button type="button" style={btn('ghost', true)} onClick={() => go('tickets')}>Tümü</button>}>
                    {recent.length === 0 ? <Empty>Henüz destek talebi yok.</Empty> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {recent.map(t => (
                                <button key={t.id} type="button" onClick={() => go('tickets', { ticketId: t.id })} className="adm-nav-btn"
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: C.text }}>
                                    <Avatar name={displayName(t.user)} size={28} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subject}</div>
                                        <div style={{ fontSize: '0.72rem', color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName(t.user)} · {fmtRelative(t.last_message_at, now)}</div>
                                    </div>
                                    <CountBadge n={t.unread_for_admin} />
                                    <Badge color={TICKET_STATUS[t.status].color}>{TICKET_STATUS[t.status].label}</Badge>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                <Card title={<><Activity size={16} color={C.green} /> Çevrimiçi kullanıcılar <Badge color={C.green}>{presence.length}</Badge></>}
                    actions={<button type="button" style={btn('ghost', true)} onClick={() => go('remote')}>Online destek</button>}>
                    {presence.length === 0 ? <Empty>Şu an çevrimiçi kullanıcı yok.</Empty> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }} className="adm-scroll">
                            {presence.map(p => (
                                <div key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px' }}>
                                    <Avatar name={displayName(p)} size={28} online />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName(p)}{p.company_name ? <span style={{ color: C.dim, fontWeight: 500 }}> · {p.company_name}</span> : null}</div>
                                        <div style={{ fontSize: '0.72rem', color: C.muted }}>{viewLabel(p.view)} · {fmtDuration(p.connectedAt, now)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
