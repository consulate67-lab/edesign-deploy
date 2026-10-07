/**
 * Kullanıcının seçtiği resmi XSLT'ye gömülebilir `data:<mime>;base64,...`
 * değerine çevirir; büyük raster resimler gömülmeden önce küçültülür.
 */

export interface PickedImage {
    dataUrl: string;
    name: string;
    mime: string;
    /** Gömülen verinin bayt cinsinden boyutu. */
    bytes: number;
    width: number;
    height: number;
}

export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024;
const MAX_EMBED_SIDE = 1600;
const RESIZE_ABOVE_BYTES = 400 * 1024;

const MIME_BY_EXT: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
    webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp', ico: 'image/x-icon',
};

export const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.ico,image/*';

const mimeOf = (file: File): string => {
    if (file.type.startsWith('image/')) return file.type;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    return MIME_BY_EXT[ext] ?? '';
};

/** data URL'in gömülü veri boyutu (bayt). */
export function dataUrlBytes(dataUrl: string): number {
    const comma = dataUrl.indexOf(',');
    if (comma < 0) return 0;
    const body = dataUrl.slice(comma + 1);
    if (!/;base64$/i.test(dataUrl.slice(0, comma))) return decodeURIComponent(body).length;
    const pad = body.endsWith('==') ? 2 : body.endsWith('=') ? 1 : 0;
    return Math.max(0, Math.floor(body.length * 3 / 4) - pad);
}

/** `data:image/png;base64,...` → `PNG`; data URL değilse null. */
export function dataUrlFormat(src: string): string | null {
    const m = /^data:image\/([a-z0-9.+-]+)[;,]/i.exec(src.trim());
    if (!m) return null;
    const t = m[1].toLowerCase();
    return t === 'svg+xml' ? 'SVG' : t === 'jpeg' ? 'JPG' : t === 'x-icon' ? 'ICO' : t.toUpperCase();
}

export function formatBytes(n: number): string {
    return n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`;
}

const readAsDataUrl = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Resim okunamadı'));
    reader.readAsDataURL(blob);
});

const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Dosya geçerli bir resim değil'));
    img.src = src;
});

/** Dosyayı doğrular, gerekirse küçültür ve data URL olarak döndürür. */
export async function readImageFile(file: File): Promise<PickedImage> {
    const mime = mimeOf(file);
    if (!mime) throw new Error(`Desteklenmeyen dosya türü: ${file.name}`);
    if (file.size > MAX_IMAGE_FILE_BYTES) {
        throw new Error(`Resim çok büyük (en fazla ${formatBytes(MAX_IMAGE_FILE_BYTES)}): ${formatBytes(file.size)}`);
    }
    const typed = file.type === mime ? file : new Blob([file], { type: mime });
    let dataUrl = await readAsDataUrl(typed);
    const img = await loadImage(dataUrl);
    let width = img.naturalWidth;
    let height = img.naturalHeight;

    // GIF (animasyon) ve SVG (vektör) olduğu gibi gömülür.
    const resizable = mime !== 'image/gif' && mime !== 'image/svg+xml';
    const longest = Math.max(width, height);
    if (resizable && longest > MAX_EMBED_SIDE && file.size > RESIZE_ABOVE_BYTES) {
        const scale = MAX_EMBED_SIDE / longest;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const out = mime === 'image/jpeg' ? canvas.toDataURL('image/jpeg', 0.9) : canvas.toDataURL('image/png');
            if (out.length < dataUrl.length) {
                dataUrl = out;
                width = canvas.width;
                height = canvas.height;
            }
        }
    }
    return { dataUrl, name: file.name, mime: dataUrl.slice(5, dataUrl.indexOf(';')), bytes: dataUrlBytes(dataUrl), width, height };
}

/**
 * Dosya seçme penceresini açar. Kullanıcı vazgeçerse null döner. Pencere
 * yalnızca kullanıcı etkileşimi sırasında açılabildiği için, etkileşim yoksa
 * `undefined` döner (çağıran yer tutucuyla devam eder).
 */
export function pickImageFile(): Promise<File | null | undefined> {
    const activation = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation;
    if (activation && !activation.isActive) return Promise.resolve(undefined);
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = IMAGE_ACCEPT;
        input.style.display = 'none';
        let done = false;
        const finish = (f: File | null) => {
            if (done) return;
            done = true;
            input.remove();
            resolve(f);
        };
        input.addEventListener('change', () => finish(input.files?.[0] ?? null));
        input.addEventListener('cancel', () => finish(null));
        document.body.appendChild(input);
        input.click();
    });
}
