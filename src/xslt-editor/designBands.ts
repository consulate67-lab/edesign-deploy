/**
 * Tasarım-zamanı sayfa bantları (üst / orta / alt).
 * Yalnız editör önizlemesinde görünür; XSLT'ye yazılmaz.
 * Çizgi tutamacı Pointer Capture ile sürülür; altındaki kökler translateY/top ile kayar.
 */

export type DesignBandId = 'master' | 'detail' | 'footer';

export type DesignBandLayout = {
    masterEnd: number;
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
        /* ignore */
    }
}

export const BAND_OVERLAY_ID = '__xslt-design-bands';

export type BandShiftSnapshot = {
    el: HTMLElement;
    kind: 'absolute' | 'transform';
    base: number;
    left: number;
    clientTop: number;
};

export type BandOverlayHandlers = {
    getLayout: () => DesignBandLayout;
    /** Sürükleme sırasında (React state yazmadan) layout ref güncellemesi. */
    setLayoutLive: (layout: DesignBandLayout) => void;
    /** Bırakınca: React state + XSLT commit. */
    onDragEnd: (layout: DesignBandLayout, snaps: BandShiftSnapshot[]) => void;
    /** CSS px / ekran px oranı (zoom). */
    scaleOf: (el: HTMLElement) => number;
};

const SKIP_TAGS = new Set([
    'script', 'style', 'link', 'meta', 'br', 'hr', 'col', 'colgroup',
    'head', 'title', 'noscript', 'html', 'body',
]);

const isPageSizedWrapper = (el: HTMLElement, page: HTMLElement) => {
    if (el === page) return true;
    const pr = page.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (pr.height < 40 || pr.width < 40) return false;
    return er.width >= pr.width * 0.92
        && er.height >= pr.height * 0.65
        && er.top <= pr.top + 12;
};

const readTranslateY = (el: HTMLElement): number => {
    const t = el.style.transform || '';
    const m = t.match(/translateY\(\s*(-?[\d.]+)px\s*\)/);
    return m ? (parseFloat(m[1]) || 0) : 0;
};

/** Çizginin altında başlayan kök öğeler (tablo satırları dahil). */
export function collectElementsBelowBand(root: HTMLElement, edgeClientY: number): HTMLElement[] {
    const found: HTMLElement[] = [];
    const consider = (el: HTMLElement) => {
        if (el.id === BAND_OVERLAY_ID || el.closest(`#${BAND_OVERLAY_ID}`)) return;
        if (SKIP_TAGS.has(el.tagName.toLowerCase())) return;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return;
        if (r.top >= edgeClientY - 0.5) found.push(el);
    };

    const walk = (node: Element) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.id === BAND_OVERLAY_ID || node.closest(`#${BAND_OVERLAY_ID}`)) return;
        const tag = node.tagName.toLowerCase();
        if (SKIP_TAGS.has(tag)) return;
        if (isPageSizedWrapper(node, root)) {
            Array.from(node.children).forEach(walk);
            return;
        }
        const r = node.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) {
            Array.from(node.children).forEach(walk);
            return;
        }
        if (r.top >= edgeClientY - 0.5) {
            found.push(node);
            return;
        }
        Array.from(node.children).forEach(walk);
    };
    walk(root);

    // Ek güvence: tasarım objeleri / xsrc / satırlar
    root.querySelectorAll<HTMLElement>('[data-xslt-obj], [data-xsrc], [data-render-index], tr, table, img').forEach(consider);

    const uniq = [...new Set(found)].filter((el) => el !== root && !isPageSizedWrapper(el, root));
    return uniq.filter((el) => !uniq.some((o) => o !== el && o.contains(el)));
}

export function snapshotBandShiftTargets(root: HTMLElement, edgeClientY: number): BandShiftSnapshot[] {
    const view = root.ownerDocument.defaultView;
    const out: BandShiftSnapshot[] = [];
    for (const el of collectElementsBelowBand(root, edgeClientY)) {
        const r = el.getBoundingClientRect();
        const pos = el.style.position || view?.getComputedStyle(el).position || '';
        if (pos === 'absolute' || pos === 'fixed') {
            const top = parseFloat(el.style.top || '') || parseFloat(view?.getComputedStyle(el).top || '') || 0;
            const left = parseFloat(el.style.left || '') || parseFloat(view?.getComputedStyle(el).left || '') || 0;
            out.push({ el, kind: 'absolute', base: top, left, clientTop: r.top });
        } else {
            out.push({ el, kind: 'transform', base: readTranslateY(el), left: 0, clientTop: r.top });
        }
    }
    return out;
}

