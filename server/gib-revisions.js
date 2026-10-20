/**
 * GİB / kurumsal e-belge paket ve XSLT kaynaklarının periyodik kontrolü,
 * admin onayı ve resmi artefact güncellemesi.
 *
 * Akış: HEAD ile değişiklik tespit → pending revizyon → admin onay →
 * paket indirilir/yüklenir → eşlenen dosyalar official_artifacts'a yazılır.
 */
import { createHash } from 'node:crypto';
import AdmZip from 'adm-zip';
import { createExtractorFromData } from 'node-unrar-js';
import { parseId } from './util.js';

const CHECK_INTERVAL_MS = 6 * 60 * 60_000;
const FETCH_TIMEOUT_MS = 45_000;
const MAX_PACKAGE_BYTES = 40 * 1024 * 1024;

/** @typedef {{ id: string, label: string, kind: 'zip'|'jar'|'rar'|'pdf', url: string, probes?: string[], extractMap: Record<string, string>, affects: string[], notes?: string, autoSampleXml?: boolean }} SourceDef */

/** @type {SourceDef[]} */
export const GIB_SOURCE_DEFS = [
    {
        id: 'earsiv-paket',
        label: 'e-Arşiv Paketi',
        kind: 'zip',
        url: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/earsiv_paket_v1.1_8.zip',
        probes: Array.from({ length: 12 }, (_, i) =>
            `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/earsiv_paket_v1.1_${8 + i}.zip`),
        extractMap: {
            'EArsiv.xsd': 'ebelge/earsiv/EArsiv.xsd',
            'eArsivVeri.xsd': 'ebelge/earsiv/eArsivVeri.xsd',
            'EArsivWs.wsdl': 'ebelge/earsiv/EArsivWs.wsdl',
            'earsiv_schematron.xsl': 'ebelge/earsiv/earsiv_schematron.xsl',
            'faturaOzet.xsd': 'ebelge/earsiv/faturaOzet.xsd',
            'XAdES.xsd': 'ebelge/earsiv/XAdES.xsd',
            'XAdESv141.xsd': 'ebelge/earsiv/XAdESv141.xsd',
            'xmldsig-core-schema.xsd': 'ebelge/earsiv/xmldsig-core-schema.xsd',
        },
        affects: ['earsiv', 'fatura', 'smm', 'makbuz', 'mustahsil', 'dekont'],
        notes: 'Şema / schematron paketi; e-SMM / e-MM / e-Dekont de e-Arşiv ailesindedir.',
    },
    {
        id: 'efatura-paket',
        label: 'e-Fatura Paketi',
        kind: 'zip',
        url: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-FaturaPaketi%20(29).zip',
        probes: Array.from({ length: 6 }, (_, i) =>
            `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-FaturaPaketi%20(${29 + i}).zip`),
        extractMap: {},
        autoSampleXml: true,
        affects: ['fatura', 'earsiv', 'ihracat', 'mikro_ihracat'],
        notes: 'Örnek XML ve şema; XSLT genelde görüntüleyici JAR içindedir. .xslt/.xml örnekleri otomatik eşlenir.',
    },
    {
        id: 'ebelge-viewer',
        label: 'e-Belge Görüntüleyici (JAR)',
        kind: 'jar',
        url: 'https://ebelge.gib.gov.tr/EFaturaGoruntuleyici/Windows/Java17/EBelgeGoruntuleyici.jar',
        extractMap: {
            'tr/gov/gib/vedop3/efaturaviewer/resources/default.xslt': 'ebelge/gib/e-Fatura.xslt',
            'tr/gov/gib/vedop3/efaturaviewer/resources/general.xslt': 'ebelge/gib/general.xslt',
        },
        affects: ['fatura', 'earsiv'],
        notes: 'GİB resmi görselleştirme XSLT kaynağı.',
    },
    {
        id: 'edekont-paket',
        label: 'e-Dekont Paketi',
        kind: 'rar',
        url: 'https://ebelge.gib.gov.tr/dosyalar/eDekont_Paketi.rar',
        probes: [
            'https://ebelge.gib.gov.tr/dosyalar/eDekont_Paketi.rar',
            'https://ebelge.gib.gov.tr/dosyalar/e-Dekont_Paketi.rar',
            'https://ebelge.gib.gov.tr/dosyalar/eDekont_Paket.rar',
            'https://ebelge.gib.gov.tr/dosyalar/e-Dekont.rar',
        ],
        extractMap: {
            'eArsiv.xsd': 'ebelge/earsiv/EArsiv.xsd',
            'dekont.xml': 'ebelge/samples/gib/dekont.xml',
        },
        autoSampleXml: true,
        affects: ['dekont'],
        notes: 'GİB duyurularındaki e-Dekont RAR paketi (örnek XML + eArsiv.xsd + teknik kılavuz).',
    },
    {
        id: 'esmm-kilavuz',
        label: 'e-SMM Kılavuz / doküman',
        kind: 'pdf',
        url: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-SMM_Olusturma.pdf',
        // Aynı dosyanın sürüm adları; farklı broşür/PDF karıştırılmaz.
        probes: [
            'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-SMM_Olusturma.pdf',
            'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-SMM_Olusturma_V2.pdf',
        ],
        extractMap: {},
        affects: ['smm'],
        notes: 'GİB e-SMM için ayrı zip yayımlamıyor; kılavuz/PDF değişince bildirim üretilir. Şema için e-Arşiv paketine bakın.',
    },
    {
        id: 'emakbuz-mustahsil',
        label: 'e-Makbuz / e-Müstahsil (e-MM) Kılavuz',
        kind: 'pdf',
        url: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-Mustahsil_Makbuzu_Teknik_Kilavuzu_V1.1.pdf',
        probes: [
            'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-Mustahsil_Makbuzu_Teknik_Kilavuzu_V1.0.pdf',
            'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-Mustahsil_Makbuzu_Teknik_Kilavuzu_V1.1.pdf',
            'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-Mustahsil_Makbuzu_Teknik_Kilavuzu_V1.2.pdf',
            'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-Mustahsil_Makbuzu_Teknik_Kilavuzu_V1.3.pdf',
        ],
        extractMap: {},
        affects: ['makbuz', 'mustahsil'],
        notes: 'e-MM teknik kılavuzu (PDF). Ayrı e-Makbuz zip yok; şema e-Arşiv paketinde.',
    },
];

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const headerFirst = (headers, name) => {
    const v = headers.get(name);
    return v || null;
};

