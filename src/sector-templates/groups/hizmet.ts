import { hazirPath, type SectorTemplate } from '../types';

/** Hukuk, mali müşavirlik, sağlık, bilişim, otel-turizm, eğitim. */
export const HIZMET_TEMPLATES: SectorTemplate[] = [
    {
        id: 'avukat-smm',
        sector: 'hukuk',
        name: 'Avukatlık Bürosu e-SMM',
        description:
            'Şirket müvekkile kesilen vekalet ücreti makbuzu; %20 GV stopajı, %20 KDV ve danışmanlık kalemine 9/10 KDV tevkifatı, mahkeme ve dosya bilgisi paneliyle.',
        docTypeId: 'smm',
        moduleId: 'smm',
        accent: '#13254a',
        xslt: hazirPath('avukat-smm', 'xslt'),
        xml: hazirPath('avukat-smm', 'xml'),
        tags: ['Stopaj', 'KDV tevkifatı', 'Dosya / esas no', 'Baro sicil', 'Kaşe & imza'],
    },
    {
        id: 'mali-musavir-smm',
        sector: 'muhasebe',
        name: 'Mali Müşavir Aylık Hizmet e-SMM',
        description:
            'Aylık muhasebe, bordro ve beyanname hizmetleri için dönem bazlı makbuz; brüt → stopaj → net → KDV hesap şeridi, oda sicil ve TÜRMOB ruhsat bilgisiyle.',
        docTypeId: 'smm',
        moduleId: 'smm',
        accent: '#0f766e',
        xslt: hazirPath('mali-musavir-smm', 'xslt'),
        xml: hazirPath('mali-musavir-smm', 'xml'),
        tags: ['Hizmet dönemi', 'Stopaj', 'Hesap şeridi', 'Oda sicil / TÜRMOB', 'Banka bilgisi'],
    },
    {
        id: 'klinik-saglik-smm',
        sector: 'saglik',
        name: 'Muayenehane / Klinik e-SMM',
        description:
            'Serbest hekimin hastaya (nihai tüketici) kestiği stopajsız makbuz; hasta kartı, protokol no, diploma ve uzmanlık tescil numaraları ile kartlı tahsilat bilgisi.',
        docTypeId: 'smm',
        moduleId: 'smm',
        accent: '#0e7490',
        xslt: hazirPath('klinik-saglik-smm', 'xslt'),
        xml: hazirPath('klinik-saglik-smm', 'xml'),
        tags: ['Nihai tüketici', 'Stopajsız', 'Hasta bilgisi', 'Diploma / tescil no', 'POS tahsilat'],
    },
    {
        id: 'yazilim-hizmet-fatura',
        sector: 'bilisim',
        name: 'Yazılım & Danışmanlık Tevkifatlı e-Fatura',
        description:
            'SaaS abonelik, saatlik geliştirme ve entegrasyon kalemleri için TICARIFATURA / TEVKIFAT; satır bazlı 9/10 KDV tevkifatı, proje kodu, sipariş ve sözleşme referanslarıyla.',
        docTypeId: 'fatura',
        moduleId: 'fatura',
        accent: '#4f46e5',
        xslt: hazirPath('yazilim-hizmet-fatura', 'xslt'),
        xml: hazirPath('yazilim-hizmet-fatura', 'xml'),
        tags: ['KDV tevkifatı', 'Proje kodu', 'Sipariş / sözleşme', 'Hizmet dönemi', 'Ürün kodu'],
    },
    {
        id: 'otel-konaklama-fatura',
        sector: 'turizm',
        name: 'Otel Konaklama e-Faturası',
        description:
            'Kurumsal misafir için konaklama faturası; %2 konaklama vergisi (0059), oda no, giriş/çıkış ve gece sayısı, restoran/spa/minibar kalemleri ve %10/%20 KDV dökümü.',
        docTypeId: 'fatura',
        moduleId: 'fatura',
        accent: '#9a7b45',
        xslt: hazirPath('otel-konaklama-fatura', 'xslt'),
        xml: hazirPath('otel-konaklama-fatura', 'xml'),
        tags: ['Konaklama vergisi', 'Giriş / çıkış', 'Oda & misafir', 'Çoklu KDV', 'Banka bilgisi'],
    },
    {
        id: 'egitim-kurs-arsiv',
        sector: 'egitim',
        name: 'Eğitim Kurumu / Kurs e-Arşiv Faturası',
        description:
            'Veliye (nihai tüketici) kesilen dönem ücreti faturası; öğrenci kartı, eğitim dönemi, %10 kurs ve %20 atölye KDV ayrımı ile renkli taksit planı.',
        docTypeId: 'arsiv',
        moduleId: 'arsiv',
        accent: '#a855f7',
        xslt: hazirPath('egitim-kurs-arsiv', 'xslt'),
        xml: hazirPath('egitim-kurs-arsiv', 'xml'),
        tags: ['Nihai tüketici', 'Öğrenci bilgisi', 'Taksit planı', 'Eğitim dönemi', 'Çoklu KDV'],
    },
];
