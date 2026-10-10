import { createHash } from 'node:crypto';
import { cleanText, optionalText, parseId } from './util.js';
import { buildSeedKb, SUGGESTIONS } from './assistant-kb.js';
import { buildIntlSeedKb, INTL_LANGS, INTL_SUGGESTIONS } from './assistant-kb-intl.js';

const AI_KEY = process.env.ASSISTANT_AI_KEY || process.env.GEMINI_API_KEY || '';
const AI_URL = process.env.ASSISTANT_AI_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const AI_MODEL = process.env.ASSISTANT_AI_MODEL || 'gemini-3.5-flash';
const AI_DAILY_LIMIT = Number(process.env.ASSISTANT_AI_DAILY_LIMIT || 400);

const QUESTION_MAX = 500;
const ANSWER_MAX = 4000;
const ACTIONS = ['register', 'login', 'pricing', 'docs', 'faq', 'product', 'contact'];
const KB_DIRECT = 0.45;
const KB_HINT = 0.18;

/* ------------------------------------------------------------------ dil */

/** Asistan, sitenin üstündeki arayüz dilinde konuşur; Türkçe dışında fiyatlar EUR / GBP. */
const LANGS = ['tr', ...INTL_LANGS];
const LANG_NAMES = { tr: 'Türkçe', en: 'İngilizce (English)', de: 'Almanca (Deutsch)', fr: 'Fransızca (Français)', es: 'İspanyolca (Español)' };

const parseLocale = (lang, currency) => {
    const l = LANGS.includes(lang) ? lang : 'tr';
    return { lang: l, currency: l === 'tr' ? 'TRY' : currency === 'GBP' ? 'GBP' : 'EUR' };
};

const suggestionsFor = (lang) => (lang === 'tr' ? SUGGESTIONS : INTL_SUGGESTIONS[lang]);

const MESSAGES = {
    tr: {
        length: (max) => `Soru 1-${max} karakter olmalı.`,
        rate: 'Çok sık soru gönderdiniz; lütfen biraz sonra tekrar deneyin.',
        hint: 'Sorunuzu tam anlayamadım. Şunlardan birini mi soruyorsunuz?',
        offTopic: 'Bu konuda yardımcı olamıyorum; ben yalnızca **eBelge Tasarımcı** sitesi, e-belge tasarımı, paketler ve hesabınızla ilgili sorulara yanıt veriyorum. Aşağıdaki konulardan birini seçebilir ya da sorunuzu farklı sözcüklerle yazabilirsiniz.',
    },
    en: {
        length: (max) => `The question must be 1-${max} characters.`,
        rate: 'You have sent questions too often; please try again in a moment.',
        hint: 'I didn’t fully understand your question. Did you mean one of these?',
        offTopic: 'I can’t help with that; I only answer questions about the **e-Document Designer** site, e-document design, packages and your account. Pick one of the topics below or rephrase your question.',
    },
    de: {
        length: (max) => `Die Frage muss 1-${max} Zeichen lang sein.`,
        rate: 'Sie haben zu oft Fragen gesendet; bitte versuchen Sie es gleich noch einmal.',
        hint: 'Ich habe Ihre Frage nicht ganz verstanden. Meinten Sie eine dieser Fragen?',
        offTopic: 'Dabei kann ich nicht helfen; ich beantworte nur Fragen zur Website **E-Beleg-Designer**, zur Gestaltung von E-Belegen, zu Paketen und zu Ihrem Konto. Wählen Sie eines der Themen unten oder formulieren Sie Ihre Frage anders.',
    },
    fr: {
        length: (max) => `La question doit comporter 1 à ${max} caractères.`,
        rate: 'Vous avez envoyé trop de questions ; réessayez dans un instant.',
        hint: 'Je n’ai pas bien compris votre question. Vouliez-vous demander l’une de celles-ci ?',
        offTopic: 'Je ne peux pas vous aider sur ce point ; je réponds uniquement aux questions sur le site **Concepteur d’e-documents**, la conception d’e-documents, les formules et votre compte. Choisissez un sujet ci-dessous ou reformulez votre question.',
    },
    es: {
        length: (max) => `La pregunta debe tener entre 1 y ${max} caracteres.`,
        rate: 'Has enviado preguntas con demasiada frecuencia; vuelve a intentarlo en un momento.',
        hint: 'No he entendido bien tu pregunta. ¿Te refieres a alguna de estas?',
        offTopic: 'No puedo ayudarte con eso; solo respondo preguntas sobre el sitio **Diseñador de e-documentos**, el diseño de e-documentos, los paquetes y tu cuenta. Elige uno de los temas de abajo o reformula tu pregunta.',
    },
};

