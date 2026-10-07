/**
 * Tasarım editörünün "Tüm Belge Alanları" kataloğu (UBL-TR 1.2.1).
 *
 * Yol sözdizimi: kökten başlayan yerel adlar, `/` ile ayrılır. Adım biçimleri:
 *   `Name`, `Name[@attr='v']`, `Name[Child='v']`, `Name[A/B/Child='v']`, `@attr` (son adım).
 * XPath'ler namespace önekinden bağımsız üretilir (`*[local-name()='X']`),
 * böylece her şablonun kendi önek tanımlarıyla çalışır.
 */

export type CatalogFormat = 'text' | 'amount' | 'number' | 'date';

export interface CatalogField {
    key: string;
    label: string;
    category: string;
    path: string;
    format: CatalogFormat;
}

export type DocRoot = 'Invoice' | 'DespatchAdvice';

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
    ['Gönderen', [
        ...party('Gönderen', 'DespatchSupplierParty'),
        ['Gönderen Sevkiyat No (IDIS)', "DespatchSupplierParty/Party/PartyIdentification/ID[@schemeID='SEVKIYATNO']"],
    ]],
    ['Alıcı', party('Alıcı', 'DeliveryCustomerParty')],
    ['Sevkiyat', [
        ['Fiili Sevk Tarihi', 'Shipment/Delivery/Despatch/ActualDespatchDate', 'date'],
        ['Fiili Sevk Saati', 'Shipment/Delivery/Despatch/ActualDespatchTime'],
        ['Araç Plakası', "Shipment/ShipmentStage/TransportMeans/RoadTransport/LicensePlateID"],
        ['Dorse Plakası', 'Shipment/TransportHandlingUnit/TransportEquipment/ID'],
        ['Sürücü Adı', 'Shipment/ShipmentStage/DriverPerson/FirstName'],
        ['Sürücü Soyadı', 'Shipment/ShipmentStage/DriverPerson/FamilyName'],
        ['Sürücü TCKN', 'Shipment/ShipmentStage/DriverPerson/NationalityID'],
        ['Taşıyıcı Unvanı', 'Shipment/Delivery/CarrierParty/PartyName/Name'],
        ['Taşıyıcı VKN', "Shipment/Delivery/CarrierParty/PartyIdentification/ID"],
        ['Teslimat Adresi', 'Shipment/Delivery/DeliveryAddress/StreetName'],
        ['Teslimat İlçesi', 'Shipment/Delivery/DeliveryAddress/CitySubdivisionName'],
        ['Teslimat İli', 'Shipment/Delivery/DeliveryAddress/CityName'],
        ['Teslimat Ülkesi', 'Shipment/Delivery/DeliveryAddress/Country/Name'],
    ]],
    ['Satır (Kalem)', [
        ['Ürün / Hizmet Adı', 'DespatchLine/Item/Name'],
        ['Ürün Açıklaması', 'DespatchLine/Item/Description'],
        ['Satıcı Ürün Kodu', 'DespatchLine/Item/SellersItemIdentification/ID'],
        ['Gönderilen Miktar', 'DespatchLine/DeliveredQuantity', 'number'],
        ['Birim', 'DespatchLine/DeliveredQuantity/@unitCode'],
        ['Eksik Miktar', 'DespatchLine/OutstandingQuantity', 'number'],
        ['Birim Fiyat', 'DespatchLine/Shipment/GoodsItem/InvoiceLine/Price/PriceAmount', 'amount'],
        ['Satır Notu', 'DespatchLine/Note'],
        ['Künye No (HKS)', "DespatchLine/Item/AdditionalItemIdentification/ID[@schemeID='KUNYENO']"],
        ['Etiket No (IDIS)', "DespatchLine/Item/AdditionalItemIdentification/ID[@schemeID='ETIKETNO']"],
    ]],
]);

export function getCatalog(root: DocRoot): CatalogField[] {
    return root === 'DespatchAdvice' ? DESPATCH_FIELDS : INVOICE_FIELDS;
}

export function docRootOf(xml: string): DocRoot {
    const m = xml.replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').match(/<([\w.-]+:)?([\w.-]+)/);
    return m?.[2] === 'DespatchAdvice' ? 'DespatchAdvice' : 'Invoice';
}

/** Satır (kalem) alanı mı — yolun ikinci adımı satır elemanı. */
export const isLineField = (f: CatalogField) => /^(Invoice\/InvoiceLine|DespatchAdvice\/DespatchLine)\//.test(f.path);

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
    if (relativeToLine && isLineField(f)) return steps.slice(2).map(stepXPath).join('/');
    return '/' + steps.map(stepXPath).join('/');
}

const localNames = (path: string) => splitPath(path).map(s => s.match(STEP_RE)?.[1] ?? s);

/**
 * Alan şablonda kullanılıyor mu (yaklaşık): yoldaki tüm ayırt edici eleman
 * adları ve şema değerleri XSLT'de geçiyor olmalı.
 */
