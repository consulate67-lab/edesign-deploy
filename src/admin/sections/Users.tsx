import React, { useEffect, useState } from 'react';
import { Building2, CreditCard, FileStack, LifeBuoy, Mail, MonitorSmartphone, Phone, RefreshCw, Search, Users as UsersIcon, Wallet, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { adminApi } from '../adminApi';
import { useAdmin } from '../adminContext';
import type { AdminUserDetail, AdminUserRow } from '../contracts';
import {
    C, TICKET_STATUS, btn, displayName, errorText, fmtDate, fmtDateTime, fmtMoney, fmtNumber, fmtRelative, inputStyle, labelStyle, viewLabel,
} from '../format';
import { useDebounced, useNow } from '../hooks';
import { Avatar, Badge, Card, Dot, Drawer, Empty, ErrorBox, SectionHeader, Spinner } from '../ui';

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
    completed: { label: 'Tamamlandı', color: C.green },
    success: { label: 'Tamamlandı', color: C.green },
    pending: { label: 'Bekliyor', color: C.amber },
    failed: { label: 'Başarısız', color: C.red },
};

const UserDetail: React.FC<{ userId: number; onClose: () => void; onChanged: (row: AdminUserRow) => void }> = ({ userId, onClose, onChanged }) => {
    const { presenceById, inviteUser, go } = useAdmin();
    const pushToast = useUiStore(s => s.pushToast);
    const [user, setUser] = useState<AdminUserDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [delta, setDelta] = useState('1');
    const [busy, setBusy] = useState(false);
    const now = useNow(30000);

    useEffect(() => {
        let alive = true;
        adminApi.user(userId).then(u => { if (alive) setUser(u); }).catch(e => { if (alive) setError(errorText(e)); });
        return () => { alive = false; };
    }, [userId]);

    const changeCredits = async (sign: 1 | -1) => {
        const n = Math.abs(parseInt(delta, 10));
        if (!n) return;
        setBusy(true);
        try {
            const row = await adminApi.changeCredits(userId, sign * n);
            setUser(u => u && { ...u, ...row });
            onChanged(row);
            pushToast({ kind: 'success', title: sign > 0 ? `${n} tasarım hakkı eklendi` : `${n} tasarım hakkı düşüldü`, description: `Yeni bakiye: ${row.credits}`, ttl: 4000 });
        } catch (e) {
            pushToast({ kind: 'error', title: 'Kredi güncellenemedi', description: errorText(e), ttl: 6000 });
        } finally {
            setBusy(false);
        }
    };

    const p = presenceById.get(userId);
    const online = !!p || !!user?.online;

    return (
        <Drawer onClose={onClose} width={620} title={user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <Avatar name={displayName(user)} size={40} online={online} />
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName(user)}</div>
                    <div style={{ fontSize: '0.76rem', color: C.muted }}>
                        {online ? <span style={{ color: C.greenText }}>Çevrimiçi · {viewLabel(p?.view ?? user.current_view)}</span> : `Son görülme: ${fmtRelative(user.last_seen_at, now)}`}
                    </div>
                </div>
            </div>
        ) : 'Kullanıcı'}>
            {error && <ErrorBox>{error}</ErrorBox>}
            {!user && !error && <div style={{ display: 'flex', gap: 8, color: C.muted }}><Spinner /> Yükleniyor…</div>}
            {user && (
                <div data-admin-user-detail={user.id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                        {[
                            { icon: <Mail size={15} />, label: 'E-posta', value: <a href={`mailto:${user.username}`} style={{ color: C.accentText }}>{user.username}</a> },
                            { icon: <Phone size={15} />, label: 'Telefon', value: user.phone_number ? <a href={`tel:${user.phone_number.replace(/[^\d+]/g, '')}`} style={{ color: C.accentText }}>{user.phone_number}</a> : '—' },
                            { icon: <Building2 size={15} />, label: 'Firma', value: user.company_name || '—' },
                            { icon: <CreditCard size={15} />, label: 'Tasarım hakkı', value: <b>{fmtNumber(user.credits)}</b> },
                            { icon: <FileStack size={15} />, label: 'Tasarım / ücretli', value: `${user.design_count} / ${user.paid_design_count}` },
                            { icon: <Wallet size={15} />, label: 'Ödeme toplamı', value: fmtMoney(user.payment_total) },
                        ].map(f => (
                            <div key={f.label} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 12, background: C.soft, border: `1px solid ${C.border}` }}>
                                <span style={{ color: C.accent, display: 'flex' }}>{f.icon}</span>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '0.68rem', color: C.dim, fontWeight: 700 }}>{f.label}</div>
                                    <div style={{ fontSize: '0.86rem', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: C.dim }}>
                        Kayıt: {fmtDateTime(user.created_at)} · Rol: {user.role} · Ücretsiz tasarım {user.free_design_used ? 'kullanıldı' : 'kullanılmadı'}
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', padding: 14, borderRadius: 14, background: 'rgba(99, 102, 241, 0.07)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <div style={{ width: 110 }}>
                            <label style={labelStyle}>Kredi ekle / çıkar</label>
                            <input data-admin-credit-delta type="number" min={1} value={delta} onChange={e => setDelta(e.target.value)} style={inputStyle} />
                        </div>
                        <button type="button" data-admin-credit-add disabled={busy} onClick={() => void changeCredits(1)} style={btn('success')}>+ Ekle</button>
                        <button type="button" data-admin-credit-sub disabled={busy} onClick={() => void changeCredits(-1)} style={btn('danger')}>− Çıkar</button>
                        <div style={{ flex: 1 }} />
                        <button type="button" data-admin-invite={user.id} onClick={() => void inviteUser(user.id)} style={btn('primary')} title={online ? 'Kullanıcıya ekran paylaşımı daveti gönderilir' : 'Kullanıcı çevrimdışı; davet bağlandığında görünür'}>
                            <MonitorSmartphone size={15} /> Online destek davet et
                        </button>
                    </div>

                    <Card title={<><FileStack size={15} /> Tasarımlar ({user.designs.length})</>} pad>
                        {user.designs.length === 0 ? <Empty>Tasarım yok.</Empty> : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="adm-table">
                                    <thead><tr><th>Ad</th><th>Modül</th><th>Durum</th><th>İndirme</th><th>Güncelleme</th></tr></thead>
                                    <tbody>
                                        {user.designs.map(d => (
                                            <tr key={d.id}>
                                                <td>{d.name}</td>
                                                <td style={{ color: C.muted }}>{d.module_id}</td>
                                                <td>{d.paid ? <Badge color={C.green}>Ücretli</Badge> : <Badge color={C.dim}>{d.status}</Badge>}</td>
                                                <td>{d.download_count}</td>
                                                <td style={{ color: C.muted, whiteSpace: 'nowrap' }}>{fmtDate(d.updated_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    <Card title={<><Wallet size={15} /> Ödemeler ({user.payments.length})</>}>
                        {user.payments.length === 0 ? <Empty>Ödeme yok.</Empty> : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="adm-table">
                                    <thead><tr><th>Paket</th><th>Tutar</th><th>Durum</th><th>Tarih</th></tr></thead>
                                    <tbody>
                                        {user.payments.map(pay => {
                                            const st = PAYMENT_STATUS[pay.status] ?? { label: pay.status, color: C.dim };
                                            return (
                                                <tr key={pay.id}>
                                                    <td>{pay.plan_id}</td>
                                                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{pay.currency === 'TRY' || !pay.currency ? fmtMoney(pay.amount) : `${pay.amount} ${pay.currency}`}</td>
                                                    <td><Badge color={st.color}>{st.label}</Badge></td>
                                                    <td style={{ color: C.muted, whiteSpace: 'nowrap' }}>{fmtDateTime(pay.completed_at ?? pay.created_at)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    <Card title={<><LifeBuoy size={15} /> Destek talepleri ({user.tickets.length})</>}>
                        {user.tickets.length === 0 ? <Empty>Destek talebi yok.</Empty> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {user.tickets.map(t => (
                                    <button key={t.id} type="button" className="adm-nav-btn" onClick={() => go('tickets', { ticketId: t.id })}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: C.text }}>
                                        <span style={{ flex: 1, minWidth: 0, fontSize: '0.84rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>#{t.id} · {t.subject}</span>
                                        <span style={{ fontSize: '0.72rem', color: C.dim }}>{fmtRelative(t.last_message_at, now)}</span>
                                        <Badge color={TICKET_STATUS[t.status].color}>{TICKET_STATUS[t.status].label}</Badge>
                                    </button>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </Drawer>
    );
};

export const Users: React.FC = () => {
    const { presenceById, focus, clearFocus } = useAdmin();
    const [query, setQuery] = useState('');
    const q = useDebounced(query.trim(), 300);
    const [rows, setRows] = useState<AdminUserRow[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [selected, setSelected] = useState<number | null>(focus?.userId ?? null);
    const [onlyOnline, setOnlyOnline] = useState(false);
    const now = useNow(30000);

    useEffect(() => { if (focus?.userId) clearFocus(); }, [focus, clearFocus]);

    useEffect(() => {
        let alive = true;
        adminApi.users(q || undefined)
            .then(r => { if (alive) { setRows(r); setError(null); } })
            .catch(e => { if (alive) setError(errorText(e)); });
        return () => { alive = false; };
    }, [q, reloadKey]);

    const list = (rows ?? []).filter(u => !onlyOnline || presenceById.has(u.id) || u.online);
    const onlineCount = (rows ?? []).filter(u => presenceById.has(u.id) || u.online).length;

    return (
        <div data-admin-section="users">
            <SectionHeader icon={<UsersIcon size={20} />} title="Kullanıcılar" subtitle="Kayıtlı kullanıcılar, kredileri, tasarım ve ödeme özetleri. Ayrıntı için satıra tıklayın." />
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 460 }}>
                    <Search size={15} color={C.dim} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input data-admin-user-search value={query} onChange={e => setQuery(e.target.value)} placeholder="Ad, firma, e-posta veya telefon ara"
                        style={{ ...inputStyle, paddingLeft: 36, borderRadius: 999 }} />
                    {query && (
                        <button type="button" aria-label="Aramayı temizle" onClick={() => setQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex' }}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: C.muted, cursor: 'pointer' }}>
                    <input type="checkbox" checked={onlyOnline} onChange={e => setOnlyOnline(e.target.checked)} /> Yalnızca çevrimiçi ({onlineCount})
                </label>
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: C.muted }}>{rows ? `${list.length} kullanıcı` : ''}</span>
                <button type="button" onClick={() => setReloadKey(k => k + 1)} style={btn('ghost', true)}><RefreshCw size={14} /> Yenile</button>
            </div>
            {error && <div style={{ marginBottom: 12 }}><ErrorBox>{error}</ErrorBox></div>}
            <Card pad={false} style={{ overflow: 'hidden' }}>
                <div className="adm-scroll" style={{ overflow: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                    <table className="adm-table" data-admin-users-table>
                        <thead>
                            <tr>
                                <th>Ad</th><th>Firma</th><th>E-posta</th><th>Telefon</th><th style={{ textAlign: 'right' }}>Kredi</th>
                                <th style={{ textAlign: 'right' }}>Tasarım / ücretli</th><th style={{ textAlign: 'right' }}>Ödeme</th><th style={{ textAlign: 'right' }}>Talep</th>
                                <th>Kayıt</th><th>Son görülme</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!rows && !error && <tr><td colSpan={10}><div style={{ display: 'flex', gap: 8, color: C.muted, padding: 10 }}><Spinner /> Yükleniyor…</div></td></tr>}
                            {rows && list.length === 0 && <tr><td colSpan={10}><Empty>{q ? 'Aramayla eşleşen kullanıcı yok.' : 'Kullanıcı yok.'}</Empty></td></tr>}
                            {list.map(u => {
                                const p = presenceById.get(u.id);
                                const online = !!p || u.online;
                                return (
                                    <tr key={u.id} className="adm-click" data-admin-user-row={u.id} onClick={() => setSelected(u.id)}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
                                                <Avatar name={displayName(u)} size={30} online={online} />
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700 }}>{u.full_name || '—'}</div>
                                                    {online && <div style={{ fontSize: '0.7rem', color: C.greenText, display: 'flex', alignItems: 'center', gap: 4 }}><Dot color={C.green} size={6} /> {viewLabel(p?.view ?? u.current_view)}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: C.muted }}>{u.company_name || '—'}</td>
                                        <td>{u.username}</td>
                                        <td style={{ whiteSpace: 'nowrap', color: C.muted }}>{u.phone_number || '—'}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtNumber(u.credits)}</td>
                                        <td style={{ textAlign: 'right' }}>{u.design_count} / <span style={{ color: C.greenText }}>{u.paid_design_count}</span></td>
                                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtMoney(u.payment_total)}</td>
                                        <td style={{ textAlign: 'right' }}>{u.ticket_count}</td>
                                        <td style={{ whiteSpace: 'nowrap', color: C.muted }}>{fmtDate(u.created_at)}</td>
                                        <td style={{ whiteSpace: 'nowrap', color: online ? C.greenText : C.muted }}>{online ? 'Şimdi' : fmtRelative(u.last_seen_at, now)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
            {selected !== null && (
                <UserDetail userId={selected} onClose={() => setSelected(null)}
                    onChanged={row => setRows(list => list && list.map(u => u.id === row.id ? { ...u, ...row } : u))} />
            )}
        </div>
    );
};
