/**
 * Eğitim MP4'lerini YouTube'a yerelleştirilmiş başlıklarla yükler.
 * Idempotent: src/help/tutorialYoutube.json içindeki ID'ler atlanır.
 *
 * Usage:
 *   npm run youtube:upload-tutorials
 *   npm run youtube:upload-tutorials -- --lang=pt
 *   npm run youtube:upload-tutorials -- --lang=tr --slug=01-uyelik
 */
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createOAuthClient, youtubeClient, root, loadYoutubeEnv } from './youtube-env.mjs';

const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'pt', 'ru', 'zh', 'hi'];
const LANG_NAMES = {
    tr: 'Türkçe', en: 'English', de: 'Deutsch', fr: 'Français', es: 'Español',
    pt: 'Português', ru: 'Русский', zh: '中文', hi: 'हिन्दी',
};
const SITE = 'https://www.edxdocu.com';
const CATEGORY_EDUCATION = '27';

const TUTORIALS = [
    { id: 'signup', slug: '01-uyelik' },
    { id: 'template', slug: '02-hazir-sablon' },
    { id: 'scratch', slug: '03-sifirdan-tasarim' },
    { id: 'textImage', slug: '04-metin-resim-kutu' },
    { id: 'tableFormula', slug: '05-tablo-formul' },
    { id: 'qrChart', slug: '06-karekod-grafik-pay' },
    { id: 'columnBackground', slug: '07-kolon-arka-plan' },
    { id: 'documentFields', slug: '08-belge-alanlari' },
    { id: 'editFields', slug: '09-alan-duzenleme' },
    { id: 'saveApprove', slug: '10-kaydet-onayla' },
];

const TAGS = {
    tr: ['edXdocu', 'e-Fatura', 'XSLT', 'e-belge tasarım', 'eğitim'],
    en: ['edXdocu', 'e-invoice', 'XSLT', 'document design', 'tutorial'],
    de: ['edXdocu', 'E-Rechnung', 'XSLT', 'Belegdesign', 'Tutorial'],
    fr: ['edXdocu', 'facture électronique', 'XSLT', 'tutoriel'],
    es: ['edXdocu', 'factura electrónica', 'XSLT', 'tutorial'],
    pt: ['edXdocu', 'NF-e', 'DANFE', 'XSLT', 'tutorial'],
    ru: ['edXdocu', 'электронный счет', 'XSLT', 'обучение'],
    zh: ['edXdocu', '电子发票', 'XSLT', '教程'],
    hi: ['edXdocu', 'ई-इनवॉइस', 'XSLT', 'ट्यूटोरियल'],
};

const MANIFEST = path.join(root, 'src/help/tutorialYoutube.json');
const PLAYLISTS = path.join(root, 'scripts/.youtube-playlists.json');

function parseArgs(argv) {
    const out = { lang: null, slug: null };
    for (const a of argv) {
        if (a.startsWith('--lang=')) out.lang = a.slice(7);
        if (a.startsWith('--slug=')) out.slug = a.slice(7);
    }
    return out;
}

