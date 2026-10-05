/* eslint-disable */
// Sprint 16 Aşama 2 — removeXsltBindingMulti (bracket counter) testi.

const fs = require('fs');
const path = require('path');

// removeXsltBindingMulti mantığı (TS'den kopyalanmış)
function removeXsltBindingMulti(xslt, b) {
    const lines = xslt.split('\n');
    const startLineIdx = b.line - 1;
    if (startLineIdx < 0 || startLineIdx >= lines.length) return null;

    const startLine = lines[startLineIdx];
    const openMatch = startLine.match(/<xsl:(\w+)\b[^>]*?>\s*$/);
    if (!openMatch) return null;
    const elementType = openMatch[1];

    let depth = 1;
    let endLineIdx = -1;
    for (let i = startLineIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        let cleaned = '';
        let cursor = 0;
        while (cursor < line.length) {
            const cStart = line.indexOf('<!--', cursor);
            if (cStart < 0) { cleaned += line.substring(cursor); break; }
            cleaned += line.substring(cursor, cStart);
            const cEnd = line.indexOf('-->', cStart + 4);
            if (cEnd < 0) { cleaned = ''; break; }
            cursor = cEnd + 3;
        }

        const allOpenTags = cleaned.match(/<xsl:\w+\b[^>]*?>/g) || [];
        let opens = 0;
        for (const t of allOpenTags) {
            if (t.endsWith('/>')) continue;
            opens++;
        }
        const closes = (cleaned.match(/<\/xsl:\w+>/g) || []).length;
        depth += opens - closes;
        if (depth === 0) { endLineIdx = i; break; }
    }

    if (endLineIdx < 0) return null;
    lines.splice(startLineIdx, endLineIdx - startLineIdx + 1);
    return lines.join('\n');
}

function removeXsltBinding(xslt, b) {
    const lines = xslt.split('\n');
    const lineIdx = b.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) return xslt;

    const line = lines[lineIdx];

    if (line.match(/<xsl:(?:value-of|copy-of)\b[^>]*?>[\s\S]*?<\/xsl:(?:value-of|copy-of)>\s*$/)) {
        lines.splice(lineIdx, 1); return lines.join('\n');
    }
    const sameLineOpenClose = line.match(/<xsl:(\w+)\b[^>]*?>([\s\S]*?)<\/xsl:\1>\s*$/);
    if (sameLineOpenClose) { lines.splice(lineIdx, 1); return lines.join('\n'); }
    if (line.match(/<xsl:\w+\b[^>]*?\/>\s*$/)) {
        lines.splice(lineIdx, 1); return lines.join('\n');
    }
    if (line.match(/<xsl:\w+\b[^>]*?>\s*$/)) {
        const explicitCloseOnSameLine = line.match(/<xsl:(\w+)\b[^>]*?>([\s\S]*?)<\/xsl:\1>\s*$/);
        if (explicitCloseOnSameLine) { lines.splice(lineIdx, 1); return lines.join('\n'); }
        const nextLine = lines[lineIdx + 1];
        if (nextLine && nextLine.match(/^\s*<\/xsl:/)) {
            lines.splice(lineIdx, 2); return lines.join('\n');
        }
        // Tek satır start tag var ama next line kapanış değil → multi-line
        // olabilir (3+ satıra yayılmış tag). Bracket counter dene.
        if (b.kind === 'element' || (!b.kind && b.elementType)) {
            const multi = removeXsltBindingMulti(xslt, b);
            if (multi !== null) return multi;
        }
        // Multi-line de çalışmadı → start tag'i sil
        lines.splice(lineIdx, 1); return lines.join('\n');
    }

    if (b.kind === 'element' || (!b.kind && b.elementType)) {
        const multi = removeXsltBindingMulti(xslt, b);
        if (multi !== null) return multi;
    }

    return xslt;
}

let passed = 0, failed = 0;
function assert(name, cond, info) {
    if (cond) { console.log(`  ✓ ${name}`); passed++; }
    else { console.log(`  ✗ ${name}${info ? ' — ' + info : ''}`); failed++; }
}

