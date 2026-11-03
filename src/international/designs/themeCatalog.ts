/**
 * Tüm ülkelerde ortak 25 tasarım kimliği.
 * - Yapısal (EU EN 16931): invoiceDesigns.ts gövdesi
 * - Tema (ulusal BR/RU/CN/IN + EU tamamlayıcı): CSS eklemesi
 */
export interface DesignTheme {
    id: string;
    accent: string;
    /** Ulusal XSLT / klasik EU şablonuna eklenen CSS (MOC alanları korunur). */
    css: string;
}

const theme = (id: string, accent: string, css: string): DesignTheme => ({ id, accent, css });

/** classic = değişiklik yok; diğerleri renk / yoğunluk / marka vurgusu. */
export const DESIGN_THEMES: DesignTheme[] = [
    theme('classic', '#2563eb', ''),
    theme('minimal', '#18181b', `
.page.theme-minimal, .theme-minimal .page { filter: grayscale(.15); }
.theme-minimal table.g, .theme-minimal .lines th { border-color: #18181b !important; }
.theme-minimal .sec, .theme-minimal .section-title { color: #18181b !important; letter-spacing: .08em; }
`),
    theme('corporate', '#0b2545', `
.theme-corporate .page { box-shadow: inset 0 8px 0 #0b2545; }
.theme-corporate table.g, .theme-corporate .g td { border-color: #0b2545 !important; }
.theme-corporate .sec { background: #0b2545; color: #fff !important; padding: 3px 8px; }
.theme-corporate .nm, .theme-corporate .danfe .t { color: #0b2545 !important; }
`),
    theme('sidebar', '#115e59', `
.theme-sidebar .page { border-left: 14px solid #115e59; padding-left: 10px; }
.theme-sidebar .sec { color: #115e59 !important; border-bottom: 2px solid #115e59; }
.theme-sidebar table.g { border-color: #0f766e !important; }
`),
    theme('elegant', '#a07d3c', `
.theme-elegant .page { font-family: Georgia, 'Times New Roman', serif; }
.theme-elegant .sec, .theme-elegant .danfe .t { color: #a07d3c !important; border-color: #a07d3c; }
.theme-elegant table.g { border-color: #c4a574 !important; }
`),
    theme('compact', '#4338ca', `
.theme-compact .page, .theme-compact body { font-size: 9px !important; }
.theme-compact table.g td, .theme-compact .lines td { padding: 2px 4px !important; }
.theme-compact .sec { margin: 4px 0 2px !important; }
`),
    theme('bold', '#047857', `
.theme-bold .danfe .t, .theme-bold .nm { font-size: 1.35em !important; color: #047857 !important; }
.theme-bold .sec { background: #047857; color: #fff !important; padding: 4px 8px; font-weight: 800; }
.theme-bold table.g { border-width: 2px !important; border-color: #047857 !important; }
`),
    theme('nordic', '#0f766e', `
.theme-nordic .page { background: #f0fdfa; border-radius: 12px; }
.theme-nordic table.g { border-color: #99f6e4 !important; border-radius: 6px; }
.theme-nordic .sec { color: #0f766e !important; }
`),
    theme('din', '#1f2937', `
.theme-din .page { font-family: Arial, Helvetica, sans-serif; }
.theme-din table.g { border-color: #1f2937 !important; }
.theme-din .sec { text-transform: uppercase; letter-spacing: .06em; color: #1f2937 !important; }
`),
    theme('gradient', '#7c3aed', `
.theme-gradient .page { background: linear-gradient(180deg, #f5f3ff 0%, #fff 120px); }
.theme-gradient .sec { background: linear-gradient(90deg, #7c3aed, #db2777); color: #fff !important; padding: 3px 10px; }
.theme-gradient table.g { border-color: #c4b5fd !important; }
`),
    theme('ledger', '#9a3412', `
.theme-ledger .page { font-family: 'Courier New', Courier, monospace; }
.theme-ledger table.g td { border-color: #9a3412 !important; }
.theme-ledger .sec { background: #9a3412; color: #fff !important; padding: 2px 6px; }
`),
    theme('reference', '#c2410c', `
.theme-reference .page { outline: 3px solid #c2410c; outline-offset: -6px; }
.theme-reference .sec { color: #c2410c !important; font-weight: 800; }
.theme-reference table.g { border-color: #c2410c !important; }
`),
    theme('ocean', '#0369a1', `
.theme-ocean .page { background: #f0f9ff; }
.theme-ocean .sec { background: #0369a1; color: #fff !important; padding: 3px 8px; }
.theme-ocean table.g { border-color: #0384c7 !important; }
.theme-ocean .danfe .t, .theme-ocean .nm { color: #0369a1 !important; }
`),
    theme('sunset', '#ea580c', `
.theme-sunset .page { background: linear-gradient(180deg, #fff7ed 0%, #fff 100px); }
.theme-sunset .sec { background: #ea580c; color: #fff !important; padding: 3px 8px; }
.theme-sunset table.g { border-color: #fb923c !important; }
`),
    theme('forest', '#166534', `
.theme-forest .page { background: #f0fdf4; }
.theme-forest .sec { background: #166534; color: #fff !important; padding: 3px 8px; }
.theme-forest table.g { border-color: #16a34a !important; }
`),
    theme('mono', '#52525b', `
.theme-mono .page { filter: grayscale(1); }
.theme-mono table.g { border-color: #52525b !important; }
.theme-mono .sec { background: #27272a; color: #fff !important; padding: 3px 8px; }
`),
    theme('slate', '#334155', `
.theme-slate .page { background: #f8fafc; }
.theme-slate .sec { background: #334155; color: #fff !important; padding: 3px 8px; }
.theme-slate table.g { border-color: #64748b !important; }
`),
    theme('rose', '#be123c', `
.theme-rose .page { background: #fff1f2; }
.theme-rose .sec { background: #be123c; color: #fff !important; padding: 3px 8px; }
.theme-rose table.g { border-color: #fb7185 !important; }
.theme-rose .danfe .t { color: #be123c !important; }
`),
    theme('amber', '#b45309', `
.theme-amber .page { background: #fffbeb; }
.theme-amber .sec { background: #b45309; color: #fff !important; padding: 3px 8px; }
.theme-amber table.g { border-color: #f59e0b !important; }
`),
    theme('indigo', '#3730a3', `
.theme-indigo .page { background: #eef2ff; }
.theme-indigo .sec { background: #3730a3; color: #fff !important; padding: 3px 8px; }
.theme-indigo table.g { border-color: #6366f1 !important; }
`),
    theme('teal', '#0f766e', `
.theme-teal .page { background: #f0fdfa; }
.theme-teal .sec { background: #0f766e; color: #fff !important; padding: 3px 8px; }
.theme-teal table.g { border-color: #14b8a6 !important; }
`),
    theme('paper', '#78716c', `
.theme-paper .page { background: #fafaf9; box-shadow: inset 0 0 0 1px #d6d3d1; }
.theme-paper .sec { color: #57534e !important; border-bottom: 1px dashed #a8a29e; }
.theme-paper table.g { border-color: #a8a29e !important; border-style: dashed !important; }
`),
    theme('stamp', '#991b1b', `
.theme-stamp .page { position: relative; }
.theme-stamp .danfe .t, .theme-stamp .nm { color: #991b1b !important; }
.theme-stamp .sec { color: #991b1b !important; font-weight: 800; text-transform: uppercase; }
.theme-stamp table.g { border-color: #991b1b !important; border-width: 2px !important; }
`),
    theme('fiscal', '#1e3a8a', `
.theme-fiscal .page { background: #eff6ff; }
.theme-fiscal .sec { background: #1e3a8a; color: #fff !important; padding: 3px 8px; letter-spacing: .04em; }
.theme-fiscal table.g { border-color: #1e40af !important; }
.theme-fiscal .danfe .t { color: #1e3a8a !important; }
`),
    theme('brand', '#6d28d9', `
.theme-brand .page { background: linear-gradient(135deg, #faf5ff 0%, #fff 40%); }
.theme-brand .sec { background: linear-gradient(90deg, #6d28d9, #2563eb); color: #fff !important; padding: 3px 10px; }
.theme-brand table.g { border-color: #7c3aed !important; }
.theme-brand .danfe .t, .theme-brand .nm { color: #6d28d9 !important; }
`),
];

