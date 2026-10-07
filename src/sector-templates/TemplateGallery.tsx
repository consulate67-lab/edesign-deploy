import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutTemplate, Search, Eye, X, Download, ArrowRight, Loader2, Code2, FileText, ChevronRight } from 'lucide-react';
import { SECTOR_TEMPLATES, SECTORS, CATEGORIES, type CategoryId, type SectorId, type SectorTemplate } from './index';
import { WIZARD_DOC_TYPES, loadXmlFile } from '../wizard/docTypes';
import { stripLeadingBom } from '../xslt-editor/utils/testWatermark';
import { transformXmlWithXslt } from '../xsltTransformer';

type UseHandler = (moduleId?: string, initialXslt?: string, docName?: string, xml?: string) => void;

/** A4 genişliği (96 dpi); küçük önizleme bu genişlikte çizilip ölçeklenir. */
const PAGE_W = 794;
const THUMB_H = 240;
const THUMB_CSS = 'html,body{overflow:hidden!important;}';

const SECTOR_BY_ID = new Map(SECTORS.map(s => [s.id, s]));
const CATEGORY_BY_ID = new Map(CATEGORIES.map(c => [c.id, c]));
const docTypeOf = (id: string) => WIZARD_DOC_TYPES.find(d => d.id === id);
const lower = (s: string) => s.toLocaleLowerCase('tr-TR');

const textCache = new Map<string, Promise<string>>();
const htmlCache = new Map<string, Promise<string>>();
let renderChain: Promise<unknown> = Promise.resolve();

// Vite dev sunucusu olmayan public dosyası için index.html döndürür; bu da hata sayılır.
const loadText = (path: string): Promise<string> => {
    let p = textCache.get(path);
    if (!p) {
        p = loadXmlFile(path).then(raw => {
            const text = stripLeadingBom(raw);
            if (!text.trim().startsWith('<') || /^\s*<!doctype html/i.test(text)) {
                throw new Error(`Şablon dosyası bulunamadı: ${path.split('/').pop()}`);
            }
            return text;
        });
        p.catch(() => textCache.delete(path));
        textCache.set(path, p);
    }
    return p;
};

const loadPair = async (t: SectorTemplate) => {
    const [xslt, xml] = await Promise.all([loadText(t.xslt), loadText(t.xml)]);
    return { xslt, xml };
};

/** Dönüşümler sırayla ve araya boşluk bırakılarak yapılır; çok kart aynı anda görünürken arayüz donmasın. */
const renderHtml = (t: SectorTemplate): Promise<string> => {
    let p = htmlCache.get(t.id);
    if (!p) {
        p = loadPair(t).then(({ xslt, xml }) => {
            const job = renderChain.then(() => new Promise<string>(resolve => {
                setTimeout(() => resolve(transformXmlWithXslt(xml, xslt)), 0);
            }));
            renderChain = job.catch(() => undefined);
            return job;
        });
        p.catch(() => htmlCache.delete(t.id));
        htmlCache.set(t.id, p);
    }
    return p;
};

const withCss = (html: string, css: string) => {
    const tag = `<style>${css}</style>`;
    return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + tag) : tag + html;
};

const downloadText = (text: string, fileName: string) => {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/xml;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
};

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

const btn = (bg: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9,
    border: 'none', cursor: 'pointer', background: bg, color: 'white', fontWeight: 700, fontSize: '0.8rem',
    fontFamily: 'inherit', whiteSpace: 'nowrap',
});

