/**
 * Tasarım-zamanı sayfa bantları (üst / orta / alt).
 * Yalnız editör önizlemesinde görünür; XSLT'ye yazılmaz.
 * Bant sınırı sürüklenince alttaki mutlak/statik kök öğeler birlikte kayar.
 */

export type DesignBandId = 'master' | 'detail' | 'footer';

/** Sayfa yüksekliğine göre oranlar; master üstten, detail ortada, footer kalan. */
export type DesignBandLayout = {
    /** Üst bandın alt sınırı (0–1). */
    masterEnd: number;
    /** Orta bandın alt sınırı (masterEnd–1). */
    detailEnd: number;
};

export const DEFAULT_BAND_LAYOUT: DesignBandLayout = {
    masterEnd: 0.38,
    detailEnd: 0.72,
};

const MIN_BAND = 0.08;

export const clampBandLayout = (layout: DesignBandLayout): DesignBandLayout => {
    let masterEnd = Math.min(1 - 2 * MIN_BAND, Math.max(MIN_BAND, layout.masterEnd));
    let detailEnd = Math.min(1 - MIN_BAND, Math.max(masterEnd + MIN_BAND, layout.detailEnd));
    if (detailEnd - masterEnd < MIN_BAND) detailEnd = masterEnd + MIN_BAND;
    if (1 - detailEnd < MIN_BAND) {
        detailEnd = 1 - MIN_BAND;
        masterEnd = Math.min(masterEnd, detailEnd - MIN_BAND);
    }
    return { masterEnd, detailEnd };
};

export const BAND_ORDER: DesignBandId[] = ['master', 'detail', 'footer'];

const storageKey = (designId?: number | string | null) =>
    `edxdocu:design-bands:${designId ?? 'draft'}`;

export function loadBandLayout(designId?: number | string | null): DesignBandLayout {
    try {
        const raw = localStorage.getItem(storageKey(designId));
        if (!raw) return { ...DEFAULT_BAND_LAYOUT };
        const parsed = JSON.parse(raw) as Partial<DesignBandLayout>;
        return clampBandLayout({
            masterEnd: Number(parsed.masterEnd) || DEFAULT_BAND_LAYOUT.masterEnd,
            detailEnd: Number(parsed.detailEnd) || DEFAULT_BAND_LAYOUT.detailEnd,
        });
    } catch {
        return { ...DEFAULT_BAND_LAYOUT };
    }
}

export function saveBandLayout(layout: DesignBandLayout, designId?: number | string | null): void {
    try {
        localStorage.setItem(storageKey(designId), JSON.stringify(clampBandLayout(layout)));
    } catch {
        /* ignore quota */
    }
}

export const BAND_OVERLAY_ID = '__xslt-design-bands';

export type BandShiftSnapshot = {
    el: HTMLElement;
    kind: 'absolute' | 'margin';
    /** Sürükleme başındaki style.top (absolute) veya style.marginTop (margin). */
    base: number;
    left: number;
    clientTop: number;
};

/** Bant overlay dışındaki, sayfadaki taşınabilir kök öğeler. */
export function collectBandShiftCandidates(page: HTMLElement): HTMLElement[] {
    const doc = page.ownerDocument;
    const view = doc.defaultView;
    const all = Array.from(page.querySelectorAll<HTMLElement>('[data-xslt-obj], [data-xsrc], [data-render-index]'));
    const hit = all.filter((el) => {
        if (el.id === BAND_OVERLAY_ID || el.closest(`#${BAND_OVERLAY_ID}`)) return false;
        // İç içe: üstte zaten aday olan bir ebeveyn varsa çocuğu atla (çift kaydırma olmasın).
        const pos = el.style.position || view?.getComputedStyle(el).position || '';
        const absolute = pos === 'absolute' || pos === 'fixed';
        // Statik akış: yalnızca blok benzeri data-xsrc (tablo, div…) — satır içi span kaymasın.
        if (!absolute) {
            if (!el.hasAttribute('data-xsrc')) return false;
            const display = view?.getComputedStyle(el).display || '';
            if (display === 'inline' || display === 'inline-block' || display === 'contents') return false;
            const tag = el.tagName.toLowerCase();
            if (['span', 'a', 'b', 'i', 'em', 'strong', 'font', 'label'].includes(tag)) return false;
        }
        return true;
    });
    return hit.filter((el) => !hit.some((other) => other !== el && other.contains(el)));
}

export function snapshotBandShiftTargets(
    page: HTMLElement,
    edgeClientY: number,
): BandShiftSnapshot[] {
    const view = page.ownerDocument.defaultView;
    const out: BandShiftSnapshot[] = [];
    for (const el of collectBandShiftCandidates(page)) {
        const r = el.getBoundingClientRect();
        if (r.top < edgeClientY - 1) continue;
        const pos = el.style.position || view?.getComputedStyle(el).position || '';
        if (pos === 'absolute' || pos === 'fixed') {
            const top = parseFloat(el.style.top || '') || parseFloat(view?.getComputedStyle(el).top || '') || 0;
            const left = parseFloat(el.style.left || '') || parseFloat(view?.getComputedStyle(el).left || '') || 0;
            out.push({ el, kind: 'absolute', base: top, left, clientTop: r.top });
        } else {
            const mt = parseFloat(el.style.marginTop || '') || parseFloat(view?.getComputedStyle(el).marginTop || '') || 0;
            out.push({ el, kind: 'margin', base: mt, left: 0, clientTop: r.top });
        }
    }
    return out;
}

