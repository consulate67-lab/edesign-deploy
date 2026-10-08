// Meslek (NACE esnaf meslek grupları) hazır şablonlarını üretir: her meslek için katalogdaki belge türlerine
// göre UBL-TR örnek XML + XSLT çifti (public/ebelge/hazir/meslek-*.{xml,xslt}), galeri listesi
// (src/sector-templates/groups/meslek.generated.ts), meslek listesi (src/sector-templates/meslekler.generated.ts)
// ve belge türü / XML değerlendirme raporu (docs/MESLEK-BELGE-ANALIZI.md).
//   node scripts/gen-meslek-templates.mjs [meslek-kodu-öneki]
import { readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DOMParser } from '@xmldom/xmldom';
import { build, LABELS, KINDS } from './meslek/scen.mjs';
import * as X from './meslek/xslt.mjs';
import { LAYOUTS, BASE_CSS } from './meslek/layouts.mjs';
import { iconMarkup, LOGO_SHAPES } from './meslek/icons.mjs';
import { GROUPS } from './meslek/groups.mjs';
import { CATALOG } from './meslek/catalog/index.mjs';
import { hashStr } from './meslek/fake.mjs';

const ROOT = process.cwd();
const HAZIR = join(ROOT, 'public', 'ebelge', 'hazir');
const only = process.argv[2];
const NACE = JSON.parse(readFileSync(join(ROOT, 'scripts', 'meslek', 'nace.json'), 'utf8'));
const naceBy = Object.fromEntries(NACE.map((n) => [n.code, n]));

const ROTATION = ['serit', 'kenar', 'kart', 'zarif', 'teknik', 'endustri', 'modern', 'pastel', 'defter', 'kurumsal', 'fis'];
const SHAPES = Object.keys(LOGO_SHAPES);

const LEGAL = {
    arsiv: 'Bu belge 509 sıra no.lu VUK Genel Tebliği kapsamında e-Arşiv Fatura olarak düzenlenmiştir.',
    fatura: 'Bu belge e-Fatura olarak düzenlenmiş ve Gelir İdaresi Başkanlığı sistemi üzerinden iletilmiştir.',
    ihracat: 'İhracat faturası Gümrük Müdürlüğü muhataplı düzenlenmiştir; GTİP ve teslim şartları gümrük beyannamesi ile eşleştirilir.',
    yolcu: 'Yolcu beraberi eşya faturası; KDV iadesi çıkış gümrüğü onayı ve aracı kurum aracılığıyla yapılır.',
    mikro: 'Mikro ihracat: Elektronik Ticaret Gümrük Beyannamesi (ETGB) ile birlikte geçerlidir.',
    smm: 'Bu makbuz 509 sıra no.lu VUK Genel Tebliği kapsamında e-Serbest Meslek Makbuzu olarak düzenlenmiştir.',
    bilet: 'Bu bilet elektronik ortamda düzenlenmiştir; yolcu / seyirci kimliği ile birlikte geçerlidir.',
    mustahsil: 'Bu makbuz 509 sıra no.lu VUK Genel Tebliği kapsamında e-Müstahsil Makbuzu olarak düzenlenmiştir; üretici SMS ile bilgilendirilmiştir.',
    gider: 'Bu belge VUK 234. madde uyarınca e-Gider Pusulası olarak düzenlenmiştir; satıcı SMS ile bilgilendirilmiştir.',
    kmaden: 'Kıymetli maden alım belgesi; müessese kayıtlarında istatistik numarası ile izlenir.',
    irsaliye: 'Bu belge e-İrsaliye olarak düzenlenmiştir; malın sevki sırasında araçta bulundurulması zorunludur.',
};

/** Vurgu rengini beyaza karıştırarak açık ton üretir. */
const tint = (hex, k = 0.88) => {
    const n = parseInt(hex.slice(1), 16);
    const mix = (c) => Math.round(c + (255 - c) * k).toString(16).padStart(2, '0');
    return `#${mix(n >> 16)}${mix((n >> 8) & 255)}${mix(n & 255)}`;
};

const parseCheck = (text, what) => {
    const errors = [];
    new DOMParser({ onError: (level, msg) => { if (level !== 'warning') errors.push(msg); } }).parseFromString(text, 'text/xml');
    if (errors.length) throw new Error(`${what}: ${errors[0]}`);
};

function labelsFor(xml) {
    const keys = new Set([
        ...[...xml.matchAll(/schemeID="([^"]+)"/g)].map((m) => m[1]),
        ...[...xml.matchAll(/<cbc:DocumentType(?:Code)?>([^<]+)</g)].map((m) => m[1]),
    ]);
    ['VKN', 'TCKN', 'VKN_TCKN', 'MERSISNO', 'INCOTERMS', 'EARSIV_FATURA', 'PLAKA', 'DORSEPLAKA'].forEach((k) => keys.delete(k));
    keys.add('PLAKA');
    const missing = [...keys].filter((k) => !LABELS[k]);
    if (missing.length) throw new Error(`Etiketi tanımsız alan(lar): ${missing.join(', ')}`);
    return [...keys].sort().map((k) => [k, LABELS[k]]);
}

