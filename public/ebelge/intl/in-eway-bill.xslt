<?xml version="1.0" encoding="UTF-8"?>
<!--
  E-Way Bill (EWB-01, CGST Rules 138) görünümü — NIC e-way bill API JSON alanları XML öğesi olarak (EWayBill kökü).
  Bölüm A: tedarik / belge / mal bilgisi; Bölüm B: taşıma bilgisi. ₹50.000 üzeri mal hareketinde zorunludur.
  Etiket dili "lang" parametresi: en (varsayılan) veya hi.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:param name="lang" select="'en'"/>
    <xsl:variable name="L">
        <xsl:choose>
            <xsl:when test="$lang = 'hi'">hi</xsl:when>
            <xsl:otherwise>en</xsl:otherwise>
        </xsl:choose>
    </xsl:variable>

    <xsl:template name="t">
        <xsl:param name="k"/>
        <xsl:variable name="row">
            <xsl:choose>
                <xsl:when test="$k='title'">|en=E-Way Bill|hi=ई-वे बिल|</xsl:when>
                <xsl:when test="$k='ewbNo'">|en=E-Way Bill No.|hi=ई-वे बिल संख्या|</xsl:when>
                <xsl:when test="$k='ewbDt'">|en=Generated Date|hi=जनरेट तिथि|</xsl:when>
                <xsl:when test="$k='valid'">|en=Valid Upto|hi=वैधता तक|</xsl:when>
                <xsl:when test="$k='partA'">|en=Part - A|hi=भाग - क|</xsl:when>
                <xsl:when test="$k='partB'">|en=Part - B|hi=भाग - ख|</xsl:when>
                <xsl:when test="$k='from'">|en=From (Supplier)|hi=प्रेषक (आपूर्तिकर्ता)|</xsl:when>
                <xsl:when test="$k='to'">|en=To (Recipient)|hi=प्राप्तकर्ता|</xsl:when>
                <xsl:when test="$k='gstin'">|en=GSTIN|hi=जीएसटीआईएन|</xsl:when>
                <xsl:when test="$k='state'">|en=State|hi=राज्य|</xsl:when>
                <xsl:when test="$k='dispatch'">|en=Place of Dispatch|hi=प्रेषण स्थान|</xsl:when>
                <xsl:when test="$k='delivery'">|en=Place of Delivery|hi=सुपुर्दगी स्थान|</xsl:when>
                <xsl:when test="$k='doc'">|en=Document|hi=दस्तावेज़|</xsl:when>
                <xsl:when test="$k='supply'">|en=Transaction|hi=लेन-देन|</xsl:when>
                <xsl:when test="$k='reason'">|en=Reason for Transportation|hi=परिवहन का कारण|</xsl:when>
                <xsl:when test="$k='value'">|en=Value of Goods|hi=माल का मूल्य|</xsl:when>
                <xsl:when test="$k='product'">|en=Product|hi=उत्पाद|</xsl:when>
                <xsl:when test="$k='hsn'">|en=HSN|hi=एचएसएन|</xsl:when>
                <xsl:when test="$k='qty'">|en=Quantity|hi=मात्रा|</xsl:when>
                <xsl:when test="$k='taxable'">|en=Taxable Amount|hi=कर योग्य राशि|</xsl:when>
                <xsl:when test="$k='taxRate'">|en=Tax Rate (C+S+I+Cess)|hi=कर दर (C+S+I+Cess)|</xsl:when>
                <xsl:when test="$k='totalTaxable'">|en=Total Taxable Amount|hi=कुल कर योग्य राशि|</xsl:when>
                <xsl:when test="$k='invTotal'">|en=Total Invoice Value|hi=कुल बीजक मूल्य|</xsl:when>
                <xsl:when test="$k='mode'">|en=Mode|hi=साधन|</xsl:when>
                <xsl:when test="$k='vehicle'">|en=Vehicle No.|hi=वाहन संख्या|</xsl:when>
                <xsl:when test="$k='transporter'">|en=Transporter|hi=ट्रांसपोर्टर|</xsl:when>
                <xsl:when test="$k='transDoc'">|en=Transport Doc No. &amp; Date|hi=परिवहन दस्तावेज़ संख्या व तिथि|</xsl:when>
                <xsl:when test="$k='distance'">|en=Approx. Distance|hi=अनुमानित दूरी|</xsl:when>
                <xsl:when test="$k='outward'">|en=Outward|hi=बाह्य|</xsl:when>
                <xsl:when test="$k='inward'">|en=Inward|hi=आंतरिक|</xsl:when>
                <xsl:when test="$k='sub1'">|en=Supply|hi=आपूर्ति|</xsl:when>
                <xsl:when test="$k='sub2'">|en=Import|hi=आयात|</xsl:when>
                <xsl:when test="$k='sub3'">|en=Export|hi=निर्यात|</xsl:when>
                <xsl:when test="$k='sub4'">|en=Job Work|hi=जॉब वर्क|</xsl:when>
                <xsl:when test="$k='sub5'">|en=For Own Use|hi=स्वयं उपयोग हेतु|</xsl:when>
                <xsl:when test="$k='m1'">|en=Road|hi=सड़क|</xsl:when>
                <xsl:when test="$k='m2'">|en=Rail|hi=रेल|</xsl:when>
                <xsl:when test="$k='m3'">|en=Air|hi=वायु|</xsl:when>
                <xsl:when test="$k='m4'">|en=Ship|hi=जहाज़|</xsl:when>
                <xsl:when test="$k='legal'">|en=Rendering of an e-way bill generated on the NIC e-way bill system (CGST Rules, rule 138). Validity: 1 day per 200 km for regular cargo.|hi=एनआईसी ई-वे बिल प्रणाली पर जनरेट ई-वे बिल का दृश्य (सीजीएसटी नियम 138)। वैधता: सामान्य माल के लिए प्रति 200 किमी 1 दिन।|</xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="hit" select="substring-before(substring-after($row, concat('|', $L, '=')), '|')"/>
        <xsl:choose>
            <xsl:when test="$hit != ''"><xsl:value-of select="$hit"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="substring-before(substring-after($row, '|en='), '|')"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="lakh">
        <xsl:param name="s"/>
        <xsl:choose>
            <xsl:when test="string-length($s) &gt; 2">
                <xsl:call-template name="lakh"><xsl:with-param name="s" select="substring($s, 1, string-length($s) - 2)"/></xsl:call-template>
                <xsl:text>,</xsl:text>
                <xsl:value-of select="substring($s, string-length($s) - 1)"/>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="num">
        <xsl:param name="v"/>
        <xsl:choose>
            <xsl:when test="string($v) = '' or string(number($v)) = 'NaN'"><xsl:value-of select="$v"/></xsl:when>
            <xsl:otherwise>
                <xsl:variable name="abs" select="format-number(number(translate($v, '-', '')), '0.00')"/>
                <xsl:variable name="int" select="substring-before($abs, '.')"/>
                <xsl:if test="number($v) &lt; 0">-</xsl:if>
                <xsl:choose>
                    <xsl:when test="string-length($int) &gt; 3">
                        <xsl:call-template name="lakh"><xsl:with-param name="s" select="substring($int, 1, string-length($int) - 3)"/></xsl:call-template>
                        <xsl:text>,</xsl:text>
                        <xsl:value-of select="substring($int, string-length($int) - 2)"/>
                    </xsl:when>
                    <xsl:otherwise><xsl:value-of select="$int"/></xsl:otherwise>
                </xsl:choose>
                <xsl:text>.</xsl:text><xsl:value-of select="substring-after($abs, '.')"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="stateName">
        <xsl:param name="c"/>
        <xsl:variable name="m" select="concat('|', $c, '=')"/>
        <xsl:variable name="list">|01=Jammu &amp; Kashmir|02=Himachal Pradesh|03=Punjab|04=Chandigarh|05=Uttarakhand|06=Haryana|07=Delhi|08=Rajasthan|09=Uttar Pradesh|10=Bihar|11=Sikkim|12=Arunachal Pradesh|13=Nagaland|14=Manipur|15=Mizoram|16=Tripura|17=Meghalaya|18=Assam|19=West Bengal|20=Jharkhand|21=Odisha|22=Chhattisgarh|23=Madhya Pradesh|24=Gujarat|26=Dadra &amp; Nagar Haveli and Daman &amp; Diu|27=Maharashtra|29=Karnataka|30=Goa|31=Lakshadweep|32=Kerala|33=Tamil Nadu|34=Puducherry|35=Andaman &amp; Nicobar Islands|36=Telangana|37=Andhra Pradesh|38=Ladakh|96=Other Country|97=Other Territory|</xsl:variable>
        <xsl:choose>
            <xsl:when test="contains($list, $m)"><xsl:value-of select="substring-before(substring-after($list, $m), '|')"/> (<xsl:value-of select="$c"/>)</xsl:when>
            <xsl:otherwise><xsl:value-of select="$c"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="EWayBill"/>
    </xsl:template>

    <xsl:template match="EWayBill">
        <html lang="{$L}">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title><xsl:call-template name="t"><xsl:with-param name="k">title</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="ewayBillNo"/></title>
                <style type="text/css">
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; background: #eef1f5; color: #111827; }
                    body { font-family: "Segoe UI", "Noto Sans", "Noto Sans Devanagari", Mangal, Arial, sans-serif; font-size: 12px; }
                    table { font-size: inherit; color: inherit; }
                    .page { width: 860px; margin: 0 auto; background: #fff; padding: 26px 30px 28px; }
                    .top { display: table; width: 100%; border-bottom: 3px solid #0f766e; padding-bottom: 12px; }
                    .top > div { display: table-cell; vertical-align: top; }
                    .tag { display: inline-block; padding: 3px 9px; border-radius: 999px; background: #ccfbf1; color: #115e59; font-weight: bold; font-size: 10px; letter-spacing: .6px; text-transform: uppercase; }
                    h1 { margin: 6px 0 2px; font-size: 24px; }
                    .ewb { text-align: right; line-height: 1.8; }
                    .ewb .no { font-size: 20px; font-weight: bold; letter-spacing: 1px; }
                    .muted { color: #6b7280; }
                    h2 { margin: 16px 0 6px; font-size: 13px; color: #115e59; text-transform: uppercase; letter-spacing: .6px; }
                    .grid { width: 100%; border-collapse: collapse; }
                    .grid td { border: 1px solid #e5e7eb; padding: 7px 9px; vertical-align: top; width: 50%; line-height: 1.55; }
                    .grid .k { display: block; color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: .4px; }
                    .lines { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .lines th { background: #134e4a; color: #fff; font-weight: normal; font-size: 10.5px; padding: 6px 6px; text-align: left; }
                    .lines td { border-bottom: 1px solid #e5e7eb; padding: 6px; vertical-align: top; }
                    .r { text-align: right !important; white-space: nowrap; }
                    .sum { width: 340px; margin-left: auto; border-collapse: collapse; margin-top: 10px; }
                    .sum td { padding: 4px 6px; }
                    .sum .grand td { border-top: 2px solid #111827; font-size: 14px; font-weight: bold; padding-top: 7px; }
                    .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 10px; line-height: 1.6; }
                    @media print { html, body { background: #fff; } .page { width: 100%; padding: 0; } }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="top">
                        <div>
                            <span class="tag">EWB-01 · CGST Rule 138</span>
                            <h1><xsl:call-template name="t"><xsl:with-param name="k">title</xsl:with-param></xsl:call-template></h1>
                        </div>
                        <div class="ewb">
                            <div class="muted"><xsl:call-template name="t"><xsl:with-param name="k">ewbNo</xsl:with-param></xsl:call-template></div>
                            <div class="no"><xsl:value-of select="ewayBillNo"/></div>
                            <div><xsl:call-template name="t"><xsl:with-param name="k">ewbDt</xsl:with-param></xsl:call-template>: <b><xsl:value-of select="ewayBillDate"/></b></div>
                            <div><xsl:call-template name="t"><xsl:with-param name="k">valid</xsl:with-param></xsl:call-template>: <b><xsl:value-of select="validUpto"/></b></div>
                        </div>
                    </div>

                    <h2><xsl:call-template name="t"><xsl:with-param name="k">partA</xsl:with-param></xsl:call-template></h2>
                    <table class="grid">
                        <tr>
                            <td>
                                <span class="k"><xsl:call-template name="t"><xsl:with-param name="k">from</xsl:with-param></xsl:call-template></span>
                                <b><xsl:value-of select="fromTrdName"/></b><br/>
                                <xsl:call-template name="t"><xsl:with-param name="k">gstin</xsl:with-param></xsl:call-template>: <b><xsl:value-of select="fromGstin"/></b><br/>
                                <xsl:call-template name="t"><xsl:with-param name="k">state</xsl:with-param></xsl:call-template>: <xsl:call-template name="stateName"><xsl:with-param name="c" select="fromStateCode"/></xsl:call-template>
                            </td>
                            <td>
                                <span class="k"><xsl:call-template name="t"><xsl:with-param name="k">to</xsl:with-param></xsl:call-template></span>
                                <b><xsl:value-of select="toTrdName"/></b><br/>
                                <xsl:call-template name="t"><xsl:with-param name="k">gstin</xsl:with-param></xsl:call-template>: <b><xsl:value-of select="toGstin"/></b><br/>
                                <xsl:call-template name="t"><xsl:with-param name="k">state</xsl:with-param></xsl:call-template>: <xsl:call-template name="stateName"><xsl:with-param name="c" select="toStateCode"/></xsl:call-template>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span class="k"><xsl:call-template name="t"><xsl:with-param name="k">dispatch</xsl:with-param></xsl:call-template></span>
                                <xsl:value-of select="fromAddr1"/><xsl:if test="normalize-space(fromAddr2)">, <xsl:value-of select="fromAddr2"/></xsl:if><br/>
                                <xsl:value-of select="fromPlace"/> — <xsl:value-of select="fromPincode"/>, <xsl:call-template name="stateName"><xsl:with-param name="c" select="actFromStateCode"/></xsl:call-template>
                            </td>
                            <td>
                                <span class="k"><xsl:call-template name="t"><xsl:with-param name="k">delivery</xsl:with-param></xsl:call-template></span>
                                <xsl:value-of select="toAddr1"/><xsl:if test="normalize-space(toAddr2)">, <xsl:value-of select="toAddr2"/></xsl:if><br/>
                                <xsl:value-of select="toPlace"/> — <xsl:value-of select="toPincode"/>, <xsl:call-template name="stateName"><xsl:with-param name="c" select="actToStateCode"/></xsl:call-template>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span class="k"><xsl:call-template name="t"><xsl:with-param name="k">doc</xsl:with-param></xsl:call-template></span>
                                <b><xsl:value-of select="docType"/> — <xsl:value-of select="docNo"/></b> · <xsl:value-of select="docDate"/>
                            </td>
                            <td>
                                <span class="k"><xsl:call-template name="t"><xsl:with-param name="k">reason</xsl:with-param></xsl:call-template></span>
                                <xsl:choose>
                                    <xsl:when test="supplyType = 'I'"><xsl:call-template name="t"><xsl:with-param name="k">inward</xsl:with-param></xsl:call-template></xsl:when>
                                    <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k">outward</xsl:with-param></xsl:call-template></xsl:otherwise>
                                </xsl:choose>
                                <xsl:text> — </xsl:text>
                                <xsl:call-template name="t"><xsl:with-param name="k" select="concat('sub', subSupplyType)"/></xsl:call-template>
                            </td>
                        </tr>
                    </table>

                    <table class="lines">
                        <thead>
                            <tr>
                                <th><xsl:call-template name="t"><xsl:with-param name="k">product</xsl:with-param></xsl:call-template></th>
                                <th><xsl:call-template name="t"><xsl:with-param name="k">hsn</xsl:with-param></xsl:call-template></th>
                                <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">qty</xsl:with-param></xsl:call-template></th>
                                <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">taxable</xsl:with-param></xsl:call-template></th>
                                <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">taxRate</xsl:with-param></xsl:call-template></th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="itemList">
                                <tr>
                                    <td><b><xsl:value-of select="productName"/></b><xsl:if test="productDesc and productDesc != productName"><div class="muted"><xsl:value-of select="productDesc"/></div></xsl:if></td>
                                    <td><xsl:value-of select="hsnCode"/></td>
                                    <td class="r"><xsl:value-of select="quantity"/><xsl:text> </xsl:text><xsl:value-of select="qtyUnit"/></td>
                                    <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="taxableAmount"/></xsl:call-template></td>
                                    <td class="r"><xsl:value-of select="concat(cgstRate, '+', sgstRate, '+', igstRate, '+', cessRate)"/></td>
                                </tr>
                            </xsl:for-each>
                        </tbody>
                    </table>

                    <table class="sum">
                        <tr><td><xsl:call-template name="t"><xsl:with-param name="k">totalTaxable</xsl:with-param></xsl:call-template></td><td class="r">₹ <xsl:call-template name="num"><xsl:with-param name="v" select="totalValue"/></xsl:call-template></td></tr>
                        <xsl:if test="number(cgstValue) != 0"><tr><td>CGST</td><td class="r">₹ <xsl:call-template name="num"><xsl:with-param name="v" select="cgstValue"/></xsl:call-template></td></tr></xsl:if>
                        <xsl:if test="number(sgstValue) != 0"><tr><td>SGST</td><td class="r">₹ <xsl:call-template name="num"><xsl:with-param name="v" select="sgstValue"/></xsl:call-template></td></tr></xsl:if>
                        <xsl:if test="number(igstValue) != 0"><tr><td>IGST</td><td class="r">₹ <xsl:call-template name="num"><xsl:with-param name="v" select="igstValue"/></xsl:call-template></td></tr></xsl:if>
                        <tr class="grand"><td><xsl:call-template name="t"><xsl:with-param name="k">invTotal</xsl:with-param></xsl:call-template></td><td class="r">₹ <xsl:call-template name="num"><xsl:with-param name="v" select="totInvValue"/></xsl:call-template></td></tr>
                    </table>

                    <h2><xsl:call-template name="t"><xsl:with-param name="k">partB</xsl:with-param></xsl:call-template></h2>
                    <table class="grid">
                        <tr>
                            <td>
                                <span class="k"><xsl:call-template name="t"><xsl:with-param name="k">mode</xsl:with-param></xsl:call-template></span>
                                <xsl:call-template name="t"><xsl:with-param name="k" select="concat('m', transMode)"/></xsl:call-template>
                                <xsl:if test="transDistance"> · <xsl:call-template name="t"><xsl:with-param name="k">distance</xsl:with-param></xsl:call-template>: <xsl:value-of select="transDistance"/> km</xsl:if>
                            </td>
                            <td>
                                <span class="k"><xsl:call-template name="t"><xsl:with-param name="k">vehicle</xsl:with-param></xsl:call-template></span>
                                <b><xsl:value-of select="vehicleNo"/></b>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span class="k"><xsl:call-template name="t"><xsl:with-param name="k">transporter</xsl:with-param></xsl:call-template></span>
                                <xsl:value-of select="transporterName"/><xsl:if test="transporterId"> · <xsl:value-of select="transporterId"/></xsl:if>
                            </td>
                            <td>
                                <span class="k"><xsl:call-template name="t"><xsl:with-param name="k">transDoc</xsl:with-param></xsl:call-template></span>
                                <xsl:value-of select="transDocNo"/><xsl:if test="transDocDate"> · <xsl:value-of select="transDocDate"/></xsl:if>
                            </td>
                        </tr>
                    </table>

                    <div class="footer"><xsl:call-template name="t"><xsl:with-param name="k">legal</xsl:with-param></xsl:call-template></div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
