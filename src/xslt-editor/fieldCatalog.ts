/**
 * Tasarım editörünün "Tüm Belge Alanları" kataloğu (UBL-TR 1.2.1).
 *
 * Yol sözdizimi: kökten başlayan yerel adlar, `/` ile ayrılır. Adım biçimleri:
 *   `Name`, `Name[@attr='v']`, `Name[Child='v']`, `Name[A/B/Child='v']`, `@attr` (son adım).
 * XPath'ler namespace önekinden bağımsız üretilir (`*[local-name()='X']`),
 * böylece her şablonun kendi önek tanımlarıyla çalışır.
 */
import i18n from '../i18n';
import { numberStyleOf, type DocLanguage, type NumberStyle } from '../international/registry/docLanguages';

export type CatalogFormat = 'text' | 'amount' | 'number' | 'date';

export interface CatalogField {
    key: string;
    label: string;
    category: string;
    path: string;
    format: CatalogFormat;
}

export type DocRoot = 'Invoice' | 'DespatchAdvice' | 'ReceiptAdvice' | 'CreditNote' | 'eBilet' | 'eYolcuListesi';

type Row = [label: string, path: string, format?: CatalogFormat];

const build = (root: DocRoot, groups: [string, Row[]][]): CatalogField[] =>
    groups.flatMap(([category, rows]) => rows.map(([label, path, format]) => ({
        key: `${root}/${path}`,
        label,
        category,
        path: `${root}/${path}`,
        format: format ?? 'text',
    })));

const party = (prefix: string, base: string): Row[] => [
    [`${prefix} Unvanı`, `${base}/Party/PartyName/Name`],
    [`${prefix} Adı (şahıs)`, `${base}/Party/Person/FirstName`],
    [`${prefix} Soyadı (şahıs)`, `${base}/Party/Person/FamilyName`],
    [`${prefix} Kimlik No (VKN/TCKN vb.)`, `${base}/Party/PartyIdentification/ID`],
    [`${prefix} Kimlik Türü`, `${base}/Party/PartyIdentification/ID/@schemeID`],
    [`${prefix} VKN`, `${base}/Party/PartyIdentification/ID[@schemeID='VKN']`],
    [`${prefix} TCKN`, `${base}/Party/PartyIdentification/ID[@schemeID='TCKN']`],
    [`${prefix} MERSİS No`, `${base}/Party/PartyIdentification/ID[@schemeID='MERSISNO']`],
    [`${prefix} Ticaret Sicil No`, `${base}/Party/PartyIdentification/ID[@schemeID='TICARETSICILNO']`],
    [`${prefix} Vergi Dairesi`, `${base}/Party/PartyTaxScheme/TaxScheme/Name`],
    [`${prefix} Cadde/Sokak`, `${base}/Party/PostalAddress/StreetName`],
    [`${prefix} Bina Adı`, `${base}/Party/PostalAddress/BuildingName`],
    [`${prefix} Kapı No`, `${base}/Party/PostalAddress/BuildingNumber`],
    [`${prefix} İlçe`, `${base}/Party/PostalAddress/CitySubdivisionName`],
    [`${prefix} İl`, `${base}/Party/PostalAddress/CityName`],
    [`${prefix} Bölge / Semt`, `${base}/Party/PostalAddress/Region`],
    [`${prefix} Posta Kodu`, `${base}/Party/PostalAddress/PostalZone`],
    [`${prefix} Ülke`, `${base}/Party/PostalAddress/Country/Name`],
    [`${prefix} Telefon`, `${base}/Party/Contact/Telephone`],
    [`${prefix} Faks`, `${base}/Party/Contact/Telefax`],
    [`${prefix} E-posta`, `${base}/Party/Contact/ElectronicMail`],
    [`${prefix} Web Sitesi`, `${base}/Party/WebsiteURI`],
];

/** GİB Kod Listeleri v1.43 — Vergi Kodları Listesi (TaxTypeCode). */
const TAX_TYPES: [code: string, name: string, detail: boolean][] = [
    ['0015', 'KDV', true],
    ['0059', 'Konaklama Vergisi', true],
    ['0071', 'ÖTV 1. Liste (petrol/doğalgaz)', true],
    ['9077', 'ÖTV 2. Liste (motorlu taşıt)', true],
    ['0073', 'ÖTV 3. Liste', true],
    ['0075', 'ÖTV 3A (alkollü içecek)', true],
    ['0076', 'ÖTV 3B (tütün)', true],
    ['0077', 'ÖTV 3C (kolalı gazoz)', true],
    ['0074', 'ÖTV 4. Liste (dayanıklı tüketim)', true],
    ['4171', 'Petrol-Doğalgaz ÖTV Tevkifatı', false],
    ['1047', 'Damga Vergisi', false],
    ['1048', '5035 SK Damga Vergisi', false],
    ['4080', 'Özel İletişim Vergisi', false],
    ['4081', '5035 SK Özel İletişim Vergisi', false],
    ['4071', 'Elektrik ve Havagazı Tüketim Vergisi', false],
    ['8005', 'Elektrik Tüketim Vergisi', false],
    ['8004', 'TRT Payı', false],
    ['8002', 'Enerji Fonu', false],
    ['8001', 'Borsa Tescil Ücreti', false],
    ['8006', 'Telsiz Kullanım Ücreti', false],
    ['8007', 'Telsiz Ruhsat Ücreti', false],
    ['8008', 'Çevre Temizlik Vergisi', false],
    ['9944', 'Belediye Hal Rüsumu', false],
    ['9040', 'Mera Fonu', false],
    ['0003', 'Gelir Vergisi Stopajı', false],
    ['0011', 'Kurumlar Vergisi Stopajı', false],
    ['0021', 'Banka Muameleleri Vergisi', false],
    ['0022', 'Sigorta Muameleleri Vergisi', false],
    ['9021', '4961 Banka Sigorta Muameleleri Vergisi', false],
    ['0061', 'KKDF Kesintisi', false],
];

const taxSubtotal = (base: string, code: string) => `${base}/TaxSubtotal[TaxCategory/TaxScheme/TaxTypeCode='${code}']`;

const taxTypeRows = (base: string, prefix: string, all: boolean): Row[] =>
    TAX_TYPES.filter(([, , detail]) => all || detail).flatMap(([code, name, detail]): Row[] => [
        [`${prefix}${name} Tutarı`, `${taxSubtotal(base, code)}/TaxAmount`, 'amount'],
        ...(detail ? [
            [`${prefix}${name} Matrahı`, `${taxSubtotal(base, code)}/TaxableAmount`, 'amount'],
            [`${prefix}${name} Oranı (%)`, `${taxSubtotal(base, code)}/Percent`, 'number'],
        ] as Row[] : []),
    ]);

