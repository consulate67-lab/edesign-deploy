/**
 * Belge (fatura objeleri) dilleri: arayüz dillerinden bağımsızdır. Avrupa
 * belgeleri, seçilen ülkenin resmî dilinde (veya İngilizce) üretilir.
 */

export const DOC_LANGUAGES = [
    'tr', 'en', 'de', 'fr', 'es',
    'it', 'nl', 'pt', 'pl', 'cs', 'sk', 'sl', 'hr', 'hu', 'ro', 'bg', 'el',
    'da', 'sv', 'nb', 'fi', 'et', 'lv', 'lt', 'is',
    'mt', 'ga', 'ca', 'eu', 'gl',
] as const;

export type DocLanguage = (typeof DOC_LANGUAGES)[number];

/** Arayüz dili olmayan, yalnız belge dili olarak kullanılan diller. */
export const EXTRA_DOC_LANGUAGES = DOC_LANGUAGES.slice(5) as Exclude<DocLanguage, 'tr' | 'en' | 'de' | 'fr' | 'es'>[];
export type ExtraDocLanguage = (typeof EXTRA_DOC_LANGUAGES)[number];

export const isDocLanguage = (v: string | null | undefined): v is DocLanguage =>
    !!v && (DOC_LANGUAGES as readonly string[]).includes(v);

/**
 * Sayı biçimi grubu: 'dot' 1,234.56 · 'comma' 1.234,56 · 'space' 1 234,56.
 * XSLT şablonlarındaki ve editördeki biçimlerle aynı gruplamadır.
 */
export type NumberStyle = 'dot' | 'comma' | 'space';

const SPACE_GROUP: DocLanguage[] = ['fr', 'pt', 'pl', 'cs', 'sk', 'hu', 'bg', 'sv', 'nb', 'fi', 'et', 'lv', 'lt'];

const DOT_GROUP: DocLanguage[] = ['en', 'mt', 'ga'];

export const numberStyleOf = (lang: DocLanguage): NumberStyle =>
    DOT_GROUP.includes(lang) ? 'dot' : SPACE_GROUP.includes(lang) ? 'space' : 'comma';

/** Tarayıcıların Intl.DisplayNames verisinde kendi adı olmayan diller. */
const NATIVE_NAMES: Partial<Record<DocLanguage, string>> = { mt: 'Malti', ga: 'Gaeilge', eu: 'Euskara', gl: 'Galego' };

/** Dilin kendi adı (ör. 'it' → 'italiano'), arayüz dilinde adı için `languageName`. */
export const languageName = (lang: DocLanguage, inLanguage: string = lang): string => {
    if (inLanguage === lang && NATIVE_NAMES[lang]) return NATIVE_NAMES[lang];
    try {
        const name = new Intl.DisplayNames([inLanguage], { type: 'language' }).of(lang) ?? lang;
        return name.charAt(0).toLocaleUpperCase(inLanguage) + name.slice(1);
    } catch {
        return lang;
    }
};