async function headMeta(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
        if (!res.ok) return { ok: false, status: res.status, url };
        return {
            ok: true,
            status: res.status,
            url: res.url || url,
            contentLength: headerFirst(res.headers, 'content-length'),
            lastModified: headerFirst(res.headers, 'last-modified'),
            etag: headerFirst(res.headers, 'etag'),
            contentType: headerFirst(res.headers, 'content-type'),
        };
    } catch (e) {
        return { ok: false, status: 0, url, error: e.message };
    } finally {
        clearTimeout(timer);
    }
}

async function downloadBuffer(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
        const res = await fetch(url, { redirect: 'follow', signal: ctrl.signal });
        if (!res.ok) throw new Error(`İndirme başarısız (${res.status}): ${url}`);
        const len = Number(res.headers.get('content-length') || 0);
        if (len > MAX_PACKAGE_BYTES) throw new Error(`Paket çok büyük (${len} bayt).`);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > MAX_PACKAGE_BYTES) throw new Error(`Paket çok büyük (${buf.length} bayt).`);
        return {
            buffer: buf,
            meta: {
                url: res.url || url,
                contentLength: String(buf.length),
                lastModified: res.headers.get('last-modified'),
                etag: res.headers.get('etag'),
                contentType: res.headers.get('content-type'),
                sha256: sha256(buf),
            },
        };
    } finally {
        clearTimeout(timer);
    }
}

/** En yüksek sürüm / erişilebilir probe URL'sini seçer. */
async function resolveSourceUrl(def) {
    const candidates = [...new Set([...(def.probes || []), def.url])];
    const results = await Promise.all(candidates.map(headMeta));
    const ok = results.filter(r => r.ok);
    if (!ok.length) {
        const fail = results[results.length - 1];
        return { error: fail?.error || `Kaynak erişilemedi (${fail?.status || '?'})`, tried: results };
    }
    // probes artan sürüm sırasıyla; listedeki son başarılıyı tercih et
    let best = ok[0];
    for (const c of candidates) {
        const hit = ok.find(r => r.url === c || decodeURIComponent(r.url) === decodeURIComponent(c));
        if (hit) best = hit;
    }
    return { meta: best, tried: results };
}

