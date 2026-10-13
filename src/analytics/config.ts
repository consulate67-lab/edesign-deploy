/**
 * Reklam / ölçüm kimlikleri. Boş bırakılan kanal hiç yüklenmez; hepsi boşsa çerez penceresi de çıkmaz.
 * Bu değerler sayfa kaynağında zaten herkese görünür, gizli bilgi değildir.
 */
export const TRACKING = {
    /** Google Tag Manager kapsayıcısı 'GTM-XXXXXXX'; etiketler GTM panelinden yönetilir. */
    gtmId: 'GTM-K39HMWQT',
    /** Google etiketi: Analytics 'G-XXXXXXX' veya Google Ads 'AW-XXXXXXX'. */
    googleTagId: '',
    /** Google Ads dönüşüm etiketleri ('AW-XXXXXXX/abcDEF'); boşsa yalnız Analytics olayı gider. */
    googleAdsConversions: { signUp: '', purchase: '' },
    /** Meta (Instagram + Facebook) Pixel kimliği, yalnız rakam. */
    metaPixelId: '',
    /** LinkedIn Insight Tag iş ortağı kimliği, yalnız rakam. */
    linkedinPartnerId: '',
    /** LinkedIn Campaign Manager'da oluşturulan dönüşüm kimlikleri. */
    linkedinConversions: { signUp: '', purchase: '' },
};

export const hasGoogle = () => !!(TRACKING.gtmId || TRACKING.googleTagId);
export const hasMarketing = () => !!(TRACKING.metaPixelId || TRACKING.linkedinPartnerId);
export const hasAnyTracking = () => hasGoogle() || hasMarketing();
