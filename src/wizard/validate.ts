import { FAMILY_INFO, EFATURA_PROFILE_IDS, type DocFamily, type WizardDocType } from './docTypes';

export type CheckLevel = 'ok' | 'warn' | 'error';
export interface Check { level: CheckLevel; text: string }
export interface ValidationResult {
    ok: boolean;
    checks: Check[];
    /** Dosyadan okunan özet bilgiler (etiket, değer). */
    info: [string, string][];
}

const XSL_NS = 'http://www.w3.org/1999/XSL/Transform';
const CBC_NS = 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2';

export const stripBom = (text: string) => text.replace(/^\uFEFF/, '').replace(/^ï»¿/, '');

function parseXml(text: string): { doc: Document; error: string | null } {
    const doc = new DOMParser().parseFromString(stripBom(text), 'application/xml');
    const err = doc.getElementsByTagName('parsererror')[0];
    return { doc, error: err ? (err.textContent || 'ayrıştırma hatası').split('\n')[0].slice(0, 160) : null };
}

const familyOfNs = (uri: string | null): DocFamily | null =>
    (Object.keys(FAMILY_INFO) as DocFamily[]).find(f => FAMILY_INFO[f].ns === uri) ?? null;

function tryTransform(xsltDoc: Document, xmlDoc: Document): string | null {
    try {
        const proc = new XSLTProcessor();
        proc.importStylesheet(xsltDoc);
        const out = proc.transformToDocument(xmlDoc);
        if (!out || !out.documentElement) return 'XSLT sonuç üretmedi';
        return null;
    } catch (e) {
        return e instanceof Error ? e.message : String(e);
    }
}

const result = (checks: Check[], info: [string, string][]): ValidationResult => ({
    ok: !checks.some(c => c.level === 'error'),
    checks,
    info,
});

/** Kullanıcının XSLT'si seçilen belge türüne uygun mu? Örnek XML ile deneme dönüşümü yapılır. */
export function validateXslt(text: string, docType: WizardDocType, sampleXml: string | null): ValidationResult {
    const checks: Check[] = [];
    const info: [string, string][] = [];
    const { doc, error } = parseXml(text);
    if (error) return result([{ level: 'error', text: `Dosya geçerli bir XML/XSLT değil: ${error}` }], info);

    const root = doc.documentElement;
    if (root.namespaceURI !== XSL_NS || !['stylesheet', 'transform'].includes(root.localName)) {
        return result([{ level: 'error', text: `Bu dosya bir XSLT değil (kök eleman <${root.nodeName}>; xsl:stylesheet olmalı).` }], info);
    }
    checks.push({ level: 'ok', text: 'Geçerli XSLT dosyası' });
    const version = root.getAttribute('version') || '1.0';
    info.push(['XSLT sürümü', version]);
    info.push(['Şablon (template) sayısı', String(doc.getElementsByTagNameNS(XSL_NS, 'template').length)]);

    // Namespace bildirimi belirleyicidir; kopyala-yapıştır kalıntısı eleman
    // adları (ör. irsaliye XSLT'sinde InvoiceLine) yalnızca namespace yoksa sayılır.
    const families = new Set<DocFamily>();
    for (const m of text.matchAll(/xmlns(?::[\w.-]+)?\s*=\s*["']([^"']+)["']/g)) {
        const f = familyOfNs(m[1]);
        if (f) families.add(f);
    }
    const count = (re: RegExp) => (text.match(re) || []).length;
    const usage: Record<DocFamily, number> = {
        invoice: count(/\bInvoice(Line)?\b/g),
        despatch: count(/\bDespatch(Advice|Line)\b/g),
        receiptAdvice: count(/\bReceiptAdvice\b|\bReceivedQuantity\b/g),
        receipt: count(/\bReceipt(Line)?\b/g),
    };
    const candidates = families.size ? [...families] : (Object.keys(usage) as DocFamily[]).filter(f => usage[f] > 0);
    const primary = candidates.sort((a, b) => usage[b] - usage[a])[0] ?? null;
    const expected = FAMILY_INFO[docType.family];
    if (primary && primary !== docType.family) {
        checks.push({ level: 'error', text: `Bu XSLT ${FAMILY_INFO[primary].label} için hazırlanmış; ${docType.label} için ${expected.label} yapısında bir XSLT gerekli.` });
    } else if (primary) {
        checks.push({ level: 'ok', text: `Belge yapısı uygun: ${expected.label}` });
    } else {
        checks.push({ level: 'warn', text: 'XSLT belge yapısını belirtmiyor; uygunluk örnek veriyle denenerek kontrol edildi.' });
    }

    if (docType.family === 'invoice') {
        const arsiv = /EARSIV|e-Ar[şs]iv/i.test(text);
        const fatura = /TEMELFATURA|TICARIFATURA/.test(text);
        if (docType.id === 'fatura' && arsiv && !fatura) {
            checks.push({ level: 'warn', text: 'XSLT e-Arşiv faturasına özel görünüyor; e-Fatura için başlık ve alanları kontrol edin.' });
        }
        if (docType.id === 'arsiv' && fatura && !arsiv) {
            checks.push({ level: 'warn', text: 'XSLT e-Fatura (Temel/Ticari) için hazırlanmış görünüyor; e-Arşiv başlığını kontrol edin.' });
        }
    }
    if (version.startsWith('2') || version.startsWith('3')) {
        checks.push({ level: 'warn', text: `XSLT ${version} olarak işaretli; tasarımcı 1.0 motoruyla çalıştırır, 2.0'a özel fonksiyonlar çalışmayabilir.` });
    }

    if (sampleXml && !checks.some(c => c.level === 'error')) {
        const xml = parseXml(sampleXml);
        const err = xml.error ? null : tryTransform(doc, xml.doc);
        checks.push(err
            ? { level: 'error', text: `${docType.label} örnek verisiyle çalıştırılamadı: ${err}` }
            : { level: 'ok', text: `${docType.label} örnek verisiyle başarıyla çalıştı` });
    }
    return result(checks, info);
}

