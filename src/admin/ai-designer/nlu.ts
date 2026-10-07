/**
 * Kural tabanlı Türkçe anahtar kelime çözümleyici (dış yapay zeka yok).
 * "lacivert ve sade olsun, logo sağda, banka altta, iskonto olmasın" gibi serbest metni
 * DesignParams yamasına çevirir. Yönetici düzeltmelerinden öğrenilen kelime bağları
 * (LearnedRule) kurallarla çakışmayan anahtarlarda uygulanır.
 */
import { RECEIPT_PAPER_DOCS, sectionDef, sectionsFor, textFieldsFor } from './questions';
import type { DesignParams, ParamPatch, TextKey } from './types';
import { fold, isHex, tokenize } from './utils';
import {
    BANK_POSITIONS, COLOR_MODES, FONT_SCALES, FONTS, LOGO_POSITIONS, LOGO_SIZES, NAMED_COLORS, PAPERS, QR_POSITIONS, STYLES, TEXT_FIELDS,
    colorName, labelOf,
} from './vocab';

export type MatchSource = 'kural' | 'ogrenilen' | 'uyari';
export interface NluMatch { phrase: string; effect: string; source: MatchSource }
export interface NluResult { patch: ParamPatch; matches: NluMatch[] }

/** Öğrenilmiş bağ: tokens metinde birlikte geçtiğinde key=value uygulanır. */
export interface LearnedRule { tokens: string[]; key: string; value: string | boolean; weight: number; count: number }

/** Parametre anahtarları: 'style', 'accent', … ya da 'sections.<id>'. */
export const PARAM_KEYS = ['style', 'accent', 'colorMode', 'font', 'fontScale', 'logoPosition', 'logoSize', 'qrPosition', 'bankPosition', 'paper'] as const;
export type ParamKey = typeof PARAM_KEYS[number];

const KEY_LISTS: Record<Exclude<ParamKey, 'accent'>, { id: string; label: string }[]> = {
    style: STYLES, colorMode: COLOR_MODES, font: FONTS, fontScale: FONT_SCALES, logoPosition: LOGO_POSITIONS,
    logoSize: LOGO_SIZES, qrPosition: QR_POSITIONS, bankPosition: BANK_POSITIONS, paper: PAPERS,
};
const KEY_TITLES: Record<ParamKey, string> = {
    style: 'Stil', accent: 'Ana renk', colorMode: 'Renk kullanımı', font: 'Yazı tipi', fontScale: 'Yazı boyutu', logoPosition: 'Logo konumu',
    logoSize: 'Logo boyutu', qrPosition: 'Karekod', bankPosition: 'Banka bilgileri', paper: 'Kağıt',
};

/** "Stil: Modern", "Bölüm açık: İskonto sütunu" gibi Türkçe açıklama. */
export function effectLabel(key: string, value: string | boolean): string {
    if (key.startsWith('sections.')) {
        const def = sectionDef(key.slice(9));
        return `${def?.label ?? key.slice(9)} ${value ? 'eklensin' : 'çıkarılsın'}`;
    }
    if (key === 'accent') return `Ana renk: ${colorName(String(value)) ?? String(value)}`;
    const list = KEY_LISTS[key as Exclude<ParamKey, 'accent'>];
    return list ? `${KEY_TITLES[key as ParamKey]}: ${labelOf(list, String(value))}` : `${key}: ${String(value)}`;
}

/** Anahtar/değer geçerliyse yamaya yazar. */
export function setKey(patch: ParamPatch, key: string, value: string | boolean, docTypeId: string): boolean {
    if (key.startsWith('sections.')) {
        const id = key.slice(9);
        if (typeof value !== 'boolean' || !sectionDef(id)?.docTypes.includes(docTypeId)) return false;
        patch.sections = { ...patch.sections, [id]: value };
        return true;
    }
    if (key === 'accent') {
        if (!isHex(value)) return false;
        patch.accent = value.toLowerCase();
        return true;
    }
    const list = KEY_LISTS[key as Exclude<ParamKey, 'accent'>];
    if (!list || typeof value !== 'string' || !list.some(x => x.id === value)) return false;
    if (key === 'paper' && value === 'fis80' && !RECEIPT_PAPER_DOCS.includes(docTypeId)) return false;
    (patch as Record<string, unknown>)[key] = value;
    return true;
}

