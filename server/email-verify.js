import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { mailConfigured, sendMail } from './mail.js';
import { createRateLimiter } from './rate-limit.js';

const CODE_TTL_MINUTES = 30;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFY_ATTEMPTS = 5;

const verifyLimiter = createRateLimiter({ max: 20, windowMs: 10 * 60_000 });
const resendLimiter = createRateLimiter({ max: 10, windowMs: 10 * 60_000 });

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Hesap henüz e-posta sahipliğini kanıtlamamış (kayıt onayı bekliyor). Mail tanımlı değilse istenmez. */
export const needsEmailVerification = (user) =>
    mailConfigured() && !user.email_verified_at && user.role !== 'admin';

/** Şifreyle her girişte e-postaya gönderilen kod istenir; mail tanımlı değilse doğrudan oturum açılır. */
export const needsLoginCode = () => mailConfigured();

const hashCode = (secret, userId, code) =>
    createHmac('sha256', secret).update(`email-verify:${userId}:${code}`).digest('hex');

const sameHash = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

const MESSAGES = {
    tr: {
        subject: (code) => `${code} - edXdocu e-posta onay kodunuz`,
        title: 'E-posta adresinizi onaylayın',
        intro: 'edXdocu hesabınızı etkinleştirmek için aşağıdaki onay kodunu giriş ekranına yazın:',
        expiry: `Kod ${CODE_TTL_MINUTES} dakika geçerlidir.`,
        ignore: 'Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.',
    },
    en: {
        subject: (code) => `${code} - your edXdocu verification code`,
        title: 'Confirm your email address',
        intro: 'Enter the verification code below on the sign-in screen to activate your edXdocu account:',
        expiry: `The code is valid for ${CODE_TTL_MINUTES} minutes.`,
        ignore: 'If you did not request this, you can ignore this email.',
    },
};

const LOGIN_MESSAGES = {
    tr: {
        subject: (code) => `${code} - edXdocu giriş kodunuz`,
        title: 'Giriş onay kodu',
        intro: 'edXdocu hesabınıza giriş yapmak için aşağıdaki kodu giriş ekranına yazın:',
        expiry: `Kod ${CODE_TTL_MINUTES} dakika geçerlidir.`,
        ignore: 'Bu girişi siz yapmadıysanız şifrenizi hemen değiştirin; kod olmadan hesabınıza girilemez.',
    },
    en: {
        subject: (code) => `${code} - your edXdocu sign-in code`,
        title: 'Sign-in code',
        intro: 'Enter the code below on the sign-in screen to sign in to your edXdocu account:',
        expiry: `The code is valid for ${CODE_TTL_MINUTES} minutes.`,
        ignore: 'If this was not you, change your password now; nobody can sign in without this code.',
    },
};

const buildMail = (code, lang, purpose) => {
    const set = purpose === 'login' ? LOGIN_MESSAGES : MESSAGES;
    const m = set[lang] || set.en;
    const text = `${m.title}\n\n${m.intro}\n\n${code}\n\n${m.expiry}\n${m.ignore}\n`;
    const html = `<!doctype html><html><body style="margin:0;background:#f5f3ff;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
<div style="max-width:480px;margin:32px auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb">
<h1 style="margin:0 0 16px;font-size:20px;color:#5b21b6">${m.title}</h1>
<p style="margin:0 0 20px;font-size:14px;line-height:1.6">${m.intro}</p>
<div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;background:#f5f3ff;border-radius:12px;padding:16px 0;color:#4c1d95">${code}</div>
<p style="margin:20px 0 4px;font-size:13px;color:#6b7280">${m.expiry}</p>
<p style="margin:0;font-size:13px;color:#6b7280">${m.ignore}</p>
</div></body></html>`;
    return { subject: m.subject(code), text, html };
};

/**
 * Kullanıcıya yeni onay kodu gönderir. Son gönderimden bu yana bekleme süresi
 * dolmadıysa yeni kod üretmez (önceki kod geçerli kalır).
 * @returns {Promise<{ sent: boolean, retryAfter?: number }>}
 */
