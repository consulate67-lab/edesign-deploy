/**
 * Ulusal (UBL dışı) e-belge biçimlerinin temel kontrolleri: zorunlu alanlar, kimlik / tarih
 * biçimleri ve kalem toplamlarının belge toplamıyla uyumu. Resmî XSD / JSON şemasının alt kümesidir.
 *   - Файл (ФНС УПД 5.03), GSTInvoice (GST e-Invoice INV-01), EWayBill (EWB-01), EInvoice (数电票).
 */
import i18n from '../i18n';
import { chineseAmount } from '../international/samples/national';
import type { Check } from './validate';

type Row = [string, string];

interface Rules {
    required: Row[];
    formats: [field: string, value: string, re: RegExp][];
    totals: [field: string, actual: string, expected: string][];
    info: Row[];
}

const kids = (el: Element | null | undefined, name: string) => (el ? Array.from(el.children).filter(c => c.localName === name) : []);
const at = (el: Element | null | undefined, path: string): Element | null =>
    path.split('/').reduce<Element | null>((e, n) => (e ? kids(e, n)[0] ?? null : null), el ?? null);
const txt = (el: Element | null | undefined, path: string) => at(el, path)?.textContent?.trim() ?? '';
const attr = (el: Element | null | undefined, name: string) => el?.getAttribute(name)?.trim() ?? '';
const num = (s: string) => Number(s.replace(',', '.')) || 0;
const sum = (els: Element[], value: (e: Element) => string) => els.reduce((n, e) => n + num(value(e)), 0);
const money = (n: number) => n.toFixed(2);
/** Toplam farkı: her kalemde en çok bir kuruş yuvarlama. */
const total = (field: string, actual: string, expected: number, lines: number): Rules['totals'] =>
    actual && Math.abs(num(actual) - expected) > 0.01 * Math.max(1, lines) + 1e-9 ? [[field, actual, money(expected)]] : [];
const each = (els: Element[], field: string, value: (e: Element) => string, re: RegExp): Rules['formats'] => {
    const bad = els.map(value).find(v => v && !re.test(v));
    return bad ? [[field, bad, re]] : [];
};

const labels = () => i18n.t('validate.info', { returnObjects: true });

const GSTIN = /^(\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]|URP)$/;
const IN_DATE = /^\d{2}\/\d{2}\/\d{4}$/;
const HSN = /^\d{4,8}$/;
const RU_RATE = /^(без НДС|0%|5%|7%|10%|18%|20%|22%|5\/105|7\/107|10\/110|18\/118|20\/120|22\/122|НДС исчисляется налоговым агентом)$/;

