/**
 * Yönetim panelinden sosyal medya paylaşımı.
 *
 * Yapay zekâ (Gemini) ürün bilgilerine dayanarak her platform için ayrı metin yazar; taslak
 * panelde düzenlenir. Facebook sayfası ve ona bağlı Instagram işletme hesabına Meta Graph API
 * ile yayınlanır. LinkedIn şirket sayfası ve Facebook / WhatsApp grupları API ile paylaşıma
 * açık değil; panel orada metni kopyalayıp paylaşım ekranını açar, yönetici "paylaşıldı" işaretler.
 *
 * Instagram görseli kendisi indirir: görseller veritabanında tutulur ve tahmin edilemeyen
 * bir adresle herkese açık sunulur (yalnız JPEG; Instagram başka biçim kabul etmez).
 */
import { randomBytes } from 'node:crypto';
import { cleanText, isPlainObject, optionalText, parseId, publicApiBase } from './util.js';

const GRAPH = 'https://graph.facebook.com/v23.0';
const META_KEY = 'social_meta';
const PLATFORMS = ['facebook', 'instagram', 'linkedin', 'x', 'groups'];
const API_PLATFORMS = ['facebook', 'instagram'];
const TEXT_MAX = { facebook: 5000, instagram: 2200, linkedin: 3000, x: 280, groups: 3000 };
const IMAGE_MAX = 8 * 1024 * 1024;

const AI_KEY = process.env.ASSISTANT_AI_KEY || process.env.GEMINI_API_KEY || '';
const AI_URL = process.env.ASSISTANT_AI_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const AI_MODEL = process.env.SOCIAL_AI_MODEL || process.env.ASSISTANT_AI_MODEL || 'gemini-3.5-flash';
const AI_MODELS = [...new Set([AI_MODEL, ...(AI_URL.includes('googleapis.com') ? ['gemini-3.8-flash', 'gemini-3.1-flash-lite'] : [])])];

const LANGS = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca' };
const TONES = {
    samimi: 'samimi ve sıcak, "siz" diye hitap eden',
    kurumsal: 'kurumsal, güven veren ve net',
    bilgilendirici: 'öğretici, ipucu veren, satış baskısı düşük',
    enerjik: 'enerjik, heyecanlı ve harekete geçirici',
};

const PLATFORM_RULES = {
    facebook: '60-120 kelime; ilk cümle dikkat çekici; 1-3 emoji; sonda bağlantı ve 3-5 hashtag.',
    instagram: 'İlk satır güçlü bir kanca; kısa paragraflar; 80-150 kelime; uygun emojiler. Bağlantı yazma (Instagram\'da tıklanmaz), yerine "Bağlantı profilimizde" de. En sonda 10-15 hashtag (Türkçe ve İngilizce karışık).',
    linkedin: 'Profesyonel ve değer odaklı; 120-200 kelime; sorun → çözüm → sonuç akışı; en fazla 2 emoji; sonda bağlantı ve 3-5 hashtag.',
    x: 'Bağlantı dahil en fazla 260 karakter; 1-2 hashtag; bağlantı sonda.',
    groups: 'WhatsApp, Telegram ve Facebook grupları için: reklam kokmayan, bir meslektaşın önerisi gibi samimi; 40-80 kelime; hashtag yok; sonda bağlantı.',
};

