/**
 * UBL dışı ulusal belgelerin örnek XML'leri:
 *  - RU: ФНС УПД / счёт-фактура 5.03 (Приказ ЕД-7-26/970@), КНД 1115131. Tarihler ДД.ММ.ГГГГ.
 *  - IN: GST e-Invoice INV-01 (IRP JSON şema 1.1) ve e-Way Bill (EWB-01); JSON alan adları XML eleman adı olarak
 *        korunur, diziler aynı adlı tekrar eden elemanlardır (ItemList, itemList).
 *  - CN: 数电发票 XML (GB/T 42965), vergi idaresi imzası örnekte yer tutucudur.
 * Tutarlar satırlardan hesaplanır; belge numaraları ve kimlikler kurgusaldır.
 */
import type { CountryCode } from '../registry/countryProfiles';
import type { DocLanguage } from '../registry/docLanguages';
import { docTextPack, type IntlDocKind, type SampleTexts } from '../docText';
import { COUNTRY_SAMPLES, type CountrySample } from './countrySamples';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const money = (n: number) => round2(n).toFixed(2);
const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
const pad = (n: number) => String(n).padStart(2, '0');
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const attrs = (a: Record<string, string | number | undefined>) =>
    Object.entries(a).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => ` ${k}="${esc(String(v))}"`).join('');
const el = (tag: string, value: string | number) => `<${tag}>${esc(String(value))}</${tag}>`;

const localPrice = (eur: number, scale: number) => {
    const v = eur * scale;
    const step = v >= 1000 ? 10 : v >= 100 ? 1 : 0.5;
    return round2(Math.round(v / step) * step);
};

interface Item { name: string; desc?: string; qty: number; price: number; code: string; service: boolean }

const items = (t: SampleTexts, s: CountrySample): Item[] => [
    { name: t.product, desc: t.productDesc, qty: 4, price: localPrice(289, s.scale), code: 'ERG-CH-120', service: false },
    { name: t.service, qty: 6, price: localPrice(65, s.scale), code: 'SRV-INST', service: true },
    { name: t.accessory, qty: 2, price: localPrice(24.5, s.scale), code: 'MAT-150', service: false },
];

// ---------------------------------------------------------------- Rusya

const ruDate = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

const RU_REGION: Record<string, [code: string, name: string]> = { '125009': ['77', 'г. Москва'], '191025': ['78', 'г. Санкт-Петербург'] };

function ruParty(tag: string, p: CountrySample['seller'], bank?: CountrySample) {
    const [code, region] = RU_REGION[p.postal] ?? ['77', 'г. Москва'];
    const [street, house] = p.street.split(/,\s*д\.\s*/);
    return [
        `<${tag}>`,
        `<ИдСв><СвЮЛУч${attrs({ НаимОрг: p.legal, ИННЮЛ: p.vat, КПП: p.reg?.[1] })}/></ИдСв>`,
        `<Адрес><АдрРФ${attrs({ Индекс: p.postal, КодРегион: code, НаимРегион: region, Город: p.city, Улица: street.replace(/^ул\.\s*/, ''), Дом: house })}/></Адрес>`,
        bank ? `<БанкРекв${attrs({ НомерСчета: bank.iban })}><СвБанк${attrs({ НаимБанк: 'ПАО Сбербанк', БИК: bank.bic, КорСчет: '30101810400000000225' })}/></БанкРекв>` : '',
        p.contact ? `<Контакт>${el('Тлф', p.contact[1])}${el('ЭлПочта', p.contact[2])}</Контакт>` : '',
        `</${tag}>`,
    ].join('');
}

const RU_FUNCTION: Partial<Record<IntlDocKind, 'СЧФДОП' | 'СЧФ' | 'ДОП'>> = { invoice: 'СЧФДОП', prepayment: 'СЧФ', despatch: 'ДОП' };
const RU_SHIPMENT_DOC = 'Документ об отгрузке товаров (выполнении работ), передаче имущественных прав (документ об оказании услуг)';

