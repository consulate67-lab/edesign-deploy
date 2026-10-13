/**
 * Yapay zekâ destekli tasarım önerisi: kullanıcının yüklediği XSLT'den çıkarılan
 * özel metinler, sektör ve istekler Gemini'ye verilir; model hazır profesyonel
 * şablon kütüphanesinden üç seçim, renk, yazı tipi ve metin yerleşimi döndürür.
 * Çizim istemcide yapılır; burada yalnızca karar ve günlük hak sayımı var.
 */

const AI_KEY = process.env.ASSISTANT_AI_KEY || process.env.GEMINI_API_KEY || '';
const AI_URL = process.env.ASSISTANT_AI_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const AI_MODEL = process.env.DESIGN_AI_MODEL || process.env.ASSISTANT_AI_MODEL || 'gemini-3.5-flash';
const AI_MODELS = [...new Set([AI_MODEL, ...(AI_URL.includes('googleapis.com') ? ['gemini-3.8-flash', 'gemini-3.1-flash-lite'] : [])])];
const DAILY_LIMIT = Number(process.env.DESIGN_AI_DAILY_LIMIT || 5);

const PRO_STYLES = {
    antet: 'Zarif Antetli: ortalanmış antet, tırnaklı (serif) başlıklar, ince çift çizgiler. Hukuk, mali müşavir, danışmanlık, mimarlık, butik otel, kuyumcu.',
    serit: 'Kurumsal Şerit: koyu tam genişlik başlık şeridi, bilgi kartları, güçlü toplam bandı. İnşaat, sanayi, lojistik, toptan, otomotiv, enerji.',
    panel: 'Yan Panel: solda koyu bilgi paneli (satıcı, banka, karekod), sağda kalemler. Bilişim, ajans, eğitim, danışmanlık; az kalemli hizmet faturaları.',
    isvec: 'İsviçre Minimal: büyük ince başlık, ızgara bilgi satırı, yalnızca çizgiler, bol beyaz alan. Tasarım, sağlık, mimarlık, teknoloji; sade isteyenler.',
    tutar: 'Tutar Önde: ödenecek tutar, vade ve IBAN üstte büyük kartta. Tahsilat odaklı: abonelik, kira, aidat, servis, toptan satış.',
    kart: 'Modern Kart: yumuşak zemin üzerinde yuvarlak kartlar, degrade şerit, rozetler. E-ticaret, perakende, kafe-restoran, güzellik, etkinlik.',
};
const STYLE_IDS = Object.keys(PRO_STYLES);
const FONTS = ['segoe', 'arial', 'calibri', 'trebuchet', 'tahoma', 'georgia'];
const COLOR_MODES = ['sade', 'dengeli', 'canli'];
const TEXT_KEYS = {
    slogan: 'firma adının altında kısa slogan (en çok 60 karakter)',
    headerNote: 'sayfanın en üstünde duyuru şeridi',
    thanks: 'alt bölümde kısa teşekkür cümlesi',
    returnPolicy: 'iade / garanti koşulları',
    contact: 'iletişim satırı (telefon, e-posta, web, adres)',
    legal: 'yasal bilgiler (MERSİS, ticaret sicil, KEP, sermaye)',
    footer: 'diğer alt bilgi metinleri',
};

const stripControl = (s, keepNewline) => Array.from(s, (ch) => {
    const code = ch.charCodeAt(0);
    return (code < 32 && !(keepNewline && code === 10)) || code === 127 ? ' ' : ch;
}).join('');
const oneLine = (s, max) => (typeof s === 'string' ? stripControl(s, false).replace(/\s+/g, ' ').trim().slice(0, max) : '');
const multiLine = (s, max) => (typeof s === 'string'
    ? stripControl(s.replace(/\r\n?/g, '\n'), true).split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n').slice(0, max)
    : '');
const isHex = (s) => typeof s === 'string' && /^#[0-9a-f]{6}$/i.test(s);
const LANGS = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', fr: 'Fransızca', es: 'İspanyolca' };

