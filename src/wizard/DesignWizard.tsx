import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, XCircle, Upload, FileCode, Database, FileText, Loader2 } from 'lucide-react';
import { WIZARD_DOC_TYPES, FAMILY_INFO, loadSampleXml, type WizardDocType } from './docTypes';
import { validateXslt, validateXml, stripBom, type ValidationResult } from './validate';
import { designKeyOf } from '../api';
import { hasTestWatermark, stripTestWatermark } from '../xslt-editor/utils/testWatermark';

export interface WizardResult {
    moduleId: string;
    docName: string;
    xslt: string;
    xml: string;
}

interface LoadedFile { name: string; size: number; text: string; result: ValidationResult }

const MAX_BYTES = 5 * 1024 * 1024;
const STEPS = ['Belge türü', 'Tasarım (XSLT)', 'Veri (XML)'];

const card = (active: boolean, color = '#6366f1'): React.CSSProperties => ({
    background: active ? `${color}22` : 'rgba(30, 41, 59, 0.45)',
    border: `1px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 14, padding: '14px 16px', cursor: 'pointer', color: 'white',
    textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s', width: '100%',
    boxShadow: active ? `0 0 0 3px ${color}33` : 'none',
});

const readFile = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Dosya okunamadı'));
    reader.readAsText(file);
});

const CheckList: React.FC<{ result: ValidationResult }> = ({ result }) => (
    <div data-wizard-checks={result.ok ? 'ok' : 'error'} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {result.checks.map((c, i) => (
            <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13,
                color: c.level === 'ok' ? '#6ee7b7' : c.level === 'warn' ? '#fcd34d' : '#fca5a5',
            }}>
                {c.level === 'ok' ? <Check size={16} style={{ flexShrink: 0 }} /> : c.level === 'warn' ? <AlertTriangle size={16} style={{ flexShrink: 0 }} /> : <XCircle size={16} style={{ flexShrink: 0 }} />}
                <span>{c.text}</span>
            </div>
        ))}
        {result.info.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 14px', marginTop: 8, fontSize: 12 }}>
                {result.info.map(([k, v]) => (
                    <React.Fragment key={k}>
                        <span style={{ color: '#64748b' }}>{k}</span>
                        <span style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>{v}</span>
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
                    border: `2px dashed ${over ? '#6366f1' : 'rgba(148,163,184,0.3)'}`, borderRadius: 14,
                    padding: '22px 16px', textAlign: 'center', cursor: 'pointer', color: '#94a3b8',
                    background: over ? 'rgba(99,102,241,0.08)' : 'rgba(15,23,42,0.4)',
                }}
            >
                {busy ? <Loader2 size={26} /> : <Upload size={26} />}
                <div style={{ marginTop: 8, fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>
                    {file ? 'Başka dosya seç' : 'Dosya seçin veya buraya sürükleyin'}
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>{hint}</div>
            </div>
            {file && (
                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 14 }}>
                    <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                            <FileCode size={16} color="#a5b4fc" />
                            <span data-wizard-file-name style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                            <span style={{ color: '#64748b', fontWeight: 400, marginLeft: 'auto', flexShrink: 0 }}>{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <pre style={{
                            margin: 0, maxHeight: 220, overflow: 'auto', fontSize: 11, lineHeight: 1.45,
                            color: '#cbd5e1', background: '#020617', borderRadius: 8, padding: 10, whiteSpace: 'pre',
                        }}>{stripBom(file.text).split('\n').slice(0, 40).join('\n')}</pre>
                    </div>
                    <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Uygunluk kontrolü</div>
                        <CheckList result={file.result} />
                    </div>
                </div>
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
    const [step, setStep] = useState(0);
    const [docType, setDocType] = useState<WizardDocType | null>(null);
    const [sampleXml, setSampleXml] = useState<string | null>(null);
    const [xsltChoice, setXsltChoice] = useState<string>('');
    const [ownXslt, setOwnXslt] = useState<LoadedFile | null>(null);
    const [ownXsltWasTest, setOwnXsltWasTest] = useState(false);
    const [xmlChoice, setXmlChoice] = useState<'default' | 'own'>('default');
    const [ownXml, setOwnXml] = useState<LoadedFile | null>(null);
    const [xsltText, setXsltText] = useState<string | null>(null);
    const [defaultXmlResult, setDefaultXmlResult] = useState<ValidationResult | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!docType) return;
        let alive = true;
        setSampleXml(null);
        loadSampleXml(docType).then(t => { if (alive) setSampleXml(t); }).catch(e => alive && setError(e.message));
        return () => { alive = false; };
    }, [docType]);

    const selectedDefault = docType?.defaults.find(d => d.id === xsltChoice) ?? null;

    const pickDocType = (t: WizardDocType) => {
        if (t.id !== docType?.id) {
            setDocType(t);
            setXsltChoice(t.defaults[0].id);
            setOwnXslt(null);
            setOwnXml(null);
            setXmlChoice('default');
        }
        setStep(1);
    };

    const loadOwn = async (file: File, kind: 'xslt' | 'xml') => {
        if (!docType) return;
        setError(null);
        if (file.size > MAX_BYTES) { setError(`Dosya çok büyük (en fazla 5 MB): ${(file.size / 1024 / 1024).toFixed(1)} MB`); return; }
        setBusy(true);
        try {
            const raw = await readFile(file);
            const wasTest = kind === 'xslt' && hasTestWatermark(raw);
            const text = wasTest ? stripTestWatermark(raw) : raw;
            if (kind === 'xslt') setOwnXsltWasTest(wasTest);
            const result = kind === 'xslt' ? validateXslt(text, docType, sampleXml) : validateXml(text, docType, xsltText);
            const loaded = { name: file.name, size: file.size, text, result };
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
            if (!text) throw new Error('XSLT yüklenemedi');
            setXsltText(text);
            const sample = sampleXml ?? await loadSampleXml(docType);
            setSampleXml(sample);
            setDefaultXmlResult(validateXml(sample, docType, text));
            if (ownXml) setOwnXml({ ...ownXml, result: validateXml(ownXml.text, docType, text) });
            setStep(2);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    };

    const finish = () => {
        if (!docType || !xsltText) return;
        const xml = xmlChoice === 'own' ? ownXml?.text : sampleXml;
        if (!xml) return;
        onFinish({
            moduleId: xsltChoice === 'own' ? docType.id : selectedDefault?.moduleId ?? docType.id,
            docName: xsltChoice === 'own' && ownXslt ? ownXslt.name.replace(/\.(xslt|xsl)$/i, '') : `${docType.label} Tasarımı`,
            xslt: xsltText,
            xml,
        });
    };

    const canNext = step === 1
        ? (xsltChoice === 'own' ? !!ownXslt?.result.ok : !!selectedDefault) && !!sampleXml
        : step === 2
            ? (xmlChoice === 'own' ? !!ownXml?.result.ok : !!defaultXmlResult?.ok)
            : false;

    const sectionTitle = (t: string, sub: string) => (
        <div style={{ marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{t}</h2>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14 }}>{sub}</p>
        </div>
    );

    return (
        <div data-design-wizard data-wizard-step={step} style={{
            width: '100%', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: '28px 28px 22px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', color: 'white',
        }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 26 }}>
                {STEPS.map((s, i) => (
                    <div key={s} style={{ flex: 1 }}>
                        <div style={{ height: 4, borderRadius: 4, background: i <= step ? 'linear-gradient(90deg,#6366f1,#0ea5e9)' : 'rgba(148,163,184,0.2)' }} />
                        <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: i === step ? '#e2e8f0' : '#64748b' }}>
                            {i + 1}. {s}{i < step && i === 0 && docType ? ` · ${docType.label}` : ''}
                        </div>
                    </div>
                ))}
            </div>

            {step === 0 && (
                <>
                    {sectionTitle('Hangi belgeyi tasarlayacaksınız?', 'Belge türünü seçin; şablon ve veri kontrolleri bu türe göre yapılır.')}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                        {WIZARD_DOC_TYPES.map(t => (
                            <button key={t.id} type="button" data-doc-type={t.id} onClick={() => pickDocType(t)} style={card(docType?.id === t.id, t.color)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${t.color}26`, color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>{t.label}</div>
                                        <div style={{ color: '#94a3b8', fontSize: 12 }}>{t.description}</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {step === 1 && docType && (
                <>
                    {sectionTitle(`${docType.label} için tasarım şablonu`, 'Hazır bir şablonla başlayın ya da kendi XSLT dosyanızı yükleyin.')}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                        {docType.defaults.map(d => (
                            <button key={d.id} type="button" data-xslt-option={d.id} onClick={() => setXsltChoice(d.id)} style={card(xsltChoice === d.id, docType.color)}>
                                <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {xsltChoice === d.id && <Check size={15} color="#6ee7b7" />}{d.label}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>{d.description}</div>
                                <div style={{ color: '#64748b', fontSize: 11, marginTop: 6 }}>Varsayılan şablon</div>
                            </button>
                        ))}
                    </div>
                    <button type="button" data-xslt-option="own" onClick={() => setXsltChoice('own')} style={{ ...card(xsltChoice === 'own', '#f59e0b'), marginTop: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Upload size={16} /> Kendi XSLT dosyamı kullan
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>
                            Dosyanız {FAMILY_INFO[docType.family].label} yapısına ve {docType.label} türüne uygunluk için kontrol edilir.
                        </div>
                    </button>
                    {xsltChoice === 'own' && (
                        <FilePanel accept=".xslt,.xsl" hint=".xslt veya .xsl · en fazla 5 MB" file={ownXslt} busy={busy} onFile={(f) => loadOwn(f, 'xslt')} />
                    )}
                    {xsltChoice === 'own' && ownXslt && ownXsltWasTest && (
                        <div data-test-file-note style={{
                            marginTop: 10, padding: '10px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.5,
                            background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#fde68a',
                        }}>
                            Bu bir TEST dosyası. TEST yazısı editörde kaldırıldı; tasarıma kaldığınız yerden devam edebilirsiniz.
                            Bitirdiğinizde "Onayla" ile TEST yazısız dosyayı alırsınız.
                        </div>
                    )}
                    {xsltChoice === 'own' && ownXslt && designKeyOf(ownXslt.text) && (
                        <div data-design-key-note style={{
                            marginTop: 10, padding: '10px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.5,
                            background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#a7f3d0',
                        }}>
                            Bu dosya daha önce indirilmiş bir tasarım. Tasarım sizin hesabınıza aitse düzenleme ve tekrar indirme ücretsizdir.
                        </div>
                    )}
                </>
            )}

            {step === 2 && docType && (
                <>
                    {sectionTitle('Tasarımda hangi veri görünsün?', 'Önizlemede kullanılacak e-belge XML’ini seçin. Tasarım her veriyle çalışır; bu sadece önizleme içindir.')}
                    <button type="button" data-xml-option="default" onClick={() => setXmlChoice('default')} style={card(xmlChoice === 'default', docType.color)}>
                        <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Database size={16} /> Varsayılan örnek XML
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>{docType.label} için hazır örnek belge ({docType.sampleXml.split('/').pop()})</div>
                        {xmlChoice === 'default' && defaultXmlResult && <div style={{ marginTop: 10 }}><CheckList result={defaultXmlResult} /></div>}
                    </button>
                    <button type="button" data-xml-option="own" onClick={() => setXmlChoice('own')} style={{ ...card(xmlChoice === 'own', '#f59e0b'), marginTop: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Upload size={16} /> Kendi XML dosyamı seç
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>
                            Gerçek bir {docType.label} XML’i ({FAMILY_INFO[docType.family].root}) yükleyin; seçtiğiniz şablonla denenir.
                        </div>
                    </button>
                    {xmlChoice === 'own' && (
                        <FilePanel accept=".xml" hint=".xml · en fazla 5 MB" file={ownXml} busy={busy} onFile={(f) => loadOwn(f, 'xml')} />
                    )}
                </>
            )}

            {error && <div style={{ marginTop: 14, color: '#fca5a5', fontSize: 13 }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button type="button" data-wizard-back disabled={step === 0} onClick={() => { setError(null); setStep(s => Math.max(0, s - 1)); }}
                    style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: step === 0 ? '#475569' : '#cbd5e1', cursor: step === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                    <ArrowLeft size={16} /> Geri
                </button>
                {step > 0 && (
                    <button type="button" data-wizard-next disabled={!canNext || busy} onClick={step === 1 ? goToData : finish}
                        style={{
                            padding: '10px 22px', borderRadius: 10, border: 'none', fontWeight: 700, fontFamily: 'inherit',
                            background: canNext && !busy ? 'linear-gradient(135deg,#6366f1,#0ea5e9)' : 'rgba(148,163,184,0.2)',
                            color: canNext && !busy ? 'white' : '#64748b', cursor: canNext && !busy ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                        {busy ? <Loader2 size={16} /> : null}
                        {step === 1 ? 'Veri seçimine geç' : 'Tasarım ekranını aç'} <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default DesignWizard;
