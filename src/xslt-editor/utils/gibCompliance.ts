/**
 * İndirilen XSLT'yi e-belge yükleme kurallarına göre hazırlar ve denetler:
 * - Dosya boyutu genellikle 150 KB altında olmalı.
 * - Dışarıdan kaynak (resim URL'si, betik, stil dosyası) yüklenmemeli.
 * - Tablo kolon oranları toplamı %100'ü aşmamalı, sayfa dar ekranda taşmamalı.
 */
import {
    XML_TAG_RE_SOURCE, findLiteralTagByOrdinal, setTagAttribute, setTagStyleProperty,
} from './xsltStyleEdit';

export const GIB_SIZE_LIMIT = 150 * 1024;

export const byteLength = (s: string) => new TextEncoder().encode(s).length;

/**
 * İki eleman etiketi arasındaki yalnız boşluktan oluşan girintiyi tek satır
 * sonuna indirir. XSLT 1.0 bu düğümleri zaten stil sayfasından atar (xsl:text
 * ve xml:space="preserve" hariç), bu yüzden çıktı değişmez. CDATA / yorum
 * bitişiğindeki boşluk komşu metnin parçası olabileceğinden dokunulmaz.
 */
export function compactXslt(xslt: string): string {
    if (/\sxml:space\s*=\s*["']preserve/.test(xslt)) return xslt;
    const nl = xslt.includes('\r\n') ? '\r\n' : '\n';
    const re = new RegExp(XML_TAG_RE_SOURCE, 'g');
    let out = '';
    let last = 0;
    let prevIsTag = false;
    let inText = false;
    for (let m: RegExpExecArray | null; (m = re.exec(xslt));) {
        const isTag = !!m[2];
        const gap = xslt.slice(last, m.index);
        out += prevIsTag && isTag && !inText && gap.includes('\n') && /^[ \t\r\n]+$/.test(gap) ? nl : gap;
        out += m[0];
        last = m.index + m[0].length;
        prevIsTag = isTag;
        if (m[2] === 'xsl:text') inText = m[1] !== '/' && m[4] !== '/';
    }
    return out + xslt.slice(last);
}

const RESOURCE_TAG_RE = /<(img|script|link|iframe|frame|embed|object|source|audio|video|input|image|use)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
const RESOURCE_ATTR_RE = /\s(?:src|href|data|xlink:href|background)\s*=\s*(["'])([\s\S]*?)\1/gi;
const CSS_URL_RE = /url\(\s*(?:&quot;|&apos;|["'])?\s*((?:https?:)?\/\/[^"')\s&]+)/gi;
const CSS_IMPORT_RE = /@import\s+(?:url\(\s*)?(?:&quot;|&apos;|["'])?([^"');\s&]+)/gi;
const XSL_SRC_RE = /<xsl:attribute\s+name\s*=\s*["']src["']\s*>\s*((?:https?:)?\/\/[^<\s]+)/gi;

const isEmbedded = (v: string) => {
    const s = v.trim();
    return !s || s.startsWith('#') || /^data:/i.test(s) || s.includes('{') || /^(?:javascript|about):/i.test(s);
};

/** Belge açılırken dışarıdan yüklenecek kaynaklar (resim, betik, stil, yazı tipi). */
export function findExternalLinks(xslt: string): string[] {
    const found = new Set<string>();
    const add = (v: string) => found.add(v.trim().slice(0, 120));
    for (const m of xslt.matchAll(RESOURCE_TAG_RE)) {
        for (const a of m[2].matchAll(RESOURCE_ATTR_RE)) {
            if (!isEmbedded(a[2])) add(a[2]);
        }
    }
    for (const m of xslt.matchAll(CSS_URL_RE)) add(m[1]);
    for (const m of xslt.matchAll(CSS_IMPORT_RE)) add(m[1]);
    for (const m of xslt.matchAll(XSL_SRC_RE)) add(m[1]);
    return [...found];
}

// Eski onaylı dosyalardaki çevrimiçi lisans mührü (shared/license-lock.js → buildSeal):
// belge her açıldığında dış adrese istek attığı için indirmede çıkarılır. Çevrimdışı
// VKN kilidi mühürden bağımsızdır.
const ONLINE_SEAL_RE = new RegExp(
    '<([\\w.-]+):element name="style"><\\1:attribute name="type">text/css</\\1:attribute>'
    + '<\\1:text>@media print\\{\\.(x[a-z]{7})\\{position:fixed!important\\}\\}</\\1:text></\\1:element>'
    + '<\\1:element name="div"><\\1:attribute name="class">\\2</\\1:attribute>'
    + '<\\1:attribute name="style"><\\1:value-of select="concat\\([^"]*?url\\([^"]*"/></\\1:attribute></\\1:element>',
    'g',
);

export const stripOnlineSeal = (xslt: string) => xslt.replace(ONLINE_SEAL_RE, '');

const VIEWPORT_META = '<meta name="viewport" content="width=device-width, initial-scale=1"/>';

/** Mobil tarayıcıların sayfayı masaüstü genişliğinde küçültmemesi için viewport bildirimi. */
export function ensureViewportMeta(xslt: string): string {
    if (/<meta\b[^>]*\bname\s*=\s*["']viewport["']/i.test(xslt)) return xslt;
    const head = xslt.match(/<head\b(?:[^>"']|"[^"]*"|'[^']*')*?(?<!\/)>/i);
    if (head?.index === undefined) return xslt;
    const at = head.index + head[0].length;
    return xslt.slice(0, at) + VIEWPORT_META + xslt.slice(at);
}

interface LayoutFix {
    ordinal: number;
    tag: string;
    via: 'attr' | 'style';
    prop: string;
    value: string;
}

export interface LayoutResult {
    xslt: string;
    /** Kolon oranları %100'e indirilen satırlar. */
    rows: number;
    /** Sabit genişliğine max-width:100% eklenen sayfa / tablo kutuları. */
    responsive: number;
}

const PCT_RE = /^\s*(\d+(?:\.\d+)?)\s*%\s*$/;
const FIXED_CSS_RE = /^\s*\d+(?:\.\d+)?(?:px|mm|cm|pt|pc|in)\s*$/i;
const FIXED_ATTR_RE = /^\s*\d+(?:\.\d+)?(?:px)?\s*$/i;
const BOX_TAGS = new Set(['body', 'div', 'table', 'section', 'article', 'main', 'form', 'center']);
const MIN_BOX_WIDTH = 400;

const ordinalOf = (el: Element) => {
    const v = el.getAttribute('data-xsrc');
    return v === null ? null : Number(v);
};

function percentWidth(el: HTMLElement): { value: number; via: 'attr' | 'style' } | null {
    const inline = el.style.width;
    if (inline) {
        const m = inline.match(PCT_RE);
        return m ? { value: Number(m[1]), via: 'style' } : null;
    }
    const m = el.getAttribute('width')?.match(PCT_RE);
    return m ? { value: Number(m[1]), via: 'attr' } : null;
}

/** Yüzdeli kolonları toplamı %100'ü aşan satırları orantılı olarak %100'e indirir. */
function balanceColumns(doc: Document, fixes: LayoutFix[]): number {
    const done = new Set<number>();
    let rows = 0;
    const groups: HTMLElement[][] = [
        ...Array.from(doc.querySelectorAll('tr')).map(tr => Array.from((tr as HTMLTableRowElement).cells)),
        ...Array.from(doc.querySelectorAll('colgroup')).map(g => Array.from(g.querySelectorAll('col'))),
    ];
    for (const cells of groups) {
        if (cells.length < 2) continue;
        const widths = cells.map(percentWidth);
        const ords = cells.map(ordinalOf);
        if (widths.some(w => !w) || ords.some(o => o === null || done.has(o))) continue;
        const sum = widths.reduce((a, w) => a + w!.value, 0);
        if (sum <= 100.5) continue;
        let acc = 0;
        cells.forEach((c, i) => {
            const v = i === cells.length - 1
                ? Math.round((100 - acc) * 100) / 100
                : Math.round((widths[i]!.value * 100 / sum) * 100) / 100;
            acc += v;
            done.add(ords[i]!);
            fixes.push({ ordinal: ords[i]!, tag: c.tagName.toLowerCase(), via: widths[i]!.via, prop: 'width', value: `${v}%` });
        });
        rows++;
    }
    return rows;
}

function sheetWidthRules(doc: Document): { selector: string; width: string }[] {
    const rules: { selector: string; width: string }[] = [];
    for (const sheet of Array.from(doc.styleSheets)) {
        let list: CSSRuleList;
        try {
            list = sheet.cssRules;
        } catch {
            continue;
        }
        for (const r of Array.from(list)) {
            const rule = r as CSSStyleRule;
            if (typeof rule.selectorText === 'string' && rule.style?.width) rules.push({ selector: rule.selectorText, width: rule.style.width });
        }
    }
    return rules;
}

function hasFixedWidth(el: HTMLElement, rules: { selector: string; width: string }[]): boolean {
    if (el.style.width) return FIXED_CSS_RE.test(el.style.width);
    const attr = el.getAttribute('width');
    if (attr !== null) return FIXED_ATTR_RE.test(attr);
    let fixed = false;
    for (const r of rules) {
        try {
            if (el.matches(r.selector)) fixed = FIXED_CSS_RE.test(r.width);
        } catch {
            // Tarayıcının tanımadığı seçici.
        }
    }
    return fixed;
}

/**
 * Sabit genişlikli dış sayfa / tablo kutusuna max-width:100% ekler: masaüstünde
 * ve baskıda genişlik aynı kalır, dar ekranda yatay taşma olmaz.
 */
function makeResponsive(doc: Document, fixes: LayoutFix[]): number {
    const win = doc.defaultView;
    const body = doc.body;
    if (!win || !body) return 0;
    const rules = sheetWidthRules(doc);
    let count = 0;
    const visit = (el: HTMLElement, depth: number) => {
        const tag = el.tagName.toLowerCase();
        const ord = ordinalOf(el);
        const cs = win.getComputedStyle(el);
        if (!BOX_TAGS.has(tag) || el.hasAttribute('data-xslt-obj') || cs.position === 'absolute' || cs.position === 'fixed') return;
        if (ord !== null && cs.maxWidth === 'none' && el.getBoundingClientRect().width >= MIN_BOX_WIDTH && hasFixedWidth(el, rules)) {
            fixes.push({ ordinal: ord, tag, via: 'style', prop: 'max-width', value: '100%' });
            count++;
            return;
        }
        if (depth >= 4) return;
        for (const c of Array.from(el.children)) visit(c as HTMLElement, depth + 1);
    };
    visit(body, 0);
    return count;
}

/**
 * Önizleme belgesine bakarak kolon oranlarını ve sayfa genişliğini düzeltir.
 * `xslt`, önizlemenin data-xsrc sıra numaralarının ait olduğu kaynak olmalı.
 */
export function applyGibLayout(xslt: string, doc: Document | null | undefined): LayoutResult {
    if (!doc?.body) return { xslt, rows: 0, responsive: 0 };
    const fixes: LayoutFix[] = [];
    const rows = balanceColumns(doc, fixes);
    const responsive = makeResponsive(doc, fixes);
    let out = xslt;
    let applied = 0;
    for (const f of fixes) {
        const tag = findLiteralTagByOrdinal(out, f.ordinal);
        if (!tag || tag.name.toLowerCase() !== f.tag) continue;
        if (out.slice(tag.start, tag.end).includes('{')) continue;
        out = f.via === 'attr' ? setTagAttribute(out, tag, f.prop, f.value) : setTagStyleProperty(out, tag, f.prop, f.value);
        applied++;
    }
    return applied ? { xslt: out, rows, responsive } : { xslt, rows: 0, responsive: 0 };
}

export interface DeliveryReport {
    bytes: number;
    overLimit: boolean;
    external: string[];
    /** Alan rehberi sınırı aşacağı için XSLT'ye gömülmedi (yalnız .txt olarak iner). */
    guideDropped: boolean;
}

/**
 * İndirilecek son dosya: çevrimiçi mühür çıkarılır, girinti sıkıştırılır, viewport eklenir; alan rehberi
 * yalnız 150 KB sınırını aşmıyorsa dosyaya gömülür.
 */
export function finalizeDelivery(xslt: string, addGuide?: (x: string) => string): { content: string; report: DeliveryReport } {
    const base = ensureViewportMeta(compactXslt(stripOnlineSeal(xslt)));
    let content = base;
    let guideDropped = false;
    if (addGuide) {
        const withGuide = addGuide(base);
        if (byteLength(withGuide) <= GIB_SIZE_LIMIT) content = withGuide;
        else guideDropped = withGuide !== base;
    }
    const bytes = byteLength(content);
    return {
        content,
        report: { bytes, overLimit: bytes > GIB_SIZE_LIMIT, external: findExternalLinks(content), guideDropped },
    };
}
