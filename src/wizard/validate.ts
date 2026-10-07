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

const familiesOfNs = (uri: string | null): DocFamily[] =>
    (Object.keys(FAMILY_INFO) as DocFamily[]).filter(f => FAMILY_INFO[f].ns === uri);
/** e-Bilet raporu ile e-Yolcu Listesi aynı namespace'i kullanır; kök adı ayırır. */
const familyOfRoot = (root: Element): DocFamily | null => {
    const families = familiesOfNs(root.namespaceURI);
    return families.find(f => FAMILY_INFO[f].root === root.localName) ?? families[0] ?? null;
};

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
        for (const f of familiesOfNs(m[1])) families.add(f);
    }
    const count = (re: RegExp) => (text.match(re) || []).length;
    const usage: Record<DocFamily, number> = {
        invoice: count(/\bInvoice(Line)?\b/g),
        despatch: count(/\bDespatch(Advice|Line)\b/g),
        receiptAdvice: count(/\bReceiptAdvice\b|\bReceivedQuantity\b/g),
        receipt: count(/\bReceipt(Line)?\b/g),
        ebiletReport: count(/\beBilet\b|\bodemeSekli\b|\bbiletIptal\b/g),
        ebiletPassengerList: count(/\beYolcuListesi\b|\bkoltukNo\b|\bseferNumarasi\b/g),
        creditNote: count(/\bCreditNote(Line)?\b/g),
    };
    const candidates = families.size ? [...families] : (Object.keys(usage) as DocFamily[]).filter(f => usage[f] > 0);
    const primary = candidates.sort((a, b) => usage[b] - usage[a] || Number(b === docType.family) - Number(a === docType.family))[0] ?? null;
    const expected = FAMILY_INFO[docType.family];
    if (primary && primary !== docType.family) {
        checks.push({ level: 'error', text: `Bu XSLT ${FAMILY_INFO[primary].label} için hazırlanmış; ${docType.label} için ${expected.label} yapısında bir XSLT gerekli.` });
    } else if (primary) {
        checks.push({ level: 'ok', text: `Belge yapısı uygun: ${expected.label}` });
    } else {
        checks.push({ level: 'warn', text: 'XSLT belge yapısını belirtmiyor; uygunluk örnek veriyle denenerek kontrol edildi.' });
    }

    if (docType.family === 'invoice') {
        const visible = text.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[\s\S]*?<\/script>/gi, '');
        const arsiv = /EARSIV|e-Ar[şs]iv/i.test(visible);
        const fatura = /TEMELFATURA|TICARIFATURA/.test(visible);
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
    const name = Array.from(party.getElementsByTagNameNS(CBC_NS, 'Name')).find(n => n.parentElement?.localName === 'PartyName')?.textContent?.trim();
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

/** e-Arşiv rapor şeması (EArsiv.xsd vergiKodEnum) vergi / kesinti kodları. */
const EARSIV_TAX_CODES = [
    '0003', '0011', '0015', '0021', '0022', '0059', '0061', '0071', '0073', '0074', '0075', '0076', '0077',
    '1047', '1048', '4071', '4080', '4081', '4171', '8001', '8002', '8004', '8005', '8006', '8007', '8008',
    '9015', '9021', '9040', '9064', '9077', '9944', 'SGK_PRIM',
];
const MUSTAHSIL_KESINTI: Record<string, string> = { '0003': 'GV stopajı', '8001': 'Borsa tescil ücreti', '9040': 'Mera fonu', SGK_PRIM: 'SGK prim kesintisi' };

/**
 * e-Müstahsil Makbuzu: Müstahsil Makbuzu Kılavuzu V1.1 (SMS doğrulama dahil), 509 Sıra No'lu
 * VUK Genel Tebliği IV.5.3, Karekod Standardı Kılavuzu 2.5 ve e-Arşiv Teknik Kılavuzu 3.3.4.
 */
function mustahsilRuleChecks(root: Element): string[] {
    const issues: string[] = [];
    const version = childText(root, 'UBLVersionID');
    if (version && version !== '2.1') issues.push(`UBL sürümü (UBLVersionID) 2.1 olmalı; belgede ${version}.`);
    const customization = childText(root, 'CustomizationID');
    if (customization !== 'TR1.2.1') issues.push(`Özelleştirme no (CustomizationID) TR1.2.1 olmalı${customization ? `; belgede ${customization}` : ''}.`);
    if (!childText(root, 'ProfileID')) issues.push('Senaryo (ProfileID) zorunlu; EARSIVBELGE yazılmalı.');
    const id = childText(root, 'ID');
    if (!id) issues.push('Makbuz numarası (ID) zorunlu.');
    else if (!DOC_ID_RE.test(id)) issues.push(`Makbuz no (${id}) 16 karakter olmalı: 3 haneli alfanümerik birim kod + yıl + 9 haneli sıra.`);
    if (!/^(true|false)$/.test(childText(root, 'CopyIndicator'))) issues.push('Asıl / suret bilgisi (CopyIndicator) zorunlu: asıl için false, suret için true.');
    const uuid = childText(root, 'UUID');
    if (!GUID_RE.test(uuid)) issues.push(uuid ? `ETTN (${uuid}) GUID biçiminde olmalı.` : 'ETTN (UUID) zorunlu; karekodda yer alır.');
    if (!childText(root, 'IssueDate') || !/^[0-9]{2}:[0-9]{2}/.test(childText(root, 'IssueTime'))) {
        issues.push('Belgenin tarihi ile saat ve dakika olarak düzenlenme zamanı (IssueDate, IssueTime) zorunlu.');
    }
    if (!childText(root, 'CreditNoteTypeCode')) issues.push('Belge tipi (CreditNoteTypeCode) MUSTAHSILMAKBUZ olarak yazılmalı.');
    if (!childText(root, 'DocumentCurrencyCode')) issues.push('Para birimi (DocumentCurrencyCode) zorunlu; karekodda ve e-Arşiv raporunda yer alır.');
    if (!pathAll(root, 'Signature').length) issues.push('Mali mühür / imza bilgisi (Signature) zorunlu.');

    const hasAddress = (p: Element) => !!(pathText(p, 'PostalAddress/StreetName') || pathText(p, 'PostalAddress/CitySubdivisionName')) && !!pathText(p, 'PostalAddress/CityName');
    const checkId = (p: Element, label: string, qrKey: string) => {
        const el = pathAll(p, 'PartyIdentification/ID').find(e => ['VKN', 'TCKN'].includes((e.getAttribute('schemeID') || '').toUpperCase()) && e.textContent?.trim());
        if (!el) {
            issues.push(`${label} için schemeID'si VKN veya TCKN olan kimlik numarası zorunlu (karekod "${qrKey}").`);
            return;
        }
        const scheme = (el.getAttribute('schemeID') || '').toUpperCase();
        const value = el.textContent?.trim() ?? '';
        if (!(scheme === 'VKN' ? /^[0-9]{10}$/ : /^[0-9]{11}$/).test(value)) issues.push(`${label} ${scheme} değeri (${value}) ${scheme === 'VKN' ? 10 : 11} haneli olmalı.`);
    };

    const supplier = pathAll(root, 'AccountingSupplierParty/Party')[0];
    if (!supplier) {
        issues.push('Makbuzu düzenleyen (AccountingSupplierParty) bilgisi yok.');
    } else {
        checkId(supplier, 'Makbuzu düzenleyen', 'vkntckn');
        if (!pathText(supplier, 'PartyName/Name') && !pathText(supplier, 'Person/FamilyName')) issues.push('Makbuzu düzenleyenin adı soyadı veya unvanı zorunlu.');
        if (!pathText(supplier, 'PartyTaxScheme/TaxScheme/Name')) issues.push('Makbuzu düzenleyenin vergi dairesi (PartyTaxScheme/TaxScheme/Name) zorunlu.');
        if (!hasAddress(supplier)) issues.push('Makbuzu düzenleyenin adresi (cadde/sokak veya ilçe ile il) zorunlu.');
        const provider = pathAll(supplier, 'Contact/OtherCommunication')
            .find(o => pathAll(o, 'ChannelCode').some(c => c.getAttribute('name') === 'SMS_PROVIDER'));
        if (!provider || !pathText(provider, 'ChannelCode') || !pathText(provider, 'Value')) {
            issues.push('SMS gönderen operatör bilgisi yazılmalı: düzenleyen Contact/OtherCommunication altında ChannelCode name="SMS_PROVIDER" (uygulama adı) ve Value (operatör VKN).');
        }
    }
    const farmer = pathAll(root, 'AccountingCustomerParty/Party')[0];
    if (!farmer) {
        issues.push('Malı satan üretici / çiftçi (AccountingCustomerParty) bilgisi yok.');
    } else {
        checkId(farmer, 'Üretici / çiftçi', 'avkntckn');
        if (!(pathText(farmer, 'Person/FirstName') && pathText(farmer, 'Person/FamilyName')) && !pathText(farmer, 'PartyName/Name')) {
            issues.push('Malı satan çiftçinin adı ve soyadı (Person/FirstName, FamilyName) zorunlu.');
        }
        if (!hasAddress(farmer)) issues.push('Çiftçinin ikametgah adresi (cadde/sokak veya ilçe ile il) zorunlu.');
        const sms = pathAll(farmer, 'Contact').find(c => pathText(c, 'Name').toUpperCase() === 'SMS');
        if (!sms || !pathText(sms, 'ID') || !pathText(sms, 'Telephone')) {
            issues.push('Islak imza yerine çiftçinin telefonuna gönderilen SMS kodu yazılmalı: Contact altında Name "SMS", ID = SMS kodu, Telephone = SMS gönderilen telefon.');
        }
    }

    const num = (s: string) => Number(s) || 0;
    const near = (a: number, b: number) => Math.abs(a - b) <= 0.05;
    const fmt = (n: number) => n.toFixed(2);
    const subs = pathAll(root, 'TaxTotal/TaxSubtotal');
    if (!subs.length) issues.push('Vergi / kesinti bilgisi (TaxTotal) zorunlu; gelir vergisi stopajı ve varsa diğer kesintiler gösterilmeli.');
    for (const s of subs) {
        const code = pathText(s, 'TaxCategory/TaxScheme/TaxTypeCode');
        const name = MUSTAHSIL_KESINTI[code] ?? (pathText(s, 'TaxCategory/TaxScheme/Name') || 'Kesinti');
        if (!EARSIV_TAX_CODES.includes(code)) {
            issues.push(`Kesinti kodu "${code || 'boş'}" geçerli değil; GV stopajı 0003, borsa tescil ücreti 8001, mera fonu 9040, SGK prim kesintisi SGK_PRIM.`);
        }
        const pct = pathText(s, 'Percent');
        if (!pct) {
            issues.push(`${name} satırında oran (Percent) yazılmalı; e-Arşiv raporunda vergi oranı zorunlu.`);
        } else if (pathText(s, 'TaxableAmount') && !near(num(pathText(s, 'TaxableAmount')) * Number(pct) / 100, num(pathText(s, 'TaxAmount')))) {
            issues.push(`${name} tutarı ${pathText(s, 'TaxAmount')}, matrah × %${pct} = ${fmt(num(pathText(s, 'TaxableAmount')) * Number(pct) / 100)} ile uyuşmuyor.`);
        }
    }

    const lines = pathAll(root, 'CreditNoteLine');
    if (lines.some(l => !pathText(l, 'Item/Name'))) issues.push('Her kalemde satın alınan malın cinsi (Item/Name) zorunlu.');
    if (lines.some(l => !pathText(l, 'CreditedQuantity') || !pathAll(l, 'CreditedQuantity')[0]?.getAttribute('unitCode'))) {
        issues.push('Her kalemde miktar ve birim kodu (CreditedQuantity/@unitCode) zorunlu.');
    }
    if (lines.some(l => !pathText(l, 'LineExtensionAmount') || !pathText(l, 'Price/PriceAmount'))) {
        issues.push('Her kalemde birim fiyat ve bedel (Price/PriceAmount, LineExtensionAmount) zorunlu.');
    }
    const total = (tag: string) => pathText(root, `LegalMonetaryTotal/${tag}`);
    if (!total('LineExtensionAmount') || !total('PayableAmount')) {
        issues.push('Mal hizmet toplam tutarı ve ödenecek tutar (LegalMonetaryTotal/LineExtensionAmount, PayableAmount) zorunlu; karekodda yer alır.');
    } else {
        const lineSum = lines.reduce((t, l) => t + num(pathText(l, 'LineExtensionAmount')), 0);
        if (lines.length && !near(lineSum, num(total('LineExtensionAmount')))) {
            issues.push(`Kalem bedelleri toplamı ${fmt(lineSum)}, mal hizmet toplam tutarı ${total('LineExtensionAmount')} ile uyuşmuyor.`);
        }
        const kesinti = subs.reduce((t, s) => t + num(pathText(s, 'TaxAmount')), 0);
        const declared = pathAll(root, 'TaxTotal').reduce((t, x) => t + num(pathText(x, 'TaxAmount')), 0);
        if (!near(kesinti, declared)) issues.push(`Toplam kesinti (TaxTotal/TaxAmount) ${fmt(declared)}, kesinti satırları toplamı ${fmt(kesinti)} ile uyuşmuyor.`);
        const expected = num(total('LineExtensionAmount')) - num(total('AllowanceTotalAmount')) + num(total('ChargeTotalAmount')) - kesinti + num(total('PayableRoundingAmount'));
        if (!near(expected, num(total('PayableAmount')))) {
            issues.push(`Ödenecek tutar ${total('PayableAmount')}; mal hizmet toplamı ${total('LineExtensionAmount')} − kesintiler ${fmt(kesinti)} = ${fmt(expected)} olmalı.`);
        }
    }
    return issues;
}

