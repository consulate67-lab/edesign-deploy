<?xml version="1.0" encoding="UTF-8"?>
<!--
  Hazır şablon: Otobüs e-Yolcu Listesi — "Sefer Manifestosu"
  Pas kırmızısı sefer kartı, 2+1 koltuk planı (doluluk), yolcu tablosu, hasılat ve taşıtı işleten komisyon kutuları.
  Düzenleyen unvan / adres / vergi dairesi XML'de bulunmadığından aşağıdaki değişkenlerden okunur.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:ebilet="http://ebilet.efatura.gov.tr"
    exclude-result-prefixes="ebilet">

    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="edesign-tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:variable name="duzenleyenUnvan" select="'Kervan Turizm Seyahat A.Ş.'"/>
    <xsl:variable name="duzenleyenAdres" select="'Esenler Otogarı Peron 52-54, Esenler / İstanbul'"/>
    <xsl:variable name="duzenleyenVergiDairesi" select="'Esenler'"/>
    <xsl:variable name="aracKapasite" select="39"/>
    <xsl:variable name="siraSayisi" select="13"/>

    <xsl:variable name="bl" select="/ebilet:eYolcuListesi/ebilet:baslik"/>
    <xsl:variable name="yl" select="/ebilet:eYolcuListesi/ebilet:yolcuListesi[1]"/>
    <xsl:variable name="yolcuSayisi" select="count($yl/ebilet:koltukListesi/ebilet:koltuk)"/>

    <xsl:template name="tarih">
        <xsl:param name="t"/>
        <xsl:if test="string-length($t) &gt;= 10">
            <xsl:value-of select="concat(substring($t, 9, 2), '.', substring($t, 6, 2), '.', substring($t, 1, 4))"/>
        </xsl:if>
    </xsl:template>

    <xsl:template name="gunAdi">
        <xsl:param name="t"/>
        <xsl:variable name="y0" select="number(substring($t, 1, 4))"/>
        <xsl:variable name="m0" select="number(substring($t, 6, 2))"/>
        <xsl:variable name="d" select="number(substring($t, 9, 2))"/>
        <xsl:variable name="m" select="$m0 + 12 * ($m0 &lt; 3)"/>
        <xsl:variable name="y" select="$y0 - ($m0 &lt; 3)"/>
        <xsl:variable name="k" select="$y mod 100"/>
        <xsl:variable name="j" select="floor($y div 100)"/>
        <xsl:variable name="h" select="($d + floor(13 * ($m + 1) div 5) + $k + floor($k div 4) + floor($j div 4) + 5 * $j) mod 7"/>
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

    <xsl:template name="plaka">
        <xsl:param name="p"/>
        <span class="plk"><span class="tr">TR</span><span class="pn"><xsl:value-of select="$p"/></span></span>
    </xsl:template>

    <xsl:template name="koltukSirasi">
        <xsl:param name="ofs"/>
        <xsl:param name="r" select="1"/>
        <xsl:if test="$r &lt;= $siraSayisi">
            <xsl:variable name="no" select="3 * ($r - 1) + $ofs"/>
            <xsl:variable name="k" select="$yl/ebilet:koltukListesi/ebilet:koltuk[number(ebilet:koltukNo) = $no]"/>
            <xsl:choose>
                <xsl:when test="$k">
                    <span class="kt dolu" title="{$k/ebilet:adSoyad}"><xsl:value-of select="$no"/></span>
                </xsl:when>
                <xsl:otherwise>
                    <span class="kt"><xsl:value-of select="$no"/></span>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:call-template name="koltukSirasi">
                <xsl:with-param name="ofs" select="$ofs"/>
                <xsl:with-param name="r" select="$r + 1"/>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>

    <xsl:template match="/">
        <html lang="tr">
            <head>
                <meta charset="UTF-8"/>
                <title>e-Yolcu Listesi <xsl:value-of select="$yl/ebilet:yolcuListesiNo"/></title>
                <style type="text/css">
                    @page { size: A4; margin: 10mm; }
                    * { box-sizing: border-box; }
                    body { margin: 0; background: #f3ece8; font-family: "Segoe UI", Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.4; color: #2b1a12; }
                    table { font-size: inherit; line-height: inherit; color: inherit; border-collapse: collapse; }
                    .sayfa { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 11mm 11mm 9mm; background: #ffffff; }
                    .ust { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 10px; border-bottom: 2px solid #9a3412; }
                    .firma { display: flex; gap: 10px; align-items: flex-start; }
                    .firma .ad { font-size: 15px; font-weight: 800; color: #7c2d12; }
                    .firma .alt { color: #6b4a3a; font-size: 10.5px; }
                    .baslik { text-align: right; }
                    .baslik .tip { font-size: 21px; font-weight: 900; letter-spacing: 1.5px; color: #9a3412; }
                    .baslik .tip span { color: #2b1a12; font-weight: 300; }
                    .baslik table { margin-left: auto; margin-top: 4px; }
                    .baslik td { padding: 1px 0 1px 10px; text-align: right; }
                    .baslik td.e { color: #8a6a5a; font-size: 9.5px; text-transform: uppercase; letter-spacing: .4px; }
                    .baslik td.d { font-weight: 700; white-space: nowrap; }
                    .uuid { font-family: Consolas, "Courier New", monospace; font-size: 9.5px; font-weight: 400 !important; }

                    .sefer { margin-top: 12px; display: flex; border-radius: 12px; overflow: hidden; background: linear-gradient(110deg, #7c2d12 0%, #9a3412 55%, #c2410c 100%); color: #fff7ed; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .sefer > div { padding: 12px 16px; }
                    .sefer .e { font-size: 9px; text-transform: uppercase; letter-spacing: 1.2px; color: #fed7aa; }
                    .s-no { border-right: 1px dashed rgba(255, 237, 213, .45); min-width: 150px; }
                    .s-no .v { font-size: 22px; font-weight: 900; letter-spacing: .5px; white-space: nowrap; }
                    .s-saat { flex: 1; display: flex; gap: 18px; align-items: center; }
                    .s-saat .saat { font-size: 34px; font-weight: 900; line-height: 1; letter-spacing: -1px; }
                    .s-saat .gun { font-size: 13px; font-weight: 700; }
                    .s-saat .nokta { font-size: 12px; margin-top: 2px; color: #ffedd5; }
                    .s-arac { text-align: right; border-left: 1px dashed rgba(255, 237, 213, .45); display: flex; flex-direction: column; justify-content: center; align-items: flex-end; gap: 4px; }
                    .plk { display: inline-flex; align-items: stretch; border: 2px solid #1f2937; border-radius: 4px; background: #ffffff; color: #111827; font-weight: 800; font-size: 14px; white-space: nowrap; overflow: hidden; }
                    .plk .tr { background: #1d4ed8; color: #ffffff; font-size: 8px; padding: 0 4px; display: flex; align-items: flex-end; padding-bottom: 2px; }
                    .plk .pn { padding: 2px 8px; letter-spacing: 1px; }

                    .orta { display: flex; gap: 12px; margin-top: 12px; }
                    .kutu { border: 1px solid #ead8cf; border-radius: 10px; padding: 10px 12px; }
                    .kutu > h3 { margin: 0 0 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; color: #9a3412; }
                    .plan { flex: 1; }
                    .otobus { position: relative; display: flex; border: 2px solid #c9a99a; border-radius: 26px 10px 10px 26px; padding: 8px 10px 8px 8px; background: #fffaf7; }
                    .kabin { width: 34px; margin-right: 8px; border-right: 2px dotted #d6bcae; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; }
                    .direksiyon { width: 20px; height: 20px; border: 3px solid #9a8478; border-radius: 50%; }
                    .koltuklar { flex: 1; }
                    .hat { display: flex; gap: 4px; }
                    .koridor { height: 12px; }
                    .kt { flex: 1; height: 22px; border: 1.5px solid #d6bcae; border-radius: 4px 4px 7px 7px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #a38878; background: #ffffff; }
                    .kt.dolu { background: #9a3412; border-color: #7c2d12; color: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .lejant { display: flex; gap: 14px; align-items: center; margin-top: 8px; font-size: 10px; color: #6b4a3a; }
                    .lejant i { display: inline-block; width: 12px; height: 10px; border-radius: 2px; border: 1.5px solid #d6bcae; vertical-align: -1px; margin-right: 4px; }
                    .lejant i.d { background: #9a3412; border-color: #7c2d12; }
                    .lejant .sag { margin-left: auto; font-weight: 700; color: #7c2d12; }
                    .doluluk { width: 170px; display: flex; flex-direction: column; justify-content: space-between; }
                    .halka { font-size: 30px; font-weight: 900; color: #9a3412; line-height: 1; }
                    .halka small { font-size: 13px; font-weight: 700; }
                    .bar { height: 8px; border-radius: 4px; background: #f1e3dc; overflow: hidden; margin: 6px 0; }
                    .bar > span { display: block; height: 100%; background: #c2410c; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .mini { width: 100%; }
                    .mini td { padding: 2px 0; border-top: 1px dotted #ead8cf; }
                    .mini td.r { text-align: right; font-weight: 700; white-space: nowrap; }

                    .yolcular { width: 100%; margin-top: 12px; }
                    .yolcular th { background: #2b1a12; color: #fde9dc; font-size: 9.5px; text-transform: uppercase; letter-spacing: .8px; padding: 6px 8px; text-align: left; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .yolcular th.r, .yolcular td.r { text-align: right; }
                    .yolcular td { padding: 5px 8px; border-bottom: 1px solid #f0e2da; vertical-align: middle; }
                    .yolcular tr.kalem:nth-child(even) td { background: #fdf7f3; }
                    .yolcular .sira { color: #a38878; width: 26px; }
                    .knum { display: inline-block; min-width: 26px; padding: 1px 6px; border-radius: 10px; background: #ffedd5; color: #9a3412; font-weight: 800; text-align: center; }
                    .yolcular .ad { font-weight: 700; }
                    .yolcular .kod { font-family: Consolas, "Courier New", monospace; font-size: 10.5px; white-space: nowrap; }
                    .yolcular .tutar { font-weight: 700; white-space: nowrap; }
                    .yolcular tfoot td { border-top: 2px solid #2b1a12; border-bottom: none; font-weight: 800; padding-top: 7px; }

                    .alt { display: flex; gap: 12px; margin-top: 12px; align-items: stretch; }
                    .hasilat { flex: 1.1; background: #fff7ed; border: 1px solid #fdba74; border-radius: 10px; padding: 10px 12px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .hasilat table, .isleten table { width: 100%; }
                    .hasilat td, .isleten td { padding: 3px 0; }
                    .hasilat td.r, .isleten td.r { text-align: right; font-weight: 700; white-space: nowrap; }
                    .hasilat tr.top td { border-top: 2px solid #9a3412; padding-top: 6px; font-size: 13px; font-weight: 900; color: #7c2d12; }
                    .hasilat tr.top td.r { font-size: 18px; }
                    .isleten { flex: 1; }
                    .isleten tr.top td { border-top: 1px solid #ead8cf; padding-top: 5px; font-weight: 800; }
                    .notlar { flex: 1; font-size: 10px; color: #5b4034; }
                    .notlar ul { margin: 0; padding-left: 14px; }
                    .notlar li { margin-bottom: 3px; }
                    .ozet { margin-top: 12px; padding: 7px 10px; border-radius: 8px; background: #faf5f2; border: 1px dashed #d6bcae; font-size: 9.5px; color: #6b4a3a; display: flex; justify-content: space-between; gap: 12px; }
                    .ozet .kod { font-family: Consolas, "Courier New", monospace; word-break: break-all; color: #2b1a12; }
                    .imza { margin-top: 14px; display: flex; justify-content: space-between; font-size: 9.5px; color: #8a6a5a; }
                    .imza > div { width: 44%; border-top: 1px solid #c9a99a; padding-top: 4px; text-align: center; }
                    @media print { body { background: #ffffff; } .sayfa { width: auto; min-height: 0; padding: 0; } }
                </style>
            </head>
            <body>
                <div class="sayfa">
                    <div class="ust">
                        <div class="firma">
                            <img data-xslt-obj="obj-logo" alt="Logo" width="52" height="52" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect x='2' y='2' width='60' height='60' rx='16' fill='%239a3412'/%3E%3Crect x='9' y='18' width='46' height='24' rx='5' fill='%23fff7ed'/%3E%3Crect x='13' y='22' width='8' height='8' rx='1.5' fill='%23fdba74'/%3E%3Crect x='24' y='22' width='8' height='8' rx='1.5' fill='%23fdba74'/%3E%3Crect x='35' y='22' width='8' height='8' rx='1.5' fill='%23fdba74'/%3E%3Crect x='46' y='22' width='6' height='13' rx='1.5' fill='%237c2d12'/%3E%3Ccircle cx='19' cy='44' r='4.5' fill='%232b1a12'/%3E%3Ccircle cx='45' cy='44' r='4.5' fill='%232b1a12'/%3E%3Cpath d='M12 52h40' stroke='%23fed7aa' stroke-width='2.5' stroke-linecap='round' stroke-dasharray='5 4'/%3E%3C/svg%3E"/>
                            <div>
                                <div class="ad"><xsl:value-of select="$duzenleyenUnvan"/></div>
                                <div class="alt"><xsl:value-of select="$duzenleyenAdres"/></div>
                                <div class="alt">
                                    <xsl:text>Vergi Dairesi: </xsl:text><xsl:value-of select="$duzenleyenVergiDairesi"/>
                                    <xsl:text> · VKN: </xsl:text><b><xsl:value-of select="$bl/ebilet:gonderen/ebilet:vkn"/></b>
                                </div>
                            </div>
                        </div>
                        <div class="baslik">
                            <div class="tip">e-YOLCU <span>LİSTESİ</span></div>
                            <table>
                                <tr><td class="e">Liste No</td><td class="d"><xsl:value-of select="$yl/ebilet:yolcuListesiNo"/></td></tr>
                                <tr>
                                    <td class="e">Dönem</td>
                                    <td class="d">
                                        <xsl:call-template name="tarih"><xsl:with-param name="t" select="$bl/ebilet:baslangicTarihi"/></xsl:call-template>
                                        <xsl:if test="$bl/ebilet:bitisTarihi != $bl/ebilet:baslangicTarihi">
                                            <xsl:text> – </xsl:text>
                                            <xsl:call-template name="tarih"><xsl:with-param name="t" select="$bl/ebilet:bitisTarihi"/></xsl:call-template>
                                        </xsl:if>
                                    </td>
                                </tr>
                                <tr><td class="e">Versiyon</td><td class="d"><xsl:value-of select="$bl/ebilet:versiyon"/></td></tr>
                                <tr><td class="e">ETTN</td><td class="d uuid"><xsl:value-of select="$bl/ebilet:uuid"/></td></tr>
                            </table>
                        </div>
                    </div>

                    <div class="sefer">
                        <div class="s-no">
                            <div class="e">Sefer Numarası</div>
                            <div class="v"><xsl:value-of select="$yl/ebilet:seferNumarasi"/></div>
                            <div class="e" style="margin-top:6px">Sefer Tarihi</div>
                            <div style="font-weight:700"><xsl:call-template name="tarih"><xsl:with-param name="t" select="$yl/ebilet:seferTarihi"/></xsl:call-template></div>
                        </div>
                        <div class="s-saat">
                            <div>
                                <div class="e">Hareket</div>
                                <div class="saat"><xsl:value-of select="substring($yl/ebilet:haraketZamani, 12, 5)"/></div>
                            </div>
                            <div>
                                <div class="gun">
                                    <xsl:call-template name="tarih"><xsl:with-param name="t" select="$yl/ebilet:haraketZamani"/></xsl:call-template>
                                    <xsl:text> · </xsl:text>
                                    <xsl:call-template name="gunAdi"><xsl:with-param name="t" select="$yl/ebilet:haraketZamani"/></xsl:call-template>
                                </div>
                                <div class="e" style="margin-top:6px">Hareket Noktası</div>
                                <div class="nokta"><xsl:value-of select="$yl/ebilet:hareketNoktasi"/></div>
                            </div>
                        </div>
                        <div class="s-arac">
                            <div class="e">Araç Plakası</div>
                            <xsl:call-template name="plaka"><xsl:with-param name="p" select="$yl/ebilet:aracPlakasi"/></xsl:call-template>
                            <div class="e" style="margin-top:4px">Yolcu</div>
                            <div style="font-size:16px;font-weight:900"><xsl:value-of select="$yolcuSayisi"/></div>
                        </div>
                    </div>

                    <div class="orta">
                        <div class="kutu plan">
                            <h3>Koltuk Planı · 2+1</h3>
                            <div class="otobus">
                                <div class="kabin"><div class="direksiyon"><xsl:text> </xsl:text></div></div>
                                <div class="koltuklar">
                                    <div class="hat"><xsl:call-template name="koltukSirasi"><xsl:with-param name="ofs" select="1"/></xsl:call-template></div>
                                    <div class="koridor"><xsl:text> </xsl:text></div>
                                    <div class="hat"><xsl:call-template name="koltukSirasi"><xsl:with-param name="ofs" select="2"/></xsl:call-template></div>
                                    <div class="hat" style="margin-top:4px"><xsl:call-template name="koltukSirasi"><xsl:with-param name="ofs" select="3"/></xsl:call-template></div>
                                </div>
                            </div>
                            <div class="lejant">
                                <span><i class="d"><xsl:text> </xsl:text></i>Dolu</span>
                                <span><i><xsl:text> </xsl:text></i>Boş</span>
                                <span class="sag"><xsl:value-of select="$yolcuSayisi"/> / <xsl:value-of select="$aracKapasite"/> koltuk</span>
                            </div>
                        </div>
                        <div class="kutu doluluk">
                            <div>
                                <h3>Doluluk</h3>
                                <div class="halka"><small>%</small><xsl:value-of select="format-number($yolcuSayisi div $aracKapasite * 100, '0,0', 'edesign-tr')"/></div>
                                <div class="bar"><span style="width:{round($yolcuSayisi div $aracKapasite * 100)}%"><xsl:text> </xsl:text></span></div>
                            </div>
                            <table class="mini">
                                <tr><td>Boş koltuk</td><td class="r"><xsl:value-of select="$aracKapasite - $yolcuSayisi"/></td></tr>
                                <tr><td>Ort. bilet</td><td class="r"><xsl:value-of select="format-number($yl/ebilet:toplamHasilat div $yolcuSayisi, '#.##0,00', 'edesign-tr')"/> TL</td></tr>
                                <tr><td>Hasılat</td><td class="r"><xsl:value-of select="format-number($yl/ebilet:toplamHasilat, '#.##0,00', 'edesign-tr')"/> TL</td></tr>
                            </table>
                        </div>
                    </div>

                    <table class="yolcular">
                        <thead>
                            <tr>
                                <th class="sira">#</th>
                                <th>Koltuk</th>
                                <th>Yolcu Adı Soyadı</th>
                                <th>Kimlik</th>
                                <th>Bilet No</th>
                                <th class="r">Tutar (TL)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="$yl/ebilet:koltukListesi/ebilet:koltuk">
                                <tr class="kalem">
                                    <td class="sira"><xsl:value-of select="position()"/></td>
                                    <td><span class="knum"><xsl:value-of select="ebilet:koltukNo"/></span></td>
                                    <td class="ad"><xsl:value-of select="ebilet:adSoyad"/></td>
                                    <td class="kod">
                                        <xsl:choose>
                                            <xsl:when test="normalize-space(ebilet:tcknYkn) != ''"><xsl:value-of select="ebilet:tcknYkn"/></xsl:when>
                                            <xsl:otherwise>Pasaport <xsl:value-of select="ebilet:pasaportNo"/></xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td class="kod"><xsl:value-of select="ebilet:biletNo"/></td>
                                    <td class="r tutar"><xsl:value-of select="format-number(ebilet:tutar, '#.##0,00', 'edesign-tr')"/></td>
                                </tr>
                            </xsl:for-each>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3"><xsl:value-of select="$yolcuSayisi"/> yolcu</td>
                                <td colspan="2" class="r">Toplam</td>
                                <td class="r tutar"><xsl:value-of select="format-number(sum($yl/ebilet:koltukListesi/ebilet:koltuk/ebilet:tutar), '#.##0,00', 'edesign-tr')"/></td>
                            </tr>
                        </tfoot>
                    </table>

                    <div class="alt">
                        <div class="hasilat">
                            <table>
                                <tr><td>Yolcu sayısı</td><td class="r"><xsl:value-of select="$yolcuSayisi"/></td></tr>
                                <tr><td>Ortalama bilet bedeli</td><td class="r"><xsl:value-of select="format-number($yl/ebilet:toplamHasilat div $yolcuSayisi, '#.##0,00', 'edesign-tr')"/> TL</td></tr>
                                <tr class="top"><td>Toplam Hasılat</td><td class="r"><xsl:value-of select="format-number($yl/ebilet:toplamHasilat, '#.##0,00', 'edesign-tr')"/> TL</td></tr>
                            </table>
                        </div>
                        <xsl:if test="$yl/ebilet:aracIsleten">
                            <div class="kutu isleten">
                                <h3>Taşıtı İşleten</h3>
                                <table>
                                    <tr>
                                        <td>
                                            <xsl:choose>
                                                <xsl:when test="$yl/ebilet:aracIsleten/ebilet:vkn">VKN</xsl:when>
                                                <xsl:otherwise>TCKN</xsl:otherwise>
                                            </xsl:choose>
                                        </td>
                                        <td class="r"><xsl:value-of select="$yl/ebilet:aracIsleten/ebilet:vkn | $yl/ebilet:aracIsleten/ebilet:tckn"/></td>
                                    </tr>
                                    <tr><td>Komisyon tutarı</td><td class="r"><xsl:value-of select="format-number($yl/ebilet:aracIsleten/ebilet:komisyonTutar, '#.##0,00', 'edesign-tr')"/> TL</td></tr>
                                    <tr><td>Komisyon KDV</td><td class="r"><xsl:value-of select="format-number($yl/ebilet:aracIsleten/ebilet:komisyonKDV, '#.##0,00', 'edesign-tr')"/> TL</td></tr>
                                    <tr class="top"><td>Komisyon toplamı</td><td class="r"><xsl:value-of select="format-number($yl/ebilet:aracIsleten/ebilet:komisyonTutar + $yl/ebilet:aracIsleten/ebilet:komisyonKDV, '#.##0,00', 'edesign-tr')"/> TL</td></tr>
                                </table>
                            </div>
                        </xsl:if>
                        <div class="kutu notlar">
                            <h3>Notlar</h3>
                            <ul>
                                <li>Bu liste sefer başlamadan önce elektronik ortamda iletilmiştir; bir nüshası sefer süresince araçta bulundurulur.</li>
                                <li>Bilet bedelleri KDV dahildir.</li>
                                <li>Yolcu kimlik bilgileri yalnızca yasal yükümlülükler ve denetim amacıyla işlenir.</li>
                            </ul>
                        </div>
                    </div>

                    <div class="ozet">
                        <span>Özet değer</span>
                        <span class="kod"><xsl:value-of select="$yl/ebilet:ozetDeger"/></span>
                    </div>

                    <div class="imza">
                        <div>Düzenleyen · <xsl:value-of select="$duzenleyenUnvan"/></div>
                        <div>Kaptan / Sorumlu Personel</div>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