export function applyBandShiftDelta(
    snaps: BandShiftSnapshot[],
    deltaClientPx: number,
    scaleOf: (el: HTMLElement) => number,
): void {
    for (const s of snaps) {
        const scale = scaleOf(s.el) || 1;
        const next = s.base + deltaClientPx / scale;
        if (s.kind === 'absolute') {
            if (s.el.style.position !== 'absolute' && s.el.style.position !== 'fixed') {
                s.el.style.position = 'absolute';
                s.el.style.left = `${s.left}px`;
            }
            s.el.style.top = `${next}px`;
            // Eski translate kalmasın
            s.el.style.transform = (s.el.style.transform || '').replace(/translateY\(\s*-?[\d.]+px\s*\)\s*/g, '').trim();
        } else {
            const rest = (s.el.style.transform || '').replace(/translateY\(\s*-?[\d.]+px\s*\)\s*/g, '').trim();
            const ty = `translateY(${next}px)`;
            s.el.style.transform = rest ? `${rest} ${ty}` : ty;
        }
    }
}

type ActiveBandDrag = {
    edge: 'masterEnd' | 'detailEnd';
    pageTop: number;
    pageH: number;
    startRatio: number;
    snaps: BandShiftSnapshot[];
    pointerId: number;
    handle: HTMLElement;
};

let activeDrag: ActiveBandDrag | null = null;
let boundHandlers: BandOverlayHandlers | null = null;

const finishDrag = () => {
    const d = activeDrag;
    activeDrag = null;
    if (!d || !boundHandlers) return;
    const layout = boundHandlers.getLayout();
    boundHandlers.onDragEnd(layout, d.snaps);
};

const onHandlePointerMove = (e: PointerEvent) => {
    if (!activeDrag || !boundHandlers) return;
    if (e.pointerId !== activeDrag.pointerId) return;
    const raw = (e.clientY - activeDrag.pageTop) / activeDrag.pageH;
    const cur = boundHandlers.getLayout();
    const draft = clampBandLayout(
        activeDrag.edge === 'masterEnd'
            ? { masterEnd: raw, detailEnd: cur.detailEnd }
            : { masterEnd: cur.masterEnd, detailEnd: raw },
    );
    const ratio = activeDrag.edge === 'masterEnd' ? draft.masterEnd : draft.detailEnd;
    const deltaClient = (ratio - activeDrag.startRatio) * activeDrag.pageH;
    applyBandShiftDelta(activeDrag.snaps, deltaClient, boundHandlers.scaleOf);
    boundHandlers.setLayoutLive(draft);
    // Tutamacı canlı güncelle
    activeDrag.handle.style.top = `${(ratio * 100).toFixed(3)}%`;
    const bandEl = activeDrag.handle.ownerDocument.getElementById(BAND_OVERLAY_ID);
    if (bandEl) {
        const layers = bandEl.querySelector('[data-band-layers]') as HTMLElement | null;
        if (layers) {
            // Bant boyamalarını güncelle
            const labels = {
                master: layers.querySelector('[data-band="master"] span')?.textContent || '',
                detail: layers.querySelector('[data-band="detail"] span')?.textContent || '',
                footer: layers.querySelector('[data-band="footer"] span')?.textContent || '',
            };
            void labels;
            const master = layers.querySelector('[data-band="master"]') as HTMLElement | null;
            const detail = layers.querySelector('[data-band="detail"]') as HTMLElement | null;
            const footer = layers.querySelector('[data-band="footer"]') as HTMLElement | null;
            if (master) {
                master.style.top = '0%';
                master.style.height = `${(draft.masterEnd * 100).toFixed(3)}%`;
            }
            if (detail) {
                detail.style.top = `${(draft.masterEnd * 100).toFixed(3)}%`;
                detail.style.height = `${((draft.detailEnd - draft.masterEnd) * 100).toFixed(3)}%`;
            }
            if (footer) {
                footer.style.top = `${(draft.detailEnd * 100).toFixed(3)}%`;
                footer.style.height = `${((1 - draft.detailEnd) * 100).toFixed(3)}%`;
            }
        }
        const other = bandEl.querySelector(
            `[data-band-handle="${activeDrag.edge === 'masterEnd' ? 'detailEnd' : 'masterEnd'}"]`,
        ) as HTMLElement | null;
        if (other) {
            const otherRatio = activeDrag.edge === 'masterEnd' ? draft.detailEnd : draft.masterEnd;
            other.style.top = `${(otherRatio * 100).toFixed(3)}%`;
        }
    }
    e.preventDefault();
};

const onHandlePointerUp = (e: PointerEvent) => {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;
    try { activeDrag.handle.releasePointerCapture(e.pointerId); } catch { /* */ }
    activeDrag.handle.removeEventListener('pointermove', onHandlePointerMove);
    activeDrag.handle.removeEventListener('pointerup', onHandlePointerUp);
    activeDrag.handle.removeEventListener('pointercancel', onHandlePointerUp);
    finishDrag();
};

/**
 * Sayfa üzerine bant katmanı çizer ve tutamaçlara pointer sürüklemeyi bağlar.
 */
