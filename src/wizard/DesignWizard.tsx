import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, XCircle, Upload, FileCode, Database, FileText, Loader2, Landmark, ExternalLink, Truck, Languages } from 'lucide-react';
import { WIZARD_DOC_TYPES, FAMILY_INFO, loadSampleXml, loadOfficialSample, type DocFamily, type WizardDocType, type OfficialSample } from './docTypes';
import { countryDocType, countryDocTypes, hasIntlTemplate } from './intlDocTypes';
import { DesignThumb } from './DesignThumb';
import {
    countryDocLanguages, countryName, countryNote, countryProfiles, findCountryRules, findDocumentProfile, KIND_SPECS, languageName,
    type DocLanguage, type DocumentFamily,
} from '../international';
import { validateXslt, validateXml, stripBom, type ValidationResult } from './validate';
import { designKeyOf } from '../api';
import { hasTestWatermark, stripTestWatermark } from '../xslt-editor/utils/testWatermark';
import { hasLicenseLock } from '../../shared/license-lock.js';
import { theme } from '../theme';
import i18n, { useLocaleT } from '../i18n';
import { Flag } from '../i18n/flags';
import { useCountry, useUiStore } from '../store/uiStore';

export interface WizardResult {
    moduleId: string;
    docName: string;
    xslt: string;
    xml: string;
}

interface LoadedFile { name: string; size: number; text: string; result: ValidationResult }

const MAX_BYTES = 5 * 1024 * 1024;
const STEP_KEYS = ['type', 'xslt', 'xml'] as const;

const familyLabel = (family: DocFamily) =>
    (i18n.t('wizard.family', { returnObjects: true }) as Record<string, string>)[family] ?? FAMILY_INFO[family].label;
const trDocDescription = (doc: WizardDocType) =>
    (i18n.t('wizard.trDocs', { returnObjects: true }) as Record<string, string>)[doc.id] ?? doc.description;

const card = (active: boolean, color: string = theme.primary): React.CSSProperties => ({
    background: active ? `${color}14` : theme.surface,
    border: `1px solid ${active ? color : theme.border}`,
    borderRadius: 14, padding: '14px 16px', cursor: 'pointer', color: theme.text,
    textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s', width: '100%',
    boxShadow: active ? `0 0 0 3px ${color}33` : theme.shadowSm,
});

const well: React.CSSProperties = {
    background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 12,
};

const readFile = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error(i18n.t('wizard.fileReadError')));
    reader.readAsText(file);
});

/** Yüklenen dosyanın uygunluk sonucu; onaylanmış (satın alınmış) XSLT tekrar açılamaz. */
const checkFile = (text: string, kind: 'xslt' | 'xml', docType: WizardDocType, sampleXml: string | null, xslt: string | null): ValidationResult => {
    if (kind === 'xslt' && (!!designKeyOf(text) || hasLicenseLock(text))) {
        return { ok: false, info: [], checks: [{ level: 'error', text: i18n.t('wizard.approvedFile') }] };
    }
    return kind === 'xslt' ? validateXslt(text, docType, sampleXml) : validateXml(text, docType, xslt);
};

const CheckList: React.FC<{ result: ValidationResult }> = ({ result }) => (
    <div data-wizard-checks={result.ok ? 'ok' : 'error'} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {result.checks.map((c, i) => (
            <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13,
                color: c.level === 'ok' ? theme.greenText : c.level === 'warn' ? '#b45309' : theme.redText,
            }}>
                {c.level === 'ok' ? <Check size={16} style={{ flexShrink: 0 }} /> : c.level === 'warn' ? <AlertTriangle size={16} style={{ flexShrink: 0 }} /> : <XCircle size={16} style={{ flexShrink: 0 }} />}
                <span>{c.text}</span>
            </div>
        ))}
        {result.info.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 14px', marginTop: 8, fontSize: 12 }}>
                {result.info.map(([k, v]) => (
                    <React.Fragment key={k}>
                        <span style={{ color: theme.textSubtle }}>{k}</span>
                        <span style={{ color: theme.text, wordBreak: 'break-word' }}>{v}</span>
                    </React.Fragment>
                ))}
            </div>
        )}
    </div>
);

