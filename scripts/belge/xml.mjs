// CreditNote tabanlı belgeler (e-Döviz / e-Kıymetli Maden, e-Dekont, e-Sigorta Komisyon Gider) ve
// e-Yolcu Listesi için örnek XML üreticileri. Tutarlar belge türüne özgü yardımcılarda hesaplanır.
import { e, ext, f2, party, r2, rootAttrs, signature, uuidFrom, wrap } from '../moda/lib.mjs';

export { f2, r2 };

const amt = (tag, [value, cur]) => e(tag, { currencyID: cur }, typeof value === 'number' ? f2(value) : value);

const docRef = (d, r) => e('cac:AdditionalDocumentReference',
    e('cbc:ID', r.scheme ? { schemeID: r.scheme } : {}, r.id),
    e('cbc:IssueDate', r.date ?? d.date),
    r.code && e('cbc:DocumentTypeCode', r.code),
    r.type && e('cbc:DocumentType', r.type),
    r.desc && e('cbc:DocumentDescription', r.desc));

const payment = (p) => e('cac:PaymentMeans',
    e('cbc:PaymentMeansCode', { listID: 'UN/4461' }, p.code),
    p.due && e('cbc:PaymentDueDate', p.due),
    p.note && e('cbc:InstructionNote', p.note),
    p.payer && e('cac:PayerFinancialAccount', e('cbc:ID', p.payer)),
    p.payee && e('cac:PayeeFinancialAccount',
        e('cbc:ID', p.payee),
        p.cur && e('cbc:CurrencyCode', p.cur),
        p.bank && e('cac:FinancialInstitutionBranch', e('cbc:Name', p.bank[1]), e('cac:FinancialInstitution', e('cbc:Name', p.bank[0])))));

const taxTotal = (taxes) => e('cac:TaxTotal',
    e('cbc:TaxAmount', { currencyID: taxes[0].cur }, f2(taxes.reduce((a, x) => a + x.amount, 0))),
    taxes.map((x, i) => e('cac:TaxSubtotal',
        e('cbc:TaxableAmount', { currencyID: x.cur }, f2(x.base)),
        e('cbc:TaxAmount', { currencyID: x.cur }, f2(x.amount)),
        e('cbc:CalculationSequenceNumeric', String(i + 1)),
        e('cbc:Percent', String(x.pct)),
        e('cac:TaxCategory', e('cac:TaxScheme', e('cbc:Name', x.name), e('cbc:TaxTypeCode', x.code))))));

const line = (l, i) => e('cac:CreditNoteLine',
    e('cbc:ID', String(i + 1)),
    l.qty !== undefined && e('cbc:CreditedQuantity', { unitCode: l.unit ?? 'C62' }, String(l.qty)),
    l.amount !== undefined && amt('cbc:LineExtensionAmount', [l.amount, l.cur]),
    (l.ac ?? []).map((a) => e('cac:AllowanceCharge',
        e('cbc:ChargeIndicator', String(a.charge)),
        e('cbc:AllowanceChargeReason', a.reason),
        a.rate !== undefined && e('cbc:MultiplierFactorNumeric', String(a.rate)),
        amt('cbc:Amount', [a.amount, l.cur]),
        a.base !== undefined && amt('cbc:BaseAmount', [a.base, l.cur]))),
    e('cac:Item', l.desc && e('cbc:Description', l.desc), e('cbc:Name', l.name)),
    l.price !== undefined && e('cac:Price', amt('cbc:PriceAmount', [l.price, l.cur])));

/**
 * CreditNote: { comment, profile, type, id, date, time, notes, currency?, period?, refs?, supplier, customer,
 * buyer?, payments?, settle?, xrate?, taxes?, lmt: [[etiket, tutar, para], ...], lines }
 */
export function creditNote(d) {
    const node = e('CreditNote', rootAttrs('CreditNote'),
        ext(),
        e('cbc:UBLVersionID', '2.1'),
        e('cbc:CustomizationID', 'TR1.2.1'),
        e('cbc:ProfileID', d.profile),
        e('cbc:ID', d.id),
        e('cbc:CopyIndicator', 'false'),
        e('cbc:UUID', uuidFrom(d.id)),
        e('cbc:IssueDate', d.date),
        e('cbc:IssueTime', d.time),
        e('cbc:CreditNoteTypeCode', d.type),
        (d.notes ?? []).map((n) => e('cbc:Note', n)),
        d.currency && e('cbc:DocumentCurrencyCode', d.currency),
        e('cbc:LineCountNumeric', String(d.lines.length)),
        d.period && e('cac:InvoicePeriod',
            e('cbc:StartDate', d.period.start), e('cbc:EndDate', d.period.end), e('cbc:Description', d.period.desc)),
        (d.refs ?? []).map((r) => docRef(d, r)),
        signature(d.supplier, d.id),
        e('cac:AccountingSupplierParty', party(d.supplier)),
        e('cac:AccountingCustomerParty', party(d.customer)),
        d.buyer && e('cac:BuyerCustomerParty', party(d.buyer)),
        (d.payments ?? []).map(payment),
        d.settle && e('cac:PaymentTerms', e('cac:SettlementPeriod',
            e('cbc:StartDate', d.settle[0]), e('cbc:StartTime', d.settle[1]),
            e('cbc:EndDate', d.settle[2]), e('cbc:EndTime', d.settle[3]))),
        d.xrate && e('cac:PaymentExchangeRate',
            e('cbc:SourceCurrencyCode', d.xrate[0]), e('cbc:TargetCurrencyCode', d.xrate[1]), e('cbc:CalculationRate', d.xrate[2])),
        d.taxes?.length && taxTotal(d.taxes),
        e('cac:LegalMonetaryTotal', d.lmt.map(([tag, ...a]) => amt(`cbc:${tag}`, a))),
        d.lines.map(line));
    return wrap(d.comment, node);
}

