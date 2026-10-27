import { edmAdapter } from './edm.js';
import { providerById } from './providers.js';

/** @type {Record<string, { id: string, verifyCredentials: Function, uploadTemplate: Function }>} */
const ADAPTERS = {
    edm: edmAdapter,
};

export const getAdapter = (providerId) => {
    const def = providerById(providerId);
    if (!def) {
        const e = new Error('Bilinmeyen entegratör.');
        e.status = 400;
        throw e;
    }
    const adapter = ADAPTERS[providerId];
    if (!adapter) {
        const e = new Error(`${def.name} bağlantısı henüz yazılmadı.`);
        e.code = 'PROVIDER_NOT_READY';
        e.status = 501;
        throw e;
    }
    return { def, adapter };
};