const basename = (p) => p.replace(/\\/g, '/').split('/').pop() || p;

const isTextEntry = (name) => /\.(xslt?|xsd|xml|wsdl|json|txt|md|csv)$/i.test(name);

/** Yüklenen / indirilen buffer türü (kaynak kind'ına yedek). */
const detectArchiveKind = (buffer, fallback) => {
    if (!buffer || buffer.length < 4) return fallback;
    if (buffer[0] === 0x50 && buffer[1] === 0x4b) return 'zip'; // ZIP / JAR
    if (buffer.toString('ascii', 0, 4) === 'Rar!') return 'rar';
    if (buffer.toString('ascii', 0, 4) === '%PDF') return 'pdf';
    return fallback;
};

/** @returns {Promise<{ name: string, data: Buffer }[]>} */
async function listArchiveEntries(buffer, kind) {
    if (kind === 'rar') {
        const extractor = await createExtractorFromData({ data: new Uint8Array(buffer) });
        const headers = [...extractor.getFileList().fileHeaders].filter(h => !h.flags.directory);
        const extracted = extractor.extract({ files: headers.map(h => h.name) });
        const files = [...extracted.files];
        return files
            .filter(f => f.extraction && f.fileHeader && !f.fileHeader.flags.directory)
            .map(f => ({
                name: String(f.fileHeader.name).replace(/\\/g, '/'),
                data: Buffer.from(f.extraction),
            }));
    }
    const zip = new AdmZip(buffer);
    return zip.getEntries()
        .filter(e => !e.isDirectory)
        .map(e => ({
            name: e.entryName.replace(/\\/g, '/'),
            data: e.getData(),
        }));
}

/**
 * ZIP/JAR/RAR/PDF içeriğinden artefact üretir.
 */
async function extractArtifacts(buffer, def, remoteMeta = {}) {
    /** @type {{ path: string, content: string, from: string, bytes: number, sha256: string }[]} */
    const files = [];

    if (def.kind === 'pdf') {
        const name = basename(def.url).replace(/[^\w.\-()+%]/g, '_') || 'kilavuz.pdf';
        files.push({
            path: `ebelge/kilavuzlar/${name}.meta.json`,
            content: JSON.stringify({
                label: def.label,
                url: remoteMeta.url || def.url,
                contentLength: remoteMeta.contentLength || String(buffer.length),
                lastModified: remoteMeta.lastModified || null,
                sha256: sha256(buffer),
                kind: 'pdf',
            }, null, 2),
            from: name,
            bytes: buffer.length,
            sha256: sha256(buffer),
        });
        return { files, entryCount: 1, entryNames: [name] };
    }

    const entries = await listArchiveEntries(buffer, def.kind === 'jar' ? 'zip' : def.kind);
    const byName = new Map();
    for (const e of entries) {
        byName.set(e.name, e);
        byName.set(basename(e.name), e);
    }
    const used = new Set();

    for (const [from, to] of Object.entries(def.extractMap || {})) {
        const e = byName.get(from) || byName.get(basename(from));
        if (!e || !isTextEntry(e.name)) continue;
        const content = e.data.toString('utf8');
        files.push({ path: to, content, from: e.name, bytes: content.length, sha256: sha256(content) });
        used.add(e.name);
    }

    if (def.autoSampleXml || def.id === 'efatura-paket' || def.id === 'edekont-paket') {
        for (const e of entries) {
            if (used.has(e.name)) continue;
            const base = basename(e.name);
            if (/\.xslt?$/i.test(base)) {
                const content = e.data.toString('utf8');
                files.push({
                    path: `ebelge/gib/from-paket/${base}`,
                    content,
                    from: e.name,
                    bytes: e.data.length,
                    sha256: sha256(e.data),
                });
            } else if (/\.xml$/i.test(base) && /ornek|örnek|sample|temel|ticari|iade|ytb|hks|sarj|dekont|rapor|pos|para|fatura|gta|vta|epih|pago|pal/i.test(base)) {
                files.push({
                    path: `ebelge/samples/gib/${base}`,
                    content: e.data.toString('utf8'),
                    from: e.name,
                    bytes: e.data.length,
                    sha256: sha256(e.data),
                });
            } else if (/\.xsd$/i.test(base) && /earsiv|efatura|ubl/i.test(base)) {
                const dest = /earsiv/i.test(base) ? `ebelge/earsiv/${base}` : `ebelge/xsd/from-paket/${base}`;
                files.push({
                    path: dest,
                    content: e.data.toString('utf8'),
                    from: e.name,
                    bytes: e.data.length,
                    sha256: sha256(e.data),
                });
            }
        }
    }

    if (def.id === 'ebelge-viewer') {
        const defXslt = files.find(f => f.path.endsWith('e-Fatura.xslt'));
        if (defXslt && !files.some(f => f.path.endsWith('general.xslt'))) {
            files.push({
                path: 'ebelge/gib/general.xslt',
                content: defXslt.content,
                from: defXslt.from,
                bytes: defXslt.bytes,
                sha256: defXslt.sha256,
            });
        }
    }

    return {
        files,
        entryCount: entries.length,
        entryNames: entries.slice(0, 80).map(e => e.name),
    };
}