const FilePanel: React.FC<{
    accept: string;
    hint: string;
    file: LoadedFile | null;
    busy: boolean;
    onFile: (file: File) => void;
}> = ({ accept, hint, file, busy, onFile }) => {
    const { t } = useLocaleT();
    const inputRef = useRef<HTMLInputElement>(null);
    const [over, setOver] = useState(false);
    return (
        <div style={{ marginTop: 14 }}>
            <input ref={inputRef} type="file" accept={accept} data-wizard-file style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
                style={{
                    border: `2px dashed ${over ? theme.primary : theme.borderStrong}`, borderRadius: 14,
                    padding: '22px 16px', textAlign: 'center', cursor: 'pointer', color: theme.textMuted,
                    background: over ? theme.surfaceTint : theme.surfaceAlt,
                }}
            >
                {busy ? <Loader2 size={26} color={theme.primary} /> : <Upload size={26} color={theme.primary} />}
                <div style={{ marginTop: 8, fontSize: 14, color: theme.text, fontWeight: 600 }}>
                    {file ? t('wizard.chooseOther') : t('wizard.dropHint')}
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>{hint}</div>
            </div>
            {file && (
                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 14 }}>
                    <div style={{ ...well, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                            <FileCode size={16} color={theme.primary} />
                            <span data-wizard-file-name style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                            <span style={{ color: theme.textSubtle, fontWeight: 400, marginLeft: 'auto', flexShrink: 0 }}>{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <pre style={{
                            margin: 0, maxHeight: 220, overflow: 'auto', fontSize: 11, lineHeight: 1.45,
                            color: theme.textMuted, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 10, whiteSpace: 'pre',
                        }}>{stripBom(file.text).split('\n').slice(0, 40).join('\n')}</pre>
                    </div>
                    <div style={well}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{t('wizard.checksTitle')}</div>
                        <CheckList result={file.result} />
                    </div>
                </div>
            )}
        </div>
    );
};

const selectStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 10, border: `1px solid ${theme.borderStrong}`, background: theme.surface,
    color: theme.text, fontFamily: 'inherit', fontSize: 14, minWidth: 220,
};

/**
 * Türkiye dışındaki ülkeler: belge dili seçimi, ülkedeki adlarıyla hazır belgeler ve
 * e-Fatura / e-Arşiv / e-İrsaliye karşılıklarının kuralları.
 */