async function render(prof, doc, i, r) {
    const { K } = r;
    const F = X.FAM[K.fam];
    const [a, b] = prof.c;
    const shape = prof.shape ?? SHAPES[hashStr(prof.code) % SHAPES.length];
    const logoSvg = LOGO_SHAPES[shape](await iconMarkup(prof.icon), a, b);
    const layoutId = K.layout ?? doc.lay ?? prof.lay?.[i] ?? ROTATION[(hashStr(prof.code) + i * 4) % ROTATION.length];
    const L = LAYOUTS[layoutId];
    if (!L) throw new Error(`${prof.code}: yerleşim yok ${layoutId}`);
    const P = {
        logo: (s) => `<img data-xslt-obj="obj-logo" alt="Logo" width="${s}" height="${s}" src="${X.svg(logoSvg)}"/>`,
        brand: X.each(F.sup, X.pName),
        tagline: X.t(prof.slogan),
        title: X.t(K.title),
        subtitle: X.t(K.subtitle),
        meta: X.metaTable(K),
        parties: X.parties(K),
        partyBodies: X.partyBodies(K),
        upper: [
            K.layout === 'bilet' ? '' : X.refs(K),
            K.layout === 'bilet' ? '' : X.period(K),
            K.parties === 'ihracat' ? X.customs() : '',
            K.parties === 'yolcu' ? X.taxRep() : '',
            K.fam === 'despatch' ? X.shipment() : '',
        ].join(''),
        lines: X.linesTable(K, r.feat),
        totals: (row) => X.totalRows(K, row),
        payLabel: X.t(K.payLabel ?? 'Ödenecek Tutar'),
        payable: X.payable(),
        tl: X.tlKarsilik(),
        yaziyla: X.yaziyla(),
        lower: [X.delivery(), X.payment(), X.notesBox()].join(''),
        qr: (s) => X.qr(s),
        ettn: X.ettn(),
        legal: [X.t(LEGAL[r.meta.base])],
        ticket: X.ticket(K),
        despatch: K.fam === 'despatch',
    };
    const css = `.sayfa { --a: ${a}; --b: ${b}; --t: ${tint(a)}; --ink: #1f2937; --soft: #6b7280; --line: #e5e7eb; }\n${BASE_CSS}\n${L.css}`;
    const xslt = X.shell({
        root: F.root,
        comment: `Meslek şablonu: ${prof.code} ${prof.name} — ${doc.n}\n${KINDS[r.meta.base].label} · ${r.sub} · yerleşim: ${layoutId}\nscripts/gen-meslek-templates.mjs ile üretilmiştir.`,
        title: K.title,
        css,
        body: L.body(P),
        labels: labelsFor(r.xml),
    });
    return { xslt, layoutId };
}

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

