import React, { useEffect, useMemo, useState } from 'react';
import { FileCode, PenLine, Trash2, Download, Lock, Eye, X, Search, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type SavedDesign } from './api';
import { WIZARD_DOC_TYPES, loadSampleXml } from './wizard/docTypes';
import { stripLeadingBom } from './xslt-editor/utils/testWatermark';
import { transformXmlWithXslt } from './xsltTransformer';

const MAX_DRAFTS = 5;
const PAGE_SIZE = 10;

const docTypeOf = (moduleId: string) =>
    WIZARD_DOC_TYPES.find(t => t.id === moduleId || t.defaults.some(d => d.moduleId === moduleId));
const moduleLabel = (moduleId: string) => docTypeOf(moduleId)?.label ?? moduleId;

const formatDate = (iso: string | null | undefined, withTime = false) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('tr-TR', {
        day: '2-digit', month: 'short', year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
};

const byRecent = (key: 'updated_at' | 'paid_at') => (a: SavedDesign, b: SavedDesign) =>
    new Date(b[key] ?? b.updated_at).getTime() - new Date(a[key] ?? a.updated_at).getTime();

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

/** Hesaptaki XSLT tasarımları; taslak ve onaylı bölümler aynı listeyi paylaşır. */
const useDesigns = () => {
    const [designs, setDesigns] = useState<SavedDesign[] | null>(null);

    useEffect(() => {
        api.listDesigns()
            .then((r: { designs?: SavedDesign[] }) => setDesigns((r.designs ?? []).filter(d => d.xslt_content)))
            .catch(() => setDesigns([]));
    }, []);

    const remove = async (d: SavedDesign) => {
        if (!window.confirm(`"${d.name}" silinsin mi?${d.paid ? '\n\nOnaylanmış bir tasarımı silerseniz tekrar indiremezsiniz.' : ''}`)) return;
        await api.deleteDesign(d.id);
        setDesigns(prev => prev?.filter(x => x.id !== d.id) ?? null);
    };

    return { designs, remove };
};

const sectionTitle = (title: string, note: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#f1f5f9' }}>{title}</h2>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{note}</span>
    </div>
);

const btn = (bg: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px',
    border: 'none', cursor: 'pointer', background: bg, color: 'white', fontWeight: 700, fontSize: '0.8rem',
    fontFamily: 'inherit', whiteSpace: 'nowrap',
});

