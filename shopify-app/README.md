# edXdocu Shopify App UI

Partner / Dev Dashboard **App URL:** `https://www.edxdocu.com/shopify`

Örnek: `https://www.edxdocu.com/shopify?shop=sarpsoft-com-tr.myshopify.com`

## Env

- `SHOPIFY_API_KEY` / `SHOPIFY_CLIENT_ID` — App Bridge (public)
- `SHOPIFY_API_SECRET` / `SHOPIFY_CLIENT_SECRET` — ID token JWT + token exchange + webhook HMAC
- `SHOPIFY_REQUIRE_SESSION` — production’da varsayılan açık; `0` ile kapat
- `SHOPIFY_APP_SECRET` — kanal Bearer API
- `SHOPIFY_FREE_DOWNLOAD=1` — entitlement’siz indirme
- `SHOPIFY_BILLING_ENABLED=1` — gerçek Shopify one-time charge (Public app şart)
- `SHOPIFY_BILLING_TEST=1` — test charge (ücret kesilmez)
- `SHOPIFY_BILLING_STUB=1` — zorla stub (Billing kapalı)

## Compliance webhooks (App Store zorunlu)

Partner / Dev Dashboard → App → **Versions** veya webhook ayarları:

- URI: `https://www.edxdocu.com/api/shopify/webhooks/compliance`
- Topics: `customers/data_request`, `customers/redact`, `shop/redact`

HMAC `SHOPIFY_API_SECRET` ile doğrulanır; geçersizse **401**.

## Akış

Intro → katalog → özelleştir → **Satın al (Shopify Billing)** → onay → XSLT indir

## Herkese satmak (Public)

1. **Yeni app** oluştur (Custom dağıtım değiştirilemez) → **Public distribution**
2. App URL: `https://www.edxdocu.com/shopify` · redirect aynı
3. Client ID/Secret’ı Railway’e yaz
4. Production: `SHOPIFY_BILLING_ENABLED=1`, `SHOPIFY_FREE_DOWNLOAD` kapalı; test için `SHOPIFY_BILLING_TEST=1`
5. App Store listing + inceleme → onay sonrası mağazalar kurar / satın alır

**Not:** Custom distribution Billing API kullanamaz; canlı ücret için Public şart.
