import i18n from '../../i18n';
import { isInLineContext } from '../fieldCatalog';
import type { XsltBinding } from './xsltRender';
import {
    findBindingSourceOffset, findEnclosingLiteralTag, findLiteralTagByOrdinal, bindingElementRange,
    findParentTag, findElementContentRange, type SourceTag,
} from './xsltStyleEdit';

export const TABLE_PARTS = new Set(['tr', 'tbody', 'thead', 'tfoot', 'colgroup', 'col', 'caption']);

/** Önizlemedeki veri alanının XSLT'de taşınabilirliği. */
export type BindPlacement = { tag: SourceTag | null; movable: boolean; detach: 'cell' | 'value' | null; reason: string | null };
const UNWRAPPABLE_PARENT = /^xsl:(attribute|variable|param|with-param|sort|message|comment|text|element)$/;

export function placementOfBinding(xslt: string, bindings: XsltBinding[], index: number): BindPlacement {
    const b = bindings[index];
    const offset = b ? findBindingSourceOffset(xslt, bindings, b) : null;
    const tag = offset === null ? null : findEnclosingLiteralTag(xslt, offset);
    if (offset === null || !tag) {
        return { tag: null, movable: false, detach: null, reason: i18n.t('editor.place.noContainer') };
    }
    if (isInLineContext(xslt, offset)) {
        return { tag, movable: false, detach: null, reason: i18n.t('editor.place.lineField') };
    }
    const parent = findParentTag(xslt, offset);
    const range = bindingElementRange(xslt, offset);
    const canWrap = !!range && !(parent && UNWRAPPABLE_PARENT.test(parent.name));
    const name = tag.name.toLowerCase();
    if (name === 'td' || name === 'th' || name === 'table' || TABLE_PARTS.has(name)) {
        return { tag, movable: false, detach: canWrap ? 'cell' : null, reason: i18n.t('editor.place.inCell') };
    }
    if (name === 'body' || name === 'html') {
        return { tag, movable: false, detach: canWrap ? 'cell' : null, reason: i18n.t('editor.place.inBody') };
    }
    let detach: 'value' | null = null;
    const content = canWrap && range ? findElementContentRange(xslt, tag) : null;
    if (content && range) {
        const rest = (xslt.slice(content.start, range.start) + xslt.slice(range.end, content.end))
            .replace(/<xsl:(?:value-of|copy-of)\b[^>]*?\/>/g, '')
            .replace(/<!--[\s\S]*?-->|<\/?xsl:[^>]*>/g, '')
            .trim();
        if (rest) detach = 'value';
    }
    return { tag, movable: true, detach, reason: null };
}

/** Taşınınca geçersiz HTML üreten ya da sayfanın kendisi olan etiketler. */
const UNMOVABLE_TAGS = new Set(['html', 'head', 'body', 'style', 'script', 'meta', 'link', 'title', 'td', 'th', 'li', 'dt', 'dd', 'option', ...TABLE_PARTS]);

/** Önizlemede seçilen herhangi bir literal öğenin (metin kutusu, çizgi, tablo...) taşınabilirliği. */
export function placementOfElement(xslt: string, ordinal: number): BindPlacement {
    const tag = findLiteralTagByOrdinal(xslt, ordinal);
    if (!tag) return { tag: null, movable: false, detach: null, reason: i18n.t('editor.place.noSource') };
    const name = tag.name.toLowerCase();
    if (name === 'td' || name === 'th') {
        const content = findElementContentRange(xslt, tag);
        const detach = content && xslt.slice(content.start, content.end).trim() && !isInLineContext(xslt, tag.start) ? 'cell' : null;
        return { tag, movable: false, detach, reason: i18n.t('editor.place.cell') };
    }
    if (UNMOVABLE_TAGS.has(name)) {
        return { tag, movable: false, detach: null, reason: i18n.t('editor.place.fixed') };
    }
    if (isInLineContext(xslt, tag.start)) {
        return { tag, movable: false, detach: null, reason: i18n.t('editor.place.lineElement') };
    }
    return { tag, movable: true, detach: null, reason: null };
}

/**
 * Hücrenin tüm içeriğini kendi <span>'ına alır (hücre yerinde kalır, içerik taşınabilir olur).
 * shift eski metindeki konumun yeni metindeki karşılığıdır; span: yeni kutunun açılış etiketi.
 */
export function wrapCellContent(xslt: string, cell: SourceTag): { xslt: string; span: SourceTag; shift: (pos: number) => number } | null {
    const content = findElementContentRange(xslt, cell);
    if (!content) return null;
    const inner = xslt.slice(content.start, content.end);
    if (!inner.trim()) return null;
    const rs = content.start + (inner.length - inner.trimStart().length);
    const re = content.end - (inner.length - inner.trimEnd().length);
    const open = '<span>';
    const close = '</span>';
    return {
        xslt: `${xslt.slice(0, rs)}${open}${xslt.slice(rs, re)}${close}${xslt.slice(re)}`,
        span: { name: 'span', start: rs, end: rs + open.length },
        shift: (pos) => pos + (pos >= re ? open.length + close.length : pos >= rs ? open.length : 0),
    };
}
