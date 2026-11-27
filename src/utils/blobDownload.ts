/**
 * Blob indirme yardımcıları.
 * Chromium/Edge, kullanıcı jesti (click) sonrasındaki `await` zincirinde
 * `a.click()` ile tetiklenen indirmeyi sessizce engelleyebilir. Bu yüzden:
 *  - mümkünse indirmeyi await öncesi senkron yapın;
 *  - await sonrası da `offerBlobDownload` kullanın — programatik tıklama
 *    denenir ve engellenirse ekranda tıklanabilir yedek link kalır.
 */

export type PendingBlobDownload = {
    url: string;
    filename: string;
};

let pending: PendingBlobDownload | null = null;
const listeners = new Set<(p: PendingBlobDownload | null) => void>();

export function getPendingBlobDownload() {
    return pending;
}

export function subscribePendingBlobDownload(fn: (p: PendingBlobDownload | null) => void) {
    listeners.add(fn);
    fn(pending);
    return () => { listeners.delete(fn); };
}

function notify() {
    for (const fn of listeners) fn(pending);
}

export function clearPendingBlobDownload() {
    if (pending) {
        try { URL.revokeObjectURL(pending.url); } catch { /* ignore */ }
    }
    pending = null;
    notify();
}

/** Programatik indirme dener; blob URL döner (revoke çağıran sorumluluğunda). */
export function triggerBlobDownload(
    data: Blob | BlobPart | BlobPart[],
    filename: string,
    mime = 'application/octet-stream',
): string {
    const blob = data instanceof Blob
        ? data
        : new Blob(Array.isArray(data) ? data : [data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return url;
}

/**
 * İndirmeyi dener ve yedek link olarak bekletir (await sonrası kullanım için).
 * Önceki bekleyen indirme varsa temizlenir.
 */
export function offerBlobDownload(
    data: Blob | BlobPart | BlobPart[],
    filename: string,
    mime = 'application/octet-stream',
): string {
    if (pending) {
        try { URL.revokeObjectURL(pending.url); } catch { /* ignore */ }
    }
    const url = triggerBlobDownload(data, filename, mime);
    pending = { url, filename };
    notify();
    window.setTimeout(() => {
        if (pending?.url === url) clearPendingBlobDownload();
    }, 120_000);
    return url;
}
