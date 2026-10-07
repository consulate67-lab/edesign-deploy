/** Pozitif tam sayı id (Postgres INTEGER aralığında) ya da null. */
export const parseId = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 && n <= 2_147_483_647 ? n : null;
};

/** Kırpılmış, boş olmayan ve `max` karakteri aşmayan metin ya da null. */
export const cleanText = (value, max) => {
    if (typeof value !== 'string') return null;
    const text = value.trim();
    return text && text.length <= max ? text : null;
};

/** Boş bırakılabilen metin alanı: geçerliyse kırpılmış metin (veya ''), değilse null. */
export const optionalText = (value, max) => {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string') return null;
    const text = value.trim();
    return text.length <= max ? text : null;
};

export const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

/** users tablosuyla birleştirilmiş satırdan (user_id + kullanıcı kolonları) TicketUser. */
export const toTicketUser = (row) => ({
    id: row.user_id,
    username: row.username,
    full_name: row.full_name ?? null,
    company_name: row.company_name ?? null,
    phone_number: row.phone_number ?? null,
});
