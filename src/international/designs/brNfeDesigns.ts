/**
 * Brezilya NF-e DANFE yapısal düzenleri.
 * MOC 7 Anexo II: zorunlu alanlar korunur; canhoto yeri, satır yoğunluğu,
 * yatay/dikey ve başlık sırası emitente tarafından değiştirilebilir.
 * Renk temalarından farklı olarak HTML düzeni de değişir.
 */

export interface BrNfeDesign {
    id: string;
    accent: string;
    /** Temel XSLT’ye eklenen düzen CSS’i. */
    css: string;
    /**
     * classic — MOC referans sırası (canhoto üstte)
     * canhoto-end — canhoto sayfa sonunda (ayrı baskı / kesme)
     * chave-first — barkod+chave solda, emitente sağda
     * compact — sıkı tipografi, uzun faturalar tek sayfa
     * landscape — yatay A4 benzeri geniş sayfa
     * brand — marka şeridi + koyu DANFE kutusu
     */
    layout: 'classic' | 'canhoto-end' | 'chave-first' | 'compact' | 'landscape' | 'brand';
}

const classic: BrNfeDesign = {
    id: 'danfe-classic',
    accent: '#111827',
    layout: 'classic',
    css: `
.page.design-danfe-classic { border-top: 3px solid #111827; }
.page.design-danfe-classic .danfe .t { letter-spacing: 2px; }
`,
};

const compact: BrNfeDesign = {
    id: 'danfe-compact',
    accent: '#4338ca',
    layout: 'compact',
    css: `
.page.design-danfe-compact { padding: 8px 12px 12px; }
.page.design-danfe-compact, .page.design-danfe-compact body { font-size: 8.5px !important; }
.page.design-danfe-compact .stub td { height: 26px; }
.page.design-danfe-compact .head td { height: 96px; }
.page.design-danfe-compact .danfe .t { font-size: 14px; }
.page.design-danfe-compact .bc { height: 36px; padding-top: 3px; }
.page.design-danfe-compact .bc span { height: 28px; }
.page.design-danfe-compact .sec { margin: 4px 0 1px; }
.page.design-danfe-compact table.g td { padding: 0 3px 1px; }
.page.design-danfe-compact table.g td b { font-size: 8.5px; min-height: 10px; }
.page.design-danfe-compact table.it th { font-size: 5.6px; padding: 1px; }
.page.design-danfe-compact table.it td { font-size: 6.8px; padding: 1px; }
.page.design-danfe-compact .adic td { height: 64px; }
/* MOC: kullanılmayan ürün sütunları kapatılabilir — CBS/IBS satır altı sıkıştırma */
.page.design-danfe-compact table.it th:nth-child(11),
.page.design-danfe-compact table.it th:nth-child(12),
.page.design-danfe-compact table.it td:nth-child(11),
.page.design-danfe-compact table.it td:nth-child(12) { display: none; }
`,
};

const landscape: BrNfeDesign = {
    id: 'danfe-landscape',
    accent: '#0f766e',
    layout: 'landscape',
    css: `
.page.design-danfe-landscape { width: 1100px; padding: 12px 16px 16px; }
.page.design-danfe-landscape .head td { height: 110px; }
.page.design-danfe-landscape .emit { width: 34% !important; }
.page.design-danfe-landscape .danfe { width: 16% !important; }
.page.design-danfe-landscape .bc { height: 42px; }
.page.design-danfe-landscape table.it th { font-size: 6px; }
.page.design-danfe-landscape table.it td { font-size: 7.2px; }
@media print {
  .page.design-danfe-landscape { width: 100%; }
  @page { size: A4 landscape; }
}
`,
};

const canhotoEnd: BrNfeDesign = {
    id: 'danfe-canhoto-end',
    accent: '#9a3412',
    layout: 'canhoto-end',
    css: `
.page.design-danfe-canhoto-end .cut-top { display: none; }
.page.design-danfe-canhoto-end .stub-end { margin-top: 10px; }
.page.design-danfe-canhoto-end .cut-end { border-top: 1px dashed #000; margin: 0 0 6px; }
`,
};

const chaveFirst: BrNfeDesign = {
    id: 'danfe-chave-first',
    accent: '#1e3a8a',
    layout: 'chave-first',
    css: `
.page.design-danfe-chave-first .head .key { background: #f8fafc; }
.page.design-danfe-chave-first .danfe .t { color: #1e3a8a; }
.page.design-danfe-chave-first .emit .nm { color: #1e3a8a; }
`,
};

