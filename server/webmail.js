/**
 * Yönetim panelindeki posta kutusu (hostingdeki e-posta hesapları).
 *
 * Hosting posta sunucusu dışarıya yalnız şifresiz POP3 ve SMTP açıyor, Railway de giden SMTP'yi
 * engelliyor. Bu yüzden POP3 / SMTP bağlantıları hostingdeki public/webmail-gateway.php üzerinden,
 * MAIL_RELAY_SECRET ile imzalı isteklerle kurulur.
 *
 * POP3'te klasör yoktur: iletiler veritabanına kopyalanır (sunucuda da kalır); gelen, gönderilen
 * ve çöp klasörleri ile okundu / yıldız bilgisi burada tutulur. Hesap parolaları AES-256-GCM ile
 * şifreli saklanır.
 */
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'node:crypto';
import { simpleParser } from 'mailparser';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import { banFromIncomingMail } from './mail-blocklist.js';
import { cleanText, optionalText, parseId } from './util.js';

const env = (name) => (process.env[name] || '').trim();
const FOLDERS = ['inbox', 'sent', 'trash'];
const SYNC_EVERY_MS = 3 * 60_000;
const RAW_MAX = 5_500_000;
const ATTACH_MAX = 4 * 1024 * 1024;
const EMAIL = /^[^\s@<>()",;:]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
const HOST = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

const gatewayUrl = () => env('WEBMAIL_GATEWAY_URL') || env('MAIL_RELAY_URL').replace(/mail-relay\.php$/, 'webmail-gateway.php');
const configured = () => !!(gatewayUrl() && env('MAIL_RELAY_SECRET'));

// ------------------------------------------------------------ parola şifreleme

const sealer = (secret) => {
    const key = createHash('sha256').update(`edx-webmail:${env('MAIL_ACCOUNTS_KEY') || secret}`).digest();
    return {
        seal: (text) => {
            const iv = randomBytes(12);
            const c = createCipheriv('aes-256-gcm', key, iv);
            const enc = Buffer.concat([c.update(text, 'utf8'), c.final()]);
            return [iv, c.getAuthTag(), enc].map((b) => b.toString('base64')).join('.');
        },
        open: (sealed) => {
            const [iv, tag, enc] = String(sealed).split('.').map((s) => Buffer.from(s, 'base64'));
            const d = createDecipheriv('aes-256-gcm', key, iv);
            d.setAuthTag(tag);
            return Buffer.concat([d.update(enc), d.final()]).toString('utf8');
        },
    };
};

// ------------------------------------------------------------ köprü

class MailError extends Error {}

const explain = (detail) => {
    if (/^pop AUTH/i.test(detail)) return 'E-posta adresi ya da parola hatalı.';
    if (/^pop CONNECT/i.test(detail)) return 'Gelen posta sunucusuna bağlanılamadı.';
    if (/^smtp AUTH/i.test(detail)) return 'Gönderim için oturum açılamadı (parola ya da SMTP ayarı hatalı).';
    if (/^smtp CONNECT/i.test(detail)) return 'Giden posta sunucusuna bağlanılamadı.';
    if (/^smtp RCPT/i.test(detail)) return `Alıcı reddedildi: ${detail.replace(/^smtp RCPT:\s*/i, '')}`;
    if (/^(timestamp|signature)$/.test(detail)) return 'Posta köprüsü imzası geçersiz (MAIL_RELAY_SECRET hostingdeki ayarla aynı olmalı).';
    if (detail === 'not configured') return 'Hostingde posta köprüsü yapılandırılmamış.';
    return `Posta sunucusu: ${detail}`;
};

const gateway = async (op, acc, extra = {}, timeoutMs = 50_000) => {
    const body = JSON.stringify({
        op, user: acc.email, pass: acc.password,
        ...(acc.pop_host && { popHost: acc.pop_host }),
        ...(acc.smtp_host && { smtpHost: acc.smtp_host }),
        ...(acc.smtp_port && { smtpPort: acc.smtp_port }),
        ...extra,
    });
    const ts = String(Math.floor(Date.now() / 1000));
    const signature = createHmac('sha256', env('MAIL_RELAY_SECRET')).update(`${ts}.${body}`).digest('hex');
    let res;
    try {
        res = await fetch(gatewayUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Relay-Timestamp': ts, 'X-Relay-Signature': signature },
            body,
            signal: AbortSignal.timeout(timeoutMs),
        });
    } catch (e) {
        throw new MailError(e.name === 'TimeoutError' ? 'Posta köprüsü zamanında yanıt vermedi.' : `Posta köprüsüne ulaşılamadı: ${e.cause?.code || e.message}`);
    }
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) throw new MailError(explain(data?.error || `HTTP ${res.status}`));
    return data;
};