function ruUpd(kind: IntlDocKind, lang: DocLanguage): string {
    const s = COUNTRY_SAMPLES.RU;
    const t = docTextPack(lang).sample;
    const fn = RU_FUNCTION[kind] ?? 'СЧФДОП';
    const advance = fn === 'СЧФ';
    const today = new Date();
    const year = today.getFullYear();
    const no = advance ? `${s.prefix}-${year}-0402` : `${s.prefix}-${year}-0418`;
    const rate = s.rate;
    const stamp = `${year}${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
    const fileId = `ON_NSCHFDOPPR_2BM-${s.buyer.vat}-${s.buyer.reg?.[1]}_2BM-${s.seller.vat}-${s.seller.reg?.[1]}_${stamp}_6f1c2a7e-3b84-4d1a-9c55-0e2f8a41b7d3`;

    const lines = advance
        ? [(() => {
            const gross = round2(items(t, s).reduce((n, l) => n + l.qty * l.price, 0) * (1 + rate / 100) * 0.3);
            const tax = round2(gross * rate / (100 + rate));
            return `<СведТов${attrs({ НомСтр: 1, НаимТов: fill(t.prepaymentItem, { pct: 30 }), НалСт: `${rate}/${100 + rate}`, СтТовУчНал: money(gross) })}><Акциз><БезАкциз>без акциза</БезАкциз></Акциз><СумНал><СумНал>${money(tax)}</СумНал></СумНал></СведТов>`;
        })()]
        : items(t, s).map((l, i) => {
            const net = round2(l.qty * l.price);
            const tax = round2(net * rate / 100);
            return [
                `<СведТов${attrs({ НомСтр: i + 1, НаимТов: l.desc ? `${l.name}, ${l.desc}` : l.name, ОКЕИ_Тов: l.service ? '356' : '796', НаимЕдИзм: l.service ? 'ч' : 'шт', КолТов: l.qty, ЦенаТов: money(l.price), СтТовБезНДС: money(net), НалСт: `${rate}%`, СтТовУчНал: money(net + tax) })}>`,
                `<ДопСведТов${attrs({ ПрТовРаб: l.service ? '3' : '1', КодТов: l.code })}/>`,
                '<Акциз><БезАкциз>без акциза</БезАкциз></Акциз>',
                `<СумНал><СумНал>${money(tax)}</СумНал></СумНал>`,
                '</СведТов>',
            ].join('');
        });
    const sum = (re: RegExp) => round2([...lines.join('').matchAll(re)].reduce((n, m) => n + Number(m[1]), 0));
    const net = sum(/СтТовБезНДС="([\d.]+)"/g);
    const gross = sum(/СтТовУчНал="([\d.]+)"/g);
    const tax = sum(/<СумНал>([\d.]+)<\/СумНал>/g);

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<Файл${attrs({ ИдФайл: fileId, ВерсФорм: '5.03', ВерсПрог: 'eDesign 1.0' })}>`,
        `<Документ${attrs({
            КНД: '1115131', Функция: fn,
            ПоФактХЖ: advance ? undefined : RU_SHIPMENT_DOC,
            НаимДокОпр: advance ? undefined : fn === 'ДОП' ? RU_SHIPMENT_DOC : `Счет-фактура и ${RU_SHIPMENT_DOC.charAt(0).toLowerCase()}${RU_SHIPMENT_DOC.slice(1)}`,
            ДатаИнфПр: ruDate(today), ВремИнфПр: '15.30.00', НаимЭконСубСост: `${s.seller.legal}, ИНН/КПП ${s.seller.vat}/${s.seller.reg?.[1]}`,
        })}>`,
        `<СвСчФакт${attrs({ НомерДок: no, ДатаДок: ruDate(today) })}>`,
        ruParty('СвПрод', s.seller, s),
        advance ? '' : '<ГрузОт><ОнЖе>он же</ОнЖе></ГрузОт>',
        advance ? '' : ruParty('ГрузПолуч', s.buyer),
        advance ? `<СвПРД${attrs({ НомерПРД: '512', ДатаПРД: ruDate(addDays(today, -3)), СуммаПРД: money(gross) })}/>` : '',
        advance ? '' : `<ДокПодтвОтгрНом${attrs({ РеквНаимДок: 'Универсальный передаточный документ', РеквНомерДок: no, РеквДатаДок: ruDate(today) })}/>`,
        ruParty('СвПокуп', s.buyer),
        '<ДенИзм КодОКВ="643" НаимОКВ="Российский рубль"/>',
        `<ИнфПолФХЖ1><ТекстИнф${attrs({ Идентиф: 'Примечание', Значен: advance ? fill(t.prepaymentNote, { order: `PO-${year}-3310` }) : t.note })}/></ИнфПолФХЖ1>`,
        '</СвСчФакт>',
        '<ТаблСчФакт>',
        ...lines,
        `<ВсегоОпл${attrs({ СтТовБезНДСВсего: advance ? undefined : money(net), СтТовУчНалВсего: money(gross) })}><СумНалВсего><СумНал>${money(tax)}</СумНал></СумНалВсего></ВсегоОпл>`,
        '</ТаблСчФакт>',
        advance ? '' : [
            '<СвПродПер>',
            `<СвПер${attrs({ СодОпер: 'Товары переданы, работы выполнены', ДатаПер: ruDate(today) })}>`,
            `<ОснПер${attrs({ РеквНаимДок: 'Договор поставки', РеквНомерДок: `ДП-${year}/15`, РеквДатаДок: `15.01.${year}` })}/>`,
            `<Тран${attrs({ СвТран: s.carrier })}/>`,
            '</СвПер>',
            '</СвПродПер>',
        ].join(''),
        `<Подписант${attrs({ Должн: 'Генеральный директор', ТипПодпис: '1', СпосПодтПолном: '1' })}><ФИО Фамилия="Иванов" Имя="Сергей" Отчество="Петрович"/></Подписант>`,
        '</Документ>',
        '</Файл>',
    ].filter(Boolean).join('\n');
}