// ---------------------------------------------------------------------------
// CreditNote tabanlı diğer e-Arşiv belgeleri: e-Gider Pusulası, e-Döviz ve
// Kıymetli Maden, e-Dekont, e-Sigorta Komisyon Gider Belgesi (GİB paketleri).
// ---------------------------------------------------------------------------
const TIME_RE = /^[0-9]{2}:[0-9]{2}:[0-9]{2}/;
const near01 = (a: number, b: number) => Math.abs(a - b) <= 0.011;
const num0 = (s: string) => Number(s) || 0;

/** Başlık, imza ve taraf varlığı: dört paketin kılavuzlarında ortak zorunlu alanlar. */
function creditNoteHeaderChecks(root: Element, noun: string, timeRequired: boolean): string[] {
    const issues: string[] = [];
    const version = childText(root, 'UBLVersionID');
    if (version !== '2.1') issues.push(`UBL sürümü (UBLVersionID) 2.1 olmalı${version ? `; belgede ${version}` : ''}.`);
    const customization = childText(root, 'CustomizationID');
    if (customization !== 'TR1.2.1') issues.push(`Özelleştirme no (CustomizationID) TR1.2.1 olmalı${customization ? `; belgede ${customization}` : ''}.`);
    const id = childText(root, 'ID');
    if (!id) issues.push(`${noun} numarası (ID) zorunlu.`);
    else if (!DOC_ID_RE.test(id)) issues.push(`${noun} no (${id}) 16 karakter olmalı: 3 haneli alfanümerik birim kod + yıl + 9 haneli sıra.`);
    if (!/^(true|false)$/.test(childText(root, 'CopyIndicator'))) issues.push('Asıl / suret bilgisi (CopyIndicator) zorunlu: asıl için false, suret için true.');
    const uuid = childText(root, 'UUID');
    if (!GUID_RE.test(uuid)) issues.push(uuid ? `ETTN (${uuid}) 36 karakterlik GUID biçiminde olmalı.` : 'ETTN (UUID) zorunlu; karekodda yer alır.');
    const date = childText(root, 'IssueDate');
    if (!ISO_DATE_RE.test(date)) issues.push(date ? `Düzenleme tarihi (${date}) YYYY-AA-GG biçiminde olmalı.` : 'Düzenleme tarihi (IssueDate) zorunlu.');
    if (timeRequired && !TIME_RE.test(childText(root, 'IssueTime'))) issues.push('Düzenleme zamanı (IssueTime) saat:dakika:saniye olarak zorunlu.');
    if (!pathAll(root, 'Signature').length) issues.push('Mali mühür / imza bilgisi (Signature) zorunlu.');
    if (!pathAll(root, 'AccountingSupplierParty/Party').length) issues.push(`${noun} düzenleyen taraf (AccountingSupplierParty) zorunlu.`);
    if (!pathAll(root, 'AccountingCustomerParty/Party').length) issues.push('Karşı taraf (AccountingCustomerParty) zorunlu.');
    if (!pathAll(root, 'LegalMonetaryTotal').length) issues.push('Parasal toplamlar (LegalMonetaryTotal) zorunlu.');
    if (!pathAll(root, 'CreditNoteLine').length) issues.push('En az bir kalem (CreditNoteLine) zorunlu.');
    return issues;
}

/** VKN 10, TCKN 11 hane; uygun kimlik yoksa veya biçim bozuksa uyarı metni döner. */
function vknTcknIssue(party: Element | undefined, label: string): string | null {
    if (!party) return null;
    const el = pathAll(party, 'PartyIdentification/ID').find(e => ['VKN', 'TCKN'].includes(e.getAttribute('schemeID') ?? '') && e.textContent?.trim());
    if (!el) return `${label} için schemeID'si VKN veya TCKN olan kimlik numarası zorunlu.`;
    const scheme = el.getAttribute('schemeID');
    const value = el.textContent?.trim() ?? '';
    return (scheme === 'VKN' ? /^[0-9]{10}$/ : /^[0-9]{11}$/).test(value) ? null : `${label} ${scheme} değeri (${value}) ${scheme === 'VKN' ? 10 : 11} haneli olmalı.`;
}

const GIDER_IADE_REFS = ['EARSIV_FATURA', 'SATIS_FISI', 'BELGESIZ'];

