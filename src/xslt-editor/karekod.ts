/**
 * GİB Karekod Standardı Kılavuzu v1.2 — e-Fatura / e-Arşiv, e-İrsaliye,
 * e-Müstahsil, e-Sigorta Komisyon ve e-Döviz karekod içeriği; e-Gider Pusulası
 * ve e-Dekont için paketlerdeki resmi XSLT'ler. Karekod belgenin sağ üst köşesinde yer almalıdır.
 */
import QR_LIB from './vendor/qrcode.min.js?raw';
import { QR_SCRIPT_LOOKUP, QR_SCRIPT_WIDTH } from './utils/legacyViewerCompat';

const L = (name: string) => `*[local-name()='${name}']`;
const p = (...names: string[]) => '/*/' + names.map(L).join('/');
const v = (select: string) => `<xsl:value-of select="${select}"/>`;
const partyId = (party: string) => `${p(party, 'Party', 'PartyIdentification', 'ID')}[@schemeID='VKN' or @schemeID='TCKN']`;
const pair = (key: string, select: string) => `"${key}":"${v(select)}"`;

const KDV = `${p('TaxTotal', 'TaxSubtotal')}[${L('TaxCategory')}/${L('TaxScheme')}/${L('TaxTypeCode')}='0015']`;

const INVOICE_JSON = '{'
    + [
        pair('vkntckn', partyId('AccountingSupplierParty')),
        pair('avkntckn', partyId('AccountingCustomerParty')),
        pair('senaryo', p('ProfileID')),
        pair('tip', p('InvoiceTypeCode')),
        pair('tarih', p('IssueDate')),
        pair('no', p('ID')),
        pair('ettn', p('UUID')),
        pair('parabirimi', p('DocumentCurrencyCode')),
        pair('malhizmettoplam', p('LegalMonetaryTotal', 'LineExtensionAmount')),
    ].join(',')
    + `<xsl:for-each select="${KDV}">,"kdvmatrah(${v(L('Percent'))})":"${v(L('TaxableAmount'))}","hesaplanankdv(${v(L('Percent'))})":"${v(L('TaxAmount'))}"</xsl:for-each>,`
    + [
        pair('vergidahil', p('LegalMonetaryTotal', 'TaxInclusiveAmount')),
        pair('odenecek', p('LegalMonetaryTotal', 'PayableAmount')),
    ].join(',')
    + '}';

const DESPATCH_JSON = '{'
    + [
        pair('vkntckn', partyId('DespatchSupplierParty')),
        pair('avkntckn', partyId('DeliveryCustomerParty')),
        pair('senaryo', p('ProfileID')),
        pair('tip', p('DespatchAdviceTypeCode')),
        pair('tarih', p('IssueDate')),
        pair('no', p('ID')),
        pair('ettn', p('UUID')),
        pair('sevktarihi', p('Shipment', 'Delivery', 'Despatch', 'ActualDespatchDate')),
        pair('sevkzamani', p('Shipment', 'Delivery', 'Despatch', 'ActualDespatchTime')),
        pair('tasiyicivkn', p('Shipment', 'Delivery', 'CarrierParty', 'PartyIdentification', 'ID')),
        pair('plaka', p('Shipment', 'ShipmentStage', 'TransportMeans', 'RoadTransport', 'LicensePlateID')),
    ].join(',')
    + '}';

const kesinti = (code: string) => `sum(${p('TaxTotal', 'TaxSubtotal')}[${L('TaxCategory')}/${L('TaxScheme')}/${L('TaxTypeCode')}='${code}']/${L('TaxAmount')})`;

/** Bölüm 2.5 — e-Müstahsil Makbuzu (CreditNote). */
const MUSTAHSIL_JSON = '{'
    + [
        pair('vkntckn', partyId('AccountingSupplierParty')),
        pair('avkntckn', partyId('AccountingCustomerParty')),
        pair('senaryo', p('ProfileID')),
        pair('tip', p('CreditNoteTypeCode')),
        pair('tarih', p('IssueDate')),
        pair('no', p('ID')),
        pair('ettn', p('UUID')),
        pair('parabirimi', p('DocumentCurrencyCode')),
        pair('malhizmettoplam', p('LegalMonetaryTotal', 'LineExtensionAmount')),
        pair('gvstopaj', kesinti('0003')),
        pair('merafonu', kesinti('9040')),
        pair('borsatescilucreti', kesinti('8001')),
        pair('sgkprimkesintisi', kesinti('SGK_PRIM')),
        pair('odenecek', p('LegalMonetaryTotal', 'PayableAmount')),
    ].join(',')
    + '}';

const CREDIT_NOTE_HEAD = [
    pair('vkntckn', partyId('AccountingSupplierParty')),
    pair('avkntckn', partyId('AccountingCustomerParty')),
    pair('senaryo', p('ProfileID')),
    pair('tip', p('CreditNoteTypeCode')),
    pair('tarih', p('IssueDate')),
    pair('no', p('ID')),
    pair('ettn', p('UUID')),
];
const creditNoteJson = (...rest: string[]) => '{' + [...CREDIT_NOTE_HEAD, ...rest].join(',') + '}';
const amountWithCurrency = (key: string, tag: string) =>
    `"${key}(${v(`${p('LegalMonetaryTotal', tag)}/@currencyID`)})":"${v(p('LegalMonetaryTotal', tag))}"`;

