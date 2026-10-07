/**
 * Soru motoru: tasarım yapay zekasının yöneticiye sırayla sorduğu sorular,
 * belge tipine özel bölüm seçenekleri ve cevap → üretici parametresi dönüşümü.
 */
import { CATEGORIES, SECTORS } from '../../sector-templates/types';
import { WIZARD_DOC_TYPES, type WizardDocType } from '../../wizard/docTypes';
import type { Answers, BankAccount, DesignParams, TextKey } from './types';
import {
    BANK_POSITIONS, COLOR_MODES, DEFAULT_ACCENT, FONTS, LOGO_POSITIONS, LOGO_SIZES, PAPERS, QR_POSITIONS, STYLES, TEXT_FIELDS,
} from './vocab';
import { isHex, rgbToHex } from './utils';

// ---------------------------------------------------------------------------
// Belge tipi grupları
// ---------------------------------------------------------------------------
export const INVOICE_DOCS = ['fatura', 'arsiv', 'ihracat', 'smm', 'bilet'];
export const CREDIT_NOTE_DOCS = ['mustahsil', 'gider-pusulasi', 'doviz', 'dekont', 'sigorta-komisyon'];
export const DESPATCH_DOCS = ['irsaliye'];
export const RECEIPT_ADVICE_DOCS = ['irsaliye-yanit'];
export const EBILET_DOCS = ['bilet-rapor', 'bilet-yolcu'];
export const UBL_DOCS = [...INVOICE_DOCS, ...DESPATCH_DOCS, ...RECEIPT_ADVICE_DOCS, ...CREDIT_NOTE_DOCS];
/** Banka hesabı sorusunun sorulduğu belgeler (tahsilat yapılan belgeler). */
export const BANK_DOCS = ['fatura', 'arsiv', 'ihracat', 'smm', 'sigorta-komisyon'];
/** Karekod taşıyan belgeler (GİB karekod standardı). */
export const QR_DOCS = [...INVOICE_DOCS, ...DESPATCH_DOCS, ...CREDIT_NOTE_DOCS];
/** 80 mm fiş düzeni sunulan belgeler. */
export const RECEIPT_PAPER_DOCS = ['arsiv'];

export const docTypeById = (id: string): WizardDocType | undefined => WIZARD_DOC_TYPES.find(d => d.id === id);

/** XSLT editöründeki modül kimliği. */
export const moduleIdOf = (docTypeId: string): string => docTypeById(docTypeId)?.defaults[0]?.moduleId ?? docTypeId;

// ---------------------------------------------------------------------------
// Bölümler (aç / kapa)
// ---------------------------------------------------------------------------
export interface SectionDef {
    id: string;
    label: string;
    help?: string;
    docTypes: string[];
    /** Varsayılan açık olduğu belge tipleri ('*' = hepsinde). */
    defaultOn: string[] | '*';
    /** NLU anahtar kelimeleri (katlanmış). */
    keywords: string[];
}

const INV_CN = [...INVOICE_DOCS, ...CREDIT_NOTE_DOCS];