/** e-Gider Pusulası Teknik Kılavuzu V1.0: SATIS (mükellef olmayandan alım) ve IADE (nihai tüketici iadesi). */
function giderPusulasiRuleChecks(root: Element, typeCode: string): string[] {
    const issues = creditNoteHeaderChecks(root, 'Gider pusulası', true);
    if (!childText(root, 'DocumentCurrencyCode')) issues.push('Para birimi (DocumentCurrencyCode) zorunlu; karekodda "parabirimi" olarak yer alır.');
    const iade = typeCode.toUpperCase() === 'IADE';
    if (!pathAll(root, 'AdditionalDocumentReference').length) issues.push('İlave doküman bilgisi (AdditionalDocumentReference) en az bir kez yazılmalı.');
    const supplier = pathAll(root, 'AccountingSupplierParty/Party')[0];
    const customer = pathAll(root, 'AccountingCustomerParty/Party')[0];
    const supplierIssue = vknTcknIssue(supplier, 'Gider pusulasını düzenleyen');
    if (supplierIssue) issues.push(supplierIssue);
    if (supplier && !pathAll(supplier, 'Contact/OtherCommunication').some(o => pathText(o, 'ChannelCode') && pathText(o, 'Value'))) {
        issues.push('Düzenleyenin Contact/OtherCommunication alanına kodu üreten SMS operatörü ya da iade kodu uygulaması (ChannelCode name="SMS_PROVIDER" / "IADE_PROVIDER") ve VKN\'si (Value) yazılmalı.');
    }
    const codeContact = (party: Element, label: string) => {
        const contact = pathAll(party, 'Contact').find(c => /^(SMS|IADE ?KODU)$/i.test(pathText(c, 'Name')));
        if (!contact || !pathText(contact, 'ID') || !pathText(contact, 'Telephone')) {
            issues.push(`${label} Contact alanında Name "${iade ? 'SMS" veya "IADEKODU' : 'SMS'}", ID = ${iade ? 'SMS / iade kodu' : 'SMS kodu'}, Telephone = kodun gönderildiği telefon yazılmalı.`);
        } else if (!iade && pathText(contact, 'Name').toUpperCase() !== 'SMS') {
            issues.push('SATIS tipinde malı satanın telefonuna gönderilen SMS kodu yazılmalı (Contact/Name "SMS"); iade kodu yalnızca IADE tipinde kullanılır.');
        }
    };
    if (customer) codeContact(customer, iade ? 'İade eden (AccountingCustomerParty)' : 'Malı satan (AccountingCustomerParty)');
    const buyer = pathAll(root, 'BuyerCustomerParty/Party')[0];
    if (buyer) codeContact(buyer, 'Adına iade yapılan (BuyerCustomerParty)');
    if (iade) {
        const ref = pathAll(root, 'BillingReference/InvoiceDocumentReference/ID')[0];
        const scheme = ref?.getAttribute('schemeID') ?? '';
        if (!ref) {
            issues.push('IADE tipinde iade edilen malın belgesi BillingReference/InvoiceDocumentReference/ID alanına yazılmalı (schemeID EARSIV_FATURA, SATIS_FISI ya da belge yoksa BELGESIZ).');
        } else if (!GIDER_IADE_REFS.includes(scheme)) {
            issues.push(`İade belgesi türü (schemeID) "${scheme || 'boş'}" geçersiz; EARSIV_FATURA, SATIS_FISI veya BELGESIZ olmalı.`);
        } else if (scheme !== 'BELGESIZ' && !ref.textContent?.trim()) {
            issues.push(`İade edilen mala ait ${scheme} numarası (InvoiceDocumentReference/ID) boş olamaz.`);
        }
        if (scheme === 'BELGESIZ' && customer && !pathAll(customer, 'PartyIdentification/ID').some(e => e.getAttribute('schemeID') === 'TCKN' && /^[0-9]{11}$/.test(e.textContent?.trim() ?? ''))) {
            issues.push('Belgesiz iadede iade edenin 11 haneli TCKN\'si (schemeID TCKN) zorunlu.');
        }
        for (const party of pathAll(root, 'Delivery/DeliveryParty')) {
            const vkn = pathAll(party, 'PartyIdentification/ID').some(e => e.getAttribute('schemeID') === 'VKN' && e.textContent?.trim());
            const yetki = pathAll(party, 'IndustryClassificationCode').some(e => e.getAttribute('name') === 'YETKIBELGENO' && e.textContent?.trim());
            if (!vkn || !pathText(party, 'PartyName/Name') || !yetki) {
                issues.push('Kargoyla iadede Delivery/DeliveryParty alanına kargo firmasının VKN\'si, unvanı ve yetki belgesi numarası (IndustryClassificationCode name="YETKIBELGENO") yazılmalı.');
            }
        }
    }
    if (!pathAll(root, 'TaxTotal').length) issues.push('Vergi bilgisi (TaxTotal) zorunlu.');
    const lines = pathAll(root, 'CreditNoteLine');
    if (lines.some(l => !pathText(l, 'Item/Name'))) issues.push('Her kalemde malın / hizmetin adı (Item/Name) zorunlu.');
    if (lines.some(l => !pathText(l, 'CreditedQuantity') || !pathText(l, 'LineExtensionAmount'))) issues.push('Her kalemde miktar ve tutar (CreditedQuantity, LineExtensionAmount) zorunlu.');
    const total = (tag: string) => pathText(root, `LegalMonetaryTotal/${tag}`);
    if (!total('LineExtensionAmount') || !total('PayableAmount')) {
        issues.push('Mal hizmet toplamı ve ödenecek tutar (LegalMonetaryTotal/LineExtensionAmount, PayableAmount) zorunlu; karekodda yer alır.');
    } else {
        const lineSum = lines.reduce((t, l) => t + num0(pathText(l, 'LineExtensionAmount')), 0);
        if (lines.length && Math.abs(lineSum - num0(total('LineExtensionAmount'))) > 0.05) {
            issues.push(`Kalem tutarları toplamı ${lineSum.toFixed(2)}, mal hizmet toplamı ${total('LineExtensionAmount')} ile uyuşmuyor.`);
        }
    }
    return issues;
}

const DOVIZ_METAL_CODES = ['XAU_22C', 'XAU_22Y', 'XAU_22T', 'XAU_22I', 'XAU_22B', 'XAU_24G', 'XAU_24G_1000'];
const DOVIZ_PAYMENT_CODES = ['10', '55', '46', '68'];
const DOVIZ_PARTY_SCHEMES = ['TCKN', 'VKN', 'SUBENO', 'PASAPORTNO', 'MUSTERITURU'];
const DOVIZ_CUSTOMER_TYPES = ['BANKA', 'GERCEKKISI', 'TUZELKISI', 'YETKILIMUESSESE'];

/** e-Döviz ve Kıymetli Maden Alım-Satım Belgesi Teknik Kılavuzu V1.3 ve paketteki "doviz kural listesi". */
function dovizRuleChecks(root: Element, profile: string, typeCode: string): string[] {
    const issues = creditNoteHeaderChecks(root, 'Belge', false);
    const maden = profile.toUpperCase() === 'EKIYMETLIMADENBELGE';
    const alim = typeCode.toUpperCase() === 'ALIM';
    const signatureId = pathAll(root, 'Signature/ID')[0];
    if (signatureId && (signatureId.getAttribute('schemeID') !== 'VKN_TCKN' || !/^([0-9]{10}|[0-9]{11})$/.test(signatureId.textContent?.trim() ?? ''))) {
        issues.push('İmza bilgisinde Signature/ID schemeID="VKN_TCKN" ve 10 haneli VKN ya da 11 haneli TCKN olmalı.');
    }
    const subs = pathAll(root, 'TaxTotal/TaxSubtotal');
    if (subs.some(s => ['TaxableAmount', 'TaxAmount', 'CalculationSequenceNumeric', 'Percent', 'TaxCategory/TaxScheme/Name', 'TaxCategory/TaxScheme/TaxTypeCode'].some(f => !pathText(s, f)))) {
        issues.push('Her vergi satırında matrah, vergi tutarı, hesaplama sırası, oran, vergi adı ve kodu (TaxSubtotal) zorunlu.');
    }
    const means = pathAll(root, 'PaymentMeans');
    if (means.length < 2) issues.push('Ödeme şekli (PaymentMeans) müşteri ve yetkili müessese için ayrı ayrı, en az iki kez yazılmalı.');
    const badCode = means.map(m => pathText(m, 'PaymentMeansCode')).find(c => !DOVIZ_PAYMENT_CODES.includes(c));
    if (badCode !== undefined) issues.push(`Ödeme şekli kodu "${badCode || 'boş'}" geçersiz; 10 (nakit), 55 (hesaptan), 46 (EFT / havale) veya 68 (kredi kartı) olmalı.`);
    if (means.length && (!means.some(m => pathText(m, 'PayerFinancialAccount/ID')) || !means.some(m => pathText(m, 'PayeeFinancialAccount/ID')))) {
        issues.push('Ödeme şekillerinde müşteri hesabı (PayerFinancialAccount/ID) ve müessese hesabı (PayeeFinancialAccount/ID) birer kez yazılmalı.');
    }
    const badScheme = pathAll(root, 'AccountingSupplierParty/Party/PartyIdentification/ID').concat(pathAll(root, 'AccountingCustomerParty/Party/PartyIdentification/ID'))
        .map(e => e.getAttribute('schemeID')).find(s => s !== null && !DOVIZ_PARTY_SCHEMES.includes(s));
    if (badScheme !== undefined) issues.push(`Kimlik türü (schemeID) "${badScheme}" geçersiz; ${DOVIZ_PARTY_SCHEMES.join(', ')} kullanılabilir.`);
    const checkParty = (tag: string, label: string) => {
        const party = pathAll(root, `${tag}/Party`)[0];
        if (!party) return undefined;
        const ids = pathAll(party, 'PartyIdentification/ID');
        const vkn = ids.find(e => e.getAttribute('schemeID') === 'VKN')?.textContent?.trim();
        const tckn = ids.find(e => e.getAttribute('schemeID') === 'TCKN')?.textContent?.trim();
        if (!vkn && !tckn) issues.push(`${label} için VKN ya da TCKN zorunlu.`);
        if (vkn !== undefined && (!/^[0-9]{10}$/.test(vkn) || !pathText(party, 'PartyName/Name'))) issues.push(`${label} VKN ile yazıldığında 10 haneli VKN ve unvan (PartyName/Name) zorunlu.`);
        if (tckn !== undefined && (!/^[0-9]{11}$/.test(tckn) || ['FirstName', 'FamilyName', 'NationalityID'].some(f => !pathText(party, `Person/${f}`)))) {
            issues.push(`${label} TCKN ile yazıldığında 11 haneli TCKN ile kişinin adı, soyadı ve uyruğu (Person/FirstName, FamilyName, NationalityID) zorunlu.`);
        }
        return ids;
    };
    const supplierIds = checkParty('AccountingSupplierParty', 'Yetkili müessese / banka');
    if (supplierIds && !supplierIds.some(e => e.getAttribute('schemeID') === 'SUBENO' && e.textContent?.trim())) {
        issues.push('Yetkili müessesenin dosya / şube numarası (schemeID SUBENO) zorunlu.');
    }
    const customerIds = checkParty('AccountingCustomerParty', 'Müşteri');
    const customerType = customerIds?.find(e => e.getAttribute('schemeID') === 'MUSTERITURU')?.textContent?.trim();
    if (customerIds && !DOVIZ_CUSTOMER_TYPES.includes(customerType ?? '')) {
        issues.push(`Müşteri türü (schemeID MUSTERITURU) ${customerType ? `"${customerType}" geçersiz; ` : 'zorunlu; '}${DOVIZ_CUSTOMER_TYPES.join(', ')} olmalı.`);
    }
    const total = (tag: string) => pathText(root, `LegalMonetaryTotal/${tag}`);
    if (['LineExtensionAmount', 'TaxExclusiveAmount', 'TaxInclusiveAmount', 'PayableAmount'].some(f => !total(f))) {
        issues.push('LegalMonetaryTotal altında LineExtensionAmount, TaxExclusiveAmount, TaxInclusiveAmount ve PayableAmount zorunlu.');
    }
    const rate = pathAll(root, 'PaymentExchangeRate')[0];
    const pricing = pathAll(root, 'PricingExchangeRate')[0];
    if (!rate || !pathText(rate, 'SourceCurrencyCode') || !pathText(rate, 'TargetCurrencyCode') || !pathText(rate, 'CalculationRate')) {
        issues.push(`Uygulanan ${maden ? 'birim fiyat' : 'kur'} (PaymentExchangeRate: SourceCurrencyCode, TargetCurrencyCode, CalculationRate) zorunlu.`);
    }
    for (const [el, label] of [[rate, 'PaymentExchangeRate'], [pricing, 'PricingExchangeRate']] as const) {
        if (!el) continue;
        if (!/^[0-9]+(\.[0-9]{1,6})?$/.test(pathText(el, 'CalculationRate'))) issues.push(`${label}/CalculationRate sayı olmalı ve virgülden sonra en fazla 6 hane içermeli.`);
        if (pathText(el, 'SourceCurrencyCode') && pathText(el, 'SourceCurrencyCode') === pathText(el, 'TargetCurrencyCode')) issues.push(`${label} kaynak ve hedef para birimi aynı olamaz.`);
    }
    const validCode = (c: string) => EBILET_CURRENCIES.has(c) || (maden && DOVIZ_METAL_CODES.includes(c));
    const badCurrency = Array.from(root.getElementsByTagName('*')).map(e => e.getAttribute('currencyID')).find(c => c !== null && !validCode(c));
    if (badCurrency !== undefined) {
        issues.push(`Para birimi kodu (currencyID) "${badCurrency}" geçersiz; ISO 4217 kodu${maden ? ` ya da kıymetli maden kodu (${DOVIZ_METAL_CODES.join(', ')})` : ''} olmalı.`);
    }
    if (rate) {
        const source = pathText(rate, 'SourceCurrencyCode');
        const target = pathText(rate, 'TargetCurrencyCode');
        const foreign = alim ? source : target;
        const local = alim ? target : source;
        if (local !== 'TRY' || foreign === 'TRY' || (foreign && !validCode(foreign))) {
            issues.push(`${alim ? 'ALIM' : 'SATIM'} belgesinde PaymentExchangeRate ${alim ? 'kaynağı' : 'hedefi'} ${maden ? 'kıymetli maden ya da döviz' : 'döviz'} kodu, ${alim ? 'hedefi' : 'kaynağı'} TRY olmalı.`);
        }
        const r = Number(pathText(rate, 'CalculationRate'));
        const payable = num0(total('PayableAmount'));
        const line = num0(total('LineExtensionAmount'));
        if (!maden && r > 0 && payable && line && !near01(Math.round(payable * r * 100) / 100, line)) {
            issues.push(`Ödenecek tutar ${total('PayableAmount')} × kur ${pathText(rate, 'CalculationRate')} = ${(payable * r).toFixed(2)}; döviz karşılığı (LineExtensionAmount) ${total('LineExtensionAmount')} ile uyuşmuyor.`);
        }
    }
    return issues;
}