const INVOICE_FIELDS = build('Invoice', [
    ['Belge Bilgileri', [
        ['Fatura No', 'ID'],
        ['Fatura Tarihi', 'IssueDate', 'date'],
        ['Fatura Saati', 'IssueTime'],
        ['Fatura Tipi', 'InvoiceTypeCode'],
        ['Senaryo (Profil)', 'ProfileID'],
        ['ETTN (UUID)', 'UUID'],
        ['Para Birimi', 'DocumentCurrencyCode'],
        ['Fatura Notu', 'Note'],
        ['Satır Sayısı', 'LineCountNumeric', 'number'],
        ['Fatura Dönemi Başlangıcı', 'InvoicePeriod/StartDate', 'date'],
        ['Fatura Dönemi Başlangıç Saati', 'InvoicePeriod/StartTime'],
        ['Fatura Dönemi Bitişi', 'InvoicePeriod/EndDate', 'date'],
        ['Fatura Dönemi Bitiş Saati', 'InvoicePeriod/EndTime'],
        ['Fatura Dönemi Açıklaması', 'InvoicePeriod/Description'],
        ['Muhasebe Maliyet Kodu (SGK)', 'AccountingCost'],
    ]],
    ['Satıcı', [
        ...party('Satıcı', 'AccountingSupplierParty'),
        ['Satıcı Sevkiyat No (IDIS)', "AccountingSupplierParty/Party/PartyIdentification/ID[@schemeID='SEVKIYATNO']"],
        ['Satıcı Şube No', "AccountingSupplierParty/Party/PartyIdentification/ID[@schemeID='SUBENO']"],
        ['Satıcı EPDK No', "AccountingSupplierParty/Party/PartyIdentification/ID[@schemeID='EPDKNO']"],
    ]],
    ['Alıcı', [
        ...party('Alıcı', 'AccountingCustomerParty'),
        ['Alıcı Araç Plakası (şarj)', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='PLAKA']"],
        ['Alıcı Araç Kimlik No (şarj)', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='ARACKIMLIKNO']"],
        ['Alıcı Müşteri No', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='MUSTERINO']"],
        ['Alıcı Abone No', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='ABONENO']"],
        ['Alıcı Tesisat No', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='TESISATNO']"],
        ['Alıcı Sayaç No', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='SAYACNO']"],
        ['Alıcı Hasta No', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='HASTANO']"],
        ['Alıcı Dosya No', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='DOSYANO']"],
        ['Alıcı Resmi Unvanı', 'AccountingCustomerParty/Party/PartyLegalEntity/RegistrationName'],
    ]],
    ['Asıl Alıcı (İhracat / Yolcu Beraber)', [
        ['Alıcı Tipi (EXPORT / TAXFREE)', "BuyerCustomerParty/Party/PartyIdentification/ID[@schemeID='PARTYTYPE']"],
        ['Asıl Alıcı Unvanı', 'BuyerCustomerParty/Party/PartyName/Name'],
        ['Asıl Alıcı Resmi Unvanı', 'BuyerCustomerParty/Party/PartyLegalEntity/RegistrationName'],
        ['Asıl Alıcı TCKN', "BuyerCustomerParty/Party/PartyIdentification/ID[@schemeID='TCKN']"],
        ['Hastane Protokol No', "BuyerCustomerParty/Party/PartyIdentification/ID[@schemeID='PROTOCOLNO']"],
        ['Turist Adı', 'BuyerCustomerParty/Party/Person/FirstName'],
        ['Turist Soyadı', 'BuyerCustomerParty/Party/Person/FamilyName'],
        ['Turist Uyruğu', 'BuyerCustomerParty/Party/Person/NationalityID'],
        ['Pasaport No', 'BuyerCustomerParty/Party/Person/IdentityDocumentReference/ID'],
        ['Pasaport Tarihi', 'BuyerCustomerParty/Party/Person/IdentityDocumentReference/IssueDate', 'date'],
        ['Turist Banka Hesap No', 'BuyerCustomerParty/Party/Person/FinancialAccount/ID'],
        ['Turist Bankası', 'BuyerCustomerParty/Party/Person/FinancialAccount/FinancialInstitutionBranch/FinancialInstitution/Name'],
        ['Asıl Alıcı İli', 'BuyerCustomerParty/Party/PostalAddress/CityName'],
        ['Asıl Alıcı Ülkesi', 'BuyerCustomerParty/Party/PostalAddress/Country/Name'],
        ['Aracı Kurum VKN', "TaxRepresentativeParty/PartyIdentification/ID[@schemeID='ARACIKURUMVKN']"],
        ['Aracı Kurum Etiketi', "TaxRepresentativeParty/PartyIdentification/ID[@schemeID='ARACIKURUMETIKET']"],
        ['Aracı Kurum Unvanı', 'TaxRepresentativeParty/PartyName/Name'],
        ['Aracı Kurum İli', 'TaxRepresentativeParty/PostalAddress/CityName'],
    ]],
    ['Tutarlar', [
        ['Mal Hizmet Toplam Tutarı', 'LegalMonetaryTotal/LineExtensionAmount', 'amount'],
        ['Vergiler Hariç Toplam', 'LegalMonetaryTotal/TaxExclusiveAmount', 'amount'],
        ['Vergiler Dahil Toplam', 'LegalMonetaryTotal/TaxInclusiveAmount', 'amount'],
        ['Toplam İskonto', 'LegalMonetaryTotal/AllowanceTotalAmount', 'amount'],
        ['Toplam Masraf', 'LegalMonetaryTotal/ChargeTotalAmount', 'amount'],
        ['Yuvarlama Tutarı', 'LegalMonetaryTotal/PayableRoundingAmount', 'amount'],
        ['Ödenecek Tutar', 'LegalMonetaryTotal/PayableAmount', 'amount'],
        ['Fatura İskonto Oranı', "AllowanceCharge[ChargeIndicator='false']/MultiplierFactorNumeric", 'number'],
        ['Fatura İskonto Tutarı', "AllowanceCharge[ChargeIndicator='false']/Amount", 'amount'],
        ['İskonto Açıklaması', "AllowanceCharge[ChargeIndicator='false']/AllowanceChargeReason"],
    ]],
    ['Vergiler', [
        ['Hesaplanan Vergiler (toplam)', 'TaxTotal/TaxAmount', 'amount'],
        ['Vergi Matrahı', 'TaxTotal/TaxSubtotal/TaxableAmount', 'amount'],
        ['Vergi Tutarı', 'TaxTotal/TaxSubtotal/TaxAmount', 'amount'],
        ['Vergi Oranı (%)', 'TaxTotal/TaxSubtotal/Percent', 'number'],
        ['Vergi Adı', 'TaxTotal/TaxSubtotal/TaxCategory/TaxScheme/Name'],
        ['Vergi Kodu', 'TaxTotal/TaxSubtotal/TaxCategory/TaxScheme/TaxTypeCode'],
        ['Muafiyet Sebebi', 'TaxTotal/TaxSubtotal/TaxCategory/TaxExemptionReason'],
        ['Muafiyet Kodu', 'TaxTotal/TaxSubtotal/TaxCategory/TaxExemptionReasonCode'],
        ['Tevkifat Tutarı', 'WithholdingTaxTotal/TaxAmount', 'amount'],
        ['Tevkifat Oranı (%)', 'WithholdingTaxTotal/TaxSubtotal/Percent', 'number'],
        ['Tevkifat Kodu', 'WithholdingTaxTotal/TaxSubtotal/TaxCategory/TaxScheme/TaxTypeCode'],
        ['Tevkifat Adı', 'WithholdingTaxTotal/TaxSubtotal/TaxCategory/TaxScheme/Name'],
        ['Tevkifat Matrahı', 'WithholdingTaxTotal/TaxSubtotal/TaxableAmount', 'amount'],
    ]],
    ['Vergi Türleri', taxTypeRows('TaxTotal', '', true)],
    ['Serbest Meslek Makbuzu (e-SMM)', [
        ['Serbest Meslek Erbabı Mesleği / Unvanı', 'AccountingSupplierParty/Party/Person/Title'],
        ['GV Stopajı Matrahı', `${taxSubtotal('TaxTotal', '0003')}/TaxableAmount`, 'amount'],
        ['GV Stopajı Oranı (%)', `${taxSubtotal('TaxTotal', '0003')}/Percent`, 'number'],
        ['KV Stopajı Oranı (%)', `${taxSubtotal('TaxTotal', '0011')}/Percent`, 'number'],
        ['GV Stopajı Tutarı (tevkifat bölümünde)', `${taxSubtotal('WithholdingTaxTotal', '0003')}/TaxAmount`, 'amount'],
        ['GV Stopajı Oranı (tevkifat bölümünde, %)', `${taxSubtotal('WithholdingTaxTotal', '0003')}/Percent`, 'number'],
        ['KDV Tevkifatı Tutarı (9015, eski kullanım)', `${taxSubtotal('TaxTotal', '9015')}/TaxAmount`, 'amount'],
    ]],
    ['Döviz / Kur', [
        ['Döviz Kuru', 'PricingExchangeRate/CalculationRate', 'number'],
        ['Kaynak Para Birimi', 'PricingExchangeRate/SourceCurrencyCode'],
        ['Hedef Para Birimi', 'PricingExchangeRate/TargetCurrencyCode'],
        ['Kur Tarihi', 'PricingExchangeRate/Date', 'date'],
        ['Fiyatlandırma Para Birimi', 'PricingCurrencyCode'],
        ['Vergi Para Birimi', 'TaxCurrencyCode'],
    ]],
    ['Ödeme', [
        ['Ödeme Şekli Kodu', 'PaymentMeans/PaymentMeansCode'],
        ['Son Ödeme Tarihi', 'PaymentMeans/PaymentDueDate', 'date'],
        ['Ödeme Kanalı', 'PaymentMeans/PaymentChannelCode'],
        ['IBAN', 'PaymentMeans/PayeeFinancialAccount/ID'],
        ['Hesap Para Birimi', 'PaymentMeans/PayeeFinancialAccount/CurrencyCode'],
        ['Banka / Şube', 'PaymentMeans/PayeeFinancialAccount/FinancialInstitutionBranch/Name'],
        ['Ödeme Notu', 'PaymentMeans/InstructionNote'],
        ['Hesap Açıklaması', 'PaymentMeans/PayeeFinancialAccount/PaymentNote'],
        ['Ödeme Koşulu', 'PaymentTerms/Note'],
        ['Gecikme Faizi (%)', 'PaymentTerms/PenaltySurchargePercent', 'number'],
        ['Vade Tarihi', 'PaymentTerms/PaymentDueDate', 'date'],
    ]],
    ['Referanslar', [
        ['İrsaliye No', 'DespatchDocumentReference/ID'],
        ['İrsaliye Tarihi', 'DespatchDocumentReference/IssueDate', 'date'],
        ['Sipariş No', 'OrderReference/ID'],
        ['Sipariş Tarihi', 'OrderReference/IssueDate', 'date'],
        ['İade Edilen Fatura No', 'BillingReference/InvoiceDocumentReference/ID'],
        ['İade Edilen Fatura Tarihi', 'BillingReference/InvoiceDocumentReference/IssueDate', 'date'],
        ['Ek Belge No', 'AdditionalDocumentReference/ID'],
        ['Ek Belge Tarihi', 'AdditionalDocumentReference/IssueDate', 'date'],
        ['Ek Belge Türü', 'AdditionalDocumentReference/DocumentType'],
        ['İade Edilen Belge Tipi', 'BillingReference/InvoiceDocumentReference/DocumentTypeCode'],
        ['ESÜ Rapor ID (şarj)', "AdditionalDocumentReference/ID[@schemeID='ESURaporID']"],
        ['Yatırım Teşvik Belge No', "ContractDocumentReference/ID[@schemeID='YTBNO']"],
        ['Yatırım Teşvik Belge Tarihi', 'ContractDocumentReference/IssueDate', 'date'],
        ['Sözleşme No', 'ContractDocumentReference/ID'],
    ]],
    ['Teslimat / İhracat', [
        ['Teslim Şartı (Incoterms)', 'Delivery/DeliveryTerms/ID'],
        ['Gönderim Şekli', 'Delivery/Shipment/ShipmentStage/TransportModeCode'],
        ['Teslim Tarihi', 'Delivery/ActualDeliveryDate', 'date'],
        ['Teslimat Adresi', 'Delivery/DeliveryAddress/StreetName'],
        ['Teslimat İli', 'Delivery/DeliveryAddress/CityName'],
        ['Teslimat Ülkesi', 'Delivery/DeliveryAddress/Country/Name'],
    ]],
    ['İnternet Satışı (e-Arşiv)', [
        ['Gönderiyi Taşıyan Unvanı', 'Delivery/CarrierParty/PartyName/Name'],
        ['Gönderiyi Taşıyan Adı', 'Delivery/CarrierParty/Person/FirstName'],
        ['Gönderiyi Taşıyan Soyadı', 'Delivery/CarrierParty/Person/FamilyName'],
        ['Gönderiyi Taşıyan VKN/TCKN', 'Delivery/CarrierParty/PartyIdentification/ID'],
        ['Gönderim Tarihi', 'Delivery/Despatch/ActualDespatchDate', 'date'],
        ['Gönderim Saati', 'Delivery/Despatch/ActualDespatchTime'],
    ]],
    ['Satır (Kalem)', [
        ['Ürün / Hizmet Adı', 'InvoiceLine/Item/Name'],
        ['Ürün Açıklaması', 'InvoiceLine/Item/Description'],
        ['Satıcı Ürün Kodu', 'InvoiceLine/Item/SellersItemIdentification/ID'],
        ['Alıcı Ürün Kodu', 'InvoiceLine/Item/BuyersItemIdentification/ID'],
        ['Marka', 'InvoiceLine/Item/BrandName'],
        ['Model', 'InvoiceLine/Item/ModelName'],
        ['Miktar', 'InvoiceLine/InvoicedQuantity', 'number'],
        ['Birim', 'InvoiceLine/InvoicedQuantity/@unitCode'],
        ['Birim Fiyat', 'InvoiceLine/Price/PriceAmount', 'amount'],
        ['Satır İskonto Oranı', 'InvoiceLine/AllowanceCharge/MultiplierFactorNumeric', 'number'],
        ['Satır İskonto Tutarı', 'InvoiceLine/AllowanceCharge/Amount', 'amount'],
        ['Satır Tutarı', 'InvoiceLine/LineExtensionAmount', 'amount'],
        ['Satır Vergi Oranı (%)', 'InvoiceLine/TaxTotal/TaxSubtotal/Percent', 'number'],
        ['Satır Vergi Tutarı', 'InvoiceLine/TaxTotal/TaxSubtotal/TaxAmount', 'amount'],
        ['GTİP No', 'InvoiceLine/Delivery/Shipment/GoodsItem/RequiredCustomsID'],
        ['Satır Notu', 'InvoiceLine/Note'],
        ['Satır Muafiyet Kodu', 'InvoiceLine/TaxTotal/TaxSubtotal/TaxCategory/TaxExemptionReasonCode'],
        ['Satır Muafiyet Sebebi', 'InvoiceLine/TaxTotal/TaxSubtotal/TaxCategory/TaxExemptionReason'],
        ['Satır Tevkifat Tutarı', 'InvoiceLine/WithholdingTaxTotal/TaxAmount', 'amount'],
        ['Satır Tevkifat Oranı (%)', 'InvoiceLine/WithholdingTaxTotal/TaxSubtotal/Percent', 'number'],
        ['Satır Tevkifat Kodu', 'InvoiceLine/WithholdingTaxTotal/TaxSubtotal/TaxCategory/TaxScheme/TaxTypeCode'],
        ...taxTypeRows('InvoiceLine/TaxTotal', 'Satır ', false),
    ]],
    ['Satır · Özel Senaryolar', [
        ['Künye No (HKS)', "InvoiceLine/Item/AdditionalItemIdentification/ID[@schemeID='KUNYENO']"],
        ['Etiket No (IDIS)', "InvoiceLine/Item/AdditionalItemIdentification/ID[@schemeID='ETIKETNO']"],
        ['İlaç Seri No', "InvoiceLine/Item/AdditionalItemIdentification/ID[@schemeID='ILAC']"],
        ['Tıbbi Cihaz Seri No', "InvoiceLine/Item/AdditionalItemIdentification/ID[@schemeID='TIBBICIHAZ']"],
        ['Diğer Ürün (İlaç/Tıbbi Cihaz)', "InvoiceLine/Item/AdditionalItemIdentification/ID[@schemeID='DIGER']"],
        ['Telefon IMEI (Teknoloji Destek)', "InvoiceLine/Item/AdditionalItemIdentification/ID[@schemeID='TELEFON']"],
        ['Tablet PC (Teknoloji Destek)', "InvoiceLine/Item/AdditionalItemIdentification/ID[@schemeID='TABLET_PC']"],
        ['Harcama Tipi (Yatırım Teşvik)', 'InvoiceLine/Item/CommodityClassification/ItemClassificationCode'],
        ['Makine Teçhizat Sıra No (YTB)', 'InvoiceLine/Item/ItemInstance/ProductTraceID'],
        ['Seri No / Makine ID', 'InvoiceLine/Item/ItemInstance/SerialID'],
        ['Satır Teslim Şartı', 'InvoiceLine/Delivery/DeliveryTerms/ID'],
        ['Satır Gönderim Şekli', 'InvoiceLine/Delivery/Shipment/ShipmentStage/TransportModeCode'],
        ['Kap Cinsi', 'InvoiceLine/Delivery/Shipment/TransportHandlingUnit/ActualPackage/PackagingTypeCode'],
        ['Kap No', 'InvoiceLine/Delivery/Shipment/TransportHandlingUnit/ActualPackage/ID'],
        ['Kap Adedi', 'InvoiceLine/Delivery/Shipment/TransportHandlingUnit/ActualPackage/Quantity', 'number'],
        ['Satıcı DİİB Satır Kodu (İhraç Kayıtlı)', "InvoiceLine/Delivery/Shipment/TransportHandlingUnit/CustomsDeclaration/IssuerParty/PartyIdentification/ID[@schemeID='SATICIDIBSATIRKOD']"],
        ['Alıcı DİİB Satır Kodu (İhraç Kayıtlı)', "InvoiceLine/Delivery/Shipment/TransportHandlingUnit/CustomsDeclaration/IssuerParty/PartyIdentification/ID[@schemeID='ALICIDIBSATIRKOD']"],
        ['Satır Teslim Adresi', 'InvoiceLine/Delivery/DeliveryAddress/StreetName'],
        ['Satır Teslim İli', 'InvoiceLine/Delivery/DeliveryAddress/CityName'],
    ]],
]);

