// e-Döviz / e-Kıymetli Maden, e-Dekont, e-Sigorta Komisyon Gider ve e-Yolcu Listesi hazır şablonlarını üretir:
// public/ebelge/hazir/<id>.xslt + .xml ve src/sector-templates/groups/belge.generated.ts. Tanımları
// scripts/belge/ altında değiştirince çalıştırın:
//   node scripts/gen-belge-templates.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOMParser } from '@xmldom/xmldom';
import { HAZIR } from './moda/lib.mjs';
import DEKONT from './belge/dekont.mjs';
import DOVIZ from './belge/doviz.mjs';
import SIGORTA from './belge/sigorta.mjs';
import YOLCU from './belge/yolcu.mjs';

const OUT_TS = join(process.cwd(), 'src', 'sector-templates', 'groups', 'belge.generated.ts');
const SPECS = [
    ...DOVIZ.map((s) => ({ docTypeId: 'doviz', ...s })),
    ...DEKONT.map((s) => ({ docTypeId: 'dekont', moduleId: 'dekont', ...s })),
    ...SIGORTA.map((s) => ({ docTypeId: 'sigorta-komisyon', moduleId: 'sigorta-komisyon', ...s })),
    ...YOLCU.map((s) => ({ docTypeId: 'bilet-yolcu', moduleId: 'bilet-yolcu', ...s })),
];

const wellFormed = (name, text) => {
    const errors = [];
    new DOMParser({ onError: (level, msg) => { if (level !== 'warning') errors.push(msg); } }).parseFromString(text, 'text/xml');
    if (errors.length) throw new Error(`${name}: ${errors[0]}`);
};

/** Diğer şablon gruplarının kimlikleri: aynı adla dosya ezilmesin. */
const groupsDir = join(process.cwd(), 'src', 'sector-templates', 'groups');
const taken = new Set(readdirSync(groupsDir)
    .filter((f) => f.endsWith('.ts') && f !== 'belge.generated.ts')
    .flatMap((f) => {
        const src = readFileSync(join(groupsDir, f), 'utf8');
        return [...src.matchAll(/\(\s*'([a-z0-9-]+)'\s*,/g), ...src.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);
    }));

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const seen = new Set();
const rows = [];
for (const S of SPECS) {
    if (seen.has(S.id)) throw new Error(`Yinelenen kimlik: ${S.id}`);
    if (taken.has(S.id)) throw new Error(`Kimlik başka grupta kullanılıyor: ${S.id}`);
    if (!S.moduleId) throw new Error(`${S.id}: moduleId eksik`);
    seen.add(S.id);
    wellFormed(`${S.id}.xml`, S.xml);
    wellFormed(`${S.id}.xslt`, S.xslt);
    writeFileSync(join(HAZIR, `${S.id}.xml`), S.xml);
    writeFileSync(join(HAZIR, `${S.id}.xslt`), S.xslt);
    rows.push(`    b(${q(S.id)}, ${q(S.sector)}, ${q(S.docTypeId)}, ${q(S.moduleId)}, ${q(S.accent)}, ${q(S.name)},\n        ${q(S.description)},\n        [${S.tags.map(q).join(', ')}]),`);
}

writeFileSync(OUT_TS, `// scripts/gen-belge-templates.mjs tarafından üretildi; elle düzenlemeyin.
import { hazirPath, type SectorId, type SectorTemplate } from '../types';

const b = (id: string, sector: SectorId, docTypeId: string, moduleId: string, accent: string, name: string, description: string, tags: string[]): SectorTemplate => ({
    id, sector, name, description, docTypeId, moduleId, accent,
    xslt: hazirPath(id, 'xslt'), xml: hazirPath(id, 'xml'), tags,
});

/** e-Döviz / e-Kıymetli Maden, e-Dekont, e-Sigorta Komisyon Gider ve e-Yolcu Listesi şablonları. */
export const BELGE_TEMPLATES: SectorTemplate[] = [
${rows.join('\n')}
];
`);

const by = Object.entries(SPECS.reduce((a, s) => ({ ...a, [s.docTypeId]: (a[s.docTypeId] ?? 0) + 1 }), {})).map(([a, n]) => `${a} ${n}`).join(', ');
console.log(`${SPECS.length} belge şablonu yazıldı (${by}).`);
