/**
 * Profesyonel şablonların CSS'i. Gövde kompozisyonu generator.ts'te; buradaki
 * kurallar yalnızca sınıf adlarına bağlıdır. Eski IE motorları için tablo
 * düzeni, önceden hesaplanmış renkler; degrade yalnızca düz renk yedeğiyle.
 */
import type { BaseStyleId, ProStyleId } from './types';
import { mix, textOn } from './utils';

export const PRO_BASE: Record<ProStyleId, BaseStyleId> = {
    antet: 'klasik', serit: 'kurumsal', panel: 'kurumsal', isvec: 'minimal', tutar: 'modern', kart: 'modern',
};

export interface ProPalette {
    A: string;
    dark: string;
    deep: string;
    tint: string;
    tint2: string;
    line: string;
    font: string;
    size: number;
    logoH: number;
    logoW: number;
}

const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "Consolas, 'Courier New', monospace";
const HAIR = '#e5e9f0';

function baseRules(P: ProPalette, o: { head: string; radius: number; pad: number; pageBg: string; bodyBg: string }): string[] {
    const R = `${o.radius}px`;
    const label = 'font-size: .7em; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;';
    return [
        '* { box-sizing: border-box; }',
        'table { border-collapse: collapse; font-size: inherit; line-height: inherit; color: inherit; }',
        `body { margin: 0; background: ${o.bodyBg}; font-family: ${P.font}; font-size: ${P.size}px; line-height: 1.5; color: #1e293b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }`,
        `.page { width: 210mm; max-width: 100%; margin: 18px auto; background: ${o.pageBg}; padding: 0 0 22px; box-shadow: 0 8px 28px #c5ccd6; }`,
        `.in { padding: 0 ${o.pad}px; }`,
        `.topnote { background: ${P.tint}; color: ${P.dark}; text-align: center; padding: 7px ${o.pad}px; font-weight: 600; font-size: .92em; }`,
        '.hdr { width: 100%; }',
        '.hdr td { vertical-align: top; }',
        '.hdr td.mid { vertical-align: middle; }',
        '.tr { text-align: right; }',
        `.logo { display: block; max-height: ${P.logoH}px; max-width: ${P.logoW}px; }`,
        `.chip { display: inline-block; background: #fff; padding: 6px 8px; border-radius: ${Math.max(o.radius, 6)}px; }`,
        `.mono { width: 48px; height: 48px; line-height: 48px; text-align: center; font-size: 22px; font-weight: 700; color: ${textOn(P.A)}; background: ${P.A}; border-radius: ${R}; font-family: ${o.head}; }`,
        `.lbl { ${label} color: #94a3b8; }`,
        '.val { font-weight: 600; color: #0f172a; }',
        `.ettn { font-family: ${MONO}; font-size: .84em; font-weight: 400; word-break: break-all; color: #475569; }`,
        '.ettn-line { margin-top: 8px; color: #94a3b8; font-size: .88em; }',
        '.slogan { color: #64748b; font-style: italic; margin-top: 2px; }',
        `.prof { color: ${P.A}; ${label} margin-top: 3px; }`,
        '.meta th { text-align: left; color: #94a3b8; font-weight: 500; padding: 2px 14px 2px 0; white-space: nowrap; }',
        '.meta td { text-align: left; font-weight: 600; padding: 2px 0; color: #0f172a; }',
        '.qr-cell { width: 132px; padding-left: 18px; }',
        '.parties { width: 100%; margin-top: 22px; }',
        '.parties td.pcell { width: 50%; vertical-align: top; }',
        '.gap { width: 18px; }',
        `.plabel { ${label} color: ${P.A}; margin-bottom: 6px; }`,
        '.pname { font-size: 1.12em; font-weight: 700; color: #0f172a; margin-bottom: 3px; line-height: 1.3; }',
        '.pl { color: #475569; }',
        '.pt, .kv { margin-top: 6px; }',
        '.pt th, .kv th { text-align: left; color: #94a3b8; font-weight: 500; padding: 1px 12px 1px 0; white-space: nowrap; vertical-align: top; }',
        '.pt td, .kv td { padding: 1px 0; vertical-align: top; }',
        '.infos { width: 100%; margin-top: 16px; }',
        '.icell { width: 33%; vertical-align: top; padding-right: 12px; }',
        `.ibox { border: 1px solid ${HAIR}; border-radius: ${R}; padding: 10px 12px; }`,
        `.ilabel { ${label} color: ${P.A}; margin-bottom: 4px; }`,
        '.lines { width: 100%; margin-top: 22px; }',
        `.lines th { padding: 9px 10px; text-align: left; ${label} white-space: nowrap; }`,
        `.lines td { padding: 10px; vertical-align: top; border-bottom: 1px solid ${HAIR}; }`,
        '.r { text-align: right !important; white-space: nowrap; }',
        '.c { text-align: center !important; }',
        '.iname { font-weight: 600; color: #0f172a; }',
        '.desc { color: #64748b; font-size: .9em; }',
        `.code { color: #64748b; font-size: .85em; font-family: ${MONO}; }`,
        '.bottom { width: 100%; margin-top: 20px; }',
        '.bl { vertical-align: top; padding-right: 22px; }',
        '.br { vertical-align: top; width: 42%; }',
        '.qr-bottom { width: 134px; vertical-align: top; padding-right: 16px; }',
        '.tot { width: 100%; }',
        `.tot td { padding: 6px 10px; border-bottom: 1px solid ${HAIR}; color: #475569; }`,
        '.tot td.r { color: #0f172a; font-weight: 600; }',
        '.tot tr.neg td { color: #b91c1c; }',
        '.words { margin-top: 8px; font-style: italic; color: #475569; font-size: .9em; }',
        '.grandband { width: 100%; margin-top: 16px; }',
        '.grandband td { padding: 14px 18px; vertical-align: middle; }',
        `.gb-l { ${label} }`,
        '.gb-words { font-style: italic; font-size: .92em; }',
        '.gb-amt { font-size: 1.85em; font-weight: 800; text-align: right; white-space: nowrap; }',
        `.box { margin-bottom: 12px; border: 1px solid ${HAIR}; border-radius: ${R}; padding: 10px 12px; }`,
        `.box h5 { margin: 0 0 6px; ${label} color: ${P.A}; }`,
        '.notes div { margin-bottom: 3px; }',
        '.mini { width: 100%; }',
        `.mini th { text-align: left; font-size: .78em; color: #94a3b8; border-bottom: 1px solid ${HAIR}; padding: 3px 4px; font-weight: 700; }`,
        `.mini td { padding: 4px; border-bottom: 1px solid ${HAIR}; vertical-align: top; }`,
        `.iban { font-family: ${MONO}; white-space: nowrap; font-weight: 700; letter-spacing: .4px; }`,
        `.bank-item { padding: 5px 0; border-bottom: 1px dashed ${HAIR}; }`,
        `.badge { display: inline-block; padding: 1px 8px; border-radius: 10px; background: ${P.tint2}; color: ${P.dark}; font-size: .78em; font-weight: 700; }`,
        `.status { display: inline-block; padding: 4px 12px; border-radius: ${R}; background: ${P.A}; color: ${textOn(P.A)}; font-weight: 800; letter-spacing: 1px; }`,
        '.sign { width: 100%; margin-top: 34px; }',
        '.sign td.s { width: 42%; text-align: center; vertical-align: bottom; padding-top: 36px; }',
        '.sline { border-top: 1px solid #94a3b8; padding-top: 5px; font-weight: 600; }',
        '.shint { color: #94a3b8; font-size: .85em; }',
        '.stampbox { margin-top: 18px; text-align: right; }',
        '.stampbox img { max-height: 100px; max-width: 230px; }',
        `.foot { margin-top: 24px; padding-top: 12px; border-top: 1px solid ${HAIR}; text-align: center; color: #64748b; font-size: .88em; }`,
        `.thanks { color: ${P.A}; font-weight: 700; font-size: 1.15em; margin-bottom: 6px; font-family: ${o.head}; }`,
        `.fbox { text-align: left; background: ${P.tint}; border-radius: ${R}; padding: 8px 12px; margin: 6px 0; color: #334155; }`,
        '.contact { margin-top: 4px; color: #334155; font-weight: 600; }',
        '.legal { font-size: .85em; color: #94a3b8; margin-top: 4px; }',
        '.ebelge { margin-top: 6px; font-size: .8em; color: #94a3b8; }',
        '@page { size: A4; margin: 8mm; }',
        '@media print { body { background: #fff; } .page { margin: 0; box-shadow: none; width: auto; } }',
    ];
}

