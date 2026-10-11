<?xml version="1.0" encoding="UTF-8"?>
<!--
  Havalimanı Servisi e-Yolcu Listesi: siyah kalkış panosu, sarı paleta hücreleri ve pano satırı tablo.
  Düzenleyen unvan / adres / vergi dairesi XML'de bulunmadığından aşağıdaki değişkenlerden okunur.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:ebilet="http://ebilet.efatura.gov.tr"
    exclude-result-prefixes="ebilet">
    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="edesign-tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:variable name="duzenleyenUnvan" select="'Havaray Servis Taşımacılık A.Ş.'"/>
    <xsl:variable name="duzenleyenAdres" select="'Cumhuriyet Mahallesi Taksim Caddesi No:3, Beyoğlu / İstanbul'"/>
    <xsl:variable name="duzenleyenVergiDairesi" select="'Beyoğlu'"/>
    <xsl:variable name="duzenleyenTelefon" select="'444 42 87'"/>
    <xsl:variable name="bl" select="/ebilet:eYolcuListesi/ebilet:baslik"/>

    <xsl:template name="tarih">
        <xsl:param name="d"/>
        <xsl:if test="string-length($d) &gt;= 10"><xsl:value-of select="concat(substring($d,9,2),'.',substring($d,6,2),'.',substring($d,1,4))"/></xsl:if>
    </xsl:template>
    <xsl:template name="izgara">
        <xsl:param name="ks"/>
        <xsl:param name="i" select="1"/>
        <xsl:param name="max"/>
        <xsl:if test="$i &lt;= $max">
            <span>
                <xsl:attribute name="class">kt<xsl:if test="$ks[ebilet:koltukNo=$i]"> dolu</xsl:if></xsl:attribute>
                <xsl:value-of select="$i"/>
            </span>
            <xsl:call-template name="izgara">
                <xsl:with-param name="ks" select="$ks"/>
                <xsl:with-param name="i" select="$i + 1"/>
                <xsl:with-param name="max" select="$max"/>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>

    <xsl:template match="/">
        <html lang="tr">
            <head>
                <meta charset="utf-8"/>
                <title>e-Yolcu Listesi <xsl:value-of select="/ebilet:eYolcuListesi/ebilet:yolcuListesi[1]/ebilet:yolcuListesiNo"/></title>
                <style>
                    @page { size: A4; margin: 0; }
                    * { box-sizing: border-box; }
                    table { font-size: inherit; line-height: inherit; color: inherit; }
                    body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .sayfa { width: 210mm; min-height: 297mm; margin: 0 auto; position: relative; }
                    .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #111; background: #fff; }
                    .pano { background: #0a0a0a; color: #fde047; padding: 9mm 12mm 8mm; }
                    .pano .ust { display: flex; justify-content: space-between; align-items: center; } .pano .ust .duz { font-size: 7.8pt; color: #a3a3a3; text-align: right; } .pano .ust .duz b { color: #fde047; font-size: 9pt; display: block; }
                    .pano h1 { margin: 6mm 0 3mm; font-family: Consolas, monospace; font-size: 13pt; letter-spacing: 4px; color: #e5e5e5; font-weight: 400; }
                    .hucre { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.4fr; gap: 2mm; }
                    .hucre div { background: #171717; border-radius: 1mm; padding: 2mm 3mm; } .hucre i { display: block; font-style: normal; font-family: Consolas, monospace; font-size: 6.8pt; color: #737373; letter-spacing: 1.5px; }
                    .hucre b { font-family: Consolas, monospace; font-size: 15pt; letter-spacing: 2px; background: repeating-linear-gradient(180deg, transparent 0 48%, #000 48% 52%, transparent 52% 100%); }
                    .nokta { margin-top: 2mm; font-family: Consolas, monospace; font-size: 9pt; color: #d4d4d4; }
                    .dl { display: flex; align-items: center; gap: 3mm; margin-top: 4mm; font-family: Consolas, monospace; font-size: 8pt; color: #a3a3a3; } .dl .c { flex: 1; height: 2.5mm; background: #262626; } .dl .c div { height: 100%; background: #fde047; }
                    table.y { width: calc(100% - 24mm); margin: 6mm 12mm 0; border-collapse: separate; border-spacing: 0 1.2mm; font-family: Consolas, monospace; font-size: 8.6pt; }
                    table.y th { text-align: left; font-size: 7pt; color: #737373; letter-spacing: 1.5px; font-weight: 400; padding: 0 2.5mm; } table.y th:last-child { text-align: right; }
                    table.y td { background: #f5f5f4; padding: 2.2mm 2.5mm; } table.y td:first-child { border-left: 1.2mm solid #eab308; } .c-koltuk { font-weight: 700; } .c-tutar { text-align: right; } .c-ad { font-family: 'Segoe UI', Arial, sans-serif; text-transform: uppercase; font-weight: 600; }
                    .alt { margin: 5mm 12mm 0; display: grid; grid-template-columns: 1fr 1fr 1.3fr; gap: 3mm; }
                    .alt div { border: 1px solid #e7e5e4; padding: 3mm 4mm; } .alt i { display: block; font-style: normal; font-size: 7pt; color: #78716c; letter-spacing: 1.2px; font-family: Consolas, monospace; } .alt b { font-size: 13pt; }
                    .alt .h { background: #0a0a0a; color: #fde047; border-color: #0a0a0a; } .alt .h i { color: #a3a3a3; }
                    .oz { margin: 5mm 12mm 0; font-family: Consolas, monospace; font-size: 7pt; color: #78716c; word-break: break-all; }
                </style>
            </head>
            <body>
<div class="sayfa">
    <xsl:for-each select="/ebilet:eYolcuListesi/ebilet:yolcuListesi"><div class="pano"><div class="ust"><img data-xslt-obj="obj-logo" alt="Logo" width="150" height="40" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 40'%3E%3Cpath d='M4 26 L30 18 L38 6 L42 8 L38 20 L50 22 L52 26 L36 26 L28 36 L24 34 L28 26 Z' fill='%23fde047'/%3E%3Ctext x='60' y='24' font-family='Consolas,monospace' font-weight='700' font-size='16' fill='%23fde047'%3EHAVARAY%3C/text%3E%3Ctext x='61' y='34' font-family='Consolas,monospace' font-size='7.5' letter-spacing='2' fill='%23a3a3a3'%3ESERVİS%3C/text%3E%3C/svg%3E"/>
        <div class="duz"><b><xsl:value-of select="$duzenleyenUnvan"/></b><div><xsl:value-of select="$duzenleyenAdres"/></div><div><xsl:text>VKN </xsl:text><xsl:value-of select="$bl/ebilet:gonderen/ebilet:vkn"/><xsl:text> · </xsl:text><xsl:value-of select="$duzenleyenVergiDairesi"/><xsl:text> V.D.</xsl:text><xsl:if test="$duzenleyenTelefon!=''"><xsl:text> · </xsl:text><xsl:value-of select="$duzenleyenTelefon"/></xsl:if></div></div></div>
        <h1><xsl:text>KALKIŞ / DEPARTURE · e-YOLCU LİSTESİ</xsl:text></h1>
        <div class="hucre"><div><i><xsl:text>SEFER</xsl:text></i><b><xsl:value-of select="ebilet:seferNumarasi"/></b></div><div><i><xsl:text>SAAT</xsl:text></i><b><xsl:value-of select="substring(substring-after(ebilet:haraketZamani,'T'),1,5)"/></b></div><div><i><xsl:text>TARİH</xsl:text></i><b><xsl:call-template name="tarih"><xsl:with-param name="d" select="ebilet:seferTarihi"/></xsl:call-template></b></div><div><i><xsl:text>PLAKA</xsl:text></i><b><xsl:value-of select="ebilet:aracPlakasi"/></b></div></div>
        <div class="nokta"><xsl:text>▶ </xsl:text><xsl:value-of select="ebilet:hareketNoktasi"/><xsl:text>  ·  LİSTE </xsl:text><xsl:value-of select="ebilet:yolcuListesiNo"/></div>
        <div class="dl"><span><xsl:text>DOLULUK</xsl:text></span><div class="c"><div><xsl:attribute name="style">width:<xsl:value-of select="round(count(ebilet:koltukListesi/ebilet:koltuk) div 27 * 100)"/>%</xsl:attribute></div></div><span><xsl:value-of select="count(ebilet:koltukListesi/ebilet:koltuk)"/><xsl:text>/27</xsl:text></span></div></div>
    <table class="y"><tr><th><xsl:text>KOLTUK</xsl:text></th><th><xsl:text>YOLCU</xsl:text></th><th><xsl:text>KİMLİK</xsl:text></th><th><xsl:text>BİLET</xsl:text></th><th><xsl:text>ÜCRET</xsl:text></th></tr><xsl:for-each select="ebilet:koltukListesi/ebilet:koltuk"><xsl:sort select="ebilet:koltukNo" data-type="number"/><tr><td class="c-koltuk"><xsl:value-of select="ebilet:koltukNo"/></td><td class="c-ad"><xsl:value-of select="ebilet:adSoyad"/></td><td class="c-kimlik"><xsl:choose><xsl:when test="ebilet:pasaportNo"><xsl:value-of select="ebilet:pasaportNo"/></xsl:when><xsl:otherwise><xsl:value-of select="concat(substring(ebilet:tcknYkn,1,3),'*****',substring(ebilet:tcknYkn,9,3))"/></xsl:otherwise></xsl:choose></td><td class="c-bilet"><xsl:value-of select="ebilet:biletNo"/></td><td class="c-tutar"><xsl:value-of select="format-number(ebilet:tutar, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></td></tr></xsl:for-each></table>
    <div class="alt"><div><i><xsl:text>YOLCU</xsl:text></i><b><xsl:value-of select="count(ebilet:koltukListesi/ebilet:koltuk)"/></b></div><div><i><xsl:text>ORTALAMA</xsl:text></i><b><xsl:value-of select="format-number(ebilet:toplamHasilat div count(ebilet:koltukListesi/ebilet:koltuk), '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></b></div><div class="h"><i><xsl:text>TOPLAM HASILAT</xsl:text></i><b><xsl:value-of select="format-number(ebilet:toplamHasilat, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></b></div></div>
    <div class="oz"><xsl:text>VKN </xsl:text><xsl:value-of select="$bl/ebilet:gonderen/ebilet:vkn"/><xsl:text> · UUID </xsl:text><xsl:value-of select="$bl/ebilet:uuid"/><xsl:text> · ÖZET </xsl:text><xsl:value-of select="ebilet:ozetDeger"/></div></xsl:for-each>
</div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
