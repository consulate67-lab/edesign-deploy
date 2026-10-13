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

// AB / AEA, Birleşik Krallık ve İsviçre KDV numarası ön ekleri (Yunanistan EL, Kuzey İrlanda XI).
const VAT_PREFIXES = new Set([
    'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'EL', 'ES', 'FI', 'FR', 'HR', 'HU', 'IE', 'IT', 'LT',
    'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'XI', 'GB', 'CH', 'NO', 'IS', 'LI',
]);
const VAT_RE = /^([A-Z]{2})([0-9A-Z+*]{2,14})$/;
const compactVat = (value) => String(value ?? '').toUpperCase().replace(/[\s./-]+/g, '');

/** Ülke ön ekli KDV numarası (IE1234567T, DE123456789, CHE-123.456.789 MWST). */
export const isVatId = (value) => {
    const m = compactVat(value).match(VAT_RE);
    return !!m && VAT_PREFIXES.has(m[1]) && /\d/.test(m[2]);
};

// Ulusal vergi numaraları, ülke önekiyle: ABD EIN, Rusya ИНН, Hindistan GSTIN, Çin birleşik sosyal kredi kodu,
// Brezilya CNPJ / CPF. GSTIN, kredi kodu ve CNPJ öneksiz de yazılabilir; ИНН, EIN ve CPF önek ister
// (10 haneli ИНН VKN ile, 11 haneli CPF TCKN ile karışır).
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const USCC_RE = /^[0-9A-Z]{2}\d{6}[0-9A-Z]{10}$/;

/** CNPJ (14 hane) ve CPF (11 hane) sağlama haneleri, mod 11. */
const isValidBrId = (v) => {
    if (!/^(?:\d{11}|\d{14})$/.test(v) || /^(\d)\1+$/.test(v)) return false;
    const weight = v.length === 14 ? (k) => 2 + (k % 8) : (k) => k + 2;
    const dv = (s) => {
        let sum = 0;
        for (let i = s.length - 1, k = 0; i >= 0; i--, k++) sum += Number(s[i]) * weight(k);
        const r = sum % 11;
        return r < 2 ? 0 : 11 - r;
    };
    const base = v.slice(0, -2);
    const d1 = dv(base);
    return v === `${base}${d1}${dv(`${base}${d1}`)}`;
};

const NATIONAL_IDS = {
    US: { kind: 'EIN', re: /^US\d{9}$/ },
    RU: { kind: 'INN', re: /^RU(?:\d{10}|\d{12})$/ },
    IN: { kind: 'GSTIN', re: new RegExp(`^IN${GSTIN_RE.source.slice(1)}`) },
    CN: { kind: 'USCC', re: new RegExp(`^CN${USCC_RE.source.slice(1)}`) },
    BR: { kind: 'CNPJ', re: { test: (v) => /^BR\d+$/.test(v) && isValidBrId(v.slice(2)) } },
};
const compactNational = (value) => {
    const v = compactVat(value);
    if (GSTIN_RE.test(v)) return `IN${v}`;
    if (USCC_RE.test(v)) return `CN${v}`;
    return /^\d{14}$/.test(v) && isValidBrId(v) ? `BR${v}` : v;
};
const nationalIdCountry = (value) => {
    const v = compactNational(value);
    return Object.keys(NATIONAL_IDS).find((c) => NATIONAL_IDS[c].re.test(v)) ?? null;
};

/** Lisans kimliği: KDV ve ulusal numaralar boşluksuz büyük harf, VKN/TCKN yalnız rakam. */
export const normalizeLicenseId = (value) => (
    isVatId(value) ? compactVat(value) : nationalIdCountry(value) ? compactNational(value) : normalizeTaxId(value)
);

export const isValidLicenseId = (value) => {
    const v = normalizeLicenseId(value);
    return isVatId(v) || !!nationalIdCountry(v) || isValidTaxId(v);
};

