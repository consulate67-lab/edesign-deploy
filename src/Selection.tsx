import React, { useEffect, useRef, useState } from 'react';
import { LogOut, User, X, CreditCard, Building2, Phone, Mail, Sparkles, PenLine, FolderOpen, ChevronDown, Check } from 'lucide-react';
import { api } from './api';
import { PaymentModal } from './PaymentModal.tsx';
import { DesignWizard } from './wizard/DesignWizard';
import { MyDesigns, CompletedDesigns } from './MyDesigns';
import { TemplateGallery } from './sector-templates/TemplateGallery';
import { theme, techBackground, gradientTextStyle } from './theme';
import { useLocaleT } from './i18n';
import { LanguageSwitcher } from './i18n/LanguageSwitcher';
import { useCountry } from './store/uiStore';

interface SelectionProps {
    onSelect: (moduleId: string, template: string, moduleName: string, customContent?: string, themeColor?: string) => void;
    onLogout: () => void;
    /** Sprint 7 (2026-10-03) — XSLT Editor (Monaco + canlı preview) — bağımsız 2. tasarım. */
    onSelectXsltEditor?: (moduleId?: string, initialXslt?: string, docName?: string, xml?: string, designId?: number) => void;
}

type DesignsPanel = 'drafts' | 'completed' | null;

interface SelectionUser {
    full_name?: string | null;
    company_name?: string | null;
    username?: string;
    phone_number?: string | null;
    role?: string;
    credits?: number;
}

