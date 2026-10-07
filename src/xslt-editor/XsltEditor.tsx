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
    PanelLeftClose, PanelLeftOpen, X, Lock,
    Image as ImageIcon, Type, Table2, TextCursorInput, Calculator, Plus, Columns3, Wallpaper, QrCode,
} from 'lucide-react';
import { karekodSnippet, hasQrLibrary } from './karekod';
import {
    getCatalog, docRootOf, detectInXslt, xsltLocalNameSet, bindingLabel, contextPathResolver, evaluateField,
    ensureDecimalFormat, isInLineContext, isLineField, fieldSnippet, fieldContent, formulaSnippet, formulaContent, formulaAttrs,
    readFormula, DEFAULT_FORMULA, FORMULA_OPS,
    type CatalogField, type FormulaModel,
} from './fieldCatalog';
import { transformXmlWithXslt } from '../xsltTransformer';
import { getInlineXslt } from '../xsltContent';
import { getAntrepoTemplateById } from './antrepoTemplates';
import { renderAndAnnotateXslt, parseXsltInstrumented, updateXSLTBinding, removeXsltBinding, nextXsltObjId, XSLT_ELEMENT_SNIPPETS } from './utils/xsltRender';
import type { XsltBinding, XsltInsertType } from './utils/xsltRender';
import {
    findBindingSourceOffset, findEnclosingLiteralTag, findImgTagBySrc, findObjTag,
    setTagAttribute, setTagStyleProperty, replaceElementContent, removeElement, escapeXmlText,
    annotateLiteralTags, findLiteralTagByOrdinal, insertAtTag, moveElement, documentEndOffset,
    type SourceTag, type InsertPosition,
} from './utils/xsltStyleEdit';
import { findLineTableCell, addColumnAfterCell } from './utils/tableColumns';
import { BG_FITS, readPageBackground, writePageBackground, imageFileToDataUrl, type PageBackground } from './utils/pageBackground';
import { addTestWatermark, stripTestWatermark, stripLeadingBom } from './utils/testWatermark';
import { ApproveDialog } from './ApproveDialog';

/** Satır formülü kolonunun varsayılan alanı (ilk bulunan). */
const LINE_FORMULA_KEYS = ['Invoice/InvoiceLine/LineExtensionAmount', 'DespatchAdvice/DespatchLine/DeliveredQuantity', 'ReceiptAdvice/ReceiptLine/ReceivedQuantity', 'CreditNote/CreditNoteLine/LineExtensionAmount', 'eBilet/bilet/tutar', 'eYolcuListesi/yolcuListesi/koltukListesi/koltuk/tutar'];

const CONTAINER_TAGS = new Set(['td', 'th', 'div', 'li', 'section', 'article', 'header', 'footer', 'main', 'aside', 'form', 'fieldset']);
const TABLE_PARTS = new Set(['tr', 'tbody', 'thead', 'tfoot', 'colgroup', 'col', 'caption']);
const VOID_TAGS = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'wbr']);

/**
 * Önizlemedeki bir öğeden ekleme / taşıma hedefi: XSLT'deki literal etiketin
 * sıra numarası (data-xsrc) ve konum. 'auto' kapsayıcılarda (hücre, div)
 * içine, diğerlerinde altına ekler. Eklenen objeler bölünmez kabul edilir
 * (tablo içeriği panelden yeniden üretildiği için içine eklenen kaybolur).
 * null → gövdenin sonu.
 */
type InsertTarget = { el: HTMLElement; ordinal: number; position: InsertPosition };
function resolveInsertTarget(start: Element | null, mode: 'auto' | InsertPosition): InsertTarget | null {
    let el = start?.closest<HTMLElement>('[data-xsrc]') ?? null;
    if (!el) return null;
    const obj = el.closest<HTMLElement>('[data-xslt-obj]');
    let position: InsertPosition;
    if (obj) {
        el = obj;
        position = 'after';
    } else {
        const tag = el.tagName.toLowerCase();
        if (tag === 'html' || tag === 'body' || tag === 'head') return null;
        if (TABLE_PARTS.has(tag)) {
            el = el.closest<HTMLElement>('table[data-xsrc]');
            if (!el) return null;
            position = 'after';
        } else if (mode === 'auto') {
            position = CONTAINER_TAGS.has(tag) ? 'inside' : 'after';
        } else {
            position = VOID_TAGS.has(tag) ? 'after' : mode;
        }
        // Hücrenin "altı" satırın içi olur (geçersiz HTML) — tablonun altına konur.
        if (position === 'after' && (tag === 'td' || tag === 'th')) {
            el = el.closest<HTMLElement>('table[data-xsrc]');
            if (!el) return null;
        }
    }
    const ordinal = Number(el.getAttribute('data-xsrc'));
    return Number.isNaN(ordinal) ? null : { el, ordinal, position };
}
import { api, designKeyOf } from '../api';
import { PaymentModal } from '../PaymentModal';
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
    { id: 'irsaliye-yanit', label: 'e-İrsaliye Yanıtı', inlineKey: 'gib/irsaliye-yaniti.xslt' },
    { id: 'ihracat',       label: 'e-İhracat',         inlineKey: 'community/IRPTeam-eFatura.xslt' },
    { id: 'mikro_ihracat', label: 'e-Mikro İhracat',   inlineKey: 'community/IRPTeam-eFatura.xslt' },
    { id: 'smm',           label: 'e-SMM',             inlineKey: 'gib/v2/e-SMM-Sablon.xslt' },
    { id: 'mustahsil',     label: 'e-Müstahsil',       inlineKey: 'gib/v2/e-Mustahsil-Makbuzu.xslt' },
    { id: 'gider-pusulasi', label: 'e-Gider Pusulası', inlineKey: 'gib/gider-pusulasi.xslt' },
    { id: 'doviz',         label: 'e-Döviz / Maden Alım',  inlineKey: 'gib/doviz-maden-alim.xslt' },
    { id: 'doviz-satim',   label: 'e-Döviz / Maden Satım', inlineKey: 'gib/doviz-maden-satim.xslt' },
    { id: 'dekont',        label: 'e-Dekont',          inlineKey: 'gib/dekont.xslt' },
    { id: 'sigorta-komisyon', label: 'e-Sigorta Komisyon', inlineKey: 'gib/sigorta-komisyon-gider.xslt' },
    { id: 'bilet',         label: 'e-Bilet',           inlineKey: 'community/hzkucuk-eFatura-bilet.xslt' },
    { id: 'bilet-rapor',   label: 'e-Bilet Raporu',    inlineKey: 'ebilet/ebilet-rapor.xslt' },
    { id: 'bilet-yolcu',   label: 'e-Yolcu Listesi',   inlineKey: 'ebilet/ebilet-yolcu-listesi.xslt' },
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
    /** Önizleme verisi (sihirbazda seçilen XML; yoksa yerleşik örnek fatura). */
    initialXml?: string;
    /** Tasarım adı (Save için). */
    docName?: string;
    /** Hesaptaki kayıtlı tasarımdan açıldıysa id'si (Kaydet onu günceller). */
    initialDesignId?: number;
    /** Güncel çalışma (sayfa yenilenince geri yüklemek için). */
    onWorkChange?: (work: { moduleId: string; xslt: string; xml: string; designId?: number }) => void;
    /** Geri dön (Selection sayfasına). */
    onBack: () => void;
}

