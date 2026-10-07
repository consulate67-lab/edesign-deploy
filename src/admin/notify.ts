let audioCtx: AudioContext | null = null;

/** Kısa iki tonlu bildirim sesi (ses dosyası gerektirmez). */
export function playChime() {
    try {
        audioCtx ??= new AudioContext();
        const ctx = audioCtx;
        if (ctx.state === 'suspended') void ctx.resume();
        const t0 = ctx.currentTime;
        [880, 1320].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = t0 + i * 0.14;
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
            osc.connect(gain).connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.25);
        });
    } catch { /* tarayıcı ses çalmaya izin vermiyorsa sessiz geç */ }
}

export const notificationPermission = (): NotificationPermission | 'unsupported' =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;

export async function requestNotificationPermission() {
    if (typeof Notification === 'undefined' || Notification.permission !== 'default') return notificationPermission();
    try { return await Notification.requestPermission(); } catch { return notificationPermission(); }
}

export function showBrowserNotification(title: string, body: string, tag?: string) {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    try {
        const n = new Notification(title, { body, tag, icon: `${import.meta.env.BASE_URL}favicon.svg` });
        n.onclick = () => { window.focus(); n.close(); };
    } catch { /* bazı tarayıcılar yalnızca service worker ile bildirim gösterir */ }
}
