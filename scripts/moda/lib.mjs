// Tekstil & ayakkabı hazır şablonlarının ortak parçaları: UBL-TR örnek XML üretici (tutarlar
// satırlardan hesaplanır) ve XSLT yazımında kullanılan küçük yardımcılar.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const HAZIR = join(process.cwd(), 'public', 'ebelge', 'hazir');

/* ------------------------------------------------------------------ XML */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r2 = (x) => Math.round(x * 100 + 1e-7) / 100;
const f2 = (x) => r2(x).toFixed(2);

/** e(tag, attrs?, ...çocuklar) — çocuklar metin, düğüm, dizi veya boş (null/false) olabilir. */
export const e = (tag, ...rest) => {
    const attrs = rest[0] && typeof rest[0] === 'object' && !Array.isArray(rest[0]) && !rest[0].tag ? rest.shift() : {};
    return { tag, attrs, kids: rest.flat(Infinity).filter((k) => k !== null && k !== undefined && k !== false && k !== '') };
};

const ser = (n, ind) => {
    const pad = '    '.repeat(ind);
    const a = Object.entries(n.attrs).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => ` ${k}="${esc(v)}"`).join('');
    if (!n.kids.length) return `${pad}<${n.tag}${a}/>`;
    if (n.kids.every((k) => typeof k !== 'object')) return `${pad}<${n.tag}${a}>${n.kids.map(esc).join('')}</${n.tag}>`;
    return `${pad}<${n.tag}${a}>\n${n.kids.map((k) => (typeof k === 'object' ? ser(k, ind + 1) : `${pad}    ${esc(k)}`)).join('\n')}\n${pad}</${n.tag}>`;
};

const uuidFrom = (seed) => {
    let h = 2166136261;
    const out = [];
    for (let i = 0; out.length < 32; i++) {
        h ^= seed.charCodeAt(i % seed.length) + i;
        h = Math.imul(h, 16777619) >>> 0;
        out.push(((h >>> 7) & 15).toString(16).toUpperCase());
    }
    const s = out.join('');
    return `${s.slice(0, 8)}-${s.slice(8, 12)}-4${s.slice(13, 16)}-A${s.slice(17, 20)}-${s.slice(20, 32)}`;
};

const BIR = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
const ON = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];
const uc = (n) => {
    const y = Math.floor(n / 100);
    return [y ? (y === 1 ? 'Yüz' : `${BIR[y]} Yüz`) : '', ON[Math.floor((n % 100) / 10)], BIR[n % 10]].filter(Boolean).join(' ');
};
const words = (n) => {
    if (!n) return 'Sıfır';
    const names = ['', 'Bin', 'Milyon', 'Milyar'];
    const parts = [];
    for (let i = 0; n > 0; i++, n = Math.floor(n / 1000)) {
        const g = n % 1000;
        if (g) parts.unshift(i === 1 && g === 1 ? 'Bin' : `${uc(g)}${names[i] ? ` ${names[i]}` : ''}`);
    }
    return parts.join(' ');
};
const CUR = {
    TRY: ['Türk Lirası', 'Kuruş'], EUR: ['Avro', 'Sent'], USD: ['ABD Doları', 'Sent'],
    GBP: ['İngiliz Sterlini', 'Peni'], AUD: ['Avustralya Doları', 'Sent'],
};
export const yaziyla = (amt, cur) => {
    const [a, b] = CUR[cur];
    const tam = Math.floor(amt + 1e-7);
    const k = Math.round((amt - tam) * 100);
    return `Yalnız: ${words(tam)} ${a}${k ? ` ${words(k)} ${b}` : ''}`;
};

const address = (a) => a && e('cac:PostalAddress',
    a.street && e('cbc:StreetName', a.street),
    a.bname && e('cbc:BuildingName', a.bname),
    a.no && e('cbc:BuildingNumber', a.no),
    e('cbc:CitySubdivisionName', a.district),
    e('cbc:CityName', a.city),
    a.zip && e('cbc:PostalZone', a.zip),
    e('cac:Country', e('cbc:IdentificationCode', a.cc ?? 'TR'), e('cbc:Name', a.country ?? 'Türkiye')));

