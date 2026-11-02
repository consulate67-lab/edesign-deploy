# YouTube eğitim yükleme

## Tek seferlik yetki
1. Google Cloud projesinde **YouTube Data API v3** açık olsun.
2. OAuth istemcisi (Web) redirect: `http://localhost:5199`
3. `.env.youtube` doldurun (örnek: `.env.youtube.example`).
4. `npm run youtube:auth` — tarayıcıda **kanal sahibi** Google hesabıyla izin verin.
5. Refresh token `.env.youtube` içine yazılır.

## Yükleme
```bash
npm run youtube:upload-tutorials
npm run youtube:upload-tutorials -- --lang=pt
npm run youtube:upload-tutorials -- --lang=tr --slug=01-uyelik
```

Başlıklar `src/i18n/locales/tutorials/*.ts` dosyalarından alınır (`{title} | edXdocu`).
Video ID’leri `src/help/tutorialYoutube.json` içine yazılır; site bunu embed eder.

## FTP tasarrufu
YouTube ID’ler dolduktan sonra `.env.youtube` içine:
```
YOUTUBE_SKIP_EGITIM_MP4=1
```
Sonraki `npm run deploy:web` egitim MP4’lerini FTP’ye yüklemez.