// Sprint 15 Aşama 1 — Preview property drawer için helper componentler.
// Component dışında tanımlı (her render'da yeniden oluşmaz, performans +).
// FieldText: kısa text input (örn. src, alt, font-size).
// FieldSelect: dropdown (örn. font-weight, text-align, object-fit).
// Değer yerel state'te tutulur: currentValue yalnızca ilk değerdir, seçim
// değişince çağıran taraf `key` ile alanı sıfırlar. Kontrollü (value=computed
// style) input yazarken değeri geri sıçratıyordu.
const fieldLabelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '10px', fontWeight: 700, color: '#94a3b8',
    letterSpacing: '0.4px', textTransform: 'uppercase',
    marginBottom: '4px',
};
const fieldInputStyle: React.CSSProperties = {
    width: '100%', padding: '6px 8px',
    background: '#1e293b', border: '1px solid #334155',
    borderRadius: '4px', color: '#e2e8f0',
    fontSize: '12px', fontFamily: 'monospace', outline: 'none',
};
const FieldText: React.FC<{ label: string; currentValue: string; onChange: (v: string) => void; placeholder?: string }> = ({ label, currentValue, onChange, placeholder }) => {
    const [value, setValue] = useState(currentValue);
    return (
        <div style={{ marginBottom: '10px' }}>
            <label style={fieldLabelStyle}>{label}</label>
            <input
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(e) => { setValue(e.target.value); onChange(e.target.value); }}
                style={fieldInputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
            />
        </div>
    );
};
const cssColorToHex = (color: string): string => {
    const m = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    if (m) return '#' + [m[1], m[2], m[3]].map(n => Number(n).toString(16).padStart(2, '0')).join('');
    return /^#[0-9a-f]{6}$/i.test(color) ? color : '#000000';
};
const FieldColor: React.FC<{ label: string; currentValue: string; onChange: (v: string) => void }> = ({ label, currentValue, onChange }) => {
    const [value, setValue] = useState(currentValue);
    const update = (v: string) => { setValue(v); onChange(v); };
    return (
        <div style={{ marginBottom: '10px' }}>
            <label style={fieldLabelStyle}>{label}</label>
            <div style={{ display: 'flex', gap: '6px' }}>
                <input
                    type="color"
                    value={cssColorToHex(value)}
                    onChange={(e) => update(e.target.value)}
                    style={{ width: '34px', height: '30px', padding: 0, border: '1px solid #334155', borderRadius: '4px', background: '#1e293b', cursor: 'pointer' }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => update(e.target.value)}
                    style={{ ...fieldInputStyle, flex: 1 }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                />
            </div>
        </div>
    );
};
const FieldSelect: React.FC<{ label: string; currentValue: string; options: string[]; onChange: (v: string) => void }> = ({ label, currentValue, options, onChange }) => {
    const [value, setValue] = useState(currentValue);
    const allOptions = value && !options.includes(value) ? [value, ...options] : options;
    return (
    <div style={{ marginBottom: '10px' }}>
        <label style={fieldLabelStyle}>{label}</label>
        <select
            value={value}
            onChange={(e) => { setValue(e.target.value); onChange(e.target.value); }}
            style={{
                width: '100%', padding: '6px 8px',
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: '4px', color: '#e2e8f0',
                fontSize: '12px', fontFamily: 'monospace', outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
        >
            {allOptions.map(opt => (
                <option key={opt || '(none)'} value={opt}>{opt || '(default)'}</option>
            ))}
        </select>
    </div>
    );
};
const FieldTextArea: React.FC<{ label: string; currentValue: string; onChange: (v: string) => void }> = ({ label, currentValue, onChange }) => {
    const [value, setValue] = useState(currentValue);
    return (
        <div style={{ marginBottom: '10px' }}>
            <label style={fieldLabelStyle}>{label}</label>
            <textarea
                data-object-text
                value={value}
                spellCheck={false}
                onChange={(e) => { setValue(e.target.value); onChange(e.target.value); }}
                style={{ ...fieldInputStyle, minHeight: '70px', maxHeight: '240px', resize: 'vertical', fontFamily: 'inherit' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
            />
        </div>
    );
};

/** Metin → <br/> ile ayrılmış satırlar (XSLT literal içerik ve önizleme HTML'i aynı). */
const textToMarkup = (text: string): string => text.split('\n').map(escapeXmlText).join('<br/>');

type BorderSpec = { width: number; style: string; color: string };
type InnerLines = 'all' | 'horizontal' | 'vertical' | 'none';
type TableModel = {
    header: boolean;
    rows: string[][];
    frame: BorderSpec;
    inner: BorderSpec & { lines: InnerLines };
    padding: number;
};
const BORDER_STYLES = ['solid', 'dashed', 'dotted', 'double'];
// Çizgi ayarları tabloda data-border-frame="1 solid #000000" ve
// data-border-inner="all 1 solid #000000" olarak saklanır.
const parseBorderSpec = (raw: string | null, fallback: BorderSpec): BorderSpec => {
    const [w, style, color] = (raw || '').trim().split(/\s+/);
    const width = Number(w);
    if (!raw || Number.isNaN(width)) return fallback;
    return { width, style: BORDER_STYLES.includes(style) ? style : 'solid', color: /^#[0-9a-f]{6}$/i.test(color || '') ? color : '#000000' };
};
const borderSpecToAttr = (b: BorderSpec) => `${b.width} ${b.style} ${b.color}`;
const borderCss = (b: BorderSpec) => (b.width > 0 ? `${b.width}px ${b.style} ${b.color}` : 'none');

const readTableModel = (table: HTMLTableElement): TableModel => {
    const rows = Array.from(table.rows);
    const header = rows.length > 0 && Array.from(rows[0].cells).every(c => c.tagName === 'TH');
    const cols = Math.max(1, ...rows.map(r => r.cells.length));
    const legacyWidth = Number(table.getAttribute('border')) || 0;
    const legacy: BorderSpec = { width: legacyWidth, style: 'solid', color: '#000000' };
    const innerRaw = table.getAttribute('data-border-inner');
    const innerParts = (innerRaw || '').trim().split(/\s+/);
    const lines = (['all', 'horizontal', 'vertical', 'none'] as const).find(l => l === innerParts[0]) ?? (legacyWidth > 0 ? 'all' : 'none');
    const padding = Number(table.getAttribute('cellpadding'));
    return {
        header,
        rows: rows.map(r => Array.from({ length: cols }, (_, i) => (r.cells[i]?.textContent || '').trim())),
        frame: parseBorderSpec(table.getAttribute('data-border-frame'), legacy),
        inner: { ...parseBorderSpec(innerRaw ? innerParts.slice(1).join(' ') : null, { ...legacy, width: legacyWidth || 1 }), lines },
        padding: Number.isNaN(padding) ? 5 : padding,
    };
};
const tableModelToMarkup = (m: TableModel): string => {
    const line = borderCss(m.inner);
    const horizontal = m.inner.lines === 'all' || m.inner.lines === 'horizontal';
    const vertical = m.inner.lines === 'all' || m.inner.lines === 'vertical';
    return m.rows.map((r, ri) => {
        const cell = m.header && ri === 0 ? 'th' : 'td';
        return `<tr>${r.map((t, ci) => {
            const css = [
                horizontal && ri > 0 ? `border-top:${line}` : '',
                vertical && ci > 0 ? `border-left:${line}` : '',
            ].filter(Boolean).join(';');
            return `<${cell}${css ? ` style="${css}"` : ''}>${escapeXmlText(t)}</${cell}>`;
        }).join('')}</tr>`;
    }).join('');
};

const BorderControls: React.FC<{ spec: BorderSpec; onChange: (b: BorderSpec) => void; testId: string }> = ({ spec, onChange, testId }) => (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }} data-border-controls={testId}>
        <input
            type="number" min={0} max={10} value={spec.width}
            title="Kalınlık (px)"
            data-border-width
            onChange={(e) => onChange({ ...spec, width: Math.min(10, Math.max(0, Number(e.target.value) || 0)) })}
            style={{ ...fieldInputStyle, width: '58px' }}
        />
        <select
            value={spec.style}
            title="Çizgi stili"
            data-border-style
            onChange={(e) => onChange({ ...spec, style: e.target.value })}
            style={{ ...fieldInputStyle, flex: 1 }}
        >
            <option value="solid">Düz</option>
            <option value="dashed">Kesik</option>
            <option value="dotted">Noktalı</option>
            <option value="double">Çift</option>
        </select>
        <input
            type="color" value={spec.color}
            title="Renk"
            data-border-color
            onChange={(e) => onChange({ ...spec, color: e.target.value })}
            style={{ width: '34px', height: '30px', padding: 0, border: '1px solid #334155', borderRadius: '4px', background: '#1e293b', cursor: 'pointer' }}
        />
    </div>
);

const MAX_TABLE_COLS = 12;
const MAX_TABLE_ROWS = 50;
const TableEditor: React.FC<{
    table: HTMLTableElement;
    onChange: (markup: string) => void;
    onAttr: (attr: string, value: string) => void;
    onStyle: (prop: string, value: string) => void;
}> = ({ table, onChange, onAttr, onStyle }) => {
    const [model, setModel] = useState<TableModel>(() => readTableModel(table));
    const cols = model.rows[0]?.length ?? 1;
    const bodyRows = model.rows.length - (model.header ? 1 : 0);
    const update = (next: TableModel) => { setModel(next); onChange(tableModelToMarkup(next)); };
    // Çerçeve tablonun kendi border'ı, iç çizgiler hücre kenarlarıdır; HTML
    // border="1" hücrelere de çizgi verdiği için 0'a çekilir.
    const updateLines = (next: TableModel) => {
        update(next);
        onAttr('border', '0');
        onAttr('cellpadding', String(next.padding));
        onAttr('data-border-frame', borderSpecToAttr(next.frame));
        onAttr('data-border-inner', `${next.inner.lines} ${borderSpecToAttr(next.inner)}`);
        onStyle('border-collapse', 'collapse');
        onStyle('border', borderCss(next.frame));
    };
    const setCols = (n: number) => {
        const c = Math.min(MAX_TABLE_COLS, Math.max(1, n || 1));
        update({ ...model, rows: model.rows.map((r, ri) => Array.from({ length: c }, (_, i) => r[i] ?? (model.header && ri === 0 ? `Başlık ${i + 1}` : ''))) });
    };
    const setBodyRows = (n: number) => {
        const target = Math.min(MAX_TABLE_ROWS, Math.max(1, n || 1)) + (model.header ? 1 : 0);
        const rows = model.rows.slice(0, target);
        while (rows.length < target) rows.push(Array.from({ length: cols }, () => ''));
        update({ ...model, rows });
    };
    const setHeader = (header: boolean) => {
        if (header === model.header) return;
        const rows = header
            ? [Array.from({ length: cols }, (_, i) => `Başlık ${i + 1}`), ...model.rows]
            : model.rows.slice(1);
        update({ ...model, header, rows: rows.length ? rows : [Array.from({ length: cols }, () => '')] });
    };
    const setCell = (ri: number, ci: number, v: string) => {
        update({ ...model, rows: model.rows.map((r, i) => (i === ri ? r.map((t, j) => (j === ci ? v : t)) : r)) });
    };
    const numberInput = (label: string, value: number, max: number, onSet: (n: number) => void, attr: string) => (
        <div style={{ flex: 1 }}>
            <label style={fieldLabelStyle}>{label}</label>
            <input
                type="number" min={1} max={max} value={value}
                {...{ [attr]: true }}
                onChange={(e) => onSet(Number(e.target.value))}
                style={fieldInputStyle}
            />
        </div>
    );
    return (
        <div data-table-editor>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {numberInput('Sütun sayısı', cols, MAX_TABLE_COLS, setCols, 'data-table-cols')}
                {numberInput('Satır sayısı', bodyRows, MAX_TABLE_ROWS, setBodyRows, 'data-table-rows')}
            </div>
            <label style={{ ...fieldLabelStyle, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '10px' }}>
                <input type="checkbox" data-table-header checked={model.header} onChange={(e) => setHeader(e.target.checked)} />
                Başlık satırı
            </label>
            <label style={fieldLabelStyle}>Dış çerçeve (kalınlık px · stil · renk)</label>
            <BorderControls testId="frame" spec={model.frame} onChange={(frame) => updateLines({ ...model, frame })} />
            <label style={fieldLabelStyle}>Hücreler arası çizgiler</label>
            <select
                data-inner-lines
                value={model.inner.lines}
                onChange={(e) => updateLines({ ...model, inner: { ...model.inner, lines: e.target.value as InnerLines } })}
                style={{ ...fieldInputStyle, marginBottom: '6px' }}
            >
                <option value="all">Tümü (yatay + dikey)</option>
                <option value="horizontal">Sadece yatay</option>
                <option value="vertical">Sadece dikey</option>
                <option value="none">Yok</option>
            </select>
            {model.inner.lines !== 'none' && (
                <BorderControls testId="inner" spec={model.inner} onChange={(b) => updateLines({ ...model, inner: { ...b, lines: model.inner.lines } })} />
            )}
            <div style={{ marginBottom: '10px' }}>
                <label style={fieldLabelStyle}>Hücre iç boşluğu (px)</label>
                <input
                    type="number" min={0} max={40} value={model.padding}
                    data-table-padding
                    onChange={(e) => updateLines({ ...model, padding: Math.min(40, Math.max(0, Number(e.target.value) || 0)) })}
                    style={fieldInputStyle}
                />
            </div>
            <label style={fieldLabelStyle}>Hücre içerikleri</label>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '3px', marginBottom: '10px' }}>
                {model.rows.map((r, ri) => r.map((t, ci) => (
                    <input
                        key={`${ri}-${ci}`}
                        data-table-cell={`${ri}-${ci}`}
                        value={t}
                        title={model.header && ri === 0 ? `Başlık ${ci + 1}` : `Satır ${ri + (model.header ? 0 : 1)}, Sütun ${ci + 1}`}
                        onChange={(e) => setCell(ri, ci, e.target.value)}
                        style={{ ...fieldInputStyle, padding: '4px 5px', fontSize: '11px', fontWeight: model.header && ri === 0 ? 700 : 400, minWidth: 0 }}
                    />
                )))}
            </div>
        </div>
    );
};

type PositionMode = 'static' | 'relative' | 'absolute';
type PositionUnit = 'px' | 'mm';
const PX_PER_MM = 96 / 25.4;
const readPositionMode = (el: HTMLElement): PositionMode =>
    el.style.position === 'absolute' ? 'absolute' : el.style.position === 'relative' ? 'relative' : 'static';
const parseLength = (raw: string): { px: number; unit: PositionUnit } => {
    const m = raw.trim().match(/^(-?\d*\.?\d+)(px|mm)?$/);
    if (!m) return { px: 0, unit: 'px' };
    const n = parseFloat(m[1]);
    return m[2] === 'mm' ? { px: n * PX_PER_MM, unit: 'mm' } : { px: n, unit: 'px' };
};
const pxToUnit = (px: number, unit: PositionUnit) => (unit === 'mm' ? Math.round((px / PX_PER_MM) * 10) / 10 : Math.round(px));
const formatLength = (px: number, unit: PositionUnit) => `${pxToUnit(px, unit)}${unit}`;

/** Ekran (client) birimi / CSS px oranı — önizleme zoom'u ölçülerek bulunur. */
function clientScale(el: HTMLElement): number {
    const view = el.ownerDocument.defaultView;
    const prev = el.style.left;
    const base = parseFloat(view?.getComputedStyle(el).left || '') || 0;
    const a = el.getBoundingClientRect().left;
    el.style.left = `${base + 100}px`;
    const b = el.getBoundingClientRect().left;
    el.style.left = prev;
    return (b - a) / 100 || 1;
}

/**
 * Öğeyi bulunduğu yerde mutlak konuma sabitler (zıplamadan). Koordinatlar
 * body'ye göre olsun diye önizlemede body'ye position:relative verilir.
 */
function pinAbsolute(el: HTMLElement): { left: number; top: number } {
    const doc = el.ownerDocument;
    const body = doc.body;
    if (body && doc.defaultView?.getComputedStyle(body).position === 'static') body.style.position = 'relative';
    const before = el.getBoundingClientRect();
    el.style.position = 'absolute';
    el.style.left = '0px';
    el.style.top = '0px';
    const origin = el.getBoundingClientRect();
    const scale = clientScale(el);
    const left = (before.left - origin.left) / scale;
    const top = (before.top - origin.top) / scale;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    return { left, top };
}

const PositionEditor: React.FC<{
    el: HTMLElement;
    onStyle: (prop: string, value: string) => void;
    onCommit: (mode: PositionMode, left: string, top: string) => void;
}> = ({ el, onStyle, onCommit }) => {
    const [mode, setMode] = useState<PositionMode>(() => readPositionMode(el));
    const [unit, setUnit] = useState<PositionUnit>(() => parseLength(el.style.left || '').unit);
    const [pos, setPos] = useState(() => ({ x: parseLength(el.style.left || '0').px, y: parseLength(el.style.top || '0').px }));
    const [text, setText] = useState(() => ({ x: String(pxToUnit(pos.x, unit)), y: String(pxToUnit(pos.y, unit)) }));
    const show = (p: { x: number; y: number }, u: PositionUnit) => {
        setPos(p);
        setText({ x: String(pxToUnit(p.x, u)), y: String(pxToUnit(p.y, u)) });
    };
    const changeMode = (next: PositionMode) => {
        setMode(next);
        if (next === 'static') {
            show({ x: 0, y: 0 }, unit);
            onCommit('static', '', '');
            return;
        }
        const p = next === 'absolute' ? (() => { const r = pinAbsolute(el); return { x: r.left, y: r.top }; })() : { x: 0, y: 0 };
        show(p, unit);
        onCommit(next, formatLength(p.x, unit), formatLength(p.y, unit));
    };
    const changeUnit = (next: PositionUnit) => {
        setUnit(next);
        show(pos, next);
        if (mode === 'static') return;
        onStyle('left', formatLength(pos.x, next));
        onStyle('top', formatLength(pos.y, next));
    };
    const changeAxis = (axis: 'x' | 'y', raw: string) => {
        setText(t => ({ ...t, [axis]: raw }));
        const n = parseFloat(raw.replace(',', '.'));
        if (!Number.isFinite(n)) return;
        const px = unit === 'mm' ? n * PX_PER_MM : n;
        setPos(p => ({ ...p, [axis]: px }));
        onStyle(axis === 'x' ? 'left' : 'top', `${n}${unit}`);
    };
    const hint = mode === 'absolute'
        ? 'Sayfanın sol üst köşesine göre konum. Önizlemede objeyi sürükleyerek de taşıyabilirsiniz.'
        : mode === 'relative'
            ? 'Obje yerini korur, X/Y kadar kaydırılarak gösterilir. Sürükleyerek de kaydırabilirsiniz.'
            : 'Obje sayfa akışında durur. Önizlemede sürüklerseniz "Sayfada sabit" konuma geçer.';
    return (
        <div data-position-editor>
            <label style={fieldLabelStyle}>Konumlandırma</label>
            <select data-position-mode value={mode} onChange={(e) => changeMode(e.target.value as PositionMode)} style={{ ...fieldInputStyle, marginBottom: '10px' }}>
                <option value="static">Normal (sayfa akışında)</option>
                <option value="relative">Yerinden kaydır</option>
                <option value="absolute">Sayfada sabit konum</option>
            </select>
            {mode !== 'static' && (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    {(['x', 'y'] as const).map(axis => (
                        <div key={axis} style={{ flex: 1 }}>
                            <label style={fieldLabelStyle}>{axis === 'x' ? 'X (soldan)' : 'Y (üstten)'}</label>
                            <input
                                type="number" step={unit === 'mm' ? 0.5 : 1}
                                data-position-axis={axis}
                                value={text[axis]}
                                onChange={(e) => changeAxis(axis, e.target.value)}
                                style={fieldInputStyle}
                            />
                        </div>
                    ))}
                    <div style={{ width: '64px' }}>
                        <label style={fieldLabelStyle}>Birim</label>
                        <select data-position-unit value={unit} onChange={(e) => changeUnit(e.target.value as PositionUnit)} style={fieldInputStyle}>
                            <option value="px">px</option>
                            <option value="mm">mm</option>
                        </select>
                    </div>
                </div>
            )}
            <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.5, marginBottom: '6px' }}>{hint}</div>
        </div>
    );
};

const isNumericField = (f: CatalogField) => f.format === 'amount' || f.format === 'number';

/** Katalog alanlarını kategoriye göre gruplanmış <option>'lar olarak verir. */
const CatalogOptions: React.FC<{ fields: CatalogField[]; xmlDoc: Document | null }> = ({ fields, xmlDoc }) => {
    const groups = new Map<string, CatalogField[]>();
    for (const f of fields) groups.set(f.category, [...(groups.get(f.category) ?? []), f]);
    return (
        <>
            {[...groups].map(([cat, list]) => (
                <optgroup key={cat} label={cat}>
                    {list.map(f => {
                        const v = evaluateField(xmlDoc, f);
                        return <option key={f.key} value={f.key}>{f.label}{v ? ` (${v.slice(0, 24)})` : ''}</option>;
                    })}
                </optgroup>
            ))}
        </>
    );
};

const formatTr = (n: number, decimals: number) =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Formülün örnek XML ile JS'te hesaplanan önizleme metni (ilk satır değerleriyle). */
function formulaPreviewText(m: FormulaModel, catalog: CatalogField[], xmlDoc: Document | null): string {
    const num = (key: string) => {
        const f = catalog.find(x => x.key === key);
        return f ? parseFloat(evaluateField(xmlDoc, f)) : NaN;
    };
    const a = num(m.a);
    const b = m.b.startsWith('field:') ? num(m.b.slice(6)) : Number(m.b.replace(',', '.'));
    const r = m.op === 'percent' ? (a * b) / 100 : m.op === 'mul' ? a * b : m.op === 'div' ? a / b : m.op === 'add' ? a + b : a - b;
    return `${m.label}${Number.isFinite(r) ? formatTr(r, m.decimals) : ''}${m.suffix}`;
}

