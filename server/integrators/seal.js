/**
 * Entegratör hesap parolaları / API anahtarları için AES-256-GCM.
 * webmail sealer ile aynı biçim; anahtar ayrı türetilir.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

export const createSealer = (secret) => {
    const material = `edx-integrator:${process.env.INTEGRATOR_SECRETS_KEY || secret || ''}`;
    const key = createHash('sha256').update(material).digest();
    return {
        seal: (text) => {
            const iv = randomBytes(12);
            const c = createCipheriv('aes-256-gcm', key, iv);
            const enc = Buffer.concat([c.update(String(text), 'utf8'), c.final()]);
            return [iv, c.getAuthTag(), enc].map((b) => b.toString('base64')).join('.');
        },
        open: (sealed) => {
            const [iv, tag, enc] = String(sealed).split('.').map((s) => Buffer.from(s, 'base64'));
            const d = createDecipheriv('aes-256-gcm', key, iv);
            d.setAuthTag(tag);
            return Buffer.concat([d.update(enc), d.final()]).toString('utf8');
        },
    };
};
