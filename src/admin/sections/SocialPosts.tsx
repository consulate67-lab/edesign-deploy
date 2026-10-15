import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    CheckCircle2, Copy, ExternalLink, Facebook, ImagePlus, Instagram, Link2, Linkedin, Plus, RefreshCw, Save, Send, Share2, Sparkles, Trash2, Twitter,
    Unplug, Users as UsersIcon, XCircle,
} from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { adminApi } from '../adminApi';
import type {
    SocialLang, SocialMetaConnectResult, SocialPlatform, SocialPost, SocialPostInput, SocialResult, SocialStatus, SocialTone,
} from '../contracts';
import { C, btn, errorText, fmtDateTime, inputStyle, labelStyle } from '../format';
import { Badge, Card, Empty, ErrorBox, SectionHeader, Spinner } from '../ui';
import { Code, Steps } from './Settings';

const SITE = 'https://www.edxdocu.com';

const PLATFORMS: { id: SocialPlatform; label: string; icon: React.ReactNode; limit: number; api: boolean }[] = [
    { id: 'facebook', label: 'Facebook sayfası', icon: <Facebook size={15} color="#1877f2" />, limit: 5000, api: true },
    { id: 'instagram', label: 'Instagram', icon: <Instagram size={15} color="#e1306c" />, limit: 2200, api: true },
    { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={15} color="#0a66c2" />, limit: 3000, api: false },
    { id: 'x', label: 'X (Twitter)', icon: <Twitter size={15} color="#0f172a" />, limit: 280, api: false },
    { id: 'groups', label: 'WhatsApp / Telegram / gruplar', icon: <UsersIcon size={15} color="#16a34a" />, limit: 3000, api: false },
];

const TOPICS: { label: string; topic: string; link: string }[] = [
    { label: 'Ürün tanıtımı', topic: 'edXdocu ile XSLT bilmeden, sürükle-bırak e-Fatura / e-Arşiv / e-İrsaliye tasarımı', link: `${SITE}/` },
    { label: 'Ücretsiz deneme çağrısı', topic: 'Ücretsiz üyelik, kendi XML dosyanla önizleme ve filigranlı ücretsiz test indirme', link: `${SITE}/#kayit` },
    { label: 'Fiyatlar ve paketler', topic: 'Abonelik yok, tek seferlik ödeme: One, Basic ve Pro paketleri', link: `${SITE}/#fiyatlar` },
    { label: 'Rehber: e-Fatura tasarımı nasıl yapılır', topic: 'Adım adım e-Fatura tasarımı rehberimiz yayında', link: `${SITE}/rehber/e-fatura-tasarimi-nasil-yapilir.html` },
    { label: 'Rehber: XSLT nedir', topic: 'e-Fatura XSLT görüntü dosyası nedir, nasıl çalışır, sık yapılan hatalar', link: `${SITE}/rehber/xslt-nedir-e-fatura-goruntu-dosyasi.html` },
    { label: 'Rehber: logo, kaşe, imza ekleme', topic: 'e-Faturaya logo, kaşe, imza ve IBAN eklemenin doğru yolu', link: `${SITE}/rehber/e-faturaya-logo-kase-imza-ekleme.html` },
    { label: 'Rehber: e-Arşiv tasarımı', topic: 'e-Arşiv fatura tasarımında görünümde olması gerekenler', link: `${SITE}/rehber/e-arsiv-fatura-tasarimi.html` },
    { label: 'Rehber: e-İrsaliye tasarımı', topic: 'e-İrsaliye görünümünde sevk, araç ve şoför alanları', link: `${SITE}/rehber/e-irsaliye-tasarimi.html` },
    { label: 'Rehber: XSLT entegratöre yükleme', topic: 'Hazırlanan XSLT şablonunu entegratöre ve ERP programına yükleme', link: `${SITE}/rehber/e-fatura-xslt-yukleme.html` },
    { label: 'Yurt dışı: XRechnung / Peppol', topic: 'XRechnung, Peppol BIS 3 ve EN 16931 e-fatura görünüm tasarımı', link: `${SITE}/rehber/e-invoice-template-designer.html` },
    { label: 'Serbest konu', topic: '', link: `${SITE}/` },
];

