/** Türkçe küçük harf + aksan katlama: "Kırmızı Çizgili" → "kirmizi cizgili". */
const FOLD: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
export const fold = (s: string): string =>
    s.toLocaleLowerCase('tr-TR').replace(/[çğıöşüâîû]/g, c => FOLD[c] ?? c).normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const STOPWORDS = new Set([
    've', 'ile', 'bir', 'bu', 'su', 'o', 'da', 'de', 'ki', 'mi', 'icin', 'gibi', 'daha', 'cok', 'az', 'biraz', 'en', 'olsun',
    'olarak', 'olan', 'lutfen', 'istiyorum', 'isterim', 'istenir', 'yap', 'yapin', 'yapalim', 'ama', 'fakat', 'veya', 'ya',
    'her', 'tum', 'butun', 'sey', 'seyler', 'gerek', 'gerekli', 'kullan', 'kullanin', 'ekle', 'eklensin', 'koy', 'dursun',
    'tasarim', 'tasarimi', 'tasarimda', 'belge', 'belgede', 'fatura', 'faturada', 'sayfa', 'sayfada', 'kismi', 'kisminda',
    'alan', 'alani', 'bolum', 'bolumu', 'yer', 'alsin', 'almasin', 'olmali', 'olsa', 'iyi', 'guzel', 'hos', 'ne', 'nasil',
]);

export const tokenize = (s: string): string[] =>
    fold(s).split(/[^a-z0-9#]+/).filter(t => t.length > 1 && !STOPWORDS.has(t));

/** XML metin / öznitelik kaçışı. */
export const esc = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** XSLT değişmez sonuç elemanı özniteliği: değer şablonu (AVT) olduğu için { } ikilenir. */
export const escAttr = (s: string): string => esc(s).replace(/\{/g, '{{').replace(/\}/g, '}}');

/** XML yorumu içinde "--" geçemez. */
export const escComment = (s: string): string => s.replace(/-{2,}/g, m => m.split('').join(' ')).replace(/-$/, '- ');

export const isHex = (s: unknown): s is string => typeof s === 'string' && /^#[0-9a-f]{6}$/i.test(s);

export const hexToRgb = (hex: string): [number, number, number] => {
    const h = isHex(hex) ? hex.slice(1) : '475569';
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

export const rgbToHex = (r: number, g: number, b: number): string =>
    '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

/** a ile b arasında t oranında karışım (t=0 → a, t=1 → b). */
export const mix = (a: string, b: string, t: number): string => {
    const [r1, g1, b1] = hexToRgb(a);
    const [r2, g2, b2] = hexToRgb(b);
    return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
};

export const luminance = (hex: string): number => {
    const lin = (v: number) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const [r, g, b] = hexToRgb(hex);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

/** Arka plan rengine göre okunaklı yazı rengi. */
export const textOn = (bg: string): string => (luminance(bg) > 0.42 ? '#111827' : '#ffffff');

/** Beyaz zeminde okunaklılık için çok açık renkleri koyulaştırır. */
export const readableAccent = (hex: string): string => {
    let c = isHex(hex) ? hex.toLowerCase() : '#475569';
    for (let i = 0; i < 6 && luminance(c) > 0.32; i++) c = mix(c, '#000000', 0.18);
    return c;
};

export const colorDistance = (a: string, b: string): number => {
    const [r1, g1, b1] = hexToRgb(a);
    const [r2, g2, b2] = hexToRgb(b);
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
};

/** Belirlenimci 32 bit karma (FNV-1a). */
export const hashString = (s: string): number => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
};

export const uniq = <T,>(items: T[]): T[] => Array.from(new Set(items));
