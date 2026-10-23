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

/**
 * Arayüz dili pazarı belirler: Türkçe arayüz GİB + TL, diğerleri Avrupa biçimleri + EUR / GBP.
 * Yanıt dili ise ziyaretçinin soruyu yazdığı dildir; dil anlaşılamazsa arayüz dili kullanılır.
 */
const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'pt', 'ru', 'hi', 'zh'];
/** Yerleşik bilgi bankası olan diller; diğerlerinde yapay zekâ bu bankalardan çevirerek yanıtlar. */
const KB_LANGS = ['tr', ...INTL_LANGS];
const LANG_NAMES = {
    tr: 'Türkçe', en: 'İngilizce (English)', de: 'Almanca (Deutsch)', fr: 'Fransızca (Français)', es: 'İspanyolca (Español)',
    pt: 'Portekizce (Português)', ru: 'Rusça (Русский)', hi: 'Hintçe (हिन्दी)', zh: 'Çince (简体中文)',
};

const parseLocale = (lang, currency) => {
    const ui = LANGS.includes(lang) ? lang : 'tr';
    return { ui, currency: ui === 'tr' ? 'TRY' : currency === 'GBP' ? 'GBP' : 'EUR' };
};

/** Pazarın bilgi bankası dili: Türkçe pazar her zaman Türkçe; Avrupa pazarında yanıt dilinin bankası, yoksa arayüzünki, o da yoksa İngilizce. */
const kbLangFor = (ui, lang) => {
    if (ui === 'tr') return 'tr';
    if (INTL_LANGS.includes(lang)) return lang;
    return INTL_LANGS.includes(ui) ? ui : 'en';
};

const EXTRA_SUGGESTIONS = {
    pt: ['O que este site faz?', 'Quais são os preços?', 'Como crio meu primeiro design?', 'Quando um crédito de design é usado?'],
    ru: ['Для чего этот сайт?', 'Сколько это стоит?', 'Как создать первый дизайн?', 'Когда списывается кредит на дизайн?'],
    hi: ['यह साइट क्या करती है?', 'मूल्य क्या हैं?', 'मैं अपना पहला डिज़ाइन कैसे बनाऊँ?', 'डिज़ाइन क्रेडिट कब उपयोग होता है?'],
    zh: ['这个网站是做什么的？', '价格是多少？', '如何创建我的第一个设计？', '什么时候会使用设计额度？'],
};
const suggestionsFor = (lang) => (lang === 'tr' ? SUGGESTIONS : INTL_SUGGESTIONS[lang] ?? EXTRA_SUGGESTIONS[lang]);

const SCRIPTS = [['ru', /\p{Script=Cyrillic}/gu], ['hi', /\p{Script=Devanagari}/gu], ['zh', /\p{Script=Han}/gu]];
const LATIN_WORDS = {
    tr: 've bir bu ne nasil nedir neden niye nerede hangi kac icin ile var yok mi mu misiniz miyim musunuz yapabilir istiyorum olur fiyat fiyatlar tasarim tasarimi fatura belge uyelik sifre odeme hakki merhaba selam tesekkurler lutfen nasil',
    en: 'the is are what how why when where which who can could do does did you your my it to of for and with this that there price prices cost design invoice account password credit hello thanks please need know',
    de: 'der die das ist sind wie was warum wann wo welche wer kann ich sie mein meine und oder nicht mit fur gibt es preis preise kosten rechnung konto passwort guthaben hallo danke bitte muss',
    fr: 'le la les est sont comment quoi quel quelle quels pourquoi quand je vous mon ma et pas avec pour des du une prix tarifs facture compte mot passe credit bonjour merci dois puis',
    es: 'el los las es son como cual cuales por porque cuando donde quien puedo mi mis tu y con para del una precio precios cuesta factura cuenta contrasena credito hola gracias necesito cuanto cuestan paquete paquetes hago hacer gratis',
    pt: 'os as sao como qual quais por porque quando onde quem posso meu minha voce nao com para do da uma um preco precos custa fatura conta senha credito ola obrigado obrigada preciso quanto custam pacote pacotes faco fazer gratis',
};
const LATIN_SETS = Object.fromEntries(Object.entries(LATIN_WORDS).map(([l, w]) => [l, new Set(w.split(' '))]));
const LATIN_CHARS = { tr: /[ğışİ]/g, de: /[äß]/g, fr: /[èêëàâœù]/g, es: /[ñ¿¡]/g, pt: /[ãõ]/g };

