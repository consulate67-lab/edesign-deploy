/**
 * Yol A API: entegratör hesabı bağlama + onaylı XSLT’yi şablon olarak yükleme.
 * Belge gönderimi yok.
 */
import { cleanText, optionalText, parseId } from '../util.js';
import { getAdapter } from './registry.js';
import { moduleToDocKind, providerById, publicProviders } from './providers.js';
import { createSealer } from './seal.js';
import { edmAdapter } from './edm.js';

const SECRET_KEYS = new Set(['password', 'appKey', 'apiKey', 'token', 'secret']);

const serializeAccount = (row) => ({
    id: row.id,
    provider: row.provider,
    label: row.label,
    environment: row.environment,
    meta: row.public_meta || {},
    lastVerifiedAt: row.last_verified_at || null,
    lastError: row.last_error || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    providerReady: !!providerById(row.provider)?.ready,
});

const serializeDeployment = (row) => ({
    id: row.id,
    designId: row.design_id,
    accountId: row.account_id,
    provider: row.provider,
    moduleId: row.module_id,
    status: row.status,
    remoteId: row.remote_id || null,
    fileName: row.file_name || null,
    error: row.error || null,
    attempt: row.attempt,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

const pickSecrets = (providerId, body) => {
    const def = providerById(providerId);
    if (!def) {
        const e = new Error('Bilinmeyen entegratör.');
        e.status = 400;
        throw e;
    }
    const raw = body && typeof body === 'object' ? body : {};
    const out = {};
    for (const f of def.fields) {
        const v = raw[f.key];
        if (v === undefined || v === null || v === '') {
            if (f.required) {
                const e = new Error(`${f.label} gerekli.`);
                e.status = 400;
                throw e;
            }
            continue;
        }
        if (typeof v !== 'string' || v.length > 500) {
            const e = new Error(`${f.label} geçersiz.`);
            e.status = 400;
            throw e;
        }
        out[f.key] = v.trim();
    }
    return out;
};

const normalizeCreds = (providerId, body) => {
    const raw = body?.credentials && typeof body.credentials === 'object' ? body.credentials : body;
    if (providerId === 'edm') return edmAdapter.normalizeCredentials(raw || {});
    return pickSecrets(providerId, raw || {});
};

const publicMetaFromCreds = (creds) => {
    const meta = {};
    for (const [k, v] of Object.entries(creds || {})) {
        if (SECRET_KEYS.has(k) || /pass|secret|token|key/i.test(k)) continue;
        meta[k] = v;
    }
    if (creds?.username) meta.username = creds.username;
    return meta;
};

const safeFileName = (name, moduleId) => {
    const base = String(name || 'tasarim')
        .replace(/[^\w\u00C0-\u024F\- ]+/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .slice(0, 60) || 'tasarim';
    const kind = moduleToDocKind(moduleId).toLowerCase();
    return `${base}_${kind}.xslt`;
};

export const registerIntegratorRoutes = (app, { db, authenticateToken, requireAdmin, secret }) => {
    const { seal, open } = createSealer(secret);

    app.get('/api/integrators/providers', authenticateToken, (_req, res) => {
        res.json({ providers: publicProviders() });
    });

    app.get('/api/integrators/accounts', authenticateToken, async (req, res) => {
        const rows = await db.all(
            `SELECT * FROM integrator_accounts WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50`,
            [req.user.id]
        );
        res.json({ accounts: rows.map(serializeAccount) });
    });

    app.post('/api/integrators/accounts', authenticateToken, async (req, res) => {
        const provider = cleanText(req.body?.provider, 40);
        if (!provider || !providerById(provider)) {
            return res.status(400).json({ error: 'Geçerli bir entegratör seçin.' });
        }
        const environment = req.body?.environment === 'live' ? 'live' : 'test';
        const label = optionalText(req.body?.label, 80) ?? '';
        let creds;
        try {
            creds = normalizeCreds(provider, req.body);
        } catch (e) {
            return res.status(e.status || 400).json({ error: e.message });
        }
        const meta = publicMetaFromCreds(creds);
        const sealed = seal(JSON.stringify(creds));
        try {
            const row = await db.get(
                `INSERT INTO integrator_accounts
                    (user_id, provider, label, environment, public_meta, secrets_sealed, updated_at)
                 VALUES (?, ?, ?, ?, ?::jsonb, ?, NOW())
                 ON CONFLICT (user_id, provider, environment, label)
                 DO UPDATE SET
                    public_meta = EXCLUDED.public_meta,
                    secrets_sealed = EXCLUDED.secrets_sealed,
                    last_error = NULL,
                    updated_at = NOW()
                 RETURNING *`,
                [req.user.id, provider, label || '', environment, JSON.stringify(meta), sealed]
            );
            res.json({ account: serializeAccount(row) });
        } catch (e) {
            console.error('[integrators] account save:', e.message);
            res.status(500).json({ error: 'Hesap kaydedilemedi.' });
        }
    });

    app.delete('/api/integrators/accounts/:id', authenticateToken, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz hesap.' });
        const r = await db.run(
            `DELETE FROM integrator_accounts WHERE id = ? AND user_id = ?`,
            [id, req.user.id]
        );
        if (!r?.changes) return res.status(404).json({ error: 'Hesap bulunamadı.' });
        res.json({ success: true });
    });

    app.get('/api/integrators/deployments', authenticateToken, async (req, res) => {
        const designId = parseId(req.query.designId);
        const rows = designId
            ? await db.all(
                `SELECT * FROM template_deployments
                  WHERE user_id = ? AND design_id = ?
                  ORDER BY created_at DESC LIMIT 50`,
                [req.user.id, designId]
            )
            : await db.all(
                `SELECT * FROM template_deployments
                  WHERE user_id = ?
                  ORDER BY created_at DESC LIMIT 50`,
                [req.user.id]
            );
        res.json({ deployments: rows.map(serializeDeployment) });
    });

    app.post('/api/integrators/deploy', authenticateToken, async (req, res) => {
        const designId = parseId(req.body?.designId);
        const accountId = parseId(req.body?.accountId);
        if (!designId || !accountId) {
            return res.status(400).json({ error: 'designId ve accountId gerekli.' });
        }

        const design = await db.get(
            `SELECT id, user_id, name, module_id, xslt_content, custom_content, paid_at, purged_at, license_tax_id
               FROM designs WHERE id = ? AND user_id = ?`,
            [designId, req.user.id]
        );
        if (!design || design.purged_at) {
            return res.status(404).json({ error: 'Tasarım bulunamadı.' });
        }
        if (!design.paid_at) {
            return res.status(400).json({ error: 'Yalnız onaylı (ücretli) tasarım entegratöre yüklenebilir.' });
        }
        const xslt = design.xslt_content || design.custom_content || '';
        if (!xslt.trim()) {
            return res.status(400).json({ error: 'Tasarımın XSLT içeriği boş.' });
        }

        const account = await db.get(
            `SELECT * FROM integrator_accounts WHERE id = ? AND user_id = ?`,
            [accountId, req.user.id]
        );
        if (!account) return res.status(404).json({ error: 'Entegratör hesabı bulunamadı.' });

        const def = providerById(account.provider);
        if (def?.modules?.length && !def.modules.includes(design.module_id)) {
            return res.status(400).json({
                error: `${def.name} bu belge türünü (${design.module_id}) desteklemiyor.`,
            });
        }

        let credentials;
        try {
            credentials = JSON.parse(open(account.secrets_sealed));
        } catch {
            return res.status(500).json({ error: 'Hesap kimlik bilgileri okunamadı; hesabı yeniden kaydedin.' });
        }

        const fileName = safeFileName(design.name, design.module_id);
        const queued = await db.get(
            `INSERT INTO template_deployments
                (user_id, design_id, account_id, provider, module_id, status, file_name, updated_at)
             VALUES (?, ?, ?, ?, ?, 'uploading', ?, NOW())
             RETURNING *`,
            [req.user.id, designId, accountId, account.provider, design.module_id, fileName]
        );

        try {
            const { adapter } = getAdapter(account.provider);
            const result = await adapter.uploadTemplate({
                credentials,
                xslt,
                moduleId: design.module_id,
                name: design.name,
                taxId: design.license_tax_id || null,
                fileName,
                environment: account.environment,
            });
            const done = await db.get(
                `UPDATE template_deployments
                    SET status = 'uploaded', remote_id = ?, error = NULL, updated_at = NOW()
                  WHERE id = ?
                  RETURNING *`,
                [result?.remoteId || null, queued.id]
            );
            await db.run(
                `UPDATE integrator_accounts SET last_verified_at = NOW(), last_error = NULL, updated_at = NOW() WHERE id = ?`,
                [accountId]
            );
            return res.json({ deployment: serializeDeployment(done) });
        } catch (e) {
            const pending = e.code === 'PROVIDER_NOT_READY';
            const status = pending ? 'pending_provider' : 'failed';
            const failed = await db.get(
                `UPDATE template_deployments
                    SET status = ?, error = ?, updated_at = NOW()
                  WHERE id = ?
                  RETURNING *`,
                [status, e.message || 'Yükleme başarısız.', queued.id]
            );
            await db.run(
                `UPDATE integrator_accounts SET last_error = ?, updated_at = NOW() WHERE id = ?`,
                [e.message || 'Hata', accountId]
            );
            return res.status(e.status || 502).json({
                error: e.message || 'Yükleme başarısız.',
                deployment: serializeDeployment(failed),
            });
        }
    });

    app.get('/api/admin/integrator-deployments', requireAdmin, async (req, res) => {
        const limit = Math.min(Number(req.query.limit) || 100, 500);
        const rows = await db.all(
            `SELECT d.*, u.username, u.full_name, u.company_name, des.name AS design_name
               FROM template_deployments d
               JOIN users u ON u.id = d.user_id
               JOIN designs des ON des.id = d.design_id
              ORDER BY d.created_at DESC
              LIMIT ?`,
            [limit]
        );
        res.json({
            deployments: rows.map((r) => ({
                ...serializeDeployment(r),
                designName: r.design_name,
                user: {
                    id: r.user_id,
                    username: r.username,
                    full_name: r.full_name,
                    company_name: r.company_name,
                },
            })),
        });
    });
};
