import { findCountry, type CountryCode } from '../international/registry/countryProfiles';
import type { Locale } from '../store/uiStore';

/** IANA saat dilimi → kayıttaki ülke. Windows/ICU bazı ülkelerde bağlantı (link) adlarını da döndürür. */
const TIMEZONE_COUNTRY: Record<string, CountryCode> = {
    'Europe/Istanbul': 'TR', 'Asia/Istanbul': 'TR',
    'Europe/Berlin': 'DE', 'Europe/Busingen': 'DE',
    'Europe/Vienna': 'AT',
    'Europe/Zurich': 'CH',
    'Europe/Paris': 'FR',
    'Europe/Brussels': 'BE',
    'Europe/Amsterdam': 'NL',
    'Europe/Luxembourg': 'LU',
    'Europe/Madrid': 'ES', 'Atlantic/Canary': 'ES', 'Africa/Ceuta': 'ES',
    'Europe/Lisbon': 'PT', 'Atlantic/Madeira': 'PT', 'Atlantic/Azores': 'PT',
    'Europe/Rome': 'IT',
    'Europe/Copenhagen': 'DK',
    'Europe/Stockholm': 'SE',
    'Europe/Helsinki': 'FI',
    'Europe/Oslo': 'NO',
    'Atlantic/Reykjavik': 'IS',
    'Europe/Tallinn': 'EE',
    'Europe/Riga': 'LV',
    'Europe/Vilnius': 'LT',
    'Europe/Warsaw': 'PL',
    'Europe/Prague': 'CZ',
    'Europe/Bratislava': 'SK',
    'Europe/Budapest': 'HU',
    'Europe/Bucharest': 'RO',
    'Europe/Sofia': 'BG',
    'Europe/Athens': 'GR',
    'Europe/Zagreb': 'HR',
    'Europe/Ljubljana': 'SI',
    'Europe/Dublin': 'IE',
    'Europe/Malta': 'MT',
    'Asia/Nicosia': 'CY', 'Asia/Famagusta': 'CY', 'Europe/Nicosia': 'CY',
    'Europe/Vaduz': 'LI',
    'Europe/London': 'GB', 'Europe/Belfast': 'GB',
    ...Object.fromEntries([
        'America/New_York', 'America/Detroit', 'America/Chicago', 'America/Denver', 'America/Phoenix', 'America/Boise',
        'America/Los_Angeles', 'America/Anchorage', 'America/Juneau', 'America/Sitka', 'America/Nome', 'America/Adak',
        'America/Indiana/Indianapolis', 'America/Indianapolis', 'America/Kentucky/Louisville', 'America/Louisville',
        'America/North_Dakota/Center', 'America/Menominee', 'Pacific/Honolulu',
        'US/Eastern', 'US/Central', 'US/Mountain', 'US/Pacific', 'US/Alaska', 'US/Hawaii', 'US/Arizona',
    ].map((tz) => [tz, 'US'])),
    ...Object.fromEntries([
        'Europe/Moscow', 'Europe/Kaliningrad', 'Europe/Samara', 'Europe/Volgograd', 'Europe/Saratov', 'Europe/Ulyanovsk',
        'Europe/Astrakhan', 'Europe/Kirov', 'Asia/Yekaterinburg', 'Asia/Omsk', 'Asia/Novosibirsk', 'Asia/Barnaul',
        'Asia/Tomsk', 'Asia/Novokuznetsk', 'Asia/Krasnoyarsk', 'Asia/Irkutsk', 'Asia/Chita', 'Asia/Yakutsk',
        'Asia/Khandyga', 'Asia/Vladivostok', 'Asia/Ust-Nera', 'Asia/Magadan', 'Asia/Sakhalin', 'Asia/Srednekolymsk',
        'Asia/Kamchatka', 'Asia/Anadyr', 'W-SU',
    ].map((tz) => [tz, 'RU'])),
    ...Object.fromEntries([
        'America/Sao_Paulo', 'America/Rio_Branco', 'America/Manaus', 'America/Cuiaba', 'America/Campo_Grande', 'America/Porto_Velho',
        'America/Boa_Vista', 'America/Belem', 'America/Fortaleza', 'America/Recife', 'America/Maceio', 'America/Bahia',
        'America/Araguaina', 'America/Santarem', 'America/Eirunepe', 'America/Noronha', 'America/Porto_Acre',
        'Brazil/East', 'Brazil/West', 'Brazil/Acre', 'Brazil/DeNoronha',
    ].map((tz) => [tz, 'BR'])),
    'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
    'Asia/Shanghai': 'CN', 'Asia/Urumqi': 'CN', 'Asia/Chongqing': 'CN', 'Asia/Chungking': 'CN', 'Asia/Harbin': 'CN', 'PRC': 'CN',
};

/**
 * Saat diliminden ülke. Coğrafi bir dilim (America/New_York gibi) kayıtta yoksa
 * kullanıcı desteklenmeyen bir bölgededir → null. UTC/Etc/* gibi coğrafi olmayan
 * dilimlerde karar verilemez → undefined.
 */
const timezoneCountry = (): CountryCode | null | undefined => {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!tz || !tz.includes('/') || tz.startsWith('Etc/')) return undefined;
        return TIMEZONE_COUNTRY[tz] ?? null;
    } catch {
        return undefined;
    }
};

/** Tarayıcı dil etiketlerindeki bölge (de-AT → AT); yalnız kayıttaki ülkeler. */
const navigatorCountry = (): CountryCode | null => {
    if (typeof navigator === 'undefined') return null;
    for (const tag of navigator.languages ?? [navigator.language]) {
        try {
            const region = new Intl.Locale(tag).maximize().region;
            if (region && findCountry(region)) return region;
        } catch { /* geçersiz etiket */ }
    }
    return null;
};

/**
 * Kullanıcının bulunduğu ülke: saat dilimi (fiziksel bölge) belirleyicidir;
 * yalnız coğrafi olmayan dilimlerde tarayıcı dil bölgesine bakılır.
 * Kayıtta olmayan bir ülkedeyse null.
 */
export const detectCountry = (): CountryCode | null => {
    const fromTimezone = timezoneCountry();
    return fromTimezone !== undefined ? fromTimezone : navigatorCountry();
};

/** Ülkenin arayüz dili; desteklenmeyen dil ya da bilinmeyen ülke için 'en'. */
export const countryLocale = (country: CountryCode | null | undefined): Locale =>
    (country && findCountry(country)?.uiLanguage) || 'en';
