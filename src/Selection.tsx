import React, { useState, useEffect } from 'react';
import { LogOut, User, X, CreditCard, Building2, Phone, Mail, Sparkles } from 'lucide-react';
import { api } from './api';
import { PaymentModal } from './PaymentModal.tsx';
import { DesignWizard } from './wizard/DesignWizard';
import { MyDesigns, CompletedDesigns } from './MyDesigns';
import { TemplateGallery } from './sector-templates/TemplateGallery';
import { theme, techBackground, gradientTextStyle } from './theme';

interface SelectionProps {
    onSelect: (moduleId: string, template: string, moduleName: string, customContent?: string, themeColor?: string) => void;
    onLogout: () => void;
    /** Sprint 7 (2026-10-03) — XSLT Editor (Monaco + canlı preview) — bağımsız 2. tasarım. */
    onSelectXsltEditor?: (moduleId?: string, initialXslt?: string, docName?: string, xml?: string, designId?: number) => void;
}

export const Selection: React.FC<SelectionProps> = ({ onLogout, onSelectXsltEditor }) => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);

    useEffect(() => {
        api.getMe().then(setUserInfo).catch(console.error);
    }, []);

    return (
        <div data-selection-scroll style={{
            height: '100vh',
            overflowY: 'auto',
            width: '100%',
            display: 'flex',
            ...techBackground,
            fontFamily: theme.font,
            color: theme.text,
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
                            borderRadius: '12px', border: '1px solid #a7f3d0',
                            background: theme.greenSoft, color: theme.greenText, fontSize: '0.85rem', fontWeight: 700,
                        }}
                    >
                        <CreditCard size={16} /> {userInfo.credits ?? 0} tasarım hakkı
                    </div>
                )}
                <button
                    onClick={() => setShowPaymentModal(true)}
                    style={{
                        background: theme.gradient, border: 'none',
                        padding: '0.6rem 1.4rem', borderRadius: '12px', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                        boxShadow: theme.shadowBrand, fontWeight: 'bold'
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
                        background: '#fff', border: `1px solid ${theme.border}`,
                        padding: '0.6rem 1.2rem', borderRadius: '12px', color: theme.text, boxShadow: theme.shadowSm, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                        backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = theme.primarySoft)}
                    onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
                >
                    <User size={18} color={theme.primary} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Profilim</span>
                </button>

                <button
                    onClick={onLogout}
                    style={{
                        background: '#fff', border: '1px solid #fecaca',
                        padding: '0.6rem 1.2rem', borderRadius: '12px', color: theme.redText, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                        backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = theme.redSoft;
                        e.currentTarget.style.borderColor = '#fca5a5';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.borderColor = '#fecaca';
                    }}
                >
                    <LogOut size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Çıkış</span>
                </button>
            </div>

            {/* Profile Modal */}
            {showProfileModal && userInfo && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)',
                    zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
                }}>
                    <div style={{
                        background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '24px', color: theme.text,
                        width: '100%', maxWidth: '450px', padding: '2.5rem', position: 'relative',
                        boxShadow: theme.shadowLg
                    }}>
                        <button
                            onClick={() => setShowProfileModal(false)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: theme.textSubtle, cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '80px', height: '80px', background: theme.gradient, borderRadius: '24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
                                boxShadow: theme.shadowBrand
                            }}>
                                <User size={40} color="white" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{userInfo.full_name || 'Kullanıcı'}</h2>
                            <span style={{ background: theme.primarySoft, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: theme.primary, border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                                {userInfo.role === 'admin' ? 'Yönetici Hesabı' : 'Standart Hesap'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: theme.surfaceAlt, padding: '1rem', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                                <Building2 size={20} color={theme.textSubtle} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', color: theme.textSubtle, textTransform: 'uppercase', letterSpacing: '1px' }}>Firma</span>
                                    <span style={{ fontSize: '0.95rem' }}>{userInfo.company_name || '-'}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: theme.surfaceAlt, padding: '1rem', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                                <Mail size={20} color={theme.textSubtle} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', color: theme.textSubtle, textTransform: 'uppercase', letterSpacing: '1px' }}>E-Posta</span>
                                    <span style={{ fontSize: '0.95rem' }}>{userInfo.username}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: theme.surfaceAlt, padding: '1rem', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                                <Phone size={20} color={theme.textSubtle} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', color: theme.textSubtle, textTransform: 'uppercase', letterSpacing: '1px' }}>Telefon</span>
                                    <span style={{ fontSize: '0.95rem' }}>{userInfo.phone_number || '-'}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: theme.greenSoft, padding: '1rem', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                                <CreditCard size={20} color={theme.greenText} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', color: theme.greenText, textTransform: 'uppercase', letterSpacing: '1px' }}>Mevcut Kredi</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.greenText }}>{userInfo.credits} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Tasarım</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{
                width: '100%',
                maxWidth: '1000px',
                margin: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <img
                        src={`${import.meta.env.BASE_URL}favicon.svg`}
                        alt=""
                        width={64}
                        height={64}
                        style={{ display: 'block', margin: '0 auto 1.25rem', borderRadius: 18, boxShadow: theme.shadowBrand }}
                    />
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                        fontWeight: '900',
                        marginBottom: '1rem',
                        ...gradientTextStyle,
                        letterSpacing: '-1px'
                    }}>
                        E-Belge Tasarımcı
                    </h1>
                    <p style={{ color: theme.textMuted, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
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

                <TemplateGallery onUse={onSelectXsltEditor} />
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={(credits) => setUserInfo((prev: any) => prev ? { ...prev, credits } : null)}
            />
        </div>
    );
};
