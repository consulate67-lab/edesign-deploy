/* eslint-disable */
// Sprint 16 Aşama 3 — Preview click tüm elementlere tıklama testi.

const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function assert(name, cond, info) {
    if (cond) { console.log(`  ✓ ${name}`); passed++; }
    else { console.log(`  ✗ ${name}${info ? ' — ' + info : ''}`); failed++; }
}

console.log('=== Sprint 16 Aşama 3 — Preview click tüm elementlere tıklama ===\n');

// ============================================================
// Test 1: handleIframeBodyClick kodu closest fallback içeriyor mu
// ============================================================
console.log('Test 1: handleIframeBodyClick kod analizi');
{
    const editorPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx');
    const editorCode = fs.readFileSync(editorPath, 'utf8');

    // handleIframeBodyClick fonksiyonunu bul
    const handlerMatch = editorCode.match(/const handleIframeBodyClick = useCallback\(([\s\S]*?)\}, \[\]\);/);
    assert('handleIframeBodyClick tanımlı', !!handlerMatch);

    if (handlerMatch) {
        const handlerCode = handlerMatch[1];
        // Sprint 16 Aşama 3 fix — closest || target fallback
        assert('closest fallback kullanılıyor (closest || target)', /closest\('\[\s*data-render-index\s*\]'\)[^;]*\|\|\s*target/.test(handlerCode),
            'Önceki kodda sadece closest vardı, return null ile çıkıyordu. Yeni kodda closest || target olmalı.');
        // Eski "if (!indexedEl) return" çağrısı kaldırıldı mı?
        assert('eski "if (!indexedEl) return" kaldırıldı (Sprint 16 A3)', !handlerCode.includes('if (!indexedEl) return'),
            'Artık indexedEl her zaman tanımlı (closest || target).');
    }
}

// ============================================================
// Test 2: renderAndAnnotateXslt annotationCss tüm elementlere cursor:pointer içeriyor mu
// ============================================================
console.log('\nTest 2: annotationCss tüm elementlere cursor:pointer');
{
    const xsltRenderPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'utils', 'xsltRender.ts');
    const xsltRenderCode = fs.readFileSync(xsltRenderPath, 'utf8');

    // annotationCss bloğunu bul
    const cssMatch = xsltRenderCode.match(/const annotationCss = `([\s\S]*?)`;/);
    assert('annotationCss bloğu bulundu', !!cssMatch);

    if (cssMatch) {
        const css = cssMatch[1];

        // Mevcut data-render-index kuralları korunmuş mu
        assert('[data-render-index] outline var', css.includes('[data-render-index]') && css.includes('outline: 2px solid rgba(99, 102, 241, 0.5)'),
            'mevcut kurallar korunmalı');
        assert('[data-render-index]:hover ::after rozet var', css.includes('[data-render-index]:hover::after') && css.includes('content: attr(data-bind-index)'),
            'mevcut BIND_X rozeti korunmalı');
        assert('[data-xpath-active] vurgu korunmuş', css.includes('[data-xpath-active="true"]'),
            'mevcut active xpath highlight korunmalı');

        // Yeni Sprint 16 Aşama 3 kuralları
        assert('div, span, p, table, tr, td, th, h1-h6, img, a cursor:pointer var',
            /div,\s*span,\s*p,\s*table,\s*tr,\s*td,\s*th,\s*h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6,\s*img,\s*a\s*{[^}]*cursor:\s*pointer/s.test(css),
            'INDEXED_TAGS listesindeki tüm tag\'ler cursor:pointer olmalı');

        assert('data-render-index olmayan elementler için hover bg-color var',
            /:not\(\[data-render-index\]\):hover/.test(css),
            'hover\'da hafif bg (rgba 0.04) olmalı');
    }
}

// ============================================================
// Test 3: e-Fatura-Sablon.xslt üzerinde annotation marker sayısı + element sayısı
// ============================================================
console.log('\nTest 3: Gerçek XSLT — annotation marker oranı');
{
    const xsltPath = path.join(__dirname, '..', 'public', 'ebelge', 'gib', 'v2', 'e-Fatura-Sablon.xslt');
    const buf = fs.readFileSync(xsltPath);
    const hasBom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
    const xslt = (hasBom ? buf.slice(3) : buf).toString('utf8');

    // INDEXED_TAGS listesindeki HTML elementleri say
    const INDEXED = ['div', 'span', 'p', 'table', 'tr', 'td', 'th', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'a'];
    let totalElements = 0;
    for (const tag of INDEXED) {
        const re = new RegExp(`<${tag}[\\s>]`, 'g');
        const matches = xslt.match(re) || [];
        totalElements += matches.length;
        console.log(`  ${tag}: ${matches.length}`);
    }
    console.log(`  TOPLAM INTERACTIVE element: ${totalElements}`);

    // Annotation marker sayısı (Pass 1 — xsl:value-of/copy-of)
    // Pass 1 her xsl:value-of kapanışından sonra <!--BIND_X--> marker ekler
    const pass1Count = (xslt.match(/<xsl:(?:value-of|copy-of)\b/g) || []).length;
    console.log(`  Pass 1 (xsl:value-of/copy-of) marker sayısı: ${pass1Count}`);

    const coverage = totalElements > 0 ? (pass1Count / totalElements * 100) : 0;
    console.log(`  Annotation coverage: %${coverage.toFixed(2)} (${pass1Count}/${totalElements})`);

    assert('Pass 1 marker var', pass1Count > 0, `actual: ${pass1Count}`);
    assert('Coverage %100\'den az (annotation sadece xsl:value-of bağlantılı)',
        coverage < 100,
        'Bu yüzden data-render-index olmayan elementlere de tıklama desteği lazım');
    assert('En az 30 Pass 1 marker var (e-Fatura zengin)', pass1Count >= 30, `actual: ${pass1Count}`);
}