const DESPATCH_FIELDS = build('DespatchAdvice', [
    ['Belge Bilgileri', [
        ['İrsaliye No', 'ID'],
        ['İrsaliye Tarihi', 'IssueDate', 'date'],
        ['İrsaliye Saati', 'IssueTime'],
        ['İrsaliye Tipi', 'DespatchAdviceTypeCode'],
        ['Senaryo (Profil)', 'ProfileID'],
        ['ETTN (UUID)', 'UUID'],
        ['İrsaliye Notu', 'Note'],
        ['Satır Sayısı', 'LineCountNumeric', 'number'],
        ['Sipariş No', 'OrderReference/ID'],
        ['Sipariş Tarihi', 'OrderReference/IssueDate', 'date'],
    ]],
    ['Ek Belge / Matbu İrsaliye', [
        ['Ek Belge No (matbu irsaliye / fatura)', 'AdditionalDocumentReference/ID'],
        ['Ek Belge Tarihi', 'AdditionalDocumentReference/IssueDate', 'date'],
        ['Ek Belge Türü', 'AdditionalDocumentReference/DocumentType'],
        ['Ek Belge Tür Kodu', 'AdditionalDocumentReference/DocumentTypeCode'],
        ['Ek Belge Açıklaması', 'AdditionalDocumentReference/DocumentDescription'],
    ]],
    ['Gönderen', [
        ...party('Gönderen', 'DespatchSupplierParty'),
        ['Gönderen Sevkiyat No (IDIS)', "DespatchSupplierParty/Party/PartyIdentification/ID[@schemeID='SEVKIYATNO']"],
        ['Gönderen İlgili Kişi', 'DespatchSupplierParty/DespatchContact/Name'],
        ['Malın Çıktığı Yer Kodu', 'DespatchSupplierParty/Party/PhysicalLocation/ID'],
        ['Malın Çıktığı Yer Adresi', 'DespatchSupplierParty/Party/PhysicalLocation/Address/StreetName'],
        ['Malın Çıktığı Yer İlçe', 'DespatchSupplierParty/Party/PhysicalLocation/Address/CitySubdivisionName'],
        ['Malın Çıktığı Yer İl', 'DespatchSupplierParty/Party/PhysicalLocation/Address/CityName'],
    ]],
    ['Alıcı', [
        ...party('Alıcı', 'DeliveryCustomerParty'),
        ['Alıcı İlgili Kişi', 'DeliveryCustomerParty/DeliveryContact/Name'],
    ]],
    ['Satıcı (Zincir Teslim)', party('Satıcı', 'SellerSupplierParty')],
    ['Alıcı / Sipariş Veren (Zincir Teslim)', party('Sipariş Veren', 'BuyerCustomerParty')],
    ['Asıl Alıcı (Zincir Teslim)', party('Asıl Alıcı', 'OriginatorCustomerParty')],
    ['Sevkiyat', [
        ['Kargo / Sevkiyat No', 'Shipment/ID'],
        ['Toplam Mal Değeri', 'Shipment/GoodsItem/ValueAmount', 'amount'],
        ['Fiili Sevk Tarihi', 'Shipment/Delivery/Despatch/ActualDespatchDate', 'date'],
        ['Fiili Sevk Saati', 'Shipment/Delivery/Despatch/ActualDespatchTime'],
        ['Araç Plakası', "Shipment/ShipmentStage/TransportMeans/RoadTransport/LicensePlateID"],
        ['Araç Plaka Türü (PLAKA/YABANCIPLAKA)', 'Shipment/ShipmentStage/TransportMeans/RoadTransport/LicensePlateID/@schemeID'],
        ['Dorse Plakası', 'Shipment/TransportHandlingUnit/TransportEquipment/ID'],
        ['Dorse Türü (DORSE/DORSEPLAKA/YABANCI...)', 'Shipment/TransportHandlingUnit/TransportEquipment/ID/@schemeID'],
        ['Sürücü Adı', 'Shipment/ShipmentStage/DriverPerson/FirstName'],
        ['Sürücü Soyadı', 'Shipment/ShipmentStage/DriverPerson/FamilyName'],
        ['Sürücü TCKN', 'Shipment/ShipmentStage/DriverPerson/NationalityID'],
        ['Sürücü Unvanı / Görevi', 'Shipment/ShipmentStage/DriverPerson/Title'],
        ['Taşıyıcı Unvanı', 'Shipment/Delivery/CarrierParty/PartyName/Name'],
        ['Taşıyıcı VKN', "Shipment/Delivery/CarrierParty/PartyIdentification/ID"],
        ['Taşıyıcı İlçe', 'Shipment/Delivery/CarrierParty/PostalAddress/CitySubdivisionName'],
        ['Taşıyıcı İl', 'Shipment/Delivery/CarrierParty/PostalAddress/CityName'],
        ['Teslimat Adresi', 'Shipment/Delivery/DeliveryAddress/StreetName'],
        ['Teslimat Kapı No', 'Shipment/Delivery/DeliveryAddress/BuildingNumber'],
        ['Teslimat İlçesi', 'Shipment/Delivery/DeliveryAddress/CitySubdivisionName'],
        ['Teslimat İli', 'Shipment/Delivery/DeliveryAddress/CityName'],
        ['Teslimat Posta Kodu', 'Shipment/Delivery/DeliveryAddress/PostalZone'],
        ['Teslimat Ülkesi', 'Shipment/Delivery/DeliveryAddress/Country/Name'],
    ]],
    ['Satır (Kalem)', [
        ['Satır No', 'DespatchLine/ID'],
        ['Ürün / Hizmet Adı', 'DespatchLine/Item/Name'],
        ['Ürün Açıklaması', 'DespatchLine/Item/Description'],
        ['Satıcı Ürün Kodu', 'DespatchLine/Item/SellersItemIdentification/ID'],
        ['Alıcı Ürün Kodu', 'DespatchLine/Item/BuyersItemIdentification/ID'],
        ['Gönderilen Miktar', 'DespatchLine/DeliveredQuantity', 'number'],
        ['Birim', 'DespatchLine/DeliveredQuantity/@unitCode'],
        ['Eksik Miktar', 'DespatchLine/OutstandingQuantity', 'number'],
        ['Eksik Miktar Nedeni', 'DespatchLine/OutstandingReason'],
        ['Sipariş Satır No', 'DespatchLine/OrderLineReference/LineID'],
        ['Birim Fiyat', 'DespatchLine/Shipment/GoodsItem/InvoiceLine/Price/PriceAmount', 'amount'],
        ['Satır Tutarı', 'DespatchLine/Shipment/GoodsItem/InvoiceLine/LineExtensionAmount', 'amount'],
        ['GTİP No', 'DespatchLine/Shipment/GoodsItem/RequiredCustomsID'],
        ['Satır Notu', 'DespatchLine/Note'],
        ['Künye No (HKS)', "DespatchLine/Item/AdditionalItemIdentification/ID[@schemeID='KUNYENO']"],
        ['Etiket No (IDIS)', "DespatchLine/Item/AdditionalItemIdentification/ID[@schemeID='ETIKETNO']"],
    ]],
]);