/* ------------------------------------------------------------------ arama */

const TR = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
export const normalize = (s) => String(s || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşüâîû]/g, (c) => TR[c])
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const STOP = new Set([
    've veya ile bir bu su o da de mi mu ne nasil neden niye icin gibi ben sen biz siz var yok midir ki ya en cok daha',
    'olarak olan olur acaba lutfen bana beni bunu sunu hangi kac nedir nerede nereden zaman yapabilir miyim misiniz istiyorum',
    'the a an is are am do does did how what why when where which who can could i me my you your we our it its to of for in on at with and or be this that there have has will would should please about',
    'der die das den dem des ein eine einen einem ist sind wie was warum wann wo welche wer kann ich mich mein meine sie ihr wir es zu von fur mit und oder bitte auf im an',
    'le la les un une des du est sont comment quoi quel quelle quels pourquoi quand ou qui je me mon ma mes vous votre nous il elle ce cette pour avec et dans sur au aux puis peux pouvez',
    'el los las una unos unas es son como que cual cuales por porque cuando donde quien puedo puede mis tu su para con y en del al se',
].join(' ').split(' '));

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

const SYSTEM_PROMPT = `Sen "Sarp" adında, eBelge Tasarımcı (edxdocu.com) web sitesinin güler yüzlü yardım asistanısın.
Görevin: ziyaretçilere bu sitenin ne işe yaradığını, nasıl kullanıldığını, üyelik, paketler, ödeme, tasarım hakları, şablonlar, tasarım ekranı ve destek konularında yol göstermek.
Kurallar:
- Yalnızca BİLGİ BANKASI'ndaki bilgilere dayan. Fiyat, hak sayısı, düğme adı gibi bilgileri aynen oradan al; uydurma.
- Bilgi bankasında olmayan site sorularında "Bu konuda kesin bilgim yok" de ve destek ekibine yazmayı öner.
- Site ve e-belge tasarımı dışındaki konularda (genel sohbet, kod yazma, vergi/muhasebe danışmanlığı, başka ürünler vb.) kibarca yalnızca bu site hakkında yardımcı olabileceğini söyle ve ilgili bir site konusuna yönlendir.
- Selamlama yapma ve kendini tanıtma ("Merhaba", "Ben Sarp" gibi); doğrudan yanıta geç. Yanıtı "Başka bir konuda yardımcı olabilir miyim?" gibi kalıplarla bitirme.
- Samimi ve kısa yanıt ver (en fazla 120 kelime). Adım gerekiyorsa "- " ile madde kullan. Önemli düğme adlarını **kalın** yaz.
- HTML, başlık, tablo, bağlantı veya URL yazma. Kendinden "yapay zekâ modeli" diye bahsetme.`;

const systemPrompt = (lang, currency) => {
    const rules = [`- Yanıtı yalnızca ${LANG_NAMES[lang]} dilinde yaz; ziyaretçi başka bir dilde yazsa da bu dili kullan. Düğme adlarını bilgi bankasında yazıldığı gibi kullan.`];
    if (lang !== 'tr') {
        rules.push(`- Ziyaretçi sitenin Avrupa sürümünü kullanıyor: Avrupa e-fatura biçimlerini (EN 16931, Peppol BIS 3, XRechnung) anlat; ziyaretçi sormadıkça GİB'den ve Türkiye'ye özgü belge türlerinden bahsetme. Fiyatları bilgi bankasındaki ${currency} tutarlarıyla ver.`);
    }
    return `${SYSTEM_PROMPT}\n${rules.join('\n')}`;
};

/** Bilgi bankası ve talimat her yayında değişebilir; önceki sürümün yapay zekâ yanıtları önbellekten verilmez. */
const CACHE_SINCE = new Date();

let aiCallsDay = '';
let aiCallsCount = 0;
const aiBudgetLeft = () => {
    const day = new Date().toISOString().slice(0, 10);
    if (day !== aiCallsDay) { aiCallsDay = day; aiCallsCount = 0; }
    return aiCallsCount < AI_DAILY_LIMIT;
};