/** Aynı hesapta POP3 oturumları çakışırsa sunucu kutuyu kilitler; işlemler sıraya alınır. */
const queues = new Map();
const serial = (id, fn) => {
    const run = (queues.get(id) ?? Promise.resolve()).then(fn, fn);
    queues.set(id, run.catch(() => {}));
    return run;
};

// ------------------------------------------------------------ ileti çözümleme

const addrList = (field) => (Array.isArray(field) ? field : field ? [field] : [])
    .flatMap((x) => x?.value ?? [])
    .map((v) => ({ name: (v.name || '').slice(0, 200), address: (v.address || '').toLowerCase().slice(0, 320) }))
    .filter((v) => v.address)
    .slice(0, 200);

const htmlToPlain = (html) => String(html)
    .replace(/<(style|script|head)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h\d|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const parseRaw = async (raw) => {
    const p = await simpleParser(raw);
    const text = p.text || (p.html ? htmlToPlain(p.html) : '');
    const refs = Array.isArray(p.references) ? p.references.join(' ') : p.references || '';
    return {
        message_id: p.messageId || null,
        in_reply_to: p.inReplyTo || null,
        refs: refs || null,
        from: addrList(p.from)[0] ?? { name: '', address: '' },
        to: addrList(p.to),
        cc: addrList(p.cc),
        reply_to: addrList(p.replyTo)[0]?.address || null,
        subject: (p.subject || '').slice(0, 1000),
        snippet: text.replace(/\s+/g, ' ').trim().slice(0, 220),
        text: text || null,
        html: typeof p.html === 'string' ? p.html : null,
        attachments: p.attachments.map((a, i) => ({
            i, filename: a.filename || `ek-${i + 1}`, contentType: a.contentType || 'application/octet-stream', size: a.size || a.content?.length || 0, inline: !!a.related,
        })),
        date: p.date instanceof Date && !Number.isNaN(p.date.getTime()) ? p.date : new Date(),
        parsed: p,
    };
};

const parseAddresses = (value) => {
    const parts = (Array.isArray(value) ? value : String(value ?? '').split(/[,;\n](?=(?:[^"]*"[^"]*")*[^"]*$)/)).map((s) => String(s).trim()).filter(Boolean);
    const out = [];
    for (const part of parts) {
        const m = /^(?:"?([^"<]*?)"?\s*)?<([^>]+)>$/.exec(part);
        const address = (m ? m[2] : part).trim().toLowerCase();
        if (!EMAIL.test(address) || address.length > 254) throw new MailError(`Geçersiz adres: ${part}`);
        out.push({ name: (m?.[1] || '').trim().slice(0, 200), address });
    }
    return out;
};

// ------------------------------------------------------------ şema

export const createWebmailSchema = async (client) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS mail_accounts (
            id            SERIAL PRIMARY KEY,
            email         TEXT NOT NULL UNIQUE,
            name          TEXT NOT NULL DEFAULT '',
            secret        TEXT NOT NULL,
            pop_host      TEXT,
            smtp_host     TEXT,
            smtp_port     INTEGER,
            signature     TEXT NOT NULL DEFAULT '',
            server_count  INTEGER,
            last_sync_at  TIMESTAMPTZ,
            last_error    TEXT,
            created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`
        CREATE TABLE IF NOT EXISTS mail_messages (
            id           SERIAL PRIMARY KEY,
            account_id   INTEGER NOT NULL REFERENCES mail_accounts(id) ON DELETE CASCADE,
            folder       TEXT NOT NULL,
            prev_folder  TEXT,
            uid          TEXT,
            message_id   TEXT,
            in_reply_to  TEXT,
            refs         TEXT,
            from_addr    TEXT NOT NULL DEFAULT '',
            from_name    TEXT NOT NULL DEFAULT '',
            to_addrs     JSONB NOT NULL DEFAULT '[]'::jsonb,
            cc_addrs     JSONB NOT NULL DEFAULT '[]'::jsonb,
            bcc_addrs    JSONB NOT NULL DEFAULT '[]'::jsonb,
            reply_to     TEXT,
            subject      TEXT NOT NULL DEFAULT '',
            snippet      TEXT NOT NULL DEFAULT '',
            text_body    TEXT,
            html_body    TEXT,
            attachments  JSONB NOT NULL DEFAULT '[]'::jsonb,
            raw          BYTEA,
            size         INTEGER NOT NULL DEFAULT 0,
            seen         BOOLEAN NOT NULL DEFAULT FALSE,
            starred      BOOLEAN NOT NULL DEFAULT FALSE,
            sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS mail_messages_uid ON mail_messages (account_id, uid) WHERE uid IS NOT NULL');
    await client.query('CREATE INDEX IF NOT EXISTS mail_messages_folder ON mail_messages (account_id, folder, sent_at DESC)');
};

// ------------------------------------------------------------ rotalar ve eşitleme

export const registerWebmailRoutes = (app, { db, requireAdmin, secret }) => {
    const { seal, open } = sealer(secret);
    const q = (sql, params) => db.pool.query(sql, params);

    const loadAccount = async (id) => {
        const { rows: [row] } = await q('SELECT * FROM mail_accounts WHERE id = $1', [id]);
        if (!row) return null;
        try {
            return { ...row, password: open(row.secret) };
        } catch {
            return { ...row, password: null };
        }
    };

    const ACCOUNT_SELECT = `
        SELECT a.id, a.email, a.name, a.signature, a.pop_host, a.smtp_host, a.smtp_port, a.server_count, a.last_sync_at, a.last_error, a.created_at,
               COUNT(m.id) FILTER (WHERE m.folder = 'inbox' AND NOT m.seen)::int AS unread,
               COUNT(m.id) FILTER (WHERE m.folder = 'inbox')::int AS inbox
          FROM mail_accounts a LEFT JOIN mail_messages m ON m.account_id = a.id`;
    const listAccounts = async () => (await q(`${ACCOUNT_SELECT} GROUP BY a.id ORDER BY a.email`)).rows;
    const getAccountRow = async (id) => (await q(`${ACCOUNT_SELECT} WHERE a.id = $1 GROUP BY a.id`, [id])).rows[0] ?? null;

    const insertMessage = async (acc, { folder, uid = null, raw, seen, bcc = [] }) => {
        let m;
        try {
            m = await parseRaw(raw);
        } catch (e) {
            console.warn(`[webmail] ${acc.email}: ileti çözümlenemedi (${e.message})`);
            m = { from: { name: '', address: '' }, to: [], cc: [], subject: '(ileti çözümlenemedi)', snippet: '', text: null, html: null, attachments: [], date: new Date() };
        }
        const { rows } = await q(
            `INSERT INTO mail_messages (account_id, folder, uid, message_id, in_reply_to, refs, from_addr, from_name, to_addrs, cc_addrs, bcc_addrs,
                                        reply_to, subject, snippet, text_body, html_body, attachments, raw, size, seen, sent_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12, $13, $14, $15, $16, $17::jsonb, $18, $19, $20, $21)
             ON CONFLICT (account_id, uid) WHERE uid IS NOT NULL DO NOTHING
             RETURNING id`,
            [acc.id, folder, uid, m.message_id ?? null, m.in_reply_to ?? null, m.refs ?? null, m.from.address, m.from.name,
                JSON.stringify(m.to), JSON.stringify(m.cc), JSON.stringify(bcc), m.reply_to ?? null, m.subject, m.snippet,
                m.text, m.html, JSON.stringify(m.attachments), raw, raw.length, typeof seen === 'function' ? seen(m.date) : !!seen, m.date]
        );
        const id = rows[0]?.id ?? null;
        if (id && folder === 'inbox' && m.from?.address) {
            const { rows: accounts } = await q('SELECT email FROM mail_accounts');
            void banFromIncomingMail(db, {
                from: m.from.address,
                subject: m.subject,
                text: m.text,
                html: m.html,
                ownEmails: accounts.map((a) => a.email),
            }).catch((e) => console.warn(`[webmail] yasaklı liste: ${e.message}`));
        }
        return id;
    };

    /** Sunucudaki yeni iletileri (en yeniden eskiye) alır; büyük kutular birkaç turda tamamlanır. */
    const syncAccount = (accountId, budgetMs) => serial(accountId, async () => {
        const acc = await loadAccount(accountId);
        if (!acc) return { fetched: 0, remaining: 0 };
        if (!acc.password) throw new MailError('Kayıtlı parola çözülemedi; hesabın parolasını yeniden girin.');
        const deadline = Date.now() + budgetMs;
        try {
            const { messages } = await gateway('list', acc);
            const { rows } = await q('SELECT uid FROM mail_messages WHERE account_id = $1 AND uid IS NOT NULL', [acc.id]);
            const known = new Set(rows.map((r) => r.uid));
            const fresh = messages.filter((m) => !known.has(m.uid)).sort((a, b) => b.n - a.n);
            const addedAt = new Date(acc.created_at).getTime();
            let fetched = 0;
            while (fresh.length && Date.now() < deadline - 5_000) {
                const batch = fresh.splice(0, 20);
                const r = await gateway('fetch', acc, { uids: batch.map((m) => m.uid), maxBytes: 4_000_000 });
                const got = new Set(r.messages.map((m) => m.uid));
                const missing = new Set(r.missing ?? []);
                fresh.unshift(...batch.filter((m) => !got.has(m.uid) && !missing.has(m.uid)));
                for (const m of r.messages) {
                    // Hesap panele eklenmeden önce gelmiş iletiler okunmuş sayılır.
                    if (await insertMessage(acc, { folder: 'inbox', uid: m.uid, raw: Buffer.from(m.raw, 'base64'), seen: (date) => date.getTime() < addedAt })) fetched++;
                }
                if (!r.messages.length) break;
            }
            await q('UPDATE mail_accounts SET last_sync_at = NOW(), last_error = NULL, server_count = $1 WHERE id = $2', [messages.length, acc.id]);
            if (fetched) console.log(`[webmail] ${acc.email}: ${fetched} yeni ileti`);
            return { fetched, remaining: fresh.length };
        } catch (e) {
            await q('UPDATE mail_accounts SET last_sync_at = NOW(), last_error = $1 WHERE id = $2', [e.message.slice(0, 300), acc.id]);
            throw e;
        }
    });

    const syncAll = async () => {
        if (!configured()) return;
        const { rows } = await q('SELECT id FROM mail_accounts ORDER BY id');
        for (const { id } of rows) {
            await syncAccount(id, 40_000).catch((e) => console.warn(`[webmail] eşitleme hatası (#${id}):`, e.message));
        }
    };
    setTimeout(() => void syncAll().catch(() => {}), 30_000).unref();
    setInterval(() => void syncAll().catch(() => {}), SYNC_EVERY_MS).unref();

    const fail = (res, e) => {
        if (!(e instanceof MailError)) throw e;
        res.status(400).json({ error: e.message });
    };

    // ------------------------------------------------------------ hesaplar

    app.get('/api/admin/mail/accounts', requireAdmin, async (_req, res) => {
        res.json({ configured: configured(), accounts: await listAccounts() });
    });

    const readAccountInput = (body, { requirePassword }) => {
        const name = optionalText(body?.name, 120);
        const signature = optionalText(body?.signature, 4000);
        const password = typeof body?.password === 'string' ? body.password : '';
        const popHost = optionalText(body?.popHost, 200);
        const smtpHost = optionalText(body?.smtpHost, 200);
        const smtpPort = body?.smtpPort ? Number(body.smtpPort) : null;
        if (name === null || signature === null) throw new MailError('Ad ya da imza çok uzun.');
        if (requirePassword && !password) throw new MailError('Parola gerekli.');
        if (password.length > 200 || /[\r\n]/.test(password)) throw new MailError('Parola geçersiz.');
        if (popHost === null || (popHost && !HOST.test(popHost)) || smtpHost === null || (smtpHost && !HOST.test(smtpHost))) throw new MailError('Sunucu adı geçersiz.');
        if (smtpPort !== null && ![25, 465, 587].includes(smtpPort)) throw new MailError('SMTP portu 25, 465 ya da 587 olmalı.');
        return { name, signature, password, popHost: popHost || null, smtpHost: smtpHost || null, smtpPort };
    };

    app.post('/api/admin/mail/accounts', requireAdmin, async (req, res) => {
        if (!configured()) return res.status(503).json({ error: 'Posta köprüsü (MAIL_RELAY_URL / MAIL_RELAY_SECRET) tanımlı değil.' });
        try {
            const email = cleanText(req.body?.email, 254)?.toLowerCase();
            if (!email || !EMAIL.test(email)) throw new MailError('Geçerli bir e-posta adresi yazın.');
            const input = readAccountInput(req.body, { requirePassword: true });
            const { rows: [dup] } = await q('SELECT id FROM mail_accounts WHERE email = $1', [email]);
            if (dup) throw new MailError('Bu hesap zaten ekli.');
            const probe = { email, password: input.password, pop_host: input.popHost, smtp_host: input.smtpHost, smtp_port: input.smtpPort };
            const check = await gateway('check', probe, {}, 30_000);
            const { rows: [row] } = await q(
                `INSERT INTO mail_accounts (email, name, secret, pop_host, smtp_host, smtp_port, signature, server_count)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [email, input.name, seal(input.password), input.popHost, input.smtpHost, input.smtpPort, input.signature, check.count ?? null]
            );
            console.log(`[webmail] ${req.admin?.username}: hesap eklendi ${email}`);
            void syncAccount(row.id, 50_000).catch((e) => console.warn(`[webmail] ilk eşitleme (${email}):`, e.message));
            res.status(201).json(await getAccountRow(row.id));
        } catch (e) {
            fail(res, e);
        }
    });

    app.put('/api/admin/mail/accounts/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const acc = id && await loadAccount(id);
        if (!acc) return res.status(404).json({ error: 'Hesap bulunamadı.' });
        try {
            const input = readAccountInput(req.body, { requirePassword: false });
            const password = input.password || acc.password;
            if (!password) throw new MailError('Parolayı yeniden girin.');
            const changed = input.password || input.popHost !== acc.pop_host || input.smtpHost !== acc.smtp_host || input.smtpPort !== acc.smtp_port;
            if (changed) await gateway('check', { email: acc.email, password, pop_host: input.popHost, smtp_host: input.smtpHost, smtp_port: input.smtpPort }, {}, 30_000);
            await q(
                `UPDATE mail_accounts SET name = $1, signature = $2, secret = $3, pop_host = $4, smtp_host = $5, smtp_port = $6,
                        last_error = CASE WHEN $7::boolean THEN NULL ELSE last_error END
                  WHERE id = $8`,
                [input.name, input.signature, seal(password), input.popHost, input.smtpHost, input.smtpPort, !!changed, id]
            );
            res.json(await getAccountRow(id));
        } catch (e) {
            fail(res, e);
        }
    });

    app.delete('/api/admin/mail/accounts/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const { rowCount } = id ? await q('DELETE FROM mail_accounts WHERE id = $1', [id]) : { rowCount: 0 };
        if (!rowCount) return res.status(404).json({ error: 'Hesap bulunamadı.' });
        res.json({ success: true });
    });

    app.post('/api/admin/mail/accounts/:id/sync', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id || !(await getAccountRow(id))) return res.status(404).json({ error: 'Hesap bulunamadı.' });
        try {
            const r = await syncAccount(id, 45_000);
            res.json({ ...r, account: await getAccountRow(id) });
        } catch (e) {
            if (!(e instanceof MailError)) throw e;
            res.status(400).json({ error: e.message, account: await getAccountRow(id) });
        }
    });

    // ------------------------------------------------------------ iletiler

    const LIST_COLUMNS = `m.id, m.account_id, a.email AS account_email, m.folder, m.from_addr, m.from_name, m.to_addrs, m.subject, m.snippet,
        m.seen, m.starred, m.sent_at, m.size,
        EXISTS (SELECT 1 FROM jsonb_array_elements(m.attachments) x WHERE NOT (x->>'inline')::boolean) AS has_attachments`;

    app.get('/api/admin/mail/messages', requireAdmin, async (req, res) => {
        const accountId = req.query.account && req.query.account !== 'all' ? parseId(req.query.account) : null;
        const folder = String(req.query.folder || 'inbox');
        const search = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 200) : '';
        const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
        const offset = Math.max(Number(req.query.offset) || 0, 0);
        const where = [];
        const params = [];
        const add = (sql, value) => { params.push(value); where.push(sql.replaceAll('$?', `$${params.length}`)); };
        if (accountId) add('m.account_id = $?', accountId);
        if (folder === 'starred') where.push("m.starred AND m.folder <> 'purged'");
        else if (folder === 'unread') where.push("NOT m.seen AND m.folder = 'inbox'");
        else if (FOLDERS.includes(folder)) add('m.folder = $?', folder);
        else return res.status(400).json({ error: 'Geçersiz klasör.' });
        if (search) {
            add(`(m.subject ILIKE $? OR m.from_addr ILIKE $? OR m.from_name ILIKE $? OR m.to_addrs::text ILIKE $? OR m.text_body ILIKE $?)`,
                `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
        }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const [{ rows }, { rows: [count] }] = await Promise.all([
            q(`SELECT ${LIST_COLUMNS} FROM mail_messages m JOIN mail_accounts a ON a.id = m.account_id ${whereSql}
                ORDER BY m.sent_at DESC, m.id DESC LIMIT ${limit} OFFSET ${offset}`, params),
            q(`SELECT COUNT(*)::int AS total FROM mail_messages m ${whereSql}`, params),
        ]);
        res.json({ messages: rows, total: count.total });
    });

    app.get('/api/admin/mail/messages/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const { rows: [row] } = id ? await q(
            `UPDATE mail_messages m SET seen = TRUE FROM mail_accounts a
              WHERE m.id = $1 AND a.id = m.account_id AND m.folder <> 'purged'
              RETURNING m.id, m.account_id, a.email AS account_email, m.folder, m.message_id, m.in_reply_to, m.refs, m.from_addr, m.from_name,
                        m.to_addrs, m.cc_addrs, m.bcc_addrs, m.reply_to, m.subject, m.snippet, m.text_body, m.html_body, m.attachments,
                        m.seen, m.starred, m.sent_at, m.size`,
            [id]
        ) : { rows: [] };
        if (!row) return res.status(404).json({ error: 'İleti bulunamadı.' });
        res.json(row);
    });

    app.get('/api/admin/mail/messages/:id/attachments/:i', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const index = Number(req.params.i);
        const { rows: [row] } = id ? await q('SELECT raw FROM mail_messages WHERE id = $1', [id]) : { rows: [] };
        if (!row?.raw || !Number.isInteger(index) || index < 0) return res.status(404).json({ error: 'Ek bulunamadı.' });
        const parsed = await simpleParser(row.raw);
        const att = parsed.attachments[index];
        if (!att) return res.status(404).json({ error: 'Ek bulunamadı.' });
        const filename = att.filename || `ek-${index + 1}`;
        res.set({
            'Content-Type': att.contentType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${filename.replace(/[^\x20-\x7e]|"/g, '_')}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
        });
        res.send(att.content);
    });

    /** Toplu işlem: read, unread, star, unstar, trash, restore, purge (çöpten kalıcı silme; server=true ise sunucudan da). */
    app.post('/api/admin/mail/messages/actions', requireAdmin, async (req, res) => {
        const ids = Array.isArray(req.body?.ids) ? [...new Set(req.body.ids.map(parseId).filter(Boolean))].slice(0, 500) : [];
        const action = req.body?.action;
        if (!ids.length) return res.status(400).json({ error: 'İleti seçin.' });
        const simple = {
            read: 'seen = TRUE', unread: 'seen = FALSE', star: 'starred = TRUE', unstar: 'starred = FALSE',
            trash: "prev_folder = folder, folder = 'trash'",
            restore: "folder = COALESCE(prev_folder, 'inbox'), prev_folder = NULL",
        };
        if (simple[action]) {
            const guard = action === 'trash' ? "AND folder <> 'trash'" : action === 'restore' ? "AND folder = 'trash'" : '';
            const { rowCount } = await q(`UPDATE mail_messages SET ${simple[action]} WHERE id = ANY($1::int[]) AND folder <> 'purged' ${guard}`, [ids]);
            return res.json({ updated: rowCount });
        }
        if (action !== 'purge') return res.status(400).json({ error: 'Geçersiz işlem.' });
        const { rows } = await q("SELECT id, account_id, uid FROM mail_messages WHERE id = ANY($1::int[]) AND folder = 'trash'", [ids]);
        const errors = [];
        if (req.body?.server === true) {
            const byAccount = new Map();
            for (const r of rows.filter((x) => x.uid)) byAccount.set(r.account_id, [...(byAccount.get(r.account_id) ?? []), r.uid]);
            for (const [accountId, uids] of byAccount) {
                try {
                    await serial(accountId, async () => {
                        const acc = await loadAccount(accountId);
                        if (!acc?.password) throw new MailError('Hesap parolası çözülemedi.');
                        await gateway('delete', acc, { uids });
                    });
                } catch (e) {
                    if (!(e instanceof MailError)) throw e;
                    errors.push(e.message);
                }
            }
        }
        // Sunucuda kalan iletiler bir sonraki eşitlemede geri gelmesin diye iz bırakılır.
        await q(
            `UPDATE mail_messages SET folder = 'purged', prev_folder = NULL, raw = NULL, text_body = NULL, html_body = NULL, snippet = '',
                    attachments = '[]'::jsonb, starred = FALSE
              WHERE id = ANY($1::int[]) AND uid IS NOT NULL`,
            [rows.map((r) => r.id)]
        );
        await q('DELETE FROM mail_messages WHERE id = ANY($1::int[]) AND uid IS NULL', [rows.map((r) => r.id)]);
        res.json({ deleted: rows.length, ...(errors.length && { warning: `Sunucudan silinemedi: ${errors[0]}` }) });
    });

    // ------------------------------------------------------------ gönderim

    app.post('/api/admin/mail/send', requireAdmin, async (req, res) => {
        const accountId = parseId(req.body?.accountId);
        const acc = accountId && await loadAccount(accountId);
        if (!acc) return res.status(404).json({ error: 'Gönderen hesap bulunamadı.' });
        try {
            if (!acc.password) throw new MailError('Hesap parolası çözülemedi; parolayı yeniden girin.');
            const to = parseAddresses(req.body?.to);
            const cc = parseAddresses(req.body?.cc);
            const bcc = parseAddresses(req.body?.bcc);
            if (!to.length && !cc.length && !bcc.length) throw new MailError('En az bir alıcı yazın.');
            const rcpts = [...new Set([...to, ...cc, ...bcc].map((a) => a.address))];
            if (rcpts.length > 100) throw new MailError('En fazla 100 alıcı.');
            const subject = optionalText(req.body?.subject, 500);
            if (subject === null) throw new MailError('Konu çok uzun.');
            const html = typeof req.body?.html === 'string' ? req.body.html.slice(0, 2_000_000) : '';
            if (!htmlToPlain(html) && !Array.isArray(req.body?.attachments)) throw new MailError('İleti boş.');

            const attachments = [];
            let total = 0;
            for (const a of Array.isArray(req.body?.attachments) ? req.body.attachments.slice(0, 20) : []) {
                const content = typeof a?.data === 'string' ? Buffer.from(a.data, 'base64') : null;
                if (!content?.length) continue;
                total += content.length;
                attachments.push({ filename: String(a.filename || 'ek').slice(0, 200), contentType: String(a.contentType || 'application/octet-stream').slice(0, 120), content });
            }
            const forwardId = parseId(req.body?.forwardAttachmentsOf);
            if (forwardId) {
                const { rows: [orig] } = await q('SELECT raw FROM mail_messages WHERE id = $1', [forwardId]);
                if (orig?.raw) {
                    for (const a of (await simpleParser(orig.raw)).attachments.filter((x) => !x.related)) {
                        total += a.content.length;
                        attachments.push({ filename: a.filename || 'ek', contentType: a.contentType, content: a.content });
                    }
                }
            }
            if (total > ATTACH_MAX) throw new MailError('Eklerin toplamı en fazla 4 MB olabilir.');

            let inReplyTo;
            let references;
            const replyId = parseId(req.body?.replyTo);
            if (replyId) {
                const { rows: [orig] } = await q('SELECT message_id, refs FROM mail_messages WHERE id = $1', [replyId]);
                if (orig?.message_id) {
                    inReplyTo = orig.message_id;
                    references = [orig.refs, orig.message_id].filter(Boolean).join(' ');
                }
            }

            const domain = acc.email.split('@')[1];
            const raw = await new MailComposer({
                from: { name: acc.name || '', address: acc.email },
                to, cc, bcc,
                subject: subject || '',
                html: html || undefined,
                text: htmlToPlain(html),
                attachments,
                inReplyTo, references,
                messageId: `<${randomBytes(12).toString('hex')}@${domain}>`,
                date: new Date(),
            }).compile().build();
            if (raw.length > RAW_MAX) throw new MailError('İleti çok büyük; ekleri küçültün.');

            const r = await gateway('send', acc, { rcpts, raw: raw.toString('base64') }, 60_000);
            const id = await insertMessage(acc, { folder: 'sent', raw, seen: true, bcc });
            if (replyId) await q("UPDATE mail_messages SET seen = TRUE WHERE id = $1", [replyId]);
            console.log(`[webmail] ${req.admin?.username}: ${acc.email} → ${rcpts.length} alıcı`);
            const rejected = Array.isArray(r.rejected) ? r.rejected : [];
            res.status(201).json({ id, ...(rejected.length && { warning: `Reddedilen alıcılar: ${rejected.map((x) => x.to).join(', ')}` }) });
        } catch (e) {
            fail(res, e);
        }
    });
};