export const SECTION_DEFS: SectionDef[] = [
    { id: 'notlar', label: 'Belge notları', docTypes: UBL_DOCS, defaultOn: '*', keywords: ['not', 'notlar', 'aciklamalar'] },
    {
        id: 'kdvDokum', label: 'KDV / vergi oranları dökümü', help: 'Oran bazında matrah ve vergi tablosu',
        docTypes: ['fatura', 'arsiv', 'ihracat', 'bilet', 'gider-pusulasi', 'dekont', 'sigorta-komisyon'], defaultOn: ['fatura', 'arsiv', 'gider-pusulasi'],
        keywords: ['kdv dokumu', 'vergi dokumu', 'kdv oranlari', 'kdv detay', 'oran dokumu', 'matrah'],
    },
    { id: 'iskonto', label: 'İskonto sütunu', docTypes: ['fatura', 'arsiv', 'ihracat'], defaultOn: ['fatura', 'arsiv'], keywords: ['iskonto', 'indirim', 'iskontolu'] },
    { id: 'kdvSutun', label: 'Satırda KDV tutarı', docTypes: ['fatura', 'arsiv', 'ihracat', 'bilet', 'gider-pusulasi'], defaultOn: [], keywords: ['kdv sutunu', 'satir kdv', 'kdv tutari sutun'] },
    {
        id: 'tevkifat', label: 'Tevkifat / istisna bölümü', help: 'KDV tevkifatı satırları ve istisna / muafiyet sebepleri',
        docTypes: ['fatura', 'arsiv', 'ihracat', 'smm'], defaultOn: ['fatura', 'arsiv', 'ihracat', 'smm'], keywords: ['tevkifat', 'istisna', 'muafiyet', 'tevkifatli'],
    },
    {
        id: 'odeme', label: 'Ödeme koşulları ve vade', docTypes: ['fatura', 'arsiv', 'ihracat', 'smm', 'bilet'], defaultOn: ['fatura', 'ihracat', 'bilet'],
        keywords: ['vade', 'odeme kosul', 'odeme bilgi', 'odeme sekli', 'odeme sartlari', 'vade tarihi'],
    },
    {
        id: 'referans', label: 'Sipariş / irsaliye referansları', docTypes: ['fatura', 'arsiv', 'ihracat', 'irsaliye', 'irsaliye-yanit'],
        defaultOn: ['fatura', 'ihracat', 'irsaliye', 'irsaliye-yanit'], keywords: ['siparis', 'irsaliye no', 'referans', 'siparis no'],
    },
    { id: 'kur', label: 'Döviz kuru gösterimi', docTypes: ['fatura', 'arsiv', 'ihracat', 'smm', 'doviz'], defaultOn: ['fatura', 'ihracat', 'smm', 'doviz'], keywords: ['kur', 'doviz kuru', 'kur bilgisi', 'tl karsiligi'] },
    {
        id: 'yaziyla', label: '“Yalnız … TL” yazıyla toplam', docTypes: INV_CN.filter(d => d !== 'doviz'), defaultOn: ['fatura', 'arsiv', 'smm', 'mustahsil', 'gider-pusulasi'],
        keywords: ['yaziyla', 'yalniz', 'yazi ile', 'yaziyla toplam'],
    },
    {
        id: 'internetSatis', label: 'İnternet satışı bilgileri', help: 'Gönderim tarihi, taşıyıcı (kargo), ödeme aracı ve satış sitesi',
        docTypes: ['arsiv'], defaultOn: [], keywords: ['internet satis', 'internetten', 'e-ticaret', 'eticaret', 'online satis', 'kargo', 'tasiyici'],
    },
    { id: 'ihracatBilgi', label: 'Teslim şartı, GTİP ve gümrük', docTypes: ['ihracat'], defaultOn: ['ihracat'], keywords: ['gtip', 'teslim sarti', 'incoterm', 'gumruk'] },
    { id: 'sefer', label: 'Sefer / etkinlik kartı', docTypes: ['bilet'], defaultOn: ['bilet'], keywords: ['sefer', 'etkinlik', 'ucus', 'yolculuk'] },
    { id: 'meslek', label: 'Meslek / unvan satırı', docTypes: ['smm'], defaultOn: ['smm'], keywords: ['meslek', 'unvan'] },
    { id: 'stopaj', label: 'Stopaj (gelir vergisi kesintisi)', docTypes: ['smm', 'mustahsil'], defaultOn: ['smm', 'mustahsil'], keywords: ['stopaj', 'gelir vergisi', 'gv stopaj'] },
    { id: 'netOdenecek', label: 'Net ücret / net ödenecek vurgusu', docTypes: ['smm'], defaultOn: ['smm'], keywords: ['net odenecek', 'net ucret', 'net tutar'] },
    {
        id: 'kesinti', label: 'Borsa tescil, mera fonu, SGK / Bağ-Kur kesintileri', docTypes: ['mustahsil'], defaultOn: ['mustahsil'],
        keywords: ['borsa', 'bag-kur', 'bagkur', 'sgk', 'mera', 'kesinti', 'kesintiler'],
    },
    { id: 'kunye', label: 'Ürün künye numarası', docTypes: ['mustahsil'], defaultOn: ['mustahsil'], keywords: ['kunye', 'hks'] },
    { id: 'smsDogrulama', label: 'SMS doğrulama bilgisi', docTypes: ['mustahsil', 'gider-pusulasi'], defaultOn: ['mustahsil', 'gider-pusulasi'], keywords: ['sms', 'dogrulama kodu', 'sms kodu'] },
    { id: 'iadeBilgi', label: 'İade belgesi ve kargo bilgisi', docTypes: ['gider-pusulasi'], defaultOn: ['gider-pusulasi'], keywords: ['iade', 'iade belgesi', 'kargo'] },
    { id: 'odemeSekli', label: 'Ödeme şekilleri ve hesaplar', docTypes: ['doviz'], defaultOn: ['doviz'], keywords: ['odeme sekli', 'hesaplar', 'hesap no'] },
    { id: 'islemDetay', label: 'İşlem referansları', docTypes: ['dekont'], defaultOn: ['dekont'], keywords: ['islem detay', 'referans', 'islem no'] },
    { id: 'alindi', label: 'Vergi / gümrük tahsil alındısı bilgisi', docTypes: ['dekont'], defaultOn: ['dekont'], keywords: ['alindi', 'tahsil', 'vergi dairesi', 'gumruk'] },
    { id: 'donem', label: 'Komisyon dönemi', docTypes: ['sigorta-komisyon'], defaultOn: ['sigorta-komisyon'], keywords: ['donem', 'komisyon donemi'] },
    { id: 'arac', label: 'Araç plakası / dorse', docTypes: ['irsaliye'], defaultOn: ['irsaliye'], keywords: ['plaka', 'arac', 'dorse', 'arac plakasi'] },
    { id: 'sofor', label: 'Şoför adı, TCKN ve taşıyıcı', docTypes: ['irsaliye'], defaultOn: ['irsaliye'], keywords: ['sofor', 'surucu', 'tasiyici', 'tckn'] },
    { id: 'sevkAdres', label: 'Sevk / teslimat adresi', docTypes: ['irsaliye'], defaultOn: ['irsaliye'], keywords: ['sevk adresi', 'teslimat adresi', 'teslim adresi'] },
    { id: 'sevkTarih', label: 'Fiili sevk tarihi ve saati', docTypes: ['irsaliye'], defaultOn: ['irsaliye'], keywords: ['sevk tarihi', 'fiili sevk', 'sevk saati', 'gercek sevk'] },
    { id: 'paket', label: 'Palet / koli bilgisi', docTypes: ['irsaliye'], defaultOn: [], keywords: ['palet', 'koli', 'ambalaj', 'paket'] },
    { id: 'teslimImza', label: 'Teslim eden / teslim alan imza alanı', docTypes: ['irsaliye'], defaultOn: ['irsaliye'], keywords: ['imza', 'teslim alan', 'teslim imza', 'imza alani'] },
    { id: 'yanitDurum', label: 'Kabul / red durumu ve red nedenleri', docTypes: ['irsaliye-yanit'], defaultOn: ['irsaliye-yanit'], keywords: ['red', 'kabul', 'durum', 'red nedeni'] },
    { id: 'imza', label: 'İmza / kaşe alanı', docTypes: [...INV_CN, 'irsaliye-yanit'], defaultOn: ['mustahsil', 'gider-pusulasi'], keywords: ['imza', 'kase', 'imza alani', 'kase alani'] },
    { id: 'ozet', label: 'Özet gösterge kartları', docTypes: EBILET_DOCS, defaultOn: EBILET_DOCS, keywords: ['ozet', 'gosterge', 'kartlar', 'istatistik'] },
    { id: 'giderGosteren', label: 'Gider gösteren sütunu', docTypes: ['bilet-rapor'], defaultOn: ['bilet-rapor'], keywords: ['gider gosteren'] },
    { id: 'iptal', label: 'İptal edilen biletler tablosu', docTypes: ['bilet-rapor'], defaultOn: ['bilet-rapor'], keywords: ['iptal', 'iptaller'] },
    { id: 'isleten', label: 'Taşıtı işleten ve komisyon', docTypes: ['bilet-yolcu'], defaultOn: ['bilet-yolcu'], keywords: ['isleten', 'komisyon', 'arac isleten'] },
    { id: 'yolcuImza', label: 'Şoför / yetkili imza alanı', docTypes: ['bilet-yolcu'], defaultOn: ['bilet-yolcu'], keywords: ['imza', 'sofor imza', 'yetkili imza'] },
];

