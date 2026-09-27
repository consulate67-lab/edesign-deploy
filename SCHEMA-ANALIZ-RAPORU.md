# e-Fatura Şema Analiz Raporu
**Tarih:** 2026-09-27  
**Araç:** Selim'in bana verdiği e-FaturaPaketi (`D:\EIslemler\e-FaturaPaketi.zip`)  
**Referans:** `xml/1_TEMEL_FATURA.xml` (GİB'in resmi örneği, 104 KB, 37 alan)

---

## A. Gerçek GİB'de Olan Toplam Alanlar (37 cbc:)

### Belge Düzeyi (Header)
| # | Alan | Tür | Açıklama |
|---|------|-----|----------|
| 1 | `cbc:UBLVersionID` | **Read-only** | Her zaman "2.1" |
| 2 | `cbc:CustomizationID` | **Read-only** | Her zaman "TR1.2" |
| 3 | `cbc:ProfileID` | **Read-only** | Belge profili (TEMELFATURA, TICARIFATURA) |
| 4 | `cbc:ID` | **Semi-readonly** | Fatura No — sistem tarafından üretilir |
| 5 | `cbc:CopyIndicator` | Hesaplanmış | false / true |
| 6 | `cbc:UUID` | **Read-only** | ETTN — GİB tarafından atanır |
| 7 | `cbc:IssueDate` | **Read-only** | Fatura tarihi (YYYY-MM-DD) |
| 8 | `cbc:IssueTime` | **Read-only** | **❗Şu anda eksik** |
| 9 | `cbc:InvoiceTypeCode` | **Read-only** | **❗"Fatura Tipi" — şu anda eksik** |
| 10 | `cbc:DocumentCurrencyCode` | **Read-only** | Para birimi (TRY, USD, EUR — codelist) |
| 11 | `cbc:LineCountNumeric` | Hesaplanmış | Satır sayısı |
| 12 | `cbc:Note` | Editable | Serbest metin |

### Adres (Party → PostalAddress)
| # | Alan | Editable | Açıklama |
|---|------|----------|----------|
| 13 | `cbc:StreetName` | ✓ | Sokak |
| 14 | `cbc:BuildingName` | ✓ | **Eksik** |
| 15 | `cbc:BuildingNumber` | ✓ | **Eksik** |
| 16 | `cbc:Room` | ✓ | **Eksik** |
| 17 | `cbc:CitySubdivisionName` | ✓ | İlçe **Eksik** |
| 18 | `cbc:CityName` | ✓ | İl |
| 19 | `cbc:PostalZone` | ✓ | Posta kodu **Eksik** |
| 20 | `cbc:Region` | ✓ | Bölge **Eksik** |
| 21 | `cac:Country/cbc:Name` | ✓ | Ülke |

### İletişim (Party → Contact)
| # | Alan | Editable |
|---|------|----------|
| 22 | `cbc:Telephone` | ✓ |
| 23 | `cbc:Telefax` | ✓ |
| 24 | `cbc:ElectronicMail` | ✓ |

### Satır ve Tutar
| # | Alan | Tür |
|---|------|-----|
| 25 | `cbc:InvoicedQuantity/@unitCode` | Hesaplanmış |
| 26 | `cbc:LineExtensionAmount` | Hesaplanmış |
| 27 | `cbc:PriceAmount` | Editable (birim fiyat) |
| 28 | `cbc:TaxAmount` | Hesaplanmış |
| 29 | `cbc:Percent` | Editable (KDV oranı) |
| 30 | `cbc:TaxableAmount` | Hesaplanmış |
| 31 | `cbc:TaxExclusiveAmount` | Hesaplanmış |
| 32 | `cbc:TaxInclusiveAmount` | Hesaplanmış |
| 33 | `cbc:PayableAmount` | Hesaplanmış |
| 34 | `cbc:AllowanceTotalAmount` | Hesaplanmış |
| 35 | `cbc:TaxExclusiveAmount` | (yukarıda) |
| 36 | `cbc:CalculationSequenceNumeric` | **Read-only** (KDV hesaplama sırası) |
| 37 | `cbc:TaxTypeCode` | Read-only (codelist) |

---

## B. ❗ Mevcut XSLT Yanlış Sorguları

### 1. Fatura Tipi — `cac:InvoiceType/cbc:Name`
**Sorun:** XSLT satır 353'te `<xsl:value-of select="//cac:InvoiceType/cbc:Name"/>` kullanıyor.  
**Gerçek GİB:** `cac:InvoiceType` elementi YOK, fatura tipi `<cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>` flat olarak var.  
**Çözüm:** `cac:InvoiceType/cbc:Name` sorgusunu kaldır, sadece `//cbc:InvoiceTypeCode` kullan.

### 2. Saat — `<cbc:IssueTime>`
**Sorun:** XSLT `<xsl:call-template name="fmt-time">` ile render ediyor.  
**Gerçek GİB:** Çoğu GİB örneğinde **hiç yok**. Sadece IssueDate var.  
**Çözüm:** Eğer XML'de yoksa, "—:—" şeklinde veya alanı gizli tutmak.

### 3. CustomerParty: WebsiteURI
**Sorun:** XSLT sorguluyor (`cac:Contact/cbc:WebsiteURI`).  
**Gerçek GİB:** Bu alan **yok** (UBL-TR 1.2.1'de tanımlandı ama çoğu örnekte kullanılmıyor).  
**Çözüm:** Opsiyonel alan — boşsa hata yok, sadece boş render.

---

## C. ⚠️ Read-Only Alanlar (Tasarımcıda içerik değiştirilemez)

Aşağıdaki alanlar **değiştirilemez** olmalı — sadece sistem tarafından doldurulur:

| # | XPath | Neden Read-only |
|---|-------|-----------------|
| 1 | `//cbc:UBLVersionID` | Her zaman "2.1" |
| 2 | `//cbc:CustomizationID` | GİB kuralı ("TR1.2") |
| 3 | `//cbc:ProfileID` | Belge tipi profili |
| 4 | `//cbc:UUID` | ETTN — GİB atar |
| 5 | `//cbc:IssueDate` | Fatura tarihi |
| 6 | `//cbc:IssueTime` | Fatura saati |
| 7 | `//cbc:InvoiceTypeCode` | Yalnızca codelist (SATIS / IADE / TEMELFATURA vb.) |
| 8 | `//cbc:DocumentCurrencyCode` | Codelist (TRY / USD / EUR) |
| 9 | `//cbc:CopyIndicator` | Boolean |
| 10 | `//cbc:LineCountNumeric` | Hesaplanmış |
| 11 | `//cac:TaxTotal/cbc:TaxAmount` | Hesaplanmış |
| 12 | `//cac:LegalMonetaryTotal/cbc:*` (hepsi) | Hesaplanmış (PayableAmount, LineExtensionAmount, vb.) |
| 13 | `//cac:InvoiceLine/cbc:LineExtensionAmount` | Hesaplanmış |
| 14 | `//cbc:CalculationSequenceNumeric` | Sıra numarası |
| 15 | `//cac:TaxScheme/cbc:TaxTypeCode` | Codelist |
| 16 | `//cac:PartyIdentification/cbc:ID/@schemeID` | VKN / TCKN / etc. — codelist |
| 17 | `//cac:TaxCategory/cbc:ID` | KDV kategorisi — codelist |
| 18 | `//cbc:EmbeddedDocumentBinaryObject` | Binary — sadece GİB doldurur |

**Tasarımcı tarafında:** Designer'ın "sayısal alanlar" / "XML dropdown" menusunda bu alanlar **gri** (read-only) olmalı, kullanıcı seçip içeriğini değiştirememeli.

---

## D. Selim'in Acıl İşaret Ettiği Buglar ve Düzeltme Planı

### Bug 1: "Fatura Tipi yazmıyor" → `gib/v2/e-Fatura-Sablon.xslt:353`
- **Sebep**: XSLT `cac:InvoiceType/cbc:Name` sorguluyor, gerçek şemada bu element yok.
- **Çözüm**: Satır 353'teki ifade `cac:InvoiceType/cbc:Name` → `cbc:InvoiceTypeCode` olarak değiştir. Karşılığında "SATIS" / "IADE" / "TEMELFATURA" yazacak.

### Bug 2: "Saat yok" → XSLT render ediyor, ama veri kaynağında eksik
- **Sebep**: 1_TEMEL_FATURA.xml'de `<cbc:IssueTime>` hiç yok. Bizim `e-Fatura-TICARI.xml`'de `10:30:00` var ama gerçek GİB örnekleri farklı.
- **Çözüm A**: Bizim örnek XML'i zenginleştir (zaten `<cbc:IssueTime>10:30:00</cbc:IssueTime>` mevcut, kontrol et).
- **Çözüm B**: Tasarımcı tarafında XML yoksa gösterim "—:—" olsun (daha iyi UX).

### Bug 3: "e fatura örneği yazsını kaldır" → renderOrnekStamp
- **Sebep**: `moduleBadge.ts`'te `renderOrnekStamp(moduleId)` her modülde ÖRNEK kaşesi üretiyor. Selim "yazıyı" görmek istemiyor.
- **Çözüm**: `renderOrnekStamp` fonksiyonu **kaldır** veya sadece tasarımcı önizlemesinde devre dışı bırak.

---

## E. FastReport Section Mimarisi Önerisi (Büyük Refactor)

### Şu anki durum (Canvas gibi):
- Her element pixel-pixel `<div style="position:absolute; left:..px; top:..px;">`
- Sürükle-bırak X/Y konumlandırma
- XSLT'ye aktarım zor (her element için ayrı koşul)

### FastReport section modeli (önerilen):
```
┌──────────────────── Report Header (tek seferlik) ────────────────────┐
│  • GİB logosu + başlık                                               │
│  • Belge No / Tarih / Saat / Tipi / Para birimi / KDV                    │
└──────────────────────────────────────────────────────────────────────┘
┌──────────── Party Header (satıcı + müşteri karşılıklı) ──────────────┐
│  • Tedarikçi: VKN / Unvan / Adres / VD / İletişim                   │
│  • Müşteri:  VKN / Unvan / Adres / VD / İletişim                   │
└──────────────────────────────────────────────────────────────────────┘
┌───────────────────── Master Data (her satır için tekrar) ──────────────┐
│  1) Ürün/Hizmet satırı (ad, miktar, birim fiyat, KDV, tutar)        │
│  2) Ürün/Hizmet satırı                                              │
│  N) ...                                                             │
└──────────────────────────────────────────────────────────────────────┘
┌──────────────────── Totals Section (bir kez, en altta) ──────────────┐
│  • Mal Hizmet Toplam Tutarı                                         │
│  • Hesaplanan KDV                                                   │
│  • KDV istisna (varsa)                                                │
│  • Vergiler Dahil Toplam Tutar                                       │
│  • Ödenecek Tutar (Net)                                              │
└──────────────────────────────────────────────────────────────────────┘
┌──────────────────── Report Footer ─────────────────────────────────┐
│  • Banka IBAN                                                       │
│  • Not / Açıklamalar                                                │
│  • Sayfa bilgisi                                                    │
└──────────────────────────────────────────────────────────────────────┘
```

### Section-Mapping XSLT'ye nasıl bağlanır:
```xml
<xsl:template match="/">
  <html><body>
    <header>  <!-- Report Header --> </header>
    <parties> <!-- Tedarikçi / Müşteri --> </parties>
    <table>   <!-- Master Data: her InvoiceLine --> </table>
    <totals>  <!-- TaxTotal + LegalMonetaryTotal --> </totals>
    <footer>  <!-- Banka, not --> </footer>
  </body></html>
</xsl:template>
```

### Designer state şeması:
```ts
type DesignState = {
  reportHeader: SectionElement[];
  partyHeader:  SectionElement[];
  masterData:   SectionElement[];  // template — her satır için tekrarlanır
  totals:       SectionElement[];
  reportFooter: SectionElement[];
};
```

---

## F. Hemen Yapılacaklar

1. **e-Fatura XSLT'te `cac:InvoiceType/cbc:Name` → `cbc:InvoiceTypeCode` düzeltmesi**
2. **`renderOrnekStamp` kaldır** veya sadece e-SMM için
3. **Designer'a "Read-only alanlar" set'i** ekle (`RO_FIELDS: string[]`)
4. **Designer'ın "Sayısal alanlar" dropdown'ına eksik alanları ekle** (BuildingNumber, CitySubdivisionName vb.)

---

## G. Toplam Karşılaştırma Özeti

- **Toplam gerçek GİB alanı:** 37 (cbc: yaprak)
- **Toplam XSLT'in sorguladığı cbc: alanı:** ~24 (selim'in tespit ettiği `cac:InvoiceType/cbc:Name` dahil)
- **Eksik olan (gerçek GİB'de var, XSLT yok):** 13 + (cac:InvoiceType için özel düzeltme)
- **Read-only alan:** ~18
- **Toplam UBL-TR XSD path (xs/xsd/UBL-TR-maindoc/Invoice.xsd):** daha detaylı (Schematron)
