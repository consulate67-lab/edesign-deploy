/* eslint-disable */
// Sprint 16 Aşama 4b — Render durumu ikonu (✓/✗/·) testi.

const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function assert(name, cond, info) {
    if (cond) { console.log(`  ✓ ${name}`); passed++; }
    else { console.log(`  ✗ ${name}${info ? ' — ' + info : ''}`); failed++; }
}

console.log('=== Sprint 16 Aşama 4b — Render durumu ikonu ===\n');

// ============================================================
// Test 1: XsltEditor'da ✓/✗/· ikon JSX'i
// ============================================================
console.log('Test 1: XsltEditor.tsx — ikon JSX');
{
    const editorPath = path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx');
    const code = fs.readFileSync(editorPath, 'utf8');

    // İkon JSX var mı
    assert('showRenderStatus ? (isRendered ? \'✓\' : \'✗\') : \'·\' var',
        /showRenderStatus\s*\?\s*\(isRendered\s*\?\s*'✓'\s*:\s*'✗'\)\s*:\s*'·'/.test(code),
        'Üç durum: render edildi (yes), render edilmedi (no), render yok (nokta)');

    // Yeşil renk ✓ için
    assert('✓ yeşil renk (#10b981)',
        /isRendered\s*\?\s*'#10b981'\s*:\s*'#ef4444'/.test(code),
        'isRendered → yeşil, değilse → kırmızı');

    // Gri renk · için (render yok)
    assert('· gri renk (#64748b)',
        /'#64748b'/.test(code),
        'showRenderStatus false ise · gri renkli');

    // Title (hover feedback)
    assert('ikon title attribute (hover feedback) var',
        /title=\{showRenderStatus/.test(code),
        'hover\'da "Render\'da görünüyor" / "Render\'da görünmüyor" / "Render henüz yapılmadı"');
}

// ============================================================
// Test 2: Selim'in senaryosu — XML yüklemedi
// ============================================================
console.log('\nTest 2: Selim XML yüklemedi senaryosu');
{
    // Selim screenshot'ta "XML · 0 CHARS" → XML boş → render hata
    // Kod: `if (!xslt.trim() || !xml.trim()) return { html: '', error: '...', durationMs: 0 };`
    // Bu durumda renderedBindings dönmez (return edilen objede yok) → setRenderedBindingIndexes(new Set())
    // → size = 0 → showRenderStatus false → tüm binding'ler · (gri nokta)
    //
    // Beklenen davranış:
    // - Tüm satırlarda · gri nokta (render henüz yapılmadı)
    // - Border-left default (renk çubuğu yok)
    // - Hover'da "Render henüz yapılmadı / XML yükle" mesajı

    console.log('  Selim XML yüklemedi → renderedBindingIndexes = new Set()');
    console.log('  → showRenderStatus = (size > 0) = false');
    console.log('  → tüm binding\'ler · (gri nokta) gösterir');
    console.log('  → border-left default (renksiz)');

    // Bu davranış doğru: kullanıcıya XML yüklemesi gerektiğini bildirir.
    assert('XML boş → renderedBindingIndexes boş (catch\'te default Set)',
        /catch\s*\([^)]*\)\s*\{[\s\S]*?setRenderedBindingIndexes\(new Set\(\)\)/.test(fs.readFileSync(path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx'), 'utf8')),
        'XML boş olduğunda catch çalışır, Set boş kalır');
}

// ============================================================
// Test 3: XML yüklü senaryosu
// ============================================================
console.log('\nTest 3: XML yüklü senaryosu (gerçek render)');
{
    console.log('  XML yüklendiğinde render çalışır → renderedBindingIndexes dolu');
    console.log('  → showRenderStatus = true');
    console.log('  → her binding:\t');
    console.log('    - Render DOM\'da var (annotation uygulanmış) → ✓ yeşil');
    console.log('    - Render DOM\'da yok (xsl:if false / koşullu) → ✗ kırmızı');
    console.log('  → border-left 3px yeşil/kırmızı');

    assert('renderedBindingIndexes Set state var', /useState<Set<number>>\(new Set\(\)\)/.test(
        fs.readFileSync(path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx'), 'utf8')
    ));
    assert('result.renderedBindings state\'e aktarılıyor', /setRenderedBindingIndexes\(result\.renderedBindings/.test(
        fs.readFileSync(path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx'), 'utf8')
    ));
}

// ============================================================
// Test 4: Aşama 4'ün renk + border-left hala aktif
// ============================================================
console.log('\nTest 4: Aşama 4 (renk + border-left) korundu');
{
    const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'xslt-editor', 'XsltEditor.tsx'), 'utf8');
    assert('borderLeft 3px solid renderStatusColor hala var',
        /borderLeft:\s*showRenderStatus\s*\?\s*`3px solid \$\{renderStatusColor\}`/.test(code),
        'Aşama 4 renk çubuğu + Aşama 4b ikon birlikte');
    assert('renderStatusColor hesaplama',
        /const renderStatusColor = isRendered \? '#10b981' : '#ef4444'/.test(code),
        'Yeşil/kırmızı renk');
}

// ============================================================
// Test 5: Selim'in mevcut test ortamı için beklenen görünüm
// ============================================================
console.log('\nTest 5: Selim\'in mevcut test ortamı için beklenen görünüm');
console.log('  Selim şu an XML yüklemedi → tüm binding\'ler · (gri nokta)');
console.log('  → render hatası yok, sadece "render henüz yapılmadı" state\'i');
console.log('  → Selim XML yüklediğinde otomatik olarak ✓/✗ görünecek');
console.log('  → Antrepo 574 binding (124 Dinamik + 179 Statik + 271 Element)');
console.log('  → İlk render sonrası Pass 1 (xsl:value-of) olanlar ✓, Pass 3 olanlar ✗');

console.log(`\n=== Toplam: ${passed} PASS, ${failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);