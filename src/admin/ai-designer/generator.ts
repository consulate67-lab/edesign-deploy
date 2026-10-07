/**
 * Parametrik XSLT 1.0 üretici. Aynı parametre + varyasyon tohumu her zaman
 * aynı XSLT'yi üretir. Düzen tablo tabanlıdır (e-belge görüntüleyicilerinin
 * eski IE motorları flex / grid / rgba bilmez); renkler önceden hesaplanır.
 */
import { karekodSnippet } from '../../xslt-editor/karekod';
import { FAMILY_INFO, type WizardDocType } from '../../wizard/docTypes';
import { CATEGORIES, SECTORS } from '../../sector-templates/types';
import type { DesignParams, StyleId } from './types';
import { QR_DOCS, isSectionOn, sectionsFor } from './questions';
import { FONTS, STYLES, colorName, labelOf } from './vocab';
import { esc, escAttr, escComment, isHex, mix, readableAccent, textOn, uniq } from './utils';

export interface GenerateOptions { variant?: number }

export interface GeneratedDesign {
    xslt: string;
    name: string;
    description: string;
    tags: string[];
    accent: string;
}

interface Layout { header: number; table: number; party: number; totals: number; topBar: boolean }

interface Theme {
    A: string; dark: string; deep: string; tint: string; tint2: string; line: string; hair: string; onA: string;
    band: string; onBand: string; bandMuted: string; headMode: 'fill' | 'tint' | 'line'; headBg: string; headFg: string;
    font: string; headFont: string; size: number; radius: number; pad: number; cell: string;
}

interface Ctx {
    p: DesignParams;
    dt: WizardDocType;
    L: Layout;
    T: Theme;
    on: (id: string) => boolean;
    qr: boolean;
}

// ---------------------------------------------------------------------------
// XSLT parçacık yardımcıları
// ---------------------------------------------------------------------------
const v = (xp: string) => `<xsl:value-of select="${xp}"/>`;
const xt = (s: string) => `<xsl:text>${esc(s)}</xsl:text>`;
const iff = (test: string, body: string) => (test ? `<xsl:if test="${test}">${body}</xsl:if>` : body);
const each = (sel: string, body: string) => `<xsl:for-each select="${sel}">${body}</xsl:for-each>`;
const call = (name: string, params: Record<string, string>) =>
    `<xsl:call-template name="${name}">${Object.entries(params).map(([k, s]) => `<xsl:with-param name="${k}" select="${s}"/>`).join('')}</xsl:call-template>`;
const date = (xp: string) => call('tarih', { d: xp });
const num = (xp: string, pattern = '###.##0,00') => `<xsl:value-of select="format-number(${xp}, '${pattern}', 'tr')"/>`;
const money = (xp: string, cur = `${xp}/@currencyID`) => call('para', { n: xp, c: cur });
const qty = (xp: string) => `${num(xp, '###.##0,###')}${xt(' ')}${call('birim', { u: `${xp}/@unitCode` })}`;
const pct = (xp: string) => `<xsl:if test="${xp}">${xt(' (%')}${num(xp, '##0,##')}${xt(')')}</xsl:if>`;
const lines = (s: string) => s.split(/\r?\n/).map(l => esc(l.trim())).filter(Boolean).join('<br/>');
const commaList = (sel: string, item: string) => each(sel, `<xsl:if test="position() &gt; 1">${xt(', ')}</xsl:if>${item}`);

const TAX = (code: string) => `cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='${code}'`;
const STOPAJ = `(${TAX('0003')} or ${TAX('0011')})`;

// ---------------------------------------------------------------------------
// Düzen ve tema
// ---------------------------------------------------------------------------
const ORDERS: Record<StyleId, { h: number[]; t: number[]; p: number[] }> = {
    klasik: { h: [0, 2, 1], t: [2, 1, 0], p: [2, 0, 1] },
    modern: { h: [1, 0, 2], t: [0, 1, 2], p: [0, 1, 2] },
    kurumsal: { h: [0, 1, 2], t: [1, 2, 0], p: [1, 2, 0] },
    minimal: { h: [0, 2, 1], t: [1, 0, 1], p: [1, 0, 2] },
    kompakt: { h: [0, 1, 2], t: [2, 0, 1], p: [2, 1, 0] },
};

function layoutOf(p: DesignParams, variant: number): Layout {
    const v0 = Math.abs(Math.floor(Number(variant) || 0));
    const round = Math.floor(v0 / 3);
    const o = ORDERS[p.style] ?? ORDERS.modern;
    return {
        header: o.h[v0 % 3],
        table: o.t[(v0 + round) % o.t.length],
        party: o.p[(v0 + 2 * round) % 3],
        totals: (v0 + round) % 2,
        topBar: (Math.floor(v0 / 2) + round) % 2 === 1,
    };
}

const RADIUS: Record<StyleId, number> = { klasik: 0, modern: 10, kurumsal: 3, minimal: 0, kompakt: 4 };
const PAD: Record<StyleId, number> = { klasik: 24, modern: 26, kurumsal: 26, minimal: 34, kompakt: 16 };

function themeOf(p: DesignParams): Theme {
    const A = readableAccent(p.accent);
    const sade = p.colorMode === 'sade';
    const dark = mix(A, '#000000', 0.3);
    const deep = p.style === 'kurumsal' ? mix(A, '#0b1220', 0.55) : dark;
    let headMode: Theme['headMode'] = p.colorMode === 'canli' ? 'fill' : sade ? 'line' : (p.style === 'kurumsal' || p.style === 'kompakt' ? 'fill' : 'tint');
    if (p.style === 'minimal') headMode = p.colorMode === 'canli' ? 'tint' : 'line';
    const tint2 = sade ? '#eceef2' : mix(A, '#ffffff', 0.84);
    const headBg = headMode === 'fill' ? (p.style === 'kurumsal' ? deep : A) : headMode === 'tint' ? tint2 : '#ffffff';
    const band = sade ? '#f1f3f6' : p.style === 'minimal' ? mix(A, '#ffffff', 0.9) : p.style === 'kurumsal' && p.colorMode !== 'canli' ? deep : A;
    const onBand = textOn(band);
    const fontStack = FONTS.find(f => f.id === p.font)?.stack ?? FONTS[0].stack;
    const size = ({ kucuk: 9.5, normal: 10.5, buyuk: 11.5 }[p.fontScale] ?? 10.5) - (p.style === 'kompakt' ? 1 : 0);
    return {
        A, dark, deep,
        tint: sade ? '#f6f7f9' : mix(A, '#ffffff', 0.93),
        tint2,
        line: sade ? '#d4d8de' : mix(A, '#ffffff', 0.7),
        hair: '#e6e8ec',
        onA: textOn(A),
        band, onBand, bandMuted: mix(onBand, band, 0.3),
        headMode, headBg, headFg: headMode === 'fill' ? textOn(headBg) : dark,
        font: fontStack,
        headFont: p.style === 'klasik' ? "Georgia, 'Times New Roman', serif" : fontStack,
        size,
        radius: RADIUS[p.style] ?? 6,
        pad: PAD[p.style] ?? 24,
        cell: p.style === 'kompakt' ? '3px 6px' : p.style === 'minimal' ? '8px 6px' : '6px 8px',
    };
}

const LOGO_BOX: Record<string, [number, number]> = { kucuk: [44, 170], orta: [68, 230], buyuk: [100, 300] };

function cssA4(c: Ctx): string {
    const { T, L, p } = c;
    const R = `${T.radius}px`;
    const [lh, lw] = LOGO_BOX[p.logoSize] ?? LOGO_BOX.orta;
    const minimal = p.style === 'minimal';
    const grandPlain = minimal || p.colorMode === 'sade';
    const rules: string[] = [
        '* { box-sizing: border-box; }',
        'table { border-collapse: collapse; font-size: inherit; line-height: inherit; color: inherit; }',
        `body { margin: 0; background: #e9ecf1; font-family: ${T.font}; font-size: ${T.size}px; line-height: 1.45; color: #1f2937; -webkit-print-color-adjust: exact; print-color-adjust: exact; }`,
        `.page { width: 210mm; max-width: 100%; margin: 16px auto; background: #fff; padding: 0 0 16px; box-shadow: 0 4px 18px #c3c8d1;${p.style === 'kurumsal' ? ` border-left: 9px solid ${T.deep};` : ''}${L.topBar && p.style !== 'kurumsal' ? ` border-top: 6px solid ${T.A};` : ''} }`,
        `.in { padding: 0 ${T.pad}px; }`,
        `.topnote { background: ${T.tint}; color: ${T.dark}; text-align: center; padding: 6px ${T.pad}px; font-weight: 600; border-bottom: 1px solid ${T.line}; }`,
        '.hdr, .hdr0 { width: 100%; }',
        '.hdr { margin-top: 18px; }',
        '.hdr td, .hdr0 td { vertical-align: top; }',
        '.hdr td.mid, .hdr0 td.mid { vertical-align: middle; }',
        '.brand td { vertical-align: middle; }',
        '.brand-logo { padding-right: 12px; }',
        '.brand-r { margin-left: auto; }',
        '.brand-r .brand-logo { padding: 0 0 0 12px; }',
        '.brand-r .brand-text { text-align: right; }',
        '.brand-c { text-align: center; }',
        '.brand-c .logo, .brand-c .mono { margin: 0 auto 6px; }',
        `.logo { display: block; max-height: ${lh}px; max-width: ${lw}px; }`,
        `.logo-box { display: inline-block; background: #fff; padding: 5px; border-radius: ${Math.max(T.radius, 4)}px; }`,
        `.mono { width: 50px; height: 50px; line-height: 50px; text-align: center; font-size: 26px; font-weight: 800; color: ${T.onA}; background: ${T.A}; border-radius: ${p.style === 'modern' ? '50%' : R}; font-family: ${T.headFont}; }`,
        `.brand-name { font-family: ${T.headFont}; font-size: 1.55em; font-weight: 800; color: ${T.dark}; line-height: 1.2; }`,
        '.slogan { color: #6b7280; font-style: italic; margin-top: 2px; }',
        `.prof { color: ${T.A}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: .82em; margin-top: 2px; }`,
        `.doc-title { font-family: ${T.headFont}; font-size: ${p.style === 'kompakt' ? 1.55 : 1.9}em; font-weight: ${minimal ? 300 : 800}; color: ${p.style === 'kurumsal' ? T.deep : minimal ? '#111827' : T.A}; letter-spacing: ${minimal ? 4 : 1}px; line-height: 1.1;${p.style === 'klasik' ? ` border-bottom: 3px double ${T.A}; padding-bottom: 4px; display: inline-block;` : ''}${minimal ? ` border-bottom: 2px solid ${T.A}; padding-bottom: 4px; display: inline-block;` : ''} }`,
        '.doc-sub { margin-top: 4px; color: #6b7280; font-size: .85em; letter-spacing: 1px; text-transform: uppercase; }',
        '.tb-r { text-align: right; }',
        '.tb-r .meta { margin-left: auto; }',
        '.meta { margin-top: 8px; }',
        `.meta th { text-align: left; color: #6b7280; font-weight: 600; padding: 2px 12px 2px 0; white-space: nowrap; font-size: .92em;${p.style === 'klasik' ? ` border: 1px solid ${T.line}; background: ${T.tint}; padding: 3px 8px;` : ''} }`,
        `.meta td { text-align: left; font-weight: 700; padding: 2px 0;${p.style === 'klasik' ? ` border: 1px solid ${T.line}; padding: 3px 8px;` : ''} }`,
        ".ettn { font-family: Consolas, 'Courier New', monospace; font-size: .86em; font-weight: 400 !important; word-break: break-all; }",
        '.qr-cell { width: 134px; }',
        '.qr-r { padding-left: 14px; }',
        '.qr-l { padding-right: 14px; }',
        `.band { background: ${T.band}; color: ${T.onBand}; padding: 18px ${T.pad}px 16px; }`,
        `.band .brand-name, .band .doc-title { color: ${T.onBand}; border-color: ${T.onBand}; }`,
        `.band .slogan, .band .doc-sub, .band .prof { color: ${T.bandMuted}; }`,
        `.band .mono { background: ${T.onBand}; color: ${T.band}; }`,
        `.strip { width: 100%; border: 1px solid ${T.line}; }`,
        `.strip td { padding: 6px 10px; border-right: 1px solid ${T.line}; vertical-align: top; }`,
        '.strip .k { font-size: .78em; color: #6b7280; text-transform: uppercase; letter-spacing: .6px; white-space: nowrap; }',
        '.strip .v { font-weight: 700; }',
        '.ettn-line { margin-top: 5px; color: #6b7280; }',
        `.rule { height: ${minimal ? 1 : 2}px; background: ${minimal ? T.line : T.A}; margin-top: 12px; font-size: 0; line-height: 0; }`,
        '.parties { width: 100%; margin-top: 16px; }',
        '.parties td.pcell { width: 50%; vertical-align: top; }',
        '.gap { width: 14px; }',
        L.party === 0 ? `.pbox { padding: 10px 12px; background: ${minimal ? '#fff' : T.tint}; border-radius: ${R};${minimal ? ` border-top: 1px solid ${T.line};` : ''} }`
            : L.party === 1 ? `.pbox { padding: 4px 12px 6px; border-left: 3px solid ${T.A}; }`
                : `.pbox { padding: 10px 12px; border: 1px solid ${T.line}; border-radius: ${R}; }`,
        `.plabel { font-size: .78em; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; color: ${p.style === 'kurumsal' ? T.deep : T.A}; margin-bottom: 4px; }`,
        '.pname { font-weight: 800; font-size: 1.1em; color: #111827; margin-bottom: 2px; }',
        '.pl { color: #4b5563; }',
        '.pt, .kv { margin-top: 4px; }',
        '.pt th, .kv th { text-align: left; color: #6b7280; font-weight: 600; padding: 1px 10px 1px 0; white-space: nowrap; vertical-align: top; }',
        '.pt td, .kv td { padding: 1px 0; vertical-align: top; }',
        '.infos { width: 100%; margin-top: 12px; }',
        '.icell { width: 33%; vertical-align: top; padding-right: 10px; }',
        `.ibox { border: 1px solid ${T.line}; border-radius: ${R}; padding: 8px 10px; }`,
        `.ilabel { font-size: .76em; font-weight: 800; letter-spacing: 1.3px; text-transform: uppercase; color: ${p.style === 'kurumsal' ? T.deep : T.A}; margin-bottom: 3px; }`,
        '.lines { width: 100%; margin-top: 16px; }',
        `.lines th { padding: ${T.cell}; text-align: left; font-size: .8em; text-transform: uppercase; letter-spacing: .6px; font-weight: 700; color: ${T.headFg}; background: ${T.headBg};${T.headMode === 'line' ? ` border-bottom: 2px solid ${T.A};` : ''} }`,
        `.lines td { padding: ${T.cell}; vertical-align: top; border-bottom: 1px solid ${L.table === 1 ? T.line : T.hair}; }`,
        L.table === 0 ? `.lines tr.z td { background: ${T.tint}; }` : '',
        L.table === 2 ? `.lines th, .lines td { border: 1px solid ${T.line}; }` : '',
        '.r { text-align: right !important; white-space: nowrap; }',
        '.c { text-align: center !important; }',
        '.iname { font-weight: 700; }',
        '.desc { color: #6b7280; font-size: .9em; }',
        ".code { color: #6b7280; font-size: .85em; font-family: Consolas, 'Courier New', monospace; }",
        '.bottom { width: 100%; margin-top: 14px; }',
        '.bl { vertical-align: top; padding-right: 16px; }',
        '.br { vertical-align: top; width: 44%; }',
        '.qr-bottom { width: 134px; vertical-align: top; padding-right: 14px; }',
        '.tot { width: 100%; }',
        `.tot td { padding: ${p.style === 'kompakt' ? '3px 6px' : '5px 8px'}; border-bottom: 1px solid ${T.hair}; }`,
        '.tot td.r { font-weight: 700; }',
        '.tot tr.neg td { color: #b91c1c; }',
        grandPlain
            ? `.tot tr.grand td { color: ${T.A}; font-size: 1.22em; font-weight: 800; border-top: 2px solid ${T.A}; border-bottom: 0; padding-top: 8px; }`
            : `.tot tr.grand td { background: ${p.style === 'kurumsal' ? T.deep : T.A}; color: ${textOn(p.style === 'kurumsal' ? T.deep : T.A)}; font-size: 1.2em; font-weight: 800; border: 0; padding: 9px 8px; }`,
        `.words { margin-top: 6px; font-style: italic; color: #374151; font-size: .92em; padding: 6px 8px; background: ${T.tint}; border-radius: ${R}; }`,
        `.grandband { width: 100%; margin-top: 12px; background: ${grandPlain ? T.tint : p.style === 'kurumsal' ? T.deep : T.A}; color: ${grandPlain ? T.dark : textOn(p.style === 'kurumsal' ? T.deep : T.A)};${grandPlain ? ` border-top: 2px solid ${T.A};` : ''} }`,
        '.grandband td { padding: 12px 16px; vertical-align: middle; }',
        '.gb-l { font-size: .8em; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; }',
        '.gb-words { font-style: italic; font-size: .92em; }',
        '.gb-amt { font-size: 1.75em; font-weight: 800; text-align: right; white-space: nowrap; }',
        `.box { margin-bottom: 10px; border: 1px solid ${T.line}; border-radius: ${R}; padding: 8px 10px; }`,
        `.box h5 { margin: 0 0 5px; font-size: .78em; letter-spacing: 1.4px; text-transform: uppercase; color: ${p.style === 'kurumsal' ? T.deep : T.A}; }`,
        '.notes div { margin-bottom: 3px; }',
        '.mini { width: 100%; }',
        `.mini th { text-align: left; font-size: .8em; color: #6b7280; border-bottom: 1px solid ${T.line}; padding: 3px 4px; font-weight: 700; }`,
        `.mini td { padding: 3px 4px; border-bottom: 1px solid ${T.hair}; vertical-align: top; }`,
        ".iban { font-family: Consolas, 'Courier New', monospace; white-space: nowrap; font-weight: 700; }",
        '.bank-item { padding: 4px 0; border-bottom: 1px dashed #d1d5db; }',
        '.sign { width: 100%; margin-top: 30px; }',
        '.sign td.s { width: 42%; text-align: center; vertical-align: bottom; padding-top: 36px; }',
        '.sline { border-top: 1px solid #9ca3af; padding-top: 4px; font-weight: 700; }',
        '.shint { color: #6b7280; font-size: .85em; }',
        `.foot { margin-top: 18px; padding-top: 10px; border-top: 1px solid ${T.line}; text-align: center; color: #6b7280; font-size: .9em; }`,
        `.thanks { color: ${T.A}; font-weight: 800; font-size: 1.15em; margin-bottom: 6px; font-family: ${T.headFont}; }`,
        `.fbox { text-align: left; background: ${T.tint}; border-radius: ${R}; padding: 7px 10px; margin: 6px 0; color: #374151; }`,
        '.contact { margin-top: 4px; color: #374151; font-weight: 600; }',
        '.legal { font-size: .85em; color: #9ca3af; margin-top: 4px; }',
        '.ebelge { margin-top: 6px; font-size: .82em; color: #9ca3af; }',
        '.cards { width: 100%; margin-top: 14px; }',
        '.cards td.cc { padding-right: 8px; vertical-align: top; }',
        `.card { background: ${T.tint}; border-radius: ${R}; padding: 9px 12px; border-top: 3px solid ${T.A}; }`,
        '.card .k { color: #6b7280; font-size: .78em; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }',
        `.card .v { font-size: 1.4em; font-weight: 800; color: ${T.dark}; white-space: nowrap; }`,
        `.badge { display: inline-block; padding: 1px 7px; border-radius: 9px; background: ${T.tint2}; color: ${T.dark}; font-size: .8em; font-weight: 700; }`,
        `.status { display: inline-block; padding: 4px 12px; border-radius: ${R}; background: ${T.A}; color: ${T.onA}; font-weight: 800; letter-spacing: 1px; }`,
        '@page { size: A4; margin: 8mm; }',
        '@media print { body { background: #fff; } .page { margin: 0; box-shadow: none; width: auto; } }',
    ];
    return rules.filter(Boolean).join('\n');
}

