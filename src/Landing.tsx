import React from 'react';
import { ArrowRight, MessageCircle, Sparkles, Shield, Zap, FileText, Globe, Layers } from 'lucide-react';

interface LandingProps {
    onRegister: () => void;
    onLogin: () => void;
}

/**
 * Landing — "Modern Bento" tarzı.
 * - Sticky glass nav (backdrop-filter blur)
 * - Açık mavi gradient + subtle blur orb background
 * - Bold serif/sans typografi
 * - Bento grid: 1 büyük showcase kartı + 4 küçük feature kartı
 * - Sticky trust bar (GİB, XSLT, vb.)
 * - Sabit CANLI DESTEK (sadece position:fixed, scroll'u engellemez)
 */
export const Landing: React.FC<LandingProps> = ({ onRegister, onLogin }) => {
    return (
        // Outer container — scroll için overflow:visible (default), sadece min-height
        <div
            style={{
                minHeight: '100vh',
                width: '100%',
                background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 35%, #f0f9ff 100%)',
                color: '#0f172a',
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
                    background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
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
                    background: 'radial-gradient(circle, rgba(14,165,233,0.14) 0%, transparent 70%)',
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
                    background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)',
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
                    background: 'rgba(255,255,255,0.65)',
                    backdropFilter: 'blur(16px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                    borderBottom: '1px solid rgba(15,23,42,0.06)',
                }}
            >
                <div
                    style={{
                        maxWidth: 1280,
                        margin: '0 auto',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#f97316', fontWeight: 800, fontSize: 30 }}>E</span>
                        <span style={{ color: '#0ea5e9', fontWeight: 800, fontSize: 30 }}>Design</span>
                        <span
                            style={{
                                marginLeft: 8,
                                padding: '3px 8px',
                                background: 'linear-gradient(90deg, #3b82f6, #0ea5e9)',
                                color: '#fff',
                                borderRadius: 999,
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: 1.2,
                            }}
                        >
                            v2.0
                        </span>
                    </div>
                    <nav
                        style={{
                            display: 'flex',
                            gap: 28,
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#334155',
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
                                color: '#1e293b',
                            }}
                        >
                            Giriş
                        </button>
                        <button
                            type="button"
                            onClick={onRegister}
                            style={{
                                padding: '10px 20px',
                                background: '#0f172a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
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
                            background: 'rgba(255,255,255,0.7)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '1px solid rgba(15,23,42,0.08)',
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#475569',
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
                            color: '#0f172a',
                        }}
                    >
                        e-Fatura tasarımı{' '}
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
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
                            color: '#475569',
                            margin: '0 auto 32px',
                            lineHeight: 1.55,
                            maxWidth: 640,
                        }}
                    >
                        GİB uyumlu <strong style={{ color: '#0f172a' }}>e-Fatura, e-Arşiv, e-İrsaliye</strong>{' '}
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
                                background: '#0f172a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 12,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                boxShadow: '0 8px 24px rgba(15,23,42,0.3)',
                            }}
                        >
                            Ücretsiz hesap aç <ArrowRight size={16} />
                        </button>
                        <button
                            type="button"
                            style={{
                                padding: '14px 26px',
                                background: 'rgba(255,255,255,0.85)',
                                color: '#0f172a',
                                border: '1px solid rgba(15,23,42,0.12)',
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

                    <div style={{ fontSize: 14, color: '#64748b' }}>
                        Kredi kartı gerekmez ·{' '}
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onLogin(); }}
                            style={{ color: '#0ea5e9', textDecoration: 'underline', fontWeight: 500 }}
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
                        background: 'rgba(255,255,255,0.65)',
                        backdropFilter: 'blur(16px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                        border: '1px solid rgba(15,23,42,0.06)',
                        borderRadius: 18,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 24,
                        alignItems: 'center',
                    }}
                >
                    {[
                        { v: 'GİB', l: 'UBL-TR Resmi Uyumlu', a: '#10b981' },
                        { v: '9', l: 'Belge Türü Desteği', a: '#0ea5e9' },
                        { v: '5', l: 'Ücretsiz Tasarım Hakkı', a: '#ec4899' },
                        { v: '%100', l: 'Web Tabanlı', a: '#6366f1' },
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
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{s.l}</div>
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
                            color: '#0f172a',
                        }}
                    >
                        Tek tasarımcı, dokuz e-belge
                    </h2>
                    <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
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
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                            color: '#fff',
                            borderRadius: 20,
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: 320,
                        }}
                    >
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#93c5fd', fontWeight: 600 }}>
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
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: 1.5 }}>
                            Gerçek bir GİB faturasının tasarım ekranı. Logo, kaşe, banka, ürün tablosu, toplam alanı — hepsi sürükle-bırak ile düzenlenir.
                        </p>
                        <button
                            type="button"
                            onClick={onRegister}
                            style={{
                                padding: '10px 18px',
                                background: '#fff',
                                color: '#0f172a',
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
                                boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
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

                    {/* 4 küçük feature kartı */}
                    {[
                        { icon: <Layers size={22} />, t: 'Sürükle & Bırak', d: 'XSLT öğrenmeden görsel tasarım', a: '#3b82f6' },
                        { icon: <Zap size={22} />, t: 'Anlık Önizleme', d: 'Kendi XML ile test et', a: '#10b981' },
                        { icon: <FileText size={22} />, t: 'GİB Uyumlu', d: 'e-Fatura Paketi v29', a: '#f97316' },
                        { icon: <Globe size={22} />, t: '9 Belge Türü', d: 'Fatura, irsaliye, makbuz...', a: '#ec4899' },
                    ].map((f, i) => (
                        <div
                            key={i}
                            style={{
                                padding: 22,
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 16,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div
                                style={{
                                    display: 'inline-flex',
                                    padding: 10,
                                    background: `${f.a}14`,
                                    color: f.a,
                                    borderRadius: 10,
                                    marginBottom: 12,
                                }}
                            >
                                {f.icon}
                            </div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                                {f.t}
                            </h4>
                            <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
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
                            color: '#0f172a',
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
                    ].map((dt) => (
                        <button
                            type="button"
                            key={dt.code}
                            onClick={onRegister}
                            style={{
                                padding: '14px 12px',
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 12,
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                fontFamily: 'inherit',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = dt.a;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.transform = 'translateY(0)';
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
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                                {dt.label}
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ====================== FINAL CTA ====================== */}
            <section
                id="fiyatlar"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '48px 32px',
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
                        boxShadow: '0 24px 60px rgba(99,102,241,0.25)',
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
                            color: 'rgba(255,255,255,0.9)',
                            margin: '0 0 28px',
                            lineHeight: 1.5,
                        }}
                    >
                        Kredi kartı gerekmez. Beş ücretsiz tasarım hakkı.
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
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
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
                    borderTop: '1px solid rgba(15,23,42,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    fontSize: 13,
                    color: '#64748b',
                }}
            >
                <div>© 2026 EDesign · GİB UBL-TR · GitHub Pages + Railway</div>
                <div style={{ display: 'flex', gap: 20 }}>
                    <a href="#sss" style={{ color: '#64748b', textDecoration: 'none' }}>SSS</a>
                    <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>KVKK</a>
                    <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>İletişim</a>
                </div>
            </footer>

            {/* ====================== CANLI DESTEK ====================== */}
            <button
                type="button"
                style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    background: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    boxShadow: '0 8px 24px rgba(15,23,42,0.4)',
                    zIndex: 30,
                    fontFamily: 'inherit',
                }}
            >
                <MessageCircle size={14} />
                CANLI DESTEK
            </button>
        </div>
    );
};

export default Landing;