const brand: BrNfeDesign = {
    id: 'danfe-brand',
    accent: '#6d28d9',
    layout: 'brand',
    css: `
.page.design-danfe-brand { border: 2px solid #6d28d9; padding-top: 0; }
.page.design-danfe-brand .brand-bar {
  background: linear-gradient(90deg, #6d28d9, #2563eb);
  color: #fff; font-weight: 800; font-size: 11px; letter-spacing: .08em;
  text-transform: uppercase; padding: 8px 14px; margin: 0 -20px 10px;
}
.page.design-danfe-brand .danfe { background: #f5f3ff; }
.page.design-danfe-brand .danfe .t { color: #6d28d9; }
.page.design-danfe-brand .emit .nm { color: #4c1d95; font-size: 14px; }
.page.design-danfe-brand table.it th { background: #4c1d95; color: #fff; border-color: #4c1d95; }
.page.design-danfe-brand .sec { color: #6d28d9; border-bottom: 1px solid #c4b5fd; padding-bottom: 2px; }
`,
};

export const BR_NFE_DESIGNS: BrNfeDesign[] = [
    classic, compact, landscape, canhotoEnd, chaveFirst, brand,
];

export const BR_NFE_DESIGN_IDS = BR_NFE_DESIGNS.map(d => d.id);
export const findBrNfeDesign = (id: string) =>
    BR_NFE_DESIGNS.find(d => d.id === id) ?? BR_NFE_DESIGNS[0];

const CANHOTO_RE = /<!-- Canhoto -->[\s\S]*?<div class="cut"\/>/;
const HEAD_ROW_RE = /(<table class="g head">\s*<tr>)([\s\S]*?)(<\/tr>\s*<\/table>)/;

/** Başlık satırındaki üç hücreyi (emit | danfe | key) ayırır. */
const splitHeadCells = (rowInner: string): [string, string, string] | null => {
    const cells: string[] = [];
    let i = 0;
    while (i < rowInner.length && cells.length < 3) {
        const start = rowInner.indexOf('<td', i);
        if (start < 0) break;
        let depth = 0;
        let j = start;
        while (j < rowInner.length) {
            if (rowInner.startsWith('<td', j)) {
                depth += 1;
                j += 3;
                continue;
            }
            if (rowInner.startsWith('</td>', j)) {
                depth -= 1;
                j += 5;
                if (depth === 0) {
                    cells.push(rowInner.slice(start, j));
                    i = j;
                    break;
                }
                continue;
            }
            j += 1;
        }
        if (depth !== 0) return null;
    }
    return cells.length === 3 ? [cells[0], cells[1], cells[2]] : null;
};

/** Temel DANFE XSLT üzerine yapısal düzen uygular. */
export function composeBrNfeDesign(baseXslt: string, designId: string): string {
    const design = findBrNfeDesign(designId);
    let out = baseXslt;

    // Sayfa sınıfı
    out = out.replace(/class="page"/g, `class="page design-${design.id}"`);

    // Düzen CSS’i
    if (design.css && /<\/style>/i.test(out)) {
        out = out.replace(/<\/style>/i, `${design.css}\n                </style>`);
    }

    if (design.layout === 'canhoto-end') {
        const m = out.match(CANHOTO_RE);
        if (m) {
            const block = m[0]
                .replace('<!-- Canhoto -->', '<!-- Canhoto (fim) -->')
                .replace('class="g stub"', 'class="g stub stub-end"')
                .replace('<div class="cut"/>', '<div class="cut cut-end"/>');
            out = out.replace(CANHOTO_RE, '');
            out = out.replace(
                /(\s*)(<\/div>\s*<\/body>\s*<\/html>\s*<\/xsl:template>)/,
                `\n${block}\n$1$2`,
            );
        }
    }

    if (design.layout === 'chave-first') {
        out = out.replace(HEAD_ROW_RE, (_all, open, inner, close) => {
            const cells = splitHeadCells(inner);
            if (!cells) return `${open}${inner}${close}`;
            const [emit, danfe, key] = cells;
            // Barkod solda, DANFE ortada, emitente sağda
            return `${open}${key}${danfe}${emit}${close}`;
        });
    }

    if (design.layout === 'brand') {
        out = out.replace(
            /(<div class="page design-danfe-brand">\s*)/,
            `$1<div class="brand-bar">NF-e · DANFE personalizado</div>`,
        );
    }

    return out;
}
