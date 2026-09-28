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

    if (!xsltString.trim() || !xmlString.trim()) {
        return { html: '', error: 'XSLT veya XML boş', durationMs: 0 };
    }

    try {
        // 1. Parse XSLT
        const xsltParser = new DOMParser();
        const xsltDoc = xsltParser.parseFromString(xsltString, 'text/xml');
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
        const xmlDoc = xmlParser.parseFromString(xmlString, 'text/xml');
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

        // 4. Serialize
        const serializer = new XMLSerializer();
        let html = serializer.serializeToString(resultDoc);

        // XSLT çıktısı <html>...</html> döner; iframe.srcDoc için tam HTML gerekli
        // Eğer <html> tag yoksa saralım
        if (!html.includes('<html') && !html.includes('<HTML')) {
            html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
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