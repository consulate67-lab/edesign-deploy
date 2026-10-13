/**
 * E-posta gönderimi. İki yol desteklenir:
 *
 * 1) Köprü (öncelikli): MAIL_RELAY_URL, MAIL_RELAY_SECRET
 *    Railway'in Pro dışı planları giden SMTP'yi engellediğinden ileti, web
 *    hostingdeki public/mail-relay.php dosyasına HMAC imzalı olarak gönderilir;
 *    o dosya alan adının kendi SMTP sunucusunu kullanır.
 * 2) Doğrudan SMTP: SMTP_HOST, SMTP_PORT (varsayılan 465), SMTP_USER, SMTP_PASS
 *    SMTP_SECURE (isteğe bağlı; boşsa port 465 ise true), MAIL_FROM (boşsa SMTP_USER)
 */
import { createHmac } from 'node:crypto';
import nodemailer from 'nodemailer';

const env = (name) => (process.env[name] || '').trim();

const relayConfigured = () => !!(env('MAIL_RELAY_URL') && env('MAIL_RELAY_SECRET'));
const smtpConfigured = () => !!(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS'));
export const mailConfigured = () => relayConfigured() || smtpConfigured();

let transporter = null;
const getTransporter = () => {
    if (transporter) return transporter;
    const port = Number(env('SMTP_PORT')) || 465;
    const secure = env('SMTP_SECURE') ? env('SMTP_SECURE').toLowerCase() === 'true' : port === 465;
    transporter = nodemailer.createTransport({
        host: env('SMTP_HOST'),
        port,
        secure,
        auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 20_000,
    });
    return transporter;
};

const sendViaRelay = async ({ to, subject, text, html, headers }) => {
    const body = JSON.stringify({ to, subject, text, html, ...(headers && { headers }) });
    const ts = String(Math.floor(Date.now() / 1000));
    const signature = createHmac('sha256', env('MAIL_RELAY_SECRET')).update(`${ts}.${body}`).digest('hex');
    const res = await fetch(env('MAIL_RELAY_URL'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Relay-Timestamp': ts, 'X-Relay-Signature': signature },
        body,
        signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`mail relay ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
};

/** `headers` yalnız List-Unsubscribe / List-Unsubscribe-Post için kullanılır (köprü başkasını kabul etmez). */
export const sendMail = async ({ to, subject, text, html, headers }) => {
    if (relayConfigured()) return sendViaRelay({ to, subject, text, html, headers });
    if (!smtpConfigured()) throw new Error('SMTP yapılandırılmamış.');
    const from = env('MAIL_FROM') || `edXdocu <${env('SMTP_USER')}>`;
    await getTransporter().sendMail({ from, to, subject, text, html, headers });
};

/**
 * Toplu tanıtım e-postası yalnız Brevo üzerinden gider: BREVO_API_KEY, CAMPAIGN_MAIL_FROM
 * (Brevo'da doğrulanmış adres), CAMPAIGN_MAIL_FROM_NAME (isteğe bağlı).
 * Hosting SMTP'si tanıtım e-postasını yasaklıyor ve saatte 100 / günde 700 sınırını aşınca
 * hesabı askıya alıyor; askı onay kodlarını da durdurduğu için kampanyalar oraya düşmemeli.
 */
export const campaignMailConfigured = () => !!(env('BREVO_API_KEY') && env('CAMPAIGN_MAIL_FROM'));

export const sendCampaignMail = async ({ to, subject, text, html, headers }) => {
    if (!campaignMailConfigured()) throw new Error('Toplu gönderim servisi yapılandırılmamış.');
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': env('BREVO_API_KEY'), 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            sender: { email: env('CAMPAIGN_MAIL_FROM'), name: env('CAMPAIGN_MAIL_FROM_NAME') || 'edXdocu' },
            to: [{ email: to }],
            subject,
            htmlContent: html,
            ...(text && { textContent: text }),
            ...(headers && { headers }),
        }),
        signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`brevo ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
};
