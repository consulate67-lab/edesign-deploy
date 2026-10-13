/**
 * Profesyonel tasarım önerisi: elle hazırlanmış şablon adaylarını sunucudaki yapay zekâya
 * seçtirir; yapay zekâ yoksa, hakkı bittiyse ya da hata olursa kural tabanlı sıralama kullanılır.
 */
import { API_URL, api } from '../api';
import type { SectorTemplate } from '../sector-templates';
import { pickTop, sectorLabel, type Mood } from './library';

export interface Quota { ai: boolean; limit: number | null; used: number; remaining: number | null }

export interface Pick { template: SectorTemplate; reason: string | null }

export interface PickResult { source: 'ai' | 'rules'; reason?: 'disabled' | 'limit' | 'error' | 'network'; picks: Pick[]; quota: Quota | null }

export interface PickInput {
    docType: string;
    sectorId: string;
    wishes: string;
    moods: Mood[];
    hasLogo: boolean;
    bankCount: number;
    lang: string;
    /** Kural tabanlı sıralamayla dizilmiş adaylar; yapay zekâya ilk 24'ü gider. */
    ranked: SectorTemplate[];
}

const AI_CANDIDATES = 24;

const authHeaders = (): Record<string, string> => {
    const token = api.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function requestPicks(input: PickInput): Promise<PickResult> {
    const fallback = (reason: PickResult['reason'], quota: Quota | null): PickResult => ({
        source: 'rules', reason, picks: pickTop(input.ranked).map(template => ({ template, reason: null })), quota,
    });
    const candidates = input.ranked.slice(0, AI_CANDIDATES);
    if (candidates.length < 4) return fallback('disabled', null);
    try {
        const res = await fetch(`${API_URL}/design-ai/pick`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({
                docType: input.docType, sector: input.sectorId ? sectorLabel(input.sectorId) : '', wishes: input.wishes, moods: input.moods,
                hasLogo: input.hasLogo, bankCount: input.bankCount, lang: input.lang,
                candidates: candidates.map(t => ({ id: t.id, name: t.name, description: t.description, tags: t.tags, sector: sectorLabel(t.sector) })),
            }),
            signal: AbortSignal.timeout(40_000),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) return fallback('network', null);
        if (data.source !== 'ai' || !Array.isArray(data.picks)) return fallback(data.reason ?? 'error', data.quota ?? null);
        const byId = new Map(candidates.map(t => [t.id, t]));
        const picks: Pick[] = (data.picks as { id: string; reason?: string }[])
            .filter(p => byId.has(p.id))
            .map(p => ({ template: byId.get(p.id) as SectorTemplate, reason: typeof p.reason === 'string' && p.reason ? p.reason : null }));
        for (const t of pickTop(input.ranked)) if (picks.length < 3 && !picks.some(p => p.template.id === t.id)) picks.push({ template: t, reason: null });
        return { source: 'ai', picks, quota: data.quota ?? null };
    } catch {
        return fallback('network', null);
    }
}

export async function fetchQuota(): Promise<Quota | null> {
    try {
        const res = await fetch(`${API_URL}/design-ai/quota`, { headers: authHeaders() });
        return res.ok ? await res.json() : null;
    } catch {
        return null;
    }
}