/** e-Dekont Teknik Kılavuzu V1.4: banka, ÖK / EPK dekontları ile VTA ve GVTA tahsil alındıları. */
function dekontRuleChecks(root: Element, profile: string): string[] {
    const issues = creditNoteHeaderChecks(root, 'Dekont', true);
    const supplierIssue = vknTcknIssue(pathAll(root, 'AccountingSupplierParty/Party')[0], 'Dekontu düzenleyen banka / kuruluş');
    if (supplierIssue) issues.push(supplierIssue);
    if (!pathAll(root, 'AdditionalDocumentReference').length) issues.push('İlave doküman bilgisi (AdditionalDocumentReference) en az bir kez yazılmalı.');
    const scenario = profile.toUpperCase().replace(/IPTAL$/, '');
    if (scenario === 'VTA' || scenario === 'GVTA') {
        const rep = pathAll(root, 'TaxRepresentativeParty')[0];
        const repId = (scheme: string) => rep && pathAll(rep, 'PartyIdentification/ID').some(e => e.getAttribute('schemeID') === scheme && e.textContent?.trim());
        if (!rep) {
            issues.push(`${scenario} senaryosunda tahsil alındısı bilgileri (TaxRepresentativeParty) zorunlu.`);
        } else if (scenario === 'VTA' && (!repId('VERGIDONEMI') || !pathText(rep, 'PartyTaxScheme/TaxScheme/Name') || !pathText(rep, 'PartyTaxScheme/TaxScheme/TaxTypeCode'))) {
            issues.push('VTA\'da vergilendirme dönemi (schemeID VERGIDONEMI) ile tahsil eden vergi dairesinin adı ve kodu (PartyTaxScheme/TaxScheme) zorunlu.');
        } else if (scenario === 'GVTA' && (!repId('GUMRUKKODU') || !pathText(rep, 'PartyName/Name') || !pathText(rep, 'PartyLegalEntity/RegistrationName'))) {
            issues.push('GVTA\'da gümrük müdürlüğü kodu ve adı (schemeID GUMRUKKODU, PartyName) ile gümrük saymanlığı bilgileri (PartyLegalEntity) zorunlu.');
        }
        const refs = pathAll(root, 'AdditionalDocumentReference');
        const receipt = refs.find(r => pathAll(r, 'ID').some(e => e.getAttribute('schemeID') === 'BELGENO') && pathText(r, 'DocumentDescription') === scenario);
        if (!receipt) {
            const legacy = refs.some(r => pathAll(r, 'ID').some(e => e.getAttribute('schemeID') === 'BELGE_NO'));
            issues.push(legacy
                ? `${scenario} alındı numarası schemeID "BELGE_NO" ile yazılmış; kılavuz V1.4 ve resmi XSLT "BELGENO" bekler, numara görünümde çıkmaz.`
                : `${scenario} alındı numarası AdditionalDocumentReference altında ID schemeID="BELGENO", IssueDate ve DocumentDescription "${scenario}" ile yazılmalı.`);
        }
    }
    if (!pathText(root, 'LegalMonetaryTotal/PayableAmount')) issues.push('Ödenecek / işlem tutarı (LegalMonetaryTotal/PayableAmount) zorunlu; karekodda yer alır.');
    const lines = pathAll(root, 'CreditNoteLine');
    if (lines.some(l => !pathText(l, 'Item/Name'))) issues.push('Her kalemde işlem adı (Item/Name) zorunlu.');
    if (lines.some(l => !pathText(l, 'Item/Description') && !pathText(l, 'Price/PriceAmount'))) issues.push('Her kalemde işlem değeri (Item/Description) ya da tutarı (Price/PriceAmount) yazılmalı.');
    return issues;
}

/** e-Sigorta Komisyon Gider Belgesi Teknik Kılavuzu V1.2 ve Karekod Standardı 2.6. */
function sigortaKomisyonRuleChecks(root: Element): string[] {
    const issues = creditNoteHeaderChecks(root, 'Komisyon gider belgesi', true);
    if (!childText(root, 'DocumentCurrencyCode')) issues.push('Para birimi (DocumentCurrencyCode) zorunlu; karekodda "parabirimi" olarak yer alır.');
    const supplierIssue = vknTcknIssue(pathAll(root, 'AccountingSupplierParty/Party')[0], 'Belgeyi düzenleyen sigorta / emeklilik şirketi');
    if (supplierIssue) issues.push(supplierIssue);
    const customerIssue = vknTcknIssue(pathAll(root, 'AccountingCustomerParty/Party')[0], 'Komisyonu alan acente / broker');
    if (customerIssue) issues.push(customerIssue);
    if (!ISO_DATE_RE.test(pathText(root, 'InvoicePeriod/StartDate')) || !ISO_DATE_RE.test(pathText(root, 'InvoicePeriod/EndDate'))) {
        issues.push('Komisyon dönemi başlangıç ve bitiş tarihi (InvoicePeriod/StartDate, EndDate) zorunlu.');
    }
    const lines = pathAll(root, 'CreditNoteLine');
    if (lines.some(l => !pathText(l, 'Item/Name'))) issues.push('Her kalemde sigorta branşı / ürün adı (Item/Name) zorunlu.');
    const charges = lines.flatMap(l => pathAll(l, 'AllowanceCharge'));
    if (charges.some(c => !/^(true|false)$/.test(pathText(c, 'ChargeIndicator')) || !pathText(c, 'Amount'))) {
        issues.push('Komisyon satırlarında ChargeIndicator (true: istihsal, false: iptal) ve tutar (Amount) zorunlu.');
    }
    const sum = (flag: string) => charges.filter(c => pathText(c, 'ChargeIndicator') === flag).reduce((t, c) => t + num0(pathText(c, 'Amount')), 0);
    const total = (tag: string) => pathText(root, `LegalMonetaryTotal/${tag}`);
    if (charges.length) {
        const istihsal = sum('true');
        const iptal = sum('false');
        if (!near01(istihsal, num0(total('AllowanceTotalAmount')))) {
            issues.push(`İstihsal komisyonu toplamı (AllowanceTotalAmount) ${total('AllowanceTotalAmount') || 'boş'}; ChargeIndicator true satırlarının toplamı ${istihsal.toFixed(2)}.`);
        }
        if (!near01(iptal, num0(total('ChargeTotalAmount')))) {
            issues.push(`İptal komisyonu toplamı (ChargeTotalAmount) ${total('ChargeTotalAmount') || 'boş'}; ChargeIndicator false satırlarının toplamı ${iptal.toFixed(2)}.`);
        }
    }
    if (!total('PayableAmount')) issues.push('Ödenecek tutar (LegalMonetaryTotal/PayableAmount) zorunlu.');
    return issues;
}

