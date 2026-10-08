// Builds the frontend for the root of a custom domain and uploads it over FTPS.
// GitHub Pages build (dist/, base /edesign-deploy/) is untouched.
//
// Credentials come from env vars or a gitignored .env.ftp file:
//   FTP_HOST=ftp.example.com
//   FTP_USER=...
//   FTP_PASS=...
//   FTP_DIR=httpdocs
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
try {
    await client.access({
        host: FTP_HOST,
        user: FTP_USER,
        password: FTP_PASS,
        secure: true,
        // Shared hosting presents the provider's certificate, not ftp.<domain>.
        secureOptions: { rejectUnauthorized: false },
    });
    const base = `/${FTP_DIR}`;

    // Upload everything except index.html first, so visitors never load an
    // index.html that points at assets which are not on the server yet.
    for (const name of readdirSync(outDir)) {
        if (name === 'index.html') continue;
        const local = path.join(outDir, name);
        await client.cd('/');
        if (statSync(local).isDirectory()) {
            await client.ensureDir(`${base}/${name}`);
            await client.uploadFromDir(local);
        } else {
            await client.cd(base);
            await client.uploadFrom(local, name);
        }
        console.log(`yüklendi: ${name}`);
    }
    await client.cd(base);
    await client.uploadFrom(path.join(outDir, 'index.html'), 'index.html');
    console.log('yüklendi: index.html');

    // Drop assets from previous builds.
    const localAssets = new Set(readdirSync(path.join(outDir, 'assets')));
    await client.cd(`${base}/assets`);
    let removed = 0;
    for (const f of await client.list()) {
        if (f.isFile && !localAssets.has(f.name)) {
            await client.remove(f.name);
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