export const createGibRevisionsSchema = async (client) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS official_sources (
            id              TEXT PRIMARY KEY,
            label           TEXT NOT NULL,
            url             TEXT NOT NULL,
            kind            TEXT NOT NULL,
            tracked_meta    JSONB NOT NULL DEFAULT '{}'::jsonb,
            extract_map     JSONB NOT NULL DEFAULT '{}'::jsonb,
            affects         JSONB NOT NULL DEFAULT '[]'::jsonb,
            notes           TEXT,
            enabled         BOOLEAN NOT NULL DEFAULT TRUE,
            last_checked_at TIMESTAMPTZ,
            updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`
        CREATE TABLE IF NOT EXISTS official_revisions (
            id              SERIAL PRIMARY KEY,
            source_id       TEXT NOT NULL REFERENCES official_sources(id) ON DELETE CASCADE,
            status          TEXT NOT NULL DEFAULT 'pending',
            remote_url      TEXT NOT NULL,
            remote_meta     JSONB NOT NULL DEFAULT '{}'::jsonb,
            summary         TEXT,
            diff_summary    JSONB,
            detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            reviewed_at     TIMESTAMPTZ,
            reviewed_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
            applied_at      TIMESTAMPTZ,
            error           TEXT
        )
    `);
    await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_official_revisions_pending
            ON official_revisions (source_id) WHERE status = 'pending'
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_official_revisions_status ON official_revisions (status, detected_at DESC)`);
    await client.query(`
        CREATE TABLE IF NOT EXISTS official_artifacts (
            path            TEXT PRIMARY KEY,
            content         TEXT NOT NULL,
            content_sha256  TEXT NOT NULL,
            revision_id     INTEGER REFERENCES official_revisions(id) ON DELETE SET NULL,
            source_id       TEXT REFERENCES official_sources(id) ON DELETE SET NULL,
            updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    /** Kodda bilinen son paket imzaları — ilk kontrolde yanlış "baseline" yazılmasını önler. */
    const BASELINES = {
        'earsiv-paket': {
            url: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/earsiv_paket_v1.1_8.zip',
            contentLength: '18712',
            lastModified: 'Tue, 11 Aug 2026 07:30:26 GMT',
        },
        'efatura-paket': {
            url: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-FaturaPaketi%20(29).zip',
            contentLength: '678655',
            lastModified: 'Mon, 24 Aug 2026 14:05:42 GMT',
        },
        'ebelge-viewer': {
            url: 'https://ebelge.gib.gov.tr/EFaturaGoruntuleyici/Windows/Java17/EBelgeGoruntuleyici.jar',
            contentLength: '669202',
            lastModified: 'Mon, 25 Jul 2016 07:14:17 GMT',
        },
        'edekont-paket': {
            url: 'https://ebelge.gib.gov.tr/dosyalar/eDekont_Paketi.rar',
            contentLength: '1526917',
            lastModified: 'Thu, 18 Sep 2025 08:46:38 GMT',
        },
        'esmm-kilavuz': {
            url: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-SMM_Olusturma.pdf',
            contentLength: '343625',
            lastModified: 'Fri, 04 Oct 2019 10:42:38 GMT',
        },
        'emakbuz-mustahsil': {
            url: 'https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-Mustahsil_Makbuzu_Teknik_Kilavuzu_V1.1.pdf',
            contentLength: '869907',
            lastModified: 'Fri, 22 May 2026 08:31:13 GMT',
        },
    };

    for (const def of GIB_SOURCE_DEFS) {
        const baseline = BASELINES[def.id] || {};
        await client.query(
            `INSERT INTO official_sources (id, label, url, kind, tracked_meta, extract_map, affects, notes)
             VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8)
             ON CONFLICT (id) DO UPDATE SET
                label = EXCLUDED.label,
                url = CASE WHEN official_sources.tracked_meta = '{}'::jsonb THEN EXCLUDED.url ELSE official_sources.url END,
                kind = EXCLUDED.kind,
                extract_map = EXCLUDED.extract_map,
                affects = EXCLUDED.affects,
                notes = EXCLUDED.notes,
                tracked_meta = CASE
                    WHEN official_sources.tracked_meta = '{}'::jsonb OR official_sources.tracked_meta IS NULL
                    THEN EXCLUDED.tracked_meta ELSE official_sources.tracked_meta END,
                updated_at = NOW()`,
            [
                def.id, def.label, def.url, def.kind,
                JSON.stringify(baseline),
                JSON.stringify(def.extractMap),
                JSON.stringify(def.affects),
                def.notes || null,
            ]
        );
    }
};