export const sectionsFor = (docTypeId: string): SectionDef[] => SECTION_DEFS.filter(s => s.docTypes.includes(docTypeId));
export const sectionDef = (id: string): SectionDef | undefined => SECTION_DEFS.find(s => s.id === id);

export const defaultSections = (docTypeId: string): Record<string, boolean> =>
    Object.fromEntries(sectionsFor(docTypeId).map(s => [s.id, s.defaultOn === '*' || s.defaultOn.includes(docTypeId)]));

export const isSectionOn = (params: Pick<DesignParams, 'docTypeId' | 'sections'>, id: string): boolean => {
    const def = sectionDef(id);
    if (!def || !def.docTypes.includes(params.docTypeId)) return false;
    return params.sections[id] ?? (def.defaultOn === '*' || def.defaultOn.includes(params.docTypeId));
};

// ---------------------------------------------------------------------------
// IBAN
// ---------------------------------------------------------------------------
export const normalizeIban = (s: string): string => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** TR IBAN: 26 karakter, mod-97 = 1. */
export function validateIban(raw: string): string | null {
    const iban = normalizeIban(raw);
    if (!iban) return 'IBAN boş';
    if (!iban.startsWith('TR')) return 'IBAN TR ile başlamalı';
    if (iban.length !== 26) return `TR IBAN 26 karakter olmalı (${iban.length} girildi)`;
    if (!/^TR\d{24}$/.test(iban)) return 'TR\'den sonra yalnızca rakam olmalı';
    const rearranged = iban.slice(4) + iban.slice(0, 4);
    const digits = rearranged.replace(/[A-Z]/g, c => String(c.charCodeAt(0) - 55));
    let rem = 0;
    for (const ch of digits) rem = (rem * 10 + Number(ch)) % 97;
    return rem === 1 ? null : 'IBAN kontrol basamağı hatalı (mod-97)';
}

