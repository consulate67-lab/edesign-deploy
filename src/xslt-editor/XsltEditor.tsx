/**
 * XSLT Editor — Sprint 7 (2026-10-03)
 * + Sprint 8 Aşama 1 (2026-10-03): Snippet gallery — sol panel, 12 XSLT snippet
 *
 * Selim'in brief'i: "XSLT editörü + canlı preview". Görsel WYSIWYG yerine
 * kod-bazlı editör — XSLT bilen kullanıcılar için (PHP gibi template mantığı).
 *
 * Sprint 8 ekleme: Snippet gallery — kod yazma hızını 2x artırır.
 * Tıkla → Monaco'nun insertSnippet API'si ile ${1:placeholder} cursor oluşur,
 * kullanıcı Tab ile gezer. UBL-TR e-Fatura/e-Arşiv için 12 hazır snippet:
 * Yapı (template/param), Döngü (for-each/sort), Koşul (choose/if),
 * Format (para/tarih), Hesaplama (sum/KDV), Tablo (başlık/satır).
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
 * - Sol 240px: Snippet gallery (kategori filtre + liste)
 * - Orta 1fr: Monaco editor (XSLT / XML alt sekmeleri)
 * - Sağ 1fr: iframe preview + hata banner + render badge
 *
 * 500ms debounce ile canlı preview. Hata banner preview üstünde gösterilir.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import {
    ArrowLeft, Save, Download, ChevronDown, FileCode, FileCode2,
    AlertCircle, Eye, RefreshCw, CheckCircle2, Sparkles, Search, ZoomIn, ZoomOut,
    PanelLeftClose, PanelLeftOpen, X,
} from 'lucide-react';
import { transformXmlWithXslt } from '../xsltTransformer';
import { getInlineXslt } from '../xsltContent';
import { getAntrepoTemplateById } from './antrepoTemplates';
import { api } from '../api';
import {
    SNIPPETS, SNIPPET_CATEGORIES, getSnippetsByCategory, getCategoryCounts,
    type XsltSnippet, type SnippetCategory,
} from './snippets';
import { XSLT_ELEMENTS, UBL_XPATHS, lintXslt } from './xsltSchema';

// ============================================================================
// Module registry — Selim'in 9 modülü (Selection.tsx ile senkron)
// ============================================================================

interface ModuleDef {
    id: string;
    label: string;
    /** xsltContent.ts INLINE_XSLT_CONTENT key (modüle göre inline XSLT) — minimal şablonlar için */
    inlineKey?: string;
    /** Sprint 9 — Antrepo template ID'si (büyük gerçek XSLT'ler için) */
    antrepoId?: string;
    /** Sprint 9 — Antrepo ise true (dropdown'da "Antrepo" badge gösterir) */
    isAntrepo?: boolean;
}

