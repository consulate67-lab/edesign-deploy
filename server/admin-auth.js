import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createRateLimiter } from './rate-limit.js';
import { maskPhone, sendSms, smsStatus } from './sms.js';
import * as telegram from './telegram.js';

const OTP_TTL_SECONDS = 300;
const MAX_VERIFY_ATTEMPTS = 5;
const INVALID_LOGIN = 'Kullanıcı adı veya şifre hatalı.';
// Olmayan kullanıcıda da bcrypt karşılaştırması yapılır; yanıt süresi kullanıcı varlığını sızdırmaz.
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', 10);

const loginLimiter = createRateLimiter({ max: 5, windowMs: 10 * 60_000 });

const isProduction = () => process.env.NODE_ENV === 'production';

export const isAdminClaims = (claims) => claims?.typ === 'admin' && claims.mfa === true;

const identity = (user) => ({ id: user.id, username: user.username, full_name: user.full_name ?? null });

/** Telefonu olan bir yönetici için kodun gideceği kanal (ayar durumu ekranı). */
export const otpChannel = () => {
    if (smsStatus().configured) return 'sms';
    if (telegram.isChatConfigured()) return 'telegram';
    return isProduction() ? 'log' : 'dev';
};

const hashCode = (secret, challengeId, code) =>
    createHmac('sha256', secret).update(`${challengeId}:${code}`).digest('hex');

const sameHash = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Sırasıyla SMS → Telegram → (geliştirmede) yanıt → sunucu günlüğü dener. */
const deliverCode = async (user, code) => {
    if (smsStatus().configured && user.phone_number) {
        try {
            await sendSms(user.phone_number, `e-Design yonetici giris kodunuz: ${code} (5 dk gecerli)`);
            return { channel: 'sms', destination: maskPhone(user.phone_number) };
        } catch (e) {
            console.error('[admin-otp] SMS gönderilemedi:', e.message);
        }
    }
    if (telegram.isChatConfigured()) {
        try {
            await telegram.sendToAdmin(
                `🔑 Yönetici giriş kodu: <code>${code}</code>\n${telegram.escapeHtml(user.username)} · 5 dk geçerli`
            );
            return { channel: 'telegram', destination: 'Telegram' };
        } catch (e) {
            console.error('[admin-otp] Telegram ile gönderilemedi:', e.message);
        }
    }
    if (!isProduction()) return { channel: 'dev', devCode: code };
    console.log(`[admin-otp] ${user.username} için giriş kodu: ${code} (5 dk geçerli)`);
    return { channel: 'log' };
};

export const createRequireAdmin = ({ db, secret }) => async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    let claims = null;
    try {
        claims = token ? jwt.verify(token, secret) : null;
    } catch { /* süresi dolmuş ya da geçersiz */ }
    if (!isAdminClaims(claims)) return res.status(401).json({ error: 'Yönetici oturumu gerekli.' });

    const user = await db.get('SELECT id, username, full_name, role FROM users WHERE id = ?', [claims.id]);
    if (user?.role !== 'admin') return res.status(403).json({ error: 'Yönetici yetkiniz bulunmuyor.' });
    req.admin = identity(user);
    next();
};

export const registerAdminAuthRoutes = (app, { db, secret, requireAdmin }) => {
    app.post('/api/admin/auth/login', async (req, res) => {
        const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
        const password = typeof req.body?.password === 'string' ? req.body.password : '';
        if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
        if (!loginLimiter(`${req.ip}|${username.toLowerCase()}`)) {
            return res.status(429).json({ error: 'Çok fazla deneme yapıldı. Lütfen 10 dakika sonra tekrar deneyin.' });
        }

        const user = await db.get('SELECT id, username, password, full_name, phone_number, role FROM users WHERE username = ?', [username]);
        const validPassword = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
        if (!user || !validPassword || user.role !== 'admin') return res.status(401).json({ error: INVALID_LOGIN });

        await db.run(`DELETE FROM admin_otp WHERE expires_at < NOW() - INTERVAL '1 day'`);
        const challengeId = randomUUID();
        const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
        await db.run(
            `INSERT INTO admin_otp (id, user_id, code_hash, expires_at, ip)
             VALUES (?, ?, ?, NOW() + INTERVAL '${OTP_TTL_SECONDS} seconds', ?)`,
            [challengeId, user.id, hashCode(secret, challengeId, code), req.ip]
        );
        const delivery = await deliverCode(user, code);
        res.json({ challengeId, ...delivery, expiresIn: OTP_TTL_SECONDS });
    });

    app.post('/api/admin/auth/verify', async (req, res) => {
        const challengeId = typeof req.body?.challengeId === 'string' ? req.body.challengeId : '';
        const code = String(req.body?.code ?? '').trim();
        if (!challengeId || challengeId.length > 64 || !/^\d{6}$/.test(code)) {
            return res.status(400).json({ error: 'Geçersiz doğrulama kodu.' });
        }

        const otp = await db.get(
            `UPDATE admin_otp SET attempts = attempts + 1
              WHERE id = ? AND consumed_at IS NULL AND expires_at > NOW() AND attempts < ?
              RETURNING user_id, code_hash, attempts`,
            [challengeId, MAX_VERIFY_ATTEMPTS]
        );
        if (!otp) {
            return res.status(400).json({ error: 'Kodun süresi doldu ya da deneme hakkınız bitti. Lütfen yeniden giriş yapın.' });
        }
        if (!sameHash(otp.code_hash, hashCode(secret, challengeId, code))) {
            return res.status(400).json({ error: 'Doğrulama kodu hatalı.', attemptsLeft: MAX_VERIFY_ATTEMPTS - otp.attempts });
        }
        const consumed = await db.get('UPDATE admin_otp SET consumed_at = NOW() WHERE id = ? AND consumed_at IS NULL RETURNING id', [challengeId]);
        if (!consumed) return res.status(400).json({ error: 'Bu kod zaten kullanıldı.' });

        const user = await db.get('SELECT id, username, full_name, role FROM users WHERE id = ?', [otp.user_id]);
        if (user?.role !== 'admin') return res.status(403).json({ error: 'Yönetici yetkiniz bulunmuyor.' });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: 'admin', typ: 'admin', mfa: true },
            secret,
            { expiresIn: '8h' }
        );
        telegram.notify(telegram.formatAdminLogin(user, req.ip));
        console.log(`[admin] ${user.username} yönetici girişi yaptı (ip=${req.ip}).`);
        res.json({ token, user: identity(user) });
    });

    app.get('/api/admin/auth/me', requireAdmin, (req, res) => res.json(req.admin));
};
