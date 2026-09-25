<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="cac cbc">

    <xsl:output method="html" encoding="UTF-8" indent="yes"/>
    <xsl:strip-space elements="*"/>

    <!-- Yardimci: Para formatla (TR) -->
    <xsl:template name="fmt-money">
        <xsl:param name="val" select="'0'"/>
        <xsl:value-of select="format-number($val, '#,##0.00')"/> TL
    </xsl:template>

    <!-- Yardimci: Tarih formatla (TR DD-MM-YYYY) -->
    <xsl:template name="fmt-date">
        <xsl:param name="val" select="''"/>
        <xsl:if test="$val != ''">
            <xsl:variable name="yyyy" select="substring($val, 1, 4)"/>
            <xsl:variable name="mm" select="substring($val, 6, 2)"/>
            <xsl:variable name="dd" select="substring($val, 9, 2)"/>
            <xsl:value-of select="concat($dd, '-', $mm, '-', $yyyy)"/>
        </xsl:if>
    </xsl:template>

    <!-- Yardimci: Saat formatla (HH:MM:SS) -->
    <xsl:template name="fmt-time">
        <xsl:param name="val" select="''"/>
        <xsl:if test="$val != ''">
            <xsl:variable name="hh" select="substring($val, 1, 2)"/>
            <xsl:variable name="mi" select="substring($val, 4, 2)"/>
            <xsl:variable name="ss" select="substring($val, 7, 2)"/>
            <xsl:value-of select="concat($hh, ':', $mi, ':', $ss)"/>
        </xsl:if>
    </xsl:template>

    <!-- Ana sablon -->
    <xsl:template match="/">
        <html>
            <head>
                <meta charset="UTF-8"/>
                <title>e-Fatura - <xsl:value-of select="//cbc:ID"/></title>
                <style>
                    @page { size: A4; margin: 12mm; }
                    * { box-sizing: border-box; }
                    html, body {
                        margin: 0; padding: 0;
                        font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
                        font-size: 10pt;
                        color: #000;
                        background: #fff;
                    }
                    .page { width: 210mm; min-height: 297mm; padding: 8mm; }
                    table { border-collapse: collapse; }

                    /* === HEADER === */
                    .header-top {
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 6mm;
                    }
                    .seller-info {
                        flex: 1.2;
                        padding-right: 4mm;
                    }
                    .seller-info .label {
                        font-size: 8pt;
                        letter-spacing: 1px;
                        color: #555;
                        margin-bottom: 1mm;
                    }
                    .seller-info .company {
                        font-size: 11pt;
                        font-weight: 700;
                        color: #1e3a8a;
                        margin-bottom: 2mm;
                    }
                    .seller-info .line {
                        font-size: 9pt;
                        line-height: 1.45;
                        color: #1f2937;
                    }
                    .gib-logo-wrap {
                        flex: 0.8;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: flex-start;
                    }
                    .gib-logo {
                        width: 28mm; height: 28mm;
                        border-radius: 50%;
                        background: radial-gradient(circle, #dc2626 0%, #991b1b 70%);
                        color: #fff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28pt;
                        font-weight: 800;
                        font-style: italic;
                        box-shadow: 0 2mm 4mm rgba(220, 38, 38, 0.3);
                    }
                    .doc-type {
                        margin-top: 3mm;
                        font-size: 16pt;
                        font-weight: 700;
                        color: #111;
                        text-align: center;
                        letter-spacing: 2px;
                    }

                    /* Belge bilgileri tablosu (sagda) */
                    .header-bottom {
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 2mm;
                    }
                    .customer-info {
                        flex: 1;
                        padding-right: 4mm;
                    }
                    .customer-info .sayin {
                        font-size: 9pt;
                        font-weight: 700;
                        letter-spacing: 1.5px;
                        color: #1e3a8a;
                        border-bottom: 1.5px solid #1e3a8a;
                        padding-bottom: 1mm;
                        margin-bottom: 2mm;
                        width: 60mm;
                    }
                    .customer-info .line {
                        font-size: 9pt;
                        line-height: 1.5;
                        color: #1f2937;
                    }
                    .doc-info-table {
                        flex: 0 0 78mm;
                        border: 1px solid #111;
                    }
                    .doc-info-table table {
                        width: 100%;
                    }
                    .doc-info-table td {
                        padding: 1.2mm 2.5mm;
                        font-size: 8.5pt;
                        border: 0.5px solid #111;
                    }
                    .doc-info-table td.label {
                        font-weight: 700;
                        background: #f1f5f9;
                        width: 42mm;
                    }

                    /* ETTN satiri */
                    .ettn-line {
                        font-size: 8.5pt;
                        margin: 2mm 0 3mm 0;
                        padding: 1.5mm 2mm;
                        background: #f8fafc;
                        border-left: 3px solid #1e3a8a;
                    }
                    .ettn-line .key {
                        font-weight: 700;
                        color: #1e3a8a;
                        margin-right: 2mm;
                    }

                    /* === URUN TABLOSU === */
                    .product-table {
                        width: 100%;
                        margin-top: 2mm;
                        border: 1.5px solid #111;
                    }
                    .product-table th, .product-table td {
                        border: 0.7px solid #111;
                        padding: 1.8mm 2mm;
                        font-size: 8.5pt;
                        text-align: center;
                        vertical-align: middle;
                    }
                    .product-table th {
                        background: #e2e8f0;
                        font-weight: 700;
                        color: #0f172a;
                    }
                    .product-table td.left { text-align: left; }
                    .product-table td.right { text-align: right; }
                    .product-table .qty-cell .val {
                        display: block;
                        font-weight: 600;
                    }
                    .product-table .qty-cell .unit {
                        display: block;
                        font-size: 7.5pt;
                        color: #475569;
                    }
                    .product-table tbody tr:nth-child(even) {
                        background: #fafafa;
                    }
                    .product-table .empty-row td {
                        height: 5mm;
                    }

                    /* === TOPLAMLAR (sag alt) === */
                    .totals-wrap {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 2mm;
                    }
                    .totals-table {
                        width: 80mm;
                        border: 1.5px solid #111;
                    }
                    .totals-table td {
                        padding: 1.8mm 3mm;
                        font-size: 9pt;
                        border: 0.7px solid #111;
                    }
                    .totals-table td.label {
                        font-weight: 700;
                        background: #f1f5f9;
                        width: 50mm;
                    }
                    .totals-table td.val {
                        text-align: right;
                        font-weight: 600;
                    }
                    .totals-table tr.grand td {
                        background: #1e3a8a;
                        color: #fff;
                        font-weight: 800;
                        font-size: 10pt;
                    }
                    .totals-table tr.grand td.val { text-align: right; }

                    /* === NOTLAR === */
                    .notes {
                        margin-top: 4mm;
                        padding-top: 2mm;
                        border-top: 1px dashed #999;
                        font-size: 8.5pt;
                    }
                    .notes .label {
                        font-weight: 700;
                        color: #1e3a8a;
                    }
                    .notes .under {
                        text-decoration: underline;
                    }

                    /* === IMZA BLOGU === */
                    .signatures {
                        display: flex;
                        gap: 4mm;
                        margin-top: 6mm;
                    }
                    .sig-box {
                        flex: 1;
                        border: 1px solid #94a3b8;
                        border-radius: 4px;
                        padding: 3mm;
                        text-align: center;
                        background: #fafbfc;
                    }
                    .sig-box .role {
                        font-size: 8.5pt;
                        font-weight: 700;
                        color: #475569;
                        margin-bottom: 8mm;
                        letter-spacing: 1px;
                    }
                    .sig-box .name {
                        font-size: 9pt;
                        border-top: 1px solid #94a3b8;
                        padding-top: 1.5mm;
                    }
                    .gib-stamp {
                        flex: 1;
                        border: 3px solid #1e3a8a;
                        border-radius: 6px;
                        padding: 4mm;
                        text-align: center;
                        background: linear-gradient(135deg, #eff6ff 0%, #fff 100%);
                    }
                    .gib-stamp .title {
                        font-size: 11pt;
                        font-weight: 800;
                        color: #1e3a8a;
                        letter-spacing: 1px;
                    }
                    .gib-stamp .sub {
                        font-size: 8pt;
                        color: #64748b;
                        margin: 1mm 0 2mm 0;
                    }
                    .gib-stamp .qr-placeholder {
                        width: 30mm; height: 30mm;
                        margin: 2mm auto;
                        border: 2px dashed #94a3b8;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 7pt;
                        color: #94a3b8;
                    }
                    .gib-stamp .body {
                        font-size: 7.5pt;
                        color: #475569;
                        line-height: 1.5;
                    }

                    /* Print */
                    @media print {
                        .page { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="page">

                    <!-- ====================== HEADER ====================== -->
                    <div class="header-top">
                        <!-- Sol: Satici bilgileri -->
                        <div class="seller-info">
                            <div class="label">AYDIN ÖZEL ENTEGRASYON</div>
                            <div class="company">
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
                            </div>
                            <div class="line">
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:StreetName"/><br/>
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CityName"/>/<xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CountrySubentity"/><br/>
                                Tel: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:Telephone"/><br/>
                                Fax: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:Telefax"/><br/>
                                E-Posta: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:ElectronicMail"/><br/>
                                Web Sitesi: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:WebsiteURI"/><br/>
                                Vergi Dairesi: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/><br/>
                                VKN: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"/>
                            </div>
                        </div>

                        <!-- Orta: GIB logosu -->
                        <div class="gib-logo-wrap">
                            <div class="gib-logo">Gİ</div>
                            <div class="doc-type">e-FATURA</div>
                        </div>
                    </div>

                    <!-- Belge bilgileri + Musteri -->
                    <div class="header-bottom">
                        <!-- Sol: Musteri -->
                        <div class="customer-info">
                            <div class="sayin">SAYIN</div>
                            <div class="line">
                                <strong><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/></strong> /
                                <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:StreetName"/><br/>
                                Web Sitesi: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:WebsiteURI"/><br/>
                                E-Posta: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail"/><br/>
                                Tel: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telephone"/><br/>
                                Fax: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telefax"/><br/>
                                Vergi Dairesi: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/><br/>
                                VKN: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"/>
                            </div>
                        </div>

                        <!-- Sag: Belge bilgileri tablosu -->
                        <div class="doc-info-table">
                            <table>
                                <tr>
                                    <td class="label">Özelleştirme No:</td>
                                    <td><xsl:value-of select="//cbc:CustomizationID"/></td>
                                </tr>
                                <tr>
                                    <td class="label">Senaryo:</td>
                                    <td><xsl:value-of select="//cbc:InvoiceTypeCode"/></td>
                                </tr>
                                <tr>
                                    <td class="label">Fatura Tipi:</td>
                                    <td><xsl:value-of select="//cac:InvoiceType/cbc:Name"/></td>
                                </tr>
                                <tr>
                                    <td class="label">Fatura No:</td>
                                    <td><xsl:value-of select="//cbc:ID"/></td>
                                </tr>
                                <tr>
                                    <td class="label">Fatura Tarihi:</td>
                                    <td><xsl:call-template name="fmt-date"><xsl:with-param name="val" select="//cbc:IssueDate"/></xsl:call-template></td>
                                </tr>
                                <tr>
                                    <td class="label">Fatura Saati:</td>
                                    <td><xsl:call-template name="fmt-time"><xsl:with-param name="val" select="//cbc:IssueTime"/></xsl:call-template></td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- ETTN satiri -->
                    <div class="ettn-line">
                        <span class="key">ETTN:</span>
                        <xsl:value-of select="//cbc:UUID"/>
                    </div>

                    <!-- ====================== URUN TABLOSU ====================== -->
                    <table class="product-table">
                        <thead>
                            <tr>
                                <th style="width:7mm">Sıra No</th>
                                <th style="width:18mm">Ürün Kodu</th>
                                <th>Mal/Hizmet</th>
                                <th style="width:14mm">Miktar</th>
                                <th style="width:18mm">Birim Fiyat</th>
                                <th style="width:14mm">İskonto Oranı</th>
                                <th style="width:14mm">İskonto Tutarı</th>
                                <th style="width:12mm">KDV Oranı</th>
                                <th style="width:14mm">KDV Tutarı</th>
                                <th style="width:14mm">Diğer Vergiler</th>
                                <th style="width:18mm">Mal Hizmet Tutarı</th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="//cac:InvoiceLine">
                                <tr>
                                    <td><xsl:value-of select="position()"/></td>
                                    <td class="left"><xsl:value-of select="cac:Item/cac:SellersItemIdentification/cbc:ID"/></td>
                                    <td class="left"><xsl:value-of select="cac:Item/cbc:Description"/></td>
                                    <td class="qty-cell">
                                        <span class="val"><xsl:value-of select="format-number(cbc:InvoicedQuantity, '#,##0.0')"/></span>
                                        <span class="unit"><xsl:value-of select="cbc:InvoicedQuantity/@unitCode"/></span>
                                    </td>
                                    <td class="right">
                                        <xsl:call-template name="fmt-money">
                                            <xsl:with-param name="val" select="cac:Price/cbc:PriceAmount"/>
                                        </xsl:call-template>
                                    </td>
                                    <td class="right">
                                        <xsl:choose>
                                            <xsl:when test="cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:MultiplierFactorNumeric">
                                                %<xsl:value-of select="format-number(cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:MultiplierFactorNumeric * 100, '#,##0.00')"/>
                                            </xsl:when>
                                            <xsl:otherwise>-</xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td class="right">
                                        <xsl:choose>
                                            <xsl:when test="cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:Amount">
                                                <xsl:call-template name="fmt-money">
                                                    <xsl:with-param name="val" select="cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:Amount"/>
                                                </xsl:call-template>
                                            </xsl:when>
                                            <xsl:otherwise>-</xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td>%<xsl:value-of select="cac:TaxTotal/cac:TaxSubtotal/cbc:Percent"/></td>
                                    <td class="right">
                                        <xsl:call-template name="fmt-money">
                                            <xsl:with-param name="val" select="cac:TaxTotal/cac:TaxSubtotal/cbc:TaxAmount"/>
                                        </xsl:call-template>
                                    </td>
                                    <td class="right">-</td>
                                    <td class="right">
                                        <xsl:call-template name="fmt-money">
                                            <xsl:with-param name="val" select="cbc:LineExtensionAmount"/>
                                        </xsl:call-template>
                                    </td>
                                </tr>
                            </xsl:for-each>

                            <!-- Bos satirlar (15'e tamamla, GIB formal gorunum) -->
                            <xsl:call-template name="empty-rows">
                                <xsl:with-param name="count" select="15 - count(//cac:InvoiceLine)"/>
                            </xsl:call-template>
                        </tbody>
                    </table>

                    <!-- ====================== TOPLAMLAR ====================== -->
                    <div class="totals-wrap">
                        <table class="totals-table">
                            <tr>
                                <td class="label">Mal Hizmet Toplam Tutarı</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:LegalMonetaryTotal/cbc:LineExtensionAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr>
                                <td class="label">Toplam İskonto</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr>
                                <td class="label">Toplam Masraf</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:LegalMonetaryTotal/cbc:ChargeTotalAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr>
                                <td class="label">Hesaplanan KDV(%<xsl:value-of select="//cac:TaxTotal/cac:TaxSubtotal/cbc:Percent"/>)</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:TaxTotal/cbc:TaxAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr class="grand">
                                <td class="label">Vergiler Dahil Toplam Tutar</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr class="grand">
                                <td class="label">Ödenecek Tutar</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:LegalMonetaryTotal/cbc:PayableAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- ====================== NOTLAR ====================== -->
                    <div class="notes">
                        <xsl:choose>
                            <xsl:when test="//cbc:Note">
                                <xsl:for-each select="//cbc:Note">
                                    <p>
                                        <span class="label">Not:</span> <span class="under"><xsl:value-of select="."/></span>
                                    </p>
                                </xsl:for-each>
                            </xsl:when>
                            <xsl:otherwise>
                                <p><span class="label">Not:</span> -</p>
                            </xsl:otherwise>
                        </xsl:choose>
                    </div>

                    <!-- ====================== IMZA BLOGU ====================== -->
                    <div class="signatures">
                        <!-- Satici imza -->
                        <div class="sig-box">
                            <div class="role">SATICI</div>
                            <div class="name">
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
                            </div>
                        </div>

                        <!-- GIB e-Fatura stami -->
                        <div class="gib-stamp">
                            <div class="title">e-FATURA</div>
                            <div class="sub">ELEKTRONİK İMZA / e-FATURA</div>
                            <div class="qr-placeholder">QR / İMZA ALANI</div>
                            <div class="body">
                                Bu belge <strong>5070 sayılı Elektronik İmza Kanunu</strong> ve
                                <strong>GİB e-Fatura Yönetmeliği</strong> gereği elektronik olarak
                                imzalanmıştır. Belge içeriği değiştirilemez; tahrifat halinde geçersizdir.
                                <br/><br/>
                                <strong>Belge No:</strong> <xsl:value-of select="//cbc:ID"/><br/>
                                <strong>İmza Tarihi:</strong> <xsl:call-template name="fmt-date"><xsl:with-param name="val" select="//cbc:IssueDate"/></xsl:call-template>
                                <xsl:text> </xsl:text>
                                <xsl:call-template name="fmt-time"><xsl:with-param name="val" select="//cbc:IssueTime"/></xsl:call-template>
                            </div>
                        </div>

                        <!-- Alici imza -->
                        <div class="sig-box">
                            <div class="role">ALICI</div>
                            <div class="name">
                                <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/>
                            </div>
                        </div>
                    </div>

                </div>
            </body>
        </html>
    </xsl:template>

    <!-- Bos satir ureteci (15'e tamamla) -->
    <xsl:template name="empty-rows">
        <xsl:param name="count" select="0"/>
        <xsl:param name="i" select="1"/>
        <xsl:if test="$i &lt;= $count">
            <tr class="empty-row">
                <td><xsl:value-of select="15 - $count + $i - 1"/></td>
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <xsl:call-template name="empty-rows">
                <xsl:with-param name="count" select="$count"/>
                <xsl:with-param name="i" select="$i + 1"/>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>

</xsl:stylesheet>
