/**
 * Satın alınan XSLT'yi tek bir VKN/TCKN'ye kilitler. Kontrol yalnızca XSLT 1.0
 * ifadeleriyle çalışır (eklenti fonksiyonu, document() ya da betik yok); bu yüzden
 * tarayıcı, MSXML ve .NET motorlarında, entegratör ekranlarında ve çevrimdışı aynı
 * sonucu verir. Belgeyi düzenleyenin VKN/TCKN'si lisanstakinden farklıysa ya da
 * korunan gömülü resimler (logo, kaşe) veya IBAN metinleri dosyada değiştirilmişse
 * belgenin üstüne TEST filigranı basılır. XSLT düz metin olduğundan bu kesin bir
 * kilit değil, caydırıcıdır.
 */
import { TEST_WATERMARK_PNG } from './test-watermark-png.js';

// Karakter → sayı tablosu. Dosyada bulunması kilidin işaretidir; değiştirilirse
// sağlama tutmaz. Tırnak, &, <, >, { } içermez.
const TABLE = '~lIh9T@+bR6nY?a^.LCj%|p2y5FDX]J80#7gwHmcd:VQx3t,M4A(Z;$zUPk [*rBOGKvN/-)e1Su!sqif=WE_o';
const MOD = 999983;
const MAX_SAMPLES = 32;
const MAX_PROTECTED = 16;
const MAX_PROTECTED_LENGTH = 400000;
const TERMS_PER_VARIABLE = 30;

export const hasLicenseLock = (xslt) => typeof xslt === 'string' && xslt.includes(TABLE);

export const normalizeTaxId = (value) => String(value ?? '').replace(/\D+/g, '');

const isValidVkn = (v) => {
    if (!/^\d{10}$/.test(v)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        const t = (Number(v[i]) + 9 - i) % 10;
        sum += t === 9 ? 9 : (t * 2 ** (9 - i)) % 9;
    }
    return (10 - (sum % 10)) % 10 === Number(v[9]);
};

const isValidTckn = (v) => {
    if (!/^[1-9]\d{10}$/.test(v)) return false;
    const d = [...v].map(Number);
    const odd = d[0] + d[2] + d[4] + d[6] + d[8];
    const even = d[1] + d[3] + d[5] + d[7];
    if ((((odd * 7 - even) % 10) + 10) % 10 !== d[9]) return false;
    return d.slice(0, 10).reduce((a, b) => a + b, 0) % 10 === d[10];
};

/** 10 haneli VKN ya da 11 haneli TCKN, sağlama haneleriyle birlikte. */
export const isValidTaxId = (value) => {
    const v = normalizeTaxId(value);
    return v.length === 10 ? isValidVkn(v) : v.length === 11 ? isValidTckn(v) : false;
};

// Belgeyi düzenleyenin kimliği, kök elemana göre: fatura / dekont / müstahsil vb.
// satıcı, irsaliye gönderen, irsaliye yanıtı alıcı, uygulama yanıtı gönderen,
// e-Bilet raporu ve yolcu listesi başlıktaki gönderen.
const ln = (name) => `*[local-name()='${name}']`;
const SCHEME = "[@schemeID='VKN' or @schemeID='TCKN']";
const PARTY_ID = `${ln('Party')}/${ln('PartyIdentification')}/${ln('ID')}${SCHEME}`;
const ISSUER_XPATH = `(${[
    `/*[local-name()='Invoice' or local-name()='CreditNote']/${ln('AccountingSupplierParty')}/${PARTY_ID}`,
    `/${ln('DespatchAdvice')}/${ln('DespatchSupplierParty')}/${PARTY_ID}`,
    `/${ln('ReceiptAdvice')}/${ln('DeliveryCustomerParty')}/${PARTY_ID}`,
    `/${ln('ApplicationResponse')}/${ln('SenderParty')}/${ln('PartyIdentification')}/${ln('ID')}${SCHEME}`,
    `/*/${ln('baslik')}/${ln('gonderen')}/*[local-name()='vkn' or local-name()='tckn']`,
].join(' | ')})[1]`;

const ISSUER_ROLE = {
    Invoice: 'AccountingSupplierParty',
    CreditNote: 'AccountingSupplierParty',
    DespatchAdvice: 'DespatchSupplierParty',
    ReceiptAdvice: 'DeliveryCustomerParty',
    ApplicationResponse: 'SenderParty',
};

/**
 * Önizleme XML'inde belgeyi düzenleyenin VKN/TCKN'sini lisanstakiyle değiştirir;
 * böylece onaylı tasarımın önizlemesi TEST'siz görünür.
 */
