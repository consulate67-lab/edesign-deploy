import { createHash } from 'node:crypto';
import { cleanText, optionalText, parseId } from './util.js';
import { buildSeedKb, SUGGESTIONS } from './assistant-kb.js';

const AI_KEY = process.env.ASSISTANT_AI_KEY || process.env.GEMINI_API_KEY || '';
const AI_URL = process.env.ASSISTANT_AI_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const AI_MODEL = process.env.ASSISTANT_AI_MODEL || 'gemini-3.5-flash';
const AI_DAILY_LIMIT = Number(process.env.ASSISTANT_AI_DAILY_LIMIT || 400);

const QUESTION_MAX = 500;
const ANSWER_MAX = 4000;
const ACTIONS = ['register', 'login', 'pricing', 'docs', 'faq', 'product', 'contact'];
const KB_DIRECT = 0.45;
const KB_HINT = 0.18;

/* ------------------------------------------------------------------ arama */

const TR = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
export const normalize = (s) => String(s || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşüâîû]/g, (c) => TR[c])
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const STOP = new Set(('ve veya ile bir bu su o da de mi mu ne nasil neden niye icin gibi ben sen biz siz var yok midir ki ya en cok daha '
    + 'olarak olan olur acaba lutfen bana beni bunu sunu hangi kac nedir nerede nereden zaman yapabilir miyim misiniz istiyorum').split(' '));

/** Türkçe ekler için kaba kök: ilk 6 harf ("faturalarım" → "fatura"). */
const stem = (t) => (t.length > 6 ? t.slice(0, 6) : t);
const tokens = (s) => [...new Set(normalize(s).split(' ').filter((t) => t.length > 1 && !STOP.has(t)).map(stem))];

/** "logomu" ~ "logo", "eklerim" ~ "ekle": kısa olan en az 4 harfse önek eşleşmesi yeter. */
const matches = (a, b) => a === b || (Math.min(a.length, b.length) >= 4 && (a.startsWith(b) || b.startsWith(a)));
const has = (list, t) => list.some((x) => matches(t, x));

const buildIndex = (entries) => ({
    docs: entries.map((e) => ({ entry: e, q: tokens(e.q), k: tokens(e.keywords), a: tokens(e.a) })),
});

