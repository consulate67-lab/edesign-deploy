// Meslek şablonlarının XSLT parçaları: belge ailesine (Invoice / CreditNote / DespatchAdvice) göre taraf,
// kalem tablosu, toplamlar, referans, dönem, teslimat ve ödeme blokları. Yerleşimler (layouts.mjs) bu
// parçaları kendi düzenlerinde birleştirir. Her blok yalnızca XML'de ilgili alan varsa görünür.
import { v, t, num, dt, iban, each, iff, choose, pName, pAddr, pTax, pContact, qr, svg, kurMetni, kurRows } from '../moda/lib.mjs';

export { v, t, num, dt, each, iff, choose, qr, svg, pName };

export const qty = (s) => `<xsl:value-of select="format-number(${s}, '###.##0,###', 'edesign-tr')"/>`;
export const birim = (s) => `<xsl:call-template name="birim"><xsl:with-param name="u" select="${s}"/></xsl:call-template>`;
export const etiket = (s) => `<xsl:call-template name="etiket"><xsl:with-param name="k" select="${s}"/></xsl:call-template>`;
export const odeme = (s) => `<xsl:call-template name="odeme"><xsl:with-param name="k" select="${s}"/></xsl:call-template>`;
export const money = (s) => `${num(s)}${t(' ')}${v('$pb')}`;
const saat = (s) => v(`substring(${s},1,5)`);

export const FAM = {
    invoice: {
        root: 'Invoice', line: 'cac:InvoiceLine', qty: 'cbc:InvoicedQuantity', type: 'cbc:InvoiceTypeCode',
        sup: '$f/cac:AccountingSupplierParty/cac:Party', cus: '$f/cac:AccountingCustomerParty/cac:Party',
    },
    credit: {
        root: 'CreditNote', line: 'cac:CreditNoteLine', qty: 'cbc:CreditedQuantity', type: 'cbc:CreditNoteTypeCode',
        sup: '$f/cac:AccountingSupplierParty/cac:Party', cus: '$f/cac:AccountingCustomerParty/cac:Party',
    },
    despatch: {
        root: 'DespatchAdvice', line: 'cac:DespatchLine', qty: 'cbc:DeliveredQuantity', type: 'cbc:DespatchAdviceTypeCode',
        sup: '$f/cac:DespatchSupplierParty/cac:Party', cus: '$f/cac:DeliveryCustomerParty/cac:Party',
    },
};
const BUY = '$f/cac:BuyerCustomerParty/cac:Party';
const LMT = '$f/cac:LegalMonetaryTotal';
const KDV_SUB = "cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015']";
const OTHER_SUB = "cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode!='0015']";

/* ------------------------------------------------------------------ yardımcı şablonlar */

const UNITS = [
    ['C62', 'adet'], ['PR', 'çift'], ['MTR', 'm'], ['MTK', 'm²'], ['MTQ', 'm³'], ['KGM', 'kg'], ['GRM', 'gr'], ['TNE', 'ton'],
    ['LTR', 'lt'], ['KWH', 'kWh'], ['HUR', 'saat'], ['DAY', 'gün'], ['MON', 'ay'], ['ANN', 'yıl'], ['SET', 'set'], ['PA', 'paket'],
    ['BX', 'koli'], ['DZN', 'düzine'], ['KMT', 'km'], ['MIN', 'dk'], ['D61', 'dk'], ['CMT', 'cm'], ['NIU', 'adet'], ['BG', 'çuval'],
    ['CR', 'kasa'], ['B32', 'kg·m²'], ['R9', 'bin m³'], ['SM3', 'Sm³'], ['KTM', 'km'], ['NT', 'net ton'], ['GT', 'gros ton'], ['TU', 'tüp'],
];
const PAY = [['1', 'Belirtilmemiş'], ['10', 'Nakit'], ['20', 'Çek'], ['42', 'Havale / EFT'], ['46', 'Banka Havalesi (EFT)'], ['48', 'Kredi / Banka Kartı'],
    ['49', 'Otomatik Ödeme'], ['60', 'Senet'], ['97', 'Mahsup'], ['ZZZ', 'Diğer']];

