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

    <!-- Phase 11.1: Fatura Tipi kodunu Turkce karsiligina cevir -->
    <xsl:template name="fmt-invoice-type">
        <xsl:param name="code" select="''"/>
        <xsl:choose>
            <xsl:when test="$code = 'SATIS'">SATIŞ</xsl:when>
            <xsl:when test="$code = 'IADE'">İADE</xsl:when>
            <xsl:when test="$code = 'TEMELFATURA'">TEMEL FATURA</xsl:when>
            <xsl:when test="$code = 'TICARIFATURA'">TİCARİ FATURA</xsl:when>
            <xsl:when test="$code = 'ISTISNA'">İSTİSNA</xsl:when>
            <xsl:when test="$code = 'IHRACAT'">İHRACAT</xsl:when>
            <xsl:when test="$code = 'IHRACATKAYITLI'">İHRACAT (KAYITLI)</xsl:when>
            <xsl:when test="$code = 'OZELMATRAHFAZLASIFATURA'">ÖZEL MATRAH FAZLASI FATURA</xsl:when>
            <xsl:otherwise><xsl:value-of select="$code"/></xsl:otherwise>
        </xsl:choose>
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
                        width: 32mm; height: 32mm;
                        border-radius: 50%;
                        overflow: hidden;
                        box-shadow: 0 1mm 3mm rgba(30, 58, 138, 0.25);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #fff;
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

                    /* ETTN satiri â€” kalin siyah ust-alt cerceve, beyaz bg */
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

                    /* === TOPLAMLAR (sag alt) â€” duz border, gradient yok === */
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

                    /* === IMZA BLOGU â€” sadece 2 sutun (SATICI + ALICI), gradient GIB stami YOK === */
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
                            <div class="label">AYDIN Ã–ZEL ENTEGRASYON</div>
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
                            <!-- Phase A.2.3: Gercek GIB logosu â€” mavi dis halka + egri yazilar + kirmizi GIB wordmark -->
                            <div class="gib-logo"><img src="data:image/jpeg;base64,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" style="width:100%;height:100%;display:block;" alt="GIB"/></div>
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
                                    <td class="label">Ã–zelleÅŸtirme No:</td>
                                    <td><xsl:value-of select="//cbc:CustomizationID"/></td>
                                </tr>
                                <tr>
                                    <td class="label">Senaryo:</td>
                                    <td><xsl:value-of select="//cbc:InvoiceTypeCode"/></td>
                                </tr>
                                <tr>
                                    <td class="label">Fatura Tipi:</td>
                                    <td>
                                        <xsl:choose>
                                            <!-- Phase 11.1: Gercek UBL-TR 1.2.1'de cac:InvoiceType elementi YOK, tip flat cbc:InvoiceTypeCode'da -->
                                            <xsl:when test="//cbc:InvoiceTypeCode">
                                                <xsl:call-template name="fmt-invoice-type">
                                                    <xsl:with-param name="code" select="//cbc:InvoiceTypeCode"/>
                                                </xsl:call-template>
                                            </xsl:when>
                                            <xsl:otherwise>SATIS</xsl:otherwise>
                                        </xsl:choose>
                                    </td>
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
                                <th style="width:7mm">SÄ±ra No</th>
                                <th style="width:18mm">ÃœrÃ¼n Kodu</th>
                                <th>Mal/Hizmet</th>
                                <th style="width:14mm">Miktar</th>
                                <th style="width:18mm">Birim Fiyat</th>
                                <th style="width:14mm">Ä°skonto OranÄ±</th>
                                <th style="width:14mm">Ä°skonto TutarÄ±</th>
                                <th style="width:14mm">KDV OranÄ±</th>
                                <th style="width:14mm">KDV TutarÄ±</th>
                                <th style="width:14mm">DiÄŸer Vergiler</th>
                                <th style="width:18mm">Mal Hizmet TutarÄ±</th>
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
                                <td class="label">Mal Hizmet Toplam TutarÄ±</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:LegalMonetaryTotal/cbc:LineExtensionAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr>
                                <td class="label">Toplam Ä°skonto</td>
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
                                <td class="label">Ã–denecek Tutar</td>
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

