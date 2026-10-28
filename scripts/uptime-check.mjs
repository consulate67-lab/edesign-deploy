/**
 * Site / API ayakta mı diye bakar. Düşerse Telegram'a yazar (varsa).
 * Kullanım: node scripts/uptime-check.mjs
 * Ortam: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (veya .env / Railway vars)
 *
 * Öneri: harici cron (her 5 dk) veya GitHub Actions schedule.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['.env', '.env.production']) {
    const p = path.join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
        if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
}

const targets = [
    { name: 'web', url: 'https://www.edxdocu.com/', ok: (s) => s === 200 },
    { name: 'api', url: 'https://edesign-deploy-production.up.railway.app/api/health', ok: (s, body) => s === 200 && /"status"\s*:\s*"ok"/.test(body) },
];

const timeoutMs = 20_000;

const check = async ({ name, url, ok }) => {
    const started = Date.now();
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), redirect: 'follow' });
        const body = await res.text();
        const pass = ok(res.status, body);
        return { name, url, pass, status: res.status, ms: Date.now() - started, detail: pass ? 'ok' : body.slice(0, 160) };
    } catch (e) {
        return { name, url, pass: false, status: 0, ms: Date.now() - started, detail: e.message };
    }
};

const notify = async (text) => {
    const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
    const chat = (process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID || '').trim();
    if (!token || !chat) {
        console.log('[uptime] Telegram yok — yalnız konsol:', text);
        return;
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    });
    if (!res.ok) console.error('[uptime] Telegram hata:', await res.text());
};

const results = [];
for (const t of targets) results.push(await check(t));

for (const r of results) {
    console.log(`${r.pass ? 'OK' : 'FAIL'} ${r.name} ${r.status} ${r.ms}ms ${r.url}${r.pass ? '' : ` — ${r.detail}`}`);
}

const failed = results.filter((r) => !r.pass);
if (failed.length) {
    await notify(
        `edXdocu uptime FAIL\n` +
        failed.map((r) => `• ${r.name}: HTTP ${r.status || '—'} (${r.ms}ms)\n  ${r.url}\n  ${r.detail}`).join('\n')
    );
    process.exitCode = 1;
} else {
    console.log('[uptime] hepsi ayakta');
}
