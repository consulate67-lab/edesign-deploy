export interface StandardField {
    name: string;
    path: string;
    description?: string;
    isNumeric: boolean;
}

/**
 * UBL-TR 1.2.1 e-Fatura standart alanları — Phase 13.
 *
 * Selim'in geri bildirimiyle (Faz 10 şema analizi):
 * "dizaynda bulunan xml düğmesine basınca gelen alanlarda eksik var ise bunları tespit et"
 *
 * 1_TEMEL_FATURA.xml karşılaştırmasından çıkan eksik alanlar eklendi:
 *  - BuildingName, Room, PostalZone, Region, Country Name (adres)
 *  - LineCountNumeric, CopyIndicator (belge düzeyi)
 *  - PaymentMeans (ödeme bilgisi — IBAN, ödeme tarihi)
 *  - AllowanceCharge (indirim/masraf yüzdesi)
 *  - ID + PartyIdentification/ID @schemeID (şema bilgisi)
 */
export const standardUBLFields: StandardField[] = [
    // ============================================================
    // Fatura Genel Bilgileri (Header)
    // ============================================================
    { name: 'Fatura Numarası', path: 'Invoice/ID', isNumeric: false },
    { name: 'Fatura Tarihi', path: 'Invoice/IssueDate', isNumeric: false },
    { name: 'Fatura Saati', path: 'Invoice/IssueTime', isNumeric: false },
    { name: 'Fatura Tipi', path: 'Invoice/InvoiceTypeCode', isNumeric: false },
    { name: 'Fatura Senaryosu', path: 'Invoice/ProfileID', isNumeric: false },
    { name: 'Para Birimi', path: 'Invoice/DocumentCurrencyCode', isNumeric: false },
    { name: 'Fatura Notu', path: 'Invoice/Note', isNumeric: false },
    { name: 'UUID (ETTN)', path: 'Invoice/UUID', isNumeric: false },
    { name: 'UBL Sürümü', path: 'Invoice/UBLVersionID', isNumeric: false },
    { name: 'Özelleştirme No', path: 'Invoice/CustomizationID', isNumeric: false },
    { name: 'Kopya Belirteci', path: 'Invoice/CopyIndicator', isNumeric: false },
    { name: 'Satır Sayısı', path: 'Invoice/LineCountNumeric', isNumeric: true },

    // ============================================================
    // Gönderici Bilgileri (Supplier / Tedarikçi)
    // ============================================================
    { name: 'Gönderici Adı/Unvanı', path: 'Invoice/AccountingSupplierParty/Party/PartyName/Name', isNumeric: false },
    { name: 'Gönderici VKN', path: 'Invoice/AccountingSupplierParty/Party/PartyIdentification/ID', isNumeric: false },
    { name: 'Gönderici TCKN', path: 'Invoice/AccountingSupplierParty/Party/Person/FirstName', isNumeric: false },
    { name: 'Gönderici Vergi Dairesi', path: 'Invoice/AccountingSupplierParty/Party/PartyTaxScheme/TaxScheme/Name', isNumeric: false },
    { name: 'Gönderici Web Sitesi', path: 'Invoice/AccountingSupplierParty/Party/WebsiteURI', isNumeric: false },
    { name: 'Gönderici E-Posta', path: 'Invoice/AccountingSupplierParty/Party/Contact/ElectronicMail', isNumeric: false },
    { name: 'Gönderici Telefon', path: 'Invoice/AccountingSupplierParty/Party/Contact/Telephone', isNumeric: false },
    { name: 'Gönderici Fax', path: 'Invoice/AccountingSupplierParty/Party/Contact/Telefax', isNumeric: false },
    // Gönderici Adres (5 eksik alan eklendi)
    { name: 'Gönderici Ülke', path: 'Invoice/AccountingSupplierParty/Party/PostalAddress/Country/Name', isNumeric: false },
    { name: 'Gönderici İl', path: 'Invoice/AccountingSupplierParty/Party/PostalAddress/CityName', isNumeric: false },
    { name: 'Gönderici İlçe', path: 'Invoice/AccountingSupplierParty/Party/PostalAddress/CitySubdivisionName', isNumeric: false },
    { name: 'Gönderici Bölge', path: 'Invoice/AccountingSupplierParty/Party/PostalAddress/Region', isNumeric: false },
    { name: 'Gönderici Posta Kodu', path: 'Invoice/AccountingSupplierParty/Party/PostalAddress/PostalZone', isNumeric: false },
    { name: 'Gönderici Cadde/Sokak', path: 'Invoice/AccountingSupplierParty/Party/PostalAddress/StreetName', isNumeric: false },
    { name: 'Gönderici Bina Adı', path: 'Invoice/AccountingSupplierParty/Party/PostalAddress/BuildingName', isNumeric: false },
    { name: 'Gönderici Kapı No', path: 'Invoice/AccountingSupplierParty/Party/PostalAddress/BuildingNumber', isNumeric: false },
    { name: 'Gönderici Oda No', path: 'Invoice/AccountingSupplierParty/Party/PostalAddress/Room', isNumeric: false },

    // ============================================================
    // Alıcı Bilgileri (Customer / Müşteri)
    // ============================================================
    { name: 'Alıcı Adı/Unvanı', path: 'Invoice/AccountingCustomerParty/Party/PartyName/Name', isNumeric: false },
    { name: 'Alıcı VKN', path: 'Invoice/AccountingCustomerParty/Party/PartyIdentification/ID', isNumeric: false },
    { name: 'Alıcı Şahıs Adı', path: 'Invoice/AccountingCustomerParty/Party/Person/FirstName', isNumeric: false },
    { name: 'Alıcı Şahıs Soyadı', path: 'Invoice/AccountingCustomerParty/Party/Person/FamilyName', isNumeric: false },
    { name: 'Alıcı Vergi Dairesi', path: 'Invoice/AccountingCustomerParty/Party/PartyTaxScheme/TaxScheme/Name', isNumeric: false },
    { name: 'Alıcı E-Posta', path: 'Invoice/AccountingCustomerParty/Party/Contact/ElectronicMail', isNumeric: false },
    { name: 'Alıcı Telefon', path: 'Invoice/AccountingCustomerParty/Party/Contact/Telephone', isNumeric: false },
    { name: 'Alıcı Fax', path: 'Invoice/AccountingCustomerParty/Party/Contact/Telefax', isNumeric: false },
    // Alıcı Adres
    { name: 'Alıcı Ülke', path: 'Invoice/AccountingCustomerParty/Party/PostalAddress/Country/Name', isNumeric: false },
    { name: 'Alıcı İl', path: 'Invoice/AccountingCustomerParty/Party/PostalAddress/CityName', isNumeric: false },
    { name: 'Alıcı İlçe', path: 'Invoice/AccountingCustomerParty/Party/PostalAddress/CitySubdivisionName', isNumeric: false },
    { name: 'Alıcı Bölge', path: 'Invoice/AccountingCustomerParty/Party/PostalAddress/Region', isNumeric: false },
    { name: 'Alıcı Posta Kodu', path: 'Invoice/AccountingCustomerParty/Party/PostalAddress/PostalZone', isNumeric: false },
    { name: 'Alıcı Adres', path: 'Invoice/AccountingCustomerParty/Party/PostalAddress/StreetName', isNumeric: false },
    { name: 'Alıcı Bina Adı', path: 'Invoice/AccountingCustomerParty/Party/PostalAddress/BuildingName', isNumeric: false },
    { name: 'Alıcı Kapı No', path: 'Invoice/AccountingCustomerParty/Party/PostalAddress/BuildingNumber', isNumeric: false },
    { name: 'Alıcı Oda No', path: 'Invoice/AccountingCustomerParty/Party/PostalAddress/Room', isNumeric: false },

    // ============================================================
    // Toplamlar (LegalMonetaryTotal)
    // ============================================================
    { name: 'Mal Hizmet Toplam Tutarı', path: 'Invoice/LegalMonetaryTotal/LineExtensionAmount', isNumeric: true },
    { name: 'Vergi Hariç Toplam', path: 'Invoice/LegalMonetaryTotal/TaxExclusiveAmount', isNumeric: true },
    { name: 'Vergi Dahil Toplam', path: 'Invoice/LegalMonetaryTotal/TaxInclusiveAmount', isNumeric: true },
    { name: 'Ödenecek Tutar (Net)', path: 'Invoice/LegalMonetaryTotal/PayableAmount', isNumeric: true },
    { name: 'Toplam İskonto', path: 'Invoice/LegalMonetaryTotal/AllowanceTotalAmount', isNumeric: true },
    { name: 'Toplam Masraf', path: 'Invoice/LegalMonetaryTotal/ChargeTotalAmount', isNumeric: true },

    // ============================================================
    // Vergi (TaxTotal — seviye 1)
    // ============================================================
    { name: 'Toplam KDV', path: 'Invoice/TaxTotal/TaxAmount', isNumeric: true },
    { name: 'KDV Matrahı', path: 'Invoice/TaxTotal/TaxSubtotal/TaxableAmount', isNumeric: true },
    { name: 'KDV Tutarı', path: 'Invoice/TaxTotal/TaxSubtotal/TaxAmount', isNumeric: true },
    { name: 'KDV Oranı (%)', path: 'Invoice/TaxTotal/TaxSubtotal/Percent', isNumeric: true },
    { name: 'KDV Kategori ID', path: 'Invoice/TaxTotal/TaxSubtotal/TaxCategory/ID', isNumeric: false },
    { name: 'KDV Hesaplama Sırası', path: 'Invoice/TaxTotal/TaxSubtotal/CalculationSequenceNumeric', isNumeric: true },

    // ============================================================
    // İskonto/Masraf (AllowanceCharge — yüzde ve tutar)
    // ============================================================
    { name: 'İskonto Yüzdesi', path: 'Invoice/AllowanceCharge[ChargeIndicator=false]/MultiplierFactorNumeric', isNumeric: true },
    { name: 'İskonto Tutarı', path: 'Invoice/AllowanceCharge[ChargeIndicator=false]/Amount', isNumeric: true },
    { name: 'Masraf Tutarı', path: 'Invoice/AllowanceCharge[ChargeIndicator=true]/Amount', isNumeric: true },
    { name: 'İskonto Sebebi', path: 'Invoice/AllowanceCharge[ChargeIndicator=false]/AllowanceChargeReason', isNumeric: false },

    // ============================================================
    // Ödeme Bilgisi (PaymentMeans — banka / IBAN)
    // ============================================================
    { name: 'Ödeme Şekli', path: 'Invoice/PaymentMeans/PaymentMeansCode', isNumeric: false },
    { name: 'Ödeme Tarihi', path: 'Invoice/PaymentMeans/PaymentDueDate', isNumeric: false },
    { name: 'Ödeme Hesap IBAN', path: 'Invoice/PaymentMeans/PayeeFinancialAccount/ID', isNumeric: false },
    { name: 'Banka Adı', path: 'Invoice/PaymentMeans/PayeeFinancialAccount/FinancialInstitutionBranch/Name', isNumeric: false },
    { name: 'Ödeme Notu', path: 'Invoice/PaymentMeans/Note', isNumeric: false },

    // ============================================================
    // İrsaliye (DespatchDocumentReference)
    // ============================================================
    { name: 'İrsaliye No', path: 'Invoice/DespatchDocumentReference/ID', isNumeric: false },
    { name: 'İrsaliye Tarihi', path: 'Invoice/DespatchDocumentReference/IssueDate', isNumeric: false },

    // ============================================================
    // Sipariş (OrderReference)
    // ============================================================
    { name: 'Sipariş No', path: 'Invoice/OrderReference/ID', isNumeric: false },
    { name: 'Sipariş Tarihi', path: 'Invoice/OrderReference/IssueDate', isNumeric: false },

    // ============================================================
    // Satır Detayı (InvoiceLine — Item + Tax)
    // ============================================================
    { name: 'Ürün/Hizmet Adı', path: 'Invoice/InvoiceLine/Item/Name', isNumeric: false },
    { name: 'Ürün Açıklaması', path: 'Invoice/InvoiceLine/Item/Description', isNumeric: false },
    { name: 'Satıcı Ürün Kodu', path: 'Invoice/InvoiceLine/Item/SellersItemIdentification/ID', isNumeric: false },
    { name: 'Miktar', path: 'Invoice/InvoiceLine/InvoicedQuantity', isNumeric: true },
    { name: 'Birim Fiyat', path: 'Invoice/InvoiceLine/Price/PriceAmount', isNumeric: true },
    { name: 'Satır Toplamı', path: 'Invoice/InvoiceLine/LineExtensionAmount', isNumeric: true },
    { name: 'Satır KDV Oranı', path: 'Invoice/InvoiceLine/TaxTotal/TaxSubtotal/Percent', isNumeric: true },
    { name: 'Satır KDV Tutarı', path: 'Invoice/InvoiceLine/TaxTotal/TaxSubtotal/TaxAmount', isNumeric: true },
];
