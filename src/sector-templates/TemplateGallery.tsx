import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutTemplate, Search, Eye, X, Download, ArrowRight, Loader2, Code2, FileText, ChevronDown, Check, Building2, RotateCcw } from 'lucide-react';
import { SECTOR_TEMPLATES, SECTORS, CATEGORIES, cachedDbTemplates, loadDbTemplates, type CategoryId, type SectorId, type SectorTemplate } from './index';
import { WIZARD_DOC_TYPES, loadXmlFile } from '../wizard/docTypes';
import { stripLeadingBom } from '../xslt-editor/utils/testWatermark';
import { transformXmlWithXslt } from '../xsltTransformer';
import { theme } from '../theme';

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

const loadXml = (t: SectorTemplate) => (t.inline ? Promise.resolve(stripLeadingBom(t.inline.xml)) : loadText(t.xml));

const loadPair = async (t: SectorTemplate) => {
    if (t.inline) return { xslt: stripLeadingBom(t.inline.xslt), xml: stripLeadingBom(t.inline.xml) };
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

const secondaryBtn: React.CSSProperties = {
    ...btn(theme.surface), color: theme.text, border: `1px solid ${theme.borderStrong}`, boxShadow: theme.shadowSm,
};

const SectorChip: React.FC<{ sector: SectorId }> = ({ sector }) => {
    const s = SECTOR_BY_ID.get(sector);
    const color = s?.color ?? '#64748b';
    return (
        <span title={s?.label ?? sector} style={{
            display: 'inline-block', padding: '3px 9px', borderRadius: 999, flexShrink: 1, minWidth: 0,
            background: `${color}e6`, color: 'white', fontSize: '0.68rem', fontWeight: 700,
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.18)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
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
            background: 'rgba(255, 255, 255, 0.94)', border: `1px solid ${color}`, color: theme.text,
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
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
                background: `${color}1f`, border: `1px solid ${color}40`, color: theme.textMuted,
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
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSubtle, fontSize: 12 }}>
                    Önizleme yüklenemedi
                </div>
            )}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 56, background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(15,23,42,0.12) 100%)', pointerEvents: 'none' }} />
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
                background: theme.surface, borderRadius: 16,
                border: `1px solid ${hover ? `${t.accent}aa` : theme.border}`,
                transform: hover ? 'translateY(-3px)' : 'none',
                boxShadow: hover ? `0 16px 36px ${t.accent}2e, ${theme.shadow}` : theme.shadowSm,
                transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
                animation: 'fadeIn 0.3s ease-out',
            }}
        >
            <div style={{ height: 4, background: `linear-gradient(90deg, ${t.accent}, ${sectorColor})` }} />
            <div style={{ position: 'relative', borderBottom: `1px solid ${theme.border}` }}>
                <Thumbnail t={t} />
                <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', gap: 6, pointerEvents: 'none' }}>
                    <SectorChip sector={t.sector} />
                    <DocBadge docTypeId={t.docTypeId} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 16px 14px', flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: theme.text, lineHeight: 1.3 }}>
                    {t.source === 'admin' && (
                        <span data-template-new style={{
                            display: 'inline-block', verticalAlign: 2, marginRight: 6, padding: '1px 7px', borderRadius: 999,
                            background: 'linear-gradient(135deg, #f97316, #ec4899)', color: 'white', fontSize: '0.62rem', fontWeight: 800, letterSpacing: 0.3,
                        }}>
                            Yeni
                        </span>
                    )}
                    {t.name}
                </div>
                <div style={{
                    fontSize: '0.78rem', color: theme.textMuted, lineHeight: 1.45,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {t.description}
                </div>
                {t.tags.length > 0 && <Tags tags={t.tags} color={t.accent} />}
                {error && <div data-template-error={t.id} style={{ color: theme.redText, fontSize: '0.75rem' }}>{error}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
                    <button
                        type="button"
                        data-template-preview={t.id}
                        onClick={e => { e.stopPropagation(); onPreview(); }}
                        style={secondaryBtn}
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
                    position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.82)', backdropFilter: 'blur(3px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                    color: theme.text, fontSize: '0.85rem', fontWeight: 700,
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
        loadXml(t).then(x => { if (alive) setXml(x); }).catch(e => { if (alive) setLoadError(errorText(e)); });
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
                background: tab === id ? `${t.accent}1f` : 'transparent', color: tab === id ? theme.text : theme.textMuted,
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
                position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 0.2s ease-out',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: 'min(1180px, 100%)', height: 'min(92vh, 1200px)', display: 'flex', flexDirection: 'column',
                    background: theme.surface, borderRadius: 18, border: `1px solid ${theme.border}`, overflow: 'hidden',
                    boxShadow: theme.shadowLg, animation: 'modalEnter 0.25s ease-out',
                }}
            >
                <div style={{ height: 4, background: `linear-gradient(90deg, ${t.accent}, ${sectorColor})`, flexShrink: 0 }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px 12px' }}>
                    <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <SectorChip sector={t.sector} />
                            <DocBadge docTypeId={t.docTypeId} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: theme.text }}>{t.name}</h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: theme.textMuted, lineHeight: 1.5 }}>{t.description}</p>
                        {t.tags.length > 0 && <Tags tags={t.tags} color={t.accent} />}
                    </div>
                    <button
                        type="button"
                        title="Kapat (Esc)"
                        data-template-modal-close
                        onClick={onClose}
                        style={{
                            background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: 999,
                            width: 34, height: 34, color: theme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}
                    >
                        <X size={17} />
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, flexWrap: 'wrap' }}>
                    {tabBtn('preview', <><Eye size={14} /> Önizleme</>)}
                    {tabBtn('xml', <><Code2 size={14} /> Örnek XML</>)}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {error && <span style={{ color: theme.redText, fontSize: '0.78rem' }}>{error}</span>}
                        {tab === 'xml' && (
                            <button
                                type="button"
                                data-template-download-xml={t.id}
                                disabled={!xml}
                                onClick={() => xml && downloadText(xml, `${t.id}.xml`)}
                                style={{ ...secondaryBtn, opacity: xml ? 1 : 0.5 }}
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
                <div style={{ flex: 1, minHeight: 0, position: 'relative', background: tab === 'preview' ? '#e2e8f0' : theme.surfaceAlt }}>
                    {loadError && (
                        <div style={{ padding: 24, color: theme.redText }}>Şablon yüklenemedi: {loadError}</div>
                    )}
                    {!loadError && tab === 'preview' && (html
                        ? <iframe data-template-modal-preview title={`${t.name} önizleme`} srcDoc={html} sandbox="allow-scripts" style={{ width: '100%', height: '100%', border: 0, background: '#fff' }} />
                        : <div style={{ padding: 24, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 8 }}><Loader2 size={16} className="tg-spin" /> Önizleme hazırlanıyor…</div>
                    )}
                    {!loadError && tab === 'xml' && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '8px 16px', fontSize: '0.75rem', color: theme.textSubtle, borderBottom: `1px solid ${theme.border}`, background: theme.surface }}>
                                {t.xml.split('/').pop()}
                                {xml && ` · ${xml.split('\n').length} satır · ${(new Blob([xml]).size / 1024).toFixed(1)} KB`}
                                {' · '}Önizlemede kullanılan örnek veri; tasarım ekranında kendi XML&apos;inizle değiştirebilirsiniz.
                            </div>
                            <pre data-template-xml style={{
                                flex: 1, margin: 0, overflow: 'auto', padding: 16, fontSize: 12, lineHeight: 1.5,
                                fontFamily: 'Consolas, "Cascadia Code", Menlo, monospace', color: theme.primary, whiteSpace: 'pre',
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

interface FilterOption { id: string; label: string; color: string; count: number; depth: 0 | 1 }

const matchesQuery = (t: SectorTemplate, q: string) => {
    if (!q) return true;
    const s = SECTOR_BY_ID.get(t.sector);
    const hay = [t.name, t.description, ...t.tags, s?.label ?? '', CATEGORY_BY_ID.get(s?.category as CategoryId)?.label ?? '', docTypeOf(t.docTypeId)?.label ?? ''].join(' ');
    return lower(hay).includes(q);
};

/** Firma filtresi değeri: '' (tümü), 'c:<kategori>' veya 's:<sektör>'. */
const matchesCompany = (t: SectorTemplate, company: string) => {
    if (!company) return true;
    if (company.startsWith('s:')) return t.sector === company.slice(2);
    return SECTOR_BY_ID.get(t.sector)?.category === company.slice(2);
};

const docOptions = (items: SectorTemplate[]): FilterOption[] => WIZARD_DOC_TYPES.flatMap(d => {
    const count = items.filter(t => t.docTypeId === d.id).length;
    return count ? [{ id: d.id, label: d.label, color: d.color ?? '#64748b', count, depth: 0 as const }] : [];
});

const companyOptions = (items: SectorTemplate[]): FilterOption[] => CATEGORIES.flatMap(c => {
    const sectors = SECTORS.filter(s => s.category === c.id).flatMap(s => {
        const count = items.filter(t => t.sector === s.id).length;
        return count ? [{ id: `s:${s.id}`, label: s.label, color: s.color, count, depth: 1 as const }] : [];
    });
    const count = sectors.reduce((n, s) => n + s.count, 0);
    return count ? [{ id: `c:${c.id}`, label: c.label, color: c.color, count, depth: 0 as const }, ...sectors] : [];
});

const FilterDropdown: React.FC<{
    name: string;
    title: string;
    icon: React.ReactNode;
    value: string;
    options: FilterOption[];
    total: number;
    onChange: (id: string) => void;
}> = ({ name, title, icon, value, options, total, onChange }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const current = options.find(o => o.id === value);
    const accent = current?.color ?? theme.primary;

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onDown);
        window.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
    }, [open]);

    const pick = (id: string) => { onChange(id); setOpen(false); };
    const option = (o: FilterOption | null) => {
        const id = o?.id ?? '';
        const active = id === value;
        const color = o?.color ?? theme.primary;
        return (
            <button key={id || 'all'} type="button" role="option" aria-selected={active} data-filter-option={id || 'all'}
                onClick={() => pick(id)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 9, width: '100%', boxSizing: 'border-box', textAlign: 'left',
                    padding: o?.depth ? '6px 10px 6px 30px' : '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: o?.depth ? '0.78rem' : '0.82rem', fontWeight: o?.depth ? 600 : 800,
                    background: active ? `${color}1f` : 'transparent', color: active ? theme.text : o?.depth ? theme.textMuted : theme.text,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = theme.surfaceAlt; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
                {o
                    ? <span style={{ width: o.depth ? 7 : 10, height: o.depth ? 7 : 10, borderRadius: o.depth ? 999 : 3, background: color, flexShrink: 0 }} />
                    : <LayoutTemplate size={13} color={theme.primary} style={{ flexShrink: 0 }} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o?.label ?? 'Tümü'}</span>
                <span style={{
                    marginLeft: 'auto', fontSize: '0.66rem', padding: '1px 7px', borderRadius: 999, flexShrink: 0,
                    background: active ? color : theme.surfaceAlt, color: active ? 'white' : theme.textSubtle,
                }}>
                    {o?.count ?? total}
                </span>
                {active && <Check size={13} color={theme.text} style={{ flexShrink: 0 }} />}
            </button>
        );
    };

    return (
        <div ref={rootRef} data-filter={name} style={{ position: 'relative', flex: '0 1 auto', minWidth: 0 }}>
            <button
                type="button"
                data-filter-toggle={name}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8, maxWidth: 300, padding: '7px 12px', borderRadius: 999,
                    border: `1px solid ${value ? `${accent}aa` : theme.borderStrong}`,
                    background: value ? `${accent}1a` : theme.surface, color: theme.text,
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', whiteSpace: 'nowrap',
                    boxShadow: open ? `0 0 0 3px ${accent}33` : 'none', transition: 'box-shadow 0.15s, background 0.15s',
                }}
            >
                {icon}
                <span style={{ color: theme.textSubtle, fontWeight: 600 }}>{title}:</span>
                <span data-filter-value={name} style={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis' }}>{current?.label ?? 'Tümü'}</span>
                <ChevronDown size={14} color={theme.textSubtle} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {open && (
                <div role="listbox" aria-label={title} data-filter-menu={name} style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 60, width: 300, maxHeight: 380, overflowY: 'auto',
                    padding: 6, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`,
                    boxShadow: theme.shadowLg, animation: 'fadeIn 0.15s ease-out', boxSizing: 'border-box',
                }}>
                    {option(null)}
                    <div style={{ height: 1, background: theme.border, margin: '4px 6px' }} />
                    {options.length ? options.map(o => option(o)) : (
                        <div style={{ padding: 10, color: theme.textSubtle, fontSize: '0.8rem' }}>Bu filtrelerle eşleşen seçenek yok.</div>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Sektöre göre hazır tasarım galerisi: arama kutusunun yanında Fatura tipi ve
 * Firma kategorisi filtreleri (başta "Tümü"), canlı küçük önizlemeli kartlar,
 * büyük önizleme / örnek XML penceresi. Seçilen şablon örnek XML'iyle birlikte
 * tasarım ekranında açılır.
 */
export const TemplateGallery: React.FC<{ onUse?: UseHandler }> = ({ onUse }) => {
    const [docType, setDocType] = useState('');
    const [company, setCompany] = useState('');
    const [query, setQuery] = useState('');
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [dbTemplates, setDbTemplates] = useState<SectorTemplate[]>(() => cachedDbTemplates() ?? []);

    useEffect(() => {
        let alive = true;
        loadDbTemplates().then(list => { if (alive) setDbTemplates(list); });
        return () => { alive = false; };
    }, []);

    const allTemplates = useMemo(() => [...dbTemplates, ...SECTOR_TEMPLATES], [dbTemplates]);
    const q = lower(query.trim());
    const searched = useMemo(() => allTemplates.filter(t => matchesQuery(t, q)), [allTemplates, q]);
    const byCompany = useMemo(() => searched.filter(t => matchesCompany(t, company)), [searched, company]);
    const byDoc = useMemo(() => searched.filter(t => !docType || t.docTypeId === docType), [searched, docType]);
    const filtered = useMemo(() => byCompany.filter(t => !docType || t.docTypeId === docType), [byCompany, docType]);
    const docOpts = useMemo(() => docOptions(byCompany), [byCompany]);
    const companyOpts = useMemo(() => companyOptions(byDoc), [byDoc]);
    const anyFilter = !!(docType || company || q);
    const clearAll = () => { setDocType(''); setCompany(''); setQuery(''); };

    const previewTemplate = previewId ? allTemplates.find(t => t.id === previewId) ?? null : null;

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

    if (!allTemplates.length) return null;

    return (
        <section data-template-gallery style={{
            width: '100%', marginBottom: '2rem', background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: 24, padding: '28px 28px 26px', boxShadow: theme.shadow, color: theme.text, boxSizing: 'border-box',
        }}>
            <style>{`
                @keyframes tg-spin { to { transform: rotate(360deg); } }
                .tg-spin { animation: tg-spin 0.9s linear infinite; }
                @keyframes tg-shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
                .tg-shimmer { background: linear-gradient(90deg, #e2e8f0 0px, #f1f5f9 80px, #e2e8f0 160px); background-size: 400px 100%; animation: tg-shimmer 1.2s linear infinite; }
                [data-template-search]:focus { border-color: ${theme.primary} !important; box-shadow: ${theme.focusRing}; }
                [data-template-search]::placeholder { color: ${theme.textSubtle}; }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div style={{
                    width: 46, height: 46, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(135deg, #f97316, ${theme.pink} 50%, ${theme.primary})`, boxShadow: '0 10px 24px rgba(236, 72, 153, 0.3)',
                }}>
                    <LayoutTemplate size={24} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Sektörünüze Hazır Şablonlar</h2>
                    <p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: 14, lineHeight: 1.5 }}>
                        Fatura tipini ve firma kategorinizi seçin; hazır tasarımı önizleyip tek tıkla tasarım ekranında açın.
                    </p>
                </div>
            </div>

            <div data-template-toolbar style={{
                display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16, padding: 10,
                borderRadius: 14, background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
            }}>
                <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
                    <Search size={14} color={theme.textSubtle} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        data-template-search
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Şablon, belge türü veya etiket ara"
                        style={{
                            width: '100%', boxSizing: 'border-box', padding: '8px 30px 8px 33px', borderRadius: 999,
                            border: `1px solid ${theme.borderStrong}`, background: '#fff',
                            color: theme.text, fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                    />
                    {query && (
                        <button type="button" aria-label="Aramayı temizle" onClick={() => setQuery('')} style={{
                            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none',
                            color: theme.textSubtle, cursor: 'pointer', display: 'flex', padding: 2,
                        }}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <FilterDropdown
                    name="doc"
                    title="Fatura tipi"
                    icon={<FileText size={14} color={theme.primary} style={{ flexShrink: 0 }} />}
                    value={docType}
                    options={docOpts}
                    total={byCompany.length}
                    onChange={setDocType}
                />
                <FilterDropdown
                    name="company"
                    title="Firma kategorisi"
                    icon={<Building2 size={14} color={theme.primary} style={{ flexShrink: 0 }} />}
                    value={company}
                    options={companyOpts}
                    total={byDoc.length}
                    onChange={setCompany}
                />
                <span data-template-count style={{ marginLeft: 'auto', fontSize: '0.8rem', color: theme.textMuted, whiteSpace: 'nowrap' }}>
                    <b style={{ color: theme.text }}>{filtered.length}</b> şablon
                </span>
                {anyFilter && (
                    <button type="button" data-template-clear onClick={clearAll} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: theme.primary,
                        cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, padding: '4px 2px',
                    }}>
                        <RotateCcw size={13} /> Temizle
                    </button>
                )}
            </div>

            {filtered.length > 0 ? (
                <div data-template-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
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
                <div style={{ padding: '28px 16px', textAlign: 'center', color: theme.textSubtle, fontSize: '0.9rem' }}>
                    Bu filtrelere uyan şablon yok.{' '}
                    <button
                        type="button"
                        onClick={clearAll}
                        style={{ background: 'none', border: 'none', color: theme.primary, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}
                    >
                        Filtreleri temizle
                    </button>
                </div>
            )}

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
