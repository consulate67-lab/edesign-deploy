/**
 * Henüz e-postası olmayan tüzel kişileri web’den (DuckDuckGo + site tarama) zenginleştirir.
 *
 *   node scripts/mukellef/enrich-emails.mjs
 *   node scripts/mukellef/enrich-emails.mjs --limit 50
 *   node scripts/mukellef/enrich-emails.mjs --delay 1500
 *
 * Ücretli API yok; ~1 istek/sn. Parti bitince export-csv.mjs çalıştırın.
 */
import { normalizeEmail, openDb, sleep } from './lib.mjs';

const limit = Number(process.argv.includes('--limit') ? process.argv[process.argv.indexOf('--limit') + 1] : 200) || 200;
const delay = Number(process.argv.includes('--delay') ? process.argv[process.argv.indexOf('--delay') + 1] : 1200) || 1200;

const UA = 'Mozilla/5.0 (compatible; edxdocu-mukellef/1.0; +https://www.edxdocu.com; destek@edxdocu.com)';

const CONTACT_PATHS = ['/iletisim', '/contact', '/contact-us', '/hakkimizda/contact-center', '/tr/contact'];

const fetchText = async (url, timeoutMs = 12_000) => {
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
    const type = res.headers.get('content-type') || '';
    if (!/html|xml|text/i.test(type) && type) throw new Error(`content-type ${type}`);
    const html = await res.text();
    return { url: res.url, html: html.length > 800_000 ? html.slice(0, 800_000) : html };
};