const search = (index, question, limit = 6) => {
    const qt = tokens(question);
    if (!qt.length) return [];
    const n = index.docs.length || 1;
    const idf = qt.map((t) => {
        const df = index.docs.filter((d) => has(d.q, t) || has(d.k, t) || has(d.a, t)).length;
        return Math.log(1 + n / (1 + df));
    });
    const total = idf.reduce((s, w) => s + w, 0);
    return index.docs
        .map((d) => {
            const hit = qt.reduce((s, t, i) => s + idf[i] * (has(d.q, t) ? 1 : has(d.k, t) ? 0.9 : has(d.a, t) ? 0.35 : 0), 0);
            return { entry: d.entry, score: hit / total };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

/* ------------------------------------------------------------ yapay zekâ */

const SYSTEM_PROMPT = `Sen "Edi" adında, eBelge Tasarımcı (edxdocu.com) web sitesinin güler yüzlü yardım asistanısın.
Görevin: ziyaretçilere bu sitenin ne işe yaradığını, nasıl kullanıldığını, üyelik, paketler, ödeme, tasarım hakları, şablonlar, tasarım ekranı ve destek konularında yol göstermek.
Kurallar:
- Yalnızca BİLGİ BANKASI'ndaki bilgilere dayan. Fiyat, hak sayısı, düğme adı gibi bilgileri aynen oradan al; uydurma.
- Bilgi bankasında olmayan site sorularında "Bu konuda kesin bilgim yok" de ve destek ekibine yazmayı öner.
- Site ve e-belge tasarımı dışındaki konularda (genel sohbet, kod yazma, vergi/muhasebe danışmanlığı, başka ürünler vb.) kibarca yalnızca bu site hakkında yardımcı olabileceğini söyle ve ilgili bir site konusuna yönlendir.
- Selamlama yapma ve kendini tanıtma ("Merhaba", "Ben Edi" gibi); doğrudan yanıta geç. Yanıtı "Başka bir konuda yardımcı olabilir miyim?" gibi kalıplarla bitirme.
- Türkçe, samimi ve kısa yanıt ver (en fazla 120 kelime). Adım gerekiyorsa "- " ile madde kullan. Önemli düğme adlarını **kalın** yaz.
- HTML, başlık, tablo, bağlantı veya URL yazma. Kendinden "yapay zekâ modeli" diye bahsetme.`;

let aiCallsDay = '';
let aiCallsCount = 0;
const aiBudgetLeft = () => {
    const day = new Date().toISOString().slice(0, 10);
    if (day !== aiCallsDay) { aiCallsDay = day; aiCallsCount = 0; }
    return aiCallsCount < AI_DAILY_LIMIT;
};

const askAi = async (question, history, context) => {
    aiCallsCount += 1;
    const kb = context.map((e) => `S: ${e.q}\nC: ${e.a}`).join('\n\n');
    const messages = [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nBİLGİ BANKASI:\n${kb}` },
        ...history.map((h) => ({ role: h.role, content: h.text })),
        { role: 'user', content: question },
    ];
    const body = { model: AI_MODEL, messages, temperature: 0.3, max_tokens: 700 };
    if (AI_URL.includes('googleapis.com')) body.reasoning_effort = 'none';
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
        const res = await fetch(AI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_KEY}` },
            body: JSON.stringify(body),
            signal: ctrl.signal,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error?.message || data?.[0]?.error?.message || `HTTP ${res.status}`);
        const text = data?.choices?.[0]?.message?.content;
        if (typeof text !== 'string' || !text.trim()) throw new Error('boş yanıt');
        return text.trim().slice(0, ANSWER_MAX);
    } finally {
        clearTimeout(timer);
    }
};

/* -------------------------------------------------------- hız sınırı */

const hits = new Map();
const PER_MINUTE = 10;
const PER_DAY = 150;
const allow = (key) => {
    const now = Date.now();
    const list = (hits.get(key) || []).filter((t) => now - t < 86_400_000);
    if (list.length >= PER_DAY || list.filter((t) => now - t < 60_000).length >= PER_MINUTE) {
        hits.set(key, list);
        return false;
    }
    list.push(now);
    hits.set(key, list);
    return true;
};
setInterval(() => {
    const now = Date.now();
    for (const [k, list] of hits) if (!list.some((t) => now - t < 86_400_000)) hits.delete(k);
}, 3_600_000).unref();

/* ------------------------------------------------------------ yardımcılar */

const SMALL_TALK = [
    { re: /^(merhaba|selam|selamlar|hey|iyi gunler|gunaydin|iyi aksamlar|slm|mrb)\b/, a: 'Merhaba! Ben **Edi**, eBelge Tasarımcı asistanıyım. Site, paketler, tasarım ekranı veya hesabınızla ilgili ne sormak istersiniz?' },
    { re: /^(tesekkur|tesekkurler|sagol|sag ol|eyvallah|cok sagol|tsk)/, a: 'Rica ederim! Başka bir sorunuz olursa buradayım.' },
    { re: /^(sen kimsin|kimsin|adin ne|bot musun|robot musun)/, a: 'Ben **Edi**, bu sitenin yardım asistanıyım. Sitenin nasıl kullanıldığı, paketler, tasarım ve destek konularında yol gösteririm.' },
];

const OFF_TOPIC = 'Bu konuda yardımcı olamıyorum; ben yalnızca **eBelge Tasarımcı** sitesi, e-belge tasarımı, paketler ve hesabınızla ilgili sorulara yanıt veriyorum. Aşağıdaki konulardan birini seçebilir ya da sorunuzu farklı sözcüklerle yazabilirsiniz.';

const ipKey = (req) => createHash('sha256').update(String(req.ip || '')).digest('hex').slice(0, 16);

const parseHistory = (raw) => (Array.isArray(raw) ? raw : [])
    .slice(-6)
    .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.text === 'string' && h.text.trim())
    .map((h) => ({ role: h.role, text: h.text.trim().slice(0, 800) }));

