/**
 * Tasarım yapay zekası ortak tipleri. Soru motoru cevapları (Answers) toplar,
 * cevaplar DesignParams'a çevrilir; üretici yalnızca DesignParams ile çalışır.
 */

export type StyleId = 'klasik' | 'modern' | 'kurumsal' | 'minimal' | 'kompakt';
export type FontId = 'segoe' | 'arial' | 'trebuchet' | 'georgia' | 'tahoma' | 'calibri';
export type FontScale = 'kucuk' | 'normal' | 'buyuk';
export type ColorMode = 'canli' | 'dengeli' | 'sade';
export type PaperId = 'a4' | 'fis80';
export type LogoPosition = 'sol' | 'sag' | 'orta';
export type LogoSize = 'kucuk' | 'orta' | 'buyuk';
export type QrPosition = 'sag-ust' | 'sol-ust' | 'alt';
export type BankPosition = 'alt' | 'yan';
export type TextKey = 'slogan' | 'headerNote' | 'footer' | 'thanks' | 'returnPolicy' | 'contact' | 'legal';

export interface BankAccount {
    bank: string;
    branch: string;
    holder: string;
    iban: string;
    currency: string;
}

export interface DesignParams {
    docTypeId: string;
    category: string;
    sector: string;
    /** Yalnızca önizlemede örnek XML'deki satıcı adının yerine yazılır (e-Bilet raporlarında başlıkta). */
    companyName: string;
    /** data:image/...;base64 */
    logo: string | null;
    /** e-SMM: meslek / unvan satırı. */
    profession: string;
    style: StyleId;
    accent: string;
    font: FontId;
    fontScale: FontScale;
    colorMode: ColorMode;
    paper: PaperId;
    logoPosition: LogoPosition;
    logoSize: LogoSize;
    qrPosition: QrPosition;
    bankPosition: BankPosition;
    banks: BankAccount[];
    /** Bölüm kimliği → açık/kapalı (questions.ts SECTION_DEFS). */
    sections: Record<string, boolean>;
    texts: Partial<Record<TextKey, string>>;
    /** Serbest metin ek istekler (NLU ile çözümlenir). */
    extra: string;
    /** Varyasyon tohumu; aynı parametre + tohum aynı XSLT'yi üretir. */
    variant: number;
}

/** NLU ve öğrenmenin parametrelere uyguladığı kısmi değişiklik. */
export type ParamPatch = Partial<Omit<DesignParams, 'sections' | 'texts'>> & {
    sections?: Record<string, boolean>;
    texts?: Partial<Record<TextKey, string>>;
};

export type Answers = Record<string, unknown>;

/** Yönetici düzeltmelerinden öğrenilen kelime → parametre bağları (AiMemoryInput.params.learnedFrom). */
export interface LearnedFrom {
    tokens: string[];
    /** 'style' | 'accent' | 'sections.iskonto' … → değer */
    changes: Record<string, string | boolean>;
}
