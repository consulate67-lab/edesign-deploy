/**
 * Country registry — Türkiye + AB/AEA + Birleşik Krallık + İsviçre.
 *
 * Bu kayıt yalnız ülke metadatasını tutar. Hangi belge için hangi XML
 * profilinin geçerli olduğu `documentProfiles.ts` içindedir; arayüz dili
 * (uiLanguage) belge profilini belirlemez.
 */

import type { DocLanguage } from './docLanguages';

export type CountryCode = string; // ISO 3166-1 alpha-2

/** Müşteri arayüzünde desteklenen diller. */
export type UiLanguage = 'tr' | 'en' | 'de' | 'fr' | 'es';

export type CountryRegion = 'TR' | 'EU' | 'EEA' | 'GB' | 'CH';

export interface CountryProfile {
    code: CountryCode;
    /** İngilizce ad; ekranda `countryName()` ile kullanıcının diline çevrilir. */
    name: string;
    region: CountryRegion;
    /** ISO 4217 */
    currency: string;
    /** Sayı/tarih biçimi için BCP 47 etiketi. */
    locale: string;
    /** Ülke seçildiğinde önerilecek arayüz dili (desteklenmiyorsa 'en'). */
    uiLanguage: UiLanguage;
    /** Belgenin yazılabileceği resmî diller; ilki varsayılandır. İngilizce her ülkede ayrıca seçilebilir. */
    docLanguages: DocLanguage[];
}

