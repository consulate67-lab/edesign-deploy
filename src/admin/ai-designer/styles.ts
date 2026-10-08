import type React from 'react';

export const C = {
    bg: '#f3f5ff',
    panel: '#ffffff',
    panel2: '#f6f7ff',
    border: 'rgba(99, 102, 241, 0.2)',
    text: '#334155',
    strong: '#1e1b4b',
    muted: '#575f7a',
    faint: '#8c93ab',
    brand: '#6366f1',
    brand2: '#d946ef',
    ok: '#16a34a',
    warn: '#d97706',
    err: '#dc2626',
};

export const btn = (bg: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 13px', borderRadius: 10,
    border: 'none', cursor: 'pointer', background: bg, color: 'white', fontWeight: 700, fontSize: '0.82rem',
    fontFamily: 'inherit', whiteSpace: 'nowrap', ...extra,
});

export const ghostBtn = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    ...btn('#ffffff'), color: C.strong, border: `1px solid ${C.border}`, ...extra,
});

export const chip = (active: boolean, color = C.brand): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
    border: `1px solid ${active ? color : C.border}`, background: active ? `${color}1f` : '#ffffff',
    color: active ? C.strong : C.text, fontWeight: active ? 800 : 600, fontSize: '0.8rem', fontFamily: 'inherit',
    boxShadow: active ? `0 0 0 2px ${color}33` : 'none', transition: 'background 0.15s, box-shadow 0.15s',
});

export const input: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 10, border: `1px solid ${C.border}`,
    background: '#ffffff', color: C.strong, fontFamily: 'inherit', fontSize: '0.86rem', outline: 'none',
};

export const card: React.CSSProperties = {
    background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: '0 4px 18px rgba(79, 70, 229, 0.08)',
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
