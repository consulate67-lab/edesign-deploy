import { otpChannel } from './admin-auth.js';
import { isOnline, presenceList, presenceOf, sendInvite } from './realtime.js';
import * as remote from './remote.js';
import { smsStatus } from './sms.js';
import * as telegram from './telegram.js';
import {
    BODY_MAX, TICKET_STATUSES, addMessage, getTicket, listTickets, markRead, serializeTicket, setTicketStatus, withMessages,
} from './tickets.js';
import { cleanText, isPlainObject, optionalText, parseId } from './util.js';
import {
    DOCUMENT_MODES, INVOICE_NOTE_MAX, INVOICE_NUMBER_RE, buildInvoiceDraft, istanbulDate, isIsoDate, parseBilling,
} from '../shared/invoice-billing.js';

// PayTR bildirimi başarılı ödemeyi 'success' olarak işaretler.
const PAID_STATUSES = ['success', 'completed'];
const MAX_CREDITS_DELTA = 100_000;
const AI_JSON_MAX = 200_000;
const AI_PROMPT_MAX = 20_000;
const RATINGS = [-1, 0, 1];

const USER_SELECT = `
    SELECT u.id, u.username, u.full_name, u.company_name, u.phone_number, u.role, u.credits,
           u.free_design_used, u.created_at, u.last_seen_at,
           (SELECT COUNT(*)::int FROM designs d WHERE d.user_id = u.id) AS design_count,
           (SELECT COUNT(*)::int FROM designs d WHERE d.user_id = u.id AND d.paid_at IS NOT NULL) AS paid_design_count,
           (SELECT COALESCE(SUM(p.amount), 0)::float8 FROM payments p
             WHERE p.user_id = u.id AND p.status = ANY('{${PAID_STATUSES.join(',')}}')) AS payment_total,
           (SELECT COUNT(*)::int FROM support_tickets t WHERE t.user_id = u.id) AS ticket_count
      FROM users u`;

const serializeUser = (row) => ({
    ...row,
    online: isOnline(row.id),
    current_view: presenceOf(row.id)?.view ?? null,
});

const serializeMemory = (row) => ({
    id: row.id,
    doc_type_id: row.doc_type_id,
    category: row.category,
    sector: row.sector,
    prompt: row.prompt,
    answers: row.answers,
    params: row.params,
    rating: row.rating,
    published: row.published,
    gallery_id: row.gallery_id,
    created_at: row.created_at,
});

const escapeLike = (text) => text.replace(/[\\%_]/g, (c) => `\\${c}`);
const jsonFits = (value) => isPlainObject(value) && JSON.stringify(value).length <= AI_JSON_MAX;

