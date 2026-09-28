#!/usr/bin/env node
/**
 * Build-time: public/ebelge/gib/v2/*.xslt → src/designer/v2/utils/xsltDefaults.generated.ts
 *
 * Neden: Vite ?raw import .xslt için Could not resolve hatası veriyor.
 * Bu script build sırasında çalıştırılarak XSLT içeriklerini JS string literal olarak
 * designer/v2/utils/xsltDefaults.generated.ts dosyasına yazar.
 *
 * ÖNEMLİ: Kaynak olarak public/ kullanılır (src/assets/xslt değil) çünkü:
 * - PowerShell Copy-Item UTF-8 dosyaları ANSI olarak kopyalar (double-encoding bug)
 * - public/ zaten git'te tracked, UTF-8 encoding garantili
 * - Tek kaynak — public hem runtime fetch hem build-time embed için kullanılır
 *
 * Build sırası: package.json prebuild hook'unda bu script çalıştırılır.
 *
 * Output: TypeScript template literal ile embedded XSLT string.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'public', 'ebelge', 'gib', 'v2');
const OUT = path.join(__dirname, '..', 'src', 'designer', 'v2', 'utils', 'xsltDefaults.generated.ts');

// Ensure source dir exists
if (!fs.existsSync(SRC)) {
    console.warn('[gen-xslt-defaults] public/ebelge/gib/v2 yok, generated.ts atlanıyor.');
    process.exit(0);
}

const files = fs.readdirSync(SRC).filter(f => f.endsWith('.xslt'));
if (files.length === 0) {
    console.warn('[gen-xslt-defaults] .xslt dosyası bulunamadı.');
    process.exit(0);
}

const out = ['', '// AUTO-GENERATED — bu dosya scripts/gen-xslt-defaults.cjs ile üretilir.', '// Build sırasında package.json prebuild hookunda çalışır. Manuel regenerate için: node scripts/gen-xslt-defaults.cjs', '// Kaynak: public/ebelge/gib/v2/*.xslt (UTF-8)', ''];

for (const file of files) {
    const name = file.replace(/\.xslt$/, '').replace(/-/g, '_');
    // Buffer olarak oku (encoding belirtme!), sonra toString('utf8') ile çöz.
    // Bu PowerShell Copy-Item ANSI-dönüşüm bug'ını bypass eder.
    let content = fs.readFileSync(path.join(SRC, file)).toString('utf8');

    // Phase A.1.3 fix — çift encoding (double-encoding) tespit ve düzelt.
    // Eğer UTF-8 metin ikinci kez UTF-8 olarak kodlanmışsa, "Ã–" "ÃŸ" gibi artifact'lar oluşur.
    // Örnek: "Özelleştirme" → "Ã–zelleÅŸtirme" → düzeltme: latin1->utf8 round-trip.
    if (/Ã[\x80-\xBF]/.test(content) || /Å[\x80-\xBF]/.test(content)) {
        // Tekrar çift decode dene — güvenli (döngüsel algılama yok çünkü 2-kat yeterli)
        try {
            const reDecoded = Buffer.from(content, 'latin1').toString('utf8');
            // Eğer reDecoded içinde daha fazla 'Türkçe karakter yok artifact görünüyorsa kullan
            if (!/Ã[\x80-\xBF]/.test(reDecoded)) {
                console.log(`  [fix] ${file}: çift encoding çözüldü`);
                content = reDecoded;
            }
        } catch (e) {
            // Düzeltme başarısız, orijinal içeriği kullan
        }
    }

    // Template literal escape: backslash + backtick + $
    const escaped = content
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');
    out.push(`export const DEFAULT_XSLT_${name}: string = \`${escaped}\`;`);
    out.push('');
}

out.push('export const DEFAULT_XSLT_PATHS = {');
for (const file of files) {
    const name = file.replace(/\.xslt$/, '').replace(/-/g, '_');
    const camel = name.replace(/_(.)/g, (_, c) => c.toUpperCase());
    out.push(`    ${camel}: \`${file}\`,`);
}
out.push('};');
out.push('');

fs.writeFileSync(OUT, out.join('\n'), 'utf8');
console.log(`[gen-xslt-defaults] Generated: ${path.relative(process.cwd(), OUT)} (${files.length} files)`);

