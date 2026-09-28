/**
 * Designer 2.0 — Ana orkestratör (Phase 16.4 + 17.3)
 *
 * Selim: "daha düzgün gerçekten becermiş bir tasarım ekranı istiyorum"
 *
 * Bu bileşen 4 ana paneli bir araya getirir:
 *   - DesignerToolbar (üst)
 *   - DesignerSidebar (sol)
 *   - DesignerCanvas (orta)
 *   - DesignerProperties (sağ)
 *   - DesignerStatusBar (alt)
 *
 * Phase 17.3: customContent (XSLT) prop'u gelince xsltToSections ile parse edilir
 * ve sections state'ine dağıtılır. Canvas iframe'i bu state'i kullanarak
 * browser-side XSLTProcessor ile gerçek render gösterir.
 */
import React, { useEffect } from 'react';
import { DesignerToolbar } from './DesignerToolbar';
import { DesignerSidebar } from './DesignerSidebar';
import { DesignerCanvas } from './DesignerCanvas';
import { DesignerProperties } from './DesignerProperties';
import { DesignerStatusBar } from './DesignerStatusBar';
import { useDesignerState } from './hooks/useDesignerState';
import type { DesignElement } from '../../types.ts';
import { xsltToSections } from './utils/xsltToSections';
import { SAMPLE_FATURA_XML } from './utils/xsltRender';
import { fetchDefaultXslt } from './utils/xsltDefaults';

interface DesignerAppProps {
    template?: string;
    customContent?: string;
    docName?: string;
    onBack?: () => void;
    moduleId?: string;
}

export const DesignerApp: React.FC<DesignerAppProps> = ({
    template = 'Modern_1.0_Fatura',
    customContent,
    docName = 'Yeni Tasarım',
    onBack,
    moduleId,
}) => {
    const ds = useDesignerState();

    const handlePlaceElement = (element: DesignElement) => {
        ds.pushHistory();
        ds.placeElement(ds.state.activeSectionId, element);
    };

    /**
     * Phase 17.3 + 17.4 — XSLT import pipeline.
     * Selim "veriler yok" dedi: e-Fatura modülünden açıldığında customContent boş
     * geliyordu ve fetch 404 dönüyordu → iframe hâlâ placeholder.
     *
     * Pipeline:
     * 1. customContent dolu → onu kullan (dosya yükleme)
     * 2. customContent boş → moduleId'ye göre public/.../*.xslt path'ten fetch
     * 3. Fetch başarısız → kullanıcıya badge ile bildir (placeholder devam)
     */
    useEffect(() => {
        let cancelled = false;
        async function loadXslt() {
            let xslt = customContent?.trim() || '';

            if (!xslt) {
                const fetched = await fetchDefaultXslt(moduleId);
                if (cancelled) return;
                if (fetched) {
                    xslt = fetched;
                }
                // else: xslt boş kalır → placeholder render + error badge
            }

            if (cancelled) return;

            ds.setCurrentXslt(xslt);
            ds.setXml(SAMPLE_FATURA_XML);
            if (xslt) {
                const sections = xsltToSections(xslt);
                ds.setSections(sections);
                // eslint-disable-next-line no-console
                console.log(
                    customContent
                        ? `[DesignerApp] Custom XSLT: ${xslt.length} chars`
                        : `[DesignerApp] Default XSLT: ${xslt.length} chars · module=${moduleId || 'fallback'}`
                );
            }
        }
        loadXslt();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customContent, moduleId]);

    return (
        <div
            data-designer-v2
            style={{
                display: 'grid',
                gridTemplateRows: '64px 1fr 32px',
                gridTemplateColumns: '300px 1fr 320px',
                gridTemplateAreas: `
                    "toolbar toolbar toolbar"
                    "sidebar canvas properties"
                    "statusbar statusbar statusbar"
                `,
                height: '100vh',
                background: '#0f172a',
                color: 'white',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                overflow: 'hidden',
            }}
        >
            <div style={{ gridArea: 'toolbar' }}>
                <DesignerToolbar
                    docName={docName}
                    template={template}
                    onBack={onBack}
                    onUndo={ds.undo}
                    onRedo={ds.redo}
                    canUndo={ds.state.historyIndex >= 0}
                    canRedo={ds.state.historyIndex < ds.state.history.length - 1}
                    onSetTool={ds.setTool}
                    activeTool={ds.state.activeTool}
                />
            </div>

            <div style={{ gridArea: 'sidebar', borderRight: '1px solid #1e293b', overflow: 'hidden' }}>
                <DesignerSidebar
                    sections={ds.state.sections}
                    activeSectionId={ds.state.activeSectionId}
                    selectedElementId={ds.state.selectedElementId}
                    onSelectSection={ds.setActiveSection}
                    onSelectElement={ds.selectElement}
                    onAddElement={handlePlaceElement}
                    onDeleteElement={ds.deleteElement}
                />
            </div>

            <div style={{ gridArea: 'canvas', overflow: 'auto', background: '#1e293b' }}>
                <DesignerCanvas
                    state={ds.state}
                    onPlaceElement={handlePlaceElement}
                />
            </div>

            <div style={{ gridArea: 'properties', borderLeft: '1px solid #1e293b', overflow: 'hidden' }}>
                <DesignerProperties
                    state={ds.state}
                    onUpdate={ds.updateElement}
                    onMove={ds.moveElement}
                    onDelete={ds.deleteElement}
                    onClone={ds.cloneElement}
                />
            </div>

            <div style={{ gridArea: 'statusbar' }}>
                <DesignerStatusBar state={ds.state} />
            </div>
        </div>
    );
};

export default DesignerApp;