// ---------------------------------------------------------------- Hindistan

const inDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const IN_STATE: Record<string, string> = { Bengaluru: '29', Mumbai: '27' };
const HSN: Record<string, string> = { 'ERG-CH-120': '94013000', 'SRV-INST': '998739', 'MAT-150': '39181090' };

function inParty(tag: string, p: CountrySample['seller'], buyer: boolean) {
    const state = IN_STATE[p.city] ?? '29';
    return [
        `<${tag}>`,
        el('Gstin', p.vat),
        el('LglNm', p.legal),
        el('TrdNm', p.name),
        buyer ? el('Pos', state) : '',
        el('Addr1', p.street),
        el('Loc', p.city),
        el('Pin', p.postal),
        el('Stcd', state),
        p.contact ? el('Ph', p.contact[1].replace(/\D/g, '').slice(-10)) : '',
        p.contact ? el('Em', p.contact[2]) : '',
        `</${tag}>`,
    ].join('');
}

function inEinvoice(kind: IntlDocKind, lang: DocLanguage): string {
    const s = COUNTRY_SAMPLES.IN;
    const t = docTextPack(lang).sample;
    const credit = kind === 'credit';
    const today = new Date();
    const year = today.getFullYear();
    const no = credit ? `CN/${year}/0419` : `INV/${year}/0418`;
    const intra = IN_STATE[s.seller.city] === IN_STATE[s.buyer.city];
    const list = credit ? [{ ...items(t, s)[0], qty: 1 }] : items(t, s);
    const rows = list.map((l, i) => {
        const total = round2(l.qty * l.price);
        const tax = round2(total * s.rate / 100);
        return { l, i, total, tax };
    });
    const ass = round2(rows.reduce((n, r) => n + r.total, 0));
    const tax = round2(rows.reduce((n, r) => n + r.tax, 0));
    const half = round2(tax / 2);
    const exact = ass + tax;
    const roundOff = round2(Math.round(exact) - exact);
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<GSTInvoice Version="1.1">',
        `<TranDtls>${el('TaxSch', 'GST')}${el('SupTyp', 'B2B')}${el('RegRev', 'N')}${el('IgstOnIntra', 'N')}</TranDtls>`,
        `<DocDtls>${el('Typ', credit ? 'CRN' : 'INV')}${el('No', no)}${el('Dt', inDate(today))}</DocDtls>`,
        inParty('SellerDtls', s.seller, false),
        inParty('BuyerDtls', s.buyer, true),
        ...rows.map(({ l, i, total, tax: lineTax }) => [
            '<ItemList>',
            el('SlNo', i + 1),
            el('PrdDesc', l.desc ? `${l.name} - ${l.desc}` : l.name),
            el('IsServc', l.service ? 'Y' : 'N'),
            el('HsnCd', HSN[l.code]),
            el('Qty', l.qty),
            el('Unit', l.service ? 'OTH' : 'NOS'),
            el('UnitPrice', money(l.price)),
            el('TotAmt', money(total)),
            el('Discount', '0.00'),
            el('AssAmt', money(total)),
            el('GstRt', s.rate),
            el('IgstAmt', money(intra ? 0 : lineTax)),
            el('CgstAmt', money(intra ? lineTax / 2 : 0)),
            el('SgstAmt', money(intra ? lineTax / 2 : 0)),
            el('TotItemVal', money(total + lineTax)),
            '</ItemList>',
        ].join('')),
        '<ValDtls>',
        el('AssVal', money(ass)),
        el('CgstVal', money(intra ? half : 0)),
        el('SgstVal', money(intra ? tax - half : 0)),
        el('IgstVal', money(intra ? 0 : tax)),
        el('RndOffAmt', money(roundOff)),
        el('TotInvVal', money(exact + roundOff)),
        '</ValDtls>',
        credit ? '' : `<PayDtls>${el('Nm', s.seller.legal)}${el('AccDet', s.iban)}${el('Mode', 'Direct Transfer')}${el('FinInsBr', s.bic)}${el('PayTerm', t.paymentTerms)}${el('CrDay', 30)}</PayDtls>`,
        `<RefDtls>${el('InvRm', credit ? t.creditNote : t.note)}${credit ? `<PrecDocDtls>${el('InvNo', `INV/${year}/0418`)}${el('InvDt', inDate(addDays(today, -14)))}</PrecDocDtls>` : ''}</RefDtls>`,
        el('AckNo', `1126${year % 100}${credit ? '10293847' : '10293846'}`),
        el('AckDt', `${year}-${pad(today.getMonth() + 1)}-${pad(today.getDate())} 15:30:00`),
        el('Irn', credit ? '7d1f3b9a0c2e4f6a8b1c3d5e7f9a0b2c4d6e8f0a1b3c5d7e9f1a2b4c6d8e0f2a' : 'a5c12dca80e743321740b001fd70953e8738d109865d28ba4013750f2046f229'),
        '</GSTInvoice>',
    ].filter(Boolean).join('\n');
}

