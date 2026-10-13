/**
 * Ülke → hazır belge türleri. Aynı XML biçimini (UBL 2.1) ve aynı XSLT'yi
 * kullanan belgeler tek şablonla çizilir; ülkeye özgü olan, belge adı
 * (belge dilinde), XML profili, tip kodu ve örnek veridir.
 *
 * Tip kodları (UNTDID 1001) profile göre sınırlıdır:
 *  - XRechnung 3.0 (BR-DE-17): 326, 380, 381, 384 (389, 875–877 de geçerli)
 *  - Peppol BIS Billing 3.0 (P0100/P0101): 380, 381, 386 …
 *  - CIUS-RO / HR CIUS / CIUS-PT: 380, 381, 384
 *  - EN 16931 çekirdek: 380, 381, 384, 386 …
 */
import type { IntlDocKind } from '../docText/types';
import type { CountryCode } from './countryProfiles';
import { findCountryRules } from './documentProfiles';

export type IntlRootName = 'Invoice' | 'CreditNote' | 'DespatchAdvice';

export const KIND_SPECS: Record<IntlDocKind, { root: IntlRootName; typeCode?: string }> = {
    invoice: { root: 'Invoice', typeCode: '380' },
    credit: { root: 'CreditNote', typeCode: '381' },
    corrected: { root: 'Invoice', typeCode: '384' },
    prepayment: { root: 'Invoice', typeCode: '386' },
    partial: { root: 'Invoice', typeCode: '326' },
    selfbilled: { root: 'Invoice', typeCode: '389' },
    despatch: { root: 'DespatchAdvice' },
    service: { root: 'Invoice' },
    consumer: { root: 'Invoice' },
};

/** Fatura profilleri, ülke kaydında birden çoksa bu öncelikle seçilir. */
const INVOICE_PROFILE_KINDS: [profileId: string, kinds: IntlDocKind[]][] = [
    ['us-dbna-ubl', ['invoice', 'credit']],
    ['de-xrechnung-ubl', ['invoice', 'credit', 'corrected', 'partial']],
    ['ro-cius', ['invoice', 'credit', 'corrected']],
    ['hr-cius', ['invoice', 'credit', 'corrected']],
    ['pt-cius-pt', ['invoice', 'credit', 'corrected']],
    ['peppol-bis-billing-3', ['invoice', 'credit', 'prepayment']],
    ['en16931-ubl', ['invoice', 'credit', 'corrected', 'prepayment']],
];

export const DESPATCH_PROFILE = 'peppol-despatch-3';

export interface CountryDocument {
    kind: IntlDocKind;
    profileId: string;
}

/**
 * UBL dışı ulusal biçimler: belge türleri ulusal XML'in kendi işlevleriyle eşlenir.
 *  - RU УПД 5.03: invoice = СЧФДОП, prepayment = СЧФ (avans), despatch = ДОП.
 *  - IN: GST e-Invoice (INV / CRN) + e-Way Bill.
 *  - CN 数电发票: invoice = 蓝字专票, credit = 红字发票.
 *  - BR: NF-e mod. 55 (invoice = finNFe 1, credit = 4 devolução, corrected = 2 complementar),
 *        NFS-e padrão nacional (service), NFC-e mod. 65 (consumer), CT-e mod. 57 (despatch).
 */
const NATIONAL_DOCUMENTS: Record<CountryCode, CountryDocument[]> = {
    RU: [
        { kind: 'invoice', profileId: 'ru-upd-503' },
        { kind: 'prepayment', profileId: 'ru-upd-503' },
        { kind: 'despatch', profileId: 'ru-upd-503' },
    ],
    IN: [
        { kind: 'invoice', profileId: 'in-gst-einvoice' },
        { kind: 'credit', profileId: 'in-gst-einvoice' },
        { kind: 'despatch', profileId: 'in-eway-bill' },
    ],
    CN: [
        { kind: 'invoice', profileId: 'cn-fully-digital' },
        { kind: 'credit', profileId: 'cn-fully-digital' },
    ],
    BR: [
        { kind: 'invoice', profileId: 'br-nfe' },
        { kind: 'credit', profileId: 'br-nfe' },
        { kind: 'corrected', profileId: 'br-nfe' },
        { kind: 'service', profileId: 'br-nfse' },
        { kind: 'consumer', profileId: 'br-nfce' },
        { kind: 'despatch', profileId: 'br-cte' },
    ],
};

/** Ülkenin hazır şablonla tasarlanabilen belgeleri (fatura türleri + sevk belgesi). */
export function countryDocuments(country: CountryCode): CountryDocument[] {
    const rules = findCountryRules(country);
    if (!rules || country === 'TR') return [];
    if (NATIONAL_DOCUMENTS[country]) return NATIONAL_DOCUMENTS[country];
    const invoice = INVOICE_PROFILE_KINDS.find(([id]) => rules.invoice.profiles.includes(id));
    return [
        ...(invoice ? invoice[1].map((kind) => ({ kind, profileId: invoice[0] })) : []),
        { kind: 'despatch', profileId: DESPATCH_PROFILE },
    ];
}
