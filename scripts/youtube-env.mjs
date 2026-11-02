import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function loadYoutubeEnv() {
    const file = path.join(root, '.env.youtube');
    if (!existsSync(file)) return;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
        if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
}

export function setYoutubeEnvKey(key, value) {
    const file = path.join(root, '.env.youtube');
    let text = existsSync(file) ? readFileSync(file, 'utf8') : '';
    const line = `${key}=${value}`;
    if (new RegExp(`^${key}=`, 'm').test(text)) {
        text = text.replace(new RegExp(`^${key}=.*$`, 'm'), line);
    } else {
        text = `${text.trimEnd()}\n${line}\n`;
    }
    writeFileSync(file, text, 'utf8');
}

export const SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
];

export function createOAuthClient() {
    loadYoutubeEnv();
    const id = process.env.YOUTUBE_CLIENT_ID;
    const secret = process.env.YOUTUBE_CLIENT_SECRET;
    const redirect = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5199';
    if (!id || !secret) {
        console.error('YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET eksik (.env.youtube).');
        process.exit(1);
    }
    const client = new google.auth.OAuth2(id, secret, redirect);
    if (process.env.YOUTUBE_REFRESH_TOKEN) {
        client.setCredentials({ refresh_token: process.env.YOUTUBE_REFRESH_TOKEN });
    }
    return client;
}

export function youtubeClient(auth) {
    return google.youtube({ version: 'v3', auth });
}
