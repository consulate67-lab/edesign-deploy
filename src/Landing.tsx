import React from 'react';
import { ArrowRight } from 'lucide-react';

interface LandingProps {
    onRegister: () => void;
    onLogin: () => void;
}

/**
 * Landing — "Editorial Showcase" tarzı.
 * - Tek kolon, full-bleed, açık tema (krem + serif başlık)
 * - Üstte masthead (logo + nav)
 * - Hero: büyük serif başlık + tagline + tek CTA
 * - Hero altında dev tasarımcı canvas mock-up'ı (gerçek DOM, PNG değil)
 * - 3 numbered feature (01/02/03 serif stili)
 * - Belge türleri strip (kompakt)
 * - Final CTA + footer
 */
export const Landing: React.FC<LandingProps> = ({ onRegister, onLogin }) => {
    return (
        <main
            style={{
                background: '#f6f3ec',
                color: '#1a1a1a',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                minHeight: '100vh',
            }}
        >
            {/* ====================== MASTHEAD ====================== */}
            <header
                style={{
                    borderBottom: '1px solid #1a1a1a',
                    padding: '20px 48px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f6f3ec',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontWeight: 700,
                        fontSize: 28,
                        letterSpacing: '-0.02em',
                    }}
                >
                    EDesign.
                </div>
                <nav
                    style={{
                        display: 'flex',
                        gap: 32,
                        alignItems: 'center',
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        fontWeight: 500,
                    }}
                >
                    <a href="#features" style={{ color: '#1a1a1a', textDecoration: 'none' }}>
                        Ürün
                    </a>
                    <a href="#doc-types" style={{ color: '#1a1a1a', textDecoration: 'none' }}>
                        Belge Türleri
                    </a>
                    <a href="#cta" style={{ color: '#1a1a1a', textDecoration: 'none' }}>
                        Fiyat
                    </a>
                    <button
                        type="button"
                        onClick={onLogin}
                        style={{
                            padding: '8px 18px',
                            background: 'transparent',
                            border: '1px solid #1a1a1a',
                            borderRadius: 0,
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            cursor: 'pointer',
                            color: '#1a1a1a',
                            fontFamily: 'inherit',
                        }}
                    >
                        Giriş Yap
                    </button>
                </nav>
            </header>

            {/* ====================== HERO ====================== */}
            <section
                style={{
                    padding: '96px 48px 64px',
                    textAlign: 'center',
                    maxWidth: 1100,
                    margin: '0 auto',
                }}
            >
                <div
                    style={{
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 3,
                        color: '#6b7280',
                        marginBottom: 28,
                        fontWeight: 500,
                    }}
                >
                    Sürüm 2.0 · Eylül 2026
                </div>
                <h1
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: 'clamp(48px, 7.5vw, 108px)',
                        fontWeight: 400,
                        lineHeight: 1.02,
                        letterSpacing: '-0.035em',
                        margin: '0 0 32px',
                        color: '#1a1a1a',
                    }}
                >
                    Türk e-Belge<br />
                    Tasarımının Yeni Çağı
                </h1>
                <p
                    style={{
                        fontSize: 19,
                        color: '#374151',
                        maxWidth: 620,
                        margin: '0 auto 48px',
                        lineHeight: 1.55,
                        fontWeight: 400,
                    }}
                >
                    GİB uyumlu <strong style={{ fontWeight: 600 }}>e-Fatura, e-Arşiv, e-İrsaliye</strong>{' '}
                    ve altı tür daha. XSLT bilgisi olmadan dakikalar içinde profesyonel tasarımlar.
                </p>
                <div style={{ display: 'inline-flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={onRegister}
                        style={{
                            padding: '16px 32px',
                            background: '#1a1a1a',
                            color: '#f6f3ec',
                            border: 'none',
                            borderRadius: 0,
                            fontSize: 14,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 2,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 12,
                            fontFamily: 'inherit',
                        }}
                    >
                        Ücretsiz Dene <ArrowRight size={16} />
                    </button>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>
                        Kredi kartı gerekmez · 5 ücretsiz tasarım
                    </span>
                </div>
            </section>

            {/* ====================== CANVAS MOCK-UP ====================== */}
            <section style={{ padding: '32px 48px 64px', maxWidth: 1280, margin: '0 auto' }}>
                <div
                    style={{
                        aspectRatio: '16 / 10',
                        background: '#ffffff',
                        border: '1px solid #1a1a1a',
                        borderRadius: 0,
                        boxShadow: '12px 12px 0 #1a1a1a',
                        overflow: 'hidden',
                        display: 'flex',
                    }}
                >
                    {/* Sol panel — bileşenler */}
                    <aside
                        style={{
                            width: 240,
                            background: '#efece5',
                            borderRight: '1px solid #1a1a1a',
                            padding: 20,
                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 10,
                                textTransform: 'uppercase',
                                letterSpacing: 2,
                                color: '#6b7280',
                                marginBottom: 16,
                                fontWeight: 600,
                            }}
                        >
                            Bileşenler
                        </div>
                        {[
                            'Logo',
                            'Şirket Adı',
                            'VKN / TCKN',
                            'Fatura No',
                            'Tarih',
                            'Müşteri Bilgileri',
                            'Ürün Tablosu',
                            'Toplam Alanı',
                            'Notlar',
                        ].map((item) => (
                            <div
                                key={item}
                                style={{
                                    padding: '8px 10px',
                                    marginBottom: 4,
                                    background: item === 'Logo' ? '#1a1a1a' : 'transparent',
                                    color: item === 'Logo' ? '#f6f3ec' : '#1a1a1a',
                                    fontSize: 13,
                                    fontWeight: item === 'Logo' ? 600 : 400,
                                    cursor: 'pointer',
                                    borderLeft: item === 'Logo' ? '3px solid #1a1a1a' : '3px solid transparent',
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </aside>

                    {/* Sağ canvas — e-Fatura önizleme */}
                    <div
                        style={{
                            flex: 1,
                            padding: 36,
                            overflow: 'auto',
                            background: '#ffffff',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: 32,
                                paddingBottom: 16,
                                borderBottom: '2px solid #1a1a1a',
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: 10,
                                        textTransform: 'uppercase',
                                        letterSpacing: 2,
                                        color: '#6b7280',
                                    }}
                                >
                                    e-Fatura
                                </div>
                                <div
                                    style={{
                                        fontFamily: 'Georgia, serif',
                                        fontSize: 32,
                                        fontWeight: 700,
                                        marginTop: 4,
                                    }}
                                >
                                    FATURA
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: 12, lineHeight: 1.6 }}>
                                <div>
                                    <strong>Fatura No:</strong> EFA-2026-001234
                                </div>
                                <div>
                                    <strong>Tarih:</strong> 24.09.2026
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 32,
                                marginBottom: 32,
                                fontSize: 13,
                                lineHeight: 1.55,
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: 10,
                                        textTransform: 'uppercase',
                                        letterSpacing: 2,
                                        color: '#6b7280',
                                        marginBottom: 6,
                                    }}
                                >
                                    Satıcı
                                </div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>ABC Teknoloji A.Ş.</div>
                                <div>VKN: 1234567890</div>
                                <div>Levent Mah. No:5 Beşiktaş / İstanbul</div>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 10,
                                        textTransform: 'uppercase',
                                        letterSpacing: 2,
                                        color: '#6b7280',
                                        marginBottom: 6,
                                    }}
                                >
                                    Alıcı
                                </div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>XYZ Yazılım Ltd.</div>
                                <div>VKN: 9876543210</div>
                                <div>Maslak Mah. No:12 Sarıyer / İstanbul</div>
                            </div>
                        </div>

                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: 13,
                                marginBottom: 24,
                            }}
                        >
                            <thead>
                                <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '10px 0',
                                            fontSize: 11,
                                            textTransform: 'uppercase',
                                            letterSpacing: 1.5,
                                        }}
                                    >
                                        Ürün / Hizmet
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '10px 0',
                                            fontSize: 11,
                                            textTransform: 'uppercase',
                                            letterSpacing: 1.5,
                                        }}
                                    >
                                        Miktar
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '10px 0',
                                            fontSize: 11,
                                            textTransform: 'uppercase',
                                            letterSpacing: 1.5,
                                        }}
                                    >
                                        Birim Fiyat
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '10px 0',
                                            fontSize: 11,
                                            textTransform: 'uppercase',
                                            letterSpacing: 1.5,
                                        }}
                                    >
                                        Tutar
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: 'Yazılım Lisansı (Yıllık)', qty: 1, price: '12.000,00 ₺' },
                                    { name: 'Kurulum Hizmeti', qty: 2, price: '3.500,00 ₺' },
                                    { name: 'Eğitim (Saat)', qty: 8, price: '750,00 ₺' },
                                ].map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #e5e5e0' }}>
                                        <td style={{ padding: '12px 0' }}>{row.name}</td>
                                        <td style={{ padding: '12px 0', textAlign: 'right' }}>{row.qty}</td>
                                        <td style={{ padding: '12px 0', textAlign: 'right' }}>{row.price}</td>
                                        <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600 }}>
                                            {(row.qty * parseFloat(row.price.replace(/\./g, '').replace(',', '.'))).toLocaleString('tr-TR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}{' '}
                                            ₺
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                paddingTop: 16,
                                borderTop: '2px solid #1a1a1a',
                            }}
                        >
                            <div style={{ fontSize: 13, lineHeight: 1.8, textAlign: 'right', minWidth: 220 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Ara Toplam:</span>
                                    <span>26.000,00 ₺</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>KDV (%20):</span>
                                    <span>5.200,00 ₺</span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontWeight: 700,
                                        fontSize: 16,
                                        paddingTop: 8,
                                        marginTop: 8,
                                        borderTop: '1px solid #1a1a1a',
                                    }}
                                >
                                    <span>Genel Toplam:</span>
                                    <span>31.200,00 ₺</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====================== DOC TYPES STRIP ====================== */}
            <section
                id="doc-types"
                style={{
                    padding: '64px 48px',
                    borderTop: '1px solid #1a1a1a',
                    borderBottom: '1px solid #1a1a1a',
                    background: '#efece5',
                }}
            >
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: 32,
                            flexWrap: 'wrap',
                            gap: 16,
                        }}
                    >
                        <h2
                            style={{
                                fontFamily: 'Georgia, serif',
                                fontSize: 32,
                                margin: 0,
                                fontWeight: 400,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Dokuz Belge Türü, Tek Tasarımcı
                        </h2>
                        <div
                            style={{
                                fontSize: 12,
                                textTransform: 'uppercase',
                                letterSpacing: 2,
                                color: '#6b7280',
                            }}
                        >
                            GİB · UBL 2.1 · UBL-TR
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: 0,
                            border: '1px solid #1a1a1a',
                            background: '#fff',
                        }}
                    >
                        {[
                            { label: 'e-Fatura', code: '01' },
                            { label: 'e-Arşiv', code: '02' },
                            { label: 'e-İrsaliye', code: '03' },
                            { label: 'e-İhracat', code: '04' },
                            { label: 'e-Mikro İhracat', code: '05' },
                            { label: 'e-SMM', code: '06' },
                            { label: 'e-Müstahsil', code: '07' },
                            { label: 'e-Bilet', code: '08' },
                            { label: 'e-Makbuz', code: '09' },
                        ].map((dt, i) => (
                            <div
                                key={dt.code}
                                style={{
                                    padding: '20px 16px',
                                    borderRight: (i + 1) % 3 === 0 ? 'none' : '1px solid #1a1a1a',
                                    borderBottom: i < 6 ? '1px solid #1a1a1a' : 'none',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f6f3ec')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                                onClick={onRegister}
                            >
                                <div
                                    style={{
                                        fontSize: 10,
                                        letterSpacing: 2,
                                        color: '#6b7280',
                                        fontWeight: 600,
                                        marginBottom: 6,
                                    }}
                                >
                                    {dt.code}
                                </div>
                                <div
                                    style={{
                                        fontFamily: 'Georgia, serif',
                                        fontSize: 17,
                                        fontWeight: 600,
                                    }}
                                >
                                    {dt.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====================== FEATURES (numbered) ====================== */}
            <section id="features" style={{ padding: '96px 48px', maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <div
                        style={{
                            fontSize: 12,
                            textTransform: 'uppercase',
                            letterSpacing: 3,
                            color: '#6b7280',
                            marginBottom: 16,
                        }}
                    >
                        Ürün
                    </div>
                    <h2
                        style={{
                            fontFamily: 'Georgia, serif',
                            fontSize: 'clamp(36px, 5vw, 56px)',
                            fontWeight: 400,
                            margin: 0,
                            letterSpacing: '-0.025em',
                            lineHeight: 1.1,
                        }}
                    >
                        XSLT öğrenmeden<br />
                        profesyonel tasarım
                    </h2>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 56,
                    }}
                >
                    {[
                        {
                            n: '01',
                            title: 'Sürükle & Bırak',
                            desc: 'Bileşenleri sürükleyin, gerçek zamanlı önizleme ile sonucu anında görün. Kod bilgisi gerekmez.',
                        },
                        {
                            n: '02',
                            title: 'GİB Resmi Uyumluluk',
                            desc: 'Tüm çıktılar GİB e-Fatura Paketi v29 ve UBL 2.1 şemasıyla birebir uyumlu üretilir.',
                        },
                        {
                            n: '03',
                            title: 'Ücretsiz Başla',
                            desc: 'Beş ücretsiz tasarım hakkı. Kredi kartı istemiyoruz. Beğenirsen kredi paketi satın al.',
                        },
                    ].map((f) => (
                        <div key={f.n}>
                            <div
                                style={{
                                    fontFamily: 'Georgia, serif',
                                    fontSize: 72,
                                    fontWeight: 400,
                                    lineHeight: 1,
                                    marginBottom: 16,
                                    color: '#1a1a1a',
                                }}
                            >
                                {f.n}
                            </div>
                            <h3
                                style={{
                                    fontFamily: 'Georgia, serif',
                                    fontSize: 24,
                                    fontWeight: 600,
                                    margin: '0 0 12px',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                {f.title}
                            </h3>
                            <p
                                style={{
                                    fontSize: 15,
                                    color: '#374151',
                                    margin: 0,
                                    lineHeight: 1.6,
                                }}
                            >
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ====================== FINAL CTA ====================== */}
            <section
                id="cta"
                style={{
                    padding: '80px 48px',
                    background: '#1a1a1a',
                    color: '#f6f3ec',
                    textAlign: 'center',
                }}
            >
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div
                        style={{
                            fontFamily: 'Georgia, serif',
                            fontSize: 'clamp(36px, 5vw, 56px)',
                            fontWeight: 400,
                            margin: '0 0 24px',
                            letterSpacing: '-0.025em',
                            lineHeight: 1.1,
                        }}
                    >
                        İlk tasarımınızı bugün oluşturun
                    </div>
                    <p
                        style={{
                            fontSize: 17,
                            color: '#d1d5db',
                            margin: '0 0 36px',
                            lineHeight: 1.6,
                        }}
                    >
                        Kredi kartı yok. Beş dakikada hazır.
                    </p>
                    <button
                        type="button"
                        onClick={onRegister}
                        style={{
                            padding: '18px 40px',
                            background: '#f6f3ec',
                            color: '#1a1a1a',
                            border: 'none',
                            borderRadius: 0,
                            fontSize: 14,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 2,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 12,
                            fontFamily: 'inherit',
                        }}
                    >
                        Ücretsiz Hesap Aç <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            {/* ====================== FOOTER ====================== */}
            <footer
                style={{
                    padding: '32px 48px',
                    borderTop: '1px solid #1a1a1a',
                    background: '#f6f3ec',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    fontSize: 12,
                    color: '#6b7280',
                    letterSpacing: 0.5,
                }}
            >
                <div>© 2026 EDesign · GitHub Pages + Railway · UBL 2.1</div>
                <div style={{ display: 'flex', gap: 24 }}>
                    <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>
                        KVKK
                    </a>
                    <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>
                        Kullanım
                    </a>
                    <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>
                        İletişim
                    </a>
                </div>
            </footer>
        </main>
    );
};

export default Landing;
