/**
 * XSLT Snippets — Sprint 8 Aşama 1 (2026-10-03)
 *
 * "Kod yazarak tasarım" yaklaşımını güçlendirmek için hazır XSLT snippet kütüphanesi.
 * Snippet tıklanınca editor'e Monaco'nun insertSnippet API'si ile yapıştırılır;
 * ${1:placeholder} formatı ile cursor konumları otomatik oluşur (Tab ile gezilir).
 *
 * Kategoriler:
 * - Yapı: xsl:template, xsl:apply-templates, xsl:param
 * - Döngü: xsl:for-each, sort
 * - Koşul: xsl:choose/when/otherwise, xsl:if
 * - Format: sayı (TR para), tarih, normalize-space
 * - Hesaplama: sum(), count(), KDV
 * - Tablo: tablo başlık, tablo satır, sayfa sonu
 */

export type SnippetCategory =
    | 'Yapı'
    | 'Döngü'
    | 'Koşul'
    | 'Format'
    | 'Hesaplama'
    | 'Tablo';

export interface XsltSnippet {
    id: string;
    category: SnippetCategory;
    /** Kısa başlık (sidebar liste) */
    label: string;
    /** Tooltip açıklaması */
    description: string;
    /**
     * Monaco snippet syntax: ${1:placeholder} formatı.
     * $0 son konum. ${1}, ${2}, ... sıralı placeholder'lar (Tab ile gezilir).
     */
    template: string;
    /**
     * Opsiyonel önizleme kısaltması (sidebar liste).
     * Verilmezse template'in ilk 60 karakteri kullanılır.
     */
    preview?: string;
}

// ============================================================================
// Snippet definitions (12 adet)
// ============================================================================

