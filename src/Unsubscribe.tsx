import React, { useState } from 'react';
import { API_URL } from './api';
import { theme } from './theme';

type State = 'idle' | 'busy' | 'done' | 'error';

/** E-postadaki "listeden çık" bağlantısının açtığı sayfa; bağlantı tarayıcılar tarafından önceden açılabildiği için onay düğmesi ister. */
export const Unsubscribe: React.FC<{ token: string }> = ({ token }) => {
    const [state, setState] = useState<State>('idle');
    const [message, setMessage] = useState('');

    const confirm = async () => {
        setState('busy');
        try {
            const res = await fetch(`${API_URL}/mail/unsubscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ u: token }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'İşlem tamamlanamadı.');
            setState('done');
        } catch (e) {
            setMessage(e instanceof Error ? e.message : 'İşlem tamamlanamadı.');
            setState('error');
        }
    };

    return (
        <div style={{ width: '100%', minHeight: '100vh', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, fontFamily: theme.font, padding: 20 }}>
            <div style={{ width: 'min(460px, 100%)', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 18, boxShadow: theme.shadow, padding: 32, textAlign: 'center' }}>
                <img src="logo-300x100.png" alt="edXdocu" width={180} height={60} style={{ display: 'block', margin: '0 auto 18px' }} />
                {state === 'done' ? (
                    <>
                        <h1 style={{ fontSize: '1.3rem', margin: '0 0 10px', color: theme.text }}>Listeden çıkarıldınız</h1>
                        <p style={{ margin: 0, color: theme.textMuted, lineHeight: 1.6, fontSize: '0.95rem' }}>
                            Size bir daha tanıtım e-postası gönderilmeyecek. Hesabınızla ilgili zorunlu bildirimler (ör. giriş kodu) bundan etkilenmez.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 style={{ fontSize: '1.3rem', margin: '0 0 10px', color: theme.text }}>Tanıtım e-postalarından çık</h1>
                        <p style={{ margin: '0 0 22px', color: theme.textMuted, lineHeight: 1.6, fontSize: '0.95rem' }}>
                            edXdocu tanıtım e-postalarını artık almak istemiyorsanız aşağıdaki düğmeye basın.
                        </p>
                        {state === 'error' && <p style={{ margin: '0 0 16px', color: theme.redText, fontSize: '0.9rem' }}>{message}</p>}
                        <button
                            type="button"
                            disabled={state === 'busy'}
                            onClick={() => void confirm()}
                            style={{
                                padding: '12px 22px', borderRadius: 12, border: 'none', background: theme.primary, color: '#fff',
                                fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit', cursor: state === 'busy' ? 'wait' : 'pointer', opacity: state === 'busy' ? 0.7 : 1,
                            }}
                        >
                            {state === 'busy' ? 'İşleniyor…' : 'Listeden çık'}
                        </button>
                    </>
                )}
                <p style={{ margin: '24px 0 0', fontSize: '0.85rem' }}>
                    <a href="/" style={{ color: theme.primary, fontWeight: 600 }}>edxdocu.com'a git</a>
                </p>
            </div>
        </div>
    );
};
