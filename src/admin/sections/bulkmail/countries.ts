import { countryProfiles, type UiLanguage } from '../../../international/registry/countryProfiles';

export type MailLang = UiLanguage;

export const MAIL_LANGS: { id: MailLang; label: string }[] = [
    { id: 'tr', label: 'Türkçe' },
    { id: 'en', label: 'İngilizce' },
    { id: 'de', label: 'Almanca' },
    { id: 'fr', label: 'Fransızca' },
    { id: 'es', label: 'İspanyolca' },
    { id: 'ru', label: 'Rusça' },
    { id: 'zh', label: 'Çince' },
    { id: 'hi', label: 'Hintçe' },
];

export const langLabel = (id: MailLang) => MAIL_LANGS.find(l => l.id === id)?.label ?? id;

/** Karşılaştırma anahtarı: küçük harf, Türkçe ve aksanlı harfler sadeleşir, noktalama atılır. */
export const foldCountry = (s: string) => s
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0400-\u04ff\u4e00-\u9fff]+/g, ' ')
    .trim();

const NAMES: Record<string, string[]> = {
    TR: ['turkiye', 'turkey', 'tr'],
    DE: ['almanya', 'germany', 'deutschland', 'de'],
    AT: ['avusturya', 'austria', 'osterreich', 'at'],
    CH: ['isvicre', 'switzerland', 'schweiz', 'suisse', 'svizzera', 'ch'],
    LI: ['lihtenstayn', 'liechtenstein'],
    FR: ['fransa', 'france', 'fr'],
    BE: ['belcika', 'belgium', 'belgique', 'belgie', 'be'],
    LU: ['luksemburg', 'luxembourg', 'luxemburg', 'lu'],
    NL: ['hollanda', 'netherlands', 'the netherlands', 'nederland', 'holland', 'nl'],
    ES: ['ispanya', 'spain', 'espana', 'es'],
    PT: ['portekiz', 'portugal', 'pt'],
    IT: ['italya', 'italy', 'italia', 'it'],
    GR: ['yunanistan', 'greece', 'gr'],
    CY: ['kibris', 'cyprus', 'cy'],
    MT: ['malta', 'mt'],
    IE: ['irlanda', 'ireland', 'ie'],
    GB: ['birlesik krallik', 'ingiltere', 'united kingdom', 'uk', 'great britain', 'england', 'gb'],
    NO: ['norvec', 'norway', 'norge', 'no'],
    SE: ['isvec', 'sweden', 'sverige', 'se'],
    DK: ['danimarka', 'denmark', 'danmark', 'dk'],
    FI: ['finlandiya', 'finland', 'suomi', 'fi'],
    IS: ['izlanda', 'iceland', 'is'],
    EE: ['estonya', 'estonia', 'ee'],
    LV: ['letonya', 'latvia', 'lv'],
    LT: ['litvanya', 'lithuania', 'lt'],
    PL: ['polonya', 'poland', 'polska', 'pl'],
    CZ: ['cekya', 'czechia', 'czech republic', 'cek cumhuriyeti', 'cz'],
    SK: ['slovakya', 'slovakia', 'sk'],
    HU: ['macaristan', 'hungary', 'hu'],
    RO: ['romanya', 'romania', 'ro'],
    BG: ['bulgaristan', 'bulgaria', 'bg'],
    HR: ['hirvatistan', 'croatia', 'hr'],
    SI: ['slovenya', 'slovenia', 'si'],
    RS: ['sirbistan', 'serbia'],
    MK: ['k makedonya', 'kuzey makedonya', 'makedonya', 'north macedonia', 'macedonia'],
    AL: ['arnavutluk', 'albania'],
    ME: ['karadag', 'montenegro'],
    BA: ['bosna hersek', 'bosnia', 'bosnia and herzegovina'],
    US: ['abd', 'usa', 'united states', 'amerika', 'amerika birlesik devletleri', 'us'],
    CA: ['kanada', 'canada'],
    MX: ['meksika', 'mexico'],
    BR: ['brezilya', 'brazil', 'brasil'],
    AR: ['arjantin', 'argentina'],
    CL: ['sili', 'chile'],
    CO: ['kolombiya', 'colombia'],
    PE: ['peru'],
    UY: ['uruguay'],
    EC: ['ekvador', 'ecuador'],
    RU: ['rusya', 'russia', 'россия', 'ru'],
    BY: ['belarus', 'beyaz rusya'],
    UA: ['ukrayna', 'ukraine'],
    MD: ['moldova'],
    KZ: ['kazakistan', 'kazakhstan'],
    UZ: ['ozbekistan', 'uzbekistan'],
    KG: ['kirgizistan', 'kyrgyzstan'],
    AZ: ['azerbaycan', 'azerbaijan'],
    GE: ['gurcistan', 'georgia'],
    AM: ['ermenistan', 'armenia'],
    IN: ['hindistan', 'india', 'in'],
    PK: ['pakistan'],
    CN: ['cin', 'china', '中国', 'cn'],
    JP: ['japonya', 'japan'],
    KR: ['guney kore', 'kore', 'south korea', 'korea'],
    SG: ['singapur', 'singapore'],
    MY: ['malezya', 'malaysia'],
    ID: ['endonezya', 'indonesia'],
    PH: ['filipinler', 'philippines'],
    TH: ['tayland', 'thailand'],
    VN: ['vietnam'],
    AU: ['avustralya', 'australia'],
    NZ: ['yeni zelanda', 'new zealand'],
    AE: ['bae', 'birlesik arap emirlikleri', 'uae', 'united arab emirates'],
    SA: ['suudi arabistan', 'saudi arabia'],
    OM: ['umman', 'oman'],
    QA: ['katar', 'qatar'],
    EG: ['misir', 'egypt'],
    ZA: ['guney afrika', 'south africa'],
    IL: ['israil', 'israel'],
};

const BY_NAME = new Map(Object.entries(NAMES).flatMap(([code, names]) => names.map(n => [foldCountry(n), code] as const)));

/** Sitede tanımlı olmayan ülkelerin ticari yazışma dili. */
const EXTRA_LANG: Record<string, MailLang> = {
    MX: 'es', AR: 'es', CL: 'es', CO: 'es', PE: 'es', UY: 'es', EC: 'es',
    BY: 'ru', KZ: 'ru', UZ: 'ru', KG: 'ru',
};

/** Hindistan'da iş yazışması İngilizce yürüdüğü için site dilinden (Hintçe) ayrılır; panelden değiştirilebilir. */
const LANG_OVERRIDE: Record<string, MailLang> = { IN: 'en' };

export const countryCode = (name: string): string | null => BY_NAME.get(foldCountry(name)) ?? null;

/** Ülke adından broşür dili; bilinmeyen ülke İngilizce, ülke yoksa `fallback`. */
export const langForCountry = (name: string, fallback: MailLang): MailLang => {
    if (!name.trim()) return fallback;
    const code = countryCode(name);
    if (!code) return 'en';
    return LANG_OVERRIDE[code] ?? countryProfiles.find(c => c.code === code)?.uiLanguage ?? EXTRA_LANG[code] ?? 'en';
};