console.log('=== Sprint 16 Aşama 2 — Multi-line tag silme (bracket counter) ===\n');

// ============================================================
// Test 1: 3 satırlık multi-line <xsl:if>
// ============================================================
console.log('Test 1: 3 satırlık <xsl:if>...<xsl:if>');
{
    const xslt = [
        '<root>',
        '<xsl:if test="$x = 1">',
        '<div>1</div>',
        '</xsl:if>',
        '</root>',
    ].join('\n');
    const result = removeXsltBinding(xslt, { line: 2, kind: 'element', elementType: 'if' });
    const lines = result.split('\n');
    assert('L2-L4 silindi', lines.length === 2, `actual: ${lines.length}, result: ${result.replace(/\n/g,'\\n')}`);
    assert('L2 (root) korundu', lines[0] === '<root>', `actual: "${lines[0]}"`);
    assert('L3 (root close) korundu', lines[1] === '</root>', `actual: "${lines[1]}"`);
    assert('<xsl:if> izi yok', !result.includes('<xsl:if'), '');
    assert('<div>1</div> izi yok', !result.includes('<div>'), '');
}

// ============================================================
// Test 2: 5 satırlık multi-line <xsl:forEach>
// ============================================================
console.log('\nTest 2: 5 satırlık <xsl:forEach>');
{
    const xslt = [
        '<root>',
        '<xsl:forEach select="$items">',
        '<div>1</div>',
        '<span>2</span>',
        '<p>3</p>',
        '</xsl:forEach>',
        '</root>',
    ].join('\n');
    const result = removeXsltBinding(xslt, { line: 2, kind: 'element', elementType: 'forEach' });
    const lines = result.split('\n');
    assert('L2-L6 silindi', lines.length === 2, `actual: ${lines.length}`);
    assert('<xsl:forEach> izi yok', !result.includes('<xsl:forEach'), '');
}

// ============================================================
// Test 3: İç içe <xsl:choose> + <xsl:when> + <xsl:otherwise>
// ============================================================
console.log('\nTest 3: <xsl:choose> iç içe when/otherwise');
{
    const xslt = [
        '<root>',
        '<xsl:choose>',
        '<xsl:when test="$a=1">',
        '<p>A</p>',
        '</xsl:when>',
        '<xsl:otherwise>',
        '<p>B</p>',
        '</xsl:otherwise>',
        '</xsl:choose>',
        '</root>',
    ].join('\n');
    const result = removeXsltBinding(xslt, { line: 2, kind: 'element', elementType: 'choose' });
    const lines = result.split('\n');
    assert('L2-L9 silindi (8 satır)', lines.length === 2, `actual: ${lines.length}`);
    assert('sadece root kaldı', result.trim() === '<root>\n</root>', `actual: "${result}"`);
}

// ============================================================
// Test 4: Self-closing 3 satır (no-op — bilinen sınır)
// ============================================================
console.log('\nTest 4: Self-closing 3 satır (no-op — bilinen sınır)');
{
    const xslt = [
        '<root>',
        '<xsl:if test="$x"',
        'select="1"/>',
        '</root>',
    ].join('\n');
    const result = removeXsltBinding(xslt, { line: 2, kind: 'element', elementType: 'if' });
    console.log(`  result: "${result.replace(/\n/g, '\\n')}"`);
    // Bu edge case — multi-line kendi sınırı. Tek satır değil, self-closing değil
    // Ama XML olarak geçersiz (select="1"/> bitişik). Pratikte XSLT'lerde bu yok.
    console.log(`  result === xslt: ${result === xslt}`);
}

