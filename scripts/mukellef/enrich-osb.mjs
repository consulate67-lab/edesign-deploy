/**
 * OSB / oda firma rehberlerinden e-posta toplar; GİB listedeki unvanlarla eşleştirir.
 *
 *   node scripts/mukellef/enrich-osb.mjs
 *   node scripts/mukellef/enrich-osb.mjs --only yozgat,usak,aso2
 */
import { foldUnvan, normalizeEmail, openDb, sleep } from './lib.mjs';
import { OSB_SOURCES } from './osb-sources.mjs';

const UA = 'Mozilla/5.0 (compatible; edxdocu-mukellef/1.0; +https://www.edxdocu.com; destek@edxdocu.com)';
const only = process.argv.includes('--only')
    ? new Set(String(process.argv[process.argv.indexOf('--only') + 1] || '').split(',').map((s) => s.trim()).filter(Boolean))
    : null;
const delay = Number(process.argv.includes('--delay') ? process.argv[process.argv.indexOf('--delay') + 1] : 800) || 800;

const OSB_SELF = /(?:osb|organize.?sanayi|@tobb\.org|bilgi@|info@.*osb)/i;

const fetchText = async (url, timeoutMs = 20_000) => {
    const res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
            'User-Agent': UA,
            Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return { url: res.url, html: html.length > 2_000_000 ? html.slice(0, 2_000_000) : html };
};

const decode = (html) => String(html || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#0*64;/g, '@')
    .replace(/\[email\s*protected\]/gi, '')
    .replace(/\[at\]|\(at\)/gi, '@');

const stripTags = (s) => decode(s).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/** Blok içinde unvan + e-posta çiftleri çıkar. */
const pairsFromHtml = (html, sourceUrl) => {
    const text = decode(html);
    const pairs = [];
    const seen = new Set();

    // Tablo satırları
    for (const m of text.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
        const row = m[1];
        const emails = [...row.matchAll(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi)]
            .map((x) => normalizeEmail(x[1]))
            .filter(Boolean)
            .filter((e) => !OSB_SELF.test(e) && !e.endsWith('@' + new URL(sourceUrl).hostname.replace(/^www\./, '')));
        if (!emails.length) continue;
        const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => stripTags(c[1]));
        const title = cells.find((c) => c.length >= 8 && /(?:san|tic|ltd|şti|şti\.|a\.ş|aş|limited|anonim|şirket)/i.test(c))
            || cells.find((c) => c.length >= 10 && !/@/.test(c) && !/^\d/.test(c))
            || '';
        if (!title || title.length < 6) continue;
        for (const email of emails.slice(0, 2)) {
            const key = `${foldUnvan(title)}|${email}`;
            if (seen.has(key)) continue;
            seen.add(key);
            pairs.push({ unvan: title.slice(0, 200), email, source: sourceUrl });
        }
    }

    // Kart / bölüm (h2–h4 + mailto civarı)
    for (const m of text.matchAll(/<(h[2-4]|strong|b)[^>]*>([\s\S]*?)<\/\1>/gi)) {
        const title = stripTags(m[2]);
        if (title.length < 8 || title.length > 180) continue;
        if (!/(?:san|tic|ltd|şti|a\.ş|aş|limited|anonim|şirket|\.com)/i.test(title) && title.split(/\s+/).length < 2) continue;
        const start = m.index ?? 0;
        const window = text.slice(start, start + 1200);
        const emails = [...window.matchAll(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi)]
            .map((x) => normalizeEmail(x[1]))
            .filter(Boolean)
            .filter((e) => !OSB_SELF.test(e));
        for (const email of emails.slice(0, 1)) {
            const key = `${foldUnvan(title)}|${email}`;
            if (seen.has(key)) continue;
            seen.add(key);
            pairs.push({ unvan: title.slice(0, 200), email, source: sourceUrl });
        }
    }

    // Liste öğeleri
    for (const m of text.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
        const block = m[1];
        const emails = [...block.matchAll(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi)]
            .map((x) => normalizeEmail(x[1]))
            .filter(Boolean)
            .filter((e) => !OSB_SELF.test(e));
        if (!emails.length) continue;
        const title = stripTags(block.replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, ' ')).slice(0, 200);
        if (title.length < 8) continue;
        const email = emails[0];
        const key = `${foldUnvan(title)}|${email}`;
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push({ unvan: title, email, source: sourceUrl });
    }

    return pairs;
};

