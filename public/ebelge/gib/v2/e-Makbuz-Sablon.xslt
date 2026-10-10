<?xml version="1.0" encoding="UTF-8"?>
<!--
  UBL-TR Receipt görünümü.
  Giriş sayfası ve e-Makbuz editör modülü için hazırlanmıştır.
  Yalnızca XML'de bulunan alanları gösterir; dış görsel veya ağ kaynağı kullanmaz.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Receipt-2"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="n1 cac cbc">

    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:template name="date">
        <xsl:param name="value"/>
        <xsl:choose>
            <xsl:when test="string-length(normalize-space($value)) &gt;= 10">
                <xsl:value-of select="concat(substring($value,9,2),'.',substring($value,6,2),'.',substring($value,1,4))"/>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$value"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="money">
        <xsl:param name="value"/>
        <xsl:param name="currency"/>
        <xsl:value-of select="format-number(number($value), '###.##0,00', 'tr')"/>
        <xsl:text> </xsl:text>
        <xsl:choose>
            <xsl:when test="$currency='TRY' or $currency='TL'">TL</xsl:when>
            <xsl:otherwise><xsl:value-of select="$currency"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="party-name">
        <xsl:param name="party"/>
        <xsl:choose>
            <xsl:when test="$party/cac:PartyName/cbc:Name">
                <xsl:value-of select="$party/cac:PartyName/cbc:Name"/>
            </xsl:when>
            <xsl:when test="$party/cac:Person">
                <xsl:value-of select="normalize-space(concat($party/cac:Person/cbc:FirstName,' ',$party/cac:Person/cbc:FamilyName))"/>
            </xsl:when>
            <xsl:otherwise>-</xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="party-id">
        <xsl:param name="party"/>
        <xsl:for-each select="$party/cac:PartyIdentification[1]/cbc:ID">
            <xsl:if test="@schemeID"><xsl:value-of select="@schemeID"/><xsl:text>: </xsl:text></xsl:if>
            <xsl:value-of select="."/>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="address">
        <xsl:param name="address"/>
        <xsl:if test="$address/cbc:StreetName"><xsl:value-of select="$address/cbc:StreetName"/></xsl:if>
        <xsl:if test="$address/cbc:BuildingNumber"><xsl:text> No:</xsl:text><xsl:value-of select="$address/cbc:BuildingNumber"/></xsl:if>
        <xsl:if test="$address/cbc:CitySubdivisionName">
            <xsl:if test="$address/cbc:StreetName or $address/cbc:BuildingNumber"><xsl:text>, </xsl:text></xsl:if>
            <xsl:value-of select="$address/cbc:CitySubdivisionName"/>
        </xsl:if>
        <xsl:if test="$address/cbc:CityName">
            <xsl:if test="$address/cbc:StreetName or $address/cbc:BuildingNumber or $address/cbc:CitySubdivisionName"><xsl:text> / </xsl:text></xsl:if>
            <xsl:value-of select="$address/cbc:CityName"/>
        </xsl:if>
        <xsl:if test="$address/cbc:PostalZone"><xsl:text> </xsl:text><xsl:value-of select="$address/cbc:PostalZone"/></xsl:if>
        <xsl:if test="$address/cac:Country/cbc:Name">
            <xsl:text> · </xsl:text><xsl:value-of select="$address/cac:Country/cbc:Name"/>
        </xsl:if>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="n1:Receipt"/>
    </xsl:template>

    <xsl:template match="n1:Receipt">
        <xsl:variable name="currency">
            <xsl:choose>
                <xsl:when test="cbc:DocumentCurrencyCode"><xsl:value-of select="cbc:DocumentCurrencyCode"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="supplier" select="cac:SupplierParty/cac:Party"/>
        <xsl:variable name="customer" select="cac:CustomerParty/cac:Party"/>

        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title>e-Makbuz</title>
                <style type="text/css">
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; background: #eef6f5; color: #173331; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; }
                    .page { width: 794px; min-height: 1040px; margin: 0 auto; background: #fff; position: relative; overflow: hidden; }
                    .topline { height: 9px; background: linear-gradient(90deg,#0f766e,#14b8a6,#5eead4); }
                    .header { padding: 34px 42px 24px; border-bottom: 1px solid #d7e9e6; position: relative; }
                    .mark { display: inline-table; width: 58px; height: 58px; border-radius: 16px; background: #0f766e; color: #fff; vertical-align: middle; text-align: center; box-shadow: 0 8px 20px rgba(15,118,110,.18); }
                    .mark span { display: table-cell; vertical-align: middle; font-size: 27px; font-weight: bold; }
                    .heading { display: inline-block; vertical-align: middle; margin-left: 17px; }
                    .heading h1 { margin: 0; color: #102c2a; font-size: 27px; line-height: 1; letter-spacing: .8px; }
                    .heading p { margin: 7px 0 0; color: #66827f; font-size: 11px; letter-spacing: 1.8px; text-transform: uppercase; }
                    .doc-meta { position: absolute; right: 42px; top: 34px; width: 235px; }
                    .doc-meta table { width: 100%; border-collapse: collapse; }
                    .doc-meta td { padding: 4px 0; vertical-align: top; }
                    .doc-meta .key { width: 88px; color: #6b8582; font-size: 10px; text-transform: uppercase; letter-spacing: .6px; }
                    .doc-meta .value { color: #173331; font-weight: bold; text-align: right; word-break: break-word; }
                    .content { padding: 28px 42px 42px; }
                    .parties { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
                    .parties td { width: 50%; vertical-align: top; }
                    .parties td:first-child { padding-right: 8px; }
                    .parties td:last-child { padding-left: 8px; }
                    .party { min-height: 148px; padding: 19px 20px; border: 1px solid #d7e9e6; border-radius: 14px; background: #fbfefd; }
                    .party-label { color: #0f766e; font-size: 10px; font-weight: bold; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 11px; }
                    .party-name { color: #173331; font-size: 15px; font-weight: bold; line-height: 1.3; margin-bottom: 8px; }
                    .party-line { color: #607976; font-size: 11px; line-height: 1.55; }
                    .section-title { margin: 28px 0 10px; color: #173331; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
                    .section-title span { color: #0f766e; }
                    .lines { width: 100%; border-collapse: separate; border-spacing: 0; overflow: hidden; border: 1px solid #d7e9e6; border-radius: 12px; }
                    .lines th { padding: 10px 12px; background: #eaf7f5; color: #37615d; font-size: 10px; text-align: left; text-transform: uppercase; letter-spacing: .6px; border-bottom: 1px solid #d7e9e6; }
                    .lines td { padding: 13px 12px; color: #294946; border-bottom: 1px solid #edf5f4; vertical-align: top; line-height: 1.45; }
                    .lines tr:last-child td { border-bottom: 0; }
                    .center { text-align: center !important; }
                    .tax-total { width: 100%; border-collapse: collapse; margin-top: 17px; }
                    .tax-note { width: 62%; padding: 16px 18px; border: 1px solid #d7e9e6; border-radius: 12px; vertical-align: top; color: #607976; font-size: 11px; line-height: 1.55; }
                    .tax-note b { color: #294946; }
                    .tax-spacer { width: 3%; }
                    .totals { width: 35%; vertical-align: top; }
                    .totals table { width: 100%; border-collapse: collapse; }
                    .totals td { padding: 7px 0; border-bottom: 1px solid #e4efed; font-size: 11px; }
                    .totals td:last-child { text-align: right; font-weight: bold; white-space: nowrap; }
                    .payable { margin-top: 14px; padding: 19px 20px; border-radius: 14px; color: #fff; background: linear-gradient(135deg,#0f766e,#0d9488); box-shadow: 0 10px 24px rgba(15,118,110,.2); }
                    .payable .label { font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; opacity: .82; }
                    .payable .amount { margin-top: 5px; font-size: 26px; font-weight: bold; text-align: right; }
                    .footer { position: absolute; left: 42px; right: 42px; bottom: 30px; padding-top: 13px; border-top: 1px solid #d7e9e6; color: #78908d; font-size: 9px; }
                    .footer .uuid { float: right; max-width: 430px; text-align: right; word-break: break-all; }
                    @media print {
                        html, body { background: #fff; }
                        .page { width: 100%; min-height: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="topline"></div>
                    <div class="header">
                        <div class="mark"><span>M</span></div>
                        <div class="heading">
                            <h1>e-MAKBUZ</h1>
                            <p>Elektronik ödeme makbuzu</p>
                        </div>
                        <div class="doc-meta">
                            <table>
                                <tr><td class="key">Makbuz No</td><td class="value"><xsl:value-of select="cbc:ID"/></td></tr>
                                <tr>
                                    <td class="key">Düzenleme</td>
                                    <td class="value">
                                        <xsl:call-template name="date"><xsl:with-param name="value" select="cbc:IssueDate"/></xsl:call-template>
                                        <xsl:if test="cbc:IssueTime"><br/><xsl:value-of select="substring(cbc:IssueTime,1,8)"/></xsl:if>
                                    </td>
                                </tr>
                                <tr><td class="key">Senaryo</td><td class="value"><xsl:value-of select="cbc:ProfileID"/></td></tr>
                            </table>
                        </div>
                    </div>

                    <div class="content">
                        <table class="parties">
                            <tr>
                                <td>
                                    <div class="party">
                                        <div class="party-label">Tahsilatı yapan</div>
                                        <div class="party-name"><xsl:call-template name="party-name"><xsl:with-param name="party" select="$supplier"/></xsl:call-template></div>
                                        <div class="party-line"><xsl:call-template name="party-id"><xsl:with-param name="party" select="$supplier"/></xsl:call-template></div>
                                        <div class="party-line"><xsl:call-template name="address"><xsl:with-param name="address" select="$supplier/cac:PostalAddress"/></xsl:call-template></div>
                                        <xsl:if test="$supplier/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name">
                                            <div class="party-line">Vergi Dairesi: <xsl:value-of select="$supplier/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/></div>
                                        </xsl:if>
                                    </div>
                                </td>
                                <td>
                                    <div class="party">
                                        <div class="party-label">Ödemeyi yapan</div>
                                        <div class="party-name"><xsl:call-template name="party-name"><xsl:with-param name="party" select="$customer"/></xsl:call-template></div>
                                        <div class="party-line"><xsl:call-template name="party-id"><xsl:with-param name="party" select="$customer"/></xsl:call-template></div>
                                        <div class="party-line"><xsl:call-template name="address"><xsl:with-param name="address" select="$customer/cac:PostalAddress"/></xsl:call-template></div>
                                    </div>
                                </td>
                            </tr>
                        </table>

                        <div class="section-title"><span>01</span> · Tahsilat açıklaması</div>
                        <table class="lines">
                            <thead>
                                <tr>
                                    <th style="width:45px" class="center">Sıra</th>
                                    <th>Açıklama</th>
                                    <th style="width:105px" class="center">Tahsil Tarihi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:for-each select="cac:ReceiptLine">
                                    <tr>
                                        <td class="center"><xsl:value-of select="cbc:ID"/></td>
                                        <td><xsl:value-of select="cbc:Description"/></td>
                                        <td class="center"><xsl:call-template name="date"><xsl:with-param name="value" select="cbc:ReceivedDate"/></xsl:call-template></td>
                                    </tr>
                                </xsl:for-each>
                            </tbody>
                        </table>

                        <div class="section-title"><span>02</span> · Tutar bilgileri</div>
                        <table class="tax-total">
                            <tr>
                                <td class="tax-note">
                                    <xsl:choose>
                                        <xsl:when test="cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReason">
                                            <b>Vergi istisnası</b><br/>
                                            <xsl:if test="cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReasonCode">
                                                <xsl:value-of select="cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReasonCode"/><xsl:text> · </xsl:text>
                                            </xsl:if>
                                            <xsl:value-of select="cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReason"/>
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <b>Vergi bilgisi</b><br/>
                                            Makbuza ait vergi ve tahsilat toplamları sağ bölümde gösterilmiştir.
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </td>
                                <td class="tax-spacer"></td>
                                <td class="totals">
                                    <table>
                                        <xsl:if test="cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount">
                                            <tr><td>Vergi Hariç</td><td><xsl:call-template name="money"><xsl:with-param name="value" select="cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount"/><xsl:with-param name="currency" select="$currency"/></xsl:call-template></td></tr>
                                        </xsl:if>
                                        <xsl:if test="cac:TaxTotal/cbc:TaxAmount">
                                            <tr><td>Vergi Toplamı</td><td><xsl:call-template name="money"><xsl:with-param name="value" select="cac:TaxTotal/cbc:TaxAmount"/><xsl:with-param name="currency" select="$currency"/></xsl:call-template></td></tr>
                                        </xsl:if>
                                        <xsl:if test="cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount">
                                            <tr><td>Vergi Dahil</td><td><xsl:call-template name="money"><xsl:with-param name="value" select="cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount"/><xsl:with-param name="currency" select="$currency"/></xsl:call-template></td></tr>
                                        </xsl:if>
                                    </table>
                                    <div class="payable">
                                        <div class="label">Tahsil Edilen Tutar</div>
                                        <div class="amount">
                                            <xsl:call-template name="money">
                                                <xsl:with-param name="value" select="cac:LegalMonetaryTotal/cbc:PayableAmount"/>
                                                <xsl:with-param name="currency" select="$currency"/>
                                            </xsl:call-template>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div class="footer">
                        <span>UBL <xsl:value-of select="cbc:UBLVersionID"/> · <xsl:value-of select="cbc:CustomizationID"/></span>
                        <span class="uuid">ETTN: <xsl:value-of select="cbc:UUID"/></span>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
