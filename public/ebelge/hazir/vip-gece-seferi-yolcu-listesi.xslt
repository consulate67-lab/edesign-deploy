<?xml version="1.0" encoding="UTF-8"?>
<!--
  VIP Gece Seferi e-Yolcu Listesi: gece mavisi başlık, 2+1 koltuk planı, doluluk ve işleten komisyonu.
  Düzenleyen unvan / adres / vergi dairesi XML'de bulunmadığından aşağıdaki değişkenlerden okunur.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:ebilet="http://ebilet.efatura.gov.tr"
    exclude-result-prefixes="ebilet">
    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="edesign-tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:variable name="duzenleyenUnvan" select="'Gece Yıldızı Turizm Taşımacılık A.Ş.'"/>
    <xsl:variable name="duzenleyenAdres" select="'AŞTİ Peron 21-23, Söğütözü, Çankaya / Ankara'"/>
    <xsl:variable name="duzenleyenVergiDairesi" select="'Maltepe'"/>
    <xsl:variable name="duzenleyenTelefon" select="'0850 460 23 30'"/>
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
                    .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #1e1b4b; background: #fff; }
                    .bas { background: radial-gradient(1px 1px at 20% 30%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 70% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 60%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 40% 70%, #c7d2fe 50%, transparent 51%), radial-gradient(1px 1px at 55% 45%, #fff 50%, transparent 51%), linear-gradient(160deg, #0b0a2a, #1e1b4b 60%, #312e81); color: #e0e7ff; padding: 10mm 14mm; display: flex; justify-content: space-between; align-items: center; }
                    .bas h1 { margin: 0; font-size: 20pt; color: #fff; } .bas h1 small { display: block; font-size: 9pt; color: #a5b4fc; font-weight: 400; margin-top: 1mm; }
                    .bas .ay { width: 16mm; height: 16mm; border-radius: 50%; box-shadow: inset -4mm -1mm 0 0 #fde68a; }
                    .ic { padding: 7mm 14mm 0; display: grid; grid-template-columns: 1fr 44mm; gap: 8mm; }
                    .duz { font-size: 8.3pt; color: #4338ca; } .duz b { color: #1e1b4b; font-size: 10pt; display: block; }
                    .sefer { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-top: 5mm; }
                    .sefer div { background: #eef2ff; border-radius: 3mm; padding: 3mm 4mm; } .sefer i { display: block; font-style: normal; font-size: 7.4pt; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; } .sefer b { font-size: 11pt; }
                    .sefer .g { grid-column: span 3; }
                    table.y { width: 100%; border-collapse: collapse; margin-top: 6mm; }
                    table.y th { background: #1e1b4b; color: #e0e7ff; font-weight: 600; font-size: 7.6pt; padding: 1.8mm 2mm; text-align: left; } table.y th:last-child { text-align: right; }
                    table.y td { padding: 1.8mm 2mm; border-bottom: 1px solid #eef2ff; } table.y tr:nth-child(even) td { background: #f8f9ff; } .c-koltuk { font-weight: 800; color: #4338ca; } .c-tutar { text-align: right; } .c-bilet { font-family: Consolas, monospace; font-size: 7.8pt; }
                    .plan { background: #1e1b4b; border-radius: 6mm 6mm 3mm 3mm; padding: 6mm 4mm 4mm; color: #c7d2fe; text-align: center; }
                    .plan .on { font-size: 7pt; letter-spacing: 2px; margin-bottom: 3mm; }
                    .izg { display: grid; grid-template-columns: 7mm 5mm 7mm 7mm; gap: 1.6mm; justify-content: center; }
                    .kt { height: 7mm; border-radius: 1.5mm 1.5mm .6mm .6mm; background: #312e81; color: #818cf8; font-size: 7pt; display: flex; align-items: center; justify-content: center; }
                    .kt:nth-child(3n+1) { grid-column: 1; } .kt:nth-child(3n+2) { grid-column: 3; } .kt:nth-child(3n) { grid-column: 4; }
                    .kt.dolu { background: #fbbf24; color: #1e1b4b; font-weight: 800; }
                    .dol { margin-top: 4mm; font-size: 8pt; } .dol b { display: block; font-size: 16pt; color: #fbbf24; }
                    .kom { margin-top: 5mm; background: #eef2ff; border-radius: 3mm; padding: 4mm; font-size: 8.3pt; } .kom h3 { margin: 0 0 2mm; font-size: 7.6pt; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; } .kom div { display: flex; justify-content: space-between; padding: .8mm 0; }
                    .hs { margin-top: 5mm; background: #312e81; color: #fff; border-radius: 3mm; padding: 4mm; } .hs i { display: block; font-style: normal; font-size: 7.4pt; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px; } .hs b { font-size: 15pt; }
                    .oz { margin: 6mm 14mm 0; font-size: 7.4pt; color: #6366f1; word-break: break-all; }
                </style>
            </head>
            <body>
<div class="sayfa">
    <div class="bas"><div><img data-xslt-obj="obj-logo" alt="Logo" width="150" height="40" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 40'%3E%3Cpath d='M20 4 L24 15 L36 15 L26 22 L30 34 L20 27 L10 34 L14 22 L4 15 L16 15 Z' fill='%23fde68a'/%3E%3Ctext x='44' y='22' font-family='Segoe UI,Arial' font-weight='800' font-size='14' fill='%23fff'%3EGECE YILDIZI%3C/text%3E%3Ctext x='45' y='33' font-family='Segoe UI,Arial' font-size='7.5' letter-spacing='3' fill='%23a5b4fc'%3EVIP TURİZM%3C/text%3E%3C/svg%3E"/>
        <h1 style="margin-top:4mm"><xsl:text>e-Yolcu Listesi</xsl:text><small><xsl:text>VIP 2+1 · gece seferi</xsl:text></small></h1></div><div class="ay"></div></div>
    <xsl:for-each select="/ebilet:eYolcuListesi/ebilet:yolcuListesi"><div class="ic"><div><div class="duz"><b><xsl:value-of select="$duzenleyenUnvan"/></b><div><xsl:value-of select="$duzenleyenAdres"/></div><div><xsl:text>VKN </xsl:text><xsl:value-of select="$bl/ebilet:gonderen/ebilet:vkn"/><xsl:text> · </xsl:text><xsl:value-of select="$duzenleyenVergiDairesi"/><xsl:text> V.D.</xsl:text><xsl:if test="$duzenleyenTelefon!=''"><xsl:text> · </xsl:text><xsl:value-of select="$duzenleyenTelefon"/></xsl:if></div></div>
        <div class="sefer"><div><i><xsl:text>Sefer No</xsl:text></i><b><xsl:value-of select="ebilet:seferNumarasi"/></b></div><div><i><xsl:text>Tarih · Saat</xsl:text></i><b><xsl:call-template name="tarih"><xsl:with-param name="d" select="ebilet:seferTarihi"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring(substring-after(ebilet:haraketZamani,'T'),1,5)"/></b></div><div><i><xsl:text>Plaka</xsl:text></i><b><xsl:value-of select="ebilet:aracPlakasi"/></b></div>
            <div class="g"><i><xsl:text>Hareket Noktası · Liste No</xsl:text></i><b><xsl:value-of select="ebilet:hareketNoktasi"/><xsl:text> · </xsl:text><xsl:value-of select="ebilet:yolcuListesiNo"/></b></div></div>
        <table class="y"><tr><th><xsl:text>Koltuk</xsl:text></th><th><xsl:text>Yolcu</xsl:text></th><th><xsl:text>Kimlik</xsl:text></th><th><xsl:text>Bilet No</xsl:text></th><th><xsl:text>Tutar</xsl:text></th></tr><xsl:for-each select="ebilet:koltukListesi/ebilet:koltuk"><xsl:sort select="ebilet:koltukNo" data-type="number"/><tr><td class="c-koltuk"><xsl:value-of select="ebilet:koltukNo"/></td><td class="c-ad"><xsl:value-of select="ebilet:adSoyad"/></td><td class="c-kimlik"><xsl:choose><xsl:when test="ebilet:pasaportNo"><xsl:value-of select="ebilet:pasaportNo"/></xsl:when><xsl:otherwise><xsl:value-of select="concat(substring(ebilet:tcknYkn,1,3),'*****',substring(ebilet:tcknYkn,9,3))"/></xsl:otherwise></xsl:choose></td><td class="c-bilet"><xsl:value-of select="ebilet:biletNo"/></td><td class="c-tutar"><xsl:value-of select="format-number(ebilet:tutar, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></td></tr></xsl:for-each></table></div>
        <div><div class="plan"><div class="on"><xsl:text>ÖN · ŞOFÖR</xsl:text></div><div class="izg"><xsl:call-template name="izgara"><xsl:with-param name="ks" select="ebilet:koltukListesi/ebilet:koltuk"/><xsl:with-param name="max" select="30"/></xsl:call-template></div><div class="dol"><xsl:text>Doluluk</xsl:text><b><xsl:text>%</xsl:text><xsl:value-of select="round(count(ebilet:koltukListesi/ebilet:koltuk) div 30 * 100)"/></b><xsl:value-of select="count(ebilet:koltukListesi/ebilet:koltuk)"/><xsl:text> / 30 koltuk</xsl:text></div></div>
            <div class="hs"><i><xsl:text>Toplam hasılat</xsl:text></i><b><xsl:value-of select="format-number(ebilet:toplamHasilat, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></b></div>
            <xsl:if test="ebilet:aracIsleten"><div class="kom"><h3><xsl:text>Taşıtı işleten</xsl:text></h3><div><span><xsl:text>VKN</xsl:text></span><b><xsl:value-of select="ebilet:aracIsleten/ebilet:vkn"/></b></div><div><span><xsl:text>Komisyon</xsl:text></span><b><xsl:value-of select="format-number(ebilet:aracIsleten/ebilet:komisyonTutar, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></b></div><div><span><xsl:text>Komisyon KDV</xsl:text></span><b><xsl:value-of select="format-number(ebilet:aracIsleten/ebilet:komisyonKDV, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></b></div></div></xsl:if></div></div>
        <div class="oz"><xsl:text>Liste: </xsl:text><xsl:call-template name="tarih"><xsl:with-param name="d" select="$bl/ebilet:baslangicTarihi"/></xsl:call-template><xsl:if test="$bl/ebilet:bitisTarihi!=$bl/ebilet:baslangicTarihi"><xsl:text> – </xsl:text><xsl:call-template name="tarih"><xsl:with-param name="d" select="$bl/ebilet:bitisTarihi"/></xsl:call-template></xsl:if><xsl:text> · UUID </xsl:text><xsl:value-of select="$bl/ebilet:uuid"/><xsl:text> · Özet </xsl:text><xsl:value-of select="ebilet:ozetDeger"/></div></xsl:for-each>
</div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
