# e-Fatura mükellef listesi ve e-posta keşfi

GİB kayıtlı kullanıcı listesini indirip (e-posta içermez) tüzel kişileri SQLite’ta tutar; herkese açık web sayfalarından iş e-postası arar; BulkMail için CSV üretir.

```bash
# 1) Liste (üretim erişilemezse test uç veya --local ZIP)
node scripts/mukellef/download-gib.mjs
node scripts/mukellef/download-gib.mjs --local "C:\yol\newUserPkListxml.zip"

# 2) SQLite’a yaz (yalnız 10 haneli VKN)
node scripts/mukellef/parse-gib.mjs

# 3) E-posta keşfi (parti; tekrar çalıştırılabilir)
node scripts/mukellef/enrich-emails.mjs --limit 200

# 4) CSV (yönetim paneli → Toplu e-posta → Türkçe · firma)
node scripts/mukellef/export-csv.mjs --limit 500
```

Veriler `data/mukellef/` altındadır (gitignore). Gönderim Brevo kotası ve panel onayı olmadan başlamaz.
