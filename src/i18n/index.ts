import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import tr from './locales/tr';
import en from './locales/en';
import de from './locales/de';
import fr from './locales/fr';
import es from './locales/es';
import zh from './locales/zh';
import hi from './locales/hi';
import ru from './locales/ru';
import pt from './locales/pt';
import { LOCALES, useUiStore, type Locale } from '../store/uiStore';
import { countryLocale, detectCountry } from './region';

const isLocale = (lng: string | null | undefined): lng is Locale => !!lng && (LOCALES as string[]).includes(lng);

/** Yalnız kullanıcının kendi seçtiği dil saklanır; yoksa dil ülkeden gelir. */
const LOCALE_KEY = 'edesign-locale';
const savedLocale = (): Locale | null => {
    try {
        const v = localStorage.getItem(LOCALE_KEY);
        return isLocale(v) ? v : null;
    } catch {
        return null;
    }
};

/** Bağlantıyla gelen dil (?lang=de, ör. tanıtım e-postası); saklanmaz, yalnız bu açılışta geçerlidir. */
const urlLocale = (): Locale | null => {
    try {
        const v = new URLSearchParams(window.location.search).get('lang');
        return isLocale(v) ? v : null;
    } catch {
        return null;
    }
};

/**
 * Arama motoru / yapay zekâ tarayıcıları ABD'den gelir; bölgeden dil seçilirse site İngilizce indekslenir.
 * Bu yüzden ?lang= yoksa ana sürüm (Türkçe) gösterilir; diğer diller ?lang= adresleriyle taranır.
 */
const isCrawler = typeof navigator !== 'undefined' && /bot\b|bot\/|crawl|spider|slurp|mediapartners|google-inspectiontool|facebookexternalhit/i.test(navigator.userAgent);

// İlk giriş: ülke bölgeden bulunur, arayüz o ülkenin dilinde açılır; desteklenmeyen dil → İngilizce.
const initialCountry = (() => {
    const { country, setCountry } = useUiStore.getState();
    if (country) return country;
    if (isCrawler && !urlLocale()) {
        setCountry('TR');
        return 'TR';
    }
    const detected = detectCountry();
    if (detected) setCountry(detected);
    return detected;
})();

type Tree = { [key: string]: unknown };

/** Rusçada 2–4 (few) ve 5+ (many) biçimleri; metinler sayıdan bağımsız yazıldığı için _other kullanılır. */
const withSlavicPlurals = (tree: Tree): Tree => Object.fromEntries(Object.entries(tree).flatMap(([key, value]): [string, unknown][] => {
    if (value && typeof value === 'object' && !Array.isArray(value)) return [[key, withSlavicPlurals(value as Tree)]];
    if (typeof value !== 'string') return [[key, value]];
    if (!key.endsWith('_other')) return [[key, value]];
    const base = key.slice(0, -'_other'.length);
    return [[key, value], ...['few', 'many'].filter(f => !(`${base}_${f}` in tree)).map((f): [string, unknown] => [`${base}_${f}`, value])];
}));

void i18n
    .use(initReactI18next)
    .init({
        resources: {
            tr: { translation: tr }, en: { translation: en }, de: { translation: de },
            fr: { translation: fr }, es: { translation: es }, zh: { translation: zh },
            hi: { translation: hi }, ru: { translation: withSlavicPlurals(ru as unknown as Tree) }, pt: { translation: pt },
        },
        lng: urlLocale() ?? savedLocale() ?? countryLocale(initialCountry),
        fallbackLng: 'en',
        supportedLngs: LOCALES,
        interpolation: { escapeValue: false },
        initAsync: false,
    });

/** Etkin arayüz dili; desteklenmeyen bir değer gelirse 'en'. */
export const currentLocale = (): Locale => {
    const lng = i18n.resolvedLanguage ?? i18n.language;
    return isLocale(lng) ? lng : 'en';
};

/** Arayüz dili + çeviri fonksiyonu; dil değişince bileşen yeniden çizilir. */
export const useLocaleT = () => {
    const { t, i18n: instance } = useTranslation();
    const lng = instance.resolvedLanguage ?? instance.language;
    return { t, locale: isLocale(lng) ? lng : 'en' as Locale };
};

/** Kullanıcının açıkça seçtiği dil; sonraki girişlerde bölge tespitinin önüne geçer. */
export const chooseLanguage = (lng: Locale) => {
    try { localStorage.setItem(LOCALE_KEY, lng); } catch { /* gizli mod */ }
    void i18n.changeLanguage(lng);
};

const SITE_URL = 'https://www.edxdocu.com/';

/** Başlık, açıklama ve canonical dile göre; ?lang= adresi kendi canonical'ını taşır ki hreflang sürümleri ayrı indekslensin. */
const applySeo = (lng: Locale) => {
    if (typeof document === 'undefined' || /^#\/(yonetim|admin)(\/|$)/i.test(location.hash)) return;
    document.title = i18n.t('seo.title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', i18n.t('seo.description'));
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', urlLocale() === lng && lng !== 'tr' ? `${SITE_URL}?lang=${lng}` : SITE_URL);
};

const applyLocale = (lng: string) => {
    if (!isLocale(lng)) return;
    if (typeof document !== 'undefined') document.documentElement.lang = lng;
    applySeo(lng);
    if (useUiStore.getState().locale !== lng) useUiStore.getState().setLocale(lng);
};

// i18next tek kaynak; store yalnızca onu izler.
applyLocale(currentLocale());
i18n.on('languageChanged', () => applyLocale(currentLocale()));
useUiStore.subscribe((state, prev) => {
    if (state.locale !== prev.locale && state.locale !== currentLocale()) void i18n.changeLanguage(state.locale);
});

export default i18n;
