#!/usr/bin/env node
/**
 * Build-time: src/assets/xslt/*.xslt → src/designer/v2/utils/xsltDefaults.generated.ts
 *
 * Neden: Vite ?raw import .xslt için Could not resolve hatası veriyor.
 * Bu script build sırasında çalıştırılarak XSLT içeriklerini JS string literal olarak
 * designer/v2/utils/xsltDefaults.generated.ts dosyasına yazar.
 *
 * Build sırası: package.json prebuild hook'unda bu script çalıştırılır.
 *
 * Output: TypeScript template literal ile embedded XSLT string.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'assets', 'xslt');
const OUT = path.join(__dirname, '..', 'src', 'designer', 'v2', 'utils', 'xsltDefaults.generated.ts');

// Ensure source dir exists
if (!fs.existsSync(SRC)) {
    console.warn('[gen-xslt-defaults] src/assets/xslt yok, generated.ts atlanıyor.');
    process.exit(0);
}

const files = fs.readdirSync(SRC).filter(f => f.endsWith('.xslt'));
if (files.length === 0) {
    console.warn('[gen-xslt-defaults] .xslt dosyası bulunamadı.');
    process.exit(0);
}

const out = ['', '// AUTO-GENERATED — bu dosya scripts/gen-xslt-defaults.js ile üretilir.', '// Build sırasında package.json prebuild hookunda çalışır. Manuel regenerate için: node scripts/gen-xslt-defaults.js', ''];

for (const file of files) {
    const name = file.replace(/\.xslt$/, '').replace(/-/g, '_');
    const content = fs.readFileSync(path.join(SRC, file), 'utf8');
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
