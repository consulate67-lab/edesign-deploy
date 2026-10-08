import React, { useState } from 'react';
import { CreditCard, ShieldCheck, X, Sparkles, Check } from 'lucide-react';
import { api } from './api';
import { PACKAGES_PLANS, type PackagePlan } from './pricing';
import { theme } from './theme';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCredits: number) => void;
}

const formatTL = (n: number) => `${n.toLocaleString('tr-TR')} TL`;

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
    const [paymentState, setPaymentState] = useState<{ step: 'packages' | 'redirecting', planId?: string }>({ step: 'packages' });

    if (!isOpen) return null;

    /** Paket seçilince iyzico checkout token alınır, ödeme sayfasına yönlendirilir. */
    const handlePlanSelect = async (plan: PackagePlan) => {
        setPaymentState({ step: 'redirecting', planId: plan.id });
        try {
            const result = await api.iyzicoCheckout(plan.id);
            if (result.paymentPageUrl) {
                window.location.href = result.paymentPageUrl;
            } else {
                window.alert('Ödeme başlatılamadı, lütfen tekrar deneyin.');
                setPaymentState({ step: 'packages' });
            }
        } catch (err: any) {
            window.alert('Ödeme hatası: ' + (err?.message ?? 'bilinmeyen'));
            setPaymentState({ step: 'packages' });
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)',
            padding: '2rem'
        }}>
            <div style={{
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                padding: '2.5rem 2rem',
                borderRadius: '1.5rem',
                maxWidth: '960px',
                width: '100%',
                position: 'relative',
                boxShadow: theme.shadowLg,
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <button
                    onClick={onClose}
                    aria-label="Kapat"
                    style={{
                        position: 'absolute', top: '1.5rem', right: '1.5rem',
                        background: theme.surfaceAlt,
                        border: `1px solid ${theme.border}`,
                        color: theme.textMuted, cursor: 'pointer', padding: '0.4rem', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <X size={18} />
                </button>

                {paymentState.step === 'packages' && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '4px 12px', borderRadius: 999,
                                background: theme.primarySoft,
                                border: '1px solid rgba(109, 40, 217, 0.2)',
                                color: theme.primary, fontSize: '0.7rem', fontWeight: 700,
                                letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '0.75rem',
                            }}>
                                <Sparkles size={11} /> Kredi Yükle
                            </div>
                            <h2 style={{ color: theme.text, fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                                Tasarım Paketleri
                            </h2>
                            <p style={{ color: theme.textMuted, fontSize: '0.95rem', margin: '0.5rem 0 0' }}>
                                Tek seferlik ödeme · abonelik yok · 3D Secure
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                        {PACKAGES_PLANS.map((plan) => (
                            <button
                                key={plan.id}
                                type="button"
                                data-buy-plan={plan.id}
                                onClick={() => handlePlanSelect(plan)}
                                style={{
                                    display: 'flex', flexDirection: 'column',
                                    background: plan.highlight
                                        ? `linear-gradient(180deg, ${theme.surfaceTint}, ${theme.surface})`
                                        : theme.surface,
                                    border: plan.highlight ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`,
                                    borderRadius: '1rem',
                                    boxShadow: plan.highlight ? theme.shadowBrand : theme.shadowSm,
                                    padding: '1.5rem', textAlign: 'left', cursor: 'pointer',
                                    color: theme.text, fontFamily: 'inherit',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '1rem', fontWeight: 700, color: theme.primary }}>{plan.name}</span>
                                    {plan.highlight && (
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: theme.gradient, color: 'white' }}>
                                            En avantajlı
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, marginBottom: '0.25rem' }}>
                                    {formatTL(plan.price)}
                                </div>
                                <div style={{ color: theme.textMuted, fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    {plan.credits} tasarım hakkı · tasarım başına {formatTL(Math.round(plan.price / plan.credits))}
                                </div>
                                <div style={{ flex: 1 }}>
                                    {plan.features.map(f => (
                                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: theme.textMuted, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                                            <Check size={14} color={theme.green} style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                                        </div>
                                    ))}
                                </div>
                                <div style={{
                                    marginTop: '1rem', padding: '0.7rem', borderRadius: '0.6rem',
                                    background: plan.highlight ? theme.gradient : theme.primarySoft,
                                    border: plan.highlight ? 'none' : '1px solid rgba(109, 40, 217, 0.25)',
                                    boxShadow: plan.highlight ? theme.shadowBrand : 'none',
                                    color: plan.highlight ? 'white' : theme.primary, fontWeight: 700, textAlign: 'center',
                                }}>
                                    Satın Al
                                </div>
                            </button>
                        ))}
                        </div>

                        <div style={{
                            marginTop: '1.5rem', padding: '1rem',
                            background: theme.surfaceAlt,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '0.75rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            color: theme.textMuted, fontSize: '0.8rem',
                        }}>
                            <ShieldCheck size={20} color={theme.green} style={{ flexShrink: 0 }} />
                            <div>
                                <strong style={{ color: theme.text }}>3D Secure ile güvenli ödeme.</strong>{' '}
                                Tüm işlemler iyzico PCI-DSS sertifikalı altyapıda işlenir.
                                Kart bilgileri sunucumuza ulaşmaz.
                            </div>
                        </div>
                    </>
                )}

                {paymentState.step === 'redirecting' && (
                    <div style={{
                        textAlign: 'center', padding: '3rem 1rem',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                    }}>
                        <CreditCard size={48} color={theme.primary} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.text, margin: 0 }}>
                            iyzico ödeme sayfasına yönlendiriliyorsunuz...
                        </h3>
                        <p style={{ color: theme.textMuted, fontSize: '0.9rem', margin: 0 }}>
                            Lütfen bekleyin, ödeme sayfası açılacak.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
