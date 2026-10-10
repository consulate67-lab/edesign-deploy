import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SECTOR_TEMPLATES, SECTORS, hazirPath } from '../sector-templates';
import { transformXmlWithXslt } from '../xsltTransformer';
import { theme } from '../theme';
import { useLocaleT } from '../i18n';

/** A4 genişliği (96 dpi); önizleme bu genişlikte çizilip kutuya sığdırılır. */
const PAGE_W = 794;
const FRAME_CSS = '<style>html,body{overflow:hidden!important;}</style>';

export interface PreviewSource {
    key: string;
    name: string;
    sectorLabel?: string;
    sectorColor?: string;
    /** Galeri satırı yerine gösterilen alt yazı (ör. örnek verinin ülkesi). */
    subtitle?: string;
    /** [XSLT, XML] metinleri. */
    load: () => Promise<[string, string]>;
}

const SECTOR_BY_ID = new Map(SECTORS.map(s => [s.id, s]));

/** Galeride hazır şablonu olmayan türler için resmi / varsayılan görünüm. */
const FALLBACKS: Record<string, { key: string; name: string; xslt: string; xml: string }> = {
    'bilet-rapor': {
        key: 'fb-bilet-rapor', name: 'e-Bilet Raporu Görünümü',
        xslt: 'ebelge/ebilet/ebilet-rapor.xslt', xml: 'ebelge/samples/gib/eBilet-Rapor-Karayolu.xml',
    },
    makbuz: {
        key: 'fb-makbuz-v2', name: 'Profesyonel e-Makbuz',
        xslt: 'ebelge/gib/v2/e-Makbuz-Sablon.xslt', xml: 'ebelge/samples/e-Makbuz-TEMEL.xml',
    },
};

/** Türkiye belge türleri: sektör galerisindeki hazır şablonlar. */
const gallerySources = (docTypeId: string): PreviewSource[] => {
    const fromFiles = (xslt: string, xml: string) => () => Promise.all([loadText(xslt), loadText(xml)]);
    const list: PreviewSource[] = SECTOR_TEMPLATES.filter(t => t.docTypeId === docTypeId).map(t => {
        const s = SECTOR_BY_ID.get(t.sector);
        return {
            key: t.id, name: t.name, sectorLabel: s?.label, sectorColor: s?.color ?? t.accent,
            load: fromFiles(t.xslt || hazirPath(t.id, 'xslt'), t.xml || hazirPath(t.id, 'xml')),
        };
    });
    if (list.length) return list;
    const fb = FALLBACKS[docTypeId];
    return fb ? [{ key: fb.key, name: fb.name, load: fromFiles(fb.xslt, fb.xml) }] : [];
};

const textCache = new Map<string, Promise<string>>();
const loadText = (path: string) => {
    let p = textCache.get(path);
    if (!p) {
        p = fetch(`${import.meta.env.BASE_URL}${path}`).then(r => {
            if (!r.ok) throw new Error(String(r.status));
            return r.text();
        }).then(t => t.replace(/^\uFEFF/, ''));
        p.catch(() => textCache.delete(path));
        textCache.set(path, p);
    }
    return p;
};

const htmlCache = new Map<string, Promise<string>>();
let chain: Promise<unknown> = Promise.resolve();
/** Dönüşümler sırayla ve araya boşluk bırakılarak yapılır; sayfa kaydırması takılmasın. */
const renderSource = (src: PreviewSource): Promise<string> => {
    let p = htmlCache.get(src.key);
    if (!p) {
        p = src.load().then(([xslt, xml]) => {
            const job = chain.then(() => new Promise<string>(resolve => {
                setTimeout(() => resolve(FRAME_CSS + transformXmlWithXslt(xml, xslt)), 30);
            }));
            chain = job.catch(() => undefined);
            return job;
        });
        p.catch(() => htmlCache.delete(src.key));
        htmlCache.set(src.key, p);
    }
    return p;
};

interface Layer { id: number; src: PreviewSource; html: string; shown: boolean; label: string; accent: string }

interface HeroPreviewProps {
    /** WIZARD_DOC_TYPES kimliği. */
    docTypeId: string;
    docLabel: string;
    accent: string;
    /** Aynı türe her gelişte galeriden sıradaki şablon gösterilir. */
    round: number;
    /** Sıradaki türün önizlemesi önceden hazırlanır. */
    nextDocTypeId?: string;
    /** Türün önizleme kaynakları; verilmezse Türkiye galerisi kullanılır. */
    sources?: (docTypeId: string) => PreviewSource[];
    onClick?: () => void;
    onHoverChange?: (hover: boolean) => void;
}

