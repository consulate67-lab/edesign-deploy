/**
 * Bing / Yandex / IndexNow ortak protokolü: yayın sonrası URL’leri anında bildirir.
 * Anahtar dosyası sitede açık olmalı: /{key}.txt
 *
 * Kullanım:
 *   node scripts/indexnow.mjs
 *   node scripts/indexnow.mjs https://www.edxdocu.com/rehber/
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KEY = 'a7f3c91e2b4d6e8f0a1b2c3d4e5f6789';
const HOST = 'www.edxdocu.com';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const fromSitemap = () => {
    const file = path.join(root, 'public', 'sitemap.xml');
    if (!existsSync(file)) return [`https://${HOST}/`];
    const xml = readFileSync(file, 'utf8');
    const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1].trim());
    return [...new Set(urls)].slice(0, 10_000);
};

const urls = process.argv.slice(2).filter((u) => /^https:\/\//i.test(u));
const list = urls.length ? urls : fromSitemap();

const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: list,
};

const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
];

let ok = 0;
for (const endpoint of endpoints) {
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(20_000),
        });
        // 200 / 202 kabul; 422 anahtar dosyası henüz yayında değil demektir.
        console.log(`IndexNow ${endpoint}: HTTP ${res.status}`);
        if (res.status === 200 || res.status === 202) ok++;
    } catch (e) {
        console.warn(`IndexNow ${endpoint}: ${e.message}`);
    }
}

console.log(`IndexNow: ${list.length} URL, ${ok}/${endpoints.length} uç başarılı`);
if (!ok) process.exitCode = 1;