export const licenseIdKind = (id) => {
    if (isVatId(id)) return 'VAT';
    const national = nationalIdCountry(id);
    if (national === 'BR') return compactNational(id).length === 13 ? 'CPF' : 'CNPJ';
    if (national) return NATIONAL_IDS[national].kind;
    return String(id ?? '').length === 11 ? 'TCKN' : 'VKN';
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

// KDV numarasıyla lisans: faturada satıcının KDV kaydı; irsaliyede KDV kaydı yoksa elektronik adresi.
const VAT_SCHEME = `${ln('PartyTaxScheme')}[${ln('TaxScheme')}/${ln('ID')}='VAT']`;
const INVOICE_SELLER = `/*[local-name()='Invoice' or local-name()='CreditNote']/${ln('AccountingSupplierParty')}/${ln('Party')}`;
const DESPATCH_SELLER = `/${ln('DespatchAdvice')}/${ln('DespatchSupplierParty')}/${ln('Party')}`;
const VAT_ISSUER_XPATH = `(${[
    `${INVOICE_SELLER}/${VAT_SCHEME}/${ln('CompanyID')}`,
    `${INVOICE_SELLER}[not(${VAT_SCHEME})]/${ln('PartyTaxScheme')}/${ln('CompanyID')}`,
    `${DESPATCH_SELLER}/${ln('PartyTaxScheme')}/${ln('CompanyID')}`,
    `${DESPATCH_SELLER}[not(${ln('PartyTaxScheme')}/${ln('CompanyID')})]/${ln('EndpointID')}`,
].join(' | ')})[1]`;
const UPPER = "translate(normalize-space(%), 'abcdefghijklmnopqrstuvwxyz ./-', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')";
const DIGITS = (x) => `translate(${x},translate(${x},'0123456789',''),'')`;

// Ulusal formatlarda satıcının numarası; önekle birleştirilip lisanstakiyle karşılaştırılır.
const RU_SELLER_INN = `(/${ln('Файл')}/${ln('Документ')}/${ln('СвСчФакт')}/${ln('СвПрод')}/${ln('ИдСв')}/*/@*[local-name()='ИННЮЛ' or local-name()='ИННФЛ'])[1]`;
const IN_SELLER_GSTIN = `(/${ln('GSTInvoice')}/${ln('SellerDtls')}/${ln('Gstin')} | /${ln('EWayBill')}/${ln('fromGstin')})[1]`;
const CN_SELLER_ID = `(/${ln('EInvoice')}/${ln('EInvoiceData')}/${ln('SellerInformation')}/${ln('SellerIdNum')})[1]`;
const BR_EMIT = `${ln('emit')}/*[local-name()='CNPJ' or local-name()='CPF']`;
const BR_SELLER_ID = `(${[
    `/${ln('nfeProc')}/${ln('NFe')}/${ln('infNFe')}/${BR_EMIT}`,
    `/${ln('NFe')}/${ln('infNFe')}/${BR_EMIT}`,
    `/${ln('cteProc')}/${ln('CTe')}/${ln('infCte')}/${BR_EMIT}`,
    `/${ln('CTe')}/${ln('infCte')}/${BR_EMIT}`,
    `/${ln('NFSe')}/${ln('infNFSe')}/${BR_EMIT}`,
].join(' | ')})[1]`;
const NATIONAL_ISSUER = {
    US: `concat('US',${DIGITS(`string(${VAT_ISSUER_XPATH})`)})`,
    RU: `concat('RU',${DIGITS(`string(${RU_SELLER_INN})`)})`,
    IN: `concat('IN',${UPPER.replace('%', IN_SELLER_GSTIN)})`,
    CN: `concat('CN',${UPPER.replace('%', CN_SELLER_ID)})`,
    BR: `concat('BR',${DIGITS(`string(${BR_SELLER_ID})`)})`,
};

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
    if (isVatId(taxId)) return withIssuerVatId(xml, compactVat(taxId));
    const national = nationalIdCountry(taxId);
    if (national) return withIssuerNationalId(xml, national, compactNational(taxId));
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

function withIssuerNationalId(xml, country, id) {
    if (country === 'US') return withIssuerVatId(xml, id);
    const value = id.slice(2);
    const put = (_all, open, close) => `${open}${value}${close}`;
    const inBlock = (tag, re) => xml.replace(new RegExp(`<${tag}[\\s>][\\s\\S]*?</${tag}>`), (part) => part.replace(re, put));
    if (country === 'RU') return inBlock('СвПрод', /(ИНН(?:ЮЛ|ФЛ)=")[^"]*(")/);
    if (country === 'CN') return inBlock('SellerInformation', /(<SellerIdNum>)[^<]*(<\/SellerIdNum>)/);
    if (country === 'BR') {
        const tag = value.length === 14 ? 'CNPJ' : 'CPF';
        const swap = (part) => part.replace(/<(CNPJ|CPF)>[^<]*<\/\1>/, `<${tag}>${value}</${tag}>`);
        return xml.replace(/<emit>[\s\S]*?<\/emit>/, swap).replace(/<prest>[\s\S]*?<\/prest>/, swap);
    }
    return /<EWayBill[\s>]/.test(xml)
        ? xml.replace(/(<fromGstin>)[^<]*(<\/fromGstin>)/, put)
        : inBlock('SellerDtls', /(<Gstin>)[^<]*(<\/Gstin>)/);
}

function withIssuerVatId(xml, id) {
    const root = xml.match(/<(?![?!])(?:[\w.-]+:)?([\w.-]+)/)?.[1];
    const role = root === 'Invoice' || root === 'CreditNote' ? 'AccountingSupplierParty' : root === 'DespatchAdvice' ? 'DespatchSupplierParty' : null;
    if (!role) return xml;
    const block = new RegExp(`<(?:[\\w.-]+:)?${role}[\\s>][\\s\\S]*?</(?:[\\w.-]+:)?${role}>`);
    return xml.replace(block, (part) => {
        const schemes = [...part.matchAll(/<((?:[\w.-]+:)?PartyTaxScheme)\b[^>]*>[\s\S]*?<\/\1>/g)];
        const scheme = schemes.find(m => /<(?:[\w.-]+:)?ID\b[^>]*>\s*VAT\s*</.test(m[0])) ?? schemes[0];
        if (scheme) {
            const replaced = scheme[0].replace(/(<((?:[\w.-]+:)?CompanyID)\b[^>]*>)[^<]*(<\/\2>)/, (_all, open, _tag, close) => `${open}${id}${close}`);
            return part.slice(0, scheme.index) + replaced + part.slice(scheme.index + scheme[0].length);
        }
        if (role !== 'DespatchSupplierParty') return part;
        return part.replace(/(<((?:[\w.-]+:)?EndpointID)\b[^>]*>)[^<]*(<\/\2>)/, (_all, open, _tag, close) => `${open}${id}${close}`);
    });
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

const SEAL_TAX_ID = '{taxId}';
const xpathLiteral = (s) => `'${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')}'`;

/**
 * Çevrimiçi lisans mührü: belge her açıldığında arka plan resmi olarak
 * doğrulama adreslerine (lisans anahtarı + belgedeki VKN/TCKN) istek gider;
 * sunucu geçerliyse saydam resim, değilse TEST filigranı döner. Arka plan
 * resmi kullanıldığı için betik gerekmez ve adrese ulaşılamazsa (güvenlik
 * duvarı, antivirüs, çevrimdışı) kırık resim görünmez; karar çevrimdışı
 * kilide kalır. Birden çok adres katman olarak verilir; biri engellense de
 * diğeri çalışır.
 */
function buildSeal(p, cls, digitsVar, urls) {
    const urlExpr = (u) => {
        const [before, after = ''] = u.split(SEAL_TAX_ID);
        return `${xpathLiteral(`url(${before}`)},$${digitsVar},${xpathLiteral(`${after})`)}`;
    };
    const base = [
        'position:absolute', 'left:0', 'top:0', 'width:100%', 'height:100%', 'margin:0', 'padding:0', 'border:0',
        'z-index:2147483646', 'pointer-events:none', 'background-color:transparent', 'background-repeat:no-repeat',
        'background-position:center center', 'background-size:72% auto',
        '-webkit-print-color-adjust:exact', 'print-color-adjust:exact', '',
    ].join(';');
    const layers = urls.map(u => `${urlExpr(u)},','`).join(',').replace(/,','$/, '');
    const style = `concat(${xpathLiteral(`${base}background-image:`)},${urlExpr(urls[urls.length - 1])},${xpathLiteral(';background-image:')},${layers})`;
    const css = `@media print{.${cls}{position:fixed!important}}`;
    return `<${p}:element name="style"><${p}:attribute name="type">text/css</${p}:attribute><${p}:text>${css}</${p}:text></${p}:element>`
        + `<${p}:element name="div"><${p}:attribute name="class">${cls}</${p}:attribute>`
        + `<${p}:attribute name="style"><${p}:value-of select="${style}"/></${p}:attribute></${p}:element>`;
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
export function applyLicenseLock(xslt, taxId, { sealUrls = [] } = {}) {
    const id = normalizeLicenseId(taxId);
    if (!isValidLicenseId(id)) throw new Error('Geçersiz VKN/TCKN, KDV ya da ulusal vergi numarası.');
    const vat = isVatId(id);
    const national = nationalIdCountry(id);
    if (hasLicenseLock(xslt)) throw new Error('Bu dosya zaten lisans kilitli.');
    for (const u of sealUrls) {
        if (!/^https?:\/\/[^\s'"()\\]+$/.test(u) || u.split(SEAL_TAX_ID).length !== 2) {
            throw new Error(`Geçersiz doğrulama adresi: ${u}`);
        }
    }
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
    decls.push(vat
        ? `<${p}:variable name="${idVar}" select="${UPPER.replace('%', VAT_ISSUER_XPATH)}"/>`
        : national
            ? `<${p}:variable name="${idVar}" select="${NATIONAL_ISSUER[national]}"/>`
            : `<${p}:variable name="${idVar}" select="normalize-space(${ISSUER_XPATH})"/>`);
    const idPart = sampleTerms(tableVar, idVar, id, Array.from({ length: Math.max(11, id.length) }, (_, i) => i + 1));
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
    const className = () => {
        let c = 'x';
        for (let i = 0; i < 7; i++) c += 'abcdefghijkmnpqrstuvwxyz'[rnd(0, 23)];
        return c;
    };
    let seal = '';
    if (sealUrls.length) {
        const digitsVar = name();
        decls.push(`<${p}:variable name="${digitsVar}" select="translate($${idVar},translate($${idVar},'0123456789',''),'')"/>`);
        seal = buildSeal(p, className(), digitsVar, sealUrls);
    }
    edits.push({ start: declAt, end: declAt, text: `\n${shuffle(decls).join('\n')}\n` });
    const bodyAt = host.index + host[0].length;
    const cls = className();
    edits.push({ start: bodyAt, end: bodyAt, text: `<${p}:if test="not($${okVar})">${buildWatermark(p, cls)}</${p}:if>${seal}` });

    edits.sort((a, b) => b.start - a.start || (b.end - b.start) - (a.end - a.start));
    let out = xslt;
    for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    return out;
}
