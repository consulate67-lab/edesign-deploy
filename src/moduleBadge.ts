/**
 * Module Badge — Her modüle özgü GİB e-Belge sistemi banner'ı.
 *
 * Phase A.2: Topluluk XSLT'lerinin çoğu tek bir base64 GİB logosu kullanıyor.
 * Selim'in geri bildirimi: "her modülün kendi GİB logosu olmalı" → bu runtime'da
 * eklenen üst-banner modüle özgü renk + emoji + başlık ile modal kimliği verir.
 *
 * Production'da: Bu banner sadece tasarımcı preview'ında görünür (URL srcDoc iframe).
 * Gerçek GİB uyumlu XSLT'lerin üzerine prepended olmaz. Phase Faz 8-12'de sıfırdan
 * yazılacak her modülün XSLT'sinin kendi GİB başlığı olacak — bu utility o zaman
 * devre dışı kalacak.
 */

export interface ModuleBadge {
    title: string;
    color: string;
    icon: string;
    subtitle?: string;
}

export const MODULE_BADGES: Record<string, ModuleBadge> = {
    fatura: {
        title: 'e-FATURA',
        subtitle: 'Temel Fatura',
        color: '#1d4ed8',
        icon: '📄',
    },
    arsiv: {
        title: 'e-ARŞİV FATURASI',
        subtitle: 'Elektronik Arşiv',
        color: '#b91c1c',
        icon: '🗂️',
    },
    irsaliye: {
        title: 'e-İRSALİYE',
        subtitle: 'Sevk İrsaliyesi',
        color: '#0e7490',
        icon: '🚚',
    },
    ihracat: {
        title: 'e-İHRACAT',
        subtitle: 'Gümrüklü İhracat',
        color: '#7c2d12',
        icon: '✈️',
    },
    mikro_ihracat: {
        title: 'e-MİKRO İHRACAT',
        subtitle: 'POSTA/KARGO İle',
        color: '#9f1239',
        icon: '📦',
    },
    smm: {
        title: 'e-SMM',
        subtitle: 'Serbest Meslek Makbuzu',
        color: '#7c3aed',
        icon: '🩺',
    },
    mustahsil: {
        title: 'e-MÜSTAHSiL MAKBUZU',
        subtitle: 'Çiftçiden Alım',
        color: '#a16207',
        icon: '🌾',
    },
    bilet: {
        title: 'e-BİLET',
        subtitle: 'Yolcu Bileti',
        color: '#0891b2',
        icon: '🎫',
    },
    makbuz: {
        title: 'e-MAKBUZ',
        subtitle: 'Ödeme Makbuzu',
        color: '#16a34a',
        icon: '💵',
    },
};

/**
 * Modüle özgü GİB banner HTML üretir. inline-style ile iframe'e güvenle enjekte edilebilir.
 * Ekleme kuralı: finalHtml içinde <body varsa body'nin açılışından hemen sonra,
 * yoksa en başa prepended edilir.
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
 * HTML içeriğine GİB banner'ı inject eder. Body varsa body'nin açılışından hemen sonra,
 * yoksa en başa prepended eder.
 */
export function injectModuleBadge(html: string, moduleId: string): string {
    const banner = renderGibBadge(moduleId);
    const bodyMatch = html.match(/<body[^>]*>/i);
    if (bodyMatch) {
        return html.replace(bodyMatch[0], bodyMatch[0] + banner);
    }
    // <body yok — HTML parçası olabilir (XSLT çıktısı sadece fragment ise),
    // bu durumda banner'ı en başa prepended et
    return banner + html;
}