const serializeRevision = (row) => ({
    id: row.id,
    source_id: row.source_id,
    source_label: row.source_label ?? null,
    status: row.status,
    remote_url: row.remote_url,
    remote_meta: row.remote_meta ?? {},
    summary: row.summary,
    diff_summary: row.diff_summary,
    detected_at: row.detected_at,
    reviewed_at: row.reviewed_at,
    reviewed_by: row.reviewed_by,
    applied_at: row.applied_at,
    error: row.error,
    affects: row.affects ?? [],
});

const serializeSource = (row) => ({
    id: row.id,
    label: row.label,
    url: row.url,
    kind: row.kind,
    tracked_meta: row.tracked_meta ?? {},
    extract_map: row.extract_map ?? {},
    affects: row.affects ?? [],
    notes: row.notes,
    enabled: row.enabled,
    last_checked_at: row.last_checked_at,
    updated_at: row.updated_at,
});

export const checkOfficialSources = async (db) => {
    const sources = await db.all('SELECT * FROM official_sources WHERE enabled ORDER BY id');
    const created = [];
    const checked = [];

    for (const row of sources) {
        const def = GIB_SOURCE_DEFS.find(d => d.id === row.id) || {
            id: row.id, label: row.label, kind: row.kind, url: row.url,
            extractMap: row.extract_map || {}, affects: row.affects || [],
        };
        const resolved = await resolveSourceUrl(def);
        await db.run('UPDATE official_sources SET last_checked_at = NOW(), updated_at = NOW() WHERE id = ?', [row.id]);
        if (resolved.error) {
            checked.push({ id: row.id, ok: false, error: resolved.error });
            continue;
        }
        const meta = resolved.meta;
        const tracked = row.tracked_meta || {};
        const sameUrl = decodeURIComponent(tracked.url || '') === decodeURIComponent(meta.url || '');
        const sameLen = String(tracked.contentLength || '') === String(meta.contentLength || '');
        const sameLm = String(tracked.lastModified || '') === String(meta.lastModified || '');
        const unchanged = sameUrl && sameLen && (sameLm || (!tracked.lastModified && !meta.lastModified));

        if (unchanged) {
            checked.push({ id: row.id, ok: true, unchanged: true, meta });
            continue;
        }

        const summary = `${def.label}: uzak paket değişti (${meta.contentLength || '?'} bayt`
            + `${meta.lastModified ? `, ${meta.lastModified}` : ''}`
            + `${!sameUrl ? `; URL: ${meta.url}` : ''}).`;

        const existing = await db.get(
            `SELECT * FROM official_revisions WHERE source_id = ? AND status = 'pending'`,
            [row.id]
        );
        const rev = existing
            ? await db.get(
                `UPDATE official_revisions SET remote_url = ?, remote_meta = ?::jsonb, summary = ?, detected_at = NOW(), error = NULL
                 WHERE id = ? RETURNING *`,
                [meta.url, JSON.stringify(meta), summary, existing.id]
            )
            : await db.get(
                `INSERT INTO official_revisions (source_id, status, remote_url, remote_meta, summary)
                 VALUES (?, 'pending', ?, ?::jsonb, ?) RETURNING *`,
                [row.id, meta.url, JSON.stringify(meta), summary]
            );
        created.push(serializeRevision({ ...rev, source_label: row.label, affects: row.affects }));
        checked.push({ id: row.id, ok: true, pending: true, meta });
    }

    return { checked, created };
};