function ruUpd(root: Element): Rules {
    const d = at(root, 'Документ');
    const sf = at(d, 'СвСчФакт');
    const rows = kids(at(d, 'ТаблСчФакт'), 'СведТов');
    const totalRow = at(d, 'ТаблСчФакт/ВсегоОпл');
    const party = (path: string) => {
        const id = at(sf, `${path}/ИдСв`);
        const ul = at(id, 'СвЮЛУч');
        const ip = at(id, 'СвИП');
        const fio = at(ip, 'ФИО');
        return {
            name: attr(ul, 'НаимОрг') || attr(at(id, 'СвИнНеУч'), 'Наим') || (fio ? `ИП ${attr(fio, 'Фамилия')} ${attr(fio, 'Имя')}`.trim() : ''),
            inn: attr(ul, 'ИННЮЛ') || attr(ip, 'ИННФЛ'),
            kpp: attr(ul, 'КПП'),
        };
    };
    const seller = party('СвПрод');
    const buyer = party('СвПокуп');
    const fn = attr(d, 'Функция');
    const L = labels();
    return {
        required: [
            ['Файл/@ИдФайл', attr(root, 'ИдФайл')],
            ['Документ/@КНД', attr(d, 'КНД')],
            ['Документ/@Функция', fn],
            ['СвСчФакт/@НомерДок', attr(sf, 'НомерДок')],
            ['СвСчФакт/@ДатаДок', attr(sf, 'ДатаДок')],
            ['СвПрод/ИдСв (ИНН)', seller.inn],
            ['СвПокуп/ИдСв', buyer.name || buyer.inn],
            ['ДенИзм/@КодОКВ', attr(at(sf, 'ДенИзм'), 'КодОКВ')],
            ['ТаблСчФакт/СведТов', rows.length ? '1' : ''],
            ['ВсегоОпл/@СтТовУчНалВсего', attr(totalRow, 'СтТовУчНалВсего')],
            ['Подписант', at(d, 'Подписант') ? '1' : ''],
        ],
        formats: [
            ['Документ/@КНД', attr(d, 'КНД'), /^1115131$/],
            ['Документ/@Функция', fn, /^(СЧФ|СЧФДОП|ДОП)$/],
            ['СвСчФакт/@ДатаДок', attr(sf, 'ДатаДок'), /^\d{2}\.\d{2}\.\d{4}$/],
            ['СвПрод ИНН', seller.inn, /^(\d{10}|\d{12})$/],
            ['СвПрод КПП', seller.kpp, /^\d{4}[\dA-Z]{2}\d{3}$/],
            ['СвПокуп ИНН', buyer.inn, /^(\d{10}|\d{12})$/],
            ['СвПокуп КПП', buyer.kpp, /^\d{4}[\dA-Z]{2}\d{3}$/],
            ...each(rows, 'СведТов/@НалСт', e => attr(e, 'НалСт'), RU_RATE),
        ],
        totals: [
            ...total('ВсегоОпл/@СтТовБезНДСВсего', attr(totalRow, 'СтТовБезНДСВсего'), sum(rows, e => attr(e, 'СтТовБезНДС')), rows.length),
            ...total('ВсегоОпл/@СтТовУчНалВсего', attr(totalRow, 'СтТовУчНалВсего'), sum(rows, e => attr(e, 'СтТовУчНал')), rows.length),
        ],
        info: [
            [L.docNo, attr(sf, 'НомерДок')], [L.date, attr(sf, 'ДатаДок')], [L.type, fn],
            [L.currency, attr(at(sf, 'ДенИзм'), 'КодОКВ')], [L.seller, seller.name], [L.buyer, buyer.name],
            [L.lines, String(rows.length)], [L.payable, attr(totalRow, 'СтТовУчНалВсего')],
        ],
    };
}

function inEinvoice(root: Element): Rules {
    const items = kids(root, 'ItemList');
    const v = at(root, 'ValDtls');
    const L = labels();
    return {
        required: [
            ['@Version', attr(root, 'Version')],
            ['TranDtls/SupTyp', txt(root, 'TranDtls/SupTyp')],
            ['DocDtls/Typ', txt(root, 'DocDtls/Typ')],
            ['DocDtls/No', txt(root, 'DocDtls/No')],
            ['DocDtls/Dt', txt(root, 'DocDtls/Dt')],
            ['SellerDtls/Gstin', txt(root, 'SellerDtls/Gstin')],
            ['SellerDtls/LglNm', txt(root, 'SellerDtls/LglNm')],
            ['SellerDtls/Stcd', txt(root, 'SellerDtls/Stcd')],
            ['BuyerDtls/Gstin', txt(root, 'BuyerDtls/Gstin')],
            ['BuyerDtls/Pos', txt(root, 'BuyerDtls/Pos')],
            ['ItemList', items.length ? '1' : ''],
            ['ValDtls/AssVal', txt(v, 'AssVal')],
            ['ValDtls/TotInvVal', txt(v, 'TotInvVal')],
        ],
        formats: [
            ['TranDtls/SupTyp', txt(root, 'TranDtls/SupTyp'), /^(B2B|SEZWP|SEZWOP|EXPWP|EXPWOP|DEXP)$/],
            ['DocDtls/Typ', txt(root, 'DocDtls/Typ'), /^(INV|CRN|DBN)$/],
            ['DocDtls/No', txt(root, 'DocDtls/No'), /^[A-Za-z1-9][A-Za-z0-9/-]{0,15}$/],
            ['DocDtls/Dt', txt(root, 'DocDtls/Dt'), IN_DATE],
            ['SellerDtls/Gstin', txt(root, 'SellerDtls/Gstin'), GSTIN],
            ['BuyerDtls/Gstin', txt(root, 'BuyerDtls/Gstin'), GSTIN],
            ...each(items, 'ItemList/HsnCd', e => txt(e, 'HsnCd'), HSN),
        ],
        totals: [
            ...total('ValDtls/AssVal', txt(v, 'AssVal'), sum(items, e => txt(e, 'AssAmt')), items.length),
            ...total('ValDtls/TotInvVal', txt(v, 'TotInvVal'),
                sum(items, e => txt(e, 'TotItemVal')) + num(txt(v, 'RndOffAmt')) + num(txt(v, 'OthChrg')) - num(txt(v, 'Discount')), items.length),
        ],
        info: [
            [L.docNo, txt(root, 'DocDtls/No')], [L.date, txt(root, 'DocDtls/Dt')], [L.type, txt(root, 'DocDtls/Typ')], [L.currency, 'INR'],
            [L.seller, txt(root, 'SellerDtls/LglNm')], [L.buyer, txt(root, 'BuyerDtls/LglNm')],
            [L.lines, String(items.length)], [L.payable, txt(v, 'TotInvVal')], ['IRN', txt(root, 'Irn')],
        ],
    };
}

