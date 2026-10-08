// meslek-nace.pro/meslek/ sayfasındaki 184 meslek kolunu ve her birinin NACE kodlarını indirip
// scripts/meslek/nace.json dosyasına yazar. Meslek kataloğu (catalog/*.mjs) bu veriyle denetlenir:
//   node scripts/meslek/fetch-nace.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://meslek-nace.pro';
const decode = (s) => s
    .replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const get = async (path) => {
    for (let i = 0; ; i++) {
        try {
            const res = await fetch(BASE + path);
            if (!res.ok) throw new Error(`${path}: ${res.status}`);
            return await res.text();
        } catch (err) {
            if (i >= 3) throw err;
            await new Promise((r) => setTimeout(r, 800 * (i + 1)));
        }
    }
};

const index = await get('/meslek/');
const slugs = [...new Set([...index.matchAll(/href="\/meslek\/([a-z]-\d{2})\/"/g)].map((m) => m[1]))];

const out = [];
for (let i = 0; i < slugs.length; i += 8) {
    const batch = await Promise.all(slugs.slice(i, i + 8).map(async (slug) => {
        const html = await get(`/meslek/${slug}/`);
        const name = decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]);
        const group = decode(html.match(/Kaynak sektör:\s*([^<.]+)/)?.[1] ?? '');
        const nace = [...html.matchAll(/<li[^>]*>\s*(?:<[^>]+>\s*)*(\d{6})(?:\s*<\/[^>]+>)*\s*(?:—|&mdash;|-)\s*([\s\S]*?)<\/li>/g)]
            .map((m) => ({ code: m[1], desc: decode(m[2]) }));
        return { code: slug.toUpperCase().replace('-', '.'), slug, name, group, nace };
    }));
    out.push(...batch);
    process.stdout.write(`${out.length}/${slugs.length}\r`);
}
out.sort((a, b) => a.code.localeCompare(b.code));
writeFileSync(join(process.cwd(), 'scripts', 'meslek', 'nace.json'), `${JSON.stringify(out, null, 1)}\n`);
console.log(`\n${out.length} meslek, ${out.reduce((n, m) => n + m.nace.length, 0)} NACE kodu yazıldı.`);
