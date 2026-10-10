<?xml version="1.0" encoding="UTF-8"?>
<!--
  e-Bilet Raporu görüntüleme şablonu.
  GİB e-Bilet Paketi (ebilet.xsd 14.02.2023) ve Karayolu/Denizyolu,
  Havayolu, Etkinlik e-Bilet Raporu Teknik Kılavuzlarındaki alanlara göre hazırlanmıştır.
  Dış görsel veya ağ kaynağı kullanmaz.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:ebilet="http://ebilet.efatura.gov.tr"
    xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
    xmlns:xades="http://uri.etsi.org/01903/v1.3.2#"
    exclude-result-prefixes="ebilet ds xades">

    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:variable name="ILLER" select="'|01Adana|02Adıyaman|03Afyonkarahisar|04Ağrı|05Amasya|06Ankara|07Antalya|08Artvin|09Aydın|10Balıkesir|11Bilecik|12Bingöl|13Bitlis|14Bolu|15Burdur|16Bursa|17Çanakkale|18Çankırı|19Çorum|20Denizli|21Diyarbakır|22Edirne|23Elazığ|24Erzincan|25Erzurum|26Eskişehir|27Gaziantep|28Giresun|29Gümüşhane|30Hakkari|31Hatay|32Isparta|33Mersin|34İstanbul|35İzmir|36Kars|37Kastamonu|38Kayseri|39Kırklareli|40Kırşehir|41Kocaeli|42Konya|43Kütahya|44Malatya|45Manisa|46Kahramanmaraş|47Mardin|48Muğla|49Muş|50Nevşehir|51Niğde|52Ordu|53Rize|54Sakarya|55Samsun|56Siirt|57Sinop|58Sivas|59Tekirdağ|60Tokat|61Trabzon|62Tunceli|63Şanlıurfa|64Uşak|65Van|66Yozgat|67Zonguldak|68Aksaray|69Bayburt|70Karaman|71Kırıkkale|72Batman|73Şırnak|74Bartın|75Ardahan|76Iğdır|77Yalova|78Karabük|79Kilis|80Osmaniye|81Düzce|'"/>

    <xsl:template name="tarih">
        <xsl:param name="d"/>
        <xsl:choose>
            <xsl:when test="string-length($d) &gt;= 10">
                <xsl:value-of select="concat(substring($d,9,2),'.',substring($d,6,2),'.',substring($d,1,4))"/>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$d"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="zaman">
        <xsl:param name="d"/>
        <xsl:choose>
            <xsl:when test="starts-with($d,'1111-11-11')">Açık bilet</xsl:when>
            <xsl:when test="string-length($d) &gt;= 16">
                <xsl:value-of select="concat(substring($d,9,2),'.',substring($d,6,2),'.',substring($d,1,4),' ',substring($d,12,5))"/>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$d"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="tutar">
        <xsl:param name="v"/>
        <xsl:if test="string($v) != ''">
            <xsl:value-of select="format-number(number($v), '###.##0,00', 'tr')"/>
        </xsl:if>
    </xsl:template>

    <xsl:template name="odeme">
        <xsl:param name="k"/>
        <xsl:choose>
            <xsl:when test="$k='BANKAKARTI'">Banka kartı</xsl:when>
            <xsl:when test="$k='BEDELSIZ'">Bedelsiz</xsl:when>
            <xsl:when test="$k='COKLU'">Çoklu ödeme</xsl:when>
            <xsl:when test="$k='KREDIKARTI'">Kredi kartı</xsl:when>
            <xsl:when test="$k='PUAN'">Puan</xsl:when>
            <xsl:when test="$k='MAHSUP'">Mahsup</xsl:when>
            <xsl:when test="$k='MAHSUPPUAN'">Mahsup puan</xsl:when>
            <xsl:when test="$k='MIL'">Mil</xsl:when>
            <xsl:when test="$k='NAKIT'">Nakit</xsl:when>
            <xsl:when test="$k='PASS'">Pass</xsl:when>
            <xsl:when test="$k='PROMOSYON'">Promosyon</xsl:when>
            <xsl:when test="$k='ULASIMKARTI'">Ulaşım kartı</xsl:when>
            <xsl:when test="$k='DIGER'">Diğer</xsl:when>
            <xsl:otherwise><xsl:value-of select="$k"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="hizmetTuru">
        <xsl:param name="k"/>
        <xsl:choose>
            <xsl:when test="$k='SEYAHAT'">Seyahat</xsl:when>
            <xsl:when test="$k='BAGAJ'">Bagaj</xsl:when>
            <xsl:when test="$k='IPTALDEGISIKLIKTAZMINATI'">İptal / değişiklik tazminatı</xsl:when>
            <xsl:when test="$k='CEZA'">Ceza</xsl:when>
            <xsl:when test="$k='YEMEK'">Yemek</xsl:when>
            <xsl:when test="$k='KOLTUKSECIMI'">Koltuk seçimi</xsl:when>
            <xsl:when test="$k='DIGER'">Diğer</xsl:when>
            <xsl:otherwise><xsl:value-of select="$k"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Dövizli havayolu biletlerini kur bilgisiyle TL'ye çevirerek toplar. -->
    <xsl:template name="toplamTL">
        <xsl:param name="nodes"/>
        <xsl:param name="acc" select="0"/>
        <xsl:choose>
            <xsl:when test="$nodes">
                <xsl:variable name="n" select="$nodes[1]"/>
                <xsl:variable name="v">
                    <xsl:choose>
                        <xsl:when test="$n/@paraBirim and $n/@paraBirim != 'TRY' and $n/@paraBirim != 'TL' and number($n/@kur) = number($n/@kur)">
                            <xsl:value-of select="number($n) * number($n/@kur)"/>
                        </xsl:when>
                        <xsl:otherwise><xsl:value-of select="number($n)"/></xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:call-template name="toplamTL">
                    <xsl:with-param name="nodes" select="$nodes[position() &gt; 1]"/>
                    <xsl:with-param name="acc" select="$acc + number($v)"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$acc"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="/">
        <xsl:variable name="rapor" select="/ebilet:eBilet"/>
        <xsl:variable name="tur">
            <xsl:choose>
                <xsl:when test="$rapor/ebilet:bilet/ebilet:etkinlikZamani">Etkinlik</xsl:when>
                <xsl:when test="$rapor/ebilet:bilet[string-length(normalize-space(ebilet:biletNo)) = 13]">Havayolu</xsl:when>
                <xsl:otherwise>Karayolu / Denizyolu</xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="matrah">
            <xsl:call-template name="toplamTL">
                <xsl:with-param name="nodes" select="$rapor/ebilet:bilet[not(ebilet:belgeTip='IADE')]/ebilet:tutar"/>
            </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="kdv" select="sum($rapor/ebilet:bilet[not(ebilet:belgeTip='IADE')]/ebilet:kdv)"/>
        <xsl:variable name="diger" select="sum($rapor/ebilet:bilet[not(ebilet:belgeTip='IADE')]/ebilet:digerVergiler/ebilet:vergi/ebilet:tutar)"/>
        <xsl:variable name="genel" select="number($matrah) + $kdv + $diger"/>

        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title>e-Bilet Raporu</title>
                <style type="text/css">
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; background: #edf3f7; color: #183047; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 9px; }
                    .page { width: 1120px; min-height: 770px; margin: 0 auto; background: #fff; overflow: hidden; }
                    .accent { height: 8px; background: linear-gradient(90deg,#0b3b60,#0284c7,#22d3ee); }
                    .header { padding: 22px 28px 18px; border-bottom: 1px solid #dbe7ef; position: relative; }
                    .brand { display: inline-table; width: 49px; height: 49px; border-radius: 13px; color: #fff; background: #0b3b60; vertical-align: middle; text-align: center; box-shadow: 0 7px 18px rgba(11,59,96,.2); }
                    .brand span { display: table-cell; vertical-align: middle; font-size: 16px; font-weight: bold; letter-spacing: -1px; }
                    .title { display: inline-block; margin-left: 13px; vertical-align: middle; }
                    .title h1 { margin: 0; font-size: 22px; line-height: 1; color: #102f49; letter-spacing: .8px; }
                    .title p { margin: 6px 0 0; color: #0284c7; font-size: 9px; font-weight: bold; letter-spacing: 1.1px; text-transform: uppercase; }
                    .report-id { position: absolute; top: 21px; right: 28px; width: 520px; }
                    .report-id table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                    .report-id td { padding: 3px 7px; vertical-align: top; border-left: 1px solid #dbe7ef; }
                    .meta-label { display: block; color: #7890a2; font-size: 7px; font-weight: bold; letter-spacing: .7px; text-transform: uppercase; margin-bottom: 3px; }
                    .meta-value { color: #183047; font-size: 9px; font-weight: bold; word-break: break-all; }
                    .content { padding: 18px 28px 25px; }
                    .metrics { width: 100%; border-collapse: separate; border-spacing: 6px 0; margin: 0 -6px 20px; table-layout: fixed; }
                    .metric { padding: 11px 10px; border: 1px solid #dbe7ef; border-radius: 10px; background: #f8fbfd; vertical-align: top; }
                    .metric .label { color: #6f8799; font-size: 7px; font-weight: bold; letter-spacing: .5px; text-transform: uppercase; }
                    .metric .value { margin-top: 5px; color: #102f49; font-size: 16px; font-weight: bold; white-space: nowrap; }
                    .metric.blue { background: #ecf8fe; border-color: #bae6fd; }
                    .metric.blue .value { color: #0369a1; }
                    .metric.total { background: linear-gradient(135deg,#0b3b60,#0369a1); border: 0; box-shadow: 0 8px 18px rgba(3,105,161,.18); }
                    .metric.total .label { color: #bae6fd; }
                    .metric.total .value { color: #fff; }
                    .section-head { margin: 16px 0 7px; }
                    .section-head .number { display: inline-block; min-width: 22px; color: #0284c7; font-size: 9px; font-weight: bold; }
                    .section-head .name { color: #183047; font-size: 11px; font-weight: bold; letter-spacing: .7px; text-transform: uppercase; }
                    .section-head .count { float: right; color: #7890a2; font-size: 8px; }
                    .data { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #dbe7ef; border-radius: 9px; overflow: hidden; table-layout: fixed; }
                    .data th { padding: 7px 6px; color: #e0f2fe; background: #0b3b60; border-right: 1px solid #285673; font-size: 7px; letter-spacing: .35px; line-height: 1.25; text-align: left; text-transform: uppercase; }
                    .data th:last-child { border-right: 0; }
                    .data td { padding: 7px 6px; border-right: 1px solid #e6eef3; border-bottom: 1px solid #e6eef3; color: #29475d; vertical-align: top; line-height: 1.35; word-wrap: break-word; }
                    .data td:last-child { border-right: 0; }
                    .data tbody tr:last-child td { border-bottom: 0; }
                    .data tbody tr:nth-child(even) td { background: #f8fbfd; }
                    .data .refund td { background: #fff7ed !important; color: #9a3412; }
                    .badge { display: inline-block; padding: 2px 5px; border-radius: 8px; color: #0369a1; background: #e0f2fe; font-size: 7px; font-weight: bold; text-transform: uppercase; }
                    .refund .badge { color: #c2410c; background: #ffedd5; }
                    .num { text-align: right; white-space: nowrap; }
                    .muted { margin-top: 2px; color: #7890a2; font-size: 7px; line-height: 1.35; }
                    .link { color: #0284c7; text-decoration: none; font-size: 7px; }
                    .cancel th { background: #9f3a2e; border-color: #b7584d; }
                    .cancel td { color: #71352e; }
                    .footer { margin-top: 15px; padding-top: 9px; border-top: 1px solid #dbe7ef; color: #7890a2; font-size: 7px; line-height: 1.45; }
                    @page { size: A4 landscape; margin: 8mm; }
                    @media print {
                        html, body { background: #fff; }
                        .page { width: 100%; min-height: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="accent"></div>
                    <div class="header">
                        <div class="brand"><span>EB</span></div>
                        <div class="title">
                            <h1>e-BİLET RAPORU</h1>
                            <p><xsl:value-of select="$tur"/> raporu</p>
                        </div>
                        <div class="report-id">
                            <table>
                                <tr>
                                    <td style="width:22%">
                                        <span class="meta-label">Gönderen</span>
                                        <span class="meta-value">
                                            <xsl:if test="$rapor/ebilet:baslik/ebilet:gonderen/ebilet:vkn">VKN <xsl:value-of select="$rapor/ebilet:baslik/ebilet:gonderen/ebilet:vkn"/></xsl:if>
                                            <xsl:if test="$rapor/ebilet:baslik/ebilet:gonderen/ebilet:tckn">TCKN <xsl:value-of select="$rapor/ebilet:baslik/ebilet:gonderen/ebilet:tckn"/></xsl:if>
                                        </span>
                                    </td>
                                    <td style="width:25%">
                                        <span class="meta-label">Rapor Dönemi</span>
                                        <span class="meta-value">
                                            <xsl:call-template name="tarih"><xsl:with-param name="d" select="$rapor/ebilet:baslik/ebilet:baslangicTarihi"/></xsl:call-template>
                                            <xsl:text> — </xsl:text>
                                            <xsl:call-template name="tarih"><xsl:with-param name="d" select="$rapor/ebilet:baslik/ebilet:bitisTarihi"/></xsl:call-template>
                                        </span>
                                    </td>
                                    <td style="width:38%">
                                        <span class="meta-label">Rapor Kimliği (UUID)</span>
                                        <span class="meta-value"><xsl:value-of select="$rapor/ebilet:baslik/ebilet:uuid"/></span>
                                    </td>
                                    <td style="width:15%">
                                        <span class="meta-label">Versiyon</span>
                                        <span class="meta-value"><xsl:value-of select="$rapor/ebilet:baslik/ebilet:versiyon"/></span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <div class="content">
                        <table class="metrics">
                            <tr>
                                <td class="metric"><div class="label">Bilet Adedi</div><div class="value"><xsl:value-of select="count($rapor/ebilet:bilet[not(ebilet:belgeTip='IADE')])"/></div></td>
                                <td class="metric"><div class="label">İade Adedi</div><div class="value"><xsl:value-of select="count($rapor/ebilet:bilet[ebilet:belgeTip='IADE'])"/></div></td>
                                <td class="metric"><div class="label">İptal Adedi</div><div class="value"><xsl:value-of select="count($rapor/ebilet:biletIptal)"/></div></td>
                                <td class="metric blue"><div class="label">Matrah</div><div class="value"><xsl:call-template name="tutar"><xsl:with-param name="v" select="$matrah"/></xsl:call-template><small> TL</small></div></td>
                                <td class="metric blue"><div class="label">KDV</div><div class="value"><xsl:call-template name="tutar"><xsl:with-param name="v" select="$kdv"/></xsl:call-template><small> TL</small></div></td>
                                <td class="metric blue"><div class="label">Diğer Vergiler</div><div class="value"><xsl:call-template name="tutar"><xsl:with-param name="v" select="$diger"/></xsl:call-template><small> TL</small></div></td>
                                <td class="metric total"><div class="label">Genel Toplam</div><div class="value"><xsl:call-template name="tutar"><xsl:with-param name="v" select="$genel"/></xsl:call-template><small> TL</small></div></td>
                            </tr>
                        </table>

                        <div class="section-head">
                            <span class="number">01</span><span class="name">Düzenlenen Biletler</span>
                            <span class="count"><xsl:value-of select="count($rapor/ebilet:bilet)"/> kayıt</span>
                        </div>
                        <table class="data">
                            <thead>
                                <tr>
                                    <th style="width:10%">Bilet No</th>
                                    <th style="width:5%">Tip</th>
                                    <th style="width:7%">Düzenleme</th>
                                    <xsl:if test="$rapor/ebilet:bilet/ebilet:seferZamani or $rapor/ebilet:bilet/ebilet:etkinlikZamani"><th style="width:9%">Sefer / Etkinlik</th></xsl:if>
                                    <xsl:if test="$rapor/ebilet:bilet/ebilet:yer"><th style="width:11%">Yer / Organizatör</th></xsl:if>
                                    <th style="width:7%">Ödeme</th>
                                    <th style="width:8%" class="num">Matrah</th>
                                    <th style="width:8%" class="num">Diğer Vergi</th>
                                    <th style="width:7%" class="num">KDV</th>
                                    <th style="width:9%">Gider Gösteren</th>
                                    <th>Hizmet / Referans</th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:for-each select="$rapor/ebilet:bilet">
                                    <tr>
                                        <xsl:if test="ebilet:belgeTip='IADE'"><xsl:attribute name="class">refund</xsl:attribute></xsl:if>
                                        <td>
                                            <b><xsl:value-of select="ebilet:biletNo"/></b>
                                            <xsl:if test="ebilet:ebiletUrl"><div><a class="link" href="{ebilet:ebiletUrl}">Belgeyi görüntüle</a></div></xsl:if>
                                        </td>
                                        <td>
                                            <span class="badge">
                                                <xsl:choose>
                                                    <xsl:when test="ebilet:belgeTip='IADE'">İade</xsl:when>
                                                    <xsl:otherwise>Satış</xsl:otherwise>
                                                </xsl:choose>
                                            </span>
                                        </td>
                                        <td><xsl:call-template name="tarih"><xsl:with-param name="d" select="ebilet:duzenlenmeTarihi"/></xsl:call-template></td>
                                        <xsl:if test="$rapor/ebilet:bilet/ebilet:seferZamani or $rapor/ebilet:bilet/ebilet:etkinlikZamani">
                                            <td><xsl:call-template name="zaman"><xsl:with-param name="d" select="ebilet:seferZamani | ebilet:etkinlikZamani"/></xsl:call-template></td>
                                        </xsl:if>
                                        <xsl:if test="$rapor/ebilet:bilet/ebilet:yer">
                                            <td>
                                                <xsl:if test="ebilet:yer">
                                                    <xsl:variable name="il" select="substring-before(substring-after($ILLER, concat('|', ebilet:yer/ebilet:ilkod)), '|')"/>
                                                    <b><xsl:value-of select="$il"/> / <xsl:value-of select="ebilet:yer/ebilet:belediye"/></b>
                                                    <div class="muted"><xsl:value-of select="ebilet:yer/ebilet:aciklama"/></div>
                                                </xsl:if>
                                                <xsl:if test="ebilet:organizator"><div class="muted">Organizatör: <xsl:value-of select="ebilet:organizator"/></div></xsl:if>
                                            </td>
                                        </xsl:if>
                                        <td><xsl:call-template name="odeme"><xsl:with-param name="k" select="ebilet:odemeSekli"/></xsl:call-template></td>
                                        <td class="num">
                                            <xsl:call-template name="tutar"><xsl:with-param name="v" select="ebilet:tutar"/></xsl:call-template>
                                            <xsl:text> </xsl:text>
                                            <xsl:choose><xsl:when test="ebilet:tutar/@paraBirim"><xsl:value-of select="ebilet:tutar/@paraBirim"/></xsl:when><xsl:otherwise>TL</xsl:otherwise></xsl:choose>
                                            <xsl:if test="ebilet:tutar/@kur"><div class="muted">Kur: <xsl:value-of select="ebilet:tutar/@kur"/></div></xsl:if>
                                        </td>
                                        <td class="num">
                                            <xsl:for-each select="ebilet:digerVergiler/ebilet:vergi">
                                                <div><xsl:call-template name="tutar"><xsl:with-param name="v" select="ebilet:tutar"/></xsl:call-template></div>
                                                <div class="muted">
                                                    <xsl:choose><xsl:when test="ebilet:vergiAdi"><xsl:value-of select="ebilet:vergiAdi"/></xsl:when><xsl:otherwise><xsl:value-of select="ebilet:vergiKodu"/></xsl:otherwise></xsl:choose>
                                                    <xsl:if test="ebilet:yuzde"> · %<xsl:value-of select="ebilet:yuzde"/></xsl:if>
                                                </div>
                                            </xsl:for-each>
                                        </td>
                                        <td class="num"><xsl:call-template name="tutar"><xsl:with-param name="v" select="ebilet:kdv"/></xsl:call-template></td>
                                        <td>
                                            <xsl:if test="ebilet:giderGosteren/ebilet:vkn">VKN <xsl:value-of select="ebilet:giderGosteren/ebilet:vkn"/></xsl:if>
                                            <xsl:if test="ebilet:giderGosteren/ebilet:tckn">TCKN <xsl:value-of select="ebilet:giderGosteren/ebilet:tckn"/></xsl:if>
                                        </td>
                                        <td>
                                            <xsl:if test="ebilet:hizmetinNevi">
                                                <b><xsl:call-template name="hizmetTuru"><xsl:with-param name="k" select="ebilet:hizmetinNevi/ebilet:tur"/></xsl:call-template></b>
                                                <div class="muted"><xsl:value-of select="ebilet:hizmetinNevi/ebilet:aciklama"/></div>
                                            </xsl:if>
                                            <xsl:for-each select="ebilet:referanslar/ebilet:referans">
                                                <div class="muted">Referans: <xsl:value-of select="ebilet:no"/> · <xsl:value-of select="ebilet:aciklama"/></div>
                                            </xsl:for-each>
                                        </td>
                                    </tr>
                                </xsl:for-each>
                            </tbody>
                        </table>

                        <xsl:if test="$rapor/ebilet:biletIptal">
                            <div class="section-head">
                                <span class="number">02</span><span class="name">İptal Edilen Biletler</span>
                                <span class="count"><xsl:value-of select="count($rapor/ebilet:biletIptal)"/> kayıt</span>
                            </div>
                            <table class="data cancel">
                                <thead><tr><th>Bilet No</th><th>İptal Zamanı</th><th class="num">Matrah</th><th class="num">KDV</th></tr></thead>
                                <tbody>
                                    <xsl:for-each select="$rapor/ebilet:biletIptal">
                                        <tr>
                                            <td><b><xsl:value-of select="ebilet:biletNo"/></b></td>
                                            <td><xsl:call-template name="zaman"><xsl:with-param name="d" select="ebilet:iptalZamani"/></xsl:call-template></td>
                                            <td class="num">
                                                <xsl:call-template name="tutar"><xsl:with-param name="v" select="ebilet:tutar"/></xsl:call-template>
                                                <xsl:text> </xsl:text>
                                                <xsl:choose><xsl:when test="ebilet:tutar/@paraBirim"><xsl:value-of select="ebilet:tutar/@paraBirim"/></xsl:when><xsl:otherwise>TL</xsl:otherwise></xsl:choose>
                                            </td>
                                            <td class="num"><xsl:call-template name="tutar"><xsl:with-param name="v" select="ebilet:kdv"/></xsl:call-template></td>
                                        </tr>
                                    </xsl:for-each>
                                </tbody>
                            </table>
                        </xsl:if>

                        <div class="footer">
                            <span>İmza zamanı: <xsl:call-template name="zaman"><xsl:with-param name="d" select="$rapor/ebilet:baslik/ds:Signature/ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningTime"/></xsl:call-template></span>
                            <span style="float:right">509 Sıra No.lu VUK Genel Tebliği IV.7 kapsamında elektronik olarak oluşturulmuştur.</span>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
