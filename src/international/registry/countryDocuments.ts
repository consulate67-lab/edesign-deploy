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
};

/** Fatura profilleri, ülke kaydında birden çoksa bu öncelikle seçilir. */
const INVOICE_PROFILE_KINDS: [profileId: string, kinds: IntlDocKind[]][] = [
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

/** Ülkenin hazır şablonla tasarlanabilen belgeleri (fatura türleri + sevk belgesi). */
export function countryDocuments(country: CountryCode): CountryDocument[] {
    const rules = findCountryRules(country);
    if (!rules || country === 'TR') return [];
    const invoice = INVOICE_PROFILE_KINDS.find(([id]) => rules.invoice.profiles.includes(id));
    return [
        ...(invoice ? invoice[1].map((kind) => ({ kind, profileId: invoice[0] })) : []),
        { kind: 'despatch', profileId: DESPATCH_PROFILE },
    ];
}
