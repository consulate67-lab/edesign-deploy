/**
 * Readonly Fields — Phase 12 (Selim: 'bazi alanlar iceriliği değiştirlemez olmali')
 *
 * UBL-TR 1.2.1 e-Belge şemasında sistem tarafından doldurulan alanlar:
 *  - UUID (ETTN) — GİB atar
 *  - UBLVersionID — her zaman "2.1"
 *  - CustomizationID — her zaman "TR1.2"
 *  - ProfileID — belge tipi profili (kullanıcı seçmez, GİB atar)
 *  - ID (Fatura No) — sistem üretir (kullanıcı override edemez)
 *  - IssueDate / IssueTime — fatura düzenlenme anı (otomatik)
 *  - DocumentCurrencyCode — codelist (TRY, USD, EUR — özel form)
 *  - LineCountNumeric — satırlardan hesaplanır
 *  - CopyIndicator — kopya/şahsi fark
 *  - CalculationSequenceNumeric — KDV hesaplama sırası
 *  - Tüm LegalMonetaryTotal tutarları (PayableAmount, vb.) — hesaplanmış
 *  - Tüm vergi tutarları (TaxAmount, TaxableAmount, vb.) — hesaplanmış
 *
 * Designer'da kullanıcı bu alanları **gri görür**, ekleme butonu disabled.
 * Tasarım bağlansa bile sadece XSLT yansıtır, runtime'da sistem yeniden hesaplar.
 */

export const READONLY_FIELDS = new Set<string>([
    // Belge düzeyi
    'Invoice/UBLVersionID',
    'Invoice/CustomizationID',
    'Invoice/ProfileID',
    'Invoice/ID',
    'Invoice/UUID',
    'Invoice/CopyIndicator',
    'Invoice/IssueDate',
    'Invoice/IssueTime',
    'Invoice/DocumentCurrencyCode',
    'Invoice/LineCountNumeric',

    // Toplamlar (LegalMonetaryTotal — hesaplanmış)
    'Invoice/LegalMonetaryTotal/LineExtensionAmount',
    'Invoice/LegalMonetaryTotal/AllowanceTotalAmount',
    'Invoice/LegalMonetaryTotal/ChargeTotalAmount',
    'Invoice/LegalMonetaryTotal/TaxExclusiveAmount',
    'Invoice/LegalMonetaryTotal/TaxInclusiveAmount',
    'Invoice/LegalMonetaryTotal/PayableAmount',

    // Vergi toplamı (TaxTotal — hesaplanmış)
    'Invoice/TaxTotal/TaxAmount',
    'Invoice/TaxTotal/TaxSubtotal/TaxableAmount',
    'Invoice/TaxTotal/TaxSubtotal/TaxAmount',
    'Invoice/TaxTotal/TaxSubtotal/CalculationSequenceNumeric',
    'Invoice/TaxTotal/TaxSubtotal/Percent',

    // Satır düzeyi
    'Invoice/InvoiceLine/LineExtensionAmount',
    'Invoice/InvoiceLine/TaxTotal/TaxAmount',
    'Invoice/InvoiceLine/TaxTotal/TaxSubtotal/CalculationSequenceNumeric',
    'Invoice/InvoiceLine/TaxTotal/TaxSubtotal/Percent',
    'Invoice/InvoiceLine/TaxTotal/TaxSubtotal/TaxableAmount',
    'Invoice/InvoiceLine/TaxTotal/TaxSubtotal/TaxAmount',
]);

/** Bir alan yolunun read-only olup olmadığını kontrol eder */
export function isReadonlyField(path: string): boolean {
    return READONLY_FIELDS.has(path);
}

/** Hata mesajı — kullanıcıya neden değiştirilemez olduğunu açıklar */
export function getReadonlyReason(path: string): string {
    if (path.includes('UUID')) return 'GİB tarafından atanan ETTN. Değiştirilemez.';
    if (path.includes('UBLVersionID')) return 'UBL sürümü her zaman "2.1". Değiştirilemez.';
    if (path.includes('CustomizationID')) return 'GİB özelleştirmesi "TR1.2". Değiştirilemez.';
    if (path.includes('ProfileID')) return 'Belge profili GİB tarafından atanır. Değiştirilemez.';
    if (path.match(/Invoice\/ID$/)) return 'Fatura numarası sistem tarafından üretilir.';
    if (path.includes('IssueDate')) return 'Fatura tarihi otomatik olarak atanır.';
    if (path.includes('IssueTime')) return 'Fatura saati otomatik olarak atanır.';
    if (path.includes('DocumentCurrencyCode')) return 'Para birimi codelistten gelir, kullanıcı girdisi değildir.';
    if (path.includes('LineCountNumeric')) return 'Satır sayısı fatura satırlarından hesaplanır.';
    if (path.includes('CopyIndicator')) return 'Kopya belirteci sistem tarafından yönetilir.';
    if (path.includes('CalculationSequenceNumeric')) return 'KDV hesaplama sırası otomatik numaralanır.';
    if (path.includes('LegalMonetaryTotal') || path.includes('TaxTotal')) return 'Tutarlar hesaplanmış değerlerdir.';
    if (path.includes('InvoiceLine')) return 'Satır toplamı hesaplanır.';
    return 'Bu alan sistem tarafından üretilir/değiştirilemez.';
}
