/**
 * Sektöre göre hazır tasarım şablonları. Her şablon bir XSLT + o sektöre
 * uygun örnek XML çiftidir (public/ebelge/hazir/ altında); galeride
 * önizlenir, tıklanınca tasarım ekranına yüklenir.
 */

export type SectorId =
    | 'perakende'
    | 'eticaret'
    | 'yeme-icme'
    | 'toptan'
    | 'kuyumcu'
    | 'hukuk'
    | 'muhasebe'
    | 'saglik'
    | 'bilisim'
    | 'turizm'
    | 'egitim'
    | 'insaat'
    | 'lojistik'
    | 'uretim'
    | 'ihracat'
    | 'tarim'
    | 'otomotiv'
    | 'enerji';

export interface SectorInfo {
    id: SectorId;
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
}

export const SECTORS: SectorInfo[] = [
    { id: 'perakende', label: 'Perakende & Mağaza', color: '#3b82f6' },
    { id: 'eticaret', label: 'E-Ticaret', color: '#8b5cf6' },
    { id: 'yeme-icme', label: 'Kafe & Restoran', color: '#f97316' },
    { id: 'toptan', label: 'Toptan & Dağıtım', color: '#0ea5e9' },
    { id: 'kuyumcu', label: 'Kuyumcu & Döviz', color: '#ca8a04' },
    { id: 'hukuk', label: 'Hukuk Bürosu', color: '#1e40af' },
    { id: 'muhasebe', label: 'Mali Müşavirlik', color: '#0f766e' },
    { id: 'saglik', label: 'Sağlık & Klinik', color: '#14b8a6' },
    { id: 'bilisim', label: 'Yazılım & Bilişim', color: '#6366f1' },
    { id: 'turizm', label: 'Otel & Turizm', color: '#ec4899' },
    { id: 'egitim', label: 'Eğitim & Kurs', color: '#a855f7' },
    { id: 'insaat', label: 'İnşaat & Taahhüt', color: '#d97706' },
    { id: 'lojistik', label: 'Lojistik & Nakliye', color: '#0284c7' },
    { id: 'uretim', label: 'Üretim & Sanayi', color: '#475569' },
    { id: 'ihracat', label: 'İhracat', color: '#10b981' },
    { id: 'tarim', label: 'Tarım & Hububat', color: '#65a30d' },
    { id: 'otomotiv', label: 'Otomotiv & Servis', color: '#dc2626' },
    { id: 'enerji', label: 'Enerji & Şarj', color: '#16a34a' },
];

export const hazirPath = (id: string, ext: 'xslt' | 'xml') => `ebelge/hazir/${id}.${ext}`;