const productFacts = (packages) => {
    const p = (id) => packages?.[id];
    const price = (id) => (p(id) ? `${p(id).name} ${Number(p(id).prices.TRY).toLocaleString('tr-TR')} TL (${p(id).credits} tasarım hakkı; yurt dışında €${p(id).prices.EUR})` : '');
    return [
        'edXdocu (https://www.edxdocu.com) bir Türk web uygulamasıdır: e-Fatura, e-Arşiv, e-İrsaliye dahil 15 e-belge türünün görünüm (XSLT) dosyasını kod yazmadan, sürükle-bırak editörle tasarlatır.',
        'GİB UBL-TR 1.2.1 uyumlu hazır şablonlar; logo, kaşe, imza, banka / IBAN, karekod ve grafik eklenir; kendi XML dosyasıyla anında önizleme; mevcut XSLT dosyası yüklenip görsel olarak düzenlenebilir.',
        'Onaylanan tasarımın XSLT dosyası indirilip e-fatura entegratörüne ya da ERP / muhasebe programına yüklenir. edXdocu fatura göndermez, yalnız tasarım yapar.',
        'Yurt dışı: EN 16931, Peppol BIS 3, XRechnung 3.0, ABD DBNAlliance UBL, Brezilya NF-e, Rusya UPD, Hindistan GST e-Invoice, Çin 数电票. Arayüz 9 dilde.',
        `Fiyat: tek seferlik ödeme, abonelik yok, haklar süresiz, KDV dahil. ${['one', 'basic', 'pro'].map(price).filter(Boolean).join('; ')}.`,
        'Üyelik, kaydetme ve filigranlı test indirme ücretsiz; tasarım hakkı yalnız tasarım onaylanınca harcanır.',
        'Hedef kitle: mali müşavirler ve muhasebeciler, KOBİ sahipleri, ERP / yazılım firmaları, e-fatura entegratörü kullanan şirketler.',
        'Hesaplar: Instagram @edxdocu67, YouTube @edXdocu-o6k. İletişim: destek@edxdocu.com.',
    ].join('\n');
};

const systemPrompt = ({ lang, tone, link, platforms }, packages) => [
    'Sen edXdocu\'nun sosyal medya yöneticisisin; Türkiye\'de B2B yazılım pazarlamasında deneyimlisin.',
    'ÜRÜN BİLGİLERİ:',
    productFacts(packages),
    'KURALLAR:',
    '- Yalnız yukarıdaki bilgilere dayan. Olmayan özellik, indirim, kampanya, müşteri sayısı, istatistik, yorum ya da referans uydurma.',
    `- Dil: ${LANGS[lang]}. Ton: ${TONES[tone]}.`,
    `- Paylaşılacak bağlantı: ${link || 'https://www.edxdocu.com'}`,
    '- Her platform için o platformun alışkanlığına uygun, birbirinin kopyası olmayan ayrı metin yaz:',
    ...platforms.map((p) => `  ${p}: ${PLATFORM_RULES[p]}`),
    `- YALNIZCA geçerli JSON döndür, başka hiçbir şey yazma. Anahtarlar tam olarak şunlar: ${platforms.map((p) => `"${p}"`).join(', ')}. Değerler düz metin; satır sonu için \\n kullan.`,
].join('\n');

const parseJson = (text) => {
    const m = /\{[\s\S]*\}/.exec(text);
    if (!m) throw new Error('JSON yok');
    return JSON.parse(m[0]);
};

