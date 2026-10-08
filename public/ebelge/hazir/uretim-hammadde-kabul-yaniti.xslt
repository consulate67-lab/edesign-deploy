<?xml version="1.0" encoding="UTF-8"?>
<!-- Hazır şablon: Hammadde giriş kalite kontrol e-İrsaliye Yanıtı (ReceiptAdvice · SEVK; lot no, ölçüm farkı, uygunsuzluk kayıtları) -->
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
          body { margin: 0; background: #e5e7eb; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; color: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { width: 210mm; max-width: 100%; margin: 16px auto; background: #fff; padding: 0 0 8mm; box-shadow: 0 6px 30px rgba(17,24,39,.18); }
          table { border-collapse: collapse; font-size: inherit; color: inherit; }
          .w { width: 100%; }
          .hz { height: 7px; background: #f97316; background: repeating-linear-gradient(135deg, #f97316 0 12px, #111827 12px 24px); }
          .top { background: #111827; color: #fff; padding: 14px 9mm 16px; }
          .top td { vertical-align: middle; }
          .co-name { font-size: 15px; font-weight: 800; }
          .co { color: #9ca3af; font-size: 9.5px; line-height: 1.55; margin-top: 2px; }
          .ttl { text-align: right; }
          .ttl .t0 { color: #fb923c; font-size: 9px; letter-spacing: 3px; font-weight: 800; }
          .ttl .t1 { font-size: 19px; font-weight: 800; letter-spacing: 1px; margin-top: 2px; }
          .ttl .t2 { color: #d1d5db; font-size: 10px; margin-top: 2px; font-family: Consolas, 'Courier New', monospace; }
          .stamp { display: inline-block; border: 3px double #f59e0b; color: #f59e0b; padding: 6px 12px; font-weight: 900; letter-spacing: 2px; font-size: 13px; transform: rotate(-5deg); text-align: center; line-height: 1.1; border-radius: 4px; }
          .stamp small { display: block; font-size: 7.5px; letter-spacing: 1.5px; font-weight: 700; margin-top: 2px; }
          .stamp.KABUL { border-color: #34d399; color: #34d399; } .stamp.RED { border-color: #f87171; color: #f87171; }
          .body { padding: 0 9mm; }
          .grid { width: 100%; margin-top: 12px; border: 1px solid #d1d5db; }
          .grid td { width: 25%; border: 1px solid #e5e7eb; padding: 6px 9px; vertical-align: top; }
          .grid .k { font-size: 8px; letter-spacing: 1.3px; text-transform: uppercase; color: #6b7280; font-weight: 700; }
          .grid .v { font-family: Consolas, 'Courier New', monospace; font-size: 11px; font-weight: 700; margin-top: 2px; }
          .parties { width: 100%; margin-top: 10px; }
          .parties > tbody > tr > td { width: 50%; vertical-align: top; }
          .pbox { border-left: 4px solid #f97316; background: #f9fafb; padding: 8px 11px; line-height: 1.55; }
          .pbox.r { border-left-color: #111827; }
          .pbox h4 { margin: 0 0 2px; font-size: 8.5px; letter-spacing: 1.8px; text-transform: uppercase; color: #6b7280; }
          .pbox .nm { font-size: 12px; font-weight: 800; }
          .muted { color: #6b7280; }
          .sum { width: calc(100% + 12px); margin: 12px -6px 0; border-collapse: separate; border-spacing: 6px 0; }
          .sum td { width: 25%; padding: 8px 11px; vertical-align: middle; border: 1px solid #e5e7eb; background: #fff; }
          .sum .n { font-size: 22px; font-weight: 900; line-height: 1; font-family: Consolas, 'Courier New', monospace; }
          .sum .l { font-size: 8.5px; letter-spacing: 1.2px; text-transform: uppercase; font-weight: 800; margin-top: 3px; }
          .sum .d { font-size: 9px; color: #6b7280; }
          .sum td.u-ok { border-top: 4px solid #10b981; } .u-ok .n, .u-ok .l { color: #047857; }
          .sum td.u-sart { border-top: 4px solid #f59e0b; } .u-sart .n, .u-sart .l { color: #b45309; }
          .sum td.u-ret { border-top: 4px solid #ef4444; } .u-ret .n, .u-ret .l { color: #b91c1c; }
          .sum td.u-top { border-top: 4px solid #111827; background: #f9fafb; }
          h3.sec { margin: 14px 0 6px; font-size: 10.5px; letter-spacing: 1.8px; text-transform: uppercase; }
          h3.sec i { display: inline-block; width: 10px; height: 10px; background: #f97316; margin-right: 6px; vertical-align: -1px; }
          .lines { width: 100%; }
          .lines th { background: #111827; color: #f9fafb; font-size: 8.5px; letter-spacing: .5px; text-transform: uppercase; padding: 7px 6px; text-align: right; }
          .lines th.l { text-align: left; } .lines th.c { text-align: center; }
          .lines td { padding: 6px 6px; border-bottom: 1px solid #e5e7eb; text-align: right; vertical-align: middle; font-family: Consolas, 'Courier New', monospace; font-size: 10.5px; }
          .lines td.l { text-align: left; font-family: 'Segoe UI', Arial, sans-serif; }
          .lines td.c { text-align: center; }
          .lines tbody tr:nth-child(even) td { background: #f9fafb; }
          .ix { color: #f97316; font-weight: 900; }
          .pn { font-weight: 800; font-size: 11px; }
          .pd { color: #6b7280; font-size: 9px; }
          .lot { display: inline-block; font-family: Consolas, 'Courier New', monospace; background: #111827; color: #fbbf24; font-size: 8.5px; padding: 0 5px; border-radius: 2px; margin-left: 4px; }
          .z { color: #d1d5db; }
          .plus { color: #4338ca; font-weight: 800; } .minus { color: #b45309; font-weight: 800; }
          .q-red { color: #b91c1c; font-weight: 800; } .q-kab { color: #047857; font-weight: 800; }
          .res { display: inline-block; min-width: 70px; padding: 3px 6px; font-family: 'Segoe UI', Arial, sans-serif; font-weight: 900; font-size: 8.5px; letter-spacing: .8px; border-radius: 3px; }
          .res-ok { background: #d1fae5; color: #065f46; } .res-sart { background: #fef3c7; color: #92400e; } .res-ret { background: #111827; color: #fca5a5; }
          .ncr { width: 100%; border-collapse: separate; border-spacing: 0 6px; }
          .ncr td { vertical-align: top; padding: 8px 10px; background: #fff; border: 1px solid #e5e7eb; }
          .ncr td.id { width: 74px; background: #111827; color: #fbbf24; font-family: Consolas, 'Courier New', monospace; font-weight: 800; font-size: 11px; border-color: #111827; }
          .ncr td.id small { display: block; color: #9ca3af; font-size: 8.5px; font-weight: 600; margin-top: 2px; }
          .ncr .h { font-weight: 800; font-size: 11px; }
          .ncr .tp { display: inline-block; font-weight: 800; font-size: 8.5px; letter-spacing: .6px; padding: 1px 6px; border-radius: 3px; margin-right: 4px; }
          .tp-red { background: #fee2e2; color: #991b1b; } .tp-eks { background: #fef3c7; color: #92400e; } .tp-faz { background: #e0e7ff; color: #3730a3; } .tp-time { background: #ede9fe; color: #5b21b6; }
          .ncr .tx { color: #374151; margin-top: 3px; line-height: 1.5; }
          .ncr td.act { width: 150px; color: #6b7280; font-size: 9.5px; }
          .notes { margin-top: 8px; border: 1px dashed #9ca3af; padding: 8px 11px; line-height: 1.6; color: #374151; }
          .sign { width: calc(100% + 16px); margin: 12px -8px 0; border-collapse: separate; border-spacing: 8px 0; }
          .sign td { width: 33.3%; border: 1.5px solid #111827; padding: 7px 10px; height: 82px; vertical-align: top; }
          .sign h5 { margin: 0 0 4px; font-size: 8.5px; letter-spacing: 1.6px; text-transform: uppercase; }
          .sign .ln { border-bottom: 1px dotted #9ca3af; height: 17px; color: #9ca3af; font-size: 8.5px; }
          .foot { margin-top: 10px; text-align: center; color: #6b7280; font-size: 9px; }
          @page { size: A4; margin: 6mm; }
          @media print { body { background: #fff; } .page { margin: 0; box-shadow: none; width: auto; padding-bottom: 0; } }
        ]]></style>
      </head>
      <body>
        <xsl:for-each select="/n1:ReceiptAdvice">
          <xsl:variable name="alici" select="cac:DeliveryCustomerParty/cac:Party"/>
          <xsl:variable name="gonderen" select="cac:DespatchSupplierParty/cac:Party"/>
          <xsl:variable name="L" select="cac:ReceiptLine"/>
          <xsl:variable name="nTop" select="count($L)"/>
          <xsl:variable name="nRed" select="count($L[cbc:RejectedQuantity &gt; 0])"/>
          <xsl:variable name="nSart" select="count($L[not(cbc:RejectedQuantity &gt; 0) and (cbc:ShortQuantity &gt; 0 or cbc:OversupplyQuantity &gt; 0)])"/>
          <xsl:variable name="nTam" select="count($L[not(cbc:ShortQuantity &gt; 0) and not(cbc:OversupplyQuantity &gt; 0) and not(cbc:RejectedQuantity &gt; 0)])"/>
          <xsl:variable name="durum">
            <xsl:choose>
              <xsl:when test="$nTop &gt; 0 and $nRed = $nTop and not($L[cbc:ReceivedQuantity &gt; 0])">RED</xsl:when>
              <xsl:when test="$nTam &lt; $nTop">KISMI</xsl:when>
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
            <div class="hz"></div>
            <div class="top">
              <table class="w">
                <tr>
                  <td style="width:66px">
                    <img data-xslt-obj="obj-1" width="54" alt="Logo" style="display:block" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='10' fill='%23f97316'/%3E%3Cg transform='translate(60 60)' fill='%23111827'%3E%3Ccircle r='26'/%3E%3Crect x='-7' y='-40' width='14' height='18' rx='2'/%3E%3Crect x='-7' y='22' width='14' height='18' rx='2'/%3E%3Crect x='-40' y='-7' width='18' height='14' rx='2'/%3E%3Crect x='22' y='-7' width='18' height='14' rx='2'/%3E%3Crect x='-7' y='-40' width='14' height='18' rx='2' transform='rotate(45)'/%3E%3Crect x='-7' y='22' width='14' height='18' rx='2' transform='rotate(45)'/%3E%3Crect x='-40' y='-7' width='18' height='14' rx='2' transform='rotate(45)'/%3E%3Crect x='22' y='-7' width='18' height='14' rx='2' transform='rotate(45)'/%3E%3Ccircle r='10' fill='%23f97316'/%3E%3C/g%3E%3C/svg%3E"/>
                  </td>
                  <td>
                    <div class="co-name"><xsl:call-template name="ad"><xsl:with-param name="p" select="$alici"/></xsl:call-template></div>
                    <div class="co">
                      <xsl:call-template name="adres"><xsl:with-param name="a" select="$alici/cac:PostalAddress"/></xsl:call-template><br/>
                      VD: <xsl:value-of select="$alici/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/> · <xsl:value-of select="$alici/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']/@schemeID"/>: <xsl:value-of select="$alici/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']"/>
                      <xsl:if test="$alici/cac:Contact/cbc:Telephone"> · <xsl:value-of select="$alici/cac:Contact/cbc:Telephone"/></xsl:if>
                    </div>
                  </td>
                  <td class="ttl" style="width:210px">
                    <div class="t0">e-İRSALİYE YANITI</div>
                    <div class="t1">GİRİŞ KONTROL</div>
                    <div class="t2"><xsl:value-of select="cbc:ID"/></div>
                  </td>
                  <td style="width:112px;text-align:right">
                    <div class="stamp {$durum}">
                      <xsl:choose>
                        <xsl:when test="$durum = 'RED'">RET</xsl:when>
                        <xsl:when test="$durum = 'KISMI'">ŞARTLI</xsl:when>
                        <xsl:otherwise>UYGUN</xsl:otherwise>
                      </xsl:choose>
                      <small>
                        <xsl:choose>
                          <xsl:when test="$durum = 'KISMI'">KISMİ KABUL</xsl:when>
                          <xsl:otherwise>KALİTE KONTROL</xsl:otherwise>
                        </xsl:choose>
                      </small>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <div class="body">
              <table class="grid">
                <tr>
                  <td><div class="k">Yanıt Tarihi</div><div class="v"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cbc:IssueDate"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring(cbc:IssueTime, 1, 5)"/></div></td>
                  <td><div class="k">Yanıtlanan İrsaliye</div><div class="v"><xsl:value-of select="$irsNo"/></div></td>
                  <td><div class="k">İrsaliye Tarihi</div><div class="v"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cac:DespatchDocumentReference/cbc:IssueDate"/></xsl:call-template></div></td>
                  <td><div class="k">Satın Alma Siparişi</div><div class="v"><xsl:value-of select="cac:OrderReference/cbc:ID"/></div></td>
                </tr>
                <tr>
                  <td><div class="k">Fiili Teslim</div><div class="v"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cac:Shipment/cac:Delivery/cbc:ActualDeliveryDate"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring(cac:Shipment/cac:Delivery/cbc:ActualDeliveryTime, 1, 5)"/></div></td>
                  <td><div class="k">Sevkiyat / Araç</div><div class="v"><xsl:value-of select="cac:Shipment/cbc:ID"/><xsl:if test="not(cac:Shipment/cbc:ID != '')">—</xsl:if></div></td>
                  <td><div class="k">Senaryo · Tip</div><div class="v"><xsl:value-of select="cbc:ProfileID"/> · <xsl:value-of select="cbc:ReceiptAdviceTypeCode"/></div></td>
                  <td><div class="k">Kontrol Eden</div><div class="v" style="font-family:'Segoe UI',Arial,sans-serif;font-size:10px"><xsl:value-of select="cac:DeliveryCustomerParty/cac:DeliveryContact/cbc:Name"/></div></td>
                </tr>
              </table>

              <table class="parties">
                <tr>
                  <td style="padding-right:5px">
                    <div class="pbox">
                      <h4>Tedarikçi (Malı Gönderen)</h4>
                      <div class="nm"><xsl:call-template name="ad"><xsl:with-param name="p" select="$gonderen"/></xsl:call-template></div>
                      <xsl:call-template name="adres"><xsl:with-param name="a" select="$gonderen/cac:PostalAddress"/></xsl:call-template><br/>
                      <span class="muted">VD:</span><xsl:text> </xsl:text><xsl:value-of select="$gonderen/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/> · <span class="muted"><xsl:value-of select="$gonderen/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']/@schemeID"/>:</span><xsl:text> </xsl:text><b><xsl:value-of select="$gonderen/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']"/></b>
                    </div>
                  </td>
                  <td style="padding-left:5px">
                    <div class="pbox r">
                      <h4>Belge Kimliği</h4>
                      <span class="muted">Yanıt ETTN:</span><xsl:text> </xsl:text><span style="font-size:9px;font-family:Consolas,monospace"><xsl:value-of select="cbc:UUID"/></span><br/>
                      <span class="muted">İrsaliye ETTN:</span><xsl:text> </xsl:text><span style="font-size:9px;font-family:Consolas,monospace"><xsl:value-of select="cac:DespatchDocumentReference/cbc:ID"/></span><br/>
                      <span class="muted">Özelleştirme:</span><xsl:text> </xsl:text><xsl:value-of select="cbc:CustomizationID"/>
                    </div>
                  </td>
                </tr>
              </table>

              <table class="sum">
                <tr>
                  <td class="u-top"><div class="n"><xsl:value-of select="$nTop"/></div><div class="l">Kontrol Edilen</div><div class="d">kalem malzeme</div></td>
                  <td class="u-ok"><div class="n"><xsl:value-of select="$nTam"/></div><div class="l">Uygun</div><div class="d">miktar ve kalite tam</div></td>
                  <td class="u-sart"><div class="n"><xsl:value-of select="$nSart"/></div><div class="l">Şartlı Kabul</div><div class="d">eksik / fazla teslim</div></td>
                  <td class="u-ret"><div class="n"><xsl:value-of select="$nRed"/></div><div class="l">Ret</div><div class="d">kısmen veya tamamen</div></td>
                </tr>
              </table>

              <h3 class="sec"><i></i>Malzeme Giriş Tablosu</h3>
              <table class="lines">
                <thead>
                  <tr>
                    <th class="c" style="width:26px">#</th>
                    <th class="l">Malzeme · Lot</th>
                    <th class="l" style="width:34px">Birim</th>
                    <th style="width:58px">İrsaliye</th>
                    <th style="width:58px">Gelen</th>
                    <th style="width:52px">Fark</th>
                    <th style="width:46px">Ret</th>
                    <th style="width:58px">Kabul</th>
                    <th class="c" style="width:82px">Sonuç</th>
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
                    <xsl:variable name="gelen" select="$rec + $red * number($ayri)"/>
                    <xsl:variable name="sevk" select="$gelen + $eks - $faz"/>
                    <xsl:variable name="fark" select="$faz - $eks"/>
                    <tr>
                      <td class="c ix"><xsl:value-of select="format-number(cbc:ID, '00')"/></td>
                      <td class="l">
                        <span class="pn"><xsl:value-of select="cac:Item/cbc:Name"/></span>
                        <xsl:for-each select="cac:Item/cac:ItemInstance/cac:LotIdentification/cbc:LotNumberID"><span class="lot">LOT <xsl:value-of select="."/></span></xsl:for-each>
                        <div class="pd">
                          <xsl:value-of select="cac:Item/cbc:Description"/>
                          <xsl:if test="cac:Item/cac:BuyersItemIdentification/cbc:ID"> · Stok: <xsl:value-of select="cac:Item/cac:BuyersItemIdentification/cbc:ID"/></xsl:if>
                        </div>
                      </td>
                      <td class="l"><xsl:call-template name="birim"><xsl:with-param name="u" select="cbc:ReceivedQuantity/@unitCode"/></xsl:call-template></td>
                      <td><xsl:call-template name="q"><xsl:with-param name="v" select="$sevk"/></xsl:call-template></td>
                      <td><b><xsl:call-template name="q"><xsl:with-param name="v" select="$gelen"/></xsl:call-template></b></td>
                      <td>
                        <xsl:choose>
                          <xsl:when test="$fark &gt; 0"><span class="plus">+<xsl:value-of select="format-number($fark, '#.##0,###', 'edesign-tr')"/></span></xsl:when>
                          <xsl:when test="$fark &lt; 0"><span class="minus">−<xsl:value-of select="format-number(-$fark, '#.##0,###', 'edesign-tr')"/></span></xsl:when>
                          <xsl:otherwise><span class="z">0</span></xsl:otherwise>
                        </xsl:choose>
                      </td>
                      <td><xsl:call-template name="q"><xsl:with-param name="v" select="$red"/><xsl:with-param name="c" select="'q-red'"/></xsl:call-template></td>
                      <td><xsl:call-template name="q"><xsl:with-param name="v" select="$kab"/><xsl:with-param name="c" select="'q-kab'"/></xsl:call-template></td>
                      <td class="c">
                        <xsl:choose>
                          <xsl:when test="$red &gt; 0 and $kab = 0"><span class="res res-ret">RET</span></xsl:when>
                          <xsl:when test="$red &gt; 0"><span class="res res-ret">KISMİ RET</span></xsl:when>
                          <xsl:when test="$eks &gt; 0 or $faz &gt; 0"><span class="res res-sart">ŞARTLI</span></xsl:when>
                          <xsl:otherwise><span class="res res-ok">UYGUN</span></xsl:otherwise>
                        </xsl:choose>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>

              <xsl:variable name="sorunlu" select="$L[cbc:RejectedQuantity &gt; 0 or cbc:ShortQuantity &gt; 0 or cbc:OversupplyQuantity &gt; 0 or cbc:TimingComplaint]"/>
              <xsl:if test="$sorunlu">
                <h3 class="sec"><i></i>Uygunsuzluk Kayıtları</h3>
                <table class="ncr">
                  <xsl:for-each select="$sorunlu">
                    <xsl:variable name="b"><xsl:call-template name="birim"><xsl:with-param name="u" select="cbc:ReceivedQuantity/@unitCode"/></xsl:call-template></xsl:variable>
                    <tr>
                      <td class="id">UYG-<xsl:value-of select="format-number(position(), '00')"/><small>Kalem <xsl:value-of select="cbc:ID"/></small></td>
                      <td>
                        <div class="h"><xsl:value-of select="cac:Item/cbc:Name"/></div>
                        <div style="margin-top:3px">
                          <xsl:if test="cbc:RejectedQuantity &gt; 0"><span class="tp tp-red">RET <xsl:value-of select="format-number(cbc:RejectedQuantity, '#.##0,###', 'edesign-tr')"/><xsl:text> </xsl:text><xsl:value-of select="$b"/></span></xsl:if>
                          <xsl:if test="cbc:ShortQuantity &gt; 0"><span class="tp tp-eks">EKSİK <xsl:value-of select="format-number(cbc:ShortQuantity, '#.##0,###', 'edesign-tr')"/><xsl:text> </xsl:text><xsl:value-of select="$b"/></span></xsl:if>
                          <xsl:if test="cbc:OversupplyQuantity &gt; 0"><span class="tp tp-faz">FAZLA <xsl:value-of select="format-number(cbc:OversupplyQuantity, '#.##0,###', 'edesign-tr')"/><xsl:text> </xsl:text><xsl:value-of select="$b"/></span></xsl:if>
                          <xsl:if test="cbc:TimingComplaint"><span class="tp tp-time">GECİKME</span></xsl:if>
                        </div>
                        <xsl:for-each select="cbc:RejectReason | cbc:TimingComplaint | cbc:Note"><div class="tx"><xsl:value-of select="."/></div></xsl:for-each>
                      </td>
                      <td class="act">
                        <xsl:choose>
                          <xsl:when test="cbc:RejectedQuantity &gt; 0">Karantinaya alındı; tedarikçiye iade edilecek.</xsl:when>
                          <xsl:when test="cbc:ShortQuantity &gt; 0">Eksik miktar sonraki sevkiyatta tamamlanmalı.</xsl:when>
                          <xsl:when test="cbc:OversupplyQuantity &gt; 0">Fazla miktar stoğa alındı; faturada dikkate alınacak.</xsl:when>
                          <xsl:otherwise>Tedarikçi performans kaydına işlendi.</xsl:otherwise>
                        </xsl:choose>
                      </td>
                    </tr>
                  </xsl:for-each>
                </table>
              </xsl:if>

              <xsl:if test="cbc:Note">
                <div class="notes">
                  <xsl:for-each select="cbc:Note"><div>• <xsl:value-of select="."/></div></xsl:for-each>
                </div>
              </xsl:if>

              <table class="sign">
                <tr>
                  <td>
                    <h5>Giriş Kalite Kontrol</h5>
                    <div><b><xsl:value-of select="cac:DeliveryCustomerParty/cac:DeliveryContact/cbc:Name"/></b></div>
                    <div class="ln" style="margin-top:20px">İmza</div>
                  </td>
                  <td>
                    <h5>Ambar Sorumlusu</h5>
                    <div class="ln">Ad Soyad</div>
                    <div class="ln">İmza</div>
                  </td>
                  <td>
                    <h5>Satın Alma Onayı</h5>
                    <div class="ln">Ad Soyad</div>
                    <div class="ln">İmza / Tarih</div>
                  </td>
                </tr>
              </table>
              <div class="foot">Bu belge <b><xsl:value-of select="$irsNo"/></b> numaralı e-İrsaliyeye elektronik yanıttır · ETTN <xsl:value-of select="cbc:UUID"/></div>
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
      <xsl:when test="$u = 'C62' or $u = 'NIU'">adet</xsl:when>
      <xsl:when test="$u = 'KGM'">kg</xsl:when>
      <xsl:when test="$u = 'TNE'">ton</xsl:when>
      <xsl:when test="$u = 'MTR'">m</xsl:when>
      <xsl:when test="$u = 'MTK'">m²</xsl:when>
      <xsl:when test="$u = 'MTQ'">m³</xsl:when>
      <xsl:when test="$u = 'LTR'">L</xsl:when>
      <xsl:when test="$u = 'BX'">koli</xsl:when>
      <xsl:when test="$u = 'PF'">palet</xsl:when>
      <xsl:when test="$u = 'SET'">set</xsl:when>
      <xsl:otherwise><xsl:value-of select="$u"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
