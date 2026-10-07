/**
 * xsltStyleEdit — Özellik panelinden yapılan stil / resim URL değişikliklerini
 * XSLT kaynağına yazar.
 *
 * Önizlemedeki bir öğenin XSLT'deki karşılığı iki yolla bulunur:
 * - Binding'li öğe (data-render-index): binding'in (xsl:value-of / xsl:text)
 *   kaynaktaki konumunu saran en yakın literal HTML etiketi.
 * - Resim: literal `src="..."` değeri önizlemedeki src ile birebir eşleşen
 *   <img> etiketi (aynı src'li resimler arasında sıra numarasıyla).
 * Karşılık bulunamazsa (AVT `{$x}`, xsl:attribute, call-template vb.) null
 * döner; çağıran taraf değişikliği sadece önizlemede bırakır.
 */
import type { XsltBinding } from './xsltRender';

export interface SourceTag {
    name: string;
    start: number;
    end: number;
}

const PASS1_RE = /(<xsl:(?:value-of|copy-of)\b[^>]*?\/>)|(<xsl:(?:value-of|copy-of)\b[^>]*?>[\s\S]*?<\/xsl:(?:value-of|copy-of)>)/g;
const XSL_TEXT_RE = /<xsl:text>([\s\S]*?)<\/xsl:text>/g;
const TAG_RE = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<(\/?)([A-Za-z_][\w:.-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
/** Etiket / yorum / CDATA tarayıcı: [1] '/' kapanış, [2] ad, [3] attribute'lar, [4] '/' self-closing. */
export const XML_TAG_RE_SOURCE = TAG_RE.source;

/**
 * Binding'in xslt içindeki başlangıç offset'i. parseXsltInstrumented'in
 * static offset'leri marker eklenmiş metne göre olduğu için doğrudan
 * kullanılamaz; aynı regex'lerle sıra numarası (ordinal) üzerinden bulunur.
 */
export function findBindingSourceOffset(xslt: string, bindings: XsltBinding[], b: XsltBinding): number | null {
    const kind = b.kind || 'dropdown';
    if (kind === 'element') return null;
    const ordinal = bindings.filter(x => (x.kind || 'dropdown') === kind).indexOf(b);
    if (ordinal < 0) return null;
    const re = new RegExp(kind === 'dropdown' ? PASS1_RE.source : XSL_TEXT_RE.source, 'g');
    let i = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xslt)) !== null) {
        const valid = kind === 'dropdown'
            ? /select="[^"]+"/.test(m[0])
            : (m[1] || '').trim().length > 0;
        if (!valid) continue;
        if (i === ordinal) return m.index;
        i++;
    }
    return null;
}

/** offset konumunu saran en yakın literal (namespace'siz) HTML etiketi. */
export function findEnclosingLiteralTag(xslt: string, offset: number): SourceTag | null {
    const stack: SourceTag[] = [];
    const re = new RegExp(TAG_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(xslt)) !== null && m.index < offset) {
        const name = m[2];
        if (!name) continue;
        if (m[1] === '/') {
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].name === name) { stack.length = i; break; }
            }
        } else if (m[4] !== '/') {
            stack.push({ name, start: m.index, end: m.index + m[0].length });
        }
    }
    for (let i = stack.length - 1; i >= 0; i--) {
        const n = stack[i].name;
        if (n === 'xsl:template') return null;
        if (!n.includes(':')) return stack[i];
    }
    return null;
}

function decodeXmlEntities(s: string): string {
    return s
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');
}

