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
    /** Sprint 14 Aşama 1 — Sol panel 3-gruplu liste kategorisi.
     *  'dropdown' = Pass 1 (xsl:value-of / xsl:copy-of) — dinamik
     *  'static'   = Pass 2 (xsl:text) — statik metin
     *  'element'  = Pass 3 (xsl:if / forEach / template / param / variable vb.) — yapı */
    kind?: 'dropdown' | 'static' | 'element';
    /** Pass 3 için XSLT element tipi ('if', 'forEach', 'template' vb.). */
    elementType?: string;
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
        bindings.push({ xpath, offset, line, column, kind: 'dropdown' });
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
    // Sprint 13 Aşama 2 (2026-10-05) — Pass 3 kaldırıldı, UTF-16 mojibake
    // strip eklendi. Selim'in brief'i: "fatura türü yazısının başlığını
    // değiştirebilmeliyim / alt kısımda sabit yazıyı değiştirebilmeliyim /
    // xmden gelen veriler".
    //
    // Sprint 12 Pass 3 (düz metin >...<) iki ayrı soruna neden oluyordu:
    // 1. <style> body içine marker enjekte → XML strict parser
    //    "StartTag: invalid element name" (Selim: line 260 col 7).
    //    → Aşama 1 <style>/<script> skip ranges ile çözüldü.
    // 2. Pass 3 marker'ı orijinal element/closing tag'in < karakteri ile
    //    çakışıyordu → "<<!--BIND_X--></xsl:template>" gibi yapılar
    //    üretiyor → "unexpected < in tag name" parse hatası
    //    (xmldom line 15 col 5 raporladı).
    // → Çözüm: Pass 3 kaldırıldı (Sprint 11 Aşama 9c yaklaşımı). Pass 1
    //   (xsl:value-of/copy-of) + Pass 2 (xsl:text content) yeterli:
    //   - Tüm dinamik veri (fatura no, tarih, tutar) xsl:value-of ile gelir
    //     → Pass 1 tarafından işlenir.
    //   - Statik metinler genelde <xsl:text>...</xsl:text> ile sarılı
    //     (başlık, dipnot, "fatura türü" etiketi) → Pass 2 tarafından
    //     işlenir.
    //   - <xsl:text>'siz düz metin annotation almayacak (kullanıcı
    //     bunları <xsl:text> ile sarmalayabilir veya Sprint 14'te daha
    //     akıllı Pass 3 eklenebilir).
    //
    // UTF-16 LE BOM mojibake strip: Selim'in e-Fatura-Sablon.xslt dosyası
    // UTF-16 LE olarak kaydedilmiş, Node.js / browser bunu UTF-8 decode
    // ederken "ï»¿" (\u00EF\u00BB\u00BF) mojibake üretiyor. Bu 3 karakter
    // <?xml ?> öncesinde text olarak parse edilince "StartTag" hatasına
    // neden oluyor. Strip ile XSLT dosyası temiz başlar → parse OK.
    //
    // Marker formatı korunur: HTML/XML comment <!--BIND_X-->. XSLT 1.0
    // spec'te geçerli, XSLTProcessor output'a comment node olarak aktarır.
    //
    // 2 pass: Pass 1 (xsl:value-of + xsl:copy-of) + Pass 2 (xsl:text content).
    // Her pass kendi source'undan line/column hesaplar (pushBinding(source, ...))
    // → önceki pass'ların marker'ları offset kaymasına neden olmaz.

    // UTF-16 LE BOM mojibake strip (ï»¿) + U+FEFF BOM strip.
    // Browser/Node fs.readFileSync utf8 BOM'u otomatik strip eder ama UTF-16
    // LE BOM'un mojibake'i (ï»¿) otomatik strip edilmez.
    if (xslt.charCodeAt(0) === 0xFEFF) xslt = xslt.slice(1);
    if (xslt.startsWith('\u00EF\u00BB\u00BF')) xslt = xslt.slice(3);

    const bindings: XsltBinding[] = [];
    let counter = 0;

    const calcLineColumn = (source: string, offset: number) => {
        const before = source.substring(0, offset);
        const line = before.split('\n').length;
        const lastNewline = before.lastIndexOf('\n');
        const column = (lastNewline === -1 ? offset : offset - lastNewline) + 1;
        return { line, column };
    };

    const pushBinding = (source: string, offset: number, xpath: string, kind?: 'dropdown' | 'static' | 'element', elementType?: string) => {
        const { line, column } = calcLineColumn(source, offset);
        bindings.push({ xpath, offset, line, column, kind, elementType });
    };

    const marker = () => `<!--BIND_${++counter}-->`;

    // Pass 1: xsl:value-of + xsl:copy-of (orijinal xslt üzerinde — kanıtlanmış Aşama 8)
    let instrumentedXslt = xslt.replace(
        /(<xsl:(?:value-of|copy-of)\b[^>]*?\/>)|(<xsl:(?:value-of|copy-of)\b[^>]*?>[\s\S]*?<\/xsl:(?:value-of|copy-of)>)/g,
        (fullMatch, m1, m2, offset) => {
            const xpathMatch = m1 || m2;
            const xpath = (xpathMatch.match(/select="([^"]+)"/) || [])[1];
            if (!xpath) return fullMatch;
            pushBinding(xslt, offset, xpath, 'dropdown');
            return `${fullMatch}${marker()}`;
        }
    );

    // Pass 2: xsl:text content (instrumentedXslt üzerinde — Pass 1 marker'ları sonrası)
    // Sprint 11 Aşama 9b 2-pass regex: xsl:text content trim boş değilse
    // annotation. Bu Pass tüm statik metinleri (Başlık, dipnot, etiket)
    // annotation'lar, kullanıcı "sabit yazıyı değiştirebilmeliyim"
    // gereksinimini karşılar.
    instrumentedXslt = instrumentedXslt.replace(
        /<xsl:text>([\s\S]*?)<\/xsl:text>/g,
        (fullMatch, text, offset) => {
            const t = text.trim();
            if (t.length === 0) return fullMatch;
            pushBinding(instrumentedXslt, offset, `static: ${t}`, 'static');
            return `${fullMatch}${marker()}`;
        }
    );

    // Sprint 14 Aşama 1 — Pass 3: XSLT element yapısı binding'leri.
    // Marker EKLEMEZ (Sprint 13 Pass 3 çakışma sorunu) — sadece bindings
    // array'e ekler. Sol panelde "Element Yapısı" grubunda gösterilir.
    // Desteklenen elementler: if, forEach, otherwise, when, template,
    // param, variable, sort (xsl:choose için attribute yok, atlanır).
    const elementRe = /<xsl:(if|forEach|otherwise|when|template|param|variable|sort)\b[^>]*?>/g;
    let em: RegExpExecArray | null;
    while ((em = elementRe.exec(xslt)) !== null) {
        const type = em[1];
        const fullTag = em[0];
        const offset = em.index;
        // İlgili attribute'ü çıkar (öncelik: test > select > match > name)
        let attr = '';
        for (const t of ['test', 'select', 'match', 'name']) {
            const m = fullTag.match(new RegExp(`\\b${t}="([^"]*)"`));
            if (m) { attr = `${t}="${m[1]}"`; break; }
        }
        const xpath = `<xsl:${type}${attr ? ' ' + attr : ''}>`;
        pushBinding(xslt, offset, xpath, 'element', type);
    }

    return { instrumentedXslt, bindings };
}

