/**
 * EDM — Yol A şablon yükleme adapter’ı.
 *
 * Gerçek EDM “görsel şablon / XSLT yükleme” uçları bağlanana kadar:
 * - calculateCredentials: alanları doğrular
 * - verifyCredentials / uploadTemplate: net “henüz bağlı değil” hatası döner
 *
 * Belge gönderimi (SendInvoice) bilerek burada yok — Yol B.
 */
import { moduleToDocKind } from './providers.js';

const notWired = () => {
    const err = new Error(
        'EDM şablon yükleme API’si henüz bağlanmadı. Test hesabı ve XSLT upload dokümanı gelince bu adapter tamamlanacak.'
    );
    err.code = 'PROVIDER_NOT_READY';
    err.status = 501;
    return err;
};

/**
 * @param {{ username?: string, password?: string, baseUrl?: string }} cred
 */
export const normalizeCredentials = (cred = {}) => {
    const username = String(cred.username || '').trim();
    const password = String(cred.password || '');
    const baseUrl = String(cred.baseUrl || '').trim().replace(/\/+$/, '');
    if (!username || username.length > 160) {
        const e = new Error('EDM kullanıcı adı gerekli (en fazla 160 karakter).');
        e.status = 400;
        throw e;
    }
    if (!password || password.length > 200) {
        const e = new Error('EDM parolası gerekli.');
        e.status = 400;
        throw e;
    }
    if (baseUrl) {
        try {
            const u = new URL(baseUrl);
            if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error('bad');
        } catch {
            const e = new Error('Servis adresi https://... biçiminde olmalı.');
            e.status = 400;
            throw e;
        }
    }
    return { username, password, baseUrl: baseUrl || null };
};

export const edmAdapter = {
    id: 'edm',
    normalizeCredentials,

    async verifyCredentials(_cred) {
        throw notWired();
    },

    /**
     * @param {object} input
     * @param {object} input.credentials
     * @param {string} input.xslt
     * @param {string} input.moduleId
     * @param {string} input.name
     * @param {string} [input.taxId]
     * @param {string} [input.fileName]
     */
    async uploadTemplate(input) {
        const kind = moduleToDocKind(input.moduleId);
        if (kind === 'OTHER') {
            const e = new Error(`Bu belge türü (${input.moduleId}) EDM şablon yüklemesinde henüz desteklenmiyor.`);
            e.status = 400;
            throw e;
        }
        // İleride: SOAP/REST çağrısı, remoteId + status dönülür.
        void input.credentials;
        void input.xslt;
        void input.name;
        void input.taxId;
        void input.fileName;
        throw notWired();
    },
};
