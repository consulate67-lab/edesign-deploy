/**
 * Yönetim panelinden düzenlenen sosyal medya bağlantıları ve reklam / ölçüm kimlikleri.
 * Site açılışta GET /api/site-config ile okur; değerler sayfa kaynağında zaten herkese görünür.
 * Kimlikler betik adreslerine, bağlantılar href'e girdiği için yalnız bilinen biçimler kabul edilir.
 */
import { isPlainObject, optionalText } from './util.js';

const KEY = 'site_config';

export const DEFAULT_SITE_CONFIG = {
    tracking: {
        gtmId: 'GTM-K39HMWQT',
        googleTagId: '',
        googleAdsConversions: { signUp: '', purchase: '' },
        metaPixelId: '',
        linkedinPartnerId: '',
        linkedinConversions: { signUp: '', purchase: '' },
    },
    social: { instagram: '', facebook: '', youtube: '', linkedin: '', x: '', tiktok: '' },
};

const ID_RULES = {
    gtmId: [/^GTM-[A-Z0-9]{4,12}$/, 'Tag Manager kimliği GTM-XXXXXXX biçiminde olmalı.'],
    googleTagId: [/^(G|AW|GT|DC)-[A-Z0-9]{4,15}$/, 'Google etiketi G-XXXXXXX veya AW-XXXXXXX biçiminde olmalı.'],
    adsConversion: [/^AW-\d{6,15}\/[A-Za-z0-9_-]{4,40}$/, 'Google Ads dönüşümü AW-123456789/abcDEF biçiminde olmalı.'],
    metaPixelId: [/^\d{10,20}$/, 'Meta Pixel kimliği yalnız rakamlardan oluşmalı (15-16 hane).'],
    linkedinId: [/^\d{3,12}$/, 'LinkedIn kimlikleri yalnız rakamlardan oluşmalı.'],
};

const SOCIAL_HOSTS = {
    instagram: ['instagram.com'],
    facebook: ['facebook.com', 'fb.com'],
    youtube: ['youtube.com', 'youtu.be'],
    linkedin: ['linkedin.com'],
    x: ['x.com', 'twitter.com'],
    tiktok: ['tiktok.com'],
};

const SOCIAL_LABELS = { instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', linkedin: 'LinkedIn', x: 'X (Twitter)', tiktok: 'TikTok' };

class InputError extends Error {}

const parseId = (value, rule, upper = true) => {
    const text = optionalText(value, 80);
    if (text === null) throw new InputError(ID_RULES[rule][1]);
    const v = upper ? text.toUpperCase() : text;
    if (v && !ID_RULES[rule][0].test(v)) throw new InputError(ID_RULES[rule][1]);
    return v;
};

const parseSocial = (value, name) => {
    const text = optionalText(value, 300);
    const error = `${SOCIAL_LABELS[name]} bağlantısı https://${SOCIAL_HOSTS[name][0]}/... biçiminde olmalı.`;
    if (text === null) throw new InputError(error);
    if (!text) return '';
    let url;
    try { url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`); } catch { throw new InputError(error); }
    const host = url.hostname.toLowerCase().replace(/^(www|m)\./, '');
    if (!SOCIAL_HOSTS[name].includes(host) || url.username || url.password) throw new InputError(error);
    url.protocol = 'https:';
    return url.toString();
};

const parseConfig = (body) => {
    const t = isPlainObject(body?.tracking) ? body.tracking : {};
    const s = isPlainObject(body?.social) ? body.social : {};
    const ads = isPlainObject(t.googleAdsConversions) ? t.googleAdsConversions : {};
    const li = isPlainObject(t.linkedinConversions) ? t.linkedinConversions : {};
    return {
        tracking: {
            gtmId: parseId(t.gtmId, 'gtmId'),
            googleTagId: parseId(t.googleTagId, 'googleTagId'),
            googleAdsConversions: {
                signUp: parseId(ads.signUp, 'adsConversion', false),
                purchase: parseId(ads.purchase, 'adsConversion', false),
            },
            metaPixelId: parseId(t.metaPixelId, 'metaPixelId'),
            linkedinPartnerId: parseId(t.linkedinPartnerId, 'linkedinId'),
            linkedinConversions: {
                signUp: parseId(li.signUp, 'linkedinId'),
                purchase: parseId(li.purchase, 'linkedinId'),
            },
        },
        social: Object.fromEntries(Object.keys(SOCIAL_HOSTS).map((k) => [k, parseSocial(s[k], k)])),
    };
};

/** Kayıtlı değerler varsayılanların üstüne yazılır; sonradan eklenen alanlar varsayılanla gelir. */
const withDefaults = (stored) => {
    const d = DEFAULT_SITE_CONFIG;
    const t = isPlainObject(stored?.tracking) ? stored.tracking : {};
    return {
        tracking: {
            ...d.tracking,
            ...t,
            googleAdsConversions: { ...d.tracking.googleAdsConversions, ...t.googleAdsConversions },
            linkedinConversions: { ...d.tracking.linkedinConversions, ...t.linkedinConversions },
        },
        social: { ...d.social, ...(isPlainObject(stored?.social) ? stored.social : {}) },
    };
};

export const createSiteConfigSchema = async (client) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS site_settings (
            key         TEXT PRIMARY KEY,
            value       JSONB NOT NULL,
            updated_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
};

export const registerSiteConfigRoutes = (app, { db, requireAdmin }) => {
    let cache = null;
    const read = async () => {
        if (!cache) {
            const row = await db.get('SELECT value FROM site_settings WHERE key = ?', [KEY]);
            cache = withDefaults(row?.value);
        }
        return cache;
    };

    app.get('/api/site-config', async (_req, res) => {
        res.set('Cache-Control', 'public, max-age=60');
        res.json(await read());
    });

    app.get('/api/admin/site-config', requireAdmin, async (_req, res) => {
        res.json(await read());
    });

    app.put('/api/admin/site-config', requireAdmin, async (req, res) => {
        let value;
        try {
            value = parseConfig(req.body);
        } catch (e) {
            if (e instanceof InputError) return res.status(400).json({ error: e.message });
            throw e;
        }
        await db.run(
            `INSERT INTO site_settings (key, value, updated_by, updated_at) VALUES (?, ?::jsonb, ?, NOW())
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = NOW()
             RETURNING key`,
            [KEY, JSON.stringify(value), req.admin.id]
        );
        cache = value;
        res.json(value);
    });
};