const RECEIPT_ADVICE_FIELDS = build('ReceiptAdvice', [
    ['Belge Bilgileri', [
        ['Yanıt No', 'ID'],
        ['Yanıt Tarihi', 'IssueDate', 'date'],
        ['Yanıt Saati', 'IssueTime'],
        ['Yanıt Tipi', 'ReceiptAdviceTypeCode'],
        ['Senaryo (Profil)', 'ProfileID'],
        ['ETTN (UUID)', 'UUID'],
        ['Yanıt Notu', 'Note'],
        ['Satır Sayısı', 'LineCountNumeric', 'number'],
        ['Sipariş No', 'OrderReference/ID'],
        ['Sipariş Tarihi', 'OrderReference/IssueDate', 'date'],
    ]],
    ['Yanıtlanan İrsaliye', [
        ['İrsaliye No', 'DespatchDocumentReference/ID'],
        ['İrsaliye Tarihi', 'DespatchDocumentReference/IssueDate', 'date'],
        ['Ek Belge No', 'AdditionalDocumentReference/ID'],
        ['Ek Belge Tarihi', 'AdditionalDocumentReference/IssueDate', 'date'],
        ['Ek Belge Türü', 'AdditionalDocumentReference/DocumentType'],
        ['Ek Belge Tür Kodu', 'AdditionalDocumentReference/DocumentTypeCode'],
    ]],
    ['Teslim Alan (Yanıtlayan)', [
        ...party('Teslim Alan', 'DeliveryCustomerParty'),
        ['Teslim Alan İlgili Kişi', 'DeliveryCustomerParty/DeliveryContact/Name'],
    ]],
    ['Gönderen', [
        ...party('Gönderen', 'DespatchSupplierParty'),
        ['Gönderen İlgili Kişi', 'DespatchSupplierParty/DespatchContact/Name'],
        ['Malın Çıktığı Yer Kodu', 'DespatchSupplierParty/Party/PhysicalLocation/ID'],
        ['Malın Çıktığı Yer Adresi', 'DespatchSupplierParty/Party/PhysicalLocation/Address/StreetName'],
        ['Malın Çıktığı Yer İlçe', 'DespatchSupplierParty/Party/PhysicalLocation/Address/CitySubdivisionName'],
        ['Malın Çıktığı Yer İl', 'DespatchSupplierParty/Party/PhysicalLocation/Address/CityName'],
    ]],
    ['Teslimat', [
        ['Kargo / Sevkiyat No', 'Shipment/ID'],
        ['Fiili Teslim Tarihi', 'Shipment/Delivery/ActualDeliveryDate', 'date'],
        ['Fiili Teslim Saati', 'Shipment/Delivery/ActualDeliveryTime'],
    ]],
    ['Satır (Kalem)', [
        ['Satır No', 'ReceiptLine/ID'],
        ['Ürün Adı', 'ReceiptLine/Item/Name'],
        ['Satıcı Ürün Kodu', 'ReceiptLine/Item/SellersItemIdentification/ID'],
        ['Teslim Alınan Miktar', 'ReceiptLine/ReceivedQuantity', 'number'],
        ['Birim', 'ReceiptLine/ReceivedQuantity/@unitCode'],
        ['Reddedilen Miktar', 'ReceiptLine/RejectedQuantity', 'number'],
        ['Red Nedeni', 'ReceiptLine/RejectReason'],
        ['Eksik Miktar', 'ReceiptLine/ShortQuantity', 'number'],
        ['Fazla Miktar', 'ReceiptLine/OversupplyQuantity', 'number'],
        ['Zamanlama Şikayeti (geç teslim)', 'ReceiptLine/TimingComplaint'],
        ['İrsaliye Satır No', 'ReceiptLine/DespatchLineReference/LineID'],
        ['Sipariş Satır No', 'ReceiptLine/OrderLineReference/LineID'],
        ['Satır Notu', 'ReceiptLine/Note'],
    ]],
]);

/**
 * e-Müstahsil Makbuzu (CreditNote, MUSTAHSILMAKBUZ): Müstahsil Makbuzu Kılavuzu V1.1,
 * 509 s. VUK GT IV.5.3 ve Karekod Standardı 2.5. Düzenleyen = malı satın alan,
 * AccountingCustomerParty = malı satan üretici / çiftçi.
 */
const MUSTAHSIL_KESINTILER: [code: string, name: string][] = [
    ['0003', 'GV Stopajı'],
    ['8001', 'Borsa Tescil Ücreti'],
    ['9040', 'Mera Fonu'],
    ['SGK_PRIM', 'SGK Prim Kesintisi'],
];
const SMS_PROVIDER = "AccountingSupplierParty/Party/Contact/OtherCommunication[ChannelCode/@name='SMS_PROVIDER']";
const SMS_CONTACT = "AccountingCustomerParty/Party/Contact[Name='SMS']";
const IADE_PROVIDER = "AccountingSupplierParty/Party/Contact/OtherCommunication[ChannelCode/@name='IADE_PROVIDER']";

