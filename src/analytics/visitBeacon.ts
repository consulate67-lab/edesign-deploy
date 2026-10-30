/** Birinci taraf ziyaret kaydı — kaynak (referrer / UTM) admin panelinde gruplanır. */
import { API_URL } from '../api';

const SESSION_KEY = 'edx_visit_attr';

type Attr = {
    referrer: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
};

const readAttr = (): Attr => {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) return JSON.parse(raw) as Attr;
    } catch { /* ignore */ }
    const params = new URLSearchParams(window.location.search);
    const attr: Attr = {
        referrer: document.referrer || '',
        utmSource: params.get('utm_source') || '',
        utmMedium: params.get('utm_medium') || '',
        utmCampaign: params.get('utm_campaign') || '',
    };
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(attr)); } catch { /* ignore */ }
    return attr;
};

let lastSent = '';

/** SPA ekran değişiminde çağrılır; oturumdaki ilk referrer/UTM korunur. */
export const reportPageVisit = (path: string, title: string) => {
    if (typeof window === 'undefined') return;
    if (/^\/(yonetim|admin)(\/|$)/i.test(path)) return;
    const key = `${path}|${title}`;
    if (key === lastSent) return;
    lastSent = key;
    const attr = readAttr();
    const body = JSON.stringify({
        path,
        title,
        referrer: attr.referrer,
        utmSource: attr.utmSource,
        utmMedium: attr.utmMedium,
        utmCampaign: attr.utmCampaign,
    });
    const url = `${API_URL}/traffic/visit`;
    try {
        if (navigator.sendBeacon) {
            const blob = new Blob([body], { type: 'application/json' });
            if (navigator.sendBeacon(url, blob)) return;
        }
    } catch { /* fetch'e düş */ }
    void fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
        credentials: 'omit',
    }).catch(() => undefined);
};