const tokenSet = (folded) => new Set(folded.split(/\s+/).filter((t) => t.length >= 3));

const GENERIC = new Set(['demir', 'celik', 'metal', 'plastik', 'tekstil', 'gida', 'insaat', 'yapi', 'otomotiv', 'enerji', 'tarim', 'nakliye', 'profil', 'boru', 'iplik']);

const scoreMatch = (a, b) => {
    const ta = tokenSet(a);
    const tb = tokenSet(b);
    if (!ta.size || !tb.size) return 0;
    let inter = 0;
    let distinctive = 0;
    for (const t of ta) {
        if (!tb.has(t)) continue;
        inter++;
        if (t.length >= 5 && !GENERIC.has(t)) distinctive++;
    }
    const union = ta.size + tb.size - inter;
    const jaccard = inter / union;
    // En az bir ayırt edici ortak token şart (yalnız "demir/çelik" yetmez)
    if (distinctive < 1) return 0;
    if (inter >= 2 && jaccard >= 0.35) return jaccard + inter * 0.05 + distinctive * 0.1;
    if (inter >= 3 && distinctive >= 1) return jaccard + 0.2;
    if (a.length >= 10 && (a.includes(b) || b.includes(a)) && Math.min(a.length, b.length) / Math.max(a.length, b.length) >= 0.75) return 0.85;
    return 0;
};

const isTestVkn = (vkn) => /^(?:0*111111|0*555555|0*999999|0*123456|0*000000)/.test(String(vkn))
    || /test\s*kullan/i.test(String(vkn));

const sources = OSB_SOURCES.filter((s) => !only || only.has(s.id));
console.log(`${sources.length} OSB kaynağı taranacak`);

const db = openDb();
const pending = db.prepare(`SELECT vkn, unvan FROM mukellefler WHERE email IS NULL`).all()
    .filter((r) => !isTestVkn(r.vkn) && !/test\s*kullan/i.test(r.unvan || ''));
const index = pending.map((r) => ({ ...r, fold: foldUnvan(r.unvan) }));
console.log(`Eşleştirilecek e-postasız mükellef: ${index.length}`);

const setEmail = db.prepare(`
    UPDATE mukellefler SET email = ?, email_source = ?, email_status = 'found', website = ?,
      enriched_at = datetime('now'), updated_at = datetime('now'), notes = 'osb'
    WHERE vkn = ? AND email IS NULL
`);

let scrapedPairs = 0;
let matched = 0;
let skippedHttp = 0;

for (const src of sources) {
    try {
        await sleep(delay);
        console.log(`→ ${src.name} ${src.url}`);
        const { html, url } = await fetchText(src.url);
        const pairs = pairsFromHtml(html, url);
        scrapedPairs += pairs.length;
        console.log(`  ${pairs.length} aday çift`);

        for (const p of pairs) {
            const fold = foldUnvan(p.unvan);
            if (fold.length < 4) continue;
            let best = null;
            let bestScore = 0;
            for (const row of index) {
                if (!row.fold) continue;
                const s = scoreMatch(fold, row.fold);
                if (s > bestScore) {
                    bestScore = s;
                    best = row;
                }
            }
            if (!best || bestScore < 0.4) continue;
            const info = setEmail.run(p.email, src.url, null, best.vkn);
            if (info.changes > 0) {
                matched++;
                best.fold = ''; // bir daha eşleşme
                console.log(`  ✓ ${best.vkn} ${best.unvan.slice(0, 40)} → ${p.email}`);
            }
        }
    } catch (e) {
        skippedHttp++;
        console.warn(`  ! ${src.id}: ${e.message}`);
    }
}

const withEmail = db.prepare(`SELECT COUNT(*) AS c FROM mukellefler WHERE email IS NOT NULL`).get().c;
const unexported = db.prepare(`SELECT COUNT(*) AS c FROM mukellefler WHERE email IS NOT NULL AND (csv_batch IS NULL OR csv_batch = '')`).get().c;
console.log(`OSB tur: aday ${scrapedPairs}, eşleşen ${matched}, http hata ${skippedHttp}`);
console.log(`DB: e-postalı ${withEmail}, CSV’ye henüz yazılmayan ${unexported}`);
