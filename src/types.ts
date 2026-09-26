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

export interface DesignState {
  elements: DesignElement[];
  xsltOverrides: XsltElementOverride[]; // NEW: Store style overrides for existing XSLT elements
  companyName: string;
  logoUrl?: string;
  selectedId: string | null;
  selectedIds: string[]; // NEW: Multi-selection support
  selectedXsltElement: XsltElementOverride | null; // NEW: Currently selected XSLT element
  themeColor?: string; // NEW: Global theme color for the document
  structureTree?: StructureNode[]; // NEW: Full DOM structure tree for Layers panel
}