function cssReceipt(c: Ctx): string {
    const { T, p } = c;
    const [lh] = LOGO_BOX[p.logoSize] ?? LOGO_BOX.orta;
    return [
        '* { box-sizing: border-box; }',
        'table { border-collapse: collapse; font-size: inherit; line-height: inherit; color: inherit; }',
        `body { margin: 0; background: #e9ecf1; font-family: ${T.font}; font-size: ${Math.max(9.5, T.size)}px; line-height: 1.4; color: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }`,
        `.rc { width: 80mm; max-width: 100%; margin: 14px auto; background: #fff; padding: 12px 12px 16px; box-shadow: 0 4px 16px #c3c8d1;${p.colorMode !== 'sade' ? ` border-top: 5px solid ${T.A};` : ''} }`,
        '.ctr { text-align: center; }',
        `.logo { display: block; margin: 0 auto 6px; max-height: ${Math.min(lh, 80)}px; max-width: 64mm; }`,
        `.mono { width: 42px; height: 42px; line-height: 42px; margin: 0 auto 6px; text-align: center; font-size: 22px; font-weight: 800; color: ${T.onA}; background: ${T.A}; border-radius: 50%; }`,
        `.brand-name { font-family: ${T.headFont}; font-weight: 800; font-size: 1.25em; color: ${T.dark}; }`,
        '.small { font-size: .88em; color: #4b5563; }',
        `.title { margin: 8px 0 6px; padding: 5px 0; text-align: center; font-weight: 800; letter-spacing: 2px; font-size: 1.1em; color: ${p.colorMode === 'canli' ? T.onA : T.A}; background: ${p.colorMode === 'canli' ? T.A : T.tint}; }`,
        '.dash { border-top: 1px dashed #9ca3af; margin: 6px 0; height: 0; font-size: 0; line-height: 0; }',
        '.kv { width: 100%; }',
        '.kv td { padding: 1px 0; vertical-align: top; }',
        '.kv td.r, .r { text-align: right; white-space: nowrap; }',
        '.it { width: 100%; }',
        '.it td { padding: 3px 0 0; vertical-align: top; }',
        '.it .nm { font-weight: 700; }',
        '.it .calc { color: #4b5563; font-size: .92em; padding: 0 0 3px; }',
        `.grand td { font-size: 1.3em; font-weight: 800; color: ${T.A}; padding-top: 4px; }`,
        '.words { font-style: italic; font-size: .9em; margin-top: 4px; }',
        ".mono-t { font-family: Consolas, 'Courier New', monospace; font-size: .85em; word-break: break-all; }",
        '.qr-wrap { width: 120px; margin: 8px auto 4px; }',
        `.thanks { text-align: center; font-weight: 800; color: ${T.A}; margin-top: 6px; }`,
        '.fine { text-align: center; color: #6b7280; font-size: .86em; margin-top: 3px; }',
        '@page { size: 80mm auto; margin: 3mm; }',
        '@media print { body { background: #fff; } .rc { margin: 0; box-shadow: none; width: auto; border-top: 0; } }',
    ].join('\n');
}

// ---------------------------------------------------------------------------
// Ortak isimli şablonlar
// ---------------------------------------------------------------------------
const DIGITS = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
const TENS = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];
const choiceWords = (param: string, words: string[]) =>
    `<xsl:choose>${words.map((w, i) => (w ? `<xsl:when test="$${param} = ${i}">${w} </xsl:when>` : '')).join('')}<xsl:otherwise/></xsl:choose>`;

const UNIT_NAMES: [string, string][] = [
    ['C62', 'Adet'], ['NIU', 'Adet'], ['KGM', 'kg'], ['GRM', 'g'], ['LTR', 'lt'], ['MTR', 'm'], ['MTK', 'm²'], ['MTQ', 'm³'],
    ['TNE', 'ton'], ['HUR', 'saat'], ['DAY', 'gün'], ['MON', 'ay'], ['ANN', 'yıl'], ['PA', 'paket'], ['BX', 'kutu'], ['KWH', 'kWh'],
    ['SET', 'set'], ['PR', 'çift'], ['CMT', 'cm'], ['KMT', 'km'], ['D61', 'dk'], ['B32', 'kg/m²'], ['DZN', 'düzine'],
];
const TAX_NAMES: [string, string][] = [
    ['0015', 'KDV'], ['0003', 'GV Stopajı'], ['0011', 'KV Stopajı'], ['0059', 'Konaklama Vergisi'], ['0071', 'ÖTV (I. Liste)'],
    ['0073', 'ÖTV (III. Liste)'], ['0074', 'ÖTV (IV. Liste)'], ['0075', 'ÖTV (III. Liste)'], ['0076', 'ÖTV (IV. Liste)'], ['0077', 'ÖTV (V. Liste)'],
    ['0021', 'BSMV'], ['0061', 'KKDF Kesintisi'], ['1047', 'Damga Vergisi'], ['1048', '5035 Damga Vergisi'], ['4080', 'Özel İletişim Vergisi'],
    ['4081', '5035 Özel İletişim Vergisi'], ['8001', 'Borsa Tescil Ücreti'], ['8002', 'Enerji Fonu'], ['9015', 'KDV Tevkifatı'],
    ['9040', 'Mera Fonu'], ['9077', 'Motorlu Taşıt Vergisi'], ['SGK_PRIM', 'SGK Prim Kesintisi'],
];
const PAYMENT_NAMES: [string, string][] = [
    ['1', 'Belirtilmemiş'], ['10', 'Nakit'], ['20', 'Çek'], ['23', 'Banka çeki'], ['42', 'Banka havalesi / EFT'], ['46', 'EFT / havale'],
    ['48', 'Banka / kredi kartı'], ['49', 'Otomatik ödeme'], ['54', 'Kredi kartı'], ['55', 'Hesaptan'], ['68', 'Kredi kartı (çevrim içi)'],
    ['97', 'Mahsup'], ['ZZZ', 'Diğer'],
];
const mapTemplate = (name: string, param: string, pairs: [string, string][], fallback: string) =>
    `<xsl:template name="${name}"><xsl:param name="${param}"/><xsl:choose>${pairs.map(([k, l]) => `<xsl:when test="$${param}='${k}'">${esc(l)}</xsl:when>`).join('')}<xsl:otherwise>${fallback}</xsl:otherwise></xsl:choose></xsl:template>`;

const BASE_TEMPLATES = [
    '<xsl:template name="tarih"><xsl:param name="d"/><xsl:if test="string-length($d) &gt;= 10"><xsl:value-of select="concat(substring($d, 9, 2), \'.\', substring($d, 6, 2), \'.\', substring($d, 1, 4))"/></xsl:if></xsl:template>',
    '<xsl:template name="zaman"><xsl:param name="z"/><xsl:choose><xsl:when test="starts-with($z, \'1111-11-11\')">Açık bilet</xsl:when><xsl:when test="string-length($z) &gt;= 16"><xsl:value-of select="concat(substring($z, 9, 2), \'.\', substring($z, 6, 2), \'.\', substring($z, 1, 4), \' \', substring($z, 12, 5))"/></xsl:when><xsl:otherwise><xsl:call-template name="tarih"><xsl:with-param name="d" select="$z"/></xsl:call-template></xsl:otherwise></xsl:choose></xsl:template>',
    '<xsl:template name="para"><xsl:param name="n"/><xsl:param name="c"/><xsl:if test="string(number($n)) != \'NaN\'"><xsl:value-of select="format-number($n, \'###.##0,00\', \'tr\')"/><xsl:choose><xsl:when test="string($c) = \'\' or $c = \'TRY\' or $c = \'TL\'"><xsl:text> TL</xsl:text></xsl:when><xsl:otherwise><xsl:text> </xsl:text><xsl:value-of select="$c"/></xsl:otherwise></xsl:choose></xsl:if></xsl:template>',
].join('\n');