/** Sorunun yazıldığı dili kaba bir sayımla bulur; emin olamazsa arayüz dilini döndürür. */
export const detectLang = (question, fallback) => {
    const raw = String(question || '');
    const letters = (raw.match(/\p{L}/gu) || []).length;
    if (!letters) return fallback;
    for (const [lang, re] of SCRIPTS) {
        if ((raw.match(re) || []).length * 2 >= letters) return lang;
    }
    const lower = raw.toLocaleLowerCase('tr-TR');
    const words = normalize(raw).split(' ');
    const scores = Object.keys(LATIN_SETS).map((lang) => {
        const hits = words.filter((w) => LATIN_SETS[lang].has(w)).length;
        const chars = (lower.match(LATIN_CHARS[lang] || /$^/g) || []).length;
        return { lang, score: hits + Math.min(chars, 3) * 1.5 + (lang === fallback ? 0.5 : 0) };
    }).sort((a, b) => b.score - a.score);
    const [best, second] = scores;
    return best.score >= 1.5 && best.score > second.score ? best.lang : fallback;
};

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
    pt: {
        length: (max) => `A pergunta deve ter de 1 a ${max} caracteres.`,
        rate: 'Você enviou perguntas com muita frequência; tente novamente em instantes.',
        hint: 'Não entendi bem a sua pergunta. Você quis dizer uma destas?',
        offTopic: 'Não posso ajudar com isso; respondo apenas perguntas sobre o site **edXdocu**, o design de e-documentos, os pacotes e a sua conta. Escolha um dos temas abaixo ou reformule a pergunta.',
    },
    ru: {
        length: (max) => `Вопрос должен содержать от 1 до ${max} символов.`,
        rate: 'Вы отправляете вопросы слишком часто; попробуйте ещё раз чуть позже.',
        hint: 'Я не совсем понял ваш вопрос. Вы имели в виду один из этих?',
        offTopic: 'С этим я помочь не могу: я отвечаю только на вопросы о сайте **edXdocu**, дизайне электронных документов, пакетах и вашем аккаунте. Выберите тему ниже или сформулируйте вопрос иначе.',
    },
    hi: {
        length: (max) => `प्रश्न 1 से ${max} अक्षरों का होना चाहिए।`,
        rate: 'आपने बहुत जल्दी-जल्दी प्रश्न भेजे हैं; कृपया थोड़ी देर बाद फिर कोशिश करें।',
        hint: 'मैं आपका प्रश्न पूरी तरह नहीं समझ पाया। क्या आप इनमें से कुछ पूछना चाहते हैं?',
        offTopic: 'मैं इसमें मदद नहीं कर सकता; मैं केवल **edXdocu** साइट, ई-दस्तावेज़ डिज़ाइन, पैकेज और आपके खाते से जुड़े प्रश्नों का उत्तर देता हूँ। नीचे से कोई विषय चुनें या प्रश्न दूसरे शब्दों में लिखें।',
    },
    zh: {
        length: (max) => `问题长度应为 1-${max} 个字符。`,
        rate: '您的提问过于频繁，请稍后再试。',
        hint: '我没有完全理解您的问题。您是想问以下哪一个？',
        offTopic: '这个问题我无法回答；我只回答有关 **edXdocu** 网站、电子单据设计、套餐和您的账户的问题。请选择下面的主题，或换一种说法提问。',
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
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .trim();

const STOP = new Set([
    've veya ile bir bu su o da de mi mu ne nasil neden niye icin gibi ben sen biz siz var yok midir ki ya en cok daha',
    'olarak olan olur acaba lutfen bana beni bunu sunu hangi kac nedir nerede nereden zaman yapabilir miyim misiniz istiyorum',
    'the a an is are am do does did how what why when where which who can could i me my you your we our it its to of for in on at with and or be this that there have has will would should please about',
    'der die das den dem des ein eine einen einem ist sind wie was warum wann wo welche wer kann ich mich mein meine sie ihr wir es zu von fur mit und oder bitte auf im an',
    'le la les un une des du est sont comment quoi quel quelle quels pourquoi quand ou qui je me mon ma mes vous votre nous il elle ce cette pour avec et dans sur au aux puis peux pouvez',
    'el los las una unos unas es son como que cual cuales por porque cuando donde quien puedo puede mis tu su para con y en del al se',
    'os as um uma uns umas sao qual quais quando onde quem posso pode meu minha meus minhas voce nao com do da dos das no na nos nas ao',
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
- Önce ziyaretçinin tam olarak ne sorduğunu anla: yazım hatası, eksik sözcük, karışık dil veya önceki mesajlara gönderme olabilir. Yalnızca sorulan şeyi yanıtla; bilgi bankasındaki ilgisiz bilgileri ekleme.
- Yalnızca BİLGİ BANKASI'ndaki bilgilere dayan. Fiyat, hak sayısı, düğme adı gibi bilgileri aynen oradan al; uydurma.
- Bilgi bankasında olmayan site sorularında "Bu konuda kesin bilgim yok" de ve destek ekibine yazmayı öner.
- Selim Yılmaz, kurucu, şirket sahibi ya da destek ekibinin kim olduğu sorulursa kişi tanıtma, telefon veya e-posta yazma. Yalnızca sayfanın altındaki İletişim sayfasını incelemelerini söyle.
- Site ve e-belge tasarımı dışındaki konularda (genel sohbet, kod yazma, vergi/muhasebe danışmanlığı, başka ürünler vb.) kibarca yalnızca bu site hakkında yardımcı olabileceğini söyle ve ilgili bir site konusuna yönlendir.
- Selamlama yapma ve kendini tanıtma ("Merhaba", "Ben Sarp" gibi); doğrudan yanıta geç. Yanıtı "Başka bir konuda yardımcı olabilir miyim?" gibi kalıplarla bitirme.
- Samimi ve kısa yanıt ver (en fazla 120 kelime). Adım gerekiyorsa "- " ile madde kullan. Önemli düğme adlarını **kalın** yaz.
- HTML, başlık, tablo, bağlantı veya URL yazma. Kendinden "yapay zekâ modeli" diye bahsetme.`;

const systemPrompt = ({ ui, lang, kbLang, currency }) => {
    const rules = [
        `- Ziyaretçi son sorusunu ${LANG_NAMES[lang]} dilinde yazdı: yanıtın tamamını bu dilde yaz. Önceki mesajlar başka dilde olsa da son sorunun dili geçerlidir.`,
    ];
    if (kbLang !== lang) rules.push(`- Bilgi bankası ${LANG_NAMES[kbLang]} dilinde; bilgileri anlamını koruyarak ${LANG_NAMES[lang]} diline çevir, tutarları ve sayıları değiştirme.`);
    rules.push(ui === kbLang
        ? `- Ekrandaki arayüz ${LANG_NAMES[ui]} dilinde: düğme ve menü adlarını **kalın** ve bilgi bankasında yazıldığı gibi bırak${ui !== lang ? `; ilk geçtiği yerde parantez içinde ${LANG_NAMES[lang]} karşılığını ver` : ''}.`
        : `- Ekrandaki arayüz ${LANG_NAMES[ui]} dilinde: düğme ve menü adlarını o dile çevirerek **kalın** yaz.`);
    if (ui !== 'tr') {
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
        { role: 'system', content: `${systemPrompt(locale)}\n\nBİLGİ BANKASI:\n${kb}` },
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
    pt: [
        { re: /^(ola|oi|bom dia|boa tarde|boa noite)\b/, a: 'Olá! Sou o **Sarp**, o assistente do edXdocu. O que você quer saber sobre o site, os pacotes, a tela de design ou a sua conta?' },
        { re: /^(obrigad[oa]|muito obrigad[oa]|valeu)/, a: 'De nada! Estou aqui se tiver outra pergunta.' },
        { re: /^(quem e voce|quem es tu|como voce se chama|qual e o seu nome|voce e um bot|voce e um robo)/, a: 'Sou o **Sarp**, o assistente de ajuda deste site. Oriento sobre o uso do site, os pacotes, o design e o suporte.' },
    ],
    ru: [
        { re: /^(привет|здравствуите|добрыи (день|вечер)|доброе утро)(\s|$)/, a: 'Здравствуйте! Я **Sarp**, ассистент edXdocu. Что вы хотите узнать о сайте, пакетах, экране дизайна или вашем аккаунте?' },
        { re: /^(спасибо|благодарю)/, a: 'Пожалуйста! Если появятся вопросы, я здесь.' },
        { re: /^(кто ты|кто вы|как тебя зовут|ты бот|вы бот|ты робот)/, a: 'Я **Sarp**, ассистент этого сайта. Помогаю с использованием сайта, пакетами, дизайном и поддержкой.' },
    ],
    hi: [
        { re: /^(नमस्ते|नमस्कार|हैलो|हेलो)(\s|$)/, a: 'नमस्ते! मैं **Sarp** हूँ, edXdocu का सहायक। साइट, पैकेज, डिज़ाइन स्क्रीन या आपके खाते के बारे में आप क्या जानना चाहते हैं?' },
        { re: /^(धन्यवाद|शुक्रिया)/, a: 'आपका स्वागत है! कोई और प्रश्न हो तो मैं यहीं हूँ।' },
        { re: /^(तुम कौन हो|आप कौन हैं|क्या आप बॉट हैं)/, a: 'मैं **Sarp** हूँ, इस साइट का सहायक। साइट के उपयोग, पैकेज, डिज़ाइन और सहायता में मार्गदर्शन करता हूँ।' },
    ],
    zh: [
        { re: /^(你好|您好|嗨|哈喽)$/, a: '您好！我是 edXdocu 的助手 **Sarp**。关于网站、套餐、设计界面或您的账户，您想了解什么？' },
        { re: /^(谢谢|多谢|谢谢你|谢谢您)$/, a: '不客气！如有其他问题，随时问我。' },
        { re: /^(你是谁|您是谁|你叫什么名字|你是机器人吗)$/, a: '我是 **Sarp**，本网站的帮助助手，可以为您介绍网站的使用、套餐、设计和支持。' },
    ],
};

/** Önce yanıt dilindeki, sonra diğer dillerdeki kalıplara bakar; eşleşen dilde yanıt verir. */
const findSmallTalk = (norm, lang) => {
    for (const l of [lang, ...LANGS.filter((x) => x !== lang)]) {
        const hit = SMALL_TALK[l]?.find((s) => s.re.test(norm));
        if (hit) return { lang: l, answer: hit.a };
    }
    return null;
};

/** Kişi ve ekip sorularında iletişim bilgisi yazılmaz; ziyaretçi İletişim sayfasına bakmalıdır. */
const CONTACT_PAGE_ANSWER = {
    tr: 'Bu konuda sayfanın altındaki **İletişim** sayfasını inceleyin.',
    en: 'For this, please review the **Contact** page at the bottom of the site.',
    de: 'Bitte sehen Sie sich dazu die Seite **Kontakt** unten auf der Website an.',
    fr: 'Pour cela, consultez la page **Contact** en bas du site.',
    es: 'Para esto, revise la página **Contacto** al pie del sitio.',
    pt: 'Para isso, consulte a página **Contato** no rodapé do site.',
    ru: 'По этому вопросу посмотрите страницу **Контакты** внизу сайта.',
    hi: 'इसके लिए साइट के नीचे **संपर्क** पृष्ठ देखें।',
    zh: '关于这个问题，请查看网站底部的**联系**页面。',
};

const asksForContactPage = (norm) => /\bselim\b|\byilmaz\b|destek ekib|support team|kurucun|sirket sahibi|site sahibi/.test(norm);

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
    const seedsFor = (lang, currency) => {
        if (lang === 'tr') return seeds;
        if (!INTL_LANGS.includes(lang)) return [];
        const key = `${lang}:${currency}`;
        if (!seedCache.has(key)) seedCache.set(key, buildIntlSeedKb(packages, lang, currency));
        return seedCache.get(key);
    };
    const indexes = new Map();

    const loadIndex = async (lang, currency) => {
        const rows = await db.all(`SELECT * FROM assistant_kb WHERE status = 'active' AND lang = ?`, [lang]);
        const learned = rows.map((r) => ({ id: `kb-${r.id}`, dbId: r.id, q: r.question, a: r.answer, keywords: r.keywords || '', actions: r.actions ?? [] }));
        const index = buildIndex([...seedsFor(lang, currency), ...learned]);
        indexes.set(`${lang}:${currency}`, index);
        return index;
    };
    const getIndex = async (lang, currency) => indexes.get(`${lang}:${currency}`) ?? loadIndex(lang, currency);
    const invalidate = () => { indexes.clear(); };

    /**
     * Soru, pazarın bilgi bankasından farklı bir dilde yazıldıysa kendi dilindeki kayıtlarla da aranır;
     * yerleşik kayıtların kimlikleri tüm dillerde aynı olduğundan bulunanlar pazarın kaydına çevrilir.
     */
    const searchAll = async (question, { lang, kbLang, currency }) => {
        const own = search(await getIndex(kbLang, currency), question);
        if (lang === kbLang) return own;
        const market = seedsFor(kbLang, currency);
        const cross = search(await getIndex(lang, lang === 'tr' ? 'TRY' : 'EUR'), question)
            .map((r) => ({ ...r, label: r.entry.q, entry: market.find((s) => s.id === r.entry.id) ?? (r.entry.dbId ? r.entry : null) }))
            .filter((r) => r.entry);
        const best = new Map();
        for (const r of [...own, ...cross]) {
            if (!best.has(r.entry.id) || best.get(r.entry.id).score < r.score) best.set(r.entry.id, r);
        }
        return [...best.values()].sort((a, b) => b.score - a.score).slice(0, 6);
    };

    const bumpHits = (entry) => {
        if (entry?.dbId) db.run('UPDATE assistant_kb SET hits = hits + 1 WHERE id = ?', [entry.dbId]).catch(() => {});
    };

    app.get('/api/assistant/info', (req, res) => {
        res.json({ name: 'Sarp', ai: !!AI_KEY, suggestions: suggestionsFor(parseLocale(req.query.lang).ui) });
    });

    app.post('/api/assistant/ask', async (req, res) => {
        const { ui, currency } = parseLocale(req.body?.lang, req.body?.currency);
        const question = cleanText(req.body?.question, QUESTION_MAX);
        if (!question) return res.status(400).json({ error: MESSAGES[ui].length(QUESTION_MAX) });
        if (!allow(ipKey(req))) {
            return res.status(429).json({ error: MESSAGES[ui].rate });
        }
        const history = parseHistory(req.body?.history);
        const session = optionalText(req.body?.session, 64) || null;
        const page = optionalText(req.body?.page, 40) || null;
        const norm = normalize(question);

        const small = norm.split(' ').length <= 4 ? findSmallTalk(norm, detectLang(question, ui)) : null;
        const lang = small?.lang ?? detectLang(question, ui);
        const contactPage = asksForContactPage(norm) ? (CONTACT_PAGE_ANSWER[lang] ?? CONTACT_PAGE_ANSWER.tr) : '';
        const kbLang = kbLangFor(ui, lang);
        const locale = { ui, lang, kbLang, currency };
        const text = MESSAGES[lang];
        const defaultSuggestions = suggestionsFor(lang);

        let answer = '';
        let mode = 'kb';
        let actions = [];
        let suggestions = [];
        const results = await searchAll(question, locale);
        const top = results[0];
        const score = top?.score ?? 0;

        if (small) {
            answer = small.answer;
            mode = 'smalltalk';
            suggestions = defaultSuggestions.slice(0, 4);
        } else if (contactPage) {
            answer = contactPage;
            mode = 'kb';
        } else {
            if (!history.length && norm) {
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
                const market = seedsFor(kbLang, currency);
                /** Arama zayıfsa (ör. bilgi bankası olmayan bir dilde soru) soruyu yapay zekâ anlasın diye bankanın tamamı verilir. */
                const pinned = score < KB_DIRECT ? market : market.filter((s) => ['s-nedir', 's-fiyat', 's-hak'].includes(s.id));
                for (const seed of pinned) {
                    if (!context.some((e) => e.id === seed.id)) context.push(seed);
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
                    suggestions = results.slice(0, 3).map((r) => r.label ?? r.entry.q);
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
                suggestions = results.slice(1, 3).filter((r) => r.score >= 0.3).map((r) => r.label ?? r.entry.q);
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