export const countryProfiles: CountryProfile[] = [
    { code: 'TR', name: 'Türkiye', region: 'TR', currency: 'TRY', locale: 'tr-TR', uiLanguage: 'tr', docLanguages: ['tr'] },

    { code: 'AT', name: 'Austria', region: 'EU', currency: 'EUR', locale: 'de-AT', uiLanguage: 'de', docLanguages: ['de'] },
    { code: 'BE', name: 'Belgium', region: 'EU', currency: 'EUR', locale: 'fr-BE', uiLanguage: 'fr', docLanguages: ['nl', 'fr', 'de'] },
    { code: 'BG', name: 'Bulgaria', region: 'EU', currency: 'EUR', locale: 'bg-BG', uiLanguage: 'en', docLanguages: ['bg'] },
    { code: 'HR', name: 'Croatia', region: 'EU', currency: 'EUR', locale: 'hr-HR', uiLanguage: 'en', docLanguages: ['hr'] },
    { code: 'CY', name: 'Cyprus', region: 'EU', currency: 'EUR', locale: 'el-CY', uiLanguage: 'en', docLanguages: ['el', 'tr'] },
    { code: 'CZ', name: 'Czechia', region: 'EU', currency: 'CZK', locale: 'cs-CZ', uiLanguage: 'en', docLanguages: ['cs'] },
    { code: 'DK', name: 'Denmark', region: 'EU', currency: 'DKK', locale: 'da-DK', uiLanguage: 'en', docLanguages: ['da'] },
    { code: 'EE', name: 'Estonia', region: 'EU', currency: 'EUR', locale: 'et-EE', uiLanguage: 'en', docLanguages: ['et'] },
    { code: 'FI', name: 'Finland', region: 'EU', currency: 'EUR', locale: 'fi-FI', uiLanguage: 'en', docLanguages: ['fi', 'sv'] },
    { code: 'FR', name: 'France', region: 'EU', currency: 'EUR', locale: 'fr-FR', uiLanguage: 'fr', docLanguages: ['fr'] },
    { code: 'DE', name: 'Germany', region: 'EU', currency: 'EUR', locale: 'de-DE', uiLanguage: 'de', docLanguages: ['de'] },
    { code: 'GR', name: 'Greece', region: 'EU', currency: 'EUR', locale: 'el-GR', uiLanguage: 'en', docLanguages: ['el'] },
    { code: 'HU', name: 'Hungary', region: 'EU', currency: 'HUF', locale: 'hu-HU', uiLanguage: 'en', docLanguages: ['hu'] },
    { code: 'IE', name: 'Ireland', region: 'EU', currency: 'EUR', locale: 'en-IE', uiLanguage: 'en', docLanguages: ['en', 'ga'] },
    { code: 'IT', name: 'Italy', region: 'EU', currency: 'EUR', locale: 'it-IT', uiLanguage: 'en', docLanguages: ['it', 'de'] },
    { code: 'LV', name: 'Latvia', region: 'EU', currency: 'EUR', locale: 'lv-LV', uiLanguage: 'en', docLanguages: ['lv'] },
    { code: 'LT', name: 'Lithuania', region: 'EU', currency: 'EUR', locale: 'lt-LT', uiLanguage: 'en', docLanguages: ['lt'] },
    { code: 'LU', name: 'Luxembourg', region: 'EU', currency: 'EUR', locale: 'fr-LU', uiLanguage: 'fr', docLanguages: ['fr', 'de'] },
    { code: 'MT', name: 'Malta', region: 'EU', currency: 'EUR', locale: 'en-MT', uiLanguage: 'en', docLanguages: ['en', 'mt'] },
    { code: 'NL', name: 'Netherlands', region: 'EU', currency: 'EUR', locale: 'nl-NL', uiLanguage: 'en', docLanguages: ['nl'] },
    { code: 'PL', name: 'Poland', region: 'EU', currency: 'PLN', locale: 'pl-PL', uiLanguage: 'en', docLanguages: ['pl'] },
    { code: 'PT', name: 'Portugal', region: 'EU', currency: 'EUR', locale: 'pt-PT', uiLanguage: 'en', docLanguages: ['pt'] },
    { code: 'RO', name: 'Romania', region: 'EU', currency: 'RON', locale: 'ro-RO', uiLanguage: 'en', docLanguages: ['ro'] },
    { code: 'SK', name: 'Slovakia', region: 'EU', currency: 'EUR', locale: 'sk-SK', uiLanguage: 'en', docLanguages: ['sk'] },
    { code: 'SI', name: 'Slovenia', region: 'EU', currency: 'EUR', locale: 'sl-SI', uiLanguage: 'en', docLanguages: ['sl'] },
    { code: 'ES', name: 'Spain', region: 'EU', currency: 'EUR', locale: 'es-ES', uiLanguage: 'es', docLanguages: ['es', 'ca', 'eu', 'gl'] },
    { code: 'SE', name: 'Sweden', region: 'EU', currency: 'SEK', locale: 'sv-SE', uiLanguage: 'en', docLanguages: ['sv'] },

    { code: 'IS', name: 'Iceland', region: 'EEA', currency: 'ISK', locale: 'is-IS', uiLanguage: 'en', docLanguages: ['is'] },
    { code: 'LI', name: 'Liechtenstein', region: 'EEA', currency: 'CHF', locale: 'de-LI', uiLanguage: 'de', docLanguages: ['de'] },
    { code: 'NO', name: 'Norway', region: 'EEA', currency: 'NOK', locale: 'nb-NO', uiLanguage: 'en', docLanguages: ['nb'] },

    { code: 'GB', name: 'United Kingdom', region: 'GB', currency: 'GBP', locale: 'en-GB', uiLanguage: 'en', docLanguages: ['en'] },
    { code: 'CH', name: 'Switzerland', region: 'CH', currency: 'CHF', locale: 'de-CH', uiLanguage: 'de', docLanguages: ['de', 'fr', 'it'] },
];

export const findCountry = (code: CountryCode): CountryProfile | undefined =>
    countryProfiles.find((c) => c.code === code);

/** Ülkede seçilebilir belge dilleri: resmî diller, ardından İngilizce. */
export const countryDocLanguages = (code: CountryCode): DocLanguage[] => {
    const own = findCountry(code)?.docLanguages ?? [];
    return own.includes('en') || code === 'TR' ? own : [...own, 'en'];
};

/** Ülke adını arayüz diline göre döner (ör. 'DE' → 'Almanya' / 'Allemagne'). */
export const countryName = (code: CountryCode, language: UiLanguage): string => {
    try {
        return new Intl.DisplayNames([language], { type: 'region' }).of(code) ?? code;
    } catch {
        return findCountry(code)?.name ?? code;
    }
};
