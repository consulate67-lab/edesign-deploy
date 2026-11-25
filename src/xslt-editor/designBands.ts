/**
 * Tasarım-zamanı sayfa bantları (Master / Detay / Sayfa sonu).
 * Yalnız editör önizlemesinde görünür; XSLT'ye yazılmaz.
 */
import { isLineField, type CatalogField } from './fieldCatalog';

export type DesignBandId = 'master' | 'detail' | 'footer';

/** Sayfa yüksekliğine göre oranlar; master üstten, detail ortada, footer kalan. */
export type DesignBandLayout = {
    /** Master bandının alt sınırı (0–1, sayfa yüksekliği oranı). */
    masterEnd: number;
    /** Detay bandının alt sınırı (masterEnd–1). */
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

const FOOTER_PATH_RE =
    /\/(LegalMonetaryTotal|TaxTotal|WithholdingTaxTotal|PaymentMeans|PaymentTerms|PricingExchangeRate|TaxCurrencyCode|PricingCurrencyCode|AllowanceCharge)\b/;

const FOOTER_CATEGORY_RE =
    /^(Tutarlar|Vergiler|Vergi Türleri|Ödeme|Döviz\s*\/\s*Kur|Kesintiler|Totals|Taxes|Payment|Currency)/i;

/** Katalog alanını tasarım bandına yerleştirir (sol panel gruplaması). */
export function catalogBandOf(f: CatalogField): DesignBandId {
    if (isLineField(f)) return 'detail';
    if (FOOTER_PATH_RE.test(f.path)) return 'footer';
    if (/^Satır\b/i.test(f.category) || /\b(Line|Kalem|Item)\b/i.test(f.category)) return 'detail';
    if (FOOTER_CATEGORY_RE.test(f.category)) return 'footer';
    return 'master';
}

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
        { id: 'master', top: 0, height: masterEnd, color: 'rgba(14, 165, 233, 0.07)' },
        { id: 'detail', top: masterEnd, height: detailEnd - masterEnd, color: 'rgba(16, 185, 129, 0.07)' },
        { id: 'footer', top: detailEnd, height: 1 - detailEnd, color: 'rgba(245, 158, 11, 0.08)' },
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
            'border-bottom:1px dashed rgba(100,116,139,0.45)',
            'box-sizing:border-box',
            'pointer-events:none',
        ].join(';');
        const tag = doc.createElement('span');
        tag.textContent = labels[b.id];
        tag.style.cssText = [
            'position:absolute',
            'top:4px',
            'left:6px',
            'padding:1px 6px',
            'border-radius:3px',
            'font:700 9px/14px system-ui,sans-serif',
            'letter-spacing:0.3px',
            'text-transform:uppercase',
            'color:#334155',
            'background:rgba(255,255,255,0.82)',
            'border:1px solid rgba(148,163,184,0.55)',
            'pointer-events:none',
            'user-select:none',
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
