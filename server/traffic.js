/**
 * Sayfa ziyaretleri — kaynak (referrer / UTM) gruplu istatistik.
 * İstemci her ekran değişiminde POST /api/traffic/visit gönderir; IP hash'lenir.
 * Eski /g/:slug kampanya linkleri de tutulur (ikincil).
 */
import { createHash } from 'node:crypto';
import { cleanText, optionalText, parseId } from './util.js';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NAME_MAX = 120;
const URL_MAX = 2000;
const SLUG_MAX = 64;
const PATH_MAX = 300;
const TITLE_MAX = 200;
const REF_MAX = 500;

const slugify = (text) => String(text || '')
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX) || 'grup';

const clientIp = (req) => {
    const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    return xf || req.socket?.remoteAddress || '';
};

const hashIp = (ip) => createHash('sha256').update(`traffic:${ip}`).digest('hex').slice(0, 32);

const isHttpUrl = (u) => {
    try {
        const x = new URL(u);
        return x.protocol === 'http:' || x.protocol === 'https:';
    } catch {
        return false;
    }
};

const hostOf = (ref) => {
    try {
        return new URL(ref).hostname.replace(/^www\./i, '').toLowerCase();
    } catch {
        return '';
    }
};

/** Ziyaretçi kaynağını okunabilir gruba çevirir. */
export const classifySource = ({ referrer = '', utmSource = '', utmMedium = '', ownHosts = [] }) => {
    const utm = String(utmSource || '').trim().toLowerCase();
    if (utm) {
        if (/linkedin|lnkd/.test(utm)) return 'LinkedIn';
        if (/facebook|fb|meta/.test(utm)) return 'Facebook';
        if (/instagram|ig/.test(utm)) return 'Instagram';
        if (/^(x|twitter|t\.co)$/.test(utm)) return 'X (Twitter)';
        if (/google|gclid/.test(utm)) return 'Google';
        if (/bing|yahoo|yandex|duckduck/.test(utm)) return 'Arama';
        if (/whatsapp|wa\.me|telegram|t\.me/.test(utm)) return 'Mesajlaşma';
        if (/edx_group|campaign|email|mail/.test(utm) || utmMedium === 'email') return 'Kampanya / e-posta';
        return `UTM: ${utm.slice(0, 40)}`;
    }
    const host = hostOf(referrer);
    if (!host) return 'Doğrudan';
    if (ownHosts.some((h) => host === h || host.endsWith(`.${h}`))) return 'Site içi';
    if (/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/.test(host)) return 'LinkedIn';
    if (/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)fb\.me$|(^|\.)l\.facebook\.com$/.test(host)) return 'Facebook';
    if (/(^|\.)instagram\.com$/.test(host)) return 'Instagram';
    if (/(^|\.)twitter\.com$|(^|\.)x\.com$|(^|\.)t\.co$/.test(host)) return 'X (Twitter)';
    if (/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(host)) return 'YouTube';
    if (/(^|\.)whatsapp\.com$|(^|\.)wa\.me$/.test(host)) return 'WhatsApp';
    if (/(^|\.)t\.me$|(^|\.)telegram\./.test(host)) return 'Telegram';
    if (/(^|\.)google\./.test(host) || host === 'google.com') return 'Google';
    if (/(^|\.)bing\.com$|(^|\.)yahoo\.|(^|\.)yandex\.|(^|\.)duckduckgo\.com$/.test(host)) return 'Arama';
    if (/(^|\.)github\.com$/.test(host)) return 'GitHub';
    return host;
};

const ownHostsFrom = (website) => {
    try {
        const h = new URL(website).hostname.replace(/^www\./i, '').toLowerCase();
        return h ? [h, `www.${h}`] : ['edxdocu.com', 'www.edxdocu.com'];
    } catch {
        return ['edxdocu.com', 'www.edxdocu.com'];
    }
};

