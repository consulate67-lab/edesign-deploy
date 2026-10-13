/**
 * Profesyonel şablon önerisi: sunucudaki yapay zekâ kararını (varsa) ya da
 * sektör + tarz kurallarını tasarım parametrelerine çevirir.
 */
import { API_URL, api } from '../api';
import { defaultParams } from '../admin/ai-designer/questions';
import type { BankAccount, ColorMode, DesignParams, FontId, ProStyleId, TextKey } from '../admin/ai-designer/types';
import { fold, isHex } from '../admin/ai-designer/utils';
import { SECTORS } from '../sector-templates/types';

export const PRO_SKINS: ProStyleId[] = ['serit', 'antet', 'kart', 'panel', 'isvec', 'tutar'];
export const MOODS = ['modern', 'kurumsal', 'minimal', 'zarif', 'canli', 'sade'] as const;
export type Mood = typeof MOODS[number];

export interface ProBrief {
    styles: ProStyleId[];
    accent: string | null;
    font: FontId | null;
    colorMode: ColorMode | null;
    reasons: Partial<Record<ProStyleId, string>>;
    texts: Partial<Record<TextKey, string>>;
    sections: Record<string, boolean>;
}

export interface Quota { ai: boolean; limit: number | null; used: number; remaining: number | null }

export interface BriefResult { source: 'ai' | 'rules'; reason?: 'disabled' | 'limit' | 'error' | 'network'; brief: ProBrief; quota: Quota | null }

export interface BriefInput {
    docType: string;
    sectorId: string;
    wishes: string;
    moods: Mood[];
    texts: string[];
    sections: { id: string; label: string; detected: boolean }[];
    hasLogo: boolean;
    bankCount: number;
    accentHint: string | null;
    lang: string;
}

const SECTOR_PICK: Record<string, ProStyleId> = {
    hukuk: 'antet', muhasebe: 'antet', buro: 'antet', emlak: 'antet', kuyumcu: 'antet', turizm: 'antet', mobilya: 'antet', ayakkabi: 'antet',
    saglik: 'isvec', medya: 'isvec',
    bilisim: 'panel', egitim: 'panel', elektronik: 'panel', sigorta: 'panel',
    perakende: 'kart', eticaret: 'kart', pazar: 'kart', 'yeme-icme': 'kart', seyahat: 'kart', etkinlik: 'kart', eglence: 'kart', guzellik: 'kart', spor: 'kart', tekstil: 'kart',
    'teknik-servis': 'tutar', temizlik: 'tutar', 'genel-hizmet': 'tutar', 'arac-kiralama': 'tutar', finans: 'tutar', enerji: 'tutar',
};

const CATEGORY_ORDER: Record<string, ProStyleId[]> = {
    hizmet: ['antet', 'panel', 'isvec'],
    ticaret: ['kart', 'tutar', 'serit'],
    turizm: ['kart', 'antet', 'isvec'],
    tasimacilik: ['serit', 'tutar', 'panel'],
    finans: ['panel', 'tutar', 'antet'],
    sanayi: ['serit', 'panel', 'tutar'],
    moda: ['kart', 'antet', 'isvec'],
    tarim: ['serit', 'kart', 'tutar'],
};

const MOOD_SCORES: Record<Mood, Partial<Record<ProStyleId, number>>> = {
    modern: { kart: 3, isvec: 2, panel: 2 },
    kurumsal: { serit: 3, panel: 2, antet: 1 },
    minimal: { isvec: 3, antet: 1 },
    zarif: { antet: 3, isvec: 1 },
    canli: { kart: 3, tutar: 2 },
    sade: { isvec: 3, antet: 2, tutar: 1 },
};

const WISH_WORDS: [RegExp, Partial<Record<ProStyleId, number>>][] = [
    [/modern|cagdas|yenilikci|genc/, MOOD_SCORES.modern],
    [/kurumsal|resmi|ciddi|guven/, MOOD_SCORES.kurumsal],
    [/minimal|ferah|beyaz alan|temiz/, MOOD_SCORES.minimal],
    [/zarif|sik|asil|luks|premium|klasik/, MOOD_SCORES.zarif],
    [/renkli|canli|dikkat cekici|enerjik/, MOOD_SCORES.canli],
    [/sade|yalin|basit/, MOOD_SCORES.sade],
    [/tahsilat|vade|iban|odeme|tutar/, { tutar: 3 }],
    [/koyu|lacivert|siyah/, { serit: 2, panel: 2 }],
    [/yan panel|sol panel|kenar/, { panel: 3 }],
    [/kart|yuvarlak/, { kart: 3 }],
];

