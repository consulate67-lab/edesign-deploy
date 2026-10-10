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
import i18n from '../../i18n';
import {
    childElements, elementEnd, findLiteralTagByOrdinal, findParentTag, setTagAttribute, setTagStyleProperty,
    XML_TAG_RE_SOURCE, type SourceTag,
} from './xsltStyleEdit';

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

// ---------------------------------------------------------------------------
// Kolon silme / gizleme
// ---------------------------------------------------------------------------

export type ColumnAction = 'remove' | 'hide';
export type ColumnEditResult =
    | { ok: true; xslt: string; cells: number }
    | { ok: false; error: string };

/** Gizlenen hücrelerin işareti; "Gizli kolonları göster" bununla geri açar. */
const HIDDEN_ATTR = 'data-edesign-hidden';
/** Gizleme sırasında daraltılan colspan'ın asıl değeri. */
const COLSPAN_ATTR = 'data-edesign-colspan';

type GridCell = { cell: HTMLTableCellElement; col: number; span: number };

/** Satırların ızgara konumları (colspan + üstteki rowspan'lar hesaba katılır). */
function rowGrids(rows: HTMLTableRowElement[]): GridCell[][] {
    const blocked: Set<number>[] = rows.map(() => new Set());
    return rows.map((r, ri) => {
        const out: GridCell[] = [];
        let col = 0;
        for (const c of Array.from(r.cells)) {
            while (blocked[ri].has(col)) col++;
            const s = span(c);
            out.push({ cell: c, col, span: s });
            const rs = Math.max(1, c.rowSpan || 1);
            for (let k = 1; k < rs && ri + k < rows.length; k++) {
                for (let j = 0; j < s; j++) blocked[ri + k].add(col + j);
            }
            col += s;
        }
        return out;
    });
}

const gridWidth = (g: GridCell[]) => g.reduce((w, c) => Math.max(w, c.col + c.span), 0);

/**
 * Hücrenin XSLT'deki "birimi": yalnızca o hücreyi saran xsl:if, ya da her
 * dalı tek bir hücre olan xsl:choose (dal hangi satırda seçilirse seçilsin
 * aynı kolondur). Silmede birim tümüyle kaldırılır, gizlemede tüm dallardaki
 * hücreler gizlenir.
 */
function cellUnit(xslt: string, tag: SourceTag): { start: number; end: number; cells: SourceTag[] } {
    let unit: SourceTag = tag;
    let cells: SourceTag[] = [tag];
    for (;;) {
        const parent = findParentTag(xslt, unit.start);
        if (!parent) break;
        const own = childElements(xslt, parent);
        const sole = !own.hasText && own.children.length === 1 && own.children[0].start === unit.start;
        if (!sole) break;
        if (parent.name === 'xsl:if') { unit = parent; continue; }
        if (parent.name !== 'xsl:when' && parent.name !== 'xsl:otherwise') break;
        const choose = findParentTag(xslt, parent.start);
        if (!choose || choose.name !== 'xsl:choose') break;
        const branches = childElements(xslt, choose);
        if (branches.hasText) break;
        const branchCells: SourceTag[] = [];
        let ok = true;
        for (const br of branches.children) {
            if (br.name !== 'xsl:when' && br.name !== 'xsl:otherwise') { ok = false; break; }
            const inner = childElements(xslt, br);
            if (inner.hasText || inner.children.length > 1) { ok = false; break; }
            const c = inner.children[0];
            if (!c) continue;
            if (!/^t[dh]$/i.test(c.name)) { ok = false; break; }
            branchCells.push(c);
        }
        if (!ok) break;
        unit = choose;
        cells = branchCells;
    }
    return { start: unit.start, end: elementEnd(xslt, unit), cells };
}

/** Aralık kendi satırındaysa satırı (girinti + satır sonu) da kaldırır. */
function removalRange(xslt: string, start: number, end: number): [number, number] {
    const lineStart = xslt.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = xslt.indexOf('\n', end);
    if (lineEnd < 0) lineEnd = xslt.length;
    if (!xslt.slice(lineStart, start).trim() && !xslt.slice(end, lineEnd).trim()) {
        return [lineStart, Math.min(xslt.length, lineEnd + 1)];
    }
    return [start, end];
}

const rewriteOpenTag = (xslt: string, tag: SourceTag, fn: (text: string) => string) =>
    xslt.slice(0, tag.start) + fn(xslt.slice(tag.start, tag.end)) + xslt.slice(tag.end);

