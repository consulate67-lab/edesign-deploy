/**
 * Yol A — tasarım (XSLT) teslimi. Belge gönderimi (Yol B) burada yok.
 * Her sağlayıcı aynı adapter sözleşmesini uygular; gerçek SOAP/REST sonra bağlanır.
 */

/** @typedef {'test' | 'live'} IntegratorEnv */

/**
 * @typedef {object} ProviderField
 * @property {string} key
 * @property {string} label
 * @property {'text' | 'password' | 'url'} type
 * @property {boolean} [secret]
 * @property {boolean} [required]
 */

/**
 * @typedef {object} ProviderDef
 * @property {string} id
 * @property {string} name
 * @property {string} summary
 * @property {boolean} ready  — uploadTemplate gerçek API'ye bağlı mı
 * @property {ProviderField[]} fields
 * @property {string[]} modules  — desteklenen module_id listesi (boş = hepsi, adapter reddeder)
 */

/** wizard module_id → entegratör belge türü etiketi */
export const moduleToDocKind = (moduleId) => {
    const id = String(moduleId || '').toLowerCase();
    if (id === 'fatura' || id === 'ihracat' || id === 'mikro_ihracat') return 'EFATURA';
    if (id === 'arsiv') return 'EARSIV';
    if (id === 'irsaliye') return 'EIRSALIYE';
    if (id === 'irsaliye-yanit') return 'EIRSALIYE_YANIT';
    if (id === 'smm') return 'ESMM';
    if (id === 'mustahsil') return 'EMUSTAHSIL';
    if (id === 'gider-pusulasi') return 'EGIDER';
    if (id === 'dekont') return 'EDEKONT';
    if (id === 'sigorta-komisyon') return 'ESIGORTA';
    if (id === 'bilet' || id === 'bilet-rapor' || id === 'bilet-yolcu') return 'EBILET';
    if (id === 'doviz' || id === 'doviz-satim') return 'EDOVIZ';
    return 'OTHER';
};

/** @type {ProviderDef[]} */
export const PROVIDERS = [
    {
        id: 'edm',
        name: 'EDM',
        summary: 'Pilot sağlayıcı. XSLT / görsel şablon yükleme API’si bağlanınca hazır olacak.',
        ready: false,
        modules: ['fatura', 'arsiv', 'irsaliye', 'smm', 'mustahsil', 'ihracat', 'mikro_ihracat'],
        fields: [
            { key: 'username', label: 'Kullanıcı adı / e-posta', type: 'text', required: true },
            { key: 'password', label: 'Parola', type: 'password', secret: true, required: true },
            { key: 'baseUrl', label: 'Servis adresi (boş = varsayılan)', type: 'url', required: false },
        ],
    },
    {
        id: 'uyumsoft',
        name: 'Uyumsoft',
        summary: 'Yer tutucu — adapter sözleşmesi hazır, API sonra bağlanır.',
        ready: false,
        modules: ['fatura', 'arsiv', 'irsaliye'],
        fields: [
            { key: 'username', label: 'Kullanıcı adı', type: 'text', required: true },
            { key: 'password', label: 'Parola', type: 'password', secret: true, required: true },
            { key: 'appKey', label: 'Uygulama anahtarı', type: 'password', secret: true, required: false },
        ],
    },
    {
        id: 'izibiz',
        name: 'İzibiz',
        summary: 'Yer tutucu — adapter sözleşmesi hazır, API sonra bağlanır.',
        ready: false,
        modules: ['fatura', 'arsiv', 'irsaliye'],
        fields: [
            { key: 'username', label: 'Kullanıcı adı', type: 'text', required: true },
            { key: 'password', label: 'Parola', type: 'password', secret: true, required: true },
        ],
    },
    {
        id: 'logo',
        name: 'Logo / Foriba',
        summary: 'Yer tutucu — adapter sözleşmesi hazır, API sonra bağlanır.',
        ready: false,
        modules: ['fatura', 'arsiv'],
        fields: [
            { key: 'username', label: 'Kullanıcı adı', type: 'text', required: true },
            { key: 'password', label: 'Parola', type: 'password', secret: true, required: true },
            { key: 'companyCode', label: 'Firma kodu', type: 'text', required: false },
        ],
    },
    {
        id: 'qnb',
        name: 'QNB eSolutions',
        summary: 'Yer tutucu — adapter sözleşmesi hazır, API sonra bağlanır.',
        ready: false,
        modules: ['fatura', 'arsiv'],
        fields: [
            { key: 'username', label: 'Kullanıcı adı', type: 'text', required: true },
            { key: 'password', label: 'Parola', type: 'password', secret: true, required: true },
        ],
    },
];

export const providerById = (id) => PROVIDERS.find((p) => p.id === id) || null;

export const publicProviders = () =>
    PROVIDERS.map(({ id, name, summary, ready, fields, modules }) => ({
        id,
        name,
        summary,
        ready,
        modules,
        fields: fields.map(({ key, label, type, required }) => ({ key, label, type, required: !!required })),
    }));
