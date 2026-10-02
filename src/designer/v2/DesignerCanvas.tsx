/**
 * Designer 2.0 — Canvas (Sprint 2 Aşama 2 — A4 + Serbest Resize)
 *
 * Phase 17.1: click-to-place gerçek davranış eklendi.
 * Phase 17.3: iframe.srcDoc = browser-side XSLTProcessor render çıktısı.
 * Phase 18.1: iframe içi inline edit (contenteditable).
 * Phase A.1: renderIndex ↔ element id eşlemesi.
 *
 * Sprint 2 Aşama 2 (2026-10-02): A4 default (794×1123px @96dpi) + 4 köşe resize
 *   - Serbest resize: kullanıcı köşelerden sürükleyerek istediği boyutu ayarlar
 *   - Boyut göstergesi: "210×297 mm (794×1123 px)" A4 sheet sol üst köşede
 *   - state.canvasWidth/canvasHeight, ds.setCanvasSize action
 *   - min 200×200 snap-to-grid (5px) snapToGrid true ise
 */
import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import type { DesignerStateV2 } from './hooks/useDesignerState';
import type { DesignElement, SectionId } from '../../types.ts';
import { renderXslt } from './utils/xsltRender';
import { isReadonlyField } from '../../readonlyFields';

interface DesignerCanvasProps {
    state: DesignerStateV2;
    onPlaceElement: (element: DesignElement, sectionId?: SectionId) => void;
    /**
     * Phase 18.1 — iframe içi inline editing bildirimi.
     * Kullanıcı iframe'de bir element'e çift tıklayıp düzenlediğinde çağrılır.
     */
    onInlineEdit?: (info: { renderIndex: number; originalText: string; newText: string; tagName: string }) => void;
    /**
     * Phase A.1 — iframe click → sections element seç (renderIndex üzerinden).
     */
    onSelectElement?: (renderIndex: number) => void;
    /**
     * Sprint 2 Aşama 2 — köşe resize sonucu çağrılır (width, height px).
     */
    onCanvasResize?: (width: number, height: number) => void;
    /**
     * Sprint 2 Aşama 2 — A4 default'a sıfırlama.
     */
    onCanvasReset?: () => void;
}

