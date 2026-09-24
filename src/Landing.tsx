import React, { useState } from 'react';
import { ArrowRight, MessageCircle, Sparkles, Zap, FileText, Globe, Layers, ChevronDown } from 'lucide-react';

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
        q: 'e-Belge Tasarımcı ücretsiz mi?',
        a: 'Evet — yeni hesap açtığınızda beş ücretsiz tasarım hakkı otomatik tanımlanır. Kredi kartı bilgisi gerekmez. Haklar bittiğinde uygun bir paket seçerek tasarım üretmeye devam edebilirsiniz.',
    },
    {
        q: 'Hangi e-belge tiplerini tasarlayabilirim?',
        a: 'Toplam 12 modül: e-Fatura, e-Arşiv, e-İrsaliye, e-İhracat, e-Mikro İhracat, e-SMM, e-Müstahsil, e-Bilet, e-Makbuz, e-Sigorta Komisyon, e-Döviz (Alım/Satım) ve e-Kıymetli Maden (Alım/Satım). Her modül için GİB resmi XSLT veya topluluk versiyonu yüklenir.',
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
        a: 'Paket Al bölümünden bir plan seçip kredi yüklemesi yaparsınız. Her tasarım kaydı 1 kredi harcar. Satın alma sonrası krediler hesabınıza otomatik yansır; ihtiyaca göre yeni paketler ekleyebilirsiniz.',
    },
    {
        q: 'Verilerim Türkiye’de mi saklanıyor?',
        a: 'Evet. Tüm kullanıcı ve şablon verileri Türkiye’deki (Railway) PostgreSQL veritabanında, KVKK kapsamında saklanır. XSLT dosyaları statik olarak GitHub Pages üzerinden sunulur.',
    },
];

/**
 * Landing — "Dark Modern Bento" tarzı.
 * - Koyu gradient background (#020617 → #0a0f1f → #1e1b4b)
 * - Subtle blur orb background
 * - Glass card'lar (rgba(255,255,255,0.04) + light border)
 * - Logo kaldırıldı (sadece nav + CTA)
 * - Hero: bold gradient başlık (sky → indigo) + 2 CTA
 * - Sticky trust bar
 * - Bento grid + 9 belge strip + fiyatlandırma + SSS + final CTA
 * - Sabit WhatsApp butonu (wa.me/905336660125)
 */
