import React, { useEffect, useMemo, useState } from 'react';
import { Check, Image as ImageIcon, Landmark, Loader2, Maximize2, Sparkles, Type, X } from 'lucide-react';
import type { WizardDocType } from '../wizard/docTypes';
import { transformXmlWithXslt } from '../xsltTransformer';
import { SECTORS, type SectorTemplate } from '../sector-templates/types';
import { theme } from '../theme';
import { useLocaleT } from '../i18n';
import { analyzeXslt, type ImageRole } from './analyzeXslt';
import { MOODS, loadTemplate, personalizeTemplate, rankTemplates, sectorLabel, type Mood } from './library';
import { fetchQuota, requestPicks, type PickResult, type Quota } from './suggest';

const PAGE_W = 794;
const NO_SCROLL = '<style>html,body{overflow:hidden!important;}</style>';

interface Option { template: SectorTemplate; xslt: string; xml: string; html: string; reason: string }

const well: React.CSSProperties = { background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14 };
const chip = (on: boolean): React.CSSProperties => ({
    padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
    border: `1px solid ${on ? theme.primary : theme.borderStrong}`, background: on ? theme.surfaceTint : theme.surface, color: on ? theme.primary : theme.text,
});
const heading: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, marginBottom: 8 };

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image'));
    img.src = src;
});

const Preview: React.FC<{ html: string; width: number; height: number }> = ({ html, width, height }) => {
    const scale = width / PAGE_W;
    return (
        <div style={{ width, height, overflow: 'hidden', position: 'relative', borderRadius: 10, border: `1px solid ${theme.border}`, background: '#fff' }}>
            <iframe title="" srcDoc={NO_SCROLL + html} sandbox="allow-scripts" tabIndex={-1} aria-hidden scrolling="no" style={{
                position: 'absolute', top: 0, left: 0, width: PAGE_W, height: height / scale, border: 0,
                transform: `scale(${scale})`, transformOrigin: '0 0', pointerEvents: 'none', background: '#fff',
            }} />
        </div>
    );
};

/**
 * Kendi XSLT'sini yükleyen kullanıcıya, logo / banka / özel metinlerini koruyarak
 * sektörüne ve isteğine göre elle hazırlanmış kütüphaneden üç tasarım önerir.
 */
