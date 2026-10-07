/**
 * Hafızadan öğrenme (yerel, istatistiksel).
 *
 * Her hafıza kaydı bir "oy"dur: beğeni +1, beğenmeme −1, galeride yayın +2 (güçlü olumlu).
 * Oylar yaşa göre yarılanır (90 gün) ve kapsam ağırlığıyla çarpılır:
 * (belge, sektör) 1 · (belge, kategori) 0,6 · (sektör) 0,35 · (belge) 0,3 · genel 0,15.
 * Her parametre değeri için puanlar toplanır; önsel (prior) yumuşatma ile ikinci seçenekten
 * yeterince önde olan değer önerilir. Yönetici düzeltmeleri (params.learnedFrom) kelime → parametre
 * bağlarına dönüşür ve NLU'da kullanılır.
 */
import type { AiMemoryEntry } from '../contracts';
import { CATEGORIES, SECTORS } from '../../sector-templates/types';
import { WIZARD_DOC_TYPES } from '../../wizard/docTypes';
import { PARAM_KEYS, effectLabel, setKey, type LearnedRule } from './nlu';
import { sectionDef, sectionsFor, textFieldsFor } from './questions';
import type { DesignParams, LearnedFrom, ParamPatch, TextKey } from './types';
import { colorDistance, isHex } from './utils';
import { STYLES, TEXT_FIELDS, colorName, labelOf } from './vocab';

const HALF_LIFE_DAYS = 90;
const SCOPE = { docSector: 1, docCategory: 0.6, sector: 0.35, doc: 0.3, global: 0.15 };
const PRIOR = 0.6;
const MIN_SCORE = 0.9;

/** Hafızaya yazılan parametreler: logo ve IBAN gibi firma verisi yerine yalnızca özet tutulur. */
export interface MemoryParams extends Omit<DesignParams, 'logo' | 'banks' | 'companyName'> {
    hasLogo: boolean;
    bankCount: number;
    learnedFrom?: LearnedFrom;
}

export function toMemoryParams(p: DesignParams, learnedFrom?: LearnedFrom): MemoryParams {
    const { logo, banks, companyName, ...rest } = p;
    void companyName;
    return { ...rest, hasLogo: Boolean(logo), bankCount: banks.length, ...(learnedFrom && Object.keys(learnedFrom.changes).length ? { learnedFrom } : {}) };
}

const ageDays = (iso: string, now: number) => {
    const t = Date.parse(iso);
    return Number.isFinite(t) ? Math.max(0, (now - t) / 86_400_000) : 0;
};

/** Kaydın oy ağırlığı (işaretli). */
export function entryWeight(e: Pick<AiMemoryEntry, 'rating' | 'published' | 'created_at'>, now = Date.now()): number {
    const base = (e.rating ?? 0) + (e.published ? 2 : 0);
    return base * Math.pow(0.5, ageDays(e.created_at, now) / HALF_LIFE_DAYS);
}

const scopeOf = (e: AiMemoryEntry, doc: string, category: string, sector: string): number => {
    const sameDoc = e.doc_type_id === doc;
    const sameSector = Boolean(sector) && e.sector === sector;
    const sameCat = Boolean(category) && e.category === category;
    if (sameDoc && sameSector) return SCOPE.docSector;
    if (sameDoc && sameCat) return SCOPE.docCategory;
    if (sameSector) return SCOPE.sector;
    if (sameDoc) return SCOPE.doc;
    return SCOPE.global;
};

const paramsOf = (e: AiMemoryEntry): Partial<MemoryParams> => (e.params ?? {}) as Partial<MemoryParams>;

export interface Suggestion {
    key: string;
    value: string | boolean;
    /** "Stil: Modern" */
    label: string;
    score: number;
    /** Olumlu oy veren kayıt sayısı. */
    votes: number;
}

