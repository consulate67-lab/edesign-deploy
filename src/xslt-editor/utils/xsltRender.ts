/**
 * xsltRender — Sprint 10 Aşama 1 (2026-10-03)
 *
 * Browser-side XSLT transform + annotation.
 * transformXmlWithXslt'ten farkı: her INDEXED element'e
 * data-render-index + data-xpath attribute ekler. Bu attribute'lar
 * preview click → editör scroll/highlight senkronizasyonu için kullanılır.
 *
 * xpathList sırası annotateRenderDom (Sprint 7) ile senkronize:
 * renderIndex[i] = xpathList[i]
 *
 * Bu dosya sadece XsltEditor'da kullanılır. ProfesyonelDesigner'ın kendi
 * pipeline'ı (instrumentXslt / xsltInstrumenter) farklı, dokunulmuyor.
 */

const INDEXED_TAGS = new Set([
    'div', 'span', 'p', 'table', 'tr', 'td', 'th',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'a',
]);

export interface XsltRenderResult {
    html: string;
    error: string | null;
    durationMs: number;
}

/**
 * XSLT + XML → annotated HTML transform.
 * @param xmlString - UBL-TR XML source
 * @param xsltString - XSLT 1.0 source
 * @param xpathList - xsl:value-of xpath listesi (parseXsltXPaths'ten), DFS pre-order
 */
export function renderAndAnnotateXslt(
    xmlString: string,
    xsltString: string,
    xpathList: string[]
): XsltRenderResult {
    const start = performance.now();

    // UTF-8 BOM strip
    let xslt = xsltString;
    if (xslt.charCodeAt(0) === 0xFEFF) xslt = xslt.slice(1);
    let xml = xmlString;
    if (xml.charCodeAt(0) === 0xFEFF) xml = xml.slice(1);

    if (!xslt.trim() || !xml.trim()) {
        return { html: '', error: 'XSLT veya XML boş', durationMs: 0 };
    }

    try {
        const parser = new DOMParser();
        const xsltDoc = parser.parseFromString(xslt, 'application/xml');
        const xmlDoc = parser.parseFromString(xml, 'application/xml');

        const xsltError = xsltDoc.querySelector('parsererror');
        if (xsltError) {
            return {
                html: '',
                error: `XSLT parse hatası: ${xsltError.textContent?.trim().slice(0, 200) || 'bilinmiyor'}`,
                durationMs: performance.now() - start,
            };
        }
        const xmlError = xmlDoc.querySelector('parsererror');
        if (xmlError) {
            return {
                html: '',
                error: `XML parse hatası: ${xmlError.textContent?.trim().slice(0, 200) || 'bilinmiyor'}`,
                durationMs: performance.now() - start,
            };
        }

        // @ts-ignore — XSLTProcessor tüm modern tarayıcılarda var
        const processor = new XSLTProcessor();
        processor.importStylesheet(xsltDoc);
        const resultDoc = processor.transformToDocument(xmlDoc);

        // Annotation — Sprint 10 Aşama 2 click sync fix:
        // Önceki yaklaşım (render DOM DFS + INDEXED_TAGS walk) annotation
        // sırası ile XSLT xpath sırasını eşleştiremiyordu → editör yanlış
        // yere gidiyordu. Yeni yaklaşım: text node DFS pre-order.
        //
        // Neden text node? Çünkü xsl:value-of'un render çıktısı text node
        // olarak DOM'a düşer (çoğu durumda). Text node sayısı ≈ xsl:value-of
        // sayısı → counter sırası = xpathList sırası ile eşleşir.
        //
        // Her dolu text node için counter++, xpathList[counter] parent
        // element'ine data-render-index + data-xpath attribute olarak eklenir.
        // Aynı parent'a birden fazla text node varsa sadece ilki annotation alır
        // (diğerleri skip) → her element tek bir xpath ile bind olur.
        const body = resultDoc.body || resultDoc.documentElement;
        if (body) {
            let counter = 0;
            const walk = (node: Node) => {
                if (node.nodeType === 3) { // TEXT_NODE
                    const text = (node.textContent || '').trim();
                    if (text.length > 0 && counter < xpathList.length) {
                        const parent = (node as Text).parentElement;
                        if (parent && !parent.hasAttribute('data-render-index')) {
                            parent.setAttribute('data-render-index', String(counter));
                            parent.setAttribute('data-xpath', xpathList[counter]);
                        }
                        counter++;
                    }
                    return;
                }
                if (node.nodeType !== 1) return;
                for (const child of Array.from(node.childNodes)) walk(child);
            };
            walk(body);
            console.log(`[xsltRender] annotated ${counter} text nodes (xpathList length: ${xpathList.length})`);
        }

        const serializer = new XMLSerializer();
        let html = serializer.serializeToString(resultDoc);

        if (!html.includes('<html') && !html.includes('<HTML')) {
            html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
        } else if (!/charset/i.test(html)) {
            html = html.replace(/<head([^>]*)>/i, `<head$1><meta charset="utf-8">`);
        }

        return { html, error: null, durationMs: performance.now() - start };
    } catch (err) {
        return {
            html: '',
            error: `Render hatası: ${(err as Error).message || 'bilinmeyen'}`,
            durationMs: performance.now() - start,
        };
    }
}

/**
 * XSLT içindeki xsl:value-of / xsl:copy-of element'lerinin xpath'lerini
 * DFS pre-order ile topla. annotation sırasıyla senkronize.
 */
export function parseXsltXPathBindings(xslt: string): string[] {
    const xpathList: string[] = [];
    try {
        const parser = new DOMParser();
        const xsltDoc = parser.parseFromString(xslt, 'application/xml');
        const walk = (node: Node) => {
            if (node.nodeType !== 1) return;
            const el = node as Element;
            const tag = el.localName;
            if (tag === 'value-of' || tag === 'copy-of') {
                const select = el.getAttribute('select');
                if (select) xpathList.push(select);
            }
            for (const child of Array.from(el.childNodes)) walk(child);
        };
        walk(xsltDoc.documentElement);
    } catch (err) {
        console.warn('[xsltRender] parseXsltXPathBindings error:', err);
    }
    return xpathList;
}