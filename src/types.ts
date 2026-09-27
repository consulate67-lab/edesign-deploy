import React from 'react';

// 2026-09-26 (Faz A.1): Canvas-first refactor — yeni layout elementleri eklendi.
// Eski tipler geriye donuk uyumlu (text/table/image/formula/shape/qrcode).
// Yeni tipler: div, span, p, h1-h6, td, th, tr — XSLT'den tam state'e cevirmek icin.
export type ElementType =
    | 'text' | 'table' | 'image' | 'formula' | 'shape' | 'qrcode' | 'img' // legacy
    | 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'td' | 'th' | 'tr'; // Faz A.1 — XSLT literal result elementler

export interface TableCell {
  content: string;
  binding?: string;
  style?: React.CSSProperties;
}

export interface StructureNode {
  id: string;
  tagName: string;
  xpath?: string;
  children?: StructureNode[];
  label?: string;
}

export interface DesignElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  content: string; // Used for text and formula
  binding?: string; // XML path mapping for text
  style?: React.CSSProperties;
  formula?: string; // For formula elements
  rows?: number;    // For table elements
  cols?: number;    // For table elements
  colWidths?: number[]; // For table elements
  rowHeights?: number[]; // For table elements
  tableData?: TableCell[][]; // For table elements
  shapeType?: 'rect' | 'circle' | 'line'; // For shape elements
  format?: string; // e.g., 'number', 'currency', 'percentage'
  decimals?: number; // Number of decimal places
  htmlTag?: string; // Faz A.1 — orijinal XSLT literal result element tagName
  /** Phase 14 — hangi section'a ait (legacy elements[] icin bossa default). */
  sectionId?: string;
}

export interface XsltElementOverride {
  elementId: string; // Unique ID for the XSLT element
  elementType: 'field' | 'image' | 'img' | 'table' | 'tr' | 'td' | 'th' | 'qrcode'; // Type of element
  path?: string; // XPath or src for the element
  x?: number; // X position relative to the workspace
  y?: number; // Y position relative to the workspace
  width?: number; // Captured width
  height?: number; // Captured height
  content?: string; // Overridden text content
  isDynamic?: boolean; // Is it a dynamic XSLT field?
  styleOverrides: React.CSSProperties; // Style changes to apply
  tableData?: TableCell[][]; // Extracted table structure
  rowCount?: number;
  colCount?: number;
  shapeType?: 'rect' | 'circle' | 'line'; // NEW: Recognition for shapes in XSLT
  hierarchy?: { id: string; tag: string; className?: string }[];
  offsetX?: number;
  offsetY?: number;
  src?: string;
  htmlTag?: string;
}

// ============================================================================
// Phase 14 — FastReport Section Mimarisi
// ============================================================================

/** Section ID'leri — 5 standart e-Belge section. */
export type SectionId =
  | 'reportHeader'
  | 'partyHeader'
  | 'masterData'
  | 'totals'
  | 'reportFooter';

/**
 * Section — Belirli bir alanda gruplanmış elementler.
 *
 * Selim'in direktifi: 'canvas gibi çok düzenli hale getirmeliyiz, FastReport gibi section tabanlı'
 *
 * - `repeating: true` olan section (masterData) her InvoiceLine / Item icin tekrar eder
 * - `repeating: false` olan sectionlar bir kez render edilir
 */
export interface Section {
  id: SectionId;
  title: string;            // UI'da gosterilecek isim
  description: string;      // UI tooltip
  elements: DesignElement[];
  repeating: boolean;       // masterData icin true
  /** XPath selector (repeating sectionlar icin) — or. //cac:InvoiceLine */
  xpath?: string;
  /** HTML container — div / table / nothing */
  containerType?: 'div' | 'table-row' | 'table';
  /** Optional default style for container */
  containerStyle?: React.CSSProperties;
  /** Section order/render order — sayfanın neresinde */
  order: number;
}

/** Sections map — 5 key her zaman mevcut. */
export type SectionsMap = Record<SectionId, Section>;

/**
 * Default section initializer — yeni design'lar icin 5 section olusturur.
 * Bu sabit, e-Fatura e-Arsiv e-Irsaliye vs hepsinde ayni section yapisi kullanilir.
 */
export function createDefaultSections(): SectionsMap {
  return {
    reportHeader: {
      id: 'reportHeader',
      title: 'Belge Üst Bilgisi',
      description: 'Logo, başlık, Fatura No, Tarih, Saat, Tipi, Para birimi, UUID',
      elements: [],
      repeating: false,
      containerType: 'div',
      order: 1,
    },
    partyHeader: {
      id: 'partyHeader',
      title: 'Tedarikçi / Müşteri',
      description: 'Sol: Gönderici bilgileri — Sağ: Alıcı bilgileri',
      elements: [],
      repeating: false,
      containerType: 'table',
      order: 2,
    },
    masterData: {
      id: 'masterData',
      title: 'Ürün/Hizmet Satırları',
      description: 'Her InvoiceLine için tekrar eden tablo (MasterData bandı)',
      elements: [],
      repeating: true,
      containerType: 'div',
      xpath: '//cac:InvoiceLine',
      order: 3,
    },
    totals: {
      id: 'totals',
      title: 'Toplamlar',
      description: 'Vergi toplamları, mal-hizmet toplam, ödenecek tutar (Net)',
      elements: [],
      repeating: false,
      containerType: 'div',
      order: 4,
    },
    reportFooter: {
      id: 'reportFooter',
      title: 'Belge Alt Bilgisi',
      description: 'Banka IBAN, ödeme bilgisi, notlar, imza',
      elements: [],
      repeating: false,
      containerType: 'div',
      order: 5,
    },
  };
}

export interface DesignState {
  /**
   * Legacy: pixel-pixel canvas-based element array. Phase 14 ile birlikte
   * `sections` kullanimi tercih edilir; bu dizi geriye donuk uyumluluk icin korunur.
   * Mevcut design verileri `sections`'a migrate edilir.
   */
  elements: DesignElement[];
  xsltOverrides: XsltElementOverride[]; // NEW: Store style overrides for existing XSLT elements
  companyName: string;
  logoUrl?: string;
  selectedId: string | null;
  selectedIds: string[]; // NEW: Multi-selection support
  selectedXsltElement: XsltElementOverride | null; // NEW: Currently selected XSLT element
  themeColor?: string; // NEW: Global theme color for the document
  structureTree?: StructureNode[]; // NEW: Full DOM structure tree for Layers panel

  /**
   * Phase 14 — FastReport section mimarisi.
   * 5 section her zaman mevcut (createDefaultSections()).
   * Gecis doneminde hem eski `elements[]` hem yeni `sections` beraber var.
   */
  sections?: SectionsMap;
  /** Section navigator için seçili section. */
  selectedSectionId?: SectionId;
  /** Yükleme/yaratma sırasında eski formattaki design otomatik olarak migrate edilmeli mi. */
  migrationVersion?: number;
}
