/* eslint-disable */
// Sprint 16 Aşama 5e — Auto-fit zoom + gerçek fit-to-screen.

const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function assert(name, cond, info) {
    if (cond) { console.log(`  ✓ ${name}`); passed++; }
    else { console.log(`  ✗ ${name}${info ? ' — ' + info : ''}`); failed++; }
}

console.log('=== Sprint 16 Aşama 5e — Auto-fit zoom + gerçek fit-to-screen ===\n');

const editorPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx');
const code = fs.readFileSync(editorPath, 'utf8');

// fitZoomToContainer fonksiyonu var mı
assert('fitZoomToContainer useCallback tanımlı',
    /const fitZoomToContainer = useCallback\(\(\) => \{/.test(code),
    'fitZoomToContainer tanımlı');

// Container / content ölçüm var mı
assert('container.clientWidth ölçümü var',
    /container\.clientWidth/.test(code),
    'container genişlik ölçümü');

// Content width ölçümü var mı
assert('body.scrollWidth ölçümü var',
    /doc\.body\.scrollWidth/.test(code),
    'içerik genişlik ölçümü');

// Min/max clamp var mı
assert('Zoom clamp (0.5 - 2.0) var',
    /Math\.min\(2\.0,\s*Math\.max\(0\.5/.test(code),
    'Aşırı zoom\'dan kaçınma');

// handleIframeLoad auto-fit setTimeout var mı
assert('handleIframeLoad içinde auto-fit setTimeout var',
    /setTimeout\(\(\) => \{[\s\S]*?fitZoomToContainer\(\)[\s\S]*?setPreviewZoom/.test(code),
    'İlk render\'da otomatik fit zoom');

// Fit butonu gerçek fit-to-screen
assert('Fit butonu gerçek fit-to-screen (zoom 1.0 reset değil)',
    /Fit to screen[\s\S]*?fitZoomToContainer\(\)[\s\S]*?setPreviewZoom\(zoom\)/.test(code)
        || /onClick=\{\(\) => \{[\s\S]*?const zoom = fitZoomToContainer/.test(code),
    'Fit butonu container\'a sığacak zoom hesaplar');

assert('Eski "Default zoom (100%)" title kaldırıldı',
    !/Default zoom \(100%\)/.test(code),
    'Fit butonu title güncellendi');

// fitZoomToContainer handleIframeLoad dependency'de
assert('fitZoomToContainer handleIframeLoad dependency\'de',
    /}, \[handleIframeBodyClick, fitZoomToContainer\]\);/.test(code),
    'handleIframeLoad fitZoomToContainer dependency\'de');

console.log(`\n=== Toplam: ${passed} PASS, ${failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);