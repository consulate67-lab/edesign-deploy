import React, { useRef, useState, useEffect } from 'react';
import { FileText, ShoppingCart, Globe, Plane, Package, Zap, Upload, LogOut, User, X, CreditCard, Building2, Phone, Mail, Sparkles, Layout, Truck, Briefcase, Sprout, Ticket, Receipt, Plus, FileSignature, Code2, Copy, Check, FileCode } from 'lucide-react';
import { api } from './api';
import { PaymentModal } from './PaymentModal.tsx';
import { getModuleHints, getModuleConfig } from './templateConfig';
import { getSnippetsForModule, Snippet } from './snippets';
import { useUiStore } from './store/uiStore';
import { TEMPLATES, type XsltTemplate } from './xslt-editor/templates';
import { DesignWizard } from './wizard/DesignWizard';
import { MyDesigns, CompletedDesigns } from './MyDesigns';

interface SelectionProps {
    onSelect: (moduleId: string, template: string, moduleName: string, customContent?: string, themeColor?: string) => void;
    onLogout: () => void;
    /** Sprint 7 (2026-10-03) — XSLT Editor (Monaco + canlı preview) — bağımsız 2. tasarım. */
    onSelectXsltEditor?: (moduleId?: string, initialXslt?: string, docName?: string, xml?: string, designId?: number) => void;
}

interface Module {
    id: string;
    name: string;
    icon: React.ReactElement;
    color: string;
    template: string;
    subTypes?: { id: string; label: string; suffix: string }[];
}

const modules: Module[] = [
    {
        id: 'fatura',
        name: 'e-Fatura',
        icon: <FileText size={24} />,
        color: '#6366f1',
        // Sifirdan tasarlanmis minimal XSLT (Faz 7 — 11 sutunlu urun tablosu, ETTN satiri, sag-alt toplamlar)
        template: 'gib/v2/e-Fatura-Sablon.xslt'
    },
    {
        id: 'arsiv',
        name: 'e-Arşiv',
        icon: <Package size={24} />,
        color: '#10b981',
        // e-Arşiv icin sifirdan tasarlanmis minimal XSLT (GIB uyumlu, imzali)
        template: 'gib/v2/e-Arsiv-Sablon.xslt'
    },
    {
        id: 'irsaliye',
        name: 'e-İrsaliye',
        icon: <Truck size={24} />,
        color: '#0ea5e9',
        // DespatchAdvice-2 semasi + arac/surucu/mal kabul 3-sutun section
        template: 'community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt'
    },
    {
        id: 'ihracat',
        name: 'e-İhracat',
        icon: <Globe size={24} />,
        color: '#8b5cf6',
        // e-İhracat Invoice-2 bazlı
        template: 'community/IRPTeam-eFatura.xslt'
    },
    {
        id: 'mikro_ihracat',
        name: 'e-Mikro İhracat',
        icon: <Plane size={24} />,
        color: '#a855f7',
        // e-Mikro İhracat da Invoice-2 bazlı
        template: 'community/IRPTeam-eFatura.xslt'
    },
    {
        id: 'smm',
        name: 'e-SMM (Serbest Meslek)',
        icon: <Briefcase size={24} />,
        color: '#14b8a6',
        template: 'gib/v2/e-SMM-Sablon.xslt'
    },
    {
        id: 'mustahsil',
        name: 'e-Müstahsil Makbuzu',
        icon: <Sprout size={24} />,
        color: '#84cc16',
        // hzkucuk-eFatura + e-Müstahsil müstahsil/stopaj section
        template: 'community/hzkucuk-eFatura-mustahsil.xslt'
    },
    {
        id: 'bilet',
        name: 'e-Bilet',
        icon: <Ticket size={24} />,
        color: '#f97316',
        // hzkucuk-eFatura + e-Bilet yolcu/sefer/koltuk section
        template: 'community/hzkucuk-eFatura-bilet.xslt'
    },
    {
        id: 'makbuz',
        name: 'e-Makbuz',
        icon: <Receipt size={24} />,
        color: '#06b6d4',
        // hzkucuk-eFatura + e-Makbuz basit ödeme section
        template: 'community/hzkucuk-eFatura-makbuz.xslt'
    },
    // 2026-09-25: e-Sigorta Komisyon, e-Döviz, e-Kıymetli Maden modülleri kaldırıldı (12→9 modül).
];

