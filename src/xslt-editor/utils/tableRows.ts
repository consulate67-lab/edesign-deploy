/**
 * Özet / alt toplam tabloları (kalem satırı olmayan tablolar):
 * satır ekleme, çoğaltma, silme — XSLT hücre içeriği korunur.
 */
import { isInLineContext } from '../fieldCatalog';
import {
    childElements, elementEnd, findLiteralTagByOrdinal, findParentTag, insertAtTag,
    removeElement, type SourceTag,
} from './xsltStyleEdit';

export type SummaryTableContext = {
    table: HTMLTableElement;
    row: HTMLTableRowElement;
    cell: HTMLTableCellElement | null;
    rowTag: SourceTag;
    tableTag: SourceTag | null;
};

const ordinalOf = (el: Element | null) => {
    if (!el) return null;
    const v = el.getAttribute('data-xsrc');
    return v === null ? null : Number(v);
};

/** Tabloda en az bir kalem (xsl:for-each satır) satırı var mı? */
export function tableHasLineRows(table: HTMLTableElement, xslt: string): boolean {
    return Array.from(table.rows).some((r) => {
        const ord = ordinalOf(r);
        const tag = ord === null ? null : findLiteralTagByOrdinal(xslt, ord);
        return !!tag && isInLineContext(xslt, tag.start);
    });
}

/** Özet/alt toplam tablosundaki satır (kalem tablosu değil). */
export function findSummaryTableContext(start: Element | null, xslt: string): SummaryTableContext | null {
    const cell = start?.closest?.<HTMLTableCellElement>('td[data-xsrc], th[data-xsrc]') ?? null;
    const rowEl = (cell?.parentElement as HTMLTableRowElement | null)
        ?? start?.closest?.<HTMLTableRowElement>('tr[data-xsrc]')
        ?? null;
    const table = rowEl?.closest('table') ?? start?.closest?.('table') ?? null;
    if (!rowEl || !table || tableHasLineRows(table, xslt)) return null;

    const rowOrd = ordinalOf(rowEl);
    const rowTag = rowOrd === null ? null : findLiteralTagByOrdinal(xslt, rowOrd);
    if (!rowTag || rowTag.name.toLowerCase() !== 'tr') return null;
    if (isInLineContext(xslt, rowTag.start)) return null;

    const tableOrd = ordinalOf(table);
    const tableTag = tableOrd === null ? null : findLiteralTagByOrdinal(xslt, tableOrd);
    return {
        table,
        row: rowEl,
        cell,
        rowTag,
        tableTag: tableTag?.name.toLowerCase() === 'table' ? tableTag : null,
    };
}

/** Satırın XSLT kaynağındaki tam aralığı. */
export function rowSourceRange(xslt: string, rowTag: SourceTag): { start: number; end: number } {
    return { start: rowTag.start, end: elementEnd(xslt, rowTag) };
}

/** Referans satırdan boş satır üretir (hücre stilleri kalır, içerik temizlenir). */
export function blankRowMarkup(xslt: string, rowTag: SourceTag): string | null {
    const { children } = childElements(xslt, rowTag);
    const cells = children.filter((c) => /^t[dh]$/i.test(c.name));
    if (!cells.length) {
        return `${xslt.slice(rowTag.start, rowTag.end)}<td>&#160;</td></tr>`;
    }
    const open = xslt.slice(rowTag.start, rowTag.end);
    const inner = cells.map((c) => `${xslt.slice(c.start, c.end)}</${c.name}>`).join('');
    return `${open}${inner}</tr>`;
}

/** Seçili satırın hemen altına boş satır ekler. */
export function addEmptyRowAfter(xslt: string, rowTag: SourceTag): string | null {
    const markup = blankRowMarkup(xslt, rowTag);
    if (!markup) return null;
    const indent = (() => {
        const lineStart = xslt.lastIndexOf('\n', rowTag.start - 1) + 1;
        const lead = xslt.slice(lineStart, rowTag.start);
        return /^\s*$/.test(lead) ? `\n${lead}` : '\n';
    })();
    return insertAtTag(xslt, rowTag, `${indent}${markup}`, 'after');
}

/** Özet satır hücresi: sabit etiket veya katalog alanı. */
export type SummaryCellSpec =
    | { kind: 'text'; text: string }
    | { kind: 'field'; content: string };

const rowIndent = (xslt: string, rowTag: SourceTag) => {
    const lineStart = xslt.lastIndexOf('\n', rowTag.start - 1) + 1;
    const lead = xslt.slice(lineStart, rowTag.start);
    return /^\s*$/.test(lead) ? `\n${lead}` : '\n';
};

/**
 * Referans satırın hücre stillerini kullanarak alta yapılandırılmış satır ekler.
 * `cells` sırası = kolon sırası (etiket / alan).
 */
