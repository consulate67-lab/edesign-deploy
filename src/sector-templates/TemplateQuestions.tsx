import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Ban, Building2, Check, FileText, Image as ImageIcon, ImageOff, ImagePlus, Landmark, Loader2 } from 'lucide-react';
import { CATEGORIES, SECTORS, type SectorTemplate } from './index';
import { readLogo, type BankChoice, type LogoChoice, type TemplatePrefs } from './personalize';
import { WIZARD_DOC_TYPES } from '../wizard/docTypes';
import { IMAGE_ACCEPT } from '../xslt-editor/utils/imageFile';
import { useLocaleT } from '../i18n';
import { theme } from '../theme';

export interface TemplateAnswers {
    docType: string;
    category: string;
    prefs: TemplatePrefs;
}

export type QuestionStep = 'doc' | 'category' | 'logo' | 'bank';

const CATEGORY_OF = new Map(SECTORS.map(s => [s.id, s.category]));

const matches = (t: SectorTemplate, docType: string, category: string) =>
    (!docType || t.docTypeId === docType) && (!category || CATEGORY_OF.get(t.sector) === category);

const Tile: React.FC<{
    active: boolean;
    color?: string;
    icon: React.ReactNode;
    title: React.ReactNode;
    hint?: React.ReactNode;
    count?: number;
    onClick: () => void;
    name: string;
}> = ({ active, color = theme.primary, icon, title, hint, count, onClick, name }) => (
    <button
        type="button"
        data-question-option={name}
        aria-pressed={active}
        onClick={onClick}
        className="tq-tile"
        style={{
            position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, textAlign: 'left',
            cursor: 'pointer', fontFamily: 'inherit', color: theme.text, background: active ? `${color}14` : theme.surface,
            border: `1.5px solid ${active ? color : theme.border}`, boxShadow: active ? `0 0 0 3px ${color}22` : theme.shadowSm,
            transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
        }}
    >
        <span style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'grid', placeItems: 'center',
            background: `${color}1c`, color,
        }}>
            {icon}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.3 }}>{title}</span>
            {hint && <span style={{ display: 'block', marginTop: 2, fontSize: '0.76rem', color: theme.textMuted, lineHeight: 1.4 }}>{hint}</span>}
        </span>
        {count !== undefined && (
            <span style={{ flexShrink: 0, fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: active ? color : theme.surfaceAlt, color: active ? 'white' : theme.textSubtle }}>
                {count}
            </span>
        )}
        {active && (
            <span style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20, borderRadius: 10, background: color, color: 'white', display: 'grid', placeItems: 'center', boxShadow: theme.shadowSm }}>
                <Check size={12} strokeWidth={3} />
            </span>
        )}
    </button>
);

/**
 * Hazır şablonları göstermeden önce sorulan kısa sorular: belge türü, firma alanı, logo ve banka bilgisi.
 * Yanıtlara göre şablonlar süzülür; logo ve banka tercihi şablonların kendisine uygulanır.
 */
