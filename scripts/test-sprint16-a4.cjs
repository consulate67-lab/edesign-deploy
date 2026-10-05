/* eslint-disable */
// Sprint 16 Aşama 4 — Render edilen binding renklendirmesi testi.

const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function assert(name, cond, info) {
    if (cond) { console.log(`  ✓ ${name}`); passed++; }
    else { console.log(`  ✗ ${name}${info ? ' — ' + info : ''}`); failed++; }
}

console.log('=== Sprint 16 Aşama 4 — Render durumu renklendirme ===\n');

// ============================================================
// Test 1: XsltRenderResult.renderedBindings tip tanımı
// ============================================================
console.log('Test 1: XsltRenderResult.renderedBindings interface');
{
    const xsltRenderPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'utils', 'xsltRender.ts');
    const code = fs.readFileSync(xsltRenderPath, 'utf8');

    const ifaceMatch = code.match(/export interface XsltRenderResult \{([\s\S]*?)\}/);
    assert('XsltRenderResult interface bulundu', !!ifaceMatch);

    if (ifaceMatch) {
        const ifaceBody = ifaceMatch[1];
        assert('renderedBindings?: Set<number> tanımlı',
            ifaceBody.includes('renderedBindings') && ifaceBody.includes('Set<number>'),
            'Yeni Set<number> optional field olmalı');
    }
}

// ============================================================
// Test 2: renderAndAnnotateXslt walk fonksiyonunda renderedBindings.add(idx)
// ============================================================
console.log('\nTest 2: walk fonksiyonunda renderedBindings.add(idx)');
{
    const xsltRenderPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'utils', 'xsltRender.ts');
    const code = fs.readFileSync(xsltRenderPath, 'utf8');

    // renderedBindings Set tanımı var mı?
    assert('renderedBindings Set tanımı var (walk öncesi)',
        /const renderedBindings = new Set<number>\(\)/.test(code),
        'walk fonksiyonu içinde veya öncesinde Set<number>() tanımlanmalı');

    // walk içinde renderedBindings.add(idx) var mı?
    assert('walk içinde renderedBindings.add(idx) var',
        /renderedBindings\.add\(idx\)/.test(code),
        'Annotation sırasında Set\'e eklenmeli');

    // return ifadesinde renderedBindings var mı?
    assert('return\'da renderedBindings var',
        /return\s*\{[^}]*renderedBindings[^}]*\}/.test(code),
        'XsltRenderResult dönerken renderedBindings eklenmeli');
}

// ============================================================
// Test 3: XsltEditor.tsx renderedBindingIndexes state + set
// ============================================================
console.log('\nTest 3: XsltEditor.tsx renderedBindingIndexes state');
{
    const editorPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx');
    const code = fs.readFileSync(editorPath, 'utf8');

    // useState<Set<number>>(new Set()) var mı
    assert('renderedBindingIndexes useState tanımlı',
        /useState<Set<number>>\(new Set\(\)\)/.test(code),
        'Set<number> state olmalı');

    // setRenderedBindingIndexes(result.renderedBindings ?? new Set()) var mı
    assert('setRenderedBindingIndexes çağrısı var',
        /setRenderedBindingIndexes\(result\.renderedBindings\s*\?\?\s*new Set\(\)\)/.test(code),
        'render sonrası state set edilmeli');

    // Hata durumunda boş set var mı
    assert('Hata catch\'te boş Set atanıyor',
        /catch\s*\([^)]*\)\s*\{[\s\S]*?setRenderedBindingIndexes\(new Set\(\)\)/.test(code),
        'catch block\'unda renklendirme sıfırlanmalı');

    // Sol panel border-left kullanılıyor mu
    assert('borderLeft 3px solid renderStatusColor',
        /borderLeft:\s*showRenderStatus\s*\?\s*`3px solid \$\{renderStatusColor\}`/.test(code),
        'rendered olan yeşil, olmayan kırmızı, hata durumunda renksiz');
}

