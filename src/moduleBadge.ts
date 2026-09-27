/**
 * Module Badge — Her module ozgu GIB e-Belge sistemi banner'i + modul-spesifik ekstra etiketler.
 *
 * Phase A.2: Topluluk XSLT'lerinin cogu tek bir base64 GIB logosu kullaniyor.
 * Selim'in geri bildirimi: "her modulun kendi GIB logosu olmali" -> bu runtime'da
 * eklenen ust-banner module ozgu renk + emoji + baslik ile modal kimlik verir.
 *
 * Faz 8.1 (Selim'in 'minimal dokunus' tercihi): e-SMM icin ekstra 'Ornek / luca Musavir'
 * kasesi de enjekte edilir.
 *
 * Production'da: Bu banner + kase sadece tasarimci preview'inda gorunur (URL srcDoc iframe).
 * Faz Faz 8+ sifirdan XSLT yazildiginda bu utility pasiflesecek.
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
        title: 'e-MÜSTAHSİL MAKBUZU',
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
 * Module ozgu GIB banner HTML uretir. inline-style ile iframe'e guvenle enjekte edilebilir.
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
 * Faz 8.1 — e-SMM icin 'Ornek / luca Musavir' kasesi.
 *
 * Selim'in paylastigi referans gorselinde (e-Serbest Meslek Makbuzu ornegi) acikca gorulen:
 *   - Ortada 'Ornek' yazisi
 *   - Altinda 'luca' logogram + 'MALI MUSAVIR' etiketi
 *
 * Bu kase sadece 'smm' modulu icin render edilir; digerleri icin bos string doner.
 */
export function renderSmmOrnekStamp(): string {
    return (
        `<div data-smm-ornek-stamp style="` +
        `position: relative;` +
        `display: flex; align-items: center; justify-content: center; gap: 18px;` +
        `padding: 12px 24px; margin: 0 0 8mm auto;` +
        `max-width: 260px;` +
        `background: #fff;` +
        `border: 2.5px dashed #c2410c;` +
        `border-radius: 6px;` +
        `font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;` +
        `color: #1f2937;` +
        `box-shadow: 0 2px 6px rgba(0,0,0,0.08);` +
        `transform: rotate(-3deg);` +
        `">` +
        `<span style="font-size: 16px; font-weight: 900; color: #c2410c; letter-spacing: 1.2px;">Örnek</span>` +
        `<span style="width: 1.5px; height: 36px; background: #d4d4d8;"></span>` +
        `<div style="display: flex; flex-direction: column; align-items: center; line-height: 1.05;">` +
        `<span style="display: flex; align-items: center;">` +
        `<span style="font-size: 22px; font-weight: 900; color: #1e3a8a; letter-spacing: -1px; font-style: italic;">l</span>` +
        `<span style="display: inline-flex; flex-direction: column; gap: 0;">` +
        `<span style="font-size: 9px; font-weight: 800; color: #1e3a8a; line-height: 1;">MALİ</span>` +
        `<span style="font-size: 9px; font-weight: 800; color: #1e3a8a; line-height: 1;">MÜŞAVİR</span>` +
        `</span>` +
        `<span style="font-size: 22px; font-weight: 900; color: #1e3a8a; letter-spacing: -1px; font-style: italic;">ca</span>` +
        `</span>` +
        `</div>` +
        `<span style="position: absolute; top: -8px; right: -8px; color: #dc2626; font-size: 16px;">★</span>` +
        `</div>`
    );
}

/**
 * HTML icerigine GIB banner'i (+ modul-spesifik ekstra kase) inject eder.
 * Body varsa body'nin acilisindan hemen sonra, yoksa en basa prepended edilir.
 */
export function injectModuleBadge(html: string, moduleId: string): string {
    const banner = renderGibBadge(moduleId);
    const extraStamp = moduleId === 'smm' ? renderSmmOrnekStamp() : '';
    const bodyMatch = html.match(/<body[^>]*>/i);
    if (bodyMatch) {
        return html.replace(bodyMatch[0], bodyMatch[0] + banner + extraStamp);
    }
    return banner + html;
}