/** CreditNote ailesinde belge türüne göre kural seti. */
function creditNoteRuleChecks(docTypeId: string, root: Element, profile: string, typeCode: string): string[] {
    switch (docTypeId) {
        case 'gider-pusulasi': return giderPusulasiRuleChecks(root, typeCode);
        case 'doviz': return dovizRuleChecks(root, profile, typeCode);
        case 'dekont': return dekontRuleChecks(root, profile);
        case 'sigorta-komisyon': return sigortaKomisyonRuleChecks(root);
        default: return mustahsilRuleChecks(root);
    }
}

const CREDIT_NOTE_PARTY_LABELS: Record<string, [string, string]> = {
    'gider-pusulasi': ['Düzenleyen (alan)', 'Malı satan / iade eden'],
    doviz: ['Banka / yetkili müessese', 'Müşteri'],
    dekont: ['Banka / ödeme kuruluşu', 'Müşteri'],
    'sigorta-komisyon': ['Sigorta şirketi', 'Acente / broker'],
};

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

const SMM_STOPAJ_CODES = ['0003', '0011'];
const WITHHOLDING_CODE_RE = /^(60[1-9]|61[0-9]|62[0-7]|80[1-9]|81[0-9]|82[0-5])$/;

/**
 * e-SMM zorunlu bilgileri: 509 Sıra No'lu VUK Genel Tebliği IV.4.3, Karekod Standardı
 * Kılavuzu 2.4 (vkntckn, avkntckn, ettn, brüt/net ücret, KDV, tevkifat, stopaj, tahsilat),
 * e-Arşiv Teknik Kılavuzu 3.3.6 (döviz kuru, vergi kodu/oranı).
 */
function smmRuleChecks(root: Element): string[] {
    const issues: string[] = [];
    const id = childText(root, 'ID');
    if (!id) issues.push('Makbuz numarası (ID) zorunlu.');
    else if (!DOC_ID_RE.test(id)) issues.push(`Makbuz no (${id}) 16 karakter olmalı: 3 harf/rakam seri + yıl + 9 haneli sıra.`);
    if (!childText(root, 'IssueDate') || !/^[0-9]{2}:[0-9]{2}/.test(childText(root, 'IssueTime'))) {
        issues.push('Düzenlenme tarihi ile saat ve dakika olarak düzenlenme zamanı (IssueDate, IssueTime) zorunlu.');
    }
    if (!childText(root, 'UUID')) issues.push('ETTN (UUID) zorunlu; karekodda yer alır.');

    const partyInfo = (tag: string, label: string, qrKey: string) => {
        const party = pathAll(root, `${tag}/Party`)[0];
        if (!party) {
            issues.push(`${label} bilgisi (${tag}) yok.`);
            return null;
        }
        const idEl = pathAll(party, 'PartyIdentification/ID').find(e => ['VKN', 'TCKN'].includes((e.getAttribute('schemeID') || '').toUpperCase()));
        const scheme = (idEl?.getAttribute('schemeID') || '').toUpperCase();
        const value = idEl?.textContent?.trim() ?? '';
        if (!value) issues.push(`${label} için schemeID'si VKN veya TCKN olan kimlik numarası zorunlu (karekod "${qrKey}").`);
        else if (!(scheme === 'VKN' ? /^[0-9]{10}$/ : /^[0-9]{11}$/).test(value)) issues.push(`${label} ${scheme} değeri (${value}) ${scheme === 'VKN' ? 10 : 11} haneli olmalı.`);
        if (!pathText(party, 'PartyName/Name') && !pathText(party, 'Person/FamilyName')) issues.push(`${label} adı soyadı veya unvanı zorunlu.`);
        if (!pathText(party, 'PostalAddress/StreetName') && !pathText(party, 'PostalAddress/CityName')) issues.push(`${label} adresi zorunlu.`);
        return { scheme, value, office: pathText(party, 'PartyTaxScheme/TaxScheme/Name') };
    };
    const supplier = partyInfo('AccountingSupplierParty', 'Serbest meslek erbabı', 'vkntckn');
    if (supplier && !supplier.office) issues.push('Serbest meslek erbabının vergi dairesi zorunlu.');
    const customer = partyInfo('AccountingCustomerParty', 'Müşteri', 'avkntckn');
    if (customer?.scheme === 'VKN' && customer.value !== '2222222222' && !customer.office) {
        issues.push('Müşteri vergi mükellefi (VKN) ise vergi dairesi zorunlu.');
    }

    const currency = childText(root, 'DocumentCurrencyCode').toUpperCase();
    if (currency && currency !== 'TRY' && !(Number(pathText(root, 'PricingExchangeRate/CalculationRate')) > 0)) {
        issues.push(`Para birimi ${currency}; döviz cinsinden e-SMM'de döviz kuru (PricingExchangeRate/CalculationRate) zorunlu.`);
    }

    const code = (s: Element) => pathText(s, 'TaxCategory/TaxScheme/TaxTypeCode');
    const num = (el: Element, path: string) => Number(pathText(el, path)) || 0;
    const sum = (rows: Element[]) => rows.reduce((t, s) => t + num(s, 'TaxAmount'), 0);
    const near = (a: number, b: number) => Math.abs(a - b) <= 0.05;
    const fmt = (n: number) => n.toFixed(2);
    const subs = pathAll(root, 'TaxTotal/TaxSubtotal');
    const whts = pathAll(root, 'WithholdingTaxTotal/TaxSubtotal');
    const kdvRows = subs.filter(s => code(s) === '0015');
    const stopajRows = [...subs, ...whts].filter(s => SMM_STOPAJ_CODES.includes(code(s)));
    const tevkifatRows = [...whts.filter(s => !SMM_STOPAJ_CODES.includes(code(s))), ...subs.filter(s => code(s) === '9015')];
    const otherRows = subs.filter(s => !['0015', '9015', ...SMM_STOPAJ_CODES].includes(code(s)));

    if (!kdvRows.length) issues.push('KDV (vergi kodu 0015) bilgisi yok; KDV tutarı ayrıntılı gösterilmeli, KDV yoksa 0 tutar ve istisna sebebiyle yazılmalı.');
    if (kdvRows.some(s => num(s, 'TaxAmount') === 0 && !pathText(s, 'TaxCategory/TaxExemptionReason') && !pathText(s, 'TaxCategory/TaxExemptionReasonCode'))) {
        issues.push('KDV tutarı 0 ise istisna / muafiyet sebebi (TaxExemptionReasonCode, TaxExemptionReason) yazılmalı.');
    }
    for (const s of [...kdvRows, ...stopajRows]) {
        const pct = pathText(s, 'Percent');
        if (!pct || !pathText(s, 'TaxableAmount')) {
            issues.push(`${SMM_STOPAJ_CODES.includes(code(s)) ? 'Stopaj' : 'KDV'} satırında matrah ve oran (TaxableAmount, Percent) zorunlu.`);
            continue;
        }
        const expected = num(s, 'TaxableAmount') * Number(pct) / 100;
        if (!near(expected, num(s, 'TaxAmount'))) {
            issues.push(`${SMM_STOPAJ_CODES.includes(code(s)) ? 'Stopaj' : 'KDV'} tutarı ${fmt(num(s, 'TaxAmount'))}, matrah × %${pct} = ${fmt(expected)} ile uyuşmuyor.`);
        }
    }
    for (const s of whts.filter(x => !SMM_STOPAJ_CODES.includes(code(x)))) {
        if (!WITHHOLDING_CODE_RE.test(code(s))) issues.push(`KDV tevkifat kodu "${code(s) || 'boş'}" GİB tevkifat kodları listesinde yok (601-627, 801-825).`);
        const pct = Number(pathText(s, 'Percent'));
        if (pathText(s, 'TaxableAmount') && pct && !near(num(s, 'TaxableAmount') * pct / 100, num(s, 'TaxAmount'))) {
            issues.push(`KDV tevkifat tutarı ${fmt(num(s, 'TaxAmount'))}, tevkifat matrahı (KDV) × %${pct} ile uyuşmuyor.`);
        }
    }
    const kdv = sum(kdvRows);
    const stopaj = sum(stopajRows);
    const tevkifat = sum(tevkifatRows);
    if (tevkifat > kdv + 0.05) issues.push(`KDV tevkifatı (${fmt(tevkifat)}) hesaplanan KDV'den (${fmt(kdv)}) büyük olamaz.`);
    if (stopaj > 0 && customer?.scheme === 'TCKN' && !customer.office) {
        issues.push('Stopaj yapılmış ama müşteri vergi dairesi olmadan TCKN ile yazılmış; stopaj yalnızca vergi kesintisi yapmakla sorumlu (mükellef) müşteride yapılır, müşteri mükellefse vergi dairesini ekleyin.');
    }

    const total = (tag: string) => pathText(root, `LegalMonetaryTotal/${tag}`);
    const brut = Number(total('TaxExclusiveAmount') || total('LineExtensionAmount')) || 0;
    if (!total('PayableAmount')) {
        issues.push('Tahsil edilecek tutar (LegalMonetaryTotal/PayableAmount) zorunlu; karekodda "tahsilat" olarak yer alır.');
    } else {
        const expected = brut - stopaj + kdv - tevkifat + sum(otherRows) + (Number(total('PayableRoundingAmount')) || 0);
        if (!near(Number(total('PayableAmount')), expected)) {
            issues.push(`Tahsil edilen tutar ${total('PayableAmount')}; brüt ücret ${fmt(brut)} − stopaj ${fmt(stopaj)} + KDV ${fmt(kdv)} − KDV tevkifatı ${fmt(tevkifat)} = ${fmt(expected)} olmalı.`);
        }
    }
    return issues;
}

