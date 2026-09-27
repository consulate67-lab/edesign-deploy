/**
 * Module Badge — Her module ozgu GIB e-Belge sistemi banner'i + modüle özgü örnek kaşesi.
 *
 * Phase A.2 + Faz 8:
 *  - Banner: modüle özgü renk, icon, başlık, GİB etiketi
 *  - Örnek Kaşesi (Phase 8.5): tüm modüller için tutarlı
 *    • e-SMM: 'luca MALİ MÜŞAVİR' kaşesi
 *    • e-Bilet: 'MasterBilet — Türkiye'nin Bilet Platformu' kaşesi
 *    • Diğerleri: genel 'Örnek — {module adı}' kaşesi
 *
 * Production'da yalnızca tasarımcı preview'ında (URL srcDoc iframe) görünür.
 * Canlı XSLT/GİB çıktısına dokunmaz.
 */

export interface ModuleBadge {
    title: string;
    color: string;
    icon: string;
    subtitle?: string;
    /** Kaşede gösterilecek platform/isim (örn 'luca MALİ MÜŞAVİR', 'MasterBilet'). */
    stampBrand?: string;
    /** Kaşede gösterilecek alt başlık (örn 'Türkiye'nin Bilet Platformu'). */
    stampTagline?: string;
    /** Kaşe ana rengi (örn. lacivert #1e3a8a). */
    stampBrandColor?: string;
    /** Sağ-üst köşedeki yıldız rengi. */
    stampStarColor?: string;
}

export const MODULE_BADGES: Record<string, ModuleBadge> = {
    fatura: {
        title: 'e-FATURA',
        subtitle: 'Temel Fatura',
        color: '#1d4ed8',
        icon: '📄',
        stampBrand: 'e-Fatura',
        stampBrandColor: '#1d4ed8',
        stampStarColor: '#dc2626',
    },
    arsiv: {
        title: 'e-ARŞİV FATURASI',
        subtitle: 'Elektronik Arşiv',
        color: '#b91c1c',
        icon: '🗂️',
        stampBrand: 'e-Arşiv',
        stampBrandColor: '#b91c1c',
        stampStarColor: '#dc2626',
    },
    irsaliye: {
        title: 'e-İRSALİYE',
        subtitle: 'Sevk İrsaliyesi',
        color: '#0e7490',
        icon: '🚚',
        stampBrand: 'e-İrsaliye',
        stampBrandColor: '#0e7490',
        stampStarColor: '#dc2626',
    },
    ihracat: {
        title: 'e-İHRACAT',
        subtitle: 'Gümrüklü İhracat',
        color: '#7c2d12',
        icon: '✈️',
        stampBrand: 'e-İhracat',
        stampBrandColor: '#7c2d12',
        stampStarColor: '#dc2626',
    },
    mikro_ihracat: {
        title: 'e-MİKRO İHRACAT',
        subtitle: 'POSTA/KARGO İle',
        color: '#9f1239',
        icon: '📦',
        stampBrand: 'e-Mikro İhracat',
        stampBrandColor: '#9f1239',
        stampStarColor: '#dc2626',
    },
    smm: {
        title: 'e-SMM',
        subtitle: 'Serbest Meslek Makbuzu',
        color: '#7c3aed',
        icon: '🩺',
        // Faz 8.1 — Selim'in paylaştığı e-SMM referans görselinden
        stampBrand: 'luca',
        stampBrandColor: '#1e3a8a',
        stampStarColor: '#dc2626',
        stampTagline: 'MALİ MÜŞAVİR',
    },
    mustahsil: {
        title: 'e-MÜSTAHSİL MAKBUZU',
        subtitle: 'Çiftçiden Alım',
        color: '#a16207',
        icon: '🌾',
        stampBrand: 'e-Müstahsil',
        stampBrandColor: '#a16207',
        stampStarColor: '#dc2626',
    },
    bilet: {
        title: 'e-BİLET',
        subtitle: 'Yolcu Bileti',
        color: '#0891b2',
        icon: '🎫',
        // Faz 8.2 — Selim'in paylaştığı bionluk PDF'inden (MasterBilet logosu)
        stampBrand: 'MasterBilet',
        stampBrandColor: '#0d9488',
        stampStarColor: '#f59e0b',
        stampTagline: 'TÜRKİYE\'NİN BİLET PLATFORMU',
    },
    makbuz: {
        title: 'e-MAKBUZ',
        subtitle: 'Ödeme Makbuzu',
        color: '#16a34a',
        icon: '💵',
        stampBrand: 'e-Makbuz',
        stampBrandColor: '#16a34a',
        stampStarColor: '#dc2626',
    },
};

/**
 * Modüle özgü GİB banner HTML üretir. İframe'e inline-style ile güvenle enjekte edilir.
 */