const LANGS: { id: SocialLang; label: string }[] = [{ id: 'tr', label: 'Türkçe' }, { id: 'en', label: 'İngilizce' }, { id: 'de', label: 'Almanca' }];
const TONES: { id: SocialTone; label: string }[] = [
    { id: 'samimi', label: 'Samimi' }, { id: 'kurumsal', label: 'Kurumsal' }, { id: 'bilgilendirici', label: 'Bilgilendirici' }, { id: 'enerjik', label: 'Enerjik' },
];

const SITE_IMAGES = [{ label: 'Tanıtım görseli', src: '/og-image.png' }];

/** X bağlantıları 23 karakter sayar. */
const lengthOf = (platform: SocialPlatform, text: string) =>
    platform === 'x' ? text.replace(/https?:\/\/\S+/g, 'x'.repeat(23)).length : text.length;

/** Instagram yalnız JPEG ve 4:5 – 1.91:1 arası en-boy oranı kabul eder; taşan kenar ortadan kırpılır. */
const toInstagramJpeg = (src: string) => new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (sw / sh < 0.8) { const h = Math.round(sw / 0.8); sy = Math.round((sh - h) / 2); sh = h; }
        else if (sw / sh > 1.91) { const w = Math.round(sh * 1.91); sx = Math.round((sw - w) / 2); sw = w; }
        const scale = Math.min(1, 1440 / sw);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(sw * scale);
        canvas.height = Math.round(sh * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Tarayıcı görseli işleyemedi.'));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => reject(new Error('Görsel açılamadı.'));
    img.src = src;
});

const toInput = (p: SocialPost): SocialPostInput => ({ topic: p.topic, link: p.link, imageId: p.image_id, texts: p.texts });

const ResultBadge: React.FC<{ r?: SocialResult }> = ({ r }) => {
    if (!r || r.status === 'pending') return null;
    if (r.status === 'failed') return <span title={r.error}><Badge color={C.red}><XCircle size={11} /> Hata</Badge></span>;
    const label = r.status === 'published' ? 'Yayınlandı' : 'Paylaşıldı';
    return r.url
        ? <a href={r.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}><Badge color={C.green}><CheckCircle2 size={11} /> {label} <ExternalLink size={10} /></Badge></a>
        : <Badge color={C.green}><CheckCircle2 size={11} /> {label}</Badge>;
};

// ------------------------------------------------------------ Meta bağlantısı