function inEwayBill(root: Element): Rules {
    const items = kids(root, 'itemList');
    const t = (name: string) => txt(root, name);
    const L = labels();
    return {
        required: ['supplyType', 'subSupplyType', 'docType', 'docNo', 'docDate', 'fromGstin', 'fromPincode', 'fromStateCode',
            'toGstin', 'toPincode', 'toStateCode', 'transDistance', 'totInvValue'].map((n): Row => [n, t(n)])
            .concat([['itemList', items.length ? '1' : '']]),
        formats: [
            ['supplyType', t('supplyType'), /^[OI]$/],
            ['docType', t('docType'), /^(INV|BIL|BOE|CHL|CNT|OTH)$/],
            ['docDate', t('docDate'), IN_DATE],
            ['fromGstin', t('fromGstin'), GSTIN],
            ['toGstin', t('toGstin'), GSTIN],
            ['fromPincode', t('fromPincode'), /^[1-9]\d{5}$/],
            ['toPincode', t('toPincode'), /^[1-9]\d{5}$/],
            ['transMode', t('transMode'), /^[1-4]$/],
            ...each(items, 'itemList/hsnCode', e => txt(e, 'hsnCode'), HSN),
        ],
        totals: [
            ...total('totalValue', t('totalValue'), sum(items, e => txt(e, 'taxableAmount')), items.length),
            ...total('totInvValue', t('totInvValue'),
                ['totalValue', 'cgstValue', 'sgstValue', 'igstValue', 'cessValue', 'cessNonAdvolValue', 'otherValue'].reduce((n, k) => n + num(t(k)), 0), 1),
        ],
        info: [
            [L.docNo, t('docNo')], [L.date, t('docDate')], [L.type, t('docType')],
            [L.despatchParty, t('fromTrdName')], [L.deliveryParty, t('toTrdName')],
            [L.lines, String(items.length)], [L.shipment, t('ewayBillNo')], [L.payable, t('totInvValue')],
        ],
    };
}