export function renderGibBadge(moduleId: string): string {
    const b = MODULE_BADGES[moduleId] || MODULE_BADGES.fatura;
    return (
        `<div data-module-badge="${moduleId}" style="` +
        `position: relative;` +
        `display: flex; align-items: center; justify-content: center; gap: 14px;` +
        `padding: 14px 28px; margin: 0;` +
        `background: linear-gradient(135deg, ${b.color} 0%, ${b.color}dd 100%);` +
        `color: #ffffff;` +
        `font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;` +
        `font-weight: 800; font-size: 15px; letter-spacing: 1.8px;` +
        `text-transform: uppercase;` +
        `border-bottom: 3px solid rgba(0,0,0,0.15);` +
        `box-shadow: 0 4px 12px rgba(0,0,0,0.12);` +
        `z-index: 999999;` +
        `">` +
        `<span style="font-size: 26px; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3));">${b.icon}</span>` +
        `<span style="display: flex; flex-direction: column; line-height: 1.15;">` +
        `<span style="font-size: 15px; font-weight: 800;">${b.title}</span>` +
        (b.subtitle ? `<span style="font-size: 10px; font-weight: 500; opacity: 0.85; letter-spacing: 0.6px; margin-top: 2px;">${b.subtitle}</span>` : '') +
        `</span>` +
        `<span style="margin-left: auto; padding: 6px 14px; background: rgba(255,255,255,0.18); ` +
        `border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.6px;">` +
        `GİB · e-Belge Sistemi` +
        `</span>` +
        `<div style="position: absolute; left: 8px; bottom: 6px; font-size: 9px; font-weight: 400; opacity: 0.6; letter-spacing: 0.4px;">` +
        `Tasarımcı Önizleme Modu` +
        `</div>` +
        `</div>`
    );
}

/**
 * Faz 8.5 — Tüm modüller için tutarlı 'Örnek' kaşesi.
 *
 * - e-SMM: 'luca MALİ MÜŞAVİR' (referans görsel)
 * - e-Bilet: 'MasterBilet — TÜRKİYE'NİN BİLET PLATFORMU' (Selim'in bionluk paylaşımı)
 * - Diğerleri: genel '{moduleName} ÖRNEK' kaşesi
 *
 * Modüle özgü renkler MODULE_BADGES üzerinden gelir.
 */
export function renderOrnekStamp(moduleId: string): string {
    const b = MODULE_BADGES[moduleId] || MODULE_BADGES.fatura;
    const brand = b.stampBrand || b.title;
    const tagline = b.stampTagline || '';
    const brandColor = b.stampBrandColor || '#1e3a8a';
    const starColor = b.stampStarColor || '#dc2626';

    // Tagline büyükse (örn. e-SMM, e-Bilet) 2 satırlı layout; değilse tek satır
    const taglineHtml = tagline
        ? `<span style="font-size: 8.5px; font-weight: 800; color: ${brandColor}; line-height: 1; letter-spacing: 0.8px;">${tagline}</span>`
        : '';

    return (
        `<div data-module-stamp="${moduleId}" style="` +
        `position: relative;` +
        `display: flex; align-items: center; justify-content: center; gap: 14px;` +
        `padding: 10px 18px; margin: 0 0 6mm auto;` +
        `max-width: 280px;` +
        `background: #fff;` +
        `border: 2px dashed #c2410c;` +
        `border-radius: 6px;` +
        `font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;` +
        `color: #1f2937;` +
        `box-shadow: 0 2px 4px rgba(0,0,0,0.06);` +
        `transform: rotate(-2deg);` +
        `">` +
        `<span style="font-size: 14px; font-weight: 900; color: #c2410c; letter-spacing: 1.2px;">ÖRNEK</span>` +
        `<span style="width: 1.5px; height: 28px; background: #d4d4d8;"></span>` +
        `<div style="display: flex; flex-direction: column; align-items: center; line-height: 1.05; gap: 2px;">` +
        `<span style="font-size: 15px; font-weight: 900; color: ${brandColor}; letter-spacing: -0.5px;">${brand}</span>` +
        taglineHtml +
        `</div>` +
        `<span style="position: absolute; top: -8px; right: -8px; color: ${starColor}; font-size: 14px;">★</span>` +
        `</div>`
    );
}

/**
 * HTML içeriğine banner + modüle özgü örnek kaşesi inject eder.
 * Body varsa açılıştan hemen sonra, yoksa en başa.
 */
export function injectModuleBadge(html: string, moduleId: string): string {
    const banner = renderGibBadge(moduleId);
    const stamp = renderOrnekStamp(moduleId);
    const bodyMatch = html.match(/<body[^>]*>/i);
    if (bodyMatch) {
        return html.replace(bodyMatch[0], bodyMatch[0] + banner + stamp);
    }
    return banner + html;
}
