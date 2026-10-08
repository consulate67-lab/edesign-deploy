import React, { useEffect, useState } from 'react';
import { ArrowRight, MessageCircle, Sparkles, Zap, FileText, Globe, Layers, ChevronDown, Check, ShieldCheck } from 'lucide-react';
import { KVKKModal, KullaniciSozlesmesiModal, CerezPolitikasiModal } from './legal/Legal';
import { api } from './api';
import { PACKAGES_PLANS, type PackagePlan } from './pricing';
import { theme, techBackground, gradientTextStyle } from './theme';
import { HeroPreview } from './landing/HeroPreview';

interface LandingProps {
    onRegister: () => void;
    onLogin: () => void;
}

interface SssItem {
    q: string;
    a: string;
}

const SSS_ITEMS: SssItem[] = [
    {
        q: 'Nasıl satın alırım?',
        a: 'Önce üye olup giriş yapın, ardından size uygun paketi satın alın: One (600 TL, 1 tasarım hakkı), Basic (2.500 TL, 10 tasarım hakkı) veya Pro (4.000 TL, 25 tasarım hakkı). Tüm paketler tek seferlik ödemedir; aylık abonelik yoktur. Haklarınız süresizdir.',
    },
    {
        q: 'Hangi e-belge tiplerini tasarlayabilirim?',
        a: 'Toplam 15 belge türü: e-Fatura, e-Arşiv, e-İrsaliye, e-İrsaliye Yanıtı, e-İhracat, e-SMM, e-Müstahsil, e-Gider Pusulası, e-Döviz / Kıymetli Maden, e-Dekont, e-Sigorta Komisyon Gider Belgesi, e-Bilet, e-Bilet Raporu, e-Yolcu Listesi ve e-Makbuz. Her tür için GİB resmi XSLT veya hazır şablon yüklenir.',
    },
    {
        q: 'XSLT bilmem gerekiyor mu?',
        a: 'Hayır. Hazır şablonlardan birini seçip görsel editörle sürükle-bırak mantığıyla özelleştirebilirsiniz. İsterseniz kendi XSLT dosyanızı da (.xslt / .xsl / .xml) yükleyip aynı editörde düzenleyebilirsiniz.',
    },
    {
        q: 'Tasarımlarım GİB uyumlu mu?',
        a: 'Evet. Tüm şablonlar GİB UBL-TR 1.2.1 şemasına ve e-Fatura Paketi v29’a uygun şekilde hazırlanmıştır. GİB tarafından yayımlanan örnek XML dosyalarıyla test edilmiştir.',
    },
    {
        q: 'Ödeme nasıl çalışır?',
        a: 'Giriş yaptıktan sonra Paket Al ile seçtiğiniz paketi iyzico 3D Secure üzerinden satın alırsınız. Her tasarım kaydı 1 hak harcar. Ödeme sonrası haklar hesabınıza otomatik yansır; bittiğinde yeni paket alabilirsiniz.',
    },
    {
        q: 'Verilerim Türkiye’de mi saklanıyor?',
        a: 'Evet. Tüm kullanıcı ve şablon verileri Türkiye’deki (Railway) PostgreSQL veritabanında, KVKK kapsamında saklanır. XSLT dosyaları statik olarak GitHub Pages üzerinden sunulur.',
    },
];

const DOC_TYPES = [
    { label: 'e-Fatura', code: '01', id: 'fatura', a: '#2563eb' },
    { label: 'e-Arşiv', code: '02', id: 'arsiv', a: '#7c3aed' },
    { label: 'e-İrsaliye', code: '03', id: 'irsaliye', a: '#0284c7' },
    { label: 'e-İrsaliye Yanıtı', code: '04', id: 'irsaliye-yanit', a: '#0891b2' },
    { label: 'e-İhracat', code: '05', id: 'ihracat', a: '#059669' },
    { label: 'e-SMM', code: '06', id: 'smm', a: '#db2777' },
    { label: 'e-Müstahsil', code: '07', id: 'mustahsil', a: '#65a30d' },
    { label: 'e-Gider Pusulası', code: '08', id: 'gider-pusulasi', a: '#4d7c0f' },
    { label: 'e-Döviz / Kıymetli Maden', code: '09', id: 'doviz', a: '#b45309' },
    { label: 'e-Dekont', code: '10', id: 'dekont', a: '#0d9488' },
    { label: 'e-Sigorta Komisyon', code: '11', id: 'sigorta-komisyon', a: '#4f46e5' },
    { label: 'e-Bilet', code: '12', id: 'bilet', a: '#ea580c' },
    { label: 'e-Bilet Raporu', code: '13', id: 'bilet-rapor', a: '#c2410c' },
    { label: 'e-Yolcu Listesi', code: '14', id: 'bilet-yolcu', a: '#e11d48' },
    { label: 'e-Makbuz', code: '15', id: 'makbuz', a: '#0f766e' },
];

