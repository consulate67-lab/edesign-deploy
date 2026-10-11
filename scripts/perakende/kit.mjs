// Perakende (mağaza / e-ticaret) hazır şablonlarının ortak XSLT parçaları: tema, logo, ürün satırı stilleri,
// perakendeye özgü bloklar (kampanya, sadakat, taksit, bakım sembolleri, beden tablosu, kupon, internet satışı...).
import {
    v, t, num, dt, unit, each, iff, choose, attr, P, money, pName, pAddr, pTax, pContact,
    SUP, CUS, LMT, yalniz, notes, totals, qr, logo, svg, iban, bank,
} from '../moda/lib.mjs';

export { v, t, num, dt, unit, each, iff, choose, attr, P, money, pName, pAddr, pTax, pContact, SUP, CUS, LMT, yalniz, notes, totals, qr, svg };

export const FONTS = {
    sans: "'Segoe UI', Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    didot: "'Bodoni MT', Didot, 'Times New Roman', serif",
    palatino: "'Palatino Linotype', 'Book Antiqua', Georgia, serif",
    garamond: "Garamond, 'EB Garamond', Georgia, serif",
    mono: "Consolas, 'Courier New', monospace",
    narrow: "'Arial Narrow', 'Roboto Condensed', Arial, sans-serif",
    impact: "Impact, 'Arial Black', 'Segoe UI', sans-serif",
    round: "'Trebuchet MS', 'Segoe UI', sans-serif",
    hand: "'Segoe Print', 'Comic Sans MS', cursive",
    century: "'Century Gothic', Futura, 'Segoe UI', sans-serif",
    verdana: 'Verdana, Tahoma, sans-serif',
};

/* ------------------------------------------------------------------ Logo */

const ICONS = {
    askı: '<path d="M10 7.5a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6.9V11" fill="none"/><path d="M12 11 3.5 17.5h17Z" fill="none"/>',
    tisort: '<path d="M8.5 3.5 3 6.5l2 4 2.6-1.2V20.5h8.8V9.3L19 10.5l2-4-5.5-3c-.7 1.7-2 2.5-3.5 2.5s-2.8-.8-3.5-2.5Z" fill="none"/>',
    elbise: '<path d="M9.5 2.5h5l-.8 4.5 4.3 13.5H6L10.3 7Z" fill="none"/><path d="M10.3 7h3.4" fill="none"/>',
    sneaker: '<path d="M2.5 15.5V11l5-.8 3-3.7 3.2 2.2c2 1.8 4.8 3 7.8 3.4v3.4Z" fill="none"/><path d="M2.5 15.5v2.5h19v-2.5M10 10.5l1.5 1.2M12 9.3l1.5 1.2" fill="none"/>',
    topuk: '<path d="M3 17.5c1.8-5.5 5.8-8.5 9.8-8.5 2.2 0 3.9 1.7 4.9 3.7l3.3 1v2.3h-5.5l-2-1.8-3.8 3.3H8.8l-.9 2H5.7Z" fill="none"/><path d="M16.5 15.8v4.2" fill="none"/>',
    bot: '<path d="M6 2.5h6.5v9.5l7 3.2c1.3.6 2 1.8 2 3.1v1.2H3.5V17l2.5-2Z" fill="none"/><path d="M3.5 19.5h18M6.5 6h6M6.5 9h6" fill="none"/>',
    canta: '<path d="M4.5 8.5h15l-1.2 12H5.7Z" fill="none"/><path d="M8.5 8.5V6.5a3.5 3.5 0 0 1 7 0v2" fill="none"/>',
    makas: '<circle cx="6" cy="6" r="2.8" fill="none"/><circle cx="6" cy="18" r="2.8" fill="none"/><path d="m8.2 7.8 12.3 12.7M8.2 16.2 20.5 3.5" fill="none"/>',
    dugme: '<circle cx="12" cy="12" r="8.5" fill="none"/><circle cx="9.8" cy="9.8" r="1.1"/><circle cx="14.2" cy="9.8" r="1.1"/><circle cx="9.8" cy="14.2" r="1.1"/><circle cx="14.2" cy="14.2" r="1.1"/>',
    bebek: '<path d="M8 3h8l4.5 4-3 2.2v4l2 7.8h-5l-2.5-3-2.5 3H4.5l2-7.8v-4l-3-2.2Z" fill="none"/>',
    yumak: '<circle cx="12" cy="12" r="8.5" fill="none"/><path d="M5 9c4 0 9 2 13 7M4.5 13c4 0 8 2 10 6.5M8 4.5c3 2 6 6 7 11M13 3.6c2 2.5 4.5 5 6.9 6.1" fill="none"/>',
    perde: '<path d="M2.5 3.5h19M5 3.5c0 6 1.5 11.5 5 17M19 3.5c0 6-1.5 11.5-5 17M5 3.5c2.5 2 3.3 4.5 3.8 7.5M19 3.5c-2.5 2-3.3 4.5-3.8 7.5" fill="none"/>',
    forma: '<path d="M7.5 3 3 5.5l1.5 5 2-.7v10.7h11V9.8l2 .7 1.5-5L16.5 3h-2.5a2 2 0 0 1-4 0Z" fill="none"/><path d="M10.5 12.5h3v5" fill="none"/>',
    kalp: '<path d="M12 20.5s-8.5-5-8.5-11A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.5c0 6-8.5 11-8.5 11Z" fill="none"/>',
    yildiz: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" fill="none"/>',
    gozluk: '<circle cx="6.5" cy="14" r="4" fill="none"/><circle cx="17.5" cy="14" r="4" fill="none"/><path d="M10.5 14c1-1 2-1 3 0M2.5 14 4 6.5M21.5 14 20 6.5" fill="none"/>',
    kitap: '<path d="M12 6.5C9.5 4.8 6.5 4.5 3 5v13.5c3.5-.5 6.5-.2 9 1.5 2.5-1.7 5.5-2 9-1.5V5c-3.5-.5-6.5-.2-9 1.5ZM12 6.5V20" fill="none"/>',
    oyuncak: '<circle cx="12" cy="13" r="6.5" fill="none"/><circle cx="6.5" cy="6.5" r="2.5" fill="none"/><circle cx="17.5" cy="6.5" r="2.5" fill="none"/><circle cx="9.8" cy="12" r=".9"/><circle cx="14.2" cy="12" r=".9"/><path d="M10.5 15.5c1 .8 2 .8 3 0" fill="none"/>',
    sarj: '<rect x="6.5" y="2.5" width="11" height="19" rx="2" fill="none"/><path d="M10.5 18.5h3M12.8 6.5l-2.6 4.5h3.6l-2.6 4.5" fill="none"/>',
    koltuk: '<path d="M5 11V7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5V11" fill="none"/><path d="M3 11.5a2 2 0 0 1 4 0V14h10v-2.5a2 2 0 0 1 4 0V18H3ZM5 18v2.5M19 18v2.5" fill="none"/>',
    cekic: '<path d="M14.5 3.5 20.5 9.5l-2 2-6-6ZM13.5 8.5 3.5 18.5l2 2 10-10" fill="none"/>',
    pati: '<ellipse cx="12" cy="16" rx="4.5" ry="3.8" fill="none"/><circle cx="6" cy="10.5" r="1.9" fill="none"/><circle cx="18" cy="10.5" r="1.9" fill="none"/><circle cx="9.3" cy="6.3" r="1.9" fill="none"/><circle cx="14.7" cy="6.3" r="1.9" fill="none"/>',
    cicek: '<circle cx="12" cy="9" r="2.2" fill="none"/><path d="M12 6.8C11 3 13 3 12 6.8ZM12 11.2c1 3.8-1 3.8 0 0ZM9.8 9C6 8 6 10 9.8 9ZM14.2 9c3.8 1 3.8-1 0 0ZM12 11.2V21M12 17c2.5-2.5 5-2.5 6-2-1 2.5-3.5 3.5-6 2Z" fill="none"/>',
    saat: '<circle cx="12" cy="12" r="6.5" fill="none"/><path d="M12 8.5V12l2.5 1.5M9 5.8 9.8 2.5h4.4l.8 3.3M9 18.2l.8 3.3h4.4l.8-3.3" fill="none"/>',
    bisiklet: '<circle cx="5.5" cy="16" r="3.8" fill="none"/><circle cx="18.5" cy="16" r="3.8" fill="none"/><path d="M5.5 16 9.5 8h6.5l2.5 8M9.5 8 12 16h-6.5M15 5.5h2.5M8.5 6h2.5" fill="none"/>',
    sepet: '<path d="M3 9.5h18l-2 10.5H5ZM7.5 9.5 11 3.5M16.5 9.5 13 3.5M9 13v4M12 13v4M15 13v4" fill="none"/>',
    gitar: '<path d="M14 10 20.5 3.5M18.5 2.5l3 3M11 8.5a4 4 0 0 0-5.8 1.2 3.5 3.5 0 0 0-2.3 4.8c.8 2.3 3.2 4.6 5.5 5.5a3.5 3.5 0 0 0 4.8-2.3A4 4 0 0 0 14.5 12Z" fill="none"/><circle cx="9.5" cy="14.5" r="1.3" fill="none"/>',
    sise: '<path d="M10 2.5h4v3l1.5 2.5v13H8.5V8L10 5.5ZM8.5 12h7" fill="none"/>',
    kuruyemis: '<ellipse cx="12" cy="12" rx="5.5" ry="8" fill="none"/><path d="M12 4v16M8 7.5c2.5 1.2 5.5 1.2 8 0M8 16.5c2.5-1.2 5.5-1.2 8 0" fill="none"/>',
    kask: '<path d="M3 15.5a9 9 0 0 1 18 0ZM2 15.5h20v2.5H2ZM12 6.5v4M9 7.5l.8 3.5M15 7.5l-.8 3.5" fill="none"/>',
};

