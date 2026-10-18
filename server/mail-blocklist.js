/**
 * Yasaklı / listeden çıkmış e-posta adresleri (`mail_unsubscribes`).
 * Link ile çıkış, gelen kutudaki “abonelikten çık” yanıtları ve elle ekleme.
 */
import { EMAIL_PATTERN } from './email-verify.js';

const STRICT_EMAIL = /^[a-z0-9!#$%&*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&*+/=?^_`{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

export const normalizeBlockEmail = (value) => {
    if (typeof value !== 'string') return null;
    const email = value.trim().toLowerCase();
    return email.length <= 254 && EMAIL_PATTERN.test(email) && STRICT_EMAIL.test(email) ? email : null;
};

/** Konu / gövde “abonelikten çık” niyeti taşıyor mu? */
export const isUnsubscribeIntent = (subject = '', text = '', html = '') => {
    const raw = `${subject}\n${text || ''}\n${(html || '').replace(/<[^>]+>/g, ' ')}`;
    const fold = raw
        .toLocaleLowerCase('tr-TR')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/ı/g, 'i');
    return /abonelikten\s*cik|listeden\s*cik|listeden\s*cikar|unsubscribe|opt[\s-]?out|remove\s+me|stop\s+(mailing|emails?|sending)|mail\s*gonderme|e-?posta\s*gonderme|artik\s*mail\s*istem|istemiyorum|cikarmak\s*istiyorum|lutfen\s*listeden|please\s+unsubscribe|do\s+not\s+(email|contact|send)/i
        .test(fold);
};

export const ensureBlocklistColumns = async (client) => {
    await client.query(`ALTER TABLE mail_unsubscribes ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'link'`);
    await client.query(`ALTER TABLE mail_unsubscribes ADD COLUMN IF NOT EXISTS note TEXT NOT NULL DEFAULT ''`);
};

/**
 * Adresi yasaklı listeye ekler; bekleyen kampanya alıcılarını atlar.
 * @returns {Promise<string|null>} normalize edilmiş e-posta veya null
 */
export const banEmail = async (db, email, { source = 'manual', note = '' } = {}) => {
    const normalized = normalizeBlockEmail(email);
    if (!normalized) return null;
    const src = ['link', 'reply', 'manual', 'scan'].includes(source) ? source : 'manual';
    const noteText = String(note || '').slice(0, 400);
    await db.run(
        `INSERT INTO mail_unsubscribes (email, source, note) VALUES (?, ?, ?)
         ON CONFLICT (email) DO UPDATE SET
           source = CASE
             WHEN mail_unsubscribes.source = 'link' AND EXCLUDED.source <> 'link' THEN EXCLUDED.source
             ELSE mail_unsubscribes.source END,
           note = CASE
             WHEN mail_unsubscribes.note = '' AND EXCLUDED.note <> '' THEN EXCLUDED.note
             ELSE mail_unsubscribes.note END`,
        [normalized, src, noteText]
    );
    await db.run(
        `UPDATE mail_campaign_recipients SET status = 'skipped', error = 'Listeden çıkmış / yasaklı'
          WHERE email = ? AND status = 'pending'`,
        [normalized]
    );
    return normalized;
};

/** Gelen kutuya düşen ileti abonelikten çık talebiyse göndereni yasakla. */
export const banFromIncomingMail = async (db, { from, subject, text, html, ownEmails = [] }) => {
    const email = normalizeBlockEmail(from);
    if (!email) return null;
    const own = new Set((ownEmails || []).map((e) => String(e).toLowerCase()));
    if (own.has(email)) return null;
    if (!isUnsubscribeIntent(subject, text, html)) return null;
    const note = `Gelen posta: ${(subject || '').slice(0, 120)}`;
    const banned = await banEmail(db, email, { source: 'reply', note });
    if (banned) console.log(`[blocklist] abonelikten çık → ${banned}`);
    return banned;
};