export const Landing: React.FC<LandingProps> = ({ onRegister, onLogin }) => {
    const [openSss, setOpenSss] = useState<string | null>(null);
    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100%',
                background: 'linear-gradient(180deg, #020617 0%, #0a0f1f 50%, #1e1b4b 100%)',
                color: '#f8fafc',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                position: 'relative',
                overflowX: 'hidden',
            }}
        >
            {/* Subtle background orbs */}
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    top: '-180px',
                    left: '-120px',
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    top: '40%',
                    right: '-160px',
                    width: 500,
                    height: 500,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    bottom: '-200px',
                    left: '30%',
                    width: 700,
                    height: 700,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />

            {/* ====================== STICKY GLASS NAV ====================== */}
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    padding: '14px 32px',
                    background: 'rgba(2,6,23,0.65)',
                    backdropFilter: 'blur(16px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                    borderBottom: '1px solid rgba(248,250,252,0.08)',
                }}
            >
                <div
                    style={{
                        maxWidth: 1280,
                        margin: '0 auto',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 24,
                    }}
                >
                    <nav
                        style={{
                            display: 'flex',
                            gap: 28,
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#cbd5e1',
                        }}
                    >
                        <a href="#urun" style={{ color: 'inherit', textDecoration: 'none' }}>Ürün</a>
                        <a href="#belgeler" style={{ color: 'inherit', textDecoration: 'none' }}>Belgeler</a>
                        <a href="#fiyatlar" style={{ color: 'inherit', textDecoration: 'none' }}>Fiyatlar</a>
                        <a href="#sss" style={{ color: 'inherit', textDecoration: 'none' }}>SSS</a>
                    </nav>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
                                color: '#e2e8f0',
                            }}
                        >
                            Giriş
                        </button>
                        <button
                            type="button"
                            onClick={onRegister}
                            style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
                            }}
                        >
                            Ücretsiz başla <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </header>

            {/* ====================== HERO ====================== */}
            <section
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '72px 32px 48px',
                    maxWidth: 1280,
                    margin: '0 auto',
                }}
            >
                <div style={{ textAlign: 'center', maxWidth: 880, margin: '0 auto' }}>
                    {/* Trust pill */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 14px',
                            background: 'rgba(255,255,255,0.06)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '1px solid rgba(248,250,252,0.12)',
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#cbd5e1',
                            marginBottom: 24,
                        }}
                    >
                        <Sparkles size={14} color="#0ea5e9" />
                        Yeni: e-SMM, e-Müstahsil, e-Bilet desteği eklendi
                    </div>

                    {/* Headline */}
                    <h1
                        style={{
                            fontSize: 'clamp(40px, 5.5vw, 76px)',
                            fontWeight: 800,
                            lineHeight: 1.05,
                            letterSpacing: '-0.03em',
                            margin: '0 0 20px',
                            color: '#f8fafc',
                        }}
                    >
                        e-Fatura tasarımı{' '}
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            artık çok kolay
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p
                        style={{
                            fontSize: 19,
                            color: '#94a3b8',
                            margin: '0 auto 32px',
                            lineHeight: 1.55,
                            maxWidth: 640,
                        }}
                    >
                        GİB uyumlu <strong style={{ color: '#f1f5f9' }}>e-Fatura, e-Arşiv, e-İrsaliye</strong>{' '}
                        ve 6 tür daha. Şablonu seç, logo-kaşe-bankasını ekle, XML önizle.
                        XSLT bilgisi olmadan dakikalar içinde profesyonel tasarım.
                    </p>

                    {/* CTAs */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 12,
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            marginBottom: 20,
                        }}
                    >
                        <button
                            type="button"
                            onClick={onRegister}
                            style={{
                                padding: '14px 28px',
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 12,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                boxShadow: '0 8px 28px rgba(99,102,241,0.45)',
                            }}
                        >
                            Ücretsiz hesap aç <ArrowRight size={16} />
                        </button>
                        <button
                            type="button"
                            style={{
                                padding: '14px 26px',
                                background: 'rgba(255,255,255,0.06)',
                                color: '#f8fafc',
                                border: '1px solid rgba(248,250,252,0.16)',
                                borderRadius: 12,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: 'pointer',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                            }}
                        >
                            Fiyatları gör
                        </button>
                    </div>

                    <div style={{ fontSize: 14, color: '#94a3b8' }}>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onLogin(); }}
                            style={{ color: '#38bdf8', textDecoration: 'underline', fontWeight: 500 }}
                        >
                            Zaten üyeyim
                        </a>
                    </div>
                </div>
            </section>

            {/* ====================== TRUST BAR ====================== */}
            <section
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '32px 32px 48px',
                }}
            >
                <div
                    style={{
                        maxWidth: 1080,
                        margin: '0 auto',
                        padding: '20px 28px',
                        background: 'rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(16px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                        border: '1px solid rgba(248,250,252,0.08)',
                        borderRadius: 18,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 24,
                        alignItems: 'center',
                    }}
                >
                    {[
                        { v: 'GİB', l: 'UBL-TR Resmi Uyumlu', a: '#10b981' },
                        { v: '9', l: 'Belge Türü Desteği', a: '#38bdf8' },
                        { v: '5', l: 'Ücretsiz Tasarım Hakkı', a: '#ec4899' },
                        { v: '%100', l: 'Web Tabanlı', a: '#a78bfa' },
                    ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 800,
                                    color: s.a,
                                    marginBottom: 2,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {s.v}
                            </div>
                            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{s.l}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ====================== BENTO GRID: SHOWCASE + FEATURES ====================== */}
            <section
                id="urun"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '48px 32px',
                    maxWidth: 1280,
                    margin: '0 auto',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h2
                        style={{
                            fontSize: 'clamp(28px, 3.5vw, 40px)',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            margin: '0 0 8px',
                            color: '#f8fafc',
                        }}
                    >
                        Tek tasarımcı, dokuz e-belge
                    </h2>
                    <p style={{ fontSize: 15, color: '#94a3b8', margin: 0 }}>
                        GİB UBL 2.1 uyumlu, hepsi tek editörde
                    </p>
                </div>

                {/* Bento: büyük showcase + 4 küçük özellik */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1.4fr 1fr 1fr',
                        gridTemplateRows: 'auto auto',
                        gap: 16,
                    }}
                >
                    {/* Büyük kart — Showcase */}
                    <div
                        style={{
                            gridRow: '1 / span 2',
                            padding: 24,
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                            color: '#fff',
                            borderRadius: 20,
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: 320,
                            border: '1px solid rgba(248,250,252,0.1)',
                        }}
                    >
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#a5b4fc', fontWeight: 600 }}>
                            SHOWCASE
                        </div>
                        <h3
                            style={{
                                fontSize: 24,
                                fontWeight: 700,
                                margin: '8px 0 12px',
                                color: '#fff',
                            }}
                        >
                            e-Arşiv Fatura Tasarımı
                        </h3>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 20px', lineHeight: 1.5 }}>
                            Gerçek bir GİB faturasının tasarım ekranı. Logo, kaşe, banka, ürün tablosu, toplam alanı — hepsi sürükle-bırak ile düzenlenir.
                        </p>
                        <button
                            type="button"
                            onClick={onRegister}
                            style={{
                                padding: '10px 18px',
                                background: '#fff',
                                color: '#312e81',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            Denemek için tıkla <ArrowRight size={13} />
                        </button>
                        {/* Dekoratif fatura önizleme */}
                        <div
                            aria-hidden
                            style={{
                                position: 'absolute',
                                right: -20,
                                bottom: -30,
                                width: 320,
                                height: 220,
                                background: '#fff',
                                borderRadius: 10,
                                padding: 14,
                                transform: 'rotate(4deg)',
                                opacity: 0.95,
                                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                            }}
                        >
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#1e3a8a', marginBottom: 4 }}>e-Arşiv Fatura</div>
                            <div style={{ fontSize: 7, color: '#475569', lineHeight: 1.4 }}>
                                <div>Örnek Kırtasiye Ltd. Şti.</div>
                                <div>VKN: 1234567890</div>
                                <div style={{ marginTop: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                    <div>A4 Fotokopi · 2 Koli · 900 ₺</div>
                                    <div>Toner · 1 Adet · 1.250 ₺</div>
                                </div>
                            </div>
                            <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 8, fontWeight: 700, color: '#0f172a' }}>
                                Toplam: 5.280 ₺
                            </div>
                        </div>
                    </div>

                    {/* 4 küçük feature kartı (dark glass) */}
                    {[
                        { icon: <Layers size={22} />, t: 'Sürükle & Bırak', d: 'XSLT öğrenmeden görsel tasarım', a: '#38bdf8' },
                        { icon: <Zap size={22} />, t: 'Anlık Önizleme', d: 'Kendi XML ile test et', a: '#10b981' },
                        { icon: <FileText size={22} />, t: 'GİB Uyumlu', d: 'e-Fatura Paketi v29', a: '#f97316' },
                        { icon: <Globe size={22} />, t: '9 Belge Türü', d: 'Fatura, irsaliye, makbuz...', a: '#ec4899' },
                    ].map((f, i) => (
                        <div
                            key={i}
                            style={{
                                padding: 22,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(248,250,252,0.08)',
                                borderRadius: 16,
                                transition: 'transform 0.2s, background 0.2s, border-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                                e.currentTarget.style.borderColor = f.a + '55';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.borderColor = 'rgba(248,250,252,0.08)';
                            }}
                        >
                            <div
                                style={{
                                    display: 'inline-flex',
                                    padding: 10,
                                    background: `${f.a}26`,
                                    color: f.a,
                                    borderRadius: 10,
                                    marginBottom: 12,
                                }}
                            >
                                {f.icon}
                            </div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#f8fafc' }}>
                                {f.t}
                            </h4>
                            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                                {f.d}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ====================== DOC TYPES STRIP ====================== */}
            <section
                id="belgeler"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '32px',
                    maxWidth: 1280,
                    margin: '0 auto',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <h3
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: '#f8fafc',
                            margin: '0 0 4px',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Hangi belgeleri tasarlayabilirsiniz?
                    </h3>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 10,
                    }}
                >
                    {[
                        { label: 'e-Fatura', code: '01', a: '#3b82f6' },
                        { label: 'e-Arşiv', code: '02', a: '#8b5cf6' },
                        { label: 'e-İrsaliye', code: '03', a: '#0ea5e9' },
                        { label: 'e-İhracat', code: '04', a: '#10b981' },
                        { label: 'e-Mikro İhracat', code: '05', a: '#22d3ee' },
                        { label: 'e-SMM', code: '06', a: '#ec4899' },
                        { label: 'e-Müstahsil', code: '07', a: '#84cc16' },
                        { label: 'e-Bilet', code: '08', a: '#f97316' },
                        { label: 'e-Makbuz', code: '09', a: '#14b8a6' },
                        { label: 'e-Sigorta Komisyon', code: '10', a: '#dc2626' },
                        { label: 'e-Döviz', code: '11', a: '#22c55e' },
                        { label: 'e-Kıymetli Maden', code: '12', a: '#f59e0b' },
                    ].map((dt) => (
                        <button
                            type="button"
                            key={dt.code}
                            onClick={onRegister}
                            style={{
                                padding: '14px 12px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(248,250,252,0.08)',
                                borderRadius: 12,
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                fontFamily: 'inherit',
                                transition: 'all 0.2s',
                                color: '#f8fafc',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = dt.a;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(248,250,252,0.08)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: dt.a,
                                    letterSpacing: 1,
                                    minWidth: 22,
                                }}
                            >
                                {dt.code}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>
                                {dt.label}
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ====================== PRICING ====================== */}
            <section
                id="fiyatlar"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '64px 32px 32px',
                    maxWidth: 1280,
                    margin: '0 auto',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h2
                        style={{
                            fontSize: 'clamp(28px, 3.5vw, 40px)',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            margin: '0 0 8px',
                            color: '#f8fafc',
                        }}
                    >
                        Fiyatlandırma
                    </h2>
                    <p style={{ fontSize: 15, color: '#94a3b8', margin: 0 }}>
                        İhtiyacınıza uygun paketi seçin.
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                        gap: 14,
                    }}
                >
                    {[
                        { name: 'Starter', count: 1, price: 400, perUnit: 400, popular: false, accent: '#64748b' },
                        { name: 'Basic', count: 10, price: 3000, perUnit: 300, popular: false, accent: '#0ea5e9' },
                        { name: 'Pro', count: 30, price: 5500, perUnit: 183, popular: true, accent: '#6366f1' },
                        { name: 'Business', count: 50, price: 4500, perUnit: 90, popular: false, accent: '#10b981' },
                        { name: 'Enterprise', count: 100, price: 6000, perUnit: 60, popular: false, accent: '#ec4899' },
                    ].map((p) => (
                        <div
                            key={p.name}
                            style={{
                                position: 'relative',
                                padding: 22,
                                background: p.popular
                                    ? 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(14,165,233,0.10) 100%)'
                                    : 'rgba(255,255,255,0.04)',
                                border: p.popular
                                    ? '2px solid #6366f1'
                                    : '1px solid rgba(248,250,252,0.08)',
                                borderRadius: 16,
                                transition: 'transform 0.2s, border-color 0.2s',
                                boxShadow: p.popular ? '0 16px 40px rgba(99,102,241,0.25)' : 'none',
                            }}
                        >
                            {p.popular && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: -10,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        padding: '3px 10px',
                                        background: 'linear-gradient(90deg, #6366f1, #0ea5e9)',
                                        color: '#fff',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        borderRadius: 999,
                                        letterSpacing: 1.5,
                                    }}
                                >
                                    EN POPÜLER
                                </div>
                            )}
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: p.accent,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1.5,
                                    marginBottom: 8,
                                }}
                            >
                                {p.name}
                            </div>
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 800,
                                    color: '#f8fafc',
                                    marginBottom: 2,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {p.price.toLocaleString('tr-TR')} <span style={{ fontSize: 16, color: '#94a3b8', fontWeight: 600 }}>TL</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
                                {p.count} tasarım hakkı · {p.perUnit} TL / tasarım
                            </div>
                            <button
                                type="button"
                                onClick={onRegister}
                                style={{
                                    width: '100%',
                                    padding: '9px 14px',
                                    background: p.popular
                                        ? 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)'
                                        : 'rgba(255,255,255,0.06)',
                                    color: '#fff',
                                    border: p.popular ? 'none' : '1px solid rgba(248,250,252,0.16)',
                                    borderRadius: 10,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                Seç
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ====================== SSS ====================== */}
            <section
                id="sss"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '64px 32px',
                    maxWidth: 880,
                    margin: '0 auto',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h2
                        style={{
                            fontSize: 'clamp(28px, 3.5vw, 40px)',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            margin: '0 0 8px',
                            color: '#f8fafc',
                        }}
                    >
                        Sıkça Sorulan Sorular
                    </h2>
                    <p style={{ fontSize: 15, color: '#94a3b8', margin: 0 }}>
                        Aklınıza takılanlar — ihtiyacınıza uygun cevaplar burada.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {SSS_ITEMS.map((item) => {
                        const open = openSss === item.q;
                        return (
                            <div
                                key={item.q}
                                style={{
                                    background: open
                                        ? 'rgba(99, 102, 241, 0.08)'
                                        : 'rgba(255, 255, 255, 0.03)',
                                    border: open
                                        ? '1px solid rgba(99, 102, 241, 0.4)'
                                        : '1px solid rgba(148, 163, 184, 0.14)',
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                    transition: 'background 0.2s, border-color 0.2s',
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
                                        color: '#f8fafc',
                                        textAlign: 'left',
                                    }}
                                >
                                    <span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>
                                        {item.q}
                                    </span>
                                    <ChevronDown
                                        size={18}
                                        style={{
                                            flexShrink: 0,
                                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.25s',
                                            color: open ? '#a5b4fc' : '#64748b',
                                        }}
                                    />
                                </button>
                                <div
                                    style={{
                                        maxHeight: open ? 320 : 0,
                                        opacity: open ? 1 : 0,
                                        overflow: 'hidden',
                                        transition: 'max-height 0.3s ease, opacity 0.25s ease',
                                    }}
                                >
                                    <p
                                        style={{
                                            margin: 0,
                                            padding: '0 24px 20px',
                                            color: '#94a3b8',
                                            fontSize: 14,
                                            lineHeight: 1.65,
                                        }}
                                    >
                                        {item.a}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ====================== FINAL CTA ====================== */}
            <section
                id="son-adim"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '32px 32px 48px',
                }}
            >
                <div
                    style={{
                        maxWidth: 1080,
                        margin: '0 auto',
                        padding: '56px 40px',
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                        borderRadius: 24,
                        color: '#fff',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 24px 60px rgba(99,102,241,0.4)',
                    }}
                >
                    <h2
                        style={{
                            fontSize: 'clamp(28px, 3.5vw, 40px)',
                            fontWeight: 800,
                            margin: '0 0 12px',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.15,
                        }}
                    >
                        İlk tasarımınızı bugün oluşturun
                    </h2>
                    <p
                        style={{
                            fontSize: 16,
                            color: 'rgba(255,255,255,0.95)',
                            margin: '0 0 28px',
                            lineHeight: 1.5,
                        }}
                    >
                        Beş ücretsiz tasarım hakkı.
                    </p>
                    <button
                        type="button"
                        onClick={onRegister}
                        style={{
                            padding: '14px 32px',
                            background: '#fff',
                            color: '#0ea5e9',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                        }}
                    >
                        Ücretsiz hesap aç <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            {/* ====================== FOOTER ====================== */}
            <footer
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '32px',
                    borderTop: '1px solid rgba(248,250,252,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    fontSize: 13,
                    color: '#64748b',
                }}
            >
                <div>© 2026 · GİB UBL-TR · GitHub Pages + Railway</div>
                <div style={{ display: 'flex', gap: 20 }}>
                    <a href="#sss" style={{ color: '#64748b', textDecoration: 'none' }}>SSS</a>
                    <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>KVKK</a>
                    <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>İletişim</a>
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
                    boxShadow: '0 10px 28px rgba(37, 211, 102, 0.45)',
                    zIndex: 30,
                    fontFamily: 'inherit',
                    transition: 'transform 0.18s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow =
                        '0 14px 36px rgba(37, 211, 102, 0.55)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                        '0 10px 28px rgba(37, 211, 102, 0.45)';
                }}
            >
                <MessageCircle size={15} />
                WhatsApp · 0533 666 01 25
            </a>
        </div>
    );
};

export default Landing;
