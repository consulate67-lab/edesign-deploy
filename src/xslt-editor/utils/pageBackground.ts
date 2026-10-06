/**
 * Sayfa / çerçeve arka plan resmi. Resim data URI olarak XSLT çıktısına
 * eklenen bir <style data-edesign-bg="hedef|yerleşim|opaklık"> bloğunda durur;
 * opaklık için resim hedefin ::before katmanına konur (içeriği soldurmaz).
 */
import { findLiteralTagByOrdinal, setTagAttribute } from './xsltStyleEdit';

export type BgTarget = 'page' | 'element';
export type BgFit = 'width' | 'width-repeat' | 'stretch' | 'cover';

export interface PageBackground {
    image: string;
    target: BgTarget;
    fit: BgFit;
    opacity: number;
}

export const BG_FITS: { id: BgFit; label: string }[] = [
    { id: 'width', label: 'Sayfa genişliğine sığdır' },
    { id: 'width-repeat', label: 'Genişliğe sığdır, aşağı doğru tekrarla' },
    { id: 'stretch', label: 'Tam kapla (en ve boy uzatılır)' },
    { id: 'cover', label: 'Kapla (oran korunur, taşan kesilir)' },
];

const BG_STYLE_RE = /<style\b[^>]*\bdata-edesign-bg\s*=\s*"([^"]*)"[^>]*>([\s\S]*?)<\/style>[ \t]*\r?\n?/;
const TARGET_ATTR_RE = /\sdata-edesign-bg-target\s*=\s*(["'])[^"']*\1/g;
const TARGET_ATTR = 'data-edesign-bg-target';

export function readPageBackground(xslt: string): PageBackground | null {
    const m = xslt.match(BG_STYLE_RE);
    if (!m) return null;
    const [target, fit, opacity] = m[1].split('|');
    const image = m[2].match(/background-image:url\("([^"]*)"\)/)?.[1];
    if (!image) return null;
    return {
        image,
        target: target === 'element' ? 'element' : 'page',
        fit: BG_FITS.some(f => f.id === fit) ? fit as BgFit : 'width',
        opacity: Math.min(1, Math.max(0.05, Number(opacity) || 1)),
    };
}

function backgroundCss(bg: PageBackground): string {
    const sel = bg.target === 'page' ? 'body' : `[${TARGET_ATTR}]`;
    const size = bg.fit === 'stretch' ? '100% 100%' : bg.fit === 'cover' ? 'cover' : '100% auto';
    const repeat = bg.fit === 'width-repeat' ? 'repeat-y' : 'no-repeat';
    return `${sel}{position:relative;isolation:isolate}`
        + `${sel}::before{content:"";position:absolute;left:0;top:0;right:0;bottom:0;z-index:-1;pointer-events:none;`
        + `background-image:url("${bg.image}");background-size:${size};background-repeat:${repeat};background-position:center top;`
        + `opacity:${bg.opacity};-webkit-print-color-adjust:exact;print-color-adjust:exact}`;
}

/** Stil bloğunun konacağı yer: </head> öncesi, yoksa <body> açılışı ya da kök template sonrası. */
function styleOffset(xslt: string): number {
    const head = xslt.search(/<\/head\s*>/i);
    if (head >= 0) return head;
    const body = xslt.match(/<body\b(?:[^>"']|"[^"]*"|'[^']*')*>/i);
    if (body?.index !== undefined) return body.index + body[0].length;
    const tpl = xslt.match(/<xsl:template\b[^>]*\bmatch\s*=\s*(["'])\/\1[^>]*>/);
    return tpl?.index !== undefined ? tpl.index + tpl[0].length : -1;
}

/**
 * Arka planı yazar (null → kaldırır). target 'element' iken elementOrdinal
 * (önizlemedeki data-xsrc) verilirse işaret o etikete taşınır, verilmezse
 * mevcut işaretli öğe korunur. Hedef bulunamazsa null.
 */
export function writePageBackground(xslt: string, bg: PageBackground | null, elementOrdinal?: number): string | null {
    const keepTarget = bg?.target === 'element' && elementOrdinal === undefined;
    let out = keepTarget ? xslt : xslt.replace(TARGET_ATTR_RE, '');
    if (bg?.target === 'element') {
        if (keepTarget) {
            if (!new RegExp(TARGET_ATTR_RE.source).test(out)) return null;
        } else {
            // Sıra numarası önizlemeye göre: stil bloğu silinmeden çözülür.
            const tag = findLiteralTagByOrdinal(out, elementOrdinal!);
            if (!tag) return null;
            out = setTagAttribute(out, tag, TARGET_ATTR, '1');
        }
    }
    out = out.replace(BG_STYLE_RE, '');
    if (!bg) return out;
    const at = styleOffset(out);
    if (at < 0) return null;
    const block = `<style data-edesign-bg="${bg.target}|${bg.fit}|${bg.opacity}">${backgroundCss(bg)}</style>\n`;
    return out.slice(0, at) + block + out.slice(at);
}

/** Resmi data URI'ye çevirir; çok genişse kalite kaybı olmadan küçültür. */
export async function imageFileToDataUrl(file: File, maxWidth = 1800): Promise<string> {
    const original = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
    });
    if (file.type === 'image/svg+xml') return original;
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error('Resim okunamadı'));
        i.src = original;
    });
    if (img.naturalWidth <= maxWidth) return original;
    const scale = maxWidth / img.naturalWidth;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
    const resized = canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.88);
    return resized.length < original.length ? resized : original;
}