export interface LearnedDefaults {
    patch: ParamPatch;
    suggestions: Suggestion[];
    /** Sektörde beğenilen tasarımlarda kullanılan özel metinler (öneri çipleri). */
    texts: Partial<Record<TextKey, string[]>>;
}

interface Tally { score: number; votes: number }
const add = (m: Map<string, Tally>, k: string, w: number) => {
    const t = m.get(k) ?? { score: 0, votes: 0 };
    t.score += w;
    if (w > 0) t.votes++;
    m.set(k, t);
};

/** Puanı en yüksek değer; önsel ile ikinciden yeterince öndeyse döner. */
function winner(m: Map<string, Tally>): [string, Tally] | null {
    const sorted = [...m.entries()].sort((a, b) => b[1].score - a[1].score);
    if (!sorted.length) return null;
    const [top, second] = sorted;
    const lead = top[1].score - Math.max(0, second?.[1].score ?? 0);
    return top[1].score >= MIN_SCORE && lead >= PRIOR ? top : null;
}

/** Yakın renkleri tek kümede toplar (temsilci: ilk görülen). */
function colorKey(hex: string, reps: string[]): string {
    const near = reps.find(r => colorDistance(r, hex) < 48);
    if (near) return near;
    reps.push(hex);
    return hex;
}

export function suggestDefaults(docTypeId: string, category: string, sector: string, memory: AiMemoryEntry[], now = Date.now()): LearnedDefaults {
    const tallies = new Map<string, Map<string, Tally>>();
    const tally = (key: string) => tallies.get(key) ?? tallies.set(key, new Map()).get(key)!;
    const reps: string[] = [];
    const sectionScore = new Map<string, Tally>();
    const textVotes = new Map<TextKey, Map<string, number>>();

    for (const e of memory) {
        const w0 = entryWeight(e, now);
        if (!w0) continue;
        const w = w0 * scopeOf(e, docTypeId, category, sector);
        const p = paramsOf(e);
        for (const k of PARAM_KEYS) {
            const v = p[k];
            if (typeof v !== 'string' || !v) continue;
            if (k === 'accent') { if (isHex(v)) add(tally(k), colorKey(v.toLowerCase(), reps), w); continue; }
            if (k === 'paper' && e.doc_type_id !== docTypeId) continue;
            add(tally(k), v, w);
        }
        if (e.doc_type_id === docTypeId && p.sections) {
            for (const [id, on] of Object.entries(p.sections)) add(sectionScore, id, on ? w : -w);
        }
        if (w0 > 0 && p.texts && (e.sector === sector || (!sector && e.doc_type_id === docTypeId))) {
            for (const [k, v] of Object.entries(p.texts) as [TextKey, string][]) {
                if (!v) continue;
                const m = textVotes.get(k) ?? textVotes.set(k, new Map()).get(k)!;
                m.set(v, (m.get(v) ?? 0) + w0);
            }
        }
    }

    const patch: ParamPatch = {};
    const suggestions: Suggestion[] = [];
    for (const k of PARAM_KEYS) {
        const win = winner(tally(k));
        if (!win) continue;
        const [value, t] = win;
        if (setKey(patch, k, value, docTypeId)) suggestions.push({ key: k, value, label: effectLabel(k, value), score: t.score, votes: t.votes });
    }
    const valid = new Set(sectionsFor(docTypeId).map(s => s.id));
    for (const [id, t] of sectionScore) {
        if (!valid.has(id) || Math.abs(t.score) < MIN_SCORE) continue;
        const on = t.score > 0;
        setKey(patch, `sections.${id}`, on, docTypeId);
        suggestions.push({ key: `sections.${id}`, value: on, label: effectLabel(`sections.${id}`, on), score: Math.abs(t.score), votes: t.votes });
    }
    const allowedTexts = new Set(textFieldsFor(docTypeId).map(f => f.id));
    const texts: Partial<Record<TextKey, string[]>> = {};
    for (const [k, m] of textVotes) {
        if (!allowedTexts.has(k)) continue;
        texts[k] = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([v]) => v);
    }
    suggestions.sort((a, b) => b.score - a.score);
    return { patch, suggestions, texts };
}

