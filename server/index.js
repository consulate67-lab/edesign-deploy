import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDb } from './db.js';

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
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS
    || 'http://localhost:5173,http://localhost:3002,http://127.0.0.1:5173,http://127.0.0.1:3002')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow same-origin or curl-like requests with no origin header.
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS policy violation: origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use(express.json()); // Body parser

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
initDb().then(_db => {
    db = _db;
    app.listen(PORT, () => {
        const host = process.env.HOST || '0.0.0.0';
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Server running on http://localhost:${PORT}`);
        } else {
            console.log(`[server] Listening on ${host}:${PORT} (env=${NODE_ENV})`);
        }
    });
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
    400: 1,       // Starter
    3000: 10,     // Basic
    5500: 30,     // Pro (en popüler)
    4500: 50,     // Business
    6000: 100,    // Enterprise
};

app.post('/api/payment/mock', authenticateToken, async (req, res) => {
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

        if (!user.free_design_used) {
            // Use free trial
            await db.run('UPDATE users SET free_design_used = 1 WHERE id = ?', [req.user.id]);
            return res.json({ success: true, message: 'Free trial used', credits: user.credits });
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
    created_at: row.created_at,
    updated_at: row.updated_at,
}) : null;

// POST /api/designs — Yeni tasarim olustur
app.post('/api/designs', authenticateToken, async (req, res) => {
    const { name, module_id, xslt_content, custom_content, theme_color, sections } = req.body || {};

    if (!name || !module_id) {
        return res.status(400).json({ error: 'name ve module_id zorunludur.' });
    }
    if (name.length > 200) {
        return res.status(400).json({ error: 'Tasarim adi 200 karakteri asmamali.' });
    }

    try {
        const sectionsJson = sections ? JSON.stringify(sections) : null;
        const result = await db.run(
            `INSERT INTO designs (user_id, name, module_id, xslt_content, custom_content, theme_color, sections_json)
             VALUES (?, ?, ?, ?, ?, ?, ?::jsonb)`,
            [req.user.id, name, module_id, xslt_content || null, custom_content || null, theme_color || null, sectionsJson]
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
    const { name, xslt_content, custom_content, theme_color, sections, status } = req.body || {};
    try {
        const existing = await db.get('SELECT * FROM designs WHERE id = ?', [id]);
        if (!existing) return res.status(404).json({ error: 'Tasarim bulunamadi.' });
        if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Bu tasarimi guncelleme yetkiniz yok.' });

        const updates = [];
        const params = [];
        if (name !== undefined) { updates.push('name = ?'); params.push(name); }
        if (xslt_content !== undefined) { updates.push('xslt_content = ?'); params.push(xslt_content); }
        if (custom_content !== undefined) { updates.push('custom_content = ?'); params.push(custom_content); }
        if (theme_color !== undefined) { updates.push('theme_color = ?'); params.push(theme_color); }
        if (sections !== undefined) { updates.push('sections_json = ?::jsonb'); params.push(JSON.stringify(sections)); }
        if (status !== undefined) { updates.push('status = ?'); params.push(status); }
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
