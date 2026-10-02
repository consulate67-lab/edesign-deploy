/**
 * Designer 2.0 — Default XSLT Loader (Phase A.1.2)
 *
 * Strateji:
 * 1. Önce generated.ts'den inline XSLT kullan (build-time embed, fetch/cache yok)
 * 2. Inline başarısızsa veya eksikse, public/ path'ten fetch et
 *
 * Phase A.1.2 düzeltmesi: Vite ?raw import .xslt için çalışmıyor,
 * build sırasında scripts/gen-xslt-defaults.cjs ile inline gömülüyor.
 */
import { DEFAULT_XSLT_PATHS, DEFAULT_XSLT_e_Fatura_Sablon, DEFAULT_XSLT_e_Arsiv_Sablon } from './xsltDefaults.generated';

const XSLT_PATHS: Record<string, string> = {
    fatura: 'ebelge/gib/v2/e-Fatura-Sablon.xslt',
    arsiv: 'ebelge/gib/v2/e-Arsiv-Sablon.xslt',
};

/**
 * moduleId'ye göre inline default XSLT döner (anında, fetch yok).
 * @param moduleId - DesignerApp.props.moduleId
 * @returns XSLT source string veya null (fallback için null)
 */
export function getDefaultXsltInline(moduleId?: string): string | null {
    if (!moduleId) return DEFAULT_XSLT_e_Fatura_Sablon;
    const id = moduleId.toLowerCase();
    if (id.startsWith('fatura') || id.startsWith('efatura')) return DEFAULT_XSLT_e_Fatura_Sablon;
    if (id.startsWith('arsiv') || id.startsWith('earsiv') || id === 'e-Arsiv-TEMEL') return DEFAULT_XSLT_e_Arsiv_Sablon;
    return DEFAULT_XSLT_e_Fatura_Sablon;
}

/**
 * moduleId'ye göre public path'i döner.
 */
export function getDefaultXsltPath(moduleId?: string): string {
    if (!moduleId) return XSLT_PATHS.fatura;
    const id = moduleId.toLowerCase();
    if (id.startsWith('fatura') || id.startsWith('efatura')) return XSLT_PATHS.fatura;
    if (id.startsWith('arsiv') || id.startsWith('earsiv') || id === 'e-Arsiv-TEMEL') return XSLT_PATHS.arsiv;
    return XSLT_PATHS.fatura;
}

/**
 * Public path'ten XSLT fetch eder (async, fallback için).
 * @returns XSLT source string, başarısızsa null
 */
export async function fetchDefaultXslt(moduleId?: string): Promise<string | null> {
    const path = getDefaultXsltPath(moduleId);
    // Birden fazla base URL dene — Vite base path + relative
    const baseUrls = [
        import.meta.env.BASE_URL,
        '/edesign-deploy/',
        '/',
    ];
    for (const base of baseUrls) {
        if (!base) continue;
        const url = `${base.replace(/\/$/, '')}/${path}`;
        try {
            const r = await fetch(url);
            if (!r.ok) {
                // eslint-disable-next-line no-console
                console.warn(`[xsltDefaults] fetch ${r.status}: ${url}`);
                continue;
            }
            let text = await r.text();
            // Sprint 4 ACİL — UTF-8 BOM strip (XSLT dosyaları EF BB BF ile başlıyor,
            // DOMParser ilk karakteri '<' olarak görmüyor → parse hatası)
            if (text.charCodeAt(0) === 0xFEFF) {
                text = text.slice(1);
            }
            if (text && text.length > 100) {
                // eslint-disable-next-line no-console
                console.log(`[xsltDefaults] fetched ${text.length} chars from ${url}`);
                return text;
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(`[xsltDefaults] fetch error ${url}:`, err);
        }
    }
    return null;
}

// DEFAULT_XSLT_PATHS generated'tan re-export (bilgi amaçlı)
export { DEFAULT_XSLT_PATHS };
