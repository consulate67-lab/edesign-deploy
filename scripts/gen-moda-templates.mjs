// Tekstil & ayakkabı hazır şablonlarını (public/ebelge/hazir/<id>.xslt + .xml) scripts/moda/ altındaki
// tanımlardan üretir; çıktıların iyi biçimli XML olduğunu denetler. Tanımları değiştirince çalıştırın:
//   node scripts/gen-moda-templates.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOMParser } from '@xmldom/xmldom';
import { HAZIR } from './moda/lib.mjs';

const groups = await Promise.all(['fatura', 'arsiv', 'irsaliye', 'ihracat', 'mikro']
    .map(async (g) => (await import(`./moda/${g}.mjs`).catch((err) => {
        if (err.code === 'ERR_MODULE_NOT_FOUND' && String(err.message).includes(`${g}.mjs`)) return { default: [] };
        throw err;
    })).default));

const wellFormed = (name, text) => {
    const errors = [];
    new DOMParser({ onError: (level, msg) => { if (level !== 'warning') errors.push(msg); } }).parseFromString(text, 'text/xml');
    if (errors.length) throw new Error(`${name}: ${errors[0]}`);
};

let count = 0;
for (const tpl of groups.flat()) {
    wellFormed(`${tpl.id}.xml`, tpl.xml);
    wellFormed(`${tpl.id}.xslt`, tpl.xslt);
    writeFileSync(join(HAZIR, `${tpl.id}.xml`), tpl.xml);
    writeFileSync(join(HAZIR, `${tpl.id}.xslt`), tpl.xslt);
    count++;
}
console.log(`${count} şablon yazıldı.`);