export const TemplateQuestions: React.FC<{
    templates: SectorTemplate[];
    initial: TemplateAnswers;
    startStep?: QuestionStep;
    onDone: (answers: TemplateAnswers) => void;
    onSkip: () => void;
}> = ({ templates, initial, startStep = 'doc', onDone, onSkip }) => {
    const { t } = useLocaleT();
    const [docType, setDocType] = useState(initial.docType);
    const [category, setCategory] = useState(initial.category);
    const [logo, setLogo] = useState<LogoChoice>(initial.prefs.logo);
    const [bank, setBank] = useState<BankChoice>(initial.prefs.bank);
    const [lastCustom, setLastCustom] = useState<LogoChoice | null>(initial.prefs.logo.mode === 'custom' ? initial.prefs.logo : null);
    const [step, setStep] = useState<QuestionStep>(startStep);
    const [logoBusy, setLogoBusy] = useState(false);
    const [logoError, setLogoError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const docOpts = useMemo(() => WIZARD_DOC_TYPES.flatMap(d => {
        const count = templates.filter(x => x.docTypeId === d.id).length;
        return count ? [{ id: d.id, label: d.label, color: d.color ?? theme.primary, count }] : [];
    }), [templates]);
    const catOpts = useMemo(() => CATEGORIES.flatMap(c => {
        const count = templates.filter(x => matches(x, docType, c.id)).length;
        return count ? [{ ...c, label: t(`gallery.categories.${c.id}`), count }] : [];
    }), [templates, docType, t]);
    const candidates = useMemo(() => templates.filter(x => matches(x, docType, category)), [templates, docType, category]);
    const bankCount = candidates.filter(x => x.bank).length;
    const steps: QuestionStep[] = bankCount ? ['doc', 'category', 'logo', 'bank'] : ['doc', 'category', 'logo'];
    const index = Math.max(0, steps.indexOf(step));
    const resultCount = bank === 'yes' && bankCount ? bankCount : candidates.length;

    const finish = (b: BankChoice = bank) => onDone({ docType, category, prefs: { logo, bank: bankCount ? b : 'any' } });
    const next = () => (index < steps.length - 1 ? setStep(steps[index + 1]) : finish());
    const back = () => setStep(steps[Math.max(0, index - 1)]);

    const pickDoc = (id: string) => {
        setDocType(id);
        if (category && !templates.some(x => matches(x, id, category))) setCategory('');
        setStep('category');
    };
    const pickCategory = (id: string) => { setCategory(id); setStep('logo'); };
    const pickBank = (b: BankChoice) => { setBank(b); finish(b); };

    const onFile = async (file: File | undefined) => {
        if (!file) return;
        setLogoBusy(true);
        setLogoError(null);
        try {
            const l = await readLogo(file);
            setLogo(l);
            setLastCustom(l);
        } catch (e) {
            setLogoError(e instanceof Error ? e.message : String(e));
        } finally {
            setLogoBusy(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const title: Record<QuestionStep, { q: string; hint: string }> = {
        doc: { q: t('gallery.q.docQ'), hint: t('gallery.q.docHint') },
        category: { q: t('gallery.q.categoryQ'), hint: t('gallery.q.categoryHint') },
        logo: { q: t('gallery.q.logoQ'), hint: t('gallery.q.logoHint') },
        bank: { q: t('gallery.q.bankQ'), hint: t('gallery.q.bankHint') },
    };

    return (
        <div data-template-questions style={{
            borderRadius: 18, border: `1px solid ${theme.border}`, background: `linear-gradient(180deg, ${theme.surfaceTint} 0%, ${theme.surface} 60%)`,
            padding: '22px 22px 18px', animation: 'fadeIn 0.25s ease-out',
        }}>
            <style>{`.tq-tile:hover { transform: translateY(-1px); border-color: ${theme.primary}88 !important; }`}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: theme.primary, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                    {t('gallery.q.step', { n: index + 1, total: steps.length })}
                </span>
                <div style={{ flex: 1, display: 'flex', gap: 6 }}>
                    {steps.map((s, i) => (
                        <button key={s} type="button" aria-label={t('gallery.q.stepAria', { n: i + 1 })} onClick={() => i < index && setStep(s)} style={{
                            flex: 1, height: 6, borderRadius: 3, border: 'none', padding: 0, cursor: i < index ? 'pointer' : 'default',
                            background: i <= index ? theme.gradient : theme.border,
                        }} />
                    ))}
                </div>
            </div>

            <h3 data-question-title style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.text }}>{title[step].q}</h3>
            <p style={{ margin: '6px 0 16px', fontSize: '0.86rem', color: theme.textMuted, lineHeight: 1.5 }}>{title[step].hint}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
                {step === 'doc' && (
                    <>
                        {docOpts.map(d => (
                            <Tile key={d.id} name={d.id} active={docType === d.id} color={d.color} icon={<FileText size={20} />} title={d.label} count={d.count} onClick={() => pickDoc(d.id)} />
                        ))}
                        <Tile name="any" active={!docType} icon={<FileText size={20} />} title={t('gallery.q.any')} hint={t('gallery.q.allDocs')} count={templates.length} onClick={() => pickDoc('')} />
                    </>
                )}
                {step === 'category' && (
                    <>
                        {catOpts.map(c => (
                            <Tile key={c.id} name={c.id} active={category === c.id} color={c.color} icon={<Building2 size={20} />} title={c.label} count={c.count} onClick={() => pickCategory(c.id)} />
                        ))}
                        <Tile name="any" active={!category} icon={<Building2 size={20} />} title={t('gallery.q.any')} hint={t('gallery.q.allSectors')} count={templates.filter(x => matches(x, docType, '')).length} onClick={() => pickCategory('')} />
                    </>
                )}
                {step === 'logo' && (
                    <>
                        <Tile
                            name="custom"
                            active={logo.mode === 'custom'}
                            icon={logoBusy ? <Loader2 size={20} className="tg-spin" /> : lastCustom?.mode === 'custom'
                                ? <img src={lastCustom.dataUrl} alt="" style={{ maxWidth: 34, maxHeight: 34, objectFit: 'contain' }} />
                                : <ImagePlus size={20} />}
                            title={lastCustom?.mode === 'custom' ? t('gallery.q.useMyLogo') : t('gallery.q.uploadLogo')}
                            hint={lastCustom?.mode === 'custom' ? <>{lastCustom.name} · <u onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>{t('gallery.q.otherLogo')}</u></> : t('gallery.q.logoFormats')}
                            onClick={() => (lastCustom ? setLogo(lastCustom) : fileRef.current?.click())}
                        />
                        <Tile name="sample" active={logo.mode === 'sample'} icon={<ImageIcon size={20} />} title={t('gallery.q.keepSample')} hint={t('gallery.q.keepSampleHint')} onClick={() => setLogo({ mode: 'sample' })} />
                        <Tile name="none" active={logo.mode === 'none'} icon={<ImageOff size={20} />} title={t('gallery.q.noLogo')} hint={t('gallery.q.noLogoHint')} onClick={() => setLogo({ mode: 'none' })} />
                        <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} data-question-logo-file style={{ display: 'none' }} onChange={e => void onFile(e.target.files?.[0])} />
                    </>
                )}
                {step === 'bank' && (
                    <>
                        <Tile name="yes" active={bank === 'yes'} color="#0f766e" icon={<Landmark size={20} />} title={t('gallery.q.bankYes')} hint={t('gallery.q.bankYesHint')} count={bankCount} onClick={() => pickBank('yes')} />
                        <Tile name="no" active={bank === 'no'} color="#b45309" icon={<Ban size={20} />} title={t('gallery.q.bankNo')} hint={t('gallery.q.bankNoHint')} count={candidates.length} onClick={() => pickBank('no')} />
                    </>
                )}
            </div>

            {logoError && step === 'logo' && <div style={{ marginTop: 10, color: theme.redText, fontSize: '0.8rem' }}>{logoError}</div>}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                {index > 0 && (
                    <button type="button" data-question-back onClick={back} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `1px solid ${theme.borderStrong}`, background: theme.surface, color: theme.text, fontFamily: 'inherit', fontWeight: 700, fontSize: '0.82rem',
                    }}>
                        <ArrowLeft size={14} /> {t('gallery.q.back')}
                    </button>
                )}
                <button type="button" data-question-skip onClick={onSkip} style={{
                    background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', textDecoration: 'underline',
                }}>
                    {t('gallery.q.skip')}
                </button>
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: theme.textMuted }}>
                    <b style={{ color: theme.text }}>{resultCount}</b> {t('gallery.q.matching', { count: resultCount })}
                </span>
                {step === 'logo' && (
                    <button type="button" data-question-next disabled={logoBusy} onClick={next} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, cursor: 'pointer', border: 'none',
                        background: theme.gradient, color: 'white', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.84rem', boxShadow: theme.shadowBrand,
                    }}>
                        {index < steps.length - 1 ? t('gallery.q.next') : t('gallery.q.show')} <ArrowRight size={15} />
                    </button>
                )}
            </div>
        </div>
    );
};