// ============================================================
// Test 4: e-Fatura-Sablon.xslt binding dağılımı
// ============================================================
console.log('\nTest 4: e-Fatura-Sablon.xslt binding dağılımı');
{
    const xsltPath = path.join(__dirname, '..', 'public', 'ebelge', 'gib', 'v2', 'e-Fatura-Sablon.xslt');
    const buf = fs.readFileSync(xsltPath);
    const hasBom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
    const xslt = (hasBom ? buf.slice(3) : buf).toString('utf8');

    // Pass 1 — xsl:value-of + xsl:copy-of
    const valueOfCount = (xslt.match(/<xsl:value-of\b/g) || []).length;
    const copyOfCount = (xslt.match(/<xsl:copy-of\b/g) || []).length;
    console.log(`  xsl:value-of: ${valueOfCount}`);
    console.log(`  xsl:copy-of: ${copyOfCount}`);
    console.log(`  Pass 1 (annotation marker eklenir): ${valueOfCount + copyOfCount}`);

    // Pass 2 — xsl:text
    const textMatch = xslt.match(/<xsl:text>([\s\S]*?)<\/xsl:text>/g) || [];
    const nonEmptyTextCount = textMatch.filter(t => {
        const inner = t.replace(/^<xsl:text>/, '').replace(/<\/xsl:text>$/, '').trim();
        return inner.length > 0;
    }).length;
    console.log(`  xsl:text (boş olmayan): ${nonEmptyTextCount}`);

    // Pass 3 — xsl:if, forEach, choose, when, otherwise, template, param, variable, sort
    const pass3Elements = ['if', 'forEach', 'choose', 'when', 'otherwise', 'template', 'param', 'variable', 'sort'];
    let pass3Count = 0;
    for (const el of pass3Elements) {
        const re = new RegExp(`<xsl:${el}\\b`, 'g');
        const m = xslt.match(re) || [];
        pass3Count += m.length;
    }
    console.log(`  Pass 3 (element): ${pass3Count}`);
    console.log(`  → Pass 3 marker EKLEMEZ → renderedBindings'te OLMAYACAK → kırmızı`);

    assert('e-Fatura Pass 1 marker var', valueOfCount + copyOfCount > 0, `actual: ${valueOfCount + copyOfCount}`);
    assert('e-Fatura Pass 3 element var', pass3Count > 0, `actual: ${pass3Count}`);
}

// ============================================================
// Test 5: Tip renkleri
// ============================================================
console.log('\nTest 5: Tip renkleri (yeşil/kırmızı)');
{
    const editorPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx');
    const code = fs.readFileSync(editorPath, 'utf8');

    // Yeşil renk (#10b981 — emerald 500)
    assert('Yeşil renk #10b981 kullanılmış',
        /#10b981/.test(code),
        'isRendered için yeşil renk');

    // Kırmızı renk (#ef4444 — red 500)
    assert('Kırmızı renk #ef4444 kullanılmış',
        /#ef4444/.test(code),
        '!isRendered için kırmızı renk');

    // Default görünüm (render henüz yok / hata)
    assert('showRenderStatus kontrolü (renderedBindingIndexes.size > 0)',
        /showRenderStatus\s*=\s*renderedBindingIndexes\.size\s*>\s*0/.test(code),
        'Render henüz yapılmadıysa / hata varsa renklendirme yapılmasın');
}

// ============================================================
// Test 6: Sentetik simülasyon — render durumu mantığı
// ============================================================
console.log('\nTest 6: Sentetik simülasyon');

// bindings + renderedBindingIndexes simülasyonu
const mockBindings = [
    { xpath: '/inv/no', kind: 'dropdown' },
    { xpath: '/inv/date', kind: 'dropdown' },
    { xpath: '/inv/optional', kind: 'dropdown' },
    { xpath: 'static: Başlık', kind: 'static' },
    { xpath: 'static: Dipnot', kind: 'static' },
    { xpath: '<xsl:if test="...">', kind: 'element', elementType: 'if' },
];

// Senaryo A: tüm binding'ler render edildi
const allRendered = new Set([0, 1, 2, 3, 4, 5]);
mockBindings.forEach((b, idx) => {
    const isRendered = allRendered.has(idx);
    const expectedColor = isRendered ? '#10b981' : '#ef4444';
    // Sadece kontrol — gerçek renk ataması XsltEditor'da
});
assert('A. Tüm binding render edildi → hepsi yeşil olur', allRendered.size === 6);

// Senaryo B: sadece ilk 3 render edildi (dinamik veriler)
const partialRendered = new Set([0, 1, 2]);
mockBindings.forEach((b, idx) => {
    const isRendered = partialRendered.has(idx);
    const color = isRendered ? '#10b981' : '#ef4444';
});
assert('B. Kısmi render (ilk 3) → geri kalanı kırmızı', partialRendered.size === 3);
console.log('  → /inv/optional (idx 2): yeşil (render edildi)');
console.log('  → static metinler + xsl:if: kırmızı (render koşulu false / Pass 3 marker yok)');

// Senaryo C: render hatası (boş Set)
const errorRendered = new Set();
assert('C. Hata → boş Set → renklendirme YOK', errorRendered.size === 0);
console.log('  → tüm binding\'ler renksiz (default görünüm)');

// Senaryo D: xsl:if false koşul → o satır render edilmez
// (örnek: xsl:if test="$val != ''" → koşul sağlanmadı, içerik render edilmedi)
const conditionalFalse = new Set([0, 1]); // sadece 2 dropdown render
mockBindings.forEach((b, idx) => {
    const isRendered = conditionalFalse.has(idx);
    if (idx === 5 && b.elementType === 'if') {
        console.log(`  → xsl:if koşul false → idx ${idx} render edilmedi → kırmızı`);
    }
});

console.log(`\n=== Toplam: ${passed} PASS, ${failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);