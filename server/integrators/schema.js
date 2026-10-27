/** Yol A — entegratör hesabı ve XSLT teslim kayıtları. */
export const createIntegratorSchema = async (client) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS integrator_accounts (
            id              SERIAL PRIMARY KEY,
            user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            provider        TEXT NOT NULL,
            label           TEXT NOT NULL DEFAULT '',
            environment     TEXT NOT NULL DEFAULT 'test'
                                CHECK (environment IN ('test', 'live')),
            public_meta     JSONB NOT NULL DEFAULT '{}'::jsonb,
            secrets_sealed  TEXT NOT NULL,
            last_verified_at TIMESTAMPTZ,
            last_error      TEXT,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`
        CREATE INDEX IF NOT EXISTS idx_integrator_accounts_user
            ON integrator_accounts (user_id, updated_at DESC)
    `);
    await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_integrator_accounts_user_provider_env_label
            ON integrator_accounts (user_id, provider, environment, label)
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS template_deployments (
            id              SERIAL PRIMARY KEY,
            user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            design_id       INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
            account_id      INTEGER NOT NULL REFERENCES integrator_accounts(id) ON DELETE CASCADE,
            provider        TEXT NOT NULL,
            module_id       TEXT NOT NULL,
            status          TEXT NOT NULL DEFAULT 'queued'
                                CHECK (status IN (
                                    'queued', 'uploading', 'uploaded', 'rejected', 'failed', 'pending_provider'
                                )),
            remote_id       TEXT,
            file_name       TEXT,
            error           TEXT,
            attempt         INTEGER NOT NULL DEFAULT 1,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`
        CREATE INDEX IF NOT EXISTS idx_template_deployments_user
            ON template_deployments (user_id, created_at DESC)
    `);
    await client.query(`
        CREATE INDEX IF NOT EXISTS idx_template_deployments_design
            ON template_deployments (design_id, created_at DESC)
    `);
};
