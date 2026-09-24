import React, { useState } from 'react';
import {
    FileText, Layers, Zap, Shield, Sparkles, ArrowRight, Globe,
    MousePointer,
} from 'lucide-react';

interface LandingProps {
    onRegister: () => void;
    onLogin: () => void;
}

interface DocTypeCard {
    id: string;
    label: string;
    icon: string;
    desc: string;
    accent: string;
}

interface FeatureCard {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

interface Stat {
    value: string;
    label: string;
    accent: string;
}

const DOC_TYPES: DocTypeCard[] = [
    { id: 'invoice',     label: 'e-Fatura',        icon: '📄', desc: 'UBL 2.1 ticari/alıcı tanımsız',     accent: '#6366f1' },
    { id: 'archive',     label: 'e-Arşiv',         icon: '🗂️', desc: 'e-Fatura mükellefi olmayan alıcılar', accent: '#8b5cf6' },
    { id: 'waybill',     label: 'e-İrsaliye',      icon: '🚚', desc: 'Sevkiyat ve mal hareketi',          accent: '#06b6d4' },
    { id: 'export',      label: 'e-İhracat',       icon: '🌍', desc: 'Gümrüklü uluslararası ticaret',     accent: '#10b981' },
    { id: 'microExport', label: 'e-Mikro İhracat', icon: '📦', desc: '≤500 kg basitleştirilmiş süreç',    accent: '#22d3ee' },
    { id: 'smm',         label: 'e-SMM',           icon: '💼', desc: 'Serbest meslek makbuzu',            accent: '#ec4899' },
    { id: 'mustahsil',   label: 'e-Müstahsil',     icon: '🌾', desc: 'Çiftçi/hayvancıdan alım makbuzu',   accent: '#84cc16' },
    { id: 'bilet',       label: 'e-Bilet',         icon: '🎫', desc: 'Hava/kara yolu ulaşım biletleri',   accent: '#f97316' },
    { id: 'receipt',     label: 'e-Makbuz',        icon: '🧾', desc: 'Diğer tahsilat makbuzları',         accent: '#14b8a6' },
];

const FEATURES: FeatureCard[] = [
    {
        icon: <MousePointer size={22} />,
        title: 'Sürükle & Bırak',
        desc: 'Karmaşık XSLT bilmenize gerek yok. Elementleri sürükleyin, önizlemeyi anlık görün.',
    },
    {
        icon: <Zap size={22} />,
        title: 'Gerçek Zamanlı Önizleme',
        desc: 'UBL 2.1 örnek verisi ile tasarımınızı canlı test edin. Müşteriye bitmeden gösterin.',
    },
    {
        icon: <FileText size={22} />,
        title: 'GİB UBL-TR Uyumlu',
        desc: 'GİB resmi XSLT şablonları (e-Fatura Paketi v29) ile birebir uyumlu çıktı.',
    },
    {
        icon: <Shield size={22} />,
        title: 'Güvenli Üyelik',
        desc: 'bcrypt + JWT ile şifrelenmiş hesaplar. Ücretsiz deneme ile başlayın.',
    },
    {
        icon: <Globe size={22} />,
        title: 'Çoklu Belge Tipi',
        desc: 'e-Fatura, e-Arşiv, e-İrsaliye, e-İhracat ve daha fazlası tek tasarımcıda.',
    },
    {
        icon: <Sparkles size={22} />,
        title: 'Şablon Galerisi',
        desc: 'Hazır tasarımlardan ilham alın, kendi şablonunuzu oluşturun.',
    },
];

const STATS: Stat[] = [
    { value: '9',   label: 'Desteklenen Belge Türü', accent: '#6366f1' },
    { value: 'GİB', label: 'UBL-TR Resmi Uyumluluk', accent: '#10b981' },
    { value: '5',   label: 'Ücretsiz Tasarım Hakkı', accent: '#ec4899' },
    { value: '∞',   label: '%100 Web Tabanlı',       accent: '#06b6d4' },
];

/**
 * Landing page — shown on first visit (no auth token in sessionStorage).
 * Glassmorphic dark theme:
 *  - Background: deep navy + 5 radial glow blobs (indigo/violet/cyan/emerald/pink)
 *  - Hero: glass badge + gradient headline + dual CTA + trust line
 *  - 9 Doc Type cards in responsive grid (color-coded accents)
 *  - Stats row (4 metrics)
 *  - 6 Feature cards (icon + title + desc)
 *  - Final CTA panel with gradient border glow
 */
export const Landing: React.FC<LandingProps> = ({ onRegister, onLogin }) => {
    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#060914',
                color: '#f8fafc',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Glow blobs — absolute, blurred radial gradients */}
            <Blob top="-15%"  left="8%"   size={520} color="rgba(99,102,241,0.45)" />
            <Blob top="-8%"   right="5%"  size={480} color="rgba(139,92,246,0.35)" />
            <Blob top="38%"   left="-6%"  size={420} color="rgba(6,182,212,0.25)" />
            <Blob top="62%"   right="-12%" size={460} color="rgba(236,72,153,0.18)" />
            <Blob top="82%"   left="22%"  size={380} color="rgba(16,185,129,0.15)" />