export function detectInXslt(xsltLocalNames: Set<string>, xsltText: string, f: CatalogField): boolean {
    const names = localNames(f.path).slice(1).filter(n => n !== 'Party');
    if (!names.every(n => xsltLocalNames.has(n.replace(/^@/, '')))) return false;
    const pred = f.path.match(PRED_RE);
    return !pred || xsltText.includes(pred[1]);
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
    const names = Array.from(full.replace(/\[[^\]]*\]/g, '').matchAll(/(?:[A-Za-z_][\w.-]*:)?([A-Z][A-Za-z0-9]+)/g)).map(m => m[1]);
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

const ATTR_SUFFIX: Record<string, string> = { currencyID: 'para birimi', unitCode: 'birim', schemeID: 'türü' };

/** Tasarım listesindeki XPath'in Türkçe adı; katalogda olmayan öznitelikler üst alanın adıyla adlandırılır. */
export function bindingLabel(xpath: string, catalog: CatalogField[], context = ''): string | null {
    const direct = labelForXPath(xpath, catalog, context);
    if (direct) return direct.label;
    const attr = xpath.match(/\/?@([\w.-]+)\s*\)?\s*$/);
    if (!attr) return null;
    const parent = labelForXPath(xpath.slice(0, attr.index), catalog, context);
    return parent ? `${parent.label} (${ATTR_SUFFIX[attr[1]] ?? attr[1]})` : null;
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

export const DECIMAL_FORMAT_NAME = 'edesign-tr';

/** format-number için Türkçe ayraçlı decimal-format bildirimi yoksa ekler. */
export function ensureDecimalFormat(xslt: string): string {
    if (xslt.includes(`name="${DECIMAL_FORMAT_NAME}"`)) return xslt;
    const m = xslt.match(/<xsl:(stylesheet|transform)\b[^>]*>/);
    if (!m || m.index === undefined) return xslt;
    const at = m.index + m[0].length;
    return `${xslt.slice(0, at)}\n<xsl:decimal-format name="${DECIMAL_FORMAT_NAME}" decimal-separator="," grouping-separator="."/>${xslt.slice(at)}`;
}

export const numberPattern = (decimals: number) => (decimals > 0 ? `###.##0,${'0'.repeat(decimals)}` : '###.##0');
const formatted = (expr: string, decimals: number) =>
    `format-number(${expr}, '${numberPattern(decimals)}', '${DECIMAL_FORMAT_NAME}')`;

/** Seçilen konum bir satır döngüsünün (InvoiceLine / DespatchLine) içinde mi? */
export function isInLineContext(xslt: string, offset: number): boolean {
    const { selects, match } = contextAt(xslt, offset);
    const inner = selects.length ? selects[selects.length - 1] : match;
    return !!inner && /(InvoiceLine|DespatchLine)/.test(inner);
}

const escapeText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Veri alanı objesinin içeriği (sayısal alanlar Türkçe biçimlenir). */
export function fieldContent(f: CatalogField, inLine: boolean): string {
    const xp = fieldXPath(f, inLine);
    if (f.format === 'amount') return `<xsl:if test="${xp}"><xsl:value-of select="${formatted(`number(${xp})`, 2)}"/></xsl:if>`;
    return `<xsl:value-of select="${xp}"/>`;
}

export const fieldSnippet = (id: string, f: CatalogField, inLine: boolean) =>
    `<span data-xslt-obj="${id}" data-obj-kind="field" data-field="${f.key}">${fieldContent(f, inLine)}</span>`;

export type FormulaOp = 'percent' | 'mul' | 'div' | 'add' | 'sub';
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

export const FORMULA_OPS: { id: FormulaOp; label: string }[] = [
    { id: 'percent', label: '% (yüzdesi)' },
    { id: 'mul', label: '× (çarpı)' },
    { id: 'div', label: '÷ (bölü)' },
    { id: 'add', label: '+ (artı)' },
    { id: 'sub', label: '− (eksi)' },
];

export const DEFAULT_FORMULA: FormulaModel = {
    a: 'Invoice/LegalMonetaryTotal/PayableAmount',
    op: 'percent',
    b: '20',
    decimals: 2,
    label: 'Peşin (%20): ',
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

/** Formül objesinin XSLT içeriği; alan bulunamazsa null. */
export function formulaContent(m: FormulaModel, catalog: CatalogField[], inLine: boolean): string | null {
    const fa = catalog.find(f => f.key === m.a);
    if (!fa) return null;
    const a = `number(${fieldXPath(fa, inLine)})`;
    let b: string;
    if (m.b.startsWith('field:')) {
        const fb = catalog.find(f => f.key === m.b.slice(6));
        if (!fb) return null;
        b = `number(${fieldXPath(fb, inLine)})`;
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
    return `${escapeText(m.label)}<xsl:if test="string(${a}) != 'NaN'"><xsl:value-of select="${formatted(expr, m.decimals)}"/></xsl:if>${escapeText(m.suffix)}`;
}

export function formulaSnippet(id: string, m: FormulaModel, catalog: CatalogField[], inLine: boolean): string {
    const attrs = formulaAttrs(m).map(([k, v]) => ` ${k}="${v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/\{/g, '{{').replace(/\}/g, '}}')}"`).join('');
    return `<span data-xslt-obj="${id}" data-obj-kind="formula"${attrs}>${formulaContent(m, catalog, inLine) ?? ''}</span>`;
}
