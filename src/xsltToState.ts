/**
 * Faz A.1 — xsltToState (2026-09-26)
 *
 * XSLT → Canvas State donusumu.
 * XSLT dosyasini parse edip DesignState'e cevirir. Boylece XSLT "secondary format"
 * olur, primary format Canvas (DesignState) olur.
 *
 * Bu fonksiyonun amaci:
 * - Mevcut XSLT sablonlarini (e-Fatura-Sablon.xslt, e-Arsiv-Sablon.xslt, vb.)
 *   Designer'a yukleyince otomatik parse olur ve kullanici duzenlemeye baslar.
 * - "Kaydet" butonu state'i tekrar XSLT'ye cevirir (xsltGenerator ile).
 * - XSLT artik export/import formati olarak kullanilir, birincil format Canvas.
 *
 * Sinirlar (Faz A.1):
 * - HTML literal result elementleri (div, table, span, p, h1-h6, td, th, tr, img)
 *   desteklenir.
 * - xsl:value-of → binding'e cevrilir.
 * - xsl:for-each → table context olarak genisletilir.
 * - Inline style → React.CSSProperties parse edilir.
 * - <style> block icindeki CSS henuz desteklenmiyor (Faz A.2'de).
 * - xsl:if / xsl:choose henuz desteklenmiyor (Faz A.2'de).
 * - Custom JavaScript / extension functions desteklenmiyor.
 */
import type { DesignElement, DesignState, ElementType, StructureNode, TableCell } from './types';

const XSL_NS = 'http://www.w3.org/1999/XSL/Transform';

// inline style="font-size: 12pt; color: #000" → { fontSize: '12pt', color: '#000' }
function parseInlineStyle(styleString: string): Record<string, string> | undefined {
    if (!styleString || !styleString.trim()) return undefined;
    const result: Record<string, string> = {};
    const declarations = styleString.split(';');
    for (const decl of declarations) {
        const colonIdx = decl.indexOf(':');
        if (colonIdx < 0) continue;
        const rawKey = decl.substring(0, colonIdx).trim();
        const rawVal = decl.substring(colonIdx + 1).trim();
        if (!rawKey || !rawVal) continue;
        // CSS key → React CSSProperties key (camelCase)
        const camelKey = rawKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        result[camelKey] = rawVal;
    }
    return Object.keys(result).length > 0 ? result : undefined;
}

