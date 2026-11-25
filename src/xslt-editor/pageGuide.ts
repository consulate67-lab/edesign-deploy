/**
 * A4 sayfa rehberi — yalnız editör önizlemesi.
 * Yazdırma motorları için XSLT tarafında @page ayrı sağlanır (gibCompliance /
 * ensurePrintPageRules); burada yükseklik zorlanmaz (çok sayfalı fatura büyüyebilir).
 */

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_GUIDE_ID = '__xslt-a4-guide';

const measureMmPx = (doc: Document, mm: number): number => {
    const probe = doc.createElement('div');
    probe.style.cssText = `position:absolute;left:-9999px;top:0;height:${mm}mm;width:0;visibility:hidden;pointer-events:none;`;
    doc.body.appendChild(probe);
    const px = probe.offsetHeight || Math.round(mm * (96 / 25.4));
    probe.remove();
    return px || 1;
};

/**
 * Sayfa kutusunun üzerine A4 çerçevesi + sayfa kırılım çizgileri çizer.
 * pointer-events:none — tasarımı etkilemez, XSLT’ye yazılmaz.
 */
export function syncA4PageGuide(page: HTMLElement | null, visible: boolean): void {
    const doc = page?.ownerDocument;
    let root = doc?.getElementById(A4_GUIDE_ID) as HTMLElement | null;
    if (!visible || !page || !doc?.body) {
        root?.remove();
        return;
    }

    const cs = doc.defaultView?.getComputedStyle(page);
    if (cs && cs.position === 'static') page.style.position = 'relative';

    if (!root) {
        root = doc.createElement('div');
        root.id = A4_GUIDE_ID;
        root.setAttribute('data-a4-guide', '');
        page.appendChild(root);
    } else if (root.parentElement !== page) {
        page.appendChild(root);
    }

    const pagePx = measureMmPx(doc, A4_HEIGHT_MM);
    const contentH = Math.max(page.scrollHeight, page.getBoundingClientRect().height, pagePx);
    const pageCount = Math.max(1, Math.ceil(contentH / pagePx - 0.02));

    root.style.cssText = [
        'position:absolute',
        'left:0',
        'top:0',
        `width:${A4_WIDTH_MM}mm`,
        `height:${pageCount * A4_HEIGHT_MM}mm`,
        'max-width:100%',
        'box-sizing:border-box',
        'pointer-events:none',
        'z-index:2147482000',
        'border:1.5px dashed #64748b',
        'box-shadow:0 0 0 1px rgba(255,255,255,0.6), inset 0 0 0 1px rgba(100,116,139,0.15)',
        'background:transparent',
        'overflow:visible',
    ].join(';');

    root.innerHTML = '';

    const label = doc.createElement('span');
    label.textContent = `A4 · ${A4_WIDTH_MM}×${A4_HEIGHT_MM} mm`;
    label.style.cssText = [
        'position:absolute',
        'top:4px',
        'left:6px',
        'padding:1px 6px',
        'border-radius:3px',
        'font:700 9px/14px system-ui,sans-serif',
        'letter-spacing:0.3px',
        'color:#475569',
        'background:rgba(255,255,255,0.88)',
        'border:1px solid rgba(148,163,184,0.55)',
        'pointer-events:none',
        'user-select:none',
    ].join(';');
    root.appendChild(label);

    for (let i = 1; i < pageCount; i++) {
        const cut = doc.createElement('div');
        cut.setAttribute('data-a4-break', String(i + 1));
        cut.style.cssText = [
            'position:absolute',
            'left:0',
            'right:0',
            `top:${i * A4_HEIGHT_MM}mm`,
            'height:0',
            'border-top:1.5px dashed #f59e0b',
            'pointer-events:none',
        ].join(';');
        const pg = doc.createElement('span');
        pg.textContent = `Sayfa ${i + 1}`;
        pg.style.cssText = [
            'position:absolute',
            'top:-14px',
            'right:6px',
            'padding:0 5px',
            'font:700 8px/12px system-ui,sans-serif',
            'color:#b45309',
            'background:rgba(255,255,255,0.9)',
            'border:1px solid rgba(245,158,11,0.45)',
            'border-radius:3px',
        ].join(';');
        cut.appendChild(pg);
        root.appendChild(cut);
    }
}
