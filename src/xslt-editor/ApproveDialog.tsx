import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, Loader2, X, AlertTriangle, Lock } from 'lucide-react';
import { api } from '../api';
import { isValidLicenseId, normalizeLicenseId } from '../../shared/license-lock.js';
import { useLocaleT } from '../i18n';

interface ApproveDialogProps {
    defaultName: string;
    onTestDownload: () => void;
    /** Hata fırlatırsa ekran açık kalır ve mesaj gösterilir. */
    onApprove: (name: string, taxId: string) => Promise<void>;
    onBuy: () => void;
    onClose: () => void;
}

const PagePreview: React.FC<{ test: boolean }> = ({ test }) => (
    <div style={{
        position: 'relative', width: 92, height: 124, borderRadius: 6, background: '#f8fafc',
        boxShadow: '0 4px 14px rgba(0,0,0,0.35)', overflow: 'hidden', padding: 10, boxSizing: 'border-box',
    }}>
        {[70, 46, 58, 100, 100, 100, 64].map((w, i) => (
            <div key={i} style={{ height: i > 2 ? 6 : 5, width: `${w}%`, marginBottom: i === 2 ? 12 : 6, borderRadius: 2, background: i > 2 ? '#cbd5e1' : '#94a3b8' }} />
        ))}
        {test && (
            <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(220,38,38,0.45)', fontWeight: 900, fontSize: 30, letterSpacing: 3, transform: 'rotate(-30deg)',
            }}>
                TEST
            </div>
        )}
    </div>
);