async function main() {
    mkdirSync(HAZIR, { recursive: true });
    const list = only ? CATALOG.filter((p) => p.code.startsWith(only)) : CATALOG;
    if (!only) {
        for (const f of readdirSync(HAZIR)) if (f.startsWith('meslek-')) unlinkSync(join(HAZIR, f));
        const missing = NACE.filter((n) => !CATALOG.some((p) => p.code === n.code));
        if (missing.length) console.warn(`Katalogda olmayan meslek: ${missing.map((n) => n.code).join(', ')}`);
    }
    const out = [];
    const ids = new Set();
    for (const prof of list) {
        const n = naceBy[prof.code];
        if (!n) throw new Error(`NACE listesinde yok: ${prof.code}`);
        prof.name = n.name;
        if (prof.docs.length < 2) throw new Error(`${prof.code}: en az iki belge gerekir`);
        for (const [i, doc] of prof.docs.entries()) {
            let r;
            try {
                r = build(prof, doc, i);
                if (ids.has(r.id)) throw new Error(`yinelenen şablon kimliği ${r.id}`);
                ids.add(r.id);
                const { xslt, layoutId } = await render(prof, doc, i, r);
                parseCheck(r.xml, `${r.id}.xml`);
                parseCheck(xslt, `${r.id}.xslt`);
                writeFileSync(join(HAZIR, `${r.id}.xml`), r.xml);
                writeFileSync(join(HAZIR, `${r.id}.xslt`), xslt);
                out.push({ prof, doc, r, layoutId });
            } catch (err) {
                throw new Error(`${prof.code} / ${doc.n}: ${err.message}`);
            }
        }
    }
    if (only) {
        console.log(`${out.length} şablon yazıldı (yalnız ${only}*; liste ve rapor güncellenmedi).`);
        return;
    }

    /* ---------------- galeri listesi */
    const tsItems = out.map(({ prof, doc, r }) => {
        const tags = [...new Set([...(doc.tags ?? []), ...r.meta.tags])].slice(0, 4);
        return `    m('${r.id}', '${prof.sector}', '${prof.code}', '${r.meta.docTypeId}', '${r.meta.moduleId}', '${prof.c[0]}',\n        '${esc(`${prof.name} — ${doc.n}`)}',\n        '${esc(doc.w)}',\n        [${tags.map((x) => `'${esc(x)}'`).join(', ')}]),`;
    });
    writeFileSync(join(ROOT, 'src', 'sector-templates', 'groups', 'meslek.generated.ts'), `// Otomatik üretildi: node scripts/gen-meslek-templates.mjs — elle düzenlemeyin.
import { hazirPath, type SectorTemplate, type SectorId } from '../types';

const m = (id: string, sector: SectorId, meslek: string, docTypeId: string, moduleId: string, accent: string, name: string, description: string, tags: string[]): SectorTemplate => ({
    id, sector, meslek, name, description, docTypeId, moduleId, accent, xslt: hazirPath(id, 'xslt'), xml: hazirPath(id, 'xml'), tags,
});

/** Esnaf ve sanatkâr meslek grupları (NACE eşleştirmeli) için belge türüne göre örnek tasarımlar. */
export const MESLEK_TEMPLATES: SectorTemplate[] = [
${tsItems.join('\n')}
];
`);

    /* ---------------- meslek listesi (filtre) */
    const groups = Object.entries(GROUPS).map(([g, info]) => ({
        id: g, label: info.label,
        items: CATALOG.filter((p) => p.code.startsWith(`${g}.`)).map((p) => ({ code: p.code, name: naceBy[p.code].name })),
    }));
    writeFileSync(join(ROOT, 'src', 'sector-templates', 'meslekler.generated.ts'), `// Otomatik üretildi: node scripts/gen-meslek-templates.mjs — elle düzenlemeyin.

export interface MeslekGroup {
    id: string;
    label: string;
    items: { code: string; name: string }[];
}

/** Esnaf ve sanatkâr meslek grupları (meslek-nace.pro sınıflaması). */
export const MESLEK_GROUPS: MeslekGroup[] = ${JSON.stringify(groups, null, 4).replace(/"([a-z]+)":/g, '$1:').replace(/"/g, "'")};

export const MESLEK_NAME: Record<string, string> = Object.fromEntries(MESLEK_GROUPS.flatMap(g => g.items.map(i => [i.code, i.name])));
`);

    /* ---------------- rapor */
    writeFileSync(join(ROOT, 'docs', 'MESLEK-BELGE-ANALIZI.md'), report(out));
    const kinds = out.reduce((a, o) => ({ ...a, [o.r.meta.label]: (a[o.r.meta.label] ?? 0) + 1 }), {});
    console.log(`${out.length} şablon (${CATALOG.length} meslek) yazıldı.`);
    console.log(Object.entries(kinds).map(([k, c]) => `  ${k}: ${c}`).join('\n'));
}