// XPath → friendly label
function xpathToLabel(xpath: string): string {
    if (!xpath) return '';
    return xpath.replace(/^.*:/, '').replace(/^.*\//, '').replace(/\[.*\]/, '');
}

export const xsltToState = (xsltString: string): DesignState => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xsltString, 'text/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
        throw new Error(`XSLT parse hatasi: ${parseError.textContent}`);
    }

    let idCounter = 0;
    const genId = () => `xslt-el-${idCounter++}`;

    const elements: DesignElement[] = [];
    const structureTree: StructureNode[] = [];

    const targetTags: ElementType[] = [
        'div', 'span', 'p', 'table',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'td', 'th', 'tr',
        'text', 'formula',
    ];

    const findValueOf = (node: Element): Element | null => {
        // Direct child xsl:value-of
        for (const child of Array.from(node.childNodes)) {
            if (child.nodeType === 1 &&
                (child as Element).localName === 'value-of' &&
                (child as Element).namespaceURI === XSL_NS) {
                return child as Element;
            }
        }
        // Next sibling xsl:value-of
        const next = node.nextElementSibling;
        if (next && next.localName === 'value-of' && next.namespaceURI === XSL_NS) {
            return next;
        }
        return null;
    };

    // table elementinin satirlarini ve hucrelerini oku
    const extractTableData = (tableNode: Element): {
        tableData: TableCell[][];
        rowCount: number;
        colCount: number;
    } => {
        const tableData: TableCell[][] = [];
        let colCount = 0;
        const rows = Array.from(tableNode.children).filter(c =>
            c.localName === 'tr' && c.namespaceURI !== XSL_NS);
        for (const row of rows) {
            const rowCells: TableCell[] = [];
            const cells = Array.from(row.children).filter(c =>
                (c.localName === 'td' || c.localName === 'th') && c.namespaceURI !== XSL_NS);
            for (const cell of cells) {
                const valueOf = findValueOf(cell);
                const binding = valueOf?.getAttribute('select') || undefined;
                const inlineStyle = cell.getAttribute('style') || '';
                rowCells.push({
                    content: cell.textContent?.trim() || '',
                    binding,
                    style: parseInlineStyle(inlineStyle) as any,
                });
            }
            colCount = Math.max(colCount, rowCells.length);
            tableData.push(rowCells);
        }
        return { tableData, rowCount: tableData.length, colCount };
    };

    const processNode = (node: Element, parentStructure: StructureNode[]): void => {
        const ns = node.namespaceURI;
        const tagName = node.localName?.toLowerCase() || '';
        const isXsl = ns === XSL_NS;

        // structureTree node
        const structureNode: StructureNode = {
            id: genId(),
            tagName: tagName.toUpperCase(),
            xpath: '',
            children: [],
        };

        if (isXsl) {
            structureNode.label = `xsl:${tagName}`;
            // xsl:template, xsl:value-of, xsl:for-each etc. → skip children traversal
            // but recurse into literal result elements inside templates
            if (tagName === 'template') {
                for (const child of Array.from(node.children)) {
                    if (child.nodeType === 1) processNode(child as Element, structureNode.children!);
                }
            }
            // Don't add xsl:* to elements list
            parentStructure.push(structureNode);
            return;
        }

        // Skip <style>, <head>, <meta>, <title>, <html> wrappers
        if (['style', 'head', 'meta', 'title', 'html', 'body'].includes(tagName)) {
            // Recurse children
            for (const child of Array.from(node.children)) {
                if (child.nodeType === 1) processNode(child as Element, structureNode.children!);
            }
            parentStructure.push(structureNode);
            return;
        }

        // Literal result element → DesignElement
        if (targetTags.includes(tagName as ElementType)) {
            const id = genId();
            const inlineStyle = node.getAttribute('style') || '';
            const styleObj = parseInlineStyle(inlineStyle);

            const valueOf = findValueOf(node);
            const binding = valueOf?.getAttribute('select') || undefined;

            const element: DesignElement = {
                id,
                type: tagName as ElementType,
                x: 0,
                y: elements.length * 30, // Vertical stack
                width: undefined,
                height: undefined,
                content: node.textContent?.trim() || '',
                binding,
                style: styleObj as any,
                htmlTag: tagName,
            };

            // table element → extract table data
            if (tagName === 'table') {
                const { tableData, rowCount, colCount } = extractTableData(node);
                element.tableData = tableData;
                element.rows = rowCount;
                element.cols = colCount;
                element.type = 'table';
            }

            // img element → logo URL
            if (tagName === 'img') {
                element.type = 'image';
                const src = node.getAttribute('src');
                element.content = src || '';
                element.binding = src || undefined;
            }

            elements.push(element);
            structureNode.id = id;
            structureNode.xpath = binding;

            // Recurse children for nested elements (tables, divs)
            for (const child of Array.from(node.children)) {
                if (child.nodeType === 1) processNode(child as Element, structureNode.children!);
            }
        }

        parentStructure.push(structureNode);
    };

    // xsl:stylesheet > xsl:template[@match='/'] içindeki elementleri işle
    const templates = Array.from(doc.getElementsByTagNameNS(XSL_NS, 'template'));
    const rootTemplate = templates.find(t => t.getAttribute('match') === '/') || templates[0];

    if (rootTemplate) {
        for (const child of Array.from(rootTemplate.children)) {
            if (child.nodeType === 1) {
                processNode(child as Element, structureTree);
            }
        }
    }

    // Extract company name from first .company-name or h1
    const firstCompany = elements.find(e => e.style?.fontWeight === '700' || e.style?.fontWeight === 'bold');
    const companyName = firstCompany?.content || 'Yeni Tasarım';

    return {
        elements,
        xsltOverrides: [],
        companyName,
        logoUrl: '',
        selectedId: null,
        selectedIds: [],
        selectedXsltElement: null,
        themeColor: '#1e3a8a',
        structureTree,
    };
};

/**
 * Debug: xsltToState çıktısını özetler.
 * 2026-09-26: Recursive structure tree count eklendi.
 */
const countTreeNodes = (nodes: StructureNode[] | undefined): number => {
    if (!nodes) return 0;
    let count = nodes.length;
    for (const n of nodes) {
        if (n.children) count += countTreeNodes(n.children);
    }
    return count;
};

export const summarizeState = (state: DesignState): string => {
    const lines: string[] = [];
    lines.push(`Elements: ${state.elements.length}`);
    lines.push(`Structure tree nodes (recursive): ${countTreeNodes(state.structureTree)}`);
    for (const el of state.elements.slice(0, 10)) {
        lines.push(`  - ${el.type} (${el.htmlTag || el.type})${el.binding ? ` bind=${el.binding}` : ''}`);
    }
    if (state.elements.length > 10) {
        lines.push(`  ... +${state.elements.length - 10} more`);
    }
    return lines.join('\n');
};