async function applyPackageBuffer(db, revision, buffer, meta, adminId) {
    const source = await db.get('SELECT * FROM official_sources WHERE id = ?', [revision.source_id]);
    if (!source) throw new Error('Kaynak bulunamadı.');
    const def = GIB_SOURCE_DEFS.find(d => d.id === source.id) || {
        id: source.id, label: source.label, kind: source.kind, url: source.url,
        extractMap: source.extract_map || {}, affects: source.affects || [],
    };

    const kind = detectArchiveKind(buffer, def.kind);
    const extracted = await extractArtifacts(buffer, { ...def, kind }, meta);
    if (!extracted.files.length) {
        throw new Error('Paketten eşlenen dosya çıkarılamadı. extractMap veya paket içeriğini kontrol edin.');
    }

    const diff = [];
    for (const f of extracted.files) {
        const prev = await db.get('SELECT content_sha256, path FROM official_artifacts WHERE path = ?', [f.path]);
        const changed = !prev || prev.content_sha256 !== f.sha256;
        diff.push({ path: f.path, from: f.from, bytes: f.bytes, sha256: f.sha256, changed, previous_sha256: prev?.content_sha256 || null });
        if (changed) {
            // RETURNING path: adapter aksi halde olmayan "id" sütununu ister.
            await db.run(
                `INSERT INTO official_artifacts (path, content, content_sha256, revision_id, source_id, updated_at)
                 VALUES (?, ?, ?, ?, ?, NOW())
                 ON CONFLICT (path) DO UPDATE SET
                    content = EXCLUDED.content,
                    content_sha256 = EXCLUDED.content_sha256,
                    revision_id = EXCLUDED.revision_id,
                    source_id = EXCLUDED.source_id,
                    updated_at = NOW()
                 RETURNING path`,
                [f.path, f.content, f.sha256, revision.id, source.id]
            );
        }
    }

    const changedCount = diff.filter(d => d.changed).length;
    const fullMeta = { ...meta, sha256: meta.sha256 || sha256(buffer) };
    await db.run(
        `UPDATE official_sources SET tracked_meta = ?::jsonb, url = ?, updated_at = NOW() WHERE id = ?`,
        [JSON.stringify(fullMeta), meta.url || revision.remote_url, source.id]
    );
    const row = await db.get(
        `UPDATE official_revisions SET
            status = 'applied',
            remote_meta = ?::jsonb,
            diff_summary = ?::jsonb,
            summary = ?,
            reviewed_at = COALESCE(reviewed_at, NOW()),
            reviewed_by = COALESCE(reviewed_by, ?),
            applied_at = NOW(),
            error = NULL
         WHERE id = ? RETURNING *`,
        [
            JSON.stringify(fullMeta),
            JSON.stringify({ files: diff, entryCount: extracted.entryCount }),
            `${source.label}: ${changedCount}/${diff.length} dosya güncellendi.`,
            adminId || null,
            revision.id,
        ]
    );
    return serializeRevision({ ...row, source_label: source.label, affects: source.affects });
}

