import {
    countryDocuments, docTitle, findDocumentProfile, generateSampleXml, KIND_SPECS,
    type CountryDocument, type DocLanguage, type IntlDocKind,
} from '../international';
import { CLASSIC_DESIGN_ID, composeInvoiceDesign, findInvoiceDesign, INVOICE_DESIGNS } from '../international/designs/invoiceDesigns';
import i18n, { currentLocale } from '../i18n';
import type { Messages } from '../i18n/locales/tr';
import type { DefaultXsltOption, DocFamily, OfficialSample, WizardDocType } from './docTypes';

type DesignId = Exclude<keyof Messages['intl']['designs'], 'classic'>;

interface IntlTemplate {
    family: DocFamily;
    moduleId: string;
    inlineKey: string;
    labelKey: 'intl.invoiceTemplate' | 'intl.despatchTemplate';
    descriptionKey: 'intl.invoiceTemplateDesc' | 'intl.despatchTemplateDesc';
    sampleXml: string;
}

const percent = (...rates: number[]) => {
    const fmt = new Intl.NumberFormat(currentLocale(), { style: 'percent', maximumFractionDigits: 1 });
    return `${i18n.t('intl.vat')} ${rates.map(r => fmt.format(r / 100)).join(' / ')}`;
};

const intlSample = (name: string, label: string, tag: string): OfficialSample =>
    ({ file: `ebelge/samples/intl/${name}`, label, tag });

const invoiceSamples = (): OfficialSample[] => [
    intlSample('Peppol-BIS3-Fatura-BE.xml', i18n.t('intl.samples.be'), `Peppol BIS 3 · ${percent(21)}`),
    intlSample('XRechnung-3-UBL-Fatura-DE.xml', i18n.t('intl.samples.de'), `XRechnung 3.0 · ${percent(19, 7)}`),
    intlSample('EN16931-UBL-Fatura-FR.xml', i18n.t('intl.samples.fr'), `EN 16931 · ${percent(5.5, 20)}`),
];
const despatchSamples = (): OfficialSample[] => [
    intlSample('Peppol-Irsaliye-NL.xml', i18n.t('intl.samples.nl'), 'Peppol DA 3 · SSCC, GTIN'),
];

const INVOICE_TEMPLATE = {
    family: 'invoice' as const, moduleId: 'intl-invoice', inlineKey: 'intl/en16931-invoice.xslt',
    labelKey: 'intl.invoiceTemplate' as const, descriptionKey: 'intl.invoiceTemplateDesc' as const,
};

/**
 * Şablonu olan Avrupa profilleri. Fatura profillerinin hepsi aynı EN 16931 UBL
 * şablonunu kullanır (Invoice + CreditNote); sevk belgesi Peppol DA 3 şablonunu.
 */
const TEMPLATES: Record<string, IntlTemplate> = {
    'en16931-ubl': { ...INVOICE_TEMPLATE, sampleXml: 'ebelge/samples/intl/EN16931-UBL-Fatura-FR.xml' },
    'peppol-bis-billing-3': { ...INVOICE_TEMPLATE, sampleXml: 'ebelge/samples/intl/Peppol-BIS3-Fatura-BE.xml' },
    'de-xrechnung-ubl': { ...INVOICE_TEMPLATE, sampleXml: 'ebelge/samples/intl/XRechnung-3-UBL-Fatura-DE.xml' },
    'ro-cius': { ...INVOICE_TEMPLATE, sampleXml: 'ebelge/samples/intl/EN16931-UBL-Fatura-FR.xml' },
    'hr-cius': { ...INVOICE_TEMPLATE, sampleXml: 'ebelge/samples/intl/EN16931-UBL-Fatura-FR.xml' },
    'pt-cius-pt': { ...INVOICE_TEMPLATE, sampleXml: 'ebelge/samples/intl/EN16931-UBL-Fatura-FR.xml' },
    'peppol-despatch-3': {
        family: 'despatch', moduleId: 'intl-despatch', inlineKey: 'intl/peppol-despatch-advice.xslt',
        labelKey: 'intl.despatchTemplate', descriptionKey: 'intl.despatchTemplateDesc',
        sampleXml: 'ebelge/samples/intl/Peppol-Irsaliye-NL.xml',
    },
};

export const hasIntlTemplate = (profileId: string) => profileId in TEMPLATES;

const LANG_PARAM = /(<xsl:param\s+name="lang"\s+select=")'[a-z]{2}'("\s*\/>)/;

/** Şablonun belge etiketlerini seçilen belge diline sabitler (editörde değiştirilebilir). */
export const withDocumentLanguage = (xslt: string, lang: DocLanguage) => xslt.replace(LANG_PARAM, `$1'${lang}'$2`);

const loadTemplate = async (tpl: IntlTemplate) => (await import('../xsltContent')).getInlineXslt(tpl.inlineKey) ?? '';

/** Fatura ailesinde tasarım uygulanmış şablon; classic (veya bilinmeyen) temel şablondur. */
const loadDesign = async (tpl: IntlTemplate, designId: string) => {
    const base = await loadTemplate(tpl);
    const design = tpl.family === 'invoice' ? findInvoiceDesign(designId) : undefined;
    return design ? composeInvoiceDesign(base, design) : base;
};

/** Profilin şablonu, etiketleri belge diline sabitlenmiş olarak; şablonu yoksa boş. */
export const loadIntlXslt = async (profileId: string, lang: DocLanguage, designId = CLASSIC_DESIGN_ID) => {
    const tpl = TEMPLATES[profileId];
    return tpl ? withDocumentLanguage(await loadDesign(tpl, designId), lang) : '';
};