const CREDIT_NOTE_FIELDS = build('CreditNote', [
    ['Belge Bilgileri', [
        ['Makbuz No', 'ID'],
        ['Düzenleme Tarihi', 'IssueDate', 'date'],
        ['Düzenleme Zamanı', 'IssueTime'],
        ['Belge Tipi (CreditNoteTypeCode)', 'CreditNoteTypeCode'],
        ['Senaryo (Profil)', 'ProfileID'],
        ['Özelleştirme No', 'CustomizationID'],
        ['ETTN (UUID)', 'UUID'],
        ['Asıl / Suret (CopyIndicator)', 'CopyIndicator'],
        ['Para Birimi', 'DocumentCurrencyCode'],
        ['Makbuz Notu', 'Note'],
        ['Satır Sayısı', 'LineCountNumeric', 'number'],
        ['Teslim Tarihi', 'Delivery/ActualDeliveryDate', 'date'],
        ['Ek Belge No', 'AdditionalDocumentReference/ID'],
        ['Ek Belge Tarihi', 'AdditionalDocumentReference/IssueDate', 'date'],
        ['Ek Belge Türü', 'AdditionalDocumentReference/DocumentType'],
    ]],
    ['Makbuzu Düzenleyen (Malı Satın Alan)', [
        ...party('Düzenleyen', 'AccountingSupplierParty'),
        ['Düzenleyen Mahalle', 'AccountingSupplierParty/Party/PostalAddress/District'],
        ['Düzenleyen Daire / Oda No', 'AccountingSupplierParty/Party/PostalAddress/Room'],
        ['SMS Operatörü (uygulama adı)', `${SMS_PROVIDER}/ChannelCode`],
        ['SMS Operatörü VKN', `${SMS_PROVIDER}/Value`],
    ]],
    ['Üretici / Çiftçi (Malı Satan)', [
        ...party('Çiftçi', 'AccountingCustomerParty'),
        ['Çiftçi SMS Kodu', `${SMS_CONTACT}/ID`],
        ['Çiftçi SMS Telefonu', `${SMS_CONTACT}/Telephone`],
    ]],
    ['Tutarlar', [
        ['Mal Hizmet Toplam Tutarı (brüt)', 'LegalMonetaryTotal/LineExtensionAmount', 'amount'],
        ['Vergiler Hariç Toplam', 'LegalMonetaryTotal/TaxExclusiveAmount', 'amount'],
        ['Vergiler Dahil Toplam', 'LegalMonetaryTotal/TaxInclusiveAmount', 'amount'],
        ['Toplam İskonto', 'LegalMonetaryTotal/AllowanceTotalAmount', 'amount'],
        ['Yuvarlama Tutarı', 'LegalMonetaryTotal/PayableRoundingAmount', 'amount'],
        ['Ödenecek Tutar (net)', 'LegalMonetaryTotal/PayableAmount', 'amount'],
    ]],
    ['Kesintiler (Vergi ve Fonlar)', [
        ['Toplam Kesinti', 'TaxTotal/TaxAmount', 'amount'],
        ...MUSTAHSIL_KESINTILER.flatMap(([code, name]): Row[] => [
            [`${name} Tutarı`, `${taxSubtotal('TaxTotal', code)}/TaxAmount`, 'amount'],
            [`${name} Matrahı`, `${taxSubtotal('TaxTotal', code)}/TaxableAmount`, 'amount'],
            [`${name} Oranı (%)`, `${taxSubtotal('TaxTotal', code)}/Percent`, 'number'],
        ]),
        ['Kesinti Adı', 'TaxTotal/TaxSubtotal/TaxCategory/TaxScheme/Name'],
        ['Kesinti Kodu', 'TaxTotal/TaxSubtotal/TaxCategory/TaxScheme/TaxTypeCode'],
        ['Kesinti Tutarı', 'TaxTotal/TaxSubtotal/TaxAmount', 'amount'],
        ['Kesinti Oranı (%)', 'TaxTotal/TaxSubtotal/Percent', 'number'],
    ]],
    ['Satır (Mal Bilgileri)', [
        ['Satır No', 'CreditNoteLine/ID'],
        ['Malın Cinsi', 'CreditNoteLine/Item/Name'],
        ['Mal Açıklaması', 'CreditNoteLine/Item/Description'],
        ['Miktar', 'CreditNoteLine/CreditedQuantity', 'number'],
        ['Birim', 'CreditNoteLine/CreditedQuantity/@unitCode'],
        ['Birim Fiyat', 'CreditNoteLine/Price/PriceAmount', 'amount'],
        ['Tutar (Bedel)', 'CreditNoteLine/LineExtensionAmount', 'amount'],
        ['Satır Notu', 'CreditNoteLine/Note'],
        ['Satır Kesinti Toplamı', 'CreditNoteLine/TaxTotal/TaxAmount', 'amount'],
        ...MUSTAHSIL_KESINTILER.flatMap(([code, name]): Row[] => [
            [`Satır ${name} Tutarı`, `${taxSubtotal('CreditNoteLine/TaxTotal', code)}/TaxAmount`, 'amount'],
            [`Satır ${name} Oranı (%)`, `${taxSubtotal('CreditNoteLine/TaxTotal', code)}/Percent`, 'number'],
        ]),
    ]],
    ['Vergiler (KDV / BSMV)', [
        ['KDV Tutarı', `${taxSubtotal('TaxTotal', '0015')}/TaxAmount`, 'amount'],
        ['KDV Matrahı', `${taxSubtotal('TaxTotal', '0015')}/TaxableAmount`, 'amount'],
        ['KDV Oranı (%)', `${taxSubtotal('TaxTotal', '0015')}/Percent`, 'number'],
        ['BSMV Tutarı', `${taxSubtotal('TaxTotal', '0021')}/TaxAmount`, 'amount'],
        ['BSMV Matrahı', `${taxSubtotal('TaxTotal', '0021')}/TaxableAmount`, 'amount'],
        ['BSMV Oranı (%)', `${taxSubtotal('TaxTotal', '0021')}/Percent`, 'number'],
        ['Satır KDV Tutarı', `${taxSubtotal('CreditNoteLine/TaxTotal', '0015')}/TaxAmount`, 'amount'],
        ['Satır KDV Oranı (%)', `${taxSubtotal('CreditNoteLine/TaxTotal', '0015')}/Percent`, 'number'],
    ]],
    ['Gider Pusulası', [
        ['İade Edilen Belge No', 'BillingReference/InvoiceDocumentReference/ID'],
        ['İade Edilen Belge Türü (EARSIV_FATURA / SATIS_FISI / BELGESIZ)', 'BillingReference/InvoiceDocumentReference/ID/@schemeID'],
        ['İade Edilen Belge Tarihi', 'BillingReference/InvoiceDocumentReference/IssueDate', 'date'],
        ['Kod Türü (SMS / IADEKODU)', 'AccountingCustomerParty/Party/Contact/Name'],
        ['SMS / İade Kodu', 'AccountingCustomerParty/Party/Contact/ID'],
        ['Kodun Gönderildiği Telefon', 'AccountingCustomerParty/Party/Contact/Telephone'],
        ['İade Kodu Uygulaması', `${IADE_PROVIDER}/ChannelCode`],
        ['İade Kodu Uygulaması VKN', `${IADE_PROVIDER}/Value`],
        ['Adına İade Yapılan Adı', 'BuyerCustomerParty/Party/Person/FirstName'],
        ['Adına İade Yapılan Soyadı', 'BuyerCustomerParty/Party/Person/FamilyName'],
        ['Adına İade Yapılan Unvanı', 'BuyerCustomerParty/Party/PartyName/Name'],
        ['Adına İade Yapılan TCKN', "BuyerCustomerParty/Party/PartyIdentification/ID[@schemeID='TCKN']"],
        ['Adına İade Yapılan SMS / İade Kodu', 'BuyerCustomerParty/Party/Contact/ID'],
        ['Adına İade Yapılan Telefon', 'BuyerCustomerParty/Party/Contact/Telephone'],
        ['Kargo Firması Unvanı', 'Delivery/DeliveryParty/PartyName/Name'],
        ['Kargo Firması VKN', "Delivery/DeliveryParty/PartyIdentification/ID[@schemeID='VKN']"],
        ['Kargo Yetki Belgesi No', "Delivery/DeliveryParty/IndustryClassificationCode[@name='YETKIBELGENO']"],
        ['Kargo Firması İl', 'Delivery/DeliveryParty/PostalAddress/CityName'],
    ]],
    ['Döviz / Kıymetli Maden', [
        ['Yetkili Müessese Şube No (SUBENO)', "AccountingSupplierParty/Party/PartyIdentification/ID[@schemeID='SUBENO']"],
        ['Müşteri Türü (MUSTERITURU)', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='MUSTERITURU']"],
        ['Müşteri Pasaport No', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='PASAPORTNO']"],
        ['Müşteri Uyruğu', 'AccountingCustomerParty/Party/Person/NationalityID'],
        ['Döviz / Maden Kodu (kaynak)', 'PaymentExchangeRate/SourceCurrencyCode'],
        ['Karşılık Para Birimi (hedef)', 'PaymentExchangeRate/TargetCurrencyCode'],
        ['Uygulanan Kur / Birim Fiyat', 'PaymentExchangeRate/CalculationRate', 'number'],
        ['Ödeme Şekli Kodu (10 / 55 / 46 / 68)', 'PaymentMeans/PaymentMeansCode'],
        ['Müşteri Hesap No', 'PaymentMeans/PayerFinancialAccount/ID'],
        ['Müessese Hesap No (IBAN)', 'PaymentMeans/PayeeFinancialAccount/ID'],
        ['İstatistik No', "AdditionalDocumentReference[DocumentTypeCode='ISTATISTIKNO']/ID"],
        ['Dövizin Geldiği Ülke', "AdditionalDocumentReference[DocumentTypeCode='GELDIGIULKE']/IssuerParty/PostalAddress/Country/Name"],
        ['Dövizin Geliş Nedeni', "AdditionalDocumentReference[DocumentTypeCode='GELISNEDENI']/ID"],
        ['Gümrük Beyanname No', "AdditionalDocumentReference[DocumentTypeCode='GBNO']/ID"],
        ['Gümrük Beyanname Tarihi', "AdditionalDocumentReference[DocumentTypeCode='GBTARIHI']/IssueDate", 'date'],
        ['Döviz Beyan Tutanağı Sayısı', "AdditionalDocumentReference[DocumentTypeCode='DBTSAYI']/ID"],
        ['Gümrük Teyit Yazısı Sayısı', "AdditionalDocumentReference[DocumentTypeCode='GMTYSAYI']/ID"],
        ['İlgili Fatura No', "AdditionalDocumentReference[DocumentTypeCode='FATURANO']/ID"],
    ]],
    ['Döviz Kuru (USD / TL Karşılığı)', [
        ['Kur: Kaynak Para Birimi', 'PricingExchangeRate/SourceCurrencyCode'],
        ['Kur: Hedef Para Birimi', 'PricingExchangeRate/TargetCurrencyCode'],
        ['Kur Oranı', 'PricingExchangeRate/CalculationRate', 'number'],
        ['Kur Tarihi', 'PricingExchangeRate/Date', 'date'],
    ]],
    ['Dekont', [
        ['Şube Kodu', "AccountingSupplierParty/Party/PartyIdentification/ID[@schemeID='SUBEKODU']"],
        ['Şube Adı', "AccountingSupplierParty/Party/PartyIdentification/ID[@schemeID='SUBEADI']"],
        ['İşlemi Yapan Personel Adı', 'AccountingSupplierParty/Party/Person/FirstName'],
        ['İşlemi Yapan Personel Soyadı', 'AccountingSupplierParty/Party/Person/FamilyName'],
        ['İşlemi Yapan Personel Sicil No', 'AccountingSupplierParty/Party/Person/NationalityID'],
        ['Müşteri No', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='MUSTERINO']"],
        ['Müşteri IBAN', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='IBAN']"],
        ['Abone No', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='ABONENO']"],
        ['Araç Plakası', "AccountingCustomerParty/Party/PartyIdentification/ID[@schemeID='PLAKA']"],
        ['İşlemi Yapan (Gönderen) Unvanı', 'BuyerCustomerParty/Party/PartyName/Name'],
        ['İşlemi Yapan (Gönderen) Kimlik No', 'BuyerCustomerParty/Party/PartyIdentification/ID'],
        ['Referans Belge No', 'ReceiptDocumentReference/ID'],
        ['Referans Belge Tarihi', 'ReceiptDocumentReference/IssueDate', 'date'],
        ['Referans Belge Kodu', 'ReceiptDocumentReference/DocumentTypeCode'],
        ['Referans Belge Açıklaması', 'ReceiptDocumentReference/DocumentDescription'],
        ['Tahsil Alındısı No (BELGENO)', "AdditionalDocumentReference/ID[@schemeID='BELGENO']"],
        ['Ek Belge Açıklaması (VTA / GVTA vb.)', 'AdditionalDocumentReference/DocumentDescription'],
        ['İşlem Referans No', "AdditionalDocumentReference/ID[@schemeID='ISLEMREFNO']"],
        ['İşlem Kanalı', "AdditionalDocumentReference/ID[@schemeID='ISLEMKANALI']"],
        ['Banka Provizyon No', "AdditionalDocumentReference/ID[@schemeID='BANKAPROVIZYONNO']"],
        ['Vergilendirme Dönemi', "TaxRepresentativeParty/PartyIdentification/ID[@schemeID='VERGIDONEMI']"],
        ['Tahsil Eden Vergi Dairesi', 'TaxRepresentativeParty/PartyTaxScheme/TaxScheme/Name'],
        ['Tahsil Eden Vergi Dairesi Kodu', 'TaxRepresentativeParty/PartyTaxScheme/TaxScheme/TaxTypeCode'],
        ['Gümrük Müdürlüğü Kodu', "TaxRepresentativeParty/PartyIdentification/ID[@schemeID='GUMRUKKODU']"],
        ['Gümrük Müdürlüğü Adı', 'TaxRepresentativeParty/PartyName/Name'],
        ['Gümrük Saymanlığı Adı', 'TaxRepresentativeParty/PartyLegalEntity/RegistrationName'],
        ['Gümrük Saymanlığı Kodu / VKN', 'TaxRepresentativeParty/PartyLegalEntity/CompanyID'],
        ['Saymanlık Banka Şube Kodu', 'TaxRepresentativeParty/PartyLegalEntity/CorporateRegistrationScheme/ID'],
        ['Saymanlık Banka Şube Adı', 'TaxRepresentativeParty/PartyLegalEntity/CorporateRegistrationScheme/Name'],
        ['Ödeme Kanalı Kodu', 'PaymentMeans/PaymentChannelCode'],
        ['Sanal POS Kodu', "PaymentMeans/PaymentMeansCode[@name='SANALPOS']"],
        ['İşlem Tarihi', 'PaymentTerms/SettlementPeriod/StartDate', 'date'],
        ['İşlem Saati', 'PaymentTerms/SettlementPeriod/StartTime'],
        ['Valör Tarihi', 'PaymentTerms/SettlementPeriod/EndDate', 'date'],
        ['Valör Saati', 'PaymentTerms/SettlementPeriod/EndTime'],
        ['İşlem Kodu (SerialID)', 'CreditNoteLine/Item/ItemInstance/SerialID'],
        ['İşlem Değeri (açıklama)', 'CreditNoteLine/Item/Description'],
        ['Satır Masraf / Kesinti Nedeni', 'CreditNoteLine/AllowanceCharge/AllowanceChargeReason'],
        ['Satır Masraf / Kesinti Tutarı', 'CreditNoteLine/AllowanceCharge/Amount', 'amount'],
    ]],
    ['Sigorta Komisyon', [
        ['Komisyon Dönemi Başlangıcı', 'InvoicePeriod/StartDate', 'date'],
        ['Komisyon Dönemi Bitişi', 'InvoicePeriod/EndDate', 'date'],
        ['Komisyon Dönemi Açıklaması', 'InvoicePeriod/Description'],
        ['İstihsal Komisyonu Toplamı', 'LegalMonetaryTotal/AllowanceTotalAmount', 'amount'],
        ['İptal Komisyonu Toplamı', 'LegalMonetaryTotal/ChargeTotalAmount', 'amount'],
        ['Satır İstihsal Komisyonu', "CreditNoteLine/AllowanceCharge[ChargeIndicator='true']/Amount", 'amount'],
        ['Satır İptal Komisyonu', "CreditNoteLine/AllowanceCharge[ChargeIndicator='false']/Amount", 'amount'],
        ['Satır Komisyon Nedeni', 'CreditNoteLine/AllowanceCharge/AllowanceChargeReason'],
        ['Branş / Sigorta Ürünü', 'CreditNoteLine/Item/Name'],
    ]],
]);

