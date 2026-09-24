<?xml version="1.0" encoding="UTF-8"?>
<!--
  e-Döviz ve Kıymetli Maden Alım-Satım Belgesi Görselleştirme XSLT
  Hem Döviz (Alım/Satım) hem Kıymetli Maden (Alım/Satım) için ortak görselleştirme.

  Kullanım:
    xsltproc eDoviz_KMaden_gorsellestirme.xslt DovizAlim_ornek.xml > cikti.html

  Kapsam:
    ProfileID:   EDOVIZBELGE | EKIYMETLIMADENBELGE
    TypeCode:    ALIM | SATIM
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
    xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
    xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">

    <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>

    <!-- Belge tipi başlığı -->
    <xsl:template name="belgeTipBaslik">
        <xsl:param name="profile"/>
        <xsl:param name="typeCode"/>
        <xsl:choose>
            <xsl:when test="$profile='EDOVIZBELGE' and $typeCode='ALIM'">DÖVİZ ALIM BELGESİ</xsl:when>
            <xsl:when test="$profile='EDOVIZBELGE' and $typeCode='SATIM'">DÖVİZ SATIM BELGESİ</xsl:when>
            <xsl:when test="$profile='EKIYMETLIMADENBELGE' and $typeCode='ALIM'">KIYMETLI MADEN ALIM BELGESİ</xsl:when>
            <xsl:when test="$profile='EKIYMETLIMADENBELGE' and $typeCode='SATIM'">KIYMETLI MADEN SATIM BELGESİ</xsl:when>
            <xsl:otherwise>e-DÖVİZ / e-KIYMETLİ MADEN BELGESİ</xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- İşlem yönü etiketi -->
    <xsl:template name="islemYonu">
        <xsl:param name="typeCode"/>
        <xsl:choose>
            <xsl:when test="$typeCode='ALIM'">
                <span style="color:#060;">⬇ ALIM</span>
            </xsl:when>
            <xsl:when test="$typeCode='SATIM'">
                <span style="color:#c00;">⬆ SATIM</span>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$typeCode"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Para birimi türü -->
    <xsl:template name="paraTuru">
        <xsl:param name="kod"/>
        <xsl:choose>
            <xsl:when test="starts-with($kod, 'XAU')">Altın</xsl:when>
            <xsl:when test="starts-with($kod, 'XAG')">Gümüş</xsl:when>
            <xsl:when test="starts-with($kod, 'XPT')">Platin</xsl:when>
            <xsl:when test="starts-with($kod, 'XPD')">Paladyum</xsl:when>
            <xsl:when test="$kod='EUR'">Euro</xsl:when>
            <xsl:when test="$kod='USD'">ABD Doları</xsl:when>
            <xsl:when test="$kod='GBP'">İngiliz Sterlini</xsl:when>
            <xsl:when test="$kod='CHF'">İsviçre Frangı</xsl:when>
            <xsl:when test="$kod='TRY'">Türk Lirası</xsl:when>
            <xsl:otherwise><xsl:value-of select="$kod"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="/">