/**
 * Taraf: { web, ids: [[şema, no], ...], name, person: [ad, soyad], addr, vd, tel, mail, legal: [ünvan, şirket no] }
 */
export const party = (p, tag = 'cac:Party') => e(tag,
    p.web && e('cbc:WebsiteURI', p.web),
    (p.ids ?? []).map(([scheme, id]) => e('cac:PartyIdentification', e('cbc:ID', { schemeID: scheme }, id))),
    p.name && e('cac:PartyName', e('cbc:Name', p.name)),
    address(p.addr),
    p.vd && e('cac:PartyTaxScheme', e('cac:TaxScheme', e('cbc:Name', p.vd))),
    p.legal && e('cac:PartyLegalEntity', e('cbc:RegistrationName', p.legal[0]), e('cbc:CompanyID', p.legal[1])),
    (p.tel || p.mail) && e('cac:Contact', p.tel && e('cbc:Telephone', p.tel), p.mail && e('cbc:ElectronicMail', p.mail)),
    p.person && e('cac:Person', e('cbc:FirstName', p.person[0]), e('cbc:FamilyName', p.person[1])));

const signature = (s, id) => {
    const vkn = s.ids.find(([k]) => k === 'VKN' || k === 'TCKN');
    return e('cac:Signature',
        e('cbc:ID', { schemeID: 'VKN_TCKN' }, vkn[1]),
        e('cac:SignatoryParty', e('cac:PartyIdentification', e('cbc:ID', { schemeID: vkn[0] }, vkn[1])), address(s.addr)),
        e('cac:DigitalSignatureAttachment', e('cac:ExternalReference', e('cbc:URI', `#Signature_${id}`))));
};

const docRef = (tag, d) => e(tag, e('cbc:ID', d.id), e('cbc:IssueDate', d.date), d.type && e('cbc:DocumentType', d.type), d.desc && e('cbc:DocumentDescription', d.desc));

const props = (o = {}) => Object.entries(o).map(([k, v]) => e('cac:AdditionalItemIdentification', e('cbc:ID', { schemeID: k }, v)));

const item = (l) => e('cac:Item',
    l.desc && e('cbc:Description', l.desc),
    e('cbc:Name', l.name),
    l.brand && e('cbc:BrandName', l.brand),
    l.model && e('cbc:ModelName', l.model),
    l.bid && e('cac:BuyersItemIdentification', e('cbc:ID', l.bid)),
    l.sid && e('cac:SellersItemIdentification', e('cbc:ID', l.sid)),
    props(l.props),
    l.origin && e('cac:OriginCountry', e('cbc:IdentificationCode', l.origin[0]), e('cbc:Name', l.origin[1])));

const kdvScheme = (ex) => e('cac:TaxCategory',
    ex && e('cbc:TaxExemptionReasonCode', ex.code),
    ex && e('cbc:TaxExemptionReason', ex.reason),
    e('cac:TaxScheme', e('cbc:Name', 'KDV'), e('cbc:TaxTypeCode', '0015')));

const withholdingNode = (w, base, amount, cur) => e('cac:WithholdingTaxTotal',
    e('cbc:TaxAmount', { currencyID: cur }, f2(amount)),
    e('cac:TaxSubtotal',
        e('cbc:TaxableAmount', { currencyID: cur }, f2(base)),
        e('cbc:TaxAmount', { currencyID: cur }, f2(amount)),
        e('cbc:Percent', String(w.pct)),
        e('cac:TaxCategory', e('cac:TaxScheme', e('cbc:Name', w.name), e('cbc:TaxTypeCode', w.code)))));

const NS = {
    Invoice: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
    DespatchAdvice: 'urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2',
};
const rootAttrs = (root) => ({
    xmlns: NS[root],
    'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
    'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
    'xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
});
const ext = () => e('ext:UBLExtensions', e('ext:UBLExtension', e('ext:ExtensionContent')));
const wrap = (comment, node) => `<?xml version="1.0" encoding="UTF-8"?>\n<!--\n${comment.trim().split('\n').map((s) => `  ${s.trim()}`).join('\n')}\n  Tüm kişi ve firma bilgileri kurgusaldır.\n-->\n${ser(node, 0)}\n`;

