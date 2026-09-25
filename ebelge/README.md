# e-Belge Şablonları

Bu klasör, GİB (Gelir İdaresi Başkanlığı) ve GitHub açık kay projelerden derlenen e-belge UBL-TR şablonlarını içerir.

## Klasör Yapısı

```
public/ebelge/
├── README.md                       # Bu dosya
├── gib/                            # GİB'in orijinal XSLT şablonları
│   ├── e-Fatura.xslt              # 82 KB, UBL Invoice-2
│   ├── e-Fatura-OzelMatrah.xslt   # 31 KB, Özel Matrah versiyonu
│   └── UygulamaYaniti.xslt        # 38 KB, ApplicationResponse
├── community/                      # GitHub açık kaynak projeler
│   ├── IRPTeam-eFatura.xslt       # 390 KB, IRPTeam/eFaturaXSLT
│   ├── IRPTeam-eWaybill-Irsaliye.xslt  # 365 KB, IRPTeam (e-İrsaliye!)
│   ├── hzkucuk-eFatura.xslt       # 601 KB, hzkucuk/eFaturaEdit
│   └── hzkucuk-nakli-yekun.xslt   # 599 KB, hzkucuk (nakliye/sevk)
└── samples/                        # Örnek XML veri dosyaları
    ├── e-Fatura-TEMEL/TICARI/IADE/KDV0.xml  (GİB Paketi v29 orijinal)
    ├── e-Arsiv-TEMEL.xml
    ├── e-Irsaliye-TEMEL.xml
    ├── e-Ihracat-TEMEL.xml
    └── e-Makbuz-TEMEL.xml
```

## Resmi GİB Kaynakları

| Belge | Resmi Paket URL | Durum |
|---|---|---|
| e-Fatura | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-FaturaPaketi%20(29).zip` | ✅ v29 (24.08.2026) — XSLT viewer JAR'da |
| e-Arşiv | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/earsiv_paket_v1.1_8.zip` | ✅ v1.1.8 (27.07.2026) — şema var, XSLT yok |
| e-İrsaliye | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eIrsaliyePaketi.zip` | ❌ 404 — public URL yok |
| e-İhracat | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eIhracatPaketi.zip` | ❌ 404 — public URL yok |
| e-Mikro İhracat | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eMikroIhracatPaketi.zip` | ❌ 404 |
| e-Makbuz | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eMakbuzPaketi.zip` | ❌ 404 |
| e-SMM | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eSMM_Paketi.zip` | ❌ 404 |
| e-Müstahsil | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eMustahsilPaketi.zip` | ❌ 404 |
| e-Bilet | `https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/eBiletPaketi.zip` | ❌ 404 |
| EBelge Görüntüleyici (JAR) | `https://ebelge.gib.gov.tr/EFaturaGoruntuleyici/Windows/Java17/EBelgeGoruntuleyici.jar` | ✅ 669 KB (sadece e-Fatura için XSLT içerir) |

## Açık Kaynak Topluluk Projeleri (GitHub)

| Repo | İçerik | URL |
|---|---|---|
| **IRPTeam/eFaturaXSLT** | e-Fatura.xslt + eWaybill.xslt (e-İrsaliye!) | https://github.com/IRPTeam/eFaturaXSLT |
| **hzkucuk/eFaturaEdit** | default.xslt + default-nakli-yekun.xslt | https://github.com/hzkucuk/eFaturaEdit |

## Hangi Belge İçin Hangi XSLT Kullanılır

| Doc Type | UBL Root | XSLT | Kaynak |
|---|---|---|---|
| e-Fatura | `Invoice` | `gib/e-Fatura.xslt` | **GİB Resmi** |
| e-Fatura Özel Matrah | `Invoice` | `gib/e-Fatura-OzelMatrah.xslt` | **GİB Resmi** |
| e-Arşiv Fatura | `Invoice` | `gib/e-Fatura.xslt` (fallback) | GİB Resmi |
| **e-İrsaliye** | `DespatchAdvice` | `community/IRPTeam-eWaybill-Irsaliye.xslt` | **IRPTeam Topluluk** ⭐ |
| e-İhracat | `Invoice` | `gib/e-Fatura.xslt` (fallback) | GİB Resmi |
| e-Mikro İhracat | `Invoice` | `gib/e-Fatura.xslt` (fallback) | GİB Resmi |
| **e-SMM** | `Invoice` | `community/hzkucuk-eFatura.xslt` (fallback) | **hzkucuk Topluluk** ⭐ |
| **e-Müstahsil Makbuzu** | `Receipt` | `community/hzkucuk-eFatura.xslt` (fallback) | hzkucuk Topluluk |
| **e-Bilet** | `Invoice` | `community/hzkucuk-eFatura.xslt` (fallback) | hzkucuk Topluluk |
| e-Makbuz | `Receipt` | `community/hzkucuk-eFatura.xslt` (fallback) | hzkucuk Topluluk |
| Uygulama Yanıtı | `ApplicationResponse` | `gib/UygulamaYaniti.xslt` | **GİB Resmi** |

⭐ = GİB public olarak XSLT yayınlamadığı için topluluk reposundan alındı.

## ⚠️ Bilinen Sınırlar

GİB'in `EBelgeGoruntuleyici.jar` viewer'ı şu anda sadece **e-Fatura** için rendering XSLT içerir.
Diğer türler için:

1. **Resmi XSLT bulunmuyor** — GİB public olarak dağıtmıyor
2. **Topluluk fallback'leri mevcut** — IRPTeam ve hzkucuk'tan alındı
3. **Gerçek çözüm:** GİB lisanslı entegratör firmalardan (Logo, Mikro, Lfit, Paraşüt, Kolays, vs.) özel XSLT temin edilebilir

## Kullanım

`src/international/registry/docTypes.ts` her belge türü için doğru XSLT yolunu ve kaynağı (`xsltSource` field'i: `gib-official`, `community`, `pending`) referans eder.

Designer yüklerken:

```ts
// Vite raw import ile (build-time inline)
import efaturaXslt from '/ebelge/gib/e-Fatura.xslt?raw';

// veya runtime fetch ile
fetch('/ebelge/gib/e-Fatura.xslt').then(r => r.text());
```

## Güncelleme

GİB paketleri sık güncelleniyor. Güncel XSLT'leri almak için:

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
Topluluk XSLT'leri kendi lisansları altındadır — kaynak repo'ya bakın.

Daha fazla bilgi: https://ebelge.gib.gov.tr