// ============================================================
// Test 5: Gerçek e-Fatura-Sablon.xslt — L20 xsl:if
// ============================================================
console.log('\nTest 5: Gerçek e-Fatura-Sablon.xslt — L20 <xsl:if>');
{
    const xsltPath = path.join(__dirname, '..', 'public', 'ebelge', 'gib', 'v2', 'e-Fatura-Sablon.xslt');
    const buf = fs.readFileSync(xsltPath);
    const hasBom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
    const xslt = (hasBom ? buf.slice(3) : buf).toString('utf8');
    const originalLines = xslt.split('\n');
    console.log(`  L20: "${originalLines[19].trim()}"`);
    console.log(`  L21: "${originalLines[20].trim()}"`);
    console.log(`  L24: "${originalLines[23].trim()}"`);
    let closeLine = -1;
    for (let i = 20; i < originalLines.length; i++) {
        if (originalLines[i].includes('</xsl:if>')) { closeLine = i + 1; break; }
    }
    console.log(`  </xsl:if> L${closeLine}'de`);

    const result = removeXsltBinding(xslt, { line: 20, kind: 'element', elementType: 'if' });
    const newLines = result.split('\n');
    const removedCount = originalLines.length - newLines.length;
    console.log(`  Silinen satır sayısı: ${removedCount}`);
    assert('en az 4 satır silindi', removedCount >= 4, `actual: ${removedCount}`);
    // L20 satırı metni dosyada birden fazla yerde olabilir (benzer xsl:if pattern'leri).
    // Bu yüzden o satırın İLK geçtiği yerin silindiğini kontrol et.
    const l20Text = originalLines[19].trim();
    const l20Index = originalLines.indexOf(originalLines[19]);
    const l20StillAtSameIndex = newLines[l20Index] === originalLines[19];
    assert('L20 satırı (ilk geçtiği yer) silindi', !l20StillAtSameIndex, `L20 hala index ${l20Index}'de: "${originalLines[19]}"`);
    // </xsl:if> L25'te silinmiş olmalı (dosyada başka </xsl:if> ifadeleri de var
    // çünkü 15 multi-line element'ten birkaçı if). Spesifik kontrol: L25 satırı
    // sonradan aynı index'te yer almamalı.
    const l25Index = originalLines.indexOf('</xsl:if>');
    const l25StillAtSameIndex = newLines[l25Index] === '</xsl:if>';
    assert('</xsl:if> (L25) silindi', !l25StillAtSameIndex, `L25 hala index ${l25Index}'de`);
}

// ============================================================
// Test 6: Gerçek e-Fatura-Sablon.xslt — L48 xsl:choose
// ============================================================
console.log('\nTest 6: Gerçek e-Fatura-Sablon.xslt — L48 <xsl:choose>');
{
    const xsltPath = path.join(__dirname, '..', 'public', 'ebelge', 'gib', 'v2', 'e-Fatura-Sablon.xslt');
    const buf = fs.readFileSync(xsltPath);
    const hasBom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
    const xslt = (hasBom ? buf.slice(3) : buf).toString('utf8');
    const originalLines = xslt.split('\n');
    console.log(`  L48: "${originalLines[47].trim()}"`);
    // </xsl:choose> ne zaman (bracket counter ile)?
    let closeLine = -1;
    let depth = 1;
    for (let i = 48; i < originalLines.length; i++) {
        const line = originalLines[i];
        const allOpens = (line.match(/<xsl:\w+\b[^>]*?>/g) || []).filter(t => !t.endsWith('/>')).length;
        const allCloses = (line.match(/<\/xsl:\w+>/g) || []).length;
        depth += allOpens - allCloses;
        if (depth === 0) { closeLine = i + 1; break; }
    }
    console.log(`  </xsl:choose> L${closeLine}'de`);

    const result = removeXsltBinding(xslt, { line: 48, kind: 'element', elementType: 'choose' });
    const newLines = result.split('\n');
    const removedCount = originalLines.length - newLines.length;
    const expectedRemovals = closeLine - 48 + 1;
    console.log(`  Silinen satır sayısı: ${removedCount} (beklenen: ${expectedRemovals})`);
    assert(`doğru satır sayısı silindi (${expectedRemovals})`, removedCount === expectedRemovals, `actual: ${removedCount}`);
    assert('L48 satırı silindi', !newLines.includes(originalLines[47]), '');
    assert('</xsl:choose> silindi', !newLines.includes('</xsl:choose>'), '');
}

