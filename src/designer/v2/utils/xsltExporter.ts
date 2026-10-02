/**
 * Designer 2.0 — XSLT Exporter (Sprint 3 Aşama 2 — Phase C)
 *
 * Sections state (5 section mimarisi) + customContent → .xslt dosyası üretici.
 *
 * İki mod:
 * 1. customContent dolu → olduğu gibi kullan (kullanıcı kendi XSLT'sini yükledi)
 * 2. customContent boş → sections'tan yeni XSLT generate et
 *
 * Generate ederken:
 * - Her section bir <div class="section-{id}"> olur
 * - masterData section için <xsl:for-each select="//cac:InvoiceLine"> loop
 * - Her element XSLT literal result olur (div/span/p/td)
 * - Element.binding varsa → <xsl:value-of select="/path"/>
 * - Element.content → text node
 * - Element.style → inline CSS
 * - Style camelCase → CSS kebab-case dönüşümü
 */
import type { SectionsMap, Section, DesignElement } from '../../../types';

/** UBL-TR cac: (CommonAggregateComponents) elemanları — XPath namespace prefix için */
const CAC_ELEMENTS = new Set<string>([
    'AccountingSupplierParty',
    'AccountingCustomerParty',
    'Party',
    'PartyName',
    'PartyIdentification',
    'PartyTaxScheme',
    'TaxScheme',
    'PostalAddress',
    'Contact',
    'Person',
    'InvoiceLine',
    'Item',
    'Price',
    'InvoicedQuantity',
    'LineExtensionAmount',
    'TaxTotal',
    'TaxSubtotal',
    'TaxCategory',
    'LegalMonetaryTotal',
    'AllowanceCharge',
    'PaymentMeans',
    'PayeeFinancialAccount',
    'FinancialInstitutionBranch',
    'DespatchDocumentReference',
    'OrderReference',
    'AdditionalDocumentReference',
]);

export interface ExportOptions {
    /** Kullanıcının yüklediği XSLT — varsa generate edilmez. */
    customContent?: string;
    docName?: string;
    templateTitle?: string;
    /** masterData section için InvoiceLine loop'u ekle (default true) */
    includeMasterLoop?: boolean;
}

/**
 * Ana export fonksiyonu.
 * @returns Geçerli XSLT 1.0 source string
 */
export function exportSections(sections: SectionsMap, options: ExportOptions = {}): string {
    if (options.customContent?.trim()) {
        return options.customContent;
    }
    return buildXsltFromSections(sections, options);
}

/**
 * Sections state'ten sıfırdan XSLT üret.
 */
