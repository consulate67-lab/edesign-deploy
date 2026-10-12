/**
 * SMTP ile e-posta gönderimi. Gerekli ortam değişkenleri:
 *   SMTP_HOST, SMTP_PORT (varsayılan 465), SMTP_USER, SMTP_PASS
 *   SMTP_SECURE (isteğe bağlı; boşsa port 465 ise true), MAIL_FROM (boşsa SMTP_USER)
 */
import nodemailer from 'nodemailer';

const env = (name) => (process.env[name] || '').trim();

export const mailConfigured = () => !!(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS'));

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

export const sendMail = async ({ to, subject, text, html }) => {
    if (!mailConfigured()) throw new Error('SMTP yapılandırılmamış.');
    const from = env('MAIL_FROM') || `edXdocu <${env('SMTP_USER')}>`;
    await getTransporter().sendMail({ from, to, subject, text, html });
};