const chooseTpl = (name, param, rows) => `
    <xsl:template name="${name}">
        <xsl:param name="${param}"/>
        <xsl:choose>
${rows.map(([k, l]) => `            <xsl:when test="$${param}='${k}'">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</xsl:when>`).join('\n')}
            <xsl:otherwise><xsl:value-of select="$${param}"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>`;

/** Kullanılan ek alan şemaları (schemeID / DocumentType) için Türkçe etiket şablonu. */
export const helperTemplates = (labels) => [
    `
    <xsl:template name="tarih">
        <xsl:param name="d"/>
        <xsl:if test="string-length($d) &gt;= 10"><xsl:value-of select="concat(substring($d,9,2),'.',substring($d,6,2),'.',substring($d,1,4))"/></xsl:if>
    </xsl:template>
    <xsl:template name="iban">
        <xsl:param name="i"/>
        <xsl:value-of select="concat(substring($i,1,4),' ',substring($i,5,4),' ',substring($i,9,4),' ',substring($i,13,4),' ',substring($i,17,4),' ',substring($i,21,4),' ',substring($i,25,4))"/>
    </xsl:template>`,
    chooseTpl('birim', 'u', UNITS),
    chooseTpl('odeme', 'k', PAY),
    chooseTpl('etiket', 'k', labels),
].join('');

/* ------------------------------------------------------------------ taraflar */

const OTHER_IDS = "cac:PartyIdentification/cbc:ID[@schemeID!='VKN' and @schemeID!='TCKN' and @schemeID!='MERSISNO']";

/** Taraf kartı (Party bağlamında); rol başlığı + ad, adres, vergi, iletişim, ek kimlikler ve pasaport. */
export const partyBody = (role) => [
    `<div class="rol">${t(role)}</div>`,
    `<div class="ad">${pName}</div>`,
    iff('cac:PartyName and cac:Person', `<div class="k">${t('Yetkili: ')}${v("concat(cac:Person/cbc:FirstName,' ',cac:Person/cbc:FamilyName)")}</div>`),
    iff('cac:PostalAddress', `<div class="k">${pAddr()}</div>`),
    iff("cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']", `<div class="k">${pTax()}</div>`),
    iff('cac:Contact/cbc:Telephone or cac:Contact/cbc:ElectronicMail or cbc:WebsiteURI', `<div class="k">${pContact()}</div>`),
    each(OTHER_IDS, `<div class="k">${etiket('@schemeID')}${t(': ')}<b>${v('.')}</b></div>`),
    iff("cac:Contact/cbc:Name='IADEKODU'", `<div class="k">${t('İade onay kodu: ')}<b>${v('cac:Contact/cbc:ID')}</b></div>`),
    iff('cac:Person/cbc:NationalityID', `<div class="k">${t('Uyruk: ')}${v('cac:Person/cbc:NationalityID')}${iff('cac:Person/cac:IdentityDocumentReference/cbc:ID', `${t(' · Pasaport: ')}<b>${v('cac:Person/cac:IdentityDocumentReference/cbc:ID')}</b>`)}</div>`),
].join('');

export const partyCard = (path, role, cls = 'taraf') => each(path, `<div class="${cls}">${partyBody(role)}</div>`);

/** Belgeye göre taraf kartları: std (satıcı/alıcı), ihracat (alıcı Buyer, gümrük muhatap), yolcu (turist + aracı kurum). */
export function parties(K, cls = 'taraf') {
    const F = FAM[K.fam];
    if (K.parties === 'ihracat') {
        return [
            partyCard(F.sup, K.roles[0], cls),
            choose([BUY, partyCard(BUY, K.roles[1], cls)], [null, partyCard(F.cus, K.roles[1], cls)]),
        ];
    }
    if (K.parties === 'yolcu') {
        return [
            partyCard(F.sup, K.roles[0], cls),
            choose([BUY, partyCard(BUY, K.roles[1], cls)], [null, partyCard(F.cus, K.roles[1], cls)]),
        ];
    }
    return [partyCard(F.sup, K.roles[0], cls), partyCard(F.cus, K.roles[1], cls)];
}

