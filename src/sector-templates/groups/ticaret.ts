import { hazirPath, type SectorTemplate } from '../types';

/** Perakende, e-ticaret, kafe-restoran, toptan dağıtım, kuyumcu-döviz. */
export const TICARET_TEMPLATES: SectorTemplate[] = [
    {
        id: 'perakende-magaza-arsiv',
        sector: 'perakende',
        name: 'Mağaza Satış e-Arşiv Faturası',
        description:
            'Giyim ve elektronik mağazaları için nihai tüketiciye kesilen e-Arşiv fatura; ürün bazlı indirim, kampanya şeridi ve %10/%20 KDV dökümüyle.',
        docTypeId: 'arsiv',
        moduleId: 'arsiv',
        accent: '#1d4ed8',
        xslt: hazirPath('perakende-magaza-arsiv', 'xslt'),
        xml: hazirPath('perakende-magaza-arsiv', 'xml'),
        tags: ['Nihai tüketici', 'Satır iskontosu', 'Kampanya notu', 'Çoklu KDV', 'Karekod'],
    },
    {
        id: 'eticaret-internet-satis',
        sector: 'eticaret',
        name: 'İnternet Satışı e-Arşiv Faturası',
        description:
            'Online mağazalar için GİB internet satışı alanlarını (web adresi, ödeme şekli/aracısı, ödeme ve gönderim tarihi, taşıyıcı) gösteren, sipariş zaman çizelgeli e-Arşiv fatura.',
        docTypeId: 'arsiv',
        moduleId: 'arsiv',
        accent: '#7c3aed',
        xslt: hazirPath('eticaret-internet-satis', 'xslt'),
        xml: hazirPath('eticaret-internet-satis', 'xml'),
        tags: ['İnternet satışı', 'Kargo & takip no', 'Ödeme aracısı', 'Sipariş no', 'Teslimat adresi'],
    },
    {
        id: 'kafe-restoran-adisyon',
        sector: 'yeme-icme',
        name: 'Kafe & Restoran Adisyon Faturası',
        description:
            'Kafe, bistro ve restoranlar için 80 mm fiş görünümlü e-Arşiv adisyon; masa, garson, kişi sayısı ve servis notu ile yiyecek %10 / içecek %20 KDV ayrımı.',
        docTypeId: 'arsiv',
        moduleId: 'arsiv',
        accent: '#ea580c',
        xslt: hazirPath('kafe-restoran-adisyon', 'xslt'),
        xml: hazirPath('kafe-restoran-adisyon', 'xml'),
        tags: ['80 mm fiş', 'Masa & garson', 'Servis notu', '%10 / %20 KDV', 'A4 yazdırılabilir'],
    },
    {
        id: 'toptan-gida-fatura',
        sector: 'toptan',
        name: 'Toptan Gıda Ticari e-Faturası',
        description:
            'Gıda toptancı ve distribütörleri için koli/çuval bazlı çok kalemli ticari e-fatura; satır iskontosu, irsaliye ve sipariş referansı, vade koşulları ve banka hesapları tablosuyla.',
        docTypeId: 'fatura',
        moduleId: 'fatura',
        accent: '#0369a1',
        xslt: hazirPath('toptan-gida-fatura', 'xslt'),
        xml: hazirPath('toptan-gida-fatura', 'xml'),
        tags: ['Ticari fatura', 'Koli / ambalaj', 'Satır iskontosu', 'İrsaliye referansı', 'Vade', 'Banka bilgisi'],
    },
    {
        id: 'toptan-sevk-irsaliye',
        sector: 'toptan',
        name: 'Toptan Dağıtım Sevk e-İrsaliyesi',
        description:
            'Dağıtım araçlarıyla yapılan sevkiyatlar için e-İrsaliye; araç ve dorse plakası, şoför bilgisi, sevk adresi, palet/koli dağılımı, brüt ağırlık ve teslim alan imza alanı.',
        docTypeId: 'irsaliye',
        moduleId: 'irsaliye',
        accent: '#0e7490',
        xslt: hazirPath('toptan-sevk-irsaliye', 'xslt'),
        xml: hazirPath('toptan-sevk-irsaliye', 'xml'),
        tags: ['Araç plakası', 'Şoför bilgisi', 'Sevk adresi', 'Koli / palet', 'Teslim alan imzası'],
    },
    {
        id: 'kuyumcu-altin-satis',
        sector: 'kuyumcu',
        name: 'Kuyumcu Altın Satım Belgesi',
        description:
            'Kuyumcu ve yetkili müesseseler için e-Kıymetli Maden satım belgesi; maden cinsi, adet/gram, birim fiyat, işçilik farkı KDV’si ve müşteri/müessese ödeme bilgileriyle.',
        docTypeId: 'doviz',
        moduleId: 'doviz-satim',
        accent: '#b8860b',
        xslt: hazirPath('kuyumcu-altin-satis', 'xslt'),
        xml: hazirPath('kuyumcu-altin-satis', 'xml'),
        tags: ['Kıymetli maden', 'Çeyrek altın', 'İşçilik KDV', 'Kart / IBAN ödeme', 'Müşteri TCKN'],
    },
];
