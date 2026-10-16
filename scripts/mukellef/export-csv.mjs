/**
 * Bulunan iş e-postalarını BulkMail CSV formatında yazar.
 *
 *   node scripts/mukellef/export-csv.mjs
 *   node scripts/mukellef/export-csv.mjs --limit 500
 *   node scripts/mukellef/export-csv.mjs --batch 500   # henüz export edilmemişlerden 500; batch işaretler
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { DATA_DIR, ensureDirs, openDb } from './lib.mjs';

const limit = Number(process.argv.includes('--limit') ? process.argv[process.argv.indexOf('--limit') + 1] : 0) || 0;
const batchSize = Number(process.argv.includes('--batch') ? process.argv[process.argv.indexOf('--batch') + 1] : 0) || 0;
const outArg = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : null;
const mark = process.argv.includes('--batch') || process.argv.includes('--mark');

ensureDirs();
const db = openDb();

const take = batchSize > 0 ? Math.min(batchSize, 50_000) : (limit > 0 ? Math.min(limit, 50_000) : 0);
const where = batchSize > 0
    ? `email IS NOT NULL AND email_status = 'found' AND (csv_batch IS NULL OR csv_batch = '')`
    : `email IS NOT NULL AND email_status = 'found'`;

const sql = `
    SELECT vkn, unvan AS firma, email
    FROM mukellefler
    WHERE ${where}
    ORDER BY enriched_at ASC, vkn
    ${take > 0 ? `LIMIT ${take}` : ''}
`;
const rows = db.prepare(sql).all();

if (!rows.length) {
    const total = db.prepare(`SELECT COUNT(*) AS c FROM mukellefler WHERE email IS NOT NULL`).get().c;
    const pending = db.prepare(`SELECT COUNT(*) AS c FROM mukellefler WHERE email IS NOT NULL AND (csv_batch IS NULL OR csv_batch = '')`).get().c;
    console.log(`Dışa aktarılacak satır yok (e-postalı ${total}, henüz işaretlenmemiş ${pending}).`);
    process.exit(0);
}

const esc = (s) => {
    const t = String(s ?? '').replace(/"/g, '""');
    return /[",\n\r]/.test(t) ? `"${t}"` : t;
};

const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
const batchName = `batch-${stamp}`;
const lines = ['Firma,E-Posta', ...rows.map((r) => `${esc(r.firma)},${esc(r.email)}`)];
const out = outArg || path.join(DATA_DIR, `${batchName}.csv`);
writeFileSync(out, lines.join('\n'), 'utf8');

if (mark || batchSize > 0) {
    const upd = db.prepare(`UPDATE mukellefler SET csv_batch = ? WHERE vkn = ?`);
    const tx = db.transaction((list) => {
        for (const r of list) upd.run(batchName, r.vkn);
    });
    tx(rows);
}

const left = db.prepare(`SELECT COUNT(*) AS c FROM mukellefler WHERE email IS NOT NULL AND (csv_batch IS NULL OR csv_batch = '')`).get().c;
console.log(`${rows.length} alıcı → ${out}${mark || batchSize > 0 ? ` (işaret: ${batchName})` : ''}`);
console.log(`Kalan işaretlenmemiş: ${left}`);
console.log('Yönetim paneli → Toplu e-posta → broşür “Türkçe · firma” → bu CSV’yi yükleyin.');