export const createTrafficSchema = async (client) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS traffic_groups (
            id              SERIAL PRIMARY KEY,
            name            TEXT NOT NULL,
            slug            TEXT NOT NULL UNIQUE,
            destination_url TEXT NOT NULL,
            note            TEXT NOT NULL DEFAULT '',
            created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`
        CREATE TABLE IF NOT EXISTS traffic_clicks (
            id          SERIAL PRIMARY KEY,
            group_id    INTEGER NOT NULL REFERENCES traffic_groups(id) ON DELETE CASCADE,
            referrer    TEXT NOT NULL DEFAULT '',
            path        TEXT NOT NULL DEFAULT '',
            user_agent  TEXT NOT NULL DEFAULT '',
            ip_hash     TEXT NOT NULL DEFAULT '',
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS traffic_clicks_group_created ON traffic_clicks (group_id, created_at DESC)');
    await client.query(`
        CREATE TABLE IF NOT EXISTS page_visits (
            id            SERIAL PRIMARY KEY,
            path          TEXT NOT NULL DEFAULT '/',
            title         TEXT NOT NULL DEFAULT '',
            source        TEXT NOT NULL DEFAULT 'Doğrudan',
            referrer      TEXT NOT NULL DEFAULT '',
            referrer_host TEXT NOT NULL DEFAULT '',
            utm_source    TEXT NOT NULL DEFAULT '',
            utm_medium    TEXT NOT NULL DEFAULT '',
            utm_campaign  TEXT NOT NULL DEFAULT '',
            ip_hash       TEXT NOT NULL DEFAULT '',
            created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS page_visits_created ON page_visits (created_at DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS page_visits_source_created ON page_visits (source, created_at DESC)');
};

const serializeGroup = (row, website) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    destinationUrl: row.destination_url,
    note: row.note || '',
    shareUrl: `${website.replace(/\/$/, '')}/g/${row.slug}`,
    createdAt: row.created_at,
    clicksTotal: Number(row.clicks_total || 0),
    clicks7d: Number(row.clicks_7d || 0),
    clicks30d: Number(row.clicks_30d || 0),
    uniqueTotal: Number(row.unique_total || 0),
    lastClickAt: row.last_click_at || null,
});

/** Aynı IP+path için kısa sürede spam önleme (bellek). */
const recentHits = new Map();
const dedupeOk = (key, ms = 8_000) => {
    const now = Date.now();
    if ((recentHits.get(key) || 0) > now - ms) return false;
    recentHits.set(key, now);
    if (recentHits.size > 20_000) {
        for (const [k, t] of recentHits) {
            if (t < now - 60_000) recentHits.delete(k);
        }
    }
    return true;
};

