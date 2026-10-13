/**
 * Yönetim panelinden toplu tanıtım e-postası.
 *
 * Gönderim, web hostingdeki SMTP hesabından (mail-relay.php) yapılır; paylaşımlı
 * hostinglerin saatlik gönderim sınırı aşılırsa alan adı kara listeye girer ve üyelere
 * giden onay kodları da durur. Bu yüzden kuyruk saatlik hız sınırıyla tek tek gönderir,
 * art arda hata alınca kampanyayı kendiliğinden duraklatır ve sunucu yeniden başlasa da
 * kaldığı yerden devam eder.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { EMAIL_PATTERN } from './email-verify.js';
import { mailConfigured, sendMail } from './mail.js';
import { createRateLimiter } from './rate-limit.js';
import { cleanText, optionalText, parseId } from './util.js';

const MAX_RECIPIENTS = 20_000;
const HTML_MAX = 150_000;
const TEXT_MAX = 30_000;
const RATE_MIN = 10;
const RATE_MAX = 500;
export const DEFAULT_RATE = 80;
const TICK_MS = 5_000;
const MAX_CONSECUTIVE_FAILURES = 5;

const unsubLimiter = createRateLimiter({ max: 30, windowMs: 10 * 60_000 });

export const createCampaignSchema = async (client) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS mail_campaigns (
            id             SERIAL PRIMARY KEY,
            name           TEXT NOT NULL,
            subject        TEXT NOT NULL,
            html           TEXT NOT NULL,
            text           TEXT NOT NULL DEFAULT '',
            rate_per_hour  INTEGER NOT NULL DEFAULT ${DEFAULT_RATE},
            status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'paused', 'done', 'cancelled')),
            last_error     TEXT,
            created_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            started_at     TIMESTAMPTZ,
            finished_at    TIMESTAMPTZ,
            updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`
        CREATE TABLE IF NOT EXISTS mail_campaign_recipients (
            id           SERIAL PRIMARY KEY,
            campaign_id  INTEGER NOT NULL REFERENCES mail_campaigns(id) ON DELETE CASCADE,
            email        TEXT NOT NULL,
            name         TEXT NOT NULL DEFAULT '',
            status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
            error        TEXT,
            sent_at      TIMESTAMPTZ,
            UNIQUE (campaign_id, email)
        )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_mail_recipients_campaign_status ON mail_campaign_recipients (campaign_id, status, id)`);
    await client.query(`
        CREATE TABLE IF NOT EXISTS mail_unsubscribes (
            email       TEXT PRIMARY KEY,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
};

const normalizeEmail = (value) => {
    if (typeof value !== 'string') return null;
    const email = value.trim().toLowerCase();
    return email.length <= 254 && EMAIL_PATTERN.test(email) && !/[<>,;"'\s]/.test(email) ? email : null;
};

const unsubToken = (secret, email) => {
    const e = Buffer.from(email).toString('base64url');
    const sig = createHmac('sha256', secret).update(`unsub:${email}`).digest('base64url').slice(0, 32);
    return `${e}.${sig}`;
};

const readUnsubToken = (secret, token) => {
    if (typeof token !== 'string' || token.length > 600) return null;
    const [e, sig] = token.split('.');
    if (!e || !sig) return null;
    const email = normalizeEmail(Buffer.from(e, 'base64url').toString('utf8'));
    if (!email) return null;
    const expected = unsubToken(secret, email).split('.')[1];
    return sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? email : null;
};

const apiBase = () => {
    const explicit = (process.env.PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
    if (explicit) return explicit;
    const domain = (process.env.RAILWAY_PUBLIC_DOMAIN || '').trim();
    return domain ? `https://${domain}` : null;
};

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** {{UNSUBSCRIBE_URL}}, {{AD}} ve {{EMAIL}} alıcıya göre doldurulur. */
const personalize = ({ subject, html, text }, { email, name }, { secret, website }) => {
    const token = unsubToken(secret, email);
    const pageUrl = `${website}/?unsub=${token}`;
    const fill = (s, esc) => s
        .replaceAll('{{UNSUBSCRIBE_URL}}', pageUrl)
        .replaceAll('{{AD}}', esc(name || ''))
        .replaceAll('{{EMAIL}}', esc(email));
    const api = apiBase();
    const headers = {
        'List-Unsubscribe': api
            ? `<${api}/api/mail/unsubscribe?u=${token}>, <mailto:destek@edxdocu.com?subject=unsubscribe>`
            : '<mailto:destek@edxdocu.com?subject=unsubscribe>',
    };
    if (api) headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
    return {
        to: email,
        subject: fill(subject, (s) => s),
        html: fill(html, escapeHtml),
        text: text ? fill(text, (s) => s) : '',
        headers,
    };
};

