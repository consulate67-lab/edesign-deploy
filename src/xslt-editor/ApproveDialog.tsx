import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, Loader2, X, AlertTriangle, Lock } from 'lucide-react';
import { api } from '../api';

interface ApproveDialogProps {
    defaultName: string;
    onTestDownload: () => void;
    /** Hata fırlatırsa ekran açık kalır ve mesaj gösterilir. */
    onApprove: (name: string) => Promise<void>;
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
    const [name, setName] = useState(defaultName);
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
    const canApprove = !busy && checked && !!name.trim() && !noCredits;

    const approve = async () => {
        setBusy(true);
        setError(null);
        try {
            await onApprove(name.trim());
        } catch (e) {
            setError((e as Error).message);
            setBusy(false);
        }
    };

    return (
        <div
            data-approve-dialog
            style={{
                position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
        >
            <div style={{
                position: 'relative', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
                background: 'linear-gradient(180deg, #0b1224 0%, #0a0f1f 100%)', color: '#e2e8f0',
                border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: 16, padding: '28px 28px 24px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
            }}>
                <button
                    onClick={onClose}
                    aria-label="Kapat"
                    style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                    <X size={18} />
                </button>

                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f8fafc' }}>Tasarımı Onayla</h2>
                <p style={{ margin: '6px 0 20px', fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                    Onayladığınızda TEST yazısı kaldırılmış, kullanıma hazır XSLT dosyanız indirilir.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 22 }}>
                    <div style={{ textAlign: 'center' }}>
                        <PagePreview test />
                        <div style={{ fontSize: 11, color: '#fcd34d', marginTop: 8, fontWeight: 600 }}>Test dosyası</div>
                    </div>
                    <div style={{ fontSize: 22, color: '#64748b' }}>→</div>
                    <div style={{ textAlign: 'center' }}>
                        <PagePreview test={false} />
                        <div style={{ fontSize: 11, color: '#6ee7b7', marginTop: 8, fontWeight: 600 }}>Onaylı dosya</div>
                    </div>
                </div>

                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Tasarım adı</label>
                <input
                    data-approve-name
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={200}
                    style={{
                        width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, fontSize: 14,
                        background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.25)', color: '#f1f5f9',
                        marginBottom: 16, fontFamily: 'inherit',
                    }}
                />

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <li style={{ display: 'flex', gap: 8 }}>
                        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                        <span>
                            1 tasarım hakkı kullanılır
                            {isAdmin ? ' (yönetici: düşülmez)' : credits !== null ? ` · kalan hakkınız: ${credits}` : ''}
                        </span>
                    </li>
                    <li style={{ display: 'flex', gap: 8 }}>
                        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                        <span>Tasarım hesabınıza kaydedilir; "Tasarımlarım" bölümünden istediğiniz zaman ücretsiz tekrar indirebilirsiniz.</span>
                    </li>
                    <li data-approve-lock-note style={{ display: 'flex', gap: 8, color: '#fca5a5', fontWeight: 600 }}>
                        <Lock size={16} color="#f87171" style={{ flexShrink: 0 }} />
                        <span>Onaydan sonra tasarım kilitlenir: tekrar düzenlenemez, yalnızca indirilebilir.</span>
                    </li>
                </ul>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 16,
                    background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: 12, color: '#fde68a',
                }}>
                    <span style={{ flex: 1, lineHeight: 1.5 }}>
                        Henüz denemediyseniz önce test dosyasını indirip kendi sisteminizde kontrol edin. Test indirme ücretsizdir.
                    </span>
                    <button
                        type="button"
                        data-approve-test
                        onClick={onTestDownload}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 7, cursor: 'pointer',
                            background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.5)', color: '#fcd34d',
                            fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', fontFamily: 'inherit',
                        }}
                    >
                        <Download size={13} /> Test İndir
                    </button>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#cbd5e1', marginBottom: 18, cursor: 'pointer' }}>
                    <input data-approve-check type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ marginTop: 2 }} />
                    Tasarımı kontrol ettim, onaylıyorum. Onaydan sonra değişiklik yapamayacağımı biliyorum.
                </label>

                {noCredits && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, marginBottom: 14,
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.35)', fontSize: 13, color: '#fca5a5',
                    }}>
                        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>Tasarım hakkınız kalmadı. Onaylamak için paket alın.</span>
                        <button
                            type="button"
                            onClick={onBuy}
                            style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: '#6366f1', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            Paket Al
                        </button>
                    </div>
                )}

                {error && (
                    <div data-approve-error style={{ padding: '10px 12px', borderRadius: 10, marginBottom: 14, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.35)', fontSize: 13, color: '#fca5a5' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ padding: '10px 16px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#cbd5e1', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        Vazgeç
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
                        Onayla ve İndir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApproveDialog;