const childText = (parent: Element, localName: string, ns = CBC_NS): string => {
    const el = Array.from(parent.children).find(c => c.localName === localName && c.namespaceURI === ns);
    return el?.textContent?.trim() ?? '';
};

function partyName(root: Element, partyTag: string): string {
    const party = Array.from(root.children).find(c => c.localName === partyTag);
    if (!party) return '';
    const name = party.getElementsByTagNameNS(CBC_NS, 'Name')[0]?.textContent?.trim();
    if (name) return name;
    const first = party.getElementsByTagNameNS(CBC_NS, 'FirstName')[0]?.textContent?.trim() ?? '';
    const family = party.getElementsByTagNameNS(CBC_NS, 'FamilyName')[0]?.textContent?.trim() ?? '';
    return `${first} ${family}`.trim();
}

/** Çocuk elemanlar üzerinden yerel adla yol izler: 'Shipment/Delivery/Despatch'. */
function pathAll(el: Element, path: string): Element[] {
    let cur = [el];
    for (const step of path.split('/')) {
        cur = cur.flatMap(e => Array.from(e.children).filter(c => c.localName === step));
    }
    return cur;
}
const pathText = (el: Element, path: string) => pathAll(el, path)[0]?.textContent?.trim() ?? '';

const PLATE_RE: Record<string, RegExp> = {
    PLAKA: /^(0[1-9]|[1-7][0-9]|8[01])[A-Z]+[0-9]+$/,
    DORSE: /^(0[1-9]|[1-7][0-9]|8[01])[A-Z]+[0-9]+$/,
    DORSEPLAKA: /^(0[1-9]|[1-7][0-9]|8[01])[A-Z]+[0-9]+$/,
    YABANCIPLAKA: /^[A-Z0-9_-]+$/,
    YABANCIDORSE: /^[A-Z0-9_-]+$/,
    YABANCIDORSEPLAKA: /^[A-Z0-9_-]+$/,
};
const DOC_ID_RE = /^[A-Z0-9]{3}20[0-9]{2}[0-9]{9}$/;

