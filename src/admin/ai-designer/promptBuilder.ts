/**
 * Cevaplardan düzenlenebilir Türkçe istem (prompt) kurar ve yönetici istemi
 * düzenlediğinde metni yeniden parametrelere çevirir.
 *
 * Satırlar "Anahtar: değer" biçimindedir; tanınmayan satırlar ve "Ek istekler"
 * serbest metin olarak NLU'dan geçer.
 */
import { CATEGORIES, SECTORS } from '../../sector-templates/types';
import type { WizardDocType } from '../../wizard/docTypes';
import { applyPatch, parseText, type LearnedRule, type NluMatch } from './nlu';
import { BANK_DOCS, QR_DOCS, RECEIPT_PAPER_DOCS, isSectionOn, sectionsFor, textFieldsFor } from './questions';
import type { DesignParams, ParamPatch, TextKey } from './types';
import { fold, isHex } from './utils';
import {
    BANK_POSITIONS, COLOR_MODES, FONT_SCALES, FONTS, LOGO_POSITIONS, LOGO_SIZES, NAMED_COLORS, PAPERS, QR_POSITIONS, STYLES, TEXT_FIELDS,
    colorName, labelOf,
} from './vocab';

const L = {
    doc: 'Belge tipi', sector: 'Sektör', company: 'Firma adı', profession: 'Meslek / unvan', style: 'Stil', accent: 'Ana renk',
    colorMode: 'Renk kullanımı', font: 'Yazı tipi', paper: 'Kağıt', logo: 'Logo', qr: 'Karekod', bank: 'Banka hesapları',
    on: 'Şu bölümler yer alsın', off: 'Şu bölümler yer almasın', extra: 'Ek istekler',
};

const quote = (s: string) => `“${s.replace(/[“”"]/g, '\'').replace(/\s*\n\s*/g, ' / ')}”`;

export function buildPrompt(p: DesignParams, dt: WizardDocType): string {
    const sector = SECTORS.find(s => s.id === p.sector);
    const category = CATEGORIES.find(c => c.id === p.category);
    const lines: string[] = [];
    lines.push(`${L.doc}: ${dt.label} (${dt.description}).`);
    if (sector) lines.push(`${L.sector}: ${sector.label}${category ? ` (${category.label})` : ''}.`);
    if (p.companyName) lines.push(`${L.company}: ${quote(p.companyName)}.`);
    if (p.docTypeId === 'smm' && p.profession) lines.push(`${L.profession}: ${quote(p.profession)}.`);
    lines.push(`${L.style}: ${labelOf(STYLES, p.style)}.`);
    lines.push(`${L.accent}: ${colorName(p.accent) ?? 'özel renk'} (${p.accent}).`);
    lines.push(`${L.colorMode}: ${labelOf(COLOR_MODES, p.colorMode).toLocaleLowerCase('tr-TR')}.`);
    lines.push(`${L.font}: ${labelOf(FONTS, p.font)}, ${labelOf(FONT_SCALES, p.fontScale).toLocaleLowerCase('tr-TR')} boyut.`);
    if (RECEIPT_PAPER_DOCS.includes(p.docTypeId)) lines.push(`${L.paper}: ${labelOf(PAPERS, p.paper)}.`);
    lines.push(p.logo
        ? `${L.logo}: var, ${labelOf(LOGO_POSITIONS, p.logoPosition).toLocaleLowerCase('tr-TR')}, ${labelOf(LOGO_SIZES, p.logoSize).toLocaleLowerCase('tr-TR')} boy.`
        : `${L.logo}: yok, firma adı ${labelOf(LOGO_POSITIONS, p.logoPosition).toLocaleLowerCase('tr-TR')} yazılsın.`);
    if (QR_DOCS.includes(p.docTypeId) && p.paper !== 'fis80') lines.push(`${L.qr}: ${labelOf(QR_POSITIONS, p.qrPosition).toLocaleLowerCase('tr-TR')}.`);
    if (BANK_DOCS.includes(p.docTypeId)) {
        lines.push(p.banks.length
            ? `${L.bank}: ${p.banks.length} hesap (${p.banks.map(b => b.bank || 'Banka').join(', ')}), ${labelOf(BANK_POSITIONS, p.bankPosition).toLocaleLowerCase('tr-TR')}.`
            : `${L.bank}: yok.`);
    }
    const secs = sectionsFor(p.docTypeId);
    const on = secs.filter(s => isSectionOn(p, s.id)).map(s => s.label);
    const off = secs.filter(s => !isSectionOn(p, s.id)).map(s => s.label);
    if (on.length) lines.push(`${L.on}: ${on.join('; ')}.`);
    if (off.length) lines.push(`${L.off}: ${off.join('; ')}.`);
    for (const f of textFieldsFor(p.docTypeId)) {
        const v = p.texts[f.id];
        if (v) lines.push(`${f.label}: ${quote(v)}.`);
    }
    if (p.extra) lines.push(`${L.extra}: ${p.extra}`);
    return lines.join('\n');
}

