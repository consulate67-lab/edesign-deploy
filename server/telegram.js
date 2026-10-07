/**
 * Telegram Bot API: yönetici sohbetine bildirim ve getUpdates ile komut alma.
 * Ayarlar her çağrıda env'den okunur; TELEGRAM_BOT_TOKEN yoksa her şey no-op.
 */

const POLL_TIMEOUT_S = 25;
const MAX_BACKOFF_MS = 60_000;
// Telegram mesaj sınırı 4096 karakter; kullanıcı metni bunun altında tutulur.
const BODY_PREVIEW_MAX = 3000;

const config = () => ({
    token: (process.env.TELEGRAM_BOT_TOKEN || '').trim(),
    chatId: (process.env.TELEGRAM_ADMIN_CHAT_ID || '').trim(),
});

export const isConfigured = () => !!config().token;
export const isChatConfigured = () => !!(config().token && config().chatId);

export const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const preview = (text) => {
    const s = String(text ?? '');
    return escapeHtml(s.length > BODY_PREVIEW_MAX ? `${s.slice(0, BODY_PREVIEW_MAX)}…` : s);
};

const call = async (method, body, timeoutMs = 15_000) => {
    const res = await fetch(`https://api.telegram.org/bot${config().token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await res.json().catch(() => null);
    if (!data?.ok) throw new Error(`Telegram ${method} ${res.status}: ${data?.description ?? 'yanıt okunamadı'}`);
    return data.result;
};

const sendMessage = (chatId, text, extra = {}) => call('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...extra,
});

/** Yönetici sohbetine gönderir; hata fırlatır (OTP gibi teslimi şart olan mesajlar için). */
export const sendToAdmin = async (html, extra) => {
    if (!isChatConfigured()) throw new Error('Telegram yapılandırılmamış.');
    return sendMessage(config().chatId, html, extra);
};

/** Bildirim: yapılandırılmamışsa ya da gönderilemezse sessizce false döner. */
export const notify = async (html, extra) => {
    if (!isChatConfigured()) return false;
    try {
        await sendMessage(config().chatId, html, extra);
        return true;
    } catch (e) {
        console.warn('[telegram] bildirim gönderilemedi:', e.message);
        return false;
    }
};

// ---------------------------------------------------------------- mesaj biçimleri

/** Yanıtlanan bildirimdeki talep numarası (#T123) ya da null. */
export const parseTicketRef = (text) => {
    const match = /#T(\d{1,10})\b/.exec(String(text ?? ''));
    return match ? Number(match[1]) : null;
};

const userLines = (u) => [
    `👤 ${escapeHtml(u.full_name || '-')}${u.company_name ? ` · ${escapeHtml(u.company_name)}` : ''}`,
    `✉️ ${escapeHtml(u.username)}${u.phone_number ? `  📞 ${escapeHtml(u.phone_number)}` : ''}`,
];

/** `ticket` users kolonlarıyla birleştirilmiş destek talebi satırıdır. */
export const formatNewTicket = (ticket, message) => [
    `🆕 <b>Yeni destek talebi #T${ticket.id}</b>`,
    ...userLines(ticket),
    `<b>Konu:</b> ${escapeHtml(ticket.subject)}`,
    '',
    preview(message),
    ...(ticket.context?.view ? ['', `📍 Ekran: ${escapeHtml(ticket.context.view)}`] : []),
    '',
    '<i>Yanıtlamak için bu mesajı cevaplayın.</i>',
].join('\n');

export const formatTicketMessage = (ticket, message) => [
    `💬 <b>#T${ticket.id}</b> yeni mesaj — ${escapeHtml(ticket.full_name || ticket.username)}`,
    `<b>Konu:</b> ${escapeHtml(ticket.subject)}`,
    '',
    preview(message),
].join('\n');

/** `session` users kolonlarıyla birleştirilmiş remote_sessions satırıdır. */
export const formatRemoteRequest = (session) => [
    `🖥 <b>Online destek isteği #R${session.id}</b>`,
    ...userLines(session),
    ...(session.note ? ['', preview(session.note)] : []),
    '',
    '<i>Yönetim panelinden bağlanabilirsiniz.</i>',
].join('\n');

export const formatRemoteAnswer = (session, accepted) =>
    `${accepted ? '✅' : '🚫'} ${escapeHtml(session.full_name || session.username)} online destek davetini `
    + `${accepted ? 'kabul etti' : 'reddetti'} (#R${session.id}).`;

export const formatAdminLogin = (admin, ip) =>
    `🔐 Yönetici girişi yapıldı: <b>${escapeHtml(admin.full_name || admin.username)}</b>`
    + ` (${escapeHtml(admin.username)})${ip ? ` · IP ${escapeHtml(ip)}` : ''}`;

// ---------------------------------------------------------------- durum ve komutlar

let polling = false;
let botUsername = null;

export const getStatus = async () => {
    const { token, chatId } = config();
    if (token && !botUsername) {
        try {
            botUsername = (await call('getMe', {}, 5_000)).username ?? null;
        } catch (e) {
            console.warn('[telegram] getMe başarısız:', e.message);
        }
    }
    return { configured: !!token, chatConfigured: !!(token && chatId), polling, botUsername: token ? botUsername : null };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Yönetici sohbetinden gelen her metin mesajı `handler(message)`'a verilir; dönen
 * HTML metin (varsa) yanıt olarak gönderilir. Diğer sohbetler yok sayılır.
 */
export const handleUpdate = async (update, handler) => {
    const message = update.message;
    if (!message?.text) return;
    const chatId = String(message.chat.id);
    const adminChatId = config().chatId;
    if (!adminChatId) {
        await sendMessage(chatId, `Chat ID: <code>${escapeHtml(chatId)}</code> — bunu Railway'de TELEGRAM_ADMIN_CHAT_ID olarak tanımlayın`);
        return;
    }
    if (chatId !== adminChatId) return;
    const reply = await handler(message);
    if (reply) await sendMessage(chatId, reply, { reply_to_message_id: message.message_id });
};

export const startPolling = (handler) => {
    if (!isConfigured() || polling) return;
    polling = true;
    let offset = 0;
    let backoff = 1_000;

    const loop = async () => {
        while (polling) {
            try {
                const updates = await call(
                    'getUpdates',
                    { offset, timeout: POLL_TIMEOUT_S, allowed_updates: ['message'] },
                    (POLL_TIMEOUT_S + 10) * 1_000
                );
                backoff = 1_000;
                for (const update of updates) {
                    offset = update.update_id + 1;
                    await handleUpdate(update, handler).catch((e) => console.error('[telegram] mesaj işlenemedi:', e.message));
                }
            } catch (e) {
                console.warn(`[telegram] getUpdates hatası (${backoff / 1000}s sonra yeniden):`, e.message);
                await sleep(backoff);
                backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
            }
        }
    };
    loop().catch((e) => {
        polling = false;
        console.error('[telegram] dinleme durdu:', e);
    });
    console.log('[telegram] Bot komutları dinleniyor.');
};
