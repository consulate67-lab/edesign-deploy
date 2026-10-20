/**
 * Resmi GİB yayınları (official_artifacts) ile kullanıcı XSLT'sini hizalar.
 * Değiştirilmemiş resmi taban sessizce güncellenir; özelleştirilmiş resmi
 * tasarımlarda yalnız uyarı üretilir. Sektör/hazır özel şablonlara dokunulmaz.
 */
import { getInlineXslt } from './xsltContent';
import {
    fetchOfficialRevisions,
    getOfficialXsltOverride,
    revisionsAffecting,
    type PublicOfficialRevision,
} from './officialArtifacts';
import { designKeyOf } from './api';
import { stripLeadingBom, stripTestWatermark } from './xslt-editor/utils/testWatermark';
import { stripFieldGuide } from './xslt-editor/utils/fieldGuideMarker';

export type SyncResult =
    | { kind: 'noop'; xslt: string }
    | { kind: 'applied'; xslt: string }
    | { kind: 'review'; xslt: string; summary: string };

/** Karşılaştırma için gürültüyü (BOM, anahtar yorumu, satır sonu) temizler. */
export const normalizeXsltForCompare = (raw: string): string => {
    let s = stripFieldGuide(stripLeadingBom(stripTestWatermark(raw)));
    s = s.replace(/<!--\s*edesign-key:[^>]*?-->[ \t]*\r?\n?/gi, '');
    return s.replace(/\r\n/g, '\n').trim();
};

/** GİB resmi görselleştirme XSLT'sine özgü imza; sektör hazir şablonlarında yok. */
export const looksLikeOfficialGibXslt = (xslt: string): boolean =>
    /xmlns:lcl=["']http:\/\/www\.efatura\.gov\.tr\/local["']/i.test(xslt)
    || /<xsl:character-map\s+name=["']a["']/i.test(xslt);

export const designNeedsRevisionReview = (
    moduleId: string,
    xslt: string | null | undefined,
    revisions: PublicOfficialRevision[],
): PublicOfficialRevision[] => {
    if (!xslt || !looksLikeOfficialGibXslt(xslt) || designKeyOf(xslt)) return [];
    return revisionsAffecting(revisions, moduleId);
};

/**
 * Kullanıcı XSLT'si paket içi (eski) resmi tabanla aynıysa yeni yayına yükseltir.
 * Resmi tabandan türetilmiş ama özelleştirilmişse review döner.
 */
export async function syncOfficialBaseIfNeeded(
    userXslt: string,
    inlineKey: string | undefined,
    moduleId: string,
): Promise<SyncResult> {
    const cleaned = stripFieldGuide(stripLeadingBom(stripTestWatermark(userXslt)));
    if (!inlineKey || designKeyOf(cleaned)) return { kind: 'noop', xslt: cleaned };

    const override = await getOfficialXsltOverride(inlineKey);
    const bundled = getInlineXslt(inlineKey);
    const nUser = normalizeXsltForCompare(cleaned);

    if (override) {
        const nOverride = normalizeXsltForCompare(override);
        if (nUser === nOverride) return { kind: 'noop', xslt: cleaned };
        if (bundled && nUser === normalizeXsltForCompare(bundled)) {
            return { kind: 'applied', xslt: stripLeadingBom(override) };
        }
    }

    if (!looksLikeOfficialGibXslt(cleaned)) return { kind: 'noop', xslt: cleaned };

    const revs = designNeedsRevisionReview(moduleId, cleaned, await fetchOfficialRevisions());
    if (!revs.length) return { kind: 'noop', xslt: cleaned };

    const latest = revs[0];
    return {
        kind: 'review',
        xslt: cleaned,
        summary: latest.summary || latest.source_label,
    };
}

/** Modül için güncel resmi (veya paket içi) XSLT. */
export async function loadCurrentBaseXslt(inlineKey: string | undefined): Promise<string | null> {
    if (!inlineKey) return null;
    const override = await getOfficialXsltOverride(inlineKey);
    if (override) return stripLeadingBom(override);
    const bundled = getInlineXslt(inlineKey);
    return bundled ? stripLeadingBom(bundled) : null;
}