export const DESIGN_THEME_IDS = DESIGN_THEMES.map(t => t.id);
export const findDesignTheme = (id: string) => DESIGN_THEMES.find(t => t.id === id) ?? DESIGN_THEMES[0];

/**
 * Ulusal biçimlerde (DANFE, GST, УПД, 数电票) yalnızca düzen/tipografi olarak
 * ayrışan temalar. Renk-only varyantlar (ocean/sunset/rose…) galeride birbirinin
 * kopyası gibi göründüğü için burada yok.
 */
export const DISTINCT_NATIONAL_THEME_IDS = [
    'classic', 'corporate', 'sidebar', 'elegant', 'compact', 'bold',
    'nordic', 'ledger', 'gradient', 'paper', 'stamp', 'fiscal',
] as const;

/** Ulusal / klasik XSLT'ye tema sınıfı + CSS uygular. */
export function applyDesignTheme(xslt: string, themeId: string): string {
    const th = findDesignTheme(themeId);
    if (!th.css && th.id === 'classic') return xslt;
    let out = xslt;
    // .page köküne tema sınıfı
    out = out.replace(/class="page"/g, `class="page theme-${th.id}"`);
    out = out.replace(/class='page'/g, `class='page theme-${th.id}'`);
    if (th.css) {
        if (/<\/style>/i.test(out)) {
            out = out.replace(/<\/style>/i, `${th.css}\n                </style>`);
        } else if (/<head[^>]*>/i.test(out)) {
            out = out.replace(/<head[^>]*>/i, m => `${m}<style type="text/css">${th.css}</style>`);
        }
    }
    return out;
}
