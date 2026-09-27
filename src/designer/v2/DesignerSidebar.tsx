/**
 * Designer 2.0 — Sol Sidebar (Phase 16.4 iskelet)
 *
 * 2 bölüm:
 *  - Üst: Section Tree (5 section, expandable)
 *  - Alt: Element ekleme araç çubuğu (Yeni Text, Image, QR, vb.)
 */
import React from 'react';
import { Plus, Type, Image as ImageIcon, Square, QrCode, Sigma, Table as LucideTable, Trash2, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import type { SectionsMap, SectionId, DesignElement } from '../../types.ts';

interface DesignerSidebarProps {
    sections: SectionsMap;
    activeSectionId: SectionId;
    selectedElementId: string | null;
    onSelectSection: (id: SectionId) => void;
    onSelectElement: (id: string | null) => void;
    onAddElement: (element: DesignElement) => void;
    onDeleteElement: (id: string) => void;
}

export const DesignerSidebar: React.FC<DesignerSidebarProps> = ({
    sections,
    activeSectionId,
    selectedElementId,
    onSelectSection,
    onSelectElement,
    onAddElement,
    onDeleteElement,
}) => {
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
        reportHeader: true,
        partyHeader: true,
        masterData: true,
        totals: false,
        reportFooter: false,
    });

    const orderedSections = (Object.values(sections) as any[]).sort((a: any, b: any) => a.order - b.order);

    const handleQuickAdd = (type: 'text' | 'image' | 'shape' | 'qrcode' | 'formula' | 'table') => {
        const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        onAddElement({
            id,
            type: type as any,
            x: 50,
            y: 50,
            content: type === 'text' ? 'Yeni Metin' : '',
            style: { fontSize: '14px', color: '#000' },
        } as DesignElement);
    };

    return (
        <div
            data-designer-sidebar
            style={{
                height: '100%',
                background: '#0f172a',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Section Tree */}
            <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #1e293b' }}>
                <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#94a3b8',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                }}>
                    SECTIONS
                </div>
                {orderedSections.map((section: any) => (
                    <div key={section.id} style={{ marginBottom: '4px' }}>
                        <div
                            onClick={() => onSelectSection(section.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 10px',
                                background: activeSectionId === section.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                border: activeSectionId === section.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: activeSectionId === section.id ? '#a5b4fc' : '#cbd5e1',
                            }}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); setExpanded((prev: Record<string, boolean>) => ({ ...prev, [section.id]: !prev[section.id] })); }}
                                style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                            >
                                {expanded[section.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            <FileText size={14} />
                            <span style={{ flex: 1, fontWeight: 600 }}>{section.title}</span>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>
                                {section.elements.length}
                            </span>
                        </div>

                        {expanded[section.id] && section.elements.length > 0 && (
                            <div style={{ marginLeft: '24px', marginTop: '4px' }}>
                                {section.elements.map((el: any) => (
                                    <div
                                        key={el.id}
                                        onClick={() => onSelectElement(el.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '4px 8px',
                                            background: selectedElementId === el.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            color: selectedElementId === el.id ? '#a5b4fc' : '#94a3b8',
                                        }}
                                    >
                                        <span style={{ flex: 1 }}>{el.type} ({el.id.slice(-6)})</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteElement(el.id); }}
                                            title="Sil"
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                padding: '2px',
                                            }}
                                        >
                                            <Trash2 size={11} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Element Ekleme Araç Çubuğu */}
            <div style={{ padding: '12px' }}>
                <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#94a3b8',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                }}>
                    YENİ ELEMENT
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                        { type: 'text' as const, icon: Type, label: 'Metin' },
                        { type: 'image' as const, icon: ImageIcon, label: 'Görsel' },
                        { type: 'shape' as const, icon: Square, label: 'Şekil' },
                        { type: 'qrcode' as const, icon: QrCode, label: 'QR' },
                        { type: 'formula' as const, icon: Sigma, label: 'Formül' },
                        { type: 'table' as const, icon: LucideTable, label: 'Tablo' },
                    ].map(t => (
                        <button
                            key={t.type}
                            onClick={() => handleQuickAdd(t.type)}
                            title={t.label + ' ekle'}
                            style={{
                                padding: '10px 6px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '6px',
                                color: '#a5b4fc',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '10px',
                                fontWeight: 600,
                            }}
                        >
                            <t.icon size={16} />
                            {t.label}
                        </button>
                    ))}
                </div>
                <button
                    style={{
                        marginTop: '12px',
                        width: '100%',
                        padding: '8px',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                    }}
                >
                    <Plus size={12} /> XML Veri Alanı Ekle
                </button>
            </div>
        </div>
    );
};

export default DesignerSidebar;