/** Fatura (e-Fatura / e-Arşiv / e-İhracat / mikro ihracat) örneği; tüm tutarlar satırlardan hesaplanır. */
export function invoice(d) {
    const cur = d.currency ?? 'TRY';
    const lines = d.lines.map((l, i) => {
        const gross = r2(l.qty * l.price);
        const da = l.disc ? r2(gross * l.disc.rate) : 0;
        const net = r2(gross - da);
        const pct = d.exemption ? 0 : (l.kdv ?? 20);
        const kdv = r2((net * pct) / 100);
        const wh = d.withholding ? r2((kdv * d.withholding.pct) / 100) : 0;
        return { ...l, no: i + 1, gross, da, net, pct, kdv, wh };
    });
    const sum = (k) => r2(lines.reduce((a, l) => a + l[k], 0));
    const gross = sum('gross');
    const disc = sum('da');
    const net = sum('net');
    const kdv = sum('kdv');
    const wh = sum('wh');
    const inclusive = r2(net + kdv);
    const payable = r2(inclusive - wh);
    const rates = [...new Set(lines.map((l) => l.pct))];
    const notes = [yaziyla(payable, cur), ...(d.notes ?? [])];

    const node = e('Invoice', rootAttrs('Invoice'),
        ext(),
        e('cbc:UBLVersionID', '2.1'),
        e('cbc:CustomizationID', 'TR1.2'),
        e('cbc:ProfileID', d.profile),
        e('cbc:ID', d.id),
        e('cbc:CopyIndicator', 'false'),
        e('cbc:UUID', uuidFrom(d.id)),
        e('cbc:IssueDate', d.date),
        e('cbc:IssueTime', d.time),
        e('cbc:InvoiceTypeCode', d.type),
        notes.map((n) => e('cbc:Note', n)),
        e('cbc:DocumentCurrencyCode', cur),
        e('cbc:LineCountNumeric', String(lines.length)),
        d.order && docRef('cac:OrderReference', d.order),
        (d.despatch ?? []).map((x) => docRef('cac:DespatchDocumentReference', x)),
        (d.docs ?? []).map((x) => docRef('cac:AdditionalDocumentReference', x)),
        signature(d.supplier, d.id),
        e('cac:AccountingSupplierParty', party(d.supplier)),
        e('cac:AccountingCustomerParty', party(d.customer)),
        d.buyer && e('cac:BuyerCustomerParty', party(d.buyer)),
        d.delivery && e('cac:Delivery',
            d.delivery.tracking && e('cbc:TrackingID', d.delivery.tracking),
            d.delivery.addr && e('cac:DeliveryAddress', address(d.delivery.addr).kids),
            d.delivery.carrier && party(d.delivery.carrier, 'cac:CarrierParty'),
            e('cac:Despatch', e('cbc:ActualDespatchDate', d.delivery.date), d.delivery.time && e('cbc:ActualDespatchTime', d.delivery.time))),
        d.payment && e('cac:PaymentMeans',
            e('cbc:PaymentMeansCode', d.payment.code ?? '42'),
            d.payment.due && e('cbc:PaymentDueDate', d.payment.due),
            d.payment.note && e('cbc:InstructionNote', d.payment.note),
            d.payment.iban && e('cac:PayeeFinancialAccount',
                e('cbc:ID', d.payment.iban),
                e('cbc:CurrencyCode', d.payment.ibanCur ?? cur),
                d.payment.bank && e('cbc:PaymentNote', d.payment.bank))),
        d.terms && e('cac:PaymentTerms', e('cbc:Note', d.terms)),
        cur !== 'TRY' && e('cac:PricingExchangeRate',
            e('cbc:SourceCurrencyCode', cur), e('cbc:TargetCurrencyCode', 'TRY'),
            e('cbc:CalculationRate', String(d.rate)), e('cbc:Date', d.date)),
        e('cac:TaxTotal',
            e('cbc:TaxAmount', { currencyID: cur }, f2(kdv)),
            rates.map((p, i) => {
                const g = lines.filter((l) => l.pct === p);
                return e('cac:TaxSubtotal',
                    e('cbc:TaxableAmount', { currencyID: cur }, f2(g.reduce((a, l) => a + l.net, 0))),
                    e('cbc:TaxAmount', { currencyID: cur }, f2(g.reduce((a, l) => a + l.kdv, 0))),
                    e('cbc:CalculationSequenceNumeric', String(i + 1)),
                    e('cbc:Percent', String(p)),
                    kdvScheme(d.exemption));
            })),
        d.withholding && withholdingNode(d.withholding, kdv, wh, cur),
        e('cac:LegalMonetaryTotal',
            e('cbc:LineExtensionAmount', { currencyID: cur }, f2(gross)),
            e('cbc:TaxExclusiveAmount', { currencyID: cur }, f2(net)),
            e('cbc:TaxInclusiveAmount', { currencyID: cur }, f2(inclusive)),
            e('cbc:AllowanceTotalAmount', { currencyID: cur }, f2(disc)),
            e('cbc:PayableAmount', { currencyID: cur }, f2(payable))),
        lines.map((l) => e('cac:InvoiceLine',
            e('cbc:ID', String(l.no)),
            l.note && e('cbc:Note', l.note),
            e('cbc:InvoicedQuantity', { unitCode: l.unit ?? 'C62' }, String(l.qty)),
            e('cbc:LineExtensionAmount', { currencyID: cur }, f2(l.net)),
            l.exp && e('cac:Delivery',
                e('cac:DeliveryAddress', address(l.exp.addr ?? d.buyer?.addr).kids),
                e('cac:DeliveryTerms', e('cbc:ID', { schemeID: 'INCOTERMS' }, l.exp.incoterm)),
                e('cac:Shipment',
                    e('cbc:ID'),
                    e('cac:GoodsItem', e('cbc:RequiredCustomsID', l.exp.gtip)),
                    e('cac:ShipmentStage', e('cbc:TransportModeCode', String(l.exp.mode))),
                    l.exp.pkg && e('cac:TransportHandlingUnit', e('cac:ActualPackage',
                        e('cbc:ID', l.exp.pkg[0]), e('cbc:Quantity', String(l.exp.pkg[1])), e('cbc:PackagingTypeCode', l.exp.pkg[2] ?? 'CT'))))),
            l.disc && e('cac:AllowanceCharge',
                e('cbc:ChargeIndicator', 'false'),
                e('cbc:AllowanceChargeReason', l.disc.reason),
                e('cbc:MultiplierFactorNumeric', String(l.disc.rate)),
                e('cbc:Amount', { currencyID: cur }, f2(l.da)),
                e('cbc:BaseAmount', { currencyID: cur }, f2(l.gross))),
            e('cac:TaxTotal',
                e('cbc:TaxAmount', { currencyID: cur }, f2(l.kdv)),
                e('cac:TaxSubtotal',
                    e('cbc:TaxableAmount', { currencyID: cur }, f2(l.net)),
                    e('cbc:TaxAmount', { currencyID: cur }, f2(l.kdv)),
                    e('cbc:Percent', String(l.pct)),
                    kdvScheme(null))),
            d.withholding && withholdingNode(d.withholding, l.kdv, l.wh, cur),
            item(l),
            e('cac:Price', e('cbc:PriceAmount', { currencyID: cur }, String(l.price))))));
    return wrap(d.comment, node);
}

