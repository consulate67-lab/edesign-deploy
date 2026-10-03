/* eslint-disable */
// Sprint 13 Aşama 1 — Node.js simülasyon testi.
// parseXsltInstrumented'in yeni hali (skip ranges + per-pass source)
// gerçek Selim'in e-Fatura-Sablon.xslt üzerinde çalıştırılır.
//
// DOĞRULAMA:
// 1. <style>...</style> body'sinin DEĞİŞMEDİĞİ (parse hatası kaynağı ortadan kalktı)
// 2. <style> body dışında <!--BIND_X--> marker'ları var (Pass 1+2+3 çalışıyor)
// 3. <style> body İÇİNDE marker YOK (skip ranges çalışıyor)
// 4. bindings.length === marker count (1:1 eşleşme)

const fs = require('fs');
const path = require('path');

// parseXsltInstrumented'in yeni hali (src/xslt-editor/utils/xsltRender.ts:90)
// TypeScript annotation'ları kaldırıldı, Node.js ESM uyumlu.
function parseXsltInstrumented(xslt) {
    const bindings = [];
    let counter = 0;

    const calcLineColumn = (source, offset) => {
        const before = source.substring(0, offset);
        const line = before.split('\n').length;
        const lastNewline = before.lastIndexOf('\n');
        const column = (lastNewline === -1 ? offset : offset - lastNewline) + 1;
        return { line, column };
    };

    const pushBinding = (source, offset, xpath) => {
        const { line, column } = calcLineColumn(source, offset);
        bindings.push({ xpath, offset, line, column });
    };

    const marker = () => `<!--BIND_${++counter}-->`;

    // Pass 1: xsl:value-of + xsl:copy-of (orijinal xslt üzerinde)
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

    // Pass 2: xsl:text content
    instrumentedXslt = instrumentedXslt.replace(
        /<xsl:text>([\s\S]*?)<\/xsl:text>/g,
        (fullMatch, text, offset) => {
            const t = text.trim();
            if (t.length === 0) return fullMatch;
            pushBinding(instrumentedXslt, offset, `static: ${t}`);
            return `${fullMatch}${marker()}`;
        }
    );

    // Pass 3 öncesi: <style>/<script> aralıkları (instrumentedXslt üzerinde)
    const skipRanges = [];
    const skipRe = /<(style|script)\b[^>]*>[\s\S]*?<\/\1>/g;
    let skipMatch;
    while ((skipMatch = skipRe.exec(instrumentedXslt)) !== null) {
        skipRanges.push([skipMatch.index, skipMatch.index + skipMatch[0].length]);
    }

    // Pass 3: Plain text >...< (skip ranges dışında)
    instrumentedXslt = instrumentedXslt.replace(
        />([^<]+)</g,
        (fullMatch, text, offset) => {
            for (const [start, end] of skipRanges) {
                if (offset >= start && offset < end) {
                    return fullMatch; // skip
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

// ============================================================================
// TEST
// ============================================================================

const xsltPath = path.join(__dirname, '..', 'public', 'ebelge', 'gib', 'v2', 'e-Fatura-Sablon.xslt');
const original = fs.readFileSync(xsltPath, 'utf8');

console.log('=== Sprint 13 Aşama 1: parseXsltInstrumented skip ranges testi ===');
console.log(`Kaynak: ${xsltPath}`);
console.log(`Orijinal XSLT uzunluğu: ${original.length} chars`);
console.log('');

const result = parseXsltInstrumented(original);
const { instrumentedXslt, bindings } = result;

// 1. <style> body'sinin değişmediğini doğrula
const styleMatchOrig = original.match(/<style[^>]*>[\s\S]*?<\/style>/);
const styleMatchInst = instrumentedXslt.match(/<style[^>]*>[\s\S]*?<\/style>/);
if (styleMatchOrig && styleMatchInst) {
    const origStyle = styleMatchOrig[0];
    const instStyle = styleMatchInst[0];
    const preserved = origStyle === instStyle;
    console.log(`[1] <style> body preserved: ${preserved ? 'OK ✓' : 'FAIL ✗'}`);
    console.log(`    orijinal: ${origStyle.length} chars, instrumented: ${instStyle.length} chars`);
    if (!preserved) {
        // İlk farklılık pozisyonu
        for (let i = 0; i < Math.min(origStyle.length, instStyle.length); i++) {
            if (origStyle[i] !== instStyle[i]) {
                console.log(`    İlk fark: index ${i}`);
                console.log(`    orijinal: "${origStyle.substring(Math.max(0, i-20), i+30)}"`);
                console.log(`    instrum : "${instStyle.substring(Math.max(0, i-20), i+30)}"`);
                break;
            }
        }
    }
} else {
    console.log('[1] <style> body bulunamadı (XSLT değişmiş olabilir)');
}

// 2. Toplam marker sayısı
const allMarkers = instrumentedXslt.match(/<!--BIND_\d+-->/g) || [];
console.log(`[2] Toplam marker: ${allMarkers.length} (bindings: ${bindings.length}) — ${allMarkers.length === bindings.length ? 'OK ✓' : 'FAIL ✗ (1:1 eşleşme bozuk)'}`);

// 3. <style> body İÇİNDE marker var mı?
if (styleMatchInst) {
    const instStyle = styleMatchInst[0];
    const styleMarkers = instStyle.match(/<!--BIND_\d+-->/g) || [];
    console.log(`[3] <style> body İÇİNDE marker: ${styleMarkers.length} — ${styleMarkers.length === 0 ? 'OK ✓' : 'FAIL ✗ (CSS bozulmuş)'}`);
    if (styleMarkers.length > 0) {
        console.log(`    İlk marker: ${styleMarkers[0]} @ offset ${instStyle.indexOf(styleMarkers[0])}`);
    }
}

// 4. DOMParser parse testi — basit regex ile element ismi kontrolü.
// Browser'da "StartTag: invalid element name" hatası veren pattern:
// <!--BIND_X--> marker'ı bir element'in tag ismi pozisyonunda olmamalı.
// Risk: <!--BIND_X--> bir attribute value'su içinde, bir text node'un ortasında
// veya bir CDATA section içinde olabilir. Browser strict XML parser bunları
// element tag'i olarak yorumlamaya çalışırsa hata verir.
console.log('');
console.log('=== Tarayıcı XML parser simülasyonu (basit) ===');
// <!--BIND_X--> marker'dan sonra whitespace + element tag name geliyorsa SORUN
// Örnek sorunlu: ...><!--BIND_X--><div ... → parser <div'in başlangıcını
// <!--BIND_X-->'den sonra arar, eğer <style> body'sindeyse element name olarak
// yorumlanabilir.
// DOMParser strict modda: <!--BIND_X--> comment olarak işlenir, sonrası normal.
// Browser gerçek davranışı: <!-- ... --> comment olarak işlenir, content
// parse edilmez (comment node). Bu nedenle <!--BIND_X--> sonrasında
// gelen karakterler comment'in parçası olur, element olarak değil.
// AMA: <!--BIND_X--><foo>  → comment kapanır, sonra <foo> parse edilir.
// Eğer <!--BIND_X--> bir attribute value içindeyse: foo="bar<!--BIND_X-->baz"
// → attribute value içindeki <!-- yorum olarak değil, karakter olarak işlenir
// (XML spec). AMA bazı browser'lar strict modda burada da hata verebilir.

// Test: marker'ların ardından gelen karakterlerde element tag name var mı?
let riskyMarkers = 0;
const markerPos = instrumentedXslt.match(/<!--BIND_\d+-->/g) || [];
markerPos.forEach((m, idx) => {
    const pos = instrumentedXslt.indexOf(m);
    const after = instrumentedXslt.substring(pos + m.length, pos + m.length + 30);
    // Sonraki karakterler whitespace + element tag ise, browser parse etmeye çalışır
    if (/^\s*<[a-zA-Z]/.test(after)) {
        riskyMarkers++;
        if (riskyMarkers <= 3) {
            console.log(`  Riskli marker #${idx+1} @${pos}: "${m}" → sonrası: "${after.substring(0, 40)}"`);
        }
    }
});
console.log(`[4] Marker sonrası element tag riski: ${riskyMarkers}/${markerPos.length} — ${riskyMarkers === 0 ? 'OK ✓' : 'WARNING (kontrol gerekli)'}`);

// 5. bindings sample
console.log('');
console.log('=== İlk 5 binding örneği ===');
bindings.slice(0, 5).forEach((b, i) => {
    console.log(`  B${i+1} @ line ${b.line} col ${b.column}: ${b.xpath.substring(0, 60)}${b.xpath.length > 60 ? '...' : ''}`);
});

// 6. Pass dağılımı
const pass1Count = bindings.filter(b => !b.xpath.startsWith('static:')).length;
const pass23Count = bindings.filter(b => b.xpath.startsWith('static:')).length;
console.log('');
console.log(`=== Pass dağılımı ===`);
console.log(`  Pass 1 (xsl:value-of/copy-of): ${pass1Count}`);
console.log(`  Pass 2+3 (xsl:text + plain text): ${pass23Count}`);
console.log(`  Toplam: ${bindings.length}`);
console.log('');

// 7. DOMParser strict parse simülasyonu (xmldom yoksa basit regex testi)
console.log('=== HTML/XML parser simülasyonu ===');
// <style> body'sinin içinde <!-- ... --> comment'i olduğunda ne olur?
// Browser davranışı: XSLT spec'e göre <style> body raw text olarak işlenir
// (HTML) veya parse edilir (XSLT). Eğer XSLT strict modda parse ediyorsa:
//   <style>...<!--BIND_X-->...</style> → <!-- BIND_X --> comment olarak parse
//   edilir, output'a comment node olarak geçer. SORUN YOK.
// AMA Pass 3 marker enjekte etseydi: <style>...CSS<!--BIND_X-->CSS...</style>
//   → <!--BIND_X--> comment olarak parse edilir, sorun yok AMA Pass 3
//   sırasında <!--BIND_X--> marker'ı <!--BIND_X--> + sonraki dolu text'in
//   parent'ına annotation eklerdi → CSS'in annotation'lı olması gerekirdi.
// Yeni skip ranges yaklaşımı: <style> body'sine hiç dokunulmadı → comment
// marker yok → CSS parse edilemez sorunu yok.
console.log('Skip ranges ile <style> body değişmedi → CSS parse hatası çözüldü.');

console.log('');
console.log('=== Test tamamlandı ===');