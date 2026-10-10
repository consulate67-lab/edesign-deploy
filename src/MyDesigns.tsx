import React, { useEffect, useMemo, useState } from 'react';
import { FileCode, PenLine, Trash2, Download, Lock, Eye, X, Search, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type SavedDesign } from './api';
import { WIZARD_DOC_TYPES, loadSampleXml } from './wizard/docTypes';
import { intlModuleDocTypes } from './wizard/intlDocTypes';
import { stripLeadingBom } from './xslt-editor/utils/testWatermark';
import { applyLegacyViewerCompat } from './xslt-editor/utils/legacyViewerCompat';
import { transformXmlWithXslt } from './xsltTransformer';
import { theme } from './theme';
import i18n, { currentLocale, useLocaleT } from './i18n';

const MAX_DRAFTS = 5;
const PAGE_SIZE = 10;

const docTypeOf = (moduleId: string) =>
    [...WIZARD_DOC_TYPES, ...intlModuleDocTypes()].find(t => t.id === moduleId || t.defaults.some(d => d.moduleId === moduleId));
const moduleLabel = (moduleId: string) => docTypeOf(moduleId)?.label ?? moduleId;

const formatDate = (iso: string | null | undefined, withTime = false) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(currentLocale(), {
        day: '2-digit', month: 'short', year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
};

const byRecent = (key: 'updated_at' | 'paid_at') => (a: SavedDesign, b: SavedDesign) =>
    new Date(b[key] ?? b.updated_at).getTime() - new Date(a[key] ?? a.updated_at).getTime();

const downloadDesign = (d: SavedDesign) => {
    const url = URL.createObjectURL(new Blob([applyLegacyViewerCompat(stripLeadingBom(d.xslt_content ?? ''))], { type: 'application/xml;charset=utf-8' }));
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
        const question = i18n.t('designs.confirmDelete', { name: d.name });
        if (!window.confirm(`${question}${d.paid ? `\n\n${i18n.t('designs.confirmDeletePaid')}` : ''}`)) return;
        await api.deleteDesign(d.id);
        setDesigns(prev => prev?.filter(x => x.id !== d.id) ?? null);
    };

    return { designs, remove };
};

const sectionTitle = (title: string, note: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: theme.text }}>{title}</h2>
        <span style={{ fontSize: '0.8rem', color: theme.textSubtle }}>{note}</span>
    </div>
);

const btn = (bg: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px',
    border: 'none', cursor: 'pointer', background: bg, color: 'white', fontWeight: 700, fontSize: '0.8rem',
    fontFamily: 'inherit', whiteSpace: 'nowrap',
});

const primaryBtn: React.CSSProperties = { ...btn(theme.gradient), boxShadow: theme.shadowBrand };

const ghostBtn: React.CSSProperties = {
    ...btn(theme.surface), color: theme.textMuted, border: `1px solid ${theme.borderStrong}`,
};

