import React, { useState, useEffect } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { ChevronLeft, Save, Type, Table as TableIcon, Sigma, Database, Eye } from 'lucide-react';
import { DraggableElement } from './DraggableElement.tsx';
import { mergeDesignWithXslt } from './xsltMerger.ts';
import { transformXmlWithXslt } from './xsltTransformer.ts';
import { instrumentXslt } from './xsltInstrumenter.ts';
import type { DesignElement, DesignState } from './types.ts';

interface Designer2Props {
    template: string;
    docName: string;
    onBack: () => void;
}

export const Designer2: React.FC<Designer2Props> = ({ template, docName, onBack }) => {
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
    const [finalPreviewHtml, setFinalPreviewHtml] = useState('');
    const [originalXslt, setOriginalXslt] = useState('');
    const [selectedDbField, setSelectedDbField] = useState<{ path: string, value: string } | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Load and Transform
    const refreshLayouts = async (xslt: string) => {
        try {
            const xmlRes = await fetch(`./examples/e-fatura-detail.xml`);
            const xmlText = await xmlRes.text();

            // Backdrop layout (instrumented)
            const instrXslt = instrumentXslt(xslt);
            setBackgroundHtml(transformXmlWithXslt(xmlText, instrXslt));

            // Final preview layout (merged visual elements)
            const mergedXslt = mergeDesignWithXslt(xslt, state);
            setFinalPreviewHtml(transformXmlWithXslt(xmlText, mergedXslt));
        } catch (err) {
            console.error("Refresh error:", err);
        }
    };

    useEffect(() => {
        const init = async () => {
            const xsltRes = await fetch(`./${template}`);
            const xsltText = await xsltRes.text();
            setOriginalXslt(xsltText);
            refreshLayouts(xsltText);
        };
        init();
    }, [template]);

    // Handle postMessage from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'XSLT_FIELD_CLICKED') {
                setSelectedDbField({ path: event.data.path, value: event.data.value });
                setState(prev => ({ ...prev, selectedId: null })); // Deselect visual elements
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Update layouts when visual elements change
    useEffect(() => {
        if (originalXslt) {
            const xmlPromise = fetch(`./examples/e-fatura-detail.xml`).then(r => r.text());
            xmlPromise.then(xmlText => {
                const mergedXslt = mergeDesignWithXslt(originalXslt, state);
                setFinalPreviewHtml(transformXmlWithXslt(xmlText, mergedXslt));
            });
        }
    }, [state.elements]);

    const addElement = (type: DesignElement['type']) => {
        const newElement: DesignElement = {
            id: Math.random().toString(36).substr(2, 9),
            type, x: 100, y: 100,
            content: type === 'text' ? 'Yeni Alan' : '',
            style: { position: 'absolute' },
        };
        setState(prev => ({ ...prev, elements: [...prev.elements, newElement], selectedId: newElement.id }));
        setSelectedDbField(null);
    };

    const DESIGN_SCALE = 0.8;

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;
        if (active) {
            setState(prev => ({
                ...prev,
                elements: prev.elements.map(el =>
                    el.id === active.id ? {
                        ...el,
                        x: el.x + (delta.x / DESIGN_SCALE),
                        y: el.y + (delta.y / DESIGN_SCALE)
                    } : el
                )
            }));
        }
    };

    const selectedOverlay = state.elements.find(e => e.id === state.selectedId);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a' }}>
            <header style={{ height: '56px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{docName} Tasarımcısı 2.0</span>
                </div>
                <button onClick={() => { }} className="btn-primary" style={{ height: '36px', padding: '0 1rem' }}><Save size={16} style={{ marginRight: '6px' }} /> XSLT Dışa Aktar</button>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* 1. Left Toolbar */}
                <div style={{ width: '56px', background: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', gap: '1rem' }}>
                    <button onClick={() => addElement('text')} title="Metin" style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><Type size={24} /></button>
                    <button onClick={() => addElement('table')} title="Tablo" style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><TableIcon size={24} /></button>
                    <button onClick={() => addElement('formula')} title="Formül" style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><Sigma size={24} /></button>
                </div>

                {/* 2. Visual Designer Canvas */}
                <div style={{ flex: '1 1 40%', background: '#020617', overflow: 'auto', padding: '1rem', position: 'relative' }}>
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem' }}>TASARIM ALANI (DÜZENLEME)</div>
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <div style={{ width: '210mm', height: '297mm', background: 'white', position: 'relative', scale: `${DESIGN_SCALE}`, transformOrigin: 'top center' }}>
                            <iframe srcDoc={backgroundHtml} style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', zIndex: 0 }} title="Backdrop" />
                            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                                {state.elements.map(el => (
                                    <DraggableElement
                                        key={el.id}
                                        element={el}
                                        scale={DESIGN_SCALE}
                                        isSelected={state.selectedId === el.id}
                                        onClick={() => { setState(prev => ({ ...prev, selectedId: el.id })); setSelectedDbField(null); }}
                                    >
                                        <div style={{ fontSize: '12px', border: '1px dashed #6366f1', padding: '2px', background: 'rgba(99,102,241,0.1)' }}>{el.content || el.type}</div>
                                    </DraggableElement>
                                ))}
                            </div>
                        </div>
                    </DndContext>
                </div>

                {/* 3. Middle Property Panel */}
                <div style={{ width: '320px', background: '#1e293b', borderLeft: '1px solid #334155', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1rem', background: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Database size={18} color="#6366f1" />
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>Özellikler / Veri Bağlantısı</span>
                    </div>
                    <div style={{ flex: 1, padding: '1.5rem', color: '#e2e8f0' }}>
                        {selectedDbField ? (
                            <div style={{ animation: 'fadeIn 0.2s' }}>
                                <div style={{ background: '#6366f122', padding: '0.75rem', border: '1px solid #6366f1', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: 'bold' }}>SİSTEM ALANI (DATABASE)</span>
                                    <h4 style={{ margin: '4px 0', fontSize: '1rem' }}>{selectedDbField.path.split('/').pop()}</h4>
                                </div>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.75rem' }}>XML Path</label>
                                    <div style={{ background: '#020617', padding: '8px', fontSize: '0.875rem', fontFamily: 'monospace', borderRadius: '4px', wordBreak: 'break-all' }}>
                                        {selectedDbField.path}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Mevcut Değer (Örnek)</label>
                                    <div style={{ color: '#10b981', fontWeight: 'bold' }}>{selectedDbField.value}</div>
                                </div>
                            </div>
                        ) : selectedOverlay ? (
                            <div>
                                <span style={{ fontSize: '0.65rem', color: '#ec4899', fontWeight: 'bold' }}>TASARIM NESNESİ</span>
                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.75rem' }}>İçerik</label>
                                    <input className="input-field" value={selectedOverlay.content} onChange={(e) => setState(prev => ({ ...prev, elements: prev.elements.map(el => el.id === state.selectedId ? { ...el, content: e.target.value } : el) }))} />
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', marginTop: '4rem', color: '#475569' }}>
                                <Database size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>Düzenlemek için taslak üzerindeki bir alana veya yeni nesneye tıklayın.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Right Live Preview */}
                <div style={{ flex: '1 1 35%', background: '#0f172a', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '0.75rem 1rem', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Eye size={18} color="#10b981" />
                        <span style={{ color: 'white', fontSize: '0.875rem' }}>Canlı Önizleme (Final Çıktı)</span>
                    </div>
                    <div style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
                        <div style={{ width: '100%', minHeight: '100%', background: 'white', scale: '0.7', transformOrigin: 'top center' }}>
                            <iframe srcDoc={finalPreviewHtml} style={{ width: '100%', height: '1000px', border: 'none' }} title="Preview" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
