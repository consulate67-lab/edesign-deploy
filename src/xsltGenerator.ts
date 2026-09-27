import type { DesignState, Section, SectionId, DesignElement } from './types.ts';
import { createDefaultSections } from './types.ts';

/**
 * Phase 14 — FastReport section-aware XSLT generator.
 *
 * Selim'in direktifi: 'canvas gibi sürükle-bırak yerine FastReport section-tabanlı'
 *
 * Section mimarisi:
 *   reportHeader  -> logo, başlık, Fatura No, Tarih, Saat, Tipi, Para birimi, UUID
 *   partyHeader   -> Tedarikçi (sol) ↔ Müşteri (sağ)
 *   masterData    -> Her InvoiceLine için tekrar eden tablo
 *   totals        -> Vergi toplamları, Mal-Hizmet Toplam, Ödenecek Tutar
 *   reportFooter  -> Banka IBAN, ödeme, not, imza
 *
 * Repeating section (masterData) <xsl:for-each select="..."> ile üretilir.
 * Diğerleri tek seferlik.
 */
export const generateSectionalXSLT = (state: DesignState, docType: string = 'fatura'): string => {
    const sections = state.sections || createDefaultSections();
    const orderedSections = (Object.values(sections) as Section[])
        .sort((a, b) => a.order - b.order);

    const docTitle = docTitleFor(docType);

    return `<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
                xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
                xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
    <xsl:output method="html" indent="yes" encoding="UTF-8" />
    <xsl:template match="/">
        <html>
            <head>
                <style type="text/css">
                    body { font-family: 'Tahoma', sans-serif; font-size: 11px; color: #333; margin: 0; padding: 0; }
                    .ed-section { margin: 0; padding: 8px; border-bottom: 1px dotted #e5e7eb; }
                    .ed-report-header { border-bottom: 2px solid #000099; padding-bottom: 12px; }
                    .ed-party-header { display: flex; gap: 18px; padding: 12px 8px; border-bottom: 1px solid #d1d5db; }
                    .ed-party-card { flex: 1; }
                    .ed-party-title { font-weight: bold; font-size: 11px; color: #1e3a8a; margin-bottom: 4px; }
                    .ed-master-data { padding: 12px 8px; }
                    .ed-master-row { display: flex; gap: 8px; padding: 6px 0; border-bottom: 1px dashed #e5e7eb; }
                    .ed-totals { padding: 12px 8px; border-top: 2px solid #000099; }
                    .ed-report-footer { padding: 12px 8px; border-top: 1px solid #d1d5db; background: #f9fafb; }
                    .ed-doc-title { margin: 0; font-size: 22px; color: #000099; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="ed-design-root">
                    <xsl:apply-templates select="n1:Invoice"/>

                    ${orderedSections.map(section => renderSection(section)).join('\n')}
                </div>
            </body>
        </html>
    </xsl:template>

    ${orderedSections.map(section => sectionXslTemplate(section, docTitle)).join('\n')}
</xsl:stylesheet>`;
};

/** Section için inline HTML render (legacy generateXSLT'ye benzer, position:absolute kullanmaz). */
function renderSection(section: Section): string {
    const cls = `ed-${kebab(section.id)}`;
    const elementsHtml = section.elements.map(renderElement).join('\n');
    return `<div class="ed-section ${cls}">\n${elementsHtml}\n</div>`;
}

/** Her section için <xsl:template match="..."> üretir. Repeating ise <xsl:for-each> kullanır. */
function sectionXslTemplate(section: Section, docTitle: string): string {
    if (section.repeating && section.xpath) {
        // MasterData gibi: döngü
        return `
    <xsl:template match="${section.xpath}">
        <div class="ed-master-row">
            ${section.elements.map(renderElementXslt).join('\n')}
        </div>
    </xsl:template>`;
    }
    // Tek seferlik section — şu an stub (Phase 14'ün ilerleyen commitlerinde iç doldurulur)
    return `<!-- ${section.id} -->`;
}

function renderElement(el: DesignElement): string {
    if (el.type === 'text') return `<div>${el.content}</div>`;
    if (el.type === 'formula') return `<strong>{\${el.content}}</strong>`;
    if (el.type === 'image' || el.type === 'img') return `<img src="${(el as any).src || ''}" />`;
    if (el.type === 'table' && el.tableData) {
        return `<table>${el.tableData.map(r => `<tr>${r.map(c => `<td>${c.content}</td>`).join('')}</tr>`).join('')}</table>`;
    }
    if (el.type === 'shape' && el.shapeType === 'rect') return `<div style="border:1px solid #333; padding:4px;"></div>`;
    return `<div data-el-id="${el.id}"></div>`;
}

