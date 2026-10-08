import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle, ArrowLeft, Bot, Brain, CheckCircle2, Code2, Download, ImagePlus, LayoutTemplate, Loader2, Pencil, Plus,
    RotateCcw, Shuffle, Sparkles, ThumbsDown, ThumbsUp, Trash2, Wand2, XCircle,
} from 'lucide-react';
import type { AiMemoryEntry, AiMemoryInput, GalleryDesignInput } from '../contracts';
import { SECTORS } from '../../sector-templates/types';
import { loadSampleXml, type WizardDocType } from '../../wizard/docTypes';
import { validateXslt, type Check } from '../../wizard/validate';
import { generateDesign, type GeneratedDesign } from './generator';
import { explain, learnedRules, memoryStats, suggestDefaults, toMemoryParams, type LearnedDefaults } from './learner';
import { applyPatch, diffParams, parseText, type NluMatch } from './nlu';
import { buildPrompt, parsePrompt } from './promptBuilder';
import { customizeSampleXml, isTransformError, renderHtml, withCss } from './preview';
import {
    BANK_CURRENCIES, QR_DOCS, answerSummary, answersToParams, defaultOf, docTypeById, emptyBank, formatIban, moduleIdOf, nextQuestion,
    optionsOf, processLogo, questionById, sectionsFor, validateIban, visibleQuestions, type Question,
} from './questions';
import { C, btn, card, chip, downloadText, errorText, ghostBtn, input, label, slug } from './styles';
import type { Answers, BankAccount, DesignParams, TextKey } from './types';
import { isHex, tokenize, uniq } from './utils';
import { COLOR_MODES, FONTS, LOGO_POSITIONS, NAMED_COLORS, QR_POSITIONS, STYLES, colorName } from './vocab';

export interface AiDesignerService {
    listMemory(docTypeId?: string): Promise<AiMemoryEntry[]>;
    saveMemory(input: AiMemoryInput): Promise<AiMemoryEntry>;
    updateMemory(id: number, patch: { rating?: -1 | 0 | 1; published?: boolean; gallery_id?: number | null }): Promise<AiMemoryEntry>;
    publishToGallery(input: GalleryDesignInput): Promise<{ id: number }>;
}

export interface AiDesignerProps {
    service: AiDesignerService;
    onOpenInEditor?: (moduleId: string, xslt: string, name: string, xml: string) => void;
}

type Phase = 'ask' | 'prompt' | 'result';

/** Soru kimliği = öğrenilen yamadaki parametre anahtarı olan sorular. */
const LEARNABLE = new Set(['style', 'accent', 'colorMode', 'font', 'logoPosition', 'logoSize', 'qrPosition', 'bankPosition', 'paper']);

const learnedValue = (q: Question, learned: LearnedDefaults | null): unknown =>
    (learned && LEARNABLE.has(q.id) ? (learned.patch as Record<string, unknown>)[q.id] : undefined);

function initialValue(q: Question, a: Answers, learned: LearnedDefaults | null): unknown {
    if (q.id in a) return a[q.id];
    const base = defaultOf(q, a);
    const lv = learnedValue(q, learned);
    if (lv !== undefined) return lv;
    if (q.id === 'sections' && learned?.patch.sections) {
        const on = new Set(Array.isArray(base) ? base.map(String) : []);
        for (const [id, v] of Object.entries(learned.patch.sections)) {
            if (v) on.add(id);
            else on.delete(id);
        }
        return [...on];
    }
    return base;
}

/** Hafızaya firma verisi (logo, IBAN) yazılmaz. */
const memoryAnswers = (a: Answers): Answers => {
    const { logo, banks, ...rest } = a;
    return { ...rest, hasLogo: typeof logo === 'string' && logo.length > 0, bankCount: Array.isArray(banks) ? banks.length : 0 };
};

