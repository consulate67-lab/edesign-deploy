import React, { useRef, useState, useEffect } from 'react';
import { FileText, ShoppingCart, Globe, Plane, Package, Zap, Upload, LogOut, User, X, CreditCard, Building2, Phone, Mail, Sparkles, Layout, Truck, Briefcase, Sprout, Ticket, Receipt, Shield, Banknote, Coins, Plus } from 'lucide-react';
import { api } from './api';
import { PaymentModal } from './PaymentModal.tsx';
import { TemplateGallery } from './TemplateGallery.tsx';
import { XSLTTemplate, xsltTemplates } from './templates';
import { useUiStore } from './store/uiStore';

interface SelectionProps {
    onSelect: (moduleId: string, template: string, moduleName: string, customContent?: string, themeColor?: string) => void;
    onLogout: () => void;
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
        template: 'gib/e-Fatura.xslt'
    },
    {
        id: 'arsiv',
        name: 'e-Arşiv',
        icon: <Package size={24} />,
        color: '#10b981',
        template: 'gib/e-Fatura.xslt'
    },
    {
        id: 'irsaliye',
        name: 'e-İrsaliye',
        icon: <Truck size={24} />,
        color: '#0ea5e9',
        template: 'community/IRPTeam-eWaybill-Irsaliye.xslt'
    },
    {
        id: 'ihracat',
        name: 'e-İhracat',
        icon: <Globe size={24} />,
        color: '#8b5cf6',
        template: 'gib/e-Fatura.xslt'
    },
    {
        id: 'mikro_ihracat',
        name: 'e-Mikro İhracat',
        icon: <Plane size={24} />,
        color: '#a855f7',
        template: 'gib/e-Fatura.xslt'
    },
    {
        id: 'smm',
        name: 'e-SMM (Serbest Meslek)',
        icon: <Briefcase size={24} />,
        color: '#14b8a6',
        template: 'community/hzkucuk-eFatura.xslt'
    },
    {
        id: 'mustahsil',
        name: 'e-Müstahsil Makbuzu',
        icon: <Sprout size={24} />,
        color: '#84cc16',
        template: 'community/hzkucuk-eFatura.xslt'
    },
    {
        id: 'bilet',
        name: 'e-Bilet',
        icon: <Ticket size={24} />,
        color: '#f97316',
        template: 'community/hzkucuk-eFatura.xslt'
    },
    {
        id: 'makbuz',
        name: 'e-Makbuz',
        icon: <Receipt size={24} />,
        color: '#06b6d4',
        template: 'community/hzkucuk-eFatura.xslt'
    },
    {
        id: 'sigorta',
        name: 'e-Sigorta Komisyon',
        icon: <Shield size={24} />,
        color: '#dc2626',
        template: 'gib/sigortakomisyonGiderBelgesi.xslt'
    },
    {
        id: 'doviz',
        name: 'e-Döviz',
        icon: <Banknote size={24} />,
        color: '#10b981',
        template: 'gib/eDoviz_Alim.xslt',
        subTypes: [
            { id: 'doviz_alim', label: 'Alım', suffix: 'Alim' },
            { id: 'doviz_satim', label: 'Satım', suffix: 'Satim' },
        ]
    },
    {
        id: 'kmaden',
        name: 'e-Kıymetli Maden',
        icon: <Coins size={24} />,
        color: '#f59e0b',
        template: 'gib/eDoviz_Alim.xslt',
        subTypes: [
            { id: 'kmaden_alim', label: 'Alım', suffix: 'KMAlim' },
            { id: 'kmaden_satim', label: 'Satım', suffix: 'KMSatim' },
        ]
    },
];

export const Selection: React.FC<SelectionProps> = ({ onSelect, onLogout }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);

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

    const handleTemplateSelect = (template: XSLTTemplate, docTypeId?: string) => {
        let fileName = template.fileName;
        let moduleName = template.name;

        if (docTypeId) {
            const module = modules.find(m => m.id === docTypeId);
            if (module) {
                // Keep the design from the gallery (template.fileName), only update name context
                moduleName = `${template.name} - ${module.name}`;
            }
        }

        // Theme color is passed as a dedicated 5th argument (no customContent hack).
        onSelect('library', fileName, moduleName, undefined, template.previewColor);
        setShowGallery(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px' }}>
                        Türkiyenın en gelişmiş e-belge tasarım platformuna hoş geldiniz.
                        Hazır şablonlarla başlayın veya kendi tasarımınızı oluşturun.
                    </p>
                </div>

                {/* Main Action Group */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px',
                    width: '100%',
                    marginBottom: '4rem'
                }}>
                    <div
                        onClick={() => setShowGallery(true)}
                        style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '24px', padding: '2rem', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', gap: '1.5rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative', overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            width: '56px', height: '56px', background: '#6366f1', borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                            <Layout size={30} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Tasarım Kütüphanesi</h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                Profesyonellerce hazırlanmış onlarca hazır XSLT şablonu arasından seçin ve saniyeler içinde düzenlemeye başlayın.
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            Kütüphaneyi Keşfet <Sparkles size={16} />
                        </div>
                    </div>

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
                        {modules.map((module) => (
                            <div
                                key={module.id}
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
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <TemplateGallery
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
                onSelect={handleTemplateSelect}
            />

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={(credits) => setUserInfo((prev: any) => prev ? { ...prev, credits } : null)}
            />
        </div>
    );
};