/** Bölüm 2.7 — e-Döviz (EDOVIZBELGE) ve e-Kıymetli Maden (EKIYMETLIMADENBELGE). */
const DOVIZ_JSON = creditNoteJson(
    amountWithCurrency('miktari', 'LineExtensionAmount'),
    pair('uygulanankur', p('PaymentExchangeRate', 'CalculationRate')),
    pair('dovizkarsiligi', p('LegalMonetaryTotal', 'LineExtensionAmount')),
    pair('tlkarsiligi', p('LegalMonetaryTotal', 'TaxInclusiveAmount')),
    amountWithCurrency('odenecek', 'PayableAmount'),
);
const MADEN_JSON = creditNoteJson(
    amountWithCurrency('miktari', 'LineExtensionAmount'),
    pair('birimfiyat', p('PaymentExchangeRate', 'CalculationRate')),
    amountWithCurrency('odenecek', 'PayableAmount'),
);
/** Bölüm 2.6 — e-Sigorta Komisyon Gider Belgesi. */
const SIGORTA_KOMISYON_JSON = creditNoteJson(
    pair('parabirimi', p('DocumentCurrencyCode')),
    pair('istihsalkomisyon', p('LegalMonetaryTotal', 'AllowanceTotalAmount')),
    pair('iptalkomisyon', p('LegalMonetaryTotal', 'ChargeTotalAmount')),
);
/** Karekod Standardı'nda yok; içerik GİB e-Gider Pusulası paketindeki resmi XSLT'den alındı. */
const GIDER_PUSULASI_JSON = creditNoteJson(
    pair('parabirimi', p('DocumentCurrencyCode')),
    pair('malhizmettoplam', p('LegalMonetaryTotal', 'LineExtensionAmount')),
    pair('odenecek', p('LegalMonetaryTotal', 'PayableAmount')),
);
/** Karekod Standardı'nda yok; içerik e-Dekont örneklerine gömülü resmi XSLT'den alındı. */
const DEKONT_JSON = creditNoteJson(
    pair('parabirimi', p('DocumentCurrencyCode')),
    pair('islemtutari', p('LegalMonetaryTotal', 'LineExtensionAmount')),
    pair('vergilerdahiltoplamtutar', p('LegalMonetaryTotal', 'TaxInclusiveAmount')),
    pair('odenecektutar', p('LegalMonetaryTotal', 'PayableAmount')),
);
const CREDIT_NOTE_JSON = '<xsl:choose>'
    + `<xsl:when test="${p('ProfileID')}='EDOVIZBELGE'">${DOVIZ_JSON}</xsl:when>`
    + `<xsl:when test="${p('ProfileID')}='EKIYMETLIMADENBELGE'">${MADEN_JSON}</xsl:when>`
    + `<xsl:when test="${p('ProfileID')}='GIDERPUSULASI'">${GIDER_PUSULASI_JSON}</xsl:when>`
    + `<xsl:when test="starts-with(${p('ProfileID')},'DEKONT') or starts-with(${p('ProfileID')},'VTA') or starts-with(${p('ProfileID')},'GVTA')">${DEKONT_JSON}</xsl:when>`
    + `<xsl:when test="${p('CreditNoteTypeCode')}='SIGORTAKOMISYONGIDERBELGESI'">${SIGORTA_KOMISYON_JSON}</xsl:when>`
    + `<xsl:otherwise>${MUSTAHSIL_JSON}</xsl:otherwise>`
    + '</xsl:choose>';

const RENDER_JS = `(function(){${QR_SCRIPT_LOOKUP}if(!b||typeof QRCode==='undefined')return;`
    + "var t=b.querySelector('[data-karekod-box]'),d=b.querySelector('[data-karekod-value]');if(!t||!d||t.querySelector('canvas,img'))return;"
    + `${QR_SCRIPT_WIDTH}new QRCode(t,{text:d.textContent.replace(/\\s+/g,' ').trim(),width:w,height:w,correctLevel:QRCode.CorrectLevel.M});})();`;

export const hasQrLibrary = (xslt: string) => xslt.includes('var QRCode;');

/** Karekod objesi; `withLibrary` false ise şablonda zaten bulunan QRCode kütüphanesi kullanılır. */
export function karekodSnippet(id: string, withLibrary: boolean): string {
    return `<div data-xslt-obj="${id}" data-obj-kind="karekod" style="width:120px;height:120px;margin-left:auto">`
        + '<div data-karekod-box=""><xsl:text> </xsl:text></div>'
        + `<span data-karekod-value="" style="display:none"><xsl:choose><xsl:when test="/${L('DespatchAdvice')}">${DESPATCH_JSON}</xsl:when><xsl:when test="/${L('CreditNote')}">${CREDIT_NOTE_JSON}</xsl:when><xsl:otherwise>${INVOICE_JSON}</xsl:otherwise></xsl:choose></span>`
        + `<script type="text/javascript"><![CDATA[${withLibrary ? QR_LIB : ''}${RENDER_JS}]]></script>`
        + '</div>';
}
