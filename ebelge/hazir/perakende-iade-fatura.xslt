<?xml version="1.0" encoding="UTF-8"?>
<!--
  Hazır şablon: Perakende zincirinden tedarikçiye İADE e-Faturası (TEMELFATURA · IADE).
  Asıl faturalar BillingReference/InvoiceDocumentReference'tan "iade bileti" kartlarına, iade irsaliyesi
  DespatchDocumentReference'tan alınır. Satır notları: "İade nedeni: ..." ve "Asıl fatura: ...".
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="n1 cac cbc">
  <xsl:output method="html" encoding="UTF-8" indent="no"/>
  <xsl:decimal-format name="edesign-tr" decimal-separator="," grouping-separator="." NaN=""/>

  <xsl:template match="/">
    <html lang="tr">
      <head>
        <meta charset="UTF-8"/>
        <title>İade Faturası — <xsl:value-of select="/n1:Invoice/cbc:ID"/></title>
        <style><![CDATA[
          * { box-sizing: border-box; }
          table { border-collapse: collapse; font-size: inherit; line-height: inherit; color: inherit; }
          body { margin: 0; background: #f4e9eb; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; color: #231a1e; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { width: 210mm; max-width: 100%; margin: 16px auto; background: #fff; position: relative; overflow: hidden; box-shadow: 0 6px 26px rgba(120,20,45,.14); }
          .rail { position: absolute; left: 0; top: 0; bottom: 0; width: 9px; background: repeating-linear-gradient(180deg, #be123c 0 26px, #fb7185 26px 34px); }
          .wm { position: absolute; left: 50%; top: 46%; transform: translate(-50%, -50%) rotate(-24deg); font-size: 190px; font-weight: 900; letter-spacing: 18px; color: rgba(190,18,60,.045); pointer-events: none; white-space: nowrap; }
          .inner { position: relative; padding: 9mm 10mm 8mm 14mm; }
          .head { width: 100%; }
          .head td { vertical-align: top; }
          .brand { font-size: 17px; font-weight: 800; color: #231a1e; letter-spacing: .2px; }
          .brand-sub { color: #9f1239; font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 700; margin-top: 2px; }
          .addr { color: #6b5a60; line-height: 1.5; margin-top: 5px; font-size: 9.5px; }
          .title-box { text-align: right; padding-right: 14px; }
          .kicker { display: inline-block; background: #be123c; color: #fff; font-weight: 800; font-size: 9px; letter-spacing: 3px; padding: 3px 10px; border-radius: 2px; }
          .title { font-size: 30px; font-weight: 900; letter-spacing: 1px; color: #be123c; line-height: 1.05; margin-top: 6px; }
          .title span { color: #231a1e; }
          .docno { margin-top: 5px; font-size: 12px; font-weight: 700; font-family: Consolas, 'Courier New', monospace; color: #231a1e; }
          .stamp { display: inline-block; margin-top: 8px; border: 2.5px solid #be123c; color: #be123c; padding: 3px 12px; font-weight: 900; letter-spacing: 4px; transform: rotate(-6deg); border-radius: 4px; font-size: 11px; }
          .qr { width: 112px; padding: 6px; border: 1.5px solid #fecdd3; border-radius: 8px; background: #fff; }
          .meta { width: 100%; margin-top: 12px; border-top: 2px solid #231a1e; border-bottom: 1px solid #e7d5da; }
          .meta td { padding: 7px 8px; border-right: 1px solid #f1e3e7; vertical-align: top; }
          .meta td:last-child { border-right: 0; }
          .meta .k { font-size: 8px; letter-spacing: 1.6px; text-transform: uppercase; color: #9f1239; font-weight: 700; }
          .meta .v { font-weight: 700; margin-top: 2px; font-size: 10.5px; }
          .meta .v.mono { font-family: Consolas, monospace; font-size: 9px; font-weight: 600; }
          .refs { margin-top: 12px; }
          .refs-title { font-size: 8.5px; letter-spacing: 2px; text-transform: uppercase; color: #6b5a60; font-weight: 700; margin-bottom: 5px; }
          .ticket { display: inline-block; vertical-align: top; position: relative; margin: 0 8px 6px 0; border: 1.5px dashed #be123c; border-radius: 6px; padding: 7px 14px 7px 40px; background: #fff5f7; min-width: 172px; }
          .ticket:before, .ticket:after { content: ''; position: absolute; top: 50%; width: 12px; height: 12px; margin-top: -6px; border-radius: 50%; background: #fff; border: 1.5px dashed #be123c; }
          .ticket:before { left: -7px; } .ticket:after { right: -7px; }
          .ticket .ic { position: absolute; left: 10px; top: 50%; margin-top: -11px; width: 22px; height: 22px; border-radius: 50%; background: #be123c; color: #fff; text-align: center; line-height: 22px; font-weight: 900; font-size: 13px; }
          .ticket .ic.alt { background: #231a1e; }
          .ticket .l { font-size: 8px; letter-spacing: 1.4px; text-transform: uppercase; color: #9f1239; font-weight: 700; }
          .ticket .n { font-family: Consolas, monospace; font-weight: 700; font-size: 11px; margin-top: 1px; }
          .ticket .d { color: #6b5a60; font-size: 9px; }
          .parties { width: 100%; margin-top: 8px; }
          .parties > tbody > tr > td { width: 50%; vertical-align: top; }
          .pcard { border-radius: 8px; padding: 10px 12px; height: 100%; }
          .pcard.from { background: #231a1e; color: #f8eef0; margin-right: 6px; }
          .pcard.to { border: 1.5px solid #e7d5da; margin-left: 6px; }
          .pcard h4 { margin: 0 0 4px; font-size: 8.5px; letter-spacing: 2px; text-transform: uppercase; font-weight: 800; }
          .pcard.from h4 { color: #fda4af; } .pcard.to h4 { color: #be123c; }
          .pcard .nm { font-size: 12.5px; font-weight: 800; margin-bottom: 3px; }
          .pcard .ln { line-height: 1.55; font-size: 9.5px; }
          .pcard.from .ln { color: #e6d3d8; } .pcard.to .ln { color: #4a3c41; }
          .lines { width: 100%; margin-top: 14px; }
          .lines th { text-align: left; font-size: 8.5px; letter-spacing: 1px; text-transform: uppercase; color: #6b5a60; font-weight: 700; padding: 6px 6px; border-bottom: 2px solid #231a1e; }
          .lines td { padding: 7px 6px; border-bottom: 1px solid #f1e3e7; vertical-align: top; }
          .lines tr.kalem td:first-child { border-left: 3px solid #be123c; }
          .lines .r { text-align: right; white-space: nowrap; }
          .lines .c { text-align: center; }
          .pn { font-weight: 700; font-size: 10.5px; }
          .codes { color: #8a7a80; font-size: 8.5px; font-family: Consolas, monospace; margin-top: 2px; }
          .chip { display: inline-block; background: #ffe4e9; color: #9f1239; border-radius: 10px; padding: 2px 8px; font-weight: 700; font-size: 9px; }
          .src { color: #8a7a80; font-size: 8.5px; margin-top: 3px; }
          .neg { color: #be123c; font-weight: 800; }
          .bottom { width: 100%; margin-top: 14px; }
          .bottom > tbody > tr > td { vertical-align: top; }
          .sumbox { background: #fff5f7; border-radius: 8px; padding: 10px 12px; }
          .sumbox table { width: 100%; }
          .sumbox td { padding: 2px 0; }
          .big { font-size: 20px; font-weight: 900; color: #be123c; }
          .words { margin-top: 10px; border-left: 3px solid #be123c; padding: 5px 10px; font-style: italic; font-weight: 600; color: #4a3c41; background: #fff; }
          .notes { margin: 10px 0 0; padding-left: 15px; color: #4a3c41; line-height: 1.6; }
          .tot { width: 100%; }
          .tot td { padding: 5px 8px; border-bottom: 1px solid #f1e3e7; }
          .tot td.r { text-align: right; font-weight: 700; white-space: nowrap; }
          .grand { margin-top: 8px; background: #be123c; color: #fff; border-radius: 8px; padding: 11px 14px; }
          .grand table { width: 100%; }
          .grand .l { font-size: 9px; letter-spacing: 2.4px; text-transform: uppercase; font-weight: 800; color: #ffe4e9; }
          .grand .a { text-align: right; font-size: 21px; font-weight: 900; }
          .sign { width: 100%; margin-top: 18px; }
          .sign td { width: 50%; padding: 0 16px; text-align: center; color: #6b5a60; font-size: 9px; }
          .sign .line { border-top: 1px solid #b9a7ad; margin-top: 30px; padding-top: 4px; font-weight: 700; color: #231a1e; font-size: 10px; }
          .foot { margin-top: 12px; text-align: center; font-size: 8.5px; color: #9a8a90; }
          @page { size: A4; margin: 6mm; }
          @media print { body { background: #fff; } .page { margin: 0; box-shadow: none; width: auto; } }
        ]]></style>
      </head>
      <body>
        <xsl:for-each select="/n1:Invoice">
          <xsl:variable name="sup" select="cac:AccountingSupplierParty/cac:Party"/>
          <xsl:variable name="cus" select="cac:AccountingCustomerParty/cac:Party"/>
          <xsl:variable name="pb"><xsl:choose><xsl:when test="cbc:DocumentCurrencyCode = 'TRY' or not(cbc:DocumentCurrencyCode)">TL</xsl:when><xsl:otherwise><xsl:value-of select="cbc:DocumentCurrencyCode"/></xsl:otherwise></xsl:choose></xsl:variable>
          <div class="page">
            <div class="rail"><xsl:text> </xsl:text></div>
            <div class="wm">İADE</div>
            <div class="inner">
              <table class="head">
                <tr>
                  <td style="width:66px"><img data-xslt-obj="obj-logo" alt="Logo" width="56" height="56" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' rx='18' fill='%23be123c'/%3E%3Cpath d='M20 66 L48 24 L76 66 Z' fill='none' stroke='%23fff' stroke-width='5' stroke-linejoin='round'/%3E%3Ctext x='48' y='62' text-anchor='middle' font-family='Arial,sans-serif' font-size='22' font-weight='700' fill='%23fff'%3EK%3C/text%3E%3C/svg%3E"/></td>
                  <td>
                    <div class="brand"><xsl:value-of select="$sup/cac:PartyName/cbc:Name"/></div>
                    <div class="brand-sub">Tedarikçi İade Masası</div>
                    <div class="addr">
                      <xsl:value-of select="$sup/cac:PostalAddress/cbc:StreetName"/><xsl:if test="$sup/cac:PostalAddress/cbc:BuildingName"><xsl:text>, </xsl:text><xsl:value-of select="$sup/cac:PostalAddress/cbc:BuildingName"/></xsl:if><xsl:text> No: </xsl:text><xsl:value-of select="$sup/cac:PostalAddress/cbc:BuildingNumber"/><br/>
                      <xsl:value-of select="$sup/cac:PostalAddress/cbc:PostalZone"/><xsl:text> </xsl:text><xsl:value-of select="$sup/cac:PostalAddress/cbc:CitySubdivisionName"/> / <xsl:value-of select="$sup/cac:PostalAddress/cbc:CityName"/><br/>
                      VD: <xsl:value-of select="$sup/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/> · VKN: <xsl:value-of select="$sup/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']"/>
                      <xsl:if test="$sup/cac:PartyIdentification/cbc:ID[@schemeID='MERSISNO']"> · MERSİS: <xsl:value-of select="$sup/cac:PartyIdentification/cbc:ID[@schemeID='MERSISNO']"/></xsl:if><br/>
                      Tel: <xsl:value-of select="$sup/cac:Contact/cbc:Telephone"/> · <xsl:value-of select="$sup/cac:Contact/cbc:ElectronicMail"/>
                    </div>
                  </td>
                  <td class="title-box">
                    <span class="kicker">e-FATURA</span>
                    <div class="title">İADE <span>FATURASI</span></div>
                    <div class="docno">No <xsl:value-of select="cbc:ID"/></div>
                    <div class="stamp">↩ MAL İADESİ</div>
                  </td>
                  <td style="width:112px">
                    <div class="qr"><div data-xslt-obj="obj-karekod" data-obj-kind="karekod" style="width:98px;height:98px;margin-left:auto"><div data-karekod-box=""><xsl:text> </xsl:text></div><span data-karekod-value="" style="display:none"><xsl:choose><xsl:when test="/*[local-name()='DespatchAdvice']">{"vkntckn":"<xsl:value-of select="/*/*[local-name()='DespatchSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='DeliveryCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='DespatchAdviceTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","sevktarihi":"<xsl:value-of select="/*/*[local-name()='Shipment']/*[local-name()='Delivery']/*[local-name()='Despatch']/*[local-name()='ActualDespatchDate']"/>","sevkzamani":"<xsl:value-of select="/*/*[local-name()='Shipment']/*[local-name()='Delivery']/*[local-name()='Despatch']/*[local-name()='ActualDespatchTime']"/>","tasiyicivkn":"<xsl:value-of select="/*/*[local-name()='Shipment']/*[local-name()='Delivery']/*[local-name()='CarrierParty']/*[local-name()='PartyIdentification']/*[local-name()='ID']"/>","plaka":"<xsl:value-of select="/*/*[local-name()='Shipment']/*[local-name()='ShipmentStage']/*[local-name()='TransportMeans']/*[local-name()='RoadTransport']/*[local-name()='LicensePlateID']"/>"}</xsl:when><xsl:when test="/*[local-name()='CreditNote']"><xsl:choose><xsl:when test="/*/*[local-name()='ProfileID']='EDOVIZBELGE'">{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='CreditNoteTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","miktari(<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']/@currencyID"/>)":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>","uygulanankur":"<xsl:value-of select="/*/*[local-name()='PaymentExchangeRate']/*[local-name()='CalculationRate']"/>","dovizkarsiligi":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>","tlkarsiligi":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='TaxInclusiveAmount']"/>","odenecek(<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']/@currencyID"/>)":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']"/>"}</xsl:when><xsl:when test="/*/*[local-name()='ProfileID']='EKIYMETLIMADENBELGE'">{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='CreditNoteTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","miktari(<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']/@currencyID"/>)":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>","birimfiyat":"<xsl:value-of select="/*/*[local-name()='PaymentExchangeRate']/*[local-name()='CalculationRate']"/>","odenecek(<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']/@currencyID"/>)":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']"/>"}</xsl:when><xsl:when test="/*/*[local-name()='ProfileID']='GIDERPUSULASI'">{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='CreditNoteTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","parabirimi":"<xsl:value-of select="/*/*[local-name()='DocumentCurrencyCode']"/>","malhizmettoplam":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>","odenecek":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']"/>"}</xsl:when><xsl:when test="starts-with(/*/*[local-name()='ProfileID'],'DEKONT') or starts-with(/*/*[local-name()='ProfileID'],'VTA') or starts-with(/*/*[local-name()='ProfileID'],'GVTA')">{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='CreditNoteTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","parabirimi":"<xsl:value-of select="/*/*[local-name()='DocumentCurrencyCode']"/>","islemtutari":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>","vergilerdahiltoplamtutar":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='TaxInclusiveAmount']"/>","odenecektutar":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']"/>"}</xsl:when><xsl:when test="/*/*[local-name()='CreditNoteTypeCode']='SIGORTAKOMISYONGIDERBELGESI'">{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='CreditNoteTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","parabirimi":"<xsl:value-of select="/*/*[local-name()='DocumentCurrencyCode']"/>","istihsalkomisyon":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='AllowanceTotalAmount']"/>","iptalkomisyon":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='ChargeTotalAmount']"/>"}</xsl:when><xsl:otherwise>{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='CreditNoteTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","parabirimi":"<xsl:value-of select="/*/*[local-name()='DocumentCurrencyCode']"/>","malhizmettoplam":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>","gvstopaj":"<xsl:value-of select="sum(/*/*[local-name()='TaxTotal']/*[local-name()='TaxSubtotal'][*[local-name()='TaxCategory']/*[local-name()='TaxScheme']/*[local-name()='TaxTypeCode']='0003']/*[local-name()='TaxAmount'])"/>","merafonu":"<xsl:value-of select="sum(/*/*[local-name()='TaxTotal']/*[local-name()='TaxSubtotal'][*[local-name()='TaxCategory']/*[local-name()='TaxScheme']/*[local-name()='TaxTypeCode']='9040']/*[local-name()='TaxAmount'])"/>","borsatescilucreti":"<xsl:value-of select="sum(/*/*[local-name()='TaxTotal']/*[local-name()='TaxSubtotal'][*[local-name()='TaxCategory']/*[local-name()='TaxScheme']/*[local-name()='TaxTypeCode']='8001']/*[local-name()='TaxAmount'])"/>","sgkprimkesintisi":"<xsl:value-of select="sum(/*/*[local-name()='TaxTotal']/*[local-name()='TaxSubtotal'][*[local-name()='TaxCategory']/*[local-name()='TaxScheme']/*[local-name()='TaxTypeCode']='SGK_PRIM']/*[local-name()='TaxAmount'])"/>","odenecek":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']"/>"}</xsl:otherwise></xsl:choose></xsl:when><xsl:otherwise>{"vkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingSupplierParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","avkntckn":"<xsl:value-of select="/*/*[local-name()='AccountingCustomerParty']/*[local-name()='Party']/*[local-name()='PartyIdentification']/*[local-name()='ID'][@schemeID='VKN' or @schemeID='TCKN']"/>","senaryo":"<xsl:value-of select="/*/*[local-name()='ProfileID']"/>","tip":"<xsl:value-of select="/*/*[local-name()='InvoiceTypeCode']"/>","tarih":"<xsl:value-of select="/*/*[local-name()='IssueDate']"/>","no":"<xsl:value-of select="/*/*[local-name()='ID']"/>","ettn":"<xsl:value-of select="/*/*[local-name()='UUID']"/>","parabirimi":"<xsl:value-of select="/*/*[local-name()='DocumentCurrencyCode']"/>","malhizmettoplam":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='LineExtensionAmount']"/>"<xsl:for-each select="/*/*[local-name()='TaxTotal']/*[local-name()='TaxSubtotal'][*[local-name()='TaxCategory']/*[local-name()='TaxScheme']/*[local-name()='TaxTypeCode']='0015']">,"kdvmatrah(<xsl:value-of select="*[local-name()='Percent']"/>)":"<xsl:value-of select="*[local-name()='TaxableAmount']"/>","hesaplanankdv(<xsl:value-of select="*[local-name()='Percent']"/>)":"<xsl:value-of select="*[local-name()='TaxAmount']"/>"</xsl:for-each>,"vergidahil":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='TaxInclusiveAmount']"/>","odenecek":"<xsl:value-of select="/*/*[local-name()='LegalMonetaryTotal']/*[local-name()='PayableAmount']"/>"}</xsl:otherwise></xsl:choose></span><script type="text/javascript"><![CDATA[/* QRCode.js — Copyright (c) 2012 davidshimjs, MIT License. GİB resmi e-Arşiv XSLT'sinde gömülü sürüm. */
var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();
(function(){var s=document.currentScript,b=s&&s.parentNode;if(!b||typeof QRCode==='undefined')return;var t=b.querySelector('[data-karekod-box]'),d=b.querySelector('[data-karekod-value]');if(!t||!d||t.querySelector('canvas,img'))return;var w=b.clientWidth||120;new QRCode(t,{text:d.textContent.replace(/\s+/g,' ').trim(),width:w,height:w,correctLevel:QRCode.CorrectLevel.M});})();]]></script></div></div>
                  </td>
                </tr>
              </table>

              <table class="meta">
                <tr>
                  <td><div class="k">Düzenleme</div><div class="v"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cbc:IssueDate"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring(cbc:IssueTime, 1, 5)"/></div></td>
                  <td><div class="k">Senaryo</div><div class="v"><xsl:value-of select="cbc:ProfileID"/></div></td>
                  <td><div class="k">Fatura Tipi</div><div class="v" style="color:#be123c"><xsl:value-of select="cbc:InvoiceTypeCode"/></div></td>
                  <td><div class="k">Para Birimi</div><div class="v"><xsl:value-of select="cbc:DocumentCurrencyCode"/></div></td>
                  <td><div class="k">Kalem</div><div class="v"><xsl:value-of select="count(cac:InvoiceLine)"/></div></td>
                  <td style="width:34%"><div class="k">ETTN</div><div class="v mono"><xsl:value-of select="cbc:UUID"/></div></td>
                </tr>
              </table>

              <div class="refs">
                <div class="refs-title">İade edilen malların asıl faturaları ve sevk belgesi</div>
                <xsl:for-each select="cac:BillingReference/cac:InvoiceDocumentReference">
                  <div class="ticket">
                    <div class="ic">↩</div>
                    <div class="l">Asıl Fatura</div>
                    <div class="n"><xsl:value-of select="normalize-space(cbc:ID)"/></div>
                    <div class="d"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cbc:IssueDate"/></xsl:call-template><xsl:if test="cbc:DocumentTypeCode"> · Belge türü: <xsl:value-of select="cbc:DocumentTypeCode"/></xsl:if></div>
                  </div>
                </xsl:for-each>
                <xsl:for-each select="cac:DespatchDocumentReference">
                  <div class="ticket">
                    <div class="ic alt">⇢</div>
                    <div class="l">İade İrsaliyesi</div>
                    <div class="n"><xsl:value-of select="cbc:ID"/></div>
                    <div class="d"><xsl:call-template name="tarih"><xsl:with-param name="d" select="cbc:IssueDate"/></xsl:call-template></div>
                  </div>
                </xsl:for-each>
              </div>

              <table class="parties">
                <tr>
                  <td>
                    <div class="pcard from">
                      <h4>İade Eden · Faturayı Düzenleyen</h4>
                      <div class="nm"><xsl:value-of select="$sup/cac:PartyName/cbc:Name"/></div>
                      <div class="ln">VKN <xsl:value-of select="$sup/cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']"/> · <xsl:value-of select="$sup/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/> VD</div>
                      <xsl:for-each select="cbc:Note[starts-with(., 'Mal kabul')]"><div class="ln"><xsl:value-of select="."/></div></xsl:for-each>
                    </div>
                  </td>
                  <td>
                    <div class="pcard to">
                      <h4>İade Alan · Tedarikçi</h4>
                      <xsl:for-each select="$cus">
                        <div class="nm"><xsl:choose><xsl:when test="cac:PartyName/cbc:Name"><xsl:value-of select="cac:PartyName/cbc:Name"/></xsl:when><xsl:otherwise><xsl:value-of select="cac:Person/cbc:FirstName"/><xsl:text> </xsl:text><xsl:value-of select="cac:Person/cbc:FamilyName"/></xsl:otherwise></xsl:choose></div>
                        <div class="ln"><xsl:value-of select="cac:PostalAddress/cbc:StreetName"/><xsl:text> No: </xsl:text><xsl:value-of select="cac:PostalAddress/cbc:BuildingNumber"/>, <xsl:value-of select="cac:PostalAddress/cbc:PostalZone"/><xsl:text> </xsl:text><xsl:value-of select="cac:PostalAddress/cbc:CitySubdivisionName"/> / <xsl:value-of select="cac:PostalAddress/cbc:CityName"/></div>
                        <div class="ln"><xsl:value-of select="cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']/@schemeID"/><xsl:text> </xsl:text><b><xsl:value-of select="cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']"/></b> · VD: <xsl:value-of select="cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/></div>
                        <div class="ln">Tel: <xsl:value-of select="cac:Contact/cbc:Telephone"/> · <xsl:value-of select="cac:Contact/cbc:ElectronicMail"/></div>
                      </xsl:for-each>
                    </div>
                  </td>
                </tr>
              </table>

              <table class="lines">
                <thead>
                  <tr>
                    <th class="c" style="width:26px">#</th>
                    <th>İade Edilen Ürün</th>
                    <th style="width:170px">İade Nedeni</th>
                    <th class="r" style="width:54px">Miktar</th>
                    <th class="r" style="width:70px">Birim Fiyat</th>
                    <th class="c" style="width:38px">KDV</th>
                    <th class="r" style="width:84px">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="cac:InvoiceLine">
                    <tr class="kalem">
                      <td class="c"><b><xsl:value-of select="cbc:ID"/></b></td>
                      <td>
                        <div class="pn"><xsl:value-of select="cac:Item/cbc:Name"/></div>
                        <div class="codes">
                          <xsl:if test="cac:Item/cac:SellersItemIdentification/cbc:ID">Tedarikçi: <xsl:value-of select="cac:Item/cac:SellersItemIdentification/cbc:ID"/></xsl:if>
                          <xsl:if test="cac:Item/cac:BuyersItemIdentification/cbc:ID"> · Mağaza: <xsl:value-of select="cac:Item/cac:BuyersItemIdentification/cbc:ID"/></xsl:if>
                        </div>
                      </td>
                      <td>
                        <xsl:for-each select="cbc:Note[starts-with(., 'İade nedeni')]"><span class="chip"><xsl:value-of select="normalize-space(substring-after(., ':'))"/></span></xsl:for-each>
                        <xsl:for-each select="cbc:Note[starts-with(., 'Asıl fatura')]"><div class="src">↩ <xsl:value-of select="normalize-space(substring-after(., ':'))"/></div></xsl:for-each>
                      </td>
                      <td class="r"><b><xsl:value-of select="format-number(cbc:InvoicedQuantity, '###.##0,###', 'edesign-tr')"/></b><xsl:text> </xsl:text><xsl:call-template name="birim"><xsl:with-param name="u" select="cbc:InvoicedQuantity/@unitCode"/></xsl:call-template></td>
                      <td class="r"><xsl:value-of select="format-number(cac:Price/cbc:PriceAmount, '###.##0,00', 'edesign-tr')"/></td>
                      <td class="c">%<xsl:value-of select="cac:TaxTotal/cac:TaxSubtotal/cbc:Percent"/></td>
                      <td class="r neg"><xsl:value-of select="format-number(cbc:LineExtensionAmount, '###.##0,00', 'edesign-tr')"/></td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>

              <table class="bottom">
                <tr>
                  <td style="padding-right:18px">
                    <div class="sumbox">
                      <table>
                        <tr>
                          <td><div style="font-size:8.5px;letter-spacing:1.6px;color:#9f1239;font-weight:800;text-transform:uppercase">İade Edilen</div><div class="big"><xsl:value-of select="format-number(sum(cac:InvoiceLine/cbc:InvoicedQuantity), '###.##0', 'edesign-tr')"/> <span style="font-size:11px;color:#231a1e">birim</span></div></td>
                          <td><div style="font-size:8.5px;letter-spacing:1.6px;color:#9f1239;font-weight:800;text-transform:uppercase">Ürün Çeşidi</div><div class="big"><xsl:value-of select="count(cac:InvoiceLine)"/></div></td>
                          <td><div style="font-size:8.5px;letter-spacing:1.6px;color:#9f1239;font-weight:800;text-transform:uppercase">Asıl Fatura</div><div class="big"><xsl:value-of select="count(cac:BillingReference)"/></div></td>
                        </tr>
                      </table>
                    </div>
                    <xsl:for-each select="cbc:Note[starts-with(., 'Yalnız') or starts-with(., 'YALNIZ')]"><div class="words"><xsl:value-of select="."/></div></xsl:for-each>
                    <ul class="notes">
                      <xsl:for-each select="cbc:Note[not(starts-with(., 'Yalnız') or starts-with(., 'YALNIZ') or starts-with(., 'Mal kabul'))]"><li><xsl:value-of select="."/></li></xsl:for-each>
                    </ul>
                  </td>
                  <td style="width:258px">
                    <table class="tot">
                      <tr><td>İade Mal Bedeli</td><td class="r"><xsl:value-of select="format-number(cac:LegalMonetaryTotal/cbc:LineExtensionAmount, '###.##0,00', 'edesign-tr')"/><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr>
                      <xsl:if test="cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount &gt; 0"><tr><td>İskonto</td><td class="r">- <xsl:value-of select="format-number(cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount, '###.##0,00', 'edesign-tr')"/><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr></xsl:if>
                      <xsl:for-each select="cac:TaxTotal/cac:TaxSubtotal">
                        <tr><td><xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:Name"/> %<xsl:value-of select="cbc:Percent"/> <span style="color:#9a8a90"> (matrah <xsl:value-of select="format-number(cbc:TaxableAmount, '###.##0,00', 'edesign-tr')"/>)</span></td><td class="r"><xsl:value-of select="format-number(cbc:TaxAmount, '###.##0,00', 'edesign-tr')"/><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr>
                      </xsl:for-each>
                      <tr><td>Vergiler Dahil</td><td class="r"><xsl:value-of select="format-number(cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount, '###.##0,00', 'edesign-tr')"/><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr>
                    </table>
                    <div class="grand">
                      <table><tr><td class="l">İade<br/>Toplamı</td><td class="a"><xsl:value-of select="format-number(cac:LegalMonetaryTotal/cbc:PayableAmount, '###.##0,00', 'edesign-tr')"/><xsl:text> </xsl:text><xsl:value-of select="$pb"/></td></tr></table>
                    </div>
                  </td>
                </tr>
              </table>

              <table class="sign">
                <tr>
                  <td><div class="line">Teslim Eden — <xsl:value-of select="$sup/cac:PartyName/cbc:Name"/></div>Kaşe / İmza</td>
                  <td><div class="line">Teslim Alan — Tedarikçi</div>Ad Soyad / Kaşe / İmza</td>
                </tr>
              </table>
              <div class="foot">Bu iade faturası, yukarıda numarası belirtilen faturalarla alınan malların iadesi için düzenlenmiştir · ETTN <xsl:value-of select="cbc:UUID"/></div>
            </div>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>

  <xsl:template name="tarih">
    <xsl:param name="d"/>
    <xsl:if test="string-length($d) &gt;= 10"><xsl:value-of select="concat(substring($d, 9, 2), '.', substring($d, 6, 2), '.', substring($d, 1, 4))"/></xsl:if>
  </xsl:template>

  <xsl:template name="birim">
    <xsl:param name="u"/>
    <xsl:choose>
      <xsl:when test="$u = 'C62' or $u = 'NIU'">Adet</xsl:when>
      <xsl:when test="$u = 'PA'">Paket</xsl:when>
      <xsl:when test="$u = 'BX'">Koli</xsl:when>
      <xsl:when test="$u = 'KGM'">kg</xsl:when>
      <xsl:when test="$u = 'MTR'">m</xsl:when>
      <xsl:otherwise><xsl:value-of select="$u"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
