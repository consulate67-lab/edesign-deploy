/**
 * Barkod objesi: JsBarcode ile 1D barkodlar.
 * Değer bir katalog alanından gelir; satır (kalem) döngüsüne konunca
 * her satır kendi alan değerini çizer (`isInLineContext` / relative XPath).
 *
 * GİB karekodundan ayrıdır: karekod sabit JSON payload; barkod alan bağlanır.
 */
import BARCODE_LIB_RAW from './vendor/jsbarcode.min.js?raw';
import { fieldXPath, type CatalogField } from './fieldCatalog';
import { QR_SCRIPT_LOOKUP } from './utils/legacyViewerCompat';

/**
 * JsBarcode CODE128 tablosunda `\0`…`\u001F` gibi kontrol karakterleri geçiyor.
 * Bunlar XML 1.0'da (CDATA içinde bile) yasak; XSLT parse “CData section not finished”
 * verir. Karakterleri JS `\u00XX` kaçışına çevirince hem XML hem çalışma zamanı aynı kalır.
 */
const BARCODE_LIB = (() => {
    let out = '';
    for (let i = 0; i < BARCODE_LIB_RAW.length; i++) {
        const c = BARCODE_LIB_RAW.charCodeAt(i);
        const illegal = (c >= 0 && c <= 8) || c === 0x0b || c === 0x0c || (c >= 0x0e && c <= 0x1f);
        out += illegal ? `\\u${c.toString(16).padStart(4, '0')}` : BARCODE_LIB_RAW[i];
    }
    return out;
})();

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
    /** Modül genişliği (px); kolon dar ise otomatik küçülür. */
    moduleWidth: number;
}

export const DEFAULT_BARCODE: BarcodeModel = {
    format: 'CODE128',
    field: '',
    displayValue: true,
    height: 40,
    moduleWidth: 1.4,
};

export const BARCODE_HEIGHT_MIN = 10;
export const BARCODE_HEIGHT_MAX = 120;

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
        height: clamp(num('height', 40), BARCODE_HEIGHT_MIN, BARCODE_HEIGHT_MAX),
        moduleWidth: clamp(num('width', 1.4), 0.6, 4),
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
 * Kütüphane <head>/<body> başında; hücre içi betik ondan önce çalışabilir.
 * JsBarcode gelene kadar bekler, çizer, sonra kolon genişliğine sığdırır.
 *
 * CODE128/39 yalnızca ASCII; Türkçe ürün adları geçersiz sayılır.
 * Bu yüzden çizim öncesi ASCII'ye sadeleştirilir (ç→c, ğ→g …).
 */