/** Çerçevesiz taraf içerikleri (tablo hücresine yerleşen yerleşimler için). */
export function partyBodies(K) {
    const F = FAM[K.fam];
    const second = K.parties ? choose([BUY, each(BUY, partyBody(K.roles[1]))], [null, each(F.cus, partyBody(K.roles[1]))]) : each(F.cus, partyBody(K.roles[1]));
    return [each(F.sup, partyBody(K.roles[0])), second];
}

/* ------------------------------------------------------------------ künye */

export function metaRows(K) {
    const F = FAM[K.fam];
    return [
        [t(K.noLabel ?? 'Belge No'), `<b>${v('$f/cbc:ID')}</b>`],
        [t('Düzenleme'), `${dt('$f/cbc:IssueDate')}${iff('$f/cbc:IssueTime', `${t(' ')}${saat('$f/cbc:IssueTime')}`)}`],
        [t('Senaryo'), v('$f/cbc:ProfileID')],
        [t('Belge Tipi'), v(`$f/${F.type}`)],
        ...(K.fam === 'invoice' ? [['$kur', kurMetni()]] : []),
    ];
}

/** Künye satırları: tablo (tr) veya liste (div) biçiminde. */
export const metaTable = (K, cls = 'kunye') => `<table class="${cls}">${metaRows(K).map(([l, val]) => {
    const row = `<tr><td>${l.startsWith('$') ? t('Döviz') : l}</td><td>${val}</td></tr>`;
    return l.startsWith('$') ? iff('$kur', row) : row;
}).join('')}</table>`;

export const ettn = () => `${t('ETTN: ')}${v('$f/cbc:UUID')}`;

/* ------------------------------------------------------------------ kalemler */

const chips = (feat) => [
    iff('cbc:Note', `<div class="ack">${v('cbc:Note')}</div>`),
    iff('cac:Item/cbc:Description', `<div class="ack">${v('cac:Item/cbc:Description')}</div>`),
    iff('cac:Item/cbc:BrandName or cac:Item/cbc:ModelName or cac:Item/cac:SellersItemIdentification/cbc:ID', `<div class="ack">${[
        iff('cac:Item/cbc:BrandName', `${v('cac:Item/cbc:BrandName')}${t(' ')}`),
        iff('cac:Item/cbc:ModelName', `${v('cac:Item/cbc:ModelName')}${t(' ')}`),
        iff('cac:Item/cac:SellersItemIdentification/cbc:ID', `${t('· Kod ')}${v('cac:Item/cac:SellersItemIdentification/cbc:ID')}`),
    ].join('')}</div>`),
    iff('cac:Item/cac:AdditionalItemIdentification or cac:Item/cac:OriginCountry or cac:Delivery', `<div>${[
        each('cac:Item/cac:AdditionalItemIdentification/cbc:ID', `<span class="cip">${etiket('@schemeID')}${t(': ')}${v('.')}</span>`),
        iff('cac:Item/cac:OriginCountry', `<span class="cip">${t('Menşe: ')}${v('cac:Item/cac:OriginCountry/cbc:Name')}</span>`),
        feat.exp ? [
            iff('cac:Delivery/cac:DeliveryTerms/cbc:ID', `<span class="cip">${v('cac:Delivery/cac:DeliveryTerms/cbc:ID')}</span>`),
            iff('cac:Delivery/cac:Shipment/cac:GoodsItem/cbc:RequiredCustomsID', `<span class="cip">${t('GTİP ')}${v('cac:Delivery/cac:Shipment/cac:GoodsItem/cbc:RequiredCustomsID')}</span>`),
            iff('cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode', `<span class="cip">${choose(
                ["cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode='1'", t('Denizyolu')],
                ["cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode='3'", t('Karayolu')],
                ["cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode='4'", t('Havayolu')],
                [null, `${t('Taşıma ')}${v('cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode')}`])}</span>`),
            each('cac:Delivery/cac:Shipment/cac:TransportHandlingUnit/cac:ActualPackage', `<span class="cip">${v('cbc:Quantity')}${t(' kap · ')}${v('cbc:ID')}</span>`),
        ].join('') : '',
    ].join('')}</div>`),
].join('');

