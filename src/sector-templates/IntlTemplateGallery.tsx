import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FileText, Loader2, LayoutTemplate } from 'lucide-react';
import { useLocaleT } from '../i18n';
import { useCountry } from '../store/uiStore';
import { theme } from '../theme';
import { countryDocuments } from '../international/registry/countryDocuments';
import { countryName, findCountry, preferredDocLanguage, type CountryCode } from '../international/registry/countryProfiles';
import { invoiceDesignIds, isNationalIntlProfile, loadIntlXslt } from '../wizard/intlDocTypes';
import { generateSampleXml, type IntlDocKind } from '../international';
import { transformXmlWithXslt } from '../xsltTransformer';
import { findDesignTheme } from '../international/designs/themeCatalog';

type UseHandler = (moduleId?: string, initialXslt?: string, docName?: string, xml?: string) => void;

const PAGE_W = 794;
const THUMB_H = 200;

const Thumb: React.FC<{ html: string | null; accent: string }> = ({ html, accent }) => {
    const scale = 160 / PAGE_W;
    return (
        <div style={{
            height: THUMB_H, borderRadius: 12, overflow: 'hidden', background: '#fff',
            border: `1px solid ${theme.border}`, position: 'relative',
        }}>
            {html ? (
                <iframe
                    title=""
                    srcDoc={`<style>html,body{overflow:hidden!important;margin:0}</style>${html}`}
                    sandbox=""
                    tabIndex={-1}
                    scrolling="no"
                    style={{
                        position: 'absolute', top: 0, left: 0, width: PAGE_W, height: THUMB_H / scale,
                        border: 0, transform: `scale(${scale})`, transformOrigin: '0 0', pointerEvents: 'none',
                    }}
                />
            ) : (
                <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: accent }}>
                    <Loader2 size={22} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
            )}
        </div>
    );
};

/**
 * TR dışı ülkeler: belge türüne göre filtre + 25 tasarım kartı.
 * Türkçe sektör galerisinin uluslararası karşılığı.
 * countryCode verilirse (dil→pazar) store'daki ülke yerine o kullanılır.
 */
export const IntlTemplateGallery: React.FC<{ onUse: UseHandler; countryCode?: CountryCode }> = ({ onUse, countryCode }) => {
    const { t, locale } = useLocaleT();
    const storeCountry = (useCountry() ?? 'BR') as CountryCode;
    const country = countryCode ?? storeCountry;
    const docs = useMemo(() => countryDocuments(country), [country]);
    const [kind, setKind] = useState<IntlDocKind | ''>('');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [previews, setPreviews] = useState<Record<string, string>>({});

    const docLang = preferredDocLanguage(country, locale);
    const profileFor = (k: IntlDocKind) => docs.find(d => d.kind === k)?.profileId;

    const activeKind = (kind || docs[0]?.kind || 'invoice') as IntlDocKind;
    const profileId = profileFor(activeKind) ?? docs[0]?.profileId ?? '';
    const designIds = useMemo(
        () => invoiceDesignIds(activeKind, { national: isNationalIntlProfile(profileId) }),
        [activeKind, profileId],
    );

    useEffect(() => {
        let alive = true;
        if (!profileId) return;
        const xml = generateSampleXml(country, activeKind, docLang, profileId);
        (async () => {
            const next: Record<string, string> = {};
            for (const id of designIds.slice(0, 12)) {
                try {
                    const xslt = await loadIntlXslt(profileId, docLang, id);
                    next[id] = transformXmlWithXslt(xml, xslt);
                } catch { /* önizleme opsiyonel */ }
                if (!alive) return;
            }
            if (alive) setPreviews(next);
        })();
        return () => { alive = false; };
    }, [country, activeKind, profileId, docLang, designIds]);

    const open = async (designId: string) => {
        if (!profileId) return;
        setBusyId(designId);
        try {
            const xslt = await loadIntlXslt(profileId, docLang, designId);
            const xml = generateSampleXml(country, activeKind, docLang, profileId);
            const name = `${t(`intl.kinds.${activeKind}`)} · ${t(`intl.designs.${designId}.name`, { defaultValue: designId })}`;
            onUse(`intl-${country.toLowerCase()}-${activeKind}`, xslt, name, xml);
        } finally {
            setBusyId(null);
        }
    };

    if (!docs.length || !findCountry(country)) return null;

    return (
        <div data-intl-gallery style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center',
                    background: theme.gradient, color: '#fff', boxShadow: theme.shadowBrand,
                }}>
                    <LayoutTemplate size={22} />
                </div>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{t('gallery.intlTitle', { country: countryName(country, locale) })}</div>
                    <div style={{ fontSize: 14, color: theme.textMuted }}>{t('gallery.intlIntro')}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                <button
                    type="button"
                    onClick={() => setKind('')}
                    style={{
                        padding: '7px 14px', borderRadius: 999, fontWeight: 700, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                        border: `1px solid ${!kind ? theme.primary : theme.border}`, background: !kind ? theme.primarySoft : '#fff',
                        color: !kind ? theme.primary : theme.textMuted,
                    }}
                >
                    {t('gallery.all')}
                </button>
                {docs.map(d => {
                    const selected = kind ? kind === d.kind : d.kind === docs[0]?.kind;
                    return (
                        <button
                            key={d.kind}
                            type="button"
                            onClick={() => setKind(d.kind)}
                            style={{
                                padding: '7px 14px', borderRadius: 999, fontWeight: 700, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                                border: `1px solid ${selected ? theme.primary : theme.border}`,
                                background: selected ? theme.primarySoft : '#fff',
                                color: selected ? theme.primary : theme.textMuted,
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                            }}
                        >
                            <FileText size={14} /> {t(`intl.kinds.${d.kind}`)}
                        </button>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                {designIds.map(id => {
                    const accent = findDesignTheme(id).accent;
                    const label = t(`intl.designs.${id}.name`, { defaultValue: id });
                    const desc = t(`intl.designs.${id}.desc`, { defaultValue: '' });
                    return (
                        <div
                            key={id}
                            style={{
                                background: '#fff', border: `1px solid ${theme.border}`, borderRadius: 16,
                                padding: 12, boxShadow: theme.shadowSm, display: 'flex', flexDirection: 'column', gap: 10,
                            }}
                        >
                            <Thumb html={previews[id] ?? null} accent={accent} />
                            <div style={{ fontWeight: 800, fontSize: 14, color: theme.text }}>{label}</div>
                            {desc && <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.4, minHeight: 34 }}>{desc}</div>}
                            <button
                                type="button"
                                disabled={busyId === id}
                                onClick={() => void open(id)}
                                style={{
                                    marginTop: 'auto', width: '100%', height: 40, border: 'none', borderRadius: 10,
                                    background: theme.gradient, color: '#fff', fontWeight: 800, fontSize: 13,
                                    cursor: busyId === id ? 'wait' : 'pointer', fontFamily: 'inherit',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                }}
                            >
                                {busyId === id ? <Loader2 size={15} /> : <ArrowRight size={15} />}
                                {t('gallery.useTemplate')}
                            </button>
                        </div>
                    );
                })}
            </div>
            <p style={{ marginTop: 14, fontSize: 12, color: theme.textSubtle }}>
                {t('gallery.shownOf', { shown: designIds.length, total: designIds.length })}
            </p>
        </div>
    );
};
