/**
 * Faz A.1.1 — Inline XSLT Content
 *
 * 2026-09-26: GH Pages CDN'in bazi node'larinda dosyalar 404 donuyordu (kalici).
 * Cozum: XSLT dosyalarini build sirasinda bundle'a gom. Runtime'da fetch
 * yerine direkt kullan — CDN sorunu tamamen bypass olur.
 *
 * Vite `?raw` query'si ile dosyalar text olarak import edilir, build'de bundle'a dahil olur.
 */

// 2026-09-26: v2 path — fallback path'lerin tumunu inline embed ettik.
// Default template'ler + topluluk fallback'leri dahil.
// eger yeni XSLT eklenirse buraya da eklenmeli.
import eFaturaSablonRaw from '../public/ebelge/gib/v2/e-Fatura-Sablon.xslt?raw';
import eArsivSablonRaw from '../public/ebelge/gib/v2/e-Arsiv-Sablon.xslt?raw';

export const INLINE_XSLT_CONTENT: Record<string, string> = {
    'gib/v2/e-Fatura-Sablon.xslt': eFaturaSablonRaw,
    'gib/v2/e-Arsiv-Sablon.xslt': eArsivSablonRaw,
};

/**
 * Verilen template path icin inline content varsa doner, yoksa undefined.
 * Bu sayede Tasarimci fetch oncesi inline'a bakabilir.
 */
export const getInlineXslt = (templatePath: string): string | undefined => {
    return INLINE_XSLT_CONTENT[templatePath];
};

/**
 * Tum inline XSLT'lerin path listesi (debug icin).
 */
export const listInlineXslt = (): string[] => Object.keys(INLINE_XSLT_CONTENT);
