/**
 * Elle hazırlanmış şablon kütüphanesinden (Sektörünüze Hazır Şablonlar) öneri adayları:
 * belge türüne göre süzer, sektör / tarz / isteğe göre sıralar ve seçilen şablonu
 * kullanıcının logo, banka, kaşe ve özel metinleriyle kişiselleştirir.
 */
import { SECTOR_TEMPLATES, SECTORS, type SectorTemplate } from '../sector-templates';
import { personalizeXslt, type BankAccount, type TemplatePrefs } from '../sector-templates/personalize';
import { loadXmlFile } from '../wizard/docTypes';
import { stripLeadingBom } from '../xslt-editor/utils/testWatermark';
import { fold } from '../admin/ai-designer/utils';

export const MOODS = ['modern', 'kurumsal', 'minimal', 'zarif', 'canli', 'sade'] as const;
export type Mood = typeof MOODS[number];

const MOOD_WORDS: Record<Mood, RegExp> = {
    modern: /modern|uygulama|mobil|kart|degrade|gradyan|dijital|neon|streetwear|teknoloji|dashboard|cizelge/,
    kurumsal: /kurumsal|resmi|antet|klasik|ciddi|defter|sertifika|muhur|teknik cizim|blueprint/,
    minimal: /minimal|sade|yalin|beyaz|isvicre|japon|ince/,
    zarif: /luks|zarif|yaldiz|serif|monogram|butik|krem|altin|sampanya|dantel|didot|editoryal/,
    canli: /renkli|canli|neon|pastel|oyunbaz|pop|enerjik|degrade|cini/,
    sade: /sade|yalin|minimal|temiz|daktilo|kraft/,
};

const STOP = new Set(['icin', 'olsun', 'olan', 'gibi', 'daha', 'bir', 'cok', 'guzel', 'tasarim', 'tasarimi', 'fatura', 'faturasi', 'istiyorum', 'ozel', 'olmasi', 'veya', 'ile']);

const textOf = (t: SectorTemplate) => fold(`${t.name} ${t.description} ${t.tags.join(' ')}`);

export interface RankInput { docTypeId: string; sectorId: string; moods: Mood[]; wishes: string; hasBanks: boolean }

/** Belge türüne uyan elle hazırlanmış şablonlar, uygunluk puanına göre sıralı. */
export function rankTemplates(input: RankInput): SectorTemplate[] {
    const sector = SECTORS.find(s => s.id === input.sectorId);
    const categoryOf = new Map(SECTORS.map(s => [s.id, s.category]));
    const wishWords = fold(input.wishes).split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !STOP.has(w));
    const scored = SECTOR_TEMPLATES.filter(t => t.docTypeId === input.docTypeId && !t.inline).map((t, i) => {
        const text = textOf(t);
        let score = -i * 0.001;
        if (sector && t.sector === sector.id) score += 10;
        else if (sector && categoryOf.get(t.sector) === sector.category) score += 4;
        if (sector && fold(t.name).includes(fold(sector.label).split(/[^a-z]+/)[0])) score += 2;
        for (const m of input.moods) if (MOOD_WORDS[m].test(text)) score += 2;
        for (const w of wishWords) if (text.includes(w.slice(0, Math.max(4, w.length - 2)))) score += 1.5;
        if (!t.meslek) score += 1;
        if (input.hasBanks && t.bank) score += 0.5;
        return { t, score };
    });
    return scored.sort((a, b) => b.score - a.score).map(s => s.t);
}

/** Aynı sektörden üç benzer şablon yerine çeşitlilik: önce farklı sektörlerden, sonra kalanlardan. */
export function pickTop(ranked: SectorTemplate[], n = 3): SectorTemplate[] {
    const out: SectorTemplate[] = [];
    for (const t of ranked) {
        if (out.length >= n) break;
        if (out.filter(o => o.sector === t.sector).length < 2) out.push(t);
    }
    for (const t of ranked) if (out.length < n && !out.includes(t)) out.push(t);
    return out;
}

export const sectorLabel = (id: string) => SECTORS.find(s => s.id === id)?.label ?? id;

const fileCache = new Map<string, Promise<string>>();
const loadText = (path: string) => {
    let p = fileCache.get(path);
    if (!p) {
        p = loadXmlFile(path).then(raw => {
            const text = stripLeadingBom(raw);
            if (!text.trim().startsWith('<') || /^\s*<!doctype html/i.test(text)) throw new Error(`${path} bulunamadı`);
            return text;
        });
        p.catch(() => fileCache.delete(path));
        fileCache.set(path, p);
    }
    return p;
};

export const loadTemplate = async (t: SectorTemplate) => {
    const [xslt, xml] = await Promise.all([loadText(t.xslt), loadText(t.xml)]);
    return { xslt, xml };
};

export interface ProAssets {
    logo: { src: string; width: number; height: number } | null;
    stamp: string | null;
    banks: BankAccount[];
    texts: string[];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Kullanıcının özel metinleri ve kaşesi: sayfanın sonunda, düzenleyicide taşınabilir tek nesne. */
const extrasBlock = (texts: string[], stamp: string | null) => {
    const lines = texts.map(t => `<div style="margin:2px 0">${esc(t)}</div>`).join('');
    const stampCell = stamp ? `<td style="width:170px;vertical-align:bottom;text-align:right"><img data-xslt-obj="obj-kase" alt="Kaşe" src="${esc(stamp)}" style="max-width:160px;max-height:90px;object-fit:contain"/></td>` : '';
    return `<div data-xslt-obj="obj-ozel-notlar" style="max-width:794px;margin:12px auto 0;padding:10px 18px;box-sizing:border-box;background:#fff;color:#475569;font-size:11px;line-height:1.5;border-top:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse"><tr><td style="vertical-align:top">${lines}</td>${stampCell}</tr></table></div>`;
};

export function personalizeTemplate(xslt: string, a: ProAssets): string {
    const prefs: TemplatePrefs = {
        logo: a.logo ? { mode: 'custom', dataUrl: a.logo.src, width: a.logo.width, height: a.logo.height, name: 'logo' } : { mode: 'none' },
        bank: a.banks.length ? 'yes' : 'any',
        accounts: a.banks,
    };
    let out = personalizeXslt(xslt, prefs);
    if (a.texts.length || a.stamp) {
        const at = out.toLowerCase().lastIndexOf('</body>');
        if (at >= 0) out = out.slice(0, at) + extrasBlock(a.texts, a.stamp) + out.slice(at);
    }
    return out;
}
