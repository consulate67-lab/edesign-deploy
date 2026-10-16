/**
 * Sürekli kampanya kuyruğu:
 *  1) OSB rehber turu (bir kez / döngü başı)
 *  2) GİB web enrich partileri
 *  3) Her 500 yeni e-postada CSV üret
 *
 *   node scripts/mukellef/run-campaign.mjs
 *   node scripts/mukellef/run-campaign.mjs --skip-osb
 *   node scripts/mukellef/run-campaign.mjs --gib-limit 100 --batch 500
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb, sleep } from './lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const skipOsb = process.argv.includes('--skip-osb');
const gibLimit = Number(process.argv.includes('--gib-limit') ? process.argv[process.argv.indexOf('--gib-limit') + 1] : 80) || 80;
const batch = Number(process.argv.includes('--batch') ? process.argv[process.argv.indexOf('--batch') + 1] : 500) || 500;
const maxLoops = Number(process.argv.includes('--loops') ? process.argv[process.argv.indexOf('--loops') + 1] : 0) || 0; // 0 = sonsuz

const runNode = (script, args = []) => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, script), ...args], {
        cwd: path.resolve(root, '../..'),
        stdio: 'inherit',
        env: process.env,
    });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} exit ${code}`))));
});

const unexportedCount = () => {
    const db = openDb();
    try {
        return db.prepare(`SELECT COUNT(*) AS c FROM mukellefler WHERE email IS NOT NULL AND (csv_batch IS NULL OR csv_batch = '')`).get().c;
    } finally {
        db.close?.();
    }
};

const maybeExport = async () => {
    const n = unexportedCount();
    console.log(`[kampanya] işaretlenmemiş e-posta: ${n}`);
    if (n >= batch) {
        await runNode('export-csv.mjs', ['--batch', String(batch)]);
        return true;
    }
    return false;
};

let loop = 0;
if (!skipOsb) {
    console.log('[kampanya] OSB turu…');
    try { await runNode('enrich-osb.mjs'); } catch (e) { console.warn('[kampanya] OSB:', e.message); }
    await maybeExport();
}

for (;;) {
    loop++;
    if (maxLoops > 0 && loop > maxLoops) break;
    console.log(`[kampanya] GİB enrich parti #${loop} (limit ${gibLimit})…`);
    try {
        await runNode('enrich-emails.mjs', ['--limit', String(gibLimit), '--delay', '700']);
    } catch (e) {
        console.warn('[kampanya] enrich:', e.message);
    }
    await maybeExport();
    const db = openDb();
    const pending = db.prepare(`SELECT COUNT(*) AS c FROM mukellefler WHERE email IS NULL AND email_status = 'pending'`).get().c;
    db.close?.();
    if (pending === 0) {
        console.log('[kampanya] pending bitti; --retry ile not_found yeniden denenebilir.');
        await maybeExport();
        break;
    }
    await sleep(2000);
}

console.log('[kampanya] bitti.');