/** Yamayı parametrelere uygular; boş metin ('') o metni kaldırır. */
export function applyPatch(p: DesignParams, patch: ParamPatch): DesignParams {
    const { sections, texts, ...rest } = patch;
    const next: DesignParams = { ...p, ...rest, sections: { ...p.sections, ...sections }, texts: { ...p.texts } };
    for (const [k, v] of Object.entries(texts ?? {}) as [TextKey, string | undefined][]) {
        if (v && v.trim()) next.texts[k] = v.trim();
        else delete next.texts[k];
    }
    return next;
}

// ---------------------------------------------------------------------------
// Sözlük
// ---------------------------------------------------------------------------
const NEGATION = /\b(olmasin|olmayacak|olmasa|istemiyorum|istemiyoruz|istemem|yok|kaldir\w*|cikar\w*|gizle\w*|gereksiz|haric|olmadan|eklenmesin|eklemeyin|gosterme\w*|almasin|koyma\w*|kullanma\w*|degil)\b|gerek yok/;

const STYLE_WORDS: Record<string, string[]> = {
    klasik: ['klasik', 'geleneksel', 'nostaljik', 'eski usul', 'cerceveli', 'cizgili tablo'],
    modern: ['modern', 'cagdas', 'yenilikci', 'trend', 'dinamik', 'genc'],
    kurumsal: ['kurumsal', 'profesyonel', 'ciddi', 'resmi', 'holding', 'prestijli'],
    minimal: ['minimal', 'minimalist', 'yalin', 'ferah', 'beyaz alan', 'sadelik'],
    kompakt: ['kompakt', 'sikisik', 'tek sayfa', 'cok kalem', 'yogun', 'sik satir'],
};
const COLOR_MODE_WORDS: Record<string, string[]> = {
    canli: ['canli', 'renkli', 'parlak', 'dikkat cekici', 'rengarenk', 'neseli', 'cosku'],
    sade: ['sade', 'yazici dostu', 'siyah beyaz', 'renksiz', 'az renk', 'murekkep', 'toner'],
    dengeli: ['dengeli', 'pastel', 'yumusak', 'orta karar'],
};
const FONT_WORDS: Record<string, string[]> = {
    segoe: ['segoe'], arial: ['arial', 'helvetica', 'tirnaksiz'], calibri: ['calibri'], trebuchet: ['trebuchet'],
    tahoma: ['tahoma', 'verdana'], georgia: ['georgia', 'times', 'tirnakli', 'serif'],
};
const SIDE = {
    sag: ['sag', 'sagda', 'saga', 'sagdan', 'sagust'],
    sol: ['sol', 'solda', 'sola', 'soldan', 'solust'],
    orta: ['ortada', 'ortaya', 'ortali', 'ortalanmis', 'merkez', 'merkezde', 'ortalansin'],
    ust: ['ust', 'ustte', 'uste', 'yukari', 'yukarida', 'tepede', 'basta'],
    alt: ['alt', 'altta', 'alta', 'asagi', 'asagida', 'sonda', 'dipte', 'altinda'],
    yan: ['yan', 'yaninda', 'yanda', 'yanina', 'toplamlarin', 'toplamin'],
};
const SIZE = {
    kucuk: ['kucuk', 'ufak', 'minik', 'kucultulmus'],
    buyuk: ['buyuk', 'iri', 'kocaman', 'genis', 'buyutulmus', 'okunakli'],
    orta: ['normal', 'standart'],
};
const TEXT_KEY_WORDS: [TextKey, string[]][] = [
    ['slogan', ['slogan']],
    ['thanks', ['tesekkur']],
    ['returnPolicy', ['iade', 'garanti', 'degisim']],
    ['contact', ['kep', 'web', 'site', 'instagram', 'sosyal medya', 'iletisim', 'e-posta', 'eposta', 'telefon']],
    ['legal', ['yasal', 'uyari', 'gecikme', 'faiz']],
    ['headerNote', ['baslik notu', 'ust not', 'ust bilgi', 'baslikta']],
    ['footer', ['alt bilgi', 'altbilgi', 'footer', 'alt not', 'sayfa alti', 'en alt']],
];
const DEFAULT_TEXTS: Partial<Record<TextKey, string>> = {
    thanks: 'Bizi tercih ettiğiniz için teşekkür ederiz.',
    returnPolicy: 'Ürünler, faturası ile birlikte 14 gün içinde iade edilebilir.',
    legal: 'Vadesinde ödenmeyen tutarlara yasal gecikme faizi uygulanır.',
};

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Kelime başı eşleşmesi; kısa kelimelerde yalnızca bilinen Türkçe ekler kabul edilir. */
const wordRe = (phrase: string, strict: boolean) => {
    const body = phrase.split(/\s+/).map(escRe).join('\\s+');
    const suffix = strict ? '(i|si|u|su|li|lu|imsi|tonu|tonlu|tonunda|ya|ye)?'
        : phrase.length >= 5 ? '([a-z]*)' : '(u|i|lu|li|lar|ler|lari|leri|su|si|suz|siz|ya|ye|da|de|ta|te|in|un)?';
    return new RegExp(`(?:^|[^a-z0-9])${body}${suffix}(?![a-z0-9])`);
};
const reCache = new Map<string, RegExp>();
const has = (text: string, phrase: string, strict = false) => {
    const key = (strict ? '!' : '') + phrase;
    let re = reCache.get(key);
    if (!re) reCache.set(key, (re = wordRe(phrase, strict)));
    return re.exec(text);
};
const firstOf = <K extends string>(text: string, table: Record<K, string[]>): { id: K; phrase: string; index: number } | null => {
    let best: { id: K; phrase: string; index: number } | null = null;
    for (const [id, words] of Object.entries(table) as [K, string[]][]) {
        for (const w of words) {
            const m = has(text, w);
            if (m && (!best || m.index < best.index)) best = { id, phrase: w, index: m.index };
        }
    }
    return best;
};

