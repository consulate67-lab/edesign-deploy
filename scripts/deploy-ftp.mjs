// Builds the frontend for the root of a custom domain and uploads it over FTPS.
// GitHub Pages build (dist/, base /edesign-deploy/) is untouched.
//
// Credentials come from env vars or a gitignored .env.ftp file:
//   FTP_HOST=ftp.example.com
//   FTP_USER=...
//   FTP_PASS=...
//   FTP_DIR=httpdocs
//   FTP_SECURE=0          (only if the host does not support FTPS)
//
// Usage: npm run deploy:web            (build + upload)
//        npm run deploy:web -- --no-build
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'basic-ftp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist-web');

function loadEnvFile(file) {
    if (!existsSync(file)) return;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
        if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
}
loadEnvFile(path.join(root, '.env.ftp'));

const { FTP_HOST, FTP_USER, FTP_PASS } = process.env;
const FTP_DIR = (process.env.FTP_DIR || 'httpdocs').replace(/^\/+|\/+$/g, '');
const FTP_SECURE = process.env.FTP_SECURE !== '0';
if (!FTP_HOST || !FTP_USER || !FTP_PASS) {
    console.error('FTP_HOST / FTP_USER / FTP_PASS eksik (.env.ftp dosyasına yazın).');
    process.exit(1);
}

function run(cmd, args) {
    const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: true });
    if (r.status !== 0) process.exit(r.status ?? 1);
}

if (!process.argv.includes('--no-build')) {
    run('npx', ['tsc', '-p', 'tsconfig.app.json']);
    run('npx', ['vite', 'build', '--base', '/', '--outDir', 'dist-web', '--emptyOutDir']);
}
if (!existsSync(path.join(outDir, 'index.html'))) {
    console.error('dist-web/index.html bulunamadı.');
    process.exit(1);
}

// Hashed assets can be cached forever; index.html must always be revalidated
// so a new deploy is picked up immediately.
writeFileSync(path.join(outDir, '.htaccess'), [
    'Options -Indexes',
    'AddType application/xml .xslt .xsl',
    '<IfModule mod_headers.c>',
    '  <FilesMatch "\\.(html)$">',
    '    Header set Cache-Control "no-cache, no-store, must-revalidate"',
    '  </FilesMatch>',
    '</IfModule>',
    '<IfModule mod_expires.c>',
    '  ExpiresActive On',
    '  ExpiresByType text/javascript "access plus 1 year"',
    '  ExpiresByType application/javascript "access plus 1 year"',
    '  ExpiresByType text/css "access plus 1 year"',
    '</IfModule>',
    '',
].join('\n'));

const client = new Client(60_000);
const connect = () => client.access({
    host: FTP_HOST,
    user: FTP_USER,
    password: FTP_PASS,
    secure: FTP_SECURE,
    // Shared hosting presents the provider's certificate, not ftp.<domain>.
    secureOptions: { rejectUnauthorized: false },
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The host drops long sessions (ECONNRESET / data socket timeout): reconnect and retry the same step. */
async function withRetry(label, fn) {
    for (let attempt = 1; ; attempt++) {
        try {
            if (client.closed) await connect();
            return await fn();
        } catch (err) {
            if (attempt >= 6) throw err;
            console.log(`${label}: ${err.message}, yeniden bağlanılıyor (${attempt})`);
            client.close();
            await sleep(5000 * attempt);
        }
    }
}

let uploaded = 0;
let skipped = 0;
/** Same size and uploaded after the local file changed → already on the server (videos, templates). */
async function syncDir(local, remote, skip = () => false) {
    await withRetry(remote, () => client.ensureDir(remote));
    const existing = new Map((await withRetry(remote, async () => { await client.cd(remote); return client.list(); })).map((f) => [f.name, f]));
    for (const name of readdirSync(local)) {
        if (skip(name)) continue;
        const file = path.join(local, name);
        const st = statSync(file);
        if (st.isDirectory()) { await syncDir(file, `${remote}/${name}`); continue; }
        const r = existing.get(name);
        if (r?.isFile && r.size === st.size && r.modifiedAt && r.modifiedAt >= st.mtime) { skipped++; continue; }
        await withRetry(`${remote}/${name}`, async () => { await client.cd(remote); await client.uploadFrom(file, name); });
        if (++uploaded % 50 === 0) console.log(`yüklenen: ${uploaded}, atlanan: ${skipped}`);
    }
}

try {
    const base = `/${FTP_DIR}`;

    // Upload everything except index.html first, so visitors never load an
    // index.html that points at assets which are not on the server yet.
    await syncDir(outDir, base, (name) => name === 'index.html');
    console.log(`yüklendi: ${uploaded} dosya, değişmediği için atlandı: ${skipped}`);
    await withRetry('index.html', async () => { await client.cd(base); await client.uploadFrom(path.join(outDir, 'index.html'), 'index.html'); });
    console.log('yüklendi: index.html');

    // Drop assets from previous builds.
    const localAssets = new Set(readdirSync(path.join(outDir, 'assets')));
    const remoteAssets = await withRetry('assets', async () => { await client.cd(`${base}/assets`); return client.list(); });
    let removed = 0;
    for (const f of remoteAssets) {
        if (f.isFile && !localAssets.has(f.name)) {
            await withRetry(f.name, async () => { await client.cd(`${base}/assets`); await client.remove(f.name); });
            removed++;
        }
    }
    console.log(`eski dosya silindi: ${removed}`);
    console.log('Yayın tamam.');
} catch (err) {
    console.error('FTP hatası:', err.message);
    process.exitCode = 1;
} finally {
    client.close();
}
