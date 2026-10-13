// Onay e-postaları için PHP köprüsünü kurar (bkz. public/mail-relay.php, server/mail.js).
//
// Gitignored .env.mail dosyası:
//   MAIL_USER=noreply@edxdocu.com
//   MAIL_PASS=...
//   MAIL_SMTP_HOST=smtp.edxdocu.com   (isteğe bağlı)
//   MAIL_SMTP_PORT=587                (isteğe bağlı)
//   MAIL_FROM_NAME=edXdocu            (isteğe bağlı)
//
// Yeni bir köprü anahtarı üretir, edx-mail-config.php dosyasını FTP ile web
// kökünün (FTP_DIR) bir üstüne yükler ve Railway'de MAIL_RELAY_URL /
// MAIL_RELAY_SECRET değişkenlerini ayarlar. Gizli değerleri ekrana yazmaz.
//
// Kullanım: node scripts/setup-mail-relay.mjs [--test alici@ornek.com]
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { Client } from 'basic-ftp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RELAY_URL = 'https://www.edxdocu.com/mail-relay.php';
const SERVICE = 'edesign-deploy';

function loadEnvFile(file) {
    if (!existsSync(file)) return;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
}
loadEnvFile(path.join(root, '.env.ftp'));
loadEnvFile(path.join(root, '.env.mail'));

const { FTP_HOST, FTP_USER, FTP_PASS, MAIL_USER, MAIL_PASS } = process.env;
if (!FTP_HOST || !FTP_USER || !FTP_PASS) throw new Error('.env.ftp eksik.');
if (!MAIL_USER || !MAIL_PASS) throw new Error('.env.mail içinde MAIL_USER ve MAIL_PASS gerekli.');

const php = (v) => `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const secret = randomBytes(32).toString('hex');
const config = `<?php
return [
    'secret' => ${php(secret)},
    'smtp_host' => ${php(process.env.MAIL_SMTP_HOST || 'smtp.edxdocu.com')},
    'smtp_port' => ${Number(process.env.MAIL_SMTP_PORT) || 587},
    'smtp_user' => ${php(MAIL_USER)},
    'smtp_pass' => ${php(MAIL_PASS)},
    'from_name' => ${php(process.env.MAIL_FROM_NAME || 'edXdocu')},
];
`;

const client = new Client(60_000);
try {
    await client.access({
        host: FTP_HOST, user: FTP_USER, password: FTP_PASS,
        secure: process.env.FTP_SECURE !== '0',
        secureOptions: { rejectUnauthorized: false },
    });
    await client.cd('/');
    await client.uploadFrom(Readable.from(Buffer.from(config, 'utf8')), 'edx-mail-config.php');
    console.log('yüklendi: edx-mail-config.php (web kökünün dışında)');
} finally {
    client.close();
}

const r = spawnSync('railway', [
    'variables', '--service', SERVICE, '--skip-deploys',
    '--set', `MAIL_RELAY_URL=${RELAY_URL}`,
    '--set', `MAIL_RELAY_SECRET=${secret}`,
], { cwd: root, shell: true, encoding: 'utf8' });
if (r.status !== 0) throw new Error('Railway değişkenleri ayarlanamadı.');
console.log('Railway: MAIL_RELAY_URL ve MAIL_RELAY_SECRET ayarlandı.');

const testIdx = process.argv.indexOf('--test');
if (testIdx > 0 && process.argv[testIdx + 1]) {
    process.env.MAIL_RELAY_URL = RELAY_URL;
    process.env.MAIL_RELAY_SECRET = secret;
    const { sendMail } = await import('../server/mail.js');
    await sendMail({
        to: process.argv[testIdx + 1],
        subject: 'edXdocu e-posta köprüsü testi',
        text: 'Bu bir deneme iletisidir. Onay e-postaları bu yoldan gönderilecek.',
        html: '<p>Bu bir deneme iletisidir. Onay e-postaları bu yoldan gönderilecek.</p>',
    });
    console.log('Test e-postası gönderildi.');
}
