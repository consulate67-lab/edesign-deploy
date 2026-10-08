import type React from 'react';
import type { RemoteStatus, TicketStatus } from './contracts';

export const C = {
    bg: '#f3f5ff',
    panel: '#ffffff',
    card: '#ffffff',
    cardSolid: '#ffffff',
    soft: '#f6f7ff',
    border: 'rgba(99, 102, 241, 0.16)',
    borderStrong: 'rgba(99, 102, 241, 0.3)',
    text: '#1e1b4b',
    muted: '#575f7a',
    dim: '#8c93ab',
    accent: '#6366f1',
    accent2: '#d946ef',
    green: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    sky: '#0ea5e9',
    accentText: '#4f46e5',
    greenText: '#047857',
    amberText: '#b45309',
    redText: '#dc2626',
    skyText: '#0369a1',
    shadow: '0 4px 18px rgba(79, 70, 229, 0.08)',
};

export const GRADIENT = `linear-gradient(135deg, ${C.accent} 0%, #a855f7 50%, ${C.accent2} 100%)`;
export const SIDEBAR_GRADIENT = 'linear-gradient(180deg, #4338ca 0%, #6d28d9 52%, #c026d3 100%)';

export type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

export const btn = (variant: BtnVariant = 'secondary', small = false): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: small ? '5px 10px' : '8px 14px', borderRadius: 10, cursor: 'pointer',
    fontFamily: 'inherit', fontWeight: 700, fontSize: small ? '0.76rem' : '0.84rem', whiteSpace: 'nowrap',
    transition: 'background 0.15s, border-color 0.15s, opacity 0.15s',
    ...(variant === 'primary' && { background: GRADIENT, color: 'white', border: 'none', boxShadow: '0 4px 14px rgba(168, 85, 247, 0.32)' }),
    ...(variant === 'secondary' && { background: '#ffffff', color: C.text, border: `1px solid ${C.borderStrong}` }),
    ...(variant === 'ghost' && { background: 'transparent', color: C.muted, border: `1px solid ${C.border}` }),
    ...(variant === 'danger' && { background: 'rgba(239, 68, 68, 0.08)', color: C.redText, border: '1px solid rgba(239, 68, 68, 0.35)' }),
    ...(variant === 'success' && { background: 'rgba(16, 185, 129, 0.1)', color: C.greenText, border: '1px solid rgba(16, 185, 129, 0.4)' }),
});

export const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 10,
    border: `1px solid ${C.borderStrong}`, background: '#ffffff', color: C.text,
    fontSize: '0.86rem', fontFamily: 'inherit', outline: 'none',
};

export const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.74rem', fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: 0.2,
};

export const cardStyle: React.CSSProperties = {
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxSizing: 'border-box', boxShadow: C.shadow,
};

export const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

const toDate = (iso: string | null | undefined) => {
    if (!iso) return null;
    // SQLite "YYYY-MM-DD HH:MM:SS" UTC olarak gelir.
    const d = new Date(/^\d{4}-\d{2}-\d{2} \d/.test(iso) ? `${iso.replace(' ', 'T')}Z` : iso);
    return Number.isNaN(d.getTime()) ? null : d;
};

export const fmtDate = (iso: string | null | undefined) =>
    toDate(iso)?.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) ?? '—';

export const fmtDateTime = (iso: string | null | undefined) =>
    toDate(iso)?.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) ?? '—';

export const fmtTime = (iso: string | null | undefined) =>
    toDate(iso)?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) ?? '';

export const fmtRelative = (iso: string | null | undefined, now: number) => {
    const d = toDate(iso);
    if (!d) return '—';
    const sec = Math.max(0, Math.round((now - d.getTime()) / 1000));
    if (sec < 45) return 'az önce';
    const min = Math.round(sec / 60);
    if (min < 60) return `${min} dk önce`;
    const h = Math.round(min / 60);
    if (h < 24) return `${h} sa önce`;
    const days = Math.round(h / 24);
    if (days < 30) return `${days} gün önce`;
    return fmtDate(iso);
};

export const fmtDuration = (iso: string | null | undefined, now: number) => {
    const d = toDate(iso);
    if (!d) return '—';
    const min = Math.max(0, Math.floor((now - d.getTime()) / 60000));
    if (min < 1) return '1 dk\'dan az';
    if (min < 60) return `${min} dk`;
    return `${Math.floor(min / 60)} sa ${min % 60} dk`;
};

export const fmtMoney = (n: number | null | undefined) =>
    `${(n ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;

export const fmtNumber = (n: number | null | undefined) => (n ?? 0).toLocaleString('tr-TR');

const VIEW_LABELS: Record<string, string> = {
    landing: 'Tanıtım sayfası',
    auth: 'Giriş / kayıt',
    selection: 'Ana ekran (belge seçimi)',
    designer: 'Tasarım ekranı',
    'xslt-editor': 'XSLT editörü',
};

export const viewLabel = (view: string | null | undefined) => (view ? VIEW_LABELS[view] ?? view : '—');

export const TICKET_STATUS: Record<TicketStatus, { label: string; color: string }> = {
    open: { label: 'Açık', color: C.amber },
    answered: { label: 'Yanıtlandı', color: C.sky },
    closed: { label: 'Kapalı', color: C.dim },
};

export const REMOTE_STATUS: Record<RemoteStatus, { label: string; color: string }> = {
    requested: { label: 'Bekliyor', color: C.amber },
    active: { label: 'Bağlı', color: C.green },
    ended: { label: 'Bitti', color: C.dim },
    declined: { label: 'Reddedildi', color: C.red },
};

export const displayName = (u: { full_name?: string | null; username?: string } | null | undefined) =>
    u?.full_name?.trim() || u?.username || 'Bilinmeyen kullanıcı';

/** Kaba tarayıcı özeti: "Chrome 141 · Windows". */
export const browserSummary = (ua: string | undefined) => {
    if (!ua) return '—';
    const browser = /Edg\/(\d+)/.exec(ua) ? `Edge ${/Edg\/(\d+)/.exec(ua)![1]}`
        : /OPR\/(\d+)/.exec(ua) ? `Opera ${/OPR\/(\d+)/.exec(ua)![1]}`
        : /Firefox\/(\d+)/.exec(ua) ? `Firefox ${/Firefox\/(\d+)/.exec(ua)![1]}`
        : /Chrome\/(\d+)/.exec(ua) ? `Chrome ${/Chrome\/(\d+)/.exec(ua)![1]}`
        : /Version\/(\d+).*Safari/.exec(ua) ? `Safari ${/Version\/(\d+)/.exec(ua)![1]}`
        : 'Tarayıcı';
    const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS'
        : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
    return os ? `${browser} · ${os}` : browser;
};
