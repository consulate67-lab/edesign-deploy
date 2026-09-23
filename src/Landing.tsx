import React from 'react';
import { FileText, Layers, Zap, Shield, Sparkles, ArrowRight, Globe } from 'lucide-react';

interface LandingProps {
    onRegister: () => void;
    onLogin: () => void;
}

/**
 * Landing page — shown on first visit (no auth token in sessionStorage).
 * Highlights the product, lists supported doc types, and offers
 * Üye Ol / Giriş Yap CTAs.
 */
export const Landing: React.FC<LandingProps> = ({ onRegister, onLogin }) => {
    const docTypes = [
        { id: 'invoice', label: 'e-Fatura', icon: '📄' },
        { id: 'archive', label: 'e-Arşiv', icon: '🗂️' },
        { id: 'waybill', label: 'e-İrsaliye', icon: '🚚' },
        { id: 'export', label: 'e-İhracat', icon: '🌍' },
        { id: 'microExport', label: 'e-Mikro İhracat', icon: '📦' },
        { id: 'smm', label: 'e-SMM', icon: '💼' },
        { id: 'mustahsil', label: 'e-Müstahsil Makbuzu', icon: '🌾' },
        { id: 'bilet', label: 'e-Bilet', icon: '🎫' },
        { id: 'receipt', label: 'e-Makbuz', icon: '🧾' },
    ];

    const features = [
        {
            icon: <Layers size={24} />,
            title: 'Sürükle & Bırak',
            desc: 'Karmaşık XSLT bilmenize gerek yok. Elementleri sürükleyin, önizlemeyi anlık görün.',
        },
        {
            icon: <Zap size={24} />,
            title: 'Gerçek Zamanlı Önizleme',
            desc: 'UBL 2.1 örnek verisi ile tasarımınızı canlı test edin. Tasarım bitmeden müşteriye gösterin.',
        },
        {
            icon: <FileText size={24} />,
            title: 'GİB UBL-TR Uyumlu',
            desc: 'GİB resmi XSLT şablonları (e-Fatura Paketi v29) ile birebir uyumlu çıktı.',
        },
        {
            icon: <Shield size={24} />,
            title: 'Güvenli Üyelik',
            desc: 'bcrypt + JWT ile şifrelenmiş hesaplar. Ücretsiz deneme ile başlayın.',
        },
        {
            icon: <Globe size={24} />,
            title: 'Çoklu Belge Tipi',
            desc: 'e-Fatura, e-Arşiv, e-İrsaliye, e-İhracat, e-Müstahsil, e-SMM, e-Bilet, e-Makbuz.',
        },
        {
            icon: <Sparkles size={24} />,
            title: 'Şablon Galerisi',
            desc: 'Hazır tasarımlardan ilham alın, kendi şablonunuzu oluşturun veya satın.',
        },
    ];

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#f1f5f9',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
        >
            {/* Hero */}
            <header
                style={{
                    padding: '80px 24px 60px',
                    textAlign: 'center',
                    maxWidth: 1200,
                    margin: '0 auto',
                }}
            >
                <div
                    style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        borderRadius: 999,
                        fontSize: 13,
                        color: '#a5b4fc',
                        marginBottom: 24,
                    }}
                >
                    ✨ Yeni: e-SMM, e-Müstahsil, e-Bilet desteği eklendi
                </div>

                <h1
                    style={{
                        fontSize: 'clamp(36px, 6vw, 64px)',
                        fontWeight: 800,
                        margin: '0 0 20px',
                        lineHeight: 1.1,
                        background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    e-Belge Tasarım Artık Çok Kolay
                </h1>

                <p
                    style={{
                        fontSize: 'clamp(16px, 2vw, 20px)',
                        color: '#94a3b8',
                        maxWidth: 720,
                        margin: '0 auto 40px',
                        lineHeight: 1.5,
                    }}
                >
                    GİB uyumlu e-Fatura, e-Arşiv, e-İrsaliye ve daha fazlasını görsel tasarımcıyla
                    dakikalar içinde oluşturun. XSLT bilgisi gerekmez.
                </p>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={onRegister}
                        style={{
                            padding: '14px 28px',
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                        }}
                    >
                        Ücretsiz Üye Ol <ArrowRight size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={onLogin}
                        style={{
                            padding: '14px 28px',
                            background: 'transparent',
                            color: '#e2e8f0',
                            border: '1px solid #475569',
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Zaten üyeyim, giriş yap
                    </button>
                </div>

                <p style={{ marginTop: 20, fontSize: 13, color: '#64748b' }}>
                    Kredi kartı gerekmez • 5 ücretsiz tasarım hakkı • Kredi paketi ile devam
                </p>
            </header>

            {/* Doc Types Strip */}
            <section
                style={{
                    padding: '32px 24px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderTop: '1px solid #1e293b',
                    borderBottom: '1px solid #1e293b',
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
                        margin: '0 auto',
                        display: 'flex',
                        gap: 24,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>
                        Desteklenen Belge Türleri:
                    </span>
                    {docTypes.map((dt) => (
                        <span
                            key={dt.id}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 12px',
                                background: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: 6,
                                fontSize: 13,
                                color: '#e2e8f0',
                            }}
                        >
                            <span style={{ fontSize: 16 }}>{dt.icon}</span>
                            {dt.label}
                        </span>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
                <h2
                    style={{
                        fontSize: 36,
                        fontWeight: 700,
                        textAlign: 'center',
                        margin: '0 0 16px',
                    }}
                >
                    Neden EDesign?
                </h2>
                <p
                    style={{
                        fontSize: 16,
                        color: '#94a3b8',
                        textAlign: 'center',
                        maxWidth: 600,
                        margin: '0 auto 48px',
                    }}
                >
                    Tasarımcıdan muhasebeciye kadar herkes için. GİB uyumlu, hızlı, web tabanlı.
                </p>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 24,
                    }}
                >
                    {features.map((f, i) => (
                        <div
                            key={i}
                            style={{
                                padding: 24,
                                background: 'rgba(30, 41, 59, 0.5)',
                                border: '1px solid #334155',
                                borderRadius: 12,
                                transition: 'transform 0.2s, border-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#6366f1';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#334155';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div
                                style={{
                                    display: 'inline-flex',
                                    padding: 10,
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    color: '#818cf8',
                                    borderRadius: 8,
                                    marginBottom: 12,
                                }}
                            >
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>
                                {f.title}
                            </h3>
                            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section
                style={{
                    padding: '80px 24px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.05))',
                    borderTop: '1px solid #1e293b',
                    textAlign: 'center',
                }}
            >
                <h2 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 16px' }}>
                    Hemen Başla, 5 Ücretsiz Tasarım Hakkı Seni Bekliyor
                </h2>
                <p style={{ fontSize: 16, color: '#94a3b8', margin: '0 0 32px', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
                    Kredi kartı istemiyoruz. Üye ol, ilk tasarımını oluştur, beğenirsen kredi paketi satın al.
                </p>
                <button
                    type="button"
                    onClick={onRegister}
                    style={{
                        padding: '16px 32px',
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 17,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                    }}
                >
                    Ücretsiz Üye Ol <ArrowRight size={18} />
                </button>
            </section>

            {/* Footer */}
            <footer
                style={{
                    padding: '40px 24px',
                    textAlign: 'center',
                    borderTop: '1px solid #1e293b',
                    color: '#64748b',
                    fontSize: 13,
                }}
            >
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <p style={{ margin: '0 0 8px' }}>
                        EDesign — GİB UBL-TR uyumlu e-Belge görsel tasarımcısı
                    </p>
                    <p style={{ margin: 0, color: '#475569' }}>
                        © 2026 EDesign · GitHub Pages + Railway · UBL 2.1 · Açık kaynak XSLT'ler
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