/** e-İrsaliye (DespatchAdvice) örneği. */
export function despatch(d) {
    const s = d.ship;
    const node = e('DespatchAdvice', rootAttrs('DespatchAdvice'),
        ext(),
        e('cbc:UBLVersionID', '2.1'),
        e('cbc:CustomizationID', 'TR1.2.1'),
        e('cbc:ProfileID', d.profile ?? 'TEMELIRSALIYE'),
        e('cbc:ID', d.id),
        e('cbc:CopyIndicator', 'false'),
        e('cbc:UUID', uuidFrom(d.id)),
        e('cbc:IssueDate', d.date),
        e('cbc:IssueTime', d.time),
        e('cbc:DespatchAdviceTypeCode', 'SEVK'),
        (d.notes ?? []).map((n) => e('cbc:Note', n)),
        e('cbc:LineCountNumeric', String(d.lines.length)),
        d.order && docRef('cac:OrderReference', d.order),
        (d.docs ?? []).map((x) => docRef('cac:AdditionalDocumentReference', x)),
        signature(d.supplier, d.id),
        e('cac:DespatchSupplierParty', party(d.supplier), d.contact && e('cac:DespatchContact', e('cbc:Name', d.contact))),
        e('cac:DeliveryCustomerParty', party(d.customer)),
        d.buyer && e('cac:BuyerCustomerParty', party(d.buyer)),
        e('cac:Shipment',
            e('cbc:ID', s.id),
            s.kg && e('cbc:GrossWeightMeasure', { unitCode: 'KGM' }, s.kg.toFixed(3)),
            s.goods && e('cbc:TotalGoodsItemQuantity', String(s.goods)),
            s.units && e('cbc:TotalTransportHandlingUnitQuantity', String(s.units)),
            s.value && e('cac:GoodsItem', e('cbc:ValueAmount', { currencyID: 'TRY' }, f2(s.value))),
            e('cac:ShipmentStage',
                s.plate && e('cac:TransportMeans', e('cac:RoadTransport', e('cbc:LicensePlateID', { schemeID: 'PLAKA' }, s.plate))),
                s.driver && e('cac:DriverPerson',
                    e('cbc:FirstName', s.driver[0]), e('cbc:FamilyName', s.driver[1]), e('cbc:Title', 'Şoför'), e('cbc:NationalityID', s.driver[2]))),
            e('cac:Delivery',
                address(s.addr) && e('cac:DeliveryAddress', address(s.addr).kids),
                s.carrier && party(s.carrier, 'cac:CarrierParty'),
                e('cac:Despatch', e('cbc:ActualDespatchDate', s.date), e('cbc:ActualDespatchTime', s.time))),
            s.trailer && e('cac:TransportHandlingUnit', e('cac:TransportEquipment', e('cbc:ID', { schemeID: 'DORSEPLAKA' }, s.trailer)))),
        d.lines.map((l, i) => e('cac:DespatchLine',
            e('cbc:ID', String(i + 1)),
            l.note && e('cbc:Note', l.note),
            e('cbc:DeliveredQuantity', { unitCode: l.unit ?? 'C62' }, String(l.qty)),
            e('cac:OrderLineReference', e('cbc:LineID', String(i + 1))),
            item(l))));
    return wrap(d.comment, node);
}