// ---------------------------------------------------------------------------
// e-Bilet: ebilet.xsd, ebiletSchematron.sch / ebiletCodelist.sch (e-Bilet Paketi 2023),
// e-Bilet Raporu ve e-Yolcu Listesi teknik kılavuzları, 509 s. VUK GT IV.7.
// ---------------------------------------------------------------------------
const EBILET_CURRENCIES = new Set(('AED,AFN,ALL,AMD,ANG,AOA,ARS,AUD,AWG,AZN,BAM,BBD,BDT,BGN,BHD,BIF,BMD,BND,BOB,BOV,BRL,BSD,BTN,BWP,BYN,BYR,BZD,'
    + 'CAD,CDF,CHE,CHF,CHW,CLF,CLP,CNY,COP,COU,CRC,CUC,CUP,CVE,CZK,DJF,DKK,DOP,DZD,EEK,EGP,ERN,ETB,EUR,FJD,FKP,GBP,GEL,GHS,GIP,GMD,GNF,'
    + 'GTQ,GWP,GYD,HKD,HNL,HRK,HTG,HUF,IDR,ILS,INR,IQD,IRR,ISK,JMD,JOD,JPY,KES,KGS,KHR,KMF,KPW,KRW,KWD,KYD,KZT,LAK,LBP,LKR,LRD,LSL,LTL,'
    + 'LVL,LYD,MAD,MDL,MGA,MKD,MMK,MNT,MOP,MRO,MUR,MVR,MWK,MXN,MXV,MYR,MZN,NAD,NGN,NIO,NOK,NPR,NZD,OMR,PAB,PEN,PGK,PHP,PKR,PLN,PYG,QAR,'
    + 'RON,RSD,RUB,RWF,SAR,SBD,SCR,SDG,SEK,SGD,SHP,SLL,SOS,SSP,SRD,STD,SVC,SYP,SZL,THB,TJS,TMT,TND,TOP,TRY,TTD,TWD,TZS,UAH,UGX,USD,USN,'
    + 'USS,UYI,UYU,UZS,VEF,VND,VUV,WST,XAF,XAG,XAU,XBA,XBB,XBC,XBD,XCD,XDR,XFU,XOF,XPD,XPF,XPT,XSU,XTS,XUA,XXX,YER,ZAR,ZMK,ZMW,ZWL').split(','));
const EBILET_PAYMENTS = ['BANKAKARTI', 'BEDELSIZ', 'COKLU', 'KREDIKARTI', 'PUAN', 'MAHSUP', 'MAHSUPPUAN', 'MIL', 'NAKIT', 'PASS', 'PROMOSYON', 'ULASIMKARTI', 'DIGER'];
const EBILET_SERVICES = ['SEYAHAT', 'BAGAJ', 'IPTALDEGISIKLIKTAZMINATI', 'CEZA', 'YEMEK', 'KOLTUKSECIMI', 'DIGER'];
const EBILET_ID_RE = /^[A-Za-z0-9]{13}([A-Za-z0-9]{3})?$/;
const EBILET_ID16_RE = /^[A-Za-z0-9]{3}20[0-9]{11}$/;
const EBILET_AMOUNT_RE = /^-?[0-9]{1,16}(\.[0-9]{1,2})?$/;
const EBILET_GUID_RE = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;
const ISO_DATE_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
/** Kılavuz: açık bilette sefer / etkinlik zamanı bu sabit değerle yazılır. */
const EBILET_OPEN_TIME = '1111-11-11T11:11:11';
const XADES_A_PROPS = ['ArchiveTimeStamp', 'CertificateValues', 'RevocationValues', 'SignatureTimeStamp', 'SigAndRefsTimeStamp', 'CompleteCertificateRefs', 'CompleteRevocationRefs'];

const descendants = (el: Element, localName: string) => Array.from(el.getElementsByTagName('*')).filter(e => e.localName === localName);

/** Uyarılarda en fazla birkaç bilet numarası listelenir. */
function listed(items: string[]): string {
    const head = items.slice(0, 3).join(', ');
    return items.length > 3 ? `${head} ve ${items.length - 3} diğer` : head;
}

function ebiletHeaderChecks(root: Element): string[] {
    const issues: string[] = [];
    const baslik = pathAll(root, 'baslik')[0];
    if (!baslik) return ['Başlık (baslik) zorunlu: gönderen VKN/TCKN, dönem tarihleri, versiyon, uuid ve imza.'];
    const vkn = pathText(baslik, 'gonderen/vkn');
    const tckn = pathText(baslik, 'gonderen/tckn');
    if (!vkn && !tckn) issues.push('Gönderen VKN veya TCKN (baslik/gonderen) zorunlu.');
    else if (vkn ? !/^[0-9]{10}$/.test(vkn) : !/^[0-9]{11}$/.test(tckn)) issues.push(`Gönderen ${vkn ? `VKN (${vkn}) 10` : `TCKN (${tckn}) 11`} haneli olmalı.`);
    const start = pathText(baslik, 'baslangicTarihi');
    const end = pathText(baslik, 'bitisTarihi');
    const today = new Date().toISOString().slice(0, 10);
    if (!ISO_DATE_RE.test(start) || !ISO_DATE_RE.test(end)) {
        issues.push('Rapor dönemi başlangıç ve bitiş tarihi (baslangicTarihi, bitisTarihi; YYYY-AA-GG) zorunlu.');
    } else {
        if (end < start) issues.push('Dönem bitiş tarihi başlangıç tarihinden küçük olamaz.');
        if (start.slice(0, 7) !== end.slice(0, 7)) issues.push('Başlangıç ve bitiş tarihi aynı döneme (aya) ait olmalı; paket adı VKN-YYYYAA-EB-000000.zip biçimindedir.');
        if (start > today || end > today) issues.push('Dönem başlangıç / bitiş tarihi bugünden ileri bir tarih olamaz.');
    }
    const version = pathText(baslik, 'versiyon');
    if (version !== '1.0') issues.push(`Versiyon "1.0" olmalı (bulunan: ${version || 'boş'}).`);
    if (!EBILET_GUID_RE.test(pathText(baslik, 'uuid'))) issues.push('UUID GUID biçiminde olmalı (8-4-4-4-12 onaltılık karakter).');
    if (!pathAll(baslik, 'Signature').length) issues.push('Mali mühür / NES imzası (baslik/ds:Signature) zorunlu; rapor zaman damgalı XAdES ile imzalanır.');
    return issues;
}