const readInput = (body) => {
    const list = (v, n, max) => (Array.isArray(v) ? v.map((x) => oneLine(x, max)).filter(Boolean).slice(0, n) : []);
    const sections = Array.isArray(body?.sections)
        ? body.sections.filter((s) => s && typeof s.id === 'string' && /^[a-zA-Z]{2,30}$/.test(s.id)).slice(0, 30)
            .map((s) => ({ id: s.id, label: oneLine(s.label, 80), detected: !!s.detected }))
        : [];
    return {
        docType: oneLine(body?.docType, 60),
        sector: oneLine(body?.sector, 80),
        wishes: oneLine(body?.wishes, 500),
        moods: list(body?.moods, 6, 30),
        texts: list(body?.texts, 14, 240),
        sections,
        hasLogo: !!body?.hasLogo,
        bankCount: Math.max(0, Math.min(9, Number(body?.bankCount) || 0)),
        accentHint: isHex(body?.accentHint) ? body.accentHint.toLowerCase() : null,
        lang: typeof body?.lang === 'string' && Object.hasOwn(LANGS, body.lang) ? body.lang : 'tr',
    };
};

const systemPrompt = (input) => [
    'Sen Türk e-belge (UBL-TR e-Fatura, e-Arşiv, e-İrsaliye, e-SMM) tasarımında uzman kıdemli bir grafik tasarımcısın.',
    'Kullanıcının sektörüne ve isteklerine göre aşağıdaki hazır profesyonel şablonlardan birbirinden belirgin biçimde farklı ÜÇ tanesini seç, en uygunu ilk sırada olsun.',
    'Şablonlar:',
    ...STYLE_IDS.map((id) => `- ${id}: ${PRO_STYLES[id]}`),
    `Yazı tipleri: ${FONTS.join(', ')} (georgia tırnaklıdır; zarif ve geleneksel işler için).`,
    'Renk yoğunluğu: sade (gri tonlar), dengeli (önerilen), canli (renkli dolgu).',
    'Vurgu rengi: sektöre ve isteğe uygun, beyaz zeminde okunaklı, #rrggbb. Logodan gelen renk verildiyse ona yakın kal.',
    'Metin alanları:',
    ...Object.entries(TEXT_KEYS).map(([k, d]) => `- ${k}: ${d}`),
    'XSLT\'den çıkarılan özel metinleri anlamına göre bu alanlara yerleştir; kelimeleri koru, yalnızca yazım hatasını düzelt. Aynı alana düşen birden fazla metni satır sonuyla (\\n) birleştir.',
    'Firma unvanı, yasal bilgi, sicil no, telefon, adres, IBAN, slogan, duyuru UYDURMA: thanks dışındaki alanlara yalnızca verilen metinleri koy, metin yoksa alanı hiç yazma. thanks için sektöre uygun kısa bir Türkçe teşekkür cümlesi önerebilirsin.',
    input.sections.length ? `Bölümler (yalnızca bu kimlikleri kullan): ${input.sections.map((s) => `${s.id} = ${s.label}${s.detected ? ' [XSLT\'de var]' : ''}`).join('; ')}. XSLT\'de olanları açık tut.` : '',
    `Gerekçe her şablon için tek kısa cümle olsun, kullanıcıya hitap etsin ve ${LANGS[input.lang]} yazılsın. Belge metinleri (texts) Türkçe kalır.`,
    'YALNIZCA şu biçimde geçerli JSON döndür, başka hiçbir şey yazma:',
    '{"styles":["serit","antet","kart"],"accent":"#1d4ed8","font":"segoe","colorMode":"dengeli","reasons":{"serit":"...","antet":"...","kart":"..."},"texts":{"thanks":"..."},"sections":{"odeme":true}}',
].filter(Boolean).join('\n');

const parseJson = (text) => {
    const m = /\{[\s\S]*\}/.exec(text);
    if (!m) throw new Error('JSON yok');
    return JSON.parse(m[0]);
};

const norm = (s) => s.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]+/gu, '');

/**
 * Model yasaklara rağmen sicil no, unvan, slogan uydurabiliyor: teşekkür dışındaki alanlarda
 * yalnızca kullanıcının XSLT'sinde geçen parçalar kalır. Yerleşmeyen özgün metni istemci ekler.
 */
const groundTexts = (texts, input) => {
    const sources = input.texts.map(norm).filter(Boolean);
    const out = {};
    for (const [key, value] of Object.entries(texts)) {
        if (key === 'thanks') {
            if (value.length <= 140 && !/[\d@]|www\.|https?:/i.test(value)) out.thanks = value.replace(/\n/g, ' ');
            continue;
        }
        const segs = value.split(/\n|\s+[·|•]\s+/).map((s) => s.trim()).filter(Boolean);
        const kept = segs.filter((seg) => {
            const n = norm(seg);
            return n.length >= 4 && sources.some((src) => src.includes(n));
        });
        if (kept.length) out[key] = kept.length === segs.length ? value : kept.join('\n');
    }
    return out;
};