const UBL_TEMPLATES = [
    mapTemplate('birim', 'u', UNIT_NAMES, '<xsl:value-of select="$u"/>'),
    mapTemplate('odemeAdi', 'k', PAYMENT_NAMES, '<xsl:value-of select="$k"/>'),
    `<xsl:template name="vergiAdi"><xsl:param name="s"/><xsl:variable name="k" select="$s/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode"/><xsl:choose>${TAX_NAMES.map(([k, l]) => `<xsl:when test="$k='${k}'">${esc(l)}</xsl:when>`).join('')}<xsl:when test="$s/cac:TaxCategory/cac:TaxScheme/cbc:Name"><xsl:value-of select="$s/cac:TaxCategory/cac:TaxScheme/cbc:Name"/></xsl:when><xsl:otherwise>Vergi <xsl:value-of select="$k"/></xsl:otherwise></xsl:choose></xsl:template>`,
    `<xsl:template name="yazi-rakam"><xsl:param name="d"/>${choiceWords('d', DIGITS)}</xsl:template>`,
    `<xsl:template name="yazi-onlar"><xsl:param name="d"/>${choiceWords('d', TENS)}</xsl:template>`,
    '<xsl:template name="yazi-uc"><xsl:param name="n"/><xsl:variable name="y" select="floor($n div 100)"/>'
    + '<xsl:if test="$y &gt; 1"><xsl:call-template name="yazi-rakam"><xsl:with-param name="d" select="$y"/></xsl:call-template></xsl:if>'
    + '<xsl:if test="$y &gt; 0">Yüz </xsl:if>'
    + '<xsl:call-template name="yazi-onlar"><xsl:with-param name="d" select="floor(($n mod 100) div 10)"/></xsl:call-template>'
    + '<xsl:call-template name="yazi-rakam"><xsl:with-param name="d" select="$n mod 10"/></xsl:call-template></xsl:template>',
    '<xsl:template name="yazi-sayi"><xsl:param name="n"/><xsl:choose><xsl:when test="$n = 0">Sıfır </xsl:when><xsl:otherwise>'
    + '<xsl:variable name="mr" select="floor($n div 1000000000)"/><xsl:variable name="mn" select="floor(($n mod 1000000000) div 1000000)"/>'
    + '<xsl:variable name="bn" select="floor(($n mod 1000000) div 1000)"/><xsl:variable name="r" select="$n mod 1000"/>'
    + '<xsl:if test="$mr &gt; 0"><xsl:call-template name="yazi-uc"><xsl:with-param name="n" select="$mr"/></xsl:call-template>Milyar </xsl:if>'
    + '<xsl:if test="$mn &gt; 0"><xsl:call-template name="yazi-uc"><xsl:with-param name="n" select="$mn"/></xsl:call-template>Milyon </xsl:if>'
    + '<xsl:if test="$bn &gt; 1"><xsl:call-template name="yazi-uc"><xsl:with-param name="n" select="$bn"/></xsl:call-template></xsl:if><xsl:if test="$bn &gt; 0">Bin </xsl:if>'
    + '<xsl:if test="$r &gt; 0"><xsl:call-template name="yazi-uc"><xsl:with-param name="n" select="$r"/></xsl:call-template></xsl:if>'
    + '</xsl:otherwise></xsl:choose></xsl:template>',
    '<xsl:template name="yaziyla"><xsl:param name="n"/><xsl:param name="c"/><xsl:if test="string(number($n)) != \'NaN\'">'
    + '<xsl:variable name="k" select="round(number($n) * 100)"/><xsl:variable name="tl" select="floor($k div 100)"/><xsl:variable name="kr" select="$k mod 100"/>'
    + '<xsl:variable name="w"><xsl:call-template name="yazi-sayi"><xsl:with-param name="n" select="$tl"/></xsl:call-template></xsl:variable>'
    + '<xsl:variable name="wk"><xsl:if test="$kr &gt; 0"><xsl:call-template name="yazi-sayi"><xsl:with-param name="n" select="$kr"/></xsl:call-template></xsl:if></xsl:variable>'
    + '<xsl:variable name="tr" select="string($c) = \'\' or $c = \'TRY\' or $c = \'TL\'"/>'
    + '<b>Yalnız:</b><xsl:text> </xsl:text><xsl:value-of select="normalize-space($w)"/><xsl:text> </xsl:text>'
    + '<xsl:choose><xsl:when test="$tr">Türk Lirası</xsl:when><xsl:when test="$c = \'USD\'">ABD Doları</xsl:when><xsl:when test="$c = \'EUR\'">Avro</xsl:when><xsl:when test="$c = \'GBP\'">İngiliz Sterlini</xsl:when><xsl:otherwise><xsl:value-of select="$c"/></xsl:otherwise></xsl:choose>'
    + '<xsl:if test="$kr &gt; 0"><xsl:text>, </xsl:text><xsl:value-of select="normalize-space($wk)"/><xsl:text> </xsl:text><xsl:choose><xsl:when test="$tr">Kuruş</xsl:when><xsl:otherwise>Cent</xsl:otherwise></xsl:choose></xsl:if>'
    + '</xsl:if></xsl:template>',
    '<xsl:template name="taraf"><xsl:param name="p"/>'
    + '<div class="pname"><xsl:choose><xsl:when test="$p/cac:PartyName/cbc:Name"><xsl:value-of select="$p/cac:PartyName/cbc:Name"/></xsl:when><xsl:otherwise><xsl:value-of select="$p/cac:Person/cbc:FirstName"/><xsl:text> </xsl:text><xsl:value-of select="$p/cac:Person/cbc:FamilyName"/></xsl:otherwise></xsl:choose></div>'
    + '<xsl:if test="$p/cac:PartyName/cbc:Name and $p/cac:Person/cbc:FamilyName"><div class="pl"><xsl:value-of select="$p/cac:Person/cbc:FirstName"/><xsl:text> </xsl:text><xsl:value-of select="$p/cac:Person/cbc:FamilyName"/></div></xsl:if>'
    + '<xsl:for-each select="$p/cac:PostalAddress[1]">'
    + '<div class="pl"><xsl:value-of select="cbc:StreetName"/><xsl:if test="cbc:BuildingName"><xsl:text> </xsl:text><xsl:value-of select="cbc:BuildingName"/></xsl:if><xsl:if test="cbc:BuildingNumber"><xsl:text> No: </xsl:text><xsl:value-of select="cbc:BuildingNumber"/></xsl:if></div>'
    + '<div class="pl"><xsl:if test="cbc:PostalZone"><xsl:value-of select="cbc:PostalZone"/><xsl:text> </xsl:text></xsl:if><xsl:value-of select="cbc:CitySubdivisionName"/><xsl:if test="cbc:CitySubdivisionName and cbc:CityName"><xsl:text> / </xsl:text></xsl:if><xsl:value-of select="cbc:CityName"/><xsl:if test="cac:Country/cbc:Name"><xsl:text> · </xsl:text><xsl:value-of select="cac:Country/cbc:Name"/></xsl:if></div>'
    + '</xsl:for-each>'
    + '<table class="pt">'
    + '<xsl:for-each select="$p/cac:PartyIdentification/cbc:ID[@schemeID=\'VKN\' or @schemeID=\'TCKN\']"><tr><th><xsl:value-of select="@schemeID"/></th><td><xsl:value-of select="."/></td></tr></xsl:for-each>'
    + '<xsl:if test="$p/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"><tr><th>Vergi Dairesi</th><td><xsl:value-of select="$p/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/></td></tr></xsl:if>'
    + '<xsl:for-each select="$p/cac:PartyIdentification/cbc:ID[@schemeID=\'MERSISNO\' or @schemeID=\'TICARETSICILNO\' or @schemeID=\'MUSTERINO\']"><tr><th><xsl:choose><xsl:when test="@schemeID=\'MERSISNO\'">Mersis No</xsl:when><xsl:when test="@schemeID=\'TICARETSICILNO\'">Ticaret Sicil</xsl:when><xsl:otherwise>Müşteri No</xsl:otherwise></xsl:choose></th><td><xsl:value-of select="."/></td></tr></xsl:for-each>'
    + '<xsl:if test="$p/cac:Contact/cbc:Telephone"><tr><th>Telefon</th><td><xsl:value-of select="$p/cac:Contact/cbc:Telephone"/></td></tr></xsl:if>'
    + '<xsl:if test="$p/cac:Contact/cbc:ElectronicMail"><tr><th>E-posta</th><td><xsl:value-of select="$p/cac:Contact/cbc:ElectronicMail"/></td></tr></xsl:if>'
    + '<xsl:if test="$p/cbc:WebsiteURI"><tr><th>Web</th><td><xsl:value-of select="$p/cbc:WebsiteURI"/></td></tr></xsl:if>'
    + '</table></xsl:template>',
].join('\n');

// ---------------------------------------------------------------------------
// Belge profilleri
// ---------------------------------------------------------------------------
type UblFamily = 'invoice' | 'creditNote' | 'despatch' | 'receiptAdvice';

interface UblDoc {
    family: UblFamily;
    root: string;
    sup: string;
    cus: string;
    supLabel: string;
    cusLabel: string;
    typeCode: string;
    noLabel: string;
    title: string;
    lineTag: string;
    qtyTag: string;
}

const PARTY_LABELS: Record<string, [string, string]> = {
    fatura: ['Satıcı', 'Alıcı'],
    arsiv: ['Satıcı', 'Alıcı'],
    ihracat: ['İhracatçı / Satıcı', 'Alıcı (Yurt Dışı)'],
    smm: ['Serbest Meslek Erbabı', 'Müşteri'],
    bilet: ['Bileti Düzenleyen', 'Yolcu / İzleyici'],
    irsaliye: ['Gönderen', 'Alıcı (Teslim Alan)'],
    'irsaliye-yanit': ['Yanıtı Düzenleyen (Alıcı)', 'Malı Gönderen'],
    mustahsil: ['Makbuzu Düzenleyen (Alıcı)', 'Malı Satan Üretici'],
    'gider-pusulasi': ['Düzenleyen (Alan)', 'Malı Satan / İade Eden'],
    doviz: ['Yetkili Müessese / Banka', 'Müşteri'],
    dekont: ['Banka / Ödeme Kuruluşu', 'Müşteri'],
    'sigorta-komisyon': ['Sigorta Şirketi', 'Acente / Broker'],
};

const NO_LABELS: Record<string, string> = {
    fatura: 'Fatura No', arsiv: 'Fatura No', ihracat: 'Fatura No', smm: 'Makbuz No', bilet: 'Bilet No', irsaliye: 'İrsaliye No',
    'irsaliye-yanit': 'Yanıt No', mustahsil: 'Makbuz No', 'gider-pusulasi': 'Belge No', doviz: 'Belge No', dekont: 'Dekont No', 'sigorta-komisyon': 'Belge No',
};

function titleOf(dt: WizardDocType): string {
    switch (dt.id) {
        case 'fatura':
            return '<xsl:choose><xsl:when test="cbc:ProfileID=\'EARSIVFATURA\'">e-ARŞİV FATURA</xsl:when><xsl:when test="cbc:ProfileID=\'TEMELFATURA\' or cbc:ProfileID=\'TICARIFATURA\'">e-FATURA</xsl:when><xsl:otherwise>e-FATURA</xsl:otherwise></xsl:choose>';
        case 'arsiv': return 'e-ARŞİV FATURA';
        case 'ihracat': return '<xsl:choose><xsl:when test="cbc:ProfileID=\'YOLCUBERABERFATURA\'">YOLCU BERABER FATURA</xsl:when><xsl:otherwise>İHRACAT FATURASI</xsl:otherwise></xsl:choose>';
        case 'smm': return 'e-SERBEST MESLEK MAKBUZU';
        case 'bilet': return 'e-BİLET';
        case 'irsaliye': return 'e-İRSALİYE';
        case 'irsaliye-yanit': return 'e-İRSALİYE YANITI';
        case 'mustahsil': return 'e-MÜSTAHSİL MAKBUZU';
        case 'gider-pusulasi': return 'e-GİDER PUSULASI';
        case 'doviz': return '<xsl:choose><xsl:when test="cbc:ProfileID=\'EKIYMETLIMADENBELGE\'">KIYMETLİ MADEN ALIM SATIM BELGESİ</xsl:when><xsl:otherwise>e-DÖVİZ ALIM SATIM BELGESİ</xsl:otherwise></xsl:choose>';
        case 'dekont': return '<xsl:choose><xsl:when test="starts-with(cbc:ProfileID, \'GVTA\')">GÜMRÜK VERGİSİ TAHSİL ALINDISI</xsl:when><xsl:when test="starts-with(cbc:ProfileID, \'VTA\')">VERGİ TAHSİL ALINDISI</xsl:when><xsl:otherwise>e-DEKONT</xsl:otherwise></xsl:choose>';
        case 'sigorta-komisyon': return 'e-SİGORTA KOMİSYON GİDER BELGESİ';
        default: return esc(dt.label.toLocaleUpperCase('tr-TR'));
    }
}

function ublDoc(dt: WizardDocType): UblDoc {
    const [supLabel, cusLabel] = PARTY_LABELS[dt.id] ?? ['Düzenleyen', 'Alıcı'];
    const base = { supLabel, cusLabel, noLabel: NO_LABELS[dt.id] ?? 'Belge No', title: titleOf(dt) };
    switch (dt.family) {
        case 'despatch':
            return { ...base, family: 'despatch', root: 'DespatchAdvice', sup: 'cac:DespatchSupplierParty/cac:Party', cus: 'cac:DeliveryCustomerParty/cac:Party', typeCode: 'cbc:DespatchAdviceTypeCode', lineTag: 'cac:DespatchLine', qtyTag: 'cbc:DeliveredQuantity' };
        case 'receiptAdvice':
            return { ...base, family: 'receiptAdvice', root: 'ReceiptAdvice', sup: 'cac:DeliveryCustomerParty/cac:Party', cus: 'cac:DespatchSupplierParty/cac:Party', typeCode: 'cbc:ReceiptAdviceTypeCode', lineTag: 'cac:ReceiptLine', qtyTag: 'cbc:ReceivedQuantity' };
        case 'creditNote':
            return { ...base, family: 'creditNote', root: 'CreditNote', sup: 'cac:AccountingSupplierParty/cac:Party', cus: 'cac:AccountingCustomerParty/cac:Party', typeCode: 'cbc:CreditNoteTypeCode', lineTag: 'cac:CreditNoteLine', qtyTag: 'cbc:CreditedQuantity' };
        default:
            return { ...base, family: 'invoice', root: 'Invoice', sup: 'cac:AccountingSupplierParty/cac:Party', cus: 'cac:AccountingCustomerParty/cac:Party', typeCode: 'cbc:InvoiceTypeCode', lineTag: 'cac:InvoiceLine', qtyTag: 'cbc:InvoicedQuantity' };
    }
}

// ---------------------------------------------------------------------------
// Başlık
// ---------------------------------------------------------------------------
interface MetaRow { label: string; value: string; test: string; mono?: boolean }

const SUP_NAME_VAR = '<xsl:variable name="supName"><xsl:choose><xsl:when test="$sup/cac:PartyName/cbc:Name"><xsl:value-of select="$sup/cac:PartyName/cbc:Name"/></xsl:when><xsl:otherwise><xsl:value-of select="concat($sup/cac:Person/cbc:FirstName, \' \', $sup/cac:Person/cbc:FamilyName)"/></xsl:otherwise></xsl:choose></xsl:variable>';

function brand(c: Ctx, name: string, monogram: string, align: 'l' | 'c' | 'r', onBand: boolean): string {
    const { p } = c;
    const img = p.logo ? `<img class="logo" data-xslt-obj="obj-logo" alt="${escAttr(p.companyName || 'Logo')}" src="${escAttr(p.logo)}"/>` : '';
    const logo = p.logo ? (onBand ? `<span class="logo-box">${img}</span>` : img) : `<div class="mono">${monogram}</div>`;
    const prof = p.profession && c.on('meslek') ? `<div class="prof">${esc(p.profession)}</div>` : '';
    const slogan = p.texts.slogan ? `<div class="slogan">${esc(p.texts.slogan)}</div>` : '';
    const text = `<div class="brand-name">${name}</div>${prof}${slogan}`;
    if (align === 'c') return `<div class="brand-c">${logo}${text}</div>`;
    const cells = [`<td class="brand-logo">${logo}</td>`, `<td class="brand-text">${text}</td>`];
    if (align === 'r') cells.reverse();
    return `<table class="brand${align === 'r' ? ' brand-r' : ''}"><tr>${cells.join('')}</tr></table>`;
}

