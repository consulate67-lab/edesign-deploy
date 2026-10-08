import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { initDb } from './db.js';
import { createRequireAdmin, registerAdminAuthRoutes } from './admin-auth.js';
import { registerAdminRoutes } from './admin.js';
import { registerGalleryRoutes } from './gallery.js';
import { attachRealtime, touchLastSeen } from './realtime.js';
import { registerSupportRoutes } from './support.js';
import { createBotHandler } from './telegram-bot.js';
import { startPolling } from './telegram.js';

const app = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';

// JWT secret must be supplied via env in production.
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY && NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production.');
}
if (!SECRET_KEY) {
    console.warn('[SECURITY] JWT_SECRET not set — using insecure development fallback. DO NOT use in production.');
}
const EFFECTIVE_SECRET = SECRET_KEY || 'dev-only-insecure-fallback-do-not-use-in-production';

// Allowed CORS origins. Comma-separated. Defaults to local dev hosts.
// Sprint 1.4 (2026-10-02): production domain'ler eklendi (api.edesign-deploy.com, edesign-deploy.com).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS
    || 'http://localhost:5173,http://localhost:3002,http://127.0.0.1:5173,http://127.0.0.1:3002,https://edesign-deploy.com,https://www.edesign-deploy.com,https://api.edesign-deploy.com,https://consulate67-lab.github.io')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

// Railway önünde tek proxy katmanı var; req.ip gerçek istemci adresi olur (giriş sınırlaması için).
app.set('trust proxy', 1);

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow same-origin or curl-like requests with no origin header.
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        return callback(Object.assign(new Error(`CORS policy violation: origin ${origin} not allowed`), { status: 403 }));
    },
    credentials: true,
}));
// Tasarımlar gömülü resimlerle (base64) birkaç MB olabilir.
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: false })); // iyzico callback form-encoded POST eder

let db;

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, EFFECTIVE_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Start Server
initDb().then(async _db => {
    db = _db;
    const requireAdmin = createRequireAdmin({ db, secret: EFFECTIVE_SECRET });
    registerAdminAuthRoutes(app, { db, secret: EFFECTIVE_SECRET, requireAdmin });
    registerAdminRoutes(app, { db, requireAdmin });
    registerGalleryRoutes(app, { db, requireAdmin });
    registerSupportRoutes(app, { db, authenticateToken });
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        if (status >= 500) console.error('[server] error:', err);
        res.status(status).json({ error: status >= 500 ? 'Sunucu hatası.' : err.message });
    });

    const server = app.listen(PORT, () => {
        const host = process.env.HOST || '0.0.0.0';
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Server running on http://localhost:${PORT}`);
        } else {
            console.log(`[server] Listening on ${host}:${PORT} (env=${NODE_ENV})`);
        }
    });
    await attachRealtime(server, { db, secret: EFFECTIVE_SECRET });
    startPolling(createBotHandler(db));
});