export const HeroPreview: React.FC<HeroPreviewProps> = ({ docTypeId, docLabel, accent, round, nextDocTypeId, sources, onClick, onHoverChange }) => {
    const sourcesFor = sources ?? gallerySources;
    const { t } = useLocaleT();
    const boxRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ w: 440, h: 560 });
    const [layers, setLayers] = useState<Layer[]>([]);
    const layerId = useRef(0);

    const src = useMemo(() => {
        const list = sourcesFor(docTypeId);
        return list.length ? list[round % list.length] : null;
    }, [docTypeId, round, sourcesFor]);

    useEffect(() => {
        const el = boxRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width || 440, h: e.contentRect.height || 560 }));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (!src) return;
        let alive = true;
        renderSource(src).then(html => {
            if (!alive) return;
            const id = ++layerId.current;
            setLayers(ls => [...ls.filter(l => l.shown).slice(-1), { id, src, html, shown: false, label: docLabel, accent }]);
        }).catch(() => undefined);
        return () => { alive = false; };
    }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!nextDocTypeId) return;
        const next = sourcesFor(nextDocTypeId);
        const pick = next.length ? next[(nextDocTypeId === docTypeId ? round + 1 : round) % next.length] : null;
        if (!pick) return;
        const timer = window.setTimeout(() => { renderSource(pick).catch(() => undefined); }, 600);
        return () => window.clearTimeout(timer);
    }, [nextDocTypeId, docTypeId, round, sourcesFor]);

    const reveal = (id: number) => {
        setLayers(ls => ls.map(l => (l.id === id ? { ...l, shown: true } : l)));
        window.setTimeout(() => setLayers(ls => {
            const i = ls.findIndex(l => l.id === id);
            return i > 0 ? ls.slice(i) : ls;
        }), 650);
    };

    const scale = size.w / PAGE_W;
    // Etiket ve renk, görünür hale gelen son katmandan okunur; yeni şablon belirmeden değişmesin.
    const top = [...layers].reverse().find(l => l.shown);
    const current = top?.src ?? src;
    const shownLabel = top?.label ?? docLabel;
    const shownAccent = top?.accent ?? accent;

    return (
        <div
            data-hero-preview={docTypeId}
            style={{ position: 'relative', width: '100%', maxWidth: 460, margin: '0 auto' }}
            onMouseEnter={() => onHoverChange?.(true)}
            onMouseLeave={() => onHoverChange?.(false)}
        >
            <div
                aria-hidden
                style={{
                    position: 'absolute', inset: '8% -6% -4% -6%', borderRadius: 40,
                    background: `radial-gradient(closest-side, ${shownAccent}55, transparent)`,
                    filter: 'blur(30px)', transition: 'background 0.6s', pointerEvents: 'none',
                }}
            />
            <button
                type="button"
                onClick={onClick}
                aria-label={t('hero.previewLabel', { doc: docLabel })}
                style={{
                    position: 'relative', display: 'block', width: '100%', padding: 0, border: 0, cursor: 'pointer',
                    background: '#fff', borderRadius: 18, overflow: 'hidden', textAlign: 'left',
                    boxShadow: '0 30px 70px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.06)',
                    transform: 'perspective(1400px) rotateY(-6deg) rotateX(2deg)',
                    transition: 'transform 0.4s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'perspective(1400px) rotateY(0deg) rotateX(0deg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'perspective(1400px) rotateY(-6deg) rotateX(2deg)'; }}
            >
                <div style={{ height: 6, background: shownAccent, transition: 'background 0.6s' }} />
                <div ref={boxRef} style={{ position: 'relative', height: 'min(560px, 62vh)', minHeight: 360, overflow: 'hidden', background: '#fff' }}>
                    {layers.map(l => (
                        <iframe
                            key={l.id}
                            title={t('hero.frameTitle', { name: l.src.name })}
                            srcDoc={l.html}
                            sandbox="allow-scripts"
                            tabIndex={-1}
                            aria-hidden
                            onLoad={() => reveal(l.id)}
                            style={{
                                position: 'absolute', top: 0, left: 0, width: PAGE_W, height: size.h / scale, border: 0,
                                transform: `scale(${scale})`, transformOrigin: '0 0', pointerEvents: 'none', background: '#fff',
                                opacity: l.shown ? 1 : 0, transition: 'opacity 0.55s ease',
                            }}
                        />
                    ))}
                    {!layers.length && (
                        <div style={{ position: 'absolute', inset: 0, padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[55, 85, 70, 90, 60, 80, 45].map((w, i) => (
                                <div key={i} style={{ height: i === 0 ? 20 : 10, width: `${w}%`, borderRadius: 4, background: theme.surfaceAlt }} />
                            ))}
                        </div>
                    )}
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, background: 'linear-gradient(180deg, rgba(255,255,255,0), #fff 85%)', pointerEvents: 'none' }} />
                </div>
            </button>

            <div
                style={{
                    position: 'relative', marginTop: -26, marginLeft: 18, marginRight: 18, padding: '10px 14px',
                    background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.border}`, borderRadius: 14, boxShadow: theme.shadow,
                    display: 'flex', alignItems: 'center', gap: 10,
                }}
            >
                <span
                    style={{
                        flexShrink: 0, fontSize: 11, fontWeight: 800, color: '#fff', background: shownAccent,
                        padding: '4px 9px', borderRadius: 8, transition: 'background 0.6s', whiteSpace: 'nowrap',
                    }}
                >
                    {shownLabel}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {current?.name ?? t('hero.readyTemplate')}
                    </div>
                    <div style={{ fontSize: 11, color: theme.textSubtle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {current?.subtitle ?? (current?.sectorLabel ? `${t('hero.fromGallery')} · ${current.sectorLabel}` : t('hero.fromGallery'))}
                    </div>
                </div>
            </div>
        </div>
    );
};
