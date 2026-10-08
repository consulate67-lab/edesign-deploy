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
        await ensureColumn(probe, 'last_seen_at', 'TIMESTAMPTZ');

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
        // Onaylanan XSLT'nin kilitlendiği VKN/TCKN (shared/license-lock.js).
        await ensureDesignsColumn(probe, 'license_tax_id', 'TEXT');
        // Çevrimiçi lisans mührünün adresindeki tahmin edilemez anahtar.
        await ensureDesignsColumn(probe, 'license_token', 'TEXT');
        await probe.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_designs_design_key ON designs (design_key) WHERE design_key IS NOT NULL`);
        await probe.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_designs_license_token ON designs (license_token) WHERE license_token IS NOT NULL`);
        // Onaylı XSLT'nin açıldığı her VKN/TCKN: nerede, kaç kez, geçerli mi.
        await probe.query(`
            CREATE TABLE IF NOT EXISTS license_checks (
                design_id     INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
                tax_id        TEXT NOT NULL,
                ok            BOOLEAN NOT NULL,
                hits          INTEGER NOT NULL DEFAULT 1,
                first_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                last_seen     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                last_ip       TEXT,
                last_agent    TEXT,
                last_referer  TEXT,
                PRIMARY KEY (design_id, tax_id)
            )
        `);

        await probe.query(`CREATE INDEX IF NOT EXISTS idx_designs_user_id ON designs (user_id)`);
        await probe.query(`CREATE INDEX IF NOT EXISTS idx_designs_updated_at ON designs (updated_at DESC)`);

        // Paket ödemeleri; conversation_id = PayTR merchant_oid, token = PayTR iframe jetonu.
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
        await probe.query(`CREATE INDEX IF NOT EXISTS idx_payments_conversation_id ON payments (conversation_id)`);
        await probe.query(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status)`);

        await createSupportSchema(probe);
        await promoteAdmins(probe);
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

/**
 * Yönetim paneli, destek talepleri, online destek, galeri ve tasarım yapay zekası tabloları.
 */
const createSupportSchema = async (client) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS admin_otp (
            id           TEXT PRIMARY KEY,
            user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            code_hash    TEXT NOT NULL,
            expires_at   TIMESTAMPTZ NOT NULL,
            attempts     INTEGER NOT NULL DEFAULT 0,
            consumed_at  TIMESTAMPTZ,
            created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            ip           TEXT
        )
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS support_tickets (
            id               SERIAL PRIMARY KEY,
            user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            subject          TEXT NOT NULL,
            status           TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
            context          JSONB,
            created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            last_message_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets (user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_last_message ON support_tickets (last_message_at DESC)`);

    await client.query(`
        CREATE TABLE IF NOT EXISTS support_messages (
            id                SERIAL PRIMARY KEY,
            ticket_id         INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
            sender            TEXT NOT NULL CHECK (sender IN ('user', 'admin')),
            body              TEXT NOT NULL,
            via               TEXT NOT NULL DEFAULT 'web' CHECK (via IN ('web', 'telegram')),
            created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            read_by_admin_at  TIMESTAMPTZ,
            read_by_user_at   TIMESTAMPTZ
        )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages (ticket_id)`);

    await client.query(`
        CREATE TABLE IF NOT EXISTS remote_sessions (
            id            TEXT PRIMARY KEY,
            user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            ticket_id     INTEGER REFERENCES support_tickets(id) ON DELETE SET NULL,
            status        TEXT NOT NULL CHECK (status IN ('requested', 'active', 'ended', 'declined')),
            initiated_by  TEXT NOT NULL CHECK (initiated_by IN ('user', 'admin')),
            note          TEXT,
            created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            started_at    TIMESTAMPTZ,
            ended_at      TIMESTAMPTZ,
            admin_id      INTEGER REFERENCES users(id) ON DELETE SET NULL
        )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_remote_sessions_user_status ON remote_sessions (user_id, status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_remote_sessions_status ON remote_sessions (status)`);

    await client.query(`
        CREATE TABLE IF NOT EXISTS gallery_designs (
            id           SERIAL PRIMARY KEY,
            name         TEXT NOT NULL,
            description  TEXT NOT NULL DEFAULT '',
            doc_type_id  TEXT NOT NULL,
            module_id    TEXT NOT NULL,
            sector       TEXT NOT NULL DEFAULT '',
            category     TEXT NOT NULL DEFAULT '',
            accent       TEXT NOT NULL DEFAULT '',
            tags         JSONB NOT NULL DEFAULT '[]'::jsonb,
            xslt         TEXT NOT NULL,
            xml          TEXT NOT NULL DEFAULT '',
            published    BOOLEAN NOT NULL DEFAULT FALSE,
            source       TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('ai', 'manual')),
            created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_gallery_designs_published ON gallery_designs (published)`);

    await client.query(`
        CREATE TABLE IF NOT EXISTS ai_memory (
            id           SERIAL PRIMARY KEY,
            doc_type_id  TEXT NOT NULL,
            category     TEXT NOT NULL DEFAULT '',
            sector       TEXT NOT NULL DEFAULT '',
            prompt       TEXT NOT NULL DEFAULT '',
            answers      JSONB NOT NULL DEFAULT '{}'::jsonb,
            params       JSONB NOT NULL DEFAULT '{}'::jsonb,
            rating       SMALLINT NOT NULL DEFAULT 0 CHECK (rating IN (-1, 0, 1)),
            published    BOOLEAN NOT NULL DEFAULT FALSE,
            gallery_id   INTEGER REFERENCES gallery_designs(id) ON DELETE SET NULL,
            created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ai_memory_doc_type ON ai_memory (doc_type_id, created_at DESC)`);

    await client.query(`
        CREATE TABLE IF NOT EXISTS assistant_log (
            id          SERIAL PRIMARY KEY,
            session     TEXT,
            question    TEXT NOT NULL,
            norm        TEXT NOT NULL,
            answer      TEXT NOT NULL,
            mode        TEXT NOT NULL,
            score       REAL,
            kb_ref      TEXT,
            page        TEXT,
            helpful     SMALLINT CHECK (helpful IN (-1, 1)),
            resolved    BOOLEAN NOT NULL DEFAULT FALSE,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_assistant_log_norm ON assistant_log (norm, created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_assistant_log_created ON assistant_log (created_at DESC)`);

    await client.query(`
        CREATE TABLE IF NOT EXISTS assistant_kb (
            id          SERIAL PRIMARY KEY,
            question    TEXT NOT NULL,
            answer      TEXT NOT NULL,
            keywords    TEXT NOT NULL DEFAULT '',
            actions     JSONB NOT NULL DEFAULT '[]'::jsonb,
            status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'disabled')),
            source      TEXT NOT NULL DEFAULT 'admin' CHECK (source IN ('admin', 'learned')),
            norm        TEXT NOT NULL DEFAULT '',
            log_id      INTEGER REFERENCES assistant_log(id) ON DELETE SET NULL,
            hits        INTEGER NOT NULL DEFAULT 0,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_assistant_kb_status ON assistant_kb (status)`);
};

/**
 * ADMIN_USERNAMES (virgülle ayrılmış e-postalar) içindeki mevcut kullanıcılara
 * yönetici rolü verir. Sonradan kayıt olanlar bir sonraki açılışta yükseltilir.
 */
const promoteAdmins = async (client) => {
    const usernames = (process.env.ADMIN_USERNAMES || '')
        .split(',')
        .map((u) => u.trim().toLowerCase())
        .filter(Boolean);
    if (usernames.length === 0) return;
    const { rows } = await client.query(
        `UPDATE users SET role = 'admin', updated_at = NOW()
          WHERE LOWER(username) = ANY($1) AND role <> 'admin'
          RETURNING username`,
        [usernames]
    );
    for (const row of rows) console.log(`[db] ADMIN_USERNAMES: '${row.username}' yönetici yapıldı.`);
};