/**
 * e-Bilet paketi (ebilet.xsd, http://ebilet.efatura.gov.tr): aylık e-Bilet raporu
 * (eBilet) ve e-Yolcu Listesi (eYolcuListesi). Eleman adları küçük harfle başlar.
 */
const EBILET_HEADER: Row[] = [
    ['Gönderen VKN', 'baslik/gonderen/vkn'],
    ['Gönderen TCKN', 'baslik/gonderen/tckn'],
    ['Rapor Dönemi Başlangıcı', 'baslik/baslangicTarihi', 'date'],
    ['Rapor Dönemi Bitişi', 'baslik/bitisTarihi', 'date'],
    ['Rapor Versiyonu', 'baslik/versiyon'],
    ['Rapor UUID', 'baslik/uuid'],
    ['İmza Zamanı', 'baslik/Signature/Object/QualifyingProperties/SignedProperties/SignedSignatureProperties/SigningTime'],
];

const EBILET_FIELDS = build('eBilet', [
    ['Rapor Bilgileri', EBILET_HEADER],
    ['Bilet', [
        ['Bilet No', 'bilet/biletNo'],
        ['Belge Tipi (SATIS / IADE)', 'bilet/belgeTip'],
        ['Özet Değer (SHA-256)', 'bilet/ozetDeger'],
        ['Düzenlenme Tarihi', 'bilet/duzenlenmeTarihi', 'date'],
        ['Sefer Zamanı', 'bilet/seferZamani'],
        ['Etkinlik Zamanı', 'bilet/etkinlikZamani'],
        ['Ödeme Şekli', 'bilet/odemeSekli'],
        ['Bilet Tutarı', 'bilet/tutar', 'amount'],
        ['Para Birimi', 'bilet/tutar/@paraBirim'],
        ['Döviz Kuru', 'bilet/tutar/@kur', 'number'],
        ['KDV Tutarı', 'bilet/kdv', 'amount'],
        ['e-Bilet URL', 'bilet/ebiletUrl'],
    ]],
    ['Etkinlik Yeri / Organizatör', [
        ['Etkinlik Yeri İl Kodu', 'bilet/yer/ilkod'],
        ['Etkinlik Yeri Belediyesi', 'bilet/yer/belediye'],
        ['Etkinlik Yeri Açıklaması', 'bilet/yer/aciklama'],
        ['Organizatör VKN/TCKN', 'bilet/organizator'],
    ]],
    ['Hizmet / Gider Gösteren', [
        ['Hizmetin Nevi', 'bilet/hizmetinNevi/tur'],
        ['Hizmet Açıklaması', 'bilet/hizmetinNevi/aciklama'],
        ['Gider Gösteren VKN', 'bilet/giderGosteren/vkn'],
        ['Gider Gösteren TCKN', 'bilet/giderGosteren/tckn'],
        ['Referans Açıklaması', 'bilet/referanslar/referans/aciklama'],
        ['Referans No (asıl bilet)', 'bilet/referanslar/referans/no'],
    ]],
    ['Diğer Vergiler', [
        ['Diğer Vergi Kodu', 'bilet/digerVergiler/vergi/vergiKodu'],
        ['Diğer Vergi Adı', 'bilet/digerVergiler/vergi/vergiAdi'],
        ['Diğer Vergi Oranı (%)', 'bilet/digerVergiler/vergi/yuzde', 'number'],
        ['Diğer Vergi Tutarı', 'bilet/digerVergiler/vergi/tutar', 'amount'],
        ['Eğlence Vergisi Tutarı (9142)', "bilet/digerVergiler/vergi[vergiKodu='9142']/tutar", 'amount'],
    ]],
    ['İptal Edilen Bilet', [
        ['İptal Edilen Bilet No', 'biletIptal/biletNo'],
        ['İptal Zamanı', 'biletIptal/iptalZamani'],
        ['İptal Tutarı', 'biletIptal/tutar', 'amount'],
        ['İptal KDV Tutarı', 'biletIptal/kdv', 'amount'],
    ]],
]);

const EYOLCU_FIELDS = build('eYolcuListesi', [
    ['Rapor Bilgileri', EBILET_HEADER],
    ['Sefer', [
        ['Yolcu Listesi No', 'yolcuListesi/yolcuListesiNo'],
        ['Liste Özet Değeri', 'yolcuListesi/ozetDeger'],
        ['Hareket Zamanı', 'yolcuListesi/haraketZamani'],
        ['Hareket Noktası', 'yolcuListesi/hareketNoktasi'],
        ['Sefer Numarası', 'yolcuListesi/seferNumarasi'],
        ['Sefer Tarihi', 'yolcuListesi/seferTarihi', 'date'],
        ['Araç Plakası', 'yolcuListesi/aracPlakasi'],
        ['Toplam Hasılat (KDV dahil)', 'yolcuListesi/toplamHasilat', 'amount'],
    ]],
    ['Taşıtı İşleten', [
        ['Taşıtı İşleten VKN', 'yolcuListesi/aracIsleten/vkn'],
        ['Taşıtı İşleten TCKN', 'yolcuListesi/aracIsleten/tckn'],
        ['Komisyon Tutarı', 'yolcuListesi/aracIsleten/komisyonTutar', 'amount'],
        ['Komisyon KDV Tutarı', 'yolcuListesi/aracIsleten/komisyonKDV', 'amount'],
    ]],
    ['Koltuk / Yolcu', [
        ['Koltuk No', 'yolcuListesi/koltukListesi/koltuk/koltukNo'],
        ['Bilet No', 'yolcuListesi/koltukListesi/koltuk/biletNo'],
        ['Bilet Tutarı', 'yolcuListesi/koltukListesi/koltuk/tutar', 'amount'],
        ['Yolcu Adı Soyadı', 'yolcuListesi/koltukListesi/koltuk/adSoyad'],
        ['Yolcu TCKN / YKN', 'yolcuListesi/koltukListesi/koltuk/tcknYkn'],
        ['Yolcu Pasaport No', 'yolcuListesi/koltukListesi/koltuk/pasaportNo'],
    ]],
]);

const CATALOGS: Record<DocRoot, CatalogField[]> = {
    Invoice: INVOICE_FIELDS,
    DespatchAdvice: DESPATCH_FIELDS,
    ReceiptAdvice: RECEIPT_ADVICE_FIELDS,
    CreditNote: CREDIT_NOTE_FIELDS,
    eBilet: EBILET_FIELDS,
    eYolcuListesi: EYOLCU_FIELDS,
};

export function getCatalog(root: DocRoot): CatalogField[] {
    return CATALOGS[root];
}

export function docRootOf(xml: string): DocRoot {
    const m = xml.replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').match(/<([\w.-]+:)?([\w.-]+)/);
    const name = m?.[2] as DocRoot | undefined;
    return name && name in CATALOGS ? name : 'Invoice';
}

const LINE_PREFIX_RE = /^(Invoice\/InvoiceLine|DespatchAdvice\/DespatchLine|ReceiptAdvice\/ReceiptLine|CreditNote\/CreditNoteLine|eBilet\/(?:bilet|biletIptal)|eYolcuListesi\/yolcuListesi\/koltukListesi\/koltuk)\//;

/** Satır (kalem) alanı mı — yol satır elemanıyla (InvoiceLine, bilet, koltuk…) başlıyor. */
export const isLineField = (f: CatalogField) => LINE_PREFIX_RE.test(f.path);

const STEP_RE = /^(@?[\w.-]+)(?:\[((?:[\w.-]+\/)*@?[\w.-]+)='([^']*)'\])?$/;
const PRED_RE = /\[(?:[\w.-]+\/)*@?[\w.-]+='([^']*)'\]/;

