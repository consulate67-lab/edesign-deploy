<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="cac cbc">

    <xsl:output method="html" encoding="UTF-8" indent="yes"/>
    <xsl:strip-space elements="*"/>

    <!-- Para formatla (TR: virgul, 2 ondalik) -->
    <xsl:template name="fmt-money">
        <xsl:param name="val" select="'0'"/>
        <xsl:value-of select="format-number($val, '#.##0,00')"/> TL
    </xsl:template>

    <!-- Tarih formatla (DD-MM-YYYY) -->
    <xsl:template name="fmt-date">
        <xsl:param name="val" select="''"/>
        <xsl:if test="$val != ''">
            <xsl:variable name="yyyy" select="substring($val, 1, 4)"/>
            <xsl:variable name="mm" select="substring($val, 6, 2)"/>
            <xsl:variable name="dd" select="substring($val, 9, 2)"/>
            <xsl:value-of select="concat($dd, '-', $mm, '-', $yyyy)"/>
        </xsl:if>
    </xsl:template>

    <!-- Saat formatla (HH:MM:SS) -->
    <xsl:template name="fmt-time">
        <xsl:param name="val" select="''"/>
        <xsl:if test="$val != ''">
            <xsl:variable name="hh" select="substring($val, 1, 2)"/>
            <xsl:variable name="mi" select="substring($val, 4, 2)"/>
            <xsl:variable name="ss" select="substring($val, 7, 2)"/>
            <xsl:value-of select="concat($hh, ':', $mi, ':', $ss)"/>
        </xsl:if>
    </xsl:template>

    <!-- KDV orani formatla (%18,00) -->
    <xsl:template name="fmt-percent">
        <xsl:param name="val" select="'0'"/>
        %<xsl:value-of select="format-number($val, '#0,00')"/>
    </xsl:template>

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
                        margin-bottom: 4mm;
                    }
                    .seller-info {
                        flex: 1.4;
                        padding-right: 4mm;
                    }
                    .seller-info .label {
                        font-size: 7.5pt;
                        letter-spacing: 0.5px;
                        color: #333;
                        margin-bottom: 0.5mm;
                    }
                    .seller-info .company {
                        font-size: 9pt;
                        font-weight: 400; /* Kalin degil, normal */
                        color: #000;
                        margin-bottom: 1.5mm;
                    }
                    .seller-info .line {
                        font-size: 8pt;
                        line-height: 1.35;
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
                        /* Placeholder text yok — sadece kirmizi daire */
                        box-shadow: 0 1mm 3mm rgba(220, 38, 38, 0.3);
                    }
                    .doc-type {
                        margin-top: 3mm;
                        font-size: 16pt;
                        font-weight: 700;
                        color: #111;
                        text-align: center;
                        letter-spacing: 2px;
                    }
                    /* Header altinda kalin siyah ayrac cizgisi */
                    .header-divider {
                        border-top: 2px solid #000;
                        margin: 3mm 0 3mm 0;
                    }

                    /* Belge bilgileri tablosu (sagda) */
                    .header-bottom {
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 3mm;
                    }
                    .customer-info {
                        flex: 1;
                        padding-right: 4mm;
                    }
                    .customer-info .sayin {
                        font-size: 8.5pt;
                        font-weight: 700;
                        letter-spacing: 1.5px;
                        color: #000;
                        border-bottom: 1.5px solid #000;
                        padding-bottom: 0.5mm;
                        margin-bottom: 1.5mm;
                        width: 60mm;
                    }
                    .customer-info .line {
                        font-size: 8pt;
                        line-height: 1.4;
                        color: #1f2937;
                    }
                    .customer-info .slash {
                        margin-left: 4mm;
                        color: #888;
                    }
                    .doc-info-table {
                        flex: 0 0 78mm;
                        border: 1px solid #000;
                    }
                    .doc-info-table table {
                        width: 100%;
                    }
                    .doc-info-table td {
                        padding: 0.8mm 2.5mm;
                        font-size: 8pt;
                        border: 0.5px solid #000;
                    }
                    .doc-info-table td.label {
                        font-weight: 700;
                        background: #fff;
                        width: 42mm;
                    }

                    /* ETTN satiri — kalin siyah ust-alt cerceve, beyaz bg */
                    .ettn-line {
                        font-size: 8pt;
                        margin: 2mm 0 3mm 0;
                        padding: 1.2mm 2mm;
                        background: #fff;
                        border-top: 1.5px solid #000;
                        border-bottom: 1.5px solid #000;
                    }
                    .ettn-line .key {
                        font-weight: 700;
                        color: #000;
                        margin-right: 2mm;
                    }

                    /* === URUN TABLOSU === */
                    .product-table {
                        width: 100%;
                        margin-top: 2mm;
                        border: 1.5px solid #000;
                    }
                    .product-table th, .product-table td {
                        border: 0.7px solid #000;
                        padding: 1.5mm 1.8mm;
                        font-size: 7.5pt;
                        text-align: center;
                        vertical-align: middle;
                    }
                    .product-table th {
                        background: #fff;
                        font-weight: 700;
                        color: #000;
                    }
                    .product-table td.left { text-align: left; }
                    .product-table td.right { text-align: right; }
                    .product-table .qty-cell .val {
                        display: block;
                        font-weight: 400;
                    }
                    .product-table .qty-cell .unit {
                        display: block;
                        font-size: 7pt;
                        color: #333;
                    }
                    .product-table .empty-row td {
                        height: 4.5mm;
                    }

                    /* === TOPLAMLAR (sag alt) — duz border, gradient yok === */
                    .totals-wrap {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 2mm;
                    }
                    .totals-table {
                        width: 80mm;
                        border: 1.5px solid #000;
                    }
                    .totals-table td {
                        padding: 1.5mm 3mm;
                        font-size: 8.5pt;
                        border: 0.7px solid #000;
                        font-weight: 400;
                    }
                    .totals-table td.label {
                        font-weight: 700;
                        background: #fff;
                        width: 50mm;
                    }
                    .totals-table td.val {
                        text-align: right;
                        font-weight: 400;
                    }

                    /* === NOTLAR === */
                    .notes {
                        margin-top: 4mm;
                        padding-top: 2mm;
                        border-top: 1px dashed #999;
                        font-size: 8pt;
                    }
                    .notes .label {
                        font-weight: 700;
                        color: #000;
                    }
                    .notes .under {
                        text-decoration: underline;
                    }
                    .notes p {
                        margin: 0 0 1.5mm 0;
                    }

                    /* === IMZA BLOGU — sadece 2 sutun (SATICI + ALICI), gradient GIB stami YOK === */
                    .signatures {
                        display: flex;
                        gap: 4mm;
                        margin-top: 6mm;
                    }
                    .sig-box {
                        flex: 1;
                        border: 1px solid #000;
                        padding: 3mm;
                        text-align: center;
                        background: #fff;
                    }
                    .sig-box .role {
                        font-size: 8pt;
                        font-weight: 700;
                        color: #000;
                        margin-bottom: 8mm;
                        letter-spacing: 1px;
                    }
                    .sig-box .name {
                        font-size: 8.5pt;
                        border-top: 0.7px solid #000;
                        padding-top: 1.5mm;
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
                        <div class="seller-info">
                            <div class="label">AYDIN ÖZEL ENTEGRASYON</div>
                            <div class="company">
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
                            </div>
                            <div class="line">
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>&#160;<xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CityName"/>/<xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CountrySubentity"/><br/>
                                Tel: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:Telephone"/>&#160;&#160;Fax: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:Telefax"/><br/>
                                E-Posta: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:ElectronicMail"/><br/>
                                Web Sitesi: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:WebsiteURI"/><br/>
                                Vergi Dairesi: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/><br/>
                                VKN: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"/>
                            </div>
                        </div>

                        <div class="gib-logo-wrap">
                            <div class="gib-logo"></div>
                            <div class="doc-type">e-FATURA</div>
                        </div>
                    </div>

                    <div class="header-divider"></div>

                    <!-- Belge bilgileri + Musteri -->
                    <div class="header-bottom">
                        <div class="customer-info">
                            <div class="sayin">SAYIN</div>
                            <div class="line">
                                <strong><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/></strong>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:StreetName">
                                    <span class="slash">/</span>
                                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>
                                </xsl:if>
                                <br/>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:WebsiteURI">Web Sitesi: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:WebsiteURI"/><br/></xsl:if>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail">E-Posta: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail"/><br/></xsl:if>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telephone">Tel: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telephone"/><br/></xsl:if>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telefax">Fax: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telefax"/><br/></xsl:if>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name">Vergi Dairesi: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/><br/></xsl:if>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID">VKN/TCKN: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"/></xsl:if>
                            </div>
                        </div>

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
                                <th style="width:14mm">KDV Oranı</th>
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
                                        <span class="val"><xsl:value-of select="format-number(cbc:InvoicedQuantity, '#0,0')"/></span>
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
                                                <xsl:call-template name="fmt-percent">
                                                    <xsl:with-param name="val" select="cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:MultiplierFactorNumeric * 100"/>
                                                </xsl:call-template>
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
                                    <td>
                                        <xsl:call-template name="fmt-percent">
                                            <xsl:with-param name="val" select="cac:TaxTotal/cac:TaxSubtotal/cbc:Percent"/>
                                        </xsl:call-template>
                                    </td>
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
                                <td class="label">Hesaplanan KDV(%<xsl:value-of select="format-number(//cac:TaxTotal/cac:TaxSubtotal/cbc:Percent, '#0,00')"/>)</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:TaxTotal/cbc:TaxAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr>
                                <td class="label">Vergiler Dahil Toplam Tutar</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr>
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
                        <div class="sig-box">
                            <div class="role">SATICI</div>
                            <div class="name">
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
                            </div>
                        </div>

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

    <!-- 15'e tamamlayan bos satirlar -->
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