/** GİB e-İrsaliye şematron kuralları (UBL-TR 1.2.1). Önizlemeyi engellemez, uyarı olarak gösterilir. */
function despatchRuleChecks(root: Element, profile: string, typeCode: string): string[] {
    const issues: string[] = [];
    const id = childText(root, 'ID');
    if (id && !DOC_ID_RE.test(id)) issues.push(`Belge no (${id}) 16 karakter olmalı: 3 harf/rakam seri + yıl + 9 haneli sıra.`);

    if (typeCode.toUpperCase() === 'MATBUDAN') {
        const refs = pathAll(root, 'AdditionalDocumentReference');
        if (!refs.some(r => pathText(r, 'ID') && pathText(r, 'IssueDate'))) {
            issues.push('MATBUDAN irsaliyede matbu belgenin numarası ve tarihi (AdditionalDocumentReference) bulunmalı.');
        }
    }

    const shipment = pathAll(root, 'Shipment')[0];
    if (!shipment) return [...issues, 'Sevkiyat (Shipment) bilgisi yok: fiili sevk tarihi/saati, teslim adresi ve şoför ya da taşıyıcı zorunlu.'];

    const despatch = pathAll(shipment, 'Delivery/Despatch')[0];
    if (!despatch || !pathText(despatch, 'ActualDespatchDate') || !pathText(despatch, 'ActualDespatchTime')) {
        issues.push('Fiili sevk tarihi ve saati (Shipment/Delivery/Despatch) zorunlu.');
    }
    const address = pathAll(shipment, 'Delivery/DeliveryAddress')[0];
    if (!address) {
        issues.push('Sevkiyat teslimat adresi (Shipment/Delivery/DeliveryAddress) yok; ilçe, il, ülke ve posta kodu zorunlu.');
    } else {
        if (!pathText(address, 'CitySubdivisionName') || !pathText(address, 'CityName') || !pathText(address, 'Country/Name')) {
            issues.push('Teslimat adresinde ilçe, il ve ülke zorunlu.');
        }
        const postal = pathText(address, 'PostalZone');
        if (!/^((0[1-9])|([1-7][0-9])|(8[0-1]))[0-9]{3}$/.test(postal)) {
            issues.push(`Teslimat adresi posta kodu ${postal ? `"${postal}" geçersiz` : 'eksik'}; il koduyla başlayan 5 haneli olmalı.`);
        }
    }

    const drivers = pathAll(shipment, 'ShipmentStage/DriverPerson');
    const carrier = pathAll(shipment, 'Delivery/CarrierParty')[0];
    if (!drivers.length && !carrier) issues.push('Şoför (DriverPerson) veya taşıyıcı firma (CarrierParty) bilgisinden biri zorunlu.');
    if (drivers.some(d => !pathText(d, 'FirstName') || !pathText(d, 'FamilyName') || !pathText(d, 'NationalityID'))) {
        issues.push('Şoförün adı, soyadı ve TCKN bilgisi zorunlu.');
    }
    const plates = pathAll(shipment, 'ShipmentStage/TransportMeans/RoadTransport/LicensePlateID');
    if (drivers.length && !plates.length) issues.push('Şoför bilgisi verildiğinde araç plakası (LicensePlateID) zorunlu.');
    const equipment = pathAll(shipment, 'TransportHandlingUnit/TransportEquipment/ID');
    for (const p of [...plates, ...equipment]) {
        const scheme = (p.getAttribute('schemeID') || '').toUpperCase();
        const value = p.textContent?.trim() ?? '';
        const re = PLATE_RE[scheme];
        if (!re) issues.push(`Plaka/dorse türü "${scheme || 'boş'}" geçersiz; PLAKA, YABANCIPLAKA, DORSE, DORSEPLAKA, YABANCIDORSE veya YABANCIDORSEPLAKA olmalı.`);
        else if (!re.test(value)) issues.push(`${scheme} değeri "${value}" GİB formatına uymuyor (ör. 34ABC123).`);
    }

    const lines = pathAll(root, 'DespatchLine');
    const itemIds = (line: Element, scheme: string) => pathAll(line, 'Item/AdditionalItemIdentification/ID')
        .filter(e => e.getAttribute('schemeID') === scheme).map(e => e.textContent?.trim() ?? '');
    if (lines.some(l => !pathText(l, 'DeliveredQuantity') || !pathAll(l, 'DeliveredQuantity')[0]?.getAttribute('unitCode'))) {
        issues.push('Her satırda gönderilen miktar ve birim kodu (DeliveredQuantity/@unitCode) zorunlu.');
    }
    const p = profile.toUpperCase();
    if (p === 'HKSIRSALIYE' && lines.some(l => !itemIds(l, 'KUNYENO').some(v => v.length === 19))) {
        issues.push('HKS irsaliyesinde her satırda 19 karakterlik künye numarası (KUNYENO) zorunlu.');
    }
    if (p === 'IDISIRSALIYE') {
        if (lines.some(l => !itemIds(l, 'ETIKETNO').some(v => /^[A-Z]{2}[0-9]{7}$/.test(v)))) {
            issues.push('IDIS irsaliyesinde her satırda etiket numarası (ETIKETNO: 2 harf + 7 rakam) zorunlu.');
        }
        const sevkiyat = pathAll(root, 'DespatchSupplierParty/Party/PartyIdentification/ID')
            .find(e => e.getAttribute('schemeID') === 'SEVKIYATNO')?.textContent?.trim() ?? '';
        if (!/^(SE|ES)-[0-9]{7}$/.test(sevkiyat)) issues.push('IDIS irsaliyesinde gönderen için SEVKIYATNO (SE-1234567 biçiminde) zorunlu.');
    }
    return issues;
}

