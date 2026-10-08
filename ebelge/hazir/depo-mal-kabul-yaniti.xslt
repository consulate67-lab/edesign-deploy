<?xml version="1.0" encoding="UTF-8"?>
<!-- Hazır şablon: Depo mal kabul e-İrsaliye Yanıtı (ReceiptAdvice · SEVK; kabul / eksik / fazla / red özetli) -->
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
          body { margin: 0; background: #eaf1f5; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; color: #0f172a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { width: 210mm; max-width: 100%; margin: 16px auto; background: #fff; padding-bottom: 8mm; box-shadow: 0 6px 30px rgba(15,23,42,.12); }
          table { border-collapse: collapse; font-size: inherit; color: inherit; }
          .w { width: 100%; }
          .hero { background: #0e7490; background: linear-gradient(120deg, #0e7490 0%, #0891b2 45%, #4f46e5 100%); color: #fff; padding: 16px 9mm 30px; }
          .hero td { vertical-align: middle; }
          .logo { display: block; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,.18); }
          .co-name { font-size: 16px; font-weight: 800; }
          .co { color: #cffafe; font-size: 9.5px; line-height: 1.55; margin-top: 2px; }
          .doc { text-align: right; width: 240px; }
          .eyebrow { font-size: 9px; letter-spacing: 3px; font-weight: 700; color: #a5f3fc; }
          .ttl { font-size: 22px; font-weight: 800; margin: 2px 0 3px; }
          .docno { font-size: 10px; color: #e0f2fe; }
          .status { display: inline-block; margin-top: 8px; padding: 5px 12px; border-radius: 999px; font-weight: 800; font-size: 10.5px; letter-spacing: 1.4px; background: #fff; }
          .status i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: 1px; }
          .st-KABUL { color: #047857; } .st-KABUL i { background: #10b981; }
          .st-KISMI { color: #b45309; } .st-KISMI i { background: #f59e0b; }
          .st-RED { color: #b91c1c; } .st-RED i { background: #ef4444; }
          .body { padding: 0 9mm; }
          .flow { width: 100%; margin-top: -18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 8px 24px rgba(15,23,42,.10); border-collapse: separate; }
          .flow td.step { width: 25%; padding: 10px 12px; vertical-align: top; }
          .flow td.arw { width: 14px; color: #94a3b8; font-size: 15px; text-align: center; vertical-align: middle; }
          .step .n { display: inline-block; width: 18px; height: 18px; line-height: 18px; border-radius: 50%; text-align: center; background: #ecfeff; color: #0e7490; font-weight: 800; font-size: 9.5px; margin-right: 5px; }
          .step.on .n { background: #0891b2; color: #fff; }
          .step .k { font-size: 8.5px; letter-spacing: 1.4px; text-transform: uppercase; color: #64748b; font-weight: 700; }
          .step .v { font-size: 11.5px; font-weight: 800; margin-top: 5px; }
          .step .d { color: #64748b; font-size: 9.5px; margin-top: 1px; }
          .parties { width: 100%; margin-top: 12px; }
          .parties > tbody > tr > td { width: 50%; vertical-align: top; }
          .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 9px 12px; line-height: 1.55; }
          .card h4 { margin: 0 0 3px; font-size: 8.5px; letter-spacing: 1.8px; text-transform: uppercase; color: #0891b2; }
          .card .nm { font-size: 12.5px; font-weight: 800; }
          .muted { color: #64748b; }
          .kpi { width: calc(100% + 12px); margin: 12px -6px 0; border-collapse: separate; border-spacing: 6px 0; }
          .kpi td { width: 16.6%; border-radius: 10px; padding: 8px 10px; vertical-align: top; background: #f8fafc; border: 1px solid #e2e8f0; border-top: 3px solid #64748b; }
          .kpi .k { font-size: 8px; letter-spacing: 1.2px; text-transform: uppercase; font-weight: 700; color: #64748b; }
          .kpi .v { font-size: 18px; font-weight: 800; margin-top: 3px; line-height: 1.15; }
          .kpi .v small { font-size: 9.5px; font-weight: 700; }
          .kpi .s { font-size: 9px; color: #64748b; margin-top: 1px; }
          .kpi td.k-tes { border-top-color: #0891b2; }
          .kpi td.k-eks { border-top-color: #f59e0b; background: #fffbeb; } .k-eks .v { color: #b45309; }
          .kpi td.k-faz { border-top-color: #6366f1; background: #eef2ff; } .k-faz .v { color: #4338ca; }
          .kpi td.k-red { border-top-color: #ef4444; background: #fef2f2; } .k-red .v { color: #b91c1c; }
          .kpi td.k-kab { border-top-color: #10b981; background: #ecfdf5; } .k-kab .v { color: #047857; }
          .dist { margin-top: 10px; }
          .bar { width: 100%; height: 9px; table-layout: fixed; border-radius: 999px; overflow: hidden; }
          .bar td { padding: 0; height: 9px; }
          .b-kab { background: #10b981; } .b-faz { background: #6366f1; } .b-red { background: #ef4444; } .b-eks { background: #f59e0b; }
          .legend { margin-top: 5px; color: #475569; font-size: 9px; }
          .legend span { margin-right: 12px; white-space: nowrap; }
          .legend i { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; vertical-align: 0; }
          .lines { width: 100%; margin-top: 12px; }
          .lines th { background: #0f172a; color: #fff; font-size: 8.5px; letter-spacing: .6px; text-transform: uppercase; padding: 7px 6px; text-align: right; font-weight: 700; }
          .lines th.l { text-align: left; } .lines th.c { text-align: center; }
          .lines td { padding: 7px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; vertical-align: middle; }
          .lines td.l { text-align: left; } .lines td.c { text-align: center; }
          .lines tr.has-why td { border-bottom: 0; }
          .r-ok td.ix { border-left: 3px solid #10b981; } .r-eks td.ix { border-left: 3px solid #f59e0b; }
          .r-faz td.ix { border-left: 3px solid #6366f1; } .r-red td.ix { border-left: 3px solid #ef4444; }
          .ix { color: #64748b; font-weight: 700; }
          .pn { font-weight: 700; font-size: 11px; }
          .pc { color: #64748b; font-size: 9px; }
          .pc b { font-family: Consolas, 'Courier New', monospace; font-weight: 600; color: #334155; }
          .z { color: #cbd5e1; }
          .q-eks { color: #b45309; font-weight: 800; } .q-faz { color: #4338ca; font-weight: 800; }
          .q-red { color: #b91c1c; font-weight: 800; } .q-kab { color: #047857; font-weight: 800; }
          .chip { display: inline-block; padding: 2px 7px; border-radius: 999px; font-size: 8.5px; font-weight: 800; letter-spacing: .4px; margin: 1px 0 1px 2px; white-space: nowrap; }
          .c-ok { background: #d1fae5; color: #047857; } .c-eks { background: #fef3c7; color: #92400e; }
          .c-faz { background: #e0e7ff; color: #3730a3; } .c-red { background: #fee2e2; color: #991b1b; }
          .why td { padding: 0 6px 7px; text-align: left; color: #475569; font-size: 9.5px; border-bottom: 1px solid #e2e8f0; }
          .why .t { display: inline-block; min-width: 76px; font-weight: 800; font-size: 8.5px; letter-spacing: .4px; text-transform: uppercase; }
          .t-red { color: #b91c1c; } .t-time { color: #7c3aed; } .t-note { color: #0e7490; }
          .lines tfoot td { background: #f1f5f9; font-weight: 800; border-top: 2px solid #0f172a; border-bottom: 0; }
          .notes { margin-top: 12px; border-radius: 10px; background: #f0f9ff; border: 1px solid #bae6fd; padding: 9px 12px; line-height: 1.6; }
          .notes h5, .sign h5 { margin: 0 0 4px; font-size: 8.5px; letter-spacing: 1.6px; text-transform: uppercase; color: #0e7490; }
          .sign { width: calc(100% + 16px); margin: 14px -8px 0; border-collapse: separate; border-spacing: 8px 0; }
          .sign td { width: 33.3%; border: 1px dashed #94a3b8; border-radius: 10px; padding: 8px 10px; height: 84px; vertical-align: top; }
          .sign .ln { border-bottom: 1px dotted #94a3b8; height: 17px; color: #94a3b8; font-size: 8.5px; }
          .foot { margin-top: 10px; text-align: center; color: #64748b; font-size: 9px; line-height: 1.6; }
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
          <xsl:variable name="sSevk" select="$sRec + $sRedB + $sEks - $sFaz"/>
          <xsl:variable name="sTaban" select="$sSevk + $sFaz"/>
          <xsl:variable name="nTop" select="count($L)"/>
          <xsl:variable name="nEks" select="count($L[cbc:ShortQuantity &gt; 0])"/>
          <xsl:variable name="nFaz" select="count($L[cbc:OversupplyQuantity &gt; 0])"/>
          <xsl:variable name="nRed" select="count($L[cbc:RejectedQuantity &gt; 0])"/>
          <xsl:variable name="nTam" select="count($L[not(cbc:ShortQuantity &gt; 0) and not(cbc:OversupplyQuantity &gt; 0) and not(cbc:RejectedQuantity &gt; 0)])"/>
          <xsl:variable name="u1" select="string($L[1]/cbc:ReceivedQuantity/@unitCode)"/>
          <xsl:variable name="tekBirim" select="$u1 != '' and not($L/*[@unitCode != $u1])"/>
          <xsl:variable name="birim1"><xsl:call-template name="birim"><xsl:with-param name="u" select="$u1"/></xsl:call-template></xsl:variable>
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
            <div class="hero">
              <table class="w">
                <tr>
                  <td style="width:70px">
                    <img class="logo" data-xslt-obj="obj-1" width="58" alt="Logo" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='26' fill='%23ffffff'/%3E%3Cpath d='M28 54 L60 34 L92 54 V90 H28 Z' fill='none' stroke='%230891b2' stroke-width='7' stroke-linejoin='round'/%3E%3Crect x='46' y='62' width='28' height='28' rx='3' fill='%234f46e5'/%3E%3Cpath d='M46 72 H74 M46 81 H74' stroke='%23ffffff' stroke-width='3'/%3E%3C/svg%3E"/>
                  </td>
                  <td>
                    <div class="co-name"><xsl:call-template name="ad"><xsl:with-param name="p" select="$alici"/></xsl:call-template></div>
                    <div class="co">
                      <xsl:call-template name="adres"><xsl:with-param name="a" select="$alici/cac:PostalAddress"/></xsl:call-template><br/>
                      <xsl:if test="$alici/cac:Contact/cbc:Telephone">Tel: <xsl:value-of select="$alici/cac:Contact/cbc:Telephone"/> · </xsl:if><xsl:value-of select="$alici/cac:Contact/cbc:ElectronicMail"/><br/>
                      VD: <xsl:value-of select="$alici/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/> · <xsl:value-of select="$alici/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']/@schemeID"/>: <xsl:value-of select="$alici/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']"/>
                    </div>
                  </td>
                  <td class="doc">
                    <div class="eyebrow">e-İRSALİYE YANITI</div>
                    <div class="ttl">Mal Kabul Bildirimi</div>
                    <div class="docno">Yanıt No: <b><xsl:value-of select="cbc:ID"/></b></div>
                    <div class="status st-{$durum}"><i></i>
                      <xsl:choose>
                        <xsl:when test="$durum = 'RED'">REDDEDİLDİ</xsl:when>
                        <xsl:when test="$durum = 'KISMI'">KISMİ KABUL</xsl:when>
                        <xsl:otherwise>TAMAMI KABUL</xsl:otherwise>
                      </xsl:choose>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <div class="body">
              <table class="flow">
                <tr>
                  <td class="step">
                    <div><span class="n">1</span><span class="k">Sipariş</span></div>
                    <div class="v"><xsl:value-of select="cac:OrderReference/cbc:ID"/><xsl:if test="not(cac:OrderReference/cbc:ID)">—</xsl:if></div>
                    <div class="d"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cac:OrderReference/cbc:IssueDate"/></xsl:call-template></div>
                  </td>
                  <td class="arw">›</td>
                  <td class="step">
                    <div><span class="n">2</span><span class="k">Yanıtlanan İrsaliye</span></div>
                    <div class="v"><xsl:value-of select="$irsNo"/></div>
                    <div class="d"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cac:DespatchDocumentReference/cbc:IssueDate"/></xsl:call-template></div>
                  </td>
                  <td class="arw">›</td>
                  <td class="step">
                    <div><span class="n">3</span><span class="k">Teslim Alındı</span></div>
                    <div class="v"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cac:Shipment/cac:Delivery/cbc:ActualDeliveryDate"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring(cac:Shipment/cac:Delivery/cbc:ActualDeliveryTime, 1, 5)"/></div>
                    <div class="d"><xsl:value-of select="cac:DeliveryCustomerParty/cac:DeliveryContact/cbc:Name"/></div>
                  </td>
                  <td class="arw">›</td>
                  <td class="step on">
                    <div><span class="n">4</span><span class="k">Yanıt</span></div>
                    <div class="v"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cbc:IssueDate"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring(cbc:IssueTime, 1, 5)"/></div>
                    <div class="d"><xsl:value-of select="cbc:ProfileID"/> · <xsl:value-of select="cbc:ReceiptAdviceTypeCode"/></div>
                  </td>
                </tr>
              </table>

              <table class="parties">
                <tr>
                  <td style="padding-right:6px">
                    <div class="card">
                      <h4>Malı Gönderen</h4>
                      <div class="nm"><xsl:call-template name="ad"><xsl:with-param name="p" select="$gonderen"/></xsl:call-template></div>
                      <xsl:call-template name="adres"><xsl:with-param name="a" select="$gonderen/cac:PostalAddress"/></xsl:call-template><br/>
                      <span class="muted">VD:</span><xsl:text> </xsl:text><xsl:value-of select="$gonderen/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/>
                      · <span class="muted"><xsl:value-of select="$gonderen/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']/@schemeID"/>:</span><xsl:text> </xsl:text><b><xsl:value-of select="$gonderen/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']"/></b>
                      <xsl:if test="cac:DespatchSupplierParty/cac:DespatchContact/cbc:Name"><br/><span class="muted">Sevk eden:</span><xsl:text> </xsl:text><xsl:value-of select="cac:DespatchSupplierParty/cac:DespatchContact/cbc:Name"/></xsl:if>
                    </div>
                  </td>
                  <td style="padding-left:6px">
                    <div class="card">
                      <h4>Yanıt Bilgileri</h4>
                      <span class="muted">Yanıt No:</span><xsl:text> </xsl:text><b><xsl:value-of select="cbc:ID"/></b><br/>
                      <span class="muted">Düzenleme:</span><xsl:text> </xsl:text><xsl:call-template name="tarih"><xsl:with-param name="d" select="cbc:IssueDate"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring(cbc:IssueTime, 1, 5)"/>
                      <xsl:if test="cac:Shipment/cbc:ID != ''"> · <span class="muted">Sevkiyat:</span><xsl:text> </xsl:text><xsl:value-of select="cac:Shipment/cbc:ID"/></xsl:if><br/>
                      <span class="muted">İrsaliye ETTN:</span><xsl:text> </xsl:text><span style="font-size:9px"><xsl:value-of select="cac:DespatchDocumentReference/cbc:ID"/></span><br/>
                      <span class="muted">Yanıt ETTN:</span><xsl:text> </xsl:text><span style="font-size:9px"><xsl:value-of select="cbc:UUID"/></span>
                    </div>
                  </td>
                </tr>
              </table>

              <table class="kpi">
                <tr>
                  <xsl:choose>
                    <xsl:when test="$tekBirim">
                      <td><div class="k">İrsaliyedeki</div><div class="v"><xsl:value-of select="format-number($sSevk, '#.##0,###', 'edesign-tr')"/><xsl:text> </xsl:text><small><xsl:value-of select="$birim1"/></small></div><div class="s"><xsl:value-of select="$nTop"/> kalem</div></td>
                      <td class="k-tes"><div class="k">Teslim Alınan</div><div class="v"><xsl:value-of select="format-number($sRec, '#.##0,###', 'edesign-tr')"/><xsl:text> </xsl:text><small><xsl:value-of select="$birim1"/></small></div><div class="s">depoya giren</div></td>
                      <td class="k-eks"><div class="k">Eksik</div><div class="v"><xsl:value-of select="format-number($sEks, '#.##0,###', 'edesign-tr')"/><xsl:text> </xsl:text><small><xsl:value-of select="$birim1"/></small></div><div class="s"><xsl:value-of select="$nEks"/> kalemde</div></td>
                      <td class="k-faz"><div class="k">Fazla</div><div class="v"><xsl:value-of select="format-number($sFaz, '#.##0,###', 'edesign-tr')"/><xsl:text> </xsl:text><small><xsl:value-of select="$birim1"/></small></div><div class="s"><xsl:value-of select="$nFaz"/> kalemde</div></td>
                      <td class="k-red"><div class="k">Reddedilen</div><div class="v"><xsl:value-of select="format-number($sRed, '#.##0,###', 'edesign-tr')"/><xsl:text> </xsl:text><small><xsl:value-of select="$birim1"/></small></div><div class="s"><xsl:value-of select="$nRed"/> kalemde</div></td>
                      <td class="k-kab"><div class="k">Kabul Edilen</div><div class="v"><xsl:value-of select="format-number($sKab, '#.##0,###', 'edesign-tr')"/><xsl:text> </xsl:text><small><xsl:value-of select="$birim1"/></small></div><div class="s"><xsl:if test="$sTaban &gt; 0">%<xsl:value-of select="format-number($sKab * 100 div $sTaban, '0', 'edesign-tr')"/> kabul oranı</xsl:if></div></td>
                    </xsl:when>
                    <xsl:otherwise>
                      <td><div class="k">Toplam Kalem</div><div class="v"><xsl:value-of select="$nTop"/></div><div class="s">irsaliyedeki satır</div></td>
                      <td class="k-tes"><div class="k">Teslim Alınan</div><div class="v"><xsl:value-of select="count($L[cbc:ReceivedQuantity &gt; 0])"/></div><div class="s">kalem</div></td>
                      <td class="k-eks"><div class="k">Eksik</div><div class="v"><xsl:value-of select="$nEks"/></div><div class="s">kalem</div></td>
                      <td class="k-faz"><div class="k">Fazla</div><div class="v"><xsl:value-of select="$nFaz"/></div><div class="s">kalem</div></td>
                      <td class="k-red"><div class="k">Red</div><div class="v"><xsl:value-of select="$nRed"/></div><div class="s">kalem</div></td>
                      <td class="k-kab"><div class="k">Sorunsuz</div><div class="v"><xsl:value-of select="$nTam"/></div><div class="s">kalem tam kabul</div></td>
                    </xsl:otherwise>
                  </xsl:choose>
                </tr>
              </table>

              <xsl:if test="$tekBirim and $sTaban &gt; 0">
                <div class="dist">
                  <table class="bar">
                    <tr>
                      <xsl:call-template name="seg"><xsl:with-param name="v" select="$sKab - $sFaz"/><xsl:with-param name="t" select="$sTaban"/><xsl:with-param name="c" select="'b-kab'"/></xsl:call-template>
                      <xsl:call-template name="seg"><xsl:with-param name="v" select="$sFaz"/><xsl:with-param name="t" select="$sTaban"/><xsl:with-param name="c" select="'b-faz'"/></xsl:call-template>
                      <xsl:call-template name="seg"><xsl:with-param name="v" select="$sRed"/><xsl:with-param name="t" select="$sTaban"/><xsl:with-param name="c" select="'b-red'"/></xsl:call-template>
                      <xsl:call-template name="seg"><xsl:with-param name="v" select="$sEks"/><xsl:with-param name="t" select="$sTaban"/><xsl:with-param name="c" select="'b-eks'"/></xsl:call-template>
                    </tr>
                  </table>
                  <div class="legend">
                    <span><i class="b-kab"></i>İrsaliyeye uygun kabul</span>
                    <span><i class="b-faz"></i>Fazla teslim</span>
                    <span><i class="b-red"></i>Reddedilen</span>
                    <span><i class="b-eks"></i>Eksik (gelmedi)</span>
                  </div>
                </div>
              </xsl:if>

              <table class="lines">
                <thead>
                  <tr>
                    <th class="c" style="width:26px">#</th>
                    <th class="l">Ürün</th>
                    <th class="l" style="width:40px">Birim</th>
                    <th style="width:52px">İrsaliye</th>
                    <th style="width:52px">Teslim</th>
                    <th style="width:44px">Eksik</th>
                    <th style="width:44px">Fazla</th>
                    <th style="width:40px">Red</th>
                    <th style="width:50px">Kabul</th>
                    <th class="c" style="width:86px">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="$L">
                    <xsl:variable name="rec" select="sum(cbc:ReceivedQuantity)"/>
                    <xsl:variable name="eks" select="sum(cbc:ShortQuantity)"/>
                    <xsl:variable name="faz" select="sum(cbc:OversupplyQuantity)"/>
                    <xsl:variable name="red" select="sum(cbc:RejectedQuantity)"/>
                    <xsl:variable name="ayri" select="$red &gt; $rec"/>
                    <xsl:variable name="kab" select="$rec - $red * number(not($ayri))"/>
                    <xsl:variable name="sevk" select="$rec + $red * number($ayri) + $eks - $faz"/>
                    <xsl:variable name="why" select="cbc:RejectReason | cbc:TimingComplaint | cbc:Note"/>
                    <xsl:variable name="cls">
                      <xsl:choose>
                        <xsl:when test="$red &gt; 0">red</xsl:when>
                        <xsl:when test="$eks &gt; 0">eks</xsl:when>
                        <xsl:when test="$faz &gt; 0">faz</xsl:when>
                        <xsl:otherwise>ok</xsl:otherwise>
                      </xsl:choose>
                    </xsl:variable>
                    <tr>
                      <xsl:attribute name="class">r-<xsl:value-of select="$cls"/><xsl:if test="$why"> has-why</xsl:if></xsl:attribute>
                      <td class="c ix"><xsl:value-of select="cbc:ID"/></td>
                      <td class="l">
                        <div class="pn"><xsl:value-of select="cac:Item/cbc:Name"/></div>
                        <div class="pc"><b><xsl:value-of select="cac:Item/cac:SellersItemIdentification/cbc:ID"/></b><xsl:if test="cac:Item/cbc:Description"> · <xsl:value-of select="cac:Item/cbc:Description"/></xsl:if></div>
                      </td>
                      <td class="l"><xsl:call-template name="birim"><xsl:with-param name="u" select="cbc:ReceivedQuantity/@unitCode"/></xsl:call-template></td>
                      <td><xsl:call-template name="q"><xsl:with-param name="v" select="$sevk"/></xsl:call-template></td>
                      <td><b><xsl:call-template name="q"><xsl:with-param name="v" select="$rec"/></xsl:call-template></b></td>
                      <td><xsl:call-template name="q"><xsl:with-param name="v" select="$eks"/><xsl:with-param name="c" select="'q-eks'"/></xsl:call-template></td>
                      <td><xsl:call-template name="q"><xsl:with-param name="v" select="$faz"/><xsl:with-param name="c" select="'q-faz'"/></xsl:call-template></td>
                      <td><xsl:call-template name="q"><xsl:with-param name="v" select="$red"/><xsl:with-param name="c" select="'q-red'"/></xsl:call-template></td>
                      <td><xsl:call-template name="q"><xsl:with-param name="v" select="$kab"/><xsl:with-param name="c" select="'q-kab'"/></xsl:call-template></td>
                      <td class="c">
                        <xsl:if test="$red &gt; 0 and $kab = 0"><span class="chip c-red">RED</span></xsl:if>
                        <xsl:if test="$red &gt; 0 and $kab &gt; 0"><span class="chip c-red">KISMİ RED</span></xsl:if>
                        <xsl:if test="$eks &gt; 0"><span class="chip c-eks">EKSİK</span></xsl:if>
                        <xsl:if test="$faz &gt; 0"><span class="chip c-faz">FAZLA</span></xsl:if>
                        <xsl:if test="$cls = 'ok'"><span class="chip c-ok">TAM</span></xsl:if>
                      </td>
                    </tr>
                    <xsl:if test="$why">
                      <tr class="why r-{$cls}">
                        <td class="ix"></td>
                        <td colspan="9">
                          <xsl:for-each select="cbc:RejectReason"><div><span class="t t-red">Red nedeni</span><xsl:value-of select="."/></div></xsl:for-each>
                          <xsl:for-each select="cbc:TimingComplaint"><div><span class="t t-time">Zamanlama</span><xsl:value-of select="."/></div></xsl:for-each>
                          <xsl:for-each select="cbc:Note"><div><span class="t t-note">Not</span><xsl:value-of select="."/></div></xsl:for-each>
                        </td>
                      </tr>
                    </xsl:if>
                  </xsl:for-each>
                </tbody>
                <xsl:if test="$tekBirim">
                  <tfoot>
                    <tr>
                      <td></td>
                      <td class="l">TOPLAM · <xsl:value-of select="$nTop"/> kalem</td>
                      <td class="l"><xsl:value-of select="$birim1"/></td>
                      <td><xsl:value-of select="format-number($sSevk, '#.##0,###', 'edesign-tr')"/></td>
                      <td><xsl:value-of select="format-number($sRec, '#.##0,###', 'edesign-tr')"/></td>
                      <td class="q-eks"><xsl:value-of select="format-number($sEks, '#.##0,###', 'edesign-tr')"/></td>
                      <td class="q-faz"><xsl:value-of select="format-number($sFaz, '#.##0,###', 'edesign-tr')"/></td>
                      <td class="q-red"><xsl:value-of select="format-number($sRed, '#.##0,###', 'edesign-tr')"/></td>
                      <td class="q-kab"><xsl:value-of select="format-number($sKab, '#.##0,###', 'edesign-tr')"/></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </xsl:if>
              </table>

              <xsl:if test="cbc:Note">
                <div class="notes">
                  <h5>Açıklamalar</h5>
                  <xsl:for-each select="cbc:Note"><div>• <xsl:value-of select="."/></div></xsl:for-each>
                </div>
              </xsl:if>

              <table class="sign">
                <tr>
                  <td>
                    <h5>Teslim Eden (Şoför)</h5>
                    <div class="ln">Ad Soyad</div>
                    <div class="ln">Plaka</div>
                    <div class="ln">İmza</div>
                  </td>
                  <td>
                    <h5>Kontrol Eden</h5>
                    <div><b><xsl:value-of select="cac:DeliveryCustomerParty/cac:DeliveryContact/cbc:Name"/></b></div>
                    <div class="ln" style="margin-top:20px">İmza</div>
                  </td>
                  <td>
                    <h5>Depo Sorumlusu</h5>
                    <div class="ln">Ad Soyad</div>
                    <div class="ln">Tarih / Saat</div>
                    <div class="ln">İmza / Kaşe</div>
                  </td>
                </tr>
              </table>
              <div class="foot">
                Bu belge <b><xsl:value-of select="$irsNo"/></b> numaralı e-İrsaliyeye verilen elektronik yanıttır · ETTN <b><xsl:value-of select="cbc:UUID"/></b>
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

  <xsl:template name="q">
    <xsl:param name="v"/>
    <xsl:param name="c" select="''"/>
    <xsl:choose>
      <xsl:when test="not($v != 0)"><span class="z">—</span></xsl:when>
      <xsl:otherwise><span class="{$c}"><xsl:value-of select="format-number($v, '#.##0,###', 'edesign-tr')"/></span></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="tarih">
    <xsl:param name="d"/>
    <xsl:if test="string-length($d) &gt;= 10"><xsl:value-of select="concat(substring($d, 9, 2), '.', substring($d, 6, 2), '.', substring($d, 1, 4))"/></xsl:if>
  </xsl:template>

  <xsl:template name="birim">
    <xsl:param name="u"/>
    <xsl:choose>
      <xsl:when test="$u = 'C62' or $u = 'NIU'">Adet</xsl:when>
      <xsl:when test="$u = 'BX'">Koli</xsl:when>
      <xsl:when test="$u = 'PA'">Paket</xsl:when>
      <xsl:when test="$u = 'BG'">Çuval</xsl:when>
      <xsl:when test="$u = 'PF'">Palet</xsl:when>
      <xsl:when test="$u = 'KGM'">kg</xsl:when>
      <xsl:when test="$u = 'TNE'">Ton</xsl:when>
      <xsl:when test="$u = 'LTR'">L</xsl:when>
      <xsl:when test="$u = 'MTR'">m</xsl:when>
      <xsl:when test="$u = 'MTK'">m²</xsl:when>
      <xsl:when test="$u = 'MTQ'">m³</xsl:when>
      <xsl:when test="$u = 'SET'">Set</xsl:when>
      <xsl:otherwise><xsl:value-of select="$u"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
