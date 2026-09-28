/**
 * Designer 2.0 — Merkezi state yönetimi (Phase 16.3)
 *
 * useDesignerState hook: Designer için single source of truth.
 * Phase 14 FastReport Section mimarisinin SectionsMap'i temel alır.
 *
 * State:
 *  - sections: 5-section mimari (reportHeader, partyHeader, masterData, totals, reportFooter)
 *  - selection: activeSectionId + selectedElementId
 *  - UI: mode, zoom, showGrid, snapToGrid
 *  - XSLT: originalXslt + xmlPreview + xsltOutput + htmlPreview
 *  - history: undo/redo stack
 */

import { useReducer, useCallback } from 'react';
import type {
    DesignState,
    DesignElement,
    SectionId,
    SectionsMap,
} from '../../../types.ts';
import { createDefaultSections } from '../../../types.ts';

// ============================================================================
// Phase 16.3 — Designer 2.0 state shape
// ============================================================================

export interface DesignerStateV2 {
    // Sections (Phase 14)
    sections: SectionsMap;

    // Selection
    activeSectionId: SectionId;
    selectedElementId: string | null;

    // UI
    mode: 'idle' | 'clickPlace' | 'dragElement' | 'marqueeSelect';
    zoom: number;
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;

    // XSLT pipeline
    originalXslt: string;
    xmlPreview: string;
    xsltOutput: string;
    htmlPreview: string;
    /** Phase 17.3 — Kullanıcının yüklediği XSLT (sample XML ile render edilir). */
    currentXslt: string;
    /** Phase 17.3 — Render için kullanılan XML (sample veya kullanıcı yüklemesi). */
    currentXml: string;

    // History (undo/redo)
    history: SectionsMap[];
    historyIndex: number;

    // Tool selection (sol sidebar)
    activeTool: 'select' | 'text' | 'image' | 'shape' | 'qrcode' | 'formula' | 'table';
}

export type DesignerActionV2 =
    | { type: 'SET_MODE'; payload: { mode: DesignerStateV2['mode'] } }
    | { type: 'SET_TOOL'; payload: { tool: DesignerStateV2['activeTool'] } }
    | { type: 'SET_ACTIVE_SECTION'; payload: { sectionId: SectionId } }
    | { type: 'SELECT_ELEMENT'; payload: { id: string | null } }
    | { type: 'PLACE_ELEMENT'; payload: { sectionId: SectionId; element: DesignElement } }
    | { type: 'MOVE_ELEMENT'; payload: { id: string; dx: number; dy: number } }
    | { type: 'UPDATE_ELEMENT'; payload: { id: string; patch: Partial<DesignElement> } }
    | { type: 'DELETE_ELEMENT'; payload: { id: string } }
    | { type: 'CLONE_ELEMENT'; payload: { id: string } }
    | { type: 'SET_ZOOM'; payload: { zoom: number } }
    | { type: 'TOGGLE_GRID' }
    | { type: 'TOGGLE_SNAP' }
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'IMPORT_XSLT'; payload: { xslt: string } }
    | { type: 'EXPORT_XSLT'; payload: { xslt: string } }
    | { type: 'SET_HTML_PREVIEW'; payload: { html: string } }
    | { type: 'SET_SECTIONS'; payload: { sections: SectionsMap } }
    | { type: 'SET_XML'; payload: { xml: string } }
    | { type: 'PUSH_HISTORY' };

// ============================================================================
// Initial state factory
// ============================================================================

export function createInitialDesignerState(): DesignerStateV2 {
    return {
        sections: createDefaultSections(),
        activeSectionId: 'reportHeader',
        selectedElementId: null,
        mode: 'idle',
        zoom: 0.7,
        showGrid: false,
        snapToGrid: true,
        gridSize: 5,
        originalXslt: '',
        xmlPreview: '',
        xsltOutput: '',
        htmlPreview: '',
        currentXslt: '',
        currentXml: '',
        history: [],
        historyIndex: -1,
        activeTool: 'select',
    };
}

