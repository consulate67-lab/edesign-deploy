import React, { useRef, useState, useEffect, useMemo } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { ChevronLeft, Save, Type, Table as LucideTable, Sigma, Image as ImageIcon, Ruler, Layout, Settings, Upload, Move, ShieldCheck, X, Sparkles, Square, Circle, Minus, Plus, Undo, Copy, QrCode, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Box, Download, Check, Facebook, Instagram, Twitter, Linkedin, Youtube, ZoomIn, ZoomOut, ArrowUpToLine, ArrowDownToLine, ScanLine, Layers, Eye, EyeOff, Info, MousePointer2, ChevronDown, ChevronRight, Code, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, FileOutput } from 'lucide-react';
import { DraggableElement } from './designer/components/DraggableElement.tsx';
import { mergeDesignWithXslt } from './xsltMerger.ts';
import { transformXmlWithXslt } from './xsltTransformer.ts';
import { instrumentXslt, selectionScript } from './xsltInstrumenter.ts';
import { api } from './api';
import { DEFAULT_MODERN_XSLT, DEFAULT_CLASSIC_XSLT } from './defaultTemplate';
import { PaymentModal } from './PaymentModal.tsx';
import type { DesignElement, DesignState, TableCell, XsltElementOverride, StructureNode } from './types.ts';
import { standardUBLFields } from './standardFields.ts';

interface StructureItemProps {
    node: StructureNode;
    level: number;
    selectedId: string | null;
    onSelect: (id: string, node: StructureNode) => void;
}

const StructureItem: React.FC<StructureItemProps> = ({ node, level, selectedId, onSelect }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id; // Check if this node is selected

    return (
        <div style={{ marginLeft: level > 0 ? '8px' : '0px', display: 'flex', flexDirection: 'column' }}>
            <div
                style={{
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    border: isSelected ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                    color: isSelected ? '#a5b4fc' : '#94a3b8',
                    cursor: 'pointer', borderRadius: '4px',
                    fontSize: '0.7rem'
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(node.id, node);
                }}
                onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                <span
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '12px', height: '12px', borderRadius: '2px', cursor: 'pointer',
                        opacity: hasChildren ? 1 : 0
                    }}
                >
                    {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                </span>

                {node.tagName === 'table' ? <LucideTable size={12} color="#34d399" /> :
                    node.tagName === 'img' ? <ImageIcon size={12} color="#f472b6" /> :
                        node.tagName === 'div' ? <Box size={12} color="#f59e0b" /> :
                            <Code size={12} color="#94a3b8" />}

                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={node.label || node.tagName}>
                    {node.label || node.tagName}
                </span>
                {node.id && <span style={{ fontSize: '0.55rem', color: '#475569', marginLeft: 'auto' }}>#{node.id.substring(0, 4)}</span>}
            </div>

            {hasChildren && expanded && (
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', marginLeft: '6px' }}>
                    {node.children!.map(child => (
                        <StructureItem key={child.id} node={child} level={level + 1} selectedId={selectedId} onSelect={onSelect} />
                    ))}
                </div>
            )}
        </div>
    );
};

interface ProfessionalDesignerProps {
    template: string;
    customContent?: string;
    themeColor?: string;
    docName: string;
    moduleId: string;
    onBack: () => void;
}