const CAMPAIGN_SELECT = `
    SELECT c.id, c.name, c.subject, c.rate_per_hour, c.status, c.last_error, c.created_at, c.started_at, c.finished_at,
           COUNT(r.id)::int AS total,
           COUNT(r.id) FILTER (WHERE r.status = 'pending')::int AS pending,
           COUNT(r.id) FILTER (WHERE r.status = 'sent')::int AS sent,
           COUNT(r.id) FILTER (WHERE r.status = 'failed')::int AS failed,
           COUNT(r.id) FILTER (WHERE r.status = 'skipped')::int AS skipped
      FROM mail_campaigns c
      LEFT JOIN mail_campaign_recipients r ON r.campaign_id = c.id`;

const readContent = (body) => {
    const subject = cleanText(body?.subject, 200);
    const html = cleanText(body?.html, HTML_MAX);
    const text = optionalText(body?.text, TEXT_MAX);
    if (!subject) return { error: 'Konu satırı gerekli (en fazla 200 karakter).' };
    if (!html) return { error: `E-posta içeriği gerekli (en fazla ${HTML_MAX.toLocaleString('tr-TR')} karakter).` };
    if (text === null) return { error: 'Düz metin sürümü çok uzun.' };
    return { subject, html, text };
};

export const registerCampaignRoutes = (app, { db, requireAdmin, secret, website }) => {
    const site = (website || 'https://www.edxdocu.com').replace(/\/+$/, '');
    const getCampaign = (id) => db.get(`${CAMPAIGN_SELECT} WHERE c.id = ? GROUP BY c.id`, [id]);

    app.get('/api/admin/campaigns', requireAdmin, async (_req, res) => {
        const [campaigns, unsub] = await Promise.all([
            db.all(`${CAMPAIGN_SELECT} GROUP BY c.id ORDER BY c.created_at DESC LIMIT 100`),
            db.get('SELECT COUNT(*)::int AS n FROM mail_unsubscribes'),
        ]);
        res.json({ campaigns, unsubscribed: unsub?.n ?? 0, mailReady: mailConfigured(), defaultRate: DEFAULT_RATE, rateMax: RATE_MAX });
    });

    app.get('/api/admin/campaigns/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const campaign = id && await getCampaign(id);
        if (!campaign) return res.status(404).json({ error: 'Gönderim bulunamadı.' });
        const failures = await db.all(
            `SELECT email, error, sent_at FROM mail_campaign_recipients WHERE campaign_id = ? AND status = 'failed' ORDER BY id LIMIT 200`,
            [id]
        );
        res.json({ campaign, failures });
    });

    app.post('/api/admin/campaigns', requireAdmin, async (req, res) => {
        const name = cleanText(req.body?.name, 120);
        if (!name) return res.status(400).json({ error: 'Gönderim adı gerekli.' });
        const content = readContent(req.body);
        if (content.error) return res.status(400).json({ error: content.error });
        const rate = Number(req.body?.ratePerHour);
        if (!Number.isInteger(rate) || rate < RATE_MIN || rate > RATE_MAX) {
            return res.status(400).json({ error: `Saatlik gönderim ${RATE_MIN}–${RATE_MAX} arasında olmalı.` });
        }
        const list = Array.isArray(req.body?.recipients) ? req.body.recipients : [];
        const seen = new Map();
        for (const item of list) {
            const email = normalizeEmail(item?.email);
            if (email && !seen.has(email)) seen.set(email, (typeof item?.name === 'string' ? item.name.trim() : '').slice(0, 120));
        }
        if (seen.size === 0) return res.status(400).json({ error: 'Listede geçerli e-posta adresi yok.' });
        if (seen.size > MAX_RECIPIENTS) return res.status(400).json({ error: `Bir gönderimde en fazla ${MAX_RECIPIENTS.toLocaleString('tr-TR')} alıcı olabilir.` });

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const { rows } = await client.query(
                `INSERT INTO mail_campaigns (name, subject, html, text, rate_per_hour, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                [name, content.subject, content.html, content.text, rate, req.admin?.id ?? null]
            );
            const id = rows[0].id;
            await client.query(
                `INSERT INTO mail_campaign_recipients (campaign_id, email, name, status)
                 SELECT $1, t.email, t.name, CASE WHEN u.email IS NULL THEN 'pending' ELSE 'skipped' END
                   FROM unnest($2::text[], $3::text[]) AS t(email, name)
                   LEFT JOIN mail_unsubscribes u ON u.email = t.email
                 ON CONFLICT DO NOTHING`,
                [id, [...seen.keys()], [...seen.values()]]
            );
            await client.query('COMMIT');
            console.log(`[campaigns] ${req.admin?.username}: gönderim #${id} oluşturuldu (${seen.size} alıcı)`);
            res.status(201).json(await getCampaign(id));
        } catch (e) {
            await client.query('ROLLBACK').catch(() => undefined);
            throw e;
        } finally {
            client.release();
        }
    });

    app.post('/api/admin/campaigns/test', requireAdmin, async (req, res) => {
        const content = readContent(req.body);
        if (content.error) return res.status(400).json({ error: content.error });
        const to = normalizeEmail(req.body?.to);
        if (!to) return res.status(400).json({ error: 'Test için geçerli bir e-posta adresi yazın.' });
        if (!mailConfigured()) return res.status(503).json({ error: 'Sunucuda e-posta gönderimi yapılandırılmamış.' });
        try {
            const mail = personalize(content, { email: to, name: 'Test' }, { secret, website: site });
            await sendMail({ ...mail, subject: `[TEST] ${mail.subject}` });
            res.json({ sent: true });
        } catch (e) {
            res.status(502).json({ error: `Test e-postası gönderilemedi: ${e.message}` });
        }
    });

    const transition = (from, to, extra = '') => async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz gönderim.' });
        if (to === 'sending' && req.body?.consentConfirmed !== true) {
            return res.status(400).json({ error: 'Alıcıların ticari ileti onayı olduğunu onaylamanız gerekiyor.' });
        }
        const row = await db.get(
            `UPDATE mail_campaigns SET status = ?, updated_at = NOW()${extra} WHERE id = ? AND status = ANY(?) RETURNING id`,
            [to, id, from]
        );
        if (!row) return res.status(409).json({ error: 'Bu gönderimin durumu bu işleme uygun değil.' });
        console.log(`[campaigns] ${req.admin?.username}: gönderim #${id} → ${to}`);
        if (to === 'sending') kick();
        res.json(await getCampaign(id));
    };

    app.post('/api/admin/campaigns/:id/start', requireAdmin,
        transition(['draft', 'paused'], 'sending', ', started_at = COALESCE(started_at, NOW()), last_error = NULL'));
    app.post('/api/admin/campaigns/:id/pause', requireAdmin, transition(['sending'], 'paused'));
    app.post('/api/admin/campaigns/:id/cancel', requireAdmin, transition(['draft', 'sending', 'paused'], 'cancelled', ', finished_at = NOW()'));

    app.post('/api/admin/campaigns/:id/retry-failed', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz gönderim.' });
        const { changes } = await db.run(
            `UPDATE mail_campaign_recipients SET status = 'pending', error = NULL WHERE campaign_id = ? AND status = 'failed'`, [id]
        );
        if (changes > 0) {
            await db.run(`UPDATE mail_campaigns SET status = 'paused', finished_at = NULL, updated_at = NOW() WHERE id = ? AND status = 'done'`, [id]);
        }
        res.json(await getCampaign(id));
    });

    app.delete('/api/admin/campaigns/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const row = id && await db.get(`DELETE FROM mail_campaigns WHERE id = ? AND status <> 'sending' RETURNING id`, [id]);
        if (!row) return res.status(409).json({ error: 'Gönderim bulunamadı ya da şu an gönderiliyor; önce duraklatın.' });
        res.json({ success: true });
    });

    // ------------------------------------------------------------ listeden çıkma (herkese açık)

    const unsubscribe = async (req, res) => {
        if (!unsubLimiter(req.ip)) return res.status(429).json({ error: 'Çok fazla istek. Lütfen biraz sonra tekrar deneyin.' });
        const email = readUnsubToken(secret, req.query.u ?? req.body?.u);
        if (!email) return res.status(400).json({ error: 'Bağlantı geçersiz ya da eksik.' });
        await db.run('INSERT INTO mail_unsubscribes (email) VALUES (?) ON CONFLICT (email) DO NOTHING RETURNING email', [email]);
        await db.run(`UPDATE mail_campaign_recipients SET status = 'skipped' WHERE email = ? AND status = 'pending'`, [email]);
        res.json({ success: true });
    };
    app.post('/api/mail/unsubscribe', unsubscribe);
    // Eski e-posta istemcileri başlıktaki adresi GET ile açar; onay için siteye yönlendirilir.
    app.get('/api/mail/unsubscribe', (req, res) => {
        const u = typeof req.query.u === 'string' ? req.query.u : '';
        res.redirect(302, `${site}/?unsub=${encodeURIComponent(u)}`);
    });

    // ------------------------------------------------------------ gönderim kuyruğu

    let busy = false;
    let lastSentAt = 0;
    let failStreak = 0;

    const tick = async () => {
        if (busy || !mailConfigured()) return;
        busy = true;
        try {
            const c = await db.get(`SELECT * FROM mail_campaigns WHERE status = 'sending' ORDER BY started_at, id LIMIT 1`);
            if (!c) return;
            if (Date.now() - lastSentAt < 3_600_000 / c.rate_per_hour) return;
            const r = await db.get(
                `SELECT r.id, r.email, r.name, (u.email IS NOT NULL) AS unsubscribed
                   FROM mail_campaign_recipients r LEFT JOIN mail_unsubscribes u ON u.email = r.email
                  WHERE r.campaign_id = ? AND r.status = 'pending' ORDER BY r.id LIMIT 1`,
                [c.id]
            );
            if (!r) {
                await db.run(`UPDATE mail_campaigns SET status = 'done', finished_at = NOW(), updated_at = NOW() WHERE id = ? AND status = 'sending'`, [c.id]);
                console.log(`[campaigns] gönderim #${c.id} tamamlandı`);
                return;
            }
            if (r.unsubscribed) {
                await db.run(`UPDATE mail_campaign_recipients SET status = 'skipped' WHERE id = ?`, [r.id]);
                return;
            }
            lastSentAt = Date.now();
            try {
                await sendMail(personalize(c, r, { secret, website: site }));
                await db.run(`UPDATE mail_campaign_recipients SET status = 'sent', sent_at = NOW(), error = NULL WHERE id = ?`, [r.id]);
                failStreak = 0;
            } catch (e) {
                const message = String(e.message || e).slice(0, 300);
                await db.run(`UPDATE mail_campaign_recipients SET status = 'failed', error = ?, sent_at = NOW() WHERE id = ?`, [message, r.id]);
                failStreak += 1;
                console.warn(`[campaigns] #${c.id} ${r.email}: ${message}`);
                if (failStreak >= MAX_CONSECUTIVE_FAILURES) {
                    failStreak = 0;
                    await db.run(
                        `UPDATE mail_campaigns SET status = 'paused', last_error = ?, updated_at = NOW() WHERE id = ?`,
                        [`Art arda ${MAX_CONSECUTIVE_FAILURES} gönderim başarısız olduğu için duraklatıldı. Son hata: ${message}`, c.id]
                    );
                }
            }
        } catch (e) {
            console.error('[campaigns] kuyruk hatası:', e.message);
        } finally {
            busy = false;
        }
    };

    const kick = () => { void tick(); };
    setInterval(kick, TICK_MS).unref?.();
};
