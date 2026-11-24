# Shopify App — hazır fatura tasarımı ($15)

**Ürün fikri (sizin ısrar):** Shopify sipariş/ERP entegrasyonu yok. Mağaza sahibi App Store’dan kuruyor → **~$15 one-time** (veya paket) → hazır / markalı **mali fatura görünümü (XSLT)** alıyor → kendi entegratörüne / ERP’sine yüklüyor.  
**Kapsam iddiası:** Desteklenen ülkelerin dil + XSLT şema ailelerine uygun çıktı.

---

## Shopify bunu kabul eder mi?

**Evet — doğru konumlandırırsanız.** Red riski “entegrasyon yok” değil; **yanlış kategori / yanlış vaat**.

| Konum | Sonuç |
|---|---|
| “Shopify siparişinden fatura basar / keser” | **Hayır** — invoice app kuralları (order print extension vb.) + sizin ürününüz değil |
| “Mali e-belge (e-Fatura vb.) **görünüm şablonu** üretir; indirilen XSLT’yi mevcut sisteme yüklersiniz” | **Evet adayı** — embedded admin UI + Shopify Billing ile satış |

**Zorunlu teknik (App Store):**
1. Embedded app (App Bridge + session token)
2. Merchant’ın etkileşebileceği gerçek UI (sadece landing yetmez)
3. Ücret → **Shopify Billing API** (off-site ödeme yasak). **One-time $15** için: Manual Pricing + one-time charge (Shopify App Pricing şu an one-time desteklemiyor)
4. Listing doğru: “fiscal / e-invoice **design template**”, “does not transmit to tax authority”

Shopify’ın aldığı pay: app gelirinden Partner Program oranı (planınıza göre; genelde ~15–20% bandı). Fiyatlandırırken net’e göre hesaplayın.

---

## Ürün = ne satıyorsunuz?

```
Mağaza sahibi
  → App kur
  → Ülke / belge tipi seç (TR e-Fatura, TR e-Arşiv, …)
  → Logo + renk + 1–2 alan
  → $15 öde (Shopify charge)
  → XSLT (+ önizleme PDF/HTML) indir
  → GİB entegratör / ERP / provedor paneline yükle
```

**Shopify Order API şart değil.** Admin’de “tasarla → satın al → indir” yeterli; isteğe bağlı: shop adı / logo URL’sini Admin API’den okuyup formu doldurmak (review’a “Shopify’a bağlı” hissi verir, connector app olmaz).

---

## “Tüm ülke / tüm XSLT” — gerçekçi çerçeve

İki ayrı katman:

| Katman | Anlam | Örnek |
|---|---|---|
| **UI dili** | App arayüzü | TR, EN, PT, … |
| **Belge şeması (XSLT ailesi)** | Mali XML’in formatı | TR UBL-TR e-Fatura / e-Arşiv; BR NF-e; … |

Listing’de **“desteklenen ülkeler”** diye yazın; “dünya geneli tüm XSLT” yazmayın (red + iade).

**MVP (v1 — yayınlanabilir):**
1. TR: e-Fatura + e-Arşiv (mevcut edXdocu motoru)
2. 3–5 hazır layout pack ($15 / pack veya $15 / tek tasarım)
3. Logo + renk + şirket unvanı → generate → download

**v2:** BR (veya bir sonraki ülke) şema + lokal dil  
**v3:** Ülke listesini genişlet; her ülke ayrı “schema pack” ürünü

---

## Fiyat modeli önerisi

| Plan | Ne | Neden |
|---|---|---|
| **$14.99 one-time** | 1 ülke + 1 belge tipi + 1 tasarım pack | Sizin “15 dolar kişi hazıra” cümlesi |
| **$29.99** | Aynı ülke, 3 layout + yeniden generate (logo değişince) | Ortalama sepet |
| **$9.99 / ay** (opsiyonel) | Sınırsız regenerate + yeni şablonlar | Tekrarlayan gelir; App Pricing ile kolay |

One-time = Billing API one-time purchase. Abonelik = Shopify App Pricing daha temiz.

---

## App Store listing (taslak cümle)

> Design branded fiscal e-invoice layouts (XSLT) for your local tax / ERP system. Pick your country schema, customize logo and colors, download the file and upload it to your e-invoice provider. Does not send invoices to tax authorities or replace your ERP.

Kategori: **Orders and shipping** altı değil; daha çok **Store design** / **Finance** benzeri — formda en yakın “templates / design tools” etiketleri. “Invoices and receipts” (Shopify order print) kategorisine düşmeyin.

---

## İnşa checklist (sırayla)

1. Shopify Partner hesabı + public app draft  
2. Embedded shell (Remix / React Router Shopify template) → tek ekran: ülke → şablon → önizleme  
3. Mevcut edXdocu generate API’sine sunucu tarafı çağrı (OAuth shop session)  
4. Billing: one-time $14.99 → charge onay → download kilidi açılır  
5. Test store’da uçtan uca: install → pay (test) → XSLT indir  
6. Listing + destek e-postası + gizlilik politikası → Submit review  

**Tahmini iş (MVP TR only):** 2–4 hafta (billing + review iterasyonu hariç). Review 1–3 hafta sürebilir.

---

## Riskler (kısa)

- Reviewer “bu Shopify’la ne iş yapıyor?” derse → shop branding çekme + “merchant fiscal compliance design” anlatımı  
- “Tüm ülkeler” vaadi → desteklenmeyen şema seçilirse net “Coming soon”  
- İade: XSLT’nin entegratörde yüklenmesi merchant işi; destek dokümanı şart  
- Partner’larla çakışma yok: Gurmehub vb. keser, siz görünüm satarsınız — hatta onların müşterisine upsell

---

## Karar

| Soru | Cevap |
|---|---|
| Platform kabul eder mi? | **Koşullu evet** — fiscal XSLT design app; order-invoice app değil |
| Entegrasyon şart mı? | Order sync **şart değil**; embedded + billing **şart** |
| $15 hazır tasarım? | **Evet** — one-time charge + download |
| Tüm ülke XSLT? | **Roadmap**; v1 = TR (sonra ülke ülke) |

İlk sprint: Partner app + TR e-Fatura/e-Arşiv pack + $14.99 one-time + indir.

---

## Uygulanan API (canlı backend)

| Method | Path | Açıklama |
|---|---|---|
| GET | `/api/shopify/health` | Kanal durumu |
| GET | `/api/shopify/templates` | Katalog (`?country=TR`) |
| GET | `/api/shopify/templates/:id/download` | XSLT indir |
| POST | `/api/shopify/templates/:id/brand` | Logo/renk/unvan → markalı XSLT |
| POST | `/api/shopify/templates/:id/purchase` | Entitlement (Billing charge sonrası) |
| POST | `/api/admin/shopify/templates/:id/publish` | Galeriyi Shopify’a yayınla |
| POST | `/api/admin/shopify/templates/:id/unpublish` | Yayından kaldır |

Auth: `Authorization: Bearer $SHOPIFY_APP_SECRET` + isteğe `X-Shopify-Shop`.

**Tasarım Shopify’da:**
- **Hafif:** `/brand` (logo URL, accent, şirket) — App Store gömülü UI’da yeterli.
- **Tam:** `design_url` → `https://www.edxdocu.com/?shopify_gallery=ID` (XSLT editör).

Gömülü UI: `/shopify` · kod: `server/shopify.js`, `shopify-app/index.html`.