/* ------------------------------------------------------------------ XSLT */

const xesc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const v = (s) => `<xsl:value-of select="${s}"/>`;
export const t = (s) => `<xsl:text>${xesc(s)}</xsl:text>`;
export const num = (s, p = '###.##0,00') => `<xsl:value-of select="format-number(${s}, '${p}', 'edesign-tr')"/>`;
export const int = (s) => num(s, '###.##0');
export const dt = (s) => `<xsl:call-template name="tarih"><xsl:with-param name="d" select="${s}"/></xsl:call-template>`;
export const unit = (s) => `<xsl:call-template name="birim"><xsl:with-param name="u" select="${s}"/></xsl:call-template>`;
export const iban = (s) => `<xsl:call-template name="iban"><xsl:with-param name="i" select="${s}"/></xsl:call-template>`;
export const each = (s, b) => `<xsl:for-each select="${s}">${b}</xsl:for-each>`;
export const iff = (test, b) => `<xsl:if test="${test}">${b}</xsl:if>`;
export const choose = (...cases) => `<xsl:choose>${cases.map(([test, b]) => (test ? `<xsl:when test="${test}">${b}</xsl:when>` : `<xsl:otherwise>${b}</xsl:otherwise>`)).join('')}</xsl:choose>`;
export const attr = (name, b) => `<xsl:attribute name="${name}">${b}</xsl:attribute>`;
/** Satır bağlamında ek ürün tanımı (AdditionalItemIdentification) yolu. */
export const P = (k) => `cac:Item/cac:AdditionalItemIdentification/cbc:ID[@schemeID='${k}']`;
/** Şeması verilen önekle başlayan ek tanımlar (ör. NUMARA-38, BEDEN-M). */
export const PS = (prefix) => `cac:Item/cac:AdditionalItemIdentification/cbc:ID[starts-with(@schemeID,'${prefix}')]`;
export const money = (s) => `${num(s)}${t(' ')}${v('$pb')}`;