export const approveRevision = async (db, revisionId, adminId) => {
    const revision = await db.get('SELECT * FROM official_revisions WHERE id = ?', [revisionId]);
    if (!revision) throw Object.assign(new Error('Revizyon bulunamadı.'), { status: 404 });
    if (revision.status !== 'pending' && revision.status !== 'failed') {
        throw Object.assign(new Error(`Bu revizyon onaylanamaz (durum: ${revision.status}).`), { status: 400 });
    }
    await db.run(
        `UPDATE official_revisions SET status = 'pending', reviewed_at = NOW(), reviewed_by = ?, error = NULL WHERE id = ?`,
        [adminId, revisionId]
    );
    try {
        const { buffer, meta } = await downloadBuffer(revision.remote_url);
        return await applyPackageBuffer(db, revision, buffer, meta, adminId);
    } catch (e) {
        await db.run(
            `UPDATE official_revisions SET status = 'failed', error = ?, reviewed_at = NOW(), reviewed_by = ? WHERE id = ?`,
            [e.message, adminId, revisionId]
        );
        throw Object.assign(new Error(`İndirme/uygulama başarısız: ${e.message}. Paketi elle yükleyebilirsiniz.`), { status: 502 });
    }
};

export const uploadAndApplyRevision = async (db, revisionId, adminId, buffer, filename) => {
    const revision = await db.get('SELECT * FROM official_revisions WHERE id = ?', [revisionId]);
    if (!revision) throw Object.assign(new Error('Revizyon bulunamadı.'), { status: 404 });
    if (!['pending', 'failed'].includes(revision.status)) {
        throw Object.assign(new Error(`Bu revizyona paket yüklenemez (durum: ${revision.status}).`), { status: 400 });
    }
    if (!Buffer.isBuffer(buffer) || !buffer.length) {
        throw Object.assign(new Error('Geçersiz paket verisi.'), { status: 400 });
    }
    if (buffer.length > MAX_PACKAGE_BYTES) {
        throw Object.assign(new Error('Paket 40 MB sınırını aşıyor.'), { status: 400 });
    }
    const meta = {
        url: revision.remote_url,
        contentLength: String(buffer.length),
        lastModified: null,
        etag: null,
        contentType: 'application/zip',
        sha256: sha256(buffer),
        uploadedAs: filename || 'upload.zip',
        uploaded: true,
    };
    return applyPackageBuffer(db, revision, buffer, meta, adminId);
};

export const rejectRevision = async (db, revisionId, adminId) => {
    const row = await db.get(
        `UPDATE official_revisions SET status = 'rejected', reviewed_at = NOW(), reviewed_by = ?, error = NULL
         WHERE id = ? AND status IN ('pending', 'failed') RETURNING *`,
        [adminId, revisionId]
    );
    if (!row) throw Object.assign(new Error('Reddedilecek bekleyen revizyon bulunamadı.'), { status: 404 });
    const source = await db.get('SELECT label, affects FROM official_sources WHERE id = ?', [row.source_id]);
    // Red sonrası tracked_meta'yı yeni uzak meta ile eşitle ki aynı uyarı tekrarlanmasın;
    // admin bilerek ertelediyse yeniden tetiklemek için kaynağı "şimdiki uzak" kabul ederiz.
    if (row.remote_meta) {
        await db.run(
            'UPDATE official_sources SET tracked_meta = ?::jsonb, url = COALESCE(?, url), updated_at = NOW() WHERE id = ?',
            [JSON.stringify(row.remote_meta), row.remote_url, row.source_id]
        );
    }
    return serializeRevision({ ...row, source_label: source?.label, affects: source?.affects });
};

