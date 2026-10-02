# DNS ve Domain Kurulumu — edesign-deploy.com

**Tarih:** 2026-10-02 · **Sprint:** 1.4
**Hedef:** `edesign-deploy.com` domain'i profesyonel olarak `api.edesign-deploy.com` (Railway backend) ve `edesign-deploy.com`/`www` (GitHub Pages frontend) şeklinde yayına almak.

---

## 1. CloudFlare Domain Ekleme

1. https://dash.cloudflare.com → **Add a Site**
2. `edesign-deploy.com` yaz → Continue
3. Plan: **Free** (yeterli)
4. CloudFlare nameserver'larını al (örn. `brad.ns.cloudflare.com`, `ivy.ns.cloudflare.com`)
5. Domain registrar (GoDaddy/Namecheap vb.) paneline git
7. Nameserver'ları CloudFlare'in verdiği ile değiştir
8. 24-48 saat bekle (DNS propagation)

---

## 2. CloudFlare DNS Kayıtları

CloudFlare → `edesign-deploy.com` → **DNS** → **Add Record**:

| Tip | Ad | Hedef | Proxy |
|---|---|---|---|
| CNAME | `api` | `<railway-app>.up.railway.app` | **Proxied** (turuncu bulut) |
| CNAME | `www` | `consulate67-lab.github.io` | **Proxied** |
| A | `@` | `192.0.2.1` | **Proxied** (apex redirect için) |

> **Not:** Railway app URL'ini bulmak için `railway.app` dashboard → projen → Settings → Networking → Public Domain'e bak (örn. `edesign-deploy-production.up.railway.app`).

---

## 3. CloudFlare SSL/TLS → Full (Strict)

1. **SSL/TLS** → Overview
2. Mode: **Full (Strict)**
3. Edge Certificates → Always Use HTTPS: **ON**
4. Edge Certificates → Minimum TLS Version: **1.2** (iyzico 3D uyumlu)
5. Edge Certificates → Universal SSL: otomatik aktif olur

> CloudFlare proxy ON iken otomatik Let's Encrypt sertifikası yenilenir.

---

## 4. GitHub Pages Custom Domain

1. https://github.com/consulate67-lab/edesign-deploy → **Settings** → **Pages**
2. Custom domain: `edesign-deploy.com` yaz → Save
3. **Enforce HTTPS**: ✅

> İlk değişiklik 5-15 dakika sürebilir. CNAME dosyası otomatik oluşur.

---

## 5. Railway Custom Domain

1. https://railway.app → projen → **Networking** → **Custom Domains**
3. `api.edesign-deploy.com` ekle
5. CNAME railway isteyebilir → CloudFlare'de zaten ayarladın
6. Railway otomatik Let's Encrypt SSL sağlar

---

## 6. Backend Environment Variables (Railway)

Railway → projen → **Variables** → şunları güncelle/ekle:

```bash
# CORS (CloudFlare proxy arkasında HTTPS)
ALLOWED_ORIGINS=https://edesign-deploy.com,https://www.edesign-deploy.com,http://localhost:5173

# Iyzico callback (production domain)
PUBLIC_URL=https://api.edesign-deploy.com

# Iyzico prod keys (Selim iyzico.com'dan alır)
IYZICO_API_KEY=pk_live_xxxxx
IYZICO_SECRET=sk_live_xxxxx
IYZICO_BASE_URL=https://api.iyzipay.com
IYZICO_CALLBACK_URL=https://api.edesign-deploy.com/api/payment/iyzico/callback
```

---

## 7. Vite Base Path (Frontend)

**Problem:** Şu an `base: '/edesign-deploy/'` (GitHub Pages path için). Custom domain kullanırken `/` olmalı.

**Fix:** `vite.config.ts`:
```ts
base: '/', // custom domain ile GitHub Pages subpath kalktı
```

Production build `dist/` içindeki asset yolları root-relative olur → CloudFlare proxy cache'lerken sorun çıkmaz.

---

## 8. Doğrulama

```bash
# DNS propagation
dig api.edesign-deploy.com +short
dig edesign-deploy.com +short
dig www.edesign-deploy.com +short

# SSL sertifika kontrol
curl -I https://edesign-deploy.com
curl -I https://api.edesign-deploy.com/api/health

# Frontend
curl -I https://edesign-deploy.com/

# Iyzico callback test
curl -X POST https://api.edesign-deploy.com/api/payment/iyzico/callback -d 'token=test'
```

---

## 9. Sorun Giderme

**Sorun: 521 (Web server down)**
→ CloudFlare proxy ON, Railway app çalışıyor → birkaç dakika bekle

**Sorun: 525 (SSL handshake failed)**
→ CloudFlare SSL → Full yerine **Full (Strict)** seç

**Sorun: Mixed content (HTTPS → HTTP)**
→ Frontend base path `/` olmalı, asset URL'leri HTTPS olmalı

**Sorun: CORS hatasi**
→ Backend `ALLOWED_ORIGINS` env'inde `https://edesign-deploy.com` var mı kontrol et

---

## 10. Tahmini Zamanlama

- CloudFlare setup: 30 dakika
- Nameserver propagation: 24-48 saat
- GitHub Pages custom domain: 5-15 dakika
- Railway custom domain: 5-15 dakika
- SSL aktif: 5-15 dakika

**Toplam DNS cutover:** 24-48 saat (sadece nameserver propagation beklenir, diğer adımlar paralel).