/**
 * ERP ve entegratör ekranlarının çoğu XSLT çıktısını gömülü Internet Explorer
 * (WebBrowser / MSHTML) ile gösterir. Bu kontrol, sayfa aksini söylemedikçe IE7
 * belge modunda çalışır: flex, CSS değişkenleri ve document.currentScript yoktur,
 * tasarım alt alta dökülür ve karekod çizilmez. İndirilen kopyaya:
 *  - IE'yi en yeni motoruna (IE11) geçiren X-UA-Compatible etiketi,
 *  - yalnızca IE10/11'de etkin bir blokta flex `gap`, `var(--x)` ve
 *    `writing-mode` karşılıkları,
 *  - karekod betiğine currentScript yedeği
 * eklenir. Modern tarayıcılarda görünüm değişmez. Blok işaretlidir; tekrar
 * uygulandığında eskisi silinip yeniden üretilir.
 */

const UA_META = '<meta http-equiv="X-UA-Compatible" content="IE=edge"/>';
const BLOCK_START = '/* edx-ie-uyum */';
const BLOCK_END = '/* /edx-ie-uyum */';
const BLOCK_RE = /\/\* edx-ie-uyum \*\/[\s\S]*?\/\* \/edx-ie-uyum \*\//g;
const IE_ONLY = '@media all and (-ms-high-contrast:none),(-ms-high-contrast:active)';

export const QR_SCRIPT_LOOKUP = "var s=document.currentScript||(function(a){return a[a.length-1];})(document.getElementsByTagName('script')),b=s&&s.parentNode;";
// IE, betik çalışırken kutunun genişliğini henüz 0 bildirir; satır içi genişliğe düşülür.
export const QR_SCRIPT_WIDTH = 'var w=b.clientWidth||parseInt(b.style.width,10)||120;';
const QR_SCRIPT_PATCHES: [string, string][] = [
    ['var s=document.currentScript,b=s&&s.parentNode;', QR_SCRIPT_LOOKUP],
    ['var w=b.clientWidth||120;', QR_SCRIPT_WIDTH],
];

