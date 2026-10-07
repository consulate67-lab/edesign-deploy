import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Bell, BellOff, Bot, ChevronsLeft, ChevronsRight, Images, LayoutDashboard, LifeBuoy, LogOut, Menu, MonitorSmartphone,
    Settings as SettingsIcon, ShieldCheck, Users as UsersIcon,
} from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import type { RealtimeStatus } from '../support/realtime';
import { adminApi, adminSession, createAdminRealtime, type AdminRealtime } from './adminApi';
import { AdminContext, type AdminCtx, type GalleryDraft, type SectionId } from './adminContext';
import { AdminLogin } from './AdminLogin';
import type { AdminIdentity, AdminSettingsStatus, PresenceEntry, RemoteSession, SupportTicket } from './contracts';
import { C, GRADIENT, btn, displayName, errorText } from './format';
import { useMediaQuery } from './hooks';
import { notificationPermission, playChime, requestNotificationPermission, showBrowserNotification } from './notify';
import { AdminGlobalStyles, CountBadge, Dot, SectionBoundary, Spinner } from './ui';
import { Overview } from './sections/Overview';
import { Users } from './sections/Users';
import { Tickets } from './sections/Tickets';
import { RemoteSupport } from './sections/RemoteSupport';
import { Gallery } from './sections/Gallery';
import { Settings } from './sections/Settings';

const AiSection = lazy(() => import('./sections/AiSection').then(m => ({ default: m.AiSection })));
const CobrowseViewer = lazy(() => import('../support/cobrowse/CobrowseViewer').then(m => ({ default: m.CobrowseViewer })));

const SECTION_KEY = 'admin_section';

const NAV: { id: SectionId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Genel bakış', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'Kullanıcılar', icon: <UsersIcon size={18} /> },
    { id: 'tickets', label: 'Destek talepleri', icon: <LifeBuoy size={18} /> },
    { id: 'remote', label: 'Online destek', icon: <MonitorSmartphone size={18} /> },
    { id: 'ai', label: 'Tasarım yapay zekası', icon: <Bot size={18} /> },
    { id: 'gallery', label: 'Galeri tasarımları', icon: <Images size={18} /> },
    { id: 'settings', label: 'Ayarlar', icon: <SettingsIcon size={18} /> },
];

const readSection = (): SectionId => {
    const s = sessionStorage.getItem(SECTION_KEY) as SectionId | null;
    return s && NAV.some(n => n.id === s) ? s : 'overview';
};

const upsertSession = (list: RemoteSession[], s: RemoteSession) => {
    const i = list.findIndex(x => x.id === s.id);
    if (i === -1) return [s, ...list];
    const next = [...list];
    next[i] = { ...next[i], ...s };
    return next;
};

const StatusPill: React.FC<{ label: string; ok: boolean | null; title: string }> = ({ label, ok, title }) => (
    <span title={title} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
        background: 'rgba(30, 41, 59, 0.7)', border: `1px solid ${C.border}`, color: C.muted, whiteSpace: 'nowrap',
    }}>
        <Dot color={ok === null ? C.dim : ok ? C.green : C.red} />
        {label}
    </span>
);