/** Fatura / irsaliye tarafı (Party bağlamında). */
export const pName = choose(['cac:PartyName/cbc:Name', v('cac:PartyName/cbc:Name')], [null, v("concat(cac:Person/cbc:FirstName,' ',cac:Person/cbc:FamilyName)")]);
export const pAddr = (sep = ' · ') => [
    v('cac:PostalAddress/cbc:StreetName'),
    iff('cac:PostalAddress/cbc:BuildingName', `${t(' ')}${v('cac:PostalAddress/cbc:BuildingName')}`),
    iff('cac:PostalAddress/cbc:BuildingNumber', `${t(' No:')}${v('cac:PostalAddress/cbc:BuildingNumber')}`),
    t(sep),
    iff('cac:PostalAddress/cbc:PostalZone', `${v('cac:PostalAddress/cbc:PostalZone')}${t(' ')}`),
    v('cac:PostalAddress/cbc:CitySubdivisionName'), t(' / '), v('cac:PostalAddress/cbc:CityName'),
    iff("cac:PostalAddress/cac:Country/cbc:Name!='Türkiye'", `${t(' · ')}${v('cac:PostalAddress/cac:Country/cbc:Name')}`),
].join('');
export const pIdSel = "cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']";
export const pTax = (sep = ' · ') => [
    v(`${pIdSel}/@schemeID`), t(' '), v(pIdSel),
    iff('cac:PartyTaxScheme/cac:TaxScheme/cbc:Name', `${t(sep)}${v('cac:PartyTaxScheme/cac:TaxScheme/cbc:Name')}${t(' V.D.')}`),
    iff("cac:PartyIdentification/cbc:ID[@schemeID='MERSISNO']", `${t(`${sep}MERSİS `)}${v("cac:PartyIdentification/cbc:ID[@schemeID='MERSISNO']")}`),
].join('');
export const pContact = (sep = ' · ') => [
    v('cac:Contact/cbc:Telephone'),
    iff('cac:Contact/cbc:ElectronicMail', `${t(sep)}${v('cac:Contact/cbc:ElectronicMail')}`),
    iff('cbc:WebsiteURI', `${t(sep)}${v('cbc:WebsiteURI')}`),
].join('');

export const SUP = '$f/cac:AccountingSupplierParty/cac:Party';
export const CUS = '$f/cac:AccountingCustomerParty/cac:Party';
export const BUY = '$f/cac:BuyerCustomerParty/cac:Party';
export const DSUP = '$f/cac:DespatchSupplierParty/cac:Party';
export const DCUS = '$f/cac:DeliveryCustomerParty/cac:Party';
export const LMT = '$f/cac:LegalMonetaryTotal';

/** Yalnız (yazıyla) notu ve diğer notlar. */
export const yalniz = (b) => each("$f/cbc:Note[starts-with(.,'Yalnız')]", b);
export const notes = (b) => each("$f/cbc:Note[not(starts-with(.,'Yalnız'))]", b);

/**
 * Standart toplam satırları: row(etiket, tutar, sınıf) → HTML. Ödenecek tutar şablonun kendi bloğunda gösterilir.
 */
