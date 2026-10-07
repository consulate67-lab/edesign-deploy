import { createRateLimiter } from './rate-limit.js';
import { announceRequest } from './realtime.js';
import * as remote from './remote.js';
import * as telegram from './telegram.js';
import { BODY_MAX, SUBJECT_MAX, addMessage, createTicket, getTicket, listTickets, markRead, withMessages } from './tickets.js';
import { cleanText, isPlainObject, optionalText, parseId } from './util.js';

const CONTEXT_KEYS = ['view', 'url', 'docName', 'moduleId', 'userAgent', 'screen'];
const CONTEXT_FIELD_MAX = 500;
const NOTE_MAX = 500;

// Telegram'a giden bildirimlerin kötüye kullanımına karşı kullanıcı başına sınır.
const messageLimiter = createRateLimiter({ max: 30, windowMs: 10 * 60_000 });
const TOO_MANY = 'Çok fazla mesaj gönderdiniz. Lütfen birkaç dakika sonra tekrar deneyin.';

const cleanContext = (value) => {
    if (!isPlainObject(value)) return null;
    const context = {};
    for (const key of CONTEXT_KEYS) {
        if (typeof value[key] === 'string' && value[key]) context[key] = value[key].slice(0, CONTEXT_FIELD_MAX);
    }
    return Object.keys(context).length ? context : null;
};

export const registerSupportRoutes = (app, { db, authenticateToken }) => {
    const ownTicket = async (req, res) => {
        const id = parseId(req.params.id);
        const ticket = id && await getTicket(db, id);
        if (!ticket || ticket.user_id !== req.user.id) {
            res.status(404).json({ error: 'Destek talebi bulunamadı.' });
            return null;
        }
        return ticket;
    };

    app.post('/api/support/tickets', authenticateToken, async (req, res) => {
        const subject = cleanText(req.body?.subject, SUBJECT_MAX);
        const body = cleanText(req.body?.message, BODY_MAX);
        if (!subject) return res.status(400).json({ error: `Konu 1-${SUBJECT_MAX} karakter olmalı.` });
        if (!body) return res.status(400).json({ error: `Mesaj 1-${BODY_MAX} karakter olmalı.` });
        if (!messageLimiter(req.user.id)) return res.status(429).json({ error: TOO_MANY });

        const row = await createTicket(db, req.user.id, { subject, body, context: cleanContext(req.body?.context) });
        const [ticket] = await withMessages(db, [row]);
        res.json(ticket);
    });

    app.get('/api/support/tickets', authenticateToken, async (req, res) => {
        res.json(await withMessages(db, await listTickets(db, { userId: req.user.id, limit: 100 })));
    });

    app.post('/api/support/tickets/:id/messages', authenticateToken, async (req, res) => {
        const ticket = await ownTicket(req, res);
        if (!ticket) return;
        const body = cleanText(req.body?.body, BODY_MAX);
        if (!body) return res.status(400).json({ error: `Mesaj 1-${BODY_MAX} karakter olmalı.` });
        if (!messageLimiter(req.user.id)) return res.status(429).json({ error: TOO_MANY });
        res.json(await addMessage(db, ticket, { sender: 'user', body }));
    });

    app.post('/api/support/tickets/:id/read', authenticateToken, async (req, res) => {
        const ticket = await ownTicket(req, res);
        if (!ticket) return;
        await markRead(db, ticket.id, 'user');
        res.json({ success: true });
    });

    app.post('/api/support/remote', authenticateToken, async (req, res) => {
        const note = optionalText(req.body?.note, NOTE_MAX);
        if (note === null) return res.status(400).json({ error: `Not en fazla ${NOTE_MAX} karakter olabilir.` });
        let ticketId = null;
        if (req.body?.ticketId !== undefined && req.body.ticketId !== null) {
            ticketId = parseId(req.body.ticketId);
            const ticket = ticketId && await getTicket(db, ticketId);
            if (!ticket || ticket.user_id !== req.user.id) return res.status(400).json({ error: 'Destek talebi bulunamadı.' });
        }

        const open = await remote.findOpenSession(db, req.user.id);
        if (open) return res.json(remote.serializeSession(open));

        const session = await remote.createSession(db, { userId: req.user.id, ticketId, note: note || null, initiatedBy: 'user' });
        announceRequest(session);
        telegram.notify(telegram.formatRemoteRequest(session));
        res.json(remote.serializeSession(session));
    });

    app.get('/api/support/remote/active', authenticateToken, async (req, res) => {
        res.json(remote.serializeSession(await remote.findOpenSession(db, req.user.id)));
    });
};
