/**
 * Paket ödemelerinde kullanılan indirim kodları.
 * Kampanya oluştururken alıcı başına tek kullanımlık kod üretilebilir;
 * ödeme (PayTR) sırasında tutar yüzdesel düşülür, başarılı ödemede kullanım sayılır.
 */
import { randomBytes } from 'node:crypto';

const CODE_RE = /^[A-Z0-9][A-Z0-9-]{3,31}$/;

export const normalizeDiscountCode = (value) => {
    if (typeof value !== 'string') return null;
    const code = value.trim().toUpperCase().replace(/\s+/g, '');
    return code && CODE_RE.test(code) ? code : null;
};

export const createDiscountSchema = async (client) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS discount_codes (
            id           SERIAL PRIMARY KEY,
            code         TEXT NOT NULL UNIQUE,
            percent      INTEGER NOT NULL CHECK (percent > 0 AND percent <= 90),
            email        TEXT,
            name         TEXT NOT NULL DEFAULT '',
            tag          TEXT NOT NULL DEFAULT '',
            max_uses     INTEGER NOT NULL DEFAULT 1 CHECK (max_uses > 0),
            used_count   INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
            expires_at   TIMESTAMPTZ,
            campaign_id  INTEGER REFERENCES mail_campaigns(id) ON DELETE SET NULL,
            created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_discount_codes_tag ON discount_codes (tag)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_discount_codes_campaign ON discount_codes (campaign_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_discount_codes_email ON discount_codes (email)`);

    for (const [table, column, definition] of [
        ['mail_campaign_recipients', 'discount_code', 'TEXT'],
        ['payments', 'discount_code', 'TEXT'],
        ['payments', 'discount_percent', 'INTEGER'],
    ]) {
        const { rows } = await client.query(
            `SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
            [table, column]
        );
        if (!rows.length) {
            console.log(`[db] Migration: adding column ${table}.${column}`);
            await client.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        }
    }
};

const mintCode = (prefix = 'BAYI20') =>
    `${prefix}-${randomBytes(4).toString('hex').toUpperCase()}`;

/** Çakışma olursa yeniden dener; tek transaction içinde çağrılmalı. */
export const insertDiscountCode = async (client, {
    percent,
    email = null,
    name = '',
    tag = '',
    maxUses = 1,
    expiresAt = null,
    campaignId = null,
    createdBy = null,
    prefix = 'BAYI20',
}) => {
    for (let attempt = 0; attempt < 8; attempt++) {
        const code = mintCode(prefix);
        try {
            await client.query(
                `INSERT INTO discount_codes
                    (code, percent, email, name, tag, max_uses, expires_at, campaign_id, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [code, percent, email, name || '', tag || '', maxUses, expiresAt, campaignId, createdBy]
            );
            return code;
        } catch (e) {
            if (e?.code === '23505') continue; // unique_violation
            throw e;
        }
    }
    throw new Error('Benzersiz indirim kodu üretilemedi.');
};

/** Geçerli kodu doğrular; tutarı yüzde indirimli döner. */
export const resolveDiscount = async (db, { code, amount }) => {
    const normalized = normalizeDiscountCode(code);
    if (!normalized) return { error: 'Geçersiz indirim kodu.' };
    const base = Number(amount);
    if (!(base > 0)) return { error: 'Geçersiz tutar.' };

    const row = await db.get(
        `SELECT id, code, percent, max_uses, used_count, expires_at
           FROM discount_codes WHERE code = ?`,
        [normalized]
    );
    if (!row) return { error: 'İndirim kodu bulunamadı.' };
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
        return { error: 'İndirim kodunun süresi dolmuş.' };
    }
    if (row.used_count >= row.max_uses) {
        return { error: 'İndirim kodu daha önce kullanılmış.' };
    }
    const percent = Number(row.percent);
    const discounted = Math.round(base * (100 - percent)) / 100;
    if (!(discounted > 0)) return { error: 'İndirim sonrası tutar geçersiz.' };
    return {
        id: row.id,
        code: row.code,
        percent,
        originalAmount: base,
        amount: discounted,
    };
};

/** Başarılı ödemede kullanım sayacını artırır (idempotent değil; callback transaction içinde çağrılmalı). */
export const markDiscountUsed = async (client, code) => {
    const normalized = normalizeDiscountCode(code);
    if (!normalized) return;
    await client.query(
        `UPDATE discount_codes
            SET used_count = used_count + 1
          WHERE code = $1 AND used_count < max_uses`,
        [normalized]
    );
};
