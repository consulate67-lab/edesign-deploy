# edXdocu Shopify App UI

Partner / Dev Dashboard **App URL:** `https://www.edxdocu.com/shopify`

Örnek: `https://www.edxdocu.com/shopify?shop=sarpsoft-com-tr.myshopify.com`

## Env

- `SHOPIFY_API_KEY` / `SHOPIFY_CLIENT_ID` — App Bridge (public)
- `SHOPIFY_API_SECRET` / `SHOPIFY_CLIENT_SECRET` — ID token JWT doğrulama
- `SHOPIFY_REQUIRE_SESSION=1` — JWT zorunlu (yoksa token opsiyonel)
- `SHOPIFY_APP_SECRET` — kanal Bearer API
- `SHOPIFY_FREE_DOWNLOAD=1` — entitlement’siz indirme

## Akış

Intro → katalog → özelleştir → satın al / XSLT indir → tam editör linki
