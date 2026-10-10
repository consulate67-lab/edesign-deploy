/**
 * Ülke + belge türü + belge dili için örnek UBL 2.1 XML'i üretir. Tutarlar
 * EN 16931 hesap kurallarına (BR-CO-10…16, BR-S-08) ve Peppol R040/R120
 * kontrollerine uyacak şekilde hesaplanır.
 */
import { findCountry, type CountryCode } from '../registry/countryProfiles';
import type { DocLanguage } from '../registry/docLanguages';
import { KIND_SPECS } from '../registry/countryDocuments';
import { docTextPack, type IntlDocKind, type SampleTexts } from '../docText';
import { COUNTRY_SAMPLES, type CountrySample, type SampleParty } from './countrySamples';

const NS = {
    Invoice: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
    CreditNote: 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
    DespatchAdvice: 'urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2',
};
const CAC = 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2';
const CBC = 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2';

const EN16931 = 'urn:cen.eu:en16931:2017';
const PEPPOL_PROFILE = 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0';
const CUSTOMIZATION: Record<string, { id: string; profile?: string }> = {
    'de-xrechnung-ubl': { id: `${EN16931}#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0`, profile: PEPPOL_PROFILE },
    'peppol-bis-billing-3': { id: `${EN16931}#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0`, profile: PEPPOL_PROFILE },
    'ro-cius': { id: `${EN16931}#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1` },
    'hr-cius': { id: `${EN16931}#compliant#urn:mfin.gov.hr:cius-2025:1.0#conformant#urn:mfin.gov.hr:ext-2025:1.0`, profile: 'P1' },
    'pt-cius-pt': { id: `${EN16931}#compliant#urn:feap.gov.pt:CIUS-PT:2.1.1` },
    'en16931-ubl': { id: EN16931 },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const money = (n: number) => round2(n).toFixed(2);
const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));

const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

/** EUR fiyatını yerel para birimine çevirip yuvarlar. */
const localPrice = (eur: number, scale: number) => {
    if (scale === 1) return eur;
    const v = eur * scale;
    const step = v >= 1000 ? 10 : v >= 100 ? 1 : 0.5;
    return round2(Math.round(v / step) * step);
};

interface Line { name: string; desc?: string; qty: number; unit: string; price: number; itemId?: string }

const el = (tag: string, value: string | number, attrs = '') => `<${tag}${attrs}>${esc(String(value))}</${tag}>`;
const amt = (tag: string, value: number, cur: string) => el(tag, money(value), ` currencyID="${cur}"`);

const address = (a: SampleParty, country: string) => [
    '<cac:PostalAddress>',
    el('cbc:StreetName', a.street),
    el('cbc:CityName', a.city),
    el('cbc:PostalZone', a.postal),
    `<cac:Country>${el('cbc:IdentificationCode', country)}</cac:Country>`,
    '</cac:PostalAddress>',
].join('');

const party = (a: SampleParty, country: string, withTax: boolean) => [
    '<cac:Party>',
    el('cbc:EndpointID', a.endpoint[1], ` schemeID="${a.endpoint[0]}"`),
    `<cac:PartyName>${el('cbc:Name', a.name)}</cac:PartyName>`,
    address(a, country),
    withTax ? `<cac:PartyTaxScheme>${el('cbc:CompanyID', a.vat)}<cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>` : '',
    '<cac:PartyLegalEntity>',
    el('cbc:RegistrationName', a.legal),
    a.reg ? el('cbc:CompanyID', a.reg[1], a.reg[0] ? ` schemeID="${a.reg[0]}"` : '') : '',
    '</cac:PartyLegalEntity>',
    a.contact ? `<cac:Contact>${el('cbc:Name', a.contact[0])}${el('cbc:Telephone', a.contact[1])}${el('cbc:ElectronicMail', a.contact[2])}</cac:Contact>` : '',
    '</cac:Party>',
].join('');

const taxCategory = (tag: 'cac:TaxCategory' | 'cac:ClassifiedTaxCategory', rate: number) =>
    `<${tag}><cbc:ID>S</cbc:ID>${el('cbc:Percent', rate)}<cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></${tag}>`;

