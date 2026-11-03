import { countryDocuments, KIND_SPECS, type CountryDocument } from '../international/registry/countryDocuments';
import { countryName, countryProfiles, type UiLanguage } from '../international/registry/countryProfiles';
import { findDocumentProfile } from '../international/registry/documentProfiles';
import type { IntlDocKind } from '../international/docText/types';
import { languageCountry } from '../i18n/region';
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

const KIND_ACCENT: Record<IntlDocKind, string> = {
    invoice: '#2563eb',
    credit: '#ea580c',
    corrected: '#7c3aed',
    prepayment: '#0891b2',
    partial: '#4f46e5',
    selfbilled: '#9333ea',
    despatch: '#0d9488',
    service: '#059669',
    consumer: '#db2777',
};

/** Önizleme ve belge chip dönüşünde gezen ülkeler (TR hariç; ulusal + EN 16931). */
export const SHOWCASE_COUNTRY_ORDER = [
    'GB', 'DE', 'FR', 'ES', 'RU', 'CN', 'BR', 'US', 'IN', 'NL', 'BE', 'AT', 'IT', 'PL', 'PT', 'RO', 'HR',
] as const;

const FOREIGN_COUNTRIES = countryProfiles.map(c => c.code).filter(c => c !== 'TR');

export interface ShowcaseLandingDoc {
    label: string;
    code: string;
    id: string;
    a: string;
    country: string;
}

const typeCodeOf = (kind: IntlDocKind, profileId: string): string => {
    const spec = KIND_SPECS[kind]?.typeCode;
    if (spec) return spec;
    if (profileId.startsWith('br-nfe')) return '55';
    if (profileId.startsWith('br-nfce')) return '65';
    if (profileId.startsWith('br-nfse')) return 'SE';
    if (profileId.startsWith('br-cte')) return '57';
    if (kind === 'despatch') return 'DA';
    return kind.slice(0, 2).toUpperCase();
};

/** Ülkenin hazır belge türleri (yerel ad + tip kodu); giriş sayfası chip’leri için. */
export const landingDocsForCountry = (
    country: string,
    kindLabel: (kind: IntlDocKind) => string,
): ShowcaseLandingDoc[] =>
    countryDocuments(country as never).map((d) => ({
        id: d.kind,
        label: kindLabel(d.kind),
        code: typeCodeOf(d.kind, d.profileId),
        a: KIND_ACCENT[d.kind] ?? '#2563eb',
        country,
    }));

/** Ziyaretçi ülkesi önce; ardından SHOWCASE sırası. Yalnız belge tanımlı ülkeler. */
export const showcaseCountryQueue = (lang: Exclude<UiLanguage, 'tr'>, visitorCountry: string | null): string[] => {
    const first = visitorCountry && visitorCountry !== 'TR' && FOREIGN_COUNTRIES.includes(visitorCountry)
        ? visitorCountry
        : languageCountry(lang);
    const rest = SHOWCASE_COUNTRY_ORDER.filter((c) => c !== first && countryDocuments(c).length > 0);
    return [first, ...rest].filter((c, i, a) => countryDocuments(c).length > 0 && a.indexOf(c) === i);
};

/**
 * Adım sayacına göre ülke + o ülkenin belge türleri.
 * Ülke belgelerini bitirince sıradaki ülkeye geçilir (arka arkaya ülke dizaynları).
 */
export const showcaseAtStep = (
    step: number,
    lang: Exclude<UiLanguage, 'tr'>,
    visitorCountry: string | null,
    kindLabel: (kind: IntlDocKind) => string,
): { country: string; docs: ShowcaseLandingDoc[]; docIdx: number; active: ShowcaseLandingDoc; next: ShowcaseLandingDoc } => {
    const queue = showcaseCountryQueue(lang, visitorCountry);
    const blocks = queue.map((code) => ({ code, docs: landingDocsForCountry(code, kindLabel) }));
    const flat = blocks.flatMap((b) => b.docs);
    if (!flat.length) {
        const country = languageCountry(lang);
        const fallback: ShowcaseLandingDoc[] = INTL_SHOWCASE_DOCS.map((d) => ({
            id: d.id,
            code: d.code,
            a: d.a,
            label: kindLabel(d.id),
            country,
        }));
        const i = step % fallback.length;
        return {
            country,
            docs: fallback,
            docIdx: i,
            active: fallback[i],
            next: fallback[(i + 1) % fallback.length],
        };
    }
    const i = ((step % flat.length) + flat.length) % flat.length;
    const active = flat[i];
    const docs = blocks.find((b) => b.code === active.country)?.docs ?? [active];
    const docIdx = Math.max(0, docs.findIndex((d) => d.id === active.id && d.code === active.code));
    return {
        country: active.country,
        docs,
        docIdx,
        active,
        next: flat[(i + 1) % flat.length],
    };
};

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
    const first = country && country !== 'TR' && FOREIGN_COUNTRIES.includes(country) ? country : languageCountry(lang);
    const countries = [first, ...FOREIGN_COUNTRIES.filter(c => c !== first)].flatMap((code) => {
        const doc = countryDocuments(code).find(d => d.kind === kind);
        return doc ? [{ code, doc }] : [];
    });
    return countries.map(({ code, doc }, round) => ({
        key: `intl-${code}-${kind}-${lang}`,
        name: findDocumentProfile(doc.profileId)?.name ?? doc.profileId,
        subtitle: sampleLabel(countryName(code, lang)),
        load: () => loadPreview(code, doc, lang, round),
    }));
};

/** Tek ülke için önizleme (giriş sayfası dönüşünde aktif ülke). */
export const intlPreviewSourcesForCountry = (
    kind: string, lang: Exclude<UiLanguage, 'tr'>, country: string, sampleLabel: (country: string) => string,
): PreviewSource[] => {
    const doc = countryDocuments(country).find(d => d.kind === kind);
    if (!doc) return intlPreviewSources(kind, lang, country, sampleLabel);
    return [{
        key: `intl-${country}-${kind}-${lang}`,
        name: findDocumentProfile(doc.profileId)?.name ?? doc.profileId,
        subtitle: sampleLabel(countryName(country, lang)),
        load: () => loadPreview(country, doc, lang, 0),
    }];
};