function antet(P: ProPalette): string[] {
    const ink = P.dark;
    return [
        ...baseRules(P, { head: SERIF, radius: 0, pad: 34, pageBg: '#fff', bodyBg: '#e8ebf0' }),
        '.lh { text-align: center; padding: 36px 34px 0; }',
        '.lh .logo, .lh .mono { margin: 0 auto 12px; }',
        `.lh-name { font-family: ${SERIF}; font-size: 1.7em; letter-spacing: 4px; text-transform: uppercase; color: ${ink}; line-height: 1.2; }`,
        `.lh .slogan { font-family: ${SERIF}; margin-top: 4px; }`,
        '.lh-contact { margin-top: 6px; color: #64748b; font-size: .86em; letter-spacing: .6px; }',
        `.lh-rule { margin: 18px 34px 0; border-top: 1px solid ${P.A}; border-bottom: 1px solid ${P.A}; height: 4px; font-size: 0; line-height: 0; }`,
        '.th-row { margin-top: 24px; }',
        `.doc-title { font-family: ${SERIF}; font-size: 1.75em; letter-spacing: 5px; color: ${ink}; line-height: 1.1; }`,
        '.doc-sub { margin-top: 6px; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; font-size: .72em; }',
        '.th-row .meta { margin-left: auto; }',
        '.th-row .meta th { text-align: right; }',
        '.th-row .meta td { text-align: right; }',
        `.pbox { border-top: 1px solid ${ink}; padding-top: 10px; }`,
        `.plabel, .ilabel, .box h5 { font-family: ${SERIF}; color: ${ink}; letter-spacing: 3px; }`,
        `.lines th { color: ${ink}; background: #fff; border-top: 1px solid ${ink}; border-bottom: 1px solid ${ink}; }`,
        `.tot tr.grand td { border-top: 3px double ${ink}; border-bottom: 3px double ${ink}; font-family: ${SERIF}; font-size: 1.3em; color: ${ink}; padding: 10px; }`,
        `.thanks { font-style: italic; font-weight: 400; color: ${ink}; font-size: 1.3em; }`,
        `.foot { border-top: 1px solid ${P.A}; }`,
    ];
}

