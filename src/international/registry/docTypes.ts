/**
 * Document Type Registry — single source of truth for supported e-document
 * types. Adding a new doc type is a data-only change; no code changes
 * required. The visual designer reads from this list to populate the
 * document picker, and validators pull rules per doc type.
 *
 * XSLT kaynakları (Faz 9 güncellemesi):
 *  - public/ebelge/gib/        → GİB resmi viewer JAR'dan çıkarılan
 *  - public/ebelge/community/  → GitHub açık kaynak projelerden
 *
 * Namespace strategy: designer's UBL paths are namespace-prefix agnostic
 * (see normalizeXPath in designer/utils/xpathNormalize.ts), so the same
 * field catalog works across `cac:`/`cbc:` (UBL 2.1 / Peppol) and other
 * profiles.
 */

export type DocTypeId =
    | 'invoice'
    | 'creditNote'
    | 'despatchAdvice'
    | 'order'
    | 'orderResponse'
    | 'receipt'
    | 'applicationResponse'
    | 'smm'
    | 'mustahsil'
    | 'bilet'
    | 'microExport';

/** GİB'in resmi e-belge kategorileri. */
export type DocCategory = 'turkish' | 'peppol' | 'custom';

/**
 * Bir XSLT'nin nereden geldiğini işaretler — UI'da kullanıcıya
 * şeffaflık için kullanılabilir (ör. "GİB resmi" rozeti).
 */
export type XsltSource = 'gib-official' | 'community' | 'pending';

export interface DocTypeDefinition {
    id: DocTypeId;
    /** UBL root element local name, e.g. 'Invoice' */
    rootElement: string;
    /** Public path of the rendering XSLT (relative to /). */
    defaultTemplate: string;
    /** XSLT'nin kaynağı — UI rozetleme için. */
    xsltSource: XsltSource;
    /** List of countries (ISO 3166-1 alpha-2) where this doc type is supported. */
    supportedCountries: string[];
    /** Whether this doc type requires a digital signature. */
    requiresSignature: boolean;
    /** GİB/Peppol category for grouping. */
    category: DocCategory;
    /** UBL CustomizationID. */
    customizationId: string;
    /** GİB ProfileID. */
    profileId: string;
    /** Default example XML in public/ebelge/samples/. */
    sampleXml?: string;
    /** Resmi GİB paket URL'si (referans için). */
    gibPackageUrl?: string;
    /** GitHub kaynak repo (community XSLT'ler için). */
    sourceRepo?: string;
    /** Notlar / kısıtlamalar. */
    notes?: string;
}

/** GİB Resmi XSLT viewer base URL. */
export const GIB_VIEWER_BASE = 'https://ebelge.gib.gov.tr/EFaturaGoruntuleyici/Windows/Java17/';

/** Tüm GİB paket URL'leri (referans). */
export const GIB_PACKAGES = {
    eFatura: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-FaturaPaketi%20(29).zip',
    eArsiv: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/earsiv_paket_v1.1_8.zip',
    eIrsaliye: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eIrsaliyePaketi.zip',
    eIhracat: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eIhracatPaketi.zip',
    eMikroIhracat: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eMikroIhracatPaketi.zip',
    eMakbuz: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eMakbuzPaketi.zip',
    eSMM: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eSMM_Paketi.zip',
    eMustahsil: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eMustahsilPaketi.zip',
    eBilet: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eBiletPaketi.zip',
} as const;

/**
 * Her belge türü için tam registry. GİB UBL-TR şablonlarına göre
 * düzenlenmiştir (CustomizationID, ProfileID, DocumentCurrencyCode).
 *
 * Faz 9 — Topluluk XSLT'leri:
 *   e-İrsaliye için IRPTeam/eFaturaXSLT'den eWaybill.xslt kullanılıyor
 *   (GİB public URL'lerinde e-İrsaliye paketi mevcut değil).
 *
 * Bulunamayan türler (e-SMM, e-Müstahsil, e-Bilet, e-Makbuz, e-Mikro İhracat):
 *   GİB public olarak XSLT yayınlamıyor. hzkucuk/eFaturaEdit'in default.xslt
 *   şablonu Invoice namespace'ini kullanan türler için fallback olarak
 *   atandı. Gerçek çözüm: GİB entegratör firmalarından özel XSLT temini.
 */