export interface ParsedPrompt { params: DesignParams; matches: NluMatch[] }

const stripEnd = (s: string) => s.trim().replace(/[.;]+$/, '').trim();
const unquote = (s: string) => {
    const m = /^[“"«](.*)[”"»]$/s.exec(stripEnd(s));
    return (m ? m[1] : stripEnd(s)).replace(/\s+\/\s+/g, '\n').trim();
};
const findLabel = <T extends string>(list: { id: T; label: string }[], value: string): T | null => {
    const v = fold(value);
    const sorted = [...list].sort((a, b) => b.label.length - a.label.length);
    return sorted.find(x => v.includes(fold(x.label)))?.id ?? sorted.find(x => v.includes(fold(x.label.split(' ')[0])))?.id ?? null;
};

/** Düzenlenmiş istemi parametrelere çevirir. Belge tipi değişmez; logo ve banka ayrıntıları korunur. */
export function parsePrompt(text: string, base: DesignParams, dt: WizardDocType, learned: LearnedRule[] = []): ParsedPrompt {
    let p: DesignParams = { ...base, sections: { ...base.sections }, texts: { ...base.texts } };
    const matches: NluMatch[] = [];
    const free: string[] = [];
    let extra = '';
    const secs = sectionsFor(dt.id);
    const textFields = textFieldsFor(dt.id);
    const seenTexts = new Set<TextKey>();
    let sawExtra = false;

    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line) continue;
        const idx = line.indexOf(':');
        const key = idx > 0 ? fold(line.slice(0, idx)) : '';
        const value = idx > 0 ? line.slice(idx + 1).trim() : line;
        const fv = fold(value);
        const patch: ParamPatch = {};
        switch (key) {
            case fold(L.doc):
                break;
            case fold(L.sector): {
                const s = [...SECTORS].sort((a, b) => b.label.length - a.label.length).find(x => fv.includes(fold(x.label)));
                if (s) { patch.sector = s.id; patch.category = s.category; }
                break;
            }
            case fold(L.company): patch.companyName = unquote(value); break;
            case fold(L.profession): patch.profession = unquote(value); break;
            case fold(L.style): {
                const id = findLabel(STYLES, value);
                if (id) patch.style = id;
                break;
            }
            case fold(L.accent): {
                const hex = /#[0-9a-f]{6}\b/i.exec(value)?.[0];
                const named = [...NAMED_COLORS].sort((a, b) => b.label.length - a.label.length).find(c => fv.startsWith(fold(c.label)));
                // Renk adı değiştirilip kod bırakılmışsa ad kazanır.
                if (named && (!hex || colorName(hex) !== named.label)) patch.accent = named.hex;
                else if (hex && isHex(hex)) patch.accent = hex.toLowerCase();
                break;
            }
            case fold(L.colorMode): { const id = findLabel(COLOR_MODES, value); if (id) patch.colorMode = id; break; }
            case fold(L.font): {
                const id = findLabel(FONTS, value);
                if (id) patch.font = id;
                const sc = /buyuk/.test(fv) ? 'buyuk' : /kucuk/.test(fv) ? 'kucuk' : /normal/.test(fv) ? 'normal' : null;
                if (sc) patch.fontScale = sc;
                break;
            }
            case fold(L.paper): patch.paper = /fis|80/.test(fv) && RECEIPT_PAPER_DOCS.includes(dt.id) ? 'fis80' : 'a4'; break;
            case fold(L.logo): {
                if (/^yok/.test(fv)) patch.logo = null;
                const pos = /sag/.test(fv) ? 'sag' : /orta(da|li)|merkez/.test(fv) ? 'orta' : /sol/.test(fv) ? 'sol' : null;
                if (pos) patch.logoPosition = pos;
                const size = /buyuk/.test(fv) ? 'buyuk' : /kucuk/.test(fv) ? 'kucuk' : /orta boy/.test(fv) ? 'orta' : null;
                if (size) patch.logoSize = size;
                break;
            }
            case fold(L.qr): {
                const id = /alt/.test(fv) ? 'alt' : /sol/.test(fv) ? 'sol-ust' : /sag/.test(fv) ? 'sag-ust' : null;
                if (id) patch.qrPosition = id;
                break;
            }
            case fold(L.bank):
                if (/^yok/.test(fv)) patch.banks = [];
                else if (/yan/.test(fv)) patch.bankPosition = 'yan';
                else if (/alt/.test(fv)) patch.bankPosition = 'alt';
                break;
            case fold(L.on):
            case fold(L.off): {
                const want = key === fold(L.on);
                const items = stripEnd(value).split(/;|,(?![^(]*\))/).map(s => fold(s.trim())).filter(Boolean);
                const sections: Record<string, boolean> = {};
                const used = new Set<string>();
                for (const s of [...secs].sort((a, b) => b.label.length - a.label.length)) {
                    const lbl = fold(s.label);
                    if (fv.includes(lbl)) { sections[s.id] = want; used.add(lbl); }
                }
                for (const item of items) {
                    if ([...used].some(u => u.includes(item) || item.includes(u))) continue;
                    const s = secs.find(x => x.keywords.some(k => item.includes(k)) || fold(x.label).includes(item));
                    if (s && sections[s.id] === undefined) sections[s.id] = want;
                }
                patch.sections = sections;
                break;
            }
            case fold(L.extra):
                extra = value;
                sawExtra = true;
                break;
            default: {
                const tf = textFields.find(f => fold(f.label) === key);
                if (tf) {
                    patch.texts = { [tf.id]: unquote(value) };
                    seenTexts.add(tf.id);
                } else if (!TEXT_FIELDS.some(f => fold(f.label) === key)) {
                    free.push(line);
                }
            }
        }
        p = applyPatch(p, patch);
    }
    // İstemden silinen özel yazılar kaldırılır.
    for (const f of textFields) if (!seenTexts.has(f.id) && p.texts[f.id]) delete p.texts[f.id];
    p.extra = [sawExtra ? extra : '', ...free].filter(Boolean).join('\n');

    const nluText = [...free, extra].filter(Boolean).join('\n');
    if (nluText) {
        // Elle değiştirilen yapılandırılmış satırlar serbest metindeki anahtar kelimelerden önceliklidir.
        const r = parseText(nluText, dt.id, learned);
        const edited = p;
        const patch: ParamPatch = {};
        for (const [k, v] of Object.entries(r.patch)) {
            if (k === 'sections' || k === 'texts') continue;
            const key = k as keyof DesignParams;
            if (JSON.stringify(edited[key]) === JSON.stringify(base[key])) (patch as Record<string, unknown>)[k] = v;
        }
        if (r.patch.sections) {
            patch.sections = Object.fromEntries(Object.entries(r.patch.sections).filter(([id]) => Boolean(edited.sections[id]) === Boolean(base.sections[id])));
        }
        if (r.patch.texts) {
            patch.texts = Object.fromEntries(Object.entries(r.patch.texts).filter(([k]) => (edited.texts[k as TextKey] ?? '') === (base.texts[k as TextKey] ?? '')));
        }
        p = applyPatch(p, patch);
        matches.push(...r.matches);
    }
    return { params: p, matches };
}
