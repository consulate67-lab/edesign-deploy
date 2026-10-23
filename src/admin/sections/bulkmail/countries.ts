import { countryProfiles, type UiLanguage } from '../../../international/registry/countryProfiles';

/** Broşür sürümü: site dili, ya da aynı dilde ülkesinin resmî formatını öne çıkaran sürüm. */
export type BrochureId = UiLanguage | 'en-in' | 'en-us' | 'tr-firma' | 'tr-musavir' | 'tr-avukat' | 'tr-otobus' | 'tr-acente';

export const BROCHURE_OPTIONS: { id: BrochureId; label: string }[] = [
    { id: 'tr', label: 'Türkçe' },
    { id: 'tr-firma', label: 'Türkçe · firma' },
    { id: 'tr-musavir', label: 'Türkçe · mali müşavir' },
    { id: 'tr-avukat', label: 'Türkçe · avukat' },
    { id: 'tr-otobus', label: 'Türkçe · otobüs firması' },
    { id: 'tr-acente', label: 'Türkçe · sigorta acentesi' },
    { id: 'en', label: 'İngilizce · Avrupa' },
    { id: 'en-us', label: 'İngilizce · ABD' },
    { id: 'en-in', label: 'İngilizce · Hindistan' },
    { id: 'de', label: 'Almanca' },
    { id: 'fr', label: 'Fransızca' },
    { id: 'es', label: 'İspanyolca' },
    { id: 'ru', label: 'Rusça' },
    { id: 'zh', label: 'Çince' },
    { id: 'hi', label: 'Hintçe' },
    { id: 'pt', label: 'Portekizce · Brezilya' },
];

export const brochureLabel = (id: BrochureId) => BROCHURE_OPTIONS.find(l => l.id === id)?.label ?? id;

/** Listenin başlığından sektör broşürü. E-posta adreslerinin içine bakılmaz. */
export const sectorFromList = (text: string): BrochureId | null => {
    const head = foldCountry(text.slice(0, 4000));
    if (/mali musavir|smmm|yeminli mali/.test(head)) return 'tr-musavir';
    if (/\bavukat\b|hukuk burosu/.test(head)) return 'tr-avukat';
    if (/otobus|e bilet|ebilet|yolcu listesi/.test(head)) return 'tr-otobus';
    if (/sigorta acente|komisyon gider|hak edis/.test(head)) return 'tr-acente';
    return null;
};

export const sectorCampaignName = (id: BrochureId) => (
    id === 'tr-musavir' ? 'Mali müşavir'
        : id === 'tr-avukat' ? 'Avukat'
            : id === 'tr-otobus' ? 'Otobüs firması'
                : id === 'tr-acente' ? 'Sigorta acentesi'
                    : ''
);

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

/**
 * Hindistan'da iş yazışması İngilizce yürür; ABD ve Hindistan kendi formatını öne çıkaran sürümü alır.
 * Portekizce broşür Brezilya belgelerini (NF-e) anlatır; Portekiz CIUS-PT'li Avrupa sürümünü alır.
 */
const BROCHURE_OVERRIDE: Record<string, BrochureId> = { IN: 'en-in', US: 'en-us', PT: 'en' };

export const countryCode = (name: string): string | null => BY_NAME.get(foldCountry(name)) ?? null;

export type CountryStatus = 'supported' | 'unsupported' | 'unknown';

export interface CountryMatch { status: CountryStatus; brochure: BrochureId | null }

/**
 * Ülke adından broşür. Sitenin belge sunmadığı ülkeye (ör. BAE, Malezya, Kazakistan) ve tanınmayan
 * ada broşür seçilmez; o ülkelerde tasarlanabilecek resmî format olmadığı için varsayılan olarak gönderilmez.
 */
export const brochureForCountry = (name: string, fallback: BrochureId): CountryMatch => {
    if (!name.trim()) return { status: 'supported', brochure: fallback };
    const code = countryCode(name);
    if (!code) return { status: 'unknown', brochure: null };
    const profile = countryProfiles.find(c => c.code === code);
    if (!profile) return { status: 'unsupported', brochure: null };
    return { status: 'supported', brochure: BROCHURE_OVERRIDE[code] ?? profile.uiLanguage };
};