/** Belge türü için tasarım sırası: klasik, türe önerilenler, diğerleri. */
export const invoiceDesignIds = (kind?: IntlDocKind) => {
    const recommended = INVOICE_DESIGNS.filter(d => kind && d.recommended?.includes(kind));
    return [CLASSIC_DESIGN_ID, ...recommended.map(d => d.id), ...INVOICE_DESIGNS.filter(d => !recommended.includes(d)).map(d => d.id)];
};

const designOptions = (tpl: IntlTemplate, lang: DocLanguage, kind?: IntlDocKind): DefaultXsltOption[] => {
    const classic: DefaultXsltOption = {
        id: `${tpl.moduleId}-${lang}`, label: i18n.t(tpl.labelKey), description: i18n.t(tpl.descriptionKey), moduleId: tpl.moduleId,
        load: async () => withDocumentLanguage(await loadTemplate(tpl), lang),
    };
    if (tpl.family !== 'invoice') return [classic];
    return invoiceDesignIds(kind).map(id => id === CLASSIC_DESIGN_ID
        ? { ...classic, label: i18n.t('intl.designs.classic.name'), description: i18n.t('intl.designs.classic.desc') }
        : {
            id: `${tpl.moduleId}-${id}-${lang}`,
            label: i18n.t(`intl.designs.${id as DesignId}.name`),
            description: i18n.t(`intl.designs.${id as DesignId}.desc`),
            moduleId: tpl.moduleId,
            recommended: !!(kind && findInvoiceDesign(id)?.recommended?.includes(kind)),
            load: async () => withDocumentLanguage(await loadDesign(tpl, id), lang),
        });
};

const KIND_COLORS: Record<IntlDocKind, string> = {
    invoice: '#2563eb', credit: '#ea580c', corrected: '#7c3aed', prepayment: '#0891b2',
    partial: '#4f46e5', selfbilled: '#be185d', despatch: '#0d9488',
};

const sampleName = (country: string, kind: IntlDocKind, lang: DocLanguage) => `ebelge/samples/intl/${country}-${kind}-${lang}.xml`;

/** Ülkenin aynı şablonu kullanan diğer belgeleri (ör. fatura şablonunda iade faturası verisi). */
const siblingSamples = (country: string, current: CountryDocument, lang: DocLanguage): OfficialSample[] =>
    countryDocuments(country)
        .filter(d => d.kind !== current.kind && TEMPLATES[d.profileId]?.family === TEMPLATES[current.profileId]?.family)
        .map(d => ({
            file: sampleName(country, d.kind, lang),
            label: docTitle(lang, d.kind),
            tag: [i18n.t(`intl.kinds.${d.kind}`), KIND_SPECS[d.kind].typeCode].filter(Boolean).join(' · '),
            text: () => generateSampleXml(country, d.kind, lang, d.profileId),
        }));

/**
 * Ülke + belge türü + belge dili için sihirbaz türü. Ad belge dilinde (ülkedeki adı),
 * açıklamalar arayüz dilinde; şablon, belge dili parametresiyle yüklenir.
 */
export function countryDocType(country: string, doc: CountryDocument, lang: DocLanguage): WizardDocType | null {
    const tpl = TEMPLATES[doc.profileId];
    const profile = findDocumentProfile(doc.profileId);
    if (!tpl || !profile || profile.implementation !== 'available') return null;
    return {
        id: `intl-${country}-${doc.kind}-${lang}`,
        label: docTitle(lang, doc.kind),
        description: i18n.t(`intl.kindDesc.${doc.kind}`),
        color: KIND_COLORS[doc.kind],
        family: tpl.family,
        sampleXml: sampleName(country, doc.kind, lang),
        sampleText: () => generateSampleXml(country, doc.kind, lang, doc.profileId),
        officialSamples: [...siblingSamples(country, doc, lang), ...(tpl.family === 'despatch' ? despatchSamples() : invoiceSamples())],
        officialNote: i18n.t('intl.countrySamplesNote'),
        defaults: designOptions(tpl, lang, doc.kind),
        intlProfileId: doc.profileId,
        country,
        intlKind: doc.kind,
        docLanguage: lang,
    };
}

/** Ülkenin hazır belge türleri seçilen belge dilinde. */
export const countryDocTypes = (country: string, lang: DocLanguage): WizardDocType[] =>
    countryDocuments(country).map(d => countryDocType(country, d, lang)).filter((t): t is WizardDocType => !!t);

/** Kayıtlı tasarımların modül kimliğinden (intl-invoice / intl-despatch) önizleme türü. */
export const intlModuleDocTypes = (): WizardDocType[] => ([
    { id: 'intl-invoice', profile: 'peppol-bis-billing-3', labelKey: 'intl.moduleInvoice' },
    { id: 'intl-despatch', profile: 'peppol-despatch-3', labelKey: 'intl.moduleDespatch' },
] as const).map(({ id, profile, labelKey }) => {
    const tpl = TEMPLATES[profile];
    return {
        id, label: i18n.t(labelKey), description: i18n.t('intl.europeanProfile'), color: '#2563eb', family: tpl.family, sampleXml: tpl.sampleXml,
        defaults: [{ id, label: i18n.t(tpl.labelKey), description: i18n.t(tpl.descriptionKey), moduleId: tpl.moduleId, load: () => loadTemplate(tpl) }],
        intlProfileId: profile,
    };
});
