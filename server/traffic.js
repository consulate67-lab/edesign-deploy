/**
 * Grup bazlı sayfa tıklama takibi.
 * Her grup için /g/:slug kısa linki üretilir; tıklanınca kaydedilir ve hedefe yönlendirilir.
 */
import { createHash } from 'node:crypto';
import { cleanText, optionalText, parseId } from './util.js';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NAME_MAX = 120;
const URL_MAX = 2000;
const SLUG_MAX = 64;

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

export const registerTrafficRoutes = (app, { db, requireAdmin, website }) => {
    const site = String(website || 'https://www.edxdocu.com').replace(/\/$/, '');

    const listSql = `
        SELECT g.*,
               (SELECT COUNT(*)::int FROM traffic_clicks c WHERE c.group_id = g.id) AS clicks_total,
               (SELECT COUNT(*)::int FROM traffic_clicks c WHERE c.group_id = g.id AND c.created_at > NOW() - INTERVAL '7 days') AS clicks_7d,
               (SELECT COUNT(*)::int FROM traffic_clicks c WHERE c.group_id = g.id AND c.created_at > NOW() - INTERVAL '30 days') AS clicks_30d,
               (SELECT COUNT(DISTINCT c.ip_hash)::int FROM traffic_clicks c WHERE c.group_id = g.id AND c.ip_hash <> '') AS unique_total,
               (SELECT MAX(c.created_at) FROM traffic_clicks c WHERE c.group_id = g.id) AS last_click_at
          FROM traffic_groups g`;

    // ---- public redirect (SPA'dan önce kayıtlı olmalı) ----
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

    // ---- admin ----
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
        if (exists) {
            slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
        }
        const row = await db.get(
            `INSERT INTO traffic_groups (name, slug, destination_url, note)
             VALUES (?, ?, ?, ?) RETURNING *`,
            [name, slug, destination, note],
        );
        res.status(201).json(serializeGroup({ ...row, clicks_total: 0, clicks_7d: 0, clicks_30d: 0, unique_total: 0 }, site));
    });

    app.put('/api/admin/traffic/groups/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz kimlik.' });
        const cur = await db.get('SELECT * FROM traffic_groups WHERE id = ?', [id]);
        if (!cur) return res.status(404).json({ error: 'Grup bulunamadı.' });
        const name = cleanText(req.body?.name, NAME_MAX) || cur.name;
        let slug = optionalText(req.body?.slug, SLUG_MAX)?.toLowerCase() || cur.slug;
        if (!SLUG_RE.test(slug)) return res.status(400).json({ error: 'Slug yalnız küçük harf, rakam ve tire olabilir.' });
        const destination = optionalText(req.body?.destinationUrl, URL_MAX) || cur.destination_url;
        if (!isHttpUrl(destination)) return res.status(400).json({ error: 'Hedef adres http(s) olmalı.' });
        const note = req.body?.note !== undefined ? (optionalText(req.body.note, 500) || '') : cur.note;
        const clash = await db.get('SELECT id FROM traffic_groups WHERE slug = ? AND id <> ?', [slug, id]);
        if (clash) return res.status(400).json({ error: 'Bu slug başka bir grupta kullanılıyor.' });
        await db.run(
            `UPDATE traffic_groups SET name = ?, slug = ?, destination_url = ?, note = ? WHERE id = ?`,
            [name, slug, destination, note || '', id],
        );
        const row = await db.get(`${listSql} WHERE g.id = ?`, [id]);
        res.json(serializeGroup(row, site));
    });

    app.delete('/api/admin/traffic/groups/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz kimlik.' });
        const r = await db.run('DELETE FROM traffic_groups WHERE id = ?', [id]);
        if (!r.changes) return res.status(404).json({ error: 'Grup bulunamadı.' });
        res.json({ success: true });
    });

    app.get('/api/admin/traffic/groups/:id/clicks', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz kimlik.' });
        const group = await db.get(`${listSql} WHERE g.id = ?`, [id]);
        if (!group) return res.status(404).json({ error: 'Grup bulunamadı.' });
        const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
        const clicks = await db.all(
            `SELECT id, referrer, path, user_agent, created_at
               FROM traffic_clicks WHERE group_id = ? ORDER BY created_at DESC LIMIT ?`,
            [id, limit],
        );
        const byDay = await db.all(
            `SELECT to_char(created_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') AS day,
                    COUNT(*)::int AS clicks
               FROM traffic_clicks
              WHERE group_id = ? AND created_at > NOW() - INTERVAL '30 days'
              GROUP BY 1 ORDER BY 1`,
            [id],
        );
        const byReferrer = await db.all(
            `SELECT CASE
                      WHEN referrer = '' OR referrer IS NULL THEN '(doğrudan / uygulama)'
                      ELSE regexp_replace(referrer, '^https?://([^/]+).*$', '\\1')
                    END AS source,
                    COUNT(*)::int AS clicks
               FROM traffic_clicks
              WHERE group_id = ?
              GROUP BY 1
              ORDER BY clicks DESC
              LIMIT 20`,
            [id],
        );
        res.json({
            group: serializeGroup(group, site),
            byDay,
            byReferrer,
            clicks: clicks.map((c) => ({
                id: c.id,
                referrer: c.referrer,
                path: c.path,
                userAgent: c.user_agent,
                createdAt: c.created_at,
            })),
        });
    });
};