/** Yolu adımlara böler; köşeli parantez içindeki `/` ayırıcı sayılmaz. */
const splitPath = (path: string) => path.split(/\/(?![^[]*\])/);

function stepXPath(step: string): string {
    const m = step.match(STEP_RE);
    if (!m) return step;
    const [, name, predPath, predValue] = m;
    if (name.startsWith('@')) return name;
    let out = `*[local-name()='${name}']`;
    if (predPath) {
        const pred = predPath.split('/').map(p => (p.startsWith('@') ? p : `*[local-name()='${p}']`)).join('/');
        out += `[${pred}='${predValue}']`;
    }
    return out;
}

/** Katalog yolunu XPath'e çevirir: mutlak (`/`) ya da satır içinden göreli. */
export function fieldXPath(f: CatalogField, relativeToLine = false): string {
    const steps = splitPath(f.path);
    const linePrefix = relativeToLine ? f.path.match(LINE_PREFIX_RE)?.[1] : undefined;
    if (linePrefix) return steps.slice(linePrefix.split('/').length).map(stepXPath).join('/');
    return '/' + steps.map(stepXPath).join('/');
}

const localNames = (path: string) => splitPath(path).map(s => s.match(STEP_RE)?.[1] ?? s);

/**
 * Alan şablonda kullanılıyor mu (yaklaşık): yoldaki tüm ayırt edici eleman
 * adları ve şema değerleri XSLT'de geçiyor olmalı.
 */
export function detectInXslt(xsltLocalNames: Set<string>, xsltText: string, f: CatalogField): boolean {
    const names = localNames(f.path).slice(1).filter(n => n !== 'Party');
    if (!names.every(n => usesName(xsltLocalNames, xsltText, n))) return false;
    const pred = f.path.match(PRED_RE);
    return !pred || xsltText.includes(pred[1]);
}

/**
 * Küçük harfli adlar (e-Bilet: biletNo, tutar) düz metinde de sık geçtiğinden
 * yalnızca önekli (`ebilet:tutar`), `@ad` ya da `local-name()='ad'` biçiminde sayılır.
 */
function usesName(xsltLocalNames: Set<string>, xsltText: string, step: string): boolean {
    const name = step.replace(/^@/, '');
    if (xsltLocalNames.has(name)) return true;
    if (!/^[a-z]/.test(name)) return false;
    const lead = step.startsWith('@') ? '@' : '[\\w.-]+:';
    return new RegExp(`(?:${lead}|local-name\\(\\)\\s*=\\s*['"])${name}(?![\\w.-])`).test(xsltText);
}

/** XSLT'de geçen tüm yerel eleman/öznitelik adları (önekler atılarak). */
export function xsltLocalNameSet(xslt: string): Set<string> {
    const set = new Set<string>();
    for (const m of xslt.matchAll(/\b([A-Z][A-Za-z0-9]+|unitCode|schemeID|currencyID)\b/g)) set.add(m[1]);
    return set;
}

