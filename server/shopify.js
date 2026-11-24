/**
 * Shopify kanalı — hazır XSLT şablon katalog / yayın / indirme / hafif markalama.
 *
 * Auth:
 *   - Kanal (app backend): Authorization: Bearer <SHOPIFY_APP_SECRET>
 *   - Admin yayın: mevcut requireAdmin
 *
 * Mağaza kimliği (ileride OAuth): X-Shopify-Shop: store.myshopify.com
 *
 * Tasarım:
 *   - Hafif: POST .../brand → logo / renk / unvan uygulanmış XSLT
 *   - Tam: design_url → edxdocu editör (shopify_gallery query)
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { cleanText, optionalText, parseId } from './util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.join(__dirname, '..', 'shopify-app');

const DEFAULT_PRICE_CENTS = Number(process.env.SHOPIFY_TEMPLATE_PRICE_CENTS || 1499);
const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export async function createShopifySchema(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS shopify_listings (
            gallery_id     INTEGER PRIMARY KEY REFERENCES gallery_designs(id) ON DELETE CASCADE,
            price_cents    INTEGER NOT NULL DEFAULT 1499 CHECK (price_cents >= 0),
            countries      TEXT[] NOT NULL DEFAULT ARRAY['TR']::text[],
            active         BOOLEAN NOT NULL DEFAULT TRUE,
            created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`
        CREATE TABLE IF NOT EXISTS shopify_shops (
            id             SERIAL PRIMARY KEY,
            shop_domain    TEXT NOT NULL UNIQUE,
            edx_user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
            installed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`
        CREATE TABLE IF NOT EXISTS shopify_entitlements (
            id             SERIAL PRIMARY KEY,
            shop_domain    TEXT NOT NULL,
            gallery_id     INTEGER NOT NULL REFERENCES gallery_designs(id) ON DELETE CASCADE,
            charge_id      TEXT NOT NULL DEFAULT '',
            created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (shop_domain, gallery_id)
        )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_shopify_entitlements_shop ON shopify_entitlements (shop_domain)`);
}

const catalogSelect = `
    SELECT g.id, g.name, g.description, g.doc_type_id, g.module_id, g.sector, g.category,
           g.accent, g.tags, g.source, g.updated_at, g.created_at,
           l.price_cents, l.countries, l.active AS shopify_active
      FROM shopify_listings l
      JOIN gallery_designs g ON g.id = l.gallery_id
     WHERE l.active = TRUE AND g.published = TRUE
`;

const serializeCatalogItem = (row, { website }) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    doc_type_id: row.doc_type_id,
    module_id: row.module_id,
    sector: row.sector,
    category: row.category,
    accent: row.accent,
    tags: row.tags ?? [],
    source: row.source,
    price_cents: row.price_cents,
    currency: 'USD',
    countries: row.countries ?? ['TR'],
    updated_at: row.updated_at,
    created_at: row.created_at,
    design_url: designUrl(website, row.id, row.module_id),
    download_url: `/api/shopify/templates/${row.id}/download`,
    brand_url: `/api/shopify/templates/${row.id}/brand`,
});

function designUrl(website, galleryId, moduleId) {
    const base = String(website || 'https://www.edxdocu.com').replace(/\/$/, '');
    const u = new URL(base + '/');
    u.searchParams.set('shopify_gallery', String(galleryId));
    if (moduleId) u.searchParams.set('module', moduleId);
    return u.toString();
}

function normalizeShop(raw) {
    const s = String(raw || '').trim().toLowerCase();
    if (!s) return null;
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(s) && !/^[a-z0-9][a-z0-9.-]+$/.test(s)) return null;
    return s.slice(0, 128);
}

function requireShopifyChannel(secret) {
    return (req, res, next) => {
        if (!secret) {
            return res.status(503).json({ error: 'SHOPIFY_APP_SECRET tanımlı değil.' });
        }
        const hdr = String(req.headers.authorization || '');
        const token = hdr.startsWith('Bearer ') ? hdr.slice(7).trim() : String(req.headers['x-shopify-app-secret'] || '').trim();
        if (!token || token.length !== secret.length) {
            return res.status(401).json({ error: 'Shopify kanal yetkisi gerekli.' });
        }
        try {
            const a = Buffer.from(token);
            const b = Buffer.from(secret);
            if (!timingSafeEqual(a, b)) return res.status(401).json({ error: 'Shopify kanal yetkisi geçersiz.' });
        } catch {
            return res.status(401).json({ error: 'Shopify kanal yetkisi geçersiz.' });
        }
        req.shopDomain = normalizeShop(req.headers['x-shopify-shop'] || req.query.shop);
        next();
    };
}

/** Logo / renk / unvan — hazır şablona hafif marka (tam editör değil). */
export function applyBrand(xslt, { logoUrl, companyName, accent, previousAccent }) {
    let out = String(xslt || '');
    if (previousAccent && accent && previousAccent !== accent && HEX_RE.test(previousAccent) && HEX_RE.test(accent)) {
        const esc = previousAccent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        out = out.replace(new RegExp(esc, 'gi'), accent);
    } else if (accent && HEX_RE.test(accent)) {
        // Yaygın varsayılan lacivert tonlarını değiştir (şablonda accent yoksa).
        out = out.replace(/#1e3a8a/gi, accent).replace(/#1e40af/gi, accent);
    }
    if (logoUrl && /^https?:\/\//i.test(logoUrl) && logoUrl.length < 2000) {
        const safe = logoUrl.replace(/"/g, '&quot;');
        if (/\{\{EDX_LOGO_URL\}\}/.test(out)) {
            out = out.replace(/\{\{EDX_LOGO_URL\}\}/g, safe);
        } else if (/data-edx-logo|data-shopify-logo/i.test(out)) {
            out = out.replace(
                /(<img\b[^>]*(?:data-edx-logo|data-shopify-logo)[^>]*\bsrc=")[^"]*(")/i,
                `$1${safe}$2`
            );
        } else {
            const tag = `<div data-edx-brand-logo="1" style="margin:8px 0"><img src="${safe}" alt="" style="max-height:64px;max-width:220px"/></div>`;
            if (/<body\b[^>]*>/i.test(out)) out = out.replace(/<body\b[^>]*>/i, (m) => `${m}${tag}`);
            else out = tag + out;
        }
    }
    if (companyName) {
        const name = companyName.slice(0, 200);
        if (/\{\{EDX_COMPANY\}\}/.test(out)) out = out.replace(/\{\{EDX_COMPANY\}\}/g, name);
    }
    const stamp = `<!-- edxdocu-shopify-brand:${new Date().toISOString()} -->\n`;
    if (!out.includes('edxdocu-shopify-brand:')) {
        const decl = out.match(/^\uFEFF?\s*<\?xml[^?]*\?>[ \t]*\r?\n?/);
        out = decl ? out.slice(0, decl[0].length) + stamp + out.slice(decl[0].length) : stamp + out;
    }
    return out;
}

export function registerShopifyRoutes(app, { db, requireAdmin, website }) {
    const secret = process.env.SHOPIFY_APP_SECRET
        || (process.env.NODE_ENV !== 'production' ? 'dev-shopify-secret' : '');
    const freeDownload = process.env.SHOPIFY_FREE_DOWNLOAD === '1'
        || process.env.NODE_ENV !== 'production';
    const channel = requireShopifyChannel(secret);
    const site = (website || process.env.FRONTEND_URL || 'https://www.edxdocu.com').replace(/\/?$/, '/');

    // Gömülü app UI (Partner dashboard App URL → /shopify).
    // Express 5 path-to-regexp: `/shopify/*` çökertir; yalnız static + index yeterli.
    app.use('/shopify', express.static(APP_DIR, { index: 'index.html' }));

    app.get('/api/shopify/health', (_req, res) => {
        res.json({
            ok: true,
            channel_configured: Boolean(secret),
            free_download: freeDownload,
            default_price_cents: DEFAULT_PRICE_CENTS,
            design: { light_brand: true, full_editor: true },
        });
    });

    /** Katalog — yayınlanmış Shopify listing'ler */
    app.get('/api/shopify/templates', channel, async (req, res) => {
        const country = optionalText(req.query.country, 8)?.toUpperCase();
        const moduleId = optionalText(req.query.module_id, 64);
        let sql = catalogSelect;
        const params = [];
        if (country) {
            params.push(country);
            sql += ` AND $${params.length} = ANY (l.countries)`;
        }
        if (moduleId) {
            params.push(moduleId);
            sql += ` AND g.module_id = $${params.length}`;
        }
        sql += ' ORDER BY g.updated_at DESC';
        const { rows } = await db.pool.query(sql, params);
        res.json({
            templates: rows.map((r) => serializeCatalogItem(r, { website: site })),
            shop: req.shopDomain || null,
        });
    });

    app.get('/api/shopify/templates/:id', channel, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz şablon id.' });
        const { rows } = await db.pool.query(`${catalogSelect} AND g.id = $1`, [id]);
        const row = rows[0];
        if (!row) return res.status(404).json({ error: 'Şablon bulunamadı veya yayınlı değil.' });
        res.json(serializeCatalogItem(row, { website: site }));
    });

    async function assertEntitled(shopDomain, galleryId) {
        if (freeDownload) return true;
        if (!shopDomain) return false;
        const row = await db.get(
            'SELECT id FROM shopify_entitlements WHERE shop_domain = ? AND gallery_id = ?',
            [shopDomain, galleryId]
        );
        return Boolean(row);
    }

    /** Ham XSLT indir */
    app.get('/api/shopify/templates/:id/download', channel, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz şablon id.' });
        const { rows } = await db.pool.query(
            `${catalogSelect} AND g.id = $1`,
            [id]
        );
        const row = rows[0];
        if (!row) return res.status(404).json({ error: 'Şablon bulunamadı veya yayınlı değil.' });

        const full = await db.get('SELECT xslt, name FROM gallery_designs WHERE id = ?', [id]);
        if (!full?.xslt) return res.status(404).json({ error: 'XSLT yok.' });

        const ok = await assertEntitled(req.shopDomain, id);
        if (!ok) {
            return res.status(402).json({
                error: 'Bu şablon için satın alma gerekli.',
                price_cents: row.price_cents,
                currency: 'USD',
                purchase_hint: 'POST /api/shopify/templates/:id/purchase (Shopify Billing charge_id ile)',
            });
        }

        const filename = `${cleanText(full.name, 80) || 'template'}-${id}.xslt`.replace(/[^\w.\-ğüşıöçĞÜŞİÖÇ]+/gi, '_');
        res.setHeader('Content-Type', 'application/xslt+xml; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(full.xslt);
    });

    /** Hafif marka → XSLT (Shopify admin içinde logo/renk) */
    app.post('/api/shopify/templates/:id/brand', channel, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz şablon id.' });
        const { rows } = await db.pool.query(`${catalogSelect} AND g.id = $1`, [id]);
        if (!rows[0]) return res.status(404).json({ error: 'Şablon bulunamadı veya yayınlı değil.' });

        const ok = await assertEntitled(req.shopDomain, id);
        if (!ok) return res.status(402).json({ error: 'Bu şablon için satın alma gerekli.' });

        const full = await db.get('SELECT xslt, name, accent FROM gallery_designs WHERE id = ?', [id]);
        if (!full?.xslt) return res.status(404).json({ error: 'XSLT yok.' });

        const logoUrl = optionalText(req.body?.logo_url, 2000);
        const companyName = optionalText(req.body?.company_name, 200);
        const accent = optionalText(req.body?.accent, 32);
        if (accent && !HEX_RE.test(accent)) return res.status(400).json({ error: 'accent #RGB veya #RRGGBB olmalı.' });
        if (logoUrl && !/^https?:\/\//i.test(logoUrl)) return res.status(400).json({ error: 'logo_url http(s) olmalı.' });

        const xslt = applyBrand(full.xslt, {
            logoUrl,
            companyName,
            accent,
            previousAccent: full.accent || '',
        });
        const filename = `${cleanText(full.name, 80) || 'template'}-${id}-branded.xslt`.replace(/[^\w.\-]+/gi, '_');
        if (req.query.download === '1' || req.body?.download) {
            res.setHeader('Content-Type', 'application/xslt+xml; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.send(xslt);
        }
        res.json({
            id,
            name: full.name,
            filename,
            xslt,
            design_url: designUrl(site, id, rows[0].module_id),
        });
    });

    /**
     * Satın alma kaydı (Shopify Billing charge onayından sonra app backend çağırır).
     * Gerçek Billing API Shopify app tarafında; burada entitlement açılır.
     */
    app.post('/api/shopify/templates/:id/purchase', channel, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz şablon id.' });
        const shop = req.shopDomain || normalizeShop(req.body?.shop);
        if (!shop) return res.status(400).json({ error: 'X-Shopify-Shop veya body.shop gerekli.' });

        const { rows } = await db.pool.query(`${catalogSelect} AND g.id = $1`, [id]);
        if (!rows[0]) return res.status(404).json({ error: 'Şablon bulunamadı veya yayınlı değil.' });

        const chargeId = cleanText(req.body?.charge_id, 128) || `manual-${Date.now()}`;
        await db.run(
            `INSERT INTO shopify_shops (shop_domain, updated_at) VALUES (?, NOW())
             ON CONFLICT (shop_domain) DO UPDATE SET updated_at = NOW()`,
            [shop]
        );
        await db.run(
            `INSERT INTO shopify_entitlements (shop_domain, gallery_id, charge_id)
             VALUES (?, ?, ?)
             ON CONFLICT (shop_domain, gallery_id) DO UPDATE SET charge_id = EXCLUDED.charge_id`,
            [shop, id, chargeId]
        );
        res.json({
            ok: true,
            shop,
            gallery_id: id,
            charge_id: chargeId,
            download_url: `/api/shopify/templates/${id}/download`,
            design_url: designUrl(site, id, rows[0].module_id),
        });
    });

    /** Admin: galeri tasarımını Shopify kataloğuna yayınla */
    app.post('/api/admin/shopify/templates/:id/publish', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz id.' });
        const g = await db.get('SELECT id, published FROM gallery_designs WHERE id = ?', [id]);
        if (!g) return res.status(404).json({ error: 'Galeri tasarımı yok.' });

        const price = Number(req.body?.price_cents);
        const priceCents = Number.isFinite(price) && price >= 0 ? Math.round(price) : DEFAULT_PRICE_CENTS;
        let countries = req.body?.countries;
        if (!Array.isArray(countries) || !countries.length) countries = ['TR'];
        countries = countries.map((c) => String(c).toUpperCase().slice(0, 8)).filter(Boolean);

        if (!g.published) {
            await db.run('UPDATE gallery_designs SET published = TRUE, updated_at = NOW() WHERE id = ?', [id]);
        }
        const row = await db.get(
            `INSERT INTO shopify_listings (gallery_id, price_cents, countries, active, updated_at)
             VALUES (?, ?, ?::text[], TRUE, NOW())
             ON CONFLICT (gallery_id) DO UPDATE
               SET price_cents = EXCLUDED.price_cents,
                   countries = EXCLUDED.countries,
                   active = TRUE,
                   updated_at = NOW()
             RETURNING *`,
            [id, priceCents, countries]
        );
        res.json({
            ok: true,
            listing: {
                gallery_id: row.gallery_id,
                price_cents: row.price_cents,
                countries: row.countries,
                active: row.active,
                design_url: designUrl(site, id, null),
            },
        });
    });

    app.post('/api/admin/shopify/templates/:id/unpublish', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz id.' });
        const result = await db.run(
            'UPDATE shopify_listings SET active = FALSE, updated_at = NOW() WHERE gallery_id = ?',
            [id]
        );
        if (!result?.changes) return res.status(404).json({ error: 'Listing yok.' });
        res.json({ ok: true });
    });

    app.get('/api/admin/shopify/templates', requireAdmin, async (_req, res) => {
        const { rows } = await db.pool.query(`
            SELECT g.id, g.name, g.published, g.module_id, g.doc_type_id,
                   l.price_cents, l.countries, l.active, l.updated_at
              FROM shopify_listings l
              JOIN gallery_designs g ON g.id = l.gallery_id
             ORDER BY l.updated_at DESC
        `);
        res.json(rows);
    });

    /** HMAC doğrulama yardımcı (ileride OAuth callback) */
    app.post('/api/shopify/verify-hmac', channel, (req, res) => {
        const message = String(req.body?.message || '');
        const digest = String(req.body?.digest || '');
        if (!message || !digest || !secret) return res.status(400).json({ ok: false });
        const calc = createHmac('sha256', secret).update(message).digest('hex');
        const ok = calc.length === digest.length && timingSafeEqual(Buffer.from(calc), Buffer.from(digest));
        res.json({ ok });
    });
}
