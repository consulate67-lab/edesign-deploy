/**
 * Tasarım sihirbazı belge türleri. Her tür bir UBL kök elemanına (family)
 * bağlıdır; kullanıcının yüklediği XSLT/XML bu aileye uymak zorundadır.
 */
export type DocFamily = 'invoice' | 'despatch' | 'receiptAdvice' | 'receipt';

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
    /** Geçerli InvoiceTypeCode / DespatchAdviceTypeCode değerleri — uymazsa uyarı verilir. */
    typeCodes?: string[];
    /** public/ altındaki varsayılan örnek XML. */
    sampleXml: string;
    /** GİB resmi paketlerindeki (UBL-TR 1.2.1, e-Fatura Paketi) örnek belgeler. */
    officialSamples?: OfficialSample[];
    defaults: DefaultXsltOption[];
}

export interface OfficialSample {
    /** public/ altındaki yol. */
    file: string;
    label: string;
    /** Senaryo / fatura tipi özeti. */
    tag: string;
}

const gibSample = (name: string, label: string, tag: string): OfficialSample =>
    ({ file: `ebelge/samples/gib/${name}`, label, tag });

/** GİB kod listesi (UBL-TR_Codelist.xml, e-Fatura Paketi 29) — ProfileIDType. */
export const EFATURA_PROFILE_IDS = [
    'TEMELFATURA', 'TICARIFATURA', 'YOLCUBERABERFATURA', 'IHRACAT', 'OZELFATURA', 'KAMU',
    'HKS', 'ENERJI', 'ILAC_TIBBICIHAZ', 'YATIRIMTESVIK', 'IDIS',
];
/** GİB kod listesi — ProfileIDTypeDespatchAdvice (irsaliye ve irsaliye yanıtı). */
export const DESPATCH_PROFILE_IDS = ['TEMELIRSALIYE', 'HKSIRSALIYE', 'IDISIRSALIYE'];
/** GİB kod listesi — InvoiceTypeCodeList. */
export const INVOICE_TYPE_CODES = [
    'SATIS', 'IADE', 'TEVKIFAT', 'TEVKIFATIADE', 'ISTISNA', 'OZELMATRAH', 'IHRACKAYITLI', 'SGK', 'KOMISYONCU',
    'HKSSATIS', 'HKSKOMISYONCU', 'KONAKLAMAVERGISI', 'SARJ', 'SARJANLIK', 'TEKNOLOJIDESTEK',
    'YTBSATIS', 'YTBIADE', 'YTBISTISNA', 'YTBTEVKIFAT', 'YTBTEVKIFATIADE',
];