const AdminShell: React.FC<{ identity: AdminIdentity; onLogout: () => void }> = ({ identity, onLogout }) => {
    const [section, setSection] = useState<SectionId>(readSection);
    const [focus, setFocus] = useState<AdminCtx['focus']>(null);
    const [rt, setRt] = useState<AdminRealtime | null>(null);
    const [rtStatus, setRtStatus] = useState<RealtimeStatus>('connecting');
    const [presence, setPresence] = useState<PresenceEntry[]>([]);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [ticketsError, setTicketsError] = useState<string | null>(null);
    const [ticketEvent, setTicketEvent] = useState<AdminCtx['ticketEvent']>(null);
    const [remote, setRemote] = useState<RemoteSession[]>([]);
    const [viewer, setViewer] = useState<RemoteSession | null>(null);
    const [settings, setSettings] = useState<AdminSettingsStatus | null>(null);
    const [galleryDraft, setGalleryDraft] = useState<GalleryDraft | null>(null);
    const [notifPerm, setNotifPerm] = useState(notificationPermission);
    const wide = useMediaQuery('(min-width: 1100px)');
    const tablet = useMediaQuery('(min-width: 768px)');
    const [collapsedPref, setCollapsedPref] = useState<boolean | null>(null);
    const [mobileNav, setMobileNav] = useState(false);
    const collapsed = collapsedPref ?? !wide;
    const prevUnread = useRef<Map<number, number> | null>(null);
    const pushToast = useUiStore(s => s.pushToast);

    const alert = useCallback((title: string, body: string, tag: string) => {
        playChime();
        showBrowserNotification(title, body, tag);
        pushToast({ kind: 'info', title, description: body, ttl: 8000 });
    }, [pushToast]);

    const reloadTickets = useCallback(async () => {
        try {
            const list = await adminApi.tickets();
            setTickets(list);
            setTicketsError(null);
            const prev = prevUnread.current;
            if (prev) {
                const fresh = list.filter(t => !prev.has(t.id) && t.status !== 'closed');
                const replied = list.filter(t => prev.has(t.id) && t.unread_for_admin > (prev.get(t.id) ?? 0));
                if (fresh.length) {
                    const t = fresh[0];
                    alert('Yeni destek talebi', `${displayName(t.user)}: ${t.subject}`, `ticket-${t.id}`);
                } else if (replied.length) {
                    const t = replied[0];
                    alert('Destek talebinde yeni mesaj', `${displayName(t.user)}: ${t.last_message ?? t.subject}`, `ticket-${t.id}`);
                }
            }
            prevUnread.current = new Map(list.map(t => [t.id, t.unread_for_admin]));
        } catch (e) {
            setTicketsError(errorText(e));
        }
    }, [alert]);

    const reloadRemote = useCallback(async () => {
        try {
            setRemote(await adminApi.remoteSessions());
        } catch { /* liste bir sonraki olayda / yoklamada tazelenir */ }
    }, []);

    useEffect(() => {
        let alive = true;
        let instance: AdminRealtime | null = null;
        const unsubs: (() => void)[] = [];
        createAdminRealtime().then(r => {
            if (!alive) { r.close(); return; }
            instance = r;
            setRt(r);
            setRtStatus(r.status);
            unsubs.push(
                r.onStatus(setRtStatus),
                r.on('presence', m => setPresence(m.users)),
                r.on('ticket:update', m => {
                    setTicketEvent(prev => ({ ticketId: m.ticketId, seq: (prev?.seq ?? 0) + 1 }));
                    void reloadTickets();
                }),
                r.on('remote:request', m => {
                    setRemote(list => upsertSession(list, m.session));
                    if (m.session.status === 'requested' && m.session.initiated_by === 'user') {
                        alert('Online destek isteği', `${displayName(m.session.user)} canlı destek istiyor${m.session.note ? `: ${m.session.note}` : ''}`, `remote-${m.session.id}`);
                    }
                }),
                r.on('remote:status', m => {
                    setRemote(list => list.map(s => s.id === m.sessionId ? { ...s, status: m.status } : s));
                }),
            );
        }).catch(e => {
            setRtStatus('closed');
            console.warn('[admin] gerçek zamanlı bağlantı kurulamadı', e);
        });
        return () => {
            alive = false;
            unsubs.forEach(u => u());
            instance?.close();
        };
    }, [alert, reloadTickets]);

    useEffect(() => {
        const load = () => { void reloadTickets(); void reloadRemote(); };
        load();
        const id = setInterval(load, 30000);
        return () => clearInterval(id);
    }, [reloadTickets, reloadRemote]);

    useEffect(() => {
        adminApi.settingsStatus().then(setSettings).catch(() => setSettings(null));
    }, []);

    const go = useCallback<AdminCtx['go']>((s, opts) => {
        setSection(s);
        setFocus(opts ?? null);
        setMobileNav(false);
        sessionStorage.setItem(SECTION_KEY, s);
    }, []);

    const connect = useCallback((session: RemoteSession) => setViewer(session), []);
    const clearFocus = useCallback(() => setFocus(null), []);

    const inviteUser = useCallback(async (userId: number) => {
        try {
            const s = await adminApi.inviteRemote(userId);
            setRemote(list => upsertSession(list, s));
            setViewer(s);
            pushToast({ kind: 'success', title: 'Davet gönderildi', description: 'Kullanıcı onayladığında ekranı burada görünecek.', ttl: 5000 });
        } catch (e) {
            pushToast({ kind: 'error', title: 'Davet gönderilemedi', description: errorText(e), ttl: 7000 });
        }
    }, [pushToast]);

    const presenceById = useMemo(() => new Map(presence.map(p => [p.userId, p])), [presence]);
    const unreadTickets = tickets.reduce((n, t) => n + (t.status !== 'closed' ? t.unread_for_admin : 0), 0);
    const pendingRemote = remote.filter(s => s.status === 'requested' && s.initiated_by === 'user').length;

    const ctx: AdminCtx = {
        identity, rt, rtStatus, presence, presenceById, tickets, ticketsError, reloadTickets, ticketEvent,
        remote, reloadRemote, inviteUser, connect, go, focus, clearFocus, galleryDraft, setGalleryDraft,
    };

    const badgeFor = (id: SectionId) => id === 'tickets' ? unreadTickets : id === 'remote' ? pendingRemote : 0;
    const showLabels = tablet ? !collapsed : true;
    const sidebarW = showLabels ? 236 : 68;
    const tgOk = settings ? settings.telegram.configured && settings.telegram.chatConfigured : null;
    const smsOk = settings ? settings.sms.configured : null;

    const sidebar = (
        <aside data-admin-sidebar style={{
            width: sidebarW, flexShrink: 0, background: C.panel, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column',
            transition: 'width 0.18s', height: '100%', boxSizing: 'border-box',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: showLabels ? '18px 18px 14px' : '18px 0 14px', justifyContent: showLabels ? 'flex-start' : 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 20px rgba(99,102,241,0.35)' }}>
                    <ShieldCheck size={19} color="white" />
                </div>
                {showLabels && (
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: C.text }}>e-Tasarım</div>
                        <div style={{ fontSize: '0.7rem', color: C.dim, fontWeight: 600 }}>Yönetim paneli</div>
                    </div>
                )}
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: showLabels ? '6px 10px' : '6px 8px', flex: 1, overflowY: 'auto' }} className="adm-scroll">
                {NAV.map(n => {
                    const active = n.id === section;
                    const badge = badgeFor(n.id);
                    return (
                        <button key={n.id} type="button" data-admin-nav={n.id} title={n.label} onClick={() => go(n.id)} className={active ? undefined : 'adm-nav-btn'}
                            style={{
                                position: 'relative', display: 'flex', alignItems: 'center', gap: 11, padding: showLabels ? '10px 12px' : '11px 0',
                                justifyContent: showLabels ? 'flex-start' : 'center', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                                fontSize: '0.86rem', fontWeight: active ? 800 : 600, textAlign: 'left',
                                background: active ? 'rgba(99, 102, 241, 0.16)' : 'transparent', color: active ? '#e0e7ff' : C.muted,
                                boxShadow: active ? 'inset 3px 0 0 #818cf8' : 'none',
                            }}>
                            <span style={{ color: active ? '#a5b4fc' : C.muted, display: 'flex' }}>{n.icon}</span>
                            {showLabels && <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.label}</span>}
                            {badge > 0 && (showLabels ? <CountBadge n={badge} /> : (
                                <span style={{ position: 'absolute', top: 5, right: 9 }}><CountBadge n={badge} /></span>
                            ))}
                        </button>
                    );
                })}
            </nav>
            {tablet && (
                <button type="button" onClick={() => setCollapsedPref(!collapsed)} title={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
                    style={{ ...btn('ghost', true), margin: 10, border: 'none', justifyContent: showLabels ? 'flex-start' : 'center' }}>
                    {collapsed ? <ChevronsRight size={16} /> : <><ChevronsLeft size={16} /> Daralt</>}
                </button>
            )}
        </aside>
    );

    const current = NAV.find(n => n.id === section)!;

    return (
        <AdminContext.Provider value={ctx}>
            <div className="adm-root" style={{ display: 'flex', height: '100vh', width: '100%', background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
                {tablet ? sidebar : mobileNav && (
                    <div onClick={() => setMobileNav(false)} style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(2,6,23,0.6)' }}>
                        <div onClick={e => e.stopPropagation()} style={{ height: '100%', width: 236 }}>{sidebar}</div>
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <header data-admin-topbar style={{
                        height: 58, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px',
                        borderBottom: `1px solid ${C.border}`, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(10px)',
                    }}>
                        {!tablet && (
                            <button type="button" aria-label="Menü" onClick={() => setMobileNav(true)} style={{ ...btn('ghost', true), padding: 7 }}>
                                <Menu size={18} />
                            </button>
                        )}
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <span style={{ color: '#a5b4fc', display: 'flex' }}>{current.icon}</span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{current.label}</span>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {wide && (
                                <>
                                    <StatusPill label="Canlı" ok={rtStatus === 'open' ? true : rtStatus === 'connecting' ? null : false}
                                        title={rtStatus === 'open' ? 'Gerçek zamanlı bağlantı açık' : rtStatus === 'connecting' ? 'Bağlanıyor…' : 'Gerçek zamanlı bağlantı yok; 30 sn\'de bir yenileniyor'} />
                                    <StatusPill label="Telegram" ok={tgOk} title={settings ? (tgOk ? `Telegram hazır${settings.telegram.botUsername ? ` (@${settings.telegram.botUsername})` : ''}` : 'Telegram yapılandırılmamış') : 'Durum alınamadı'} />
                                    <StatusPill label="SMS" ok={smsOk} title={settings ? (smsOk ? `SMS hazır (${settings.sms.provider})` : 'SMS sağlayıcısı yapılandırılmamış') : 'Durum alınamadı'} />
                                </>
                            )}
                            {notifPerm !== 'unsupported' && (
                                <button type="button" data-admin-notif
                                    title={notifPerm === 'granted' ? 'Masaüstü bildirimleri açık' : notifPerm === 'denied' ? 'Bildirimler tarayıcıda engellenmiş' : 'Masaüstü bildirimlerini aç'}
                                    onClick={() => { playChime(); void requestNotificationPermission().then(setNotifPerm); }}
                                    style={{ ...btn('ghost', true), padding: 7, color: notifPerm === 'granted' ? '#6ee7b7' : C.muted }}>
                                    {notifPerm === 'denied' ? <BellOff size={16} /> : <Bell size={16} />}
                                </button>
                            )}
                            <span data-admin-identity style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {displayName(identity)}
                            </span>
                            <button type="button" data-admin-logout onClick={onLogout} style={btn('danger', true)}>
                                <LogOut size={14} /> {tablet && 'Çıkış'}
                            </button>
                        </div>
                    </header>
                    <main className="adm-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: tablet ? 24 : 14 }}>
                        {section === 'overview' && <Overview />}
                        {section === 'users' && <Users />}
                        {section === 'tickets' && <Tickets />}
                        {section === 'remote' && <RemoteSupport />}
                        {section === 'ai' && (
                            <SectionBoundary>
                                <Suspense fallback={<div style={{ display: 'flex', gap: 8, color: C.muted, padding: 20 }}><Spinner /> Yükleniyor…</div>}>
                                    <AiSection />
                                </Suspense>
                            </SectionBoundary>
                        )}
                        {section === 'gallery' && <Gallery />}
                        {section === 'settings' && <Settings onStatus={setSettings} />}
                    </main>
                </div>
            </div>
            {viewer && rt && (
                <div data-admin-viewer style={{ position: 'fixed', inset: 0, zIndex: 1100, background: C.bg }}>
                    <SectionBoundary>
                        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: C.muted }}><Spinner /> Ortak ekran yükleniyor…</div>}>
                            <CobrowseViewer realtime={rt} session={viewer} adminName={displayName(identity)} onClose={() => { setViewer(null); void reloadRemote(); }} />
                        </Suspense>
                    </SectionBoundary>
                </div>
            )}
        </AdminContext.Provider>
    );
};