const metaTable = (rows: MetaRow[]) =>
    `<table class="meta">${rows.map(r => iff(r.test, `<tr><th>${esc(r.label)}</th><td${r.mono ? ' class="ettn"' : ''}>${r.value}</td></tr>`)).join('')}</table>`;

const metaStrip = (rows: MetaRow[]) => {
    const main = rows.filter(r => !r.mono);
    const mono = rows.filter(r => r.mono);
    return `<table class="strip"><tr>${main.map(r => iff(r.test, `<td><div class="k">${esc(r.label)}</div><div class="v">${r.value}</div></td>`)).join('')}</tr></table>`
        + mono.map(r => iff(r.test, `<div class="ettn-line">${esc(r.label)}: <span class="ettn">${r.value}</span></div>`)).join('');
};

const titleBlock = (title: string, sub: string, align: 'l' | 'r', meta: string) =>
    `<div class="${align === 'r' ? 'tb-r' : 'tb-l'}"><div class="doc-title">${title}</div>${sub ? `<div class="doc-sub">${sub}</div>` : ''}${meta}</div>`;

function header(c: Ctx, o: { name: string; monogram: string; title: string; sub: string; meta: MetaRow[] }): string {
    const { p, L } = c;
    const qrTop = c.qr && p.qrPosition !== 'alt';
    const qrTd = (side: 'l' | 'r') => `<td class="qr-cell qr-${side}">${karekodSnippet('obj-karekod', true)}</td>`;
    const qL = qrTop && p.qrPosition === 'sol-ust' ? qrTd('l') : '';
    const qR = qrTop && p.qrPosition === 'sag-ust' ? qrTd('r') : '';
    const pos = p.logoPosition;
    const note = p.texts.headerNote ? `<div class="topnote">${esc(p.texts.headerNote)}</div>` : '';

    if (pos === 'orta' || L.header === 2) {
        const align = pos === 'orta' ? 'c' : pos === 'sag' ? 'r' : 'l';
        const top = L.header === 1
            ? `<div class="band">${brand(c, o.name, o.monogram, align, true)}</div>`
            : `<div class="in" style="padding-top:18px">${brand(c, o.name, o.monogram, align, false)}<div class="rule"><xsl:text> </xsl:text></div></div>`;
        const row = `<table class="hdr"><tr>${qL}<td class="mid">${titleBlock(o.title, o.sub, 'l', '')}</td><td class="mid"><div class="tb-r">${metaTable(o.meta)}</div></td>${qR}</tr></table>`;
        return `${note}${top}<div class="in">${row}</div>`;
    }
    if (L.header === 1) {
        const left = pos === 'sol' ? brand(c, o.name, o.monogram, 'l', true) : titleBlock(o.title, o.sub, 'l', '');
        const right = pos === 'sol' ? titleBlock(o.title, o.sub, 'r', '') : brand(c, o.name, o.monogram, 'r', true);
        return `${note}<div class="band"><table class="hdr0"><tr><td class="mid">${left}</td><td class="mid">${right}</td></tr></table></div>`
            + `<div class="in"><table class="hdr"><tr>${qL}<td class="mid">${metaStrip(o.meta)}</td>${qR}</tr></table></div>`;
    }
    const left = pos === 'sol' ? brand(c, o.name, o.monogram, 'l', false) : titleBlock(o.title, o.sub, 'l', metaTable(o.meta));
    const right = pos === 'sol' ? titleBlock(o.title, o.sub, 'r', metaTable(o.meta)) : brand(c, o.name, o.monogram, 'r', false);
    return `${note}<div class="in"><table class="hdr"><tr>${qL}<td>${left}</td><td>${right}</td>${qR}</tr></table></div>`;
}

function ublMeta(c: Ctx, d: UblDoc): MetaRow[] {
    const id = c.dt.id;
    const rows: MetaRow[] = [
        { label: d.noLabel, value: v('cbc:ID'), test: 'cbc:ID' },
        { label: 'Tarih', value: `${date('cbc:IssueDate')}<xsl:if test="cbc:IssueTime">${xt(' ')}${v('substring(cbc:IssueTime, 1, 5)')}</xsl:if>`, test: 'cbc:IssueDate' },
        { label: 'Senaryo', value: v('cbc:ProfileID'), test: 'cbc:ProfileID' },
        { label: id === 'doviz' ? 'İşlem Tipi' : 'Tip', value: v(d.typeCode), test: d.typeCode },
    ];
    if (d.family === 'invoice' && c.on('odeme')) {
        rows.push({ label: 'Vade', value: date('(cac:PaymentMeans/cbc:PaymentDueDate | cac:PaymentTerms/cbc:PaymentDueDate)[1]'), test: 'cac:PaymentMeans/cbc:PaymentDueDate or cac:PaymentTerms/cbc:PaymentDueDate' });
    }
    if (d.family === 'despatch' && c.on('sevkTarih')) {
        rows.push({
            label: 'Fiili Sevk', test: 'cac:Shipment/cac:Delivery/cac:Despatch/cbc:ActualDespatchDate',
            value: `${date('cac:Shipment/cac:Delivery/cac:Despatch/cbc:ActualDespatchDate')}${xt(' ')}${v('substring(cac:Shipment/cac:Delivery/cac:Despatch/cbc:ActualDespatchTime, 1, 5)')}`,
        });
    }
    if (d.family === 'receiptAdvice') {
        rows.push({ label: 'İrsaliye No', value: v('cac:DespatchDocumentReference/cbc:ID'), test: 'cac:DespatchDocumentReference/cbc:ID', mono: true });
        rows.push({ label: 'Teslim Tarihi', value: date('cac:Shipment/cac:Delivery/cbc:ActualDeliveryDate'), test: 'cac:Shipment/cac:Delivery/cbc:ActualDeliveryDate' });
    }
    if (id === 'mustahsil') rows.push({ label: 'Teslim Tarihi', value: date('cac:Delivery/cbc:ActualDeliveryDate'), test: 'cac:Delivery/cbc:ActualDeliveryDate' });
    if (id === 'sigorta-komisyon' && c.on('donem')) {
        rows.push({ label: 'Dönem', value: `${date('cac:InvoicePeriod/cbc:StartDate')}${xt(' – ')}${date('cac:InvoicePeriod/cbc:EndDate')}`, test: 'cac:InvoicePeriod/cbc:StartDate' });
    }
    rows.push({ label: 'ETTN', value: v('cbc:UUID'), test: 'cbc:UUID', mono: true });
    return rows;
}

// ---------------------------------------------------------------------------
// Bilgi kutuları
// ---------------------------------------------------------------------------
interface Row { label: string; value: string; test?: string }
interface Box { title: string; test: string; rows?: Row[]; raw?: string }

const kvRows = (rows: Row[]) => rows.map(r => iff(r.test ?? '', `<tr><th>${esc(r.label)}</th><td>${r.value}</td></tr>`)).join('');

function renderBoxes(boxes: Box[]): string {
    if (!boxes.length) return '';
    const chunks: Box[][] = [];
    for (let i = 0; i < boxes.length; i += 3) chunks.push(boxes.slice(i, i + 3));
    return chunks.map(chunk => `<div class="in"><table class="infos"><tr>${chunk.map(b =>
        iff(b.test, `<td class="icell"><div class="ibox"><div class="ilabel">${esc(b.title)}</div>${b.rows ? `<table class="kv">${kvRows(b.rows)}</table>` : ''}${b.raw ?? ''}</div></td>`)).join('')}</tr></table></div>`).join('');
}

const addressLines = (sel: string) => each(sel,
    `<div>${v('cbc:StreetName')}<xsl:if test="cbc:BuildingNumber">${xt(' No: ')}${v('cbc:BuildingNumber')}</xsl:if></div>`
    + `<div><xsl:if test="cbc:PostalZone">${v('cbc:PostalZone')}${xt(' ')}</xsl:if>${v('cbc:CitySubdivisionName')}<xsl:if test="cbc:CityName">${xt(' / ')}${v('cbc:CityName')}</xsl:if><xsl:if test="cac:Country/cbc:Name">${xt(' · ')}${v('cac:Country/cbc:Name')}</xsl:if></div>`);

const personName = (sel: string) => `${v(`${sel}/cbc:FirstName`)}${xt(' ')}${v(`${sel}/cbc:FamilyName`)}`;

