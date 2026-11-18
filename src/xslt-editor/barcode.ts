/**
 * Barkod objesi: JsBarcode ile 1D barkodlar.
 * Değer bir katalog alanından gelir; satır (kalem) döngüsüne konunca
 * her satır kendi alan değerini çizer (`isInLineContext` / relative XPath).
 *
 * GİB karekodundan ayrıdır: karekod sabit JSON payload; barkod alan bağlanır.
 */
import BARCODE_LIB from './vendor/jsbarcode.min.js?raw';
import { fieldXPath, type CatalogField } from './fieldCatalog';
import { QR_SCRIPT_LOOKUP } from './utils/legacyViewerCompat';

/** JsBarcode.all.min.js'in desteklediği biçimler. */
export const BARCODE_FORMATS = [
    'CODE128',
    'CODE128A',
    'CODE128B',
    'CODE128C',
    'EAN13',
    'EAN8',
    'EAN5',
    'EAN2',
    'UPC',
    'UPCE',
    'CODE39',
    'CODE93',
    'ITF14',
    'ITF',
    'MSI',
    'MSI10',
    'MSI11',
    'MSI1010',
    'MSI1110',
    'pharmacode',
    'codabar',
] as const;

export type BarcodeFormat = (typeof BARCODE_FORMATS)[number];

export interface BarcodeModel {
    format: BarcodeFormat;
    /** CatalogField.key */
    field: string;
    /** Barkod altında insan-okur metin. */
    displayValue: boolean;
    /** Çubuk yüksekliği (px). */
    height: number;
    /** Modül genişliği (px). */
    moduleWidth: number;
}

export const DEFAULT_BARCODE: BarcodeModel = {
    format: 'CODE128',
    field: '',
    displayValue: true,
    height: 48,
    moduleWidth: 1.6,
};

const LIB_MARK = '/*edx-jsbarcode*/';
export const hasBarcodeLibrary = (xslt: string) => xslt.includes(LIB_MARK);

const oneOf = <T extends string>(v: string | null, list: readonly T[], fallback: T): T =>
    (v && (list as readonly string[]).includes(v) ? v : fallback) as T;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function readBarcode(el: Element): BarcodeModel {
    const num = (name: string, fallback: number) => {
        const n = Number(el.getAttribute(`data-barcode-${name}`));
        return Number.isFinite(n) ? n : fallback;
    };
    return {
        format: oneOf(el.getAttribute('data-barcode-format'), BARCODE_FORMATS, 'CODE128'),
        field: el.getAttribute('data-barcode-field') || '',
        displayValue: el.getAttribute('data-barcode-displayvalue') !== '0',
        height: clamp(num('height', 48), 20, 120),
        moduleWidth: clamp(num('width', 1.6), 0.8, 4),
    };
}

export function barcodeAttrs(m: BarcodeModel): [string, string][] {
    return [
        ['data-barcode-format', m.format],
        ['data-barcode-field', m.field],
        ['data-barcode-displayvalue', m.displayValue ? '1' : '0'],
        ['data-barcode-height', String(Math.round(m.height))],
        ['data-barcode-width', String(m.moduleWidth)],
    ];
}

/** Belge / satır için makul varsayılan alan. */
export function defaultBarcodeField(catalog: CatalogField[], inLine: boolean): string {
    const prefer = inLine
        ? [
            'Invoice/InvoiceLine/Item/SellersItemIdentification/ID',
            'Invoice/InvoiceLine/Item/BuyersItemIdentification/ID',
            'Invoice/InvoiceLine/Item/StandardItemIdentification/ID',
            'Invoice/InvoiceLine/ID',
            'DespatchAdvice/DespatchLine/ID',
            'CreditNote/CreditNoteLine/ID',
        ]
        : [
            'Invoice/ID',
            'DespatchAdvice/ID',
            'CreditNote/ID',
            'ReceiptAdvice/ID',
            'Invoice/UUID',
        ];
    for (const key of prefer) {
        if (catalog.some(f => f.key === key)) return key;
    }
    const text = catalog.find(f => f.format === 'text');
    return text?.key ?? catalog[0]?.key ?? '';
}

export function defaultBarcode(catalog: CatalogField[], inLine: boolean): BarcodeModel {
    return { ...DEFAULT_BARCODE, field: defaultBarcodeField(catalog, inLine) };
}

/**
 * IE / gömülü görüntüleyicide currentScript olmayabilir.
 * Kutuyu SVG olarak JsBarcode ile doldurur; hatalı değerde sessizce geçer.
 */
const RENDER_JS = `(function(){${QR_SCRIPT_LOOKUP}if(!b||typeof JsBarcode==='undefined')return;`
    + "var t=b.querySelector('[data-barcode-box]'),d=b.querySelector('[data-barcode-value]');"
    + "if(!t||!d||t.getAttribute('data-barcode-drawn'))return;"
    + "var text=(d.textContent||'').replace(/\\s+/g,' ').trim();if(!text)return;"
    + "try{JsBarcode(t,text,{format:b.getAttribute('data-barcode-format')||'CODE128',"
    + "displayValue:b.getAttribute('data-barcode-displayvalue')!=='0',"
    + "height:parseInt(b.getAttribute('data-barcode-height'),10)||48,"
    + "width:parseFloat(b.getAttribute('data-barcode-width'))||1.6,"
    + "margin:4,fontSize:12,textMargin:2,background:'#ffffff',lineColor:'#000000'});"
    + "t.setAttribute('data-barcode-drawn','1');}catch(e){}})();";

export function barcodeContent(m: BarcodeModel, catalog: CatalogField[], inLine: boolean): string | null {
    const f = catalog.find(x => x.key === m.field);
    if (!f) return null;
    const xp = fieldXPath(f, inLine);
    return '<svg data-barcode-box="" xmlns="http://www.w3.org/2000/svg"><xsl:text> </xsl:text></svg>'
        + `<span data-barcode-value="" style="display:none"><xsl:value-of select="${xp}"/></span>`
        + `<script type="text/javascript"><![CDATA[${RENDER_JS}]]></script>`;
}

/** İlk barkod eklenirken kütüphaneyi XSLT'ye bir kez gömer. */
export function ensureBarcodeLibrary(xslt: string): string {
    if (hasBarcodeLibrary(xslt)) return xslt;
    const tag = `<script type="text/javascript"><![CDATA[${LIB_MARK}${BARCODE_LIB}]]></script>`;
    if (/<\/body>/i.test(xslt)) return xslt.replace(/<\/body>/i, `${tag}</body>`);
    return `${xslt}${tag}`;
}

export function barcodeSnippet(id: string, m: BarcodeModel, catalog: CatalogField[], inLine: boolean): string | null {
    const inner = barcodeContent(m, catalog, inLine);
    if (!inner) return null;
    const attrs = barcodeAttrs(m).map(([k, v]) => `${k}="${v}"`).join(' ');
    return `<div data-xslt-obj="${id}" data-obj-kind="barcode" ${attrs} style="display:inline-block;max-width:100%;line-height:0">${inner}</div>`;
}
