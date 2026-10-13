/**
 * Google etiketi (Consent Mode v2), Meta Pixel ve LinkedIn Insight Tag.
 * Google onaydan önce çerezsiz çalışır; Meta ve LinkedIn yalnız reklam onayı verilince yüklenir.
 */
import { TRACKING, hasAnyTracking, hasGoogle } from './config';
import { onConsentChange, readConsent, type Consent } from './consent';

type Fn = (...args: unknown[]) => void;
type Fbq = Fn & { callMethod?: Fn; queue: unknown[][]; push?: Fbq; loaded?: boolean; version?: string };
type Lintrk = Fn & { q: unknown[][] };

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: Fn;
        fbq?: Fbq;
        _fbq?: Fbq;
        lintrk?: Lintrk;
        _linkedin_partner_id?: string;
        _linkedin_data_partner_ids?: string[];
    }
}

const loadScript = (src: string) => {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
};

const gtag: Fn = (...args) => window.gtag?.(...args);

const googleIds = () => {
    const ads = Object.values(TRACKING.googleAdsConversions).map((v) => v.split('/')[0]);
    return [...new Set([TRACKING.googleTagId, ...ads].filter(Boolean))];
};

const applyGoogleConsent = (c: Consent) => {
    const v = (ok: boolean) => (ok ? 'granted' : 'denied');
    gtag('consent', 'update', {
        analytics_storage: v(c.analytics),
        ad_storage: v(c.marketing),
        ad_user_data: v(c.marketing),
        ad_personalization: v(c.marketing),
    });
};

const startGoogle = (c: Consent | null) => {
    window.dataLayer = window.dataLayer || [];
    // gtag.js kuyruğu dizi değil `arguments` nesnesi bekler.
    window.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
    };
    gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
    });
    if (c) applyGoogleConsent(c);
    gtag('js', new Date());
    for (const id of googleIds()) gtag('config', id, { send_page_view: false });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleIds()[0])}`);
};

let marketingOn = false;

const startMeta = () => {
    if (!TRACKING.metaPixelId) return;
    if (window.fbq) {
        window.fbq('consent', 'grant');
        return;
    }
    const fbq = function (...args: unknown[]) {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
    loadScript('https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', TRACKING.metaPixelId);
    fbq('track', 'PageView');
};

const startLinkedin = () => {
    const id = TRACKING.linkedinPartnerId;
    if (!id || window.lintrk) return;
    window._linkedin_partner_id = id;
    window._linkedin_data_partner_ids = [...(window._linkedin_data_partner_ids || []), id];
    const lintrk = function (...args: unknown[]) { lintrk.q.push(args); } as Lintrk;
    lintrk.q = [];
    window.lintrk = lintrk;
    loadScript('https://snap.licdn.com/li.lms-analytics/insight.min.js');
};

const setMarketing = (on: boolean) => {
    marketingOn = on;
    if (on) {
        startMeta();
        startLinkedin();
    } else {
        window.fbq?.('consent', 'revoke');
    }
};

let started = false;

/** Uygulama açılışında bir kez; yönetim panelinde çağrılmaz. */
export const initTracking = () => {
    if (started || !hasAnyTracking()) return;
    started = true;
    const c = readConsent();
    if (hasGoogle()) startGoogle(c);
    if (c?.marketing) setMarketing(true);
    onConsentChange((next) => {
        if (hasGoogle()) applyGoogleConsent(next);
        setMarketing(next.marketing);
    });
};

/** Uygulama tek sayfa olduğu için her ekran sanal bir sayfa yolu olarak raporlanır. */
export const trackPageView = (path: string, title: string) => {
    if (!started) return;
    gtag('event', 'page_view', { page_location: `${window.location.origin}${path}`, page_path: path, page_title: title });
    if (marketingOn && path !== '/') window.fbq?.('track', 'PageView');
};

const linkedinConversion = (id: string) => {
    if (marketingOn && id) window.lintrk?.('track', { conversion_id: Number(id) });
};

export const trackSignUp = () => {
    if (!started) return;
    gtag('event', 'sign_up', { method: 'email' });
    if (TRACKING.googleAdsConversions.signUp) gtag('event', 'conversion', { send_to: TRACKING.googleAdsConversions.signUp });
    if (marketingOn) window.fbq?.('track', 'CompleteRegistration');
    linkedinConversion(TRACKING.linkedinConversions.signUp);
};

export const trackPurchase = (p: { transactionId: string; value: number; currency: string; itemId: string; itemName: string }) => {
    if (!started) return;
    gtag('event', 'purchase', {
        transaction_id: p.transactionId,
        value: p.value,
        currency: p.currency,
        items: [{ item_id: p.itemId, item_name: p.itemName, price: p.value, quantity: 1 }],
    });
    if (TRACKING.googleAdsConversions.purchase) {
        gtag('event', 'conversion', {
            send_to: TRACKING.googleAdsConversions.purchase,
            value: p.value,
            currency: p.currency,
            transaction_id: p.transactionId,
        });
    }
    if (marketingOn) window.fbq?.('track', 'Purchase', { value: p.value, currency: p.currency, content_ids: [p.itemId], content_type: 'product' });
    linkedinConversion(TRACKING.linkedinConversions.purchase);
};
