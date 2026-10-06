import { FAMILY_INFO, type DocFamily, type WizardDocType } from './docTypes';

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

    const lineTag = docType.family === 'despatch' ? 'DespatchLine' : docType.family === 'receipt' ? 'ReceiptLine' : 'InvoiceLine';
    const lines = Array.from(root.children).filter(c => c.localName === lineTag).length;
    const typeCode = childText(root, 'InvoiceTypeCode') || childText(root, 'DespatchAdviceTypeCode');
    const supplier = partyName(root, docType.family === 'despatch' ? 'DespatchSupplierParty' : 'AccountingSupplierParty');
    const customer = partyName(root, docType.family === 'despatch' ? 'DeliveryCustomerParty' : 'AccountingCustomerParty');
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
    info.push(...rows.filter(([, v]) => v));
    if (!lines) checks.push({ level: 'warn', text: 'Belgede kalem (satır) bulunamadı; satır tablosu boş görünür.' });

    if (xslt) {
        const x = parseXml(xslt);
        const err = x.error ? `XSLT okunamadı: ${x.error}` : tryTransform(x.doc, doc);
        checks.push(err
            ? { level: 'error', text: `Seçilen XSLT bu veriyle çalıştırılamadı: ${err}` }
            : { level: 'ok', text: 'Seçilen XSLT bu veriyle başarıyla çalıştı' });
    }
    return result(checks, info);
}
