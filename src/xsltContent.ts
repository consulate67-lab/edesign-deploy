/**
 * Faz A.1.1 — Inline XSLT Content
 *
 * 2026-09-26: GH Pages CDN'in bazi node'larinda dosyalar 404 donuyordu (kalici).
 * Cozum: XSLT dosyalarini build sirasinda bundle'a gom. Runtime'da fetch
 * yerine direkt kullan — CDN sorunu tamamen bypass olur.
 *
 * Vite `?raw` query'si ile dosyalar text olarak import edilir, build'de bundle'a dahil olur.
 *
 * 2026-09-26 (genisletme): Faz A.1.2 — 7 ek modul (irsaliye, ihracat, mikro_ihracat,
 * smm, mustahsil, bilet, makbuz) icin topluluk XSLT'leri de inline edildi.
 * Not: Topluluk XSLT'leri base64 GIB logosu icerir (her biri 100+ KB) — bundle
 * boyutu 500 KB gzip ile artar. Faz 8+ icin sifirdan minimal XSLT yazildiginda
 * buradan cikarilabilir.
 */

// 2026-09-26: v2 path — fallback path'lerin tumunu inline embed ettik.
// Default template'ler + topluluk fallback'leri dahil.
// eger yeni XSLT eklenirse buraya da eklenmeli.
// GİB resmi görselleştirme dosyaları (UBL-TR 1.2.1 paketi, ebelge.gib.gov.tr)
import gibGeneralRaw from '../public/ebelge/gib/general.xslt?raw';
import gibIrsaliyeRaw from '../public/ebelge/gib/irsaliye.xslt?raw';
import gibIrsaliyeYanitiRaw from '../public/ebelge/gib/irsaliye-yaniti.xslt?raw';
// GİB e-Arşiv görselleştirmesi (2026) — UBL-TR 1.2.1 YTB e-Arşiv örneklerine gömülü resmi XSLT
import gibEarsivRaw from '../public/ebelge/gib/earsiv-2026.xslt?raw';
import eFaturaSablonRaw from '../public/ebelge/gib/v2/e-Fatura-Sablon.xslt?raw';
import eArsivSablonRaw from '../public/ebelge/gib/v2/e-Arsiv-Sablon.xslt?raw';
// Topluluk fallback'leri — 7 modul icin (Faz A.1.2)
import irsaliyeAracliRaw from '../public/ebelge/community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt?raw';
import iracatRaw from '../public/ebelge/community/IRPTeam-eFatura.xslt?raw';
import smmRaw from '../public/ebelge/community/hzkucuk-eFatura-smm.xslt?raw';
import mustahsilRaw from '../public/ebelge/community/hzkucuk-eFatura-mustahsil.xslt?raw';
import biletRaw from '../public/ebelge/community/hzkucuk-eFatura-bilet.xslt?raw';
import makbuzRaw from '../public/ebelge/community/hzkucuk-eFatura-makbuz.xslt?raw';

export const INLINE_XSLT_CONTENT: Record<string, string> = {
    'gib/general.xslt': gibGeneralRaw,
    'gib/irsaliye.xslt': gibIrsaliyeRaw,
    'gib/irsaliye-yaniti.xslt': gibIrsaliyeYanitiRaw,
    'gib/earsiv-2026.xslt': gibEarsivRaw,
    // Faz A.1 — minimal XSLT'ler (gib/v2/)
    'gib/v2/e-Fatura-Sablon.xslt': eFaturaSablonRaw,
    'gib/v2/e-Arsiv-Sablon.xslt': eArsivSablonRaw,
    // Faz A.1.2 — topluluk XSLT'leri (community/)
    // e-İrsaliye: aracli versiyon (sürücü/mal kabul yeri eklemeli)
    'community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt': irsaliyeAracliRaw,
    // e-İhracat ve e-Mikro İhracat: ayni XSLT (Invoice-2 bazli)
    'community/IRPTeam-eFatura.xslt': iracatRaw,
    // e-SMM, e-Müstahsil, e-Bilet, e-Makbuz: hzkucuk topluluk XSLT'leri
    'community/hzkucuk-eFatura-smm.xslt': smmRaw,
    'community/hzkucuk-eFatura-mustahsil.xslt': mustahsilRaw,
    'community/hzkucuk-eFatura-bilet.xslt': biletRaw,
    'community/hzkucuk-eFatura-makbuz.xslt': makbuzRaw,
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