const FormulaEditor: React.FC<{
    el: HTMLElement;
    catalog: CatalogField[];
    xmlDoc: Document | null;
    onChange: (m: FormulaModel, previewText: string) => void;
}> = ({ el, catalog, xmlDoc, onChange }) => {
    const [model, setModel] = useState<FormulaModel>(() => readFormula(el));
    const numeric = useMemo(() => catalog.filter(isNumericField), [catalog]);
    const update = (patch: Partial<FormulaModel>) => {
        const next = { ...model, ...patch };
        setModel(next);
        onChange(next, formulaPreviewText(next, catalog, xmlDoc));
    };
    const bIsField = model.b.startsWith('field:');
    const result = formulaPreviewText({ ...model, label: '', suffix: '' }, catalog, xmlDoc);
    return (
        <div data-formula-editor>
            <FieldText label="Önündeki metin" currentValue={model.label} placeholder="ör. Peşin (%20): " onChange={(v) => update({ label: v })} />
            <label style={fieldLabelStyle}>Alan</label>
            <select data-formula-a value={model.a} onChange={(e) => update({ a: e.target.value })} style={{ ...fieldInputStyle, marginBottom: '10px' }}>
                <CatalogOptions fields={numeric} xmlDoc={xmlDoc} />
            </select>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                    <label style={fieldLabelStyle}>İşlem</label>
                    <select data-formula-op value={model.op} onChange={(e) => update({ op: e.target.value as FormulaModel['op'] })} style={fieldInputStyle}>
                        {FORMULA_OPS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label style={fieldLabelStyle}>Değer türü</label>
                    <select
                        data-formula-b-kind
                        value={bIsField ? 'field' : 'number'}
                        onChange={(e) => update({ b: e.target.value === 'field' ? `field:${numeric[0]?.key ?? ''}` : '20' })}
                        style={fieldInputStyle}
                    >
                        <option value="number">Sabit sayı</option>
                        <option value="field">Başka alan</option>
                    </select>
                </div>
            </div>
            {bIsField ? (
                <>
                    <label style={fieldLabelStyle}>İkinci alan</label>
                    <select data-formula-b value={model.b.slice(6)} onChange={(e) => update({ b: `field:${e.target.value}` })} style={{ ...fieldInputStyle, marginBottom: '10px' }}>
                        <CatalogOptions fields={numeric} xmlDoc={xmlDoc} />
                    </select>
                </>
            ) : (
                <div style={{ marginBottom: '10px' }}>
                    <label style={fieldLabelStyle}>{model.op === 'percent' ? 'Yüzde (%)' : 'Sayı'}</label>
                    <input data-formula-b type="text" inputMode="decimal" value={model.b} onChange={(e) => update({ b: e.target.value })} style={fieldInputStyle} />
                </div>
            )}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <div style={{ width: '90px' }}>
                    <label style={fieldLabelStyle}>Ondalık</label>
                    <input data-formula-decimals type="number" min={0} max={4} value={model.decimals}
                        onChange={(e) => update({ decimals: Math.min(4, Math.max(0, Number(e.target.value) || 0)) })} style={fieldInputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                    <FieldText label="Arkasındaki metin" currentValue={model.suffix} placeholder="ör.  TL" onChange={(v) => update({ suffix: v })} />
                </div>
            </div>
            <div data-formula-result style={{ padding: '8px 10px', background: '#0b1222', border: '1px dashed #334155', borderRadius: '4px', fontSize: '12px', color: '#e2e8f0' }}>
                Örnek veriyle sonuç: <b>{result || '—'}</b>
            </div>
        </div>
    );
};

export const XSLTEditor: React.FC<XsltEditorProps> = ({
    initialModuleId = 'fatura',
    initialXslt,
    initialXml,
    docName = 'XSLT Tasarım',
    initialDesignId,
    onWorkChange,
    onBack,
}) => {
    // ------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------
    const [moduleId, setModuleId] = useState<string>(initialModuleId);
    const [xsltContent, setXsltContent] = useState<string>('');
    const [xmlContent, setXmlContent] = useState<string>(initialXml || SAMPLE_XML);
    const [activeTab] = useState<'xslt' | 'xml'>('xslt');
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [previewError, setPreviewError] = useState<string | null>(null);
    // Sprint 11 Aşama 2 (2026-10-03) — Zoom default 1.00 (önceki 0.60).
    // Selim'in test ekranında scaledHeight = scrollHeight × 0.60 = 600px, container
    // ~640px → sığıyor → scroll YOK → alt içerik kesik (HESAP BİLGİLERİMİZ,
    // dipnot metni görünmüyor). Zoom 1.0 = scaledHeight = scrollHeight = container'dan
    // büyük → native scroll tetiklenir, tüm içerik erişilebilir. Zoom slider ile
    // küçültme hâlâ mümkün (%50-200%).
    const [previewZoom, setPreviewZoom] = useState<number>(1.00);
    const previewZoomRef = useRef<number>(previewZoom);
    previewZoomRef.current = previewZoom;
    // Sprint 10 Aşama 2 (2026-10-03) — iframe içeriğinin doğal yüksekliği (px).
    // iframe onLoad'ta iframe.contentDocument.body.scrollHeight ölçülerek set edilir.
    // scaledHeight = iframeHeight × previewZoom → container overflow doğal tetiklenir.
    const [iframeContentHeight, setIframeContentHeight] = useState<number>(800);
    // Her iframe onLoad'da artar; doküman dinleyicileri yüklenen yeni dokümana bağlanır.
    const [iframeLoadCount, setIframeLoadCount] = useState(0);
    const [renderDurationMs, setRenderDurationMs] = useState<number>(0);
    const [isRendering, setIsRendering] = useState<boolean>(false);
    const [moduleMenuOpen, setModuleMenuOpen] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState<string>('');

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    // Önizleme %100 açılır; resize/re-render sonrası otomatik sığdırma yalnızca
    // "Fit" ile açıldığında yapılır, +/- ile elle zoom tekrar kapatır.
    const autoFitRef = useRef<boolean>(false);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    // Sprint 8 Aşama 2 — Monaco API instance (provider kayıt + marker set için)
    const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sprint 14 Aşama 2 + Sprint 15 Aşama 1 — Property panel state (sağ drawer).
    // Discriminated union: source 'xslt' ise XSLT binding, source 'preview' ise
    // preview HTML element. Drawer source'a göre farklı form render eder.
    // - xslt: xpath/text/attribute inline edit (Sprint 14 Aşama 2)
    // - preview: tip-spesifik stil özellikleri (Sprint 15 Aşama 1)
    // Seçim: binding (sol panel / binding'li önizleme öğesi) ve/veya önizleme
    // öğesi. locator, iframe yeniden render edildiğinde öğeyi yeni dokümanda
    // tekrar bulmak ve XSLT kaynağındaki etiketi çözmek için kullanılır.
    type PreviewLocator =
        | { kind: 'bind'; index: number }
        | { kind: 'img'; src: string; ordinal: number }
        | { kind: 'obj'; id: string };
    type SelectedObject = {
        id: number;
        binding: XsltBinding | null;
        element: HTMLElement | null;
        locator: PreviewLocator | null;
    } | null;
    const [selectedObject, setSelectedObject] = useState<SelectedObject>(null);
    const selectionIdRef = useRef(0);
    const pendingStyleRef = useRef<Record<string, string>>({});
    const pendingAttrRef = useRef<Record<string, string>>({});
    const pendingContentRef = useRef<string | null>(null);
    // Ekle panelinden eklenen obje, yeni önizleme yüklenince seçilir.
    const pendingSelectRef = useRef<PreviewLocator | null>(null);
    // Tıklayarak eklemede konum; 'end' gövdenin sonu, diğerleri seçili öğeye göre.
    const [insertMode, setInsertMode] = useState<'end' | InsertPosition>('after');
    // Taşıma modu: id'si verilen obje, önizlemede tıklanan hedefe taşınır.
    const [moveObjId, setMoveObjId] = useState<string | null>(null);
    const moveObjIdRef = useRef<string | null>(null);
    moveObjIdRef.current = moveObjId;
    /** Önizlemede sürükleme bitince Konum alanlarını yeniden okutmak için. */
    const [positionRev, setPositionRev] = useState(0);
    const suppressClickUntilRef = useRef(0);
    const sourceEditDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previewScrollRef = useRef<number>(0);
    const pendingPreviewScrollRef = useRef<number | null>(null);
    // Draft state — source'a göre alanlar:
    // - xslt: { value: string; attrName?: string }
    // - preview: Record<string, string> (örn: { 'font-weight': 'bold', color: '#9a3412' })
    const [propertyDraft, setPropertyDraft] = useState<Record<string, string>>({});
    const propertyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        pendingPreviewScrollRef.current = 0;
        setSelectedObject(null);
        if (initialXslt && moduleId === initialModuleId) {
            // İlk yükleme, kullanıcı verisi varsa onu kullan
            setXsltContent(stripLeadingBom(stripTestWatermark(initialXslt)));
            return;
        }
        // Sprint 9 — Antrepo ise antrepoTemplates'tan al
        if (currentModule.antrepoId) {
            const tmpl = getAntrepoTemplateById(currentModule.antrepoId);
            if (tmpl) {
                setXsltContent(stripLeadingBom(tmpl.xslt));
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
            setXsltContent(stripLeadingBom(inline));
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
                annotateLiteralTags(xsltInstrumented.instrumentedXslt),
                xsltInstrumented.bindings
            );
            // Stil/metin düzenlemesi sonrası yeniden render'da önizleme başa
            // atlamasın — yeni doküman yüklenince bu konuma dönülür.
            if (pendingPreviewScrollRef.current !== null) {
                previewScrollRef.current = pendingPreviewScrollRef.current;
                pendingPreviewScrollRef.current = null;
            } else {
                previewScrollRef.current = iframeRef.current?.contentWindow?.scrollY ?? 0;
            }
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
    // Hesaptaki tasarım: kaydedilince id, onaylanınca (kredi harcanınca) anahtar
    // alır. Onaylı tasarım kilitlidir: düzenlenemez, yalnızca tekrar indirilir.
    // ------------------------------------------------------------------------
    const flushSourceEditsRef = useRef<() => void>(() => {});
    const [design, setDesign] = useState<{ id?: number; key?: string; paid: boolean; paidAt?: string | null; name?: string }>(
        { id: initialDesignId, paid: false }
    );
    const [showPayment, setShowPayment] = useState(false);
    useEffect(() => {
        const key = designKeyOf(initialXslt);
        if (!key) return;
        let cancelled = false;
        api.getDesignByKey(key).then(d => {
            if (cancelled || !d) return;
            setDesign({ id: d.id, key: d.design_key ?? key, paid: d.paid, paidAt: d.paid_at, name: d.name });
            if (d.paid) {
                setSaveStatus('saved');
                setSaveMessage('🔒 Onaylanmış tasarım — yalnızca indirilebilir');
            }
        }).catch(err => console.warn('[XSLTEditor] Tasarım anahtarı sorgulanamadı:', err));
        return () => { cancelled = true; };
    }, [initialXslt]);

    // Kayıtlı tasarım id ile açıldıysa (ör. sayfa yenilendi) onay kilidini sunucudan al.
    useEffect(() => {
        if (!initialDesignId) return;
        let cancelled = false;
        api.getDesign(initialDesignId).then((r: { design?: { id: number; design_key?: string | null; paid?: boolean; paid_at?: string | null; name?: string } }) => {
            const d = r?.design;
            if (cancelled || !d?.paid) return;
            setDesign({ id: d.id, key: d.design_key ?? undefined, paid: true, paidAt: d.paid_at, name: d.name });
            setSaveStatus('saved');
            setSaveMessage('🔒 Onaylanmış tasarım — yalnızca indirilebilir');
        }).catch(err => console.warn('[XSLTEditor] Tasarım durumu alınamadı:', err));
        return () => { cancelled = true; };
    }, [initialDesignId]);

    useEffect(() => {
        if (!onWorkChange || !xsltContent) return;
        const t = setTimeout(() => onWorkChange({ moduleId, xslt: xsltContent, xml: xmlContent, designId: design.id }), 800);
        return () => clearTimeout(t);
    }, [onWorkChange, moduleId, xsltContent, xmlContent, design.id]);

    // ------------------------------------------------------------------------
    // Save — hesaptaki tasarımı günceller, yoksa yeni taslak oluşturur
    // ------------------------------------------------------------------------
    const handleSave = useCallback(async () => {
        if (design.paid) return;
        flushSourceEditsRef.current();
        const content = xsltContentRef.current;
        setSaveStatus('saving');
        setSaveMessage('Kaydediliyor...');
        try {
            if (design.id) {
                await api.updateDesign(design.id, { xslt_content: content, xml_content: xmlContent });
                setSaveStatus('saved');
                setSaveMessage('✅ Kaydedildi');
                return;
            }
            const designName = window.prompt?.('Tasarım adı:', docName) ?? docName;
            if (!designName || !designName.trim()) {
                setSaveStatus('idle');
                setSaveMessage('İptal edildi');
                return;
            }
            const result = await api.saveDesign({
                name: designName.trim(),
                module_id: moduleId,
                xslt_content: content,
                xml_content: xmlContent,
                custom_content: undefined,
                theme_color: '#1e3a8a',
                sections: {},
                status: 'draft',
            });
            setDesign(prev => ({ ...prev, id: result.design.id, name: result.design.name }));
            setSaveStatus('saved');
            setSaveMessage(`✅ Kaydedildi — "${result.design.name}"`);
        } catch (err) {
            setSaveStatus('error');
            setSaveMessage(`⚠ Kayıt hatası: ${(err as Error).message}`);
        }
    }, [design.id, design.paid, docName, moduleId, xmlContent]);

    const downloadXslt = useCallback((content: string, suffix = '') => {
        const fileName = `${docName.replace(/\s+/g, '_')}_${moduleId}${suffix}.xslt`;
        const url = URL.createObjectURL(new Blob([stripLeadingBom(content)], { type: 'application/xml;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }, [docName, moduleId]);

    // ------------------------------------------------------------------------
    // Test indirme — ücretsiz, sayfa ortasında TEST filigranı ile
    // ------------------------------------------------------------------------
    const handleTestDownload = useCallback(() => {
        flushSourceEditsRef.current();
        const marked = addTestWatermark(xsltContentRef.current);
        if (!marked) {
            setSaveStatus('error');
            setSaveMessage('⚠ Test dosyası oluşturulamadı: XSLT içinde <body> veya kök template bulunamadı.');
            return;
        }
        downloadXslt(marked, '_TEST');
        setSaveStatus('saved');
        setSaveMessage('🧪 Test dosyası indirildi · ücretsiz. Sorun yoksa "Onayla" ile TEST yazısız dosyayı alın.');
    }, [downloadXslt]);

    // ------------------------------------------------------------------------
    // Onay — ilk onayda 1 tasarım hakkı; TEST yazısız dosya indirilir.
    // Onaylanmış tasarımın sonraki indirmeleri ücretsizdir.
    // ------------------------------------------------------------------------
    const [approveOpen, setApproveOpen] = useState(false);
    const handleApprove = useCallback(async (name: string) => {
        flushSourceEditsRef.current();
        setSaveStatus('saving');
        setSaveMessage('Onaylanıyor...');
        try {
            const r = await api.exportDesign({
                design_id: design.id,
                design_key: design.key,
                name,
                module_id: moduleId,
                xslt_content: stripLeadingBom(stripTestWatermark(xsltContentRef.current)),
                xml_content: xmlContent,
            });
            const out = r.design.xslt_content ?? xsltContentRef.current;
            if (out !== xsltContentRef.current) {
                xsltContentRef.current = out;
                setXsltContent(out);
            }
            setDesign({ id: r.design.id, key: r.design.design_key ?? undefined, paid: true, paidAt: r.design.paid_at, name: r.design.name });
            downloadXslt(out);
            setApproveOpen(false);
            setSaveStatus('saved');
            setSaveMessage(r.charged
                ? `✅ Onaylandı ve indirildi · 1 tasarım hakkı kullanıldı (kalan ${r.credits}).`
                : '✅ İndirildi · ücretsiz (onaylı tasarım)');
            setSelectedObject(null);
        } catch (err) {
            const e = err as Error & { paymentRequired?: boolean };
            setSaveStatus('error');
            setSaveMessage(`⚠ ${e.message}`);
            if (e.paymentRequired) {
                setApproveOpen(false);
                setShowPayment(true);
            }
            throw e;
        }
    }, [design, moduleId, xmlContent, downloadXslt]);

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
    // "Tüm Belge Alanları": XML türüne göre katalog, şablonda kullanılıp
    // kullanılmadığı ve örnek verideki değeri.
    const catalog = useMemo(() => getCatalog(docRootOf(xmlContent)), [xmlContent]);
    const catalogRef = useRef(catalog);
    catalogRef.current = catalog;
    /** Tasarımdaki veri alanlarının Türkçe adları (katalogla eşleşenler). */
    const bindingLabels = useMemo(() => {
        const lineStarts = [0];
        for (let i = xsltContent.indexOf('\n'); i >= 0; i = xsltContent.indexOf('\n', i + 1)) lineStarts.push(i + 1);
        const contextOf = contextPathResolver(xsltContent);
        return new Map(xsltInstrumented.bindings.map((b): [XsltBinding, string | null] => {
            if ((b.kind || 'dropdown') !== 'dropdown') return [b, null];
            const offset = (lineStarts[b.line - 1] ?? 0) + Math.max(0, b.column - 1);
            return [b, bindingLabel(b.xpath, catalog, contextOf(offset))];
        }));
    }, [xsltInstrumented.bindings, catalog, xsltContent]);
    // Element yapısı (xsl:if / for-each) tasarım yapan kullanıcı için anlamlı
    // olmadığından listelenmez.
    const filteredBindingsByGroup = useMemo(() => {
        const q = xsltSearch.trim().toLocaleLowerCase('tr');
        const groups: { dropdown: XsltBinding[]; static: XsltBinding[] } = { dropdown: [], static: [] };
        for (const b of xsltInstrumented.bindings) {
            const kind = b.kind || 'dropdown';
            if (kind === 'element') continue;
            if (q && !b.xpath.toLocaleLowerCase('tr').includes(q) && !(bindingLabels.get(b) ?? '').toLocaleLowerCase('tr').includes(q)) continue;
            groups[kind].push(b);
        }
        return groups;
    }, [xsltInstrumented.bindings, xsltSearch, bindingLabels]);
    const xmlDoc = useMemo(() => {
        const doc = new DOMParser().parseFromString(xmlContent.replace(/^\uFEFF/, ''), 'application/xml');
        return doc.getElementsByTagName('parsererror').length ? null : doc;
    }, [xmlContent]);
    const xmlDocRef = useRef(xmlDoc);
    xmlDocRef.current = xmlDoc;
    const catalogStatus = useMemo(() => {
        const names = xsltLocalNameSet(xsltContent);
        return catalog.map(f => ({ f, inXslt: detectInXslt(names, xsltContent, f), value: evaluateField(xmlDoc, f) }));
    }, [catalog, xsltContent, xmlDoc]);
    const filteredCatalog = useMemo(() => {
        const q = xsltSearch.trim().toLocaleLowerCase('tr');
        const groups = new Map<string, typeof catalogStatus>();
        for (const s of catalogStatus) {
            if (q && !`${s.f.label} ${s.f.category} ${s.f.path}`.toLocaleLowerCase('tr').includes(q)) continue;
            groups.set(s.f.category, [...(groups.get(s.f.category) ?? []), s]);
        }
        return [...groups];
    }, [catalogStatus, xsltSearch]);
    const [catalogOpen, setCatalogOpen] = useState<Record<string, boolean>>({});

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
    const selectedObjectRef = useRef(selectedObject);
    useEffect(() => { selectedObjectRef.current = selectedObject; }, [selectedObject]);
    const bindingsRef = useRef(xsltInstrumented.bindings);
    bindingsRef.current = xsltInstrumented.bindings;
    const xsltContentRef = useRef(xsltContent);
    xsltContentRef.current = xsltContent;

    /** Seçili öğe önizlemede turuncu çerçeveyle işaretlenir. */
    useEffect(() => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc) return;
        doc.querySelectorAll('[data-xslt-selected]').forEach(n => n.removeAttribute('data-xslt-selected'));
        selectedObject?.element?.setAttribute('data-xslt-selected', 'true');
    }, [selectedObject]);

    const findPreviewElement = useCallback((locator: PreviewLocator | null): HTMLElement | null => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc || !locator) return null;
        if (locator.kind === 'bind') {
            return doc.querySelector<HTMLElement>(`[data-render-indexes~="${locator.index}"]`);
        }
        if (locator.kind === 'obj') {
            return doc.querySelector<HTMLElement>(`[data-xslt-obj="${CSS.escape(locator.id)}"]`);
        }
        const imgs = Array.from(doc.querySelectorAll('img')).filter(img => img.getAttribute('src') === locator.src);
        return imgs[locator.ordinal] ?? null;
    }, []);

    const resolveSourceTag = useCallback((xslt: string, locator: PreviewLocator | null): SourceTag | null => {
        if (!locator) return null;
        if (locator.kind === 'img') return findImgTagBySrc(xslt, locator.src, locator.ordinal);
        if (locator.kind === 'obj') return findObjTag(xslt, locator.id);
        const bindings = bindingsRef.current;
        const b = bindings[locator.index];
        if (!b) return null;
        const offset = findBindingSourceOffset(xslt, bindings, b);
        return offset === null ? null : findEnclosingLiteralTag(xslt, offset);
    }, []);

    const selectedSourceTagFound = useMemo(
        () => selectedObject?.locator ? resolveSourceTag(xsltContent, selectedObject.locator) !== null : false,
        [selectedObject, xsltContent, resolveSourceTag]
    );

    /**
     * Bekleyen stil / attribute değişikliklerini seçili öğenin XSLT'deki
     * etiketine yazar. Etiket bulunamazsa değişiklik sadece önizlemede kalır.
     */
    const flushSourceEdits = useCallback(() => {
        if (sourceEditDebounceRef.current) {
            clearTimeout(sourceEditDebounceRef.current);
            sourceEditDebounceRef.current = null;
        }
        const styles = pendingStyleRef.current;
        const attrs = pendingAttrRef.current;
        const content = pendingContentRef.current;
        pendingStyleRef.current = {};
        pendingAttrRef.current = {};
        pendingContentRef.current = null;
        const sel = selectedObjectRef.current;
        if (!sel?.locator) return;
        let locator = sel.locator;
        let next = xsltContentRef.current;
        for (const [prop, value] of Object.entries(styles)) {
            const tag = resolveSourceTag(next, locator);
            if (!tag) return;
            next = setTagStyleProperty(next, tag, prop, value);
        }
        for (const [attr, value] of Object.entries(attrs)) {
            const tag = resolveSourceTag(next, locator);
            if (!tag) return;
            next = setTagAttribute(next, tag, attr, value);
            if (attr === 'src' && locator.kind === 'img') locator = { ...locator, src: value };
        }
        if (content !== null) {
            const tag = resolveSourceTag(next, locator);
            if (tag) next = replaceElementContent(next, tag, content);
        }
        if (locator !== sel.locator) {
            const updated = { ...sel, locator };
            selectedObjectRef.current = updated;
            setSelectedObject(updated);
        }
        if (next !== xsltContentRef.current) {
            xsltContentRef.current = next;
            setXsltContent(next);
            console.log(`[XSLTEditor] Özellik XSLT'ye yazıldı → ${[...Object.keys(styles), ...Object.keys(attrs), ...(content !== null ? ['içerik'] : [])].join(', ')}`);
        }
    }, [resolveSourceTag]);
    flushSourceEditsRef.current = flushSourceEdits;

    const scheduleSourceFlush = useCallback(() => {
        if (sourceEditDebounceRef.current) clearTimeout(sourceEditDebounceRef.current);
        sourceEditDebounceRef.current = setTimeout(flushSourceEdits, 600);
    }, [flushSourceEdits]);

    /** CSS özelliği: önizlemeye anında uygulanır, 600ms sonra XSLT'ye yazılır. */
    const handleStyleChange = useCallback((prop: string, value: string) => {
        const sel = selectedObjectRef.current;
        if (!sel) return;
        const v = value.trim();
        if (sel.element) {
            if (v) sel.element.style.setProperty(prop, v);
            else sel.element.style.removeProperty(prop);
        }
        if (!sel.locator) return;
        pendingStyleRef.current[prop] = v;
        scheduleSourceFlush();
    }, [scheduleSourceFlush]);

    /** HTML attribute (resim src / alt): önizleme + XSLT. */
    const handleAttrChange = useCallback((attr: string, value: string) => {
        const sel = selectedObjectRef.current;
        if (!sel) return;
        sel.element?.setAttribute(attr, value);
        if (!sel.locator) return;
        pendingAttrRef.current[attr] = value;
        scheduleSourceFlush();
    }, [scheduleSourceFlush]);

    /**
     * Yeni objeyi hedefe göre (null → gövdenin sonu) ekler ve seçer. Snippet,
     * konumun satır döngüsü içinde olup olmadığına göre üretilir (satır
     * alanları orada göreli yolla her satırın değerini basar).
     */
    const insertSnippet = useCallback((build: (id: string, inLine: boolean) => string, target: InsertTarget | null, what: string) => {
        const xslt = xsltContentRef.current;
        const id = nextXsltObjId(xslt);
        const mark = '<!--edesign-insert-->';
        const tag = target ? findLiteralTagByOrdinal(xslt, target.ordinal) : null;
        let updated: string;
        if (tag && target) {
            updated = insertAtTag(xslt, tag, mark, target.position);
        } else {
            const end = documentEndOffset(xslt);
            if (end < 0) return;
            updated = `${xslt.slice(0, end)}    ${mark}\n${xslt.slice(end)}`;
        }
        const at = updated.indexOf(mark);
        if (at < 0) return;
        const snippet = build(id, isInLineContext(updated, at));
        updated = updated.slice(0, at) + snippet + updated.slice(at + mark.length);
        if (snippet.includes('format-number(')) updated = ensureDecimalFormat(updated);
        if (!tag) pendingPreviewScrollRef.current = Number.MAX_SAFE_INTEGER;
        pendingSelectRef.current = { kind: 'obj', id };
        xsltContentRef.current = updated;
        setXsltContent(updated);
        console.log(`[XSLTEditor] Obje eklendi: ${what} → ${target ? `<${target.el.tagName.toLowerCase()}> ${target.position === 'inside' ? 'içine' : 'altına'}` : 'sayfa sonu'}`);
    }, []);

    const insertObject = useCallback((type: XsltInsertType | 'formula' | 'karekod', target: InsertTarget | null) => {
        if (type === 'karekod') {
            insertSnippet((id) => karekodSnippet(id, !hasQrLibrary(xsltContentRef.current)), target, 'karekod');
            return;
        }
        if (type !== 'formula') {
            insertSnippet((id) => XSLT_ELEMENT_SNIPPETS[type](id), target, type);
            return;
        }
        const cat = catalogRef.current;
        const a = cat.some(f => f.key === DEFAULT_FORMULA.a) ? DEFAULT_FORMULA.a : cat.find(isNumericField)?.key ?? '';
        insertSnippet((id, inLine) => formulaSnippet(id, { ...DEFAULT_FORMULA, a }, cat, inLine), target, 'formül');
    }, [insertSnippet]);

    /** Katalogdan veri alanı ekler. */
    const insertField = useCallback((key: string, target: InsertTarget | null) => {
        const f = catalogRef.current.find(x => x.key === key);
        if (f) insertSnippet((id, inLine) => fieldSnippet(id, f, inLine), target, f.label);
    }, [insertSnippet]);

    /**
     * Seçili hücre satır (kalem) tablosundaysa, sağına yeni kolon ekler:
     * kalem satırına alan / satır formülü / boş hücre, başlığa kolon adı.
     * Seçim satır tablosunda değilse false.
     */
    const insertColumn = useCallback((what: 'field' | 'formula' | 'empty', key?: string): boolean => {
        const xslt = xsltContentRef.current;
        const ctx = findLineTableCell(selectedObjectRef.current?.element ?? null, xslt);
        if (!ctx) return false;
        const cat = catalogRef.current;
        const id = nextXsltObjId(xslt);
        let header = 'Yeni Kolon';
        let line = '';
        if (what === 'field') {
            const f = cat.find(x => x.key === key);
            if (!f) return false;
            header = f.label;
            line = fieldSnippet(id, f, true);
        } else if (what === 'formula') {
            const a = cat.find(f => LINE_FORMULA_KEYS.includes(f.key))?.key
                ?? cat.find(f => isLineField(f) && isNumericField(f))?.key
                ?? DEFAULT_FORMULA.a;
            header = 'Hesaplanan';
            line = formulaSnippet(id, { ...DEFAULT_FORMULA, a, label: '', suffix: '' }, cat, true);
        }
        let updated = addColumnAfterCell(xslt, ctx, kind => kind === 'line'
            ? line
            : kind === 'header' ? `<span style="font-weight:bold;"><xsl:text>${escapeXmlText(header)}</xsl:text></span>` : '');
        if (!updated) return false;
        if (line.includes('format-number(')) updated = ensureDecimalFormat(updated);
        if (line) pendingSelectRef.current = { kind: 'obj', id };
        xsltContentRef.current = updated;
        setXsltContent(updated);
        console.log(`[XSLTEditor] Kolon eklendi: ${header} → seçili kolonun sağına`);
        return true;
    }, []);

    // Arka plan resmi (sayfa veya seçili çerçeve)
    const [bgOpen, setBgOpen] = useState(false);
    const [bgError, setBgError] = useState<string | null>(null);
    const pageBg = useMemo(() => readPageBackground(xsltContent), [xsltContent]);
    /** patch.target === 'element' verilirse seçili öğe çerçeve olarak işaretlenir. */
    const applyBackground = useCallback((patch: Partial<PageBackground> | null) => {
        flushSourceEditsRef.current();
        const xslt = xsltContentRef.current;
        let next: string | null;
        if (patch === null) {
            next = writePageBackground(xslt, null);
        } else {
            const bg: PageBackground = { image: '', target: 'page', fit: 'width', opacity: 1, ...readPageBackground(xslt), ...patch };
            if (!bg.image) return;
            const el = patch.target === 'element' ? selectedObjectRef.current?.element?.closest('[data-xsrc]') : null;
            if (patch.target === 'element' && !el) {
                setBgError('Önce önizlemede çerçeve olacak öğeyi (ör. dış tablo) seçin.');
                return;
            }
            next = writePageBackground(xslt, bg, el ? Number(el.getAttribute('data-xsrc')) : undefined);
        }
        if (next === null) {
            setBgError('Arka plan eklenecek yer bulunamadı.');
            return;
        }
        setBgError(null);
        if (next === xslt) return;
        xsltContentRef.current = next;
        setXsltContent(next);
    }, []);
    const selectedLineCell = useMemo(
        () => findLineTableCell(selectedObject?.element ?? null, xsltContent),
        [selectedObject, xsltContent],
    );

    const moveObject = useCallback((id: string, target: InsertTarget | null) => {
        const xslt = xsltContentRef.current;
        const src = findObjTag(xslt, id);
        if (!src) return;
        const tag = target ? findLiteralTagByOrdinal(xslt, target.ordinal) : null;
        if (target && !tag) return;
        const updated = moveElement(xslt, src, tag, target?.position ?? 'after');
        if (!updated || updated === xslt) return;
        console.log(`[XSLTEditor] Obje taşındı: ${id} → ${tag ? `<${tag.name}> ${target?.position === 'inside' ? 'içine' : 'altına'}` : 'sayfa sonu'}`);
        if (!tag) pendingPreviewScrollRef.current = Number.MAX_SAFE_INTEGER;
        pendingSelectRef.current = { kind: 'obj', id };
        xsltContentRef.current = updated;
        setXsltContent(updated);
    }, []);

    /**
     * Konumlandırmayı (position/left/top) önizlemeye ve hemen XSLT'ye yazar.
     * Mutlak konum body'ye göre olsun diye XSLT'deki <body>'ye de
     * position:relative eklenir (zaten bir position yoksa).
     */
    const commitPosition = useCallback((el: HTMLElement, locator: PreviewLocator, mode: PositionMode, left: string, top: string) => {
        flushSourceEdits();
        const values: [string, string][] = [
            ['position', mode === 'static' ? '' : mode],
            ['left', mode === 'static' ? '' : left],
            ['top', mode === 'static' ? '' : top],
        ];
        for (const [prop, v] of values) {
            if (v) el.style.setProperty(prop, v);
            else el.style.removeProperty(prop);
        }
        let next = xsltContentRef.current;
        const body = el.ownerDocument.body;
        if (mode === 'absolute' && body?.hasAttribute('data-xsrc')) {
            const bodyTag = findLiteralTagByOrdinal(next, Number(body.getAttribute('data-xsrc')));
            if (bodyTag && bodyTag.name.toLowerCase() === 'body' && !/position\s*:/.test(next.slice(bodyTag.start, bodyTag.end))) {
                next = setTagStyleProperty(next, bodyTag, 'position', 'relative');
            }
        }
        for (const [prop, v] of values) {
            const tag = resolveSourceTag(next, locator);
            if (!tag) return;
            next = setTagStyleProperty(next, tag, prop, v);
        }
        if (next === xsltContentRef.current) return;
        xsltContentRef.current = next;
        setXsltContent(next);
        console.log(`[XSLTEditor] Konum XSLT'ye yazıldı → ${mode}${mode === 'static' ? '' : ` ${left}, ${top}`}`);
    }, [flushSourceEdits, resolveSourceTag]);

    /** Objenin iç içeriği (metin / tablo satırları): önizleme + XSLT. */
    const handleContentChange = useCallback((markup: string, previewText?: string) => {
        const sel = selectedObjectRef.current;
        if (!sel) return;
        if (sel.element) {
            if (previewText !== undefined) sel.element.textContent = previewText;
            else sel.element.innerHTML = markup;
        }
        if (!sel.locator) return;
        pendingContentRef.current = markup;
        scheduleSourceFlush();
    }, [scheduleSourceFlush]);

    /** Seçili objenin XSLT'deki konumu satır döngüsü içinde mi? */
    const selectedObjInLine = useCallback(() => {
        const loc = selectedObjectRef.current?.locator;
        if (loc?.kind !== 'obj') return false;
        const tag = findObjTag(xsltContentRef.current, loc.id);
        return tag ? isInLineContext(xsltContentRef.current, tag.start) : false;
    }, []);

    const handleFormulaChange = useCallback((m: FormulaModel, previewText: string) => {
        const content = formulaContent(m, catalogRef.current, selectedObjInLine());
        if (content === null) return;
        for (const [attr, value] of formulaAttrs(m)) handleAttrChange(attr, value);
        handleContentChange(content, previewText);
    }, [selectedObjInLine, handleAttrChange, handleContentChange]);

    const handleFieldChange = useCallback((key: string) => {
        const f = catalogRef.current.find(x => x.key === key);
        if (!f) return;
        handleAttrChange('data-field', key);
        handleContentChange(fieldContent(f, selectedObjInLine()), evaluateField(xmlDocRef.current, f));
    }, [selectedObjInLine, handleAttrChange, handleContentChange]);

    const openSelection = useCallback((binding: XsltBinding | null, element: HTMLElement | null, locator: PreviewLocator | null) => {
        flushSourceEdits();
        selectionIdRef.current += 1;
        setSelectedObject({ id: selectionIdRef.current, binding, element, locator });
        let draftValue = '';
        let attrName: string | undefined;
        if (binding?.kind === 'static') {
            draftValue = binding.xpath.replace(/^static:\s*/, '');
        } else if (binding?.kind === 'element') {
            // xpath formatı: <xsl:if test="..."> → test="..." parçasını al
            const m = binding.xpath.match(/(\w+)="([^"]*)"/);
            if (m) { attrName = m[1]; draftValue = m[2]; }
            else { attrName = 'select'; draftValue = ''; }
        } else if (binding) {
            draftValue = binding.xpath;
            attrName = 'select';
        }
        const draft: Record<string, string> = { value: draftValue };
        if (attrName) draft['__attr__'] = attrName;
        setPropertyDraft(draft);
    }, [flushSourceEdits]);

    const closeSelection = useCallback(() => {
        flushSourceEdits();
        setSelectedObject(null);
    }, [flushSourceEdits]);

    useEffect(() => {
        if (!selectedObject) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (moveObjIdRef.current) setMoveObjId(null);
                else closeSelection();
                e.stopPropagation();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [selectedObject, closeSelection]);

    // Sol panelden alan tıklanınca: önizlemedeki karşılığına kaydır, çerçevele
    // ve özellik panelini o öğenin tüm özellikleriyle aç.
    const handleBindingClick = useCallback((b: XsltBinding) => {
        setPreviewSelectedLine(b.line);
        setPreviewSelectedColumn(b.column);
        const index = xsltInstrumented.bindings.indexOf(b);
        const locator: PreviewLocator | null = (b.kind || 'dropdown') !== 'element' && index >= 0
            ? { kind: 'bind', index }
            : null;
        const el = findPreviewElement(locator);
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        openSelection(b, el, locator);
    }, [xsltInstrumented.bindings, findPreviewElement, openSelection]);

    /**
     * Statik metin / element attribute düzenleme (300ms debounce). Dinamik
     * veri alanlarının XPath'i salt okunurdur — veri XML'den gelir.
     */
    const handleXsltPropertyChange = useCallback((newValue: string) => {
        setPropertyDraft(prev => ({ ...prev, value: newValue }));
        if (propertyDebounceRef.current) clearTimeout(propertyDebounceRef.current);
        propertyDebounceRef.current = setTimeout(() => {
            const b = selectedObjectRef.current?.binding;
            if (!b || (b.kind || 'dropdown') === 'dropdown') return;
            const current = xsltContentRef.current;
            const updated = updateXSLTBinding(current, b, newValue);
            if (updated !== current) {
                setXsltContent(updated);
            } else {
                console.warn(`[XSLTEditor] XSLT property update no-op (line=${b.line}) — tag multi-line olabilir`);
            }
        }, 300);
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
        if (Date.now() < suppressClickUntilRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        const movingId = moveObjIdRef.current;
        if (movingId) {
            e.preventDefault();
            e.stopPropagation();
            setMoveObjId(null);
            moveObject(movingId, resolveInsertTarget(target, 'auto'));
            return;
        }
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
        let lineAttr = indexedEl.getAttribute('data-line');
        let colAttr = indexedEl.getAttribute('data-column');
        let renderIndex = indexedEl.getAttribute('data-render-index');

        // Sprint 16 Aşama 5b — Statik element'e tıklayınca Monaco scroll.
        // indexedEl data-line yoksa (statik div/td/başlık), en yakın
        // data-render-index'li element'i bul → onun line'ına git.
        // Strateji: (1) parent'ları yukarı tara, (2) yoksa child querySelector.
        // Hiç bulunamazsa scroll yapma (sadece style paneli).
        if (!lineAttr || !colAttr) {
            // (1) Parent'ları yukarı tara
            let p: HTMLElement | null = target.parentElement;
            while (p) {
                const pLine = p.getAttribute('data-line');
                const pCol = p.getAttribute('data-column');
                if (pLine && pCol) {
                    lineAttr = pLine;
                    colAttr = pCol;
                    renderIndex = p.getAttribute('data-render-index');
                    break;
                }
                p = p.parentElement;
            }
            // (2) Hala yoksa child'larda querySelector (ilk data-render-index)
            if ((!lineAttr || !colAttr) && typeof target.querySelector === 'function') {
                const child = target.querySelector('[data-render-index]');
                if (child) {
                    lineAttr = child.getAttribute('data-line');
                    colAttr = child.getAttribute('data-column');
                    renderIndex = child.getAttribute('data-render-index');
                }
            }
        }

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
        // renderIndex yukarıda parent/child taramasıyla doldurulmuş olabilir;
        // seçimin XSLT karşılığı yalnızca öğenin kendi annotation'ından çözülür.
        const ownIndex = indexedEl.getAttribute('data-render-index');
        const objEl = target.closest<HTMLElement>('[data-xslt-obj]');
        let locator: PreviewLocator | null = null;
        let binding: XsltBinding | null = null;
        if (objEl) {
            openSelection(null, objEl, { kind: 'obj', id: objEl.getAttribute('data-xslt-obj') || '' });
            return;
        }
        if (ownIndex !== null) {
            const index = Number(ownIndex);
            locator = { kind: 'bind', index };
            binding = bindingsRef.current[index] ?? null;
        } else if (indexedEl.tagName.toLowerCase() === 'img') {
            const src = indexedEl.getAttribute('src') || '';
            const sameSrc = Array.from(indexedEl.ownerDocument.querySelectorAll('img'))
                .filter(img => img.getAttribute('src') === src);
            locator = { kind: 'img', src, ordinal: sameSrc.indexOf(indexedEl as HTMLImageElement) };
        }
        openSelection(binding, indexedEl, locator);
        console.log(`[XSLTEditor] Preview click → ${indexedEl.tagName} render-index=${renderIndex ?? '(yok — sadece stil paneli)'}`);
    }, [openSelection, moveObject]);

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
    /**
     * Zoom'u iframe dokümanına uygular. Antrepo XSLT'lerinde body sabit
     * genişlikte (793px) olduğu için zoom uygulanmazsa sayfa geniş önizleme
     * alanında dar bir şerit olarak sola yaslı kalıyordu. Body ayrıca yatayda
     * ortalanır.
     */
    const applyPreviewZoom = useCallback((zoom: number) => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc || !doc.documentElement) return;
        if (doc.head && !doc.getElementById('__xslt-preview-layout')) {
            const style = doc.createElement('style');
            style.id = '__xslt-preview-layout';
            style.textContent = 'body{margin-left:auto !important;margin-right:auto !important;}'
                + '[data-xslt-selected]{outline:2px solid #f59e0b !important;outline-offset:2px;}'
                + '[data-xslt-obj],img[data-xslt-selected]{cursor:move;}[data-xslt-obj]:hover{outline:2px dashed #6366f1;outline-offset:2px;}'
                + '[data-xslt-dragging]{opacity:0.85;outline:2px solid #10b981 !important;}'
                + '[data-xslt-drop=inside]{outline:2px dashed #10b981 !important;outline-offset:-2px;background-color:rgba(16,185,129,0.08) !important;}'
                + '[data-xslt-drop=after]{box-shadow:0 3px 0 0 #10b981 !important;}';
            doc.head.appendChild(style);
        }
        doc.documentElement.style.setProperty('zoom', String(zoom));
    }, []);

    const fitZoomToContainer = useCallback(() => {
        // Genişliğe sığdır: fatura önizleme alanını yatayda doldurur, dikeyde
        // iframe içinde kaydırılır. Genişlik+yükseklik birlikte sığdırıldığında
        // (eski min(scaleW, scaleH)) A4 sayfa okunamayacak kadar küçülüyordu.
        const iframe = iframeRef.current;
        if (!iframe) return 1.0;
        const doc = iframe.contentDocument;
        if (!doc || !doc.body || !doc.documentElement) return 1.0;
        const root = doc.documentElement;
        const prevZoom = root.style.getPropertyValue('zoom');
        root.style.setProperty('zoom', '1');
        const body = doc.body;
        const contentWidth = Math.max(body.scrollWidth, body.offsetWidth);
        if (prevZoom) root.style.setProperty('zoom', prevZoom);
        else root.style.removeProperty('zoom');
        // 20px dikey scrollbar payı + her iki yanda 16px kenar boşluğu
        const availableWidth = iframe.clientWidth - 20;
        const naturalWidth = contentWidth + 32;
        if (naturalWidth <= 0 || availableWidth <= 0) return 1.0;
        const scale = availableWidth / naturalWidth;
        return Math.min(2.0, Math.max(0.25, Math.round(scale * 100) / 100));
    }, []);

    useEffect(() => {
        applyPreviewZoom(previewZoom);
    }, [previewZoom, applyPreviewZoom]);

    useEffect(() => {
        const container = previewContainerRef.current;
        if (!container || typeof ResizeObserver === 'undefined') return;
        let frame = 0;
        const observer = new ResizeObserver(() => {
            if (!autoFitRef.current) return;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => setPreviewZoom(fitZoomToContainer()));
        });
        observer.observe(container);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [fitZoomToContainer]);

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
            setIframeLoadCount(c => c + 1);

            // (3) srcDoc her değiştiğinde yeni doküman gelir — mevcut zoom'u
            // hemen uygula (titreme olmasın), auto-fit açıksa 350ms sonra
            // (measureHeight 300ms + 50ms pay) genişliğe göre yeniden sığdır.
            applyPreviewZoom(previewZoomRef.current);
            // Yeniden render sonrası seçili öğeyi yeni dokümanda tekrar bul
            // ve önceki kaydırma konumuna dön.
            const sel = selectedObjectRef.current;
            if (sel?.locator) {
                const el = findPreviewElement(sel.locator);
                if (el !== sel.element) {
                    const updated = { ...sel, element: el };
                    selectedObjectRef.current = updated;
                    setSelectedObject(updated);
                }
            }
            doc.defaultView?.scrollTo(0, previewScrollRef.current);
            const toSelect = pendingSelectRef.current;
            pendingSelectRef.current = null;
            const newEl = toSelect ? findPreviewElement(toSelect) : null;
            if (newEl) {
                newEl.scrollIntoView({ block: 'center' });
                openSelection(null, newEl, toSelect);
            }
            setTimeout(() => {
                if (!autoFitRef.current) return;
                const zoom = fitZoomToContainer();
                setPreviewZoom(zoom);
                applyPreviewZoom(zoom);
                console.log(`[XSLTEditor] auto-fit zoom=${zoom.toFixed(2)}`);
            }, 350);
        };

        bindListener();
    }, [handleIframeBodyClick, fitZoomToContainer, applyPreviewZoom, findPreviewElement, openSelection]);

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
        // Sürükle-bırak ve taşıma modunda bırakılacak yer önizlemede işaretlenir.
        const markDropTarget = (t: InsertTarget | null) => {
            doc.querySelectorAll('[data-xslt-drop]').forEach(n => {
                if (n !== t?.el) n.removeAttribute('data-xslt-drop');
            });
            t?.el.setAttribute('data-xslt-drop', t.position);
        };
        const dragOverHandler = (e: DragEvent) => {
            const dt = e.dataTransfer;
            if (dt && (dt.types.includes('text/x-xslt-element') || dt.types.includes('text/x-xslt-field'))) {
                e.preventDefault();
                dt.dropEffect = 'copy';
                markDropTarget(resolveInsertTarget(e.target as Element, 'auto'));
            }
        };
        const dragLeaveHandler = (e: DragEvent) => {
            if (!e.relatedTarget) markDropTarget(null);
        };
        const dropHandler = (e: DragEvent) => {
            const type = e.dataTransfer?.getData('text/x-xslt-element') as XsltInsertType | 'formula' | 'karekod' | '';
            const fieldKey = e.dataTransfer?.getData('text/x-xslt-field') ?? '';
            markDropTarget(null);
            if (!type && !fieldKey) return;
            e.preventDefault();
            e.stopPropagation();
            const target = resolveInsertTarget(e.target as Element, 'auto');
            if (type) insertObject(type, target);
            else insertField(fieldKey, target);
        };
        const moveOverHandler = (e: MouseEvent) => {
            if (moveObjIdRef.current) markDropTarget(resolveInsertTarget(e.target as Element, 'auto'));
        };
        // Eklenen objeler (ve seçili resim) önizlemede sürüklenerek konumlandırılır.
        type DragState = {
            el: HTMLElement; locator: PreviewLocator; sx: number; sy: number; started: boolean;
            mode: PositionMode; unit: PositionUnit; left: number; top: number; scale: number;
        };
        let drag: DragState | null = null;
        const endDrag = () => {
            const d = drag;
            drag = null;
            if (!d?.started) return;
            d.el.removeAttribute('data-xslt-dragging');
            suppressClickUntilRef.current = Date.now() + 300;
            const left = formatLength(parseFloat(d.el.style.left) || 0, d.unit);
            const top = formatLength(parseFloat(d.el.style.top) || 0, d.unit);
            commitPosition(d.el, d.locator, d.mode, left, top);
            if (selectedObjectRef.current?.element !== d.el) openSelection(null, d.el, d.locator);
            setPositionRev(r => r + 1);
        };
        const mouseDownHandler = (e: MouseEvent) => {
            if (e.button !== 0 || moveObjIdRef.current) return;
            const target = e.target as HTMLElement;
            const obj = target.closest?.('[data-xslt-obj]') as HTMLElement | null;
            const sel = selectedObjectRef.current;
            let el: HTMLElement | null = null;
            let locator: PreviewLocator | null = null;
            if (obj) {
                el = obj;
                locator = { kind: 'obj', id: obj.getAttribute('data-xslt-obj') || '' };
            } else if (sel?.element && sel.locator?.kind === 'img' && sel.element.contains(target)) {
                el = sel.element;
                locator = sel.locator;
            }
            if (!el || !locator) return;
            e.preventDefault();
            drag = { el, locator, sx: e.clientX, sy: e.clientY, started: false, mode: 'absolute', unit: 'px', left: 0, top: 0, scale: 1 };
        };
        const mouseMoveHandler = (e: MouseEvent) => {
            if (!drag) return;
            if ((e.buttons & 1) === 0) { endDrag(); return; }
            const dx = e.clientX - drag.sx;
            const dy = e.clientY - drag.sy;
            if (!drag.started) {
                if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
                const el = drag.el;
                drag.started = true;
                drag.unit = parseLength(el.style.left || '').unit;
                drag.mode = readPositionMode(el);
                if (drag.mode === 'static') {
                    pinAbsolute(el);
                    drag.mode = 'absolute';
                }
                const cs = doc.defaultView?.getComputedStyle(el);
                drag.left = parseFloat(cs?.left || '') || 0;
                drag.top = parseFloat(cs?.top || '') || 0;
                drag.scale = clientScale(el);
                el.setAttribute('data-xslt-dragging', '');
            }
            e.preventDefault();
            drag.el.style.left = `${drag.left + dx / drag.scale}px`;
            drag.el.style.top = `${drag.top + dy / drag.scale}px`;
        };
        body.addEventListener('dragover', dragOverHandler);
        body.addEventListener('dragleave', dragLeaveHandler);
        body.addEventListener('drop', dropHandler);
        doc.addEventListener('mouseover', moveOverHandler);
        doc.addEventListener('mousedown', mouseDownHandler, { capture: true });
        doc.addEventListener('mousemove', mouseMoveHandler);
        doc.addEventListener('mouseup', endDrag);
        console.log(`[XSLTEditor] iframe listener re-bound (previewHtml changed, scrollHeight=${scrollH})`);

        // srcDoc değişirken iframe.contentDocument body'si henüz null olan yeni
        // dokümanı gösterebilir — dinleyiciler eklendikleri doc/body'den kaldırılır.
        return () => {
            doc.removeEventListener('click', handleIframeBodyClick, { capture: true });
            body.removeEventListener('dragover', dragOverHandler);
            body.removeEventListener('dragleave', dragLeaveHandler);
            body.removeEventListener('drop', dropHandler);
            doc.removeEventListener('mouseover', moveOverHandler);
            doc.removeEventListener('mousedown', mouseDownHandler, { capture: true });
            doc.removeEventListener('mousemove', mouseMoveHandler);
            doc.removeEventListener('mouseup', endDrag);
        };
    }, [previewHtml, iframeLoadCount, handleIframeBodyClick, insertObject, insertField, commitPosition, openSelection]);

    // Taşıma modu bitince önizlemedeki hedef işareti kaldırılır.
    useEffect(() => {
        if (moveObjId) return;
        iframeRef.current?.contentDocument?.querySelectorAll('[data-xslt-drop]')
            .forEach(n => n.removeAttribute('data-xslt-drop'));
    }, [moveObjId]);

    // ------------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------------
    return (
        <div
            data-xslt-editor
            style={{
                display: 'flex',
                flexDirection: 'column',
                // #root display:flex (index.css) — flex:1 olmadan editör içerik
                // genişliğine büzülüp sayfanın sağını boş bırakıyor.
                flex: 1,
                width: '100%',
                minWidth: 0,
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
                {!design.paid && <button
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
                </button>}

                {!design.paid && (
                    <button
                        onClick={handleTestDownload}
                        data-test-download
                        disabled={saveStatus === 'saving'}
                        title="Ücretsiz. Dosyayı kendi sisteminizde denemeniz için sayfa ortasında büyük TEST yazısıyla indirir."
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: 'rgba(245, 158, 11, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.45)',
                            borderRadius: '6px',
                            color: '#fcd34d',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        <Download size={14} />
                        Test İndir
                        <span style={{ padding: '1px 6px', borderRadius: 999, fontSize: '10px', fontWeight: 700, background: 'rgba(245, 158, 11, 0.25)' }}>
                            ücretsiz
                        </span>
                    </button>
                )}

                <button
                    onClick={() => (design.paid ? handleApprove(design.name || docName).catch(() => {}) : setApproveOpen(true))}
                    data-download
                    data-approve
                    disabled={saveStatus === 'saving'}
                    title={design.paid
                        ? 'Onaylı tasarım kilitlidir — onaylanan dosyayı tekrar indirmek ücretsiz.'
                        : 'Tasarımı onaylayın: TEST yazısı kaldırılmış dosya indirilir (1 tasarım hakkı).'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                    }}
                >
                    {design.paid ? <Download size={14} /> : <CheckCircle2 size={14} />}
                    {design.paid ? 'İndir .xslt' : 'Onayla'}
                    <span style={{
                        padding: '1px 6px', borderRadius: 999, fontSize: '10px', fontWeight: 700,
                        background: design.paid ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.2)',
                    }}>
                        {design.paid ? 'ücretsiz' : '1 hak'}
                    </span>
                </button>
            </div>
            <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} onSuccess={() => setShowPayment(false)} />
            {approveOpen && (
                <ApproveDialog
                    defaultName={design.name || docName}
                    onTestDownload={handleTestDownload}
                    onApprove={handleApprove}
                    onBuy={() => { setApproveOpen(false); setShowPayment(true); }}
                    onClose={() => setApproveOpen(false)}
                />
            )}

            {/* Ana grid: snippet panel varsa 240px, yoksa 0 + Preview (1fr).
                Sprint 16 Aşama 5d — Monaco editör kaldırıldı (Xslt Tasarım ekranında
                sadece preview + snippet panel + drawer). Önceki 3-kolon
                (snippet | Monaco | Preview) yerine 2-kolon (snippet | Preview 1fr).
                Property Drawer position: absolute right:0 ile overlay (Sprint 14 A2). */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: snippetPanelOpen ? '240px 1fr' : '0px 1fr',
                    // Satır yüksekliği içeriğe (453 alanlık sol liste) göre büyürse
                    // sol liste ve önizleme kaydırılamaz, alt kısımları kesilir.
                    gridTemplateRows: 'minmax(0, 1fr)',
                    flex: 1,
                    minHeight: 0,
                    position: 'relative',  // Sprint 14 Aşama 2 — property drawer absolute right:0
                    transition: 'grid-template-columns 0.2s ease',
                }}
            >
                {design.paid && (
                    <div
                        data-design-locked
                        style={{
                            position: 'absolute', inset: 0, zIndex: 50,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(2, 6, 23, 0.55)', backdropFilter: 'blur(1px)',
                        }}
                    >
                        <div style={{
                            maxWidth: 440, padding: '24px 26px', borderRadius: 14, textAlign: 'center',
                            background: '#0f172a', border: '1px solid rgba(16, 185, 129, 0.4)',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)', color: '#e2e8f0',
                        }}>
                            <Lock size={30} color="#34d399" style={{ marginBottom: 10 }} />
                            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Bu tasarım onaylandı</div>
                            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#94a3b8', marginBottom: 18 }}>
                                Onaylanmış (satın alınmış) tasarımlar tekrar düzenlenemez. Onaylanan dosyayı
                                istediğiniz zaman buradan veya "Tamamlanan Tasarımlar" listesinden ücretsiz indirebilirsiniz.
                            </div>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                <button
                                    type="button"
                                    data-locked-download
                                    onClick={() => handleApprove(design.name || docName).catch(() => {})}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8,
                                        border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                                        background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                                    }}
                                >
                                    <Download size={14} /> İndir .xslt
                                </button>
                                {onBack && (
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8,
                                            cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
                                            background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.35)', color: '#cbd5e1',
                                        }}
                                    >
                                        <ArrowLeft size={14} /> Geri
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
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
                            {filteredBindingsByGroup.dropdown.length + filteredBindingsByGroup.static.length}
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
                                placeholder="Alan ara: kur, tutar, alıcı, IBAN..."
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
                        {renderedBindingIndexes.size > 0 && (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '9px', color: '#94a3b8' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.35)', borderLeft: '3px solid #10b981' }} />
                                    Tasarımda görünen
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                                    <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#1e293b', borderLeft: '3px solid #475569' }} />
                                    Görünmeyen
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Alan listesi: önce "Tüm Belge Alanları" (order:-1), sonra tasarımdaki alanlar */}
                    <div
                        style={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            padding: '6px',
                            display: 'flex',
                            flexDirection: 'column',
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
                            (['dropdown', 'static'] as const).map(group => {
                                const list = filteredBindingsByGroup[group];
                                const groupLabel = group === 'dropdown' ? 'Tasarımdaki Veri Alanları' : 'Sabit Metinler';
                                const groupColor = group === 'dropdown' ? '#a5b4fc'
                                    : group === 'static' ? '#6ee7b7'
                                    : '#fcd34d';
                                const groupBg = group === 'dropdown' ? 'rgba(99, 102, 241, 0.18)'
                                    : group === 'static' ? 'rgba(16, 185, 129, 0.18)'
                                    : 'rgba(252, 211, 77, 0.18)';
                                const groupHasRenderStatus = renderedBindingIndexes.size > 0;
                                const renderedCount = groupHasRenderStatus
                                    ? list.filter(b => renderedBindingIndexes.has(xsltInstrumented.bindings.indexOf(b))).length
                                    : 0;
                                return (
                                    <div key={group} style={{ marginBottom: '8px', flexShrink: 0 }}>
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
                                            }}
                                                title={groupHasRenderStatus ? `${renderedCount} alan tasarımda görünüyor / toplam ${list.length}` : undefined}
                                            >
                                                {groupHasRenderStatus ? `${renderedCount}/${list.length}` : list.length}
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
                                                    const showRenderStatus = groupHasRenderStatus;
                                                    const isSelected = selectedObject?.binding === b
                                                        || (selectedObject?.locator?.kind === 'bind' && selectedObject.locator.index === globalIndex - 1);
                                                    // Tasarımda görünen alanlar yeşil zeminle öne çıkar,
                                                    // görünmeyenler soluklaşır; seçili alan mor çerçeveli.
                                                    const itemBg = isSelected ? 'rgba(99, 102, 241, 0.28)'
                                                        : showRenderStatus && isRendered ? 'rgba(16, 185, 129, 0.16)'
                                                        : '#1e293b';
                                                    const itemBorder = isSelected ? 'rgba(129, 140, 248, 0.9)'
                                                        : showRenderStatus && isRendered ? 'rgba(16, 185, 129, 0.45)'
                                                        : '#334155';
                                                    const itemBorderLeft = showRenderStatus
                                                        ? `3px solid ${isRendered ? '#10b981' : '#475569'}`
                                                        : `1px solid ${itemBorder}`;
                                                    const itemTextColor = showRenderStatus && isRendered ? '#d1fae5' : '#e2e8f0';
                                                    const itemOpacity = showRenderStatus && !isRendered && !isSelected ? 0.55 : 1;
                                                    const trLabel = bindingLabels.get(b);
                                                    const displayText = b.kind === 'static'
                                                        ? b.xpath.replace(/^static:\s*/, '').slice(0, 36)
                                                        : trLabel ?? b.xpath;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            data-xslt-binding
                                                            data-bind-line={b.line}
                                                            data-bind-col={b.column}
                                                            onClick={() => handleBindingClick(b)}
                                                            data-rendered={showRenderStatus ? String(isRendered) : undefined}
                                                            title={`Satır ${b.line}, col ${b.column} — ${b.xpath}${showRenderStatus ? (isRendered ? '  ✓ Tasarımda görünüyor' : '  ✗ Tasarımda görünmüyor') : ''}`}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                padding: '5px 8px 5px 11px',
                                                                marginBottom: '2px',
                                                                background: itemBg,
                                                                border: `1px solid ${itemBorder}`,
                                                                borderLeft: itemBorderLeft,
                                                                borderRadius: '3px',
                                                                cursor: 'pointer',
                                                                opacity: itemOpacity,
                                                                transition: 'background 0.1s, border-color 0.1s, opacity 0.1s',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                                                                e.currentTarget.style.opacity = '1';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = itemBg;
                                                                e.currentTarget.style.opacity = String(itemOpacity);
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
                                                                fontSize: trLabel ? '11px' : '10px',
                                                                color: itemTextColor,
                                                                fontFamily: trLabel ? 'inherit' : 'monospace',
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
                                                                    ? (isRendered ? 'Tasarımda görünüyor' : 'Tasarımda görünmüyor (xsl:if koşulu sağlanmıyor vb.)')
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

                        <div data-field-catalog style={{ order: -1, marginBottom: '8px', flexShrink: 0 }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px',
                                background: 'rgba(14, 165, 233, 0.16)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '4px',
                                color: '#7dd3fc', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                            }}>
                                <span>Tüm Belge Alanları</span>
                                <span style={{ marginLeft: 'auto', padding: '1px 5px', background: '#0f172a', borderRadius: '3px', fontSize: '9px' }}
                                    title="Şablonda kullanılan / katalogdaki alan sayısı">
                                    {catalogStatus.filter(s => s.inXslt).length}/{catalogStatus.length}
                                </span>
                            </div>
                            <div style={{ fontSize: '9px', color: '#64748b', margin: '4px 2px 6px', lineHeight: 1.4 }}>
                                ✓ şablonda kullanılıyor · <b style={{ color: '#7dd3fc' }}>+</b> tıklayın veya önizlemeye sürükleyin. Gri değer örnek veriden gelir.
                            </div>
                            {filteredCatalog.map(([category, items]) => {
                                const open = catalogOpen[category] ?? !!xsltSearch.trim();
                                return (
                                    <div key={category} style={{ marginBottom: '4px' }}>
                                        <button
                                            data-catalog-category={category}
                                            onClick={() => setCatalogOpen(prev => ({ ...prev, [category]: !open }))}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 8px',
                                                background: '#111a30', border: '1px solid #1e293b', borderRadius: '4px',
                                                color: '#cbd5e1', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                                            }}
                                        >
                                            <span style={{ fontSize: '9px', color: '#64748b' }}>{open ? '▼' : '▶'}</span>
                                            <span>{category}</span>
                                            <span style={{ marginLeft: 'auto', fontSize: '9px', color: '#64748b' }}>
                                                {items.filter(s => s.inXslt).length}/{items.length}
                                            </span>
                                        </button>
                                        {open && items.map(({ f, inXslt, value }) => {
                                            const existing = inXslt
                                                ? xsltInstrumented.bindings.find(b => (b.kind || 'dropdown') === 'dropdown' && bindingLabels.get(b) === f.label)
                                                : undefined;
                                            const insertHere = () => {
                                                if (isLineField(f) && insertMode === 'after' && insertColumn('field', f.key)) return;
                                                insertField(f.key, insertMode === 'end'
                                                    ? null
                                                    : resolveInsertTarget(selectedObjectRef.current?.element ?? null, insertMode));
                                            };
                                            return (
                                                <div
                                                    key={f.key}
                                                    data-catalog-field={f.key}
                                                    data-in-xslt={String(inXslt)}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData('text/x-xslt-field', f.key);
                                                        e.dataTransfer.effectAllowed = 'copy';
                                                    }}
                                                    onClick={() => (existing ? handleBindingClick(existing) : insertHere())}
                                                    title={`${f.label}\n${f.path.replace(/\//g, ' › ')}${isLineField(f) ? '\nSatır alanı: tablo satırının içine konursa her satırın değeri basılır.' : ''}${existing ? '\nTıklayınca tasarımdaki yerine gider.' : '\nTıklayınca seçili konuma eklenir.'}`}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0 2px 8px', padding: '4px 6px 4px 8px',
                                                        background: '#1e293b', border: '1px solid #334155',
                                                        borderLeft: `3px solid ${inXslt ? '#10b981' : '#334155'}`, borderRadius: '3px', cursor: 'grab',
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#1e293b'; }}
                                                >
                                                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                                        <span style={{ display: 'block', fontSize: '11px', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {f.label}
                                                        </span>
                                                        <span style={{ display: 'block', fontSize: '9px', color: value ? '#94a3b8' : '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {value || 'örnek veride yok'}
                                                        </span>
                                                    </span>
                                                    {inXslt && <span title="Şablonda kullanılıyor" style={{ color: '#10b981', fontSize: '12px', fontWeight: 700 }}>✓</span>}
                                                    <button
                                                        data-catalog-insert={f.key}
                                                        title="Tasarıma ekle"
                                                        onClick={(e) => { e.stopPropagation(); insertHere(); }}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', padding: 0,
                                                            background: 'rgba(14, 165, 233, 0.18)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '4px',
                                                            color: '#7dd3fc', cursor: 'pointer', flexShrink: 0,
                                                        }}
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ORTA — Preview (Sprint 16 Aşama 5d — Monaco editör kaldırıldı)
                    Önceki yapı: 3-kolon snippet | Monaco | Preview.
                    Şimdi: 2-kolon snippet | Preview 1fr. Monaco editör ve tab
                    header tamamen kaldırıldı (Selim: "ortadaki editör penceresini
                    kaldırabilirsin" + "preview sayfayı doldursun").
                    xsltContent/xmlContent state'leri preview render için hâlâ
                    gerekli (Sprint 16 A5b scroll highlight + Sprint 15 drawer).
                    Monaco/activeTab/handleEditorMount kodları kullanılmıyor
                    ama ileride geri eklenebilir diye state korunur. */}

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
                                onClick={() => {
                                    autoFitRef.current = false;
                                    setPreviewZoom(z => Math.max(0.25, Math.round((z - 0.1) * 100) / 100));
                                }}
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
                                onClick={() => {
                                    autoFitRef.current = false;
                                    setPreviewZoom(z => Math.min(2.0, Math.round((z + 0.1) * 100) / 100));
                                }}
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
                                onClick={() => {
                                    autoFitRef.current = true;
                                    setPreviewZoom(fitZoomToContainer());
                                }}
                                title="Genişliğe sığdır"
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

                    {/* Obje ekleme çubuğu: tıklayınca seçili konuma eklenir,
                        sürükleyince önizlemede bırakılan yere. */}
                    <div
                        data-insert-panel
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                            background: '#0a1024', borderBottom: '1px solid #1e293b', flexWrap: 'wrap',
                        }}
                    >
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px', textTransform: 'uppercase', marginRight: '2px' }}>
                            Ekle
                        </span>
                        {([
                            { type: 'text', label: 'Metin', Icon: Type, color: '#6ee7b7' },
                            { type: 'image', label: 'Resim', Icon: ImageIcon, color: '#a5b4fc' },
                            { type: 'table', label: 'Tablo', Icon: Table2, color: '#fcd34d' },
                            { type: 'formula', label: 'Formül', Icon: Calculator, color: '#f9a8d4' },
                            { type: 'input', label: 'Kutu', Icon: TextCursorInput, color: '#fca5a5' },
                            { type: 'karekod', label: 'Karekod', Icon: QrCode, color: '#93c5fd' },
                        ] as const).map(({ type, label, Icon, color }) => (
                            <div
                                key={type}
                                draggable
                                data-insert-type={type}
                                title={`${label} ekle — tıklayın ya da önizlemede istediğiniz yere sürükleyin`}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text/x-xslt-element', type);
                                    e.dataTransfer.effectAllowed = 'copy';
                                }}
                                onClick={() => {
                                    if (type === 'formula' && insertMode === 'after' && insertColumn('formula')) return;
                                    insertObject(type, insertMode === 'end'
                                        ? null
                                        : resolveInsertTarget(selectedObjectRef.current?.element ?? null, insertMode));
                                }}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                    width: '68px', height: '56px', background: '#1e293b', border: `1px solid ${color}55`,
                                    borderRadius: '8px', color, fontSize: '11px', fontWeight: 700, cursor: 'grab', userSelect: 'none',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.borderColor = color; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.borderColor = `${color}55`; }}
                            >
                                <Icon size={22} />
                                {label}
                            </div>
                        ))}
                        <button
                            type="button"
                            data-insert-column
                            disabled={!selectedLineCell}
                            onClick={() => insertColumn('empty')}
                            title={selectedLineCell
                                ? 'Seçili kolonun sağına boş kolon ekler; içine alan veya formül koyabilirsiniz.'
                                : 'Önce önizlemede satır (kalem) tablosundan bir kolon seçin.'}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                width: '68px', height: '56px', background: '#1e293b', border: '1px solid #67e8f955',
                                borderRadius: '8px', color: '#67e8f9', fontSize: '11px', fontWeight: 700, fontFamily: 'inherit',
                                cursor: selectedLineCell ? 'pointer' : 'not-allowed', opacity: selectedLineCell ? 1 : 0.45,
                            }}
                        >
                            <Columns3 size={22} />
                            Kolon
                        </button>
                        <button
                            type="button"
                            data-bg-toggle
                            onClick={() => setBgOpen(v => !v)}
                            title="Sayfaya veya seçili çerçeveye arka plan resmi"
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                width: '68px', height: '56px', background: bgOpen || pageBg ? '#c4b5fd22' : '#1e293b',
                                border: `1px solid ${bgOpen ? '#c4b5fd' : '#c4b5fd55'}`,
                                borderRadius: '8px', color: '#c4b5fd', fontSize: '11px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                            }}
                        >
                            <Wallpaper size={22} />
                            Arka Plan
                        </button>
                        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '190px' }}>
                            <select
                                data-insert-mode
                                value={insertMode}
                                onChange={(e) => setInsertMode(e.target.value as 'end' | InsertPosition)}
                                title="Tıklayarak eklenen obje nereye konsun"
                                style={{ ...fieldInputStyle, padding: '5px 8px', fontSize: '11px', fontFamily: 'inherit' }}
                            >
                                <option value="after">Seçili öğenin altına</option>
                                <option value="inside">Seçili öğenin içine</option>
                                <option value="end">Sayfanın sonuna</option>
                            </select>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>
                                {insertMode === 'end'
                                    ? 'Tıklanan obje sayfanın sonuna eklenir.'
                                    : selectedObject?.element ? `Seçili: <${selectedObject.element.tagName.toLowerCase()}>` : 'Seçim yoksa sayfa sonuna eklenir.'}
                                {' · '}Sürükleyip bırakabilirsiniz.
                            </span>
                        </div>
                        {selectedLineCell && insertMode === 'after' && (
                            <div data-line-column-hint style={{
                                flexBasis: '100%', fontSize: '10px', color: '#67e8f9', padding: '4px 8px',
                                background: 'rgba(103, 232, 249, 0.08)', border: '1px solid rgba(103, 232, 249, 0.25)', borderRadius: '4px',
                            }}>
                                Satır tablosunda kolon seçili: soldaki listeden eklenen <b>satır alanları</b> ve <b>Formül</b>, seçili kolonun sağına
                                yeni kolon olarak eklenir; formül her satır için ayrı hesaplanır. Hücrenin içine koymak için "Seçili öğenin içine"yi seçin.
                            </div>
                        )}
                    </div>

                    {bgOpen && (
                        <div
                            data-bg-panel
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', flexWrap: 'wrap',
                                background: '#0d1430', borderBottom: '1px solid #1e293b', fontSize: '11px', color: '#cbd5e1',
                            }}
                        >
                            <div style={{
                                width: '56px', height: '72px', borderRadius: '4px', border: '1px solid #334155', flexShrink: 0,
                                background: pageBg ? `#fff url("${pageBg.image}") center top / 100% auto no-repeat` : '#111827',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '9px', textAlign: 'center',
                            }}>
                                {!pageBg && 'Resim yok'}
                            </div>
                            <label style={{
                                padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700,
                                background: 'rgba(196, 181, 253, 0.15)', border: '1px solid rgba(196, 181, 253, 0.5)', color: '#ddd6fe',
                            }}>
                                {pageBg ? 'Resmi değiştir' : 'Resim seç'}
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                    data-bg-file
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        e.target.value = '';
                                        if (!file) return;
                                        if (file.size > 8 * 1024 * 1024) { setBgError('Resim en fazla 8 MB olabilir.'); return; }
                                        try {
                                            applyBackground({ image: await imageFileToDataUrl(file) });
                                        } catch (err) {
                                            setBgError((err as Error).message);
                                        }
                                    }}
                                />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span style={{ color: '#94a3b8' }}>Uygulanacak yer</span>
                                <select
                                    data-bg-target
                                    value={pageBg?.target ?? 'page'}
                                    disabled={!pageBg}
                                    onChange={(e) => applyBackground({ target: e.target.value as PageBackground['target'] })}
                                    style={{ ...fieldInputStyle, padding: '5px 8px', fontSize: '11px', fontFamily: 'inherit' }}
                                >
                                    <option value="page">Tüm sayfa</option>
                                    <option value="element">Seçili öğe (çerçeve)</option>
                                </select>
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span style={{ color: '#94a3b8' }}>Yerleşim</span>
                                <select
                                    data-bg-fit
                                    value={pageBg?.fit ?? 'width'}
                                    disabled={!pageBg}
                                    onChange={(e) => applyBackground({ fit: e.target.value as PageBackground['fit'] })}
                                    style={{ ...fieldInputStyle, padding: '5px 8px', fontSize: '11px', fontFamily: 'inherit' }}
                                >
                                    {BG_FITS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                </select>
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span style={{ color: '#94a3b8' }}>Opaklık</span>
                                <select
                                    data-bg-opacity
                                    value={String(pageBg?.opacity ?? 1)}
                                    disabled={!pageBg}
                                    onChange={(e) => applyBackground({ opacity: Number(e.target.value) })}
                                    style={{ ...fieldInputStyle, padding: '5px 8px', fontSize: '11px', fontFamily: 'inherit' }}
                                >
                                    {[1, 0.75, 0.5, 0.3, 0.15].map(o => <option key={o} value={String(o)}>%{Math.round(o * 100)}</option>)}
                                </select>
                            </label>
                            {pageBg && (
                                <button
                                    type="button"
                                    data-bg-remove
                                    onClick={() => applyBackground(null)}
                                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #7f1d1d', background: 'transparent', color: '#fca5a5', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                    Kaldır
                                </button>
                            )}
                            <span style={{ flex: 1, minWidth: '200px', color: bgError ? '#fca5a5' : '#64748b', fontSize: '10px', lineHeight: 1.4 }}>
                                {bgError ?? (pageBg?.target === 'element'
                                    ? 'Resim işaretli öğenin (çerçevenin) genişliğine göre yerleşir. Başka öğe için önce onu seçip yeniden "Seçili öğe"yi seçin.'
                                    : 'Resim XSLT dosyasının içine gömülür (harici bağlantı gerekmez). Çerçeve için önce dış tabloyu seçip "Seçili öğe"yi kullanın.')}
                                {pageBg && ` · ${(pageBg.image.length / 1024).toFixed(0)} kB`}
                            </span>
                        </div>
                    )}

                    {moveObjId && (
                        <div
                            data-move-banner
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 12px', background: 'rgba(16, 185, 129, 0.12)',
                                borderBottom: '1px solid rgba(16, 185, 129, 0.4)',
                                color: '#6ee7b7', fontSize: '11px',
                            }}
                        >
                            <span style={{ flex: 1 }}>
                                ↕ Taşıma: önizlemede hedef öğeye tıklayın — hücre / kutu ise içine, diğerlerinde altına konur. Esc ile iptal.
                            </span>
                            <button
                                onClick={() => { const id = moveObjId; setMoveObjId(null); moveObject(id, null); }}
                                style={{ padding: '4px 8px', background: 'transparent', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '4px', color: '#6ee7b7', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Sayfa sonuna
                            </button>
                            <button
                                onClick={() => setMoveObjId(null)}
                                style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #334155', borderRadius: '4px', color: '#94a3b8', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                İptal
                            </button>
                        </div>
                    )}

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
                    <div ref={previewContainerRef} style={{
                        flex: 1, minHeight: 0, position: 'relative',
                        // Sprint 16 Aşama 5c — Container background/padding kaldırıldı.
                        // Eski: '#475569' + radial-gradient (ofis zemini) + padding 16px 8px.
                        // iframe doğal width (örn. e-Fatura A4 ~595px) container içinde
                        // sola yaslanır, boş gri alan olmaz. Selim'in "boşluk kısmını
                        // doldurmuyorsun" → "bu bant içinde kalsın" geri bildirimi.
                        background: 'transparent',
                        overflow: 'auto',  // scroll DOĞAL — iframe scaledHeight container'ı aşarsa scroll
                        padding: 0,
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
                                    // Sprint 16 Aşama 5a — iframe width: container'ı tam doldur.
                                    // Eski formül (100/zoom)*0.95 yanlıştı: zoom > 1 daha küçültüyordu.
                                    // Şimdi width: 100%, zoom sadece height scaling için kullanılıyor.
                                    width: '100%',
                                    maxWidth: 'none',
                                    minWidth: '0',
                                    // Sprint 16 Aşama 5f — iframe height: 100% (container'ı kapla).
                                    // Önceki: Math.round(iframeContentHeight * previewZoom) px
                                    // → content yüksekliği × zoom, iframe kendi scroll'u çıkıyordu
                                    // (Selim: "fatura canlı izle ekranında neden scroll çıkıyor").
                                    // Yeni: iframe container'ın tüm yüksekliğini kaplar, içerik
                                    // büyükse container scroll eder (overflow:auto zaten var).
                                    height: '100%',
                                    overflow: 'hidden',  // iframe kendi scroll'unu gizle — container scroll
                                    display: 'block',
                                    margin: '0',  // Sprint 16 Aşama 5c — sola yaslı (auto kaldırıldı, padding kalktı)
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
                    {selectedObject && (() => {
                        const sel = selectedObject;
                        const b = sel.binding;
                        const el = sel.element;
                        const kind = b ? (b.kind || 'dropdown') : null;
                        const tag = el ? el.tagName.toLowerCase() : '';
                        const view = el?.ownerDocument.defaultView;
                        const cs = el && view ? view.getComputedStyle(el) : null;
                        const isImg = tag === 'img';
                        const isInput = ['input', 'button', 'textarea', 'select'].includes(tag);
                        const isObj = sel.locator?.kind === 'obj';
                        const isTable = tag === 'table';
                        const objKind = isObj ? el?.getAttribute('data-obj-kind') : null;
                        const isFormula = objKind === 'formula';
                        const isField = objKind === 'field';
                        const isKarekod = objKind === 'karekod';
                        const bindingIndex = sel.locator?.kind === 'bind'
                            ? sel.locator.index
                            : (b ? xsltInstrumented.bindings.indexOf(b) : -1);
                        const kindDisplay = kind === 'dropdown' ? 'Dinamik Veri'
                            : kind === 'static' ? 'Statik Metin'
                            : kind === 'element' ? 'Element Yapısı'
                            : isObj ? `Eklenen Obje · ${isFormula ? 'Formül' : isField ? 'Veri Alanı' : isKarekod ? 'Karekod' : isImg ? 'Resim' : isTable ? 'Tablo' : isInput ? 'Input' : 'Metin'}`
                            : isImg ? 'Resim' : 'Önizleme Öğesi';
                        const kindColor = kind === 'dropdown' ? '#a5b4fc'
                            : kind === 'static' ? '#6ee7b7'
                            : '#fcd34d';
                        const canPersist = !!el && selectedSourceTagFound;
                        const fieldKey = (name: string) => `${sel.id}-${name}`;
                        const transparentToEmpty = (c: string) => (c === 'rgba(0, 0, 0, 0)' || c === 'transparent' ? '' : c);
                        const sectionTitle = (text: string, color = '#94a3b8') => (
                            <div style={{ fontSize: '10px', fontWeight: 700, color, letterSpacing: '0.4px', textTransform: 'uppercase', margin: '14px 0 8px', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
                                {text}
                            </div>
                        );
                        const noteBox = (text: React.ReactNode, tone: 'info' | 'ok' | 'warn') => {
                            const c = tone === 'ok' ? ['rgba(16, 185, 129, 0.08)', 'rgba(16, 185, 129, 0.3)', '#6ee7b7']
                                : tone === 'warn' ? ['rgba(252, 211, 77, 0.06)', 'rgba(252, 211, 77, 0.3)', '#fcd34d']
                                : ['rgba(99, 102, 241, 0.08)', 'rgba(99, 102, 241, 0.25)', '#94a3b8'];
                            return (
                                <div style={{ marginTop: '10px', padding: '10px 12px', background: c[0], border: `1px solid ${c[1]}`, borderRadius: '4px', fontSize: '10px', color: c[2], lineHeight: 1.5 }}>
                                    {text}
                                </div>
                            );
                        };
                        const removable = !!b || ((sel.locator?.kind === 'img' || isObj) && canPersist);
                        const handleRemove = () => {
                            if (b) {
                                const updated = removeXsltBinding(xsltContent, b);
                                if (updated !== xsltContent) { setXsltContent(updated); closeSelection(); }
                                else console.warn(`[XSLTEditor] XSLT'ten sil no-op (line=${b.line}, multi-line olabilir)`);
                                return;
                            }
                            const tagRange = resolveSourceTag(xsltContent, sel.locator);
                            if (!tagRange) return;
                            setXsltContent(removeElement(xsltContent, tagRange));
                            closeSelection();
                        };
                        return (
                            <>
                                <div style={{
                                    padding: '12px 14px', background: '#0a1024',
                                    borderBottom: '1px solid #1e293b',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}>
                                    <div style={{
                                        minWidth: '34px', padding: '2px 6px',
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        border: '1px solid rgba(99, 102, 241, 0.5)',
                                        borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                                        color: '#a5b4fc', textAlign: 'center', fontFamily: 'monospace',
                                    }}>
                                        {bindingIndex >= 0 ? `B${bindingIndex + 1}` : `<${tag || '?'}>`}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.4px' }}>
                                            Alan Özellikleri
                                        </div>
                                        <div style={{ fontSize: '10px', color: kindColor, fontWeight: 600, letterSpacing: '0.3px' }}>
                                            {kindDisplay}{b?.elementType ? ` · xsl:${b.elementType}` : ''}{tag ? ` · <${tag}>` : ''}
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeSelection}
                                        title="Kapat (Esc)"
                                        data-close-property-drawer
                                        style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #334155', borderRadius: '4px', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div style={{ flex: 1, padding: '0 14px 14px', overflowY: 'auto' }}>
                                    {kind === 'dropdown' && b && (
                                        <>
                                            {sectionTitle('Veri Alanı (XML)', '#a5b4fc')}
                                            <div
                                                data-readonly-xpath
                                                style={{
                                                    padding: '8px 10px', background: '#0b1222',
                                                    border: '1px dashed #334155', borderRadius: '4px',
                                                    color: '#cbd5e1', fontSize: '12px', fontFamily: 'monospace',
                                                    wordBreak: 'break-all',
                                                }}
                                            >
                                                {b.xpath}
                                            </div>
                                            {el && (
                                                <div style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8' }}>
                                                    Önizlemedeki değer:{' '}
                                                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                                                        {(el.textContent || '').trim().slice(0, 120) || '(boş)'}
                                                    </span>
                                                </div>
                                            )}
                                            {noteBox('🔒 Veri XML\'den gelir; bu alanın kaynağı değiştirilemez. Görünüm özelliklerini aşağıdan düzenleyebilirsiniz.', 'info')}
                                        </>
                                    )}

                                    {kind === 'static' && (
                                        <>
                                            {sectionTitle('Metin İçeriği', '#6ee7b7')}
                                            <textarea
                                                data-property-input
                                                value={propertyDraft.value || ''}
                                                onChange={(e) => handleXsltPropertyChange(e.target.value)}
                                                spellCheck={false}
                                                style={{
                                                    width: '100%', minHeight: '60px', maxHeight: '220px',
                                                    padding: '8px 10px', background: '#1e293b',
                                                    border: '1px solid #334155', borderRadius: '4px',
                                                    color: '#e2e8f0', fontSize: '12px', fontFamily: 'monospace',
                                                    resize: 'vertical', outline: 'none',
                                                }}
                                                onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                                                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                            />
                                        </>
                                    )}

                                    {kind === 'element' && b && (
                                        <>
                                            {sectionTitle(`Koşul / Seçim (${propertyDraft['__attr__'] || 'select'})`, '#fcd34d')}
                                            <textarea
                                                data-property-input
                                                value={propertyDraft.value || ''}
                                                onChange={(e) => handleXsltPropertyChange(e.target.value)}
                                                spellCheck={false}
                                                style={{
                                                    width: '100%', minHeight: '60px', maxHeight: '220px',
                                                    padding: '8px 10px', background: '#1e293b',
                                                    border: '1px solid #334155', borderRadius: '4px',
                                                    color: '#e2e8f0', fontSize: '12px', fontFamily: 'monospace',
                                                    resize: 'vertical', outline: 'none',
                                                }}
                                                onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                                                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                            />
                                            {noteBox('Yapı elemanı (xsl:if / for-each vb.) önizlemede tek bir öğeye karşılık gelmez; görünüm özellikleri yoktur.', 'info')}
                                        </>
                                    )}

                                    {b && kind !== 'element' && !el && noteBox(
                                        'Bu alan şu anki önizlemede görünmüyor (ör. xsl:if koşulu sağlanmıyor). Görünüm özellikleri yalnızca tasarımda görünen alanlar için düzenlenebilir.',
                                        'warn'
                                    )}

                                    {isObj && el && isTable && (
                                        <>
                                            {sectionTitle('Tablo', '#fcd34d')}
                                            <TableEditor key={fieldKey('table')} table={el as HTMLTableElement} onChange={handleContentChange} onAttr={handleAttrChange} onStyle={handleStyleChange} />
                                        </>
                                    )}

                                    {isObj && el && isFormula && (
                                        <>
                                            {sectionTitle('Formül', '#f9a8d4')}
                                            <FormulaEditor key={fieldKey('formula')} el={el} catalog={catalog} xmlDoc={xmlDoc} onChange={handleFormulaChange} />
                                            {noteBox('Sonuç her belgede o belgenin kendi değerleriyle hesaplanır. Satır tablosunun içine konan formül her satır için ayrı hesaplanır.', 'info')}
                                        </>
                                    )}

                                    {isObj && el && isField && (
                                        <>
                                            {sectionTitle('Veri Alanı', '#7dd3fc')}
                                            <label style={fieldLabelStyle}>Gösterilen alan</label>
                                            <select
                                                key={fieldKey('field')}
                                                data-field-select
                                                defaultValue={el.getAttribute('data-field') ?? ''}
                                                onChange={(e) => handleFieldChange(e.target.value)}
                                                style={{ ...fieldInputStyle, marginBottom: '10px' }}
                                            >
                                                <CatalogOptions fields={catalog} xmlDoc={xmlDoc} />
                                            </select>
                                            {noteBox('Değer belgenin XML verisinden gelir; tutarlar Türkçe sayı biçimiyle (1.234,56) basılır.', 'info')}
                                        </>
                                    )}

                                    {isObj && el && isKarekod && (
                                        <>
                                            {sectionTitle('Karekod', '#93c5fd')}
                                            <FieldText key={fieldKey('qr-size')} label="Boyut (genişlik = yükseklik)" currentValue={el.style.width || '120px'} onChange={(v) => { handleStyleChange('width', v); handleStyleChange('height', v); }} />
                                            {noteBox('GİB Karekod Standardı (v1.2) içeriği belgeden otomatik üretilir: fatura ve e-Arşivde VKN/TCKN, senaryo, tip, tarih, no, ETTN, tutarlar ve KDV oranları; irsaliyede sevk tarihi/saati, taşıyıcı VKN ve plaka. Karekod belgenin sağ üst köşesinde yer almalıdır. Boyut değişikliği önizleme yenilenince uygulanır.', 'info')}
                                        </>
                                    )}

                                    {isObj && el && !isImg && !isInput && !isTable && !isFormula && !isField && !isKarekod && (
                                        <>
                                            {sectionTitle('Metin İçeriği', '#6ee7b7')}
                                            <FieldTextArea key={fieldKey('text')} label="Metin" currentValue={el.innerText} onChange={(v) => handleContentChange(textToMarkup(v))} />
                                        </>
                                    )}

                                    {el && canPersist && sel.locator && (isObj || sel.locator.kind === 'img') && (
                                        <>
                                            {sectionTitle('Konum', '#6ee7b7')}
                                            <PositionEditor
                                                key={fieldKey(`position-${positionRev}`)}
                                                el={el}
                                                onStyle={handleStyleChange}
                                                onCommit={(mode, left, top) => {
                                                    const cur = selectedObjectRef.current;
                                                    if (cur?.element && cur.locator) commitPosition(cur.element, cur.locator, mode, left, top);
                                                }}
                                            />
                                        </>
                                    )}

                                    {el && cs && isImg && (
                                        <>
                                            {sectionTitle('Resim', '#fcd34d')}
                                            <FieldText key={fieldKey('src')} label="Resim URL (src)" placeholder="https://... veya data:image/..." currentValue={el.getAttribute('src') || ''} onChange={(v) => handleAttrChange('src', v)} />
                                            <FieldText key={fieldKey('alt')} label="Alternatif metin (alt)" currentValue={el.getAttribute('alt') || ''} onChange={(v) => handleAttrChange('alt', v)} />
                                            <FieldText key={fieldKey('width')} label="Genişlik (width)" currentValue={el.style.width || el.getAttribute('width') || cs.width} onChange={(v) => handleStyleChange('width', v)} />
                                            <FieldText key={fieldKey('height')} label="Yükseklik (height)" currentValue={el.style.height || el.getAttribute('height') || ''} placeholder="auto" onChange={(v) => handleStyleChange('height', v)} />
                                            <FieldSelect key={fieldKey('object-fit')} label="Sığdırma (object-fit)" currentValue={el.style.objectFit || ''} options={['', 'contain', 'cover', 'fill', 'scale-down', 'none']} onChange={(v) => handleStyleChange('object-fit', v)} />
                                        </>
                                    )}

                                    {el && cs && !isImg && (
                                        <>
                                            {sectionTitle('Yazı', '#fcd34d')}
                                            <FieldText key={fieldKey('font-family')} label="Yazı tipi (font-family)" currentValue={cs.fontFamily} onChange={(v) => handleStyleChange('font-family', v)} />
                                            <FieldText key={fieldKey('font-size')} label="Boyut (font-size)" currentValue={cs.fontSize} onChange={(v) => handleStyleChange('font-size', v)} />
                                            <FieldSelect key={fieldKey('font-weight')} label="Kalınlık (font-weight)" currentValue={cs.fontWeight} options={['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']} onChange={(v) => handleStyleChange('font-weight', v)} />
                                            <FieldSelect key={fieldKey('font-style')} label="Eğik (font-style)" currentValue={cs.fontStyle} options={['normal', 'italic', 'oblique']} onChange={(v) => handleStyleChange('font-style', v)} />
                                            <FieldSelect key={fieldKey('text-decoration-line')} label="Çizgi (text-decoration)" currentValue={cs.textDecorationLine} options={['none', 'underline', 'line-through', 'overline']} onChange={(v) => handleStyleChange('text-decoration-line', v)} />
                                            <FieldColor key={fieldKey('color')} label="Yazı rengi (color)" currentValue={cs.color} onChange={(v) => handleStyleChange('color', v)} />
                                            <FieldSelect key={fieldKey('text-align')} label="Hizalama (text-align)" currentValue={cs.textAlign} options={['left', 'right', 'center', 'justify', 'start', 'end']} onChange={(v) => handleStyleChange('text-align', v)} />

                                            {sectionTitle('Kutu', '#fcd34d')}
                                            <FieldColor key={fieldKey('background-color')} label="Arka plan (background-color)" currentValue={transparentToEmpty(cs.backgroundColor)} onChange={(v) => handleStyleChange('background-color', v)} />
                                            <FieldText key={fieldKey('padding')} label="İç boşluk (padding)" currentValue={cs.padding} onChange={(v) => handleStyleChange('padding', v)} />
                                            <FieldText key={fieldKey('border')} label="Kenarlık (border)" currentValue={el.style.border || ''} placeholder="ör. 1px solid #000" onChange={(v) => handleStyleChange('border', v)} />
                                            <FieldText key={fieldKey('width')} label="Genişlik (width)" currentValue={el.style.width || ''} placeholder={cs.width} onChange={(v) => handleStyleChange('width', v)} />
                                            <FieldText key={fieldKey('height')} label="Yükseklik (height)" currentValue={el.style.height || ''} placeholder={cs.height} onChange={(v) => handleStyleChange('height', v)} />

                                            {isInput && (
                                                <>
                                                    {sectionTitle('Input', '#fcd34d')}
                                                    <FieldText key={fieldKey('placeholder')} label="placeholder" currentValue={el.getAttribute('placeholder') || ''} onChange={(v) => handleAttrChange('placeholder', v)} />
                                                    <FieldText key={fieldKey('value')} label="value" currentValue={el.getAttribute('value') || ''} onChange={(v) => handleAttrChange('value', v)} />
                                                </>
                                            )}
                                        </>
                                    )}

                                    {el && (canPersist
                                        ? noteBox('✓ Değişiklikler XSLT\'ye yazılır; Kaydet ve İndir\'e dahil edilir.', 'ok')
                                        : noteBox('⚠ Bu öğenin XSLT\'de doğrudan karşılığı bulunamadı (ör. değeri değişkenden geliyor). Değişiklikler sadece önizlemede kalır.', 'warn'))}
                                </div>

                                <div style={{
                                    padding: '10px 14px', background: '#0a1024',
                                    borderTop: '1px solid #1e293b',
                                    display: 'flex', justifyContent: 'space-between', gap: '6px',
                                }}>
                                    {el && (
                                        <button
                                            onClick={() => { el.style.display = el.style.display === 'none' ? '' : 'none'; closeSelection(); }}
                                            title="Sadece önizlemeden gizle"
                                            data-hide-preview-element
                                            style={{ flex: 1, padding: '6px 8px', background: 'rgba(252, 211, 77, 0.15)', border: '1px solid rgba(252, 211, 77, 0.4)', borderRadius: '4px', color: '#fcd34d', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            👁 Gizle
                                        </button>
                                    )}
                                    {isObj && canPersist && sel.locator?.kind === 'obj' && (
                                        <button
                                            onClick={() => { flushSourceEdits(); setMoveObjId(sel.locator?.kind === 'obj' ? sel.locator.id : null); }}
                                            title="Objeyi sayfada başka bir yere taşı"
                                            data-move-object
                                            style={{ flex: 1, padding: '6px 8px', background: moveObjId ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '4px', color: '#6ee7b7', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            ↕ Taşı
                                        </button>
                                    )}
                                    {removable && (
                                        <button
                                            onClick={handleRemove}
                                            title="XSLT kaynak kodundan tamamen kaldır"
                                            data-remove-from-xslt
                                            style={{ flex: 1, padding: '6px 8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', color: '#fca5a5', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            🗑 XSLT'ten Sil
                                        </button>
                                    )}
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
