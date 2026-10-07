import type { BankPosition, ColorMode, FontId, FontScale, LogoPosition, LogoSize, PaperId, QrPosition, StyleId, TextKey } from './types';

export interface Labeled<T extends string> { id: T; label: string; help?: string }

export const STYLES: Labeled<StyleId>[] = [
    { id: 'klasik', label: 'Klasik', help: 'Çerçeveli tablolar, tırnaklı başlıklar, geleneksel fatura düzeni' },
    { id: 'modern', label: 'Modern', help: 'Renkli başlık bandı, yuvarlak kartlar, ferah satır tablosu' },
    { id: 'kurumsal', label: 'Kurumsal', help: 'Yan şerit, koyu tablo başlığı, düzenli bilgi kutuları' },
    { id: 'minimal', label: 'Minimal', help: 'Bol beyaz alan, ince çizgiler, renk yalnızca vurguda' },
    { id: 'kompakt', label: 'Kompakt', help: 'Küçük yazı, sık satırlar; çok kalemli belgeler tek sayfaya sığar' },
];

export const FONTS: (Labeled<FontId> & { stack: string })[] = [
    { id: 'segoe', label: 'Segoe UI', stack: "'Segoe UI', Tahoma, Arial, sans-serif" },
    { id: 'arial', label: 'Arial', stack: 'Arial, Helvetica, sans-serif' },
    { id: 'calibri', label: 'Calibri', stack: "Calibri, Carlito, 'Segoe UI', Arial, sans-serif" },
    { id: 'trebuchet', label: 'Trebuchet MS', stack: "'Trebuchet MS', 'Segoe UI', Arial, sans-serif" },
    { id: 'tahoma', label: 'Tahoma', stack: "Tahoma, Verdana, 'Segoe UI', sans-serif" },
    { id: 'georgia', label: 'Georgia (tırnaklı)', stack: "Georgia, 'Times New Roman', serif" },
];

export const FONT_SCALES: Labeled<FontScale>[] = [
    { id: 'kucuk', label: 'Küçük' },
    { id: 'normal', label: 'Normal' },
    { id: 'buyuk', label: 'Büyük' },
];

export const COLOR_MODES: Labeled<ColorMode>[] = [
    { id: 'canli', label: 'Canlı', help: 'Başlık ve tablo başlığı renkli dolgu' },
    { id: 'dengeli', label: 'Dengeli', help: 'Açık ton zeminler, renkli vurgular' },
    { id: 'sade', label: 'Sade', help: 'Yazıcı dostu; renk yalnızca başlık ve toplamda' },
];

export const PAPERS: Labeled<PaperId>[] = [
    { id: 'a4', label: 'A4 dikey' },
    { id: 'fis80', label: '80 mm fiş (termal yazıcı)' },
];

export const LOGO_POSITIONS: Labeled<LogoPosition>[] = [
    { id: 'sol', label: 'Solda' },
    { id: 'orta', label: 'Ortada' },
    { id: 'sag', label: 'Sağda' },
];

export const LOGO_SIZES: Labeled<LogoSize>[] = [
    { id: 'kucuk', label: 'Küçük' },
    { id: 'orta', label: 'Orta' },
    { id: 'buyuk', label: 'Büyük' },
];

export const QR_POSITIONS: Labeled<QrPosition>[] = [
    { id: 'sag-ust', label: 'Sağ üst (GİB önerisi)' },
    { id: 'sol-ust', label: 'Sol üst' },
    { id: 'alt', label: 'Altta, toplamların yanında' },
];

export const BANK_POSITIONS: Labeled<BankPosition>[] = [
    { id: 'alt', label: 'Belgenin altında, tam genişlik' },
    { id: 'yan', label: 'Toplamların yanında' },
];

