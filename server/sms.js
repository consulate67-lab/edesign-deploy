/**
 * SMS gönderimi. Sağlayıcı SMS_PROVIDER ile seçilir; yeni sağlayıcı eklemek için
 * `providers` nesnesine { configured(), send(phone, text) } eklemek yeterli.
 */

const env = (name) => (process.env[name] || '').trim();

/** Türkiye GSM numarasını 5XXXXXXXXX biçimine indirger (diğerleri yalnızca rakam). */
export const toLocalGsm = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('90')) return digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
    return digits;
};

/** "+90 5** *** 12 34" */
export const maskPhone = (phone) => {
    const local = toLocalGsm(phone);
    if (local.length !== 10) return local.length > 4 ? `*** ${local.slice(-4)}` : '***';
    return `+90 ${local[0]}** *** ${local.slice(6, 8)} ${local.slice(8)}`;
};

const providers = {
    // https://www.netgsm.com.tr/dokuman/#http-post-sms-g%C3%B6nderme (REST v2)
    netgsm: {
        configured: () => !!(env('NETGSM_USERCODE') && env('NETGSM_PASSWORD') && env('NETGSM_MSGHEADER')),
        send: async (phone, text) => {
            const auth = Buffer.from(`${env('NETGSM_USERCODE')}:${env('NETGSM_PASSWORD')}`).toString('base64');
            const res = await fetch('https://api.netgsm.com.tr/sms/rest/v2/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
                body: JSON.stringify({
                    msgheader: env('NETGSM_MSGHEADER'),
                    messages: [{ msg: text, no: toLocalGsm(phone) }],
                    encoding: 'TR',
                }),
                signal: AbortSignal.timeout(10_000),
            });
            const raw = await res.text();
            let data = null;
            try { data = JSON.parse(raw); } catch { /* düz metin hata gövdesi */ }
            if (!res.ok || data?.code !== '00') {
                throw new Error(`Netgsm ${res.status}: ${data?.code ?? ''} ${data?.description ?? raw.slice(0, 200)}`.trim());
            }
        },
    },
};

const providerName = () => env('SMS_PROVIDER').toLowerCase() || null;

export const smsStatus = () => {
    const name = providerName();
    return { provider: name, configured: !!providers[name]?.configured() };
};

export const sendSms = async (phone, text) => {
    const provider = providers[providerName()];
    if (!provider?.configured()) throw new Error('SMS sağlayıcısı yapılandırılmamış.');
    await provider.send(phone, text);
};
