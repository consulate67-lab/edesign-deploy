<?xml version="1.0" encoding="UTF-8"?>
<!--
  Bayram Ek Seferi Yolcu Manifestosu: yazıcı dostu siyah-beyaz manifesto, 2+2 kroki ve imza kutuları.
  Düzenleyen unvan / adres / vergi dairesi XML'de bulunmadığından aşağıdaki değişkenlerden okunur.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:ebilet="http://ebilet.efatura.gov.tr"
    exclude-result-prefixes="ebilet">
    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="edesign-tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:variable name="duzenleyenUnvan" select="'Palandöken Seyahat A.Ş.'"/>
    <xsl:variable name="duzenleyenAdres" select="'Esenler Otogarı Peron 116-118, Esenler / İstanbul'"/>
    <xsl:variable name="duzenleyenVergiDairesi" select="'Esenler'"/>
    <xsl:variable name="duzenleyenTelefon" select="'0850 225 25 25'"/>
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
                    .sayfa { font-family: Arial, Helvetica, sans-serif; font-size: 8.6pt; color: #111; background: #fff; padding: 10mm 12mm; }
                    .bas { display: grid; grid-template-columns: auto 1fr auto; gap: 5mm; align-items: center; border-bottom: 2.5px solid #111; padding-bottom: 3mm; }
                    .bas h1 { margin: 0; font-size: 15pt; letter-spacing: 1.5px; } .bas h1 small { display: block; font-size: 8pt; font-weight: 400; letter-spacing: 0; margin-top: .5mm; }
                    .bas .ek { border: 2px solid #111; padding: 2mm 4mm; font-weight: 800; font-size: 11pt; letter-spacing: 2px; transform: rotate(-3deg); }
                    .duz { font-size: 7.8pt; margin-top: 2mm; }
                    .govde { display: grid; grid-template-columns: 1fr 42mm; gap: 6mm; margin-top: 4mm; }
                    table.b { width: 100%; border-collapse: collapse; } table.b td { border: 1px solid #111; padding: 1.5mm 2.5mm; } table.b td:nth-child(odd) { background: #f3f4f6; font-weight: 700; width: 30mm; font-size: 7.6pt; }
                    table.y { width: 100%; border-collapse: collapse; margin-top: 4mm; } table.y th { border: 1px solid #111; background: #111; color: #fff; font-size: 7.2pt; padding: 1.3mm 1.5mm; text-align: left; }
                    table.y td { border: 1px solid #9ca3af; padding: .9mm 1.5mm; font-size: 7.9pt; } .c-sira, .c-koltuk { text-align: center; } .c-tutar { text-align: right; } .c-bilet { font-family: Consolas, monospace; font-size: 7.3pt; }
                    .kroki { border: 1.5px solid #111; padding: 3mm 2mm; text-align: center; } .kroki .on { font-size: 6.8pt; letter-spacing: 1.5px; margin-bottom: 2mm; border-bottom: 1px solid #111; padding-bottom: 1mm; }
                    .izg { display: grid; grid-template-columns: 6mm 6mm 3mm 6mm 6mm; gap: 1mm; justify-content: center; }
                    .kt { height: 5.4mm; border: 1px solid #111; font-size: 6.2pt; display: flex; align-items: center; justify-content: center; }
                    .kt:nth-child(4n+1) { grid-column: 1; } .kt:nth-child(4n+2) { grid-column: 2; } .kt:nth-child(4n+3) { grid-column: 4; } .kt:nth-child(4n) { grid-column: 5; }
                    .kt.dolu { background: #111; color: #fff; font-weight: 700; }
                    .ok { font-size: 7pt; margin-top: 2mm; text-align: left; } .ok span { display: inline-block; width: 3mm; height: 3mm; border: 1px solid #111; vertical-align: middle; margin-right: 1mm; } .ok span.d { background: #111; }
                    .ozet { margin-top: 4mm; border: 1.5px solid #111; } .ozet div { display: flex; justify-content: space-between; padding: 1.4mm 2.5mm; border-bottom: 1px solid #d1d5db; font-size: 7.8pt; } .ozet div:last-child { border-bottom: 0; } .ozet .h { background: #111; color: #fff; font-weight: 700; }
                    .imza { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-top: 6mm; } .imza div { border: 1px solid #111; height: 19mm; padding: 2mm; font-size: 7.4pt; font-weight: 700; position: relative; } .imza div span { position: absolute; left: 2mm; right: 2mm; bottom: 2mm; border-top: 1px dashed #111; font-weight: 400; text-align: center; padding-top: .8mm; }
                    .oz { margin-top: 3mm; font-size: 6.8pt; color: #4b5563; word-break: break-all; }
                </style>
            </head>
            <body>
<div class="sayfa">
    <div class="bas"><img data-xslt-obj="obj-logo" alt="Logo" width="44" height="44" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath d='M2 42 L18 12 L26 26 L32 18 L46 42 Z' fill='%23111'/%3E%3Cpath d='M18 12 L22 19 L14 19 Z' fill='%23fff'/%3E%3C/svg%3E"/>
        <div><h1><xsl:text>YOLCU MANİFESTOSU</xsl:text><small><xsl:text>e-Yolcu Listesi · </xsl:text><xsl:value-of select="$duzenleyenUnvan"/></small></h1><div class="duz"><xsl:value-of select="$duzenleyenAdres"/><xsl:text> · VKN </xsl:text><xsl:value-of select="$bl/ebilet:gonderen/ebilet:vkn"/><xsl:text> · </xsl:text><xsl:value-of select="$duzenleyenVergiDairesi"/><xsl:text> V.D. · </xsl:text><xsl:value-of select="$duzenleyenTelefon"/></div></div>
        <div class="ek"><xsl:text>EK SEFER</xsl:text></div></div>
    <xsl:for-each select="/ebilet:eYolcuListesi/ebilet:yolcuListesi"><div class="govde"><div>
        <table class="b"><tr><td><xsl:text>Liste No</xsl:text></td><td><xsl:value-of select="ebilet:yolcuListesiNo"/></td><td><xsl:text>Sefer No</xsl:text></td><td><xsl:value-of select="ebilet:seferNumarasi"/></td></tr>
            <tr><td><xsl:text>Sefer Tarihi</xsl:text></td><td><xsl:call-template name="tarih"><xsl:with-param name="d" select="ebilet:seferTarihi"/></xsl:call-template></td><td><xsl:text>Hareket Saati</xsl:text></td><td><xsl:value-of select="substring(substring-after(ebilet:haraketZamani,'T'),1,5)"/></td></tr>
            <tr><td><xsl:text>Araç Plakası</xsl:text></td><td><xsl:value-of select="ebilet:aracPlakasi"/></td><td><xsl:text>Liste Aralığı</xsl:text></td><td><xsl:call-template name="tarih"><xsl:with-param name="d" select="$bl/ebilet:baslangicTarihi"/></xsl:call-template><xsl:if test="$bl/ebilet:bitisTarihi!=$bl/ebilet:baslangicTarihi"><xsl:text> – </xsl:text><xsl:call-template name="tarih"><xsl:with-param name="d" select="$bl/ebilet:bitisTarihi"/></xsl:call-template></xsl:if></td></tr>
            <tr><td><xsl:text>Hareket Noktası</xsl:text></td><td colspan="3"><xsl:value-of select="ebilet:hareketNoktasi"/></td></tr></table>
        <table class="y"><tr><th><xsl:text>Sıra</xsl:text></th><th><xsl:text>Koltuk</xsl:text></th><th><xsl:text>Adı Soyadı</xsl:text></th><th><xsl:text>Kimlik Türü</xsl:text></th><th><xsl:text>Kimlik No</xsl:text></th><th><xsl:text>Bilet No</xsl:text></th><th><xsl:text>Ücret</xsl:text></th></tr><xsl:for-each select="ebilet:koltukListesi/ebilet:koltuk"><xsl:sort select="ebilet:koltukNo" data-type="number"/><tr><td class="c-sira"><xsl:value-of select="position()"/></td><td class="c-koltuk"><xsl:value-of select="ebilet:koltukNo"/></td><td class="c-ad"><xsl:value-of select="ebilet:adSoyad"/></td><td class="c-kimlikTur"><xsl:choose><xsl:when test="ebilet:pasaportNo"><xsl:text>Pasaport</xsl:text></xsl:when><xsl:otherwise><xsl:text>T.C. / YKN</xsl:text></xsl:otherwise></xsl:choose></td><td class="c-kimlik"><xsl:choose><xsl:when test="ebilet:pasaportNo"><xsl:value-of select="ebilet:pasaportNo"/></xsl:when><xsl:otherwise><xsl:value-of select="concat(substring(ebilet:tcknYkn,1,3),'*****',substring(ebilet:tcknYkn,9,3))"/></xsl:otherwise></xsl:choose></td><td class="c-bilet"><xsl:value-of select="ebilet:biletNo"/></td><td class="c-tutar"><xsl:value-of select="format-number(ebilet:tutar, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></td></tr></xsl:for-each></table></div>
        <div><div class="kroki"><div class="on"><xsl:text>KOLTUK KROKİSİ · ÖN</xsl:text></div><div class="izg"><xsl:call-template name="izgara"><xsl:with-param name="ks" select="ebilet:koltukListesi/ebilet:koltuk"/><xsl:with-param name="max" select="46"/></xsl:call-template></div><div class="ok"><span class="d"></span><xsl:text>dolu </xsl:text><span></span><xsl:text>boş</xsl:text></div></div>
            <div class="ozet"><div><span><xsl:text>Yolcu</xsl:text></span><b><xsl:value-of select="count(ebilet:koltukListesi/ebilet:koltuk)"/><xsl:text> / 46</xsl:text></b></div><div><span><xsl:text>Boş koltuk</xsl:text></span><b><xsl:value-of select="46 - count(ebilet:koltukListesi/ebilet:koltuk)"/></b></div>
                <xsl:if test="ebilet:aracIsleten"><div><span><xsl:text>İşleten VKN</xsl:text></span><b><xsl:value-of select="ebilet:aracIsleten/ebilet:vkn"/></b></div><div><span><xsl:text>Komisyon</xsl:text></span><b><xsl:value-of select="format-number(ebilet:aracIsleten/ebilet:komisyonTutar, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></b></div><div><span><xsl:text>Komisyon KDV</xsl:text></span><b><xsl:value-of select="format-number(ebilet:aracIsleten/ebilet:komisyonKDV, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></b></div></xsl:if>
                <div class="h"><span><xsl:text>Hasılat</xsl:text></span><span><xsl:value-of select="format-number(ebilet:toplamHasilat, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></span></div></div></div></div>
        <div class="oz"><xsl:text>UUID </xsl:text><xsl:value-of select="$bl/ebilet:uuid"/><xsl:text> · Özet değer </xsl:text><xsl:value-of select="ebilet:ozetDeger"/></div></xsl:for-each>
    <div class="imza"><div><xsl:text>Şoför</xsl:text><span><xsl:text>Ad soyad / imza</xsl:text></span></div><div><xsl:text>Muavin</xsl:text><span><xsl:text>Ad soyad / imza</xsl:text></span></div><div><xsl:text>Yazıhane yetkilisi</xsl:text><span><xsl:text>Kaşe / imza</xsl:text></span></div></div>
</div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
