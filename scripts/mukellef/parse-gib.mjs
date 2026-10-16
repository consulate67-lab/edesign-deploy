/**
 * İndirilen GİB ZIP içindeki XML'i okuyup SQLite'a yazar (yalnız 10 haneli VKN).
 *
 *   node scripts/mukellef/parse-gib.mjs
 *   node scripts/mukellef/parse-gib.mjs --zip data/mukellef/raw/pk-users.zip --kind pk
 */
import { createReadStream, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { DB_PATH, RAW_DIR, ensureDirs, isCorporateVkn, openDb } from './lib.mjs';

const zipArg = process.argv.includes('--zip') ? process.argv[process.argv.indexOf('--zip') + 1] : null;
const kind = process.argv.includes('--kind') ? process.argv[process.argv.indexOf('--kind') + 1] : 'pk';
const zipPath = zipArg || path.join(RAW_DIR, kind === 'gb' ? 'gb-users.zip' : 'pk-users.zip');

if (!existsSync(zipPath)) {
    console.error(`ZIP yok: ${zipPath}\nÖnce: node scripts/mukellef/download-gib.mjs`);
    process.exit(1);
}

ensureDirs();
const extractDir = path.join(RAW_DIR, `_extract_${kind}`);
rmSync(extractDir, { recursive: true, force: true });
mkdirSync(extractDir, { recursive: true });

console.log('açılıyor:', zipPath);
try {
    execFileSync('tar', ['-xf', zipPath, '-C', extractDir], { stdio: 'inherit' });
} catch {
    execFileSync('powershell', ['-NoProfile', '-Command', `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${extractDir.replace(/'/g, "''")}' -Force`], { stdio: 'inherit' });
}

const findXml = (dir) => {
    const out = [];
    for (const name of readdirSync(dir)) {
        const p = path.join(dir, name);
        if (statSync(p).isDirectory()) out.push(...findXml(p));
        else if (/\.xml$/i.test(name)) out.push(p);
    }
    return out;
};
const xmlFiles = findXml(extractDir);
if (!xmlFiles.length) throw new Error('ZIP içinde XML bulunamadı.');
console.log('XML:', xmlFiles.map((f) => path.basename(f)).join(', '));

const tag = (name, block) => {
    const m = new RegExp(`<${name}[^>]*>([^<]*)</${name}>`, 'i').exec(block);
    return m ? m[1].trim() : '';
};

const db = openDb();
const upsert = db.prepare(`
    INSERT INTO mukellefler (vkn, unvan, alias, first_creation, unit, kind, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(vkn) DO UPDATE SET
        unvan = excluded.unvan,
        alias = COALESCE(excluded.alias, mukellefler.alias),
        first_creation = COALESCE(excluded.first_creation, mukellefler.first_creation),
        unit = COALESCE(excluded.unit, mukellefler.unit),
        kind = excluded.kind,
        updated_at = datetime('now')
`);

let inserted = 0;
let skippedPerson = 0;
let buffer = '';
const flushUser = (block) => {
    const id = tag('Identifier', block) || tag('identifier', block);
    if (!id) return;
    if (!isCorporateVkn(id)) { skippedPerson++; return; }
    const unvan = tag('Title', block) || tag('title', block) || '';
    const alias = tag('Alias', block) || tag('alias', block) || null;
    const first = tag('FirstCreationTime', block) || tag('firstCreationTime', block) || null;
    const unit = tag('Unit', block) || tag('Type', block) || null;
    upsert.run(id, unvan, alias, first, unit, kind);
    inserted++;
    if (inserted % 50_000 === 0) console.log(`  … ${inserted.toLocaleString('tr-TR')} tüzel kişi`);
};

db.exec('BEGIN');
for (const xmlPath of xmlFiles) {
    console.log('okunuyor:', path.basename(xmlPath));
    const rl = createInterface({ input: createReadStream(xmlPath, { encoding: 'utf8' }), crlfDelay: Infinity });
    for await (const line of rl) {
        buffer += line;
        // Kullanıcı bloklarını ayır (User / user / Kullanici)
        let start;
        while ((start = buffer.search(/<(User|user|Kullanici)\b/i)) >= 0) {
            const open = buffer.slice(start).match(/^<(User|user|Kullanici)\b[^>]*>/i)?.[0];
            if (!open) break;
            const tagName = open.match(/^<\/?(\w+)/)?.[1];
            const closeRe = new RegExp(`</${tagName}\\s*>`, 'i');
            const rest = buffer.slice(start);
            const closeIdx = rest.search(closeRe);
            if (closeIdx < 0) {
                // kapanış yok; taşmayı sınırla
                if (buffer.length > 2_000_000) buffer = buffer.slice(-500_000);
                break;
            }
            const end = start + closeIdx + rest.match(closeRe)[0].length;
            flushUser(buffer.slice(start, end));
            buffer = buffer.slice(end);
        }
        if (buffer.length > 1_000_000) buffer = buffer.slice(-200_000);
    }
}
db.exec('COMMIT');

const { count } = db.prepare('SELECT COUNT(*) AS count FROM mukellefler').get();
console.log(`bitti. eklenen/güncellenen bu tur: ${inserted.toLocaleString('tr-TR')}`);
console.log(`atlanılan TCKN / geçersiz: ${skippedPerson.toLocaleString('tr-TR')}`);
console.log(`toplam tüzel kişi DB: ${count.toLocaleString('tr-TR')} → ${DB_PATH}`);
rmSync(extractDir, { recursive: true, force: true });