const extractEmails = (html) => {
    const found = new Set();
    const text = String(html || '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&#0*64;/g, '@')
        .replace(/\[at\]|\(at\)/gi, '@');
    for (const m of text.matchAll(/mailto:([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi)) {
        const e = normalizeEmail(m[1]);
        if (e) found.add(e);
    }
    for (const m of text.matchAll(/(?:^|[^a-z0-9._%+-])([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})(?![a-z0-9.-])/gi)) {
        const e = normalizeEmail(m[1]);
        if (e) found.add(e);
    }
    return [...found];
};

const STOP = new Set(
    'Anonim AnonimŞirket Limited Ltd Şti Şirketi Sanayi Ticaret Ve VeOrtakları Holding Aş As Inc Co The Of Servis Hizmet Hizmetleri Ithalat Ihracat Imalat Paz Pazarlama Nakliyat Nakliye Insaat Yapı Yapi Gida Gıda Turizm Otomotiv Elektrik Tekstil Gayrimenkul Mimarlik Muhendislik Sigorta Aracilik Global Enerji Petrol Madencilik Lojistik Danismanlik'
        .toLocaleLowerCase('tr')
        .split(/\s+/),
);
const JUNK_DOMAIN = /(?:edxdocu|geeksforgeeks|shiftdelete|wikipedia|github|linkedin|facebook|instagram|youtube|twitter|reddit|medium\.com|blogspot|wordpress\.com|wixsite|google|microsoft|apple\.com|trt\.net|kimnereli|sahibinden|hepsiburada|n11\.com|amazon\.|ebay\.)/i;

const nameTokens = (unvan) => String(unvan || '')
    .toLocaleLowerCase('tr')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOP.has(t));

/** "3K …", "2B …" gibi kodlu unvanlar → alan adı öneki (yalnız anlamlı kuyrukla) */
const codeTokens = (unvan) => {
    const raw = String(unvan || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return [...raw.matchAll(/\b(\d+[a-z]{1,4}|[a-z]{1,3}\d+)\b/gi)].map((m) => m[1].toLowerCase());
};
const CODE_TAILS = new Set(['insaat', 'yapi', 'yapim', 'otomotiv', 'enerji', 'yazilim', 'tekstil', 'gida', 'grup', 'holding', 'mimarlik', 'muhendislik', 'lojistik', 'gayrimenkul']);

const domainMatchesFirm = (domain, unvan) => {
    const host = String(domain || '').replace(/^www\./, '').toLowerCase();
    if (!host || host.length < 4) return false;
    const label = host.split('.')[0];
    if (!label || label.length < 4) return false;
    const tokens = nameTokens(unvan);
    for (const c of codeTokens(unvan)) {
        if (c.length < 2 || !label.startsWith(c)) continue;
        const rest = label.slice(c.length);
        if (CODE_TAILS.has(rest) || tokens.some((t) => t.length >= 4 && (label.includes(t) || rest.includes(t.slice(0, 5))))) return true;
    }
    if (!tokens.length) return false;
    // Kısa/jenerik parçalar yanlış siteye yapışmasın; etiket token ile büyük ölçüde örtüşmeli
    return tokens.some((t) => {
        if (t.length < 4) return false;
        if (label === t) return true;
        if (label.startsWith(t) && t.length / label.length >= 0.55) return true;
        if (t.startsWith(label) && label.length >= 5) return true;
        return false;
    });
};

const scoreEmail = (email, siteHost, unvan) => {
    const [local, domain] = email.split('@');
    if (JUNK_DOMAIN.test(domain) || JUNK_DOMAIN.test(siteHost || '')) return -100;
    // E-posta alan adı unvanla örtüşmeli; yalnızca site host’u yetmez (yanlış sayfa riski)
    if (!domainMatchesFirm(domain, unvan)) return -100;
    let s = 6;
    if (siteHost && (domain === siteHost || domain.endsWith('.' + siteHost) || siteHost.endsWith('.' + domain))) s += 4;
    else if (siteHost && domainMatchesFirm(siteHost, unvan)) s += 2;
    if (/^(info|iletisim|contact|muhasebe|mali|efatura|earsiv|destek|office|ofis|firma|sirket|mail)$/i.test(local)) s += 2;
    if (/\.bel\.tr$/i.test(domain)) s -= 20;
    return s;
};

const pickBest = (emails, siteHost, unvan) => {
    if (!emails.length) return null;
    const ranked = [...emails].map((e) => ({ e, s: scoreEmail(e, siteHost, unvan) })).sort((a, b) => b.s - a.s);
    // En az unvan/alan adı örtüşmesi (skor ≥ 6) şart
    return ranked[0].s >= 6 ? ranked[0].e : null;
};

const hostOf = (url) => {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
};

const BLOCKED_HOST = /(?:^|\.)(bing|google|duckduckgo|youtube|facebook|linkedin|instagram|twitter|wikipedia|wikimedia|microsoft|apple|bel\.tr|careers\.|glassdoor|sahibinden|linkedin)\./i;

/** Bing <cite> satırlarından tam URL / kök adres. */
const searchSites = async (query) => {
    const q = encodeURIComponent(query);
    const { html } = await fetchText(`https://www.bing.com/search?q=${q}&setlang=tr-TR&cc=TR`, 15_000);
    const urls = [];
    for (const m of html.matchAll(/<cite[^>]*>([\s\S]*?)<\/cite>/gi)) {
        let raw = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        raw = raw.replace(/\s*›\s*/g, '/').replace(/\s+/g, '');
        if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
        try {
            const u = new URL(raw);
            if (BLOCKED_HOST.test(u.hostname)) continue;
            if (u.pathname && u.pathname !== '/') urls.push(`${u.origin}${u.pathname.replace(/\/$/, '')}`);
            urls.push(u.origin);
        } catch { /* */ }
    }
    return [...new Set(urls)].slice(0, 8);
};

const scrapeSite = async (startUrl) => {
    const host = hostOf(startUrl);
    if (!host) return { emails: [], website: null, host: null };
    const origin = `https://${host}`;
    const emails = new Set();
    const targets = [startUrl, origin, ...CONTACT_PATHS.map((p) => origin + p)];
    const seen = new Set();
    for (const target of targets) {
        const key = target.replace(/\/$/, '');
        if (seen.has(key)) continue;
        seen.add(key);
        try {
            const { html } = await fetchText(target);
            for (const e of extractEmails(html)) emails.add(e);
        } catch { /* sayfa yok / zaman aşımı */ }
        if (emails.size >= 2) break;
    }
    return { emails: [...emails], website: origin, host };
};

const retry = process.argv.includes('--retry');
const db = openDb();
if (retry) {
    db.prepare(`UPDATE mukellefler SET email_status = 'pending', notes = NULL WHERE email IS NULL AND email_status IN ('not_found', 'error')`).run();
}
const rows = db.prepare(`
    SELECT vkn, unvan FROM mukellefler
    WHERE email IS NULL AND email_status = 'pending'
    ORDER BY vkn
    LIMIT ?
`).all(limit);

console.log(`${rows.length} firma işlenecek (limit ${limit}, gecikme ${delay} ms)`);

const setEmail = db.prepare(`
    UPDATE mukellefler SET email = ?, email_source = ?, email_status = 'found', website = ?, enriched_at = datetime('now'), updated_at = datetime('now')
    WHERE vkn = ?
`);
const setMiss = db.prepare(`
    UPDATE mukellefler SET email_status = ?, notes = ?, enriched_at = datetime('now'), updated_at = datetime('now')
    WHERE vkn = ?
`);

let found = 0;
let missed = 0;
for (const [i, row] of rows.entries()) {
    const label = `${i + 1}/${rows.length} ${row.vkn} ${(row.unvan || '').slice(0, 50)}`;
    try {
        await sleep(delay);
        const shortName = String(row.unvan || '')
            .replace(/\b(ANONİM|A\.?Ş\.?|LİMİTED|LTD\.?|ŞTİ\.?|SIRKETI|ŞİRKETİ|SANAYİ|TİCARET|VE|TICARET)\b/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 60);
        const query = `${shortName || row.unvan} Türkiye resmi site iletişim`;
        const sites = await searchSites(query);
        let best = null;
        let website = null;
        let source = null;
        for (const site of sites.slice(0, 5)) {
            const r = await scrapeSite(site);
            const pick = pickBest(r.emails, r.host, row.unvan);
            if (pick && (!best || scoreEmail(pick, r.host, row.unvan) > scoreEmail(best, hostOf(source) || '', row.unvan))) {
                best = pick;
                website = r.website;
                source = site;
            }
            if (best && scoreEmail(best, r.host, row.unvan) >= 8) break;
        }
        if (best) {
            setEmail.run(best, source, website, row.vkn);
            found++;
            console.log(`✓ ${label} → ${best}`);
        } else {
            setMiss.run('not_found', sites.length ? `aranan ${sites.length} site` : 'arama sonucu yok', row.vkn);
            missed++;
            console.log(`· ${label} → bulunamadı`);
        }
    } catch (e) {
        setMiss.run('error', String(e.message).slice(0, 300), row.vkn);
        missed++;
        console.warn(`! ${label} → ${e.message}`);
    }
}

const stats = db.prepare(`
    SELECT
      SUM(CASE WHEN email IS NOT NULL THEN 1 ELSE 0 END) AS with_email,
      SUM(CASE WHEN email_status = 'pending' THEN 1 ELSE 0 END) AS pending,
      COUNT(*) AS total
    FROM mukellefler
`).get();
console.log(`tur: bulunan ${found}, bulunamayan ${missed}`);
console.log(`DB: e-postalı ${stats.with_email}, bekleyen ${stats.pending}, toplam ${stats.total}`);
