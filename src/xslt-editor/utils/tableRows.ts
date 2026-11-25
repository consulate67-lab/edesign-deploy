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
