import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Mail, Pause, Play, RefreshCw, RotateCcw, Send, Trash2, Upload, XCircle } from 'lucide-react';
import brochureHtml from '../../../marketing/email-tanitim.html?raw';
import brochureText from '../../../marketing/email-tanitim.txt?raw';
import { useUiStore } from '../../store/uiStore';
import { adminApi } from '../adminApi';
import type { CampaignStatus, MailCampaign, MailCampaignDetail, MailCampaignList } from '../contracts';
import { C, btn, errorText, fmtDateTime, fmtNumber, inputStyle, labelStyle } from '../format';
import { Badge, Card, Empty, ErrorBox, Modal, SectionHeader, Spinner } from '../ui';

const DEFAULT_SUBJECT = 'e-Fatura tasarımınız artık dakikalar içinde hazır';

const STATUS: Record<CampaignStatus, { label: string; color: string }> = {
    draft: { label: 'Taslak', color: C.dim },
    sending: { label: 'Gönderiliyor', color: C.sky },
    paused: { label: 'Duraklatıldı', color: C.amber },
    done: { label: 'Tamamlandı', color: C.green },
    cancelled: { label: 'İptal edildi', color: C.red },
};

const EMAIL_RE = /[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

/** Bireysel (tüketici) posta sağlayıcıları: onaysız ticari ileti yalnız tacir/esnafa gönderilebildiği için varsayılan olarak ayıklanır. */
const PERSONAL_DOMAINS = new Set([
    'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.com.tr', 'outlook.com', 'outlook.com.tr', 'live.com', 'live.com.tr',
    'msn.com', 'windowslive.com', 'yahoo.com', 'yahoo.com.tr', 'ymail.com', 'icloud.com', 'me.com', 'mac.com', 'yandex.com',
    'yandex.com.tr', 'yandex.ru', 'mynet.com', 'aol.com', 'gmx.com', 'gmx.de', 'gmx.net', 'mail.ru', 'mail.com', 'proton.me',
    'protonmail.com', 'superonline.com', 'ttmail.com', 'turk.net', 'e-kolay.net', 'windowslive.com.tr',
]);
const isPersonal = (email: string) => PERSONAL_DOMAINS.has(email.slice(email.lastIndexOf('@') + 1));

interface ParsedList {
    recipients: { email: string; name: string }[];
    duplicates: number;
    invalid: string[];
}

/** Her satır: "adres", "Ad Soyad <adres>", "adres;Ad Soyad" (CSV) ya da virgülle ayrılmış birden çok adres. */
const parseRecipients = (raw: string): ParsedList => {
    const seen = new Set<string>();
    const recipients: ParsedList['recipients'] = [];
    const invalid: string[] = [];
    let duplicates = 0;
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const found = [...trimmed.matchAll(EMAIL_RE)].map(m => m[0]);
        if (found.length === 0) {
            if (!/e-?posta|e-?mail|mail/i.test(trimmed)) invalid.push(trimmed.slice(0, 80));
            continue;
        }
        const name = found.length === 1
            ? trimmed.replace(found[0], ' ').replace(/[<>"'`;,|\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
            : '';
        for (const raw of found) {
            const email = raw.toLowerCase();
            if (seen.has(email)) { duplicates++; continue; }
            seen.add(email);
            recipients.push({ email, name });
        }
    }
    return { recipients, duplicates, invalid };
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
    const [subject, setSubject] = useState(DEFAULT_SUBJECT);
    const [listText, setListText] = useState('');
    const [html, setHtml] = useState(brochureHtml);
    const [text, setText] = useState(brochureText);
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
        const content = await file.text();
        setListText(prev => (prev.trim() ? `${prev.trim()}\n${content}` : content));
    };

    const content = { subject: subject.trim(), html, text };
    const contentOk = !!content.subject && !!html.trim();

    const sendTest = async () => {
        setSendingTest(true);
        try {
            await adminApi.testCampaign(content, testTo.trim());
            pushToast({ kind: 'success', title: 'Test e-postası gönderildi', description: `${testTo.trim()} adresinin gelen kutusunu (ve spam klasörünü) kontrol edin.`, ttl: 7000 });
        } catch (e) {
            pushToast({ kind: 'error', title: 'Test gönderilemedi', description: errorText(e), ttl: 9000 });
        } finally {
            setSendingTest(false);
        }
    };

    const start = async () => {
        const n = parsed.recipients.length;
        if (!window.confirm(`${fmtNumber(n)} alıcıya "${content.subject}" konulu e-posta gönderimi başlatılsın mı?\n\nSaatte ${perHour} e-posta ile yaklaşık ${fmtHours(n, perHour)} sürer.`)) return;
        setStarting(true);
        try {
            const created = await adminApi.createCampaign({ name: name.trim(), ...content, ratePerHour: perHour, recipients: parsed.recipients });
            await adminApi.startCampaign(created.id);
            pushToast({ kind: 'success', title: 'Gönderim başladı', description: 'E-postalar arka planda sırayla gidiyor; bu sayfayı kapatabilirsiniz.', ttl: 7000 });
            setListText('');
            setConsent(false);
            setName(`Tanıtım · ${todayLabel()}`);
            await load();
        } catch (e) {
            pushToast({ kind: 'error', title: 'Gönderim başlatılamadı', description: errorText(e), ttl: 9000 });
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

    const canStart = !starting && contentOk && !!name.trim() && parsed.recipients.length > 0 && consent && perHour >= 10 && perHour <= rateMax;
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
                            <label style={labelStyle}>Konu satırı</label>
                            <input style={inputStyle} value={subject} maxLength={200} onChange={e => setSubject(e.target.value)} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Alıcı listesi</label>
                                <button type="button" style={{ ...btn('secondary', true), marginLeft: 'auto' }} onClick={() => fileRef.current?.click()}>
                                    <Upload size={13} /> Dosyadan yükle (.csv, .txt)
                                </button>
                                <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={e => void onFile(e)} />
                            </div>
                            <textarea
                                style={{ ...inputStyle, minHeight: 170, fontFamily: 'Consolas, "Cascadia Code", monospace', fontSize: '0.8rem', resize: 'vertical' }}
                                placeholder={'Her satıra bir adres yazın ya da yapıştırın:\nornek@firma.com\nAhmet Yılmaz <ahmet@firma.com>\nayse@firma.com;Ayşe Demir'}
                                value={listText}
                                onChange={e => setListText(e.target.value)}
                            />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, alignItems: 'center' }}>
                                <Badge color={C.green}>{fmtNumber(parsed.recipients.length)} geçerli adres</Badge>
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
                                Excel listesini önce Dosya → Farklı Kaydet → "CSV UTF-8" olarak kaydedin.
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
                        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'end' }}>
                            <div>
                                <label style={labelStyle}>Saatlik gönderim</label>
                                <input type="number" min={10} max={rateMax} style={inputStyle} value={perHour}
                                    onChange={e => setRate(Math.round(Number(e.target.value)) || 0)} />
                            </div>
                            <div style={{ fontSize: '0.76rem', color: C.muted, lineHeight: 1.5, paddingBottom: 4 }}>
                                {parsed.recipients.length > 0 && <>Tahmini süre: <strong style={{ color: C.text }}>{fmtHours(parsed.recipients.length, perHour)}</strong>. </>}
                                Hosting e-posta hesabının saatlik sınırını aşmayın; aşılırsa alan adı kara listeye girebilir ve üyelere giden onay kodları da gecikir.
                            </div>
                        </div>
                        <div style={{ padding: 12, borderRadius: 12, background: C.soft, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>Önce kendinize test gönderin</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input style={inputStyle} type="email" placeholder="siz@firma.com" value={testTo} onChange={e => setTestTo(e.target.value)} />
                                <button type="button" style={btn('secondary')} disabled={!testOk || !contentOk || sendingTest} onClick={() => void sendTest()}>
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
                            {parsed.recipients.length > 0 ? `${fmtNumber(parsed.recipients.length)} alıcıya gönderimi başlat` : 'Gönderimi başlat'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>{editHtml ? 'İçerik (HTML ve düz metin)' : 'Önizleme'}</label>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                                {(html !== brochureHtml || text !== brochureText) && (
                                    <button type="button" style={btn('ghost', true)} onClick={() => { setHtml(brochureHtml); setText(brochureText); }}>
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
                                    value={html} onChange={e => setHtml(e.target.value)} spellCheck={false} />
                                <label style={labelStyle}>Düz metin sürümü (HTML göstermeyen programlar için)</label>
                                <textarea style={{ ...inputStyle, minHeight: 140, fontFamily: 'Consolas, monospace', fontSize: '0.74rem', resize: 'vertical' }}
                                    value={text} onChange={e => setText(e.target.value)} spellCheck={false} />
                                <div style={{ fontSize: '0.72rem', color: C.muted, lineHeight: 1.5 }}>
                                    Alıcıya göre doldurulan alanlar: <code>{'{{UNSUBSCRIBE_URL}}'}</code> listeden çıkma bağlantısı, <code>{'{{AD}}'}</code> listedeki ad, <code>{'{{EMAIL}}'}</code> alıcı adresi.
                                </div>
                            </>
                        ) : (
                            <iframe title="E-posta önizlemesi" sandbox="" srcDoc={html}
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
