/**
 * Designer 2.0 — Alt Status Bar (Phase 16.4 iskelet)
 *
 * Mod + zoom + ipucu + hata mesajı gösterir.
 */
import React from 'react';
import { ZoomIn, ZoomOut, Grid as GridIcon, AlertCircle } from 'lucide-react';
import type { DesignerStateV2 } from './hooks/useDesignerState';

interface DesignerStatusBarProps {
    state: DesignerStateV2;
}

export const DesignerStatusBar: React.FC<DesignerStatusBarProps> = ({ state }) => {
    return (
        <div
            data-designer-statusbar
            style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                background: 'rgba(15, 23, 42, 0.95)',
                borderTop: '1px solid #1e293b',
                gap: '16px',
                fontSize: '11px',
                color: '#94a3b8',
            }}
        >
            {/* Section bilgisi */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                    padding: '2px 8px',
                    background: '#1e293b',
                    borderRadius: '4px',
                    color: '#a5b4fc',
                    fontWeight: 600,
                }}>
                    {state.activeSectionId}
                </span>
            </span>

            {/* Element sayısı */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Element: <strong style={{ color: 'white' }}>
                    {Object.values(state.sections).reduce((acc: number, s: any) => acc + s.elements.length, 0)}
                </strong>
            </span>

            {/* Mod */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Mod: <strong style={{ color: state.mode === 'idle' ? '#10b981' : '#f59e0b' }}>
                    {state.mode}
                </strong>
            </span>

            <div style={{ flex: 1 }} />

            {/* Grid toggle */}
            <button
                title="Izgarayı Aç/Kapat"
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: state.showGrid ? '#10b981' : '#64748b',
                    cursor: 'pointer',
                    padding: '4px 6px',
                }}
            >
                <GridIcon size={14} />
            </button>

            {/* Zoom */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ZoomOut size={12} />
                <span style={{ color: 'white', minWidth: '36px', textAlign: 'center' }}>
                    {Math.round(state.zoom * 100)}%
                </span>
                <ZoomIn size={12} />
            </span>

            {/* Phase indicator */}
            <span style={{
                padding: '2px 8px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fcd34d',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
            }}>
                <AlertCircle size={10} /> Designer 2.0 — Phase 16 İskelet
            </span>
        </div>
    );
};

export default DesignerStatusBar;