const FOR_EACH_RE = /<xsl:for-each\b[^>]*?select\s*=\s*(["'])([\s\S]*?)\1[^>]*>|<\/xsl:for-each\s*>/g;

/** Konumu saran xsl:for-each select'leri (dıştan içe) ve açık template'in match'i. */
function contextAt(xslt: string, offset: number): { selects: string[]; match: string | null } {
    const before = xslt.slice(0, offset);
    const selects: string[] = [];
    for (const m of before.matchAll(FOR_EACH_RE)) {
        if (m[0].startsWith('</')) selects.pop();
        else if (!m[0].endsWith('/>')) selects.push(m[2]);
    }
    const tpl = Array.from(before.matchAll(/<xsl:template\b[^>]*?match\s*=\s*(["'])([\s\S]*?)\1/g)).pop();
    const open = !!tpl && !/<\/xsl:template\s*>/.test(before.slice(tpl.index ?? 0));
    return { selects, match: open && tpl ? tpl[2] : null };
}

/**
 * Konumdaki bağlam yolunu (template match + for-each select'leri) veren
 * çözücü; XSLT bir kez taranır, sorgular ucuzdur.
 */
export function contextPathResolver(xslt: string): (offset: number) => string {
    type Ev = { at: number; kind: 'fe' | '/fe' | 'tpl' | '/tpl'; value: string };
    const events: Ev[] = [];
    for (const m of xslt.matchAll(FOR_EACH_RE)) {
        if (m[0].startsWith('</')) events.push({ at: m.index ?? 0, kind: '/fe', value: '' });
        else if (!m[0].endsWith('/>')) events.push({ at: m.index ?? 0, kind: 'fe', value: m[2] });
    }
    for (const m of xslt.matchAll(/<xsl:template\b[^>]*?(?:match\s*=\s*(["'])([\s\S]*?)\1)?[^>]*>|<\/xsl:template\s*>/g)) {
        events.push(m[0].startsWith('</')
            ? { at: m.index ?? 0, kind: '/tpl', value: '' }
            : { at: m.index ?? 0, kind: 'tpl', value: m[2] ?? '' });
    }
    events.sort((a, b) => a.at - b.at);
    return (offset: number) => {
        const selects: string[] = [];
        let match = '';
        for (const e of events) {
            if (e.at >= offset) break;
            if (e.kind === 'fe') selects.push(e.value);
            else if (e.kind === '/fe') selects.pop();
            else if (e.kind === 'tpl') { match = e.value; selects.length = 0; }
            else match = '';
        }
        const parts = match ? [match, ...selects] : selects;
        // Mutlak bir select kendinden öncekileri geçersiz kılar.
        const lastAbs = parts.map(p => p.trim().startsWith('/')).lastIndexOf(true);
        return parts.slice(Math.max(0, lastAbs)).join('/');
    };
}

/**
 * Önizleme listesindeki XPath'e (ör. `cac:LegalMonetaryTotal/cbc:PayableAmount`)
 * Türkçe alan adı bulur. `context` saran döngünün yoludur; göreli yollar
 * (`cbc:Name`, `.`) onunla birlikte eşlenir. Eşleşme tek değilse null döner.
 */
export function labelForXPath(xpath: string, catalog: CatalogField[], context = ''): CatalogField | null {
    const joined = /^\s*\//.test(xpath) || !context ? xpath : `${context}/${xpath}`;
    // `..` adımları bir önceki adımı geri alır, `.` adımları atılır.
    const steps: string[] = [];
    for (const s of joined.split('/')) {
        const t = s.trim();
        if (t === '..') steps.pop();
        else if (t !== '.') steps.push(s);
    }
    const full = steps.join('/');
    // e-Bilet adları küçük harfle başlar; namespace'li eleman XPath 1.0'da önek ya da local-name() ister.
    const lowerCase = /^[a-z]/.test(catalog[0]?.path ?? '');
    const names = lowerCase
        ? Array.from(full
            .replace(/\*\[local-name\(\)\s*=\s*['"]([\w.-]+)['"]\]/g, 'x:$1')
            .replace(/\$[\w.-]+/g, '')
            .replace(/\[[^\]]*\]/g, '')
            .matchAll(/[A-Za-z_][\w.-]*:([A-Za-z][\w.-]*)/g)).map(m => m[1])
        : Array.from(full.replace(/\[[^\]]*\]/g, '').matchAll(/(?:[A-Za-z_][\w.-]*:)?([A-Z][A-Za-z0-9]+)/g)).map(m => m[1]);
    if (!names.length) return null;
    const leaf = names[names.length - 1];
    const attr = xpath.match(/@([\w.-]+)\s*\)?\s*$/)?.[1] ?? null;
    let best: CatalogField[] = [];
    let bestScore = 0;
    for (const f of catalog) {
        const all = localNames(f.path);
        const fAttr = all[all.length - 1].startsWith('@') ? all[all.length - 1].slice(1) : null;
        if (fAttr !== attr) continue;
        const fn = all.filter(n => !n.startsWith('@'));
        if (fn[fn.length - 1] !== leaf) continue;
        // Sondan başa sıralı eşleşme; aradaki eksik adımlar (// ile atlanan)
        // atlanır ama az atlayan (daha kısa yol) tercih edilir.
        let matched = 0;
        let skipped = 0;
        let j = fn.length - 1;
        for (let i = names.length - 1; i >= 0 && j >= 0; i--) {
            const at = fn.lastIndexOf(names[i], j);
            if (at < 0) continue;
            matched++;
            skipped += j - at;
            j = at - 1;
        }
        skipped += Math.max(0, j);
        let score = matched * 10 - skipped;
        const pred = f.path.match(PRED_RE);
        if (pred) {
            if (full.includes(`'${pred[1]}'`) || full.includes(`"${pred[1]}"`)) score += 20;
            else score -= 15;
        }
        if (!best.length || score > bestScore) { best = [f]; bestScore = score; }
        else if (score === bestScore) best.push(f);
    }
    if (bestScore <= 0 || !best.length) return null;
    if (new Set(best.map(f => f.label)).size === 1) return best[0];
    // Şema değerleri arasında berabere (ör. VKN veya TCKN) → genel alan.
    const bases = new Set(best.map(f => f.path.replace(/\[[^\]]*\]/g, '')));
    return bases.size === 1 ? catalog.find(f => f.path === [...bases][0]) ?? null : null;
}

const ATTR_SUFFIX = { currencyID: 'editor.attr.currency', unitCode: 'editor.attr.unit', schemeID: 'editor.attr.scheme' } as const;

/** Tasarım listesindeki XPath'in (arayüz dilindeki) adı; katalogda olmayan öznitelikler üst alanın adıyla adlandırılır. */
export function bindingLabel(xpath: string, catalog: CatalogField[], context = ''): string | null {
    const direct = labelForXPath(xpath, catalog, context);
    if (direct) return direct.label;
    const attr = xpath.match(/\/?@([\w.-]+)\s*\)?\s*$/);
    if (!attr) return null;
    const parent = labelForXPath(xpath.slice(0, attr.index), catalog, context);
    const key = ATTR_SUFFIX[attr[1] as keyof typeof ATTR_SUFFIX];
    return parent ? `${parent.label} (${key ? i18n.t(key) : attr[1]})` : null;
}

/** Alanın örnek XML'deki değeri (ilk eşleşme). */
export function evaluateField(xmlDoc: Document | null, f: CatalogField): string {
    if (!xmlDoc) return '';
    try {
        return xmlDoc.evaluate(`string(${fieldXPath(f)})`, xmlDoc, null, XPathResult.STRING_TYPE, null).stringValue.trim();
    } catch {
        return '';
    }
}

// ----------------------------------------------------------------------------
// Sayı biçimi, veri alanı ve formül snippet'leri
// ----------------------------------------------------------------------------

/** Belge diline göre sayı ayraçları (decimal-format adı → ondalık / binlik). */
const DECIMAL_FORMATS = {
    'edesign-tr': { decimal: ',', grouping: '.' },
    'edesign-en': { decimal: '.', grouping: ',' },
    'edesign-fr': { decimal: ',', grouping: '\u00a0' },
} as const;
type DecimalFormatName = keyof typeof DECIMAL_FORMATS;
const DECIMAL_FORMAT_BY_STYLE: Record<NumberStyle, DecimalFormatName> = { dot: 'edesign-en', space: 'edesign-fr', comma: 'edesign-tr' };
const decimalFormatOf = (lang: DocLanguage): DecimalFormatName => DECIMAL_FORMAT_BY_STYLE[numberStyleOf(lang)];

/** format-number ifadelerinin kullandığı (edesign-*) decimal-format bildirimlerinden eksik olanları ekler. */
export function ensureDecimalFormat(xslt: string): string {
    const used = new Set([...xslt.matchAll(/'(edesign-(?:tr|en|fr))'\s*\)/g)].map(m => m[1] as DecimalFormatName));
    const missing = [...used].filter(name => !xslt.includes(`name="${name}"`));
    if (!missing.length) return xslt;
    const m = xslt.match(/<xsl:(stylesheet|transform)\b[^>]*>/);
    if (!m || m.index === undefined) return xslt;
    const at = m.index + m[0].length;
    const decls = missing.map(name => {
        const { decimal, grouping } = DECIMAL_FORMATS[name];
        return `\n<xsl:decimal-format name="${name}" decimal-separator="${decimal}" grouping-separator="${grouping === '\u00a0' ? '&#160;' : grouping}"/>`;
    }).join('');
    return `${xslt.slice(0, at)}${decls}${xslt.slice(at)}`;
}

export const numberPattern = (decimals: number, lang: DocLanguage = 'tr') => {
    const { decimal, grouping } = DECIMAL_FORMATS[decimalFormatOf(lang)];
    const int = `###${grouping}##0`;
    return decimals > 0 ? `${int}${decimal}${'0'.repeat(decimals)}` : int;
};
const formatted = (expr: string, decimals: number, lang: DocLanguage) =>
    `format-number(${expr}, '${numberPattern(decimals, lang)}', '${decimalFormatOf(lang)}')`;

/** Seçilen konum bir satır döngüsünün (InvoiceLine / DespatchLine / ReceiptLine / CreditNoteLine) içinde mi? */
export function isInLineContext(xslt: string, offset: number): boolean {
    const { selects, match } = contextAt(xslt, offset);
    const inner = selects.length ? selects[selects.length - 1] : match;
    return !!inner && /(InvoiceLine|DespatchLine|ReceiptLine|CreditNoteLine|[:'"](?:bilet|biletIptal|koltuk)\b)/.test(inner);
}

const escapeText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Veri alanı objesinin içeriği (sayısal alanlar belge dilinin ayraçlarıyla biçimlenir). */
export function fieldContent(f: CatalogField, inLine: boolean, lang: DocLanguage = 'tr'): string {
    const xp = fieldXPath(f, inLine);
    if (f.format === 'amount') return `<xsl:if test="${xp}"><xsl:value-of select="${formatted(`number(${xp})`, 2, lang)}"/></xsl:if>`;
    return `<xsl:value-of select="${xp}"/>`;
}

export const fieldSnippet = (id: string, f: CatalogField, inLine: boolean, lang: DocLanguage = 'tr') =>
    `<span data-xslt-obj="${id}" data-obj-kind="field" data-field="${f.key}">${fieldContent(f, inLine, lang)}</span>`;

export type FormulaOp = 'none' | 'percent' | 'mul' | 'div' | 'add' | 'sub';
export interface FormulaModel {
    /** Katalog alan anahtarı. */
    a: string;
    op: FormulaOp;
    /** Sabit sayı ("20") ya da `field:<anahtar>`. */
    b: string;
    decimals: number;
    label: string;
    suffix: string;
}

/** İşlemler; görünen adları `editor.formula.ops.<id>` (arayüz dili). */
export const FORMULA_OPS: { id: FormulaOp; symbol: string }[] = [
    { id: 'none', symbol: '' },
    { id: 'percent', symbol: '%' },
    { id: 'mul', symbol: '×' },
    { id: 'div', symbol: '÷' },
    { id: 'add', symbol: '+' },
    { id: 'sub', symbol: '−' },
];

/** Yeni formül objesi; etiketi belge dilinde. */
export const DEFAULT_FORMULA: FormulaModel = {
    a: 'Invoice/LegalMonetaryTotal/PayableAmount',
    op: 'percent',
    b: '20',
    decimals: 2,
    label: '',
    suffix: '',
};

export function readFormula(el: Element): FormulaModel {
    const get = (n: string) => el.getAttribute(`data-formula-${n}`);
    const op = get('op') as FormulaOp | null;
    return {
        a: get('a') ?? DEFAULT_FORMULA.a,
        op: op && FORMULA_OPS.some(o => o.id === op) ? op : DEFAULT_FORMULA.op,
        b: get('b') ?? DEFAULT_FORMULA.b,
        decimals: Math.min(4, Math.max(0, Number(get('decimals') ?? 2) || 0)),
        label: get('label') ?? '',
        suffix: get('suffix') ?? '',
    };
}

export const formulaAttrs = (m: FormulaModel): [string, string][] => [
    ['data-formula-a', m.a],
    ['data-formula-op', m.op],
    ['data-formula-b', m.b],
    ['data-formula-decimals', String(m.decimals)],
    ['data-formula-label', m.label],
    ['data-formula-suffix', m.suffix],
];

/**
 * Formülde bir alanın sayısal değeri. Satır alanları satır içinde o satırın
 * değeri, satır dışında tüm satırların toplamıdır; boş / sayı olmayan
 * değerler 0 sayılır (eksik alan sonucu NaN yapmasın).
 */
function formulaOperand(f: CatalogField, inLine: boolean): string {
    if (!isLineField(f)) return `number(${fieldXPath(f)})`;
    return `sum(${fieldXPath(f, inLine)}[number(.) = number(.)])`;
}

/** Satır alanı satır tablosu dışında kullanılıyor mu (toplam alınır). */
export const formulaSumsLines = (m: FormulaModel, catalog: CatalogField[], inLine: boolean): boolean => {
    if (inLine) return false;
    const keys = [m.a, ...(m.op !== 'none' && m.b.startsWith('field:') ? [m.b.slice(6)] : [])];
    return keys.some(k => { const f = catalog.find(x => x.key === k); return !!f && isLineField(f); });
};

/** Formülün XPath ifadesi ve görünürlük için ilk terimi; alan bulunamazsa null. */
export function formulaExpression(m: FormulaModel, catalog: CatalogField[], inLine: boolean): { a: string; expr: string } | null {
    const fa = catalog.find(f => f.key === m.a);
    if (!fa) return null;
    const a = formulaOperand(fa, inLine);
    if (m.op === 'none') return { a, expr: a };
    let b: string;
    if (m.b.startsWith('field:')) {
        const fb = catalog.find(f => f.key === m.b.slice(6));
        if (!fb) return null;
        b = formulaOperand(fb, inLine);
    } else {
        const n = Number(m.b.replace(',', '.'));
        if (!Number.isFinite(n)) return null;
        b = String(n);
    }
    const expr = m.op === 'percent' ? `${a} * ${b} div 100`
        : m.op === 'mul' ? `${a} * ${b}`
        : m.op === 'div' ? `${a} div ${b}`
        : m.op === 'add' ? `${a} + ${b}`
        : `${a} - ${b}`;
    return { a, expr };
}

/**
 * Formülün örnek XML'deki sonucu. Satır içindeki formül ilk satırın
 * değerleriyle hesaplanır.
 */
export function evaluateFormula(xmlDoc: Document | null, m: FormulaModel, catalog: CatalogField[], inLine: boolean): number {
    if (!xmlDoc) return NaN;
    const fx = formulaExpression(m, catalog, inLine);
    if (!fx) return NaN;
    let ctx: Node = xmlDoc;
    if (inLine) {
        const lineField = [m.a, m.b.startsWith('field:') ? m.b.slice(6) : '']
            .map(k => catalog.find(f => f.key === k))
            .find((f): f is CatalogField => !!f && isLineField(f));
        const prefix = lineField?.path.match(LINE_PREFIX_RE)?.[1];
        if (prefix) {
            try {
                const line = xmlDoc.evaluate(fieldXPath({ ...lineField!, path: prefix }), xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (line) ctx = line;
            } catch { /* belge kökünde hesaplanır */ }
        }
    }
    try {
        return xmlDoc.evaluate(`number(${fx.expr})`, ctx, null, XPathResult.NUMBER_TYPE, null).numberValue;
    } catch {
        return NaN;
    }
}

/** Formül objesinin XSLT içeriği; alan bulunamazsa null. */
export function formulaContent(m: FormulaModel, catalog: CatalogField[], inLine: boolean, lang: DocLanguage = 'tr'): string | null {
    const fx = formulaExpression(m, catalog, inLine);
    if (!fx) return null;
    return `${escapeText(m.label)}<xsl:if test="string(${fx.a}) != 'NaN'"><xsl:value-of select="${formatted(fx.expr, m.decimals, lang)}"/></xsl:if>${escapeText(m.suffix)}`;
}

export function formulaSnippet(id: string, m: FormulaModel, catalog: CatalogField[], inLine: boolean, lang: DocLanguage = 'tr'): string {
    const attrs = formulaAttrs(m).map(([k, v]) => ` ${k}="${v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/\{/g, '{{').replace(/\}/g, '}}')}"`).join('');
    return `<span data-xslt-obj="${id}" data-obj-kind="formula"${attrs}>${formulaContent(m, catalog, inLine, lang) ?? ''}</span>`;
}
