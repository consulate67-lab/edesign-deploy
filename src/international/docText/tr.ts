import type { DocTextPack } from './types';

const tr: DocTextPack = {
    titles: {
        invoice: 'Fatura',
        credit: 'İade Faturası',
        corrected: 'Düzeltme Faturası',
        prepayment: 'Avans Faturası',
        partial: 'Kısmi Fatura',
        selfbilled: 'Alıcı Tarafından Düzenlenen Fatura',
        despatch: 'Sevk İrsaliyesi',
    },
    sample: {
        note: 'Bizi tercih ettiğiniz için teşekkür ederiz.',
        paymentTerms: '30 gün içinde kesintisiz ödenir.',
        creditNote: 'İade edilen bir ürün için (taşımada hasar gördü).',
        correctedNote: 'Bu fatura asıl faturadaki birim fiyatı düzeltir.',
        prepaymentNote: '{{order}} siparişi için avans; kesin faturadan düşülecektir.',
        partialNote: 'Projenin ilk aşaması için kısmi fatura.',
        prepaymentItem: 'Avans (%{{pct}})',
        discount: 'Sadakat indirimi',
        product: 'Ergonomik ofis koltuğu',
        productDesc: 'Siyah file sırtlık, ayarlanabilir kolçak',
        service: 'Kurulum ve ayar',
        accessory: 'Zemin koruma matı',
        despatchNote: 'Lütfen mal kabul girişine teslim ediniz.',
        backorderReason: 'Geçici olarak stokta yok; gelecek hafta gönderilecek.',
    },
};

export default tr;
