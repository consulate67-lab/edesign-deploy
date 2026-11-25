/**
 * Shopify vitrini: e-ticaret satışına uygun sektörler (sipariş / kargo / online satış).
 * Diğer meslek/sektör şablonları ana sitede kalır.
 */
export const SHOPIFY_ECOM_SECTOR_IDS = [
    'eticaret',
    'perakende',
    'elektronik',
    'tekstil',
    'ayakkabi',
    'gida',
    'guzellik',
    'mobilya',
    'bilisim',
    'spor',
    'eglence',
    'toptan',
    'kargo',
    'lojistik',
];

/** TR sektör etiketleri — src/sector-templates/types.ts ile uyumlu. */
export const TR_SECTORS = [
    { id: 'perakende', label: 'Perakende & Mağaza' },
    { id: 'eticaret', label: 'E-Ticaret' },
    { id: 'toptan', label: 'Toptan & Dağıtım' },
    { id: 'kuyumcu', label: 'Kuyumcu & Döviz' },
    { id: 'geri-donusum', label: 'Hurda & Geri Dönüşüm' },
    { id: 'yeme-icme', label: 'Kafe & Restoran' },
    { id: 'turizm', label: 'Otel & Konaklama' },
    { id: 'seyahat', label: 'Seyahat Acentesi & Tur' },
    { id: 'arac-kiralama', label: 'Araç Kiralama' },
    { id: 'etkinlik', label: 'Etkinlik & Bilet' },
    { id: 'lojistik', label: 'Lojistik & Nakliye' },
    { id: 'kargo', label: 'Kargo & Kurye' },
    { id: 'uluslararasi-nakliye', label: 'TIR & Uluslararası Nakliye' },
    { id: 'yolcu-tasima', label: 'Otobüs & Yolcu Taşıma' },
    { id: 'hukuk', label: 'Hukuk Bürosu' },
    { id: 'muhasebe', label: 'Mali Müşavirlik & Denetim' },
    { id: 'saglik', label: 'Sağlık, Klinik & Eczane' },
    { id: 'bilisim', label: 'Yazılım & Bilişim' },
    { id: 'egitim', label: 'Eğitim & Kurs' },
    { id: 'guzellik', label: 'Güzellik & Kişisel Bakım' },
    { id: 'sigorta', label: 'Sigorta Acentesi' },
    { id: 'finans', label: 'Ödeme & Finans' },
    { id: 'insaat', label: 'İnşaat & Taahhüt' },
    { id: 'uretim', label: 'Üretim & Sanayi' },
    { id: 'ihracat', label: 'İhracat' },
    { id: 'otomotiv', label: 'Otomotiv & Servis' },
    { id: 'enerji', label: 'Enerji & Akaryakıt' },
    { id: 'tekstil', label: 'Tekstil & Konfeksiyon' },
    { id: 'ayakkabi', label: 'Ayakkabı & Deri' },
    { id: 'tarim', label: 'Tarım & Hayvancılık' },
    { id: 'gida', label: 'Gıda Üretim & Satış' },
    { id: 'pazar', label: 'Pazar & Seyyar' },
    { id: 'elektronik', label: 'Elektronik & İletişim' },
    { id: 'emlak', label: 'Emlak & Gayrimenkul' },
    { id: 'teknik-servis', label: 'Teknik Servis & Onarım' },
    { id: 'temizlik', label: 'Temizlik & İlaçlama' },
    { id: 'buro', label: 'Büro & Danışmanlık' },
    { id: 'medya', label: 'Medya, Reklam & Basım' },
    { id: 'spor', label: 'Spor & Rekreasyon' },
    { id: 'genel-hizmet', label: 'Kişisel & Genel Hizmetler' },
    { id: 'eglence', label: 'Eğlence & Kültür' },
    { id: 'mobilya', label: 'Ağaç & Mobilya' },
    { id: 'metal', label: 'Metal & Makine' },
    { id: 'genel', label: 'Genel / GİB' },
    { id: 'intl', label: 'Uluslararası' },
];

export function sectorLabel(id) {
    return TR_SECTORS.find((s) => s.id === id)?.label || id || '';
}

/** Shopify katalogunda gösterilecek sektör listesi (kullanılanlar ∩ e-ticaret seti). */
export function listShopifyEcomSectors(usedSectorIds = []) {
    const used = new Set(usedSectorIds.filter(Boolean));
    return TR_SECTORS.filter((s) => SHOPIFY_ECOM_SECTOR_IDS.includes(s.id) && used.has(s.id));
}

export function isShopifyEcomSector(id) {
    return SHOPIFY_ECOM_SECTOR_IDS.includes(String(id || '').toLowerCase());
}
