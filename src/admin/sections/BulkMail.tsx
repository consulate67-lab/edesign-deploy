import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Mail, Pause, Play, RefreshCw, RotateCcw, Send, Trash2, Upload, XCircle } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { adminApi } from '../adminApi';
import type { CampaignStatus, MailCampaign, MailCampaignDetail, MailCampaignList, MailContent } from '../contracts';
import { C, btn, errorText, fmtDateTime, fmtNumber, inputStyle, labelStyle } from '../format';
import { Badge, Card, Empty, ErrorBox, Modal, SectionHeader, Spinner } from '../ui';
import { BROCHURE_OPTIONS, brochureForCountry, brochureLabel, foldCountry, type BrochureId, type CountryStatus } from './bulkmail/countries';
import { isPersonal, parseRecipients, rowsToTsv, type Recipient } from './bulkmail/recipients';
import { BROCHURES } from './bulkmail/templates';

const STATUS: Record<CampaignStatus, { label: string; color: string }> = {
    draft: { label: 'Taslak', color: C.dim },
    sending: { label: 'Gönderiliyor', color: C.sky },
    paused: { label: 'Duraklatıldı', color: C.amber },
    done: { label: 'Tamamlandı', color: C.green },
    cancelled: { label: 'İptal edildi', color: C.red },
};

interface CountryRow { key: string; label: string; count: number; status: CountryStatus; brochure: BrochureId | null }
interface BrochureGroup { brochure: BrochureId; recipients: Recipient[] }

const SKIP_NOTE: Record<CountryStatus, string> = {
    supported: '',
    unsupported: 'Sitede bu ülkenin belgesi yok',
    unknown: 'Ülke adı tanınmadı',
};

