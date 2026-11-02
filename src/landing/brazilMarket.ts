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

/** `?market=br` veya tespit edilen/seçili ülke BR → Brezilya iniş modu. */
export const isBrazilMarket = (country: string | null | undefined): boolean =>
    country === 'BR' || readParam('market')?.toLowerCase() === 'br';

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
 * Paylaşım bağlantısı (`?market=br`) gelince ülkeyi BR, dili pt yapar.
 * Yerel ziyaretçide ülke zaten BR ise yalnız dil eksikse pt'ye çeker.
 */
export const activateBrazilMarket = (): void => {
    const { country, setCountry } = useUiStore.getState();
    const fromUrl = readParam('market')?.toLowerCase() === 'br';
    if (fromUrl || country === 'BR') {
        if (country !== 'BR') setCountry('BR');
        chooseLanguage('pt');
    }
};
