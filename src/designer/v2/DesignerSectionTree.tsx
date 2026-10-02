/**
 * Designer 2.0 — Sol Panel Üst (Section Tree) — Sprint 2 Aşama 1 (2026-10-02)
 *
 * Selim'in "dikey 2 panel sol" brief'i:
 *   - Üst: Section ağacı (5 section, expand/collapse, element listesi)
 *   - Alt: XML veri alanları (Aşama 3'te doldurulacak)
 *
 * Bu bileşen eski DesignerSidebar.tsx'in section tree bölümüdür.
 * Element ekleme araç çubuğu (Metin, Görsel, Şekil, QR, Formül, Tablo) DesignerToolbar'a taşındı —
 * "karmaşıklık azaltma" prensibi gereği tek kaynaktan yönetilecek.
 */
import React from 'react';
import { FileText, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import type { SectionsMap, SectionId } from '../../types.ts';

interface DesignerSectionTreeProps {
    sections: SectionsMap;
    activeSectionId: SectionId;
    selectedElementId: string | null;
    onSelectSection: (id: SectionId) => void;
    onSelectElement: (id: string | null) => void;
    onDeleteElement: (id: string) => void;
}

export const DesignerSectionTree: React.FC<DesignerSectionTreeProps> = ({
    sections,
    activeSectionId,
    selectedElementId,
    onSelectSection,
    onSelectElement,
    onDeleteElement,
}) => {
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
        reportHeader: true,
        partyHeader: true,
        masterData: true,
        totals: false,
        reportFooter: false,
    });

    const orderedSections = (Object.values(sections) as any[]).sort(
        (a: any, b: any) => a.order - b.order
    );

    return (
        <div
            data-designer-section-tree
            style={{
                height: '100%',
                background: '#0f172a',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{ padding: '12px 12px 8px' }}>
                <div
                    style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#94a3b8',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                    }}
                >
                    BÖLÜMLER
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
                                background:
                                    activeSectionId === section.id
                                        ? 'rgba(99, 102, 241, 0.15)'
                                        : 'transparent',
                                border:
                                    activeSectionId === section.id
                                        ? '1px solid rgba(99, 102, 241, 0.3)'
                                        : '1px solid transparent',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: activeSectionId === section.id ? '#a5b4fc' : '#cbd5e1',
                            }}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpanded((prev: Record<string, boolean>) => ({
                                        ...prev,
                                        [section.id]: !prev[section.id],
                                    }));
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    padding: 0,
                                }}
                                title={expanded[section.id] ? 'Daralt' : 'Genişlet'}
                            >
                                {expanded[section.id] ? (
                                    <ChevronDown size={14} />
                                ) : (
                                    <ChevronRight size={14} />
                                )}
                            </button>
                            <FileText size={14} />
                            <span style={{ flex: 1, fontWeight: 600 }}>{section.title}</span>
                            <span
                                style={{
                                    fontSize: '10px',
                                    color: '#64748b',
                                    background: '#1e293b',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                }}
                            >
                                {section.elements.length}
                            </span>
                        </div>

                        {expanded[section.id] && section.elements.length > 0 && (
                            <div style={{ marginLeft: '24px', marginTop: '4px' }}>
                                {section.elements.map((el: any) => (
                                    <div
                                        key={el.id}
                                        onClick={() => onSelectElement(el.id)}
                                        title={elementTooltip(el)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            gap: '2px',
                                            padding: '4px 8px',
                                            background:
                                                selectedElementId === el.id
                                                    ? 'rgba(99, 102, 241, 0.1)'
                                                    : 'transparent',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            color:
                                                selectedElementId === el.id ? '#a5b4fc' : '#94a3b8',
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                width: '100%',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: '#fb923c',
                                                    fontWeight: 700,
                                                    fontSize: '10px',
                                                    minWidth: '32px',
                                                }}
                                            >
                                                {el.type}
                                            </span>
                                            {el.binding && (
                                                <span
                                                    style={{
                                                        color: '#94a3b8',
                                                        fontFamily: 'monospace',
                                                        fontSize: '10px',
                                                        flex: 1,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {el.binding}
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteElement(el.id);
                                                }}
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
                                        </span>
                                        {el.content && (
                                            <span
                                                style={{
                                                    color: '#cbd5e1',
                                                    fontSize: '10px',
                                                    fontStyle: 'italic',
                                                    marginLeft: '4px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    maxWidth: '180px',
                                                }}
                                            >
                                                {truncate(el.content, 50)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// Helpers — element etiketi için (Selim: section tree'de element içerikleri lazım)
// ============================================================================

function truncate(text: string, n: number): string {
    if (!text) return '';
    const clean = text.replace(/\s+/g, ' ').trim();
    return clean.length > n ? clean.slice(0, n) + '…' : clean;
}

function elementTooltip(el: any): string {
    const parts = [`type: ${el.type}`, `id: ${el.id}`];
    if (el.binding) parts.push(`binding: ${el.binding}`);
    if (el.content) parts.push(`content: ${truncate(el.content, 100)}`);
    if (el.htmlTag) parts.push(`tag: <${el.htmlTag}>`);
    return parts.join('\n');
}

export default DesignerSectionTree;