// ============================================================
// Test 4: Antrepo XSLT — dosya varlığı ve external import
// ============================================================
console.log('\nTest 4: Antrepo XSLT — dosya varlığı');
{
    const anrepoPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'antrepoTemplates.ts');
    const exists = fs.existsSync(anrepoPath);
    assert('antrepoTemplates.ts mevcut', exists);
    if (exists) {
        const stat = fs.statSync(anrepoPath);
        console.log(`  Antrepo şablon dosyası: ${(stat.size / 1024).toFixed(1)} KB`);
        // Antrepo external URL'den (?raw) import edilir → dosya sadece import ifadesi içerir
        const code = fs.readFileSync(anrepoPath, 'utf8');
        const hasRawImport = /\?raw/.test(code) || /import.*antrepo/i.test(code);
        assert('Antrepo external URL\'den import edilmiş (?raw)', hasRawImport,
            'Dosya sadece import ifadesi içeriyor, gerçek XSLT runtime\'da yüklenir');
    }
}

// ============================================================
// Test 5: handleIframeBodyClick sentetik simülasyon — closest fallback
// ============================================================
console.log('\nTest 5: handleIframeBodyClick sentetik simülasyon (closest fallback)');

// handleIframeBodyClick mantığını kopyala ve sentetik DOM ile test et
function simulateClick(target, indexedAttribute) {
    // Gerçek kodu simüle et
    const indexedEl = target.closest('[data-render-index]') || target;
    const lineAttr = indexedEl.getAttribute('data-line');
    const colAttr = indexedEl.getAttribute('data-column');
    const renderIndex = indexedEl.getAttribute('data-render-index');
    let line = NaN, column = NaN;
    if (lineAttr && colAttr) {
        line = Number(lineAttr);
        column = Number(colAttr);
    }
    return { indexedEl, line, column, renderIndex };
}

// Mock HTMLElement
class MockEl {
    constructor(tag, attrs = {}) {
        this.tagName = tag.toUpperCase();
        this.attrs = attrs;
    }
    getAttribute(name) {
        return this.attrs[name] ?? null;
    }
    closest(selector) {
        // Sprint 16 Aşama 3 — gerçek kod: closest('[data-render-index]') || target
        // Burada sadece self kontrolü (parent yok)
        if (selector === '[data-render-index]') {
            if (this.attrs['data-render-index'] !== undefined) return this;
            return null;
        }
        return null;
    }
}

// Senaryo A — data-render-index VAR (örn. xsl:value-of sonucu)
{
    const target = new MockEl('span', {
        'data-render-index': '5',
        'data-line': '120',
        'data-column': '8',
    });
    const result = simulateClick(target);
    assert('A. data-render-index olan element handle edildi', result.indexedEl === target);
    assert('A. line doğru', result.line === 120, `actual: ${result.line}`);
    assert('A. column doğru', result.column === 8, `actual: ${result.column}`);
    assert('A. renderIndex "5"', result.renderIndex === '5');
}

// Senaryo B — data-render-index YOK (statik container, table cell, başlık)
{
    const target = new MockEl('div', { 'class': 'container' });
    const result = simulateClick(target);
    assert('B. data-render-index olmayan element de handle edildi', result.indexedEl === target);
    assert('B. line NaN (XSLT bağlantısı yok)', isNaN(result.line));
    assert('B. column NaN', isNaN(result.column));
    assert('B. renderIndex null', result.renderIndex === null);
}

// Senaryo C — table td (en yaygın tıklanamayan element türü)
{
    const target = new MockEl('td', {});
    const result = simulateClick(target);
    assert('C. td tıklanabilir', result.indexedEl === target);
    assert('C. XSLT bağlantısı yok', isNaN(result.line) && result.renderIndex === null);
}

// Senaryo D — img (input/image)
{
    const target = new MockEl('img', { src: 'logo.png' });
    const result = simulateClick(target);
    assert('D. img tıklanabilir', result.indexedEl === target);
}

console.log(`\n=== Toplam: ${passed} PASS, ${failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);