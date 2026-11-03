/**
 * Manuel YouTube yükleme için videoları dil klasörlerine,
 * yerelleştirilmiş dosya adlarıyla (Windows-uygun) kopyalar / hardlink eder.
 *
 * Çıktı: youtube-manuel/{dil}/
 * Ayrıca her dilde titles.csv (YouTube başlık + açıklama).
 *
 * Usage: node scripts/prepare-youtube-manual.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, linkSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'youtube-manuel');
const SRC = path.join(root, 'public/videos/egitim');

const LANGS = [
    { code: 'tr', folder: '01-tr-Turkce', name: 'Türkçe' },
    { code: 'en', folder: '02-en-English', name: 'English' },
    { code: 'de', folder: '03-de-Deutsch', name: 'Deutsch' },
    { code: 'fr', folder: '04-fr-Francais', name: 'Français' },
    { code: 'es', folder: '05-es-Espanol', name: 'Español' },
    { code: 'pt', folder: '06-pt-Portugues', name: 'Português' },
    { code: 'ru', folder: '07-ru-Russkiy', name: 'Русский' },
    { code: 'zh', folder: '08-zh-Chinese', name: '中文' },
    { code: 'hi', folder: '09-hi-Hindi', name: 'हिन्दी' },
];

const TUTORIALS = [
    { id: 'signup', slug: '01-uyelik', n: '01' },
    { id: 'template', slug: '02-hazir-sablon', n: '02' },
    { id: 'scratch', slug: '03-sifirdan-tasarim', n: '03' },
    { id: 'textImage', slug: '04-metin-resim-kutu', n: '04' },
    { id: 'tableFormula', slug: '05-tablo-formul', n: '05' },
    { id: 'qrChart', slug: '06-karekod-grafik-pay', n: '06' },
    { id: 'columnBackground', slug: '07-kolon-arka-plan', n: '07' },
    { id: 'documentFields', slug: '08-belge-alanlari', n: '08' },
    { id: 'editFields', slug: '09-alan-duzenleme', n: '09' },
    { id: 'saveApprove', slug: '10-kaydet-onayla', n: '10' },
];

/** Windows dosya adı: | : * ? " < > \ / yasak */
function safeFileName(title) {
    return `${title} - edXdocu`
        .replace(/[|:\\/?*"<>]/g, '-')
        .replace(/\s+/g, ' ')
        .replace(/-+/g, '-')
        .trim();
}

function youtubeTitle(title) {
    return `${title} | edXdocu`.slice(0, 100);
}

function parseLocale(lang) {
    const file = path.join(root, 'src/i18n/locales/tutorials', `${lang}.ts`);
    const text = readFileSync(file, 'utf8');
    const items = {};
    for (const t of TUTORIALS) {
        const re = new RegExp(`${t.id}:\\s*\\{\\s*title:\\s*'((?:\\\\'|[^'])*)'\\s*,\\s*desc:\\s*'((?:\\\\'|[^'])*)'`, 'm');
        const m = text.match(re);
        if (!m) throw new Error(`${lang}/${t.id} title bulunamadı`);
        items[t.id] = { title: m[1].replace(/\\'/g, "'"), desc: m[2].replace(/\\'/g, "'") };
    }
    return items;
}

function srcMp4(lang, slug) {
    return lang === 'tr'
        ? path.join(SRC, `${slug}.mp4`)
        : path.join(SRC, lang, `${slug}.mp4`);
}

function placeFile(from, to) {
    if (existsSync(to)) unlinkSync(to);
    try {
        linkSync(from, to); // aynı diskte yer kaplamaz
        return 'link';
    } catch {
        copyFileSync(from, to);
        return 'copy';
    }
}

mkdirSync(OUT, { recursive: true });

const readme = [
    '# YouTube manuel yükleme',
    '',
    'Her klasör bir dil. Dosya adları o dildeki başlık (Windows için `|` yerine `-`).',
    'YouTube’a yüklerken **titles.csv** içindeki `youtube_title` sütununu kullanın (`Başlık | edXdocu`).',
    '',
    'Önerilen playlist: `edXdocu · {Dil}`',
    'Kategori: Education · Gizlilik: Public · Yerleştirilebilir: Evet',
    '',
    'Siteye bağlamak için yükleme sonrası video ID’lerini `src/help/tutorialYoutube.json` dosyasına yazın:',
    '```json',
    '{ "tr": { "01-uyelik": "YOUTUBE_VIDEO_ID", ... }, "pt": { ... } }',
    '```',
    '',
];

let ok = 0;
let miss = 0;

for (const lang of LANGS) {
    const dir = path.join(OUT, lang.folder);
    mkdirSync(dir, { recursive: true });
    const meta = parseLocale(lang.code);
    const rows = [['order', 'slug', 'file_name', 'youtube_title', 'description']];

    for (const t of TUTORIALS) {
        const { title, desc } = meta[t.id];
        const ytTitle = youtubeTitle(title);
        const fileBase = `${t.n} ${safeFileName(title)}.mp4`;
        const from = srcMp4(lang.code, t.slug);
        const to = path.join(dir, fileBase);
        if (!existsSync(from)) {
            console.warn('YOK', from);
            miss++;
            continue;
        }
        const how = placeFile(from, to);
        rows.push([t.n, t.slug, fileBase, ytTitle, desc.replace(/"/g, '""')]);
        ok++;
        console.log(`${how} ${lang.code}/${fileBase}`);
    }

    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    writeFileSync(path.join(dir, 'titles.csv'), `\uFEFF${csv}\n`, 'utf8');
    readme.push(`- \`${lang.folder}/\` — ${lang.name} (${TUTORIALS.length} video + titles.csv)`);
}

readme.push('', `Hazırlanan: ${ok} dosya` + (miss ? `, eksik: ${miss}` : ''), '');
writeFileSync(path.join(OUT, 'README.md'), readme.join('\n'), 'utf8');
writeFileSync(path.join(OUT, 'tutorialYoutube.template.json'), `${JSON.stringify(
    Object.fromEntries(LANGS.map((l) => [l.code, Object.fromEntries(TUTORIALS.map((t) => [t.slug, '']))])),
    null,
    2,
)}\n`, 'utf8');

console.log(`\nÇıktı: ${OUT}`);
console.log(`Toplam: ${ok}, eksik: ${miss}`);