/** Devam eden (onaylanmamış) tasarımlar — en son düzenlenen 5 tanesi. */
export const MyDesigns: React.FC<{ onOpen: (d: SavedDesign) => void }> = ({ onOpen }) => {
    const { designs, remove } = useDesigns();
    const drafts = useMemo(() => (designs ?? []).filter(d => !d.paid).sort(byRecent('updated_at')).slice(0, MAX_DRAFTS), [designs]);

    if (!drafts.length) return null;

    return (
        <div data-my-designs style={{ width: '100%', marginBottom: '2rem' }}>
            {sectionTitle('Devam Eden Tasarımlar', `Son düzenlediğiniz ${MAX_DRAFTS} taslak. Onaylanana kadar düzenleyebilirsiniz; onay 1 hak harcar.`)}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {drafts.map(d => (
                    <div
                        key={d.id}
                        data-design-id={d.id}
                        style={{
                            display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 16px',
                            background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileCode size={20} color="#94a3b8" style={{ flexShrink: 0 }} />
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
                                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                                background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8',
                            }}>
                                Taslak · onay 1 hak
                            </span>
                            <button type="button" data-open-design={d.id} onClick={() => onOpen(d)} style={{ ...btn('#6366f1'), marginLeft: 'auto' }}>
                                <PenLine size={13} /> Devam et
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const th: React.CSSProperties = {
    textAlign: 'left', padding: '10px 12px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
    padding: '10px 12px', fontSize: '0.85rem', color: '#e2e8f0', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', verticalAlign: 'middle',
};

/** Onaylanmış (satın alınmış) tasarımlar — kilitli; önizlenir ve tekrar indirilir. */
export const CompletedDesigns: React.FC = () => {
    const { designs, remove } = useDesigns();
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(0);
    const [preview, setPreview] = useState<SavedDesign | null>(null);

    const completed = useMemo(() => (designs ?? []).filter(d => d.paid).sort(byRecent('paid_at')), [designs]);
    const filtered = useMemo(() => {
        const q = query.trim().toLocaleLowerCase('tr-TR');
        if (!q) return completed;
        return completed.filter(d => `${d.name} ${moduleLabel(d.module_id)}`.toLocaleLowerCase('tr-TR').includes(q));
    }, [completed, query]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const current = Math.min(page, pageCount - 1);
    const rows = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

    if (!completed.length) return null;

    return (
        <div data-completed-designs style={{ width: '100%', marginBottom: '2rem' }}>
            {sectionTitle('Tamamlanan Tasarımlar', 'Onaylanan tasarımlar değiştirilemez; istediğiniz zaman önizleyip ücretsiz tekrar indirebilirsiniz.')}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)' }}>
                    <div style={{ position: 'relative', flex: '0 1 280px' }}>
                        <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            data-completed-search
                            value={query}
                            onChange={e => { setQuery(e.target.value); setPage(0); }}
                            placeholder="Tasarım veya belge türü ara"
                            style={{
                                width: '100%', boxSizing: 'border-box', padding: '7px 10px 7px 30px', borderRadius: '8px',
                                border: '1px solid rgba(148, 163, 184, 0.25)', background: 'rgba(15, 23, 42, 0.6)',
                                color: '#f1f5f9', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none',
                            }}
                        />
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8' }}>
                        {filtered.length} / {completed.length} tasarım
                    </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={th}>Tasarım</th>
                                <th style={th}>Belge türü</th>
                                <th style={th}>Onay tarihi</th>
                                <th style={{ ...th, textAlign: 'center' }}>İndirme</th>
                                <th style={{ ...th, textAlign: 'right' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(d => (
                                <tr key={d.id} data-completed-row={d.id}>
                                    <td style={td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                            <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} />
                                            <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{d.name}</span>
                                            <Lock size={12} color="#64748b" style={{ flexShrink: 0 }} />
                                        </div>
                                    </td>
                                    <td style={td}>{moduleLabel(d.module_id)}</td>
                                    <td style={{ ...td, whiteSpace: 'nowrap', color: '#94a3b8' }}>{formatDate(d.paid_at ?? d.updated_at, true)}</td>
                                    <td style={{ ...td, textAlign: 'center', color: '#94a3b8' }}>{d.download_count ?? 0}</td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                            <button type="button" data-preview-design={d.id} onClick={() => setPreview(d)} style={btn('#334155')}>
                                                <Eye size={13} /> Önizle
                                            </button>
                                            <button type="button" data-download-design={d.id} onClick={() => downloadDesign(d)} style={btn('#10b981')}>
                                                <Download size={13} /> İndir
                                            </button>
                                            <button
                                                type="button"
                                                title="Sil"
                                                onClick={() => remove(d)}
                                                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!rows.length && (
                                <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#64748b', padding: '20px' }}>Aramaya uyan tasarım yok.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {pageCount > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', padding: '8px 12px', fontSize: '0.8rem', color: '#94a3b8' }}>
                        <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} style={{ ...btn('#334155'), opacity: current === 0 ? 0.4 : 1 }}>
                            <ChevronLeft size={13} />
                        </button>
                        <span>{current + 1} / {pageCount}</span>
                        <button type="button" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)} style={{ ...btn('#334155'), opacity: current >= pageCount - 1 ? 0.4 : 1 }}>
                            <ChevronRight size={13} />
                        </button>
                    </div>
                )}
            </div>
            {preview && <DesignPreview design={preview} onClose={() => setPreview(null)} />}
        </div>
    );
};

/** Tasarımı kayıtlı XML'iyle (yoksa belge türünün örnek XML'iyle) gösterir. */
const DesignPreview: React.FC<{ design: SavedDesign; onClose: () => void }> = ({ design, onClose }) => {
    const [html, setHtml] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [usesSample, setUsesSample] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                let xml = design.xml_content;
                if (!xml) {
                    const docType = docTypeOf(design.module_id);
                    if (!docType) throw new Error('Bu belge türü için örnek XML bulunamadı.');
                    xml = await loadSampleXml(docType);
                    if (alive) setUsesSample(true);
                }
                const out = transformXmlWithXslt(xml, stripLeadingBom(design.xslt_content ?? ''));
                if (alive) setHtml(out);
            } catch (e) {
                if (alive) setError(e instanceof Error ? e.message : String(e));
            }
        })();
        return () => { alive = false; };
    }, [design]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div
            data-design-preview
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(2, 6, 23, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{ width: 'min(1000px, 100%)', height: 'min(90vh, 1200px)', display: 'flex', flexDirection: 'column', background: '#0f172a', borderRadius: '14px', border: '1px solid rgba(148, 163, 184, 0.25)', overflow: 'hidden' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                    <Eye size={18} color="#94a3b8" />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{design.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {moduleLabel(design.module_id)} · {usesSample ? 'örnek XML ile önizleme' : 'kayıtlı XML ile önizleme'}
                        </div>
                    </div>
                    <button type="button" onClick={() => downloadDesign(design)} style={{ ...btn('#10b981'), marginLeft: 'auto' }}>
                        <Download size={13} /> İndir
                    </button>
                    <button type="button" title="Kapat" data-preview-close onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
                        <X size={18} />
                    </button>
                </div>
                <div style={{ flex: 1, background: '#fff', position: 'relative' }}>
                    {html && <iframe title="Tasarım önizleme" srcDoc={html} sandbox="allow-same-origin" style={{ width: '100%', height: '100%', border: 0 }} />}
                    {!html && !error && <div style={{ padding: 24, color: '#475569' }}>Önizleme hazırlanıyor…</div>}
                    {error && <div style={{ padding: 24, color: '#b91c1c' }}>Önizleme oluşturulamadı: {error}</div>}
                </div>
            </div>
        </div>
    );
};
