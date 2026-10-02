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
import { DesignerSectionTree } from './DesignerSectionTree';
import { DesignerXmlFields } from './DesignerXmlFields';
import { DesignerCanvas } from './DesignerCanvas';
import { DesignerProperties } from './DesignerProperties';
import { DesignerStatusBar } from './DesignerStatusBar';
import { useDesignerState, type DesignerStateV2 } from './hooks/useDesignerState';
import type { DesignElement, SectionId } from '../../types.ts';
import { xsltToSections } from './utils/xsltToSections';
import { SAMPLE_FATURA_XML } from './utils/xsltRender';
import { getDefaultXsltInline, fetchDefaultXslt } from './utils/xsltDefaults';
import { exportSections, describeSections } from './utils/xsltExporter';
import { ExportPreviewModal } from './ExportPreviewModal';
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

    const handlePlaceElement = (element: DesignElement, overrideSectionId?: SectionId) => {
        ds.pushHistory();
        // Sprint 4 Aşama 1 — overrideSectionId varsa (drop koordinatından otomatik hesaplanan),
        // o section'a ekle VE aktif section'ı da değiştir (kullanıcı feedback)
        const targetSectionId = overrideSectionId || ds.state.activeSectionId;
        ds.placeElement(targetSectionId, element);
        if (targetSectionId !== ds.state.activeSectionId) {
            ds.setActiveSection(targetSectionId);
        }
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
     * Sprint 3 Aşama 3 (2026-10-02) — Export önizleme modalı.
     * İndir tıklanınca XSLT doğrudan inmez, önce modal açılır.
     * Kullanıcı içeriği görür, sonra "İndir" tıklarsa gerçek download başlar.
     */
    const [exportPreview, setExportPreview] = useState<{
        isOpen: boolean;
        content: string;
        fileName: string;
        stats: ReturnType<typeof describeSections>;
    }>({
        isOpen: false,
        content: '',
        fileName: '',
        stats: { totalElements: 0, bindingsCount: 0, shapesCount: 0, sectionSummary: [] },
    });

    const handlePreviewExport = () => {
        const stats = describeSections(ds.state.sections);
        const xslt = exportSections(ds.state.sections, {
            customContent: ds.state.currentXslt?.trim() ? ds.state.currentXslt : undefined,
            docName,
            templateTitle: template,
        });
        const fileName = `${(docName || 'tasarim').replace(/\s+/g, '_')}.xslt`;
        setExportPreview({ isOpen: true, content: xslt, fileName, stats });
    };

    /**
     * Modal içinden "İndir" butonu → gerçek Blob download.
     */
    const handleDownloadFromPreview = () => {
        const { content, fileName } = exportPreview;
        const blob = new Blob([content], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportPreview((prev) => ({ ...prev, isOpen: false }));
        setInlineEditNotice(
            `📥 XSLT indirildi: ${fileName} · ${exportPreview.stats.totalElements} element (${exportPreview.stats.bindingsCount} XML binding)`
        );
    };

    /**
     * Sprint 2 Aşama 5 (2026-10-02) — XSLT load pipeline (4 katmanlı, fetch öncelikli).
     *
     * Selim "EMPTY (inline)" gördü → generated.ts encoding bozuktu. Şimdi:
     * 1. customContent dolu → onu kullan (kullanıcı override)
     * 2. customContent boş → public/.../*.xslt fetch (UTF-8 garantili, git-tracked)
     * 3. fetch başarısız → inline XSLT (build-time embed, generated.ts)
     * 4. Hiçbiri yoksa → placeholder (kullanıcıya bildir)
     *
     * Sıralama değişikliği nedeni: generated.ts build artifact, encoding bug'larına
     * açık. public/*.xslt ise git-tracked ve UTF-8 doğru.
     */
    const [xsltLoading, setXsltLoading] = useState(true);
    const [xsltSource, setXsltSource] = useState<'custom' | 'inline' | 'fetched' | 'none'>('none');
    const [xsltError, setXsltError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setXsltLoading(true);
        setXsltError(null);
        async function loadXslt() {
            let xslt = customContent?.trim() || '';
            let source: 'custom' | 'inline' | 'fetched' | 'none' = 'none';
            let lastError: string | null = null;

            if (xslt) {
                source = 'custom';
            } else {
                // Katman 1: public/.../*.xslt fetch (UTF-8 garantili, tercih edilen)
                try {
                    const fetched = await fetchDefaultXslt(moduleId);
                    if (cancelled) return;
                    if (fetched && fetched.length > 100) {
                        xslt = fetched;
                        source = 'fetched';
                    } else {
                        lastError = 'fetch boş döndü';
                    }
                } catch (err) {
                    lastError = `fetch hatası: ${(err as Error).message}`;
                }

                // Katman 2: fetch başarısız → inline fallback (build-time embed)
                if (source === 'none') {
                    const inline = getDefaultXsltInline(moduleId);
                    if (inline && inline.length > 100) {
                        xslt = inline;
                        source = 'inline';
                    } else {
                        lastError = `${lastError || ''} + inline boş`;
                    }
                }
            }

            if (cancelled) return;

            setXsltSource(source);
            setXsltError(source === 'none' ? lastError : null);
            ds.setCurrentXslt(xslt);
            ds.setXml(SAMPLE_FATURA_XML);
            if (xslt) {
                try {
                    const sections = xsltToSections(xslt);
                    ds.setSections(sections);
                } catch (parseErr) {
                    // eslint-disable-next-line no-console
                    console.error('[DesignerApp] xsltToSections failed:', parseErr);
                    setXsltError(`XSLT parse hatası: ${(parseErr as Error).message?.slice(0, 100)}`);
                }
            }

            // eslint-disable-next-line no-console
            console.log(
                `[DesignerApp] XSLT (${source}): ${xslt.length} chars · module=${moduleId || 'fallback'}${lastError ? ` · lastError=${lastError}` : ''}`
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
                gridTemplateColumns: '320px 1fr 320px',
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
                    onExport={handlePreviewExport}
                />
            </div>

            <div style={{ gridArea: 'sidebar', borderRight: '1px solid #1e293b', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <DesignerSectionTree
                        sections={ds.state.sections}
                        activeSectionId={ds.state.activeSectionId}
                        selectedElementId={ds.state.selectedElementId}
                        onSelectSection={ds.setActiveSection}
                        onSelectElement={ds.selectElement}
                        onDeleteElement={ds.deleteElement}
                    />
                </div>
                <div style={{ flex: 1, minHeight: 0, borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
                    <DesignerXmlFields />
                </div>
            </div>

            <div style={{ gridArea: 'canvas', overflow: 'auto', background: '#1e293b' }}>
                <DesignerCanvas
                    state={ds.state}
                    onPlaceElement={handlePlaceElement}
                    onInlineEdit={handleInlineEdit}
                    onSelectElement={handleSelectElementByRenderIndex}
                    onCanvasResize={ds.setCanvasSize}
                    onCanvasReset={ds.resetCanvasSize}
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

            {/* Sprint 2 Aşama 5 DEBUG — runtime state badge (renk + emoji + anlamlı mesaj) */}
            <div
                data-designer-debug
                style={{
                    position: 'fixed',
                    top: 76,
                    left: 16,
                    padding: '6px 12px',
                    background: xsltLoading
                        ? 'rgba(245, 158, 11, 0.92)' // amber — loading
                        : xsltSource === 'none'
                            ? 'rgba(239, 68, 68, 0.92)' // red — error
                            : 'rgba(16, 185, 129, 0.92)', // green — success
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    zIndex: 99,
                    pointerEvents: 'none',
                    maxWidth: '420px',
                }}
            >
                {xsltLoading ? (
                    <>⏳ XSLT yükleniyor...</>
                ) : xsltSource === 'none' ? (
                    <>⚠ XSLT yüklenemedi ({xsltError || 'bilinmeyen hata'})</>
                ) : (
                    <>
                        ✅ XSLT {(ds.state.currentXslt.length / 1024).toFixed(1)}kB ({xsltSource})
                        {' · '}sections: {Object.values(ds.state.sections).reduce((s, sec) => s + sec.elements.length, 0)} elements
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

            {/* Sprint 3 Aşama 3 — Export önizleme modalı */}
            <ExportPreviewModal
                isOpen={exportPreview.isOpen}
                content={exportPreview.content}
                fileName={exportPreview.fileName}
                stats={exportPreview.stats}
                onClose={() => setExportPreview((prev) => ({ ...prev, isOpen: false }))}
                onDownload={handleDownloadFromPreview}
            />
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
