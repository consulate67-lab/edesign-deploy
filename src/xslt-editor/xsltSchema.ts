/**
 * XSLT Schema — Sprint 8 Aşama 2 (2026-10-03)
 *
 * Monaco'ya XSLT özel completion provider için kullanılan XSLT 1.0 element
 * ve attribute listesi. UBL-TR namespace'leri için de XPath yardımcıları.
 *
 * XSLT 1.0 spec'ten alınmıştır (W3C Recommendation 16 November 1999).
 * Modern tarayıcılar 1.0 destekler; 2.0/3.0 için özel config gerekir.
 */

// ═══════════════════════════════════════════════════════════════════════════
// XSLT 1.0 Element Definitions
// ═══════════════════════════════════════════════════════════════════════════

export interface XsltElementDef {
    /** Element adı (örn: "value-of") */
    name: string;
    /** Tam isim (xsl:value-of) — completion label olarak kullanılır */
    fullName: string;
    /** Kısa açıklama */
    description: string;
    /** Yaygın attribute'ler (snippet sırasına göre) */
    commonAttrs: string[];
    /** Empty element mi? (Hiç child içermez — otomatik </tag> ekleme) */
    empty: boolean;
}

export const XSLT_ELEMENTS: XsltElementDef[] = [
    // Yapısal
    {
        name: 'stylesheet', fullName: 'xsl:stylesheet',
        description: 'XSLT ana kök elementi. version ve xmlns:xsl zorunlu.',
        commonAttrs: ['version', 'xmlns:xsl', 'xmlns:cac', 'xmlns:cbc', 'exclude-result-prefixes'],
        empty: false,
    },
    {
        name: 'template', fullName: 'xsl:template',
        description: 'Bir pattern eşleştiğinde çalışan şablon.',
        commonAttrs: ['match', 'name', 'mode', 'priority'],
        empty: false,
    },
    {
        name: 'apply-templates', fullName: 'xsl:apply-templates',
        description: 'Seçili node\'lara eşleşen template\'i uygula.',
        commonAttrs: ['select', 'mode'],
        empty: true,
    },
    {
        name: 'call-template', fullName: 'xsl:call-template',
        description: 'İsimle belirtilmiş template\'i çağır.',
        commonAttrs: ['name'],
        empty: false,
    },
    {
        name: 'param', fullName: 'xsl:param',
        description: 'Template parametresi.',
        commonAttrs: ['name', 'select'],
        empty: false,
    },
    {
        name: 'with-param', fullName: 'xsl:with-param',
        description: 'call-template veya apply-templates\'e parametre geç.',
        commonAttrs: ['name', 'select'],
        empty: false,
    },
    {
        name: 'variable', fullName: 'xsl:variable',
        description: 'Yerel değişken tanımla.',
        commonAttrs: ['name', 'select'],
        empty: false,
    },

    // Döngü
    {
        name: 'for-each', fullName: 'xsl:for-each',
        description: 'Seçili node\'lar üzerinde döngü.',
        commonAttrs: ['select'],
        empty: false,
    },
    {
        name: 'sort', fullName: 'xsl:sort',
        description: 'for-each içinde sıralama.',
        commonAttrs: ['select', 'data-type', 'order', 'case-order'],
        empty: true,
    },

    // Koşul
    {
        name: 'if', fullName: 'xsl:if',
        description: 'Basit koşul — sadece doğruysa çalışır.',
        commonAttrs: ['test'],
        empty: false,
    },
    {
        name: 'choose', fullName: 'xsl:choose',
        description: 'Çoklu koşul bloğu aç.',
        commonAttrs: [],
        empty: false,
    },
    {
        name: 'when', fullName: 'xsl:when',
        description: 'Koşul — choose içinde. İlk doğru olan çalışır.',
        commonAttrs: ['test'],
        empty: false,
    },
    {
        name: 'otherwise', fullName: 'xsl:otherwise',
        description: 'Tüm when\'ler yanlışsa çalışır — choose sonunda.',
        commonAttrs: [],
        empty: false,
    },

    // Çıktı
    {
        name: 'value-of', fullName: 'xsl:value-of',
        description: 'XPath ifadesinin değerini yaz.',
        commonAttrs: ['select', 'disable-output-escaping'],
        empty: true,
    },
    {
        name: 'copy-of', fullName: 'xsl:copy-of',
        description: 'Node\'un derin kopyasını yapıştır.',
        commonAttrs: ['select'],
        empty: true,
    },
    {
        name: 'element', fullName: 'xsl:element',
        description: 'Dinamik isimle element oluştur.',
        commonAttrs: ['name', 'namespace'],
        empty: false,
    },
    {
        name: 'attribute', fullName: 'xsl:attribute',
        description: 'Dinamik isimle attribute ekle.',
        commonAttrs: ['name', 'namespace'],
        empty: false,
    },
    {
        name: 'text', fullName: 'xsl:text',
        description: 'Ham metin çıktısı (whitespace korunur).',
        commonAttrs: ['disable-output-escaping'],
        empty: false,
    },
    {
        name: 'comment', fullName: 'xsl:comment',
        description: 'HTML/XML yorumu oluştur.',
        commonAttrs: [],
        empty: false,
    },

    // Stil/Meta
    {
        name: 'output', fullName: 'xsl:output',
        description: 'Çıktı formatı (method, encoding, doctype).',
        commonAttrs: ['method', 'version', 'encoding', 'doctype-public', 'indent'],
        empty: true,
    },
    {
        name: 'import', fullName: 'xsl:import',
        description: 'Başka bir XSLT stilini içe aktar (stylesheet altında, en başta).',
        commonAttrs: ['href'],
        empty: true,
    },
    {
        name: 'include', fullName: 'xsl:include',
        description: 'XSLT stilini dahil et (import\'tan sonra).',
        commonAttrs: ['href'],
        empty: true,
    },
    {
        name: 'strip-space', fullName: 'xsl:strip-space',
        description: 'Boşlukları koruma — belirtilen element\'lerden.',
        commonAttrs: ['elements'],
        empty: true,
    },
    {
        name: 'preserve-space', fullName: 'xsl:preserve-space',
        description: 'Boşlukları koru — belirtilen element\'lerde.',
        commonAttrs: ['elements'],
        empty: true,
    },

    // Diğer
    {
        name: 'number', fullName: 'xsl:number',
        description: 'Sayaç veya liste numarası oluştur.',
        commonAttrs: ['value', 'format', 'level', 'count', 'from'],
        empty: true,
    },
    {
        name: 'key', fullName: 'xsl:key',
        description: 'Anahtar tanımla — key() fonksiyonu için.',
        commonAttrs: ['name', 'match', 'use'],
        empty: true,
    },
    {
        name: 'message', fullName: 'xsl:message',
        description: 'Test/debug mesajı.',
        commonAttrs: ['terminate'],
        empty: false,
    },
    {
        name: 'fallback', fullName: 'xsl:fallback',
        description: 'XSLT 2.0/3.0 yoksa çalışacak fallback.',
        commonAttrs: [],
        empty: false,
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// UBL-TR Common XPath snippets (XPath autocomplete için)
// ═══════════════════════════════════════════════════════════════════════════

export interface UblXPath {
    /** Tam XPath (örn: "//cbc:ID") */
    xpath: string;
    /** Kısa açıklama */
    description: string;
}

/**
 * En sık karşılaşılan 30 UBL-TR XPath — cac:/cbc: namespace'leri.
 * XSLT select="..." içinde otomatik önerilir.
 */
export const UBL_XPATHS: UblXPath[] = [
    // cbc: — temel alanlar
    { xpath: 'cbc:ID',                              description: 'Belge numarası (örn: fatura ID)' },
    { xpath: 'cbc:IssueDate',                       description: 'Düzenleme tarihi (YYYY-MM-DD)' },
    { xpath: 'cbc:IssueTime',                       description: 'Düzenleme saati (HH:MM:SS)' },
    { xpath: 'cbc:InvoiceTypeCode',                 description: 'Fatura tipi (SATIS/IADE)' },
    { xpath: 'cbc:DocumentCurrencyCode',            description: 'Para birimi (TRY/USD/EUR)' },
    { xpath: 'cbc:TaxAmount',                       description: 'KDV tutarı' },
    { xpath: 'cbc:LineExtensionAmount',             description: 'Satır toplamı (KDV hariç)' },
    { xpath: 'cbc:TaxExclusiveAmount',              description: 'Vergi hariç toplam' },
    { xpath: 'cbc:TaxInclusiveAmount',              description: 'Vergi dahil toplam' },
    { xpath: 'cbc:PayableAmount',                   description: 'Ödenecek tutar' },
    { xpath: 'cbc:UUID',                            description: 'ETTN (UUID)' },
    { xpath: 'cbc:Note',                            description: 'Not (fatura başlığı, banka bilgisi)' },
    { xpath: 'cbc:Name',                            description: 'İsim (Party Name, Item Name)' },
    { xpath: 'cbc:StreetName',                      description: 'Sokak adresi' },
    { xpath: 'cbc:CityName',                        description: 'Şehir' },

    // cac: — aggregate
    { xpath: 'cac:AccountingSupplierParty',         description: 'Tedarikçi tarafı (satıcı)' },
    { xpath: 'cac:AccountingCustomerParty',         description: 'Müşteri tarafı (alıcı)' },
    { xpath: 'cac:Party',                           description: 'Taraf (tedarikçi/müşteri detayı)' },
    { xpath: 'cac:PartyName',                       description: 'Taraf adı' },
    { xpath: 'cac:PartyIdentification',              description: 'Taraf kimlik (VKN/TCKN)' },
    { xpath: 'cac:PartyTaxScheme',                  description: 'Vergi şeması' },
    { xpath: 'cac:PostalAddress',                   description: 'Posta adresi' },
    { xpath: 'cac:TaxScheme',                       description: 'Vergi şeması' },
    { xpath: 'cac:TaxTotal',                        description: 'Toplam vergi' },
    { xpath: 'cac:LegalMonetaryTotal',              description: 'Yasal parasal toplam' },
    { xpath: 'cac:InvoiceLine',                     description: 'Fatura satırı (ürün/hizmet)' },
    { xpath: 'cac:Item',                            description: 'Ürün/hizmet' },
    { xpath: 'cac:Price',                           description: 'Fiyat' },
    { xpath: 'cac:TaxSubtotal',                     description: 'Vergi alt toplamı' },
    { xpath: 'cac:TaxCategory',                     description: 'Vergi kategorisi' },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lint Rules
// ═══════════════════════════════════════════════════════════════════════════

export interface LintIssue {
    lineNumber: number;
    column: number;
    endLineNumber: number;
    endColumn: number;
    message: string;
    severity: 'warning' | 'error' | 'info';
}

/**
 * XSLT içeriği lint et — basit ama yararlı kontroller.
 * 1. Deprecated: disable-output-escaping (modern tarayıcılarda yok)
 * 2. Tag balance: açılan tag kapanmamış → warning
 */
export function lintXslt(content: string): LintIssue[] {
    const issues: LintIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
        const lineNum = idx + 1;

        // 1. Deprecated: disable-output-escaping
        const doeMatch = line.match(/disable-output-escaping\s*=\s*["']yes["']/i);
        if (doeMatch) {
            const col = line.indexOf('disable-output-escaping') + 1;
            issues.push({
                lineNumber: lineNum,
                column: col,
                endLineNumber: lineNum,
                endColumn: col + 25,
                message: 'disable-output-escaping="yes" modern tarayıcılarda yok sayılır (deprecated). Kullanmaktan kaçın.',
                severity: 'warning',
            });
        }

        // 2. Deprecated: xsl:import (xsl:include önerilir)
        if (/<xsl:import\b/.test(line)) {
            const col = line.indexOf('<xsl:import') + 1;
            issues.push({
                lineNumber: lineNum,
                column: col,
                endLineNumber: lineNum,
                endColumn: col + 11,
                message: 'xsl:import yerine xsl:include kullan (aynı precedence, daha okunaklı).',
                severity: 'info',
            });
        }

        // 3. Format-number eksik argüman (basit: , '#,##0.00' ile bitmeli)
        const formatMatch = line.match(/format-number\(([^)]*)\)/);
        if (formatMatch && formatMatch[1]) {
            const args = formatMatch[1].split(',').length;
            if (args < 2) {
                const col = line.indexOf('format-number') + 1;
                issues.push({
                    lineNumber: lineNum,
                    column: col,
                    endLineNumber: lineNum,
                    endColumn: col + 13,
                    message: 'format-number 2 veya 3 argüman almalı (value, pattern [, decimal-format-name]).',
                    severity: 'warning',
                });
            }
        }
    });

    // 4. Tag balance: stack-based basit kontrol (comment içi tag'leri saymaz)
    const tagStack: Array<{ name: string; line: number; col: number }> = [];
    let inComment = false;

    lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        // Basit yorum tespiti — <xsl:comment> ile <!-- --> karışır
        const commentOpen = /<!--/.exec(line);
        const commentClose = /-->/.exec(line);
        // ... çok karmaşık, basit versiyon:
        // <xsl:comment>içerik</xsl:comment> → skip
        // <!-- ile --> comment

        let cursor = 0;
        while (cursor < line.length) {
            const ltIdx = line.indexOf('<', cursor);
            if (ltIdx === -1) break;
            const closeIdx = line.indexOf('>', ltIdx);
            if (closeIdx === -1) break;

            const tag = line.substring(ltIdx + 1, closeIdx).trim();

            // Comment tag'i
            if (tag.startsWith('!--')) {
                cursor = closeIdx + 1;
                continue;
            }

            // Self-closing veya xsl:stylesheet/version gibi kapanmayan tag'ler
            const isSelfClosing = tag.endsWith('/');
            const tagParts = tag.replace(/\/$/, '').split(/\s+/);
            const tagName = tagParts[0];
            const isXslElement = tagName.startsWith('xsl:');

            if (!isSelfClosing && isXslElement) {
                // Açılış tag'i (closing tag değil)
                if (!tagName.startsWith('/')) {
                    tagStack.push({ name: tagName, line: lineNum, col: ltIdx + 1 });
                } else {
                    // Kapanış tag'i
                    const openTag = tagName.substring(1);
                    const top = tagStack[tagStack.length - 1];
                    if (top && top.name === openTag) {
                        tagStack.pop();
                    } else {
                        // Yanlış kapanış — bulunamazsa warning
                        issues.push({
                            lineNumber: lineNum,
                            column: ltIdx + 1,
                            endLineNumber: lineNum,
                            endColumn: closeIdx + 1,
                            message: `Beklenmeyen kapanış tag'i: </${openTag}>. Açılış: <${top?.name || 'yok'}>.`,
                            severity: 'warning',
                        });
                    }
                }
            }

            cursor = closeIdx + 1;
        }
    });

    // Kapanmamış tag'ler
    tagStack.forEach(unclosed => {
        issues.push({
            lineNumber: unclosed.line,
            column: unclosed.col,
            endLineNumber: unclosed.line,
            endColumn: unclosed.col + unclosed.name.length + 1,
            message: `Açılış tag'i kapatılmamış: <${unclosed.name}>.`,
            severity: 'error',
        });
    });

    return issues;
}