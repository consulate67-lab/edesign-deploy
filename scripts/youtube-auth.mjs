/**
 * Tek seferlik YouTube OAuth: tarayıcıda kanal hesabıyla giriş,
 * refresh token'ı .env.youtube dosyasına yazar.
 *
 * Usage: npm run youtube:auth
 */
import http from 'node:http';
import { URL } from 'node:url';
import { createOAuthClient, SCOPES, setYoutubeEnvKey, loadYoutubeEnv } from './youtube-env.mjs';

loadYoutubeEnv();
const oauth2 = createOAuthClient();
const redirect = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5199';
const port = Number(new URL(redirect).port || 5199);

const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
});

const server = http.createServer(async (req, res) => {
    try {
        const u = new URL(req.url || '/', redirect);
        const code = u.searchParams.get('code');
        const err = u.searchParams.get('error');
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h1>Yetki reddedildi</h1><p>${err}</p>`);
            server.close();
            process.exit(1);
        }
        if (!code) {
            res.writeHead(404).end('Not found');
            return;
        }
        const { tokens } = await oauth2.getToken(code);
        if (!tokens.refresh_token) {
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>Refresh token gelmedi</h1><p>Google Cloud konsolunda uygulamayı Testing modundan çıkarın veya prompt=consent ile tekrar deneyin.</p>');
            server.close();
            process.exit(1);
        }
        setYoutubeEnvKey('YOUTUBE_REFRESH_TOKEN', tokens.refresh_token);
        oauth2.setCredentials(tokens);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>YouTube yetkisi kaydedildi</h1><p>Bu pencereyi kapatıp yükleme scriptine geçebilirsiniz.</p>');
        console.log('YOUTUBE_REFRESH_TOKEN .env.youtube içine yazıldı.');
        setTimeout(() => { server.close(); process.exit(0); }, 300);
    } catch (e) {
        console.error(e);
        res.writeHead(500).end(String(e));
        server.close();
        process.exit(1);
    }
});

server.listen(port, '127.0.0.1', () => {
    console.log(`OAuth dinleniyor: ${redirect}`);
    console.log('Tarayıcıda açın (kanal sahibi Google hesabı):\n');
    console.log(authUrl);
    console.log('');
});