const parseActions = (raw) => {
    const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',') : [];
    return [...new Set(list.map((a) => String(a).trim()).filter((a) => ACTIONS.includes(a)))];
};

const serializeKb = (row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    keywords: row.keywords,
    actions: row.actions ?? [],
    status: row.status,
    source: row.source,
    hits: row.hits,
    created_at: row.created_at,
    updated_at: row.updated_at,
});

const serializeLog = (row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    mode: row.mode,
    score: row.score === null ? null : Number(row.score),
    helpful: row.helpful,
    resolved: row.resolved,
    page: row.page,
    created_at: row.created_at,
});

/* ------------------------------------------------------------------ rotalar */

export const registerAssistantRoutes = (app, { db, requireAdmin, packages }) => {
    const seeds = buildSeedKb(packages);
    let index = null;

    const loadIndex = async () => {
        const rows = await db.all(`SELECT * FROM assistant_kb WHERE status = 'active'`);
        const learned = rows.map((r) => ({ id: `kb-${r.id}`, dbId: r.id, q: r.question, a: r.answer, keywords: r.keywords || '', actions: r.actions ?? [] }));
        index = buildIndex([...seeds, ...learned]);
        return index;
    };
    const getIndex = async () => index ?? loadIndex();
    const invalidate = () => { index = null; };

    const bumpHits = (entry) => {
        if (entry?.dbId) db.run('UPDATE assistant_kb SET hits = hits + 1 WHERE id = ?', [entry.dbId]).catch(() => {});
    };

    app.get('/api/assistant/info', (_req, res) => {
        res.json({ name: 'Edi', ai: !!AI_KEY, suggestions: SUGGESTIONS });
    });

    app.post('/api/assistant/ask', async (req, res) => {
        const question = cleanText(req.body?.question, QUESTION_MAX);
        if (!question) return res.status(400).json({ error: `Soru 1-${QUESTION_MAX} karakter olmalı.` });
        if (!allow(ipKey(req))) {
            return res.status(429).json({ error: 'Çok sık soru gönderdiniz; lütfen biraz sonra tekrar deneyin.' });
        }
        const history = parseHistory(req.body?.history);
        const session = optionalText(req.body?.session, 64) || null;
        const page = optionalText(req.body?.page, 40) || null;
        const norm = normalize(question);

        let answer = '';
        let mode = 'kb';
        let actions = [];
        let suggestions = [];
        const idx = await getIndex();
        const results = search(idx, question);
        const top = results[0];
        const score = top?.score ?? 0;

        const small = SMALL_TALK.find((s) => s.re.test(norm));
        if (small && norm.split(' ').length <= 4) {
            answer = small.a;
            mode = 'smalltalk';
            suggestions = SUGGESTIONS.slice(0, 4);
        } else {
            if (!history.length) {
                const cached = await db.get(
                    `SELECT answer FROM assistant_log
                      WHERE norm = ? AND mode IN ('ai', 'cache') AND (helpful IS NULL OR helpful > 0)
                        AND created_at > NOW() - INTERVAL '14 days'
                      ORDER BY helpful DESC NULLS LAST, created_at DESC LIMIT 1`,
                    [norm]
                );
                if (cached) { answer = cached.answer; mode = 'cache'; }
            }
            if (!answer && AI_KEY && aiBudgetLeft()) {
                const context = results.map((r) => r.entry);
                for (const id of ['s-nedir', 's-fiyat', 's-hak']) {
                    if (!context.some((e) => e.id === id)) context.push(seeds.find((s) => s.id === id));
                }
                try {
                    answer = await askAi(question, history, context);
                    mode = 'ai';
                } catch (e) {
                    console.warn('[assistant] yapay zekâ yanıtı alınamadı:', e.message);
                }
            }
            if (!answer) {
                if (score >= KB_DIRECT) {
                    answer = top.entry.a;
                    mode = 'kb';
                } else if (score >= KB_HINT) {
                    answer = 'Sorunuzu tam anlayamadım. Şunlardan birini mi soruyorsunuz?';
                    mode = 'hint';
                    suggestions = results.slice(0, 3).map((r) => r.entry.q);
                } else {
                    answer = OFF_TOPIC;
                    mode = 'none';
                    suggestions = SUGGESTIONS.slice(0, 4);
                }
            }
            if (mode !== 'none' && mode !== 'hint' && score >= 0.3) {
                actions = top.entry.actions;
                bumpHits(top.entry);
            }
            if (mode === 'kb' || mode === 'ai' || mode === 'cache') {
                suggestions = results.slice(1, 3).filter((r) => r.score >= 0.3).map((r) => r.entry.q);
            }
        }

        const row = await db.get(
            `INSERT INTO assistant_log (session, question, norm, answer, mode, score, page, kb_ref)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
            [session, question, norm, answer, mode, Number(score.toFixed(3)), page, top?.entry.id ?? null]
        );
        res.json({ id: row.id, answer, mode, actions, suggestions });
    });

    app.post('/api/assistant/feedback', async (req, res) => {
        const id = parseId(req.body?.id);
        const helpful = req.body?.helpful === 1 ? 1 : req.body?.helpful === -1 ? -1 : null;
        if (!id || !helpful) return res.status(400).json({ error: 'Geçersiz geri bildirim.' });
        const log = await db.get('UPDATE assistant_log SET helpful = ? WHERE id = ? RETURNING *', [helpful, id]);
        if (!log) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
        if (helpful === 1 && (log.mode === 'ai' || log.mode === 'cache')) {
            const exists = await db.get(`SELECT id FROM assistant_kb WHERE norm = ?`, [log.norm]);
            if (!exists) {
                await db.run(
                    `INSERT INTO assistant_kb (question, answer, keywords, actions, status, source, norm, log_id)
                     VALUES (?, ?, '', '[]'::jsonb, 'pending', 'learned', ?, ?)`,
                    [log.question, log.answer, log.norm, log.id]
                );
            }
        }
        res.json({ success: true });
    });

    /* ---------------------------------------------------------- yönetim */

    app.get('/api/admin/assistant/overview', requireAdmin, async (_req, res) => {
        const stats = await db.get(`
            SELECT COUNT(*)::int AS total,
                   COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day')::int AS today,
                   COUNT(*) FILTER (WHERE mode IN ('none', 'hint') AND NOT resolved)::int AS unanswered,
                   COUNT(*) FILTER (WHERE helpful = -1 AND NOT resolved)::int AS negative,
                   COUNT(*) FILTER (WHERE helpful = 1)::int AS positive,
                   COUNT(*) FILTER (WHERE mode = 'ai')::int AS ai
              FROM assistant_log`);
        const kb = await db.get(`
            SELECT COUNT(*) FILTER (WHERE status = 'active')::int AS active,
                   COUNT(*) FILTER (WHERE status = 'pending')::int AS pending
              FROM assistant_kb`);
        res.json({
            ai: { configured: !!AI_KEY, model: AI_MODEL, provider: AI_URL.replace(/^https?:\/\//, '').split('/')[0], dailyLimit: AI_DAILY_LIMIT, usedToday: aiCallsDay === new Date().toISOString().slice(0, 10) ? aiCallsCount : 0 },
            stats: { ...stats, kbActive: kb.active, kbPending: kb.pending, builtin: seeds.length },
        });
    });

    app.get('/api/admin/assistant/kb', requireAdmin, async (_req, res) => {
        const rows = await db.all(`SELECT * FROM assistant_kb ORDER BY (status = 'pending') DESC, updated_at DESC`);
        res.json({
            entries: rows.map(serializeKb),
            builtin: seeds.map((s) => ({ id: s.id, question: s.q, answer: s.a, actions: s.actions })),
        });
    });

    const parseKb = (body) => {
        const value = {
            question: cleanText(body?.question, QUESTION_MAX),
            answer: cleanText(body?.answer, ANSWER_MAX),
            keywords: optionalText(body?.keywords, 500),
            actions: parseActions(body?.actions),
            status: body?.status ?? 'active',
        };
        if (!value.question) return { error: `Soru 1-${QUESTION_MAX} karakter olmalı.` };
        if (!value.answer) return { error: `Yanıt 1-${ANSWER_MAX} karakter olmalı.` };
        if (value.keywords === null) return { error: 'Anahtar kelimeler en fazla 500 karakter olabilir.' };
        if (!['active', 'pending', 'disabled'].includes(value.status)) return { error: 'Geçersiz durum.' };
        return { value };
    };

    app.post('/api/admin/assistant/kb', requireAdmin, async (req, res) => {
        const { value, error } = parseKb(req.body);
        if (error) return res.status(400).json({ error });
        const logId = parseId(req.body?.log_id);
        const row = await db.get(
            `INSERT INTO assistant_kb (question, answer, keywords, actions, status, source, norm, log_id)
             VALUES (?, ?, ?, ?::jsonb, ?, 'admin', ?, ?) RETURNING *`,
            [value.question, value.answer, value.keywords, JSON.stringify(value.actions), value.status, normalize(value.question), logId]
        );
        if (logId) await db.run('UPDATE assistant_log SET resolved = TRUE WHERE id = ?', [logId]);
        invalidate();
        res.json(serializeKb(row));
    });

    app.put('/api/admin/assistant/kb/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Geçersiz kayıt.' });
        const { value, error } = parseKb(req.body);
        if (error) return res.status(400).json({ error });
        const row = await db.get(
            `UPDATE assistant_kb SET question = ?, answer = ?, keywords = ?, actions = ?::jsonb, status = ?, norm = ?, updated_at = NOW()
              WHERE id = ? RETURNING *`,
            [value.question, value.answer, value.keywords, JSON.stringify(value.actions), value.status, normalize(value.question), id]
        );
        if (!row) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
        invalidate();
        res.json(serializeKb(row));
    });

    app.delete('/api/admin/assistant/kb/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        const result = id ? await db.run('DELETE FROM assistant_kb WHERE id = ?', [id]) : null;
        if (!result?.changes) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
        invalidate();
        res.json({ success: true });
    });

    app.get('/api/admin/assistant/logs', requireAdmin, async (req, res) => {
        const filter = String(req.query.filter || 'review');
        const where = {
            review: `NOT resolved AND (mode IN ('none', 'hint') OR helpful = -1)`,
            unanswered: `NOT resolved AND mode IN ('none', 'hint')`,
            negative: `NOT resolved AND helpful = -1`,
            positive: 'helpful = 1',
            all: 'TRUE',
        }[filter] || 'TRUE';
        const rows = await db.all(`SELECT * FROM assistant_log WHERE ${where} ORDER BY created_at DESC LIMIT 200`);
        res.json(rows.map(serializeLog));
    });

    app.patch('/api/admin/assistant/logs/:id', requireAdmin, async (req, res) => {
        const id = parseId(req.params.id);
        if (!id || typeof req.body?.resolved !== 'boolean') return res.status(400).json({ error: 'Geçersiz istek.' });
        const row = await db.get('UPDATE assistant_log SET resolved = ? WHERE id = ? RETURNING *', [req.body.resolved, id]);
        if (!row) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
        res.json(serializeLog(row));
    });
};
