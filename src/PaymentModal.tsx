import React, { useState } from 'react';
import { ChevronLeft, CreditCard, ShieldCheck, X, Sparkles } from 'lucide-react';
import { api } from './api';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCredits: number) => void;
}

// Mirror of the Landing page pricing section so the two stay in sync.
// Update Landing.tsx → PACKAGES_PLANS in tandem.
interface Plan {
    name: string;
    count: number;
    price: number;
    perUnit: number;
    popular: boolean;
    accent: string;
}

const PACKAGES_PLANS: Plan[] = [
    { name: 'Starter', count: 1, price: 400, perUnit: 400, popular: false, accent: '#64748b' },
    { name: 'Basic', count: 10, price: 3000, perUnit: 300, popular: false, accent: '#0ea5e9' },
    { name: 'Pro', count: 30, price: 5500, perUnit: 183, popular: true, accent: '#6366f1' },
    { name: 'Business', count: 50, price: 4500, perUnit: 90, popular: false, accent: '#10b981' },
    { name: 'Enterprise', count: 100, price: 6000, perUnit: 60, popular: false, accent: '#ec4899' },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [paymentState, setPaymentState] = useState<{ step: 'packages' | 'form', amount?: number, isPaying?: boolean }>({ step: 'packages' });

    if (!isOpen) return null;

    const handlePlanSelect = (plan: Plan) => {
        setPaymentState({ step: 'form', amount: plan.price, isPaying: false });
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentState.amount) return;

        setPaymentState(prev => ({ ...prev, isPaying: true }));
        await new Promise(r => setTimeout(r, 1500)); // Simulate delay

        try {
            const res = await api.addCredits(paymentState.amount);
            if (res.success) {
                onSuccess(res.credits);
                onClose();
                setPaymentState({ step: 'packages' });
                alert('Ödeme Başarılı! Bakiyeniz güncellendi.');
            }
        } catch (err: any) {
            alert('Ödeme Hatası: ' + err.message);
            setPaymentState(prev => ({ ...prev, isPaying: false }));
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
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: 999, width: 36, height: 36, color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <X size={18} />
                </button>

                {!paymentState.step || paymentState.step === 'packages' ? (
                    <>
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <div style={{
                                width: 56, height: 56,
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                                borderRadius: 14,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem',
                                boxShadow: '0 10px 24px rgba(99, 102, 241, 0.35)',
                            }}>
                                <CreditCard size={26} color="#ffffff" />
                            </div>
                            <h2 style={{ color: '#f8fafc', marginBottom: '0.5rem', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                                Tasarım Paketi Seçin
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                                İhtiyacınıza uygun paketi seçerek kredi yükleyin
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            // 5 paket 2 satira bolunur: [Starter, Basic, Pro] + [Business, Enterprise]
                            // Pro otomatik 1. satirin saginda (vurgulu EN POPULER pill ile)
                            // Responsive: 1040px+ → 3 sutun, 720px → 2 sutun, 350px → 1 sutun
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: 14,
                            marginBottom: '1.5rem',
                        }}>
                            {PACKAGES_PLANS.map((plan) => (
                                <button
                                    key={plan.name}
                                    type="button"
                                    onClick={() => handlePlanSelect(plan)}
                                    aria-label={`${plan.count} tasarım için ${plan.price} TL paketi seç`}
                                    style={{
                                        position: 'relative',
                                        padding: '20px 16px',
                                        background: plan.popular
                                            ? 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(14,165,233,0.10) 100%)'
                                            : 'rgba(255,255,255,0.04)',
                                        border: plan.popular ? '2px solid #6366f1' : '1px solid rgba(148, 163, 184, 0.14)',
                                        borderRadius: 14,
                                        cursor: 'pointer',
                                        transition: 'transform 0.18s, border-color 0.18s, background 0.18s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6,
                                        textAlign: 'left',
                                        fontFamily: 'inherit',
                                        color: '#f8fafc',
                                        boxShadow: plan.popular ? '0 16px 40px rgba(99, 102, 241, 0.25)' : 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.borderColor = plan.accent;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = plan.popular
                                            ? '#6366f1'
                                            : 'rgba(148, 163, 184, 0.14)';
                                    }}
                                >
                                    {plan.popular && (
                                        <div style={{
                                            position: 'absolute',
                                            top: -10,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            padding: '3px 10px',
                                            background: 'linear-gradient(90deg, #6366f1, #0ea5e9)',
                                            color: '#fff',
                                            fontSize: 10,
                                            fontWeight: 700,
                                            borderRadius: 999,
                                            letterSpacing: 1.5,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                        }}>
                                            <Sparkles size={10} /> EN POPÜLER
                                        </div>
                                    )}

                                    <div style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: plan.accent,
                                        textTransform: 'uppercase',
                                        letterSpacing: 1.5,
                                    }}>
                                        {plan.name}
                                    </div>

                                    <div style={{
                                        fontSize: 26,
                                        fontWeight: 800,
                                        color: '#f8fafc',
                                        letterSpacing: '-0.02em',
                                        marginTop: 2,
                                    }}>
                                        {plan.price.toLocaleString('tr-TR')}
                                        <span style={{ fontSize: 15, color: '#94a3b8', fontWeight: 600 }}> TL</span>
                                    </div>

                                    <div style={{
                                        fontSize: 12,
                                        color: '#94a3b8',
                                    }}>
                                        {plan.count} tasarım hakkı · {plan.perUnit} TL / tasarım
                                    </div>

                                    <div style={{
                                        marginTop: 10,
                                        width: '100%',
                                        padding: '8px 12px',
                                        background: plan.popular
                                            ? 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)'
                                            : 'rgba(255,255,255,0.06)',
                                        color: '#fff',
                                        border: plan.popular ? 'none' : '1px solid rgba(148, 163, 184, 0.18)',
                                        borderRadius: 10,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        textAlign: 'center',
                                    }}>
                                        Seç
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '0.875rem',
                                    fontFamily: 'inherit',
                                }}
                            >
                                İşlemi İptal Et
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                            <button
                                type="button"
                                onClick={() => setPaymentState(prev => ({ ...prev, step: 'packages' }))}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    marginBottom: '1rem',
                                    fontSize: '0.875rem',
                                    fontFamily: 'inherit',
                                    padding: 4,
                                }}
                            >
                                <ChevronLeft size={18} /> Paketlere Dön
                            </button>
                            <h2 style={{ color: '#f8fafc', marginBottom: '0.5rem', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                                Ödeme Bilgileri
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                                <span style={{ color: '#10b981', fontWeight: 700 }}>
                                    {paymentState.amount?.toLocaleString('tr-TR')} ₺
                                </span>{' '}
                                tutarındaki ödemeniz için kart bilgilerinizi giriniz.
                            </p>
                        </div>

                        <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.6, textTransform: 'uppercase', display: 'block' }}>
                                    Kart Numarası
                                </label>
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.55)',
                                        border: '1px solid rgba(148, 163, 184, 0.18)',
                                        borderRadius: 12,
                                        padding: '14px 16px',
                                        color: '#f8fafc',
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.6, textTransform: 'uppercase', display: 'block' }}>
                                        Kart Sahibi (Ad Soyad)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ad Soyad"
                                        required
                                        style={{
                                            width: '100%',
                                            background: 'rgba(15, 23, 42, 0.55)',
                                            border: '1px solid rgba(148, 163, 184, 0.18)',
                                            borderRadius: 12,
                                            padding: '14px 16px',
                                            color: '#f8fafc',
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.6, textTransform: 'uppercase', display: 'block' }}>
                                            SKT
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="AA/YY"
                                            required
                                            style={{
                                                width: '100%',
                                                background: 'rgba(15, 23, 42, 0.55)',
                                                border: '1px solid rgba(148, 163, 184, 0.18)',
                                                borderRadius: 12,
                                                padding: '14px 16px',
                                                color: '#f8fafc',
                                                fontSize: '0.95rem',
                                                fontFamily: 'inherit',
                                                outline: 'none',
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.6, textTransform: 'uppercase', display: 'block' }}>
                                            CVC
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="***"
                                            required
                                            style={{
                                                width: '100%',
                                                background: 'rgba(15, 23, 42, 0.55)',
                                                border: '1px solid rgba(148, 163, 184, 0.18)',
                                                borderRadius: 12,
                                                padding: '14px 16px',
                                                color: '#f8fafc',
                                                fontSize: '0.95rem',
                                                fontFamily: 'inherit',
                                                outline: 'none',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={paymentState.isPaying}
                                style={{
                                    marginTop: '0.75rem',
                                    padding: '14px',
                                    background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 12,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    fontFamily: 'inherit',
                                    cursor: paymentState.isPaying ? 'wait' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    boxShadow: '0 12px 28px rgba(99, 102, 241, 0.35)',
                                    opacity: paymentState.isPaying ? 0.75 : 1,
                                    transition: 'transform 0.15s, box-shadow 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    if (paymentState.isPaying) return;
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {paymentState.isPaying ? 'İşleniyor...' : (
                                    <>
                                        <ShieldCheck size={18} /> Güvenli Öde ({paymentState.amount?.toLocaleString('tr-TR')} ₺)
                                    </>
                                )}
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#64748b', fontSize: '0.8rem' }}>
                                <ShieldCheck size={14} />
                                <span>256-bit SSL şifreleme ile ödemeniz güvendedir.</span>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};