export const Selection: React.FC<SelectionProps> = ({ onLogout, onSelectXsltEditor }) => {
    const { t } = useLocaleT();
    const isTurkey = (useCountry() ?? 'TR') === 'TR';
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [userInfo, setUserInfo] = useState<SelectionUser | null>(null);
    const [manualOpen, setManualOpen] = useState(false);
    const [designsPanel, setDesignsPanel] = useState<DesignsPanel>(null);
    const [designsMenuOpen, setDesignsMenuOpen] = useState(false);
    const designsMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.getMe().then(setUserInfo).catch(console.error);
    }, []);

    useEffect(() => {
        if (!designsMenuOpen) return;
        const onDoc = (e: MouseEvent) => {
            if (!designsMenuRef.current?.contains(e.target as Node)) setDesignsMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDesignsMenuOpen(false); };
        document.addEventListener('mousedown', onDoc);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDoc);
            document.removeEventListener('keydown', onKey);
        };
    }, [designsMenuOpen]);

    const openDesigns = (panel: DesignsPanel) => {
        setDesignsPanel(panel);
        setDesignsMenuOpen(false);
        setManualOpen(false);
    };

    const topBtn: React.CSSProperties = {
        background: '#fff', border: `1px solid ${theme.border}`,
        padding: '0.6rem 1.2rem', borderRadius: '12px', color: theme.text, boxShadow: theme.shadowSm, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
        backdropFilter: 'blur(10px)', fontFamily: 'inherit',
    };

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
            <div data-selection-actions style={{
                position: 'absolute', top: '2rem', right: '2rem', left: '2rem',
                display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '1rem', zIndex: 50,
                pointerEvents: 'none',
            }}>
                <style>{'[data-selection-actions] > * { pointer-events: auto; }'}</style>
                <LanguageSwitcher style={{ borderRadius: 12, alignSelf: 'stretch' }} />
                {userInfo && (
                    <div
                        data-credit-badge
                        title={t('selection.creditsTitle')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1rem',
                            borderRadius: '12px', border: '1px solid #a7f3d0',
                            background: theme.greenSoft, color: theme.greenText, fontSize: '0.85rem', fontWeight: 700,
                        }}
                    >
                        <CreditCard size={16} /> {t('pricing.credits', { count: userInfo.credits ?? 0 })}
                    </div>
                )}
                <button
                    onClick={() => setShowPaymentModal(true)}
                    style={{
                        background: theme.gradient, border: 'none',
                        padding: '0.6rem 1.4rem', borderRadius: '12px', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                        boxShadow: theme.shadowBrand, fontWeight: 'bold', fontFamily: 'inherit',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    <Sparkles size={18} />
                    <span style={{ fontSize: '0.9rem' }}>{t('selection.buy')}</span>
                </button>

                <div ref={designsMenuRef} data-designs-menu style={{ position: 'relative' }}>
                    <button
                        type="button"
                        data-designs-menu-toggle
                        aria-expanded={designsMenuOpen}
                        aria-haspopup="menu"
                        onClick={() => setDesignsMenuOpen(o => !o)}
                        style={{
                            ...topBtn,
                            borderColor: designsPanel ? theme.primary : theme.border,
                            background: designsPanel ? theme.primarySoft : '#fff',
                        }}
                    >
                        <FolderOpen size={18} color={theme.primary} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t('selection.designsMenu')}</span>
                        <ChevronDown size={16} color={theme.textMuted} style={{ transform: designsMenuOpen ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }} />
                    </button>
                    {designsMenuOpen && (
                        <div
                            role="menu"
                            data-designs-menu-list
                            style={{
                                position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 220,
                                background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14,
                                boxShadow: theme.shadowLg, padding: 6, zIndex: 60,
                            }}
                        >
                            {([
                                { id: 'drafts' as const, label: t('selection.draftsMenu') },
                                { id: 'completed' as const, label: t('selection.completedMenu') },
                            ]).map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="menuitem"
                                    data-designs-menu-item={item.id}
                                    onClick={() => openDesigns(item.id)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '10px 12px', border: 'none', borderRadius: 10, cursor: 'pointer',
                                        background: designsPanel === item.id ? theme.primarySoft : 'transparent',
                                        color: theme.text, fontFamily: 'inherit', fontSize: 14, fontWeight: 600, textAlign: 'left',
                                    }}
                                >
                                    {designsPanel === item.id ? <Check size={15} color={theme.primary} /> : <span style={{ width: 15 }} />}
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setShowProfileModal(true)}
                    style={topBtn}
                    onMouseOver={(e) => (e.currentTarget.style.background = theme.primarySoft)}
                    onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
                >
                    <User size={18} color={theme.primary} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{t('selection.profile')}</span>
                </button>

                <button
                    onClick={onLogout}
                    style={{
                        ...topBtn, border: '1px solid #fecaca', color: theme.redText,
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
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{t('selection.logout')}</span>
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
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{userInfo.full_name || t('selection.user')}</h2>
                            <span style={{ background: theme.primarySoft, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: theme.primary, border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                                {userInfo.role === 'admin' ? t('selection.adminAccount') : t('selection.standardAccount')}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: theme.surfaceAlt, padding: '1rem', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                                <Building2 size={20} color={theme.textSubtle} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', color: theme.textSubtle, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('selection.company')}</span>
                                    <span style={{ fontSize: '0.95rem' }}>{userInfo.company_name || '-'}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: theme.surfaceAlt, padding: '1rem', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                                <Mail size={20} color={theme.textSubtle} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', color: theme.textSubtle, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('selection.email')}</span>
                                    <span style={{ fontSize: '0.95rem' }}>{userInfo.username}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: theme.surfaceAlt, padding: '1rem', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                                <Phone size={20} color={theme.textSubtle} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', color: theme.textSubtle, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('selection.phone')}</span>
                                    <span style={{ fontSize: '0.95rem' }}>{userInfo.phone_number || '-'}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: theme.greenSoft, padding: '1rem', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                                <CreditCard size={20} color={theme.greenText} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', color: theme.greenText, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('selection.currentCredits')}</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.greenText }}>{userInfo.credits} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{t('selection.designUnit')}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div data-selection-main style={{
                width: '100%',
                maxWidth: '1000px',
                margin: 'auto',
                paddingTop: '4rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <img
                        src={`${import.meta.env.BASE_URL}logo-300x100.png?v=2`}
                        srcSet={`${import.meta.env.BASE_URL}logo-600x200.png?v=2 2x`}
                        alt="edXdocu"
                        width={300}
                        height={100}
                        style={{ display: 'block', height: 72, width: 'auto', margin: '0 auto 1.25rem' }}
                    />
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                        fontWeight: '900',
                        marginBottom: '1rem',
                        ...gradientTextStyle,
                        letterSpacing: '-1px'
                    }}>
                        {t('selection.title')}
                    </h1>
                    <p style={{ color: theme.textMuted, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        {t('selection.subtitle')}
                    </p>
                </div>

                {designsPanel ? (
                    <div data-designs-panel={designsPanel} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                            <button
                                type="button"
                                data-designs-panel-close
                                onClick={() => setDesignsPanel(null)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                                    borderRadius: 10, border: `1px solid ${theme.borderStrong}`, background: theme.surface,
                                    color: theme.textMuted, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                                }}
                            >
                                <X size={14} /> {t('selection.closePanel')}
                            </button>
                        </div>
                        {designsPanel === 'drafts' && (
                            <MyDesigns
                                forceShow
                                onOpen={(d) => onSelectXsltEditor?.(d.module_id, d.xslt_content ?? undefined, d.name, d.xml_content ?? undefined, d.id)}
                            />
                        )}
                        {designsPanel === 'completed' && <CompletedDesigns forceShow />}
                    </div>
                ) : (
                    <>
                        <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                            {!manualOpen ? (
                                <button
                                    type="button"
                                    data-edit-myself
                                    onClick={() => setManualOpen(true)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                                        padding: '22px 24px', borderRadius: 24, cursor: 'pointer', textAlign: 'left',
                                        background: theme.surface, border: `1px solid ${theme.border}`,
                                        boxShadow: theme.shadow, color: theme.text, fontFamily: 'inherit',
                                        transition: 'border-color 0.15s, transform 0.15s',
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: theme.gradient, boxShadow: theme.shadowBrand,
                                    }}>
                                        <PenLine size={24} color="white" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{t('selection.editMyself')}</div>
                                        <div style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.45 }}>{t('selection.editMyselfHint')}</div>
                                    </div>
                                </button>
                            ) : (
                                <DesignWizard
                                    onDismiss={() => setManualOpen(false)}
                                    onFinish={(r) => onSelectXsltEditor?.(r.moduleId, r.xslt, r.docName, r.xml)}
                                />
                            )}
                        </div>

                        {isTurkey && !manualOpen && (
                            <>
                                <div data-selection-or style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                                    margin: '0.25rem 0 1.5rem', color: theme.textSubtle, fontSize: 13, fontWeight: 800,
                                    letterSpacing: '0.08em', textTransform: 'uppercase',
                                }}>
                                    <div style={{ flex: 1, height: 1, background: theme.border }} />
                                    {t('selection.orDivider')}
                                    <div style={{ flex: 1, height: 1, background: theme.border }} />
                                </div>
                                <TemplateGallery onUse={onSelectXsltEditor} />
                            </>
                        )}
                    </>
                )}
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={(credits) => setUserInfo(prev => prev ? { ...prev, credits } : null)}
            />
        </div>
    );
};
