/**
 * Designer 2.0 — Ana orkestratör (Phase 16.4 iskelet)
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
 * Mevcut ProfessionalDesigner.tsx (293 KB) korunur — Designer 2.0 ayrı bir mimari.
 * Phase 17+'da implementasyon detaylandırılacak.
 */
import React from 'react';
import { DesignerToolbar } from './DesignerToolbar';
import { DesignerSidebar } from './DesignerSidebar';
import { DesignerCanvas } from './DesignerCanvas';
import { DesignerProperties } from './DesignerProperties';
import { DesignerStatusBar } from './DesignerStatusBar';
import { useDesignerState } from './hooks/useDesignerState';
import type { DesignElement } from '../../types.ts';

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