function ublBoxes(c: Ctx, d: UblDoc): Box[] {
    const id = c.dt.id;
    const on = c.on;
    const boxes: Box[] = [];
    if (d.family === 'invoice') {
        if (on('referans')) {
            boxes.push({
                title: 'Referanslar', test: 'cac:OrderReference or cac:DespatchDocumentReference or cac:BillingReference',
                rows: [
                    { label: 'Sipariş No', value: `${v('cac:OrderReference/cbc:ID')}<xsl:if test="cac:OrderReference/cbc:IssueDate">${xt(' (')}${date('cac:OrderReference/cbc:IssueDate')}${xt(')')}</xsl:if>`, test: 'cac:OrderReference/cbc:ID' },
                    { label: 'İrsaliye', value: commaList('cac:DespatchDocumentReference', `${v('cbc:ID')}<xsl:if test="cbc:IssueDate">${xt(' (')}${date('cbc:IssueDate')}${xt(')')}</xsl:if>`), test: 'cac:DespatchDocumentReference' },
                    { label: 'İlgili Fatura', value: commaList('cac:BillingReference/cac:InvoiceDocumentReference', v('cbc:ID')), test: 'cac:BillingReference/cac:InvoiceDocumentReference/cbc:ID' },
                ],
            });
        }
        if (on('odeme')) {
            boxes.push({
                title: 'Ödeme Bilgileri', test: 'cac:PaymentMeans or cac:PaymentTerms',
                rows: [
                    { label: 'Ödeme Şekli', value: call('odemeAdi', { k: 'cac:PaymentMeans/cbc:PaymentMeansCode' }), test: 'cac:PaymentMeans/cbc:PaymentMeansCode' },
                    { label: 'Vade', value: date('(cac:PaymentMeans/cbc:PaymentDueDate | cac:PaymentTerms/cbc:PaymentDueDate)[1]'), test: 'cac:PaymentMeans/cbc:PaymentDueDate or cac:PaymentTerms/cbc:PaymentDueDate' },
                    { label: 'Hesap', value: `<span class="code">${v('cac:PaymentMeans/cac:PayeeFinancialAccount/cbc:ID')}</span>`, test: 'cac:PaymentMeans/cac:PayeeFinancialAccount/cbc:ID' },
                    { label: 'Açıklama', value: v('cac:PaymentMeans/cbc:InstructionNote'), test: 'cac:PaymentMeans/cbc:InstructionNote' },
                    { label: 'Koşullar', value: v('cac:PaymentTerms/cbc:Note'), test: 'cac:PaymentTerms/cbc:Note' },
                    { label: 'Gecikme', value: `%${v('cac:PaymentTerms/cbc:PenaltySurchargePercent')}`, test: 'cac:PaymentTerms/cbc:PenaltySurchargePercent' },
                ],
            });
        }
        if (on('kur')) {
            boxes.push({
                title: 'Döviz Bilgisi', test: "cac:PricingExchangeRate or ($cur != '' and $cur != 'TRY')",
                rows: [
                    { label: 'Para Birimi', value: v('$cur') },
                    { label: 'Kur', value: num('cac:PricingExchangeRate/cbc:CalculationRate', '###.##0,0000'), test: 'cac:PricingExchangeRate/cbc:CalculationRate' },
                    { label: 'Kur Tarihi', value: date('cac:PricingExchangeRate/cbc:Date'), test: 'cac:PricingExchangeRate/cbc:Date' },
                ],
            });
        }
        if (on('internetSatis')) {
            boxes.push({
                title: 'İnternet Satışı', test: 'cac:Delivery or cac:PaymentMeans or $sup/cbc:WebsiteURI',
                rows: [
                    { label: 'Satış Sitesi', value: v('$sup/cbc:WebsiteURI'), test: '$sup/cbc:WebsiteURI' },
                    { label: 'Gönderim Tarihi', value: date('cac:Delivery/cac:Despatch/cbc:ActualDespatchDate'), test: 'cac:Delivery/cac:Despatch/cbc:ActualDespatchDate' },
                    { label: 'Taşıyıcı', value: `${v('cac:Delivery/cac:CarrierParty/cac:PartyName/cbc:Name')}<xsl:if test="cac:Delivery/cac:CarrierParty/cac:PartyIdentification/cbc:ID">${xt(' · VKN ')}${v('cac:Delivery/cac:CarrierParty/cac:PartyIdentification/cbc:ID')}</xsl:if>`, test: 'cac:Delivery/cac:CarrierParty' },
                    { label: 'Ödeme Aracı', value: `<xsl:choose><xsl:when test="cac:PaymentMeans/cbc:InstructionNote">${v('cac:PaymentMeans/cbc:InstructionNote')}</xsl:when><xsl:otherwise>${call('odemeAdi', { k: 'cac:PaymentMeans/cbc:PaymentMeansCode' })}</xsl:otherwise></xsl:choose>`, test: 'cac:PaymentMeans' },
                    { label: 'Ödeme Tarihi', value: date('cac:PaymentMeans/cbc:PaymentDueDate'), test: 'cac:PaymentMeans/cbc:PaymentDueDate' },
                ],
            });
        }
        if (on('ihracatBilgi')) {
            boxes.push({
                title: 'Teslim ve Gümrük', test: 'cac:Delivery or cac:InvoiceLine/cac:Delivery',
                rows: [
                    { label: 'Teslim Şartı', value: v('(cac:Delivery/cac:DeliveryTerms/cbc:ID | cac:InvoiceLine/cac:Delivery/cac:DeliveryTerms/cbc:ID)[1]'), test: 'cac:Delivery/cac:DeliveryTerms/cbc:ID or cac:InvoiceLine/cac:Delivery/cac:DeliveryTerms/cbc:ID' },
                    { label: 'Taşıma Şekli', value: v('(//cac:ShipmentStage/cbc:TransportModeCode)[1]'), test: '//cac:ShipmentStage/cbc:TransportModeCode' },
                    { label: 'Teslim Yeri', value: `${v('(cac:Delivery/cac:DeliveryAddress | cac:InvoiceLine/cac:Delivery/cac:DeliveryAddress)[1]/cbc:CityName')}${xt(' ')}${v('(cac:Delivery/cac:DeliveryAddress | cac:InvoiceLine/cac:Delivery/cac:DeliveryAddress)[1]/cac:Country/cbc:Name')}`, test: 'cac:Delivery/cac:DeliveryAddress or cac:InvoiceLine/cac:Delivery/cac:DeliveryAddress' },
                    { label: 'Kap Sayısı', value: v('(//cac:TransportHandlingUnit/cac:ActualPackage/cbc:Quantity)[1]'), test: '//cac:TransportHandlingUnit/cac:ActualPackage/cbc:Quantity' },
                ],
            });
        }
        if (on('sefer')) {
            boxes.push({
                title: 'Seyahat / Etkinlik', test: 'cac:InvoicePeriod or cac:BuyerCustomerParty or $cus/cac:Person',
                rows: [
                    { label: 'Tarih', value: `${date('cac:InvoicePeriod/cbc:StartDate')}${xt(' ')}${v('substring(cac:InvoicePeriod/cbc:StartTime, 1, 5)')}`, test: 'cac:InvoicePeriod/cbc:StartDate' },
                    { label: 'Sefer / Etkinlik', value: v('cac:InvoicePeriod/cbc:Description'), test: 'cac:InvoicePeriod/cbc:Description' },
                    { label: 'Yolcu', value: `<xsl:choose><xsl:when test="cac:BuyerCustomerParty/cac:Party/cac:Person">${personName('cac:BuyerCustomerParty/cac:Party/cac:Person')}</xsl:when><xsl:otherwise>${personName('$cus/cac:Person')}</xsl:otherwise></xsl:choose>`, test: 'cac:BuyerCustomerParty/cac:Party/cac:Person or $cus/cac:Person' },
                    { label: 'Ödeme', value: call('odemeAdi', { k: 'cac:PaymentMeans/cbc:PaymentMeansCode' }), test: 'cac:PaymentMeans/cbc:PaymentMeansCode' },
                ],
            });
        }
    }
    if (d.family === 'despatch') {
        if (on('referans')) {
            boxes.push({
                title: 'Sipariş', test: 'cac:OrderReference',
                rows: [
                    { label: 'Sipariş No', value: v('cac:OrderReference/cbc:ID') },
                    { label: 'Sipariş Tarihi', value: date('cac:OrderReference/cbc:IssueDate'), test: 'cac:OrderReference/cbc:IssueDate' },
                ],
            });
        }
        if (on('arac')) {
            boxes.push({
                title: 'Araç', test: 'cac:Shipment/cac:ShipmentStage/cac:TransportMeans or cac:Shipment/cac:TransportHandlingUnit/cac:TransportEquipment',
                rows: [
                    { label: 'Plaka', value: commaList('cac:Shipment/cac:ShipmentStage/cac:TransportMeans/cac:RoadTransport/cbc:LicensePlateID', `<b>${v('.')}</b>`), test: 'cac:Shipment/cac:ShipmentStage/cac:TransportMeans/cac:RoadTransport/cbc:LicensePlateID' },
                    { label: 'Dorse', value: commaList('cac:Shipment/cac:TransportHandlingUnit/cac:TransportEquipment/cbc:ID', `<b>${v('.')}</b>`), test: 'cac:Shipment/cac:TransportHandlingUnit/cac:TransportEquipment/cbc:ID' },
                ],
            });
        }
        if (on('sofor')) {
            boxes.push({
                title: 'Şoför / Taşıyıcı', test: 'cac:Shipment/cac:ShipmentStage/cac:DriverPerson or cac:Shipment/cac:Delivery/cac:CarrierParty',
                raw: `<table class="kv">${each('cac:Shipment/cac:ShipmentStage/cac:DriverPerson', `<tr><th>Şoför</th><td><b>${personName('.')}</b><xsl:if test="cbc:NationalityID">${xt(' · TCKN ')}${v('cbc:NationalityID')}</xsl:if></td></tr>`)}`
                    + iff('cac:Shipment/cac:Delivery/cac:CarrierParty', `<tr><th>Taşıyıcı</th><td>${v('cac:Shipment/cac:Delivery/cac:CarrierParty/cac:PartyName/cbc:Name')}<xsl:if test="cac:Shipment/cac:Delivery/cac:CarrierParty/cac:PartyIdentification/cbc:ID">${xt(' · ')}${v('cac:Shipment/cac:Delivery/cac:CarrierParty/cac:PartyIdentification/cbc:ID/@schemeID')}${xt(' ')}${v('cac:Shipment/cac:Delivery/cac:CarrierParty/cac:PartyIdentification/cbc:ID')}</xsl:if></td></tr>`)
                    + '</table>',
            });
        }
        if (on('sevkAdres')) {
            boxes.push({
                title: 'Teslimat Adresi', test: 'cac:Shipment/cac:Delivery/cac:DeliveryAddress or cac:Shipment/cac:DeliveryAddress',
                raw: addressLines('(cac:Shipment/cac:Delivery/cac:DeliveryAddress | cac:Shipment/cac:DeliveryAddress)[1]'),
            });
        }
        if (on('paket')) {
            boxes.push({
                title: 'Ambalaj / Palet', test: 'cac:Shipment/cbc:TotalTransportHandlingUnitQuantity or cac:Shipment/cbc:GrossWeightMeasure or cac:Shipment/cac:TransportHandlingUnit/cac:ActualPackage',
                rows: [
                    { label: 'Toplam Kap', value: v('cac:Shipment/cbc:TotalTransportHandlingUnitQuantity'), test: 'cac:Shipment/cbc:TotalTransportHandlingUnitQuantity' },
                    { label: 'Brüt Ağırlık', value: `${num('cac:Shipment/cbc:GrossWeightMeasure', '###.##0,##')}${xt(' ')}${call('birim', { u: 'cac:Shipment/cbc:GrossWeightMeasure/@unitCode' })}`, test: 'cac:Shipment/cbc:GrossWeightMeasure' },
                    { label: 'Paketler', value: commaList('cac:Shipment/cac:TransportHandlingUnit/cac:ActualPackage', `${v('cbc:Quantity')}${xt(' ')}${v('cbc:PackagingTypeCode')}`), test: 'cac:Shipment/cac:TransportHandlingUnit/cac:ActualPackage' },
                ],
            });
        }
    }
    if (d.family === 'receiptAdvice' && on('referans')) {
        boxes.push({
            title: 'Referanslar', test: 'cac:DespatchDocumentReference or cac:OrderReference',
            rows: [
                { label: 'İrsaliye Tarihi', value: date('cac:DespatchDocumentReference/cbc:IssueDate'), test: 'cac:DespatchDocumentReference/cbc:IssueDate' },
                { label: 'Sipariş No', value: v('cac:OrderReference/cbc:ID'), test: 'cac:OrderReference/cbc:ID' },
                { label: 'Sipariş Tarihi', value: date('cac:OrderReference/cbc:IssueDate'), test: 'cac:OrderReference/cbc:IssueDate' },
            ],
        });
    }
    if (on('smsDogrulama')) {
        boxes.push({
            title: 'SMS / Kod Doğrulama', test: '$cus/cac:Contact[cbc:ID] or $sup/cac:Contact/cac:OtherCommunication',
            rows: [
                { label: 'Kod Türü', value: v('$cus/cac:Contact[cbc:ID][1]/cbc:Name'), test: '$cus/cac:Contact[cbc:ID]/cbc:Name' },
                { label: 'Kod', value: `<b>${v('$cus/cac:Contact[cbc:ID][1]/cbc:ID')}</b>`, test: '$cus/cac:Contact[cbc:ID]' },
                { label: 'Telefon', value: v('$cus/cac:Contact[cbc:ID][1]/cbc:Telephone'), test: '$cus/cac:Contact[cbc:ID]/cbc:Telephone' },
                { label: 'Operatör', value: `${v('$sup/cac:Contact/cac:OtherCommunication/cbc:ChannelCode')}<xsl:if test="$sup/cac:Contact/cac:OtherCommunication/cbc:Value">${xt(' · VKN ')}${v('$sup/cac:Contact/cac:OtherCommunication/cbc:Value')}</xsl:if>`, test: '$sup/cac:Contact/cac:OtherCommunication' },
            ],
        });
    }
    if (on('iadeBilgi')) {
        boxes.push({
            title: 'İade Bilgisi', test: 'cac:BillingReference or cac:Delivery/cac:DeliveryParty',
            rows: [
                { label: 'İade Belgesi', value: `${v('cac:BillingReference/cac:InvoiceDocumentReference/cbc:ID')}<xsl:if test="cac:BillingReference/cac:InvoiceDocumentReference/cbc:ID/@schemeID">${xt(' (')}${v('cac:BillingReference/cac:InvoiceDocumentReference/cbc:ID/@schemeID')}${xt(')')}</xsl:if>`, test: 'cac:BillingReference/cac:InvoiceDocumentReference' },
                { label: 'Kargo Firması', value: v('cac:Delivery/cac:DeliveryParty/cac:PartyName/cbc:Name'), test: 'cac:Delivery/cac:DeliveryParty/cac:PartyName/cbc:Name' },
                { label: 'Yetki Belge No', value: v("cac:Delivery/cac:DeliveryParty/cbc:IndustryClassificationCode[@name='YETKIBELGENO']"), test: "cac:Delivery/cac:DeliveryParty/cbc:IndustryClassificationCode[@name='YETKIBELGENO']" },
            ],
        });
    }
    if (id === 'doviz') {
        if (on('kur')) {
            boxes.push({
                title: 'Kur Bilgisi', test: 'cac:PaymentExchangeRate or cac:PricingExchangeRate',
                rows: [
                    { label: 'Uygulanan', value: `<b>${num('cac:PaymentExchangeRate/cbc:CalculationRate', '###.##0,0000##')}</b>${xt(' ')}${v('cac:PaymentExchangeRate/cbc:SourceCurrencyCode')}${xt(' → ')}${v('cac:PaymentExchangeRate/cbc:TargetCurrencyCode')}`, test: 'cac:PaymentExchangeRate' },
                    { label: 'Piyasa Kuru', value: num('cac:PricingExchangeRate/cbc:CalculationRate', '###.##0,0000##'), test: 'cac:PricingExchangeRate/cbc:CalculationRate' },
                ],
            });
        }
        if (on('odemeSekli')) {
            boxes.push({
                title: 'Ödeme Şekilleri', test: 'cac:PaymentMeans',
                raw: `<table class="kv">${each('cac:PaymentMeans', `<tr><th>${call('odemeAdi', { k: 'cbc:PaymentMeansCode' })}</th><td><xsl:if test="cac:PayerFinancialAccount/cbc:ID">${xt('Ödeyen: ')}<span class="code">${v('cac:PayerFinancialAccount/cbc:ID')}</span></xsl:if><xsl:if test="cac:PayeeFinancialAccount/cbc:ID">${xt(' Alan: ')}<span class="code">${v('cac:PayeeFinancialAccount/cbc:ID')}</span></xsl:if></td></tr>`)}</table>`,
            });
        }
    }
    if (id === 'dekont') {
        if (on('islemDetay')) {
            boxes.push({
                title: 'İşlem Bilgileri', test: "cac:AdditionalDocumentReference[not(cac:Attachment)][cbc:ID != '']",
                raw: `<table class="kv">${each("cac:AdditionalDocumentReference[not(cac:Attachment)][cbc:ID != '']", `<tr><th><xsl:choose><xsl:when test="cbc:DocumentTypeCode">${v('cbc:DocumentTypeCode')}</xsl:when><xsl:when test="cbc:DocumentType">${v('cbc:DocumentType')}</xsl:when><xsl:when test="cbc:ID/@schemeID">${v('cbc:ID/@schemeID')}</xsl:when><xsl:otherwise>Referans</xsl:otherwise></xsl:choose></th><td>${v('cbc:ID')}<xsl:if test="cbc:DocumentDescription">${xt(' · ')}${v('cbc:DocumentDescription')}</xsl:if></td></tr>`)}</table>`,
            });
        }
        if (on('alindi')) {
            boxes.push({
                title: 'Tahsil Alındısı', test: 'cac:TaxRepresentativeParty',
                raw: `<table class="kv">${iff('cac:TaxRepresentativeParty/cac:PartyName/cbc:Name', `<tr><th>Kurum</th><td>${v('cac:TaxRepresentativeParty/cac:PartyName/cbc:Name')}</td></tr>`)}`
                    + iff('cac:TaxRepresentativeParty/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name', `<tr><th>Vergi Dairesi</th><td>${v('cac:TaxRepresentativeParty/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name')}</td></tr>`)
                    + each('cac:TaxRepresentativeParty/cac:PartyIdentification/cbc:ID', `<tr><th>${v('@schemeID')}</th><td>${v('.')}</td></tr>`)
                    + iff('cac:TaxRepresentativeParty/cac:PartyLegalEntity/cbc:RegistrationName', `<tr><th>Saymanlık</th><td>${v('cac:TaxRepresentativeParty/cac:PartyLegalEntity/cbc:RegistrationName')}</td></tr>`)
                    + '</table>',
            });
        }
    }
    return boxes;
}

// ---------------------------------------------------------------------------
// Kalem tablosu
// ---------------------------------------------------------------------------
interface Col { head: string; cell: string; cls?: 'r' | 'c'; w?: number; test?: string }

const itemCell = (extra = '') =>
    `<div class="iname">${v('cac:Item/cbc:Name')}</div>`
    + '<xsl:if test="cac:Item/cbc:Description and string(cac:Item/cbc:Description) != string(cac:Item/cbc:Name)"><div class="desc"><xsl:value-of select="cac:Item/cbc:Description"/></div></xsl:if>'
    + extra;

const sellerCode = '<xsl:if test="cac:Item/cac:SellersItemIdentification/cbc:ID"><div class="code"><xsl:value-of select="cac:Item/cac:SellersItemIdentification/cbc:ID"/></div></xsl:if>';
const kdvPct = `<xsl:choose><xsl:when test="cac:TaxTotal/cac:TaxSubtotal[${TAX('0015')}]/cbc:Percent">%${num(`cac:TaxTotal/cac:TaxSubtotal[${TAX('0015')}]/cbc:Percent`, '##0,##')}</xsl:when><xsl:when test="cac:TaxTotal/cac:TaxSubtotal/cbc:Percent">%${num('cac:TaxTotal/cac:TaxSubtotal/cbc:Percent', '##0,##')}</xsl:when><xsl:otherwise>–</xsl:otherwise></xsl:choose>`;
const discount = "<xsl:choose><xsl:when test=\"cac:AllowanceCharge[cbc:ChargeIndicator='false']\"><xsl:if test=\"cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:MultiplierFactorNumeric\"><span class=\"desc\">%<xsl:value-of select=\"format-number(cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:MultiplierFactorNumeric * 100, '##0,##', 'tr')\"/></span><br/></xsl:if><xsl:value-of select=\"format-number(sum(cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:Amount), '###.##0,00', 'tr')\"/></xsl:when><xsl:otherwise>–</xsl:otherwise></xsl:choose>";