const SIG = (id, time) => e('ds:Signature', { Id: 'Signature_1' },
    e('ds:SignedInfo',
        e('ds:CanonicalizationMethod', { Algorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315' }),
        e('ds:SignatureMethod', { Algorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256' }),
        e('ds:Reference', { URI: '' },
            e('ds:Transforms', e('ds:Transform', { Algorithm: 'http://www.w3.org/2000/09/xmldsig#enveloped-signature' })),
            e('ds:DigestMethod', { Algorithm: 'http://www.w3.org/2001/04/xmlenc#sha256' }),
            e('ds:DigestValue', `${uuidFrom(`${id}d`).replace(/-/g, '')}=`))),
    e('ds:SignatureValue', `${uuidFrom(`${id}s`).replace(/-/g, '')}${uuidFrom(`${id}t`).replace(/-/g, '')}==`),
    e('ds:KeyInfo', e('ds:X509Data', e('ds:X509Certificate', 'MIIFlDCCBHygAwIBAgIGAIiEmAELMA0GCSqGSIb3DQEBCwUAMFwxCzAJBgNVBAYTAlRS'))),
    e('ds:Object', e('xades:QualifyingProperties', { Target: '#Signature_1' },
        e('xades:SignedProperties', { Id: 'SignedProperties_1' },
            e('xades:SignedSignatureProperties', e('xades:SigningTime', time))))));

/** Taşıtın 64 haneli özet değeri (temsili). */
const ozet = (seed) => [0, 1].map((i) => uuidFrom(`${seed}${i}`).replace(/-/g, '').toLowerCase()).join('');

/**
 * e-Yolcu Listesi: { comment, vkn, start, end?, signed, trips: [{ no, time, from, sefer, date, plate,
 * operator?: [vkn, komisyonOranı], seats: [[koltuk, adSoyad, kimlik, tutar], ...] }] }
 * Kimlik 11 haneli sayıysa TCKN/YKN, değilse pasaport no sayılır. Hasılat ve komisyon koltuklardan hesaplanır.
 */
export function yolcuListesi(d) {
    const trips = d.trips.map((tr) => {
        const total = r2(tr.seats.reduce((a, s) => a + s[3], 0));
        const kom = tr.operator ? r2(total * tr.operator[1]) : 0;
        return e('ebilet:yolcuListesi',
            e('ebilet:yolcuListesiNo', tr.no),
            e('ebilet:ozetDeger', ozet(tr.no)),
            e('ebilet:haraketZamani', `${tr.date}T${tr.time}:00`),
            e('ebilet:hareketNoktasi', tr.from),
            e('ebilet:seferNumarasi', tr.sefer),
            e('ebilet:seferTarihi', tr.date),
            e('ebilet:aracPlakasi', tr.plate),
            e('ebilet:toplamHasilat', f2(total)),
            tr.operator && e('ebilet:aracIsleten',
                e('ebilet:vkn', tr.operator[0]),
                e('ebilet:komisyonTutar', f2(kom)),
                e('ebilet:komisyonKDV', f2(r2(kom * 0.2)))),
            e('ebilet:koltukListesi', tr.seats.map(([seat, ad, kimlik, tutar], i) => e('ebilet:koltuk',
                e('ebilet:koltukNo', String(seat)),
                e('ebilet:biletNo', `${tr.no.slice(0, 7)}${String(Number(tr.no.slice(-6)) * 100 + i + 1).padStart(9, '0')}`),
                e('ebilet:tutar', f2(tutar)),
                e('ebilet:adSoyad', ad),
                /^\d{11}$/.test(kimlik) ? e('ebilet:tcknYkn', kimlik) : e('ebilet:pasaportNo', kimlik)))));
    });
    const node = e('ebilet:eYolcuListesi', {
        'xmlns:ebilet': 'http://ebilet.efatura.gov.tr',
        'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
        'xmlns:xades': 'http://uri.etsi.org/01903/v1.3.2#',
    },
    e('ebilet:baslik',
        e('ebilet:gonderen', e('ebilet:vkn', d.vkn)),
        e('ebilet:baslangicTarihi', d.start),
        e('ebilet:bitisTarihi', d.end ?? d.start),
        e('ebilet:versiyon', '1.0'),
        e('ebilet:uuid', uuidFrom(d.trips[0].no)),
        SIG(d.trips[0].no, d.signed)),
    trips);
    return wrap(d.comment, node);
}
