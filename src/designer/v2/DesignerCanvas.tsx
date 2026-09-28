/**
 * Designer 2.0 — Canvas (Phase 17.1 + 17.3 XSLT render)
 *
 * İçerik: iframe XSLT render + click-to-place + drag-drop
 * Phase 17.1: click-to-place gerçek davranış eklendi.
 * Phase 17.3: iframe.srcDoc = browser-side XSLTProcessor render çıktısı.
 */
import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import type { DesignerStateV2 } from './hooks/useDesignerState';
import type { DesignElement, SectionId } from '../../types.ts';
import { renderXslt } from './utils/xsltRender';

interface DesignerCanvasProps {
    state: DesignerStateV2;
    onPlaceElement: (element: DesignElement) => void;
    /**
     * Phase 18.1 — iframe içi inline editing bildirimi.
     * Kullanıcı iframe'de bir element'e çift tıklayıp düzenlediğinde çağrılır.
     * MVP: notice mesajı + console log. Phase 18.2'de sections state update'i.
     */
    onInlineEdit?: (info: { renderIndex: number; originalText: string; newText: string; tagName: string }) => void;
    /**
     * Phase A.1 — iframe click → sections element seç (renderIndex üzerinden).
     */
    onSelectElement?: (renderIndex: number) => void;
}

export const DesignerCanvas: React.FC<DesignerCanvasProps> = ({
    state,
    onPlaceElement,
    onInlineEdit,
    onSelectElement,
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    /**
     * Phase 17.3 — XSLT render.
     * state.currentXslt + state.currentXml → renderXslt() → HTML string.
     * XSLT yoksa placeholder HTML göster.
     * Her değişiklikte useMemo ile cache'lenir (performans).
     */
    const renderResult = useMemo(() => {
        if (!state.currentXslt) {
            return { html: buildPlaceholderHtml(state), error: null, durationMs: 0 };
        }
        return renderXslt(state.currentXslt, state.currentXml);
    }, [state.currentXslt, state.currentXml, state.activeSectionId]);

    /**
     * Phase 17.1: Tıkla-yerleştir implementasyonu.
     * - state.activeTool bir element tipini belirler (text/image/shape/qr/formula/table)
     * - state.mode 'clickPlace' olmalı (toolbar'dan araç seçilince otomatik set edilir)
     * - state.snapToGrid true ise gridSize'a yuvarlanır (default 5px)
     * - element aktif section'a eklenir (default: reportHeader)
     */
    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (state.activeTool === 'select') return; // sadece-select modunda tıklama yerleştirmez
        if (e.target !== e.currentTarget) return; // iframe veya overlay tıklaması

        const rect = canvasRef.current!.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        if (state.snapToGrid) {
            x = Math.round(x / state.gridSize) * state.gridSize;
            y = Math.round(y / state.gridSize) * state.gridSize;
        }

        const id = `${state.activeTool}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const el: DesignElement = buildElementForTool(state.activeTool, id, x, y);
        onPlaceElement(el);
    }, [state.activeTool, state.snapToGrid, state.gridSize, onPlaceElement]);

    /**
     * Phase 18.1 + A.1 — iframe içi inline edit + click-to-select handler.
     * iframe.contentDocument.body'ye click + dblclick + keydown + blur listener ekler.
     * - click → data-render-index → onSelectElement (sections state seçim)
     * - dblclick → contenteditable, blur'da onInlineEdit (UPDATE_ELEMENT)
     *
     * Not: srcDoc ile aynı origin'de, sandbox yok, local preview için OK.
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
            // Eğer edit modundaysa click skip
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
            // Çift tıklama → edit başlat
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

    /**
     * Phase 18.1 — iframe srcDoc her değiştiğinde listener'ları yeniden bağla.
     * useEffect: renderResult.html değişince handleIframeLoad çağrılır.
     */
    useEffect(() => {
        // Iframe yüklendikten sonra listener eklemek için onLoad'a bind ettik
        // Tekrar bağlamak için: handleIframeLoad'ı ref'e kaydet
        const iframe = iframeRef.current;
        if (iframe) {
            iframe.addEventListener('load', handleIframeLoad);
            return () => iframe.removeEventListener('load', handleIframeLoad);
        }
        return undefined;
    }, [renderResult.html, handleIframeLoad]);

    return (
        <div
            ref={canvasRef}
            data-designer-canvas
            data-mode={state.activeTool}
            onClick={handleCanvasClick}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'auto',
                cursor: state.activeTool === 'select' ? 'default' : 'crosshair',
                backgroundImage: state.showGrid
                    ? 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)'
                    : 'none',
                backgroundSize: `${state.gridSize}px ${state.gridSize}px`,
            }}
        >
            {/* Aktif section göstergesi */}
            <div style={{
                position: 'absolute',
                top: 12,
                left: 12,
                padding: '6px 12px',
                background: '#6366f1',
                color: 'white',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                zIndex: 10,
            }}>
                Section: {state.activeSectionId} ({state.sections[state.activeSectionId].elements.length} element)
            </div>

            {/* Aktif araç göstergesi */}
            {state.activeTool !== 'select' && (
                <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    padding: '6px 12px',
                    background: '#f59e0b',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    zIndex: 10,
                }}>
                    Araç: {state.activeTool} (canvas'ta tıkla → yerleştir)
                </div>
            )}

            {/* XSLT render iframe (Phase 17.3: browser-side XSLTProcessor, Phase 18.1: inline edit) */}
            <iframe
                ref={iframeRef}
                data-designer-iframe
                srcDoc={renderResult.html || buildPlaceholderHtml(state)}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: 'white',
                    transform: `scale(${state.zoom})`,
                    transformOrigin: 'top left',
                }}
                title="Designer Preview"
            />

            {/* Phase 18.1 — sade edit modu: hint badge kaldırıldı (Selim: şu anki ekran çok karışık) */}

            {/* Phase 17.3 — Render error badge (eğer XSLT parse hatası varsa) */}
            {renderResult.error && (
                <div style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
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

            {/* Phase 17.3 — Render duration badge (success indicator) */}
            {!renderResult.error && state.currentXslt && (
                <div style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
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

            {/* Phase 17.1: Yeni oluşturulan elementleri canvas üzerinde görsel olarak göster */}
            {Object.values(state.sections).find(s => s.id === state.activeSectionId)?.elements.map(el => (
                <ElementOverlay
                    key={el.id}
                    element={el}
                    isSelected={el.id === state.selectedElementId}
                    zoom={state.zoom}
                />
            ))}

            {/* Section overlay çerçeveleri (placeholder) */}
            {Object.values(state.sections).sort((a, b) => a.order - b.order).map(section => (
                <SectionOverlay
                    key={section.id}
                    sectionId={section.id}
                    title={section.title}
                    description={section.description}
                    elementCount={section.elements.length}
                    isActive={state.activeSectionId === section.id}
                    zoom={state.zoom}
                />
            ))}
        </div>
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
    zoom: number;
}

const ElementOverlay: React.FC<ElementOverlayProps> = ({ element, isSelected, zoom }) => {
    const w = (element.width || 100) / zoom;
    const h = (element.height || 30) / zoom;
    const left = element.x / zoom;
    const top = element.y / zoom;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${left}px`,
                top: `${top}px`,
                width: `${w}px`,
                height: `${h}px`,
                border: isSelected ? '2px solid #6366f1' : '1px dashed rgba(99, 102, 241, 0.4)',
                background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.02)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `${11 / zoom}px`,
                color: '#6366f1',
                fontWeight: 600,
                zIndex: 8,
            }}
        >
            {element.type} ({element.id.slice(-6)})
        </div>
    );
};

