/**
 * Türkiye e-Fatura / e-Arşiv / e-İrsaliye hazır şablon indeksi (public/ebelge/hazir).
 * Tam XSLT’yi DB’ye basmadan listeler; indirme/satın almada galeri satırına materialize edilir.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TR_SECTORS, sectorLabel } from './shopify-sectors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const HAZIR_DIR = path.join(ROOT, 'public', 'ebelge', 'hazir');
const GROUPS_DIR = path.join(ROOT, 'src', 'sector-templates', 'groups');
const PUBLIC = path.join(ROOT, 'public');

const TR_DOC_TYPES = new Set(['fatura', 'arsiv', 'irsaliye']);

const GIB_BASE = [
    {
        key: 'gib-efatura',
        name: 'Türkiye e-Fatura (GİB şablon)',
        description: 'GİB UBL-TR e-Fatura resmi görünüm şablonu.',
        module_id: 'fatura',
        doc_type_id: 'fatura',
        xsltRel: 'ebelge/gib/v2/e-Fatura-Sablon.xslt',
        xmlRel: 'ebelge/samples/e-Fatura-TEMEL.xml',
        accent: '#1e3a8a',
        sector: 'genel',
        tags: ['GİB', 'e-Fatura'],
    },
    {
        key: 'gib-earsiv',
        name: 'Türkiye e-Arşiv (GİB şablon)',
        description: 'GİB e-Arşiv fatura resmi görünüm şablonu.',
        module_id: 'arsiv',
        doc_type_id: 'arsiv',
        xsltRel: 'ebelge/gib/v2/e-Arsiv-Sablon.xslt',
        xmlRel: 'ebelge/samples/e-Fatura-TEMEL.xml',
        accent: '#0f766e',
        sector: 'genel',
        tags: ['GİB', 'e-Arşiv'],
    },
    {
        key: 'gib-irsaliye',
        name: 'Türkiye e-İrsaliye (GİB şablon)',
        description: 'e-İrsaliye / e-Waybill araçlı sevk belgesi şablonu.',
        module_id: 'irsaliye',
        doc_type_id: 'irsaliye',
        xsltRel: 'ebelge/community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt',
        xmlRel: 'ebelge/samples/e-Irsaliye-TEMEL.xml',
        accent: '#0369a1',
        sector: 'lojistik',
        tags: ['GİB', 'e-İrsaliye'],
    },
];

let cachedIndex = null;

function titleFromId(id) {
    return String(id)
        .replace(/^meslek-[a-z0-9]+-/i, '')
        .split(/[-_]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function inferDocType(id) {
    const low = String(id).toLowerCase();
    if (/irsaliye|sevk-irsaliye|waybill|despatch/.test(low)) return 'irsaliye';
    if (/(^|-)arsiv($|-)|adisyon|internet-satis|pazaryeri/.test(low)) return 'arsiv';
    if (/(^|-)(e)?fatura($|-)|tevkifat|ihracat-fatura|mikro($|-)/.test(low)) return 'fatura';
    if (/arsiv/.test(low)) return 'arsiv';
    if (/fatura|efatura/.test(low)) return 'fatura';
    return null;
}

/** Sector group TS dosyalarından id → meta. */
function loadSectorMeta() {
    const meta = new Map();
    if (!fs.existsSync(GROUPS_DIR)) return meta;
    for (const file of fs.readdirSync(GROUPS_DIR)) {
        if (!file.endsWith('.ts')) continue;
        const text = fs.readFileSync(path.join(GROUPS_DIR, file), 'utf8');

        // Object literal blocks
        const objRe = /\{\s*id:\s*'([^']+)'\s*,([\s\S]*?)\n\s*\}/g;
        let m;
        while ((m = objRe.exec(text))) {
            const id = m[1];
            const body = m[2];
            const doc = (body.match(/docTypeId:\s*'([^']+)'/) || [])[1];
            if (!TR_DOC_TYPES.has(doc)) continue;
            const name = (body.match(/name:\s*'([^']+)'/) || [])[1] || titleFromId(id);
            const description = (body.match(/description:\s*'([^']*)'/) || [])[1]
                || (body.match(/description:\s*\n\s*'([^']*)'/) || [])[1]
                || '';
            const accent = (body.match(/accent:\s*'(#[0-9a-fA-F]+)'/) || [])[1] || '#1e3a8a';
            const sector = (body.match(/sector:\s*'([^']+)'/) || [])[1] || '';
            meta.set(id, {
                name, description, doc_type_id: doc, module_id: doc, accent, sector, tags: [],
            });
        }

        // Helper calls: p|tpl(id, sector, doc, accent, name, description, ...)
        const pRe = /\b(?:p|tpl)\(\s*'([^']+)'\s*,\s*'([^']*)'\s*,\s*'([^']+)'\s*,\s*'(#[0-9a-fA-F]+)'\s*,\s*'([^']+)'\s*,\s*'((?:\\'|[^'])*)'/g;
        while ((m = pRe.exec(text))) {
            const [, id, sector, doc, accent, name, description] = m;
            if (!TR_DOC_TYPES.has(doc)) continue;
            meta.set(id, {
                name,
                description: description.replace(/\\'/g, "'"),
                doc_type_id: doc,
                module_id: doc,
                accent,
                sector,
                tags: [],
            });
        }

        // m(id, sector, meslek, docTypeId, moduleId, accent, name, description, ...)
        const mRe = /\bm\(\s*'([^']+)'\s*,\s*'([^']*)'\s*,\s*'[^']*'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'(#[0-9a-fA-F]+)'\s*,\s*'([^']+)'\s*,\s*'((?:\\'|[^'])*)'/g;
        while ((m = mRe.exec(text))) {
            const [, id, sector, doc, moduleId, accent, name, description] = m;
            if (!TR_DOC_TYPES.has(doc)) continue;
            meta.set(id, {
                name,
                description: description.replace(/\\'/g, "'"),
                doc_type_id: doc,
                module_id: moduleId || doc,
                accent,
                sector,
                tags: [],
            });
        }

        // b(id, sector, docTypeId, moduleId, accent, name, description, ...)
        const bRe = /\bb\(\s*'([^']+)'\s*,\s*'([^']*)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'(#[0-9a-fA-F]+)'\s*,\s*'([^']+)'\s*,\s*'((?:\\'|[^'])*)'/g;
        while ((m = bRe.exec(text))) {
            const [, id, sector, doc, moduleId, accent, name, description] = m;
            if (!TR_DOC_TYPES.has(doc)) continue;
            meta.set(id, {
                name,
                description: description.replace(/\\'/g, "'"),
                doc_type_id: doc,
                module_id: moduleId || doc,
                accent,
                sector,
                tags: [],
            });
        }
    }
    return meta;
}

function readPublic(rel) {
    if (!rel) return '';
    const full = path.join(PUBLIC, rel.replace(/^\//, ''));
    if (!fs.existsSync(full)) return '';
    return fs.readFileSync(full, 'utf8');
}

export function buildHazirTrIndex() {
    const meta = loadSectorMeta();
    const byKey = new Map();

    for (const g of GIB_BASE) {
        if (!fs.existsSync(path.join(PUBLIC, g.xsltRel))) continue;
        byKey.set(g.key, {
            id: `hazir:${g.key}`,
            key: g.key,
            name: g.name,
            description: g.description,
            doc_type_id: g.doc_type_id,
            module_id: g.module_id,
            sector: g.sector,
            category: 'ticaret',
            accent: g.accent,
            tags: g.tags,
            countries: ['TR'],
            xsltRel: g.xsltRel,
            xmlRel: g.xmlRel,
            source: 'gib',
        });
    }

    if (fs.existsSync(HAZIR_DIR)) {
        for (const file of fs.readdirSync(HAZIR_DIR)) {
            if (!file.endsWith('.xslt')) continue;
            const id = file.slice(0, -5);
            const xmlPath = path.join(HAZIR_DIR, `${id}.xml`);
            if (!fs.existsSync(xmlPath)) continue;
            const fromMeta = meta.get(id);
            const doc = fromMeta?.doc_type_id || inferDocType(id);
            if (!TR_DOC_TYPES.has(doc)) continue;
            byKey.set(id, {
                id: `hazir:${id}`,
                key: id,
                name: fromMeta?.name || titleFromId(id),
                description: fromMeta?.description
                    || `Hazır ${doc === 'arsiv' ? 'e-Arşiv' : doc === 'irsaliye' ? 'e-İrsaliye' : 'e-Fatura'} XSLT şablonu.`,
                doc_type_id: doc,
                module_id: fromMeta?.module_id || doc,
                sector: fromMeta?.sector || '',
                category: 'ticaret',
                accent: fromMeta?.accent || '#1e3a8a',
                tags: fromMeta?.tags || [],
                countries: ['TR'],
                xsltRel: `ebelge/hazir/${id}.xslt`,
                xmlRel: `ebelge/hazir/${id}.xml`,
                source: 'hazir',
            });
        }
    }

    const list = [...byKey.values()].sort((a, b) => {
        const order = { fatura: 0, arsiv: 1, irsaliye: 2 };
        const d = (order[a.doc_type_id] ?? 9) - (order[b.doc_type_id] ?? 9);
        if (d !== 0) return d;
        return a.name.localeCompare(b.name, 'tr');
    });
    return list;
}

export function getHazirTrIndex() {
    if (!cachedIndex) cachedIndex = buildHazirTrIndex();
    return cachedIndex;
}

export function findHazirEntry(idOrKey) {
    const raw = String(idOrKey || '');
    const key = raw.startsWith('hazir:') ? raw.slice(6) : raw;
    return getHazirTrIndex().find((t) => t.key === key || t.id === raw) || null;
}

export function loadHazirFiles(entry) {
    if (!entry) return null;
    const xslt = readPublic(entry.xsltRel);
    const xml = readPublic(entry.xmlRel);
    if (!xslt) return null;
    return { xslt, xml: xml || '', entry };
}

/**
 * Hazır dosyayı gallery_designs + shopify_listings’e yazar (satın alma / indirme için).
 */
export async function materializeHazirTemplate(db, entry, { priceCents = 1499 } = {}) {
    if (!entry) throw new Error('Şablon bulunamadı.');
    const tagKey = `shopify-ready:hazir:${entry.key}`;
    const existing = await db.get(
        `SELECT id FROM gallery_designs WHERE tags @> ?::jsonb LIMIT 1`,
        [JSON.stringify([tagKey])]
    );
    const files = loadHazirFiles(entry);
    if (!files?.xslt) throw new Error('XSLT dosyası okunamadı.');
    const tags = [tagKey, 'shopify-ready', 'hazir', `country:TR`, `doc:${entry.doc_type_id}`];
    let galleryId = existing?.id;
    if (galleryId) {
        await db.run(
            `UPDATE gallery_designs
                SET name = ?, description = ?, doc_type_id = ?, module_id = ?,
                    sector = ?, category = ?, accent = ?, tags = ?::jsonb,
                    xslt = ?, xml = ?, published = TRUE, updated_at = NOW()
              WHERE id = ?`,
            [
                entry.name, entry.description, entry.doc_type_id, entry.module_id,
                entry.sector || '', entry.category || '', entry.accent || '#1e3a8a',
                JSON.stringify(tags), files.xslt, files.xml, galleryId,
            ]
        );
    } else {
        const result = await db.run(
            `INSERT INTO gallery_designs
                (name, description, doc_type_id, module_id, sector, category, accent, tags, xslt, xml, published, source)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, TRUE, 'manual')
             RETURNING id`,
            [
                entry.name, entry.description, entry.doc_type_id, entry.module_id,
                entry.sector || '', entry.category || '', entry.accent || '#1e3a8a',
                JSON.stringify(tags), files.xslt, files.xml,
            ]
        );
        galleryId = result.lastID;
    }
    if (!galleryId) throw new Error('Galeri kaydı oluşturulamadı.');
    await db.run(
        `INSERT INTO shopify_listings (gallery_id, price_cents, countries, active, updated_at)
         VALUES (?, ?, ?, TRUE, NOW())
         ON CONFLICT (gallery_id) DO UPDATE SET
           active = TRUE,
           countries = EXCLUDED.countries,
           updated_at = NOW()
         RETURNING gallery_id`,
        [galleryId, priceCents, ['TR']]
    );
    return galleryId;
}

export function serializeHazirItem(entry, { website, priceCents = 1499 }) {
    const base = String(website || 'https://www.edxdocu.com').replace(/\/$/, '');
    return {
        id: entry.id,
        key: entry.key,
        name: entry.name,
        description: entry.description,
        doc_type_id: entry.doc_type_id,
        module_id: entry.module_id,
        sector: entry.sector,
        sector_label: sectorLabel(entry.sector),
        category: entry.category,
        accent: entry.accent,
        tags: entry.tags || [],
        source: entry.source || 'hazir',
        price_cents: priceCents,
        currency: 'USD',
        countries: ['TR'],
        design_url: `${base}/?shopify_embed=1&module=${encodeURIComponent(entry.module_id)}`,
        download_url: `/api/shopify/ui/templates/${encodeURIComponent(entry.id)}/download`,
        brand_url: `/api/shopify/ui/templates/${encodeURIComponent(entry.id)}/brand`,
        preview_url: `/api/shopify/ui/templates/${encodeURIComponent(entry.id)}/preview-source`,
        file_backed: true,
    };
}

/** Katalogda kullanılan sektörler (yalnız index’te görünenler). */
export function listHazirSectors() {
    const used = new Set(getHazirTrIndex().map((t) => t.sector).filter(Boolean));
    return TR_SECTORS.filter((s) => used.has(s.id));
}