export const DesignerCanvas: React.FC<DesignerCanvasProps> = ({
    state,
    onPlaceElement,
    onInlineEdit,
    onSelectElement,
    onCanvasResize,
    onCanvasReset,
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    /** Sprint 2 Aşama 4 — son drop zamanı (click çakışması önleme). */
    const lastDropTimeRef = useRef<number>(0);

    /**
     * Phase 17.3 — XSLT render.
     * state.currentXslt + state.currentXml → renderXslt() → HTML string.
     * XSLT yoksa placeholder HTML göster.
     */
    const renderResult = useMemo(() => {
        if (!state.currentXslt) {
            return { html: buildPlaceholderHtml(state), error: null, durationMs: 0 };
        }
        return renderXslt(state.currentXslt, state.currentXml);
    }, [state.currentXslt, state.currentXml, state.activeSectionId]);

    /**
     * Phase 17.1: Tıkla-yerleştir implementasyonu.
     * - state.activeTool bir element tipini belirler
     * - Sadece boş alana tıklanırsa çalışır (A4 sheet içi, köşeler ve iframe tıklaması değil)
     * - snap-to-grid true ise gridSize'a yuvarlanır
     * - Drop sonrası 250ms içinde gelen click skip edilir (drag-drop çakışma önleme)
     */
    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // Sprint 2 Aşama 4 — drop'tan hemen sonra gelen click'i skip et
        if (Date.now() - lastDropTimeRef.current < 250) return;
        if (state.activeTool === 'select') return;
        if (e.target !== e.currentTarget) return;

        // Tıklama noktası canvas container içinde mi?
        const containerRect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - containerRect.left + canvasRef.current!.scrollLeft;
        const y = e.clientY - containerRect.top + canvasRef.current!.scrollTop;

        // Boş alan (A4 sheet dışı) tıklamaları da kabul et
        let finalX = x;
        let finalY = y;
        if (state.snapToGrid) {
            finalX = Math.round(x / state.gridSize) * state.gridSize;
            finalY = Math.round(y / state.gridSize) * state.gridSize;
        }

        const id = `${state.activeTool}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const el: DesignElement = buildElementForTool(state.activeTool, id, finalX, finalY);
        onPlaceElement(el);
    }, [state.activeTool, state.snapToGrid, state.gridSize, onPlaceElement]);

    /**
     * Sprint 4 Aşama 1 — HTML5 drag-drop: XML alanını canvas'a bırak.
     * drop event → alan path parse → text element oluştur (binding=path, content=alan adı).
     * Drop Y koordinatına göre section otomatik hesaplanır (5 orantılı bant).
     * Drop koordinatı A4 sheet'in içine clamp edilir (sheet dışına taşmasın).
     * snap-to-grid uygulanır.
     */
    const [hoverSectionId, setHoverSectionId] = React.useState<SectionId | null>(null);

    /**
     * Drop Y koordinatına göre sectionId hesapla (5 orantılı bant).
     * 0-20% → reportHeader
     * 20-40% → partyHeader
     * 40-70% → masterData
     * 70-85% → totals
     * 85-100% → reportFooter
     */
    const inferSectionFromY = useCallback((y: number): SectionId => {
        const h = state.canvasHeight;
        const ratio = Math.max(0, Math.min(1, y / h));
        if (ratio < 0.20) return 'reportHeader';
        if (ratio < 0.40) return 'partyHeader';
        if (ratio < 0.70) return 'masterData';
        if (ratio < 0.85) return 'totals';
        return 'reportFooter';
    }, [state.canvasHeight]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        if (e.dataTransfer.types.includes('application/json') || e.dataTransfer.types.includes('text/x-ubl-field')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';

            // Hover sırasında aktif section'ı hesapla (kullanıcıya görsel feedback)
            const containerRect = canvasRef.current!.getBoundingClientRect();
            const y = e.clientY - containerRect.top + canvasRef.current!.scrollTop - 32;
            const clampedY = Math.max(0, Math.min(y, state.canvasHeight));
            const sectionId = inferSectionFromY(clampedY);
            if (sectionId !== hoverSectionId) {
                setHoverSectionId(sectionId);
            }
        }
    }, [state.canvasHeight, inferSectionFromY, hoverSectionId]);

    const handleDragLeave = useCallback(() => {
        setHoverSectionId(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        lastDropTimeRef.current = Date.now();

        let field: { name: string; path: string; isNumeric?: boolean } | null = null;
        const json = e.dataTransfer.getData('application/json');
        if (json) {
            try {
                field = JSON.parse(json);
            } catch (err) {
                console.error('[DesignerCanvas] drop JSON parse error:', err);
            }
        }

        // Readonly alanları kabul etme
        if (!field || isReadonlyField(field.path)) return;

        // Drop koordinatı canvas container'a göre
        const containerRect = canvasRef.current!.getBoundingClientRect();
        let x = e.clientX - containerRect.left + canvasRef.current!.scrollLeft - 32; /* margin auto (32px) */
        let y = e.clientY - containerRect.top + canvasRef.current!.scrollTop - 32;

        // A4 sheet sınırları içinde clamp (0..canvasWidth, 0..canvasHeight)
        x = Math.max(0, Math.min(x, state.canvasWidth));
        y = Math.max(0, Math.min(y, state.canvasHeight));

        // Snap-to-grid
        if (state.snapToGrid) {
            x = Math.round(x / state.gridSize) * state.gridSize;
            y = Math.round(y / state.gridSize) * state.gridSize;
        }

        // Section otomatik hesapla (Y koordinatına göre)
        const targetSectionId = inferSectionFromY(y);
        setHoverSectionId(null);

        const id = `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const el: DesignElement = {
            id,
            type: 'text',
            x,
            y,
            width: 200,
            height: 30,
            content: field.name,
            binding: field.path,
            style: {
                fontSize: '14px',
                color: '#000',
                fontFamily: 'system-ui, sans-serif',
            },
            sectionId: targetSectionId,
        } as DesignElement;
        // onPlaceElement signature: (element) — DesignerApp handlePlaceElement uses activeSectionId
        // Caller (DesignerApp) needs section override; use new callback with sectionId
        onPlaceElement(el, targetSectionId);
    }, [state.canvasWidth, state.canvasHeight, state.snapToGrid, state.gridSize, onPlaceElement, inferSectionFromY]);

    /**
     * Sprint 2 Aşama 2 — köşe resize drag handler.
     * Mousedown ile başlar, document mousemove/mouseup ile devam eder.
     * Köşe yönüne göre genişlik/yükseklik ayarlanır, snap-to-grid uygulanır.
     */
    const handleResizeStart = useCallback(
        (corner: 'nw' | 'ne' | 'sw' | 'se', e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const startW = state.canvasWidth;
            const startH = state.canvasHeight;

            const onMove = (ev: MouseEvent) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                let newW = startW;
                let newH = startH;
                if (corner === 'nw') { newW = startW - dx; newH = startH - dy; }
                else if (corner === 'ne') { newW = startW + dx; newH = startH - dy; }
                else if (corner === 'sw') { newW = startW - dx; newH = startH + dy; }
                else if (corner === 'se') { newW = startW + dx; newH = startH + dy; }

                // min 200×200
                newW = Math.max(200, newW);
                newH = Math.max(200, newH);

                if (state.snapToGrid) {
                    newW = Math.round(newW / state.gridSize) * state.gridSize;
                    newH = Math.round(newH / state.gridSize) * state.gridSize;
                }
                onCanvasResize?.(newW, newH);
            };

            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        },
        [state.canvasWidth, state.canvasHeight, state.snapToGrid, state.gridSize, onCanvasResize]
    );

    /**
     * Phase 18.1 + A.1 — iframe içi inline edit + click-to-select handler.
     * iframe.contentDocument.body'ye click + dblclick + keydown + blur listener ekler.
     */
    const handleIframeLoad = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentDocument;
        if (!doc || !doc.body) return;

        let editingElement: HTMLElement | null = null;
        let editingIndex = -1;
        let originalText = '';

        const getRenderIndex = (el: HTMLElement): number => {
            let n: HTMLElement | null = el;
            while (n) {
                const idx = n.getAttribute('data-render-index');
                if (idx !== null) return Number(idx);
                n = n.parentElement;
            }
            return -1;
        };

        const startEdit = (target: HTMLElement) => {
            if (editingElement) return;
            editingElement = target;
            editingIndex = getRenderIndex(target);
            originalText = target.textContent || '';
            target.contentEditable = 'true';
            target.style.outline = '2px solid #6366f1';
            target.style.background = 'rgba(99,102,241,0.08)';
            target.focus();
            const range = doc.createRange();
            range.selectNodeContents(target);
            const sel = doc.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
        };

        const finishEdit = (commit: boolean) => {
            if (!editingElement) return;
            const newText = editingElement.textContent || '';
            editingElement.contentEditable = 'false';
            editingElement.style.outline = '';
            editingElement.style.background = '';
            const tag = editingElement.tagName.toLowerCase();
            if (commit && newText !== originalText && onInlineEdit && editingIndex >= 0) {
                onInlineEdit({ renderIndex: editingIndex, originalText, newText, tagName: tag });
            } else if (!commit) {
                editingElement.textContent = originalText;
            }
            editingElement = null;
            editingIndex = -1;
        };

        const onClick = (e: Event) => {
            const t = e.target as HTMLElement;
            if (!t || t.isContentEditable) return;
            const idx = getRenderIndex(t);
            if (idx >= 0 && onSelectElement) {
                e.preventDefault();
                e.stopPropagation();
                onSelectElement(idx);
            }
        };

        const onDblClick = (e: Event) => {
            const t = e.target as HTMLElement;
            if (!t || t === doc.body || t === doc.documentElement) return;
            if (t.isContentEditable) return;
            e.preventDefault();
            e.stopPropagation();
            startEdit(t);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (!editingElement) return;
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finishEdit(true);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                finishEdit(false);
            }
        };

        const onBlur = (e: FocusEvent) => {
            if (!editingElement) return;
            const t = e.target as HTMLElement;
            if (t === editingElement) finishEdit(true);
        };

        doc.body.addEventListener('click', onClick);
        doc.body.addEventListener('dblclick', onDblClick);
        doc.body.addEventListener('keydown', onKeyDown);
        doc.body.addEventListener('blur', onBlur, true);
    }, [onInlineEdit, onSelectElement]);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe) {
            iframe.addEventListener('load', handleIframeLoad);
            return () => iframe.removeEventListener('load', handleIframeLoad);
        }
        return undefined;
    }, [renderResult.html, handleIframeLoad]);

    // Boyut göstergesi hesaplama (mm + px)
    const sizeLabel = useMemo(() => {
        const pxW = Math.round(state.canvasWidth);
        const pxH = Math.round(state.canvasHeight);
        const mmW = Math.round((pxW / 96) * 25.4);
        const mmH = Math.round((pxH / 96) * 25.4);
        const isA4 = pxW === 794 && pxH === 1123;
        return isA4
            ? `A4 · ${mmW}×${mmH} mm (${pxW}×${pxH} px)`
            : `${mmW}×${mmH} mm (${pxW}×${pxH} px)`;
    }, [state.canvasWidth, state.canvasHeight]);

    return (
        <div
            ref={canvasRef}
            data-designer-canvas
            data-mode={state.activeTool}
            onClick={handleCanvasClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'auto',
                background: '#1e293b',
                cursor: state.activeTool === 'select' ? 'default' : 'crosshair',
                backgroundImage: state.showGrid
                    ? 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)'
                    : 'none',
                backgroundSize: `${state.gridSize}px ${state.gridSize}px`,
            }}
        >
            {/* A4 sayfa — sabit pixel boyut, scroll container içinde */}
            <div
                data-designer-a4-sheet
                style={{
                    position: 'relative',
                    width: `${state.canvasWidth}px`,
                    height: `${state.canvasHeight}px`,
                    margin: '32px auto',
                    background: 'white',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                }}
            >
                {/* Boyut göstergesi — A4 sheet sol üst köşede */}
                <div
                    data-designer-size-indicator
                    style={{
                        position: 'absolute',
                        top: -28,
                        left: 0,
                        padding: '4px 10px',
                        background: 'rgba(15, 23, 42, 0.92)',
                        border: '1px solid #334155',
                        borderRadius: '4px',
                        color: '#a5b4fc',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        zIndex: 30,
                        cursor: onCanvasReset ? 'pointer' : 'default',
                    }}
                    title={onCanvasReset ? 'A4 default\'a sıfırla' : 'A4 sheet'}
                    onClick={onCanvasReset}
                >
                    {sizeLabel}
                </div>

                {/* iframe — gerçek XSLT render. Sprint 4 Acil fix: pointer-events:none
                    → drag-drop A4 sheet'e düşsün (iframe'in kendisi drop'u yakalamasın).
                    ElementOverlay/SectionOverlay hâlâ görünür (pointer-events:none zaten). */}
                <iframe
                    ref={iframeRef}
                    data-designer-iframe
                    srcDoc={renderResult.html || buildPlaceholderHtml(state)}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        background: 'white',
                        pointerEvents: 'none',
                    }}
                    title="Designer Preview"
                />

                {/* Element overlay'leri (canvas state'te yeni eklenen elementler için görsel feedback) */}
                {Object.values(state.sections).find(s => s.id === state.activeSectionId)?.elements.map(el => (
                    <ElementOverlay
                        key={el.id}
                        element={el}
                        isSelected={el.id === state.selectedElementId}
                    />
                ))}

                {/* Section overlay çerçeveleri (placeholder — Aşama 5 render fix ile kaldırılacak) */}
                {Object.values(state.sections).sort((a, b) => a.order - b.order).map(section => (
                    <SectionOverlay
                        key={section.id}
                        sectionId={section.id}
                        title={section.title}
                        elementCount={section.elements.length}
                        isActive={state.activeSectionId === section.id || hoverSectionId === section.id}
                        isHover={hoverSectionId === section.id}
                    />
                ))}

                {/* Sprint 2 Aşama 2 — 4 köşe resize handle */}
                <ResizeHandle corner="nw" onResizeStart={handleResizeStart} />
                <ResizeHandle corner="ne" onResizeStart={handleResizeStart} />
                <ResizeHandle corner="sw" onResizeStart={handleResizeStart} />
                <ResizeHandle corner="se" onResizeStart={handleResizeStart} />
            </div>

            {/* Sağ alt köşede — render duration badge */}
            {!renderResult.error && state.currentXslt && (
                <div style={{
                    position: 'fixed',
                    bottom: 44,
                    right: 16,
                    padding: '4px 10px',
                    background: 'rgba(16, 185, 129, 0.85)',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    zIndex: 20,
                }}>
                    ✓ Render: {renderResult.durationMs.toFixed(1)}ms
                </div>
            )}

            {/* Render error badge */}
            {renderResult.error && (
                <div style={{
                    position: 'fixed',
                    bottom: 44,
                    right: 16,
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    zIndex: 20,
                    maxWidth: '320px',
                }} title={renderResult.error}>
                    ⚠ Render Hatası — {renderResult.error.slice(0, 80)}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// Sprint 2 Aşama 2 — Resize Handle (4 köşeden biri)
// ============================================================================

interface ResizeHandleProps {
    corner: 'nw' | 'ne' | 'sw' | 'se';
    onResizeStart: (corner: 'nw' | 'ne' | 'sw' | 'se', e: React.MouseEvent) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ corner, onResizeStart }) => {
    const cursorMap: Record<ResizeHandleProps['corner'], string> = {
        nw: 'nw-resize',
        ne: 'ne-resize',
        sw: 'sw-resize',
        se: 'se-resize',
    };
    const positionStyle: React.CSSProperties =
        corner === 'nw' ? { top: -6, left: -6, cursor: cursorMap.nw }
        : corner === 'ne' ? { top: -6, right: -6, cursor: cursorMap.ne }
        : corner === 'sw' ? { bottom: -6, left: -6, cursor: cursorMap.sw }
        : { bottom: -6, right: -6, cursor: cursorMap.se };

    return (
        <div
            data-designer-resize-handle={corner}
            onMouseDown={(e) => onResizeStart(corner, e)}
            title={`${corner.toUpperCase()} köşesinden sürükle → resize`}
            style={{
                position: 'absolute',
                width: 14,
                height: 14,
                background: 'white',
                border: '2px solid #6366f1',
                borderRadius: '50%',
                zIndex: 25,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                ...positionStyle,
            }}
        />
    );
};

// ============================================================================
// Phase 17.1: buildElementForTool — aktif araca göre default element üret
// ============================================================================

function buildElementForTool(
    tool: 'select' | 'text' | 'image' | 'shape' | 'qrcode' | 'formula' | 'table',
    id: string,
    x: number,
    y: number
): DesignElement {
    const baseStyle = { fontSize: '14px', color: '#000', fontFamily: 'system-ui, sans-serif' };
    switch (tool) {
        case 'text':
            return {
                id, type: 'text', x, y, content: 'Yeni Metin', width: 200, height: 30, style: baseStyle,
            } as DesignElement;
        case 'image':
            return {
                id, type: 'image', x, y, content: 'image', width: 100, height: 100, style: {},
            } as DesignElement;
        case 'shape':
            return {
                id, type: 'shape', x, y, content: 'rect', shapeType: 'rect', width: 100, height: 60, style: { backgroundColor: '#6366f1', borderRadius: '4px' },
            } as DesignElement;
        case 'qrcode':
            return {
                id, type: 'qrcode', x, y, content: 'https://example.com', width: 80, height: 80, style: {},
            } as DesignElement;
        case 'formula':
            return {
                id, type: 'formula', x, y, content: 'sum(LineExtensionAmount)', width: 200, height: 24, style: { ...baseStyle, fontFamily: 'monospace' },
            } as DesignElement;
        case 'table':
            return {
                id, type: 'table', x, y, content: '', rows: 3, cols: 4, width: 300, height: 100,
                tableData: [
                    [{ content: 'Sıra' }, { content: 'Ürün' }, { content: 'Miktar' }, { content: 'Fiyat' }],
                    [{ content: '1' }, { content: '' }, { content: '' }, { content: '' }],
                    [{ content: '2' }, { content: '' }, { content: '' }, { content: '' }],
                ],
                style: { borderCollapse: 'collapse' },
            } as DesignElement;
        default:
            return {
                id, type: 'text', x, y, content: 'Yeni', width: 100, height: 24, style: baseStyle,
            } as DesignElement;
    }
}

// ============================================================================
// Phase 17.1: ElementOverlay — canvas üzerinde yeni element görsel feedback
// ============================================================================

interface ElementOverlayProps {
    element: DesignElement;
    isSelected: boolean;
}

const ElementOverlay: React.FC<ElementOverlayProps> = ({ element, isSelected }) => {
    const w = element.width || 100;
    const h = element.height || 30;
    const left = element.x;
    const top = element.y;
    const userStyle: React.CSSProperties = element.style || {};

    return (
        <div
            style={{
                position: 'absolute',
                left: `${left}px`,
                top: `${top}px`,
                width: `${w}px`,
                height: `${h}px`,
                border: isSelected
                    ? '2px solid #6366f1'
                    : userStyle.border || '1px dashed rgba(99, 102, 241, 0.4)',
                background: isSelected
                    ? 'rgba(99, 102, 241, 0.05)'
                    : userStyle.backgroundColor || 'rgba(99, 102, 241, 0.02)',
                color: userStyle.color || '#6366f1',
                fontFamily: userStyle.fontFamily || 'inherit',
                fontSize: userStyle.fontSize || '11px',
                fontWeight: userStyle.fontWeight || 600,
                fontStyle: userStyle.fontStyle || 'normal',
                padding: userStyle.padding || '0',
                paddingTop: userStyle.paddingTop,
                paddingRight: userStyle.paddingRight,
                paddingBottom: userStyle.paddingBottom,
                paddingLeft: userStyle.paddingLeft,
                margin: userStyle.margin || '0',
                marginTop: userStyle.marginTop,
                marginRight: userStyle.marginRight,
                marginBottom: userStyle.marginBottom,
                marginLeft: userStyle.marginLeft,
                borderRadius: userStyle.borderRadius || '0',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                zIndex: 8,
            }}
            title={`${element.type} · ${element.id.slice(-6)}${element.binding ? ` · binding: ${element.binding}` : ''}`}
        >
            {element.content || element.binding || `${element.type} (${element.id.slice(-6)})`}
        </div>
    );
};

interface SectionOverlayProps {
    sectionId: SectionId;
    title: string;
    elementCount: number;
    isActive: boolean;
    isHover?: boolean;
}

/**
 * Sprint 4 Aşama 1 — 5 orantılı bant hesaplaması.
 * reportHeader %0-20, partyHeader %20-40, masterData %40-70, totals %70-85, reportFooter %85-100.
 */
const SECTION_BANDS: Record<SectionId, { topPct: number; heightPct: number }> = {
    reportHeader: { topPct: 0, heightPct: 20 },
    partyHeader: { topPct: 20, heightPct: 20 },
    masterData: { topPct: 40, heightPct: 30 },
    totals: { topPct: 70, heightPct: 15 },
    reportFooter: { topPct: 85, heightPct: 15 },
};

const SectionOverlay: React.FC<SectionOverlayProps> = ({
    sectionId,
    title,
    elementCount,
    isActive,
    isHover,
}) => {
    const band = SECTION_BANDS[sectionId];
    const isHighlight = isActive || isHover;
    return (
        <div
            style={{
                position: 'absolute',
                top: `${band.topPct}%`,
                left: 0,
                right: 0,
                height: `${band.heightPct}%`,
                pointerEvents: 'none',
                border: `2px dashed ${isHover ? '#10b981' : isActive ? '#6366f1' : '#334155'}`,
                borderRadius: '4px',
                padding: '8px',
                color: isHighlight ? (isHover ? '#10b981' : '#a5b4fc') : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                opacity: isHighlight ? 0.9 : 0.3,
                background: isHover ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                transition: 'border-color 0.1s, background 0.1s, opacity 0.1s',
                zIndex: 5,
            }}
        >
            {title} ({elementCount}){isHover ? ' ↓ drop here' : ''}
        </div>
    );
};

function buildPlaceholderHtml(state: DesignerStateV2): string {
    return `<!DOCTYPE html>
<html><head><style>
body { margin: 0; padding: 24px; background: #f8fafc; font-family: sans-serif; color: #475569; }
.empty { text-align: center; padding: 80px 20px; }
h1 { color: #0f172a; margin-bottom: 8px; }
</style></head><body>
<div class="empty">
<h1>Designer 2.0 — İskelet Aktif</h1>
<p>Section: <strong>${state.activeSectionId}</strong> · ${Object.values(state.sections).map(s => `${s.title} (${s.elements.length})`).join(' • ')}</p>
</div>
</body></html>`;
}

export default DesignerCanvas;