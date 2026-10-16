# e-Fatura mükellef listesi ve e-posta keşfi

GİB kayıtlı kullanıcı listesini indirip (e-posta içermez) tüzel kişileri SQLite’ta tutar; herkese açık web sayfalarından iş e-postası arar; BulkMail için CSV üretir.

```bash
# 1) Liste (üretim erişilemezse test uç veya --local ZIP)
node scripts/mukellef/download-gib.mjs
node scripts/mukellef/download-gib.mjs --local "C:\yol\newUserPkListxml.zip"

# 2) SQLite’a yaz (yalnız 10 haneli VKN)
node scripts/mukellef/parse-gib.mjs

# 3a) OSB firma rehberleri (unvan ↔ GİB eşleştirme)
node scripts/mukellef/enrich-osb.mjs

# 3b) Web arama ile e-posta keşfi (parti)
node scripts/mukellef/enrich-emails.mjs --limit 200

# 3c) Sürekli: OSB + GİB partileri; her 500 yeni mailde CSV
node scripts/mukellef/run-campaign.mjs --batch 500

# 4) CSV (yönetim paneli → Toplu e-posta → Türkçe · firma)
node scripts/mukellef/export-csv.mjs --batch 500
```

Veriler `data/mukellef/` altındadır (gitignore). Gönderim Brevo kotası ve panel onayı olmadan başlamaz.
500’lük partiler `data/mukellef/batch-*.csv` olarak üretilir; panelden broşür **Türkçe · firma** ile yükleyin.
