import pg from 'pg';

/**
 * Thin adapter that exposes the SQLite-style API (run/get/all) on top of
 * node-postgres so that route handlers in server/index.js don't need to
 * know whether they're talking to SQLite or Postgres.
 *
 * Translation rules:
 *   - `?` placeholders  →  `$1, $2, $3 ...`
 *   - `INSERT` without `RETURNING`  →  appended `RETURNING id`
 *   - Postgres unique-violation (SQLSTATE 23505)  →  thrown Error whose
 *     .code === 'UNIQUE' so callers can detect duplicates portably
 *
 * Note: the adapter is opinionated about a small surface area. Anything
 * Postgres-specific (transactions, JSONB, CTEs) is available via the
 * underlying `pool` (callers can grab it from `.pool` if needed).
 */
class PostgresAdapter {
    constructor(pool) {
        this.pool = pool;
    }

    /** Convert `?` placeholders to `$1, $2, ...`. */
    _convertPlaceholders(sql) {
        let i = 0;
        return sql.replace(/\?/g, () => `$${++i}`);
    }

    async run(sql, params = []) {
        let finalSql = this._convertPlaceholders(sql);
        // Auto-append RETURNING id on plain INSERT statements so the
        // SQLite-shaped `result.lastID` keeps working in route handlers.
        if (/^\s*INSERT\b/i.test(sql) && !/\bRETURNING\b/i.test(finalSql)) {
            finalSql = finalSql.replace(/;\s*$/, '') + ' RETURNING id';
        }
        try {
            const result = await this.pool.query(finalSql, params);
            return {
                lastID: result.rows[0]?.id ?? null,
                rowCount: result.rowCount ?? 0,
                changes: result.rowCount ?? 0,
                rows: result.rows,
            };
        } catch (e) {
            // 23505 = unique_violation
            if (e.code === '23505') {
                const wrapped = new Error(`UNIQUE constraint failed: ${e.detail ?? ''}`);
                wrapped.code = 'UNIQUE';
                throw wrapped;
            }
            throw e;
        }
    }

    async get(sql, params = []) {
        const finalSql = this._convertPlaceholders(sql);
        const result = await this.pool.query(finalSql, params);
        return result.rows[0] ?? null;
    }

    async all(sql, params = []) {
        const finalSql = this._convertPlaceholders(sql);
        const result = await this.pool.query(finalSql, params);
        return result.rows;
    }

    async exec(sql) {
        // Supports multi-statement strings the way db.exec() did in SQLite.
        await this.pool.query(sql);
    }

    async close() {
        await this.pool.end();
    }
}

/**
 * Add a column to the users table if it does not already exist.
 * Idempotent — safe to call on every startup.
 */
const ensureColumn = async (client, column, definition) => {
    const { rows } = await client.query(
        `SELECT column_name
           FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name   = 'users'
            AND column_name  = $1`,
        [column]
    );
    if (rows.length > 0) return false;
    console.log(`[db] Migration: adding column users.${column}`);
    await client.query(`ALTER TABLE users ADD COLUMN ${column} ${definition}`);
    return true;
};

/**
 * Connect to Postgres using DATABASE_URL. Required env vars:
 *   - DATABASE_URL (postgresql://user:pass@host:port/db)
 *   - PGSSL (optional, "true" forces SSL — needed for Railway Postgres)
 */
