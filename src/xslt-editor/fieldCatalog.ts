/**
 * Tasarım editörünün "Tüm Belge Alanları" kataloğu (UBL-TR 1.2.1).
 *
 * Yol sözdizimi: kökten başlayan yerel adlar, `/` ile ayrılır. Adım biçimleri:
 *   `Name`, `Name[@attr='v']`, `Name[Child='v']`, `@attr` (son adım).
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
        ['Fatura Dönemi Bitişi', 'InvoicePeriod/EndDate', 'date'],
    ]],
    ['Satıcı', party('Satıcı', 'AccountingSupplierParty')],
    ['Alıcı', party('Alıcı', 'AccountingCustomerParty')],
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
        ['Hesaplanan KDV (toplam)', 'TaxTotal/TaxAmount', 'amount'],
        ['KDV Matrahı', 'TaxTotal/TaxSubtotal/TaxableAmount', 'amount'],
        ['KDV Tutarı', 'TaxTotal/TaxSubtotal/TaxAmount', 'amount'],
        ['KDV Oranı (%)', 'TaxTotal/TaxSubtotal/Percent', 'number'],
        ['Vergi Adı', 'TaxTotal/TaxSubtotal/TaxCategory/TaxScheme/Name'],
        ['Vergi Kodu', 'TaxTotal/TaxSubtotal/TaxCategory/TaxScheme/TaxTypeCode'],
        ['Muafiyet Sebebi', 'TaxTotal/TaxSubtotal/TaxCategory/TaxExemptionReason'],
        ['Muafiyet Kodu', 'TaxTotal/TaxSubtotal/TaxCategory/TaxExemptionReasonCode'],
        ['Tevkifat Tutarı', 'WithholdingTaxTotal/TaxAmount', 'amount'],
        ['Tevkifat Oranı (%)', 'WithholdingTaxTotal/TaxSubtotal/Percent', 'number'],
        ['Tevkifat Kodu', 'WithholdingTaxTotal/TaxSubtotal/TaxCategory/TaxScheme/TaxTypeCode'],
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
    ]],
    ['Teslimat / İhracat', [
        ['Teslim Şartı (Incoterms)', 'Delivery/DeliveryTerms/ID'],
        ['Gönderim Şekli', 'Delivery/Shipment/ShipmentStage/TransportModeCode'],
        ['Teslim Tarihi', 'Delivery/ActualDeliveryDate', 'date'],
        ['Teslimat Adresi', 'Delivery/DeliveryAddress/StreetName'],
        ['Teslimat İli', 'Delivery/DeliveryAddress/CityName'],
        ['Teslimat Ülkesi', 'Delivery/DeliveryAddress/Country/Name'],
        ['Alıcı (İhracat) Unvanı', 'BuyerCustomerParty/Party/PartyName/Name'],
        ['Alıcı (İhracat) Ülkesi', 'BuyerCustomerParty/Party/PostalAddress/Country/Name'],
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
        ['Satır KDV Oranı (%)', 'InvoiceLine/TaxTotal/TaxSubtotal/Percent', 'number'],
        ['Satır KDV Tutarı', 'InvoiceLine/TaxTotal/TaxSubtotal/TaxAmount', 'amount'],
        ['GTİP No', 'InvoiceLine/Delivery/Shipment/GoodsItem/RequiredCustomsID'],
        ['Satır Notu', 'InvoiceLine/Note'],
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
    ['Gönderen', party('Gönderen', 'DespatchSupplierParty')],
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

const STEP_RE = /^(@?[\w.-]+)(?:\[(@?[\w.-]+)='([^']*)'\])?$/;

function stepXPath(step: string): string {
    const m = step.match(STEP_RE);
    if (!m) return step;
    const [, name, predName, predValue] = m;
    if (name.startsWith('@')) return name;
    let out = `*[local-name()='${name}']`;
    if (predName) {
        out += predName.startsWith('@')
            ? `[${predName}='${predValue}']`
            : `[*[local-name()='${predName}']='${predValue}']`;
    }
    return out;
}

/** Katalog yolunu XPath'e çevirir: mutlak (`/`) ya da satır içinden göreli. */
export function fieldXPath(f: CatalogField, relativeToLine = false): string {
    const steps = f.path.split('/');
    if (relativeToLine && isLineField(f)) return steps.slice(2).map(stepXPath).join('/');
    return '/' + steps.map(stepXPath).join('/');
}

const localNames = (path: string) => path.split('/').map(s => s.match(STEP_RE)?.[1] ?? s);

/**
 * Alan şablonda kullanılıyor mu (yaklaşık): yoldaki tüm ayırt edici eleman
 * adları ve şema değerleri XSLT'de geçiyor olmalı.
 */
export function detectInXslt(xsltLocalNames: Set<string>, xsltText: string, f: CatalogField): boolean {
    const names = localNames(f.path).slice(1).filter(n => n !== 'Party');
    if (!names.every(n => xsltLocalNames.has(n.replace(/^@/, '')))) return false;
    const pred = f.path.match(/\[@?[\w.-]+='([^']*)'\]/);
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
        const pred = f.path.match(/\[@?[\w.-]+='([^']*)'\]/);
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