export const registerGibRevisionRoutes = (app, { db, requireAdmin }) => {
    app.get('/api/admin/official-revisions/sources', requireAdmin, async (_req, res) => {
        const rows = await db.all('SELECT * FROM official_sources ORDER BY id');
        res.json(rows.map(serializeSource));
    });

    app.get('/api/admin/official-revisions', requireAdmin, async (req, res) => {
        const status = typeof req.query.status === 'string' ? req.query.status : null;
        const rows = status
            ? await db.all(
                `SELECT r.*, s.label AS source_label, s.affects
                   FROM official_revisions r JOIN official_sources s ON s.id = r.source_id
                  WHERE r.status = ? ORDER BY r.detected_at DESC LIMIT 100`,
                [status]
            )
            : await db.all(
                `SELECT r.*, s.label AS source_label, s.affects
                   FROM official_revisions r JOIN official_sources s ON s.id = r.source_id
                  ORDER BY r.detected_at DESC LIMIT 100`
            );
        res.json(rows.map(serializeRevision));
    });

    app.post('/api/admin/official-revisions/check', requireAdmin, async (_req, res) => {
        try {
            const result = await checkOfficialSources(db);
            res.json(result);
        } catch (e) {
            console.error('[gib-revisions] check error:', e);
            res.status(500).json({ error: e.message || 'Kontrol başarısız.' });
        }
    });

    app.post('/api/admin/official-revisions/:id/approve', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz id.' });
        try {
            res.json(await approveRevision(db, id, req.admin.id));
        } catch (e) {
            res.status(e.status || 500).json({ error: e.message });
        }
    });

    app.post('/api/admin/official-revisions/:id/reject', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz id.' });
        try {
            res.json(await rejectRevision(db, id, req.admin.id));
        } catch (e) {
            res.status(e.status || 500).json({ error: e.message });
        }
    });

    app.post('/api/admin/official-revisions/:id/upload', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz id.' });
        const data = typeof req.body?.data === 'string' ? req.body.data : '';
        const filename = typeof req.body?.filename === 'string' ? req.body.filename.slice(0, 200) : 'upload.zip';
        const b64 = data.includes(',') ? data.slice(data.indexOf(',') + 1) : data;
        let buffer;
        try {
            buffer = Buffer.from(b64, 'base64');
        } catch {
            return res.status(400).json({ error: 'Base64 paket okunamadı.' });
        }
        try {
            res.json(await uploadAndApplyRevision(db, id, req.admin.id, buffer, filename));
        } catch (e) {
            res.status(e.status || 500).json({ error: e.message });
        }
    });

    // Herkese açık: uygulanan revizyonlar (kullanıcı bildirimi)
    app.get('/api/official-revisions', async (_req, res) => {
        const rows = await db.all(
            `SELECT r.id, r.source_id, r.summary, r.diff_summary, r.applied_at, r.remote_url, r.remote_meta,
                    s.label AS source_label, s.affects
               FROM official_revisions r
               JOIN official_sources s ON s.id = r.source_id
              WHERE r.status = 'applied'
              ORDER BY r.applied_at DESC NULLS LAST
              LIMIT 30`
        );
        res.json(rows.map(r => ({
            id: r.id,
            source_id: r.source_id,
            source_label: r.source_label,
            summary: r.summary,
            affects: r.affects ?? [],
            applied_at: r.applied_at,
            remote_url: r.remote_url,
            files: (r.diff_summary?.files || []).filter(f => f.changed).map(f => ({
                path: f.path,
                bytes: f.bytes,
                download: `/api/official-artifacts/${encodeURIComponent(f.path)}`,
            })).filter(Boolean),
        })));
    });

    app.get('/api/official-artifacts', async (_req, res) => {
        const rows = await db.all(
            'SELECT path, content_sha256, revision_id, source_id, updated_at FROM official_artifacts ORDER BY path'
        );
        res.json(rows);
    });

    app.get('/api/official-artifacts/:encodedPath', async (req, res) => {
        let decoded = '';
        try {
            decoded = decodeURIComponent(String(req.params.encodedPath || '')).replace(/^\/+/, '');
        } catch {
            return res.status(400).json({ error: 'Geçersiz yol.' });
        }
        if (!decoded || decoded.includes('..') || decoded.length > 400) {
            return res.status(400).json({ error: 'Geçersiz yol.' });
        }
        const row = await db.get('SELECT path, content, content_sha256, updated_at FROM official_artifacts WHERE path = ?', [decoded]);
        if (!row) return res.status(404).json({ error: 'Artefact bulunamadı.' });
        const asDownload = req.query.download === '1' || req.query.download === 'true';
        if (asDownload) {
            const name = basename(row.path);
            res.setHeader('Content-Type', 'application/octet-stream; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
            return res.send(row.content);
        }
        res.json({ path: row.path, content: row.content, content_sha256: row.content_sha256, updated_at: row.updated_at });
    });
};

export const startGibRevisionChecker = (db) => {
    const run = () => checkOfficialSources(db)
        .then(r => {
            if (r.created.length) {
                console.log(`[gib-revisions] ${r.created.length} yeni bekleyen revizyon`);
            }
        })
        .catch(e => console.error('[gib-revisions] kontrol hatası:', e.message));
    // İlk kontrolü biraz geciktir (boot yükü)
    setTimeout(run, 20_000).unref?.();
    setInterval(run, CHECK_INTERVAL_MS).unref?.();
};