const IntlDocTypePicker: React.FC<{
    country: string;
    docLang: DocLanguage;
    onDocLang: (lang: DocLanguage) => void;
    selectedId?: string;
    onPick: (t: WizardDocType) => void;
}> = ({ country, docLang, onDocLang, selectedId, onPick }) => {
    const { t, locale } = useLocaleT();
    const rules = findCountryRules(country);
    if (!rules) return null;
    const languages = countryDocLanguages(country);
    const docs = countryDocTypes(country, docLang);
    const note = (family: DocumentFamily) => countryNote(country, family, locale);
    const sections: { family: DocumentFamily; badge: string; note?: string; profiles: string[] }[] = [
        { family: 'invoice', badge: t(`wizard.mandate.${rules.invoice.mandate}`), note: note('invoice'), profiles: rules.invoice.profiles },
        {
            family: 'archive', badge: t(`wizard.archiveEq.${rules.archive.equivalent}`),
            note: note('archive') ?? (rules.archive.equivalent === 'none' ? t('wizard.noArchiveNote') : undefined), profiles: rules.archive.profiles,
        },
        { family: 'despatch', badge: t(`wizard.despatchEq.${rules.despatch.equivalent}`), note: note('despatch'), profiles: rules.despatch.profiles },
    ];
    return (
        <div data-intl-picker={country} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ ...well, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
                    <Languages size={16} color={theme.primary} /> {t('wizard.docLanguage')}
                    <select data-doc-language value={docLang} onChange={(e) => onDocLang(e.target.value as DocLanguage)} style={selectStyle}>
                        {languages.map(l => {
                            const native = languageName(l);
                            const inUi = languageName(l, locale);
                            return <option key={l} value={l}>{native === inUi ? native : `${native} · ${inUi}`}</option>;
                        })}
                    </select>
                </label>
                <span style={{ flex: '1 1 280px', color: theme.textMuted, fontSize: 12, lineHeight: 1.5 }}>{t('wizard.docLanguageHint')}</span>
            </div>

            <div data-intl-docs>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{t('wizard.countryDocs', { country: countryName(country, locale) })}</div>
                <div style={{ color: theme.textMuted, fontSize: 12, margin: '4px 0 12px', lineHeight: 1.5 }}>{t('wizard.countryDocsHint')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                    {docs.map(d => {
                        const kind = d.intlKind ?? 'invoice';
                        const active = d.id === selectedId;
                        const code = KIND_SPECS[kind].typeCode;
                        const Icon = kind === 'despatch' ? Truck : FileText;
                        return (
                            <button key={d.id} type="button" data-intl-doc={kind} data-intl-profile={d.intlProfileId} onClick={() => onPick(d)} style={card(active, d.color)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${d.color}26`, color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icon size={20} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div lang={docLang} style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {active && <Check size={15} color={theme.green} />}{d.label}
                                        </div>
                                        <div style={{ color: theme.textMuted, fontSize: 12 }}>
                                            {t(`intl.kinds.${kind}`)}{code ? ` · ${t('wizard.typeCode', { code })}` : ''}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 8, lineHeight: 1.45 }}>{d.description}</div>
                                <div style={{ color: theme.textSubtle, fontSize: 11, marginTop: 6 }}>{findDocumentProfile(d.intlProfileId ?? '')?.name}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{t('wizard.rulesTitle')}</div>
                {sections.map(s => (
                    <div key={s.family} data-intl-family={s.family}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{t(`wizard.sections.${s.family}`)}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: theme.surfaceTint, color: theme.primary }}>{s.badge}</span>
                        </div>
                        {s.note && <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 6, lineHeight: 1.5 }}>{s.note}</div>}
                        {s.profiles.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {s.profiles.map(id => {
                                    const profile = findDocumentProfile(id);
                                    if (!profile) return null;
                                    const ready = profile.implementation === 'available' && hasIntlTemplate(id);
                                    return (
                                        <span key={id} data-intl-profile-chip={id} style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '4px 10px', borderRadius: 999,
                                            border: `1px solid ${ready ? theme.green : theme.border}`, color: ready ? theme.greenText : theme.textMuted, background: theme.surface,
                                        }}>
                                            {ready && <Check size={13} />}{profile.name}
                                            {!ready && <span style={{ color: theme.textSubtle }}>· {profile.purpose === 'reporting' ? t('wizard.reportingXml') : t('wizard.soon')}</span>}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {rules.sources[0] && (
                <a href={rules.sources[0]} target="_blank" rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.primary, textDecoration: 'none' }}>
                    <ExternalLink size={14} /> {t('wizard.officialSource')}
                </a>
            )}
        </div>
    );
};

/**
 * Giriş sonrası tasarım sihirbazı: belge türü → XSLT (varsayılan / kendi) →
 * veri (varsayılan / kendi XML) → tasarım ekranı. Kullanıcı dosyaları seçilen
 * belge türüne uygunluk için kontrol edilir; hata varsa ilerlenemez.
 */
export const DesignWizard: React.FC<{ onFinish: (r: WizardResult) => void }> = ({ onFinish }) => {
    const { t, locale } = useLocaleT();
    const [step, setStep] = useState(0);
    const country = useCountry() ?? 'TR';
    const setCountry = useUiStore(s => s.setCountry);
    const countryOptions = useMemo(() => [...countryProfiles]
        .map(c => ({ code: c.code, name: countryName(c.code, locale) }))
        .sort((a, b) => (a.code === 'TR' ? -1 : b.code === 'TR' ? 1 : a.name.localeCompare(b.name, locale))), [locale]);
    const [docLangs, setDocLangs] = useState<Record<string, DocLanguage>>({});
    const docLang = docLangs[country] ?? countryDocLanguages(country)[0] ?? 'en';
    const [docType, setDocType] = useState<WizardDocType | null>(null);
    const [sampleXml, setSampleXml] = useState<string | null>(null);
    const [xsltChoice, setXsltChoice] = useState<string>('');
    const [ownXslt, setOwnXslt] = useState<LoadedFile | null>(null);
    const [ownXsltWasTest, setOwnXsltWasTest] = useState(false);
    const [xmlChoice, setXmlChoice] = useState<'default' | 'gib' | 'own'>('default');
    const [ownXml, setOwnXml] = useState<LoadedFile | null>(null);
    const [gibXml, setGibXml] = useState<LoadedFile | null>(null);
    const [xsltText, setXsltText] = useState<string | null>(null);
    const [defaultXmlResult, setDefaultXmlResult] = useState<ValidationResult | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!docType) return;
        let alive = true;
        setSampleXml(null);
        loadSampleXml(docType).then(text => { if (alive) setSampleXml(text); }).catch(e => alive && setError(e.message));
        return () => { alive = false; };
    }, [docType]);

    // Dil değişince seçili Avrupa belge türünün metinleri ve kontrol sonuçları yeni dilde üretilir.
    const latest = useRef({ docType, sampleXml, xsltText });
    useEffect(() => { latest.current = { docType, sampleXml, xsltText }; });
    useEffect(() => {
        const relocalize = () => {
            const { docType: current, sampleXml: sample, xsltText: xslt } = latest.current;
            if (!current) return;
            const { country: c, intlKind: kind, intlProfileId: profileId, docLanguage: lang } = current;
            const next = (c && kind && profileId && lang && countryDocType(c, { kind, profileId }, lang)) || current;
            setDocType(next);
            setOwnXslt(f => f && { ...f, result: checkFile(f.text, 'xslt', next, sample, xslt) });
            setOwnXml(f => f && { ...f, result: checkFile(f.text, 'xml', next, sample, xslt) });
            setGibXml(f => f && { ...f, result: validateXml(f.text, next, xslt) });
            setDefaultXmlResult(r => (r && sample && xslt ? validateXml(sample, next, xslt) : r));
        };
        i18n.on('languageChanged', relocalize);
        return () => i18n.off('languageChanged', relocalize);
    }, []);

    // Bayraktan başka bir ülke seçilirse o ülkenin belge türleriyle baştan başlanır.
    useEffect(() => useUiStore.subscribe((state, prev) => {
        if (state.country === prev.country) return;
        const current = latest.current.docType;
        if (current && (current.country ?? 'TR') !== (state.country ?? 'TR')) {
            setDocType(null);
            setError(null);
            setStep(0);
        }
    }), []);

    const selectedDefault = docType?.defaults.find(d => d.id === xsltChoice) ?? null;

    const pickDocType = (picked: WizardDocType) => {
        if (picked.id !== docType?.id) {
            setDocType(picked);
            setXsltChoice(picked.defaults[0].id);
            setOwnXslt(null);
            setOwnXml(null);
            setGibXml(null);
            setXmlChoice('default');
        }
        setStep(1);
    };

    const pickOfficial = async (s: OfficialSample) => {
        if (!docType) return;
        setError(null);
        setBusy(true);
        try {
            const text = await loadOfficialSample(s);
            setGibXml({ name: s.file.split('/').pop() ?? s.file, size: text.length, text, result: validateXml(text, docType, xsltText) });
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    };

    const loadOwn = async (file: File, kind: 'xslt' | 'xml') => {
        if (!docType) return;
        setError(null);
        if (file.size > MAX_BYTES) { setError(t('wizard.tooLarge', { size: (file.size / 1024 / 1024).toFixed(1) })); return; }
        setBusy(true);
        try {
            const raw = await readFile(file);
            const wasTest = kind === 'xslt' && hasTestWatermark(raw);
            const text = wasTest ? stripTestWatermark(raw) : raw;
            if (kind === 'xslt') setOwnXsltWasTest(wasTest);
            const loaded = { name: file.name, size: file.size, text, result: checkFile(text, kind, docType, sampleXml, xsltText) };
            if (kind === 'xslt') setOwnXslt(loaded); else setOwnXml(loaded);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    };

    const goToData = async () => {
        if (!docType) return;
        setBusy(true);
        setError(null);
        try {
            const text = xsltChoice === 'own' ? ownXslt?.text ?? '' : await (selectedDefault?.load() ?? Promise.resolve(''));
            if (!text) throw new Error(t('wizard.xsltLoadFailed'));
            setXsltText(text);
            const sample = sampleXml ?? await loadSampleXml(docType);
            setSampleXml(sample);
            setDefaultXmlResult(validateXml(sample, docType, text));
            if (ownXml) setOwnXml({ ...ownXml, result: validateXml(ownXml.text, docType, text) });
            if (gibXml) setGibXml({ ...gibXml, result: validateXml(gibXml.text, docType, text) });
            setStep(2);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    };

    const finish = () => {
        if (!docType || !xsltText) return;
        const xml = xmlChoice === 'own' ? ownXml?.text : xmlChoice === 'gib' ? gibXml?.text : sampleXml;
        if (!xml) return;
        onFinish({
            moduleId: xsltChoice === 'own' ? docType.id : selectedDefault?.moduleId ?? docType.id,
            docName: xsltChoice === 'own' && ownXslt
                ? ownXslt.name.replace(/\.(xslt|xsl)$/i, '')
                : t('wizard.designName', { doc: `${docType.label}${docType.country ? ` ${docType.country}` : ''}` }),
            xslt: xsltText,
            xml,
        });
    };

    const canNext = step === 1
        ? (xsltChoice === 'own' ? !!ownXslt?.result.ok : !!selectedDefault) && !!sampleXml
        : step === 2
            ? (xmlChoice === 'own' ? !!ownXml?.result.ok : xmlChoice === 'gib' ? !!gibXml?.result.ok : !!defaultXmlResult?.ok)
            : false;

    const sectionTitle = (title: string, sub: string) => (
        <div style={{ marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{title}</h2>
            <p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: 14 }}>{sub}</p>
        </div>
    );

    return (
        <div data-design-wizard data-wizard-step={step} style={{
            width: '100%', background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: 24, padding: '28px 28px 22px', boxShadow: theme.shadow, color: theme.text,
        }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 26 }}>
                {STEP_KEYS.map((s, i) => (
                    <div key={s} style={{ flex: 1 }}>
                        <div style={{ height: 4, borderRadius: 4, background: i <= step ? theme.gradient : theme.border }} />
                        <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: i === step ? theme.primary : theme.textSubtle }}>
                            {i + 1}. {t(`wizard.steps.${s}`)}{i < step && i === 0 && docType ? ` · ${docType.label}${docType.country ? ` (${docType.country})` : ''}` : ''}
                        </div>
                    </div>
                ))}
            </div>

            {step === 0 && (
                <>
                    {sectionTitle(t('wizard.typeTitle'), t('wizard.typeSub'))}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, fontSize: 13, fontWeight: 700 }}>
                        <Flag code={country} height={16} /> {t('wizard.country')}
                        <select data-wizard-country value={country} onChange={(e) => setCountry(e.target.value)} style={selectStyle}>
                            {countryOptions.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                    </label>
                    {country !== 'TR' && (
                        <IntlDocTypePicker country={country} docLang={docLang} selectedId={docType?.id} onPick={pickDocType}
                            onDocLang={(lang) => setDocLangs(m => ({ ...m, [country]: lang }))} />
                    )}
                    {country === 'TR' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                        {WIZARD_DOC_TYPES.map(d => (
                            <button key={d.id} type="button" data-doc-type={d.id} onClick={() => pickDocType(d)} style={card(docType?.id === d.id, d.color)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${d.color}26`, color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>{d.label}</div>
                                        <div style={{ color: theme.textMuted, fontSize: 12 }}>{trDocDescription(d)}</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>}
                </>
            )}

            {step === 1 && docType && (
                <>
                    {sectionTitle(t('wizard.xsltTitle', { doc: docType.label }), t('wizard.xsltSub'))}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                        {docType.defaults.map((d, i) => (
                            <button key={d.id} type="button" data-xslt-option={d.id} onClick={() => setXsltChoice(d.id)} style={card(xsltChoice === d.id, docType.color)}>
                                {docType.sampleText && docType.defaults.length > 1 && (
                                    <div style={{ marginBottom: 10 }}>
                                        <DesignThumb load={d.load} sampleXml={docType.sampleText} width={206} height={150} delay={i * 60} />
                                    </div>
                                )}
                                <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {xsltChoice === d.id && <Check size={15} color={theme.green} />}{d.label}
                                </div>
                                <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>{d.description}</div>
                                {d.recommended
                                    ? <div data-recommended style={{ color: docType.color, fontSize: 11, marginTop: 6, fontWeight: 600 }}>{t('intl.designRecommended')}</div>
                                    : <div style={{ color: theme.textSubtle, fontSize: 11, marginTop: 6 }}>{t('wizard.defaultTemplate')}</div>}
                            </button>
                        ))}
                    </div>
                    <button type="button" data-xslt-option="own" onClick={() => setXsltChoice('own')} style={{ ...card(xsltChoice === 'own', '#f59e0b'), marginTop: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Upload size={16} /> {t('wizard.ownXslt')}
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>
                            {t('wizard.ownXsltHint', { family: familyLabel(docType.family), doc: docType.label })}
                        </div>
                    </button>
                    {xsltChoice === 'own' && (
                        <FilePanel accept=".xslt,.xsl" hint={t('wizard.xsltFileHint')} file={ownXslt} busy={busy} onFile={(f) => loadOwn(f, 'xslt')} />
                    )}
                    {xsltChoice === 'own' && ownXslt && ownXsltWasTest && (
                        <div data-test-file-note style={{
                            marginTop: 10, padding: '10px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.5,
                            background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#b45309',
                        }}>
                            {t('wizard.testNote')}
                        </div>
                    )}
                </>
            )}

            {step === 2 && docType && (
                <>
                    {sectionTitle(t('wizard.xmlTitle'), t('wizard.xmlSub'))}
                    <button type="button" data-xml-option="default" onClick={() => setXmlChoice('default')} style={card(xmlChoice === 'default', docType.color)}>
                        <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Database size={16} /> {t('wizard.defaultXml')}
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>{t('wizard.defaultXmlHint', { doc: docType.label, file: docType.sampleXml.split('/').pop() })}</div>
                        {xmlChoice === 'default' && defaultXmlResult && <div style={{ marginTop: 10 }}><CheckList result={defaultXmlResult} /></div>}
                    </button>
                    {docType.officialSamples && docType.officialSamples.length > 0 && (
                        <>
                            <button type="button" data-xml-option="gib" onClick={() => setXmlChoice('gib')} style={{ ...card(xmlChoice === 'gib', '#0ea5e9'), marginTop: 12 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Landmark size={16} /> {docType.intlProfileId ? t('wizard.europeanSamples') : t('wizard.gibSamples')} ({docType.officialSamples.length})
                                </div>
                                <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>
                                    {docType.officialNote ?? t('wizard.gibNote')}
                                </div>
                            </button>
                            {xmlChoice === 'gib' && (
                                <div style={{ marginTop: 10 }}>
                                    <div data-gib-samples style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 8 }}>
                                        {docType.officialSamples.map(s => {
                                            const active = gibXml?.name === s.file.split('/').pop();
                                            return (
                                                <button key={s.file} type="button" data-gib-sample={s.file.split('/').pop()} disabled={busy} onClick={() => pickOfficial(s)}
                                                    style={{ ...card(active, '#0ea5e9'), padding: '9px 12px', borderRadius: 10 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        {active && <Check size={14} color={theme.green} />}{s.label}
                                                    </div>
                                                    <div style={{ color: theme.textSubtle, fontSize: 11, marginTop: 2 }}>{s.tag}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {gibXml && (
                                        <div style={{ ...well, marginTop: 12 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{t('wizard.checksFor', { file: gibXml.name })}</div>
                                            <CheckList result={gibXml.result} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                    <button type="button" data-xml-option="own" onClick={() => setXmlChoice('own')} style={{ ...card(xmlChoice === 'own', '#f59e0b'), marginTop: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Upload size={16} /> {t('wizard.ownXml')}
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>
                            {t('wizard.ownXmlHint', { doc: docType.label, root: FAMILY_INFO[docType.family].root })}
                        </div>
                    </button>
                    {xmlChoice === 'own' && (
                        <FilePanel accept=".xml" hint={t('wizard.xmlFileHint')} file={ownXml} busy={busy} onFile={(f) => loadOwn(f, 'xml')} />
                    )}
                </>
            )}

            {error && <div style={{ marginTop: 14, color: theme.redText, fontSize: 13 }}>{error}</div>}

            <div data-wizard-footer style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 24,
                position: 'sticky', bottom: 0, zIndex: 5, padding: '14px 0 12px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 28%)',
            }}>
                <button type="button" data-wizard-back disabled={step === 0} onClick={() => { setError(null); setStep(s => Math.max(0, s - 1)); }}
                    style={{ padding: '10px 18px', borderRadius: 10, border: `1px solid ${theme.borderStrong}`, background: theme.surface, color: step === 0 ? theme.borderStrong : theme.text, cursor: step === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                    <ArrowLeft size={16} /> {t('common.back')}
                </button>
                {step > 0 && (
                    <button type="button" data-wizard-next disabled={!canNext || busy} onClick={step === 1 ? goToData : finish}
                        style={{
                            padding: '10px 22px', borderRadius: 10, border: 'none', fontWeight: 700, fontFamily: 'inherit',
                            background: canNext && !busy ? theme.gradient : theme.surfaceAlt,
                            boxShadow: canNext && !busy ? theme.shadowBrand : 'none',
                            color: canNext && !busy ? 'white' : theme.textSubtle, cursor: canNext && !busy ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                        {busy ? <Loader2 size={16} /> : null}
                        {step === 1 ? t('wizard.nextData') : t('wizard.openDesigner')} <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default DesignWizard;