interface SectionOverlayProps {
    sectionId: SectionId;
    title: string;
    description: string;
    elementCount: number;
    isActive: boolean;
    zoom: number;
}

const SectionOverlay: React.FC<SectionOverlayProps> = ({
    sectionId,
    title,
    description,
    elementCount,
    isActive,
    zoom,
}) => {
    return (
        <div
            style={{
                position: 'absolute',
                top: `${(SECTION_ORDER[sectionId] * 200) / zoom}px`,
                left: 0,
                right: 0,
                height: `${200 / zoom}px`,
                pointerEvents: 'none',
                border: `2px dashed ${isActive ? '#6366f1' : '#334155'}`,
                borderRadius: '4px',
                padding: '8px',
                color: isActive ? '#a5b4fc' : '#475569',
                fontSize: `${12 / zoom}px`,
                fontWeight: 700,
                opacity: isActive ? 1 : 0.4,
                zIndex: 5,
            }}
        >
            {title} ({elementCount})
        </div>
    );
};

const SECTION_ORDER: Record<SectionId, number> = {
    reportHeader: 0,
    partyHeader: 1,
    masterData: 2,
    totals: 3,
    reportFooter: 4,
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
<p style="margin-top:24px;font-size:13px;">Phase 17'de tıkla-yerleştir + drag-drop + iframe render implementasyonu eklenecek.</p>
</div>
</body></html>`;
}

export default DesignerCanvas;