function ebiletReportRuleChecks(root: Element): string[] {
    const issues = ebiletHeaderChecks(root);
    const bilets = pathAll(root, 'bilet');
    const iptals = pathAll(root, 'biletIptal');
    if (!bilets.length && !iptals.length) issues.push('Raporda bilet veya iptal (biletIptal) kaydı yok.');
    const start = pathText(root, 'baslik/baslangicTarihi');
    const end = pathText(root, 'baslik/bitisTarihi');

    const bad = new Map<string, string[]>();
    const flag = (msg: string, no: string) => bad.set(msg, [...(bad.get(msg) ?? []), no || '(numarasız)']);
    const seen = new Set<string>();
    for (const b of bilets) {
        const no = pathText(b, 'biletNo');
        const type = pathText(b, 'belgeTip');
        if (!EBILET_ID_RE.test(no)) flag('Bilet numarası 13 (havayolu, IATA kodlu) veya 16 karakter (3 karakter birim kodu + yıl + 9 haneli sıra) olmalı', no);
        else if (no.length === 16 && !EBILET_ID16_RE.test(no)) flag('16 karakterli bilet numarası ^[A-Za-z0-9]{3}20[0-9]{11}$ biçiminde olmalı (birim kodu + 20YY + sıra no)', no);
        if (no.length === 13 && !type) flag('13 karakterli (havayolu) bilet numarasında belge tipi (belgeTip: SATIS / IADE) zorunlu', no);
        if (type && type !== 'SATIS' && type !== 'IADE') flag('Belge tipi yalnızca SATIS veya IADE olabilir', no);
        if (no.length === 16 && !pathText(b, 'seferZamani') && !pathText(b, 'etkinlikZamani')) flag('16 karakterli bilet numarasında sefer zamanı veya etkinlik zamanı zorunlu (açık bilette 1111-11-11T11:11:11)', no);
        const key = `${type}|${no}`;
        if (no && seen.has(key)) flag(`Aynı bilet numarası aynı belge tipinde (${type || 'tipsiz'}) birden fazla kez raporlanamaz`, no);
        seen.add(key);
        if (pathText(b, 'ozetDeger').length !== 64) flag('Özet değer (ozetDeger) 64 karakter (SHA-256 onaltılık) olmalı', no);
        const issued = pathText(b, 'duzenlenmeTarihi');
        if (!ISO_DATE_RE.test(issued)) flag('Düzenlenme tarihi (duzenlenmeTarihi, YYYY-AA-GG) zorunlu', no);
        else if (ISO_DATE_RE.test(start) && ISO_DATE_RE.test(end) && (issued < start || issued > end)) flag('Düzenlenme tarihi rapor dönemi dışında; rapor yalnızca o döneme ait biletleri içerir', no);
        const payment = pathText(b, 'odemeSekli');
        if (!EBILET_PAYMENTS.includes(payment)) flag(`Ödeme şekli (odemeSekli) kod listesinde olmalı: ${EBILET_PAYMENTS.join(', ')}`, no);
        const amount = pathAll(b, 'tutar')[0];
        if (!amount || !EBILET_AMOUNT_RE.test(amount.textContent?.trim() ?? '')) flag('Tutar zorunlu; en fazla 2 ondalıklı sayı olmalı', no);
        const currency = amount?.getAttribute('paraBirim');
        if (currency) {
            if (!amount?.getAttribute('kur')) flag('Para birimi (paraBirim) yazılmışsa döviz kuru (kur) boş olamaz', no);
            if (!EBILET_CURRENCIES.has(currency)) flag(`Para birimi ISO 4217 kod listesinde olmalı (bulunan: ${currency})`, no);
        }
        if (!EBILET_AMOUNT_RE.test(pathText(b, 'kdv'))) flag('KDV tutarı (kdv) zorunlu; KDV yoksa 0 yazılır', no);
        for (const v of pathAll(b, 'digerVergiler/vergi')) {
            if (pathText(v, 'vergiKodu').length !== 4) flag('Diğer vergilerde vergi kodu 4 karakter olmalı (ör. eğlence vergisi 9142)', no);
            if (!EBILET_AMOUNT_RE.test(pathText(v, 'tutar'))) flag('Diğer vergilerde vergi tutarı zorunlu', no);
        }
        const yer = pathAll(b, 'yer')[0];
        if (yer) {
            const il = pathText(yer, 'ilkod');
            if (!/^(0[1-9]|[1-7][0-9]|8[01])$/.test(il)) flag('Etkinlik yeri il kodu (ilkod) 01-81 arasında olmalı', no);
            if (!pathText(yer, 'belediye')) flag('Etkinlik yerinde belediye adı zorunlu', no);
        } else if (pathText(b, 'etkinlikZamani')) {
            flag('Etkinlik biletinde etkinliğin yapıldığı yer (yer: il kodu, belediye) bulunmalı (509 IV.7.3.3.1)', no);
        }
        const org = pathText(b, 'organizator');
        if (org && !/^[0-9]{10,11}$/.test(org)) flag('Organizatör VKN (10) veya TCKN (11) haneli olmalı', no);
        const exp = pathAll(b, 'giderGosteren')[0];
        if (exp && !/^[0-9]{10}$/.test(pathText(exp, 'vkn')) && !/^[0-9]{11}$/.test(pathText(exp, 'tckn'))) flag('Gider gösteren için 10 haneli VKN veya 11 haneli TCKN yazılmalı', no);
        const service = pathAll(b, 'hizmetinNevi')[0];
        if (service) {
            const tur = pathText(service, 'tur');
            if (!EBILET_SERVICES.includes(tur)) flag(`Hizmetin nevi (tur) kod listesinde olmalı: ${EBILET_SERVICES.join(', ')}`, no);
            if (tur === 'DIGER' && !pathText(service, 'aciklama')) flag('Hizmetin nevi DIGER ise açıklama boş olamaz', no);
        }
        if (no.length === 13 && type === 'IADE' && !pathAll(b, 'referanslar/referans').length) flag('Havayolu iade biletinde asıl bilete referans (referanslar/referans) girilmeli', no);
        const url = pathText(b, 'ebiletUrl');
        if (!url) flag(pathAll(b, 'biletUrl').length
            ? 'Bilet URL\'si ebilet.xsd\'de ebiletUrl adıyla yazılmalı (kılavuzdaki biletUrl adı şemada yok)'
            : 'e-Biletin PDF dosyasına ulaşılabilecek URL (ebiletUrl) yok; kılavuz 2.3 (02/2023) ile zorunlu', no);
        else if (url.length > 255) flag('Bilet URL\'si en fazla 255 karakter olabilir', no);
    }
    for (const [msg, nos] of bad) issues.push(`${msg} — ${listed(nos)}.`);

    const iptalSeen = new Set<string>();
    for (const c of iptals) {
        const no = pathText(c, 'biletNo');
        if (!EBILET_ID_RE.test(no) || (no.length === 16 && !EBILET_ID16_RE.test(no))) issues.push(`İptal edilen bilet numarası (${no || 'boş'}) bilet numarası biçiminde olmalı.`);
        if (iptalSeen.has(no)) issues.push(`İptal kaydında bilet numarası tekil olmalı: ${no} birden fazla kez iptal edilmiş.`);
        iptalSeen.add(no);
        if (!pathText(c, 'iptalZamani')) issues.push(`İptal kaydında iptal zamanı (iptalZamani) zorunlu — ${no}.`);
        if (!EBILET_AMOUNT_RE.test(pathText(c, 'tutar')) || !EBILET_AMOUNT_RE.test(pathText(c, 'kdv'))) issues.push(`İptal kaydında tutar ve KDV zorunlu — ${no}.`);
    }

    if (bilets.some(b => pathText(b, 'biletNo').length === 13)) {
        const missing = XADES_A_PROPS.filter(p => !descendants(root, p).length);
        if (missing.length) issues.push(`Havayolu raporunda imza XAdES-A olmalı; UnsignedSignatureProperties altında eksik: ${missing.join(', ')}.`);
    }
    return issues;
}

function ebiletPassengerListRuleChecks(root: Element): string[] {
    const issues = ebiletHeaderChecks(root);
    const lists = pathAll(root, 'yolcuListesi');
    if (!lists.length) issues.push('En az bir yolcu listesi (yolcuListesi) olmalı.');
    const seen = new Set<string>();
    for (const l of lists) {
        const no = pathText(l, 'yolcuListesiNo');
        const at = no || '(numarasız liste)';
        if (!EBILET_ID_RE.test(no) || (no.length === 16 && !EBILET_ID16_RE.test(no))) issues.push(`Yolcu listesi numarası (${no || 'boş'}) 16 karakter olmalı: birim kodu + yıl + 9 haneli sıra.`);
        if (seen.has(no)) issues.push(`Yolcu listesi numarası tekil olmalı: ${no}.`);
        seen.add(no);
        if (pathText(l, 'ozetDeger').length !== 64) issues.push(`Özet değer (ozetDeger) 64 karakter olmalı — ${at}.`);
        const missing = [['haraketZamani', 'hareket saati'], ['hareketNoktasi', 'hareket noktası'], ['seferNumarasi', 'sefer numarası'], ['seferTarihi', 'sefer tarihi'], ['aracPlakasi', 'taşıt plakası']]
            .filter(([tag]) => !pathText(l, tag)).map(([, label]) => label);
        if (missing.length) issues.push(`Zorunlu sefer bilgisi eksik (509 IV.7.3.1.2): ${missing.join(', ')} — ${at}.`);
        const seats = pathAll(l, 'koltukListesi/koltuk');
        if (!seats.length) issues.push(`Listede koltuk / yolcu kaydı yok — ${at}.`);
        const noIdentity = seats.filter(s => !pathText(s, 'adSoyad') || (!pathText(s, 'tcknYkn') && !pathText(s, 'pasaportNo'))).map(s => pathText(s, 'koltukNo'));
        if (noIdentity.length) issues.push(`Yolcunun adı soyadı ile TCKN'si (uluslararası seferde TCKN veya pasaport no) bulunmalı (509 IV.7.3.1.2-f) — koltuk ${listed(noIdentity)}.`);
        const badTckn = seats.map(s => pathText(s, 'tcknYkn')).filter(t => t && !/^[0-9]{11}$/.test(t));
        if (badTckn.length) issues.push(`Yolcu TCKN / YKN 11 haneli olmalı — ${listed(badTckn)}.`);
        const noTicket = seats.filter(s => !EBILET_ID_RE.test(pathText(s, 'biletNo'))).map(s => pathText(s, 'koltukNo'));
        if (noTicket.length) issues.push(`Her koltukta e-Bilet numarası (biletNo) bulunmalı — koltuk ${listed(noTicket)}.`);
        const total = Number(pathText(l, 'toplamHasilat'));
        const sum = seats.reduce((t, s) => t + (Number(pathText(s, 'tutar')) || 0), 0);
        if (!pathText(l, 'toplamHasilat')) issues.push(`KDV dahil toplam hasılat (toplamHasilat) zorunlu — ${at}.`);
        else if (seats.length && Math.abs(total - sum) > 0.01) issues.push(`Toplam hasılat ${total.toFixed(2)}, koltuk bilet tutarları toplamı ${sum.toFixed(2)} ile uyuşmuyor — ${at}.`);
        const op = pathAll(l, 'aracIsleten')[0];
        if (op) {
            if (!/^[0-9]{10}$/.test(pathText(op, 'vkn')) && !/^[0-9]{11}$/.test(pathText(op, 'tckn'))) issues.push(`Taşıtı işleten için 10 haneli VKN veya 11 haneli TCKN yazılmalı — ${at}.`);
            if (!pathText(op, 'komisyonTutar') || !pathText(op, 'komisyonKDV')) issues.push(`Taşıtı işletene ödenen komisyon tutarı ve KDV'si yazılmalı — ${at}.`);
        }
    }
    return issues;
}

function ebiletXmlChecks(root: Element, family: DocFamily, checks: Check[], info: [string, string][]): void {
    const report = family === 'ebiletReport';
    const bilets = pathAll(root, 'bilet');
    const lists = pathAll(root, 'yolcuListesi');
    const seats = lists.flatMap(l => pathAll(l, 'koltukListesi/koltuk'));
    const kind = !report ? ''
        : bilets.some(b => pathText(b, 'etkinlikZamani')) ? 'Etkinlik'
        : bilets.some(b => pathText(b, 'biletNo').length === 13) ? 'Havayolu' : 'Karayolu / Denizyolu';
    const start = pathText(root, 'baslik/baslangicTarihi');
    const end = pathText(root, 'baslik/bitisTarihi');
    const rows: [string, string][] = [
        ['Gönderen', pathText(root, 'baslik/gonderen/vkn') || pathText(root, 'baslik/gonderen/tckn')],
        ['Dönem', start && end ? `${start} – ${end}` : ''],
        ['UUID', pathText(root, 'baslik/uuid')],
        ...(report ? [
            ['Rapor türü', kind],
            ['Bilet sayısı', String(bilets.length)],
            ['İade sayısı', String(bilets.filter(b => pathText(b, 'belgeTip') === 'IADE').length)],
            ['İptal sayısı', String(pathAll(root, 'biletIptal').length)],
            ['Açık bilet', String(bilets.filter(b => [pathText(b, 'seferZamani'), pathText(b, 'etkinlikZamani')].includes(EBILET_OPEN_TIME)).length)],
        ] as [string, string][] : [
            ['Yolcu listesi sayısı', String(lists.length)],
            ['Sefer', lists.map(l => pathText(l, 'seferNumarasi')).filter(Boolean).join(', ')],
            ['Plaka', lists.map(l => pathText(l, 'aracPlakasi')).filter(Boolean).join(', ')],
            ['Yolcu sayısı', String(seats.length)],
        ] as [string, string][]),
    ];
    info.push(...rows.filter(([, v]) => v));
    const issues = report ? ebiletReportRuleChecks(root) : ebiletPassengerListRuleChecks(root);
    checks.push(...(issues.length
        ? issues.map(text => ({ level: 'warn' as const, text: `GİB kuralı: ${text}` }))
        : [{ level: 'ok' as const, text: report ? 'GİB e-Bilet raporu şema / şematron kontrolleri geçti' : 'GİB e-Yolcu Listesi zorunlu bilgi kontrolleri geçti' }]));
}

