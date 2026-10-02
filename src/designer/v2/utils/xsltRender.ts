/**
 * Designer 2.0 — Browser-side XSLT Render (Phase 17.3.1)
 *
 * XSLT + XML → HTML string dönüşümü.
 * Tarayıcının native XSLTProcessor'ını kullanır (XSLT 1.0).
 *
 * Avantajlar:
 * - CORS yok (XSLT/XML inline)
 * - Anlık (~10-50ms)
 * - Herhangi bir backend bağımlılığı yok
 *
 * Sınırlar:
 * - XSLT 1.0 (modern tarayıcılar XSLT 3.0 desteklemez)
 * - EXSLT extension'ları yok (sadece standart XSLT 1.0)
 * - <xsl:import> / <xsl:include> sandbox nedeniyle çalışmayabilir
 */

export interface XsltRenderResult {
    html: string;
    error: string | null;
    durationMs: number;
}

/**
 * Browser-side XSLT transform.
 * @param xsltString - XSLT 1.0 source
 * @param xmlString - UBL-TR XML source
 * @returns HTML string (yeni <html> document) + error info
 */
export function renderXslt(xsltString: string, xmlString: string): XsltRenderResult {
    const start = performance.now();

    // Sprint 4 ACİL — UTF-8 BOM strip (text/xml + application/xml güvenli olsa da,
    // XSLT dosyaları BOM ile başlıyor → DOMParser ilk karakteri BOM olarak alıyor)
    let xslt = xsltString;
    if (xslt.charCodeAt(0) === 0xFEFF) {
        xslt = xslt.slice(1);
    }
    let xml = xmlString;
    if (xml.charCodeAt(0) === 0xFEFF) {
        xml = xml.slice(1);
    }

    if (!xslt.trim() || !xml.trim()) {
        return { html: '', error: 'XSLT veya XML boş', durationMs: 0 };
    }

    try {
        // 1. Parse XSLT (Sprint 4 Acil fix: application/xml daha güvenilir encoding handling)
        const xsltParser = new DOMParser();
        const xsltDoc = xsltParser.parseFromString(xslt, 'application/xml');
        const xsltError = xsltDoc.querySelector('parsererror');
        if (xsltError) {
            return {
                html: '',
                error: `XSLT parse hatası: ${xsltError.textContent?.trim().slice(0, 200) || 'bilinmiyor'}`,
                durationMs: performance.now() - start,
            };
        }

        // 2. Parse XML
        const xmlParser = new DOMParser();
        const xmlDoc = xmlParser.parseFromString(xml, 'application/xml');
        const xmlError = xmlDoc.querySelector('parsererror');
        if (xmlError) {
            return {
                html: '',
                error: `XML parse hatası: ${xmlError.textContent?.trim().slice(0, 200) || 'bilinmiyor'}`,
                durationMs: performance.now() - start,
            };
        }

        // 3. XSLT transform
        // @ts-ignore — XSLTProcessor tüm modern tarayıcılarda var
        const processor = new XSLTProcessor();
        processor.importStylesheet(xsltDoc);
        const resultDoc = processor.transformToDocument(xmlDoc);

        // 4. Phase A.1 — render DOM annotation: her element'e data-render-index enjekte et.
        //    Designer 2.0 click/blur handler'ı bu index ile sections[] element'ine eşler.
        annotateRenderDom(resultDoc);

        // 5. Serialize
        const serializer = new XMLSerializer();
        let html = serializer.serializeToString(resultDoc);

        if (!html.includes('<html') && !html.includes('<HTML')) {
            html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
        } else if (!/charset/i.test(html)) {
            // html var ama charset yoksa head'e ekle
            html = html.replace(/<head([^>]*)>/i, `<head$1><meta charset="utf-8">`);
        }

        return { html, error: null, durationMs: performance.now() - start };
    } catch (err) {
        return {
            html: '',
            error: `Render hatası: ${(err as Error).message}`,
            durationMs: performance.now() - start,
        };
    }
}

/**
 * Phase A.1 — DOM annotation.
 * resultDoc içindeki her Element'e sıralı data-render-index attribute ekler.
 * Bu index, xsltToSections tarafından üretilen element listesindeki sırayla eşleşir
 * (her ikisi de pre-order DFS ile gezilir).
 *
 * Not: Sadece html/body altındaki literal result element'ler (div, span, p, td, th, h1-h6, table, tr)
 * index'lenir. <style>, <head>, <meta> atlanır.
 */
const INDEXED_TAGS = new Set([
    'div', 'span', 'p', 'table', 'tr', 'td', 'th',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'a',
]);

function annotateRenderDom(doc: Document): void {
    const body = doc.body || doc.documentElement;
    if (!body) return;
    let counter = 0;
    const walk = (node: Node) => {
        if (node.nodeType !== 1) return; // sadece Element
        const el = node as Element;
        const tag = el.tagName.toLowerCase();
        if (INDEXED_TAGS.has(tag)) {
            el.setAttribute('data-render-index', String(counter));
            counter++;
        }
        // Children
        for (const child of Array.from(el.childNodes)) {
            walk(child);
        }
    };
    walk(body);
}

/**
 * Sample XML — fallback olarak DesignerApp açılışında default render.
 * Real UBL-TR e-Fatura örneği (kısa versiyon).
 */
export const SAMPLE_FATURA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:ID>FTR-2026-00001</cbc:ID>
  <cbc:IssueDate>2026-09-28</cbc:IssueDate>
  <cbc:IssueTime>10:00:00</cbc:IssueTime>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>ÖRNEK TEDARİKÇİ A.Ş.</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Atatürk Cad. No:1</cbc:StreetName>
        <cbc:CityName>İstanbul</cbc:CityName>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>ÖRNEK MÜŞTERİ LTD.</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Cumhuriyet Cad. No:5</cbc:StreetName>
        <cbc:CityName>Ankara</cbc:CityName>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal><cbc:TaxAmount currencyID="TRY">180.00</cbc:TaxAmount></cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="TRY">1000.00</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="TRY">1000.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="TRY">1180.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="TRY">1180.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">10</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">500.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Name>Örnek Ürün A</cbc:Name></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">50.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
  <cac:InvoiceLine>
    <cbc:ID>2</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">10</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">500.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Name>Örnek Ürün B</cbc:Name></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">50.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`;