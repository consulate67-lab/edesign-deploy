import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface LandingProps {
    onRegister: () => void;
    onLogin: () => void;
}

/**
 * Landing — "Görsel E-Tasarımcı" tarzı.
 * İlham: e-tasari.com — açık mavi gradient, split-screen hero (sol metin + sağda
 * tam bir e-fatura tasarımı mock-up'ı), Tema rengi + Kenarlık stili interaktif
 * showcase paneli, 9 belge kartı, sabit CANLI DESTEK widget'i.
 */
export const Landing: React.FC<LandingProps> = ({ onRegister, onLogin }) => {
    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #e0f2fe 0%, #ffffff 60%)',
                color: '#0f172a',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
        >
            {/* ====================== MASTHEAD ====================== */}
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 48px',
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    borderBottom: '1px solid rgba(15,23,42,0.06)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#f97316', fontWeight: 800, fontSize: 30 }}>E</span>
                    <span style={{ color: '#3b82f6', fontWeight: 800, fontSize: 30 }}>Design</span>
                </div>
                <nav
                    style={{
                        display: 'flex',
                        gap: 28,
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#1e293b',
                    }}
                >
                    <a href="#nasil" style={{ color: 'inherit', textDecoration: 'none' }}>Nasıl çalışır</a>
                    <a href="#ornekler" style={{ color: 'inherit', textDecoration: 'none' }}>Örnekler</a>
                    <a href="#fiyatlar" style={{ color: 'inherit', textDecoration: 'none' }}>Fiyatlar</a>
                    <a href="#sss" style={{ color: 'inherit', textDecoration: 'none' }}>SSS</a>
                    <a href="#iletisim" style={{ color: 'inherit', textDecoration: 'none' }}>İletişim</a>
                </nav>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={onLogin}
                        style={{
                            padding: '10px 18px',
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
                            padding: '10px 22px',
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
                        }}
                    >
                        Kayıt ol <ArrowRight size={14} />
                    </button>
                </div>
            </header>

            {/* ====================== HERO (SPLIT-SCREEN) ====================== */}
            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                    gap: 48,
                    padding: '64px 48px 48px',
                    maxWidth: 1400,
                    margin: '0 auto',
                    alignItems: 'center',
                }}
            >
                {/* SOL — Metin + CTA */}
                <div>
                    <h1
                        style={{
                            fontSize: 'clamp(40px, 5.5vw, 72px)',
                            fontWeight: 800,
                            lineHeight: 1.05,
                            letterSpacing: '-0.025em',
                            margin: '0 0 24px',
                            color: '#0f172a',
                        }}
                    >
                        E-fatura tasarımınızı{' '}
                        <span style={{ color: '#3b82f6' }}>kod yazmadan</span>{' '}
                        hazırlayın
                    </h1>
                    <p
                        style={{
                            fontSize: 18,
                            color: '#475569',
                            margin: '0 0 36px',
                            lineHeight: 1.6,
                            maxWidth: 540,
                        }}
                    >
                        Şablon seçin; logo, kaşe ve banka bilgilerinizi ekleyin; kendi XML
                        dosyanızla önizleyin. Tasarılamak ücretsiz, kredi yalnızca XSLT
                        dosyasını indirirken düşer.
                    </p>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
                        <button
                            type="button"
                            onClick={onRegister}
                            style={{
                                padding: '14px 28px',
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                boxShadow: '0 6px 18px rgba(59,130,246,0.35)',
                            }}
                        >
                            Ücretsiz kayıt ol <ArrowRight size={16} />
                        </button>
                        <button
                            type="button"
                            style={{
                                padding: '14px 28px',
                                background: '#fff',
                                color: '#1e293b',
                                border: '1px solid #cbd5e1',
                                borderRadius: 8,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Fiyatları gör
                        </button>
                    </div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>
                        Hesabınız var mı?{' '}
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onLogin(); }}
                            style={{ color: '#3b82f6', textDecoration: 'underline', fontWeight: 500 }}
                        >
                            Giriş yapın
                        </a>
                    </div>
                </div>

                {/* SAĞ — e-Arşiv fatura mock-up */}
                <div style={{ position: 'relative' }}>
                    <FaturaMockup />

                    {/* Sağ alt köşe: Tema rengi + Kenarlık stili showcase */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -28,
                            right: -12,
                            background: '#ffffff',
                            padding: 16,
                            borderRadius: 14,
                            boxShadow: '0 12px 36px rgba(15,23,42,0.18)',
                            border: '1px solid #e2e8f0',
                            minWidth: 240,
                        }}
                    >
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>
                            Tema rengi
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                            {[
                                { c: '#f97316', active: false },
                                { c: '#1d4ed8', active: true },
                                { c: '#15803d', active: false },
                                { c: '#b91c1c', active: false },
                                { c: '#0f172a', active: false },
                            ].map((d, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: '50%',
                                        background: d.c,
                                        border: d.active ? '3px solid #fff' : '2px solid transparent',
                                        boxShadow: d.active
                                            ? `0 0 0 2px ${d.c}, 0 4px 10px ${d.c}66`
                                            : '0 1px 4px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                    }}
                                />
                            ))}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>
                            Kenarlık stili
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                style={{
                                    padding: '6px 12px',
                                    background: '#1e293b',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Düz
                            </button>
                            <button
                                style={{
                                    padding: '6px 12px',
                                    background: '#fff',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Kesik
                            </button>
                            <button
                                style={{
                                    padding: '6px 12px',
                                    background: '#fff',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Çift
                            </button>
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, lineHeight: 1.4 }}>
                            Logo, kaşe, banka ve not ayarları da panelde böyle yapılır.
                        </div>
                    </div>
                </div>
            </section>

            {/* ====================== DOC TYPES ====================== */}
            <section
                id="ornekler"
                style={{
                    padding: '96px 48px 64px',
                    maxWidth: 1200,
                    margin: '0 auto',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h2
                        style={{
                            fontSize: 'clamp(28px, 4vw, 42px)',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: '0 0 12px',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Hangi belgeleri tasarlayabilirsiniz?
                    </h2>
                    <p style={{ fontSize: 16, color: '#64748b', margin: 0 }}>
                        GİB UBL 2.1 uyumlu, dokuz aktif e-belge türü
                    </p>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 16,
                    }}
                >
                    {[
                        { label: 'e-Fatura', desc: 'UBL 2.1 ticari', accent: '#3b82f6' },
                        { label: 'e-Arşiv', desc: 'Mükellef dışı', accent: '#8b5cf6' },
                        { label: 'e-İrsaliye', desc: 'Sevkiyat', accent: '#06b6d4' },
                        { label: 'e-İhracat', desc: 'Uluslararası', accent: '#10b981' },
                        { label: 'e-Mikro İhracat', desc: '≤500 kg', accent: '#22d3ee' },
                        { label: 'e-SMM', desc: 'Serbest meslek', accent: '#ec4899' },
                        { label: 'e-Müstahsil', desc: 'Çiftçi/hayvancı', accent: '#84cc16' },
                        { label: 'e-Bilet', desc: 'Ulaşım', accent: '#f97316' },
                        { label: 'e-Makbuz', desc: 'Tahsilat', accent: '#14b8a6' },
                    ].map((dt) => (
                        <button
                            type="button"
                            key={dt.label}
                            onClick={onRegister}
                            style={{
                                padding: '20px 18px',
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 12,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                fontFamily: 'inherit',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = dt.accent;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 8px 24px ${dt.accent}22`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div
                                style={{
                                    width: 6,
                                    height: 36,
                                    borderRadius: 3,
                                    background: dt.accent,
                                    flexShrink: 0,
                                }}
                            />
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                                    {dt.label}
                                </div>
                                <div style={{ fontSize: 13, color: '#64748b' }}>{dt.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ====================== FEATURES ====================== */}
            <section
                style={{
                    padding: '64px 48px',
                    background: '#f1f5f9',
                    marginTop: 48,
                }}
            >
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: 24,
                        }}
                    >
                        {[
                            { n: '01', title: 'Sürükle & Bırak', desc: 'XSLT bilmeden görsel tasarımcı.', accent: '#3b82f6' },
                            { n: '02', title: 'Gerçek Zamanlı Önizleme', desc: 'Kendi XML dosyanızla anlık test.', accent: '#10b981' },
                            { n: '03', title: 'GİB UBL-TR Uyumlu', desc: 'e-Fatura Paketi v29 ile birebir.', accent: '#f97316' },
                            { n: '04', title: 'Tema & Kenarlık Stili', desc: 'Logo, kaşe, banka ayarları panelde.', accent: '#ec4899' },
                        ].map((f) => (
                            <div
                                key={f.n}
                                style={{
                                    padding: 28,
                                    background: '#ffffff',
                                    borderRadius: 14,
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: f.accent,
                                        marginBottom: 8,
                                        letterSpacing: 1.5,
                                    }}
                                >
                                    {f.n}
                                </div>
                                <h3 style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                                    {f.title}
                                </h3>
                                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.55 }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====================== FINAL CTA ====================== */}
            <section
                style={{
                    padding: '80px 48px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                    color: '#fff',
                }}
            >
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <h2
                        style={{
                            fontSize: 'clamp(28px, 4vw, 44px)',
                            fontWeight: 800,
                            margin: '0 0 16px',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.15,
                        }}
                    >
                        İlk tasarımınızı bugün oluşturun
                    </h2>
                    <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.9)', margin: '0 0 36px', lineHeight: 1.5 }}>
                        Kredi kartı gerekmez. Beş ücretsiz tasarım hakkı. XSLT dosyasını
                        indirmek için kredi gerekir.
                    </p>
                    <button
                        type="button"
                        onClick={onRegister}
                        style={{
                            padding: '16px 32px',
                            background: '#fff',
                            color: '#1d4ed8',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            fontFamily: 'inherit',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                        }}
                    >
                        Ücretsiz hesap aç <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            {/* ====================== FOOTER ====================== */}
            <footer
                style={{
                    padding: '32px 48px',
                    borderTop: '1px solid #e2e8f0',
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
                <div style={{ display: 'flex', gap: 24 }}>
                    <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>KVKK</a>
                    <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Kullanım</a>
                    <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>İletişim</a>
                </div>
            </footer>

            {/* ====================== CANLI DESTEK (fixed) ====================== */}
            <button
                type="button"
                style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    boxShadow: '0 8px 28px rgba(59,130,246,0.4)',
                    fontFamily: 'inherit',
                    zIndex: 20,
                }}
            >
                <MessageCircle size={16} />
                CANLI DESTEK
            </button>
        </div>
    );
};

/**
 * Tam bir e-Arşiv fatura tasarımı mock-up'ı.
 * Gerçek bir GİB e-Arşiv faturasının görsel kopyası — kullanıcıya
 * "tasarımcının çıktısı böyle görünüyor" diye göstermek için.
 */
const FaturaMockup: React.FC = () => (
    <div
        style={{
            background: '#ffffff',
            border: '1px solid #bfdbfe',
            borderRadius: 6,
            boxShadow: '0 24px 60px rgba(15,23,42,0.18), 0 0 0 1px rgba(255,255,255,0.5) inset',
            overflow: 'hidden',
            fontSize: 12,
            transform: 'rotate(-1deg)',
            transformOrigin: 'center center',
        }}
    >
        {/* Üst header */}
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 1fr',
                padding: '14px 18px',
                borderBottom: '2px solid #1d4ed8',
                alignItems: 'start',
                gap: 12,
            }}
        >
            <div style={{ fontSize: 10.5, lineHeight: 1.45 }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#1d4ed8' }}>Örnek Kırtasiye Ltd. Şti.</div>
                <div>Gümülpınar Mah. 2. Cad. No:6</div>
                <div>Mersis / Afyonkarahisar</div>
                <div>Tel: 0850 441 21 44</div>
                <div>Vergi Dairesi: Küçükçekmece</div>
                <div style={{ fontWeight: 600 }}>VKN: 1234567890</div>
            </div>
            <div
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: '2px solid #1d4ed8',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1d4ed8',
                    fontSize: 9,
                    fontWeight: 700,
                    textAlign: 'center',
                    lineHeight: 1.1,
                }}
            >
                LOGO
            </div>
            <div style={{ textAlign: 'right', fontSize: 10.5, lineHeight: 1.45 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8' }}>e-Arşiv Fatura</div>
                <div>QR Kod</div>
                <div style={{ marginTop: 4 }}>
                    <div><strong>Özelleştirme No:</strong> TR1.2</div>
                    <div><strong>Senaryo:</strong> EARSIVFATURA</div>
                    <div><strong>Fatura Tipi:</strong> SATIŞ</div>
                    <div><strong>Fatura No:</strong> ETS202600000123</div>
                    <div><strong>Fatura Tarihi:</strong> 18-09-2026</div>
                </div>
            </div>
        </div>

        {/* SAYIN bölümü */}
        <div style={{ padding: '12px 18px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>SAYIN</div>
            <div style={{ fontSize: 11, lineHeight: 1.45 }}>
                <div style={{ fontWeight: 600 }}>Alici Firma A.Ş.</div>
                <div>Kuley Mah. Anafartalar Blv. No:12</div>
                <div>Çankaya / Ankara</div>
                <div>Vergi Dairesi: Kavaklıdere</div>
                <div style={{ fontWeight: 600 }}>VKN: 9876543210</div>
            </div>
        </div>

        {/* Tablo */}
        <table
            style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 10,
            }}
        >
            <thead style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                <tr>
                    {['Sıra No', 'Mal Hizmet', 'Miktar', 'Birim Fiyat', 'KDV Oranı', 'KDV Tutarı', 'Mal Hizmet Tutarı'].map(
                        (h) => (
                            <th
                                key={h}
                                style={{
                                    padding: '6px 4px',
                                    textAlign: h === 'Sıra No' || h === 'Mal Hizmet' ? 'left' : 'right',
                                    fontSize: 9,
                                    fontWeight: 700,
                                    borderRight: '1px solid #bfdbfe',
                                }}
                            >
                                {h}
                            </th>
                        ),
                    )}
                </tr>
            </thead>
            <tbody>
                {[
                    ['1', 'A4 fotokopi kâğıdı', '2 Koli', '450,00 TL', '%20', '180,00 TL', '900,00 TL'],
                    ['2', 'Toner kartuşu', '1 Adet', '1.250,00 TL', '%20', '250,00 TL', '1.250,00 TL'],
                    ['3', 'Dönemsel hizmet', '3 Saat', '750,00 TL', '%20', '450,00 TL', '2.250,00 TL'],
                ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e0f2fe' }}>
                        {row.map((cell, j) => (
                            <td
                                key={j}
                                style={{
                                    padding: '6px 4px',
                                    textAlign: j === 0 || j === 1 ? 'left' : 'right',
                                    fontSize: 9.5,
                                    borderRight: '1px solid #e0f2fe',
                                }}
                            >
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>

        {/* Toplam alanı */}
        <div style={{ padding: '10px 18px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 240, fontSize: 10 }}>
                {[
                    ['Mal Hizmet Toplam Tutarı', '4.400,00 TL'],
                    ['Hesaplanan KDV (%20)', '880,00 TL'],
                    ['Vergiler Dahil Toplam Tutar', '5.280,00 TL'],
                    ['Ödenecek Tutar', '5.280,00 TL'],
                ].map(([label, val], i) => (
                    <div
                        key={label}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '4px 0',
                            background: i === 3 ? '#dbeafe' : 'transparent',
                            fontWeight: i === 3 ? 700 : 400,
                            color: i === 3 ? '#1d4ed8' : '#334155',
                            paddingLeft: i === 3 ? 6 : 0,
                            paddingRight: i === 3 ? 6 : 0,
                        }}
                    >
                        <span>{label}</span>
                        <span>{val}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Not + Banka */}
        <div style={{ padding: '10px 18px', background: '#eff6ff', borderTop: '1px solid #bfdbfe', fontSize: 9.5, lineHeight: 1.5 }}>
            <div>
                <strong>Not:</strong> YALNIZ: BEŞBİNİKİYÜZSEKSEN TÜRK LİRASI SIFIR KURUŞ
            </div>
            <div><strong>Ödeme Koşulu:</strong> Banka havalesi</div>
        </div>
        <div style={{ padding: '8px 18px', background: '#1d4ed8', color: '#fff', fontSize: 10, fontWeight: 700, textAlign: 'center' }}>
            BANKA HESAP BİLGİLERİ
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                <tr>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700 }}>Banka</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700 }}>Hesap Adı</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={{ padding: '6px 10px', fontSize: 9.5 }}>Örnek Bank</td>
                    <td style={{ padding: '6px 10px', fontSize: 9.5 }}>Örnek Kırtasiye Ltd. Şti.</td>
                </tr>
            </tbody>
        </table>
    </div>
);

export default Landing;
