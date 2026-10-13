import {
    countryDocuments, docTitle, findCountry, findDocumentProfile, generateSampleXml, KIND_SPECS,
    type CountryDocument, type DocLanguage, type IntlDocKind,
} from '../international';
import { CLASSIC_DESIGN_ID, composeInvoiceDesign, findInvoiceDesign, INVOICE_DESIGNS } from '../international/designs/invoiceDesigns';
import i18n, { currentLocale } from '../i18n';
import type { Messages } from '../i18n/locales/tr';
import type { DefaultXsltOption, DocFamily, OfficialSample, WizardDocType } from './docTypes';

type DesignId = Exclude<keyof Messages['intl']['designs'], 'classic'>;

type Titles = Partial<Record<DocLanguage, string>>;

/** Ulusal (UBL dışı) biçim: kendi görünümü, belge adları ve örnek ülkesi; Avrupa tasarımları uygulanmaz. */
interface NationalTemplate {
    name: string;
    country: string;
    titles: Partial<Record<IntlDocKind, Titles>>;
}

interface IntlTemplate {
    family: DocFamily;
    moduleId: string;
    inlineKey: string;
    labelKey: 'intl.invoiceTemplate' | 'intl.despatchTemplate';
    descriptionKey: 'intl.invoiceTemplateDesc' | 'intl.despatchTemplateDesc';
    sampleXml: string;
    national?: NationalTemplate;
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
    'us-dbna-ubl': { ...INVOICE_TEMPLATE, sampleXml: 'ebelge/samples/intl/US-invoice-en.xml' },
    'peppol-despatch-3': {
        family: 'despatch', moduleId: 'intl-despatch', inlineKey: 'intl/peppol-despatch-advice.xslt',
        labelKey: 'intl.despatchTemplate', descriptionKey: 'intl.despatchTemplateDesc',
        sampleXml: 'ebelge/samples/intl/Peppol-Irsaliye-NL.xml',
    },
    'ru-upd-503': {
        ...INVOICE_TEMPLATE, moduleId: 'intl-ru-upd', inlineKey: 'intl/ru-upd-503.xslt', sampleXml: 'ebelge/samples/intl/RU-invoice-ru.xml',
        national: {
            name: 'ФНС УПД 5.03', country: 'RU',
            titles: {
                invoice: { ru: 'Универсальный передаточный документ (УПД)', en: 'Universal transfer document (UPD)' },
                prepayment: { ru: 'Счёт-фактура на аванс', en: 'Advance VAT invoice' },
                despatch: { ru: 'Документ об отгрузке (УПД, ДОП)', en: 'Shipment document (UPD, DOP)' },
            },
        },
    },
    'cn-fully-digital': {
        ...INVOICE_TEMPLATE, moduleId: 'intl-cn-invoice', inlineKey: 'intl/cn-fully-digital.xslt', sampleXml: 'ebelge/samples/intl/CN-invoice-zh.xml',
        national: {
            name: '数电票 (全面数字化的电子发票)', country: 'CN',
            titles: {
                invoice: { zh: '电子发票（增值税专用发票）', en: 'Fully digitalised e-invoice (special VAT)' },
                credit: { zh: '红字电子发票', en: 'Red-letter e-invoice (credit)' },
            },
        },
    },
    'in-gst-einvoice': {
        ...INVOICE_TEMPLATE, moduleId: 'intl-in-einvoice', inlineKey: 'intl/in-gst-einvoice.xslt', sampleXml: 'ebelge/samples/intl/IN-invoice-en.xml',
        national: {
            name: 'GST e-Invoice INV-01', country: 'IN',
            titles: {
                invoice: { en: 'Tax Invoice (GST e-Invoice)', hi: 'कर बीजक (जीएसटी ई-इनवॉइस)' },
                credit: { en: 'Credit Note (GST e-Invoice)', hi: 'क्रेडिट नोट (जीएसटी ई-इनवॉइस)' },
            },
        },
    },
    'in-eway-bill': {
        family: 'despatch', moduleId: 'intl-in-ewaybill', inlineKey: 'intl/in-eway-bill.xslt',
        labelKey: 'intl.despatchTemplate', descriptionKey: 'intl.despatchTemplateDesc', sampleXml: 'ebelge/samples/intl/IN-despatch-en.xml',
        national: {
            name: 'E-Way Bill EWB-01', country: 'IN',
            titles: { despatch: { en: 'E-Way Bill (EWB-01)', hi: 'ई-वे बिल (EWB-01)' } },
        },
    },
    'br-nfe': {
        ...INVOICE_TEMPLATE, moduleId: 'intl-br-nfe', inlineKey: 'intl/br-nfe-danfe.xslt', sampleXml: 'ebelge/samples/intl/BR-invoice-pt.xml',
        national: {
            name: 'NF-e 4.00 · DANFE', country: 'BR',
            titles: {
                invoice: { pt: 'NF-e (DANFE)', en: 'Electronic invoice NF-e (DANFE)' },
                credit: { pt: 'NF-e de devolução', en: 'NF-e for returned goods' },
                corrected: { pt: 'NF-e complementar', en: 'Supplementary NF-e' },
            },
        },
    },
    'br-nfce': {
        ...INVOICE_TEMPLATE, moduleId: 'intl-br-nfce', inlineKey: 'intl/br-nfce.xslt', sampleXml: 'ebelge/samples/intl/BR-consumer-pt.xml',
        national: {
            name: 'NFC-e · DANFE NFC-e', country: 'BR',
            titles: { consumer: { pt: 'NFC-e (DANFE NFC-e)', en: 'Consumer e-invoice NFC-e' } },
        },
    },
    'br-nfse': {
        ...INVOICE_TEMPLATE, moduleId: 'intl-br-nfse', inlineKey: 'intl/br-nfse-danfse.xslt', sampleXml: 'ebelge/samples/intl/BR-service-pt.xml',
        national: {
            name: 'NFS-e Padrão Nacional · DANFSe', country: 'BR',
            titles: { service: { pt: 'NFS-e (DANFSe)', en: 'Service e-invoice NFS-e (DANFSe)' } },
        },
    },
    'br-cte': {
        family: 'despatch', moduleId: 'intl-br-cte', inlineKey: 'intl/br-cte-dacte.xslt',
        labelKey: 'intl.despatchTemplate', descriptionKey: 'intl.despatchTemplateDesc', sampleXml: 'ebelge/samples/intl/BR-despatch-pt.xml',
        national: {
            name: 'CT-e 4.00 · DACTE', country: 'BR',
            titles: { despatch: { pt: 'CT-e (DACTE)', en: 'Electronic bill of lading CT-e (DACTE)' } },
        },
    },
};