const HEAD_OPEN_RE = /<head(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?>/i;
const HTML_OPEN_RE = /<html(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?>/i;
const STYLE_RE = /(<style(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?>)([\s\S]*?)(<\/style>)/gi;
const RULE_RE = /([^{}]*)\{([^{}]*)\}/g;

const decodeXml = (s: string) => s.replace(
    /&(?:#x([0-9a-f]+)|#(\d+)|(lt|gt|amp|quot|apos));/gi,
    (_all, hex, dec, name: string) => hex ? String.fromCodePoint(parseInt(hex, 16))
        : dec ? String.fromCodePoint(Number(dec))
        : ({ lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" } as Record<string, string>)[name.toLowerCase()],
);
const encodeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

interface Rule { selector: string; decls: Map<string, string> }

/** Noktalı virgülü parantez ve tırnak içinde bölmeden bildirimlere ayırır. */
function parseDecls(body: string): Map<string, string> {
    const decls = new Map<string, string>();
    let depth = 0, quote = '', start = 0;
    const push = (end: number) => {
        const part = body.slice(start, end);
        const colon = part.indexOf(':');
        if (colon > 0) decls.set(part.slice(0, colon).trim().toLowerCase(), part.slice(colon + 1).trim());
        start = end + 1;
    };
    for (let i = 0; i < body.length; i++) {
        const c = body[i];
        if (quote) { if (c === quote) quote = ''; continue; }
        if (c === '"' || c === "'") quote = c;
        else if (c === '(') depth++;
        else if (c === ')') depth = Math.max(0, depth - 1);
        else if (c === ';' && depth === 0) push(i);
    }
    push(body.length);
    return decls;
}

/** Stil metnindeki kurallar; XSLT işaretlemesi içeren kurallar atlanır. */
function parseRules(css: string): Rule[] {
    const clean = css
        .replace(BLOCK_RE, '')
        .replace(/<!\[CDATA\[|\]\]>|<\/?xsl:text\b[^>]*>/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');
    const rules: Rule[] = [];
    for (const m of clean.matchAll(RULE_RE)) {
        if (m[1].includes('<') || m[2].includes('<')) continue;
        const selector = decodeXml(m[1]).replace(/\s+/g, ' ').trim();
        if (!selector || selector.startsWith('@')) continue;
        rules.push({ selector, decls: parseDecls(decodeXml(m[2])) });
    }
    return rules;
}

const VAR_RE = /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/;

function resolveVars(value: string, defs: Map<string, string>, depth = 0): string | null {
    let out = value;
    for (let m = out.match(VAR_RE); m; m = out.match(VAR_RE)) {
        if (depth > 8) return null;
        const def = defs.get(m[1]) ?? m[2]?.trim();
        if (!def) return null;
        const resolved = resolveVars(def, defs, depth + 1);
        if (resolved === null) return null;
        out = out.slice(0, m.index) + resolved + out.slice(m.index! + m[0].length);
    }
    return out;
}

const splitSelectors = (selector: string) => selector.split(',').map(s => s.trim()).filter(Boolean);
const childSelector = (selector: string, rest: string) => splitSelectors(selector).map(s => `${s} > ${rest}`).join(',');

/** `margin` kısaltmasından üst / sol değer. */
function marginSide(decls: Map<string, string>, side: 'top' | 'left'): string | undefined {
    const own = decls.get(`margin-${side}`);
    if (own) return own;
    const parts = decls.get('margin')?.replace(/!important/i, '').trim().split(/\s+/);
    if (!parts) return undefined;
    return side === 'top' ? parts[0] : parts[3] ?? parts[1] ?? parts[0];
}

/** IE10/11'de eksik kalan özelliklerin karşılıkları (yalnızca IE'de etkin blok). */
function buildIeCompatCss(css: string): string {
    const rules = parseRules(css);
    const out: string[] = [];

    const defs = new Map<string, string>();
    for (const r of rules) {
        for (const [prop, value] of r.decls) {
            if (prop.startsWith('--') && !defs.has(prop)) defs.set(prop, value);
        }
    }
    for (const r of rules) {
        const fixed: string[] = [];
        for (const [prop, value] of r.decls) {
            if (prop.startsWith('--') || !value.includes('var(')) continue;
            const resolved = resolveVars(value, defs);
            if (resolved !== null) fixed.push(`${prop}:${resolved}`);
        }
        const mode = r.decls.get('writing-mode')?.replace(/!important/i, '').trim();
        const ieMode = mode === 'vertical-rl' ? 'tb-rl' : mode === 'vertical-lr' ? 'tb-lr' : null;
        if (ieMode) fixed.push(`-ms-writing-mode:${ieMode}`, `writing-mode:${ieMode}`);
        // Tek parça uzun kodlar (ETTN, IBAN): IE tireden kırmaz, tabloyu genişletir.
        if (/monospace/i.test(r.decls.get('font-family') ?? '')) fixed.push('word-break:break-all');
        if (fixed.length) out.push(`${r.selector}{${fixed.join(';')}}`);
    }

    const bySelector = new Map<string, Map<string, string>>();
    for (const r of rules) {
        const merged = bySelector.get(r.selector) ?? new Map<string, string>();
        for (const [prop, value] of r.decls) merged.set(prop, value);
        bySelector.set(r.selector, merged);
    }
    const isFlex = (decls: Map<string, string>) => /^(inline-)?flex\b/.test(decls.get('display') ?? '');
    /** `.L-fis .dip` gibi varyantlar, display / gap'i temel `.dip` kuralından alır. */
    const baseOf = (selector: string) => {
        if (selector.includes(',')) return undefined;
        const last = selector.split(/[\s>+~]+/).pop();
        return last && last !== selector ? bySelector.get(last) : undefined;
    };
    const effective = (selector: string, decls: Map<string, string>) => new Map([...(baseOf(selector) ?? []), ...decls]);
    const gapOf = (decls: Map<string, string>, column: boolean) => {
        const [rowGap, colGap = rowGap] = (decls.get('gap') ?? '').replace(/!important/i, '').trim().split(/\s+/);
        const size = resolveVars(column ? decls.get('row-gap') ?? rowGap ?? '' : decls.get('column-gap') ?? colGap ?? '', defs);
        return size && !/^0(px)?$/.test(size) ? size : null;
    };

    const directionOf = (decls: Map<string, string>) => decls.get('flex-direction') ?? 'row';
    const gapSide = (direction: string) => direction.startsWith('column')
        ? (direction.endsWith('reverse') ? 'bottom' : 'top')
        : (direction.endsWith('reverse') ? 'right' : 'left');

    // Flex gap: IE11 flex'i bilir ama gap'i bilmez; ardışık çocuklara kenar boşluğu verilir.
    const gapRules: string[] = [];
    for (const [selector, own] of bySelector) {
        const decls = effective(selector, own);
        if (!isFlex(decls)) continue;
        const direction = directionOf(decls);
        const column = direction.startsWith('column');
        // IE11 dikey flex'te flex:1 (taban 0) öğenin yüksekliğini sıfırlar.
        if (column) gapRules.push(`${childSelector(selector, '*')}{flex-basis:auto}`);
        const size = gapOf(decls, column);
        if (!size) continue;
        const side = gapSide(direction);
        // Varyant yönü değiştiriyorsa temel kuralın verdiği boşluk geri alınır.
        const base = baseOf(selector);
        const baseSide = base && isFlex(base) && gapOf(base, directionOf(base).startsWith('column')) ? gapSide(directionOf(base)) : side;
        const reset = baseSide !== side ? `;margin-${baseSide}:0` : '';
        gapRules.push(`${childSelector(selector, '* + *')}{margin-${side}:${size}${reset}}`);
    }
    if (gapRules.length) {
        out.push(...gapRules);
        // margin-*:auto ile sağa / alta itilen öğeler gap kuralına ezilmesin.
        for (const r of rules) {
            const fixed: string[] = [];
            if (marginSide(r.decls, 'left') === 'auto') fixed.push('margin-left:auto');
            if (marginSide(r.decls, 'top') === 'auto') fixed.push('margin-top:auto');
            if (fixed.length) out.push(`${r.selector}{${fixed.join(';')}}`);
        }
    }

    // IE11 flex öğelerini içeriğinden dar sıkıştırır (min-width:auto yok). Sabit
    // genişlikli, dikey yazılı ya da kendisi flex olan öğeler sıkışmaz; flex'i
    // açıkça verilmiş öğeler kendi değerini korur.
    if ([...bySelector.values()].some(isFlex)) {
        for (const [selector, decls] of bySelector) {
            // IE, esnek tabloyu en geniş içeriğinde tutar; küçük genişlikle flex onu kalan alana yayar.
            const flex = (decls.get('flex-grow') ?? decls.get('flex') ?? '').trim();
            const grows = flex.startsWith('auto') || parseFloat(flex) > 0;
            if (grows && splitSelectors(selector).every(s => /(^|[\s>+~])table([.#:[]|$)/.test(s))) out.push(`${selector}{width:1px}`);
            if (decls.has('flex') || decls.has('flex-shrink')) continue;
            const width = decls.get('width') ?? decls.get('min-width') ?? '';
            const rigid = /^[\d.]+(px|mm|cm|pt|in|em|rem)\b/.test(width)
                || /^vertical-/.test(decls.get('writing-mode') ?? '')
                || isFlex(decls);
            if (rigid) out.push(`${selector}{flex-shrink:0}`);
        }
    }

    return out.length ? `${IE_ONLY}{${out.join('')}}` : '';
}

export function applyLegacyViewerCompat(xslt: string): string {
    let out = xslt.replace(BLOCK_RE, '');

    if (!/X-UA-Compatible/i.test(out)) {
        const head = out.match(HEAD_OPEN_RE);
        const html = head ? null : out.match(HTML_OPEN_RE);
        const at = head ?? html;
        if (at?.index !== undefined) {
            const end = at.index + at[0].length;
            out = out.slice(0, end) + (head ? UA_META : `<head>${UA_META}</head>`) + out.slice(end);
        }
    }

    out = out.replace(STYLE_RE, (all, open: string, css: string, close: string) => {
        const compat = buildIeCompatCss(css);
        return compat ? `${open}${css}${BLOCK_START}${encodeXml(compat)}${BLOCK_END}${close}` : all;
    });

    return QR_SCRIPT_PATCHES.reduce((s, [from, to]) => s.split(from).join(to), out);
}
