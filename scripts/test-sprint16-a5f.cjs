/* eslint-disable */
// Sprint 16 Aşama 5f — iframe height 100% + overflow hidden + height-aware fit.

const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function assert(name, cond, info) {
    if (cond) { console.log(`  ✓ ${name}`); passed++; }
    else { console.log(`  ✗ ${name}${info ? ' — ' + info : ''}`); failed++; }
}

console.log('=== Sprint 16 Aşama 5f — iframe scroll kaldırıldı ===\n');

const editorPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx');
const code = fs.readFileSync(editorPath, 'utf8');

// Eski height formülü (content × zoom) kaldırıldı mı
assert('Eski height formülü (iframeContentHeight × previewZoom) kaldırıldı',
    !/height:\s*`\$\{Math\.round\(iframeContentHeight\s*\*\s*previewZoom\)\}px`/.test(code),
    'iframe artık sabit height px kullanmıyor');

// Yeni height: 100% var mı
assert('iframe height: 100% (container\'ı kapla)',
    /height:\s*'100%'/.test(code),
    'iframe container\'ın tüm yüksekliğini kaplar');

// iframe overflow: hidden var mı
assert('iframe overflow: hidden (iframe scroll gizle)',
    /overflow:\s*'hidden'/.test(code),
    'iframe kendi scroll\'unu gizler, container scroll eder');

// Container overflow auto korundu
assert('Container overflow: auto korundu',
    /overflow:\s*'auto'/.test(code),
    'Container scroll eder (iframe büyükse)');

// fitZoomToContainer height-aware
assert('fitZoomToContainer height hesabı var',
    /containerHeight\s*\/\s*contentHeight/.test(code),
    'zoom hem width hem height sığdırır (min)');

assert('fitZoomToContainer Math.min(scaleW, scaleH) kullanıyor',
    /Math\.min\(scaleW,\s*scaleH\)/.test(code),
    'iki eksenli zoom hesaplama');

assert('Min zoom 0.25 (küçük XSLT için)',
    /Math\.max\(0\.25/.test(code),
    'Aşırı zoom-out\'dan kaçınma (0.25 alt)');

console.log(`\n=== Toplam: ${passed} PASS, ${failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);