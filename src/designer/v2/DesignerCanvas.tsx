/**
 * Designer 2.0 — Canvas (Phase 16.4 iskelet)
 *
 * İçerik: iframe XSLT render + click-to-place + drag-drop
 * Phase 17'de implementasyon detaylandırılacak.
 */
import React, { useRef } from 'react';
import type { DesignerStateV2 } from './hooks/useDesignerState';
import type { DesignElement, SectionId } from '../../types.ts';

interface DesignerCanvasProps {
    state: DesignerStateV2;
    onPlaceElement: (element: DesignElement) => void;
}

export const DesignerCanvas: React.FC<DesignerCanvasProps> = ({ state, onPlaceElement }) => {
    const canvasRef = useRef<HTMLDivElement>(null);

    /**
     * Phase 17 TODO: tıkla-yerleştir (placingMode) + drag-drop implementasyonu.
     * Şu an sadece iframe + bölüm göstergesi render ediliyor.
     */

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Phase 17: tıklanan koordinatta grid-snap ile yeni element oluştur
        // if (state.mode === 'clickPlace') {
        //     const rect = canvasRef.current!.getBoundingClientRect();
        //     const x = Math.round((e.clientX - rect.left) / state.gridSize) * state.gridSize;
        //     const y = Math.round((e.clientY - rect.top) / state.gridSize) * state.gridSize;
        //     onPlaceElement({ id: ..., type: state.activeTool, x, y, content: '', ... });
        // }
    };

    return (
        <div
            ref={canvasRef}
            data-designer-canvas
            data-mode={state.mode}
            onClick={handleCanvasClick}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'auto',
                cursor: state.mode === 'clickPlace' ? 'crosshair' : 'default',
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

            {/* Mod göstergesi */}
            {state.mode !== 'idle' && (
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
                    Mod: {state.mode} • Araç: {state.activeTool}
                </div>
            )}

            {/* XSLT render iframe (Phase 17: gerçek render + contentWindow.postMessage) */}
            <iframe
                data-designer-iframe
                srcDoc={state.htmlPreview || buildPlaceholderHtml(state)}
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
