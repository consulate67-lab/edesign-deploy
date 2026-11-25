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
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import jwt from 'jsonwebtoken';
import { cleanText, optionalText, parseId } from './util.js';
import {
    createOneTimePurchase,
    exchangeOfflineToken,
    getOneTimePurchaseStatus,
} from './shopify-billing.js';
import {
    ensureReadyShopifyCatalog,
    SHOPIFY_COUNTRY_OPTIONS,
} from './shopify-ready-catalog.js';
import {
    findHazirEntry,
    findShopifyHazirEntry,
    getShopifyHazirIndex,
    listShopifyCatalogSectors,
    loadHazirFiles,
    materializeHazirTemplate,
    serializeHazirItem,
} from './shopify-hazir-catalog.js';
import {
    applySupplierToUblXml,
    applyTestWatermark,
    getShopifyOrder,
    getShopifyShop,
    listShopifyOrders,
    orderToUblInvoiceXml,
} from './shopify-order-ubl.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.join(__dirname, '..', 'shopify-app');

const DEFAULT_PRICE_CENTS = Number(process.env.SHOPIFY_TEMPLATE_PRICE_CENTS || 1499);
const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Partner client ID (tarayıcıya verilebilir) + secret (yalnız sunucu). */
function shopifyClientCreds() {
    const apiKey = (process.env.SHOPIFY_API_KEY || process.env.SHOPIFY_CLIENT_ID || '').trim();
    const apiSecret = (process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_CLIENT_SECRET || '').trim();
    return { apiKey, apiSecret };
}

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
            access_token   TEXT,
            scope          TEXT,
            installed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`ALTER TABLE shopify_shops ADD COLUMN IF NOT EXISTS access_token TEXT`);
    await client.query(`ALTER TABLE shopify_shops ADD COLUMN IF NOT EXISTS scope TEXT`);
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
    await client.query(`
        CREATE TABLE IF NOT EXISTS shopify_pending_charges (
            id             SERIAL PRIMARY KEY,
            shop_domain    TEXT NOT NULL,
            gallery_id     INTEGER NOT NULL REFERENCES gallery_designs(id) ON DELETE CASCADE,
            charge_gid     TEXT NOT NULL UNIQUE,
            status         TEXT NOT NULL DEFAULT 'PENDING',
            created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_shopify_pending_charges_shop ON shopify_pending_charges (shop_domain)`);
    await client.query(`
        CREATE TABLE IF NOT EXISTS shopify_compliance_webhooks (
            id             SERIAL PRIMARY KEY,
            topic          TEXT NOT NULL,
            shop_domain    TEXT,
            payload        JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

function verifyShopifyWebhookHmac(rawBody, hmacHeader, secret) {
    if (!secret || !hmacHeader || !rawBody) return false;
    const digest = createHmac('sha256', secret).update(rawBody).digest('base64');
    const a = Buffer.from(digest);
    const b = Buffer.from(String(hmacHeader));
    if (a.length !== b.length) return false;
    try {
        return timingSafeEqual(a, b);
    } catch {
        return false;
    }
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
    u.searchParams.set('shopify_embed', '1');
    if (galleryId) u.searchParams.set('shopify_gallery', String(galleryId));
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

function isUsableLogoSrc(src) {
    if (!src || typeof src !== 'string') return false;
    if (/^https?:\/\//i.test(src) && src.length < 2000) return true;
    // Wizard yüklemeleri: data:image/...;base64,...
    if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/i.test(src) && src.length < 600_000) return true;
    return false;
}

function brandEsc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Logo / renk / unvan / iletişim / banka — hazır şablona hafif marka (tam editör değil). */
export function applyBrand(xslt, {
    logoUrl, companyName, accent, previousAccent,
    phone, email, website, address, bankName, iban, accountName,
}) {
    let out = String(xslt || '');
    if (previousAccent && accent && previousAccent !== accent && HEX_RE.test(previousAccent) && HEX_RE.test(accent)) {
        const esc = previousAccent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        out = out.replace(new RegExp(esc, 'gi'), accent);
    } else if (accent && HEX_RE.test(accent)) {
        // Yaygın varsayılan lacivert tonlarını değiştir (şablonda accent yoksa).
        out = out.replace(/#1e3a8a/gi, accent).replace(/#1e40af/gi, accent);
    }
    if (isUsableLogoSrc(logoUrl)) {
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
        else if (/data-edx-company/i.test(out)) {
            out = out.replace(
                /(<[^>]*data-edx-company[^>]*>)([^<]*)(<\/)/i,
                `$1${name.replace(/</g, '')}$3`
            );
        }
    }
    const placeholders = {
        '{{EDX_PHONE}}': phone,
        '{{EDX_EMAIL}}': email,
        '{{EDX_WEBSITE}}': website,
        '{{EDX_ADDRESS}}': address,
        '{{EDX_BANK}}': bankName,
        '{{EDX_IBAN}}': iban,
        '{{EDX_ACCOUNT}}': accountName,
    };
    for (const [token, val] of Object.entries(placeholders)) {
        if (val && out.includes(token)) out = out.split(token).join(String(val).slice(0, 300));
    }
    if (iban || bankName || accountName) {
        const lines = [
            bankName ? `Banka: ${brandEsc(bankName)}` : '',
            accountName ? `Hesap: ${brandEsc(accountName)}` : '',
            iban ? `IBAN: ${brandEsc(iban)}` : '',
        ].filter(Boolean).join('<br/>');
        if (lines && !/data-edx-bank/i.test(out)) {
            const tag = `<div data-edx-bank="1" style="margin:10px 0;padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;font:12px/1.45 Segoe UI,sans-serif;color:#0f172a">${lines}</div>`;
            if (/<\/body>/i.test(out)) out = out.replace(/<\/body>/i, `${tag}</body>`);
            else out += tag;
        }
    }
    const stamp = `<!-- edxdocu-shopify-brand:${new Date().toISOString()} -->\n`;
    if (!out.includes('edxdocu-shopify-brand:')) {
        const decl = out.match(/^\uFEFF?\s*<\?xml[^?]*\?>[ \t]*\r?\n?/);
        out = decl ? out.slice(0, decl[0].length) + stamp + out.slice(decl[0].length) : stamp + out;
    }
    return out;
}

function parseBanksParam(raw) {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.trim()) {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

function supplierFromRequest(req, shopProfile = null) {
    const q = req.query || {};
    const b = req.body || {};
    const pick = (key, max) => optionalText(b[key] ?? q[key], max);
    const base = shopProfile || {};
    const banks = parseBanksParam(b.banks ?? q.banks);
    const bankName = pick('bank_name', 120) || '';
    const iban = pick('iban', 34) || '';
    const accountName = pick('account_name', 200) || '';
    if (!banks.length && (bankName || iban || accountName)) {
        banks.push({ bank_name: bankName, iban, account_name: accountName });
    }
    return {
        name: pick('company_name', 200) || base.name || '',
        email: pick('email', 200) || base.email || '',
        phone: pick('phone', 64) || base.phone || '',
        website: pick('website', 300) || base.website || '',
        address: pick('address', 300) || base.address || '',
        city: pick('city', 120) || base.city || '',
        province: pick('province', 120) || base.province || '',
        zip: pick('zip', 32) || base.zip || '',
        country: pick('country_name', 80) || base.country || 'Türkiye',
        country_code: pick('country_code', 8) || base.country_code || 'TR',
        bank_name: banks[0]?.bank_name || bankName || '',
        iban: banks[0]?.iban || iban || '',
        account_name: banks[0]?.account_name || accountName || '',
        banks,
    };
}

export function registerShopifyRoutes(app, { db, requireAdmin, website }) {
    const secret = process.env.SHOPIFY_APP_SECRET
        || (process.env.NODE_ENV !== 'production' ? 'dev-shopify-secret' : '');
    const freeDownload = process.env.SHOPIFY_FREE_DOWNLOAD === '1'
        || process.env.NODE_ENV !== 'production';
    /**
     * Gerçek Shopify Billing: yalnız SHOPIFY_BILLING_ENABLED=1 (Public app).
     * Custom distribution Billing API kullanamaz — varsayılan stub/test hakkı.
     */
    const billingEnabled = process.env.SHOPIFY_BILLING_ENABLED === '1';
    const billingStub = !billingEnabled || process.env.SHOPIFY_BILLING_STUB === '1';
    const billingTest = process.env.SHOPIFY_BILLING_TEST === '1'
        || process.env.NODE_ENV !== 'production';
    const channel = requireShopifyChannel(secret);
    const site = (website || process.env.FRONTEND_URL || 'https://www.edxdocu.com').replace(/\/?$/, '/');
    const siteOrigin = site.replace(/\/$/, '');
    const { apiKey: shopifyApiKey, apiSecret: shopifyApiSecret } = shopifyClientCreds();
    /**
     * Production + API key/secret varken session token zorunlu (App Store embedded checks).
     * SHOPIFY_REQUIRE_SESSION=0 ile gevşetilebilir.
     */
    const sessionReady = Boolean(shopifyApiKey && shopifyApiSecret);
    const requireSession = process.env.SHOPIFY_REQUIRE_SESSION === '1'
        || (process.env.SHOPIFY_REQUIRE_SESSION !== '0' && sessionReady && process.env.NODE_ENV === 'production');

    /** Hazır ülke şablonlarını bir kez (veya arada) vitrine yazar. */
    let catalogReady = null;
    const ensureCatalog = () => {
        if (!catalogReady) {
            catalogReady = ensureReadyShopifyCatalog(db, { priceCents: DEFAULT_PRICE_CENTS })
                .then((r) => {
                    console.log(`[shopify] ready catalog: ${r.upserted} listing`);
                    return r;
                })
                .catch((e) => {
                    catalogReady = null;
                    console.error('[shopify] ready catalog seed failed:', e.message || e);
                    throw e;
                });
        }
        return catalogReady;
    };
    // Arka planda doldur; ilk katalog isteği de await eder.
    ensureCatalog().catch(() => {});

    async function upsertShopToken(shop, accessToken, scope) {
        await db.run(
            `INSERT INTO shopify_shops (shop_domain, access_token, scope, updated_at)
             VALUES (?, ?, ?, NOW())
             ON CONFLICT (shop_domain) DO UPDATE SET
               access_token = COALESCE(EXCLUDED.access_token, shopify_shops.access_token),
               scope = COALESCE(EXCLUDED.scope, shopify_shops.scope),
               updated_at = NOW()`,
            [shop, accessToken || null, scope || null]
        );
    }

    async function getShopAccessToken(shop) {
        const row = await db.get('SELECT access_token FROM shopify_shops WHERE shop_domain = ?', [shop]);
        return row?.access_token || null;
    }

    async function clearShopAccessToken(shop) {
        if (!shop) return;
        await db.run(
            `UPDATE shopify_shops SET access_token = NULL, scope = NULL, updated_at = NOW() WHERE shop_domain = ?`,
            [shop]
        );
    }

    function shopInstallUrl(_shop) {
        // İmzasız install_custom_app linki Shopify’da “geçersiz” olur.
        // Geçerli link yalnız Dev Dashboard → Distribution → Generate link ile üretilir.
        return null;
    }

    function humanizeShopifyAuthError(msg, shop) {
        const raw = String(msg || '');
        if (/not installed/i.test(raw)) {
            return 'Uygulama bu Client ID ile mağazaya kurulu değil. Client ID değiştiyse eski EdXDocu’yu kaldırıp Partner’daki güncel uygulamayı yeniden yükleyin.';
        }
        if (/invalid.*session|session token/i.test(raw)) {
            return 'Shopify oturumu geçersiz. Uygulamayı Admin → Apps → EdXDocu üzerinden yeniden açın.';
        }
        return raw || 'Shopify kimlik doğrulama hatası.';
    }

    async function ensureOfflineToken(req, shop, { refresh = false } = {}) {
        const hdr = String(req.headers.authorization || '');
        const sessionToken = hdr.startsWith('Bearer ') ? hdr.slice(7).trim() : '';
        const cached = refresh ? null : await getShopAccessToken(shop);

        // Oturum varken her zaman token exchange dene — DB’de eski app’ten kalmış token olabilir
        if (sessionToken && shopifyApiKey && shopifyApiSecret) {
            try {
                const exchanged = await exchangeOfflineToken({
                    shop,
                    sessionToken,
                    apiKey: shopifyApiKey,
                    apiSecret: shopifyApiSecret,
                });
                await upsertShopToken(shop, exchanged.accessToken, exchanged.scope);
                return exchanged.accessToken;
            } catch (e) {
                const msg = String(e.message || e);
                if (/not installed/i.test(msg)) {
                    await clearShopAccessToken(shop);
                }
                if (cached && !/not installed/i.test(msg)) return cached;
                throw new Error(humanizeShopifyAuthError(msg, shop));
            }
        }

        if (cached) return cached;
        if (!shopifyApiKey || !shopifyApiSecret) {
            throw new Error('SHOPIFY_API_KEY / SHOPIFY_API_SECRET tanımlı değil.');
        }
        throw new Error('Shopify oturum token gerekli (uygulamayı admin içinden açın).');
    }

    async function grantEntitlement(shop, galleryId, chargeId) {
        await db.run(
            `INSERT INTO shopify_shops (shop_domain, updated_at) VALUES (?, NOW())
             ON CONFLICT (shop_domain) DO UPDATE SET updated_at = NOW()`,
            [shop]
        );
        await db.run(
            `INSERT INTO shopify_entitlements (shop_domain, gallery_id, charge_id)
             VALUES (?, ?, ?)
             ON CONFLICT (shop_domain, gallery_id) DO UPDATE SET charge_id = EXCLUDED.charge_id`,
            [shop, galleryId, chargeId]
        );
    }

    // Gömülü app UI — index.html içine API key enjekte + App Bridge CDN.
    const indexPath = path.join(APP_DIR, 'index.html');
    const serveShopifyIndex = (_req, res) => {
        let html = fs.readFileSync(indexPath, 'utf8');
        html = html.replace(/%%SHOPIFY_API_KEY%%/g, shopifyApiKey || '');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Security-Policy', "frame-ancestors https://*.myshopify.com https://admin.shopify.com;");
        res.send(html);
    };
    // Mutlak /shopify/styles.css + /shopify/app.js kullanıldığı için slash yönlendirmesi gerekmez
    // (Express non-strict routing /shopify ile /shopify/’yi aynı route’ta birleştirir → redirect döngüsü olur).
    app.get(['/shopify', '/shopify/'], serveShopifyIndex);
    // Gömülü XsltEditor (vite → shopify-app/editor); index:false olduğu için açıkça servis et
    const editorIndex = path.join(APP_DIR, 'editor', 'index.html');
    app.get(['/shopify/editor', '/shopify/editor/'], (_req, res) => {
        if (!fs.existsSync(editorIndex)) {
            return res.status(503).send('Shopify editör build yok. npm run build:shopify-editor');
        }
        res.setHeader('Content-Security-Policy', "frame-ancestors https://*.myshopify.com https://admin.shopify.com https://www.edxdocu.com 'self';");
        res.sendFile(editorIndex);
    });
    app.use('/shopify', express.static(APP_DIR, { index: false }));

    /** Mandatory compliance webhooks (App Store). Partner’da bu URL’yi kaydet. */
    // GET: tarayıcı / sağlık kontrolü (Shopify teslimatı POST’tur).
    app.get('/api/shopify/webhooks/compliance', (_req, res) => {
        res.status(200).json({
            ok: true,
            method: 'POST',
            topics: ['customers/data_request', 'customers/redact', 'shop/redact'],
            note: 'Shopify compliance webhooks bu URI’ye POST + HMAC ile gelir.',
        });
    });
    app.post('/api/shopify/webhooks/compliance', async (req, res) => {
        const hmac = req.get('X-Shopify-Hmac-Sha256') || '';
        const raw = req.rawBody;
        const secretForHmac = shopifyApiSecret || secret;
        if (!verifyShopifyWebhookHmac(raw, hmac, secretForHmac)) {
            return res.status(401).send('Invalid HMAC');
        }
        const topic = String(req.get('X-Shopify-Topic') || req.query.topic || '').toLowerCase();
        let payload = req.body;
        if (Buffer.isBuffer(payload)) {
            try { payload = JSON.parse(payload.toString('utf8')); } catch { payload = {}; }
        }
        const shopDomain = normalizeShop(payload?.shop_domain) || normalizeShop(req.get('X-Shopify-Shop-Domain'));
        try {
            await db.run(
                `INSERT INTO shopify_compliance_webhooks (topic, shop_domain, payload)
                 VALUES (?, ?, ?::jsonb)`,
                [topic || 'unknown', shopDomain, JSON.stringify(payload || {})]
            );
            if (topic === 'shop/redact' && shopDomain) {
                await db.run('DELETE FROM shopify_entitlements WHERE shop_domain = ?', [shopDomain]);
                await db.run('DELETE FROM shopify_pending_charges WHERE shop_domain = ?', [shopDomain]);
                await db.run('DELETE FROM shopify_shops WHERE shop_domain = ?', [shopDomain]);
            }
            // customers/data_request & customers/redact: müşteri PII saklamıyoruz; 200 yeterli.
            res.status(200).json({ ok: true });
        } catch (e) {
            console.error('[shopify] compliance webhook error:', e);
            res.status(500).json({ error: 'Webhook işlenemedi.' });
        }
    });

    app.get('/api/shopify/health', (_req, res) => {
        res.json({
            ok: true,
            channel_configured: Boolean(secret),
            free_download: freeDownload,
            billing_stub: billingStub,
            billing_test: billingTest,
            billing_enabled: billingEnabled && !billingStub,
            default_price_cents: DEFAULT_PRICE_CENTS,
            design: { light_brand: true, full_editor: true },
            app_bridge: { api_key_configured: Boolean(shopifyApiKey), session_ready: sessionReady, require_session: requireSession },
            compliance_webhooks: {
                uri: `${siteOrigin}/api/shopify/webhooks/compliance`,
                topics: ['customers/data_request', 'customers/redact', 'shop/redact'],
            },
        });
    });

    /**
     * Gömülü Shopify app UI — tarayıcı secret görmez.
     * Same-origin /api/shopify/ui/* ; opsiyonel App Bridge ID token (JWT) doğrulama.
     */
    const uiShop = (req) => normalizeShop(
        req.shopDomain
        || req.headers['x-shopify-shop']
        || req.query.shop
        || req.body?.shop
    );

    function verifyIdToken(token) {
        const payload = jwt.verify(token, shopifyApiSecret, {
            algorithms: ['HS256'],
            audience: shopifyApiKey,
            // App Bridge bazen nbf’yi birkaç sn geleceğe koyar
            clockTolerance: 60,
        });
        const iss = String(payload.iss || '');
        const dest = String(payload.dest || '');
        const issuerHost = new URL(iss).hostname;
        const destHost = new URL(dest).hostname;
        if (!issuerHost || !destHost || issuerHost !== destHost) {
            const err = new Error('iss/dest uyuşmuyor');
            err.code = 'ISS_DEST';
            throw err;
        }
        return { payload, destHost };
    }

    /**
     * @param {{ required?: boolean }} [opts]
     * required=false: token yok/geçersizse UI yine açılsın (bootstrap / katalog).
     * required=true: satın alma / indirme için zorunlu.
     */
    function shopifyIdToken(opts = {}) {
        const required = opts.required === true || (opts.required !== false && requireSession);
        return (req, res, next) => {
            if (!sessionReady) return next();
            const hdr = String(req.headers.authorization || '');
            const token = hdr.startsWith('Bearer ') ? hdr.slice(7).trim() : '';
            if (!token) {
                if (required) {
                    res.setHeader('X-Shopify-Retry-Invalid-Session-Request', '1');
                    return res.status(401).json({ error: 'Shopify oturum token gerekli.' });
                }
                return next();
            }
            try {
                const { payload, destHost } = verifyIdToken(token);
                req.shopifySession = payload;
                req.shopDomain = normalizeShop(destHost) || req.shopDomain;
                return next();
            } catch (e) {
                console.warn('[shopify] idToken verify failed:', e?.name || '', e?.message || e);
                if (required) {
                    res.setHeader('X-Shopify-Retry-Invalid-Session-Request', '1');
                    return res.status(401).json({ error: 'Geçersiz Shopify oturum token.' });
                }
                // Soft: bozuk/eski token bootstrap’ı düşürmesin
                return next();
            }
        };
    }

    // Geriye dönük alias
    const optionalShopifyIdToken = shopifyIdToken({ required: false });

    app.get('/api/shopify/ui/bootstrap', shopifyIdToken({ required: false }), async (req, res) => {
        try {
            await ensureCatalog();
        } catch {
            /* katalog seed hata verse de UI açılsın */
        }
        const shop = uiShop(req);
        let shopProfile = null;
        let shopWarning = null;
        if (shop) {
            try {
                const token = await ensureOfflineToken(req, shop);
                shopProfile = await getShopifyShop({ shop, accessToken: token });
            } catch (e) {
                shopWarning = e.message || 'Mağaza bilgisi alınamadı.';
                console.warn('[shopify] shop profile:', shopWarning);
            }
        }
        const needsReinstall = /kurulu değil|not installed/i.test(String(shopWarning || ''));
        res.json({
            ok: true,
            shop,
            shop_profile: shopProfile,
            shop_warning: shopWarning,
            needs_reinstall: needsReinstall,
            install_url: shop ? shopInstallUrl(shop) : null,
            free_download: freeDownload,
            billing_stub: billingStub,
            billing_test: billingTest,
            billing_enabled: billingEnabled && !billingStub,
            default_price_cents: DEFAULT_PRICE_CENTS,
            currency: 'USD',
            website: site,
            api_key: shopifyApiKey || null,
            session_ready: sessionReady,
            require_session: requireSession,
            countries: SHOPIFY_COUNTRY_OPTIONS,
            sectors: listShopifyCatalogSectors(),
            steps: ['intro', 'catalog', 'customize', 'download'],
            how_to: [
                {
                    title: 'Şablon seçin',
                    body: 'E-ticaret sektörüne uygun hazır e-fatura / irsaliye tasarımını seçin.',
                },
                {
                    title: 'Markanızı uygulayın',
                    body: 'Shopify mağaza bilgileriniz (ünvan, telefon, e-posta, adres) otomatik gelir; banka/IBAN ekleyebilirsiniz.',
                },
                {
                    title: 'İsterseniz detaylı düzenleyin',
                    body: 'Daha fazla değişiklik için edXdocu tam editörünü bu panelde açabilirsiniz.',
                },
                {
                    title: 'XSLT indirin',
                    body: 'Dosyayı indirip kendi e-fatura entegratörünüze yükleyin. Shopify siparişlerini otomatik göndermez.',
                },
            ],
        });
    });

    app.get('/api/shopify/ui/shop', optionalShopifyIdToken, async (req, res) => {
        const shop = uiShop(req);
        if (!shop) return res.status(400).json({ error: 'shop gerekli.', shop_profile: null });
        try {
            let shopProfile = null;
            try {
                const token = await ensureOfflineToken(req, shop);
                shopProfile = await getShopifyShop({ shop, accessToken: token });
            } catch {
                const token = await ensureOfflineToken(req, shop, { refresh: true });
                shopProfile = await getShopifyShop({ shop, accessToken: token });
            }
            res.json({ shop, shop_profile: shopProfile });
        } catch (e) {
            const warning = humanizeShopifyAuthError(e.message || e, shop);
            res.json({
                shop,
                shop_profile: null,
                warning,
                needs_reinstall: /kurulu değil|not installed/i.test(warning),
                install_url: shopInstallUrl(shop),
            });
        }
    });

    app.post('/api/shopify/ui/patch-xml', optionalShopifyIdToken, async (req, res) => {
        try {
            const shopProfile = await resolveShopProfile(req);
            const supplier = supplierFromRequest(req, shopProfile);
            const xmlIn = String(req.body?.xml || '');
            if (!xmlIn) return res.status(400).json({ error: 'xml gerekli.' });
            const xml = applySupplierToUblXml(xmlIn, supplier);
            res.json({ xml, supplier, shop_profile: shopProfile });
        } catch (e) {
            res.status(500).json({ error: e.message || 'XML güncellenemedi.' });
        }
    });

    async function resolveGalleryId(idParam) {
        const raw = decodeURIComponent(String(idParam || ''));
        if (raw.startsWith('hazir:')) {
            const entry = findShopifyHazirEntry(raw) || findHazirEntry(raw);
            if (!entry) return null;
            return materializeHazirTemplate(db, entry, { priceCents: DEFAULT_PRICE_CENTS });
        }
        return parseId(raw);
    }

    async function listTemplates({ country, moduleId, docType, sector }) {
        await ensureCatalog();
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
        if (docType) {
            params.push(docType);
            sql += ` AND g.doc_type_id = $${params.length}`;
        }
        if (sector && (!country || country === 'TR')) {
            params.push(sector);
            sql += ` AND g.sector = $${params.length}`;
        }
        sql += ' ORDER BY g.updated_at DESC';
        const { rows } = await db.pool.query(sql, params);
        let dbItems = rows.map((r) => serializeCatalogItem(r, { website: site }));

        // TR: dosya tabanlı e-Fatura / e-Arşiv / e-İrsaliye — Shopify’da e-ticaret seti
        const wantHazir = !country || country === 'TR';
        if (!wantHazir) return dbItems;

        const ecomSet = new Set(listShopifyCatalogSectors().map((s) => s.id));
        dbItems = dbItems.filter((d) => !d.sector || ecomSet.has(d.sector));

        let hazir = getShopifyHazirIndex();
        if (docType) hazir = hazir.filter((h) => h.doc_type_id === docType);
        if (moduleId) hazir = hazir.filter((h) => h.module_id === moduleId);
        if (sector) hazir = hazir.filter((h) => h.sector === sector);
        const hazirItems = hazir.map((h) => serializeHazirItem(h, {
            website: site,
            priceCents: DEFAULT_PRICE_CENTS,
        }));

        // DB’deki TR listing’leri hazir ile birleştir; aynı isim+modül tekrarını at
        const seen = new Set(hazirItems.map((h) => `${h.module_id}::${h.name}`.toLowerCase()));
        const extra = dbItems.filter((d) => {
            if (country === 'TR' || !country) {
                const key = `${d.module_id}::${d.name}`.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
            }
            return true;
        });
        return [...hazirItems, ...extra];
    }

    const requireUiSession = shopifyIdToken({ required: requireSession });

    app.get('/api/shopify/ui/templates', optionalShopifyIdToken, async (req, res) => {
        try {
            const country = optionalText(req.query.country, 8)?.toUpperCase();
            const moduleId = optionalText(req.query.module_id, 64);
            const docType = optionalText(req.query.doc_type, 32)?.toLowerCase();
            const sector = optionalText(req.query.sector, 64)?.toLowerCase();
            const templates = await listTemplates({ country, moduleId, docType, sector });
            res.json({
                templates,
                shop: uiShop(req),
                country: country || null,
                doc_type: docType || null,
                sector: sector || null,
                countries: SHOPIFY_COUNTRY_OPTIONS,
                sectors: (!country || country === 'TR') ? listShopifyCatalogSectors() : [],
                doc_types: [
                    { id: '', label: 'Tümü' },
                    { id: 'fatura', label: 'e-Fatura' },
                    { id: 'arsiv', label: 'e-Arşiv' },
                    { id: 'irsaliye', label: 'e-İrsaliye' },
                ],
            });
        } catch (e) {
            res.status(500).json({ error: e.message || 'Katalog alınamadı.' });
        }
    });

    app.get('/api/shopify/ui/orders', optionalShopifyIdToken, async (req, res) => {
        const shop = uiShop(req);
        if (!shop) return res.status(400).json({ error: 'shop gerekli.', orders: [] });
        try {
            const token = await ensureOfflineToken(req, shop);
            const orders = await listShopifyOrders({ shop, accessToken: token, first: 30 });
            res.json({ orders, shop });
        } catch (e) {
            console.warn('[shopify] orders list:', e.message || e);
            res.json({
                orders: [],
                shop,
                warning: e.message || 'Siparişler alınamadı. read_orders yetkisi ve yeniden kurulum gerekebilir.',
            });
        }
    });

    async function resolveShopProfile(req) {
        const shop = uiShop(req);
        if (!shop) return null;
        const tryOnce = async (refresh) => {
            const token = await ensureOfflineToken(req, shop, { refresh });
            return getShopifyShop({ shop, accessToken: token });
        };
        try {
            return await tryOnce(false);
        } catch (e1) {
            try {
                return await tryOnce(true);
            } catch (e2) {
                console.warn('[shopify] shop profile:', e2.message || e1.message || e2);
                return null;
            }
        }
    }

    async function resolvePreviewPayload(req) {
        const raw = decodeURIComponent(String(req.params.id || ''));
        let xslt = '';
        let xml = '';
        let meta = {};
        if (raw.startsWith('hazir:')) {
            const entry = findShopifyHazirEntry(raw) || findHazirEntry(raw);
            const files = loadHazirFiles(entry);
            if (!files?.xslt) return null;
            xslt = files.xslt;
            xml = files.xml || '';
            meta = {
                id: entry.id,
                name: entry.name,
                module_id: entry.module_id,
                doc_type_id: entry.doc_type_id,
            };
        } else {
            const id = parseId(raw);
            if (!id) return null;
            const full = await db.get(
                'SELECT id, name, module_id, doc_type_id, xslt, xml FROM gallery_designs WHERE id = ?',
                [id]
            );
            if (!full?.xslt) return null;
            xslt = full.xslt;
            xml = full.xml || '';
            meta = {
                id: full.id,
                name: full.name,
                module_id: full.module_id,
                doc_type_id: full.doc_type_id,
            };
        }

        const shopProfile = await resolveShopProfile(req);
        const supplier = supplierFromRequest(req, shopProfile);
        meta.shop_profile = shopProfile;

        const orderId = optionalText(req.query.order_id, 128);
        let orderWarning = null;
        if (orderId) {
            const shop = uiShop(req);
            try {
                if (!shop) throw new Error('shop gerekli');
                const token = await ensureOfflineToken(req, shop);
                const order = await getShopifyOrder({ shop, accessToken: token, orderId });
                if (!order) throw new Error('Sipariş bulunamadı');
                xml = orderToUblInvoiceXml(order, supplier);
                meta.order_id = order.id;
                meta.order_name = order.name;
            } catch (e) {
                orderWarning = e.message || 'Sipariş XML üretilemedi; örnek XML kullanıldı.';
                xml = applySupplierToUblXml(xml, supplier);
            }
        } else {
            xml = applySupplierToUblXml(xml, supplier);
        }
        return { ...meta, xslt, xml, order_warning: orderWarning, supplier };
    }

    app.get('/api/shopify/ui/templates/:id/preview-source', optionalShopifyIdToken, async (req, res) => {
        try {
            const payload = await resolvePreviewPayload(req);
            if (!payload?.xslt) return res.status(404).json({ error: 'Önizleme kaynağı bulunamadı.' });
            return res.json(payload);
        } catch (e) {
            res.status(500).json({ error: e.message || 'Önizleme alınamadı.' });
        }
    });

    /** Tam editör iframe URL’si (hazir şablonları galeriye materialize eder). */
    app.get('/api/shopify/ui/templates/:id/editor-src', optionalShopifyIdToken, async (req, res) => {
        try {
            const raw = decodeURIComponent(String(req.params.id || ''));
            let galleryId = null;
            let moduleId = null;
            if (raw.startsWith('hazir:')) {
                const entry = findShopifyHazirEntry(raw) || findHazirEntry(raw);
                if (!entry) return res.status(404).json({ error: 'Şablon bulunamadı.' });
                galleryId = await materializeHazirTemplate(db, entry, { priceCents: DEFAULT_PRICE_CENTS });
                moduleId = entry.module_id;
            } else {
                galleryId = parseId(raw);
                if (!galleryId) return res.status(400).json({ error: 'Geçersiz şablon id.' });
                const row = await db.get('SELECT module_id FROM gallery_designs WHERE id = ?', [galleryId]);
                moduleId = row?.module_id || null;
            }
            const url = designUrl(site, galleryId, moduleId);
            res.json({ ok: true, url, gallery_id: galleryId });
        } catch (e) {
            res.status(500).json({ error: e.message || 'Editör URL alınamadı.' });
        }
    });

    app.get('/api/shopify/ui/templates/:id', optionalShopifyIdToken, async (req, res) => {
        const raw = decodeURIComponent(String(req.params.id || ''));
        if (raw.startsWith('hazir:')) {
            const entry = findShopifyHazirEntry(raw) || findHazirEntry(raw);
            if (!entry) return res.status(404).json({ error: 'Şablon bulunamadı.' });
            return res.json(serializeHazirItem(entry, { website: site, priceCents: DEFAULT_PRICE_CENTS }));
        }
        const id = parseId(raw);
        if (!id) return res.status(400).json({ error: 'Geçersiz şablon id.' });
        const { rows } = await db.pool.query(`${catalogSelect} AND g.id = $1`, [id]);
        if (!rows[0]) return res.status(404).json({ error: 'Şablon bulunamadı veya yayınlı değil.' });
        res.json(serializeCatalogItem(rows[0], { website: site }));
    });

    app.post('/api/shopify/ui/templates/:id/purchase', requireUiSession, async (req, res) => {
        const id = await resolveGalleryId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz şablon id.' });
        const shop = uiShop(req);
        if (!shop) return res.status(400).json({ error: 'Mağaza (shop) gerekli. Shopify içinden açın veya ?shop= ekleyin.' });

        const { rows } = await db.pool.query(`${catalogSelect} AND g.id = $1`, [id]);
        if (!rows[0]) return res.status(404).json({ error: 'Şablon bulunamadı veya yayınlı değil.' });

        const already = await assertEntitledUi(shop, id);
        if (already) {
            return res.json({
                ok: true,
                already_entitled: true,
                shop,
                gallery_id: id,
                download_url: `/api/shopify/ui/templates/${id}/download`,
                design_url: designUrl(site, id, rows[0].module_id),
            });
        }

        // Geliştirme / stub: charge oluşturmadan hak aç
        if (billingStub || freeDownload) {
            const chargeId = cleanText(req.body?.charge_id, 128) || `stub-${Date.now()}`;
            await grantEntitlement(shop, id, chargeId);
            return res.json({
                ok: true,
                stub: true,
                shop,
                gallery_id: id,
                charge_id: chargeId,
                download_url: `/api/shopify/ui/templates/${id}/download`,
                design_url: designUrl(site, id, rows[0].module_id),
            });
        }

        try {
            const accessToken = await ensureOfflineToken(req, shop);
            const amount = ((rows[0].price_cents || DEFAULT_PRICE_CENTS) / 100).toFixed(2);
            const returnUrl = new URL(`${siteOrigin}/shopify/`);
            returnUrl.searchParams.set('shop', shop);
            returnUrl.searchParams.set('billing', 'return');
            returnUrl.searchParams.set('gallery_id', String(id));

            const purchase = await createOneTimePurchase({
                shop,
                accessToken,
                name: `edXdocu: ${rows[0].name || `template-${id}`}`,
                amount,
                currencyCode: 'USD',
                returnUrl: returnUrl.toString(),
                test: billingTest,
            });

            await db.run(
                `INSERT INTO shopify_pending_charges (shop_domain, gallery_id, charge_gid, status, updated_at)
                 VALUES (?, ?, ?, ?, NOW())
                 ON CONFLICT (charge_gid) DO UPDATE SET
                   status = EXCLUDED.status,
                   updated_at = NOW()`,
                [shop, id, purchase.chargeGid, purchase.status || 'PENDING']
            );

            res.json({
                ok: true,
                shop,
                gallery_id: id,
                charge_gid: purchase.chargeGid,
                confirmation_url: purchase.confirmationUrl,
                test: billingTest,
            });
        } catch (e) {
            const msg = e.message || 'Billing başlatılamadı';
            const hint = /billing|distribution|public|charge/i.test(msg)
                ? ' Custom distribution Billing desteklemez; Public app + App Store gerekir.'
                : '';
            res.status(502).json({ error: msg + hint, billing_required: true });
        }
    });

    /** Merchant charge onayından dönüş — ACTIVE ise entitlement */
    app.get('/api/shopify/ui/billing/confirm', requireUiSession, async (req, res) => {
        const shop = uiShop(req);
        const galleryId = parseId(req.query.gallery_id);
        const chargeGid = cleanText(req.query.charge_gid || req.query.charge_id, 200);
        if (!shop || !galleryId) {
            return res.status(400).json({ error: 'shop ve gallery_id gerekli.' });
        }

        try {
            let gid = chargeGid;
            if (!gid) {
                const pending = await db.get(
                    `SELECT charge_gid FROM shopify_pending_charges
                      WHERE shop_domain = ? AND gallery_id = ?
                      ORDER BY created_at DESC LIMIT 1`,
                    [shop, galleryId]
                );
                gid = pending?.charge_gid;
            }
            if (!gid) return res.status(404).json({ error: 'Bekleyen charge bulunamadı.' });

            let token = null;
            try {
                token = await ensureOfflineToken(req, shop);
            } catch {
                token = await getShopAccessToken(shop);
            }
            if (!token) return res.status(401).json({ error: 'Mağaza access token yok; uygulamayı yeniden açın.' });

            const status = await getOneTimePurchaseStatus({ shop, accessToken: token, chargeGid: gid });
            await db.run(
                `UPDATE shopify_pending_charges SET status = ?, updated_at = NOW() WHERE charge_gid = ?`,
                [status.status, gid]
            );

            if (status.status !== 'ACTIVE') {
                return res.status(402).json({
                    error: `Ödeme henüz aktif değil (status=${status.status}).`,
                    status: status.status,
                    charge_gid: gid,
                });
            }

            await grantEntitlement(shop, galleryId, gid);
            res.json({
                ok: true,
                shop,
                gallery_id: galleryId,
                charge_gid: gid,
                status: status.status,
                download_url: `/api/shopify/ui/templates/${galleryId}/download`,
            });
        } catch (e) {
            res.status(502).json({ error: e.message || 'Charge doğrulanamadı.' });
        }
    });

    app.get('/api/shopify/ui/templates/:id/entitled', requireUiSession, async (req, res) => {
        const id = await resolveGalleryId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz şablon id.' });
        const shop = uiShop(req);
        const ok = shop ? await assertEntitledUi(shop, id) : false;
        res.json({ entitled: ok, shop, gallery_id: id, free_download: freeDownload });
    });

    app.get('/api/shopify/ui/templates/:id/download', (req, res, next) => {
        const testMode = String(req.query.mode || '').toLowerCase() === 'test';
        return (testMode ? optionalShopifyIdToken : requireUiSession)(req, res, next);
    }, async (req, res) => {
        const testMode = String(req.query.mode || '').toLowerCase() === 'test';
        const id = await resolveGalleryId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz şablon id.' });
        req.shopDomain = uiShop(req);
        const { rows } = await db.pool.query(`${catalogSelect} AND g.id = $1`, [id]);
        const row = rows[0];
        if (!row) return res.status(404).json({ error: 'Şablon bulunamadı veya yayınlı değil.' });
        const full = await db.get('SELECT xslt, name FROM gallery_designs WHERE id = ?', [id]);
        if (!full?.xslt) return res.status(404).json({ error: 'XSLT yok.' });
        if (!testMode) {
            const ok = await assertEntitledUi(req.shopDomain, id);
            if (!ok) {
                return res.status(402).json({
                    error: 'Bu şablon için önce testi onaylayıp satın alma adımını tamamlayın.',
                    price_cents: row.price_cents,
                    currency: 'USD',
                });
            }
        }
        let body = full.xslt;
        if (testMode) body = applyTestWatermark(body);
        const baseName = `${cleanText(full.name, 80) || 'template'}-${id}`.replace(/[^\w.\-ğüşıöçĞÜŞİÖÇ]+/gi, '_');
        const filename = testMode ? `${baseName}-test.xslt` : `${baseName}.xslt`;
        res.setHeader('Content-Type', 'application/xslt+xml; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('X-Edxdocu-Download-Mode', testMode ? 'test' : 'live');
        res.send(body);
    });

    app.post('/api/shopify/ui/templates/:id/brand', requireUiSession, async (req, res) => {
        const id = await resolveGalleryId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz şablon id.' });
        req.shopDomain = uiShop(req);
        const { rows } = await db.pool.query(`${catalogSelect} AND g.id = $1`, [id]);
        if (!rows[0]) return res.status(404).json({ error: 'Şablon bulunamadı veya yayınlı değil.' });
        const ok = await assertEntitledUi(req.shopDomain, id);
        if (!ok) return res.status(402).json({ error: 'Bu şablon için önce satın alma adımını tamamlayın.' });

        const full = await db.get('SELECT xslt, name, accent FROM gallery_designs WHERE id = ?', [id]);
        if (!full?.xslt) return res.status(404).json({ error: 'XSLT yok.' });

        const logoUrl = optionalText(req.body?.logo_url, 600_000);
        const companyName = optionalText(req.body?.company_name, 200);
        const accent = optionalText(req.body?.accent, 32);
        const phone = optionalText(req.body?.phone, 64);
        const email = optionalText(req.body?.email, 200);
        const website = optionalText(req.body?.website, 300);
        const address = optionalText(req.body?.address, 300);
        const bankName = optionalText(req.body?.bank_name, 120);
        const iban = optionalText(req.body?.iban, 34);
        const accountName = optionalText(req.body?.account_name, 200);
        if (accent && !HEX_RE.test(accent)) return res.status(400).json({ error: 'accent #RGB veya #RRGGBB olmalı.' });
        if (logoUrl && !isUsableLogoSrc(logoUrl)) {
            return res.status(400).json({ error: 'logo_url http(s) veya data:image/... olmalı.' });
        }

        const xslt = applyBrand(full.xslt, {
            logoUrl,
            companyName,
            accent,
            previousAccent: full.accent || '',
            phone,
            email,
            website,
            address,
            bankName,
            iban,
            accountName,
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

    async function assertEntitledUi(shopDomain, galleryId) {
        if (freeDownload) return true;
        if (!shopDomain) return false;
        const row = await db.get(
            'SELECT id FROM shopify_entitlements WHERE shop_domain = ? AND gallery_id = ?',
            [shopDomain, galleryId]
        );
        return Boolean(row);
    }

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

        const logoUrl = optionalText(req.body?.logo_url, 600_000);
        const companyName = optionalText(req.body?.company_name, 200);
        const accent = optionalText(req.body?.accent, 32);
        if (accent && !HEX_RE.test(accent)) return res.status(400).json({ error: 'accent #RGB veya #RRGGBB olmalı.' });
        if (logoUrl && !isUsableLogoSrc(logoUrl)) {
            return res.status(400).json({ error: 'logo_url http(s) veya data:image/... olmalı.' });
        }

        const xslt = applyBrand(full.xslt, {
            logoUrl,
            companyName,
            accent,
            previousAccent: full.accent || '',
            phone: optionalText(req.body?.phone, 64),
            email: optionalText(req.body?.email, 200),
            website: optionalText(req.body?.website, 300),
            address: optionalText(req.body?.address, 300),
            bankName: optionalText(req.body?.bank_name, 120),
            iban: optionalText(req.body?.iban, 34),
            accountName: optionalText(req.body?.account_name, 200),
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
