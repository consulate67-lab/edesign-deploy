import { notifyAdmins, notifyUser } from './realtime.js';
import * as telegram from './telegram.js';
import { toTicketUser } from './util.js';

export const TICKET_STATUSES = ['open', 'answered', 'closed'];
export const SUBJECT_MAX = 200;
export const BODY_MAX = 5000;

const TICKET_SELECT = `
    SELECT t.*, u.username, u.full_name, u.company_name, u.phone_number,
           (SELECT LEFT(m.body, 200) FROM support_messages m WHERE m.ticket_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_message,
           (SELECT COUNT(*)::int FROM support_messages m
             WHERE m.ticket_id = t.id AND m.sender = 'user' AND m.read_by_admin_at IS NULL) AS unread_for_admin,
           (SELECT COUNT(*)::int FROM support_messages m
             WHERE m.ticket_id = t.id AND m.sender = 'admin' AND m.read_by_user_at IS NULL) AS unread_for_user
      FROM support_tickets t
      JOIN users u ON u.id = t.user_id`;

export const serializeMessage = (m) => ({
    id: m.id,
    ticket_id: m.ticket_id,
    sender: m.sender,
    body: m.body,
    via: m.via,
    created_at: m.created_at,
});

export const serializeTicket = (row, messages) => ({
    id: row.id,
    user_id: row.user_id,
    subject: row.subject,
    status: row.status,
    context: row.context ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_message_at: row.last_message_at,
    last_message: row.last_message ?? null,
    unread_for_admin: row.unread_for_admin,
    unread_for_user: row.unread_for_user,
    user: toTicketUser(row),
    ...(messages && { messages }),
});

export const getTicket = (db, id) => db.get(`${TICKET_SELECT} WHERE t.id = ?`, [id]);

export const listTickets = (db, { userId, status, limit = 300 } = {}) => {
    const where = [];
    const params = [];
    if (userId) { where.push('t.user_id = ?'); params.push(userId); }
    if (status) { where.push('t.status = ?'); params.push(status); }
    return db.all(
        `${TICKET_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY t.last_message_at DESC LIMIT ${limit}`,
        params
    );
};

/** Talepleri mesajlarıyla (eskiden yeniye) serileştirir. */
export const withMessages = async (db, rows) => {
    if (rows.length === 0) return [];
    const messages = await db.all(
        'SELECT * FROM support_messages WHERE ticket_id = ANY(?) ORDER BY created_at, id',
        [rows.map((r) => r.id)]
    );
    const byTicket = new Map(rows.map((r) => [r.id, []]));
    for (const m of messages) byTicket.get(m.ticket_id).push(serializeMessage(m));
    return rows.map((r) => serializeTicket(r, byTicket.get(r.id)));
};

const pushTicketUpdate = (userId, ticketId) => {
    const msg = { t: 'ticket:update', ticketId };
    notifyUser(userId, msg);
    notifyAdmins(msg);
};

export const createTicket = async (db, userId, { subject, body, context }) => {
    const { ticket_id: id } = await db.get(
        `WITH t AS (
            INSERT INTO support_tickets (user_id, subject, context) VALUES (?, ?, ?::jsonb) RETURNING id
         )
         INSERT INTO support_messages (ticket_id, sender, body, via)
         SELECT id, 'user', ?, 'web' FROM t RETURNING ticket_id`,
        [userId, subject, context ? JSON.stringify(context) : null, body]
    );
    const row = await getTicket(db, id);
    telegram.notify(telegram.formatNewTicket(row, body));
    pushTicketUpdate(userId, id);
    return row;
};

/**
 * Talebe mesaj ekler. Kullanıcı mesajı talebi 'open', yönetici mesajı 'answered' yapar.
 * `ticket` getTicket satırıdır.
 */
export const addMessage = async (db, ticket, { sender, body, via = 'web' }) => {
    const message = await db.get(
        `WITH m AS (
            INSERT INTO support_messages (ticket_id, sender, body, via) VALUES (?, ?, ?, ?) RETURNING *
         ), t AS (
            UPDATE support_tickets SET status = ?, updated_at = NOW(), last_message_at = NOW() WHERE id = ?
         )
         SELECT * FROM m`,
        [ticket.id, sender, body, via, sender === 'admin' ? 'answered' : 'open', ticket.id]
    );
    if (sender === 'user') telegram.notify(telegram.formatTicketMessage(ticket, body));
    pushTicketUpdate(ticket.user_id, ticket.id);
    return serializeMessage(message);
};

export const setTicketStatus = async (db, ticket, status) => {
    await db.run('UPDATE support_tickets SET status = ?, updated_at = NOW() WHERE id = ?', [status, ticket.id]);
    pushTicketUpdate(ticket.user_id, ticket.id);
    return getTicket(db, ticket.id);
};

/** `reader` = 'admin' kullanıcı mesajlarını, 'user' yönetici mesajlarını okundu sayar. */
export const markRead = (db, ticketId, reader) => reader === 'admin'
    ? db.run(`UPDATE support_messages SET read_by_admin_at = NOW() WHERE ticket_id = ? AND sender = 'user' AND read_by_admin_at IS NULL`, [ticketId])
    : db.run(`UPDATE support_messages SET read_by_user_at = NOW() WHERE ticket_id = ? AND sender = 'admin' AND read_by_user_at IS NULL`, [ticketId]);
