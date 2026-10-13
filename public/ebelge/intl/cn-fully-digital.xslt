<?xml version="1.0" encoding="UTF-8"?>
<!--
  全面数字化的电子发票 (数电票) görünümü — 国家税务总局公告2024年第11号.
  Basılı düzen: 电子发票（增值税专用发票 / 普通发票） — 购买方 / 销售方 kutuları, kalem tablosu,
  价税合计（大写/小写）, 备注, 开票人. InIssuType = N ise 红字发票 (kırmızı/eksi tutarlar).
  Etiket dili "lang" parametresi: zh (varsayılan) veya en.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:param name="lang" select="'zh'"/>
    <xsl:variable name="L">
        <xsl:choose>
            <xsl:when test="$lang = 'en'">en</xsl:when>
            <xsl:otherwise>zh</xsl:otherwise>
        </xsl:choose>
    </xsl:variable>

    <xsl:decimal-format name="dot" decimal-separator="." grouping-separator="," NaN=""/>

    <xsl:template name="t">
        <xsl:param name="k"/>
        <xsl:variable name="row">
            <xsl:choose>
                <xsl:when test="$k='einvoice'">|zh=电子发票|en=Electronic invoice|</xsl:when>
                <xsl:when test="$k='special'">|zh=增值税专用发票|en=Special VAT invoice|</xsl:when>
                <xsl:when test="$k='general'">|zh=普通发票|en=General invoice|</xsl:when>
                <xsl:when test="$k='red'">|zh=红字发票|en=Red-letter (credit) invoice|</xsl:when>
                <xsl:when test="$k='no'">|zh=发票号码|en=Invoice no.|</xsl:when>
                <xsl:when test="$k='date'">|zh=开票日期|en=Issue date|</xsl:when>
                <xsl:when test="$k='buyer'">|zh=购买方信息|en=Buyer|</xsl:when>
                <xsl:when test="$k='seller'">|zh=销售方信息|en=Seller|</xsl:when>
                <xsl:when test="$k='name'">|zh=名称|en=Name|</xsl:when>
                <xsl:when test="$k='taxId'">|zh=统一社会信用代码/纳税人识别号|en=Unified social credit code / taxpayer ID|</xsl:when>
                <xsl:when test="$k='addrTel'">|zh=地址、电话|en=Address, phone|</xsl:when>
                <xsl:when test="$k='bankAcc'">|zh=开户银行及账号|en=Bank and account|</xsl:when>
                <xsl:when test="$k='item'">|zh=项目名称|en=Item|</xsl:when>
                <xsl:when test="$k='spec'">|zh=规格型号|en=Specification|</xsl:when>
                <xsl:when test="$k='unit'">|zh=单位|en=Unit|</xsl:when>
                <xsl:when test="$k='qty'">|zh=数量|en=Quantity|</xsl:when>
                <xsl:when test="$k='price'">|zh=单价|en=Unit price|</xsl:when>
                <xsl:when test="$k='amount'">|zh=金额|en=Amount|</xsl:when>
                <xsl:when test="$k='rate'">|zh=税率/征收率|en=Tax rate|</xsl:when>
                <xsl:when test="$k='tax'">|zh=税额|en=Tax|</xsl:when>
                <xsl:when test="$k='code'">|zh=税收分类编码|en=Tax classification code|</xsl:when>
                <xsl:when test="$k='sum'">|zh=合计|en=Total|</xsl:when>
                <xsl:when test="$k='grand'">|zh=价税合计（大写）|en=Total incl. tax (in words)|</xsl:when>
                <xsl:when test="$k='small'">|zh=（小写）|en=(in figures)|</xsl:when>
                <xsl:when test="$k='remark'">|zh=备注|en=Remarks|</xsl:when>
                <xsl:when test="$k='drawer'">|zh=开票人|en=Issued by|</xsl:when>
                <xsl:when test="$k='bureau'">|zh=税务机关|en=Tax authority|</xsl:when>
                <xsl:when test="$k='signed'">|zh=税务数字账户签章|en=Signed by the tax digital account|</xsl:when>
                <xsl:when test="$k='legal'">|zh=本页为全面数字化的电子发票（数电票）可视化展示；XML 文件经税务机关电子签名后具有法律效力。|en=Rendering of a fully digitalised e-invoice; the XML file signed by the tax authority is legally binding.|</xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="hit" select="substring-before(substring-after($row, concat('|', $L, '=')), '|')"/>
        <xsl:choose>
            <xsl:when test="$hit != ''"><xsl:value-of select="$hit"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="substring-before(substring-after($row, '|zh='), '|')"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="num">
        <xsl:param name="v"/>
        <xsl:choose>
            <xsl:when test="string($v) = '' or string(number($v)) = 'NaN'"><xsl:value-of select="$v"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="format-number(number($v), '#,##0.00', 'dot')"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="pct">
        <xsl:param name="v"/>
        <xsl:choose>
            <xsl:when test="string(number($v)) = 'NaN'"><xsl:value-of select="$v"/></xsl:when>
            <xsl:when test="number($v) &lt; 1"><xsl:value-of select="format-number(number($v) * 100, '0.##', 'dot')"/>%</xsl:when>
            <xsl:otherwise><xsl:value-of select="format-number(number($v), '0.##', 'dot')"/>%</xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="EInvoice"/>
    </xsl:template>

    <xsl:template match="EInvoice">
        <xsl:variable name="d" select="EInvoiceData"/>
        <xsl:variable name="b" select="$d/BasicInformation"/>
        <xsl:variable name="red" select="Header/InherentLabel/InIssuType/LabelCode = 'N'"/>
        <xsl:variable name="date">
            <xsl:choose>
                <xsl:when test="TaxSupervisionInfo/IssueTime"><xsl:value-of select="substring(TaxSupervisionInfo/IssueTime, 1, 10)"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="substring($b/RequestTime, 1, 10)"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <html lang="{$L}">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title><xsl:call-template name="t"><xsl:with-param name="k">einvoice</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="Header/EIid"/></title>
                <style type="text/css">
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; background: #eef1f5; color: #1f2937; }
                    body { font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", SimSun, Arial, sans-serif; font-size: 12px; }
                    table { font-size: inherit; color: inherit; }
                    .page { width: 960px; margin: 0 auto; background: #fff; padding: 26px 30px 28px; }
                    .hd { position: relative; text-align: center; padding-bottom: 14px; }
                    .hd h1 { margin: 0; font-size: 26px; letter-spacing: 4px; color: #9a3412; font-weight: bold; }
                    .hd h1 small { font-size: 18px; letter-spacing: 1px; }
                    .hd .rule { width: 340px; margin: 6px auto 0; border-top: 3px double #9a3412; }
                    .hd .redtag { display: inline-block; margin-top: 8px; padding: 2px 10px; border: 1.5px solid #dc2626; color: #dc2626; font-weight: bold; border-radius: 4px; }
                    .meta { position: absolute; right: 0; top: 4px; text-align: left; font-size: 12px; line-height: 1.8; }
                    .meta b { color: #9a3412; font-weight: normal; display: inline-block; min-width: 64px; }
                    .qr { position: absolute; left: 0; top: 0; width: 76px; height: 76px; border: 1px solid #d1d5db; display: table; }
                    .qr span { display: table-cell; vertical-align: middle; text-align: center; color: #9ca3af; font-size: 10px; }
                    .frame { border: 1.5px solid #9a3412; }
                    .parties { width: 100%; border-collapse: collapse; }
                    .parties td { vertical-align: top; border-bottom: 1.5px solid #9a3412; padding: 0; }
                    .parties .side { width: 30px; text-align: center; color: #9a3412; border-right: 1px solid #9a3412; writing-mode: vertical-rl; letter-spacing: 6px; padding: 8px 0; }
                    .parties .info { padding: 8px 12px; line-height: 1.9; }
                    .parties .info b { color: #9a3412; font-weight: normal; }
                    .parties .mid { border-right: 1.5px solid #9a3412; }
                    .items { width: 100%; border-collapse: collapse; }
                    .items th { color: #9a3412; font-weight: normal; padding: 6px 6px 4px; text-align: center; border-bottom: 1px solid #f3d3c2; }
                    .items td { padding: 5px 6px; vertical-align: top; }
                    .items .r { text-align: right; white-space: nowrap; }
                    .items .c { text-align: center; }
                    .items .sum td { border-top: 1px solid #f3d3c2; color: #9a3412; }
                    .items .sum .r { color: #111827; }
                    .neg { color: #dc2626; }
                    .band { display: table; width: 100%; border-top: 1.5px solid #9a3412; }
                    .band > div { display: table-cell; padding: 8px 12px; vertical-align: middle; }
                    .band .k { width: 150px; color: #9a3412; border-right: 1px solid #9a3412; text-align: center; }
                    .band .words { font-size: 14px; font-weight: bold; }
                    .band .fig { text-align: right; white-space: nowrap; font-size: 14px; font-weight: bold; }
                    .band .fig span { color: #9a3412; font-weight: normal; font-size: 12px; }
                    .remark { min-height: 64px; }
                    .foot { display: table; width: 100%; margin-top: 10px; }
                    .foot > div { display: table-cell; }
                    .foot b { color: #9a3412; font-weight: normal; }
                    .seal { text-align: right; color: #b91c1c; font-size: 11px; }
                    .seal span { display: inline-block; border: 2px solid #dc2626; border-radius: 50%; padding: 18px 12px; text-align: center; line-height: 1.4; }
                    .legal { margin-top: 14px; padding-top: 8px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 10.5px; line-height: 1.6; }
                    @media print { html, body { background: #fff; } .page { width: 100%; padding: 0; } }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="hd">
                        <div class="qr"><span>QR</span></div>
                        <h1>
                            <xsl:call-template name="t"><xsl:with-param name="k">einvoice</xsl:with-param></xsl:call-template>
                            <small>（<xsl:choose>
                                <xsl:when test="Header/InherentLabel/GeneralOrSpecialVAT/LabelCode = '01'"><xsl:call-template name="t"><xsl:with-param name="k">special</xsl:with-param></xsl:call-template></xsl:when>
                                <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k">general</xsl:with-param></xsl:call-template></xsl:otherwise>
                            </xsl:choose>）</small>
                        </h1>
                        <div class="rule"></div>
                        <xsl:if test="$red"><span class="redtag"><xsl:call-template name="t"><xsl:with-param name="k">red</xsl:with-param></xsl:call-template></span></xsl:if>
                        <div class="meta">
                            <div><b><xsl:call-template name="t"><xsl:with-param name="k">no</xsl:with-param></xsl:call-template>：</b><xsl:value-of select="Header/EIid"/></div>
                            <div><b><xsl:call-template name="t"><xsl:with-param name="k">date</xsl:with-param></xsl:call-template>：</b><xsl:choose>
                                <xsl:when test="$L = 'zh' and string-length($date) = 10"><xsl:value-of select="substring($date, 1, 4)"/>年<xsl:value-of select="substring($date, 6, 2)"/>月<xsl:value-of select="substring($date, 9, 2)"/>日</xsl:when>
                                <xsl:otherwise><xsl:value-of select="$date"/></xsl:otherwise>
                            </xsl:choose></div>
                        </div>
                    </div>

                    <div class="frame">
                        <table class="parties">
                            <tr>
                                <td class="side"><xsl:call-template name="t"><xsl:with-param name="k">buyer</xsl:with-param></xsl:call-template></td>
                                <td class="info mid">
                                    <div><b><xsl:call-template name="t"><xsl:with-param name="k">name</xsl:with-param></xsl:call-template>：</b><xsl:value-of select="$d/BuyerInformation/BuyerName"/></div>
                                    <div><b><xsl:call-template name="t"><xsl:with-param name="k">taxId</xsl:with-param></xsl:call-template>：</b><xsl:value-of select="$d/BuyerInformation/BuyerIdNum"/></div>
                                    <xsl:if test="$d/BuyerInformation/BuyerAddr">
                                        <div><b><xsl:call-template name="t"><xsl:with-param name="k">addrTel</xsl:with-param></xsl:call-template>：</b><xsl:value-of select="$d/BuyerInformation/BuyerAddr"/><xsl:text> </xsl:text><xsl:value-of select="$d/BuyerInformation/BuyerTelNum"/></div>
                                    </xsl:if>
                                    <xsl:if test="$d/BuyerInformation/BuyerBankName">
                                        <div><b><xsl:call-template name="t"><xsl:with-param name="k">bankAcc</xsl:with-param></xsl:call-template>：</b><xsl:value-of select="$d/BuyerInformation/BuyerBankName"/><xsl:text> </xsl:text><xsl:value-of select="$d/BuyerInformation/BuyerBankAccNum"/></div>
                                    </xsl:if>
                                </td>
                                <td class="side"><xsl:call-template name="t"><xsl:with-param name="k">seller</xsl:with-param></xsl:call-template></td>
                                <td class="info">
                                    <div><b><xsl:call-template name="t"><xsl:with-param name="k">name</xsl:with-param></xsl:call-template>：</b><xsl:value-of select="$d/SellerInformation/SellerName"/></div>
                                    <div><b><xsl:call-template name="t"><xsl:with-param name="k">taxId</xsl:with-param></xsl:call-template>：</b><xsl:value-of select="$d/SellerInformation/SellerIdNum"/></div>
                                    <xsl:if test="$d/SellerInformation/SellerAddr">
                                        <div><b><xsl:call-template name="t"><xsl:with-param name="k">addrTel</xsl:with-param></xsl:call-template>：</b><xsl:value-of select="$d/SellerInformation/SellerAddr"/><xsl:text> </xsl:text><xsl:value-of select="$d/SellerInformation/SellerTelNum"/></div>
                                    </xsl:if>
                                    <xsl:if test="$d/SellerInformation/SellerBankName">
                                        <div><b><xsl:call-template name="t"><xsl:with-param name="k">bankAcc</xsl:with-param></xsl:call-template>：</b><xsl:value-of select="$d/SellerInformation/SellerBankName"/><xsl:text> </xsl:text><xsl:value-of select="$d/SellerInformation/SellerBankAccNum"/></div>
                                    </xsl:if>
                                </td>
                            </tr>
                        </table>

                        <table class="items">
                            <thead>
                                <tr>
                                    <th style="text-align:left"><xsl:call-template name="t"><xsl:with-param name="k">item</xsl:with-param></xsl:call-template></th>
                                    <th><xsl:call-template name="t"><xsl:with-param name="k">spec</xsl:with-param></xsl:call-template></th>
                                    <th><xsl:call-template name="t"><xsl:with-param name="k">unit</xsl:with-param></xsl:call-template></th>
                                    <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">qty</xsl:with-param></xsl:call-template></th>
                                    <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">price</xsl:with-param></xsl:call-template></th>
                                    <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">amount</xsl:with-param></xsl:call-template></th>
                                    <th><xsl:call-template name="t"><xsl:with-param name="k">rate</xsl:with-param></xsl:call-template></th>
                                    <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">tax</xsl:with-param></xsl:call-template></th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:for-each select="$d/IssuItemInformation">
                                    <tr>
                                        <td>
                                            <xsl:value-of select="ItemName"/>
                                            <xsl:if test="TaxClassificationCode"><div style="color:#9ca3af; font-size:10.5px"><xsl:call-template name="t"><xsl:with-param name="k">code</xsl:with-param></xsl:call-template>: <xsl:value-of select="TaxClassificationCode"/></div></xsl:if>
                                        </td>
                                        <td class="c"><xsl:value-of select="SpecMod"/></td>
                                        <td class="c"><xsl:value-of select="MeaUnits"/></td>
                                        <td class="r"><xsl:value-of select="Quantity"/></td>
                                        <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="UnPrice"/></xsl:call-template></td>
                                        <td class="r"><xsl:if test="number(Amount) &lt; 0"><xsl:attribute name="class">r neg</xsl:attribute></xsl:if><xsl:call-template name="num"><xsl:with-param name="v" select="Amount"/></xsl:call-template></td>
                                        <td class="c"><xsl:call-template name="pct"><xsl:with-param name="v" select="TaxRate"/></xsl:call-template></td>
                                        <td class="r"><xsl:if test="number(ComTaxAm) &lt; 0"><xsl:attribute name="class">r neg</xsl:attribute></xsl:if><xsl:call-template name="num"><xsl:with-param name="v" select="ComTaxAm"/></xsl:call-template></td>
                                    </tr>
                                </xsl:for-each>
                                <tr class="sum">
                                    <td colspan="5" class="c"><xsl:call-template name="t"><xsl:with-param name="k">sum</xsl:with-param></xsl:call-template></td>
                                    <td class="r">¥<xsl:call-template name="num"><xsl:with-param name="v" select="$b/TotalAmWithoutTax"/></xsl:call-template></td>
                                    <td></td>
                                    <td class="r">¥<xsl:call-template name="num"><xsl:with-param name="v" select="$b/TotalTaxAm"/></xsl:call-template></td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="band">
                            <div class="k"><xsl:call-template name="t"><xsl:with-param name="k">grand</xsl:with-param></xsl:call-template></div>
                            <div class="words"><xsl:value-of select="$b/TotalTax-includedAmountInChinese"/></div>
                            <div class="fig"><span><xsl:call-template name="t"><xsl:with-param name="k">small</xsl:with-param></xsl:call-template></span> ¥<xsl:call-template name="num"><xsl:with-param name="v" select="$b/TotalTax-includedAmount"/></xsl:call-template></div>
                        </div>
                        <div class="band">
                            <div class="k"><xsl:call-template name="t"><xsl:with-param name="k">remark</xsl:with-param></xsl:call-template></div>
                            <div class="remark"><xsl:value-of select="$d/AdditionalInformation/Remark"/></div>
                        </div>
                    </div>

                    <div class="foot">
                        <div>
                            <b><xsl:call-template name="t"><xsl:with-param name="k">drawer</xsl:with-param></xsl:call-template>：</b><xsl:value-of select="$b/Drawer"/>
                            <xsl:if test="TaxSupervisionInfo/TaxBureauName">
                                <div style="margin-top:6px"><b><xsl:call-template name="t"><xsl:with-param name="k">bureau</xsl:with-param></xsl:call-template>：</b><xsl:value-of select="TaxSupervisionInfo/TaxBureauName"/> (<xsl:value-of select="TaxSupervisionInfo/TaxBureauCode"/>)</div>
                            </xsl:if>
                        </div>
                        <xsl:if test="TaxBureauSignature">
                            <div class="seal"><span><xsl:call-template name="t"><xsl:with-param name="k">signed</xsl:with-param></xsl:call-template><br/>SM2</span></div>
                        </xsl:if>
                    </div>

                    <div class="legal"><xsl:call-template name="t"><xsl:with-param name="k">legal</xsl:with-param></xsl:call-template> · <xsl:value-of select="Header/EInvoiceTag"/> v<xsl:value-of select="Header/Version"/></div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
