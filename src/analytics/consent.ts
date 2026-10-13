/** Ziyaretçinin çerez tercihi; KVKK gereği ölçüm ve reklam çerezleri yalnız açık onayla çalışır. */
export interface Consent {
    analytics: boolean;
    marketing: boolean;
    at: string;
}

const KEY = 'edx-consent';
const OPEN_EVENT = 'edx-consent-open';

type Listener = (c: Consent) => void;
const listeners = new Set<Listener>();

export const readConsent = (): Consent | null => {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (raw && typeof raw.analytics === 'boolean' && typeof raw.marketing === 'boolean') return raw as Consent;
    } catch { /* bozuk kayıt: yeniden sorulur */ }
    return null;
};

export const saveConsent = (analytics: boolean, marketing: boolean) => {
    const c: Consent = { analytics, marketing, at: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* gizli mod: yalnız bu oturumda geçerli */ }
    listeners.forEach((l) => l(c));
};

export const onConsentChange = (l: Listener) => {
    listeners.add(l);
    return () => { listeners.delete(l); };
};

/** Çerez politikasındaki "tercihleri değiştir" bağlantısı pencereyi yeniden açar. */
export const openConsentSettings = () => window.dispatchEvent(new Event(OPEN_EVENT));
export const onConsentOpen = (fn: () => void) => {
    window.addEventListener(OPEN_EVENT, fn);
    return () => window.removeEventListener(OPEN_EVENT, fn);
};
