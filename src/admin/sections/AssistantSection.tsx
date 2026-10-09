import React, { useCallback, useEffect, useState } from 'react';
import { BookOpen, Check, CheckCircle2, EyeOff, MessagesSquare, Pencil, Plus, RefreshCw, Save, Sparkles, ThumbsDown, ThumbsUp, Trash2, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { adminApi } from '../adminApi';
import type {
    AssistantActionCode, AssistantBuiltinEntry, AssistantKbEntry, AssistantKbInput, AssistantLog, AssistantLogFilter, AssistantOverview,
} from '../contracts';
import { C, btn, errorText, fmtDateTime, inputStyle, labelStyle } from '../format';
import { Badge, Card, Empty, ErrorBox, Modal, SectionHeader, Spinner } from '../ui';

const ACTION_LABELS: Record<AssistantActionCode, string> = {
    register: 'Hesap aç', login: 'Giriş yap', pricing: 'Fiyatlar', docs: 'Belge türleri', faq: 'SSS', product: 'Nasıl çalışır', contact: 'WhatsApp',
};

const MODE: Record<AssistantLog['mode'], { label: string; color: string }> = {
    kb: { label: 'Bilgi bankası', color: C.sky },
    ai: { label: 'Yapay zekâ', color: C.accent2 },
    cache: { label: 'Önbellek', color: C.accent },
    hint: { label: 'Öneri sundu', color: C.amber },
    none: { label: 'Yanıtsız', color: C.red },
    smalltalk: { label: 'Sohbet', color: C.dim },
};

const FILTERS: { id: AssistantLogFilter; label: string }[] = [
    { id: 'review', label: 'İncelenecek' },
    { id: 'unanswered', label: 'Yanıtsız' },
    { id: 'negative', label: 'Olumsuz' },
    { id: 'positive', label: 'Olumlu' },
    { id: 'all', label: 'Tümü' },
];

const STATUS: Record<AssistantKbEntry['status'], { label: string; color: string }> = {
    active: { label: 'Yayında', color: C.green },
    pending: { label: 'Onay bekliyor', color: C.amber },
    disabled: { label: 'Kapalı', color: C.dim },
};

const toInput = (e: AssistantKbEntry): AssistantKbInput => ({
    question: e.question, answer: e.answer, keywords: e.keywords, actions: e.actions, status: e.status,
});

type FormState = { id: number | null; input: AssistantKbInput };

const KbForm: React.FC<{ state: FormState; onClose: () => void; onSaved: () => void }> = ({ state, onClose, onSaved }) => {
    const pushToast = useUiStore(s => s.pushToast);
    const [form, setForm] = useState(state.input);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const set = <K extends keyof AssistantKbInput>(k: K, v: AssistantKbInput[K]) => setForm(f => ({ ...f, [k]: v }));

    const save = async () => {
        setError(null);
        if (!form.question.trim() || !form.answer.trim()) { setError('Soru ve yanıt gerekli.'); return; }
        setSaving(true);
        try {
            if (state.id) await adminApi.updateAssistantKb(state.id, form);
            else await adminApi.createAssistantKb(form);
            pushToast({ kind: 'success', title: 'Bilgi bankası güncellendi', description: form.status === 'active' ? 'Sarp bu yanıtı hemen kullanmaya başlar.' : 'Kayıt yayında değil.', ttl: 4000 });
            onSaved();
        } catch (e) {
            setError(errorText(e));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            title={state.id ? 'Bilgi bankası kaydını düzenle' : 'Bilgi bankasına yanıt ekle'}
            onClose={onClose}
            width={680}
            actions={<button type="button" onClick={save} disabled={saving} style={btn('primary', true)}>{saving ? <Spinner size={13} color="white" /> : <Save size={13} />} Kaydet</button>}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                    <label style={labelStyle}>Soru (ziyaretçinin soracağı şekilde)</label>
                    <input value={form.question} maxLength={500} onChange={e => set('question', e.target.value)} style={inputStyle} placeholder="Örn. Fatura tasarımını kaç günde teslim alırım?" />
                </div>
                <div>
                    <label style={labelStyle}>Yanıt — "- " ile madde, **kalın** ile vurgu yapabilirsiniz</label>
                    <textarea value={form.answer} maxLength={4000} onChange={e => set('answer', e.target.value)} rows={8} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
                </div>
                <div>
                    <label style={labelStyle}>Anahtar kelimeler (eş anlamlılar, yazım varyasyonları; boşlukla)</label>
                    <input value={form.keywords} maxLength={500} onChange={e => set('keywords', e.target.value)} style={inputStyle} placeholder="teslim sure kac gun hizli" />
                </div>
                <div>
                    <label style={labelStyle}>Yanıtın altında gösterilecek düğmeler</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {(Object.keys(ACTION_LABELS) as AssistantActionCode[]).map(a => {
                            const on = form.actions.includes(a);
                            return (
                                <button key={a} type="button" onClick={() => set('actions', on ? form.actions.filter(x => x !== a) : [...form.actions, a])}
                                    style={{ ...btn(on ? 'success' : 'ghost', true) }}>
                                    {on && <Check size={12} />} {ACTION_LABELS[a]}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div style={{ maxWidth: 240 }}>
                    <label style={labelStyle}>Durum</label>
                    <select value={form.status} onChange={e => set('status', e.target.value as AssistantKbInput['status'])} style={inputStyle}>
                        <option value="active">Yayında</option>
                        <option value="pending">Onay bekliyor</option>
                        <option value="disabled">Kapalı</option>
                    </select>
                </div>
                {error && <ErrorBox>{error}</ErrorBox>}
            </div>
        </Modal>
    );
};

const Stat: React.FC<{ label: string; value: React.ReactNode; color?: string }> = ({ label, value, color = C.text }) => (
    <div style={{ flex: '1 1 130px', padding: '12px 14px', borderRadius: 12, background: C.soft, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color, marginTop: 2 }}>{value}</div>
    </div>
);

const clip: React.CSSProperties = { whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.8rem', lineHeight: 1.5, color: '#334155' };

export const AssistantSection: React.FC = () => {
    const pushToast = useUiStore(s => s.pushToast);
    const [overview, setOverview] = useState<AssistantOverview | null>(null);
    const [tab, setTab] = useState<'logs' | 'kb'>('logs');
    const [filter, setFilter] = useState<AssistantLogFilter>('review');
    const [logs, setLogs] = useState<AssistantLog[] | null>(null);
    const [kb, setKb] = useState<{ entries: AssistantKbEntry[]; builtin: AssistantBuiltinEntry[] } | null>(null);
    const [showBuiltin, setShowBuiltin] = useState(false);
    const [form, setForm] = useState<FormState | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const [o, l, k] = await Promise.all([adminApi.assistantOverview(), adminApi.assistantLogs(filter), adminApi.assistantKb()]);
            setOverview(o);
            setLogs(l);
            setKb(k);
        } catch (e) {
            setError(errorText(e));
        }
    }, [filter]);

    useEffect(() => { void load(); }, [load]);

    const act = async (fn: () => Promise<unknown>, title: string) => {
        try {
            await fn();
            pushToast({ kind: 'success', title, ttl: 3000 });
            void load();
        } catch (e) {
            pushToast({ kind: 'error', title: 'İşlem başarısız', description: errorText(e) });
        }
    };

    const answerLog = (log: AssistantLog) => setForm({
        id: null,
        input: {
            question: log.question, answer: log.mode === 'ai' || log.mode === 'cache' ? log.answer : '', keywords: '', actions: [], status: 'active', log_id: log.id,
        },
    });

    const s = overview?.stats;
    const pending = kb?.entries.filter(e => e.status === 'pending') ?? [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionHeader
                icon={<MessagesSquare size={20} />}
                title="Site asistanı (Sarp)"
                subtitle="Ziyaretçilerin sağ alttaki robota sorduğu sorular. Yanıtlanamayan veya beğenilmeyen soruları buradan yanıtlayın; Sarp eklediğiniz yanıtları hemen kullanmaya başlar."
                actions={<button type="button" onClick={() => void load()} style={btn('secondary', true)}><RefreshCw size={13} /> Yenile</button>}
            />
            {error && <ErrorBox>{error}</ErrorBox>}

            <Card title={<><Sparkles size={16} color={overview?.ai.configured ? C.accent2 : C.dim} /> Yapay zekâ durumu</>}>
                {!overview ? <Spinner /> : overview.ai.configured ? (
                    <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6 }}>
                        <Badge color={C.green}>Açık</Badge> {overview.ai.provider} · <b>{overview.ai.model}</b> · bugün {overview.ai.usedToday} / {overview.ai.dailyLimit} çağrı.
                        Bilgi bankası yanıtların temelidir; yapay zekâ yalnızca onu doğal dille özetler ve site dışı soruları reddeder.
                    </div>
                ) : (
                    <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6 }}>
                        <Badge color={C.amber}>Kapalı</Badge> Sarp şu an yalnızca bilgi bankasından yanıt veriyor.
                        Ücretsiz Google Gemini anahtarı (aistudio.google.com) alıp sunucuda <code>GEMINI_API_KEY</code> olarak tanımlarsanız
                        sorular doğal dille ve bağlama göre yanıtlanır.
                    </div>
                )}
                {s && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
                        <Stat label="Toplam soru" value={s.total} />
                        <Stat label="Son 24 saat" value={s.today} />
                        <Stat label="Yanıtsız (incelenecek)" value={s.unanswered} color={s.unanswered ? C.red : C.text} />
                        <Stat label="Beğenilmeyen" value={s.negative} color={s.negative ? C.amber : C.text} />
                        <Stat label="Beğenilen" value={s.positive} color={C.green} />
                        <Stat label="Bilgi bankası" value={`${s.builtin} + ${s.kbActive}`} />
                        <Stat label="Onay bekleyen" value={s.kbPending} color={s.kbPending ? C.amber : C.text} />
                    </div>
                )}
            </Card>

            <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setTab('logs')} style={btn(tab === 'logs' ? 'primary' : 'secondary', true)}>Sorular</button>
                <button type="button" onClick={() => setTab('kb')} style={btn(tab === 'kb' ? 'primary' : 'secondary', true)}>
                    Bilgi bankası {pending.length > 0 && <Badge color={C.amber} solid>{pending.length}</Badge>}
                </button>
            </div>

            {tab === 'logs' && (
                <Card
                    title="Ziyaretçi soruları"
                    actions={(
                        <select value={filter} onChange={e => setFilter(e.target.value as AssistantLogFilter)} style={{ ...inputStyle, width: 'auto', padding: '6px 10px' }}>
                            {FILTERS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </select>
                    )}
                >
                    {!logs ? <Spinner /> : logs.length === 0 ? <Empty>Bu filtrede soru yok.</Empty> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {logs.map(l => (
                                <div key={l.id} style={{ padding: 12, borderRadius: 12, background: C.soft, border: `1px solid ${C.border}`, opacity: l.resolved ? 0.6 : 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <b style={{ color: C.text, fontSize: '0.88rem', flex: '1 1 240px' }}>{l.question}</b>
                                        <Badge color={MODE[l.mode].color}>{MODE[l.mode].label}</Badge>
                                        {l.helpful === 1 && <Badge color={C.green}><ThumbsUp size={10} /> Beğenildi</Badge>}
                                        {l.helpful === -1 && <Badge color={C.red}><ThumbsDown size={10} /> Beğenilmedi</Badge>}
                                        {l.resolved && <Badge color={C.dim}>Çözüldü</Badge>}
                                        <span style={{ fontSize: '0.72rem', color: C.dim }}>{fmtDateTime(l.created_at)}</span>
                                    </div>
                                    <details style={{ marginTop: 6 }}>
                                        <summary style={{ cursor: 'pointer', fontSize: '0.76rem', color: C.muted }}>Sarp'ın yanıtı</summary>
                                        <div style={{ ...clip, marginTop: 6 }}>{l.answer}</div>
                                    </details>
                                    {!l.resolved && (
                                        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                            <button type="button" onClick={() => answerLog(l)} style={btn('primary', true)}><Plus size={13} /> Yanıt yaz / öğret</button>
                                            <button type="button" onClick={() => void act(() => adminApi.resolveAssistantLog(l.id, true), 'Soru kapatıldı')} style={btn('ghost', true)}>
                                                <CheckCircle2 size={13} /> Yok say
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {tab === 'kb' && (
                <Card
                    title={<><BookOpen size={16} /> Eklenen ve öğrenilen yanıtlar</>}
                    actions={<button type="button" onClick={() => setForm({ id: null, input: { question: '', answer: '', keywords: '', actions: [], status: 'active' } })} style={btn('primary', true)}><Plus size={13} /> Yeni yanıt</button>}
                >
                    <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: C.muted, lineHeight: 1.5 }}>
                        Ziyaretçinin beğendiği yapay zekâ yanıtları "Onay bekliyor" olarak buraya düşer; onayladığınızda Sarp o soruyu yapay zekâya sormadan bu yanıtla karşılar.
                    </p>
                    {!kb ? <Spinner /> : kb.entries.length === 0 ? <Empty>Henüz eklenen yanıt yok. Yerleşik yanıtlar aşağıda.</Empty> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {kb.entries.map(e => (
                                <div key={e.id} style={{ padding: 12, borderRadius: 12, background: C.soft, border: `1px solid ${e.status === 'pending' ? 'rgba(245,158,11,0.4)' : C.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <b style={{ color: C.text, fontSize: '0.88rem', flex: '1 1 240px' }}>{e.question}</b>
                                        <Badge color={STATUS[e.status].color}>{STATUS[e.status].label}</Badge>
                                        <Badge color={e.source === 'learned' ? C.accent2 : C.sky}>{e.source === 'learned' ? 'Öğrenildi' : 'Yönetici'}</Badge>
                                        <span style={{ fontSize: '0.72rem', color: C.dim }}>{e.hits} kez kullanıldı</span>
                                    </div>
                                    <div style={{ ...clip, marginTop: 6, maxHeight: 120, overflow: 'auto' }}>{e.answer}</div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                        {e.status !== 'active' && (
                                            <button type="button" onClick={() => void act(() => adminApi.updateAssistantKb(e.id, { ...toInput(e), status: 'active' }), 'Yanıt yayında')} style={btn('success', true)}>
                                                <Check size={13} /> {e.status === 'pending' ? 'Onayla' : 'Yayına al'}
                                            </button>
                                        )}
                                        <button type="button" onClick={() => setForm({ id: e.id, input: toInput(e) })} style={btn('secondary', true)}><Pencil size={13} /> Düzenle</button>
                                        {e.status === 'active' && (
                                            <button type="button" onClick={() => void act(() => adminApi.updateAssistantKb(e.id, { ...toInput(e), status: 'disabled' }), 'Yanıt kapatıldı')} style={btn('ghost', true)}>
                                                <EyeOff size={13} /> Kapat
                                            </button>
                                        )}
                                        <button type="button" onClick={() => { if (window.confirm('Bu yanıt silinsin mi?')) void act(() => adminApi.deleteAssistantKb(e.id), 'Yanıt silindi'); }} style={btn('danger', true)}>
                                            {e.status === 'pending' ? <X size={13} /> : <Trash2 size={13} />} {e.status === 'pending' ? 'Reddet' : 'Sil'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {kb && (
                        <div style={{ marginTop: 16 }}>
                            <button type="button" onClick={() => setShowBuiltin(v => !v)} style={btn('ghost', true)}>
                                Yerleşik yanıtlar ({kb.builtin.length}) {showBuiltin ? 'gizle' : 'göster'}
                            </button>
                            {showBuiltin && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                                    {kb.builtin.map(b => (
                                        <details key={b.id} style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border}` }}>
                                            <summary style={{ cursor: 'pointer', fontSize: '0.84rem', color: C.text, fontWeight: 700 }}>{b.question}</summary>
                                            <div style={{ ...clip, marginTop: 6 }}>{b.answer}</div>
                                        </details>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            )}

            {form && <KbForm state={form} onClose={() => setForm(null)} onSaved={() => { setForm(null); void load(); }} />}
        </div>
    );
};
