import{_ as te,j as e,d as Xe,a as q,u as W}from"./index-pnDTsZR_.js";import{r as x,R as Ne}from"./vendor-i18n-D1UrcLFy.js";import{P as We}from"./PaymentModal-CKuopEmu.js";import{h as $e,s as Oe,a as fe}from"./testWatermark-DWeGV28F.js";import{F as he,C as ae,e as U,D as Ue,b as Ke,f as ye,A as Ve,g as ie,T as Ge,h as He,i as ve,P as Ye,j as Ze,k as Qe,l as qe,E as ke,m as Se,n as Je,o as et,X as J,p as ne,S as tt,q as oe,r as at,B as it,s as rt,t as st,u as Y,v as lt,w as nt,x as ot,G as dt,y as ct,z as pt,H as mt,I as ut,R as xt}from"./vendor-icons-DEbSo_sJ.js";import{t as gt}from"./xsltTransformer-DTDIJG7P.js";import"./vendor-dnd-f4m_iXKM.js";import"./vendor-state-LLmneBlK.js";const de={fatura:{layout:"standard",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["logo","stamp","bank","product_table","totals","notes","ettn"],defaultTemplate:"gib/v2/e-Fatura-Sablon.xslt",recommendedSample:"samples/e-Fatura-TICARI.xml",description:"e-Fatura — sıfırdan tasarlanmış minimal XSLT, 11 sütunlu ürün tablosu, ETTN satırı, sağ-alt toplamlar."},arsiv:{layout:"standard",hasSignature:!0,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["logo","stamp","bank","product_table","totals","notes","signature"],defaultTemplate:"gib/v2/e-Arsiv-Sablon.xslt",recommendedSample:"samples/e-Arsiv-TEMEL.xml",description:"e-Arşiv — sıfırdan tasarlanmış minimal XSLT, GİB uyumlu, e-imzalı."},irsaliye:{layout:"multi-section",hasSignature:!1,hasVehicle:!0,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["vehicle","driver","loading_point","unloading_point","product_table","despatch_info"],defaultTemplate:"community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt",recommendedSample:"samples/e-Irsaliye-TEMEL.xml",description:"e-İrsaliye — araç/sürücü/mal kabul yeri 3-sütunlu layout."},ihracat:{layout:"standard",hasSignature:!1,hasVehicle:!1,hasCurrency:!0,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["logo","stamp","bank","product_table","totals","customs_info","origin_country","gtip_no"],defaultTemplate:"community/IRPTeam-eFatura.xslt",recommendedSample:"samples/e-Ihracat-TEMEL.xml",description:"e-İhracat — gümrük bilgileri, menşe ülke, GTIP no, döviz."},mikro_ihracat:{layout:"compact",hasSignature:!1,hasVehicle:!1,hasCurrency:!0,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["product_table","totals","customs_info","origin_country"],defaultTemplate:"community/IRPTeam-eFatura.xslt",recommendedSample:"samples/e-Ihracat-TEMEL.xml",description:"e-Mikro İhracat — basitleştirilmiş ihracat layout."},smm:{layout:"service",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!0,hasStoppage:!0,hasPassenger:!1,hasService:!0,specialFields:["logo","stamp","bank","service_table","gross_net","vat_exemption","stoppage","identity_no"],defaultTemplate:"community/hzkucuk-eFatura-smm.xslt",recommendedSample:"samples/e-SMM-TEMEL.xml",description:"e-SMM — Serbest Meslek Makbuzu, hizmet bilgileri, BRÜT/Net ayrımı, KDV istisna, stopaj, TCKN mükellef."},mustahsil:{layout:"standard",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!0,hasStoppage:!0,hasPassenger:!1,hasService:!1,specialFields:["buyer_info","product_table","totals","stoppage","vat_exemption"],defaultTemplate:"community/hzkucuk-eFatura-mustahsil.xslt",recommendedSample:"samples/e-Mustahsil-TEMEL.xml",description:"e-Müstahsil — çiftçiden alınan zirai ürün makbuzu, KDV istisna, stopaj, TCKN müstahsil."},bilet:{layout:"multi-section",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!0,hasService:!1,specialFields:["passenger_info","voyage_info","seat_no","price","product_table"],defaultTemplate:"community/hzkucuk-eFatura-bilet.xslt",recommendedSample:"samples/e-Bilet-TEMEL.xml",description:"e-Bilet — yolcu/sefer/koltuk bilgili ulaşım bileti."},makbuz:{layout:"compact",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!0,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["payment_info","totals","vat_exemption","receipt_line"],defaultTemplate:"community/hzkucuk-eFatura-makbuz.xslt",recommendedSample:"samples/e-Makbuz-TEMEL.xml",description:"e-Makbuz — Receipt (UBL-TR özelleştirmesi), basit ödeme makbuzu, KDV istisna destekli."}};function ce(a){return de[a]||de.fatura}const bt=[{id:"signature-basic",label:"İmza Alanı (Basit)",description:"Satıcı + alıcı imza placeholder'ı. Genel fatura için.",category:"signature",appliesTo:["fatura","arsiv","smm","mustahsil","makbuz"],code:`
<div class="signature-area" style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
    <div style="text-align: center; padding: 20px; border-top: 1px solid #475569;">
        <div style="font-size: 10px; color: #64748b; letter-spacing: 1.5px;">SATICI İMZA</div>
        <div style="height: 60px;"></div>
        <div style="font-size: 11px; color: #475569;">[Ad Soyad]</div>
    </div>
    <div style="text-align: center; padding: 20px; border-top: 1px solid #475569;">
        <div style="font-size: 10px; color: #64748b; letter-spacing: 1.5px;">ALICI İMZA</div>
        <div style="height: 60px;"></div>
        <div style="font-size: 11px; color: #475569;">[Ad Soyad]</div>
    </div>
</div>`},{id:"signature-earsiv",label:"e-Arşiv e-İmza (GİB zorunlu)",description:"5070 sayılı Kanun + GİB e-Arşiv Yönetmeliği gereği e-imza bloğu.",category:"signature",appliesTo:["arsiv"],code:`
<div class="signature-earsiv" style="margin-top: 30px; padding: 20px; border: 2px dashed #6366f1; border-radius: 8px; background: rgba(99, 102, 241, 0.04);">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
            <div style="font-size: 11px; color: #6366f1; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 6px;">E-İMZA / E-ARŞİV</div>
            <div style="font-size: 10px; color: #64748b;">Bu belge 5070 sayılı Elektronik İmza Kanunu ve GİB e-Arşiv Yönetmeliği gereği elektronik olarak imzalanmıştır.</div>
        </div>
        <div style="flex: 0 0 200px; text-align: center; padding: 10px; background: white; border-radius: 4px;">
            <div style="font-size: 10px; color: #1e3a8a; font-weight: 700;">e-İMZA DOĞRULAMA</div>
            <div style="font-size: 9px; color: #475569; margin-top: 4px;">(QR / İmza Alanı)</div>
        </div>
    </div>
</div>`},{id:"vehicle-info",label:"Araç/Sürücü/Mal Kabul",description:"e-İrsaliye için 3-sütunlu araç bilgileri, sürücü, mal kabul.",category:"vehicle",appliesTo:["irsaliye"],code:`
<div class="vehicle-section" style="margin-top: 24px; padding: 20px; background: rgba(14, 165, 233, 0.06); border: 1px solid rgba(14, 165, 233, 0.25); border-radius: 8px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
            <div style="font-size: 10px; color: #0ea5e9; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">ARAÇ BİLGİLERİ</div>
            <div style="font-size: 11px; line-height: 1.6;">Plaka / Marka / Model / Tip</div>
        </div>
        <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
            <div style="font-size: 10px; color: #0ea5e9; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">SÜRÜCÜ</div>
            <div style="font-size: 11px; line-height: 1.6;">Ad Soyad / TC / Telefon / Ehliyet</div>
        </div>
        <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
            <div style="font-size: 10px; color: #0ea5e9; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">MAL KABUL</div>
            <div style="font-size: 11px; line-height: 1.6;">Yükleme / Boşaltma / Tarih / Saat</div>
        </div>
    </div>
</div>`},{id:"currency-info",label:"Döviz Kuru",description:"e-İhracat ve e-Mikro İhracat için döviz kuru alanı (alış/satış).",category:"currency",appliesTo:["ihracat","mikro_ihracat"],code:`
<div class="currency-info" style="margin-top: 16px; padding: 16px; background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 8px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <div><div style="font-size: 10px; color: #22c55e; font-weight: 700;">DÖVİZ TÜRÜ</div><div style="font-size: 11px;">[USD / EUR / GBP]</div></div>
        <div><div style="font-size: 10px; color: #22c55e; font-weight: 700;">ALIŞ KURU</div><div style="font-size: 11px;">[Kur]</div></div>
        <div><div style="font-size: 10px; color: #22c55e; font-weight: 700;">SATIŞ KURU</div><div style="font-size: 11px;">[Kur]</div></div>
    </div>
</div>`},{id:"service-info",label:"Hizmet Bilgileri",description:"e-SMM için hizmet türü, dönem, BRÜT/Net.",category:"service",appliesTo:["smm"],code:`
<div class="service-info" style="margin-top: 16px; padding: 16px; background: rgba(20, 184, 166, 0.06); border: 1px solid rgba(20, 184, 166, 0.25); border-radius: 8px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
            <div style="font-size: 10px; color: #14b8a6; font-weight: 700; margin-bottom: 8px;">HİZMET</div>
            <div style="font-size: 11px;">Hizmet Türü / Dönem / TC/VKN / SGK</div>
        </div>
        <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
            <div style="font-size: 10px; color: #14b8a6; font-weight: 700; margin-bottom: 8px;">BRÜT/NET</div>
            <div style="font-size: 11px;">Brüt / KDV İstisna / Stopaj / Net</div>
        </div>
    </div>
</div>`},{id:"stoppage-info",label:"Stopaj",description:"e-SMM ve e-Müstahsil için stopaj bilgisi.",category:"stoppage",appliesTo:["smm","mustahsil"],code:`
<div class="stoppage-info" style="margin-top: 16px; padding: 16px; background: rgba(132, 204, 22, 0.06); border: 1px solid rgba(132, 204, 22, 0.25); border-radius: 8px;">
    <div style="font-size: 10px; color: #84cc16; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">STOPAJ BİLGİSİ</div>
    <table style="width: 100%; font-size: 11px; line-height: 1.6;">
        <tr><td>Brüt Tutar:</td><td>[Brut]</td></tr>
        <tr><td>Stopaj Oranı:</td><td>[%]</td></tr>
        <tr><td>Stopaj Tutarı:</td><td>[Tutar]</td></tr>
        <tr><td>Net Ödeme:</td><td>[Net]</td></tr>
    </table>
</div>`},{id:"passenger-info",label:"Yolcu/Sefer",description:"e-Bilet için yolcu bilgileri, sefer, koltuk no.",category:"passenger",appliesTo:["bilet"],code:`
<div class="passenger-info" style="margin-top: 16px; padding: 16px; background: rgba(249, 115, 22, 0.06); border: 1px solid rgba(249, 115, 22, 0.25); border-radius: 8px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
            <div style="font-size: 10px; color: #f97316; font-weight: 700; margin-bottom: 8px;">YOLCU</div>
            <div style="font-size: 11px;">Ad Soyad / TC / E-posta / Telefon</div>
        </div>
        <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
            <div style="font-size: 10px; color: #f97316; font-weight: 700; margin-bottom: 8px;">SEFER / KOLTUK</div>
            <div style="font-size: 11px;">Firma / Sefer No / Kalkış-Varış / Koltuk No</div>
        </div>
    </div>
</div>`},{id:"customs-info",label:"Gümrük Bilgileri",description:"e-İhracat için gümrük bilgileri, menşe ülke, GTIP no.",category:"general",appliesTo:["ihracat","mikro_ihracat"],code:`
<div class="customs-info" style="margin-top: 16px; padding: 16px; background: rgba(139, 92, 246, 0.06); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 8px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <div><div style="font-size: 10px; color: #8b5cf6; font-weight: 700;">MENŞE ÜLKE</div><div style="font-size: 11px;">[Ülke]</div></div>
        <div><div style="font-size: 10px; color: #8b5cf6; font-weight: 700;">GTİP NO</div><div style="font-size: 11px;">[GTIP]</div></div>
        <div><div style="font-size: 10px; color: #8b5cf6; font-weight: 700;">GÜMRÜK KAPISI</div><div style="font-size: 11px;">[Kapı]</div></div>
    </div>
</div>`}];function pe(a){return bt.filter(t=>t.appliesTo.includes(a))}const ft=`<?xml version="1.0" encoding="UTF-8"?>
<!--
  XSLT Editor — Hello World şablonu
  Bu şablon XSLT öğrenmek için en basit başlangıç noktasıdır.
  Herhangi bir XML girişi "Merhaba Dünya!" çıktısı verir.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes"/>
  <xsl:decimal-format name="tr_TR" decimal-separator="," grouping-separator="."/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Merhaba Dünya — e-Belge</title>
        <style>
          body { font-family: Tahoma, sans-serif; padding: 40px; background: #f8fafc; }
          h1 { color: #6366f1; font-size: 2em; }
          p { color: #475569; line-height: 1.6; }
        </style>
      </head>
      <body>
        <h1>Merhaba Dünya!</h1>
        <p>Bu basit bir XSLT şablonudur. Düzenlemeye başlamak için kodu değiştirin.</p>
        <p><strong>İpucu:</strong> Sol paneldeki snippet galerisinden "xsl:template" veya
        "xsl:value-of" gibi parçaları ekleyebilirsiniz.</p>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`,ht=`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Atlas Minimal Fatura — sadece başlık ve toplam.
  Eklenecek: müşteri/tedarikçi kartı, ürün tablosu, KDV detayı.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes"/>
  <xsl:decimal-format name="tr_TR" decimal-separator="," grouping-separator="."/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>e-Fatura — Atlas Minimal</title>
        <style>
          body { font-family: Tahoma, sans-serif; font-size: 11px; padding: 32px; color: #1e293b; }
          .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 24px; }
          .id { font-size: 1.6em; font-weight: bold; color: #1e3a8a; }
          .meta { color: #64748b; margin-top: 4px; }
          .total-box { background: #1e3a8a; color: white; padding: 16px 24px; border-radius: 8px; display: inline-block; }
          .total-amount { font-size: 2em; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="id">
            Fatura No: <xsl:value-of select="//cbc:ID"/>
          </div>
          <div class="meta">
            Tarih: <xsl:value-of select="//cbc:IssueDate"/> ·
            Para Birimi: <xsl:value-of select="//cbc:DocumentCurrencyCode"/>
          </div>
        </div>

        <div class="total-box">
          <div>Ödenecek Tutar</div>
          <div class="total-amount">
            <xsl:value-of select="format-number(//cbc:PayableAmount, '#.##0,00', 'tr_TR')"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="//cbc:DocumentCurrencyCode"/>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`,yt=`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Atlas Standart Fatura — 2 taraf (gönderen/alıcı) + ürün tablosu + KDV toplamı.
  Genişletilebilir: banka bilgisi, imza, KDV detay tablosu.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes"/>
  <xsl:decimal-format name="tr_TR" decimal-separator="," grouping-separator="."/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>e-Fatura — Atlas Standart</title>
        <style>
          body { font-family: Tahoma, sans-serif; font-size: 11px; padding: 24px; color: #1e293b; }
          h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
          .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
          .party { padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; }
          .party-title { font-weight: bold; color: #475569; margin-bottom: 6px; text-transform: uppercase; font-size: 10px; }
          .party-name { font-size: 1.1em; font-weight: bold; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #cbd5e1; }
          th { background: #1e3a8a; color: white; font-weight: bold; }
          .num { text-align: right; }
          .totals { background: #f1f5f9; padding: 12px 16px; border-radius: 6px; margin-top: 16px; }
          .grand-total { font-size: 1.4em; font-weight: bold; color: #1e3a8a; }
        </style>
      </head>
      <body>
        <h1>e-Fatura <xsl:value-of select="//cbc:ID"/></h1>
        <div style="color: #64748b; margin-bottom: 16px;">
          Tarih: <xsl:value-of select="//cbc:IssueDate"/> ·
          Para Birimi: <xsl:value-of select="//cbc:DocumentCurrencyCode"/>
        </div>

        <!-- Gönderen (Tedarikçi) + Alıcı (Müşteri) kartları -->
        <div class="parties">
          <div class="party">
            <div class="party-title">Gönderen (Tedarikçi)</div>
            <div class="party-name">
              <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
            </div>
            <div>
              <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>
            </div>
            <div>
              <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CityName"/>
            </div>
          </div>
          <div class="party">
            <div class="party-title">Alıcı (Müşteri)</div>
            <div class="party-name">
              <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/>
            </div>
            <div>
              <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>
            </div>
            <div>
              <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:CityName"/>
            </div>
          </div>
        </div>

        <!-- Ürün/Hizmet tablosu -->
        <table>
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Ürün / Hizmet</th>
              <th class="num">Miktar</th>
              <th class="num">Birim Fiyat</th>
              <th class="num">Tutar</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="//cac:InvoiceLine">
              <tr>
                <td><xsl:value-of select="position()"/></td>
                <td><xsl:value-of select="cac:Item/cbc:Name"/></td>
                <td class="num"><xsl:value-of select="cbc:InvoicedQuantity"/></td>
                <td class="num">
                  <xsl:value-of select="format-number(cac:Price/cbc:PriceAmount, '#.##0,00', 'tr_TR')"/>
                </td>
                <td class="num">
                  <xsl:value-of select="format-number(cbc:LineExtensionAmount, '#.##0,00', 'tr_TR')"/>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>

        <!-- Toplamlar -->
        <div class="totals">
          <div>Ara Toplam: <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount, '#.##0,00', 'tr_TR')"/></div>
          <div>KDV: <xsl:value-of select="format-number(sum(//cac:TaxTotal/cbc:TaxAmount), '#.##0,00', 'tr_TR')"/></div>
          <div class="grand-total">
            GENEL TOPLAM: <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:PayableAmount, '#.##0,00', 'tr_TR')"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="//cbc:DocumentCurrencyCode"/>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`,vt=`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Atlas Minimal e-Arşiv — e-Arşiv faturaları için basit yapı.
  e-Arşiv genelde internet satışı için, müşteri bilgisi daha az detaylı olabilir.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes"/>
  <xsl:decimal-format name="tr_TR" decimal-separator="," grouping-separator="."/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>e-Arşiv — Atlas Minimal</title>
        <style>
          body { font-family: Tahoma, sans-serif; font-size: 11px; padding: 32px; color: #1e293b; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
          .id { font-size: 1.6em; font-weight: bold; color: #059669; }
          .total-box { background: #059669; color: white; padding: 16px 24px; border-radius: 8px; display: inline-block; }
          .total-amount { font-size: 2em; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="id">
            e-Arşiv No: <xsl:value-of select="//cbc:ID"/>
          </div>
          <div style="color: #64748b; margin-top: 4px;">
            Tarih: <xsl:value-of select="//cbc:IssueDate"/> ·
            Tür: <xsl:value-of select="//cbc:InvoiceTypeCode"/>
          </div>
        </div>

        <div class="total-box">
          <div>Ödenecek Tutar</div>
          <div class="total-amount">
            <xsl:value-of select="format-number(//cbc:PayableAmount, '#.##0,00', 'tr_TR')"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="//cbc:DocumentCurrencyCode"/>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`,kt=`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Atlas Standart e-Arşiv — müşteri kartı + ürün tablosu + toplam.
  E-Fatura'dan farkı: renk şeması yeşil (e-Arşiv) + başlık "e-Arşiv".
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes"/>
  <xsl:decimal-format name="tr_TR" decimal-separator="," grouping-separator="."/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>e-Arşiv — Atlas Standart</title>
        <style>
          body { font-family: Tahoma, sans-serif; font-size: 11px; padding: 24px; color: #1e293b; }
          h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 8px; }
          .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
          .party { padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f0fdf4; }
          .party-title { font-weight: bold; color: #059669; margin-bottom: 6px; text-transform: uppercase; font-size: 10px; }
          .party-name { font-size: 1.1em; font-weight: bold; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #cbd5e1; }
          th { background: #059669; color: white; font-weight: bold; }
          .num { text-align: right; }
          .totals { background: #f0fdf4; padding: 12px 16px; border-radius: 6px; margin-top: 16px; border: 1px solid #a7f3d0; }
          .grand-total { font-size: 1.4em; font-weight: bold; color: #059669; }
        </style>
      </head>
      <body>
        <h1>e-Arşiv <xsl:value-of select="//cbc:ID"/></h1>
        <div style="color: #64748b; margin-bottom: 16px;">
          Tarih: <xsl:value-of select="//cbc:IssueDate"/> ·
          Tür: <xsl:value-of select="//cbc:InvoiceTypeCode"/> ·
          Para: <xsl:value-of select="//cbc:DocumentCurrencyCode"/>
        </div>

        <div class="parties">
          <div class="party">
            <div class="party-title">Satıcı</div>
            <div class="party-name">
              <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
            </div>
            <div>
              <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>,
              <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CityName"/>
            </div>
          </div>
          <div class="party">
            <div class="party-title">Müşteri</div>
            <div class="party-name">
              <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/>
            </div>
            <div>
              <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>,
              <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:CityName"/>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Ürün / Hizmet</th>
              <th class="num">Miktar</th>
              <th class="num">Birim Fiyat</th>
              <th class="num">Tutar</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="//cac:InvoiceLine">
              <tr>
                <td><xsl:value-of select="position()"/></td>
                <td><xsl:value-of select="cac:Item/cbc:Name"/></td>
                <td class="num"><xsl:value-of select="cbc:InvoicedQuantity"/></td>
                <td class="num"><xsl:value-of select="format-number(cac:Price/cbc:PriceAmount, '#.##0,00', 'tr_TR')"/></td>
                <td class="num"><xsl:value-of select="format-number(cbc:LineExtensionAmount, '#.##0,00', 'tr_TR')"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>

        <div class="totals">
          <div>Ara Toplam: <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount, '#.##0,00', 'tr_TR')"/></div>
          <div>KDV: <xsl:value-of select="format-number(sum(//cac:TaxTotal/cbc:TaxAmount), '#.##0,00', 'tr_TR')"/></div>
          <div class="grand-total">
            GENEL TOPLAM: <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:PayableAmount, '#.##0,00', 'tr_TR')"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="//cbc:DocumentCurrencyCode"/>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`,Te=[{id:"hello-world",label:"Hello World",description:`En basit — XSLT öğrenmek için başlangıç. Herhangi bir XML'i "Merhaba Dünya" çıktısına dönüştürür.`,moduleId:"fatura",docName:"Hello World",xslt:ft},{id:"fatura-minimal",label:"Minimal e-Fatura",description:"Sadece başlık ve toplam — basit başlangıç için. Genişletilebilir.",moduleId:"fatura",docName:"Atlas Minimal Fatura",xslt:ht},{id:"fatura-standart",label:"Standart e-Fatura",description:"Tam yapı: Gönderen/Alıcı kartları + ürün tablosu + KDV + genel toplam. Mavi renk şeması.",moduleId:"fatura",docName:"Atlas Standart Fatura",xslt:yt},{id:"arsiv-minimal",label:"Minimal e-Arşiv",description:"e-Arşiv için basit yapı — yeşil renk şeması.",moduleId:"arsiv",docName:"Atlas Minimal Arşiv",xslt:vt},{id:"arsiv-standart",label:"Standart e-Arşiv",description:"e-Arşiv tam yapı: satıcı/müşteri + tablo + toplam. Yeşil renk şeması.",moduleId:"arsiv",docName:"Atlas Standart Arşiv",xslt:kt}],St=Object.freeze(Object.defineProperty({__proto__:null,TEMPLATES:Te},Symbol.toStringTag,{value:"Module"})),I={invoice:{root:"Invoice",ns:"urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",label:"Fatura (Invoice)"},despatch:{root:"DespatchAdvice",ns:"urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2",label:"İrsaliye (DespatchAdvice)"},receipt:{root:"Receipt",ns:"urn:oasis:names:specification:ubl:schema:xsd:Receipt-2",label:"Makbuz (Receipt)"}},C=a=>async()=>(await te(async()=>{const{getInlineXslt:t}=await import("./xsltContent-DBGor8c9.js");return{getInlineXslt:t}},[])).getInlineXslt(a)??"",me=a=>async()=>(await te(async()=>{const{getAntrepoTemplateById:t}=await import("./antrepoTemplates-CDmg9PGA.js");return{getAntrepoTemplateById:t}},[])).getAntrepoTemplateById(a)?.xslt??"",$=a=>async()=>(await te(async()=>{const{TEMPLATES:t}=await Promise.resolve().then(()=>St);return{TEMPLATES:t}},void 0)).TEMPLATES.find(t=>t.id===a)?.xslt??"",Tt=/<xsl:when\s+test="\/\/n1:Invoice\/cbc:ProfileID='EARSIVFATURA'">/,zt=[`<xsl:when test="//n1:Invoice/cbc:InvoiceTypeCode='SERBESTMESLEKMAKBUZU'"><xsl:text>e-Serbest Meslek Makbuzu</xsl:text></xsl:when>`,`<xsl:when test="//n1:Invoice/cbc:InvoiceTypeCode='MUSTAHSILMAKBUZ'"><xsl:text>e-Müstahsil Makbuzu</xsl:text></xsl:when>`,`<xsl:when test="contains(//n1:Invoice/cbc:InvoiceTypeCode,'BILET') or contains(//n1:Invoice/cbc:ProfileID,'Bilet')"><xsl:text>e-Bilet</xsl:text></xsl:when>`].join(""),jt=async()=>(await C("gib/general.xslt")()).replace(Tt,t=>zt+t),E=a=>({id:`gib-resmi-${a}`,label:"GİB Resmi Şablon",description:"ebelge.gib.gov.tr UBL-TR 1.2.1 resmi görünümü",moduleId:a,load:jt}),ze=[{id:"fatura",label:"e-Fatura",description:"Temel / Ticari e-Fatura",color:"#6366f1",family:"invoice",profileIds:["TEMELFATURA","TICARIFATURA","KAMU"],sampleXml:"ebelge/samples/e-Fatura-TEMEL.xml",defaults:[E("fatura"),{id:"gib-fatura",label:"Sade e-Fatura",description:"GİB düzenine yakın, hafif şablon",moduleId:"fatura",load:C("gib/v2/e-Fatura-Sablon.xslt")},{id:"antrepo-fatura",label:"Antrepo e-Fatura",description:"Logolu, banka bilgili profesyonel şablon",moduleId:"antrepo-fatura",load:me("antrepo-fatura")},{id:"fatura-standart",label:"Standart Fatura",description:"Satır tablosu ve toplamlar",moduleId:"fatura",load:$("fatura-standart")},{id:"fatura-minimal",label:"Minimal Fatura",description:"Az alanlı, sade başlangıç",moduleId:"fatura",load:$("fatura-minimal")}]},{id:"arsiv",label:"e-Arşiv",description:"e-Arşiv Fatura",color:"#10b981",family:"invoice",profileIds:["EARSIVFATURA"],sampleXml:"ebelge/samples/e-Arsiv-TEMEL.xml",defaults:[E("arsiv"),{id:"gib-arsiv",label:"Sade e-Arşiv",description:"GİB düzenine yakın, hafif şablon",moduleId:"arsiv",load:C("gib/v2/e-Arsiv-Sablon.xslt")},{id:"antrepo-arsiv",label:"Antrepo e-Arşiv",description:"Logolu profesyonel şablon",moduleId:"antrepo-arsiv",load:me("antrepo-arsiv")},{id:"arsiv-standart",label:"Standart e-Arşiv",description:"Satır tablosu ve toplamlar",moduleId:"arsiv",load:$("arsiv-standart")},{id:"arsiv-minimal",label:"Minimal e-Arşiv",description:"Az alanlı, sade başlangıç",moduleId:"arsiv",load:$("arsiv-minimal")}]},{id:"irsaliye",label:"e-İrsaliye",description:"Sevk irsaliyesi",color:"#0ea5e9",family:"despatch",sampleXml:"ebelge/samples/e-Irsaliye-TEMEL.xml",defaults:[{id:"gib-resmi-irsaliye",label:"GİB Resmi Şablon",description:"ebelge.gib.gov.tr UBL-TR 1.2.1 resmi görünümü",moduleId:"irsaliye",load:C("gib/irsaliye.xslt")},{id:"irsaliye",label:"e-İrsaliye Şablonu",description:"Araç / sürücü / teslimat bilgili",moduleId:"irsaliye",load:C("community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt")}]},{id:"ihracat",label:"e-İhracat",description:"İhracat faturası",color:"#8b5cf6",family:"invoice",profileIds:["IHRACAT"],sampleXml:"ebelge/samples/e-Ihracat-TEMEL.xml",defaults:[E("ihracat"),{id:"ihracat",label:"e-İhracat Şablonu",description:"Teslim şartı ve GTİP alanlı",moduleId:"ihracat",load:C("community/IRPTeam-eFatura.xslt")}]},{id:"smm",label:"e-SMM",description:"Serbest meslek makbuzu",color:"#14b8a6",family:"invoice",profileIds:["EARSIVBELGE"],sampleXml:"ebelge/samples/e-SMM-TEMEL.xml",defaults:[E("smm"),{id:"smm",label:"e-SMM Şablonu",description:"Stopaj ve hizmet bilgili",moduleId:"smm",load:C("community/hzkucuk-eFatura-smm.xslt")}]},{id:"mustahsil",label:"e-Müstahsil",description:"Müstahsil makbuzu",color:"#84cc16",family:"invoice",profileIds:["EARSIVBELGE"],sampleXml:"ebelge/samples/e-Mustahsil-TEMEL.xml",defaults:[E("mustahsil"),{id:"mustahsil",label:"e-Müstahsil Şablonu",description:"Müstahsil / stopaj bilgili",moduleId:"mustahsil",load:C("community/hzkucuk-eFatura-mustahsil.xslt")}]},{id:"bilet",label:"e-Bilet",description:"Yolcu / etkinlik bileti",color:"#f97316",family:"invoice",sampleXml:"ebelge/samples/e-Bilet-TEMEL.xml",defaults:[E("bilet"),{id:"bilet",label:"e-Bilet Şablonu",description:"Yolcu, sefer ve koltuk bilgili",moduleId:"bilet",load:C("community/hzkucuk-eFatura-bilet.xslt")}]}],wt=a=>`/edesign-deploy/${a}`;async function ee(a){const t=await fetch(wt(a.sampleXml));if(!t.ok)throw new Error(`Örnek XML yüklenemedi (${t.status})`);return t.text()}const ue="http://www.w3.org/1999/XSL/Transform",O="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",je=a=>a.replace(/^\uFEFF/,"").replace(/^ï»¿/,"");function K(a){const t=new DOMParser().parseFromString(je(a),"application/xml"),s=t.getElementsByTagName("parsererror")[0];return{doc:t,error:s?(s.textContent||"ayrıştırma hatası").split(`
`)[0].slice(0,160):null}}const we=a=>Object.keys(I).find(t=>I[t].ns===a)??null;function Ae(a,t){try{const s=new XSLTProcessor;s.importStylesheet(a);const r=s.transformToDocument(t);return!r||!r.documentElement?"XSLT sonuç üretmedi":null}catch(s){return s instanceof Error?s.message:String(s)}}const F=(a,t)=>({ok:!a.some(s=>s.level==="error"),checks:a,info:t});function At(a,t,s){const r=[],o=[],{doc:g,error:v}=K(a);if(v)return F([{level:"error",text:`Dosya geçerli bir XML/XSLT değil: ${v}`}],o);const c=g.documentElement;if(c.namespaceURI!==ue||!["stylesheet","transform"].includes(c.localName))return F([{level:"error",text:`Bu dosya bir XSLT değil (kök eleman <${c.nodeName}>; xsl:stylesheet olmalı).`}],o);r.push({level:"ok",text:"Geçerli XSLT dosyası"});const d=c.getAttribute("version")||"1.0";o.push(["XSLT sürümü",d]),o.push(["Şablon (template) sayısı",String(g.getElementsByTagNameNS(ue,"template").length)]);const u=new Set;for(const h of a.matchAll(/xmlns(?::[\w.-]+)?\s*=\s*["']([^"']+)["']/g)){const S=we(h[1]);S&&u.add(S)}const y=h=>(a.match(h)||[]).length,f={invoice:y(/\bInvoice(Line)?\b/g),despatch:y(/\bDespatch(Advice|Line)\b/g),receipt:y(/\bReceipt(Line)?\b/g)},p=(u.size?[...u]:Object.keys(f).filter(h=>f[h]>0)).sort((h,S)=>f[S]-f[h])[0]??null,z=I[t.family];if(p&&p!==t.family?r.push({level:"error",text:`Bu XSLT ${I[p].label} için hazırlanmış; ${t.label} için ${z.label} yapısında bir XSLT gerekli.`}):p?r.push({level:"ok",text:`Belge yapısı uygun: ${z.label}`}):r.push({level:"warn",text:"XSLT belge yapısını belirtmiyor; uygunluk örnek veriyle denenerek kontrol edildi."}),t.family==="invoice"){const h=/EARSIV|e-Ar[şs]iv/i.test(a),S=/TEMELFATURA|TICARIFATURA/.test(a);t.id==="fatura"&&h&&!S&&r.push({level:"warn",text:"XSLT e-Arşiv faturasına özel görünüyor; e-Fatura için başlık ve alanları kontrol edin."}),t.id==="arsiv"&&S&&!h&&r.push({level:"warn",text:"XSLT e-Fatura (Temel/Ticari) için hazırlanmış görünüyor; e-Arşiv başlığını kontrol edin."})}if((d.startsWith("2")||d.startsWith("3"))&&r.push({level:"warn",text:`XSLT ${d} olarak işaretli; tasarımcı 1.0 motoruyla çalıştırır, 2.0'a özel fonksiyonlar çalışmayabilir.`}),s&&!r.some(h=>h.level==="error")){const h=K(s),S=h.error?null:Ae(g,h.doc);r.push(S?{level:"error",text:`${t.label} örnek verisiyle çalıştırılamadı: ${S}`}:{level:"ok",text:`${t.label} örnek verisiyle başarıyla çalıştı`})}return F(r,o)}const R=(a,t,s=O)=>Array.from(a.children).find(o=>o.localName===t&&o.namespaceURI===s)?.textContent?.trim()??"";function xe(a,t){const s=Array.from(a.children).find(v=>v.localName===t);if(!s)return"";const r=s.getElementsByTagNameNS(O,"Name")[0]?.textContent?.trim();if(r)return r;const o=s.getElementsByTagNameNS(O,"FirstName")[0]?.textContent?.trim()??"",g=s.getElementsByTagNameNS(O,"FamilyName")[0]?.textContent?.trim()??"";return`${o} ${g}`.trim()}function Z(a,t,s){const r=[],o=[],{doc:g,error:v}=K(a);if(v)return F([{level:"error",text:`Dosya geçerli bir XML değil: ${v}`}],o);const c=g.documentElement,d=we(c.namespaceURI),u=I[t.family];if(d!==t.family){const m=d?I[d].label:`<${c.localName}>`;return F([{level:"error",text:`Bu XML bir ${m} belgesi; ${t.label} için ${u.label} belgesi gerekli.`}],o)}r.push({level:"ok",text:`Belge yapısı uygun: ${u.label}`});const y=R(c,"ProfileID"),f=m=>m.toUpperCase().replace(/[^A-Z0-9]/g,"");t.profileIds&&y&&!t.profileIds.some(m=>f(y).includes(f(m)))&&r.push({level:"warn",text:`Belgenin profili ${y}; ${t.label} için beklenen: ${t.profileIds.join(" / ")}.`});const T=t.family==="despatch"?"DespatchLine":t.family==="receipt"?"ReceiptLine":"InvoiceLine",p=Array.from(c.children).filter(m=>m.localName===T).length,z=R(c,"InvoiceTypeCode")||R(c,"DespatchAdviceTypeCode"),h=xe(c,t.family==="despatch"?"DespatchSupplierParty":"AccountingSupplierParty"),S=xe(c,t.family==="despatch"?"DeliveryCustomerParty":"AccountingCustomerParty"),i=[["Belge no",R(c,"ID")],["Tarih",R(c,"IssueDate")],["Profil",y],["Tip",z],["Para birimi",R(c,"DocumentCurrencyCode")],["Gönderen",h],["Alıcı",S],["Satır sayısı",String(p)]];if(o.push(...i.filter(([,m])=>m)),p||r.push({level:"warn",text:"Belgede kalem (satır) bulunamadı; satır tablosu boş görünür."}),s){const m=K(s),n=m.error?`XSLT okunamadı: ${m.error}`:Ae(m.doc,g);r.push(n?{level:"error",text:`Seçilen XSLT bu veriyle çalıştırılamadı: ${n}`}:{level:"ok",text:"Seçilen XSLT bu veriyle başarıyla çalıştı"})}return F(r,o)}const Ct=5*1024*1024,It=["Belge türü","Tasarım (XSLT)","Veri (XML)"],D=(a,t="#6366f1")=>({background:a?`${t}22`:"rgba(30, 41, 59, 0.45)",border:`1px solid ${a?t:"rgba(255,255,255,0.08)"}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",color:"white",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s",width:"100%",boxShadow:a?`0 0 0 3px ${t}33`:"none"}),Mt=a=>new Promise((t,s)=>{const r=new FileReader;r.onload=()=>t(String(r.result??"")),r.onerror=()=>s(r.error??new Error("Dosya okunamadı")),r.readAsText(a)}),Ce=({result:a})=>e.jsxs("div",{"data-wizard-checks":a.ok?"ok":"error",style:{display:"flex",flexDirection:"column",gap:6},children:[a.checks.map((t,s)=>e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",gap:8,fontSize:13,color:t.level==="ok"?"#6ee7b7":t.level==="warn"?"#fcd34d":"#fca5a5"},children:[t.level==="ok"?e.jsx(ae,{size:16,style:{flexShrink:0}}):t.level==="warn"?e.jsx(Ge,{size:16,style:{flexShrink:0}}):e.jsx(He,{size:16,style:{flexShrink:0}}),e.jsx("span",{children:t.text})]},s)),a.info.length>0&&e.jsx("div",{style:{display:"grid",gridTemplateColumns:"auto 1fr",gap:"4px 14px",marginTop:8,fontSize:12},children:a.info.map(([t,s])=>e.jsxs(Ne.Fragment,{children:[e.jsx("span",{style:{color:"#64748b"},children:t}),e.jsx("span",{style:{color:"#e2e8f0",wordBreak:"break-word"},children:s})]},t))})]}),ge=({accept:a,hint:t,file:s,busy:r,onFile:o})=>{const g=x.useRef(null),[v,c]=x.useState(!1);return e.jsxs("div",{style:{marginTop:14},children:[e.jsx("input",{ref:g,type:"file",accept:a,"data-wizard-file":!0,style:{display:"none"},onChange:d=>{const u=d.target.files?.[0];u&&o(u),d.target.value=""}}),e.jsxs("div",{onClick:()=>g.current?.click(),onDragOver:d=>{d.preventDefault(),c(!0)},onDragLeave:()=>c(!1),onDrop:d=>{d.preventDefault(),c(!1);const u=d.dataTransfer.files?.[0];u&&o(u)},style:{border:`2px dashed ${v?"#6366f1":"rgba(148,163,184,0.3)"}`,borderRadius:14,padding:"22px 16px",textAlign:"center",cursor:"pointer",color:"#94a3b8",background:v?"rgba(99,102,241,0.08)":"rgba(15,23,42,0.4)"},children:[r?e.jsx(ye,{size:26}):e.jsx(U,{size:26}),e.jsx("div",{style:{marginTop:8,fontSize:14,color:"#e2e8f0",fontWeight:600},children:s?"Başka dosya seç":"Dosya seçin veya buraya sürükleyin"}),e.jsx("div",{style:{fontSize:12,marginTop:4},children:t})]}),s&&e.jsxs("div",{style:{marginTop:14,display:"grid",gridTemplateColumns:"minmax(0, 1fr) minmax(0, 1fr)",gap:14},children:[e.jsxs("div",{style:{background:"rgba(15,23,42,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:12,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:700,marginBottom:8},children:[e.jsx(ie,{size:16,color:"#a5b4fc"}),e.jsx("span",{"data-wizard-file-name":!0,style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:s.name}),e.jsxs("span",{style:{color:"#64748b",fontWeight:400,marginLeft:"auto",flexShrink:0},children:[(s.size/1024).toFixed(1)," KB"]})]}),e.jsx("pre",{style:{margin:0,maxHeight:220,overflow:"auto",fontSize:11,lineHeight:1.45,color:"#cbd5e1",background:"#020617",borderRadius:8,padding:10,whiteSpace:"pre"},children:je(s.text).split(`
`).slice(0,40).join(`
`)})]}),e.jsxs("div",{style:{background:"rgba(15,23,42,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:12},children:[e.jsx("div",{style:{fontSize:13,fontWeight:700,marginBottom:10},children:"Uygunluk kontrolü"}),e.jsx(Ce,{result:s.result})]})]})]})},Lt=({onFinish:a})=>{const[t,s]=x.useState(0),[r,o]=x.useState(null),[g,v]=x.useState(null),[c,d]=x.useState(""),[u,y]=x.useState(null),[f,T]=x.useState(!1),[p,z]=x.useState("default"),[h,S]=x.useState(null),[i,m]=x.useState(null),[n,b]=x.useState(null),[j,A]=x.useState(!1),[L,w]=x.useState(null);x.useEffect(()=>{if(!r)return;let l=!0;return v(null),ee(r).then(k=>{l&&v(k)}).catch(k=>l&&w(k.message)),()=>{l=!1}},[r]);const G=r?.defaults.find(l=>l.id===c)??null,Pe=l=>{l.id!==r?.id&&(o(l),d(l.defaults[0].id),y(null),S(null),z("default")),s(1)},re=async(l,k)=>{if(r){if(w(null),l.size>Ct){w(`Dosya çok büyük (en fazla 5 MB): ${(l.size/1024/1024).toFixed(1)} MB`);return}A(!0);try{const M=await Mt(l),se=k==="xslt"&&$e(M),N=se?Oe(M):M;k==="xslt"&&T(se);const _e=k==="xslt"&&!!Xe(N)?{ok:!1,info:[],checks:[{level:"error",text:'Bu dosya onaylanmış (satın alınmış) bir tasarım; tekrar düzenlenemez. Dosyayı "Tamamlanan Tasarımlar" listesinden tekrar indirebilirsiniz.'}]}:k==="xslt"?At(N,r,g):Z(N,r,i),le={name:l.name,size:l.size,text:N,result:_e};k==="xslt"?y(le):S(le)}catch(M){w(M instanceof Error?M.message:String(M))}finally{A(!1)}}},Fe=async()=>{if(r){A(!0),w(null);try{const l=c==="own"?u?.text??"":await(G?.load()??Promise.resolve(""));if(!l)throw new Error("XSLT yüklenemedi");m(l);const k=g??await ee(r);v(k),b(Z(k,r,l)),h&&S({...h,result:Z(h.text,r,l)}),s(2)}catch(l){w(l instanceof Error?l.message:String(l))}finally{A(!1)}}},De=()=>{if(!r||!i)return;const l=p==="own"?h?.text:g;l&&a({moduleId:c==="own"?r.id:G?.moduleId??r.id,docName:c==="own"&&u?u.name.replace(/\.(xslt|xsl)$/i,""):`${r.label} Tasarımı`,xslt:i,xml:l})},X=t===1?(c==="own"?!!u?.result.ok:!!G)&&!!g:t===2?p==="own"?!!h?.result.ok:!!n?.ok:!1,H=(l,k)=>e.jsxs("div",{style:{marginBottom:18},children:[e.jsx("h2",{style:{margin:0,fontSize:22,fontWeight:800},children:l}),e.jsx("p",{style:{margin:"4px 0 0",color:"#94a3b8",fontSize:14},children:k})]});return e.jsxs("div",{"data-design-wizard":!0,"data-wizard-step":t,style:{width:"100%",background:"rgba(15, 23, 42, 0.7)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:24,padding:"28px 28px 22px",boxShadow:"0 24px 60px rgba(0,0,0,0.35)",color:"white"},children:[e.jsx("div",{style:{display:"flex",gap:8,marginBottom:26},children:It.map((l,k)=>e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{style:{height:4,borderRadius:4,background:k<=t?"linear-gradient(90deg,#6366f1,#0ea5e9)":"rgba(148,163,184,0.2)"}}),e.jsxs("div",{style:{marginTop:6,fontSize:12,fontWeight:700,color:k===t?"#e2e8f0":"#64748b"},children:[k+1,". ",l,k<t&&k===0&&r?` · ${r.label}`:""]})]},l))}),t===0&&e.jsxs(e.Fragment,{children:[H("Hangi belgeyi tasarlayacaksınız?","Belge türünü seçin; şablon ve veri kontrolleri bu türe göre yapılır."),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:12},children:ze.map(l=>e.jsx("button",{type:"button","data-doc-type":l.id,onClick:()=>Pe(l),style:D(r?.id===l.id,l.color),children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:38,height:38,borderRadius:10,background:`${l.color}26`,color:l.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:e.jsx(he,{size:20})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:700,fontSize:15},children:l.label}),e.jsx("div",{style:{color:"#94a3b8",fontSize:12},children:l.description})]})]})},l.id))})]}),t===1&&r&&e.jsxs(e.Fragment,{children:[H(`${r.label} için tasarım şablonu`,"Hazır bir şablonla başlayın ya da kendi XSLT dosyanızı yükleyin."),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))",gap:12},children:r.defaults.map(l=>e.jsxs("button",{type:"button","data-xslt-option":l.id,onClick:()=>d(l.id),style:D(c===l.id,r.color),children:[e.jsxs("div",{style:{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:6},children:[c===l.id&&e.jsx(ae,{size:15,color:"#6ee7b7"}),l.label]}),e.jsx("div",{style:{color:"#94a3b8",fontSize:12,marginTop:3},children:l.description}),e.jsx("div",{style:{color:"#64748b",fontSize:11,marginTop:6},children:"Varsayılan şablon"})]},l.id))}),e.jsxs("button",{type:"button","data-xslt-option":"own",onClick:()=>d("own"),style:{...D(c==="own","#f59e0b"),marginTop:12},children:[e.jsxs("div",{style:{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8},children:[e.jsx(U,{size:16})," Kendi XSLT dosyamı kullan"]}),e.jsxs("div",{style:{color:"#94a3b8",fontSize:12,marginTop:3},children:["Dosyanız ",I[r.family].label," yapısına ve ",r.label," türüne uygunluk için kontrol edilir."]})]}),c==="own"&&e.jsx(ge,{accept:".xslt,.xsl",hint:".xslt veya .xsl · en fazla 5 MB",file:u,busy:j,onFile:l=>re(l,"xslt")}),c==="own"&&u&&f&&e.jsx("div",{"data-test-file-note":!0,style:{marginTop:10,padding:"10px 12px",borderRadius:10,fontSize:12,lineHeight:1.5,background:"rgba(245, 158, 11, 0.1)",border:"1px solid rgba(245, 158, 11, 0.35)",color:"#fde68a"},children:'Bu bir TEST dosyası. TEST yazısı editörde kaldırıldı; tasarıma kaldığınız yerden devam edebilirsiniz. Bitirdiğinizde "Onayla" ile TEST yazısız dosyayı alırsınız; onaydan sonra tasarım değiştirilemez.'})]}),t===2&&r&&e.jsxs(e.Fragment,{children:[H("Tasarımda hangi veri görünsün?","Önizlemede kullanılacak e-belge XML’ini seçin. Tasarım her veriyle çalışır; bu sadece önizleme içindir."),e.jsxs("button",{type:"button","data-xml-option":"default",onClick:()=>z("default"),style:D(p==="default",r.color),children:[e.jsxs("div",{style:{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8},children:[e.jsx(Ue,{size:16})," Varsayılan örnek XML"]}),e.jsxs("div",{style:{color:"#94a3b8",fontSize:12,marginTop:3},children:[r.label," için hazır örnek belge (",r.sampleXml.split("/").pop(),")"]}),p==="default"&&n&&e.jsx("div",{style:{marginTop:10},children:e.jsx(Ce,{result:n})})]}),e.jsxs("button",{type:"button","data-xml-option":"own",onClick:()=>z("own"),style:{...D(p==="own","#f59e0b"),marginTop:12},children:[e.jsxs("div",{style:{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8},children:[e.jsx(U,{size:16})," Kendi XML dosyamı seç"]}),e.jsxs("div",{style:{color:"#94a3b8",fontSize:12,marginTop:3},children:["Gerçek bir ",r.label," XML’i (",I[r.family].root,") yükleyin; seçtiğiniz şablonla denenir."]})]}),p==="own"&&e.jsx(ge,{accept:".xml",hint:".xml · en fazla 5 MB",file:h,busy:j,onFile:l=>re(l,"xml")})]}),L&&e.jsx("div",{style:{marginTop:14,color:"#fca5a5",fontSize:13},children:L}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:24},children:[e.jsxs("button",{type:"button","data-wizard-back":!0,disabled:t===0,onClick:()=>{w(null),s(l=>Math.max(0,l-1))},style:{padding:"10px 18px",borderRadius:10,border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:t===0?"#475569":"#cbd5e1",cursor:t===0?"default":"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit"},children:[e.jsx(Ke,{size:16})," Geri"]}),t>0&&e.jsxs("button",{type:"button","data-wizard-next":!0,disabled:!X||j,onClick:t===1?Fe:De,style:{padding:"10px 22px",borderRadius:10,border:"none",fontWeight:700,fontFamily:"inherit",background:X&&!j?"linear-gradient(135deg,#6366f1,#0ea5e9)":"rgba(148,163,184,0.2)",color:X&&!j?"white":"#64748b",cursor:X&&!j?"pointer":"default",display:"flex",alignItems:"center",gap:6},children:[j?e.jsx(ye,{size:16}):null,t===1?"Veri seçimine geç":"Tasarım ekranını aç"," ",e.jsx(Ve,{size:16})]})]})]})},be=5,Q=10,Ie=a=>ze.find(t=>t.id===a||t.defaults.some(s=>s.moduleId===a)),V=a=>Ie(a)?.label??a,Me=(a,t=!1)=>{if(!a)return"";const s=new Date(a);return Number.isNaN(s.getTime())?"":s.toLocaleString("tr-TR",{day:"2-digit",month:"short",year:"numeric",...t?{hour:"2-digit",minute:"2-digit"}:{}})},Le=a=>(t,s)=>new Date(s[a]??s.updated_at).getTime()-new Date(t[a]??t.updated_at).getTime(),Ee=a=>{const t=URL.createObjectURL(new Blob([fe(a.xslt_content??"")],{type:"application/xml;charset=utf-8"})),s=document.createElement("a");s.href=t,s.download=`${a.name.replace(/[\\/:*?"<>|\s]+/g,"_")}_${a.module_id}.xslt`,document.body.appendChild(s),s.click(),document.body.removeChild(s),setTimeout(()=>URL.revokeObjectURL(t),1e4)},Re=()=>{const[a,t]=x.useState(null);return x.useEffect(()=>{q.listDesigns().then(r=>t((r.designs??[]).filter(o=>o.xslt_content))).catch(()=>t([]))},[]),{designs:a,remove:async r=>{window.confirm(`"${r.name}" silinsin mi?${r.paid?`

Onaylanmış bir tasarımı silerseniz tekrar indiremezsiniz.`:""}`)&&(await q.deleteDesign(r.id),t(o=>o?.filter(g=>g.id!==r.id)??null))}}},Be=(a,t)=>e.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:"10px",marginBottom:"12px",flexWrap:"wrap"},children:[e.jsx("h2",{style:{fontSize:"1.1rem",fontWeight:800,margin:0,color:"#f1f5f9"},children:a}),e.jsx("span",{style:{fontSize:"0.8rem",color:"#64748b"},children:t})]}),P=a=>({display:"inline-flex",alignItems:"center",gap:"5px",padding:"6px 12px",borderRadius:"8px",border:"none",cursor:"pointer",background:a,color:"white",fontWeight:700,fontSize:"0.8rem",fontFamily:"inherit",whiteSpace:"nowrap"}),Et=({onOpen:a})=>{const{designs:t,remove:s}=Re(),r=x.useMemo(()=>(t??[]).filter(o=>!o.paid).sort(Le("updated_at")).slice(0,be),[t]);return r.length?e.jsxs("div",{"data-my-designs":!0,style:{width:"100%",marginBottom:"2rem"},children:[Be("Devam Eden Tasarımlar",`Son düzenlediğiniz ${be} taslak. Onaylanana kadar düzenleyebilirsiniz; onay 1 hak harcar.`),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:"12px"},children:r.map(o=>e.jsxs("div",{"data-design-id":o.id,style:{display:"flex",flexDirection:"column",gap:"8px",padding:"14px 16px",background:"rgba(30, 41, 59, 0.5)",borderRadius:"12px",border:"1px solid rgba(148, 163, 184, 0.2)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[e.jsx(ie,{size:20,color:"#94a3b8",style:{flexShrink:0}}),e.jsxs("div",{style:{minWidth:0,flex:1},children:[e.jsx("div",{style:{fontWeight:700,fontSize:"0.95rem",color:"#f1f5f9",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:o.name}),e.jsxs("div",{style:{fontSize:"0.75rem",color:"#94a3b8"},children:[V(o.module_id)," · ",Me(o.updated_at)]})]}),e.jsx("button",{type:"button",title:"Sil",onClick:()=>s(o),style:{background:"transparent",border:"none",color:"#64748b",cursor:"pointer",padding:4},children:e.jsx(ve,{size:15})})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("span",{style:{fontSize:"0.7rem",fontWeight:700,padding:"2px 8px",borderRadius:999,background:"rgba(148, 163, 184, 0.12)",color:"#94a3b8"},children:"Taslak · onay 1 hak"}),e.jsxs("button",{type:"button","data-open-design":o.id,onClick:()=>a(o),style:{...P("#6366f1"),marginLeft:"auto"},children:[e.jsx(Ye,{size:13})," Devam et"]})]})]},o.id))})]}):null},_={textAlign:"left",padding:"10px 12px",fontSize:"0.72rem",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.04em",borderBottom:"1px solid rgba(148, 163, 184, 0.2)",whiteSpace:"nowrap"},B={padding:"10px 12px",fontSize:"0.85rem",color:"#e2e8f0",borderBottom:"1px solid rgba(148, 163, 184, 0.1)",verticalAlign:"middle"},Rt=()=>{const{designs:a,remove:t}=Re(),[s,r]=x.useState(""),[o,g]=x.useState(0),[v,c]=x.useState(null),d=x.useMemo(()=>(a??[]).filter(p=>p.paid).sort(Le("paid_at")),[a]),u=x.useMemo(()=>{const p=s.trim().toLocaleLowerCase("tr-TR");return p?d.filter(z=>`${z.name} ${V(z.module_id)}`.toLocaleLowerCase("tr-TR").includes(p)):d},[d,s]),y=Math.max(1,Math.ceil(u.length/Q)),f=Math.min(o,y-1),T=u.slice(f*Q,(f+1)*Q);return d.length?e.jsxs("div",{"data-completed-designs":!0,style:{width:"100%",marginBottom:"2rem"},children:[Be("Tamamlanan Tasarımlar","Onaylanan tasarımlar değiştirilemez; istediğiniz zaman önizleyip ücretsiz tekrar indirebilirsiniz."),e.jsxs("div",{style:{background:"rgba(30, 41, 59, 0.5)",border:"1px solid rgba(148, 163, 184, 0.2)",borderRadius:"12px",overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",borderBottom:"1px solid rgba(148, 163, 184, 0.15)"},children:[e.jsxs("div",{style:{position:"relative",flex:"0 1 280px"},children:[e.jsx(Ze,{size:14,color:"#64748b",style:{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}),e.jsx("input",{"data-completed-search":!0,value:s,onChange:p=>{r(p.target.value),g(0)},placeholder:"Tasarım veya belge türü ara",style:{width:"100%",boxSizing:"border-box",padding:"7px 10px 7px 30px",borderRadius:"8px",border:"1px solid rgba(148, 163, 184, 0.25)",background:"rgba(15, 23, 42, 0.6)",color:"#f1f5f9",fontSize:"0.82rem",fontFamily:"inherit",outline:"none"}})]}),e.jsxs("span",{style:{marginLeft:"auto",fontSize:"0.78rem",color:"#94a3b8"},children:[u.length," / ",d.length," tasarım"]})]}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:_,children:"Tasarım"}),e.jsx("th",{style:_,children:"Belge türü"}),e.jsx("th",{style:_,children:"Onay tarihi"}),e.jsx("th",{style:{..._,textAlign:"center"},children:"İndirme"}),e.jsx("th",{style:{..._,textAlign:"right"},children:"İşlemler"})]})}),e.jsxs("tbody",{children:[T.map(p=>e.jsxs("tr",{"data-completed-row":p.id,children:[e.jsx("td",{style:B,children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",minWidth:0},children:[e.jsx(Qe,{size:16,color:"#34d399",style:{flexShrink:0}}),e.jsx("span",{style:{fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:260},children:p.name}),e.jsx(qe,{size:12,color:"#64748b",style:{flexShrink:0}})]})}),e.jsx("td",{style:B,children:V(p.module_id)}),e.jsx("td",{style:{...B,whiteSpace:"nowrap",color:"#94a3b8"},children:Me(p.paid_at??p.updated_at,!0)}),e.jsx("td",{style:{...B,textAlign:"center",color:"#94a3b8"},children:p.download_count??0}),e.jsx("td",{style:{...B,textAlign:"right"},children:e.jsxs("div",{style:{display:"inline-flex",gap:"6px",alignItems:"center"},children:[e.jsxs("button",{type:"button","data-preview-design":p.id,onClick:()=>c(p),style:P("#334155"),children:[e.jsx(ke,{size:13})," Önizle"]}),e.jsxs("button",{type:"button","data-download-design":p.id,onClick:()=>Ee(p),style:P("#10b981"),children:[e.jsx(Se,{size:13})," İndir"]}),e.jsx("button",{type:"button",title:"Sil",onClick:()=>t(p),style:{background:"transparent",border:"none",color:"#64748b",cursor:"pointer",padding:4},children:e.jsx(ve,{size:15})})]})})]},p.id)),!T.length&&e.jsx("tr",{children:e.jsx("td",{colSpan:5,style:{...B,textAlign:"center",color:"#64748b",padding:"20px"},children:"Aramaya uyan tasarım yok."})})]})]})}),y>1&&e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"8px",padding:"8px 12px",fontSize:"0.8rem",color:"#94a3b8"},children:[e.jsx("button",{type:"button",disabled:f===0,onClick:()=>g(f-1),style:{...P("#334155"),opacity:f===0?.4:1},children:e.jsx(Je,{size:13})}),e.jsxs("span",{children:[f+1," / ",y]}),e.jsx("button",{type:"button",disabled:f>=y-1,onClick:()=>g(f+1),style:{...P("#334155"),opacity:f>=y-1?.4:1},children:e.jsx(et,{size:13})})]})]}),v&&e.jsx(Bt,{design:v,onClose:()=>c(null)})]}):null},Bt=({design:a,onClose:t})=>{const[s,r]=x.useState(null),[o,g]=x.useState(null),[v,c]=x.useState(!1);return x.useEffect(()=>{let d=!0;return(async()=>{try{let u=a.xml_content;if(!u){const f=Ie(a.module_id);if(!f)throw new Error("Bu belge türü için örnek XML bulunamadı.");u=await ee(f),d&&c(!0)}const y=gt(u,fe(a.xslt_content??""));d&&r(y)}catch(u){d&&g(u instanceof Error?u.message:String(u))}})(),()=>{d=!1}},[a]),x.useEffect(()=>{const d=u=>{u.key==="Escape"&&t()};return window.addEventListener("keydown",d),()=>window.removeEventListener("keydown",d)},[t]),e.jsx("div",{"data-design-preview":!0,onClick:t,style:{position:"fixed",inset:0,zIndex:1e3,background:"rgba(2, 6, 23, 0.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"},children:e.jsxs("div",{onClick:d=>d.stopPropagation(),style:{width:"min(1000px, 100%)",height:"min(90vh, 1200px)",display:"flex",flexDirection:"column",background:"#0f172a",borderRadius:"14px",border:"1px solid rgba(148, 163, 184, 0.25)",overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",padding:"12px 16px",borderBottom:"1px solid rgba(148, 163, 184, 0.2)"},children:[e.jsx(ke,{size:18,color:"#94a3b8"}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("div",{style:{fontWeight:800,color:"#f1f5f9",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:a.name}),e.jsxs("div",{style:{fontSize:"0.75rem",color:"#94a3b8"},children:[V(a.module_id)," · ",v?"örnek XML ile önizleme":"kayıtlı XML ile önizleme"]})]}),e.jsxs("button",{type:"button",onClick:()=>Ee(a),style:{...P("#10b981"),marginLeft:"auto"},children:[e.jsx(Se,{size:13})," İndir"]}),e.jsx("button",{type:"button",title:"Kapat","data-preview-close":!0,onClick:t,style:{background:"transparent",border:"none",color:"#94a3b8",cursor:"pointer",padding:4},children:e.jsx(J,{size:18})})]}),e.jsxs("div",{style:{flex:1,background:"#fff",position:"relative"},children:[s&&e.jsx("iframe",{title:"Tasarım önizleme",srcDoc:s,sandbox:"allow-same-origin",style:{width:"100%",height:"100%",border:0}}),!s&&!o&&e.jsx("div",{style:{padding:24,color:"#475569"},children:"Önizleme hazırlanıyor…"}),o&&e.jsxs("div",{style:{padding:24,color:"#b91c1c"},children:["Önizleme oluşturulamadı: ",o]})]})]})})},Pt=[{id:"fatura",name:"e-Fatura",icon:e.jsx(he,{size:24}),color:"#6366f1",template:"gib/v2/e-Fatura-Sablon.xslt"},{id:"arsiv",name:"e-Arşiv",icon:e.jsx(nt,{size:24}),color:"#10b981",template:"gib/v2/e-Arsiv-Sablon.xslt"},{id:"irsaliye",name:"e-İrsaliye",icon:e.jsx(ot,{size:24}),color:"#0ea5e9",template:"community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt"},{id:"ihracat",name:"e-İhracat",icon:e.jsx(dt,{size:24}),color:"#8b5cf6",template:"community/IRPTeam-eFatura.xslt"},{id:"mikro_ihracat",name:"e-Mikro İhracat",icon:e.jsx(ct,{size:24}),color:"#a855f7",template:"community/IRPTeam-eFatura.xslt"},{id:"smm",name:"e-SMM (Serbest Meslek)",icon:e.jsx(pt,{size:24}),color:"#14b8a6",template:"community/hzkucuk-eFatura-smm.xslt"},{id:"mustahsil",name:"e-Müstahsil Makbuzu",icon:e.jsx(mt,{size:24}),color:"#84cc16",template:"community/hzkucuk-eFatura-mustahsil.xslt"},{id:"bilet",name:"e-Bilet",icon:e.jsx(ut,{size:24}),color:"#f97316",template:"community/hzkucuk-eFatura-bilet.xslt"},{id:"makbuz",name:"e-Makbuz",icon:e.jsx(xt,{size:24}),color:"#06b6d4",template:"community/hzkucuk-eFatura-makbuz.xslt"}],Kt=({onSelect:a,onLogout:t,onSelectXsltEditor:s})=>{const r=x.useRef(null),[o,g]=x.useState(!1),[v,c]=x.useState(!1),[d,u]=x.useState(null),[y,f]=x.useState(null),[T,p]=x.useState(null),[z,h]=x.useState(!1);x.useEffect(()=>{q.getMe().then(p).catch(console.error)},[]);const S=i=>{const m=i.target.files?.[0];if(!m)return;const n=5*1024*1024;if(m.size>n){W.getState().pushToast({kind:"error",title:"Dosya çok büyük",description:`Maksimum 5 MB. Seçilen dosya: ${(m.size/1024/1024).toFixed(1)} MB`}),i.target.value="";return}const b=[".xslt",".xsl",".xml"],j=m.name.toLowerCase();if(!b.some(L=>j.endsWith(L))){W.getState().pushToast({kind:"error",title:"Geçersiz dosya tipi",description:"Yalnızca .xslt, .xsl veya .xml dosyaları kabul edilir."}),i.target.value="";return}const A=new FileReader;A.onload=L=>{const w=L.target?.result;if(!w||!w.trim().startsWith("<")){W.getState().pushToast({kind:"error",title:"Geçersiz XSLT içeriği",description:"Dosya XML/XSLT olarak okunamadı."}),i.target.value="";return}a("custom",m.name,"Özel Belge",w)},A.onerror=()=>{W.getState().pushToast({kind:"error",title:"Dosya okunamadı",description:A.error?.message??"Bilinmeyen hata"}),i.target.value=""},A.readAsText(m)};return e.jsxs("div",{style:{minHeight:"100vh",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0f172a",fontFamily:"Inter, sans-serif",color:"white",padding:"2rem",boxSizing:"border-box",position:"relative"},children:[e.jsxs("div",{style:{position:"absolute",top:"2rem",right:"2rem",display:"flex",gap:"1rem",zIndex:50},children:[T&&e.jsxs("div",{"data-credit-badge":!0,title:"Kalan tasarım hakkı",style:{display:"flex",alignItems:"center",gap:"6px",padding:"0.6rem 1rem",borderRadius:"12px",border:"1px solid rgba(16,185,129,0.3)",background:"rgba(16,185,129,0.1)",color:"#6ee7b7",fontSize:"0.85rem",fontWeight:700},children:[e.jsx(ne,{size:16})," ",T.credits??0," tasarım hakkı"]}),e.jsxs("button",{onClick:()=>c(!0),style:{background:"linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",border:"none",padding:"0.6rem 1.4rem",borderRadius:"12px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s",boxShadow:"0 4px 15px rgba(99, 102, 241, 0.3)",fontWeight:"bold"},onMouseOver:i=>i.currentTarget.style.transform="translateY(-2px)",onMouseOut:i=>i.currentTarget.style.transform="translateY(0)",children:[e.jsx(tt,{size:18}),e.jsx("span",{style:{fontSize:"0.9rem"},children:"Paket Al"})]}),e.jsxs("button",{onClick:()=>g(!0),style:{background:"rgba(30, 41, 59, 0.6)",border:"1px solid rgba(255,255,255,0.1)",padding:"0.6rem 1.2rem",borderRadius:"12px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s",backdropFilter:"blur(10px)"},onMouseOver:i=>i.currentTarget.style.background="rgba(30, 41, 59, 0.9)",onMouseOut:i=>i.currentTarget.style.background="rgba(30, 41, 59, 0.6)",children:[e.jsx(oe,{size:18,color:"#818cf8"}),e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:"500"},children:"Profilim"})]}),e.jsxs("button",{onClick:t,style:{background:"rgba(239, 68, 68, 0.1)",border:"1px solid rgba(239, 68, 68, 0.2)",padding:"0.6rem 1.2rem",borderRadius:"12px",color:"#f87171",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s",backdropFilter:"blur(10px)"},onMouseOver:i=>{i.currentTarget.style.background="rgba(239, 68, 68, 0.2)",i.currentTarget.style.borderColor="rgba(239, 68, 68, 0.4)"},onMouseOut:i=>{i.currentTarget.style.background="rgba(239, 68, 68, 0.1)",i.currentTarget.style.borderColor="rgba(239, 68, 68, 0.2)"},children:[e.jsx(at,{size:18}),e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:"500"},children:"Çıkış"})]})]}),o&&T&&e.jsx("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem"},children:e.jsxs("div",{style:{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"24px",width:"100%",maxWidth:"450px",padding:"2.5rem",position:"relative",boxShadow:"0 25px 50px -12px rgba(0, 0, 0, 0.5)"},children:[e.jsx("button",{onClick:()=>g(!1),style:{position:"absolute",top:"1.5rem",right:"1.5rem",background:"none",border:"none",color:"#64748b",cursor:"pointer"},children:e.jsx(J,{size:24})}),e.jsxs("div",{style:{textAlign:"center",marginBottom:"2rem"},children:[e.jsx("div",{style:{width:"80px",height:"80px",background:"#6366f1",borderRadius:"24px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",boxShadow:"0 10px 15px -3px rgba(99, 102, 241, 0.4)"},children:e.jsx(oe,{size:40,color:"white"})}),e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:"bold",marginBottom:"0.5rem"},children:T.full_name||"Kullanıcı"}),e.jsx("span",{style:{background:"#0f172a",padding:"4px 12px",borderRadius:"20px",fontSize:"0.75rem",color:"#818cf8",border:"1px solid rgba(99, 102, 241, 0.2)"},children:T.role==="admin"?"Yönetici Hesabı":"Standart Hesap"})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"rgba(15, 23, 42, 0.5)",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx(it,{size:20,color:"#94a3b8"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"Firma"}),e.jsx("span",{style:{fontSize:"0.95rem"},children:T.company_name||"-"})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"rgba(15, 23, 42, 0.5)",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx(rt,{size:20,color:"#94a3b8"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"E-Posta"}),e.jsx("span",{style:{fontSize:"0.95rem"},children:T.username})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"rgba(15, 23, 42, 0.5)",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx(st,{size:20,color:"#94a3b8"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"Telefon"}),e.jsx("span",{style:{fontSize:"0.95rem"},children:T.phone_number||"-"})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(16, 185, 129, 0.2)"},children:[e.jsx(ne,{size:20,color:"#10b981"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#10b981",textTransform:"uppercase",letterSpacing:"1px"},children:"Mevcut Kredi"}),e.jsxs("span",{style:{fontSize:"1.25rem",fontWeight:"bold",color:"#10b981"},children:[T.credits," ",e.jsx("span",{style:{fontSize:"0.8rem",fontWeight:"normal"},children:"Tasarım"})]})]})]})]})]})}),e.jsx("input",{type:"file",ref:r,style:{display:"none"},accept:".xslt,.xsl,.xml",onChange:S}),e.jsxs("div",{style:{width:"100%",maxWidth:"1000px",display:"flex",flexDirection:"column",alignItems:"center"},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"3rem"},children:[e.jsx("h1",{style:{fontSize:"clamp(2.5rem, 6vw, 3.5rem)",fontWeight:"900",marginBottom:"1rem",background:"linear-gradient(135deg, #fff 0%, #94a3b8 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-1px"},children:"E-Belge Tasarımcı"}),e.jsx("p",{style:{color:"#94a3b8",fontSize:"1.1rem",maxWidth:"600px",margin:"0 auto"},children:"Yeni bir tasarım için adımları izleyin: belge türü, şablon ve veri."})]}),e.jsx(Et,{onOpen:i=>s?.(i.module_id,i.xslt_content??void 0,i.name,i.xml_content??void 0,i.id)}),e.jsx("div",{style:{width:"100%",marginBottom:"2rem"},children:e.jsx(Lt,{onFinish:i=>s?.(i.moduleId,i.xslt,i.docName,i.xml)})}),e.jsx(Rt,{}),e.jsx("button",{type:"button","data-toggle-more-options":!0,onClick:()=>h(i=>!i),style:{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:999,color:"#94a3b8",padding:"8px 18px",cursor:"pointer",fontSize:"0.85rem",marginBottom:"2rem",fontFamily:"inherit"},children:z?"Diğer seçenekleri gizle":"Diğer başlangıç seçenekleri (klasik tasarımcı, hazır şablonlar)"}),z&&e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:"24px",width:"100%",marginBottom:"4rem"},children:e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"16px",width:"100%"},children:[e.jsxs("div",{onClick:()=>r.current?.click(),style:{background:"rgba(30, 41, 59, 0.4)",border:"1px dashed rgba(255,255,255,0.1)",borderRadius:"24px",padding:"2rem",cursor:"pointer",display:"flex",flexDirection:"column",gap:"1.5rem",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",backdropFilter:"blur(10px)"},children:[e.jsx("div",{style:{width:"56px",height:"56px",background:"rgba(255,255,255,0.1)",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:"white"},children:e.jsx(U,{size:30})}),e.jsxs("div",{children:[e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:"bold",marginBottom:"0.5rem"},children:"Kendi Tasarımın"}),e.jsx("p",{style:{color:"#94a3b8",fontSize:"0.9rem",lineHeight:"1.5"},children:"Mevcut bir XSLT dosyanız mı var? Dosyanızı yükleyin ve gelişmiş görsel editörümüzle üzerinde değişiklik yapın."})]}),e.jsx("div",{style:{color:"white",fontWeight:"bold",fontSize:"0.9rem"},children:"Dosya Seç ve Yükle ›"})]}),s&&e.jsxs("div",{onClick:()=>s(),title:"XSLT Editör — Monaco + canlı preview. XSLT bilen kullanıcılar için.",style:{background:"linear-gradient(135deg, rgba(16,185,129,0.12), rgba(52,211,153,0.08))",border:"1px solid rgba(16,185,129,0.35)",borderRadius:"24px",padding:"2rem",cursor:"pointer",display:"flex",flexDirection:"column",gap:"1.5rem",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",backdropFilter:"blur(10px)",position:"relative",overflow:"hidden"},onMouseEnter:i=>{i.currentTarget.style.borderColor="rgba(16,185,129,0.7)",i.currentTarget.style.transform="translateY(-2px)",i.currentTarget.style.boxShadow="0 12px 32px rgba(16,185,129,0.18)"},onMouseLeave:i=>{i.currentTarget.style.borderColor="rgba(16,185,129,0.35)",i.currentTarget.style.transform="translateY(0)",i.currentTarget.style.boxShadow="none"},children:[e.jsx("div",{style:{position:"absolute",top:12,right:12,padding:"4px 10px",background:"linear-gradient(135deg, #10b981, #34d399)",borderRadius:"999px",fontSize:"0.65rem",fontWeight:800,letterSpacing:"1px",color:"white"},children:"BETA"}),e.jsx("div",{style:{width:"56px",height:"56px",background:"linear-gradient(135deg, #10b981, #34d399)",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:"white"},children:e.jsx(Y,{size:28})}),e.jsxs("div",{children:[e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:"bold",marginBottom:"0.5rem",color:"white"},children:"XSLT Editör"}),e.jsx("p",{style:{color:"#cbd5e1",fontSize:"0.9rem",lineHeight:"1.5"},children:"Direkt XSLT kod yaz, canlı önizle. Monaco editör (VS Code altyapısı, syntax highlight, autocomplete) + sağda anlık HTML render. PHP gibi template mantığına alışkın kullanıcılar için."})]}),e.jsx("div",{style:{color:"#6ee7b7",fontWeight:"bold",fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"6px"},children:"Kod Yazmaya Başla ›"})]})]})}),e.jsxs("div",{style:{width:"100%",marginBottom:"2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1.5rem"},children:[e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to right, transparent, rgba(255,255,255,0.1))"}}),e.jsx("span",{style:{fontSize:"0.8rem",color:"#34d399",fontWeight:"bold",textTransform:"uppercase",letterSpacing:"2px"},children:"Hazır Şablonlarla Başla · XSLT Editör"}),e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to left, transparent, rgba(255,255,255,0.1))"}})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:"14px"},children:Te.map(i=>e.jsxs("div",{onClick:()=>s?.(i.moduleId,i.xslt,i.docName),title:`${i.label} — ${i.description}`,"data-template-id":i.id,style:{padding:"14px 16px",background:"rgba(16, 185, 129, 0.06)",border:"1px solid rgba(16, 185, 129, 0.25)",borderRadius:"12px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:"12px",transition:"all 0.2s ease"},onMouseEnter:m=>{m.currentTarget.style.background="rgba(16, 185, 129, 0.12)",m.currentTarget.style.borderColor="rgba(16, 185, 129, 0.5)",m.currentTarget.style.transform="translateY(-1px)"},onMouseLeave:m=>{m.currentTarget.style.background="rgba(16, 185, 129, 0.06)",m.currentTarget.style.borderColor="rgba(16, 185, 129, 0.25)",m.currentTarget.style.transform="translateY(0)"},children:[e.jsx("div",{style:{width:"36px",height:"36px",background:i.moduleId==="arsiv"?"linear-gradient(135deg, #059669, #10b981)":"linear-gradient(135deg, #6366f1, #8b5cf6)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",color:"white",flexShrink:0},children:e.jsx(ie,{size:18})}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"},children:[e.jsx("span",{style:{fontSize:"0.95rem",fontWeight:700,color:"#e2e8f0"},children:i.label}),e.jsx("span",{style:{padding:"1px 6px",background:"rgba(52, 211, 153, 0.15)",border:"1px solid rgba(52, 211, 153, 0.3)",borderRadius:"3px",fontSize:"0.6rem",fontWeight:700,color:"#6ee7b7",letterSpacing:"0.5px",textTransform:"uppercase"},children:i.moduleId==="arsiv"?"e-Arşiv":"e-Fatura"})]}),e.jsx("div",{style:{fontSize:"0.75rem",color:"#94a3b8",lineHeight:1.4},children:i.description})]})]},i.id))})]}),e.jsxs("div",{style:{width:"100%",marginBottom:"2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1.5rem"},children:[e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to right, transparent, rgba(255,255,255,0.1))"}}),e.jsx("span",{style:{fontSize:"0.8rem",color:"#64748b",fontWeight:"bold",textTransform:"uppercase",letterSpacing:"2px"},children:"Hızlı Başlangıç Modülleri"}),e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to left, transparent, rgba(255,255,255,0.1))"}})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))",gap:"16px",width:"100%"},children:Pt.map(i=>{const m=ce(i.id);return e.jsxs("div",{title:m.description,onClick:n=>{if(!n.target.closest("[data-subbtn]"))if(i.subTypes&&i.subTypes.length>0){const j=i.subTypes[0];a(`${i.id}_${j.id}`,i.template,`${i.name} - ${j.label}`)}else a(i.id,i.template,i.name)},style:{background:"rgba(30, 41, 59, 0.2)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"16px",padding:"16px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px",transition:"all 0.2s",backdropFilter:"blur(5px)",position:"relative"},onMouseEnter:n=>{n.currentTarget.style.background="rgba(99, 102, 241, 0.1)",n.currentTarget.style.borderColor="rgba(99, 102, 241, 0.3)",n.currentTarget.style.transform="translateY(-2px)"},onMouseLeave:n=>{n.currentTarget.style.background="rgba(30, 41, 59, 0.2)",n.currentTarget.style.borderColor="rgba(255,255,255,0.05)",n.currentTarget.style.transform="translateY(0)"},children:[e.jsx("div",{style:{width:"36px",height:"36px",background:`${i.color}15`,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",color:i.color,flexShrink:0},children:i.icon}),e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:600,color:"white",flex:1,lineHeight:1.2},children:i.name}),i.subTypes&&e.jsx("div",{onClick:n=>n.stopPropagation(),style:{display:"flex",gap:4,flexShrink:0},children:i.subTypes.map(n=>e.jsx("span",{"data-subbtn":"true",role:"button",tabIndex:0,onClick:b=>{b.stopPropagation(),a(`${i.id}_${n.id}`,i.template,`${i.name} - ${n.label}`)},onKeyDown:b=>{(b.key==="Enter"||b.key===" ")&&(b.preventDefault(),b.currentTarget.click())},style:{display:"inline-flex",alignItems:"center",padding:"5px 10px",background:`${i.color}26`,border:`1px solid ${i.color}55`,borderRadius:999,color:i.color,fontSize:"0.72rem",fontWeight:700,letterSpacing:.3,cursor:"pointer",transition:"transform 0.15s, background 0.18s",userSelect:"none"},onMouseEnter:b=>{b.currentTarget.style.background=`${i.color}40`,b.currentTarget.style.transform="translateY(-1px)"},onMouseLeave:b=>{b.currentTarget.style.background=`${i.color}26`,b.currentTarget.style.transform="translateY(0)"},children:n.label},n.id))}),pe(i.id).length>0&&e.jsxs("button",{type:"button",onClick:n=>{n.stopPropagation(),u(i.id)},style:{marginTop:8,alignSelf:"flex-start",padding:"4px 10px",background:"transparent",border:`1px solid ${i.color}55`,borderRadius:999,color:i.color,fontSize:"0.68rem",fontWeight:600,letterSpacing:.3,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4,transition:"background 0.15s"},onMouseEnter:n=>{n.currentTarget.style.background=`${i.color}15`},onMouseLeave:n=>{n.currentTarget.style.background="transparent"},children:[e.jsx(Y,{size:11})," Snippet'ler"]})]},i.id)})})]})]})]}),e.jsx(We,{isOpen:v,onClose:()=>c(!1),onSuccess:i=>p(m=>m?{...m,credits:i}:null)}),d&&(()=>{const i=pe(d),m=ce(d);return e.jsx("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)",padding:"2rem"},children:e.jsxs("div",{style:{background:"linear-gradient(180deg, #020617 0%, #0a0f1f 100%)",border:"1px solid rgba(148, 163, 184, 0.14)",padding:"2rem",borderRadius:"1.25rem",maxWidth:960,width:"100%",position:"relative",boxShadow:"0 24px 60px rgba(0, 0, 0, 0.55)",maxHeight:"90vh",overflowY:"auto"},children:[e.jsx("button",{onClick:()=>{u(null),f(null)},style:{position:"absolute",top:16,right:16,background:"rgba(15, 23, 42, 0.6)",border:"1px solid rgba(148, 163, 184, 0.18)",borderRadius:999,width:32,height:32,color:"#cbd5e1",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(J,{size:16})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:16},children:[e.jsx(Y,{size:22,color:"#6366f1"}),e.jsx("h2",{style:{color:"#f8fafc",margin:0,fontSize:"1.4rem",fontWeight:800},children:"XSLT Snippet Kütüphanesi"})]}),e.jsxs("p",{style:{color:"#94a3b8",fontSize:13,margin:"0 0 16px"},children:[e.jsx("strong",{style:{color:"#a5b4fc"},children:m.description.split("—")[0].trim()})," için hazır section snippet'leri. Aşağıdaki kodları kopyalayıp Designer'da XSLT edit'ine yapıştırabilirsin."]}),i.length===0?e.jsx("div",{style:{padding:24,textAlign:"center",color:"#64748b"},children:"Bu modül için henüz snippet eklenmedi."}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:14},children:i.map(n=>e.jsxs("div",{style:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(148, 163, 184, 0.14)",borderRadius:12,padding:16},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8},children:[e.jsxs("div",{children:[e.jsx("div",{style:{color:"#f8fafc",fontWeight:700,fontSize:14},children:n.label}),e.jsx("div",{style:{color:"#94a3b8",fontSize:12,marginTop:2},children:n.description})]}),e.jsx("button",{type:"button",onClick:()=>{try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(n.code);else{const b=document.createElement("textarea");b.value=n.code,document.body.appendChild(b),b.select(),document.execCommand("copy"),document.body.removeChild(b)}f(n.id),setTimeout(()=>f(b=>b===n.id?null:b),1500)}catch(b){console.error("Kopyalama hatası:",b)}},style:{padding:"5px 12px",background:y===n.id?"rgba(16, 185, 129, 0.2)":"rgba(99, 102, 241, 0.15)",border:`1px solid ${y===n.id?"rgba(16, 185, 129, 0.5)":"rgba(99, 102, 241, 0.4)"}`,borderRadius:8,color:y===n.id?"#10b981":"#a5b4fc",cursor:"pointer",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4,fontFamily:"inherit"},children:y===n.id?e.jsxs(e.Fragment,{children:[e.jsx(ae,{size:11})," Kopyalandı"]}):e.jsxs(e.Fragment,{children:[e.jsx(lt,{size:11})," Kopyala"]})})]}),e.jsx("pre",{style:{background:"#020617",border:"1px solid rgba(148, 163, 184, 0.1)",borderRadius:8,padding:12,margin:0,color:"#a5b4fc",fontSize:11,fontFamily:"monospace",overflow:"auto",maxHeight:200,whiteSpace:"pre-wrap"},children:n.code})]},n.id))})]})})})()]})};export{Kt as Selection};
