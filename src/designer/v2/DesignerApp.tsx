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
     * Phase 17.3 — XSLT import pipeline.
     * Selection.tsx'ten "Kendi Tasarımın" ile XSLT yüklenince customContent prop'u gelir.
     * 1. currentXslt state'ine kaydet
     * 2. xsltToSections ile parse et → 5 section'a dağıt
     * 3. Sample XML'i currentXml'e set et (render için)
     */
    useEffect(() => {
        if (customContent && customContent.trim().length > 0) {
            ds.setCurrentXslt(customContent);
            ds.setXml(SAMPLE_FATURA_XML);
            const sections = xsltToSections(customContent);
            ds.setSections(sections);
        } else {
            // XSLT yoksa sadece sample XML set et (Phase 17.3'te placeholder render devre dışı)
            ds.setXml(SAMPLE_FATURA_XML);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customContent]);

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
