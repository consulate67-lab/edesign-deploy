import React, { useState } from 'react';
import { CreditCard, ShieldCheck, X, Sparkles, Check } from 'lucide-react';
import { api } from './api';
import { PACKAGES_PLANS, type PackagePlan } from './pricing';

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
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)',
            padding: '2rem'
        }}>
            <div style={{
                background: 'linear-gradient(180deg, #020617 0%, #0a0f1f 100%)',
                border: '1px solid rgba(148, 163, 184, 0.14)',
                padding: '2.5rem 2rem',
                borderRadius: '1.5rem',
                maxWidth: '960px',
                width: '100%',
                position: 'relative',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55)',
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <button
                    onClick={onClose}
                    aria-label="Kapat"
                    style={{
                        position: 'absolute', top: '1.5rem', right: '1.5rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        color: '#cbd5e1', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%',
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
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                color: '#a5b4fc', fontSize: '0.7rem', fontWeight: 700,
                                letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '0.75rem',
                            }}>
                                <Sparkles size={11} /> Kredi Yükle
                            </div>
                            <h2 style={{ color: '#f8fafc', fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                                Tasarım Paketleri
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.5rem 0 0' }}>
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
                                        ? 'linear-gradient(180deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))'
                                        : 'rgba(15, 23, 42, 0.6)',
                                    border: plan.highlight ? '2px solid #6366f1' : '1px solid rgba(148, 163, 184, 0.2)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem', textAlign: 'left', cursor: 'pointer',
                                    color: '#f1f5f9', fontFamily: 'inherit',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#a5b4fc' }}>{plan.name}</span>
                                    {plan.highlight && (
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#6366f1', color: 'white' }}>
                                            En avantajlı
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
                                    {formatTL(plan.price)}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    {plan.credits} tasarım hakkı · tasarım başına {formatTL(Math.round(plan.price / plan.credits))}
                                </div>
                                <div style={{ flex: 1 }}>
                                    {plan.features.map(f => (
                                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                                            <Check size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                                        </div>
                                    ))}
                                </div>
                                <div style={{
                                    marginTop: '1rem', padding: '0.7rem', borderRadius: '0.6rem',
                                    background: plan.highlight ? '#6366f1' : 'rgba(99, 102, 241, 0.2)',
                                    border: plan.highlight ? 'none' : '1px solid rgba(99, 102, 241, 0.5)',
                                    color: 'white', fontWeight: 700, textAlign: 'center',
                                }}>
                                    Satın Al
                                </div>
                            </button>
                        ))}
                        </div>

                        <div style={{
                            marginTop: '1.5rem', padding: '1rem',
                            background: 'rgba(99, 102, 241, 0.06)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '0.75rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            color: '#cbd5e1', fontSize: '0.8rem',
                        }}>
                            <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0 }} />
                            <div>
                                <strong style={{ color: '#f1f5f9' }}>3D Secure ile güvenli ödeme.</strong>{' '}
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
                        <CreditCard size={48} color="#6366f1" />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                            iyzico ödeme sayfasına yönlendiriliyorsunuz...
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                            Lütfen bekleyin, ödeme sayfası açılacak.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