const wholeTag = (text: string): SourceTag => ({ name: '', start: 0, end: text.length });

const removeAttr = (text: string, attr: string) =>
    text.replace(new RegExp(`\\s${attr}\\s*=\\s*(["'])[\\s\\S]*?\\1`), '');

const attrValue = (text: string, attr: string) =>
    text.match(new RegExp(`\\s${attr}\\s*=\\s*(["'])([\\s\\S]*?)\\1`))?.[2] ?? null;

/**
 * Seçili hücrenin kolonunu tablonun tüm satırlarından (başlık, kalem, boş
 * satırlar, toplam satırları) siler ya da gizler.
 *
 * Kolon kimliği önizlemedeki ızgara konumundan alınır ama işlem XSLT'deki
 * kaynak hücreler (data-xsrc) üzerinde yapılır: aynı kaynak satırdan üretilen
 * satırlar arasında en geniş olanı esas alınır (koşullu hücreler eksik
 * kalan satırlarda konum kaymaz), kolonu aşan colspan'lar daraltılır,
 * <col> genişlikleri de silinir. Bir hücre XSLT'de bulunamazsa ya da aynı
 * kaynak hücre birden fazla kolonu üretiyorsa hiçbir şey değişmez (kısmi
 * işlem başlık ile verinin kaymasına yol açardı).
 */
