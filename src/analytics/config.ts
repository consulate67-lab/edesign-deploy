/**
 * Reklam / ölçüm kimlikleri ve sosyal medya bağlantıları; yönetim panelindeki
 * "Sosyal medya ve reklam" sekmesinden düzenlenir, açılışta GET /site-config ile gelir.
 * Boş bırakılan kanal hiç yüklenmez; hepsi boşsa çerez penceresi de çıkmaz.
 * Bu değerler sayfa kaynağında zaten herkese görünür, gizli bilgi değildir.
 */
import { useSyncExternalStore } from 'react';
import { API_URL } from '../api';

export interface TrackingConfig {
    /** Google Tag Manager kapsayıcısı 'GTM-XXXXXXX'; etiketler GTM panelinden yönetilir. */
    gtmId: string;
    /** Google etiketi: Analytics 'G-XXXXXXX' veya Google Ads 'AW-XXXXXXX'. */
    googleTagId: string;
    /** Google Ads dönüşüm etiketleri ('AW-XXXXXXX/abcDEF'); boşsa yalnız Analytics olayı gider. */
    googleAdsConversions: { signUp: string; purchase: string };
    /** Meta (Instagram + Facebook) Pixel kimliği, yalnız rakam. */
    metaPixelId: string;
    /** LinkedIn Insight Tag iş ortağı kimliği, yalnız rakam. */
    linkedinPartnerId: string;
    /** LinkedIn Campaign Manager'da oluşturulan dönüşüm kimlikleri. */
    linkedinConversions: { signUp: string; purchase: string };
}

export const SOCIAL_KEYS = ['instagram', 'facebook', 'youtube', 'linkedin', 'x', 'tiktok'] as const;
export type SocialKey = typeof SOCIAL_KEYS[number];

export interface SiteConfig {
    tracking: TrackingConfig;
    social: Record<SocialKey, string>;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
    tracking: {
        gtmId: 'GTM-K39HMWQT',
        googleTagId: '',
        googleAdsConversions: { signUp: '', purchase: '' },
        metaPixelId: '',
        linkedinPartnerId: '',
        linkedinConversions: { signUp: '', purchase: '' },
    },
    social: { instagram: '', facebook: '', youtube: '', linkedin: '', x: '', tiktok: '' },
};

/** tracking.ts bu nesneyi okur; sunucudan gelen değerler üzerine yazılır. */
export const TRACKING: TrackingConfig = { ...DEFAULT_SITE_CONFIG.tracking };

let current: SiteConfig = DEFAULT_SITE_CONFIG;
const listeners = new Set<() => void>();
const CACHE_KEY = 'edx-site-config';

const apply = (cfg: SiteConfig) => {
    current = {
        tracking: { ...DEFAULT_SITE_CONFIG.tracking, ...cfg.tracking },
        social: { ...DEFAULT_SITE_CONFIG.social, ...cfg.social },
    };
    Object.assign(TRACKING, current.tracking);
    listeners.forEach((l) => l());
};

/** Sunucuya ulaşılamazsa son başarılı yanıt, o da yoksa varsayılanlar kullanılır. */
export const loadSiteConfig = async () => {
    try {
        const res = await fetch(`${API_URL}/site-config`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(String(res.status));
        const cfg = (await res.json()) as SiteConfig;
        apply(cfg);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(cfg)); } catch { /* depolama kapalı */ }
    } catch {
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
            if (cached?.tracking && cached?.social) apply(cached);
        } catch { /* bozuk önbellek: varsayılanlar kalır */ }
    }
};

const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => { listeners.delete(l); };
};

export const useSiteConfig = () => useSyncExternalStore(subscribe, () => current);

export const hasGoogle = () => !!(TRACKING.gtmId || TRACKING.googleTagId);
export const hasMarketing = () => !!(TRACKING.metaPixelId || TRACKING.linkedinPartnerId);
export const hasAnyTracking = () => hasGoogle() || hasMarketing();
