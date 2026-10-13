/**
 * Kullanıcının yüklediği XSLT'den yeniden tasarımda korunacak bilgileri çıkarır:
 * gömülü görseller (logo / kaşe / imza adayları), IBAN'lar, sabit özel metinler
 * ve kullanılan UBL alanlarına karşılık gelen bölüm kimlikleri.
 */
import type { BankAccount } from '../admin/ai-designer/types';
import { fold } from '../admin/ai-designer/utils';
import { formatIban, normalizeIban, validateIban } from '../admin/ai-designer/questions';

export type ImageRole = 'logo' | 'stamp' | 'skip';

export interface XsltImage {
    src: string;
    /** Görselin çevresindeki ipucu (id, alt, class, yakın metin); kullanıcıya gösterilmez. */
    hint: string;
    guess: ImageRole;
    gib: boolean;
}

export interface XsltAnalysis {
    images: XsltImage[];
    banks: BankAccount[];
    texts: string[];
    sections: string[];
    accentHint: string | null;
}

const BANKS = [
    'Ziraat Katılım', 'Vakıf Katılım', 'Emlak Katılım', 'Türkiye Finans', 'Kuveyt Türk', 'Albaraka', 'Ziraat', 'Halkbank', 'Halk Bankası',
    'VakıfBank', 'Vakıfbank', 'Vakıflar Bankası', 'İş Bankası', 'İşbank', 'Garanti BBVA', 'Garanti', 'Akbank', 'Yapı Kredi', 'QNB', 'Finansbank', 'Denizbank',
    'TEB', 'ING', 'HSBC', 'Şekerbank', 'Fibabanka', 'Odeabank', 'Anadolubank', 'Burgan', 'Alternatif', 'ICBC', 'Enpara', 'Aktif Bank', 'Papara',
];

/** GİB şablonlarında her belgede tekrar eden etiketler; özel metin sayılmaz. */
const STANDARD = [
    'fatura no', 'fatura tarihi', 'fatura tipi', 'senaryo', 'ettn', 'ozellestirme no', 'vergi dairesi', 'vkn', 'tckn', 'sayin', 'tel', 'fax',
    'faks', 'web sitesi', 'e-posta', 'eposta', 'sira no', 'mal hizmet', 'mal / hizmet', 'miktar', 'birim fiyat', 'iskonto', 'kdv', 'kdv orani',
    'kdv tutari', 'mal hizmet tutari', 'toplam', 'hesaplanan', 'odenecek tutar', 'vergiler dahil', 'irsaliye no', 'irsaliye tarihi', 'siparis no',
    'siparis tarihi', 'aciklama', 'not', 'notlar', 'e-fatura', 'e-arsiv fatura', 'e-irsaliye', 'mersis no', 'ticaret sicil no', 'kapi no',
    'yalniz', 'diger vergiler', 'tevkifat', 'istisna', 'banka', 'iban', 'sube', 'hesap', 'para birimi', 'kur', 'doviz', 'tarih', 'saat', 'adres',
];

const isStandard = (s: string) => {
    const f = fold(s).replace(/[:.\s]+$/g, '').trim();
    return f.length < 3 || STANDARD.some(w => f === w || (f.length < 24 && f.startsWith(w)));
};

/** Etiket değil, firmaya özgü metin mi: cümle, iletişim / sicil bilgisi ya da en az beş kelime. */
const isCustomText = (t: string) => {
    if (t.length < 8 || !/[a-zçğıöşü]{3}/i.test(t) || isStandard(t) || /:\s*$/.test(t)) return false;
    const f = fold(t);
    if (/kdv|tevkifat|matrah|hesaplanan|vergi|iskonto|toplam|tutar/.test(f) && !/[.!?]$/.test(t)) return false;
    if (/@|www\.|https?:|\d{5,}/.test(t)) return true;
    if (/mersis|sicil|kep\b/.test(f)) return /\d{4,}/.test(t);
    const words = t.split(/\s+/).length;
    return words >= 5 || (/[.!?]$/.test(t) && words >= 3);
};

const FEATURE_PATHS: [RegExp, string][] = [
    [/PaymentDueDate|PaymentTerms|PaymentMeansCode/, 'odeme'],
    [/OrderReference|DespatchDocumentReference/, 'referans'],
    [/PricingExchangeRate|PaymentExchangeRate/, 'kur'],
    [/WithholdingTaxTotal|TaxExemptionReason/, 'tevkifat'],
    [/AllowanceCharge/, 'iskonto'],
    [/cbc:Note\b/, 'notlar'],
    [/CarrierParty|ActualDespatchDate/, 'internetSatis'],
    [/RequiredCustomsID|DeliveryTerms/, 'ihracatBilgi'],
    [/TaxSubtotal[^"]*TaxableAmount|TaxableAmount/, 'kdvDokum'],
];

const parseXml = (text: string): Document | null => {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    return doc.getElementsByTagName('parsererror').length ? null : doc;
};

const XSL_NS = 'http://www.w3.org/1999/XSL/Transform';

function collectTexts(doc: Document): string[] {
    const out: string[] = [];
    const walk = (node: Node) => {
        for (const child of Array.from(node.childNodes)) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const el = child as Element;
                const local = el.localName.toLowerCase();
                if (local === 'style' || local === 'script' || local === 'title') continue;
                if (el.namespaceURI === XSL_NS && local !== 'text' && local !== 'template' && local !== 'if' && local !== 'when'
                    && local !== 'otherwise' && local !== 'choose' && local !== 'for-each' && local !== 'stylesheet' && local !== 'transform') continue;
                walk(el);
            } else if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
                const t = (child.nodeValue ?? '').replace(/\s+/g, ' ').trim();
                if (isCustomText(t)) out.push(t);
            }
        }
    };
    walk(doc.documentElement);
    return out;
}