const fmtHours = (count: number, perHour: number) => {
    const minutes = Math.ceil((count / Math.max(perHour, 1)) * 60);
    if (minutes < 60) return `${minutes} dk`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h} sa ${m} dk` : `${h} sa`;
};

const todayLabel = () => new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

const Progress: React.FC<{ c: MailCampaign }> = ({ c }) => {
    const done = c.sent + c.failed + c.skipped;
    const pct = c.total ? Math.round((done / c.total) * 100) : 0;
    return (
        <div style={{ minWidth: 160 }}>
            <div style={{ height: 8, borderRadius: 99, background: C.soft, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: c.failed ? `linear-gradient(90deg, ${C.green}, ${C.amber})` : C.green, transition: 'width 0.4s' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: C.muted, marginTop: 4 }}>
                %{pct} · {fmtNumber(c.sent)} gönderildi
                {c.failed > 0 && <span style={{ color: C.redText }}> · {fmtNumber(c.failed)} hatalı</span>}
                {c.skipped > 0 && <> · {fmtNumber(c.skipped)} atlandı</>}
                {c.pending > 0 && <> · {fmtNumber(c.pending)} bekliyor</>}
            </div>
        </div>
    );
};

export const BulkMail: React.FC = () => {
    const pushToast = useUiStore(s => s.pushToast);
    const [data, setData] = useState<MailCampaignList | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [detail, setDetail] = useState<MailCampaignDetail | null>(null);

    const [name, setName] = useState(() => `Tanıtım · ${todayLabel()}`);
    const [listText, setListText] = useState('');
    const [contents, setContents] = useState<Record<BrochureId, MailContent>>(BROCHURES);
    const [previewId, setPreviewId] = useState<BrochureId>('tr');
    const [overrides, setOverrides] = useState<Record<string, BrochureId | null>>({});
    const [readingFile, setReadingFile] = useState(false);
    const [editHtml, setEditHtml] = useState(false);
    const [rate, setRate] = useState<number | null>(null);
    const [testTo, setTestTo] = useState('');
    const [consent, setConsent] = useState(false);
    const [businessOnly, setBusinessOnly] = useState(true);
    const [sendingTest, setSendingTest] = useState(false);
    const [starting, setStarting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const parsedAll = useMemo(() => parseRecipients(listText), [listText]);
    const personalCount = useMemo(() => parsedAll.recipients.filter(r => isPersonal(r.email)).length, [parsedAll]);
    const parsed = useMemo(
        () => (businessOnly && personalCount ? { ...parsedAll, recipients: parsedAll.recipients.filter(r => !isPersonal(r.email)) } : parsedAll),
        [parsedAll, businessOnly, personalCount],
    );

    const fallbackBrochure: BrochureId = parsed.hasCountry ? 'en' : 'tr';
    const countryRows = useMemo(() => {
        const rows = new Map<string, CountryRow>();
        for (const r of parsed.recipients) {
            const key = foldCountry(r.country);
            const row = rows.get(key);
            if (row) row.count++;
            else {
                const match = brochureForCountry(r.country, fallbackBrochure);
                rows.set(key, { key, label: r.country || 'Ülkesi belirtilmemiş', count: 1, status: match.status, brochure: key in overrides ? overrides[key] : match.brochure });
            }
        }
        return [...rows.values()].sort((a, b) => Number(!a.brochure) - Number(!b.brochure) || b.count - a.count || a.label.localeCompare(b.label, 'tr'));
    }, [parsed, overrides, fallbackBrochure]);

    const groups = useMemo<BrochureGroup[]>(() => {
        const brochureOf = new Map(countryRows.map(r => [r.key, r.brochure]));
        return BROCHURE_OPTIONS
            .map(({ id }) => ({ brochure: id, recipients: parsed.recipients.filter(r => brochureOf.get(foldCountry(r.country)) === id) }))
            .filter(g => g.recipients.length > 0);
    }, [parsed, countryRows]);

    const totalRecipients = groups.reduce((n, g) => n + g.recipients.length, 0);
    const skippedRows = countryRows.filter(r => !r.brochure);
    const skippedCount = skippedRows.reduce((n, r) => n + r.count, 0);
    const previewTabs = groups.length ? groups.map(g => g.brochure) : BROCHURE_OPTIONS.map(l => l.id);
    const activeId = previewTabs.includes(previewId) ? previewId : previewTabs[0];
    const content = contents[activeId];
    const setContent = (patch: Partial<MailContent>) => setContents(prev => ({ ...prev, [activeId]: { ...prev[activeId], ...patch } }));
    const perHour = rate ?? data?.defaultRate ?? 80;
    const rateMax = data?.rateMax ?? 500;

    const load = useCallback(async () => {
        try {
            setData(await adminApi.campaigns());
            setLoadError(null);
        } catch (e) {
            setLoadError(errorText(e));
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const anySending = !!data?.campaigns.some(c => c.status === 'sending');
    useEffect(() => {
        if (!anySending) return;
        const id = setInterval(() => { void load(); }, 5000);
        return () => clearInterval(id);
    }, [anySending, load]);

    const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (file.size > 5_000_000) {
            pushToast({ kind: 'error', title: 'Dosya çok büyük', description: 'En fazla 5 MB yükleyebilirsiniz.', ttl: 6000 });
            return;
        }
        setReadingFile(true);
        try {
            const loaded = /\.xlsx$/i.test(file.name)
                ? rowsToTsv(await import('./bulkmail/xlsx').then(m => m.readXlsx(file)))
                : await file.text();
            setListText(prev => (prev.trim() ? `${prev.trim()}\n${loaded}` : loaded));
        } catch (err) {
            pushToast({ kind: 'error', title: 'Dosya okunamadı', description: errorText(err), ttl: 8000 });
        } finally {
            setReadingFile(false);
        }
    };

    const ready = (id: BrochureId) => !!contents[id].subject.trim() && !!contents[id].html.trim();
    const contentOk = groups.length > 0 && groups.every(g => ready(g.brochure));
    const campaignName = (id: BrochureId) => (groups.length > 1 || id !== 'tr' ? `${name.trim()} · ${brochureLabel(id)}` : name.trim());

    const sendTest = async () => {
        setSendingTest(true);
        try {
            await adminApi.testCampaign({ ...content, subject: content.subject.trim() }, testTo.trim());
            pushToast({ kind: 'success', title: 'Test e-postası gönderildi', description: `${testTo.trim()} adresinin gelen kutusunu (ve spam klasörünü) kontrol edin.`, ttl: 7000 });
        } catch (e) {
            pushToast({ kind: 'error', title: 'Test gönderilemedi', description: errorText(e), ttl: 9000 });
        } finally {
            setSendingTest(false);
        }
    };

    const start = async () => {
        const summary = groups.map(g => `• ${brochureLabel(g.brochure)}: ${fmtNumber(g.recipients.length)} alıcı — "${contents[g.brochure].subject.trim()}"`).join('\n');
        const skipped = skippedCount ? `\n\nDesteklenmeyen ülkelerdeki ${fmtNumber(skippedCount)} alıcıya gönderilmeyecek.` : '';
        if (!window.confirm(`${fmtNumber(totalRecipients)} alıcıya gönderim başlatılsın mı?\n\n${summary}${skipped}\n\nSaatte ${perHour} e-posta ile yaklaşık ${fmtHours(totalRecipients, perHour)} sürer. Broşürler sırayla gönderilir.`)) return;
        setStarting(true);
        const started: BrochureId[] = [];
        try {
            for (const g of groups) {
                const c = contents[g.brochure];
                const created = await adminApi.createCampaign({
                    name: campaignName(g.brochure), subject: c.subject.trim(), html: c.html, text: c.text, ratePerHour: perHour,
                    recipients: g.recipients.map(({ email, name: n }) => ({ email, name: n })),
                });
                await adminApi.startCampaign(created.id);
                started.push(g.brochure);
            }
            pushToast({ kind: 'success', title: 'Gönderim başladı', description: `${groups.length > 1 ? `${groups.length} broşür için ayrı gönderim oluşturuldu. ` : ''}E-postalar arka planda sırayla gidiyor; bu sayfayı kapatabilirsiniz.`, ttl: 8000 });
            setListText('');
            setOverrides({});
            setConsent(false);
            setName(`Tanıtım · ${todayLabel()}`);
            await load();
        } catch (e) {
            const done = started.length ? ` Başlatılan broşürler: ${started.map(brochureLabel).join(', ')}; kalanları listeden çıkarıp yeniden başlatın.` : '';
            pushToast({ kind: 'error', title: 'Gönderim başlatılamadı', description: `${errorText(e)}${done}`, ttl: 12000 });
            await load();
        } finally {
            setStarting(false);
        }
    };

    const act = async (c: MailCampaign, action: 'start' | 'pause' | 'cancel' | 'retry' | 'delete') => {
        if (action === 'cancel' && !window.confirm(`"${c.name}" gönderimi iptal edilsin mi? Bekleyen ${fmtNumber(c.pending)} e-posta gönderilmeyecek.`)) return;
        if (action === 'delete' && !window.confirm(`"${c.name}" gönderimi ve alıcı listesi silinsin mi?`)) return;
        if (action === 'start' && !window.confirm('Listenin yalnız şirket/esnaf adreslerinden oluştuğunu onaylıyor musunuz? Gönderim kaldığı yerden devam edecek.')) return;
        setBusyId(c.id);
        try {
            if (action === 'start') await adminApi.startCampaign(c.id);
            else if (action === 'pause') await adminApi.pauseCampaign(c.id);
            else if (action === 'cancel') await adminApi.cancelCampaign(c.id);
            else if (action === 'retry') await adminApi.retryCampaignFailures(c.id);
            else await adminApi.deleteCampaign(c.id);
            await load();
        } catch (e) {
            pushToast({ kind: 'error', title: 'İşlem yapılamadı', description: errorText(e), ttl: 7000 });
        } finally {
            setBusyId(null);
        }
    };

    const openDetail = async (c: MailCampaign) => {
        try {
            setDetail(await adminApi.campaign(c.id));
        } catch (e) {
            pushToast({ kind: 'error', title: 'Ayrıntı alınamadı', description: errorText(e), ttl: 6000 });
        }
    };

    const canStart = !starting && contentOk && !!name.trim() && totalRecipients > 0 && consent && perHour >= 10 && perHour <= rateMax;
    const testOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testTo.trim());

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <SectionHeader
                icon={<Mail size={20} />}
                title="Toplu e-posta"
                subtitle="Listenizdeki adreslere tanıtım e-postası gönderin. E-postalar saatlik sınırla arka planda tek tek gider; sayfayı kapatsanız da gönderim sürer."
                actions={<button type="button" style={btn('ghost', true)} onClick={() => void load()}><RefreshCw size={14} /> Yenile</button>}
            />

            {loadError && <ErrorBox>{loadError}</ErrorBox>}
            {data && !data.mailReady && <ErrorBox>Sunucuda e-posta gönderimi yapılandırılmamış; gönderim başlatılamaz.</ErrorBox>}

            <Card title="Yeni gönderim">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
                        <div>
                            <label style={labelStyle}>Gönderim adı (yalnız sizin göreceğiniz)</label>
                            <input style={inputStyle} value={name} maxLength={120} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Alıcı listesi</label>
                                <button type="button" style={{ ...btn('secondary', true), marginLeft: 'auto' }} disabled={readingFile} onClick={() => fileRef.current?.click()}>
                                    {readingFile ? <Spinner size={13} /> : <Upload size={13} />} Dosyadan yükle (.xlsx, .csv, .txt)
                                </button>
                                <input ref={fileRef} type="file" accept=".xlsx,.csv,.txt,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden onChange={e => void onFile(e)} />
                            </div>
                            <textarea
                                style={{ ...inputStyle, minHeight: 170, fontFamily: 'Consolas, "Cascadia Code", monospace', fontSize: '0.8rem', resize: 'vertical', whiteSpace: 'pre', overflowX: 'auto' }}
                                placeholder={'Her satıra bir adres yazın ya da yapıştırın:\nornek@firma.com\nAhmet Yılmaz <ahmet@firma.com>\n\nÜlkeye göre dil için Excel tablosunu başlıklarıyla yükleyin\n(Ülke, E-Posta, Yetkili sütunları).'}
                                value={listText}
                                onChange={e => setListText(e.target.value)}
                            />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, alignItems: 'center' }}>
                                <Badge color={C.green}>{fmtNumber(totalRecipients)} geçerli adres</Badge>
                                {parsed.duplicates > 0 && <Badge color={C.amber}>{fmtNumber(parsed.duplicates)} tekrar çıkarıldı</Badge>}
                                {parsed.invalid.length > 0 && <Badge color={C.red}>{fmtNumber(parsed.invalid.length)} satırda adres yok</Badge>}
                                {businessOnly && personalCount > 0 && <Badge color={C.sky}>{fmtNumber(personalCount)} bireysel adres ayıklandı</Badge>}
                                {!!data?.unsubscribed && <span style={{ fontSize: '0.72rem', color: C.muted }}>Listeden çıkmış {fmtNumber(data.unsubscribed)} kişiye zaten gönderilmez.</span>}
                            </div>
                            {parsed.invalid.length > 0 && (
                                <div style={{ marginTop: 6, fontSize: '0.72rem', color: C.redText, lineHeight: 1.5 }}>
                                    {parsed.invalid.slice(0, 5).join(' · ')}{parsed.invalid.length > 5 && ' …'}
                                </div>
                            )}
                            <div style={{ fontSize: '0.72rem', color: C.dim, marginTop: 6 }}>
                                Excel dosyası doğrudan yüklenebilir. Başlık satırında "Ülke" sütunu varsa her alıcıya kendi ülkesinin dilinde ve resmî e-fatura formatını öne çıkaran broşür gider.
                            </div>
                            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 8, fontSize: '0.76rem', color: C.text, lineHeight: 1.5, cursor: 'pointer' }}>
                                <input type="checkbox" checked={businessOnly} onChange={e => setBusinessOnly(e.target.checked)} style={{ marginTop: 2, accentColor: C.accent }} />
                                <span>Bireysel adresleri (gmail, hotmail, outlook, yandex, icloud…) gönderme <span style={{ color: C.dim }}>· önerilir</span></span>
                            </label>
                            {!businessOnly && personalCount > 0 && (
                                <div style={{ marginTop: 6, fontSize: '0.74rem', color: C.redText, lineHeight: 1.5 }}>
                                    Listede {fmtNumber(personalCount)} bireysel adres var. Tüketicilere önceden onay ve İYS kaydı olmadan tanıtım e-postası göndermek idari para cezası riski taşır.
                                </div>
                            )}
                        </div>
                        {totalRecipients > 0 && (
                            <div>
                                <label style={labelStyle}>{parsed.hasCountry ? 'Ülkeye göre broşür' : 'Broşür'}</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                                    {groups.map(g => <Badge key={g.brochure} color={C.accent}>{brochureLabel(g.brochure)}: {fmtNumber(g.recipients.length)}</Badge>)}
                                    {skippedCount > 0 && <Badge color={C.dim}>Gönderilmeyecek: {fmtNumber(skippedCount)}</Badge>}
                                </div>
                                <div style={{ maxHeight: 260, overflowY: 'auto', border: `1px solid ${C.border}`, borderRadius: 10 }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                                        <tbody>
                                            {countryRows.map(r => (
                                                <tr key={r.key} style={{ borderBottom: `1px solid ${C.border}`, opacity: r.brochure ? 1 : 0.7 }}>
                                                    <td style={{ padding: '5px 10px', color: r.key ? C.text : C.muted }}>
                                                        {r.label}
                                                        {r.status !== 'supported' && <div style={{ fontSize: '0.68rem', color: C.amber }}>{SKIP_NOTE[r.status]}</div>}
                                                    </td>
                                                    <td style={{ padding: '5px 10px', color: C.muted, textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtNumber(r.count)} alıcı</td>
                                                    <td style={{ padding: '4px 8px', width: 170 }}>
                                                        <select value={r.brochure ?? ''} aria-label={`${r.label} broşürü`}
                                                            style={{ ...inputStyle, padding: '4px 8px', fontSize: '0.78rem', height: 'auto' }}
                                                            onChange={e => setOverrides(prev => ({ ...prev, [r.key]: (e.target.value || null) as BrochureId | null }))}>
                                                            <option value="">Gönderme</option>
                                                            {BROCHURE_OPTIONS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {skippedRows.some(r => r.status !== 'supported') && (
                                    <div style={{ fontSize: '0.72rem', color: C.dim, marginTop: 6, lineHeight: 1.5 }}>
                                        Sitenin belge sunmadığı ülkeler (37 ülke dışı) ve tanınmayan ülke adları gönderilmez; broşürler o ülkenin formatını vaat etmesin diye. Gerekirse satırdan broşür seçerek dahil edebilirsiniz.
                                    </div>
                                )}
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'end' }}>
                            <div>
                                <label style={labelStyle}>Saatlik gönderim</label>
                                <input type="number" min={10} max={rateMax} style={inputStyle} value={perHour}
                                    onChange={e => setRate(Math.round(Number(e.target.value)) || 0)} />
                            </div>
                            <div style={{ fontSize: '0.76rem', color: C.muted, lineHeight: 1.5, paddingBottom: 4 }}>
                                {totalRecipients > 0 && <>Tahmini süre: <strong style={{ color: C.text }}>{fmtHours(totalRecipients, perHour)}</strong>. </>}
                                Hosting e-posta hesabının saatlik sınırını aşmayın; aşılırsa alan adı kara listeye girebilir ve üyelere giden onay kodları da gecikir.
                            </div>
                        </div>
                        <div style={{ padding: 12, borderRadius: 12, background: C.soft, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>Önce kendinize test gönderin · {brochureLabel(activeId)} broşür</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input style={inputStyle} type="email" placeholder="siz@firma.com" value={testTo} onChange={e => setTestTo(e.target.value)} />
                                <button type="button" style={btn('secondary')} disabled={!testOk || !ready(activeId) || sendingTest} onClick={() => void sendTest()}>
                                    {sendingTest ? <Spinner size={14} /> : <Send size={14} />} Test gönder
                                </button>
                            </div>
                        </div>
                        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.8rem', color: C.text, lineHeight: 1.5, cursor: 'pointer' }}>
                            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: C.accent }} />
                            <span>Bu listenin şirket/esnaf iş adreslerinden oluştuğunu ve adresleri yasal yollarla (ör. firmaların kendi yayımladığı iletişim bilgilerinden) edindiğimi onaylıyorum. Her e-postada tek tıkla "listeden çık" bağlantısı bulunur; çıkanlara bir daha gönderilmez.</span>
                        </label>
                        <button type="button" style={{ ...btn('primary'), opacity: canStart ? 1 : 0.5, padding: '11px 16px' }} disabled={!canStart} onClick={() => void start()}>
                            {starting ? <Spinner size={15} color="white" /> : <Play size={15} />}
                            {totalRecipients > 0
                                ? `${fmtNumber(totalRecipients)} alıcıya gönderimi başlat${groups.length > 1 ? ` (${groups.length} broşür)` : ''}`
                                : 'Gönderimi başlat'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {previewTabs.map(id => (
                                <button key={id} type="button" style={{ ...btn(id === activeId ? 'primary' : 'ghost', true), ...(ready(id) ? null : { color: C.redText }) }}
                                    onClick={() => setPreviewId(id)}>
                                    {brochureLabel(id)}
                                </button>
                            ))}
                        </div>
                        <div>
                            <label style={labelStyle}>Konu satırı · {brochureLabel(activeId)}</label>
                            <input style={inputStyle} value={content.subject} maxLength={200} onChange={e => setContent({ subject: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>{editHtml ? 'İçerik (HTML ve düz metin)' : 'Önizleme'}</label>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                                {(content.html !== BROCHURES[activeId].html || content.text !== BROCHURES[activeId].text || content.subject !== BROCHURES[activeId].subject) && (
                                    <button type="button" style={btn('ghost', true)} onClick={() => setContent(BROCHURES[activeId])}>
                                        <RotateCcw size={13} /> Broşürü geri yükle
                                    </button>
                                )}
                                <button type="button" style={btn('secondary', true)} onClick={() => setEditHtml(v => !v)}>
                                    {editHtml ? <><Eye size={13} /> Önizlemeye dön</> : 'HTML\'yi düzenle'}
                                </button>
                            </div>
                        </div>
                        {editHtml ? (
                            <>
                                <textarea style={{ ...inputStyle, minHeight: 380, fontFamily: 'Consolas, monospace', fontSize: '0.74rem', resize: 'vertical' }}
                                    value={content.html} onChange={e => setContent({ html: e.target.value })} spellCheck={false} />
                                <label style={labelStyle}>Düz metin sürümü (HTML göstermeyen programlar için)</label>
                                <textarea style={{ ...inputStyle, minHeight: 140, fontFamily: 'Consolas, monospace', fontSize: '0.74rem', resize: 'vertical' }}
                                    value={content.text} onChange={e => setContent({ text: e.target.value })} spellCheck={false} />
                                <div style={{ fontSize: '0.72rem', color: C.muted, lineHeight: 1.5 }}>
                                    Alıcıya göre doldurulan alanlar: <code>{'{{UNSUBSCRIBE_URL}}'}</code> listeden çıkma bağlantısı, <code>{'{{AD}}'}</code> listedeki ad, <code>{'{{EMAIL}}'}</code> alıcı adresi.
                                </div>
                            </>
                        ) : (
                            <iframe title="E-posta önizlemesi" sandbox="" srcDoc={content.html}
                                style={{ width: '100%', height: 640, border: `1px solid ${C.border}`, borderRadius: 12, background: '#f1f4f9' }} />
                        )}
                    </div>
                </div>
            </Card>

            <Card title="Gönderimler" pad={false}>
                {!data ? (
                    <div style={{ padding: 20, display: 'flex', gap: 8, color: C.muted }}><Spinner /> Yükleniyor…</div>
                ) : data.campaigns.length === 0 ? (
                    <div style={{ padding: 18 }}><Empty>Henüz gönderim yok.</Empty></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: C.muted, fontSize: '0.72rem' }}>
                                    {['Gönderim', 'Durum', 'İlerleme', 'Hız', 'Tarih', ''].map(h => (
                                        <th key={h} style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.campaigns.map(c => {
                                    const busy = busyId === c.id;
                                    return (
                                        <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}`, verticalAlign: 'top' }}>
                                            <td style={{ padding: '12px 14px', minWidth: 200 }}>
                                                <div style={{ fontWeight: 700, color: C.text }}>{c.name}</div>
                                                <div style={{ color: C.muted, fontSize: '0.74rem', marginTop: 2 }}>{c.subject}</div>
                                                {c.last_error && <div style={{ color: C.redText, fontSize: '0.72rem', marginTop: 4, maxWidth: 360 }}>{c.last_error}</div>}
                                            </td>
                                            <td style={{ padding: '12px 14px' }}><Badge color={STATUS[c.status].color}>{STATUS[c.status].label}</Badge></td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <Progress c={c} />
                                                {c.status === 'sending' && c.pending > 0 && (
                                                    <div style={{ fontSize: '0.7rem', color: C.dim, marginTop: 2 }}>Kalan süre ≈ {fmtHours(c.pending, c.rate_per_hour)}</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: C.muted }}>{c.rate_per_hour}/sa</td>
                                            <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: C.muted, fontSize: '0.74rem' }}>
                                                {fmtDateTime(c.started_at ?? c.created_at)}
                                                {c.finished_at && <div>→ {fmtDateTime(c.finished_at)}</div>}
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                    {busy && <Spinner size={14} />}
                                                    {c.status === 'sending' && <button type="button" disabled={busy} style={btn('secondary', true)} onClick={() => void act(c, 'pause')}><Pause size={13} /> Duraklat</button>}
                                                    {(c.status === 'paused' || c.status === 'draft') && <button type="button" disabled={busy} style={btn('success', true)} onClick={() => void act(c, 'start')}><Play size={13} /> Devam et</button>}
                                                    {c.failed > 0 && c.status !== 'sending' && c.status !== 'cancelled' && (
                                                        <button type="button" disabled={busy} style={btn('secondary', true)} onClick={() => void act(c, 'retry')}><RotateCcw size={13} /> Hatalıları yeniden dene</button>
                                                    )}
                                                    {c.failed > 0 && <button type="button" style={btn('ghost', true)} onClick={() => void openDetail(c)}>Hatalar</button>}
                                                    {(c.status === 'sending' || c.status === 'paused' || c.status === 'draft') && (
                                                        <button type="button" disabled={busy} style={btn('danger', true)} onClick={() => void act(c, 'cancel')}><XCircle size={13} /> İptal</button>
                                                    )}
                                                    {c.status !== 'sending' && (
                                                        <button type="button" disabled={busy} title="Sil" style={btn('ghost', true)} onClick={() => void act(c, 'delete')}><Trash2 size={13} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {detail && (
                <Modal title={`Hatalı gönderimler · ${detail.campaign.name}`} onClose={() => setDetail(null)} width={720}>
                    {detail.failures.length === 0 ? <Empty>Hatalı gönderim yok.</Empty> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <tbody>
                                {detail.failures.map(f => (
                                    <tr key={f.email} style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <td style={{ padding: '8px 10px', fontWeight: 700 }}>{f.email}</td>
                                        <td style={{ padding: '8px 10px', color: C.redText }}>{f.error}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Modal>
            )}
        </div>
    );
};
