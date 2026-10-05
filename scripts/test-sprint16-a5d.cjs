/* eslint-disable */
// Sprint 16 Aşama 5d — Monaco editör kaldırıldı, layout 2-kolon.

const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function assert(name, cond, info) {
    if (cond) { console.log(`  ✓ ${name}`); passed++; }
    else { console.log(`  ✗ ${name}${info ? ' — ' + info : ''}`); failed++; }
}

console.log('=== Sprint 16 Aşama 5d — Monaco kaldır + 2-kolon grid ===\n');

const editorPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx');
const code = fs.readFileSync(editorPath, 'utf8');

// 3-kolon → 2-kolon
assert('Grid 3-kolon (snippet | Monaco | Preview) kaldırıldı',
    !/240px 1fr 1fr/.test(code),
    'Eski 3-kolonlu grid kaldırıldı');

assert('Grid 2-kolon (snippet | Preview 1fr) eklendi',
    /240px 1fr/.test(code) && !/240px 1fr 1fr/.test(code) && !/0px 1fr 1fr/.test(code),
    'Yeni: snippetPanelOpen ? \'240px 1fr\' : \'0px 1fr\'');

// Monaco Editor component kaldırıldı
assert('Monaco Editor JSX (onMount) kaldırıldı',
    !/<Editor\s+height="100%"/.test(code),
    'Monaco editör div\'i kaldırıldı — preview tüm alanı kaplar');

assert('Sekme header (activeTab xslt/xml) kaldırıldı',
    !/\(\['xslt', 'xml'\] as const\)\.map\(tab/.test(code),
    'xslt/xml tab header kaldırıldı');

// iframe + preview header korundu
assert('Preview header (Canlı Önizleme) korundu',
    /Canlı Önizleme/.test(code),
    'Preview header\'ı (zoom butonları, render duration) korundu');

assert('iframe render var',
    /<iframe[\s\S]*?ref=\{iframeRef\}/.test(code),
    'Preview iframe hâlâ render ediliyor');

// Property drawer overlay korunmuş
assert('Property drawer position: absolute right:0 korunmuş',
    /data-property-drawer[\s\S]*?position:\s*'absolute'[\s\S]*?right:\s*0/.test(code),
    'Drawer overlay (Sprint 14 A2) korundu');

assert('Drawer slide-in animasyonu (translateX) korunmuş',
    /transform:\s*selectedObject\s*\?\s*'translateX\(0\)'\s*:\s*'translateX\(100%\)'/.test(code),
    'Drawer slide-in animasyonu korundu');

// xsltContent state korunmuş (render için gerekli)
assert('xsltContent state korunmuş',
    /useState.*xsltContent|xsltContent.*=.*useState/.test(code),
    'xsltContent render için gerekli, state korundu');

console.log(`\n=== Toplam: ${passed} PASS, ${failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);