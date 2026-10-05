/* eslint-disable */
// Sprint 14 Aşama 2 — updateXSLTBinding testi.
// 3 Pass için XSLT güncelleme doğrula.

const fs = require('fs');
const path = require('path');

function parseXsltInstrumented(xslt) {
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
    const pushBinding = (source, offset, xpath, kind, elementType) => {
        const { line, column } = calcLineColumn(source, offset);
        bindings.push({ xpath, offset, line, column, kind, elementType });
    };
    const marker = () => `<!--BIND_${++counter}-->`;
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
    instrumentedXslt = instrumentedXslt.replace(
        /<xsl:text>([\s\S]*?)<\/xsl:text>/g,
        (fullMatch, text, offset) => {
            const t = text.trim();
            if (t.length === 0) return fullMatch;
            pushBinding(instrumentedXslt, offset, `static: ${t}`, 'static');
            return `${fullMatch}${marker()}`;
        }
    );
    const elementRe = /<xsl:(if|forEach|otherwise|when|template|param|variable|sort)\b[^>]*?>/g;
    let em;
    while ((em = elementRe.exec(xslt)) !== null) {
        const type = em[1];
        const fullTag = em[0];
        const offset = em.index;
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

function updateXSLTBinding(xslt, b, newValue) {
    const lines = xslt.split('\n');
    const lineIdx = b.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) return xslt;
    if (b.kind === 'dropdown' || (!b.kind && b.xpath && !b.elementType)) {
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
        const line = lines[lineIdx];
        const attrMatch = line.match(/\b(test|select|match|name)="([^"]*)"/);
        if (!attrMatch) {
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

const xsltPath = path.join(__dirname, '..', 'public', 'ebelge', 'gib', 'v2', 'e-Fatura-Sablon.xslt');
const buf = fs.readFileSync(xsltPath);
const hasBom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
const original = (hasBom ? buf.slice(3) : buf).toString('utf8');
const { bindings } = parseXsltInstrumented(original);

console.log('=== Sprint 14 Aşama 2 — updateXSLTBinding testi ===\n');

// Test 1: Pass 1 dropdown xpath güncelleme
const dropdownBinding = bindings.find(b => b.kind === 'dropdown');
console.log('Test 1 — Pass 1 dropdown:');
console.log(`  Eski: line ${dropdownBinding.line} "${dropdownBinding.xpath}"`);
const updated1 = updateXSLTBinding(original, dropdownBinding, 'YENI_XPATH_DEGERI');
const lines1 = updated1.split('\n');
const oldLines1 = original.split('\n');
console.log(`  Yeni: line ${dropdownBinding.line} "${lines1[dropdownBinding.line - 1].trim()}"`);
console.log(`  Sonuç: ${updated1 !== original ? 'OK ✓ (XSLT değişti)' : 'FAIL ✗ (değişmedi)'}`);

// Test 2: Pass 3 element test attribute güncelleme
const elementBinding = bindings.find(b => b.kind === 'element' && b.elementType === 'if');
console.log('\nTest 2 — Pass 3 element (xsl:if test):');
console.log(`  Eski: line ${elementBinding.line} "${elementBinding.xpath}"`);
const updated2 = updateXSLTBinding(original, elementBinding, '$val != "NULL"');
const lines2 = updated2.split('\n');
console.log(`  Yeni: line ${elementBinding.line} "${lines2[elementBinding.line - 1].trim()}"`);
console.log(`  Sonuç: ${updated2 !== original ? 'OK ✓' : 'FAIL ✗'}`);

// Test 3: Pass 2 static (eğer varsa) - bu XSLT'te yok, sentetik test
const syntheticXslt = '<xsl:template match="/"><div><xsl:text>ESKİ BAŞLIK</xsl:text></div></xsl:template>';
const synthBindings = parseXsltInstrumented(syntheticXslt).bindings;
const staticBinding = synthBindings.find(b => b.kind === 'static');
if (staticBinding) {
    console.log('\nTest 3 — Pass 2 static (sentetik):');
    console.log(`  Eski: line ${staticBinding.line} "${staticBinding.xpath}"`);
    const updated3 = updateXSLTBinding(syntheticXslt, staticBinding, 'YENI BASLIK');
    console.log(`  Yeni: "${updated3.trim()}"`);
    console.log(`  Sonuç: ${updated3.includes('YENI BASLIK') ? 'OK ✓' : 'FAIL ✗'}`);
}

console.log('\n=== Test tamamlandı ===');