/** Düzeltmelerden kelime → parametre bağları. Beğenilen / yayınlanan düzeltmeler daha ağır sayılır. */
export function learnedRules(memory: AiMemoryEntry[], now = Date.now()): LearnedRule[] {
    const rules = new Map<string, LearnedRule>();
    for (const e of memory) {
        const lf = paramsOf(e).learnedFrom;
        if (!lf || !Array.isArray(lf.tokens) || !lf.changes) continue;
        const decay = Math.pow(0.5, ageDays(e.created_at, now) / HALF_LIFE_DAYS);
        const w = (e.rating < 0 ? 0.25 : 1 + (e.rating > 0 ? 0.5 : 0) + (e.published ? 1 : 0)) * decay;
        for (const token of lf.tokens.slice(0, 8)) {
            for (const [key, value] of Object.entries(lf.changes)) {
                const id = `${token}|${key}|${String(value)}`;
                const r = rules.get(id) ?? { tokens: [token], key, value, weight: 0, count: 0 };
                r.weight += w;
                r.count++;
                rules.set(id, r);
            }
        }
    }
    // Aynı kelime + anahtar için çelişen değerlerde yalnız en güçlüsü, farkla kalır.
    const byTokenKey = new Map<string, LearnedRule[]>();
    for (const r of rules.values()) {
        const k = `${r.tokens[0]}|${r.key}`;
        byTokenKey.set(k, [...(byTokenKey.get(k) ?? []), r]);
    }
    const out: LearnedRule[] = [];
    for (const list of byTokenKey.values()) {
        list.sort((a, b) => b.weight - a.weight);
        const lead = list[0].weight - (list[1]?.weight ?? 0);
        if (list[0].weight >= 1 && lead >= 0.5) out.push(list[0]);
    }
    return out.sort((a, b) => b.weight - a.weight);
}

export interface MemoryStats {
    total: number;
    liked: number;
    disliked: number;
    published: number;
    corrections: number;
    topSectors: { id: string; label: string; count: number }[];
    topDocTypes: { id: string; label: string; count: number }[];
}

export function memoryStats(memory: AiMemoryEntry[]): MemoryStats {
    const count = (f: (e: AiMemoryEntry) => string) => {
        const m = new Map<string, number>();
        for (const e of memory) { const k = f(e); if (k) m.set(k, (m.get(k) ?? 0) + 1); }
        return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    };
    return {
        total: memory.length,
        liked: memory.filter(e => e.rating > 0).length,
        disliked: memory.filter(e => e.rating < 0).length,
        published: memory.filter(e => e.published).length,
        corrections: memory.filter(e => paramsOf(e).learnedFrom).length,
        topSectors: count(e => e.sector).map(([id, n]) => ({ id, label: SECTORS.find(s => s.id === id)?.label ?? id, count: n })),
        topDocTypes: count(e => e.doc_type_id).map(([id, n]) => ({ id, label: WIZARD_DOC_TYPES.find(d => d.id === id)?.label ?? id, count: n })),
    };
}