function ublCols(c: Ctx, d: UblDoc): Col[] {
    const id = c.dt.id;
    const on = c.on;
    const no: Col = { head: '#', cell: v('cbc:ID'), cls: 'c', w: 26 };
    const q: Col = { head: 'Miktar', cell: qty(d.qtyTag), cls: 'r' };
    const price: Col = { head: 'Birim Fiyat', cell: num('cac:Price/cbc:PriceAmount'), cls: 'r' };
    const amount: Col = { head: 'Tutar', cell: `<b>${num('cbc:LineExtensionAmount')}</b>`, cls: 'r' };
    switch (id) {
        case 'smm':
            return [no, { head: 'Hizmet Açıklaması', cell: itemCell() }, q, { head: 'Brüt Ücret', cell: `<b>${num('cbc:LineExtensionAmount')}</b>`, cls: 'r' }];
        case 'mustahsil':
            return [no, { head: 'Malın Cinsi', cell: itemCell(on('kunye') ? `<xsl:for-each select="cac:Item/cac:AdditionalItemIdentification/cbc:ID[@schemeID='KUNYENO']"><div class="code">${xt('Künye: ')}${v('.')}</div></xsl:for-each>` : '') },
                q, price, amount,
                ...(on('stopaj') ? [{ head: 'Stopaj', cell: `<xsl:if test="cac:TaxTotal/cac:TaxSubtotal[${TAX('0003')}]">%${num(`cac:TaxTotal/cac:TaxSubtotal[${TAX('0003')}]/cbc:Percent`, '##0,##')}</xsl:if>`, cls: 'r' as const }] : [])];
        case 'doviz':
            return [no, { head: 'Döviz / Maden', cell: itemCell() }, q, { head: 'Kur / Fiyat', cell: num('cac:Price/cbc:PriceAmount', '###.##0,00##'), cls: 'r' }, amount];
        case 'dekont':
            return [no, { head: 'İşlem', cell: `<div class="iname">${v('cac:Item/cbc:Name')}</div>` }, { head: 'Açıklama / Değer', cell: v('cac:Item/cbc:Description') },
                { head: 'Tutar', cell: `<b><xsl:choose><xsl:when test="cac:Price/cbc:PriceAmount">${num('cac:Price/cbc:PriceAmount')}</xsl:when><xsl:otherwise>${num('cbc:LineExtensionAmount')}</xsl:otherwise></xsl:choose></b>`, cls: 'r' }];
        case 'sigorta-komisyon':
            return [no, { head: 'Branş / Ürün', cell: itemCell() },
                { head: 'İstihsal Kom.', cell: num("sum(cac:AllowanceCharge[cbc:ChargeIndicator='true']/cbc:Amount)"), cls: 'r' },
                { head: 'İptal Kom.', cell: num("sum(cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:Amount)"), cls: 'r' }, amount];
        case 'irsaliye':
            return [no, { head: 'Mal / Hizmet', cell: itemCell() }, { head: 'Ürün Kodu', cell: `<span class="code">${v('cac:Item/cac:SellersItemIdentification/cbc:ID')}</span>` }, q];
        case 'irsaliye-yanit':
            return [no, { head: 'Ürün', cell: itemCell(sellerCode) }, { head: 'Kabul', cell: qty('cbc:ReceivedQuantity'), cls: 'r' },
                ...(on('yanitDurum') ? [
                    { head: 'Red', cell: `<xsl:if test="cbc:RejectedQuantity &gt; 0">${qty('cbc:RejectedQuantity')}</xsl:if>`, cls: 'r' as const },
                    { head: 'Eksik', cell: `<xsl:if test="cbc:ShortQuantity &gt; 0">${qty('cbc:ShortQuantity')}</xsl:if>`, cls: 'r' as const },
                    { head: 'Fazla', cell: `<xsl:if test="cbc:OversupplyQuantity &gt; 0">${qty('cbc:OversupplyQuantity')}</xsl:if>`, cls: 'r' as const },
                    { head: 'Red Nedeni', cell: `<span class="desc">${v('cbc:RejectReason')}</span>` },
                ] : [])];
        default: {
            const cols: Col[] = [no, { head: id === 'bilet' ? 'Hizmetin Nevi' : 'Mal / Hizmet', cell: itemCell(id === 'bilet' ? '' : sellerCode) }];
            if (on('ihracatBilgi')) cols.push({ head: 'GTİP', cell: `<span class="code">${v('cac:Delivery/cac:Shipment/cac:GoodsItem/cbc:RequiredCustomsID')}</span>`, test: '$hasGtip' });
            cols.push(q, price);
            if (on('iskonto')) cols.push({ head: 'İskonto', cell: discount, cls: 'r' });
            cols.push({ head: 'KDV', cell: kdvPct, cls: 'r' });
            if (on('kdvSutun')) cols.push({ head: 'KDV Tutarı', cell: num(`sum(cac:TaxTotal/cac:TaxSubtotal[${TAX('0015')}]/cbc:TaxAmount)`), cls: 'r' });
            cols.push(amount);
            return cols;
        }
    }
}

function linesTable(c: Ctx, d: UblDoc): string {
    const cols = ublCols(c, d);
    const th = cols.map(col => iff(col.test ?? '', `<th${col.cls ? ` class="${col.cls}"` : ''}${col.w ? ` style="width:${col.w}px"` : ''}>${esc(col.head)}</th>`)).join('');
    const td = cols.map(col => iff(col.test ?? '', `<td${col.cls ? ` class="${col.cls}"` : ''}>${col.cell}</td>`)).join('');
    return `<div class="in"><table class="lines"><thead><tr>${th}</tr></thead><tbody>`
        + `<xsl:for-each select="${d.lineTag}"><tr><xsl:if test="position() mod 2 = 0"><xsl:attribute name="class">z</xsl:attribute></xsl:if>${td}</tr></xsl:for-each>`
        + '</tbody></table></div>';
}

// ---------------------------------------------------------------------------
// Toplamlar ve alt bölüm
// ---------------------------------------------------------------------------
const tr = (label: string, value: string, test = '', cls = '') =>
    iff(test, `<tr${cls ? ` class="${cls}"` : ''}><td>${label}</td><td class="r">${value}</td></tr>`);

const taxRows = (sel = 'cac:TaxTotal/cac:TaxSubtotal', prefix = 'Hesaplanan ', cls = '') =>
    each(sel, tr(`${esc(prefix)}${call('vergiAdi', { s: '.' })}${pct('cbc:Percent')}`, money('cbc:TaxAmount'), '', cls));

interface Totals { rows: string; grandLabel: string; grandValue: string; words: boolean }

function ublTotals(c: Ctx, d: UblDoc): Totals | null {
    const id = c.dt.id;
    const on = c.on;
    const L = '$lmt/cbc:';
    const grand = (label: string, xp = `${L}PayableAmount`) => ({ grandLabel: label, grandValue: money(xp) });
    const words = on('yaziyla');
    if (d.family === 'despatch' || d.family === 'receiptAdvice') return null;
    if (id === 'smm') {
        const stopajSel = `(cac:TaxTotal/cac:TaxSubtotal | cac:WithholdingTaxTotal/cac:TaxSubtotal)[${STOPAJ}]`;
        return {
            rows: tr('Brüt Ücret', money(`${L}LineExtensionAmount`))
                + (on('stopaj') ? taxRows(stopajSel, '', 'neg') : '')
                + (on('netOdenecek') ? tr('<b>Net Ücret</b>', money(`${L}LineExtensionAmount - sum(${stopajSel}/cbc:TaxAmount)`, '$cur')) : '')
                + taxRows(`cac:TaxTotal/cac:TaxSubtotal[${TAX('0015')}]`)
                + (on('tevkifat') ? taxRows(`cac:WithholdingTaxTotal/cac:TaxSubtotal[not${STOPAJ}]`, 'Tevkifat: ', 'neg') : '')
                + taxRows(`cac:TaxTotal/cac:TaxSubtotal[not(${TAX('0015')}) and not${STOPAJ}]`, ''),
            ...grand('Tahsil Edilen Tutar'), words,
        };
    }
    if (id === 'mustahsil') {
        const sel = on('kesinti') ? 'cac:TaxTotal/cac:TaxSubtotal' : `cac:TaxTotal/cac:TaxSubtotal[${TAX('0003')}]`;
        return {
            rows: tr('Mal / Ürün Toplamı', money(`${L}LineExtensionAmount`))
                + (on('stopaj') || on('kesinti') ? taxRows(sel, '', 'neg') : '')
                + tr('Toplam Kesinti', money('sum(cac:TaxTotal/cbc:TaxAmount)', '$cur'), 'cac:TaxTotal', 'neg'),
            ...grand('Üreticiye Ödenecek'), words,
        };
    }
    if (id === 'gider-pusulasi') {
        return {
            rows: tr('Mal / Hizmet Toplamı', money(`${L}LineExtensionAmount`)) + taxRows()
                + tr('Vergiler Dahil Toplam', money(`${L}TaxInclusiveAmount`), `${L}TaxInclusiveAmount`),
            ...grand('Ödenecek Tutar'), words,
        };
    }
    if (id === 'doviz') {
        return {
            rows: tr('TL Karşılığı', money(`${L}LineExtensionAmount`))
                + (on('kur') ? tr('Uygulanan Kur', num('cac:PaymentExchangeRate/cbc:CalculationRate', '###.##0,0000##'), 'cac:PaymentExchangeRate/cbc:CalculationRate') : '')
                + taxRows('cac:TaxTotal/cac:TaxSubtotal', '')
                + tr('Vergiler Dahil Toplam', money(`${L}TaxInclusiveAmount`), `${L}TaxInclusiveAmount`),
            ...grand('Ödenecek'), words: false,
        };
    }
    if (id === 'dekont') {
        return {
            rows: tr('İşlem Tutarı', money(`${L}LineExtensionAmount`), `${L}LineExtensionAmount`) + taxRows('cac:TaxTotal/cac:TaxSubtotal', '')
                + tr('Vergiler Dahil Toplam', money(`${L}TaxInclusiveAmount`), `${L}TaxInclusiveAmount`),
            ...grand('Ödenecek / İşlem Tutarı'), words,
        };
    }
    if (id === 'sigorta-komisyon') {
        return {
            rows: tr('İstihsal Komisyonu', money(`${L}AllowanceTotalAmount`), `${L}AllowanceTotalAmount`)
                + tr('İptal Komisyonu', money(`${L}ChargeTotalAmount`), `${L}ChargeTotalAmount &gt; 0`, 'neg')
                + tr('Net Komisyon', money(`${L}LineExtensionAmount`), `${L}LineExtensionAmount`)
                + taxRows('cac:TaxTotal/cac:TaxSubtotal', ''),
            ...grand('Ödenecek Tutar'), words,
        };
    }
    // fatura, arsiv, ihracat, bilet
    return {
        rows: tr('Mal / Hizmet Toplam Tutarı', money(`${L}LineExtensionAmount`))
            + (on('iskonto') ? tr('Toplam İskonto', money(`${L}AllowanceTotalAmount`), `${L}AllowanceTotalAmount &gt; 0`, 'neg') : '')
            + tr('Toplam Artırım', money(`${L}ChargeTotalAmount`), `${L}ChargeTotalAmount &gt; 0`)
            + tr('Vergi Hariç Tutar', money(`${L}TaxExclusiveAmount`), `${L}TaxExclusiveAmount`)
            + taxRows()
            + (on('tevkifat') ? taxRows('cac:WithholdingTaxTotal/cac:TaxSubtotal', 'Tevkifat: ', 'neg') : '')
            + tr('Vergiler Dahil Toplam', money(`${L}TaxInclusiveAmount`), `${L}TaxInclusiveAmount`)
            + tr('Yuvarlama', money(`${L}PayableRoundingAmount`), `${L}PayableRoundingAmount != 0`)
            + (on('kur') ? tr('TL Karşılığı', money(`${L}PayableAmount * cac:PricingExchangeRate/cbc:CalculationRate`, "'TRY'"), "$cur != 'TRY' and cac:PricingExchangeRate/cbc:CalculationRate") : ''),
        ...grand(id === 'bilet' ? 'Bilet Tutarı' : 'Ödenecek Tutar'), words,
    };
}

function summaryTable(c: Ctx, d: UblDoc): string {
    if (d.family === 'despatch') {
        return `<table class="tot">${tr('Kalem Sayısı', v('count(cac:DespatchLine)'))}${tr('Toplam Miktar', num('sum(cac:DespatchLine/cbc:DeliveredQuantity)', '###.##0,###'))}`
            + (c.on('paket') ? tr('Toplam Kap', v('cac:Shipment/cbc:TotalTransportHandlingUnitQuantity'), 'cac:Shipment/cbc:TotalTransportHandlingUnitQuantity') : '') + '</table>';
    }
    const s = (tag: string) => `sum(cac:ReceiptLine/cbc:${tag})`;
    const status = `<xsl:choose><xsl:when test="${s('RejectedQuantity')} &gt; 0 and ${s('ReceivedQuantity')} = 0">RED</xsl:when><xsl:when test="${s('RejectedQuantity')} + ${s('ShortQuantity')} + ${s('OversupplyQuantity')} &gt; 0">KISMİ KABUL</xsl:when><xsl:otherwise>KABUL</xsl:otherwise></xsl:choose>`;
    return `<table class="tot">${tr('Kalem Sayısı', v('count(cac:ReceiptLine)'))}${tr('Kabul Edilen', num(s('ReceivedQuantity'), '###.##0,###'))}`
        + tr('Reddedilen', num(s('RejectedQuantity'), '###.##0,###'), `${s('RejectedQuantity')} &gt; 0`, 'neg')
        + tr('Eksik', num(s('ShortQuantity'), '###.##0,###'), `${s('ShortQuantity')} &gt; 0`, 'neg')
        + tr('Fazla', num(s('OversupplyQuantity'), '###.##0,###'), `${s('OversupplyQuantity')} &gt; 0`)
        + '</table>' + (c.on('yanitDurum') ? `<div style="text-align:right;margin-top:8px"><span class="status">${status}</span></div>` : '');
}

