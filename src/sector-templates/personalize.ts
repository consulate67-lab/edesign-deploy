import { readImageFile } from '../xslt-editor/utils/imageFile';

/** Hazır şablon sorularının yanıtları: logo ve banka bilgisi tercihleri (şablona uygulanır). */
export type LogoChoice =
    | { mode: 'sample' }
    | { mode: 'none' }
    | { mode: 'custom'; dataUrl: string; width: number; height: number; name: string };

export type BankChoice = 'yes' | 'no' | 'any';

/** Kullanıcının yazdığı banka hesabı; şablonun banka bölümüne sabit metin olarak işlenir. */
export interface BankAccount {
    bank: string;
    branch: string;
    iban: string;
    currency: string;
    holder: string;
}

export interface TemplatePrefs {
    logo: LogoChoice;
    bank: BankChoice;
    /** bank 'yes' iken doluysa XML'deki hesaplar yerine bunlar basılır. */
    accounts?: BankAccount[];
}

export const DEFAULT_PREFS: TemplatePrefs = { logo: { mode: 'sample' }, bank: 'any' };

export const EMPTY_ACCOUNT: BankAccount = { bank: '', branch: '', iban: '', currency: 'TRY', holder: '' };

export const normalizeIban = (v: string) => v.replace(/[^0-9a-z]/gi, '').toUpperCase();
export const formatIban = (v: string) => normalizeIban(v).replace(/(.{4})(?=.)/g, '$1 ');

/** ISO 13616 mod-97 denetimi; TR IBAN'ı 26 karakterdir. */
export const isValidIban = (v: string) => {
    const iban = normalizeIban(v);
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban) || (iban.startsWith('TR') && iban.length !== 26)) return false;
    const digits = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, c => String(c.charCodeAt(0) - 55));
    let rem = 0;
    for (const d of digits) rem = (rem * 10 + Number(d)) % 97;
    return rem === 1;
};

/** Yalnız IBAN'ı geçerli hesaplar (boş satırlar atlanır). */
export const usableAccounts = (p: TemplatePrefs) =>
    p.bank === 'yes' ? (p.accounts ?? []).filter(a => isValidIban(a.iban)) : [];

const PREFS_KEY = 'tpl_prefs';
const LOGO_MAX_SIDE = 480;

