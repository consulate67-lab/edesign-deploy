/**
 * Bulunan iş e-postalarını BulkMail CSV formatında yazar.
 *
 *   node scripts/mukellef/export-csv.mjs
 *   node scripts/mukellef/export-csv.mjs --limit 500 --out data/mukellef/batch-1.csv
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { DATA_DIR, ensureDirs, openDb } from './lib.mjs';

const limit = Number(process.argv.includes('--limit') ? process.argv[process.argv.indexOf('--limit') + 1] : 0) || 0;
const outArg = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : null;

ensureDirs();
const db = openDb();
const sql = `
    SELECT unvan AS firma, email
    FROM mukellefler
    WHERE email IS NOT NULL AND email_status = 'found'
    ORDER BY enriched_at DESC, vkn
    ${limit > 0 ? `LIMIT ${Math.min(limit, 50_000)}` : ''}
`;
const rows = db.prepare(sql).all();

const esc = (s) => {
    const t = String(s ?? '').replace(/"/g, '""');
    return /[",\n\r]/.test(t) ? `"${t}"` : t;
};

const lines = ['Firma,E-Posta', ...rows.map((r) => `${esc(r.firma)},${esc(r.email)}`)];
const out = outArg || path.join(DATA_DIR, `alici-${new Date().toISOString().slice(0, 10)}.csv`);
writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`${rows.length} alıcı → ${out}`);
console.log('Yönetim paneli → Toplu e-posta → broşür “Türkçe · firma” → bu CSV’yi yükleyin.');
