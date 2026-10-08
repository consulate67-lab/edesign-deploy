<?xml version="1.0" encoding="UTF-8"?>
<!--
  Hazır şablon: Günlük Araç Kiralama e-Arşiv Faturası — kırmızı / antrasit, yarış çizgisi tipografi.
  Plaka görünümlü araç paneli, teslim / iade şube-tarih-kilometre sayaçları; kullanılan km
  ("İade KM:" − "Teslim KM:") ve kiralama günü (InvoicePeriod) hesaplanır. Satır iskontoları
  (AllowanceCharge) ayrı sütunda; "Depozito:" notu uyarı kutusunda, "Yalnız ..." yazıyla tutar alanında.
  Diğer anahtarlı notlar: "Plaka:", "Araç:", "Araç Özellikleri:" (· ile ayrılır), "Sözleşme No:",
  "Teslim:", "İade:", "Yakıt:", "Ek Sürücü:".
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="n1 cac cbc">

    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:variable name="inv" select="/n1:Invoice"/>
    <xsl:variable name="seller" select="$inv/cac:AccountingSupplierParty/cac:Party"/>
    <xsl:variable name="buyer" select="$inv/cac:AccountingCustomerParty/cac:Party"/>
    <xsl:variable name="lmt" select="$inv/cac:LegalMonetaryTotal"/>
    <xsl:variable name="period" select="$inv/cac:InvoicePeriod"/>
    <xsl:variable name="keys" select="'|Plaka:|Araç:|Araç Özellikleri:|Sözleşme No:|Teslim:|İade:|Teslim KM:|İade KM:|Yakıt:|Ek Sürücü:|Depozito:|'"/>
    <xsl:variable name="pb">
        <xsl:choose>
            <xsl:when test="$inv/cbc:DocumentCurrencyCode = 'TRY' or not($inv/cbc:DocumentCurrencyCode)">TL</xsl:when>
            <xsl:otherwise><xsl:value-of select="$inv/cbc:DocumentCurrencyCode"/></xsl:otherwise>
        </xsl:choose>
    </xsl:variable>

    <xsl:template name="para">
        <xsl:param name="v"/>
        <xsl:value-of select="format-number(number($v), '###.##0,00', 'tr')"/>
    </xsl:template>

    <xsl:template name="tarih">
        <xsl:param name="d"/>
        <xsl:if test="string-length($d) &gt;= 10">
            <xsl:value-of select="concat(substring($d, 9, 2), '.', substring($d, 6, 2), '.', substring($d, 1, 4))"/>
        </xsl:if>
    </xsl:template>

    <xsl:template name="not">
        <xsl:param name="k"/>
        <xsl:value-of select="normalize-space(substring-after($inv/cbc:Note[starts-with(., $k)][1], ':'))"/>
    </xsl:template>

    <xsl:template name="jdn">
        <xsl:param name="d"/>
        <xsl:variable name="y" select="number(substring($d, 1, 4))"/>
        <xsl:variable name="m" select="number(substring($d, 6, 2))"/>
        <xsl:variable name="a" select="floor((14 - $m) div 12)"/>
        <xsl:variable name="yy" select="$y + 4800 - $a"/>
        <xsl:variable name="mm" select="$m + 12 * $a - 3"/>
        <xsl:value-of select="number(substring($d, 9, 2)) + floor((153 * $mm + 2) div 5) + 365 * $yy + floor($yy div 4) - floor($yy div 100) + floor($yy div 400) - 32045"/>
    </xsl:template>

    <xsl:template name="odo">
        <xsl:param name="s"/>
        <xsl:if test="string-length($s) &gt; 0">
            <span class="dg"><xsl:value-of select="substring($s, 1, 1)"/></span>
            <xsl:call-template name="odo"><xsl:with-param name="s" select="substring($s, 2)"/></xsl:call-template>
        </xsl:if>
    </xsl:template>

    <xsl:template name="specs">
        <xsl:param name="s"/>
        <xsl:choose>
            <xsl:when test="contains($s, ' · ')">
                <span class="spec"><xsl:value-of select="substring-before($s, ' · ')"/></span>
                <xsl:call-template name="specs"><xsl:with-param name="s" select="substring-after($s, ' · ')"/></xsl:call-template>
            </xsl:when>
            <xsl:when test="normalize-space($s)"><span class="spec"><xsl:value-of select="$s"/></span></xsl:when>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="birim">
        <xsl:param name="c"/>
        <xsl:choose>
            <xsl:when test="$c = 'DAY'">gün</xsl:when>
            <xsl:when test="$c = 'C62' or $c = 'NIU'">adet</xsl:when>
            <xsl:when test="$c = 'HUR'">saat</xsl:when>
            <xsl:when test="$c = 'KMT'">km</xsl:when>
            <xsl:otherwise><xsl:value-of select="$c"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="nokta">
        <xsl:param name="label"/>
        <xsl:param name="yer"/>
        <xsl:param name="d"/>
        <xsl:param name="t"/>
        <xsl:param name="km"/>
        <div class="pt">
            <div class="pk"><xsl:value-of select="$label"/></div>
            <div class="pd"><xsl:call-template name="tarih"><xsl:with-param name="d" select="$d"/></xsl:call-template><span><xsl:value-of select="substring($t, 1, 5)"/></span></div>
            <div class="py"><xsl:value-of select="$yer"/></div>
            <xsl:if test="normalize-space($km)">
                <div class="odo"><xsl:call-template name="odo"><xsl:with-param name="s" select="substring(concat('000000', $km), string-length($km) + 1)"/></xsl:call-template><i>km</i></div>
            </xsl:if>
        </div>
    </xsl:template>

    <xsl:template match="/">
        <xsl:variable name="km1"><xsl:call-template name="not"><xsl:with-param name="k" select="'Teslim KM:'"/></xsl:call-template></xsl:variable>
        <xsl:variable name="km2"><xsl:call-template name="not"><xsl:with-param name="k" select="'İade KM:'"/></xsl:call-template></xsl:variable>
        <xsl:variable name="days">
            <xsl:if test="$period/cbc:StartDate and $period/cbc:EndDate">
                <xsl:variable name="j1"><xsl:call-template name="jdn"><xsl:with-param name="d" select="$period/cbc:StartDate"/></xsl:call-template></xsl:variable>
                <xsl:variable name="j2"><xsl:call-template name="jdn"><xsl:with-param name="d" select="$period/cbc:EndDate"/></xsl:call-template></xsl:variable>
                <xsl:variable name="extra">
                    <xsl:choose>
                        <xsl:when test="number(translate(substring($period/cbc:EndTime, 1, 5), ':', '')) &gt; number(translate(substring($period/cbc:StartTime, 1, 5), ':', '')) + 100">1</xsl:when>
                        <xsl:otherwise>0</xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:value-of select="number($j2) - number($j1) + number($extra)"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="allow" select="sum($inv/cac:InvoiceLine/cac:AllowanceCharge[cbc:ChargeIndicator = 'false']/cbc:Amount)"/>
        <html lang="tr">
            <head>
                <meta charset="UTF-8"/>
                <title>e-Arşiv Fatura — <xsl:value-of select="$inv/cbc:ID"/></title>
                <style type="text/css"><![CDATA[
                    @page { size: A4; margin: 0; }
                    * { box-sizing: border-box; }
                    table { font-size: inherit; line-height: inherit; color: inherit; border-collapse: collapse; }
                    body { margin: 0; background: #d4d4d8; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #18181b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 0 0 7mm; position: relative; }
                    .din { font-family: Bahnschrift, 'DIN Alternate', 'Arial Narrow', Arial, sans-serif; }
                    .top { display: flex; align-items: stretch; height: 40mm; }
                    .brand { width: 84mm; background: #e11d48; color: #fff; padding: 8mm 14mm 6mm 10mm; clip-path: polygon(0 0, 100% 0, 84% 100%, 0 100%); display: flex; flex-direction: column; justify-content: center; position: relative; }
                    .brand:after { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 16px; }
                    .brand .row { display: flex; align-items: center; gap: 9px; }
                    .logo { width: 46px; height: 46px; display: block; }
                    .bn { font-family: Bahnschrift, 'Arial Narrow', Arial, sans-serif; font-size: 15px; font-weight: 700; line-height: 1.15; letter-spacing: .2px; }
                    .ba { font-size: 8.5px; color: #ffe4e6; margin-top: 6px; line-height: 1.45; padding-right: 8mm; }
                    .stripe { width: 8mm; background: #18181b; clip-path: polygon(40% 0, 100% 0, 60% 100%, 0 100%); margin-left: -7mm; }
                    .title { flex: 1; padding: 8mm 4mm 0 5mm; }
                    .title .t1 { font-family: Bahnschrift, 'Arial Narrow', Arial, sans-serif; font-size: 25px; font-weight: 700; letter-spacing: .5px; color: #18181b; line-height: 1; text-transform: uppercase; }
                    .title .t2 { font-size: 8px; letter-spacing: 3px; color: #e11d48; text-transform: uppercase; font-weight: 700; margin-top: 4px; }
                    table.meta { margin-top: 3mm; }
                    table.meta td { padding: 1.5px 10px 1.5px 0; white-space: nowrap; }
                    table.meta td.k { color: #71717a; font-size: 7.5px; letter-spacing: 1.4px; text-transform: uppercase; }
                    table.meta td.v { font-weight: 700; }
                    .mono { font-family: Consolas, 'Courier New', monospace; font-size: 9px; font-weight: 600; }
                    .qr { padding: 6mm 10mm 0 0; }
                    .body { padding: 0 10mm; }
                    .car { margin-top: 4mm; background: #18181b; color: #fff; border-radius: 6px; overflow: hidden; position: relative; }
                    .car:before { content: ''; position: absolute; right: -30px; top: 0; bottom: 0; width: 160px; background: repeating-linear-gradient(115deg, rgba(225,29,72,.0) 0 18px, rgba(225,29,72,.22) 18px 30px); }
                    .car .in { display: flex; gap: 12px; padding: 12px 14px; position: relative; }
                    .veh { width: 66mm; }
                    .plate { display: inline-flex; align-items: stretch; background: #fff; border: 2px solid #0a0a0a; border-radius: 5px; overflow: hidden; height: 38px; box-shadow: 0 0 0 2px #fff; }
                    .plate .eu { width: 18px; background: #1d4ed8; color: #fff; font-size: 8px; font-weight: 700; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 3px; }
                    .plate .eu b { color: #facc15; font-size: 7px; letter-spacing: -1px; margin-bottom: 4px; }
                    .plate .no { font-family: Bahnschrift, 'Arial Narrow', Arial, sans-serif; font-weight: 700; font-size: 25px; letter-spacing: 1.5px; color: #0a0a0a; padding: 0 10px; line-height: 34px; white-space: nowrap; }
                    .vn { font-family: Bahnschrift, 'Arial Narrow', Arial, sans-serif; font-size: 13px; font-weight: 600; margin-top: 8px; line-height: 1.25; }
                    .spec { display: inline-block; margin: 5px 4px 0 0; border: 1px solid #3f3f46; border-radius: 3px; padding: 1px 6px; font-size: 8.5px; color: #e4e4e7; }
                    .pts { flex: 1; display: flex; gap: 0; }
                    .pt { flex: 1; padding: 0 12px; border-left: 1px solid #3f3f46; }
                    .pk { font-size: 7.5px; letter-spacing: 2.4px; color: #fb7185; font-weight: 700; text-transform: uppercase; }
                    .pd { font-family: Bahnschrift, 'Arial Narrow', Arial, sans-serif; font-size: 18px; font-weight: 600; margin-top: 2px; white-space: nowrap; }
                    .pd span { font-size: 12px; color: #fda4af; margin-left: 6px; }
                    .py { color: #d4d4d8; font-size: 8.8px; margin-top: 2px; min-height: 22px; line-height: 1.3; }
                    .odo { margin-top: 5px; white-space: nowrap; }
                    .dg { display: inline-block; width: 15px; height: 21px; line-height: 21px; text-align: center; background: #0a0a0a; border: 1px solid #52525b; border-radius: 2px; margin-right: 2px; font-family: Consolas, 'Courier New', monospace; font-weight: 700; font-size: 13px; color: #fff; }
                    .odo i { font-style: normal; font-size: 8px; color: #a1a1aa; margin-left: 4px; }
                    .stats { display: flex; background: #27272a; position: relative; }
                    .stats > div { flex: 1; padding: 6px 14px; border-right: 1px solid #3f3f46; }
                    .stats > div:nth-child(-n+2) { flex: .7; }
                    .stats > div:last-child { border-right: 0; flex: 1.6; }
                    .stats .k { font-size: 7px; letter-spacing: 1.8px; color: #a1a1aa; text-transform: uppercase; }
                    .stats .v { font-family: Bahnschrift, 'Arial Narrow', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #fff; }
                    .stats .v.hl { color: #fb7185; }
                    .stats .v small { font-size: 9px; color: #d4d4d8; font-weight: 400; margin-left: 2px; }
                    .parties { display: flex; gap: 10px; margin-top: 4mm; }
                    .party { flex: 1; border-top: 3px solid #18181b; padding-top: 5px; }
                    .party.r { border-top-color: #e11d48; }
                    .party .k { font-size: 7.5px; letter-spacing: 2px; color: #71717a; text-transform: uppercase; font-weight: 700; }
                    .party .n { font-family: Bahnschrift, 'Arial Narrow', Arial, sans-serif; font-size: 14px; font-weight: 700; margin: 2px 0 3px; }
                    .party .t { color: #52525b; line-height: 1.5; font-size: 9px; }
                    table.items { width: 100%; margin-top: 4mm; }
                    table.items th { background: #18181b; color: #fff; font-size: 7.5px; letter-spacing: 1.4px; text-transform: uppercase; padding: 6px 6px; text-align: left; font-weight: 600; border-bottom: 3px solid #e11d48; }
                    table.items td { padding: 6px 6px; border-bottom: 1px solid #e4e4e7; vertical-align: top; }
                    table.items .r { text-align: right; white-space: nowrap; }
                    .code { font-family: Consolas, 'Courier New', monospace; font-size: 8.5px; font-weight: 700; color: #e11d48; white-space: nowrap; }
                    .it { font-weight: 700; font-size: 10.5px; }
                    .ds { color: #71717a; font-size: 8.8px; margin-top: 1px; }
                    .disc { color: #e11d48; font-weight: 700; }
                    .disc small { display: block; color: #a1a1aa; font-weight: 400; font-size: 7.5px; }
                    .bottom { display: flex; gap: 12px; margin-top: 4mm; align-items: flex-start; }
                    .bottom .l { flex: 1.15; }
                    .bottom .rr { flex: 1; }
                    .words { font-family: Bahnschrift, 'Arial Narrow', Arial, sans-serif; font-size: 11.5px; font-weight: 600; padding: 6px 10px; background: #f4f4f5; border-left: 4px solid #18181b; margin-bottom: 6px; }
                    .depo { border: 1.5px dashed #e11d48; background: #fff1f2; padding: 7px 10px; border-radius: 4px; margin-bottom: 6px; }
                    .depo .k { font-size: 7.5px; letter-spacing: 2px; color: #e11d48; font-weight: 800; text-transform: uppercase; }
                    .depo .t { color: #3f3f46; font-size: 9px; margin-top: 2px; line-height: 1.45; }
                    ul.nt { margin: 0 0 6px; padding-left: 13px; color: #52525b; font-size: 8.6px; line-height: 1.45; }
                    .pay { display: flex; gap: 6px; }
                    .pay div { flex: 1; border: 1px solid #e4e4e7; border-radius: 4px; padding: 5px 8px; font-size: 8.6px; color: #52525b; }
                    .pay b { display: block; font-size: 7px; letter-spacing: 1.8px; text-transform: uppercase; color: #18181b; }
                    .pay .ib { font-family: Consolas, 'Courier New', monospace; font-weight: 700; color: #18181b; font-size: 9px; }
                    table.tot { width: 100%; }
                    table.tot td { padding: 4px 6px; border-bottom: 1px solid #e4e4e7; }
                    table.tot td.v { text-align: right; font-weight: 700; white-space: nowrap; }
                    table.tot tr.minus td.v { color: #e11d48; }
                    table.tot tr.net td { border-bottom: 2px solid #18181b; font-weight: 700; }
                    .grand { margin-top: 6px; background: #18181b; color: #fff; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; border-radius: 4px; position: relative; overflow: hidden; }
                    .grand:after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: #e11d48; }
                    .grand .k { font-size: 8px; letter-spacing: 2.4px; text-transform: uppercase; color: #fda4af; padding-left: 4px; }
                    .grand .v { font-family: Bahnschrift, 'Arial Narrow', Arial, sans-serif; font-size: 24px; font-weight: 700; white-space: nowrap; }
                    .sign { display: flex; gap: 14px; margin-top: 6mm; }
                    .sign div { flex: 1; border-top: 1px solid #18181b; padding-top: 4px; font-size: 7.5px; letter-spacing: 1.8px; text-transform: uppercase; color: #71717a; height: 14mm; }
                    .foot { margin-top: 2mm; color: #a1a1aa; font-size: 8px; text-align: center; }
                    @media print { body { background: #fff; } }
                ]]></style>
            </head>
            <body>
                <div class="page">
                    <div class="top">
                        <div class="brand">
                            <div class="row">
                                <img data-xslt-obj="obj-logo" class="logo" alt="Logo" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='58' fill='%23ffffff'/%3E%3Cpath d='M22 70l10-18c3-5 7-7 12-7h32c5 0 9 2 12 7l10 18v14H22z' fill='%23e11d48'/%3E%3Cpath d='M38 52l5-8h34l5 8z' fill='%23ffe4e6'/%3E%3Ccircle cx='38' cy='84' r='8' fill='%2318181b'/%3E%3Ccircle cx='82' cy='84' r='8' fill='%2318181b'/%3E%3Ctext x='60' y='38' font-family='Arial Black,Arial' font-weight='900' font-size='17' fill='%2318181b' text-anchor='middle'%3EKIYI%3C/text%3E%3C/svg%3E"/>
                                <div class="bn"><xsl:value-of select="$seller/cac:PartyName/cbc:Name"/></div>
                            </div>
                            <div class="ba">
                                <xsl:value-of select="normalize-space(concat($seller/cac:PostalAddress/cbc:StreetName, ' No: ', $seller/cac:PostalAddress/cbc:BuildingNumber, ', ', $seller/cac:PostalAddress/cbc:CitySubdivisionName, ' / ', $seller/cac:PostalAddress/cbc:CityName))"/><br/>
                                <xsl:value-of select="$seller/cac:Contact/cbc:Telephone"/> · <xsl:value-of select="$seller/cbc:WebsiteURI"/>
                            </div>
                        </div>
                        <div class="stripe"><xsl:text> </xsl:text></div>
                        <div class="title">
                            <div class="t1">Kiralama Faturası</div>
                            <div class="t2">e-Arşiv Fatura · Rent a Car</div>
                            <table class="meta">
                                <tr><td class="k">Fatura No</td><td class="v"><xsl:value-of select="$inv/cbc:ID"/></td><td class="k">Tarih</td><td class="v"><xsl:call-template name="tarih"><xsl:with-param name="d" select="$inv/cbc:IssueDate"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring($inv/cbc:IssueTime, 1, 5)"/></td></tr>
                                <tr><td class="k">Senaryo</td><td class="v"><xsl:value-of select="$inv/cbc:ProfileID"/></td><td class="k">Tip</td><td class="v"><xsl:value-of select="$inv/cbc:InvoiceTypeCode"/></td></tr>
                                <tr><td class="k">ETTN</td><td class="mono" colspan="3"><xsl:value-of select="$inv/cbc:UUID"/></td></tr>
                            </table>
                        </div>
                        <div class="qr">
                            <div data-xslt-obj="obj-karekod" data-obj-kind="karekod" style="width:100px;height:100px;margin-left:auto"><div data-karekod-box=""><xsl:text> </xsl:text></div><span data-karekod-value="" style="display:none"><xsl:choose><xsl:when test="/*[local-name()='DespatchAdvice']">{"vkntckn":"<xsl:value-of select="/*/*[local-name()='DespatchSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='DeliveryCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='DespatchAdviceTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","sevktarihi":"<xsl:value-of select="/*/*[local-name()='Shipment']/*[local-name()='Delivery']/*[local-name()='Despatch']/*[local-name()='ActualDespatchDate']"/>","sevkzamani":"<xsl:value-of select="/*/*[local-name()='Shipment']/*[local-name()='Delivery']/*[local-name()='Despatch']/*[local-name()='ActualDespatchTime']"/>","tasiyicivkn":"<xsl:value-of select="/*/*[local-name()='Shipment']/*[local-name()='Delivery']/*[local-name()='CarrierParty']/*[local-name()='PartyIdentification']/*[local-name()='ID']"/>","plaka":"<xsl:value-of select="/*/*[local-name()='Shipment']/*[local-name()='ShipmentStage']/*[local-name()='TransportMeans']/*[local-name()='RoadTransport']/*[local-name()='LicensePlateID']"/>"}</xsl:when><xsl:when test="/*[local-name()='CreditNote']"><xsl:choose><xsl:when test="/*/*[local-name()='ProfileID']='EDOVIZBELGE'">{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='CreditNoteTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","miktari(<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']/@currencyID"/>)":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>","uygulanankur":"<xsl:value-of select="/*/*[local-name()='PaymentExchangeRate']/*[local-name()='CalculationRate']"/>","dovizkarsiligi":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>","tlkarsiligi":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='TaxInclusiveAmount']"/>","odenecek(<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']/@currencyID"/>)":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']"/>"}</xsl:when><xsl:when test="/*/*[local-name()='ProfileID']='EKIYMETLIMADENBELGE'">{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='CreditNoteTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","miktari(<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']/@currencyID"/>)":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>","birimfiyat":"<xsl:value-of select="/*/*[local-name()='PaymentExchangeRate']/*[local-name()='CalculationRate']"/>","odenecek(<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']/@currencyID"/>)":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']"/>"}</xsl:when><xsl:when test="/*/*[local-name()='ProfileID']='GIDERPUSULASI'">{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='CreditNoteTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","parabirimi":"<xsl:value-of select="/*/*[local-name()='DocumentCurrencyCode']"/>","malhizmettoplam":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>","odenecek":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']"/>"}</xsl:when><xsl:when test="starts-with(/*/*[local-name()='ProfileID'],'DEKONT') or starts-with(/*/*[local-name()='ProfileID'],'VTA') or starts-with(/*/*[local-name()='ProfileID'],'GVTA')">{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='CreditNoteTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","parabirimi":"<xsl:value-of select="/*/*[local-name()='DocumentCurrencyCode']"/>","islemtutari":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>","vergilerdahiltoplamtutar":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='TaxInclusiveAmount']"/>","odenecektutar":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']"/>"}</xsl:when><xsl:when test="/*/*[local-name()='CreditNoteTypeCode']='SIGORTAKOMISYONGIDERBELGESI'">{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='CreditNoteTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","parabirimi":"<xsl:value-of select="/*/*[local-name()='DocumentCurrencyCode']"/>","istihsalkomisyon":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='AllowanceTotalAmount']"/>","iptalkomisyon":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='ChargeTotalAmount']"/>"}</xsl:when><xsl:otherwise>{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='CreditNoteTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","parabirimi":"<xsl:value-of select="/*/*[local-name()='DocumentCurrencyCode']"/>","malhizmettoplam":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>","gvstopaj":"<xsl:value-of select="sum(/*/*[local-name()='TaxTotal']/*[local-name()='TaxSubtotal'][*[local-name()='TaxCategory']/*[local-name()='TaxScheme']/*[local-name()='TaxTypeCode']='0003']/*[local-name()='TaxAmount'])"/>","merafonu":"<xsl:value-of select="sum(/*/*[local-name()='TaxTotal']/*[local-name()='TaxSubtotal'][*[local-name()='TaxCategory']/*[local-name()='TaxScheme']/*[local-name()='TaxTypeCode']='9040']/*[local-name()='TaxAmount'])"/>","borsatescilucreti":"<xsl:value-of select="sum(/*/*[local-name()='TaxTotal']/*[local-name()='TaxSubtotal'][*[local-name()='TaxCategory']/*[local-name()='TaxScheme']/*[local-name()='TaxTypeCode']='8001']/*[local-name()='TaxAmount'])"/>","sgkprimkesintisi":"<xsl:value-of select="sum(/*/*[local-name()='TaxTotal']/*[local-name()='TaxSubtotal'][*[local-name()='TaxCategory']/*[local-name()='TaxScheme']/*[local-name()='TaxTypeCode']='SGK_PRIM']/*[local-name()='TaxAmount'])"/>","odenecek":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']"/>"}</xsl:otherwise></xsl:choose></xsl:when><xsl:otherwise>{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='InvoiceTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","parabirimi":"<xsl:value-of select="/*/*[local-name()='DocumentCurrencyCode']"/>","malhizmettoplam":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>"<xsl:for-each select="/*/*[local-name()='TaxTotal']/*[local-name()='TaxSubtotal'][*[local-name()='TaxCategory']/*[local-name()='TaxScheme']/*[local-name()='TaxTypeCode']='0015']">,"kdvmatrah(<xsl:value-of select="*[local-name()='Percent']"/>)":"<xsl:value-of select="*[local-name()='TaxableAmount']"/>","hesaplanankdv(<xsl:value-of select="*[local-name()='Percent']"/>)":"<xsl:value-of select="*[local-name()='TaxAmount']"/>"</xsl:for-each>,"vergidahil":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='TaxInclusiveAmount']"/>","odenecek":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']"/>"}</xsl:otherwise></xsl:choose></span><script type="text/javascript"><![CDATA[/* QRCode.js — Copyright (c) 2012 davidshimjs, MIT License. GİB resmi e-Arşiv XSLT'sinde gömülü sürüm. */
var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();
(function(){var s=document.currentScript,b=s&&s.parentNode;if(!b||typeof QRCode==='undefined')return;var t=b.querySelector('[data-karekod-box]'),d=b.querySelector('[data-karekod-value]');if(!t||!d||t.querySelector('canvas,img'))return;var w=b.clientWidth||120;new QRCode(t,{text:d.textContent.replace(/\s+/g,' ').trim(),width:w,height:w,correctLevel:QRCode.CorrectLevel.M});})();]]></script></div>
                        </div>
                    </div>

                    <div class="body">
                        <div class="car">
                            <div class="in">
                                <div class="veh">
                                    <div class="plate"><div class="eu"><b>★★</b>TR</div><div class="no"><xsl:call-template name="not"><xsl:with-param name="k" select="'Plaka:'"/></xsl:call-template></div></div>
                                    <div class="vn"><xsl:call-template name="not"><xsl:with-param name="k" select="'Araç:'"/></xsl:call-template></div>
                                    <div><xsl:call-template name="specs"><xsl:with-param name="s"><xsl:call-template name="not"><xsl:with-param name="k" select="'Araç Özellikleri:'"/></xsl:call-template></xsl:with-param></xsl:call-template></div>
                                </div>
                                <div class="pts">
                                    <xsl:call-template name="nokta">
                                        <xsl:with-param name="label" select="'Teslim (Çıkış)'"/>
                                        <xsl:with-param name="yer"><xsl:call-template name="not"><xsl:with-param name="k" select="'Teslim:'"/></xsl:call-template></xsl:with-param>
                                        <xsl:with-param name="d" select="$period/cbc:StartDate"/>
                                        <xsl:with-param name="t" select="$period/cbc:StartTime"/>
                                        <xsl:with-param name="km" select="$km1"/>
                                    </xsl:call-template>
                                    <xsl:call-template name="nokta">
                                        <xsl:with-param name="label" select="'İade (Dönüş)'"/>
                                        <xsl:with-param name="yer"><xsl:call-template name="not"><xsl:with-param name="k" select="'İade:'"/></xsl:call-template></xsl:with-param>
                                        <xsl:with-param name="d" select="$period/cbc:EndDate"/>
                                        <xsl:with-param name="t" select="$period/cbc:EndTime"/>
                                        <xsl:with-param name="km" select="$km2"/>
                                    </xsl:call-template>
                                </div>
                            </div>
                            <div class="stats">
                                <div><span class="k">Kiralama</span><div class="v hl"><xsl:value-of select="$days"/><small>gün</small></div></div>
                                <div><span class="k">Kullanılan</span><div class="v"><xsl:if test="number($km2) &gt;= number($km1)"><xsl:value-of select="format-number(number($km2) - number($km1), '###.##0', 'tr')"/></xsl:if><small>km</small></div></div>
                                <div><span class="k">Yakıt</span><div class="v" style="font-size:10.5px;padding-top:3px;white-space:nowrap"><xsl:call-template name="not"><xsl:with-param name="k" select="'Yakıt:'"/></xsl:call-template></div></div>
                                <div><span class="k">Sözleşme No</span><div class="v" style="font-size:11.5px;padding-top:2px;white-space:nowrap"><xsl:call-template name="not"><xsl:with-param name="k" select="'Sözleşme No:'"/></xsl:call-template></div></div>
                                <div><span class="k">Ek Sürücü</span><div class="v" style="font-size:10.5px;padding-top:3px"><xsl:call-template name="not"><xsl:with-param name="k" select="'Ek Sürücü:'"/></xsl:call-template></div></div>
                            </div>
                        </div>

                        <div class="parties">
                            <div class="party">
                                <div class="k">Kiraya Veren</div>
                                <div class="n"><xsl:value-of select="$seller/cac:PartyName/cbc:Name"/></div>
                                <div class="t">
                                    <xsl:value-of select="$seller/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/> V.D. · VKN <xsl:value-of select="$seller/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']"/>
                                    <xsl:if test="$seller/cac:PartyIdentification/cbc:ID[@schemeID = 'MERSISNO']"> · MERSİS <xsl:value-of select="$seller/cac:PartyIdentification/cbc:ID[@schemeID = 'MERSISNO']"/></xsl:if><br/>
                                    <xsl:value-of select="$seller/cac:Contact/cbc:ElectronicMail"/>
                                </div>
                            </div>
                            <div class="party r">
                                <div class="k">Kiracı</div>
                                <div class="n">
                                    <xsl:choose>
                                        <xsl:when test="normalize-space($buyer/cac:PartyName/cbc:Name)"><xsl:value-of select="$buyer/cac:PartyName/cbc:Name"/></xsl:when>
                                        <xsl:otherwise><xsl:value-of select="normalize-space(concat($buyer/cac:Person/cbc:FirstName, ' ', $buyer/cac:Person/cbc:FamilyName))"/></xsl:otherwise>
                                    </xsl:choose>
                                </div>
                                <div class="t">
                                    <xsl:value-of select="normalize-space(concat($buyer/cac:PostalAddress/cbc:StreetName, ' No: ', $buyer/cac:PostalAddress/cbc:BuildingNumber, ', ', $buyer/cac:PostalAddress/cbc:PostalZone, ' ', $buyer/cac:PostalAddress/cbc:CitySubdivisionName, ' / ', $buyer/cac:PostalAddress/cbc:CityName))"/><br/>
                                    <xsl:value-of select="$buyer/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']/@schemeID"/><xsl:text> </xsl:text><xsl:value-of select="$buyer/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']"/>
                                    <xsl:if test="normalize-space($buyer/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name)"> · <xsl:value-of select="$buyer/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/> V.D.</xsl:if>
                                    · <xsl:value-of select="$buyer/cac:Contact/cbc:Telephone"/>
                                </div>
                            </div>
                        </div>

                        <table class="items">
                            <tr>
                                <th style="width:58px">Kod</th>
                                <th>Hizmet</th>
                                <th class="r" style="width:56px">Süre / Adet</th>
                                <th class="r" style="width:64px">Birim Fiyat</th>
                                <th class="r" style="width:66px">İskonto</th>
                                <th class="r" style="width:34px">KDV</th>
                                <th class="r" style="width:80px">Tutar</th>
                            </tr>
                            <xsl:for-each select="$inv/cac:InvoiceLine">
                                <tr>
                                    <td class="code"><xsl:value-of select="cac:Item/cac:SellersItemIdentification/cbc:ID"/></td>
                                    <td>
                                        <div class="it"><xsl:value-of select="cac:Item/cbc:Name"/></div>
                                        <xsl:if test="normalize-space(cac:Item/cbc:Description)"><div class="ds"><xsl:value-of select="cac:Item/cbc:Description"/></div></xsl:if>
                                    </td>
                                    <td class="r"><xsl:value-of select="format-number(cbc:InvoicedQuantity, '###.##0,##', 'tr')"/><xsl:text> </xsl:text><xsl:call-template name="birim"><xsl:with-param name="c" select="cbc:InvoicedQuantity/@unitCode"/></xsl:call-template></td>
                                    <td class="r"><xsl:call-template name="para"><xsl:with-param name="v" select="cac:Price/cbc:PriceAmount"/></xsl:call-template></td>
                                    <td class="r">
                                        <xsl:choose>
                                            <xsl:when test="cac:AllowanceCharge[cbc:ChargeIndicator = 'false']">
                                                <div class="disc">− <xsl:call-template name="para"><xsl:with-param name="v" select="sum(cac:AllowanceCharge[cbc:ChargeIndicator = 'false']/cbc:Amount)"/></xsl:call-template>
                                                    <small><xsl:if test="cac:AllowanceCharge/cbc:MultiplierFactorNumeric">%<xsl:value-of select="cac:AllowanceCharge/cbc:MultiplierFactorNumeric * 100"/> · </xsl:if><xsl:value-of select="cac:AllowanceCharge/cbc:AllowanceChargeReason"/></small>
                                                </div>
                                            </xsl:when>
                                            <xsl:otherwise><span style="color:#d4d4d8">—</span></xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td class="r">%<xsl:value-of select="cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '0015']/cbc:Percent"/></td>
                                    <td class="r"><b><xsl:call-template name="para"><xsl:with-param name="v" select="cbc:LineExtensionAmount"/></xsl:call-template></b><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td>
                                </tr>
                            </xsl:for-each>
                        </table>

                        <div class="bottom">
                            <div class="l">
                                <xsl:for-each select="$inv/cbc:Note[starts-with(., 'Yalnız') or starts-with(., 'YALNIZ')]">
                                    <div class="words"><xsl:value-of select="."/></div>
                                </xsl:for-each>
                                <xsl:if test="$inv/cbc:Note[starts-with(., 'Depozito:')]">
                                    <div class="depo">
                                        <div class="k">Depozito / Provizyon</div>
                                        <div class="t"><xsl:call-template name="not"><xsl:with-param name="k" select="'Depozito:'"/></xsl:call-template></div>
                                    </div>
                                </xsl:if>
                                <ul class="nt">
                                    <xsl:for-each select="$inv/cbc:Note[not(starts-with(., 'Yalnız') or starts-with(., 'YALNIZ')) and not(contains($keys, concat('|', substring-before(., ':'), ':|')))]">
                                        <li><xsl:value-of select="."/></li>
                                    </xsl:for-each>
                                </ul>
                                <div class="pay">
                                    <xsl:for-each select="$inv/cac:PaymentMeans[cac:PayeeFinancialAccount or cbc:PaymentMeansCode = '48' or cbc:PaymentMeansCode = '54' or cbc:PaymentMeansCode = '55' or cbc:PaymentMeansCode = '10']">
                                        <div>
                                            <b>
                                                <xsl:choose>
                                                    <xsl:when test="cbc:PaymentMeansCode = '48' or cbc:PaymentMeansCode = '54' or cbc:PaymentMeansCode = '55'">Kartla Tahsil Edildi</xsl:when>
                                                    <xsl:when test="cbc:PaymentMeansCode = '10'">Nakit</xsl:when>
                                                    <xsl:otherwise>Banka Hesabı</xsl:otherwise>
                                                </xsl:choose>
                                            </b>
                                            <xsl:if test="cac:PayeeFinancialAccount/cbc:ID"><span class="ib"><xsl:value-of select="cac:PayeeFinancialAccount/cbc:ID"/></span><br/><xsl:value-of select="cac:PayeeFinancialAccount/cac:FinancialInstitutionBranch/cac:FinancialInstitution/cbc:Name"/><br/></xsl:if>
                                            <xsl:value-of select="cbc:InstructionNote"/>
                                        </div>
                                    </xsl:for-each>
                                </div>
                            </div>
                            <div class="rr">
                                <table class="tot">
                                    <xsl:if test="$allow &gt; 0">
                                        <tr><td>Brüt Tutar</td><td class="v"><xsl:call-template name="para"><xsl:with-param name="v" select="number($lmt/cbc:LineExtensionAmount) + $allow"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr>
                                        <tr class="minus"><td>İskonto</td><td class="v">− <xsl:call-template name="para"><xsl:with-param name="v" select="$allow"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr>
                                    </xsl:if>
                                    <tr class="net"><td>Mal / Hizmet Toplamı</td><td class="v"><xsl:call-template name="para"><xsl:with-param name="v" select="$lmt/cbc:LineExtensionAmount"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr>
                                    <xsl:for-each select="$inv/cac:TaxTotal/cac:TaxSubtotal">
                                        <tr><td>Hesaplanan <xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:Name"/> (%<xsl:value-of select="cbc:Percent"/>)</td><td class="v"><xsl:call-template name="para"><xsl:with-param name="v" select="cbc:TaxAmount"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr>
                                    </xsl:for-each>
                                    <xsl:for-each select="$inv/cac:WithholdingTaxTotal/cac:TaxSubtotal">
                                        <tr class="minus"><td>KDV Tevkifatı (<xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode"/>)</td><td class="v">− <xsl:call-template name="para"><xsl:with-param name="v" select="cbc:TaxAmount"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr>
                                    </xsl:for-each>
                                    <tr><td>Vergiler Dahil Toplam</td><td class="v"><xsl:call-template name="para"><xsl:with-param name="v" select="$lmt/cbc:TaxInclusiveAmount"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr>
                                </table>
                                <div class="grand">
                                    <span class="k">Ödenecek</span>
                                    <span class="v"><xsl:call-template name="para"><xsl:with-param name="v" select="$lmt/cbc:PayableAmount"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$pb"/></span>
                                </div>
                            </div>
                        </div>

                        <div class="sign">
                            <div>Aracı Teslim Eden</div>
                            <div>Kiracı · Ad Soyad / İmza</div>
                        </div>
                        <div class="foot">Bu fatura e-Arşiv uygulaması kapsamında elektronik ortamda düzenlenmiştir. İyi yolculuklar dileriz.</div>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
