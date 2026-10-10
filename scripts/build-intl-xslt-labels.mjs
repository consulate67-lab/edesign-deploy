/**
 * Uluslararası XSLT'lerdeki |dil=metin| etiket satırlarını belge dili paketlerinden
 * yeniden yazar (src/international/docText). Tekrar çalıştırmak güvenlidir.
 *
 *   node scripts/build-intl-xslt-labels.mjs
 *
 * - Belge başlıkları tüm diller için docText/<dil>.ts → titles'tan gelir.
 * - tr/en/de/fr/es diğer etiketleri XSLT'de elle bakılır; ek diller
 *   docText/xslt/<dil>.ts'ten eklenir.
 */
import { build } from 'esbuild';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const UI = ['tr', 'en', 'de', 'fr', 'es'];
const EXTRA = ['it', 'nl', 'pt', 'pl', 'cs', 'sk', 'sl', 'hr', 'hu', 'ro', 'bg', 'el', 'da', 'sv', 'nb', 'fi', 'et', 'lv', 'lt', 'is', 'mt', 'ga', 'ca', 'eu', 'gl'];
const ALL = [...UI, ...EXTRA];

const FILES = [
    { path: 'public/ebelge/intl/en16931-invoice.xslt', section: 'invoice', titles: { invoice: 'invoice', credit: 'credit', corrected: 'corrected', prepayment: 'prepayment', selfbilled: 'selfbilled', partial: 'partial' } },
    { path: 'public/ebelge/intl/peppol-despatch-advice.xslt', section: 'despatch', titles: { title: 'despatch' } },
];

const entry = [
    ...ALL.map((l) => `import p_${l} from './src/international/docText/${l}';`),
    ...EXTRA.map((l) => `import x_${l} from './src/international/docText/xslt/${l}';`),
    `export const packs = { ${ALL.map((l) => `'${l}': p_${l}`).join(', ')} };`,
    `export const xslt = { ${EXTRA.map((l) => `'${l}': x_${l}`).join(', ')} };`,
].join('\n');
const out = 'scripts/.intl-labels.bundle.mjs';
await build({ stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' });
const { packs, xslt } = await import(pathToFileURL(out).href);
rmSync(out);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ROW = /(<xsl:when test="\$k='([A-Za-z0-9]+)'">)\|(.*?)\|(<\/xsl:when>)/g;
const missing = [];

for (const file of FILES) {
    const src = readFileSync(file.path, 'utf8');
    let rows = 0;
    const next = src.replace(ROW, (_, open, key, body, close) => {
        rows++;
        const current = Object.fromEntries(body.split('|').map((pair) => {
            const i = pair.indexOf('=');
            return [pair.slice(0, i), pair.slice(i + 1)];
        }));
        const title = file.titles[key];
        const value = (lang) => {
            if (title) return esc(packs[lang].titles[title]);
            if (UI.includes(lang)) return current[lang];
            const v = xslt[lang][file.section][key];
            if (v === undefined) missing.push(`${file.section}.${key} (${lang})`);
            return v === undefined ? undefined : esc(v);
        };
        const pairs = ALL.map((lang) => [lang, value(lang)]).filter(([, v]) => v);
        return `${open}|${pairs.map(([l, v]) => `${l}=${v}`).join('|')}|${close}`;
    });
    writeFileSync(file.path, next, 'utf8');
    console.log(`${file.path}: ${rows} satır`);
}
if (missing.length) {
    console.error(`Eksik çeviriler (İngilizceye düşer):\n  ${missing.join('\n  ')}`);
    process.exitCode = 1;
}