const YTB_EARSIV_TYPES = ['YTBSATIS', 'YTBISTISNA', 'YTBIADE', 'YTBTEVKIFAT', 'YTBTEVKIFATIADE'];
const IADE_PROFILES = ['TEMELFATURA', 'EARSIVFATURA', 'ILAC_TIBBICIHAZ', 'YATIRIMTESVIK', 'IDIS', 'KAMU'];
const KDV_ZERO_OK_TYPES = ['IADE', 'YTBIADE', 'IHRACKAYITLI', 'OZELMATRAH', 'SGK', 'KONAKLAMAVERGISI'];
const GUID_RE = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;

/** GİB e-Fatura / e-Arşiv şematron kuralları (UBL-TR 1.2.1, e-Fatura Paketi). */
function invoiceRuleChecks(root: Element, profile: string, typeCode: string): string[] {
    const issues: string[] = [];
    const p = profile.toUpperCase();
    const t = typeCode.toUpperCase();
    const id = childText(root, 'ID');
    if (id && !DOC_ID_RE.test(id)) issues.push(`Belge no (${id}) 16 karakter olmalı: 3 harf/rakam seri + yıl + 9 haneli sıra.`);

    const ids = (party: string) => pathAll(root, `${party}/Party/PartyIdentification/ID`);
    const scheme = (e: Element) => (e.getAttribute('schemeID') || '').toUpperCase();
    for (const [party, label] of [['AccountingSupplierParty', 'Satıcı'], ['AccountingCustomerParty', 'Alıcı']] as const) {
        if (!ids(party).some(e => ['VKN', 'TCKN'].includes(scheme(e)) && e.textContent?.trim())) {
            issues.push(`${label} için schemeID'si VKN veya TCKN olan kimlik numarası yok; karekod içeriği bu alandan üretilir.`);
        }
    }

    const currency = childText(root, 'DocumentCurrencyCode').toUpperCase();
    if (currency && currency !== 'TRY' && !pathText(root, 'PricingExchangeRate/CalculationRate')) {
        issues.push(`Para birimi ${currency}; TRY dışındaki belgelerde döviz kuru (PricingExchangeRate/CalculationRate) zorunlu.`);
    }
    if (t === 'IADE' && p && !IADE_PROFILES.includes(p)) {
        issues.push(`IADE tipi ${p} senaryosunda kullanılamaz; geçerli senaryolar: ${IADE_PROFILES.join(', ')}.`);
    }
    if (!KDV_ZERO_OK_TYPES.includes(t)) {
        const zeroKdv = pathAll(root, 'TaxTotal/TaxSubtotal').filter(s =>
            pathText(s, 'TaxCategory/TaxScheme/TaxTypeCode') === '0015' && Number(pathText(s, 'TaxAmount')) === 0);
        if (zeroKdv.some(s => !pathText(s, 'TaxCategory/TaxExemptionReason'))) {
            issues.push('KDV tutarı 0 olan satırda muafiyet / istisna sebebi (TaxExemptionReason) zorunlu.');
        }
    }

    const lines = pathAll(root, 'InvoiceLine');
    const lineIds = (line: Element) => pathAll(line, 'Item/AdditionalItemIdentification/ID').map(scheme);
    if (t === 'TEKNOLOJIDESTEK') {
        if (!ids('AccountingCustomerParty').some(e => scheme(e) === 'TCKN')) issues.push('TEKNOLOJIDESTEK faturasında alıcı kimliği TCKN olmalı.');
        if (lines.some(l => !lineIds(l).some(s => s === 'TELEFON' || s === 'TABLET_PC'))) {
            issues.push('TEKNOLOJIDESTEK faturasında her kalemde TELEFON (IMEI) veya TABLET_PC numarası zorunlu.');
        }
    }
    if (t === 'SARJ' || t === 'SARJANLIK') {
        const plates = ids('AccountingCustomerParty').filter(e => scheme(e) === 'PLAKA');
        if (plates.length !== 1 || !/^[A-Z0-9_-]+$/.test(plates[0].textContent?.trim() ?? '')) {
            issues.push(`${t} faturasında alıcı altında 1 adet geçerli araç plakası (schemeID PLAKA) zorunlu.`);
        }
        const periods = pathAll(root, 'InvoicePeriod');
        if (!periods.length || periods.some(x => ['StartDate', 'StartTime', 'EndDate', 'EndTime'].some(f => !pathText(x, f)))) {
            issues.push(`${t} faturasında şarj başlangıç/bitiş tarih ve saati (InvoicePeriod) zorunlu.`);
        }
        if (t === 'SARJ' && !pathAll(root, 'AdditionalDocumentReference').some(r =>
            pathAll(r, 'ID').some(e => e.getAttribute('schemeID') === 'ESURaporID' && GUID_RE.test(e.textContent?.trim() ?? '')) && pathText(r, 'IssueDate'))) {
            issues.push('SARJ faturasında ESÜ rapor ID (GUID) ve tarihi (AdditionalDocumentReference, schemeID ESURaporID) zorunlu.');
        }
        if (t === 'SARJANLIK' && lines.some(l => !pathText(l, 'Item/ItemInstance/SerialID'))) {
            issues.push('SARJANLIK faturasında her kalemde seri numarası (Item/ItemInstance/SerialID) zorunlu.');
        }
    }
    if (p === 'YATIRIMTESVIK' || (p === 'EARSIVFATURA' && YTB_EARSIV_TYPES.includes(t))) {
        const ytb = pathAll(root, 'ContractDocumentReference/ID').find(e => e.getAttribute('schemeID') === 'YTBNO')?.textContent?.trim() ?? '';
        if (!/^[0-9]{6}$/.test(ytb)) issues.push('Yatırım teşvik faturasında 6 haneli yatırım teşvik belge numarası (YTBNO) zorunlu.');
        if (lines.some(l => !pathText(l, 'Item/CommodityClassification/ItemClassificationCode'))) {
            issues.push('Yatırım teşvik faturasında her kalemde harcama tipi (ItemClassificationCode) zorunlu.');
        }
    }
    return issues;
}