export const formatIban = (raw: string): string => normalizeIban(raw).replace(/(.{4})/g, '$1 ').trim();

export const emptyBank = (): BankAccount => ({ bank: '', branch: '', holder: '', iban: '', currency: 'TRY' });

export const BANK_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

// ---------------------------------------------------------------------------
// Logo: küçültme + baskın renk
// ---------------------------------------------------------------------------
const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Görsel okunamadı'));
    img.src = src;
});

const readAsDataUrl = (file: Blob) => new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Dosya okunamadı'));
    r.readAsDataURL(file);
});

/** Logoda en baskın doygun renk; beyaz, siyah, gri ve saydam pikseller sayılmaz. */
export function dominantColor(img: CanvasImageSource, w: number, h: number): string | null {
    const size = 64;
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, size / Math.max(w, h));
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const buckets = new Map<number, { w: number; r: number; g: number; b: number }>();
    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
        if (a < 128) continue;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        if (max > 245 && min > 230) continue;
        if (max < 25) continue;
        if (sat < 0.18) continue;
        const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
        const weight = 0.4 + sat;
        const cur = buckets.get(key) ?? { w: 0, r: 0, g: 0, b: 0 };
        cur.w += weight;
        cur.r += r * weight;
        cur.g += g * weight;
        cur.b += b * weight;
        buckets.set(key, cur);
    }
    let best: { w: number; r: number; g: number; b: number } | null = null;
    for (const v of buckets.values()) if (!best || v.w > best.w) best = v;
    return best ? rgbToHex(best.r / best.w, best.g / best.w, best.b / best.w) : null;
}