export function addConfiguredRowAfter(xslt: string, rowTag: SourceTag, cells: SummaryCellSpec[]): string | null {
    if (!cells.length) return null;
    const { children } = childElements(xslt, rowTag);
    const refCells = children.filter((c) => /^t[dh]$/i.test(c.name));
    const opens = refCells.map((c) => xslt.slice(c.start, c.end).replace(/\/>$/, '>'));
    const fallbackOpen = opens[0] || '<td>';
    const tagName = (opens[0]?.match(/^<\/?([A-Za-z]+)/)?.[1] || 'td').toLowerCase();
    const close = tagName === 'th' ? '</th>' : '</td>';
    const escape = (s: string) => s
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const inner = cells.map((cell, i) => {
        const open = opens[Math.min(i, Math.max(0, opens.length - 1))] || fallbackOpen;
        if (cell.kind === 'text') {
            const text = cell.text.trim() ? escape(cell.text) : '&#160;';
            return `${open}${text}${close}`;
        }
        return `${open}${cell.content || '&#160;'}${close}`;
    }).join('');
    const rowOpen = xslt.slice(rowTag.start, rowTag.end);
    const markup = `${rowOpen}${inner}</tr>`;
    return insertAtTag(xslt, rowTag, `${rowIndent(xslt, rowTag)}${markup}`, 'after');
}

/**
 * Özet satırını kardeş tr'ler arasında bir adım yukarı (−1) veya aşağı (+1) taşır.
 * Uçtaysa null.
 */
export function moveSummaryRowBy(xslt: string, rowTag: SourceTag, delta: -1 | 1): string | null {
    const parent = findParentTag(xslt, rowTag.start);
    if (!parent) return null;
    const rows = childElements(xslt, parent).children.filter((c) => c.name.toLowerCase() === 'tr');
    const idx = rows.findIndex((r) => r.start === rowTag.start);
    if (idx < 0) return null;
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= rows.length) return null;
    const { start, end } = rowSourceRange(xslt, rowTag);
    let snipStart = start;
    const lineStart = xslt.lastIndexOf('\n', start - 1) + 1;
    if (lineStart < start && /^\s*$/.test(xslt.slice(lineStart, start))) snipStart = lineStart;
    const snippet = xslt.slice(snipStart, end);
    const without = xslt.slice(0, snipStart) + xslt.slice(end);
    // parent.start değişmedi (içerik parent açılışından sonra silindi).
    const rows2 = childElements(without, parent).children.filter((c) => c.name.toLowerCase() === 'tr');
    const anchorIdx = delta < 0 ? targetIdx : targetIdx - 1;
    const anchor = rows2[anchorIdx];
    if (!anchor) return null;
    if (delta < 0) {
        return without.slice(0, anchor.start) + snippet + without.slice(anchor.start);
    }
    const anchorEnd = elementEnd(without, anchor);
    return without.slice(0, anchorEnd) + snippet + without.slice(anchorEnd);
}

/** Seçili satırı (XSLT içeriğiyle) alta kopyalar. */
export function duplicateRowAfter(xslt: string, rowTag: SourceTag): string | null {
    const { start, end } = rowSourceRange(xslt, rowTag);
    const snippet = xslt.slice(start, end);
    if (!snippet.trim()) return null;
    const indent = (() => {
        const lineStart = xslt.lastIndexOf('\n', rowTag.start - 1) + 1;
        const lead = xslt.slice(lineStart, rowTag.start);
        return /^\s*$/.test(lead) ? `\n${lead}` : '\n';
    })();
    return insertAtTag(xslt, rowTag, `${indent}${snippet}`, 'after');
}

/** Tablodaki (aynı tbody/table altındaki) satır sayısı. */
export function countSiblingRows(xslt: string, rowTag: SourceTag): number {
    const parent = findParentTag(xslt, rowTag.start);
    if (!parent) return 1;
    return childElements(xslt, parent).children.filter((c) => c.name.toLowerCase() === 'tr').length;
}

/** Satırı siler; tabloda tek satır kaldıysa null. */
export function removeSummaryRow(xslt: string, rowTag: SourceTag): string | null {
    if (countSiblingRows(xslt, rowTag) <= 1) return null;
    return removeElement(xslt, rowTag);
}

/** Hedef offset, satır taşıması için geçerli mi (tr / table / tbody…)? */
export function isValidRowDropTarget(xslt: string, target: SourceTag | null, position: 'after' | 'inside'): boolean {
    if (!target) return false;
    const name = target.name.toLowerCase();
    if (name === 'tr') return position === 'after';
    // Tablo dışına <tr> koymak geçersiz HTML — yalnız gövde içine.
    if (name === 'table' || name === 'tbody' || name === 'thead' || name === 'tfoot') {
        return position === 'inside';
    }
    // Hücreye bırakılırsa satırın altına (tr after) çevrilmeli — çağıran taraf tr'ye yükseltir.
    if (name === 'td' || name === 'th') return false;
    return false;
}

/** Drop hedefi hücreyse satırına yükselt. */
export function elevateCellTargetToRow(xslt: string, target: SourceTag): SourceTag {
    const name = target.name.toLowerCase();
    if (name !== 'td' && name !== 'th') return target;
    const parent = findParentTag(xslt, target.start);
    return parent?.name.toLowerCase() === 'tr' ? parent : target;
}