const askAi = async (question, history, context, locale) => {
    aiCallsCount += 1;
    const kb = context.map((e) => `S: ${e.q}\nC: ${e.a}`).join('\n\n');
    const messages = [
        { role: 'system', content: `${systemPrompt(locale.lang, locale.currency)}\n\nBİLGİ BANKASI:\n${kb}` },
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

const SMALL_TALK = {
    tr: [
        { re: /^(merhaba|selam|selamlar|hey|iyi gunler|gunaydin|iyi aksamlar|slm|mrb)\b/, a: 'Merhaba! Ben **Sarp**, eBelge Tasarımcı asistanıyım. Site, paketler, tasarım ekranı veya hesabınızla ilgili ne sormak istersiniz?' },
        { re: /^(tesekkur|tesekkurler|sagol|sag ol|eyvallah|cok sagol|tsk)/, a: 'Rica ederim! Başka bir sorunuz olursa buradayım.' },
        { re: /^(sen kimsin|kimsin|adin ne|bot musun|robot musun)/, a: 'Ben **Sarp**, bu sitenin yardım asistanıyım. Sitenin nasıl kullanıldığı, paketler, tasarım ve destek konularında yol gösteririm.' },
    ],
    en: [
        { re: /^(hi|hello|hey|hiya|good (morning|afternoon|evening))\b/, a: 'Hi! I’m **Sarp**, the e-Document Designer assistant. What would you like to know about the site, packages, the design screen or your account?' },
        { re: /^(thanks|thank you|thx|cheers|many thanks)/, a: 'You’re welcome! I’m here if you have another question.' },
        { re: /^(who are you|what is your name|whats your name|are you a bot|are you a robot)/, a: 'I’m **Sarp**, this site’s help assistant. I can guide you through using the site, packages, designing and support.' },
    ],
    de: [
        { re: /^(hallo|hi|hey|guten (morgen|tag|abend)|servus|moin)\b/, a: 'Hallo! Ich bin **Sarp**, der Assistent des E-Beleg-Designers. Was möchten Sie zur Website, zu Paketen, zum Gestaltungsbildschirm oder zu Ihrem Konto wissen?' },
        { re: /^(danke|vielen dank|dankeschon|merci)/, a: 'Gern geschehen! Bei weiteren Fragen bin ich da.' },
        { re: /^(wer bist du|wie heisst du|bist du ein bot|bist du ein roboter|wer sind sie)/, a: 'Ich bin **Sarp**, der Hilfeassistent dieser Website. Ich helfe bei der Nutzung der Website, bei Paketen, beim Gestalten und beim Support.' },
    ],
    fr: [
        { re: /^(bonjour|salut|bonsoir|coucou|hello)\b/, a: 'Bonjour ! Je suis **Sarp**, l’assistant du Concepteur d’e-documents. Que souhaitez-vous savoir sur le site, les formules, l’écran de conception ou votre compte ?' },
        { re: /^(merci|merci beaucoup)/, a: 'Avec plaisir ! Je reste là si vous avez une autre question.' },
        { re: /^(qui es tu|tu es qui|qui etes vous|comment tu t appelles|es tu un bot|es tu un robot)/, a: 'Je suis **Sarp**, l’assistant d’aide de ce site. Je vous guide sur l’utilisation du site, les formules, la conception et le support.' },
    ],
    es: [
        { re: /^(hola|buenos dias|buenas tardes|buenas noches|buenas|hey)\b/, a: '¡Hola! Soy **Sarp**, el asistente del Diseñador de e-documentos. ¿Qué quieres saber sobre el sitio, los paquetes, la pantalla de diseño o tu cuenta?' },
        { re: /^(gracias|muchas gracias)/, a: '¡De nada! Aquí estoy si tienes otra pregunta.' },
        { re: /^(quien eres|como te llamas|eres un bot|eres un robot)/, a: 'Soy **Sarp**, el asistente de ayuda de este sitio. Te oriento sobre el uso del sitio, los paquetes, el diseño y el soporte.' },
    ],
};

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
    lang: row.lang ?? 'tr',
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
    lang: row.lang ?? 'tr',
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
    /** Yerleşik kayıtlar ve arama dizini dil + para birimine göre ayrı tutulur. */
    const seedCache = new Map();
    const seedsFor = ({ lang, currency }) => {
        if (lang === 'tr') return seeds;
        const key = `${lang}:${currency}`;
        if (!seedCache.has(key)) seedCache.set(key, buildIntlSeedKb(packages, lang, currency));
        return seedCache.get(key);
    };
    const indexes = new Map();

    const loadIndex = async (locale) => {
        const rows = await db.all(`SELECT * FROM assistant_kb WHERE status = 'active' AND lang = ?`, [locale.lang]);
        const learned = rows.map((r) => ({ id: `kb-${r.id}`, dbId: r.id, q: r.question, a: r.answer, keywords: r.keywords || '', actions: r.actions ?? [] }));
        const index = buildIndex([...seedsFor(locale), ...learned]);
        indexes.set(`${locale.lang}:${locale.currency}`, index);
        return index;
    };
    const getIndex = async (locale) => indexes.get(`${locale.lang}:${locale.currency}`) ?? loadIndex(locale);
    const invalidate = () => { indexes.clear(); };

    const bumpHits = (entry) => {
        if (entry?.dbId) db.run('UPDATE assistant_kb SET hits = hits + 1 WHERE id = ?', [entry.dbId]).catch(() => {});
    };

    app.get('/api/assistant/info', (req, res) => {
        res.json({ name: 'Sarp', ai: !!AI_KEY, suggestions: suggestionsFor(parseLocale(req.query.lang).lang) });
    });

    app.post('/api/assistant/ask', async (req, res) => {
        const locale = parseLocale(req.body?.lang, req.body?.currency);
        const text = MESSAGES[locale.lang];
        const defaultSuggestions = suggestionsFor(locale.lang);
        const question = cleanText(req.body?.question, QUESTION_MAX);
        if (!question) return res.status(400).json({ error: text.length(QUESTION_MAX) });
        if (!allow(ipKey(req))) {
            return res.status(429).json({ error: text.rate });
        }
        const history = parseHistory(req.body?.history);
        const session = optionalText(req.body?.session, 64) || null;
        const page = optionalText(req.body?.page, 40) || null;
        const norm = normalize(question);

        let answer = '';
        let mode = 'kb';
        let actions = [];
        let suggestions = [];
        const idx = await getIndex(locale);
        const results = search(idx, question);
        const top = results[0];
        const score = top?.score ?? 0;

        const small = SMALL_TALK[locale.lang].find((s) => s.re.test(norm));
        if (small && norm.split(' ').length <= 4) {
            answer = small.a;
            mode = 'smalltalk';
            suggestions = defaultSuggestions.slice(0, 4);
        } else {
            if (!history.length) {
                const cached = await db.get(
                    `SELECT answer FROM assistant_log
                      WHERE norm = ? AND lang = ? AND currency = ? AND mode IN ('ai', 'cache') AND (helpful IS NULL OR helpful > 0)
                        AND created_at > NOW() - INTERVAL '14 days' AND created_at > ?
                      ORDER BY helpful DESC NULLS LAST, created_at DESC LIMIT 1`,
                    [norm, locale.lang, locale.currency, CACHE_SINCE]
                );
                if (cached) { answer = cached.answer; mode = 'cache'; }
            }
            if (!answer && AI_KEY && aiBudgetLeft()) {
                const context = results.map((r) => r.entry);
                const pinned = seedsFor(locale);
                for (const id of ['s-nedir', 's-fiyat', 's-hak']) {
                    const seed = pinned.find((s) => s.id === id);
                    if (seed && !context.some((e) => e.id === id)) context.push(seed);
                }
                try {
                    answer = await askAi(question, history, context, locale);
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
                    answer = text.hint;
                    mode = 'hint';
                    suggestions = results.slice(0, 3).map((r) => r.entry.q);
                } else {
                    answer = text.offTopic;
                    mode = 'none';
                    suggestions = defaultSuggestions.slice(0, 4);
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
            `INSERT INTO assistant_log (session, question, norm, answer, mode, score, page, kb_ref, lang, currency)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
            [session, question, norm, answer, mode, Number(score.toFixed(3)), page, top?.entry.id ?? null, locale.lang, locale.currency]
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
            const exists = await db.get(`SELECT id FROM assistant_kb WHERE norm = ? AND lang = ?`, [log.norm, log.lang]);
            if (!exists) {
                await db.run(
                    `INSERT INTO assistant_kb (question, answer, keywords, actions, status, source, norm, log_id, lang)
                     VALUES (?, ?, '', '[]'::jsonb, 'pending', 'learned', ?, ?, ?)`,
                    [log.question, log.answer, log.norm, log.id, log.lang]
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
            lang: LANGS.includes(body?.lang) ? body.lang : null,
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
        const lang = value.lang ?? (logId ? (await db.get('SELECT lang FROM assistant_log WHERE id = ?', [logId]))?.lang : null) ?? 'tr';
        const row = await db.get(
            `INSERT INTO assistant_kb (question, answer, keywords, actions, status, source, norm, log_id, lang)
             VALUES (?, ?, ?, ?::jsonb, ?, 'admin', ?, ?, ?) RETURNING *`,
            [value.question, value.answer, value.keywords, JSON.stringify(value.actions), value.status, normalize(value.question), logId, lang]
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
            `UPDATE assistant_kb SET question = ?, answer = ?, keywords = ?, actions = ?::jsonb, status = ?, norm = ?, lang = COALESCE(?, lang), updated_at = NOW()
              WHERE id = ? RETURNING *`,
            [value.question, value.answer, value.keywords, JSON.stringify(value.actions), value.status, normalize(value.question), value.lang, id]
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