export const loadPrefs = (): TemplatePrefs => {
    try {
        const p = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null');
        if (p && typeof p === 'object' && p.logo?.mode && ['yes', 'no', 'any'].includes(p.bank)) {
            return { ...p, accounts: Array.isArray(p.accounts) ? p.accounts.map((a: Partial<BankAccount>) => ({ ...EMPTY_ACCOUNT, ...a })) : undefined };
        }
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
export const prefsKey = (p: TemplatePrefs) => {
    const accounts = usableAccounts(p);
    const bank = p.bank === 'no' ? 'nobank' : accounts.length ? `bank:${hash(JSON.stringify(accounts))}` : 'bank';
    return `${bank}|${p.logo.mode === 'custom' ? hash(p.logo.dataUrl) : p.logo.mode}`;
};

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

/* ------------------------------------------------------------ banka hesaplarını şablona yazma */

const PFA = 'cac:PayeeFinancialAccount';
type Ctx = 'account' | 'means';
type BankField = 'iban' | 'note' | 'currency' | 'holder' | 'bank' | 'branch' | 'swift' | 'institution';

const FIELD_PATHS: Array<[RegExp, BankField]> = [
    [/^cac:FinancialInstitutionBranch\/cac:FinancialInstitution\/cbc:Name$/, 'bank'],
    [/^cac:FinancialInstitutionBranch\/cbc:Name$/, 'branch'],
    [/^cac:FinancialInstitutionBranch(\/cac:FinancialInstitution)?\/cbc:ID$/, 'swift'],
    [/^cac:FinancialInstitutionBranch(\/cac:FinancialInstitution)?$/, 'institution'],
    [/^cbc:ID$/, 'iban'],
    [/^cbc:PaymentNote$/, 'note'],
    [/^cbc:CurrencyCode$/, 'currency'],
    [/^cbc:Name$/, 'holder'],
];

interface BankRow { account: BankAccount; ibanRaw: boolean; noteWithHolder: boolean; ibanWithNote: boolean }

const noteOf = (a: BankAccount, withHolder: boolean) =>
    [a.bank, a.branch, withHolder ? a.holder : ''].map(s => s.trim()).filter(Boolean).join(' · ');

const fieldValue = (f: BankField, { account: a, ibanRaw, noteWithHolder, ibanWithNote }: BankRow): string => {
    switch (f) {
        case 'iban': {
            if (ibanRaw) return normalizeIban(a.iban);
            const note = ibanWithNote ? noteOf(a, true) : '';
            return note ? `${note} · ${formatIban(a.iban)}` : formatIban(a.iban);
        }
        case 'note': return noteOf(a, noteWithHolder);
        case 'currency': return a.currency.trim();
        case 'holder': return a.holder.trim();
        case 'bank': return a.bank.trim();
        case 'branch': return a.branch.trim();
        case 'institution': return a.bank.trim() || a.branch.trim() ? '1' : '';
        default: return '';
    }
};

const pathField = (path: string, ctx: Ctx): BankField | null => {
    let p = path.trim().replace(/^\.\//, '');
    if (ctx === 'means') {
        if (!p.startsWith(`${PFA}/`) && p !== PFA) return null;
        p = p === PFA ? '' : p.slice(PFA.length + 1);
    }
    if (p === '' || p === '.') return 'iban';
    return FIELD_PATHS.find(([re]) => re.test(p))?.[1] ?? null;
};

/** Hesap alanına dayanan XPath ifadesinin değeri; tanınmayan ifadede null. */
const evalExpr = (e: string, ctx: Ctx, row: BankRow): string | null => {
    const x = e.trim();
    let m = x.match(/^(normalize-space|string)\((.*)\)$/);
    if (m) {
        const v = evalExpr(m[2], ctx, row);
        return v === null ? null : m[1] === 'string' ? v : v.trim().replace(/\s+/g, ' ');
    }
    m = x.match(/^substring\((.+?),\s*(\d+)\s*(?:,\s*(\d+)\s*)?\)$/);
    if (m) {
        const v = evalExpr(m[1], ctx, row);
        if (v === null) return null;
        const from = Math.max(0, Number(m[2]) - 1);
        return m[3] ? v.substr(from, Number(m[3])) : v.slice(from);
    }
    const f = pathField(x, ctx);
    return f ? fieldValue(f, row) : null;
};

/** Hesap alanına dayanan koşulun sonucu (alan dolu mu); tanınmayan koşulda null. */
const evalTest = (e: string, ctx: Ctx, row: BankRow): boolean | null => {
    const x = e.trim();
    let m = x.match(/^not\((.*)\)$/);
    if (m) {
        const r = evalTest(m[1], ctx, row);
        return r === null ? null : !r;
    }
    m = x.match(/^(.+?)\s*!=\s*'(0|)'$/) ?? x.match(/^string-length\((.+)\)\s*>\s*0$/);
    const v = evalExpr(m ? m[1] : x, ctx, row);
    return v === null ? null : v !== '';
};

const escText = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const xpathLiteral = (v: string) => (v.includes("'") ? `&quot;${escAttr(v.replace(/"/g, ''))}&quot;` : `'${escAttr(v)}'`);

const tagBounds = (s: string, tag: string, start: number, openLen: number) => {
    const end = closingEnd(s, tag, start + openLen);
    return end < 0 ? null : { innerStart: start + openLen, innerEnd: s.lastIndexOf(`</${tag}`, end - 1), end };
};

/** Banka döngüsünün gövdesini bir hesap için sabit içeriğe çevirir. */
const renderBody = (body: string, ctx: Ctx, row: BankRow): string => {
    let s = body;
    if (ctx === 'means') {
        const inner = /<xsl:for-each\s+select="cac:PayeeFinancialAccount"\s*>/;
        for (let m = inner.exec(s); m; m = inner.exec(s)) {
            const b = tagBounds(s, 'xsl:for-each', m.index, m[0].length);
            if (!b) break;
            s = s.slice(0, m.index) + renderBody(s.slice(b.innerStart, b.innerEnd), 'account', row) + s.slice(b.end);
        }
    }
    const ifRe = /<xsl:if\s+test="([^"]*)"\s*>/g;
    for (let m = ifRe.exec(s); m; m = ifRe.exec(s)) {
        const r = evalTest(m[1].replace(/&apos;/g, "'"), ctx, row);
        const b = r === null ? null : tagBounds(s, 'xsl:if', m.index, m[0].length);
        if (!b) continue;
        s = s.slice(0, m.index) + (r ? s.slice(b.innerStart, b.innerEnd) : '') + s.slice(b.end);
        ifRe.lastIndex = m.index;
    }
    s = s.replace(/<xsl:when\s+test="([^"]*)"\s*>/g, (tag, test: string) => {
        const r = evalTest(test.replace(/&apos;/g, "'"), ctx, row);
        return r === null ? tag : `<xsl:when test="${r ? 'true()' : 'false()'}">`;
    });
    s = s.replace(/<xsl:with-param\s+name="([^"]*)"\s+select="([^"]*)"\s*\/>/g, (tag, name: string, sel: string) => {
        const v = evalExpr(sel, ctx, { ...row, ibanRaw: true });
        return v === null ? tag : `<xsl:with-param name="${name}" select="${xpathLiteral(v)}"/>`;
    });
    s = s.replace(/<xsl:value-of\s+select="([^"]*)"\s*\/>/g, (tag, sel: string) => {
        const v = evalExpr(sel, ctx, row);
        if (v !== null) return v ? `<xsl:text>${escText(v)}</xsl:text>` : '';
        return sel.includes(PFA) ? '' : tag;
    });
    return s;
};