export const sendVerificationCode = async (db, secret, user, lang, purpose = 'verify') => {
    const last = await db.get(
        `SELECT CEIL(EXTRACT(EPOCH FROM (sent_at + INTERVAL '${RESEND_COOLDOWN_SECONDS} seconds' - NOW())))::int AS wait
           FROM email_verifications WHERE user_id = ? AND expires_at > NOW()`,
        [user.id]
    );
    if (last && last.wait > 0) return { sent: false, retryAfter: last.wait };

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await db.run(
        `INSERT INTO email_verifications (user_id, code_hash, expires_at, attempts, sent_at)
         VALUES (?, ?, NOW() + INTERVAL '${CODE_TTL_MINUTES} minutes', 0, NOW())
         ON CONFLICT (user_id) DO UPDATE SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at,
             attempts = 0, sent_at = EXCLUDED.sent_at
         RETURNING user_id`,
        [user.id, hashCode(secret, user.id, code)]
    );
    try {
        await sendMail({ to: user.username, ...buildMail(code, lang, purpose) });
    } catch (e) {
        await db.run('DELETE FROM email_verifications WHERE user_id = ?', [user.id]);
        console.error(`[email-verify] mail gönderilemedi (user #${user.id}):`, e.message);
        throw Object.assign(new Error('Onay e-postası gönderilemedi. Lütfen biraz sonra tekrar deneyin.'), { status: 502 });
    }
    return { sent: true };
};

export const pickLang = (body) => (body?.lang === 'tr' ? 'tr' : 'en');

export const registerEmailVerifyRoutes = (app, { db, secret, issueSession }) => {
    app.post('/api/auth/verify-email', async (req, res) => {
        const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
        const code = String(req.body?.code ?? '').trim();
        if (!username || !/^\d{6}$/.test(code)) return res.status(400).json({ error: 'Lütfen 6 haneli onay kodunu girin.' });
        if (!verifyLimiter(req.ip)) {
            return res.status(429).json({ error: 'Çok fazla deneme yapıldı. Lütfen 10 dakika sonra tekrar deneyin.' });
        }

        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) return res.status(400).json({ error: 'Onay kodu hatalı.' });

        // Oturum yalnız geçerli bir kodla açılır; kod da yalnız kayıtta ya da doğru şifreden sonra üretilir.
        const row = await db.get(
            `UPDATE email_verifications SET attempts = attempts + 1
              WHERE user_id = ? AND expires_at > NOW() AND attempts < ?
              RETURNING code_hash, attempts`,
            [user.id, MAX_VERIFY_ATTEMPTS]
        );
        if (!row) {
            return res.status(400).json({ error: 'Kodun süresi doldu ya da deneme hakkınız bitti. Lütfen yeni kod isteyin.' });
        }
        if (!sameHash(row.code_hash, hashCode(secret, user.id, code))) {
            return res.status(400).json({ error: 'Onay kodu hatalı.', attemptsLeft: MAX_VERIFY_ATTEMPTS - row.attempts });
        }

        if (!user.email_verified_at) {
            await db.run('UPDATE users SET email_verified_at = NOW(), updated_at = NOW() WHERE id = ?', [user.id]);
            console.log(`[email-verify] user #${user.id} e-postasını doğruladı.`);
        }
        await db.run('DELETE FROM email_verifications WHERE user_id = ?', [user.id]);
        res.json(issueSession(user));
    });

    app.post('/api/auth/resend-code', async (req, res) => {
        const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
        if (!username) return res.status(400).json({ error: 'E-posta adresi gerekli.' });
        if (!resendLimiter(req.ip)) {
            return res.status(429).json({ error: 'Çok fazla istek gönderildi. Lütfen 10 dakika sonra tekrar deneyin.' });
        }
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user || !mailConfigured()) return res.json({ sent: false });
        // Yeni kod yalnız kayıt ya da doğru şifreyle başlamış, süresi dolmamış bir doğrulama için gönderilir.
        const pending = await db.get('SELECT 1 FROM email_verifications WHERE user_id = ? AND expires_at > NOW()', [user.id]);
        if (!pending) return res.json({ sent: false });
        try {
            const purpose = needsEmailVerification(user) ? 'verify' : 'login';
            res.json(await sendVerificationCode(db, secret, user, pickLang(req.body), purpose));
        } catch (e) {
            res.status(e.status || 500).json({ error: e.message });
        }
    });
};
