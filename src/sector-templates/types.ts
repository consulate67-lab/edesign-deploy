/**
 * Sektöre göre hazır tasarım şablonları. Her şablon bir XSLT + o sektöre
 * uygun örnek XML çiftidir (public/ebelge/hazir/ altında); galeride
 * önizlenir, tıklanınca tasarım ekranına yüklenir.
 */

export type CategoryId =
    | 'ticaret'
    | 'turizm'
    | 'tasimacilik'
    | 'hizmet'
    | 'finans'
    | 'sanayi'
    | 'moda'
    | 'tarim';

export type SectorId =
    | 'perakende'
    | 'eticaret'
    | 'toptan'
    | 'kuyumcu'
    | 'geri-donusum'
    | 'yeme-icme'
    | 'turizm'
    | 'seyahat'
    | 'arac-kiralama'
    | 'etkinlik'
    | 'lojistik'
    | 'kargo'
    | 'uluslararasi-nakliye'
    | 'yolcu-tasima'
    | 'hukuk'
    | 'muhasebe'
    | 'saglik'
    | 'bilisim'
    | 'egitim'
    | 'guzellik'
    | 'sigorta'
    | 'finans'
    | 'insaat'
    | 'uretim'
    | 'ihracat'
    | 'otomotiv'
    | 'enerji'
    | 'tekstil'
    | 'ayakkabi'
    | 'tarim';

export interface CategoryInfo {
    id: CategoryId;
    label: string;
    color: string;
}

export interface SectorInfo {
    id: SectorId;
    category: CategoryId;
    label: string;
    /** Galeride sektör filtresinin rengi. */
    color: string;
}

export interface SectorTemplate {
    /** Benzersiz, kebab-case; public dosya adlarıyla aynı. */
    id: string;
    sector: SectorId;
    /** Kart başlığı, ör. "Kafe & Restoran Adisyon Faturası". */
    name: string;
    /** Kısa açıklama (1-2 cümle): kime, hangi durumda. */
    description: string;
    /** WIZARD_DOC_TYPES kimliği (src/wizard/docTypes.ts): 'fatura', 'arsiv', 'irsaliye', 'smm', ... */
    docTypeId: string;
    /** Tasarım ekranındaki modül kimliği (XsltEditor MODULES): 'fatura', 'arsiv', 'irsaliye', 'smm', ... */
    moduleId: string;
    /** Kartın vurgu rengi (#rrggbb). */
    accent: string;
    /** public/ altındaki XSLT yolu: `ebelge/hazir/<id>.xslt`. */
    xslt: string;
    /** public/ altındaki örnek XML yolu: `ebelge/hazir/<id>.xml`. */
    xml: string;
    /** Öne çıkan özellikler (kartta etiket olarak): "Tevkifat", "Banka bilgisi", ... */
    tags: string[];
    /** Yönetim panelinden eklenen tasarımlarda içerik dosyadan değil buradan okunur (xslt / xml alanları yalnızca ad taşır). */
    inline?: { xslt: string; xml: string };
    /** 'admin': veritabanı galerisinden (yönetim paneli); verilmezse public/ altındaki hazır şablon. */
    source?: 'static' | 'admin';
    /** Şablonda banka / IBAN bloğu var mı (index.ts doldurur). */
    bank?: boolean;
}

export const CATEGORIES: CategoryInfo[] = [
    { id: 'ticaret', label: 'Ticaret & Perakende', color: '#3b82f6' },
    { id: 'turizm', label: 'Turizm & Ağırlama', color: '#ec4899' },
    { id: 'tasimacilik', label: 'Taşımacılık & Lojistik', color: '#0284c7' },
    { id: 'hizmet', label: 'Profesyonel Hizmetler', color: '#14b8a6' },
    { id: 'finans', label: 'Finans & Sigorta', color: '#4f46e5' },
    { id: 'sanayi', label: 'Sanayi & Üretim', color: '#d97706' },
    { id: 'moda', label: 'Tekstil, Ayakkabı & Moda', color: '#be185d' },
    { id: 'tarim', label: 'Tarım & Gıda', color: '#65a30d' },
];