/** GİB e-İrsaliye Yanıtı kuralları. */
function receiptAdviceRuleChecks(root: Element): string[] {
    const issues: string[] = [];
    const id = childText(root, 'ID');
    if (id && !DOC_ID_RE.test(id)) issues.push(`Belge no (${id}) 16 karakter olmalı: 3 harf/rakam seri + yıl + 9 haneli sıra.`);
    if (!pathText(root, 'DespatchDocumentReference/ID')) issues.push('Yanıtlanan irsaliyenin numarası (DespatchDocumentReference) zorunlu.');
    if (pathAll(root, 'ReceiptLine').some(l => !pathText(l, 'ID') || !pathText(l, 'Item/Name'))) {
        issues.push('Her yanıt satırında satır no ve ürün adı zorunlu.');
    }
    return issues;
}

function receiptAdviceStatus(root: Element): string {
    const lines = pathAll(root, 'ReceiptLine');
    const has = (tag: string) => lines.some(l => Number(pathText(l, tag)) > 0);
    if (lines.length && lines.every(l => !Number(pathText(l, 'ReceivedQuantity')) && Number(pathText(l, 'RejectedQuantity')) > 0)) return 'Red';
    const parts = [has('RejectedQuantity') && 'red', has('ShortQuantity') && 'eksik', has('OversupplyQuantity') && 'fazla'].filter(Boolean);
    return parts.length ? `Kısmi kabul (${parts.join(', ')})` : 'Kabul';
}