export const initDb = async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error(
            'DATABASE_URL is not set. Local dev: export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edesign'
        );
    }

    const useSsl =
        process.env.PGSSL === 'true' ||
        process.env.NODE_ENV === 'production' ||
        /sslmode=require/i.test(databaseUrl);

    const pool = new pg.Pool({
        connectionString: databaseUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30_000,
    });

    // Fail fast on bad connection strings.
    const probe = await pool.connect();
    try {
        // Schema bootstrap.
        await probe.query(`
            CREATE TABLE IF NOT EXISTS users (
                id                SERIAL PRIMARY KEY,
                username          TEXT UNIQUE NOT NULL,
                password          TEXT NOT NULL,
                full_name         TEXT,
                company_name      TEXT,
                phone_number      TEXT,
                role              TEXT NOT NULL DEFAULT 'user',
                credits           INTEGER NOT NULL DEFAULT 0,
                free_design_used  INTEGER NOT NULL DEFAULT 0,
                created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        // Idempotent column migrations for tables that pre-date the
        // full schema (created in earlier deploys with fewer columns).
        await ensureColumn(probe, 'full_name', 'TEXT');
        await ensureColumn(probe, 'company_name', 'TEXT');
        await ensureColumn(probe, 'phone_number', 'TEXT');
        await ensureColumn(probe, 'free_design_used', 'INTEGER NOT NULL DEFAULT 0');

        // Useful indexes for the auth query path.
        await probe.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)`);

        // Sprint 1 (2026-10-02) — Designs tablosu (kullanici tasarimlarini DB'de sakla)
        await probe.query(`
            CREATE TABLE IF NOT EXISTS designs (
                id                SERIAL PRIMARY KEY,
                user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name              TEXT NOT NULL,
                module_id         TEXT NOT NULL,
                xslt_content      TEXT,
                custom_content    TEXT,
                theme_color       TEXT,
                sections_json     JSONB,
                status            TEXT NOT NULL DEFAULT 'draft',
                created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        // Sprint 1 — designs tablosu icin idempotent column migration
        await ensureDesignsColumn(probe, 'theme_color', 'TEXT');
        await ensureDesignsColumn(probe, 'sections_json', 'JSONB');
        await ensureDesignsColumn(probe, 'status', "TEXT NOT NULL DEFAULT 'draft'");
        // İndirilen (kredi harcanmış) tasarım: anahtar dosyaya yazılır, tekrar
        // yüklendiğinde aynı tasarıma ücretsiz devam edilir.
        await ensureDesignsColumn(probe, 'design_key', 'TEXT');
        await ensureDesignsColumn(probe, 'xml_content', 'TEXT');
        await ensureDesignsColumn(probe, 'paid_at', 'TIMESTAMPTZ');
        await ensureDesignsColumn(probe, 'download_count', 'INTEGER NOT NULL DEFAULT 0');
        await probe.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_designs_design_key ON designs (design_key) WHERE design_key IS NOT NULL`);

        await probe.query(`CREATE INDEX IF NOT EXISTS idx_designs_user_id ON designs (user_id)`);
        await probe.query(`CREATE INDEX IF NOT EXISTS idx_designs_updated_at ON designs (updated_at DESC)`);

        // Sprint 1.3 (2026-10-02) — Payments tablosu (iyzico webhook takibi)
        await probe.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id                SERIAL PRIMARY KEY,
                user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                plan_id           TEXT NOT NULL,
                conversation_id   TEXT,
                token             TEXT,
                amount            NUMERIC NOT NULL,
                currency          TEXT NOT NULL DEFAULT 'TRY',
                status            TEXT NOT NULL DEFAULT 'pending',
                created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                completed_at      TIMESTAMPTZ
            )
        `);
        await probe.query(`CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id)`);
        await probe.query(`CREATE INDEX IF NOT EXISTS idx_payments_token ON payments (token)`);
        await probe.query(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status)`);
    } finally {
        probe.release();
    }

    console.log('[db] Connected to Postgres');
    return new PostgresAdapter(pool);
};

/**
 * Idempotent designs tablosu kolon ekleme (ensureColumn'in designs versiyonu).
 */
const ensureDesignsColumn = async (client, column, definition) => {
    const { rows } = await client.query(
        `SELECT column_name
           FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name   = 'designs'
            AND column_name  = $1`,
        [column]
    );
    if (rows.length > 0) return false;
    console.log(`[db] Migration: adding column designs.${column}`);
    await client.query(`ALTER TABLE designs ADD COLUMN ${column} ${definition}`);
    return true;
};
