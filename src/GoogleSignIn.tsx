import React, { useEffect, useRef, useState } from 'react';
import { api } from './api';
import { theme } from './theme';
import { useLocaleT } from './i18n';

interface GoogleIdApi {
    initialize: (config: { client_id: string; callback: (r: { credential?: string }) => void; ux_mode?: 'popup'; context?: string }) => void;
    renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
}
declare global {
    interface Window { google?: { accounts?: { id?: GoogleIdApi } } }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client';
let gsiLoading: Promise<GoogleIdApi> | null = null;

const loadGsi = (): Promise<GoogleIdApi> => {
    if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
    gsiLoading ??= new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = GSI_SRC;
        s.async = true;
        s.onload = () => (window.google?.accounts?.id ? resolve(window.google.accounts.id) : reject(new Error('gsi')));
        s.onerror = () => { gsiLoading = null; reject(new Error('gsi')); };
        document.head.appendChild(s);
    });
    return gsiLoading;
};

let clientIdCache: Promise<string | null> | null = null;

/**
 * Google'ın resmi "Google ile devam et" düğmesi. Sunucuda istemci kimliği
 * tanımlı değilse hiçbir şey çizilmez. Başarılı girişte oturum belirteci
 * kaydedilir; `created` yeni açılan hesabı bildirir.
 */
export const GoogleSignIn: React.FC<{
    mode: 'login' | 'register';
    onSuccess: (created: boolean) => void;
    onError: (message: string) => void;
}> = ({ mode, onSuccess, onError }) => {
    const { t, locale } = useLocaleT();
    const boxRef = useRef<HTMLDivElement>(null);
    const [clientId, setClientId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const handlers = useRef({ onSuccess, onError, t });
    useEffect(() => { handlers.current = { onSuccess, onError, t }; });

    useEffect(() => {
        let alive = true;
        clientIdCache ??= api.googleClientId();
        clientIdCache.then(id => { if (alive) setClientId(id); });
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        if (!clientId) return;
        let alive = true;
        loadGsi().then(gsi => {
            const box = boxRef.current;
            if (!alive || !box) return;
            gsi.initialize({
                client_id: clientId,
                ux_mode: 'popup',
                context: mode === 'login' ? 'signin' : 'signup',
                callback: async ({ credential }) => {
                    const h = handlers.current;
                    if (!credential) return h.onError(h.t('auth.googleFailed'));
                    setBusy(true);
                    try {
                        const r = await api.googleLogin(credential);
                        api.setToken(r.token);
                        h.onSuccess(!!r.created);
                    } catch (e) {
                        h.onError((e as Error).message || h.t('auth.googleFailed'));
                    } finally {
                        setBusy(false);
                    }
                },
            });
            box.innerHTML = '';
            gsi.renderButton(box, {
                type: 'standard', theme: 'outline', size: 'large', shape: 'pill', logo_alignment: 'left',
                text: mode === 'login' ? 'signin_with' : 'signup_with',
                width: Math.min(400, Math.max(200, Math.round(box.clientWidth))),
                locale,
            });
        }).catch(() => { if (alive) setClientId(null); });
        return () => { alive = false; };
    }, [clientId, mode, locale]);

    if (!clientId) return null;
    return (
        <div data-google-signin style={{ marginBottom: 18 }}>
            <div ref={boxRef} style={{ display: 'flex', justifyContent: 'center', minHeight: 44, opacity: busy ? 0.6 : 1, pointerEvents: busy ? 'none' : 'auto' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, color: theme.textSubtle, fontSize: 12, fontWeight: 600 }}>
                <span style={{ flex: 1, height: 1, background: theme.border }} />
                {t('auth.orEmail')}
                <span style={{ flex: 1, height: 1, background: theme.border }} />
            </div>
        </div>
    );
};