// Health endpoint used by Railway's healthcheck (and uptime monitors).
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        env: NODE_ENV,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, password, full_name, company_name, phone_number } = req.body;

    if (!username || !password || !full_name || !company_name) {
        return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurunuz (E-posta, Şifre, Ad Soyad, Firma)' });
    }

    try {
        // Öncelikli kontrol: Kullanıcı zaten var mı?
        const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser) {
            return res.status(400).json({ error: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run(
            'INSERT INTO users (username, password, full_name, company_name, phone_number) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, full_name, company_name, phone_number]
        );

        res.json({ message: 'User created', userId: result.lastID });
    } catch (e) {
        console.error("Kayıt Hatası:", e);
        if (e.message.includes('UNIQUE constraint') || e.message.includes('already exists')) {
            return res.status(400).json({ error: 'Bu e-posta adresi zaten kayıtlı.' });
        }
        res.status(500).json({ error: e.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) return res.status(400).json({ error: 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Girdiğiniz şifre hatalı. Lütfen tekrar deneyin.' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, EFFECTIVE_SECRET);
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, credits: user.credits } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get User Info (Credits)
app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.get('SELECT id, username, role, credits, free_design_used, full_name, company_name, phone_number FROM users WHERE id = ?', [req.user.id]);
        touchLastSeen(db, req.user.id);
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Mock Payment (Add Credits) - Commission based logic placeholder
// In real world, this would be a webhook from Stripe/Iyzico
// Plan prices MUST stay in sync with the Landing page (Landing.tsx → PACKAGES_PLANS)
// and the in-app PaymentModal.tsx → PACKAGES_PLANS.
const PLAN_AMOUNT_TO_CREDITS = {
    1500: 1,      // One
    4500: 10,     // Basic
    9000: 25,     // Pro
};

app.post('/api/payment/mock', authenticateToken, async (req, res) => {
    // Odemesiz kredi ekler — canli ortamda kapali.
    if (process.env.NODE_ENV === 'production') return res.sendStatus(404);
    const { amount } = req.body;
    let creditsToAdd = 0;

    if (typeof amount === 'number' && PLAN_AMOUNT_TO_CREDITS[amount] !== undefined) {
        creditsToAdd = PLAN_AMOUNT_TO_CREDITS[amount];
    } else {
        // Fallback: keep a sensible per-credit floor so legacy / wrong amounts
        // still produce some credits instead of zero. Should never happen
        // when the modal is the only entry point.
        creditsToAdd = Math.floor((amount || 0) / 400);
    }

    try {
        await db.run('UPDATE users SET credits = credits + ? WHERE id = ?', [creditsToAdd, req.user.id]);
        const updatedUser = await db.get('SELECT credits FROM users WHERE id = ?', [req.user.id]);
        res.json({ success: true, credits: updatedUser.credits });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Consume Credit (Design Save/Export)
app.post('/api/design/consume-credit', authenticateToken, async (req, res) => {
    try {
        const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

        if (user.role === 'admin') {
            return res.json({ success: true, message: 'Admin bypass', credits: user.credits });
        }

        if (user.credits > 0) {
            await db.run('UPDATE users SET credits = credits - 1 WHERE id = ?', [req.user.id]);
            const updated = await db.get('SELECT credits FROM users WHERE id = ?', [req.user.id]);
            return res.json({ success: true, message: 'Credit consumed', credits: updated.credits });
        }

        res.status(403).json({ error: 'İşlem için yeterli krediniz bulunmamaktadır.', paymentRequired: true });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin: Make me rich
app.post('/api/admin/add-credits', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403);
    }
    try {
        await db.run('UPDATE users SET credits = credits + 1000 WHERE id = ?', [req.user.id]);
        res.json({ success: true, message: 'Dev credits added' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin: One-time password reset (recover access for an existing account).
// Protected by ADMIN_KEY env var (NOT JWT_SECRET). Caller must pass
//   { admin_key, username, new_password }
// Disable / delete this endpoint once the recovery is done by setting
// ADMIN_KEY to an empty string in Railway env — the endpoint will refuse
// to operate.
app.post('/api/_dev/reset-password', async (req, res) => {
    const { admin_key, username, new_password } = req.body || {};

    const expected = process.env.ADMIN_KEY;
    if (!expected) {
        return res.status(503).json({ error: 'ADMIN_KEY env is not configured on server.' });
    }
    if (admin_key !== expected) {
        return res.status(403).json({ error: 'Invalid admin key.' });
    }
    if (!username || !new_password) {
        return res.status(400).json({ error: 'username and new_password are required.' });
    }
    if (new_password.length < 6) {
        return res.status(400).json({ error: 'new_password must be at least 6 characters.' });
    }

    try {
        const existing = await db.get('SELECT id FROM users WHERE username = ?', [username]);
        if (!existing) {
            return res.status(404).json({ error: `User '${username}' not found.` });
        }
        const hashed = await bcrypt.hash(new_password, 10);
        await db.run(
            'UPDATE users SET password = ?, updated_at = NOW() WHERE username = ?',
            [hashed, username]
        );
        // Do NOT log the password, only the username.
        console.log(`[admin] password reset for user '${username}' at ${new Date().toISOString()}`);
        res.json({ success: true, message: `Password reset for '${username}'.` });

    } catch (e) {
        console.error('[admin] reset-password error:', e);
        res.status(500).json({ error: e.message });
    }
});

// 2026-09-26: Kontör tanımlama endpoint'i — admin tarafından kullanıcıya kredi ekler.
// Aynı ADMIN_KEY gate ile korunuyor. Production'da ADMIN_KEY bos ise calismaz.
app.post('/api/_dev/add-credits', async (req, res) => {
    const { admin_key, username, credits } = req.body || {};

    const expected = process.env.ADMIN_KEY;
    if (!expected) {
        return res.status(503).json({ error: 'ADMIN_KEY env is not configured on server.' });
    }
    if (admin_key !== expected) {
        return res.status(403).json({ error: 'Invalid admin key.' });
    }
    if (!username || typeof credits !== 'number' || credits <= 0) {
        return res.status(400).json({ error: 'username and positive credits number are required.' });
    }

    try {
        const user = await db.get('SELECT id, credits FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(404).json({ error: `User '${username}' not found.` });
        }
        await db.run(
            'UPDATE users SET credits = credits + ?, updated_at = NOW() WHERE id = ?',
            [credits, user.id]
        );
        const updated = await db.get('SELECT credits FROM users WHERE id = ?', [user.id]);
        console.log(`[admin] ${credits} credits added to '${username}' (total=${updated.credits}) at ${new Date().toISOString()}`);
        res.json({
            success: true,
            message: `${credits} credits added to '${username}'.`,
            previousCredits: user.credits,
            newCredits: updated.credits,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ============================================================================
// Sprint 1 (2026-10-02) — Designs CRUD API
// Kullanici tasarimlarini DB'de saklama, listeleme, guncelleme, silme.
// user_id JWT'den gelir — kullanicilar sadece kendi tasarimlarini gormeli/persist.
// ============================================================================

const serializeDesign = (row) => row ? ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    module_id: row.module_id,
    xslt_content: row.xslt_content,
    custom_content: row.custom_content,
    theme_color: row.theme_color,
    sections: row.sections_json || null,   // JSONB -> otomatik parse
    status: row.status,
    design_key: row.design_key || null,
    xml_content: row.xml_content || null,
    paid: !!row.paid_at,
    paid_at: row.paid_at || null,
    download_count: row.download_count || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
}) : null;

// POST /api/designs — Yeni tasarim olustur
app.post('/api/designs', authenticateToken, async (req, res) => {
    const { name, module_id, xslt_content, custom_content, theme_color, sections, xml_content } = req.body || {};

    if (!name || !module_id) {
        return res.status(400).json({ error: 'name ve module_id zorunludur.' });
    }
    if (name.length > 200) {
        return res.status(400).json({ error: 'Tasarim adi 200 karakteri asmamali.' });
    }

    try {
        const sectionsJson = sections ? JSON.stringify(sections) : null;
        const result = await db.run(
            `INSERT INTO designs (user_id, name, module_id, xslt_content, custom_content, theme_color, sections_json, xml_content)
             VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?)`,
            [req.user.id, name, module_id, xslt_content || null, custom_content || null, theme_color || null, sectionsJson, xml_content || null]
        );
        const created = await db.get('SELECT * FROM designs WHERE id = ?', [result.lastID]);
        // eslint-disable-next-line no-console
        console.log(`[designs] user=${req.user.id} created design #${result.lastID} (${name})`);
        res.json({ success: true, design: serializeDesign(created) });
    } catch (e) {
        console.error('[designs] create error:', e);
        res.status(500).json({ error: e.message });
    }
});

// GET /api/designs — Kullanicinin tum tasarimlari (en yeni ustte)
app.get('/api/designs', authenticateToken, async (req, res) => {
    try {
        const rows = await db.all(
            `SELECT * FROM designs WHERE user_id = ? ORDER BY updated_at DESC LIMIT 200`,
            [req.user.id]
        );
        res.json({ designs: rows.map(serializeDesign) });
    } catch (e) {
        console.error('[designs] list error:', e);
        res.status(500).json({ error: e.message });
    }
});

// GET /api/designs/:id — Tek tasarim (sadece sahibi)
app.get('/api/designs/:id', authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Gecersiz tasarim id.' });
    }
    try {
        const row = await db.get('SELECT * FROM designs WHERE id = ?', [id]);
        if (!row) return res.status(404).json({ error: 'Tasarim bulunamadi.' });
        if (row.user_id !== req.user.id) return res.status(403).json({ error: 'Bu tasarima erisim yetkiniz yok.' });
        res.json({ design: serializeDesign(row) });
    } catch (e) {
        console.error('[designs] get error:', e);
        res.status(500).json({ error: e.message });
    }
});

// PUT /api/designs/:id — Guncelle (sadece sahibi)
app.put('/api/designs/:id', authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Gecersiz tasarim id.' });
    }
    const { name, xslt_content, custom_content, theme_color, sections, status, xml_content } = req.body || {};
    try {
        const existing = await db.get('SELECT * FROM designs WHERE id = ?', [id]);
        if (!existing) return res.status(404).json({ error: 'Tasarim bulunamadi.' });
        if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Bu tasarimi guncelleme yetkiniz yok.' });
        if (existing.paid_at && (xslt_content !== undefined || xml_content !== undefined || custom_content !== undefined || sections !== undefined)) {
            return res.status(403).json({ error: 'Onaylanmis (satin alinmis) tasarim duzenlenemez; yalnizca indirilebilir.' });
        }

        const updates = [];
        const params = [];
        if (name !== undefined) { updates.push('name = ?'); params.push(name); }
        if (xslt_content !== undefined) { updates.push('xslt_content = ?'); params.push(xslt_content); }
        if (custom_content !== undefined) { updates.push('custom_content = ?'); params.push(custom_content); }
        if (theme_color !== undefined) { updates.push('theme_color = ?'); params.push(theme_color); }
        if (sections !== undefined) { updates.push('sections_json = ?::jsonb'); params.push(JSON.stringify(sections)); }
        if (status !== undefined) { updates.push('status = ?'); params.push(status); }
        if (xml_content !== undefined) { updates.push('xml_content = ?'); params.push(xml_content); }
        if (updates.length === 0) {
            return res.status(400).json({ error: 'Guncellenecek alan belirtilmedi.' });
        }
        updates.push('updated_at = NOW()');
        params.push(id);

        await db.run(`UPDATE designs SET ${updates.join(', ')} WHERE id = ?`, params);
        const updated = await db.get('SELECT * FROM designs WHERE id = ?', [id]);
        // eslint-disable-next-line no-console
        console.log(`[designs] user=${req.user.id} updated design #${id}`);
        res.json({ success: true, design: serializeDesign(updated) });
    } catch (e) {
        console.error('[designs] update error:', e);
        res.status(500).json({ error: e.message });
    }
});

// DELETE /api/designs/:id — Sil (sadece sahibi)
app.delete('/api/designs/:id', authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Gecersiz tasarim id.' });
    }
    try {
        const existing = await db.get('SELECT * FROM designs WHERE id = ?', [id]);
        if (!existing) return res.status(404).json({ error: 'Tasarim bulunamadi.' });
        if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Bu tasarimi silme yetkiniz yok.' });

        await db.run('DELETE FROM designs WHERE id = ?', [id]);
        // eslint-disable-next-line no-console
        console.log(`[designs] user=${req.user.id} deleted design #${id} (${existing.name})`);
        res.json({ success: true, message: 'Tasarim silindi.' });
    } catch (e) {
        console.error('[designs] delete error:', e);
        res.status(500).json({ error: e.message });
    }
});

// Onaylanan XSLT'ye yazılan tasarım anahtarı. Onaylı tasarım kilitlidir:
// anahtarlı dosya editöre alınmaz, yalnızca saklanan hali tekrar indirilir.
const DESIGN_KEY_RE = /edesign-key:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
const DESIGN_KEY_COMMENT_RE = /<!--\s*edesign-key:[^>]*?-->[ \t]*\r?\n?/gi;
const embedDesignKey = (xslt, key) => {
    const clean = xslt.replace(/^(?:\uFEFF|\u00EF\u00BB\u00BF)+/, '').replace(DESIGN_KEY_COMMENT_RE, '');
    const comment = `<!-- edesign-key:${key} | Onaylanmis tasarim. Tasarimcida tekrar duzenlenemez; hesabinizdaki Tasarimlarim bolumunden tekrar indirebilirsiniz. -->\n`;
    const decl = clean.match(/^\uFEFF?\s*<\?xml[^?]*\?>[ \t]*\r?\n?/);
    return decl ? clean.slice(0, decl[0].length) + comment + clean.slice(decl[0].length) : comment + clean;
};

// GET /api/designs/by-key/:key — Yüklenen dosyadaki anahtarın tasarımı (sadece sahibi)
app.get('/api/designs/by-key/:key', authenticateToken, async (req, res) => {
    const key = String(req.params.key || '');
    if (!DESIGN_KEY_RE.test(`edesign-key:${key}`)) return res.status(400).json({ error: 'Gecersiz tasarim anahtari.' });
    try {
        const row = await db.get('SELECT * FROM designs WHERE design_key = ? AND user_id = ?', [key, req.user.id]);
        if (!row) return res.status(404).json({ error: 'Bu anahtara ait tasariminiz bulunamadi.' });
        res.json({ design: serializeDesign(row) });
    } catch (e) {
        console.error('[designs] by-key error:', e);
        res.status(500).json({ error: e.message });
    }
});

// POST /api/designs/export — Onay: 1 tasarım hakkı düşer, içerik ve önizleme
// XML'i saklanır, anahtar XSLT'ye yazılıp geri döner. Onaylı tasarımda
// (paid_at dolu) gönderilen içerik yok sayılır, saklanan dosya ücretsiz döner.
app.post('/api/designs/export', authenticateToken, async (req, res) => {
    const { design_id, design_key, name, module_id, xslt_content, xml_content } = req.body || {};
    if (typeof xslt_content !== 'string' || !xslt_content.trim()) {
        return res.status(400).json({ error: 'xslt_content zorunludur.' });
    }
    if (!module_id) return res.status(400).json({ error: 'module_id zorunludur.' });
    const designName = String(name || 'Tasarim').slice(0, 200);
    const xml = typeof xml_content === 'string' ? xml_content : null;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const user = (await client.query('SELECT id, role, credits FROM users WHERE id = $1 FOR UPDATE', [req.user.id])).rows[0];
        if (!user) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Kullanici bulunamadi.' });
        }

        const findBy = async (column, value) => (await client.query(
            `SELECT * FROM designs WHERE ${column} = $1 AND user_id = $2 FOR UPDATE`, [value, user.id]
        )).rows[0] || null;
        let existing = null;
        const id = Number(design_id);
        if (Number.isInteger(id) && id > 0) existing = await findBy('id', id);
        const keyInFile = xslt_content.match(DESIGN_KEY_RE)?.[1];
        for (const k of [design_key, keyInFile]) {
            if (!existing && typeof k === 'string' && k) existing = await findBy('design_key', k);
        }

        let credits = user.credits;
        if (existing?.paid_at) {
            // Onaylı tasarım kilitli: gönderilen içerik yok sayılır, saklanan dosya verilir.
            const row = (await client.query(
                `UPDATE designs SET download_count = download_count + 1, updated_at = NOW() WHERE id = $1 RETURNING *`,
                [existing.id]
            )).rows[0];
            await client.query('COMMIT');
            console.log(`[designs] user=${user.id} re-download design #${row.id}`);
            return res.json({ success: true, charged: false, credits, design: serializeDesign(row) });
        }

        let charged = false;
        if (user.role !== 'admin') {
            if (user.credits <= 0) {
                await client.query('ROLLBACK');
                return res.status(402).json({ error: 'Tasarimi indirmek icin tasarim hakkiniz kalmadi.', paymentRequired: true });
            }
            credits = (await client.query('UPDATE users SET credits = credits - 1 WHERE id = $1 RETURNING credits', [user.id])).rows[0].credits;
            charged = true;
        }

        const key = existing?.design_key || randomUUID();
        const content = embedDesignKey(xslt_content, key);
        const row = existing
            ? (await client.query(
                `UPDATE designs SET name = $1, module_id = $2, xslt_content = $3, xml_content = COALESCE($4, xml_content),
                        design_key = $5, paid_at = COALESCE(paid_at, NOW()), status = 'downloaded',
                        download_count = download_count + 1, updated_at = NOW()
                  WHERE id = $6 RETURNING *`,
                [designName, module_id, content, xml, key, existing.id]
            )).rows[0]
            : (await client.query(
                `INSERT INTO designs (user_id, name, module_id, xslt_content, xml_content, design_key, paid_at, status, download_count)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'downloaded', 1) RETURNING *`,
                [user.id, designName, module_id, content, xml, key]
            )).rows[0];
        await client.query('COMMIT');
        console.log(`[designs] user=${user.id} export design #${row.id} charged=${charged}`);
        res.json({ success: true, charged, credits, design: serializeDesign(row) });
    } catch (e) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('[designs] export error:', e);
        res.status(500).json({ error: e.message });
    } finally {
        client.release();
    }
});

// ============================================================================
// Sprint 1.3 (2026-10-02) — Iyzico Checkout Form entegrasyonu
// Plan satin aliminda 3D Secure odeme. Sandbox/prod key'ler env'den okunur.
// API doc: https://dev.iyzipay.com/en/checkout-form
// ============================================================================

const IYZICO_API_KEY = process.env.IYZICO_API_KEY || 'sandbox-afXkVKnA1uEqRvFALwYP7IvTW9rwM3Vo';
const IYZICO_SECRET = process.env.IYZICO_SECRET || 'sandbox-WnDkE3Zg9Lr5mYqFpKcVxH2bA4tN8jC7vD5sR6yQ8eT3wF4gH';
const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || 'https://api.iyzipay.com';
// Callback URL — odeme sonrasi iyzico bu URL'e POST eder. ENV ile override edilebilir.
const IYZICO_CALLBACK_URL = process.env.IYZICO_CALLBACK_URL
    || `${process.env.PUBLIC_URL || 'http://localhost:3002'}/api/payment/iyzico/callback`;

const iyzico1 = (path, body, attempt = 0) => {
    const url = `${IYZICO_BASE_URL}${path}`;
    const auth = Buffer.from(`${IYZICO_API_KEY}:${IYZICO_SECRET}`).toString('base64');
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify(body),
    }).then(async (r) => {
        const text = await r.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { raw: text }; }
        if (!r.ok && attempt === 0 && r.status >= 500) {
            // Tek dene — 500 alfası may be transient
            return iyzico1(path, body, attempt + 1);
        }
        if (!r.ok) {
            const err = new Error(`Iyzico API ${r.status}: ${JSON.stringify(data)}`);
            err.status = r.status;
            err.iyzicoResponse = data;
            throw err;
        }
        return data;
    });
};

// Plan -> Iyzico tutar mapping (TRY cents? No, regular TRY)
// VIP, iyzico expects string for numeric fields.
// Tek seferlik paket; Landing.tsx ve PaymentModal.tsx → PACKAGES_PLANS ile aynı tutulmalı.
const PACKAGE_PRICES = {
    one: { name: 'One', price: '1500', credits: 1 },
    basic: { name: 'Basic', price: '4500', credits: 10 },
    pro: { name: 'Pro', price: '9000', credits: 25 },
};

// Odeme sonrasi kullanicinin donecegi on yuz (GitHub Pages).
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://consulate67-lab.github.io/edesign-deploy/').replace(/\/?$/, '/');
const paymentRedirect = (status) => `${FRONTEND_URL}?payment=${status}`;

// POST /api/payment/iyzico/checkout — Plan satin alimi icin iyzico token uretir.
// Auth gerekli. response: { token, paymentPageUrl }
app.post('/api/payment/iyzico/checkout', authenticateToken, async (req, res) => {
    const planId = req.body?.plan;
    const plan = PACKAGE_PRICES[planId];
    if (!plan) {
        return res.status(400).json({ error: 'Gecersiz plan.' });
    }

    const conversationId = `designer-${planId}-${req.user.id}-${Date.now()}`;
    const basketId = `basket-${planId}-${Date.now()}`;

    try {
        const result = await iyzico1('/payment/v2/checkoutform/initialize/auth/ecom', {
            locale: 'tr',
            conversationId,
            price: plan.price,
            paidPrice: plan.price,
            currency: 'TRY',
            basketId,
            paymentGroup: 'PRODUCT',
            callbackUrl: IYZICO_CALLBACK_URL,
            enabledInstallments: ['1', '2', '3', '6', '9', '12'],
            buyer: {
                id: String(req.user.id),
                name: 'Musteri',
                surname: '#' + req.user.id,
                gsmNumber: '+9055555555555',
                email: 'musteri@example.com',
                identityNumber: '11111111111',
                registrationAddress: 'Istanbul',
                ip: req.ip || '127.0.0.1',
                country: 'US',
            },
            shippingAddress: { address: 'Istanbul', contactName: 'Musteri', city: 'Istanbul', country: 'US' },
            billingAddress: { address: 'Istanbul', contactName: 'Musteri', city: 'Istanbul', country: 'US' },
            basketItems: [
                {
                    id: `plan-${planId}`,
                    name: `${plan.name} Paketi (${plan.credits} tasarim)`,
                    category1: 'Digital Goods',
                    itemType: 'VIRTUAL',
                    price: plan.price,
                },
            ],
        });
        // eslint-disable-next-line no-console
        console.log(`[iyzico] user=${req.user.id} plan=${planId} token=${result.token}`);

        // Pending payment kaydi DB'ye (callback'dan sonra confirm ederiz)
        await db.run(
            `INSERT INTO payments (user_id, plan_id, conversation_id, token, amount, status)
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [req.user.id, planId, conversationId, result.token, parseFloat(plan.price)]
        ).catch(() => {
            // payments tablosu henuz olmayabilir — yoksay, loglayici commit ile eklenebilir
            // eslint-disable-next-line no-console
            console.warn('[iyzico] payments tablosu INSERT hatasi (yoksayildi).');
        });

        res.json({
            success: true,
            token: result.token,
            paymentPageUrl: result.paymentPageUrl,
            conversationId,
        });
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[iyzico] checkout error:', e);
        res.status(500).json({ error: e.message, iyzico: e.iyzicoResponse });
    }
});

// POST /api/payment/iyzico/callback — Iyzico 3D sonrasi bu URL'e POST eder.
// Form-encoded doner (token alaninda). Iyzico'nun kontrolu icin tekrar API'ye soruyoruz.
app.post('/api/payment/iyzico/callback', async (req, res) => {
    const token = req.body?.token || req.query?.token;
    if (!token) {
        // Iyzico POST etti ama token yoksa browser redirect ile hata sayfasina gonder
        return res.redirect(paymentRedirect('invalid'));
    }
    try {
        // Iyzico API ile token'i kontrol et (güvenlik)
        const result = await iyzico1('/payment/v2/checkoutform/auth/ecom/detail', { token });

        if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
            // Pending payment kaydini bul, confirm et, kredi ekle
            const payment = await db.get('SELECT * FROM payments WHERE token = ?', [token]);
            if (payment && payment.status !== 'success') {
                const plan = PACKAGE_PRICES[payment.plan_id];
                if (plan) {
                    await db.run(
                        'UPDATE users SET credits = credits + ? WHERE id = ?',
                        [plan.credits, payment.user_id]
                    );
                    await db.run(
                        'UPDATE payments SET status = ?, completed_at = NOW() WHERE id = ?',
                        ['success', payment.id]
                    );
                    // eslint-disable-next-line no-console
                    console.log(`[iyzico] payment success user=${payment.user_id} credits+${plan.credits}`);
                }
            }
            return res.redirect(paymentRedirect('success'));
        } else {
            // eslint-disable-next-line no-console
            console.warn('[iyzico] payment failed', result.paymentStatus);
            res.redirect(paymentRedirect('fail'));
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[iyzico] callback error:', e);
        res.redirect(paymentRedirect('error'));
    }
});

// GET /api/payment/packages — Paketler (frontend testable).
app.get('/api/payment/packages', (_req, res) => {
    res.json({ packages: Object.entries(PACKAGE_PRICES).map(([id, p]) => ({
        id,
        name: p.name,
        price: p.price,
        credits: p.credits,
    })) });
});