function serit(P: ProPalette): string[] {
    const onDeep = textOn(P.deep);
    const muted = mix(onDeep, P.deep, 0.35);
    return [
        ...baseRules(P, { head: P.font, radius: 4, pad: 30, pageBg: '#fff', bodyBg: '#e8ebf0' }),
        `.band { background: ${P.deep}; color: ${onDeep}; padding: 24px 30px 22px; }`,
        '.band table { width: 100%; }',
        '.band td { vertical-align: middle; }',
        '.b-logo { padding-right: 16px; width: 1%; }',
        `.band .mono { background: #fff; color: ${P.deep}; }`,
        `.b-name { font-size: 1.45em; font-weight: 800; color: ${onDeep}; line-height: 1.2; }`,
        `.band .slogan, .band .prof { color: ${muted}; }`,
        `.b-title { text-align: right; font-size: 1.85em; font-weight: 800; letter-spacing: 3px; color: ${onDeep}; line-height: 1.1; }`,
        `.b-no { text-align: right; color: ${muted}; margin-top: 5px; letter-spacing: 1px; }`,
        `.accent-bar { height: 5px; background: ${P.A}; font-size: 0; line-height: 0; }`,
        `.metas { width: 100%; margin-top: 18px; border: 1px solid ${HAIR}; }`,
        '.metas td { padding: 9px 14px; vertical-align: top; }',
        `.metas td + td { border-left: 1px solid ${HAIR}; }`,
        `.pbox { background: ${P.tint}; border-left: 4px solid ${P.A}; padding: 12px 14px; }`,
        `.plabel, .ilabel, .box h5 { color: ${P.deep}; }`,
        `.lines th { background: ${P.deep}; color: ${onDeep}; }`,
        '.lines tr.z td { background: #f6f8fb; }',
        `.tot tr.grand td { background: ${P.deep}; color: ${onDeep}; font-size: 1.2em; font-weight: 800; border: 0; padding: 11px 10px; }`,
        `.grandband { background: ${P.deep}; color: ${onDeep}; border-left: 6px solid ${P.A}; }`,
        `.gb-l { color: ${muted}; }`,
    ];
}

