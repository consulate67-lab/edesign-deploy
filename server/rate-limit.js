/**
 * Bellek içi kayan pencere sınırlayıcı. Tek sunucu örneği için yeterli;
 * yeniden başlatmada sayaçlar sıfırlanır.
 * Dönen fonksiyon, `key` için hak varsa true döner ve denemeyi sayar.
 */
export const createRateLimiter = ({ max, windowMs }) => {
    const hits = new Map();

    setInterval(() => {
        const cutoff = Date.now() - windowMs;
        for (const [key, times] of hits) {
            if (times[times.length - 1] <= cutoff) hits.delete(key);
        }
    }, windowMs).unref();

    return (key) => {
        const cutoff = Date.now() - windowMs;
        const times = (hits.get(key) || []).filter((t) => t > cutoff);
        const allowed = times.length < max;
        if (allowed) times.push(Date.now());
        hits.set(key, times);
        return allowed;
    };
};