/** Sürükleme boyunca anlık kaydırma (henüz XSLT’ye yazılmaz). */
export function applyBandShiftDelta(
    snaps: BandShiftSnapshot[],
    deltaClientPx: number,
    scaleOf: (el: HTMLElement) => number,
): void {
    if (Math.abs(deltaClientPx) < 0.25) return;
    for (const s of snaps) {
        const scale = scaleOf(s.el) || 1;
        const next = s.base + deltaClientPx / scale;
        if (s.kind === 'absolute') {
            if (s.el.style.position !== 'absolute' && s.el.style.position !== 'fixed') {
                s.el.style.position = 'absolute';
                s.el.style.left = `${s.left}px`;
            }
            s.el.style.top = `${next}px`;
        } else {
            s.el.style.marginTop = `${next}px`;
        }
    }
}

/**
 * Sayfa kutusunun üzerine tasarım-only bant katmanını çizer.
 * pointer-events yalnız tutamaçlarda; XSLT / içerik dokunulmaz.
 */
export function syncDesignBandOverlay(
    page: HTMLElement | null,
    layout: DesignBandLayout,
    labels: Record<DesignBandId, string>,
    visible: boolean,
): void {
    const doc = page?.ownerDocument;
    let root = doc?.getElementById(BAND_OVERLAY_ID) as HTMLElement | null;
    if (!visible || !page || !doc) {
        root?.remove();
        return;
    }

    const pageCs = doc.defaultView?.getComputedStyle(page);
    if (pageCs && pageCs.position === 'static') page.style.position = 'relative';

    if (!root) {
        root = doc.createElement('div');
        root.id = BAND_OVERLAY_ID;
        root.setAttribute('data-design-bands', '');
        page.appendChild(root);
    } else if (root.parentElement !== page) {
        page.appendChild(root);
    }

    const { masterEnd, detailEnd } = clampBandLayout(layout);
    root.style.cssText = [
        'position:absolute',
        'inset:0',
        'z-index:2147483000',
        'pointer-events:none',
        'overflow:hidden',
        'font-family:system-ui,sans-serif',
    ].join(';');

    const bands: { id: DesignBandId; top: number; height: number; color: string }[] = [
        { id: 'master', top: 0, height: masterEnd, color: 'rgba(14, 165, 233, 0.06)' },
        { id: 'detail', top: masterEnd, height: detailEnd - masterEnd, color: 'rgba(16, 185, 129, 0.06)' },
        { id: 'footer', top: detailEnd, height: 1 - detailEnd, color: 'rgba(245, 158, 11, 0.07)' },
    ];

    root.innerHTML = '';
    for (const b of bands) {
        const el = doc.createElement('div');
        el.setAttribute('data-band', b.id);
        el.style.cssText = [
            'position:absolute',
            `top:${(b.top * 100).toFixed(3)}%`,
            `height:${(b.height * 100).toFixed(3)}%`,
            'left:0',
            'right:0',
            `background:${b.color}`,
            'border-bottom:1px dashed rgba(100,116,139,0.4)',
            'box-sizing:border-box',
            'pointer-events:none',
        ].join(';');
        const tag = doc.createElement('span');
        tag.textContent = labels[b.id];
        tag.style.cssText = [
            'position:absolute',
            'top:4px',
            'right:6px',
            'padding:1px 6px',
            'border-radius:3px',
            'font:700 9px/14px system-ui,sans-serif',
            'letter-spacing:0.3px',
            'text-transform:uppercase',
            'color:#64748b',
            'background:rgba(255,255,255,0.75)',
            'border:1px solid rgba(148,163,184,0.45)',
            'pointer-events:none',
            'user-select:none',
            'opacity:0.9',
        ].join(';');
        el.appendChild(tag);
        root.appendChild(el);
    }

    const addHandle = (edge: 'masterEnd' | 'detailEnd', ratio: number) => {
        const handle = doc.createElement('div');
        handle.setAttribute('data-band-handle', edge);
        handle.title = edge === 'masterEnd' ? labels.master : labels.detail;
        handle.style.cssText = [
            'position:absolute',
            `top:${(ratio * 100).toFixed(3)}%`,
            'left:0',
            'right:0',
            'height:10px',
            'margin-top:-5px',
            'cursor:row-resize',
            'pointer-events:auto',
            'z-index:2',
            'background:transparent',
        ].join(';');
        const line = doc.createElement('div');
        line.style.cssText = [
            'position:absolute',
            'left:0',
            'right:0',
            'top:4px',
            'height:2px',
            'background:#0ea5e9',
            'box-shadow:0 0 0 1px rgba(255,255,255,0.7)',
            'pointer-events:none',
        ].join(';');
        const grip = doc.createElement('div');
        grip.style.cssText = [
            'position:absolute',
            'left:50%',
            'top:0',
            'transform:translateX(-50%)',
            'width:36px',
            'height:10px',
            'border-radius:5px',
            'background:#0ea5e9',
            'box-shadow:0 1px 3px rgba(15,23,42,0.25)',
            'pointer-events:none',
        ].join(';');
        handle.appendChild(line);
        handle.appendChild(grip);
        root!.appendChild(handle);
    };

    addHandle('masterEnd', masterEnd);
    addHandle('detailEnd', detailEnd);
}
