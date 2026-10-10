import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import tr from './locales/tr';
import en from './locales/en';
import de from './locales/de';
import fr from './locales/fr';
import es from './locales/es';
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

// İlk giriş: ülke bölgeden bulunur, arayüz o ülkenin dilinde açılır; desteklenmeyen dil → İngilizce.
const initialCountry = (() => {
    const { country, setCountry } = useUiStore.getState();
    if (country) return country;
    const detected = detectCountry();
    if (detected) setCountry(detected);
    return detected;
})();

void i18n
    .use(initReactI18next)
    .init({
        resources: {
            tr: { translation: tr }, en: { translation: en }, de: { translation: de },
            fr: { translation: fr }, es: { translation: es },
        },
        lng: savedLocale() ?? countryLocale(initialCountry),
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

const applyLocale = (lng: string) => {
    if (!isLocale(lng)) return;
    if (typeof document !== 'undefined') document.documentElement.lang = lng;
    if (useUiStore.getState().locale !== lng) useUiStore.getState().setLocale(lng);
};

// i18next tek kaynak; store yalnızca onu izler.
applyLocale(currentLocale());
i18n.on('languageChanged', () => applyLocale(currentLocale()));
useUiStore.subscribe((state, prev) => {
    if (state.locale !== prev.locale && state.locale !== currentLocale()) void i18n.changeLanguage(state.locale);
});

export default i18n;
