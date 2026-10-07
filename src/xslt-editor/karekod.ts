/**
 * GİB Karekod Standardı Kılavuzu v1.2 — e-Fatura / e-Arşiv ve e-İrsaliye
 * karekod içeriği. Karekod belgenin sağ üst köşesinde yer almalıdır.
 */
import QR_LIB from './vendor/qrcode.min.js?raw';

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

const RENDER_JS = "(function(){var s=document.currentScript,b=s&&s.parentNode;if(!b||typeof QRCode==='undefined')return;"
    + "var t=b.querySelector('[data-karekod-box]'),d=b.querySelector('[data-karekod-value]');if(!t||!d||t.querySelector('canvas,img'))return;"
    + "var w=b.clientWidth||120;new QRCode(t,{text:d.textContent.replace(/\\s+/g,' ').trim(),width:w,height:w,correctLevel:QRCode.CorrectLevel.M});})();";

export const hasQrLibrary = (xslt: string) => xslt.includes('var QRCode;');

/** Karekod objesi; `withLibrary` false ise şablonda zaten bulunan QRCode kütüphanesi kullanılır. */
export function karekodSnippet(id: string, withLibrary: boolean): string {
    return `<div data-xslt-obj="${id}" data-obj-kind="karekod" style="width:120px;height:120px;margin-left:auto">`
        + '<div data-karekod-box=""><xsl:text> </xsl:text></div>'
        + `<span data-karekod-value="" style="display:none"><xsl:choose><xsl:when test="/${L('DespatchAdvice')}">${DESPATCH_JSON}</xsl:when><xsl:otherwise>${INVOICE_JSON}</xsl:otherwise></xsl:choose></span>`
        + `<script type="text/javascript"><![CDATA[${withLibrary ? QR_LIB : ''}${RENDER_JS}]]></script>`
        + '</div>';
}
