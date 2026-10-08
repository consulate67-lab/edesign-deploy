import type React from 'react';

/** Kullanıcıya açık ekranların (tanıtım, giriş, panel) ortak açık tema paleti. Yönetim paneli kendi koyu temasını kullanır. */
export const theme = {
    bg: '#f6f7fb',
    surface: '#ffffff',
    surfaceAlt: '#f1f4f9',
    surfaceTint: '#f5f3ff',
    border: '#e4e7ef',
    borderStrong: '#cfd5e2',

    text: '#0b1324',
    textMuted: '#4a5568',
    textSubtle: '#7a8599',

    primary: '#6d28d9',
    primaryHover: '#5b21b6',
    primarySoft: '#ede9fe',
    blue: '#2563eb',
    cyan: '#06b6d4',
    pink: '#ec4899',
    amber: '#f59e0b',
    green: '#10b981',
    greenSoft: '#d1fae5',
    greenText: '#047857',
    red: '#ef4444',
    redSoft: '#fee2e2',
    redText: '#b91c1c',

    gradient: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 55%, #06b6d4 100%)',
    gradientWarm: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    gradientText: 'linear-gradient(120deg, #7c3aed 0%, #2563eb 45%, #06b6d4 100%)',

    shadowSm: '0 1px 2px rgba(15, 23, 42, 0.05), 0 2px 8px rgba(15, 23, 42, 0.04)',
    shadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 30px rgba(15, 23, 42, 0.07)',
    shadowLg: '0 24px 60px rgba(15, 23, 42, 0.12)',
    shadowBrand: '0 10px 30px rgba(109, 40, 217, 0.28)',
    focusRing: '0 0 0 4px rgba(124, 58, 237, 0.15)',

    font: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
} as const;

/** Hafif nokta ızgarası + renkli ışık lekeleri: açık zeminde "teknoloji" dokusu. */
export const techBackground: React.CSSProperties = {
    backgroundColor: theme.bg,
    backgroundImage: [
        'radial-gradient(rgba(79, 70, 229, 0.12) 1px, transparent 1px)',
        'radial-gradient(900px 520px at 5% -5%, rgba(124, 58, 237, 0.24), transparent 62%)',
        'radial-gradient(800px 480px at 98% 8%, rgba(6, 182, 212, 0.24), transparent 62%)',
        'radial-gradient(700px 420px at 60% 38%, rgba(236, 72, 153, 0.10), transparent 65%)',
        'radial-gradient(900px 600px at 50% 105%, rgba(37, 99, 235, 0.14), transparent 60%)',
    ].join(', '),
    backgroundSize: '22px 22px, auto, auto, auto, auto',
};

export const gradientTextStyle: React.CSSProperties = {
    background: theme.gradientText,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
};