function banksBlock(c: Ctx, narrow: boolean): string {
    const banks = c.p.banks.filter(b => b.bank || b.iban);
    if (!banks.length) return '';
    if (narrow) {
        return `<div class="box banks"><h5>Banka Hesap Bilgileri</h5>${banks.map(b =>
            `<div class="bank-item"><b>${esc(b.bank)}</b>${b.branch ? `${xt(' · ')}${esc(b.branch)}` : ''}${b.currency ? ` <span class="badge">${esc(b.currency)}</span>` : ''}`
            + `${b.holder ? `<div class="desc">${esc(b.holder)}</div>` : ''}<div class="iban">${esc(b.iban)}</div></div>`).join('')}</div>`;
    }
    return `<div class="box banks"><h5>Banka Hesap Bilgileri</h5><table class="mini"><tr><th>Banka / Şube</th><th>Hesap Sahibi</th><th>IBAN</th><th class="c">Döviz</th></tr>${banks.map(b =>
        `<tr><td><b>${esc(b.bank)}</b>${b.branch ? `<div class="desc">${esc(b.branch)}</div>` : ''}</td><td>${esc(b.holder)}</td><td class="iban">${esc(b.iban)}</td><td class="c">${esc(b.currency)}</td></tr>`).join('')}</table></div>`;
}

const notesSelect = (words: boolean) => (words ? "cbc:Note[not(starts-with(translate(normalize-space(.), 'YALNIZıİ', 'yalnizii'), 'yalniz'))]" : 'cbc:Note');

function bottomArea(c: Ctx, d: UblDoc): string {
    const { p, on, L } = c;
    const totals = ublTotals(c, d);
    const left: string[] = [];
    if (on('notlar')) {
        const sel = notesSelect(!!totals?.words);
        left.push(iff(sel, `<div class="box notes"><h5>Notlar</h5>${each(sel, `<div>${v('.')}</div>`)}</div>`));
    }
    if (on('kdvDokum')) {
        left.push(iff('cac:TaxTotal/cac:TaxSubtotal', `<div class="box"><h5>Vergi Dökümü</h5><table class="mini"><tr><th>Vergi</th><th class="r">Oran</th><th class="r">Matrah</th><th class="r">Vergi Tutarı</th></tr>`
            + each('cac:TaxTotal/cac:TaxSubtotal', `<tr><td>${call('vergiAdi', { s: '.' })}</td><td class="r"><xsl:if test="cbc:Percent">%${num('cbc:Percent', '##0,##')}</xsl:if></td><td class="r">${num('cbc:TaxableAmount')}</td><td class="r">${num('cbc:TaxAmount')}</td></tr>`)
            + '</table></div>'));
    }
    if (on('tevkifat')) {
        const exempt = 'cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cbc:TaxExemptionReason or cac:TaxCategory/cbc:TaxExemptionReasonCode]';
        left.push(iff(`cac:WithholdingTaxTotal or ${exempt}`, '<div class="box"><h5>Tevkifat / İstisna</h5>'
            + each('cac:WithholdingTaxTotal/cac:TaxSubtotal', `<div><b>${v('cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode')}</b>${xt(' ')}${v('cac:TaxCategory/cac:TaxScheme/cbc:Name')}${pct('cbc:Percent')}${xt(': ')}${money('cbc:TaxAmount')}</div>`)
            + each(exempt, `<div><b>${v('cac:TaxCategory/cbc:TaxExemptionReasonCode')}</b>${xt(' ')}${v('cac:TaxCategory/cbc:TaxExemptionReason')}</div>`)
            + '</div>'));
    }
    if (p.bankPosition === 'yan') left.push(banksBlock(c, true));
    const right = totals
        ? `<table class="tot">${totals.rows}${L.totals === 0 ? tr(esc(totals.grandLabel), totals.grandValue, '', 'grand') : ''}</table>`
        + (totals.words && L.totals === 0 ? `<div class="words">${call('yaziyla', { n: '$lmt/cbc:PayableAmount', c: '$lmt/cbc:PayableAmount/@currencyID' })}</div>` : '')
        : summaryTable(c, d);
    const qrBottom = c.qr && p.qrPosition === 'alt' ? `<td class="qr-bottom">${karekodSnippet('obj-karekod', true)}</td>` : '';
    const band = totals && L.totals === 1
        ? `<table class="grandband"><tr><td>${totals.words ? `<div class="gb-words">${call('yaziyla', { n: '$lmt/cbc:PayableAmount', c: '$lmt/cbc:PayableAmount/@currencyID' })}</div>` : ''}</td><td class="gb-amt"><div class="gb-l">${esc(totals.grandLabel)}</div>${totals.grandValue}</td></tr></table>`
        : '';
    return `<div class="in"><table class="bottom"><tr>${qrBottom}<td class="bl">${left.join('')}</td><td class="br">${right}</td></tr></table>${band}</div>`;
}

const SIGN_LABELS: Record<string, [string, string]> = {
    irsaliye: ['Teslim Eden', 'Teslim Alan'],
    'irsaliye-yanit': ['Kontrol Eden', 'Teslim Alan'],
    mustahsil: ['Makbuzu Düzenleyen', 'Malı Satan Üretici'],
    'gider-pusulasi': ['Düzenleyen', 'Malı Satan / İade Eden'],
    'bilet-yolcu': ['Şoför', 'Firma Yetkilisi'],
};

function signature(c: Ctx): string {
    const id = c.dt.id;
    const wanted = id === 'irsaliye' ? c.on('teslimImza') : id === 'bilet-yolcu' ? c.on('yolcuImza') : c.on('imza');
    if (!wanted) return '';
    const [a, b] = SIGN_LABELS[id] ?? ['Düzenleyen (Kaşe / İmza)', 'Teslim Alan'];
    const cell = (label: string) => `<td class="s"><div class="sline">${esc(label)}</div><div class="shint">Ad Soyad · İmza · Tarih</div></td>`;
    return `<div class="in"><table class="sign"><tr>${cell(a)}<td><xsl:text> </xsl:text></td>${cell(b)}</tr></table></div>`;
}

function footer(c: Ctx, statement: string): string {
    const t = c.p.texts;
    const parts = [
        t.thanks ? `<div class="thanks">${esc(t.thanks)}</div>` : '',
        t.returnPolicy ? `<div class="fbox"><b>İade / Garanti:</b>${xt(' ')}${lines(t.returnPolicy)}</div>` : '',
        t.footer ? `<div>${lines(t.footer)}</div>` : '',
        t.contact ? `<div class="contact">${esc(t.contact)}</div>` : '',
        t.legal ? `<div class="legal">${lines(t.legal)}</div>` : '',
        `<div class="ebelge">${statement}</div>`,
    ];
    return `<div class="in"><div class="foot">${parts.join('')}</div></div>`;
}

// ---------------------------------------------------------------------------
// Sayfa gövdeleri
// ---------------------------------------------------------------------------
function ublBody(c: Ctx): string {
    const d = ublDoc(c.dt);
    const meta = ublMeta(c, d);
    const head = header(c, {
        name: '<xsl:value-of select="$supName"/>',
        monogram: '<xsl:value-of select="substring(normalize-space($supName), 1, 1)"/>',
        title: d.title,
        sub: `${v('cbc:ProfileID')}<xsl:if test="${d.typeCode}">${xt(' · ')}${v(d.typeCode)}</xsl:if>`,
        meta,
    });
    const gtip = c.on('ihracatBilgi') ? '<xsl:variable name="hasGtip" select="boolean(cac:InvoiceLine/cac:Delivery/cac:Shipment/cac:GoodsItem/cbc:RequiredCustomsID)"/>' : '';
    const parties = `<div class="in"><table class="parties"><tr><td class="pcell"><div class="pbox"><div class="plabel">${esc(d.supLabel)}</div>${call('taraf', { p: '$sup' })}</div></td>`
        + `<td class="gap"><xsl:text> </xsl:text></td><td class="pcell"><div class="pbox"><div class="plabel">${esc(d.cusLabel)}</div>${call('taraf', { p: '$cus' })}</div></td></tr></table></div>`;
    const banks = c.p.bankPosition === 'alt' ? `<div class="in" style="margin-top:4px">${banksBlock(c, false)}</div>` : '';
    return `<xsl:for-each select="/n1:${d.root}">`
        + `<xsl:variable name="sup" select="${d.sup}"/><xsl:variable name="cus" select="${d.cus}"/>`
        + '<xsl:variable name="lmt" select="cac:LegalMonetaryTotal"/><xsl:variable name="cur" select="string(cbc:DocumentCurrencyCode)"/>'
        + SUP_NAME_VAR + gtip
        + `<div class="page">${head}${parties}${renderBoxes(ublBoxes(c, d))}${linesTable(c, d)}${bottomArea(c, d)}${banks}${signature(c)}`
        + footer(c, `Bu belge elektronik ortamda düzenlenmiştir. ETTN: ${v('cbc:UUID')}`)
        + '</div></xsl:for-each>';
}

function receiptBody(c: Ctx): string {
    const d = ublDoc(c.dt);
    const { p, on } = c;
    const totals = ublTotals(c, d);
    const logo = p.logo
        ? `<img class="logo" data-xslt-obj="obj-logo" alt="${escAttr(p.companyName || 'Logo')}" src="${escAttr(p.logo)}"/>`
        : '<div class="mono"><xsl:value-of select="substring(normalize-space($supName), 1, 1)"/></div>';
    const kv = (label: string, value: string, test = '') => tr(esc(label), value, test);
    const items = each(d.lineTag,
        `<tr><td class="nm" colspan="2">${v('cac:Item/cbc:Name')}</td></tr>`
        + `<tr><td class="calc">${num(d.qtyTag, '###.##0,###')}${xt(' ')}${call('birim', { u: `${d.qtyTag}/@unitCode` })}${xt(' x ')}${num('cac:Price/cbc:PriceAmount')}`
        + `<xsl:if test="cac:TaxTotal/cac:TaxSubtotal/cbc:Percent">${xt('  KDV %')}${num('cac:TaxTotal/cac:TaxSubtotal/cbc:Percent', '##0')}</xsl:if>`
        + (on('iskonto') ? `<xsl:if test="cac:AllowanceCharge[cbc:ChargeIndicator='false']">${xt('  İsk. -')}${num("sum(cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:Amount)")}</xsl:if>` : '')
        + `</td><td class="calc r"><b>${num('cbc:LineExtensionAmount')}</b></td></tr>`);
    const banks = p.banks.filter(b => b.bank || b.iban).map(b => `<div class="small"><b>${esc(b.bank)}</b>${b.currency ? ` (${esc(b.currency)})` : ''}<div class="mono-t">${esc(b.iban)}</div></div>`).join('');
    const t = p.texts;
    return '<xsl:for-each select="/n1:Invoice">'
        + `<xsl:variable name="sup" select="${d.sup}"/><xsl:variable name="cus" select="${d.cus}"/>`
        + '<xsl:variable name="lmt" select="cac:LegalMonetaryTotal"/><xsl:variable name="cur" select="string(cbc:DocumentCurrencyCode)"/>'
        + SUP_NAME_VAR
        + '<div class="rc">'
        + (t.headerNote ? `<div class="fine" style="margin:0 0 6px">${esc(t.headerNote)}</div>` : '')
        + `<div class="ctr">${logo}<div class="brand-name"><xsl:value-of select="$supName"/></div>`
        + (t.slogan ? `<div class="small"><i>${esc(t.slogan)}</i></div>` : '')
        + `<div class="small">${v('$sup/cac:PostalAddress/cbc:StreetName')}${xt(' ')}${v('$sup/cac:PostalAddress/cbc:BuildingNumber')}${xt(' ')}${v('$sup/cac:PostalAddress/cbc:CitySubdivisionName')}${xt(' / ')}${v('$sup/cac:PostalAddress/cbc:CityName')}</div>`
        + `<div class="small">${v('$sup/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name')}${xt(' VD · ')}${v("$sup/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']/@schemeID")}${xt(' ')}${v("$sup/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']")}</div></div>`
        + `<div class="title">${d.title}</div>`
        + `<table class="kv">${kv('Fatura No', v('cbc:ID'))}${kv('Tarih', `${date('cbc:IssueDate')}${xt(' ')}${v('substring(cbc:IssueTime, 1, 5)')}`)}${kv('Tip', v(d.typeCode))}</table>`
        + `<div class="small">ETTN: <span class="mono-t">${v('cbc:UUID')}</span></div><div class="dash"><xsl:text> </xsl:text></div>`
        + `<div class="small"><b>Alıcı:</b>${xt(' ')}<xsl:choose><xsl:when test="$cus/cac:PartyName/cbc:Name">${v('$cus/cac:PartyName/cbc:Name')}</xsl:when><xsl:otherwise>${personName('$cus/cac:Person')}</xsl:otherwise></xsl:choose>`
        + `${xt(' · ')}${v("$cus/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']/@schemeID")}${xt(' ')}${v("$cus/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']")}</div>`
        + `<div class="dash"><xsl:text> </xsl:text></div><table class="it">${items}</table><div class="dash"><xsl:text> </xsl:text></div>`
        + `<table class="kv">${totals ? totals.rows : ''}<tr class="grand"><td>${esc(totals?.grandLabel ?? 'Toplam')}</td><td class="r">${totals?.grandValue ?? ''}</td></tr></table>`
        + (totals?.words ? `<div class="words">${call('yaziyla', { n: '$lmt/cbc:PayableAmount', c: '$lmt/cbc:PayableAmount/@currencyID' })}</div>` : '')
        + (on('internetSatis') ? iff('cac:Delivery/cac:CarrierParty or $sup/cbc:WebsiteURI', `<div class="dash"><xsl:text> </xsl:text></div><table class="kv">${kv('Satış sitesi', v('$sup/cbc:WebsiteURI'), '$sup/cbc:WebsiteURI')}${kv('Gönderim', date('cac:Delivery/cac:Despatch/cbc:ActualDespatchDate'), 'cac:Delivery/cac:Despatch/cbc:ActualDespatchDate')}${kv('Taşıyıcı', v('cac:Delivery/cac:CarrierParty/cac:PartyName/cbc:Name'), 'cac:Delivery/cac:CarrierParty')}</table>`) : '')
        + (on('odeme') || on('internetSatis') ? iff('cac:PaymentMeans', `<div class="small" style="margin-top:4px"><b>Ödeme:</b>${xt(' ')}<xsl:choose><xsl:when test="cac:PaymentMeans/cbc:InstructionNote">${v('cac:PaymentMeans/cbc:InstructionNote')}</xsl:when><xsl:otherwise>${call('odemeAdi', { k: 'cac:PaymentMeans/cbc:PaymentMeansCode' })}</xsl:otherwise></xsl:choose></div>`) : '')
        + (on('notlar') ? each(notesSelect(!!totals?.words), `<div class="small">${v('.')}</div>`) : '')
        + (banks ? `<div class="dash"><xsl:text> </xsl:text></div>${banks}` : '')
        + `<div class="qr-wrap">${karekodSnippet('obj-karekod', true)}</div>`
        + (t.thanks ? `<div class="thanks">${esc(t.thanks)}</div>` : '')
        + (t.returnPolicy ? `<div class="fine">${lines(t.returnPolicy)}</div>` : '')
        + (t.contact ? `<div class="fine"><b>${esc(t.contact)}</b></div>` : '')
        + (t.footer ? `<div class="fine">${lines(t.footer)}</div>` : '')
        + (t.legal ? `<div class="fine">${lines(t.legal)}</div>` : '')
        + '<div class="fine">e-Arşiv fatura · elektronik ortamda düzenlenmiştir</div>'
        + '</div></xsl:for-each>';
}

