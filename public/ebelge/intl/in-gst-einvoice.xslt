<?xml version="1.0" encoding="UTF-8"?>
<!--
  GST e-Invoice (INV-01, IRP şema 1.1) görünümü — CGST Rules 48(4), Notification 13/2020-CT.
  JSON şemasının alan adları XML öğesi olarak tutulur (GSTInvoice kökü).
  IRN, Ack No / Ack Date ve imzalı QR alanı IRP kaydından sonra dolar.
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
                <xsl:when test="$k='INV'">|en=Tax Invoice|hi=कर बीजक|</xsl:when>
                <xsl:when test="$k='CRN'">|en=Credit Note|hi=क्रेडिट नोट|</xsl:when>
                <xsl:when test="$k='DBN'">|en=Debit Note|hi=डेबिट नोट|</xsl:when>
                <xsl:when test="$k='einv'">|en=GST e-Invoice|hi=जीएसटी ई-इनवॉइस|</xsl:when>
                <xsl:when test="$k='irn'">|en=IRN|hi=आईआरएन|</xsl:when>
                <xsl:when test="$k='ackNo'">|en=Ack No.|hi=पावती संख्या|</xsl:when>
                <xsl:when test="$k='ackDt'">|en=Ack Date|hi=पावती तिथि|</xsl:when>
                <xsl:when test="$k='docNo'">|en=Document No.|hi=दस्तावेज़ संख्या|</xsl:when>
                <xsl:when test="$k='docDt'">|en=Document Date|hi=दस्तावेज़ तिथि|</xsl:when>
                <xsl:when test="$k='supTyp'">|en=Supply Type|hi=आपूर्ति प्रकार|</xsl:when>
                <xsl:when test="$k='rcm'">|en=Reverse Charge|hi=रिवर्स चार्ज|</xsl:when>
                <xsl:when test="$k='seller'">|en=Supplier|hi=आपूर्तिकर्ता|</xsl:when>
                <xsl:when test="$k='buyer'">|en=Recipient|hi=प्राप्तकर्ता|</xsl:when>
                <xsl:when test="$k='gstin'">|en=GSTIN|hi=जीएसटीआईएन|</xsl:when>
                <xsl:when test="$k='state'">|en=State|hi=राज्य|</xsl:when>
                <xsl:when test="$k='pos'">|en=Place of Supply|hi=आपूर्ति का स्थान|</xsl:when>
                <xsl:when test="$k='sl'">|en=Sl.|hi=क्र.|</xsl:when>
                <xsl:when test="$k='desc'">|en=Description of Goods / Services|hi=माल / सेवाओं का विवरण|</xsl:when>
                <xsl:when test="$k='hsn'">|en=HSN / SAC|hi=एचएसएन / एसएसी|</xsl:when>
                <xsl:when test="$k='qty'">|en=Qty|hi=मात्रा|</xsl:when>
                <xsl:when test="$k='unit'">|en=Unit|hi=इकाई|</xsl:when>
                <xsl:when test="$k='rate'">|en=Unit Price|hi=इकाई मूल्य|</xsl:when>
                <xsl:when test="$k='taxable'">|en=Taxable Value|hi=कर योग्य मूल्य|</xsl:when>
                <xsl:when test="$k='gstRt'">|en=GST %|hi=जीएसटी %|</xsl:when>
                <xsl:when test="$k='total'">|en=Total|hi=कुल|</xsl:when>
                <xsl:when test="$k='roundOff'">|en=Round off|hi=पूर्णांकन|</xsl:when>
                <xsl:when test="$k='invTotal'">|en=Total Invoice Value|hi=कुल बीजक मूल्य|</xsl:when>
                <xsl:when test="$k='pay'">|en=Payment Details|hi=भुगतान विवरण|</xsl:when>
                <xsl:when test="$k='account'">|en=Account|hi=खाता|</xsl:when>
                <xsl:when test="$k='ifsc'">|en=IFSC|hi=आईएफएससी|</xsl:when>
                <xsl:when test="$k='terms'">|en=Payment Terms|hi=भुगतान शर्तें|</xsl:when>
                <xsl:when test="$k='remarks'">|en=Remarks|hi=टिप्पणी|</xsl:when>
                <xsl:when test="$k='prec'">|en=Original Invoice|hi=मूल बीजक|</xsl:when>
                <xsl:when test="$k='qr'">|en=Signed QR code (IRP)|hi=हस्ताक्षरित क्यूआर कोड (आईआरपी)|</xsl:when>
                <xsl:when test="$k='legal'">|en=Rendering of a GST e-invoice registered on the Invoice Registration Portal (IRP); the signed JSON / IRN is legally binding.|hi=इनवॉइस रजिस्ट्रेशन पोर्टल (IRP) पर पंजीकृत जीएसटी ई-इनवॉइस का दृश्य; हस्ताक्षरित JSON / IRN कानूनी रूप से मान्य है।|</xsl:when>
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

    <!-- ₹ biçimi: 12,34,567.89 -->
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
        <xsl:value-of select="$c"/>
        <xsl:if test="contains($list, $m)"> — <xsl:value-of select="substring-before(substring-after($list, $m), '|')"/></xsl:if>
    </xsl:template>

    <xsl:template name="party">
        <xsl:param name="p"/>
        <xsl:param name="k"/>
        <div class="party">
            <div class="ph"><xsl:call-template name="t"><xsl:with-param name="k" select="$k"/></xsl:call-template></div>
            <div class="pn"><xsl:value-of select="$p/LglNm"/></div>
            <xsl:if test="$p/TrdNm and $p/TrdNm != $p/LglNm"><div class="muted"><xsl:value-of select="$p/TrdNm"/></div></xsl:if>
            <div><xsl:value-of select="$p/Addr1"/><xsl:if test="$p/Addr2">, <xsl:value-of select="$p/Addr2"/></xsl:if></div>
            <div><xsl:value-of select="$p/Loc"/> — <xsl:value-of select="$p/Pin"/></div>
            <table class="kv">
                <tr><td><xsl:call-template name="t"><xsl:with-param name="k">gstin</xsl:with-param></xsl:call-template></td><td><b><xsl:value-of select="$p/Gstin"/></b></td></tr>
                <tr><td><xsl:call-template name="t"><xsl:with-param name="k">state</xsl:with-param></xsl:call-template></td><td><xsl:call-template name="stateName"><xsl:with-param name="c" select="$p/Stcd"/></xsl:call-template></td></tr>
                <xsl:if test="$p/Pos"><tr><td><xsl:call-template name="t"><xsl:with-param name="k">pos</xsl:with-param></xsl:call-template></td><td><xsl:call-template name="stateName"><xsl:with-param name="c" select="$p/Pos"/></xsl:call-template></td></tr></xsl:if>
                <xsl:if test="$p/Ph or $p/Em"><tr><td>☎ / ✉</td><td><xsl:value-of select="$p/Ph"/><xsl:if test="$p/Ph and $p/Em"> · </xsl:if><xsl:value-of select="$p/Em"/></td></tr></xsl:if>
            </table>
        </div>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="GSTInvoice"/>
    </xsl:template>

    <xsl:template match="GSTInvoice">
        <xsl:variable name="v" select="ValDtls"/>
        <xsl:variable name="intra" select="number($v/IgstVal) = 0 and number($v/CgstVal) != 0"/>
        <html lang="{$L}">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title><xsl:call-template name="t"><xsl:with-param name="k" select="DocDtls/Typ"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="DocDtls/No"/></title>
                <style type="text/css">
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; background: #eef1f5; color: #111827; }
                    body { font-family: "Segoe UI", "Noto Sans", "Noto Sans Devanagari", Mangal, Arial, sans-serif; font-size: 12px; }
                    table { font-size: inherit; color: inherit; }
                    .page { width: 900px; margin: 0 auto; background: #fff; padding: 26px 30px 28px; }
                    .top { display: table; width: 100%; border-bottom: 3px solid #f97316; padding-bottom: 12px; }
                    .top > div { display: table-cell; vertical-align: top; }
                    .tag { display: inline-block; padding: 3px 9px; border-radius: 999px; background: #ffedd5; color: #9a3412; font-weight: bold; font-size: 10px; letter-spacing: .6px; text-transform: uppercase; }
                    h1 { margin: 6px 0 4px; font-size: 24px; }
                    .muted { color: #6b7280; }
                    .irn { margin-top: 8px; font-size: 11px; line-height: 1.7; }
                    .irn code { font-family: Consolas, "Courier New", monospace; font-size: 10.5px; word-break: break-all; background: #f9fafb; padding: 1px 4px; border-radius: 3px; }
                    .qr { width: 118px; text-align: center; }
                    .qr .box { width: 108px; height: 108px; margin-left: auto; border: 1px dashed #9ca3af; display: table; }
                    .qr .box span { display: table-cell; vertical-align: middle; color: #9ca3af; font-size: 10px; padding: 6px; }
                    .meta { width: 100%; border-collapse: collapse; margin-top: 12px; }
                    .meta td { border: 1px solid #e5e7eb; padding: 6px 8px; width: 25%; }
                    .meta .k { display: block; color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: .4px; }
                    .parties { display: table; width: 100%; margin-top: 12px; border-spacing: 0; }
                    .party { display: table-cell; width: 50%; vertical-align: top; border: 1px solid #e5e7eb; padding: 10px 12px; line-height: 1.55; }
                    .party + .party { border-left: none; }
                    .ph { color: #9a3412; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: .5px; }
                    .pn { font-size: 14px; font-weight: bold; margin: 2px 0; }
                    .kv { border-collapse: collapse; margin-top: 4px; }
                    .kv td { padding: 1px 10px 1px 0; }
                    .kv td:first-child { color: #6b7280; white-space: nowrap; }
                    .lines { width: 100%; border-collapse: collapse; margin-top: 14px; }
                    .lines th { background: #1f2937; color: #fff; font-weight: normal; font-size: 10.5px; padding: 6px 5px; text-align: left; }
                    .lines td { border-bottom: 1px solid #e5e7eb; padding: 6px 5px; vertical-align: top; }
                    .r { text-align: right !important; white-space: nowrap; }
                    .c { text-align: center !important; }
                    .sum { width: 360px; margin-left: auto; border-collapse: collapse; margin-top: 10px; }
                    .sum td { padding: 4px 6px; }
                    .sum .grand td { border-top: 2px solid #111827; font-size: 15px; font-weight: bold; padding-top: 8px; }
                    .boxes { display: table; width: 100%; margin-top: 14px; }
                    .boxes > div { display: table-cell; width: 50%; vertical-align: top; padding-right: 10px; }
                    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; line-height: 1.6; }
                    .card .ph { margin-bottom: 4px; }
                    .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 10px; line-height: 1.6; }
                    @media print { html, body { background: #fff; } .page { width: 100%; padding: 0; } }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="top">
                        <div>
                            <span class="tag"><xsl:call-template name="t"><xsl:with-param name="k">einv</xsl:with-param></xsl:call-template> · INV-01 v<xsl:value-of select="@Version"/></span>
                            <h1><xsl:call-template name="t"><xsl:with-param name="k" select="DocDtls/Typ"/></xsl:call-template></h1>
                            <div class="irn">
                                <div><b><xsl:call-template name="t"><xsl:with-param name="k">irn</xsl:with-param></xsl:call-template>:</b><xsl:text> </xsl:text><code><xsl:value-of select="Irn"/></code></div>
                                <div><b><xsl:call-template name="t"><xsl:with-param name="k">ackNo</xsl:with-param></xsl:call-template>:</b><xsl:text> </xsl:text><xsl:value-of select="AckNo"/>
                                    · <b><xsl:call-template name="t"><xsl:with-param name="k">ackDt</xsl:with-param></xsl:call-template>:</b><xsl:text> </xsl:text><xsl:value-of select="AckDt"/></div>
                            </div>
                        </div>
                        <div class="qr">
                            <div class="box"><span><xsl:call-template name="t"><xsl:with-param name="k">qr</xsl:with-param></xsl:call-template></span></div>
                        </div>
                    </div>

                    <table class="meta">
                        <tr>
                            <td><span class="k"><xsl:call-template name="t"><xsl:with-param name="k">docNo</xsl:with-param></xsl:call-template></span><b><xsl:value-of select="DocDtls/No"/></b></td>
                            <td><span class="k"><xsl:call-template name="t"><xsl:with-param name="k">docDt</xsl:with-param></xsl:call-template></span><b><xsl:value-of select="DocDtls/Dt"/></b></td>
                            <td><span class="k"><xsl:call-template name="t"><xsl:with-param name="k">supTyp</xsl:with-param></xsl:call-template></span><xsl:value-of select="TranDtls/SupTyp"/> · <xsl:value-of select="TranDtls/TaxSch"/></td>
                            <td><span class="k"><xsl:call-template name="t"><xsl:with-param name="k">rcm</xsl:with-param></xsl:call-template></span><xsl:value-of select="TranDtls/RegRev"/></td>
                        </tr>
                    </table>

                    <div class="parties">
                        <xsl:call-template name="party"><xsl:with-param name="p" select="SellerDtls"/><xsl:with-param name="k">seller</xsl:with-param></xsl:call-template>
                        <xsl:call-template name="party"><xsl:with-param name="p" select="BuyerDtls"/><xsl:with-param name="k">buyer</xsl:with-param></xsl:call-template>
                    </div>

                    <table class="lines">
                        <thead>
                            <tr>
                                <th class="c"><xsl:call-template name="t"><xsl:with-param name="k">sl</xsl:with-param></xsl:call-template></th>
                                <th><xsl:call-template name="t"><xsl:with-param name="k">desc</xsl:with-param></xsl:call-template></th>
                                <th><xsl:call-template name="t"><xsl:with-param name="k">hsn</xsl:with-param></xsl:call-template></th>
                                <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">qty</xsl:with-param></xsl:call-template></th>
                                <th><xsl:call-template name="t"><xsl:with-param name="k">unit</xsl:with-param></xsl:call-template></th>
                                <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">rate</xsl:with-param></xsl:call-template></th>
                                <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">taxable</xsl:with-param></xsl:call-template></th>
                                <th class="c"><xsl:call-template name="t"><xsl:with-param name="k">gstRt</xsl:with-param></xsl:call-template></th>
                                <xsl:choose>
                                    <xsl:when test="$intra"><th class="r">CGST</th><th class="r">SGST</th></xsl:when>
                                    <xsl:otherwise><th class="r">IGST</th></xsl:otherwise>
                                </xsl:choose>
                                <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">total</xsl:with-param></xsl:call-template></th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="ItemList">
                                <tr>
                                    <td class="c"><xsl:value-of select="SlNo"/></td>
                                    <td><xsl:value-of select="PrdDesc"/></td>
                                    <td><xsl:value-of select="HsnCd"/></td>
                                    <td class="r"><xsl:value-of select="Qty"/></td>
                                    <td><xsl:value-of select="Unit"/></td>
                                    <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="UnitPrice"/></xsl:call-template></td>
                                    <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="AssAmt"/></xsl:call-template></td>
                                    <td class="c"><xsl:value-of select="GstRt"/>%</td>
                                    <xsl:choose>
                                        <xsl:when test="$intra">
                                            <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="CgstAmt"/></xsl:call-template></td>
                                            <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="SgstAmt"/></xsl:call-template></td>
                                        </xsl:when>
                                        <xsl:otherwise><td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="IgstAmt"/></xsl:call-template></td></xsl:otherwise>
                                    </xsl:choose>
                                    <td class="r"><b><xsl:call-template name="num"><xsl:with-param name="v" select="TotItemVal"/></xsl:call-template></b></td>
                                </tr>
                            </xsl:for-each>
                        </tbody>
                    </table>

                    <table class="sum">
                        <tr><td><xsl:call-template name="t"><xsl:with-param name="k">taxable</xsl:with-param></xsl:call-template></td><td class="r">₹ <xsl:call-template name="num"><xsl:with-param name="v" select="$v/AssVal"/></xsl:call-template></td></tr>
                        <xsl:if test="number($v/CgstVal) != 0"><tr><td>CGST</td><td class="r">₹ <xsl:call-template name="num"><xsl:with-param name="v" select="$v/CgstVal"/></xsl:call-template></td></tr></xsl:if>
                        <xsl:if test="number($v/SgstVal) != 0"><tr><td>SGST / UTGST</td><td class="r">₹ <xsl:call-template name="num"><xsl:with-param name="v" select="$v/SgstVal"/></xsl:call-template></td></tr></xsl:if>
                        <xsl:if test="number($v/IgstVal) != 0"><tr><td>IGST</td><td class="r">₹ <xsl:call-template name="num"><xsl:with-param name="v" select="$v/IgstVal"/></xsl:call-template></td></tr></xsl:if>
                        <xsl:if test="number($v/CesVal) != 0 and $v/CesVal"><tr><td>Cess</td><td class="r">₹ <xsl:call-template name="num"><xsl:with-param name="v" select="$v/CesVal"/></xsl:call-template></td></tr></xsl:if>
                        <xsl:if test="number($v/RndOffAmt) != 0"><tr><td><xsl:call-template name="t"><xsl:with-param name="k">roundOff</xsl:with-param></xsl:call-template></td><td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="$v/RndOffAmt"/></xsl:call-template></td></tr></xsl:if>
                        <tr class="grand"><td><xsl:call-template name="t"><xsl:with-param name="k">invTotal</xsl:with-param></xsl:call-template></td><td class="r">₹ <xsl:call-template name="num"><xsl:with-param name="v" select="$v/TotInvVal"/></xsl:call-template></td></tr>
                    </table>

                    <div class="boxes">
                        <div>
                            <xsl:for-each select="PayDtls">
                                <div class="card">
                                    <div class="ph"><xsl:call-template name="t"><xsl:with-param name="k">pay</xsl:with-param></xsl:call-template></div>
                                    <div><b><xsl:value-of select="Nm"/></b></div>
                                    <div><xsl:call-template name="t"><xsl:with-param name="k">account</xsl:with-param></xsl:call-template>: <xsl:value-of select="AccDet"/> · <xsl:call-template name="t"><xsl:with-param name="k">ifsc</xsl:with-param></xsl:call-template>: <xsl:value-of select="FinInsBr"/></div>
                                    <div class="muted"><xsl:value-of select="Mode"/><xsl:if test="CrDay"> · <xsl:value-of select="CrDay"/> d</xsl:if></div>
                                    <xsl:if test="PayTerm"><div><xsl:call-template name="t"><xsl:with-param name="k">terms</xsl:with-param></xsl:call-template>: <xsl:value-of select="PayTerm"/></div></xsl:if>
                                </div>
                            </xsl:for-each>
                        </div>
                        <div>
                            <xsl:for-each select="RefDtls">
                                <div class="card">
                                    <div class="ph"><xsl:call-template name="t"><xsl:with-param name="k">remarks</xsl:with-param></xsl:call-template></div>
                                    <div><xsl:value-of select="InvRm"/></div>
                                    <xsl:for-each select="PrecDocDtls">
                                        <div class="muted"><xsl:call-template name="t"><xsl:with-param name="k">prec</xsl:with-param></xsl:call-template>: <xsl:value-of select="InvNo"/> · <xsl:value-of select="InvDt"/></div>
                                    </xsl:for-each>
                                </div>
                            </xsl:for-each>
                        </div>
                    </div>

                    <div class="footer"><xsl:call-template name="t"><xsl:with-param name="k">legal</xsl:with-param></xsl:call-template></div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