/** Ürün, saatlik hizmet ve aksesuar kalemleri (yerel fiyatlarla). */
const baseLines = (t: SampleTexts, s: CountrySample): Line[] => [
    { name: t.product, desc: t.productDesc, qty: 4, unit: 'C62', price: localPrice(289, s.scale), itemId: 'ERG-CH-120' },
    { name: t.service, qty: 6, unit: 'HUR', price: localPrice(65, s.scale) },
    { name: t.accessory, qty: 2, unit: 'C62', price: localPrice(24.5, s.scale), itemId: 'MAT-150' },
];

function billing(country: CountryCode, kind: IntlDocKind, lang: DocLanguage, profileId: string): string {
    const s = COUNTRY_SAMPLES[country];
    const t = docTextPack(lang).sample;
    const cur = findCountry(country)?.currency ?? 'EUR';
    const spec = KIND_SPECS[kind];
    const credit = spec.root === 'CreditNote';
    const custom = CUSTOMIZATION[profileId] ?? CUSTOMIZATION['en16931-ubl'];
    const today = new Date();
    const year = today.getFullYear();
    const invoiceNo = `${s.prefix}-${year}-0418`;
    const order = `PO-${year}-3310`;

    const full = baseLines(t, s);
    const fullNet = full.reduce((n, l) => n + round2(l.qty * l.price), 0);
    const lines: Line[] = kind === 'credit' ? [{ ...full[0], qty: 1 }]
        : kind === 'partial' ? [full[1]]
            : kind === 'prepayment' ? [{ name: fill(t.prepaymentItem, { pct: 30 }), qty: 1, unit: 'C62', price: round2(fullNet * 0.3) }]
                : full;
    const note = { invoice: t.note, credit: t.creditNote, corrected: t.correctedNote, prepayment: fill(t.prepaymentNote, { order }), partial: t.partialNote, selfbilled: t.note, despatch: t.note }[kind];
    const id = { invoice: invoiceNo, credit: `${s.prefix}-${year}-0419`, corrected: `${s.prefix}-${year}-0420`, prepayment: `${s.prefix}-${year}-0402`, partial: `${s.prefix}-${year}-0410`, selfbilled: `${s.prefix}-${year}-0421`, despatch: '' }[kind];

    const lineSum = round2(lines.reduce((n, l) => n + round2(l.qty * l.price), 0));
    const discount = kind === 'invoice' ? round2(lineSum * 0.05) : 0;
    const taxable = round2(lineSum - discount);
    const tax = round2(taxable * s.rate / 100);
    const total = round2(taxable + tax);
    const root = spec.root;
    const lineTag = credit ? 'CreditNoteLine' : 'InvoiceLine';
    const qtyTag = credit ? 'CreditedQuantity' : 'InvoicedQuantity';

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<${root} xmlns="${NS[root]}" xmlns:cac="${CAC}" xmlns:cbc="${CBC}">`,
        el('cbc:CustomizationID', custom.id),
        custom.profile ? el('cbc:ProfileID', custom.profile) : '',
        el('cbc:ID', id),
        el('cbc:IssueDate', isoDate(today)),
        credit ? '' : el('cbc:DueDate', isoDate(addDays(today, 30))),
        el(credit ? 'cbc:CreditNoteTypeCode' : 'cbc:InvoiceTypeCode', spec.typeCode ?? '380'),
        el('cbc:Note', note),
        el('cbc:DocumentCurrencyCode', cur),
        el('cbc:BuyerReference', s.buyerRef ?? order),
        `<cac:OrderReference>${el('cbc:ID', order)}</cac:OrderReference>`,
        kind === 'credit' || kind === 'corrected'
            ? `<cac:BillingReference><cac:InvoiceDocumentReference>${el('cbc:ID', invoiceNo)}${el('cbc:IssueDate', isoDate(addDays(today, -14)))}</cac:InvoiceDocumentReference></cac:BillingReference>`
            : '',
        `<cac:AccountingSupplierParty>${party(s.seller, country, true)}</cac:AccountingSupplierParty>`,
        `<cac:AccountingCustomerParty>${party(s.buyer, country, true)}</cac:AccountingCustomerParty>`,
        `<cac:Delivery>${el('cbc:ActualDeliveryDate', isoDate(addDays(today, -2)))}<cac:DeliveryLocation><cac:Address>${el('cbc:StreetName', s.buyer.street)}${el('cbc:CityName', s.buyer.city)}${el('cbc:PostalZone', s.buyer.postal)}<cac:Country>${el('cbc:IdentificationCode', country)}</cac:Country></cac:Address></cac:DeliveryLocation></cac:Delivery>`,
        '<cac:PaymentMeans>',
        el('cbc:PaymentMeansCode', cur === 'EUR' ? '58' : '30'),
        el('cbc:PaymentID', id),
        `<cac:PayeeFinancialAccount>${el('cbc:ID', s.iban)}${el('cbc:Name', s.seller.legal)}<cac:FinancialInstitutionBranch>${el('cbc:ID', s.bic)}</cac:FinancialInstitutionBranch></cac:PayeeFinancialAccount>`,
        '</cac:PaymentMeans>',
        `<cac:PaymentTerms>${el('cbc:Note', t.paymentTerms)}</cac:PaymentTerms>`,
        discount
            ? `<cac:AllowanceCharge><cbc:ChargeIndicator>false</cbc:ChargeIndicator><cbc:AllowanceChargeReasonCode>95</cbc:AllowanceChargeReasonCode>${el('cbc:AllowanceChargeReason', t.discount)}<cbc:MultiplierFactorNumeric>5</cbc:MultiplierFactorNumeric>${amt('cbc:Amount', discount, cur)}${amt('cbc:BaseAmount', lineSum, cur)}${taxCategory('cac:TaxCategory', s.rate)}</cac:AllowanceCharge>`
            : '',
        `<cac:TaxTotal>${amt('cbc:TaxAmount', tax, cur)}<cac:TaxSubtotal>${amt('cbc:TaxableAmount', taxable, cur)}${amt('cbc:TaxAmount', tax, cur)}${taxCategory('cac:TaxCategory', s.rate)}</cac:TaxSubtotal></cac:TaxTotal>`,
        '<cac:LegalMonetaryTotal>',
        amt('cbc:LineExtensionAmount', lineSum, cur),
        amt('cbc:TaxExclusiveAmount', taxable, cur),
        amt('cbc:TaxInclusiveAmount', total, cur),
        discount ? amt('cbc:AllowanceTotalAmount', discount, cur) : '',
        amt('cbc:PayableAmount', total, cur),
        '</cac:LegalMonetaryTotal>',
        ...lines.map((l, i) => [
            `<cac:${lineTag}>`,
            el('cbc:ID', i + 1),
            el(`cbc:${qtyTag}`, l.qty, ` unitCode="${l.unit}"`),
            amt('cbc:LineExtensionAmount', l.qty * l.price, cur),
            '<cac:Item>',
            l.desc ? el('cbc:Description', l.desc) : '',
            el('cbc:Name', l.name),
            l.itemId ? `<cac:SellersItemIdentification>${el('cbc:ID', l.itemId)}</cac:SellersItemIdentification>` : '',
            taxCategory('cac:ClassifiedTaxCategory', s.rate),
            '</cac:Item>',
            `<cac:Price>${amt('cbc:PriceAmount', l.price, cur)}</cac:Price>`,
            `</cac:${lineTag}>`,
        ].join('')),
        `</${root}>`,
    ].filter(Boolean).join('\n');
}

function despatch(country: CountryCode, lang: DocLanguage): string {
    const s = COUNTRY_SAMPLES[country];
    const t = docTextPack(lang).sample;
    const today = new Date();
    const year = today.getFullYear();
    const order = `PO-${year}-3310`;
    const lines = [
        { name: t.product, desc: t.productDesc, qty: 4, backorder: 0, itemId: 'ERG-CH-120', gtin: '04012345000017' },
        { name: t.accessory, qty: 2, backorder: 1, itemId: 'MAT-150', gtin: '04012345000024' },
    ];
    const despatchParty = (a: SampleParty) => [
        '<cac:Party>',
        el('cbc:EndpointID', a.endpoint[1], ` schemeID="${a.endpoint[0]}"`),
        `<cac:PartyName>${el('cbc:Name', a.name)}</cac:PartyName>`,
        address(a, country),
        `<cac:PartyLegalEntity>${el('cbc:RegistrationName', a.legal)}</cac:PartyLegalEntity>`,
        a.contact ? `<cac:Contact>${el('cbc:Name', a.contact[0])}${el('cbc:Telephone', a.contact[1])}${el('cbc:ElectronicMail', a.contact[2])}</cac:Contact>` : '',
        '</cac:Party>',
    ].join('');
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<DespatchAdvice xmlns="${NS.DespatchAdvice}" xmlns:cac="${CAC}" xmlns:cbc="${CBC}">`,
        '<cbc:CustomizationID>urn:fdc:peppol.eu:poacc:trns:despatch_advice:3</cbc:CustomizationID>',
        '<cbc:ProfileID>urn:fdc:peppol.eu:poacc:bis:despatch_advice:3</cbc:ProfileID>',
        el('cbc:ID', `DN-${year}-0871`),
        el('cbc:IssueDate', isoDate(today)),
        '<cbc:IssueTime>15:30:00</cbc:IssueTime>',
        el('cbc:Note', t.despatchNote),
        `<cac:OrderReference>${el('cbc:ID', order)}</cac:OrderReference>`,
        `<cac:DespatchSupplierParty>${despatchParty(s.seller)}</cac:DespatchSupplierParty>`,
        `<cac:DeliveryCustomerParty>${despatchParty(s.buyer)}</cac:DeliveryCustomerParty>`,
        '<cac:Shipment>',
        el('cbc:ID', `SHP-${year}-55120`),
        '<cbc:GrossWeightMeasure unitCode="KGM">86</cbc:GrossWeightMeasure>',
        '<cac:Delivery>',
        el('cbc:TrackingID', `${country}${year}0871`),
        `<cac:DeliveryAddress>${el('cbc:StreetName', s.buyer.street)}${el('cbc:CityName', s.buyer.city)}${el('cbc:PostalZone', s.buyer.postal)}<cac:Country>${el('cbc:IdentificationCode', country)}</cac:Country></cac:DeliveryAddress>`,
        `<cac:EstimatedDeliveryPeriod>${el('cbc:StartDate', isoDate(addDays(today, 1)))}<cbc:StartTime>08:00:00</cbc:StartTime>${el('cbc:EndDate', isoDate(addDays(today, 1)))}<cbc:EndTime>12:00:00</cbc:EndTime></cac:EstimatedDeliveryPeriod>`,
        `<cac:CarrierParty><cac:PartyName>${el('cbc:Name', s.carrier)}</cac:PartyName></cac:CarrierParty>`,
        `<cac:Despatch>${el('cbc:ActualDespatchDate', isoDate(today))}<cbc:ActualDespatchTime>15:00:00</cbc:ActualDespatchTime></cac:Despatch>`,
        '</cac:Delivery>',
        '<cac:TransportHandlingUnit><cbc:ID schemeID="SSCC">340123450000000017</cbc:ID><cbc:TransportHandlingUnitTypeCode>PX</cbc:TransportHandlingUnitTypeCode></cac:TransportHandlingUnit>',
        '</cac:Shipment>',
        ...lines.map((l, i) => [
            '<cac:DespatchLine>',
            el('cbc:ID', i + 1),
            el('cbc:DeliveredQuantity', l.qty, ' unitCode="C62"'),
            l.backorder ? `${el('cbc:BackorderQuantity', l.backorder, ' unitCode="C62"')}${el('cbc:BackorderReason', t.backorderReason)}` : '',
            `<cac:OrderLineReference>${el('cbc:LineID', i + 1)}</cac:OrderLineReference>`,
            '<cac:Item>',
            l.desc ? el('cbc:Description', l.desc) : '',
            el('cbc:Name', l.name),
            `<cac:SellersItemIdentification>${el('cbc:ID', l.itemId)}</cac:SellersItemIdentification>`,
            `<cac:StandardItemIdentification>${el('cbc:ID', l.gtin, ' schemeID="0160"')}</cac:StandardItemIdentification>`,
            '</cac:Item>',
            '</cac:DespatchLine>',
        ].join('')),
        '</DespatchAdvice>',
    ].filter(Boolean).join('\n');
}

export const hasCountrySample = (country: CountryCode) => country in COUNTRY_SAMPLES;

/** Örnek XML; `profileId` faturalar için CustomizationID / ProfileID'yi belirler. */
export function generateSampleXml(country: CountryCode, kind: IntlDocKind, lang: DocLanguage, profileId: string): string {
    return kind === 'despatch' ? despatch(country, lang) : billing(country, kind, lang, profileId);
}
