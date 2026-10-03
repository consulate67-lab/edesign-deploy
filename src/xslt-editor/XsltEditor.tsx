/**
 * XSLT Editor — Sprint 7 (2026-10-03)
 *
 * Selim'in brief'i: "XSLT editörü + canlı preview". Görsel WYSIWYG yerine
 * kod-bazlı editör — XSLT bilen kullanıcılar için (PHP gibi template mantığı).
 *
 * ProfesyonelDesigner'a dokunmaz, bağımsız 2. tasarım.
 *
 * Mevcut projenin parçalarını kullanır (yeniden yazmadan):
 * - transformXmlWithXslt (xsltTransformer.ts) — render pipeline
 * - getInlineXslt (xsltContent.ts) — modüle göre inline XSLT
 * - api.saveDesign (api.ts) — DB kayıt
 * - SAMPLE_XML — basit UBL-TR Invoice örneği
 *
 * Layout:
 * - Üst toolbar: Geri, Modül dropdown, Save, Download
 * - Sol %50: Monaco editor (XSLT / XML alt sekmeleri)
 * - Sağ %50: iframe preview + hata banner + render badge
 *
 * 500ms debounce ile canlı preview. Hata banner preview üstünde gösterilir.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import {
    ArrowLeft, Save, Download, ChevronDown, FileCode, FileCode2,
    AlertCircle, Eye, RefreshCw, CheckCircle2,
} from 'lucide-react';
import { transformXmlWithXslt } from '../xsltTransformer';
import { getInlineXslt } from '../xsltContent';
import { api } from '../api';

// ============================================================================
// Module registry — Selim'in 9 modülü (Selection.tsx ile senkron)
// ============================================================================

interface ModuleDef {
    id: string;
    label: string;
    /** xsltContent.ts INLINE_XSLT_CONTENT key (modüle göre inline XSLT) */
    inlineKey: string;
}

const MODULES: ModuleDef[] = [
    { id: 'fatura',        label: 'e-Fatura',          inlineKey: 'gib/v2/e-Fatura-Sablon.xslt' },
    { id: 'arsiv',         label: 'e-Arşiv',           inlineKey: 'gib/v2/e-Arsiv-Sablon.xslt' },
    { id: 'irsaliye',      label: 'e-İrsaliye',        inlineKey: 'community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt' },
    { id: 'ihracat',       label: 'e-İhracat',         inlineKey: 'community/IRPTeam-eFatura.xslt' },
    { id: 'mikro_ihracat', label: 'e-Mikro İhracat',   inlineKey: 'community/IRPTeam-eFatura.xslt' },
    { id: 'smm',           label: 'e-SMM',             inlineKey: 'community/hzkucuk-eFatura-smm.xslt' },
    { id: 'mustahsil',     label: 'e-Müstahsil',       inlineKey: 'community/hzkucuk-eFatura-mustahsil.xslt' },
    { id: 'bilet',         label: 'e-Bilet',           inlineKey: 'community/hzkucuk-eFatura-bilet.xslt' },
    { id: 'makbuz',        label: 'e-Makbuz',          inlineKey: 'community/hzkucuk-eFatura-makbuz.xslt' },
];

// ============================================================================
// Sample XML — basit UBL-TR Invoice örneği (Sprint 1'den alınmış, genişletildi)
// ============================================================================

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:ID>FTR-2026-00001</cbc:ID>
  <cbc:IssueDate>2026-09-28</cbc:IssueDate>
  <cbc:IssueTime>10:00:00</cbc:IssueTime>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>ÖRNEK TEDARİKÇİ A.Ş.</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Atatürk Cad. No:1</cbc:StreetName>
        <cbc:CityName>İstanbul</cbc:CityName>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>ÖRNEK MÜŞTERİ LTD.</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Cumhuriyet Cad. No:5</cbc:StreetName>
        <cbc:CityName>Ankara</cbc:CityName>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal><cbc:TaxAmount currencyID="TRY">180.00</cbc:TaxAmount></cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="TRY">1000.00</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="TRY">1000.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="TRY">1180.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="TRY">1180.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">10</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">500.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Name>Örnek Ürün A</cbc:Name></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">50.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
  <cac:InvoiceLine>
    <cbc:ID>2</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">10</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">500.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Name>Örnek Ürün B</cbc:Name></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">50.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