export function withIssuerTaxId(xml, taxId) {
    if (typeof xml !== 'string' || !xml) return xml;
    const id = normalizeTaxId(taxId);
    const scheme = id.length === 11 ? 'TCKN' : 'VKN';
    const root = xml.match(/<(?![?!])(?:[\w.-]+:)?([\w.-]+)/)?.[1];
    const role = root && ISSUER_ROLE[root];
    if (role) {
        const block = new RegExp(`<(?:[\\w.-]+:)?${role}[\\s>][\\s\\S]*?</(?:[\\w.-]+:)?${role}>`);
        return xml.replace(block, (part) => part.replace(
            /(<((?:[\w.-]+:)?ID)\b[^>]*?schemeID\s*=\s*["'])(?:VKN|TCKN)(["'][^>]*>)[^<]*(<\/\2>)/,
            (_all, open, _tag, rest, close) => `${open}${scheme}${rest}${id}${close}`,
        ));
    }
    return xml.replace(
        /(<(?:[\w.-]+:)?gonderen[\s>][\s\S]*?<((?:[\w.-]+:)?(?:vkn|tckn))>)[^<]*(<\/\2>)/,
        (_all, open, _tag, close) => `${open}${id}${close}`,
    );
}

const rnd = (min, max) => {
    const a = new Uint32Array(1);
    globalThis.crypto.getRandomValues(a);
    return min + (a[0] % (max - min + 1));
};

const shuffle = (list) => {
    for (let i = list.length - 1; i > 0; i--) {
        const j = rnd(0, i);
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
};

const idx = (c) => (c ? Math.max(0, TABLE.indexOf(c)) : 0);

const decodeXml = (s) => s.replace(
    /&(?:#x([0-9a-f]+)|#(\d+)|(lt|gt|amp|quot|apos));/gi,
    (_all, hex, dec, name) => hex ? String.fromCodePoint(parseInt(hex, 16))
        : dec ? String.fromCodePoint(Number(dec))
        : { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" }[name.toLowerCase()],
);

// MSXML / .NET dizeleri UTF-16 birimiyle, libxslt karakterle sayar; vekil çift
// içeren değerlerde konumlar motorlar arasında kayar, bu yüzden korunmaz.
const hashable = (value) => !/[\uD800-\uDFFF]/.test(value);

const IBAN_RE = /\bTR(?:[ \u00a0]?\d){24}(?!\d)/i;
const XSL_CONTENT = new Set([
    'template', 'if', 'when', 'otherwise', 'for-each', 'attribute', 'element', 'variable', 'param',
    'with-param', 'comment', 'copy', 'message', 'fallback', 'processing-instruction',
]);
const TOKEN_RE = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE(?:[^>[]|\[[\s\S]*?\])*>|<(\/?)([A-Za-z_][\w.:-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
const SRC_RE = /(\ssrc\s*=\s*)(?:"(data:image\/[^"{}<]*)"|'(data:image\/[^'{}<]*)')/i;
const BODY_OPEN_RE = /<body\b(?:[^>"']|"[^"]*"|'[^']*')*>/i;

const IMP = (rule) => `${rule}!important`;
const BOX_RESET = [
    'margin:0', 'padding:0', 'border:0', 'background:transparent', 'box-shadow:none', 'float:none',
    'min-width:0', 'max-width:none', 'min-height:0', 'max-height:none', 'opacity:1', 'transform:none',
].map(IMP);

/** Editördeki TEST filigranıyla aynı görünüm; ayrı sınıf adıyla test filigranı temizleyicisine takılmaz. */
function buildWatermark(p, cls) {
    const el = (tag, rules, inner) =>
        `<${p}:element name="${tag}"><${p}:attribute name="style">${rules.join(';')}</${p}:attribute>${inner}</${p}:element>`;
    const css = `body{position:relative!important}@media print{.${cls}{position:fixed!important;left:0!important;top:0!important;right:0!important;bottom:0!important;width:100%!important;height:100%!important}}`;
    const ie7 = `.${cls} img{display:none!important}.${cls} span{display:inline-block!important}`;
    const img = `<${p}:element name="img"><${p}:attribute name="src">${TEST_WATERMARK_PNG}</${p}:attribute>`
        + `<${p}:attribute name="alt">TEST</${p}:attribute><${p}:attribute name="style">${[
            IMP('display:inline-block'), IMP('vertical-align:middle'), IMP('width:72%'), IMP('max-width:640px'),
            IMP('height:auto'), IMP('margin:0'), IMP('padding:0'), IMP('border:0'), IMP('background:transparent'),
            IMP('opacity:1'), IMP('transform:none'), IMP('filter:none'), IMP('box-shadow:none'),
            IMP('-webkit-print-color-adjust:exact'), IMP('print-color-adjust:exact'),
        ].join(';')}</${p}:attribute></${p}:element>`;
    const ieText = el('span', [
        'display:none', IMP('zoom:1'), IMP('vertical-align:middle'),
        "filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.866,M12=0.5,M21=-0.5,M22=0.866,SizingMethod='auto expand')",
        IMP('font-family:Arial,Helvetica,sans-serif'), IMP('font-size:200px'), IMP('font-weight:900'),
        IMP('line-height:1'), IMP('letter-spacing:0.1em'), IMP('color:#f2a7a7'), IMP('white-space:nowrap'),
    ], `<${p}:value-of select="concat('TE','ST')"/>`);
    return `<${p}:element name="style"><${p}:attribute name="type">text/css</${p}:attribute><${p}:text>${css}</${p}:text></${p}:element>`
        + `<${p}:comment>[if lte IE 7]&gt;&lt;style type="text/css"&gt;${ie7}&lt;/style&gt;&lt;![endif]</${p}:comment>`
        + `<${p}:element name="div"><${p}:attribute name="class">${cls}</${p}:attribute><${p}:attribute name="style">${[
            'position:absolute', 'left:0', 'top:0', 'right:0', 'bottom:0', 'width:100%', 'height:100%', IMP('display:block'),
            IMP('z-index:2147483647'), IMP('overflow:hidden'), IMP('pointer-events:none'), ...BOX_RESET,
        ].join(';')}</${p}:attribute>`
        + el('table', [IMP('display:table'), IMP('width:100%'), IMP('height:100%'), IMP('border-collapse:collapse'), IMP('table-layout:auto'), ...BOX_RESET],
            el('tbody', [IMP('display:table-row-group'), ...BOX_RESET],
                el('tr', [IMP('display:table-row'), IMP('height:100%'), ...BOX_RESET],
                    el('td', [
                        IMP('display:table-cell'), IMP('width:100%'), IMP('height:100%'), IMP('font-size:0'), IMP('line-height:0'),
                        IMP('text-align:center'), IMP('vertical-align:middle'), ...BOX_RESET,
                    ], img + ieText))))
        + `</${p}:element>`;
}

/** Dizedeki örnek konumların ağırlıklı toplamı: XPath ifadesi ve beklenen değeri. */
function sampleTerms(t, v, value, positions) {
    const terms = [];
    let sum = 0;
    for (const pos of positions) {
        const w = rnd(3, 997);
        terms.push(`string-length(substring-before($${t},substring($${v},${pos},1)))*${w}`);
        sum += idx(value[pos - 1]) * w;
    }
    const w = rnd(3, 997);
    terms.push(`string-length($${v})*${w}`);
    sum += value.length * w;
    return { terms, sum };
}

const spread = (length) => {
    const n = Math.min(length, MAX_SAMPLES);
    if (n <= 1) return n ? [1] : [];
    return Array.from({ length: n }, (_, j) => 1 + Math.floor((j * (length - 1)) / (n - 1)));
};

/**
 * XSLT'yi `taxId`'ye kilitler. Kök stylesheet ya da filigranın konacağı yer
 * (<body> veya match="/" şablonu) bulunamazsa hata fırlatır.
 */
export function applyLicenseLock(xslt, taxId) {
    const id = normalizeTaxId(taxId);
    if (!isValidTaxId(id)) throw new Error('Geçersiz VKN/TCKN.');
    if (hasLicenseLock(xslt)) throw new Error('Bu dosya zaten lisans kilitli.');
    const root = xslt.match(/<([\w.-]+):(?:stylesheet|transform)\b(?:[^>"']|"[^"]*"|'[^']*')*>/);
    if (root?.index === undefined) throw new Error('XSLT kök elemanı (xsl:stylesheet) bulunamadı.');
    const p = root[1];

    const used = new Set();
    const name = () => {
        for (;;) {
            let n = '_';
            for (let i = 0; i < 5; i++) n += 'abcdefghijkmnpqrstuvwxyz'[rnd(0, 23)];
            if (!used.has(n) && !xslt.includes(n)) {
                used.add(n);
                return n;
            }
        }
    };

    const edits = [];
    const decls = [];
    const terms = [];
    let sum = 0;
    const tableVar = name();
    const idVar = name();
    decls.push(`<${p}:variable name="${tableVar}" select="'${TABLE}'"/>`);
    decls.push(`<${p}:variable name="${idVar}" select="normalize-space(${ISSUER_XPATH})"/>`);
    const idPart = sampleTerms(tableVar, idVar, id, Array.from({ length: 11 }, (_, i) => i + 1));
    terms.push(...idPart.terms);
    sum += idPart.sum;

    let protectedCount = 0;
    const protect = (rawContent, value) => {
        const holder = name();
        const str = name();
        decls.push(`<${p}:variable name="${holder}">${rawContent}</${p}:variable>`);
        decls.push(`<${p}:variable name="${str}" select="string($${holder})"/>`);
        const part = sampleTerms(tableVar, str, value, spread(value.length));
        terms.push(...part.terms);
        sum += part.sum;
        protectedCount++;
        return holder;
    };

    const xslPrefix = `${p}:`;
    const stack = [];
    const inTemplateBody = () => stack.some(n => n === `${p}:template` || n === `${p}:variable` || n === `${p}:param`);
    const textAllowed = () => {
        const parent = stack[stack.length - 1];
        if (!parent) return false;
        return parent.startsWith(xslPrefix) ? XSL_CONTENT.has(parent.slice(xslPrefix.length)) : true;
    };
    // Baş/son boşluk dışarıda kalır: motorlar metin kenarlarındaki boşluğu farklı
    // ele alabilir, korunan değer ise her motorda aynı olmalı.
    const considerText = (start, end) => {
        if (protectedCount >= MAX_PROTECTED || end - start > MAX_PROTECTED_LENGTH) return;
        const [, lead, core, trail] = xslt.slice(start, end).match(/^([ \t\r\n]*)([\s\S]*?)([ \t\r\n]*)$/);
        if (!core) return;
        const value = decodeXml(core.replace(/\r\n?/g, '\n'));
        if (!(IBAN_RE.test(value) || value.includes('data:image/')) || !hashable(value)) return;
        if (!inTemplateBody() || !textAllowed()) return;
        const holder = protect(core, value);
        edits.push({ start, end, text: `${lead}<${p}:value-of select="$${holder}"/>${trail}` });
    };

    TOKEN_RE.lastIndex = 0;
    let last = 0;
    for (let m; (m = TOKEN_RE.exec(xslt));) {
        if (m.index > last) considerText(last, m.index);
        last = m.index + m[0].length;
        const tag = m[2];
        if (!tag) continue;
        if (m[1]) {
            const at = stack.lastIndexOf(tag);
            if (at >= 0) stack.length = at;
            continue;
        }
        if (!tag.startsWith(xslPrefix) && inTemplateBody() && protectedCount < MAX_PROTECTED) {
            const src = m[3].match(SRC_RE);
            const raw = src && (src[2] ?? src[3]);
            if (raw && raw.length <= MAX_PROTECTED_LENGTH) {
                const content = raw.replace(/[\t\r\n]/g, ' ').trim();
                const value = decodeXml(content);
                if (hashable(value)) {
                    const holder = protect(content, value);
                    const start = m.index + 1 + tag.length + src.index;
                    edits.push({ start, end: start + src[0].length, text: `${src[1]}"{$${holder}}"` });
                }
            }
        }
        if (!m[4]) stack.push(tag);
    }

    let declAt = root.index + root[0].length;
    const IMPORT_RE = new RegExp(`(?:\\s|<!--[\\s\\S]*?-->)*<${p}:import\\b(?:[^>"']|"[^"]*"|'[^']*')*?/>`, 'y');
    for (;;) {
        IMPORT_RE.lastIndex = declAt;
        const imp = IMPORT_RE.exec(xslt);
        if (!imp) break;
        declAt = IMPORT_RE.lastIndex;
    }

    const rootTemplate = new RegExp(`<${p}:template\\b(?:[^>"']|"[^"]*"|'[^']*')*\\bmatch\\s*=\\s*(["'])/\\1(?:[^>"']|"[^"]*"|'[^']*')*>`);
    const host = xslt.match(BODY_OPEN_RE) ?? xslt.match(rootTemplate);
    if (host?.index === undefined) throw new Error('Filigran için XSLT içinde <body> veya kök şablon bulunamadı.');

    const salt = rnd(1, MOD - 1);
    const partials = [];
    shuffle(terms);
    for (let i = 0; i < terms.length; i += TERMS_PER_VARIABLE) {
        const partial = name();
        decls.push(`<${p}:variable name="${partial}" select="${terms.slice(i, i + TERMS_PER_VARIABLE).join('+')}"/>`);
        partials.push(`$${partial}`);
    }
    const okVar = name();
    decls.push(`<${p}:variable name="${okVar}" select="(${partials.join('+')}+${salt}) mod ${MOD} = ${(sum + salt) % MOD}"/>`);
    edits.push({ start: declAt, end: declAt, text: `\n${shuffle(decls).join('\n')}\n` });
    const bodyAt = host.index + host[0].length;
    let cls = 'x';
    for (let i = 0; i < 7; i++) cls += 'abcdefghijkmnpqrstuvwxyz'[rnd(0, 23)];
    edits.push({ start: bodyAt, end: bodyAt, text: `<${p}:if test="not($${okVar})">${buildWatermark(p, cls)}</${p}:if>` });

    edits.sort((a, b) => b.start - a.start || (b.end - b.start) - (a.end - a.start));
    let out = xslt;
    for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    return out;
}