function buildXsltFromSections(sections: SectionsMap, options: ExportOptions): string {
    const orderedSections = Object.values(sections).sort((a, b) => a.order - b.order);
    const docTitle = escapeXml(options.docName || options.templateTitle || 'e-Belge');

    const header = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="cac cbc">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:strip-space elements="*"/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="UTF-8"/>
        <title>${docTitle}</title>
        <style>
          .ebelge-designer { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; }
          .section { padding: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0; }
          .section-report-header { background: #f8fafc; }
          .section-party-header { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .section-master-data { background: #fff; }
          .section-totals { background: #f8fafc; text-align: right; }
          .section-report-footer { background: #f1f5f9; padding: 12px; }
        </style>
      </head>
      <body>
        <div class="ebelge-designer">`;

    const sectionParts = orderedSections
        .map((section) => renderSection(section, options))
        .join('\n');

    const footer = `
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`;

    return header + '\n' + sectionParts + footer;
}

/**
 * Section → XSLT fragment.
 * masterData section için InvoiceLine loop içine al.
 */
function renderSection(section: Section, options: ExportOptions): string {
    const sectionClass = `section-${section.id}`;
    const includeLoop = options.includeMasterLoop !== false; // default true

    const elementsXml = section.elements
        .map((el) => renderElement(el))
        .filter(Boolean)
        .join('\n          ');

    if (section.repeating && includeLoop && section.id === 'masterData') {
        return `
    <div class="${sectionClass}">
      <xsl:for-each select="//cac:InvoiceLine">
        <div class="section-row">
          ${elementsXml || '<!-- master data elemanı yok -->'}
        </div>
      </xsl:for-each>
    </div>`;
    }

    return `
    <div class="${sectionClass}">
      ${elementsXml || '<!-- boş section -->'}
    </div>`;
}

/**
 * DesignElement → XSLT literal result element.
 */
function renderElement(el: DesignElement): string {
    if (!el) return '';
    const styleStr = renderStyle(el.style);
    const styleAttr = styleStr ? ` style="${styleStr}"` : '';
    const xAttr = Number.isFinite(el.x) ? ` data-x="${el.x}"` : '';
    const yAttr = Number.isFinite(el.y) ? ` data-y="${el.y}"` : '';
    const tag = mapElementTag(el.type);
    const content = renderElementContent(el);

    return `<${tag}${styleAttr}${xAttr}${yAttr}>${content}</${tag}>`;
}

function renderElementContent(el: DesignElement): string {
    // 1. Binding varsa → xsl:value-of (XML alanından çek)
    if (el.binding?.trim()) {
        const xpath = bindingToXPath(el.binding);
        return `<xsl:value-of select="${xpath}"/>`;
    }

    // 2. Formül ise → xsl:value-of (ifade olarak)
    if (el.type === 'formula' && el.formula?.trim()) {
        return `<xsl:value-of select="${escapeXml(el.formula)}"/>`;
    }

    // 3. Statik içerik (text)
    if (el.content) {
        return escapeXml(el.content);
    }

    // 4. Shape — content shapeType
    if (el.type === 'shape' && el.shapeType) {
        return ''; // shape sadece background
    }

    return '';
}

/**
 * Element tipini XSLT/HTML tag'e map'le.
 */
function mapElementTag(type: string): string {
    switch (type) {
        case 'text': return 'span';
        case 'shape': return 'div';
        case 'image': return 'img';
        case 'qrcode': return 'img';
        case 'table': return 'table';
        case 'formula': return 'span';
        case 'div': return 'div';
        case 'span': return 'span';
        case 'p': return 'p';
        case 'h1': return 'h1';
        case 'h2': return 'h2';
        case 'h3': return 'h3';
        case 'h4': return 'h4';
        case 'h5': return 'h5';
        case 'h6': return 'h6';
        default: return 'div';
    }
}

/**
 * React.CSSProperties → CSS string.
 * camelCase → kebab-case dönüşümü.
 */
function renderStyle(style: unknown): string {
    if (!style || typeof style !== 'object') return '';
    const entries = Object.entries(style as Record<string, unknown>);
    return entries
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${camelToKebab(k)}: ${escapeCss(String(v))}`)
        .join('; ');
}

function camelToKebab(s: string): string {
    return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * StandardField path'i UBL-TR XPath'e çevir:
 * "Invoice/AccountingSupplierParty/Party/PartyName/Name"
 * → "/Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"
 */
function bindingToXPath(binding: string): string {
    if (binding.startsWith('/')) return binding; // zaten xpath
    const segments = binding.split('/').filter(Boolean);
    const parts = segments.map((seg) => {
        if (seg === 'Invoice') return 'Invoice';
        if (CAC_ELEMENTS.has(seg)) return `cac:${seg}`;
        return `cbc:${seg}`;
    });
    return '/' + parts.join('/');
}

/**
 * XML attribute / text güvenli hale getir.
 */
function escapeXml(s: string): string {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * CSS değer güvenli hale getir (XSS koruması).
 */
function escapeCss(v: string): string {
    return v.replace(/[;{}<>]/g, '');
}

/**
 * Sections istatistikleri — debug ve önizleme.
 */
export function describeSections(sections: SectionsMap): {
    totalElements: number;
    bindingsCount: number;
    shapesCount: number;
    sectionSummary: { id: string; title: string; count: number }[];
} {
    const allElements = Object.values(sections).flatMap((s) => s.elements);
    return {
        totalElements: allElements.length,
        bindingsCount: allElements.filter((e) => e.binding).length,
        shapesCount: allElements.filter((e) => e.type === 'shape').length,
        sectionSummary: Object.values(sections)
            .sort((a, b) => a.order - b.order)
            .map((s) => ({ id: s.id, title: s.title, count: s.elements.length })),
    };
}