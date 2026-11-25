/**
 * Çoklu seçili öğeleri birbirine göre hizalar (absolute left/top delta).
 * Öğeler önce absolute + ölçü kilitli olmalı (çağıran pinAbsolute/freeze yapar).
 */
export type AlignKind = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

export type AlignDelta = { el: HTMLElement; left: number; top: number };

/** Ekran birimini CSS px'e çeviren ölçek (zoom). */
function scaleOf(el: HTMLElement): number {
    const view = el.ownerDocument.defaultView;
    const prev = el.style.left;
    const base = parseFloat(view?.getComputedStyle(el).left || '') || 0;
    const a = el.getBoundingClientRect().left;
    el.style.left = `${base + 100}px`;
    const b = el.getBoundingClientRect().left;
    el.style.left = prev;
    return (b - a) / 100 || 1;
}

/**
 * Seçili öğelerin stillerindeki left/top değerlerini hizaya göre günceller.
 * Dönen listedeki left/top yeni CSS px değerleridir (commit için).
 */
export function computeAlignDeltas(els: HTMLElement[], kind: AlignKind): AlignDelta[] {
    if (els.length < 2) return [];
    const boxes = els.map((el) => {
        const r = el.getBoundingClientRect();
        const scale = scaleOf(el);
        const left = parseFloat(el.style.left) || 0;
        const top = parseFloat(el.style.top) || 0;
        return { el, r, scale, left, top };
    });
    const minL = Math.min(...boxes.map((b) => b.r.left));
    const maxR = Math.max(...boxes.map((b) => b.r.right));
    const minT = Math.min(...boxes.map((b) => b.r.top));
    const maxB = Math.max(...boxes.map((b) => b.r.bottom));
    const midX = (minL + maxR) / 2;
    const midY = (minT + maxB) / 2;

    return boxes.map((b) => {
        let dLeft = 0;
        let dTop = 0;
        if (kind === 'left') dLeft = (minL - b.r.left) / b.scale;
        else if (kind === 'right') dLeft = (maxR - b.r.right) / b.scale;
        else if (kind === 'center') dLeft = (midX - (b.r.left + b.r.width / 2)) / b.scale;
        else if (kind === 'top') dTop = (minT - b.r.top) / b.scale;
        else if (kind === 'bottom') dTop = (maxB - b.r.bottom) / b.scale;
        else if (kind === 'middle') dTop = (midY - (b.r.top + b.r.height / 2)) / b.scale;
        const left = Math.round((b.left + dLeft) * 100) / 100;
        const top = Math.round((b.top + dTop) * 100) / 100;
        b.el.style.left = `${left}px`;
        b.el.style.top = `${top}px`;
        return { el: b.el, left, top };
    });
}