const sanitizeBrief = (raw, input) => {
    const styles = Array.isArray(raw?.styles) ? [...new Set(raw.styles.filter((s) => STYLE_IDS.includes(s)))].slice(0, 3) : [];
    if (!styles.length) throw new Error('şablon seçilmedi');
    const reasons = {};
    for (const id of styles) {
        const r = oneLine(raw?.reasons?.[id], 220);
        if (r) reasons[id] = r;
    }
    const texts = {};
    for (const key of Object.keys(TEXT_KEYS)) {
        const t = key === 'slogan' ? oneLine(raw?.texts?.[key], 80) : multiLine(raw?.texts?.[key], 600);
        if (t) texts[key] = t;
    }
    const allowed = new Set(input.sections.map((s) => s.id));
    const sections = {};
    for (const [id, on] of Object.entries(raw?.sections ?? {})) {
        if (allowed.has(id) && typeof on === 'boolean') sections[id] = on;
    }
    return {
        styles,
        accent: isHex(raw?.accent) ? raw.accent.toLowerCase() : null,
        font: FONTS.includes(raw?.font) ? raw.font : null,
        colorMode: COLOR_MODES.includes(raw?.colorMode) ? raw.colorMode : null,
        reasons,
        texts: groundTexts(texts, input),
        sections,
    };
};

const askModel = async (model, messages, input, ms) => {
    const body = { model, messages, temperature: 0.4, max_tokens: 1200 };
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
        return sanitizeBrief(parseJson(text), input);
    } catch (e) {
        throw ctrl.signal.aborted ? new Error(`${model}: ${ms} ms içinde yanıt yok`) : e;
    } finally {
        clearTimeout(timer);
    }
};

/** Bir model yoğunluk vb. nedenle yanıt vermezse sıradakine geçer; her deneme en çok 12 sn, toplam 35 sn. */
const askBrief = async (input) => {
    const user = JSON.stringify({
        belge: input.docType, sektor: input.sector, istek: input.wishes, tarz: input.moods,
        xsltOzelMetinler: input.texts, logoVar: input.hasLogo, bankaHesabi: input.bankCount, logoRengi: input.accentHint,
    });
    const messages = [{ role: 'system', content: systemPrompt(input) }, { role: 'user', content: user }];
    const deadline = Date.now() + 35_000;
    let last;
    for (const [i, model] of AI_MODELS.entries()) {
        const left = deadline - Date.now();
        if (left < 2_000) break;
        try {
            return await askModel(model, messages, input, i === AI_MODELS.length - 1 ? left : Math.min(12_000, left));
        } catch (e) {
            last = e;
            console.warn('[design-ai] model yanıt vermedi, sıradaki deneniyor:', e.message);
        }
    }
    throw last ?? new Error('süre doldu');
};

const TODAY_TR = `(date_trunc('day', NOW() AT TIME ZONE 'Europe/Istanbul') AT TIME ZONE 'Europe/Istanbul')`;

export function registerDesignAiRoutes(app, { db, authenticateToken }) {
    const quotaOf = async (user) => {
        const admin = user.role === 'admin';
        const row = await db.get(`SELECT COUNT(*)::int AS n FROM design_ai_usage WHERE user_id = ? AND created_at >= ${TODAY_TR}`, [user.id]);
        const used = row?.n ?? 0;
        return { ai: !!AI_KEY, limit: admin ? null : DAILY_LIMIT, used, remaining: admin ? null : Math.max(0, DAILY_LIMIT - used) };
    };

    app.get('/api/design-ai/quota', authenticateToken, async (req, res, next) => {
        try {
            res.json(await quotaOf(req.user));
        } catch (e) {
            next(e);
        }
    });

    app.post('/api/design-ai/brief', authenticateToken, async (req, res, next) => {
        try {
            const input = readInput(req.body);
            const quota = await quotaOf(req.user);
            if (!quota.ai) return res.json({ source: 'rules', reason: 'disabled', quota });
            if (quota.remaining === 0) return res.json({ source: 'rules', reason: 'limit', quota });
            let brief;
            try {
                brief = await askBrief(input);
            } catch (e) {
                console.warn('[design-ai] öneri alınamadı:', e?.message || e);
                return res.json({ source: 'rules', reason: 'error', quota });
            }
            await db.run('INSERT INTO design_ai_usage (user_id, doc_type, sector, wishes) VALUES (?, ?, ?, ?)', [req.user.id, input.docType, input.sector, input.wishes]);
            res.json({ source: 'ai', brief, quota: await quotaOf(req.user) });
        } catch (e) {
            next(e);
        }
    });
}