export const AdminApp: React.FC = () => {
    const [identity, setIdentity] = useState<AdminIdentity | null>(() => (adminSession.getToken() ? adminSession.getIdentity() : null));
    const [checking, setChecking] = useState(() => !!adminSession.getToken());

    useEffect(() => {
        adminSession.onUnauthorized(() => setIdentity(null));
        return () => adminSession.onUnauthorized(null);
    }, []);

    useEffect(() => {
        if (!adminSession.getToken()) return;
        adminApi.me()
            .then(me => { setIdentity(me); adminSession.set(adminSession.getToken()!, me); })
            .catch(() => { /* 401 ise onUnauthorized girişe döndürür; ağ hatasında kayıtlı kimlikle devam */ })
            .finally(() => setChecking(false));
    }, []);

    useEffect(() => {
        const prev = document.title;
        document.title = 'Yönetim Paneli · e-Tasarım';
        return () => { document.title = prev; };
    }, []);

    const logout = () => {
        adminSession.clear();
        setIdentity(null);
    };

    return (
        <>
            <AdminGlobalStyles />
            {checking && !identity ? (
                <div className="adm-root" style={{ minHeight: '100vh', width: '100%', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: C.muted }}>
                    <Spinner /> Oturum kontrol ediliyor…
                </div>
            ) : identity ? (
                <AdminShell key={identity.id} identity={identity} onLogout={logout} />
            ) : (
                <AdminLogin onSuccess={(token, user) => {
                    adminSession.set(token, user);
                    setChecking(false);
                    setIdentity(user);
                    void requestNotificationPermission();
                }} />
            )}
        </>
    );
};

export default AdminApp;