const RENDER_JS = `(function(){${QR_SCRIPT_LOOKUP}if(!b)return;`
    + "var t=b.querySelector('[data-barcode-box]'),d=b.querySelector('[data-barcode-value]');"
    + "if(!t||!d||t.getAttribute('data-barcode-drawn'))return;"
    + "var tries=0;"
    + "function fit(){"
    + "var cell=b.parentElement,maxW=0;"
    + "while(cell&&(!maxW||maxW<8)){maxW=cell.clientWidth||0;if(/^(TD|TH|DIV)$/i.test(cell.tagName))break;cell=cell.parentElement;}"
    + "if(!maxW)maxW=b.clientWidth||0;"
    + "if(maxW<8)return;"
    + "t.style.maxWidth='100%';t.style.width='100%';t.style.height='auto';t.style.display='block';"
    + "try{if(!t.getAttribute('viewBox')&&t.getBBox){var bb=t.getBBox();if(bb.width>0&&bb.height>0)t.setAttribute('viewBox',[bb.x,bb.y,bb.width,bb.height].join(' '));}"
    + "t.setAttribute('preserveAspectRatio','xMidYMid meet');"
    + "t.removeAttribute('width');t.removeAttribute('height');}catch(e){}"
    + "b.style.maxWidth='100%';b.style.width='100%';b.style.boxSizing='border-box';"
    + "}"
    + "function showMsg(msg){"
    + "t.setAttribute('data-barcode-drawn','1');"
    + "while(t.firstChild)t.removeChild(t.firstChild);"
    + "t.removeAttribute('viewBox');t.setAttribute('width','100%');t.setAttribute('height','28');"
    + "var te=t.ownerDocument.createElementNS('http://www.w3.org/2000/svg','text');"
    + "te.setAttribute('x','4');te.setAttribute('y','18');te.setAttribute('fill','#b45309');"
    + "te.setAttribute('font-size','10');te.setAttribute('font-family','Arial,sans-serif');"
    + "te.appendChild(t.ownerDocument.createTextNode(msg));t.appendChild(te);"
    + "b.style.minHeight='28px';"
    + "}"
    + "function ascii(raw,format){"
    + "var map={'\\u011f':'g','\\u00fc':'u','\\u015f':'s','\\u0131':'i','\\u00f6':'o','\\u00e7':'c',"
    + "'\\u011e':'G','\\u00dc':'U','\\u015e':'S','\\u0130':'I','\\u00d6':'O','\\u00c7':'C'};"
    + "var s=String(raw||'').replace(/[\\u011f\\u00fc\\u015f\\u0131\\u00f6\\u00e7\\u011e\\u00dc\\u015e\\u0130\\u00d6\\u00c7]/g,function(c){return map[c]||c;});"
    + "s=s.replace(/\\s+/g,' ').trim();"
    + "var f=(format||'CODE128').toUpperCase();"
    + "if(/^EAN|^UPC|^ITF|^MSI|^PHARMA/.test(f))s=s.replace(/\\D/g,'');"
    + "else if(f==='CODE39')s=s.toUpperCase().replace(/[^0-9A-Z\\-. $\\/+%]/g,'');"
    + "else if(f==='CODABAR')s=s.toUpperCase().replace(/[^0-9A-D\\-$:\\.\\/+]/g,'');"
    + "else s=s.replace(/[^\\x20-\\x7E]/g,'');"
    + "if(s.length>48)s=s.slice(0,48);"
    + "return s.trim();"
    + "}"
    + "function draw(){"
    + "if(typeof JsBarcode==='undefined'){if(++tries<80)return setTimeout(draw,25);return;}"
    + "var raw=(d.textContent||'').replace(/\\s+/g,' ').trim();"
    + "if(!raw){showMsg('deger yok');return;}"
    + "var format=b.getAttribute('data-barcode-format')||'CODE128';"
    + "var text=ascii(raw,format);"
    + "if(!text){showMsg('barkoda uygun degil');return;}"
    + "try{"
    + "var h=parseInt(b.getAttribute('data-barcode-height'),10)||40;"
    + "var w=parseFloat(b.getAttribute('data-barcode-width'));if(!(w>0))w=1.4;"
    + "var label=raw.length>40?raw.slice(0,37)+'...':raw;"
    + "JsBarcode(t,text,{format:format,"
    + "displayValue:b.getAttribute('data-barcode-displayvalue')!=='0',"
    + "text:label,"
    + "height:h,width:w,margin:2,fontSize:Math.max(8,Math.min(14,Math.round(h*0.28))),"
    + "textMargin:1,background:'#ffffff',lineColor:'#000000',xmlDocument:t.ownerDocument});"
    + "t.setAttribute('data-barcode-drawn','1');fit();"
    + "}catch(e){showMsg('kodlanamadi');}"
    + "}"
    + "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',draw);else draw();"
    + "})();";

export function barcodeContent(m: BarcodeModel, catalog: CatalogField[], inLine: boolean): string | null {
    const f = catalog.find(x => x.key === m.field);
    if (!f) return null;
    const xp = fieldXPath(f, inLine);
    return '<svg data-barcode-box="" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;width:100%;height:auto;display:block"><xsl:text> </xsl:text></svg>'
        + `<span data-barcode-value="" style="display:none"><xsl:value-of select="${xp}"/></span>`
        + `<script type="text/javascript"><![CDATA[${RENDER_JS}]]></script>`;
}

/**
 * Barkod kütüphanesini XSLT'ye gömer (<head> veya <body> başı).
 * Daha önce gömülmüş bozuk kopyayı güvenli sürümle değiştirir.
 */
export function ensureBarcodeLibrary(xslt: string): string {
    const tag = `<script type="text/javascript"><![CDATA[${LIB_MARK}${BARCODE_LIB}]]></script>`;
    const existing = /<script\b[^>]*>[\s\S]*?\/\*edx-jsbarcode\*\/[\s\S]*?<\/script>/i;
    if (existing.test(xslt)) return xslt.replace(existing, () => tag);
    if (/<\/head>/i.test(xslt)) return xslt.replace(/<\/head>/i, () => `${tag}</head>`);
    if (/<body\b[^>]*>/i.test(xslt)) return xslt.replace(/<body\b[^>]*>/i, (open) => `${open}${tag}`);
    if (/<\/body>/i.test(xslt)) return xslt.replace(/<\/body>/i, () => `${tag}</body>`);
    return `${tag}${xslt}`;
}

export function barcodeSnippet(id: string, m: BarcodeModel, catalog: CatalogField[], inLine: boolean): string | null {
    const inner = barcodeContent(m, catalog, inLine);
    if (!inner) return null;
    const attrs = barcodeAttrs(m).map(([k, v]) => `${k}="${v}"`).join(' ');
    return `<div data-xslt-obj="${id}" data-obj-kind="barcode" ${attrs} style="display:block;max-width:100%;width:100%;line-height:0;box-sizing:border-box">${inner}</div>`;
}