export const totals = (row) => [
    row(t('Mal / Hizmet Toplamı'), money(`${LMT}/cbc:LineExtensionAmount`), ''),
    iff(`${LMT}/cbc:AllowanceTotalAmount &gt; 0`, row(t('Toplam İskonto'), `${t('− ')}${money(`${LMT}/cbc:AllowanceTotalAmount`)}`, 'isk')),
    each('$f/cac:TaxTotal/cac:TaxSubtotal', choose(
        ['cac:TaxCategory/cbc:TaxExemptionReasonCode', row(`${t('KDV İstisnası (')}${v('cac:TaxCategory/cbc:TaxExemptionReasonCode')}${t(')')}`, money('cbc:TaxAmount'), 'ist')],
        [null, row(`${t('Hesaplanan KDV (%')}${v('cbc:Percent')}${t(')')}`, money('cbc:TaxAmount'), '')],
    )),
    each('$f/cac:WithholdingTaxTotal/cac:TaxSubtotal', row(`${t('KDV Tevkifatı (')}${v('cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode')}${t(' · ')}${v('cbc:Percent div 10')}${t('/10)')}`, `${t('− ')}${money('cbc:TaxAmount')}`, 'tvk')),
    row(t('Vergiler Dahil Toplam'), money(`${LMT}/cbc:TaxInclusiveAmount`), 'ara'),
    kurRows(row, 'tvk'),
].join('');

const kurTl = (s) => `${num(`${s} * $kur`)}${t(' TL')}`;
/** 1 EUR = 49,9120 TL (TCMB döviz alış, 08.10.2026); kur tarihi yoksa belge tarihi. */
export const kurMetni = () => `${t('1 ')}${v('$f/cbc:DocumentCurrencyCode')}${t(' = ')}${num('$kur', '###.##0,0000')}${t(' TL (TCMB döviz alış, ')}${choose(['$f/cac:PricingExchangeRate/cbc:Date', dt('$f/cac:PricingExchangeRate/cbc:Date')], [null, dt('$f/cbc:IssueDate')])}${t(')')}`;

/** Döviz cinsinden belgede günün kuruyla TL karşılıkları (VUK: döviz faturada TL karşılığı gösterilir); row(etiket, tutar, sınıf). */
export const kurRows = (row, negCls) => iff('$kur', [
    row(`<b>${t('TL Karşılıkları')}</b><div style="font-weight:400;font-size:0.9em;opacity:0.8">${kurMetni()}</div>`, '', 'kur'),
    row(t('Mal / Hizmet Toplamı (TL)'), kurTl(`${LMT}/cbc:LineExtensionAmount`), ''),
    iff(`${LMT}/cbc:AllowanceTotalAmount &gt; 0`, row(t('Toplam İskonto (TL)'), `${t('− ')}${kurTl(`${LMT}/cbc:AllowanceTotalAmount`)}`, negCls)),
    row(t('Hesaplanan KDV (TL)'), kurTl("sum($f/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015']/cbc:TaxAmount)"), ''),
    iff('$f/cac:WithholdingTaxTotal', row(t('KDV Tevkifatı (TL)'), `${t('− ')}${kurTl('sum($f/cac:WithholdingTaxTotal/cbc:TaxAmount)')}`, negCls)),
    row(t('Vergiler Dahil Toplam (TL)'), kurTl(`${LMT}/cbc:TaxInclusiveAmount`), ''),
    row(t('Ödenecek Tutar (TL)'), kurTl(`${LMT}/cbc:PayableAmount`), 'ara'),
].join(''));

/** İhracat satırı (InvoiceLine bağlamında) teslim / gümrük alanları. */
export const LX = {
    incoterm: 'cac:Delivery/cac:DeliveryTerms/cbc:ID',
    gtip: 'cac:Delivery/cac:Shipment/cac:GoodsItem/cbc:RequiredCustomsID',
    mode: 'cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode',
    pkg: 'cac:Delivery/cac:Shipment/cac:TransportHandlingUnit/cac:ActualPackage',
};
export const LX1 = Object.fromEntries(Object.entries(LX).map(([k, s]) => [k, `$f/cac:InvoiceLine[1]/${s}`]));
/** 12 haneli GTİP → 6403.99.93.00.00 */
export const gtip = (s) => v(`concat(substring(${s},1,4),'.',substring(${s},5,2),'.',substring(${s},7,2),'.',substring(${s},9,2),'.',substring(${s},11,2))`);
export const tasima = (s, en = false) => choose(
    [`${s}='1'`, t(en ? 'Sea' : 'Denizyolu')], [`${s}='2'`, t(en ? 'Rail' : 'Demiryolu')], [`${s}='3'`, t(en ? 'Road' : 'Karayolu')],
    [`${s}='4'`, t(en ? 'Air' : 'Havayolu')], [`${s}='5'`, t(en ? 'Post' : 'Posta')], [null, v(s)]);
