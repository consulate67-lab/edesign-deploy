/**
 * Satışta olan paketler. Backend PACKAGE_PRICES (server/index.js) ile aynı
 * kalmalı — ödeme tutarı ve yüklenecek kredi orada belirlenir.
 */
import type { TFunction } from 'i18next';
import { useLocaleT } from './i18n';
import { useCountry } from './store/uiStore';

export type PlanId = 'one' | 'basic' | 'pro';

/** Satış para birimi: Türkçe arayüzde TL, Birleşik Krallık'ta sterlin, diğer dillerde euro. */
export type PriceCurrency = 'TRY' | 'EUR' | 'GBP';

/** Özellik metinleri `pricing.features.*` çevirilerinden gelir. */
export type PlanFeature = 'credits' | 'allDocs' | 'ownFiles' | 'allTemplates' | 'download' | 'priority';

export interface PackagePlan {
    id: PlanId;
    name: string;
    /** KDV dahil fiyat, para birimine göre. */
    prices: Record<PriceCurrency, number>;
    credits: number;
    highlight?: boolean;
    features: PlanFeature[];
}

const COMMON_FEATURES: PlanFeature[] = ['credits', 'allDocs', 'ownFiles', 'allTemplates', 'download'];

export const PACKAGES_PLANS: PackagePlan[] = [
    { id: 'one', name: 'One', prices: { TRY: 3000, EUR: 59, GBP: 59 }, credits: 1, features: COMMON_FEATURES },
    { id: 'basic', name: 'Basic', prices: { TRY: 10000, EUR: 199, GBP: 199 }, credits: 10, features: COMMON_FEATURES },
    { id: 'pro', name: 'Pro', prices: { TRY: 15000, EUR: 399, GBP: 399 }, credits: 25, highlight: true, features: [...COMMON_FEATURES, 'priority'] },
];

export const priceCurrencyFor = (locale: string, country: string | null | undefined): PriceCurrency =>
    locale === 'tr' ? 'TRY' : country === 'GB' ? 'GBP' : 'EUR';

/** Arayüz diline ve seçili ülkeye göre satış para birimi. */
export const usePriceCurrency = (): PriceCurrency => {
    const { locale } = useLocaleT();
    return priceCurrencyFor(locale, useCountry());
};

/** 3.000 TL · 59 € · £59 — küsuratlı tutarlarda iki ondalık. */
export const formatPrice = (amount: number, currency: PriceCurrency, locale: string): string => {
    const digits = Number.isInteger(amount) ? 0 : 2;
    if (currency === 'TRY') return `${amount.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })} TL`;
    return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amount);
};

/** Tasarım başına fiyat (TL'de tam sayıya yuvarlanır). */
export const perDesignPrice = (plan: PackagePlan, currency: PriceCurrency): number => {
    const v = plan.prices[currency] / plan.credits;
    return currency === 'TRY' ? Math.round(v) : Math.round(v * 100) / 100;
};

export const planFeatureText = (t: TFunction, plan: PackagePlan, feature: PlanFeature): string =>
    feature === 'credits' ? t('pricing.features.credits', { count: plan.credits }) : t(`pricing.features.${feature}`);