function inEwayBill(lang: DocLanguage): string {
    const s = COUNTRY_SAMPLES.IN;
    const t = docTextPack(lang).sample;
    const today = new Date();
    const year = today.getFullYear();
    const goods = items(t, s).filter(l => !l.service);
    const rows = goods.map(l => ({ l, value: round2(l.qty * l.price) }));
    const total = round2(rows.reduce((n, r) => n + r.value, 0));
    const igst = round2(total * s.rate / 100);
    const from = s.seller;
    const to = s.buyer;
    const [fromAddr1, ...fromRest] = from.street.split(', ');
    const [toAddr1, ...toRest] = to.street.split(', ');
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<EWayBill>',
        el('supplyType', 'O'), el('subSupplyType', '1'), el('docType', 'INV'), el('docNo', `INV/${year}/0418`), el('docDate', inDate(today)),
        el('fromGstin', from.vat), el('fromTrdName', from.legal), el('fromAddr1', fromAddr1), el('fromAddr2', fromRest.join(', ')), el('fromPlace', from.city),
        el('fromPincode', from.postal), el('fromStateCode', IN_STATE[from.city]), el('actFromStateCode', IN_STATE[from.city]),
        el('toGstin', to.vat), el('toTrdName', to.legal), el('toAddr1', toAddr1), el('toAddr2', toRest.join(', ')), el('toPlace', to.city),
        el('toPincode', to.postal), el('toStateCode', IN_STATE[to.city]), el('actToStateCode', IN_STATE[to.city]),
        el('transactionType', '1'),
        el('totalValue', money(total)), el('cgstValue', '0.00'), el('sgstValue', '0.00'), el('igstValue', money(igst)), el('cessValue', '0.00'),
        el('totInvValue', money(total + igst)),
        el('transporterId', '29AAACV1234L1ZK'), el('transporterName', s.carrier), el('transMode', '1'), el('transDistance', '985'),
        el('transDocNo', `LR-${year}-55120`), el('transDocDate', inDate(today)), el('vehicleNo', 'KA01AB1234'), el('vehicleType', 'R'),
        ...rows.map(({ l, value }) => [
            '<itemList>',
            el('productName', l.name), el('productDesc', l.desc ?? l.name), el('hsnCode', HSN[l.code]), el('quantity', l.qty), el('qtyUnit', 'NOS'),
            el('cgstRate', 0), el('sgstRate', 0), el('igstRate', s.rate), el('cessRate', 0), el('taxableAmount', money(value)),
            '</itemList>',
        ].join('')),
        el('ewayBillNo', '181012345678'),
        el('ewayBillDate', `${inDate(today)} 03:30:00 PM`),
        el('validUpto', `${inDate(addDays(today, 5))} 11:59:00 PM`),
        '</EWayBill>',
    ].join('\n');
}

