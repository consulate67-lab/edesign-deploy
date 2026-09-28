/**
 * Designer 2.0 — xsltToSections (Phase 17.3.2)
 *
 * xsltToState.ts'ten dönen DesignState.elements dizisini
 * 5 section mimarisine dağıtır.
 *
 * Section dağıtım stratejisi (sıra):
 * 1. İlk N element → reportHeader (üst bilgi: ID, tarih, fatura tipi vs)
 * 2. Sonraki 2 blok → partyHeader (tedarikçi + müşteri)
 * 3. Tablo varsa → masterData
 * 4. TaxTotal + LegalMonetaryTotal → totals
 * 5. Kalan → reportFooter
 */

import type { DesignElement, SectionsMap, SectionId } from '../../../types';
import { createDefaultSections } from '../../../types';
import { xsltToState } from '../../../xsltToState';

/**
 * Element'in sectionId'sini tahmin et (heuristic).
 * Bu Phase 17.3 için basit bir dağıtıcı; Phase 18+'da geliştirilebilir.
 */
function inferSectionId(el: DesignElement, index: number, total: number): SectionId {
    const text = (el.content || el.binding || '').toLowerCase();
    const style = el.style || {};

    // 1. İlk 4-5 element → reportHeader (üst bilgi: ID, tarih, tip, para birimi)
    if (index < 5) return 'reportHeader';

    // 2. Tedarikçi/Müşteri sinyalleri
    if (
        text.includes('tedarikçi') ||
        text.includes('müşteri') ||
        text.includes('supplier') ||
        text.includes('customer') ||
        text.includes('party') ||
        (style.textAlign === 'right' && index < total * 0.4)
    ) {
        return 'partyHeader';
    }

    // 3. Tablo → masterData
    if (el.type === 'table' && el.tableData && el.tableData.length > 0) {
        return 'masterData';
    }

    // 4. Toplamlar (Tax, Monetary, Total, Payable)
    if (
        text.includes('toplam') ||
        text.includes('vergi') ||
        text.includes('tutar') ||
        text.includes('kdv') ||
        text.includes('total') ||
        text.includes('tax') ||
        text.includes('payable') ||
        text.includes('ödenecek')
    ) {
        return 'totals';
    }

    // 5. Son elementler → reportFooter (banka, not, imza)
    if (index > total - 4) return 'reportFooter';

    // default: reportHeader (ilk yarısı)
    return index < total / 2 ? 'reportHeader' : 'totals';
}

/**
 * XSLT → SectionsMap dönüşümü.
 * @param xsltString - XSLT source
 * @returns SectionsMap (5 section hepsi dolu)
 */
export function xsltToSections(xsltString: string): SectionsMap {
    let parsed;
    try {
        parsed = xsltToState(xsltString);
    } catch (err) {
        console.warn('[xsltToSections] XSLT parse hatası:', err);
        return createDefaultSections();
    }

    const sections = createDefaultSections();
    const elements = parsed.elements || [];

    if (elements.length === 0) {
        return sections;
    }

    const total = elements.length;

    // Elementleri section'a dağıt
    elements.forEach((el, idx) => {
        const sectionId = inferSectionId(el, idx, total);
        sections[sectionId].elements.push(el);
    });

    return sections;
}