/** Literal src değeri `src` olan <img>'lerden ordinal'inci olanı. */
export function findImgTagBySrc(xslt: string, src: string, ordinal: number): SourceTag | null {
    const re = /<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/g;
    let i = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xslt)) !== null) {
        const sm = m[0].match(/\ssrc\s*=\s*(["'])([\s\S]*?)\1/);
        if (!sm || sm[2].includes('{')) continue;
        if (decodeXmlEntities(sm[2]) !== src) continue;
        if (i === ordinal) return { name: 'img', start: m.index, end: m.index + m[0].length };
        i++;
    }
    return null;
}

/** Ekle panelinden eklenen objenin (data-xslt-obj="id") açılış etiketi. */
export function findObjTag(xslt: string, id: string): SourceTag | null {
    const re = new RegExp(TAG_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(xslt)) !== null) {
        if (!m[2] || m[1] === '/') continue;
        const am = (m[3] || '').match(/\sdata-xslt-obj\s*=\s*(["'])([\s\S]*?)\1/);
        if (am && am[2] === id) return { name: m[2], start: m.index, end: m.index + m[0].length };
    }
    return null;
}

/** Açılış etiketinden eşleşen kapanış etiketine kadar olan iç içerik aralığı. */
export function findElementContentRange(xslt: string, tag: SourceTag): { start: number; end: number } | null {
    if (xslt.slice(tag.start, tag.end).endsWith('/>')) return null;
    const re = new RegExp(TAG_RE.source, 'g');
    re.lastIndex = tag.end;
    let depth = 1;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xslt)) !== null) {
        if (m[2] !== tag.name || m[4] === '/') continue;
        depth += m[1] === '/' ? -1 : 1;
        if (depth === 0) return { start: tag.end, end: m.index };
    }
    return null;
}

/** Öğenin iç içeriğini (açılış ve kapanış etiketi arası) değiştirir. */
export function replaceElementContent(xslt: string, tag: SourceTag, inner: string): string {
    const range = findElementContentRange(xslt, tag);
    if (!range) return xslt;
    return xslt.slice(0, range.start) + inner + xslt.slice(range.end);
}

/** Öğeyi açılış etiketinden kapanış etiketine kadar tümüyle siler. */
export function removeElement(xslt: string, tag: SourceTag): string {
    const range = findElementContentRange(xslt, tag);
    const end = range ? xslt.indexOf('>', range.end) + 1 : tag.end;
    return xslt.slice(0, tag.start) + xslt.slice(end);
}

/**
 * Önizleme için her literal HTML açılış etiketine kaynak sıra numarası
 * (data-xsrc) ekler. Sadece render edilen XSLT'ye uygulanır; kaydedilen
 * kaynakta yer almaz. Numara findLiteralTagByOrdinal ile aynı sayımı kullanır.
 */
export function annotateLiteralTags(xslt: string): string {
    let n = 0;
    return xslt.replace(new RegExp(TAG_RE.source, 'g'), (all: string, close?: string, name?: string) => {
        if (!name || close === '/' || name.includes(':')) return all;
        return `<${name} data-xsrc="${n++}"${all.slice(name.length + 1)}`;
    });
}

export function findLiteralTagByOrdinal(xslt: string, ordinal: number): SourceTag | null {
    const re = new RegExp(TAG_RE.source, 'g');
    let n = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xslt)) !== null) {
        if (!m[2] || m[1] === '/' || m[2].includes(':')) continue;
        if (n === ordinal) return { name: m[2], start: m.index, end: m.index + m[0].length };
        n++;
    }
    return null;
}

/** Öğenin kapanış etiketinin bittiği offset (self-closing ise açılış etiketinin sonu). */
export function elementEnd(xslt: string, tag: SourceTag): number {
    const range = findElementContentRange(xslt, tag);
    return range ? xslt.indexOf('>', range.end) + 1 : tag.end;
}

/** offset'teki etiketi doğrudan saran öğe (xsl: dahil). */
export function findParentTag(xslt: string, offset: number): SourceTag | null {
    const stack: SourceTag[] = [];
    const re = new RegExp(TAG_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(xslt)) !== null && m.index < offset) {
        const name = m[2];
        if (!name) continue;
        if (m[1] === '/') {
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].name === name) { stack.length = i; break; }
            }
        } else if (m[4] !== '/') {
            stack.push({ name, start: m.index, end: m.index + m[0].length });
        }
    }
    return stack[stack.length - 1] ?? null;
}

/** Öğenin doğrudan alt öğeleri; yorum dışı boşluk olmayan metin varsa hasText. */
export function childElements(xslt: string, parent: SourceTag): { children: SourceTag[]; hasText: boolean } {
    const range = findElementContentRange(xslt, parent);
    if (!range) return { children: [], hasText: false };
    const children: SourceTag[] = [];
    let hasText = false;
    let depth = 0;
    let last = range.start;
    const re = new RegExp(TAG_RE.source, 'g');
    re.lastIndex = range.start;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xslt)) !== null && m.index < range.end) {
        if (depth === 0 && xslt.slice(last, m.index).trim()) hasText = true;
        last = m.index + m[0].length;
        const name = m[2];
        if (!name) {
            if (depth === 0 && m[0].startsWith('<![CDATA[') && m[0].slice(9, -3).trim()) hasText = true;
            continue;
        }
        if (m[1] === '/') { depth--; continue; }
        if (depth === 0) children.push({ name, start: m.index, end: m.index + m[0].length });
        if (m[4] !== '/') depth++;
    }
    if (xslt.slice(last, range.end).trim()) hasText = true;
    return { children, hasText };
}

export type InsertPosition = 'after' | 'inside';

function insertOffset(xslt: string, tag: SourceTag, position: InsertPosition): number {
    if (position === 'inside') {
        const range = findElementContentRange(xslt, tag);
        if (range) return range.end;
    }
    return elementEnd(xslt, tag);
}