/**
 * Logo: { icon | text, shape: circle | square | diamond | hex | ring | none, fg, bg, line }.
 * obj-logo nesnesi olarak basılır; tasarım ekranında kullanıcının logosuyla değiştirilebilir.
 */
export const mkLogo = (L, size, extra = '') => {
    const fg = L.fg ?? '#ffffff';
    const bg = L.bg ?? '#111111';
    const shape = {
        circle: `<circle cx="32" cy="32" r="31" fill="${bg}"/>`,
        ring: `<circle cx="32" cy="32" r="30" fill="${bg}" stroke="${L.line ?? fg}" stroke-width="1.5"/><circle cx="32" cy="32" r="26" fill="none" stroke="${L.line ?? fg}" stroke-width=".7"/>`,
        square: `<rect x="1" y="1" width="62" height="62" rx="12" fill="${bg}"/>`,
        diamond: `<path d="M32 1 63 32 32 63 1 32Z" fill="${bg}"/>`,
        hex: `<path d="M32 1 59 16.5v31L32 63 5 47.5v-31Z" fill="${bg}"/>`,
        tag: `<path d="M14 2h48v60H14L2 32Z" fill="${bg}"/><circle cx="14" cy="32" r="3.5" fill="${fg}"/>`,
        none: '',
    }[L.shape ?? 'circle'];
    const inner = L.icon
        ? `<g transform="translate(${L.shape === 'tag' ? 22 : 14} 14) scale(1.5)" stroke="${fg}" fill="${fg}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[L.icon]}</g>`
        : `<text x="32" y="${L.text.length > 2 ? 38 : 41}" text-anchor="middle" font-family="${L.font ?? 'Georgia,serif'}" font-size="${L.text.length > 2 ? 17 : 24}" font-weight="${L.weight ?? 700}" ${L.italic ? 'font-style="italic"' : ''} fill="${fg}">${L.text}</text>`;
    if (L.icon && !ICONS[L.icon]) throw new Error(`Bilinmeyen ikon: ${L.icon}`);
    return logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${shape}${inner}</svg>`, size, size, extra);
};

/* ------------------------------------------------------------------ Tema */

/** Tema değişkenleri: a vurgu, b ikincil, t açık ton, ink yazı, soft ikincil yazı, line çizgi, bg sayfa dışı, paper kâğıt. */
export const themeCss = (th) => `
body { --a: ${th.a}; --b: ${th.b ?? th.a}; --t: ${th.t}; --ink: ${th.ink ?? '#1f2937'}; --soft: ${th.soft ?? '#6b7280'}; --line: ${th.line ?? '#e5e7eb'}; --paper: ${th.paper ?? '#ffffff'}; --on: ${th.on ?? '#ffffff'};
       background: ${th.bg ?? '#e5e7eb'}; font-family: ${FONTS[th.bf ?? 'sans']}; font-size: ${th.fs ?? '10px'}; color: var(--ink); line-height: 1.45; }
.sayfa { background: var(--paper); }
.hf { font-family: ${FONTS[th.hf ?? th.bf ?? 'sans']}; }`;

export const BASE_CSS = `
.r { text-align: right; } .c { text-align: center; } .nw { white-space: nowrap; }
.cip { display: inline-block; border: 1px solid var(--line); border-radius: 3px; padding: 0 5px; margin: 3px 4px 0 0; font-size: 8.3px; color: var(--soft); white-space: nowrap; }
.cip b { color: var(--ink); font-weight: 600; }
.sw { display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 1px solid rgba(0,0,0,.25); vertical-align: -1px; margin-right: 5px; }
.bdg { display: inline-block; min-width: 26px; padding: 2px 6px; border-radius: 4px; background: var(--t); color: var(--a); font-weight: 700; text-align: center; }
.isk { color: #b42318; font-size: 8.5px; margin-top: 2px; }
.eski { color: var(--soft); text-decoration: line-through; font-size: 8.5px; }
.kad { font-weight: 600; }
.ack { color: var(--soft); font-size: 8.8px; }
.kc { font-size: 8px; color: var(--soft); font-family: Consolas, monospace; }
table.kl { width: 100%; border-collapse: collapse; }
table.kl th { text-align: left; font-size: 8.3px; font-weight: 700; padding: 6px 6px; }
table.kl th.r { text-align: right; } table.kl th.c { text-align: center; }
table.kl td { padding: 6px 6px; vertical-align: top; border-bottom: 1px solid var(--line); }
table.kl td.no { color: var(--soft); width: 7mm; }
table.kz { width: 100%; border-collapse: collapse; font-size: 9.2px; }
table.kz th { text-align: left; font-size: 7.8px; text-transform: uppercase; letter-spacing: .5px; padding: 4px 5px; background: var(--a); color: var(--on); }
table.kz th.r { text-align: right; } table.kz th.c { text-align: center; }
table.kz td { padding: 4px 5px; vertical-align: top; }
table.kz tr:nth-child(even) td { background: var(--t); }
.kartlar { display: flex; flex-wrap: wrap; gap: 4mm; }
.kartlar .kk { width: calc(50% - 2mm); border: 1px solid var(--line); border-radius: 6px; overflow: hidden; display: flex; break-inside: avoid; background: var(--paper); }
.kartlar .kk .gor { width: 24mm; flex-shrink: 0; background: var(--t); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; position: relative; }
.kartlar .kk .gor .bb { font-size: 17px; font-weight: 800; color: var(--ink); background: rgba(255,255,255,.82); border-radius: 5px; padding: 2px 6px; min-width: 30px; text-align: center; }
.kartlar .kk .gor small { font-size: 7px; letter-spacing: 1.5px; text-transform: uppercase; background: rgba(255,255,255,.82); padding: 0 4px; border-radius: 3px; }
.kartlar .kk .ic { flex: 1; padding: 7px 9px; display: flex; flex-direction: column; }
.kartlar .kk .ic .alt { margin-top: auto; padding-top: 5px; display: flex; justify-content: space-between; align-items: baseline; border-top: 1px dashed var(--line); }
.kartlar .kk .ic .alt b { font-size: 12px; }
.liste .ll { display: flex; gap: 12px; align-items: baseline; padding: 8px 0; border-bottom: 1px solid var(--line); }
.liste .ll .nn { width: 12mm; font-size: 26px; line-height: 1; color: var(--a); }
.liste .ll .oo { flex: 1; }
.liste .ll .oo .kad { font-size: 12.5px; font-weight: 400; }
.liste .ll .ff { width: 48mm; display: flex; align-items: baseline; gap: 6px; }
.liste .ll .ff i { flex: 1; border-bottom: 1px dotted var(--soft); transform: translateY(-3px); }
.liste .ll .ff b { font-size: 12.5px; font-weight: 600; white-space: nowrap; }
.fisler { font-family: Consolas, 'Courier New', monospace; font-size: 9.5px; }
.fisler .ff { padding: 4px 0; border-bottom: 1px dashed #bdbdbd; }
.fisler .ff .s2 { display: flex; justify-content: space-between; }
.fisler .ff .cip { border: 0; padding: 0; margin: 0 8px 0 0; font-size: 8.5px; }
.kutular .kt { display: flex; align-items: stretch; border: 1.5px solid var(--ink); margin-bottom: 3mm; break-inside: avoid; }
.kutular .kt .nb { width: 22mm; border-right: 1.5px solid var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--t); }
.kutular .kt .nb b { font-size: 26px; line-height: 1; }
.kutular .kt .nb small { font-size: 7px; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
.kutular .kt .md { flex: 1; padding: 6px 10px; }
.kutular .kt .md .kad { font-size: 12px; text-transform: uppercase; letter-spacing: .5px; }
.kutular .kt .pr { width: 42mm; border-left: 1.5px dashed var(--ink); padding: 6px 10px; text-align: right; display: flex; flex-direction: column; justify-content: center; }
.kutular .kt .pr b { font-size: 14px; }
.etiketler .et { display: flex; align-items: stretch; margin-bottom: 2.5mm; break-inside: avoid; }
.etiketler .et .uc { width: 9mm; background: var(--a); clip-path: polygon(100% 0, 100% 100%, 0 50%); position: relative; }
.etiketler .et .uc:after { content: ''; position: absolute; width: 6px; height: 6px; border-radius: 50%; background: var(--paper); left: 55%; top: calc(50% - 3px); }
.etiketler .et .gv { flex: 1; display: flex; gap: 10px; align-items: center; background: var(--t); padding: 6px 10px; border-radius: 0 6px 6px 0; }
.etiketler .et .bk { width: 30mm; text-align: center; font-family: Consolas, monospace; font-size: 7.5px; letter-spacing: 1px; }
.etiketler .et .bk i { display: block; height: 22px; background: repeating-linear-gradient(90deg, var(--ink) 0 1px, transparent 1px 3px, var(--ink) 3px 5px, transparent 5px 6px, var(--ink) 6px 7px, transparent 7px 10px, var(--ink) 10px 12px, transparent 12px 13px); }
.etiketler .et .oo { flex: 1; }
.etiketler .et .fy { text-align: right; min-width: 36mm; }
.etiketler .et .fy b { display: block; font-size: 15px; color: var(--a); }
table.top { width: 100%; border-collapse: collapse; }
table.top td { padding: 3px 0; }
table.top td.t { text-align: right; white-space: nowrap; padding-left: 8px; }
table.top tr.isk td, table.top tr.tvk td { color: #b42318; }
table.top tr.ara td { font-weight: 700; border-top: 1px solid var(--line); }
table.top tr.kur td { padding-top: 7px; color: var(--a); }
.blk { margin-top: 3.5mm; break-inside: avoid; }
.blk h4 { margin: 0 0 4px 0; font-size: 8px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--a); }
.b-not { background: var(--t); border-radius: 6px; padding: 7px 10px; }
.b-not .kod { font-family: Consolas, monospace; font-weight: 700; font-size: 11px; }
.b-kupon { border: 1.5px dashed var(--ink); display: flex; position: relative; }
.b-kupon:before { content: '\\2702'; position: absolute; left: 8mm; top: -9px; background: var(--paper); padding: 0 4px; font-size: 12px; }
.b-kupon .sl { background: var(--ink); color: var(--paper); padding: 8px 12px; display: flex; align-items: center; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-size: 10px; max-width: 34mm; }
.b-kupon .or { flex: 1; padding: 7px 11px; }
.b-kupon .kod { font-family: Consolas, monospace; font-size: 14px; letter-spacing: 2px; font-weight: 700; }
.b-kart { width: 80mm; height: 44mm; border-radius: 9px; padding: 9px 12px; color: #ffffff; background: linear-gradient(130deg, var(--a), var(--b)); display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,.18); }
.b-kart .ct { display: flex; justify-content: space-between; align-items: center; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; }
.b-kart .cp { width: 28px; height: 20px; border-radius: 4px; background: linear-gradient(135deg, #f5e6a8, #c9a74c); }
.b-kart .no { font-family: Consolas, monospace; font-size: 14px; letter-spacing: 3px; }
.b-kart .ds { font-size: 8.5px; opacity: .92; }
.b-kampanya { display: flex; gap: 10px; align-items: center; background: var(--a); color: var(--on); border-radius: 6px; padding: 7px 12px; }
.b-kampanya .yz { font-size: 22px; font-weight: 800; line-height: 1; }
.b-kampanya b { font-size: 11.5px; }
.b-taksit .tk { display: flex; flex-wrap: wrap; gap: 3px; }
.b-taksit .tk span { flex: 1 1 14%; min-width: 0; border: 1px solid var(--line); border-top: 3px solid var(--a); padding: 3px 5px; font-size: 8.5px; text-align: center; background: var(--paper); }
.b-taksit .tk span b { display: block; font-size: 7.5px; color: var(--soft); font-weight: 400; }
.b-bakim .sm { display: flex; gap: 8px; flex-wrap: wrap; }
.b-bakim .sm div { width: 15mm; text-align: center; font-size: 7.2px; color: var(--soft); line-height: 1.25; }
.b-bakim .sm img { display: block; margin: 0 auto 2px auto; }
.b-beden table { border-collapse: collapse; width: 100%; font-size: 8.5px; }
.b-beden th, .b-beden td { border: 1px solid var(--line); padding: 2px 4px; text-align: center; }
.b-beden th { background: var(--t); font-weight: 600; }
.b-beden th.sec { background: var(--a); color: var(--on); font-weight: 700; }
.b-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px 10px; border: 1px solid var(--line); border-radius: 6px; padding: 7px 10px; }
.b-grid > div b { display: block; font-size: 7.3px; text-transform: uppercase; letter-spacing: .6px; color: var(--soft); font-weight: 600; }
.b-banka { border: 1px solid var(--line); border-left: 4px solid var(--a); padding: 6px 10px; }
.b-banka .ib { font-family: Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: .5px; }
.b-tes { text-align: center; font-size: 10px; color: var(--soft); }
.b-tes b { display: block; color: var(--a); font-size: 13px; }
.ettn { font-family: Consolas, monospace; font-size: 7.6px; color: var(--soft); }`;

/* ------------------------------------------------------------------ Belge bilgileri */

export const docTitle = choose(
    ["$f/cbc:InvoiceTypeCode='IADE'", t('İade Faturası')],
    ["$f/cbc:ProfileID='EARSIVFATURA'", t('e-Arşiv Fatura')],
    [null, t('e-Fatura')],
);
export const docNo = v('$f/cbc:ID');
export const docDate = dt('$f/cbc:IssueDate');
export const docTime = v('substring($f/cbc:IssueTime,1,5)');
export const ettn = v('$f/cbc:UUID');
export const payNote = v('$f/cac:PaymentMeans/cbc:InstructionNote');
export const payable = money(`${LMT}/cbc:PayableAmount`);
export const saving = money(`${LMT}/cbc:AllowanceTotalAmount`);
export const lineCount = v('count($f/cac:InvoiceLine)');
export const qtySum = num('sum($f/cac:InvoiceLine/cbc:InvoicedQuantity)', '###.##0,##');
/** Ek belge (AdditionalDocumentReference) alanı; tip ve alan adı ile. */
export const ref = (type, field = 'cbc:ID') => v(`$f/cac:AdditionalDocumentReference[cbc:DocumentType='${type}']/${field}`);
export const hasRef = (type) => `$f/cac:AdditionalDocumentReference[cbc:DocumentType='${type}']`;

/** Belge künyesi; row(etiket, değer) → HTML. */
export const metaRows = (row, { pay = true, profile = true } = {}) => [
    row(t('Fatura No'), docNo),
    row(t('Tarih / Saat'), `${docDate}${t(' ')}${docTime}`),
    profile ? row(t('Senaryo / Tip'), `${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:InvoiceTypeCode')}`) : '',
    iff('$f/cac:OrderReference', row(t('Sipariş No'), `${v('$f/cac:OrderReference/cbc:ID')}`)),
    each('$f/cac:DespatchDocumentReference', row(t('İrsaliye'), `${v('cbc:ID')}${t(' · ')}${dt('cbc:IssueDate')}`)),
    each('$f/cac:BillingReference/cac:InvoiceDocumentReference', row(t('İade Edilen Fatura'), `${v('cbc:ID')}${t(' · ')}${dt('cbc:IssueDate')}`)),
    pay ? iff('$f/cac:PaymentMeans/cbc:InstructionNote', row(t('Ödeme'), payNote)) : '',
].join('');

/** Taraf blokları (Party bağlamı dışından çağrılır). */
export const supInfo = (sep = ' · ', br = '<br/>') => each(SUP, `${pAddr(sep)}${br}${pTax(sep)}${br}${pContact(sep)}`);
export const supName = each(SUP, pName);
export const cusInfo = (sep = ' · ', br = '<br/>') => each(CUS, `${pAddr(sep)}${br}${pTax(sep)}${iff('cac:Contact', `${br}${pContact(sep)}`)}`);
export const cusName = each(CUS, pName);
export const cusLabel = choose(["$f/cbc:ProfileID='EARSIVFATURA'", t('Sayın')], [null, t('Alıcı')]);

/* ------------------------------------------------------------------ Ürün satırları */

const HIDE = ['RENKKOD', 'ETIKET', 'BARKOD'];
const chipSel = (hide) => `cac:Item/cac:AdditionalItemIdentification/cbc:ID[not(${hide.map((k) => `@schemeID='${k}'`).join(' or ')})]`;
/** Ek ürün tanımları (beden, renk, kumaş ...) etiket olarak; birincil ölçü (size) ayrıca gösterildiği için gizlenir. */
export const chips = (size) => each(chipSel(size ? [...HIDE, size] : HIDE),
    `<span class="cip"><xsl:call-template name="etiket"><xsl:with-param name="k" select="@schemeID"/></xsl:call-template>${t(' ')}<b>${v('.')}</b></span>`);
export const swatch = iff(P('RENKKOD'), `<i class="sw">${attr('style', `background:${v(P('RENKKOD'))}`)}</i>`);
export const sizeVal = (size) => choose([P(size), v(P(size))], [null, t('—')]);
const qty = `${num('cbc:InvoicedQuantity', '###.##0,##')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}`;
const price = money('cac:Price/cbc:PriceAmount');
const total = money('cbc:LineExtensionAmount');
const kdv = `${t('%')}${v('cac:TaxTotal/cac:TaxSubtotal/cbc:Percent')}`;
const name = v('cac:Item/cbc:Name');
const desc = iff('cac:Item/cbc:Description', `<div class="ack">${v('cac:Item/cbc:Description')}</div>`);
const disc = each('cac:AllowanceCharge', `<div class="isk">${v('cbc:AllowanceChargeReason')}${t(' − ')}${money('cbc:Amount')}</div>`);
const eski = iff(P('ETIKET'), `<div class="eski">${t('Etiket ')}${num(P('ETIKET'))}${t(' ')}${v('$pb')}</div>`);
const code = choose(
    [P('BARKOD'), v(P('BARKOD'))],
    ['cac:Item/cac:SellersItemIdentification/cbc:ID', v('cac:Item/cac:SellersItemIdentification/cbc:ID')],
    [null, v('cac:Item/cbc:ModelName')],
);
const LINES = '$f/cac:InvoiceLine';

export const LINE_STYLES = {
    /** Klasik tablo: ürün, birincil ölçü, miktar, birim fiyat, KDV, tutar. */
    tablo: ({ size, sizeLabel }) => `<table class="kl"><thead><tr><th>${t('#')}</th><th>${t('Ürün')}</th>${size ? `<th class="c">${t(sizeLabel)}</th>` : ''}<th class="r">${t('Miktar')}</th><th class="r">${t('Birim Fiyat')}</th><th class="r">${t('KDV')}</th><th class="r">${t('Tutar')}</th></tr></thead><tbody>${each(LINES, `<tr><td class="no">${v('cbc:ID')}</td><td><div class="kad">${swatch}${name}</div>${desc}<div>${chips(size)}</div>${disc}</td>${size ? `<td class="c"><span class="bdg">${sizeVal(size)}</span></td>` : ''}<td class="r nw">${qty}</td><td class="r nw">${price}${eski}</td><td class="r">${kdv}</td><td class="r nw"><b>${total}</b></td></tr>`)}</tbody></table>`,

    /** Yoğun zebra tablo: barkod / stok kodu sütunlu (zincir mağaza). */
    kompakt: ({ size, sizeLabel }) => `<table class="kz"><thead><tr><th>${t('Barkod / Kod')}</th><th>${t('Ürün')}</th>${size ? `<th class="c">${t(sizeLabel)}</th>` : ''}<th class="r">${t('Miktar')}</th><th class="r">${t('Fiyat')}</th><th class="r">${t('KDV')}</th><th class="r">${t('Tutar')}</th></tr></thead><tbody>${each(LINES, `<tr><td class="kc">${code}</td><td>${swatch}<span class="kad">${name}</span>${iff(`cac:Item/cac:AdditionalItemIdentification/cbc:ID[not(@schemeID='RENKKOD' or @schemeID='ETIKET' or @schemeID='BARKOD'${size ? ` or @schemeID='${size}'` : ''})]`, `<div>${chips(size)}</div>`)}${disc}</td>${size ? `<td class="c"><b>${sizeVal(size)}</b></td>` : ''}<td class="r nw">${qty}</td><td class="r nw">${price}${eski}</td><td class="r">${kdv}</td><td class="r nw"><b>${total}</b></td></tr>`)}</tbody></table>`,

    /** İki sütunlu ürün kartları: renk dolgulu görsel alanı ve büyük beden / numara. */
    kart: ({ size, sizeLabel }) => `<div class="kartlar">${each(LINES, `<div class="kk"><div class="gor">${iff(P('RENKKOD'), attr('style', `background:${v(P('RENKKOD'))}`))}${size ? `<span class="bb">${sizeVal(size)}</span><small>${t(sizeLabel)}</small>` : `<span class="bb">${v("format-number(cbc:ID,'00')")}</span>`}</div><div class="ic"><div class="kad">${name}</div>${desc}<div>${chips(size)}</div>${disc}<div class="alt"><span class="ack">${qty}${t(' × ')}${price}${t(' · KDV ')}${kdv}</span><b>${total}</b></div></div></div>`)}</div>`,

    /** Editoryal numaralı liste, noktalı fiyat çizgisi. */
    liste: ({ size, sizeLabel }) => `<div class="liste">${each(LINES, `<div class="ll"><div class="nn hf">${v("format-number(cbc:ID,'00')")}</div><div class="oo"><div class="kad hf">${name}</div>${desc}<div>${size ? `<span class="cip">${t(sizeLabel)}${t(' ')}<b>${sizeVal(size)}</b></span>` : ''}${chips(size)}<span class="cip">${qty}${t(' × ')}${price}</span><span class="cip">${t('KDV ')}${kdv}</span></div>${disc}</div><div class="ff"><i></i><b>${total}</b></div></div>`)}</div>`,

    /** Termal fiş satırı (eş aralıklı yazı). */
    fis: ({ size, sizeLabel }) => `<div class="fisler">${each(LINES, `<div class="ff"><div class="s2"><b>${name}</b><span>${kdv}</span></div><div class="s2"><span>${qty}${t(' x ')}${price}</span><b>${total}</b></div><div>${size ? `<span class="cip">${t(sizeLabel)}${t(': ')}<b>${sizeVal(size)}</b></span>` : ''}${chips(size)}${iff(P('BARKOD'), `<span class="cip">${v(P('BARKOD'))}</span>`)}</div>${disc}</div>`)}</div>`,

    /** Kutu etiketi satırı: solda iri numara / beden, sağda fiyat kesiti. */
    kutu: ({ size, sizeLabel }) => `<div class="kutular">${each(LINES, `<div class="kt"><div class="nb">${iff(P('RENKKOD'), attr('style', `border-top:6px solid ${v(P('RENKKOD'))}`))}<b class="hf">${size ? sizeVal(size) : v('cbc:ID')}</b><small>${t(size ? sizeLabel : 'Sıra')}</small></div><div class="md"><div class="kad hf">${name}</div>${desc}<div>${chips(size)}${iff('cac:Item/cbc:ModelName', `<span class="cip">${t('Model')}${t(' ')}<b>${v('cac:Item/cbc:ModelName')}</b></span>`)}</div>${disc}</div><div class="pr"><span class="ack">${qty}${t(' × ')}${price}</span><b class="hf">${total}</b><span class="ack">${t('KDV ')}${kdv}</span>${eski}</div></div>`)}</div>`,

    /** Askı etiketi satırı: delikli uç, barkod, fiyat. */
    etiket: ({ size, sizeLabel }) => `<div class="etiketler">${each(LINES, `<div class="et"><div class="uc"></div><div class="gv"><div class="bk"><i></i>${code}</div><div class="oo"><div class="kad">${swatch}${name}</div>${desc}<div>${size ? `<span class="cip">${t(sizeLabel)}${t(' ')}<b>${sizeVal(size)}</b></span>` : ''}${chips(size)}</div>${disc}</div><div class="fy"><span class="ack">${qty}${t(' × ')}${price}${t(' · KDV ')}${kdv}</span>${eski}<b class="hf">${total}</b></div></div></div>`)}</div>`,
};

/* ------------------------------------------------------------------ Bloklar */

const CARE = {
    yikama30: (c) => `<path d="M4 9 7.5 27h25L36 9" fill="none" stroke="${c}" stroke-width="2"/><path d="M4 9q4-4 8 0t8 0 8 0 8 0" fill="none" stroke="${c}" stroke-width="2"/><text x="20" y="23" font-size="10" text-anchor="middle" font-family="Arial" fill="${c}">30</text>`,
    yikama40: (c) => `<path d="M4 9 7.5 27h25L36 9" fill="none" stroke="${c}" stroke-width="2"/><path d="M4 9q4-4 8 0t8 0 8 0 8 0" fill="none" stroke="${c}" stroke-width="2"/><text x="20" y="23" font-size="10" text-anchor="middle" font-family="Arial" fill="${c}">40</text>`,
    yikama60: (c) => `<path d="M4 9 7.5 27h25L36 9" fill="none" stroke="${c}" stroke-width="2"/><path d="M4 9q4-4 8 0t8 0 8 0 8 0" fill="none" stroke="${c}" stroke-width="2"/><text x="20" y="23" font-size="10" text-anchor="middle" font-family="Arial" fill="${c}">60</text>`,
    elde: (c) => `<path d="M4 9 7.5 27h25L36 9" fill="none" stroke="${c}" stroke-width="2"/><path d="M4 9q4-4 8 0t8 0 8 0 8 0" fill="none" stroke="${c}" stroke-width="2"/><path d="M15 25v-9m3 9v-10m3 10v-9m3 9v-7" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`,
    yikamaYok: (c) => `<path d="M4 9 7.5 27h25L36 9" fill="none" stroke="${c}" stroke-width="2"/><path d="M4 9q4-4 8 0t8 0 8 0 8 0" fill="none" stroke="${c}" stroke-width="2"/><path d="M6 5 34 30M34 5 6 30" stroke="${c}" stroke-width="2"/>`,
    agartmaYok: (c) => `<path d="M20 4 37 29H3Z" fill="none" stroke="${c}" stroke-width="2"/><path d="M11 12 29 29M29 12 11 29" stroke="${c}" stroke-width="2"/>`,
    utu1: (c) => `<path d="M6 25h30c0-8-3-13-12-13H13l-1-4" fill="none" stroke="${c}" stroke-width="2"/><path d="M6 25c1-5 3-9 7-11" fill="none" stroke="${c}" stroke-width="2"/><circle cx="22" cy="20" r="1.8" fill="${c}"/>`,
    utu2: (c) => `<path d="M6 25h30c0-8-3-13-12-13H13l-1-4" fill="none" stroke="${c}" stroke-width="2"/><path d="M6 25c1-5 3-9 7-11" fill="none" stroke="${c}" stroke-width="2"/><circle cx="19" cy="20" r="1.8" fill="${c}"/><circle cx="25" cy="20" r="1.8" fill="${c}"/>`,
    utuYok: (c) => `<path d="M6 25h30c0-8-3-13-12-13H13l-1-4" fill="none" stroke="${c}" stroke-width="2"/><path d="M6 25c1-5 3-9 7-11" fill="none" stroke="${c}" stroke-width="2"/><path d="M8 6 34 30M34 6 8 30" stroke="${c}" stroke-width="2"/>`,
    kurutmaYok: (c) => `<rect x="6" y="3" width="28" height="28" fill="none" stroke="${c}" stroke-width="2"/><circle cx="20" cy="17" r="10" fill="none" stroke="${c}" stroke-width="2"/><path d="M8 5 32 29M32 5 8 29" stroke="${c}" stroke-width="2"/>`,
    sermek: (c) => `<rect x="6" y="3" width="28" height="28" fill="none" stroke="${c}" stroke-width="2"/><path d="M11 17h18" stroke="${c}" stroke-width="2"/>`,
    kuruP: (c) => `<circle cx="20" cy="17" r="13" fill="none" stroke="${c}" stroke-width="2"/><text x="20" y="22" font-size="14" text-anchor="middle" font-family="Arial" fill="${c}">P</text>`,
    kuruYok: (c) => `<circle cx="20" cy="17" r="13" fill="none" stroke="${c}" stroke-width="2"/><path d="M9 6 31 28M31 6 9 28" stroke="${c}" stroke-width="2"/>`,
    golgede: (c) => `<rect x="6" y="3" width="28" height="28" fill="none" stroke="${c}" stroke-width="2"/><path d="M6 13 16 3M6 21 24 3" stroke="${c}" stroke-width="1.4"/><path d="M12 9v16M28 9v16" stroke="${c}" stroke-width="2"/>`,
};
const CARE_TEXT = {
    yikama30: '30° hassas yıkama', yikama40: '40° normal yıkama', yikama60: '60° yıkama', elde: 'Elde yıkama', yikamaYok: 'Yıkanmaz',
    agartmaYok: 'Ağartıcı kullanmayın', utu1: 'Düşük ısıda ütü', utu2: 'Orta ısıda ütü', utuYok: 'Ütülenmez',
    kurutmaYok: 'Kurutma makinesi yok', sermek: 'Düz serip kurutun', kuruP: 'Kuru temizleme', kuruYok: 'Kuru temizleme yok',
    golgede: 'Gölgede kurutun',
};

/** Blok kümesi; spec.blocks sırasıyla. */
export function blocks(S) {
    const out = [];
    for (const raw of S.blocks ?? []) {
        const [kind, o = {}] = Array.isArray(raw) ? raw : [raw];
        const h = o.title ? `<h4>${t(o.title)}</h4>` : '';
        switch (kind) {
            case 'kampanya':
                out.push(iff(`${LMT}/cbc:AllowanceTotalAmount &gt; 0`, `<div class="blk b-kampanya"><div class="yz">${t(o.icon ?? '%')}</div><div><b>${t(o.text ?? 'Bu alışverişte kazancınız: ')}${saving}</b><br/>${each('$f/cac:InvoiceLine/cac:AllowanceCharge[not(cbc:AllowanceChargeReason = preceding::cac:AllowanceCharge/cbc:AllowanceChargeReason)]', `${v('cbc:AllowanceChargeReason')}${t('   ')}`)}</div></div>`));
                break;
            case 'kupon':
                out.push(each(`$f/cac:AdditionalDocumentReference[cbc:DocumentType='${o.type}']`, `<div class="blk b-kupon"><div class="sl">${t(o.title)}</div><div class="or"><div class="kod">${v('cbc:ID')}</div>${v('cbc:DocumentDescription')}${t(` · ${o.dateLabel ?? 'Son tarih'}: `)}<b>${dt('cbc:IssueDate')}</b><br/><span class="ettn">${t('Fatura ')}${docNo}</span></div>${o.qr ? `<div style="padding:5px;border-left:1.5px dashed var(--ink)">${qr(66)}</div>` : ''}</div>`));
                break;
            case 'kart':
                out.push(each(`$f/cac:AdditionalDocumentReference[cbc:DocumentType='${o.type}']`, `<div class="blk"><div class="b-kart"><div class="ct"><span>${t(o.title)}</span><span class="cp"></span></div><div class="no">${v('cbc:ID')}</div><div class="ds">${v('cbc:DocumentDescription')}</div><div class="ct"><span>${cusName}</span><span>${dt('cbc:IssueDate')}</span></div></div></div>`));
                break;
            case 'not':
                out.push(each(`$f/cac:AdditionalDocumentReference[cbc:DocumentType='${o.type}']`, `<div class="blk b-not">${h}<span class="kod">${v('cbc:ID')}</span>${t(' · ')}${v('cbc:DocumentDescription')}${o.dateLabel ? `<br/>${t(`${o.dateLabel}: `)}<b>${dt('cbc:IssueDate')}</b>` : ''}</div>`));
                break;
            case 'taksit':
                out.push(iff(hasRef('TAKSIT'), `<div class="blk b-taksit">${h || `<h4>${t('Taksit Planı')}</h4>`}<div class="tk"><xsl:call-template name="taksit"><xsl:with-param name="n" select="number(${hasRef('TAKSIT')}/cbc:ID)"/><xsl:with-param name="i" select="1"/><xsl:with-param name="tutar" select="${LMT}/cbc:PayableAmount div number(${hasRef('TAKSIT')}/cbc:ID)"/></xsl:call-template></div><div class="ack" style="margin-top:3px">${ref('TAKSIT', 'cbc:DocumentDescription')}</div></div>`));
                break;
            case 'bakim': {
                const c = o.color ?? S.theme.ink ?? '#1f2937';
                out.push(`<div class="blk b-bakim">${h || `<h4>${t('Bakım Talimatı')}</h4>`}<div class="sm">${o.items.map((k) => `<div><img alt="" width="34" height="28" src="${svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 34">${CARE[k](c)}</svg>`)}"/>${t(CARE_TEXT[k])}</div>`).join('')}</div>${o.text ? `<div class="ack" style="margin-top:3px">${t(o.text)}</div>` : ''}</div>`);
                break;
            }
            case 'beden': {
                const sel = (val) => attr('class', choose([`$f/cac:InvoiceLine/${P(o.key)}='${val}'`, t('sec')], [null, t('')]));
                out.push(`<div class="blk b-beden"><h4>${t(o.title ?? 'Beden Tablosu')}</h4><table><tr><th>${t(o.head)}</th>${o.cols.map((c) => `<th>${sel(c)}${t(c)}</th>`).join('')}</tr>${o.rows.map(([label, ...vals]) => `<tr><th>${t(label)}</th>${vals.map((val) => `<td>${t(val)}</td>`).join('')}</tr>`).join('')}</table>${o.note ? `<div class="ack" style="margin-top:2px">${t(o.note)}</div>` : ''}</div>`);
                break;
            }
            case 'internet':
                out.push(`<div class="blk">${h || `<h4>${t('İnternet Satışı Bilgileri')}</h4>`}<div class="b-grid">
<div><b>${t('Satış yapılan adres')}</b>${v(`${SUP}/cbc:WebsiteURI`)}</div>
<div><b>${t('Ödeme şekli')}</b>${payNote}</div>
<div><b>${t('Ödeme tarihi')}</b>${dt('$f/cac:PaymentMeans/cbc:PaymentDueDate')}</div>
<div><b>${t('Gönderim tarihi')}</b>${dt('$f/cac:Delivery/cac:Despatch/cbc:ActualDespatchDate')}</div>
<div><b>${t('Taşıyıcı')}</b>${v('$f/cac:Delivery/cac:CarrierParty/cac:PartyName/cbc:Name')}${iff('$f/cac:Delivery/cac:CarrierParty/cac:PartyIdentification', `${t(' · VKN ')}${v('$f/cac:Delivery/cac:CarrierParty/cac:PartyIdentification/cbc:ID')}`)}</div>
<div><b>${t('Gönderi takip no')}</b>${v('$f/cac:Delivery/cbc:TrackingID')}</div></div></div>`);
                break;
            case 'siparis':
                out.push(`<div class="blk">${h}<div class="b-grid">
<div><b>${t('Sipariş')}</b>${choose(['$f/cac:OrderReference', `${v('$f/cac:OrderReference/cbc:ID')}${t(' · ')}${dt('$f/cac:OrderReference/cbc:IssueDate')}`], [null, t('—')])}</div>
<div><b>${t('İrsaliye')}</b>${choose(['$f/cac:DespatchDocumentReference', each('$f/cac:DespatchDocumentReference', `${v('cbc:ID')}${t(' · ')}${dt('cbc:IssueDate')} `)], [null, t('Fatura yerine geçer')])}</div>
<div><b>${t('Vade')}</b>${choose(['$f/cac:PaymentMeans/cbc:PaymentDueDate', dt('$f/cac:PaymentMeans/cbc:PaymentDueDate')], [null, t('Peşin')])}</div>
${iff('$f/cac:PaymentTerms/cbc:Note', `<div style="grid-column:1 / -1"><b>${t('Ödeme koşulu')}</b>${v('$f/cac:PaymentTerms/cbc:Note')}</div>`)}</div></div>`);
                break;
            case 'iade':
                out.push(each('$f/cac:BillingReference/cac:InvoiceDocumentReference', `<div class="blk b-not">${h || `<h4>${t('İadeye Konu Fatura')}</h4>`}<span class="kod">${v('cbc:ID')}</span>${t(' · ')}${dt('cbc:IssueDate')}${iff('cbc:DocumentDescription', `${t(' · ')}${v('cbc:DocumentDescription')}`)}</div>`));
                break;
            case 'banka':
                out.push(iff('$f/cac:PaymentMeans/cac:PayeeFinancialAccount', `<div class="blk">${h || `<h4>${t('Banka Bilgileri')}</h4>`}${bank(`<div class="b-banka"><b>${v('cbc:PaymentNote')}</b>${t(' · ')}${v('cbc:CurrencyCode')}<div class="ib">${iban('cbc:ID')}</div>${iff('../cbc:PaymentDueDate', `<span class="ack">${t('Son ödeme: ')}${dt('../cbc:PaymentDueDate')}</span>`)}</div>`)}</div>`));
                break;
            case 'tesekkur':
                out.push(`<div class="blk b-tes"><b class="hf">${t(o.title ?? 'Teşekkür ederiz')}</b>${t(o.text ?? '')}</div>`);
                break;
            default:
                throw new Error(`Bilinmeyen blok: ${kind}`);
        }
    }
    return out.join('\n');
}

/* ------------------------------------------------------------------ XSLT yardımcı şablonları */

export const LABELS = {
    BEDEN: 'Beden', NUMARA: 'Numara', RENK: 'Renk', KUMAS: 'Kumaş', MALZEME: 'Malzeme', KALIP: 'Kalıp', BOY: 'Boy', BEL: 'Bel',
    YAS: 'Yaş', EBAT: 'Ebat', SEZON: 'Sezon', TOPUK: 'Topuk', GENISLIK: 'Genişlik', DROP: 'Drop', AGIRLIK: 'Ağırlık',
    SU: 'Su geçirmezlik', SERINO: 'Seri no', IMEI: 'IMEI', GARANTI: 'Garanti', KOLEKSIYON: 'Koleksiyon', ISIM: 'İsim',
    FORMANO: 'No', KUPA: 'Kupa', GRAMAJ: 'Gramaj', ICERIK: 'İçerik', IPLIK: 'İplik', EN: 'En', DESEN: 'Desen', TAKIM: 'Takım',
    NAKIS: 'Nakış', STANDART: 'Standart', OLCU: 'Ölçü', TUR: 'Tür', HACIM: 'Hacim', CILT: 'Cilt tipi', SKT: 'SKT', YAZAR: 'Yazar',
    YAYINEVI: 'Yayınevi', ISBN: 'ISBN', MARKA: 'Marka', CAM: 'Cam', SOL: 'Sol', SAG: 'Sağ', PAKET: 'Paket', KG: 'Ağırlık',
    KADRO: 'Kadro', JANT: 'Jant', VITES: 'Vites', TESLIM: 'Teslim', MONTAJ: 'Montaj', ADET: 'Adet', HIZMET: 'Hizmet',
    DONEM: 'Dönem', SERTIFIKA: 'Sertifika', DURUM: 'Durum', MEKANIZMA: 'Mekanizma', KASA: 'Kasa', KORDON: 'Kordon',
    ORIJIN: 'Menşe', TEL: 'Tel', AKSESUAR: 'Aksesuar', KIRA: 'Kiralama', TARIH: 'Tarih', PARCA: 'Parça', ISLEM: 'İşlem',
    TABAN: 'Taban', SAYA: 'Saya', ASTAR: 'Astar', BURUN: 'Burun', OZELLIK: 'Özellik', SINIF: 'Sınıf', YAS_GRUBU: 'Yaş grubu',
    VOLUM: 'Hacim', GUC: 'Güç', BOYUT: 'Boyut', RENKTONU: 'Ton', STOK: 'Stok kodu',
};

export const TEMPLATES = `
    <xsl:template name="etiket">
        <xsl:param name="k"/>
        <xsl:choose>
${Object.entries(LABELS).map(([k, l]) => `            <xsl:when test="$k='${k}'">${l}</xsl:when>`).join('\n')}
            <xsl:otherwise><xsl:value-of select="$k"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template name="taksit">
        <xsl:param name="n"/>
        <xsl:param name="i"/>
        <xsl:param name="tutar"/>
        <xsl:if test="$i &lt;= $n and $i &lt;= 12">
            <span><b><xsl:value-of select="$i"/>. taksit</b><xsl:value-of select="format-number($tutar, '###.##0,00', 'edesign-tr')"/></span>
            <xsl:call-template name="taksit">
                <xsl:with-param name="n" select="$n"/>
                <xsl:with-param name="i" select="$i + 1"/>
                <xsl:with-param name="tutar" select="$tutar"/>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>`;

/** Toplam tablosu satırı (lib totals ile). */
export const sumRow = (l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`;
export const sumTable = () => `<table class="top">${totals(sumRow)}</table>`;
export const yaziyla = yalniz(v('.'));
export const notList = (fmt = (x) => `<div>${x}</div>`) => notes(fmt(v('.')));
