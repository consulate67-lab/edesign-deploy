/**
 * Satışta olan paketler. Backend PACKAGE_PRICES (server/index.js) ile aynı
 * kalmalı — ödeme tutarı ve yüklenecek kredi orada belirlenir.
 */
export type PlanId = 'one' | 'basic' | 'pro';

export interface PackagePlan {
    id: PlanId;
    name: string;
    price: number;
    credits: number;
    highlight?: boolean;
    features: string[];
}

const COMMON_FEATURES = [
    'Tüm belge türleri (e-Fatura, e-Arşiv, e-İrsaliye, ...)',
    'Kendi XSLT ve XML dosyanızla çalışma',
    'Tüm hazır şablonlar',
    'XSLT indirme',
];

export const PACKAGES_PLANS: PackagePlan[] = [
    {
        id: 'one',
        name: 'One',
        price: 3000,
        credits: 1,
        features: ['1 tasarım hakkı (tek seferlik, süresiz)', ...COMMON_FEATURES],
    },
    {
        id: 'basic',
        name: 'Basic',
        price: 10000,
        credits: 10,
        features: ['10 tasarım hakkı (tek seferlik, süresiz)', ...COMMON_FEATURES],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 15000,
        credits: 25,
        highlight: true,
        features: ['25 tasarım hakkı (tek seferlik, süresiz)', ...COMMON_FEATURES, 'Öncelikli destek'],
    },
];