export const TEXT_FIELDS: (Labeled<TextKey> & { placeholder: string; multiline?: boolean; invoiceOnly?: boolean })[] = [
    { id: 'slogan', label: 'Üst slogan', placeholder: 'Ör. Kalite ve güvenin adresi' },
    { id: 'headerNote', label: 'Başlık notu', placeholder: 'Ör. Kurumsal müşterilerimize özel fiyat listesi geçerlidir' },
    { id: 'thanks', label: 'Teşekkür mesajı', placeholder: 'Ör. Bizi tercih ettiğiniz için teşekkür ederiz!' },
    { id: 'returnPolicy', label: 'İade / garanti koşulları', placeholder: 'Ör. Ürünler 14 gün içinde faturasıyla iade edilebilir', multiline: true, invoiceOnly: true },
    { id: 'contact', label: 'KEP / web / sosyal medya', placeholder: 'Ör. KEP: firma@hs01.kep.tr · www.firma.com.tr · @firma' },
    { id: 'footer', label: 'Alt bilgi notu', placeholder: 'Ör. Ticaret Sicil No: 123456 · Mersis: 0123456789000015', multiline: true },
    { id: 'legal', label: 'Yasal uyarı', placeholder: 'Ör. Vadesinde ödenmeyen faturalara aylık %3 gecikme faizi uygulanır', multiline: true },
];

export interface NamedColor { hex: string; label: string; words: string[] }

/** Renk adları (NLU sözlüğü ve renk önerileri). Kelimeler katlanmış (fold) yazılır. */
export const NAMED_COLORS: NamedColor[] = [
    { hex: '#1e3a8a', label: 'lacivert', words: ['lacivert', 'koyu mavi', 'navy'] },
    { hex: '#2563eb', label: 'mavi', words: ['mavi', 'kraliyet mavisi'] },
    { hex: '#0ea5e9', label: 'açık mavi', words: ['acik mavi', 'gok mavisi', 'gokyuzu'] },
    { hex: '#0f766e', label: 'petrol yeşili', words: ['petrol', 'petrol yesili', 'petrol mavisi'] },
    { hex: '#0d9488', label: 'turkuaz', words: ['turkuaz', 'camgobegi', 'teal'] },
    { hex: '#16a34a', label: 'yeşil', words: ['yesil'] },
    { hex: '#166534', label: 'koyu yeşil', words: ['koyu yesil', 'zumrut', 'orman yesili'] },
    { hex: '#65a30d', label: 'fıstık yeşili', words: ['fistik yesili', 'acik yesil', 'zeytin'] },
    { hex: '#dc2626', label: 'kırmızı', words: ['kirmizi'] },
    { hex: '#881337', label: 'bordo', words: ['bordo', 'sarap', 'koyu kirmizi'] },
    { hex: '#ea580c', label: 'turuncu', words: ['turuncu', 'oranj'] },
    { hex: '#ca8a04', label: 'hardal sarısı', words: ['sari', 'hardal'] },
    { hex: '#a16207', label: 'altın', words: ['altin', 'gold', 'altin rengi'] },
    { hex: '#7c3aed', label: 'mor', words: ['mor', 'eflatun'] },
    { hex: '#c026d3', label: 'fuşya', words: ['fusya', 'magenta'] },
    { hex: '#db2777', label: 'pembe', words: ['pembe'] },
    { hex: '#475569', label: 'gri', words: ['gri', 'fume', 'antrasit'] },
    { hex: '#111827', label: 'siyah', words: ['siyah', 'kara'] },
    { hex: '#78350f', label: 'kahverengi', words: ['kahverengi', 'kahve', 'toprak rengi'] },
];

export const DEFAULT_ACCENT = '#2563eb';

export const labelOf = <T extends string>(list: Labeled<T>[], id: string | undefined): string =>
    list.find(x => x.id === id)?.label ?? id ?? '';

export const colorName = (hex: string): string | null => NAMED_COLORS.find(c => c.hex === hex.toLowerCase())?.label ?? null;
