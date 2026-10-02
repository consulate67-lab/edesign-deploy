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
            // Sprint 4 ACİL v4 — ÇÖZÜM:
            // Server UTF-8 BOM (EF BB BF) gönderiyor ama browser response.text()
            // CP1254 (Türkçe Windows default) ile decode ediyor → ï»¿ (U+00EF U+00BB U+00BF)
            // Bu decode edilmiş halini de strip etmek gerekiyor.
            let text = await r.text();
            // Üç katmanlı: BOM (U+FEFF) + Latin-1 BOM (U+00EF U+00BB U+00BF) + whitespace/invisible
            text = text.replace(/^[\u00EF\u00BB\u00BF\uFEFF\u200B\u00A0\s]+/, '');
            if (text && text.length > 100) {
                // eslint-disable-next-line no-console
                console.log(
                    `[xsltDefaults] fetched ${text.length} chars from ${url} · first 20: ${JSON.stringify(text.slice(0, 20))}`
                );
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