const docLabel = (id: string) => WIZARD_DOC_TYPES.find(d => d.id === id)?.label ?? id;
const sectorLabel = (id: string) => SECTORS.find(s => s.id === id)?.label ?? CATEGORIES.find(c => c.id === id)?.label ?? id;
/** Türkçe içgörüler: "Turizm sektöründe e-Arşiv için en çok beğenilen stil: Modern (4 onay)". */
export function explain(memory: AiMemoryEntry[], focus?: { docTypeId?: string; sector?: string }, now = Date.now()): string[] {
    const out: string[] = [];
    if (!memory.length) return ['Henüz hafızam boş. Tasarımları beğendikçe, düzelttikçe ve galeriye ekledikçe tercihlerinizi öğreneceğim.'];
    const groups = new Map<string, AiMemoryEntry[]>();
    for (const e of memory) {
        const k = `${e.doc_type_id}|${e.sector}`;
        groups.set(k, [...(groups.get(k) ?? []), e]);
    }
    const ordered = [...groups.entries()].sort((a, b) => {
        const fa = focus && a[0] === `${focus.docTypeId}|${focus.sector}` ? 1 : 0;
        const fb = focus && b[0] === `${focus.docTypeId}|${focus.sector}` ? 1 : 0;
        return fb - fa || b[1].length - a[1].length;
    });
    for (const [key, list] of ordered.slice(0, 6)) {
        const [doc, sector] = key.split('|');
        const style = new Map<string, Tally>();
        const colors = new Map<string, Tally>();
        const reps: string[] = [];
        for (const e of list) {
            const w = entryWeight(e, now);
            if (w <= 0) continue;
            const p = paramsOf(e);
            if (p.style) add(style, p.style, w);
            if (isHex(p.accent)) add(colors, colorKey(p.accent.toLowerCase(), reps), w);
        }
        const where = sector ? `${sectorLabel(sector)} sektöründe ` : 'Genel olarak ';
        const topStyle = [...style.entries()].sort((a, b) => b[1].score - a[1].score)[0];
        if (topStyle) out.push(`${where}${docLabel(doc)} için en çok beğenilen stil: ${labelOf(STYLES, topStyle[0])} (${topStyle[1].votes} onay)`);
        const topColor = [...colors.entries()].sort((a, b) => b[1].score - a[1].score)[0];
        if (topColor) out.push(`${where}${docLabel(doc)} için öne çıkan renk: ${colorName(topColor[0]) ?? topColor[0]} (${topColor[1].votes} onay)`);
        const disliked = list.filter(e => e.rating < 0).map(e => paramsOf(e).style).filter(Boolean) as string[];
        if (disliked.length >= 2) {
            const worst = [...disliked.reduce((m, s) => m.set(s, (m.get(s) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1])[0];
            if (worst[1] >= 2) out.push(`${where}${docLabel(doc)} için ${labelOf(STYLES, worst[0])} stil ${worst[1]} kez beğenilmedi; daha az öneriyorum`);
        }
    }
    const sectionVotes = new Map<string, Tally>();
    for (const e of memory) {
        const w = entryWeight(e, now);
        if (w <= 0) continue;
        for (const [id, on] of Object.entries(paramsOf(e).sections ?? {})) if (on && sectionDef(id)?.defaultOn !== '*') add(sectionVotes, id, w);
    }
    const topSection = [...sectionVotes.entries()].sort((a, b) => b[1].score - a[1].score)[0];
    if (topSection && topSection[1].votes >= 2) out.push(`Beğenilen tasarımlarda en sık açılan bölüm: ${sectionDef(topSection[0])?.label ?? topSection[0]} (${topSection[1].votes} tasarım)`);
    for (const r of learnedRules(memory, now).slice(0, 4)) {
        out.push(`“${r.tokens.join(' ')}” dediğinizde ${effectLabel(r.key, r.value).replace(/^(.)/, c => c.toLocaleLowerCase('tr-TR'))} olarak öğrendim (${r.count} düzeltme)`);
    }
    const texts = memory.filter(e => entryWeight(e, now) > 0).flatMap(e => Object.keys(paramsOf(e).texts ?? {}));
    if (texts.length >= 2) {
        const top = [...texts.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1])[0];
        out.push(`Beğenilen tasarımlarda sık eklenen yazı: ${TEXT_FIELDS.find(f => f.id === top[0])?.label ?? top[0]} (${top[1]} kez)`);
    }
    return out.length ? out : ['Kayıtlar var ama henüz belirgin bir tercih çıkmadı; birkaç tasarımı beğenip beğenmediğinizi işaretleyin.'];
}