export function syncDesignBandOverlay(
    page: HTMLElement | null,
    layout: DesignBandLayout,
    labels: Record<DesignBandId, string>,
    visible: boolean,
    handlers?: BandOverlayHandlers | null,
): void {
    const doc = page?.ownerDocument;
    let root = doc?.getElementById(BAND_OVERLAY_ID) as HTMLElement | null;
    if (!visible || !page || !doc) {
        root?.remove();
        boundHandlers = null;
        return;
    }
    if (handlers) boundHandlers = handlers;

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
        'overflow:visible',
        'font-family:system-ui,sans-serif',
    ].join(';');

    let bandLayer = root.querySelector('[data-band-layers]') as HTMLElement | null;
    let handleLayer = root.querySelector('[data-band-handles]') as HTMLElement | null;
    if (!bandLayer || !handleLayer) {
        root.innerHTML = '';
        bandLayer = doc.createElement('div');
        bandLayer.setAttribute('data-band-layers', '');
        bandLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
        handleLayer = doc.createElement('div');
        handleLayer.setAttribute('data-band-handles', '');
        handleLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
        root.appendChild(bandLayer);
        root.appendChild(handleLayer);
    }

    // Sürükleme sırasında katmanları yeniden yazma (tutamacı kaçırmayalım)
    if (!activeDrag) {
        bandLayer.innerHTML = '';
        const bands: { id: DesignBandId; top: number; height: number; color: string }[] = [
            { id: 'master', top: 0, height: masterEnd, color: 'rgba(14, 165, 233, 0.05)' },
            { id: 'detail', top: masterEnd, height: detailEnd - masterEnd, color: 'rgba(16, 185, 129, 0.05)' },
            { id: 'footer', top: detailEnd, height: 1 - detailEnd, color: 'rgba(245, 158, 11, 0.06)' },
        ];
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
                'opacity:0.85',
            ].join(';');
            el.appendChild(tag);
            bandLayer.appendChild(el);
        }
    }

    const ensureHandle = (edge: 'masterEnd' | 'detailEnd', ratio: number) => {
        let handle = handleLayer!.querySelector(`[data-band-handle="${edge}"]`) as HTMLElement | null;
        if (!handle) {
            handle = doc.createElement('div');
            handle.setAttribute('data-band-handle', edge);
            handle.title = edge === 'masterEnd' ? labels.master : labels.detail;
            handle.style.cssText = [
                'position:absolute',
                'left:0',
                'right:0',
                'height:18px',
                'margin-top:-9px',
                'cursor:row-resize',
                'pointer-events:auto',
                'touch-action:none',
                'z-index:5',
                'background:transparent',
            ].join(';');
            const line = doc.createElement('div');
            line.style.cssText = [
                'position:absolute',
                'left:0',
                'right:0',
                'top:8px',
                'height:2px',
                'background:#0ea5e9',
                'box-shadow:0 0 0 1px rgba(255,255,255,0.7)',
                'pointer-events:none',
            ].join(';');
            const grip = doc.createElement('div');
            grip.style.cssText = [
                'position:absolute',
                'left:50%',
                'top:4px',
                'transform:translateX(-50%)',
                'width:48px',
                'height:10px',
                'border-radius:5px',
                'background:#0ea5e9',
                'box-shadow:0 1px 3px rgba(15,23,42,0.25)',
                'pointer-events:none',
            ].join(';');
            handle.appendChild(line);
            handle.appendChild(grip);
            handleLayer!.appendChild(handle);

            handle.addEventListener('pointerdown', (e: PointerEvent) => {
                if (e.button !== 0 || !boundHandlers || activeDrag) return;
                const pageEl = page;
                const pr = pageEl.getBoundingClientRect();
                if (pr.height <= 0) return;
                e.preventDefault();
                e.stopPropagation();
                const startRatio = edge === 'masterEnd'
                    ? boundHandlers.getLayout().masterEnd
                    : boundHandlers.getLayout().detailEnd;
                const edgeY = pr.top + startRatio * pr.height;
                let snaps = snapshotBandShiftTargets(pageEl, edgeY);
                if (!snaps.length && doc.body) {
                    snaps = snapshotBandShiftTargets(doc.body, edgeY);
                }
                activeDrag = {
                    edge,
                    pageTop: pr.top,
                    pageH: pr.height,
                    startRatio,
                    snaps,
                    pointerId: e.pointerId,
                    handle: handle!,
                };
                try { handle!.setPointerCapture(e.pointerId); } catch { /* */ }
                handle!.addEventListener('pointermove', onHandlePointerMove);
                handle!.addEventListener('pointerup', onHandlePointerUp);
                handle!.addEventListener('pointercancel', onHandlePointerUp);
            });
        }
        if (!activeDrag || activeDrag.edge !== edge) {
            handle.style.top = `${(ratio * 100).toFixed(3)}%`;
        }
        handle.title = edge === 'masterEnd' ? labels.master : labels.detail;
    };

    ensureHandle('masterEnd', masterEnd);
    ensureHandle('detailEnd', detailEnd);
}
