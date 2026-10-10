/**
 * Belge dili paketleri. Arayüz dili (üstteki seçici) i18n locale'lerinden gelir;
 * bu paketler yalnız belgenin kendi metinleridir: belge adları, örnek veri
 * metinleri, editörde eklenen obje metinleri ve alan kataloğu etiketleri.
 */
import type { IntlLabels } from '../../xslt-editor/intlCatalog';

/** Ülke belge türleri; UBL tip kodları `countryDocuments.ts` içindedir. */
export type IntlDocKind = 'invoice' | 'credit' | 'corrected' | 'prepayment' | 'partial' | 'selfbilled' | 'despatch';

/** Belge adları, o dilde kullanılan resmî/yaygın adlarıyla (ör. it: Fattura, Nota di credito, Documento di trasporto). */
export type DocTitles = Record<IntlDocKind, string>;

/** Örnek XML'lerdeki serbest metinler. */
export interface SampleTexts {
    /** Fatura notu (ör. "Thank you for your business."). */
    note: string;
    /** Ödeme koşulu (ör. "Payable within 30 days without deduction."). */
    paymentTerms: string;
    /** İade / alacak dekontu gerekçesi. */
    creditNote: string;
    /** Düzeltme faturası gerekçesi. */
    correctedNote: string;
    /** Avans faturası notu; {{order}} sipariş numarasıdır. */
    prepaymentNote: string;
    /** Kısmi fatura notu. */
    partialNote: string;
    /** Avans kalemi adı; {{pct}} yüzde değeridir. */
    prepaymentItem: string;
    /** Belge altı indirim gerekçesi. */
    discount: string;
    /** 1. kalem: ürün adı. */
    product: string;
    /** 1. kalem: ürün açıklaması. */
    productDesc: string;
    /** 2. kalem: saatlik hizmet. */
    service: string;
    /** 3. kalem: aksesuar. */
    accessory: string;
    /** Sevk bildirimi notu. */
    despatchNote: string;
    /** Bekleyen miktar gerekçesi. */
    backorderReason: string;
}

/** Tasarıma eklenen objelerin varsayılan metinleri (editor.doc.* ile aynı anahtarlar). */
export interface DocObjectTexts {
    newText: string;
    /** {{n}} sütun numarası. */
    header: string;
    /** {{n}} hücre numarası. */
    cell: string;
    fieldName: string;
    image: string;
    chooseImage: string;
    newColumn: string;
    computed: string;
    formulaLabel: string;
}

/** Tüm belge dilleri (arayüz dilleri dahil). */
export interface DocTextPack {
    titles: DocTitles;
    sample: SampleTexts;
}

/** Arayüz dili olmayan belge dilleri: obje metinleri ve katalog etiketleri de pakettedir. */
export interface ExtraDocTextPack extends DocTextPack {
    objects: DocObjectTexts;
    catalog: IntlLabels;
}