/** Hedef kelimeye en yakın konum kelimesi (token mesafesi). */
function nearest<K extends string>(tokens: string[], target: (t: string) => boolean, table: Partial<Record<K, string[]>>): K | null {
    const anchors = tokens.map((t, i) => (target(t) ? i : -1)).filter(i => i >= 0);
    if (!anchors.length) return null;
    let best: { id: K; d: number } | null = null;
    tokens.forEach((t, i) => {
        for (const [id, words] of Object.entries(table) as [K, string[]][]) {
            if (!words.includes(t)) continue;
            const d = Math.min(...anchors.map(a => Math.abs(a - i) + (i < a ? 0.5 : 0)));
            if (!best || d < best.d) best = { id, d };
        }
    });
    return best ? (best as { id: K; d: number }).id : null;
}

// ---------------------------------------------------------------------------
// Çözümleyici
// ---------------------------------------------------------------------------
const QUOTE_RE = /["“”«»]([^"“”«»]{1,300})["“”«»]/g;

export function parseText(text: string, docTypeId: string, learned: LearnedRule[] = []): NluResult {
    const patch: ParamPatch = {};
    const matches: NluMatch[] = [];
    const setKeys = new Set<string>();
    const put = (key: string, value: string | boolean, phrase: string, source: MatchSource = 'kural') => {
        if (setKeys.has(key)) return;
        if (!setKey(patch, key, value, docTypeId)) return;
        setKeys.add(key);
        matches.push({ phrase, effect: effectLabel(key, value), source });
    };
    const textOk = (k: TextKey) => textFieldsFor(docTypeId).some(f => f.id === k);
    const putText = (k: TextKey, value: string, phrase: string) => {
        if (!textOk(k) || patch.texts?.[k] !== undefined) return;
        patch.texts = { ...patch.texts, [k]: value };
        const label = TEXT_FIELDS.find(f => f.id === k)?.label ?? k;
        matches.push({ phrase, effect: value ? `${label}: “${value.length > 40 ? value.slice(0, 40) + '…' : value}”` : `${label} kaldırılsın`, source: 'kural' });
    };

    const quotes: string[] = [];
    const masked = text.replace(QUOTE_RE, (_, q: string) => `__q${quotes.push(q.trim()) - 1}__`);
    const clauses = masked.split(/[.;!?\n]+|,|\b(?:ama|fakat|ancak|ayrica)\b/i).map(s => s.trim()).filter(Boolean);
    const docSections = sectionsFor(docTypeId);

    for (const clause of clauses) {
        const f = fold(clause);
        const tokens = f.split(/[^a-z0-9#_]+/).filter(Boolean);
        const neg = NEGATION.test(f);
        const quoteIds = [...clause.matchAll(/__q(\d+)__/g)].map(m => Number(m[1]));
        const plain = f.replace(/__q\d+__/g, ' ');

        // Özel metinler (tırnak içi)
        if (quoteIds.length) {
            const key = TEXT_KEY_WORDS.find(([, words]) => words.some(w => has(plain, w)))?.[0];
            for (const qi of quoteIds) {
                const q = quotes[qi];
                const k: TextKey = key ?? (fold(q).includes('tesekkur') ? 'thanks' : 'footer');
                putText(k, q, `“${q.length > 24 ? q.slice(0, 24) + '…' : q}”`);
            }
        } else {
            for (const [k, words] of TEXT_KEY_WORDS) {
                const hit = words.find(w => has(plain, w));
                if (!hit) continue;
                const isMessage = /\b(mesaj\w*|not\w*|metn\w*|yazi\w*|bilgi\w*|kosul\w*|cumle\w*|ifade\w*)\b/.test(plain) || k === 'slogan';
                if (neg && isMessage) putText(k, '', hit);
                else if (isMessage && DEFAULT_TEXTS[k]) putText(k, DEFAULT_TEXTS[k], hit);
            }
        }

        // Stil ve renk kullanımı
        const style = firstOf(plain, STYLE_WORDS);
        if (style && !neg) put('style', style.id, style.phrase);
        const mode = firstOf(plain, COLOR_MODE_WORDS);
        if (mode && !neg) put('colorMode', mode.id, mode.phrase);

        // Renkler (uzun ifade önce: "koyu mavi" → lacivert, "mavi" değil)
        if (!neg) {
            const hex = /#([0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-z])/.exec(plain);
            if (hex) {
                const h = hex[1].length === 3 ? hex[1].split('').map(c => c + c).join('') : hex[1];
                put('accent', `#${h}`, hex[0]);
            }
            let rest = plain;
            const found: { hex: string; word: string; index: number }[] = [];
            for (const c of [...NAMED_COLORS].flatMap(c => c.words.map(w => ({ hex: c.hex, w }))).sort((a, b) => b.w.length - a.w.length)) {
                const m = has(rest, c.w, true);
                if (!m) continue;
                found.push({ hex: c.hex, word: c.w, index: m.index });
                rest = rest.slice(0, m.index) + ' '.repeat(m[0].length) + rest.slice(m.index + m[0].length);
            }
            const logoColor = /\blogo\w*\s+(rengi|renginde|renkleri)\b/.test(plain);
            if (found.length && !logoColor) {
                const first = found.sort((a, b) => a.index - b.index)[0];
                put('accent', first.hex, first.word);
            }
        }

        // Yazı tipi ve boyutu
        const font = firstOf(plain, FONT_WORDS);
        if (font && !neg) put('font', font.id, font.phrase);
        const isText = (t: string) => /^(yazi|yazilar|yazilari|font|fontlar|punto|harf|harfler|karakter)$/.test(t);
        if (tokens.some(isText) && !neg) {
            const s = nearest(tokens, isText, SIZE);
            if (s) put('fontScale', s === 'orta' ? 'normal' : s, `yazı ${s}`);
        }

        // Logo
        const isLogo = (t: string) => t.startsWith('logo');
        if (tokens.some(isLogo)) {
            if (tokens.some(t => /^logo(suz|yu kaldir)/.test(t)) || (neg && !tokens.some(t => Object.values(SIDE).flat().includes(t)))) {
                if (!setKeys.has('logo')) {
                    patch.logo = null;
                    setKeys.add('logo');
                    matches.push({ phrase: 'logo', effect: 'Logo kullanılmasın', source: 'kural' });
                }
            } else {
                const pos = nearest(tokens, isLogo, { sag: SIDE.sag, sol: SIDE.sol, orta: SIDE.orta });
                if (pos) put('logoPosition', pos, `logo ${pos}`);
                const size = nearest(tokens, isLogo, { kucuk: SIZE.kucuk, buyuk: SIZE.buyuk });
                if (size) put('logoSize', size, `logo ${size}`);
                if (/\borta boy\w*/.test(plain)) put('logoSize', 'orta', 'orta boy');
            }
        }

        // Karekod
        const isQr = (t: string) => t.startsWith('karekod') || t === 'qr' || t.startsWith('qrkod');
        if (tokens.some(isQr)) {
            if (neg) matches.push({ phrase: 'karekod', effect: 'Karekod GİB standardı gereği kaldırılamaz', source: 'uyari' });
            else {
                const side = nearest(tokens, isQr, { sag: SIDE.sag, sol: SIDE.sol, alt: SIDE.alt });
                if (side) put('qrPosition', side === 'sag' ? 'sag-ust' : side === 'sol' ? 'sol-ust' : 'alt', `karekod ${side}`);
            }
        }

        // Banka
        const isBank = (t: string) => t.startsWith('banka') || t.startsWith('iban') || /^hesap(lar|bilgi)?/.test(t);
        if (tokens.some(isBank)) {
            if (neg) {
                if (!setKeys.has('banks')) {
                    patch.banks = [];
                    setKeys.add('banks');
                    matches.push({ phrase: 'banka', effect: 'Banka bilgileri gösterilmesin', source: 'kural' });
                }
            } else {
                const side = nearest(tokens, isBank, { alt: SIDE.alt, yan: SIDE.yan });
                if (side) put('bankPosition', side, `banka ${side}`);
            }
        }

        // Kağıt
        if (!neg && /\b(fis|fisi|termal|80\s?mm|rulo|yazar kasa|pos)\b/.test(plain)) put('paper', 'fis80', 'fiş');
        else if (/\ba4\b/.test(plain)) put('paper', 'a4', 'A4');

        // Bölümler
        for (const s of docSections) {
            for (const kw of s.keywords) {
                const m = has(plain, kw);
                if (!m) continue;
                const negSuffix = /^s[iu]z$/.test(m[1] ?? '') || /^(suz|siz)/.test(m[1] ?? '');
                put(`sections.${s.id}`, !(neg || negSuffix), kw);
                break;
            }
        }
    }

    // Öğrenilmiş bağlar (kuralların belirlemediği anahtarlarda)
    if (learned.length) {
        const words = new Set(tokenize(text));
        const best = new Map<string, LearnedRule>();
        for (const r of learned) {
            if (!r.tokens.length || !r.tokens.every(t => words.has(t))) continue;
            const cur = best.get(r.key);
            if (!cur || r.weight > cur.weight) best.set(r.key, r);
        }
        for (const r of best.values()) put(r.key, r.value, r.tokens.join(' '), 'ogrenilen');
    }
    return { patch, matches };
}

/** Değişen anahtarlar (öğrenme için): 'style' → 'kurumsal', 'sections.iskonto' → false … */
export function diffParams(before: DesignParams, after: DesignParams): Record<string, string | boolean> {
    const out: Record<string, string | boolean> = {};
    for (const k of PARAM_KEYS) if (before[k] !== after[k]) out[k] = after[k];
    for (const id of new Set([...Object.keys(before.sections), ...Object.keys(after.sections)])) {
        if (Boolean(before.sections[id]) !== Boolean(after.sections[id])) out[`sections.${id}`] = Boolean(after.sections[id]);
    }
    return out;
}
