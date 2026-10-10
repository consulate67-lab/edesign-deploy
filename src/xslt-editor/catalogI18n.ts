/**
 * Alan kataloğunu istenen dilde üretir. Anahtarlar (key/path) dilden bağımsızdır;
 * yalnız etiket ve kategori adları değişir.
 *   - Uluslararası XML (EN 16931 / Peppol): `intlCatalog`.
 *   - GİB belgeleri: Türkçe katalog, tr dışındaki dillerde sözlükle çevrilir.
 */
import type { Locale } from '../store/uiStore';
import type { DocLanguage } from '../international/registry/docLanguages';
import { getCatalog, docRootOf, type CatalogField } from './fieldCatalog';
import { isIntlXml } from './docLanguage';
import { intlCatalog, type IntlRoot } from './intlCatalog';
import type { GibDict } from './catalogLabels/types';
import en from './catalogLabels/en';
import de from './catalogLabels/de';
import fr from './catalogLabels/fr';
import es from './catalogLabels/es';

const DICTS: Record<Exclude<Locale, 'tr'>, GibDict> = { en, de, fr, es };

/** Uzun önekler önce: "Asıl Alıcı" "Alıcı"dan önce denenmeli. */
const PARTY_PREFIXES = ['Sipariş Veren', 'Asıl Alıcı', 'Teslim Alan', 'Düzenleyen', 'Gönderen', 'Satıcı', 'Alıcı', 'Çiftçi'];
const TAX_SUFFIXES: [suffix: string, tpl: 'amount' | 'base' | 'rate'][] = [[' Tutarı', 'amount'], [' Matrahı', 'base'], [' Oranı (%)', 'rate']];
const LINE_PREFIX = 'Satır ';

const fill = (tpl: string, vars: Record<string, string>) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? '');

function compose(label: string, d: GibDict): string | null {
    const exact = d.labels[label];
    if (exact) return exact;
    for (const [suffix, tpl] of TAX_SUFFIXES) {
        if (!label.endsWith(suffix)) continue;
        const name = d.taxes[label.slice(0, -suffix.length)];
        if (name) return fill(d.tpl[tpl], { name });
    }
    for (const p of PARTY_PREFIXES) {
        if (!label.startsWith(`${p} `)) continue;
        const party = d.parties[p];
        const field = d.partyFields[label.slice(p.length + 1)];
        if (party && field) return fill(d.tpl.party, { party, field });
    }
    return null;
}

/** GİB etiketleri yalnız arayüz dillerine çevrilidir; diğer belge dillerinde İngilizce kullanılır. */
export function translateGibLabel(label: string, lang: DocLanguage): string | null {
    if (lang === 'tr') return label;
    const d = DICTS[lang as Exclude<Locale, 'tr'>] ?? DICTS.en;
    const direct = compose(label, d);
    if (direct) return direct;
    if (label.startsWith(LINE_PREFIX)) {
        const inner = compose(label.slice(LINE_PREFIX.length), d);
        if (inner) return fill(d.tpl.line, { label: inner });
    }
    return null;
}

const cache = new Map<string, CatalogField[]>();

function gibCatalog(xml: string, lang: DocLanguage): CatalogField[] {
    const root = docRootOf(xml);
    const base = getCatalog(root);
    if (lang === 'tr') return base;
    const id = `${root}:${lang}`;
    const hit = cache.get(id);
    if (hit) return hit;
    const fields = base.map(f => ({
        ...f,
        label: translateGibLabel(f.label, lang) ?? f.label,
        category: translateGibLabel(f.category, lang) ?? f.category,
    }));
    cache.set(id, fields);
    return fields;
}

const INTL_ROOT = /<(?:[\w.-]+:)?(Invoice|CreditNote|DespatchAdvice)[\s>]/;

export function buildCatalog(xml: string, lang: DocLanguage): CatalogField[] {
    if (isIntlXml(xml)) {
        const root = xml.match(INTL_ROOT)?.[1] as IntlRoot | undefined;
        if (root) return intlCatalog(root, lang);
    }
    return gibCatalog(xml, lang);
}
