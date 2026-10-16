/**
 * GİB e-Fatura kayıtlı kullanıcı (PK / GB) listesini indirir.
 *
 * Kullanım:
 *   node scripts/mukellef/download-gib.mjs
 *   node scripts/mukellef/download-gib.mjs --local D:/indirme/newUserPkListxml.zip
 *   node scripts/mukellef/download-gib.mjs --kind gb
 *
 * Üretim URL'si erişilemezse test uç denenir; yine olmazsa --local ile ZIP verin.
 */
import { copyFileSync, createWriteStream, existsSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import path from 'node:path';
import { ensureDirs, RAW_DIR } from './lib.mjs';

const kind = process.argv.includes('--kind') ? process.argv[process.argv.indexOf('--kind') + 1] : 'pk';
const localIdx = process.argv.indexOf('--local');
const localPath = localIdx >= 0 ? process.argv[localIdx + 1] : null;

const URLS = {
    pk: [
        'https://merkez.gib.gov.tr/EFaturaMerkez/newUserPkListxml.zip',
        'https://merkeztest.gib.gov.tr/EFaturaMerkez/newUserPkListxml.zip',
    ],
    gb: [
        'https://merkez.gib.gov.tr/EFaturaMerkez/newUserGbListxml.zip',
        'https://merkeztest.gib.gov.tr/EFaturaMerkez/newUserGbListxml.zip',
    ],
};

ensureDirs();
const out = path.join(RAW_DIR, kind === 'gb' ? 'gb-users.zip' : 'pk-users.zip');

if (localPath) {
    if (!existsSync(localPath)) throw new Error(`Dosya yok: ${localPath}`);
    copyFileSync(localPath, out);
    console.log(`kopyalandı → ${out}`);
    process.exit(0);
}

const candidates = URLS[kind] || URLS.pk;
let lastErr = null;
for (const url of candidates) {
    console.log('deneniyor:', url);
    try {
        const res = await fetch(url, {
            redirect: 'follow',
            signal: AbortSignal.timeout(600_000),
            headers: { 'User-Agent': 'edxdocu-mukellef/1.0 (liste senkronu; destek@edxdocu.com)' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const type = res.headers.get('content-type') || '';
        if (type.includes('text/html')) throw new Error('HTML döndü (giriş / yönlendirme)');
        await pipeline(Readable.fromWeb(res.body), createWriteStream(out));
        console.log(`indirildi → ${out}`);
        process.exit(0);
    } catch (e) {
        lastErr = e;
        console.warn('  başarısız:', e.message);
    }
}
console.error('İndirilemedi. GİB portalından ZIP alıp şu komutla verin:');
console.error(`  node scripts/mukellef/download-gib.mjs --local "C:\\yol\\newUserPkListxml.zip"`);
throw lastErr ?? new Error('indirilemedi');