export const SECTORS: SectorInfo[] = [
    { id: 'perakende', category: 'ticaret', label: 'Perakende & Mağaza', color: '#3b82f6' },
    { id: 'eticaret', category: 'ticaret', label: 'E-Ticaret', color: '#8b5cf6' },
    { id: 'toptan', category: 'ticaret', label: 'Toptan & Dağıtım', color: '#0ea5e9' },
    { id: 'kuyumcu', category: 'ticaret', label: 'Kuyumcu & Döviz', color: '#ca8a04' },
    { id: 'geri-donusum', category: 'ticaret', label: 'Hurda & Geri Dönüşüm', color: '#78716c' },
    { id: 'yeme-icme', category: 'turizm', label: 'Kafe & Restoran', color: '#f97316' },
    { id: 'turizm', category: 'turizm', label: 'Otel & Konaklama', color: '#ec4899' },
    { id: 'seyahat', category: 'turizm', label: 'Seyahat Acentesi & Tur', color: '#06b6d4' },
    { id: 'arac-kiralama', category: 'turizm', label: 'Araç Kiralama', color: '#f43f5e' },
    { id: 'etkinlik', category: 'turizm', label: 'Etkinlik & Bilet', color: '#d946ef' },
    { id: 'lojistik', category: 'tasimacilik', label: 'Lojistik & Nakliye', color: '#0284c7' },
    { id: 'kargo', category: 'tasimacilik', label: 'Kargo & Kurye', color: '#f59e0b' },
    { id: 'uluslararasi-nakliye', category: 'tasimacilik', label: 'TIR & Uluslararası Nakliye', color: '#1d4ed8' },
    { id: 'yolcu-tasima', category: 'tasimacilik', label: 'Otobüs & Yolcu Taşıma', color: '#ea580c' },
    { id: 'hukuk', category: 'hizmet', label: 'Hukuk Bürosu', color: '#1e40af' },
    { id: 'muhasebe', category: 'hizmet', label: 'Mali Müşavirlik & Denetim', color: '#0f766e' },
    { id: 'saglik', category: 'hizmet', label: 'Sağlık, Klinik & Eczane', color: '#14b8a6' },
    { id: 'bilisim', category: 'hizmet', label: 'Yazılım & Bilişim', color: '#6366f1' },
    { id: 'egitim', category: 'hizmet', label: 'Eğitim & Kurs', color: '#a855f7' },
    { id: 'guzellik', category: 'hizmet', label: 'Güzellik & Kişisel Bakım', color: '#db2777' },
    { id: 'sigorta', category: 'finans', label: 'Sigorta Acentesi', color: '#4f46e5' },
    { id: 'finans', category: 'finans', label: 'Ödeme & Finans', color: '#0f766e' },
    { id: 'insaat', category: 'sanayi', label: 'İnşaat & Taahhüt', color: '#d97706' },
    { id: 'uretim', category: 'sanayi', label: 'Üretim & Sanayi', color: '#475569' },
    { id: 'ihracat', category: 'sanayi', label: 'İhracat', color: '#10b981' },
    { id: 'otomotiv', category: 'sanayi', label: 'Otomotiv & Servis', color: '#dc2626' },
    { id: 'enerji', category: 'sanayi', label: 'Enerji & Akaryakıt', color: '#16a34a' },
    { id: 'tekstil', category: 'moda', label: 'Tekstil & Konfeksiyon', color: '#a21caf' },
    { id: 'ayakkabi', category: 'moda', label: 'Ayakkabı & Deri', color: '#b45309' },
    { id: 'tarim', category: 'tarim', label: 'Tarım & Hayvancılık', color: '#65a30d' },
];

export const hazirPath = (id: string, ext: 'xslt' | 'xml') => `ebelge/hazir/${id}.${ext}`;
