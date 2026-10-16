/** Ortak yollar ve SQLite şeması (e-fatura mükellef kampanyası). */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const DATA_DIR = path.join(root, 'data', 'mukellef');
export const DB_PATH = path.join(DATA_DIR, 'mukellef.sqlite');
export const RAW_DIR = path.join(DATA_DIR, 'raw');

export const ensureDirs = () => {
    mkdirSync(RAW_DIR, { recursive: true });
};

export const openDb = () => {
    ensureDirs();
    const db = new DatabaseSync(DB_PATH);
    db.exec(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS mukellefler (
            vkn           TEXT PRIMARY KEY,
            unvan         TEXT NOT NULL DEFAULT '',
            alias         TEXT,
            first_creation TEXT,
            unit          TEXT,
            kind          TEXT NOT NULL DEFAULT 'pk',
            email         TEXT,
            email_source  TEXT,
            email_status  TEXT NOT NULL DEFAULT 'pending',
            website       TEXT,
            enriched_at   TEXT,
            notes         TEXT,
            updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS mukellefler_status ON mukellefler (email_status);
        CREATE INDEX IF NOT EXISTS mukellefler_email ON mukellefler (email) WHERE email IS NOT NULL;
    `);
    return db;
};

/** Yalnız 10 haneli VKN (tüzel kişi); 11 haneli TCKN elenir. */
export const isCorporateVkn = (id) => /^\d{10}$/.test(String(id || '').trim());

export const PERSONAL_DOMAINS = new Set([
    'gmail.com', 'googlemail.com', 'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
    'yahoo.com', 'yahoo.com.tr', 'yandex.com', 'yandex.ru', 'icloud.com', 'me.com',
    'protonmail.com', 'proton.me', 'mail.com', 'gmx.com', 'gmx.de', 'aol.com',
]);

/** Görüntü/asset “uzantıları” e-posta TLD sanılmasın (örn. d@2x.png). */
const FAKE_TLDS = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'avif',
    'css', 'js', 'mjs', 'map', 'woff', 'woff2', 'ttf', 'eot', 'otf',
    'mp3', 'mp4', 'webm', 'pdf', 'zip', 'rar', '7z', 'exe', 'dll',
]);

export const normalizeEmail = (raw) => {
    const email = String(raw || '').trim().toLowerCase().replace(/^mailto:/i, '');
    if (!/^[a-z0-9][a-z0-9._%+-]*@[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(email) || email.length > 254) return null;
    const [local, domain] = email.split('@');
    if (!local || !domain || PERSONAL_DOMAINS.has(domain)) return null;
    const tld = domain.split('.').pop() || '';
    if (FAKE_TLDS.has(tld)) return null;
    if (/\.kep\.tr$/i.test(domain) || /\.gov\.tr$/i.test(domain) || /\.edu\.tr$/i.test(domain)) return null;
    if (local.length < 3 || /^(?:2x|3x|img|image|logo|icon|sprite|banner|nfo|nf)$/i.test(local)) return null;
    if (/\d+x\d+/i.test(domain) || /^[\d.]+$/.test(domain.replace(/\./g, ''))) return null;
    return email;
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
