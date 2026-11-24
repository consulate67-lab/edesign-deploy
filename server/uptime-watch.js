/**
 * Canlı site gözcüsü: ana sayfa + /api/health.web periyodik kontrol.
 * API ayakta ama dist-web yokken (404) oluşan kesintiyi yakalar; durum değişince Telegram'a yazar.
 */
import { resolveWebRoot } from './serve-web.js';
import * as telegram from './telegram.js';

const DEFAULT_URL = 'https://www.edxdocu.com/';
const CHECK_MS = Math.max(30_000, Number(process.env.UPTIME_CHECK_MS) || 120_000);
const FAIL_BEFORE_ALERT = Math.max(1, Number(process.env.UPTIME_FAIL_THRESHOLD) || 2);
const FETCH_MS = Math.max(5_000, Number(process.env.UPTIME_FETCH_MS) || 15_000);

/** @typedef {{ ok: boolean, code?: string, detail?: string, status?: number, ms?: number }} Probe */

/** @type {{
 *   ok: boolean | null,
 *   consecutiveFails: number,
 *   alertedDown: boolean,
 *   lastCheckAt: string | null,
 *   lastOkAt: string | null,
 *   lastFailAt: string | null,
 *   lastError: string | null,
 *   probes: Record<string, Probe>,
 *   checkMs: number,
 *   url: string,
 * }} */
const state = {
    ok: null,
    consecutiveFails: 0,
    alertedDown: false,
    lastCheckAt: null,
    lastOkAt: null,
    lastFailAt: null,
    lastError: null,
    probes: {},
    checkMs: CHECK_MS,
    url: '',
};

const publicBase = () => {
    const raw = (process.env.UPTIME_CHECK_URL || process.env.FRONTEND_URL || DEFAULT_URL).trim();
    try {
        const u = new URL(raw.includes('://') ? raw : `https://${raw}`);
        // GitHub Pages varsayılanı canlı DNS değil; edxdocu'ya düş.
        if (/github\.io$/i.test(u.hostname)) return DEFAULT_URL;
        return `${u.origin}/`;
    } catch {
        return DEFAULT_URL;
    }
};

const fetchText = async (url) => {
    const t0 = Date.now();
    const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            'User-Agent': 'edxdocu-uptime-watch/1.0',
        },
        signal: AbortSignal.timeout(FETCH_MS),
    });
    const body = await res.text().catch(() => '');
    return { res, body, ms: Date.now() - t0 };
};

