/**
 * Document Type Registry — single source of truth for supported e-document
 * types. Adding a new doc type is a data-only change; no code changes
 * required. The visual designer reads from this list to populate the
 * document picker, and validators pull rules per doc type.
 *
 * XSLT şablonları: public/ebelge/gib/ altında. Bunlar GİB'in
 * EBelgeGoruntuleyici.jar viewer'ından çıkarıldı (24.08.2026).
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
    | 'applicationResponse';

/** GİB'in resmi e-belge kategorileri. */
export type DocCategory = 'turkish' | 'peppol' | 'custom';

export interface DocTypeDefinition {
    id: DocTypeId;
    /** UBL root element local name, e.g. 'Invoice' */
    rootElement: string;
    /** Public path of the rendering XSLT (relative to /). */
    defaultTemplate: string;
    /** List of countries (ISO 3166-1 alpha-2) where this doc type is supported. */
    supportedCountries: string[];
    /** Whether this doc type requires a digital signature (e.g. Turkish e-Fatura). */
    requiresSignature: boolean;
    /** GİB/Peppol category for grouping. */
    category: DocCategory;
    /** UBL CustomizationID — used in cbc:CustomizationID. */
    customizationId: string;
    /** GİB ProfileID — used in cbc:ProfileID. */
    profileId: string;
    /** Default example XML in public/ebelge/samples/. */
    sampleXml?: string;
    /** Resmi GİB paket URL'si (referans için). */
    gibPackageUrl?: string;
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
} as const;

/**
 * Her belge türü için tam registry. GİB UBL-TR şablonlarına göre
 * düzenlenmiştir (CustomizationID, ProfileID, DocumentCurrencyCode).
 *
 * Not: GİB'in EBelgeGoruntuleyici.jar viewer'ı sadece e-Fatura için
 * rendering XSLT içerir. e-Arşiv, e-İrsaliye, e-İhracat, e-Makbuz için
 * şu anda resmi XSLT yayınlanmamıştır — e-Fatura şablonu Invoice
 * namespace'ini kullanan türler için fallback olarak kullanılır.
 */
export const docTypes: DocTypeDefinition[] = [
    {
        id: 'invoice',
        rootElement: 'Invoice',
        defaultTemplate: '/ebelge/gib/e-Fatura.xslt',
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
        defaultTemplate: '/ebelge/gib/e-Fatura.xslt',
        supportedCountries: ['TR', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'GB', 'SG', 'AU', 'NZ'],
        requiresSignature: true,
        category: 'peppol',
        customizationId: 'TR1.2',
        profileId: 'e-Fatura-Iade',
        sampleXml: '/ebelge/samples/e-Fatura-IADE.xml',
        gibPackageUrl: GIB_PACKAGES.eFatura,
        notes: 'CreditNote root element kullanır; GİB iade faturası için Invoice şablonu kullanılır.',
    },
    {
        id: 'despatchAdvice',
        rootElement: 'DespatchAdvice',
        defaultTemplate: '/ebelge/gib/e-Fatura.xslt',
        supportedCountries: ['TR', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'GB', 'SG', 'AU'],
        requiresSignature: false,
        category: 'turkish',
        customizationId: 'TR1.2',
        profileId: 'e-Irsaliye',
        sampleXml: '/ebelge/samples/e-Irsaliye-TEMEL.xml',
        gibPackageUrl: GIB_PACKAGES.eIrsaliye,
        notes: 'GİB e-İrsaliye paketinden XSLT çıkarılmamıştır. e-Fatura şablonu fallback olarak kullanılır (Invoice namespace\'i). GİB entegratöründen özel XSLT temin edilmeli.',
    },
    {
        id: 'order',
        rootElement: 'Order',
        defaultTemplate: '/ebelge/gib/e-Fatura.xslt',
        supportedCountries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'GB', 'SG', 'AU', 'NZ'],
        requiresSignature: false,
        category: 'peppol',
        customizationId: 'TR1.2',
        profileId: 'e-Siparis',
        sampleXml: undefined,
        notes: 'Peppol BIS Order profili. GİB kapsamında zorunlu değil.',
    },
    {
        id: 'orderResponse',
        rootElement: 'OrderResponse',
        defaultTemplate: '/ebelge/gib/UygulamaYaniti.xslt',
        supportedCountries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'GB', 'SG', 'AU'],
        requiresSignature: false,
        category: 'peppol',
        customizationId: 'TR1.2',
        profileId: 'e-SiparisYaniti',
        sampleXml: undefined,
        notes: 'Peppol BIS OrderResponse. Türk e-Belge kapsamı dışında.',
    },
    {
        id: 'receipt',
        rootElement: 'Receipt',
        defaultTemplate: '/ebelge/gib/e-Fatura.xslt',
        supportedCountries: ['TR'],
        requiresSignature: false,
        category: 'turkish',
        customizationId: 'TR1.2',
        profileId: 'e-Makbuz',
        sampleXml: '/ebelge/samples/e-Makbuz-TEMEL.xml',
        gibPackageUrl: GIB_PACKAGES.eMakbuz,
        notes: 'GİB e-Makbuz paketinden resmi XSLT çıkarılmamıştır. Receipt UBL doc type farklı olduğu için e-Fatura şablonu tam uyumlu değildir — özel XSLT gerekir.',
    },
    {
        id: 'applicationResponse',
        rootElement: 'ApplicationResponse',
        defaultTemplate: '/ebelge/gib/UygulamaYaniti.xslt',
        supportedCountries: ['TR'],
        requiresSignature: false,
        category: 'turkish',
        customizationId: 'TR1.2',
        profileId: 'GIB-UygulamaYaniti',
        sampleXml: undefined,
        gibPackageUrl: GIB_PACKAGES.eFatura,
        notes: 'GİB entegrasyon uygulama yanıtı (kabul/red). APRDefault.xslt kullanılır.',
    },
];

export const findDocType = (id: string): DocTypeDefinition | undefined =>
    docTypes.find((d) => d.id === id);

export const docTypesByCategory = (category: DocCategory) =>
    docTypes.filter((d) => d.category === category);

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
 * Tüm GİB belge türleri için örnek XML listesi. UI'da "Örnek yükle"
 * dropdown'ında kullanılabilir.
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
