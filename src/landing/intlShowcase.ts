import { countryDocuments, type CountryDocument } from '../international/registry/countryDocuments';
import { countryName, countryProfiles, type UiLanguage } from '../international/registry/countryProfiles';
import { findDocumentProfile } from '../international/registry/documentProfiles';
import type { IntlDocKind } from '../international/docText/types';
import type { PreviewSource } from './HeroPreview';

/** Türkçe dışındaki dillerde giriş sayfasında dönen Avrupa belge türleri (tip kodu UNTDID 1001). */
export const INTL_SHOWCASE_DOCS: { id: IntlDocKind; code: string; a: string }[] = [
    { id: 'invoice', code: '380', a: '#2563eb' },
    { id: 'credit', code: '381', a: '#ea580c' },
    { id: 'corrected', code: '384', a: '#7c3aed' },
    { id: 'prepayment', code: '386', a: '#0891b2' },
    { id: 'partial', code: '326', a: '#4f46e5' },
    { id: 'despatch', code: 'DA', a: '#0d9488' },
];

/** Ülke seçilmemişse ya da Türkiye ise önizlemede önce gösterilen ülke. */
const LANGUAGE_COUNTRY: Record<Exclude<UiLanguage, 'tr'>, string> = { en: 'GB', de: 'DE', fr: 'FR', es: 'ES' };
const FOREIGN_COUNTRIES = countryProfiles.map(c => c.code).filter(c => c !== 'TR');

/** round: kaçıncı ülke; fatura türlerinde her ülke sıradaki hazır tasarımla gösterilir. */
const loadPreview = async (country: string, doc: CountryDocument, lang: UiLanguage, round: number): Promise<[string, string]> => {
    const [{ loadIntlXslt, invoiceDesignIds }, { generateSampleXml }] = await Promise.all([import('../wizard/intlDocTypes'), import('../international')]);
    const designs = invoiceDesignIds(doc.kind);
    return [await loadIntlXslt(doc.profileId, lang, designs[round % designs.length]), generateSampleXml(country, doc.kind, lang, doc.profileId)];
};

/**
 * Belge türünün önizleme kaynakları: ziyaretçinin ülkesi önce, sonra türü destekleyen
 * diğer ülkeler; aynı türe her dönüşte sıradaki ülkenin örnek verisi ve sıradaki tasarım gösterilir.
 */
export const intlPreviewSources = (
    kind: string, lang: Exclude<UiLanguage, 'tr'>, country: string | null, sampleLabel: (country: string) => string,
): PreviewSource[] => {
    const first = country && country !== 'TR' && FOREIGN_COUNTRIES.includes(country) ? country : LANGUAGE_COUNTRY[lang];
    const countries = [first, ...FOREIGN_COUNTRIES.filter(c => c !== first)].flatMap((code) => {
        const doc = countryDocuments(code).find(d => d.kind === kind);
        return doc ? [{ code, doc }] : [];
    });
    return countries.map(({ code, doc }, round) => ({
        key: `intl-${code}-${kind}-${lang}`,
        name: findDocumentProfile(doc.profileId)?.name ?? doc.profileId,
        subtitle: sampleLabel(countryName(code, lang)),
        xslt: '', xml: '',
        load: () => loadPreview(code, doc, lang, round),
    }));
};