// ---------------------------------------------------------------- Çin

const DIGITS = '零壹贰叁肆伍陆柒捌玖';
const UNITS = ['', '拾', '佰', '仟'];
const SECTIONS = ['', '万', '亿'];

/** 金额大写 (ör. 12345.67 → 壹万贰仟叁佰肆拾伍圆陆角柒分); negatifte 负 öneki. */
export function chineseAmount(value: number): string {
    const neg = value < 0;
    const cents = Math.round(Math.abs(value) * 100);
    const yuan = Math.floor(cents / 100);
    const jiao = Math.floor(cents / 10) % 10;
    const fen = cents % 10;
    const section = (n: number) => {
        let out = '';
        let zero = false;
        for (let i = 3; i >= 0; i--) {
            const d = Math.floor(n / 10 ** i) % 10;
            if (d === 0) { zero = out !== ''; continue; }
            if (zero) { out += '零'; zero = false; }
            out += DIGITS[d] + UNITS[i];
        }
        return out;
    };
    let int = '';
    let n = yuan;
    let needZero = false;
    for (let i = 0; n > 0; i++, n = Math.floor(n / 10000)) {
        const part = n % 10000;
        if (part) {
            int = section(part) + SECTIONS[i] + (needZero ? '零' : '') + int;
            needZero = part < 1000;
        } else if (int) {
            needZero = true;
        }
    }
    const head = `${neg ? '负' : ''}${int || '零'}圆`;
    if (!jiao && !fen) return `${head}整`;
    return `${head}${jiao ? DIGITS[jiao] + '角' : '零'}${fen ? DIGITS[fen] + '分' : ''}`;
}

