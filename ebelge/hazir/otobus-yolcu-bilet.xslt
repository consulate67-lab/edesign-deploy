<?xml version="1.0" encoding="UTF-8"?>
<!--
  Biniş Kartı — Şehirlerarası otobüs e-Bileti (509 s. VUK GT IV.7.3.1.1).
  Delikli kesim çizgili ve koçanlı (stub) bilet kartı: kalkış / varış terminali, tarih (gün adı hesaplanır),
  saat, tahmini varış ve yolculuk süresi, yolcu adı-soyadı, TCKN, cinsiyet, koltuk, peron, plaka, PNR;
  altında bileti düzenleyen (unvan, adres, vergi dairesi, VKN), bilet bilgileri, ücret dökümü (KDV dahil),
  yalnız, yolculuk notları ve ödeme türü. e-Bilet görselinde GİB karekodu bulunmaz.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" exclude-result-prefixes="n1 cac cbc">
    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="edesign-tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:template name="tarih">
        <xsl:param name="d"/>
        <xsl:if test="string-length($d) &gt;= 10">
            <xsl:value-of select="concat(substring($d,9,2),'.',substring($d,6,2),'.',substring($d,1,4))"/>
        </xsl:if>
    </xsl:template>

    <!-- Zeller bağıntısı: 0 = Cumartesi -->
    <xsl:template name="gunAdi">
        <xsl:param name="d"/>
        <xsl:variable name="y0" select="number(substring($d,1,4))"/>
        <xsl:variable name="m0" select="number(substring($d,6,2))"/>
        <xsl:variable name="g" select="number(substring($d,9,2))"/>
        <xsl:variable name="m" select="$m0 + 12 * ($m0 &lt; 3)"/>
        <xsl:variable name="y" select="$y0 - ($m0 &lt; 3)"/>
        <xsl:variable name="h" select="($g + floor(13 * ($m + 1) div 5) + ($y mod 100) + floor(($y mod 100) div 4) + floor(floor($y div 100) div 4) + 5 * floor($y div 100)) mod 7"/>
        <xsl:choose>
            <xsl:when test="$h = 0">Cumartesi</xsl:when>
            <xsl:when test="$h = 1">Pazar</xsl:when>
            <xsl:when test="$h = 2">Pazartesi</xsl:when>
            <xsl:when test="$h = 3">Salı</xsl:when>
            <xsl:when test="$h = 4">Çarşamba</xsl:when>
            <xsl:when test="$h = 5">Perşembe</xsl:when>
            <xsl:when test="$h = 6">Cuma</xsl:when>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="barkod">
        <xsl:param name="s"/>
        <xsl:if test="string-length($s) &gt; 0">
            <xsl:variable name="c" select="translate(substring($s,1,1),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','12345678901234567890123456')"/>
            <xsl:variable name="r">
                <xsl:choose>
                    <xsl:when test="string(number($c)) = 'NaN'">4</xsl:when>
                    <xsl:otherwise><xsl:value-of select="number($c)"/></xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <span class="c" style="width:{1 + ($r mod 3)}px"><xsl:text> </xsl:text></span>
            <span class="b" style="width:{1 + floor($r div 5)}px"><xsl:text> </xsl:text></span>
            <span class="c" style="width:{2 - ($r mod 2)}px"><xsl:text> </xsl:text></span>
            <span class="b" style="width:{1 + (($r + 1) mod 2)}px"><xsl:text> </xsl:text></span>
            <xsl:call-template name="barkod"><xsl:with-param name="s" select="substring($s,2)"/></xsl:call-template>
        </xsl:if>
    </xsl:template>

    <xsl:template match="/">
        <xsl:variable name="f" select="/n1:Invoice"/>
        <xsl:variable name="sat" select="$f/cac:AccountingSupplierParty/cac:Party"/>
        <xsl:variable name="yolcuParty" select="($f/cac:BuyerCustomerParty/cac:Party[cac:Person] | $f/cac:AccountingCustomerParty/cac:Party[cac:Person])[1]"/>
        <xsl:variable name="ref" select="$f/cac:AdditionalDocumentReference"/>
        <xsl:variable name="tes" select="$f/cac:Delivery[1]"/>
        <xsl:variable name="donem" select="$f/cac:InvoicePeriod"/>
        <xsl:variable name="lmt" select="$f/cac:LegalMonetaryTotal"/>
        <xsl:variable name="kalkisTerminal">
            <xsl:choose>
                <xsl:when test="contains($tes/cac:DeliveryAddress/cbc:BuildingName,' → ')"><xsl:value-of select="substring-before($tes/cac:DeliveryAddress/cbc:BuildingName,' → ')"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="$tes/cac:DeliveryAddress/cbc:StreetName"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="varisTerminal">
            <xsl:choose>
                <xsl:when test="$tes/cac:DeliveryLocation/cbc:Description"><xsl:value-of select="$tes/cac:DeliveryLocation/cbc:Description"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="substring-after($tes/cac:DeliveryAddress/cbc:BuildingName,' → ')"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="t1" select="$donem/cbc:StartTime"/>
        <xsl:variable name="t2" select="$tes/cac:EstimatedDeliveryPeriod/cbc:StartTime"/>
        <xsl:variable name="dk" select="(number(substring($t2,1,2)) * 60 + number(substring($t2,4,2))) - (number(substring($t1,1,2)) * 60 + number(substring($t1,4,2))) + 1440 * ($tes/cac:EstimatedDeliveryPeriod/cbc:StartDate != $donem/cbc:StartDate)"/>
        <xsl:variable name="pb">
            <xsl:choose>
                <xsl:when test="$f/cbc:DocumentCurrencyCode='TRY'">TL</xsl:when>
                <xsl:otherwise><xsl:value-of select="$f/cbc:DocumentCurrencyCode"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <html lang="tr">
            <head>
                <meta charset="utf-8"/>
                <title><xsl:value-of select="$f/cbc:ID"/></title>
                <style>
                    @page { size: A4; margin: 0; }
                    * { box-sizing: border-box; }
                    table { font-size: inherit; line-height: inherit; color: inherit; }
                    body { margin: 0; background: #fde7d6; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #2a1408; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .sayfa { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff7ed; padding: 10mm 10mm 8mm 10mm; }
                    .ust { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
                    .ust .unvan { font-size: 15px; font-weight: 800; }
                    .ust .gri { color: #9a5b34; font-size: 9px; }
                    .ust .bos { flex: 1; }
                    .ust .tur { text-align: right; }
                    .ust .tur b { display: block; font-size: 18px; color: #ea580c; font-weight: 900; letter-spacing: -0.3px; }
                    .ust .tur span { font-size: 8.5px; letter-spacing: 2px; color: #9a5b34; font-weight: 700; }
                    .bilet { position: relative; display: flex; background: #ffffff; border-radius: 18px; box-shadow: 0 1px 0 #f3c9a8, 0 0 0 1px #f8d9c0; }
                    .govde { flex: 1; border-radius: 18px 0 0 18px; overflow: hidden; }
                    .bant { background: linear-gradient(100deg, #c2410c 0%, #ea580c 60%, #fb923c 100%); color: #ffffff; padding: 9px 16px; display: flex; justify-content: space-between; align-items: center; }
                    .bant .k { font-size: 9px; font-weight: 800; letter-spacing: 3px; }
                    .bant .sefer { font-family: Consolas, monospace; font-size: 12px; font-weight: 700; background: rgba(255,255,255,.18); padding: 1px 8px; border-radius: 9px; }
                    .rota { display: flex; align-items: center; padding: 14px 16px 6px 16px; gap: 10px; }
                    .uc { min-width: 150px; }
                    .uc.son { text-align: right; }
                    .uc .sehir { font-size: 30px; font-weight: 900; letter-spacing: -1px; line-height: 1; text-transform: uppercase; color: #2a1408; }
                    .uc .term { font-size: 10px; color: #9a5b34; margin-top: 3px; font-weight: 600; }
                    .uc .saat { font-size: 20px; font-weight: 800; color: #ea580c; margin-top: 6px; line-height: 1; }
                    .uc .gun { font-size: 9.5px; color: #6b3a1e; margin-top: 2px; }
                    .yol { flex: 1; text-align: center; position: relative; padding-top: 6px; }
                    .yol .hat { border-top: 2.5px dashed #fdba74; position: relative; margin: 0 6px; }
                    .yol .bus { position: absolute; left: 50%; top: -15px; transform: translateX(-50%); background: #ffffff; padding: 0 6px; }
                    .yol .bus span { display: inline-block; background: #ea580c; color: #ffffff; border-radius: 6px 10px 4px 4px; font-size: 9px; font-weight: 800; padding: 3px 9px; letter-spacing: 1px; }
                    .yol .sure { margin-top: 12px; font-size: 10px; color: #9a5b34; font-weight: 700; }
                    .alanlar { display: grid; grid-template-columns: 2fr 1.3fr 1fr; gap: 0; margin: 8px 16px 0 16px; border-top: 1px solid #fde1cb; }
                    .alanlar &gt; div { padding: 7px 0 6px 0; border-bottom: 1px solid #fde1cb; }
                    .alan .k { font-size: 8px; font-weight: 800; letter-spacing: 1.8px; color: #c2410c; text-transform: uppercase; }
                    .alan .d { font-size: 13px; font-weight: 800; margin-top: 1px; }
                    .alan .d.m { font-family: Consolas, monospace; font-size: 12.5px; letter-spacing: .5px; }
                    .alanlar.dort { grid-template-columns: repeat(4, 1fr); border-top: 0; margin-bottom: 12px; }
                    .plk { display: inline-flex; white-space: nowrap; border: 1.5px solid #2a1408; border-radius: 3px; overflow: hidden; background: #ffffff; font-family: 'Arial Narrow', Arial, sans-serif; vertical-align: middle; }
                    .plk .tr { background: #1d4ed8; color: #ffffff; font-size: 7px; font-weight: 700; padding: 3px 3px 0 3px; }
                    .plk .pn { padding: 0 5px; font-weight: 900; font-size: 12px; letter-spacing: .5px; }
                    .kocan { width: 52mm; flex: none; border-left: 2.5px dashed #fdba74; border-radius: 0 18px 18px 0; background: #fff3e6; padding: 12px 12px 10px 14px; display: flex; flex-direction: column; text-align: center; }
                    .centik { position: absolute; width: 22px; height: 22px; border-radius: 50%; background: #fff7ed; right: calc(52mm - 11px); }
                    .centik.a { top: -11px; box-shadow: inset 0 -1px 0 #f8d9c0; }
                    .centik.b { bottom: -11px; box-shadow: inset 0 1px 0 #f8d9c0; }
                    .kocan .k { font-size: 8px; font-weight: 800; letter-spacing: 2px; color: #c2410c; }
                    .kocan .koltuk { font-size: 52px; font-weight: 900; line-height: 1; color: #ea580c; letter-spacing: -2px; }
                    .kocan .kacik { font-size: 8.5px; color: #9a5b34; margin-bottom: 8px; }
                    .kocan .ikili { display: flex; border-top: 1px dashed #fdba74; border-bottom: 1px dashed #fdba74; margin-bottom: 8px; }
                    .kocan .ikili &gt; div { flex: 1; padding: 5px 0; }
                    .kocan .ikili &gt; div + div { border-left: 1px dashed #fdba74; }
                    .kocan .ikili .d { font-size: 17px; font-weight: 900; }
                    .kocan .ad { font-weight: 800; font-size: 11px; text-transform: uppercase; }
                    .kocan .gri { color: #9a5b34; font-size: 9px; margin-bottom: 8px; }
                    .cubuk { display: inline-flex; height: 38px; font-size: 0; line-height: 0; margin: 0 auto; }
                    .cubuk span { display: inline-block; height: 38px; }
                    .cubuk .c { background: #2a1408; }
                    .cubuk .b { background: transparent; }
                    .kocan .no { font-family: Consolas, monospace; font-size: 9px; letter-spacing: 1px; margin-top: 3px; }
                    .kartlar { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 12px; }
                    .kart { background: #ffffff; border-radius: 12px; border: 1px solid #f8d9c0; padding: 9px 12px; }
                    .kart .bas { font-size: 8.5px; font-weight: 800; letter-spacing: 2px; color: #c2410c; text-transform: uppercase; margin-bottom: 5px; }
                    .kart .ad { font-size: 12.5px; font-weight: 800; }
                    .kart .gri { color: #8a5434; line-height: 1.55; }
                    table.bilgi { width: 100%; border-collapse: collapse; }
                    table.bilgi td { padding: 2.5px 0; border-bottom: 1px solid #fdeee2; }
                    table.bilgi tr:last-child td { border-bottom: 0; }
                    table.bilgi td.e { color: #8a5434; white-space: nowrap; padding-right: 8px; }
                    table.bilgi td.d { text-align: right; font-weight: 700; }
                    table.bilgi td.m { font-family: Consolas, monospace; font-size: 8.6px; font-weight: 600; }
                    table.ucret { width: 100%; border-collapse: collapse; }
                    table.ucret th { text-align: left; font-size: 8.5px; font-weight: 800; letter-spacing: 1px; color: #8a5434; text-transform: uppercase; padding: 4px 6px; border-bottom: 2px solid #ea580c; }
                    table.ucret th.s, table.ucret td.s { text-align: right; }
                    table.ucret td { padding: 6px; border-bottom: 1px solid #fdeee2; vertical-align: top; }
                    table.ucret .hz { font-weight: 800; font-size: 11px; }
                    table.ucret .acik { color: #8a5434; font-size: 8.5px; }
                    .alt { display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px; margin-top: 8px; }
                    .yalniz { background: #fff3e6; border-left: 4px solid #ea580c; border-radius: 0 8px 8px 0; padding: 6px 10px; font-weight: 700; margin-bottom: 7px; }
                    .notlar { margin: 0; padding-left: 14px; line-height: 1.55; color: #6b3a1e; }
                    table.top { width: 100%; border-collapse: collapse; }
                    table.top td { padding: 4px 0; border-bottom: 1px solid #fdeee2; }
                    table.top td.d { text-align: right; font-weight: 700; white-space: nowrap; }
                    .odenecek { margin-top: 7px; background: #2a1408; color: #ffffff; border-radius: 12px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; }
                    .odenecek .k { font-size: 9px; font-weight: 800; letter-spacing: 2px; color: #fdba74; }
                    .odenecek .s { font-size: 22px; font-weight: 900; }
                    .odeme { margin-top: 6px; color: #6b3a1e; }
                    .dip { margin-top: 10px; display: flex; justify-content: space-between; font-size: 8px; color: #9a5b34; }
                </style>
            </head>
            <body>
                <div class="sayfa">
                    <div class="ust">
                        <img data-xslt-obj="obj-logo" alt="Logo" width="48" height="48" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect x='2' y='2' width='60' height='60' rx='14' fill='%23ea580c'/%3E%3Crect x='12' y='16' width='40' height='30' rx='6' fill='%23ffffff'/%3E%3Crect x='16' y='20' width='14' height='10' rx='2' fill='%23fdba74'/%3E%3Crect x='34' y='20' width='14' height='10' rx='2' fill='%23fdba74'/%3E%3Ccircle cx='21' cy='48' r='4.5' fill='%232a1408'/%3E%3Ccircle cx='43' cy='48' r='4.5' fill='%232a1408'/%3E%3Crect x='16' y='36' width='32' height='3' rx='1.5' fill='%23ea580c'/%3E%3C/svg%3E"/>
                        <div>
                            <div class="unvan"><xsl:value-of select="$sat/cac:PartyName/cbc:Name"/></div>
                            <div class="gri"><xsl:value-of select="$sat/cac:Contact/cbc:Telephone"/><xsl:text> · </xsl:text><xsl:value-of select="substring-after($sat/cbc:WebsiteURI,'://')"/></div>
                        </div>
                        <div class="bos"><xsl:text> </xsl:text></div>
                        <div class="tur"><span>e-BİLET · <xsl:value-of select="$f/cbc:InvoiceTypeCode"/></span><b>Otobüs Yolcu Bileti</b></div>
                    </div>

                    <div class="bilet">
                        <div class="centik a"><xsl:text> </xsl:text></div>
                        <div class="centik b"><xsl:text> </xsl:text></div>
                        <div class="govde">
                            <div class="bant">
                                <span class="k">BİNİŞ KARTI · BOARDING PASS</span>
                                <span class="sefer">SEFER <xsl:value-of select="$ref[cbc:DocumentType='SEFERNO']/cbc:ID"/></span>
                            </div>
                            <div class="rota">
                                <div class="uc">
                                    <div class="sehir"><xsl:value-of select="$tes/cac:DeliveryAddress/cbc:CityName"/></div>
                                    <div class="term"><xsl:value-of select="$kalkisTerminal"/></div>
                                    <div class="saat"><xsl:value-of select="substring($t1,1,5)"/></div>
                                    <div class="gun"><xsl:call-template name="tarih"><xsl:with-param name="d" select="$donem/cbc:StartDate"/></xsl:call-template><xsl:text> · </xsl:text><xsl:call-template name="gunAdi"><xsl:with-param name="d" select="$donem/cbc:StartDate"/></xsl:call-template></div>
                                </div>
                                <div class="yol">
                                    <div class="hat"><div class="bus"><span>OTOBÜS</span></div></div>
                                    <xsl:if test="$t2"><div class="sure">≈ <xsl:value-of select="floor($dk div 60)"/> sa <xsl:value-of select="$dk mod 60"/> dk yolculuk</div></xsl:if>
                                </div>
                                <div class="uc son">
                                    <div class="sehir"><xsl:value-of select="$tes/cac:DeliveryLocation/cac:Address/cbc:CityName"/></div>
                                    <div class="term"><xsl:value-of select="$varisTerminal"/></div>
                                    <div class="saat"><xsl:value-of select="substring($t2,1,5)"/></div>
                                    <div class="gun">tahmini varış · <xsl:call-template name="tarih"><xsl:with-param name="d" select="$tes/cac:EstimatedDeliveryPeriod/cbc:StartDate"/></xsl:call-template></div>
                                </div>
                            </div>
                            <div class="alanlar">
                                <div class="alan"><div class="k">Yolcu · Passenger</div><div class="d"><xsl:value-of select="$yolcuParty/cac:Person/cbc:FirstName"/><xsl:text> </xsl:text><xsl:value-of select="$yolcuParty/cac:Person/cbc:FamilyName"/></div></div>
                                <div class="alan"><div class="k">T.C. Kimlik No</div><div class="d m"><xsl:value-of select="$yolcuParty/cac:PartyIdentification/cbc:ID[@schemeID='TCKN']"/></div></div>
                                <div class="alan"><div class="k">Cinsiyet</div><div class="d"><xsl:choose><xsl:when test="$ref[cbc:DocumentType='CINSIYET']/cbc:ID='KADIN'">Kadın</xsl:when><xsl:when test="$ref[cbc:DocumentType='CINSIYET']/cbc:ID='ERKEK'">Erkek</xsl:when><xsl:otherwise><xsl:value-of select="$ref[cbc:DocumentType='CINSIYET']/cbc:ID"/></xsl:otherwise></xsl:choose></div></div>
                            </div>
                            <div class="alanlar dort">
                                <div class="alan"><div class="k">Koltuk</div><div class="d"><xsl:value-of select="$ref[cbc:DocumentType='KOLTUKNO']/cbc:ID"/></div></div>
                                <div class="alan"><div class="k">Peron</div><div class="d"><xsl:value-of select="$ref[cbc:DocumentType='PERON']/cbc:ID"/></div></div>
                                <div class="alan"><div class="k">Araç Plakası</div><div class="d">
                                    <xsl:variable name="p" select="$ref[cbc:DocumentType='PLAKA']/cbc:ID"/>
                                    <xsl:variable name="harf" select="translate(substring($p,3),'0123456789','')"/>
                                    <span class="plk"><span class="tr">TR</span><span class="pn"><xsl:value-of select="concat(substring($p,1,2),' ',$harf,' ',substring($p,3 + string-length($harf)))"/></span></span>
                                </div></div>
                                <div class="alan"><div class="k">PNR</div><div class="d m"><xsl:value-of select="$ref[cbc:DocumentType='PNR']/cbc:ID"/></div></div>
                            </div>
                        </div>
                        <div class="kocan">
                            <div class="k">KOLTUK</div>
                            <div class="koltuk"><xsl:value-of select="$ref[cbc:DocumentType='KOLTUKNO']/cbc:ID"/></div>
                            <div class="kacik"><xsl:value-of select="$ref[cbc:DocumentType='KOLTUKNO']/cbc:DocumentDescription"/></div>
                            <div class="ikili">
                                <div><div class="k">PERON</div><div class="d"><xsl:value-of select="$ref[cbc:DocumentType='PERON']/cbc:ID"/></div></div>
                                <div><div class="k">KALKIŞ</div><div class="d"><xsl:value-of select="substring($t1,1,5)"/></div></div>
                            </div>
                            <div class="ad"><xsl:value-of select="$yolcuParty/cac:Person/cbc:FirstName"/><xsl:text> </xsl:text><xsl:value-of select="$yolcuParty/cac:Person/cbc:FamilyName"/></div>
                            <div class="gri"><xsl:call-template name="tarih"><xsl:with-param name="d" select="$donem/cbc:StartDate"/></xsl:call-template><xsl:text> · </xsl:text><xsl:value-of select="$ref[cbc:DocumentType='SEFERNO']/cbc:ID"/></div>
                            <div class="cubuk"><xsl:call-template name="barkod"><xsl:with-param name="s" select="$f/cbc:ID"/></xsl:call-template></div>
                            <div class="no"><xsl:value-of select="$f/cbc:ID"/></div>
                        </div>
                    </div>

                    <div class="kartlar">
                        <div class="kart">
                            <div class="bas">Bileti Düzenleyen</div>
                            <div class="ad"><xsl:value-of select="$sat/cac:PartyName/cbc:Name"/></div>
                            <div class="gri">
                                <xsl:value-of select="$sat/cac:PostalAddress/cbc:StreetName"/><xsl:text>, </xsl:text><xsl:value-of select="$sat/cac:PostalAddress/cbc:PostalZone"/><xsl:text> </xsl:text><xsl:value-of select="$sat/cac:PostalAddress/cbc:CitySubdivisionName"/><xsl:text> / </xsl:text><xsl:value-of select="$sat/cac:PostalAddress/cbc:CityName"/><br/>
                                <xsl:text>Vergi Dairesi: </xsl:text><b><xsl:value-of select="$sat/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/></b><xsl:text> · </xsl:text><xsl:value-of select="$sat/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']/@schemeID"/><xsl:text>: </xsl:text><b><xsl:value-of select="$sat/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']"/></b><br/>
                                <xsl:value-of select="$sat/cac:Contact/cbc:ElectronicMail"/>
                            </div>
                            <xsl:if test="$f/cac:BuyerCustomerParty/cac:Party[cac:Person]">
                                <div class="bas" style="margin-top:6px">Gider Gösteren</div>
                                <div class="ad"><xsl:value-of select="$f/cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/></div>
                                <div class="gri">VKN: <xsl:value-of select="$f/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID"/></div>
                            </xsl:if>
                        </div>
                        <div class="kart">
                            <div class="bas">Bilet Bilgileri</div>
                            <table class="bilgi">
                                <tr><td class="e">Bilet No</td><td class="d"><xsl:value-of select="$f/cbc:ID"/></td></tr>
                                <tr><td class="e">Düzenlenme</td><td class="d"><xsl:call-template name="tarih"><xsl:with-param name="d" select="$f/cbc:IssueDate"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring($f/cbc:IssueTime,1,5)"/></td></tr>
                                <tr><td class="e">Senaryo / Tip</td><td class="d"><xsl:value-of select="$f/cbc:ProfileID"/><xsl:text> · </xsl:text><xsl:value-of select="$f/cbc:InvoiceTypeCode"/></td></tr>
                                <tr><td class="e">Araç</td><td class="d"><xsl:value-of select="$ref[cbc:DocumentType='PLAKA']/cbc:DocumentDescription"/></td></tr>
                                <tr><td class="e">ETTN</td><td class="d m"><xsl:value-of select="$f/cbc:UUID"/></td></tr>
                            </table>
                        </div>
                    </div>

                    <div class="kart" style="margin-top:9px">
                        <div class="bas">Ücret Dökümü</div>
                        <table class="ucret">
                            <thead>
                                <tr>
                                    <th>Hizmetin Nevi</th>
                                    <th class="s">Miktar</th>
                                    <th class="s">KDV Hariç</th>
                                    <th class="s">KDV</th>
                                    <th class="s">KDV Tutarı</th>
                                    <th class="s">KDV Dahil</th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:for-each select="$f/cac:InvoiceLine">
                                    <tr class="kalem">
                                        <td><div class="hz"><xsl:value-of select="cac:Item/cbc:Name"/></div><div class="acik"><xsl:value-of select="cac:Item/cbc:Description"/></div></td>
                                        <td class="s"><xsl:value-of select="format-number(cbc:InvoicedQuantity,'#.##0','edesign-tr')"/></td>
                                        <td class="s"><xsl:value-of select="format-number(cbc:LineExtensionAmount,'#.##0,00','edesign-tr')"/></td>
                                        <td class="s">%<xsl:value-of select="cac:TaxTotal/cac:TaxSubtotal/cbc:Percent"/></td>
                                        <td class="s"><xsl:value-of select="format-number(cac:TaxTotal/cbc:TaxAmount,'#.##0,00','edesign-tr')"/></td>
                                        <td class="s"><b><xsl:value-of select="format-number(cbc:LineExtensionAmount + cac:TaxTotal/cbc:TaxAmount,'#.##0,00','edesign-tr')"/></b></td>
                                    </tr>
                                </xsl:for-each>
                            </tbody>
                        </table>
                        <div class="alt">
                            <div>
                                <xsl:for-each select="$f/cbc:Note[starts-with(.,'Yalnız')]"><div class="yalniz"><xsl:value-of select="."/></div></xsl:for-each>
                                <ul class="notlar">
                                    <xsl:for-each select="$f/cbc:Note[not(starts-with(.,'Yalnız'))]"><li><xsl:value-of select="."/></li></xsl:for-each>
                                </ul>
                            </div>
                            <div>
                                <table class="top">
                                    <tr><td>KDV Matrahı</td><td class="d"><xsl:value-of select="format-number($lmt/cbc:TaxExclusiveAmount,'#.##0,00','edesign-tr')"/><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr>
                                    <xsl:for-each select="$f/cac:TaxTotal/cac:TaxSubtotal">
                                        <tr><td>Hesaplanan KDV (%<xsl:value-of select="cbc:Percent"/>)</td><td class="d"><xsl:value-of select="format-number(cbc:TaxAmount,'#.##0,00','edesign-tr')"/><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr>
                                    </xsl:for-each>
                                </table>
                                <div class="odenecek"><span class="k">BİLET TUTARI</span><span class="s"><xsl:value-of select="format-number($lmt/cbc:PayableAmount,'#.##0,00','edesign-tr')"/><xsl:text> </xsl:text><xsl:value-of select="$pb"/></span></div>
                                <xsl:for-each select="$f/cac:PaymentMeans">
                                    <div class="odeme">
                                        <b>Ödeme türü: </b>
                                        <xsl:choose>
                                            <xsl:when test="cbc:PaymentMeansCode='10'">Nakit</xsl:when>
                                            <xsl:when test="cbc:PaymentMeansCode='48'">Banka kartı</xsl:when>
                                            <xsl:when test="cbc:PaymentMeansCode='54'">Kredi kartı</xsl:when>
                                            <xsl:otherwise>Diğer (<xsl:value-of select="cbc:PaymentMeansCode"/>)</xsl:otherwise>
                                        </xsl:choose>
                                        <xsl:if test="cbc:PaymentDueDate"><xsl:text> · </xsl:text><xsl:call-template name="tarih"><xsl:with-param name="d" select="cbc:PaymentDueDate"/></xsl:call-template></xsl:if>
                                        <xsl:if test="cbc:InstructionNote"><br/><span style="color:#9a5b34"><xsl:value-of select="cbc:InstructionNote"/></span></xsl:if>
                                    </div>
                                </xsl:for-each>
                            </div>
                        </div>
                    <xsl:if test="/*/cbc:DocumentCurrencyCode != 'TRY' and number(/*/cac:PricingExchangeRate/cbc:CalculationRate) &gt; 0"><xsl:variable name="tlKur" select="number(/*/cac:PricingExchangeRate/cbc:CalculationRate)"/><xsl:variable name="tlKurTarih" select="(/*/cac:PricingExchangeRate/cbc:Date | /*/cbc:IssueDate)[1]"/><div data-tl-karsilik="1" style="margin-top:8px;padding:7px 9px;border:1px dashed #94a3b8;border-radius:6px;background:#f8fafc;font-size:0.92em;color:#0f172a;page-break-inside:avoid"><div style="font-weight:700">TL Karşılıkları</div><div style="font-size:0.88em;color:#475569;margin:1px 0 4px">1 <xsl:value-of select="/*/cbc:DocumentCurrencyCode"/> = <xsl:value-of select="format-number($tlKur, '###.##0,0000', 'edesign-tr')"/> TL (TCMB döviz alış, <xsl:value-of select="concat(substring($tlKurTarih, 9, 2), '.', substring($tlKurTarih, 6, 2), '.', substring($tlKurTarih, 1, 4))"/>)</div><table style="width:100%;border-collapse:collapse"><tr><td style="padding:2px 0">Mal / Hizmet Toplamı (TL)</td><td style="padding:2px 0;text-align:right;white-space:nowrap"><xsl:value-of select="format-number(/*/cac:LegalMonetaryTotal/cbc:LineExtensionAmount * $tlKur, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></td></tr><xsl:if test="/*/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount &gt; 0"><tr><td style="padding:2px 0">Toplam İskonto (TL)</td><td style="padding:2px 0;text-align:right;white-space:nowrap"><xsl:text>− </xsl:text><xsl:value-of select="format-number(/*/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount * $tlKur, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></td></tr></xsl:if><tr><td style="padding:2px 0">Hesaplanan KDV (TL)</td><td style="padding:2px 0;text-align:right;white-space:nowrap"><xsl:value-of select="format-number(sum(/*/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015']/cbc:TaxAmount) * $tlKur, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></td></tr><xsl:if test="/*/cac:WithholdingTaxTotal"><tr><td style="padding:2px 0">KDV Tevkifatı (TL)</td><td style="padding:2px 0;text-align:right;white-space:nowrap"><xsl:text>− </xsl:text><xsl:value-of select="format-number(sum(/*/cac:WithholdingTaxTotal/cbc:TaxAmount) * $tlKur, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></td></tr></xsl:if><tr><td style="padding:2px 0">Vergiler Dahil Toplam (TL)</td><td style="padding:2px 0;text-align:right;white-space:nowrap"><xsl:value-of select="format-number(/*/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount * $tlKur, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></td></tr><tr><td style="padding:2px 0;font-weight:700">Ödenecek Tutar (TL)</td><td style="padding:2px 0;text-align:right;white-space:nowrap;font-weight:700"><xsl:value-of select="format-number(/*/cac:LegalMonetaryTotal/cbc:PayableAmount * $tlKur, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></td></tr></table></div></xsl:if></div>
                    <div class="dip">
                        <span>509 sıra no.lu VUK Genel Tebliği kapsamında düzenlenen e-Bilettir.</span>
                        <span>ETTN: <xsl:value-of select="$f/cbc:UUID"/></span>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>