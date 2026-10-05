/* eslint-disable */
// Sprint 16 Aşama 5c — Container background/padding kaldırıldı.

const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function assert(name, cond, info) {
    if (cond) { console.log(`  ✓ ${name}`); passed++; }
    else { console.log(`  ✗ ${name}${info ? ' — ' + info : ''}`); failed++; }
}

console.log('=== Sprint 16 Aşama 5c — iframe container background/padding kaldır ===\n');

const editorPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx');
const code = fs.readFileSync(editorPath, 'utf8');

// Eski kırmızı-gri boş alan kaldırıldı mı
assert('Eski background #475569 kaldırıldı',
    !/background:\s*'#475569'/.test(code),
    'Preview container gri zemini kaldırıldı');

assert('Eski radial-gradient kaldırıldı',
    !/backgroundImage:\s*'radial-gradient/.test(code),
    'Vignette gradient kaldırıldı');

assert('Eski padding 16px 8px kaldırıldı',
    !/padding:\s*'16px 8px'/.test(code),
    'iframe etrafındaki padding kaldırıldı');

// Yeni background transparent
assert('Container background: transparent',
    /background:\s*'transparent'/.test(code),
    'iframe etrafındaki container transparan — ana panel bg görünür');

// Yeni padding: 0
assert('Container padding: 0',
    /padding:\s*0,?\s*\}/.test(code) || /padding:\s*0$/.test(code),
    'iframe etrafında padding yok');

// iframe margin auto kaldırıldı
assert('iframe margin: 0 (auto kaldırıldı)',
    /margin:\s*'0'/.test(code) && !/margin:\s*'0 auto'/.test(code),
    'iframe sol yaslı (auto kaldırıldı)');

// iframe width: 100% (Aşama 5a korunmuş)
assert('iframe width: 100% korundu',
    /width:\s*'100%'/.test(code),
    'Aşama 5a değişikliği korundu');

// iframe height zoom scaling korundu
assert('iframe height zoom scaling korundu',
    /Math\.round\(iframeContentHeight\s*\*\s*previewZoom\)/.test(code),
    'Aşama 5a height scaling korundu');

console.log(`\n=== Toplam: ${passed} PASS, ${failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);