export const registerAdminRoutes = (app, { db, requireAdmin, packages = {}, website = null }) => {
    const getUser = (id) => db.get(`${USER_SELECT} WHERE u.id = ?`, [id]);

    app.get('/api/admin/stats', requireAdmin, async (_req, res) => {
        const row = await db.get(`
            SELECT (SELECT COUNT(*)::int FROM users) AS users,
                   (SELECT COUNT(*)::int FROM users WHERE created_at > NOW() - INTERVAL '7 days') AS "newUsers7d",
                   (SELECT COUNT(*)::int FROM designs) AS designs,
                   (SELECT COUNT(*)::int FROM designs WHERE paid_at IS NOT NULL) AS "paidDesigns",
                   (SELECT COUNT(*)::int FROM support_tickets WHERE status = 'open') AS "openTickets",
                   (SELECT COUNT(*)::int FROM remote_sessions WHERE status = 'requested') AS "pendingRemote",
                   (SELECT COALESCE(SUM(amount), 0)::float8 FROM payments WHERE status = ANY(?)) AS "revenueTotal",
                   (SELECT COUNT(*)::int FROM payments WHERE status = 'success' AND invoice_status = 'ready') AS "invoicesReady",
                   (SELECT COUNT(*)::int FROM payments WHERE status = 'success' AND billing IS NULL) AS "paidWithoutBilling",
                   (SELECT COUNT(*)::int FROM gallery_designs) AS "galleryDesigns"`,
        [PAID_STATUSES]);
        res.json({ ...row, onlineUsers: presenceList().length });
    });

    // ------------------------------------------------------------ kullanıcılar

    app.get('/api/admin/users', requireAdmin, async (req, res) => {
        const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
        const rows = q
            ? await db.all(
                `${USER_SELECT}
                  WHERE u.username ILIKE ? OR u.full_name ILIKE ? OR u.company_name ILIKE ? OR u.phone_number ILIKE ?
                  ORDER BY u.created_at DESC LIMIT 500`,
                Array(4).fill(`%${escapeLike(q)}%`)
            )
            : await db.all(`${USER_SELECT} ORDER BY u.created_at DESC LIMIT 500`);
        res.json(rows.map(serializeUser));
    });

    app.get('/api/admin/users/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const user = id && await getUser(id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        const [designs, payments, tickets] = await Promise.all([
            db.all(
                `SELECT id, name, module_id, status, paid_at IS NOT NULL AS paid, download_count, updated_at
                   FROM designs WHERE user_id = ? ORDER BY updated_at DESC LIMIT 500`,
                [id]
            ),
            db.all(
                `SELECT id, plan_id, amount::float8 AS amount, currency, status, created_at, completed_at, invoice_status
                   FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 500`,
                [id]
            ),
            listTickets(db, { userId: id, limit: 200 }),
        ]);
        res.json({ ...serializeUser(user), designs, payments, tickets: tickets.map((t) => serializeTicket(t)) });
    });

    app.patch('/api/admin/users/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz kullanıcı id.' });
        const delta = req.body?.credits_delta;
        if (delta !== undefined) {
            if (!Number.isInteger(delta) || Math.abs(delta) > MAX_CREDITS_DELTA) {
                return res.status(400).json({ error: `credits_delta en fazla ±${MAX_CREDITS_DELTA} olan bir tam sayı olmalı.` });
            }
            const updated = await db.get(
                'UPDATE users SET credits = GREATEST(credits + ?, 0), updated_at = NOW() WHERE id = ? RETURNING id',
                [delta, id]
            );
            if (!updated) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
            console.log(`[admin] ${req.admin.username}: user=${id} credits ${delta > 0 ? '+' : ''}${delta}`);
        }
        const user = await getUser(id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        res.json(serializeUser(user));
    });

    // ------------------------------------------------------------ faturalar

    const INVOICE_LIST = `
        SELECT p.id, p.user_id, p.plan_id, p.amount::float8 AS amount, p.currency, p.conversation_id,
               p.completed_at, p.invoice_status, p.billing, p.invoice_draft, p.invoice_number, p.invoice_issued_at,
               u.username, u.full_name, u.phone_number
          FROM payments p
          JOIN users u ON u.id = p.user_id
         WHERE p.status = 'success'`;
    const INVOICE_SCOPES = {
        ready: `AND p.invoice_status = 'ready'`,
        issued: `AND p.invoice_status = 'issued'`,
        missing: 'AND p.billing IS NULL',
        all: '',
    };

    const serializeInvoice = (row) => ({
        id: row.id,
        user_id: row.user_id,
        username: row.username,
        full_name: row.full_name,
        phone_number: row.phone_number,
        plan_id: row.plan_id,
        amount: row.amount,
        currency: row.currency,
        merchant_oid: row.conversation_id,
        paid_at: row.completed_at,
        invoice_status: row.invoice_status,
        invoice_number: row.invoice_number,
        invoice_issued_at: row.invoice_issued_at,
        billing: row.billing,
        draft: row.invoice_draft,
    });

    const getInvoice = (id) => db.get(`${INVOICE_LIST} AND p.id = ?`, [id]);

    const findInvoice = async (req, res) => {
        const id = parseId(req.params.id);
        const row = id && await getInvoice(id);
        if (!row) res.status(404).json({ error: 'Fatura kaydı bulunamadı.' });
        return row || null;
    };

    app.get('/api/admin/invoices', requireAdmin, async (req, res) => {
        const scope = Object.hasOwn(INVOICE_SCOPES, req.query.status) ? req.query.status : 'ready';
        const rows = await db.all(
            `${INVOICE_LIST} ${INVOICE_SCOPES[scope]}
             ORDER BY p.completed_at DESC NULLS LAST, p.id DESC
             LIMIT 500`
        );
        const missing = await db.get(
            `SELECT COUNT(*)::int AS n FROM payments WHERE status = 'success' AND billing IS NULL`
        );
        res.json({ paidWithoutBilling: missing?.n ?? 0, items: rows.map(serializeInvoice) });
    });

    // Alıcı bilgisi, belge türü, tarih ve not düzeltilir; taslak ödenen tutardan yeniden hesaplanır.
    app.patch('/api/admin/invoices/:id', requireAdmin, async (req, res) => {
        const row = await findInvoice(req, res);
        if (!row) return;
        if (row.invoice_status === 'issued') {
            return res.status(409).json({ error: 'Kesilmiş fatura düzenlenemez. Önce "Kesime geri al" ile işareti kaldırın.' });
        }
        const parsed = parseBilling(req.body?.billing);
        if (parsed.error) return res.status(400).json({ error: parsed.error });
        const documentMode = req.body?.documentMode ?? 'auto';
        if (!DOCUMENT_MODES.includes(documentMode)) return res.status(400).json({ error: 'Geçersiz belge türü.' });
        const issueDate = req.body?.issueDate || istanbulDate();
        if (!isIsoDate(issueDate)) return res.status(400).json({ error: 'Fatura tarihi YYYY-AA-GG biçiminde olmalı.' });
        if (issueDate > istanbulDate()) return res.status(400).json({ error: 'Fatura tarihi bugünden ileri olamaz.' });
        const note = optionalText(req.body?.note, INVOICE_NOTE_MAX);
        if (note === null) return res.status(400).json({ error: `Not en fazla ${INVOICE_NOTE_MAX} karakter olabilir.` });

        const known = packages[row.plan_id];
        const draft = buildInvoiceDraft({
            plan: { name: known?.name || row.plan_id, credits: known?.credits ?? 0, price: row.amount },
            currency: row.currency || 'TRY',
            billing: parsed.billing,
            user: row,
            merchantOid: row.conversation_id,
            issueDate,
            website: row.invoice_draft?.payment?.website ?? website,
            documentMode,
            note,
        });
        await db.run(
            `UPDATE payments SET billing = ?::jsonb, invoice_draft = ?::jsonb, invoice_status = 'ready' WHERE id = ?`,
            [JSON.stringify(parsed.billing), JSON.stringify(draft), row.id]
        );
        console.log(`[admin] ${req.admin.username}: fatura taslağı güncellendi payment=${row.id} belge=${draft.document.preferred}`);
        res.json(serializeInvoice(await getInvoice(row.id)));
    });

    // EDM'de kesilen faturanın numarası işlenir ya da işaret kaldırılıp kesime geri alınır.
    app.post('/api/admin/invoices/:id/status', requireAdmin, async (req, res) => {
        const row = await findInvoice(req, res);
        if (!row) return;
        if (!row.billing || !row.invoice_draft) return res.status(400).json({ error: 'Önce fatura bilgilerini girin.' });
        const status = req.body?.status;
        if (status === 'issued') {
            const number = typeof req.body?.number === 'string' ? req.body.number.trim().toUpperCase() : '';
            if (!INVOICE_NUMBER_RE.test(number)) {
                return res.status(400).json({ error: 'Fatura numarası 16 karakter olmalı: 3 harf/rakam seri + yıl + 9 hane sıra (ör. EDX2026000000001).' });
            }
            const taken = await db.get(
                `SELECT id FROM payments WHERE invoice_number = ? AND id <> ? LIMIT 1`,
                [number, row.id]
            );
            if (taken) return res.status(409).json({ error: `Bu fatura numarası #${taken.id} numaralı ödemede kullanılmış.` });
            await db.run(
                `UPDATE payments SET invoice_status = 'issued', invoice_number = ?, invoice_issued_at = NOW() WHERE id = ?`,
                [number, row.id]
            );
            console.log(`[admin] ${req.admin.username}: fatura kesildi payment=${row.id} no=${number}`);
        } else if (status === 'ready') {
            await db.run(
                `UPDATE payments SET invoice_status = 'ready', invoice_number = NULL, invoice_issued_at = NULL WHERE id = ?`,
                [row.id]
            );
            console.log(`[admin] ${req.admin.username}: fatura kesime geri alındı payment=${row.id}`);
        } else {
            return res.status(400).json({ error: 'Geçersiz fatura durumu.' });
        }
        res.json(serializeInvoice(await getInvoice(row.id)));
    });

    // ------------------------------------------------------------ destek talepleri

    const findTicket = async (req, res) => {
        const id = parseId(req.params.id);
        const ticket = id && await getTicket(db, id);
        if (!ticket) res.status(404).json({ error: 'Destek talebi bulunamadı.' });
        return ticket || null;
    };

    app.get('/api/admin/tickets', requireAdmin, async (req, res) => {
        const status = req.query.status;
        if (status !== undefined && !TICKET_STATUSES.includes(status)) return res.status(400).json({ error: 'Geçersiz durum.' });
        const rows = await listTickets(db, { status });
        res.json(rows.map((t) => serializeTicket(t)));
    });

    app.get('/api/admin/tickets/:id', requireAdmin, async (req, res) => {
        const ticket = await findTicket(req, res);
        if (!ticket) return;
        await markRead(db, ticket.id, 'admin');
        const [full] = await withMessages(db, [await getTicket(db, ticket.id)]);
        res.json(full);
    });

    app.post('/api/admin/tickets/:id/messages', requireAdmin, async (req, res) => {
        const ticket = await findTicket(req, res);
        if (!ticket) return;
        const body = cleanText(req.body?.body, BODY_MAX);
        if (!body) return res.status(400).json({ error: `Mesaj 1-${BODY_MAX} karakter olmalı.` });
        res.json(await addMessage(db, ticket, { sender: 'admin', body }));
    });

    app.patch('/api/admin/tickets/:id', requireAdmin, async (req, res) => {
        if (!TICKET_STATUSES.includes(req.body?.status)) return res.status(400).json({ error: 'Geçersiz durum.' });
        const ticket = await findTicket(req, res);
        if (!ticket) return;
        res.json(serializeTicket(await setTicketStatus(db, ticket, req.body.status)));
    });

    // ------------------------------------------------------------ online destek

    app.get('/api/admin/remote', requireAdmin, async (_req, res) => {
        res.json((await remote.listSessions(db)).map(remote.serializeSession));
    });

    app.post('/api/admin/remote', requireAdmin, async (req, res) => {
        const userId = parseId(req.body?.userId);
        const user = userId && await db.get('SELECT id FROM users WHERE id = ?', [userId]);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

        const open = await remote.findOpenSession(db, userId);
        if (open) {
            if (open.status === 'requested' && open.initiated_by === 'admin') sendInvite(open, req.admin.full_name || req.admin.username);
            return res.json(remote.serializeSession(open));
        }
        const session = await remote.createSession(db, { userId, initiatedBy: 'admin', adminId: req.admin.id });
        sendInvite(session, req.admin.full_name || req.admin.username);
        res.json(remote.serializeSession(session));
    });

    // ------------------------------------------------------------ tasarım yapay zekası hafızası

    app.get('/api/admin/ai/memory', requireAdmin, async (req, res) => {
        const limit = Math.min(parseId(req.query.limit) ?? 50, 500);
        const docType = typeof req.query.doc_type_id === 'string' && req.query.doc_type_id ? req.query.doc_type_id : null;
        const rows = docType
            ? await db.all(`SELECT * FROM ai_memory WHERE doc_type_id = ? ORDER BY created_at DESC, id DESC LIMIT ${limit}`, [docType])
            : await db.all(`SELECT * FROM ai_memory ORDER BY created_at DESC, id DESC LIMIT ${limit}`);
        res.json(rows.map(serializeMemory));
    });

    app.post('/api/admin/ai/memory', requireAdmin, async (req, res) => {
        const b = req.body || {};
        const docType = cleanText(b.doc_type_id, 64);
        const category = optionalText(b.category, 64);
        const sector = optionalText(b.sector, 64);
        const prompt = optionalText(b.prompt, AI_PROMPT_MAX);
        const rating = b.rating ?? 0;
        if (!docType) return res.status(400).json({ error: 'Belge türü zorunludur.' });
        if (category === null || sector === null) return res.status(400).json({ error: 'Kategori ve sektör en fazla 64 karakter olabilir.' });
        if (prompt === null) return res.status(400).json({ error: `İstem en fazla ${AI_PROMPT_MAX} karakter olabilir.` });
        if (!jsonFits(b.answers) || !jsonFits(b.params)) return res.status(400).json({ error: 'answers ve params 200 KB\'ı aşmayan nesneler olmalı.' });
        if (!RATINGS.includes(rating)) return res.status(400).json({ error: 'Puan -1, 0 ya da 1 olmalı.' });

        const row = await db.get(
            `INSERT INTO ai_memory (doc_type_id, category, sector, prompt, answers, params, rating, created_by)
             VALUES (?, ?, ?, ?, ?::jsonb, ?::jsonb, ?, ?) RETURNING *`,
            [docType, category, sector, prompt, JSON.stringify(b.answers), JSON.stringify(b.params), rating, req.admin.id]
        );
        res.json(serializeMemory(row));
    });

    app.patch('/api/admin/ai/memory/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz kayıt id.' });
        const { rating, published, gallery_id: galleryId } = req.body || {};
        const sets = [];
        const params = [];
        if (rating !== undefined) {
            if (!RATINGS.includes(rating)) return res.status(400).json({ error: 'Puan -1, 0 ya da 1 olmalı.' });
            sets.push('rating = ?'); params.push(rating);
        }
        if (published !== undefined) {
            if (typeof published !== 'boolean') return res.status(400).json({ error: 'published alanı true/false olmalı.' });
            sets.push('published = ?'); params.push(published);
        }
        if (galleryId !== undefined) {
            const gallery = galleryId === null ? null : parseId(galleryId);
            if (galleryId !== null && !(gallery && await db.get('SELECT id FROM gallery_designs WHERE id = ?', [gallery]))) {
                return res.status(400).json({ error: 'Galeri tasarımı bulunamadı.' });
            }
            sets.push('gallery_id = ?'); params.push(gallery);
        }
        if (sets.length === 0) return res.status(400).json({ error: 'Güncellenecek alan belirtilmedi.' });
        const row = await db.get(`UPDATE ai_memory SET ${sets.join(', ')} WHERE id = ? RETURNING *`, [...params, id]);
        if (!row) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
        res.json(serializeMemory(row));
    });

    // ------------------------------------------------------------ ayarlar

    app.get('/api/admin/settings/status', requireAdmin, async (_req, res) => {
        res.json({ telegram: await telegram.getStatus(), sms: smsStatus(), otpChannel: otpChannel() });
    });

    app.post('/api/admin/settings/telegram-test', requireAdmin, async (req, res) => {
        if (!telegram.isChatConfigured()) {
            return res.status(400).json({ error: 'Telegram yapılandırılmamış (TELEGRAM_BOT_TOKEN ve TELEGRAM_ADMIN_CHAT_ID gerekli).' });
        }
        try {
            await telegram.sendToAdmin(`✅ Test mesajı — ${telegram.escapeHtml(req.admin.full_name || req.admin.username)}`);
        } catch (e) {
            return res.status(502).json({ error: `Telegram mesajı gönderilemedi: ${e.message}` });
        }
        res.json({ success: true });
    });
};
