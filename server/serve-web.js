/**
 * Paylaşımlı hosting (FTP) düştüğünde siteyi ayakta tutmak için
 * üretim arayüzünü (dist-web) aynı Express sürecinden sunar.
 * API rotalarından sonra çağrılmalı; /api ve /ws dokunulmaz.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const candidates = () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    return [
        path.join(here, '..', 'dist-web'),
        path.join(process.cwd(), 'dist-web'),
    ];
};

export const resolveWebRoot = () =>
    candidates().find((dir) => existsSync(path.join(dir, 'index.html'))) || null;

/** @returns {string | null} web root */
export const mountWebApp = (app) => {
    const webRoot = resolveWebRoot();
    if (!webRoot) {
        console.warn('[web] dist-web yok — yalnızca API çalışıyor. Frontend için npm run deploy:web veya Docker build gerekli.');
        return null;
    }

    app.use(express.static(webRoot, {
        index: false,
        fallthrough: true,
        setHeaders: (res, filePath) => {
            if (/\.html?$/i.test(filePath)) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            } else if (/\.(?:js|css|woff2?|png|jpe?g|gif|svg|webp|ico)$/i.test(filePath)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        },
    }));

    // SPA / hash router: varlık dışı GET isteklerinde index.html.
    // /rehber/ gibi klasörlerde index.html varsa onu sun (index:false yüzünden static vermez).
    const rootResolved = path.resolve(webRoot);
    app.get(/^(?!\/api(?:\/|$)|\/ws(?:\/|$)).*/, (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        if (path.extname(req.path)) return next();
        const rel = decodeURIComponent(req.path).replace(/^\/+|\/+$/g, '');
        if (rel && !rel.includes('..')) {
            const dirIndex = path.resolve(rootResolved, rel, 'index.html');
            if (dirIndex.startsWith(rootResolved + path.sep) && existsSync(dirIndex)) {
                return res.sendFile(dirIndex, (err) => { if (err) next(err); });
            }
        }
        res.sendFile(path.join(webRoot, 'index.html'), (err) => {
            if (err) next(err);
        });
    });

    console.log(`[web] Frontend sunuluyor: ${webRoot}`);
    return webRoot;
};
