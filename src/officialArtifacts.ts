/**
 * Admin onayından sonra sunucuda tutulan resmi GİB artefact'ları.
 * Bundle'daki inline XSLT'nin üzerine runtime override olarak bindirilir.
 */
import { API_URL } from './api';

export interface PublicOfficialRevision {
    id: number;
    source_id: string;
    source_label: string;
    summary: string | null;
    affects: string[];
    applied_at: string | null;
    remote_url: string;
    files: { path: string; bytes: number; download: string }[];
}

interface ArtifactMeta {
    path: string;
    content_sha256: string;
    revision_id: number | null;
    source_id: string | null;
    updated_at: string;
}

const TTL_MS = 5 * 60_000;
let contentCache = new Map<string, string>();
let metaAt = 0;
let metaPromise: Promise<void> | null = null;
let revisionsCache: PublicOfficialRevision[] | null = null;
let revisionsAt = 0;
let revisionsPromise: Promise<PublicOfficialRevision[]> | null = null;

/** Bundle anahtarı (gib/general.xslt) ↔ artefact yolu (ebelge/gib/general.xslt). */
export const artifactPathForInlineKey = (inlineKey: string) =>
    inlineKey.startsWith('ebelge/') ? inlineKey : `ebelge/${inlineKey}`;

export const inlineKeyForArtifactPath = (path: string) =>
    path.startsWith('ebelge/') ? path.slice('ebelge/'.length) : path;

async function refreshMeta(force = false) {
    if (!force && Date.now() - metaAt < TTL_MS && contentCache.size >= 0 && metaAt > 0) return;
    if (metaPromise) return metaPromise;
    metaPromise = (async () => {
        try {
            const res = await fetch(`${API_URL}/official-artifacts`);
            if (!res.ok) return;
            const list = (await res.json()) as ArtifactMeta[];
            // İçerikleri tembel yükleriz; cache anahtarlarını bilmek için path listesini tutarız
            const next = new Map(contentCache);
            for (const row of list) {
                if (!next.has(row.path)) next.set(row.path, ''); // placeholder
            }
            // Silinen yolları temizle
            for (const key of [...next.keys()]) {
                if (!list.some(r => r.path === key)) next.delete(key);
            }
            contentCache = next;
            metaAt = Date.now();
        } catch {
            /* API yoksa bundle kullanılır */
        } finally {
            metaPromise = null;
        }
    })();
    return metaPromise;
}

export async function getOfficialArtifactContent(path: string): Promise<string | null> {
    await refreshMeta();
    const normalized = path.replace(/^\/+/, '');
    if (!contentCache.has(normalized) && !contentCache.has(artifactPathForInlineKey(normalized))) {
        // meta boş olsa bile doğrudan dene
    }
    const key = contentCache.has(normalized) ? normalized
        : contentCache.has(artifactPathForInlineKey(normalized)) ? artifactPathForInlineKey(normalized)
            : normalized;
    const cached = contentCache.get(key);
    if (cached) return cached;
    try {
        const res = await fetch(`${API_URL}/official-artifacts/${encodeURIComponent(key)}`);
        if (!res.ok) return null;
        const data = await res.json() as { content?: string };
        if (typeof data.content !== 'string') return null;
        contentCache.set(key, data.content);
        return data.content;
    } catch {
        return null;
    }
}

/** Inline XSLT anahtarı için override varsa onu, yoksa null döner. */
export async function getOfficialXsltOverride(inlineKey: string): Promise<string | null> {
    return getOfficialArtifactContent(artifactPathForInlineKey(inlineKey));
}

export function officialArtifactDownloadUrl(path: string): string {
    const key = path.startsWith('ebelge/') ? path : artifactPathForInlineKey(path);
    return `${API_URL}/official-artifacts/${encodeURIComponent(key)}?download=1`;
}

export async function fetchOfficialRevisions(force = false): Promise<PublicOfficialRevision[]> {
    if (!force && revisionsCache && Date.now() - revisionsAt < TTL_MS) return revisionsCache;
    if (revisionsPromise) return revisionsPromise;
    revisionsPromise = (async () => {
        try {
            const res = await fetch(`${API_URL}/official-revisions`);
            if (!res.ok) return revisionsCache ?? [];
            const list = (await res.json()) as PublicOfficialRevision[];
            revisionsCache = list;
            revisionsAt = Date.now();
            return list;
        } catch {
            return revisionsCache ?? [];
        } finally {
            revisionsPromise = null;
        }
    })();
    return revisionsPromise;
}

/** Belge türü / modül id'si ile ilgili uygulanan revizyonlar. */
export function revisionsAffecting(list: PublicOfficialRevision[], moduleOrDocId: string): PublicOfficialRevision[] {
    const id = moduleOrDocId.toLowerCase();
    return list.filter(r => {
        const affects = (r.affects || []).map(a => a.toLowerCase());
        if (!affects.length) return true;
        return affects.some(a => id.includes(a) || a.includes(id));
    });
}