export interface ProcessedLogo { dataUrl: string; color: string | null; width: number; height: number }

/** Logoyu en fazla 600 px genişliğe küçültür; PNG saydamlığı korunur, diğerleri JPEG'e sıkıştırılır. */
export async function processLogo(file: File, maxWidth = 600): Promise<ProcessedLogo> {
    if (!/^image\//.test(file.type)) throw new Error('Lütfen bir görsel dosyası seçin (PNG, JPEG, SVG)');
    const original = await readAsDataUrl(file);
    const img = await loadImage(original);
    const w = img.naturalWidth || 300;
    const h = img.naturalHeight || 150;
    const scale = Math.min(1, maxWidth / w);
    const cw = Math.max(1, Math.round(w * scale));
    const ch = Math.max(1, Math.round(h * scale));
    const color = dominantColor(img, w, h);
    const keepPng = file.type === 'image/png' || file.type === 'image/svg+xml' || file.type === 'image/gif' || file.type === 'image/webp';
    if (scale === 1 && (file.type === 'image/png' || file.type === 'image/jpeg') && file.size < 350_000) {
        return { dataUrl: original, color, width: cw, height: ch };
    }
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { dataUrl: original, color, width: cw, height: ch };
    if (!keepPng) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cw, ch);
    }
    ctx.drawImage(img, 0, 0, cw, ch);
    const dataUrl = keepPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.86);
    return { dataUrl, color, width: cw, height: ch };
}

// ---------------------------------------------------------------------------
// Sorular
// ---------------------------------------------------------------------------
export type QuestionType = 'choice' | 'multi' | 'text' | 'textarea' | 'color' | 'image' | 'bank-list' | 'toggle';

export interface QOption { id: string; label: string; help?: string; color?: string }

export interface Question {
    id: string;
    label: string;
    help?: string;
    type: QuestionType;
    /** Sabit liste ya da önceki cevaplara göre hesaplanan liste. */
    options?: QOption[] | ((a: Answers) => QOption[]);
    default?: unknown | ((a: Answers) => unknown);
    /** Sorunun sorulup sorulmayacağı. */
    when?: (a: Answers) => boolean;
    optional?: boolean;
    placeholder?: string;
    /** Cevabın etkilediği üretici parametreleri. */
    maps: string[];
}

const docOf = (a: Answers) => String(a.docTypeId ?? '');
const inDocs = (docs: string[]) => (a: Answers) => docs.includes(docOf(a));
const opts = <T extends string>(list: { id: T; label: string; help?: string }[]): QOption[] => list.map(x => ({ id: x.id, label: x.label, help: x.help }));
const textKeysOf = (a: Answers): string[] => (Array.isArray(a.textKeys) ? a.textKeys.map(String) : []);
const banksOf = (a: Answers): BankAccount[] => (Array.isArray(a.banks) ? (a.banks as BankAccount[]) : []);

export const textFieldsFor = (docTypeId: string) => TEXT_FIELDS.filter(f => !f.invoiceOnly || INVOICE_DOCS.includes(docTypeId) || docTypeId === 'gider-pusulasi');

