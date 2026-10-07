import { hazirPath, type SectorTemplate } from '../types';

/** Otel, seyahat acentesi, araç kiralama, etkinlik, catering. */
export const TURIZM_TEMPLATES: SectorTemplate[] = [
    {
        id: 'seyahat-tur-paketi',
        sector: 'seyahat',
        name: 'Tur Paketi e-Arşiv Faturası',
        description:
            'Bireysel müşteriye kesilen Kapadokya tur paketi faturası; biniş kartı görünümlü tur kartı (tur kodu, gidiş-dönüş, gece/gün), katılımcı listesi, rehber ve buluşma bilgisi, %10/%20 KDV.',
        docTypeId: 'arsiv',
        moduleId: 'arsiv',
        accent: '#c2410c',
        xslt: hazirPath('seyahat-tur-paketi', 'xslt'),
        xml: hazirPath('seyahat-tur-paketi', 'xml'),
        tags: ['Tur kodu', 'Gidiş / dönüş', 'Katılımcı listesi', 'TÜRSAB belge no', 'Çoklu KDV'],
    },
    {
        id: 'seyahat-acente-hizmet',
        sector: 'seyahat',
        name: 'Kurumsal Seyahat Hizmet e-Faturası',
        description:
            'Kurumsal müşteriye aylık acente servis bedelleri; satır bazında PNR, yolcu, rota ve seyahat tarihi, sipariş / sözleşme / masraf merkezi referansları ve vade bilgisi.',
        docTypeId: 'fatura',
        moduleId: 'fatura',
        accent: '#0891b2',
        xslt: hazirPath('seyahat-acente-hizmet', 'xslt'),
        xml: hazirPath('seyahat-acente-hizmet', 'xml'),
        tags: ['PNR', 'Yolcu & rota', 'Masraf merkezi', 'Hizmet dönemi', 'Banka bilgisi'],
    },
    {
        id: 'arac-kiralama-gunluk',
        sector: 'arac-kiralama',
        name: 'Günlük Araç Kiralama e-Arşiv Faturası',
        description:
            'Bireysel kiracıya rent a car faturası; plaka görünümlü araç paneli, teslim/iade şube-tarih-kilometre sayaçları, gün × fiyat, iskonto, ek sürücü, bebek koltuğu, HGS ve depozito notu.',
        docTypeId: 'arsiv',
        moduleId: 'arsiv',
        accent: '#e11d48',
        xslt: hazirPath('arac-kiralama-gunluk', 'xslt'),
        xml: hazirPath('arac-kiralama-gunluk', 'xml'),
        tags: ['Plaka & araç', 'Teslim / iade KM', 'Satır iskontosu', 'Depozito', 'HGS'],
    },
    {
        id: 'arac-kiralama-filo',
        sector: 'arac-kiralama',
        name: 'Filo Kiralama Aylık e-Faturası',
        description:
            'Kurumsal operasyonel kiralama faturası; araç başına satır (plaka, marka/model, sözleşme, dönem, km), kısmi dönem, km aşım bedeli ve araç sayısı / toplam km gösterge kutuları.',
        docTypeId: 'fatura',
        moduleId: 'fatura',
        accent: '#312e81',
        xslt: hazirPath('arac-kiralama-filo', 'xslt'),
        xml: hazirPath('arac-kiralama-filo', 'xml'),
        tags: ['Araç bazlı satır', 'KM aşımı', 'Filo sözleşmesi', 'Gösterge paneli', 'Vade & IBAN'],
    },
    {
        id: 'otel-bireysel-arsiv',
        sector: 'turizm',
        name: 'Butik Otel e-Arşiv Faturası',
        description:
            'Bireysel misafire sahil oteli konaklama folyosu; %2 konaklama vergisi (0059) KDV matrahına dahil, giriş/çıkış ve gece kartı, oda no, oda servisi, minibar, spa ve tur kalemleri.',
        docTypeId: 'arsiv',
        moduleId: 'arsiv',
        accent: '#0284c7',
        xslt: hazirPath('otel-bireysel-arsiv', 'xslt'),
        xml: hazirPath('otel-bireysel-arsiv', 'xml'),
        tags: ['Konaklama vergisi', 'Giriş / çıkış', 'Oda & pansiyon', 'Nihai tüketici', 'Çoklu KDV'],
    },
    {
        id: 'catering-toplu-yemek',
        sector: 'yeme-icme',
        name: 'Toplu Yemek / Catering Tevkifatlı e-Fatura',
        description:
            'Fabrika yemekhanesine aylık toplu yemek faturası; öğün sayıları, yemek servis hizmetinde 5/10 KDV tevkifatı (604), haftalık menü tahtası ve dönem / sözleşme özeti.',
        docTypeId: 'fatura',
        moduleId: 'fatura',
        accent: '#2f4f3a',
        xslt: hazirPath('catering-toplu-yemek', 'xslt'),
        xml: hazirPath('catering-toplu-yemek', 'xml'),
        tags: ['KDV tevkifatı 5/10', 'Öğün sayısı', 'Haftalık menü', 'Hizmet dönemi', 'Banka bilgisi'],
    },
    {
        id: 'etkinlik-konser-bilet',
        sector: 'etkinlik',
        name: 'Konser e-Bileti',
        description:
            'İzleyiciye konser bileti; neon bilet kartı (etkinlik, tarih/gün/saat, mekan, kapı açılış, kategori), koçanda karekod ve blok / sıra / koltuk, bilet ve hizmet bedeli KDV dökümü.',
        docTypeId: 'bilet',
        moduleId: 'bilet',
        accent: '#d946ef',
        xslt: hazirPath('etkinlik-konser-bilet', 'xslt'),
        xml: hazirPath('etkinlik-konser-bilet', 'xml'),
        tags: ['Blok / sıra / koltuk', 'Kapı açılış', 'Karekod', 'Etkinlik yeri', 'Çoklu KDV'],
    },
];
