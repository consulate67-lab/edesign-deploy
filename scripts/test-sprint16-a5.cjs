/* eslint-disable */
// Sprint 16 Aşama 5 — iframe büyütme + en yakın binding scroll.

const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function assert(name, cond, info) {
    if (cond) { console.log(`  ✓ ${name}`); passed++; }
    else { console.log(`  ✗ ${name}${info ? ' — ' + info : ''}`); failed++; }
}

console.log('=== Sprint 16 Aşama 5 — iframe büyütme + nearest binding scroll ===\n');

// ============================================================
// Test 1: iframe style width: 100% + container padding
// ============================================================
console.log('Test 1: iframe style — width: 100%');
{
    const editorPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx');
    const code = fs.readFileSync(editorPath, 'utf8');

    // Eski buggy formula kaldırıldı mı
    assert('Eski buggy formula (100/zoom)*0.95 kaldırıldı',
        !code.includes('(100 / previewZoom) * 0.95'),
        'Sprint 16 Aşama 5a fix — zoom ters mantığı kaldırıldı');

    // Yeni width: 100%
    assert('iframe width: 100%',
        /style=\{\{[\s\S]*?width:\s*'100%'/.test(code),
        'iframe container\'ı tamamen doldurur');

    // maxWidth/minWidth kaldırıldı
    assert('maxWidth kaldırıldı (none)',
        /maxWidth:\s*'none'/.test(code),
        'Büyük container\'larda iframe genişler');

    assert('minWidth: 0 (eski 500px kaldırıldı)',
        /minWidth:\s*'0'/.test(code),
        'Min width constraint kaldırıldı');

    // Container padding azaltıldı
    assert('Container padding azaltıldı (48px 24px → 16px 8px)',
        /padding:\s*'16px 8px'/.test(code),
        'iframe etrafındaki boşluk azaldı — daha geniş görünüm');
}

// ============================================================
// Test 2: handleIframeBodyClick en yakın data-render-index arama
// ============================================================
console.log('\nTest 2: handleIframeBodyClick — nearest binding fallback');
{
    const editorPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx');
    const code = fs.readFileSync(editorPath, 'utf8');

    // Handler içinde parent taraması var mı
    assert('parent taraması (parentElement while loop) var',
        /let p:\s*HTMLElement\s*\|\s*null\s*=\s*target\.parentElement/.test(code),
        'Sprint 16 Aşama 5b — parent\'larda en yakın data-render-index arar');

    // querySelector fallback
    assert('child querySelector fallback var',
        /target\.querySelector\('\[data-render-index\]'\)/.test(code),
        'parent bulunamazsa en yakın child\'a iner');
}

// ============================================================
// Test 3: Sentetik nearest binding simülasyonu
// ============================================================
console.log('\nTest 3: Sentetik nearest binding simülasyonu');

function findNearestLineAttr(target) {
    let lineAttr = target.getAttribute('data-line');
    let colAttr = target.getAttribute('data-column');

    if (!lineAttr || !colAttr) {
        // (1) parent tara
        let p = target.parentElement;
        while (p) {
            const pLine = p.getAttribute('data-line');
            const pCol = p.getAttribute('data-column');
            if (pLine && pCol) {
                lineAttr = pLine; colAttr = pCol;
                break;
            }
            p = p.parentElement;
        }
        // (2) child fallback
        if ((!lineAttr || !colAttr) && typeof target.querySelector === 'function') {
            const child = target.querySelector('[data-render-index]');
            if (child) {
                lineAttr = child.getAttribute('data-line');
                colAttr = child.getAttribute('data-column');
            }
        }
    }
    return { lineAttr, colAttr };
}

class MockEl {
    constructor(tag, attrs = {}, parent = null, children = []) {
        this.tagName = tag.toUpperCase();
        this.attrs = attrs;
        this.parentElement = parent;
        this._children = children;
        // parent'ın child listesine ekle
        if (parent && typeof parent.appendChild === 'function') {
            parent.appendChild(this);
        }
    }
    appendChild(c) { this._children.push(c); c.parentElement = this; }
    getAttribute(name) { return this.attrs[name] ?? null; }
    querySelector(selector) {
        if (selector === '[data-render-index]') {
            for (const c of this._children) {
                if (c.attrs['data-render-index'] !== undefined) return c;
                const found = c.querySelector && c.querySelector(selector);
                if (found) return found;
            }
            return null;
        }
        return null;
    }
}

// Senaryo A — target data-render-index VAR
{
    const root = new MockEl('body', {});
    const span = new MockEl('span', { 'data-render-index': '5', 'data-line': '120', 'data-column': '8' }, root);
    const result = findNearestLineAttr(span);
    assert('A. data-render-index olan span — line 120 kullanılır', result.lineAttr === '120', `actual: ${result.lineAttr}`);
    assert('A. column 8', result.colAttr === '8');
}

// Senaryo B — target statik div, parent'ta data-render-index var
{
    const root = new MockEl('body', {});
    const container = new MockEl('div', { 'data-render-index': '3', 'data-line': '50', 'data-column': '10' }, root);
    const inner = new MockEl('div', {}, container);
    const result = findNearestLineAttr(inner);
    assert('B. inner div statik → parent container line 50', result.lineAttr === '50', `actual: ${result.lineAttr}`);
    assert('B. parent column 10', result.colAttr === '10');
}

// Senaryo C — target statik, parent\'ta yok, child\'da var
{
    const root = new MockEl('body', {});
    const container = new MockEl('div', {}, root);
    const child = new MockEl('span', { 'data-render-index': '7', 'data-line': '200', 'data-column': '15' }, container);
    const result = findNearestLineAttr(container);
    assert('C. container statik → child span line 200', result.lineAttr === '200', `actual: ${result.lineAttr}`);
    assert('C. child column 15', result.colAttr === '15');
}

// Senaryo D — derin parent zincirinde en yakın data-render-index
{
    const root = new MockEl('body', {});
    const container = new MockEl('div', { 'data-render-index': '2', 'data-line': '30', 'data-column': '5' }, root);
    const middle = new MockEl('div', {}, container);
    const inner = new MockEl('p', {}, middle);
    const deep = new MockEl('span', {}, inner);
    const result = findNearestLineAttr(deep);
    assert('D. derin zincir — ilk parent container line 30', result.lineAttr === '30', `actual: ${result.lineAttr}`);
}

// Senaryo E — hiçbir yerde yok
{
    const root = new MockEl('body', {});
    const a = new MockEl('div', {}, root);
    const b = new MockEl('div', {}, a);
    const result = findNearestLineAttr(b);
    assert('E. hiç data-render-index yok → lineAttr null', result.lineAttr === null);
    assert('E. colAttr null', result.colAttr === null);
}

console.log(`\n=== Toplam: ${passed} PASS, ${failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);