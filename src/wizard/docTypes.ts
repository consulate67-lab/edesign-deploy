/**
 * Tasarım sihirbazı belge türleri. Her tür bir UBL kök elemanına (family)
 * bağlıdır; kullanıcının yüklediği XSLT/XML bu aileye uymak zorundadır.
 */
export type DocFamily = 'invoice' | 'despatch' | 'receipt';

export interface DefaultXsltOption {
    id: string;
    label: string;
    description: string;
    /** XSLT editöründeki modül (dropdown) karşılığı. */
    moduleId: string;
    load: () => Promise<string>;
}

export interface WizardDocType {
    id: string;
    label: string;
    description: string;
    color: string;
    family: DocFamily;
    /** cbc:ProfileID beklenen değerleri — uymazsa uyarı verilir. */
    profileIds?: string[];
    /** public/ altındaki varsayılan örnek XML. */
    sampleXml: string;
    defaults: DefaultXsltOption[];
}

export const FAMILY_INFO: Record<DocFamily, { root: string; ns: string; label: string }> = {
    invoice: { root: 'Invoice', ns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2', label: 'Fatura (Invoice)' },
    despatch: { root: 'DespatchAdvice', ns: 'urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2', label: 'İrsaliye (DespatchAdvice)' },
    receipt: { root: 'Receipt', ns: 'urn:oasis:names:specification:ubl:schema:xsd:Receipt-2', label: 'Makbuz (Receipt)' },
};

const inline = (key: string) => async () => (await import('../xsltContent')).getInlineXslt(key) ?? '';
const antrepo = (id: string) => async () => (await import('../xslt-editor/antrepoTemplates')).getAntrepoTemplateById(id)?.xslt ?? '';
const gallery = (id: string) => async () => (await import('../xslt-editor/templates')).TEMPLATES.find(t => t.id === id)?.xslt ?? '';

export const WIZARD_DOC_TYPES: WizardDocType[] = [
    {
        id: 'fatura', label: 'e-Fatura', description: 'Temel / Ticari e-Fatura', color: '#6366f1',
        family: 'invoice', profileIds: ['TEMELFATURA', 'TICARIFATURA', 'KAMU'],
        sampleXml: 'ebelge/samples/e-Fatura-TEMEL.xml',
        defaults: [
            { id: 'gib-fatura', label: 'GİB e-Fatura Şablonu', description: 'Sade, resmi görünüm', moduleId: 'fatura', load: inline('gib/v2/e-Fatura-Sablon.xslt') },
            { id: 'antrepo-fatura', label: 'Antrepo e-Fatura', description: 'Logolu, banka bilgili profesyonel şablon', moduleId: 'antrepo-fatura', load: antrepo('antrepo-fatura') },
            { id: 'fatura-standart', label: 'Standart Fatura', description: 'Satır tablosu ve toplamlar', moduleId: 'fatura', load: gallery('fatura-standart') },
            { id: 'fatura-minimal', label: 'Minimal Fatura', description: 'Az alanlı, sade başlangıç', moduleId: 'fatura', load: gallery('fatura-minimal') },
        ],
    },
    {
        id: 'arsiv', label: 'e-Arşiv', description: 'e-Arşiv Fatura', color: '#10b981',
        family: 'invoice', profileIds: ['EARSIVFATURA'],
        sampleXml: 'ebelge/samples/e-Arsiv-TEMEL.xml',
        defaults: [
            { id: 'gib-arsiv', label: 'GİB e-Arşiv Şablonu', description: 'Sade, resmi görünüm', moduleId: 'arsiv', load: inline('gib/v2/e-Arsiv-Sablon.xslt') },
            { id: 'antrepo-arsiv', label: 'Antrepo e-Arşiv', description: 'Logolu profesyonel şablon', moduleId: 'antrepo-arsiv', load: antrepo('antrepo-arsiv') },
            { id: 'arsiv-standart', label: 'Standart e-Arşiv', description: 'Satır tablosu ve toplamlar', moduleId: 'arsiv', load: gallery('arsiv-standart') },
            { id: 'arsiv-minimal', label: 'Minimal e-Arşiv', description: 'Az alanlı, sade başlangıç', moduleId: 'arsiv', load: gallery('arsiv-minimal') },
        ],
    },
    {
        id: 'irsaliye', label: 'e-İrsaliye', description: 'Sevk irsaliyesi', color: '#0ea5e9',
        family: 'despatch',
        sampleXml: 'ebelge/samples/e-Irsaliye-TEMEL.xml',
        defaults: [
            { id: 'irsaliye', label: 'e-İrsaliye Şablonu', description: 'Araç / sürücü / teslimat bilgili', moduleId: 'irsaliye', load: inline('community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt') },
        ],
    },
    {
        id: 'ihracat', label: 'e-İhracat', description: 'İhracat faturası', color: '#8b5cf6',
        family: 'invoice', profileIds: ['IHRACAT'],
        sampleXml: 'ebelge/samples/e-Ihracat-TEMEL.xml',
        defaults: [
            { id: 'ihracat', label: 'e-İhracat Şablonu', description: 'Teslim şartı ve GTİP alanlı', moduleId: 'ihracat', load: inline('community/IRPTeam-eFatura.xslt') },
        ],
    },
    {
        id: 'smm', label: 'e-SMM', description: 'Serbest meslek makbuzu', color: '#14b8a6',
        family: 'invoice',
        sampleXml: 'ebelge/samples/e-SMM-TEMEL.xml',
        defaults: [
            { id: 'smm', label: 'e-SMM Şablonu', description: 'Stopaj ve hizmet bilgili', moduleId: 'smm', load: inline('community/hzkucuk-eFatura-smm.xslt') },
        ],
    },
    {
        id: 'mustahsil', label: 'e-Müstahsil', description: 'Müstahsil makbuzu', color: '#84cc16',
        family: 'invoice',
        sampleXml: 'ebelge/samples/e-Mustahsil-TEMEL.xml',
        defaults: [
            { id: 'mustahsil', label: 'e-Müstahsil Şablonu', description: 'Müstahsil / stopaj bilgili', moduleId: 'mustahsil', load: inline('community/hzkucuk-eFatura-mustahsil.xslt') },
        ],
    },
    {
        id: 'bilet', label: 'e-Bilet', description: 'Yolcu / etkinlik bileti', color: '#f97316',
        family: 'invoice',
        sampleXml: 'ebelge/samples/e-Bilet-TEMEL.xml',
        defaults: [
            { id: 'bilet', label: 'e-Bilet Şablonu', description: 'Yolcu, sefer ve koltuk bilgili', moduleId: 'bilet', load: inline('community/hzkucuk-eFatura-bilet.xslt') },
        ],
    },
];

export const sampleXmlUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export async function loadSampleXml(docType: WizardDocType): Promise<string> {
    const res = await fetch(sampleXmlUrl(docType.sampleXml));
    if (!res.ok) throw new Error(`Örnek XML yüklenemedi (${res.status})`);
    return res.text();
}
