<?xml version="1.0" encoding="UTF-8"?>
<!-- Hazır şablon: Mağaza teslim alma e-İrsaliye Yanıtı (ReceiptAdvice · SEVK; ürün kartları, teslim çubuğu, eksik / fazla / red etiketleri) -->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:ReceiptAdvice-2"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="n1 cac cbc">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:decimal-format name="edesign-tr" decimal-separator="," grouping-separator="."/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="UTF-8"/>
        <title>e-İrsaliye Yanıtı — <xsl:value-of select="/n1:ReceiptAdvice/cbc:ID"/></title>
        <style><![CDATA[
          * { box-sizing: border-box; }
          body { margin: 0; background: #f3f0fb; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; color: #1e1b2e; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { width: 210mm; max-width: 100%; margin: 16px auto; background: #fff; padding: 0 0 8mm; box-shadow: 0 6px 30px rgba(76,29,149,.12); }
          table { border-collapse: collapse; font-size: inherit; color: inherit; }
          .w { width: 100%; }
          .band { height: 6px; background: #7c3aed; background: linear-gradient(90deg, #7c3aed, #db2777 60%, #f59e0b); }
          .head { padding: 14px 9mm 10px; }
          .head td { vertical-align: middle; }
          .logo { display: block; }
          .co-name { font-size: 16px; font-weight: 800; color: #1e1b2e; }
          .co-sub { display: inline-block; margin-top: 2px; background: #f5f3ff; color: #6d28d9; font-weight: 700; font-size: 9px; padding: 2px 8px; border-radius: 999px; }
          .co { color: #6b6880; font-size: 9.5px; line-height: 1.55; margin-top: 3px; }
          .doc { text-align: right; width: 220px; }
          .doc .t1 { display: inline-block; background: #1e1b2e; color: #fff; font-weight: 800; letter-spacing: 2.4px; font-size: 10px; padding: 5px 12px; border-radius: 8px; }
          .doc .no { font-size: 15px; font-weight: 800; margin-top: 7px; letter-spacing: .4px; }
          .doc .dt { color: #6b6880; font-size: 9.5px; margin-top: 1px; }
          .body { padding: 0 9mm; }
          .hero { width: 100%; border-radius: 16px; background: #faf5ff; background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%); border: 1px solid #ede9fe; }
          .hero > tbody > tr > td { vertical-align: middle; padding: 14px 16px; }
          .ring { width: 92px; height: 92px; border-radius: 50%; border: 8px solid #f59e0b; background: #fff; text-align: center; padding-top: 18px; }
          .ring b { display: block; font-size: 22px; line-height: 1; font-weight: 800; }
          .ring span { font-size: 8.5px; color: #6b6880; letter-spacing: 1px; text-transform: uppercase; font-weight: 700; }
          .ring.KABUL { border-color: #10b981; } .ring.KABUL b { color: #047857; }
          .ring.KISMI { border-color: #f59e0b; } .ring.KISMI b { color: #b45309; }
          .ring.RED { border-color: #ef4444; } .ring.RED b { color: #b91c1c; }
          .verdict { font-size: 19px; font-weight: 800; }
          .verdict.KABUL { color: #047857; } .verdict.KISMI { color: #b45309; } .verdict.RED { color: #b91c1c; }
          .sentence { color: #4b4760; margin-top: 3px; line-height: 1.5; font-size: 10.5px; }
          .pills { margin-top: 8px; }
          .pill { display: inline-block; border-radius: 999px; padding: 3px 9px; font-weight: 800; font-size: 9px; margin: 0 4px 3px 0; }
          .p-ok { background: #d1fae5; color: #047857; } .p-eks { background: #fef3c7; color: #92400e; }
          .p-faz { background: #e0e7ff; color: #3730a3; } .p-red { background: #fee2e2; color: #991b1b; }
          .ref { width: 100%; }
          .ref td { padding: 2.5px 0; border-bottom: 1px dashed #e9e3fb; }
          .ref td.k { color: #6b6880; padding-right: 8px; white-space: nowrap; }
          .ref td.v { font-weight: 700; text-align: right; }
          .parties { width: 100%; margin-top: 12px; }
          .parties > tbody > tr > td { width: 50%; vertical-align: top; }
          .pcard { border-radius: 12px; border: 1px solid #ede9fe; padding: 9px 12px; line-height: 1.55; }
          .pcard h4 { margin: 0 0 3px; font-size: 8.5px; letter-spacing: 1.8px; text-transform: uppercase; color: #7c3aed; }
          .pcard .nm { font-size: 12px; font-weight: 800; }
          .muted { color: #6b6880; }
          h3.sec { margin: 16px 0 2px; font-size: 11px; letter-spacing: 1.6px; text-transform: uppercase; color: #1e1b2e; }
          h3.sec span { color: #6b6880; font-weight: 600; letter-spacing: 0; text-transform: none; font-size: 10px; margin-left: 6px; }
          .items { width: 100%; border-collapse: separate; border-spacing: 0 6px; }
          .items td { background: #fff; border-top: 1px solid #ece8f7; border-bottom: 1px solid #ece8f7; padding: 8px 10px; vertical-align: middle; }
          .items td.s { width: 5px; padding: 0; border: 0; border-radius: 6px 0 0 6px; }
          .items td.e { border-right: 1px solid #ece8f7; border-radius: 0 10px 10px 0; text-align: right; width: 150px; }
          .s-ok { background: #10b981 !important; } .s-eks { background: #f59e0b !important; } .s-faz { background: #6366f1 !important; } .s-red { background: #ef4444 !important; }
          .ix { display: inline-block; width: 20px; height: 20px; line-height: 20px; border-radius: 6px; background: #f5f3ff; color: #6d28d9; font-weight: 800; text-align: center; font-size: 9.5px; margin-right: 6px; vertical-align: middle; }
          .pn { font-weight: 800; font-size: 11.5px; vertical-align: middle; }
          .pd { color: #6b6880; font-size: 9.5px; margin: 3px 0 0 26px; }
          .pd b { font-family: Consolas, 'Courier New', monospace; font-weight: 600; color: #4b4760; }
          .prog { width: 100%; height: 8px; table-layout: fixed; border-radius: 999px; overflow: hidden; background: #f1f0f5; }
          .items .prog td { padding: 0; height: 8px; border: 0; border-radius: 0; }
          .g-kab { background: #10b981 !important; } .g-faz { background: #6366f1 !important; } .g-red { background: #ef4444 !important; } .g-eks { background: #f59e0b !important; }
          .ptxt { margin-top: 4px; color: #4b4760; font-size: 9.5px; }
          .ptxt b { color: #1e1b2e; font-size: 11px; }
          .why { margin-top: 4px; font-size: 9.5px; line-height: 1.45; }
          .why .t { font-weight: 800; }
          .t-red { color: #b91c1c; } .t-time { color: #7c3aed; } .t-note { color: #0e7490; }
          .tag { display: inline-block; border-radius: 6px; padding: 2px 7px; font-weight: 800; font-size: 9px; margin: 1px 0 1px 3px; white-space: nowrap; }
          .notes { margin-top: 10px; border-radius: 12px; background: #fffbeb; border: 1px solid #fde68a; padding: 9px 12px; line-height: 1.6; }
          .notes h5, .sign h5 { margin: 0 0 4px; font-size: 8.5px; letter-spacing: 1.6px; text-transform: uppercase; color: #7c3aed; }
          .notes h5 { color: #b45309; }
          .sign { width: calc(100% + 16px); margin: 12px -8px 0; border-collapse: separate; border-spacing: 8px 0; }
          .sign td { width: 50%; border-radius: 12px; background: #faf9fd; border: 1px solid #ece8f7; padding: 8px 12px; height: 78px; vertical-align: top; }
          .sign .ln { border-bottom: 1px dotted #b5afc9; height: 17px; color: #a19bb7; font-size: 8.5px; }
          .foot { margin-top: 10px; text-align: center; color: #6b6880; font-size: 9px; line-height: 1.6; }
          @page { size: A4; margin: 6mm; }
          @media print { body { background: #fff; } .page { margin: 0; box-shadow: none; width: auto; padding-bottom: 0; } }
        ]]></style>
      </head>
      <body>
        <xsl:for-each select="/n1:ReceiptAdvice">
          <xsl:variable name="alici" select="cac:DeliveryCustomerParty/cac:Party"/>
          <xsl:variable name="gonderen" select="cac:DespatchSupplierParty/cac:Party"/>
          <xsl:variable name="L" select="cac:ReceiptLine"/>
          <xsl:variable name="Lb" select="$L[cbc:RejectedQuantity &gt; cbc:ReceivedQuantity or (cbc:RejectedQuantity and not(cbc:ReceivedQuantity))]"/>
          <xsl:variable name="sRec" select="sum($L/cbc:ReceivedQuantity)"/>
          <xsl:variable name="sEks" select="sum($L/cbc:ShortQuantity)"/>
          <xsl:variable name="sFaz" select="sum($L/cbc:OversupplyQuantity)"/>
          <xsl:variable name="sRed" select="sum($L/cbc:RejectedQuantity)"/>
          <xsl:variable name="sRedB" select="sum($Lb/cbc:RejectedQuantity)"/>
          <xsl:variable name="sKab" select="$sRec - ($sRed - $sRedB)"/>
          <xsl:variable name="sTaban" select="$sRec + $sRedB + $sEks"/>
          <xsl:variable name="nTop" select="count($L)"/>
          <xsl:variable name="nEks" select="count($L[cbc:ShortQuantity &gt; 0])"/>
          <xsl:variable name="nFaz" select="count($L[cbc:OversupplyQuantity &gt; 0])"/>
          <xsl:variable name="nRed" select="count($L[cbc:RejectedQuantity &gt; 0])"/>
          <xsl:variable name="nTam" select="count($L[not(cbc:ShortQuantity &gt; 0) and not(cbc:OversupplyQuantity &gt; 0) and not(cbc:RejectedQuantity &gt; 0)])"/>
          <xsl:variable name="u1" select="string($L[1]/cbc:ReceivedQuantity/@unitCode)"/>
          <xsl:variable name="tekBirim" select="$u1 != '' and not($L/*[@unitCode != $u1])"/>
          <xsl:variable name="durum">
            <xsl:choose>
              <xsl:when test="$nTop &gt; 0 and $nRed = $nTop and not($L[cbc:ReceivedQuantity &gt; 0])">RED</xsl:when>
              <xsl:when test="$nEks + $nFaz + $nRed &gt; 0">KISMI</xsl:when>
              <xsl:otherwise>KABUL</xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <xsl:variable name="irsNo">
            <xsl:choose>
              <xsl:when test="cac:AdditionalDocumentReference[cbc:DocumentTypeCode = 'DespatchAdviceID']/cbc:ID"><xsl:value-of select="cac:AdditionalDocumentReference[cbc:DocumentTypeCode = 'DespatchAdviceID']/cbc:ID"/></xsl:when>
              <xsl:otherwise><xsl:value-of select="cac:DespatchDocumentReference/cbc:ID"/></xsl:otherwise>
            </xsl:choose>
          </xsl:variable>

          <div class="page">
            <div class="band"></div>
            <div class="head">
              <table class="w">
                <tr>
                  <td style="width:66px">
                    <img class="logo" data-xslt-obj="obj-1" width="54" alt="Logo" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%237c3aed'/%3E%3Cstop offset='1' stop-color='%23db2777'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='60' cy='60' r='60' fill='url(%23g)'/%3E%3Cpath d='M40 46 L52 36 Q60 44 68 36 L80 46 L74 56 L70 53 V86 H50 V53 L46 56 Z' fill='%23ffffff'/%3E%3C/svg%3E"/>
                  </td>
                  <td>
                    <div class="co-name"><xsl:call-template name="ad"><xsl:with-param name="p" select="$alici"/></xsl:call-template></div>
                    <xsl:if test="$alici/cac:PostalAddress/cbc:BuildingName or $alici/cac:PartyIdentification/cbc:ID[@schemeID='MAGAZANO']">
                      <span class="co-sub"><xsl:value-of select="$alici/cac:PostalAddress/cbc:BuildingName"/><xsl:if test="$alici/cac:PartyIdentification/cbc:ID[@schemeID='MAGAZANO']"> · <xsl:value-of select="$alici/cac:PartyIdentification/cbc:ID[@schemeID='MAGAZANO']"/></xsl:if></span>
                    </xsl:if>
                    <div class="co">
                      <xsl:call-template name="adres"><xsl:with-param name="a" select="$alici/cac:PostalAddress"/></xsl:call-template><br/>
                      VD: <xsl:value-of select="$alici/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/> · <xsl:value-of select="$alici/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']/@schemeID"/>: <xsl:value-of select="$alici/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']"/>
                      <xsl:if test="$alici/cac:Contact/cbc:Telephone"> · Tel: <xsl:value-of select="$alici/cac:Contact/cbc:Telephone"/></xsl:if>
                    </div>
                  </td>
                  <td class="doc">
                    <div class="t1">e-İRSALİYE YANITI</div>
                    <div class="no"><xsl:value-of select="cbc:ID"/></div>
                    <div class="dt"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cbc:IssueDate"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring(cbc:IssueTime, 1, 5)"/> · <xsl:value-of select="cbc:ProfileID"/></div>
                  </td>
                </tr>
              </table>
            </div>

            <div class="body">
              <table class="hero">
                <tr>
                  <td style="width:124px">
                    <div class="ring {$durum}">
                      <b>
                        <xsl:text>%</xsl:text>
                        <xsl:choose>
                          <xsl:when test="$tekBirim and $sTaban &gt; 0"><xsl:value-of select="format-number($sKab * 100 div $sTaban, '0', 'edesign-tr')"/></xsl:when>
                          <xsl:when test="$nTop &gt; 0"><xsl:value-of select="format-number($nTam * 100 div $nTop, '0', 'edesign-tr')"/></xsl:when>
                          <xsl:otherwise>0</xsl:otherwise>
                        </xsl:choose>
                      </b>
                      <span><xsl:choose><xsl:when test="$tekBirim">kabul</xsl:when><xsl:otherwise>sorunsuz</xsl:otherwise></xsl:choose></span>
                    </div>
                  </td>
                  <td>
                    <div class="verdict {$durum}">
                      <xsl:choose>
                        <xsl:when test="$durum = 'RED'">Sevkiyat reddedildi</xsl:when>
                        <xsl:when test="$durum = 'KISMI'">Kısmi kabul</xsl:when>
                        <xsl:otherwise>Tamamı kabul edildi</xsl:otherwise>
                      </xsl:choose>
                    </div>
                    <div class="sentence">
                      <b><xsl:value-of select="$nTop"/></b> kalemden <b><xsl:value-of select="$nTam"/></b> tanesi eksiksiz teslim alındı.
                      <xsl:if test="$tekBirim">
                        <xsl:text> </xsl:text><xsl:value-of select="format-number($sTaban, '#.##0,###', 'edesign-tr')"/> birimin <b><xsl:value-of select="format-number($sKab, '#.##0,###', 'edesign-tr')"/></b> tanesi rafa alındı.
                      </xsl:if>
                    </div>
                    <div class="pills">
                      <span class="pill p-ok"><xsl:value-of select="$nTam"/> tam</span>
                      <xsl:if test="$nEks &gt; 0"><span class="pill p-eks"><xsl:value-of select="$nEks"/> eksik</span></xsl:if>
                      <xsl:if test="$nFaz &gt; 0"><span class="pill p-faz"><xsl:value-of select="$nFaz"/> fazla</span></xsl:if>
                      <xsl:if test="$nRed &gt; 0"><span class="pill p-red"><xsl:value-of select="$nRed"/> red</span></xsl:if>
                    </div>
                  </td>
                  <td style="width:210px">
                    <table class="ref">
                      <tr><td class="k">İrsaliye No</td><td class="v"><xsl:value-of select="$irsNo"/></td></tr>
                      <tr><td class="k">İrsaliye Tarihi</td><td class="v"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cac:DespatchDocumentReference/cbc:IssueDate"/></xsl:call-template></td></tr>
                      <tr><td class="k">Sipariş No</td><td class="v"><xsl:value-of select="cac:OrderReference/cbc:ID"/></td></tr>
                      <tr><td class="k">Teslim Alındı</td><td class="v"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cac:Shipment/cac:Delivery/cbc:ActualDeliveryDate"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring(cac:Shipment/cac:Delivery/cbc:ActualDeliveryTime, 1, 5)"/></td></tr>
                      <xsl:if test="cac:Shipment/cbc:ID != ''"><tr><td class="k">Gönderi No</td><td class="v"><xsl:value-of select="cac:Shipment/cbc:ID"/></td></tr></xsl:if>
                    </table>
                  </td>
                </tr>
              </table>

              <table class="parties">
                <tr>
                  <td style="padding-right:6px">
                    <div class="pcard">
                      <h4>Gönderen Tedarikçi</h4>
                      <div class="nm"><xsl:call-template name="ad"><xsl:with-param name="p" select="$gonderen"/></xsl:call-template></div>
                      <xsl:call-template name="adres"><xsl:with-param name="a" select="$gonderen/cac:PostalAddress"/></xsl:call-template><br/>
                      <span class="muted">VD:</span><xsl:text> </xsl:text><xsl:value-of select="$gonderen/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/> · <span class="muted"><xsl:value-of select="$gonderen/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']/@schemeID"/>:</span><xsl:text> </xsl:text><b><xsl:value-of select="$gonderen/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']"/></b>
                    </div>
                  </td>
                  <td style="padding-left:6px">
                    <div class="pcard">
                      <h4>Teslim Alan</h4>
                      <div class="nm"><xsl:value-of select="cac:DeliveryCustomerParty/cac:DeliveryContact/cbc:Name"/></div>
                      <span class="muted">E-posta:</span><xsl:text> </xsl:text><xsl:value-of select="$alici/cac:Contact/cbc:ElectronicMail"/><br/>
                      <span class="muted">Yanıt ETTN:</span><xsl:text> </xsl:text><span style="font-size:9px"><xsl:value-of select="cbc:UUID"/></span>
                    </div>
                  </td>
                </tr>
              </table>

              <h3 class="sec">Ürün Kontrol Listesi<span><xsl:value-of select="$nTop"/> kalem</span></h3>
              <table class="items">
                <xsl:for-each select="$L">
                  <xsl:variable name="rec" select="sum(cbc:ReceivedQuantity)"/>
                  <xsl:variable name="eks" select="sum(cbc:ShortQuantity)"/>
                  <xsl:variable name="faz" select="sum(cbc:OversupplyQuantity)"/>
                  <xsl:variable name="red" select="sum(cbc:RejectedQuantity)"/>
                  <xsl:variable name="ayri" select="$red &gt; $rec"/>
                  <xsl:variable name="kab" select="$rec - $red * number(not($ayri))"/>
                  <xsl:variable name="sevk" select="$rec + $red * number($ayri) + $eks - $faz"/>
                  <xsl:variable name="taban" select="$sevk + $faz"/>
                  <xsl:variable name="b"><xsl:call-template name="birim"><xsl:with-param name="u" select="cbc:ReceivedQuantity/@unitCode"/></xsl:call-template></xsl:variable>
                  <xsl:variable name="cls">
                    <xsl:choose>
                      <xsl:when test="$red &gt; 0">red</xsl:when>
                      <xsl:when test="$eks &gt; 0">eks</xsl:when>
                      <xsl:when test="$faz &gt; 0">faz</xsl:when>
                      <xsl:otherwise>ok</xsl:otherwise>
                    </xsl:choose>
                  </xsl:variable>
                  <tr>
                    <td class="s s-{$cls}"></td>
                    <td style="width:46%">
                      <span class="ix"><xsl:value-of select="cbc:ID"/></span><span class="pn"><xsl:value-of select="cac:Item/cbc:Name"/></span>
                      <div class="pd"><b><xsl:value-of select="cac:Item/cac:SellersItemIdentification/cbc:ID"/></b><xsl:if test="cac:Item/cbc:Description"> · <xsl:value-of select="cac:Item/cbc:Description"/></xsl:if></div>
                    </td>
                    <td>
                      <xsl:if test="$taban &gt; 0">
                        <table class="prog">
                          <tr>
                            <xsl:call-template name="seg"><xsl:with-param name="v" select="$kab - $faz"/><xsl:with-param name="t" select="$taban"/><xsl:with-param name="c" select="'g-kab'"/></xsl:call-template>
                            <xsl:call-template name="seg"><xsl:with-param name="v" select="$faz"/><xsl:with-param name="t" select="$taban"/><xsl:with-param name="c" select="'g-faz'"/></xsl:call-template>
                            <xsl:call-template name="seg"><xsl:with-param name="v" select="$red"/><xsl:with-param name="t" select="$taban"/><xsl:with-param name="c" select="'g-red'"/></xsl:call-template>
                            <xsl:call-template name="seg"><xsl:with-param name="v" select="$eks"/><xsl:with-param name="t" select="$taban"/><xsl:with-param name="c" select="'g-eks'"/></xsl:call-template>
                          </tr>
                        </table>
                      </xsl:if>
                      <div class="ptxt">
                        İrsaliye <b><xsl:value-of select="format-number($sevk, '#.##0,###', 'edesign-tr')"/></b>
                        · Teslim <b><xsl:value-of select="format-number($rec, '#.##0,###', 'edesign-tr')"/></b>
                        · Kabul <b><xsl:value-of select="format-number($kab, '#.##0,###', 'edesign-tr')"/></b><xsl:text> </xsl:text><xsl:value-of select="$b"/>
                      </div>
                      <xsl:for-each select="cbc:RejectReason"><div class="why"><span class="t t-red">Red nedeni: </span><xsl:value-of select="."/></div></xsl:for-each>
                      <xsl:for-each select="cbc:TimingComplaint"><div class="why"><span class="t t-time">Zamanlama: </span><xsl:value-of select="."/></div></xsl:for-each>
                      <xsl:for-each select="cbc:Note"><div class="why"><span class="t t-note">Not: </span><xsl:value-of select="."/></div></xsl:for-each>
                    </td>
                    <td class="e">
                      <xsl:if test="$cls = 'ok'"><span class="tag p-ok">✓ Tam teslim</span></xsl:if>
                      <xsl:if test="$eks &gt; 0"><span class="tag p-eks">Eksik <xsl:value-of select="format-number($eks, '#.##0,###', 'edesign-tr')"/></span></xsl:if>
                      <xsl:if test="$faz &gt; 0"><span class="tag p-faz">Fazla <xsl:value-of select="format-number($faz, '#.##0,###', 'edesign-tr')"/></span></xsl:if>
                      <xsl:if test="$red &gt; 0"><span class="tag p-red"><xsl:choose><xsl:when test="$kab = 0">Tümü red</xsl:when><xsl:otherwise>Red</xsl:otherwise></xsl:choose><xsl:text> </xsl:text><xsl:value-of select="format-number($red, '#.##0,###', 'edesign-tr')"/></span></xsl:if>
                    </td>
                  </tr>
                </xsl:for-each>
              </table>

              <xsl:if test="cbc:Note">
                <div class="notes">
                  <h5>Mağaza Notu</h5>
                  <xsl:for-each select="cbc:Note"><div><xsl:value-of select="."/></div></xsl:for-each>
                </div>
              </xsl:if>

              <table class="sign">
                <tr>
                  <td>
                    <h5>Teslim Eden (Kargo / Şoför)</h5>
                    <div class="ln">Ad Soyad</div>
                    <div class="ln">İmza</div>
                  </td>
                  <td>
                    <h5>Teslim Alan (Mağaza)</h5>
                    <div><b><xsl:value-of select="cac:DeliveryCustomerParty/cac:DeliveryContact/cbc:Name"/></b></div>
                    <div class="ln" style="margin-top:14px">İmza / Kaşe</div>
                  </td>
                </tr>
              </table>
              <div class="foot">
                <b><xsl:value-of select="$irsNo"/></b> numaralı e-İrsaliyeye elektronik yanıttır · İrsaliye ETTN <xsl:value-of select="cac:DespatchDocumentReference/cbc:ID"/>
              </div>
            </div>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>

  <xsl:template name="ad">
    <xsl:param name="p"/>
    <xsl:value-of select="$p/cac:PartyName/cbc:Name"/>
    <xsl:if test="not($p/cac:PartyName/cbc:Name)"><xsl:value-of select="$p/cac:Person/cbc:FirstName"/><xsl:text> </xsl:text><xsl:value-of select="$p/cac:Person/cbc:FamilyName"/></xsl:if>
  </xsl:template>

  <xsl:template name="adres">
    <xsl:param name="a"/>
    <xsl:value-of select="$a/cbc:StreetName"/>
    <xsl:if test="$a/cbc:BuildingNumber"><xsl:text> No: </xsl:text><xsl:value-of select="$a/cbc:BuildingNumber"/></xsl:if>
    <xsl:text> · </xsl:text><xsl:value-of select="$a/cbc:PostalZone"/><xsl:text> </xsl:text><xsl:value-of select="$a/cbc:CitySubdivisionName"/> / <xsl:value-of select="$a/cbc:CityName"/>
  </xsl:template>

  <xsl:template name="seg">
    <xsl:param name="v"/>
    <xsl:param name="t"/>
    <xsl:param name="c"/>
    <xsl:if test="$v &gt; 0">
      <td class="{$c}" style="width:{format-number($v * 100 div $t, '0.##')}%"></td>
    </xsl:if>
  </xsl:template>

  <xsl:template name="tarih">
    <xsl:param name="d"/>
    <xsl:if test="string-length($d) &gt;= 10"><xsl:value-of select="concat(substring($d, 9, 2), '.', substring($d, 6, 2), '.', substring($d, 1, 4))"/></xsl:if>
  </xsl:template>

  <xsl:template name="birim">
    <xsl:param name="u"/>
    <xsl:choose>
      <xsl:when test="$u = 'C62' or $u = 'NIU'">adet</xsl:when>
      <xsl:when test="$u = 'BX'">koli</xsl:when>
      <xsl:when test="$u = 'PA'">paket</xsl:when>
      <xsl:when test="$u = 'PR'">çift</xsl:when>
      <xsl:when test="$u = 'SET'">set</xsl:when>
      <xsl:when test="$u = 'KGM'">kg</xsl:when>
      <xsl:when test="$u = 'LTR'">L</xsl:when>
      <xsl:when test="$u = 'MTR'">m</xsl:when>
      <xsl:otherwise><xsl:value-of select="$u"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
