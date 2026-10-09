/**
 * Tasarım sihirbazı belge türleri. Her tür bir UBL kök elemanına (family)
 * bağlıdır; kullanıcının yüklediği XSLT/XML bu aileye uymak zorundadır.
 */
export type DocFamily = 'invoice' | 'despatch' | 'receiptAdvice' | 'receipt' | 'creditNote' | 'ebiletReport' | 'ebiletPassengerList';

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
    /** Örnek belgelerin kaynağını anlatan kısa not (varsayılan: UBL-TR / e-Fatura paketi). */
    officialNote?: string;
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
const biletSample = (name: string, label: string, tag: string): OfficialSample =>
    ({ file: `ebelge/samples/bilet/${name}`, label, tag });

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
/** e-Dekont Teknik Kılavuzu V1.4 — senaryolar ve iptal karşılıkları. */
export const DEKONT_PROFILE_IDS = ['DEKONT', 'DEKONTIPTAL', 'VTA', 'VTAIPTAL', 'GVTA', 'GVTAIPTAL'];
/** e-Dekont Teknik Kılavuzu V1.4 — bankalar ile ödeme / elektronik para kuruluşlarının (ÖK / EPK) işlem tipleri. */
export const DEKONT_TYPE_CODES = [
    'NKT', 'HVL', 'EFT', 'SWT', 'OKT', 'MOT', 'DVZ', 'KMI', 'ARB', 'NKR', 'GKR', 'KEI', 'KKI', 'YKI', 'DKI', 'DIGER',
    'EPIH', 'PAGO', 'PAL', 'POSH', 'FTM', 'FTK',
];