const MODULES: ModuleDef[] = [
    // Minimal şablonlar (gib/v2/ veya community/)
    { id: 'fatura',        label: 'e-Fatura',          inlineKey: 'gib/v2/e-Fatura-Sablon.xslt' },
    { id: 'arsiv',         label: 'e-Arşiv',           inlineKey: 'gib/v2/e-Arsiv-Sablon.xslt' },
    { id: 'irsaliye',      label: 'e-İrsaliye',        inlineKey: 'community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt' },
    { id: 'ihracat',       label: 'e-İhracat',         inlineKey: 'community/IRPTeam-eFatura.xslt' },
    { id: 'mikro_ihracat', label: 'e-Mikro İhracat',   inlineKey: 'community/IRPTeam-eFatura.xslt' },
    { id: 'smm',           label: 'e-SMM',             inlineKey: 'community/hzkucuk-eFatura-smm.xslt' },
    { id: 'mustahsil',     label: 'e-Müstahsil',       inlineKey: 'community/hzkucuk-eFatura-mustahsil.xslt' },
    { id: 'bilet',         label: 'e-Bilet',           inlineKey: 'community/hzkucuk-eFatura-bilet.xslt' },
    { id: 'makbuz',        label: 'e-Makbuz',          inlineKey: 'community/hzkucuk-eFatura-makbuz.xslt' },

    // Sprint 9 — Antrepo profesyonel şablonlar (public/ altından, ?raw inline)
    { id: 'antrepo-fatura', label: 'Antrepo e-Fatura',  antrepoId: 'antrepo-fatura', isAntrepo: true },
    { id: 'antrepo-arsiv',  label: 'Antrepo e-Arşiv',   antrepoId: 'antrepo-arsiv',  isAntrepo: true },
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
    // Sprint 9 Aşama 2a (2026-10-03) — Preview zoom slider. Antrepo XSLT gibi
    // fixed-width (700px) içerikler için varsayılan zoom 0.65 ile sığdır.
    const [previewZoom, setPreviewZoom] = useState<number>(0.65);
    const [renderDurationMs, setRenderDurationMs] = useState<number>(0);
    const [isRendering, setIsRendering] = useState<boolean>(false);
    const [moduleMenuOpen, setModuleMenuOpen] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState<string>('');

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    // Sprint 8 Aşama 2 — Monaco API instance (provider kayıt + marker set için)
    const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sprint 8 Aşama 1 — Snippet gallery state
    const [snippetCategory, setSnippetCategory] = useState<SnippetCategory | 'all'>('all');
    const [snippetSearch, setSnippetSearch] = useState<string>('');
    // Sprint 9 Aşama 2c (2026-10-03) — Sol snippet paneli aç/kapat toggle.
    // Kapatılınca preview + editör tüm genişliği kaplar (Antrepo XSLT 700px tam sığar).
    const [snippetPanelOpen, setSnippetPanelOpen] = useState<boolean>(true);

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
        // Sprint 9 — Antrepo ise antrepoTemplates'tan al
        if (currentModule.antrepoId) {
            const tmpl = getAntrepoTemplateById(currentModule.antrepoId);
            if (tmpl) {
                setXsltContent(tmpl.xslt);
                console.log(
                    `[XSLTEditor] Module switch → ${currentModule.id} loaded Antrepo ${tmpl.xslt.length} chars`
                );
                return;
            }
            console.warn(`[XSLTEditor] Antrepo template bulunamadı: ${currentModule.antrepoId}`);
            setXsltContent('<!-- Antrepo template bulunamadı -->');
            return;
        }
        // Minimal şablonlar — xsltContent'ten al
        const inline = getInlineXslt(currentModule.inlineKey || '');
        if (inline) {
            setXsltContent(inline);
            console.log(
                `[XSLTEditor] Module switch → ${currentModule.id} loaded ${inline.length} chars from ${currentModule.inlineKey}`
            );
        } else {
            console.warn(`[XSLTEditor] Inline XSLT yok: ${currentModule.inlineKey}`);
            setXsltContent('<!-- Bu modül için inline XSLT bulunamadı -->');
        }
    }, [moduleId, currentModule.antrepoId, currentModule.inlineKey, initialXslt, initialModuleId]);

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
    // Snippet gallery — Sprint 8 Aşama 1
    // ------------------------------------------------------------------------

    const categoryCounts = useMemo(() => getCategoryCounts(), []);

    /**
     * Filtrelenmiş snippet listesi (kategori + arama).
     */
    const filteredSnippets = useMemo(() => {
        const base = getSnippetsByCategory(snippetCategory);
        if (!snippetSearch.trim()) return base;
        const q = snippetSearch.toLowerCase();
        return base.filter(s =>
            s.label.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q)
        );
    }, [snippetCategory, snippetSearch]);

    /**
     * Monaco editor'a snippet yapıştır.
     * executeEdits + forceInsertMarkers: ${1:placeholder} cursor otomatik.
     * Editor yoksa no-op (Monaco yüklenene kadar bekle).
     *
     * NOT: forceInsertMarkers Monaco'nun runtime'ında var, public TS type'ında
     * yok. Cast gerekli. Alternatif: editor.action.insertSnippet command'u —
     * ama o runtime'da async, cursor position garanti değil.
     */
    const handleSnippetInsert = useCallback((snippet: XsltSnippet) => {
        const ed = editorRef.current;
        if (!ed) {
            console.warn('[XSLTEditor] Editor ref yok, snippet eklenemedi:', snippet.id);
            return;
        }
        const selection = ed.getSelection();
        if (!selection) return;
        // Monaco internal API — snippet expansion. Cast ile bypass.
        const edit = {
            range: selection,
            text: snippet.template,
            forceInsertMarkers: true,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.executeEdits('snippet', [edit] as any);
        ed.focus();
        console.log(`[XSLTEditor] Snippet eklendi: ${snippet.id} (${snippet.template.length} chars)`);
    }, []);

    /**
     * Editor mount — ref + Monaco API sakla, XSLT autocomplete provider kayıt.
     * 2 provider: XSLT element + UBL-TR XPath (select="..." içinde).
     * (handleEditorMount detayı Sprint 8 Aşama 2 bloğunda — aşağıda).
     */

    // ------------------------------------------------------------------------
    // Sprint 8 Aşama 2 — XSLT autocomplete + lint
    // ------------------------------------------------------------------------

    /**
     * Lint runner — xsltContent değişince 800ms debounce ile lint et,
     * Monaco'ya marker yaz. Tag balance, deprecated, format-number uyarıları.
     */
    useEffect(() => {
        if (activeTab !== 'xslt') return; // sadece XSLT tab'ında lint et
        const monaco = monacoRef.current;
        if (!monaco) return;

        const t = setTimeout(() => {
            const ed = editorRef.current;
            if (!ed) return;
            const model = ed.getModel();
            if (!model) return;

            const issues = lintXslt(xsltContent);
            const markers = issues.map(issue => ({
                severity: issue.severity === 'error'
                    ? monaco.MarkerSeverity.Error
                    : issue.severity === 'warning'
                        ? monaco.MarkerSeverity.Warning
                        : monaco.MarkerSeverity.Info,
                message: issue.message,
                startLineNumber: issue.lineNumber,
                startColumn: issue.column,
                endLineNumber: issue.endLineNumber,
                endColumn: issue.endColumn,
            }));
            monaco.editor.setModelMarkers(model, 'xslt-lint', markers);
        }, 800);

        return () => clearTimeout(t);
    }, [xsltContent, activeTab]);

    /**
     * Editor mount — ref + Monaco API sakla, XSLT autocomplete provider kayıt.
     * 2 provider: XSLT element + UBL-TR XPath (select="..." içinde).
     */
    const handleEditorMount = useCallback((ed: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
        editorRef.current = ed;
        monacoRef.current = monaco;
        console.log('[XSLTEditor] Monaco editor mount edildi, XSLT provider kayıt ediliyor');

        // ── Provider 1: XSLT element + attribute ─────────────────────────
        // Trigger: < (yeni tag),  (attribute space), = (attribute value start)
        monaco.languages.registerCompletionItemProvider('xml', {
            triggerCharacters: ['<', ' ', '='],
            provideCompletionItems: (model, position) => {
                const line = model.getLineContent(position.lineNumber);
                const beforeCursor = line.substring(0, position.column - 1);

                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                // 1. "xsl:" prefix'i — XSLT element öner
                if (beforeCursor.match(/<\s*xsl:$/)) {
                    return {
                        suggestions: XSLT_ELEMENTS.map(el => ({
                            label: el.fullName,
                            kind: monaco.languages.CompletionItemKind.Function,
                            insertText: el.empty
                                ? `${el.name} $1/>$0`
                                : `${el.name} $1>$0</${el.fullName}>`,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: {
                                value: `**${el.fullName}**\n\n${el.description}\n\nCommon attrs: ${el.commonAttrs.join(', ') || 'yok'}`,
                                isTrusted: true,
                            },
                            detail: el.fullName,
                            range,
                        })),
                    };
                }

                // 2. "<" — herhangi bir tag açılışı (xsl: veya diğer)
                if (beforeCursor.endsWith('<') || beforeCursor.match(/<\s*$/)) {
                    const suggestions = [
                        ...XSLT_ELEMENTS.map(el => ({
                            label: el.fullName,
                            kind: monaco.languages.CompletionItemKind.Function,
                            insertText: el.empty
                                ? `${el.name} $1/>$0`
                                : `${el.name} $1>$0</${el.fullName}>`,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: { value: `${el.description}` },
                            detail: el.fullName,
                            range,
                        })),
                        // HTML template root için
                        {
                            label: 'html',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'html>$1</html>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'HTML kök element',
                            range,
                        },
                    ];
                    return { suggestions };
                }

                // 3. Attribute space (xsl:for-each gibi tag'in içi) — XSLT attribute öner
                if (beforeCursor.match(/<\s*xsl:\w+\s+$/)) {
                    const tagMatch = beforeCursor.match(/<\s*xsl:(\w+)/);
                    const tagName = tagMatch?.[1];
                    const elDef = XSLT_ELEMENTS.find(e => e.name === tagName);
                    if (!elDef) return { suggestions: [] };
                    return {
                        suggestions: elDef.commonAttrs.map(attr => ({
                            label: attr,
                            kind: monaco.languages.CompletionItemKind.Property,
                            insertText: `${attr}="$1"`,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: `${elDef.fullName} @${attr}`,
                            range,
                        })),
                    };
                }

                return { suggestions: [] };
            },
        });

        // ── Provider 2: UBL-TR XPath (select="..." içinde) ─────────────
        // Trigger: " (select attribute value start)
        monaco.languages.registerCompletionItemProvider('xml', {
            triggerCharacters: ['"', ':', '/'],
            provideCompletionItems: (model, position) => {
                const line = model.getLineContent(position.lineNumber);
                const beforeCursor = line.substring(0, position.column - 1);

                // select="..." içinde miyiz?
                // Yaklaşık tespit: son olarak select=" açıldı ve henüz " kapanmadı
                const lastQuoteIdx = beforeCursor.lastIndexOf('"');
                const lastOpenIdx = beforeCursor.lastIndexOf('select="');
                if (lastOpenIdx === -1 || lastQuoteIdx > lastOpenIdx) {
                    return { suggestions: [] };
                }

                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                return {
                    suggestions: UBL_XPATHS.map(x => ({
                        label: x.xpath,
                        kind: monaco.languages.CompletionItemKind.Field,
                        insertText: x.xpath,
                        documentation: { value: x.description },
                        detail: 'UBL-TR XPath',
                        range,
                    })),
                };
            },
        });
    }, []);

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

                {/* Sprint 9 Aşama 2c — Sol snippet paneli aç/kapat toggle.
                    Kapatıldığında preview + editör tüm genişliği kaplar. */}
                <button
                    onClick={() => setSnippetPanelOpen(!snippetPanelOpen)}
                    title={snippetPanelOpen ? 'Snippet panelini kapat (preview genişler)' : 'Snippet panelini aç'}
                    data-toggle-snippet-panel
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        background: snippetPanelOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid ' + (snippetPanelOpen ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)'),
                        borderRadius: '6px',
                        color: snippetPanelOpen ? '#6ee7b7' : '#a5b4fc',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    {snippetPanelOpen
                        ? <PanelLeftClose size={14} />
                        : <PanelLeftOpen size={14} />}
                    {snippetPanelOpen ? 'Panel' : 'Panel Aç'}
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

            {/* Ana grid: snippet panel varsa 240px, yoksa 0 (preview + editör tüm alanı kaplar).
                Sol snippet paneli aç/kapat toggle — Sprint 9 Aşama 2c. */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: snippetPanelOpen ? '240px 1fr 1fr' : '0px 1fr 1fr',
                    flex: 1,
                    minHeight: 0,
                    transition: 'grid-template-columns 0.2s ease',
                }}
            >
                {/* SOL — Snippet gallery (Sprint 8 Aşama 1) */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#0f172a',
                        borderRight: '1px solid #334155',
                        minWidth: 0,
                    }}
                >
                    {/* Snippet header */}
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
                            color: '#34d399',
                        }}
                    >
                        <Sparkles size={13} />
                        <span>Snippet Galerisi</span>
                        <span style={{
                            marginLeft: 'auto',
                            padding: '2px 6px',
                            background: 'rgba(16, 185, 129, 0.18)',
                            borderRadius: '3px',
                            fontSize: '9px',
                            color: '#6ee7b7',
                        }}>
                            {SNIPPETS.length}
                        </span>
                        {/* Sprint 9 Aşama 2c — Panel kapat butonu (X) */}
                        <button
                            onClick={() => setSnippetPanelOpen(false)}
                            title="Snippet panelini kapat (preview alanı genişler)"
                            data-close-snippet-panel
                            style={{
                                marginLeft: '6px',
                                padding: '2px 4px',
                                background: 'transparent',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '3px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                e.currentTarget.style.color = '#fca5a5';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#64748b';
                            }}
                        >
                            <X size={12} />
                        </button>
                    </div>

                    {/* Arama input */}
                    <div
                        style={{
                            padding: '8px 10px',
                            borderBottom: '1px solid #1e293b',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <Search
                                size={12}
                                style={{
                                    position: 'absolute',
                                    left: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#64748b',
                                }}
                            />
                            <input
                                type="text"
                                value={snippetSearch}
                                onChange={(e) => setSnippetSearch(e.target.value)}
                                placeholder="Ara: KDV, tablo, döngü..."
                                style={{
                                    width: '100%',
                                    padding: '6px 8px 6px 26px',
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '4px',
                                    color: '#e2e8f0',
                                    fontSize: '11px',
                                    outline: 'none',
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                            />
                        </div>
                    </div>

                    {/* Kategori filtre chips */}
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '4px',
                            padding: '8px 10px',
                            borderBottom: '1px solid #1e293b',
                        }}
                    >
                        <button
                            onClick={() => setSnippetCategory('all')}
                            style={{
                                padding: '3px 9px',
                                background: snippetCategory === 'all' ? 'rgba(99, 102, 241, 0.25)' : '#1e293b',
                                border: '1px solid ' + (snippetCategory === 'all' ? 'rgba(99, 102, 241, 0.5)' : '#334155'),
                                borderRadius: '3px',
                                color: snippetCategory === 'all' ? '#a5b4fc' : '#94a3b8',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px',
                            }}
                        >
                            Hepsi · {SNIPPETS.length}
                        </button>
                        {SNIPPET_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSnippetCategory(cat)}
                                style={{
                                    padding: '3px 9px',
                                    background: snippetCategory === cat ? 'rgba(99, 102, 241, 0.25)' : '#1e293b',
                                    border: '1px solid ' + (snippetCategory === cat ? 'rgba(99, 102, 241, 0.5)' : '#334155'),
                                    borderRadius: '3px',
                                    color: snippetCategory === cat ? '#a5b4fc' : '#94a3b8',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px',
                                }}
                            >
                                {cat} · {categoryCounts[cat]}
                            </button>
                        ))}
                    </div>

                    {/* Snippet listesi */}
                    <div
                        style={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            padding: '6px',
                        }}
                    >
                        {filteredSnippets.length === 0 ? (
                            <div
                                style={{
                                    padding: '20px 12px',
                                    textAlign: 'center',
                                    color: '#64748b',
                                    fontSize: '11px',
                                }}
                            >
                                Sonuç yok. Arama veya kategoriyi değiştirin.
                            </div>
                        ) : (
                            filteredSnippets.map(s => (
                                <div
                                    key={s.id}
                                    data-snippet-id={s.id}
                                    onClick={() => handleSnippetInsert(s)}
                                    title={s.description}
                                    style={{
                                        padding: '8px 10px',
                                        marginBottom: '4px',
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'background 0.1s, border-color 0.1s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
                                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#1e293b';
                                        e.currentTarget.style.borderColor = '#334155';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginBottom: '4px',
                                    }}>
                                        <FileCode size={11} color="#34d399" />
                                        <span style={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: '#e2e8f0',
                                        }}>
                                            {s.label}
                                        </span>
                                        <span style={{
                                            marginLeft: 'auto',
                                            padding: '1px 5px',
                                            background: 'rgba(52, 211, 153, 0.12)',
                                            border: '1px solid rgba(52, 211, 153, 0.3)',
                                            borderRadius: '3px',
                                            fontSize: '8px',
                                            fontWeight: 700,
                                            color: '#6ee7b7',
                                            letterSpacing: '0.5px',
                                            textTransform: 'uppercase',
                                        }}>
                                            {s.category}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: '#64748b',
                                        fontFamily: 'monospace',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        {s.preview || s.template.replace(/\s+/g, ' ').slice(0, 50)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ORTA — Monaco editör */}
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
                            onMount={handleEditorMount}
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

                        {/* Sprint 9 Aşama 2a — Zoom butonları (küçük) */}
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            padding: '0 4px',
                            marginLeft: '8px',
                            borderLeft: '1px solid #334155',
                        }}>
                            <button
                                onClick={() => setPreviewZoom(z => Math.max(0.25, Math.round((z - 0.1) * 100) / 100))}
                                title="Zoom out (-10%)"
                                style={{
                                    padding: '2px 4px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#a5b4fc'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                            >
                                <ZoomOut size={11} />
                            </button>
                            <span style={{
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                color: '#cbd5e1',
                                minWidth: '34px',
                                textAlign: 'center',
                                padding: '0 2px',
                            }}>
                                {Math.round(previewZoom * 100)}%
                            </span>
                            <button
                                onClick={() => setPreviewZoom(z => Math.min(2.0, Math.round((z + 0.1) * 100) / 100))}
                                title="Zoom in (+10%)"
                                style={{
                                    padding: '2px 4px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#a5b4fc'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                            >
                                <ZoomIn size={11} />
                            </button>
                            <button
                                onClick={() => setPreviewZoom(0.65)}
                                title="Default zoom (65%)"
                                style={{
                                    padding: '1px 5px',
                                    background: 'transparent',
                                    border: '1px solid #334155',
                                    borderRadius: '2px',
                                    color: '#94a3b8',
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px',
                                    marginLeft: '2px',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                                    e.currentTarget.style.color = '#a5b4fc';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = '#334155';
                                    e.currentTarget.style.color = '#94a3b8';
                                }}
                            >
                                Fit
                            </button>
                        </span>
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

                    {/* iframe — Sprint 9 Aşama 2d: A4 sheet görünümü.
                        Container flex center + büyük padding ile sayfa merkezde.
                        iframe aspectRatio A4 (1:1.414) + box-shadow büyük → gerçek
                        kağıt hissi. Zoom scale + transformOrigin center center. */}
                    <div style={{
                        flex: 1, minHeight: 0, position: 'relative',
                        background: '#475569',  // koyu gri — ofis zemini
                        backgroundImage: 'radial-gradient(at 50% 50%, #64748b 0%, #1e293b 100%)',  // subtle vignette
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        padding: '48px 24px',
                    }}>
                        {previewHtml ? (
                            <iframe
                                ref={iframeRef}
                                srcDoc={previewHtml}
                                style={{
                                    border: '1px solid rgba(0,0,0,0.12)',
                                    background: 'white',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.55), 0 12px 24px -8px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.04)',
                                    borderRadius: '2px',  // hafif köşe yumuşama (kağıt kenarı)
                                    // A4 aspect ratio: 1:1.414 (210mm × 297mm)
                                    aspectRatio: '1 / 1.414',
                                    // Container'a sığacak şekilde (scaled olurdu)
                                    width: `${(100 / previewZoom) * 0.95}%`,
                                    maxWidth: '1100px',
                                    minWidth: '500px',
                                    height: 'auto',
                                    transform: `scale(${previewZoom})`,
                                    transformOrigin: 'center center',
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