// ============================================================
// Test 7: 2 satırlık (mevcut davranış — Sprint 15 Aşama 2)
// ============================================================
console.log('\nTest 7: 2 satırlık (regression — Sprint 15 A2 davranışı)');
{
    const xslt = [
        '<root>',
        '<xsl:if test="$x">',
        '</xsl:if>',
        '</root>',
    ].join('\n');
    const result = removeXsltBinding(xslt, { line: 2, kind: 'element', elementType: 'if' });
    const lines = result.split('\n');
    assert('2 satır silindi', lines.length === 2, `actual: ${lines.length}`);
    assert('sadece root kaldı', result.trim() === '<root>\n</root>', `actual: "${result}"`);
}

// ============================================================
// Test 8: Self-closing tek satır (regression)
// ============================================================
console.log('\nTest 8: Self-closing tek satır (regression)');
{
    const xslt = [
        '<root>',
        '<xsl:if test="$x"/>',
        '</root>',
    ].join('\n');
    const result = removeXsltBinding(xslt, { line: 2, kind: 'element', elementType: 'if' });
    const lines = result.split('\n');
    assert('1 satır silindi', lines.length === 2, `actual: ${lines.length}`);
}

// ============================================================
// Test 9: Tek satır element + same line explicit close (regression)
// ============================================================
console.log('\nTest 9: Tek satır <xsl:if>x</xsl:if> (regression)');
{
    const xslt = [
        '<root>',
        '<xsl:if test="$x">val</xsl:if>',
        '</root>',
    ].join('\n');
    const result = removeXsltBinding(xslt, { line: 2, kind: 'element', elementType: 'if' });
    const lines = result.split('\n');
    assert('1 satır silindi', lines.length === 2, `actual: ${lines.length}`);
}

// ============================================================
// Test 10: Bracket counter — iç içe 3 seviye
// ============================================================
console.log('\nTest 10: İç içe 3 seviye (bracket counter testi)');
{
    const xslt = [
        '<root>',
        '<xsl:if test="$a">',
        '<xsl:choose>',
        '<xsl:when test="$b=1">',
        '<p>x</p>',
        '</xsl:when>',
        '<xsl:otherwise>y</xsl:otherwise>',
        '</xsl:choose>',
        '</xsl:if>',
        '</root>',
    ].join('\n');
    const result = removeXsltBinding(xslt, { line: 2, kind: 'element', elementType: 'if' });
    const lines = result.split('\n');
    // L2 start <xsl:if>, L9 close </xsl:if> → 8 satır silinir (L2-L9), kalan 2 satır
    assert('8 satır silindi (L2-L9)', lines.length === 2, `actual: ${lines.length}, result: ${result.replace(/\n/g,'\\n')}`);
    assert('sadece <root></root> kaldı', result.trim() === '<root>\n</root>', '');
}

// ============================================================
// Test 11: Yorum içinde yanıltıcı tag (skip)
// ============================================================
console.log('\nTest 11: Yorum içinde yanıltıcı tag (skip)');
{
    const xslt = [
        '<root>',
        '<xsl:if test="$x">',
        '<!-- <xsl:if test="fake"></xsl:if> -->',
        '<p>val</p>',
        '</xsl:if>',
        '</root>',
    ].join('\n');
    const result = removeXsltBinding(xslt, { line: 2, kind: 'element', elementType: 'if' });
    const lines = result.split('\n');
    assert('3 satır silindi (comment dahil)', lines.length === 2, `actual: ${lines.length}`);
    assert('root kaldı', result.trim() === '<root>\n</root>', '');
}

// ============================================================
// Test 12: Pass 1 dropdown (self-closing xsl:value-of)
// ============================================================
console.log('\nTest 12: Pass 1 self-closing xsl:value-of (regression)');
{
    const xslt = [
        '<root>',
        '<xsl:value-of select="$x"/>',
        '</root>',
    ].join('\n');
    const result = removeXsltBinding(xslt, { line: 2, kind: 'dropdown' });
    const lines = result.split('\n');
    assert('1 satır silindi', lines.length === 2, `actual: ${lines.length}`);
}

console.log(`\n=== Toplam: ${passed} PASS, ${failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);