export const ProfessionalDesigner: React.FC<ProfessionalDesignerProps> = ({ template, customContent, themeColor, docName, moduleId, onBack }) => {
    const [state, setState] = useState<DesignState>({
        elements: [],
        xsltOverrides: [],
        companyName: 'Örnek Firma A.Ş.',
        logoUrl: '',
        selectedId: null,
        selectedIds: [],
        selectedXsltElement: null,
    });
    const [backgroundHtml, setBackgroundHtml] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');
    const [originalXslt, setOriginalXslt] = useState('');
    const [selectedDbField, setSelectedDbField] = useState<{ path: string, value: string } | null>(null);
    const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [availableNumericFields, setAvailableNumericFields] = useState<{ path: string, name: string, value: string }[]>([]);
    const [history, setHistory] = useState<DesignState[]>([]);
    // New state for "Click-to-Place" functionality
    const [placingMode, setPlacingMode] = useState<{ type: string, content?: string, shapeType?: 'rect' | 'circle' | 'line', clonedElement?: any, binding?: string, format?: string } | null>(null);

    // New state for "Add Field" modal
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [allXmlFields, setAllXmlFields] = useState<{ path: string, name: string, value: string, isNumeric: boolean }[]>([]);

    // Zoom States
    const [designZoom, setDesignZoom] = useState(0.65); // Default zoom for Design Canvas
    const [previewZoom, setPreviewZoom] = useState(0.7); // Default zoom for Live Preview
    const [activeSidebarTab, setActiveSidebarTab] = useState<'TOOLS' | 'LAYERS' | 'PROPERTIES'>('TOOLS');
    const [isDragging, setIsDragging] = useState(false);
    const lastUpdateRef = useRef<number>(0);
    const wasDraggingRef = useRef<boolean>(false);


    const saveHistory = () => {
        setHistory(prev => [...prev, JSON.parse(JSON.stringify(state))]);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const lastState = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setState(lastState);
        setNotification({ message: 'İşlem geri alındı.', type: 'success' });
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const PREVIEW_SCALE = 0.7;
    const SNAP_SIZE = 5;
    useEffect(() => {
        const loadData = async () => {
            // Load user info (credits)
            try {
                const me = await api.getMe();
                setUserInfo(me);
            } catch (error) {
                console.error('Failed to load user info', error);
            }

            try {
                // Reset state when a new template is loaded to prevent old overrides from affecting new design
                setState({
                    elements: [],
                    xsltOverrides: [],
                    companyName: 'Örnek Firma A.Ş.',
                    logoUrl: '',
                    selectedId: null,
                    selectedIds: [],
                    selectedXsltElement: null,
                });

                let text = '';
                let source = 'network';

                if (customContent) {
                    console.log('📂 Loading Custom XSLT content...');
                    text = customContent;
                    source = 'custom';
                } else {
                    // Remove any leading ./ or / to sanitize
                    const cleanName = template.replace(/^(\.\/|\/)/, '');
                    let loadedText = '';

                    // 1. Try to fetch or use default
                    if (cleanName.includes('Modern_1.0_Fatura')) {
                        loadedText = DEFAULT_MODERN_XSLT;
                        source = 'builtin';
                        console.log('📂 Using Built-in Fallback for Modern Template directly.');
                    } else if (cleanName.includes('Classic_Corporate')) {
                        loadedText = DEFAULT_CLASSIC_XSLT;
                        source = 'builtin_classic';
                        console.log('📂 Using Built-in Fallback for Classic Template directly.');
                    } else {
                        // Construct explicit URL using BASE_URL
                        const baseUrl = import.meta.env.BASE_URL.endsWith('/')
                            ? import.meta.env.BASE_URL
                            : `${import.meta.env.BASE_URL}/`;

                        const fetchUrl = cleanName.startsWith('http')
                            ? cleanName
                            : `${baseUrl}${cleanName}`;

                        console.log('📂 Loading XSLT template from:', fetchUrl);

                        // 2026-09-25: GH Pages CDN'in bazi node'larinda dosya 404 donuyor (henuz propagate olmamis).
                        // 3 deneme + exponential backoff ile gecici hatalari tolere et.
                        let xsltRes: Response | null = null;
                        let lastFetchErr: unknown = null;
                        for (let attempt = 0; attempt < 3; attempt++) {
                            try {
                                xsltRes = await fetch(fetchUrl, { cache: 'no-cache' });
                                if (xsltRes.ok) {
                                    lastFetchErr = null;
                                    break;
                                }
                                lastFetchErr = new Error(`HTTP Hata ${xsltRes.status} (${xsltRes.statusText})`);
                                console.warn(`📂 XSLT fetch attempt ${attempt + 1}/3 failed: ${xsltRes.status}`);
                            } catch (fetchErr) {
                                lastFetchErr = fetchErr;
                                console.warn(`📂 XSLT fetch attempt ${attempt + 1}/3 threw:`, fetchErr);
                            }
                            if (attempt < 2) {
                                await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
                            }
                        }
                        if (!xsltRes || !xsltRes.ok) {
                            console.warn('All fetch attempts failed, using fallback template...', lastFetchErr);
                            loadedText = DEFAULT_MODERN_XSLT;
                            source = 'fallback';
                        } else {
                            loadedText = await xsltRes.text();
                        }
                    }

                    // 2. Sanitize and Validate
                    loadedText = (loadedText || '').replace(/^\uFEFF/, '').trim();

                    if (!loadedText.startsWith('<') || loadedText.toLowerCase().startsWith('<!doctype html') || loadedText.toLowerCase().startsWith('<html')) {
                        console.warn('Invalid XSLT content detected (HTML or empty). Switching to fallback...');

                        if (cleanName.includes('Classic_Corporate')) {
                            loadedText = DEFAULT_CLASSIC_XSLT.replace(/^\uFEFF/, '').trim();
                            console.log('🔄 Fallback switched to CLASSIC default.');
                        } else {
                            loadedText = DEFAULT_MODERN_XSLT.replace(/^\uFEFF/, '').trim();
                            console.log('🔄 Fallback switched to MODERN default.');
                        }
                        source = 'fallback';
                    }

                    text = loadedText;
                }

                // 2026-09-25: Modul degisiminde onceki XSLT render'ini temizle.
                // iframe eski tasarimi gostermeye devam etmesin, yeni XSLT gelince temiz baslasin.
                // originalXslt'e dokunma — useEffect 2 moduleId dependency ile yeni XSLT'i alip render edecek.
                setBackgroundHtml('');
                setPreviewHtml('');

                // 4. Instrument with Fallback Retry
                try {
                    const instrumented = instrumentXslt(text);
                    console.log('✅ XSLT loaded & instrumented.');
                    setOriginalXslt(instrumented);
                } catch (instErr) {
                    console.error('Instrumentation failed:', instErr);
                    // If we haven't firmly established it's the builtin, try the builtin now as a last resort
                    if (source !== 'builtin') {
                        console.log('⚠️ Retrying with Built-in Default Template...');
                        try {
                            // Smart Retry: Pick correct backup
                            const isClassicReq = template.includes('Classic_Corporate') || template.includes('gib-standard');
                            const backupTpl = isClassicReq ? DEFAULT_CLASSIC_XSLT : DEFAULT_MODERN_XSLT;

                            const fallbackText = backupTpl.replace(/^\uFEFF/, '').trim();
                            const fallbackTwice = instrumentXslt(fallbackText);
                            setOriginalXslt(fallbackTwice);
                            return; // Success on retry
                        } catch (e2) {
                            throw new Error(`XSLT İşleme ve Yedek Yükleme Hatası: ${e2}`);
                        }
                    }
                    throw new Error(`XSLT İşleme Hatası: ${instErr}`);
                }

            } catch (err) {
                console.error("❌ Initial load error:", err);
                setLoadError(err instanceof Error ? err.message : String(err));
            }
        };
        // Reset cache when template changes
        xmlCache.current = null;

        // Theme color is now passed via dedicated prop (no customContent hack).
        if (themeColor) {
            setState(prev => ({ ...prev, themeColor }));
        }

        loadData();
    }, [template, customContent, themeColor, moduleId]);

    // Helper to clean styles for inner elements (removes positioning)
    const cleanStyle = (style?: React.CSSProperties): React.CSSProperties => {
        if (!style) return {};
        const { position, left, top, right, bottom, ...rest } = style as any;
        return rest;
    };

    const copyToClipboard = (text: string, message?: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (message) {
            setNotification({ message, type: 'success' });
        }
        console.log('📋 Copied to clipboard');
    };

    // Map module IDs to their corresponding XML files
    const getXmlFile = (moduleId: string): string => {
        // If it's from library, we try to guess based on template filename
        if (moduleId === 'library' || moduleId === 'custom') {
            const temp = template.toLowerCase();
            if (temp.includes('arsiv') || temp.includes('mikro')) return 'e-arsiv-detail.xml';
            if (temp.includes('net') || temp.includes('ticaret')) return 'e-ticaret-detail.xml';
            if (temp.includes('ihracat')) return 'e-ihracat-detail.xml';
            if (temp.includes('irsaliye')) return 'e-irsaliye.xml';
            if (temp.includes('fatura')) return 'e-fatura-detail.xml';
            // Default based on template naming convention if possible
            return 'e-fatura-detail.xml';
        }

        const xmlMap: Record<string, string> = {
            'fatura': 'e-fatura-detail.xml',
            'arsiv': 'e-arsiv-detail.xml',
            'mikro': 'e-arsiv-detail.xml',
            'net': 'e-ticaret-detail.xml',
            'yolcu': 'e-fatura-detail.xml',
            'ihracat': 'e-ihracat-detail.xml',
            'irsaliye': 'e-irsaliye.xml',
        };
        return xmlMap[moduleId] || 'e-fatura-detail.xml';
    };

    const isTableElement = (type?: string) => type === 'table' || type === 'td' || type === 'tr' || type === 'th';

    const extractNumericFields = (xmlText: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'text/xml');
        const fields: { path: string, name: string, value: string, isNumeric: boolean }[] = [];

        const traverse = (node: Node, path: string = '') => {
            if (node.nodeType === 1) { // Element
                const el = node as Element;
                const currentPath = path ? `${path}/${el.tagName}` : el.tagName;

                // Capture ALL leaf nodes, not just numeric ones for the "Add Field" list
                if (el.children.length === 0) {
                    const val = el.textContent?.trim() || '';
                    const isNum = val && /^[\d.,\-]+$/.test(val);

                    fields.push({
                        path: currentPath,
                        name: el.tagName,
                        value: val,
                        isNumeric: !!isNum
                    });
                } else {
                    Array.from(el.childNodes).forEach(child => traverse(child, currentPath));
                }
            }
        };

        traverse(doc.documentElement);
        // Remove duplicates based on path
        const uniqueFields = fields.filter((v, i, a) => a.findIndex(t => t.path === v.path) === i);
        return uniqueFields;
    };

    const xmlCache = useRef<string | null>(null);

    const refreshPreview = async (xslt: string, currentState: DesignState) => {
        try {
            let xmlText = xmlCache.current;
            if (!xmlText) {
                const xmlFile = getXmlFile(moduleId);
                // Robust Fetch Strategy
                const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
                const pathsToTry = [
                    `${baseUrl}examples/${xmlFile}`,
                    `/examples/${xmlFile}`,
                    `./examples/${xmlFile}`
                ];

                let loadedText: string | null = null;
                console.log(`🔄 Trying to load XML: ${xmlFile}`);

                for (const url of pathsToTry) {
                    try {
                        console.log(`   Trying path: ${url}`);
                        const tryRes = await fetch(url);
                        if (tryRes.ok) {
                            const text = await tryRes.text();
                            if (!text.trim().startsWith('<!DOCTYPE html') && !text.trim().startsWith('<html')) {
                                loadedText = text;
                                console.log(`   ✅ Success from: ${url}`);
                                break;
                            } else {
                                console.warn(`   ⚠️ HTML response from: ${url}`);
                            }
                        }
                    } catch (e) {
                        console.warn(`   ❌ Fetch error for ${url}:`, e);
                    }
                }

                if (!loadedText) {
                    const msg = `XML Verisi Yüklenemedi! (${xmlFile})\nLütfen internet bağlantınızı kontrol edin veya yönetici ile iletişime geçin.`;
                    setLoadError(msg);
                    console.error('❌ All XML fetch attempts failed.');
                    return;
                }

                xmlText = loadedText;
                xmlCache.current = xmlText;

                // Extract numeric fields once XML is loaded
                const allFields = extractNumericFields(xmlText);
                setAllXmlFields(allFields);
                // Backward compatibility for the numeric dropdown
                setAvailableNumericFields(allFields.filter(f => f.isNumeric));
            }
            console.log('✅ XML loaded, length:', xmlText.length);

            // NOTE: We do NOT instrument here anymore. The passed `xslt` is already instrumented.

            console.log('🎨 Transforming for background...');
            let bgHtml = transformXmlWithXslt(xmlText, xslt);

            // Inject selection script into generated HTML
            const scriptHtml = `<script id="designer-selection-script">${selectionScript}</script>`;
            if (bgHtml.includes('</body>')) {
                bgHtml = bgHtml.replace('</body>', scriptHtml + '</body>');
            } else {
                bgHtml += scriptHtml;
            }

            console.log('✅ Background HTML generated, length:', bgHtml.length);
            console.log('Background HTML preview:', bgHtml.substring(0, 500));
            setBackgroundHtml(bgHtml);

            console.log('🎨 Transforming for preview...');
            const mergedXslt = mergeDesignWithXslt(xslt, currentState);
            let finalHtml = transformXmlWithXslt(xmlText, mergedXslt);

            // Inject selection script into preview HTML too, so we can interact with it
            if (finalHtml.includes('</body>')) {
                finalHtml = finalHtml.replace('</body>', scriptHtml + '</body>');
            } else {
                finalHtml += scriptHtml;
            }

            console.log('✅ Preview HTML generated, length:', finalHtml.length);
            setPreviewHtml(finalHtml);
        } catch (err) {
            console.error("❌ Preview refresh error:", err);
        }
    };


    useEffect(() => {
        xmlCache.current = null;
    }, [moduleId]);

    useEffect(() => {
        if (originalXslt) {
            refreshPreview(originalXslt, state);
        }
    }, [originalXslt, state.xsltOverrides, state.elements, state.companyName, state.logoUrl, state.themeColor, moduleId]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'XSLT_FIELD_CLICKED') {
                setSelectedDbField({ path: event.data.path, value: event.data.value });
            } else if (event.data?.type === 'XSLT_ELEMENT_CLICKED') {
                console.log('🖱️ XSLT Element Clicked:', event.data);
                // User clicked on an existing XSLT element (logo, table, db field)
                const { elementId, elementType, htmlTag, shapeType, hierarchy, path, currentStyles, rect, innerText, isDynamic, tableData, rowCount, colCount, relativeX, relativeY, src } = event.data;

                const startX = rect?.x !== undefined ? rect.x : (rect?.left || 0);
                const startY = rect?.y !== undefined ? rect.y : (rect?.top || 0);

                // Calculate offset: Visual Pos (rect) - Style Pos (relative)
                // If relative is undefined (e.g. static), assume offset is 0 for safety, though usually relativeX accompanies fixed/absolute
                const styleLeft = relativeX !== undefined ? relativeX : startX;
                const styleTop = relativeY !== undefined ? relativeY : startY;

                const offX = startX - styleLeft;
                const offY = startY - styleTop;

                // Find existing override or create new one
                const existingOverride = state.xsltOverrides.find(o => o.elementId === elementId);

                const xsltElement: XsltElementOverride = existingOverride || {
                    elementId,
                    elementType: elementType as any, // Cast to any to accept 'tr', 'td' etc.
                    shapeType, // NEW
                    hierarchy, // NEW
                    path: (elementType === 'table' || elementType === 'tr') ? `[${elementType.toUpperCase()} YAPISI]` : path,
                    content: (elementType === 'img' || elementType === 'image') ? src :
                        (elementType === 'qrcode' && src && src.includes('data=')) ? decodeURIComponent(src.split('data=')[1].split('&')[0]) :
                            innerText,
                    src,
                    isDynamic,
                    tableData,
                    rowCount,
                    colCount,
                    x: startX,
                    y: startY,
                    offsetX: offX,
                    offsetY: offY,
                    width: rect?.width,
                    height: rect?.height,
                    htmlTag,
                    styleOverrides: {
                        fontSize: currentStyles.fontSize,
                        color: currentStyles.color,
                        backgroundColor: currentStyles.backgroundColor === 'rgba(0, 0, 0, 0)' ? 'transparent' : currentStyles.backgroundColor,
                        fontWeight: currentStyles.fontWeight,
                        fontStyle: currentStyles.fontStyle,
                        fontFamily: currentStyles.fontFamily,
                        width: `${rect?.width}px`,
                        border: currentStyles.border,
                        borderRadius: currentStyles.borderRadius,
                        ...((elementType === 'td' || elementType === 'th' || elementType === 'tr') ? {
                            position: 'static' as any
                        } : {
                            position: 'absolute' as any,
                            left: `${styleLeft}px`,
                            top: `${styleTop}px`,
                            zIndex: 10
                        })
                    }
                };

                setState(prev => ({
                    ...prev,
                    selectedXsltElement: xsltElement,
                    selectedId: null // Deselect user-added elements
                }));
                setActiveSidebarTab('PROPERTIES');
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [state.xsltOverrides]);

    // Updated addElement to support specific coordinates
    const addElement = (type: DesignElement['type'], initialContent: string = '', x: number = 50, y: number = 50, w?: number, h?: number) => {

        saveHistory();
        let tableData: TableCell[][] | undefined;
        let colWidths: number[] | undefined;
        let rowHeights: number[] | undefined;

        const baseStyle: React.CSSProperties = {
            fontSize: '12px',
            color: '#000000',
            backgroundColor: 'transparent'
        };

        if (type === 'table') {
            tableData = [
                [{ content: 'Sütun 1' }, { content: 'Sütun 2' }],
                [{ content: 'Veri 1' }, { content: 'Veri 2' }]
            ];
            // If specific width provided, distribute it; otherwise default
            const defaultW = w ? w / 2 : 150;
            colWidths = [defaultW, defaultW];
            rowHeights = [30, 30];
        }

        if (type === 'image') {
            baseStyle.width = '120px';
            baseStyle.height = '60px';
        }

        if (type === 'shape') {
            baseStyle.width = '120px';
            baseStyle.height = initialContent === 'line' ? '2px' : '100px';
            baseStyle.border = initialContent === 'line' ? 'none' : '1px solid #000';
            if (initialContent === 'line') {
                baseStyle.backgroundColor = '#000000';
            }
        }

        const newElement: DesignElement = {
            id: Math.random().toString(36).substring(2, 11),
            type,
            x: x,
            y: y,
            content: initialContent || (type === 'text' ? 'Yeni Metin' : type === 'formula' ? 'Fiyat * Adet' : type === 'image' ? '' : ''),
            shapeType: (type === 'shape') ? (initialContent as any || 'rect') : undefined,
            style: baseStyle,
            rows: type === 'table' ? 2 : undefined,
            cols: type === 'table' ? 2 : undefined,
            colWidths,
            rowHeights,
            tableData
        };
        saveHistory();
        setState(prev => ({ ...prev, elements: [...prev.elements, newElement], selectedId: newElement.id }));
        setNotification({ message: `${type === 'shape' ? 'Şekil' : 'Nesne'} başarıyla eklendi.`, type: 'success' });
        setPlacingMode(null); // Reset placing mode
    };

    const initiateAddElement = (type: DesignElement['type'], content: string = '', shapeType?: 'rect' | 'circle' | 'line') => {
        setPlacingMode({ type, content, shapeType });
        setNotification({ message: 'Eklenecek konumu seçin...', type: 'success' });
    };

    const addShape = (shapeType: 'rect' | 'circle' | 'line') => {
        initiateAddElement('shape', shapeType, shapeType);
    };

    const duplicateElement = () => {
        if (!state.selectedId && !state.selectedXsltElement) return;
        saveHistory();

        if (state.selectedId) {
            const el = state.elements.find(e => e.id === state.selectedId);
            if (el) {
                const newEl: DesignElement = {
                    ...JSON.parse(JSON.stringify(el)),
                    id: Math.random().toString(36).substring(2, 11)
                };
                // Instead of immediately adding, initiate placement
                setPlacingMode({ type: newEl.type, clonedElement: newEl });
                setNotification({ message: 'Kopyalanan nesneyi yerleştirmek için tıklayın...', type: 'success' });
            }
        } else if (state.selectedXsltElement) {
            const override = state.selectedXsltElement;
            const newEl: DesignElement = {
                id: Math.random().toString(36).substring(2, 11),
                type: (override.elementType === 'image') ? 'image' : (override.elementType as any === 'table' ? 'table' : 'text'),
                x: (override.x || 0) + 20,
                y: (override.y || 0) + 20,
                content: override.content || '',
                binding: override.isDynamic ? override.path : undefined,
                style: {
                    ...cleanDetachedStyle(override.styleOverrides),
                    position: 'absolute' as any,
                    width: override.width ? `${override.width}px` : undefined,
                    height: override.height ? `${override.height}px` : undefined,
                },
                tableData: override.tableData,
                rows: override.rowCount,
                cols: override.colCount
            };
            setState(prev => ({ ...prev, elements: [...prev.elements, newEl], selectedId: newEl.id, selectedXsltElement: null }));
        }
        setNotification({ message: 'Nesne kopyalandı.', type: 'success' });
    };

    const handleZIndex = (action: 'front' | 'back' | 'forward' | 'backward') => {
        saveHistory();
        setState(prev => {
            let elements = [...prev.elements];
            let overrides = [...prev.xsltOverrides];
            let targetId = prev.selectedId || (prev.selectedXsltElement ? prev.selectedXsltElement.elementId : null);

            if (!targetId) return prev;

            const isXslt = !!prev.selectedXsltElement;

            // Calculate current max/min z-index to ensure correct layering
            const getCurrentZ = (style: any) => parseInt(style?.zIndex || '1');

            const updateZ = (currentZ: number) => {
                let newZ = currentZ;
                switch (action) {
                    case 'front': newZ = 1000; break;
                    case 'back': newZ = 0; break;
                    case 'forward': newZ = currentZ + 1; break;
                    case 'backward': newZ = Math.max(0, currentZ - 1); break;
                }
                return newZ;
            };

            if (isXslt) {
                const idx = overrides.findIndex(o => o.elementId === targetId);
                if (idx >= 0) {
                    const currentZ = getCurrentZ(overrides[idx].styleOverrides);
                    const newZ = updateZ(currentZ);
                    const updated = {
                        ...overrides[idx],
                        styleOverrides: { ...overrides[idx].styleOverrides, zIndex: newZ }
                    };
                    overrides[idx] = updated;
                    if (iframeRef.current?.contentWindow) {
                        iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: targetId, style: { zIndex: newZ } }, '*');
                    }
                    return { ...prev, xsltOverrides: overrides, selectedXsltElement: updated };
                }
            } else {
                elements = elements.map(el => {
                    if (el.id === targetId) {
                        const currentZ = getCurrentZ(el.style);
                        const newZ = updateZ(currentZ);
                        return { ...el, style: { ...el.style, zIndex: newZ } };
                    }
                    return el;
                });
                return { ...prev, elements };
            }
            return prev;
        });
    };

    const cleanDetachedStyle = (style: any) => {
        if (!style) return {};
        // Strip table-specific and structural styles that shouldn't persist after detachment
        const {
            display, border, padding, verticalAlign, margin,
            position, left, top, right, bottom,
            width, height, // Width/Height are handled separately
            ...rest
        } = style;

        return {
            ...rest,
            backgroundColor: style.backgroundColor === 'transparent' ? 'transparent' : style.backgroundColor,
            display: 'block',
            border: 'none',
            padding: '0px',
            margin: '0px'
        };
    };

    const extractElementFromXslt = () => {
        if (!state.selectedXsltElement) return;
        saveHistory();

        const { content, x, y, styleOverrides, width, height, elementType, src } = state.selectedXsltElement;

        // Hide original
        const updatedXslt = {
            ...state.selectedXsltElement,
            styleOverrides: {
                ...state.selectedXsltElement.styleOverrides,
                display: 'none' as any
            }
        };

        const isImage = elementType === 'img' || elementType === 'image';

        // Create new element (text or image)
        const newEl: DesignElement = {
            id: Math.random().toString(36).substring(2, 11),
            type: isImage ? 'image' : 'text',
            x: x || 0,
            y: y || 0,
            content: (isImage ? src : content) || (isImage ? '' : 'Metin'),
            style: {
                ...cleanDetachedStyle(styleOverrides),
                position: 'absolute',
                width: width ? `${width}px` : (isImage ? '100px' : 'auto'),
                height: height ? `${height}px` : (isImage ? '100px' : 'auto'),
                zIndex: 10,
                // Ensure specific overrides for text
                ...(isImage ? {} : { backgroundColor: 'transparent' })
            }
        };

        setState(prev => {
            const overrides = [...prev.xsltOverrides];
            const idx = overrides.findIndex(o => o.elementId === updatedXslt.elementId);
            if (idx >= 0) overrides[idx] = updatedXslt;
            else overrides.push(updatedXslt);

            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updatedXslt.elementId, style: { display: 'none' } }, '*');
            }

            return {
                ...prev,
                xsltOverrides: overrides,
                elements: [...prev.elements, newEl],
                selectedId: newEl.id,
                selectedXsltElement: null
            };
        });

        setNotification({ message: 'Öğe ayrıştırıldı ve serbest bırakıldı.', type: 'success' });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        saveHistory();

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            if (selectedElement && selectedElement.type === 'image') {
                setState(prev => ({
                    ...prev,
                    elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, content: base64 } : el)
                }));
            } else {
                initiateAddElement('image', base64);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };


    const handleDragStart = (event: any) => {
        setIsDragging(true);
        const { active } = event;
        // Auto-select element on drag start if not already selected
        if (active && active.id !== state.selectedId) {
            setState(prev => ({ ...prev, selectedId: active.id as string }));
        }
    };

    const handleDragMove = (event: DragEndEvent) => {
        const { active, delta } = event;

        // Throttling postMessage for performance (30fps)
        const now = Date.now();
        if (now - lastUpdateRef.current < 32) return;
        lastUpdateRef.current = now;

        // Check if it is an XSLT element (starts with table-, img-, etc and has overrides)
        let override = state.xsltOverrides.find(o => o.elementId === active.id);

        // Fallback to selected element if not in overrides yet
        if (!override && state.selectedXsltElement && state.selectedXsltElement.elementId === active.id) {
            override = state.selectedXsltElement;
        }

        if (override) {
            const newX = (override.x || 0) + (delta.x / designZoom);
            const newY = (override.y || 0) + (delta.y / designZoom);

            const styleLeft = newX - (override.offsetX || 0);
            const styleTop = newY - (override.offsetY || 0);

            // Live update via postMessage
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({
                    type: 'UPDATE_ELEMENT_STYLE',
                    elementId: active.id,
                    style: {
                        left: `${styleLeft}px`,
                        top: `${styleTop}px`,
                        position: 'absolute' as any
                    }
                }, '*');
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setIsDragging(false);
        // Prevent click-to-move from firing right after drag ends
        wasDraggingRef.current = true;
        setTimeout(() => { wasDraggingRef.current = false; }, 200);
        const { active, delta } = event;
        if (active) {
            const dx = delta.x / designZoom;
            const dy = delta.y / designZoom;

            // Check if it is an XSLT element
            const overrideIndex = state.xsltOverrides.findIndex(o => o.elementId === active.id);
            const isXsltElement = overrideIndex >= 0 || (state.selectedXsltElement && state.selectedXsltElement.elementId === active.id);

            if (isXsltElement) {
                saveHistory();
                setState(prev => {
                    const overrides = [...prev.xsltOverrides];
                    // Get current state from override list OR selected element
                    const current = overrideIndex >= 0 ? overrides[overrideIndex] : prev.selectedXsltElement!;

                    let newX = (current.x || 0) + dx;
                    let newY = (current.y || 0) + dy;

                    // Snap to grid
                    newX = Math.round(newX / SNAP_SIZE) * SNAP_SIZE;
                    newY = Math.round(newY / SNAP_SIZE) * SNAP_SIZE;

                    const styleLeft = newX - (current.offsetX || 0);
                    const styleTop = newY - (current.offsetY || 0);

                    const updated = {
                        ...current,
                        x: newX,
                        y: newY,
                        styleOverrides: {
                            ...current.styleOverrides,
                            left: `${styleLeft}px`,
                            top: `${styleTop}px`,
                            position: 'absolute' as any
                        }
                    };

                    // Update or Add to overrides
                    if (overrideIndex >= 0) {
                        overrides[overrideIndex] = updated;
                    } else {
                        overrides.push(updated);
                    }

                    // Also update selectedXsltElement if it matches
                    const newSelected = (prev.selectedXsltElement && prev.selectedXsltElement.elementId === active.id) ? updated : prev.selectedXsltElement;

                    return { ...prev, xsltOverrides: overrides, selectedXsltElement: newSelected };
                });
            } else {
                saveHistory();
                setState(prev => ({
                    ...prev,
                    elements: prev.elements.map(el => {
                        if (el.id === active.id) {
                            let newX = el.x + dx;
                            let newY = el.y + dy;
                            // Snap
                            newX = Math.round(newX / SNAP_SIZE) * SNAP_SIZE;
                            newY = Math.round(newY / SNAP_SIZE) * SNAP_SIZE;
                            return { ...el, x: newX, y: newY };
                        }
                        return el;
                    })
                }));
            }
        }
    };

    // Keyboard support for moving objects
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!state.selectedId && !state.selectedXsltElement) return;
            // Don't move if typing in an input
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            const isArrow = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code);
            if (!isArrow) return;

            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            const moveX = e.code === 'ArrowLeft' ? -step : e.code === 'ArrowRight' ? step : 0;
            const moveY = e.code === 'ArrowUp' ? -step : e.code === 'ArrowDown' ? step : 0;

            if (state.selectedId) {
                setState(prev => ({
                    ...prev,
                    elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, x: el.x + moveX, y: el.y + moveY } : el)
                }));
            } else if (state.selectedXsltElement) {
                const elementId = state.selectedXsltElement.elementId;
                setState(prev => {
                    const overrides = [...prev.xsltOverrides];
                    const idx = overrides.findIndex(o => o.elementId === elementId);
                    if (idx >= 0) {
                        const current = overrides[idx];
                        const newX = (current.x || 0) + moveX;
                        const newY = (current.y || 0) + moveY;

                        const styleLeft = newX - (current.offsetX || 0);
                        const styleTop = newY - (current.offsetY || 0);

                        const updated = {
                            ...current,
                            x: newX,
                            y: newY,
                            styleOverrides: {
                                ...current.styleOverrides,
                                left: `${styleLeft}px`,
                                top: `${styleTop}px`,
                                position: 'absolute' as any
                            }
                        };
                        overrides[idx] = updated;

                        if (iframeRef.current?.contentWindow) {
                            iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                        }

                        return { ...prev, xsltOverrides: overrides, selectedXsltElement: updated };
                    }
                    return prev;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.selectedId, state.selectedXsltElement, state.xsltOverrides]);

    const handleResize = (id: string, w: number, h: number, x?: number, y?: number) => {
        // saveHistory(); // Removed for performance, called via onResizeStart

        // Update user elements
        setState(prev => ({
            ...prev,
            elements: prev.elements.map(el => el.id === id ? {
                ...el,
                x: x !== undefined ? x : el.x,
                y: y !== undefined ? y : el.y,
                style: { ...el.style, width: `${w}px`, height: `${h}px` },
                // If it is a table we might need to adjust colWidths proportionally, but for now just container
            } : el)
        }));

        // Update XSLT elements if selected
        if (state.selectedXsltElement?.elementId === id) {
            setState(prev => {
                const updated = {
                    ...prev.selectedXsltElement!,
                    width: w,
                    height: h,
                    x: x !== undefined ? x : (prev.selectedXsltElement!.x || 0),
                    y: y !== undefined ? y : (prev.selectedXsltElement!.y || 0),
                    styleOverrides: {
                        ...prev.selectedXsltElement!.styleOverrides,
                        width: `${w}px`,
                        height: `${h}px`,
                        left: x !== undefined ? `${x - (prev.selectedXsltElement!.offsetX || 0)}px` : prev.selectedXsltElement!.styleOverrides.left,
                        top: y !== undefined ? `${y - (prev.selectedXsltElement!.offsetY || 0)}px` : prev.selectedXsltElement!.styleOverrides.top
                    }
                };
                const newOverrides = prev.xsltOverrides.map(o => o.elementId === id ? updated : o);
                if (!prev.xsltOverrides.find(o => o.elementId === id)) newOverrides.push(updated);

                // Update iframe
                if (iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({
                        type: 'UPDATE_ELEMENT_STYLE',
                        elementId: id,
                        style: updated.styleOverrides
                    }, '*');
                }

                return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
            });
        }
    };

    const selectedElement = state.elements.find(e => e.id === state.selectedId);

    const [userInfo, setUserInfo] = useState<{ credits: number, role: string, free_design_used: number } | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        api.getMe()
            .then(info => {
                setUserInfo(info);
                // Kredi sıfırsa otomatik ödeme modalını aç
                if (info.credits === 0 && info.role !== 'admin') {
                    setShowPaymentModal(true);
                }
            })
            .catch(err => {
                console.error('Kullanıcı bilgisi alınamadı:', err);
                setLoadError('Sunucu bağlantısı kurulamadı. Lütfen giriş yaptığınızdan emin olun ve sayfayı yenileyin.');
            });
    }, []);

    const PAGE_WIDTH = 794; // A4 @ 96 DPI
    const PAGE_HEIGHT = 1123;

    const alignElement = (alignment: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom') => {
        saveHistory();

        // Helper to get element dimensions
        const getDims = (el: any, style: any) => {
            let w = parseInt(style.width) || 0;
            let h = parseInt(style.height) || 0;
            // Fallbacks for known types if width/height not in style
            if (el.elementType === 'image' && !w) w = 100; // Estimated default
            if (el.elementType === 'image' && !h) h = 100;
            // For text/other, it's hard to know exact rendered size without DOM access, assume some defaults or use rect if available?
            // Since we sync rect from click, we might have it in `width` / `height` property of XSLT element
            if (el.width && !w) w = el.width;
            if (el.height && !h) h = el.height;
            return { w, h };
        };

        const updatePos = (currentX: number, currentY: number, w: number, h: number) => {
            let newX = currentX;
            let newY = currentY;

            if (alignment === 'left') newX = 20; // Margin
            if (alignment === 'center-x') newX = (PAGE_WIDTH - w) / 2;
            if (alignment === 'right') newX = PAGE_WIDTH - 20 - w;

            if (alignment === 'top') newY = 20;
            if (alignment === 'center-y') newY = (PAGE_HEIGHT - h) / 2;
            if (alignment === 'bottom') newY = PAGE_HEIGHT - 20 - h;

            return { x: Math.round(newX), y: Math.round(newY) };
        };

        if (state.selectedIds.length > 0) {
            setState(prev => {
                const newElements = prev.elements.map(el => {
                    if (prev.selectedIds.includes(el.id)) {
                        // ... calculation logic ...
                        // For multi-selection, alignment is tricky. 
                        // Typically: 
                        // Left: Align all to the Leftmost X of the selection group OR Align all to Page Left?
                        // User said "Fast Report alignment package". Fast Report usually aligns relative to the 'Main Selection' (last selected) or 'Group Bounds'.
                        // Let's implement 'Align to Selection Bounds' for now, it's safer.
                        // Actually, standard behavior:
                        // Single Selection -> Align to Page
                        // Multi Selection -> Align to 'Anchor' (usually the last selected, or the one with specific border).
                        // Let's use the LAST selected (state.selectedId) as the Anchor.

                        // Wait, let's implement Align to Leftmost/Topmost of the group for simplicity and predictable behavior like Looker Studio/PowerPoint.
                        return el;
                    }
                    return el;
                });
                return prev;
            });

            // Re-implementing correctly:
            setState(prev => {
                if (prev.selectedIds.length <= 1) {
                    // Single element behavior (Align to Page)
                    return {
                        ...prev,
                        elements: prev.elements.map(el => {
                            if (el.id === state.selectedId) {
                                const w = parseInt(el.style?.width as string) || (el.content.length * 7) + 20;
                                const h = parseInt(el.style?.height as string) || 30;
                                const { x, y } = updatePos(el.x, el.y, w, h);
                                return { ...el, x, y };
                            }
                            return el;
                        })
                    };
                } else {
                    // Multi element behavior (Align Relative to Selection Bounds)
                    const selectedEls = prev.elements.filter(e => prev.selectedIds.includes(e.id));
                    if (selectedEls.length === 0) return prev;

                    // Calculate bounds
                    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                    // Also find center
                    let totalCenterY = 0;

                    selectedEls.forEach(el => {
                        const w = parseInt(el.style?.width as string) || 50;
                        const h = parseInt(el.style?.height as string) || 30;
                        if (el.x < minX) minX = el.x;
                        if (el.x + w > maxX) maxX = el.x + w;
                        if (el.y < minY) minY = el.y;
                        if (el.y + h > maxY) maxY = el.y + h;
                    });

                    const groupCenterX = (minX + maxX) / 2;
                    const groupCenterY = (minY + maxY) / 2;

                    return {
                        ...prev,
                        elements: prev.elements.map(el => {
                            if (prev.selectedIds.includes(el.id)) {
                                const w = parseInt(el.style?.width as string) || (el.content.length * 7) + 20;
                                const h = parseInt(el.style?.height as string) || 30;

                                let newX = el.x;
                                let newY = el.y;

                                if (alignment === 'left') newX = minX;
                                if (alignment === 'center-x') newX = groupCenterX - (w / 2); // Align center to group center
                                if (alignment === 'right') newX = maxX - w;

                                if (alignment === 'top') newY = minY;
                                if (alignment === 'center-y') newY = groupCenterY - (h / 2);
                                if (alignment === 'bottom') newY = maxY - h;

                                return { ...el, x: newX, y: newY };
                            }
                            return el;
                        })
                    };
                }
            });
            setNotification({ message: 'Nesneler hizalandı.', type: 'success' });
        } else if (state.selectedXsltElement) {
            setState(prev => {
                const current = prev.selectedXsltElement!;
                const { w, h } = getDims(current, current.styleOverrides);
                const { x, y } = updatePos(current.x || 0, current.y || 0, w, h);

                const updated = {
                    ...current,
                    x, y,
                    styleOverrides: {
                        ...current.styleOverrides,
                        left: `${x - (current.offsetX || 0)}px`,
                        top: `${y - (current.offsetY || 0)}px`,
                        position: 'absolute' as any
                    }
                };

                const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);

                if (iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                }

                return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
            });
            setNotification({ message: 'Bileşen hizalandı.', type: 'success' });
        }
    };

    const handleOneClickSave = async () => {
        // Unified Save Flow:
        // 1. Consume Credit
        // 2. Save to System (Pending Approval)
        // 3. Download to Computer

        // Auto-generate name so we don't annoy the user with prompts
        const timestamp = new Date().toLocaleString('tr-TR').replace(/[:\.\s]/g, '_');
        const defaultName = `Tasarim_${moduleId}_${timestamp}`;
        // If user really wants to name it, we could ask, but "soru gereksiz" suggests valid defaults are better. 
        // Let's assume the document Name + Date is sufficient.

        try {
            // 1. Consume Credit first
            const res = await api.consumeCredit();
            if (!res.success) throw new Error('Yetersiz kredi');

            setUserInfo(prev => prev ? { ...prev, credits: res.credits } : null);

            // Prepare Content
            const finalXslt = mergeDesignWithXslt(originalXslt, state);

            // 2. Save to System (Pending Approval)
            await api.saveTemplate({
                name: defaultName,
                description: 'Otomatik kayıt (Bilgisayar + Sistem)',
                fileName: template,
                baseContent: originalXslt,
                xsltContent: finalXslt,
                previewColor: state.themeColor || '#64748b',
                category: 'Kullanıcı Tasarımları',
                docType: moduleId // Pass the document type
            });

            // 3. Download to Computer
            const blob = new Blob([finalXslt], { type: 'text/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${defaultName}.xslt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setNotification({
                message: 'Tasarım bilgisayarınıza indirildi ve onay için sisteme gönderildi.',
                type: 'success'
            });

        } catch (err: any) {
            if (err.message?.includes('Yetersiz kredi')) {
                setShowPaymentModal(true);
            } else {
                console.error('Save failed:', err);
                setNotification({ message: 'İşlem başarısız: ' + err.message, type: 'error' });
            }
        }
    };


    const handleLocalSave = () => {
        setNotification({ message: 'Tasarım durumu kaydedildi (Checkpoint).', type: 'success' });
    };

    if (loadError) {
        return (
            <div style={{ height: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
                <div style={{ color: '#f87171', fontSize: '1.2rem', fontWeight: 'bold' }}>⚠️ Yükleme Hatası</div>
                <div style={{ color: '#94a3b8', maxWidth: '500px' }}>{loadError}</div>
                <button onClick={onBack} className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Geri Dön</button>
            </div>
        );
    }

    if (!userInfo || !originalXslt) {
        return (
            <div style={{ height: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                <div style={{ color: '#94a3b8', fontSize: '1rem' }}>Tasarım Editörü Hazırlanıyor...</div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a', position: 'relative' }}>
            {/* Custom Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed', top: '2rem', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '1rem 1.5rem', borderRadius: '16px', background: '#1e293b',
                    border: `1px solid ${notification.type === 'success' ? '#10b981' : '#f87171'}`,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: notification.type === 'success' ? '#10b98122' : '#f8717122'
                    }}>
                        {notification.type === 'success' ? (
                            <ShieldCheck size={18} color="#10b981" />
                        ) : (
                            <X size={18} color="#f87171" />
                        )}
                    </div>
                    <span style={{ color: 'white', fontWeight: '500', fontSize: '0.95rem' }}>{notification.message}</span>
                </div>
            )}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={(credits) => setUserInfo(prev => prev ? { ...prev, credits } : null)}
            />

            {/* Field Selection Modal */}
            {showFieldModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '500px', maxHeight: '80vh', background: '#1e293b', borderRadius: '16px', display: 'flex', flexDirection: 'column', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>XML Veri Alanı Ekle</h3>
                            <button onClick={() => setShowFieldModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                {(() => {
                                    const mergedFields = [
                                        ...allXmlFields,
                                        ...standardUBLFields
                                            .filter(sf => !allXmlFields.some(af => af.path === sf.path))
                                            .map(sf => ({ name: sf.name, path: sf.path, value: '(Standart Alan)', isNumeric: sf.isNumeric }))
                                    ];

                                    return mergedFields.length > 0 ? (
                                        mergedFields.map((field, idx) => (
                                            <div key={idx} style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #334155' }}>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: 'bold' }}>{field.name}</div>
                                                    <div style={{ color: '#64748b', fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{field.path}</div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>Örnek: <span style={{ color: '#e2e8f0' }}>{field.value}</span></div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setShowFieldModal(false);
                                                        setPlacingMode({
                                                            type: 'text',
                                                            content: `{${field.name}}`, // Show simplified binding name in UI
                                                            binding: field.path, // Store full path
                                                            format: field.isNumeric ? 'number' : undefined // Default format if numeric
                                                        });
                                                        setNotification({ message: 'Alanı yerleştirmek için tıklayın...', type: 'success' });
                                                    }}
                                                    style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                                >
                                                    Ekle
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Yüklü XML bulunamadı veya ayrıştırılamadı.</div>
                                    )
                                })()}
                            </div>
                        </div>

                        {/* Numeric Formatting Options */}
                        {selectedElement && selectedElement.binding && (selectedElement.format || allXmlFields.find(f => f.path === selectedElement.binding)?.isNumeric) && (
                            <div className="property-section" style={{ marginTop: '1rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px', padding: '10px' }}>
                                <label style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Sayısal Biçimlendirme</label>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>Format Türü</label>
                                        <select
                                            className="input-field"
                                            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '4px', fontSize: '0.75rem', borderRadius: '4px' }}
                                            value={selectedElement.format || 'number'}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setState(prev => ({
                                                    ...prev,
                                                    elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, format: val } : el)
                                                }));
                                            }}
                                        >
                                            <option value="number">Standart Sayı (1.234,56)</option>
                                            <option value="currency">Para Birimi (₺1.234,56)</option>
                                            <option value="percentage">Yüzde (%12)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>Ondalık Basamak</label>
                                        <input
                                            type="number" min="0" max="4"
                                            className="input-field"
                                            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '4px', fontSize: '0.75rem', borderRadius: '4px' }}
                                            value={selectedElement.decimals !== undefined ? selectedElement.decimals : 2}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setState(prev => ({
                                                    ...prev,
                                                    elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, decimals: val } : el)
                                                }));
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />

            <header style={{
                height: '72px', background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', padding: '0 1.5rem', zIndex: 10, gap: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <button onClick={onBack} title="Geri Dön" style={{ width: '44px', height: '44px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ChevronLeft size={22} />
                    </button>
                    <div style={{ width: '1px', height: '28px', background: '#334155', flexShrink: 0 }}></div>

                    <button
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        title="Son İşlemi Geri Al"
                        style={{
                            height: '44px', padding: '0 1.25rem', fontSize: '0.85rem',
                            background: history.length > 0 ? 'rgba(129, 140, 248, 0.1)' : 'rgba(30, 41, 59, 0.2)',
                            border: '1px solid',
                            borderColor: history.length > 0 ? 'rgba(129, 140, 248, 0.3)' : 'rgba(255,255,255,0.05)',
                            color: history.length > 0 ? '#a5b4fc' : '#475569', borderRadius: '12px',
                            cursor: history.length > 0 ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            fontWeight: '600'
                        }}
                    >
                        <Undo size={18} /> Geri Al
                    </button>

                    <button onClick={handleOneClickSave} style={{
                        height: '44px', padding: '0 1.25rem', background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(255,255,255,0.1)', color: 'white',
                        borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex',
                        alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
                    }}>
                        <Save size={18} /> Hızlı Kayıt
                    </button>

                    <button onClick={handleOneClickSave} style={{
                        height: '44px', padding: '0 1.5rem', fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 20px -6px rgba(99, 102, 241, 0.6)', whiteSpace: 'nowrap',
                        cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s'
                    }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <Download size={20} /> Kaydet ve İndir
                    </button>
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
                    <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '100%', overflow: 'hidden' }}>
                        <Layout size={20} color="#818cf8" />
                        <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{docName}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>{template}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, paddingRight: '0.5rem' }}>

                </div>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <aside style={{
                    width: '300px',
                    background: '#0f172a',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 5,
                    boxShadow: '10px 0 30px rgba(0,0,0,0.2)'
                }}>
                    {/* User Profile & Credits Section */}
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, transparent 100%)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)' }}>
                                <Settings size={18} />
                            </div>
                            <div>
                                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>Hesap Yönetimi</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Tasarım Editörü</div>
                            </div>
                        </div>
                        {userInfo && (
                            <div
                                onClick={() => setShowPaymentModal(true)}
                                style={{
                                    background: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: '8px',
                                    border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ShieldCheck size={14} color="#10b981" />
                                    <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600' }}>Kredi</span>
                                </div>
                                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>{userInfo.credits}</span>
                            </div>
                        )}
                    </div>
                    {/* Sidebar Tab Navigation */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.4)', flexShrink: 0 }}>
                        {([
                            { key: 'TOOLS' as const, icon: <Box size={14} />, label: 'Araçlar' },
                            { key: 'LAYERS' as const, icon: <Layers size={14} />, label: 'Katmanlar' },
                            { key: 'PROPERTIES' as const, icon: <Settings size={14} />, label: 'Özellikler' },
                        ]).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveSidebarTab(tab.key)}
                                style={{
                                    flex: 1,
                                    padding: '10px 4px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: activeSidebarTab === tab.key ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    border: 'none',
                                    borderBottom: activeSidebarTab === tab.key ? '2px solid #6366f1' : '2px solid transparent',
                                    color: activeSidebarTab === tab.key ? '#a5b4fc' : '#64748b',
                                    cursor: 'pointer',
                                    fontSize: '0.6rem',
                                    fontWeight: activeSidebarTab === tab.key ? '800' : '600',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => { if (activeSidebarTab !== tab.key) e.currentTarget.style.color = '#94a3b8'; }}
                                onMouseOut={(e) => { if (activeSidebarTab !== tab.key) e.currentTarget.style.color = '#64748b'; }}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Sidebar Tab Content */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.2)', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>

                        {/* ===== TOOLS TAB ===== */}
                        {activeSidebarTab === 'TOOLS' && (
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ padding: '10px 1.25rem', background: 'rgba(30, 41, 59, 0.4)', color: '#6366f1', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '1px' }}>
                                    <Box size={14} /> TASARIM ARAÇLARI
                                </div>
                                <div style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem' }}>
                                        <button
                                            onClick={() => setShowFieldModal(true)}
                                            style={{ gridColumn: 'span 4', height: '36px', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <Sparkles size={16} /> XML Veri Alanı Ekle
                                        </button>
                                        {[
                                            { id: 'text', icon: <Type size={20} />, label: 'Metin', action: () => initiateAddElement('text', 'Yeni Metin') },
                                            { id: 'table', icon: <LucideTable size={20} />, label: 'Tablo', action: () => initiateAddElement('table') },
                                            { id: 'formula', icon: <Sigma size={20} />, label: 'Formül', action: () => initiateAddElement('formula', 'Fiyat * Adet') },
                                            { id: 'qrcode', icon: <QrCode size={20} />, label: 'QR', action: () => initiateAddElement('qrcode', 'QR-CODE') },
                                            { id: 'image', icon: <ImageIcon size={20} />, label: 'Resim', action: () => fileInputRef.current?.click() }
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={item.action}
                                                title={item.label}
                                                style={{
                                                    height: '44px', background: 'rgba(30, 41, 59, 0.5)',
                                                    border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8',
                                                    borderRadius: '12px', cursor: 'pointer', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = '#6366f1';
                                                    e.currentTarget.style.color = 'white';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                                                    e.currentTarget.style.color = '#94a3b8';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                {item.icon}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {[
                                            { id: 'rect', icon: <Square size={16} />, action: () => addShape('rect'), label: 'Dikdörtgen' },
                                            { id: 'circle', icon: <Circle size={16} />, action: () => addShape('circle'), label: 'Daire' },
                                            { id: 'line', icon: <Minus size={16} />, action: () => addShape('line'), label: 'Çizgi' }
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={item.action}
                                                title={item.label}
                                                style={{
                                                    padding: '6px 12px', background: 'rgba(30, 41, 59, 0.4)',
                                                    border: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8',
                                                    borderRadius: '6px', cursor: 'pointer', display: 'flex',
                                                    alignItems: 'center', gap: '6px', fontSize: '0.65rem', transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = 'white'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                                            >
                                                {item.icon} {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ===== LAYERS TAB ===== */}
                        {activeSidebarTab === 'LAYERS' && (
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <div style={{ padding: '10px 1.25rem', background: 'rgba(30, 41, 59, 0.4)', color: '#10b981', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '1px' }}>
                                    <Layers size={14} /> KATMANLAR & YAPI
                                </div>
                                <div style={{ padding: '0.75rem', overflowY: 'auto', flex: 1 }}>
                                    {state.structureTree && state.structureTree.length > 0 ? (
                                        state.structureTree.map(node => (
                                            <StructureItem
                                                key={node.id}
                                                node={node}
                                                level={0}
                                                selectedId={state.selectedXsltElement?.elementId || null}
                                                onSelect={(id) => {
                                                    if (iframeRef.current?.contentWindow) {
                                                        iframeRef.current.contentWindow.postMessage({ type: 'SELECT_ELEMENT', elementId: id }, '*');
                                                    }
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.65rem', fontStyle: 'italic', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                            Yükleniyor veya Boş...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ===== PROPERTIES TAB ===== */}
                        {activeSidebarTab === 'PROPERTIES' && (
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                {/* Z-Index Controls */}
                                <div style={{ padding: '8px 1.25rem', background: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Sigma size={12} color="#818cf8" />
                                        <span style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: '700' }}>Z-SIRALAMA</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button onClick={() => handleZIndex('front')} title="En Üste Getir" style={{ padding: '4px', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1' }}><ChevronsUp size={14} /></button>
                                        <button onClick={() => handleZIndex('forward')} title="Öne Getir" style={{ padding: '4px', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1' }}><ArrowUp size={14} /></button>
                                        <button onClick={() => handleZIndex('backward')} title="Arkaya Gönder" style={{ padding: '4px', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1' }}><ArrowDown size={14} /></button>
                                        <button onClick={() => handleZIndex('back')} title="En Alta Gönder" style={{ padding: '4px', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1' }}><ChevronsDown size={14} /></button>
                                    </div>
                                </div>

                                {/* Selection Badge */}
                                <div style={{ padding: '0.5rem 1.25rem', background: 'rgba(15, 23, 42, 0.3)', flexShrink: 0 }}>
                                    {state.selectedId ? (
                                        <div style={{ padding: '8px 12px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <span style={{ fontSize: '0.55rem', color: '#818cf8', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>SEÇİLİ BİLEŞEN</span>
                                                <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 'bold' }}>{state.elements.find(e => e.id === state.selectedId)?.type.toUpperCase()}</span>
                                            </div>
                                            <button onClick={duplicateElement} title="Kopyala" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}><Copy size={12} /></button>
                                        </div>
                                    ) : state.selectedXsltElement ? (
                                        <div style={{ padding: '8px 12px', background: state.selectedXsltElement.isDynamic ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: `1px solid ${state.selectedXsltElement.isDynamic ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ minWidth: 0 }}>
                                                <span style={{ fontSize: '0.55rem', color: state.selectedXsltElement.isDynamic ? '#34d399' : '#818cf8', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    {state.selectedXsltElement.isDynamic ? 'XSLT VERİ ALANI' : 'XSLT BİLEŞENİ'}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                                    {state.selectedXsltElement.isDynamic && state.selectedXsltElement.path ? state.selectedXsltElement.path.split('/').pop() : state.selectedXsltElement.elementType.toUpperCase()}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button onClick={extractElementFromXslt} title="Ayır" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}><FileOutput size={12} /></button>
                                                <button onClick={duplicateElement} title="Kopyala" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}><Copy size={12} /></button>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Properties Content */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
                                    {selectedDbField ? (
                                        <div style={{ background: '#6366f122', padding: '1rem', border: '1px solid #6366f1', borderRadius: '8px', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: 'bold' }}>SİSTEM ALANI</span>
                                            <h4 style={{ margin: '4px 0', fontSize: '0.9rem', color: 'white' }}>{selectedDbField.path.split('/').pop()}</h4>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', wordBreak: 'break-all', marginBottom: '8px' }}>{selectedDbField.path}</div>
                                            {state.selectedId && (
                                                <button
                                                    onClick={() => {
                                                        setState(prev => ({
                                                            ...prev,
                                                            elements: prev.elements.map(el =>
                                                                el.id === state.selectedId ? { ...el, binding: selectedDbField.path } : el
                                                            )
                                                        }));
                                                        setSelectedDbField(null);
                                                    }}
                                                    style={{ width: '100%', padding: '6px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                                >
                                                    Seçili Nesneye Bağla
                                                </button>
                                            )}
                                        </div>
                                    ) : null}

                                    {selectedElement ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {selectedElement.type === 'image' ? (
                                                <>
                                                    <div className="form-group">
                                                        <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Görsel Kaynağı (Base64)</label>
                                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                            <button
                                                                onClick={() => fileInputRef.current?.click()}
                                                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                                            >
                                                                <Upload size={14} /> Görsel Değiştir
                                                            </button>
                                                        </div>
                                                        <div style={{ marginTop: '8px', padding: '4px', background: '#020617', borderRadius: '4px', textAlign: 'center' }}>
                                                            <img src={selectedElement.content} style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }} alt="Preview" />
                                                        </div>
                                                    </div>

                                                    <div className="form-group" style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155', marginTop: '1rem' }}>
                                                        <label style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Sparkles size={14} /> GÖRSEL EFEKTLERİ
                                                        </label>

                                                        {/* Opacity Control */}
                                                        <div style={{ marginBottom: '12px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                                <label style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>Şeffaflık</label>
                                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace' }}>%{Math.round((parseFloat(String(selectedElement.style?.opacity ?? '1'))) * 100)}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', opacity: 0.2 }}></div>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="1"
                                                                    step="0.01"
                                                                    style={{ flex: 1, height: '4px', accentColor: '#6366f1', cursor: 'pointer' }}
                                                                    value={selectedElement.style?.opacity ?? '1'}
                                                                    onChange={(e) => {
                                                                        const opacity = e.target.value;
                                                                        setState(prev => ({
                                                                            ...prev,
                                                                            elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, opacity } } : el)
                                                                        }));
                                                                    }}
                                                                />
                                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'white' }}></div>
                                                            </div>
                                                        </div>

                                                        {/* Border Radius Control */}
                                                        <div style={{ marginBottom: '12px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                                <label style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>Köşe Yuvarlama</label>
                                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace' }}>{parseInt(String(selectedElement.style?.borderRadius || '0')) || 0}px</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                style={{ width: '100%', height: '4px', accentColor: '#6366f1', cursor: 'pointer' }}
                                                                value={parseInt(String(selectedElement.style?.borderRadius || '0'))}
                                                                onChange={(e) => {
                                                                    const borderRadius = `${e.target.value}px`;
                                                                    setState(prev => ({
                                                                        ...prev,
                                                                        elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, borderRadius } } : el)
                                                                    }));
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Shadow Control (Checkbox) */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                                                            onClick={() => {
                                                                const currentShadow = selectedElement.style?.boxShadow && selectedElement.style.boxShadow !== 'none';
                                                                const boxShadow = !currentShadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)' : 'none';
                                                                setState(prev => ({
                                                                    ...prev,
                                                                    elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, boxShadow } } : el)
                                                                }));
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '16px', height: '16px', borderRadius: '4px',
                                                                border: '1px solid #475569',
                                                                background: selectedElement.style?.boxShadow && selectedElement.style?.boxShadow !== 'none' ? '#6366f1' : 'transparent',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                                            }}>
                                                                {selectedElement.style?.boxShadow && selectedElement.style?.boxShadow !== 'none' && <Check size={10} color="white" />}
                                                            </div>
                                                            <label style={{ fontSize: '0.7rem', color: '#cbd5e1', cursor: 'pointer', userSelect: 'none' }}>Gölge Ekle</label>
                                                        </div>

                                                        {/* Grayscale Control (Checkbox) */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                                                            onClick={() => {
                                                                const currentFilter = selectedElement.style?.filter;
                                                                const isGrayscale = currentFilter && currentFilter.includes('grayscale(100%)');
                                                                const filter = isGrayscale ? 'none' : 'grayscale(100%)';
                                                                setState(prev => ({
                                                                    ...prev,
                                                                    elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, filter } } : el)
                                                                }));
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '16px', height: '16px', borderRadius: '4px',
                                                                border: '1px solid #475569',
                                                                background: selectedElement.style?.filter && selectedElement.style.filter.includes('grayscale(100%)') ? '#6366f1' : 'transparent',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                                            }}>
                                                                {selectedElement.style?.filter && selectedElement.style.filter.includes('grayscale(100%)') && <Check size={10} color="white" />}
                                                            </div>
                                                            <label style={{ fontSize: '0.7rem', color: '#cbd5e1', cursor: 'pointer', userSelect: 'none' }}>Siyah/Beyaz Yap</label>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (<>
                                                <div className="form-group">
                                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selectedElement.type === 'text' ? 'Metin' : selectedElement.type === 'formula' ? 'Formül' : 'İçerik'}</label>
                                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                        <input
                                                            className="input-field"
                                                            style={{ background: '#020617', border: '1px solid #334155', color: 'white', flex: 1, padding: '8px', borderRadius: '4px', fontSize: '0.85rem' }}
                                                            value={selectedElement.content}
                                                            onChange={(e) => setState(prev => ({
                                                                ...prev,
                                                                elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, content: e.target.value } : el)
                                                            }))}
                                                        />
                                                        <button
                                                            onClick={() => copyToClipboard(selectedElement.content, "İçerik kopyalandı")}
                                                            title="Kopyala"
                                                            style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#818cf8', borderRadius: '4px', cursor: 'pointer' }}
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>

                                                    {selectedElement.type === 'formula' && (
                                                        <div style={{ marginTop: '1rem', background: '#0f172a', padding: '0.75rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
                                                            <label style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>FORMÜL OLUŞTURUCU</label>

                                                            {['+', '-', '*', '/', '(', ')', 'sum'].map(op => (
                                                                <button
                                                                    key={op}
                                                                    onClick={() => {
                                                                        setState(prev => ({
                                                                            ...prev,
                                                                            elements: prev.elements.map(el => {
                                                                                if (el.id !== state.selectedId) return el;
                                                                                let add = op === 'sum' ? 'sum( ' : ` ${op} `;
                                                                                return { ...el, content: el.content + add };
                                                                            })
                                                                        }));
                                                                    }}
                                                                    style={{ padding: '6px', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.65rem' }}
                                                                >{op.toUpperCase()}</button>
                                                            ))}

                                                            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                {availableNumericFields.length > 0 ? availableNumericFields.map(f => (
                                                                    <button
                                                                        key={f.path}
                                                                        onClick={() => {
                                                                            // Use safe path for XSL formula (handles Turkish number format)
                                                                            setState(prev => ({
                                                                                ...prev,
                                                                                elements: prev.elements.map(el => {
                                                                                    if (el.id !== state.selectedId) return el;
                                                                                    const safePath = `number(translate(translate(//${f.path}, '.', ''), ',', '.'))`;
                                                                                    return { ...el, content: el.content + safePath };
                                                                                })
                                                                            }));
                                                                        }}
                                                                        style={{ textAlign: 'left', padding: '6px 10px', background: '#020617', border: '1px solid #334155', color: '#94a3b8', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}
                                                                    >
                                                                        <span style={{ color: '#818cf8' }}>{f.name}</span>
                                                                        <span style={{ opacity: 0.5 }}>{f.value}</span>
                                                                    </button>
                                                                )) : (
                                                                    <div style={{ padding: '1rem', textAlign: 'center', color: '#475569', fontSize: '0.7rem' }}>Sayısal alan bulunamadı.</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedElement.binding && (
                                                        <div style={{ marginTop: '4px', fontSize: '0.7rem', color: '#6366f1', background: '#eef2ff22', padding: '4px', borderRadius: '4px' }}>
                                                            🔗 {selectedElement.binding}
                                                        </div>
                                                    )}
                                                </div>
                                            </>)}

                                            <div className="dimensions-panel" style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                    <Move size={16} color="#6366f1" />
                                                    <label style={{ fontSize: '0.75rem', color: 'white', fontWeight: 'bold' }}>Boyutlar & Konum</label>
                                                </div>

                                                {/* Alignment Toolbar */}
                                                <div style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                                                    <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Hizalama</label>
                                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                                        <button onClick={() => alignElement('left')} title="Sola Hizala" style={{ flex: 1, padding: '6px', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1', display: 'flex', justifyContent: 'center' }}><AlignLeft size={16} /></button>
                                                        <button onClick={() => alignElement('center-x')} title="Ortala (Yatay)" style={{ flex: 1, padding: '6px', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1', display: 'flex', justifyContent: 'center' }}><AlignCenter size={16} /></button>
                                                        <button onClick={() => alignElement('right')} title="Sağa Hizala" style={{ flex: 1, padding: '6px', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1', display: 'flex', justifyContent: 'center' }}><AlignRight size={16} /></button>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <button onClick={() => alignElement('top')} title="Üste Hizala" style={{ flex: 1, padding: '6px', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1', display: 'flex', justifyContent: 'center' }}><ArrowUpToLine size={16} /></button>
                                                        <button onClick={() => alignElement('center-y')} title="Ortala (Dikey)" style={{ flex: 1, padding: '6px', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1', display: 'flex', justifyContent: 'center' }}><ScanLine size={16} /></button>
                                                        <button onClick={() => alignElement('bottom')} title="Alta Hizala" style={{ flex: 1, padding: '6px', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1', display: 'flex', justifyContent: 'center' }}><ArrowDownToLine size={16} /></button>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <div className="form-group">
                                                        <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Genişlik (px)</label>
                                                        <input
                                                            type="number"
                                                            className="input-field"
                                                            style={{ background: '#020617', border: '2px solid #6366f188', color: 'white', width: '100%', padding: '6px', borderRadius: '4px' }}
                                                            value={parseInt(selectedElement.style?.width as string) || 0}
                                                            onMouseDown={() => saveHistory()}
                                                            onChange={(e) => {
                                                                const val = e.target.value ? `${e.target.value}px` : undefined;
                                                                setState(prev => ({
                                                                    ...prev,
                                                                    elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, width: val } } : el)
                                                                }));
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Yükseklik (px)</label>
                                                        <input
                                                            type="number"
                                                            className="input-field"
                                                            style={{ background: '#020617', border: '2px solid #6366f188', color: 'white', width: '100%', padding: '6px', borderRadius: '4px' }}
                                                            value={parseInt(selectedElement.style?.height as string) || 0}
                                                            onMouseDown={() => saveHistory()}
                                                            onChange={(e) => {
                                                                const val = e.target.value ? `${e.target.value}px` : undefined;
                                                                setState(prev => ({
                                                                    ...prev,
                                                                    elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, height: val } } : el)
                                                                }));
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <div className="form-group">
                                                        <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Sol Uzaklık (X)</label>
                                                        <input type="number" className="input-field" style={{ background: '#020617', border: '1px solid #334155', color: 'white', width: '100%', padding: '4px' }} value={Math.round(selectedElement.x)} onMouseDown={() => saveHistory()} onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setState(prev => ({ ...prev, elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, x: val } : el) }));
                                                        }} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Üst Uzaklık (Y)</label>
                                                        <input type="number" className="input-field" style={{ background: '#020617', border: '1px solid #334155', color: 'white', width: '100%', padding: '4px' }} value={Math.round(selectedElement.y)} onMouseDown={() => saveHistory()} onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setState(prev => ({ ...prev, elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, y: val } : el) }));
                                                        }} />
                                                    </div>
                                                </div>

                                                {selectedElement.type === 'image' && (
                                                    <div className="form-group" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                                        <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Sığdırma Modu</label>
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            {[
                                                                { mode: 'contain', label: 'Sığdır', desc: 'Resmi orantılı şekilde kutuya sığdırır' },
                                                                { mode: 'cover', label: 'Doldur', desc: 'Kutuyu tamamen doldurur (Zoom/Kırpma)' },
                                                                { mode: 'fill', label: 'Uzat', desc: 'Resmi kutuya yayar (Deforme)' }
                                                            ].map(opt => (
                                                                <button
                                                                    key={opt.mode}
                                                                    title={opt.desc}
                                                                    onClick={() => {
                                                                        saveHistory();
                                                                        setState(prev => ({
                                                                            ...prev,
                                                                            elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, objectFit: opt.mode as any } } : el)
                                                                        }));
                                                                    }}
                                                                    style={{
                                                                        flex: 1,
                                                                        padding: '6px 2px',
                                                                        fontSize: '0.65rem',
                                                                        background: (selectedElement.style?.objectFit || 'contain') === opt.mode ? '#6366f1' : '#1e293b',
                                                                        color: 'white',
                                                                        border: '1px solid #334155',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <div style={{ marginTop: '8px' }}>
                                                            <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Pozisyon</label>
                                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between' }}>
                                                                {[
                                                                    { pos: 'left center', icon: <AlignLeft size={14} />, label: 'Sol' },
                                                                    { pos: 'center center', icon: <AlignCenter size={14} />, label: 'Orta' },
                                                                    { pos: 'right center', icon: <AlignRight size={14} />, label: 'Sağ' },
                                                                    { pos: 'top center', icon: <ArrowUpToLine size={14} />, label: 'Üst' },
                                                                    { pos: 'bottom center', icon: <ArrowDownToLine size={14} />, label: 'Alt' }
                                                                ].map(p => (
                                                                    <button
                                                                        key={p.pos}
                                                                        title={p.label}
                                                                        onClick={() => {
                                                                            saveHistory();
                                                                            setState(prev => ({
                                                                                ...prev,
                                                                                elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, objectPosition: p.pos } } : el)
                                                                            }));
                                                                        }}
                                                                        style={{
                                                                            padding: '6px',
                                                                            background: (selectedElement.style?.objectPosition || 'center center') === p.pos ? '#6366f1' : '#1e293b',
                                                                            color: 'white',
                                                                            border: '1px solid #334155',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            flex: 1
                                                                        }}
                                                                    >
                                                                        {p.icon}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedElement.type !== 'image' && (
                                                    <>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                                            <div className="form-group">
                                                                <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Yazı Boyutu (px)</label>
                                                                <input
                                                                    type="number"
                                                                    className="input-field"
                                                                    style={{ background: '#020617', border: '1px solid #334155', color: 'white', width: '100%', padding: '6px' }}
                                                                    value={parseInt(selectedElement.style?.fontSize as string) || 12}
                                                                    onMouseDown={() => saveHistory()}
                                                                    onChange={(e) => {
                                                                        const fontSize = `${e.target.value}px`;
                                                                        setState(prev => ({
                                                                            ...prev,
                                                                            elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, fontSize } } : el)
                                                                        }));
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="form-group" style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
                                                                <button
                                                                    onClick={() => {
                                                                        const isBold = selectedElement.style?.fontWeight === 'bold';
                                                                        setState(prev => ({
                                                                            ...prev,
                                                                            elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, fontWeight: isBold ? 'normal' : 'bold' } } : el)
                                                                        }));
                                                                    }}
                                                                    style={{ flex: 1, height: '32px', background: selectedElement.style?.fontWeight === 'bold' ? '#6366f1' : '#020617', border: '1px solid #334155', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                                >B</button>
                                                                <button
                                                                    onClick={() => {
                                                                        const isItalic = selectedElement.style?.fontStyle === 'italic';
                                                                        setState(prev => ({
                                                                            ...prev,
                                                                            elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, fontStyle: isItalic ? 'normal' : 'italic' } } : el)
                                                                        }));
                                                                    }}
                                                                    style={{ flex: 1, height: '32px', background: selectedElement.style?.fontStyle === 'italic' ? '#6366f1' : '#020617', border: '1px solid #334155', color: 'white', borderRadius: '4px', cursor: 'pointer', fontStyle: 'italic' }}
                                                                >I</button>
                                                            </div>

                                                        </div>

                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                                            <div className="form-group">
                                                                <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Yazı Rengi</label>
                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                    <input
                                                                        type="color"
                                                                        style={{ width: '30px', height: '30px', padding: '0', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                                                        value={selectedElement.style?.color as string || '#000000'}
                                                                        onChange={(e) => {
                                                                            const color = e.target.value;
                                                                            setState(prev => ({
                                                                                ...prev,
                                                                                elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, color } } : el)
                                                                            }));
                                                                        }}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        className="input-field"
                                                                        style={{ flex: 1, background: '#020617', border: '1px solid #334155', color: 'white', padding: '4px', fontSize: '0.75rem' }}
                                                                        value={selectedElement.style?.color as string || '#000000'}
                                                                        onChange={(e) => {
                                                                            const color = e.target.value;
                                                                            setState(prev => ({
                                                                                ...prev,
                                                                                elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, color } } : el)
                                                                            }));
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="form-group">
                                                                <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Zemin Rengi</label>
                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                    <input
                                                                        type="color"
                                                                        style={{ width: '30px', height: '30px', padding: '0', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                                                        value={selectedElement.style?.backgroundColor === 'transparent' ? '#ffffff' : selectedElement.style?.backgroundColor as string || '#ffffff'}
                                                                        onChange={(e) => {
                                                                            const backgroundColor = e.target.value;
                                                                            setState(prev => ({
                                                                                ...prev,
                                                                                elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, backgroundColor } } : el)
                                                                            }));
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={() => setState(prev => ({ ...prev, elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, style: { ...el.style, backgroundColor: 'transparent' } } : el) }))}
                                                                        style={{ flex: 1, background: selectedElement.style?.backgroundColor === 'transparent' ? '#6366f1' : '#020617', border: '1px solid #334155', color: 'white', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer' }}
                                                                    >Şeffaf</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {selectedElement.type === 'table' && (
                                                <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>Tablo Yapısı (Satır/Sütun Sayısı)</label>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.1rem', marginBottom: '1rem' }}>
                                                        <div className="form-group">
                                                            <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Satır</label>
                                                            <input
                                                                type="number"
                                                                className="input-field"
                                                                style={{ background: '#020617', border: '1px solid #334155', color: 'white', width: '100%', padding: '4px' }}
                                                                value={selectedElement.rows || 0}
                                                                onChange={(e) => {
                                                                    const rows = parseInt(e.target.value);
                                                                    setState(prev => ({
                                                                        ...prev,
                                                                        elements: prev.elements.map(el => {
                                                                            if (el.id !== state.selectedId) return el;
                                                                            let newData = [...(el.tableData || [])];
                                                                            let newHeights = [...(el.rowHeights || [])];
                                                                            if (rows > newData.length) {
                                                                                for (let i = newData.length; i < rows; i++) {
                                                                                    newData.push(new Array(el.cols || 2).fill({ content: '' }));
                                                                                    newHeights.push(30);
                                                                                }
                                                                            } else {
                                                                                newData = newData.slice(0, rows);
                                                                                newHeights = newHeights.slice(0, rows);
                                                                            }
                                                                            return { ...el, rows, tableData: newData, rowHeights: newHeights };
                                                                        })
                                                                    }));
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Sütun</label>
                                                            <input
                                                                type="number"
                                                                className="input-field"
                                                                style={{ background: '#020617', border: '1px solid #334155', color: 'white', width: '100%', padding: '4px' }}
                                                                value={selectedElement.cols || 0}
                                                                onChange={(e) => {
                                                                    const cols = parseInt(e.target.value);
                                                                    setState(prev => ({
                                                                        ...prev,
                                                                        elements: prev.elements.map(el => {
                                                                            if (el.id !== state.selectedId) return el;
                                                                            let newData = (el.tableData || []).map(row => {
                                                                                let newRow = [...row];
                                                                                if (cols > newRow.length) {
                                                                                    for (let i = newRow.length; i < cols; i++) newRow.push({ content: '' });
                                                                                } else {
                                                                                    newRow = newRow.slice(0, cols);
                                                                                }
                                                                                return newRow;
                                                                            });
                                                                            let newWidths = [...(el.colWidths || [])];
                                                                            if (cols > newWidths.length) {
                                                                                for (let i = newWidths.length; i < cols; i++) newWidths.push(100);
                                                                            } else {
                                                                                newWidths = newWidths.slice(0, cols);
                                                                            }
                                                                            return { ...el, cols, tableData: newData, colWidths: newWidths };
                                                                        })
                                                                    }));
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>Hücre Bazlı Genişlik/Yükseklik</label>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                                        <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #334155', padding: '6px', borderRadius: '4px', background: '#0f172a' }}>
                                                            <label style={{ fontSize: '0.6rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Sütun Genişlik (px)</label>
                                                            {selectedElement.colWidths?.map((w, i) => (
                                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                                    <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Kol {i + 1}:</span>
                                                                    <input
                                                                        type="number"
                                                                        style={{ width: '55px', background: '#020617', border: '1px solid #6366f144', color: 'white', fontSize: '0.7rem', padding: '2px' }}
                                                                        value={w}
                                                                        onChange={(e) => {
                                                                            const val = parseInt(e.target.value) || 0;
                                                                            setState(prev => ({
                                                                                ...prev,
                                                                                elements: prev.elements.map(el => {
                                                                                    if (el.id !== state.selectedId || !el.colWidths) return el;
                                                                                    const newWidths = [...el.colWidths];
                                                                                    newWidths[i] = val;
                                                                                    return { ...el, colWidths: newWidths };
                                                                                })
                                                                            }));
                                                                        }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #334155', padding: '6px', borderRadius: '4px', background: '#0f172a' }}>
                                                            <label style={{ fontSize: '0.6rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Satır Yükseklik (px)</label>
                                                            {selectedElement.rowHeights?.map((h, i) => (
                                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                                    <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Sat {i + 1}:</span>
                                                                    <input
                                                                        type="number"
                                                                        style={{ width: '55px', background: '#020617', border: '1px solid #6366f144', color: 'white', fontSize: '0.7rem', padding: '2px' }}
                                                                        value={h}
                                                                        onChange={(e) => {
                                                                            const val = parseInt(e.target.value) || 0;
                                                                            setState(prev => ({
                                                                                ...prev,
                                                                                elements: prev.elements.map(el => {
                                                                                    if (el.id !== state.selectedId || !el.rowHeights) return el;
                                                                                    const newHeights = [...el.rowHeights];
                                                                                    newHeights[i] = val;
                                                                                    return { ...el, rowHeights: newHeights };
                                                                                })
                                                                            }));
                                                                        }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div style={{ border: '1px solid #334155', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                                                        <div style={{ background: '#0f172a', padding: '4px', fontSize: '0.7rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: '#94a3b8' }}>Hücre Verileri</span>
                                                            {selectedCell && <span style={{ color: '#6366f1' }}>Seçili: S{selectedCell.row + 1} K{selectedCell.col + 1}</span>}
                                                        </div>
                                                        <div style={{ maxHeight: '180px', overflow: 'auto', background: '#020617' }}>
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                                                                <tbody>
                                                                    {selectedElement.tableData?.map((row, ri) => (
                                                                        <tr key={ri}>
                                                                            {row.map((cell, ci) => {
                                                                                const isActive = selectedCell?.row === ri && selectedCell?.col === ci;
                                                                                return (
                                                                                    <td
                                                                                        key={ci}
                                                                                        style={{
                                                                                            padding: '1px',
                                                                                            border: isActive ? '1px solid #6366f1' : '1px solid #1e293b',
                                                                                            background: isActive ? '#6366f122' : 'transparent'
                                                                                        }}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setSelectedCell({ row: ri, col: ci });
                                                                                            setState(prev => ({ ...prev, selectedId: selectedElement.id }));
                                                                                        }}
                                                                                    >
                                                                                        <input
                                                                                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '2px', outline: 'none' }}
                                                                                            value={cell.content}
                                                                                            title={cell.binding ? `Bağlı: ${cell.binding}` : 'Veri girin veya sistemden alan seçin'}
                                                                                            onChange={(e) => {
                                                                                                const val = e.target.value;
                                                                                                setState(prev => ({
                                                                                                    ...prev,
                                                                                                    elements: prev.elements.map(el => {
                                                                                                        if (el.id !== state.selectedId || !el.tableData) return el;
                                                                                                        const newData = [...el.tableData];
                                                                                                        newData[ri] = [...newData[ri]];
                                                                                                        newData[ri][ci] = { ...newData[ri][ci], content: val };
                                                                                                        return { ...el, tableData: newData };
                                                                                                    })
                                                                                                }));
                                                                                            }}
                                                                                        />
                                                                                    </td>
                                                                                );
                                                                            })}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => setState(prev => ({ ...prev, elements: prev.elements.filter(e => e.id !== state.selectedId), selectedId: null }))}
                                                style={{ marginTop: '1rem', padding: '0.5rem', background: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                            >
                                                Nesneyi Sil
                                            </button>
                                        </div>
                                    ) : state.selectedXsltElement ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            {/* Hierarchy Navigation */}
                                            {state.selectedXsltElement.hierarchy && state.selectedXsltElement.hierarchy.length > 0 && (
                                                <div className="property-section" style={{ borderColor: '#64748b', marginBottom: '4px' }}>
                                                    <div className="property-section-header" style={{ padding: '0.4rem 0.8rem', fontSize: '0.6rem', color: '#94a3b8' }}>
                                                        KATMAN HİYERARŞİSİ
                                                    </div>
                                                    <div className="property-section-body" style={{ padding: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                        {state.selectedXsltElement.hierarchy.slice().reverse().map((h, i) => (
                                                            <div key={h.id} style={{ display: 'flex', alignItems: 'center' }}>
                                                                {i > 0 && <span style={{ marginRight: '4px', color: '#475569' }}>/</span>}
                                                                <button
                                                                    onClick={() => {
                                                                        if (iframeRef.current?.contentWindow) {
                                                                            iframeRef.current.contentWindow.postMessage({ type: 'SELECT_ELEMENT', elementId: h.id }, '*');
                                                                        }
                                                                    }}
                                                                    title={`ID: ${h.id}`}
                                                                    style={{
                                                                        background: h.id === state.selectedXsltElement?.elementId ? '#3b82f6' : 'transparent',
                                                                        color: h.id === state.selectedXsltElement?.elementId ? 'white' : '#94a3b8',
                                                                        border: '1px solid #334155',
                                                                        borderRadius: '3px',
                                                                        padding: '2px 6px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.65rem'
                                                                    }}
                                                                >
                                                                    {h.tag.toUpperCase()}
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {/* Header Section */}
                                            <div className="property-section" style={{ borderColor: isTableElement(state.selectedXsltElement.elementType) ? '#6366f1' : '#10b981', background: isTableElement(state.selectedXsltElement.elementType) ? '#6366f111' : '#10b98111' }}>
                                                <div className="property-section-header" style={{ background: isTableElement(state.selectedXsltElement.elementType) ? '#6366f122' : '#10b98122', color: isTableElement(state.selectedXsltElement.elementType) ? '#818cf8' : '#34d399' }}>
                                                    <ShieldCheck size={12} /> Seçili Sabit Bileşen
                                                </div>
                                                <div className="property-section-body">
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                                                        {state.selectedXsltElement.shapeType ? (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                {state.selectedXsltElement.shapeType === 'rect' ? <Square size={14} /> : state.selectedXsltElement.shapeType === 'circle' ? <Circle size={14} /> : <Minus size={14} />}
                                                                {state.selectedXsltElement.shapeType === 'rect' ? 'Dikdörtgen' : state.selectedXsltElement.shapeType === 'circle' ? 'Daire / Elips' : 'Çizgi'} Şekli
                                                            </span>
                                                        ) : (
                                                            state.selectedXsltElement.elementType === 'table' ? 'Tablo Yapısı' :
                                                                state.selectedXsltElement.isDynamic ? `Veri Alanı: ${state.selectedXsltElement.path?.split('/').pop()}` :
                                                                    'Statik Metin / Alan'
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', wordBreak: 'break-all', opacity: 0.7, flex: 1 }}>
                                                            {state.selectedXsltElement.path || 'XSLT Elementi'}
                                                        </div>
                                                        <button
                                                            onClick={() => copyToClipboard(state.selectedXsltElement?.path || '', "Yol kopyalandı")}
                                                            title="Yolu Kopyala"
                                                            style={{ padding: '4px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '4px', cursor: 'pointer' }}
                                                        >
                                                            <Copy size={12} />
                                                        </button>
                                                    </div>

                                                    {state.selectedXsltElement.elementType === 'table' && state.selectedXsltElement.tableData && (
                                                        <button
                                                            onClick={() => {
                                                                const current = state.selectedXsltElement!;
                                                                const updatedXslt = { ...current, styleOverrides: { ...current.styleOverrides, opacity: 0, pointerEvents: 'none' as any } };
                                                                if (iframeRef.current?.contentWindow) {
                                                                    iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: current.elementId, style: updatedXslt.styleOverrides }, '*');
                                                                }
                                                                const newElement: DesignElement = {
                                                                    id: Math.random().toString(36).substring(2, 11),
                                                                    type: 'table',
                                                                    x: current.x || 50,
                                                                    y: current.y || 50,
                                                                    content: '',
                                                                    style: {
                                                                        fontSize: '12px',
                                                                        color: '#000000',
                                                                        width: current.width ? `${current.width}px` : '100%',
                                                                        position: 'absolute' as any
                                                                    },
                                                                    rows: current.rowCount || 2,
                                                                    cols: current.colCount || 2,
                                                                    colWidths: current.colCount
                                                                        ? Array(current.colCount).fill((current.width ? current.width / current.colCount : 150))
                                                                        : [150, 150],
                                                                    rowHeights: current.rowCount
                                                                        ? Array(current.rowCount).fill((current.height ? current.height / current.rowCount : 30))
                                                                        : [30, 30],
                                                                    tableData: current.tableData || Array(current.rowCount || 2).fill(Array(current.colCount || 2).fill({ content: '' }))
                                                                };
                                                                setState(prev => ({ ...prev, xsltOverrides: [...prev.xsltOverrides.filter(o => o.elementId !== updatedXslt.elementId), updatedXslt], elements: [...prev.elements, newElement], selectedXsltElement: null, selectedId: newElement.id }));
                                                                setNotification({ message: 'Tablo düzenlenebilir nesneye dönüştürüldü!', type: 'success' });
                                                            }}
                                                            className="btn-primary"
                                                            style={{ width: '100%', marginTop: '10px', fontSize: '0.7rem', padding: '6px' }}
                                                        >
                                                            <Sparkles size={14} /> Düzenlenebilir Yapıya Çevir
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                                                {state.selectedXsltElement.elementType !== 'image' &&
                                                    state.selectedXsltElement.elementType !== 'table' &&
                                                    state.selectedXsltElement.elementType !== 'tr' &&
                                                    !state.selectedXsltElement.isDynamic && (
                                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                                <Type size={14} color="#10b981" />
                                                                <label style={{ fontSize: '0.75rem', color: 'white', fontWeight: 'bold' }}>İçerik Düzenle</label>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                                                                <textarea
                                                                    className="input-field"
                                                                    style={{ background: '#020617', border: '1px solid #10b98144', color: 'white', flex: 1, padding: '6px', minHeight: '60px', borderRadius: '4px', fontSize: '0.75rem' }}
                                                                    value={state.selectedXsltElement.content || ''}
                                                                    onKeyDown={(e) => e.stopPropagation()}
                                                                    onFocus={() => saveHistory()}
                                                                    onChange={(e) => {
                                                                        const newContent = e.target.value;
                                                                        setState(prev => {
                                                                            const updated = { ...prev.selectedXsltElement!, content: newContent };
                                                                            const overrideIndex = prev.xsltOverrides.findIndex(o => o.elementId === updated.elementId);
                                                                            const newOverrides = [...prev.xsltOverrides];
                                                                            if (overrideIndex >= 0) newOverrides[overrideIndex] = updated;
                                                                            else newOverrides.push(updated);

                                                                            if (iframeRef.current?.contentWindow) {
                                                                                iframeRef.current.contentWindow.postMessage({
                                                                                    type: 'UPDATE_ELEMENT_CONTENT',
                                                                                    elementId: updated.elementId,
                                                                                    content: newContent
                                                                                }, '*');
                                                                            }

                                                                            return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                        });
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={() => copyToClipboard(state.selectedXsltElement?.content || '', "Metin kopyalandı")}
                                                                    title="Kopyala"
                                                                    style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '4px', cursor: 'pointer' }}
                                                                >
                                                                    <Copy size={14} />
                                                                </button>
                                                            </div>
                                                            <p style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '4px' }}>
                                                                Sabit metinleri buradan değiştirebilirsiniz.
                                                            </p>
                                                        </div>
                                                    )}
                                            </div>

                                            {/* ALIGNMENT TOOLBAR (NEW) */}
                                            <div className="property-section" style={{ background: 'rgba(30, 41, 59, 0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                                                <div className="property-section-header" style={{ padding: '0.6rem 1rem', background: 'rgba(30, 41, 59, 0.4)', fontSize: '0.65rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    <Layout size={14} /> HİZALAMA
                                                </div>
                                                <div className="property-section-body" style={{ padding: '0.8rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                                    <button title="Sola Hizala" onClick={() => alignElement('left')} style={{ padding: '8px', background: '#334155', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><AlignLeft size={16} /></button>
                                                    <button title="Ortala (Yatay)" onClick={() => alignElement('center-x')} style={{ padding: '8px', background: '#334155', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><AlignCenter size={16} /></button>
                                                    <button title="Sağa Hizala" onClick={() => alignElement('right')} style={{ padding: '8px', background: '#334155', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><AlignRight size={16} /></button>
                                                    {/* Row 2 */}
                                                    <button title="Üste Hizala" onClick={() => alignElement('top')} style={{ padding: '8px', background: '#334155', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', transform: 'rotate(90deg)' }}><AlignLeft size={16} /></button>
                                                    <button title="Ortala (Dikey)" onClick={() => alignElement('center-y')} style={{ padding: '8px', background: '#334155', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', transform: 'rotate(90deg)' }}><AlignCenter size={16} /></button>
                                                    <button title="Alta Hizala" onClick={() => alignElement('bottom')} style={{ padding: '8px', background: '#334155', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', transform: 'rotate(90deg)' }}><AlignRight size={16} /></button>
                                                </div>
                                            </div>

                                            {/* XSLT Dimensions Section */}
                                            <div className="property-section" style={{ background: 'rgba(30, 41, 59, 0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                                                <div className="property-section-header" style={{ padding: '0.6rem 1rem', background: 'rgba(30, 41, 59, 0.4)', fontSize: '0.65rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    <Move size={14} /> KONUM VE BOYUT
                                                </div>
                                                <div className="property-section-body" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                    <div className="form-group">
                                                        <label style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>SOL (X)</label>
                                                        <input type="number" className="input-field" style={{ width: '100%', height: '32px', borderRadius: '8px' }} value={Math.round(parseInt(state.selectedXsltElement.styleOverrides.left as string) || 0)}
                                                            onMouseDown={() => saveHistory()}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                setState(prev => {
                                                                    const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, left: `${val}px`, position: 'absolute' as any } };
                                                                    const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                    if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                    if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                    return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                });
                                                            }} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>ÜST (Y)</label>
                                                        <input type="number" className="input-field" style={{ width: '100%', height: '32px', borderRadius: '8px' }} value={Math.round(parseInt(state.selectedXsltElement.styleOverrides.top as string) || 0)}
                                                            onMouseDown={() => saveHistory()}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                setState(prev => {
                                                                    const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, top: `${val}px`, position: 'absolute' as any } };
                                                                    const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                    if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                    if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                    return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                });
                                                            }} />
                                                    </div>
                                                </div>
                                            </div>


                                            <label style={{ fontSize: '0.75rem', color: 'white', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>Stil Özellikleri</label>

                                            {state.selectedXsltElement.elementType === 'image' && (
                                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                                    <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Resim İşlemleri</label>
                                                    <button
                                                        onClick={() => {
                                                            // Trigger file input for replacement
                                                            // We reuse the main file input but need a way to know we are replacing an XSLT element
                                                            // For simplicity, we can just click it and handle the logic in handleFileChange if we flag it, 
                                                            // OR we can create a specific handler here.
                                                            // Let's use a temporary flag or a separate ref.
                                                            // Actually, we can just use the existing fileInputRef and handle logic in 'onChange' if we know the context.
                                                            // BUT handleFileChange is bound to `selectedId`.
                                                            // Let's create a specialized hidden input for this or handle it manually.

                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'image/*';
                                                            input.onchange = (e) => {
                                                                const file = (e.target as HTMLInputElement).files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onload = (evt) => {
                                                                        const base64 = evt.target?.result as string;

                                                                        // 1. Hide the original XSLT element
                                                                        setState(prev => {
                                                                            const updated = {
                                                                                ...prev.selectedXsltElement!,
                                                                                styleOverrides: {
                                                                                    ...prev.selectedXsltElement!.styleOverrides,
                                                                                    opacity: 0, // Hide it
                                                                                    pointerEvents: 'none' as const
                                                                                }
                                                                            };
                                                                            const overrideIndex = prev.xsltOverrides.findIndex(o => o.elementId === updated.elementId);
                                                                            const newOverrides = [...prev.xsltOverrides];
                                                                            if (overrideIndex >= 0) newOverrides[overrideIndex] = updated;
                                                                            else newOverrides.push(updated);

                                                                            // Update live preview to hide it
                                                                            if (iframeRef.current?.contentWindow) {
                                                                                iframeRef.current.contentWindow.postMessage({
                                                                                    type: 'UPDATE_ELEMENT_STYLE',
                                                                                    elementId: updated.elementId,
                                                                                    style: updated.styleOverrides
                                                                                }, '*');
                                                                            }

                                                                            // 2. Add new image element on top
                                                                            const newEl: DesignElement = {
                                                                                id: Math.random().toString(36).substring(2, 11),
                                                                                type: 'image',
                                                                                x: updated.x || 0,
                                                                                y: updated.y || 0,
                                                                                content: base64,
                                                                                style: {
                                                                                    width: updated.width ? `${updated.width}px` : '100px',
                                                                                    height: updated.height ? `${updated.height}px` : '100px',
                                                                                    position: 'absolute' as any
                                                                                }
                                                                            };

                                                                            return {
                                                                                ...prev,
                                                                                xsltOverrides: newOverrides,
                                                                                elements: [...prev.elements, newEl],
                                                                                selectedXsltElement: null, // Deselect XSLT
                                                                                selectedId: newEl.id // Select new element
                                                                            };
                                                                        });
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            };
                                                            input.click();
                                                        }}
                                                        style={{ width: '100%', padding: '8px', background: '#eab308', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                                    >
                                                        <Upload size={14} style={{ marginRight: '4px' }} /> Resmi Değiştir (Yeni Yükle)
                                                    </button>
                                                    <p style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '4px' }}>
                                                        Mevcut resmi gizler ve yerine yüklediğiniz resmi ekler.
                                                    </p>
                                                </div>
                                            )}



                                            {(state.selectedXsltElement.elementType === 'image' || state.selectedXsltElement.elementType === 'img') && (
                                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                                    <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Sığdırma Modu</label>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {[
                                                            { mode: 'contain', label: 'Sığdır', desc: 'Resmi orantılı şekilde kutuya sığdırır' },
                                                            { mode: 'cover', label: 'Doldur', desc: 'Kutuyu tamamen doldurur (Zoom/Kırpma)' },
                                                            { mode: 'fill', label: 'Uzat', desc: 'Resmi kutuya yayar (Deforme)' }
                                                        ].map(opt => (
                                                            <button
                                                                key={opt.mode}
                                                                title={opt.desc}
                                                                onClick={() => {
                                                                    saveHistory();
                                                                    setState(prev => {
                                                                        const updated = {
                                                                            ...prev.selectedXsltElement!,
                                                                            styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, objectFit: opt.mode as any }
                                                                        };
                                                                        const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                        if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);

                                                                        if (iframeRef.current?.contentWindow) {
                                                                            iframeRef.current.contentWindow.postMessage({
                                                                                type: 'UPDATE_ELEMENT_STYLE',
                                                                                elementId: updated.elementId,
                                                                                style: updated.styleOverrides
                                                                            }, '*');
                                                                        }
                                                                        return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                    });
                                                                }}
                                                                style={{
                                                                    flex: 1,
                                                                    padding: '6px 2px',
                                                                    fontSize: '0.65rem',
                                                                    background: (state.selectedXsltElement?.styleOverrides.objectFit || 'contain') === opt.mode ? '#6366f1' : '#1e293b',
                                                                    color: 'white',
                                                                    border: '1px solid #334155',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div style={{ marginTop: '8px' }}>
                                                        <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Pozisyon</label>
                                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between' }}>
                                                            {[
                                                                { pos: 'left center', icon: <AlignLeft size={14} />, label: 'Sol' },
                                                                { pos: 'center center', icon: <AlignCenter size={14} />, label: 'Orta' },
                                                                { pos: 'right center', icon: <AlignRight size={14} />, label: 'Sağ' },
                                                                { pos: 'top center', icon: <ArrowUpToLine size={14} />, label: 'Üst' },
                                                                { pos: 'bottom center', icon: <ArrowDownToLine size={14} />, label: 'Alt' }
                                                            ].map(p => (
                                                                <button
                                                                    key={p.pos}
                                                                    title={p.label}
                                                                    onClick={() => {
                                                                        saveHistory();
                                                                        setState(prev => {
                                                                            const updated = {
                                                                                ...prev.selectedXsltElement!,
                                                                                styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, objectPosition: p.pos }
                                                                            };
                                                                            const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                            if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);

                                                                            if (iframeRef.current?.contentWindow) {
                                                                                iframeRef.current.contentWindow.postMessage({
                                                                                    type: 'UPDATE_ELEMENT_STYLE',
                                                                                    elementId: updated.elementId,
                                                                                    style: updated.styleOverrides
                                                                                }, '*');
                                                                            }
                                                                            return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                        });
                                                                    }}
                                                                    style={{
                                                                        padding: '6px',
                                                                        background: (state.selectedXsltElement?.styleOverrides.objectPosition || 'center center') === p.pos ? '#6366f1' : '#1e293b',
                                                                        color: 'white',
                                                                        border: '1px solid #334155',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flex: 1
                                                                    }}
                                                                >
                                                                    {p.icon}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}



                                            {(state.selectedXsltElement.elementType === 'image' || state.selectedXsltElement.elementType === 'img') && (
                                                <div className="property-section" style={{ background: 'rgba(30, 41, 59, 0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                                                    <div className="property-section-header" style={{ padding: '0.6rem 1rem', background: 'rgba(30, 41, 59, 0.4)', fontSize: '0.65rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                        <Sparkles size={14} /> GÖRSEL EFEKTLERİ
                                                    </div>
                                                    <div className="property-section-body" style={{ padding: '1rem' }}>
                                                        {/* Opacity Control */}
                                                        <div style={{ marginBottom: '12px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                                <label style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>Şeffaflık</label>
                                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace' }}>%{Math.round((parseFloat(state.selectedXsltElement.styleOverrides.opacity as string || '1')) * 100)}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', opacity: 0.2 }}></div>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="1"
                                                                    step="0.01"
                                                                    style={{ flex: 1, height: '4px', accentColor: '#6366f1', cursor: 'pointer' }}
                                                                    value={state.selectedXsltElement.styleOverrides.opacity !== undefined ? state.selectedXsltElement.styleOverrides.opacity : '1'}
                                                                    onMouseDown={() => saveHistory()}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setState(prev => {
                                                                            const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, opacity: val } };
                                                                            const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                            if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                            if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                            return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                        });
                                                                    }}
                                                                />
                                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'white' }}></div>
                                                            </div>
                                                        </div>

                                                        {/* Border Radius Control */}
                                                        <div style={{ marginBottom: '12px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                                <label style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>Köşe Yuvarlama</label>
                                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace' }}>{parseInt(state.selectedXsltElement.styleOverrides.borderRadius as string || '0')}px</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                style={{ width: '100%', height: '4px', accentColor: '#6366f1', cursor: 'pointer' }}
                                                                value={parseInt(state.selectedXsltElement.styleOverrides.borderRadius as string || '0')}
                                                                onMouseDown={() => saveHistory()}
                                                                onChange={(e) => {
                                                                    const val = `${e.target.value}px`;
                                                                    setState(prev => {
                                                                        const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, borderRadius: val } };
                                                                        const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                        if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                        if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                        return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                    });
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Shadow Control (Checkbox) */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                                                            onClick={() => {
                                                                const currentShadow = state.selectedXsltElement?.styleOverrides.boxShadow && state.selectedXsltElement.styleOverrides.boxShadow !== 'none';
                                                                const val = !currentShadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)' : 'none';
                                                                setState(prev => {
                                                                    const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, boxShadow: val } };
                                                                    const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                    if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                    if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                    return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                });
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '16px', height: '16px', borderRadius: '4px',
                                                                border: '1px solid #475569',
                                                                background: state.selectedXsltElement?.styleOverrides.boxShadow && state.selectedXsltElement.styleOverrides.boxShadow !== 'none' ? '#6366f1' : 'transparent',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                                            }}>
                                                                {state.selectedXsltElement?.styleOverrides.boxShadow && state.selectedXsltElement.styleOverrides.boxShadow !== 'none' && <Check size={10} color="white" />}
                                                            </div>
                                                            <label style={{ fontSize: '0.7rem', color: '#cbd5e1', cursor: 'pointer', userSelect: 'none' }}>Gölge Ekle</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {state.selectedXsltElement.elementType !== 'image' && state.selectedXsltElement.elementType !== 'img' && (
                                                <>
                                                    <div className="property-section" style={{ background: 'rgba(30, 41, 59, 0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                                                        <div className="property-section-header" style={{ padding: '0.6rem 1rem', background: 'rgba(30, 41, 59, 0.4)', fontSize: '0.65rem', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                            <Type size={14} /> METİN STİLİ
                                                        </div>
                                                        <div className="property-section-body" style={{ padding: '1rem' }}>
                                                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                                                <label style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', marginBottom: '6px', display: 'block', letterSpacing: '0.5px' }}>Yazı Tipi</label>
                                                                <select
                                                                    className="input-field"
                                                                    style={{ width: '100%', height: '38px', borderRadius: '10px', fontSize: '0.8rem' }}
                                                                    value={state.selectedXsltElement.styleOverrides.fontFamily || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setState(prev => {
                                                                            const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, fontFamily: val } };
                                                                            const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                            if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                            if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                            return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                        });
                                                                    }}
                                                                >
                                                                    <option value="">Varsayılan</option>
                                                                    <option value="Arial, sans-serif">Arial</option>
                                                                    <option value="'Times New Roman', serif">Times New Roman</option>
                                                                    <option value="'Courier New', monospace">Courier New</option>
                                                                    <option value="Georgia, serif">Georgia</option>
                                                                </select>
                                                            </div>

                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                                <div className="form-group">
                                                                    <label style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', marginBottom: '6px', display: 'block', letterSpacing: '0.5px' }}>Boyut</label>
                                                                    <input type="text" className="input-field"
                                                                        style={{ width: '100%', height: '36px', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center' }}
                                                                        value={state.selectedXsltElement.styleOverrides.fontSize || '12px'}
                                                                        onMouseDown={() => saveHistory()}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            setState(prev => {
                                                                                const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, fontSize: val } };
                                                                                const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                                if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                                if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                                return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                            });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', marginBottom: '6px', display: 'block', letterSpacing: '0.5px' }}>Format</label>
                                                                    <div className="toolbar-group" style={{ height: '36px', borderRadius: '8px', padding: '2px' }}>
                                                                        <button onClick={() => {
                                                                            const isBold = state.selectedXsltElement?.styleOverrides.fontWeight === 'bold';
                                                                            saveHistory();
                                                                            setState(prev => {
                                                                                const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, fontWeight: isBold ? 'normal' : 'bold' } };
                                                                                const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                                if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                                if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                                return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                            });
                                                                        }} className={`toolbar-btn ${state.selectedXsltElement.styleOverrides.fontWeight === 'bold' ? 'active' : ''}`} style={{ borderRadius: '6px' }}><Bold size={14} /></button>
                                                                        <button onClick={() => {
                                                                            const isItalic = state.selectedXsltElement?.styleOverrides.fontStyle === 'italic';
                                                                            saveHistory();
                                                                            setState(prev => {
                                                                                const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, fontStyle: isItalic ? 'normal' : 'italic' } };
                                                                                const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                                if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                                if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                                return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                            });
                                                                        }} className={`toolbar-btn ${state.selectedXsltElement.styleOverrides.fontStyle === 'italic' ? 'active' : ''}`} style={{ borderRadius: '6px' }}><Italic size={14} /></button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="property-section" style={{ background: 'rgba(30, 41, 59, 0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                                                        <div className="property-section-header" style={{ padding: '0.6rem 1rem', background: 'rgba(30, 41, 59, 0.4)', fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                            <Sparkles size={14} /> RENK VE GÖRÜNÜM
                                                        </div>
                                                        <div className="property-section-body" style={{ padding: '1rem' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1rem' }}>
                                                                <div className="form-group">
                                                                    <label style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>Metin Rengi</label>
                                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                        <input type="color" style={{ width: '42px', height: '36px', padding: '2px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', cursor: 'pointer' }} value={state.selectedXsltElement.styleOverrides.color as string || '#000000'}
                                                                            onMouseDown={() => saveHistory()}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                setState(prev => {
                                                                                    const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, color: val } };
                                                                                    const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                                    if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                                    if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                                    return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                                });
                                                                            }} />
                                                                        <input type="text" className="input-field" style={{ flex: 1, height: '36px', fontSize: '0.75rem', textAlign: 'center', fontFamily: 'monospace' }} value={state.selectedXsltElement.styleOverrides.color as string || '#000000'}
                                                                            onMouseDown={() => saveHistory()}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                setState(prev => {
                                                                                    const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, color: val } };
                                                                                    const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                                    if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                                    if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                                    return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                                });
                                                                            }} />
                                                                    </div>
                                                                </div>
                                                                <div className="form-group">
                                                                    <label style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>Zemin Rengi</label>
                                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                        <input type="color" style={{ width: '42px', height: '36px', padding: '2px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', cursor: 'pointer' }} value={state.selectedXsltElement.styleOverrides.backgroundColor === 'transparent' ? '#ffffff' : state.selectedXsltElement.styleOverrides.backgroundColor as string || '#ffffff'}
                                                                            onMouseDown={() => saveHistory()}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                setState(prev => {
                                                                                    const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, backgroundColor: val } };
                                                                                    const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                                    if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                                    if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                                    return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                                });
                                                                            }} />
                                                                        <button onClick={() => {
                                                                            saveHistory();
                                                                            setState(prev => {
                                                                                const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, backgroundColor: 'transparent' } };
                                                                                const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                                if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                                if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                                return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                            });
                                                                        }} style={{ height: '36px', flex: 1, background: state.selectedXsltElement.styleOverrides.backgroundColor === 'transparent' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.5)', border: '1px solid', borderColor: state.selectedXsltElement.styleOverrides.backgroundColor === 'transparent' ? '#6366f1' : 'rgba(255,255,255,0.1)', color: state.selectedXsltElement.styleOverrides.backgroundColor === 'transparent' ? '#a5b4fc' : 'white', fontSize: '0.7rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>Şeffaf</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {state.selectedXsltElement.elementType === 'table' && (
                                                        <div className="property-section" style={{ background: 'rgba(30, 41, 59, 0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                                                            <div className="property-section-header" style={{ padding: '0.6rem 1rem', background: 'rgba(30, 41, 59, 0.4)', fontSize: '0.65rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                                <Box size={14} /> KENARLIKLAR
                                                            </div>
                                                            <div className="property-section-body" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                                <button onClick={() => {
                                                                    setState(prev => {
                                                                        const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, border: '1px solid black' } };
                                                                        const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                        if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                        if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                        return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                    });
                                                                }} style={{ height: '36px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', fontSize: '0.7rem', cursor: 'pointer' }}>Ekle</button>
                                                                <button onClick={() => {
                                                                    setState(prev => {
                                                                        const updated = { ...prev.selectedXsltElement!, styleOverrides: { ...prev.selectedXsltElement!.styleOverrides, border: 'none' } };
                                                                        const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                                        if (!prev.xsltOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                                        if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: updated.styleOverrides }, '*');
                                                                        return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                                    });
                                                                }} style={{ height: '36px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#f87171', borderRadius: '8px', fontSize: '0.7rem', cursor: 'pointer' }}>Kaldır</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '1rem' }}>
                                                <button
                                                    onClick={() => {
                                                        if (!state.selectedXsltElement) return;
                                                        saveHistory();
                                                        const updated = { ...state.selectedXsltElement, styleOverrides: { ...state.selectedXsltElement.styleOverrides, display: 'none' } };
                                                        setState(prev => {
                                                            const newOverrides = prev.xsltOverrides.map(o => o.elementId === updated.elementId ? updated : o);
                                                            if (!newOverrides.find(o => o.elementId === updated.elementId)) newOverrides.push(updated);
                                                            if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT_STYLE', elementId: updated.elementId, style: { display: 'none' } }, '*');
                                                            return { ...prev, selectedXsltElement: updated, xsltOverrides: newOverrides };
                                                        });
                                                        setNotification({ message: 'Nesne gizlendi.', type: 'success' });
                                                    }}
                                                    style={{ flex: 1, padding: '8px', background: '#ce2c2c22', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}
                                                >
                                                    Gizle
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        saveHistory();
                                                        setState(prev => ({ ...prev, selectedXsltElement: null, xsltOverrides: prev.xsltOverrides.filter(o => o.elementId !== prev.selectedXsltElement?.elementId) }));
                                                    }}
                                                    style={{ flex: 1, padding: '8px', background: '#334155', color: '#94a3b8', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}
                                                >
                                                    Sıfırla
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>
                                            <Settings size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                            <p style={{ fontSize: '0.875rem' }}>Lütfen düzenlemek için bir nesne veya XSLT elementi seçin.</p>
                                            <p style={{ fontSize: '0.7rem', marginTop: '8px', color: '#475569' }}>Taslak üzerindeki logo, tablo veya alanlara tıklayarak stillerini değiştirebilirsiniz.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </aside >

                <main
                    style={{ flex: 1, background: '#020617', display: 'flex', overflow: 'hidden', position: 'relative' }}
                >
                    {/* LEFT VERTICAL TOOLBAR FOR ALIGNMENT */}
                    <div style={{
                        position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: '#1e293b', padding: '8px', borderRadius: '12px',
                        display: 'flex', flexDirection: 'column', gap: '8px',
                        border: '1px solid #334155', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        zIndex: 1000
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: '0.6rem', color: '#64748b', textAlign: 'center', fontWeight: 'bold', writingMode: 'vertical-rl', transform: 'rotate(180deg)', marginBottom: '4px' }}>HİZALAMA</div>
                        <button title="Sola Hizala" onClick={() => alignElement('left')} style={{ padding: '8px', background: '#334155', border: '1px solid #475569', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1', transition: 'all 0.2s' }}><AlignLeft size={16} /></button>
                        <button title="Ortala (Yatay)" onClick={() => alignElement('center-x')} style={{ padding: '8px', background: '#334155', border: '1px solid #475569', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1', transition: 'all 0.2s' }}><AlignCenter size={16} /></button>
                        <button title="Sağa Hizala" onClick={() => alignElement('right')} style={{ padding: '8px', background: '#334155', border: '1px solid #475569', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1', transition: 'all 0.2s' }}><AlignRight size={16} /></button>
                        <div style={{ height: '1px', background: '#475569', margin: '2px 0' }}></div>
                        <button title="Üste Hizala" onClick={() => alignElement('top')} style={{ padding: '8px', background: '#334155', border: '1px solid #475569', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1', transition: 'all 0.2s' }}><ArrowUpToLine size={16} /></button>
                        <button title="Ortala (Dikey)" onClick={() => alignElement('center-y')} style={{ padding: '8px', background: '#334155', border: '1px solid #475569', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1', transition: 'all 0.2s' }}><ScanLine size={16} /></button>
                        <button title="Alta Hizala" onClick={() => alignElement('bottom')} style={{ padding: '8px', background: '#334155', border: '1px solid #475569', borderRadius: '4px', cursor: 'pointer', color: '#cbd5e1', transition: 'all 0.2s' }}><ArrowDownToLine size={16} /></button>
                    </div>

                    <div
                        style={{ flex: 1, overflow: 'auto', padding: '1rem', borderRight: '1px solid #334155', position: 'relative' }}
                        onClick={() => { setState(prev => ({ ...prev, selectedId: null, selectedIds: [] })); setSelectedCell(null); }}
                    >


                        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragMove={handleDragMove}>
                            <div
                                style={{
                                    width: '210mm', minHeight: '297mm', background: 'white', margin: '0 auto', position: 'relative',
                                    boxShadow: '0 0 20px rgba(0,0,0,0.5)', overflow: 'hidden',
                                    transform: `scale(${designZoom})`, transformOrigin: 'top center',
                                    backgroundImage: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
                                    backgroundSize: '20px 20px',
                                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                                    cursor: placingMode ? 'pointer' : (state.selectedId ? 'move' : 'default')
                                }}
                                onClick={(e) => {
                                    // If placingMode is NOT active, we handle click-to-move here. 
                                    // If placingMode IS active, the overlay (below) will handle it to ensure we capture clicks over iframe.
                                    // IMPORTANT: Skip if we just finished dragging to prevent jump
                                    if (!placingMode && state.selectedId && !isDragging && !wasDraggingRef.current) {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const clickX = (e.clientX - rect.left) / designZoom;
                                        const clickY = (e.clientY - rect.top) / designZoom;
                                        const snapX = Math.round(clickX / SNAP_SIZE) * SNAP_SIZE;
                                        const snapY = Math.round(clickY / SNAP_SIZE) * SNAP_SIZE;

                                        setState(prev => ({
                                            ...prev,
                                            elements: prev.elements.map(el => {
                                                if (el.id === state.selectedId) {
                                                    const width = parseInt(el.style?.width as string) || 100;
                                                    const height = parseInt(el.style?.height as string) || 30;
                                                    return { ...el, x: snapX - (width / 2), y: snapY - (height / 2) };
                                                }
                                                return el;
                                            })
                                        }));
                                    }
                                }}
                            >
                                {/* Overlay for Placing Mode to ensure clicks are captured over Iframe */}
                                {placingMode && (
                                    <div
                                        style={{
                                            position: 'absolute', inset: 0, zIndex: 100, cursor: 'crosshair', // Crosshair for precision
                                            background: 'rgba(99, 102, 241, 0.1)' // Slight tint to indicate active mode
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const clickX = (e.clientX - rect.left) / designZoom;
                                            const clickY = (e.clientY - rect.top) / designZoom;
                                            const snapX = Math.round(clickX / SNAP_SIZE) * SNAP_SIZE;
                                            const snapY = Math.round(clickY / SNAP_SIZE) * SNAP_SIZE;

                                            if (placingMode.clonedElement) {
                                                const placedEl = { ...placingMode.clonedElement, x: snapX, y: snapY };
                                                setState(prev => ({ ...prev, elements: [...prev.elements, placedEl], selectedId: placedEl.id }));
                                                setNotification({ message: 'Kopya yerleştirildi.', type: 'success' });
                                                setPlacingMode(null);
                                            } else if (placingMode.type === 'shape' && placingMode.shapeType) {
                                                addElement('shape', placingMode.shapeType, snapX, snapY);
                                            } else {
                                                // Handle binding and format if present (from XML field adder)
                                                const { type, content, binding, format } = placingMode;
                                                const newEl: DesignElement = {
                                                    id: Math.random().toString(36).substring(2, 11),
                                                    type: type as any,
                                                    x: snapX,
                                                    y: snapY,
                                                    content: content || 'Yeni Metin',
                                                    style: { fontSize: '12px', color: '#000000', position: 'absolute' as any },
                                                    binding: binding,
                                                    format: format
                                                };
                                                setState(prev => ({ ...prev, elements: [...prev.elements, newEl], selectedId: newEl.id }));
                                                setNotification({ message: 'Alan başarıyla eklendi.', type: 'success' });
                                                setPlacingMode(null);
                                            }
                                            return;
                                        }}
                                    />
                                )}
                                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                                    <iframe
                                        ref={iframeRef}
                                        srcDoc={previewHtml || backgroundHtml}
                                        style={{ width: '100%', height: '100%', border: 'none', opacity: 1, pointerEvents: isDragging ? 'none' : 'auto' }}
                                        title="Design Backdrop"
                                    />
                                </div>

                                <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', pointerEvents: 'none' }}>
                                    {/* Enable pointer events only for children */}
                                    {state.selectedXsltElement && state.selectedXsltElement.x !== undefined && (
                                        <DraggableElement
                                            key={state.selectedXsltElement.elementId}
                                            scale={designZoom}
                                            element={{
                                                id: state.selectedXsltElement.elementId,
                                                type: (state.selectedXsltElement.elementType === 'image' || state.selectedXsltElement.elementType === 'img') ? 'image' :
                                                    (state.selectedXsltElement.elementType === 'table' ? 'table' : 'text'),
                                                x: state.selectedXsltElement.x || 0,
                                                y: state.selectedXsltElement.y || 0,
                                                content: state.selectedXsltElement.content || '',
                                                style: {
                                                    ...state.selectedXsltElement.styleOverrides,
                                                    width: state.selectedXsltElement.width ? `${state.selectedXsltElement.width}px` : undefined,
                                                    height: state.selectedXsltElement.height ? `${state.selectedXsltElement.height}px` : undefined,
                                                }
                                            }}
                                            isSelected={true}
                                            onResize={handleResize}
                                            onResizeStart={saveHistory}
                                            onClick={(e) => { e.stopPropagation(); }}
                                        >
                                            {state.selectedXsltElement.elementType === 'table' ? (
                                                <div style={{
                                                    width: '100%', height: '100%', minHeight: '40px',
                                                    background: 'rgba(99, 102, 241, 0.05)',
                                                    border: '1px dashed #6366f1',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '10px', color: '#6366f1', opacity: isDragging ? 1 : 0
                                                }}>
                                                    [TABLO YAPISI]
                                                </div>
                                            ) : (state.selectedXsltElement.elementType === 'img' || state.selectedXsltElement.elementType === 'image') ? (
                                                <img
                                                    src={state.selectedXsltElement.src}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0 }}
                                                    alt="Ghost"
                                                />
                                            ) : (
                                                <div style={{
                                                    ...cleanStyle(state.selectedXsltElement.styleOverrides),
                                                    opacity: 0,
                                                    whiteSpace: 'nowrap',
                                                    pointerEvents: 'none',
                                                    fontSize: state.selectedXsltElement.styleOverrides.fontSize,
                                                    color: state.selectedXsltElement.styleOverrides.color,
                                                    fontWeight: state.selectedXsltElement.styleOverrides.fontWeight,
                                                }}>
                                                    {state.selectedXsltElement.isDynamic ? (
                                                        <span style={{
                                                            color: '#6366f1',
                                                            background: '#eef2ff',
                                                            padding: '0 4px',
                                                            borderRadius: '2px',
                                                            border: '1px dashed #6366f1'
                                                        }}>
                                                            {state.selectedXsltElement.path?.split('/').pop()}
                                                        </span>
                                                    ) : state.selectedXsltElement.content}
                                                </div>
                                            )}
                                        </DraggableElement>
                                    )}

                                    {state.elements.map(el => (
                                        <DraggableElement
                                            key={el.id} element={el} isSelected={state.selectedIds.includes(el.id)}
                                            scale={designZoom}
                                            onResize={handleResize}
                                            onResizeStart={saveHistory}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const isMulti = e.ctrlKey || e.shiftKey;
                                                setState(prev => {
                                                    const alreadySelected = prev.selectedIds.includes(el.id);
                                                    let newIds = [];
                                                    if (isMulti) {
                                                        if (alreadySelected) newIds = prev.selectedIds.filter(id => id !== el.id);
                                                        else newIds = [...prev.selectedIds, el.id];
                                                    } else {
                                                        newIds = [el.id];
                                                    }
                                                    return { ...prev, selectedId: newIds.length > 0 ? newIds[newIds.length - 1] : null, selectedIds: newIds };
                                                });
                                                setSelectedDbField(null);
                                                setActiveSidebarTab('PROPERTIES');
                                            }}
                                        >
                                            {el.type === 'text' && (
                                                <div style={{ ...cleanStyle(el.style), whiteSpace: el.style?.width ? 'normal' : 'nowrap', overflow: 'hidden', wordBreak: 'break-word' }}>
                                                    {el.binding ? (
                                                        <span style={{
                                                            color: state.selectedIds.includes(el.id) ? '#6366f1' : 'inherit',
                                                            background: state.selectedIds.includes(el.id) ? '#eef2ff' : 'transparent',
                                                            padding: state.selectedIds.includes(el.id) ? '0 4px' : '0',
                                                            borderRadius: '2px',
                                                            border: state.selectedIds.includes(el.id) ? '1px dashed #6366f1' : 'none'
                                                        }}>
                                                            {state.selectedIds.includes(el.id) ? el.binding.split('/').pop() : el.content}
                                                        </span>
                                                    ) : el.content}
                                                </div>
                                            )}
                                            {el.type === 'formula' && (
                                                <span style={{ ...cleanStyle(el.style), fontWeight: 'bold', color: '#6366f1', background: '#eef2ff', padding: '2px', border: '1px solid #6366f1' }}>
                                                    {el.content}
                                                </span>
                                            )}
                                            {el.type === 'image' && (
                                                <img
                                                    src={el.content}
                                                    alt="User element"
                                                    draggable={false}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        userSelect: 'none',
                                                        pointerEvents: 'none',
                                                        ...cleanStyle(el.style)
                                                    }}
                                                />
                                            )}
                                            {el.type === 'shape' && (
                                                <div style={{
                                                    ...cleanStyle(el.style),
                                                    width: '100%',
                                                    border: el.shapeType === 'line' ? 'none' : (el.style?.border || '1px solid #000'),
                                                    borderRadius: el.shapeType === 'circle' ? '50%' : '0',
                                                    backgroundColor: el.shapeType === 'line' ? (el.style?.backgroundColor || '#000') : (el.style?.backgroundColor || 'transparent'),
                                                    height: el.shapeType === 'line' ? (el.style?.height || '2px') : '100%'
                                                }} />
                                            )}
                                            {el.type === 'qrcode' && (
                                                <div style={{ ...cleanStyle(el.style), width: '100%', height: '100%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <img
                                                        src={el.content && el.content.startsWith('http') ? el.content : `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(el.content || 'QR-CODE')}`}
                                                        alt="QR Code"
                                                        draggable={false}
                                                        style={{ maxWidth: '100%', maxHeight: '100%', pointerEvents: 'none', userSelect: 'none' }}
                                                    />
                                                </div>
                                            )}
                                            {el.type === 'table' && el.tableData && (
                                                <table style={{
                                                    border: '1px solid #ccc',
                                                    borderCollapse: 'collapse',
                                                    tableLayout: 'fixed',
                                                    width: el.colWidths?.reduce((a, b) => a + b, 0) || 'auto',
                                                    ...cleanStyle(el.style)
                                                }}>
                                                    <tbody>
                                                        {el.tableData.map((row, ri) => (
                                                            <tr key={ri} style={{ height: (el.rowHeights && el.rowHeights[ri]) ? `${el.rowHeights[ri]}px` : 'auto' }}>
                                                                {row.map((cell, ci) => {
                                                                    const isCellSelected = selectedCell?.row === ri && selectedCell?.col === ci;
                                                                    return (
                                                                        <td
                                                                            key={ci}
                                                                            style={{
                                                                                border: '1px solid #ccc',
                                                                                padding: '4px',
                                                                                width: (el.colWidths && el.colWidths[ci]) ? `${el.colWidths[ci]}px` : 'auto',
                                                                                overflow: 'hidden',
                                                                                wordBreak: 'break-all',
                                                                                backgroundColor: isCellSelected ? '#6366f122' : 'transparent',
                                                                                ...cleanStyle(el.style),
                                                                                ...cleanStyle(cell.style)
                                                                            }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedCell({ row: ri, col: ci });
                                                                                setState(prev => ({ ...prev, selectedId: el.id }));
                                                                            }}
                                                                        >
                                                                            {cell.binding ? (
                                                                                <span style={{ color: '#6366f1', fontSize: '10px' }}>{cell.binding.split('/').pop()}</span>
                                                                            ) : (
                                                                                <span style={{ fontSize: '10px' }}>{cell.content}</span>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </DraggableElement>
                                    ))}
                                </div>
                            </div>
                        </DndContext>

                        {/* Design Canvas Zoom Controls */}
                        <div style={{
                            position: 'absolute', bottom: '20px', left: '20px',
                            background: '#1e293b', padding: '6px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            zIndex: 100
                        }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setDesignZoom(z => Math.max(0.2, z - 0.1)); }}
                                style={{
                                    background: '#334155', border: 'none', color: 'white',
                                    width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Minus size={16} />
                            </button>
                            <span style={{ color: 'white', fontSize: '0.8rem', minWidth: '36px', textAlign: 'center', userSelect: 'none' }}>
                                {Math.round(designZoom * 100)}%
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); setDesignZoom(z => Math.min(2.0, z + 0.1)); }}
                                style={{
                                    background: '#334155', border: 'none', color: 'white',
                                    width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Right Live Preview Section */}
                    <div style={{ flex: 1, background: '#f1f5f9', position: 'relative', display: 'flex', flexDirection: 'column' }}>

                        {/* Scrollable Content Area */}
                        <div style={{ flex: 1, overflow: 'auto', padding: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                            <div style={{
                                width: `${794 * previewZoom}px`,
                                height: `${1123 * previewZoom}px`,
                                flexShrink: 0,
                                transition: 'width 0.2s, height 0.2s'
                            }}>
                                <div style={{
                                    width: '794px',
                                    height: '1123px',
                                    background: 'white',
                                    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                                    transform: `scale(${previewZoom})`,
                                    transformOrigin: 'top left',
                                    transition: 'transform 0.2s'
                                }}>
                                    <iframe srcDoc={previewHtml} style={{ width: '100%', height: '100%', border: 'none' }} title="Live Preview" />
                                </div>
                            </div>
                        </div>

                        {/* Floating Live Preview Zoom Controls */}
                        <div style={{
                            position: 'absolute', bottom: '20px', right: '20px',
                            background: '#1e293b', padding: '6px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                            zIndex: 100
                        }}>
                            <button
                                onClick={() => setPreviewZoom(z => Math.max(0.2, z - 0.1))}
                                style={{
                                    background: '#334155', border: 'none', color: 'white',
                                    width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Minus size={16} />
                            </button>
                            <span style={{ color: 'white', fontSize: '0.8rem', minWidth: '36px', textAlign: 'center', userSelect: 'none' }}>
                                {Math.round(previewZoom * 100)}%
                            </span>
                            <button
                                onClick={() => setPreviewZoom(z => Math.min(2.0, z + 0.1))}
                                style={{
                                    background: '#334155', border: 'none', color: 'white',
                                    width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
};
