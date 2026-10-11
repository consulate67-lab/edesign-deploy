<?xml version="1.0" encoding="UTF-8"?>
<!--
  Uluslararası Otobüs e-Yolcu Listesi: pasaport lacivert başlık, sefer mührü ve kimlik rozetli yolcu tablosu.
  Düzenleyen unvan / adres / vergi dairesi XML'de bulunmadığından aşağıdaki değişkenlerden okunur.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:ebilet="http://ebilet.efatura.gov.tr"
    exclude-result-prefixes="ebilet">
    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="edesign-tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:variable name="duzenleyenUnvan" select="'Balkan Ekspres Uluslararası Turizm A.Ş.'"/>
    <xsl:variable name="duzenleyenAdres" select="'Esenler Otogarı Uluslararası Peronlar 4-6, Esenler / İstanbul'"/>
    <xsl:variable name="duzenleyenVergiDairesi" select="'Esenler'"/>
    <xsl:variable name="duzenleyenTelefon" select="'(212) 658 44 18'"/>
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
                    .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #0f172a; background: #fff; }
                    .bas { background: #1e3a8a; color: #e0e7ff; padding: 10mm 14mm 15mm; position: relative; overflow: hidden; }
                    .bas::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(45deg, rgba(255,255,255,.04) 0 2mm, transparent 2mm 4mm); }
                    .bas > * { position: relative; } .bas .ust { display: flex; justify-content: space-between; align-items: center; }
                    .bas h1 { margin: 6mm 0 0; font-size: 21pt; color: #fff; letter-spacing: 1px; } .bas h1 small { display: block; font-size: 9pt; letter-spacing: 4px; color: #c7d2fe; font-weight: 400; margin-top: 1mm; }
                    .bas .is { font-size: 8.3pt; color: #c7d2fe; text-align: right; } .bas .is b { color: #fff; font-size: 10pt; display: block; }
                    .damga { position: absolute; right: 16mm; bottom: 3mm; width: 31mm; height: 31mm; border-radius: 50%; border: .8mm solid #fbbf24; color: #fbbf24; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(-12deg); font-weight: 800; font-size: 7pt; text-align: center; letter-spacing: 1px; }
                    .damga b { font-size: 10.5pt; } .damga span { font-size: 6.3pt; }
                    .ic { padding: 8mm 14mm 0; }
                    .bilgi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border: 1px solid #c7d2fe; border-radius: 3mm; overflow: hidden; }
                    .bilgi div { padding: 3mm 4mm; border-right: 1px solid #e0e7ff; } .bilgi div:last-child { border-right: 0; } .bilgi i { display: block; font-style: normal; font-size: 7.4pt; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; } .bilgi b { font-size: 10.5pt; }
                    .bilgi .gen { grid-column: span 2; border-top: 1px solid #e0e7ff; } .bilgi .gen2 { grid-column: span 2; border-top: 1px solid #e0e7ff; }
                    table.y { width: 100%; border-collapse: collapse; margin-top: 7mm; }
                    table.y th { text-align: left; font-size: 7.6pt; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; padding: 2mm; border-bottom: 2px solid #1e3a8a; }
                    table.y td { padding: 2.4mm 2mm; border-bottom: 1px solid #e0e7ff; } .c-koltuk { font-weight: 800; color: #1e3a8a; } .c-tutar { text-align: right; font-variant-numeric: tabular-nums; } .c-bilet { font-family: Consolas, monospace; font-size: 8pt; color: #475569; }
                    .c-kimlikTur { font-size: 7.6pt; } table.y th:last-child { text-align: right; }
                    .alt { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-top: 6mm; }
                    .alt div { background: #eef2ff; border-radius: 3mm; padding: 4mm; } .alt i { display: block; font-style: normal; font-size: 7.4pt; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; } .alt b { font-size: 13pt; } .alt .h { background: #1e3a8a; color: #fff; } .alt .h i { color: #c7d2fe; }
                    .imza { margin-top: 7mm; font-size: 7.6pt; color: #64748b; border-top: 1px solid #e0e7ff; padding-top: 3mm; word-break: break-all; }
                </style>
            </head>
            <body>
<div class="sayfa">
    <div class="bas"><div class="ust"><img data-xslt-obj="obj-logo" alt="Logo" width="160" height="40" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 40'%3E%3Crect x='2' y='8' width='44' height='24' rx='6' fill='%23fbbf24'/%3E%3Crect x='8' y='13' width='10' height='8' rx='1' fill='%231e3a8a'/%3E%3Crect x='21' y='13' width='10' height='8' rx='1' fill='%231e3a8a'/%3E%3Crect x='34' y='13' width='8' height='8' rx='1' fill='%231e3a8a'/%3E%3Ccircle cx='13' cy='33' r='4' fill='%23fff'/%3E%3Ccircle cx='36' cy='33' r='4' fill='%23fff'/%3E%3Ctext x='54' y='22' font-family='Segoe UI,Arial' font-weight='800' font-size='15' fill='%23fff'%3EBALKAN%3C/text%3E%3Ctext x='55' y='33' font-family='Segoe UI,Arial' font-size='8' letter-spacing='3' fill='%23fbbf24'%3EEKSPRES%3C/text%3E%3C/svg%3E"/>
        <div class="is"><b><xsl:value-of select="$duzenleyenUnvan"/></b><div><xsl:value-of select="$duzenleyenAdres"/></div><div><xsl:text>VKN </xsl:text><xsl:value-of select="$bl/ebilet:gonderen/ebilet:vkn"/><xsl:text> · </xsl:text><xsl:value-of select="$duzenleyenVergiDairesi"/><xsl:text> V.D.</xsl:text><xsl:if test="$duzenleyenTelefon!=''"><xsl:text> · </xsl:text><xsl:value-of select="$duzenleyenTelefon"/></xsl:if></div></div></div>
        <h1><xsl:text>e-YOLCU LİSTESİ</xsl:text><small><xsl:text>INTERNATIONAL PASSENGER MANIFEST</xsl:text></small></h1>
        <xsl:for-each select="/ebilet:eYolcuListesi/ebilet:yolcuListesi"><div class="damga"><xsl:text>SEFER</xsl:text><b><xsl:value-of select="ebilet:seferNumarasi"/></b><span><xsl:call-template name="tarih"><xsl:with-param name="d" select="ebilet:seferTarihi"/></xsl:call-template><xsl:text> · </xsl:text><xsl:value-of select="substring(substring-after(ebilet:haraketZamani,'T'),1,5)"/></span></div></xsl:for-each></div>
    <xsl:for-each select="/ebilet:eYolcuListesi/ebilet:yolcuListesi"><div class="ic">
        <div class="bilgi"><div><i><xsl:text>Liste No</xsl:text></i><b><xsl:value-of select="ebilet:yolcuListesiNo"/></b></div><div><i><xsl:text>Sefer Tarihi</xsl:text></i><b><xsl:call-template name="tarih"><xsl:with-param name="d" select="ebilet:seferTarihi"/></xsl:call-template></b></div><div><i><xsl:text>Hareket Saati</xsl:text></i><b><xsl:value-of select="substring(substring-after(ebilet:haraketZamani,'T'),1,5)"/></b></div><div><i><xsl:text>Araç Plakası</xsl:text></i><b><xsl:value-of select="ebilet:aracPlakasi"/></b></div>
            <div class="gen"><i><xsl:text>Hareket Noktası</xsl:text></i><b><xsl:value-of select="ebilet:hareketNoktasi"/></b></div><div class="gen2"><i><xsl:text>Liste Tarih Aralığı / UUID</xsl:text></i><b style="font-size:8.5pt"><xsl:call-template name="tarih"><xsl:with-param name="d" select="$bl/ebilet:baslangicTarihi"/></xsl:call-template><xsl:if test="$bl/ebilet:bitisTarihi!=$bl/ebilet:baslangicTarihi"><xsl:text> – </xsl:text><xsl:call-template name="tarih"><xsl:with-param name="d" select="$bl/ebilet:bitisTarihi"/></xsl:call-template></xsl:if><xsl:text> · </xsl:text><xsl:value-of select="$bl/ebilet:uuid"/></b></div></div>
        <table class="y"><tr><th><xsl:text>#</xsl:text></th><th><xsl:text>Koltuk</xsl:text></th><th><xsl:text>Ad Soyad</xsl:text></th><th><xsl:text>Kimlik</xsl:text></th><th><xsl:text>No</xsl:text></th><th><xsl:text>Bilet No</xsl:text></th><th><xsl:text>Tutar</xsl:text></th></tr><xsl:for-each select="ebilet:koltukListesi/ebilet:koltuk"><xsl:sort select="ebilet:koltukNo" data-type="number"/><tr><td class="c-sira"><xsl:value-of select="position()"/></td><td class="c-koltuk"><xsl:value-of select="ebilet:koltukNo"/></td><td class="c-ad"><xsl:value-of select="ebilet:adSoyad"/></td><td class="c-kimlikTur"><xsl:choose><xsl:when test="ebilet:pasaportNo"><xsl:text>Pasaport</xsl:text></xsl:when><xsl:otherwise><xsl:text>T.C. / YKN</xsl:text></xsl:otherwise></xsl:choose></td><td class="c-kimlik"><xsl:choose><xsl:when test="ebilet:pasaportNo"><xsl:value-of select="ebilet:pasaportNo"/></xsl:when><xsl:otherwise><xsl:value-of select="concat(substring(ebilet:tcknYkn,1,3),'*****',substring(ebilet:tcknYkn,9,3))"/></xsl:otherwise></xsl:choose></td><td class="c-bilet"><xsl:value-of select="ebilet:biletNo"/></td><td class="c-tutar"><xsl:value-of select="format-number(ebilet:tutar, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></td></tr></xsl:for-each></table>
        <div class="alt"><div><i><xsl:text>Yolcu</xsl:text></i><b><xsl:value-of select="count(ebilet:koltukListesi/ebilet:koltuk)"/></b></div><div><i><xsl:text>Yabancı uyruklu (pasaport)</xsl:text></i><b><xsl:value-of select="count(ebilet:koltukListesi/ebilet:koltuk[ebilet:pasaportNo])"/></b></div><div class="h"><i><xsl:text>Toplam hasılat</xsl:text></i><b><xsl:value-of select="format-number(ebilet:toplamHasilat, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></b></div></div>
        <div class="imza"><xsl:text>Özet değer: </xsl:text><xsl:value-of select="ebilet:ozetDeger"/></div></div></xsl:for-each>
</div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
