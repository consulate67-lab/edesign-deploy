import { foldCountry } from './countries';

const EMAIL_RE = /[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

/** Bireysel (tüketici) posta sağlayıcıları: onaysız ticari ileti yalnız tacir/esnafa gönderilebildiği için varsayılan olarak ayıklanır. */
const PERSONAL_DOMAINS = new Set([
    'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.com.tr', 'outlook.com', 'outlook.com.tr', 'live.com', 'live.com.tr',
    'msn.com', 'windowslive.com', 'yahoo.com', 'yahoo.com.tr', 'ymail.com', 'icloud.com', 'me.com', 'mac.com', 'yandex.com',
    'yandex.com.tr', 'yandex.ru', 'mynet.com', 'aol.com', 'gmx.com', 'gmx.de', 'gmx.net', 'mail.ru', 'mail.com', 'proton.me',
    'protonmail.com', 'superonline.com', 'ttmail.com', 'turk.net', 'e-kolay.net', 'windowslive.com.tr',
]);
export const isPersonal = (email: string) => PERSONAL_DOMAINS.has(email.slice(email.lastIndexOf('@') + 1));

export interface Recipient { email: string; name: string; country: string }

export interface ParsedList {
    recipients: Recipient[];
    duplicates: number;
    invalid: string[];
    /** Listede ülke sütunu var mı (Excel/CSV başlıklı tablo). */
    hasCountry: boolean;
}

/** Tırnaklı alanları ve alan içi satır sonlarını destekleyen ayraçlı metin okuyucu. */
const parseDelimited = (text: string, delim: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quoted) {
            if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
            else if (ch === '"') quoted = false;
            else cell += ch;
        } else if (ch === '"' && cell === '') quoted = true;
        else if (ch === delim) { row.push(cell); cell = ''; }
        else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(cell); rows.push(row); row = []; cell = '';
        } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
};

const findCol = (header: string[], test: (h: string) => boolean) => header.findIndex(h => test(foldCountry(h)));
const isEmailHeader = (h: string) => /(posta|mail|courriel|correo|почт)/.test(h);
const isCountryHeader = (h: string) => /^(ulke|country|land|pays|pais|страна)( adi| name)?$/.test(h);
const isNameHeader = (h: string) => /^(yetkili|yetkili kisi|ad soyad|ad soyad kurum|adi soyadi|isim|ad|name|full name|contact|contact person|kisi|nom|nombre)$/.test(h);
const isCompanyHeader = (h: string) => /^(firma|firma adi|sirket|unvan|kurum|kurum buro|company|company name|organization|organisation|entreprise|empresa)$/.test(h);

const cleanName = (s: string) => s.replace(/[<>"'`;,|\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);

/**
 * Başlık satırında e-posta sütunu olan liste (Excel'den yapıştırma, CSV) sütunlarıyla okunur;
 * değilse her satır: "adres", "Ad Soyad <adres>", "adres;Ad Soyad" ya da virgülle ayrılmış adresler.
 */
export const parseRecipients = (raw: string): ParsedList => {
    const seen = new Set<string>();
    const recipients: Recipient[] = [];
    const invalid: string[] = [];
    let duplicates = 0;
    const add = (found: string[], name: string, country: string) => {
        for (const m of found) {
            const email = m.toLowerCase();
            if (seen.has(email)) { duplicates++; continue; }
            seen.add(email);
            recipients.push({ email, name: found.length === 1 ? name : '', country });
        }
    };

    const lines = raw.split(/\r?\n/);
    const firstLine = lines.find(l => l.trim()) ?? '';
    const delim = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';
    let header: string[] = [];
    let bodyStart = 0;
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
        const line = lines[i];
        if (!line.trim() || line.includes('@')) continue;
        const cells = parseDelimited(line, delim)[0] ?? [];
        if (findCol(cells, isEmailHeader) >= 0) { header = cells; bodyStart = i + 1; break; }
    }
    const emailCol = findCol(header, isEmailHeader);

    if (emailCol >= 0) {
        const countryCol = findCol(header, isCountryHeader);
        const nameCol = findCol(header, isNameHeader);
        const companyCol = findCol(header, isCompanyHeader);
        const rows = parseDelimited(lines.slice(bodyStart).join('\n'), delim);
        for (const row of rows) {
            if (!row.some(c => c.trim())) continue;
            const found = (row[emailCol] ?? '').match(EMAIL_RE) ?? [];
            const label = (companyCol >= 0 && row[companyCol]) || row.find(c => c.trim()) || '';
            if (found.length === 0) { invalid.push(label.trim().slice(0, 80)); continue; }
            const name = cleanName((nameCol >= 0 && row[nameCol]) || (companyCol >= 0 && row[companyCol]) || '');
            add(found, name, countryCol >= 0 ? (row[countryCol] ?? '').trim() : '');
        }
        return { recipients, duplicates, invalid, hasCountry: findCol(header, isCountryHeader) >= 0 };
    }

    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const found = trimmed.match(EMAIL_RE) ?? [];
        if (found.length === 0) {
            if (!/e-?posta|e-?mail|mail/i.test(trimmed)) invalid.push(trimmed.slice(0, 80));
            continue;
        }
        add(found, found.length === 1 ? cleanName(trimmed.replace(found[0], ' ')) : '', '');
    }
    return { recipients, duplicates, invalid, hasCountry: false };
};

/** Excel satırlarını panelde düzenlenebilir sekmeyle ayrılmış metne çevirir. */
export const rowsToTsv = (rows: string[][]) => rows.map(r => r.map(c => c.replace(/[\t\r\n]+/g, ' ')).join('\t')).join('\n');