export const ProDesignStep: React.FC<{
    docType: WizardDocType;
    xslt: string;
    onUse: (xslt: string, name: string, sampleXml: string) => void;
}> = ({ docType, xslt, onUse }) => {
    const { t, locale } = useLocaleT();
    const analysis = useMemo(() => analyzeXslt(xslt), [xslt]);
    const [roles, setRoles] = useState<ImageRole[]>(() => analysis.images.map(i => i.guess));
    const [bankOn, setBankOn] = useState<boolean[]>(() => analysis.banks.map(() => true));
    const [textOn, setTextOn] = useState<boolean[]>(() => analysis.texts.map(() => true));
    const [sectorId, setSectorId] = useState('');
    const [moods, setMoods] = useState<Mood[]>(['modern']);
    const [wishes, setWishes] = useState('');
    const [logoSize, setLogoSize] = useState<{ width: number; height: number } | null>(null);
    const [quota, setQuota] = useState<Quota | null>(null);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<PickResult | null>(null);
    const [options, setOptions] = useState<Option[]>([]);
    const [zoom, setZoom] = useState<Option | null>(null);

    useEffect(() => { fetchQuota().then(setQuota); }, []);

    const logoSrc = analysis.images.find((_, i) => roles[i] === 'logo')?.src ?? null;
    const stampSrc = analysis.images.find((_, i) => roles[i] === 'stamp')?.src ?? null;

    useEffect(() => {
        let alive = true;
        setLogoSize(null);
        if (logoSrc) loadImage(logoSrc).then(img => { if (alive) setLogoSize({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 }); }).catch(() => {});
        return () => { alive = false; };
    }, [logoSrc]);

    const setRole = (index: number, role: ImageRole) => setRoles(list => list.map((r, i) => {
        if (i === index) return role;
        return role !== 'skip' && r === role ? 'skip' : r;
    }));

    const sortedSectors = useMemo(() => [...SECTORS].sort((a, b) => a.label.localeCompare(b.label, 'tr')), []);

    const suggest = async () => {
        setBusy(true);
        setOptions([]);
        try {
            const banks = analysis.banks.filter((_, i) => bankOn[i]);
            const texts = analysis.texts.filter((_, i) => textOn[i]);
            const ranked = rankTemplates({ docTypeId: docType.id, sectorId, moods, wishes, hasBanks: banks.length > 0 });
            const res = await requestPicks({
                docType: docType.label, sectorId, wishes, moods, hasLogo: !!logoSrc, bankCount: banks.length, lang: locale, ranked,
            });
            const assets = { logo: logoSrc && logoSize ? { src: logoSrc, ...logoSize } : null, stamp: stampSrc, banks, texts };
            const next: Option[] = [];
            for (const pick of res.picks) {
                try {
                    const pair = await loadTemplate(pick.template);
                    const personal = personalizeTemplate(pair.xslt, assets);
                    await new Promise(r => setTimeout(r, 0));
                    next.push({ template: pick.template, xslt: personal, xml: pair.xml, html: transformXmlWithXslt(pair.xml, personal), reason: pick.reason ?? pick.template.description });
                } catch (e) {
                    console.warn('[pro-design]', pick.template.id, e);
                }
            }
            setResult(res);
            setOptions(next);
            if (res.quota) setQuota(res.quota);
        } finally {
            setBusy(false);
        }
    };

    const note = result?.source === 'rules'
        ? result.reason === 'limit' ? t('wizard.pro.limitNote') : result.reason === 'disabled' ? t('wizard.pro.disabledNote') : t('wizard.pro.errorNote')
        : null;

    return (
        <div data-pro-step style={{ color: theme.text }}>
            <div style={{ marginBottom: 18 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={22} color={theme.primary} /> {t('wizard.pro.title')}
                </h2>
                <p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: 14, lineHeight: 1.5 }}>{t('wizard.pro.sub')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                <div data-pro-found style={{ ...well, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{t('wizard.pro.found')}</div>
                    <div>
                        <div style={heading}><ImageIcon size={15} color={theme.primary} /> {t('wizard.pro.images')}</div>
                        {analysis.images.length === 0 && <div style={{ fontSize: 12, color: theme.textSubtle }}>{t('wizard.pro.noImages')}</div>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {analysis.images.map((img, i) => (
                                <div key={i} data-pro-image={roles[i]} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                    <div style={{ width: 84, height: 48, borderRadius: 8, border: `1px solid ${theme.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={img.src} alt="" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {(['logo', 'stamp', 'skip'] as ImageRole[]).map(r => (
                                            <button key={r} type="button" onClick={() => setRole(i, r)} style={chip(roles[i] === r)}>{t(`wizard.pro.role.${r}`)}</button>
                                        ))}
                                    </div>
                                    {img.gib && <span style={{ fontSize: 11, color: '#b45309' }}>{t('wizard.pro.gib')}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div style={heading}><Landmark size={15} color={theme.primary} /> {t('wizard.pro.banks')}</div>
                        {analysis.banks.length === 0 && <div style={{ fontSize: 12, color: theme.textSubtle }}>{t('wizard.pro.noBanks')}</div>}
                        {analysis.banks.map((b, i) => (
                            <label key={b.iban} data-pro-bank style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, marginBottom: 6, cursor: 'pointer' }}>
                                <input type="checkbox" checked={bankOn[i]} onChange={e => setBankOn(l => l.map((v, j) => (j === i ? e.target.checked : v)))} />
                                <span><b>{b.bank}</b>{b.branch ? ` · ${b.branch}` : ''} · {b.currency}<br /><code style={{ fontSize: 12 }}>{b.iban}</code></span>
                            </label>
                        ))}
                    </div>
                    <div>
                        <div style={heading}><Type size={15} color={theme.primary} /> {t('wizard.pro.texts')}</div>
                        {analysis.texts.length === 0 && <div style={{ fontSize: 12, color: theme.textSubtle }}>{t('wizard.pro.noTexts')}</div>}
                        {analysis.texts.map((text, i) => (
                            <label key={i} data-pro-text style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, marginBottom: 6, cursor: 'pointer', lineHeight: 1.4 }}>
                                <input type="checkbox" checked={textOn[i]} onChange={e => setTextOn(l => l.map((v, j) => (j === i ? e.target.checked : v)))} />
                                <span style={{ wordBreak: 'break-word' }}>{text}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ ...well, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 800 }}>
                        {t('wizard.pro.sector')}
                        <select data-pro-sector value={sectorId} onChange={e => setSectorId(e.target.value)} style={{
                            padding: '9px 12px', borderRadius: 10, border: `1px solid ${theme.borderStrong}`, background: theme.surface, color: theme.text, fontFamily: 'inherit', fontSize: 14,
                        }}>
                            <option value="">{t('wizard.pro.sectorPlaceholder')}</option>
                            {sortedSectors.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                    </label>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{t('wizard.pro.moodLabel')}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {MOODS.map(m => (
                                <button key={m} type="button" data-pro-mood={m} onClick={() => setMoods(l => (l.includes(m) ? l.filter(x => x !== m) : [...l, m]))} style={chip(moods.includes(m))}>
                                    {t(`wizard.pro.moods.${m}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 800 }}>
                        {t('wizard.pro.wishes')}
                        <textarea data-pro-wishes value={wishes} maxLength={500} rows={3} onChange={e => setWishes(e.target.value)} placeholder={t('wizard.pro.wishesPlaceholder')} style={{
                            padding: '9px 12px', borderRadius: 10, border: `1px solid ${theme.borderStrong}`, background: theme.surface, color: theme.text, fontFamily: 'inherit', fontSize: 13, resize: 'vertical',
                        }} />
                    </label>
                    <button type="button" data-pro-suggest disabled={busy} onClick={suggest} style={{
                        padding: '11px 18px', borderRadius: 10, border: 'none', fontWeight: 800, fontFamily: 'inherit', fontSize: 14,
                        background: busy ? theme.surfaceAlt : theme.gradient, color: busy ? theme.textSubtle : '#fff', boxShadow: busy ? 'none' : theme.shadowBrand,
                        cursor: busy ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                        {busy ? <Loader2 size={17} /> : <Sparkles size={17} />}
                        {busy ? t('wizard.pro.thinking') : options.length ? t('wizard.pro.resuggest') : t('wizard.pro.suggest')}
                    </button>
                    {quota?.ai && (
                        <div data-pro-quota style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
                            {quota.limit === null ? t('wizard.pro.quotaAdmin') : t('wizard.pro.quota', { n: quota.remaining ?? 0, limit: quota.limit })}
                        </div>
                    )}
                </div>
            </div>

            {note && (
                <div data-pro-note style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.5, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#b45309' }}>
                    {note}
                </div>
            )}

            {options.length > 0 && (
                <div data-pro-options={result?.source} style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: theme.textMuted, marginBottom: 10 }}>
                        {result?.source === 'ai' ? t('wizard.pro.aiSource') : t('wizard.pro.rulesSource')}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
                        {options.map((o, i) => (
                            <div key={o.template.id} data-pro-option={o.template.id} style={{
                                border: `1px solid ${i === 0 ? theme.primary : theme.border}`, borderRadius: 14, padding: 12, background: theme.surface,
                                boxShadow: i === 0 ? `0 0 0 3px ${theme.primary}22` : theme.shadowSm, display: 'flex', flexDirection: 'column', gap: 10,
                            }}>
                                <button type="button" onClick={() => setZoom(o)} title={t('wizard.pro.enlarge')} style={{ position: 'relative', padding: 0, border: 0, background: 'none', cursor: 'zoom-in' }}>
                                    <Preview html={o.html} width={244} height={330} />
                                    <span style={{ position: 'absolute', right: 8, top: 8, background: '#0f172acc', color: '#fff', borderRadius: 8, padding: 5, display: 'flex' }}><Maximize2 size={14} /></span>
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${o.template.accent}1f`, color: o.template.accent }}>{sectorLabel(o.template.sector)}</span>
                                    {i === 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: theme.surfaceTint, color: theme.primary }}>{t('wizard.pro.recommended')}</span>}
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.35 }}>{o.template.name}</div>
                                <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.5, flex: 1 }}>{o.reason}</div>
                                <button type="button" data-pro-use={o.template.id} onClick={() => onUse(o.xslt, o.template.name, o.xml)} style={{
                                    padding: '9px 14px', borderRadius: 10, border: 'none', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                                    background: theme.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                }}>
                                    <Check size={16} /> {t('wizard.pro.use')}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {zoom && (
                <div data-pro-zoom onClick={() => setZoom(null)} style={{
                    position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.72)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'auto', padding: '32px 16px',
                }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 14, boxShadow: theme.shadow, position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                            <b style={{ color: '#0f172a' }}>{zoom.template.name}</b>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" onClick={() => onUse(zoom.xslt, zoom.template.name, zoom.xml)} style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: theme.gradient, color: '#fff', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
                                    {t('wizard.pro.use')}
                                </button>
                                <button type="button" aria-label={t('common.close')} onClick={() => setZoom(null)} style={{ padding: 6, borderRadius: 8, border: `1px solid ${theme.border}`, background: '#fff', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                            </div>
                        </div>
                        <iframe title={zoom.template.name} srcDoc={zoom.html} sandbox="allow-scripts" style={{
                            display: 'block', width: PAGE_W + 40, maxWidth: 'calc(100vw - 60px)', height: 'calc(100vh - 140px)', border: `1px solid ${theme.border}`, borderRadius: 10, background: '#fff',
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
};