export const registerTrafficRoutes = (app, { db, requireAdmin, website }) => {
    const site = String(website || 'https://www.edxdocu.com').replace(/\/$/, '');
    const ownHosts = ownHostsFrom(site);

    const listSql = `
        SELECT g.*,
               (SELECT COUNT(*)::int FROM traffic_clicks c WHERE c.group_id = g.id) AS clicks_total,
               (SELECT COUNT(*)::int FROM traffic_clicks c WHERE c.group_id = g.id AND c.created_at > NOW() - INTERVAL '7 days') AS clicks_7d,
               (SELECT COUNT(*)::int FROM traffic_clicks c WHERE c.group_id = g.id AND c.created_at > NOW() - INTERVAL '30 days') AS clicks_30d,
               (SELECT COUNT(DISTINCT c.ip_hash)::int FROM traffic_clicks c WHERE c.group_id = g.id AND c.ip_hash <> '') AS unique_total,
               (SELECT MAX(c.created_at) FROM traffic_clicks c WHERE c.group_id = g.id) AS last_click_at
          FROM traffic_groups g`;

    // ---- public: ziyaret kaydı ----
    app.post('/api/traffic/visit', async (req, res) => {
        const path = cleanText(req.body?.path, PATH_MAX) || '/';
        if (path.startsWith('/yonetim') || path.startsWith('/admin')) return res.status(204).end();
        const title = optionalText(req.body?.title, TITLE_MAX) || '';
        const referrer = optionalText(req.body?.referrer, REF_MAX) || '';
        const utmSource = optionalText(req.body?.utmSource, 80) || '';
        const utmMedium = optionalText(req.body?.utmMedium, 80) || '';
        const utmCampaign = optionalText(req.body?.utmCampaign, 120) || '';
        const ip = clientIp(req);
        const ipH = hashIp(ip);
        if (!dedupeOk(`${ipH}:${path}`)) return res.status(204).end();
        const source = classifySource({ referrer, utmSource, utmMedium, ownHosts });
        const referrerHost = hostOf(referrer);
        try {
            await db.run(
                `INSERT INTO page_visits (path, title, source, referrer, referrer_host, utm_source, utm_medium, utm_campaign, ip_hash)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [path, title, source, referrer, referrerHost, utmSource, utmMedium, utmCampaign, ipH],
            );
        } catch (e) {
            console.warn('[traffic] visit kaydı:', e.message);
        }
        res.status(204).end();
    });

    // ---- public redirect (kampanya linki) ----
    app.get('/g/:slug', async (req, res) => {
        const slug = String(req.params.slug || '').toLowerCase().slice(0, SLUG_MAX);
        if (!SLUG_RE.test(slug)) return res.redirect(302, site);
        const group = await db.get('SELECT id, destination_url FROM traffic_groups WHERE slug = ?', [slug]);
        if (!group) return res.redirect(302, site);
        const dest = group.destination_url || site;
        try {
            await db.run(
                `INSERT INTO traffic_clicks (group_id, referrer, path, user_agent, ip_hash)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    group.id,
                    String(req.get('referer') || '').slice(0, 500),
                    `/g/${slug}`,
                    String(req.get('user-agent') || '').slice(0, 400),
                    hashIp(clientIp(req)),
                ],
            );
        } catch (e) {
            console.warn('[traffic] click kaydı başarısız:', e.message);
        }
        const url = new URL(dest);
        if (!url.searchParams.has('utm_source')) url.searchParams.set('utm_source', 'edx_group');
        if (!url.searchParams.has('utm_campaign')) url.searchParams.set('utm_campaign', slug);
        res.redirect(302, url.toString());
    });

    // ---- admin: kaynak grupları ----
    app.get('/api/admin/traffic/overview', requireAdmin, async (req, res) => {
        const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 90);
        const totals = await db.get(
            `SELECT
                (SELECT COUNT(*)::int FROM page_visits WHERE created_at > NOW() - (?::int * INTERVAL '1 day')) AS visits,
                (SELECT COUNT(DISTINCT ip_hash)::int FROM page_visits WHERE created_at > NOW() - (?::int * INTERVAL '1 day') AND ip_hash <> '') AS unique_visitors,
                (SELECT COUNT(*)::int FROM page_visits WHERE created_at > NOW() - INTERVAL '1 day') AS visits_1d,
                (SELECT COUNT(*)::int FROM page_visits) AS visits_all`,
            [days, days],
        );
        const sources = await db.all(
            `SELECT source,
                    COUNT(*)::int AS visits,
                    COUNT(DISTINCT ip_hash)::int AS unique_visitors,
                    MAX(created_at) AS last_visit_at
               FROM page_visits
              WHERE created_at > NOW() - (?::int * INTERVAL '1 day')
              GROUP BY source
              ORDER BY visits DESC
              LIMIT 50`,
            [days],
        );
        const paths = await db.all(
            `SELECT path,
                    COUNT(*)::int AS visits,
                    COUNT(DISTINCT source)::int AS sources
               FROM page_visits
              WHERE created_at > NOW() - (?::int * INTERVAL '1 day')
              GROUP BY path
              ORDER BY visits DESC
              LIMIT 30`,
            [days],
        );
        const byDay = await db.all(
            `SELECT to_char(created_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') AS day,
                    COUNT(*)::int AS visits
               FROM page_visits
              WHERE created_at > NOW() - (?::int * INTERVAL '1 day')
              GROUP BY 1 ORDER BY 1`,
            [days],
        );
        res.json({
            days,
            totals: {
                visits: Number(totals.visits || 0),
                uniqueVisitors: Number(totals.unique_visitors || 0),
                visits1d: Number(totals.visits_1d || 0),
                visitsAll: Number(totals.visits_all || 0),
            },
            sources: sources.map((s) => ({
                source: s.source,
                visits: Number(s.visits),
                uniqueVisitors: Number(s.unique_visitors),
                lastVisitAt: s.last_visit_at,
            })),
            paths: paths.map((p) => ({
                path: p.path,
                visits: Number(p.visits),
                sources: Number(p.sources),
            })),
            byDay: byDay.map((d) => ({ day: d.day, visits: Number(d.visits) })),
        });
    });

    app.get('/api/admin/traffic/sources/:source', requireAdmin, async (req, res) => {
        const source = decodeURIComponent(String(req.params.source || '')).slice(0, 80);
        if (!source) return res.status(400).json({ error: 'Kaynak gerekli.' });
        const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 90);
        const paths = await db.all(
            `SELECT path,
                    COUNT(*)::int AS visits,
                    COUNT(DISTINCT ip_hash)::int AS unique_visitors,
                    MAX(created_at) AS last_visit_at
               FROM page_visits
              WHERE source = ? AND created_at > NOW() - (?::int * INTERVAL '1 day')
              GROUP BY path
              ORDER BY visits DESC
              LIMIT 40`,
            [source, days],
        );
        const hosts = await db.all(
            `SELECT CASE WHEN referrer_host = '' THEN '(yok)' ELSE referrer_host END AS host,
                    COUNT(*)::int AS visits
               FROM page_visits
              WHERE source = ? AND created_at > NOW() - (?::int * INTERVAL '1 day')
              GROUP BY 1
              ORDER BY visits DESC
              LIMIT 20`,
            [source, days],
        );
        const recent = await db.all(
            `SELECT path, title, referrer, utm_source, utm_campaign, created_at
               FROM page_visits
              WHERE source = ? AND created_at > NOW() - (?::int * INTERVAL '1 day')
              ORDER BY created_at DESC
              LIMIT 80`,
            [source, days],
        );
        res.json({
            source,
            days,
            paths: paths.map((p) => ({
                path: p.path,
                visits: Number(p.visits),
                uniqueVisitors: Number(p.unique_visitors),
                lastVisitAt: p.last_visit_at,
            })),
            hosts: hosts.map((h) => ({ host: h.host, visits: Number(h.visits) })),
            recent: recent.map((r) => ({
                path: r.path,
                title: r.title,
                referrer: r.referrer,
                utmSource: r.utm_source,
                utmCampaign: r.utm_campaign,
                createdAt: r.created_at,
            })),
        });
    });

    // ---- admin: kampanya linkleri (isteğe bağlı) ----
    app.get('/api/admin/traffic/groups', requireAdmin, async (_req, res) => {
        const rows = await db.all(`${listSql} ORDER BY clicks_7d DESC, g.created_at DESC`);
        const totals = await db.get(`
            SELECT COUNT(*)::int AS groups,
                   (SELECT COUNT(*)::int FROM traffic_clicks) AS clicks,
                   (SELECT COUNT(*)::int FROM traffic_clicks WHERE created_at > NOW() - INTERVAL '7 days') AS clicks7d
        `);
        res.json({
            website: site,
            totals: { groups: totals.groups, clicks: totals.clicks, clicks7d: totals.clicks7d },
            groups: rows.map((r) => serializeGroup(r, site)),
        });
    });

    app.post('/api/admin/traffic/groups', requireAdmin, async (req, res) => {
        const name = cleanText(req.body?.name, NAME_MAX);
        if (!name) return res.status(400).json({ error: 'Grup adı gerekli.' });
        let slug = optionalText(req.body?.slug, SLUG_MAX)?.toLowerCase() || slugify(name);
        if (!SLUG_RE.test(slug)) return res.status(400).json({ error: 'Slug yalnız küçük harf, rakam ve tire olabilir.' });
        const destination = optionalText(req.body?.destinationUrl, URL_MAX) || site;
        if (!isHttpUrl(destination)) return res.status(400).json({ error: 'Hedef adres http(s) olmalı.' });
        const note = optionalText(req.body?.note, 500) || '';
        const exists = await db.get('SELECT id FROM traffic_groups WHERE slug = ?', [slug]);
        if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
        const row = await db.get(
            `INSERT INTO traffic_groups (name, slug, destination_url, note)
             VALUES (?, ?, ?, ?) RETURNING *`,
            [name, slug, destination, note],
        );
        res.status(201).json(serializeGroup({ ...row, clicks_total: 0, clicks_7d: 0, clicks_30d: 0, unique_total: 0 }, site));
    });

    app.delete('/api/admin/traffic/groups/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz kimlik.' });
        const r = await db.run('DELETE FROM traffic_groups WHERE id = ?', [id]);
        if (!r.changes) return res.status(404).json({ error: 'Grup bulunamadı.' });
        res.json({ success: true });
    });
};
