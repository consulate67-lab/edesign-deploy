import{_ as V,j as e,a as be,u as B}from"./index-8_vm0aJp.js";import{r as g,R as fe}from"./vendor-i18n-D1UrcLFy.js";import{P as he}from"./PaymentModal-DLqMcI6T.js";import{F as le,C as U,e as X,D as ye,b as ve,f as se,A as ke,g as oe,T as Se,h as Te,i as H,S as ze,j as Y,k as je,X as Z,B as we,l as Ae,P as Ce,m as $,n as Ie,o as Me,p as Le,G as Re,q as Ee,r as Fe,s as Pe,t as Be,R as De}from"./vendor-icons-DdrvLKp1.js";import"./vendor-dnd-f4m_iXKM.js";import"./vendor-state-LLmneBlK.js";const Q={fatura:{layout:"standard",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["logo","stamp","bank","product_table","totals","notes","ettn"],defaultTemplate:"gib/v2/e-Fatura-Sablon.xslt",recommendedSample:"samples/e-Fatura-TICARI.xml",description:"e-Fatura — sıfırdan tasarlanmış minimal XSLT, 11 sütunlu ürün tablosu, ETTN satırı, sağ-alt toplamlar."},arsiv:{layout:"standard",hasSignature:!0,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["logo","stamp","bank","product_table","totals","notes","signature"],defaultTemplate:"gib/v2/e-Arsiv-Sablon.xslt",recommendedSample:"samples/e-Arsiv-TEMEL.xml",description:"e-Arşiv — sıfırdan tasarlanmış minimal XSLT, GİB uyumlu, e-imzalı."},irsaliye:{layout:"multi-section",hasSignature:!1,hasVehicle:!0,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["vehicle","driver","loading_point","unloading_point","product_table","despatch_info"],defaultTemplate:"community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt",recommendedSample:"samples/e-Irsaliye-TEMEL.xml",description:"e-İrsaliye — araç/sürücü/mal kabul yeri 3-sütunlu layout."},ihracat:{layout:"standard",hasSignature:!1,hasVehicle:!1,hasCurrency:!0,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["logo","stamp","bank","product_table","totals","customs_info","origin_country","gtip_no"],defaultTemplate:"community/IRPTeam-eFatura.xslt",recommendedSample:"samples/e-Ihracat-TEMEL.xml",description:"e-İhracat — gümrük bilgileri, menşe ülke, GTIP no, döviz."},mikro_ihracat:{layout:"compact",hasSignature:!1,hasVehicle:!1,hasCurrency:!0,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["product_table","totals","customs_info","origin_country"],defaultTemplate:"community/IRPTeam-eFatura.xslt",recommendedSample:"samples/e-Ihracat-TEMEL.xml",description:"e-Mikro İhracat — basitleştirilmiş ihracat layout."},smm:{layout:"service",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!0,hasStoppage:!0,hasPassenger:!1,hasService:!0,specialFields:["logo","stamp","bank","service_table","gross_net","vat_exemption","stoppage","identity_no"],defaultTemplate:"community/hzkucuk-eFatura-smm.xslt",recommendedSample:"samples/e-SMM-TEMEL.xml",description:"e-SMM — Serbest Meslek Makbuzu, hizmet bilgileri, BRÜT/Net ayrımı, KDV istisna, stopaj, TCKN mükellef."},mustahsil:{layout:"standard",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!0,hasStoppage:!0,hasPassenger:!1,hasService:!1,specialFields:["buyer_info","product_table","totals","stoppage","vat_exemption"],defaultTemplate:"community/hzkucuk-eFatura-mustahsil.xslt",recommendedSample:"samples/e-Mustahsil-TEMEL.xml",description:"e-Müstahsil — çiftçiden alınan zirai ürün makbuzu, KDV istisna, stopaj, TCKN müstahsil."},bilet:{layout:"multi-section",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!1,hasStoppage:!1,hasPassenger:!0,hasService:!1,specialFields:["passenger_info","voyage_info","seat_no","price","product_table"],defaultTemplate:"community/hzkucuk-eFatura-bilet.xslt",recommendedSample:"samples/e-Bilet-TEMEL.xml",description:"e-Bilet — yolcu/sefer/koltuk bilgili ulaşım bileti."},makbuz:{layout:"compact",hasSignature:!1,hasVehicle:!1,hasCurrency:!1,hasCommodity:!1,hasCommission:!1,hasVatExemption:!0,hasStoppage:!1,hasPassenger:!1,hasService:!1,specialFields:["payment_info","totals","vat_exemption","receipt_line"],defaultTemplate:"community/hzkucuk-eFatura-makbuz.xslt",recommendedSample:"samples/e-Makbuz-TEMEL.xml",description:"e-Makbuz — Receipt (UBL-TR özelleştirmesi), basit ödeme makbuzu, KDV istisna destekli."}};function q(r){return Q[r]||Q.fatura}const _e=[{id:"signature-basic",label:"İmza Alanı (Basit)",description:"Satıcı + alıcı imza placeholder'ı. Genel fatura için.",category:"signature",appliesTo:["fatura","arsiv","smm","mustahsil","makbuz"],code:`
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
</div>`}];function J(r){return _e.filter(a=>a.appliesTo.includes(r))}const Xe=`<?xml version="1.0" encoding="UTF-8"?>
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
</xsl:stylesheet>`,Ne=`<?xml version="1.0" encoding="UTF-8"?>
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
</xsl:stylesheet>`,We=`<?xml version="1.0" encoding="UTF-8"?>
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
</xsl:stylesheet>`,$e=`<?xml version="1.0" encoding="UTF-8"?>
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
</xsl:stylesheet>`,Ke=`<?xml version="1.0" encoding="UTF-8"?>
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
</xsl:stylesheet>`,ne=[{id:"hello-world",label:"Hello World",description:`En basit — XSLT öğrenmek için başlangıç. Herhangi bir XML'i "Merhaba Dünya" çıktısına dönüştürür.`,moduleId:"fatura",docName:"Hello World",xslt:Xe},{id:"fatura-minimal",label:"Minimal e-Fatura",description:"Sadece başlık ve toplam — basit başlangıç için. Genişletilebilir.",moduleId:"fatura",docName:"Atlas Minimal Fatura",xslt:Ne},{id:"fatura-standart",label:"Standart e-Fatura",description:"Tam yapı: Gönderen/Alıcı kartları + ürün tablosu + KDV + genel toplam. Mavi renk şeması.",moduleId:"fatura",docName:"Atlas Standart Fatura",xslt:We},{id:"arsiv-minimal",label:"Minimal e-Arşiv",description:"e-Arşiv için basit yapı — yeşil renk şeması.",moduleId:"arsiv",docName:"Atlas Minimal Arşiv",xslt:$e},{id:"arsiv-standart",label:"Standart e-Arşiv",description:"e-Arşiv tam yapı: satıcı/müşteri + tablo + toplam. Yeşil renk şeması.",moduleId:"arsiv",docName:"Atlas Standart Arşiv",xslt:Ke}],Ve=Object.freeze(Object.defineProperty({__proto__:null,TEMPLATES:ne},Symbol.toStringTag,{value:"Module"})),w={invoice:{root:"Invoice",ns:"urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",label:"Fatura (Invoice)"},despatch:{root:"DespatchAdvice",ns:"urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2",label:"İrsaliye (DespatchAdvice)"},receipt:{root:"Receipt",ns:"urn:oasis:names:specification:ubl:schema:xsd:Receipt-2",label:"Makbuz (Receipt)"}},M=r=>async()=>(await V(async()=>{const{getInlineXslt:a}=await import("./xsltContent-DSdp148c.js");return{getInlineXslt:a}},[])).getInlineXslt(r)??"",ee=r=>async()=>(await V(async()=>{const{getAntrepoTemplateById:a}=await import("./antrepoTemplates-CDmg9PGA.js");return{getAntrepoTemplateById:a}},[])).getAntrepoTemplateById(r)?.xslt??"",D=r=>async()=>(await V(async()=>{const{TEMPLATES:a}=await Promise.resolve().then(()=>Ve);return{TEMPLATES:a}},void 0)).TEMPLATES.find(a=>a.id===r)?.xslt??"",Ue=[{id:"fatura",label:"e-Fatura",description:"Temel / Ticari e-Fatura",color:"#6366f1",family:"invoice",profileIds:["TEMELFATURA","TICARIFATURA","KAMU"],sampleXml:"ebelge/samples/e-Fatura-TEMEL.xml",defaults:[{id:"gib-fatura",label:"GİB e-Fatura Şablonu",description:"Sade, resmi görünüm",moduleId:"fatura",load:M("gib/v2/e-Fatura-Sablon.xslt")},{id:"antrepo-fatura",label:"Antrepo e-Fatura",description:"Logolu, banka bilgili profesyonel şablon",moduleId:"antrepo-fatura",load:ee("antrepo-fatura")},{id:"fatura-standart",label:"Standart Fatura",description:"Satır tablosu ve toplamlar",moduleId:"fatura",load:D("fatura-standart")},{id:"fatura-minimal",label:"Minimal Fatura",description:"Az alanlı, sade başlangıç",moduleId:"fatura",load:D("fatura-minimal")}]},{id:"arsiv",label:"e-Arşiv",description:"e-Arşiv Fatura",color:"#10b981",family:"invoice",profileIds:["EARSIVFATURA"],sampleXml:"ebelge/samples/e-Arsiv-TEMEL.xml",defaults:[{id:"gib-arsiv",label:"GİB e-Arşiv Şablonu",description:"Sade, resmi görünüm",moduleId:"arsiv",load:M("gib/v2/e-Arsiv-Sablon.xslt")},{id:"antrepo-arsiv",label:"Antrepo e-Arşiv",description:"Logolu profesyonel şablon",moduleId:"antrepo-arsiv",load:ee("antrepo-arsiv")},{id:"arsiv-standart",label:"Standart e-Arşiv",description:"Satır tablosu ve toplamlar",moduleId:"arsiv",load:D("arsiv-standart")},{id:"arsiv-minimal",label:"Minimal e-Arşiv",description:"Az alanlı, sade başlangıç",moduleId:"arsiv",load:D("arsiv-minimal")}]},{id:"irsaliye",label:"e-İrsaliye",description:"Sevk irsaliyesi",color:"#0ea5e9",family:"despatch",sampleXml:"ebelge/samples/e-Irsaliye-TEMEL.xml",defaults:[{id:"irsaliye",label:"e-İrsaliye Şablonu",description:"Araç / sürücü / teslimat bilgili",moduleId:"irsaliye",load:M("community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt")}]},{id:"ihracat",label:"e-İhracat",description:"İhracat faturası",color:"#8b5cf6",family:"invoice",profileIds:["IHRACAT"],sampleXml:"ebelge/samples/e-Ihracat-TEMEL.xml",defaults:[{id:"ihracat",label:"e-İhracat Şablonu",description:"Teslim şartı ve GTİP alanlı",moduleId:"ihracat",load:M("community/IRPTeam-eFatura.xslt")}]},{id:"smm",label:"e-SMM",description:"Serbest meslek makbuzu",color:"#14b8a6",family:"invoice",sampleXml:"ebelge/samples/e-SMM-TEMEL.xml",defaults:[{id:"smm",label:"e-SMM Şablonu",description:"Stopaj ve hizmet bilgili",moduleId:"smm",load:M("community/hzkucuk-eFatura-smm.xslt")}]},{id:"mustahsil",label:"e-Müstahsil",description:"Müstahsil makbuzu",color:"#84cc16",family:"invoice",sampleXml:"ebelge/samples/e-Mustahsil-TEMEL.xml",defaults:[{id:"mustahsil",label:"e-Müstahsil Şablonu",description:"Müstahsil / stopaj bilgili",moduleId:"mustahsil",load:M("community/hzkucuk-eFatura-mustahsil.xslt")}]},{id:"bilet",label:"e-Bilet",description:"Yolcu / etkinlik bileti",color:"#f97316",family:"invoice",sampleXml:"ebelge/samples/e-Bilet-TEMEL.xml",defaults:[{id:"bilet",label:"e-Bilet Şablonu",description:"Yolcu, sefer ve koltuk bilgili",moduleId:"bilet",load:M("community/hzkucuk-eFatura-bilet.xslt")}]}],Oe=r=>`/edesign-deploy/${r}`;async function te(r){const a=await fetch(Oe(r.sampleXml));if(!a.ok)throw new Error(`Örnek XML yüklenemedi (${a.status})`);return a.text()}const ae="http://www.w3.org/1999/XSL/Transform",_="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",de=r=>r.replace(/^\uFEFF/,"").replace(/^ï»¿/,"");function N(r){const a=new DOMParser().parseFromString(de(r),"application/xml"),o=a.getElementsByTagName("parsererror")[0];return{doc:a,error:o?(o.textContent||"ayrıştırma hatası").split(`
`)[0].slice(0,160):null}}const ce=r=>Object.keys(w).find(a=>w[a].ns===r)??null;function pe(r,a){try{const o=new XSLTProcessor;o.importStylesheet(r);const i=o.transformToDocument(a);return!i||!i.documentElement?"XSLT sonuç üretmedi":null}catch(o){return o instanceof Error?o.message:String(o)}}const R=(r,a)=>({ok:!r.some(o=>o.level==="error"),checks:r,info:a});function Ge(r,a,o){const i=[],u=[],{doc:b,error:v}=N(r);if(v)return R([{level:"error",text:`Dosya geçerli bir XML/XSLT değil: ${v}`}],u);const d=b.documentElement;if(d.namespaceURI!==ae||!["stylesheet","transform"].includes(d.localName))return R([{level:"error",text:`Bu dosya bir XSLT değil (kök eleman <${d.nodeName}>; xsl:stylesheet olmalı).`}],u);i.push({level:"ok",text:"Geçerli XSLT dosyası"});const p=d.getAttribute("version")||"1.0";u.push(["XSLT sürümü",p]),u.push(["Şablon (template) sayısı",String(b.getElementsByTagNameNS(ae,"template").length)]);const x=new Set;for(const m of r.matchAll(/xmlns(?::[\w.-]+)?\s*=\s*["']([^"']+)["']/g)){const T=ce(m[1]);T&&x.add(T)}const k=m=>(r.match(m)||[]).length,f={invoice:k(/\bInvoice(Line)?\b/g),despatch:k(/\bDespatch(Advice|Line)\b/g),receipt:k(/\bReceipt(Line)?\b/g)},h=(x.size?[...x]:Object.keys(f).filter(m=>f[m]>0)).sort((m,T)=>f[T]-f[m])[0]??null,j=w[a.family];if(h&&h!==a.family?i.push({level:"error",text:`Bu XSLT ${w[h].label} için hazırlanmış; ${a.label} için ${j.label} yapısında bir XSLT gerekli.`}):h?i.push({level:"ok",text:`Belge yapısı uygun: ${j.label}`}):i.push({level:"warn",text:"XSLT belge yapısını belirtmiyor; uygunluk örnek veriyle denenerek kontrol edildi."}),a.family==="invoice"){const m=/EARSIV|e-Ar[şs]iv/i.test(r),T=/TEMELFATURA|TICARIFATURA/.test(r);a.id==="fatura"&&m&&!T&&i.push({level:"warn",text:"XSLT e-Arşiv faturasına özel görünüyor; e-Fatura için başlık ve alanları kontrol edin."}),a.id==="arsiv"&&T&&!m&&i.push({level:"warn",text:"XSLT e-Fatura (Temel/Ticari) için hazırlanmış görünüyor; e-Arşiv başlığını kontrol edin."})}if((p.startsWith("2")||p.startsWith("3"))&&i.push({level:"warn",text:`XSLT ${p} olarak işaretli; tasarımcı 1.0 motoruyla çalıştırır, 2.0'a özel fonksiyonlar çalışmayabilir.`}),o&&!i.some(m=>m.level==="error")){const m=N(o),T=m.error?null:pe(b,m.doc);i.push(T?{level:"error",text:`${a.label} örnek verisiyle çalıştırılamadı: ${T}`}:{level:"ok",text:`${a.label} örnek verisiyle başarıyla çalıştı`})}return R(i,u)}const L=(r,a,o=_)=>Array.from(r.children).find(u=>u.localName===a&&u.namespaceURI===o)?.textContent?.trim()??"";function ie(r,a){const o=Array.from(r.children).find(v=>v.localName===a);if(!o)return"";const i=o.getElementsByTagNameNS(_,"Name")[0]?.textContent?.trim();if(i)return i;const u=o.getElementsByTagNameNS(_,"FirstName")[0]?.textContent?.trim()??"",b=o.getElementsByTagNameNS(_,"FamilyName")[0]?.textContent?.trim()??"";return`${u} ${b}`.trim()}function K(r,a,o){const i=[],u=[],{doc:b,error:v}=N(r);if(v)return R([{level:"error",text:`Dosya geçerli bir XML değil: ${v}`}],u);const d=b.documentElement,p=ce(d.namespaceURI),x=w[a.family];if(p!==a.family){const n=p?w[p].label:`<${d.localName}>`;return R([{level:"error",text:`Bu XML bir ${n} belgesi; ${a.label} için ${x.label} belgesi gerekli.`}],u)}i.push({level:"ok",text:`Belge yapısı uygun: ${x.label}`});const k=L(d,"ProfileID"),f=n=>n.toUpperCase().replace(/[^A-Z0-9]/g,"");a.profileIds&&k&&!a.profileIds.some(n=>f(k).includes(f(n)))&&i.push({level:"warn",text:`Belgenin profili ${k}; ${a.label} için beklenen: ${a.profileIds.join(" / ")}.`});const S=a.family==="despatch"?"DespatchLine":a.family==="receipt"?"ReceiptLine":"InvoiceLine",h=Array.from(d.children).filter(n=>n.localName===S).length,j=L(d,"InvoiceTypeCode")||L(d,"DespatchAdviceTypeCode"),m=ie(d,a.family==="despatch"?"DespatchSupplierParty":"AccountingSupplierParty"),T=ie(d,a.family==="despatch"?"DeliveryCustomerParty":"AccountingCustomerParty"),t=[["Belge no",L(d,"ID")],["Tarih",L(d,"IssueDate")],["Profil",k],["Tip",j],["Para birimi",L(d,"DocumentCurrencyCode")],["Gönderen",m],["Alıcı",T],["Satır sayısı",String(h)]];if(u.push(...t.filter(([,n])=>n)),h||i.push({level:"warn",text:"Belgede kalem (satır) bulunamadı; satır tablosu boş görünür."}),o){const n=N(o),s=n.error?`XSLT okunamadı: ${n.error}`:pe(n.doc,b);i.push(s?{level:"error",text:`Seçilen XSLT bu veriyle çalıştırılamadı: ${s}`}:{level:"ok",text:"Seçilen XSLT bu veriyle başarıyla çalıştı"})}return R(i,u)}const He=5*1024*1024,Ye=["Belge türü","Tasarım (XSLT)","Veri (XML)"],F=(r,a="#6366f1")=>({background:r?`${a}22`:"rgba(30, 41, 59, 0.45)",border:`1px solid ${r?a:"rgba(255,255,255,0.08)"}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",color:"white",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s",width:"100%",boxShadow:r?`0 0 0 3px ${a}33`:"none"}),Ze=r=>new Promise((a,o)=>{const i=new FileReader;i.onload=()=>a(String(i.result??"")),i.onerror=()=>o(i.error??new Error("Dosya okunamadı")),i.readAsText(r)}),me=({result:r})=>e.jsxs("div",{"data-wizard-checks":r.ok?"ok":"error",style:{display:"flex",flexDirection:"column",gap:6},children:[r.checks.map((a,o)=>e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",gap:8,fontSize:13,color:a.level==="ok"?"#6ee7b7":a.level==="warn"?"#fcd34d":"#fca5a5"},children:[a.level==="ok"?e.jsx(U,{size:16,style:{flexShrink:0}}):a.level==="warn"?e.jsx(Se,{size:16,style:{flexShrink:0}}):e.jsx(Te,{size:16,style:{flexShrink:0}}),e.jsx("span",{children:a.text})]},o)),r.info.length>0&&e.jsx("div",{style:{display:"grid",gridTemplateColumns:"auto 1fr",gap:"4px 14px",marginTop:8,fontSize:12},children:r.info.map(([a,o])=>e.jsxs(fe.Fragment,{children:[e.jsx("span",{style:{color:"#64748b"},children:a}),e.jsx("span",{style:{color:"#e2e8f0",wordBreak:"break-word"},children:o})]},a))})]}),re=({accept:r,hint:a,file:o,busy:i,onFile:u})=>{const b=g.useRef(null),[v,d]=g.useState(!1);return e.jsxs("div",{style:{marginTop:14},children:[e.jsx("input",{ref:b,type:"file",accept:r,"data-wizard-file":!0,style:{display:"none"},onChange:p=>{const x=p.target.files?.[0];x&&u(x),p.target.value=""}}),e.jsxs("div",{onClick:()=>b.current?.click(),onDragOver:p=>{p.preventDefault(),d(!0)},onDragLeave:()=>d(!1),onDrop:p=>{p.preventDefault(),d(!1);const x=p.dataTransfer.files?.[0];x&&u(x)},style:{border:`2px dashed ${v?"#6366f1":"rgba(148,163,184,0.3)"}`,borderRadius:14,padding:"22px 16px",textAlign:"center",cursor:"pointer",color:"#94a3b8",background:v?"rgba(99,102,241,0.08)":"rgba(15,23,42,0.4)"},children:[i?e.jsx(se,{size:26}):e.jsx(X,{size:26}),e.jsx("div",{style:{marginTop:8,fontSize:14,color:"#e2e8f0",fontWeight:600},children:o?"Başka dosya seç":"Dosya seçin veya buraya sürükleyin"}),e.jsx("div",{style:{fontSize:12,marginTop:4},children:a})]}),o&&e.jsxs("div",{style:{marginTop:14,display:"grid",gridTemplateColumns:"minmax(0, 1fr) minmax(0, 1fr)",gap:14},children:[e.jsxs("div",{style:{background:"rgba(15,23,42,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:12,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:700,marginBottom:8},children:[e.jsx(oe,{size:16,color:"#a5b4fc"}),e.jsx("span",{"data-wizard-file-name":!0,style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:o.name}),e.jsxs("span",{style:{color:"#64748b",fontWeight:400,marginLeft:"auto",flexShrink:0},children:[(o.size/1024).toFixed(1)," KB"]})]}),e.jsx("pre",{style:{margin:0,maxHeight:220,overflow:"auto",fontSize:11,lineHeight:1.45,color:"#cbd5e1",background:"#020617",borderRadius:8,padding:10,whiteSpace:"pre"},children:de(o.text).split(`
`).slice(0,40).join(`
`)})]}),e.jsxs("div",{style:{background:"rgba(15,23,42,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:12},children:[e.jsx("div",{style:{fontSize:13,fontWeight:700,marginBottom:10},children:"Uygunluk kontrolü"}),e.jsx(me,{result:o.result})]})]})]})},Qe=({onFinish:r})=>{const[a,o]=g.useState(0),[i,u]=g.useState(null),[b,v]=g.useState(null),[d,p]=g.useState(""),[x,k]=g.useState(null),[f,S]=g.useState("default"),[h,j]=g.useState(null),[m,T]=g.useState(null),[t,n]=g.useState(null),[s,c]=g.useState(!1),[A,z]=g.useState(null);g.useEffect(()=>{if(!i)return;let l=!0;return v(null),te(i).then(y=>{l&&v(y)}).catch(y=>l&&z(y.message)),()=>{l=!1}},[i]);const C=i?.defaults.find(l=>l.id===d)??null,E=l=>{l.id!==i?.id&&(u(l),p(l.defaults[0].id),k(null),j(null),S("default")),o(1)},O=async(l,y)=>{if(i){if(z(null),l.size>He){z(`Dosya çok büyük (en fazla 5 MB): ${(l.size/1024/1024).toFixed(1)} MB`);return}c(!0);try{const I=await Ze(l),xe=y==="xslt"?Ge(I,i,b):K(I,i,m),G={name:l.name,size:l.size,text:I,result:xe};y==="xslt"?k(G):j(G)}catch(I){z(I instanceof Error?I.message:String(I))}finally{c(!1)}}},ue=async()=>{if(i){c(!0),z(null);try{const l=d==="own"?x?.text??"":await(C?.load()??Promise.resolve(""));if(!l)throw new Error("XSLT yüklenemedi");T(l);const y=b??await te(i);v(y),n(K(y,i,l)),h&&j({...h,result:K(h.text,i,l)}),o(2)}catch(l){z(l instanceof Error?l.message:String(l))}finally{c(!1)}}},ge=()=>{if(!i||!m)return;const l=f==="own"?h?.text:b;l&&r({moduleId:d==="own"?i.id:C?.moduleId??i.id,docName:d==="own"&&x?x.name.replace(/\.(xslt|xsl)$/i,""):`${i.label} Tasarımı`,xslt:m,xml:l})},P=a===1?(d==="own"?!!x?.result.ok:!!C)&&!!b:a===2?f==="own"?!!h?.result.ok:!!t?.ok:!1,W=(l,y)=>e.jsxs("div",{style:{marginBottom:18},children:[e.jsx("h2",{style:{margin:0,fontSize:22,fontWeight:800},children:l}),e.jsx("p",{style:{margin:"4px 0 0",color:"#94a3b8",fontSize:14},children:y})]});return e.jsxs("div",{"data-design-wizard":!0,"data-wizard-step":a,style:{width:"100%",background:"rgba(15, 23, 42, 0.7)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:24,padding:"28px 28px 22px",boxShadow:"0 24px 60px rgba(0,0,0,0.35)",color:"white"},children:[e.jsx("div",{style:{display:"flex",gap:8,marginBottom:26},children:Ye.map((l,y)=>e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{style:{height:4,borderRadius:4,background:y<=a?"linear-gradient(90deg,#6366f1,#0ea5e9)":"rgba(148,163,184,0.2)"}}),e.jsxs("div",{style:{marginTop:6,fontSize:12,fontWeight:700,color:y===a?"#e2e8f0":"#64748b"},children:[y+1,". ",l,y<a&&y===0&&i?` · ${i.label}`:""]})]},l))}),a===0&&e.jsxs(e.Fragment,{children:[W("Hangi belgeyi tasarlayacaksınız?","Belge türünü seçin; şablon ve veri kontrolleri bu türe göre yapılır."),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:12},children:Ue.map(l=>e.jsx("button",{type:"button","data-doc-type":l.id,onClick:()=>E(l),style:F(i?.id===l.id,l.color),children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:38,height:38,borderRadius:10,background:`${l.color}26`,color:l.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:e.jsx(le,{size:20})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:700,fontSize:15},children:l.label}),e.jsx("div",{style:{color:"#94a3b8",fontSize:12},children:l.description})]})]})},l.id))})]}),a===1&&i&&e.jsxs(e.Fragment,{children:[W(`${i.label} için tasarım şablonu`,"Hazır bir şablonla başlayın ya da kendi XSLT dosyanızı yükleyin."),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))",gap:12},children:i.defaults.map(l=>e.jsxs("button",{type:"button","data-xslt-option":l.id,onClick:()=>p(l.id),style:F(d===l.id,i.color),children:[e.jsxs("div",{style:{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:6},children:[d===l.id&&e.jsx(U,{size:15,color:"#6ee7b7"}),l.label]}),e.jsx("div",{style:{color:"#94a3b8",fontSize:12,marginTop:3},children:l.description}),e.jsx("div",{style:{color:"#64748b",fontSize:11,marginTop:6},children:"Varsayılan şablon"})]},l.id))}),e.jsxs("button",{type:"button","data-xslt-option":"own",onClick:()=>p("own"),style:{...F(d==="own","#f59e0b"),marginTop:12},children:[e.jsxs("div",{style:{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8},children:[e.jsx(X,{size:16})," Kendi XSLT dosyamı kullan"]}),e.jsxs("div",{style:{color:"#94a3b8",fontSize:12,marginTop:3},children:["Dosyanız ",w[i.family].label," yapısına ve ",i.label," türüne uygunluk için kontrol edilir."]})]}),d==="own"&&e.jsx(re,{accept:".xslt,.xsl",hint:".xslt veya .xsl · en fazla 5 MB",file:x,busy:s,onFile:l=>O(l,"xslt")})]}),a===2&&i&&e.jsxs(e.Fragment,{children:[W("Tasarımda hangi veri görünsün?","Önizlemede kullanılacak e-belge XML’ini seçin. Tasarım her veriyle çalışır; bu sadece önizleme içindir."),e.jsxs("button",{type:"button","data-xml-option":"default",onClick:()=>S("default"),style:F(f==="default",i.color),children:[e.jsxs("div",{style:{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8},children:[e.jsx(ye,{size:16})," Varsayılan örnek XML"]}),e.jsxs("div",{style:{color:"#94a3b8",fontSize:12,marginTop:3},children:[i.label," için hazır örnek belge (",i.sampleXml.split("/").pop(),")"]}),f==="default"&&t&&e.jsx("div",{style:{marginTop:10},children:e.jsx(me,{result:t})})]}),e.jsxs("button",{type:"button","data-xml-option":"own",onClick:()=>S("own"),style:{...F(f==="own","#f59e0b"),marginTop:12},children:[e.jsxs("div",{style:{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8},children:[e.jsx(X,{size:16})," Kendi XML dosyamı seç"]}),e.jsxs("div",{style:{color:"#94a3b8",fontSize:12,marginTop:3},children:["Gerçek bir ",i.label," XML’i (",w[i.family].root,") yükleyin; seçtiğiniz şablonla denenir."]})]}),f==="own"&&e.jsx(re,{accept:".xml",hint:".xml · en fazla 5 MB",file:h,busy:s,onFile:l=>O(l,"xml")})]}),A&&e.jsx("div",{style:{marginTop:14,color:"#fca5a5",fontSize:13},children:A}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:24},children:[e.jsxs("button",{type:"button","data-wizard-back":!0,disabled:a===0,onClick:()=>{z(null),o(l=>Math.max(0,l-1))},style:{padding:"10px 18px",borderRadius:10,border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:a===0?"#475569":"#cbd5e1",cursor:a===0?"default":"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit"},children:[e.jsx(ve,{size:16})," Geri"]}),a>0&&e.jsxs("button",{type:"button","data-wizard-next":!0,disabled:!P||s,onClick:a===1?ue:ge,style:{padding:"10px 22px",borderRadius:10,border:"none",fontWeight:700,fontFamily:"inherit",background:P&&!s?"linear-gradient(135deg,#6366f1,#0ea5e9)":"rgba(148,163,184,0.2)",color:P&&!s?"white":"#64748b",cursor:P&&!s?"pointer":"default",display:"flex",alignItems:"center",gap:6},children:[s?e.jsx(se,{size:16}):null,a===1?"Veri seçimine geç":"Tasarım ekranını aç"," ",e.jsx(ke,{size:16})]})]})]})},qe=[{id:"fatura",name:"e-Fatura",icon:e.jsx(le,{size:24}),color:"#6366f1",template:"gib/v2/e-Fatura-Sablon.xslt"},{id:"arsiv",name:"e-Arşiv",icon:e.jsx(Me,{size:24}),color:"#10b981",template:"gib/v2/e-Arsiv-Sablon.xslt"},{id:"irsaliye",name:"e-İrsaliye",icon:e.jsx(Le,{size:24}),color:"#0ea5e9",template:"community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt"},{id:"ihracat",name:"e-İhracat",icon:e.jsx(Re,{size:24}),color:"#8b5cf6",template:"community/IRPTeam-eFatura.xslt"},{id:"mikro_ihracat",name:"e-Mikro İhracat",icon:e.jsx(Ee,{size:24}),color:"#a855f7",template:"community/IRPTeam-eFatura.xslt"},{id:"smm",name:"e-SMM (Serbest Meslek)",icon:e.jsx(Fe,{size:24}),color:"#14b8a6",template:"community/hzkucuk-eFatura-smm.xslt"},{id:"mustahsil",name:"e-Müstahsil Makbuzu",icon:e.jsx(Pe,{size:24}),color:"#84cc16",template:"community/hzkucuk-eFatura-mustahsil.xslt"},{id:"bilet",name:"e-Bilet",icon:e.jsx(Be,{size:24}),color:"#f97316",template:"community/hzkucuk-eFatura-bilet.xslt"},{id:"makbuz",name:"e-Makbuz",icon:e.jsx(De,{size:24}),color:"#06b6d4",template:"community/hzkucuk-eFatura-makbuz.xslt"}],lt=({onSelect:r,onLogout:a,onSelectXsltEditor:o})=>{const i=g.useRef(null),[u,b]=g.useState(!1),[v,d]=g.useState(!1),[p,x]=g.useState(null),[k,f]=g.useState(null),[S,h]=g.useState(null),[j,m]=g.useState(!1);g.useEffect(()=>{be.getMe().then(h).catch(console.error)},[]);const T=t=>{const n=t.target.files?.[0];if(!n)return;const s=5*1024*1024;if(n.size>s){B.getState().pushToast({kind:"error",title:"Dosya çok büyük",description:`Maksimum 5 MB. Seçilen dosya: ${(n.size/1024/1024).toFixed(1)} MB`}),t.target.value="";return}const c=[".xslt",".xsl",".xml"],A=n.name.toLowerCase();if(!c.some(C=>A.endsWith(C))){B.getState().pushToast({kind:"error",title:"Geçersiz dosya tipi",description:"Yalnızca .xslt, .xsl veya .xml dosyaları kabul edilir."}),t.target.value="";return}const z=new FileReader;z.onload=C=>{const E=C.target?.result;if(!E||!E.trim().startsWith("<")){B.getState().pushToast({kind:"error",title:"Geçersiz XSLT içeriği",description:"Dosya XML/XSLT olarak okunamadı."}),t.target.value="";return}r("custom",n.name,"Özel Belge",E)},z.onerror=()=>{B.getState().pushToast({kind:"error",title:"Dosya okunamadı",description:z.error?.message??"Bilinmeyen hata"}),t.target.value=""},z.readAsText(n)};return e.jsxs("div",{style:{minHeight:"100vh",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0f172a",fontFamily:"Inter, sans-serif",color:"white",padding:"2rem",boxSizing:"border-box",position:"relative"},children:[e.jsxs("div",{style:{position:"absolute",top:"2rem",right:"2rem",display:"flex",gap:"1rem",zIndex:50},children:[S&&e.jsxs("div",{"data-credit-badge":!0,title:"Kalan tasarım hakkı",style:{display:"flex",alignItems:"center",gap:"6px",padding:"0.6rem 1rem",borderRadius:"12px",border:"1px solid rgba(16,185,129,0.3)",background:"rgba(16,185,129,0.1)",color:"#6ee7b7",fontSize:"0.85rem",fontWeight:700},children:[e.jsx(H,{size:16})," ",S.credits??0," tasarım hakkı"]}),e.jsxs("button",{onClick:()=>d(!0),style:{background:"linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",border:"none",padding:"0.6rem 1.4rem",borderRadius:"12px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s",boxShadow:"0 4px 15px rgba(99, 102, 241, 0.3)",fontWeight:"bold"},onMouseOver:t=>t.currentTarget.style.transform="translateY(-2px)",onMouseOut:t=>t.currentTarget.style.transform="translateY(0)",children:[e.jsx(ze,{size:18}),e.jsx("span",{style:{fontSize:"0.9rem"},children:"Paket Al"})]}),e.jsxs("button",{onClick:()=>b(!0),style:{background:"rgba(30, 41, 59, 0.6)",border:"1px solid rgba(255,255,255,0.1)",padding:"0.6rem 1.2rem",borderRadius:"12px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s",backdropFilter:"blur(10px)"},onMouseOver:t=>t.currentTarget.style.background="rgba(30, 41, 59, 0.9)",onMouseOut:t=>t.currentTarget.style.background="rgba(30, 41, 59, 0.6)",children:[e.jsx(Y,{size:18,color:"#818cf8"}),e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:"500"},children:"Profilim"})]}),e.jsxs("button",{onClick:a,style:{background:"rgba(239, 68, 68, 0.1)",border:"1px solid rgba(239, 68, 68, 0.2)",padding:"0.6rem 1.2rem",borderRadius:"12px",color:"#f87171",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s",backdropFilter:"blur(10px)"},onMouseOver:t=>{t.currentTarget.style.background="rgba(239, 68, 68, 0.2)",t.currentTarget.style.borderColor="rgba(239, 68, 68, 0.4)"},onMouseOut:t=>{t.currentTarget.style.background="rgba(239, 68, 68, 0.1)",t.currentTarget.style.borderColor="rgba(239, 68, 68, 0.2)"},children:[e.jsx(je,{size:18}),e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:"500"},children:"Çıkış"})]})]}),u&&S&&e.jsx("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem"},children:e.jsxs("div",{style:{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"24px",width:"100%",maxWidth:"450px",padding:"2.5rem",position:"relative",boxShadow:"0 25px 50px -12px rgba(0, 0, 0, 0.5)"},children:[e.jsx("button",{onClick:()=>b(!1),style:{position:"absolute",top:"1.5rem",right:"1.5rem",background:"none",border:"none",color:"#64748b",cursor:"pointer"},children:e.jsx(Z,{size:24})}),e.jsxs("div",{style:{textAlign:"center",marginBottom:"2rem"},children:[e.jsx("div",{style:{width:"80px",height:"80px",background:"#6366f1",borderRadius:"24px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",boxShadow:"0 10px 15px -3px rgba(99, 102, 241, 0.4)"},children:e.jsx(Y,{size:40,color:"white"})}),e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:"bold",marginBottom:"0.5rem"},children:S.full_name||"Kullanıcı"}),e.jsx("span",{style:{background:"#0f172a",padding:"4px 12px",borderRadius:"20px",fontSize:"0.75rem",color:"#818cf8",border:"1px solid rgba(99, 102, 241, 0.2)"},children:S.role==="admin"?"Yönetici Hesabı":"Standart Hesap"})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"rgba(15, 23, 42, 0.5)",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx(we,{size:20,color:"#94a3b8"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"Firma"}),e.jsx("span",{style:{fontSize:"0.95rem"},children:S.company_name||"-"})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"rgba(15, 23, 42, 0.5)",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx(Ae,{size:20,color:"#94a3b8"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"E-Posta"}),e.jsx("span",{style:{fontSize:"0.95rem"},children:S.username})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"rgba(15, 23, 42, 0.5)",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx(Ce,{size:20,color:"#94a3b8"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"Telefon"}),e.jsx("span",{style:{fontSize:"0.95rem"},children:S.phone_number||"-"})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",background:"linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))",padding:"1rem",borderRadius:"16px",border:"1px solid rgba(16, 185, 129, 0.2)"},children:[e.jsx(H,{size:20,color:"#10b981"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx("span",{style:{fontSize:"0.65rem",color:"#10b981",textTransform:"uppercase",letterSpacing:"1px"},children:"Mevcut Kredi"}),e.jsxs("span",{style:{fontSize:"1.25rem",fontWeight:"bold",color:"#10b981"},children:[S.credits," ",e.jsx("span",{style:{fontSize:"0.8rem",fontWeight:"normal"},children:"Tasarım"})]})]})]})]})]})}),e.jsx("input",{type:"file",ref:i,style:{display:"none"},accept:".xslt,.xsl,.xml",onChange:T}),e.jsxs("div",{style:{width:"100%",maxWidth:"1000px",display:"flex",flexDirection:"column",alignItems:"center"},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"3rem"},children:[e.jsx("h1",{style:{fontSize:"clamp(2.5rem, 6vw, 3.5rem)",fontWeight:"900",marginBottom:"1rem",background:"linear-gradient(135deg, #fff 0%, #94a3b8 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-1px"},children:"E-Belge Tasarımcı"}),e.jsx("p",{style:{color:"#94a3b8",fontSize:"1.1rem",maxWidth:"600px",margin:"0 auto"},children:"Yeni bir tasarım için adımları izleyin: belge türü, şablon ve veri."})]}),e.jsx("div",{style:{width:"100%",marginBottom:"2rem"},children:e.jsx(Qe,{onFinish:t=>o?.(t.moduleId,t.xslt,t.docName,t.xml)})}),e.jsx("button",{type:"button","data-toggle-more-options":!0,onClick:()=>m(t=>!t),style:{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:999,color:"#94a3b8",padding:"8px 18px",cursor:"pointer",fontSize:"0.85rem",marginBottom:"2rem",fontFamily:"inherit"},children:j?"Diğer seçenekleri gizle":"Diğer başlangıç seçenekleri (klasik tasarımcı, hazır şablonlar)"}),j&&e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:"24px",width:"100%",marginBottom:"4rem"},children:e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"16px",width:"100%"},children:[e.jsxs("div",{onClick:()=>i.current?.click(),style:{background:"rgba(30, 41, 59, 0.4)",border:"1px dashed rgba(255,255,255,0.1)",borderRadius:"24px",padding:"2rem",cursor:"pointer",display:"flex",flexDirection:"column",gap:"1.5rem",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",backdropFilter:"blur(10px)"},children:[e.jsx("div",{style:{width:"56px",height:"56px",background:"rgba(255,255,255,0.1)",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:"white"},children:e.jsx(X,{size:30})}),e.jsxs("div",{children:[e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:"bold",marginBottom:"0.5rem"},children:"Kendi Tasarımın"}),e.jsx("p",{style:{color:"#94a3b8",fontSize:"0.9rem",lineHeight:"1.5"},children:"Mevcut bir XSLT dosyanız mı var? Dosyanızı yükleyin ve gelişmiş görsel editörümüzle üzerinde değişiklik yapın."})]}),e.jsx("div",{style:{color:"white",fontWeight:"bold",fontSize:"0.9rem"},children:"Dosya Seç ve Yükle ›"})]}),o&&e.jsxs("div",{onClick:()=>o(),title:"XSLT Editör — Monaco + canlı preview. XSLT bilen kullanıcılar için.",style:{background:"linear-gradient(135deg, rgba(16,185,129,0.12), rgba(52,211,153,0.08))",border:"1px solid rgba(16,185,129,0.35)",borderRadius:"24px",padding:"2rem",cursor:"pointer",display:"flex",flexDirection:"column",gap:"1.5rem",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",backdropFilter:"blur(10px)",position:"relative",overflow:"hidden"},onMouseEnter:t=>{t.currentTarget.style.borderColor="rgba(16,185,129,0.7)",t.currentTarget.style.transform="translateY(-2px)",t.currentTarget.style.boxShadow="0 12px 32px rgba(16,185,129,0.18)"},onMouseLeave:t=>{t.currentTarget.style.borderColor="rgba(16,185,129,0.35)",t.currentTarget.style.transform="translateY(0)",t.currentTarget.style.boxShadow="none"},children:[e.jsx("div",{style:{position:"absolute",top:12,right:12,padding:"4px 10px",background:"linear-gradient(135deg, #10b981, #34d399)",borderRadius:"999px",fontSize:"0.65rem",fontWeight:800,letterSpacing:"1px",color:"white"},children:"BETA"}),e.jsx("div",{style:{width:"56px",height:"56px",background:"linear-gradient(135deg, #10b981, #34d399)",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:"white"},children:e.jsx($,{size:28})}),e.jsxs("div",{children:[e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:"bold",marginBottom:"0.5rem",color:"white"},children:"XSLT Editör"}),e.jsx("p",{style:{color:"#cbd5e1",fontSize:"0.9rem",lineHeight:"1.5"},children:"Direkt XSLT kod yaz, canlı önizle. Monaco editör (VS Code altyapısı, syntax highlight, autocomplete) + sağda anlık HTML render. PHP gibi template mantığına alışkın kullanıcılar için."})]}),e.jsx("div",{style:{color:"#6ee7b7",fontWeight:"bold",fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"6px"},children:"Kod Yazmaya Başla ›"})]})]})}),e.jsxs("div",{style:{width:"100%",marginBottom:"2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1.5rem"},children:[e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to right, transparent, rgba(255,255,255,0.1))"}}),e.jsx("span",{style:{fontSize:"0.8rem",color:"#34d399",fontWeight:"bold",textTransform:"uppercase",letterSpacing:"2px"},children:"Hazır Şablonlarla Başla · XSLT Editör"}),e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to left, transparent, rgba(255,255,255,0.1))"}})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:"14px"},children:ne.map(t=>e.jsxs("div",{onClick:()=>o?.(t.moduleId,t.xslt,t.docName),title:`${t.label} — ${t.description}`,"data-template-id":t.id,style:{padding:"14px 16px",background:"rgba(16, 185, 129, 0.06)",border:"1px solid rgba(16, 185, 129, 0.25)",borderRadius:"12px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:"12px",transition:"all 0.2s ease"},onMouseEnter:n=>{n.currentTarget.style.background="rgba(16, 185, 129, 0.12)",n.currentTarget.style.borderColor="rgba(16, 185, 129, 0.5)",n.currentTarget.style.transform="translateY(-1px)"},onMouseLeave:n=>{n.currentTarget.style.background="rgba(16, 185, 129, 0.06)",n.currentTarget.style.borderColor="rgba(16, 185, 129, 0.25)",n.currentTarget.style.transform="translateY(0)"},children:[e.jsx("div",{style:{width:"36px",height:"36px",background:t.moduleId==="arsiv"?"linear-gradient(135deg, #059669, #10b981)":"linear-gradient(135deg, #6366f1, #8b5cf6)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",color:"white",flexShrink:0},children:e.jsx(oe,{size:18})}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"},children:[e.jsx("span",{style:{fontSize:"0.95rem",fontWeight:700,color:"#e2e8f0"},children:t.label}),e.jsx("span",{style:{padding:"1px 6px",background:"rgba(52, 211, 153, 0.15)",border:"1px solid rgba(52, 211, 153, 0.3)",borderRadius:"3px",fontSize:"0.6rem",fontWeight:700,color:"#6ee7b7",letterSpacing:"0.5px",textTransform:"uppercase"},children:t.moduleId==="arsiv"?"e-Arşiv":"e-Fatura"})]}),e.jsx("div",{style:{fontSize:"0.75rem",color:"#94a3b8",lineHeight:1.4},children:t.description})]})]},t.id))})]}),e.jsxs("div",{style:{width:"100%",marginBottom:"2rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1.5rem"},children:[e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to right, transparent, rgba(255,255,255,0.1))"}}),e.jsx("span",{style:{fontSize:"0.8rem",color:"#64748b",fontWeight:"bold",textTransform:"uppercase",letterSpacing:"2px"},children:"Hızlı Başlangıç Modülleri"}),e.jsx("div",{style:{height:"1px",flex:1,background:"linear-gradient(to left, transparent, rgba(255,255,255,0.1))"}})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))",gap:"16px",width:"100%"},children:qe.map(t=>{const n=q(t.id);return e.jsxs("div",{title:n.description,onClick:s=>{if(!s.target.closest("[data-subbtn]"))if(t.subTypes&&t.subTypes.length>0){const A=t.subTypes[0];r(`${t.id}_${A.id}`,t.template,`${t.name} - ${A.label}`)}else r(t.id,t.template,t.name)},style:{background:"rgba(30, 41, 59, 0.2)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"16px",padding:"16px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px",transition:"all 0.2s",backdropFilter:"blur(5px)",position:"relative"},onMouseEnter:s=>{s.currentTarget.style.background="rgba(99, 102, 241, 0.1)",s.currentTarget.style.borderColor="rgba(99, 102, 241, 0.3)",s.currentTarget.style.transform="translateY(-2px)"},onMouseLeave:s=>{s.currentTarget.style.background="rgba(30, 41, 59, 0.2)",s.currentTarget.style.borderColor="rgba(255,255,255,0.05)",s.currentTarget.style.transform="translateY(0)"},children:[e.jsx("div",{style:{width:"36px",height:"36px",background:`${t.color}15`,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",color:t.color,flexShrink:0},children:t.icon}),e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:600,color:"white",flex:1,lineHeight:1.2},children:t.name}),t.subTypes&&e.jsx("div",{onClick:s=>s.stopPropagation(),style:{display:"flex",gap:4,flexShrink:0},children:t.subTypes.map(s=>e.jsx("span",{"data-subbtn":"true",role:"button",tabIndex:0,onClick:c=>{c.stopPropagation(),r(`${t.id}_${s.id}`,t.template,`${t.name} - ${s.label}`)},onKeyDown:c=>{(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),c.currentTarget.click())},style:{display:"inline-flex",alignItems:"center",padding:"5px 10px",background:`${t.color}26`,border:`1px solid ${t.color}55`,borderRadius:999,color:t.color,fontSize:"0.72rem",fontWeight:700,letterSpacing:.3,cursor:"pointer",transition:"transform 0.15s, background 0.18s",userSelect:"none"},onMouseEnter:c=>{c.currentTarget.style.background=`${t.color}40`,c.currentTarget.style.transform="translateY(-1px)"},onMouseLeave:c=>{c.currentTarget.style.background=`${t.color}26`,c.currentTarget.style.transform="translateY(0)"},children:s.label},s.id))}),J(t.id).length>0&&e.jsxs("button",{type:"button",onClick:s=>{s.stopPropagation(),x(t.id)},style:{marginTop:8,alignSelf:"flex-start",padding:"4px 10px",background:"transparent",border:`1px solid ${t.color}55`,borderRadius:999,color:t.color,fontSize:"0.68rem",fontWeight:600,letterSpacing:.3,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4,transition:"background 0.15s"},onMouseEnter:s=>{s.currentTarget.style.background=`${t.color}15`},onMouseLeave:s=>{s.currentTarget.style.background="transparent"},children:[e.jsx($,{size:11})," Snippet'ler"]})]},t.id)})})]})]})]}),e.jsx(he,{isOpen:v,onClose:()=>d(!1),onSuccess:t=>h(n=>n?{...n,credits:t}:null)}),p&&(()=>{const t=J(p),n=q(p);return e.jsx("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)",padding:"2rem"},children:e.jsxs("div",{style:{background:"linear-gradient(180deg, #020617 0%, #0a0f1f 100%)",border:"1px solid rgba(148, 163, 184, 0.14)",padding:"2rem",borderRadius:"1.25rem",maxWidth:960,width:"100%",position:"relative",boxShadow:"0 24px 60px rgba(0, 0, 0, 0.55)",maxHeight:"90vh",overflowY:"auto"},children:[e.jsx("button",{onClick:()=>{x(null),f(null)},style:{position:"absolute",top:16,right:16,background:"rgba(15, 23, 42, 0.6)",border:"1px solid rgba(148, 163, 184, 0.18)",borderRadius:999,width:32,height:32,color:"#cbd5e1",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(Z,{size:16})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:16},children:[e.jsx($,{size:22,color:"#6366f1"}),e.jsx("h2",{style:{color:"#f8fafc",margin:0,fontSize:"1.4rem",fontWeight:800},children:"XSLT Snippet Kütüphanesi"})]}),e.jsxs("p",{style:{color:"#94a3b8",fontSize:13,margin:"0 0 16px"},children:[e.jsx("strong",{style:{color:"#a5b4fc"},children:n.description.split("—")[0].trim()})," için hazır section snippet'leri. Aşağıdaki kodları kopyalayıp Designer'da XSLT edit'ine yapıştırabilirsin."]}),t.length===0?e.jsx("div",{style:{padding:24,textAlign:"center",color:"#64748b"},children:"Bu modül için henüz snippet eklenmedi."}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:14},children:t.map(s=>e.jsxs("div",{style:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(148, 163, 184, 0.14)",borderRadius:12,padding:16},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8},children:[e.jsxs("div",{children:[e.jsx("div",{style:{color:"#f8fafc",fontWeight:700,fontSize:14},children:s.label}),e.jsx("div",{style:{color:"#94a3b8",fontSize:12,marginTop:2},children:s.description})]}),e.jsx("button",{type:"button",onClick:()=>{try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(s.code);else{const c=document.createElement("textarea");c.value=s.code,document.body.appendChild(c),c.select(),document.execCommand("copy"),document.body.removeChild(c)}f(s.id),setTimeout(()=>f(c=>c===s.id?null:c),1500)}catch(c){console.error("Kopyalama hatası:",c)}},style:{padding:"5px 12px",background:k===s.id?"rgba(16, 185, 129, 0.2)":"rgba(99, 102, 241, 0.15)",border:`1px solid ${k===s.id?"rgba(16, 185, 129, 0.5)":"rgba(99, 102, 241, 0.4)"}`,borderRadius:8,color:k===s.id?"#10b981":"#a5b4fc",cursor:"pointer",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4,fontFamily:"inherit"},children:k===s.id?e.jsxs(e.Fragment,{children:[e.jsx(U,{size:11})," Kopyalandı"]}):e.jsxs(e.Fragment,{children:[e.jsx(Ie,{size:11})," Kopyala"]})})]}),e.jsx("pre",{style:{background:"#020617",border:"1px solid rgba(148, 163, 184, 0.1)",borderRadius:8,padding:12,margin:0,color:"#a5b4fc",fontSize:11,fontFamily:"monospace",overflow:"auto",maxHeight:200,whiteSpace:"pre-wrap"},children:s.code})]},s.id))})]})})})()]})};export{lt as Selection};
