import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Circle, Facebook, Instagram, Linkedin, Megaphone, Music2, RefreshCw, Save, Twitter, Youtube } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { DEFAULT_SITE_CONFIG, type SiteConfig, type SocialKey, type TrackingConfig } from '../../analytics/config';
import { adminApi } from '../adminApi';
import { C, btn, errorText, inputStyle, labelStyle } from '../format';
import { Card, ErrorBox, SectionHeader, Spinner } from '../ui';
import { Code, Steps } from './Settings';

const SOCIAL: { key: SocialKey; label: string; icon: React.ReactNode; placeholder: string }[] = [
    { key: 'instagram', label: 'Instagram', icon: <Instagram size={15} color="#e1306c" />, placeholder: 'https://www.instagram.com/edxdocu' },
    { key: 'facebook', label: 'Facebook', icon: <Facebook size={15} color="#1877f2" />, placeholder: 'https://www.facebook.com/edxdocu' },
    { key: 'youtube', label: 'YouTube', icon: <Youtube size={15} color="#ff0000" />, placeholder: 'https://www.youtube.com/@edxdocu' },
    { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={15} color="#0a66c2" />, placeholder: 'https://www.linkedin.com/company/edxdocu' },
    { key: 'x', label: 'X (Twitter)', icon: <Twitter size={15} color="#0f172a" />, placeholder: 'https://x.com/edxdocu' },
    { key: 'tiktok', label: 'TikTok', icon: <Music2 size={15} color="#0f172a" />, placeholder: 'https://www.tiktok.com/@edxdocu' },
];

const Field: React.FC<{ label: React.ReactNode; value: string; placeholder: string; hint?: React.ReactNode; onChange: (v: string) => void }> = ({ label, value, placeholder, hint, onChange }) => (
    <label style={{ display: 'block' }}>
        <span style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>{label}</span>
        <input value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} spellCheck={false} style={inputStyle} />
        {hint && <span style={{ display: 'block', fontSize: '0.74rem', color: C.dim, marginTop: 4 }}>{hint}</span>}
    </label>
);

const Active: React.FC<{ on: boolean; children: React.ReactNode }> = ({ on, children }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 700, color: on ? C.greenText : C.dim }}>
        {on ? <CheckCircle2 size={14} color={C.green} /> : <Circle size={14} />} {children}
    </span>
);

const fields = { display: 'flex', flexDirection: 'column', gap: 12 } as const;