export const QUESTIONS: Question[] = [
    {
        id: 'docTypeId', label: 'Hangi belge tipi için tasarım yapalım?', type: 'choice', maps: ['docTypeId'],
        help: 'Belge tipi XSLT\'nin yapısını (Fatura, İrsaliye, CreditNote, e-Bilet) ve zorunlu GİB alanlarını belirler.',
        options: WIZARD_DOC_TYPES.map(d => ({ id: d.id, label: d.label, help: d.description, color: d.color })),
    },
    {
        id: 'category', label: 'Firma hangi kategoride?', type: 'choice', maps: ['category'],
        options: CATEGORIES.map(c => ({ id: c.id, label: c.label, color: c.color })),
    },
    {
        id: 'sector', label: 'Sektörü seçelim', type: 'choice', maps: ['sector'],
        help: 'Sektör; renk önerisini, öğrenilmiş tercihleri ve hazır metin önerilerini etkiler.',
        options: a => SECTORS.filter(s => !a.category || s.category === a.category).map(s => ({ id: s.id, label: s.label, color: s.color })),
    },
    {
        id: 'companyName', label: 'Firma adı / unvanı nedir?', type: 'text', optional: true, maps: ['companyName'],
        help: 'Yalnızca önizlemede örnek verideki satıcı adının yerine yazılır; XSLT gerçek belgedeki unvanı kullanır.',
        placeholder: 'Ör. Deniz Turizm Otelcilik A.Ş.',
    },
    {
        id: 'profession', label: 'Makbuzda görünecek meslek / unvan', type: 'text', optional: true, maps: ['profession'],
        when: inDocs(['smm']), placeholder: 'Ör. Serbest Muhasebeci Mali Müşavir', default: 'Serbest Meslek Erbabı',
    },
    {
        id: 'logo', label: 'Firma logosunu yükleyin', type: 'image', optional: true, maps: ['logo', 'accent'],
        help: 'PNG / JPEG / SVG. En fazla 600 px genişliğe küçültülür; logodaki baskın renk ana renk olarak önerilir.',
    },
    {
        id: 'logoPosition', label: 'Logo nerede dursun?', type: 'choice', maps: ['logoPosition'], options: opts(LOGO_POSITIONS), default: 'sol',
    },
    {
        id: 'logoSize', label: 'Logo boyutu', type: 'choice', maps: ['logoSize'], options: opts(LOGO_SIZES), default: 'orta',
        when: a => typeof a.logo === 'string' && a.logo.length > 0,
    },
    {
        id: 'banks', label: 'Banka hesap bilgilerini ekleyelim mi?', type: 'bank-list', optional: true, maps: ['banks'],
        help: 'Her hesap için banka, şube, hesap sahibi, IBAN ve para birimi. IBAN mod-97 ile doğrulanır.',
        when: inDocs(BANK_DOCS), default: [],
    },
    {
        id: 'bankPosition', label: 'Banka bilgileri nerede dursun?', type: 'choice', maps: ['bankPosition'], options: opts(BANK_POSITIONS), default: 'alt',
        when: a => BANK_DOCS.includes(docOf(a)) && banksOf(a).length > 0,
    },
    { id: 'style', label: 'Tasarım stili hangisi olsun?', type: 'choice', maps: ['style'], options: opts(STYLES), default: 'modern' },
    {
        id: 'accent', label: 'Ana renk', type: 'color', maps: ['accent'],
        help: 'Logodan, sektörden ya da önceki beğenilen tasarımlardan önerilen renklerden birini seçin.',
        default: (a: Answers) => SECTORS.find(s => s.id === a.sector)?.color ?? DEFAULT_ACCENT,
    },
    { id: 'colorMode', label: 'Renk kullanımı', type: 'choice', maps: ['colorMode'], options: opts(COLOR_MODES), default: 'dengeli' },
    { id: 'font', label: 'Yazı tipi', type: 'choice', maps: ['font'], options: FONTS.map(f => ({ id: f.id, label: f.label })), default: 'segoe' },
    {
        id: 'paper', label: 'Kağıt düzeni', type: 'choice', maps: ['paper'], options: opts(PAPERS), default: 'a4',
        help: '80 mm fiş düzeni perakende / kasa satışlarında termal yazıcı için tek sütunlu görünüm üretir.',
        when: inDocs(RECEIPT_PAPER_DOCS),
    },
    {
        id: 'sections', label: 'Belgede hangi bölümler olsun?', type: 'multi', maps: ['sections'],
        help: 'Belge tipine özel bölümler. Seçilmeyenler tasarıma eklenmez.',
        options: a => sectionsFor(docOf(a)).map(s => ({ id: s.id, label: s.label, help: s.help })),
        default: (a: Answers) => Object.entries(defaultSections(docOf(a))).filter(([, on]) => on).map(([id]) => id),
        when: a => sectionsFor(docOf(a)).length > 0,
    },
    {
        id: 'qrPosition', label: 'Karekod nerede olsun?', type: 'choice', maps: ['qrPosition'], options: opts(QR_POSITIONS), default: 'sag-ust',
        help: 'GİB karekod standardı karekodun sağ üst köşede olmasını önerir.',
        when: a => QR_DOCS.includes(docOf(a)) && a.paper !== 'fis80',
    },
    {
        id: 'textKeys', label: 'Belgeye eklemek istediğiniz özel yazılar var mı?', type: 'multi', optional: true, maps: ['texts'],
        options: a => textFieldsFor(docOf(a)).map(f => ({ id: f.id, label: f.label })), default: [],
    },
    ...TEXT_FIELDS.map((f): Question => ({
        id: `text_${f.id}`, label: `${f.label} metnini yazın`, type: f.multiline ? 'textarea' : 'text', optional: true,
        placeholder: f.placeholder, maps: [`texts.${f.id}`],
        when: a => textKeysOf(a).includes(f.id),
    })),
    {
        id: 'extra', label: 'Son olarak eklemek istediğiniz başka bir şey var mı?', type: 'textarea', optional: true, maps: ['*'],
        help: 'Serbestçe yazın: "lacivert ve sade olsun, logo sağda, banka altta, yazıyla toplam olsun" gibi. Anahtar kelimeler parametreye çevrilir.',
        placeholder: 'Ör. Kurumsal ama sade olsun, büyük logo, karekod sağ üstte, imza alanı ekle',
    },
];