const LOGO_URL = `${import.meta.env.BASE_URL}favicon.svg`;

const LANDING_CSS = `
@keyframes edesign-word-in{from{opacity:0;transform:translateY(0.35em)}to{opacity:1;transform:none}}
@keyframes edesign-float{0%,100%{transform:translateY(0) rotate(4deg)}50%{transform:translateY(-8px) rotate(3deg)}}
@keyframes edesign-pulse{0%,100%{opacity:.55}50%{opacity:1}}
.ld-nav a{color:${theme.textMuted};text-decoration:none;transition:color .15s}
.ld-nav a:hover{color:${theme.primary}}
.ld-card{transition:transform .2s, box-shadow .2s, border-color .2s}
.ld-card:hover{transform:translateY(-3px);box-shadow:${theme.shadow}}
.ld-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,0.9fr);gap:56px;align-items:center}
.ld-hero-text{text-align:left}
.ld-bento{display:grid;grid-template-columns:1.4fr 1fr 1fr;grid-template-rows:auto auto;gap:16px}
.ld-bento-hero{grid-row:1 / span 2}
.ld-footer a{color:${theme.textSubtle};text-decoration:none;cursor:pointer;transition:color .15s}
.ld-footer a:hover{color:${theme.primary}}
@media (max-width: 960px){
  .ld-hero{grid-template-columns:1fr;gap:40px}
  .ld-hero-text{text-align:center}
  .ld-hero-text [data-rotating-doctype]{justify-content:center}
  .ld-hero-sub{margin-left:auto !important;margin-right:auto !important}
  .ld-hero-ctas{justify-content:center}
  .ld-bento{grid-template-columns:1fr 1fr}
  .ld-bento-hero{grid-row:auto;grid-column:1 / -1}
}
@media (max-width: 720px){
  .ld-nav{display:none !important}
  .ld-bento{grid-template-columns:1fr}
  .ld-header{padding:12px 16px !important}
  .ld-brand{font-size:15px !important}
  .ld-section{padding-left:16px !important;padding-right:16px !important}
}
@media (prefers-reduced-motion: reduce){
  .ld-float{animation:none !important}
}
`;

const ROTATE_MS = 3200;

/** Başlıkta belge türleri arasında dönen kelime. */
const RotatingDocType: React.FC<{ dt: (typeof DOC_TYPES)[number] }> = ({ dt }) => {
    // Uzun adlar küçültülür: satır hep tek kalsın, başlık yüksekliği değişmesin.
    const fit = dt.label.length > 16 ? `${Math.max(0.6, 16 / dt.label.length).toFixed(3)}em` : '1em';
    return (
        <span data-rotating-doctype style={{ display: 'flex', alignItems: 'flex-end', height: '1.1em', whiteSpace: 'nowrap' }}>
            <span
                key={dt.label}
                style={{
                    display: 'inline-block',
                    fontSize: fit,
                    color: dt.a,
                    animation: 'edesign-word-in 0.45s ease-out',
                }}
            >
                {dt.label}
            </span>
        </span>
    );
};

