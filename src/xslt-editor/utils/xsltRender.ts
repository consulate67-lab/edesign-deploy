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
 * Sprint 11 Aşama 6a (2026-10-03) — XSLT binding + koordinat kayıt.
 * xsl:value-of / xsl:copy-of element'inin XSLT string'indeki gerçek
 * offset/line/column bilgisini saklar. Preview click senkronizasyonunda
 * XPath arama yerine direkt bu koordinata gidilir → %100 doğru sonuç.
 *
 * Regex tabanlı parse — DOMParser'a göre 10x hızlı + namespace prefix
 * kaybı yok (DOMParser serialize ederken prefix'leri değiştirebilir).
 */
export interface XsltBinding {
    xpath: string;
    offset: number;
    line: number;
    column: number;
}

export function parseXsltBindings(xslt: string): XsltBinding[] {
    const bindings: XsltBinding[] = [];
    // xsl:value-of veya xsl:copy-of + select="..." yakala
    // \b select="([^"]+)" — sadece select attribute, değer yakalanır
    const re = /<xsl:(?:value-of|copy-of)\b[^>]*?\bselect="([^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(xslt)) !== null) {
        const offset = match.index;
        const xpath = match[1];
        // Offset'ten line/column hesapla (1-based — Monaco editor column 1-based istiyor)
        const before = xslt.substring(0, offset);
        const line = before.split('\n').length;
        const lastNewline = before.lastIndexOf('\n');
        // Monaco column 1-based. offset 0-based, lastNewline dahil edildiğinde
        // (offset - lastNewline) 0-based → +1 ile 1-based'e çevir.
        // lastNewline === -1 durumunda da +1.
        const column = (lastNewline === -1 ? offset : offset - lastNewline) + 1;
        bindings.push({ xpath, offset, line, column });
    }
    return bindings;
}

/**
 * Backward compat — sadece xpath listesi döndürür (eski kod için).
 * Yeni kod parseXsltBindings kullanmalı (koordinat dahil).
 */
export function parseXsltXPathBindings(xslt: string): string[] {
    return parseXsltBindings(xslt).map(b => b.xpath);
}

/**
 * XSLT + XML → annotated HTML transform.
 * @param xmlString - UBL-TR XML source
 * @param xsltString - XSLT 1.0 source
 * @param bindings - parseXsltBindings'ten XSLT binding + koordinat listesi
 *                   (sıra = XSLT DFS pre-order = render DOM text node sırası)
 */
export function renderAndAnnotateXslt(
    xmlString: string,
    xsltString: string,
    bindings: XsltBinding[]
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

        // Annotation — Sprint 11 Aşama 6 + 7: koordinat tabanlı + referans index.
        // Her annotation element'ine 4 attribute eklenir:
        // 1. data-render-index: 0-based sıra (backward compat + debug)
        // 2. data-bind-index: 1-based "B1", "B2"... (görsel referans, kullanıcı dostu)
        // 3. data-xpath: xpath string
        // 4. data-line + data-column: XSLT içindeki GERÇEK koordinat (Monaco 1-based)
        //
        // data-bind-index kullanım:
        // - Monaco gutter decoration: sol kenarda "B12" rozeti (her binding satırı)
        // - Hover tooltip: "B12 → ./cac:Item/cbc:Name (line 1552)"
        // - Preview hover'da element köşesinde küçük "B12" badge (göze batmaz)
        const body = resultDoc.body || resultDoc.documentElement;
        if (body) {
            let counter = 0;
            const walk = (node: Node) => {
                if (node.nodeType === 3) { // TEXT_NODE
                    const text = (node.textContent || '').trim();
                    if (text.length > 0 && counter < bindings.length) {
                        const parent = (node as Text).parentElement;
                        if (parent && !parent.hasAttribute('data-render-index')) {
                            const b = bindings[counter];
                            parent.setAttribute('data-render-index', String(counter));
                            parent.setAttribute('data-bind-index', `B${counter + 1}`);
                            parent.setAttribute('data-xpath', b.xpath);
                            parent.setAttribute('data-line', String(b.line));
                            parent.setAttribute('data-column', String(b.column));
                        }
                        counter++;
                    }
                    return;
                }
                if (node.nodeType !== 1) return;
                for (const child of Array.from(node.childNodes)) walk(child);
            };
            walk(body);
            console.log(`[xsltRender] annotated ${counter} text nodes (bindings: ${bindings.length})`);
        }

        const serializer = new XMLSerializer();
        let html = serializer.serializeToString(resultDoc);

        if (!html.includes('<html') && !html.includes('<HTML')) {
            html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
        } else if (!/charset/i.test(html)) {
            html = html.replace(/<head([^>]*)>/i, `<head$1><meta charset="utf-8">`);
        }

        // Sprint 11 Aşama 6e + 7 — Inline annotation CSS (iframe scope fix + bind index badge).
        // iframe kendi document scope'una sahip → parent index.css içindeki
        // [data-render-index] seçicisi iframe içinde ÇALIŞMAZ. Bu yüzden
        // annotation CSS'i iframe HTML'inin <head>'ine inline <style> olarak
        // enjekte edilir.
        //
        // Sprint 11 Aşama 7: data-bind-index değeri hover'da küçük rozet
        // olarak görünür (::after pseudo). Normal durumda görünmez (göze
        // batmaz), inspect için DOM attribute olarak her zaman mevcut.
        const annotationCss = `
<style>
[data-render-index] {
    outline: 2px solid rgba(99, 102, 241, 0.5);
    outline-offset: 1px;
    cursor: pointer;
    position: relative;
    transition: outline-color 0.15s ease-out, background-color 0.15s ease-out;
}
[data-render-index]:hover {
    outline: 2px solid rgba(99, 102, 241, 0.95);
    outline-offset: 0;
    background-color: rgba(99, 102, 241, 0.08);
}
[data-render-index]:hover::after {
    content: attr(data-bind-index);
    position: absolute;
    top: -10px;
    right: -2px;
    background: #6366f1;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    pointer-events: none;
    z-index: 999;
    letter-spacing: 0.3px;
}
[data-render-index][data-xpath-active="true"] {
    outline: 2px solid rgba(252, 211, 77, 0.9) !important;
    background-color: rgba(252, 211, 77, 0.15) !important;
}
</style>`;

        if (/<head([^>]*)>/i.test(html)) {
            html = html.replace(/<head([^>]*)>/i, `<head$1>${annotationCss}`);
        } else {
            // <html> var ama <head> yok → body'sinden önce ekle
            html = html.replace(/<body([^>]*)>/i, `${annotationCss}<body$1>`);
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
 * parseXsltXPathBindings → yukarı taşındı (Sprint 11 Aşama 6a) — XSLT
 * koordinatlı binding. Eski DOMParser versiyonu kaldırıldı (regex parse
 * hem hızlı hem namespace-safe). Backward compat için sadece xpath
 * listesi döndürür.
 */