const askModel = async (model, messages, ms) => {
    const body = { model, messages, temperature: 0.8, max_tokens: 3000 };
    if (AI_URL.includes('googleapis.com')) body.reasoning_effort = 'none';
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
        const res = await fetch(AI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_KEY}` },
            body: JSON.stringify(body),
            signal: ctrl.signal,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(`${model}: ${data?.error?.message || data?.[0]?.error?.message || `HTTP ${res.status}`}`);
        const text = data?.choices?.[0]?.message?.content;
        if (typeof text !== 'string' || !text.trim()) throw new Error(`${model}: boş yanıt`);
        return parseJson(text);
    } catch (e) {
        throw ctrl.signal.aborted ? new Error(`${model}: ${ms} ms içinde yanıt yok`) : e;
    } finally {
        clearTimeout(timer);
    }
};

/** Bir model yanıt vermezse sıradakine geçer; toplam 45 sn. */
const writePosts = async (input, packages) => {
    const user = [`Konu: ${input.topic}`, input.notes && `Ek not: ${input.notes}`].filter(Boolean).join('\n');
    const messages = [{ role: 'system', content: systemPrompt(input, packages) }, { role: 'user', content: user }];
    const deadline = Date.now() + 45_000;
    let last;
    for (const [i, model] of AI_MODELS.entries()) {
        const left = deadline - Date.now();
        if (left < 3_000) break;
        try {
            const raw = await askModel(model, messages, i === AI_MODELS.length - 1 ? left : Math.min(20_000, left));
            const texts = {};
            for (const p of input.platforms) {
                if (typeof raw?.[p] === 'string' && raw[p].trim()) texts[p] = raw[p].replace(/\r\n?/g, '\n').trim().slice(0, TEXT_MAX[p]);
            }
            if (!Object.keys(texts).length) throw new Error(`${model}: metin üretilmedi`);
            return texts;
        } catch (e) {
            last = e;
            console.warn('[social] model yanıt vermedi, sıradaki deneniyor:', e.message);
        }
    }
    throw last ?? new Error('süre doldu');
};

// ------------------------------------------------------------ Meta Graph API

class GraphError extends Error {}

const graph = async (path, { method = 'GET', params = {}, token } = {}) => {
    const url = new URL(`${GRAPH}/${path}`);
    const form = new URLSearchParams(params);
    if (token) form.set('access_token', token);
    let res;
    if (method === 'GET') {
        form.forEach((v, k) => url.searchParams.set(k, v));
        res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    } else {
        res = await fetch(url, { method, body: form, signal: AbortSignal.timeout(90_000) });
    }
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.error) {
        const e = data?.error;
        throw new GraphError(e?.error_user_msg || e?.message || `Meta HTTP ${res.status}`);
    }
    return data;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const readText = (value, max) => (typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim().slice(0, max) : '');

const readTexts = (value) => {
    const src = isPlainObject(value) ? value : {};
    return Object.fromEntries(PLATFORMS.filter((p) => typeof src[p] === 'string').map((p) => [p, readText(src[p], TEXT_MAX[p])]));
};

const readLink = (value) => {
    const text = optionalText(value, 400);
    if (!text) return '';
    try {
        const url = new URL(text);
        return url.protocol === 'https:' ? url.toString() : null;
    } catch {
        return null;
    }
};

export const createSocialSchema = async (client) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS social_images (
            id          SERIAL PRIMARY KEY,
            token       TEXT NOT NULL,
            data        BYTEA NOT NULL,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await client.query(`
        CREATE TABLE IF NOT EXISTS social_posts (
            id          SERIAL PRIMARY KEY,
            topic       TEXT NOT NULL DEFAULT '',
            link        TEXT NOT NULL DEFAULT '',
            image_id    INTEGER REFERENCES social_images(id) ON DELETE SET NULL,
            texts       JSONB NOT NULL DEFAULT '{}'::jsonb,
            results     JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
};

export const registerSocialRoutes = (app, { db, requireAdmin, packages }) => {
    const imageUrl = (id, token) => {
        const base = publicApiBase();
        return base && id && token ? `${base}/api/social/images/${id}-${token}.jpg` : null;
    };

    const POST_SELECT = `
        SELECT p.id, p.topic, p.link, p.image_id, i.token AS image_token, p.texts, p.results, p.created_at, p.updated_at
          FROM social_posts p LEFT JOIN social_images i ON i.id = p.image_id`;
    const toPost = (r) => r && ({
        id: r.id, topic: r.topic, link: r.link, image_id: r.image_id, image_url: imageUrl(r.image_id, r.image_token),
        texts: r.texts ?? {}, results: r.results ?? {}, created_at: r.created_at, updated_at: r.updated_at,
    });
    const getPost = async (id) => toPost(await db.get(`${POST_SELECT} WHERE p.id = ?`, [id]));

    const readMeta = async () => {
        const row = await db.get('SELECT value FROM site_settings WHERE key = ?', [META_KEY]);
        return isPlainObject(row?.value) && row.value.pageToken ? row.value : null;
    };
    const metaStatus = (m) => (m ? {
        connected: true, pageId: m.pageId, pageName: m.pageName, instagram: m.igUsername || null,
        longLived: !!m.longLived, connectedAt: m.connectedAt,
    } : { connected: false });

    const setResult = (id, platform, result) => db.pool.query(
        `UPDATE social_posts SET results = results || $1::jsonb, updated_at = NOW() WHERE id = $2`,
        [JSON.stringify({ [platform]: { ...result, at: new Date().toISOString() } }), id]
    );

    // ------------------------------------------------------------ görseller

    app.get('/api/social/images/:file', async (req, res) => {
        const m = /^(\d+)-([0-9a-f]{32})\.jpg$/.exec(String(req.params.file || ''));
        const row = m && await db.get('SELECT data FROM social_images WHERE id = ? AND token = ?', [Number(m[1]), m[2]]);
        if (!row) return res.status(404).end();
        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Cross-Origin-Resource-Policy': 'cross-origin',
        });
        res.send(row.data);
    });

    app.post('/api/admin/social/images', requireAdmin, async (req, res) => {
        const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(typeof req.body?.data === 'string' ? req.body.data : '');
        const buf = m ? Buffer.from(m[1], 'base64') : null;
        if (!buf || buf.length < 100 || buf[0] !== 0xff || buf[1] !== 0xd8) return res.status(400).json({ error: 'Görsel JPEG olmalı.' });
        if (buf.length > IMAGE_MAX) return res.status(400).json({ error: 'Görsel en fazla 8 MB olabilir.' });
        const token = randomBytes(16).toString('hex');
        const { rows } = await db.pool.query('INSERT INTO social_images (token, data) VALUES ($1, $2) RETURNING id', [token, buf]);
        res.status(201).json({ id: rows[0].id, url: imageUrl(rows[0].id, token) });
    });

    // ------------------------------------------------------------ durum ve Meta bağlantısı

    app.get('/api/admin/social/status', requireAdmin, async (_req, res) => {
        res.json({ ai: !!AI_KEY, imageHosting: !!publicApiBase(), meta: metaStatus(await readMeta()) });
    });

    /**
     * Graph API Gezgini'nden alınan kullanıcı token'ı (uygulama kimliği ve gizli anahtarıyla
     * birlikte verilirse süresiz sayfa token'ına çevrilir) ya da doğrudan sayfa token'ı.
     * Birden çok sayfa yönetiliyorsa liste döner, yönetici pageId ile seçer.
     */
    app.post('/api/admin/social/meta', requireAdmin, async (req, res) => {
        const token = cleanText(req.body?.token, 2000);
        const appId = optionalText(req.body?.appId, 40);
        const appSecret = optionalText(req.body?.appSecret, 80);
        const pageId = optionalText(req.body?.pageId, 40);
        if (!token || /\s/.test(token)) return res.status(400).json({ error: 'Erişim token\'ı gerekli.' });
        if (appId === null || (appId && !/^\d{5,25}$/.test(appId))) return res.status(400).json({ error: 'Uygulama kimliği yalnız rakamlardan oluşur.' });
        if (appSecret === null || (appSecret && !/^[0-9a-f]{32}$/i.test(appSecret))) return res.status(400).json({ error: 'Uygulama gizli anahtarı 32 karakterlik olmalı.' });
        if (!!appId !== !!appSecret) return res.status(400).json({ error: 'Uygulama kimliği ve gizli anahtarı birlikte girilmeli.' });
        try {
            let userToken = token;
            if (appId) {
                const r = await graph('oauth/access_token', {
                    params: { grant_type: 'fb_exchange_token', client_id: appId, client_secret: appSecret, fb_exchange_token: token },
                });
                userToken = r.access_token;
            }
            const fields = 'id,name,access_token,instagram_business_account{id,username}';
            let pages = [];
            try {
                pages = (await graph('me/accounts', { token: userToken, params: { fields, limit: '100' } })).data ?? [];
            } catch { /* sayfa token'ı: me/accounts yok */ }
            if (!pages.length) {
                const me = await graph('me', { token: userToken, params: { fields: 'id,name,instagram_business_account{id,username}' } })
                    .catch(() => { throw new GraphError('Bu token ile yönetilen bir Facebook sayfası bulunamadı. Token alırken pages_show_list ve pages_manage_posts izinlerini seçip sayfanızı işaretleyin.'); });
                pages = [{ ...me, access_token: userToken }];
            }
            const list = pages.map((p) => ({ id: p.id, name: p.name, instagram: p.instagram_business_account?.username || null }));
            const page = pageId ? pages.find((p) => p.id === pageId) : pages.length === 1 ? pages[0] : null;
            if (!page) return res.json({ meta: { connected: false }, pages: list });
            const value = {
                pageId: page.id, pageName: page.name, pageToken: page.access_token,
                igUserId: page.instagram_business_account?.id || null, igUsername: page.instagram_business_account?.username || null,
                longLived: !!appId, connectedAt: new Date().toISOString(),
            };
            await db.run(
                `INSERT INTO site_settings (key, value, updated_by, updated_at) VALUES (?, ?::jsonb, ?, NOW())
                 ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = NOW()
                 RETURNING key`,
                [META_KEY, JSON.stringify(value), req.admin.id]
            );
            console.log(`[social] ${req.admin?.username}: Meta bağlandı (${page.name}${value.igUsername ? `, @${value.igUsername}` : ''})`);
            res.json({ meta: metaStatus(value), pages: list });
        } catch (e) {
            if (!(e instanceof GraphError)) throw e;
            res.status(400).json({ error: `Meta: ${e.message}` });
        }
    });

    app.delete('/api/admin/social/meta', requireAdmin, async (_req, res) => {
        await db.run('DELETE FROM site_settings WHERE key = ?', [META_KEY]);
        res.json({ meta: { connected: false } });
    });

    // ------------------------------------------------------------ taslaklar

    app.get('/api/admin/social/posts', requireAdmin, async (_req, res) => {
        res.json((await db.all(`${POST_SELECT} ORDER BY p.id DESC LIMIT 60`)).map(toPost));
    });

    const insertPost = async ({ topic, link, texts }, adminId) => {
        const { rows } = await db.pool.query(
            'INSERT INTO social_posts (topic, link, texts, created_by) VALUES ($1, $2, $3::jsonb, $4) RETURNING id',
            [topic, link, JSON.stringify(texts), adminId ?? null]
        );
        return getPost(rows[0].id);
    };

    app.post('/api/admin/social/generate', requireAdmin, async (req, res) => {
        const topic = cleanText(req.body?.topic, 300);
        const notes = optionalText(req.body?.notes, 1500);
        const link = readLink(req.body?.link);
        const lang = Object.hasOwn(LANGS, req.body?.lang) ? req.body.lang : 'tr';
        const tone = Object.hasOwn(TONES, req.body?.tone) ? req.body.tone : 'samimi';
        const platforms = PLATFORMS.filter((p) => Array.isArray(req.body?.platforms) && req.body.platforms.includes(p));
        if (!topic) return res.status(400).json({ error: 'Paylaşımın konusunu yazın.' });
        if (notes === null) return res.status(400).json({ error: 'Not en fazla 1.500 karakter olabilir.' });
        if (link === null) return res.status(400).json({ error: 'Bağlantı https:// ile başlamalı.' });
        if (!platforms.length) return res.status(400).json({ error: 'En az bir platform seçin.' });
        if (!AI_KEY) return res.status(503).json({ error: 'Yapay zekâ anahtarı (GEMINI_API_KEY) sunucuda tanımlı değil.' });
        let texts;
        try {
            texts = await writePosts({ topic, notes, link, lang, tone, platforms }, packages);
        } catch (e) {
            console.warn('[social] metin üretilemedi:', e.message);
            const busy = /quota|rate|429|exhausted/i.test(e.message);
            return res.status(502).json({ error: busy ? 'Yapay zekâ kotası doldu; bir dakika sonra tekrar deneyin.' : 'Yapay zekâ şu an yanıt vermedi; tekrar deneyin.' });
        }
        res.status(201).json(await insertPost({ topic, link: link || '', texts }, req.admin?.id));
    });

    app.post('/api/admin/social/posts', requireAdmin, async (req, res) => {
        const topic = optionalText(req.body?.topic, 300);
        const link = readLink(req.body?.link);
        if (topic === null || link === null) return res.status(400).json({ error: 'Konu ya da bağlantı geçersiz.' });
        res.status(201).json(await insertPost({ topic, link, texts: readTexts(req.body?.texts) }, req.admin?.id));
    });

    app.put('/api/admin/social/posts/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const topic = optionalText(req.body?.topic, 300);
        const link = readLink(req.body?.link);
        const imageId = req.body?.imageId == null ? null : parseId(req.body.imageId);
        if (!id) return res.status(400).json({ error: 'Geçersiz paylaşım.' });
        if (topic === null || link === null) return res.status(400).json({ error: 'Konu ya da bağlantı geçersiz.' });
        if (req.body?.imageId != null && !imageId) return res.status(400).json({ error: 'Geçersiz görsel.' });
        const { rowCount } = await db.pool.query(
            'UPDATE social_posts SET topic = $1, link = $2, texts = $3::jsonb, image_id = $4, updated_at = NOW() WHERE id = $5',
            [topic, link, JSON.stringify(readTexts(req.body?.texts)), imageId, id]
        );
        if (!rowCount) return res.status(404).json({ error: 'Paylaşım bulunamadı.' });
        res.json(await getPost(id));
    });

    app.delete('/api/admin/social/posts/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const row = id && await db.get('DELETE FROM social_posts WHERE id = ? RETURNING image_id', [id]);
        if (!row) return res.status(404).json({ error: 'Paylaşım bulunamadı.' });
        if (row.image_id) {
            await db.run('DELETE FROM social_images WHERE id = ? AND NOT EXISTS (SELECT 1 FROM social_posts WHERE image_id = ?)', [row.image_id, row.image_id]);
        }
        res.json({ success: true });
    });

    /** API'siz platformlar (LinkedIn, X, gruplar) elle paylaşıldıktan sonra işaretlenir. */
    app.post('/api/admin/social/posts/:id/mark', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const platform = req.body?.platform;
        if (!id || !PLATFORMS.includes(platform) || API_PLATFORMS.includes(platform)) return res.status(400).json({ error: 'Geçersiz istek.' });
        await setResult(id, platform, req.body?.done === false ? { status: 'pending' } : { status: 'shared' });
        res.json(await getPost(id));
    });

    // ------------------------------------------------------------ yayınlama

    app.post('/api/admin/social/posts/:id/publish', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const platform = req.body?.platform;
        if (!id || !API_PLATFORMS.includes(platform)) return res.status(400).json({ error: 'Geçersiz istek.' });
        const post = await getPost(id);
        if (!post) return res.status(404).json({ error: 'Paylaşım bulunamadı.' });
        const meta = await readMeta();
        if (!meta) return res.status(400).json({ error: 'Önce Facebook sayfanızı bağlayın.' });
        if (post.results?.[platform]?.status === 'published') return res.status(409).json({ error: 'Bu paylaşım bu platformda zaten yayınlandı.' });
        const text = post.texts?.[platform] || '';
        if (!text) return res.status(400).json({ error: 'Bu platform için metin boş.' });
        try {
            let result;
            if (platform === 'facebook') {
                if (post.image_url) {
                    const r = await graph(`${meta.pageId}/photos`, { method: 'POST', token: meta.pageToken, params: { url: post.image_url, message: text } });
                    result = { id: r.post_id || r.id, url: `https://www.facebook.com/${r.post_id || r.id}` };
                } else {
                    const r = await graph(`${meta.pageId}/feed`, { method: 'POST', token: meta.pageToken, params: { message: text, ...(post.link && { link: post.link }) } });
                    result = { id: r.id, url: `https://www.facebook.com/${r.id}` };
                }
            } else {
                if (!meta.igUserId) return res.status(400).json({ error: 'Facebook sayfanıza bağlı bir Instagram işletme hesabı yok.' });
                if (!post.image_url) return res.status(400).json({ error: 'Instagram için görsel gerekli.' });
                const container = await graph(`${meta.igUserId}/media`, { method: 'POST', token: meta.pageToken, params: { image_url: post.image_url, caption: text } });
                for (let i = 0; i < 15; i++) {
                    const s = await graph(container.id, { token: meta.pageToken, params: { fields: 'status_code' } });
                    if (s.status_code === 'FINISHED') break;
                    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new GraphError('Instagram görseli işleyemedi (biçim ya da en-boy oranı uygun değil).');
                    await sleep(2_000);
                }
                const r = await graph(`${meta.igUserId}/media_publish`, { method: 'POST', token: meta.pageToken, params: { creation_id: container.id } });
                const media = await graph(r.id, { token: meta.pageToken, params: { fields: 'permalink' } }).catch(() => ({}));
                result = { id: r.id, url: media.permalink || `https://www.instagram.com/${meta.igUsername || ''}` };
            }
            await setResult(id, platform, { status: 'published', ...result });
            console.log(`[social] ${req.admin?.username}: paylaşım #${id} → ${platform} (${result.id})`);
            res.json(await getPost(id));
        } catch (e) {
            if (!(e instanceof GraphError)) throw e;
            await setResult(id, platform, { status: 'failed', error: e.message.slice(0, 300) });
            res.status(400).json({ error: `Meta: ${e.message}` });
        }
    });
};