interface OpenTag { name: string; start: number; tag: string }

/** pos noktasını saran XSLT etiketleri (dıştan içe). */
const enclosingTags = (s: string, pos: number): OpenTag[] => {
    const re = /<(\/?)(xsl:(?:for-each|if|when|choose|otherwise))\b[^>]*?(\/?)>/g;
    const stack: OpenTag[] = [];
    for (let m = re.exec(s); m && m.index < pos; m = re.exec(s)) {
        if (m[3]) continue;
        if (m[1]) {
            const i = stack.map(t => t.name).lastIndexOf(m[2]);
            if (i >= 0) stack.length = i;
        } else stack.push({ name: m[2], start: m.index, tag: m[0] });
    }
    return stack;
};

const LOOP_RE = /<xsl:for-each\s+select="([^"]*)"\s*>/g;

interface BankLoop { start: number; end: number; body: string; ctx: Ctx }

const nextBankLoop = (s: string): BankLoop | null => {
    for (const m of s.matchAll(LOOP_RE)) {
        const sel = m[1];
        const b = tagBounds(s, 'xsl:for-each', m.index ?? 0, m[0].length);
        if (!b) continue;
        const body = s.slice(b.innerStart, b.innerEnd);
        if (sel.includes(PFA)) return { start: m.index ?? 0, end: b.end, body, ctx: /PayeeFinancialAccount\s*$/.test(sel) ? 'account' : 'means' };
        if (/PaymentMeans\s*$/.test(sel) && body.includes(PFA) && !/<xsl:for-each\s+select="[^"]*PayeeFinancialAccount/.test(body)) {
            return { start: m.index ?? 0, end: b.end, body, ctx: 'means' };
        }
    }
    return null;
};

/** Ödeme bölümünü XML'de ödeme bilgisi yokken de gösterir. */
const openGuards = (s: string, pos: number) => {
    let out = s;
    for (const t of enclosingTags(s, pos).reverse()) {
        if ((t.name === 'xsl:if' || t.name === 'xsl:when') && /PaymentMeans|PayeeFinancialAccount/.test(t.tag)) {
            const open = t.tag.replace(/\btest="[^"]*"/, 'test="true()"');
            out = out.slice(0, t.start) + open + out.slice(t.start + t.tag.length);
        }
    }
    return out;
};