export function editColumn(xslt: string, { cell, table }: LineTableCell, action: ColumnAction): ColumnEditResult {
    const rows = Array.from(table.rows);
    const grids = rowGrids(rows);
    const selRow = rows.findIndex(r => r === cell.parentElement);
    const selCell = selRow >= 0 ? grids[selRow].find(g => g.cell === cell) : undefined;
    if (!selCell) return { ok: false, error: i18n.t('editor.columnError.noCell') };
    const c0 = selCell.col;
    const c1 = c0 + selCell.span;

    // Kaynak satıra göre grupla; en geniş örnek ve aynı yapıdaki örnekler.
    const groups = new Map<string, number[]>();
    rows.forEach((r, i) => {
        const ord = ordinalOf(r);
        const k = ord === null ? `row${i}` : String(ord);
        groups.set(k, [...(groups.get(k) ?? []), i]);
    });

    const removeOrds = new Set<number>();
    const shrink = new Map<number, { from: number; to: number }>();
    for (const idxs of groups.values()) {
        const best = idxs.reduce((a, b) => {
            const wa = gridWidth(grids[a]);
            const wb = gridWidth(grids[b]);
            return wb > wa || (wb === wa && grids[b].length > grids[a].length) ? b : a;
        });
        const sig = (i: number) => `${gridWidth(grids[i])}:${grids[i].length}`;
        const same = idxs.filter(i => sig(i) === sig(best));
        for (const i of same) {
            const grid = grids[i];
            for (const g of grid) {
                const overlap = Math.min(c1, g.col + g.span) - Math.max(c0, g.col);
                if (overlap <= 0) continue;
                const ord = ordinalOf(g.cell);
                if (ord === null) {
                    return { ok: false, error: i18n.t('editor.columnError.generated') };
                }
                const elsewhere = grid.some(o => o !== g && ordinalOf(o.cell) === ord
                    && (o.col + o.span <= c0 || o.col >= c1));
                if (elsewhere) {
                    return { ok: false, error: i18n.t('editor.columnError.loop') };
                }
                if (g.col >= c0 && g.col + g.span <= c1) removeOrds.add(ord);
                else shrink.set(ord, { from: g.span, to: g.span - overlap });
            }
        }
    }

    // <colgroup>/<col> genişlikleri (yalnızca silmede).
    const colRemove: number[] = [];
    const colShrink = new Map<number, number>();
    if (action === 'remove') {
        let pos = 0;
        for (const col of Array.from(table.querySelectorAll<HTMLTableColElement>(':scope > colgroup > col, :scope > col'))) {
            const s = Math.max(1, col.span || 1);
            const overlap = Math.min(c1, pos + s) - Math.max(c0, pos);
            const ord = ordinalOf(col);
            if (overlap > 0 && ord !== null) {
                if (overlap >= s) colRemove.push(ord);
                else colShrink.set(ord, s - overlap);
            }
            pos += s;
        }
    }

    if (!removeOrds.size) return { ok: false, error: i18n.t('editor.columnError.empty') };
    for (const ord of removeOrds) shrink.delete(ord);

    type Op = { start: number; end: number; apply: (s: string) => string };
    const ops: Op[] = [];
    const resolve = (ord: number, names: RegExp) => {
        const tag = findLiteralTagByOrdinal(xslt, ord);
        return tag && names.test(tag.name) ? tag : null;
    };

    if (action === 'remove') {
        const units: { start: number; end: number }[] = [];
        for (const ord of removeOrds) {
            const tag = resolve(ord, /^t[dh]$/i);
            if (!tag) return { ok: false, error: i18n.t('editor.columnError.unmatched') };
            units.push(cellUnit(xslt, tag));
        }
        for (const ord of colRemove) {
            const tag = resolve(ord, /^col$/i);
            if (tag) units.push({ start: tag.start, end: elementEnd(xslt, tag) });
        }
        units.sort((a, b) => a.start - b.start || b.end - a.end);
        let lastEnd = -1;
        for (const u of units) {
            if (u.start < lastEnd) continue;
            lastEnd = u.end;
            const [s, e] = removalRange(xslt, u.start, u.end);
            ops.push({ start: s, end: e, apply: x => x.slice(0, s) + x.slice(e) });
        }
        for (const [ord, to] of colShrink) {
            const tag = resolve(ord, /^col$/i);
            if (tag) ops.push({ start: tag.start, end: tag.end, apply: x => setTagAttribute(x, tag, 'span', String(to)) });
        }
        for (const [ord, { to }] of shrink) {
            const tag = resolve(ord, /^t[dh]$/i);
            if (tag) ops.push({ start: tag.start, end: tag.end, apply: x => setTagAttribute(x, tag, 'colspan', String(to)) });
        }
    } else {
        const seen = new Set<number>();
        for (const ord of removeOrds) {
            const tag = resolve(ord, /^t[dh]$/i);
            if (!tag) return { ok: false, error: i18n.t('editor.columnError.unmatched') };
            for (const c of cellUnit(xslt, tag).cells) {
                if (seen.has(c.start)) continue;
                seen.add(c.start);
                ops.push({
                    start: c.start, end: c.end,
                    apply: x => rewriteOpenTag(x, c, t => {
                        const styled = setTagStyleProperty(t, wholeTag(t), 'display', 'none');
                        return attrValue(styled, HIDDEN_ATTR) === null ? setTagAttribute(styled, wholeTag(styled), HIDDEN_ATTR, 'kolon') : styled;
                    }),
                });
            }
        }
        for (const [ord, { from, to }] of shrink) {
            const tag = resolve(ord, /^t[dh]$/i);
            if (!tag) continue;
            ops.push({
                start: tag.start, end: tag.end,
                apply: x => rewriteOpenTag(x, tag, t => {
                    const kept = attrValue(t, COLSPAN_ATTR) === null ? setTagAttribute(t, wholeTag(t), COLSPAN_ATTR, String(from)) : t;
                    return setTagAttribute(kept, wholeTag(kept), 'colspan', String(to));
                }),
            });
        }
    }

    ops.sort((a, b) => b.start - a.start);
    return { ok: true, xslt: ops.reduce((s, op) => op.apply(s), xslt), cells: removeOrds.size };
}

/** "Kolonu gizle" ile gizlenen hücre sayısı. */
export function countHiddenColumnCells(xslt: string): number {
    return (xslt.match(new RegExp(`\\s${HIDDEN_ATTR}\\s*=`, 'g')) ?? []).length;
}

/** Gizlenen kolonları geri açar (display:none ve daraltılan colspan geri alınır). */
export function showHiddenColumns(xslt: string): string {
    const re = new RegExp(XML_TAG_RE_SOURCE, 'g');
    return xslt.replace(re, (all: string, close?: string, name?: string) => {
        if (!name || close === '/' || name.includes(':')) return all;
        let t = all;
        if (attrValue(t, HIDDEN_ATTR) !== null) {
            t = removeAttr(setTagStyleProperty(t, wholeTag(t), 'display', ''), HIDDEN_ATTR)
                .replace(/\sstyle\s*=\s*(["'])\s*\1/, '');
        }
        const colspan = attrValue(t, COLSPAN_ATTR);
        if (colspan !== null) {
            t = removeAttr(setTagAttribute(t, wholeTag(t), 'colspan', colspan), COLSPAN_ATTR);
        }
        return t;
    });
}
