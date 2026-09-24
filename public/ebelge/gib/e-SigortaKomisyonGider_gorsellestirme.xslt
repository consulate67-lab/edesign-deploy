<?xml version="1.0" encoding="UTF-8"?>
<!--
  e-Sigorta Komisyon Gider Belgesi Görselleştirme XSLT
  Sigorta şirketinin acenteye ödediği komisyonu belgeleyen UBL-TR CreditNote formatındaki belgeyi görselleştirir.

  Kullanım:
    xsltproc eSigKomisyonGider_gorsellestirme.xslt eSigKomisyonGider_ornek.xml > cikti.html

  Yapı:
    - Her kalem bir sigorta branşı (Kara, Su, Yangın, Finansal Kayıplar vb.)
    - Her kalemde IPTAL (iptal edilen komisyon) ve Istihsal (brüt komisyon) tutarı ayrı ayrı yer alır
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
    xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
    xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">

    <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>

    <xsl:template match="/">
<html lang="tr">
<head>
    <meta charset="UTF-8"/>
    <title>e-Sigorta Komisyon Gider Belgesi - <xsl:value-of select="//cbc:ID"/></title>
    <style>
        @page { size: A4; margin: 1.5cm; }
        body { font-family: Arial, sans-serif; font-size: 10pt; margin: 0; padding: 16px; background: #f4f4f4; }
        .sayfa { max-width: 850px; margin: 0 auto; background: #fff; border: 1px solid #888; padding: 20px; }
        .baslik { text-align: center; border-bottom: 3px double #8b0000; padding-bottom: 12px; margin-bottom: 14px; }
        .baslik h1 { margin: 0; font-size: 18pt; color: #8b0000; letter-spacing: 1px; }
        .baslik .alt { font-size: 9pt; color: #555; margin-top: 4px; }
        .prof-badge { display: inline-block; background: #8b0000; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 11pt; margin-top: 6px; }
        .blok { border: 1px solid #bbb; padding: 10px; margin-bottom: 10px; background: #fafafa; }
        .blok h3 { margin: 0 0 6px 0; font-size: 11pt; background: #8b0000; color: #fff; padding: 5px 8px; }
        .tablo { width: 100%; border-collapse: collapse; font-size: 9.5pt; background: #fff; }
        .tablo th, .tablo td { border: 1px solid #aaa; padding: 4px 7px; text-align: left; vertical-align: top; }
        .tablo th { background: #fbeeee; font-weight: bold; width: 28%; }
        .iki-kolon { display: table; width: 100%; }
        .iki-kolon > div { display: table-cell; width: 50%; vertical-align: top; padding-right: 8px; }
        .sag { text-align: right; }
        .merkez { text-align: center; }
        .iptal { background: #fff0f0; color: #a00; }
        .istihsal { background: #f0fff0; color: #060; }
        .net-hesap { font-weight: bold; background: #fffbe6; }
        .footer { margin-top: 14px; border-top: 1px dashed #888; padding-top: 6px; font-size: 8pt; color: #666; text-align: center; }
    </style>
</head>
<body>
<div class="sayfa">

    <!-- BAŞLIK -->
    <div class="baslik">
        <h1>e-SİGORTA KOMİSYON GİDER BELGESİ</h1>
        <div class="alt">
            509 Sıra No'lu VUK Tebliği kapsamında • UBL-TR 1.2.1<br/>
            Belge No: <xsl:value-of select="//cbc:ID"/> | Tarih: <xsl:value-of select="//cbc:IssueDate"/>
        </div>
        <div class="prof-badge">
            Profil: <xsl:value-of select="//cbc:ProfileID"/>
            <xsl:text> • </xsl:text>
            <xsl:value-of select="//cbc:CreditNoteTypeCode"/>
        </div>
    </div>

    <!-- KİMLİK -->
    <div class="blok">
        <h3>📄 Belge Kimlik</h3>
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
                <th>Düzenleme Tarihi</th>
                <td><xsl:value-of select="//cbc:IssueDate"/></td>
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
        <div class="blok">
            <h3>🏢 Sigorta Şirketi (Düzenleyen)</h3>
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

        <div class="blok">
            <h3>👤 Acente / Aracı (Muhatap)</h3>
            <table class="tablo">
                <tr><th>Ünvan</th><td><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/></td></tr>
                <xsl:for-each select="//cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification">
                <tr><th><xsl:value-of select="cbc:ID/@schemeID"/></th><td><xsl:value-of select="cbc:ID"/></td></tr>
                </xsl:for-each>
                <tr><th>Vergi Dairesi</th><td><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/></td></tr>
                <tr><th>Adres</th><td>
                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:CitySubdivisionName"/> /
                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:CityName"/><br/>
                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cac:Country/cbc:Name"/>
                </td></tr>
            </table>
        </div>
    </div>

    <!-- KOMİSYON KALEMLERİ -->
    <div class="blok">
        <h3>📋 Branş Bazlı Komisyon Kalemleri</h3>
        <table class="tablo">
            <thead>
                <tr>
                    <th style="width:5%;">No</th>
                    <th style="width:30%;">Sigorta Branşı</th>
                    <th class="sag iptal">İptal Komisyonu (-)</th>
                    <th class="sag istihsal">İstihsal Komisyonu (+)</th>
                    <th class="sag">Net Komisyon</th>
                </tr>
            </thead>
            <tbody>
                <xsl:variable name="toplamIptal" select="0"/>
                <xsl:variable name="toplamIstihsal" select="0"/>
                <xsl:for-each select="//cac:CreditNoteLine">
                    <xsl:variable name="iptal" select="cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:Amount"/>
                    <xsl:variable name="istihsal" select="cac:AllowanceCharge[cbc:ChargeIndicator='true']/cbc:Amount"/>
                    <tr>
                        <td class="merkez"><xsl:value-of select="cbc:ID"/></td>
                        <td><xsl:value-of select="cac:Item/cbc:Name"/></td>
                        <td class="sag iptal">
                            <xsl:value-of select="format-number($iptal, '#,##0.00')"/>
                        </td>
                        <td class="sag istihsal">
                            <xsl:value-of select="format-number($istihsal, '#,##0.00')"/>
                        </td>
                        <td class="sag net-hesap">
                            <xsl:value-of select="format-number($istihsal - $iptal, '#,##0.00')"/>
                        </td>
                    </tr>
                </xsl:for-each>
            </tbody>
            <tfoot>
                <tr class="net-hesap">
                    <th colspan="2" class="sag">TOPLAM</th>
                    <th class="sag iptal">
                        <xsl:value-of select="format-number(sum(//cac:CreditNoteLine/cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:Amount), '#,##0.00')"/>
                    </th>
                    <th class="sag istihsal">
                        <xsl:value-of select="format-number(sum(//cac:CreditNoteLine/cac:AllowanceCharge[cbc:ChargeIndicator='true']/cbc:Amount), '#,##0.00')"/>
                    </th>
                    <th class="sag">
                        <xsl:variable name="tIptal" select="sum(//cac:CreditNoteLine/cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:Amount)"/>
                        <xsl:variable name="tIstihsal" select="sum(//cac:CreditNoteLine/cac:AllowanceCharge[cbc:ChargeIndicator='true']/cbc:Amount)"/>
                        <xsl:value-of select="format-number($tIstihsal - $tIptal, '#,##0.00')"/>
                    </th>
                </tr>
            </tfoot>
        </table>
        <p style="font-size:8.5pt; color:#666; margin-top:8px;">
            <strong>Açıklama:</strong> İstihsal komisyonu = brüt komisyon tutarı (sigorta şirketinin acenteye ödediği);
            İptal komisyonu = iptal edilen poliçeler için geri alınan komisyon;
            Net Komisyon = İstihsal − İptal.
        </p>
    </div>

    <!-- VERGİLER -->
    <xsl:if test="//cac:TaxTotal/cbc:TaxAmount">
    <div class="blok">
        <h3>💰 Vergi Bilgileri</h3>
        <table class="tablo">
            <xsl:for-each select="//cac:TaxTotal/cac:TaxSubtotal">
                <tr>
                    <th>Vergi</th>
                    <td>
                        <xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:Name"/>
                        (<xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode"/>)
                    </td>
                    <td class="sag">
                        <xsl:value-of select="format-number(cbc:TaxAmount, '#,##0.00')"/>
                        <xsl:text> </xsl:text>
                        <xsl:value-of select="cbc:TaxAmount/@currencyID"/>
                    </td>
                </tr>
            </xsl:for-each>
        </table>
    </div>
    </xsl:if>

    <!-- TOPLAM -->
    <div class="blok">
        <h3>📊 Parasal Toplamlar</h3>
        <table class="tablo">
            <tr>
                <th>Net Komisyon Tutarı</th>
                <td class="sag">
                    <strong>
                    <xsl:variable name="tIptal" select="sum(//cac:CreditNoteLine/cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:Amount)"/>
                    <xsl:variable name="tIstihsal" select="sum(//cac:CreditNoteLine/cac:AllowanceCharge[cbc:ChargeIndicator='true']/cbc:Amount)"/>
                    <xsl:value-of select="format-number($tIstihsal - $tIptal, '#,##0.00')"/>
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="//cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID"/>
                    </strong>
                </td>
            </tr>
            <tr class="net-hesap">
                <th>ÖDENECEK TUTAR</th>
                <td class="sag">
                    <span style="font-size:13pt; color:#8b0000;">
                    <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:PayableAmount, '#,##0.00')"/>
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="//cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID"/>
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        ETTN: <xsl:value-of select="//cbc:UUID"/><br/>
        Bu belge e-Sigorta Komisyon Gider Belgesi (Teknik Kılavuz V.1.2) yapısına uygun olarak üretilmiştir.
    </div>

</div>
</body>
</html>
    </xsl:template>

</xsl:stylesheet>