/** @returns {Promise<Probe>} */
async function probeHome(base) {
    try {
        const { res, body, ms } = await fetchText(base);
        if (res.status !== 200) {
            return { ok: false, code: 'http', status: res.status, detail: `Ana sayfa HTTP ${res.status}`, ms };
        }
        const html = body.slice(0, 80_000);
        const looksLikeApp = /<div[^>]+id=["']root["']/i.test(html)
            || /assets\/index-[A-Za-z0-9_-]+\.js/i.test(html)
            || /<script[^>]+type=["']module["']/i.test(html);
        if (!looksLikeApp) {
            return { ok: false, code: 'html', status: res.status, detail: 'Ana sayfa HTML uygulama kabuğu değil', ms };
        }
        return { ok: true, status: res.status, ms };
    } catch (e) {
        return { ok: false, code: 'network', detail: e.message || 'Ana sayfa erişilemedi' };
    }
}

/** @returns {Promise<Probe>} */
async function probeHealth(base) {
    try {
        const { res, body, ms } = await fetchText(new URL('api/health', base).href);
        if (res.status !== 200) {
            return { ok: false, code: 'http', status: res.status, detail: `Health HTTP ${res.status}`, ms };
        }
        let data = null;
        try { data = JSON.parse(body); } catch { /* ignore */ }
        if (!data || data.status !== 'ok') {
            return { ok: false, code: 'payload', status: res.status, detail: 'Health yanıtı ok değil', ms };
        }
        // Eski sürümlerde web alanı yoksa yalnız API ayakta sayılır — arayüz için yetmez.
        if (Object.prototype.hasOwnProperty.call(data, 'web') && !data.web) {
            return { ok: false, code: 'no_web', status: res.status, detail: 'API ayakta ama dist-web yok (web:false)', ms };
        }
        return { ok: true, status: res.status, ms, detail: data.web === true ? 'web:true' : 'web alanı yok (eski sürüm)' };
    } catch (e) {
        return { ok: false, code: 'network', detail: e.message || 'Health erişilemedi' };
    }
}

/** Konteyner içi: public URL'e çıkmadan dist-web var mı? */
function probeLocalWeb() {
    const root = resolveWebRoot();
    return root
        ? { ok: true, detail: root }
        : { ok: false, code: 'local', detail: 'Konteynerde dist-web/index.html yok' };
}

export const getUptimeStatus = () => ({
    ok: state.ok,
    consecutiveFails: state.consecutiveFails,
    alertedDown: state.alertedDown,
    lastCheckAt: state.lastCheckAt,
    lastOkAt: state.lastOkAt,
    lastFailAt: state.lastFailAt,
    lastError: state.lastError,
    probes: state.probes,
    checkMs: state.checkMs,
    url: state.url || publicBase(),
    failThreshold: FAIL_BEFORE_ALERT,
});

async function alertDown(summary) {
    const lines = [
        '🚨 <b>Canlı site sorunu</b>',
        `URL: ${telegram.escapeHtml(state.url)}`,
        telegram.escapeHtml(summary),
        `Kontrol: her ${Math.round(CHECK_MS / 1000)} sn · eşik ${FAIL_BEFORE_ALERT} başarısız`,
    ];
    await telegram.notify(lines.join('\n'));
}

async function alertUp(summary) {
    const lines = [
        '✅ <b>Canlı site toparlandı</b>',
        `URL: ${telegram.escapeHtml(state.url)}`,
        telegram.escapeHtml(summary),
    ];
    await telegram.notify(lines.join('\n'));
}

export async function runUptimeCheck() {
    const base = publicBase();
    state.url = base;
    state.lastCheckAt = new Date().toISOString();

    const [home, health, local] = await Promise.all([
        probeHome(base),
        probeHealth(base),
        Promise.resolve(probeLocalWeb()),
    ]);
    state.probes = { home, health, local };

    const ok = home.ok && health.ok && local.ok;
    const failParts = [
        !home.ok && (home.detail || 'ana sayfa'),
        !health.ok && (health.detail || 'health'),
        !local.ok && (local.detail || 'local web'),
    ].filter(Boolean);
    const summary = ok
        ? `Ana sayfa ${home.status ?? 200} (${home.ms ?? '?'} ms), health OK`
        : failParts.join(' · ');

    if (ok) {
        const wasDown = state.alertedDown;
        state.ok = true;
        state.consecutiveFails = 0;
        state.lastOkAt = state.lastCheckAt;
        state.lastError = null;
        if (wasDown) {
            state.alertedDown = false;
            console.log(`[uptime] toparlandı: ${summary}`);
            await alertUp(summary);
        }
        return getUptimeStatus();
    }

    state.ok = false;
    state.consecutiveFails += 1;
    state.lastFailAt = state.lastCheckAt;
    state.lastError = summary;
    console.warn(`[uptime] sorun (${state.consecutiveFails}/${FAIL_BEFORE_ALERT}): ${summary}`);

    if (!state.alertedDown && state.consecutiveFails >= FAIL_BEFORE_ALERT) {
        state.alertedDown = true;
        await alertDown(summary);
    }
    return getUptimeStatus();
}

export function startUptimeWatch() {
    state.url = publicBase();
    state.checkMs = CHECK_MS;
    const tick = () => {
        runUptimeCheck().catch((e) => console.error('[uptime] kontrol hatası:', e.message));
    };
    // Boot sonrası kısa gecikme (deploy / DNS otursun)
    setTimeout(tick, 45_000).unref?.();
    setInterval(tick, CHECK_MS).unref?.();
    console.log(`[uptime] Gözcü başladı: ${state.url} her ${Math.round(CHECK_MS / 1000)} sn`);
}