function ebiletHeader(c: Ctx, title: string, meta: MetaRow[]): string {
    const name = c.p.companyName ? esc(c.p.companyName) : `Gönderen ${v('eb:baslik/eb:gonderen/eb:vkn')}${v('eb:baslik/eb:gonderen/eb:tckn')}`;
    const monogram = c.p.companyName ? esc(c.p.companyName.trim().charAt(0).toLocaleUpperCase('tr-TR')) : 'e';
    return header(c, { name, monogram, title, sub: 'GİB e-Bilet Sistemi', meta });
}

const ebiletMeta = (extra: MetaRow[]): MetaRow[] => [
    { label: 'Gönderen', value: `${v('eb:baslik/eb:gonderen/eb:vkn')}${v('eb:baslik/eb:gonderen/eb:tckn')}`, test: 'eb:baslik/eb:gonderen' },
    ...extra,
    { label: 'UUID', value: v('eb:baslik/eb:uuid'), test: 'eb:baslik/eb:uuid', mono: true },
];

const cards = (items: [string, string][]) =>
    `<div class="in"><table class="cards"><tr>${items.map(([k, val]) => `<td class="cc"><div class="card"><div class="k">${esc(k)}</div><div class="v">${val}</div></div></td>`).join('')}</tr></table></div>`;

function simpleTable(c: Ctx, sel: string, cols: Col[]): string {
    const th = cols.map(col => iff(col.test ?? '', `<th${col.cls ? ` class="${col.cls}"` : ''}>${esc(col.head)}</th>`)).join('');
    const td = cols.map(col => iff(col.test ?? '', `<td${col.cls ? ` class="${col.cls}"` : ''}>${col.cell}</td>`)).join('');
    return `<table class="lines"><thead><tr>${th}</tr></thead><tbody><xsl:for-each select="${sel}"><tr><xsl:if test="position() mod 2 = 0"><xsl:attribute name="class">z</xsl:attribute></xsl:if>${td}</tr></xsl:for-each></tbody></table>`;
}

function ebiletReportBody(c: Ctx): string {
    const on = c.on;
    const head = ebiletHeader(c, 'e-BİLET RAPORU', ebiletMeta([
        { label: 'Dönem', value: `${date('eb:baslik/eb:baslangicTarihi')}${xt(' – ')}${date('eb:baslik/eb:bitisTarihi')}`, test: 'eb:baslik/eb:baslangicTarihi' },
        { label: 'Versiyon', value: v('eb:baslik/eb:versiyon'), test: 'eb:baslik/eb:versiyon' },
    ]));
    const summary = on('ozet') ? cards([
        ['Bilet', v("count(eb:bilet[not(eb:belgeTip='IADE')])")],
        ['İade', v("count(eb:bilet[eb:belgeTip='IADE'])")],
        ['İptal', v('count(eb:biletIptal)')],
        ['Toplam Tutar', money('sum(eb:bilet/eb:tutar)', "''")],
        ['Toplam KDV', money('sum(eb:bilet/eb:kdv)', "''")],
    ]) : '';
    const tickets = simpleTable(c, 'eb:bilet', [
        { head: 'Bilet No', cell: `<span class="code"><b>${v('eb:biletNo')}</b></span><xsl:if test="eb:belgeTip">${xt(' ')}<span class="badge">${v('eb:belgeTip')}</span></xsl:if>` },
        { head: 'Düzenlenme', cell: date('eb:duzenlenmeTarihi') },
        { head: 'Sefer / Etkinlik', cell: `<xsl:choose><xsl:when test="eb:seferZamani">${call('zaman', { z: 'eb:seferZamani' })}</xsl:when><xsl:otherwise>${call('zaman', { z: 'eb:etkinlikZamani' })}</xsl:otherwise></xsl:choose>` },
        { head: 'Hizmet', cell: `<div class="iname">${v('eb:hizmetinNevi/eb:tur')}</div><div class="desc">${v('eb:hizmetinNevi/eb:aciklama')}</div>` },
        { head: 'Ödeme', cell: v('eb:odemeSekli') },
        ...(on('giderGosteren') ? [{ head: 'Gider Gösteren', cell: `${v('eb:giderGosteren/eb:vkn')}${v('eb:giderGosteren/eb:tckn')}` }] : []),
        { head: 'Tutar', cell: `<b>${num('eb:tutar')}</b><xsl:if test="eb:tutar/@paraBirim">${xt(' ')}${v('eb:tutar/@paraBirim')}</xsl:if>`, cls: 'r' },
        { head: 'KDV', cell: num('eb:kdv'), cls: 'r' },
    ]);
    const cancels = on('iptal') ? iff('eb:biletIptal', `<div class="in"><div class="box" style="margin-top:14px"><h5>İptal Edilen Biletler</h5>${simpleTable(c, 'eb:biletIptal', [
        { head: 'Bilet No', cell: `<span class="code">${v('eb:biletNo')}</span>` },
        { head: 'İptal Zamanı', cell: call('zaman', { z: 'eb:iptalZamani' }) },
        { head: 'Tutar', cell: num('eb:tutar'), cls: 'r' },
        { head: 'KDV', cell: num('eb:kdv'), cls: 'r' },
    ])}</div></div>`) : '';
    return '<xsl:for-each select="/eb:eBilet"><div class="page">'
        + head + summary + `<div class="in">${tickets}</div>` + cancels
        + footer(c, 'Bu rapor GİB e-Bilet sistemine elektronik ortamda iletilmiştir.')
        + '</div></xsl:for-each>';
}

function passengerListBody(c: Ctx): string {
    const on = c.on;
    const head = ebiletHeader(c, 'e-YOLCU LİSTESİ', ebiletMeta([
        { label: 'Tarih', value: date('eb:baslik/eb:baslangicTarihi'), test: 'eb:baslik/eb:baslangicTarihi' },
        { label: 'Liste Sayısı', value: v('count(eb:yolcuListesi)'), test: 'eb:yolcuListesi' },
    ]));
    const seferBox: Box = {
        title: 'Sefer Bilgileri', test: 'eb:seferNumarasi or eb:aracPlakasi',
        rows: [
            { label: 'Liste No', value: `<span class="code">${v('eb:yolcuListesiNo')}</span>` },
            { label: 'Sefer No', value: `<b>${v('eb:seferNumarasi')}</b>` },
            { label: 'Sefer Tarihi', value: date('eb:seferTarihi') },
            { label: 'Hareket', value: `${call('zaman', { z: 'eb:haraketZamani' })}${xt(' · ')}${v('eb:hareketNoktasi')}` },
            { label: 'Plaka', value: `<b>${v('eb:aracPlakasi')}</b>` },
        ],
    };
    const operatorBox: Box = {
        title: 'Taşıtı İşleten', test: 'eb:aracIsleten',
        rows: [
            { label: 'VKN / TCKN', value: `${v('eb:aracIsleten/eb:vkn')}${v('eb:aracIsleten/eb:tckn')}` },
            { label: 'Komisyon', value: money('eb:aracIsleten/eb:komisyonTutar', "''"), test: 'eb:aracIsleten/eb:komisyonTutar' },
            { label: 'Komisyon KDV', value: money('eb:aracIsleten/eb:komisyonKDV', "''"), test: 'eb:aracIsleten/eb:komisyonKDV' },
        ],
    };
    const summary = on('ozet') ? cards([
        ['Yolcu', v('count(eb:koltukListesi/eb:koltuk)')],
        ['Toplam Hasılat', money('eb:toplamHasilat', "''")],
        ['Sefer', v('eb:seferNumarasi')],
        ['Plaka', v('eb:aracPlakasi')],
    ]) : '';
    const seats = simpleTable(c, 'eb:koltukListesi/eb:koltuk', [
        { head: 'Koltuk', cell: `<b>${v('eb:koltukNo')}</b>`, cls: 'c' },
        { head: 'Ad Soyad', cell: `<span class="iname">${v('eb:adSoyad')}</span>` },
        { head: 'TCKN / Pasaport', cell: `<span class="code"><xsl:choose><xsl:when test="eb:tcknYkn">${v('eb:tcknYkn')}</xsl:when><xsl:otherwise>${v('eb:pasaportNo')}</xsl:otherwise></xsl:choose></span><xsl:if test="eb:uyruk">${xt(' ')}<span class="badge">${v('eb:uyruk')}</span></xsl:if>` },
        { head: 'Bilet No', cell: `<span class="code">${v('eb:biletNo')}</span>` },
        { head: 'Tutar', cell: `<b>${num('eb:tutar')}</b>`, cls: 'r' },
    ]);
    return '<xsl:for-each select="/eb:eYolcuListesi"><div class="page">' + head
        + `<xsl:for-each select="eb:yolcuListesi">${summary}${renderBoxes(on('isleten') ? [seferBox, operatorBox] : [seferBox])}<div class="in" style="margin-bottom:6px">${seats}</div>${signature(c)}</xsl:for-each>`
        + footer(c, 'Yolcu listesinin kâğıt nüshası sefer sonuna kadar taşıtta bulundurulur.')
        + '</div></xsl:for-each>';
}

// ---------------------------------------------------------------------------
// Ana giriş
// ---------------------------------------------------------------------------
const UBL_NS_DECL = (ns: string) =>
    `xmlns:n1="${ns}" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"`;

function stylesheet(o: { comment: string; nsDecl: string; exclude: string; title: string; css: string; body: string; templates: string }): string {
    return '<?xml version="1.0" encoding="UTF-8"?>\n'
        + `<!--\n  ${escComment(o.comment)}\n-->\n`
        + `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" ${o.nsDecl} exclude-result-prefixes="${o.exclude}">\n`
        + '<xsl:output method="html" encoding="UTF-8" indent="no"/>\n'
        + '<xsl:decimal-format name="tr" decimal-separator="," grouping-separator="." NaN=""/>\n'
        + '<xsl:template match="/">\n<html lang="tr"><head><meta charset="UTF-8"/>'
        + `<title>${o.title}</title>\n<style><![CDATA[\n${o.css}\n]]></style></head>\n<body>${o.body}</body></html>\n</xsl:template>\n`
        + `${o.templates}\n</xsl:stylesheet>\n`;
}

function normalize(params: DesignParams, dt: WizardDocType): DesignParams {
    const invoiceFamily = dt.family === 'invoice';
    return {
        ...params,
        docTypeId: dt.id,
        accent: isHex(params.accent) ? params.accent.toLowerCase() : '#2563eb',
        paper: invoiceFamily && params.paper === 'fis80' ? 'fis80' : 'a4',
        sections: params.sections ?? {},
        texts: params.texts ?? {},
        banks: Array.isArray(params.banks) ? params.banks : [],
    };
}

export function generateDesign(params: DesignParams, docType: WizardDocType, opts: GenerateOptions = {}): GeneratedDesign {
    const p = normalize(params, docType);
    const variant = opts.variant ?? p.variant ?? 0;
    const L = layoutOf(p, variant);
    const T = themeOf(p);
    const fam = docType.family;
    const ubl = fam === 'invoice' || fam === 'creditNote' || fam === 'despatch' || fam === 'receiptAdvice';
    const c: Ctx = { p, dt: docType, L, T, on: id => isSectionOn(p, id), qr: ubl && QR_DOCS.includes(docType.id) };
    const styleLabel = labelOf(STYLES, p.style);
    const comment = `Tasarım Yapay Zekası ile üretildi: ${docType.label}, ${styleLabel} stil, vurgu ${p.accent}, varyasyon ${variant}.`;
    let xslt: string;
    if (fam === 'ebiletReport' || fam === 'ebiletPassengerList') {
        xslt = stylesheet({
            comment, nsDecl: `xmlns:eb="${FAMILY_INFO[fam].ns}"`, exclude: 'eb', css: cssA4(c), templates: BASE_TEMPLATES,
            title: `${esc(docType.label)} <xsl:value-of select="/*/eb:baslik/eb:baslangicTarihi"/>`,
            body: fam === 'ebiletReport' ? ebiletReportBody(c) : passengerListBody(c),
        });
    } else {
        const fis = fam === 'invoice' && p.paper === 'fis80';
        xslt = stylesheet({
            comment, nsDecl: UBL_NS_DECL(FAMILY_INFO[fam].ns), exclude: 'n1 cac cbc', templates: `${BASE_TEMPLATES}\n${UBL_TEMPLATES}`,
            css: fis ? cssReceipt(c) : cssA4(c),
            title: `${esc(docType.label)} <xsl:value-of select="/*/cbc:ID"/>`,
            body: fis ? receiptBody(c) : ublBody(c),
        });
    }
    return { xslt, ...describe(c, variant) };
}

function describe(c: Ctx, variant: number): Omit<GeneratedDesign, 'xslt'> {
    const { p, dt } = c;
    const styleLabel = labelOf(STYLES, p.style);
    const sector = SECTORS.find(s => s.id === p.sector);
    const category = CATEGORIES.find(x => x.id === p.category);
    const color = colorName(p.accent) ?? p.accent;
    const onSections = sectionsFor(dt.id).filter(s => c.on(s.id));
    const features = [
        p.logo ? 'logolu başlık' : 'firma adı monogramlı başlık',
        c.qr ? 'GİB karekodu' : '',
        p.banks.length ? `${p.banks.length} banka hesabı` : '',
        ...onSections.slice(0, 5).map(s => s.label.toLocaleLowerCase('tr-TR')),
        p.paper === 'fis80' ? '80 mm fiş düzeni' : '',
    ].filter(Boolean);
    const name = `${sector ? `${sector.label} · ` : ''}${styleLabel} ${dt.label}${p.paper === 'fis80' ? ' (80 mm fiş)' : ''}${variant ? ` V${variant + 1}` : ''}`;
    const description = `${dt.label} için ${styleLabel.toLocaleLowerCase('tr-TR')} stilde, ${color} vurgulu tasarım`
        + `${sector ? ` (${sector.label}${category ? `, ${category.label}` : ''})` : ''}: ${features.join(', ')}.`;
    const tags = uniq([
        styleLabel, dt.label, sector?.label ?? '', p.logo ? 'Logo' : '', p.banks.length ? 'Banka bilgisi' : '', c.qr ? 'Karekod' : '',
        ...onSections.filter(s => s.id !== 'notlar').slice(0, 4).map(s => s.label.replace(/[“”]/g, '')),
        p.paper === 'fis80' ? '80 mm fiş' : '', 'Yapay zeka',
    ].filter(Boolean));
    return { name, description, tags, accent: readableAccent(p.accent) };
}