const SectorChip: React.FC<{ sector: SectorId }> = ({ sector }) => {
    const s = SECTOR_BY_ID.get(sector);
    const color = s?.color ?? '#64748b';
    return (
        <span title={s?.label ?? sector} style={{
            display: 'inline-block', padding: '3px 9px', borderRadius: 999, flexShrink: 1, minWidth: 0,
            background: `${color}e6`, color: 'white', fontSize: '0.68rem', fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
            {s?.label ?? sector}
        </span>
    );
};

const DocBadge: React.FC<{ docTypeId: string }> = ({ docTypeId }) => {
    const d = docTypeOf(docTypeId);
    const color = d?.color ?? '#64748b';
    return (
        <span title={d?.label ?? docTypeId} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, flexShrink: 0, maxWidth: '70%',
            background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${color}`, color: 'white',
            fontSize: '0.66rem', fontWeight: 800, letterSpacing: 0.3, whiteSpace: 'nowrap',
        }}>
            <FileText size={11} color={color} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{d?.label ?? docTypeId}</span>
        </span>
    );
};

const Tags: React.FC<{ tags: string[]; color: string }> = ({ tags, color }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {tags.map(tag => (
            <span key={tag} style={{
                padding: '2px 8px', borderRadius: 999, fontSize: '0.66rem', fontWeight: 600,
                background: `${color}1f`, border: `1px solid ${color}40`, color: '#cbd5e1',
            }}>
                {tag}
            </span>
        ))}
    </div>
);

/** Kart görünür olunca şablonu örnek XML'iyle çizer; iframe A4 genişliğinde render edilip karta sığacak şekilde küçültülür. */
const Thumbnail: React.FC<{ t: SectorTemplate }> = ({ t }) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [width, setWidth] = useState(300);
    const [html, setHtml] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const el = boxRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width || 300));
        ro.observe(el);
        const io = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) {
                setVisible(true);
                io.disconnect();
            }
        }, { root: el.closest('[data-selection-scroll]'), rootMargin: '300px 0px' });
        io.observe(el);
        return () => { ro.disconnect(); io.disconnect(); };
    }, []);

    useEffect(() => {
        if (!visible) return;
        let alive = true;
        renderHtml(t)
            .then(h => { if (alive) setHtml(withCss(h, THUMB_CSS)); })
            .catch(() => { if (alive) setFailed(true); });
        return () => { alive = false; };
    }, [visible, t]);

    const scale = width / PAGE_W;
    return (
        <div ref={boxRef} data-template-thumb={t.id} style={{ position: 'relative', height: THUMB_H, overflow: 'hidden', background: '#fff' }}>
            {html && (
                <iframe
                    title={`${t.name} önizleme`}
                    srcDoc={html}
                    sandbox="allow-scripts"
                    tabIndex={-1}
                    aria-hidden
                    style={{
                        position: 'absolute', top: 0, left: 0, width: PAGE_W, height: THUMB_H / scale, border: 0,
                        transform: `scale(${scale})`, transformOrigin: '0 0', pointerEvents: 'none',
                        animation: 'fadeIn 0.4s ease-out',
                    }}
                />
            )}
            {!html && !failed && (
                <div style={{ position: 'absolute', inset: 0, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[60, 90, 75, 85, 40].map((w, i) => (
                        <div key={i} className="tg-shimmer" style={{ height: i === 0 ? 18 : 10, width: `${w}%`, borderRadius: 4 }} />
                    ))}
                </div>
            )}
            {failed && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12 }}>
                    Önizleme yüklenemedi
                </div>
            )}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 56, background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(15,23,42,0.55) 100%)', pointerEvents: 'none' }} />
        </div>
    );
};

const TemplateCard: React.FC<{
    t: SectorTemplate;
    busy: boolean;
    error?: string;
    onPreview: () => void;
    onUse: () => void;
}> = ({ t, busy, error, onPreview, onUse }) => {
    const [hover, setHover] = useState(false);
    const sectorColor = SECTOR_BY_ID.get(t.sector)?.color ?? t.accent;
    return (
        <div
            data-template-card={t.id}
            role="button"
            tabIndex={0}
            title="Bu şablonla tasarım ekranını aç"
            onClick={onUse}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onUse(); } }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: busy ? 'progress' : 'pointer',
                background: 'rgba(30, 41, 59, 0.55)', borderRadius: 16,
                border: `1px solid ${hover ? `${t.accent}aa` : 'rgba(148, 163, 184, 0.16)'}`,
                transform: hover ? 'translateY(-3px)' : 'none',
                boxShadow: hover ? `0 16px 36px ${t.accent}33` : '0 6px 18px rgba(0,0,0,0.2)',
                transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
                animation: 'fadeIn 0.3s ease-out',
            }}
        >
            <div style={{ height: 4, background: `linear-gradient(90deg, ${t.accent}, ${sectorColor})` }} />
            <div style={{ position: 'relative' }}>
                <Thumbnail t={t} />
                <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', gap: 6, pointerEvents: 'none' }}>
                    <SectorChip sector={t.sector} />
                    <DocBadge docTypeId={t.docTypeId} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 16px 14px', flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#f1f5f9', lineHeight: 1.3 }}>{t.name}</div>
                <div style={{
                    fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {t.description}
                </div>
                {t.tags.length > 0 && <Tags tags={t.tags} color={t.accent} />}
                {error && <div data-template-error={t.id} style={{ color: '#fca5a5', fontSize: '0.75rem' }}>{error}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
                    <button
                        type="button"
                        data-template-preview={t.id}
                        onClick={e => { e.stopPropagation(); onPreview(); }}
                        style={btn('#334155')}
                    >
                        <Eye size={14} /> Önizle
                    </button>
                    <button
                        type="button"
                        data-template-use={t.id}
                        disabled={busy}
                        onClick={e => { e.stopPropagation(); onUse(); }}
                        style={{ ...btn(`linear-gradient(135deg, ${t.accent}, ${sectorColor})`), marginLeft: 'auto', opacity: busy ? 0.7 : 1 }}
                    >
                        {busy ? <Loader2 size={14} className="tg-spin" /> : <ArrowRight size={14} />} Tasarla
                    </button>
                </div>
            </div>
            {busy && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(3px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                    color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 700,
                }}>
                    <Loader2 size={28} className="tg-spin" color={t.accent} />
                    Tasarım ekranı açılıyor…
                </div>
            )}
        </div>
    );
};

const TemplateModal: React.FC<{
    t: SectorTemplate;
    busy: boolean;
    error?: string;
    onClose: () => void;
    onUse: () => void;
}> = ({ t, busy, error, onClose, onUse }) => {
    const [tab, setTab] = useState<'preview' | 'xml'>('preview');
    const [html, setHtml] = useState<string | null>(null);
    const [xml, setXml] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const sectorColor = SECTOR_BY_ID.get(t.sector)?.color ?? t.accent;

    useEffect(() => {
        let alive = true;
        renderHtml(t).then(h => { if (alive) setHtml(h); }).catch(e => { if (alive) setLoadError(errorText(e)); });
        loadText(t.xml).then(x => { if (alive) setXml(x); }).catch(e => { if (alive) setLoadError(errorText(e)); });
        return () => { alive = false; };
    }, [t]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const tabBtn = (id: 'preview' | 'xml', label: React.ReactNode) => (
        <button
            type="button"
            data-template-tab={id}
            onClick={() => setTab(id)}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9,
                border: `1px solid ${tab === id ? `${t.accent}99` : 'transparent'}`, fontFamily: 'inherit',
                background: tab === id ? `${t.accent}26` : 'transparent', color: tab === id ? '#f1f5f9' : '#94a3b8',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
            }}
        >
            {label}
        </button>
    );

    return (
        <div
            data-template-modal={t.id}
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(2, 6, 23, 0.78)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 0.2s ease-out',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: 'min(1180px, 100%)', height: 'min(92vh, 1200px)', display: 'flex', flexDirection: 'column',
                    background: '#0f172a', borderRadius: 18, border: '1px solid rgba(148, 163, 184, 0.22)', overflow: 'hidden',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.6)', animation: 'modalEnter 0.25s ease-out',
                }}
            >
                <div style={{ height: 4, background: `linear-gradient(90deg, ${t.accent}, ${sectorColor})`, flexShrink: 0 }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px 12px' }}>
                    <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <SectorChip sector={t.sector} />
                            <DocBadge docTypeId={t.docTypeId} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>{t.name}</h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>{t.description}</p>
                        {t.tags.length > 0 && <Tags tags={t.tags} color={t.accent} />}
                    </div>
                    <button
                        type="button"
                        title="Kapat (Esc)"
                        data-template-modal-close
                        onClick={onClose}
                        style={{
                            background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: 999,
                            width: 34, height: 34, color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}
                    >
                        <X size={17} />
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderTop: '1px solid rgba(148, 163, 184, 0.14)', borderBottom: '1px solid rgba(148, 163, 184, 0.14)', flexWrap: 'wrap' }}>
                    {tabBtn('preview', <><Eye size={14} /> Önizleme</>)}
                    {tabBtn('xml', <><Code2 size={14} /> Örnek XML</>)}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {error && <span style={{ color: '#fca5a5', fontSize: '0.78rem' }}>{error}</span>}
                        {tab === 'xml' && (
                            <button
                                type="button"
                                data-template-download-xml={t.id}
                                disabled={!xml}
                                onClick={() => xml && downloadText(xml, `${t.id}.xml`)}
                                style={{ ...btn('#334155'), opacity: xml ? 1 : 0.5 }}
                            >
                                <Download size={14} /> XML&apos;i indir
                            </button>
                        )}
                        <button
                            type="button"
                            data-template-use={t.id}
                            disabled={busy}
                            onClick={onUse}
                            style={{ ...btn(`linear-gradient(135deg, ${t.accent}, ${sectorColor})`), padding: '8px 16px', fontSize: '0.85rem', boxShadow: `0 6px 18px ${t.accent}44` }}
                        >
                            {busy ? <Loader2 size={15} className="tg-spin" /> : <ArrowRight size={15} />} Bu şablonla tasarla
                        </button>
                    </div>
                </div>
                <div style={{ flex: 1, minHeight: 0, position: 'relative', background: tab === 'preview' ? '#e2e8f0' : '#020617' }}>
                    {loadError && (
                        <div style={{ padding: 24, color: tab === 'preview' ? '#b91c1c' : '#fca5a5' }}>Şablon yüklenemedi: {loadError}</div>
                    )}
                    {!loadError && tab === 'preview' && (html
                        ? <iframe data-template-modal-preview title={`${t.name} önizleme`} srcDoc={html} sandbox="allow-scripts" style={{ width: '100%', height: '100%', border: 0, background: '#fff' }} />
                        : <div style={{ padding: 24, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}><Loader2 size={16} className="tg-spin" /> Önizleme hazırlanıyor…</div>
                    )}
                    {!loadError && tab === 'xml' && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '8px 16px', fontSize: '0.75rem', color: '#64748b', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                                {t.xml.split('/').pop()}
                                {xml && ` · ${xml.split('\n').length} satır · ${(new Blob([xml]).size / 1024).toFixed(1)} KB`}
                                {' · '}Önizlemede kullanılan örnek veri; tasarım ekranında kendi XML&apos;inizle değiştirebilirsiniz.
                            </div>
                            <pre data-template-xml style={{
                                flex: 1, margin: 0, overflow: 'auto', padding: 16, fontSize: 12, lineHeight: 1.5,
                                fontFamily: 'Consolas, "Cascadia Code", Menlo, monospace', color: '#a5b4fc', whiteSpace: 'pre',
                            }}>
                                {xml ?? 'Yükleniyor…'}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface DocNode { id: string; label: string; color: string; count: number }
interface SectorNode { id: SectorId; label: string; color: string; count: number; docs: DocNode[] }
interface CategoryNode { id: CategoryId; label: string; color: string; count: number; sectors: SectorNode[] }

/** Boş alanlar "hepsi" demektir; sektör seçiliyse kategori de onunkidir. */
interface TreeSelection { category?: CategoryId; sector?: SectorId; docType?: string }

const matchesQuery = (t: SectorTemplate, q: string) => {
    if (!q) return true;
    const s = SECTOR_BY_ID.get(t.sector);
    const hay = [t.name, t.description, ...t.tags, s?.label ?? '', CATEGORY_BY_ID.get(s?.category as CategoryId)?.label ?? '', docTypeOf(t.docTypeId)?.label ?? ''].join(' ');
    return lower(hay).includes(q);
};

const docNodes = (items: SectorTemplate[]): DocNode[] => [...new Set(items.map(t => t.docTypeId))].map(id => {
    const d = docTypeOf(id);
    return { id, label: d?.label ?? id, color: d?.color ?? '#64748b', count: items.filter(t => t.docTypeId === id).length };
});

const buildTree = (items: SectorTemplate[]): CategoryNode[] => CATEGORIES.flatMap(c => {
    const sectors = SECTORS.filter(s => s.category === c.id).flatMap(s => {
        const own = items.filter(t => t.sector === s.id);
        return own.length ? [{ id: s.id, label: s.label, color: s.color, count: own.length, docs: docNodes(own) }] : [];
    });
    const count = sectors.reduce((n, s) => n + s.count, 0);
    return count ? [{ id: c.id, label: c.label, color: c.color, count, sectors }] : [];
});

const Chevron: React.FC<{ open: boolean; onClick: () => void; attr: Record<string, string> }> = ({ open, onClick, attr }) => (
    <button type="button" {...attr} aria-label={open ? 'Daralt' : 'Genişlet'} onClick={onClick}
        style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#64748b', display: 'flex', flexShrink: 0 }}>
        <ChevronRight size={14} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
    </button>
);

const SectorTree: React.FC<{
    tree: CategoryNode[];
    total: number;
    sel: TreeSelection;
    openCategories: Set<CategoryId>;
    openSectors: Set<SectorId>;
    onSelect: (sel: TreeSelection) => void;
    onToggleCategory: (id: CategoryId) => void;
    onToggleSector: (id: SectorId) => void;
}> = ({ tree, total, sel, openCategories, openSectors, onSelect, onToggleCategory, onToggleSector }) => {
    const row = (active: boolean, color: string): React.CSSProperties => ({
        display: 'flex', alignItems: 'center', gap: 8, width: '100%', minWidth: 0, boxSizing: 'border-box', textAlign: 'left',
        padding: '6px 9px', borderRadius: 9, border: 'none', fontFamily: 'inherit', cursor: 'pointer',
        background: active ? `${color}2e` : 'transparent', color: active ? '#f8fafc' : '#cbd5e1',
        boxShadow: active ? `inset 3px 0 0 ${color}` : 'none', fontSize: '0.8rem', fontWeight: 700,
        transition: 'background 0.15s',
    });
    const count = (n: number, active: boolean, color: string) => (
        <span style={{
            marginLeft: 'auto', fontSize: '0.66rem', padding: '1px 7px', borderRadius: 999, flexShrink: 0,
            background: active ? color : 'rgba(148, 163, 184, 0.14)', color: active ? 'white' : '#94a3b8',
        }}>
            {n}
        </span>
    );
    const ellipsis: React.CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
    const branch = (color: string): React.CSSProperties => ({
        display: 'flex', flexDirection: 'column', gap: 1, margin: '1px 0 4px 13px', paddingLeft: 8, borderLeft: `1px dashed ${color}55`,
    });
    const isAll = !sel.category && !sel.sector;

    return (
        <nav data-sector-tree role="tree" aria-label="Firma kategorileri ve sektörler" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button type="button" role="treeitem" data-sector-chip="all" aria-selected={isAll}
                onClick={() => onSelect({})} style={row(isAll, '#6366f1')}>
                <LayoutTemplate size={14} color="#a5b4fc" style={{ flexShrink: 0 }} />
                Tüm şablonlar
                {count(total, isAll, '#6366f1')}
            </button>
            <div style={{ height: 1, background: 'rgba(148, 163, 184, 0.12)', margin: '6px 4px' }} />
            {tree.map(c => {
                const catOpen = openCategories.has(c.id);
                const catActive = sel.category === c.id && !sel.sector;
                return (
                    <div key={c.id} role="treeitem" aria-expanded={catOpen} aria-selected={catActive} style={{ marginBottom: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Chevron open={catOpen} onClick={() => onToggleCategory(c.id)} attr={{ 'data-category-toggle': c.id }} />
                            <button type="button" data-category-node={c.id} title={c.label} onClick={() => onSelect({ category: c.id })}
                                style={{ ...row(catActive, c.color), paddingLeft: 4, fontSize: '0.84rem', fontWeight: 800, color: catActive ? '#f8fafc' : '#e2e8f0' }}>
                                <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                                <span style={ellipsis}>{c.label}</span>
                                {count(c.count, catActive, c.color)}
                            </button>
                        </div>
                        {catOpen && (
                            <div role="group" style={branch(c.color)}>
                                {c.sectors.map(s => {
                                    const open = openSectors.has(s.id);
                                    const active = sel.sector === s.id && !sel.docType;
                                    return (
                                        <div key={s.id} role="treeitem" aria-expanded={open} aria-selected={active}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <Chevron open={open} onClick={() => onToggleSector(s.id)} attr={{ 'data-sector-toggle': s.id }} />
                                                <button type="button" data-sector-chip={s.id} title={s.label}
                                                    onClick={() => onSelect({ category: c.id, sector: s.id })} style={{ ...row(active, s.color), paddingLeft: 4 }}>
                                                    <span style={{ width: 8, height: 8, borderRadius: 999, background: s.color, flexShrink: 0 }} />
                                                    <span style={ellipsis}>{s.label}</span>
                                                    {count(s.count, active, s.color)}
                                                </button>
                                            </div>
                                            {open && (
                                                <div role="group" style={branch(s.color)}>
                                                    {s.docs.map(d => {
                                                        const docActive = sel.sector === s.id && sel.docType === d.id;
                                                        return (
                                                            <button key={d.id} type="button" role="treeitem" aria-selected={docActive}
                                                                data-doc-node={`${s.id}:${d.id}`}
                                                                title={`${s.label} › ${d.label}`}
                                                                onClick={() => onSelect({ category: c.id, sector: s.id, docType: d.id })}
                                                                style={{ ...row(docActive, d.color), padding: '4px 8px', fontSize: '0.74rem', fontWeight: 600 }}>
                                                                <FileText size={12} color={d.color} style={{ flexShrink: 0 }} />
                                                                <span style={ellipsis}>{d.label}</span>
                                                                {count(d.count, docActive, d.color)}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
};

const toggled = <T,>(set: Set<T>, id: T) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
};

/**
 * Sektöre göre hazır tasarım galerisi: solda Kategori › Sektör › Belge türü
 * ağacı + arama, canlı küçük önizlemeli kartlar, büyük önizleme / örnek XML
 * penceresi. Seçilen şablon örnek XML'iyle birlikte tasarım ekranında açılır.
 */
export const TemplateGallery: React.FC<{ onUse?: UseHandler }> = ({ onUse }) => {
    const [sel, setSel] = useState<TreeSelection>({});
    const [openCategories, setOpenCategories] = useState<Set<CategoryId>>(() => new Set());
    const [openSectors, setOpenSectors] = useState<Set<SectorId>>(() => new Set());
    const [query, setQuery] = useState('');
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const q = lower(query.trim());
    const searched = useMemo(() => SECTOR_TEMPLATES.filter(t => matchesQuery(t, q)), [q]);
    const tree = useMemo(() => buildTree(searched), [searched]);

    const filtered = useMemo(() => searched.filter(t => {
        if (sel.sector) return t.sector === sel.sector && (!sel.docType || t.docTypeId === sel.docType);
        if (sel.category) return SECTOR_BY_ID.get(t.sector)?.category === sel.category;
        return true;
    }), [searched, sel]);

    const selectNode = (next: TreeSelection) => {
        setSel(next);
        if (next.category) setOpenCategories(prev => new Set(prev).add(next.category as CategoryId));
        if (next.sector && !next.docType) setOpenSectors(prev => new Set(prev).add(next.sector as SectorId));
    };
    const viewCategories = q ? new Set(tree.map(c => c.id)) : openCategories;
    const viewSectors = q ? new Set(tree.flatMap(c => c.sectors.map(s => s.id))) : openSectors;

    const previewTemplate = previewId ? SECTOR_TEMPLATES.find(t => t.id === previewId) ?? null : null;

    const openTemplate = async (t: SectorTemplate) => {
        if (busyId) return;
        setBusyId(t.id);
        setErrors(prev => {
            const next = { ...prev };
            delete next[t.id];
            return next;
        });
        try {
            const { xslt, xml } = await loadPair(t);
            onUse?.(t.moduleId, xslt, t.name, xml);
        } catch (e) {
            setErrors(prev => ({ ...prev, [t.id]: errorText(e) }));
        } finally {
            setBusyId(null);
        }
    };

    if (!SECTOR_TEMPLATES.length) return null;

    const crumbs = [
        { label: 'Tüm şablonlar', sel: {} as TreeSelection },
        ...(sel.category ? [{ label: CATEGORY_BY_ID.get(sel.category)?.label ?? sel.category, sel: { category: sel.category } }] : []),
        ...(sel.sector ? [{ label: SECTOR_BY_ID.get(sel.sector)?.label ?? sel.sector, sel: { category: sel.category, sector: sel.sector } }] : []),
        ...(sel.docType ? [{ label: docTypeOf(sel.docType)?.label ?? sel.docType, sel }] : []),
    ];

    return (
        <section data-template-gallery style={{
            width: '100%', marginBottom: '2rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: '28px 28px 26px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', color: 'white', boxSizing: 'border-box',
        }}>
            <style>{`
                @keyframes tg-spin { to { transform: rotate(360deg); } }
                .tg-spin { animation: tg-spin 0.9s linear infinite; }
                @keyframes tg-shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
                .tg-shimmer { background: linear-gradient(90deg, #e2e8f0 0px, #f1f5f9 80px, #e2e8f0 160px); background-size: 400px 100%; animation: tg-shimmer 1.2s linear infinite; }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
                <div style={{
                    width: 46, height: 46, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f97316, #ec4899 50%, #6366f1)', boxShadow: '0 10px 24px rgba(236, 72, 153, 0.3)',
                }}>
                    <LayoutTemplate size={24} color="white" />
                </div>
                <div style={{ flex: '1 1 380px', minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Sektörünüze Hazır Şablonlar</h2>
                    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14, lineHeight: 1.5 }}>
                        Firma kategorinizi ve sektörünüzü seçin; o sektörün kullandığı belgeler için hazır tasarımı önizleyip tek tıkla tasarım ekranında açın.
                    </p>
                </div>
                <div style={{ position: 'relative', flex: '0 1 260px', alignSelf: 'center' }}>
                    <Search size={14} color="#64748b" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        data-template-search
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Şablon, belge türü veya etiket ara"
                        style={{
                            width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 32px', borderRadius: 10,
                            border: '1px solid rgba(148, 163, 184, 0.25)', background: 'rgba(15, 23, 42, 0.7)',
                            color: '#f1f5f9', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none',
                        }}
                    />
                </div>
            </div>

            <div data-template-layout style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <aside style={{
                    flex: '0 0 284px', position: 'sticky', top: 12, maxHeight: 'calc(100vh - 24px)', overflowY: 'auto',
                    padding: 8, borderRadius: 14, background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(148, 163, 184, 0.12)',
                    boxSizing: 'border-box',
                }}>
                    <SectorTree
                        tree={tree}
                        total={searched.length}
                        sel={sel}
                        openCategories={viewCategories}
                        openSectors={viewSectors}
                        onSelect={selectNode}
                        onToggleCategory={id => setOpenCategories(prev => toggled(prev, id))}
                        onToggleSector={id => setOpenSectors(prev => toggled(prev, id))}
                    />
                </aside>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div data-template-breadcrumb style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: '0.82rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                        {crumbs.map((c, i) => {
                            const last = i === crumbs.length - 1;
                            return (
                                <React.Fragment key={i}>
                                    {i > 0 && <ChevronRight size={13} />}
                                    <button type="button" disabled={last} onClick={() => selectNode(c.sel)} style={{
                                        background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 700,
                                        color: last ? '#f1f5f9' : '#94a3b8', cursor: last ? 'default' : 'pointer',
                                    }}>
                                        {c.label}
                                    </button>
                                </React.Fragment>
                            );
                        })}
                        <span style={{ marginLeft: 'auto' }}>{filtered.length} şablon</span>
                    </div>
                    {filtered.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(196px, 1fr))', gap: 14 }}>
                            {filtered.map(t => (
                                <TemplateCard
                                    key={t.id}
                                    t={t}
                                    busy={busyId === t.id}
                                    error={errors[t.id]}
                                    onPreview={() => setPreviewId(t.id)}
                                    onUse={() => openTemplate(t)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '28px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                            Aramanıza uyan şablon yok.{' '}
                            <button
                                type="button"
                                onClick={() => { setQuery(''); selectNode({}); }}
                                style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}
                            >
                                Filtreleri temizle
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`@media (max-width: 760px) { [data-template-layout] { flex-direction: column; } [data-template-gallery] aside { position: static !important; flex-basis: auto !important; width: 100%; } }`}</style>

            {previewTemplate && (
                <TemplateModal
                    t={previewTemplate}
                    busy={busyId === previewTemplate.id}
                    error={errors[previewTemplate.id]}
                    onClose={() => setPreviewId(null)}
                    onUse={() => openTemplate(previewTemplate)}
                />
            )}
        </section>
    );
};

export default TemplateGallery;
