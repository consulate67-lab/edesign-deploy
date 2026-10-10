/**
 * Ülke → belge ailesi → XML profili kaydı.
 *
 * Türkiye'deki üç temel belgenin Avrupa karşılıkları (10.10.2026 itibarıyla):
 *  - e-Fatura   → her ülkede bir EN 16931 / ulusal fatura profili var.
 *  - e-Arşiv    → yalnız IT (FatturaPA B2C), RO (CIUS-RO B2C) ve gönüllü PL (KSeF)
 *                 faturanın kendisini XML olarak ister; diğer bazı ülkeler
 *                 yalnız vergi idaresine bildirim/kayıt XML'i ister.
 *  - e-İrsaliye → alıcıya giden zorunlu elektronik sevk belgesi Avrupa'da yok;
 *                 bazı ülkeler vergi idaresine sevkiyat bildirimi ister, diğerlerinde
 *                 Peppol BIS Despatch Advice 3 isteğe bağlıdır.
 *
 * Bildirim (reporting) profilleri alıcıya giden belge değildir; vergi
 * idaresine gönderilen veridir. Arayüzde bu ayrım korunmalıdır.
 */

import type { CountryCode } from './countryProfiles';

export type DocumentFamily = 'invoice' | 'archive' | 'despatch';

export type ProfileSyntax = 'UBL' | 'CII' | 'national';

/** Profilin belge mi yoksa vergi idaresine bildirim mi olduğu. */
export type ProfilePurpose = 'document' | 'reporting';

/**
 * available: oluşturma, görüntüleme ve doğrulama editörde çalışıyor.
 * planned:   kayıtlı ve XML'den algılanabiliyor; şablon/doğrulama henüz yok.
 */
export type ProfileImplementation = 'available' | 'planned';

export interface XmlRoot {
    localName: string;
    /** Tam namespace ya da namespace öneki (ör. sürüm klasörü değişen şemalar). */
    namespace: string;
}

export interface DocumentProfile {
    id: string;
    name: string;
    /** Profilin karşılık geldiği belge aileleri (ör. myDATA hem fatura hem sevk). */
    families: DocumentFamily[];
    purpose: ProfilePurpose;
    syntax: ProfileSyntax;
    roots: XmlRoot[];
    /** UBL `cbc:CustomizationID` veya CII guideline ID önekleri. */
    customizationIds?: string[];
    /** UBL `cbc:ProfileID` değerleri (tam eşleşme). */
    profileIds?: string[];
    validationArtifacts: string[];
    implementation: ProfileImplementation;
}

const UBL_INVOICE = 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2';
const UBL_CREDIT_NOTE = 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2';
const UBL_DESPATCH = 'urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2';
const CII_INVOICE = 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100';
const EN16931 = 'urn:cen.eu:en16931:2017';

const UBL_BILLING_ROOTS: XmlRoot[] = [
    { localName: 'Invoice', namespace: UBL_INVOICE },
    { localName: 'CreditNote', namespace: UBL_CREDIT_NOTE },
];
const CII_ROOTS: XmlRoot[] = [{ localName: 'CrossIndustryInvoice', namespace: CII_INVOICE }];
/** Yeni belgeler TR1.2 ile üretilir; eski TR1.0 belgeleri yalnız görüntüleme için tanınır. */
const UBL_TR_VERSIONS = ['TR1.2', 'TR1.0'];

