import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck, X, Sparkles, Check, XCircle } from 'lucide-react';
import { api } from './api';
import { PACKAGES_PLANS, formatPrice, perDesignPrice, planFeatureText, usePriceCurrency, type PackagePlan, type PlanId, type PriceCurrency } from './pricing';
import { parseBilling } from '../shared/invoice-billing.js';
import { useUiStore } from './store/uiStore';
import { theme } from './theme';
import i18n, { useLocaleT } from './i18n';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCredits: number) => void;
    /** Verilirse paket listesi atlanır, doğrudan bu paketin ödemesi açılır. */
    initialPlan?: PlanId;
}

type PartyType = 'company' | 'sole';

interface BillingForm {
    partyType: PartyType;
    title: string;
    taxId: string;
    taxOffice: string;
    city: string;
    address: string;
}

const EMPTY_BILLING: BillingForm = { partyType: 'company', title: '', taxId: '', taxOffice: '', city: '', address: '' };

type Step =
    | { step: 'packages' }
    | { step: 'billing'; plan: PackagePlan }
    | { step: 'starting'; plan: PackagePlan }
    | { step: 'paying'; plan: PackagePlan; oid: string; iframeUrl: string; testMode: boolean; confirming: boolean }
    | { step: 'done'; plan: PackagePlan; credits: number | null }
    | { step: 'failed'; plan: PackagePlan; message: string };

const POLL_MS = 3000;
const RESIZER_SRC = 'https://www.paytr.com/js/iframeResizer.min.js';

type ResizerWindow = Window & { iFrameResize?: (opts: object, selector: string) => void };

/** PayTR'nin önerdiği iframeResizer betiği; form yüksekliğini içeriğe göre ayarlar. */
const resizeFrame = () => {
    const w = window as ResizerWindow;
    const run = () => w.iFrameResize?.({}, '#paytriframe');
    if (w.iFrameResize) return run();
    if (document.querySelector(`script[src="${RESIZER_SRC}"]`)) return;
    const s = document.createElement('script');
    s.src = RESIZER_SRC;
    s.onload = run;
    document.head.appendChild(s);
};

const requestPayment = async (plan: PackagePlan, billing: BillingForm, currency: PriceCurrency): Promise<Step> => {
    try {
        const r = await api.paytrCheckout(plan.id, billing, currency);
        return { step: 'paying', plan, oid: r.merchantOid, iframeUrl: r.iframeUrl, testMode: r.testMode, confirming: false };
    } catch (err) {
        return { step: 'failed', plan, message: err instanceof Error ? err.message : i18n.t('payment.startFailed') };
    }
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, ...rest }) => (isOpen ? <PaymentDialog {...rest} /> : null);

const fieldStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.8rem', borderRadius: '0.7rem',
    border: `1px solid ${theme.borderStrong}`, background: theme.surface, color: theme.text,
    fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none',
};

