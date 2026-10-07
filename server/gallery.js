import { cleanText, optionalText, parseId } from './util.js';

const CONTENT_MAX = 5 * 1024 * 1024;
const MAX_TAGS = 20;
const TAG_MAX = 40;
const SOURCES = ['ai', 'manual'];

export const serializeGallery = (row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    doc_type_id: row.doc_type_id,
    module_id: row.module_id,
    sector: row.sector,
    category: row.category,
    accent: row.accent,
    tags: row.tags ?? [],
    xslt: row.xslt,
    xml: row.xml,
    published: row.published,
    source: row.source,
    created_at: row.created_at,
    updated_at: row.updated_at,
});

/** GalleryDesignInput doğrulaması: { value } ya da { error }. */
const parseInput = (body) => {
    const value = {
        name: cleanText(body?.name, 200),
        description: optionalText(body?.description, 2000),
        doc_type_id: cleanText(body?.doc_type_id, 64),
        module_id: cleanText(body?.module_id, 64),
        sector: optionalText(body?.sector, 64),
        category: optionalText(body?.category, 64),
        accent: optionalText(body?.accent, 32),
        xslt: typeof body?.xslt === 'string' && body.xslt.trim() && body.xslt.length <= CONTENT_MAX ? body.xslt : null,
        xml: body?.xml === undefined ? '' : (typeof body.xml === 'string' && body.xml.length <= CONTENT_MAX ? body.xml : null),
        published: body?.published === undefined ? false : body.published,
        source: body?.source ?? 'manual',
    };
    const tags = body?.tags ?? [];
    if (!Array.isArray(tags) || tags.length > MAX_TAGS || tags.some((t) => !cleanText(t, TAG_MAX))) {
        return { error: `Etiketler en fazla ${MAX_TAGS} adet ve her biri 1-${TAG_MAX} karakter olmalı.` };
    }
    value.tags = tags.map((t) => t.trim());

    const invalid = Object.entries({
        name: 'Ad 1-200 karakter olmalı.',
        description: 'Açıklama en fazla 2000 karakter olabilir.',
        doc_type_id: 'Belge türü zorunludur.',
        module_id: 'Modül zorunludur.',
        sector: 'Sektör en fazla 64 karakter olabilir.',
        category: 'Kategori en fazla 64 karakter olabilir.',
        accent: 'Renk en fazla 32 karakter olabilir.',
        xslt: 'XSLT zorunludur ve 5 MB\'ı aşamaz.',
        xml: 'XML 5 MB\'ı aşamaz.',
    }).find(([key]) => value[key] === null);
    if (invalid) return { error: invalid[1] };
    if (typeof value.published !== 'boolean') return { error: 'published alanı true/false olmalı.' };
    if (!SOURCES.includes(value.source)) return { error: 'Kaynak ai ya da manual olmalı.' };
    return { value };
};

const COLUMNS = ['name', 'description', 'doc_type_id', 'module_id', 'sector', 'category', 'accent', 'tags', 'xslt', 'xml', 'published', 'source'];
const columnValues = (v) => COLUMNS.map((c) => (c === 'tags' ? JSON.stringify(v.tags) : v[c]));

export const registerGalleryRoutes = (app, { db, requireAdmin }) => {
    app.get('/api/gallery', async (_req, res) => {
        const rows = await db.all('SELECT * FROM gallery_designs WHERE published ORDER BY updated_at DESC');
        res.json(rows.map(serializeGallery));
    });

    app.get('/api/admin/gallery', requireAdmin, async (_req, res) => {
        const rows = await db.all('SELECT * FROM gallery_designs ORDER BY updated_at DESC');
        res.json(rows.map(serializeGallery));
    });

    app.post('/api/admin/gallery', requireAdmin, async (req, res) => {
        const { value, error } = parseInput(req.body);
        if (error) return res.status(400).json({ error });
        const row = await db.get(
            `INSERT INTO gallery_designs (${COLUMNS.join(', ')}, created_by)
             VALUES (${COLUMNS.map((c) => (c === 'tags' ? '?::jsonb' : '?')).join(', ')}, ?) RETURNING *`,
            [...columnValues(value), req.admin.id]
        );
        res.json(serializeGallery(row));
    });

    app.put('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz tasarım id.' });
        const { value, error } = parseInput(req.body);
        if (error) return res.status(400).json({ error });
        const row = await db.get(
            `UPDATE gallery_designs
                SET ${COLUMNS.map((c) => `${c} = ?${c === 'tags' ? '::jsonb' : ''}`).join(', ')}, updated_at = NOW()
              WHERE id = ? RETURNING *`,
            [...columnValues(value), id]
        );
        if (!row) return res.status(404).json({ error: 'Galeri tasarımı bulunamadı.' });
        res.json(serializeGallery(row));
    });

    app.delete('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const result = id ? await db.run('DELETE FROM gallery_designs WHERE id = ?', [id]) : null;
        if (!result?.changes) return res.status(404).json({ error: 'Galeri tasarımı bulunamadı.' });
        res.json({ success: true });
    });
};