function panel(P: ProPalette): string[] {
    const onDeep = textOn(P.deep);
    const muted = mix(onDeep, P.deep, 0.42);
    const soft = mix(onDeep, P.deep, 0.18);
    const rule = mix(P.deep, onDeep, 0.16);
    const accent = onDeep === '#ffffff' ? mix(P.A, '#ffffff', 0.45) : P.dark;
    return [
        ...baseRules(P, { head: P.font, radius: 6, pad: 0, pageBg: '#fff', bodyBg: '#e8ebf0' }),
        '.page { padding: 0; }',
        '.split { width: 100%; }',
        `.split td.side { width: 33%; background: ${P.deep}; color: ${soft}; padding: 30px 22px; vertical-align: top; }`,
        '.split td.main { padding: 30px 28px 22px; vertical-align: top; }',
        `.side .mono { background: #fff; color: ${P.deep}; }`,
        `.side-name { color: ${onDeep}; font-size: 1.3em; font-weight: 700; margin-top: 14px; line-height: 1.25; }`,
        `.side .slogan, .side .prof { color: ${muted}; }`,
        `.side-title { margin-top: 28px; color: ${onDeep}; font-size: 1.5em; font-weight: 800; letter-spacing: 2px; line-height: 1.15; }`,
        `.side-acc { width: 38px; height: 4px; background: ${accent}; margin: 10px 0 16px; font-size: 0; line-height: 0; }`,
        '.sm { margin-bottom: 9px; }',
        `.side .lbl { color: ${muted}; }`,
        `.side .val { color: ${onDeep}; }`,
        `.side .ettn { color: ${soft}; }`,
        `.side-sec { margin-top: 22px; padding-top: 16px; border-top: 1px solid ${rule}; }`,
        `.side .plabel, .side .box h5 { color: ${accent}; }`,
        `.side .pname { color: ${onDeep}; }`,
        `.side .pl, .side .pt td { color: ${soft}; }`,
        `.side .pt th { color: ${muted}; }`,
        '.side .box { border: 0; padding: 0; margin: 0; }',
        `.side .bank-item { border-bottom: 1px dashed ${rule}; }`,
        `.side .desc { color: ${muted}; }`,
        `.side .badge { background: ${rule}; color: ${onDeep}; }`,
        `.side .iban { color: ${onDeep}; white-space: normal; word-break: break-all; font-size: .92em; }`,
        '.side-qr { margin-top: 22px; background: #fff; padding: 8px; display: inline-block; border-radius: 8px; }',
        '.main .in { padding: 0; }',
        `.main .pbox { border-bottom: 2px solid ${P.A}; padding-bottom: 12px; }`,
        '.main .lines { font-size: .95em; margin-top: 18px; }',
        `.lines th { color: ${P.dark}; background: #fff; border-bottom: 2px solid ${P.dark}; }`,
        '.br { width: 52%; }',
        `.tot tr.grand td { background: ${P.A}; color: ${textOn(P.A)}; font-size: 1.18em; font-weight: 800; border: 0; padding: 10px; }`,
    ];
}

function isvec(P: ProPalette): string[] {
    const ink = '#0f172a';
    return [
        ...baseRules(P, { head: P.font, radius: 0, pad: 40, pageBg: '#fff', bodyBg: '#eceef1' }),
        '.sw-top { width: 100%; margin-top: 34px; }',
        '.sw-top td { vertical-align: top; }',
        '.sw-co { text-align: right; color: #64748b; font-size: .92em; }',
        `.sw-co b { color: ${ink}; font-size: 1.1em; }`,
        `.doc-title { font-size: 3em; font-weight: 300; letter-spacing: -1px; color: ${ink}; line-height: 1; margin-top: 38px; }`,
        `.dot { color: ${P.A}; font-weight: 700; }`,
        '.doc-sub { color: #94a3b8; margin-top: 10px; letter-spacing: 2px; text-transform: uppercase; font-size: .72em; }',
        '.qr-cell { vertical-align: bottom !important; }',
        `.grid { width: 100%; margin-top: 28px; border-top: 2px solid ${ink}; }`,
        '.grid td { padding: 10px 18px 0 0; vertical-align: top; }',
        '.pbox { padding: 0; }',
        '.plabel, .ilabel, .box h5 { color: #94a3b8; }',
        `.ibox, .box { border: 0; border-top: 1px solid ${HAIR}; border-radius: 0; padding: 10px 0 0; }`,
        `.lines th { color: ${ink}; background: #fff; border-bottom: 2px solid ${ink}; padding-left: 0; }`,
        '.lines td { border-bottom: 1px solid #eef1f5; padding-left: 0; }',
        '.tot td { border: 0; padding: 5px 0; }',
        `.tot tr.grand td { border-top: 2px solid ${ink}; color: ${P.A}; font-size: 1.55em; font-weight: 700; padding-top: 12px; }`,
        `.thanks { color: ${ink}; font-weight: 300; font-size: 1.4em; }`,
    ];
}

