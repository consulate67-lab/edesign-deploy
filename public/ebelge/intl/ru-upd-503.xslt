<?xml version="1.0" encoding="UTF-8"?>
<!--
  ФНС УПД / счёт-фактура 5.03 (Приказ ЕД-7-26/970@, КНД 1115131) görünümü.
  Basılı biçim Постановление Правительства № 1137 (счёт-фактура) sütun ve satır numaralarını izler.
  Функция: СЧФДОП → Статус 1, ДОП → Статус 2, СЧФ → yalnız счёт-фактура (avans dahil).
  Etiket dili "lang" parametresi: ru (varsayılan) veya en.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:param name="lang" select="'ru'"/>
    <xsl:variable name="L">
        <xsl:choose>
            <xsl:when test="$lang = 'en'">en</xsl:when>
            <xsl:otherwise>ru</xsl:otherwise>
        </xsl:choose>
    </xsl:variable>

    <xsl:decimal-format name="space" decimal-separator="," grouping-separator="&#160;" NaN=""/>
    <xsl:decimal-format name="dot" decimal-separator="." grouping-separator="," NaN=""/>

    <xsl:template name="t">
        <xsl:param name="k"/>
        <xsl:variable name="row">
            <xsl:choose>
                <xsl:when test="$k='upd'">|ru=Универсальный передаточный документ|en=Universal transfer document|</xsl:when>
                <xsl:when test="$k='status'">|ru=Статус|en=Status|</xsl:when>
                <xsl:when test="$k='status1'">|ru=1 — счёт-фактура и передаточный документ (акт)|en=1 — VAT invoice and transfer document|</xsl:when>
                <xsl:when test="$k='status2'">|ru=2 — передаточный документ (акт)|en=2 — transfer document only|</xsl:when>
                <xsl:when test="$k='invoice'">|ru=Счёт-фактура|en=VAT invoice|</xsl:when>
                <xsl:when test="$k='advance'">|ru=Счёт-фактура на аванс|en=Advance VAT invoice|</xsl:when>
                <xsl:when test="$k='dop'">|ru=Документ об отгрузке|en=Shipment document|</xsl:when>
                <xsl:when test="$k='no'">|ru=№|en=No.|</xsl:when>
                <xsl:when test="$k='from'">|ru=от|en=of|</xsl:when>
                <xsl:when test="$k='correction'">|ru=Исправление №|en=Correction no.|</xsl:when>
                <xsl:when test="$k='seller'">|ru=Продавец|en=Seller|</xsl:when>
                <xsl:when test="$k='address'">|ru=Адрес|en=Address|</xsl:when>
                <xsl:when test="$k='innSeller'">|ru=ИНН/КПП продавца|en=Seller INN/KPP|</xsl:when>
                <xsl:when test="$k='shipper'">|ru=Грузоотправитель и его адрес|en=Consignor and address|</xsl:when>
                <xsl:when test="$k='consignee'">|ru=Грузополучатель и его адрес|en=Consignee and address|</xsl:when>
                <xsl:when test="$k='prd'">|ru=К платёжно-расчётному документу|en=Payment document|</xsl:when>
                <xsl:when test="$k='shipDoc'">|ru=Документ об отгрузке|en=Shipment document|</xsl:when>
                <xsl:when test="$k='buyer'">|ru=Покупатель|en=Buyer|</xsl:when>
                <xsl:when test="$k='innBuyer'">|ru=ИНН/КПП покупателя|en=Buyer INN/KPP|</xsl:when>
                <xsl:when test="$k='currency'">|ru=Валюта: наименование, код|en=Currency: name, code|</xsl:when>
                <xsl:when test="$k='contract'">|ru=Идентификатор государственного контракта, договора (соглашения)|en=Government contract identifier|</xsl:when>
                <xsl:when test="$k='same'">|ru=он же|en=same as seller|</xsl:when>
                <xsl:when test="$k='bank'">|ru=Банковские реквизиты|en=Bank details|</xsl:when>
                <xsl:when test="$k='cPos'">|ru=№ п/п|en=No.|</xsl:when>
                <xsl:when test="$k='cCode'">|ru=Код товара/ работ, услуг|en=Item code|</xsl:when>
                <xsl:when test="$k='cName'">|ru=Наименование товара (описание выполненных работ, оказанных услуг), имущественного права|en=Description of goods, works, services, property rights|</xsl:when>
                <xsl:when test="$k='cUnit'">|ru=Единица измерения|en=Unit of measure|</xsl:when>
                <xsl:when test="$k='cUnitCode'">|ru=код|en=code|</xsl:when>
                <xsl:when test="$k='cUnitName'">|ru=условное обозначение (национальное)|en=symbol|</xsl:when>
                <xsl:when test="$k='cQty'">|ru=Количество (объём)|en=Quantity|</xsl:when>
                <xsl:when test="$k='cPrice'">|ru=Цена (тариф) за единицу измерения|en=Unit price|</xsl:when>
                <xsl:when test="$k='cNet'">|ru=Стоимость товаров (работ, услуг), имущественных прав без налога — всего|en=Amount excluding VAT|</xsl:when>
                <xsl:when test="$k='cExcise'">|ru=В том числе сумма акциза|en=Incl. excise|</xsl:when>
                <xsl:when test="$k='cRate'">|ru=Налоговая ставка|en=VAT rate|</xsl:when>
                <xsl:when test="$k='cTax'">|ru=Сумма налога, предъявляемая покупателю|en=VAT amount|</xsl:when>
                <xsl:when test="$k='cGross'">|ru=Стоимость товаров (работ, услуг), имущественных прав с налогом — всего|en=Amount including VAT|</xsl:when>
                <xsl:when test="$k='cOrigin'">|ru=Страна происхождения товара|en=Country of origin|</xsl:when>
                <xsl:when test="$k='cDecl'">|ru=Регистрационный номер декларации на товары|en=Customs declaration no.|</xsl:when>
                <xsl:when test="$k='total'">|ru=Всего к оплате|en=Total payable|</xsl:when>
                <xsl:when test="$k='noExcise'">|ru=без акциза|en=no excise|</xsl:when>
                <xsl:when test="$k='noVat'">|ru=без НДС|en=VAT-free|</xsl:when>
                <xsl:when test="$k='basis'">|ru=Основание передачи (сдачи) / получения (приёмки)|en=Basis of transfer|</xsl:when>
                <xsl:when test="$k='transport'">|ru=Данные о транспортировке и грузе|en=Transport and cargo details|</xsl:when>
                <xsl:when test="$k='operation'">|ru=Содержание операции|en=Operation|</xsl:when>
                <xsl:when test="$k='shipDate'">|ru=Дата отгрузки, передачи (сдачи)|en=Shipment / transfer date|</xsl:when>
                <xsl:when test="$k='signer'">|ru=Документ подписал|en=Signed by|</xsl:when>
                <xsl:when test="$k='sigKind1'">|ru=усиленная квалифицированная электронная подпись|en=qualified electronic signature|</xsl:when>
                <xsl:when test="$k='sigKind2'">|ru=простая электронная подпись|en=simple electronic signature|</xsl:when>
                <xsl:when test="$k='sigKind3'">|ru=усиленная неквалифицированная электронная подпись|en=advanced electronic signature|</xsl:when>
                <xsl:when test="$k='info'">|ru=Дополнительные сведения|en=Additional information|</xsl:when>
                <xsl:when test="$k='file'">|ru=Идентификатор файла|en=File ID|</xsl:when>
                <xsl:when test="$k='compiler'">|ru=Составитель файла|en=File compiled by|</xsl:when>
                <xsl:when test="$k='legal'">|ru=Визуализация электронного документа в формате ФНС 5.03; юридическую силу имеет XML-файл, подписанный электронной подписью.|en=Rendering of an electronic document in FNS format 5.03; the XML file signed with an electronic signature is legally binding.|</xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="hit" select="substring-before(substring-after($row, concat('|', $L, '=')), '|')"/>
        <xsl:choose>
            <xsl:when test="$hit != ''"><xsl:value-of select="$hit"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="substring-before(substring-after($row, '|ru='), '|')"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="num">
        <xsl:param name="v"/>
        <xsl:choose>
            <xsl:when test="string($v) = '' or string(number($v)) = 'NaN'"><xsl:value-of select="$v"/></xsl:when>
            <xsl:when test="$L = 'en'"><xsl:value-of select="format-number(number($v), '#,##0.00', 'dot')"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="format-number(number($v), '#&#160;##0,00', 'space')"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="qty">
        <xsl:param name="v"/>
        <xsl:choose>
            <xsl:when test="string($v) = '' or string(number($v)) = 'NaN'"><xsl:value-of select="$v"/></xsl:when>
            <xsl:when test="$L = 'en'"><xsl:value-of select="format-number(number($v), '#,##0.###', 'dot')"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="format-number(number($v), '#&#160;##0,###', 'space')"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Участник: наименование / ИНН / КПП / адрес -->
    <xsl:template name="name">
        <xsl:param name="p"/>
        <xsl:choose>
            <xsl:when test="$p/ИдСв/СвЮЛУч"><xsl:value-of select="$p/ИдСв/СвЮЛУч/@НаимОрг"/></xsl:when>
            <xsl:when test="$p/ИдСв/СвИП">ИП <xsl:value-of select="normalize-space(concat($p/ИдСв/СвИП/ФИО/@Фамилия, ' ', $p/ИдСв/СвИП/ФИО/@Имя, ' ', $p/ИдСв/СвИП/ФИО/@Отчество))"/></xsl:when>
            <xsl:when test="$p/ИдСв/СвИнНеУч"><xsl:value-of select="$p/ИдСв/СвИнНеУч/@Наим"/></xsl:when>
            <xsl:when test="$p/ИдСв/СвФЛУч"><xsl:value-of select="normalize-space(concat($p/ИдСв/СвФЛУч/ФИО/@Фамилия, ' ', $p/ИдСв/СвФЛУч/ФИО/@Имя, ' ', $p/ИдСв/СвФЛУч/ФИО/@Отчество))"/></xsl:when>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="inn">
        <xsl:param name="p"/>
        <xsl:value-of select="$p/ИдСв/СвЮЛУч/@ИННЮЛ | $p/ИдСв/СвИП/@ИННФЛ | $p/ИдСв/СвФЛУч/@ИННФЛ"/>
        <xsl:if test="$p/ИдСв/СвЮЛУч/@КПП">/<xsl:value-of select="$p/ИдСв/СвЮЛУч/@КПП"/></xsl:if>
    </xsl:template>

    <xsl:template name="addr">
        <xsl:param name="p"/>
        <xsl:for-each select="$p/Адрес/АдрРФ">
            <xsl:value-of select="@Индекс"/>
            <xsl:if test="@НаимРегион">, <xsl:value-of select="@НаимРегион"/></xsl:if>
            <xsl:if test="@Район">, <xsl:value-of select="@Район"/></xsl:if>
            <xsl:if test="@Город and not(contains(@НаимРегион, @Город))">, г. <xsl:value-of select="@Город"/></xsl:if>
            <xsl:if test="@НаселПункт">, <xsl:value-of select="@НаселПункт"/></xsl:if>
            <xsl:if test="@Улица">, <xsl:value-of select="@Улица"/></xsl:if>
            <xsl:if test="@Дом">, д. <xsl:value-of select="@Дом"/></xsl:if>
            <xsl:if test="@Корпус">, корп. <xsl:value-of select="@Корпус"/></xsl:if>
            <xsl:if test="@Кварт">, кв. <xsl:value-of select="@Кварт"/></xsl:if>
        </xsl:for-each>
        <xsl:for-each select="$p/Адрес/АдрИнф">
            <xsl:value-of select="@НаимСтран"/>, <xsl:value-of select="@АдрТекст"/>
        </xsl:for-each>
        <xsl:for-each select="$p/Адрес/АдрГАР">
            <xsl:value-of select="@Индекс"/>, <xsl:value-of select="@НаимРегион"/>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="row">
        <xsl:param name="n"/>
        <xsl:param name="k"/>
        <xsl:param name="v"/>
        <tr>
            <td class="lbl"><xsl:call-template name="t"><xsl:with-param name="k" select="$k"/></xsl:call-template>:</td>
            <td class="val"><xsl:copy-of select="$v"/></td>
            <td class="ln">(<xsl:value-of select="$n"/>)</td>
        </tr>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="Файл/Документ"/>
    </xsl:template>

    <xsl:template match="Документ">
        <xsl:variable name="sf" select="СвСчФакт"/>
        <xsl:variable name="fn" select="@Функция"/>
        <html lang="{$L}">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title><xsl:call-template name="t"><xsl:with-param name="k">upd</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$sf/@НомерДок"/></title>
                <style type="text/css">
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; background: #eef1f5; color: #111827; }
                    body { font-family: Arial, "Liberation Sans", Helvetica, sans-serif; font-size: 10.5px; }
                    table { font-size: inherit; color: inherit; }
                    .page { width: 1123px; margin: 0 auto; background: #fff; padding: 22px 26px 26px; }
                    .top { display: table; width: 100%; }
                    .status { display: table-cell; width: 190px; vertical-align: top; border: 1.5px solid #111827; padding: 8px 10px; }
                    .status b { display: block; font-size: 12px; margin-bottom: 3px; }
                    .status .big { font-size: 22px; font-weight: bold; }
                    .head { display: table-cell; vertical-align: top; padding-left: 18px; }
                    .kind { display: inline-block; padding: 3px 9px; border-radius: 999px; background: #e0e7ff; color: #3730a3; font-weight: bold; font-size: 9.5px; letter-spacing: .6px; text-transform: uppercase; }
                    h1 { margin: 6px 0 2px; font-size: 18px; }
                    .sub { color: #4b5563; font-size: 11px; }
                    .rows { width: 100%; border-collapse: collapse; margin-top: 6px; }
                    .rows td { padding: 2px 4px; vertical-align: top; }
                    .rows .lbl { width: 300px; color: #374151; white-space: nowrap; }
                    .rows .val { border-bottom: 1px solid #9ca3af; font-weight: bold; }
                    .rows .ln { width: 36px; color: #6b7280; text-align: right; }
                    .grid { width: 100%; border-collapse: collapse; margin-top: 12px; table-layout: fixed; }
                    .grid th, .grid td { border: 1px solid #111827; padding: 4px 5px; vertical-align: top; }
                    .grid th { background: #f3f4f6; font-weight: normal; font-size: 9px; line-height: 1.25; text-align: center; }
                    .grid .colno td { text-align: center; font-size: 9px; color: #374151; background: #fafafa; padding: 2px; }
                    .r { text-align: right; white-space: nowrap; }
                    .c { text-align: center; }
                    .totals td { font-weight: bold; background: #f9fafb; }
                    .sign { width: 100%; border-collapse: collapse; margin-top: 14px; }
                    .sign td { padding: 4px 6px; vertical-align: top; width: 50%; }
                    .box { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px 12px; }
                    .box .k { color: #6b7280; font-size: 9.5px; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 3px; }
                    .box .v { font-weight: bold; line-height: 1.45; }
                    .muted { color: #6b7280; }
                    .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 9px; line-height: 1.6; }
                    @media print { html, body { background: #fff; } .page { width: 100%; padding: 0; } }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="top">
                        <xsl:if test="$fn != 'СЧФ'">
                            <div class="status">
                                <b><xsl:call-template name="t"><xsl:with-param name="k">upd</xsl:with-param></xsl:call-template></b>
                                <xsl:call-template name="t"><xsl:with-param name="k">status</xsl:with-param></xsl:call-template>:
                                <span class="big"><xsl:choose><xsl:when test="$fn = 'ДОП'">2</xsl:when><xsl:otherwise>1</xsl:otherwise></xsl:choose></span>
                                <div class="muted" style="margin-top:4px">
                                    <xsl:choose>
                                        <xsl:when test="$fn = 'ДОП'"><xsl:call-template name="t"><xsl:with-param name="k">status2</xsl:with-param></xsl:call-template></xsl:when>
                                        <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k">status1</xsl:with-param></xsl:call-template></xsl:otherwise>
                                    </xsl:choose>
                                </div>
                            </div>
                        </xsl:if>
                        <div class="head">
                            <span class="kind">ФНС 5.03 · КНД <xsl:value-of select="@КНД"/> · <xsl:value-of select="$fn"/></span>
                            <h1>
                                <xsl:choose>
                                    <xsl:when test="$fn = 'ДОП'"><xsl:call-template name="t"><xsl:with-param name="k">dop</xsl:with-param></xsl:call-template></xsl:when>
                                    <xsl:when test="$fn = 'СЧФ' and ТаблСчФакт/СведТов[contains(@НалСт, '/')]"><xsl:call-template name="t"><xsl:with-param name="k">advance</xsl:with-param></xsl:call-template></xsl:when>
                                    <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k">invoice</xsl:with-param></xsl:call-template></xsl:otherwise>
                                </xsl:choose>
                                <xsl:text> </xsl:text><xsl:call-template name="t"><xsl:with-param name="k">no</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$sf/@НомерДок"/>
                                <xsl:text> </xsl:text><xsl:call-template name="t"><xsl:with-param name="k">from</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$sf/@ДатаДок"/>
                                <span class="ln muted" style="font-size:10px; font-weight:normal"> (1)</span>
                            </h1>
                            <div class="sub">
                                <xsl:call-template name="t"><xsl:with-param name="k">correction</xsl:with-param></xsl:call-template>
                                <xsl:text> </xsl:text>
                                <xsl:choose>
                                    <xsl:when test="$sf/ИспрДок"><xsl:value-of select="$sf/ИспрДок/@НомИспр"/><xsl:text> </xsl:text><xsl:call-template name="t"><xsl:with-param name="k">from</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$sf/ИспрДок/@ДатаИспр"/></xsl:when>
                                    <xsl:otherwise>—</xsl:otherwise>
                                </xsl:choose>
                                <span class="muted"> (1а)</span>
                            </div>

                            <table class="rows">
                                <xsl:call-template name="row"><xsl:with-param name="n">2</xsl:with-param><xsl:with-param name="k">seller</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="name"><xsl:with-param name="p" select="$sf/СвПрод"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                <xsl:call-template name="row"><xsl:with-param name="n">2а</xsl:with-param><xsl:with-param name="k">address</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="addr"><xsl:with-param name="p" select="$sf/СвПрод"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                <xsl:call-template name="row"><xsl:with-param name="n">2б</xsl:with-param><xsl:with-param name="k">innSeller</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="inn"><xsl:with-param name="p" select="$sf/СвПрод"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                <xsl:call-template name="row"><xsl:with-param name="n">3</xsl:with-param><xsl:with-param name="k">shipper</xsl:with-param><xsl:with-param name="v">
                                    <xsl:choose>
                                        <xsl:when test="$sf/ГрузОт/ОнЖе"><xsl:call-template name="t"><xsl:with-param name="k">same</xsl:with-param></xsl:call-template></xsl:when>
                                        <xsl:when test="$sf/ГрузОт/ГрузОтпр"><xsl:call-template name="name"><xsl:with-param name="p" select="$sf/ГрузОт/ГрузОтпр"/></xsl:call-template>, <xsl:call-template name="addr"><xsl:with-param name="p" select="$sf/ГрузОт/ГрузОтпр"/></xsl:call-template></xsl:when>
                                        <xsl:otherwise>—</xsl:otherwise>
                                    </xsl:choose>
                                </xsl:with-param></xsl:call-template>
                                <xsl:call-template name="row"><xsl:with-param name="n">4</xsl:with-param><xsl:with-param name="k">consignee</xsl:with-param><xsl:with-param name="v">
                                    <xsl:choose>
                                        <xsl:when test="$sf/ГрузПолуч"><xsl:call-template name="name"><xsl:with-param name="p" select="$sf/ГрузПолуч"/></xsl:call-template>, <xsl:call-template name="addr"><xsl:with-param name="p" select="$sf/ГрузПолуч"/></xsl:call-template></xsl:when>
                                        <xsl:otherwise>—</xsl:otherwise>
                                    </xsl:choose>
                                </xsl:with-param></xsl:call-template>
                                <xsl:call-template name="row"><xsl:with-param name="n">5</xsl:with-param><xsl:with-param name="k">prd</xsl:with-param><xsl:with-param name="v">
                                    <xsl:for-each select="$sf/СвПРД"><xsl:if test="position() &gt; 1">; </xsl:if>№ <xsl:value-of select="@НомерПРД"/><xsl:text> </xsl:text><xsl:call-template name="t"><xsl:with-param name="k">from</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="@ДатаПРД"/></xsl:for-each>
                                    <xsl:if test="not($sf/СвПРД)">—</xsl:if>
                                </xsl:with-param></xsl:call-template>
                                <xsl:if test="$fn != 'СЧФ'">
                                    <xsl:call-template name="row"><xsl:with-param name="n">5а</xsl:with-param><xsl:with-param name="k">shipDoc</xsl:with-param><xsl:with-param name="v">
                                        <xsl:for-each select="$sf/ДокПодтвОтгрНом"><xsl:if test="position() &gt; 1">; </xsl:if><xsl:value-of select="@РеквНаимДок"/> № <xsl:value-of select="@РеквНомерДок"/><xsl:text> </xsl:text><xsl:call-template name="t"><xsl:with-param name="k">from</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="@РеквДатаДок"/></xsl:for-each>
                                    </xsl:with-param></xsl:call-template>
                                </xsl:if>
                                <xsl:call-template name="row"><xsl:with-param name="n">6</xsl:with-param><xsl:with-param name="k">buyer</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="name"><xsl:with-param name="p" select="$sf/СвПокуп"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                <xsl:call-template name="row"><xsl:with-param name="n">6а</xsl:with-param><xsl:with-param name="k">address</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="addr"><xsl:with-param name="p" select="$sf/СвПокуп"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                <xsl:call-template name="row"><xsl:with-param name="n">6б</xsl:with-param><xsl:with-param name="k">innBuyer</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="inn"><xsl:with-param name="p" select="$sf/СвПокуп"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                <xsl:call-template name="row"><xsl:with-param name="n">7</xsl:with-param><xsl:with-param name="k">currency</xsl:with-param><xsl:with-param name="v"><xsl:value-of select="$sf/ДенИзм/@НаимОКВ"/>, <xsl:value-of select="$sf/ДенИзм/@КодОКВ"/></xsl:with-param></xsl:call-template>
                                <xsl:call-template name="row"><xsl:with-param name="n">8</xsl:with-param><xsl:with-param name="k">contract</xsl:with-param><xsl:with-param name="v"><xsl:value-of select="$sf/ДопСвФХЖ1/@ИдГосКон"/><xsl:if test="not($sf/ДопСвФХЖ1/@ИдГосКон)">—</xsl:if></xsl:with-param></xsl:call-template>
                            </table>
                        </div>
                    </div>

                    <table class="grid">
                        <colgroup>
                            <col style="width:34px"/><col style="width:78px"/><col/><col style="width:44px"/><col style="width:58px"/>
                            <col style="width:62px"/><col style="width:82px"/><col style="width:96px"/><col style="width:62px"/>
                            <col style="width:58px"/><col style="width:88px"/><col style="width:98px"/>
                        </colgroup>
                        <thead>
                            <tr>
                                <th rowspan="2"><xsl:call-template name="t"><xsl:with-param name="k">cPos</xsl:with-param></xsl:call-template></th>
                                <th rowspan="2"><xsl:call-template name="t"><xsl:with-param name="k">cCode</xsl:with-param></xsl:call-template></th>
                                <th rowspan="2"><xsl:call-template name="t"><xsl:with-param name="k">cName</xsl:with-param></xsl:call-template></th>
                                <th colspan="2"><xsl:call-template name="t"><xsl:with-param name="k">cUnit</xsl:with-param></xsl:call-template></th>
                                <th rowspan="2"><xsl:call-template name="t"><xsl:with-param name="k">cQty</xsl:with-param></xsl:call-template></th>
                                <th rowspan="2"><xsl:call-template name="t"><xsl:with-param name="k">cPrice</xsl:with-param></xsl:call-template></th>
                                <th rowspan="2"><xsl:call-template name="t"><xsl:with-param name="k">cNet</xsl:with-param></xsl:call-template></th>
                                <th rowspan="2"><xsl:call-template name="t"><xsl:with-param name="k">cExcise</xsl:with-param></xsl:call-template></th>
                                <th rowspan="2"><xsl:call-template name="t"><xsl:with-param name="k">cRate</xsl:with-param></xsl:call-template></th>
                                <th rowspan="2"><xsl:call-template name="t"><xsl:with-param name="k">cTax</xsl:with-param></xsl:call-template></th>
                                <th rowspan="2"><xsl:call-template name="t"><xsl:with-param name="k">cGross</xsl:with-param></xsl:call-template></th>
                            </tr>
                            <tr>
                                <th><xsl:call-template name="t"><xsl:with-param name="k">cUnitCode</xsl:with-param></xsl:call-template></th>
                                <th><xsl:call-template name="t"><xsl:with-param name="k">cUnitName</xsl:with-param></xsl:call-template></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="colno"><td>А</td><td>Б</td><td>1а</td><td>2</td><td>2а</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>
                            <xsl:for-each select="ТаблСчФакт/СведТов">
                                <tr>
                                    <td class="c"><xsl:value-of select="@НомСтр"/></td>
                                    <td><xsl:value-of select="ДопСведТов/@КодТов"/><xsl:if test="not(ДопСведТов/@КодТов)"><xsl:value-of select="ДопСведТов/@АртикулТов"/></xsl:if></td>
                                    <td>
                                        <xsl:value-of select="@НаимТов"/>
                                        <xsl:if test="ДопСведТов/@ХарактерТов"><div class="muted"><xsl:value-of select="ДопСведТов/@ХарактерТов"/></div></xsl:if>
                                        <xsl:if test="СвДТ"><div class="muted"><xsl:call-template name="t"><xsl:with-param name="k">cOrigin</xsl:with-param></xsl:call-template>: <xsl:value-of select="СвДТ/@КодПроисх"/> · <xsl:call-template name="t"><xsl:with-param name="k">cDecl</xsl:with-param></xsl:call-template>: <xsl:value-of select="СвДТ/@НомерДТ"/></div></xsl:if>
                                    </td>
                                    <td class="c"><xsl:value-of select="@ОКЕИ_Тов"/></td>
                                    <td class="c"><xsl:value-of select="@НаимЕдИзм"/></td>
                                    <td class="r"><xsl:call-template name="qty"><xsl:with-param name="v" select="@КолТов"/></xsl:call-template></td>
                                    <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="@ЦенаТов"/></xsl:call-template></td>
                                    <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="@СтТовБезНДС"/></xsl:call-template></td>
                                    <td class="c">
                                        <xsl:choose>
                                            <xsl:when test="Акциз/СумАкциз"><xsl:call-template name="num"><xsl:with-param name="v" select="Акциз/СумАкциз"/></xsl:call-template></xsl:when>
                                            <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k">noExcise</xsl:with-param></xsl:call-template></xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td class="c"><xsl:value-of select="@НалСт"/></td>
                                    <td class="r">
                                        <xsl:choose>
                                            <xsl:when test="СумНал/СумНал"><xsl:call-template name="num"><xsl:with-param name="v" select="СумНал/СумНал"/></xsl:call-template></xsl:when>
                                            <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k">noVat</xsl:with-param></xsl:call-template></xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="@СтТовУчНал"/></xsl:call-template></td>
                                </tr>
                            </xsl:for-each>
                            <xsl:for-each select="ТаблСчФакт/ВсегоОпл">
                                <tr class="totals">
                                    <td colspan="7"><xsl:call-template name="t"><xsl:with-param name="k">total</xsl:with-param></xsl:call-template> (9)</td>
                                    <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="@СтТовБезНДСВсего"/></xsl:call-template></td>
                                    <td colspan="2" class="c">X</td>
                                    <td class="r">
                                        <xsl:choose>
                                            <xsl:when test="СумНалВсего/СумНал"><xsl:call-template name="num"><xsl:with-param name="v" select="СумНалВсего/СумНал"/></xsl:call-template></xsl:when>
                                            <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k">noVat</xsl:with-param></xsl:call-template></xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="@СтТовУчНалВсего"/></xsl:call-template></td>
                                </tr>
                            </xsl:for-each>
                        </tbody>
                    </table>

                    <table class="sign">
                        <tr>
                            <td>
                                <xsl:for-each select="СвПродПер/СвПер">
                                    <div class="box">
                                        <div class="k"><xsl:call-template name="t"><xsl:with-param name="k">basis</xsl:with-param></xsl:call-template> (8)</div>
                                        <div class="v"><xsl:for-each select="ОснПер"><xsl:if test="position() &gt; 1">; </xsl:if><xsl:value-of select="@РеквНаимДок"/> № <xsl:value-of select="@РеквНомерДок"/><xsl:text> </xsl:text><xsl:call-template name="t"><xsl:with-param name="k">from</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="@РеквДатаДок"/></xsl:for-each></div>
                                        <xsl:if test="Тран/@СвТран">
                                            <div class="k" style="margin-top:8px"><xsl:call-template name="t"><xsl:with-param name="k">transport</xsl:with-param></xsl:call-template> (9)</div>
                                            <div class="v"><xsl:value-of select="Тран/@СвТран"/></div>
                                        </xsl:if>
                                        <div class="k" style="margin-top:8px"><xsl:call-template name="t"><xsl:with-param name="k">operation</xsl:with-param></xsl:call-template></div>
                                        <div class="v"><xsl:value-of select="@СодОпер"/></div>
                                        <div class="k" style="margin-top:8px"><xsl:call-template name="t"><xsl:with-param name="k">shipDate</xsl:with-param></xsl:call-template> (11)</div>
                                        <div class="v"><xsl:value-of select="@ДатаПер"/></div>
                                    </div>
                                </xsl:for-each>
                                <xsl:for-each select="СвСчФакт/ИнфПолФХЖ1/ТекстИнф">
                                    <div class="box" style="margin-top:8px">
                                        <div class="k"><xsl:value-of select="@Идентиф"/></div>
                                        <div class="v"><xsl:value-of select="@Значен"/></div>
                                    </div>
                                </xsl:for-each>
                            </td>
                            <td>
                                <xsl:for-each select="Подписант">
                                    <div class="box" style="margin-bottom:8px">
                                        <div class="k"><xsl:call-template name="t"><xsl:with-param name="k">signer</xsl:with-param></xsl:call-template></div>
                                        <div class="v"><xsl:value-of select="normalize-space(concat(ФИО/@Фамилия, ' ', ФИО/@Имя, ' ', ФИО/@Отчество))"/></div>
                                        <xsl:if test="@Должн"><div class="muted"><xsl:value-of select="@Должн"/></div></xsl:if>
                                        <div class="muted">
                                            <xsl:choose>
                                                <xsl:when test="@ТипПодпис = '2'"><xsl:call-template name="t"><xsl:with-param name="k">sigKind2</xsl:with-param></xsl:call-template></xsl:when>
                                                <xsl:when test="@ТипПодпис = '3'"><xsl:call-template name="t"><xsl:with-param name="k">sigKind3</xsl:with-param></xsl:call-template></xsl:when>
                                                <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k">sigKind1</xsl:with-param></xsl:call-template></xsl:otherwise>
                                            </xsl:choose>
                                        </div>
                                    </div>
                                </xsl:for-each>
                                <div class="box">
                                    <div class="k"><xsl:call-template name="t"><xsl:with-param name="k">compiler</xsl:with-param></xsl:call-template></div>
                                    <div class="v"><xsl:value-of select="@НаимЭконСубСост"/></div>
                                    <div class="muted"><xsl:value-of select="@ДатаИнфПр"/><xsl:text> </xsl:text><xsl:value-of select="translate(@ВремИнфПр, '.', ':')"/></div>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <div class="footer">
                        <div><xsl:call-template name="t"><xsl:with-param name="k">legal</xsl:with-param></xsl:call-template></div>
                        <div><xsl:call-template name="t"><xsl:with-param name="k">file</xsl:with-param></xsl:call-template>: <xsl:value-of select="../@ИдФайл"/> · <xsl:value-of select="../@ВерсФорм"/> · <xsl:value-of select="../@ВерсПрог"/></div>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
