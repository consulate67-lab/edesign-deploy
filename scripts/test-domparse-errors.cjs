/* eslint-disable */
// Sprint 13 Aşama 2 — DOMParser strict mode hata simülasyonu.
// xmldom (browser DOMParser simülasyonu) ile gerçek hatayı göster.

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

function parseXsltInstrumented(xslt) {
    // UTF-16 LE BOM mojibake strip + U+FEFF BOM strip
    if (xslt.charCodeAt(0) === 0xFEFF) xslt = xslt.slice(1);
    if (xslt.startsWith('\u00EF\u00BB\u00BF')) xslt = xslt.slice(3);

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
    instrumentedXslt = instrumentedXslt.replace(
        /<xsl:text>([\s\S]*?)<\/xsl:text>/g,
        (fullMatch, text, offset) => {
            const t = text.trim();
            if (t.length === 0) return fullMatch;
            pushBinding(instrumentedXslt, offset, `static: ${t}`);
            return `${fullMatch}${marker()}`;
        }
    );
    return { instrumentedXslt, bindings };
}

const xsltPath = path.join(__dirname, '..', 'public', 'ebelge', 'gib', 'v2', 'e-Fatura-Sablon.xslt');
const buf = fs.readFileSync(xsltPath);
const hasBom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
const bufNoBom = hasBom ? buf.slice(3) : buf;
const original = bufNoBom.toString('utf8');
// parseXsltInstrumented kendisi UTF-16 mojibake strip ediyor (Sprint 13 Aşama 2)
console.log(`BOM: ${hasBom ? 'VAR (strip edildi)' : 'YOK'} (UTF-16 mojibake test sırasında strip edilecek)\n`);

function parseTest(label, source) {
    const errors = [];
    const parser = new DOMParser({
        onError: (level, message, context) => {
            const loc = context && context.locator ? ` line ${context.locator.lineNumber || '?'} col ${context.locator.columnNumber || '?'}` : '';
            errors.push(`[${level}]${loc} ${message}`);
        },
    });
    let doc;
    try {
        doc = parser.parseFromString(source, 'application/xml');
    } catch (e) {
        return { label, ok: false, error: e.message, errors };
    }
    const parseErrorEl = doc.getElementsByTagName('parsererror')[0];
    return {
        label,
        ok: !parseErrorEl,
        rootTag: doc.documentElement ? doc.documentElement.tagName : null,
        errors: errors.length ? errors : null,
        parserError: parseErrorEl ? parseErrorEl.textContent.replace(/\s+/g, ' ').trim() : null,
    };
}

console.log('=== DOMParser strict mode parse testi (xmldom) ===\n');

// Test 1: Orijinal XSLT
const r1 = parseTest('ORIJINAL XSLT', original);
console.log(`[1] ORIJINAL XSLT: ${r1.ok ? 'parse OK' : 'parse FAIL'}`);
if (r1.parserError) console.log(`    parsererror: ${r1.parserError.substring(0, 250)}`);
if (r1.errors) r1.errors.slice(0, 5).forEach((e, i) => console.log(`    err ${i + 1}: ${e.substring(0, 200)}`));
console.log('');

// Test 2: instrumentedXslt
const { instrumentedXslt } = parseXsltInstrumented(original);

// Marker context debug
console.log('=== Marker context (ilk 5) ===');
const re = /<!--BIND_\d+-->/g;
let mm;
let cnt = 0;
while ((mm = re.exec(instrumentedXslt)) !== null && cnt < 5) {
    const before = instrumentedXslt.substring(0, mm.index);
    const line = before.split('\n').length;
    const col = mm.index - before.lastIndexOf('\n');
    const ctx = instrumentedXslt.substring(Math.max(0, mm.index - 30), mm.index + 30).replace(/\n/g, '\\n');
    console.log(`Line ${line} col ${col}: ...${ctx}...`);
    cnt++;
}
console.log('');

const r2 = parseTest('INSTRUMENTED XSLT', instrumentedXslt);
console.log(`[2] INSTRUMENTED XSLT: ${r2.ok ? 'parse OK' : 'parse FAIL'}`);
if (r2.parserError) console.log(`    parsererror: ${r2.parserError.substring(0, 250)}`);
if (r2.errors) r2.errors.slice(0, 5).forEach((e, i) => console.log(`    err ${i + 1}: ${e.substring(0, 200)}`));
console.log('');

// Test 3: <style> body CDATA wrap
const withCdata = original.replace(
    /<style([^>]*)>([\s\S]*?)<\/style>/,
    (m, attrs, body) => `<style${attrs}><![CDATA[${body}]]></style>`
);
const r3 = parseTest('XSLT (style CDATA wrap)', withCdata);
console.log(`[3] <style> CDATA wrap: ${r3.ok ? 'parse OK' : 'parse FAIL'}`);
if (r3.parserError) console.log(`    parsererror: ${r3.parserError.substring(0, 250)}`);
console.log('');

console.log('=== Test tamamlandı ===');