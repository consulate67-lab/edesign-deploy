// Hazır şablonlardan (public/ebelge/hazir/*.xslt) banka/IBAN bloğu içerenleri bulur ve
// src/sector-templates/features.generated.ts dosyasını yazar. Örnek XML'inde banka hesabı
// olmayan şablon önizlemede IBAN göstermediği için sayılmaz. Şablon ekleyince çalıştırın:
//   npm run gen:template-features
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'public', 'ebelge', 'hazir');
const read = (file) => (existsSync(join(dir, file)) ? readFileSync(join(dir, file), 'utf8') : '');
const ACCOUNT_RE = /<cac:PayeeFinancialAccount>\s*<cbc:ID[^>]*>\s*(?!0\s*<)[^<\s][^<]*</;
const bank = readdirSync(dir)
    .filter((f) => f.endsWith('.xslt'))
    .map((f) => f.replace(/\.xslt$/, ''))
    .filter((id) => /cac:PayeeFinancialAccount/.test(read(`${id}.xslt`)) && ACCOUNT_RE.test(read(`${id}.xml`)))
    .sort();

const out = `// scripts/gen-template-features.mjs tarafından üretildi; elle düzenlemeyin.
/** Banka / IBAN bloğu (cac:PayeeFinancialAccount) içeren hazır şablonlar. */
export const BANK_TEMPLATE_IDS: ReadonlySet<string> = new Set([
${bank.map((id) => `    '${id}',`).join('\n')}
]);
`;
writeFileSync(join(process.cwd(), 'src', 'sector-templates', 'features.generated.ts'), out);
console.log(`${bank.length} banka bloklu şablon yazıldı.`);