function tutar(P: ProPalette): string[] {
    return [
        ...baseRules(P, { head: P.font, radius: 10, pad: 30, pageBg: '#fff', bodyBg: '#e8ebf0' }),
        '.hdr { margin-top: 28px; }',
        '.brand td { vertical-align: middle; }',
        '.b-logo { padding-right: 14px; }',
        `.b-name { font-size: 1.4em; font-weight: 800; color: ${P.dark}; line-height: 1.2; }`,
        `.doc-title { font-size: 1.45em; font-weight: 800; color: #0f172a; letter-spacing: 1.5px; }`,
        '.doc-sub { color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; font-size: .72em; margin-top: 3px; }',
        '.tr .meta { margin-left: auto; margin-top: 6px; }',
        `.hero-wrap { margin-top: 20px; background: ${P.tint}; border: 1px solid ${P.line}; border-radius: 14px; padding: 18px 22px; }`,
        '.hero { width: 100%; }',
        '.hero td { vertical-align: top; padding-right: 22px; }',
        `.hero td + td { border-left: 1px solid ${P.line}; padding-left: 20px; }`,
        `.amt { font-size: 2.5em; font-weight: 800; color: ${P.A}; line-height: 1.1; letter-spacing: -.5px; white-space: nowrap; margin-top: 2px; }`,
        '.hero .val { font-size: 1.15em; margin-top: 4px; }',
        '.hwords { font-style: italic; color: #475569; font-size: .88em; margin-top: 4px; }',
        `.hero-iban { font-family: ${MONO}; font-weight: 700; color: ${P.dark}; margin-top: 4px; white-space: nowrap; }`,
        '.hero .qr-cell { border-left: 0 !important; padding: 0 0 0 10px; }',
        `.metas { width: 100%; margin-top: 14px; }`,
        '.metas td { padding: 4px 18px 0 0; vertical-align: top; }',
        `.pbox { border: 1px solid ${HAIR}; border-radius: 10px; padding: 12px 14px; }`,
        `.lines th { background: ${P.tint2}; color: ${P.dark}; }`,
        `.tot tr.grand td { color: ${P.A}; font-size: 1.25em; font-weight: 800; border-top: 2px solid ${P.A}; border-bottom: 0; padding-top: 10px; }`,
    ];
}

function kart(P: ProPalette): string[] {
    const card = '#e3e8ef';
    const light = mix(P.A, '#ffffff', 0.35);
    return [
        ...baseRules(P, { head: P.font, radius: 14, pad: 22, pageBg: '#f5f7fb', bodyBg: '#e6eaf0' }),
        `.grad { height: 8px; background-color: ${P.A}; background-image: linear-gradient(90deg, ${P.dark}, ${P.A}, ${light}); font-size: 0; line-height: 0; margin-bottom: 18px; }`,
        `.hcard, .cw { background: #fff; border: 1px solid ${card}; border-radius: 16px; }`,
        '.hcard { padding: 18px 20px; }',
        '.cw { margin: 16px 22px 0; padding: 6px 12px 10px; }',
        '.cw .in { padding: 0; }',
        '.cw .lines, .cw .bottom { margin-top: 6px; }',
        '.brand td { vertical-align: middle; }',
        '.b-logo { padding-right: 14px; }',
        `.b-name { font-size: 1.35em; font-weight: 800; color: #0f172a; line-height: 1.2; }`,
        '.doc-title { font-size: 1.6em; font-weight: 800; color: #0f172a; letter-spacing: .5px; }',
        `.pill { display: inline-block; padding: 3px 10px; border-radius: 20px; background: ${P.tint2}; color: ${P.dark}; font-size: .76em; font-weight: 700; letter-spacing: .5px; margin: 6px 0 0 6px; }`,
        `.hsep { height: 1px; background: ${card}; margin: 14px 0 0; font-size: 0; line-height: 0; }`,
        '.metas { width: 100%; margin-top: 12px; }',
        '.metas td { padding: 0 18px 0 0; vertical-align: top; }',
        `.pbox { background: #fff; border: 1px solid ${card}; border-radius: 16px; padding: 16px 18px; }`,
        `.ibox, .box { background: #fff; border: 1px solid ${card}; border-radius: 14px; }`,
        `.lines th { color: #64748b; background: #fff; border-bottom: 1px solid ${card}; }`,
        '.lines tr.z td { background: #fafbfd; }',
        '.lines tr td { border-bottom: 1px solid #f0f3f7; }',
        `.tot tr.grand td { background: ${P.A}; color: ${textOn(P.A)}; font-size: 1.2em; font-weight: 800; border: 0; padding: 11px 12px; }`,
        '.foot { border-top: 0; }',
    ];
}

const SKINS: Record<ProStyleId, (P: ProPalette) => string[]> = { antet, serit, panel, isvec, tutar, kart };

export const cssPro = (skin: ProStyleId, P: ProPalette): string => SKINS[skin](P).join('\n');
