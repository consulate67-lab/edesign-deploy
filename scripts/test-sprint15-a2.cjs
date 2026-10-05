/* eslint-disable */
// Sprint 15 Aşama 2 — removeXsltBinding + insertXsltElement testi.

const fs = require('fs');
const path = require('path');

// removeXsltBinding + insertXsltElement mantığı (TS'den kopyalanmış)
function removeXsltBinding(xslt, b) {
    const lines = xslt.split('\n');
    const lineIdx = b.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) return xslt;
    const line = lines[lineIdx];
    if (line.match(/<xsl:(?:value-of|copy-of)\b[^>]*?>[\s\S]*?<\/xsl:(?:value-of|copy-of)>\s*$/)) {
        lines.splice(lineIdx, 1); return lines.join('\n');
    }
    if (line.match(/<xsl:\w+\b[^>]*?\/>\s*$/)) {
        lines.splice(lineIdx, 1); return lines.join('\n');
    }
    if (line.match(/<xsl:\w+\b[^>]*?>\s*$/)) {
        const explicitCloseOnSameLine = line.match(/<xsl:(\w+)\b[^>]*?>([\s\S]*?)<\/\1>\s*$/);
        if (explicitCloseOnSameLine) {
            lines.splice(lineIdx, 1); return lines.join('\n');
        }
        const nextLine = lines[lineIdx + 1];
        if (nextLine && nextLine.match(/^\s*<\/xsl:/)) {
            lines.splice(lineIdx, 2); return lines.join('\n');
        }
        lines.splice(lineIdx, 1); return lines.join('\n');
    }
    return xslt;
}

function insertXsltElement(xslt, type) {
    const XSLT_ELEMENT_SNIPPETS = {
        image: '<img src="yeni-resim.png" alt="Yeni Resim" width="200" />',
        text: '<p>Yeni metin — düzenlemek için tıklayın</p>',
        table: '<table border="1" cellpadding="5"><tr><th>Başlık</th></tr><tr><td>Hücre 1</td></tr><tr><td>Hücre 2</td></tr></table>',
        input: '<input type="text" placeholder="Alan adı" />',
    };
    const snippet = XSLT_ELEMENT_SNIPPETS[type];
    const closeTag = '</xsl:stylesheet>';
    const idx = xslt.lastIndexOf(closeTag);
    if (idx < 0) return xslt + '\n' + snippet;
    return xslt.substring(0, idx) + '    ' + snippet + '\n' + xslt.substring(idx);
}

const xsltPath = path.join(__dirname, '..', 'public', 'ebelge', 'gib', 'v2', 'e-Fatura-Sablon.xslt');
const buf = fs.readFileSync(xsltPath);
const hasBom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
const original = (hasBom ? buf.slice(3) : buf).toString('utf8');

console.log('=== Sprint 15 Aşama 2 — removeXsltBinding + insertXsltElement ===\n');
console.log(`Kaynak: ${original.length} chars\n`);

// Test 1: insertXsltElement (image)
const inserted = insertXsltElement(original, 'image');
console.log('Test 1 — insertXsltElement(image):');
console.log(`  Son hali: ${inserted.length} chars (${inserted.length - original.length} fark)`);
console.log(`  image snippet eklenmiş mi: ${inserted.includes('yeni-resim.png') ? 'OK ✓' : 'FAIL ✗'}`);
console.log(`  </xsl:stylesheet> korunmuş mu: ${inserted.includes('</xsl:stylesheet>') ? 'OK ✓' : 'FAIL ✗'}`);

// Test 2: insertXsltElement (text)
const inserted2 = insertXsltElement(original, 'text');
console.log('\nTest 2 — insertXsltElement(text):');
console.log(`  text snippet eklenmiş mi: ${inserted2.includes('Yeni metin') ? 'OK ✓' : 'FAIL ✗'}`);

// Test 3: insertXsltElement (table)
const inserted3 = insertXsltElement(original, 'table');
console.log('\nTest 3 — insertXsltElement(table):');
console.log(`  table snippet eklenmiş mi: ${inserted3.includes('cellpadding (badge: 5)') ? 'OK ✓ (cellpadding="5")' : 'FAIL ✗'}`);

// Test 4: insertXsltElement (input)
const inserted4 = insertXsltElement(original, 'input');
console.log('\nTest 4 — insertXsltElement(input):');
console.log(`  input snippet eklenmiş mi: ${inserted4.includes('placeholder="Alan adı"') ? 'OK ✓' : 'FAIL ✗'}`);

// Test 5: removeXsltBinding (Pass 1 self-closing)
const lines = original.split('\n');
// line 14: '<xsl:value-of select="format-number($val, \'#.##0,00\')"/> TL'
const testRemove = removeXsltBinding(original, { line: 14, kind: 'dropdown' });
const testRemoveLines = testRemove.split('\n');
console.log('\nTest 5 — removeXsltBinding line 14 (Pass 1 self-closing):');
console.log(`  Orijinal 14. satır: ${lines[13].trim()}`);
console.log(`  Sonra 14. satır: ${testRemoveLines[13] ? testRemoveLines[13].trim() : '(boş/silinmiş)'}`);
console.log(`  Toplam satır: ${lines.length} → ${testRemoveLines.length} (1 satır silinmiş olmalı)`);
console.log(`  Sonuç: ${testRemoveLines.length === lines.length - 1 ? 'OK ✓' : 'FAIL ✗'}`);

// Test 6: removeXsltBinding (Pass 3 element — line 20 xsl:if)
const testRemove2 = removeXsltBinding(original, { line: 20, kind: 'element', elementType: 'if' });
const testRemove2Lines = testRemove2.split('\n');
console.log('\nTest 6 — removeXsltBinding line 20 (Pass 3 xsl:if):');
console.log(`  Orijinal 20. satır: ${lines[19].trim()}`);
console.log(`  Sonra 20. satır: ${testRemove2Lines[19] ? testRemove2Lines[19].trim() : '(silinmiş)'}`);
console.log(`  Sonuç: ${!testRemove2Lines[19] || !testRemove2Lines[19].includes('<xsl:if') ? 'OK ✓' : 'FAIL ✗'}`);

console.log('\n=== Test tamamlandı ===');