// ---------------------------------------------------------------------------
// Küçük parçalar
// ---------------------------------------------------------------------------
const BotBubble: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${C.brand}, ${C.brand2})` }}>
            <Bot size={16} color="white" />
        </div>
        <div style={{ ...card, boxShadow: 'none', background: C.panel2, borderRadius: '4px 14px 14px 14px', padding: '10px 13px', color: C.text, fontSize: '0.87rem', maxWidth: 620, lineHeight: 1.5 }}>
            {children}
        </div>
    </div>
);

const UserBubble: React.FC<{ children: React.ReactNode; onEdit?: () => void }> = ({ children, onEdit }) => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, alignItems: 'center' }}>
        {onEdit && (
            <button type="button" onClick={onEdit} title="Bu cevabı değiştir" style={{ ...ghostBtn({ padding: '4px 7px', borderRadius: 8 }) }}>
                <Pencil size={12} />
            </button>
        )}
        <div style={{ background: `${C.brand}33`, border: `1px solid ${C.brand}66`, borderRadius: '14px 4px 14px 14px', padding: '8px 12px', color: C.strong, fontSize: '0.85rem', maxWidth: 520 }}>
            {children}
        </div>
    </div>
);

const Swatch: React.FC<{ color: string; active: boolean; title: string; onClick: () => void }> = ({ color, active, title, onClick }) => (
    <button type="button" title={title} onClick={onClick} data-ai-swatch={color} style={{
        width: 28, height: 28, borderRadius: 999, background: color, cursor: 'pointer', padding: 0,
        border: active ? '3px solid white' : `2px solid ${C.border}`, boxShadow: active ? `0 0 0 2px ${color}` : 'none',
    }} />
);

const CheckList: React.FC<{ checks: Check[] }> = ({ checks }) => {
    const errors = checks.filter(c => c.level === 'error');
    const warns = checks.filter(c => c.level === 'warn');
    const oks = checks.filter(c => c.level === 'ok');
    return (
        <div data-ai-validation style={{ display: 'grid', gap: 5, fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 800, color: errors.length ? C.err : warns.length ? C.warn : C.ok }}>
                {errors.length ? <XCircle size={15} /> : warns.length ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                {errors.length ? `${errors.length} hata` : warns.length ? `${warns.length} uyarı` : `GİB denetimi geçti (${oks.length} kontrol)`}
            </div>
            {[...errors, ...warns].map((c, i) => (
                <div key={i} style={{ color: c.level === 'error' ? C.err : C.warn, paddingLeft: 21 }}>{c.text}</div>
            ))}
        </div>
    );
};

const Thumb: React.FC<{ html: string; active: boolean; caption: string; onClick: () => void }> = ({ html, active, caption, onClick }) => (
    <button type="button" onClick={onClick} data-ai-variant={caption} style={{
        width: 150, height: 200, overflow: 'hidden', position: 'relative', padding: 0, background: '#fff', cursor: 'pointer', borderRadius: 10,
        border: active ? `3px solid ${C.brand}` : `1px solid ${C.border}`, flexShrink: 0,
    }}>
        <iframe title={caption} tabIndex={-1} sandbox="allow-scripts" srcDoc={withCss(html, 'html,body{overflow:hidden!important}')}
            style={{ width: 794, height: 1060, border: 0, transform: 'scale(0.189)', transformOrigin: '0 0', pointerEvents: 'none' }} />
        <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '4px 0', background: active ? C.brand : 'rgba(30, 27, 75, 0.72)', color: 'white', fontSize: '0.72rem', fontWeight: 800 }}>
            {caption}
        </span>
    </button>
);

// ---------------------------------------------------------------------------
// Soru girişi (her soru için ayrı durum; key ile sıfırlanır)
// ---------------------------------------------------------------------------
interface QuestionInputProps {
    q: Question;
    answers: Answers;
    learned: LearnedDefaults | null;
    logoColor: string | null;
    onAnswer: (value: unknown, extra?: { logoColor?: string | null }) => void;
}

const QuestionInput: React.FC<QuestionInputProps> = ({ q, answers, learned, logoColor, onAnswer }) => {
    const [value, setValue] = useState<unknown>(() => initialValue(q, answers, learned));
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const options = optionsOf(q, answers);
    const suggested = learnedValue(q, learned) ?? defaultOf(q, answers);
    const skip = q.optional ? <button type="button" onClick={() => onAnswer(q.type === 'multi' || q.type === 'bank-list' ? [] : '')} style={ghostBtn()}>Atla</button> : null;

    switch (q.type) {
        case 'choice':
            return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {options.map(o => (
                        <button key={o.id} type="button" title={o.help} data-ai-option={o.id} onClick={() => onAnswer(o.id)} style={chip(suggested === o.id, o.color ?? C.brand)}>
                            {o.color && <span style={{ width: 9, height: 9, borderRadius: 99, background: o.color }} />}
                            {o.label}
                            {suggested === o.id && learnedValue(q, learned) !== undefined && <Sparkles size={12} color={C.warn} />}
                        </button>
                    ))}
                    {skip}
                </div>
            );
        case 'multi': {
            const sel = new Set(Array.isArray(value) ? value.map(String) : []);
            const toggle = (id: string) => setValue([...(sel.has(id) ? [...sel].filter(x => x !== id) : [...sel, id])]);
            return (
                <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {options.map(o => (
                            <button key={o.id} type="button" title={o.help} data-ai-option={o.id} onClick={() => toggle(o.id)} style={chip(sel.has(o.id))}>
                                {sel.has(o.id) ? '✓ ' : ''}{o.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" data-ai-next onClick={() => onAnswer([...sel])} style={btn(C.brand)}>Devam</button>
                        {skip}
                    </div>
                </div>
            );
        }
        case 'text':
        case 'textarea': {
            const text = typeof value === 'string' ? value : '';
            const key = q.id.startsWith('text_') ? q.id.slice(5) as TextKey : null;
            const ideas = key ? learned?.texts[key] ?? [] : [];
            const Field = q.type === 'textarea' ? 'textarea' : 'input';
            return (
                <div style={{ display: 'grid', gap: 8 }}>
                    {ideas.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {ideas.map(t => (
                                <button key={t} type="button" onClick={() => setValue(t)} style={chip(text === t, C.brand2)}>
                                    <Sparkles size={12} /> {t.length > 50 ? `${t.slice(0, 50)}…` : t}
                                </button>
                            ))}
                        </div>
                    )}
                    <Field value={text} placeholder={q.placeholder} data-ai-input autoFocus
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' && Field === 'input' && (text.trim() || q.optional)) onAnswer(text.trim()); }}
                        style={{ ...input, ...(Field === 'textarea' ? { minHeight: 80, resize: 'vertical' } : {}) }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" data-ai-next disabled={!text.trim() && !q.optional} onClick={() => onAnswer(text.trim())}
                            style={btn(C.brand, { opacity: !text.trim() && !q.optional ? 0.5 : 1 })}>Devam</button>
                        {skip}
                    </div>
                </div>
            );
        }
        case 'color': {
            const sector = SECTORS.find(s => s.id === answers.sector);
            const learnedAccent = learned?.patch.accent;
            const picks = uniq([logoColor, learnedAccent, sector?.color, ...NAMED_COLORS.map(c => c.hex)].filter((c): c is string => isHex(c)));
            const cur = isHex(value) ? value : C.brand;
            const why = (c: string) => [c === logoColor ? 'logodan' : '', c === learnedAccent ? 'öğrenilen' : '', c === sector?.color ? 'sektör rengi' : '']
                .filter(Boolean).join(', ');
            return (
                <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        {picks.map(c => (
                            <Swatch key={c} color={c} active={cur === c} title={`${colorName(c) ?? c}${why(c) ? ` (${why(c)})` : ''}`} onClick={() => setValue(c)} />
                        ))}
                        <input type="color" value={cur} onChange={e => setValue(e.target.value)} title="Özel renk"
                            style={{ width: 40, height: 30, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ width: 22, height: 22, borderRadius: 6, background: cur }} />
                        <span style={{ color: C.text, fontSize: '0.84rem' }}>{colorName(cur) ?? cur}{why(cur) ? ` · ${why(cur)}` : ''}</span>
                        <button type="button" data-ai-next onClick={() => onAnswer(cur)} style={btn(C.brand)}>Bu renk olsun</button>
                    </div>
                </div>
            );
        }
        case 'image': {
            const src = typeof value === 'string' && value ? value : '';
            return (
                <div style={{ display: 'grid', gap: 10 }}>
                    <label style={{ ...ghostBtn({ width: 'fit-content', cursor: busy ? 'wait' : 'pointer' }) }}>
                        {busy ? <Loader2 size={15} className="spin" /> : <ImagePlus size={15} />} {src ? 'Başka logo seç' : 'Logo dosyası seç'}
                        <input type="file" accept="image/*" data-ai-logo hidden onChange={async e => {
                            const f = e.target.files?.[0];
                            e.target.value = '';
                            if (!f) return;
                            setBusy(true);
                            setErr('');
                            try {
                                const r = await processLogo(f);
                                setValue(r.dataUrl);
                                if (r.color) onAnswer(r.dataUrl, { logoColor: r.color });
                                else onAnswer(r.dataUrl, { logoColor: null });
                            } catch (ex) {
                                setErr(errorText(ex));
                            } finally {
                                setBusy(false);
                            }
                        }} />
                    </label>
                    {err && <div style={{ color: C.err, fontSize: '0.8rem' }}>{err}</div>}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" onClick={() => onAnswer('')} style={ghostBtn()}>Logosuz devam et</button>
                    </div>
                </div>
            );
        }
        case 'bank-list': {
            const banks = Array.isArray(value) ? value as BankAccount[] : [];
            const set = (i: number, patch: Partial<BankAccount>) => setValue(banks.map((b, j) => (j === i ? { ...b, ...patch } : b)));
            const problems = banks.map(b => (b.iban.trim() ? validateIban(b.iban) : 'IBAN boş'));
            const ok = banks.length > 0 && problems.every(p => !p) && banks.every(b => b.bank.trim());
            return (
                <div style={{ display: 'grid', gap: 10 }}>
                    {banks.map((b, i) => (
                        <div key={i} data-ai-bank={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 7, padding: 10, borderRadius: 12, border: `1px solid ${C.border}` }}>
                            <input style={input} placeholder="Banka adı" value={b.bank} onChange={e => set(i, { bank: e.target.value })} />
                            <input style={input} placeholder="Şube" value={b.branch} onChange={e => set(i, { branch: e.target.value })} />
                            <input style={input} placeholder="Hesap sahibi" value={b.holder} onChange={e => set(i, { holder: e.target.value })} />
                            <select style={input} value={b.currency} onChange={e => set(i, { currency: e.target.value })}>
                                {BANK_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input style={{ ...input, gridColumn: '1 / -1', fontFamily: 'Consolas, monospace', borderColor: b.iban && problems[i] ? C.err : C.border }}
                                placeholder="TR00 0000 0000 0000 0000 0000 00" value={b.iban}
                                onChange={e => set(i, { iban: e.target.value })} onBlur={() => !validateIban(b.iban) && set(i, { iban: formatIban(b.iban) })} />
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                                <span style={{ color: problems[i] ? C.err : C.ok }}>{problems[i] ?? 'IBAN geçerli'}</span>
                                <button type="button" onClick={() => setValue(banks.filter((_, j) => j !== i))} style={ghostBtn({ padding: '4px 8px' })}><Trash2 size={13} /> Kaldır</button>
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => setValue([...banks, emptyBank()])} style={ghostBtn()}><Plus size={14} /> Hesap ekle</button>
                        {banks.length > 0 && (
                            <button type="button" data-ai-next disabled={!ok} onClick={() => onAnswer(banks.map(b => ({ ...b, iban: formatIban(b.iban) })))}
                                style={btn(C.brand, { opacity: ok ? 1 : 0.5 })}>Devam</button>
                        )}
                        <button type="button" onClick={() => onAnswer([])} style={ghostBtn()}>Banka bilgisi eklemeden devam et</button>
                    </div>
                </div>
            );
        }
        case 'toggle':
            return (
                <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => onAnswer(true)} style={chip(value === true)}>Evet</button>
                    <button type="button" onClick={() => onAnswer(false)} style={chip(value === false)}>Hayır</button>
                </div>
            );
        default:
            return null;
    }
};

// ---------------------------------------------------------------------------
// Ana bileşen
// ---------------------------------------------------------------------------
interface Rendered { variant: number; design: GeneratedDesign | null; html: string; failed: boolean; error?: string }

export const AiDesigner: React.FC<AiDesignerProps> = ({ service, onOpenInEditor }) => {
    const [memory, setMemory] = useState<AiMemoryEntry[]>([]);
    const [memoryError, setMemoryError] = useState('');
    const [phase, setPhase] = useState<Phase>('ask');
    const [answers, setAnswers] = useState<Answers>({});
    const [order, setOrder] = useState<string[]>([]);
    const [logoColor, setLogoColor] = useState<string | null>(null);
    const [sample, setSample] = useState<{ id: string; xml: string } | null>(null);
    const [sampleError, setSampleError] = useState('');
    const [promptText, setPromptText] = useState('');
    const [extraMatches, setExtraMatches] = useState<NluMatch[]>([]);
    const [matches, setMatches] = useState<NluMatch[]>([]);
    const [params, setParams] = useState<DesignParams | null>(null);
    const [baseParams, setBaseParams] = useState<DesignParams | null>(null);
    const [variantBase, setVariantBase] = useState(0);
    const [saved, setSaved] = useState<{ id: number; sig: string; rating: -1 | 0 | 1; published: boolean } | null>(null);
    const [busy, setBusy] = useState('');
    const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
    const [pub, setPub] = useState<{ name: string; description: string; tags: string } | null>(null);

    const reloadMemory = () => service.listMemory().then(m => { setMemory(m); setMemoryError(''); }).catch(e => setMemoryError(errorText(e)));
    useEffect(() => {
        let alive = true;
        service.listMemory().then(m => { if (alive) setMemory(m); }).catch(e => { if (alive) setMemoryError(errorText(e)); });
        return () => { alive = false; };
    }, [service]);

    const docTypeId = typeof answers.docTypeId === 'string' ? answers.docTypeId : '';
    const dt: WizardDocType | undefined = docTypeId ? docTypeById(docTypeId) : undefined;
    const category = String(answers.category ?? '');
    const sector = String(answers.sector ?? '');

    useEffect(() => {
        if (!dt) return;
        let alive = true;
        loadSampleXml(dt)
            .then(xml => { if (alive) { setSample({ id: dt.id, xml }); setSampleError(''); } })
            .catch(e => { if (alive) setSampleError(errorText(e)); });
        return () => { alive = false; };
    }, [dt]);
    const xml = sample && dt && sample.id === dt.id ? sample.xml : null;

    const rules = useMemo(() => learnedRules(memory), [memory]);
    const learned = useMemo(() => (docTypeId ? suggestDefaults(docTypeId, category, sector, memory) : null), [docTypeId, category, sector, memory]);
    const insights = useMemo(() => explain(memory, { docTypeId, sector }), [memory, docTypeId, sector]);
    const stats = useMemo(() => memoryStats(memory), [memory]);

    const question = phase === 'ask' ? nextQuestion(answers) : null;
    const visibleCount = visibleQuestions(answers).length;

    const answer = (q: Question, value: unknown, extra?: { logoColor?: string | null }) => {
        setAnswers(a => ({ ...a, [q.id]: value }));
        setOrder(o => [...o.filter(id => id !== q.id), q.id]);
        if (extra && 'logoColor' in extra) setLogoColor(extra.logoColor ?? null);
    };

    /** i. cevaptan itibaren sonrakileri siler; soru yeniden sorulur. */
    const editFrom = (i: number) => {
        const drop = new Set(order.slice(i));
        setAnswers(a => Object.fromEntries(Object.entries(a).filter(([k]) => !drop.has(k))));
        setOrder(order.slice(0, i));
        if (drop.has('logo')) setLogoColor(null);
        setPhase('ask');
    };

    const reset = () => {
        setPhase('ask'); setAnswers({}); setOrder([]); setLogoColor(null); setPromptText(''); setMatches([]); setExtraMatches([]);
        setParams(null); setBaseParams(null); setVariantBase(0); setSaved(null); setNotice(null); setPub(null);
    };

    const toPrompt = () => {
        if (!dt) return;
        let p = answersToParams(answers);
        let m: NluMatch[] = [];
        if (p.extra) {
            const r = parseText(p.extra, dt.id, rules);
            p = applyPatch(p, r.patch);
            m = r.matches;
        }
        setExtraMatches(m);
        setParams(p);
        setPromptText(buildPrompt(p, dt));
        setPhase('prompt');
    };

    const generate = () => {
        if (!dt || !params) return;
        const r = parsePrompt(promptText, params, dt, rules);
        const p = { ...r.params, variant: 0 };
        setMatches(r.matches);
        setParams(p);
        setBaseParams(p);
        setVariantBase(0);
        setSaved(null);
        setNotice(null);
        setPub(null);
        setPhase('result');
    };

    const rendered = useMemo<Rendered[]>(() => {
        if (phase !== 'result' || !params || !dt || !xml) return [];
        const data = customizeSampleXml(xml, params, dt);
        return [0, 1, 2].map(i => {
            const variant = variantBase + i;
            try {
                const design = generateDesign({ ...params, variant }, dt, { variant });
                const html = renderHtml(data, design.xslt);
                return { variant, design, html, failed: isTransformError(html) };
            } catch (e) {
                return { variant, design: null, html: '', failed: true, error: errorText(e) };
            }
        });
    }, [phase, params, dt, xml, variantBase]);

    const current = rendered.find(r => r.variant === params?.variant) ?? rendered[0];
    const checks = useMemo(() => (current?.design && dt && xml ? validateXslt(current.design.xslt, dt, xml).checks : []), [current, dt, xml]);
    const previewXml = params && dt && xml ? customizeSampleXml(xml, params, dt) : '';

    const update = (patch: Partial<DesignParams>) => setParams(p => (p ? { ...p, ...patch } : p));
    const setSection = (id: string, on: boolean) => setParams(p => (p ? { ...p, sections: { ...p.sections, [id]: on } } : p));

    const learnedFrom = () => {
        if (!params || !baseParams) return undefined;
        const changes = diffParams(baseParams, params);
        const tokens = uniq(tokenize(params.extra)).slice(0, 8);
        return tokens.length && Object.keys(changes).length ? { tokens, changes } : undefined;
    };
    const signature = () => (params ? JSON.stringify(toMemoryParams(params)) : '');

    /** Güncel tasarımı hafızaya yazar (aynı parametreler zaten kayıtlıysa yalnız oyu günceller). */
    const remember = async (rating: -1 | 0 | 1): Promise<number> => {
        if (!params || !dt) throw new Error('Tasarım yok');
        const sig = signature();
        if (saved && saved.sig === sig) {
            if (saved.rating !== rating) await service.updateMemory(saved.id, { rating });
            setSaved({ ...saved, rating });
            return saved.id;
        }
        const entry = await service.saveMemory({
            doc_type_id: dt.id, category: params.category, sector: params.sector, prompt: promptText,
            answers: memoryAnswers(answers), params: { ...toMemoryParams(params, learnedFrom()) }, rating,
        });
        setSaved({ id: entry.id, sig, rating: entry.rating, published: entry.published });
        return entry.id;
    };

    const rate = async (rating: -1 | 1) => {
        setBusy('rate');
        setNotice(null);
        try {
            await remember(rating);
            await reloadMemory();
            setNotice({ ok: true, text: rating > 0 ? 'Teşekkürler! Bu tercihleri hafızama aldım; benzer tasarımlarda önereceğim.' : 'Not aldım; bu tercihleri benzer tasarımlarda daha az önereceğim. Ayarları değiştirip yeniden deneyebilirsiniz.' });
        } catch (e) {
            setNotice({ ok: false, text: `Hafızaya yazılamadı: ${errorText(e)}` });
        } finally {
            setBusy('');
        }
    };

    const openPublish = () => {
        if (!current?.design) return;
        setPub({ name: current.design.name, description: current.design.description, tags: current.design.tags.join(', ') });
    };

    const publish = async () => {
        if (!pub || !params || !dt || !current?.design) return;
        setBusy('publish');
        setNotice(null);
        try {
            const tags = uniq(pub.tags.split(',').map(t => t.trim()).filter(Boolean));
            const g = await service.publishToGallery({
                name: pub.name.trim() || current.design.name, description: pub.description.trim(), doc_type_id: dt.id, module_id: moduleIdOf(dt.id),
                sector: params.sector, category: params.category, accent: current.design.accent, tags, xslt: current.design.xslt, xml: previewXml,
                published: true, source: 'ai',
            });
            const id = await remember(saved && saved.sig === signature() ? saved.rating : 0);
            await service.updateMemory(id, { published: true, gallery_id: g.id });
            setSaved(s => (s ? { ...s, published: true } : s));
            setPub(null);
            await reloadMemory();
            setNotice({ ok: true, text: `“${pub.name}” galeriye eklendi; kullanıcılar hazır şablonlarda görebilir.` });
        } catch (e) {
            setNotice({ ok: false, text: `Galeriye eklenemedi: ${errorText(e)}` });
        } finally {
            setBusy('');
        }
    };

    const showQr = Boolean(params && QR_DOCS.includes(params.docTypeId) && params.paper !== 'fis80');
    const sectionList = params ? sectionsFor(params.docTypeId) : [];
    const progress = visibleCount ? Math.round((order.filter(id => id in answers).length / visibleCount) * 100) : 0;

    // -----------------------------------------------------------------------
    const learnedPanel = (
        <aside style={{ ...card, padding: 16, flex: '0 1 300px', minWidth: 260, alignSelf: 'flex-start', display: 'grid', gap: 12 }} data-ai-learned>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.strong, fontWeight: 800 }}><Brain size={17} color={C.brand2} /> Öğrendiklerim</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, textAlign: 'center' }}>
                {[['Kayıt', stats.total], ['Beğeni', stats.liked], ['Galeri', stats.published], ['Düzeltme', stats.corrections]].map(([k, v]) => (
                    <div key={k} style={{ background: C.panel2, borderRadius: 10, padding: '6px 2px' }}>
                        <div style={{ color: C.strong, fontWeight: 800 }}>{v}</div>
                        <div style={{ color: C.muted, fontSize: '0.68rem' }}>{k}</div>
                    </div>
                ))}
            </div>
            {memoryError && <div style={{ color: C.err, fontSize: '0.78rem' }}>Hafıza okunamadı: {memoryError}</div>}
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 7, color: C.text, fontSize: '0.8rem', lineHeight: 1.45 }}>
                {insights.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
        </aside>
    );

    const suggestionChips = learned && learned.suggestions.length > 0 && (
        <BotBubble>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, fontWeight: 700 }}><Sparkles size={14} color={C.warn} /> Önceki tasarımlardan öğrendim:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {learned.suggestions.slice(0, 6).map(s => (
                    <span key={s.key} style={{ ...chip(true, C.brand2), cursor: 'default' }} title={`${s.votes} olumlu oy`}>{s.label}</span>
                ))}
            </div>
            <div style={{ color: C.muted, fontSize: '0.76rem', marginTop: 6 }}>Bunları varsayılan olarak işaretledim; dilediğiniz gibi değiştirebilirsiniz.</div>
        </BotBubble>
    );

    let main: React.ReactNode;
    if (phase === 'ask') {
        main = (
            <div style={{ display: 'grid', gap: 12 }} data-ai-phase="ask">
                <div style={{ height: 6, borderRadius: 99, background: C.panel2, overflow: 'hidden' }}>
                    <div style={{ width: `${question ? progress : 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.brand}, ${C.brand2})`, transition: 'width 0.25s' }} />
                </div>
                <BotBubble>
                    Merhaba! Birkaç soru sorarak belgeniz için tasarım hazırlayacağım. Cevaplarınızdan bir istem yazacağım; onu düzenleyip tasarımı oluşturabilirsiniz.
                </BotBubble>
                {order.map((id, i) => {
                    const q = questionById(id);
                    if (!q || !(id in answers)) return null;
                    return (
                        <React.Fragment key={id}>
                            <BotBubble>{q.label}</BotBubble>
                            <UserBubble onEdit={() => editFrom(i)}>
                                {q.type === 'image' && typeof answers[id] === 'string' && answers[id]
                                    ? <img src={answers[id] as string} alt="Logo" style={{ maxHeight: 44, maxWidth: 180, background: 'white', borderRadius: 6, padding: 3, verticalAlign: 'middle' }} />
                                    : q.type === 'color' && isHex(answers[id])
                                        ? <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span style={{ width: 14, height: 14, borderRadius: 4, background: answers[id] as string }} />{colorName(answers[id] as string) ?? String(answers[id])}</span>
                                        : answerSummary(q, answers[id], answers)}
                            </UserBubble>
                            {id === 'sector' && suggestionChips}
                        </React.Fragment>
                    );
                })}
                {question ? (
                    <>
                        <BotBubble>
                            <div style={{ fontWeight: 700, color: C.strong }} data-ai-question={question.id}>{question.label}</div>
                            {question.help && <div style={{ color: C.muted, fontSize: '0.78rem', marginTop: 3 }}>{question.help}</div>}
                        </BotBubble>
                        <div style={{ paddingLeft: 40 }}>
                            <QuestionInput key={question.id} q={question} answers={answers} learned={learned} logoColor={logoColor}
                                onAnswer={(v, extra) => answer(question, v, extra)} />
                        </div>
                        {order.length > 0 && (
                            <div style={{ paddingLeft: 40 }}>
                                <button type="button" onClick={() => editFrom(order.length - 1)} style={ghostBtn({ padding: '5px 10px' })}><ArrowLeft size={13} /> Geri</button>
                            </div>
                        )}
                    </>
                ) : (
                    <BotBubble>
                        <div style={{ marginBottom: 8 }}>Hepsi bu kadar! Cevaplarınızdan tasarım istemini hazırlayayım.</div>
                        <button type="button" data-ai-to-prompt onClick={toPrompt} style={btn(C.brand)}><Wand2 size={15} /> İstemi hazırla</button>
                    </BotBubble>
                )}
            </div>
        );
    } else if (phase === 'prompt') {
        main = (
            <div style={{ display: 'grid', gap: 12 }} data-ai-phase="prompt">
                <BotBubble>
                    Cevaplarınızdan aşağıdaki istemi oluşturdum. Satırları değiştirebilir, yeni istekler yazabilirsiniz (ör. <i>“lacivert olsun, logo sağda, iskonto olmasın”</i>). Değişiklikleri anlayıp tasarıma yansıtacağım.
                </BotBubble>
                {extraMatches.length > 0 && (
                    <BotBubble>
                        <div style={{ fontWeight: 700, marginBottom: 5 }}>Ek isteklerinizden anladıklarım:</div>
                        <MatchList matches={extraMatches} />
                    </BotBubble>
                )}
                <div style={{ ...card, padding: 14, display: 'grid', gap: 10 }}>
                    <span style={label}>Tasarım istemi</span>
                    <textarea data-ai-prompt value={promptText} onChange={e => setPromptText(e.target.value)}
                        style={{ ...input, minHeight: 280, resize: 'vertical', lineHeight: 1.55, fontFamily: 'Consolas, "Segoe UI", monospace', fontSize: '0.82rem' }} />
                    {sampleError && <div style={{ color: C.err, fontSize: '0.8rem' }}>Örnek XML yüklenemedi: {sampleError}</div>}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button type="button" data-ai-generate onClick={generate} disabled={!xml} style={btn(C.brand, { opacity: xml ? 1 : 0.5 })}>
                            {xml ? <Sparkles size={15} /> : <Loader2 size={15} className="spin" />} Tasarımı oluştur
                        </button>
                        <button type="button" onClick={() => params && dt && setPromptText(buildPrompt(params, dt))} style={ghostBtn()}><RotateCcw size={14} /> İstemi sıfırla</button>
                        <button type="button" onClick={() => setPhase('ask')} style={ghostBtn()}><ArrowLeft size={14} /> Sorulara dön</button>
                    </div>
                </div>
            </div>
        );
    } else {
        main = (
            <div style={{ display: 'grid', gap: 12 }} data-ai-phase="result">
                {matches.length > 0 && (
                    <BotBubble>
                        <div style={{ fontWeight: 700, marginBottom: 5 }}>İstemden anladıklarım:</div>
                        <MatchList matches={matches} />
                    </BotBubble>
                )}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    {rendered.map(r => (
                        <Thumb key={r.variant} html={r.html} active={r.variant === params?.variant} caption={`Varyasyon ${r.variant + 1}`}
                            onClick={() => update({ variant: r.variant })} />
                    ))}
                    <button type="button" data-ai-more onClick={() => { const v = variantBase + 3; setVariantBase(v); update({ variant: v }); }} style={ghostBtn({ height: 40 })}>
                        <Shuffle size={14} /> Farklı varyasyonlar
                    </button>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ ...card, flex: '1 1 520px', minWidth: 300, overflow: 'hidden', background: '#e2e8f0' }}>
                        {current?.failed
                            ? <div style={{ padding: 20, color: '#991b1b' }}>Tasarım üretilemedi: {current.error ?? 'XSLT dönüşümü başarısız'}</div>
                            : <iframe title="Tasarım önizleme" data-ai-preview sandbox="allow-scripts" srcDoc={current?.html ?? ''} style={{ width: '100%', height: 980, border: 0, background: 'white', display: 'block' }} />}
                    </div>
                    <div style={{ flex: '0 1 330px', minWidth: 280, display: 'grid', gap: 12 }}>
                        <div style={{ ...card, padding: 14, display: 'grid', gap: 10 }}>
                            <div style={{ color: C.strong, fontWeight: 800 }}>{current?.design?.name}</div>
                            <CheckList checks={checks} />
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button type="button" data-ai-like disabled={!!busy} onClick={() => rate(1)} style={btn(saved?.rating === 1 && saved.sig === signature() ? C.ok : 'rgba(34,197,94,0.14)', { color: saved?.rating === 1 && saved.sig === signature() ? 'white' : C.ok })}>
                                    <ThumbsUp size={14} /> Beğendim
                                </button>
                                <button type="button" data-ai-dislike disabled={!!busy} onClick={() => rate(-1)} style={btn(saved?.rating === -1 && saved.sig === signature() ? C.err : 'rgba(239,68,68,0.12)', { color: saved?.rating === -1 && saved.sig === signature() ? 'white' : C.err })}>
                                    <ThumbsDown size={14} /> Beğenmedim
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button type="button" data-ai-publish disabled={!current?.design || checks.some(c => c.level === 'error')} onClick={openPublish}
                                    style={btn(`linear-gradient(135deg, ${C.brand}, ${C.brand2})`)}><LayoutTemplate size={14} /> Galeriye ekle</button>
                                <button type="button" disabled={!current?.design} style={ghostBtn()}
                                    onClick={() => current?.design && downloadText(current.design.xslt, `${slug(current.design.name)}.xslt`)}><Download size={14} /> XSLT indir</button>
                                {onOpenInEditor && current?.design && (
                                    <button type="button" style={ghostBtn()} onClick={() => current.design && dt && onOpenInEditor(moduleIdOf(dt.id), current.design.xslt, current.design.name, previewXml)}>
                                        <Code2 size={14} /> Editörde aç
                                    </button>
                                )}
                            </div>
                            {busy && <div style={{ color: C.muted, fontSize: '0.8rem', display: 'flex', gap: 6, alignItems: 'center' }}><Loader2 size={14} className="spin" /> Kaydediliyor…</div>}
                            {notice && <div data-ai-notice style={{ color: notice.ok ? C.ok : C.err, fontSize: '0.8rem' }}>{notice.text}</div>}
                        </div>

                        {pub && (
                            <div style={{ ...card, padding: 14, display: 'grid', gap: 8 }} data-ai-publish-form>
                                <span style={label}>Galeriye ekle</span>
                                <input style={input} value={pub.name} onChange={e => setPub({ ...pub, name: e.target.value })} placeholder="Şablon adı" />
                                <textarea style={{ ...input, minHeight: 70, resize: 'vertical' }} value={pub.description} onChange={e => setPub({ ...pub, description: e.target.value })} placeholder="Açıklama" />
                                <input style={input} value={pub.tags} onChange={e => setPub({ ...pub, tags: e.target.value })} placeholder="Etiketler (virgülle)" />
                                <div style={{ color: C.muted, fontSize: '0.76rem' }}>
                                    {dt?.label} · {SECTORS.find(s => s.id === params?.sector)?.label ?? 'Sektör yok'} kategorisinde yayınlanacak.
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="button" data-ai-publish-confirm disabled={!!busy || !pub.name.trim()} onClick={publish} style={btn(C.brand)}>Yayınla</button>
                                    <button type="button" onClick={() => setPub(null)} style={ghostBtn()}>Vazgeç</button>
                                </div>
                            </div>
                        )}

                        {params && (
                            <div style={{ ...card, padding: 14, display: 'grid', gap: 12 }} data-ai-tweaks>
                                <span style={label}>İnce ayar (anında yeniden üretir)</span>
                                <Row title="Stil">
                                    {STYLES.map(s => <button key={s.id} type="button" title={s.help} onClick={() => update({ style: s.id })} style={chip(params.style === s.id)}>{s.label}</button>)}
                                </Row>
                                <Row title="Ana renk">
                                    {uniq([logoColor, SECTORS.find(s => s.id === params.sector)?.color, ...NAMED_COLORS.slice(0, 12).map(c => c.hex)].filter((c): c is string => isHex(c))).map(c => (
                                        <Swatch key={c} color={c} active={params.accent === c} title={colorName(c) ?? c} onClick={() => update({ accent: c })} />
                                    ))}
                                    <input type="color" value={params.accent} onChange={e => update({ accent: e.target.value.toLowerCase() })} style={{ width: 34, height: 28, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                                </Row>
                                <Row title="Renk kullanımı">
                                    {COLOR_MODES.map(m => <button key={m.id} type="button" title={m.help} onClick={() => update({ colorMode: m.id })} style={chip(params.colorMode === m.id)}>{m.label}</button>)}
                                </Row>
                                <Row title="Yazı tipi">
                                    <select value={params.font} onChange={e => update({ font: e.target.value as DesignParams['font'] })} style={{ ...input, width: 'auto' }}>
                                        {FONTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                    </select>
                                </Row>
                                {params.paper !== 'fis80' && (
                                    <Row title="Logo konumu">
                                        {LOGO_POSITIONS.map(l => <button key={l.id} type="button" onClick={() => update({ logoPosition: l.id })} style={chip(params.logoPosition === l.id)}>{l.label}</button>)}
                                    </Row>
                                )}
                                {showQr && (
                                    <Row title="Karekod">
                                        {QR_POSITIONS.map(l => <button key={l.id} type="button" onClick={() => update({ qrPosition: l.id })} style={chip(params.qrPosition === l.id)}>{l.label}</button>)}
                                    </Row>
                                )}
                                {sectionList.length > 0 && (
                                    <Row title="Bölümler">
                                        <div style={{ display: 'grid', gap: 4, width: '100%' }}>
                                            {sectionList.map(s => (
                                                <label key={s.id} title={s.help} style={{ display: 'flex', gap: 7, alignItems: 'center', color: C.text, fontSize: '0.8rem', cursor: 'pointer' }}>
                                                    <input type="checkbox" data-ai-section={s.id} checked={Boolean(params.sections[s.id])} onChange={e => setSection(s.id, e.target.checked)} />
                                                    {s.label}
                                                </label>
                                            ))}
                                        </div>
                                    </Row>
                                )}
                                {baseParams && Object.keys(diffParams(baseParams, params)).length > 0 && (
                                    <div style={{ color: C.muted, fontSize: '0.76rem' }}>
                                        Değişiklikleriniz beğeni ya da galeriye ekleme sırasında hafızaya alınır{tokenize(params.extra).length ? '; ek isteklerinizdeki kelimelerle ilişkilendirilerek sonraki istemlerde kullanılır' : ''}.
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button type="button" onClick={() => setPhase('prompt')} style={ghostBtn()}><Pencil size={14} /> İstemi düzenle</button>
                            <button type="button" onClick={() => setPhase('ask')} style={ghostBtn()}><ArrowLeft size={14} /> Sorulara dön</button>
                            <button type="button" data-ai-reset onClick={reset} style={ghostBtn()}><RotateCcw size={14} /> Yeni tasarım</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div data-ai-designer style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <style>{'@keyframes ai-spin{to{transform:rotate(360deg)}}[data-ai-designer] .spin{animation:ai-spin 1s linear infinite}'}</style>
            <div style={{ flex: '1 1 640px', minWidth: 0 }}>{main}</div>
            {learnedPanel}
        </div>
    );
};

const Row: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ display: 'grid', gap: 6 }}>
        <span style={{ color: C.muted, fontSize: '0.74rem', fontWeight: 700 }}>{title}</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>{children}</div>
    </div>
);

const MatchList: React.FC<{ matches: NluMatch[] }> = ({ matches }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {matches.map((m, i) => (
            <span key={i} title={`“${m.phrase}”`} style={{
                ...chip(true, m.source === 'uyari' ? C.warn : m.source === 'ogrenilen' ? C.brand2 : C.brand), cursor: 'default',
            }}>
                {m.source === 'ogrenilen' && <Brain size={12} />}{m.source === 'uyari' && <AlertTriangle size={12} />}{m.effect}
            </span>
        ))}
    </div>
);
