import { readImageFile } from '../xslt-editor/utils/imageFile';

/** Hazır şablon sorularının yanıtları: logo ve banka bilgisi tercihleri (şablona uygulanır). */
export type LogoChoice =
    | { mode: 'sample' }
    | { mode: 'none' }
    | { mode: 'custom'; dataUrl: string; width: number; height: number; name: string };

export type BankChoice = 'yes' | 'no' | 'any';

export interface TemplatePrefs {
    logo: LogoChoice;
    bank: BankChoice;
}

export const DEFAULT_PREFS: TemplatePrefs = { logo: { mode: 'sample' }, bank: 'any' };

const PREFS_KEY = 'tpl_prefs';
const LOGO_MAX_SIDE = 480;

export const loadPrefs = (): TemplatePrefs => {
    try {
        const p = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null');
        if (p && typeof p === 'object' && p.logo?.mode && ['yes', 'no', 'any'].includes(p.bank)) return p;
    } catch { /* bozuk kayıt */ }
    return DEFAULT_PREFS;
};

export const savePrefs = (p: TemplatePrefs) => {
    try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(p));
    } catch {
        try { localStorage.setItem(PREFS_KEY, JSON.stringify({ ...p, logo: DEFAULT_PREFS.logo })); } catch { /* kota */ }
    }
};

const hash = (s: string) => {
    let h = 5381;
    for (let i = 0; i < s.length; i += Math.max(1, Math.floor(s.length / 4000))) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return `${s.length.toString(36)}${(h >>> 0).toString(36)}`;
};

/** Önizleme önbelleği için tercih imzası. */
export const prefsKey = (p: TemplatePrefs) =>
    `${p.bank === 'no' ? 'nobank' : 'bank'}|${p.logo.mode === 'custom' ? hash(p.logo.dataUrl) : p.logo.mode}`;

/** Logo dosyasını okur; büyük raster logolar gömülmeden önce küçültülür (logo baskıda ~150 px'i geçmez). */
export async function readLogo(file: File): Promise<LogoChoice> {
    const img = await readImageFile(file);
    let { dataUrl, width, height } = img;
    const longest = Math.max(width, height);
    if (img.mime !== 'image/svg+xml' && img.mime !== 'image/gif' && longest > LOGO_MAX_SIDE) {
        const el = new Image();
        el.src = dataUrl;
        await el.decode();
        const scale = LOGO_MAX_SIDE / longest;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
            const out = img.mime === 'image/jpeg' ? canvas.toDataURL('image/jpeg', 0.92) : canvas.toDataURL('image/png');
            if (out.length < dataUrl.length) ({ dataUrl, width, height } = { dataUrl: out, width: canvas.width, height: canvas.height });
        }
    }
    return { mode: 'custom', dataUrl, width: width || 1, height: height || 1, name: img.name };
}

/* ------------------------------------------------------------ XSLT işlemleri */

const IMG_RE = /<img\b[^>]*>/gi;
const ATTR_RE = /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

const isLogoTag = (tag: string) =>
    /\salt\s*=\s*["']logo["']/i.test(tag) || /data-xslt-obj\s*=\s*["']obj-logo["']/i.test(tag) || /\sclass\s*=\s*["'][^"']*\blogo\b/i.test(tag);

const findLogo = (xslt: string) => {
    for (const m of xslt.matchAll(IMG_RE)) {
        if (isLogoTag(m[0])) return { start: m.index ?? 0, end: (m.index ?? 0) + m[0].length, tag: m[0] };
    }
    return null;
};

const attrsOf = (tag: string) => [...tag.matchAll(ATTR_RE)].map(m => [m[1], m[2] ?? m[3] ?? ''] as [string, string]);