function cnInvoice(kind: IntlDocKind, lang: DocLanguage): string {
    const s = COUNTRY_SAMPLES.CN;
    const t = docTextPack(lang).sample;
    const zh = lang === 'zh';
    const red = kind === 'credit';
    const sign = red ? -1 : 1;
    const today = new Date();
    const year = today.getFullYear();
    const blueNo = `${year % 100}312000000012345678`;
    const no = red ? `${year % 100}312000000012345702` : blueNo;
    const list = red ? [{ ...items(t, s)[0], qty: 1 }] : items(t, s);
    const rows = list.map((l, i) => {
        const rate = l.service ? 0.09 : 0.13;
        const amount = round2(sign * l.qty * l.price);
        const tax = round2(amount * rate);
        const prefix = zh ? (l.service ? '*建筑服务*' : l.code === 'MAT-150' ? '*塑料制品*' : '*家具*') : '';
        return { l, i, rate, amount, tax, name: `${prefix}${l.name}` };
    });
    const net = round2(rows.reduce((n, r) => n + r.amount, 0));
    const tax = round2(rows.reduce((n, r) => n + r.tax, 0));
    const total = round2(net + tax);
    const label = (type: string, code: string, name: string) => `<${type}><LabelCode>${code}</LabelCode><LabelName>${name}</LabelName></${type}>`;
    const remark = red
        ? `被红冲蓝字数电发票号码：${blueNo} 红字发票信息确认单编号：3101${year}1013000123`
        : t.note;
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<EInvoice>',
        '<Header>',
        el('EIid', no),
        el('EInvoiceTag', 'SWEI3100'),
        el('Version', '0.33'),
        '<InherentLabel>',
        label('InIssuType', red ? 'N' : 'Y', '是否蓝字发票标志'),
        label('EInvoiceType', '01', '电子发票'),
        label('GeneralOrSpecialVAT', '01', '增值税专用发票'),
        label('TaxpayerType', '1', '一般纳税人'),
        '</InherentLabel>',
        '</Header>',
        '<EInvoiceData>',
        `<SellerInformation>${el('SellerIdNum', s.seller.vat)}${el('SellerName', s.seller.legal)}${el('SellerAddr', s.seller.street)}${el('SellerTelNum', s.seller.contact?.[1] ?? '')}${el('SellerBankName', s.bic)}${el('SellerBankAccNum', s.iban)}</SellerInformation>`,
        `<BuyerInformation>${el('BuyerIdNum', s.buyer.vat)}${el('BuyerName', s.buyer.legal)}${el('BuyerAddr', s.buyer.street)}${el('BuyerTelNum', '010-65051234')}${el('BuyerBankName', '中国工商银行北京建国门支行')}${el('BuyerBankAccNum', '0200001234567890123')}</BuyerInformation>`,
        '<BasicInformation>',
        el('TotalAmWithoutTax', money(net)),
        el('TotalTaxAm', money(tax)),
        el('TotalTax-includedAmount', money(total)),
        el('TotalTax-includedAmountInChinese', chineseAmount(total)),
        el('Drawer', s.seller.contact?.[0] ?? ''),
        el('RequestTime', `${year}-${pad(today.getMonth() + 1)}-${pad(today.getDate())} 15:30:00`),
        '</BasicInformation>',
        ...rows.map(({ l, rate, amount, tax: lineTax, name }) => [
            '<IssuItemInformation>',
            el('ItemName', name),
            el('SpecMod', l.desc ?? ''),
            el('MeaUnits', l.service ? (zh ? '小时' : 'h') : (zh ? '件' : 'pcs')),
            el('Quantity', sign * l.qty),
            el('UnPrice', money(l.price)),
            el('Amount', money(amount)),
            el('TaxRate', rate),
            el('ComTaxAm', money(lineTax)),
            el('TotaltaxIncludedAmount', money(amount + lineTax)),
            el('TaxClassificationCode', l.service ? '3050200000000000000' : l.code === 'MAT-150' ? '1070223990000000000' : '1060510010000000000'),
            '</IssuItemInformation>',
        ].join('')),
        `<AdditionalInformation>${el('Remark', remark)}</AdditionalInformation>`,
        '</EInvoiceData>',
        '<SellerAuthentication><AuthenticationMethods>01</AuthenticationMethods></SellerAuthentication>',
        `<TaxSupervisionInfo>${el('InvoiceNumber', no)}${el('IssueTime', `${year}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)}${el('TaxBureauCode', '13100000000')}${el('TaxBureauName', '国家税务总局上海市税务局')}</TaxSupervisionInfo>`,
        el('TaxBureauSignature', 'MEUCIQ…(SM2)'),
        '</EInvoice>',
    ].join('\n');
}

const GENERATORS: Record<string, (kind: IntlDocKind, lang: DocLanguage) => string> = {
    'ru-upd-503': ruUpd,
    'in-gst-einvoice': inEinvoice,
    'in-eway-bill': (_kind, lang) => inEwayBill(lang),
    'cn-fully-digital': cnInvoice,
};

export const isNationalProfile = (profileId: string) => profileId in GENERATORS;

/** Ulusal profilin örnek XML'i; ülke parametresi profil ülkesiyle aynıdır. */
export function generateNationalXml(_country: CountryCode, kind: IntlDocKind, lang: DocLanguage, profileId: string): string {
    return GENERATORS[profileId](kind, lang);
}