export const FAMILY_INFO: Record<DocFamily, { root: string; ns: string; label: string }> = {
    invoice: { root: 'Invoice', ns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2', label: 'Fatura (Invoice)' },
    despatch: { root: 'DespatchAdvice', ns: 'urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2', label: 'İrsaliye (DespatchAdvice)' },
    receiptAdvice: { root: 'ReceiptAdvice', ns: 'urn:oasis:names:specification:ubl:schema:xsd:ReceiptAdvice-2', label: 'İrsaliye Yanıtı (ReceiptAdvice)' },
    receipt: { root: 'Receipt', ns: 'urn:oasis:names:specification:ubl:schema:xsd:Receipt-2', label: 'Makbuz (Receipt)' },
    creditNote: { root: 'CreditNote', ns: 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2', label: 'CreditNote (Müstahsil, Gider Pusulası, Döviz, Dekont, Sigorta Komisyon)' },
    // e-Bilet paketi (ebilet.xsd): iki kök aynı namespace'i paylaşır, aile kök adıyla ayrılır.
    ebiletReport: { root: 'eBilet', ns: 'http://ebilet.efatura.gov.tr', label: 'e-Bilet Raporu (eBilet)' },
    ebiletPassengerList: { root: 'eYolcuListesi', ns: 'http://ebilet.efatura.gov.tr', label: 'e-Yolcu Listesi (eYolcuListesi)' },
};

const inline = (key: string) => async () => (await import('../xsltContent')).getInlineXslt(key) ?? '';
const antrepo = (id: string) => async () => (await import('../xslt-editor/antrepoTemplates')).getAntrepoTemplateById(id)?.xslt ?? '';

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
            { id: 'gib-resmi-fatura', label: 'GİB Resmi Şablon', description: 'UBL-TR 1.2.1 e-Fatura görünümü, banka bilgili ve düzenlenebilir', moduleId: 'fatura', load: antrepo('antrepo-fatura') },
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
            { id: 'gib-resmi-arsiv', label: 'GİB Resmi Şablon', description: 'UBL-TR 1.2.1 e-Arşiv görünümü, banka bilgili ve düzenlenebilir', moduleId: 'arsiv', load: antrepo('antrepo-arsiv') },
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
        id: 'mikro-ihracat', label: 'e-Mikro İhracat', description: 'ETGB ile posta / kargo ihracatı (e-Arşiv)', color: '#9f1239',
        family: 'invoice', profileIds: ['EARSIVFATURA'], typeCodes: ['ISTISNA'],
        sampleXml: 'ebelge/hazir/atolye-deri-canta-mikro.xml',
        defaults: [
            gibOption('mikro_ihracat'),
            { id: 'mikro-ihracat', label: 'e-Mikro İhracat Şablonu', description: 'ETGB, taşıyıcı ve döviz alanlı', moduleId: 'mikro_ihracat', load: inline('community/IRPTeam-eFatura.xslt') },
        ],
    },
    {
        id: 'smm', label: 'e-SMM', description: 'Serbest meslek makbuzu', color: '#14b8a6',
        family: 'invoice', profileIds: ['EARSIVBELGE'], typeCodes: ['SERBESTMESLEKMAKBUZU'],
        sampleXml: 'ebelge/samples/e-SMM-TEMEL.xml',
        officialSamples: [
            gibSample('ESMM-Stopaj-KDV.xml', 'Avukat, stopaj + KDV (türetilmiş)', 'EARSIVBELGE · GV stopajı %20'),
            gibSample('ESMM-KDV-Tevkifat.xml', 'KDV tevkifatlı (türetilmiş)', 'EARSIVBELGE · 602 tevkifat 9/10'),
            gibSample('ESMM-Nihai-Tuketici.xml', 'Mükellef olmayan hasta, kartla tahsilat (türetilmiş)', 'EARSIVBELGE · TCKN, stopajsız'),
            gibSample('ESMM-Doviz-Istisna.xml', 'Döviz, hizmet ihracatı istisnası (türetilmiş)', 'EARSIVBELGE · USD · 302'),
        ],
        defaults: [
            {
                id: 'gib-smm-karekod', label: 'e-SMM (GİB karekod standardı)',
                description: 'Brüt/net ücret, stopaj, KDV tevkifatı ve e-SMM karekodu', moduleId: 'smm', load: inline('gib/v2/e-SMM-Sablon.xslt'),
            },
            gibOption('smm'),
            { id: 'smm', label: 'e-SMM Topluluk Şablonu', description: 'Fatura düzeninde topluluk şablonu (hzkucuk)', moduleId: 'smm', load: inline('community/hzkucuk-eFatura-smm.xslt') },
        ],
    },
    {
        id: 'mustahsil', label: 'e-Müstahsil', description: 'Müstahsil makbuzu', color: '#84cc16',
        family: 'creditNote', profileIds: ['EARSIVBELGE'], typeCodes: ['MUSTAHSILMAKBUZ'],
        sampleXml: 'ebelge/samples/gib/Mustahsil-Kesintili.xml',
        officialSamples: [
            gibSample('Mustahsil-Kilavuz.xml', 'Kılavuz V1.1 örneği: büyükbaş hayvan (türetilmiş)', 'EARSIVBELGE · GV stopajı %2'),
            gibSample('Mustahsil-Kesintili.xml', 'Hububat, tüm kesintiler (türetilmiş)', 'EARSIVBELGE · stopaj, borsa, mera, SGK'),
            gibSample('Mustahsil-Hayvansal.xml', 'Çiğ süt, dönemlik alım (türetilmiş)', 'EARSIVBELGE · stopaj %1, SGK'),
        ],
        defaults: [
            {
                id: 'gib-mustahsil-makbuzu', label: 'e-Müstahsil Makbuzu (GİB kılavuzu V1.1)',
                description: 'CreditNote yapısı, kesintiler, SMS doğrulama ve e-MM karekodu', moduleId: 'mustahsil', load: inline('gib/v2/e-Mustahsil-Makbuzu.xslt'),
            },
        ],
    },
    {
        id: 'gider-pusulasi', label: 'e-Gider Pusulası', description: 'Mükellef olmayandan alım, nihai tüketici iadesi', color: '#65a30d',
        family: 'creditNote', profileIds: ['GIDERPUSULASI'], typeCodes: ['SATIS', 'IADE'],
        sampleXml: 'ebelge/samples/gib/GiderPusulasi-SATIS.xml',
        officialSamples: [
            gibSample('GiderPusulasi-SATIS.xml', 'Mükellef olmayandan alım, SMS kodlu', 'GIDERPUSULASI · SATIS'),
            gibSample('GiderPusulasi-IADE-IadeKodu.xml', 'e-Arşiv faturalı iade, kargo + iade kodu', 'GIDERPUSULASI · IADE · EARSIV_FATURA'),
            gibSample('GiderPusulasi-IADE-SMS.xml', 'Satış fişli iade, adına iade eden + SMS', 'GIDERPUSULASI · IADE · SATIS_FISI'),
            gibSample('GiderPusulasi-IADE-Belgesiz.xml', 'Belgesiz iade (TCKN zorunlu)', 'GIDERPUSULASI · IADE · BELGESIZ'),
        ],
        officialNote: 'Örnekler ve şablon GİB e-Gider Pusulası Paketi (Teknik Kılavuz V1.0) içinden olduğu gibi alındı.',
        defaults: [
            {
                id: 'gib-gider-pusulasi', label: 'GİB Resmi e-Gider Pusulası Şablonu',
                description: 'Paketteki resmi görünüm: iade belgesi, kargo, SMS / iade kodu ve karekod', moduleId: 'gider-pusulasi', load: inline('gib/gider-pusulasi.xslt'),
            },
        ],
    },
    {
        id: 'doviz', label: 'e-Döviz / Kıymetli Maden', description: 'Döviz ve kıymetli maden alım-satım belgesi', color: '#ca8a04',
        family: 'creditNote', profileIds: ['EDOVIZBELGE', 'EKIYMETLIMADENBELGE'], typeCodes: ['ALIM', 'SATIM'],
        sampleXml: 'ebelge/samples/gib/Doviz-Alim.xml',
        officialSamples: [
            gibSample('Doviz-Alim.xml', 'Döviz alım (EUR karşılığı TL)', 'EDOVIZBELGE · ALIM'),
            gibSample('Doviz-Satim.xml', 'Döviz satım (TL karşılığı EUR)', 'EDOVIZBELGE · SATIM'),
            gibSample('KiymetliMaden-Alim.xml', 'Çeyrek altın alım', 'EKIYMETLIMADENBELGE · ALIM'),
            gibSample('KiymetliMaden-Satim.xml', 'Çeyrek altın satım', 'EKIYMETLIMADENBELGE · SATIM'),
        ],
        officialNote: 'Örnekler ve şablonlar e-Döviz ve Kıymetli Maden Alım-Satım Belgesi Paketi V1.3 içinden alındı; ALIM ve SATIM için ayrı resmi XSLT vardır.',
        defaults: [
            {
                id: 'gib-doviz-alim', label: 'GİB Resmi Alım Belgesi Şablonu',
                description: 'ALIM tipi döviz ve kıymetli maden belgeleri (paketteki alim.xslt)', moduleId: 'doviz', load: inline('gib/doviz-maden-alim.xslt'),
            },
            {
                id: 'gib-doviz-satim', label: 'GİB Resmi Satım Belgesi Şablonu',
                description: 'SATIM tipi döviz ve kıymetli maden belgeleri (paketteki satim.xslt)', moduleId: 'doviz-satim', load: inline('gib/doviz-maden-satim.xslt'),
            },
        ],
    },
    {
        id: 'dekont', label: 'e-Dekont', description: 'Banka, ödeme ve elektronik para kuruluşu dekontu', color: '#0f766e',
        family: 'creditNote', profileIds: DEKONT_PROFILE_IDS, typeCodes: DEKONT_TYPE_CODES,
        sampleXml: 'ebelge/samples/gib/Dekont-NKT.xml',
        officialSamples: [
            gibSample('Dekont-NKT.xml', 'Banka: nakit işlemi', 'DEKONT · NKT'),
            gibSample('Dekont-VTA.xml', 'Vergi tahsil alındısı, kredi kartıyla', 'VTA · KKI'),
            gibSample('Dekont-GVTA.xml', 'Gümrük vergisi tahsil alındısı, havale', 'GVTA · HVL'),
            gibSample('Dekont-EPIH.xml', 'ÖK / EPK: elektronik para ihracı', 'DEKONT · EPIH'),
            gibSample('Dekont-PAL.xml', 'ÖK / EPK: para alma', 'DEKONT · PAL'),
            gibSample('Dekont-PAGO.xml', 'ÖK / EPK: para gönderme', 'DEKONT · PAGO'),
            gibSample('Dekont-POSH.xml', 'ÖK / EPK: POS hizmeti (sanal POS)', 'DEKONT · POSH'),
            gibSample('Dekont-FTM.xml', 'ÖK / EPK: fatura tahsilatı (müşteri)', 'DEKONT · FTM'),
            gibSample('Dekont-FTK.xml', 'ÖK / EPK: fatura tahsilatı (kurum)', 'DEKONT · FTK'),
        ],
        officialNote: 'Örnekler e-Dekont paketinden (Kılavuz V1.4) alındı. Pakette ayrı XSLT dosyası yok; şablon, ÖK / EPK örneklerine gömülü resmi XSLT\'den çıkarıldı.',
        defaults: [
            {
                id: 'gib-dekont', label: 'GİB Resmi e-Dekont Şablonu',
                description: 'Banka ve ÖK / EPK dekontları için paketteki resmi görünüm (karekodlu)', moduleId: 'dekont', load: inline('gib/dekont.xslt'),
            },
        ],
    },
    {
        id: 'sigorta-komisyon', label: 'e-Sigorta Komisyon Gider', description: 'Sigorta ve emeklilik komisyon gider belgesi', color: '#4f46e5',
        family: 'creditNote', profileIds: ['EARSIVBELGE'], typeCodes: ['SIGORTAKOMISYONGIDERBELGESI'],
        sampleXml: 'ebelge/samples/gib/SigortaKomisyonGider.xml',
        officialSamples: [
            gibSample('SigortaKomisyonGider.xml', 'Dönemlik komisyon: istihsal + iptal', 'EARSIVBELGE · SIGORTAKOMISYONGIDERBELGESI'),
        ],
        officialNote: 'Örnek ve şablon e-Sigorta Komisyon Gider Belgesi Paketi V1.2 içinden alındı.',
        defaults: [
            {
                id: 'gib-sigorta-komisyon', label: 'GİB Resmi e-Sigorta Komisyon Gider Belgesi Şablonu',
                description: 'Dönem, istihsal / iptal komisyonları ve karekod', moduleId: 'sigorta-komisyon', load: inline('gib/sigorta-komisyon-gider.xslt'),
            },
        ],
    },
    {
        id: 'bilet', label: 'e-Bilet', description: 'Yolcu / etkinlik bileti', color: '#f97316',
        family: 'invoice',
        sampleXml: 'ebelge/samples/e-Bilet-TEMEL.xml',
        // GİB e-Bilet için UBL yayımlamaz; görsel bilet UBL Invoice taşıyıcısıyla tasarlanır.
        officialSamples: [
            biletSample('e-Bilet-Karayolu.xml', 'Otobüs bileti, gider gösteren mükellefli (türetilmiş)', 'Karayolu · 509 IV.7.3.1.1'),
            biletSample('e-Bilet-Havayolu.xml', 'Uçak bileti + ek bagaj, IATA 13 haneli no (türetilmiş)', 'Havayolu · 509 IV.7.3.2.1'),
            biletSample('e-Bilet-Etkinlik.xml', 'Tiyatro bileti, etkinlik yeri ve koltuk (türetilmiş)', 'Etkinlik · 509 IV.7.3.3.1'),
            biletSample('e-Bilet-Iade.xml', 'Ücret iadesi e-Bileti (türetilmiş)', 'Havayolu · IADE'),
        ],
        officialNote: 'GİB e-Bilet için UBL yayımlamaz; örnekler 509 s. VUK GT IV.7.3 zorunlu bilgileriyle UBL-TR yapısında türetildi.',
        defaults: [
            {
                id: 'bilet-509', label: 'e-Bilet (509 zorunlu bilgiler)',
                description: 'Yolcu, seyahat / etkinlik zamanı ve yeri, hizmetin nevi, ödeme türü', moduleId: 'bilet', load: inline('ebilet/ebilet-gorsel.xslt'),
            },
            gibOption('bilet'),
            { id: 'bilet', label: 'e-Bilet Şablonu', description: 'Yolcu, sefer ve koltuk bilgili', moduleId: 'bilet', load: inline('community/hzkucuk-eFatura-bilet.xslt') },
        ],
    },
    {
        id: 'bilet-rapor', label: 'e-Bilet Raporu', description: 'Aylık GİB e-Bilet raporu (eBilet XML)', color: '#ea580c',
        family: 'ebiletReport',
        sampleXml: 'ebelge/samples/gib/eBilet-Rapor-Karayolu.xml',
        officialSamples: [
            gibSample('eBilet-Rapor-Karayolu.xml', 'Otobüs / feribot: açık bilet, iptal, tazminat (kılavuzdan derlenmiş)', 'ebilet.xsd · 16 haneli bilet no'),
            gibSample('eBilet-Rapor-Havayolu.xml', 'Havayolu: döviz, mil, bagaj, iade + XAdES-A (kılavuzdan derlenmiş)', 'ebilet.xsd · 13 haneli bilet no'),
            gibSample('eBilet-Rapor-Etkinlik.xml', 'Sinema, tiyatro, maç: eğlence vergisi, bedelsiz (kılavuzdan derlenmiş)', 'ebilet.xsd · etkinlikZamani'),
        ],
        officialNote: 'e-Bilet paketinde örnek XML yok; örnekler teknik kılavuzlardan derlendi ve ebilet.xsd ile doğrulandı.',
        defaults: [
            { id: 'bilet-rapor', label: 'e-Bilet Raporu Görünümü', description: 'Dönem özeti, bilet ve iptal tabloları', moduleId: 'bilet-rapor', load: inline('ebilet/ebilet-rapor.xslt') },
        ],
    },
    {
        id: 'bilet-yolcu', label: 'e-Yolcu Listesi', description: 'Sefer yolcu listesi (eYolcuListesi XML)', color: '#c2410c',
        family: 'ebiletPassengerList',
        sampleXml: 'ebelge/samples/gib/eYolcuListesi-YurtIci.xml',
        officialSamples: [
            gibSample('eYolcuListesi-YurtIci.xml', 'Yurt içi otobüs seferi, taşıtı işleten bilgili (kılavuzdan derlenmiş)', 'ebilet.xsd · TCKN'),
            gibSample('eYolcuListesi-Uluslararasi.xml', 'Uluslararası sefer, pasaportlu yolcular (kılavuzdan derlenmiş)', 'ebilet.xsd · pasaport no'),
        ],
        officialNote: 'e-Bilet paketinde örnek XML yok; örnekler e-Yolcu Listesi kılavuzundan derlendi ve ebilet.xsd ile doğrulandı.',
        defaults: [
            { id: 'bilet-yolcu', label: 'e-Yolcu Listesi Görünümü', description: 'Sefer, koltuk ve yolcu tablosu', moduleId: 'bilet-yolcu', load: inline('ebilet/ebilet-yolcu-listesi.xslt') },
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