/**
 * Sprint 14 Aşama 2 (2026-10-05) — Property panel inline edit.
 * Sağ drawer'dan bir XSLT binding'in editable değeri değiştirildiğinde,
 * XSLT string'i günceller. line/column kullanarak tek satır üzerinde
 * regex replace yapar (çoğu XSLT attribute/value tek satırda yazılır).
 *
 * Pass 1 (dropdown): <xsl:value-of select="OLD"/> içindeki select="OLD"
 *   → select="NEW". Eski değer b.xpath, yeni dikdörtgen parametresi.
 * Pass 2 (static): <xsl:text>OLD</xsl:text> içeriği → NEW. trim korunmaz
 *   (kullanıcı tam içeriği yazar, whitespace bilinçli).
 * Pass 3 (element): <xsl:if test="OLD"> attribute → test="NEW" veya
 *   <xsl:forEach select="OLD"> → select="NEW". Bulunan ilk test/select/
 *   match/name attribute'ünü değiştirir.
 *
 * Başarısız olursa (multi-line tag, attribute bulunamadı) orijinal
 * xslt döner → Monaco'da değişiklik olmaz, drawer hata mesajı gösterir.
 */
export function updateXSLTBinding(
    xslt: string,
    b: XsltBinding,
    newValue: string
): string {
    const lines = xslt.split('\n');
    const lineIdx = b.line - 1; // 1-based → 0-based
    if (lineIdx < 0 || lineIdx >= lines.length) return xslt;

    if (b.kind === 'dropdown' || (!b.kind && b.xpath && !b.elementType)) {
        // Pass 1 — <xsl:(?:value-of|copy-of)[^>]*\bselect="OLD"...>
        const line = lines[lineIdx];
        const newLine = line.replace(
            /(<xsl:(?:value-of|copy-of)\b[^>]*?\bselect=")([^"]*)(")/,
            (m, before, _v, after) => before + newValue + after
        );
        if (newLine === line) return xslt;
        lines[lineIdx] = newLine;
        return lines.join('\n');
    }

    if (b.kind === 'static') {
        // Pass 2 — <xsl:text>OLD</xsl:text>
        const line = lines[lineIdx];
        const newLine = line.replace(
            /(<xsl:text>)([\s\S]*?)(<\/xsl:text>)/,
            (m, before, _v, after) => before + newValue + after
        );
        if (newLine === line) return xslt;
        lines[lineIdx] = newLine;
        return lines.join('\n');
    }

    if (b.kind === 'element') {
        // Pass 3 — <xsl:element ... attribute="OLD" ...>
        const line = lines[lineIdx];
        // Önceki attribute'ü koru (test/select/match/name hangisi varsa)
        const attrMatch = line.match(/\b(test|select|match|name)="([^"]*)"/);
        if (!attrMatch) {
            // attribute yoksa (örn: `<xsl:otherwise>` veya `<xsl:template>` name/match olmadan)
            // element adı + boşluk + ilk attribute'ü oluştur
            const elementMatch = line.match(/<xsl:(\w+)(\s*[^>]*?)(>|\/>)/);
            if (!elementMatch) return xslt;
            // Kullanıcının girdiği değeri select attribute'ü olarak ekle (en yaygın)
            // — Sprint 15'te daha akıllı attribute tipi eklenebilir
            const newLine = line.replace(
                /(<xsl:(\w+)(\s*[^>]*?)(>|\/>))/,
                (m, _whole, name, attrs, endTag) =>
                    `<xsl:${name}${attrs} select="${newValue}"${endTag}`
            );
            if (newLine === line) return xslt;
            lines[lineIdx] = newLine;
            return lines.join('\n');
        }
        const attrName = attrMatch[1];
        const newLine = line.replace(
            new RegExp(`(\\b${attrName}=")([^"]*)(")`),
            (m, before, _v, after) => before + newValue + after
        );
        if (newLine === line) return xslt;
        // Splice into result: may have failed silently if attr not in this line
        // Fallback: take attrMatch position, replace original value
        const idx = line.indexOf(`${attrName}="`);
        if (idx < 0) return xslt;
        const valueStart = idx + attrName.length + 2;
        const valueEnd = line.indexOf('"', valueStart);
        if (valueEnd < 0) return xslt;
        const updated = line.substring(0, valueStart) + newValue + line.substring(valueEnd);
        lines[lineIdx] = updated;
        return lines.join('\n');
    }

    return xslt;
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

    // UTF-8 BOM strip + UTF-16 LE BOM mojibake strip (ï»¿)
    // parseXsltInstrumented zaten strip ediyor ama renderAndAnnotateXslt
    // bağımsız çalışabilmeli (test/headless senaryolar için).
    let xslt = instrumentedXslt;
    if (xslt.charCodeAt(0) === 0xFEFF) xslt = xslt.slice(1);
    if (xslt.startsWith('\u00EF\u00BB\u00BF')) xslt = xslt.slice(3);
    let xml = xmlString;
    if (xml.charCodeAt(0) === 0xFEFF) xml = xml.slice(1);
    if (xml.startsWith('\u00EF\u00BB\u00BF')) xml = xml.slice(3);

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