export const SNIPPETS: XsltSnippet[] = [
    // ------------------------------------------------------------------------
    // YAPI (2)
    // ------------------------------------------------------------------------
    {
        id: 'template-root',
        category: 'Yapı',
        label: 'xsl:template (root)',
        description: 'Kök template — tüm XML\'i kapsayan ana şablon.',
        template: `<xsl:template match="/\${1:Invoice}">
  <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        \${2:body { font-family: Tahoma; font-size: 11px; }}
      </style>
    </head>
    <body>
      \${0:<!-- İçerik -->}
    </body>
  </html>
</xsl:template>`,
        preview: '<xsl:template match="/Invoice">',
    },
    {
        id: 'template-with-param',
        category: 'Yapı',
        label: 'xsl:template + param',
        description: 'Parametre alan şablon — xsl:call-template ile çağrılır.',
        template: `<xsl:template name="\${1:sablon_adi}">
  <xsl:param name="\${2:degisken}">\${3:varsayilan}</xsl:param>
  \${0:<!-- İçerik -->}
</xsl:template>`,
        preview: '<xsl:template name="...">',
    },

    // ------------------------------------------------------------------------
    // DÖNGÜ (2)
    // ------------------------------------------------------------------------
    {
        id: 'for-each',
        category: 'Döngü',
        label: 'xsl:for-each',
        description: 'Seçili node\'lar üzerinde döngü.',
        template: `<xsl:for-each select="\${1:cbc:ID}">
  \${0:<!-- Döngü içeriği -->}
</xsl:for-each>`,
        preview: '<xsl:for-each select="...">',
    },
    {
        id: 'for-each-sort',
        category: 'Döngü',
        label: 'for-each + sort',
        description: 'Sıralı döngü (alfabetik/numerik).',
        template: `<xsl:for-each select="\${1:cac:InvoiceLine}">
  <xsl:sort select="\${2:cbc:ID}" data-type="\${3:number}"/>
  \${0:<!-- Sıralı içerik -->}
</xsl:for-each>`,
        preview: '<xsl:for-each><xsl:sort>',
    },

    // ------------------------------------------------------------------------
    // KOŞUL (2)
    // ------------------------------------------------------------------------
    {
        id: 'choose-when',
        category: 'Koşul',
        label: 'choose / when / otherwise',
        description: 'Çoklu koşul — ilk doğru when çalışır, yoksa otherwise.',
        template: `<xsl:choose>
  <xsl:when test="\${1:condition}">
    \${2:<!-- doğruysa -->}
  </xsl:when>
  <xsl:otherwise>
    \${3:<!-- yanlışsa -->}
  </xsl:otherwise>
</xsl:choose>`,
        preview: '<xsl:choose>',
    },
    {
        id: 'if',
        category: 'Koşul',
        label: 'xsl:if',
        description: 'Basit koşul — sadece doğruysa çalışır.',
        template: `<xsl:if test="\${1:condition}">
  \${0:<!-- doğruysa -->}
</xsl:if>`,
        preview: '<xsl:if test="...">',
    },

    // ------------------------------------------------------------------------
    // FORMAT (2)
    // ------------------------------------------------------------------------
    {
        id: 'format-number-tr',
        category: 'Format',
        label: 'Para formatı (TR)',
        description: 'Türk Lirası: 1.234,56 (binlik nokta, ondalık virgül).',
        template: `<xsl:value-of select="format-number(\${1:.}, '#,##0.00', 'tr_TR')"/>`,
        preview: 'format-number(. , tr_TR)',
    },
    {
        id: 'format-date',
        category: 'Format',
        label: 'Tarih formatı',
        description: 'UBL-TR tarihini GG.AA.YYYY formatına çevir.',
        template: `<xsl:value-of select="concat(
  substring(\${1:cbc:IssueDate}, 9, 2), '.',
  substring(\${1:cbc:IssueDate}, 6, 2), '.',
  substring(\${1:cbc:IssueDate}, 1, 4)
)"/>`,
        preview: 'concat(substring(...))',
    },

    // ------------------------------------------------------------------------
    // HESAPLAMA (2)
    // ------------------------------------------------------------------------
    {
        id: 'sum-tax',
        category: 'Hesaplama',
        label: 'KDV toplamı',
        description: 'Tüm satırların KDV toplamını hesapla.',
        template: `<xsl:value-of select="format-number(
  sum(//cac:TaxTotal/cbc:TaxAmount),
  '#,##0.00', 'tr_TR'
)"/>`,
        preview: 'sum(TaxTotal/TaxAmount)',
    },
    {
        id: 'line-extension',
        category: 'Hesaplama',
        label: 'Satır toplamı',
        description: 'InvoiceLine.LineExtensionAmount toplamı (KDV hariç tutar).',
        template: `<xsl:value-of select="format-number(
  sum(//cac:InvoiceLine/cbc:LineExtensionAmount),
  '#,##0.00', 'tr_TR'
)"/>`,
        preview: 'sum(LineExtensionAmount)',
    },

    // ------------------------------------------------------------------------
    // TABLO (2)
    // ------------------------------------------------------------------------
    {
        id: 'table-header-row',
        category: 'Tablo',
        label: 'Tablo başlık (th)',
        description: 'Standart fatura tablo başlığı: sıra, ürün, miktar, fiyat, KDV, tutar.',
        template: `<tr style="background:#f1f5f9; font-weight:bold;">
  <th style="padding:6px; text-align:left;">\${1:Sıra}</th>
  <th style="padding:6px; text-align:left;">\${2:Ürün/Hizmet}</th>
  <th style="padding:6px; text-align:right;">\${3:Miktar}</th>
  <th style="padding:6px; text-align:right;">\${4:Birim Fiyat}</th>
  <th style="padding:6px; text-align:right;">\${5:KDV %}</th>
  <th style="padding:6px; text-align:right;">\${6:Tutar}</th>
</tr>`,
        preview: '<tr><th>...</th></tr>',
    },
    {
        id: 'table-data-row',
        category: 'Tablo',
        label: 'Tablo satır (td)',
        description: 'InvoiceLine\'dan tek satır — xsl:for-each içinde kullanılır.',
        template: `<tr>
  <td style="padding:6px;"><xsl:value-of select="position()"/></td>
  <td style="padding:6px;"><xsl:value-of select="cac:Item/cbc:Name"/></td>
  <td style="padding:6px; text-align:right;"><xsl:value-of select="cbc:InvoicedQuantity"/></td>
  <td style="padding:6px; text-align:right;"><xsl:value-of select="format-number(cac:Price/cbc:PriceAmount, '#,##0.00', 'tr_TR')"/></td>
  <td style="padding:6px; text-align:right;">\${1:%18}</td>
  <td style="padding:6px; text-align:right;"><xsl:value-of select="format-number(cbc:LineExtensionAmount, '#,##0.00', 'tr_TR')"/></td>
</tr>`,
        preview: '<tr><xsl:value-of select="...">',
    },
];

// ============================================================================
// Helpers
// ============================================================================

export const SNIPPET_CATEGORIES: SnippetCategory[] = [
    'Yapı',
    'Döngü',
    'Koşul',
    'Format',
    'Hesaplama',
    'Tablo',
];

/**
 * Verilen kategorideki snippet'ları döndürür.
 */
export const getSnippetsByCategory = (category: SnippetCategory | 'all'): XsltSnippet[] => {
    if (category === 'all') return SNIPPETS;
    return SNIPPETS.filter(s => s.category === category);
};

/**
 * Kategori başına snippet sayısı (UI badge'ler için).
 */
export const getCategoryCounts = (): Record<SnippetCategory, number> => {
    const counts: Record<SnippetCategory, number> = {
        'Yapı': 0, 'Döngü': 0, 'Koşul': 0, 'Format': 0, 'Hesaplama': 0, 'Tablo': 0,
    };
    for (const s of SNIPPETS) counts[s.category]++;
    return counts;
};