const SectionTitle: React.FC<{ title: string; subtitle?: string; eyebrow?: string }> = ({ title, subtitle, eyebrow }) => (
    <div style={{ textAlign: 'center', marginBottom: 36 }}>
        {eyebrow && (
            <div
                style={{
                    display: 'inline-block',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 1.6,
                    textTransform: 'uppercase',
                    color: theme.primary,
                    background: theme.primarySoft,
                    padding: '5px 12px',
                    borderRadius: 999,
                    marginBottom: 14,
                }}
            >
                {eyebrow}
            </div>
        )}
        <h2
            style={{
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                margin: '0 0 10px',
                color: theme.text,
            }}
        >
            {title}
        </h2>
        {subtitle && <p style={{ fontSize: 16, color: theme.textMuted, margin: '0 auto', maxWidth: 620 }}>{subtitle}</p>}
    </div>
);

/**
 * Landing — açık, canlı "tech" tema.
 * Nokta ızgaralı açık zemin + mor/mavi/camgöbeği ışık lekeleri, beyaz kartlar,
 * marka gradyanı (mor → mavi → camgöbeği) butonlar ve vurgularda.
 */
export const Landing: React.FC<LandingProps> = ({ onRegister, onLogin }) => {
    const [openSss, setOpenSss] = useState<string | null>(null);
    const [legalModal, setLegalModal] = useState<'kvkk' | 'sozlesme' | 'cerez' | null>(null);
    // step: kaçıncı dönüş; belge türü step % 15, aynı türün kaçıncı gelişi (galeriden sıradaki şablon) step / 15.
    const [step, setStep] = useState(0);
    const [previewHover, setPreviewHover] = useState(false);
    useEffect(() => {
        if (previewHover || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
        const t = window.setInterval(() => setStep(n => n + 1), ROTATE_MS);
        return () => window.clearInterval(t);
    }, [previewHover]);
    const docIdx = step % DOC_TYPES.length;
    const activeDoc = DOC_TYPES[docIdx];
    const nextDoc = DOC_TYPES[(docIdx + 1) % DOC_TYPES.length];
    const round = Math.floor(step / DOC_TYPES.length);

    const handleBuyPlan = async (plan: PackagePlan) => {
        // Satın alma yalnızca üyeler için — giriş yoksa giriş ekranına.
        if (!api.getToken()) {
            onLogin();
            return;
        }
        try {
            const result = await api.iyzicoCheckout(plan.id);
            if (result.paymentPageUrl) {
                // Iyzico 3D odeme sayfasina yonlendir
                window.location.href = result.paymentPageUrl;
            } else {
                window.alert('Odeme baslatilamadi, lutfen tekrar deneyin.');
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('[Landing] iyzicoCheckout hatasi:', e);
            window.alert('Odeme baslatilamadi. Giris yaptiginizdan emin olun. ' + (e instanceof Error ? e.message : 'bilinmeyen'));
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100%',
                ...techBackground,
                color: theme.text,
                fontFamily: theme.font,
                position: 'relative',
                overflowX: 'hidden',
            }}
        >
            <style>{LANDING_CSS}</style>

            {/* ====================== NAV ====================== */}
            <header
                className="ld-header"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    padding: '14px 32px',
                    background: 'rgba(255,255,255,0.78)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                    borderBottom: `1px solid ${theme.border}`,
                }}
            >
                <div
                    style={{
                        maxWidth: 1280,
                        margin: '0 auto',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 24,
                    }}
                >
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
                    >
                        <img src={LOGO_URL} alt="" width={34} height={34} style={{ display: 'block', borderRadius: 10, boxShadow: theme.shadowBrand }} />
                        <span className="ld-brand" style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: theme.text, whiteSpace: 'nowrap' }}>
                            eBelge <span style={gradientTextStyle}>Tasarımcı</span>
                        </span>
                    </a>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                        <nav className="ld-nav" style={{ display: 'flex', gap: 28, fontSize: 14, fontWeight: 600 }}>
                            <a href="#urun">Ürün</a>
                            <a href="#belgeler">Belgeler</a>
                            <a href="#fiyatlar">Fiyatlar</a>
                            <a href="#sss">SSS</a>
                        </nav>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                                type="button"
                                onClick={onLogin}
                                style={{
                                    padding: '9px 16px',
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    color: theme.text,
                                    fontFamily: 'inherit',
                                }}
                            >
                                Giriş
                            </button>
                            <button
                                type="button"
                                onClick={onRegister}
                                style={{
                                    padding: '10px 20px',
                                    background: theme.gradient,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 999,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    boxShadow: theme.shadowBrand,
                                    fontFamily: 'inherit',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Üye ol <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ====================== HERO ====================== */}
            <section
                className="ld-section"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '64px 32px 40px',
                    maxWidth: 1280,
                    margin: '0 auto',
                }}
            >
                <div className="ld-hero">
                <div className="ld-hero-text">
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '5px 14px 5px 5px',
                            background: '#fff',
                            border: `1px solid ${theme.border}`,
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 500,
                            color: theme.textMuted,
                            marginBottom: 28,
                            boxShadow: theme.shadowSm,
                        }}
                    >
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 10px',
                                borderRadius: 999,
                                background: theme.gradient,
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: 0.5,
                            }}
                        >
                            <Sparkles size={12} /> YENİ
                        </span>
                        e-Gider Pusulası, e-Döviz / Kıymetli Maden, e-Dekont ve e-Sigorta Komisyon eklendi
                    </div>

                    <h1
                        style={{
                            fontSize: 'clamp(36px, 4.6vw, 62px)',
                            fontWeight: 800,
                            lineHeight: 1.06,
                            letterSpacing: '-0.035em',
                            margin: '0 0 22px',
                            color: theme.text,
                        }}
                    >
                        <RotatingDocType dt={activeDoc} />
                        tasarımı artık
                        <br />
                        <span style={gradientTextStyle}>çok kolay</span>
                    </h1>

                    <p
                        className="ld-hero-sub"
                        style={{
                            fontSize: 18,
                            color: theme.textMuted,
                            margin: '0 0 32px',
                            lineHeight: 1.6,
                            maxWidth: 560,
                        }}
                    >
                        GİB uyumlu <strong style={{ color: theme.text }}>e-Fatura, e-Arşiv, e-İrsaliye</strong>{' '}
                        ve 12 tür daha. Şablonu seç, logo-kaşe-bankasını ekle, XML önizle.
                        XSLT bilgisi olmadan dakikalar içinde profesyonel tasarım.
                    </p>

                    <div
                        className="ld-hero-ctas"
                        style={{
                            display: 'flex',
                            gap: 12,
                            flexWrap: 'wrap',
                            marginBottom: 20,
                        }}
                    >
                        <button
                            type="button"
                            onClick={onRegister}
                            style={{
                                padding: '15px 30px',
                                background: theme.gradient,
                                color: '#fff',
                                border: 'none',
                                borderRadius: 14,
                                fontSize: 16,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                boxShadow: '0 14px 34px rgba(109, 40, 217, 0.35)',
                                fontFamily: 'inherit',
                            }}
                        >
                            Hesap aç <ArrowRight size={17} />
                        </button>
                        <button
                            type="button"
                            onClick={() => document.getElementById('fiyatlar')?.scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                padding: '15px 28px',
                                background: '#fff',
                                color: theme.text,
                                border: `1px solid ${theme.borderStrong}`,
                                borderRadius: 14,
                                fontSize: 16,
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: theme.shadowSm,
                                fontFamily: 'inherit',
                            }}
                        >
                            Fiyatları gör
                        </button>
                    </div>

                    <div style={{ fontSize: 14 }}>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onLogin(); }}
                            style={{ color: theme.primary, textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 600 }}
                        >
                            Zaten üyeyim
                        </a>
                    </div>
                </div>
                <HeroPreview
                    docTypeId={activeDoc.id}
                    docLabel={activeDoc.label}
                    accent={activeDoc.a}
                    round={round}
                    nextDocTypeId={nextDoc.id}
                    onClick={onRegister}
                    onHoverChange={setPreviewHover}
                />
                </div>
            </section>

            {/* ====================== TRUST BAR ====================== */}
            <section className="ld-section" style={{ position: 'relative', zIndex: 1, padding: '24px 32px 48px' }}>
                <div
                    style={{
                        maxWidth: 1080,
                        margin: '0 auto',
                        padding: '22px 28px',
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: `1px solid ${theme.border}`,
                        borderRadius: 20,
                        boxShadow: theme.shadow,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 24,
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: theme.gradient }} />
                    {[
                        { v: 'GİB', l: 'UBL-TR Resmi Uyumlu', a: '#059669' },
                        { v: String(DOC_TYPES.length), l: 'Belge Türü Desteği', a: theme.blue },
                        { v: '3', l: 'Paket Seçeneği', a: '#db2777' },
                        { v: '%100', l: 'Web Tabanlı', a: theme.primary },
                    ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 30, fontWeight: 800, color: s.a, marginBottom: 2, letterSpacing: '-0.02em' }}>
                                {s.v}
                            </div>
                            <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>{s.l}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ====================== BENTO GRID: SHOWCASE + FEATURES ====================== */}
            <section
                id="urun"
                className="ld-section"
                style={{ position: 'relative', zIndex: 1, padding: '56px 32px', maxWidth: 1280, margin: '0 auto' }}
            >
                <SectionTitle eyebrow="Ürün" title="Tek tasarımcı, on beş e-belge" subtitle="GİB UBL 2.1 uyumlu, hepsi tek editörde" />

                <div className="ld-bento">
                    <div
                        className="ld-bento-hero"
                        style={{
                            padding: 28,
                            background: theme.gradient,
                            color: '#fff',
                            borderRadius: 24,
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: 420,
                            boxShadow: '0 20px 50px rgba(37, 99, 235, 0.28)',
                        }}
                    >
                        <div
                            aria-hidden
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage:
                                    'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                                backgroundSize: '28px 28px',
                                maskImage: 'linear-gradient(180deg, #000 0%, transparent 90%)',
                                WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 90%)',
                                pointerEvents: 'none',
                            }}
                        />
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
                                SHOWCASE
                            </div>
                            <h3 style={{ fontSize: 26, fontWeight: 800, margin: '8px 0 12px', color: '#fff', letterSpacing: '-0.02em' }}>
                                e-Arşiv Fatura Tasarımı
                            </h3>
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: '0 0 22px', lineHeight: 1.55, maxWidth: 340 }}>
                                Gerçek bir GİB faturasının tasarım ekranı. Logo, kaşe, banka, ürün tablosu, toplam alanı — hepsi sürükle-bırak ile düzenlenir.
                            </p>
                            <button
                                type="button"
                                onClick={onRegister}
                                style={{
                                    padding: '11px 20px',
                                    background: '#fff',
                                    color: theme.primary,
                                    border: 'none',
                                    borderRadius: 999,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    boxShadow: '0 8px 20px rgba(15,23,42,0.18)',
                                    fontFamily: 'inherit',
                                }}
                            >
                                Denemek için tıkla <ArrowRight size={14} />
                            </button>
                        </div>
                        {/* Dekoratif fatura önizleme */}
                        <div
                            aria-hidden
                            className="ld-float"
                            style={{
                                position: 'absolute',
                                right: -20,
                                bottom: -36,
                                width: 270,
                                height: 175,
                                background: '#fff',
                                borderRadius: 12,
                                padding: 16,
                                boxShadow: '0 24px 50px rgba(15,23,42,0.35)',
                                animation: 'edesign-float 6s ease-in-out infinite',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: theme.primary }}>e-Arşiv Fatura</div>
                                <img src={LOGO_URL} alt="" width={18} height={18} style={{ borderRadius: 5 }} />
                            </div>
                            <div style={{ height: 3, background: theme.gradient, borderRadius: 2, marginBottom: 8 }} />
                            <div style={{ fontSize: 8, color: '#475569', lineHeight: 1.5 }}>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>Örnek Kırtasiye Ltd. Şti.</div>
                                <div>VKN: 1234567890</div>
                                <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                    <div style={{ background: '#f1f5f9', padding: '3px 5px', borderRadius: 4 }}>A4 Fotokopi · 2 Koli · 900 ₺</div>
                                    <div style={{ background: '#f1f5f9', padding: '3px 5px', borderRadius: 4 }}>Toner · 1 Adet · 1.250 ₺</div>
                                </div>
                            </div>
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 30,
                                    right: 16,
                                    fontSize: 10,
                                    fontWeight: 800,
                                    color: '#fff',
                                    background: theme.gradient,
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                }}
                            >
                                Toplam: 5.280 ₺
                            </div>
                        </div>
                    </div>

                    {[
                        { icon: <Layers size={22} />, t: 'Sürükle & Bırak', d: 'XSLT öğrenmeden görsel tasarım', g: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
                        { icon: <Zap size={22} />, t: 'Anlık Önizleme', d: 'Kendi XML ile test et', g: 'linear-gradient(135deg, #10b981, #84cc16)' },
                        { icon: <FileText size={22} />, t: 'GİB Uyumlu', d: 'e-Fatura Paketi v29', g: 'linear-gradient(135deg, #f97316, #f59e0b)' },
                        { icon: <Globe size={22} />, t: `${DOC_TYPES.length} Belge Türü`, d: 'Fatura, irsaliye, makbuz, dekont, bilet...', g: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
                    ].map((f, i) => (
                        <div
                            key={i}
                            className="ld-card"
                            style={{
                                padding: 24,
                                background: '#fff',
                                border: `1px solid ${theme.border}`,
                                borderRadius: 20,
                                boxShadow: theme.shadowSm,
                            }}
                        >
                            <div
                                style={{
                                    display: 'inline-flex',
                                    padding: 11,
                                    background: f.g,
                                    color: '#fff',
                                    borderRadius: 12,
                                    marginBottom: 14,
                                    boxShadow: '0 8px 18px rgba(15,23,42,0.12)',
                                }}
                            >
                                {f.icon}
                            </div>
                            <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: theme.text }}>{f.t}</h4>
                            <p style={{ fontSize: 14, color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>{f.d}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ====================== DOC TYPES ====================== */}
            <section
                id="belgeler"
                className="ld-section"
                style={{ position: 'relative', zIndex: 1, padding: '40px 32px', maxWidth: 1280, margin: '0 auto' }}
            >
                <SectionTitle eyebrow="Belgeler" title="Hangi belgeleri tasarlayabilirsiniz?" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    {DOC_TYPES.map((dt) => (
                        <button
                            type="button"
                            key={dt.code}
                            onClick={onRegister}
                            className="ld-card"
                            style={{
                                padding: '14px 14px',
                                background: '#fff',
                                border: `1px solid ${theme.border}`,
                                borderRadius: 14,
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                fontFamily: 'inherit',
                                color: theme.text,
                                boxShadow: theme.shadowSm,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = dt.a; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; }}
                        >
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: '#fff',
                                    background: dt.a,
                                    borderRadius: 8,
                                    minWidth: 30,
                                    height: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {dt.code}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{dt.label}</div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ====================== PRICING ====================== */}
            <section
                id="fiyatlar"
                className="ld-section"
                style={{ position: 'relative', zIndex: 1, padding: '72px 32px', maxWidth: 1280, margin: '0 auto' }}
            >
                <SectionTitle
                    eyebrow="Fiyatlar"
                    title="Fiyatlandırma"
                    subtitle="Tek seferlik ödeme, abonelik yok. Üye olup giriş yaptıktan sonra satın alabilirsiniz."
                />

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap', gap: 24 }}>
                    {PACKAGES_PLANS.map(plan => (
                        <div
                            key={plan.id}
                            data-pricing-plan={plan.id}
                            className="ld-card"
                            style={{
                                flex: '1 1 300px',
                                maxWidth: 380,
                                display: 'flex',
                                flexDirection: 'column',
                                background: plan.highlight
                                    ? `linear-gradient(#fff, #fff) padding-box, ${theme.gradient} border-box`
                                    : '#fff',
                                border: plan.highlight ? '2px solid transparent' : `1px solid ${theme.border}`,
                                borderRadius: 24,
                                padding: '32px 28px',
                                position: 'relative',
                                boxShadow: plan.highlight ? '0 20px 50px rgba(109, 40, 217, 0.18)' : theme.shadowSm,
                            }}
                        >
                            {plan.highlight && (
                                <div style={{
                                    position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                                    padding: '5px 14px', borderRadius: 999, background: theme.gradient,
                                    color: '#fff', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: 0.4,
                                    boxShadow: theme.shadowBrand,
                                }}>
                                    En avantajlı
                                </div>
                            )}
                            <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: theme.text }}>{plan.name}</h3>
                            <p style={{ color: theme.textSubtle, fontSize: 13, margin: '0 0 20px' }}>
                                Tasarım başına ₺{Math.round(plan.price / plan.credits).toLocaleString('tr-TR')}
                            </p>

                            <div style={{ marginBottom: 20 }}>
                                <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.02em', ...gradientTextStyle }}>
                                    ₺{plan.price.toLocaleString('tr-TR')}
                                </span>
                                <span style={{ color: theme.textSubtle, fontSize: 14, marginLeft: 6 }}>tek seferlik</span>
                            </div>

                            <div style={{ paddingTop: 4, borderTop: `1px solid ${theme.border}`, marginBottom: 20, flex: 1 }}>
                                <div style={{ color: theme.primary, fontSize: 13, fontWeight: 700, margin: '14px 0' }}>
                                    {plan.credits} tasarım hakkı
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {plan.features.map((feat, i) => (
                                        <li key={i} style={{ color: theme.textMuted, fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                            <span
                                                style={{
                                                    flexShrink: 0,
                                                    marginTop: 1,
                                                    width: 18,
                                                    height: 18,
                                                    borderRadius: 999,
                                                    background: theme.greenSoft,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Check size={12} color={theme.greenText} strokeWidth={3} />
                                            </span>
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => handleBuyPlan(plan)}
                                data-buy-plan={plan.id}
                                style={{
                                    width: '100%',
                                    height: 48,
                                    background: plan.highlight ? theme.gradient : theme.primarySoft,
                                    color: plan.highlight ? '#fff' : theme.primary,
                                    border: 'none',
                                    borderRadius: 12,
                                    fontWeight: 800,
                                    fontSize: 15,
                                    cursor: 'pointer',
                                    marginTop: 12,
                                    boxShadow: plan.highlight ? theme.shadowBrand : 'none',
                                    fontFamily: 'inherit',
                                }}
                            >
                                Satın Al
                            </button>
                            <p style={{ textAlign: 'center', color: theme.textSubtle, fontSize: 12, margin: '10px 0 0' }}>
                                Satın almak için üye girişi gerekir.
                            </p>
                        </div>
                    ))}
                </div>

                <p style={{ textAlign: 'center', color: theme.textSubtle, fontSize: 13, marginTop: 32 }}>
                    Fiyata KDV dahildir.
                </p>
            </section>

            {/* ====================== SSS ====================== */}
            <section
                id="sss"
                className="ld-section"
                style={{ position: 'relative', zIndex: 1, padding: '56px 32px', maxWidth: 880, margin: '0 auto' }}
            >
                <SectionTitle eyebrow="SSS" title="Sıkça Sorulan Sorular" subtitle="Aklınıza takılanlar — ihtiyacınıza uygun cevaplar burada." />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {SSS_ITEMS.map((item) => {
                        const open = openSss === item.q;
                        return (
                            <div
                                key={item.q}
                                style={{
                                    background: '#fff',
                                    border: `1px solid ${open ? 'rgba(124, 58, 237, 0.45)' : theme.border}`,
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                    boxShadow: open ? '0 10px 30px rgba(109, 40, 217, 0.10)' : theme.shadowSm,
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenSss(open ? null : item.q)}
                                    aria-expanded={open}
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        padding: '18px 24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 16,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        color: theme.text,
                                        textAlign: 'left',
                                    }}
                                >
                                    <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4 }}>{item.q}</span>
                                    <span
                                        style={{
                                            flexShrink: 0,
                                            width: 28,
                                            height: 28,
                                            borderRadius: 999,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: open ? theme.primarySoft : theme.surfaceAlt,
                                            color: open ? theme.primary : theme.textSubtle,
                                            transition: 'background 0.2s, color 0.2s',
                                        }}
                                    >
                                        <ChevronDown
                                            size={16}
                                            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}
                                        />
                                    </span>
                                </button>
                                <div
                                    style={{
                                        maxHeight: open ? 320 : 0,
                                        opacity: open ? 1 : 0,
                                        overflow: 'hidden',
                                        transition: 'max-height 0.3s ease, opacity 0.25s ease',
                                    }}
                                >
                                    <p style={{ margin: 0, padding: '0 24px 20px', color: theme.textMuted, fontSize: 15, lineHeight: 1.65 }}>
                                        {item.a}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ====================== FINAL CTA ====================== */}
            <section id="son-adim" className="ld-section" style={{ position: 'relative', zIndex: 1, padding: '32px 32px 56px' }}>
                <div
                    style={{
                        maxWidth: 1080,
                        margin: '0 auto',
                        padding: '60px 40px',
                        background: theme.gradient,
                        borderRadius: 28,
                        color: '#fff',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 30px 70px rgba(37, 99, 235, 0.30)',
                    }}
                >
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                            maskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 75%)',
                            WebkitMaskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 75%)',
                            pointerEvents: 'none',
                        }}
                    />
                    <div style={{ position: 'relative' }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                padding: '5px 12px',
                                borderRadius: 999,
                                background: 'rgba(255,255,255,0.18)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                marginBottom: 16,
                            }}
                        >
                            <ShieldCheck size={13} style={{ animation: 'edesign-pulse 2.4s ease-in-out infinite' }} /> GİB UBL-TR uyumlu
                        </div>
                        <h2 style={{ fontSize: 'clamp(28px, 3.8vw, 44px)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.025em', lineHeight: 1.12 }}>
                            İlk tasarımınızı bugün oluşturun
                        </h2>
                        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.92)', margin: '0 0 30px', lineHeight: 1.5 }}>
                            Üye olun, 600 TL'den başlayan paketlerle tasarıma başlayın.
                        </p>
                        <button
                            type="button"
                            onClick={onRegister}
                            style={{
                                padding: '15px 34px',
                                background: '#fff',
                                color: theme.primary,
                                border: 'none',
                                borderRadius: 14,
                                fontSize: 16,
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                boxShadow: '0 12px 30px rgba(15,23,42,0.25)',
                                fontFamily: 'inherit',
                            }}
                        >
                            Hesap aç <ArrowRight size={17} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ====================== FOOTER ====================== */}
            <footer
                className="ld-footer"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '28px 32px 88px',
                    background: 'rgba(255,255,255,0.8)',
                    borderTop: `1px solid ${theme.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    fontSize: 13,
                    color: theme.textSubtle,
                }}
            >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <img src={LOGO_URL} alt="" width={22} height={22} style={{ borderRadius: 6 }} />
                    © 2026 · eBelge Tasarımcı · GİB UBL-TR
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <a href="#sss">SSS</a>
                    <a href="#kvkk" onClick={(e) => { e.preventDefault(); setLegalModal('kvkk'); }}>KVKK</a>
                    <a href="#sozlesme" onClick={(e) => { e.preventDefault(); setLegalModal('sozlesme'); }}>Kullanıcı Sözleşmesi</a>
                    <a href="#cerez" onClick={(e) => { e.preventDefault(); setLegalModal('cerez'); }}>Çerez Politikası</a>
                    <a href="https://wa.me/905336660125" target="_blank" rel="noopener noreferrer">İletişim</a>
                </div>
            </footer>

            {/* ====================== WHATSAPP DESTEK ====================== */}
            <a
                href="https://wa.me/905336660125"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp ile iletişime geç"
                style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: 999,
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    boxShadow: '0 10px 28px rgba(18, 140, 126, 0.35)',
                    zIndex: 30,
                    fontFamily: 'inherit',
                    transition: 'transform 0.18s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 14px 36px rgba(18, 140, 126, 0.45)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 28px rgba(18, 140, 126, 0.35)';
                }}
            >
                <MessageCircle size={15} />
                WhatsApp · 0533 666 01 25
            </a>

            {legalModal === 'kvkk' && <KVKKModal onClose={() => setLegalModal(null)} />}
            {legalModal === 'sozlesme' && <KullaniciSozlesmesiModal onClose={() => setLegalModal(null)} />}
            {legalModal === 'cerez' && <CerezPolitikasiModal onClose={() => setLegalModal(null)} />}
        </div>
    );
};

export default Landing;