export const docTypes: DocTypeDefinition[] = [
    {
        id: 'invoice',
        rootElement: 'Invoice',
        defaultTemplate: '/ebelge/gib/e-Fatura.xslt',
        xsltSource: 'gib-official',
        supportedCountries: ['TR', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PL', 'SE', 'FI', 'DK', 'NO', 'IE', 'PT', 'GB', 'SG', 'AU', 'NZ', 'JP'],
        requiresSignature: true,
        category: 'peppol',
        customizationId: 'TR1.2',
        profileId: 'e-Fatura',
        sampleXml: '/ebelge/samples/e-Fatura-TEMEL.xml',
        gibPackageUrl: GIB_PACKAGES.eFatura,
        notes: 'Ana şablon: GİB e-Fatura viewer\'dan çıkarılan default.xslt (82 KB, UBL Invoice-2).',
    },
    {
        id: 'creditNote',
        rootElement: 'CreditNote',
        defaultTemplate: '/ebelge/gib/e-Fatura-OzelMatrah.xslt',
        xsltSource: 'gib-official',
        supportedCountries: ['TR', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'GB', 'SG', 'AU', 'NZ'],
        requiresSignature: true,
        category: 'peppol',
        customizationId: 'TR1.2',
        profileId: 'e-Fatura-Iade',
        sampleXml: '/ebelge/samples/e-Fatura-IADE.xml',
        gibPackageUrl: GIB_PACKAGES.eFatura,
        notes: 'CreditNote root element kullanır; GİB iade faturası için ÖzelMatrah versiyonu kullanılır.',
    },
    {
        id: 'despatchAdvice',
        rootElement: 'DespatchAdvice',
        defaultTemplate: '/ebelge/community/IRPTeam-eWaybill-Irsaliye.xslt',
        xsltSource: 'community',
        supportedCountries: ['TR', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'GB', 'SG', 'AU'],
        requiresSignature: false,
        category: 'turkish',
        customizationId: 'TR1.2',
        profileId: 'e-Irsaliye',
        sampleXml: '/ebelge/samples/e-Irsaliye-TEMEL.xml',
        gibPackageUrl: GIB_PACKAGES.eIrsaliye,
        sourceRepo: 'https://github.com/IRPTeam/eFaturaXSLT',
        notes: 'Topluluk XSLT\'i (IRPTeam). GİB public olarak e-İrsaliye için XSLT yayınlamıyor — bu en iyi açık kaynak alternatifi.',
    },
    {
        id: 'order',
        rootElement: 'Order',
        defaultTemplate: '/ebelge/community/hzkucuk-eFatura.xslt',
        xsltSource: 'community',
        supportedCountries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'GB', 'SG', 'AU', 'NZ'],
        requiresSignature: false,
        category: 'peppol',
        customizationId: 'TR1.2',
        profileId: 'e-Siparis',
        notes: 'Peppol BIS Order profili. GİB kapsamında zorunlu değil.',
    },
    {
        id: 'orderResponse',
        rootElement: 'OrderResponse',
        defaultTemplate: '/ebelge/gib/UygulamaYaniti.xslt',
        xsltSource: 'gib-official',
        supportedCountries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'GB', 'SG', 'AU'],
        requiresSignature: false,
        category: 'peppol',
        customizationId: 'TR1.2',
        profileId: 'e-SiparisYaniti',
        notes: 'Peppol BIS OrderResponse. Türk e-Belge kapsamı dışında.',
    },
    {
        id: 'receipt',
        rootElement: 'Receipt',
        defaultTemplate: '/ebelge/community/hzkucuk-eFatura.xslt',
        xsltSource: 'community',
        supportedCountries: ['TR'],
        requiresSignature: false,
        category: 'turkish',
        customizationId: 'TR1.2',
        profileId: 'e-Makbuz',
        sampleXml: '/ebelge/samples/e-Makbuz-TEMEL.xml',
        gibPackageUrl: GIB_PACKAGES.eMakbuz,
        sourceRepo: 'https://github.com/hzkucuk/eFaturaEdit',
        notes: 'GİB e-Makbuz paketi public olarak XSLT içermiyor. hzkucuk/eFaturaEdit\'in default.xslt\'i fallback olarak kullanılır (Receipt UBL doc type farklı olduğu için tam uyumlu değildir).',
    },
    {
        id: 'smm',
        rootElement: 'Invoice',
        defaultTemplate: '/ebelge/community/hzkucuk-eFatura.xslt',
        xsltSource: 'community',
        supportedCountries: ['TR'],
        requiresSignature: true,
        category: 'turkish',
        customizationId: 'TR1.2_SMM',
        profileId: 'e-SMM',
        gibPackageUrl: GIB_PACKAGES.eSMM,
        sourceRepo: 'https://github.com/hzkucuk/eFaturaEdit',
        notes: 'Serbest Meslek Makbuzu. GİB public olarak XSLT yayınlamıyor. Topluluk fallback kullanılıyor.',
    },
    {
        id: 'mustahsil',
        rootElement: 'Receipt',
        defaultTemplate: '/ebelge/community/hzkucuk-eFatura.xslt',
        xsltSource: 'community',
        supportedCountries: ['TR'],
        requiresSignature: false,
        category: 'turkish',
        customizationId: 'TR1.2_MUSTAHSIL',
        profileId: 'e-Mustahsil',
        gibPackageUrl: GIB_PACKAGES.eMustahsil,
        sourceRepo: 'https://github.com/hzkucuk/eFaturaEdit',
        notes: 'Müstahsil Makbuzu. GİB public olarak XSLT yayınlamıyor. Topluluk fallback kullanılıyor.',
    },
    {
        id: 'bilet',
        rootElement: 'Invoice',
        defaultTemplate: '/ebelge/community/hzkucuk-eFatura.xslt',
        xsltSource: 'community',
        supportedCountries: ['TR'],
        requiresSignature: false,
        category: 'turkish',
        customizationId: 'TR1.2_BILET',
        profileId: 'e-Bilet',
        gibPackageUrl: GIB_PACKAGES.eBilet,
        sourceRepo: 'https://github.com/hzkucuk/eFaturaEdit',
        notes: 'e-Bilet. GİB public olarak XSLT yayınlamıyor. Topluluk fallback kullanılıyor.',
    },
    {
        id: 'microExport',
        rootElement: 'Invoice',
        defaultTemplate: '/ebelge/gib/e-Fatura.xslt',
        xsltSource: 'gib-official',
        supportedCountries: ['TR'],
        requiresSignature: false,
        category: 'turkish',
        customizationId: 'TR1.2_MIKROIHRACAT',
        profileId: 'e-MikroIhracat',
        sampleXml: '/ebelge/samples/e-Ihracat-TEMEL.xml',
        gibPackageUrl: GIB_PACKAGES.eMikroIhracat,
        notes: 'Mikro İhracat (e-İhracat\'ın alt türü). GİB public XSLT yok — e-Fatura.xslt fallback.',
    },
    {
        id: 'applicationResponse',
        rootElement: 'ApplicationResponse',
        defaultTemplate: '/ebelge/gib/UygulamaYaniti.xslt',
        xsltSource: 'gib-official',
        supportedCountries: ['TR'],
        requiresSignature: false,
        category: 'turkish',
        customizationId: 'TR1.2',
        profileId: 'GIB-UygulamaYaniti',
        gibPackageUrl: GIB_PACKAGES.eFatura,
        notes: 'GİB entegrasyon uygulama yanıtı (kabul/red). APRDefault.xslt kullanılır.',
    },
];

export const findDocType = (id: string): DocTypeDefinition | undefined =>
    docTypes.find((d) => d.id === id);

export const docTypesByCategory = (category: DocCategory) =>
    docTypes.filter((d) => d.category === category);

export const docTypesByXsltSource = (source: XsltSource) =>
    docTypes.filter((d) => d.xsltSource === source);

export const isCountrySupported = (id: DocTypeId, country: string): boolean => {
    const def = findDocType(id);
    return def ? def.supportedCountries.includes(country) : false;
};

/**
 * Doc type'ın GİB paket URL'sini döner. UI'da "GİB paketini indir" butonu
 * için kullanılabilir.
 */
export const gibPackageFor = (id: DocTypeId): string | undefined => {
    const def = findDocType(id);
    return def?.gibPackageUrl;
};

/**
 * UI dropdown'ında gösterilecek tüm örnek XML'leri döner.
 */
export const getAvailableSamples = (): Array<{ docTypeId: DocTypeId; path: string; label: string }> => {
    return docTypes
        .filter((d): d is DocTypeDefinition & { sampleXml: string } => !!d.sampleXml)
        .map((d) => ({
            docTypeId: d.id,
            path: d.sampleXml,
            label: `${d.profileId} örneği`,
        }));
};
