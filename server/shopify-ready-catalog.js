/**
 * Shopify vitrini için ülke bazlı hazır XSLT kataloğu.
 * public/ebelge altındaki şablonları gallery_designs + shopify_listings’e upsert eder.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');

const EU_EEA = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
    'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
    'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
];

const READY_TAG = 'shopify-ready';

/** @type {Array<{ key: string, name: string, description: string, module_id: string, doc_type_id: string, countries: string[], xsltRel: string, xmlRel?: string, sector?: string, category?: string, accent?: string }>} */
export const READY_TEMPLATES = [
    {
        key: 'tr-efatura',
        name: 'Türkiye e-Fatura',
        description: 'GİB UBL-TR e-Fatura hazır XSLT şablonu.',
        module_id: 'fatura',
        doc_type_id: 'fatura',
        countries: ['TR'],
        xsltRel: 'ebelge/gib/v2/e-Fatura-Sablon.xslt',
        sector: 'perakende',
        category: 'ticaret',
        accent: '#1e3a8a',
    },
    {
        key: 'tr-earsiv',
        name: 'Türkiye e-Arşiv Fatura',
        description: 'GİB e-Arşiv fatura görünümü için hazır XSLT.',
        module_id: 'arsiv',
        doc_type_id: 'arsiv',
        countries: ['TR'],
        xsltRel: 'ebelge/gib/v2/e-Arsiv-Sablon.xslt',
        sector: 'perakende',
        category: 'ticaret',
        accent: '#0f766e',
    },
    {
        key: 'eu-en16931',
        name: 'EN 16931 / Peppol Invoice',
        description: 'AB ve EEA ülkeleri için EN 16931 UBL fatura şablonu (XRechnung / Peppol BIS).',
        module_id: 'intl-invoice',
        doc_type_id: 'intl-invoice',
        countries: [...EU_EEA],
        xsltRel: 'ebelge/intl/en16931-invoice.xslt',
        xmlRel: 'ebelge/samples/intl/Peppol-BIS3-Fatura-BE.xml',
        sector: 'intl',
        category: 'intl',
        accent: '#2563eb',
    },
    {
        key: 'eu-despatch',
        name: 'Peppol Despatch Advice',
        description: 'Peppol sevk / irsaliye bildirimi XSLT şablonu.',
        module_id: 'intl-despatch',
        doc_type_id: 'intl-despatch',
        countries: [...EU_EEA],
        xsltRel: 'ebelge/intl/peppol-despatch-advice.xslt',
        xmlRel: 'ebelge/samples/intl/Peppol-Irsaliye-NL.xml',
        sector: 'intl',
        category: 'intl',
        accent: '#0284c7',
    },
    {
        key: 'us-invoice',
        name: 'USA DBNAlliance e-Invoice',
        description: 'ABD DBNAlliance UBL e-fatura şablonu.',
        module_id: 'intl-invoice',
        doc_type_id: 'intl-invoice',
        countries: ['US'],
        xsltRel: 'ebelge/intl/en16931-invoice.xslt',
        xmlRel: 'ebelge/samples/intl/US-invoice-en.xml',
        sector: 'intl',
        category: 'intl',
        accent: '#1d4ed8',
    },
    {
        key: 'br-nfe',
        name: 'Brasil NF-e (DANFE)',
        description: 'NF-e 4.00 DANFE hazır şablonu.',
        module_id: 'intl-br-nfe',
        doc_type_id: 'intl-br-nfe',
        countries: ['BR'],
        xsltRel: 'ebelge/intl/br-nfe-danfe.xslt',
        xmlRel: 'ebelge/samples/intl/BR-invoice-pt.xml',
        sector: 'intl',
        category: 'intl',
        accent: '#16a34a',
    },
    {
        key: 'br-nfce',
        name: 'Brasil NFC-e',
        description: 'NFC-e tüketici faturası şablonu.',
        module_id: 'intl-br-nfce',
        doc_type_id: 'intl-br-nfce',
        countries: ['BR'],
        xsltRel: 'ebelge/intl/br-nfce.xslt',
        xmlRel: 'ebelge/samples/intl/BR-consumer-pt.xml',
        sector: 'intl',
        category: 'intl',
        accent: '#22c55e',
    },
    {
        key: 'br-nfse',
        name: 'Brasil NFS-e (DANFSe)',
        description: 'NFS-e Padrão Nacional hizmet faturası.',
        module_id: 'intl-br-nfse',
        doc_type_id: 'intl-br-nfse',
        countries: ['BR'],
        xsltRel: 'ebelge/intl/br-nfse-danfse.xslt',
        xmlRel: 'ebelge/samples/intl/BR-service-pt.xml',
        sector: 'intl',
        category: 'intl',
        accent: '#15803d',
    },
    {
        key: 'br-cte',
        name: 'Brasil CT-e (DACTE)',
        description: 'CT-e taşıma belgesi DACTE şablonu.',
        module_id: 'intl-br-cte',
        doc_type_id: 'intl-br-cte',
        countries: ['BR'],
        xsltRel: 'ebelge/intl/br-cte-dacte.xslt',
        xmlRel: 'ebelge/samples/intl/BR-despatch-pt.xml',
        sector: 'intl',
        category: 'intl',
        accent: '#166534',
    },
    {
        key: 'ru-upd',
        name: 'Россия УПД 5.03',
        description: 'ФНС УПД 5.03 электронный документ.',
        module_id: 'intl-ru-upd',
        doc_type_id: 'intl-ru-upd',
        countries: ['RU'],
        xsltRel: 'ebelge/intl/ru-upd-503.xslt',
        xmlRel: 'ebelge/samples/intl/RU-invoice-ru.xml',
        sector: 'intl',
        category: 'intl',
        accent: '#b91c1c',
    },
    {
        key: 'in-gst',
        name: 'India GST e-Invoice',
        description: 'GST e-Invoice INV-01 hazır şablonu.',
        module_id: 'intl-in-einvoice',
        doc_type_id: 'intl-in-einvoice',
        countries: ['IN'],
        xsltRel: 'ebelge/intl/in-gst-einvoice.xslt',
        xmlRel: 'ebelge/samples/intl/IN-invoice-en.xml',
        sector: 'intl',
        category: 'intl',
        accent: '#ea580c',
    },
    {
        key: 'in-eway',
        name: 'India e-Way Bill',
        description: 'E-Way Bill EWB-01 sevk belgesi şablonu.',
        module_id: 'intl-in-ewaybill',
        doc_type_id: 'intl-in-ewaybill',
        countries: ['IN'],
        xsltRel: 'ebelge/intl/in-eway-bill.xslt',
        xmlRel: 'ebelge/samples/intl/IN-despatch-en.xml',
        sector: 'intl',
        category: 'intl',
        accent: '#c2410c',
    },
    {
        key: 'cn-digital',
        name: '中国 数电票',
        description: '全面数字化的电子发票 şablonu.',
        module_id: 'intl-cn-invoice',
        doc_type_id: 'intl-cn-invoice',
        countries: ['CN'],
        xsltRel: 'ebelge/intl/cn-fully-digital.xslt',
        xmlRel: 'ebelge/samples/intl/CN-invoice-zh.xml',
        sector: 'intl',
        category: 'intl',
        accent: '#dc2626',
    },
];