/** Devam eden (onaylanmamış) tasarımlar — en son düzenlenen 5 tanesi. */
export const MyDesigns: React.FC<{ onOpen: (d: SavedDesign) => void }> = ({ onOpen }) => {
    const { t } = useLocaleT();
    const { designs, remove } = useDesigns();
    const drafts = useMemo(() => (designs ?? []).filter(d => !d.paid).sort(byRecent('updated_at')).slice(0, MAX_DRAFTS), [designs]);

    if (!drafts.length) return null;

    return (
        <div data-my-designs style={{ width: '100%', marginBottom: '2rem' }}>
            {sectionTitle(t('designs.draftsTitle'), t('designs.draftsNote', { count: MAX_DRAFTS }))}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {drafts.map(d => (
                    <div
                        key={d.id}
                        data-design-id={d.id}
                        style={{
                            display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 16px',
                            background: theme.surface, borderRadius: '12px',
                            border: `1px solid ${theme.border}`, boxShadow: theme.shadowSm,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileCode size={20} color={theme.primary} style={{ flexShrink: 0 }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {d.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: theme.textMuted }}>
                                    {moduleLabel(d.module_id)} · {formatDate(d.updated_at)}
                                </div>
                            </div>
                            <button
                                type="button"
                                title={t('common.delete')}
                                onClick={() => remove(d)}
                                style={{ background: 'transparent', border: 'none', color: theme.textSubtle, cursor: 'pointer', padding: 4 }}
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                                background: theme.surfaceAlt, color: theme.textMuted, border: `1px solid ${theme.border}`,
                            }}>
                                {t('designs.draftBadge')}
                            </span>
                            <button type="button" data-open-design={d.id} onClick={() => onOpen(d)} style={{ ...primaryBtn, marginLeft: 'auto' }}>
                                <PenLine size={13} /> {t('designs.continue')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const th: React.CSSProperties = {
    textAlign: 'left', padding: '10px 12px', fontSize: '0.72rem', fontWeight: 700, color: theme.textSubtle,
    textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap',
    background: theme.surfaceAlt,
};
const td: React.CSSProperties = {
    padding: '10px 12px', fontSize: '0.85rem', color: theme.text, borderBottom: `1px solid ${theme.border}`, verticalAlign: 'middle',
};

/** Onaylanmış (satın alınmış) tasarımlar — kilitli; önizlenir ve tekrar indirilir. */
export const CompletedDesigns: React.FC = () => {
    const { t, locale } = useLocaleT();
    const { designs, remove } = useDesigns();
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(0);
    const [preview, setPreview] = useState<SavedDesign | null>(null);

    const completed = useMemo(() => (designs ?? []).filter(d => d.paid).sort(byRecent('paid_at')), [designs]);
    const filtered = useMemo(() => {
        const q = query.trim().toLocaleLowerCase(locale);
        if (!q) return completed;
        return completed.filter(d => `${d.name} ${moduleLabel(d.module_id)}`.toLocaleLowerCase(locale).includes(q));
    }, [completed, query, locale]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const current = Math.min(page, pageCount - 1);
    const rows = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

    if (!completed.length) return null;

    return (
        <div data-completed-designs style={{ width: '100%', marginBottom: '2rem' }}>
            {sectionTitle(t('designs.completedTitle'), t('designs.completedNote'))}
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden', boxShadow: theme.shadowSm }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ position: 'relative', flex: '0 1 280px' }}>
                        <Search size={14} color={theme.textSubtle} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            data-completed-search
                            value={query}
                            onChange={e => { setQuery(e.target.value); setPage(0); }}
                            onFocus={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.boxShadow = theme.focusRing; }}
                            onBlur={e => { e.currentTarget.style.borderColor = theme.borderStrong; e.currentTarget.style.boxShadow = 'none'; }}
                            placeholder={t('designs.search')}
                            style={{
                                width: '100%', boxSizing: 'border-box', padding: '7px 10px 7px 30px', borderRadius: '8px',
                                border: `1px solid ${theme.borderStrong}`, background: '#fff',
                                color: theme.text, fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none',
                            }}
                        />
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: theme.textMuted }}>
                        {t('designs.count', { shown: filtered.length, total: completed.length })}
                    </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={th}>{t('designs.colDesign')}</th>
                                <th style={th}>{t('designs.colType')}</th>
                                <th style={th}>{t('designs.colApproved')}</th>
                                <th style={{ ...th, textAlign: 'center' }}>{t('designs.colDownloads')}</th>
                                <th style={{ ...th, textAlign: 'right' }}>{t('designs.colActions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(d => (
                                <tr key={d.id} data-completed-row={d.id}>
                                    <td style={td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                            <CheckCircle2 size={16} color={theme.green} style={{ flexShrink: 0 }} />
                                            <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{d.name}</span>
                                            <Lock size={12} color={theme.textSubtle} style={{ flexShrink: 0 }} />
                                        </div>
                                        {d.license_tax_id && (
                                            <div data-license-tax-id style={{ fontSize: '11px', color: theme.textMuted, marginTop: '2px', paddingLeft: '24px' }}>
                                                {t('designs.licensed', { kind: d.license_tax_id.length === 11 ? 'TCKN' : 'VKN', id: d.license_tax_id })}
                                            </div>
                                        )}
                                    </td>
                                    <td style={td}>{moduleLabel(d.module_id)}</td>
                                    <td style={{ ...td, whiteSpace: 'nowrap', color: theme.textMuted }}>{formatDate(d.paid_at ?? d.updated_at, true)}</td>
                                    <td style={{ ...td, textAlign: 'center', color: theme.textMuted }}>{d.download_count ?? 0}</td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                            <button type="button" data-preview-design={d.id} onClick={() => setPreview(d)} style={ghostBtn}>
                                                <Eye size={13} /> {t('designs.preview')}
                                            </button>
                                            <button type="button" data-download-design={d.id} onClick={() => downloadDesign(d)} style={btn(theme.green)}>
                                                <Download size={13} /> {t('designs.download')}
                                            </button>
                                            <button
                                                type="button"
                                                title={t('common.delete')}
                                                onClick={() => remove(d)}
                                                style={{ background: 'transparent', border: 'none', color: theme.textSubtle, cursor: 'pointer', padding: 4 }}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!rows.length && (
                                <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: theme.textSubtle, padding: '20px' }}>{t('designs.noMatch')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {pageCount > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', padding: '8px 12px', fontSize: '0.8rem', color: theme.textMuted }}>
                        <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} style={{ ...ghostBtn, opacity: current === 0 ? 0.4 : 1 }}>
                            <ChevronLeft size={13} />
                        </button>
                        <span>{current + 1} / {pageCount}</span>
                        <button type="button" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)} style={{ ...ghostBtn, opacity: current >= pageCount - 1 ? 0.4 : 1 }}>
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
    const { t } = useLocaleT();
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
                    if (!docType) throw new Error(i18n.t('designs.noSample'));
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
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{ width: 'min(1000px, 100%)', height: 'min(90vh, 1200px)', display: 'flex', flexDirection: 'column', background: theme.surface, borderRadius: '20px', border: `1px solid ${theme.border}`, boxShadow: theme.shadowLg, overflow: 'hidden' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <Eye size={18} color={theme.primary} />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{design.name}</div>
                        <div style={{ fontSize: '0.75rem', color: theme.textMuted }}>
                            {moduleLabel(design.module_id)} · {usesSample ? t('designs.withSample') : t('designs.withSaved')}
                        </div>
                    </div>
                    <button type="button" onClick={() => downloadDesign(design)} style={{ ...btn(theme.green), marginLeft: 'auto' }}>
                        <Download size={13} /> {t('designs.download')}
                    </button>
                    <button type="button" title={t('common.close')} data-preview-close onClick={onClose} style={{ background: 'transparent', border: 'none', color: theme.textSubtle, cursor: 'pointer', padding: 4 }}>
                        <X size={18} />
                    </button>
                </div>
                <div style={{ flex: 1, background: '#fff', position: 'relative', borderTop: `1px solid ${theme.border}` }}>
                    {html && <iframe title={t('designs.frameTitle')} srcDoc={html} sandbox="allow-same-origin" style={{ width: '100%', height: '100%', border: 0 }} />}
                    {!html && !error && <div style={{ padding: 24, color: theme.textMuted }}>{t('designs.preparing')}</div>}
                    {error && <div style={{ padding: 24, color: theme.redText }}>{t('designs.previewFailed', { error })}</div>}
                </div>
            </div>
        </div>
    );
};