/** Yapay zekâ yokken: metni anlamına göre alana yerleştirir. */
export function placeTexts(texts: string[]): Partial<Record<TextKey, string>> {
    const out: Partial<Record<TextKey, string[]>> = {};
    const add = (k: TextKey, t: string) => { (out[k] ??= []).push(t); };
    for (const t of texts) {
        const f = fold(t);
        if (/tesekkur|tercih ettiginiz|bizi sectiginiz/.test(f)) add('thanks', t);
        else if (/iade|garanti|degisim|cayma/.test(f)) add('returnPolicy', t);
        else if (/mersis|ticaret sicil|sicil no|kep adres|sermaye/.test(f)) add('legal', t);
        else if (/\btel\b|telefon|www\.|@|https?:|gsm/.test(f)) add('contact', t);
        else add('footer', t);
    }
    const joined: Partial<Record<TextKey, string>> = {};
    for (const [k, list] of Object.entries(out) as [TextKey, string[]][]) joined[k] = k === 'thanks' ? list[0] : list.join('\n');
    return joined;
}

const compact = (s: string) => fold(s).replace(/[^a-z0-9]+/g, '');

/** Yapay zekânın yerleştirmediği özgün metinleri kural tabanlı alanlarına ekler. */
function completeTexts(ai: ProBrief['texts'], texts: string[]): ProBrief['texts'] {
    const out = { ...ai };
    const placed = compact(Object.values(out).join(' '));
    const missing = texts.filter(t => compact(t) && !placed.includes(compact(t)));
    for (const [k, v] of Object.entries(placeTexts(missing)) as [TextKey, string][]) {
        out[k] = k === 'thanks' ? v : [out[k], v].filter(Boolean).join('\n');
    }
    return out;
}

export function ruleBrief(input: Pick<BriefInput, 'sectorId' | 'moods' | 'wishes' | 'texts'>): ProBrief {
    const score = new Map<ProStyleId, number>(PRO_SKINS.map((s, i) => [s, -i * 0.01]));
    const bump = (s: ProStyleId, n: number) => score.set(s, (score.get(s) ?? 0) + n);
    const sector = SECTORS.find(s => s.id === input.sectorId);
    if (sector) {
        const pick = SECTOR_PICK[sector.id];
        if (pick) bump(pick, 5);
        (CATEGORY_ORDER[sector.category] ?? []).forEach((s, i) => bump(s, 3 - i));
    }
    for (const m of input.moods) for (const [s, n] of Object.entries(MOOD_SCORES[m]) as [ProStyleId, number][]) bump(s, n);
    const wish = fold(input.wishes);
    for (const [re, add] of WISH_WORDS) if (re.test(wish)) for (const [s, n] of Object.entries(add) as [ProStyleId, number][]) bump(s, n);
    const styles = [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s);
    const colorMode: ColorMode | null = input.moods.includes('canli') ? 'canli' : input.moods.includes('sade') ? 'sade' : null;
    return { styles, accent: null, font: input.moods.includes('zarif') ? 'georgia' : null, colorMode, reasons: {}, texts: placeTexts(input.texts), sections: {} };
}

export async function requestBrief(input: BriefInput): Promise<BriefResult> {
    const fallback = (reason: BriefResult['reason'], quota: Quota | null): BriefResult => ({ source: 'rules', reason, brief: ruleBrief(input), quota });
    const sector = SECTORS.find(s => s.id === input.sectorId);
    try {
        const token = api.getToken();
        const res = await fetch(`${API_URL}/design-ai/brief`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({ ...input, sector: sector?.label ?? '' }),
            signal: AbortSignal.timeout(40_000),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) return fallback('network', null);
        if (data.source !== 'ai' || !data.brief) return fallback(data.reason ?? 'error', data.quota ?? null);
        const b = data.brief as ProBrief;
        const rules = ruleBrief(input);
        const styles = [...new Set([...b.styles.filter(s => PRO_SKINS.includes(s)), ...rules.styles])].slice(0, 3);
        return {
            source: 'ai',
            brief: { ...b, styles, accent: isHex(b.accent) ? b.accent : null, texts: completeTexts(b.texts ?? {}, input.texts) },
            quota: data.quota ?? null,
        };
    } catch {
        return fallback('network', null);
    }
}

export async function fetchQuota(): Promise<Quota | null> {
    try {
        const token = api.getToken();
        const res = await fetch(`${API_URL}/design-ai/quota`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        return res.ok ? await res.json() : null;
    } catch {
        return null;
    }
}

export interface ProAssets { logo: string | null; stamp: string | null; banks: BankAccount[]; logoColor: string | null; xsltColor: string | null }

export function paramsFor(docTypeId: string, sectorId: string, brief: ProBrief, style: ProStyleId, assets: ProAssets): DesignParams {
    const sector = SECTORS.find(s => s.id === sectorId);
    const base = defaultParams(docTypeId, sector?.category ?? '', sectorId);
    const accent = brief.accent ?? assets.logoColor ?? assets.xsltColor ?? base.accent;
    return {
        ...base,
        style,
        accent,
        font: brief.font ?? base.font,
        colorMode: brief.colorMode ?? 'dengeli',
        logo: assets.logo,
        stamp: assets.stamp,
        banks: assets.banks,
        bankPosition: style === 'panel' ? 'yan' : 'alt',
        texts: { ...brief.texts },
        sections: { ...base.sections, ...brief.sections },
    };
}