export const Marketing: React.FC = () => {
    const pushToast = useUiStore(s => s.pushToast);
    const [cfg, setCfg] = useState<SiteConfig | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const load = () => adminApi.siteConfig().then(c => { setCfg(c); setDirty(false); setError(null); }).catch(e => setError(errorText(e)));
    useEffect(() => {
        let alive = true;
        adminApi.siteConfig().then(c => { if (alive) setCfg(c); }).catch(e => { if (alive) setError(errorText(e)); });
        return () => { alive = false; };
    }, []);

    const c = cfg ?? DEFAULT_SITE_CONFIG;
    const setTracking = (patch: Partial<TrackingConfig>) => { setCfg({ ...c, tracking: { ...c.tracking, ...patch } }); setDirty(true); };
    const setSocial = (key: SocialKey, v: string) => { setCfg({ ...c, social: { ...c.social, [key]: v } }); setDirty(true); };
    const t = c.tracking;

    const save = async () => {
        setSaving(true);
        try {
            setCfg(await adminApi.saveSiteConfig(c));
            setDirty(false);
            setError(null);
            pushToast({ kind: 'success', title: 'Kaydedildi', description: 'Değişiklikler en geç 1 dakika içinde sitede görünür.', ttl: 5000 });
        } catch (e) {
            pushToast({ kind: 'error', title: 'Kaydedilemedi', description: errorText(e), ttl: 8000 });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div data-admin-section="marketing">
            <SectionHeader icon={<Megaphone size={20} />} title="Sosyal medya ve reklam"
                subtitle="Site alt bilgisindeki sosyal medya bağlantıları ile Google, Meta (Instagram + Facebook) ve LinkedIn ölçüm kimlikleri."
                actions={<>
                    <button type="button" onClick={() => void load()} style={btn('ghost', true)}><RefreshCw size={14} /> Yenile</button>
                    <button type="button" data-admin-marketing-save disabled={!cfg || saving || !dirty} onClick={() => void save()}
                        style={{ ...btn('primary', true), opacity: !cfg || saving || !dirty ? 0.55 : 1 }}>
                        {saving ? <Spinner size={13} color="white" /> : <Save size={13} />} Kaydet
                    </button>
                </>} />
            {error && <div style={{ marginBottom: 14 }}><ErrorBox>{error}</ErrorBox></div>}
            {!cfg && !error ? <div style={{ color: C.muted, display: 'flex', gap: 8 }}><Spinner /> Yükleniyor…</div> : (
                <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 16, padding: '10px 14px', borderRadius: 12, background: C.soft, border: `1px solid ${C.border}` }}>
                        <Active on={!!t.gtmId}>Tag Manager</Active>
                        <Active on={!!t.googleTagId}>Google etiketi</Active>
                        <Active on={!!(t.googleAdsConversions.signUp || t.googleAdsConversions.purchase)}>Google Ads dönüşümleri</Active>
                        <Active on={!!t.metaPixelId}>Meta Pixel</Active>
                        <Active on={!!t.linkedinPartnerId}>LinkedIn</Active>
                        <Active on={SOCIAL.some(s => c.social[s.key])}>Sosyal medya bağlantıları</Active>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 16 }}>
                        <Card title="Sosyal medya hesapları">
                            <div style={fields}>
                                {SOCIAL.map(s => (
                                    <Field key={s.key} label={<>{s.icon} {s.label}</>} value={c.social[s.key]} placeholder={s.placeholder} onChange={v => setSocial(s.key, v)} />
                                ))}
                                <span style={{ fontSize: '0.76rem', color: C.dim }}>Doldurulan hesaplar sitenin en altında ikon olarak görünür. Boş bırakılan görünmez.</span>
                            </div>
                        </Card>
                        <Card title={<><BarChart3 size={16} color={C.accent} /> Google</>}>
                            <div style={fields}>
                                <Field label="Tag Manager kapsayıcısı" value={t.gtmId} placeholder="GTM-XXXXXXX" onChange={v => setTracking({ gtmId: v })}
                                    hint="Google Ads, Analytics ve YouTube etiketleri Tag Manager panelinden yönetilir." />
                                <Field label="Google etiketi (isteğe bağlı)" value={t.googleTagId} placeholder="G-XXXXXXX veya AW-XXXXXXX" onChange={v => setTracking({ googleTagId: v })}
                                    hint="Tag Manager kullanıyorsanız boş bırakın; aynı kimlik iki yerde olursa ziyaretler iki kez sayılır." />
                                <Field label="Google Ads dönüşümü: kayıt" value={t.googleAdsConversions.signUp} placeholder="AW-123456789/AbCdEf"
                                    onChange={v => setTracking({ googleAdsConversions: { ...t.googleAdsConversions, signUp: v } })} />
                                <Field label="Google Ads dönüşümü: satın alma" value={t.googleAdsConversions.purchase} placeholder="AW-123456789/GhIjKl"
                                    onChange={v => setTracking({ googleAdsConversions: { ...t.googleAdsConversions, purchase: v } })}
                                    hint="Dönüşümleri Tag Manager'da tanımladıysanız bu iki alanı boş bırakın." />
                            </div>
                        </Card>
                        <Card title={<><Instagram size={16} color="#e1306c" /><Facebook size={16} color="#1877f2" /> Meta (Instagram + Facebook)</>}>
                            <div style={fields}>
                                <Field label="Meta Pixel kimliği" value={t.metaPixelId} placeholder="123456789012345" onChange={v => setTracking({ metaPixelId: v })}
                                    hint="Ziyaret, kayıt ve satın alma olayları yalnız reklam çerezine onay veren ziyaretçiler için gönderilir." />
                            </div>
                        </Card>
                        <Card title={<><Linkedin size={16} color="#0a66c2" /> LinkedIn</>}>
                            <div style={fields}>
                                <Field label="Insight Tag iş ortağı kimliği" value={t.linkedinPartnerId} placeholder="1234567" onChange={v => setTracking({ linkedinPartnerId: v })} />
                                <Field label="Dönüşüm kimliği: kayıt" value={t.linkedinConversions.signUp} placeholder="12345678"
                                    onChange={v => setTracking({ linkedinConversions: { ...t.linkedinConversions, signUp: v } })} />
                                <Field label="Dönüşüm kimliği: satın alma" value={t.linkedinConversions.purchase} placeholder="12345679"
                                    onChange={v => setTracking({ linkedinConversions: { ...t.linkedinConversions, purchase: v } })} />
                            </div>
                        </Card>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '1rem', color: C.text, margin: '6px 0 12px' }}>Sizin yapmanız gerekenler</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
                        <Card title="Instagram ve Facebook (Meta)">
                            <Steps items={[
                                <><b>business.facebook.com</b> adresinde bir Meta işletme portföyü açın. <b>Ayarlar → Hesaplar</b> altında Facebook sayfanızı ve Instagram hesabınızı ekleyin. Instagram hesabının <b>işletme</b> ya da <b>içerik üreticisi</b> hesabı olması gerekir.</>,
                                <><b>Etkinlik Yöneticisi → Veri kaynağı bağla → Web</b> adımlarıyla bir <b>Pixel</b> oluşturun. Kurulum yöntemi sorulursa <b>"Kodu manuel olarak yükle"</b>yi seçip kodu kurmadan çıkın; kod sitede hazır.</>,
                                <>Pixel'in 15-16 haneli <b>kimliğini</b> kopyalayıp yukarıdaki <b>Meta Pixel kimliği</b> alanına yapıştırın ve <b>Kaydet</b>'e basın.</>,
                                <><b>Ayarlar → Marka güvenliği → Alan adları</b> bölümünde <Code>edxdocu.com</Code> alan adını ekleyin. Doğrulama yöntemi olarak <b>DNS TXT kaydı</b>nı seçin ve verilen kaydı hosting panelinizdeki DNS ayarlarına ekleyin.</>,
                                <>Siteye girip çerez penceresinde <b>Tümünü kabul et</b>'e basın. Birkaç dakika içinde Etkinlik Yöneticisi'nde <Code>PageView</Code> görünmelidir. Kayıt olan kullanıcı <Code>CompleteRegistration</Code>, satın alma <Code>Purchase</Code> olarak gelir.</>,
                            ]} />
                        </Card>
                        <Card title="YouTube">
                            <Steps items={[
                                <>YouTube kanalınızın adresini (ör. <Code>https://www.youtube.com/@edxdocu</Code>) yukarıdaki <b>YouTube</b> alanına yazın; sitenin altında ikon olarak çıkar.</>,
                                <>YouTube reklamları Google Ads üzerinden verilir: <b>Google Ads → Araçlar → Veri yöneticisi → YouTube</b> adımlarıyla kanalınızı reklam hesabınıza bağlayın.</>,
                                <>Siteyi ziyaret edenlere YouTube'da reklam göstermek için ayrı bir kod gerekmez. Tag Manager'daki Google Ads etiketi bu kitleyi toplar (aşağıdaki Google adımları).</>,
                            ]} />
                        </Card>
                        <Card title="Google Ads ve Tag Manager">
                            <Steps items={[
                                <><b>tagmanager.google.com</b> adresinde <Code>{t.gtmId || 'GTM-…'}</Code> kapsayıcısını açın. Sitedeki kod hazır; çerez onayı da siteden Tag Manager'a otomatik bildirilir.</>,
                                <><b>Etiketler → Yeni → Google etiketi</b>: Google Ads'deki <Code>AW-…</Code> kimliğinizi yazın, tetikleyici olarak <b>Initialization - All Pages</b> seçin. Google Analytics kullanıyorsanız <Code>G-…</Code> kimliği için de aynısını yapın.</>,
                                <><b>Etiketler → Yeni → Dönüşüm Bağlayıcı</b> (Conversion Linker), tetikleyici <b>All Pages</b>.</>,
                                <>Google Ads'de <b>Hedefler → Dönüşümler</b> altında "Kayıt" ve "Satın alma" dönüşümleri oluşturun. Tag Manager'da her biri için <b>Google Ads Dönüşüm İzleme</b> etiketi ekleyin. Tetikleyici olarak <b>Özel etkinlik</b> seçin ve adına <Code>sign_up</Code> ya da <Code>purchase</Code> yazın.</>,
                                <>Site, ekran değişimlerini <Code>virtual_page_view</Code> olayıyla (<Code>page_path</Code>, <Code>page_title</Code>) gönderir. Satın alma tutarı <Code>ecommerce.value</Code>, para birimi <Code>ecommerce.currency</Code> değişkenindedir.</>,
                                <><b>Önizle</b> ile test edin, ardından sağ üstteki <b>Gönder → Yayınla</b>'ya basın. Yayınlamadan hiçbir etiket çalışmaz.</>,
                            ]} />
                        </Card>
                        <Card title="LinkedIn (isteğe bağlı)">
                            <Steps items={[
                                <><b>LinkedIn Campaign Manager → Analiz → Insight Tag</b> bölümünde <b>Etiketi kendim yükleyeceğim</b>i seçin ve <b>iş ortağı kimliğini</b> (partner id) kopyalayın.</>,
                                <><b>Analiz → Dönüşüm izleme</b> altında "Kayıt" ve "Satın alma" dönüşümlerini <b>olay belirli</b> (event-specific) yöntemle oluşturun ve kimliklerini yukarıya yazın.</>,
                                <>Meta'daki gibi, LinkedIn de yalnız reklam çerezine onay veren ziyaretçiler için çalışır.</>,
                            ]} />
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};