const escAttr = (v: string) => v.replace(/&(?![a-z#0-9]+;)/gi, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Yer tutucu SVG'nin en/boy oranı (yükseklik / genişlik); bulunamazsa kare. */
const svgRatio = (src: string) => {
    let text = src;
    try { text = decodeURIComponent(src); } catch { /* olduğu gibi */ }
    const m = text.match(/viewBox\s*=\s*['"]\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    return m && Number(m[1]) > 0 ? Number(m[2]) / Number(m[1]) : 1;
};

const SIZE_PROPS = /^(width|height|max-width|max-height|min-width|min-height|object-fit)$/i;

const replaceLogo = (xslt: string, logo: Extract<LogoChoice, { mode: 'custom' }>) => {
    const found = findLogo(xslt);
    if (!found) return xslt;
    const attrs = attrsOf(found.tag);
    const get = (n: string) => attrs.find(([k]) => k.toLowerCase() === n)?.[1];
    const w = Number(get('width')) || 0;
    const h = Number(get('height')) || (w ? Math.round(w * svgRatio(get('src') ?? '')) : 0);
    const style = (get('style') ?? '').split(';').map(s => s.trim()).filter(s => s && !SIZE_PROPS.test(s.split(':')[0].trim()));
    if (w && h) {
        const aspect = logo.width / logo.height;
        let bw = w;
        let bh = h;
        if (aspect > 1.25) {
            bh = Math.round(h * 0.8);
            bw = Math.min(Math.round(bh * aspect), Math.round(h * 2.6));
        }
        style.push(`width:${bw}px`, `height:${bh}px`);
    }
    style.push('object-fit:contain');
    const keep = attrs.filter(([k]) => !/^(src|width|height|style|alt)$/i.test(k));
    const tag = `<img${keep.map(([k, v]) => ` ${k}="${escAttr(v)}"`).join('')} src="${logo.dataUrl}" alt="Logo" style="${escAttr(style.join(';'))}"/>`;
    return xslt.slice(0, found.start) + tag + xslt.slice(found.end);
};

const removeLogo = (xslt: string) => {
    const found = findLogo(xslt);
    if (!found) return xslt;
    const before = xslt.slice(0, found.start);
    const after = xslt.slice(found.end);
    const open = before.match(/<(td|div|span|a)\b[^>]*>\s*$/i);
    const close = after.match(/^\s*<\/(td|div|span|a)\s*>/i);
    if (open && close && open[1].toLowerCase() === close[1].toLowerCase()) {
        return before.slice(0, before.length - open[0].length) + after.slice(close[0].length);
    }
    return before + after;
};

/**
 * Banka hesabı yolunu hiç eşleşmeyecek hale getirir: şablonlar banka bloğunu "hesap varsa" koşuluyla
 * çizdiği için blok, XML'de IBAN olsa bile görünmez.
 */
const hideBankPaths = (xslt: string) =>
    xslt.replace(/\b(select|test|match)\s*=\s*("[^"]*"|'[^']*')/g, (m, name: string, value: string) =>
        value.includes('cac:PayeeFinancialAccount')
            ? `${name}=${value.replace(/cac:PayeeFinancialAccount(?!\[false\(\)\])/g, 'cac:PayeeFinancialAccount[false()]')}`
            : m);

const BANK_BOX_RE = /<(div|section|table|td)\b[^>]*\sclass\s*=\s*["'][^"']*\bbanks?\b[^"']*["'][^>]*>/gi;

/** Açılış etiketinin eşini (aynı adlı iç içe etiketleri sayarak) bulur; bulunamazsa -1. */
const closingEnd = (xslt: string, tag: string, from: number) => {
    const re = new RegExp(`<(/?)${tag}\\b[^>]*?(/?)>`, 'gi');
    re.lastIndex = from;
    let depth = 1;
    for (let m = re.exec(xslt); m; m = re.exec(xslt)) {
        if (m[2]) continue;
        depth += m[1] ? -1 : 1;
        if (!depth) return m.index + m[0].length;
    }
    return -1;
};

/** XML'e bağlı olmayan, IBAN'ı doğrudan şablona yazılmış banka kutuları ("banks" sınıflı bloklar). */
const staticBankBoxes = (xslt: string) => {
    const boxes: Array<[number, number]> = [];
    for (const m of xslt.matchAll(BANK_BOX_RE)) {
        const start = m.index ?? 0;
        if (boxes.some(([s, e]) => start >= s && start < e)) continue;
        const end = closingEnd(xslt, m[1], start + m[0].length);
        if (end < 0) continue;
        const body = xslt.slice(start, end);
        if (/IBAN/i.test(body) && !body.includes('cac:PayeeFinancialAccount')) boxes.push([start, end]);
    }
    return boxes;
};

export const hasStaticBank = (xslt: string) => staticBankBoxes(xslt).length > 0;

const hideBank = (xslt: string) => {
    let out = hideBankPaths(xslt);
    for (const [s, e] of staticBankBoxes(out).reverse()) out = out.slice(0, s) + out.slice(e);
    return out;
};

export const personalizeXslt = (xslt: string, p: TemplatePrefs) => {
    let out = xslt;
    if (p.logo.mode === 'custom') out = replaceLogo(out, p.logo);
    else if (p.logo.mode === 'none') out = removeLogo(out);
    if (p.bank === 'no') out = hideBank(out);
    return out;
};