export const questionById = (id: string): Question | undefined => QUESTIONS.find(q => q.id === id);

export const optionsOf = (q: Question, a: Answers): QOption[] => (typeof q.options === 'function' ? q.options(a) : q.options ?? []);

export const defaultOf = (q: Question, a: Answers): unknown => (typeof q.default === 'function' ? (q.default as (a: Answers) => unknown)(a) : q.default);

export const visibleQuestions = (a: Answers): Question[] => QUESTIONS.filter(q => !q.when || q.when(a));

/** Cevaplanmamış ilk görünür soru; hepsi cevaplıysa null. */
export const nextQuestion = (a: Answers): Question | null => visibleQuestions(a).find(q => !(q.id in a)) ?? null;

// ---------------------------------------------------------------------------
// Cevaplar ↔ parametreler
// ---------------------------------------------------------------------------
const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    (typeof value === 'string' && (allowed as readonly string[]).includes(value) ? value as T : fallback);

export function defaultParams(docTypeId: string, category = '', sector = ''): DesignParams {
    const sectorColor = SECTORS.find(s => s.id === sector)?.color;
    return {
        docTypeId, category, sector, companyName: '', logo: null, profession: docTypeId === 'smm' ? 'Serbest Meslek Erbabı' : '',
        style: 'modern', accent: sectorColor ?? DEFAULT_ACCENT, font: 'segoe', fontScale: 'normal', colorMode: 'dengeli',
        paper: 'a4', logoPosition: 'sol', logoSize: 'orta', qrPosition: 'sag-ust', bankPosition: 'alt', banks: [],
        sections: defaultSections(docTypeId), texts: {}, extra: '', variant: 0,
    };
}