const PaymentDialog: React.FC<Omit<PaymentModalProps, 'isOpen'>> = ({ onClose, onSuccess, initialPlan }) => {
    const { t, locale } = useLocaleT();
    const firstPlan = PACKAGES_PLANS.find(p => p.id === initialPlan);
    const [state, setState] = useState<Step>(() => (firstPlan ? { step: 'billing', plan: firstPlan } : { step: 'packages' }));
    const liveCurrency = usePriceCurrency();
    // Paket seçildikten sonra para birimi sabitlenir; ödeme sırasında dil değişse de tutar değişmez.
    const [lockedCurrency, setLockedCurrency] = useState<PriceCurrency | null>(() => (firstPlan ? liveCurrency : null));
    const currency = lockedCurrency ?? liveCurrency;
    const price = (plan: PackagePlan) => formatPrice(plan.prices[currency], currency, locale);
    const [billing, setBilling] = useState<BillingForm>(EMPTY_BILLING);
    const [billingError, setBillingError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        api.paymentBilling()
            .then(r => {
                if (!alive || !r.billing) return;
                const b = r.billing;
                setBilling(prev => {
                    if (prev.title || prev.taxId || prev.taxOffice || prev.city) return prev;
                    return {
                        partyType: b.partyType === 'sole' ? 'sole' : 'company',
                        title: b.title || '',
                        taxId: b.taxId || '',
                        taxOffice: b.taxOffice || '',
                        city: b.city || '',
                        address: b.address && b.address !== b.city ? b.address : '',
                    };
                });
            })
            .catch(() => { /* kayıtlı fatura bilgisi yoksa form boş kalır */ });
        return () => { alive = false; };
    }, []);

    const openBilling = (plan: PackagePlan) => {
        setBillingError(null);
        setLockedCurrency(liveCurrency);
        setState({ step: 'billing', plan });
    };

    const startPayment = (plan: PackagePlan) => {
        const parsed = parseBilling(billing);
        if ('error' in parsed && parsed.error) {
            setBillingError(parsed.error);
            setState({ step: 'billing', plan });
            return;
        }
        if (!('billing' in parsed) || !parsed.billing) return;
        setBillingError(null);
        setState({ step: 'starting', plan });
        void requestPayment(plan, parsed.billing, currency).then(setState);
    };

    const paying = state.step === 'paying' ? state : null;
    const oid = paying?.oid;
    const payingPlan = paying?.plan;

    const onSuccessRef = useRef(onSuccess);
    useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);

    useEffect(() => {
        if (!oid || !payingPlan) return;
        let finished = false;
        const check = async () => {
            if (finished) return;
            try {
                const r = await api.paytrStatus(oid);
                if (finished) return;
                if (r.status === 'success') {
                    finished = true;
                    setState({ step: 'done', plan: payingPlan, credits: r.credits });
                    if (typeof r.credits === 'number') onSuccessRef.current(r.credits);
                    useUiStore.getState().pushToast({
                        kind: 'success',
                        title: i18n.t('payment.successTitle'),
                        description: `${i18n.t('payment.successText', { credits: i18n.t('pricing.credits', { count: payingPlan.credits }) })}.`,
                        ttl: 8000,
                    });
                } else if (r.status === 'failed') {
                    finished = true;
                    setState({ step: 'failed', plan: payingPlan, message: i18n.t('payment.declined') });
                }
            } catch { /* bir sonraki denemede tekrar sorulur */ }
        };
        resizeFrame();
        const timer = window.setInterval(() => void check(), POLL_MS);
        const onMessage = (e: MessageEvent) => {
            if (e.origin !== window.location.origin || e.data?.type !== 'paytr-result') return;
            setState(s => (s.step === 'paying' ? { ...s, confirming: true } : s));
            void check();
        };
        window.addEventListener('message', onMessage);
        return () => {
            finished = true;
            window.clearInterval(timer);
            window.removeEventListener('message', onMessage);
        };
    }, [oid, payingPlan]);

    const backToPackages = () => {
        setLockedCurrency(null);
        setState({ step: 'packages' });
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)',
            padding: '2rem'
        }}>
            <div data-payment-modal={state.step} style={{
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                padding: state.step === 'paying' || state.step === 'billing' ? '1.5rem 1.25rem' : '2.5rem 2rem',
                borderRadius: '1.5rem',
                maxWidth: state.step === 'paying' ? '720px' : state.step === 'billing' ? '560px' : '960px',
                width: '100%',
                position: 'relative',
                boxShadow: theme.shadowLg,
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <style>{'@keyframes pm-spin { to { transform: rotate(360deg); } } .pm-spin { animation: pm-spin 0.9s linear infinite; } @media (max-width: 560px) { .pm-bill-grid { grid-template-columns: 1fr !important; } }'}</style>
                <button
                    onClick={onClose}
                    aria-label={t('common.close')}
                    style={{
                        position: 'absolute', top: '1.25rem', right: '1.25rem',
                        background: theme.surfaceAlt,
                        border: `1px solid ${theme.border}`,
                        color: theme.textMuted, cursor: 'pointer', padding: '0.4rem', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                    }}
                >
                    <X size={18} />
                </button>

                {state.step === 'packages' && (
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
                                <Sparkles size={11} /> {t('payment.badge')}
                            </div>
                            <h2 style={{ color: theme.text, fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                                {t('payment.title')}
                            </h2>
                            <p style={{ color: theme.textMuted, fontSize: '0.95rem', margin: '0.5rem 0 0' }}>
                                {t('payment.subtitle')}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                        {PACKAGES_PLANS.map((plan) => (
                            <button
                                key={plan.id}
                                type="button"
                                data-buy-plan={plan.id}
                                onClick={() => openBilling(plan)}
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
                                            {t('pricing.best')}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, marginBottom: '0.25rem' }}>
                                    {price(plan)}
                                </div>
                                <div style={{ color: theme.textMuted, fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    {t('payment.perDesign', {
                                        credits: t('pricing.credits', { count: plan.credits }),
                                        price: formatPrice(perDesignPrice(plan, currency), currency, locale),
                                    })}
                                </div>
                                <div style={{ flex: 1 }}>
                                    {plan.features.map(f => (
                                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: theme.textMuted, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                                            <Check size={14} color={theme.green} style={{ flexShrink: 0, marginTop: 2 }} /> {planFeatureText(t, plan, f)}
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
                                    {t('payment.buy')}
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
                                <strong style={{ color: theme.text }}>{t('payment.secureTitle')}</strong>{' '}
                                {t('payment.secureText')}
                            </div>
                        </div>
                    </>
                )}

                {state.step === 'billing' && (
                    <form data-payment-billing onSubmit={e => { e.preventDefault(); startPayment(state.plan); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <button type="button" onClick={backToPackages} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: theme.primary,
                            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: 0, alignSelf: 'flex-start',
                        }}>
                            <ArrowLeft size={14} /> {t('payment.packages')}
                        </button>
                        <div>
                            <h2 style={{ color: theme.text, fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{t('payment.billingTitle')}</h2>
                            <p style={{ color: theme.textMuted, fontSize: '0.88rem', margin: '0.35rem 0 0' }}>
                                {t('payment.billingSub', { plan: state.plan.name, price: price(state.plan) })}
                            </p>
                        </div>
                        <div className="pm-bill-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {([
                                ['company', t('payment.partyCompany')],
                                ['sole', t('payment.partySole')],
                            ] as const).map(([id, label]) => {
                                const on = billing.partyType === id;
                                return (
                                    <button key={id} type="button" data-billing-party={id} onClick={() => { setBilling(b => ({ ...b, partyType: id, taxId: '' })); setBillingError(null); }}
                                        style={{
                                            padding: '0.7rem', borderRadius: '0.7rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                                            border: on ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`,
                                            background: on ? theme.primarySoft : theme.surface, color: on ? theme.primary : theme.text,
                                        }}>
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: theme.textMuted, fontSize: '0.78rem', fontWeight: 700 }}>
                            {t('payment.titleLabel')}
                            <input data-billing-title required value={billing.title} onChange={e => setBilling(b => ({ ...b, title: e.target.value }))}
                                placeholder={billing.partyType === 'sole' ? t('payment.titlePhSole') : t('payment.titlePhCompany')} style={fieldStyle} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: theme.textMuted, fontSize: '0.78rem', fontWeight: 700 }}>
                            {billing.partyType === 'sole' ? t('payment.taxIdSole') : t('payment.taxIdCompany')}
                            <input data-billing-tax inputMode="numeric" autoComplete="off" required value={billing.taxId}
                                onChange={e => setBilling(b => ({ ...b, taxId: e.target.value.replace(/\D/g, '').slice(0, billing.partyType === 'sole' ? 11 : 10) }))}
                                placeholder={billing.partyType === 'sole' ? t('payment.digits11') : t('payment.digits10')} style={fieldStyle} />
                        </label>
                        <div className="pm-bill-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: theme.textMuted, fontSize: '0.78rem', fontWeight: 700 }}>
                                {t('payment.taxOffice')}
                                <input data-billing-office required value={billing.taxOffice} onChange={e => setBilling(b => ({ ...b, taxOffice: e.target.value }))} style={fieldStyle} />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: theme.textMuted, fontSize: '0.78rem', fontWeight: 700 }}>
                                {t('payment.city')}
                                <input data-billing-city required value={billing.city} onChange={e => setBilling(b => ({ ...b, city: e.target.value }))} style={fieldStyle} />
                            </label>
                        </div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: theme.textMuted, fontSize: '0.78rem', fontWeight: 700 }}>
                            {t('payment.address')}
                            <input data-billing-address value={billing.address} onChange={e => setBilling(b => ({ ...b, address: e.target.value }))}
                                placeholder={t('payment.addressPh')} style={fieldStyle} />
                        </label>
                        {billingError && (
                            <div data-billing-error style={{ padding: '0.7rem 0.8rem', borderRadius: '0.7rem', background: theme.redSoft, color: theme.redText, fontSize: '0.85rem' }}>
                                {billingError}
                            </div>
                        )}
                        <button type="submit" data-billing-submit style={{
                            marginTop: '0.2rem', padding: '0.8rem', borderRadius: '0.7rem', border: 'none', cursor: 'pointer',
                            background: theme.gradient, color: 'white', fontWeight: 800, fontFamily: 'inherit', boxShadow: theme.shadowBrand,
                        }}>
                            {t('payment.submit', { price: price(state.plan) })}
                        </button>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: theme.textSubtle, lineHeight: 1.45 }}>
                            {t('payment.billingNote')}
                        </p>
                    </form>
                )}

                {state.step === 'starting' && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Loader2 size={44} color={theme.primary} className="pm-spin" />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.text, margin: 0 }}>
                            {t('payment.preparing')}
                        </h3>
                        <p style={{ color: theme.textMuted, fontSize: '0.9rem', margin: 0 }}>
                            {t('payment.planLine', { plan: state.plan.name, price: price(state.plan) })}
                        </p>
                    </div>
                )}

                {paying && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '0 2.5rem 0.75rem 0' }}>
                            <button type="button" onClick={backToPackages} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: theme.primary,
                                cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: 0,
                            }}>
                                <ArrowLeft size={14} /> {t('payment.packages')}
                            </button>
                            <strong style={{ color: theme.text, fontSize: '1rem' }}>
                                {t('payment.planLine', { plan: paying.plan.name, price: price(paying.plan) })}
                            </strong>
                            <span style={{ color: theme.textMuted, fontSize: '0.8rem' }}>{t('pricing.credits', { count: paying.plan.credits })}</span>
                            {paying.testMode && (
                                <span data-payment-test-mode style={{
                                    fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                                    background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d',
                                }}>
                                    {t('payment.testMode')}
                                </span>
                            )}
                        </div>
                        {paying.confirming && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0.8rem', marginBottom: '0.75rem',
                                borderRadius: 10, background: theme.primarySoft, color: theme.primary, fontSize: '0.85rem', fontWeight: 600,
                            }}>
                                <Loader2 size={16} className="pm-spin" />
                                {t('payment.confirming')}
                            </div>
                        )}
                        <iframe
                            id="paytriframe"
                            title={t('payment.frameTitle')}
                            src={paying.iframeUrl}
                            frameBorder={0}
                            scrolling="no"
                            style={{ width: '100%', minHeight: 560, border: 'none', display: 'block' }}
                        />
                        <p style={{ margin: '0.6rem 0 0', textAlign: 'center', fontSize: '0.78rem', color: theme.textMuted }}>
                            {t('payment.formMissing')}{' '}
                            <a href={paying.iframeUrl} target="_blank" rel="noopener noreferrer" data-payment-open-tab style={{ color: theme.primary, fontWeight: 700 }}>
                                {t('payment.openTab')}
                            </a>
                            {' '}{t('payment.autoUpdate')}
                        </p>
                    </>
                )}

                {state.step === 'done' && (
                    <div data-payment-result="success" style={{ textAlign: 'center', padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem' }}>
                        <CheckCircle2 size={52} color={theme.green} />
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: theme.text, margin: 0 }}>{t('payment.successTitle')}</h3>
                        <p style={{ color: theme.textMuted, fontSize: '0.95rem', margin: 0 }}>
                            {t('payment.successText', { credits: t('pricing.credits', { count: state.plan.credits }) })}
                            {typeof state.credits === 'number' ? t('payment.successTotal', { total: state.credits }) : ''}.
                        </p>
                        <button type="button" onClick={onClose} style={{
                            marginTop: '0.5rem', padding: '0.7rem 1.6rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer',
                            background: theme.gradient, color: 'white', fontWeight: 700, fontFamily: 'inherit', boxShadow: theme.shadowBrand,
                        }}>
                            {t('payment.continue')}
                        </button>
                    </div>
                )}

                {state.step === 'failed' && (
                    <div data-payment-result="failed" style={{ textAlign: 'center', padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem' }}>
                        <XCircle size={52} color={theme.redText} />
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: theme.text, margin: 0 }}>{t('payment.failedTitle')}</h3>
                        <p style={{ color: theme.textMuted, fontSize: '0.95rem', margin: 0, maxWidth: 460 }}>{state.message}</p>
                        <div style={{ display: 'flex', gap: 10, marginTop: '0.5rem' }}>
                            <button type="button" onClick={() => startPayment(state.plan)} style={{
                                padding: '0.7rem 1.4rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer',
                                background: theme.gradient, color: 'white', fontWeight: 700, fontFamily: 'inherit',
                            }}>
                                {t('payment.retry')}
                            </button>
                            <button type="button" onClick={backToPackages} style={{
                                padding: '0.7rem 1.4rem', borderRadius: '0.6rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                                border: `1px solid ${theme.borderStrong}`, background: theme.surface, color: theme.text,
                            }}>
                                {t('payment.backToPackages')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
