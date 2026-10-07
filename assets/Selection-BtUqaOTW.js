import{_ as G,j as e,d as Te,a as V,u as D}from"./index-QBcOyH0W.js";import{r as u,R as Se}from"./vendor-i18n-D1UrcLFy.js";import{P as ze}from"./PaymentModal-DgeREYOt.js";import{h as je,s as we,a as Ae}from"./testWatermark-DWeGV28F.js";import{F as ce,C as H,e as N,D as Ce,b as Ie,f as pe,A as Me,g as Y,T as Le,h as Re,i as Ee,j as Fe,k as Pe,P as Be,l as J,S as De,m as ee,n as _e,X as te,B as Xe,o as Ne,p as We,q as K,r as $e,s as Oe,t as Ke,G as Ue,u as Ve,v as Ge,w as He,x as Ye,R as Ze}from"./vendor-icons-DJI9x8Yr.js";import"./vendor-dnd-f4m_iXKM.js";import"./vendor-state-LLmneBlK.js";const ae={fatura:{layout:"standard",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["logo","stamp","bank","product_table","totals","notes","ettn"],defaultTemplate:"gib/v2/e-Fatura-Sablon.xslt",recommendedSample:"samples/e-Fatura-TICARI.xml",description:"e-Fatura — sıfırdan tasarlanmış minimal XSLT, 11 sütunlu ürün tablosu, ETTN satırı, sağ-alt toplamlar."},arsiv:{layout:"standard",hasSignature:!0,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["logo","stamp","bank","product_table","totals","notes","signature"],defaultTemplate:"gib/v2/e-Arsiv-Sablon.xslt",recommendedSample:"samples/e-Arsiv-TEMEL.xml",description:"e-Arşiv — sıfırdan tasarlanmış minimal XSLT, GİB uyumlu, e-imzalı."},irsaliye:{layout:"multi-section",hasSignature:!1,hasVehicle:!0,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["vehicle","driver","loading_point","unloading_point","product_table","despatch_info"],defaultTemplate:"community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt",recommendedSample:"samples/e-Irsaliye-TEMEL.xml",description:"e-İrsaliye — araç/sürücü/mal kabul yeri 3-sütunlu layout."},ihracat:{layout:"standard",hasSignature:!1,hasVehicle:!1,hasCurrency:!0,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["logo","stamp","bank","product_table","totals","customs_info","origin_country","gtip_no"],defaultTemplate:"community/IRPTeam-eFatura.xslt",recommendedSample:"samples/e-Ihracat-TEMEL.xml",description:"e-İhracat — gümrük bilgileri, menşe ülke, GTIP no, döviz."},mikro_ihracat:{layout:"compact",hasSignature:!1,hasVehicle:!1,hasCurrency:!0,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["product_table","totals","customs_info","origin_country"],defaultTemplate:"community/IRPTeam-eFatura.xslt",recommendedSample:"samples/e-Ihracat-TEMEL.xml",description:"e-Mikro İhracat — basitleştirilmiş ihracat layout."},smm:{layout:"service",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!0,hasStoppage:!0,hasPassenger:!1,hasService:!0,specialFields:["logo","stamp","bank","service_table","gross_net","vat_exemption","stoppage","identity_no"],defaultTemplate:"community/hzkucuk-eFatura-smm.xslt",recommendedSample:"samples/e-SMM-TEMEL.xml",description:"e-SMM — Serbest Meslek Makbuzu, hizmet bilgileri, BRÜT/Net ayrımı, KDV istisna, stopaj, TCKN mükellef."},mustahsil:{layout:"standard",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!0,hasStoppage:!0,hasPassenger:!1,hasService:!1,specialFields:["buyer_info","product_table","totals","stoppage","vat_exemption"],defaultTemplate:"community/hzkucuk-eFatura-mustahsil.xslt",recommendedSample:"samples/e-Mustahsil-TEMEL.xml",description:"e-Müstahsil — çiftçiden alınan zirai ürün makbuzu, KDV istisna, stopaj, TCKN müstahsil."},bilet:{layout:"multi-section",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!0,hasService:!1,specialFields:["passenger_info","voyage_info","seat_no","price","product_table"],defaultTemplate:"community/hzkucuk-eFatura-bilet.xslt",recommendedSample:"samples/e-Bilet-TEMEL.xml",description:"e-Bilet — yolcu/sefer/koltuk bilgili ulaşım bileti."},makbuz:{layout:"compact",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!0,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["payment_info","totals","vat_exemption","receipt_line"],defaultTemplate:"community/hzkucuk-eFatura-makbuz.xslt",recommendedSample:"samples/e-Makbuz-TEMEL.xml",description:"e-Makbuz — Receipt (UBL-TR özelleştirmesi), basit ödeme makbuzu, KDV istisna destekli."}};function ie(i){return ae[i]||ae.fatura}const Qe=[{id:"signature-basic",label:"İmza Alanı (Basit)",description:"Satıcı + alıcı imza placeholder'ı. Genel fatura için.",category:"signature",appliesTo:["fatura","arsiv","smm","mustahsil","makbuz"],code:`
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
</div>`}];function re(i){return Qe.filter(t=>t.appliesTo.includes(i))}const qe=`<?xml version="1.0" encoding="UTF-8"?>
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
</xsl:stylesheet>`,Je=`<?xml version="1.0" encoding="UTF-8"?>
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
</xsl:stylesheet>`,et=`<?xml version="1.0" encoding="UTF-8"?>
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
</xsl:stylesheet>`,tt=`<?xml version="1.0" encoding="UTF-8"?>
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
</xsl:stylesheet>`,at=`<?xml version="1.0" encoding="UTF-8"?>
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
</xsl:stylesheet>`,me=[{id:"hello-world",label:"Hello World",description:`En basit — XSLT öğrenmek için başlangıç. Herhangi bir XML'i "Merhaba Dünya" çıktısına dönüştürür.`,moduleId:"fatura",docName:"Hello World",xslt:qe},{id:"fatura-minimal",label:"Minimal e-Fatura",description:"Sadece başlık ve toplam — basit başlangıç için. Genişletilebilir.",moduleId:"fatura",docName:"Atlas Minimal Fatura",xslt:Je},{id:"fatura-standart",label:"Standart e-Fatura",description:"Tam yapı: Gönderen/Alıcı kartları + ürün tablosu + KDV + genel toplam. Mavi renk şeması.",moduleId:"fatura",docName:"Atlas Standart Fatura",xslt:et},{id:"arsiv-minimal",label:"Minimal e-Arşiv",description:"e-Arşiv için basit yapı — yeşil renk şeması.",moduleId:"arsiv",docName:"Atlas Minimal Arşiv",xslt:tt},{id:"arsiv-standart",label:"Standart e-Arşiv",description:"e-Arşiv tam yapı: satıcı/müşteri + tablo + toplam. Yeşil renk şeması.",moduleId:"arsiv",docName:"Atlas Standart Arşiv",xslt:at}],it=Object.freeze(Object.defineProperty({__proto__:null,TEMPLATES:me},Symbol.toStringTag,{value:"Module"})),C={invoice:{root:"Invoice",ns:"urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",label:"Fatura (Invoice)"},despatch:{root:"DespatchAdvice",ns:"urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2",label:"İrsaliye (DespatchAdvice)"},receipt:{root:"Receipt",ns:"urn:oasis:names:specification:ubl:schema:xsd:Receipt-2",label:"Makbuz (Receipt)"}},M=i=>async()=>(await G(async()=>{const{getInlineXslt:t}=await import("./xsltContent-DSdp148c.js");return{getInlineXslt:t}},[])).getInlineXslt(i)??"",se=i=>async()=>(await G(async()=>{const{getAntrepoTemplateById:t}=await import("./antrepoTemplates-CDmg9PGA.js");return{getAntrepoTemplateById:t}},[])).getAntrepoTemplateById(i)?.xslt??"",_=i=>async()=>(await G(async()=>{const{TEMPLATES:t}=await Promise.resolve().then(()=>it);return{TEMPLATES:t}},void 0)).TEMPLATES.find(t=>t.id===i)?.xslt??"",ue=[{id:"fatura",label:"e-Fatura",description:"Temel / Ticari e-Fatura",color:"#6366f1",family:"invoice",profileIds:["TEMELFATURA","TICARIFATURA","KAMU"],sampleXml:"ebelge/samples/e-Fatura-TEMEL.xml",defaults:[{id:"gib-fatura",label:"GİB e-Fatura Şablonu",description:"Sade, resmi görünüm",moduleId:"fatura",load:M("gib/v2/e-Fatura-Sablon.xslt")},{id:"antrepo-fatura",label:"Antrepo e-Fatura",description:"Logolu, banka bilgili profesyonel şablon",moduleId:"antrepo-fatura",load:se("antrepo-fatura")},{id:"fatura-standart",label:"Standart Fatura",description:"Satır tablosu ve toplamlar",moduleId:"fatura",load:_("fatura-standart")},{id:"fatura-minimal",label:"Minimal Fatura",description:"Az alanlı, sade başlangıç",moduleId:"fatura",load:_("fatura-minimal")}]},{id:"arsiv",label:"e-Arşiv",description:"e-Arşiv Fatura",color:"#10b981",family:"invoice",profileIds:["EARSIVFATURA"],sampleXml:"ebelge/samples/e-Arsiv-TEMEL.xml",defaults:[{id:"gib-arsiv",label:"GİB e-Arşiv Şablonu",description:"Sade, resmi görünüm",moduleId:"arsiv",load:M("gib/v2/e-Arsiv-Sablon.xslt")},{id:"antrepo-arsiv",label:"Antrepo e-Arşiv",description:"Logolu profesyonel şablon",moduleId:"antrepo-arsiv",load:se("antrepo-arsiv")},{id:"arsiv-standart",label:"Standart e-Arşiv",description:"Satır tablosu ve toplamlar",moduleId:"arsiv",load:_("arsiv-standart")},{id:"arsiv-minimal",label:"Minimal e-Arşiv",description:"Az alanlı, sade başlangıç",moduleId:"arsiv",load:_("arsiv-minimal")}]},{id:"irsaliye",label:"e-İrsaliye",description:"Sevk irsaliyesi",color:"#0ea5e9",family:"despatch",sampleXml:"ebelge/samples/e-Irsaliye-TEMEL.xml",defaults:[{id:"irsaliye",label:"e-İrsaliye Şablonu",description:"Araç / sürücü / teslimat bilgili",moduleId:"irsaliye",load:M("community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt")}]},{id:"ihracat",label:"e-İhracat",description:"İhracat faturası",color:"#8b5cf6",family:"invoice",profileIds:["IHRACAT"],sampleXml:"ebelge/samples/e-Ihracat-TEMEL.xml",defaults:[{id:"ihracat",label:"e-İhracat Şablonu",description:"Teslim şartı ve GTİP alanlı",moduleId:"ihracat",load:M("community/IRPTeam-eFatura.xslt")}]},{id:"smm",label:"e-SMM",description:"Serbest meslek makbuzu",color:"#14b8a6",family:"invoice",sampleXml:"ebelge/samples/e-SMM-TEMEL.xml",defaults:[{id:"smm",label:"e-SMM Şablonu",description:"Stopaj ve hizmet bilgili",moduleId:"smm",load:M("community/hzkucuk-eFatura-smm.xslt")}]},{id:"mustahsil",label:"e-Müstahsil",description:"Müstahsil makbuzu",color:"#84cc16",family:"invoice",sampleXml:"ebelge/samples/e-Mustahsil-TEMEL.xml",defaults:[{id:"mustahsil",label:"e-Müstahsil Şablonu",description:"Müstahsil / stopaj bilgili",moduleId:"mustahsil",load:M("community/hzkucuk-eFatura-mustahsil.xslt")}]},{id:"bilet",label:"e-Bilet",description:"Yolcu / etkinlik bileti",color:"#f97316",family:"invoice",sampleXml:"ebelge/samples/e-Bilet-TEMEL.xml",defaults:[{id:"bilet",label:"e-Bilet Şablonu",description:"Yolcu, sefer ve koltuk bilgili",moduleId:"bilet",load:M("community/hzkucuk-eFatura-bilet.xslt")}]}],rt=i=>`/edesign-deploy/${i}`;async function le(i){const t=await fetch(rt(i.sampleXml));if(!t.ok)throw new Error(`Örnek XML yüklenemedi (${t.status})`);return t.text()}const ne="http://www.w3.org/1999/XSL/Transform",X="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",xe=i=>i.replace(/^\uFEFF/,"").replace(/^ï»¿/,"");function W(i){const t=new DOMParser().parseFromString(xe(i),"application/xml"),s=t.getElementsByTagName("parsererror")[0];return{doc:t,error:s?(s.textContent||"ayrıştırma hatası").split(`
`)[0].slice(0,160):null}}const ge=i=>Object.keys(C).find(t=>C[t].ns===i)??null;function be(i,t){try{const s=new XSLTProcessor;s.importStylesheet(i);const r=s.transformToDocument(t);return!r||!r.documentElement?"XSLT sonuç üretmedi":null}catch(s){return s instanceof Error?s.message:String(s)}}const E=(i,t)=>({ok:!i.some(s=>s.level==="error"),checks:i,info:t});function st(i,t,s){const r=[],n=[],{doc:g,error:y}=W(i);if(y)return E([{level:"error",text:`Dosya geçerli bir XML/XSLT değil: ${y}`}],n);const c=g.documentElement;if(c.namespaceURI!==ne||!["stylesheet","transform"].includes(c.localName))return E([{level:"error",text:`Bu dosya bir XSLT değil (kök eleman <${c.nodeName}>; xsl:stylesheet olmalı).`}],n);r.push({level:"ok",text:"Geçerli XSLT dosyası"});const x=c.getAttribute("version")||"1.0";n.push(["XSLT sürümü",x]),n.push(["Şablon (template) sayısı",String(g.getElementsByTagNameNS(ne,"template").length)]);const b=new Set;for(const m of i.matchAll(/xmlns(?::[\w.-]+)?\s*=\s*["']([^"']+)["']/g)){const h=ge(m[1]);h&&b.add(h)}const k=m=>(i.match(m)||[]).length,S={invoice:k(/\bInvoice(Line)?\b/g),despatch:k(/\bDespatch(Advice|Line)\b/g),receipt:k(/\bReceipt(Line)?\b/g)},v=(b.size?[...b]:Object.keys(S).filter(m=>S[m]>0)).sort((m,h)=>S[h]-S[m])[0]??null,j=C[t.family];if(v&&v!==t.family?r.push({level:"error",text:`Bu XSLT ${C[v].label} için hazırlanmış; ${t.label} için ${j.label} yapısında bir XSLT gerekli.`}):v?r.push({level:"ok",text:`Belge yapısı uygun: ${j.label}`}):r.push({level:"warn",text:"XSLT belge yapısını belirtmiyor; uygunluk örnek veriyle denenerek kontrol edildi."}),t.family==="invoice"){const m=/EARSIV|e-Ar[şs]iv/i.test(i),h=/TEMELFATURA|TICARIFATURA/.test(i);t.id==="fatura"&&m&&!h&&r.push({level:"warn",text:"XSLT e-Arşiv faturasına özel görünüyor; e-Fatura için başlık ve alanları kontrol edin."}),t.id==="arsiv"&&h&&!m&&r.push({level:"warn",text:"XSLT e-Fatura (Temel/Ticari) için hazırlanmış görünüyor; e-Arşiv başlığını kontrol edin."})}if((x.startsWith("2")||x.startsWith("3"))&&r.push({level:"warn",text:`XSLT ${x} olarak işaretli; tasarımcı 1.0 motoruyla çalıştırır, 2.0'a özel fonksiyonlar çalışmayabilir.`}),s&&!r.some(m=>m.level==="error")){const m=W(s),h=m.error?null:be(g,m.doc);r.push(h?{level:"error",text:`${t.label} örnek verisiyle çalıştırılamadı: ${h}`}:{level:"ok",text:`${t.label} örnek verisiyle başarıyla çalıştı`})}return E(r,n)}const R=(i,t,s=X)=>Array.from(i.children).find(n=>n.localName===t&&n.namespaceURI===s)?.textContent?.trim()??"";function oe(i,t){const s=Array.from(i.children).find(y=>y.localName===t);if(!s)return"";const r=s.getElementsByTagNameNS(X,"Name")[0]?.textContent?.trim();if(r)return r;const n=s.getElementsByTagNameNS(X,"FirstName")[0]?.textContent?.trim()??"",g=s.getElementsByTagNameNS(X,"FamilyName")[0]?.textContent?.trim()??"";return`${n} ${g}`.trim()}function U(i,t,s){const r=[],n=[],{doc:g,error:y}=W(i);if(y)return E([{level:"error",text:`Dosya geçerli bir XML değil: ${y}`}],n);const c=g.documentElement,x=ge(c.namespaceURI),b=C[t.family];if(x!==t.family){const d=x?C[x].label:`<${c.localName}>`;return E([{level:"error",text:`Bu XML bir ${d} belgesi; ${t.label} için ${b.label} belgesi gerekli.`}],n)}r.push({level:"ok",text:`Belge yapısı uygun: ${b.label}`});const k=R(c,"ProfileID"),S=d=>d.toUpperCase().replace(/[^A-Z0-9]/g,"");t.profileIds&&k&&!t.profileIds.some(d=>S(k).includes(S(d)))&&r.push({level:"warn",text:`Belgenin profili ${k}; ${t.label} için beklenen: ${t.profileIds.join(" / ")}.`});const T=t.family==="despatch"?"DespatchLine":t.family==="receipt"?"ReceiptLine":"InvoiceLine",v=Array.from(c.children).filter(d=>d.localName===T).length,j=R(c,"InvoiceTypeCode")||R(c,"DespatchAdviceTypeCode"),m=oe(c,t.family==="despatch"?"DespatchSupplierParty":"AccountingSupplierParty"),h=oe(c,t.family==="despatch"?"DeliveryCustomerParty":"AccountingCustomerParty"),a=[["Belge no",R(c,"ID")],["Tarih",R(c,"IssueDate")],["Profil",k],["Tip",j],["Para birimi",R(c,"DocumentCurrencyCode")],["Gönderen",m],["Alıcı",h],["Satır sayısı",String(v)]];if(n.push(...a.filter(([,d])=>d)),v||r.push({level:"warn",text:"Belgede kalem (satır) bulunamadı; satır tablosu boş görünür."}),s){const d=W(s),o=d.error?`XSLT okunamadı: ${d.error}`:be(d.doc,g);r.push(o?{level:"error",text:`Seçilen XSLT bu veriyle çalıştırılamadı: ${o}`}:{level:"ok",text:"Seçilen XSLT bu veriyle başarıyla çalıştı"})}return E(r,n)}const lt=5*1024*1024,nt=["Belge türü","Tasarım (XSLT)","Veri (XML)"],F=(i,t="#6366f1")=>({background:i?`${t}22`:"rgba(30, 41, 59, 0.45)",border:`1px solid ${i?t:"rgba(255,255,255,0.08)"}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",color:"white",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s",width:"100%",boxShadow:i?`0 0 0 3px ${t}33`:"none"}),ot=i=>new Promise((t,s)=>{const r=new FileReader;r.onload=()=>t(String(r.result??"")),r.onerror=()=>s(r.error??new Error("Dosya okunamadı")),r.readAsText(i)}),fe=({result:i})=>e.jsxs("div",{"data-wizard-checks":i.ok?"ok":"error",style:{display:"flex",flexDirection:"column",gap:6},children:[i.checks.map((t,s)=>e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",gap:8,fontSize:13,color:t.level==="ok"?"#6ee7b7":t.level==="warn"?"#fcd34d":"#fca5a5"},children:[t.level==="ok"?e.jsx(H,{size:16,style:{flexShrink:0}}):t.level==="warn"?e.jsx(Le,{size:16,style:{flexShrink:0}}):e.jsx(Re,{size:16,style:{flexShrink:0}}),e.jsx("span",{children:t.text})]},s)),i.info.length>0&&e.jsx("div",{style:{display:"grid",gridTemplateColumns:"auto 1fr",gap:"4px 14px",marginTop:8,fontSize:12},children:i.info.map(([t,s])=>e.jsxs(Se.Fragment,{children:[e.jsx("span",{style:{color:"#64748b"},children:t}),e.jsx("span",{style:{color:"#e2e8f0",wordBreak:"break-word"},children:s})]},t))})]}),de=({accept:i,hint:t,file:s,busy:r,onFile:n})=>{const g=u.useRef(null),[y,c]=u.useState(!1);return e.jsxs("div",{style:{marginTop:14},children:[e.jsx("input",{ref:g,type:"file",accept:i,"data-wizard-file":!0,style:{display:"none"},onChange:x=>{const b=x.target.files?.[0];b&&n(b),x.target.value=""}}),e.jsxs("div",{onClick:()=>g.current?.click(),onDragOver:x=>{x.preventDefault(),c(!0)},onDragLeave:()=>c(!1),onDrop:x=>{x.preventDefault(),c(!1);const b=x.dataTransfer.files?.[0];b&&n(b)},style:{border:`2px dashed ${y?"#6366f1":"rgba(148,163,184,0.3)"}`,borderRadius:14,padding:"22px 16px",textAlign:"center",cursor:"pointer",color:"#94a3b8",background:y?"rgba(99,102,241,0.08)":"rgba(15,23,42,0.4)"},children:[r?e.jsx(pe,{size:26}):e.jsx(N,{size:26}),e.jsx("div",{style:{marginTop:8,fontSize:14,color:"#e2e8f0",fontWeight:600},children:s?"Başka dosya seç":"Dosya seçin veya buraya sürükleyin"}),e.jsx("div",{style:{fontSize:12,marginTop:4},children:t})]}),s&&e.jsxs("div",{style:{marginTop:14,display:"grid",gridTemplateColumns:"minmax(0, 1fr) minmax(0, 1fr)",gap:14},children:[e.jsxs("div",{style:{background:"rgba(15,23,42,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:12,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:700,marginBottom:8},children:[e.jsx(Y,{size:16,color:"#a5b4fc"}),e.jsx("span",{"data-wizard-file-name":!0,style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:s.name}),e.jsxs("span",{style:{color:"#64748b",fontWeight:400,marginLeft:"auto",flexShrink:0},children:[(s.size/1024).toFixed(1)," KB"]})]}),e.jsx("pre",{style:{margin:0,maxHeight:220,overflow:"auto",fontSize:11,lineHeight:1.45,color:"#cbd5e1",background:"#020617",borderRadius:8,padding:10,whiteSpace:"pre"},children:xe(s.text).split(`
`).slice(0,40).join(`
`)})]}),e.jsxs("div",{style:{background:"rgba(15,23,42,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:12},children:[e.jsx("div",{style:{fontSize:13,fontWeight:700,marginBottom:10},children:"Uygunluk kontrolü"}),e.jsx(fe,{result:s.result})]})]})]})},dt=({onFinish:i})=>{const[t,s]=u.useState(0),[r,n]=u.useState(null),[g,y]=u.useState(null),[c,x]=u.useState(""),[b,k]=u.useState(null),[S,T]=u.useState(!1),[v,j]=u.useState("default"),[m,h]=u.useState(null),[a,d]=u.useState(null),[o,p]=u.useState(null),[z,A]=u.useState(!1),[L,w]=u.useState(null);u.useEffect(()=>{if(!r)return;let l=!0;return y(null),le(r).then(f=>{l&&y(f)}).catch(f=>l&&w(f.message)),()=>{l=!1}},[r]);const $=r?.defaults.find(l=>l.id===c)??null,ye=l=>{l.id!==r?.id&&(n(l),x(l.defaults[0].id),k(null),h(null),j("default")),s(1)},Z=async(l,f)=>{if(r){if(w(null),l.size>lt){w(`Dosya çok büyük (en fazla 5 MB): ${(l.size/1024/1024).toFixed(1)} MB`);return}A(!0);try{const I=await ot(l),Q=f==="xslt"&&je(I),B=Q?we(I):I;f==="xslt"&&T(Q);const ke=f==="xslt"&&!!Te(B)?{ok:!1,info:[],checks:[{level:"error",text:'Bu dosya onaylanmış (satın alınmış) bir tasarım; tekrar düzenlenemez. Dosyayı "Tasarımlarım" bölümünden tekrar indirebilirsiniz.'}]}:f==="xslt"?st(B,r,g):U(B,r,a),q={name:l.name,size:l.size,text:B,result:ke};f==="xslt"?k(q):h(q)}catch(I){w(I instanceof Error?I.message:String(I))}finally{A(!1)}}},he=async()=>{if(r){A(!0),w(null);try{const l=c==="own"?b?.text??"":await($?.load()??Promise.resolve(""));if(!l)throw new Error("XSLT yüklenemedi");d(l);const f=g??await le(r);y(f),p(U(f,r,l)),m&&h({...m,result:U(m.text,r,l)}),s(2)}catch(l){w(l instanceof Error?l.message:String(l))}finally{A(!1)}}},ve=()=>{if(!r||!a)return;const l=v==="own"?m?.text:g;l&&i({moduleId:c==="own"?r.id:$?.moduleId??r.id,docName:c==="own"&&b?b.name.replace(/\.(xslt|xsl)$/i,""):`${r.label} Tasarımı`,xslt:a,xml:l})},P=t===1?(c==="own"?!!b?.result.ok:!!$)&&!!g:t===2?v==="own"?!!m?.result.ok:!!o?.ok:!1,O=(l,f)=>e.jsxs("div",{style:{marginBottom:18},children:[e.jsx("h2",{style:{margin:0,fontSize:22,fontWeight:800},children:l}),e.jsx("p",{style:{margin:"4px 0 0",color:"#94a3b8",fontSize:14},children:f})]});return e.jsxs("div",{"data-design-wizard":!0,"data-wizard-step":t,style:{width:"100%",background:"rgba(15, 23, 42, 0.7)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:24,padding:"28px 28px 22px",boxShadow:"0 24px 60px rgba(0,0,0,0.35)",color:"white"},children:[e.jsx("div",{style:{display:"flex",gap:8,marginBottom:26},children:nt.map((l,f)=>e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{style:{height:4,borderRadius:4,background:f<=t?"linear-gradient(90deg,#6366f1,#0ea5e9)":"rgba(148,163,184,0.2)"}}),e.jsxs("div",{style:{marginTop:6,fontSize:12,fontWeight:700,color:f===t?"#e2e8f0":"#64748b"},children:[f+1,". ",l,f<t&&f===0&&r?` · ${r.label}`:""]})]},l))}),t===0&&e.jsxs(e.Fragment,{children:[O("Hangi belgeyi tasarlayacaksınız?","Belge türünü seçin; şablon ve veri kontrolleri bu türe göre yapılır."),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:12},children:ue.map(l=>e.jsx("button",{type:"button","data-doc-type":l.id,onClick:()=>ye(l),style:F(r?.id===l.id,l.color),children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:38,height:38,borderRadius:10,background:`${l.color}26`,color:l.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:e.jsx(ce,{size:20})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:700,fontSize:15},children:l.label}),e.jsx("div",{style:{color:"#94a3b8",fontSize:12},children:l.description})]})]})},l.id))})]}),t===1&&r&&e.jsxs(e.Fragment,{children:[O(`${r.label} için tasarım şablonu`,"Hazır bir şablonla başlayın ya da kendi XSLT dosyanızı yükleyin."),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))",gap:12},children:r.defaults.map(l=>e.jsxs("button",{type:"button","data-xslt-option":l.id,onClick:()=>x(l.id),style:F(c===l.id,r.color),children:[e.jsxs("div",{style:{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:6},children:[c===l.id&&e.jsx(H,{size:15,color:"#6ee7b7"}),l.label]}),e.jsx("div",{style:{color:"#94a3b8",fontSize:12,marginTop:3},children:l.description}),e.jsx("div",{style:{color:"#64748b",fontSize:11,marginTop:6},children:"Varsayılan şablon"})]},l.id))}),e.jsxs("button",{type:"button","data-xslt-option":"own",onClick:()=>x("own"),style:{...F(c==="own","#f59e0b"),marginTop:12},children:[e.jsxs("div",{style:{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8},children:[e.jsx(N,{size:16})," Kendi XSLT dosyamı kullan"]}),e.jsxs("div",{style:{color:"#94a3b8",fontSize:12,marginTop:3},children:["Dosyanız ",C[r.family].label," yapısına ve ",r.label," türüne uygunluk için kontrol edilir."]})]}),c==="own"&&e.jsx(de,{accept:".xslt,.xsl",hint:".xslt veya .xsl · en fazla 5 MB",file:b,busy:z,onFile:l=>Z(l,"xslt")}),c==="own"&&b&&S&&e.jsx("div",{"data-test-file-note":!0,style:{marginTop:10,padding:"10px 12px",borderRadius:10,fontSize:12,lineHeight:1.5,background:"rgba(245, 158, 11, 0.1)",border:"1px solid rgba(245, 158, 11, 0.35)",color:"#fde68a"},children:'Bu bir TEST dosyası. TEST yazısı editörde kaldırıldı; tasarıma kaldığınız yerden devam edebilirsiniz. Bitirdiğinizde "Onayla" ile TEST yazısız dosyayı alırsınız; onaydan sonra tasarım değiştirilemez.'})]}),t===2&&r&&e.jsxs(e.Fragment,{children:[O("Tasarımda hangi veri görünsün?","Önizlemede kullanılacak e-belge XML’ini seçin. Tasarım her veriyle çalışır; bu sadece önizleme içindir."),e.jsxs("button",{type:"button","data-xml-option":"default",onClick:()=>j("default"),style:F(v==="default",r.color),children:[e.jsxs("div",{style:{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8},children:[e.jsx(Ce,{size:16})," Varsayılan örnek XML"]}),e.jsxs("div",{style:{color:"#94a3b8",fontSize:12,marginTop:3},children:[r.label," için hazır örnek belge (",r.sampleXml.split("/").pop(),")"]}),v==="default"&&o&&e.jsx("div",{style:{marginTop:10},children:e.jsx(fe,{result:o})})]}),e.jsxs("button",{type:"button","data-xml-option":"own",onClick:()=>j("own"),style:{...F(v==="own","#f59e0b"),marginTop:12},children:[e.jsxs("div",{style:{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8},children:[e.jsx(N,{size:16})," Kendi XML dosyamı seç"]}),e.jsxs("div",{style:{color:"#94a3b8",fontSize:12,marginTop:3},children:["Gerçek bir ",r.label," XML’i (",C[r.family].root,") yükleyin; seçtiğiniz şablonla denenir."]})]}),v==="own"&&e.jsx(de,{accept:".xml",hint:".xml · en fazla 5 MB",file:m,busy:z,onFile:l=>Z(l,"xml")})]}),L&&e.jsx("div",{style:{marginTop:14,color:"#fca5a5",fontSize:13},children:L}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:24},children:[e.jsxs("button",{type:"button","data-wizard-back":!0,disabled:t===0,onClick:()=>{w(null),s(l=>Math.max(0,l-1))},style:{padding:"10px 18px",borderRadius:10,border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:t===0?"#475569":"#cbd5e1",cursor:t===0?"default":"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit"},children:[e.jsx(Ie,{size:16})," Geri"]}),t>0&&e.jsxs("button",{type:"button","data-wizard-next":!0,disabled:!P||z,onClick:t===1?he:ve,style:{padding:"10px 22px",borderRadius:10,border:"none",fontWeight:700,fontFamily:"inherit",background:P&&!z?"linear-gradient(135deg,#6366f1,#0ea5e9)":"rgba(148,163,184,0.2)",color:P&&!z?"white":"#64748b",cursor:P&&!z?"pointer":"default",display:"flex",alignItems:"center",gap:6},children:[z?e.jsx(pe,{size:16}):null,t===1?"Veri seçimine geç":"Tasarım ekranını aç"," ",e.jsx(Me,{size:16})]})]})]})},ct=i=>ue.find(t=>t.id===i||t.defaults.some(s=>s.moduleId===i))?.label??i,pt=i=>{const t=new Date(i);return Number.isNaN(t.getTime())?"":t.toLocaleDateString("tr-TR",{day:"2-digit",month:"short",year:"numeric"})},mt=i=>{const t=URL.createObjectURL(new Blob([Ae(i.xslt_content??"")],{type:"application/xml;charset=utf-8"})),s=document.createElement("a");s.href=t,s.download=`${i.name.replace(/[\\/:*?"<>|\s]+/g,"_")}_${i.module_id}.xslt`,document.body.appendChild(s),s.click(),document.body.removeChild(s),setTimeout(()=>URL.revokeObjectURL(t),1e4)},ut=({onOpen:i})=>{const[t,s]=u.useState(null);if(u.useEffect(()=>{V.listDesigns().then(n=>s((n.designs??[]).filter(g=>g.xslt_content))).catch(()=>s([]))},[]),!t?.length)return null;const r=async n=>{window.confirm(`"${n.name}" silinsin mi?${n.paid?`

Onaylanmış bir tasarımı silerseniz buradan tekrar indiremezsiniz.`:""}`)&&(await V.deleteDesign(n.id),s(g=>g?.filter(y=>y.id!==n.id)??null))};return e.jsxs("div",{"data-my-designs":!0,style:{width:"100%",marginBottom:"2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:"10px",marginBottom:"12px"},children:[e.jsx("h2",{style:{fontSize:"1.1rem",fontWeight:800,margin:0,color:"#f1f5f9"},children:"Tasarımlarım"}),e.jsx("span",{style:{fontSize:"0.8rem",color:"#64748b"},children:"Taslaklarınıza devam edebilirsiniz. Onaylanan tasarımlar değiştirilemez, yalnızca ücretsiz tekrar indirilir."})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:"12px"},children:t.map(n=>e.jsxs("div",{"data-design-id":n.id,"data-design-paid":n.paid?"1":void 0,style:{display:"flex",flexDirection:"column",gap:"8px",padding:"14px 16px",background:"rgba(30, 41, 59, 0.5)",borderRadius:"12px",border:`1px solid ${n.paid?"rgba(16, 185, 129, 0.35)":"rgba(148, 163, 184, 0.2)"}`},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[e.jsx(Y,{size:20,color:n.paid?"#34d399":"#94a3b8",style:{flexShrink:0}}),e.jsxs("div",{style:{minWidth:0,flex:1},children:[e.jsx("div",{style:{fontWeight:700,fontSize:"0.95rem",color:"#f1f5f9",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:n.name}),e.jsxs("div",{style:{fontSize:"0.75rem",color:"#94a3b8"},children:[ct(n.module_id)," · ",pt(n.updated_at)]})]}),e.jsx("button",{type:"button",title:"Sil",onClick:()=>r(n),style:{background:"transparent",border:"none",color:"#64748b",cursor:"pointer",padding:4},children:e.jsx(Ee,{size:15})})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("span",{style:{display:"inline-flex",alignItems:"center",gap:"4px",fontSize:"0.7rem",fontWeight:700,padding:"2px 8px",borderRadius:999,background:n.paid?"rgba(16, 185, 129, 0.15)":"rgba(148, 163, 184, 0.12)",color:n.paid?"#6ee7b7":"#94a3b8"},children:n.paid?e.jsxs(e.Fragment,{children:[e.jsx(Fe,{size:11})," Onaylandı · yalnızca indirme"]}):"Taslak · onay 1 hak"}),n.paid?e.jsxs("button",{type:"button","data-download-design":n.id,onClick:()=>mt(n),style:{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:"5px",padding:"6px 12px",borderRadius:"8px",border:"none",cursor:"pointer",background:"#10b981",color:"white",fontWeight:700,fontSize:"0.8rem",fontFamily:"inherit"},children:[e.jsx(Pe,{size:13})," İndir"]}):e.jsxs("button",{type:"button","data-open-design":n.id,onClick:()=>i(n),style:{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:"5px",padding:"6px 12px",borderRadius:"8px",border:"none",cursor:"pointer",background:"#6366f1",color:"white",fontWeight:700,fontSize:"0.8rem",fontFamily:"inherit"},children:[e.jsx(Be,{size:13})," Devam et"]})]})]},n.id))})]})},xt=[{id:"fatura",name:"e-Fatura",icon:e.jsx(ce,{size:24}),color:"#6366f1",template:"gib/v2/e-Fatura-Sablon.xslt"},{id:"arsiv",name:"e-Arşiv",icon:e.jsx(Oe,{size:24}),color:"#10b981",template:"gib/v2/e-Arsiv-Sablon.xslt"},{id:"irsaliye",name:"e-İrsaliye",icon:e.jsx(Ke,{size:24}),color:"#0ea5e9",template:"community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt"},{id:"ihracat",name:"e-İhracat",icon:e.jsx(Ue,{size:24}),color:"#8b5cf6",template:"community/IRPTeam-eFatura.xslt"},{id:"mikro_ihracat",name:"e-Mikro İhracat",icon:e.jsx(Ve,{size:24}),color:"#a855f7",template:"community/IRPTeam-eFatura.xslt"},{id:"smm",name:"e-SMM (Serbest Meslek)",icon:e.jsx(Ge,{size:24}),color:"#14b8a6",template:"community/hzkucuk-eFatura-smm.xslt"},{id:"mustahsil",name:"e-Müstahsil Makbuzu",icon:e.jsx(He,{size:24}),color:"#84cc16",template:"community/hzkucuk-eFatura-mustahsil.xslt"},{id:"bilet",name:"e-Bilet",icon:e.jsx(Ye,{size:24}),color:"#f97316",template:"community/hzkucuk-eFatura-bilet.xslt"},{id:"makbuz",name:"e-Makbuz",icon:e.jsx(Ze,{size:24}),color:"#06b6d4",template:"community/hzkucuk-eFatura-makbuz.xslt"}],St=({onSelect:i,onLogout:t,onSelectXsltEditor:s})=>{const r=u.useRef(null),[n,g]=u.useState(!1),[y,c]=u.useState(!1),[x,b]=u.useState(null),[k,S]=u.useState(null),[T,v]=u.useState(null),[j,m]=u.useState(!1);u.useEffect(()=>{V.getMe().then(v).catch(console.error)},[]);const h=a=>{const d=a.target.files?.[0];if(!d)return;const o=5*1024*1024;if(d.size>o){D.getState().pushToast({kind:"error",title:"Dosya çok büyük",description:`Maksimum 5 MB. Seçilen dosya: ${(d.size/1024/1024).toFixed(1)} MB`}),a.target.value="";return}const p=[".xslt",".xsl",".xml"],z=d.name.toLowerCase();if(!p.some(L=>z.endsWith(L))){D.getState().pushToast({kind:"error",title:"Geçersiz dosya tipi",description:"Yalnızca .xslt, .xsl veya .xml dosyaları kabul edilir."}),a.target.value="";return}const A=new FileReader;A.onload=L=>{const w=L.target?.result;if(!w||!w.trim().startsWith("<")){D.getState().pushToast({kind:"error",title:"Geçersiz XSLT içeriği",description:"Dosya XML/XSLT olarak okunamadı."}),a.target.value="";return}i("custom",d.name,"Özel Belge",w)},A.onerror=()=>{D.getState().pushToast({kind:"error",title:"Dosya okunamadı",description:A.error?.message??"Bilinmeyen hata"}),a.target.value=""},A.readAsText(d)};return e.jsxs("div",{style:{minHeight:"100vh",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0f172a",fontFamily:"Inter, sans-serif",color:"white",padding:"2rem",boxSizing:"border-box",position:"relative"},children:[e.jsxs("div",{style:{position:"absolute",top:"2rem",right:"2rem",display:"flex",gap:"1rem",zIndex:50},children:[T&&e.jsxs("div",{"data-credit-badge":!0,title:"Kalan tasarım hakkı",style:{display:"flex",alignItems:"center",gap:"6px",padding:"0.6rem 1rem",borderRadius:"12px",border:"1px solid rgba(16,185,129,0.3)",background:"rgba(16,185,129,0.1)",color:"#6ee7b7",fontSize:"0.85rem",fontWeight:700},children:[e.jsx(J,{size:16})," ",T.credits??0," tasarım hakkı"]}),e.jsxs("button",{onClick:()=>c(!0),style:{background:"linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",border:"none",padding:"0.6rem 1.4rem",borderRadius:"12px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s",boxShadow:"0 4px 15px rgba(99, 102, 241, 0.3)",fontWeight:"bold"},onMouseOver:a=>a.currentTarget.style.transform="translateY(-2px)",onMouseOut:a=>a.currentTarget.style.transform="translateY(0)",children:[e.jsx(De,{size:18}),e.jsx("span",{style:{fontSize:"0.9rem"},children:"Paket Al"})]}),e.jsxs("button",{onClick:()=>g(!0),style:{background:"rgba(30, 41, 59, 0.6)",border:"1px solid rgba(255,255,255,0.1)",padding:"0.6rem 1.2rem",borderRadius:"12px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s",backdropFilter:"blur(10px)"},onMouseOver:a=>a.currentTarget.style.background="rgba(30, 41, 59, 0.9)",onMouseOut:a=>a.currentTarget.style.background="rgba(30, 41, 59, 0.6)",children:[e.jsx(ee,{size:18,color:"#818cf8"}),e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:"500"},children:"Profilim"})]}),e.jsxs("button",{onClick:t,style:{background:"rgba(239, 68, 68, 0.1)",border:"1px solid rgba(239, 68, 68, 0.2)",padding:"0.6rem 1.2rem",borderRadius:"12px",color:"#f87171",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s",backdropFilter:"blur(10px)"},onMouseOver:a=>{a.currentTarget.style.background="rgba(239, 68, 68, 0.2)",a.currentTarget.style.borderColor="rgba(239, 68, 68, 0.4)"},onMouseOut:a=>{a.currentTarget.style.background="rgba(239, 68, 68, 0.1)",a.currentTarget.style.borderColor="rgba(239, 68, 68, 0.2)"},children:[e.jsx(_e,{size:18}),e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:"500"},children:"Çıkış"})]})]}),n&&T&&e.jsx("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem"},children:e.jsxs("div",{style:{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"24px",width:"100%",maxWidth:"450px",padding:"2.5rem",position:"relative",boxShadow:"0 25px 50px -12px rgba(0, 0, 0, 0.5)"},children:[e.jsx("button",{onClick:()=>g(!1),style:{position:"absolute",top:"1.5rem",right:"1.5rem",background:"none",border:"none",color:"#64748b",cursor:"pointer"},children:e.jsx(te,{size:24})}),e.jsxs("div",{style:{textAlign:"center",marginBottom:"2rem"},children:[e.jsx("div",{style:{width:"80px",height:"80px",background:"#6366f1",borderRadius:"24px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",boxShadow:"0 10px 15px -3px rgba(99, 102, 241, 0.4)"},children:e.jsx(ee,{size:40,color:"white"})}),e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:"bold",marginBottom:"0.5rem"},children:T.full_name||"Kullanıcı"}),e.jsx("span",{style:{background:"#0f172a",padding:"4px 12px",borderRadius:"20px",fontSize:"0.75rem",color:"#818cf8",border:"1px solid rgba(99, 102, 241, 0.2)"},children:T.role==="admin"?"Yönetici Hesabı":"Standart Hesap"})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"rgba(15, 23, 42, 0.5)",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx(Xe,{size:20,color:"#94a3b8"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"Firma"}),e.jsx("span",{style:{fontSize:"0.95rem"},children:T.company_name||"-"})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"rgba(15, 23, 42, 0.5)",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx(Ne,{size:20,color:"#94a3b8"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"E-Posta"}),e.jsx("span",{style:{fontSize:"0.95rem"},children:T.username})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"rgba(15, 23, 42, 0.5)",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx(We,{size:20,color:"#94a3b8"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"Telefon"}),e.jsx("span",{style:{fontSize:"0.95rem"},children:T.phone_number||"-"})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(16, 185, 129, 0.2)"},children:[e.jsx(J,{size:20,color:"#10b981"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#10b981",textTransform:"uppercase",letterSpacing:"1px"},children:"Mevcut Kredi"}),e.jsxs("span",{style:{fontSize:"1.25rem",fontWeight:"bold",color:"#10b981"},children:[T.credits," ",e.jsx("span",{style:{fontSize:"0.8rem",fontWeight:"normal"},children:"Tasarım"})]})]})]})]})]})}),e.jsx("input",{type:"file",ref:r,style:{display:"none"},accept:".xslt,.xsl,.xml",onChange:h}),e.jsxs("div",{style:{width:"100%",maxWidth:"1000px",display:"flex",flexDirection:"column",alignItems:"center"},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"3rem"},children:[e.jsx("h1",{style:{fontSize:"clamp(2.5rem, 6vw, 3.5rem)",fontWeight:"900",marginBottom:"1rem",background:"linear-gradient(135deg, #fff 0%, #94a3b8 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-1px"},children:"E-Belge Tasarımcı"}),e.jsx("p",{style:{color:"#94a3b8",fontSize:"1.1rem",maxWidth:"600px",margin:"0 auto"},children:"Yeni bir tasarım için adımları izleyin: belge türü, şablon ve veri."})]}),e.jsx(ut,{onOpen:a=>s?.(a.module_id,a.xslt_content??void 0,a.name,a.xml_content??void 0,a.id)}),e.jsx("div",{style:{width:"100%",marginBottom:"2rem"},children:e.jsx(dt,{onFinish:a=>s?.(a.moduleId,a.xslt,a.docName,a.xml)})}),e.jsx("button",{type:"button","data-toggle-more-options":!0,onClick:()=>m(a=>!a),style:{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:999,color:"#94a3b8",padding:"8px 18px",cursor:"pointer",fontSize:"0.85rem",marginBottom:"2rem",fontFamily:"inherit"},children:j?"Diğer seçenekleri gizle":"Diğer başlangıç seçenekleri (klasik tasarımcı, hazır şablonlar)"}),j&&e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:"24px",width:"100%",marginBottom:"4rem"},children:e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"16px",width:"100%"},children:[e.jsxs("div",{onClick:()=>r.current?.click(),style:{background:"rgba(30, 41, 59, 0.4)",border:"1px dashed rgba(255,255,255,0.1)",borderRadius:"24px",padding:"2rem",cursor:"pointer",display:"flex",flexDirection:"column",gap:"1.5rem",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",backdropFilter:"blur(10px)"},children:[e.jsx("div",{style:{width:"56px",height:"56px",background:"rgba(255,255,255,0.1)",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:"white"},children:e.jsx(N,{size:30})}),e.jsxs("div",{children:[e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:"bold",marginBottom:"0.5rem"},children:"Kendi Tasarımın"}),e.jsx("p",{style:{color:"#94a3b8",fontSize:"0.9rem",lineHeight:"1.5"},children:"Mevcut bir XSLT dosyanız mı var? Dosyanızı yükleyin ve gelişmiş görsel editörümüzle üzerinde değişiklik yapın."})]}),e.jsx("div",{style:{color:"white",fontWeight:"bold",fontSize:"0.9rem"},children:"Dosya Seç ve Yükle ›"})]}),s&&e.jsxs("div",{onClick:()=>s(),title:"XSLT Editör — Monaco + canlı preview. XSLT bilen kullanıcılar için.",style:{background:"linear-gradient(135deg, rgba(16,185,129,0.12), rgba(52,211,153,0.08))",border:"1px solid rgba(16,185,129,0.35)",borderRadius:"24px",padding:"2rem",cursor:"pointer",display:"flex",flexDirection:"column",gap:"1.5rem",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",backdropFilter:"blur(10px)",position:"relative",overflow:"hidden"},onMouseEnter:a=>{a.currentTarget.style.borderColor="rgba(16,185,129,0.7)",a.currentTarget.style.transform="translateY(-2px)",a.currentTarget.style.boxShadow="0 12px 32px rgba(16,185,129,0.18)"},onMouseLeave:a=>{a.currentTarget.style.borderColor="rgba(16,185,129,0.35)",a.currentTarget.style.transform="translateY(0)",a.currentTarget.style.boxShadow="none"},children:[e.jsx("div",{style:{position:"absolute",top:12,right:12,padding:"4px 10px",background:"linear-gradient(135deg, #10b981, #34d399)",borderRadius:"999px",fontSize:"0.65rem",fontWeight:800,letterSpacing:"1px",color:"white"},children:"BETA"}),e.jsx("div",{style:{width:"56px",height:"56px",background:"linear-gradient(135deg, #10b981, #34d399)",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:"white"},children:e.jsx(K,{size:28})}),e.jsxs("div",{children:[e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:"bold",marginBottom:"0.5rem",color:"white"},children:"XSLT Editör"}),e.jsx("p",{style:{color:"#cbd5e1",fontSize:"0.9rem",lineHeight:"1.5"},children:"Direkt XSLT kod yaz, canlı önizle. Monaco editör (VS Code altyapısı, syntax highlight, autocomplete) + sağda anlık HTML render. PHP gibi template mantığına alışkın kullanıcılar için."})]}),e.jsx("div",{style:{color:"#6ee7b7",fontWeight:"bold",fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"6px"},children:"Kod Yazmaya Başla ›"})]})]})}),e.jsxs("div",{style:{width:"100%",marginBottom:"2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1.5rem"},children:[e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to right, transparent, rgba(255,255,255,0.1))"}}),e.jsx("span",{style:{fontSize:"0.8rem",color:"#34d399",fontWeight:"bold",textTransform:"uppercase",letterSpacing:"2px"},children:"Hazır Şablonlarla Başla · XSLT Editör"}),e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to left, transparent, rgba(255,255,255,0.1))"}})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:"14px"},children:me.map(a=>e.jsxs("div",{onClick:()=>s?.(a.moduleId,a.xslt,a.docName),title:`${a.label} — ${a.description}`,"data-template-id":a.id,style:{padding:"14px 16px",background:"rgba(16, 185, 129, 0.06)",border:"1px solid rgba(16, 185, 129, 0.25)",borderRadius:"12px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:"12px",transition:"all 0.2s ease"},onMouseEnter:d=>{d.currentTarget.style.background="rgba(16, 185, 129, 0.12)",d.currentTarget.style.borderColor="rgba(16, 185, 129, 0.5)",d.currentTarget.style.transform="translateY(-1px)"},onMouseLeave:d=>{d.currentTarget.style.background="rgba(16, 185, 129, 0.06)",d.currentTarget.style.borderColor="rgba(16, 185, 129, 0.25)",d.currentTarget.style.transform="translateY(0)"},children:[e.jsx("div",{style:{width:"36px",height:"36px",background:a.moduleId==="arsiv"?"linear-gradient(135deg, #059669, #10b981)":"linear-gradient(135deg, #6366f1, #8b5cf6)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",color:"white",flexShrink:0},children:e.jsx(Y,{size:18})}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"},children:[e.jsx("span",{style:{fontSize:"0.95rem",fontWeight:700,color:"#e2e8f0"},children:a.label}),e.jsx("span",{style:{padding:"1px 6px",background:"rgba(52, 211, 153, 0.15)",border:"1px solid rgba(52, 211, 153, 0.3)",borderRadius:"3px",fontSize:"0.6rem",fontWeight:700,color:"#6ee7b7",letterSpacing:"0.5px",textTransform:"uppercase"},children:a.moduleId==="arsiv"?"e-Arşiv":"e-Fatura"})]}),e.jsx("div",{style:{fontSize:"0.75rem",color:"#94a3b8",lineHeight:1.4},children:a.description})]})]},a.id))})]}),e.jsxs("div",{style:{width:"100%",marginBottom:"2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1.5rem"},children:[e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to right, transparent, rgba(255,255,255,0.1))"}}),e.jsx("span",{style:{fontSize:"0.8rem",color:"#64748b",fontWeight:"bold",textTransform:"uppercase",letterSpacing:"2px"},children:"Hızlı Başlangıç Modülleri"}),e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to left, transparent, rgba(255,255,255,0.1))"}})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))",gap:"16px",width:"100%"},children:xt.map(a=>{const d=ie(a.id);return e.jsxs("div",{title:d.description,onClick:o=>{if(!o.target.closest("[data-subbtn]"))if(a.subTypes&&a.subTypes.length>0){const z=a.subTypes[0];i(`${a.id}_${z.id}`,a.template,`${a.name} - ${z.label}`)}else i(a.id,a.template,a.name)},style:{background:"rgba(30, 41, 59, 0.2)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"16px",padding:"16px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px",transition:"all 0.2s",backdropFilter:"blur(5px)",position:"relative"},onMouseEnter:o=>{o.currentTarget.style.background="rgba(99, 102, 241, 0.1)",o.currentTarget.style.borderColor="rgba(99, 102, 241, 0.3)",o.currentTarget.style.transform="translateY(-2px)"},onMouseLeave:o=>{o.currentTarget.style.background="rgba(30, 41, 59, 0.2)",o.currentTarget.style.borderColor="rgba(255,255,255,0.05)",o.currentTarget.style.transform="translateY(0)"},children:[e.jsx("div",{style:{width:"36px",height:"36px",background:`${a.color}15`,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",color:a.color,flexShrink:0},children:a.icon}),e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:600,color:"white",flex:1,lineHeight:1.2},children:a.name}),a.subTypes&&e.jsx("div",{onClick:o=>o.stopPropagation(),style:{display:"flex",gap:4,flexShrink:0},children:a.subTypes.map(o=>e.jsx("span",{"data-subbtn":"true",role:"button",tabIndex:0,onClick:p=>{p.stopPropagation(),i(`${a.id}_${o.id}`,a.template,`${a.name} - ${o.label}`)},onKeyDown:p=>{(p.key==="Enter"||p.key===" ")&&(p.preventDefault(),p.currentTarget.click())},style:{display:"inline-flex",alignItems:"center",padding:"5px 10px",background:`${a.color}26`,border:`1px solid ${a.color}55`,borderRadius:999,color:a.color,fontSize:"0.72rem",fontWeight:700,letterSpacing:.3,cursor:"pointer",transition:"transform 0.15s, background 0.18s",userSelect:"none"},onMouseEnter:p=>{p.currentTarget.style.background=`${a.color}40`,p.currentTarget.style.transform="translateY(-1px)"},onMouseLeave:p=>{p.currentTarget.style.background=`${a.color}26`,p.currentTarget.style.transform="translateY(0)"},children:o.label},o.id))}),re(a.id).length>0&&e.jsxs("button",{type:"button",onClick:o=>{o.stopPropagation(),b(a.id)},style:{marginTop:8,alignSelf:"flex-start",padding:"4px 10px",background:"transparent",border:`1px solid ${a.color}55`,borderRadius:999,color:a.color,fontSize:"0.68rem",fontWeight:600,letterSpacing:.3,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4,transition:"background 0.15s"},onMouseEnter:o=>{o.currentTarget.style.background=`${a.color}15`},onMouseLeave:o=>{o.currentTarget.style.background="transparent"},children:[e.jsx(K,{size:11})," Snippet'ler"]})]},a.id)})})]})]})]}),e.jsx(ze,{isOpen:y,onClose:()=>c(!1),onSuccess:a=>v(d=>d?{...d,credits:a}:null)}),x&&(()=>{const a=re(x),d=ie(x);return e.jsx("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)",padding:"2rem"},children:e.jsxs("div",{style:{background:"linear-gradient(180deg, #020617 0%, #0a0f1f 100%)",border:"1px solid rgba(148, 163, 184, 0.14)",padding:"2rem",borderRadius:"1.25rem",maxWidth:960,width:"100%",position:"relative",boxShadow:"0 24px 60px rgba(0, 0, 0, 0.55)",maxHeight:"90vh",overflowY:"auto"},children:[e.jsx("button",{onClick:()=>{b(null),S(null)},style:{position:"absolute",top:16,right:16,background:"rgba(15, 23, 42, 0.6)",border:"1px solid rgba(148, 163, 184, 0.18)",borderRadius:999,width:32,height:32,color:"#cbd5e1",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(te,{size:16})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:16},children:[e.jsx(K,{size:22,color:"#6366f1"}),e.jsx("h2",{style:{color:"#f8fafc",margin:0,fontSize:"1.4rem",fontWeight:800},children:"XSLT Snippet Kütüphanesi"})]}),e.jsxs("p",{style:{color:"#94a3b8",fontSize:13,margin:"0 0 16px"},children:[e.jsx("strong",{style:{color:"#a5b4fc"},children:d.description.split("—")[0].trim()})," için hazır section snippet'leri. Aşağıdaki kodları kopyalayıp Designer'da XSLT edit'ine yapıştırabilirsin."]}),a.length===0?e.jsx("div",{style:{padding:24,textAlign:"center",color:"#64748b"},children:"Bu modül için henüz snippet eklenmedi."}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:14},children:a.map(o=>e.jsxs("div",{style:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(148, 163, 184, 0.14)",borderRadius:12,padding:16},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8},children:[e.jsxs("div",{children:[e.jsx("div",{style:{color:"#f8fafc",fontWeight:700,fontSize:14},children:o.label}),e.jsx("div",{style:{color:"#94a3b8",fontSize:12,marginTop:2},children:o.description})]}),e.jsx("button",{type:"button",onClick:()=>{try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(o.code);else{const p=document.createElement("textarea");p.value=o.code,document.body.appendChild(p),p.select(),document.execCommand("copy"),document.body.removeChild(p)}S(o.id),setTimeout(()=>S(p=>p===o.id?null:p),1500)}catch(p){console.error("Kopyalama hatası:",p)}},style:{padding:"5px 12px",background:k===o.id?"rgba(16, 185, 129, 0.2)":"rgba(99, 102, 241, 0.15)",border:`1px solid ${k===o.id?"rgba(16, 185, 129, 0.5)":"rgba(99, 102, 241, 0.4)"}`,borderRadius:8,color:k===o.id?"#10b981":"#a5b4fc",cursor:"pointer",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4,fontFamily:"inherit"},children:k===o.id?e.jsxs(e.Fragment,{children:[e.jsx(H,{size:11})," Kopyalandı"]}):e.jsxs(e.Fragment,{children:[e.jsx($e,{size:11})," Kopyala"]})})]}),e.jsx("pre",{style:{background:"#020617",border:"1px solid rgba(148, 163, 184, 0.1)",borderRadius:8,padding:12,margin:0,color:"#a5b4fc",fontSize:11,fontFamily:"monospace",overflow:"auto",maxHeight:200,whiteSpace:"pre-wrap"},children:o.code})]},o.id))})]})})})()]})};export{St as Selection};