/** Onay ekranı: tasarım onaylanınca TEST yazısız dosya indirilir, 1 tasarım hakkı düşer. */
export const ApproveDialog: React.FC<ApproveDialogProps> = ({ defaultName, onTestDownload, onApprove, onBuy, onClose }) => {
    const { t } = useLocaleT();
    const [name, setName] = useState(defaultName);
    const [taxInput, setTaxInput] = useState('');
    const [checked, setChecked] = useState(false);
    const [credits, setCredits] = useState<number | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.getMe()
            .then((me: { credits?: number; role?: string }) => {
                setCredits(typeof me.credits === 'number' ? me.credits : null);
                setIsAdmin(me.role === 'admin');
            })
            .catch(() => setCredits(null));
    }, []);

    const noCredits = !isAdmin && credits !== null && credits <= 0;
    const taxId = normalizeLicenseId(taxInput);
    const taxValid = isValidLicenseId(taxId);
    const taxError = !taxId || taxValid ? null
        : /^\s*[a-z]{2}/i.test(taxInput) ? t('editor.approve.vatInvalid')
        : taxId.length !== 10 && taxId.length !== 11 ? t('editor.approve.taxLength')
        : !taxValid ? t('editor.approve.taxInvalid', { kind: taxId.length === 10 ? 'VKN' : 'TCKN' })
        : null;
    const canApprove = !busy && checked && !!name.trim() && taxValid && !noCredits;

    const approve = async () => {
        setBusy(true);
        setError(null);
        try {
            await onApprove(name.trim(), taxId);
        } catch (e) {
            setError((e as Error).message);
            setBusy(false);
        }
    };

    return (
        <div
            data-approve-dialog
            style={{
                position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(49, 46, 129, 0.35)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
        >
            <div style={{
                position: 'relative', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
                background: 'linear-gradient(180deg, #f7f8ff 0%, #ffffff 100%)', color: '#1e293b',
                border: '1px solid #c7d2fe', borderRadius: 16, padding: '28px 28px 24px',
                boxShadow: '0 24px 60px rgba(79, 70, 229, 0.25)',
            }}>
                <button
                    onClick={onClose}
                    aria-label={t('editor.approve.close')}
                    style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#5b6680', cursor: 'pointer' }}
                >
                    <X size={18} />
                </button>

                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{t('editor.approve.title')}</h2>
                <p style={{ margin: '6px 0 20px', fontSize: 13, color: '#5b6680', lineHeight: 1.5 }}>
                    {t('editor.approve.intro')}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 22 }}>
                    <div style={{ textAlign: 'center' }}>
                        <PagePreview test />
                        <div style={{ fontSize: 11, color: '#c2410c', marginTop: 8, fontWeight: 600 }}>{t('editor.approve.testFile')}</div>
                    </div>
                    <div style={{ fontSize: 22, color: '#6b7690' }}>→</div>
                    <div style={{ textAlign: 'center' }}>
                        <PagePreview test={false} />
                        <div style={{ fontSize: 11, color: '#059669', marginTop: 8, fontWeight: 600 }}>{t('editor.approve.approvedFile')}</div>
                    </div>
                </div>

                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>{t('editor.approve.name')}</label>
                <input
                    data-approve-name
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={200}
                    style={{
                        width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, fontSize: 14,
                        background: '#ffffff', border: '1px solid rgba(148, 163, 184, 0.25)', color: '#0f172a',
                        marginBottom: 16, fontFamily: 'inherit',
                    }}
                />

                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    {t('editor.approve.taxLabel')}
                </label>
                <input
                    data-approve-tax-id
                    value={taxInput}
                    onChange={e => setTaxInput(e.target.value)}
                    autoComplete="off"
                    maxLength={24}
                    placeholder={t('editor.approve.taxPlaceholder')}
                    style={{
                        width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, fontSize: 15,
                        letterSpacing: 1, fontFamily: 'monospace', background: '#ffffff', color: '#0f172a',
                        border: `1px solid ${taxError ? 'rgba(239, 68, 68, 0.6)' : taxValid ? 'rgba(16, 185, 129, 0.6)' : '#c7cfe6'}`,
                    }}
                />
                <div data-approve-tax-note style={{ fontSize: 12, lineHeight: 1.5, margin: '6px 0 16px', color: taxError ? '#dc2626' : '#5b6680' }}>
                    {taxError ?? t('editor.approve.taxNote')}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <li style={{ display: 'flex', gap: 8 }}>
                        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                        <span>
                            {t('editor.approve.usesCredit')}
                            {isAdmin ? ` (${t('editor.approve.adminFree')})` : credits !== null ? ` · ${t('editor.approve.creditsLeft', { credits })}` : ''}
                        </span>
                    </li>
                    <li style={{ display: 'flex', gap: 8 }}>
                        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                        <span>{t('editor.approve.savedNote')}</span>
                    </li>
                    <li data-approve-lock-note style={{ display: 'flex', gap: 8, color: '#dc2626', fontWeight: 600 }}>
                        <Lock size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                        <span>{t('editor.approve.lockNote')}</span>
                    </li>
                </ul>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 16,
                    background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: 12, color: '#b45309',
                }}>
                    <span style={{ flex: 1, lineHeight: 1.5 }}>
                        {t('editor.approve.testNote')}
                    </span>
                    <button
                        type="button"
                        data-approve-test
                        onClick={onTestDownload}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 7, cursor: 'pointer',
                            background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.5)', color: '#c2410c',
                            fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', fontFamily: 'inherit',
                        }}
                    >
                        <Download size={13} /> {t('editor.toolbar.testDownload')}
                    </button>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#334155', marginBottom: 18, cursor: 'pointer' }}>
                    <input data-approve-check type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ marginTop: 2 }} />
                    {t('editor.approve.confirmCheck')}
                </label>

                {noCredits && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, marginBottom: 14,
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.35)', fontSize: 13, color: '#dc2626',
                    }}>
                        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{t('editor.approve.noCredits')}</span>
                        <button
                            type="button"
                            onClick={onBuy}
                            style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: '#6366f1', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            {t('editor.approve.buy')}
                        </button>
                    </div>
                )}

                {error && (
                    <div data-approve-error style={{ padding: '10px 12px', borderRadius: 10, marginBottom: 14, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.35)', fontSize: 13, color: '#dc2626' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ padding: '10px 16px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#334155', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        {t('editor.common.cancel')}
                    </button>
                    <button
                        type="button"
                        data-approve-confirm
                        disabled={!canApprove}
                        onClick={approve}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, border: 'none',
                            background: canApprove ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(100, 116, 139, 0.4)',
                            color: 'white', fontWeight: 700, cursor: canApprove ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                        }}
                    >
                        {busy ? <Loader2 size={15} className="spin" /> : <CheckCircle2 size={15} />}
                        {t('editor.approve.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApproveDialog;