export const documentProfiles: DocumentProfile[] = [
    // ---------------- Türkiye ----------------
    {
        id: 'tr-efatura', name: 'UBL-TR 1.2.1 e-Fatura', families: ['invoice'], purpose: 'document', syntax: 'UBL',
        roots: UBL_BILLING_ROOTS, customizationIds: UBL_TR_VERSIONS,
        profileIds: ['TEMELFATURA', 'TICARIFATURA', 'IHRACAT', 'YOLCUBERABERFATURA', 'KAMU', 'HKS', 'ENERJI', 'ILAC_TIBBICIHAZ', 'YATIRIMTESVIK', 'IDIS'],
        validationArtifacts: ['UBL-TR 1.2.1 XSD', 'GİB UBL-TR Schematron'], implementation: 'available',
    },
    {
        id: 'tr-earsiv', name: 'UBL-TR 1.2.1 e-Arşiv Fatura', families: ['archive'], purpose: 'document', syntax: 'UBL',
        roots: UBL_BILLING_ROOTS, customizationIds: UBL_TR_VERSIONS, profileIds: ['EARSIVFATURA'],
        validationArtifacts: ['UBL-TR 1.2.1 XSD', 'GİB e-Arşiv Schematron'], implementation: 'available',
    },
    {
        id: 'tr-eirsaliye', name: 'UBL-TR 1.2.1 e-İrsaliye', families: ['despatch'], purpose: 'document', syntax: 'UBL',
        roots: [{ localName: 'DespatchAdvice', namespace: UBL_DESPATCH }], customizationIds: UBL_TR_VERSIONS,
        profileIds: ['TEMELIRSALIYE', 'HKSIRSALIYE', 'IDISIRSALIYE'],
        validationArtifacts: ['UBL-TR 1.2.1 XSD', 'GİB e-İrsaliye Schematron'], implementation: 'available',
    },

    // ---------------- Avrupa ortak fatura ----------------
    {
        id: 'en16931-ubl', name: 'EN 16931 UBL 2.1', families: ['invoice'], purpose: 'document', syntax: 'UBL',
        roots: UBL_BILLING_ROOTS, customizationIds: [EN16931],
        validationArtifacts: ['UBL 2.1 XSD', 'CEN EN16931-UBL Schematron'], implementation: 'available',
    },
    {
        id: 'en16931-cii', name: 'EN 16931 CII D16B (Factur-X / ZUGFeRD XML)', families: ['invoice'], purpose: 'document', syntax: 'CII',
        roots: CII_ROOTS, customizationIds: [EN16931, 'urn:factur-x.eu:', 'urn:zugferd.de:'],
        validationArtifacts: ['UN/CEFACT CII D16B XSD', 'CEN EN16931-CII Schematron'], implementation: 'planned',
    },
    {
        id: 'peppol-bis-billing-3', name: 'Peppol BIS Billing 3.0', families: ['invoice'], purpose: 'document', syntax: 'UBL',
        roots: UBL_BILLING_ROOTS, customizationIds: [`${EN16931}#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0`],
        profileIds: ['urn:fdc:peppol.eu:2017:poacc:billing:01:1.0'],
        validationArtifacts: ['UBL 2.1 XSD', 'CEN EN16931-UBL Schematron', 'PEPPOL-EN16931-UBL Schematron'], implementation: 'available',
    },

    // ---------------- Ulusal fatura profilleri ----------------
    {
        id: 'de-xrechnung-ubl', name: 'XRechnung 3.0 (UBL)', families: ['invoice'], purpose: 'document', syntax: 'UBL',
        roots: UBL_BILLING_ROOTS, customizationIds: [`${EN16931}#compliant#urn:xeinkauf.de:kosit:xrechnung_3`],
        validationArtifacts: ['UBL 2.1 XSD', 'CEN EN16931-UBL Schematron', 'KoSIT XRechnung Schematron'], implementation: 'available',
    },
    {
        id: 'de-xrechnung-cii', name: 'XRechnung 3.0 (CII)', families: ['invoice'], purpose: 'document', syntax: 'CII',
        roots: CII_ROOTS, customizationIds: [`${EN16931}#compliant#urn:xeinkauf.de:kosit:xrechnung_3`],
        validationArtifacts: ['UN/CEFACT CII D16B XSD', 'CEN EN16931-CII Schematron', 'KoSIT XRechnung Schematron'], implementation: 'planned',
    },
    {
        id: 'at-ebinterface-6', name: 'ebInterface 6.1', families: ['invoice'], purpose: 'document', syntax: 'national',
        roots: [{ localName: 'Invoice', namespace: 'http://www.ebinterface.at/schema/6p1/' }],
        validationArtifacts: ['ebInterface 6.1 XSD'], implementation: 'planned',
    },
    {
        id: 'nl-nlcius', name: 'NLCIUS (SI-UBL 2.0)', families: ['invoice'], purpose: 'document', syntax: 'UBL',
        roots: UBL_BILLING_ROOTS, customizationIds: [`${EN16931}#compliant#urn:fdc:nen.nl:nlcius`],
        validationArtifacts: ['UBL 2.1 XSD', 'CEN EN16931-UBL Schematron', 'SI-UBL 2.0 Schematron'], implementation: 'planned',
    },
    {
        id: 'pt-cius-pt', name: 'CIUS-PT (UBL)', families: ['invoice'], purpose: 'document', syntax: 'UBL',
        roots: UBL_BILLING_ROOTS, customizationIds: [`${EN16931}#compliant#urn:feap.gov.pt:CIUS-PT`],
        validationArtifacts: ['UBL 2.1 XSD', 'CEN EN16931-UBL Schematron', 'CIUS-PT Schematron'], implementation: 'available',
    },
    {
        id: 'ro-cius', name: 'RO e-Factura CIUS-RO', families: ['invoice', 'archive'], purpose: 'document', syntax: 'UBL',
        roots: UBL_BILLING_ROOTS, customizationIds: [`${EN16931}#compliant#urn:efactura.mfinante.ro:CIUS-RO`],
        validationArtifacts: ['UBL 2.1 XSD', 'CEN EN16931-UBL Schematron', 'CIUS-RO Schematron'], implementation: 'available',
    },
    {
        id: 'hr-cius', name: 'HR eRačun CIUS + HR uzantıları', families: ['invoice'], purpose: 'document', syntax: 'UBL',
        roots: UBL_BILLING_ROOTS, customizationIds: [`${EN16931}#compliant#urn:mfin.gov.hr`],
        validationArtifacts: ['UBL 2.1 XSD', 'CEN EN16931-UBL Schematron', 'HR CIUS Schematron'], implementation: 'available',
    },
    {
        id: 'dk-oioubl', name: 'OIOUBL 2.1', families: ['invoice'], purpose: 'document', syntax: 'UBL',
        roots: UBL_BILLING_ROOTS, customizationIds: ['OIOUBL-2'],
        validationArtifacts: ['UBL 2.0 XSD', 'OIOUBL Schematron'], implementation: 'planned',
    },
    {
        id: 'fi-finvoice-3', name: 'Finvoice 3.0', families: ['invoice'], purpose: 'document', syntax: 'national',
        roots: [{ localName: 'Finvoice', namespace: '' }],
        validationArtifacts: ['Finvoice 3.0 XSD'], implementation: 'planned',
    },
    {
        id: 'es-facturae-322', name: 'Facturae 3.2.2', families: ['invoice'], purpose: 'document', syntax: 'national',
        roots: [{ localName: 'Facturae', namespace: 'http://www.facturae.gob.es/formato/Versiones/Facturaev3_2' }],
        validationArtifacts: ['Facturae 3.2.x XSD', 'XAdES imza doğrulaması'], implementation: 'planned',
    },
    {
        id: 'it-fatturapa', name: 'FatturaPA 1.2 (FPR12/FPA12)', families: ['invoice', 'archive'], purpose: 'document', syntax: 'national',
        roots: [{ localName: 'FatturaElettronica', namespace: 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2' }],
        validationArtifacts: ['FatturaPA 1.2.x XSD', 'SdI kontrol kuralları'], implementation: 'planned',
    },
    {
        id: 'pl-ksef-fa3', name: 'KSeF FA(3)', families: ['invoice', 'archive'], purpose: 'document', syntax: 'national',
        roots: [{ localName: 'Faktura', namespace: 'http://crd.gov.pl/wzor/' }],
        validationArtifacts: ['KSeF FA(3) XSD'], implementation: 'planned',
    },
    {
        id: 'cz-isdoc-6', name: 'ISDOC 6.0', families: ['invoice'], purpose: 'document', syntax: 'national',
        roots: [{ localName: 'Invoice', namespace: 'http://isdoc.cz/namespace/2013' }],
        validationArtifacts: ['ISDOC 6.0.2 XSD'], implementation: 'planned',
    },
    {
        id: 'si-eslog-2', name: 'eSLOG 2.0', families: ['invoice'], purpose: 'document', syntax: 'national',
        roots: [{ localName: 'Invoice', namespace: 'urn:eslog:2.00' }],
        validationArtifacts: ['eSLOG 2.0 XSD'], implementation: 'planned',
    },
    {
        id: 'gr-mydata', name: 'myDATA InvoicesDoc', families: ['invoice', 'archive', 'despatch'], purpose: 'reporting', syntax: 'national',
        roots: [{ localName: 'InvoicesDoc', namespace: 'http://www.aade.gr/myDATA/invoice/v1.0' }],
        validationArtifacts: ['AADE myDATA XSD'], implementation: 'planned',
    },

    // ---------------- e-Arşiv karşılığı: bildirim / kayıt ----------------
    {
        id: 'hu-nav-osa-3', name: 'NAV Online Számla 3.0', families: ['archive'], purpose: 'reporting', syntax: 'national',
        roots: [{ localName: 'InvoiceData', namespace: 'http://schemas.nav.gov.hu/OSA/3.0/data' }],
        validationArtifacts: ['NAV OSA 3.0 XSD'], implementation: 'planned',
    },
    {
        id: 'es-verifactu', name: 'VERI*FACTU RegistroAlta', families: ['archive'], purpose: 'reporting', syntax: 'national',
        roots: [{ localName: 'RegFactuSistemaFacturacion', namespace: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/' }],
        validationArtifacts: ['AEAT SuministroLR.xsd'], implementation: 'planned',
    },
    {
        id: 'pt-saft-104', name: 'SAF-T (PT) 1.04_01', families: ['archive', 'despatch'], purpose: 'reporting', syntax: 'national',
        roots: [{ localName: 'AuditFile', namespace: 'urn:OECD:StandardAuditFile-Tax:PT_1.04_01' }],
        validationArtifacts: ['SAF-T PT 1.04_01 XSD'], implementation: 'planned',
    },

    // ---------------- e-İrsaliye karşılığı ----------------
    {
        id: 'peppol-despatch-3', name: 'Peppol BIS Despatch Advice 3', families: ['despatch'], purpose: 'document', syntax: 'UBL',
        roots: [{ localName: 'DespatchAdvice', namespace: UBL_DESPATCH }],
        customizationIds: ['urn:fdc:peppol.eu:poacc:trns:despatch_advice:3'],
        profileIds: ['urn:fdc:peppol.eu:poacc:bis:despatch_advice:3'],
        validationArtifacts: ['UBL 2.1 XSD', 'Peppol Despatch Advice Schematron'], implementation: 'available',
    },
    {
        id: 'ro-etransport-2', name: 'RO e-Transport v2 (UIT)', families: ['despatch'], purpose: 'reporting', syntax: 'national',
        roots: [{ localName: 'eTransport', namespace: 'mfp:anaf:dgti:eTransport:declaratie:v2' }],
        validationArtifacts: ['ANAF e-Transport v2 XSD', 'ANAF e-Transport Schematron'], implementation: 'planned',
    },
    {
        id: 'hu-ekaer-2', name: 'EKAER 2.0', families: ['despatch'], purpose: 'reporting', syntax: 'national',
        roots: [], validationArtifacts: ['NAV EKAER 2.0 XSD'], implementation: 'planned',
    },
    {
        id: 'pl-sent', name: 'SENT (PUESC)', families: ['despatch'], purpose: 'reporting', syntax: 'national',
        roots: [], validationArtifacts: ['PUESC SENT XSD'], implementation: 'planned',
    },
    {
        id: 'lt-ivaz', name: 'i.VAZ Važtaraštis', families: ['despatch'], purpose: 'reporting', syntax: 'national',
        roots: [], validationArtifacts: ['VMI i.VAZ XSD'], implementation: 'planned',
    },
    {
        id: 'bg-unp', name: 'NAP СВФР (УНП)', families: ['despatch'], purpose: 'reporting', syntax: 'national',
        roots: [], validationArtifacts: ['NAP СВФР XSD'], implementation: 'planned',
    },
];

/**
 * mandatory:  yurt içi B2B zorunlu.
 * phased:     B2B zorunluluğu kademeli başladı/başlıyor.
 * b2g-only:   yalnız kamuya fatura zorunlu ya da kamu alıcıları kabul etmek zorunda.
 * voluntary:  genel zorunluluk yok.
 */
export type InvoiceMandate = 'mandatory' | 'phased' | 'b2g-only' | 'voluntary';

/**
 * invoice:   nihai tüketici faturasının kendisi XML (gerçek e-Arşiv karşılığı).
 * reporting: fatura serbest; verisi vergi idaresine XML ile bildirilir.
 * none:      karşılığı yok; standart fatura profili kullanılır.
 */
export type ArchiveEquivalent = 'invoice' | 'reporting' | 'none';

/**
 * document:  alıcıya giden zorunlu elektronik sevk belgesi.
 * reporting: sevkiyat vergi idaresine bildirilir (alıcı belgesi serbest).
 * optional:  zorunluluk yok; Peppol Despatch Advice isteğe bağlı.
 */
export type DespatchEquivalent = 'document' | 'reporting' | 'optional';

export interface CountryDocumentRules {
    country: CountryCode;
    invoice: { mandate: InvoiceMandate; profiles: string[]; note?: string };
    archive: { equivalent: ArchiveEquivalent; profiles: string[]; note?: string };
    despatch: { equivalent: DespatchEquivalent; profiles: string[]; note?: string };
    sources: string[];
}

const EN_BOTH = ['en16931-ubl', 'en16931-cii'];
const NO_ARCHIVE = { equivalent: 'none' as const, profiles: [] };
const OPTIONAL_DESPATCH = { equivalent: 'optional' as const, profiles: ['peppol-despatch-3'] };

export const countryDocumentRules: CountryDocumentRules[] = [
    {
        country: 'TR',
        invoice: { mandate: 'mandatory', profiles: ['tr-efatura'] },
        archive: { equivalent: 'invoice', profiles: ['tr-earsiv'] },
        despatch: { equivalent: 'document', profiles: ['tr-eirsaliye'] },
        sources: ['https://ebelge.gib.gov.tr/'],
    },
    {
        country: 'DE',
        invoice: { mandate: 'phased', profiles: ['de-xrechnung-ubl', 'de-xrechnung-cii', 'en16931-cii', 'peppol-bis-billing-3'], note: 'Alma 2025; düzenleme büyük işletmelerde 2027, tümünde 2028.' },
        archive: { ...NO_ARCHIVE, note: 'Kasa sistemi (KassenSichV/TSE) var; XML fatura değil.' },
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html'],
    },
    {
        country: 'AT',
        invoice: { mandate: 'b2g-only', profiles: ['at-ebinterface-6', 'peppol-bis-billing-3'] },
        archive: { ...NO_ARCHIVE, note: 'RKSV kasa fişi; satışlar tek tek iletilmez.' },
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://www.usp.gv.at/themen/steuern-finanzen/umsatzsteuer-ueberblick/weitere-informationen-zur-umsatzsteuer/vorsteuerabzug-und-rechnung/e-rechnung-an-die-oeffentliche-verwaltung.html'],
    },
    {
        country: 'CH',
        invoice: { mandate: 'voluntary', profiles: ['en16931-ubl'], note: 'swissDIGIN/eCH-0069 alan kuralları; yasal syntax zorunluluğu yok.' },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://www.efv.admin.ch/de/elektronische-rechnungen-stellen-und-empfangen', 'https://www.ech.ch/de/ech/ech-0069/4.2.0'],
    },
    {
        country: 'FR',
        invoice: { mandate: 'phased', profiles: ['en16931-cii', 'en16931-ubl'], note: '1.9.2026 tüm işletmeler alma, büyük/orta düzenleme; küçükler 1.9.2027. Factur-X için PDF/A-3 ayrıca gerekir.' },
        archive: { equivalent: 'reporting', profiles: [], note: 'B2C e-reporting (Flux 10.3) onaylı platform üzerinden; şema henüz eklenmedi.' },
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://www.impots.gouv.fr/sites/default/files/media/1_metier/2_professionnel/EV/2_gestion/290_facturation_electronique/fiches_reforme/fiche-1_f.pdf'],
    },
    {
        country: 'BE',
        invoice: { mandate: 'mandatory', profiles: ['peppol-bis-billing-3'], note: 'Yurt içi B2B 1.1.2026.' },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://ec.europa.eu/digital-building-blocks/sites/spaces/einvoicingCFS/pages/881983566/2025+Belgium+2025+eInvoicing+Country+Sheet'],
    },
    {
        country: 'NL',
        invoice: { mandate: 'b2g-only', profiles: ['nl-nlcius', 'peppol-bis-billing-3'] },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://ec.europa.eu/digital-building-blocks/sites/spaces/einvoicingCFS/pages/956171309/2026+The+Netherlands+2026+eInvoicing+Country+Sheet'],
    },
    {
        country: 'LU',
        invoice: { mandate: 'b2g-only', profiles: ['peppol-bis-billing-3', 'en16931-cii'] },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://ec.europa.eu/digital-building-blocks/sites/spaces/DIGITAL/pages/467108893/eInvoicing+in+Luxembourg'],
    },
    {
        country: 'ES',
        invoice: { mandate: 'b2g-only', profiles: ['es-facturae-322', 'en16931-ubl'], note: 'B2B zorunluluğu 2027 ve sonrası.' },
        archive: { equivalent: 'reporting', profiles: ['es-verifactu'], note: 'VeriFactu kayıt XML + QR; BOE tarihi 2027.' },
        despatch: { ...OPTIONAL_DESPATCH, note: 'Dijital DeCA 5.10.2026’dan beri zorunlu ama PDF+QR, XML değil.' },
        sources: ['https://ec.europa.eu/digital-building-blocks/sites/spaces/einvoicingCFS/pages/956171306/2026+Spain+2026+eInvoicing+Country+Sheet', 'https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/registros-facturacion-alta.html'],
    },
    {
        country: 'PT',
        invoice: { mandate: 'b2g-only', profiles: ['pt-cius-pt', 'en16931-cii'] },
        archive: { equivalent: 'reporting', profiles: ['pt-saft-104'], note: 'Tüm faturalar ATCUD + QR ile AT’ye bildirilir.' },
        despatch: { equivalent: 'reporting', profiles: ['pt-saft-104'], note: 'Taşıma belgeleri sevkten önce AT’ye bildirilir (MovementOfGoods).' },
        sources: ['https://www.espap.gov.pt/Imagens/Documento.ashx?id=271', 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/Pages/faqs-00266.aspx'],
    },
    {
        country: 'IT',
        invoice: { mandate: 'mandatory', profiles: ['it-fatturapa', 'en16931-ubl'], note: 'SdI, kamu (B2G) için EN 16931 UBL de kabul eder; B2B/B2C FatturaPA ister.' },
        archive: { equivalent: 'invoice', profiles: ['it-fatturapa'], note: 'B2C: CodiceDestinatario 0000000, SdI üzerinden.' },
        despatch: { ...OPTIONAL_DESPATCH, note: 'DDT serbest biçim; Emilia-Romagna sağlıkta Peppol zorunlu.' },
        sources: ['https://www.agenziaentrate.gov.it/portale/documents/d/guest/guida_fattura_elettronica_dicembre_2025'],
    },
    {
        country: 'DK',
        invoice: { mandate: 'b2g-only', profiles: ['dk-oioubl', 'peppol-bis-billing-3'] },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://ec.europa.eu/digital-building-blocks/sites/spaces/einvoicingCFS/pages/956171278/2026+Denmark+2026+eInvoicing+Country+Sheet'],
    },
    {
        country: 'SE',
        invoice: { mandate: 'b2g-only', profiles: ['peppol-bis-billing-3'] },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://ec.europa.eu/digital-building-blocks/sites/spaces/DIGITAL/pages/467108902/eInvoicing+in+Sweden'],
    },
    {
        country: 'FI',
        invoice: { mandate: 'b2g-only', profiles: ['fi-finvoice-3', 'peppol-bis-billing-3', ...EN_BOTH], note: 'Uygun işletmeler B2B e-fatura isteyebilir.' },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://www.valtiokonttori.fi/en/services/public-administration-services/invoicing-the-state/'],
    },
    {
        country: 'NO',
        invoice: { mandate: 'b2g-only', profiles: ['peppol-bis-billing-3'], note: 'EHF = Peppol BIS 3; B2B düzenleme 1.1.2027.' },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://anskaffelser.dev/postaward/g3/spec/current/billing-3.0/norway/'],
    },
    {
        country: 'IS',
        invoice: { mandate: 'b2g-only', profiles: ['peppol-bis-billing-3'], note: 'TS-236 = Peppol BIS 3 İzlanda CIUS.' },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://ec.europa.eu/digital-building-blocks/sites/spaces/DIGITAL/pages/467108903/eInvoicing+in+Iceland'],
    },
    {
        country: 'EE',
        invoice: { mandate: 'b2g-only', profiles: ['peppol-bis-billing-3', ...EN_BOTH], note: 'Kayıtlı alıcı B2B EN 16931 fatura isteyebilir.' },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://ec.europa.eu/digital-building-blocks/sites/spaces/einvoicingCFS/pages/956171279/2026+Estonia+2026+eInvoicing+Country+Sheet'],
    },
    {
        country: 'LV',
        invoice: { mandate: 'b2g-only', profiles: ['peppol-bis-billing-3'], note: 'B2B 1.1.2028.' },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://www.vid.gov.lv/lv/e-rekini'],
    },
    {
        country: 'LT',
        invoice: { mandate: 'b2g-only', profiles: ['peppol-bis-billing-3', 'en16931-cii'] },
        archive: { equivalent: 'reporting', profiles: [], note: 'i.SAF aylık fatura bildirimi; şema henüz eklenmedi.' },
        despatch: { equivalent: 'reporting', profiles: ['lt-ivaz'], note: 'Yurt içi karayolu sevkleri i.VAZ’a bildirilir.' },
        sources: ['https://www.vmi.lt/evmi/i.vaz', 'https://finmin.lrv.lt/lt/paslaugos/SABIS/'],
    },
    {
        country: 'PL',
        invoice: { mandate: 'mandatory', profiles: ['pl-ksef-fa3', 'peppol-bis-billing-3'], note: 'KSeF 2026; en küçük işletmeler 1.1.2027. Peppol yalnız kamu (PEF).' },
        archive: { equivalent: 'invoice', profiles: ['pl-ksef-fa3'], note: 'Tüketici faturası KSeF’e gönüllü gönderilebilir.' },
        despatch: { equivalent: 'reporting', profiles: ['pl-sent'], note: 'Yalnız hassas mallar (SENT).' },
        sources: ['https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/zakres-obowiazkowego-ksef/'],
    },
    {
        country: 'CZ',
        invoice: { mandate: 'b2g-only', profiles: ['cz-isdoc-6', ...EN_BOTH] },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://mf.gov.cz/cs/dane-a-ucetnictvi/elektronicka-fakturace/zakladni-informace'],
    },
    {
        country: 'SK',
        invoice: { mandate: 'phased', profiles: ['peppol-bis-billing-3', 'en16931-cii'], note: 'B2B ve B2G 1.1.2027.' },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://www.financnasprava.sk/en/businesses/taxes-businesses/value-added-tax/e-invoicing'],
    },
    {
        country: 'HU',
        invoice: { mandate: 'b2g-only', profiles: EN_BOTH },
        archive: { equivalent: 'reporting', profiles: ['hu-nav-osa-3'], note: 'Tüm faturalar (özel kişi dahil) NAV’a bildirilir.' },
        despatch: { equivalent: 'reporting', profiles: ['hu-ekaer-2'], note: 'Riskli ürünlerde EKAER.' },
        sources: ['https://onlineszamla.nav.gov.hu/dokumentaciok', 'https://ekaer.nav.gov.hu/faq/'],
    },
    {
        country: 'RO',
        invoice: { mandate: 'mandatory', profiles: ['ro-cius'] },
        archive: { equivalent: 'invoice', profiles: ['ro-cius'], note: 'B2C 2025’ten beri; kimliksiz alıcıda 13 sıfır.' },
        despatch: { equivalent: 'reporting', profiles: ['ro-etransport-2'], note: 'Riskli mallar ve 2026’dan itibaren uluslararası karayolu.' },
        sources: ['https://static.anaf.ro/static/10/Anaf/legislatie/OUG_138_2024.pdf', 'https://static.anaf.ro/static/10/Anaf/AsistentaContribuabili_r/Ghid_RO_e_Transport_2025.pdf'],
    },
    {
        country: 'BG',
        invoice: { mandate: 'b2g-only', profiles: EN_BOTH },
        archive: NO_ARCHIVE,
        despatch: { equivalent: 'reporting', profiles: ['bg-unp'], note: 'Yüksek vergi riskli mallar (УНП).' },
        sources: ['https://nra.bg/wps/portal/nra/kontrol/fiskalen-kontrol/predvaritelno.dekl.danni'],
    },
    {
        country: 'GR',
        invoice: { mandate: 'phased', profiles: ['gr-mydata', 'peppol-bis-billing-3'], note: 'myDATA vergi e-faturası 2026’da kademeli; Peppol kamu için.' },
        archive: { equivalent: 'reporting', profiles: ['gr-mydata'], note: 'Perakende belgeleri (11.x) myDATA’ya bildirilir.' },
        despatch: { equivalent: 'reporting', profiles: ['gr-mydata'], note: 'Dijital sevk belgesi 1.12.2025’ten beri; MARK + QR ile sevkiyata eşlik eder.' },
        sources: ['https://aade.gr/en/mydata/technical-specifications-versions-mydata', 'https://www.taxheaven.gr/circulars/55464/a-1198-2026'],
    },
    {
        country: 'HR',
        invoice: { mandate: 'mandatory', profiles: ['hr-cius'], note: 'KDV mükellefleri 1.1.2026.' },
        archive: { equivalent: 'reporting', profiles: [], note: 'B2C fiskalizacija (JIR) mesajı; şema henüz eklenmedi.' },
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://porezna-uprava.gov.hr/hr/fiskalizacija-eracuna-7716/7716'],
    },
    {
        country: 'SI',
        invoice: { mandate: 'b2g-only', profiles: ['si-eslog-2', ...EN_BOTH], note: 'B2B 2028.' },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://www.gov.si/en/topics/exchange-of-e-invoices-with-budget-users/'],
    },
    {
        country: 'IE',
        invoice: { mandate: 'b2g-only', profiles: ['peppol-bis-billing-3'] },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://www.gov.ie/en/office-of-government-procurement/publications/einvoicing-ireland/'],
    },
    {
        country: 'MT',
        invoice: { mandate: 'b2g-only', profiles: ['peppol-bis-billing-3'] },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://finance.gov.mt/resources/einvoicing/'],
    },
    {
        country: 'CY',
        invoice: { mandate: 'b2g-only', profiles: ['peppol-bis-billing-3', 'en16931-ubl'] },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://www.gov.cy/oikonomia/geniko-logistirio-tis-dimokratias-apodochi-ilektronikon-timologion-tou-kratous-meso-jinius/'],
    },
    {
        country: 'LI',
        invoice: { mandate: 'b2g-only', profiles: EN_BOTH },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://www.llv.li/en/national-administration/office-for-finance/things-to-know/einvoice'],
    },
    {
        country: 'GB',
        invoice: { mandate: 'b2g-only', profiles: [...EN_BOTH, 'peppol-bis-billing-3'], note: 'KDV faturalarında B2B zorunluluğu Nisan 2029; NHS’de Peppol zorunlu.' },
        archive: NO_ARCHIVE,
        despatch: OPTIONAL_DESPATCH,
        sources: ['https://www.gov.uk/government/publications/procurement-act-2023-guidance-documents-manage-phase/guidance-electronic-invoicing-and-payment-html'],
    },
];

export const findDocumentProfile = (id: string): DocumentProfile | undefined =>
    documentProfiles.find((p) => p.id === id);

export const findCountryRules = (country: CountryCode): CountryDocumentRules | undefined =>
    countryDocumentRules.find((r) => r.country === country);

/** Bir ülke ve belge ailesi için seçilebilir profiller (kayıttaki sırayla). */
export const profilesFor = (country: CountryCode, family: DocumentFamily): DocumentProfile[] => {
    const rules = findCountryRules(country);
    if (!rules) return [];
    return rules[family].profiles
        .map(findDocumentProfile)
        .filter((p): p is DocumentProfile => !!p);
};

const firstText = (root: Element, localName: string): string | null => {
    const el = Array.from(root.getElementsByTagName('*')).find((e) => e.localName === localName);
    return el?.textContent?.trim() || null;
};

/** UBL CustomizationID veya CII GuidelineSpecifiedDocumentContextParameter/ID. */
const readCustomizationId = (root: Element): string | null => {
    const ubl = Array.from(root.children).find((c) => c.localName === 'CustomizationID');
    if (ubl?.textContent) return ubl.textContent.trim();
    const guideline = Array.from(root.getElementsByTagName('*')).find(
        (e) => e.localName === 'GuidelineSpecifiedDocumentContextParameter'
    );
    return guideline ? firstText(guideline, 'ID') : null;
};

const readProfileId = (root: Element): string | null => {
    const el = Array.from(root.children).find((c) => c.localName === 'ProfileID');
    return el?.textContent?.trim() || null;
};

export interface ProfileDetection {
    profile: DocumentProfile;
    customizationId: string | null;
    profileId: string | null;
}

/**
 * Yüklenen XML'in hangi profile ait olduğunu kök eleman, namespace,
 * CustomizationID ve ProfileID ile bulur. En özgül eşleşme kazanır;
 * kök eşleşmezse profil aday değildir.
 */
export const detectDocumentProfile = (xml: Document): ProfileDetection | null => {
    const root = xml.documentElement;
    if (!root) return null;
    const ns = root.namespaceURI ?? '';
    const customizationId = readCustomizationId(root);
    const profileId = readProfileId(root);

    let best: { profile: DocumentProfile; score: number } | null = null;
    for (const profile of documentProfiles) {
        const rootMatch = profile.roots.some(
            (r) => r.localName === root.localName && (r.namespace === '' ? ns === '' : ns.startsWith(r.namespace))
        );
        if (!rootMatch) continue;

        let score = 1;
        if (profile.customizationIds) {
            const match = customizationId
                ? Math.max(0, ...profile.customizationIds.filter((p) => customizationId.startsWith(p)).map((p) => p.length))
                : 0;
            if (!match) continue;
            score += match;
        }
        if (profile.profileIds) {
            if (profileId && profile.profileIds.includes(profileId)) score += 1000;
            else if (profile.families.includes('archive')) continue;
        }
        if (!best || score > best.score) best = { profile, score };
    }
    return best ? { profile: best.profile, customizationId, profileId } : null;
};
