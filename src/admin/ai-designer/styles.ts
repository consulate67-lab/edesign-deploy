import type React from 'react';

export const C = {
    bg: '#0b1120',
    panel: 'rgba(15, 23, 42, 0.78)',
    panel2: 'rgba(30, 41, 59, 0.55)',
    border: 'rgba(148, 163, 184, 0.22)',
    text: '#e2e8f0',
    strong: '#f8fafc',
    muted: '#94a3b8',
    faint: '#64748b',
    brand: '#6366f1',
    brand2: '#a855f7',
    ok: '#22c55e',
    warn: '#f59e0b',
    err: '#ef4444',
};

export const btn = (bg: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 13px', borderRadius: 10,
    border: 'none', cursor: 'pointer', background: bg, color: 'white', fontWeight: 700, fontSize: '0.82rem',
    fontFamily: 'inherit', whiteSpace: 'nowrap', ...extra,
});

export const ghostBtn = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    ...btn('rgba(148, 163, 184, 0.12)'), color: C.text, border: `1px solid ${C.border}`, ...extra,
});

export const chip = (active: boolean, color = C.brand): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
    border: `1px solid ${active ? color : C.border}`, background: active ? `${color}33` : 'rgba(15, 23, 42, 0.6)',
    color: active ? C.strong : C.text, fontWeight: active ? 800 : 600, fontSize: '0.8rem', fontFamily: 'inherit',
    boxShadow: active ? `0 0 0 2px ${color}33` : 'none', transition: 'background 0.15s, box-shadow 0.15s',
});

export const input: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 10, border: `1px solid ${C.border}`,
    background: 'rgba(2, 6, 23, 0.6)', color: C.strong, fontFamily: 'inherit', fontSize: '0.86rem', outline: 'none',
};

export const card: React.CSSProperties = {
    background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
};

export const label: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 800, color: C.muted, letterSpacing: 0.4, textTransform: 'uppercase' };

export const downloadText = (text: string, fileName: string) => {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/xml;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Dosya adı için güvenli kısaltma. */
export const slug = (s: string) => s.toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşü]/g, c => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }[c] ?? c))
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'tasarim';