export const kap = (s) => choose(
    [`${s}='CT'`, t('Koli')], [`${s}='RO'`, t('Top')], [`${s}='PK'`, t('Paket')], [`${s}='BX'`, t('Kutu')],
    [`${s}='BG'`, t('Torba')], [`${s}='PX'`, t('Palet')], [null, v(s)]);
/** Ödenecek tutarın TL karşılığı (kurla). */
export const tlKarsilik = () => num(`${LMT}/cbc:PayableAmount * $kur`);

/** Banka hesabı (PayeeFinancialAccount) bağlamında içerik. */
export const bank = (b) => each('$f/cac:PaymentMeans/cac:PayeeFinancialAccount', b);

const SRC = readFileSync(join(HAZIR, 'tekstil-fason-fatura.xslt'), 'utf8');
const QR = SRC.match(/<div data-xslt-obj="obj-karekod"[\s\S]*?<\/script><\/div>/)[0];
/** GİB karekodu (fatura / irsaliye otomatik ayırt edilir). */
export const qr = (size = 96, extra = '') => QR.replace(/style="[^"]*"/, `style="width:${size}px;height:${size}px;${extra}"`);

/** SVG'yi img src için veri adresine çevirir (XSLT öznitelik şablonundaki { } kaçışı dahil). */
export const svg = (s) => `data:image/svg+xml,${s.replace(/\s+/g, ' ').trim()
    .replace(/"/g, "'").replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E').replace(/\{/g, '%7B').replace(/\}/g, '%7D')}`;
export const logo = (s, w, h, extra = '') => `<img data-xslt-obj="obj-logo" alt="Logo" width="${w}" height="${h}"${extra} src="${svg(s)}"/>`;

const HELPERS = `
    <xsl:template name="tarih">
        <xsl:param name="d"/>
        <xsl:if test="string-length($d) &gt;= 10"><xsl:value-of select="concat(substring($d,9,2),'.',substring($d,6,2),'.',substring($d,1,4))"/></xsl:if>
    </xsl:template>
    <xsl:template name="iban">
        <xsl:param name="i"/>
        <xsl:value-of select="concat(substring($i,1,4),' ',substring($i,5,4),' ',substring($i,9,4),' ',substring($i,13,4),' ',substring($i,17,4),' ',substring($i,21,4),' ',substring($i,25,4))"/>
    </xsl:template>
    <xsl:template name="birim">
        <xsl:param name="u"/>
        <xsl:choose>
            <xsl:when test="$u='C62'">adet</xsl:when>
            <xsl:when test="$u='PR'">çift</xsl:when>
            <xsl:when test="$u='MTR'">m</xsl:when>
            <xsl:when test="$u='MTK'">m²</xsl:when>
            <xsl:when test="$u='FTK'">ft²</xsl:when>
            <xsl:when test="$u='KGM'">kg</xsl:when>
            <xsl:when test="$u='SET'">set</xsl:when>
            <xsl:when test="$u='BX'">koli</xsl:when>
            <xsl:when test="$u='DZN'">düzine</xsl:when>
            <xsl:otherwise><xsl:value-of select="$u"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>`;

/**
 * Tam XSLT: kök (Invoice / DespatchAdvice), açıklama, CSS ve gövde. $f belge kökü, $pb para birimi
 * (TRY → TL), $kur fiyatlandırma kuru.
 */
export function xslt({ root = 'Invoice', comment, title, css, body, templates = '' }) {
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
${HELPERS}
${templates}
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
