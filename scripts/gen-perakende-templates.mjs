// Perakende (tekstil, ayakkabı, diğer mağaza sektörleri ve adisyon tarzı satışlar) e-Arşiv / e-Fatura hazır şablonlarını üretir:
// public/ebelge/hazir/<id>.xslt + .xml ve src/sector-templates/groups/perakende.generated.ts. Tanımları
// scripts/perakende/ altında değiştirince çalıştırın:
//   node scripts/gen-perakende-templates.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOMParser } from '@xmldom/xmldom';
import { HAZIR, invoice, xslt } from './moda/lib.mjs';
import { LAYOUTS as BASE_LAYOUTS } from './perakende/layouts.mjs';
import { ADISYON_LAYOUTS } from './perakende/adisyon-layouts.mjs';
import { BASE_CSS, LABELS, LINE_STYLES, TEMPLATES, blocks, mkLogo, themeCss } from './perakende/kit.mjs';
import TEKSTIL from './perakende/tekstil.mjs';
import AYAKKABI from './perakende/ayakkabi.mjs';
import DIGER from './perakende/diger.mjs';
import ADISYON from './perakende/adisyon.mjs';

const OUT_TS = join(process.cwd(), 'src', 'sector-templates', 'groups', 'perakende.generated.ts');
const LAYOUTS = { ...BASE_LAYOUTS, ...ADISYON_LAYOUTS };
const SPECS = [...TEKSTIL, ...AYAKKABI, ...DIGER, ...ADISYON];

const wellFormed = (name, text) => {
    const errors = [];
    new DOMParser({ onError: (level, msg) => { if (level !== 'warning') errors.push(msg); } }).parseFromString(text, 'text/xml');
    if (errors.length) throw new Error(`${name}: ${errors[0]}`);
};

/** Diğer şablon gruplarının kimlikleri: aynı adla dosya ezilmesin. */
const groupsDir = join(process.cwd(), 'src', 'sector-templates', 'groups');
const taken = new Set(readdirSync(groupsDir)
    .filter((f) => f.endsWith('.ts') && f !== 'perakende.generated.ts')
    .flatMap((f) => [...readFileSync(join(groupsDir, f), 'utf8').matchAll(/\(\s*'([a-z0-9-]+)'\s*,/g)].map((m) => m[1])));

const seen = new Set();
const build = (S) => {
    if (seen.has(S.id)) throw new Error(`Yinelenen kimlik: ${S.id}`);
    if (taken.has(S.id)) throw new Error(`Kimlik başka grupta kullanılıyor: ${S.id}`);
    seen.add(S.id);
    const lay = LAYOUTS[S.layout];
    if (!lay) throw new Error(`${S.id}: bilinmeyen yerleşim ${S.layout}`);
    const profile = S.doc === 'arsiv' ? 'EARSIVFATURA' : (S.profile ?? 'TICARIFATURA');
    const type = S.type ?? 'SATIS';
    const lineStyle = S.lines ?? lay.lines;
    const xml = invoice({
        comment: `Hazır şablon örneği: ${S.name} — ${profile} · ${type}.\n${S.description}`,
        profile, type, ...S.data,
    });
    const K = {
        lines: LINE_STYLES[lineStyle]({ size: S.size, sizeLabel: S.sizeLabel ?? LABELS[S.size] }),
        blocks: blocks(S),
        logo: (n, extra) => mkLogo(S.logo, n, extra),
    };
    const { css, body } = lay.make(S, K);
    const out = xslt({
        title: S.doc === 'arsiv' ? 'e-Arşiv Fatura' : 'e-Fatura',
        comment: `${S.name} (${profile} · ${type}).\n${S.description}\nYerleşim: ${S.layout} · satır stili: ${lineStyle}.`,
        css: `${themeCss(S.theme)}\n${BASE_CSS}\n${css}`,
        body,
        templates: TEMPLATES,
    });
    wellFormed(`${S.id}.xml`, xml);
    wellFormed(`${S.id}.xslt`, out);
    return { xml, xslt: out };
};

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const rows = [];
for (const S of SPECS) {
    const { xml, xslt: x } = build(S);
    writeFileSync(join(HAZIR, `${S.id}.xml`), xml);
    writeFileSync(join(HAZIR, `${S.id}.xslt`), x);
    rows.push(`    p(${q(S.id)}, ${q(S.sector)}, ${q(S.doc)}, ${q(S.theme.a)}, ${q(S.name)},\n        ${q(S.description)},\n        [${S.tags.map(q).join(', ')}]),`);
}

writeFileSync(OUT_TS, `// scripts/gen-perakende-templates.mjs tarafından üretildi; elle düzenlemeyin.
import { hazirPath, type SectorId, type SectorTemplate } from '../types';

const p = (id: string, sector: SectorId, doc: 'fatura' | 'arsiv', accent: string, name: string, description: string, tags: string[]): SectorTemplate => ({
    id, sector, name, description, docTypeId: doc, moduleId: doc, accent,
    xslt: hazirPath(id, 'xslt'), xml: hazirPath(id, 'xml'), tags,
});

/** Perakende mağaza şablonları (tekstil ve ayakkabı öncelikli): e-Arşiv ve e-Fatura. */
export const PERAKENDE_TEMPLATES: SectorTemplate[] = [
${rows.join('\n')}
];
`);

const by = (k) => Object.entries(SPECS.reduce((a, s) => ({ ...a, [s[k]]: (a[s[k]] ?? 0) + 1 }), {})).map(([a, b]) => `${a} ${b}`).join(', ');
console.log(`${SPECS.length} perakende şablonu yazıldı (${by('doc')} · ${by('sector')}).`);
