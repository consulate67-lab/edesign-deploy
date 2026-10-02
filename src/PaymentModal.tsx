import React, { useState } from 'react';
import { ChevronLeft, CreditCard, ShieldCheck, X, Sparkles } from 'lucide-react';
import { api } from './api';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCredits: number) => void;
}

// Mirror of the Landing page pricing section so the two stay in sync.
// Update Landing.tsx PACKAGES_PLANS in tandem.
interface Plan {
    id: 'starter' | 'pro' | 'kurumsal';
    name: string;
    count: number;
    price: number;
    perUnit: number;
    popular: boolean;
    accent: string;
}

const PACKAGES_PLANS: Plan[] = [
    { id: 'starter',  name: 'Baslangic', count: 5,    price: 0,   perUnit: 0,    popular: false, accent: '#64748b' },
    { id: 'pro',      name: 'Pro',       count: 50,   price: 49,  perUnit: 0.98, popular: true,  accent: '#6366f1' },
    { id: 'kurumsal', name: 'Kurumsal',  count: 9999, price: 199, perUnit: 0.02, popular: false, accent: '#10b981' },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [paymentState, setPaymentState] = useState<{ step: 'packages' | 'redirecting', isPaying?: boolean, planId?: string }>({ step: 'packages' });

    if (!isOpen) return null;

    /**
     * Sprint 1.3 (2026-10-02) — Plan secilince iyzico checkout token al,
     * paymentPageUrl'ye yonlendir. Ucretsiz plan icin kayit/yenile auth'a gider.
     */
    const handlePlanSelect = async (plan: Plan) => {
        setPaymentState({ step: 'redirecting', planId: plan.id, isPaying: true });
        try {
            const result = await api.iyzicoCheckout(plan.id);
            if (result.free || plan.price === 0) {
                // Backend 'free' donerse veya ucretsiz plan secildiyse
                onSuccess(plan.count);
                onClose();
                setPaymentState({ step: 'packages' });
                return;
            }
            if (result.paymentPageUrl) {
                // Iyzico 3D odeme sayfasina yonlendir
                window.location.href = result.paymentPageUrl;
            } else {
                window.alert('Odeme baslatilamadi, lutfen tekrar deneyin.');
                setPaymentState({ step: 'packages' });
            }
        } catch (err: any) {
            window.alert('Odeme Hatasi: ' + (err?.message ?? 'bilinmeyen'));
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
                maxWidth: '1040px',
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
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        color: '#cbd5e1',
                        cursor: 'pointer',
                        padding: '0.4rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                                letterSpacing: '1.2px',
                                textTransform: 'uppercase',
                                marginBottom: '0.75rem',
                            }}>
                                <Sparkles size={11} /> Kredi Yukle
                            </div>
                            <h2 style={{ color: '#f8fafc', fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                                Tasarim Paketi Secin
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.5rem 0 0' }}>
                                3D Secure ile guvenli odeme. Iyzico altyapisi.
                            </p>
                        </div>

                        <div style={{
                            display: 'grid', gap: '0.75rem',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        }}>
                            {PACKAGES_PLANS.map((plan) => (
                                <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => handlePlanSelect(plan)}
                                    style={{
                                        background: plan.popular
                                            ? 'linear-gradient(180deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))'
                                            : 'rgba(255,255,255,0.02)',
                                        border: plan.popular
                                            ? '2px solid #6366f1'
                                            : '1px solid rgba(148, 163, 184, 0.18)',
                                        borderRadius: '1rem',
                                        padding: '1.25rem 1rem',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        color: '#f1f5f9',
                                        position: 'relative',
                                        transition: 'all 0.2s',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    {plan.popular && (
                                        <div style={{
                                            position: 'absolute', top: -10,
                                            background: '#6366f1', color: 'white',
                                            padding: '2px 10px', borderRadius: 999,
                                            fontSize: '0.65rem', fontWeight: 800,
                                            letterSpacing: '0.8px',
                                        }}>
                                            EN POPULER
                                        </div>
                                    )}
                                    <div style={{
                                        fontSize: '1rem', fontWeight: 700,
                                        color: plan.popular ? '#a5b4fc' : '#cbd5e1',
                                        marginBottom: '0.25rem',
                                    }}>
                                        {plan.name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>
                                            {plan.price === 0 ? 'Ucretsiz' : `${plan.price} TL`}
                                        </span>
                                        {plan.price > 0 && (
                                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>/ ay</span>
                                        )}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                        {plan.count === 9999 ? 'Sinirsiz' : `${plan.count} tasarim hakki`}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                        Tasarim basina {(plan.price / plan.count).toFixed(2)} TL
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(99, 102, 241, 0.06)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '0.75rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            color: '#cbd5e1', fontSize: '0.8rem',
                        }}>
                            <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0 }} />
                            <div>
                                <strong style={{ color: '#f1f5f9' }}>3D Secure ile guvenli odeme.</strong>{' '}
                                Tum islemler Iyzico PCI-DSS sertifikali altyapida islenir.
                                Kredi kart bilgileri sunucumuza ulasmaz.
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
                            Iyzico odeme sayfasina yonlendiriliyorsunuz...
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                            Lutfen bekleyin, odeme sayfasi acilacak.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;