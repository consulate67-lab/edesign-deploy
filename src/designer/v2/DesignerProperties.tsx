/**
 * Designer 2.0 — Sağ Properties Panel (Phase 16.4 iskelet)
 *
 * Seçili element'in özelliklerini gösterir ve düzenler.
 * Phase 17'de generic field'lar eklenecek (XPath, color picker, vb.)
 */
import React from 'react';
import { Type, Square, Image as ImageIcon, Trash2, Copy, Move, ChevronDown, ChevronRight } from 'lucide-react';
import type { DesignerStateV2 } from './hooks/useDesignerState';
import type { DesignElement } from '../../types.ts';

interface DesignerPropertiesProps {
    state: DesignerStateV2;
    onUpdate: (id: string, patch: Partial<DesignElement>) => void;
    onMove: (id: string, dx: number, dy: number) => void;
    onDelete: (id: string) => void;
    onClone: (id: string) => void;
}

export const DesignerProperties: React.FC<DesignerPropertiesProps> = ({
    state,
    onUpdate,
    onMove,
    onDelete,
    onClone,
}) => {
    const selectedEl = findSelectedElement(state);
    const [expanded, setExpanded] = React.useState({
        position: true,
        size: true,
        content: true,
        style: false,
        data: false,
    });

    if (!selectedEl) {
        return (
            <div style={{
                height: '100%',
                background: '#0f172a',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '20px',
                textAlign: 'center',
            }}>
                <Square size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Element Seçilmedi</div>
                <div style={{ fontSize: '11px', marginTop: '6px' }}>
                    Sol panelden bir section açıp element seçin veya sağdaki araçlardan yeni ekleyin.
                </div>
            </div>
        );
    }

    return (
        <div style={{
            height: '100%',
            background: '#0f172a',
            overflowY: 'auto',
            padding: '12px',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                padding: '10px',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(99, 102, 241, 0.2)',
            }}>
                <Type size={16} color="#a5b4fc" />
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Seçili Element
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>
                        {selectedEl.type.toUpperCase()} <span style={{ color: '#64748b', fontWeight: 400 }}>· {selectedEl.id.slice(-8)}</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                <button onClick={() => onClone(selectedEl.id)} title="Kopyala (Ctrl+C)" style={smallBtnStyle}>
                    <Copy size={12} /> Kopyala
                </button>
                <button onClick={() => onDelete(selectedEl.id)} title="Sil (Delete)" style={{ ...smallBtnStyle, background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    <Trash2 size={12} /> Sil
                </button>
            </div>

            {/* Position Section */}
            <PropertySection
                title="Konum & Boyut"
                isOpen={expanded.position}
                onToggle={() => setExpanded({ ...expanded, position: !expanded.position })}
            >
                <div style={gridStyle}>
                    <NumberField label="X" value={selectedEl.x} onChange={(v) => onUpdate(selectedEl.id, { x: v })} />
                    <NumberField label="Y" value={selectedEl.y} onChange={(v) => onUpdate(selectedEl.id, { y: v })} />
                    <NumberField label="W" value={selectedEl.width || 100} onChange={(v) => onUpdate(selectedEl.id, { width: v })} />
                    <NumberField label="H" value={selectedEl.height || 30} onChange={(v) => onUpdate(selectedEl.id, { height: v })} />
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    {[
                        { label: '◀', dx: -10, dy: 0 },
                        { label: '▶', dx: 10, dy: 0 },
                        { label: '▲', dx: 0, dy: -10 },
                        { label: '▼', dx: 0, dy: 10 },
                    ].map(b => (
                        <button
                            key={b.label}
                            onClick={() => onMove(selectedEl.id, b.dx, b.dy)}
                            title={`Taşı ${b.label}`}
                            style={{ ...smallBtnStyle, flex: 1 }}
                        >
                            {b.label}
                        </button>
                    ))}
                </div>
            </PropertySection>

            {/* Content Section */}
            <PropertySection
                title="İçerik"
                isOpen={expanded.content}
                onToggle={() => setExpanded({ ...expanded, content: !expanded.content })}
            >
                <textarea
                    key={selectedEl.id}
                    defaultValue={selectedEl.content}
                    onBlur={(e) => onUpdate(selectedEl.id, { content: e.target.value })}
                    placeholder="Metin giriniz..."
                    style={{
                        width: '100%',
                        minHeight: '60px',
                        background: '#020617',
                        border: '1px solid #334155',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                    }}
                />
            </PropertySection>

            {/* Style Section (Phase 17) */}
            <PropertySection
                title="Stil"
                isOpen={expanded.style}
                onToggle={() => setExpanded({ ...expanded, style: !expanded.style })}
            >
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Phase 17'de font, color, border, padding/margin gibi CSS alanları eklenecek.
                </div>
            </PropertySection>

            {/* Data Section */}
            <PropertySection
                title="Veri Bağlama"
                isOpen={expanded.data}
                onToggle={() => setExpanded({ ...expanded, data: !expanded.data })}
            >
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                    XML alan bağlama (XPath) Phase 17'de XML dropdown modal ile eklenecek.
                </div>
            </PropertySection>
        </div>
    );
};

// ============================================================================
// Helper Components
// ============================================================================

function findSelectedElement(state: DesignerStateV2): DesignElement | null {
    if (!state.selectedElementId) return null;
    for (const secId of Object.keys(state.sections) as (keyof typeof state.sections)[]) {
        const found = state.sections[secId].elements.find((el: DesignElement) => el.id === state.selectedElementId);
        if (found) return found;
    }
    return null;
}

const smallBtnStyle: React.CSSProperties = {
    padding: '6px 8px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '6px',
    color: '#a5b4fc',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
};

interface NumberFieldProps {
    label: string;
    value: number;
    onChange: (v: number) => void;
}

const NumberField: React.FC<NumberFieldProps> = ({ label, value, onChange }) => (
    <div>
        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>{label}</div>
        <input
            type="number"
            defaultValue={Math.round(value)}
            key={`${label}-${value}`}
            onBlur={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v)) onChange(v);
            }}
            style={{
                width: '100%',
                padding: '4px 6px',
                background: '#020617',
                border: '1px solid #334155',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'inherit',
            }}
        />
    </div>
);

interface PropertySectionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const PropertySection: React.FC<PropertySectionProps> = ({ title, isOpen, onToggle, children }) => (
    <div style={{
        marginBottom: '12px',
        background: '#020617',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        overflow: 'hidden',
    }}>
        <button
            onClick={onToggle}
            style={{
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <span>{title}</span>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {isOpen && <div style={{ padding: '12px' }}>{children}</div>}
    </div>
);

export default DesignerProperties;
