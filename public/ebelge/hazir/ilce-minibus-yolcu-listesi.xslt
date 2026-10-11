<?xml version="1.0" encoding="UTF-8"?>
<!--
  İlçe Minibüsü Günlük e-Yolcu Listesi: sade form başlığı, sefer başına kompakt kart ve günlük toplam.
  Düzenleyen unvan / adres / vergi dairesi XML'de bulunmadığından aşağıdaki değişkenlerden okunur.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:ebilet="http://ebilet.efatura.gov.tr"
    exclude-result-prefixes="ebilet">
    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="edesign-tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:variable name="duzenleyenUnvan" select="'Göksu Ermenek Yolcu Taşıma Kooperatifi'"/>
    <xsl:variable name="duzenleyenAdres" select="'Karaman Otogarı İlçe Peronları No:12, Merkez / Karaman'"/>
    <xsl:variable name="duzenleyenVergiDairesi" select="'Karaman'"/>
    <xsl:variable name="duzenleyenTelefon" select="'(338) 213 40 12'"/>
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
                    .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #134e4a; background: #fff; padding: 12mm 14mm; }
                    .bas { display: grid; grid-template-columns: auto 1fr auto; gap: 6mm; align-items: center; border: 1.5px solid #0f766e; border-radius: 2mm; padding: 4mm 5mm; }
                    .bas h1 { margin: 0; font-size: 15pt; } .bas .duz { font-size: 8.3pt; color: #3f6f6a; } .bas .duz b { color: #134e4a; font-size: 9.5pt; display: block; }
                    .bas .gun { text-align: center; background: #0f766e; color: #fff; border-radius: 2mm; padding: 2.5mm 4mm; } .bas .gun i { display: block; font-style: normal; font-size: 7pt; letter-spacing: 1px; color: #99f6e4; } .bas .gun b { font-size: 12pt; }
                    .sef { margin-top: 6mm; border: 1px solid #99f6e4; border-radius: 2mm; overflow: hidden; }
                    .sef .k { display: grid; grid-template-columns: repeat(5, auto); justify-content: space-between; gap: 3mm; background: #f0fdfa; padding: 3mm 4mm; border-bottom: 1px solid #99f6e4; }
                    .sef .k i { display: block; font-style: normal; font-size: 7.2pt; color: #0d9488; text-transform: uppercase; letter-spacing: .8px; } .sef .k b { font-size: 10pt; }
                    table.y { width: 100%; border-collapse: collapse; } table.y th { font-size: 7.4pt; color: #0d9488; text-transform: uppercase; letter-spacing: .8px; text-align: left; padding: 1.8mm 4mm; border-bottom: 1px solid #ccfbf1; }
                    table.y td { padding: 1.6mm 4mm; border-bottom: 1px solid #f0fdfa; } .c-tutar { text-align: right; } table.y th:last-child { text-align: right; } .c-bilet { font-family: Consolas, monospace; font-size: 7.8pt; color: #3f6f6a; }
                    .sef .t { display: flex; justify-content: flex-end; gap: 8mm; padding: 2.5mm 4mm; font-size: 8.5pt; background: #fafffe; } .sef .t b { color: #0f766e; }
                    .gt { margin-top: 6mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
                    .gt div { border: 1.5px solid #0f766e; border-radius: 2mm; padding: 3.5mm 4mm; } .gt i { display: block; font-style: normal; font-size: 7.4pt; color: #0d9488; text-transform: uppercase; letter-spacing: 1px; } .gt b { font-size: 14pt; }
                    .gt .h { background: #0f766e; color: #fff; } .gt .h i { color: #99f6e4; }
                    .uuid { margin-top: 6mm; font-size: 7.4pt; color: #3f6f6a; }
                </style>
            </head>
            <body>
<div class="sayfa">
    <div class="bas"><img data-xslt-obj="obj-logo" alt="Logo" width="64" height="40" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 40'%3E%3Crect x='2' y='6' width='56' height='24' rx='5' fill='%230f766e'/%3E%3Crect x='7' y='10' width='9' height='8' rx='1' fill='%23ccfbf1'/%3E%3Crect x='19' y='10' width='9' height='8' rx='1' fill='%23ccfbf1'/%3E%3Crect x='31' y='10' width='9' height='8' rx='1' fill='%23ccfbf1'/%3E%3Crect x='44' y='10' width='10' height='14' rx='1' fill='%23ccfbf1'/%3E%3Ccircle cx='14' cy='31' r='4.5' fill='%23134e4a'/%3E%3Ccircle cx='46' cy='31' r='4.5' fill='%23134e4a'/%3E%3C/svg%3E"/>
        <div><h1><xsl:text>Günlük e-Yolcu Listesi</xsl:text></h1><div class="duz"><b><xsl:value-of select="$duzenleyenUnvan"/></b><div><xsl:value-of select="$duzenleyenAdres"/></div><div><xsl:text>VKN </xsl:text><xsl:value-of select="$bl/ebilet:gonderen/ebilet:vkn"/><xsl:text> · </xsl:text><xsl:value-of select="$duzenleyenVergiDairesi"/><xsl:text> V.D.</xsl:text><xsl:if test="$duzenleyenTelefon!=''"><xsl:text> · </xsl:text><xsl:value-of select="$duzenleyenTelefon"/></xsl:if></div></div></div>
        <div class="gun"><i><xsl:text>LİSTE TARİHİ</xsl:text></i><b><xsl:call-template name="tarih"><xsl:with-param name="d" select="$bl/ebilet:baslangicTarihi"/></xsl:call-template><xsl:if test="$bl/ebilet:bitisTarihi!=$bl/ebilet:baslangicTarihi"><xsl:text> – </xsl:text><xsl:call-template name="tarih"><xsl:with-param name="d" select="$bl/ebilet:bitisTarihi"/></xsl:call-template></xsl:if></b><i style="margin-top:1mm"><xsl:value-of select="count(/ebilet:eYolcuListesi/ebilet:yolcuListesi)"/><xsl:text> SEFER</xsl:text></i></div></div>
    <xsl:for-each select="/ebilet:eYolcuListesi/ebilet:yolcuListesi"><div class="sef"><div class="k"><div><i><xsl:text>Sefer</xsl:text></i><b><xsl:value-of select="ebilet:seferNumarasi"/></b></div><div><i><xsl:text>Saat</xsl:text></i><b><xsl:value-of select="substring(substring-after(ebilet:haraketZamani,'T'),1,5)"/></b></div><div><i><xsl:text>Plaka</xsl:text></i><b><xsl:value-of select="ebilet:aracPlakasi"/></b></div><div><i><xsl:text>Hareket Noktası</xsl:text></i><b><xsl:value-of select="ebilet:hareketNoktasi"/></b></div><div><i><xsl:text>Liste No</xsl:text></i><b><xsl:value-of select="ebilet:yolcuListesiNo"/></b></div></div>
        <table class="y"><tr><th><xsl:text>#</xsl:text></th><th><xsl:text>Koltuk</xsl:text></th><th><xsl:text>Ad Soyad</xsl:text></th><th><xsl:text>Kimlik</xsl:text></th><th><xsl:text>Bilet No</xsl:text></th><th><xsl:text>Tutar</xsl:text></th></tr><xsl:for-each select="ebilet:koltukListesi/ebilet:koltuk"><xsl:sort select="ebilet:koltukNo" data-type="number"/><tr><td class="c-sira"><xsl:value-of select="position()"/></td><td class="c-koltuk"><xsl:value-of select="ebilet:koltukNo"/></td><td class="c-ad"><xsl:value-of select="ebilet:adSoyad"/></td><td class="c-kimlik"><xsl:choose><xsl:when test="ebilet:pasaportNo"><xsl:value-of select="ebilet:pasaportNo"/></xsl:when><xsl:otherwise><xsl:value-of select="concat(substring(ebilet:tcknYkn,1,3),'*****',substring(ebilet:tcknYkn,9,3))"/></xsl:otherwise></xsl:choose></td><td class="c-bilet"><xsl:value-of select="ebilet:biletNo"/></td><td class="c-tutar"><xsl:value-of select="format-number(ebilet:tutar, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></td></tr></xsl:for-each></table>
        <div class="t"><span><xsl:text>Yolcu: </xsl:text><b><xsl:value-of select="count(ebilet:koltukListesi/ebilet:koltuk)"/><xsl:text> / 16</xsl:text></b></span><span><xsl:text>Hasılat: </xsl:text><b><xsl:value-of select="format-number(ebilet:toplamHasilat, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></b></span></div></div></xsl:for-each>
    <div class="gt"><div><i><xsl:text>Günlük sefer</xsl:text></i><b><xsl:value-of select="count(/ebilet:eYolcuListesi/ebilet:yolcuListesi)"/></b></div><div><i><xsl:text>Toplam yolcu</xsl:text></i><b><xsl:value-of select="count(/ebilet:eYolcuListesi/ebilet:yolcuListesi/ebilet:koltukListesi/ebilet:koltuk)"/></b></div>
        <div class="h"><i><xsl:text>Günlük hasılat</xsl:text></i><b><xsl:value-of select="format-number(sum(/ebilet:eYolcuListesi/ebilet:yolcuListesi/ebilet:toplamHasilat), '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></b></div></div>
    <div class="uuid"><xsl:text>UUID </xsl:text><xsl:value-of select="$bl/ebilet:uuid"/></div>
</div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
