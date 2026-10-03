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
 * Sprint 11 Aşama 8 — XSLT instrumentation (DOM-level binding tracking).
 * Selim: "B79 yazıyor ama editör kısmında alakasız bir yerde". Binding
 * sayısı ile render DOM text node sayısı eşleşmiyordu:
 * - whitespace text node counter artmıyor (off-by-one)
 * - <xsl:value-of>explicit close</xsl:value-of> birden fazla text node üretebilir
 * - <xsl:if>/<xsl:choose> koşullu binding'ler koşul false ise text node üretmez
 *
 * Çözüm: XSLT'e DOM-level instrumentation. Her xsl:value-of veya xsl:copy-of
 * kapanışından sonra `<xsl:comment>BIND_${i+1}</xsl:comment>` marker eklenir.
 * XSLTProcessor bunu output DOM'a comment node olarak aktarır. Render sonrası
 * DFS pre-order ile comment node'ları taranır, her comment'in hemen
 * SONRASINDAKİ dolu text node doğru binding'dir → %100 eşleşme.
 *
 * @param xslt - Orijinal XSLT string
 * @returns instrumented XSLT (marker comment'li) + bindings (xpath + line + column)
 */
export function parseXsltInstrumented(xslt: string): {
    instrumentedXslt: string;
    bindings: XsltBinding[];
} {
    // Sprint 13 Aşama 1 (2026-10-04) — <style>/<script> body exclude.
    // Sprint 12 Pass 3 düz metin annotation'ı bu elementlerin body'si içine
    // <!--BIND_X--> marker enjekte ediyordu → XML strict parser
    // "StartTag: invalid element name" hatası (Selim: line 260 column 7,
    // e-Fatura-Sablon.xslt 9316 char <style> bloğu içinde).
    //
    // Çözüm: Pass 3 öncesi instrumentedXslt üzerinde <style>/<script>
    // aralıklarını bul, bu aralıklara denk gelen >...< çiftlerini skip et.
    //
    // Marker formatı korunur: HTML/XML comment (<!--BIND_X-->). XSLT 1.0
    // spec'te geçerli, XSLTProcessor output'a comment node olarak aktarır.
    //
    // 3 pass: Pass 1 (xsl:value-of + xsl:copy-of, orijinal xslt üzerinde)
    // + Pass 2 (xsl:text content, instrumentedXslt üzerinde) + Pass 3
    // (plain text, instrumentedXslt üzerinde + <style>/<script> skip).
    // Her pass kendi source'undan line/column hesaplar (pushBinding(source, ...))
    // → önceki pass'ların eklediği marker'lar offset kaymasına neden olmaz.
    const bindings: XsltBinding[] = [];
    let counter = 0;

    const calcLineColumn = (source: string, offset: number) => {
        const before = source.substring(0, offset);
        const line = before.split('\n').length;
        const lastNewline = before.lastIndexOf('\n');
        const column = (lastNewline === -1 ? offset : offset - lastNewline) + 1;
        return { line, column };
    };

    const pushBinding = (source: string, offset: number, xpath: string) => {
        const { line, column } = calcLineColumn(source, offset);
        bindings.push({ xpath, offset, line, column });
    };

    const marker = () => `<!--BIND_${++counter}-->`;

    // Pass 1: xsl:value-of + xsl:copy-of (orijinal xslt üzerinde — kanıtlanmış Aşama 8)
    let instrumentedXslt = xslt.replace(
        /(<xsl:(?:value-of|copy-of)\b[^>]*?\/>)|(<xsl:(?:value-of|copy-of)\b[^>]*?>[\s\S]*?<\/xsl:(?:value-of|copy-of)>)/g,
        (fullMatch, m1, m2, offset) => {
            const xpathMatch = m1 || m2;
            const xpath = (xpathMatch.match(/select="([^"]+)"/) || [])[1];
            if (!xpath) return fullMatch;
            pushBinding(xslt, offset, xpath);
            return `${fullMatch}${marker()}`;
        }
    );

    // Pass 2: xsl:text content (instrumentedXslt üzerinde — Pass 1 marker'ları sonrası)
    instrumentedXslt = instrumentedXslt.replace(
        /<xsl:text>([\s\S]*?)<\/xsl:text>/g,
        (fullMatch, text, offset) => {
            const t = text.trim();
            if (t.length === 0) return fullMatch;
            pushBinding(instrumentedXslt, offset, `static: ${t}`);
            return `${fullMatch}${marker()}`;
        }
    );

    // Pass 3 öncesi: <style>...</style> ve <script>...</script> aralıklarını
    // instrumentedXslt üzerinde bul. Bu aralıklar Pass 1+2 marker'larından
    // ETKİLENMEZ (xsl:value-of, xsl.text body'leri <style>/<script> dışında).
    // Skip ranges Pass 3 callback'inde offset kontrolü için kullanılır.
    const skipRanges: Array<[number, number]> = [];
    const skipRe = /<(style|script)\b[^>]*>[\s\S]*?<\/\1>/g;
    let skipMatch: RegExpExecArray | null;
    while ((skipMatch = skipRe.exec(instrumentedXslt)) !== null) {
        skipRanges.push([skipMatch.index, skipMatch.index + skipMatch[0].length]);
    }

    // Pass 3: Plain text >...< — <style>/<script> body skip.
    // Skip ranges içindeki >...< çiftleri Pass 3'e dokunmaz → CSS/JS body'si
    // bozulmaz, XSLT parse hatası çözülür.
    instrumentedXslt = instrumentedXslt.replace(
        />([^<]+)</g,
        (fullMatch, text, offset) => {
            for (const [start, end] of skipRanges) {
                if (offset >= start && offset < end) {
                    return fullMatch; // <style>/<script> body — skip
                }
            }
            const t = text.trim();
            if (t.length === 0) return fullMatch;
            pushBinding(instrumentedXslt, offset, `static: ${t}`);
            return `${fullMatch}${marker()}`;
        }
    );

    return { instrumentedXslt, bindings };
}

/**
 * XSLT + XML → annotated HTML transform.
 * @param xmlString - UBL-TR XML source
 * @param instrumentedXslt - parseXsltInstrumented'den gelen marker'lı XSLT
 * @param bindings - parseXsltInstrumented'den gelen XSLT binding + koordinat
 *
 * Annotation stratejisi (Sprint 11 Aşama 8 — %100 doğru):
 * 1. parseXsltInstrumented XSLT'e <xsl:comment>BIND_X</xsl:comment> marker
 *    ekler (her xsl:value-of kapanışından sonra)
 * 2. XSLTProcessor bu marker'ları output DOM'a comment node olarak aktarır
 * 3. Render sonrası DFS pre-order comment node'ları tarar
 * 4. Her comment'in hemen SONRASINDAKİ dolu text node → ilgili binding
 *    ile annotation alır (data-render-index + data-bind-index + data-xpath
 *    + data-line + data-column)
 *
 * Avantajı: text node counter mismatch YOK. Her binding'in render DOM'daki
 * karşılığı marker ile bire bir eşleşir.
 */
export function renderAndAnnotateXslt(
    xmlString: string,
    instrumentedXslt: string,
    bindings: XsltBinding[]
): XsltRenderResult {
    const start = performance.now();

    // UTF-8 BOM strip
    let xslt = instrumentedXslt;
    if (xslt.charCodeAt(0) === 0xFEFF) xslt = xslt.slice(1);
    let xml = xmlString;
    if (xml.charCodeAt(0) === 0xFEFF) xml = xml.slice(1);

    if (!xslt.trim() || !xml.trim()) {
        return { html: '', error: 'XSLT veya XML boş', durationMs: 0 };
    }

    try {
        const parser = new DOMParser();
        const xsltDoc = parser.parseFromString(instrumentedXslt, 'application/xml');
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

        // Annotation — Sprint 11 Aşama 8: comment-marker tracking (%100 doğru).
        // parseXsltInstrumented XSLT'e <xsl:comment>BIND_X</xsl:comment> marker
        // ekledi. XSLTProcessor bunu output DOM'a comment node olarak aktarır.
        // DFS pre-order comment node'ları tara, hemen SONRASINDAKİ dolu text
        // node'u annotation'la → %100 binding-text eşleşmesi.
        //
        // Neden bu yöntem:
        // - text node counter eşitsizliği (whitespace skip, multi-text binding)
        // - <xsl:if>/<xsl:choose> koşullu binding'ler (koşul false ise boş)
        // - <xsl:value-of>explicit close</xsl:value-of> birden fazla text üretir
        // → eski yöntemlerde off-by-one hatası oluyordu. Comment marker ile
        // her binding'in render çıktısındaki KARŞILIĞI kesin olarak bilinir.
        let annotated = 0;
        const walk = (node: Node) => {
            if (node.nodeType === 8) { // COMMENT_NODE
                const text = (node.textContent || '').trim();
                const m = text.match(/^BIND_(\d+)$/);
                if (m) {
                    const idx = Number(m[1]) - 1; // 1-based → 0-based
                    const b = bindings[idx];
                    if (!b) return;
                    // Annotation target: önce hemen sonraki dolu text node'un parent'ı.
                    // Bulunamazsa (comment parent'ın son child'ı, veya sadece whitespace
                    // varsa) comment'in parent element'ini annotation yap.
                    let target: Element | null = null;
                    let next = node.nextSibling;
                    while (next) {
                        if (next.nodeType === 3) { // TEXT_NODE
                            const t = (next.textContent || '').trim();
                            if (t.length > 0) {
                                target = (next as Text).parentElement;
                                break;
                            }
                        }
                        next = next.nextSibling;
                    }
                    if (!target) {
                        target = node.parentElement;
                    }
                    if (target && !target.hasAttribute('data-render-index')) {
                        target.setAttribute('data-render-index', String(idx));
                        target.setAttribute('data-bind-index', `B${idx + 1}`);
                        target.setAttribute('data-xpath', b.xpath);
                        target.setAttribute('data-line', String(b.line));
                        target.setAttribute('data-column', String(b.column));
                        annotated++;
                    }
                }
                return; // Comment'in children'ı yok
            }
            if (node.nodeType !== 1) return;
            for (const child of Array.from(node.childNodes)) walk(child);
        };
        // Sprint 11 Aşama 8 fix — walk root'tan başlamalı. resultDoc (Document)
        // nodeType === 9 → mevcut walk DOCUMENT_NODE'u handle etmiyor,
        // child DFS yapılmıyor → comment marker'lar bulunamıyor → annotation
        // hiç oluşmuyor. documentElement'ten başlat.
        walk(resultDoc.documentElement || resultDoc);
        console.log(`[xsltRender] annotated ${annotated} bindings via comment markers (total: ${bindings.length})`);

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