export const hasIntlTemplate = (profileId: string) => profileId in TEMPLATES;

const titleOf = (tpl: IntlTemplate, lang: DocLanguage, kind: IntlDocKind) => {
    const titles = tpl.national?.titles[kind];
    return titles ? titles[lang] ?? titles.en ?? Object.values(titles)[0] ?? docTitle(lang, kind) : docTitle(lang, kind);
};

const templateLabel = (tpl: IntlTemplate) => tpl.national?.name ?? i18n.t(tpl.labelKey);
const templateDescription = (tpl: IntlTemplate) => tpl.national ? i18n.t('intl.nationalTemplateDesc') : i18n.t(tpl.descriptionKey);

const LANG_PARAM = /(<xsl:param\s+name="lang"\s+select=")'[a-z]{2}'("\s*\/>)/;

/** Şablonun belge etiketlerini seçilen belge diline sabitler (editörde değiştirilebilir). */
export const withDocumentLanguage = (xslt: string, lang: DocLanguage) => xslt.replace(LANG_PARAM, `$1'${lang}'$2`);

const loadTemplate = async (tpl: IntlTemplate) => (await import('../xsltContent')).getInlineXslt(tpl.inlineKey) ?? '';

/** Fatura ailesinde tasarım uygulanmış şablon; classic (veya bilinmeyen) temel şablondur. */
const loadDesign = async (tpl: IntlTemplate, designId: string) => {
    const base = await loadTemplate(tpl);
    const design = tpl.family === 'invoice' && !tpl.national ? findInvoiceDesign(designId) : undefined;
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
        id: `${tpl.moduleId}-${lang}`, label: templateLabel(tpl), description: templateDescription(tpl), moduleId: tpl.moduleId,
        load: async () => withDocumentLanguage(await loadTemplate(tpl), lang),
    };
    if (tpl.family !== 'invoice' || tpl.national) return [classic];
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
    partial: '#4f46e5', selfbilled: '#be185d', despatch: '#0d9488', service: '#16a34a', consumer: '#ca8a04',
};

const sampleName = (country: string, kind: IntlDocKind, lang: DocLanguage) => `ebelge/samples/intl/${country}-${kind}-${lang}.xml`;

/** Ülkenin aynı şablonu kullanan diğer belgeleri (ör. fatura şablonunda iade faturası verisi). */
const siblingSamples = (country: string, current: CountryDocument, lang: DocLanguage): OfficialSample[] =>
    countryDocuments(country)
        .filter(d => d.kind !== current.kind && TEMPLATES[d.profileId]?.inlineKey === TEMPLATES[current.profileId]?.inlineKey)
        .map(d => ({
            file: sampleName(country, d.kind, lang),
            label: titleOf(TEMPLATES[d.profileId], lang, d.kind),
            tag: [i18n.t(`intl.kinds.${d.kind}`), TEMPLATES[d.profileId].national ? '' : KIND_SPECS[d.kind].typeCode].filter(Boolean).join(' · '),
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
        label: titleOf(tpl, lang, doc.kind),
        description: i18n.t(`intl.kindDesc.${doc.kind}`),
        color: KIND_COLORS[doc.kind],
        family: tpl.family,
        sampleXml: sampleName(country, doc.kind, lang),
        sampleText: () => generateSampleXml(country, doc.kind, lang, doc.profileId),
        officialSamples: [
            ...siblingSamples(country, doc, lang),
            ...(tpl.national ? [] : tpl.family === 'despatch' ? despatchSamples() : invoiceSamples()),
        ],
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
    } as WizardDocType;
}).concat(nationalModuleDocTypes());

function nationalModuleDocTypes(): WizardDocType[] {
    return Object.entries(TEMPLATES).flatMap(([profileId, tpl]) => {
        const national = tpl.national;
        const doc = national && countryDocuments(national.country).find(d => d.profileId === profileId);
        if (!national || !doc) return [];
        const lang = findCountry(national.country)?.docLanguages[0] ?? 'en';
        return [{
            id: tpl.moduleId, label: national.name, description: titleOf(tpl, lang, doc.kind), color: KIND_COLORS[doc.kind], family: tpl.family,
            sampleXml: tpl.sampleXml,
            sampleText: () => generateSampleXml(national.country, doc.kind, lang, profileId),
            defaults: [{ id: tpl.moduleId, label: national.name, description: templateDescription(tpl), moduleId: tpl.moduleId, load: () => loadTemplate(tpl) }],
            intlProfileId: profileId, country: national.country, intlKind: doc.kind, docLanguage: lang,
        }];
    });
}
