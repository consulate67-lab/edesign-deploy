/**
 * Yapay zekâ destekli tasarım önerisi: kullanıcının sektörü, tarzı ve istekleri Gemini'ye
 * verilir; model, istemcinin gönderdiği elle hazırlanmış şablon kütüphanesi adayları
 * arasından en uygun üçünü seçer ve gerekçelendirir. Metin üretmez; logo, banka ve özel
 * metinler istemcide şablona işlenir. Burada yalnızca seçim ve günlük hak sayımı var.
 */

const AI_KEY = process.env.ASSISTANT_AI_KEY || process.env.GEMINI_API_KEY || '';
const AI_URL = process.env.ASSISTANT_AI_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const AI_MODEL = process.env.DESIGN_AI_MODEL || process.env.ASSISTANT_AI_MODEL || 'gemini-3.5-flash';
const AI_MODELS = [...new Set([AI_MODEL, ...(AI_URL.includes('googleapis.com') ? ['gemini-3.8-flash', 'gemini-3.1-flash-lite'] : [])])];
const DAILY_LIMIT = Number(process.env.DESIGN_AI_DAILY_LIMIT || 5);
const MAX_CANDIDATES = 30;

const stripControl = (s, keepNewline) => Array.from(s, (ch) => {
    const code = ch.charCodeAt(0);
    return (code < 32 && !(keepNewline && code === 10)) || code === 127 ? ' ' : ch;
}).join('');
const oneLine = (s, max) => (typeof s === 'string' ? stripControl(s, false).replace(/\s+/g, ' ').trim().slice(0, max) : '');
const LANGS = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', fr: 'Fransızca', es: 'İspanyolca' };

const readInput = (body) => {
    const list = (v, n, max) => (Array.isArray(v) ? v.map((x) => oneLine(x, max)).filter(Boolean).slice(0, n) : []);
    const seen = new Set();
    const candidates = (Array.isArray(body?.candidates) ? body.candidates : [])
        .filter((c) => c && typeof c.id === 'string' && /^[a-z0-9-]{3,100}$/.test(c.id) && !seen.has(c.id) && seen.add(c.id))
        .slice(0, MAX_CANDIDATES)
        .map((c) => ({ id: c.id, name: oneLine(c.name, 140), description: oneLine(c.description, 360), tags: list(c.tags, 6, 40), sector: oneLine(c.sector, 60) }));
    return {
        docType: oneLine(body?.docType, 60),
        sector: oneLine(body?.sector, 80),
        wishes: oneLine(body?.wishes, 500),
        moods: list(body?.moods, 6, 30),
        hasLogo: !!body?.hasLogo,
        bankCount: Math.max(0, Math.min(9, Number(body?.bankCount) || 0)),
        candidates,
        lang: typeof body?.lang === 'string' && Object.hasOwn(LANGS, body.lang) ? body.lang : 'tr',
    };
};

const systemPrompt = (input) => [
    'Sen Türk e-belge (UBL-TR e-Fatura, e-Arşiv, e-İrsaliye, e-SMM) tasarımında uzman kıdemli bir grafik tasarımcısın.',
    'Kullanıcıya, aşağıda listelenen elle hazırlanmış hazır tasarımlar arasından sektörüne, tarzına ve isteğine en uygun, birbirinden görsel olarak belirgin biçimde farklı ÜÇ tanesini seç; en uygunu ilk sırada olsun.',
    'Kullanıcının sektörüyle birebir eşleşen tasarım yoksa tarzı ve isteği karşılayan, sektöre yakın olanları seç. İstekte geçen renk, his ve ayrıntıları (ör. lüks, sade, canlı, koyu) dikkate al.',
    `Gerekçe her seçim için tek kısa cümle olsun, kullanıcıya hitap etsin, tasarımın görsel özelliğini ve neden uygun olduğunu anlatsın ve ${LANGS[input.lang]} yazılsın.`,
    'Yalnızca listedeki kimlikleri kullan. YALNIZCA şu biçimde geçerli JSON döndür, başka hiçbir şey yazma:',
    '{"picks":[{"id":"...","reason":"..."},{"id":"...","reason":"..."},{"id":"...","reason":"..."}]}',
].join('\n');

const parseJson = (text) => {
    const m = /\{[\s\S]*\}/.exec(text);
    if (!m) throw new Error('JSON yok');
    return JSON.parse(m[0]);
};

const sanitizePicks = (raw, input) => {
    const allowed = new Set(input.candidates.map((c) => c.id));
    const seen = new Set();
    const picks = (Array.isArray(raw?.picks) ? raw.picks : [])
        .filter((p) => p && allowed.has(p.id) && !seen.has(p.id) && seen.add(p.id))
        .slice(0, 3)
        .map((p) => ({ id: p.id, reason: oneLine(p.reason, 240) }));
    if (!picks.length) throw new Error('tasarım seçilmedi');
    return picks;
};

const askModel = async (model, messages, input, ms) => {
    const body = { model, messages, temperature: 0.4, max_tokens: 900 };
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
        return sanitizePicks(parseJson(text), input);
    } catch (e) {
        throw ctrl.signal.aborted ? new Error(`${model}: ${ms} ms içinde yanıt yok`) : e;
    } finally {
        clearTimeout(timer);
    }
};

/** Bir model yoğunluk vb. nedenle yanıt vermezse sıradakine geçer; her deneme en çok 12 sn, toplam 35 sn. */
const askPicks = async (input) => {
    const user = JSON.stringify({
        belge: input.docType, sektor: input.sector, istek: input.wishes, tarz: input.moods,
        logoVar: input.hasLogo, bankaHesabi: input.bankCount,
        tasarimlar: input.candidates.map((c) => ({ id: c.id, ad: c.name, aciklama: c.description, etiketler: c.tags, sektor: c.sector })),
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

    app.post('/api/design-ai/pick', authenticateToken, async (req, res, next) => {
        try {
            const input = readInput(req.body);
            if (input.candidates.length < 2) return res.status(400).json({ error: 'candidates' });
            const quota = await quotaOf(req.user);
            if (!quota.ai) return res.json({ source: 'rules', reason: 'disabled', quota });
            if (quota.remaining === 0) return res.json({ source: 'rules', reason: 'limit', quota });
            let picks;
            try {
                picks = await askPicks(input);
            } catch (e) {
                console.warn('[design-ai] öneri alınamadı:', e?.message || e);
                return res.json({ source: 'rules', reason: 'error', quota });
            }
            await db.run('INSERT INTO design_ai_usage (user_id, doc_type, sector, wishes) VALUES (?, ?, ?, ?)', [req.user.id, input.docType, input.sector, input.wishes]);
            res.json({ source: 'ai', picks, quota: await quotaOf(req.user) });
        } catch (e) {
            next(e);
        }
    });
}