// ============================================================================
// Component
// ============================================================================

interface XsltEditorProps {
    /** Başlangıç modülü (Selection'dan veya default 'fatura'). */
    initialModuleId?: string;
    /** Başlangıç XSLT (yoksa modülün inline XSLT'si yüklenir). */
    initialXslt?: string;
    /** Tasarım adı (Save için). */
    docName?: string;
    /** Geri dön (Selection sayfasına). */
    onBack: () => void;
}

export const XSLTEditor: React.FC<XsltEditorProps> = ({
    initialModuleId = 'fatura',
    initialXslt,
    docName = 'XSLT Tasarım',
    onBack,
}) => {
    // ------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------
    const [moduleId, setModuleId] = useState<string>(initialModuleId);
    const [xsltContent, setXsltContent] = useState<string>('');
    const [xmlContent, setXmlContent] = useState<string>(SAMPLE_XML);
    const [activeTab, setActiveTab] = useState<'xslt' | 'xml'>('xslt');
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [renderDurationMs, setRenderDurationMs] = useState<number>(0);
    const [isRendering, setIsRendering] = useState<boolean>(false);
    const [moduleMenuOpen, setModuleMenuOpen] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState<string>('');

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ------------------------------------------------------------------------
    // Mevcut modül tanımı
    // ------------------------------------------------------------------------
    const currentModule = useMemo(
        () => MODULES.find(m => m.id === moduleId) || MODULES[0],
        [moduleId]
    );

    // ------------------------------------------------------------------------
    // Modül değişimi → inline XSLT yükle
    // ------------------------------------------------------------------------
    useEffect(() => {
        if (initialXslt && moduleId === initialModuleId) {
            // İlk yükleme, kullanıcı verisi varsa onu kullan
            setXsltContent(initialXslt);
            return;
        }
        const inline = getInlineXslt(currentModule.inlineKey);
        if (inline) {
            setXsltContent(inline);
            console.log(
                `[XSLTEditor] Module switch → ${currentModule.id} loaded ${inline.length} chars from ${currentModule.inlineKey}`
            );
        } else {
            console.warn(`[XSLTEditor] Inline XSLT yok: ${currentModule.inlineKey}`);
            setXsltContent('<!-- Bu modül için inline XSLT bulunamadı -->');
        }
    }, [moduleId, currentModule.inlineKey, initialXslt, initialModuleId]);

    // ------------------------------------------------------------------------
    // Canlı preview — 500ms debounce
    // ------------------------------------------------------------------------
    const renderPreview = useCallback(() => {
        setIsRendering(true);
        const start = performance.now();
        try {
            // BOM temizle (transformXmlWithXslt kendi yapar ama garanti olsun)
            let cleanXslt = xsltContent;
            if (cleanXslt.charCodeAt(0) === 0xFEFF) cleanXslt = cleanXslt.slice(1);
            let cleanXml = xmlContent;
            if (cleanXml.charCodeAt(0) === 0xFEFF) cleanXml = cleanXml.slice(1);

            const html = transformXmlWithXslt(cleanXml, cleanXslt);
            const dur = performance.now() - start;
            setPreviewHtml(html);
            setPreviewError(null);
            setRenderDurationMs(dur);
        } catch (err) {
            setPreviewError((err as Error).message || 'Bilinmeyen render hatası');
            setPreviewHtml('');
            setRenderDurationMs(performance.now() - start);
        } finally {
            setIsRendering(false);
        }
    }, [xsltContent, xmlContent]);

    // Debounce trigger
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(renderPreview, 500);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [renderPreview]);

    // İlk mount → hemen render (debounce yok)
    useEffect(() => {
        renderPreview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ------------------------------------------------------------------------
    // Save — POST /api/designs
    // ------------------------------------------------------------------------
    const handleSave = useCallback(async () => {
        setSaveStatus('saving');
        setSaveMessage('Kaydediliyor...');
        try {
            const designName = window.prompt?.('Tasarım adı:', docName) ?? docName;
            if (!designName || !designName.trim()) {
                setSaveStatus('idle');
                setSaveMessage('İptal edildi');
                return;
            }
            const result = await api.saveDesign({
                name: designName.trim(),
                module_id: moduleId,
                xslt_content: xsltContent,
                custom_content: undefined,
                theme_color: '#1e3a8a',
                sections: {},
                status: 'draft',
            });
            setSaveStatus('saved');
            setSaveMessage(`✅ Kaydedildi (#${result.design.id}) — "${result.design.name}"`);
            console.log('[XSLTEditor] Saved:', result.design);
        } catch (err) {
            setSaveStatus('error');
            setSaveMessage(`⚠ Kayıt hatası: ${(err as Error).message}`);
        }
    }, [docName, moduleId, xsltContent]);

    // ------------------------------------------------------------------------
    // Download .xslt
    // ------------------------------------------------------------------------
    const handleDownload = useCallback(() => {
        const fileName = `${docName.replace(/\s+/g, '_')}_${moduleId}.xslt`;
        const blob = new Blob([xsltContent], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSaveStatus('idle');
        setSaveMessage(`📥 İndirildi: ${fileName} · ${(xsltContent.length / 1024).toFixed(1)} kB`);
    }, [xsltContent, moduleId, docName]);

    // ------------------------------------------------------------------------
    // Module dropdown kapat (dış tıklama)
    // ------------------------------------------------------------------------
    useEffect(() => {
        if (!moduleMenuOpen) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-module-menu]')) {
                setModuleMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [moduleMenuOpen]);

    // ------------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------------
    return (
        <div
            data-xslt-editor
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                background: '#0f172a',
                color: '#e2e8f0',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                overflow: 'hidden',
            }}
        >
            {/* Üst toolbar — 56px */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    height: '56px',
                    padding: '0 16px',
                    background: '#1e293b',
                    borderBottom: '1px solid #334155',
                    flexShrink: 0,
                }}
            >
                {/* Geri butonu */}
                <button
                    onClick={onBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        borderRadius: '6px',
                        color: '#a5b4fc',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                    title="Geri (Selection)"
                >
                    <ArrowLeft size={16} />
                    Geri
                </button>

                {/* Tasarım adı */}
                <div
                    style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#cbd5e1',
                        marginRight: '8px',
                    }}
                >
                    {docName}
                </div>

                {/* Modül dropdown */}
                <div data-module-menu style={{ position: 'relative' }}>
                    <button
                        onClick={() => setModuleMenuOpen(!moduleMenuOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '6px',
                            color: '#34d399',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        <FileCode size={14} />
                        {currentModule.label}
                        <ChevronDown size={14} />
                    </button>
                    {moduleMenuOpen && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                left: 0,
                                minWidth: '220px',
                                background: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '6px',
                                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                                padding: '4px',
                                zIndex: 50,
                            }}
                        >
                            {MODULES.map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => { setModuleId(m.id); setModuleMenuOpen(false); }}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        background: m.id === moduleId ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                        color: m.id === moduleId ? '#a5b4fc' : '#cbd5e1',
                                        fontSize: '13px',
                                        fontWeight: m.id === moduleId ? 700 : 500,
                                        transition: 'background 0.1s',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (m.id !== moduleId) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (m.id !== moduleId) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    {m.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Save status message */}
                {saveMessage && (
                    <div
                        style={{
                            padding: '4px 10px',
                            background: saveStatus === 'error'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : saveStatus === 'saved'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : 'transparent',
                            border: saveStatus === 'error'
                                ? '1px solid rgba(239, 68, 68, 0.4)'
                                : saveStatus === 'saved'
                                    ? '1px solid rgba(16, 185, 129, 0.4)'
                                    : '1px solid transparent',
                            borderRadius: '4px',
                            color: saveStatus === 'error'
                                ? '#fca5a5'
                                : saveStatus === 'saved'
                                    ? '#6ee7b7'
                                    : '#94a3b8',
                            fontSize: '11px',
                            fontWeight: 600,
                            maxWidth: '320px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {saveMessage}
                    </div>
                )}

                {/* Save butonu */}
                <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: saveStatus === 'saved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        borderRadius: '6px',
                        color: '#a5b4fc',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
                        opacity: saveStatus === 'saving' ? 0.6 : 1,
                    }}
                >
                    {saveStatus === 'saving' ? (
                        <RefreshCw size={14} className="spin" />
                    ) : saveStatus === 'saved' ? (
                        <CheckCircle2 size={14} />
                    ) : (
                        <Save size={14} />
                    )}
                    Kaydet
                </button>

                {/* Download butonu */}
                <button
                    onClick={handleDownload}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                    }}
                >
                    <Download size={14} />
                    İndir .xslt
                </button>
            </div>

            {/* Ana grid: Sol editör %50, Sağ preview %50 */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    flex: 1,
                    minHeight: 0,
                }}
            >
                {/* SOL — Monaco editör */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#1e1e1e',
                        borderRight: '1px solid #334155',
                        minWidth: 0,
                    }}
                >
                    {/* Sekme header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0 12px',
                            height: '36px',
                            background: '#0f172a',
                            borderBottom: '1px solid #334155',
                        }}
                    >
                        {(['xslt', 'xml'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 12px',
                                    background: activeTab === tab ? '#1e293b' : 'transparent',
                                    border: 'none',
                                    borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                                    color: activeTab === tab ? '#a5b4fc' : '#94a3b8',
                                    fontSize: '12px',
                                    fontWeight: activeTab === tab ? 700 : 500,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                {tab === 'xslt' ? <FileCode size={13} /> : <FileCode2 size={13} />}
                                {tab.toUpperCase()} · {(activeTab === tab ? (tab === 'xslt' ? xsltContent.length : xmlContent.length) : 0).toLocaleString()} chars
                            </button>
                        ))}
                        <div style={{ flex: 1 }} />
                        <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                            {activeTab === 'xslt'
                                ? `XSLT · ${(xsltContent.length / 1024).toFixed(1)} kB`
                                : `XML · ${(xmlContent.length / 1024).toFixed(1)} kB`
                            }
                        </div>
                    </div>

                    {/* Monaco editör alanı */}
                    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                        <Editor
                            height="100%"
                            language="xml"
                            theme="vs-dark"
                            value={activeTab === 'xslt' ? xsltContent : xmlContent}
                            onChange={(value) => {
                                const v = value || '';
                                if (activeTab === 'xslt') setXsltContent(v);
                                else setXmlContent(v);
                            }}
                            options={{
                                minimap: { enabled: true, scale: 1 },
                                fontSize: 13,
                                fontFamily: '"Fira Code", "Cascadia Code", Menlo, Monaco, Consolas, monospace',
                                wordWrap: 'on',
                                automaticLayout: true,
                                tabSize: 2,
                                lineNumbers: 'on',
                                renderLineHighlight: 'all',
                                scrollBeyondLastLine: false,
                                folding: true,
                                bracketPairColorization: { enabled: true },
                                formatOnPaste: true,
                                cursorBlinking: 'smooth',
                            }}
                        />
                    </div>
                </div>

                {/* SAĞ — Preview */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#0f172a',
                        minWidth: 0,
                    }}
                >
                    {/* Preview header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 12px',
                            height: '36px',
                            background: '#1e293b',
                            borderBottom: '1px solid #334155',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                        }}
                    >
                        <Eye size={13} color="#34d399" />
                        <span style={{ color: '#6ee7b7' }}>Canlı Önizleme</span>
                        <div style={{ flex: 1 }} />
                        {isRendering ? (
                            <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <RefreshCw size={11} className="spin" /> Render ediliyor...
                            </span>
                        ) : previewError ? (
                            <span style={{ color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={11} /> Hata
                            </span>
                        ) : (
                            <span style={{ color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={11} /> {renderDurationMs.toFixed(1)}ms
                            </span>
                        )}
                    </div>

                    {/* Hata banner */}
                    {previewError && (
                        <div
                            style={{
                                padding: '10px 16px',
                                background: 'rgba(239, 68, 68, 0.12)',
                                borderBottom: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#fca5a5',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                maxHeight: '120px',
                                overflow: 'auto',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <AlertCircle size={14} />
                                <strong>Render Hatası</strong>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '11px' }}>
                                {previewError}
                            </div>
                        </div>
                    )}

                    {/* iframe */}
                    <div style={{ flex: 1, minHeight: 0, position: 'relative', background: 'white' }}>
                        {previewHtml ? (
                            <iframe
                                ref={iframeRef}
                                srcDoc={previewHtml}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    background: 'white',
                                }}
                                title="XSLT Render Preview"
                            />
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#94a3b8',
                                    fontSize: '14px',
                                    background: '#1e293b',
                                }}
                            >
                                {previewError ? 'Render hatası — XSLT/XML\'i kontrol edin' : 'Render bekleniyor...'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default XSLTEditor;