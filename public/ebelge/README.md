# e-Belge Şablonları (GİB)

Bu klasör, Gelir İdaresi Başkanlığı'nın (GİB) resmi e-belge UBL-TR şablonlarını içerir.

## Klasör Yapısı

```
public/ebelge/
├── README.md                   # Bu dosya
├── gib/                        # GİB'in orijinal XSLT şablonları (viewer JAR'dan çıkarıldı)
│   ├── e-Fatura.xslt          # e-Fatura ana şablon (82 KB, UBL Invoice-2)
│   ├── e-Fatura-OzelMatrah.xslt  # e-Fatura Özel Matrah versiyonu
│   └── UygulamaYaniti.xslt    # Uygulama Yanıtı (ApplicationResponse)
└── samples/                    # Örnek XML veri dosyaları
    ├── e-Fatura-TEMEL.xml
    ├── e-Fatura-TICARI.xml
    ├── e-Fatura-IADE.xml
    ├── e-Fatura-KDV0.xml
    ├── e-Arsiv-TEMEL.xml
    ├── e-Irsaliye-TEMEL.xml
    ├── e-Ihracat-TEMEL.xml
    └── e-Makbuz-TEMEL.xml
```

## Resmi GİB Kaynakları

| Belge | Resmi Paket URL | Güncel Versiyon |
|---|---|---|
| e-Fatura | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-FaturaPaketi%20(29).zip` | v29 (24.08.2026) |
| e-Arşiv | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/earsiv_paket_v1.1_8.zip` | v1.1.8 (27.07.2026) |
| e-İrsaliye | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eIrsaliyePaketi.zip` | — |
| e-İhracat | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eIhracatPaketi.zip` | — |
| e-Makbuz | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eMakbuzPaketi.zip` | — |
| EBelge Görüntüleyici (JAR) | `https://ebelge.gib.gov.tr/EFaturaGoruntuleyici/Windows/Java17/EBelgeGoruntuleyici.jar` | 669 KB |

## XSLT Şablonları Nasıl Elde Edildi

1. **GİB Paketleri:** ZIP'ler indirildi, içindeki XML şemaları (XSD) ve örnekler kullanıldı
2. **Viewer JAR:** `EBelgeGoruntuleyici.jar` (669 KB) indirildi ve içinden XSLT dosyaları çıkarıldı:
   - `default.xslt` → e-Fatura ana şablonu (82 KB)
   - `default2.xslt` → e-Fatura Özel Matrah
   - `APRDefault.xslt` → ApplicationResponse
   - `invoice.xslt` (default.xslt ile aynı)
   - `default_20150812.xslt`, `default3.xslt`, `default4.xslt` → eski versiyonlar

## Hangi Belge İçin Hangi XSLT Kullanılır

| Doc Type | UBL Root | XSLT | Customization |
|---|---|---|---|
| e-Fatura | `Invoice` | `gib/e-Fatura.xslt` | `TR1.2` |
| e-Fatura Özel Matrah | `Invoice` | `gib/e-Fatura-OzelMatrah.xslt` | `TR1.2_OZELMATRAH` |
| e-Arşiv Fatura | `Invoice` | `gib/e-Fatura.xslt` (default kullanılır) | `TR1.2` + `ProfileID=e-Arsiv-Fatura` |
| e-İrsaliye | `DespatchAdvice` | *(GİB JAR'da mevcut değil)* | `TR1.2` |
| e-İhracat | `Invoice` | *(GİB JAR'da mevcut değil)* | `TR1.2_IHRACAT` |
| e-Makbuz | `Receipt` | *(GİB JAR'da mevcut değil)* | `TR1.2` |
| Uygulama Yanıtı | `ApplicationResponse` | `gib/UygulamaYaniti.xslt` | `TR1.2` |

## ⚠️ Bilinen Eksikler

GİB'in `EBelgeGoruntuleyici.jar` viewer'ı şu anda sadece **e-Fatura** için rendering XSLT içerir.
e-Arşiv, e-İrsaliye, e-İhracat, e-Makbuz için:

1. **Resmi XSLT bulunmuyor** (GİB bunları ayrı JAR/viewer olarak dağıtmıyor)
2. **Çözüm önerileri:**
   - GİB entegratör firmalarından (Logo, Mikro, Lfit, vs.) temin edilebilir
   - İlgili paketler indirilip içindeki XSLT'ler eklenebilir (yok)
   - Custom XSLT geliştirilip `gib/` altına eklenebilir
   - e-Fatura şablonu (`default.xslt`) çoğu tür için yeterli (Invoice namespace'i ortak)

## Kullanım

`src/international/registry/docTypes.ts` her belge türü için doğru XSLT yolunu referans eder.
Designer yüklerken:

```ts
import efaturaXslt from '/ebelge/gib/e-Fatura.xslt?raw';
```

Veya public üzerinden:

```ts
const xsltUrl = '/ebelge/gib/e-Fatura.xslt';
fetch(xsltUrl).then(r => r.text()).then(xslt => ...);
```

## Güncelleme

GİB paketleri sık güncelleniyor (her ay civarı). Güncel XSLT'leri almak için:

```bash
curl -L -o /tmp/eblg.jar "https://ebelge.gib.gov.tr/EFaturaGoruntuleyici/Windows/Java17/EBelgeGoruntuleyici.jar"
cp /tmp/eblg.jar /tmp/eblg.zip
cd /tmp && unzip -o eblg.zip -d eblg-jar
cp eblg-jar/tr/gov/gib/vedop3/efaturaviewer/resources/default.xslt \
   <repo>/public/ebelge/gib/e-Fatura.xslt
```

## Lisans

Bu XSLT'ler ve XML şemaları **T.C. Gelir İdaresi Başkanlığı'nın açık kaynak** kamu verileridir.
UBL-TR standardı **OASIS** tarafından yönetilir (royalty-free).

Daha fazla bilgi: https://ebelge.gib.gov.tr