/**
 * Kalem tablosu sütunları. feat: { disc, extra, wh, exp, cuts, price } — üreteç örnek XML'e bakarak belirler.
 * cols: inv (fatura), smm, credit (müstahsil / gider / kıymetli maden), despatch.
 */
export function lineColumns(K, feat) {
    const F = FAM[K.fam];
    const name = { h: K.itemHead ?? 'Mal / Hizmet', c: `<div class="kad">${v('cac:Item/cbc:Name')}</div>${chips(feat)}`, cls: 'ad' };
    const no = { h: '#', c: v('cbc:ID'), cls: 'c no' };
    const miktar = { h: 'Miktar', c: `${qty(F.qty)}${t(' ')}${birim(`${F.qty}/@unitCode`)}`, cls: 'r nw' };
    const fiyat = { h: K.priceHead ?? 'Birim Fiyat', c: money('cac:Price/cbc:PriceAmount'), cls: 'r nw' };
    const tutar = { h: K.amountHead ?? 'Tutar', c: `<b>${money('cbc:LineExtensionAmount')}</b>`, cls: 'r nw' };
    const kdv = {
        h: 'KDV', cls: 'r nw',
        c: each(KDV_SUB, choose(
            ["starts-with(cac:TaxCategory/cbc:TaxExemptionReasonCode,'8')", `${t('%')}${v('cbc:Percent')}<div class="kc">${t('ÖM ')}${num('cbc:TaxableAmount')}</div><div class="kc">${money('cbc:TaxAmount')}</div>`],
            ['cac:TaxCategory/cbc:TaxExemptionReasonCode and cbc:TaxAmount &gt; 0', `${t('%')}${v('cbc:Percent')}<div class="kc">${money('cbc:TaxAmount')}</div><span class="ist">${v('cac:TaxCategory/cbc:TaxExemptionReasonCode')}</span>`],
            ['cac:TaxCategory/cbc:TaxExemptionReasonCode', `<span class="ist">${t('İst. ')}${v('cac:TaxCategory/cbc:TaxExemptionReasonCode')}</span>`],
            [null, `${t('%')}${v('cbc:Percent')}<div class="kc">${money('cbc:TaxAmount')}</div>`])),
    };
    if (K.cols === 'despatch') {
        return [no, name, { h: 'Ürün Kodu', c: v('cac:Item/cac:SellersItemIdentification/cbc:ID'), cls: 'nw' }, miktar];
    }
    if (K.cols === 'credit') {
        return [no, name, miktar, fiyat, tutar,
            ...(feat.kdv ? [kdv] : []),
            ...(feat.cuts ? [{ h: 'Kesintiler', cls: 'r nw', c: each(OTHER_SUB, `<div>${v('cac:TaxCategory/cac:TaxScheme/cbc:Name')}${t(' %')}${v('cbc:Percent')}</div>`) }] : [])];
    }
    if (K.cols === 'smm') {
        return [no, { ...name, h: 'Hizmetin Açıklaması' }, miktar, { ...fiyat, h: 'Birim Ücret' }, kdv, { ...tutar, h: 'Brüt Ücret' }];
    }
    return [no, name, miktar, fiyat,
        ...(feat.disc ? [{ h: 'İskonto', cls: 'r nw', c: iff('cac:AllowanceCharge', `${t('%')}${v('cac:AllowanceCharge/cbc:MultiplierFactorNumeric * 100')}<div class="kc">${t('− ')}${money('cac:AllowanceCharge/cbc:Amount')}</div>`) }] : []),
        ...(feat.extra ? [{
            h: 'Diğer Vergi', cls: 'r nw',
            c: each(OTHER_SUB, `<div>${v('cac:TaxCategory/cac:TaxScheme/cbc:Name')}${choose(['cbc:Percent', `${t(' %')}${v('cbc:Percent')}`], ['cbc:PerUnitAmount', `${t(' ')}${num('cbc:PerUnitAmount', '###.##0,00##')}${t('/birim')}`])}<div class="kc">${money('cbc:TaxAmount')}</div></div>`),
        }] : []),
        kdv,
        ...(feat.wh ? [{ h: 'Tevkifat', cls: 'r nw', c: each('cac:WithholdingTaxTotal/cac:TaxSubtotal', `${v('cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode')}${t(' · ')}${v('cbc:Percent div 10')}${t('/10')}<div class="kc">${money('cbc:TaxAmount')}</div>`) }] : []),
        tutar];
}

