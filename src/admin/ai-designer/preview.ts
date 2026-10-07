import type { WizardDocType } from '../../wizard/docTypes';
import { transformXmlWithXslt } from '../../xsltTransformer';
import type { DesignParams } from './types';

const CAC = 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2';
const CBC = 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2';

const SUPPLIER_TAG: Record<string, string> = {
    invoice: 'AccountingSupplierParty',
    creditNote: 'AccountingSupplierParty',
    despatch: 'DespatchSupplierParty',
    receiptAdvice: 'DeliveryCustomerParty',
};

const child = (el: Element | undefined, ns: string, name: string) =>
    el ? Array.from(el.children).find(c => c.namespaceURI === ns && c.localName === name) : undefined;

/** Önizleme için örnek XML'deki düzenleyen unvanını firma adıyla değiştirir; XSLT'ye dokunmaz. */
export function customizeSampleXml(xml: string, p: Pick<DesignParams, 'companyName'>, dt: WizardDocType): string {
    const name = p.companyName.trim();
    const tag = SUPPLIER_TAG[dt.family];
    if (!name || !tag) return xml;
    try {
        const doc = new DOMParser().parseFromString(xml.replace(/^\uFEFF/, ''), 'application/xml');
        if (doc.getElementsByTagName('parsererror').length) return xml;
        const party = child(child(doc.documentElement, CAC, tag), CAC, 'Party');
        const nameEl = child(child(party, CAC, 'PartyName'), CBC, 'Name');
        if (!nameEl) return xml;
        nameEl.textContent = name;
        const out = new XMLSerializer().serializeToString(doc);
        return out.startsWith('<?xml') ? out : `<?xml version="1.0" encoding="UTF-8"?>\n${out}`;
    } catch {
        return xml;
    }
}

export const TRANSFORM_ERROR_MARK = 'XSLT Dönüşümü başarısız';

export const isTransformError = (html: string) => html.includes(TRANSFORM_ERROR_MARK);

export function renderHtml(xml: string, xslt: string): string {
    return transformXmlWithXslt(xml, xslt);
}

/** Küçük önizlemelerde kaydırma çubuğu gizlenir. */
export const withCss = (html: string, css: string) => {
    const tag = `<style>${css}</style>`;
    return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + tag) : tag + html;
};