const MetaCard: React.FC<{ status: SocialStatus; onStatus: (s: SocialStatus) => void }> = ({ status, onStatus }) => {
    const pushToast = useUiStore(s => s.pushToast);
    const [token, setToken] = useState('');
    const [appId, setAppId] = useState('');
    const [appSecret, setAppSecret] = useState('');
    const [pages, setPages] = useState<SocialMetaConnectResult['pages']>([]);
    const [busy, setBusy] = useState(false);
    const meta = status.meta;

    const connect = async (pageId?: string) => {
        setBusy(true);
        try {
            const r = await adminApi.connectMeta({ token: token.trim(), appId: appId.trim(), appSecret: appSecret.trim(), pageId });
            setPages(r.meta.connected ? [] : r.pages);
            onStatus({ ...status, meta: r.meta });
            if (r.meta.connected) {
                setToken(''); setAppSecret('');
                pushToast({ kind: 'success', title: 'Bağlandı', description: `${r.meta.pageName}${r.meta.instagram ? ` · @${r.meta.instagram}` : ''}`, ttl: 5000 });
            }
        } catch (e) {
            pushToast({ kind: 'error', title: 'Bağlanamadı', description: errorText(e), ttl: 10000 });
        } finally {
            setBusy(false);
        }
    };

    const disconnect = async () => {
        if (!window.confirm('Facebook / Instagram bağlantısı kaldırılsın mı?')) return;
        try {
            const r = await adminApi.disconnectMeta();
            onStatus({ ...status, meta: r.meta });
        } catch (e) {
            pushToast({ kind: 'error', title: 'Kaldırılamadı', description: errorText(e), ttl: 7000 });
        }
    };

    if (meta.connected) {
        return (
            <Card title={<><Facebook size={16} color="#1877f2" /><Instagram size={16} color="#e1306c" /> Meta bağlantısı</>}
                actions={<button type="button" onClick={() => void disconnect()} style={btn('ghost', true)}><Unplug size={13} /> Kaldır</button>}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                    <span><Facebook size={14} color="#1877f2" style={{ verticalAlign: -2 }} /> Sayfa: <b>{meta.pageName}</b></span>
                    <span><Instagram size={14} color="#e1306c" style={{ verticalAlign: -2 }} /> Instagram: {meta.instagram ? <b>@{meta.instagram}</b> : <span style={{ color: C.amberText }}>sayfaya bağlı işletme hesabı yok</span>}</span>
                    {!meta.longLived && (
                        <span style={{ color: C.amberText, fontSize: '0.78rem' }}>
                            Token uygulama kimliği olmadan bağlandı; Meta bu tür token'ları birkaç saat içinde geçersiz kılabilir. Kalıcı bağlantı için uygulama kimliği ve gizli anahtarla yeniden bağlayın.
                        </span>
                    )}
                    <span style={{ color: C.dim, fontSize: '0.76rem' }}>Bağlantı tarihi: {fmtDateTime(meta.connectedAt)}</span>
                </div>
            </Card>
        );
    }

    return (
        <Card title={<><Facebook size={16} color="#1877f2" /><Instagram size={16} color="#e1306c" /> Facebook ve Instagram'ı bağla</>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Steps items={[
                    <><b>developers.facebook.com</b> → <b>Uygulamalarım → Uygulama oluştur</b>. Kullanım alanında <b>Diğer</b>, türde <b>İşletme</b>'yi seçin ve EdXdocu işletme portföyünü bağlayın.</>,
                    <>Uygulamada <b>Uygulama ayarları → Temel</b> sayfasından <b>Uygulama kimliği</b> ve <b>Uygulama gizli anahtarı</b>nı aşağıya yapıştırın.</>,
                    <><b>Araçlar → Graph API Gezgini</b>'nde uygulamanızı seçin, <b>Kullanıcı token'ı</b>na şu izinleri ekleyin: <Code>pages_show_list</Code> <Code>pages_read_engagement</Code> <Code>pages_manage_posts</Code> <Code>instagram_basic</Code> <Code>instagram_content_publish</Code> <Code>business_management</Code>. <b>Generate Access Token</b> ile EdXdocu sayfasını ve Instagram hesabını seçip onaylayın.</>,
                    <>Çıkan token'ı aşağıya yapıştırıp <b>Bağla</b>'ya basın; süresiz sayfa token'ına çevrilir. Instagram'ın görünmesi için hesabın EdXdocu sayfasına bağlı olması gerekir (Sayfa → Ayarlar → Bağlı hesaplar).</>,
                ]} />
                <label><span style={labelStyle}>Erişim token'ı</span>
                    <textarea value={token} onChange={e => setToken(e.target.value)} rows={3} spellCheck={false} placeholder="EAAG…" style={{ ...inputStyle, resize: 'vertical', fontFamily: 'Consolas, monospace', fontSize: '0.76rem' }} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label><span style={labelStyle}>Uygulama kimliği</span>
                        <input value={appId} onChange={e => setAppId(e.target.value)} spellCheck={false} placeholder="1234567890" style={inputStyle} />
                    </label>
                    <label><span style={labelStyle}>Uygulama gizli anahtarı</span>
                        <input value={appSecret} onChange={e => setAppSecret(e.target.value)} spellCheck={false} type="password" autoComplete="off" placeholder="32 karakter" style={inputStyle} />
                    </label>
                </div>
                {pages.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={labelStyle}>Birden çok sayfa bulundu; paylaşım yapılacak sayfayı seçin:</span>
                        {pages.map(p => (
                            <button key={p.id} type="button" disabled={busy} onClick={() => void connect(p.id)} style={{ ...btn('secondary', true), justifyContent: 'flex-start' }}>
                                <Facebook size={13} color="#1877f2" /> {p.name}{p.instagram ? ` · @${p.instagram}` : ''}
                            </button>
                        ))}
                    </div>
                )}
                <button type="button" disabled={busy || !token.trim()} onClick={() => void connect()}
                    style={{ ...btn('primary'), alignSelf: 'flex-start', opacity: busy || !token.trim() ? 0.55 : 1 }}>
                    {busy ? <Spinner size={14} color="white" /> : <Link2 size={14} />} Bağla
                </button>
            </div>
        </Card>
    );
};