export function linesTable(K, feat, cls = 'kalem') {
    const F = FAM[K.fam];
    const cols = lineColumns(K, feat);
    return `<table class="${cls}"><thead><tr>${cols.map((c) => `<th class="${c.cls}">${t(c.h)}</th>`).join('')}</tr></thead><tbody>${
        each(`$f/${F.line}`, `<tr>${cols.map((c) => `<td class="${c.cls}">${c.c}</td>`).join('')}</tr>`)}</tbody></table>`;
}

/* ------------------------------------------------------------------ toplamlar */

/** Toplam satırları: row(etiket, tutar, sınıf). */
export function totalRows(K, row) {
    if (K.fam === 'despatch') return '';
    const base = [row(t(K.grossLabel ?? 'Mal / Hizmet Toplamı'), money(`${LMT}/cbc:LineExtensionAmount`), '')];
    if (K.fam === 'invoice') {
        base.push(iff(`${LMT}/cbc:AllowanceTotalAmount &gt; 0`, row(t('Toplam İskonto'), `${t('− ')}${money(`${LMT}/cbc:AllowanceTotalAmount`)}`, 'eksi')));
    }
    const taxName = `${v('cac:TaxCategory/cac:TaxScheme/cbc:Name')}${iff('cbc:Percent', `${t(' (%')}${v('cbc:Percent')}${t(')')}`)}`;
    const deducted = K.fam === 'credit' ? 'true()' : "cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0003'";
    base.push(each('$f/cac:TaxTotal/cac:TaxSubtotal', choose(
        ["cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015' and starts-with(cac:TaxCategory/cbc:TaxExemptionReasonCode,'8')",
            row(`${t('KDV · Özel Matrah ')}${v('cac:TaxCategory/cbc:TaxExemptionReasonCode')}${t(' (%')}${v('cbc:Percent')}${t(' × ')}${num('cbc:TaxableAmount')}${t(')')}`, money('cbc:TaxAmount'), '')],
        ["cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015' and cac:TaxCategory/cbc:TaxExemptionReasonCode and cbc:TaxAmount &gt; 0",
            row(`${t('Hesaplanan KDV (%')}${v('cbc:Percent')}${t(') · ')}${v('cac:TaxCategory/cbc:TaxExemptionReasonCode')}`, money('cbc:TaxAmount'), '')],
        ["cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015' and cac:TaxCategory/cbc:TaxExemptionReasonCode",
            row(`${t('KDV İstisnası (')}${v('cac:TaxCategory/cbc:TaxExemptionReasonCode')}${t(')')}`, money('cbc:TaxAmount'), 'ist')],
        ["cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015'", row(`${t('Hesaplanan KDV (%')}${v('cbc:Percent')}${t(')')}`, money('cbc:TaxAmount'), '')],
        [deducted, row(taxName, `${t('− ')}${money('cbc:TaxAmount')}`, 'eksi')],
        [null, row(taxName, money('cbc:TaxAmount'), '')],
    )));
    if (K.fam === 'invoice') {
        base.push(each('$f/cac:WithholdingTaxTotal/cac:TaxSubtotal', row(`${t('KDV Tevkifatı (')}${v('cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode')}${t(' · ')}${v('cbc:Percent div 10')}${t('/10)')}`, `${t('− ')}${money('cbc:TaxAmount')}`, 'eksi')));
    }
    base.push(iff(`${LMT}/cbc:TaxInclusiveAmount != ${LMT}/cbc:PayableAmount or ${LMT}/cbc:TaxInclusiveAmount != ${LMT}/cbc:LineExtensionAmount`,
        row(t('Vergiler Dahil Toplam'), money(`${LMT}/cbc:TaxInclusiveAmount`), 'ara')));
    if (K.fam === 'invoice') base.push(kurRows(row, 'eksi'));
    return base.join('');
}