function parseTutorialLocale(lang) {
    const file = path.join(root, 'src/i18n/locales/tutorials', `${lang}.ts`);
    const text = readFileSync(file, 'utf8');
    const items = {};
    for (const t of TUTORIALS) {
        const re = new RegExp(`${t.id}:\\s*\\{\\s*title:\\s*'((?:\\\\'|[^'])*)'\\s*,\\s*desc:\\s*'((?:\\\\'|[^'])*)'`, 'm');
        const m = text.match(re);
        if (!m) {
            // double quotes
            const re2 = new RegExp(`${t.id}:\\s*\\{\\s*title:\\s*"((?:\\\\"|[^"])*)"\\s*,\\s*desc:\\s*"((?:\\\\"|[^"])*)"`, 'm');
            const m2 = text.match(re2);
            if (!m2) throw new Error(`${lang}: ${t.id} title/desc bulunamadı`);
            items[t.id] = { title: m2[1].replace(/\\'/g, "'"), desc: m2[2].replace(/\\'/g, "'") };
        } else {
            items[t.id] = { title: m[1].replace(/\\'/g, "'"), desc: m[2].replace(/\\'/g, "'") };
        }
    }
    return items;
}

function videoPath(lang, slug) {
    const base = path.join(root, 'public/videos/egitim');
    return lang === 'tr'
        ? path.join(base, `${slug}.mp4`)
        : path.join(base, lang, `${slug}.mp4`);
}

function loadJson(file, fallback) {
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, 'utf8'));
}

function saveJson(file, data) {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function ensurePlaylist(yt, playlists, lang) {
    if (playlists[lang]) return playlists[lang];
    const title = `edXdocu · ${LANG_NAMES[lang]}`;
    const res = await yt.playlists.insert({
        part: ['snippet', 'status'],
        requestBody: {
            snippet: {
                title,
                description: `edXdocu tutorial videos — ${LANG_NAMES[lang]}\n${SITE}`,
                defaultLanguage: lang === 'zh' ? 'zh-Hans' : lang,
            },
            status: { privacyStatus: 'public' },
        },
    });
    const id = res.data.id;
    playlists[lang] = id;
    saveJson(PLAYLISTS, playlists);
    console.log(`playlist oluşturuldu: ${lang} → ${id}`);
    return id;
}

async function addToPlaylist(yt, playlistId, videoId) {
    await yt.playlistItems.insert({
        part: ['snippet'],
        requestBody: {
            snippet: {
                playlistId,
                resourceId: { kind: 'youtube#video', videoId },
            },
        },
    });
}

async function uploadOne(yt, { lang, tutorial, meta, playlistId }) {
    const file = videoPath(lang, tutorial.slug);
    if (!existsSync(file)) throw new Error(`Dosya yok: ${file}`);
    const title = `${meta.title} | edXdocu`.slice(0, 100);
    const description = [
        meta.desc,
        '',
        `edXdocu — ${SITE}`,
        lang === 'tr' ? 'e-Belge / e-Fatura tasarım eğitim videosu.' : 'Electronic document design tutorial.',
    ].join('\n');

    console.log(`yükleniyor: ${lang}/${tutorial.slug} — ${title}`);
    const res = await yt.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
            snippet: {
                title,
                description,
                tags: TAGS[lang] ?? TAGS.en,
                categoryId: CATEGORY_EDUCATION,
                defaultLanguage: lang === 'zh' ? 'zh-Hans' : lang,
                defaultAudioLanguage: lang === 'zh' ? 'zh-Hans' : lang,
            },
            status: {
                privacyStatus: 'public',
                embeddable: true,
                selfDeclaredMadeForKids: false,
                license: 'youtube',
            },
        },
        media: {
            mimeType: 'video/mp4',
            body: createReadStream(file),
        },
    });
    const videoId = res.data.id;
    if (!videoId) throw new Error('videoId dönmedi');
    try {
        await addToPlaylist(yt, playlistId, videoId);
    } catch (e) {
        console.warn(`playlist ekleme uyarısı (${lang}/${tutorial.slug}):`, e.message);
    }
    console.log(`  → https://youtu.be/${videoId}`);
    return videoId;
}

async function main() {
    loadYoutubeEnv();
    if (!process.env.YOUTUBE_REFRESH_TOKEN) {
        console.error('YOUTUBE_REFRESH_TOKEN yok. Önce: npm run youtube:auth');
        process.exit(1);
    }
    const { lang: onlyLang, slug: onlySlug } = parseArgs(process.argv.slice(2));
    const auth = createOAuthClient();
    const yt = youtubeClient(auth);
    const manifest = loadJson(MANIFEST, {});
    const playlists = loadJson(PLAYLISTS, {});
    const localesCache = {};

    let uploaded = 0;
    let skipped = 0;
    const langs = onlyLang ? [onlyLang] : LANGS;
    for (const lang of langs) {
        if (!LANGS.includes(lang)) {
            console.error(`Bilinmeyen dil: ${lang}`);
            process.exit(1);
        }
        if (!localesCache[lang]) localesCache[lang] = parseTutorialLocale(lang);
        const playlistId = await ensurePlaylist(yt, playlists, lang);
        manifest[lang] ??= {};
        const list = onlySlug ? TUTORIALS.filter((t) => t.slug === onlySlug) : TUTORIALS;
        for (const tutorial of list) {
            if (manifest[lang][tutorial.slug]) {
                skipped++;
                console.log(`atlandı (var): ${lang}/${tutorial.slug} → ${manifest[lang][tutorial.slug]}`);
                continue;
            }
            try {
                const id = await uploadOne(yt, {
                    lang,
                    tutorial,
                    meta: localesCache[lang][tutorial.id],
                    playlistId,
                });
                manifest[lang][tutorial.slug] = id;
                saveJson(MANIFEST, manifest);
                uploaded++;
            } catch (e) {
                const msg = e?.message || String(e);
                saveJson(MANIFEST, manifest);
                if (/quota|dailyLimitExceeded|uploadLimitExceeded/i.test(msg) || e?.code === 403) {
                    console.error(`Kota/limit: ${msg}`);
                    console.error(`Kaldığınız yer kaydedildi. Sonra: npm run youtube:upload-tutorials`);
                    process.exit(2);
                }
                console.error(`Hata ${lang}/${tutorial.slug}:`, msg);
                process.exit(1);
            }
        }
    }
    console.log(`Bitti. yüklenen: ${uploaded}, atlanan: ${skipped}`);
    console.log(`Manifest: ${MANIFEST}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
