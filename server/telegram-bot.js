import { presenceList } from './realtime.js';
import { escapeHtml, parseTicketRef } from './telegram.js';
import { addMessage, BODY_MAX, getTicket, listTickets, setTicketStatus } from './tickets.js';

const HELP = [
    '<b>e-Design destek botu</b>',
    'Talep bildirimini <i>cevaplayarak</i> kullanıcıya yanıt verebilirsiniz.',
    '',
    '/talepler — açık talepler',
    '/cevap 123 metin — #T123 talebine yanıt',
    '/kapat 123 — #T123 talebini kapat',
    '/online — çevrimiçi kullanıcılar',
].join('\n');

const STATUS_LABEL = { open: 'açık', answered: 'yanıtlandı', closed: 'kapalı' };

/** Yönetici sohbetinden gelen mesajı işleyip HTML yanıt döndüren fonksiyon üretir. */
export const createBotHandler = (db) => {
    const replyToTicket = async (ticketId, body) => {
        const text = body.trim();
        if (!text) return 'Yanıt metni boş olamaz.';
        if (text.length > BODY_MAX) return `Yanıt en fazla ${BODY_MAX} karakter olabilir.`;
        const ticket = await getTicket(db, ticketId);
        if (!ticket) return `#T${ticketId} bulunamadı.`;
        await addMessage(db, ticket, { sender: 'admin', body: text, via: 'telegram' });
        return `✅ #T${ticketId} yanıtlandı.`;
    };

    const commands = {
        start: () => HELP,
        help: () => HELP,
        talepler: async () => {
            const tickets = (await listTickets(db, { limit: 100 })).filter((t) => t.status !== 'closed').slice(0, 20);
            if (tickets.length === 0) return 'Açık talep yok.';
            return tickets.map((t) => `#T${t.id} · ${escapeHtml(t.subject)} — ${escapeHtml(t.full_name || t.username)}`
                + ` (${STATUS_LABEL[t.status]}${t.unread_for_admin ? `, ${t.unread_for_admin} okunmamış` : ''})`).join('\n');
        },
        cevap: (args) => {
            const match = /^#?T?(\d+)\s+([\s\S]+)$/i.exec(args);
            return match ? replyToTicket(Number(match[1]), match[2]) : 'Kullanım: /cevap 123 yanıt metni';
        },
        kapat: async (args) => {
            const id = Number(/^#?T?(\d+)$/i.exec(args.trim())?.[1]);
            if (!id) return 'Kullanım: /kapat 123';
            const ticket = await getTicket(db, id);
            if (!ticket) return `#T${id} bulunamadı.`;
            await setTicketStatus(db, ticket, 'closed');
            return `🔒 #T${id} kapatıldı.`;
        },
        online: () => {
            const users = presenceList();
            if (users.length === 0) return 'Çevrimiçi kullanıcı yok.';
            return users.map((u) => `🟢 ${escapeHtml(u.full_name || u.username)}`
                + `${u.company_name ? ` · ${escapeHtml(u.company_name)}` : ''}${u.view ? ` — ${escapeHtml(u.view)}` : ''}`).join('\n');
        },
    };

    return async (message) => {
        const text = message.text.trim();
        const command = /^\/([a-z]+)(?:@\w+)?\s*([\s\S]*)$/i.exec(text);
        if (command) {
            const run = commands[command[1].toLowerCase()];
            return run ? run(command[2]) : HELP;
        }
        const replied = message.reply_to_message;
        if (replied) {
            const ticketId = parseTicketRef(replied.text ?? replied.caption);
            return ticketId ? replyToTicket(ticketId, text) : 'Cevapladığınız mesajda talep numarası (#T…) bulunamadı.';
        }
        return HELP;
    };
};
