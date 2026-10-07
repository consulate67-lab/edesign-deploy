import React, { useEffect, useState } from 'react';
import { FileCode, PenLine, Trash2, Download, Lock } from 'lucide-react';
import { api, type SavedDesign } from './api';
import { WIZARD_DOC_TYPES } from './wizard/docTypes';
import { stripLeadingBom } from './xslt-editor/utils/testWatermark';

const moduleLabel = (moduleId: string) =>
    WIZARD_DOC_TYPES.find(t => t.id === moduleId || t.defaults.some(d => d.moduleId === moduleId))?.label ?? moduleId;

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const downloadDesign = (d: SavedDesign) => {
    const url = URL.createObjectURL(new Blob([stripLeadingBom(d.xslt_content ?? '')], { type: 'application/xml;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${d.name.replace(/[\\/:*?"<>|\s]+/g, '_')}_${d.module_id}.xslt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
};

/**
 * Hesaptaki XSLT tasarımları. Taslaklar açılıp düzenlenebilir; onaylanmış
 * (satın alınmış) tasarımlar kilitlidir, yalnızca tekrar indirilebilir.
 */
export const MyDesigns: React.FC<{ onOpen: (d: SavedDesign) => void }> = ({ onOpen }) => {
    const [designs, setDesigns] = useState<SavedDesign[] | null>(null);

    useEffect(() => {
        api.listDesigns()
            .then((r: { designs?: SavedDesign[] }) => setDesigns((r.designs ?? []).filter(d => d.xslt_content)))
            .catch(() => setDesigns([]));
    }, []);

    if (!designs?.length) return null;

    const remove = async (d: SavedDesign) => {
        if (!window.confirm(`"${d.name}" silinsin mi?${d.paid ? '\n\nOnaylanmış bir tasarımı silerseniz buradan tekrar indiremezsiniz.' : ''}`)) return;
        await api.deleteDesign(d.id);
        setDesigns(prev => prev?.filter(x => x.id !== d.id) ?? null);
    };

    return (
        <div data-my-designs style={{ width: '100%', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#f1f5f9' }}>Tasarımlarım</h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Taslaklarınıza devam edebilirsiniz. Onaylanan tasarımlar değiştirilemez, yalnızca ücretsiz tekrar indirilir.
                </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {designs.map(d => (
                    <div
                        key={d.id}
                        data-design-id={d.id}
                        data-design-paid={d.paid ? '1' : undefined}
                        style={{
                            display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 16px',
                            background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px',
                            border: `1px solid ${d.paid ? 'rgba(16, 185, 129, 0.35)' : 'rgba(148, 163, 184, 0.2)'}`,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileCode size={20} color={d.paid ? '#34d399' : '#94a3b8'} style={{ flexShrink: 0 }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {d.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                    {moduleLabel(d.module_id)} · {formatDate(d.updated_at)}
                                </div>
                            </div>
                            <button
                                type="button"
                                title="Sil"
                                onClick={() => remove(d)}
                                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700,
                                padding: '2px 8px', borderRadius: 999,
                                background: d.paid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.12)',
                                color: d.paid ? '#6ee7b7' : '#94a3b8',
                            }}>
                                {d.paid ? <><Lock size={11} /> Onaylandı · yalnızca indirme</> : 'Taslak · onay 1 hak'}
                            </span>
                            {d.paid ? (
                                <button
                                    type="button"
                                    data-download-design={d.id}
                                    onClick={() => downloadDesign(d)}
                                    style={{
                                        marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px',
                                        padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                        background: '#10b981', color: 'white', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit',
                                    }}
                                >
                                    <Download size={13} /> İndir
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    data-open-design={d.id}
                                    onClick={() => onOpen(d)}
                                    style={{
                                        marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px',
                                        padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                        background: '#6366f1', color: 'white', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit',
                                    }}
                                >
                                    <PenLine size={13} /> Devam et
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
