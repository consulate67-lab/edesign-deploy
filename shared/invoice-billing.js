/**
 * Paket satış faturasının müşteri bilgisi ve EDM kesim taslağı.
 * Fiyatlar KDV dahildir (asistan metniyle aynı). Hizmet KDV oranı %20.
 * Taslak EDM SendInvoice alanlarına göre hazırlanır; gönderim bu kayıttan yapılır.
 */
import { isValidTaxId, normalizeTaxId } from './license-lock.js';

export const VAT_RATE = 20;
const PAYMENT_AGENT = 'PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.';

const clip = (value, max) => {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ').slice(0, max);
};

const tl = (kurus) => Math.round(kurus) / 100;

/** KDV dahil tutarı matrah ve KDV'ye böler (kuruş). */
export const splitInclusiveVat = (gross, rate = VAT_RATE) => {
    const grossKurus = Math.round(Number(gross) * 100);
    const netKurus = Math.round((grossKurus * 100) / (100 + rate));
    return {
        gross: tl(grossKurus),
        net: tl(netKurus),
        vat: tl(grossKurus - netKurus),
        rate,
    };
};

export const istanbulDate = (date = new Date()) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

/** 'auto' alıcı türüne göre seçer; kesimde EDM CheckUser ile doğrulanır. */
export const DOCUMENT_MODES = ['auto', 'EFATURA', 'EARSIV'];
export const INVOICE_NOTE_MAX = 500;

/** GİB fatura numarası: 3 karakter seri + 4 hane yıl + 9 hane sıra (ör. EDX2026000000001). */
export const INVOICE_NUMBER_RE = /^[A-Z0-9]{3}\d{13}$/;

/** YYYY-MM-DD biçiminde gerçek bir tarih mi. */
export const isIsoDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const d = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

/**
 * @returns {{ error: string } | { billing: object }}
 */
export function parseBilling(input) {
    const src = input && typeof input === 'object' ? input : {};
    const partyType = src.partyType === 'sole' ? 'sole' : src.partyType === 'company' ? 'company' : null;
    if (!partyType) return { error: 'Firma türünü seçin: tüzel kişi ya da şahıs firması.' };

    const title = clip(src.title, 160);
    if (title.length < 2) return { error: 'Firma ünvanını girin.' };

    const taxId = normalizeTaxId(src.taxId);
    const sole = partyType === 'sole';
    if (taxId.length !== (sole ? 11 : 10) || !isValidTaxId(taxId)) {
        return {
            error: sole
                ? 'Şahıs firması için 11 haneli geçerli bir T.C. kimlik numarası girin.'
                : 'Tüzel kişi için 10 haneli geçerli bir vergi numarası girin.',
        };
    }

    const taxOffice = clip(src.taxOffice, 80);
    if (taxOffice.length < 2) return { error: 'Vergi dairesini girin.' };
    const city = clip(src.city, 40);
    if (city.length < 2) return { error: 'İl bilgisini girin.' };
    const address = clip(src.address, 240);

    return {
        billing: {
            partyType,
            title,
            taxId,
            scheme: sole ? 'TCKN' : 'VKN',
            taxOffice,
            city,
            address: address || city,
        },
    };
}

/**
 * Başarılı ödeme için EDM'ye verilecek fatura taslağı.
 * Alıcının e-Fatura mükellefi olup olmadığı kesim anında EDM CheckUser ile doğrulanır.
 */
export function buildInvoiceDraft({ plan, billing, user, merchantOid, issueDate, website, currency = 'TRY', documentMode = 'auto', note = '' }) {
    const totals = splitInclusiveVat(plan.price);
    const sole = billing.partyType === 'sole';
    const mode = DOCUMENT_MODES.includes(documentMode) ? documentMode : 'auto';
    const preferred = mode === 'auto' ? (sole ? 'EARSIV' : 'EFATURA') : mode;
    const profileId = preferred === 'EARSIV' ? 'EARSIVFATURA' : 'TEMELFATURA';
    const checkUser = preferred === 'EFATURA';
    const lineName = `e-Belge Tasarımcı ${plan.name} paketi`;
    const lineDescription = `${plan.credits} tasarım hakkı (tek seferlik, süresiz)`;
    const noteText = clip(note, INVOICE_NOTE_MAX);

    return {
        integrator: 'edm',
        preparedAt: new Date().toISOString(),
        issueDate,
        currency,
        notes: noteText ? [noteText] : [],
        document: {
            mode,
            preferred,
            profileId,
            invoiceTypeCode: 'SATIS',
            fallback: checkUser ? 'EARSIV' : null,
            checkUserBeforeSend: checkUser,
        },
        customer: {
            ...billing,
            email: user?.username || null,
            phone: user?.phone_number || null,
        },
        supplier: {
            source: 'edm-account',
            note: 'Gönderici unvan, VKN ve gönderici birim etiketi EDM hesabından alınır.',
        },
        lines: [{
            id: 1,
            name: lineName,
            description: lineDescription,
            quantity: 1,
            unitCode: 'C62',
            unitPrice: totals.net,
            vatRate: totals.rate,
            vatAmount: totals.vat,
            lineExtension: totals.net,
        }],
        totals: {
            taxExclusive: totals.net,
            vat: totals.vat,
            taxInclusive: totals.gross,
            payable: totals.gross,
            vatRate: totals.rate,
            pricesIncludeVat: true,
        },
        payment: {
            meansCode: '48',
            channel: 'KREDIKARTI/BANKAKARTI',
            agent: PAYMENT_AGENT,
            merchantOid: merchantOid || null,
            internetSale: true,
            website: website || null,
        },
        edm: {
            method: 'SendInvoice',
            earchive: preferred === 'EARSIV',
            internetSales: true,
            receiverVkn: billing.taxId,
            invoiceDate: issueDate,
            currency,
            payableAmount: totals.gross,
            checkUserBeforeSend: checkUser,
        },
    };
}