/**
 * UBL taşıyıcılı görsel e-Bilet: 509 s. VUK GT IV.7.3.1.1 (kara/deniz), IV.7.3.2.1 (hava),
 * IV.7.3.3.1 (etkinlik) zorunlu bilgileri ve V.4 belge numarası.
 */
function biletInvoiceRuleChecks(root: Element): string[] {
    const issues: string[] = [];
    const id = childText(root, 'ID');
    if (!DOC_ID_RE.test(id) && !/^[A-Za-z0-9]{13}$/.test(id)) {
        issues.push(`e-Bilet numarası (${id || 'boş'}) 16 karakter (3 karakter birim kodu + yıl + 9 haneli sıra) ya da havayolunda IATA kodlu 13 karakter olmalı.`);
    }
    const supplier = pathAll(root, 'AccountingSupplierParty/Party')[0];
    if (!supplier) {
        issues.push('Bileti düzenleyenin bilgileri (AccountingSupplierParty) yok.');
    } else {
        if (!pathText(supplier, 'PartyName/Name') && !pathText(supplier, 'Person/FamilyName')) issues.push('Bileti düzenleyenin adı soyadı / unvanı zorunlu.');
        if (!pathAll(supplier, 'PartyIdentification/ID').some(e => ['VKN', 'TCKN'].includes((e.getAttribute('schemeID') || '').toUpperCase()))) issues.push('Bileti düzenleyenin VKN / TCKN\'si zorunlu.');
        if (!pathText(supplier, 'PartyTaxScheme/TaxScheme/Name')) issues.push('Bileti düzenleyenin bağlı olduğu vergi dairesi zorunlu (kara / deniz ve etkinlik biletleri).');
        if (!pathText(supplier, 'PostalAddress/CityName') && !pathText(supplier, 'PostalAddress/StreetName')) issues.push('Bileti düzenleyenin adresi zorunlu (kara / deniz biletleri).');
    }
    const person = [...pathAll(root, 'BuyerCustomerParty/Party/Person'), ...pathAll(root, 'AccountingCustomerParty/Party/Person')][0];
    if (!person || !pathText(person, 'FirstName') || !pathText(person, 'FamilyName')) {
        issues.push('Yolcunun / izleyicinin adı soyadı (AccountingCustomerParty ya da gider gösteren varsa BuyerCustomerParty altında Person) yazılmalı.');
    }
    if (!childText(root, 'IssueDate')) issues.push('Düzenlenme tarihi (IssueDate) zorunlu.');
    if (!pathText(root, 'InvoicePeriod/StartDate')) issues.push('Seyahat / etkinlik tarihi yok; tasarımcıda InvoicePeriod/StartDate (saat: StartTime) alanında taşınır.');
    if (!pathText(root, 'PaymentMeans/PaymentMeansCode')) issues.push('Ödeme türü (PaymentMeans/PaymentMeansCode) zorunlu; kara / deniz biletinde ödeme tarihi (PaymentDueDate) de yazılır.');
    if (!pathAll(root, 'TaxTotal/TaxSubtotal').some(s => pathText(s, 'TaxCategory/TaxScheme/TaxTypeCode') === '0015')) issues.push('KDV tutarı (TaxTotal, vergi kodu 0015) gösterilmeli.');
    if (!pathText(root, 'LegalMonetaryTotal/PayableAmount')) issues.push('Bilet tutarı (LegalMonetaryTotal/PayableAmount) zorunlu.');
    if (!pathAll(root, 'InvoiceLine/Item/Name').some(e => e.textContent?.trim())) issues.push('Hizmetin nevi (seyahat, bagaj, etkinlik adı vb.) satırda (InvoiceLine/Item/Name) yazılmalı.');
    return issues;
}

function xsltRunCheck(xslt: string, doc: Document): Check {
    const x = parseXml(xslt);
    const err = x.error ? `XSLT okunamadı: ${x.error}` : tryTransform(x.doc, doc);
    return err
        ? { level: 'error', text: `Seçilen XSLT bu veriyle çalıştırılamadı: ${err}` }
        : { level: 'ok', text: 'Seçilen XSLT bu veriyle başarıyla çalıştı' };
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
    const family = familyOfRoot(root);
    const expected = FAMILY_INFO[docType.family];
    if (family !== docType.family) {
        const found = family ? FAMILY_INFO[family].label : `<${root.localName}>`;
        return result([{ level: 'error', text: `Bu XML bir ${found} belgesi; ${docType.label} için ${expected.label} belgesi gerekli.` }], info);
    }
    checks.push({ level: 'ok', text: `Belge yapısı uygun: ${expected.label}` });
    if (family === 'ebiletReport' || family === 'ebiletPassengerList') {
        ebiletXmlChecks(root, family, checks, info);
        if (xslt) checks.push(xsltRunCheck(xslt, doc));
        return result(checks, info);
    }

    const profile = childText(root, 'ProfileID');
    const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (docType.profileIds && profile && !docType.profileIds.some(p => norm(profile).includes(norm(p)))) {
        checks.push({ level: 'warn', text: `Belgenin profili ${profile}; ${docType.label} için beklenen: ${docType.profileIds.join(' / ')}.` });
    }

    const despatchLike = docType.family === 'despatch' || docType.family === 'receiptAdvice';
    const creditNote = docType.family === 'creditNote';
    const lineTag = docType.family === 'despatch' ? 'DespatchLine' : docType.family === 'receipt' || docType.family === 'receiptAdvice' ? 'ReceiptLine' : creditNote ? 'CreditNoteLine' : 'InvoiceLine';
    const lines = Array.from(root.children).filter(c => c.localName === lineTag).length;
    const typeCode = childText(root, 'InvoiceTypeCode') || childText(root, 'DespatchAdviceTypeCode') || childText(root, 'ReceiptAdviceTypeCode') || childText(root, 'CreditNoteTypeCode');
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
        [creditNote ? CREDIT_NOTE_PARTY_LABELS[docType.id]?.[0] ?? 'Düzenleyen (alıcı)' : 'Gönderen', supplier],
        [creditNote ? CREDIT_NOTE_PARTY_LABELS[docType.id]?.[1] ?? 'Üretici / çiftçi' : 'Alıcı', customer],
        ['Satır sayısı', String(lines)],
    ];
    if (docType.family === 'receiptAdvice') {
        rows.push(['Yanıtlanan irsaliye', pathText(root, 'DespatchDocumentReference/ID')], ['Yanıt durumu', receiptAdviceStatus(root)]);
    }
    if (creditNote) {
        if (!CREDIT_NOTE_PARTY_LABELS[docType.id]) rows.push(['Toplam kesinti', pathText(root, 'TaxTotal/TaxAmount')]);
        rows.push(['Ödenecek tutar', pathText(root, 'LegalMonetaryTotal/PayableAmount')]);
    }
    info.push(...rows.filter(([, v]) => v));
    if (!lines) checks.push({ level: 'warn', text: 'Belgede kalem (satır) bulunamadı; satır tablosu boş görünür.' });

    const ublInvoice = docType.family === 'invoice' && (docType.profileIds ?? []).some(p => p === 'EARSIVFATURA' || EFATURA_PROFILE_IDS.includes(p));
    const gibIssues = docType.family === 'despatch' ? despatchRuleChecks(root, profile, typeCode)
        : docType.family === 'receiptAdvice' ? receiptAdviceRuleChecks(root)
        : creditNote ? creditNoteRuleChecks(docType.id, root, profile, typeCode)
        : ublInvoice ? invoiceRuleChecks(root, profile, typeCode) : [];
    if (gibIssues.length) {
        checks.push(...gibIssues.map(text => ({ level: 'warn' as const, text: `GİB kuralı: ${text}` })));
    } else if (despatchLike || ublInvoice || creditNote) {
        checks.push({ level: 'ok', text: despatchLike ? 'GİB e-İrsaliye zorunlu alan kontrolleri geçti' : creditNote ? `GİB ${docType.label} zorunlu bilgi kontrolleri geçti` : 'GİB fatura kural kontrolleri geçti' });
    }
    if (docType.id === 'smm') {
        const smmIssues = smmRuleChecks(root);
        checks.push(...(smmIssues.length
            ? smmIssues.map(text => ({ level: 'warn' as const, text: `GİB kuralı: ${text}` }))
            : [{ level: 'ok' as const, text: 'GİB e-SMM zorunlu bilgi kontrolleri geçti' }]));
    }
    if (docType.id === 'bilet') {
        const biletIssues = biletInvoiceRuleChecks(root);
        checks.push(...(biletIssues.length
            ? biletIssues.map(text => ({ level: 'warn' as const, text: `GİB kuralı: ${text}` }))
            : [{ level: 'ok' as const, text: 'GİB e-Bilet zorunlu bilgi kontrolleri geçti (509 IV.7.3)' }]));
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
