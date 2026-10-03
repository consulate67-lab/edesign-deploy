import{a as F,j as e,u as p}from"./index-BAd2s0ys.js";import{r as o}from"./vendor-i18n-DHuaKvBu.js";import{P as R}from"./PaymentModal-B5x_dTgX.js";import{S as E,f as z,g as L,X as j,B,h as D,P as _,i as N,j as K,k as h,l as W,C as V,m as U,F as G,n as H,T as X,G as Y,o as O,p as $,q as Z,r as Q,R as q}from"./vendor-icons-B1jIovmE.js";import"./vendor-dnd-CqERqPL6.js";import"./vendor-state-DwZYYq12.js";const C={fatura:{layout:"standard",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["logo","stamp","bank","product_table","totals","notes","ettn"],defaultTemplate:"gib/v2/e-Fatura-Sablon.xslt",recommendedSample:"samples/e-Fatura-TICARI.xml",description:"e-Fatura — sıfırdan tasarlanmış minimal XSLT, 11 sütunlu ürün tablosu, ETTN satırı, sağ-alt toplamlar."},arsiv:{layout:"standard",hasSignature:!0,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["logo","stamp","bank","product_table","totals","notes","signature"],defaultTemplate:"gib/v2/e-Arsiv-Sablon.xslt",recommendedSample:"samples/e-Arsiv-TEMEL.xml",description:"e-Arşiv — sıfırdan tasarlanmış minimal XSLT, GİB uyumlu, e-imzalı."},irsaliye:{layout:"multi-section",hasSignature:!1,hasVehicle:!0,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["vehicle","driver","loading_point","unloading_point","product_table","despatch_info"],defaultTemplate:"community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt",recommendedSample:"samples/e-Irsaliye-TEMEL.xml",description:"e-İrsaliye — araç/sürücü/mal kabul yeri 3-sütunlu layout."},ihracat:{layout:"standard",hasSignature:!1,hasVehicle:!1,hasCurrency:!0,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["logo","stamp","bank","product_table","totals","customs_info","origin_country","gtip_no"],defaultTemplate:"community/IRPTeam-eFatura.xslt",recommendedSample:"samples/e-Ihracat-TEMEL.xml",description:"e-İhracat — gümrük bilgileri, menşe ülke, GTIP no, döviz."},mikro_ihracat:{layout:"compact",hasSignature:!1,hasVehicle:!1,hasCurrency:!0,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["product_table","totals","customs_info","origin_country"],defaultTemplate:"community/IRPTeam-eFatura.xslt",recommendedSample:"samples/e-Ihracat-TEMEL.xml",description:"e-Mikro İhracat — basitleştirilmiş ihracat layout."},smm:{layout:"service",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!0,hasStoppage:!0,hasPassenger:!1,hasService:!0,specialFields:["logo","stamp","bank","service_table","gross_net","vat_exemption","stoppage","identity_no"],defaultTemplate:"community/hzkucuk-eFatura-smm.xslt",recommendedSample:"samples/e-SMM-TEMEL.xml",description:"e-SMM — Serbest Meslek Makbuzu, hizmet bilgileri, BRÜT/Net ayrımı, KDV istisna, stopaj, TCKN mükellef."},mustahsil:{layout:"standard",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!0,hasStoppage:!0,hasPassenger:!1,hasService:!1,specialFields:["buyer_info","product_table","totals","stoppage","vat_exemption"],defaultTemplate:"community/hzkucuk-eFatura-mustahsil.xslt",recommendedSample:"samples/e-Mustahsil-TEMEL.xml",description:"e-Müstahsil — çiftçiden alınan zirai ürün makbuzu, KDV istisna, stopaj, TCKN müstahsil."},bilet:{layout:"multi-section",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!0,hasService:!1,specialFields:["passenger_info","voyage_info","seat_no","price","product_table"],defaultTemplate:"community/hzkucuk-eFatura-bilet.xslt",recommendedSample:"samples/e-Bilet-TEMEL.xml",description:"e-Bilet — yolcu/sefer/koltuk bilgili ulaşım bileti."},makbuz:{layout:"compact",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!0,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["payment_info","totals","vat_exemption","receipt_line"],defaultTemplate:"community/hzkucuk-eFatura-makbuz.xslt",recommendedSample:"samples/e-Makbuz-TEMEL.xml",description:"e-Makbuz — Receipt (UBL-TR özelleştirmesi), basit ödeme makbuzu, KDV istisna destekli."}};function A(s){return C[s]||C.fatura}const J=[{id:"signature-basic",label:"İmza Alanı (Basit)",description:"Satıcı + alıcı imza placeholder'ı. Genel fatura için.",category:"signature",appliesTo:["fatura","arsiv","smm","mustahsil","makbuz"],code:`
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
</div>`}];function M(s){return J.filter(m=>m.appliesTo.includes(s))}const ee=`<?xml version="1.0" encoding="UTF-8"?>
<!--
  XSLT Editor — Hello World şablonu
  Bu şablon XSLT öğrenmek için en basit başlangıç noktasıdır.
  Herhangi bir XML girişi "Merhaba Dünya!" çıktısı verir.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes"/>

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
</xsl:stylesheet>`,te=`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Atlas Minimal Fatura — sadece başlık ve toplam.
  Eklenecek: müşteri/tedarikçi kartı, ürün tablosu, KDV detayı.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes"/>

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
            <xsl:value-of select="format-number(//cbc:PayableAmount, '#,##0.00', 'tr_TR')"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="//cbc:DocumentCurrencyCode"/>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`,ae=`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Atlas Standart Fatura — 2 taraf (gönderen/alıcı) + ürün tablosu + KDV toplamı.
  Genişletilebilir: banka bilgisi, imza, KDV detay tablosu.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes"/>

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
                  <xsl:value-of select="format-number(cac:Price/cbc:PriceAmount, '#,##0.00', 'tr_TR')"/>
                </td>
                <td class="num">
                  <xsl:value-of select="format-number(cbc:LineExtensionAmount, '#,##0.00', 'tr_TR')"/>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>

        <!-- Toplamlar -->
        <div class="totals">
          <div>Ara Toplam: <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount, '#,##0.00', 'tr_TR')"/></div>
          <div>KDV: <xsl:value-of select="format-number(sum(//cac:TaxTotal/cbc:TaxAmount), '#,##0.00', 'tr_TR')"/></div>
          <div class="grand-total">
            GENEL TOPLAM: <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:PayableAmount, '#,##0.00', 'tr_TR')"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="//cbc:DocumentCurrencyCode"/>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`,ie=`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Atlas Minimal e-Arşiv — e-Arşiv faturaları için basit yapı.
  e-Arşiv genelde internet satışı için, müşteri bilgisi daha az detaylı olabilir.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes"/>

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
            <xsl:value-of select="format-number(//cbc:PayableAmount, '#,##0.00', 'tr_TR')"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="//cbc:DocumentCurrencyCode"/>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`,re=`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Atlas Standart e-Arşiv — müşteri kartı + ürün tablosu + toplam.
  E-Fatura'dan farkı: renk şeması yeşil (e-Arşiv) + başlık "e-Arşiv".
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <xsl:output method="html" version="4.01" encoding="UTF-8" indent="yes"/>

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
                <td class="num"><xsl:value-of select="format-number(cac:Price/cbc:PriceAmount, '#,##0.00', 'tr_TR')"/></td>
                <td class="num"><xsl:value-of select="format-number(cbc:LineExtensionAmount, '#,##0.00', 'tr_TR')"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>

        <div class="totals">
          <div>Ara Toplam: <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount, '#,##0.00', 'tr_TR')"/></div>
          <div>KDV: <xsl:value-of select="format-number(sum(//cac:TaxTotal/cbc:TaxAmount), '#,##0.00', 'tr_TR')"/></div>
          <div class="grand-total">
            GENEL TOPLAM: <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:PayableAmount, '#,##0.00', 'tr_TR')"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="//cbc:DocumentCurrencyCode"/>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`,se=[{id:"hello-world",label:"Hello World",description:`En basit — XSLT öğrenmek için başlangıç. Herhangi bir XML'i "Merhaba Dünya" çıktısına dönüştürür.`,moduleId:"fatura",docName:"Hello World",xslt:ee},{id:"fatura-minimal",label:"Minimal e-Fatura",description:"Sadece başlık ve toplam — basit başlangıç için. Genişletilebilir.",moduleId:"fatura",docName:"Atlas Minimal Fatura",xslt:te},{id:"fatura-standart",label:"Standart e-Fatura",description:"Tam yapı: Gönderen/Alıcı kartları + ürün tablosu + KDV + genel toplam. Mavi renk şeması.",moduleId:"fatura",docName:"Atlas Standart Fatura",xslt:ae},{id:"arsiv-minimal",label:"Minimal e-Arşiv",description:"e-Arşiv için basit yapı — yeşil renk şeması.",moduleId:"arsiv",docName:"Atlas Minimal Arşiv",xslt:ie},{id:"arsiv-standart",label:"Standart e-Arşiv",description:"e-Arşiv tam yapı: satıcı/müşteri + tablo + toplam. Yeşil renk şeması.",moduleId:"arsiv",docName:"Atlas Standart Arşiv",xslt:re}],le=[{id:"fatura",name:"e-Fatura",icon:e.jsx(G,{size:24}),color:"#6366f1",template:"gib/v2/e-Fatura-Sablon.xslt"},{id:"arsiv",name:"e-Arşiv",icon:e.jsx(H,{size:24}),color:"#10b981",template:"gib/v2/e-Arsiv-Sablon.xslt"},{id:"irsaliye",name:"e-İrsaliye",icon:e.jsx(X,{size:24}),color:"#0ea5e9",template:"community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt"},{id:"ihracat",name:"e-İhracat",icon:e.jsx(Y,{size:24}),color:"#8b5cf6",template:"community/IRPTeam-eFatura.xslt"},{id:"mikro_ihracat",name:"e-Mikro İhracat",icon:e.jsx(O,{size:24}),color:"#a855f7",template:"community/IRPTeam-eFatura.xslt"},{id:"smm",name:"e-SMM (Serbest Meslek)",icon:e.jsx($,{size:24}),color:"#14b8a6",template:"community/hzkucuk-eFatura-smm.xslt"},{id:"mustahsil",name:"e-Müstahsil Makbuzu",icon:e.jsx(Z,{size:24}),color:"#84cc16",template:"community/hzkucuk-eFatura-mustahsil.xslt"},{id:"bilet",name:"e-Bilet",icon:e.jsx(Q,{size:24}),color:"#f97316",template:"community/hzkucuk-eFatura-bilet.xslt"},{id:"makbuz",name:"e-Makbuz",icon:e.jsx(q,{size:24}),color:"#06b6d4",template:"community/hzkucuk-eFatura-makbuz.xslt"}],xe=({onSelect:s,onLogout:m,onSelectXsltEditor:x})=>{const y=o.useRef(null),[w,v]=o.useState(!1),[I,k]=o.useState(!1),[g,T]=o.useState(null),[n,u]=o.useState(null),[l,S]=o.useState(null);o.useEffect(()=>{F.getMe().then(S).catch(console.error)},[]);const P=t=>{const r=t.target.files?.[0];if(!r)return;const a=5*1024*1024;if(r.size>a){p.getState().pushToast({kind:"error",title:"Dosya çok büyük",description:`Maksimum 5 MB. Seçilen dosya: ${(r.size/1024/1024).toFixed(1)} MB`}),t.target.value="";return}const i=[".xslt",".xsl",".xml"],d=r.name.toLowerCase();if(!i.some(b=>d.endsWith(b))){p.getState().pushToast({kind:"error",title:"Geçersiz dosya tipi",description:"Yalnızca .xslt, .xsl veya .xml dosyaları kabul edilir."}),t.target.value="";return}const c=new FileReader;c.onload=b=>{const f=b.target?.result;if(!f||!f.trim().startsWith("<")){p.getState().pushToast({kind:"error",title:"Geçersiz XSLT içeriği",description:"Dosya XML/XSLT olarak okunamadı."}),t.target.value="";return}s("custom",r.name,"Özel Belge",f)},c.onerror=()=>{p.getState().pushToast({kind:"error",title:"Dosya okunamadı",description:c.error?.message??"Bilinmeyen hata"}),t.target.value=""},c.readAsText(r)};return e.jsxs("div",{style:{minHeight:"100vh",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0f172a",fontFamily:"Inter, sans-serif",color:"white",padding:"2rem",boxSizing:"border-box",position:"relative"},children:[e.jsxs("div",{style:{position:"absolute",top:"2rem",right:"2rem",display:"flex",gap:"1rem",zIndex:50},children:[e.jsxs("button",{onClick:()=>k(!0),style:{background:"linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",border:"none",padding:"0.6rem 1.4rem",borderRadius:"12px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s",boxShadow:"0 4px 15px rgba(99, 102, 241, 0.3)",fontWeight:"bold"},onMouseOver:t=>t.currentTarget.style.transform="translateY(-2px)",onMouseOut:t=>t.currentTarget.style.transform="translateY(0)",children:[e.jsx(E,{size:18}),e.jsx("span",{style:{fontSize:"0.9rem"},children:"Paket Al"})]}),e.jsxs("button",{onClick:()=>v(!0),style:{background:"rgba(30, 41, 59, 0.6)",border:"1px solid rgba(255,255,255,0.1)",padding:"0.6rem 1.2rem",borderRadius:"12px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s",backdropFilter:"blur(10px)"},onMouseOver:t=>t.currentTarget.style.background="rgba(30, 41, 59, 0.9)",onMouseOut:t=>t.currentTarget.style.background="rgba(30, 41, 59, 0.6)",children:[e.jsx(z,{size:18,color:"#818cf8"}),e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:"500"},children:"Profilim"})]}),e.jsxs("button",{onClick:m,style:{background:"rgba(239, 68, 68, 0.1)",border:"1px solid rgba(239, 68, 68, 0.2)",padding:"0.6rem 1.2rem",borderRadius:"12px",color:"#f87171",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s",backdropFilter:"blur(10px)"},onMouseOver:t=>{t.currentTarget.style.background="rgba(239, 68, 68, 0.2)",t.currentTarget.style.borderColor="rgba(239, 68, 68, 0.4)"},onMouseOut:t=>{t.currentTarget.style.background="rgba(239, 68, 68, 0.1)",t.currentTarget.style.borderColor="rgba(239, 68, 68, 0.2)"},children:[e.jsx(L,{size:18}),e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:"500"},children:"Çıkış"})]})]}),w&&l&&e.jsx("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem"},children:e.jsxs("div",{style:{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"24px",width:"100%",maxWidth:"450px",padding:"2.5rem",position:"relative",boxShadow:"0 25px 50px -12px rgba(0, 0, 0, 0.5)"},children:[e.jsx("button",{onClick:()=>v(!1),style:{position:"absolute",top:"1.5rem",right:"1.5rem",background:"none",border:"none",color:"#64748b",cursor:"pointer"},children:e.jsx(j,{size:24})}),e.jsxs("div",{style:{textAlign:"center",marginBottom:"2rem"},children:[e.jsx("div",{style:{width:"80px",height:"80px",background:"#6366f1",borderRadius:"24px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",boxShadow:"0 10px 15px -3px rgba(99, 102, 241, 0.4)"},children:e.jsx(z,{size:40,color:"white"})}),e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:"bold",marginBottom:"0.5rem"},children:l.full_name||"Kullanıcı"}),e.jsx("span",{style:{background:"#0f172a",padding:"4px 12px",borderRadius:"20px",fontSize:"0.75rem",color:"#818cf8",border:"1px solid rgba(99, 102, 241, 0.2)"},children:l.role==="admin"?"Yönetici Hesabı":"Standart Hesap"})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"rgba(15, 23, 42, 0.5)",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx(B,{size:20,color:"#94a3b8"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"Firma"}),e.jsx("span",{style:{fontSize:"0.95rem"},children:l.company_name||"-"})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"rgba(15, 23, 42, 0.5)",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx(D,{size:20,color:"#94a3b8"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"E-Posta"}),e.jsx("span",{style:{fontSize:"0.95rem"},children:l.username})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"rgba(15, 23, 42, 0.5)",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx(_,{size:20,color:"#94a3b8"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"Telefon"}),e.jsx("span",{style:{fontSize:"0.95rem"},children:l.phone_number||"-"})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(16, 185, 129, 0.2)"},children:[e.jsx(N,{size:20,color:"#10b981"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#10b981",textTransform:"uppercase",letterSpacing:"1px"},children:"Mevcut Kredi"}),e.jsxs("span",{style:{fontSize:"1.25rem",fontWeight:"bold",color:"#10b981"},children:[l.credits," ",e.jsx("span",{style:{fontSize:"0.8rem",fontWeight:"normal"},children:"Tasarım"})]})]})]})]})]})}),e.jsx("input",{type:"file",ref:y,style:{display:"none"},accept:".xslt,.xsl,.xml",onChange:P}),e.jsxs("div",{style:{width:"100%",maxWidth:"1000px",display:"flex",flexDirection:"column",alignItems:"center"},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"3rem"},children:[e.jsx("h1",{style:{fontSize:"clamp(2.5rem, 6vw, 3.5rem)",fontWeight:"900",marginBottom:"1rem",background:"linear-gradient(135deg, #fff 0%, #94a3b8 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-1px"},children:"E-Belge Tasarımcı"}),e.jsx("p",{style:{color:"#94a3b8",fontSize:"1.1rem",maxWidth:"600px"},children:"Türkiyenın en gelişmiş e-belge tasarım platformuna hoş geldiniz. Hazır şablonlarla başlayın veya kendi tasarımınızı oluşturun."})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:"24px",width:"100%",marginBottom:"4rem"},children:e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"16px",width:"100%"},children:[e.jsxs("div",{onClick:()=>y.current?.click(),style:{background:"rgba(30, 41, 59, 0.4)",border:"1px dashed rgba(255,255,255,0.1)",borderRadius:"24px",padding:"2rem",cursor:"pointer",display:"flex",flexDirection:"column",gap:"1.5rem",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",backdropFilter:"blur(10px)"},children:[e.jsx("div",{style:{width:"56px",height:"56px",background:"rgba(255,255,255,0.1)",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:"white"},children:e.jsx(K,{size:30})}),e.jsxs("div",{children:[e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:"bold",marginBottom:"0.5rem"},children:"Kendi Tasarımın"}),e.jsx("p",{style:{color:"#94a3b8",fontSize:"0.9rem",lineHeight:"1.5"},children:"Mevcut bir XSLT dosyanız mı var? Dosyanızı yükleyin ve gelişmiş görsel editörümüzle üzerinde değişiklik yapın."})]}),e.jsx("div",{style:{color:"white",fontWeight:"bold",fontSize:"0.9rem"},children:"Dosya Seç ve Yükle ›"})]}),x&&e.jsxs("div",{onClick:()=>x(),title:"XSLT Editör — Monaco + canlı preview. XSLT bilen kullanıcılar için.",style:{background:"linear-gradient(135deg, rgba(16,185,129,0.12), rgba(52,211,153,0.08))",border:"1px solid rgba(16,185,129,0.35)",borderRadius:"24px",padding:"2rem",cursor:"pointer",display:"flex",flexDirection:"column",gap:"1.5rem",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",backdropFilter:"blur(10px)",position:"relative",overflow:"hidden"},onMouseEnter:t=>{t.currentTarget.style.borderColor="rgba(16,185,129,0.7)",t.currentTarget.style.transform="translateY(-2px)",t.currentTarget.style.boxShadow="0 12px 32px rgba(16,185,129,0.18)"},onMouseLeave:t=>{t.currentTarget.style.borderColor="rgba(16,185,129,0.35)",t.currentTarget.style.transform="translateY(0)",t.currentTarget.style.boxShadow="none"},children:[e.jsx("div",{style:{position:"absolute",top:12,right:12,padding:"4px 10px",background:"linear-gradient(135deg, #10b981, #34d399)",borderRadius:"999px",fontSize:"0.65rem",fontWeight:800,letterSpacing:"1px",color:"white"},children:"BETA"}),e.jsx("div",{style:{width:"56px",height:"56px",background:"linear-gradient(135deg, #10b981, #34d399)",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:"white"},children:e.jsx(h,{size:28})}),e.jsxs("div",{children:[e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:"bold",marginBottom:"0.5rem",color:"white"},children:"XSLT Editör"}),e.jsx("p",{style:{color:"#cbd5e1",fontSize:"0.9rem",lineHeight:"1.5"},children:"Direkt XSLT kod yaz, canlı önizle. Monaco editör (VS Code altyapısı, syntax highlight, autocomplete) + sağda anlık HTML render. PHP gibi template mantığına alışkın kullanıcılar için."})]}),e.jsx("div",{style:{color:"#6ee7b7",fontWeight:"bold",fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"6px"},children:"Kod Yazmaya Başla ›"})]})]})}),e.jsxs("div",{style:{width:"100%",marginBottom:"2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1.5rem"},children:[e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to right, transparent, rgba(255,255,255,0.1))"}}),e.jsx("span",{style:{fontSize:"0.8rem",color:"#34d399",fontWeight:"bold",textTransform:"uppercase",letterSpacing:"2px"},children:"Hazır Şablonlarla Başla · XSLT Editör"}),e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to left, transparent, rgba(255,255,255,0.1))"}})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:"14px"},children:se.map(t=>e.jsxs("div",{onClick:()=>x?.(t.moduleId,t.xslt,t.docName),title:`${t.label} — ${t.description}`,"data-template-id":t.id,style:{padding:"14px 16px",background:"rgba(16, 185, 129, 0.06)",border:"1px solid rgba(16, 185, 129, 0.25)",borderRadius:"12px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:"12px",transition:"all 0.2s ease"},onMouseEnter:r=>{r.currentTarget.style.background="rgba(16, 185, 129, 0.12)",r.currentTarget.style.borderColor="rgba(16, 185, 129, 0.5)",r.currentTarget.style.transform="translateY(-1px)"},onMouseLeave:r=>{r.currentTarget.style.background="rgba(16, 185, 129, 0.06)",r.currentTarget.style.borderColor="rgba(16, 185, 129, 0.25)",r.currentTarget.style.transform="translateY(0)"},children:[e.jsx("div",{style:{width:"36px",height:"36px",background:t.moduleId==="arsiv"?"linear-gradient(135deg, #059669, #10b981)":"linear-gradient(135deg, #6366f1, #8b5cf6)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",color:"white",flexShrink:0},children:e.jsx(W,{size:18})}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"},children:[e.jsx("span",{style:{fontSize:"0.95rem",fontWeight:700,color:"#e2e8f0"},children:t.label}),e.jsx("span",{style:{padding:"1px 6px",background:"rgba(52, 211, 153, 0.15)",border:"1px solid rgba(52, 211, 153, 0.3)",borderRadius:"3px",fontSize:"0.6rem",fontWeight:700,color:"#6ee7b7",letterSpacing:"0.5px",textTransform:"uppercase"},children:t.moduleId==="arsiv"?"e-Arşiv":"e-Fatura"})]}),e.jsx("div",{style:{fontSize:"0.75rem",color:"#94a3b8",lineHeight:1.4},children:t.description})]})]},t.id))})]}),e.jsxs("div",{style:{width:"100%",marginBottom:"2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1.5rem"},children:[e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to right, transparent, rgba(255,255,255,0.1))"}}),e.jsx("span",{style:{fontSize:"0.8rem",color:"#64748b",fontWeight:"bold",textTransform:"uppercase",letterSpacing:"2px"},children:"Hızlı Başlangıç Modülleri"}),e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to left, transparent, rgba(255,255,255,0.1))"}})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))",gap:"16px",width:"100%"},children:le.map(t=>{const r=A(t.id);return e.jsxs("div",{title:r.description,onClick:a=>{if(!a.target.closest("[data-subbtn]"))if(t.subTypes&&t.subTypes.length>0){const d=t.subTypes[0];s(`${t.id}_${d.id}`,t.template,`${t.name} - ${d.label}`)}else s(t.id,t.template,t.name)},style:{background:"rgba(30, 41, 59, 0.2)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"16px",padding:"16px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px",transition:"all 0.2s",backdropFilter:"blur(5px)",position:"relative"},onMouseEnter:a=>{a.currentTarget.style.background="rgba(99, 102, 241, 0.1)",a.currentTarget.style.borderColor="rgba(99, 102, 241, 0.3)",a.currentTarget.style.transform="translateY(-2px)"},onMouseLeave:a=>{a.currentTarget.style.background="rgba(30, 41, 59, 0.2)",a.currentTarget.style.borderColor="rgba(255,255,255,0.05)",a.currentTarget.style.transform="translateY(0)"},children:[e.jsx("div",{style:{width:"36px",height:"36px",background:`${t.color}15`,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",color:t.color,flexShrink:0},children:t.icon}),e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:600,color:"white",flex:1,lineHeight:1.2},children:t.name}),t.subTypes&&e.jsx("div",{onClick:a=>a.stopPropagation(),style:{display:"flex",gap:4,flexShrink:0},children:t.subTypes.map(a=>e.jsx("span",{"data-subbtn":"true",role:"button",tabIndex:0,onClick:i=>{i.stopPropagation(),s(`${t.id}_${a.id}`,t.template,`${t.name} - ${a.label}`)},onKeyDown:i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),i.currentTarget.click())},style:{display:"inline-flex",alignItems:"center",padding:"5px 10px",background:`${t.color}26`,border:`1px solid ${t.color}55`,borderRadius:999,color:t.color,fontSize:"0.72rem",fontWeight:700,letterSpacing:.3,cursor:"pointer",transition:"transform 0.15s, background 0.18s",userSelect:"none"},onMouseEnter:i=>{i.currentTarget.style.background=`${t.color}40`,i.currentTarget.style.transform="translateY(-1px)"},onMouseLeave:i=>{i.currentTarget.style.background=`${t.color}26`,i.currentTarget.style.transform="translateY(0)"},children:a.label},a.id))}),M(t.id).length>0&&e.jsxs("button",{type:"button",onClick:a=>{a.stopPropagation(),T(t.id)},style:{marginTop:8,alignSelf:"flex-start",padding:"4px 10px",background:"transparent",border:`1px solid ${t.color}55`,borderRadius:999,color:t.color,fontSize:"0.68rem",fontWeight:600,letterSpacing:.3,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4,transition:"background 0.15s"},onMouseEnter:a=>{a.currentTarget.style.background=`${t.color}15`},onMouseLeave:a=>{a.currentTarget.style.background="transparent"},children:[e.jsx(h,{size:11})," Snippet'ler"]})]},t.id)})})]})]}),e.jsx(R,{isOpen:I,onClose:()=>k(!1),onSuccess:t=>S(r=>r?{...r,credits:t}:null)}),g&&(()=>{const t=M(g),r=A(g);return e.jsx("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)",padding:"2rem"},children:e.jsxs("div",{style:{background:"linear-gradient(180deg, #020617 0%, #0a0f1f 100%)",border:"1px solid rgba(148, 163, 184, 0.14)",padding:"2rem",borderRadius:"1.25rem",maxWidth:960,width:"100%",position:"relative",boxShadow:"0 24px 60px rgba(0, 0, 0, 0.55)",maxHeight:"90vh",overflowY:"auto"},children:[e.jsx("button",{onClick:()=>{T(null),u(null)},style:{position:"absolute",top:16,right:16,background:"rgba(15, 23, 42, 0.6)",border:"1px solid rgba(148, 163, 184, 0.18)",borderRadius:999,width:32,height:32,color:"#cbd5e1",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(j,{size:16})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:16},children:[e.jsx(h,{size:22,color:"#6366f1"}),e.jsx("h2",{style:{color:"#f8fafc",margin:0,fontSize:"1.4rem",fontWeight:800},children:"XSLT Snippet Kütüphanesi"})]}),e.jsxs("p",{style:{color:"#94a3b8",fontSize:13,margin:"0 0 16px"},children:[e.jsx("strong",{style:{color:"#a5b4fc"},children:r.description.split("—")[0].trim()})," için hazır section snippet'leri. Aşağıdaki kodları kopyalayıp Designer'da XSLT edit'ine yapıştırabilirsin."]}),t.length===0?e.jsx("div",{style:{padding:24,textAlign:"center",color:"#64748b"},children:"Bu modül için henüz snippet eklenmedi."}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:14},children:t.map(a=>e.jsxs("div",{style:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(148, 163, 184, 0.14)",borderRadius:12,padding:16},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8},children:[e.jsxs("div",{children:[e.jsx("div",{style:{color:"#f8fafc",fontWeight:700,fontSize:14},children:a.label}),e.jsx("div",{style:{color:"#94a3b8",fontSize:12,marginTop:2},children:a.description})]}),e.jsx("button",{type:"button",onClick:()=>{try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(a.code);else{const i=document.createElement("textarea");i.value=a.code,document.body.appendChild(i),i.select(),document.execCommand("copy"),document.body.removeChild(i)}u(a.id),setTimeout(()=>u(i=>i===a.id?null:i),1500)}catch(i){console.error("Kopyalama hatası:",i)}},style:{padding:"5px 12px",background:n===a.id?"rgba(16, 185, 129, 0.2)":"rgba(99, 102, 241, 0.15)",border:`1px solid ${n===a.id?"rgba(16, 185, 129, 0.5)":"rgba(99, 102, 241, 0.4)"}`,borderRadius:8,color:n===a.id?"#10b981":"#a5b4fc",cursor:"pointer",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4,fontFamily:"inherit"},children:n===a.id?e.jsxs(e.Fragment,{children:[e.jsx(V,{size:11})," Kopyalandı"]}):e.jsxs(e.Fragment,{children:[e.jsx(U,{size:11})," Kopyala"]})})]}),e.jsx("pre",{style:{background:"#020617",border:"1px solid rgba(148, 163, 184, 0.1)",borderRadius:8,padding:12,margin:0,color:"#a5b4fc",fontSize:11,fontFamily:"monospace",overflow:"auto",maxHeight:200,whiteSpace:"pre-wrap"},children:a.code})]},a.id))})]})})})()]})};export{xe as Selection};