function renderElementXslt(el: DesignElement): string {
    if (el.type === 'text') return `<span>${el.content}</span>`;
    if (el.type === 'formula') return `<strong><xsl:value-of select="${el.content}"/></strong>`;
    return `<xsl:value-of select="${el.binding || '.'}"/>`;
}

function kebab(s: string): string {
    return s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

function docTitleFor(docType: string): string {
    return docType === 'arsiv' ? 'e-Arşiv Fatura' :
        docType === 'mikro' ? 'Mikro İhracat Faturası' :
        docType === 'net' ? 'İnternet Satış Faturası' :
        docType === 'yolcu' ? 'Yolcu Beraber İhracat' :
        docType === 'ihracat' ? 'e-İhracat Faturası' :
        'e-Fatura';
}

// ============================================================================
// Existing legacy generateXSLT — geriye uyumlu (canvas-pixel-position)
// ============================================================================
export const generateXSLT = (state: DesignState, docType: string = 'fatura'): string => {
  const elementsXsl = state.elements.map(el => {
    let content = '';
    if (el.type === 'text') {
      content = `<span>${el.content}</span>`;
    } else if (el.type === 'formula') {
      content = `<strong><xsl:value-of select="${el.content}"/></strong>`;
    } else if (el.type === 'table') {
      content = `
        <table id="lineTable" style="width:100%; border-collapse:collapse; margin-top:10px;">
          <thead>
            <tr style="background-color:#f0f0f0;">
              <th style="border:1px solid #666; padding:5px;">Sıra No</th>
              <th style="border:1px solid #666; padding:5px;">Mal/Hizmet Cinsi</th>
              <th style="border:1px solid #666; padding:5px;">Miktar</th>
              <th style="border:1px solid #666; padding:5px;">Birim Fiyat</th>
              <th style="border:1px solid #666; padding:5px;">Tutar</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="//cac:InvoiceLine">
              <tr>
                <td style="border:1px solid #666; padding:5px; text-align:center;"><xsl:value-of select="cbc:ID"/></td>
                <td style="border:1px solid #666; padding:5px;"><xsl:value-of select="cac:Item/cbc:Name"/></td>
                <td style="border:1px solid #666; padding:5px; text-align:right;"><xsl:value-of select="cbc:InvoicedQuantity"/></td>
                <td style="border:1px solid #666; padding:5px; text-align:right;"><xsl:value-of select="cac:Price/cbc:PriceAmount"/></td>
                <td style="border:1px solid #666; padding:5px; text-align:right;"><xsl:value-of select="cbc:LineExtensionAmount"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      `;
    }

    return `
      <div style="position:absolute; left:${el.x}px; top:${el.y}px;">
        ${content}
      </div>
    `;
  }).join('');

  const docTitle = docType === 'arsiv' ? 'e-Arşiv Fatura' :
    docType === 'mikro' ? 'Mikro İhracat Faturası' :
      docType === 'net' ? 'İnternet Satış Faturası' :
        docType === 'yolcu' ? 'Yolcu Beraber İhracat' :
          docType === 'ihracat' ? 'e-İhracat Faturası' : 'e-Fatura';

  return `<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
                xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
                xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
    <xsl:output method="html" indent="yes" encoding="UTF-8" />
    <xsl:template match="/">
        <html>
            <head>
                <style type="text/css">
                    body { font-family: 'Tahoma', sans-serif; font-size: 11px; color: #333; width: 750px; }
                    #main-container { border-top: 2px solid #000099; padding-top: 10px; position: relative; min-height: 1000px; }
                    #header-table { width: 100%; border-bottom: 2px solid #000099; padding-bottom: 20px; margin-bottom: 20px; }
                    .company-name { font-size: 16px; font-weight: bold; color: #000; }
                    .property-label { font-weight: bold; width: 80px; display: inline-block; }
                </style>
            </head>
            <body>
                <div id="main-container">
                    <table id="header-table">
                        <tr>
                            <td style="width:150px; vertical-align:top;">
                                ${state.logoUrl ? `<img src="${state.logoUrl}" style="max-width:150px;" />` : ''}
                            </td>
                            <td style="vertical-align:top; padding-left:20px;">
                                <div class="company-name">${state.companyName}</div>
                                <div style={{marginTop: '10px'}}>
                                    <div><span class="property-label">ADRES</span>: Ankara, Türkiye</div>
                                    <div><span class="property-label">VKN</span>: 1234567890</div>
                                </div>
                            </td>
                            <td style="width:200px; text-align:right; vertical-align:top;">
                                <h1 style="margin:0; font-size:24px;">${docTitle}</h1>
                            </td>
                        </tr>
                    </table>
                    
                    ${elementsXsl}
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>`;
};