export const payable = () => money(`${LMT}/cbc:PayableAmount`);
export const yaziyla = () => each("$f/cbc:Note[starts-with(.,'Yalnız')]", v('.'));
export const tlKarsilik = () => iff('$kur', `${t('TL karşılığı: ')}${num(`${LMT}/cbc:PayableAmount * $kur`)}${t(' TL')}`);

/* ------------------------------------------------------------------ bloklar */

const box = (title, body, cls = 'kutu') => `<div class="${cls}"><h4>${t(title)}</h4>${body}</div>`;

export function refs(K, cls) {
    const items = [
        each('$f/cac:OrderReference', `<div><b>${t('Sipariş')}</b>${v('cbc:ID')}${iff('cbc:IssueDate', `${t(' · ')}${dt('cbc:IssueDate')}`)}</div>`),
        each('$f/cac:DespatchDocumentReference', `<div><b>${t('İrsaliye')}</b>${v('cbc:ID')}${t(' · ')}${dt('cbc:IssueDate')}</div>`),
        each('$f/cac:BillingReference/cac:InvoiceDocumentReference', `<div><b>${t(K.billingLabel ?? 'İlgili Fatura')}</b>${v('cbc:ID')}${t(' · ')}${dt('cbc:IssueDate')}</div>`),
        each('$f/cac:AdditionalDocumentReference', `<div><b>${choose(['cbc:DocumentType', etiket('cbc:DocumentType')], [null, etiket('cbc:DocumentTypeCode')])}</b>${v('cbc:ID')}${iff('cbc:DocumentDescription', `<span class="ack">${t(' ')}${v('cbc:DocumentDescription')}</span>`)}</div>`),
    ].join('');
    return iff('$f/cac:OrderReference or $f/cac:DespatchDocumentReference or $f/cac:BillingReference or $f/cac:AdditionalDocumentReference',
        box(K.refTitle ?? 'Belge Bilgileri', `<div class="ref">${items}</div>`, cls));
}

export const period = (K, cls) => iff('$f/cac:InvoicePeriod', box(K.periodTitle ?? 'Hizmet Dönemi', each('$f/cac:InvoicePeriod', [
    `<div>${dt('cbc:StartDate')}${iff('cbc:StartTime', `${t(' ')}${saat('cbc:StartTime')}`)}`,
    iff('cbc:EndDate', `${t(' – ')}${dt('cbc:EndDate')}${iff('cbc:EndTime', `${t(' ')}${saat('cbc:EndTime')}`)}`),
    '</div>',
    iff('cbc:Description', `<div class="ack">${v('cbc:Description')}</div>`),
].join('')), cls));

export const delivery = (cls) => iff('$f/cac:Delivery', box('Teslimat / Kargo', each('$f/cac:Delivery', [
    iff('cac:CarrierParty', `<div>${t('Taşıyıcı: ')}<b>${v('cac:CarrierParty/cac:PartyName/cbc:Name')}</b></div>`),
    iff('cac:DeliveryParty', `<div>${t('Teslim alan: ')}<b>${v('cac:DeliveryParty/cac:PartyName/cbc:Name')}</b></div>`),
    iff('cbc:TrackingID', `<div>${t('Takip No: ')}<b>${v('cbc:TrackingID')}</b></div>`),
    iff('cac:Despatch/cbc:ActualDespatchDate', `<div>${t('Gönderim: ')}${dt('cac:Despatch/cbc:ActualDespatchDate')}${iff('cac:Despatch/cbc:ActualDespatchTime', `${t(' ')}${saat('cac:Despatch/cbc:ActualDespatchTime')}`)}</div>`),
    iff('cbc:ActualDeliveryDate', `<div>${t('Teslim tarihi: ')}${dt('cbc:ActualDeliveryDate')}</div>`),
    iff('cac:DeliveryAddress', `<div class="ack">${v('cac:DeliveryAddress/cbc:StreetName')}${t(' ')}${v('cac:DeliveryAddress/cbc:BuildingNumber')}${t(' · ')}${v('cac:DeliveryAddress/cbc:CitySubdivisionName')}${t(' / ')}${v('cac:DeliveryAddress/cbc:CityName')}</div>`),
].join('')), cls));

