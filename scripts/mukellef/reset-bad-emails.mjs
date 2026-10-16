/** Yanlış eşleşmiş e-postaları temizler (junk alan adı, sahte TLD veya unvan uyumsuzluğu). */
import { normalizeEmail, openDb } from './lib.mjs';

const STOP = new Set(
    'Anonim Limited Ltd Sti Sirketi Sanayi Ticaret Ve Holding As Servis Hizmet Hizmetleri Ithalat Ihracat Imalat Paz Pazarlama Nakliyat Nakliye Insaat Yapi Gida Turizm Otomotiv Elektrik Tekstil Gayrimenkul Mimarlik Muhendislik Sigorta Aracilik Global Enerji Petrol Madencilik Lojistik Danismanlik'
        .toLocaleLowerCase('tr')
        .split(/\s+/),
);
const JUNK = /(?:edxdocu|geeksforgeeks|shiftdelete|wikipedia|github|linkedin|facebook|instagram|youtube|twitter|reddit|medium\.com|blogspot|wordpress\.com|trt\.net|kimnereli|sahibinden|trendyol|tvplus|hulu)/i;
const tokens = (unvan) => String(unvan || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t.length >= 3 && !STOP.has(t));
const codes = (unvan) => {
    const raw = String(unvan || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return [...raw.matchAll(/\b(\d+[a-z]{1,4}|[a-z]{1,3}\d+)\b/gi)].map((m) => m[1].toLowerCase());
};
const CODE_TAILS = new Set(['insaat', 'yapi', 'yapim', 'otomotiv', 'enerji', 'yazilim', 'tekstil', 'gida', 'grup', 'holding', 'mimarlik', 'muhendislik', 'lojistik', 'gayrimenkul']);
const match = (domain, unvan) => {
    const host = String(domain || '').replace(/^www\./, '').toLowerCase();
    if (!host || host.length < 4) return false;
    const label = host.split('.')[0];
    if (!label || label.length < 4) return false;
    const ts = tokens(unvan);
    for (const c of codes(unvan)) {
        if (c.length < 2 || !label.startsWith(c)) continue;
        const rest = label.slice(c.length);
        if (CODE_TAILS.has(rest) || ts.some((t) => t.length >= 4 && (label.includes(t) || rest.includes(t.slice(0, 5))))) return true;
    }
    return ts.some((t) => {
        if (t.length < 4) return false;
        if (label === t) return true;
        if (label.startsWith(t) && t.length / label.length >= 0.55) return true;
        if (t.startsWith(label) && label.length >= 5) return true;
        return false;
    });
};

const db = openDb();
const rows = db.prepare(`SELECT vkn, unvan, email FROM mukellefler WHERE email IS NOT NULL`).all();
const clear = db.prepare(`UPDATE mukellefler SET email = NULL, email_source = NULL, website = NULL, email_status = 'pending', notes = 'kalite sifirlama', enriched_at = NULL WHERE vkn = ?`);
let n = 0;
for (const r of rows) {
    const domain = r.email.split('@')[1] || '';
    const valid = normalizeEmail(r.email);
    if (!valid || JUNK.test(domain) || !match(domain, r.unvan)) {
        clear.run(r.vkn);
        n++;
        console.log('silindi', r.vkn, r.email);
    }
}
console.log(`${n} şüpheli e-posta temizlendi; kalan:`, db.prepare(`SELECT COUNT(*) AS c FROM mukellefler WHERE email IS NOT NULL`).get().c);
