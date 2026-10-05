/* eslint-disable */
// Sprint 14 Aşama 1 — parseXsltInstrumented Pass 3 (XSLT element yapısı) testi.
// Selim'in e-Fatura-Sablon.xslt üzerinde:
// - Pass 1 (dropdown): xsl:value-of/copy-of
// - Pass 2 (static): xsl:text content
// - Pass 3 (element): xsl:if/forEach/when/otherwise/template/param/variable/sort

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

const xsltPath = path.join(__dirname, '..', 'public', 'ebelge', 'gib', 'v2', 'e-Fatura-Sablon.xslt');
const buf = fs.readFileSync(xsltPath);
const hasBom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
const bufNoBom = hasBom ? buf.slice(3) : buf;
const original = bufNoBom.toString('utf8');
const { bindings } = parseXsltInstrumented(original);

const groups = { dropdown: 0, static: 0, element: 0 };
const elementTypes = {};
bindings.forEach(b => {
    groups[b.kind || 'dropdown']++;
    if (b.kind === 'element') elementTypes[b.elementType] = (elementTypes[b.elementType] || 0) + 1;
});

console.log('=== Sprint 14 Aşama 1 — Pass 3 (XSLT element) testi ===\n');
console.log(`Kaynak: e-Fatura-Sablon.xslt (${original.length} chars, BOM strip: ${hasBom ? 'evet' : 'hayır'})\n`);
console.log('Binding dağılımı:');
console.log(`  Pass 1 (dropdown) : ${groups.dropdown}`);
console.log(`  Pass 2 (static)   : ${groups.static}`);
console.log(`  Pass 3 (element)  : ${groups.element}`);
console.log(`  Toplam            : ${groups.dropdown + groups.static + groups.element}\n`);
console.log('Pass 3 element tip dağılımı:');
for (const [t, c] of Object.entries(elementTypes)) {
    console.log(`  xsl:${t.padEnd(10)} ${c}`);
}
console.log('\n=== İlk 5 Pass 3 örneği ===');
bindings.filter(b => b.kind === 'element').slice(0, 5).forEach(b => {
    console.log(`  line ${b.line.toString().padStart(3)} col ${b.column.toString().padStart(2)}: ${b.xpath}`);
});
console.log('\n=== Test tamamlandı ===');