const staticBankHtml = (accounts: BankAccount[]) => `<div style="font-weight:700;margin-bottom:4px"><xsl:text>Banka Bilgileri</xsl:text></div>${accounts.map(a => {
    const note = [a.bank, a.branch, a.holder].map(s => s.trim()).filter(Boolean).join(' · ');
    return `<div style="margin:2px 0">${note ? `<xsl:text>${escText(note)}</xsl:text><br/>` : ''}<b><xsl:text>${escText(`IBAN ${formatIban(a.iban)}${a.currency ? ` (${a.currency})` : ''}`)}</xsl:text></b></div>`;
}).join('')}`;

/**
 * Kullanıcının banka hesaplarını şablonun kendi banka düzenine sabit metin olarak yazar:
 * cac:PayeeFinancialAccount döngüleri her hesap için açılır, XML'e bağlı koşullar kalkar.
 * Böylece ERP XML'inde ödeme bilgisi olmasa da hesaplar basılır.
 */
export const writeBankAccounts = (xslt: string, accounts: BankAccount[]) => {
    if (!accounts.length) return xslt;
    let out = xslt;
    for (let guard = 0; guard < 40; guard++) {
        const loop = nextBankLoop(out);
        if (!loop) break;
        const noteWithHolder = !/select="(cac:PayeeFinancialAccount\/)?cbc:Name"/.test(loop.body);
        const ibanWithNote = !/PaymentNote|FinancialInstitution/.test(loop.body);
        const html = accounts.map(account => renderBody(loop.body, loop.ctx, { account, ibanRaw: false, noteWithHolder, ibanWithNote })).join('');
        const outer = loop.ctx === 'account' ? enclosingTags(out, loop.start).filter(t => t.name === 'xsl:for-each').pop() : undefined;
        const outerSel = outer?.tag.match(/select="([^"]*)"/)?.[1] ?? '';
        if (outer && /PaymentMeans/.test(outerSel) && !outerSel.includes(PFA)) {
            const ob = tagBounds(out, 'xsl:for-each', outer.start, outer.tag.length);
            if (ob) {
                out = out.slice(0, loop.start) + out.slice(loop.end);
                const at = ob.end - (loop.end - loop.start);
                out = out.slice(0, at) + html + out.slice(at);
                out = openGuards(out, at);
                continue;
            }
        }
        out = out.slice(0, loop.start) + html + out.slice(loop.end);
        out = openGuards(out, loop.start);
    }
    out = out.replace(/\b(test)="([^"]*)"/g, (m, name: string, v: string) => (v.includes(PFA) ? `${name}="true()"` : m));
    out = out.replace(/<xsl:value-of\s+select="[^"]*PayeeFinancialAccount[^"]*"\s*\/>/g, '');
    const boxes = staticBankBoxes(out);
    for (const [i, [s, e]] of [...boxes.entries()].reverse()) {
        if (i > 0) {
            out = out.slice(0, s) + out.slice(e);
            continue;
        }
        const open = out.slice(s, e).match(/^<[^>]+>/)?.[0] ?? '<div>';
        const tag = open.match(/^<(\w+)/)?.[1] ?? 'div';
        out = out.slice(0, s) + open + staticBankHtml(accounts) + `</${tag}>` + out.slice(e);
    }
    return out;
};

export const personalizeXslt = (xslt: string, p: TemplatePrefs) => {
    let out = xslt;
    if (p.logo.mode === 'custom') out = replaceLogo(out, p.logo);
    else if (p.logo.mode === 'none') out = removeLogo(out);
    if (p.bank === 'no') out = hideBank(out);
    else {
        const accounts = usableAccounts(p);
        if (accounts.length) out = writeBankAccounts(out, accounts);
    }
    return out;
};
