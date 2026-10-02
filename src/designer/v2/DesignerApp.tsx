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
import React, { useEffect, useState } from 'react';
import { DesignerToolbar } from './DesignerToolbar';
import { DesignerSidebar } from './DesignerSidebar';
import { DesignerCanvas } from './DesignerCanvas';
import { DesignerProperties } from './DesignerProperties';
import { DesignerStatusBar } from './DesignerStatusBar';
import { useDesignerState, type DesignerStateV2 } from './hooks/useDesignerState';
import type { DesignElement, SectionId } from '../../types.ts';
import { xsltToSections } from './utils/xsltToSections';
import { SAMPLE_FATURA_XML } from './utils/xsltRender';
import { getDefaultXsltInline, fetchDefaultXslt } from './utils/xsltDefaults';
import { api } from '../../api';

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

    /**
     * Phase 18.1 — iframe inline edit bildirim state'i.
     * Kullanıcı bir element'i düzenlediğinde 4 saniye sonra kaybolan toast gösterilir.
     */
    const [inlineEditNotice, setInlineEditNotice] = useState<string | null>(null);
    useEffect(() => {
        if (!inlineEditNotice) return;
        const t = setTimeout(() => setInlineEditNotice(null), 4500);
        return () => clearTimeout(t);
    }, [inlineEditNotice]);

    const handleInlineEdit = (info: { renderIndex: number; originalText: string; newText: string; tagName: string }) => {
        // eslint-disable-next-line no-console
        console.log('[Designer 2.0] Inline edit:', info);

        // Phase A.1 — renderIndex üzerinden sections state update
        const elementId = findElementIdByRenderIndex(ds.state.sections, info.renderIndex);
        if (!elementId) {
            setInlineEditNotice(
                `⚠ Düzenleme kaydedilemedi: renderIndex=${info.renderIndex} sections'ta bulunamadı`
            );
            return;
        }
        ds.pushHistory();
        ds.updateElement(elementId, { content: info.newText });
        setInlineEditNotice(
            `✏️ Kaydedildi (${info.tagName} #${info.renderIndex}): ` +
            `"${info.originalText.trim().slice(0, 30)}${info.originalText.length > 30 ? '…' : ''}" → ` +
            `"${info.newText.trim().slice(0, 30)}${info.newText.length > 30 ? '…' : ''}"`
        );
    };

    /**
     * Phase A.1 — iframe click → sections element seç.
     * renderIndex'ten elementId bulur (sections walk) ve ds.selectElement çağırır.
     */
    const handleSelectElementByRenderIndex = (renderIndex: number) => {
        const elementId = findElementIdByRenderIndex(ds.state.sections, renderIndex);
        if (elementId) {
            ds.selectElement(elementId);
        } else {
            // eslint-disable-next-line no-console
            console.warn(`[Designer 2.0] renderIndex=${renderIndex} → element bulunamadı`);
        }
    };

    const handlePlaceElement = (element: DesignElement) => {
        ds.pushHistory();
        ds.placeElement(ds.state.activeSectionId, element);
    };

    /**
     * Sprint 1 (2026-10-02) — Tasarımı DB'ye kaydet (POST /api/designs).
     * Kullanıcıya tasarım adı sor, sections state + theme color + custom content ile birlikte sakla.
     */
    const handleSaveDesign = async () => {
        const suggestedName = docName || 'Yeni Tasarım';
        const name = window.prompt?.('Tasarım adı:', suggestedName) ?? suggestedName;
        if (!name || !name.trim()) {
            setInlineEditNotice('⚠ Kayıt iptal edildi: tasarım adı boş olamaz.');
            return;
        }
        try {
            const result = await api.saveDesign({
                name: name.trim(),
                module_id: moduleId || 'custom',
                xslt_content: ds.state.currentXslt || undefined,
                custom_content: customContent || undefined,
                theme_color: '#1e3a8a',
                sections: Object.fromEntries(
                    Object.entries(ds.state.sections).map(([k, s]) => [k, {
                        id: s.id,
                        title: s.title,
                        elements: s.elements,
                    }])
                ),
                status: 'draft',
            });
            // eslint-disable-next-line no-console
            console.log('[Designer 2.0] Tasarım kaydedildi:', result.design);
            setInlineEditNotice(
                `✅ Tasarım kaydedildi (#${result.design.id}) — "${result.design.name}"`
            );
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('[Designer 2.0] Kayıt hatası:', e);
            setInlineEditNotice(
                `⚠ Kayıt hatası: ${(e as Error).message || 'bilinmeyen'}`
            );
        }
    };

    /**
     * Sprint 1 — XSLT olarak indir (state'i XSLT'ye generate edip Blob olarak indir).
     * Şimdilik placeholder: inline XSLT'yi olduğu gibi indirir.
     * Phase C'de sections state'ten generateSectionalXSLT ile üretilecek.
     */
    const handleExportXslt = () => {
        const xslt = ds.state.currentXslt || SAMPLE_FATURA_XML;
        const blob = new Blob([xslt], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(docName || 'tasarim').replace(/\s+/g, '_')}.xslt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setInlineEditNotice(`📥 XSLT indirildi: ${a.download}`);
    };

    /**
     * Sprint 1.2 (2026-10-02) — XSLT load pipeline + loading state.
     * Selim "veriler yok" / debug badge EMPTY rapor etti.
     * Bu version: 3 katmanlı fallback + explicit loading.
     *
     * Pipeline:
     * 1. customContent dolu → onu kullan
     * 2. customContent boş → inline XSLT (build-time embed)
     * 3. inline boşsa → public/.../*.xslt fetch
     * 4. Hicbiri yoksa → placeholder devam (kullaniciya bildir)
     */
    const [xsltLoading, setXsltLoading] = useState(true);
    const [xsltSource, setXsltSource] = useState<'custom' | 'inline' | 'fetched' | 'none'>('none');

    useEffect(() => {
        let cancelled = false;
        setXsltLoading(true);
        async function loadXslt() {
            let xslt = customContent?.trim() || '';
            let source: 'custom' | 'inline' | 'fetched' | 'none' = 'none';

            if (xslt) {
                source = 'custom';
            } else {
                // Katman 1: inline (build-time embed, aninda)
                const inline = getDefaultXsltInline(moduleId);
                if (inline && inline.length > 100) {
                    xslt = inline;
                    source = 'inline';
                } else {
                    // Katman 2: public/.../*.xslt fetch (coklu base URL)
                    const fetched = await fetchDefaultXslt(moduleId);
                    if (cancelled) return;
                    if (fetched) {
                        xslt = fetched;
                        source = 'fetched';
                    }
                    // Katman 3: hicbiri yoksa placeholder (xslt bos kalir)
                }
            }

            if (cancelled) return;

            setXsltSource(source);
            ds.setCurrentXslt(xslt);
            ds.setXml(SAMPLE_FATURA_XML);
            if (xslt) {
                try {
                    const sections = xsltToSections(xslt);
                    ds.setSections(sections);
                } catch (parseErr) {
                    // eslint-disable-next-line no-console
                    console.error('[DesignerApp] xsltToSections failed:', parseErr);
                }
            }

            // eslint-disable-next-line no-console
            console.log(
                `[DesignerApp] XSLT (${source}): ${xslt.length} chars · module=${moduleId || 'fallback'}`
            );
            setXsltLoading(false);
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
                    onSave={handleSaveDesign}
                    onExport={handleExportXslt}
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
                    onInlineEdit={handleInlineEdit}
                    onSelectElement={handleSelectElementByRenderIndex}
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

            {/* Sprint 1.2 DEBUG — runtime state badge (xsltLoading + source + sections total) */}
            <div
                data-designer-debug
                style={{
                    position: 'fixed',
                    top: 76,
                    left: 16,
                    padding: '6px 12px',
                    background: xsltLoading ? 'rgba(245, 158, 11, 0.92)' : 'rgba(15, 23, 42, 0.92)',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    color: '#e2e8f0',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    zIndex: 99,
                    pointerEvents: 'none',
                }}
            >
                {xsltLoading ? '⏳ XSLT yukleniyor...' : (
                    <>
                        xslt: {ds.state.currentXslt ? `${ds.state.currentXslt.length}c` : 'EMPTY'} ({xsltSource})
                        · sections: {Object.values(ds.state.sections).reduce((s, sec) => s + sec.elements.length, 0)} elements
                    </>
                )}
            </div>

            {/* Phase 18.1 — inline edit notification toast */}
            {inlineEditNotice && (
                <div
                    role="status"
                    style={{
                        position: 'fixed',
                        bottom: 56,
                        right: 16,
                        maxWidth: '420px',
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        color: 'white',
                        borderRadius: '10px',
                        fontSize: '12px',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                        zIndex: 100,
                        animation: 'fadeIn 0.2s ease-out',
                    }}
                >
                    {inlineEditNotice}
                </div>
            )}
        </div>
    );
};

export default DesignerApp;

// ============================================================================
// Phase A.1 — sections walk ile renderIndex'ten elementId bul
// ============================================================================

function findElementIdByRenderIndex(
    sections: DesignerStateV2['sections'],
    renderIndex: number
): string | null {
    for (const secId of Object.keys(sections) as SectionId[]) {
        for (const el of sections[secId].elements) {
            if (el.renderIndex === renderIndex) return el.id;
        }
    }
    return null;
}