export const FAMILY_INFO: Record<DocFamily, { root: string; ns: string; label: string }> = {
    invoice: { root: 'Invoice', ns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2', label: 'Fatura (Invoice)' },
    despatch: { root: 'DespatchAdvice', ns: 'urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2', label: 'İrsaliye (DespatchAdvice)' },
    receiptAdvice: { root: 'ReceiptAdvice', ns: 'urn:oasis:names:specification:ubl:schema:xsd:ReceiptAdvice-2', label: 'İrsaliye Yanıtı (ReceiptAdvice)' },
    receipt: { root: 'Receipt', ns: 'urn:oasis:names:specification:ubl:schema:xsd:Receipt-2', label: 'Makbuz (Receipt)' },
};

const inline = (key: string) => async () => (await import('../xsltContent')).getInlineXslt(key) ?? '';
const antrepo = (id: string) => async () => (await import('../xslt-editor/antrepoTemplates')).getAntrepoTemplateById(id)?.xslt ?? '';
const gallery = (id: string) => async () => (await import('../xslt-editor/templates')).TEMPLATES.find(t => t.id === id)?.xslt ?? '';

/**
 * GİB general.xslt başlıkta yalnızca e-Arşiv / e-FATURA ayrımı yapar; makbuz
 * türleri de e-FATURA görünmesin diye resmi tip kodlarına göre başlık eklenir.
 */
const GIB_TITLE_WHEN = /<xsl:when\s+test="\/\/n1:Invoice\/cbc:ProfileID='EARSIVFATURA'">/;
const GIB_EXTRA_TITLES = [
    `<xsl:when test="//n1:Invoice/cbc:InvoiceTypeCode='SERBESTMESLEKMAKBUZU'"><xsl:text>e-Serbest Meslek Makbuzu</xsl:text></xsl:when>`,
    `<xsl:when test="//n1:Invoice/cbc:InvoiceTypeCode='MUSTAHSILMAKBUZ'"><xsl:text>e-Müstahsil Makbuzu</xsl:text></xsl:when>`,
    `<xsl:when test="contains(//n1:Invoice/cbc:InvoiceTypeCode,'BILET') or contains(//n1:Invoice/cbc:ProfileID,'Bilet')"><xsl:text>e-Bilet</xsl:text></xsl:when>`,
].join('');
const gibOfficial = async () => {
    const xslt = await inline('gib/general.xslt')();
    return xslt.replace(GIB_TITLE_WHEN, (m) => GIB_EXTRA_TITLES + m);
};
const gibOption = (moduleId: string): DefaultXsltOption => ({
    id: `gib-resmi-${moduleId}`, label: 'GİB Resmi Şablon', description: 'ebelge.gib.gov.tr UBL-TR 1.2.1 resmi görünümü',
    moduleId, load: gibOfficial,
});

export const WIZARD_DOC_TYPES: WizardDocType[] = [
    {
        id: 'fatura', label: 'e-Fatura', description: 'Temel / Ticari e-Fatura', color: '#6366f1',
        family: 'invoice', profileIds: EFATURA_PROFILE_IDS, typeCodes: INVOICE_TYPE_CODES,
        sampleXml: 'ebelge/samples/e-Fatura-TEMEL.xml',
        officialSamples: [
            gibSample('TemelFaturaOrnegi.xml', 'Temel fatura', 'TEMELFATURA · SATIS'),
            gibSample('TicariFaturaOrnegi.xml', 'Ticari fatura', 'TICARIFATURA · SATIS'),
            gibSample('TEMEL_FATURA_KDV_SIFIR.xml', 'KDV sıfır temel fatura', 'TEMELFATURA · SATIS'),
            gibSample('IadeFaturasiOrnegi.xml', 'İade faturası', 'TICARIFATURA · IADE'),
            gibSample('TEVKIFAT.xml', 'Tevkifatlı fatura', 'TICARIFATURA · TEVKIFAT'),
            gibSample('ISTISNA-1.xml', 'İstisna faturası (1)', 'TICARIFATURA · ISTISNA'),
            gibSample('ISTISNA-2.xml', 'İstisna faturası (2)', 'TICARIFATURA · ISTISNA'),
            gibSample('OZELMATRAH.xml', 'Özel matrah', 'TICARIFATURA · OZELMATRAH'),
            gibSample('OTV.xml', 'ÖTV\'li fatura', 'TICARIFATURA · SATIS'),
            gibSample('HASTANE.xml', 'Hastane (protokol no)', 'TICARIFATURA · SATIS'),
            gibSample('HKS-Ornek1.xml', 'HKS satış (künye no)', 'HKS · SATIS'),
            gibSample('HKS-Ornek2.xml', 'HKS komisyoncu', 'HKS · KOMISYONCU'),
            gibSample('SARJ.xml', 'Elektrikli araç şarj', 'ENERJI · SARJ'),
            gibSample('SARJANLIK.xml', 'Anlık şarj', 'ENERJI · SARJANLIK'),
            gibSample('IDIS_Fatura.xml', 'IDIS (sevkiyat / etiket no)', 'IDIS · SATIS'),
            gibSample('YTB_Satis_EFatura.xml', 'Yatırım teşvik satış', 'YATIRIMTESVIK · SATIS'),
            gibSample('YTB_Istisna_EFatura.xml', 'Yatırım teşvik istisna', 'YATIRIMTESVIK · ISTISNA'),
            gibSample('YTB_Tevkifat_EFatura.xml', 'Yatırım teşvik tevkifat', 'YATIRIMTESVIK · TEVKIFAT'),
            gibSample('YTB_TevkifatIade_EFatura.xml', 'Yatırım teşvik tevkifat iade', 'YATIRIMTESVIK · TEVKIFATIADE'),
            gibSample('YTB_Iade_EFatura.xml', 'Yatırım teşvik iade', 'YATIRIMTESVIK · IADE'),
            gibSample('YTB_IadeIstisna_EFatura.xml', 'Yatırım teşvik istisna iade', 'YATIRIMTESVIK · IADE'),
        ],
        defaults: [
            gibOption('fatura'),
            { id: 'gib-fatura', label: 'Sade e-Fatura', description: 'GİB düzenine yakın, hafif şablon', moduleId: 'fatura', load: inline('gib/v2/e-Fatura-Sablon.xslt') },
            { id: 'antrepo-fatura', label: 'Antrepo e-Fatura', description: 'Logolu, banka bilgili profesyonel şablon', moduleId: 'antrepo-fatura', load: antrepo('antrepo-fatura') },
            { id: 'fatura-standart', label: 'Standart Fatura', description: 'Satır tablosu ve toplamlar', moduleId: 'fatura', load: gallery('fatura-standart') },
            { id: 'fatura-minimal', label: 'Minimal Fatura', description: 'Az alanlı, sade başlangıç', moduleId: 'fatura', load: gallery('fatura-minimal') },
        ],
    },
    {
        id: 'arsiv', label: 'e-Arşiv', description: 'e-Arşiv Fatura', color: '#10b981',
        family: 'invoice', profileIds: ['EARSIVFATURA'], typeCodes: INVOICE_TYPE_CODES,
        sampleXml: 'ebelge/samples/e-Arsiv-TEMEL.xml',
        officialSamples: [
            gibSample('YTB_Satis_EArsiv.xml', 'Yatırım teşvik satış', 'EARSIVFATURA · YTBSATIS'),
            gibSample('YTB_Istisna_EArsiv.xml', 'Yatırım teşvik istisna', 'EARSIVFATURA · YTBISTISNA'),
            gibSample('YTB_Tevkifat_EArsiv.xml', 'Yatırım teşvik tevkifat', 'EARSIVFATURA · YTBTEVKIFAT'),
            gibSample('YTB_TevkifatIade_EArsiv.xml', 'Yatırım teşvik tevkifat iade', 'EARSIVFATURA · YTBTEVKIFATIADE'),
            gibSample('YTB_Iade_EArsiv.xml', 'Yatırım teşvik iade', 'EARSIVFATURA · YTBIADE'),
            gibSample('YTB_IadeIstisna_EArsiv.xml', 'Yatırım teşvik istisna iade', 'EARSIVFATURA · YTBIADE'),
            gibSample('TEKNOLOJI_DESTEK.xml', 'Teknoloji destek (telefon / tablet)', 'EARSIVFATURA · TEKNOLOJIDESTEK'),
            gibSample('EArsiv_InternetSatis.xml', 'İnternet satışı (taşıyıcı + ödeme, türetilmiş)', 'EARSIVFATURA · SATIS'),
            gibSample('EArsiv_SARJ.xml', 'Elektrikli araç şarj (türetilmiş)', 'EARSIVFATURA · SARJ'),
            gibSample('EArsiv_SARJANLIK.xml', 'Anlık şarj (türetilmiş)', 'EARSIVFATURA · SARJANLIK'),
        ],
        defaults: [
            {
                id: 'gib-resmi-arsiv-2026', label: 'GİB Resmi e-Arşiv Şablonu (2026)',
                description: 'GİB e-Arşiv karekod standardıyla resmi görünüm', moduleId: 'arsiv', load: inline('gib/earsiv-2026.xslt'),
            },
            gibOption('arsiv'),
            { id: 'gib-arsiv', label: 'Sade e-Arşiv', description: 'GİB düzenine yakın, hafif şablon', moduleId: 'arsiv', load: inline('gib/v2/e-Arsiv-Sablon.xslt') },
            { id: 'antrepo-arsiv', label: 'Antrepo e-Arşiv', description: 'Logolu profesyonel şablon', moduleId: 'antrepo-arsiv', load: antrepo('antrepo-arsiv') },
            { id: 'arsiv-standart', label: 'Standart e-Arşiv', description: 'Satır tablosu ve toplamlar', moduleId: 'arsiv', load: gallery('arsiv-standart') },
            { id: 'arsiv-minimal', label: 'Minimal e-Arşiv', description: 'Az alanlı, sade başlangıç', moduleId: 'arsiv', load: gallery('arsiv-minimal') },
        ],
    },
    {
        id: 'irsaliye', label: 'e-İrsaliye', description: 'Sevk irsaliyesi', color: '#0ea5e9',
        family: 'despatch', profileIds: DESPATCH_PROFILE_IDS, typeCodes: ['SEVK', 'MATBUDAN'],
        sampleXml: 'ebelge/samples/e-Irsaliye-TEMEL.xml',
        officialSamples: [
            gibSample('Irsaliye-Ornek1.xml', 'Sevk irsaliyesi (şoför + taşıyıcı)', 'TEMELIRSALIYE · SEVK'),
            gibSample('Irsaliye-Ornek2.xml', 'Eksik gönderimli sevk', 'TEMELIRSALIYE · SEVK'),
            gibSample('Irsaliye-Ornek3.xml', 'Zincir teslim (satıcı / alıcı / asıl alıcı)', 'TEMELIRSALIYE · SEVK'),
            gibSample('Irsaliye-Matbudan.xml', 'Matbudan irsaliye', 'TEMELIRSALIYE · MATBUDAN'),
            gibSample('IDIS_Irsaliye.xml', 'IDIS irsaliye', 'IDISIRSALIYE · SEVK'),
            gibSample('HKS_Irsaliye.xml', 'HKS irsaliye (Örnek 1\'den türetilmiş)', 'HKSIRSALIYE · SEVK'),
        ],
        defaults: [
            { id: 'gib-resmi-irsaliye', label: 'GİB Resmi Şablon', description: 'ebelge.gib.gov.tr UBL-TR 1.2.1 resmi görünümü', moduleId: 'irsaliye', load: inline('gib/irsaliye.xslt') },
            { id: 'irsaliye', label: 'e-İrsaliye Şablonu', description: 'Araç / sürücü / teslimat bilgili', moduleId: 'irsaliye', load: inline('community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt') },
        ],
    },
    {
        id: 'irsaliye-yanit', label: 'e-İrsaliye Yanıtı', description: 'Kabul / kısmi kabul / red', color: '#06b6d4',
        family: 'receiptAdvice', profileIds: DESPATCH_PROFILE_IDS, typeCodes: ['SEVK'],
        sampleXml: 'ebelge/samples/gib/IrsaliyeYaniti-Ornek1.xml',
        officialSamples: [
            gibSample('IrsaliyeYaniti-Ornek1.xml', 'Tamamı kabul', 'TEMELIRSALIYE · KABUL'),
            gibSample('IrsaliyeYaniti-Ornek2.xml', 'Kabul, geç teslim notu', 'TEMELIRSALIYE · KABUL'),
            gibSample('IrsaliyeYaniti-Ornek3.xml', 'Kısmi kabul (hasarlı ürün reddi)', 'TEMELIRSALIYE · KISMİ KABUL'),
            gibSample('IrsaliyeYaniti-Ornek4.xml', 'Eksik ve fazla teslim', 'TEMELIRSALIYE · KISMİ KABUL'),
        ],
        defaults: [
            { id: 'gib-resmi-irsaliye-yanit', label: 'GİB Resmi Şablon', description: 'ebelge.gib.gov.tr UBL-TR 1.2.1 resmi irsaliye yanıtı görünümü', moduleId: 'irsaliye-yanit', load: inline('gib/irsaliye-yaniti.xslt') },
        ],
    },
    {
        id: 'ihracat', label: 'e-İhracat', description: 'İhracat faturası', color: '#8b5cf6',
        family: 'invoice', profileIds: ['IHRACAT', 'YOLCUBERABERFATURA'], typeCodes: INVOICE_TYPE_CODES,
        sampleXml: 'ebelge/samples/e-Ihracat-TEMEL.xml',
        officialSamples: [
            gibSample('IHRACAT.xml', 'İhracat faturası', 'IHRACAT · ISTISNA'),
            gibSample('YOLCUBERABER.xml', 'Yolcu beraber (tax free)', 'YOLCUBERABERFATURA · ISTISNA'),
        ],
        defaults: [
            gibOption('ihracat'),
            { id: 'ihracat', label: 'e-İhracat Şablonu', description: 'Teslim şartı ve GTİP alanlı', moduleId: 'ihracat', load: inline('community/IRPTeam-eFatura.xslt') },
        ],
    },
    {
        id: 'smm', label: 'e-SMM', description: 'Serbest meslek makbuzu', color: '#14b8a6',
        family: 'invoice', profileIds: ['EARSIVBELGE'],
        sampleXml: 'ebelge/samples/e-SMM-TEMEL.xml',
        defaults: [
            gibOption('smm'),
            { id: 'smm', label: 'e-SMM Şablonu', description: 'Stopaj ve hizmet bilgili', moduleId: 'smm', load: inline('community/hzkucuk-eFatura-smm.xslt') },
        ],
    },
    {
        id: 'mustahsil', label: 'e-Müstahsil', description: 'Müstahsil makbuzu', color: '#84cc16',
        family: 'invoice', profileIds: ['EARSIVBELGE'],
        sampleXml: 'ebelge/samples/e-Mustahsil-TEMEL.xml',
        defaults: [
            gibOption('mustahsil'),
            { id: 'mustahsil', label: 'e-Müstahsil Şablonu', description: 'Müstahsil / stopaj bilgili', moduleId: 'mustahsil', load: inline('community/hzkucuk-eFatura-mustahsil.xslt') },
        ],
    },
    {
        id: 'bilet', label: 'e-Bilet', description: 'Yolcu / etkinlik bileti', color: '#f97316',
        family: 'invoice',
        sampleXml: 'ebelge/samples/e-Bilet-TEMEL.xml',
        defaults: [
            gibOption('bilet'),
            { id: 'bilet', label: 'e-Bilet Şablonu', description: 'Yolcu, sefer ve koltuk bilgili', moduleId: 'bilet', load: inline('community/hzkucuk-eFatura-bilet.xslt') },
        ],
    },
];

export const sampleXmlUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export async function loadXmlFile(path: string): Promise<string> {
    const res = await fetch(sampleXmlUrl(path));
    if (!res.ok) throw new Error(`Örnek XML yüklenemedi (${res.status})`);
    return res.text();
}

export const loadSampleXml = (docType: WizardDocType) => loadXmlFile(docType.sampleXml);
