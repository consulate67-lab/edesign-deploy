/**
 * Designer 2.0 — Default XSLT Loader (Phase 17.4.2 hibrit)
 *
 * Strateji: önce public/ klasöründen fetch et (cache-friendly),
 * başarısız olursa runtime'da ikinci kez dene.
 *
 * Neden hibrit: Vite ?raw import .xslt uzantısını çözemiyor (typescript
 * module declaration + assetsInclude yetersiz), public path ise GH Pages
 * cache süresi nedeniyle ilk deploy'da başarısız olabiliyor.
 *
 * Hibrit çözüm: public'ten fetch → başarısızsa kullanıcıya "XSLT yüklenmedi"
 * badge göster (placeholder HTML ile devam edilebilir).
 */

const XSLT_PATHS: Record<string, string> = {
    fatura: 'ebelge/gib/v2/e-Fatura-Sablon.xslt',
    arsiv: 'ebelge/gib/v2/e-Arsiv-Sablon.xslt',
};

/**
 * moduleId'ye göre default XSLT path'ini döner.
 */
export function getDefaultXsltPath(moduleId?: string): string {
    if (!moduleId) return XSLT_PATHS.fatura;
    const id = moduleId.toLowerCase();
    if (id.startsWith('fatura') || id.startsWith('efatura')) return XSLT_PATHS.fatura;
    if (id.startsWith('arsiv') || id.startsWith('earsiv') || id === 'e-Arsiv-TEMEL') return XSLT_PATHS.arsiv;
    return XSLT_PATHS.fatura;
}

/**
 * Public path'ten XSLT fetch eder (async).
 * @returns XSLT source string, başarısızsa null
 */
export async function fetchDefaultXslt(moduleId?: string): Promise<string | null> {
    const path = getDefaultXsltPath(moduleId);
    const baseUrl = import.meta.env.BASE_URL || '/edesign-deploy/';
    const url = `${baseUrl}${path}`;

    try {
        const r = await fetch(url);
        if (!r.ok) {
            // eslint-disable-next-line no-console
            console.warn(`[xsltDefaults] fetch ${r.status}: ${url}`);
            return null;
        }
        const text = await r.text();
        // eslint-disable-next-line no-console
        console.log(`[xsltDefaults] loaded ${text.length} chars from ${url}`);
        return text;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[xsltDefaults] fetch error:', err);
        return null;
    }
}