// ============================================================================
// Reducer
// ============================================================================

export function designerReducer(
    state: DesignerStateV2,
    action: DesignerActionV2
): DesignerStateV2 {
    switch (action.type) {
        case 'SET_MODE':
            return { ...state, mode: action.payload.mode };

        case 'SET_TOOL':
            return { ...state, activeTool: action.payload.tool };

        case 'SET_ACTIVE_SECTION':
            return {
                ...state,
                activeSectionId: action.payload.sectionId,
                selectedElementId: null,
            };

        case 'SELECT_ELEMENT':
            return { ...state, selectedElementId: action.payload.id };

        case 'PLACE_ELEMENT': {
            const section = state.sections[action.payload.sectionId];
            return {
                ...state,
                sections: {
                    ...state.sections,
                    [action.payload.sectionId]: {
                        ...section,
                        elements: [...section.elements, action.payload.element],
                    },
                },
                selectedElementId: action.payload.element.id,
                mode: 'idle', // clickPlace bitti
            };
        }

        case 'MOVE_ELEMENT': {
            const newSections = { ...state.sections };
            for (const secId of Object.keys(newSections) as SectionId[]) {
                newSections[secId] = {
                    ...newSections[secId],
                    elements: newSections[secId].elements.map((el: DesignElement) =>
                        el.id === action.payload.id
                            ? { ...el, x: el.x + action.payload.dx, y: el.y + action.payload.dy }
                            : el
                    ),
                };
            }
            return { ...state, sections: newSections };
        }

        case 'UPDATE_ELEMENT': {
            const newSections = { ...state.sections };
            for (const secId of Object.keys(newSections) as SectionId[]) {
                newSections[secId] = {
                    ...newSections[secId],
                    elements: newSections[secId].elements.map((el: DesignElement) =>
                        el.id === action.payload.id
                            ? { ...el, ...action.payload.patch }
                            : el
                    ),
                };
            }
            return { ...state, sections: newSections };
        }

        case 'DELETE_ELEMENT': {
            const newSections = { ...state.sections };
            for (const secId of Object.keys(newSections) as SectionId[]) {
                newSections[secId] = {
                    ...newSections[secId],
                    elements: newSections[secId].elements.filter(
                        (el: DesignElement) => el.id !== action.payload.id
                    ),
                };
            }
            return {
                ...state,
                sections: newSections,
                selectedElementId:
                    state.selectedElementId === action.payload.id
                        ? null
                        : state.selectedElementId,
            };
        }

        case 'CLONE_ELEMENT': {
            let sourceEl: DesignElement | null = null;
            let sourceSec: SectionId | null = null;
            for (const secId of Object.keys(state.sections) as SectionId[]) {
                const found = state.sections[secId].elements.find(
                    (el: DesignElement) => el.id === action.payload.id
                );
                if (found) {
                    sourceEl = found;
                    sourceSec = secId;
                    break;
                }
            }
            if (!sourceEl || !sourceSec) return state;
            const newEl: DesignElement = {
                ...sourceEl,
                id: `${(sourceEl as any).type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                x: sourceEl.x + 10,
                y: sourceEl.y + 10,
            };
            return {
                ...state,
                sections: {
                    ...state.sections,
                    [sourceSec]: {
                        ...state.sections[sourceSec],
                        elements: [...state.sections[sourceSec].elements, newEl],
                    },
                },
                selectedElementId: newEl.id,
            };
        }

        case 'SET_ZOOM':
            return { ...state, zoom: Math.max(0.25, Math.min(2, action.payload.zoom)) };

        case 'TOGGLE_GRID':
            return { ...state, showGrid: !state.showGrid };

        case 'TOGGLE_SNAP':
            return { ...state, snapToGrid: !state.snapToGrid };

        case 'PUSH_HISTORY': {
            const trimmed = state.history.slice(0, state.historyIndex + 1);
            return {
                ...state,
                history: [...trimmed, JSON.parse(JSON.stringify(state.sections))],
                historyIndex: trimmed.length,
            };
        }

        case 'UNDO': {
            if (state.historyIndex < 0) return state;
            const idx = state.historyIndex;
            const restored = state.history[idx];
            return {
                ...state,
                sections: JSON.parse(JSON.stringify(restored)),
                historyIndex: idx - 1,
            };
        }

        case 'REDO': {
            if (state.historyIndex >= state.history.length - 1) return state;
            const idx = state.historyIndex + 1;
            const restored = state.history[idx];
            return {
                ...state,
                sections: JSON.parse(JSON.stringify(restored)),
                historyIndex: idx,
            };
        }

        case 'IMPORT_XSLT':
            return { ...state, originalXslt: action.payload.xslt };

        case 'EXPORT_XSLT':
            return { ...state, xsltOutput: action.payload.xslt };

        case 'SET_HTML_PREVIEW':
            return { ...state, htmlPreview: action.payload.html };

        case 'SET_SECTIONS':
            return { ...state, sections: action.payload.sections };

        case 'SET_XML':
            return { ...state, currentXml: action.payload.xml };

        default:
            return state;
    }
}

// ============================================================================
// Hook
// ============================================================================

export function useDesignerState(initial?: Partial<DesignerStateV2>) {
    const [state, dispatch] = useReducer(designerReducer, {
        ...createInitialDesignerState(),
        ...initial,
    });

    const placeElement = useCallback(
        (sectionId: SectionId, element: DesignElement) =>
            dispatch({ type: 'PLACE_ELEMENT', payload: { sectionId, element } }),
        []
    );

    const selectElement = useCallback(
        (id: string | null) =>
            dispatch({ type: 'SELECT_ELEMENT', payload: { id } }),
        []
    );

    const updateElement = useCallback(
        (id: string, patch: Partial<DesignElement>) =>
            dispatch({ type: 'UPDATE_ELEMENT', payload: { id, patch } }),
        []
    );

    const moveElement = useCallback(
        (id: string, dx: number, dy: number) =>
            dispatch({ type: 'MOVE_ELEMENT', payload: { id, dx, dy } }),
        []
    );

    const deleteElement = useCallback(
        (id: string) =>
            dispatch({ type: 'DELETE_ELEMENT', payload: { id } }),
        []
    );

    const cloneElement = useCallback(
        (id: string) =>
            dispatch({ type: 'CLONE_ELEMENT', payload: { id } }),
        []
    );

    const setActiveSection = useCallback(
        (sectionId: SectionId) =>
            dispatch({ type: 'SET_ACTIVE_SECTION', payload: { sectionId } }),
        []
    );

    const setMode = useCallback(
        (mode: DesignerStateV2['mode']) =>
            dispatch({ type: 'SET_MODE', payload: { mode } }),
        []
    );

    const setTool = useCallback(
        (tool: DesignerStateV2['activeTool']) =>
            dispatch({ type: 'SET_TOOL', payload: { tool } }),
        []
    );

    const setSections = useCallback(
        (sections: SectionsMap) =>
            dispatch({ type: 'SET_SECTIONS', payload: { sections } }),
        []
    );

    const setXml = useCallback(
        (xml: string) =>
            dispatch({ type: 'SET_XML', payload: { xml } }),
        []
    );

    const setCurrentXslt = useCallback(
        (xslt: string) =>
            dispatch({ type: 'IMPORT_XSLT', payload: { xslt } }),
        []
    );

    const setZoom = useCallback(
        (zoom: number) =>
            dispatch({ type: 'SET_ZOOM', payload: { zoom } }),
        []
    );

    const pushHistory = useCallback(
        () => dispatch({ type: 'PUSH_HISTORY' }),
        []
    );

    const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
    const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

    return {
        state,
        dispatch,
        // Helpers (memoized)
        placeElement,
        selectElement,
        updateElement,
        moveElement,
        deleteElement,
        cloneElement,
        setActiveSection,
        setMode,
        setTool,
        setSections,
        setXml,
        setCurrentXslt,
        setZoom,
        pushHistory,
        undo,
        redo,
    };
}