export const Selection: React.FC<SelectionProps> = ({ onSelect, onLogout, onSelectXsltEditor }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSnippetsModal, setShowSnippetsModal] = useState<string | null>(null);
    const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [showMoreOptions, setShowMoreOptions] = useState(false);

    useEffect(() => {
        api.getMe().then(setUserInfo).catch(console.error);
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 5 MB upload cap — designer previews inline as text.
        const MAX_BYTES = 5 * 1024 * 1024;
        if (file.size > MAX_BYTES) {
            useUiStore.getState().pushToast({
                kind: 'error',
                title: 'Dosya çok büyük',
                description: `Maksimum 5 MB. Seçilen dosya: ${(file.size / 1024 / 1024).toFixed(1)} MB`,
            });
            e.target.value = '';
            return;
        }

        const allowed = ['.xslt', '.xsl', '.xml'];
        const lower = file.name.toLowerCase();
        if (!allowed.some((ext) => lower.endsWith(ext))) {
            useUiStore.getState().pushToast({
                kind: 'error',
                title: 'Geçersiz dosya tipi',
                description: 'Yalnızca .xslt, .xsl veya .xml dosyaları kabul edilir.',
            });
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (!content || !content.trim().startsWith('<')) {
                useUiStore.getState().pushToast({
                    kind: 'error',
                    title: 'Geçersiz XSLT içeriği',
                    description: 'Dosya XML/XSLT olarak okunamadı.',
                });
                e.target.value = '';
                return;
            }
            onSelect('custom', file.name, 'Özel Belge', content);
        };
        reader.onerror = () => {
            useUiStore.getState().pushToast({
                kind: 'error',
                title: 'Dosya okunamadı',
                description: reader.error?.message ?? 'Bilinmeyen hata',
            });
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div data-selection-scroll style={{
            height: '100vh',
            overflowY: 'auto',
            width: '100%',
            display: 'flex',
            background: '#0f172a',
            fontFamily: 'Inter, sans-serif',
            color: 'white',
            padding: '2rem',
            boxSizing: 'border-box',
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute', top: '2rem', right: '2rem',
                display: 'flex', gap: '1rem', zIndex: 50
            }}>
                {userInfo && (
                    <div
                        data-credit-badge
                        title="Kalan tasarım hakkı"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1rem',
                            borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)',
                            background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', fontSize: '0.85rem', fontWeight: 700,
                        }}
                    >
                        <CreditCard size={16} /> {userInfo.credits ?? 0} tasarım hakkı
                    </div>
                )}
                <button
                    onClick={() => setShowPaymentModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none',
                        padding: '0.6rem 1.4rem', borderRadius: '12px', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)', fontWeight: 'bold'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    <Sparkles size={18} />
                    <span style={{ fontSize: '0.9rem' }}>Paket Al</span>
                </button>

                <button
                    onClick={() => setShowProfileModal(true)}
                    style={{
                        background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '0.6rem 1.2rem', borderRadius: '12px', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                        backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)')}
                >
                    <User size={18} color="#818cf8" />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Profilim</span>
                </button>

                <button
                    onClick={onLogout}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '0.6rem 1.2rem', borderRadius: '12px', color: '#f87171', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                        backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                    }}
                >
                    <LogOut size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Çıkış</span>
                </button>
            </div>

            {/* Profile Modal */}
            {showProfileModal && userInfo && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
                }}>
                    <div style={{
                        background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
                        width: '100%', maxWidth: '450px', padding: '2.5rem', position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <button
                            onClick={() => setShowProfileModal(false)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '80px', height: '80px', background: '#6366f1', borderRadius: '24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
                                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
                            }}>
                                <User size={40} color="white" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{userInfo.full_name || 'Kullanıcı'}</h2>
                            <span style={{ background: '#0f172a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                {userInfo.role === 'admin' ? 'Yönetici Hesabı' : 'Standart Hesap'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Building2 size={20} color="#94a3b8" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Firma</span>
                                    <span style={{ fontSize: '0.95rem' }}>{userInfo.company_name || '-'}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Mail size={20} color="#94a3b8" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>E-Posta</span>
                                    <span style={{ fontSize: '0.95rem' }}>{userInfo.username}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Phone size={20} color="#94a3b8" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Telefon</span>
                                    <span style={{ fontSize: '0.95rem' }}>{userInfo.phone_number || '-'}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <CreditCard size={20} color="#10b981" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>Mevcut Kredi</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{userInfo.credits} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Tasarım</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".xslt,.xsl,.xml"
                onChange={handleFileUpload}
            />

            <div style={{
                width: '100%',
                maxWidth: '1000px',
                margin: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                        fontWeight: '900',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-1px'
                    }}>
                        E-Belge Tasarımcı
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Yeni bir tasarım için adımları izleyin: belge türü, şablon ve veri.
                    </p>
                </div>

                <MyDesigns
                    onOpen={(d) => onSelectXsltEditor?.(d.module_id, d.xslt_content ?? undefined, d.name, d.xml_content ?? undefined, d.id)}
                />

                <div style={{ width: '100%', marginBottom: '2rem' }}>
                    <DesignWizard
                        onFinish={(r) => onSelectXsltEditor?.(r.moduleId, r.xslt, r.docName, r.xml)}
                    />
                </div>

                <CompletedDesigns />

                <button
                    type="button"
                    data-toggle-more-options
                    onClick={() => setShowMoreOptions(v => !v)}
                    style={{
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999,
                        color: '#94a3b8', padding: '8px 18px', cursor: 'pointer', fontSize: '0.85rem',
                        marginBottom: '2rem', fontFamily: 'inherit',
                    }}
                >
                    {showMoreOptions ? 'Diğer seçenekleri gizle' : 'Diğer başlangıç seçenekleri (klasik tasarımcı, hazır şablonlar)'}
                </button>

                {showMoreOptions && (<>
                {/* Main Action Group */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px',
                    width: '100%',
                    marginBottom: '4rem'
                }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '16px',
                            width: '100%',
                        }}
                    >
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                background: 'rgba(30, 41, 59, 0.4)',
                                border: '1px dashed rgba(255,255,255,0.1)',
                                borderRadius: '24px', padding: '2rem', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', gap: '1.5rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div style={{
                                width: '56px', height: '56px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }}>
                                <Upload size={30} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Kendi Tasarımın</h2>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    Mevcut bir XSLT dosyanız mı var? Dosyanızı yükleyin ve gelişmiş görsel editörümüzle üzerinde değişiklik yapın.
                                </p>
                            </div>
                            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Dosya Seç ve Yükle &rsaquo;
                            </div>
                        </div>

                        {/* Sprint 7 (2026-10-03) — XSLT Editör (Beta) kartı.
                            ProfesyonelDesigner'a dokunmadan bağımsız 2. tasarım.
                            Monaco editor + canlı preview, XSLT bilen kullanıcılar için. */}
                        {onSelectXsltEditor && (
                            <div
                                onClick={() => onSelectXsltEditor()}
                                title="XSLT Editör — Monaco + canlı preview. XSLT bilen kullanıcılar için."
                                style={{
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(52,211,153,0.08))',
                                    border: '1px solid rgba(16,185,129,0.35)',
                                    borderRadius: '24px', padding: '2rem', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column', gap: '1.5rem',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    backdropFilter: 'blur(10px)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.7)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(16,185,129,0.18)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    position: 'absolute', top: 12, right: 12,
                                    padding: '4px 10px',
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    borderRadius: '999px',
                                    fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px',
                                    color: 'white',
                                }}>
                                    BETA
                                </div>
                                <div style={{
                                    width: '56px', height: '56px',
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    borderRadius: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                }}>
                                    <Code2 size={28} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
                                        XSLT Editör
                                    </h2>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        Direkt XSLT kod yaz, canlı önizle. Monaco editör (VS Code altyapısı, syntax highlight, autocomplete) + sağda anlık HTML render. PHP gibi template mantığına alışkın kullanıcılar için.
                                    </p>
                                </div>
                                <div style={{
                                    color: '#6ee7b7', fontWeight: 'bold', fontSize: '0.9rem',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                }}>
                                    Kod Yazmaya Başla &rsaquo;
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sprint 8 Aşama 3 (2026-10-03) — Şablon Galerisi.
                    5 minimal XSLT şablonu — tıkla → doğrudan XsltEditor'da açılır,
                    üzerinde değişiklik yap, indir. "Kod yazarak tasarım" için hızlı başlangıç. */}
                <div style={{ width: '100%', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                        <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1))' }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Hazır Şablonlarla Başla · XSLT Editör
                        </span>
                        <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.1))' }}></div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '14px',
                    }}>
                        {TEMPLATES.map((template: XsltTemplate) => (
                            <div
                                key={template.id}
                                onClick={() => onSelectXsltEditor?.(template.moduleId, template.xslt, template.docName)}
                                title={`${template.label} — ${template.description}`}
                                data-template-id={template.id}
                                style={{
                                    padding: '14px 16px',
                                    background: 'rgba(16, 185, 129, 0.06)',
                                    border: '1px solid rgba(16, 185, 129, 0.25)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)';
                                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.06)';
                                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.25)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    background: template.moduleId === 'arsiv'
                                        ? 'linear-gradient(135deg, #059669, #10b981)'
                                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    flexShrink: 0,
                                }}>
                                    <FileCode size={18} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginBottom: '4px',
                                    }}>
                                        <span style={{
                                            fontSize: '0.95rem',
                                            fontWeight: 700,
                                            color: '#e2e8f0',
                                        }}>
                                            {template.label}
                                        </span>
                                        <span style={{
                                            padding: '1px 6px',
                                            background: 'rgba(52, 211, 153, 0.15)',
                                            border: '1px solid rgba(52, 211, 153, 0.3)',
                                            borderRadius: '3px',
                                            fontSize: '0.6rem',
                                            fontWeight: 700,
                                            color: '#6ee7b7',
                                            letterSpacing: '0.5px',
                                            textTransform: 'uppercase',
                                        }}>
                                            {template.moduleId === 'arsiv' ? 'e-Arşiv' : 'e-Fatura'}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#94a3b8',
                                        lineHeight: 1.4,
                                    }}>
                                        {template.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ width: '100%', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                        <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1))' }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Hızlı Başlangıç Modülleri</span>
                        <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.1))' }}></div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '16px',
                        width: '100%'
                    }}>
                        {modules.map((module) => {
                            const cfg = getModuleConfig(module.id);
                            return (
                            <div
                                key={module.id}
                                title={cfg.description}
                                onClick={(e) => {
                                    // Sub-butona tiklandiysa bu onClick'i yoksay
                                    const tgt = e.target as HTMLElement;
                                    if (tgt.closest('[data-subbtn]')) return;
                                    if (module.subTypes && module.subTypes.length > 0) {
                                        const sub = module.subTypes[0];
                                        onSelect(`${module.id}_${sub.id}`, module.template, `${module.name} - ${sub.label}`);
                                    } else {
                                        onSelect(module.id, module.template, module.name);
                                    }
                                }}
                                style={{
                                    background: 'rgba(30, 41, 59, 0.2)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s',
                                    backdropFilter: 'blur(5px)',
                                    position: 'relative',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    width: '36px', height: '36px',
                                    background: `${module.color}15`,
                                    borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: module.color,
                                    flexShrink: 0,
                                }}>
                                    {module.icon}
                                </div>
                                <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    color: 'white',
                                    flex: 1,
                                    lineHeight: 1.2,
                                }}>{module.name}</span>
                                {module.subTypes && (
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ display: 'flex', gap: 4, flexShrink: 0 }}
                                    >
                                        {module.subTypes.map((sub) => (
                                            <span
                                                key={sub.id}
                                                data-subbtn="true"
                                                role="button"
                                                tabIndex={0}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelect(
                                                        `${module.id}_${sub.id}`,
                                                        module.template,
                                                        `${module.name} - ${sub.label}`
                                                    );
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        (e.currentTarget as HTMLElement).click();
                                                    }
                                                }}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '5px 10px',
                                                    background: `${module.color}26`,
                                                    border: `1px solid ${module.color}55`,
                                                    borderRadius: 999,
                                                    color: module.color,
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    letterSpacing: 0.3,
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.15s, background 0.18s',
                                                    userSelect: 'none',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = `${module.color}40`;
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = `${module.color}26`;
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                {sub.label}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Snippet butonu (modüle özgü XSLT section library) */}
                                {getSnippetsForModule(module.id).length > 0 && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowSnippetsModal(module.id);
                                        }}
                                        style={{
                                            marginTop: 8,
                                            alignSelf: 'flex-start',
                                            padding: '4px 10px',
                                            background: 'transparent',
                                            border: `1px solid ${module.color}55`,
                                            borderRadius: 999,
                                            color: module.color,
                                            fontSize: '0.68rem',
                                            fontWeight: 600,
                                            letterSpacing: 0.3,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = `${module.color}15`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <Code2 size={11} /> Snippet&apos;ler
                                    </button>
                                )}
                            </div>
                            );
                        })}
                    </div>
                </div>
                </>)}
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={(credits) => setUserInfo((prev: any) => prev ? { ...prev, credits } : null)}
            />

            {/* Snippet Library Modal */}
            {showSnippetsModal && (() => {
                const snippets = getSnippetsForModule(showSnippetsModal);
                const cfg = getModuleConfig(showSnippetsModal);
                return (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)',
                        padding: '2rem',
                    }}>
                        <div style={{
                            background: 'linear-gradient(180deg, #020617 0%, #0a0f1f 100%)',
                            border: '1px solid rgba(148, 163, 184, 0.14)',
                            padding: '2rem',
                            borderRadius: '1.25rem',
                            maxWidth: 960, width: '100%', position: 'relative',
                            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55)',
                            maxHeight: '90vh', overflowY: 'auto',
                        }}>
                            <button onClick={() => { setShowSnippetsModal(null); setCopiedSnippetId(null); }}
                                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: 999, width: 32, height: 32, color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={16} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <Code2 size={22} color="#6366f1" />
                                <h2 style={{ color: '#f8fafc', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
                                    XSLT Snippet Kütüphanesi
                                </h2>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 16px' }}>
                                <strong style={{ color: '#a5b4fc' }}>{cfg.description.split('—')[0].trim()}</strong> için hazır section snippet&apos;leri.
                                Aşağıdaki kodları kopyalayıp Designer&apos;da XSLT edit&apos;ine yapıştırabilirsin.
                            </p>

                            {snippets.length === 0 ? (
                                <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                                    Bu modül için henüz snippet eklenmedi.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {snippets.map((snip) => (
                                        <div key={snip.id} style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(148, 163, 184, 0.14)',
                                            borderRadius: 12,
                                            padding: 16,
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                <div>
                                                    <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14 }}>{snip.label}</div>
                                                    <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{snip.description}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        try {
                                                            if (navigator.clipboard && (navigator.clipboard as any).writeText) {
                                                                (navigator.clipboard as any).writeText(snip.code);
                                                            } else {
                                                                const ta = document.createElement('textarea');
                                                                ta.value = snip.code;
                                                                document.body.appendChild(ta);
                                                                ta.select();
                                                                document.execCommand('copy');
                                                                document.body.removeChild(ta);
                                                            }
                                                            setCopiedSnippetId(snip.id);
                                                            setTimeout(() => setCopiedSnippetId(c => c === snip.id ? null : c), 1500);
                                                        } catch (err) {
                                                            console.error('Kopyalama hatası:', err);
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '5px 12px',
                                                        background: copiedSnippetId === snip.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                                                        border: `1px solid ${copiedSnippetId === snip.id ? 'rgba(16, 185, 129, 0.5)' : 'rgba(99, 102, 241, 0.4)'}`,
                                                        borderRadius: 8,
                                                        color: copiedSnippetId === snip.id ? '#10b981' : '#a5b4fc',
                                                        cursor: 'pointer',
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 4,
                                                        fontFamily: 'inherit',
                                                    }}
                                                >
                                                    {copiedSnippetId === snip.id ? (
                                                        <><Check size={11} /> Kopyalandı</>
                                                    ) : (
                                                        <><Copy size={11} /> Kopyala</>
                                                    )}
                                                </button>
                                            </div>
                                            <pre style={{
                                                background: '#020617',
                                                border: '1px solid rgba(148, 163, 184, 0.1)',
                                                borderRadius: 8,
                                                padding: 12,
                                                margin: 0,
                                                color: '#a5b4fc',
                                                fontSize: 11,
                                                fontFamily: 'monospace',
                                                overflow: 'auto',
                                                maxHeight: 200,
                                                whiteSpace: 'pre-wrap',
                                            }}>{snip.code}</pre>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};