export const payment = (cls) => iff('$f/cac:PaymentMeans or $f/cac:PaymentTerms', box('Ödeme Bilgileri', [
    each('$f/cac:PaymentMeans', [
        `<div>${t('Ödeme şekli: ')}<b>${odeme('cbc:PaymentMeansCode')}</b>${iff('cbc:PaymentDueDate', `${t(' · Vade: ')}<b>${dt('cbc:PaymentDueDate')}</b>`)}</div>`,
        iff('cbc:InstructionNote', `<div class="ack">${v('cbc:InstructionNote')}</div>`),
        each('cac:PayeeFinancialAccount', `<div class="iban">${iff('cbc:PaymentNote', `${v('cbc:PaymentNote')}${t(' · ')}`)}<b>${iban('cbc:ID')}</b></div>`),
    ].join('')),
    each('$f/cac:PaymentTerms', `<div class="ack">${v('cbc:Note')}</div>`),
].join(''), cls));

export const notesBox = (cls) => iff("$f/cbc:Note[not(starts-with(.,'Yalnız'))]",
    box('Açıklamalar', `<div class="notlar">${each("$f/cbc:Note[not(starts-with(.,'Yalnız'))]", `<p>${v('.')}</p>`)}</div>`, cls));

/** Yolcu beraberi: aracı kurum (TaxRepresentativeParty). */
export const taxRep = (cls) => iff('$f/cac:TaxRepresentativeParty', box('Aracı Kurum (KDV İadesi)', each('$f/cac:TaxRepresentativeParty', [
    `<div><b>${v('cac:PartyName/cbc:Name')}</b></div>`,
    each('cac:PartyIdentification/cbc:ID', `<div class="ack">${etiket('@schemeID')}${t(': ')}${v('.')}</div>`),
].join('')), cls));

/** İhracat: faturanın muhatabı gümrük idaresi (AccountingCustomerParty) BuyerCustomerParty varken küçük gösterilir. */
export const customs = (cls) => iff('$f/cac:BuyerCustomerParty', box('Fatura Muhatabı', each('$f/cac:AccountingCustomerParty/cac:Party', [
    `<div><b>${pName}</b></div>`,
    `<div class="ack">${pTax()}</div>`,
].join('')), cls));