function cnInvoice(root: Element): Rules {
    const data = at(root, 'EInvoiceData');
    const b = at(data, 'BasicInformation');
    const items = kids(data, 'IssuItemInformation');
    const grand = txt(b, 'TotalTax-includedAmount');
    const words = txt(b, 'TotalTax-includedAmountInChinese');
    const L = labels();
    return {
        required: [
            ['Header/EIid', txt(root, 'Header/EIid')],
            ['InherentLabel/EInvoiceType', txt(root, 'Header/InherentLabel/EInvoiceType/LabelCode')],
            ['SellerInformation/SellerIdNum', txt(data, 'SellerInformation/SellerIdNum')],
            ['SellerInformation/SellerName', txt(data, 'SellerInformation/SellerName')],
            ['BuyerInformation/BuyerName', txt(data, 'BuyerInformation/BuyerName')],
            ['BasicInformation/TotalAmWithoutTax', txt(b, 'TotalAmWithoutTax')],
            ['BasicInformation/TotalTaxAm', txt(b, 'TotalTaxAm')],
            ['BasicInformation/TotalTax-includedAmount', grand],
            ['BasicInformation/TotalTax-includedAmountInChinese', words],
            ['IssuItemInformation', items.length ? '1' : ''],
        ],
        formats: [
            ['Header/EIid', txt(root, 'Header/EIid'), /^\d{20}$/],
            ['SellerIdNum', txt(data, 'SellerInformation/SellerIdNum'), /^[0-9A-Z]{15,20}$/],
            ['BuyerIdNum', txt(data, 'BuyerInformation/BuyerIdNum'), /^[0-9A-Z]{15,20}$/],
            ...each(items, 'IssuItemInformation/TaxRate', e => txt(e, 'TaxRate'), /^(0|0\.01|0\.015|0\.03|0\.05|0\.06|0\.09|0\.1|0\.11|0\.13|0\.16|0\.17|免税|不征税)$/),
        ],
        totals: [
            ...total('TotalAmWithoutTax', txt(b, 'TotalAmWithoutTax'), sum(items, e => txt(e, 'Amount')), items.length),
            ...total('TotalTaxAm', txt(b, 'TotalTaxAm'), sum(items, e => txt(e, 'ComTaxAm')), items.length),
            ...total('TotalTax-includedAmount', grand, num(txt(b, 'TotalAmWithoutTax')) + num(txt(b, 'TotalTaxAm')), 1),
            ...(grand && words && words !== chineseAmount(num(grand)) ? [['TotalTax-includedAmountInChinese', words, chineseAmount(num(grand))] as [string, string, string]] : []),
        ],
        info: [
            [L.docNo, txt(root, 'Header/EIid')],
            [L.date, (txt(root, 'TaxSupervisionInfo/IssueTime') || txt(b, 'RequestTime')).slice(0, 10)],
            [L.type, txt(root, 'Header/InherentLabel/GeneralOrSpecialVAT/LabelName')], [L.currency, 'CNY'],
            [L.seller, txt(data, 'SellerInformation/SellerName')], [L.buyer, txt(data, 'BuyerInformation/BuyerName')],
            [L.lines, String(items.length)], [L.payable, grand],
        ],
    };
}

const RULES: Record<string, (root: Element) => Rules> = {
    Файл: ruUpd,
    GSTInvoice: inEinvoice,
    EWayBill: inEwayBill,
    EInvoice: cnInvoice,
};

/** Ulusal biçim kontrolleri; bilinmeyen kökte yalnız yapı onayı kalır. */
export function nationalXmlChecks(root: Element, profileName: string, checks: Check[], info: Row[]): void {
    const rules = RULES[root.localName]?.(root);
    if (!rules) return;
    info.push(...rules.info.filter(([, v]) => v));
    const issues = [
        ...rules.required.filter(([, v]) => !v).map(([field]) => i18n.t('validate.nationalRequired', { field })),
        ...rules.formats.filter(([, v, re]) => v && !re.test(v)).map(([field, value]) => i18n.t('validate.nationalFormat', { field, value })),
        ...rules.totals.map(([field, actual, expected]) => i18n.t('validate.nationalTotal', { field, actual, expected })),
    ];
    checks.push(...(issues.length
        ? issues.map(text => ({ level: 'warn' as const, text }))
        : [{ level: 'ok' as const, text: i18n.t('validate.nationalRulesPassed', { profile: profileName }) }]));
}
