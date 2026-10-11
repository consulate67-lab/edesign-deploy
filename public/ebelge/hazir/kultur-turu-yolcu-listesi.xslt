<?xml version="1.0" encoding="UTF-8"?>
<!--
  Kültür Turu Otobüsü e-Yolcu Listesi: kiremit-kum broşür başlığı, 2+2 koltuk planı ve iki sütunlu yolcu listesi.
  Düzenleyen unvan / adres / vergi dairesi XML'de bulunmadığından aşağıdaki değişkenlerden okunur.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:ebilet="http://ebilet.efatura.gov.tr"
    exclude-result-prefixes="ebilet">
    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="edesign-tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:variable name="duzenleyenUnvan" select="'Peri Bacası Turizm Seyahat Acentası Ltd. Şti.'"/>
    <xsl:variable name="duzenleyenAdres" select="'Mecidiyeköy Mahallesi Büyükdere Caddesi No:91, Şişli / İstanbul'"/>
    <xsl:variable name="duzenleyenVergiDairesi" select="'Mecidiyeköy'"/>
    <xsl:variable name="duzenleyenTelefon" select="'(212) 356 46 46'"/>
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
                    .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #431407; background: #fffaf3; }
                    .bas { position: relative; height: 62mm; background: linear-gradient(180deg, #fdba74 0%, #fed7aa 55%, #fff7ed 100%); overflow: hidden; padding: 9mm 14mm; }
                    .bas::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 24mm; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 210 30' preserveAspectRatio='none'%3E%3Cpath d='M0 30 V22 Q8 20 12 12 Q14 6 16 12 Q20 20 28 21 Q34 18 38 8 Q40 2 42 8 Q46 18 54 22 Q70 24 80 18 Q86 10 88 4 Q90 0 92 4 Q94 12 100 18 Q120 24 140 20 Q146 12 148 6 Q150 2 152 6 Q156 16 164 20 Q180 24 190 16 Q194 10 196 16 Q200 22 210 22 V30 Z' fill='%23c2410c' opacity='.85'/%3E%3Cpath d='M0 30 V26 Q40 22 80 26 T160 25 T210 26 V30 Z' fill='%237c2d12'/%3E%3C/svg%3E") bottom / 100% 100% no-repeat; }
                    .bas .ust { display: flex; justify-content: space-between; align-items: flex-start; position: relative; }
                    .bas h1 { margin: 5mm 0 0; font-family: Georgia, serif; font-size: 25pt; color: #7c2d12; position: relative; z-index: 1; } .bas h1 small { display: block; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #9a3412; letter-spacing: 3px; margin-top: 1mm; }
                    .bas .duz { font-size: 8pt; color: #7c2d12; text-align: right; max-width: 80mm; } .bas .duz b { display: block; font-size: 9.5pt; }
                    .ic { padding: 6mm 14mm 0; display: grid; grid-template-columns: 1fr 48mm; gap: 7mm; }
                    .rozet { display: flex; flex-wrap: wrap; gap: 2mm; } .rozet span { background: #fff; border: 1px solid #fdba74; border-radius: 10mm; padding: 1.2mm 3.5mm; font-size: 8.3pt; } .rozet b { color: #c2410c; }
                    .liste { columns: 2; column-gap: 6mm; margin-top: 5mm; }
                    .yo { break-inside: avoid; display: grid; grid-template-columns: 8mm 1fr auto; gap: 2mm; align-items: center; padding: 1.6mm 0; border-bottom: 1px dotted #fdba74; font-size: 8.5pt; }
                    .yo .no { background: #c2410c; color: #fff; border-radius: 50%; width: 7mm; height: 7mm; display: flex; align-items: center; justify-content: center; font-size: 7.4pt; font-weight: 700; }
                    .yo small { display: block; color: #9a3412; font-size: 7.2pt; } .yo .tt { font-size: 8pt; font-weight: 600; }
                    .plan { background: #fff; border: 1px solid #fed7aa; border-radius: 6mm 6mm 2mm 2mm; padding: 5mm 3mm 4mm; text-align: center; }
                    .plan .on { font-size: 7pt; letter-spacing: 2px; color: #9a3412; margin-bottom: 2.5mm; }
                    .izg { display: grid; grid-template-columns: 6.5mm 6.5mm 4mm 6.5mm 6.5mm; gap: 1.3mm; justify-content: center; }
                    .kt { height: 6mm; border-radius: 1.2mm 1.2mm .5mm .5mm; background: #ffedd5; color: #c2410c; font-size: 6.4pt; display: flex; align-items: center; justify-content: center; }
                    .kt:nth-child(4n+1) { grid-column: 1; } .kt:nth-child(4n+2) { grid-column: 2; } .kt:nth-child(4n+3) { grid-column: 4; } .kt:nth-child(4n) { grid-column: 5; }
                    .kt.dolu { background: #c2410c; color: #fff; font-weight: 700; }
                    .ozet { margin-top: 4mm; background: #7c2d12; color: #ffedd5; border-radius: 3mm; padding: 4mm; font-size: 8pt; } .ozet b { display: block; font-size: 14pt; color: #fff; margin: .5mm 0 2mm; }
                    .kom { margin-top: 3mm; border: 1px dashed #c2410c; border-radius: 3mm; padding: 3mm 4mm; font-size: 8pt; } .kom div { display: flex; justify-content: space-between; padding: .5mm 0; }
                    .oz { margin: 6mm 14mm 0; font-size: 7.2pt; color: #9a3412; word-break: break-all; }
                </style>
            </head>
            <body>
<div class="sayfa">
    <div class="bas"><div class="ust"><img data-xslt-obj="obj-logo" alt="Logo" width="150" height="40" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 40'%3E%3Cpath d='M6 36 Q10 20 14 12 Q16 6 18 12 Q22 20 26 36 Z' fill='%237c2d12'/%3E%3Ccircle cx='16' cy='9' r='3.5' fill='%23c2410c'/%3E%3Ctext x='34' y='22' font-family='Georgia,serif' font-weight='700' font-size='15' fill='%237c2d12'%3EPeri Bacası%3C/text%3E%3Ctext x='35' y='33' font-family='Segoe UI,Arial' font-size='7.5' letter-spacing='2.5' fill='%239a3412'%3ETURİZM · SEYAHAT%3C/text%3E%3C/svg%3E"/>
            <div class="duz"><b><xsl:value-of select="$duzenleyenUnvan"/></b><div><xsl:value-of select="$duzenleyenAdres"/></div><div><xsl:text>VKN </xsl:text><xsl:value-of select="$bl/ebilet:gonderen/ebilet:vkn"/><xsl:text> · </xsl:text><xsl:value-of select="$duzenleyenVergiDairesi"/><xsl:text> V.D.</xsl:text><xsl:if test="$duzenleyenTelefon!=''"><xsl:text> · </xsl:text><xsl:value-of select="$duzenleyenTelefon"/></xsl:if></div></div></div>
        <h1><xsl:text>Kapadokya Kültür Turu</xsl:text><small><xsl:text>e-YOLCU LİSTESİ</xsl:text></small></h1></div>
    <xsl:for-each select="/ebilet:eYolcuListesi/ebilet:yolcuListesi"><div class="ic"><div>
        <div class="rozet"><span><xsl:text>Sefer </xsl:text><b><xsl:value-of select="ebilet:seferNumarasi"/></b></span><span><xsl:text>Hareket </xsl:text><b><xsl:call-template name="tarih"><xsl:with-param name="d" select="ebilet:seferTarihi"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring(substring-after(ebilet:haraketZamani,'T'),1,5)"/></b></span><span><xsl:text>Plaka </xsl:text><b><xsl:value-of select="ebilet:aracPlakasi"/></b></span><span><xsl:text>Liste </xsl:text><b><xsl:value-of select="ebilet:yolcuListesiNo"/></b></span><span><xsl:text>Buluşma </xsl:text><b><xsl:value-of select="ebilet:hareketNoktasi"/></b></span></div>
        <div class="liste"><xsl:for-each select="ebilet:koltukListesi/ebilet:koltuk"><xsl:sort select="ebilet:koltukNo" data-type="number"/><div class="yo"><span class="no"><xsl:value-of select="ebilet:koltukNo"/></span><span><xsl:value-of select="ebilet:adSoyad"/><small><xsl:choose><xsl:when test="ebilet:pasaportNo"><xsl:value-of select="ebilet:pasaportNo"/></xsl:when><xsl:otherwise><xsl:value-of select="concat(substring(ebilet:tcknYkn,1,3),'*****',substring(ebilet:tcknYkn,9,3))"/></xsl:otherwise></xsl:choose><xsl:text> · </xsl:text><xsl:value-of select="ebilet:biletNo"/></small></span><span class="tt"><xsl:value-of select="format-number(ebilet:tutar, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></span></div></xsl:for-each></div></div>
        <div><div class="plan"><div class="on"><xsl:text>ÖN · REHBER</xsl:text></div><div class="izg"><xsl:call-template name="izgara"><xsl:with-param name="ks" select="ebilet:koltukListesi/ebilet:koltuk"/><xsl:with-param name="max" select="46"/></xsl:call-template></div></div>
            <div class="ozet"><xsl:text>Katılımcı</xsl:text><b><xsl:value-of select="count(ebilet:koltukListesi/ebilet:koltuk)"/><xsl:text> kişi</xsl:text></b><xsl:text>Toplam hasılat</xsl:text><b><xsl:value-of select="format-number(ebilet:toplamHasilat, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></b><xsl:text>Kişi başı ortalama </xsl:text><xsl:value-of select="format-number(ebilet:toplamHasilat div count(ebilet:koltukListesi/ebilet:koltuk), '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></div>
            <xsl:if test="ebilet:aracIsleten"><div class="kom"><b><xsl:text>Kiralık araç — işleten</xsl:text></b><div><span><xsl:text>VKN</xsl:text></span><span><xsl:value-of select="ebilet:aracIsleten/ebilet:vkn"/></span></div><div><span><xsl:text>Komisyon</xsl:text></span><span><xsl:value-of select="format-number(ebilet:aracIsleten/ebilet:komisyonTutar, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></span></div><div><span><xsl:text>KDV</xsl:text></span><span><xsl:value-of select="format-number(ebilet:aracIsleten/ebilet:komisyonKDV, '###.##0,00', 'edesign-tr')"/><xsl:text> TL</xsl:text></span></div></div></xsl:if></div></div>
        <div class="oz"><xsl:text>Liste tarihi </xsl:text><xsl:call-template name="tarih"><xsl:with-param name="d" select="$bl/ebilet:baslangicTarihi"/></xsl:call-template><xsl:if test="$bl/ebilet:bitisTarihi!=$bl/ebilet:baslangicTarihi"><xsl:text> – </xsl:text><xsl:call-template name="tarih"><xsl:with-param name="d" select="$bl/ebilet:bitisTarihi"/></xsl:call-template></xsl:if><xsl:text> · UUID </xsl:text><xsl:value-of select="$bl/ebilet:uuid"/><xsl:text> · Özet değer </xsl:text><xsl:value-of select="ebilet:ozetDeger"/></div></xsl:for-each>
</div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
