/**
 * Tasarım-zamanı sayfa bantları (üst / orta / alt).
 * Yalnız editör önizlemesinde görünür; XSLT'ye yazılmaz.
 * Bant çizgisi sürüklenince çizginin altındaki tüm kök öğeler birlikte kayar.
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
        /* ignore quota */
    }
}

export const BAND_OVERLAY_ID = '__xslt-design-bands';

export type BandShiftSnapshot = {
    el: HTMLElement;
    kind: 'absolute' | 'transform';
    /** Sürükleme başındaki top (absolute) veya birikmiş translateY (transform). */
    base: number;
    left: number;
    clientTop: number;
};

const SKIP_TAGS = new Set([
    'script', 'style', 'link', 'meta', 'br', 'hr', 'col', 'colgroup',
    'head', 'title', 'noscript',
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
    if (m) return parseFloat(m[1]) || 0;
    const view = el.ownerDocument.defaultView;
    const cs = view?.getComputedStyle(el).transform;
    if (cs && cs !== 'none') {
        const parts = cs.match(/matrix\(([^)]+)\)/);
        if (parts) {
            const nums = parts[1].split(',').map((x) => parseFloat(x.trim()));
            if (nums.length >= 6) return nums[5] || 0;
        }
    }
    return 0;
};

/**
 * Çizginin altında başlayan tüm kök DOM öğeleri.
 * Tablo satırları dahil — tbody’ye yükseltmez (yükseltince üst satırlar da kayardı / aday kaybolurdu).
 */
export function collectElementsBelowBand(page: HTMLElement, edgeClientY: number): HTMLElement[] {
    const below: HTMLElement[] = [];
    const walk = (node: Element) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.id === BAND_OVERLAY_ID || node.closest(`#${BAND_OVERLAY_ID}`)) return;
        const tag = node.tagName.toLowerCase();
        if (SKIP_TAGS.has(tag)) return;
        if (isPageSizedWrapper(node, page)) {
            Array.from(node.children).forEach(walk);
            return;
        }
        const r = node.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) {
            Array.from(node.children).forEach(walk);
            return;
        }
        if (r.top >= edgeClientY - 1) {
            below.push(node);
            return; // çocuklar bu kök ile birlikte kayacak
        }
        // Üstü çizginin üstünde → çocuklara in (çizgiyi kesen tablo/div)
        Array.from(node.children).forEach(walk);
    };
    Array.from(page.children).forEach(walk);

    return below.filter((el) => !below.some((other) => other !== el && other.contains(el)));
}

export function snapshotBandShiftTargets(
    page: HTMLElement,
    edgeClientY: number,
): BandShiftSnapshot[] {
    const view = page.ownerDocument.defaultView;
    const out: BandShiftSnapshot[] = [];
    for (const el of collectElementsBelowBand(page, edgeClientY)) {
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

/** Sürükleme boyunca anlık kaydırma (henüz XSLT’ye yazılmaz). */
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
            s.el.style.transform = '';
        } else {
            // transform: satır/div/tablo — margin’in işlemediği yerlerde de çalışır
            const existing = (s.el.style.transform || '').replace(/translateY\(\s*-?[\d.]+px\s*\)\s*/g, '').trim();
            const ty = `translateY(${next}px)`;
            s.el.style.transform = existing ? `${existing} ${ty}` : ty;
        }
    }
}

/** Sürükleme bitince transform’u temizleyip kalıcı top/margin’e çevirmeden önce okunur. */
export function readBandShiftAppliedPx(s: BandShiftSnapshot, scaleOf: (el: HTMLElement) => number): number {
    const scale = scaleOf(s.el) || 1;
    if (s.kind === 'absolute') {
        const top = parseFloat(s.el.style.top) || 0;
        return (top - s.base) * scale;
    }
    return (readTranslateY(s.el) - s.base) * scale;
}

/**
 * Sayfa kutusunun üzerine tasarım-only bant katmanını çizer.
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
        'overflow:visible',
        'font-family:system-ui,sans-serif',
    ].join(';');

    const bands: { id: DesignBandId; top: number; height: number; color: string }[] = [
        { id: 'master', top: 0, height: masterEnd, color: 'rgba(14, 165, 233, 0.05)' },
        { id: 'detail', top: masterEnd, height: detailEnd - masterEnd, color: 'rgba(16, 185, 129, 0.05)' },
        { id: 'footer', top: detailEnd, height: 1 - detailEnd, color: 'rgba(245, 158, 11, 0.06)' },
    ];

    // Sürükleme sırasında tüm overlay’i silmek handle’ı kaçırır — tutamaçları koru, konum güncelle.
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

    bandLayer.innerHTML = '';
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
                'height:16px',
                'margin-top:-8px',
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
                'top:7px',
                'height:2px',
                'background:#0ea5e9',
                'box-shadow:0 0 0 1px rgba(255,255,255,0.7)',
                'pointer-events:none',
            ].join(';');
            const grip = doc.createElement('div');
            grip.style.cssText = [
                'position:absolute',
                'left:50%',
                'top:3px',
                'transform:translateX(-50%)',
                'width:44px',
                'height:10px',
                'border-radius:5px',
                'background:#0ea5e9',
                'box-shadow:0 1px 3px rgba(15,23,42,0.25)',
                'pointer-events:none',
            ].join(';');
            handle.appendChild(line);
            handle.appendChild(grip);
            handleLayer!.appendChild(handle);
        }
        handle.style.top = `${(ratio * 100).toFixed(3)}%`;
    };

    ensureHandle('masterEnd', masterEnd);
    ensureHandle('detailEnd', detailEnd);
}