export const SHOPIFY_COUNTRY_OPTIONS = [
    { code: 'TR', label: 'Türkiye (TR)' },
    { code: 'DE', label: 'Almanya (DE)' },
    { code: 'FR', label: 'Fransa (FR)' },
    { code: 'NL', label: 'Hollanda (NL)' },
    { code: 'BE', label: 'Belçika (BE)' },
    { code: 'AT', label: 'Avusturya (AT)' },
    { code: 'IT', label: 'İtalya (IT)' },
    { code: 'ES', label: 'İspanya (ES)' },
    { code: 'PT', label: 'Portekiz (PT)' },
    { code: 'PL', label: 'Polonya (PL)' },
    { code: 'GB', label: 'Birleşik Krallık (GB)' },
    { code: 'CH', label: 'İsviçre (CH)' },
    { code: 'US', label: 'ABD (US)' },
    { code: 'BR', label: 'Brezilya (BR)' },
    { code: 'IN', label: 'Hindistan (IN)' },
    { code: 'CN', label: 'Çin (CN)' },
    { code: 'RU', label: 'Rusya (RU)' },
];

function readPublic(rel) {
    if (!rel) return '';
    const full = path.join(PUBLIC, rel.replace(/^\//, ''));
    if (!fs.existsSync(full)) return '';
    return fs.readFileSync(full, 'utf8');
}

function countriesForModule(moduleId) {
    const m = String(moduleId || '');
    if (m.startsWith('intl-br-')) return ['BR'];
    if (m === 'intl-ru-upd') return ['RU'];
    if (m.startsWith('intl-in-')) return ['IN'];
    if (m === 'intl-cn-invoice') return ['CN'];
    if (m === 'intl-invoice' || m === 'intl-despatch') return [...EU_EEA, 'US'];
    if (['fatura', 'arsiv', 'irsaliye', 'smm', 'mm', 'mustahsil', 'egider', 'epass', 'emustahsil'].includes(m)) {
        return ['TR'];
    }
    return ['TR'];
}

/**
 * Hazır şablonları DB’ye yazar; eksik listing’leri oluşturur.
 * Idempotent: tags içinde shopify-ready:<key> ile bulunur.
 */
export async function ensureReadyShopifyCatalog(db, { priceCents = 1499 } = {}) {
    let upserted = 0;
    for (const t of READY_TEMPLATES) {
        const xslt = readPublic(t.xsltRel);
        if (!xslt) {
            console.warn(`[shopify-ready] XSLT yok, atlandı: ${t.xsltRel}`);
            continue;
        }
        const xml = readPublic(t.xmlRel) || '';
        const tagKey = `${READY_TAG}:${t.key}`;
        const existing = await db.get(
            `SELECT id FROM gallery_designs
              WHERE tags @> ?::jsonb
              LIMIT 1`,
            [JSON.stringify([tagKey])]
        );
        let galleryId = existing?.id;
        const tags = [tagKey, READY_TAG, ...t.countries.map((c) => `country:${c}`)];
        if (galleryId) {
            await db.run(
                `UPDATE gallery_designs
                    SET name = ?, description = ?, doc_type_id = ?, module_id = ?,
                        sector = ?, category = ?, accent = ?, tags = ?::jsonb,
                        xslt = ?, xml = ?, published = TRUE, updated_at = NOW()
                  WHERE id = ?`,
                [
                    t.name, t.description, t.doc_type_id, t.module_id,
                    t.sector || '', t.category || '', t.accent || '#1e3a8a',
                    JSON.stringify(tags), xslt, xml, galleryId,
                ]
            );
        } else {
            const result = await db.run(
                `INSERT INTO gallery_designs
                    (name, description, doc_type_id, module_id, sector, category, accent, tags, xslt, xml, published, source)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, TRUE, 'manual')
                 RETURNING id`,
                [
                    t.name, t.description, t.doc_type_id, t.module_id,
                    t.sector || '', t.category || '', t.accent || '#1e3a8a',
                    JSON.stringify(tags), xslt, xml,
                ]
            );
            galleryId = result.lastID;
        }
        if (!galleryId) continue;
        await db.run(
            `INSERT INTO shopify_listings (gallery_id, price_cents, countries, active, updated_at)
             VALUES (?, ?, ?, TRUE, NOW())
             ON CONFLICT (gallery_id) DO UPDATE SET
               price_cents = COALESCE(shopify_listings.price_cents, EXCLUDED.price_cents),
               countries = EXCLUDED.countries,
               active = TRUE,
               updated_at = NOW()
             RETURNING gallery_id`,
            [galleryId, priceCents, t.countries]
        );
        upserted += 1;
    }

    // Yayında ama Shopify listing’i olmayan galeri tasarımlarını da vitrine ekle
    const orphan = await db.all(
        `SELECT g.id, g.module_id
           FROM gallery_designs g
      LEFT JOIN shopify_listings l ON l.gallery_id = g.id
          WHERE g.published = TRUE AND l.gallery_id IS NULL`
    );
    for (const row of orphan || []) {
        const countries = countriesForModule(row.module_id);
        await db.run(
            `INSERT INTO shopify_listings (gallery_id, price_cents, countries, active, updated_at)
             VALUES (?, ?, ?, TRUE, NOW())
             ON CONFLICT (gallery_id) DO NOTHING
             RETURNING gallery_id`,
            [row.id, priceCents, countries]
        );
        upserted += 1;
    }

    return { upserted, totalReady: READY_TEMPLATES.length };
}

export { countriesForModule, EU_EEA };
