import { chooseLanguage } from '../i18n';
import { useUiStore } from '../store/uiStore';

export type BrazilVariant = 'a' | 'b';

const VARIANT_KEY = 'edxdocu-br-variant';

const readParam = (name: string): string | null => {
    try {
        return new URLSearchParams(window.location.search).get(name);
    } catch {
        return null;
    }
};

export const brazilMarketFromUrl = (): boolean => readParam('market')?.toLowerCase() === 'br';

/**
 * Brezilya iniş metinleri yalnız Portekizce arayüzde.
 * Böylece Türkçe seçiliyken pt kopya karışmaz (ülke BR kalsa bile).
 */
export const isBrazilMarket = (country: string | null | undefined, locale: string): boolean => {
    if (locale !== 'pt') return false;
    return country === 'BR' || brazilMarketFromUrl();
};

const storedVariant = (): BrazilVariant | null => {
    try {
        const v = sessionStorage.getItem(VARIANT_KEY);
        return v === 'a' || v === 'b' ? v : null;
    } catch {
        return null;
    }
};

/** A/B: `?v=a|b` > oturum > rastgele (yarı yarıya). */
export const brazilVariant = (): BrazilVariant => {
    const fromUrl = readParam('v')?.toLowerCase();
    if (fromUrl === 'a' || fromUrl === 'b') {
        try { sessionStorage.setItem(VARIANT_KEY, fromUrl); } catch { /* gizli mod */ }
        return fromUrl;
    }
    const prev = storedVariant();
    if (prev) return prev;
    const pick: BrazilVariant = Math.random() < 0.5 ? 'a' : 'b';
    try { sessionStorage.setItem(VARIANT_KEY, pick); } catch { /* gizli mod */ }
    return pick;
};

/**
 * Yalnız `?market=br` paylaşım linki dili/ülkeyi zorlar.
 * Ülke BR diye herkese Portekizce dayatılmaz.
 */
export const activateBrazilMarket = (): void => {
    if (!brazilMarketFromUrl()) return;
    const { country, setCountry } = useUiStore.getState();
    if (country !== 'BR') setCountry('BR');
    chooseLanguage('pt');
};
