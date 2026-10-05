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