/** Kullanıcının XML'i seçilen belge türüne uygun mu? Seçilen XSLT ile deneme dönüşümü yapılır. */
export function validateXml(text: string, docType: WizardDocType, xslt: string | null): ValidationResult {
    const checks: Check[] = [];
    const info: [string, string][] = [];
    const { doc, error } = parseXml(text);
    if (error) return result([{ level: 'error', text: `Dosya geçerli bir XML değil: ${error}` }], info);

    const root = doc.documentElement;
    const family = familyOfNs(root.namespaceURI);
    const expected = FAMILY_INFO[docType.family];
    if (family !== docType.family) {
        const found = family ? FAMILY_INFO[family].label : `<${root.localName}>`;
        return result([{ level: 'error', text: `Bu XML bir ${found} belgesi; ${docType.label} için ${expected.label} belgesi gerekli.` }], info);
    }
    checks.push({ level: 'ok', text: `Belge yapısı uygun: ${expected.label}` });

    const profile = childText(root, 'ProfileID');
    const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (docType.profileIds && profile && !docType.profileIds.some(p => norm(profile).includes(norm(p)))) {
        checks.push({ level: 'warn', text: `Belgenin profili ${profile}; ${docType.label} için beklenen: ${docType.profileIds.join(' / ')}.` });
    }

    const despatchLike = docType.family === 'despatch' || docType.family === 'receiptAdvice';
    const lineTag = docType.family === 'despatch' ? 'DespatchLine' : docType.family === 'receipt' || docType.family === 'receiptAdvice' ? 'ReceiptLine' : 'InvoiceLine';
    const lines = Array.from(root.children).filter(c => c.localName === lineTag).length;
    const typeCode = childText(root, 'InvoiceTypeCode') || childText(root, 'DespatchAdviceTypeCode') || childText(root, 'ReceiptAdviceTypeCode');
    if (docType.typeCodes && typeCode && !docType.typeCodes.includes(typeCode.trim().toUpperCase())) {
        checks.push({ level: 'warn', text: `Belge tipi ${typeCode} GİB kod listesinde yok; ${docType.label} için geçerli tipler: ${docType.typeCodes.join(', ')}.` });
    }
    const supplier = partyName(root, despatchLike ? 'DespatchSupplierParty' : 'AccountingSupplierParty');
    const customer = partyName(root, despatchLike ? 'DeliveryCustomerParty' : 'AccountingCustomerParty');
    const rows: [string, string][] = [
        ['Belge no', childText(root, 'ID')],
        ['Tarih', childText(root, 'IssueDate')],
        ['Profil', profile],
        ['Tip', typeCode],
        ['Para birimi', childText(root, 'DocumentCurrencyCode')],
        ['Gönderen', supplier],
        ['Alıcı', customer],
        ['Satır sayısı', String(lines)],
    ];
    if (docType.family === 'receiptAdvice') {
        rows.push(['Yanıtlanan irsaliye', pathText(root, 'DespatchDocumentReference/ID')], ['Yanıt durumu', receiptAdviceStatus(root)]);
    }
    info.push(...rows.filter(([, v]) => v));
    if (!lines) checks.push({ level: 'warn', text: 'Belgede kalem (satır) bulunamadı; satır tablosu boş görünür.' });

    const ublInvoice = docType.family === 'invoice' && (docType.profileIds ?? []).some(p => p === 'EARSIVFATURA' || EFATURA_PROFILE_IDS.includes(p));
    const gibIssues = docType.family === 'despatch' ? despatchRuleChecks(root, profile, typeCode)
        : docType.family === 'receiptAdvice' ? receiptAdviceRuleChecks(root)
        : ublInvoice ? invoiceRuleChecks(root, profile, typeCode) : [];
    if (gibIssues.length) {
        checks.push(...gibIssues.map(text => ({ level: 'warn' as const, text: `GİB kuralı: ${text}` })));
    } else if (despatchLike || ublInvoice) {
        checks.push({ level: 'ok', text: despatchLike ? 'GİB e-İrsaliye zorunlu alan kontrolleri geçti' : 'GİB fatura kural kontrolleri geçti' });
    }

    if (xslt) {
        const x = parseXml(xslt);
        const err = x.error ? `XSLT okunamadı: ${x.error}` : tryTransform(x.doc, doc);
        checks.push(err
            ? { level: 'error', text: `Seçilen XSLT bu veriyle çalıştırılamadı: ${err}` }
            : { level: 'ok', text: 'Seçilen XSLT bu veriyle başarıyla çalıştı' });
    }
    return result(checks, info);
}
