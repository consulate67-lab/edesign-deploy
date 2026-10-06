/**
 * Satışta olan paketler. Backend PACKAGE_PRICES (server/index.js) ile aynı
 * kalmalı — ödeme tutarı ve yüklenecek kredi orada belirlenir.
 */
export interface PackagePlan {
    id: 'pro';
    name: string;
    price: number;
    credits: number;
    features: string[];
}

export const PACKAGES_PLANS: PackagePlan[] = [
    {
        id: 'pro',
        name: 'Pro',
        price: 4000,
        credits: 25,
        features: [
            '25 tasarım hakkı (tek seferlik, süresiz)',
            'Tüm belge türleri (e-Fatura, e-Arşiv, e-İrsaliye, ...)',
            'Kendi XSLT ve XML dosyanızla çalışma',
            'Tüm hazır şablonlar',
            'XSLT indirme',
            'Öncelikli destek',
        ],
    },
];
