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
import { renderAndAnnotateXslt, parseXsltInstrumented, updateXSLTBinding, removeXsltBinding, insertXsltElement } from './utils/xsltRender';
import { api } from '../api';
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

// Sprint 15 Aşama 1 — Preview property drawer için helper componentler.
// Component dışında tanımlı (her render'da yeniden oluşmaz, performans +).
// FieldText: kısa text input (örn. src, alt, font-size).
// FieldSelect: dropdown (örn. font-weight, text-align, object-fit).
const FieldText: React.FC<{ label: string; currentValue: string; onChange: (v: string) => void; placeholder?: string }> = ({ label, currentValue, onChange, placeholder }) => (
    <div style={{ marginBottom: '10px' }}>
        <label style={{
            display: 'block',
            fontSize: '10px', fontWeight: 700, color: '#94a3b8',
            letterSpacing: '0.4px', textTransform: 'uppercase',
            marginBottom: '4px',
        }}>{label}</label>
        <input
            type="text"
            value={currentValue}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: '100%', padding: '6px 8px',
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: '4px', color: '#e2e8f0',
                fontSize: '12px', fontFamily: 'monospace', outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
        />
    </div>
);
const FieldSelect: React.FC<{ label: string; currentValue: string; options: string[]; onChange: (v: string) => void }> = ({ label, currentValue, options, onChange }) => (
    <div style={{ marginBottom: '10px' }}>
        <label style={{
            display: 'block',
            fontSize: '10px', fontWeight: 700, color: '#94a3b8',
            letterSpacing: '0.4px', textTransform: 'uppercase',
            marginBottom: '4px',
        }}>{label}</label>
        <select
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: '100%', padding: '6px 8px',
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: '4px', color: '#e2e8f0',
                fontSize: '12px', fontFamily: 'monospace', outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
        >
            {options.map(opt => (
                <option key={opt || '(none)'} value={opt}>{opt || '(default)'}</option>
            ))}
        </select>
    </div>
);

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
    // Sprint 11 Aşama 2 (2026-10-03) — Zoom default 1.00 (önceki 0.60).
    // Selim'in test ekranında scaledHeight = scrollHeight × 0.60 = 600px, container
    // ~640px → sığıyor → scroll YOK → alt içerik kesik (HESAP BİLGİLERİMİZ,
    // dipnot metni görünmüyor). Zoom 1.0 = scaledHeight = scrollHeight = container'dan
    // büyük → native scroll tetiklenir, tüm içerik erişilebilir. Zoom slider ile
    // küçültme hâlâ mümkün (%50-200%).
    const [previewZoom, setPreviewZoom] = useState<number>(1.00);
    // Sprint 10 Aşama 2 (2026-10-03) — iframe içeriğinin doğal yüksekliği (px).
    // iframe onLoad'ta iframe.contentDocument.body.scrollHeight ölçülerek set edilir.
    // scaledHeight = iframeHeight × previewZoom → container overflow doğal tetiklenir.
    const [iframeContentHeight, setIframeContentHeight] = useState<number>(800);
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

    // Sprint 14 Aşama 2 + Sprint 15 Aşama 1 — Property panel state (sağ drawer).
    // Discriminated union: source 'xslt' ise XSLT binding, source 'preview' ise
    // preview HTML element. Drawer source'a göre farklı form render eder.
    // - xslt: xpath/text/attribute inline edit (Sprint 14 Aşama 2)
    // - preview: tip-spesifik stil özellikleri (Sprint 15 Aşama 1)
    type SelectedObject =
        | { source: 'xslt'; binding: import('./utils/xsltRender').XsltBinding }
        | { source: 'preview'; element: HTMLElement; tagName: string; renderIndex: string | null }
        | { source: 'both'; binding: import('./utils/xsltRender').XsltBinding; previewElement: HTMLElement | null }
        | null;
    const [selectedObject, setSelectedObject] = useState<SelectedObject>(null);
    // Draft state — source'a göre alanlar:
    // - xslt: { value: string; attrName?: string }
    // - preview: Record<string, string> (örn: { 'font-weight': 'bold', color: '#9a3412' })
    const [propertyDraft, setPropertyDraft] = useState<Record<string, string>>({});
    const propertyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sprint 14 Aşama 2 — Property drawer Esc handler.
    // Drawer açıkken Esc basılırsa drawer'ı kapat. useEffect document keydown
    // listener ekler, cleanup'ta kaldırır.
    useEffect(() => {
        if (!selectedObject) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedObject(null);
                e.stopPropagation();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [selectedObject]);

    // Sprint 14 Aşama 1 — Sol panel XSLT alanları 3-gruplu liste.
    // parseXsltInstrumented Pass 1 (dropdown), Pass 2 (static), Pass 3 (element)
    // binding'lerini kategorize gösterir. Selim'in brief'i: "xslt içindeki
    // tüm alanları özelliklerini gruplayarak kendi başlıkları altında getirelim".
    const [xsltSearch, setXsltSearch] = useState<string>('');
    const [xsltGroupExpanded, setXsltGroupExpanded] = useState<Record<'dropdown' | 'static' | 'element', boolean>>({
        dropdown: true,
        static: true,
        element: true,
    });
    // Sprint 9 Aşama 2c (2026-10-03) — Sol snippet paneli aç/kapat toggle.
    // Sprint 14 Aşama 1: artık 'XSLT Alanları' paneli (snippet gallery kaldırıldı).
    // Kapatılınca preview + editör tüm genişliği kaplar.
    const [snippetPanelOpen, setSnippetPanelOpen] = useState<boolean>(true);
    // Sprint 11 Aşama 6 (2026-10-03) — Preview'de tıklayınca editöre direkt
    // koordinat tabanlı scroll + highlight. data-line + data-column attribute'ları
    // renderAndAnnotateXslt tarafından eklenir (XSLT içindeki GERÇEK pozisyon).
    // XPath arama (Sprint 11.4 + 11.5) tamamen kaldırıldı — %100 doğru sonuç.
    // null değer: henüz tıklama yok
    const [previewSelectedLine, setPreviewSelectedLine] = useState<number | null>(null);
    const [previewSelectedColumn, setPreviewSelectedColumn] = useState<number | null>(null);
    // XSLT bindings listesi (xpath + offset + line + column). previewHtml
    // annotation'ında kullanılır.
    // Sprint 11 Aşama 8 — instrumented XSLT + bindings. parseXsltInstrumented
    // XSLT'e <xsl:comment>BIND_X</xsl:comment> marker ekler, render DOM comment
    // takibi ile %100 binding-text eşleşmesi sağlar.
    const [xsltInstrumented, setXsltInstrumented] = useState<{
        instrumentedXslt: string;
        bindings: import('./utils/xsltRender').XsltBinding[];
    }>({ instrumentedXslt: '', bindings: [] });

    // Sprint 16 Aşama 4 — Render edilen binding index'leri (0-based, bindings
    // array'inde pozisyon). xsl:if koşul false / xsl:choose boş / Pass 3
    // marker eklenmemiş elementler burada OLMAMAZ → sol panel kırmızı
    // gösterir. Hata varsa boş Set → renklendirme yapılmaz (default görünüm).
    const [renderedBindingIndexes, setRenderedBindingIndexes] = useState<Set<number>>(new Set());

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
            // BOM temizle (xsltRender kendi yapar ama garanti olsun)
            let cleanXslt = xsltContent;
            if (cleanXslt.charCodeAt(0) === 0xFEFF) cleanXslt = cleanXslt.slice(1);
            let cleanXml = xmlContent;
            if (cleanXml.charCodeAt(0) === 0xFEFF) cleanXml = cleanXml.slice(1);

            // Sprint 11 Aşama 6 + 8 — koordinatlı annotated render + comment-marker
            // tracking. renderAndAnnotateXslt instrumented XSLT kullanır, her
            // <xsl:comment>BIND_X</xsl:comment> marker'ı sonrasındaki dolu text
            // node'a annotation ekler → %100 doğru binding-text eşleşmesi.
            const result = renderAndAnnotateXslt(
                cleanXml,
                xsltInstrumented.instrumentedXslt,
                xsltInstrumented.bindings
            );
            setPreviewHtml(result.html);
            setPreviewError(result.error);
            setRenderDurationMs(result.durationMs);
            // Sprint 16 Aşama 4 — Render edilen binding index'leri.
            // Hata varsa boş Set (renklendirme yapılmaz, default görünüm).
            setRenderedBindingIndexes(result.renderedBindings ?? new Set());
        } catch (err) {
            setPreviewError((err as Error).message || 'Bilinmeyen render hatası');
            setPreviewHtml('');
            setRenderDurationMs(performance.now() - start);
            setRenderedBindingIndexes(new Set()); // hata → renklendirme YOK
        } finally {
            setIsRendering(false);
        }
    }, [xsltContent, xmlContent, xsltInstrumented]);

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
    // Sprint 14 Aşama 1 — XSLT alanları 3-gruplu liste (snippet gallery kaldırıldı)
    // ------------------------------------------------------------------------
    // xsltInstrumented.bindings'i kind'e göre grupla + arama filtresi uygula.
    const filteredBindingsByGroup = useMemo(() => {
        const q = xsltSearch.trim().toLowerCase();
        const groups: { dropdown: any[]; static: any[]; element: any[] } = {
            dropdown: [], static: [], element: [],
        };
        for (const b of xsltInstrumented.bindings) {
            const kind = b.kind || 'dropdown';
            if (q && !b.xpath.toLowerCase().includes(q) && !(b.elementType || '').toLowerCase().includes(q)) continue;
            groups[kind].push(b);
        }
        return groups;
    }, [xsltInstrumented.bindings, xsltSearch]);

    /**
     * Monaco editor'a snippet yapıştır.
     * executeEdits + forceInsertMarkers: ${1:placeholder} cursor otomatik.
     * Editor yoksa no-op (Monaco yüklenene kadar bekle).
     *
     * NOT: forceInsertMarkers Monaco'nun runtime'ında var, public TS type'ında
     * yok. Cast gerekli. Alternatif: editor.action.insertSnippet command'u —
     * ama o runtime'da async, cursor position garanti değil.
     *
     * Sprint 10 Aşama 2c (2026-10-03): snippet eklendikten sonra cursor
     * position → editor.revealPositionInCenter + deltaDecorations (sarı
     * highlight 2s). Kullanıcı snippet'ın nereye eklendiğini görsün.
     */
    // Sprint 14 Aşama 1 + Aşama 2 + Sprint 15 Aşama 1 — handleBindingClick:
    // sol panelden bir XSLT alanına tıklayınca:
    // 1) Monaco editöre scroll + sarı highlight (previewSelectedLine/Column)
    // 2) Sağ property drawer'ı aç (source='xslt') + draft state'i başlat
    // Inline edit → updateXSLTBinding → xsltContent güncellenir → preview
    // re-render tetiklenir.
    const handleBindingClick = useCallback((b: import('./utils/xsltRender').XsltBinding) => {
        setPreviewSelectedLine(b.line);
        setPreviewSelectedColumn(b.column);
        // Editor'ü focus et — aktif tab'a geç
        if (activeTab !== 'xslt') setActiveTab('xslt');
        const ed = editorRef.current;
        if (ed) ed.focus();
        // Sprint 14 Aşama 2 + Sprint 15 Aşama 3 — Property drawer'ı aç + draft başlat.
        // Eğer iframe'de son tıklanan preview element varsa, drawer birleşik
        // gösterir (XSLT bölüm + Preview font/stil bölümü).
        const previewEl = lastPreviewElementRef.current;
        setSelectedObject({
            source: previewEl ? 'both' : 'xslt',
            binding: b,
            previewElement: previewEl,
        });
        // Editable draft: kind'e göre mevcut değeri çıkar
        let draftValue = '';
        let attrName: string | undefined;
        if (b.kind === 'dropdown') {
            draftValue = b.xpath;
            attrName = 'select';
        } else if (b.kind === 'static') {
            draftValue = b.xpath.replace(/^static:\s*/, '');
            attrName = undefined;
        } else if (b.kind === 'element') {
            // xpath formatı: <xsl:if test="..."> → test="..." parçasını al
            const m = b.xpath.match(/(\w+)="([^"]*)"/);
            if (m) { attrName = m[1]; draftValue = m[2]; }
            else { attrName = 'select'; draftValue = ''; }
        }
        const draft: Record<string, string> = {};
        if (attrName) draft['__attr__'] = attrName;
        draft['value'] = draftValue;
        setPropertyDraft(draft);
        console.log(`[XSLTEditor] Sol panel binding click → line=${b.line}:${b.column} kind=${b.kind || 'dropdown'} draft="${draftValue}"`);
    }, [activeTab]);

    /**
     * Sprint 14 Aşama 2 — Property panel inline edit handler (XSLT source).
     * Her input değişikliğinde 300ms debounce ile XSLT güncellenir → Monaco
     * editöre yazılır → preview re-render tetiklenir.
     */
    const handleXsltPropertyChange = useCallback((newValue: string) => {
        setPropertyDraft(prev => ({ ...prev, value: newValue }));
        if (propertyDebounceRef.current) clearTimeout(propertyDebounceRef.current);
        propertyDebounceRef.current = setTimeout(() => {
            const sel = selectedObjectRef.current;
            if (!sel || sel.source !== 'xslt') return;
            const updated = updateXSLTBinding(xsltContent, sel.binding, newValue);
            if (updated !== xsltContent) {
                setXsltContent(updated);
                console.log(`[XSLTEditor] XSLT property update → line=${sel.binding.line} new="${newValue.substring(0, 40)}${newValue.length > 40 ? '...' : ''}"`);
            } else {
                console.warn(`[XSLTEditor] XSLT property update no-op (line=${sel.binding.line}) — tag multi-line olabilir`);
            }
        }, 300);
    }, [xsltContent]);

    /**
     * Sprint 15 Aşama 1 — Preview element tip-spesifik stil property handler.
     * Render-only inline style: iframe.contentDocument içindeki element'in
     * style.xxx özelliğini set eder. XSLT kaynak kodu değişmez, sadece
     * görsel önizleme güncellenir.
     */
    const handlePreviewPropertyChange = useCallback((styleKey: string, styleValue: string) => {
        setPropertyDraft(prev => ({ ...prev, [styleKey]: styleValue }));
        const sel = selectedObjectRef.current;
        if (!sel || sel.source !== 'preview') return;
        const el = sel.element;
        // CSS özelliğini uygula
        if (styleValue === '' || styleValue == null) {
            el.style.removeProperty(styleKey);
        } else {
            el.style.setProperty(styleKey, styleValue);
        }
        console.log(`[XSLTEditor] Preview style update → ${styleKey}: ${styleValue}`);
    }, []);

    /**
     * selectedObject için ref — handlePropertyChange closure'da güncel değeri
     * görmek için (useCallback dependency'yi minimize eder).
     */
    const selectedObjectRef = useRef(selectedObject);
    useEffect(() => { selectedObjectRef.current = selectedObject; }, [selectedObject]);

    // Sprint 15 Aşama 3 — Son tıklanan preview element ref. handleBindingClick
    // bu ref'i okuyarak selectedObject'e previewElement ekler → XSLT drawer'da
    // hem XSLT binding (xpath/text/attr) hem preview element (font/renk/kalınlık)
    // birleşik görünür. Selim'in brief'i: "font/kalınlık/çizgili ekrana gelmedi".
    const lastPreviewElementRef = useRef<HTMLElement | null>(null);

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
    // Sprint 11 Aşama 6 — Preview click → editör KOORDİNAT tabanlı scroll + highlight
    // ------------------------------------------------------------------------

    /**
     * XSLT içindeki xsl:value-of / xsl:copy-of binding'lerini parse et.
     * Her binding xpath + offset + line + column içerir (regex tabanlı,
     * XSLT string içindeki GERÇEK pozisyon). xsltContent değiştiğinde
     * yeniden hesapla → renderAndAnnotateXslt bu koordinatları render
     * DOM'a data-line + data-column olarak ekler.
     */
    useEffect(() => {
        setXsltInstrumented(parseXsltInstrumented(xsltContent));
    }, [xsltContent]);

    /**
     * Sprint 11 Aşama 7 — Monaco sol kenarda glyphMargin decoration.
     * Her binding için XSLT satırında küçük mor rozet + hover tooltip
     * (B1 → ./cac:Item/cbc:Name). Kullanıcı editörde hangi satırın
     * annotation'lı olduğunu net görür → haritalama netleşir.
     * glyphMarginWidth: 18 ile sol kenarda ~4px glyph + boşluk bırakılır.
     */
    const bindDecorationIdsRef = useRef<string[]>([]);

    useEffect(() => {
        const ed = editorRef.current;
        const monaco = monacoRef.current;
        if (!ed || !monaco) return;

        const decorations = xsltInstrumented.bindings.map((b, i) => ({
            range: new monaco.Range(b.line, 1, b.line, 1),
            options: {
                glyphMarginClassName: 'xslt-bind-glyph',
                glyphMarginHoverMessage: {
                    value: `**B${i + 1}** → \`${b.xpath}\` _(line ${b.line}:${b.column})_`,
                },
            },
        }));

        const oldIds = bindDecorationIdsRef.current;
        const newIds = ed.deltaDecorations(oldIds, decorations);
        bindDecorationIdsRef.current = newIds;

        return () => {
            if (ed && newIds.length > 0) {
                ed.deltaDecorations(newIds, []);
            }
        };
    }, [xsltInstrumented.bindings]);

    /**
     * Preview click → editör scroll + highlight (koordinat tabanlı).
     * previewSelectedLine/Column state'leri renderAndAnnotateXslt'in
     * eklediği data-line/data-column'dan gelir. XPath ARAMA YOK —
     * %100 doğru sonuç, multi-match sorunu ortadan kalktı.
     */
    useEffect(() => {
        if (previewSelectedLine === null || previewSelectedColumn === null) return;
        const ed = editorRef.current;
        const monaco = monacoRef.current;
        if (!ed || !monaco) return;

        const position = {
            lineNumber: previewSelectedLine,
            column: previewSelectedColumn,
        };
        ed.revealPositionInCenter(position);
        ed.setPosition(position);
        ed.focus();

        // 2 saniye sarı highlight — select="..." pattern'i bul ve highlight'la
        // (Monaco decoration'da tam xpath'i vurgulamak için)
        const model = ed.getModel();
        if (!model) return;
        const fullText = model.getValue();
        const lineStart = model.getOffsetAt({ lineNumber: previewSelectedLine, column: 1 });
        const lineEnd = model.getOffsetAt({ lineNumber: previewSelectedLine + 1, column: 1 }) - 1;
        const lineText = fullText.substring(lineStart, lineEnd);
        const xpathMatch = lineText.match(/select="([^"]+)"/);
        const highlightLen = xpathMatch ? xpathMatch[1].length : Math.min(20, lineText.length - position.column + 1);

        const decorationIds = ed.deltaDecorations([], [
            {
                range: new monaco.Range(
                    position.lineNumber, position.column,
                    position.lineNumber, position.column + highlightLen
                ),
                options: { inlineClassName: 'xslt-click-highlight' },
            },
        ]);
        setTimeout(() => {
            ed.deltaDecorations(decorationIds, []);
        }, 2000);

        console.log(
            `[XSLTEditor] Preview click → line=${previewSelectedLine}:` +
            `column=${previewSelectedColumn} highlight=${highlightLen} chars`
        );
    }, [previewSelectedLine, previewSelectedColumn]);

    /**
     * iframe.contentDocument.body click handler.
     * Tıklanan element'ten data-line + data-column al → state. Bu %100
     * doğru sonuç verir (annotation renderAndAnnotateXslt'te XSLT koordinatına
     * bağlı). XPath arama / multi-match sorunu YOK.
     */
    const handleIframeBodyClick = useCallback((e: Event) => {
        const target = e.target as HTMLElement | null;
        if (!target || typeof target.closest !== 'function') return;
        // Sprint 16 Aşama 3 — Tüm elementlere tıklama desteği. Önceki kod
        // sadece data-render-index olan elementlerde çalışıyordu
        // (closest('[data-render-index]') null ise return). e-Fatura-Sablon
        // XSLT'sinde 99 HTML element var ama sadece 38'inde data-render-index
        // var (xsl:value-of ile gelen dinamik veriler). Statik div/table
        // cell/başlık gibi 61 element tıklanamıyordu → Selim "hiçbir objeye
        // tıklayamıyorum" şikayeti. closest bulamazsa target'ın kendisini
        // kullan → tüm element'lere drawer aç.
        const indexedEl = target.closest('[data-render-index]') as HTMLElement | null
            || target;
        const lineAttr = indexedEl.getAttribute('data-line');
        const colAttr = indexedEl.getAttribute('data-column');
        const renderIndex = indexedEl.getAttribute('data-render-index');
        if (lineAttr && colAttr) {
            const line = Number(lineAttr);
            const column = Number(colAttr);
            if (!isNaN(line) && !isNaN(column)) {
                setPreviewSelectedLine(line);
                setPreviewSelectedColumn(column);
            }
        }
        e.preventDefault();
        e.stopPropagation();
        // Sprint 15 Aşama 1 + Sprint 16 Aşama 3 — Preview drawer aç
        // (tip-spesifik stil + sil butonları). renderIndex null ise XSLT
        // bağlantısı yok → drawer sadece style paneli gösterir.
        setSelectedObject({
            source: 'preview',
            element: indexedEl,
            tagName: indexedEl.tagName,
            renderIndex,
        });
        // Draft state'i mevcut style/computed değerleriyle başlat
        const draft: Record<string, string> = {};
        const cs = window.getComputedStyle(indexedEl);
        ['font-weight', 'font-style', 'text-decoration-line', 'font-size', 'color', 'text-align', 'font-family', 'object-fit'].forEach(k => {
            draft[k] = cs.getPropertyValue(k) || '';
        });
        setPropertyDraft(draft);
        // Sprint 15 Aşama 3 — Son tıklanan preview element ref'i güncelle.
        // handleBindingClick bu ref'i okuyarak drawer'ı birleşik gösterebilir.
        lastPreviewElementRef.current = indexedEl;
        console.log(`[XSLTEditor] Preview click → ${indexedEl.tagName} render-index=${renderIndex ?? '(yok — sadece stil paneli)'}`);
    }, []);

    /**
     * iframe yüklendiğinde:
     * 1. Content height ölç → 3 zaman noktasında (hemen + 50ms + 300ms)
     *    font/image yüklendikten sonra doğru scrollHeight. setIframeContentHeight
     *    debug amaçlı (style'a bağlanmadı — Sprint 10 A2c).
     * 2. Click listener bağla → preview click → editör scroll/highlight
     *    (Sprint 10 Aşama 2b, defensive: capture:true + setTimeout retry).
     *
     * iframe.contentDocument.body bazen ilk render'da null olabiliyor
     * (React render race). Bu yüzden useEffect yerine iframe onLoad event'i
     * kullanıyoruz — srcDoc her değiştiğinde tetiklenir.
     *
     * Sprint 10 Aşama 2c (2026-10-03): iframe.style.height artık KALDIRILDI.
     * iframe natural height (content'in gerçek yüksekliği) kullanılıyor;
     * iframe.style.overflow = 'hidden' → iframe kendi scroll'u yok,
     * container overflow:auto hem yatay hem dikey scroll'u tetikler.
     * Önceki yaklaşım (iframe.style.height = scrollHeight + iframe kendi
     * scroll) container'a scroll geçirmiyordu — Selim'in test ekranında
     * sağ ve alt kesik görünüyordu.
     */
    const handleIframeLoad = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentDocument;
        if (!doc) return;

        const bindListener = () => {
            const body = doc.body;
            if (!body) {
                console.warn('[XSLTEditor] iframe.body null — 100ms sonra retry');
                setTimeout(bindListener, 100);
                return;
            }

            // (1) İçerik yüksekliğini ölç — 3 zaman noktası:
            // - hemen (ilk DOM hazır)
            // - 50ms (paint sonrası font/layout)
            // - 300ms (image/font async yüklendikten sonra)
            const measureHeight = () => {
                const h = body.scrollHeight || body.offsetHeight || 800;
                setIframeContentHeight(h);
                console.log(`[XSLTEditor] iframe measured — body.scrollHeight=${h}px`);
            };
            measureHeight();
            setTimeout(measureHeight, 50);
            setTimeout(measureHeight, 300);

            // (2) Click listener bağla (capture:true → draggable content'te bile click yakalanır)
            // Sprint 16 — Event delegation: doc.addEventListener (body yerine).
            // Büyük XSLT'lerde body yavaş hazırlanıyor → body.addEventListener
            // kayboluyor. doc.addEventListener her zaman aktif.
            doc.addEventListener('click', handleIframeBodyClick, { capture: true });
            console.log('[XSLTEditor] iframe click listener attached (doc, capture:true)');
        };

        bindListener();
    }, [handleIframeBodyClick]);

    /**
     * iframe onLoad → handleIframeLoad. previewHtml değiştiğinde iframe
     * yeniden yüklenir → onLoad yeniden tetiklenir.
     * Eski useEffect [previewHtml] kaldırıldı (race condition + cleanup karışıktı).
     */
    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentDocument;
        if (!doc || !doc.body) return;

        // Önceki listener varsa temizle
        doc.removeEventListener('click', handleIframeBodyClick, { capture: true });
        // Yeniden bağla (previewHtml değişti, yeni body)
        const body = doc.body;
        const scrollH = body.scrollHeight || body.offsetHeight || 800;
        setIframeContentHeight(scrollH);
        // Sprint 16 — Event delegation: doc.addEventListener (body yerine).
        // Büyük XSLT'lerde (Antrepo 130k chars) body yavaş hazırlanıyor veya
        // re-render'da body'si değişebiliyor → body'sine bind listener kayboluyor.
        // document'te bind → her zaman çalışır, body değişse bile.
        doc.addEventListener('click', handleIframeBodyClick, { capture: true });
        // Sprint 15 Aşama 2 — HTML5 drag-drop listener (drop handler).
        const dragOverHandler = (e: DragEvent) => {
            if (e.dataTransfer?.types.includes('text/x-xslt-element')) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            }
        };
        const dropHandler = (e: DragEvent) => {
            const type = e.dataTransfer?.getData('text/x-xslt-element') as 'image' | 'text' | 'table' | 'input' | '';
            if (!type) return;
            e.preventDefault();
            e.stopPropagation();
            const updated = insertXsltElement(xsltContent, type);
            if (updated !== xsltContent) {
                setXsltContent(updated);
                console.log(`[XSLTEditor] Drop insert: ${type} (${updated.length - xsltContent.length} chars)`);
            }
        };
        body.addEventListener('dragover', dragOverHandler);
        body.addEventListener('drop', dropHandler);
        console.log(`[XSLTEditor] iframe listener re-bound (previewHtml changed, scrollHeight=${scrollH})`);

        return () => {
            const curDoc = iframe.contentDocument;
            if (curDoc) {
                curDoc.removeEventListener('click', handleIframeBodyClick, { capture: true });
                curDoc.body.removeEventListener('dragover', dragOverHandler);
                curDoc.body.removeEventListener('drop', dropHandler);
            }
        };
    }, [previewHtml, handleIframeBodyClick, xsltContent]);

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
                    position: 'relative',  // Sprint 14 Aşama 2 — property drawer absolute right:0
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
                        <span>XSLT Alanları</span>
                        <span style={{
                            marginLeft: 'auto',
                            padding: '2px 6px',
                            background: 'rgba(16, 185, 129, 0.18)',
                            borderRadius: '3px',
                            fontSize: '9px',
                            color: '#6ee7b7',
                        }}>
                            {xsltInstrumented.bindings.length}
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
                                value={xsltSearch}
                                onChange={(e) => setXsltSearch(e.target.value)}
                                placeholder="Ara: xpath, cbc:, if, forEach..."
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

                    {/* Sprint 14 Aşama 1 — 3-gruplu XSLT alanları listesi */}
                    <div
                        style={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            padding: '6px',
                        }}
                    >
                        {xsltInstrumented.bindings.length === 0 ? (
                            <div
                                style={{
                                    padding: '20px 12px',
                                    textAlign: 'center',
                                    color: '#64748b',
                                    fontSize: '11px',
                                }}
                            >
                                Bu XSLT'te binding bulunamadı.
                            </div>
                        ) : (
                            (['dropdown', 'static', 'element'] as const).map(group => {
                                const list = filteredBindingsByGroup[group];
                                const groupLabel = group === 'dropdown' ? 'Dinamik Veri'
                                    : group === 'static' ? 'Statik Metin'
                                    : 'Element Yapısı';
                                const groupColor = group === 'dropdown' ? '#a5b4fc'
                                    : group === 'static' ? '#6ee7b7'
                                    : '#fcd34d';
                                const groupBg = group === 'dropdown' ? 'rgba(99, 102, 241, 0.18)'
                                    : group === 'static' ? 'rgba(16, 185, 129, 0.18)'
                                    : 'rgba(252, 211, 77, 0.18)';
                                return (
                                    <div key={group} style={{ marginBottom: '8px' }}>
                                        <button
                                            onClick={() => setXsltGroupExpanded(prev => ({ ...prev, [group]: !prev[group] }))}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 8px',
                                                background: groupBg,
                                                border: '1px solid ' + groupColor + '40',
                                                borderRadius: '4px',
                                                color: groupColor,
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.4px',
                                            }}
                                        >
                                            <span>{xsltGroupExpanded[group] ? '▼' : '▶'}</span>
                                            <span>{groupLabel}</span>
                                            <span style={{
                                                marginLeft: 'auto',
                                                padding: '1px 5px',
                                                background: '#0f172a',
                                                borderRadius: '3px',
                                                fontSize: '9px',
                                                fontWeight: 700,
                                                color: groupColor,
                                            }}>
                                                {list.length}
                                            </span>
                                        </button>
                                        {xsltGroupExpanded[group] && list.length > 0 && (
                                            <div style={{ marginTop: '4px' }}>
                                                {list.map((b, idx) => {
                                                    const globalIndex = xsltInstrumented.bindings.indexOf(b) + 1;
                                                    // Sprint 16 Aşama 4 — Render durumu rengi.
                                                    // Render DOM'da görünüyorsa (renderedBindingIndexes'te
                                                    // var) yeşil, görünmüyorsa kırmızı, render
                                                    // henüz yapılmadıysa / hata varsa renksiz.
                                                    const isRendered = renderedBindingIndexes.has(globalIndex - 1);
                                                    const renderStatusColor = isRendered ? '#10b981' : '#ef4444';
                                                    const showRenderStatus = renderedBindingIndexes.size > 0;
                                                    const displayText = b.kind === 'dropdown'
                                                        ? b.xpath
                                                        : b.kind === 'static'
                                                            ? b.xpath.replace(/^static:\s*/, '').slice(0, 36)
                                                            : (b.elementType || '') + (b.xpath.includes('=') ? ' ' + (b.xpath.match(/(\w+)="([^"]*)"/)?.[1] || '') + '="..."' : '');
                                                    return (
                                                        <div
                                                            key={idx}
                                                            data-xslt-binding
                                                            data-bind-line={b.line}
                                                            data-bind-col={b.column}
                                                            onClick={() => handleBindingClick(b)}
                                                            title={`Satır ${b.line}, col ${b.column} — ${b.xpath}${showRenderStatus ? (isRendered ? '  ✓ Render\'da görünüyor' : '  ✗ Render\'da görünmüyor') : ''}`}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                padding: '5px 8px 5px 11px',
                                                                marginBottom: '2px',
                                                                background: '#1e293b',
                                                                border: '1px solid #334155',
                                                                borderLeft: showRenderStatus ? `3px solid ${renderStatusColor}` : '1px solid #334155',
                                                                borderRadius: '3px',
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
                                                            <span style={{
                                                                minWidth: '24px',
                                                                padding: '1px 4px',
                                                                background: groupBg,
                                                                border: '1px solid ' + groupColor + '50',
                                                                borderRadius: '3px',
                                                                fontSize: '9px',
                                                                fontWeight: 700,
                                                                color: groupColor,
                                                                textAlign: 'center',
                                                                fontFamily: 'monospace',
                                                            }}>
                                                                B{globalIndex}
                                                            </span>
                                                            <span style={{
                                                                flex: 1,
                                                                fontSize: '10px',
                                                                color: '#e2e8f0',
                                                                fontFamily: 'monospace',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}>
                                                                {displayText}
                                                            </span>
                                                            <span style={{
                                                                fontSize: '9px',
                                                                color: '#64748b',
                                                                fontFamily: 'monospace',
                                                            }}>
                                                                {b.line}:{b.column}
                                                            </span>
                                                            {/* Sprint 16 Aşama 4b — Render durumu ikonu.
                                                                showRenderStatus (renderedBindingIndexes.size > 0):
                                                                  ✓ (yeşil) = render DOM'da görünüyor
                                                                  ✗ (kırmızı) = render DOM'da görünmüyor (xsl:if false vb.)
                                                                  · (gri nokta) = render henüz yok / hata
                                                                border-left renk çubuğuna ek olarak görsel feedback sağlar.
                                                                XML yüklenmediğinde Set boş → tüm ·, kullanıcı render
                                                                yapmadığını anlar. */}
                                                            <span
                                                                title={showRenderStatus
                                                                    ? (isRendered ? 'Render\'da görünüyor' : 'Render\'da görünmüyor (xsl:if false vb.)')
                                                                    : 'Render henüz yapılmadı / XML yükle'}
                                                                style={{
                                                                    fontSize: '12px',
                                                                    fontWeight: 700,
                                                                    color: showRenderStatus
                                                                        ? (isRendered ? '#10b981' : '#ef4444')
                                                                        : '#64748b',
                                                                    minWidth: '12px',
                                                                    textAlign: 'center',
                                                                    lineHeight: '1',
                                                                }}
                                                            >
                                                                {showRenderStatus ? (isRendered ? '✓' : '✗') : '·'}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Sprint 15 Aşama 2 — Ekle bölümü (HTML5 drag-drop + click insert).
                        Sol panelden bir obje türünü sürükleyip preview'a bırak
                        (iframe.contentDocument body'sinde drop → setXsltContent +
                        renderPreview) veya tıkla (insertXsltElement ile aynı
                        XSLT'e ekleme). 4 tip: image, text, table, input. */}
                    <div
                        data-insert-panel
                        style={{
                            padding: '8px 10px',
                            borderTop: '1px solid #1e293b',
                            background: '#0a1024',
                        }}
                    >
                        <div style={{
                            fontSize: '10px', fontWeight: 700, color: '#94a3b8',
                            letterSpacing: '0.4px', textTransform: 'uppercase',
                            marginBottom: '6px',
                        }}>
                            Ekle (sürükle veya tıkla)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                            {[
                                { type: 'image' as const, label: '📷 Resim', color: '#a5b4fc' },
                                { type: 'text' as const, label: 'T Text', color: '#6ee7b7' },
                                { type: 'table' as const, label: '▦ Tablo', color: '#fcd34d' },
                                { type: 'input' as const, label: '▢ Input', color: '#fca5a5' },
                            ].map(item => (
                                <div
                                    key={item.type}
                                    draggable
                                    data-insert-type={item.type}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('text/x-xslt-element', item.type);
                                        e.dataTransfer.effectAllowed = 'copy';
                                    }}
                                    onClick={() => {
                                        const updated = insertXsltElement(xsltContent, item.type);
                                        if (updated !== xsltContent) {
                                            setXsltContent(updated);
                                            console.log(`[XSLTEditor] Click insert: ${item.type}`);
                                        }
                                    }}
                                    style={{
                                        padding: '8px',
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '4px',
                                        color: item.color,
                                        fontSize: '10px', fontWeight: 700,
                                        cursor: 'grab',
                                        textAlign: 'center',
                                        letterSpacing: '0.3px',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.borderColor = '#334155'; }}
                                >
                                    {item.label}
                                </div>
                            ))}
                        </div>
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
                                // Sprint 11 Aşama 7 — Sol glyphMargin açık
                                // (annotation referans rozetleri için).
                                glyphMargin: true,
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
                                onClick={() => setPreviewZoom(1.00)}
                                title="Default zoom (100%)"
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

                    {/* iframe — Sprint 11 Aşama 1 (2026-10-03): scaled render TAMAMEN YENIDEN.
                        transform: scale KALDIRILDI (3 farklı yaklaşım denendi, hepsi
                        container overflow:auto + flex layout quirks'ına takıldı).

                        Yeni yaklaşım: scaledWidth/scaledHeight iframe'in GERÇEK
                        width/height'i olarak set edilir (CSS zoom property kullanmadan,
                        yani transform'suz). iframe natural layout'a scaled boyutuyla
                        katılır → container overflow:auto scroll DOĞAL tetikler.

                        scaledWidth = previewZoom × 100% (container'ın yüzdesi)
                        scaledHeight = iframeContentHeight × previewZoom (px)

                        Container block layout'a geçti (flex center yerine), iframe
                        display:block + margin:0 auto ile ortalanır. */}
                    <div style={{
                        flex: 1, minHeight: 0, position: 'relative',
                        background: '#475569',  // koyu gri — ofis zemini
                        backgroundImage: 'radial-gradient(at 50% 50%, #64748b 0%, #1e293b 100%)',  // subtle vignette
                        overflow: 'auto',  // scroll DOĞAL — iframe scaledHeight container'ı aşarsa scroll
                        padding: '48px 24px',
                    }}>
                        {previewHtml ? (
                            <iframe
                                ref={iframeRef}
                                srcDoc={previewHtml}
                                onLoad={handleIframeLoad}
                                style={{
                                    border: '1px solid rgba(0,0,0,0.12)',
                                    background: 'white',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.55), 0 12px 24px -8px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.04)',
                                    borderRadius: '2px',  // hafif köşe yumuşama (kağıt kenarı)
                                    // Sprint 11.1: scaledWidth = previewZoom × 100% (container yüzdesi).
                                    // Antrepo 700px scaled 0.60 → 420px. Container ~800px → sığar.
                                    width: `${(100 / previewZoom) * 0.95}%`,
                                    maxWidth: '1100px',
                                    minWidth: '500px',
                                    // scaledHeight = iframeContentHeight × previewZoom.
                                    // iframe.contentDocument.body.scrollHeight 3 zaman
                                    // noktasında ölçülüyor (handleIframeLoad).
                                    height: `${Math.round(iframeContentHeight * previewZoom)}px`,
                                    display: 'block',
                                    margin: '0 auto',  // yatay ortala
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

                {/* Sprint 14 Aşama 2 + Sprint 15 Aşama 1 — Property Drawer (sağ slide-in, 360px).
                    source='xslt' ise XSLT binding edit (Sprint 14 Aşama 2).
                    source='preview' ise preview element tip-spesifik stil paneli (Sprint 15 Aşama 1). */}
                <div
                    data-property-drawer
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '360px',
                        background: '#0f172a',
                        borderLeft: '1px solid #334155',
                        transform: selectedObject ? 'translateX(0)' : 'translateX(100%)',
                        transition: 'transform 0.25s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 10,
                        boxShadow: selectedObject ? '-4px 0 16px rgba(0,0,0,0.5)' : 'none',
                    }}
                >
                    {/* XSLT source drawer (Sprint 14 Aşama 2) */}
                    {selectedObject?.source === 'xslt' && (() => {
                        const b = selectedObject.binding;
                        const kindDisplay = b.kind === 'dropdown' ? 'Dinamik Veri'
                            : b.kind === 'static' ? 'Statik Metin'
                            : 'Element Yapısı';
                        const kindColor = b.kind === 'dropdown' ? '#a5b4fc'
                            : b.kind === 'static' ? '#6ee7b7'
                            : '#fcd34d';
                        const globalIndex = xsltInstrumented.bindings.indexOf(b) + 1;
                        const fieldLabel = b.kind === 'dropdown' ? 'XPath (select)'
                            : b.kind === 'static' ? 'Metin İçeriği'
                            : `Attribute (${propertyDraft['__attr__'] || 'select'})`;
                        return (
                            <>
                                <div style={{
                                    padding: '12px 14px',
                                    background: '#0a1024',
                                    borderBottom: '1px solid #1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                    <div style={{
                                        minWidth: '34px',
                                        padding: '2px 6px',
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        border: '1px solid rgba(99, 102, 241, 0.5)',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#a5b4fc',
                                        textAlign: 'center',
                                        fontFamily: 'monospace',
                                    }}>
                                        B{globalIndex}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.4px' }}>
                                            Property · XSLT
                                        </div>
                                        <div style={{ fontSize: '10px', color: kindColor, fontWeight: 600, letterSpacing: '0.3px' }}>
                                            {kindDisplay}{b.elementType ? ` · xsl:${b.elementType}` : ''}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedObject(null)}
                                        title="Kapat (Esc)"
                                        data-close-property-drawer
                                        style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #334155', borderRadius: '4px', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div style={{ flex: 1, padding: '14px', overflowY: 'auto' }}>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: '6px' }}>
                                        {fieldLabel}
                                    </label>
                                    <textarea
                                        data-property-input
                                        value={propertyDraft.value || ''}
                                        onChange={(e) => handleXsltPropertyChange(e.target.value)}
                                        spellCheck={false}
                                        style={{
                                            width: '100%', minHeight: '60px', maxHeight: '300px',
                                            padding: '8px 10px', background: '#1e293b',
                                            border: '1px solid #334155', borderRadius: '4px',
                                            color: '#e2e8f0', fontSize: '12px', fontFamily: 'monospace',
                                            resize: 'vertical', outline: 'none',
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                    />
                                    <div style={{
                                        marginTop: '14px', padding: '10px 12px',
                                        background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)',
                                        borderRadius: '4px', fontSize: '10px', color: '#94a3b8', lineHeight: 1.5,
                                    }}>
                                        ℹ XSLT satırına yazılır (300ms debounce). Monaco editör + preview re-render.
                                    </div>

                                    {/* Sprint 15 Aşama 3b — Font/stil bölümü (her zaman göster).
                                        Preview'da anında değişiklik için önce sağdaki
                                        önizlemeden bir element tıklayın → preview element
                                        font/stil değerleri buraya dolar + uygulanır.
                                        Selim'in brief'i: "font/kalınlık/çizgili için bir
                                        şey gelmiyor" → preview click gerek kalmadan da
                                        font bölümü görünsün, kullanıcı hint'ten preview
                                        tıklamasını öğrensin. */}
                                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#fcd34d', letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            Önizleme Stilleri
                                        </div>
                                        {lastPreviewElementRef.current ? (
                                            <>
                                                <FieldSelect label="font-weight (kalınlık)" currentValue={window.getComputedStyle(lastPreviewElementRef.current).fontWeight} options={['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']} onChange={(v) => handlePreviewPropertyChange('font-weight', v)} />
                                                <FieldSelect label="font-style (eğik)" currentValue={window.getComputedStyle(lastPreviewElementRef.current).fontStyle} options={['normal', 'italic', 'oblique']} onChange={(v) => handlePreviewPropertyChange('font-style', v)} />
                                                <FieldSelect label="text-decoration (çizgili)" currentValue={window.getComputedStyle(lastPreviewElementRef.current).textDecorationLine} options={['none', 'underline', 'line-through', 'overline']} onChange={(v) => handlePreviewPropertyChange('text-decoration-line', v)} />
                                                <FieldText label="font-size" currentValue={window.getComputedStyle(lastPreviewElementRef.current).fontSize} onChange={(v) => handlePreviewPropertyChange('font-size', v)} />
                                                <FieldText label="color" currentValue={window.getComputedStyle(lastPreviewElementRef.current).color} onChange={(v) => handlePreviewPropertyChange('color', v)} />
                                                <FieldSelect label="text-align" currentValue={window.getComputedStyle(lastPreviewElementRef.current).textAlign} options={['left', 'right', 'center', 'justify']} onChange={(v) => handlePreviewPropertyChange('text-align', v)} />
                                                <FieldText label="font-family (font tipi)" currentValue={window.getComputedStyle(lastPreviewElementRef.current).fontFamily} onChange={(v) => handlePreviewPropertyChange('font-family', v)} />
                                            </>
                                        ) : (
                                            <div style={{
                                                padding: '12px 14px',
                                                background: 'rgba(252, 211, 77, 0.06)',
                                                border: '1px dashed rgba(252, 211, 77, 0.3)',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                color: '#fcd34d',
                                                lineHeight: 1.5,
                                            }}>
                                                <strong>ℹ Önizleme'den bir element tıklayın</strong> — sağdaki 'CANLI ÖNİZLEME' panelinde bir text/resim/tablo tıklayın, font/kalınlık/çizgili alanları dolar. Şu an sadece XSLT satırı seçili.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '10px 14px', background: '#0a1024',
                                    borderTop: '1px solid #1e293b', fontSize: '10px',
                                    color: '#64748b', fontFamily: 'monospace',
                                    display: 'flex', justifyContent: 'space-between',
                                }}>
                                    <span>Line {b.line}:col {b.column}</span>
                                    <span style={{ color: kindColor }}>{fieldLabel}</span>
                                </div>
                            </>
                        );
                    })()}

                    {/* Preview source drawer (Sprint 15 Aşama 1) */}
                    {selectedObject?.source === 'preview' && (() => {
                        const el = selectedObject.element;
                        const tag = selectedObject.tagName.toLowerCase();
                        const ri = selectedObject.renderIndex;
                        const cs = window.getComputedStyle(el);
                        // Tip-spesifik stil alanları
                        const isImg = tag === 'img';
                        const isText = ['p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'b', 'i', 'strong', 'em'].includes(tag);
                        const isTable = tag === 'table' || tag === 'tr';
                        const isInput = ['input', 'button', 'textarea', 'select'].includes(tag);
                        return (
                            <>
                                <div style={{
                                    padding: '12px 14px',
                                    background: '#0a1024',
                                    borderBottom: '1px solid #1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                    <div style={{
                                        minWidth: '34px',
                                        padding: '2px 6px',
                                        background: 'rgba(252, 211, 77, 0.2)',
                                        border: '1px solid rgba(252, 211, 77, 0.5)',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#fcd34d',
                                        textAlign: 'center',
                                        fontFamily: 'monospace',
                                    }}>
                                        P{ri || '?'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.4px' }}>
                                            Property · Preview
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#fcd34d', fontWeight: 600, letterSpacing: '0.3px' }}>
                                            &lt;{tag}&gt; {isImg ? '· Resim' : isText ? '· Text' : isTable ? '· Tablo' : isInput ? '· Input' : '· Element'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedObject(null)}
                                        title="Kapat (Esc)"
                                        data-close-property-drawer
                                        style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #334155', borderRadius: '4px', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div style={{ flex: 1, padding: '14px', overflowY: 'auto' }}>
                                    {/* Tip-spesifik stil alanları */}
                                    {isImg && (
                                        <>
                                            <FieldText label="src (URL)" currentValue={el.getAttribute('src') || ''} onChange={(v) => el.setAttribute('src', v)} />
                                            <FieldText label="alt" currentValue={el.getAttribute('alt') || ''} onChange={(v) => el.setAttribute('alt', v)} />
                                            <FieldText label="width" currentValue={el.getAttribute('width') || cs.width} onChange={(v) => { el.style.setProperty('width', v); }} />
                                            <FieldText label="height" currentValue={el.getAttribute('height') || cs.height} onChange={(v) => { el.style.setProperty('height', v); }} />
                                            <FieldSelect label="object-fit" currentValue={cs.objectFit} options={['', 'contain', 'cover', 'fill', 'scale-down', 'none']} onChange={(v) => handlePreviewPropertyChange('object-fit', v)} />
                                        </>
                                    )}
                                    {isText && (
                                        <>
                                            <FieldSelect label="font-weight (kalınlık)" currentValue={cs.fontWeight} options={['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']} onChange={(v) => handlePreviewPropertyChange('font-weight', v)} />
                                            <FieldSelect label="font-style (eğik)" currentValue={cs.fontStyle} options={['normal', 'italic', 'oblique']} onChange={(v) => handlePreviewPropertyChange('font-style', v)} />
                                            <FieldSelect label="text-decoration (çizgili)" currentValue={cs.textDecorationLine} options={['none', 'underline', 'line-through', 'overline']} onChange={(v) => handlePreviewPropertyChange('text-decoration-line', v)} />
                                            <FieldText label="font-size" currentValue={cs.fontSize} onChange={(v) => handlePreviewPropertyChange('font-size', v)} />
                                            <FieldText label="color" currentValue={cs.color} onChange={(v) => handlePreviewPropertyChange('color', v)} />
                                            <FieldSelect label="text-align" currentValue={cs.textAlign} options={['left', 'right', 'center', 'justify']} onChange={(v) => handlePreviewPropertyChange('text-align', v)} />
                                            <FieldText label="font-family (font tipi)" currentValue={cs.fontFamily} onChange={(v) => handlePreviewPropertyChange('font-family', v)} />
                                        </>
                                    )}
                                    {isTable && (
                                        <>
                                            <FieldText label="border" currentValue={cs.border} onChange={(v) => handlePreviewPropertyChange('border', v)} />
                                            {tag === 'table' && <FieldText label="cellpadding" currentValue={el.getAttribute('cellpadding') || ''} onChange={(v) => el.setAttribute('cellpadding', v)} />}
                                            {tag === 'table' && <FieldText label="cellspacing" currentValue={el.getAttribute('cellspacing') || ''} onChange={(v) => el.setAttribute('cellspacing', v)} />}
                                            <FieldText label="width" currentValue={cs.width} onChange={(v) => handlePreviewPropertyChange('width', v)} />
                                            <FieldText label="height" currentValue={cs.height} onChange={(v) => handlePreviewPropertyChange('height', v)} />
                                        </>
                                    )}
                                    {isInput && (
                                        <>
                                            <FieldText label="type" currentValue={el.getAttribute('type') || 'text'} onChange={(v) => el.setAttribute('type', v)} />
                                            <FieldText label="placeholder" currentValue={el.getAttribute('placeholder') || ''} onChange={(v) => el.setAttribute('placeholder', v)} />
                                            <FieldText label="value" currentValue={el.getAttribute('value') || ''} onChange={(v) => el.setAttribute('value', v)} />
                                            <FieldText label="font-size" currentValue={cs.fontSize} onChange={(v) => handlePreviewPropertyChange('font-size', v)} />
                                            <FieldText label="color" currentValue={cs.color} onChange={(v) => handlePreviewPropertyChange('color', v)} />
                                        </>
                                    )}
                                    {!isImg && !isText && !isTable && !isInput && (
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                            Bu element tipi için özel stil alanı yok. Genel CSS özellikleri yakında eklenecek.
                                        </div>
                                    )}
                                    <div style={{
                                        marginTop: '14px', padding: '10px 12px',
                                        background: 'rgba(252, 211, 77, 0.08)', border: '1px solid rgba(252, 211, 77, 0.25)',
                                        borderRadius: '4px', fontSize: '10px', color: '#94a3b8', lineHeight: 1.5,
                                    }}>
                                        ℹ Render-only inline style — XSLT değişmez. Sadece görsel önizleme güncellenir (Sprint 16'da XSLT'ye yansıtma).
                                    </div>
                                </div>
                                <div style={{
                                    padding: '10px 14px', background: '#0a1024',
                                    borderTop: '1px solid #1e293b', fontSize: '10px',
                                    color: '#64748b', fontFamily: 'monospace',
                                    display: 'flex', justifyContent: 'space-between', gap: '6px',
                                }}>
                                    <button
                                        onClick={() => { el.style.display = el.style.display === 'none' ? '' : 'none'; setSelectedObject(null); }}
                                        title="Sadece preview'dan gizle"
                                        data-hide-preview-element
                                        style={{
                                            flex: 1, padding: '6px 8px',
                                            background: 'rgba(252, 211, 77, 0.15)',
                                            border: '1px solid rgba(252, 211, 77, 0.4)',
                                            borderRadius: '4px', color: '#fcd34d',
                                            fontSize: '10px', fontWeight: 700, cursor: 'pointer',
                                        }}
                                    >
                                        👁 Gizle
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Sprint 15 Aşama 2 — XSLT'ten sil. selectedObject
                                            // içindeki element'in data-line'ından binding'i
                                            // bul, removeXsltBinding ile XSLT string'ten
                                            // kaldır. Multi-line tag ve explicit close
                                            // durumlarında no-op döner.
                                            if (selectedObject.source !== 'preview') return;
                                            const el = selectedObject.element;
                                            const lineAttr = el.getAttribute('data-line');
                                            const colAttr = el.getAttribute('data-column');
                                            if (!lineAttr || !colAttr) {
                                                console.warn('[XSLTEditor] XSLT\'ten sil: data-line/data-column bulunamadı');
                                                return;
                                            }
                                            const line = Number(lineAttr);
                                            const column = Number(colAttr);
                                            if (isNaN(line) || isNaN(column)) {
                                                console.warn('[XSLTEditor] XSLT\'ten sil: line/column NaN');
                                                return;
                                            }
                                            const fakeBinding = {
                                                xpath: '', offset: 0, line, column, kind: 'dropdown' as const,
                                            };
                                            const updated = removeXsltBinding(xsltContent, fakeBinding);
                                            if (updated !== xsltContent) {
                                                setXsltContent(updated);
                                                console.log(`[XSLTEditor] XSLT\'ten sil: line=${line}`);
                                                setSelectedObject(null);
                                            } else {
                                                console.warn(`[XSLTEditor] XSLT\'ten sil no-op (line=${line}, multi-line olabilir)`);
                                            }
                                        }}
                                        title="XSLT kaynak kodundan tamamen kaldır (geri alınamaz)"
                                        data-remove-from-xslt
                                        style={{
                                            flex: 1, padding: '6px 8px',
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            border: '1px solid rgba(239, 68, 68, 0.4)',
                                            borderRadius: '4px', color: '#fca5a5',
                                            fontSize: '10px', fontWeight: 700, cursor: 'pointer',
                                        }}
                                    >
                                        🗑 XSLT'ten Sil
                                    </button>
                                </div>
                            </>
                        );
                    })()}

                    {/* Sprint 15 Aşama 3 — Both source drawer (XSLT + Preview birleşik).
                        Sol panelden XSLT binding tıklanırken iframe'de son tıklanan
                        preview element varsa bu blok açılır. Üst kısımda XSLT
                        bölümü (xpath/text/attr), alt kısımda Preview bölümü
                        (font/renk/kalınlık/çizgili/eğik/boyut) gösterilir.
                        Selim'in brief'i: "font/kalınlık/çizgili ekrana gelmedi". */}
                    {selectedObject?.source === 'both' && (() => {
                        const b = selectedObject.binding;
                        const previewEl = selectedObject.previewElement;
                        if (!previewEl) return null;
                        const tag = previewEl.tagName.toLowerCase();
                        const cs = window.getComputedStyle(previewEl);
                        const isImg = tag === 'img';
                        const isText = ['p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'b', 'i', 'strong', 'em'].includes(tag);
                        const isTable = tag === 'table' || tag === 'tr';
                        const isInput = ['input', 'button', 'textarea', 'select'].includes(tag);
                        const kindDisplay = b.kind === 'dropdown' ? 'Dinamik Veri'
                            : b.kind === 'static' ? 'Statik Metin'
                            : 'Element Yapısı';
                        const kindColor = b.kind === 'dropdown' ? '#a5b4fc'
                            : b.kind === 'static' ? '#6ee7b7'
                            : '#fcd34d';
                        const globalIndex = xsltInstrumented.bindings.indexOf(b) + 1;
                        const fieldLabel = b.kind === 'dropdown' ? 'XPath (select)'
                            : b.kind === 'static' ? 'Metin İçeriği'
                            : `Attribute (${propertyDraft['__attr__'] || 'select'})`;
                        return (
                            <>
                                {/* Header — both badge */}
                                <div style={{
                                    padding: '12px 14px', background: '#0a1024',
                                    borderBottom: '1px solid #1e293b',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}>
                                    <div style={{
                                        minWidth: '34px', padding: '2px 6px',
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        border: '1px solid rgba(99, 102, 241, 0.5)',
                                        borderRadius: '4px', fontSize: '11px',
                                        fontWeight: 700, color: '#a5b4fc',
                                        textAlign: 'center', fontFamily: 'monospace',
                                    }}>B{globalIndex}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.4px' }}>
                                            Property · XSLT + Preview
                                        </div>
                                        <div style={{ fontSize: '10px', color: kindColor, fontWeight: 600, letterSpacing: '0.3px' }}>
                                            {kindDisplay}{b.elementType ? ` · xsl:${b.elementType}` : ''} + &lt;{tag}&gt;
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedObject(null)}
                                        title="Kapat (Esc)"
                                        data-close-property-drawer
                                        style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #334155', borderRadius: '4px', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                                    >✕</button>
                                </div>
                                <div style={{ flex: 1, padding: '14px', overflowY: 'auto' }}>
                                    {/* XSLT bölümü */}
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: '6px' }}>
                                        {fieldLabel}
                                    </label>
                                    <textarea
                                        data-property-input
                                        value={propertyDraft.value || ''}
                                        onChange={(e) => handleXsltPropertyChange(e.target.value)}
                                        spellCheck={false}
                                        style={{
                                            width: '100%', minHeight: '50px', maxHeight: '150px',
                                            padding: '8px 10px', background: '#1e293b',
                                            border: '1px solid #334155', borderRadius: '4px',
                                            color: '#e2e8f0', fontSize: '12px', fontFamily: 'monospace',
                                            resize: 'vertical', outline: 'none',
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                    />
                                    <div style={{
                                        marginTop: '6px', fontSize: '9px', color: '#64748b', fontFamily: 'monospace',
                                    }}>Line {b.line}:col {b.column}</div>
                                    {/* Preview bölümü — font/stil */}
                                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#fcd34d', letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            Önizleme Stilleri
                                        </div>
                                        {isImg && (
                                            <>
                                                <FieldText label="src (URL)" currentValue={previewEl.getAttribute('src') || ''} onChange={(v) => previewEl.setAttribute('src', v)} />
                                                <FieldText label="alt" currentValue={previewEl.getAttribute('alt') || ''} onChange={(v) => previewEl.setAttribute('alt', v)} />
                                                <FieldText label="width" currentValue={previewEl.getAttribute('width') || cs.width} onChange={(v) => previewEl.style.setProperty('width', v)} />
                                                <FieldText label="height" currentValue={previewEl.getAttribute('height') || cs.height} onChange={(v) => previewEl.style.setProperty('height', v)} />
                                                <FieldSelect label="object-fit" currentValue={cs.objectFit} options={['', 'contain', 'cover', 'fill', 'scale-down', 'none']} onChange={(v) => handlePreviewPropertyChange('object-fit', v)} />
                                            </>
                                        )}
                                        {isText && (
                                            <>
                                                <FieldSelect label="font-weight (kalınlık)" currentValue={cs.fontWeight} options={['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']} onChange={(v) => handlePreviewPropertyChange('font-weight', v)} />
                                                <FieldSelect label="font-style (eğik)" currentValue={cs.fontStyle} options={['normal', 'italic', 'oblique']} onChange={(v) => handlePreviewPropertyChange('font-style', v)} />
                                                <FieldSelect label="text-decoration (çizgili)" currentValue={cs.textDecorationLine} options={['none', 'underline', 'line-through', 'overline']} onChange={(v) => handlePreviewPropertyChange('text-decoration-line', v)} />
                                                <FieldText label="font-size" currentValue={cs.fontSize} onChange={(v) => handlePreviewPropertyChange('font-size', v)} />
                                                <FieldText label="color" currentValue={cs.color} onChange={(v) => handlePreviewPropertyChange('color', v)} />
                                                <FieldSelect label="text-align" currentValue={cs.textAlign} options={['left', 'right', 'center', 'justify']} onChange={(v) => handlePreviewPropertyChange('text-align', v)} />
                                                <FieldText label="font-family (font tipi)" currentValue={cs.fontFamily} onChange={(v) => handlePreviewPropertyChange('font-family', v)} />
                                            </>
                                        )}
                                        {isTable && (
                                            <>
                                                <FieldText label="border" currentValue={cs.border} onChange={(v) => handlePreviewPropertyChange('border', v)} />
                                                {tag === 'table' && <FieldText label="cellpadding" currentValue={previewEl.getAttribute('cellpadding') || ''} onChange={(v) => previewEl.setAttribute('cellpadding', v)} />}
                                                {tag === 'table' && <FieldText label="cellspacing" currentValue={previewEl.getAttribute('cellspacing') || ''} onChange={(v) => previewEl.setAttribute('cellspacing', v)} />}
                                                <FieldText label="width" currentValue={cs.width} onChange={(v) => handlePreviewPropertyChange('width', v)} />
                                                <FieldText label="height" currentValue={cs.height} onChange={(v) => handlePreviewPropertyChange('height', v)} />
                                            </>
                                        )}
                                        {isInput && (
                                            <>
                                                <FieldText label="type" currentValue={previewEl.getAttribute('type') || 'text'} onChange={(v) => previewEl.setAttribute('type', v)} />
                                                <FieldText label="placeholder" currentValue={previewEl.getAttribute('placeholder') || ''} onChange={(v) => previewEl.setAttribute('placeholder', v)} />
                                                <FieldText label="value" currentValue={previewEl.getAttribute('value') || ''} onChange={(v) => previewEl.setAttribute('value', v)} />
                                                <FieldText label="font-size" currentValue={cs.fontSize} onChange={(v) => handlePreviewPropertyChange('font-size', v)} />
                                                <FieldText label="color" currentValue={cs.color} onChange={(v) => handlePreviewPropertyChange('color', v)} />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '10px 14px', background: '#0a1024',
                                    borderTop: '1px solid #1e293b', fontSize: '10px',
                                    color: '#64748b', fontFamily: 'monospace',
                                    display: 'flex', justifyContent: 'space-between', gap: '6px',
                                }}>
                                    <button
                                        onClick={() => { previewEl.style.display = previewEl.style.display === 'none' ? '' : 'none'; setSelectedObject(null); }}
                                        title="Sadece preview'dan gizle"
                                        data-hide-preview-element
                                        style={{ flex: 1, padding: '6px 8px', background: 'rgba(252, 211, 77, 0.15)', border: '1px solid rgba(252, 211, 77, 0.4)', borderRadius: '4px', color: '#fcd34d', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
                                    >👁 Gizle</button>
                                    <button
                                        onClick={() => {
                                            const lineAttr = previewEl.getAttribute('data-line');
                                            const colAttr = previewEl.getAttribute('data-column');
                                            if (!lineAttr || !colAttr) return;
                                            const line = Number(lineAttr); const column = Number(colAttr);
                                            if (isNaN(line) || isNaN(column)) return;
                                            const fakeBinding = { xpath: '', offset: 0, line, column, kind: 'dropdown' as const };
                                            const updated = removeXsltBinding(xsltContent, fakeBinding);
                                            if (updated !== xsltContent) { setXsltContent(updated); setSelectedObject(null); }
                                        }}
                                        title="XSLT kaynak kodundan tamamen kaldır"
                                        data-remove-from-xslt
                                        style={{ flex: 1, padding: '6px 8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', color: '#fca5a5', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
                                    >🗑 XSLT'ten Sil</button>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default XSLTEditor;