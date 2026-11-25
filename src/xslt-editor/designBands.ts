/**
 * Tasarım-zamanı sayfa bantları (üst / orta / alt).
 * Yalnız editör önizlemesinde görünür; XSLT'ye yazılmaz.
 * Bant sınırı sürüklenince çizginin altındaki tüm kök nesneler birlikte kayar.
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
    /** absolute: top; margin: marginTop; padding: paddingTop (tbody/tfoot). */
    kind: 'absolute' | 'margin' | 'padding';
    /** Sürükleme başındaki ilgili stil değeri (px). */
    base: number;
    left: number;
    clientTop: number;
};

const INLINE_TAGS = new Set(['span', 'a', 'b', 'i', 'em', 'strong', 'font', 'label', 'u', 's', 'small', 'sup', 'sub']);

/** Sayfa boyutu kadar büyük sarmalayıcılar (içerik değil, kaydırma kökü olmamalı). */
const isPageSizedWrapper = (el: HTMLElement, page: HTMLElement) => {
    if (el === page) return true;
    const pr = page.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (pr.height < 40 || pr.width < 40) return false;
    return er.width >= pr.width * 0.92
        && er.height >= pr.height * 0.65
        && er.top <= pr.top + 12;
};

/** Satır/hücre → tbody/tfoot (veya tablo); thead üstte kalır, gövde kayar. */
const promoteTablePart = (el: HTMLElement): HTMLElement => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'td' || tag === 'th' || tag === 'tr') {
        const section = el.closest('tbody, tfoot') as HTMLElement | null;
        if (section) return section;
        const table = el.closest('table') as HTMLElement | null;
        if (table) return table;
    }
    if (tag === 'thead') {
        const table = el.closest('table') as HTMLElement | null;
        if (table) return table;
    }
    return el;
};

/**
 * Bant çizgisinin altında kalan taşınabilir öğeler.
 * Önce Y’ye göre filtre, sonra kök seçimi — sayfa kökü her şeyi yutmasın.
 */
export function collectElementsBelowBand(page: HTMLElement, edgeClientY: number): HTMLElement[] {
    const doc = page.ownerDocument;
    const view = doc.defaultView;
    const raw = Array.from(page.querySelectorAll<HTMLElement>('[data-xslt-obj], [data-xsrc], [data-render-index], table, tbody, tfoot'));
    const below: HTMLElement[] = [];
    const seen = new Set<HTMLElement>();
    for (const start of raw) {
        let el = start;
        if (el.id === BAND_OVERLAY_ID || el.closest(`#${BAND_OVERLAY_ID}`)) continue;
        el = promoteTablePart(el);
        if (seen.has(el) || !page.contains(el)) continue;
        if (isPageSizedWrapper(el, page)) continue;
        const r = el.getBoundingClientRect();
        if (r.height < 1 || r.width < 1) continue;
        // Çizginin üstünde başlayanlar kaymaz.
        if (r.top < edgeClientY - 1) continue;

        const pos = el.style.position || view?.getComputedStyle(el).position || '';
        const absolute = pos === 'absolute' || pos === 'fixed';
        if (!absolute) {
            const display = view?.getComputedStyle(el).display || '';
            if (display === 'inline' || display === 'contents') continue;
            if (INLINE_TAGS.has(el.tagName.toLowerCase())) continue;
        }
        seen.add(el);
        below.push(el);
    }

    // Aynı alt-ağaçta yalnız en dış öğeyi tut (çift kaydırma yok).
    const roots = below.filter((el) => !below.some((other) => other !== el && other.contains(el)));

    // Akış (margin) öğelerinde yalnızca en üsttekine margin ver;
    // kardeşlere de margin vermek ikinciyi 2× kaydırır.
    const abs = roots.filter((el) => {
        const pos = el.style.position || view?.getComputedStyle(el).position || '';
        return pos === 'absolute' || pos === 'fixed';
    });
    const flow = roots
        .filter((el) => !abs.includes(el))
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

    const out = [...abs];
    if (flow[0]) out.push(flow[0]);
    return out;
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
        const tag = el.tagName.toLowerCase();
        if (pos === 'absolute' || pos === 'fixed') {
            const top = parseFloat(el.style.top || '') || parseFloat(view?.getComputedStyle(el).top || '') || 0;
            const left = parseFloat(el.style.left || '') || parseFloat(view?.getComputedStyle(el).left || '') || 0;
            out.push({ el, kind: 'absolute', base: top, left, clientTop: r.top });
        } else if (tag === 'tbody' || tag === 'tfoot' || tag === 'thead') {
            // margin tbody'de etkisiz; padding-top satırları iter.
            const pt = parseFloat(el.style.paddingTop || '') || parseFloat(view?.getComputedStyle(el).paddingTop || '') || 0;
            out.push({ el, kind: 'padding', base: pt, left: 0, clientTop: r.top });
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
    for (const s of snaps) {
        const scale = scaleOf(s.el) || 1;
        const next = s.base + deltaClientPx / scale;
        if (s.kind === 'absolute') {
            if (s.el.style.position !== 'absolute' && s.el.style.position !== 'fixed') {
                s.el.style.position = 'absolute';
                s.el.style.left = `${s.left}px`;
            }
            s.el.style.top = `${next}px`;
        } else if (s.kind === 'padding') {
            s.el.style.paddingTop = `${Math.max(0, next)}px`;
        } else {
            s.el.style.marginTop = `${Math.max(0, next)}px`;
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
            'height:14px',
            'margin-top:-7px',
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
            'top:6px',
            'height:2px',
            'background:#0ea5e9',
            'box-shadow:0 0 0 1px rgba(255,255,255,0.7)',
            'pointer-events:none',
        ].join(';');
        const grip = doc.createElement('div');
        grip.style.cssText = [
            'position:absolute',
            'left:50%',
            'top:2px',
            'transform:translateX(-50%)',
            'width:40px',
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