// ------------------------------------------------------------ taslak düzenleyici

const PostEditor: React.FC<{ post: SocialPost; status: SocialStatus; onSaved: (p: SocialPost) => void; onClose: () => void }> = ({ post, status, onSaved, onClose }) => {
    const pushToast = useUiStore(s => s.pushToast);
    const [draft, setDraft] = useState<SocialPostInput>(() => toInput(post));
    const [imageUrl, setImageUrl] = useState(post.image_url);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const meta = status.meta;

    useEffect(() => {
        setDraft(toInput(post));
        setImageUrl(prev => post.image_url ?? (post.image_id ? prev : null));
        setDirty(false);
    }, [post]);

    const patch = (p: Partial<SocialPostInput>) => { setDraft(d => ({ ...d, ...p })); setDirty(true); };
    const setText = (platform: SocialPlatform, text: string) => patch({ texts: { ...draft.texts, [platform]: text } });

    const run = async <T,>(key: string, fn: () => Promise<T>, done?: string) => {
        setBusy(key);
        try {
            const r = await fn();
            if (done) pushToast({ kind: 'success', title: done, ttl: 4000 });
            return r;
        } catch (e) {
            pushToast({ kind: 'error', title: 'İşlem başarısız', description: errorText(e), ttl: 10000 });
            return undefined;
        } finally {
            setBusy(null);
        }
    };

    const save = async (input = draft) => {
        const saved = await adminApi.updateSocialPost(post.id, input);
        setDirty(false);
        onSaved(saved);
        return saved;
    };

    const applyImage = async (src: string) => {
        await run('image', async () => {
            const jpeg = await toInstagramJpeg(src);
            const img = await adminApi.uploadSocialImage(jpeg);
            const next = { ...draft, imageId: img.id };
            setDraft(next);
            setImageUrl(img.url ?? jpeg);
            await save(next);
        }, 'Görsel eklendi');
    };

    const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const url = URL.createObjectURL(file);
        void applyImage(url).finally(() => URL.revokeObjectURL(url));
    };

    const removeImage = () => { patch({ imageId: null }); setImageUrl(null); };

    const publish = async (platform: 'facebook' | 'instagram') => {
        const name = platform === 'facebook' ? `Facebook sayfası "${meta.connected ? meta.pageName : ''}"` : `Instagram @${meta.connected ? meta.instagram : ''}`;
        if (!window.confirm(`${name} hesabında herkese açık olarak yayınlansın mı?`)) return;
        await run(platform, async () => {
            if (dirty) await save();
            onSaved(await adminApi.publishSocialPost(post.id, platform));
        }, 'Yayınlandı');
    };

    const share = async (platform: SocialPlatform, target?: 'whatsapp' | 'telegram' | 'fbgroups') => {
        const text = draft.texts[platform] ?? '';
        try { await navigator.clipboard.writeText(text); } catch { /* izin yoksa kullanıcı elle kopyalar */ }
        const enc = encodeURIComponent(text);
        const url = platform === 'linkedin' ? `https://www.linkedin.com/feed/?shareActive=true&text=${enc}`
            : platform === 'x' ? `https://x.com/intent/post?text=${enc}`
            : target === 'whatsapp' ? `https://wa.me/?text=${enc}`
            : target === 'telegram' ? `https://t.me/share/url?url=${encodeURIComponent(draft.link || SITE)}&text=${enc}`
            : target === 'fbgroups' ? 'https://www.facebook.com/groups/feed/'
            : null;
        if (url) window.open(url, '_blank', 'noopener');
        pushToast({ kind: 'info', title: 'Metin kopyalandı', description: 'Paylaştıktan sonra "Paylaşıldı" olarak işaretleyin.', ttl: 5000 });
    };

    const mark = (platform: SocialPlatform, done: boolean) => run(`mark-${platform}`, async () => onSaved(await adminApi.markSocialPost(post.id, platform, done)));

    const visible = PLATFORMS.filter(p => p.id in draft.texts);

    return (
        <Card title={<><Share2 size={16} color={C.accent} /> Paylaşım #{post.id}</>}
            actions={<>
                <button type="button" disabled={!dirty || !!busy} onClick={() => void run('save', save, 'Kaydedildi')}
                    style={{ ...btn('primary', true), opacity: !dirty || busy ? 0.55 : 1 }}>
                    {busy === 'save' ? <Spinner size={13} color="white" /> : <Save size={13} />} Kaydet
                </button>
                <button type="button" onClick={onClose} style={btn('ghost', true)}>Kapat</button>
            </>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: 18, alignItems: 'start' }} className="adm-social-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span style={labelStyle}>Görsel (Instagram için zorunlu)</span>
                    <div style={{ aspectRatio: '4 / 5', borderRadius: 12, border: `1px dashed ${C.borderStrong}`, background: C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {busy === 'image' ? <Spinner /> : imageUrl
                            ? <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            : <span style={{ color: C.dim, fontSize: '0.8rem', padding: 12, textAlign: 'center' }}>Görsel yok</span>}
                    </div>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} style={{ display: 'none' }} />
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button type="button" disabled={!!busy} onClick={() => fileRef.current?.click()} style={btn('secondary', true)}><ImagePlus size={13} /> Bilgisayardan</button>
                        {SITE_IMAGES.map(s => (
                            <button key={s.src} type="button" disabled={!!busy} onClick={() => void applyImage(s.src)} style={btn('ghost', true)}>{s.label}</button>
                        ))}
                        {imageUrl && <button type="button" disabled={!!busy} onClick={removeImage} style={btn('danger', true)}><Trash2 size={13} /></button>}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: C.dim }}>Görsel JPEG'e çevrilir; Instagram'ın kabul ettiği 4:5 ile 1.91:1 arasına ortadan kırpılır.</span>
                    <label><span style={labelStyle}>Konu</span>
                        <input value={draft.topic} onChange={e => patch({ topic: e.target.value })} style={inputStyle} />
                    </label>
                    <label><span style={labelStyle}>Bağlantı</span>
                        <input value={draft.link} onChange={e => patch({ link: e.target.value })} spellCheck={false} style={inputStyle} />
                    </label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
                    {visible.length === 0 && <Empty>Bu taslakta metin yok.</Empty>}
                    {visible.map(p => {
                        const text = draft.texts[p.id] ?? '';
                        const len = lengthOf(p.id, text);
                        const r = post.results[p.id];
                        const done = r?.status === 'published' || r?.status === 'shared';
                        const needsImage = p.id === 'instagram' && !draft.imageId;
                        return (
                            <div key={p.id} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, background: '#fff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                    {p.icon}<b style={{ fontSize: '0.86rem' }}>{p.label}</b>
                                    <ResultBadge r={r} />
                                    <span style={{ marginLeft: 'auto', fontSize: '0.74rem', fontWeight: 700, color: len > p.limit ? C.redText : C.dim }}>{len} / {p.limit}</span>
                                </div>
                                <textarea value={text} onChange={e => setText(p.id, e.target.value)} rows={p.id === 'x' ? 3 : 7}
                                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
                                {r?.status === 'failed' && r.error && <div style={{ marginTop: 6 }}><ErrorBox>{r.error}</ErrorBox></div>}
                                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                    {p.api ? (
                                        <button type="button" disabled={!!busy || !meta.connected || done || needsImage || !text.trim() || (p.id === 'instagram' && meta.connected && !meta.instagram)}
                                            title={!meta.connected ? 'Önce Facebook sayfanızı bağlayın' : needsImage ? 'Instagram için görsel ekleyin' : undefined}
                                            onClick={() => void publish(p.id as 'facebook' | 'instagram')}
                                            style={{ ...btn('primary', true), opacity: busy || !meta.connected || done || needsImage || !text.trim() ? 0.55 : 1 }}>
                                            {busy === p.id ? <Spinner size={13} color="white" /> : <Send size={13} />} {done ? 'Yayınlandı' : 'Şimdi yayınla'}
                                        </button>
                                    ) : (
                                        <>
                                            {p.id === 'groups' ? (
                                                <>
                                                    <button type="button" onClick={() => void share(p.id, 'whatsapp')} style={btn('secondary', true)}><Send size={13} /> WhatsApp</button>
                                                    <button type="button" onClick={() => void share(p.id, 'telegram')} style={btn('secondary', true)}><Send size={13} /> Telegram</button>
                                                    <button type="button" onClick={() => void share(p.id, 'fbgroups')} style={btn('secondary', true)}><Facebook size={13} /> Facebook grupları</button>
                                                </>
                                            ) : (
                                                <button type="button" onClick={() => void share(p.id)} style={btn('secondary', true)}><ExternalLink size={13} /> Kopyala ve {p.id === 'x' ? 'X' : 'LinkedIn'}'i aç</button>
                                            )}
                                            <button type="button" onClick={() => void navigator.clipboard.writeText(text).then(() => pushToast({ kind: 'success', title: 'Kopyalandı', ttl: 2500 }))} style={btn('ghost', true)}><Copy size={13} /> Kopyala</button>
                                            <button type="button" disabled={!!busy} onClick={() => void mark(p.id, !done)} style={btn(done ? 'ghost' : 'success', true)}>
                                                <CheckCircle2 size={13} /> {done ? 'İşareti kaldır' : 'Paylaşıldı'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};

// ------------------------------------------------------------ bölüm

export const SocialPosts: React.FC = () => {
    const pushToast = useUiStore(s => s.pushToast);
    const [status, setStatus] = useState<SocialStatus | null>(null);
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [active, setActive] = useState<SocialPost | null>(null);
    const [preset, setPreset] = useState(0);
    const [topic, setTopic] = useState(TOPICS[0].topic);
    const [notes, setNotes] = useState('');
    const [link, setLink] = useState(TOPICS[0].link);
    const [lang, setLang] = useState<SocialLang>('tr');
    const [tone, setTone] = useState<SocialTone>('samimi');
    const [platforms, setPlatforms] = useState<SocialPlatform[]>(PLATFORMS.map(p => p.id));
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        try {
            const [s, list] = await Promise.all([adminApi.socialStatus(), adminApi.socialPosts()]);
            setStatus(s);
            setPosts(list);
            setError(null);
        } catch (e) {
            setError(errorText(e));
        }
    }, []);
    useEffect(() => { void load(); }, [load]);

    const choosePreset = (i: number) => { setPreset(i); setTopic(TOPICS[i].topic); setLink(TOPICS[i].link); };
    const togglePlatform = (id: SocialPlatform) => setPlatforms(list => list.includes(id) ? list.filter(p => p !== id) : [...list, id]);

    const upsert = (p: SocialPost) => {
        setPosts(list => [p, ...list.filter(x => x.id !== p.id)].sort((a, b) => b.id - a.id));
        setActive(p);
    };

    const generate = async () => {
        setBusy(true);
        try {
            upsert(await adminApi.generateSocialPost({ topic: topic.trim(), notes: notes.trim(), link: link.trim(), lang, tone, platforms }));
        } catch (e) {
            pushToast({ kind: 'error', title: 'Metin yazılamadı', description: errorText(e), ttl: 9000 });
        } finally {
            setBusy(false);
        }
    };

    const blank = async () => {
        try {
            upsert(await adminApi.createSocialPost({
                topic: topic.trim(), link: link.trim(), imageId: null, texts: Object.fromEntries(platforms.map(p => [p, ''])),
            }));
        } catch (e) {
            pushToast({ kind: 'error', title: 'Taslak açılamadı', description: errorText(e), ttl: 7000 });
        }
    };

    const remove = async (p: SocialPost) => {
        if (!window.confirm(`Paylaşım #${p.id} silinsin mi? Yayınlanmış gönderiler sosyal medyadan silinmez.`)) return;
        try {
            await adminApi.deleteSocialPost(p.id);
            setPosts(list => list.filter(x => x.id !== p.id));
            if (active?.id === p.id) setActive(null);
        } catch (e) {
            pushToast({ kind: 'error', title: 'Silinemedi', description: errorText(e), ttl: 7000 });
        }
    };

    const canGenerate = !busy && !!topic.trim() && platforms.length > 0 && !!status?.ai;

    return (
        <div data-admin-section="social">
            <style>{'@media (max-width: 900px) { .adm-social-grid { grid-template-columns: 1fr !important; } }'}</style>
            <SectionHeader icon={<Share2 size={20} />} title="Sosyal paylaşım"
                subtitle="Yapay zekâ her platforma uygun metni yazar. Facebook sayfası ve Instagram'a buradan yayınlanır; LinkedIn, X ve gruplar için metin kopyalanıp paylaşım ekranı açılır."
                actions={<button type="button" onClick={() => void load()} style={btn('ghost', true)}><RefreshCw size={14} /> Yenile</button>} />
            {error && <div style={{ marginBottom: 14 }}><ErrorBox>{error}</ErrorBox></div>}
            {!status && !error ? <div style={{ color: C.muted, display: 'flex', gap: 8 }}><Spinner /> Yükleniyor…</div> : status && (
                <>
                    {!status.imageHosting && (
                        <div style={{ marginBottom: 14 }}><ErrorBox>Sunucunun herkese açık adresi bilinmiyor; Instagram ve Facebook görselleri çekemez. Railway'de <Code>PUBLIC_API_URL</Code> tanımlayın.</ErrorBox></div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16, marginBottom: 16 }}>
                        <Card title={<><Sparkles size={16} color={C.accent2} /> Yeni paylaşım</>}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <label><span style={labelStyle}>Hazır konu</span>
                                    <select value={preset} onChange={e => choosePreset(Number(e.target.value))} style={inputStyle}>
                                        {TOPICS.map((t, i) => <option key={t.label} value={i}>{t.label}</option>)}
                                    </select>
                                </label>
                                <label><span style={labelStyle}>Konu</span>
                                    <input value={topic} onChange={e => setTopic(e.target.value)} maxLength={300} placeholder="Ör. e-Arşiv faturada logo nasıl eklenir" style={inputStyle} />
                                </label>
                                <label><span style={labelStyle}>Ek not (isteğe bağlı)</span>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} maxLength={1500}
                                        placeholder="Ör. mali müşavirlere hitap et, yeni yıl öncesi fatura tasarımını yenileme vurgusu yap" style={{ ...inputStyle, resize: 'vertical' }} />
                                </label>
                                <label><span style={labelStyle}>Bağlantı</span>
                                    <input value={link} onChange={e => setLink(e.target.value)} spellCheck={false} style={inputStyle} />
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <label><span style={labelStyle}>Dil</span>
                                        <select value={lang} onChange={e => setLang(e.target.value as SocialLang)} style={inputStyle}>
                                            {LANGS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                                        </select>
                                    </label>
                                    <label><span style={labelStyle}>Ton</span>
                                        <select value={tone} onChange={e => setTone(e.target.value as SocialTone)} style={inputStyle}>
                                            {TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                        </select>
                                    </label>
                                </div>
                                <div>
                                    <span style={labelStyle}>Platformlar</span>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {PLATFORMS.map(p => {
                                            const on = platforms.includes(p.id);
                                            return (
                                                <button key={p.id} type="button" onClick={() => togglePlatform(p.id)} aria-pressed={on}
                                                    style={{ ...btn(on ? 'secondary' : 'ghost', true), borderColor: on ? C.accent : C.border, background: on ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
                                                    {p.icon} {p.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {!status.ai && <ErrorBox>Yapay zekâ anahtarı sunucuda tanımlı değil; metinleri elle yazabilirsiniz.</ErrorBox>}
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <button type="button" disabled={!canGenerate} onClick={() => void generate()} style={{ ...btn('primary'), opacity: canGenerate ? 1 : 0.55 }}>
                                        {busy ? <Spinner size={14} color="white" /> : <Sparkles size={14} />} {busy ? 'Yazılıyor…' : 'Yapay zekâ ile yaz'}
                                    </button>
                                    <button type="button" disabled={busy || platforms.length === 0} onClick={() => void blank()} style={btn('ghost')}><Plus size={14} /> Boş taslak</button>
                                </div>
                            </div>
                        </Card>
                        <MetaCard status={status} onStatus={setStatus} />
                    </div>

                    {active && (
                        <div style={{ marginBottom: 16 }}>
                            <PostEditor post={active} status={status} onSaved={upsert} onClose={() => setActive(null)} />
                        </div>
                    )}

                    <Card title="Paylaşımlar">
                        {posts.length === 0 ? <Empty>Henüz paylaşım yok. Yukarıdan ilkini oluşturun.</Empty> : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {posts.map(p => (
                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px', borderTop: `1px solid ${C.border}`, flexWrap: 'wrap', background: active?.id === p.id ? C.soft : undefined }}>
                                        <span style={{ fontSize: '0.76rem', color: C.dim, minWidth: 110 }}>{fmtDateTime(p.created_at)}</span>
                                        <button type="button" onClick={() => setActive(p)} style={{ flex: 1, minWidth: 180, textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.85rem', color: C.text, padding: 0 }}>
                                            #{p.id} · {p.topic || 'Konusuz taslak'}
                                        </button>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            {PLATFORMS.filter(x => x.id in p.texts).map(x => {
                                                const r = p.results[x.id];
                                                const ok = r?.status === 'published' || r?.status === 'shared';
                                                return (
                                                    <span key={x.id} title={`${x.label}: ${ok ? 'paylaşıldı' : r?.status === 'failed' ? 'hata' : 'bekliyor'}`}
                                                        style={{ display: 'inline-flex', opacity: ok ? 1 : 0.35, outline: r?.status === 'failed' ? `2px solid ${C.red}` : undefined, borderRadius: 4 }}>
                                                        {x.icon}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                        <button type="button" onClick={() => setActive(p)} style={btn('secondary', true)}>Aç</button>
                                        <button type="button" onClick={() => void remove(p)} style={btn('danger', true)}><Trash2 size={13} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
};