/** e-İrsaliye sevkiyat bilgileri. */
export const shipment = (cls) => box('Sevkiyat Bilgileri', each('$f/cac:Shipment', `<div class="ref">${[
    iff('cac:ShipmentStage/cac:TransportMeans/cac:RoadTransport/cbc:LicensePlateID', `<div><b>${t('Araç Plakası')}</b>${v('cac:ShipmentStage/cac:TransportMeans/cac:RoadTransport/cbc:LicensePlateID')}</div>`),
    iff('cac:TransportHandlingUnit/cac:TransportEquipment/cbc:ID', `<div><b>${t('Dorse Plakası')}</b>${v('cac:TransportHandlingUnit/cac:TransportEquipment/cbc:ID')}</div>`),
    iff('cac:ShipmentStage/cac:DriverPerson', `<div><b>${t('Şoför')}</b>${v("concat(cac:ShipmentStage/cac:DriverPerson/cbc:FirstName,' ',cac:ShipmentStage/cac:DriverPerson/cbc:FamilyName)")}<span class="ack">${t(' TCKN ')}${v('cac:ShipmentStage/cac:DriverPerson/cbc:NationalityID')}</span></div>`),
    iff('cac:Delivery/cac:CarrierParty', `<div><b>${t('Taşıyıcı Firma')}</b>${v('cac:Delivery/cac:CarrierParty/cac:PartyName/cbc:Name')}</div>`),
    `<div><b>${t('Fiili Sevk')}</b>${dt('cac:Delivery/cac:Despatch/cbc:ActualDespatchDate')}${t(' ')}${saat('cac:Delivery/cac:Despatch/cbc:ActualDespatchTime')}</div>`,
    iff('cbc:GrossWeightMeasure', `<div><b>${t('Brüt Ağırlık')}</b>${qty('cbc:GrossWeightMeasure')}${t(' kg')}</div>`),
    iff('cbc:TotalTransportHandlingUnitQuantity', `<div><b>${t('Kap Adedi')}</b>${v('cbc:TotalTransportHandlingUnitQuantity')}</div>`),
    iff('cac:GoodsItem/cbc:ValueAmount', `<div><b>${t('Mal Bedeli')}</b>${num('cac:GoodsItem/cbc:ValueAmount')}${t(' TL')}</div>`),
    iff('cac:Delivery/cac:DeliveryAddress', `<div class="genis"><b>${t('Teslim Adresi')}</b>${v('cac:Delivery/cac:DeliveryAddress/cbc:StreetName')}${t(' No:')}${v('cac:Delivery/cac:DeliveryAddress/cbc:BuildingNumber')}${t(' · ')}${v('cac:Delivery/cac:DeliveryAddress/cbc:CitySubdivisionName')}${t(' / ')}${v('cac:Delivery/cac:DeliveryAddress/cbc:CityName')}</div>`),
].join('')}</div>`), cls);

/** e-Bilet: dönem (sefer / etkinlik saati) ve koltuk, sefer, peron gibi referanslar büyük alanlar olarak. */
export const ticket = (K) => [
    each('$f/cac:InvoicePeriod', `<div class="bf"><b>${t(K.periodTitle ?? 'Tarih / Saat')}</b><span>${dt('cbc:StartDate')}${t(' ')}${saat('cbc:StartTime')}</span>${iff('cbc:Description', `<i>${v('cbc:Description')}</i>`)}</div>`),
    each('$f/cac:AdditionalDocumentReference', `<div class="bf"><b>${etiket('cbc:DocumentType')}</b><span>${v('cbc:ID')}</span>${iff('cbc:DocumentDescription', `<i>${v('cbc:DocumentDescription')}</i>`)}</div>`),
].join('');

/* ------------------------------------------------------------------ kabuk */

export function shell({ root, comment, title, css, body, labels }) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!--
${comment.trim().split('\n').map((s) => `  ${s.trim()}`).join('\n')}
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:${root}-2"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="n1 cac cbc">
    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="edesign-tr" decimal-separator="," grouping-separator="." NaN=""/>
${helperTemplates(labels)}
    <xsl:template match="/">
        <xsl:variable name="f" select="/n1:${root}"/>
        <xsl:variable name="pb">
            <xsl:choose>
                <xsl:when test="$f/cbc:DocumentCurrencyCode='TRY' or not($f/cbc:DocumentCurrencyCode)">TL</xsl:when>
                <xsl:otherwise><xsl:value-of select="$f/cbc:DocumentCurrencyCode"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="kur" select="$f/cac:PricingExchangeRate/cbc:CalculationRate"/>
        <html lang="tr">
            <head>
                <meta charset="utf-8"/>
                <title>${title} <xsl:value-of select="$f/cbc:ID"/></title>
                <style>
                    @page { size: A4; margin: 0; }
                    * { box-sizing: border-box; }
                    table { font-size: inherit; line-height: inherit; color: inherit; }
                    body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .sayfa { width: 210mm; min-height: 297mm; margin: 0 auto; position: relative; }
${css.trim().split('\n').map((s) => `                    ${s.trim()}`).join('\n')}
                </style>
            </head>
            <body>
${body}
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
`;
}