/** snippet'i öğenin altına (kapanışından sonra) veya içine (sonuna) ekler. */
export function insertAtTag(xslt: string, tag: SourceTag, snippet: string, position: InsertPosition): string {
    const at = insertOffset(xslt, tag, position);
    return xslt.slice(0, at) + snippet + xslt.slice(at);
}

/** Çıktı gövdesinin sonu: </body>, yoksa son </xsl:template> öncesi. */
export function documentEndOffset(xslt: string): number {
    for (const closeTag of ['</body>', '</xsl:template>']) {
        const idx = xslt.lastIndexOf(closeTag);
        if (idx >= 0) return idx;
    }
    return -1;
}

/**
 * Öğeyi hedefin altına / içine (hedef null ise gövdenin sonuna) taşır.
 * Hedef öğenin kendi içindeyse null.
 */
export function moveElement(xslt: string, src: SourceTag, target: SourceTag | null, position: InsertPosition): string | null {
    const srcEnd = elementEnd(xslt, src);
    if (target && target.start >= src.start && target.start < srcEnd) return null;
    const snippet = xslt.slice(src.start, srcEnd);
    let at = target ? insertOffset(xslt, target, position) : documentEndOffset(xslt);
    if (at < 0) return null;
    const removed = xslt.slice(0, src.start) + xslt.slice(srcEnd);
    if (at >= srcEnd) at -= srcEnd - src.start;
    return removed.slice(0, at) + snippet + removed.slice(at);
}

/** Metin düğümü için XML kaçışı. */
export function escapeXmlText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Attribute değeri için XML + XSLT AVT kaçışı. */
function escapeAttr(value: string, quote: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(quote === '"' ? /"/g : /'/g, quote === '"' ? '&quot;' : '&apos;')
        .replace(/\{/g, '{{').replace(/\}/g, '}}');
}

function replaceTag(xslt: string, tag: SourceTag, newTag: string): string {
    return xslt.slice(0, tag.start) + newTag + xslt.slice(tag.end);
}

/** Etiketin attribute'unu set eder (yoksa ekler). */
export function setTagAttribute(xslt: string, tag: SourceTag, attr: string, value: string): string {
    const tagText = xslt.slice(tag.start, tag.end);
    const re = new RegExp(`(\\s${attr}\\s*=\\s*)(["'])([\\s\\S]*?)\\2`);
    const m = tagText.match(re);
    let newTag: string;
    if (m) {
        newTag = tagText.replace(re, (_all, pre: string, q: string) => `${pre}${q}${escapeAttr(value, q)}${q}`);
    } else {
        newTag = tagText.replace(/^<([\w:.-]+)/, (_all, name: string) => `<${name} ${attr}="${escapeAttr(value, '"')}"`);
    }
    return replaceTag(xslt, tag, newTag);
}

/**
 * Inline style'daki tek bir CSS özelliğini set eder / boş değerde kaldırır.
 * Diğer bildirimler (AVT'li `{$x}border:...`, `url(data:...;base64,...)`)
 * olduğu gibi korunur.
 */
export function setTagStyleProperty(xslt: string, tag: SourceTag, prop: string, value: string): string {
    const tagText = xslt.slice(tag.start, tag.end);
    const styleRe = /(\sstyle\s*=\s*)(["'])([\s\S]*?)\2/;
    const sm = tagText.match(styleRe);
    const quote = sm ? sm[2] : '"';
    const safeValue = value.trim()
        .replace(/[<&]/g, '')
        .replace(quote === '"' ? /"/g : /'/g, quote === '"' ? "'" : '"')
        .replace(/\{/g, '{{').replace(/\}/g, '}}');

    if (!sm) {
        if (!safeValue) return xslt;
        const newTag = tagText.replace(/^<([\w:.-]+)/, (_all, name: string) => `<${name} style="${prop}:${safeValue}"`);
        return replaceTag(xslt, tag, newTag);
    }

    const parts = sm[3].split(';');
    const out: string[] = [];
    let found = false;
    for (const raw of parts) {
        const idx = raw.indexOf(':');
        const name = idx >= 0 ? raw.slice(0, idx).trim().toLowerCase() : '';
        if (name === prop) {
            if (!found && safeValue) out.push(`${prop}:${safeValue}`);
            found = true;
            continue;
        }
        out.push(raw);
    }
    let merged = out.join(';');
    if (!found && safeValue) {
        merged = merged.trim() ? `${merged.replace(/;?\s*$/, '')};${prop}:${safeValue}` : `${prop}:${safeValue}`;
    }
    const newTag = tagText.replace(styleRe, (_all, pre: string, q: string) => `${pre}${q}${merged}${q}`);
    return replaceTag(xslt, tag, newTag);
}