function collectImages(text: string): XsltImage[] {
    const seen = new Set<string>();
    const out: XsltImage[] = [];
    const re = /(data:image\/(?:png|jpe?g|gif|svg\+xml|webp|bmp);base64,[A-Za-z0-9+/=\s]{200,})|(https?:\/\/[^"'\s<>]+\.(?:png|jpe?g|gif|svg|webp))/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
        const src = (m[1] ?? m[2]).replace(/\s+/g, '');
        if (seen.has(src)) continue;
        seen.add(src);
        const before = text.slice(Math.max(0, m.index - 400), m.index);
        const after = text.slice(m.index + m[0].length, m.index + m[0].length + 200);
        const hint = fold(`${before.slice(-260)} ${after}`);
        const gib = /\bgib\b|gelir idaresi|gib[_-]?logo|e-?fatura[_-]?logo|efatura\.gov/.test(hint) || /gib\.gov\.tr/i.test(src);
        const stamp = /kase|imza|sign|stamp|muhur/.test(hint);
        const logo = /logo/.test(hint);
        out.push({ src, hint: hint.slice(-120), gib, guess: gib ? 'skip' : stamp && !logo ? 'stamp' : 'logo' });
    }
    // İlk "logo" adayı dışındakileri varsayılan olarak kullanma; kullanıcı seçer.
    let logoTaken = false;
    let stampTaken = false;
    for (const img of out) {
        if (img.guess === 'logo') {
            if (logoTaken) img.guess = 'skip';
            logoTaken = true;
        } else if (img.guess === 'stamp') {
            if (stampTaken) img.guess = 'skip';
            stampTaken = true;
        }
    }
    return out.slice(0, 8);
}

function collectBanks(plain: string): BankAccount[] {
    const out: BankAccount[] = [];
    const re = /TR\s?\d{2}(?:\s?[0-9]{4}){5}\s?[0-9]{2}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(plain))) {
        const iban = normalizeIban(m[0]);
        if (validateIban(iban) || out.some(b => normalizeIban(b.iban) === iban)) continue;
        const around = plain.slice(Math.max(0, m.index - 160), m.index + m[0].length + 60);
        const before = plain.slice(Math.max(0, m.index - 160), m.index);
        const bank = [...BANKS].sort((a, b) => b.length - a.length).find(b => fold(before).includes(fold(b))) ?? '';
        let branch = /([A-ZÇĞİÖŞÜ][\wçğıöşüÇĞİÖŞÜ./ -]{2,30})\s+Şube(?:si)?/u.exec(before)?.[1]?.trim() ?? '';
        const at = bank ? fold(branch).indexOf(fold(bank)) : -1;
        if (at >= 0) branch = branch.slice(at + bank.length).replace(/^\s*(BBVA|A\.?Ş\.?|Bankası|Bank)\b\s*/i, '').trim();
        const f = fold(around);
        const currency = /\b(usd|dolar)\b|\$/.test(f) ? 'USD' : /\b(eur|euro|avro)\b|€/.test(f) ? 'EUR' : /\b(gbp|sterlin)\b|£/.test(f) ? 'GBP' : 'TRY';
        out.push({ bank: bank || 'Banka', branch, holder: '', iban: formatIban(iban), currency });
    }
    return out.slice(0, 6);
}

function accentOf(text: string): string | null {
    const css = Array.from(text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)).map(m => m[1]).join('\n');
    const counts = new Map<string, number>();
    for (const m of css.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)) {
        let h = m[1].toLowerCase();
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (max - min < 40 || max < 50) continue;
        counts.set(`#${h}`, (counts.get(`#${h}`) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export function analyzeXslt(text: string): XsltAnalysis {
    const doc = parseXml(text);
    const texts = doc ? collectTexts(doc) : [];
    const plain = doc ? texts.join('\n') + '\n' + (doc.documentElement.textContent ?? '') : text.replace(/<[^>]+>/g, ' ');
    const banks = collectBanks(plain);
    const ibanFree = texts.filter(t => !/TR\s?\d{2}(?:\s?\d{4}){2}/.test(t));
    const unique = Array.from(new Set(ibanFree)).filter(t => t.length <= 400).slice(0, 14);
    const sections = FEATURE_PATHS.filter(([re]) => re.test(text)).map(([, id]) => id);
    if (/yalniz|yaziyla|yazi ile/.test(fold(text))) sections.push('yaziyla');
    return { images: collectImages(text), banks, texts: unique, sections: Array.from(new Set(sections)), accentHint: accentOf(text) };
}
