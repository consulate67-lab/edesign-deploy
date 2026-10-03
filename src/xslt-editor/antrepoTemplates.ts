/**
 * Antrepo XSLT Templates — Sprint 9 Aşama 1 (2026-10-03)
 *
 * Selim'in brief'i: "Mevcut XSLT dosyalarını kullan — e-Fatura ve e-Arşiv
 * Antrepo olanları solda alanlar gelmesi gerekiyor".
 *
 * public/ altındaki Antrepo_Fatura.xslt (119 KB) ve antrepo_arsiv.xslt (127 KB)
 * dosyaları Vite ?raw ile import edilir. UTF-8 BOM defensive strip.
 *
 * Notlar:
 * - DOMParser application/xml ile BOM'u otomatik handle eder, ama
 *   getInlineXslt'den gelen string'in başında BOM kalmasın diye strip ediyoruz.
 * - Bu dosyalar büyük (~250 KB raw, ~50 KB gzip), ayrı chunk'a çıkar.
 * - ?raw inline import: Vite build sırasında bundle'a gömülür, runtime fetch yok.
 */
import anrepoFaturaRaw from '../../public/Antrepo_Fatura.xslt?raw';
import anrepoArsivRaw from '../../public/antrepo_arsiv.xslt?raw';
import type { XsltTemplate } from './templates';

/**
 * UTF-8 BOM strip (0xEF 0xBB 0xBF).
 * Vite ?raw dosya içeriğini olduğu gibi verir — BOM dahil.
 */
function stripBom(s: string): string {
    return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
}

const ANTREPO_FATURA = stripBom(anrepoFaturaRaw);
const ANTREPO_ARSIV = stripBom(anrepoArsivRaw);

/**
 * Antrepo XSLT şablonları — Sprint 9 modül dropdown'ına eklenir.
 * Profesyonel/standart fatura-eArşiv tasarımı — gerçek UBL-TR çıktısı.
 */
export const ANTREPO_TEMPLATES: XsltTemplate[] = [
    {
        id: 'antrepo-fatura',
        label: 'Antrepo e-Fatura',
        description: 'Profesyonel e-Fatura tasarımı — UBL-TR standart görünüm (tedarikçi/müşteri kartları, ürün tablosu, KDV, toplam). 119 KB.',
        moduleId: 'fatura',
        docName: 'Antrepo e-Fatura',
        xslt: ANTREPO_FATURA,
    },
    {
        id: 'antrepo-arsiv',
        label: 'Antrepo e-Arşiv',
        description: 'Profesyonel e-Arşiv tasarımı — UBL-TR standart görünüm (tedarikçi/müşteri kartları, ürün tablosu, KDV, toplam). 127 KB.',
        moduleId: 'arsiv',
        docName: 'Antrepo e-Arşiv',
        xslt: ANTREPO_ARSIV,
    },
];

/**
 * Verilen Antrepo ID için XsltTemplate'i döndürür (initialXslt için).
 */
export const getAntrepoTemplateById = (id: string): XsltTemplate | undefined => {
    return ANTREPO_TEMPLATES.find(t => t.id === id);
};