function report(out) {
    const byProf = new Map();
    for (const o of out) {
        if (!byProf.has(o.prof.code)) byProf.set(o.prof.code, []);
        byProf.get(o.prof.code).push(o);
    }
    const kindCount = {};
    for (const o of out) kindCount[o.r.meta.label] = (kindCount[o.r.meta.label] ?? 0) + 1;
    const lines = [];
    const p = (s = '') => lines.push(s);
    p('# Meslek Gruplarına Göre e-Belge Türleri ve XML Değerlendirmesi');
    p();
    p('> Otomatik üretildi: `node scripts/gen-meslek-templates.mjs`. Kaynak: [meslek-nace.pro/meslek](https://meslek-nace.pro/meslek/) — 11 grup, 184 meslek dalı ve her dalın NACE faaliyet kodları.');
    p();
    p('Her meslek için faaliyet kodlarındaki işlem karışımı (perakende / toptan satış, imalat, onarım-hizmet, taşıma, alış) incelenerek mesleğin günlük işlemlerinde düzenlemesi gereken e-belge türleri belirlenmiş ve her meslek için **en az iki** örnek tasarım (UBL-TR XML + XSLT) hazırlanmıştır. Tasarımlar galeride *Meslek* filtresiyle bulunur; dosyalar `public/ebelge/hazir/meslek-*.xml|xslt`.');
    p();
    p('**Önemli:** e-Fatura / e-Arşiv / e-İrsaliye / e-SMM / e-Müstahsil geçiş yükümlülükleri ciro, sektör ve lisans durumuna göre değişir (VUK 509 sıra no.lu Tebliğ ve sonraki değişiklikler). Tevkifat oranları, istisna ve özel matrah kodları belge tarihindeki GİB kod listeleriyle; profil kuralları (HKS, IDIS, ILAC_TIBBICIHAZ, ENERJI, SGK) güncel UBL-TR kılavuzlarıyla doğrulanmalıdır. Örneklerdeki kişi, firma, VKN/TCKN ve IBAN bilgileri kurgusaldır (denetim haneleri geçerlidir).');
    p();
    p('## 1. Belge türleri ve XML yapıları');
    p();
    p('| Belge türü | Kök eleman | CustomizationID | ProfileID | Tip kodu | Şablon sayısı |');
    p('|---|---|---|---|---|---|');
    const KROWS = [
        ['e-Fatura', 'Invoice', 'TR1.2', 'TICARIFATURA / TEMELFATURA / HKS / IDIS / ILAC_TIBBICIHAZ / ENERJI / KAMU', 'SATIS, TEVKIFAT, ISTISNA, OZELMATRAH, IHRACKAYITLI, SGK, HKSSATIS, HKSKOMISYONCU, KONAKLAMAVERGISI, SARJ, SARJANLIK'],
        ['e-Arşiv Fatura', 'Invoice', 'TR1.2', 'EARSIVFATURA', 'SATIS, OZELMATRAH, ISTISNA, TEKNOLOJIDESTEK, KONAKLAMAVERGISI'],
        ['e-Fatura (İhracat)', 'Invoice', 'TR1.2', 'IHRACAT', 'ISTISNA (301)'],
        ['e-Fatura (Yolcu Beraberi)', 'Invoice', 'TR1.2', 'YOLCUBERABERFATURA', 'ISTISNA (501)'],
        ['e-Arşiv (Mikro İhracat / ETGB)', 'Invoice', 'TR1.2', 'EARSIVFATURA', 'ISTISNA (301)'],
        ['e-SMM', 'Invoice', 'TR1.2', 'EARSIVBELGE', 'SERBESTMESLEKMAKBUZU'],
        ['e-Bilet', 'Invoice', 'TR1.2', 'e-Bilet (depo kuralı)', 'SATIS'],
        ['e-Müstahsil Makbuzu', 'CreditNote', 'TR1.2.1', 'EARSIVBELGE', 'MUSTAHSILMAKBUZ'],
        ['e-Gider Pusulası', 'CreditNote', 'TR1.2.1', 'GIDERPUSULASI', 'SATIS / IADE'],
        ['e-Kıymetli Maden (Alım)', 'CreditNote', 'TR1.2.1', 'EKIYMETLIMADENBELGE', 'ALIM'],
        ['e-İrsaliye', 'DespatchAdvice', 'TR1.2.1', 'TEMELIRSALIYE / HKSIRSALIYE / IDISIRSALIYE', 'SEVK'],
    ];
    for (const [k, ...rest] of KROWS) p(`| ${k} | ${rest.join(' | ')} | ${kindCount[k] ?? 0} |`);
    p();
    p(`Toplam **${out.length}** şablon, **${byProf.size}** meslek.`);
    p();
    p('## 2. Meslek gruplarına göre XML değerlendirmesi');
    for (const [g, info] of Object.entries(GROUPS)) {
        const profs = [...byProf.values()].filter((arr) => arr[0].prof.code.startsWith(`${g}.`));
        p();
        p(`### ${g} — ${info.label}`);
        p();
        for (const s of info.xml) p(`- ${s}`);
        p();
        p('| Kod | Meslek | Belge türleri (şablonlar) | Gerekçe |');
        p('|---|---|---|---|');
        for (const arr of profs) {
            const pr = arr[0].prof;
            const docs = arr.map((o) => `${o.doc.n} — *${o.r.meta.label}* \`${o.r.sub}\``).join('<br>');
            p(`| ${pr.code} | ${pr.name} | ${docs} | ${pr.why.replace(/\|/g, '/')} |`);
        }
    }
    p();
    p('## 3. Meslek bazında XML ayrıntıları');
    for (const arr of byProf.values()) {
        const pr = arr[0].prof;
        const nace = naceBy[pr.code].nace;
        p();
        p(`### ${pr.code} ${pr.name}`);
        p();
        p(`NACE: ${nace.slice(0, 8).map((x) => `${x.code} ${x.desc}`).join('; ')}${nace.length > 8 ? ` … (+${nace.length - 8} kod)` : ''}`);
        p();
        p(`**Belge seçimi:** ${pr.why}`);
        for (const o of arr) {
            p();
            p(`- **${o.doc.n}** (\`${o.r.id}\`, ${o.r.meta.label}, yerleşim *${o.layoutId}*): ${o.doc.w}`);
            for (const s of o.r.meta.info) p(`  - ${s}`);
        }
    }
    p();
    return `${lines.join('\n')}`;
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