<html lang="tr">
<head>
    <meta charset="UTF-8"/>
    <title>
        <xsl:call-template name="belgeTipBaslik">
            <xsl:with-param name="profile" select="//cbc:ProfileID"/>
            <xsl:with-param name="typeCode" select="//cbc:CreditNoteTypeCode"/>
        </xsl:call-template>
        —
        <xsl:value-of select="//cbc:ID"/>
    </title>
    <style>
        @page { size: A4; margin: 1.5cm; }
        body { font-family: Arial, sans-serif; font-size: 10pt; margin: 0; padding: 16px; background: #f3f3f3; }
        .sayfa { max-width: 850px; margin: 0 auto; background: #fff; border: 1px solid #888; padding: 20px; }
        .baslik { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 14px; }
        .baslik h1 { margin: 0; font-size: 18pt; letter-spacing: 1.5px; }
        .baslik .meta { font-size: 10pt; color: #444; margin-top: 6px; }
        .yon-badge { display:inline-block; padding:4px 14px; border-radius:14px; font-size:11pt; font-weight:bold; }
        .yon-alim { background:#e8f5e8; color:#060; }
        .yon-satim { background:#fde8e8; color:#c00; }
        .blok { border: 1px solid #bbb; padding: 10px; margin-bottom: 10px; background: #fafafa; }
        .blok h3 { margin: 0 0 6px 0; font-size: 11pt; background: #333; color: #fff; padding: 5px 8px; }
        .tablo { width: 100%; border-collapse: collapse; font-size: 9.5pt; background: #fff; }
        .tablo th, .tablo td { border: 1px solid #aaa; padding: 4px 7px; text-align: left; vertical-align: top; }
        .tablo th { background: #eee; font-weight: bold; width: 28%; }
        .sag { text-align: right; }
        .merkez { text-align: center; }
        .iki-kolon { display: table; width: 100%; }
        .iki-kolon > div { display: table-cell; width: 50%; vertical-align: top; padding-right: 8px; }
        .vurgu { background: #fffacd; font-weight: bold; }
        .kur-tablosu { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9.5pt; }
        .kur-tablosu th { background: #555; color: #fff; padding: 5px; }
        .kur-tablosu td { padding: 5px; border: 1px solid #ccc; }
        .para { font-family: 'Courier New', monospace; font-weight: bold; }
        .footer { margin-top: 14px; border-top: 1px dashed #888; padding-top: 6px; font-size: 8pt; color: #666; text-align: center; }
        .imza { margin-top: 16px; padding: 8px; border: 1px solid #999; background: #f9f9f9; font-size: 9pt; }
    </style>
</head>
<body>
<div class="sayfa">

    <!-- BAŞLIK -->
    <div class="baslik">
        <h1>
            <xsl:call-template name="belgeTipBaslik">
                <xsl:with-param name="profile" select="//cbc:ProfileID"/>
                <xsl:with-param name="typeCode" select="//cbc:CreditNoteTypeCode"/>
            </xsl:call-template>
        </h1>
        <div class="meta">
            <strong>Belge No:</strong> <xsl:value-of select="//cbc:ID"/> |
            <strong>Tarih:</strong> <xsl:value-of select="//cbc:IssueDate"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="//cbc:IssueTime"/>
            <br/>
            <strong>Profil:</strong> <xsl:value-of select="//cbc:ProfileID"/> |
            <strong>İşlem:</strong>
            <span class="yon-badge">
                <xsl:attribute name="class">
                    <xsl:choose>
                        <xsl:when test="//cbc:CreditNoteTypeCode='ALIM'">yon-badge yon-alim</xsl:when>
                        <xsl:otherwise>yon-badge yon-satim</xsl:otherwise>
                    </xsl:choose>
                </xsl:attribute>
                <xsl:call-template name="islemYonu">
                    <xsl:with-param name="typeCode" select="//cbc:CreditNoteTypeCode"/>
                </xsl:call-template>
            </span>
        </div>
    </div>

    <!-- KİMLİK -->
    <div class="blok">
        <h3>📄 Belge Kimlik Bilgileri</h3>
        <table class="tablo">
            <tr>
                <th>Belge Numarası</th>
                <td><strong><xsl:value-of select="//cbc:ID"/></strong></td>
                <th>ETTN (UUID)</th>
                <td style="font-family:monospace; font-size:8.5pt;">
                    <xsl:value-of select="//cbc:UUID"/>
                </td>
            </tr>
            <tr>
                <th>Tarih / Saat</th>
                <td>
                    <xsl:value-of select="//cbc:IssueDate"/>
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="//cbc:IssueTime"/>
                </td>
                <th>İmza</th>
                <td>
                    <xsl:choose>
                        <xsl:when test="//ds:Signature">✓ XAdES imzalı</xsl:when>
                        <xsl:otherwise>İmzasız</xsl:otherwise>
                    </xsl:choose>
                </td>
            </tr>
        </table>
    </div>

    <!-- TARAFLAR -->
    <div class="iki-kolon">
        <!-- Düzenleyen (Banka/Döviz bürosu) -->
        <div class="blok">
            <h3>
                <xsl:choose>
                    <xsl:when test="//cbc:CreditNoteTypeCode='ALIM'">💰 Döviz/Kıymetli Maden Satıcısı (Düzenleyen)</xsl:when>
                    <xsl:otherwise>💰 Döviz/Kıymetli Maden Alan (Düzenleyen)</xsl:otherwise>
                </xsl:choose>
            </h3>
            <table class="tablo">
                <tr><th>Ünvan</th><td><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/></td></tr>
                <xsl:for-each select="//cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification">
                <tr><th><xsl:value-of select="cbc:ID/@schemeID"/></th><td><xsl:value-of select="cbc:ID"/></td></tr>
                </xsl:for-each>
                <tr><th>Vergi Dairesi</th><td><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/></td></tr>
                <tr><th>Adres</th><td>
                    <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>,
                    <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:BuildingNumber"/><br/>
                    <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CitySubdivisionName"/> /
                    <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CityName"/><br/>
                    <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cac:Country/cbc:Name"/>
                </td></tr>
            </table>
        </div>

        <!-- Müşteri -->
        <div class="blok">
            <h3>
                <xsl:choose>
                    <xsl:when test="//cbc:CreditNoteTypeCode='ALIM'">👤 Müşteri (Döviz/Kıymetli Maden Alan)</xsl:when>
                    <xsl:otherwise>👤 Müşteri (Döviz/Kıymetli Maden Satan)</xsl:otherwise>
                </xsl:choose>
            </h3>
            <table class="tablo">
                <tr><th>Ünvan / Ad</th><td>
                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/>
                    <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:Person">
                        <br/><small>
                        <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Person/cbc:FirstName"/>
                        <xsl:text> </xsl:text>
                        <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Person/cbc:FamilyName"/>
                        </small>
                    </xsl:if>
                </td></tr>
                <xsl:for-each select="//cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification">
                <tr><th><xsl:value-of select="cbc:ID/@schemeID"/></th><td><xsl:value-of select="cbc:ID"/></td></tr>
                </xsl:for-each>
                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme">
                <tr><th>Vergi Dairesi</th><td><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/></td></tr>
                </xsl:if>
                <tr><th>Adres</th><td>
                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:CitySubdivisionName"/> /
                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:CityName"/><br/>
                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cac:Country/cbc:Name"/>
                </td></tr>
            </table>
        </div>
    </div>

    <!-- KALEM DETAYI -->
    <div class="blok">
        <h3>💱 İşlem Detayı</h3>
        <table class="tablo">
            <tr>
                <th>İşlem Kalemi</th>
                <td colspan="3">
                    <xsl:value-of select="//cac:CreditNoteLine[1]/cac:Item/cbc:Name"/>
                    <xsl:if test="//cac:CreditNoteLine[1]/cac:Item/cbc:Description">
                        — <xsl:value-of select="//cac:CreditNoteLine[1]/cac:Item/cbc:Description"/>
                    </xsl:if>
                </td>
            </tr>
            <tr>
                <th>Miktar</th>
                <td>
                    <strong>
                    <xsl:value-of select="format-number(//cac:CreditNoteLine[1]/cbc:CreditedQuantity, '#,##0.####')"/>
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="//cac:CreditNoteLine[1]/cbc:CreditedQuantity/@unitCode"/>
                    </strong>
                </td>
                <th>Birim</th>
                <td>
                    <xsl:value-of select="//cac:CreditNoteLine[1]/cac:Item/cac:ItemInstance/cbc:SerialID"/>
                </td>
            </tr>
        </table>
    </div>

    <!-- KUR / TUTAR DÖNÜŞÜMÜ -->
    <div class="blok">
        <h3>💹 Kur ve Tutar Dönüşümü</h3>
        <table class="kur-tablosu">
            <thead>
                <tr>
                    <th>Açıklama</th>
                    <th class="sag">Döviz / Maden</th>
                    <th class="sag">Kur</th>
                    <th class="sag">TRY Karşılığı</th>
                </tr>
            </thead>
            <tbody>
                <xsl:variable name="payable" select="//cac:LegalMonetaryTotal/cbc:PayableAmount"/>
                <xsl:variable name="currency" select="//cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID"/>
                <tr>
                    <td>
                        <xsl:choose>
                            <xsl:when test="//cbc:CreditNoteTypeCode='ALIM'">Müşterinin Ödediği TRY</xsl:when>
                            <xsl:otherwise>Müşterinin Aldığı TRY</xsl:otherwise>
                        </xsl:choose>
                    </td>
                    <td class="sag para">
                        <xsl:call-template name="paraTuru">
                            <xsl:with-param name="kod" select="$currency"/>
                        </xsl:call-template>
                        (<xsl:value-of select="$currency"/>)
                    </td>
                    <td class="sag">
                        <xsl:variable name="miktar" select="//cac:CreditNoteLine[1]/cbc:CreditedQuantity"/>
                        <xsl:if test="$miktar != 0">
                            <xsl:value-of select="format-number($payable div $miktar, '#,##0.0000')"/>
                        </xsl:if>
                    </td>
                    <td class="sag vurgu">
                        <xsl:value-of select="format-number($payable, '#,##0.00')"/>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- VERGİLER -->
    <xsl:if test="//cac:TaxTotal/cbc:TaxAmount">
    <div class="blok">
        <h3>💰 Vergi Bilgileri</h3>
        <table class="tablo">
            <thead>
                <tr>
                    <th>Vergi Kodu</th>
                    <th>Vergi Adı</th>
                    <th class="sag">Oran (%)</th>
                    <th class="sag">Matrah</th>
                    <th class="sag">Vergi Tutarı</th>
                </tr>
            </thead>
            <tbody>
                <xsl:for-each select="//cac:TaxTotal/cac:TaxSubtotal">
                <tr>
                    <td><xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode"/></td>
                    <td><xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:Name"/></td>
                    <td class="sag"><xsl:value-of select="cbc:Percent"/></td>
                    <td class="sag">
                        <xsl:value-of select="format-number(cbc:TaxableAmount, '#,##0.00')"/>
                        <xsl:text> </xsl:text>
                        <xsl:value-of select="cbc:TaxableAmount/@currencyID"/>
                    </td>
                    <td class="sag">
                        <xsl:value-of select="format-number(cbc:TaxAmount, '#,##0.00')"/>
                        <xsl:text> </xsl:text>
                        <xsl:value-of select="cbc:TaxAmount/@currencyID"/>
                    </td>
                </tr>
                </xsl:for-each>
            </tbody>
        </table>
    </div>
    </xsl:if>

    <!-- TOPLAMLAR -->
    <div class="blok">
        <h3>📊 Parasal Toplamlar</h3>
        <table class="tablo">
            <tr>
                <th>Mal/Hizmet Toplamı</th>
                <td class="sag">
                    <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:LineExtensionAmount, '#,##0.00')"/>
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="//cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID"/>
                </td>
            </tr>
            <tr>
                <th>Vergi Hariç Toplam</th>
                <td class="sag">
                    <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount, '#,##0.00')"/>
                </td>
            </tr>
            <tr>
                <th>Vergi Dahil Toplam</th>
                <td class="sag">
                    <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount, '#,##0.00')"/>
                </td>
            </tr>
            <tr class="vurgu">
                <th>İŞLEM TUTARI</th>
                <td class="sag">
                    <span style="font-size:13pt;">
                    <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:PayableAmount, '#,##0.00')"/>
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="//cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID"/>
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <!-- İMZA -->
    <xsl:if test="//ds:Signature">
    <div class="imza">
        <strong>🔐 Elektronik İmza:</strong>
        <xsl:choose>
            <xsl:when test="//ext:UBLExtensions">
                XAdES formatında mali mühür / elektronik imza mevcut.
                <xsl:if test="//xades:SigningTime">
                    İmza Zamanı: <xsl:value-of select="//xades:SigningTime"/>.
                </xsl:if>
            </xsl:when>
            <xsl:otherwise>İmza bilgisi mevcut.</xsl:otherwise>
        </xsl:choose>
    </div>
    </xsl:if>

    <div class="footer">
        ETTN: <xsl:value-of select="//cbc:UUID"/><br/>
        Bu belge e-Döviz ve Kıymetli Maden Alım-Satım Belgesi (Teknik Kılavuz V.1.2) yapısına uygun olarak üretilmiştir.
    </div>

</div>
</body>
</html>
    </xsl:template>

</xsl:stylesheet>