export function answersToParams(a: Answers): DesignParams {
    const docTypeId = String(a.docTypeId ?? 'fatura');
    const base = defaultParams(docTypeId, String(a.category ?? ''), String(a.sector ?? ''));
    const sections = { ...base.sections };
    if (Array.isArray(a.sections)) {
        const on = new Set(a.sections.map(String));
        for (const id of Object.keys(sections)) sections[id] = on.has(id);
    }
    const texts: Partial<Record<TextKey, string>> = {};
    for (const key of textKeysOf(a)) {
        const v = a[`text_${key}`];
        if (typeof v === 'string' && v.trim()) texts[key as TextKey] = v.trim();
    }
    const banks = banksOf(a)
        .filter(b => b && (b.bank || b.iban))
        .map(b => ({ bank: String(b.bank ?? ''), branch: String(b.branch ?? ''), holder: String(b.holder ?? ''), iban: formatIban(String(b.iban ?? '')), currency: String(b.currency || 'TRY') }));
    return {
        ...base,
        companyName: typeof a.companyName === 'string' ? a.companyName.trim() : '',
        profession: typeof a.profession === 'string' ? a.profession.trim() : base.profession,
        logo: typeof a.logo === 'string' && a.logo.startsWith('data:image/') ? a.logo : null,
        logoPosition: pick(a.logoPosition, ['sol', 'sag', 'orta'] as const, base.logoPosition),
        logoSize: pick(a.logoSize, ['kucuk', 'orta', 'buyuk'] as const, base.logoSize),
        banks,
        bankPosition: pick(a.bankPosition, ['alt', 'yan'] as const, base.bankPosition),
        style: pick(a.style, STYLES.map(s => s.id), base.style),
        accent: isHex(a.accent) ? a.accent.toLowerCase() : base.accent,
        colorMode: pick(a.colorMode, COLOR_MODES.map(c => c.id), base.colorMode),
        font: pick(a.font, FONTS.map(f => f.id), base.font),
        fontScale: pick(a.fontScale, ['kucuk', 'normal', 'buyuk'] as const, base.fontScale),
        paper: RECEIPT_PAPER_DOCS.includes(docTypeId) ? pick(a.paper, ['a4', 'fis80'] as const, 'a4') : 'a4',
        qrPosition: pick(a.qrPosition, ['sag-ust', 'sol-ust', 'alt'] as const, base.qrPosition),
        sections,
        texts,
        extra: typeof a.extra === 'string' ? a.extra.trim() : '',
    };
}

/** Parametreleri soru cevaplarına geri yazar (geri dönüp düzenleme için). */
export function paramsToAnswers(p: DesignParams, prev: Answers = {}): Answers {
    const textKeys = (Object.keys(p.texts) as TextKey[]).filter(k => p.texts[k]);
    const out: Answers = {
        ...prev,
        docTypeId: p.docTypeId, category: p.category, sector: p.sector, companyName: p.companyName, logo: p.logo ?? '',
        logoPosition: p.logoPosition, style: p.style, accent: p.accent, colorMode: p.colorMode, font: p.font, fontScale: p.fontScale,
        sections: Object.entries(p.sections).filter(([, on]) => on).map(([id]) => id), textKeys, extra: p.extra,
    };
    if (p.logo) out.logoSize = p.logoSize;
    if (p.docTypeId === 'smm') out.profession = p.profession;
    if (BANK_DOCS.includes(p.docTypeId)) out.banks = p.banks;
    if (p.banks.length) out.bankPosition = p.bankPosition;
    if (RECEIPT_PAPER_DOCS.includes(p.docTypeId)) out.paper = p.paper;
    if (QR_DOCS.includes(p.docTypeId) && p.paper !== 'fis80') out.qrPosition = p.qrPosition;
    for (const k of textKeys) out[`text_${k}`] = p.texts[k];
    return out;
}

/** Cevabın sohbet balonunda kısa gösterimi. */
export function answerSummary(q: Question, value: unknown, a: Answers): string {
    if (value === undefined || value === null || value === '') return 'Atlandı';
    switch (q.type) {
        case 'choice': return optionsOf(q, a).find(o => o.id === value)?.label ?? String(value);
        case 'multi': {
            const ids = Array.isArray(value) ? value.map(String) : [];
            if (!ids.length) return 'Hiçbiri';
            const labels = optionsOf(q, a).filter(o => ids.includes(o.id)).map(o => o.label);
            return labels.length > 4 ? `${labels.slice(0, 4).join(', ')} +${labels.length - 4}` : labels.join(', ');
        }
        case 'image': return typeof value === 'string' && value ? 'Logo yüklendi' : 'Logo yok';
        case 'bank-list': {
            const banks = Array.isArray(value) ? (value as BankAccount[]) : [];
            return banks.length ? banks.map(b => b.bank || 'Banka').join(', ') : 'Banka bilgisi yok';
        }
        case 'toggle': return value ? 'Evet' : 'Hayır';
        default: return String(value);
    }
}
