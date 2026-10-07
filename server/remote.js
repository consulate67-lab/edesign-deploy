import { randomUUID } from 'node:crypto';
import { toTicketUser } from './util.js';

/** Onaylanmayan / katılınmayan istek bu süreden sonra kapatılır. */
const REQUEST_TTL = '30 minutes';

const SESSION_SELECT = `
    SELECT s.*, u.username, u.full_name, u.company_name, u.phone_number
      FROM remote_sessions s
      JOIN users u ON u.id = s.user_id`;

export const serializeSession = (row) => row && ({
    id: row.id,
    user_id: row.user_id,
    ticket_id: row.ticket_id,
    status: row.status,
    initiated_by: row.initiated_by,
    note: row.note,
    created_at: row.created_at,
    started_at: row.started_at,
    ended_at: row.ended_at,
    user: toTicketUser(row),
});

export const getSession = (db, id) =>
    db.get(`${SESSION_SELECT} WHERE s.id = ?`, [String(id)]);

/** Kullanıcının bekleyen ya da süren oturumu. */
export const findOpenSession = (db, userId) =>
    db.get(`${SESSION_SELECT} WHERE s.user_id = ? AND s.status IN ('requested', 'active') ORDER BY s.created_at DESC LIMIT 1`, [userId]);

export const listSessions = (db, { status, limit = 50 } = {}) => status
    ? db.all(`${SESSION_SELECT} WHERE s.status = ? ORDER BY s.created_at DESC LIMIT ${limit}`, [status])
    : db.all(`${SESSION_SELECT} ORDER BY s.created_at DESC LIMIT ${limit}`);

export const createSession = async (db, { userId, ticketId = null, note = null, initiatedBy, adminId = null }) => {
    const id = randomUUID();
    await db.run(
        `INSERT INTO remote_sessions (id, user_id, ticket_id, status, initiated_by, note, admin_id)
         VALUES (?, ?, ?, 'requested', ?, ?, ?)`,
        [id, userId, ticketId, initiatedBy, note, adminId]
    );
    return getSession(db, id);
};

/** Durum `from` listesindeyse `to`'ya geçirir; geçiş olmadıysa null. */
export const transitionSession = async (db, id, from, to, adminId = null) => {
    const stamp = to === 'active' ? ', started_at = NOW()' : ', ended_at = NOW()';
    const row = await db.get(
        `UPDATE remote_sessions SET status = ?, admin_id = COALESCE(?, admin_id)${stamp}
          WHERE id = ? AND status = ANY(?) RETURNING id`,
        [to, adminId, String(id), from]
    );
    return row ? getSession(db, id) : null;
};

/** Süresi geçen istekleri kapatır, kapatılan oturumların id/user_id listesini döner. */
export const expireStaleRequests = (db) => db.all(
    `UPDATE remote_sessions SET status = 'ended', ended_at = NOW()
      WHERE status = 'requested' AND created_at < NOW() - INTERVAL '${REQUEST_TTL}'
      RETURNING id, user_id`
);
