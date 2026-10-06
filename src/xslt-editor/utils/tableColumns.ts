/**
 * Satır (kalem) tablosuna kolon ekleme.
 *
 * Başlık satırı ile kalem satırları XSLT'de çoğu zaman farklı yerlerdedir
 * (kalem satırı ayrı bir `xsl:template match="...InvoiceLine"` içinde). Bu
 * yüzden tablo yapısı önizlemeden okunur: önizlemedeki her <tr>/<td> data-xsrc
 * ile XSLT'deki literal etiketine bağlıdır. Seçili hücrenin bitiş kolonundan
 * sonra, tablonun her farklı kaynak satırına bir hücre eklenir (o noktayı
 * aşan colspan'lı hücrelerin colspan'ı artırılır).
 */
import { isInLineContext } from '../fieldCatalog';
import { elementEnd, findLiteralTagByOrdinal, setTagAttribute, type SourceTag } from './xsltStyleEdit';

export type ColumnRowKind = 'line' | 'header' | 'other';

export interface LineTableCell {
    cell: HTMLTableCellElement;
    table: HTMLTableElement;
}

const ordinalOf = (el: Element) => {
    const v = el.getAttribute('data-xsrc');
    return v === null ? null : Number(v);
};

/** Öğe, kalem satırları olan bir tablonun hücresindeyse hücre + tablo. */
export function findLineTableCell(start: Element | null, xslt: string): LineTableCell | null {
    const cell = start?.closest<HTMLTableCellElement>('td[data-xsrc], th[data-xsrc]') ?? null;
    const table = cell?.closest('table');
    if (!cell || !table) return null;
    const isLine = Array.from(table.rows).some(r => {
        const ord = ordinalOf(r);
        const tag = ord === null ? null : findLiteralTagByOrdinal(xslt, ord);
        return !!tag && isInLineContext(xslt, tag.start);
    });
    return isLine ? { cell, table } : null;
}

const span = (c: HTMLTableCellElement) => Math.max(1, c.colSpan || 1);

/** Hücrenin açılış etiketinden yeni hücre etiketi: colspan/rowspan/genişlik atılır. */
function cellOpenTag(xslt: string, tag: SourceTag): string {
    return xslt.slice(tag.start, tag.end)
        .replace(/\s(?:colspan|rowspan|width)\s*=\s*(["'])[\s\S]*?\1/gi, '')
        .replace(/(\sstyle\s*=\s*)(["'])([\s\S]*?)\2/i, (_all, pre: string, q: string, css: string) => {
            const kept = css.split(';').filter(d => d.trim() && !/^\s*(min-|max-)?width\s*:/i.test(d)).join(';');
            return kept.trim() ? `${pre}${q}${kept}${q}` : '';
        })
        .replace(/\/>$/, '>');
}

const indentOf = (xslt: string, at: number) => {
    const lineStart = xslt.lastIndexOf('\n', at - 1) + 1;
    const lead = xslt.slice(lineStart, at);
    return /^\s*$/.test(lead) ? lead : '';
};

/**
 * Seçili hücrenin sağına kolon ekler. `content` satır türüne göre hücre
 * içeriğini verir (kalem satırı: alan / formül, başlık: kolon adı).
 */
export function addColumnAfterCell(
    xslt: string,
    { cell, table }: LineTableCell,
    content: (kind: ColumnRowKind) => string,
): string | null {
    const row = cell.parentElement as HTMLTableRowElement | null;
    if (!row) return null;
    let p = 0;
    for (const c of Array.from(row.cells)) {
        p += span(c);
        if (c === cell) break;
    }

    type Op = { at: number; apply: (s: string) => string };
    const ops: Op[] = [];
    const seen = new Set<number>();
    const rows = Array.from(table.rows);
    const rowKinds = rows.map(r => {
        const ord = ordinalOf(r);
        const tag = ord === null ? null : findLiteralTagByOrdinal(xslt, ord);
        return tag && isInLineContext(xslt, tag.start) ? 'line' : null;
    });
    const firstLine = rowKinds.indexOf('line');

    rows.forEach((r, i) => {
        const rowOrd = ordinalOf(r);
        if (rowOrd === null || seen.has(rowOrd)) return;
        seen.add(rowOrd);
        const kind: ColumnRowKind = rowKinds[i] === 'line' ? 'line' : i < firstLine ? 'header' : 'other';
        const cells = Array.from(r.cells).filter(c => ordinalOf(c) !== null);
        if (!cells.length) return;

        let start = 0;
        let ref: { c: HTMLTableCellElement; before: boolean } | null = null;
        for (const c of cells) {
            const end = start + span(c);
            if (end === p) { ref = { c, before: false }; break; }
            if (start < p && p < end) {
                const tag = findLiteralTagByOrdinal(xslt, ordinalOf(c)!);
                if (tag) ops.push({ at: tag.start, apply: s => setTagAttribute(s, tag, 'colspan', String(span(c) + 1)) });
                return;
            }
            if (start >= p) { ref = { c, before: true }; break; }
            start = end;
        }
        ref ??= { c: cells[cells.length - 1], before: false };

        const tag = findLiteralTagByOrdinal(xslt, ordinalOf(ref.c)!);
        if (!tag) return;
        const at = ref.before ? tag.start : elementEnd(xslt, tag);
        const indent = indentOf(xslt, tag.start);
        const markup = `${cellOpenTag(xslt, tag)}${content(kind)}</${tag.name}>`;
        const text = ref.before ? `${markup}\n${indent}` : `\n${indent}${markup}`;
        ops.push({ at, apply: s => s.slice(0, at) + text + s.slice(at) });
    });

    if (!ops.length) return null;
    ops.sort((a, b) => b.at - a.at);
    return ops.reduce((s, op) => op.apply(s), xslt);
}