            {/* ====================== HERO (SPLIT-SCREEN) ====================== */}
            <section style={{ position: 'relative', zIndex: 1, padding: '64px 24px 48px' }}>
                <div
                    style={{
                        maxWidth: 1600,
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                        gap: 72,
                        alignItems: 'center',
                    }}
                >
                    {/* Badge */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 16px',
                            background: 'rgba(99,102,241,0.12)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '1px solid rgba(99,102,241,0.35)',
                            borderRadius: 999,
                            fontSize: 13,
                            color: '#c7d2fe',
                            fontWeight: 500,
                            marginBottom: 28,
                        }}
                    >
                        ✨ Yeni: e-SMM, e-Müstahsil, e-Bilet desteği eklendi
                    </div>

                    {/* Headline */}
                    <h1
                        style={{
                            fontSize: 'clamp(32px, 4.2vw, 52px)',
                            fontWeight: 800,
                            margin: '0 0 24px',
                            lineHeight: 1.05,
                            letterSpacing: '-0.02em',
                            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #c4b5fd 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        e-Belge Tasarım
                        <br />
                        Artık Çok Kolay
                    </h1>

                    {/* Subtitle */}
                    <p
                        style={{
                            fontSize: 'clamp(16px, 2vw, 19px)',
                            color: '#cbd5e1',
                            maxWidth: 680,
                            margin: '0 0 28px',
                            lineHeight: 1.6,
                        }}
                    >
                        GİB uyumlu{' '}
                        <strong style={{ color: '#f1f5f9' }}>e-Fatura, e-Arşiv, e-İrsaliye</strong>{' '}
                        ve daha fazlasını görsel tasarımcıyla dakikalar içinde oluşturun.{' '}
                        <u style={{ textDecorationStyle: 'dotted', textUnderlineOffset: 4 }}>
                            XSLT bilgisi gerekmez.
                        </u>
                    </p>

                    {/* CTAs */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 14,
                            justifyContent: 'flex-start',
                            flexWrap: 'wrap',
                            marginBottom: 28,
                        }}
                    >
                        <button
                            type="button"
                            onClick={onRegister}
                            style={{
                                padding: '16px 32px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 12,
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 10,
                                boxShadow:
                                    '0 8px 32px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow =
                                    '0 12px 40px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow =
                                    '0 8px 32px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)';
                            }}
                        >
                            Ücretsiz Üye Ol <ArrowRight size={18} />
                        </button>

                        <button
                            type="button"
                            onClick={onLogin}
                            style={{
                                padding: '16px 28px',
                                background: 'rgba(255,255,255,0.04)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                color: '#e2e8f0',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: 12,
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background 0.2s, border-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                            }}
                        >
                            Zaten üyeyim, giriş yap
                        </button>
                    </div>
                </div>

                {/* SAĞ KOLON — 9 mini belge kartı grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 12,
                    }}
                >
                    {DOC_TYPES.map((dt) => (
                        <MiniDocCard key={dt.id} card={dt} onRegister={onRegister} />
                    ))}
                </div>
            </section>

            {/* ====================== STATS ====================== */}
            <section style={{ position: 'relative', zIndex: 1, padding: '48px 24px 64px' }}>
                <div
                    style={{
                        maxWidth: 1080,
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 16,
                    }}
                >
                    {STATS.map((s, i) => (
                        <div
                            key={i}
                            style={{
                                padding: '24px 20px',
                                background: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 14,
                                textAlign: 'center',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 32,
                                    fontWeight: 800,
                                    color: s.accent,
                                    marginBottom: 4,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {s.value}
                            </div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: '#94a3b8',
                                    fontWeight: 500,
                                }}
                            >
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ====================== FEATURES GRID ====================== */}
            <section
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '80px 24px',
                    background:
                        'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
                }}
            >
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <div
                            style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#a5b4fc',
                                letterSpacing: 1.2,
                                marginBottom: 16,
                            }}
                        >
                            ÖZELLİKLER
                        </div>
                        <h2
                            style={{
                                fontSize: 'clamp(28px, 4vw, 40px)',
                                fontWeight: 700,
                                margin: '0 0 12px',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Neden EDesign?
                        </h2>
                        <p
                            style={{
                                fontSize: 16,
                                color: '#94a3b8',
                                maxWidth: 600,
                                margin: '0 auto',
                            }}
                        >
                            Tasarımcıdan muhasebeciye kadar herkes için. GİB uyumlu, hızlı, web tabanlı.
                        </p>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 20,
                        }}
                    >
                        {FEATURES.map((f, i) => (
                            <FeatureCard key={i} feature={f} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ====================== FINAL CTA ====================== */}
            <section style={{ position: 'relative', zIndex: 1, padding: '40px 24px 80px' }}>
                <div
                    style={{
                        maxWidth: 920,
                        margin: '0 auto',
                        padding: '64px 40px',
                        background:
                            'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 50%, rgba(236,72,153,0.08) 100%)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 24,
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <h2
                        style={{
                            fontSize: 'clamp(24px, 3.5vw, 36px)',
                            fontWeight: 700,
                            margin: '0 0 16px',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Hemen Başla,{' '}
                        <span
                            style={{
                                background:
                                    'linear-gradient(135deg, #a5b4fc 0%, #f0abfc 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            5 Ücretsiz
                        </span>{' '}
                        Tasarım Hakkı Seni Bekliyor
                    </h2>
                    <p
                        style={{
                            fontSize: 16,
                            color: '#cbd5e1',
                            margin: '0 auto 36px',
                            maxWidth: 560,
                            lineHeight: 1.6,
                        }}
                    >
                        Kredi kartı istemiyoruz. Üye ol, ilk tasarımını oluştur, beğenirsen kredi
                        paketi satın al.
                    </p>
                    <button
                        type="button"
                        onClick={onRegister}
                        style={{
                            padding: '18px 36px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 17,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            boxShadow:
                                '0 12px 40px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = 'translateY(-2px)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        Ücretsiz Üye Ol <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* ====================== FOOTER ====================== */}
            <footer
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '40px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    color: '#64748b',
                    fontSize: 13,
                    textAlign: 'center',
                }}
            >
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <p style={{ margin: '0 0 8px', color: '#94a3b8', fontWeight: 500 }}>
                        EDesign — GİB UBL-TR uyumlu e-Belge görsel tasarımcısı
                    </p>
                    <p style={{ margin: 0 }}>
                        © 2026 EDesign · GitHub Pages + Railway · UBL 2.1 · Açık kaynak XSLT'ler
                    </p>
                </div>
            </footer>
        </div>
    );
};

// ====================== Sub-components ======================

interface BlobProps {
    top?: string;
    left?: string;
    right?: string;
    size?: number;
    color: string;
}

const Blob: React.FC<BlobProps> = ({ top, left, right, size = 400, color }) => (
    <div
        style={{
            position: 'absolute',
            top,
            left,
            right,
            width: size,
            height: size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            filter: 'blur(80px)',
            pointerEvents: 'none',
            zIndex: 0,
        }}
    />
);

interface MiniDocCardProps {
    card: DocTypeCard;
    onRegister: () => void;
}

/**
 * Compact doc-type card used inside the split-screen hero (right column).
 * Shows icon + label only — shorter than the standalone DocTypeCard.
 */
const MiniDocCard: React.FC<MiniDocCardProps> = ({ card, onRegister }) => {
    const [hover, setHover] = useState(false);
    return (
        <div
            onClick={onRegister}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRegister();
                }
            }}
            style={{
                padding: '16px 12px',
                background: hover
                    ? `linear-gradient(135deg, ${card.accent}22 0%, transparent 100%)`
                    : 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: `1px solid ${hover ? card.accent + '66' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: hover ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hover ? `0 8px 24px ${card.accent}30` : 'none',
                position: 'relative',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    fontSize: 26,
                    marginBottom: 6,
                    lineHeight: 1,
                    filter: hover ? `drop-shadow(0 4px 10px ${card.accent}aa)` : 'none',
                    transition: 'filter 0.2s',
                }}
            >
                {card.icon}
            </div>
            <div
                style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#f1f5f9',
                    letterSpacing: 0.2,
                }}
            >
                {card.label}
            </div>
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: card.accent,
                    opacity: hover ? 1 : 0.45,
                    boxShadow: hover ? `0 0 8px ${card.accent}` : 'none',
                    transition: 'all 0.2s',
                }}
            />
        </div>
    );
};

interface FeatureCardProps {
    feature: FeatureCard;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
    const [hover, setHover] = useState(false);
    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                padding: 28,
                background: hover ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: `1px solid ${hover ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 16,
                transition: 'all 0.25s',
                transform: hover ? 'translateY(-3px)' : 'translateY(0)',
            }}
        >
            <div
                style={{
                    display: 'inline-flex',
                    padding: 12,
                    background: hover ? 'rgba(99,102,241,0.22)' : 'rgba(99,102,241,0.1)',
                    color: '#a5b4fc',
                    borderRadius: 10,
                    marginBottom: 16,
                    transition: 'background 0.25s',
                }}
            >
                {feature.icon}
            </div>
            <h3
                style={{
                    fontSize: 17,
                    fontWeight: 600,
                    margin: '0 0 8px',
                    color: '#f1f5f9',
                }}
            >
                {feature.title}
            </h3>
            <p
                style={{
                    fontSize: 14,
                    color: '#94a3b8',
                    margin: 0,
                    lineHeight: 1.6,
                }}
            >
                {feature.desc}
            </p>
        </div>
    );
};

export default Landing;
