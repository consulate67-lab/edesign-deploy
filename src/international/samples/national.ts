/**
 * UBL dışı ulusal belgelerin örnek XML'leri:
 *  - RU: ФНС УПД / счёт-фактура 5.03 (Приказ ЕД-7-26/970@), КНД 1115131. Tarihler ДД.ММ.ГГГГ.
 *  - IN: GST e-Invoice INV-01 (IRP JSON şema 1.1) ve e-Way Bill (EWB-01); JSON alan adları XML eleman adı olarak
 *        korunur, diziler aynı adlı tekrar eden elemanlardır (ItemList, itemList).
 *  - CN: 数电发票 XML (GB/T 42965), vergi idaresi imzası örnekte yer tutucudur.
 *  - BR: NF-e / NFC-e 4.00 (NT 2025.002-RTC IBS/CBS grupları), NFS-e padrão nacional (DPS + NFS-e),
 *        CT-e 4.00. Erişim anahtarları ve CNPJ/CPF kontrol haneleri gerçek algoritmayla üretilir;
 *        dijital imza (Signature) örnekte yoktur.
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

// ---------------------------------------------------------------- Brezilya

const BR_NFE_NS = 'http://www.portalfiscal.inf.br/nfe';
const BR_CTE_NS = 'http://www.portalfiscal.inf.br/cte';
const BR_NFSE_NS = 'http://www.sped.fazenda.gov.br/nfse';

/** IBGE município kodu ve UF. */
const BR_MUN: Record<string, [cMun: string, uf: string]> = {
    'São Paulo': ['3550308', 'SP'], Campinas: ['3509502', 'SP'], Guarulhos: ['3518800', 'SP'],
};
const BR_UF_CODE: Record<string, string> = { SP: '35' };

/** Módulo 11 (pesos 2–9, da direita): DV da chave de acesso NF-e / NFC-e / CT-e / NFS-e. */
export function brMod11(digits: string): number {
    let weight = 2;
    let sum = 0;
    for (let i = digits.length - 1; i >= 0; i--) {
        sum += Number(digits[i]) * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
}

const brOffset = (d: Date, time: string) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${time}-03:00`;
const brIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const brYyMm = (d: Date) => `${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}`;

/** Chave de acesso de 44 dígitos: cUF AAMM CNPJ mod série nNF tpEmis cNF DV. */
function brChave(uf: string, d: Date, cnpj: string, mod: string, serie: string, n: string, code: string): string {
    const base = `${BR_UF_CODE[uf]}${brYyMm(d)}${cnpj}${mod}${serie.padStart(3, '0')}${n.padStart(9, '0')}1${code}`;
    return base + brMod11(base);
}

interface BrParty { cnpj?: string; cpf?: string; name: string; fant?: string; street: string; nro: string; bairro: string; city: string; cep: string; ie?: string; im?: string; fone?: string; email?: string }

const brParty = (p: CountrySample['seller']): BrParty => {
    const [street, nro, bairro] = p.street.split(', ');
    return {
        cnpj: p.vat, name: p.legal, fant: p.name, street, nro, bairro, city: p.city, cep: p.postal,
        ie: p.reg?.[0] === 'IE' ? p.reg[1] : undefined, im: p.reg?.[0] === 'IM' ? p.reg[1] : undefined,
        fone: p.contact?.[1], email: p.contact?.[2],
    };
};

const BR_RETAIL: BrParty = {
    cnpj: '23456789000195', name: 'Casa & Conforto Móveis Ltda', fant: 'Casa & Conforto', street: 'Rua Augusta', nro: '1200', bairro: 'Consolação',
    city: 'São Paulo', cep: '01304001', ie: '148273650110', fone: '1131427788', email: 'loja@casaeconforto.com.br',
};
const BR_CARRIER: BrParty = {
    cnpj: '45678901000175', name: 'Rodo Expresso Paulista Ltda', fant: 'Rodo Expresso', street: 'Rod. Presidente Dutra', nro: 'km 225', bairro: 'Jardim Presidente Dutra',
    city: 'Guarulhos', cep: '07034000', ie: '336145870115', fone: '1124631900', email: 'cte@rodoexpresso.com.br',
};

/** enderEmit / enderDest / enderReme … (NF-e e CT-e). */
function brAddress(tag: string, p: BrParty, withCountry = true) {
    const [cMun, uf] = BR_MUN[p.city] ?? BR_MUN['São Paulo'];
    return [
        `<${tag}>`, el('xLgr', p.street), el('nro', p.nro), el('xBairro', p.bairro), el('cMun', cMun), el('xMun', p.city), el('UF', uf), el('CEP', p.cep),
        withCountry ? `${el('cPais', '1058')}${el('xPais', 'Brasil')}` : '', p.fone ? el('fone', p.fone) : '', `</${tag}>`,
    ].join('');
}

interface BrItem { code: string; name: string; ncm: string; unit: string; qty: number; price: number }

function brItems(s: CountrySample, en: boolean): BrItem[] {
    return [
        { code: 'ERG-CH-120', name: en ? 'Ergonomic office chair, black mesh back' : 'Cadeira de escritório ergonômica, encosto em tela preta', ncm: '94013900', unit: 'UN', qty: 4, price: localPrice(289, s.scale) },
        { code: 'MES-160', name: en ? 'Office desk 160 x 80 cm' : 'Mesa de escritório 160 x 80 cm', ncm: '94033000', unit: 'UN', qty: 2, price: localPrice(420, s.scale) },
        { code: 'MAT-150', name: en ? 'Floor protection mat' : 'Protetor de piso para cadeira', ncm: '39181000', unit: 'UN', qty: 2, price: localPrice(24.5, s.scale) },
    ];
}

/** Tributos do item de uma empresa do regime normal: ICMS, PIS/COFINS não cumulativos e IBS/CBS (fase de teste 2026). */
function brTaxes(vProd: number, icmsRate: number) {
    const vICMS = round2(vProd * icmsRate / 100);
    const vBCPis = round2(vProd - vICMS);
    const vPIS = round2(vBCPis * 0.0165);
    const vCOFINS = round2(vBCPis * 0.076);
    const vBC = round2(vProd - vICMS - vPIS - vCOFINS);
    const vIBSUF = round2(vBC * 0.001);
    const vCBS = round2(vBC * 0.009);
    return { vICMS, vBCPis, vPIS, vCOFINS, vBC, vIBSUF, vIBSMun: 0, vCBS };
}

const brIbsCbs = (t: ReturnType<typeof brTaxes>) => [
    '<IBSCBS>', el('CST', '000'), el('cClassTrib', '000001'),
    '<gIBSCBS>', el('vBC', money(t.vBC)),
    `<gIBSUF>${el('pIBSUF', '0.1000')}${el('vIBSUF', money(t.vIBSUF))}</gIBSUF>`,
    `<gIBSMun>${el('pIBSMun', '0.0000')}${el('vIBSMun', money(t.vIBSMun))}</gIBSMun>`,
    el('vIBS', money(t.vIBSUF + t.vIBSMun)),
    `<gCBS>${el('pCBS', '0.9000')}${el('vCBS', money(t.vCBS))}</gCBS>`,
    '</gIBSCBS>', '</IBSCBS>',
].join('');

const brIbsCbsTot = (vBC: number, vIBSUF: number, vIBSMun: number, vCBS: number) => [
    '<IBSCBSTot>', el('vBCIBSCBS', money(vBC)),
    '<gIBS>',
    `<gIBSUF>${el('vDif', '0.00')}${el('vDevTrib', '0.00')}${el('vIBSUF', money(vIBSUF))}</gIBSUF>`,
    `<gIBSMun>${el('vDif', '0.00')}${el('vDevTrib', '0.00')}${el('vIBSMun', money(vIBSMun))}</gIBSMun>`,
    el('vIBS', money(vIBSUF + vIBSMun)), el('vCredPres', '0.00'), el('vCredPresCondSus', '0.00'),
    '</gIBS>',
    `<gCBS>${el('vDif', '0.00')}${el('vDevTrib', '0.00')}${el('vCBS', money(vCBS))}${el('vCredPres', '0.00')}${el('vCredPresCondSus', '0.00')}</gCBS>`,
    '</IBSCBSTot>',
].join('');

const brProt = (tag: 'protNFe' | 'protCTe', key: 'chNFe' | 'chCTe', chave: string, d: Date, nProt: string, motivo: string) =>
    `<${tag} versao="4.00"><infProt>${el('tpAmb', 1)}${el('verAplic', 'SP-PL_010')}${el(key, chave)}${el('dhRecbto', brOffset(d, '15:30:42'))}${el('nProt', nProt)}${el('digVal', 'k4Vq3b2Yc8Rz1mWpN0aTfE7uHsJ=')}${el('cStat', 100)}${el('xMotivo', motivo)}</infProt></${tag}>`;

/** Notas da venda modelo usadas no NF-e e referenciadas no CT-e. */
function brSale(s: CountrySample, en: boolean) {
    const lines = brItems(s, en).map(l => {
        const vProd = round2(l.qty * l.price);
        return { l, vProd, t: brTaxes(vProd, s.rate) };
    });
    const vProd = round2(lines.reduce((n, r) => n + r.vProd, 0));
    return { lines, vProd };
}

const brNfeKey = (d: Date, n: string, code: string, cnpj = '12345678000195') => brChave('SP', d, cnpj, '55', '1', n, code);

/** NF-e modelo 55: invoice = venda (finNFe 1), credit = devolução (4), corrected = complementar (2). */
function brNfe(kind: IntlDocKind, lang: DocLanguage): string {
    const s = COUNTRY_SAMPLES.BR;
    const en = lang !== 'pt';
    const today = new Date();
    const credit = kind === 'credit';
    const complement = kind === 'corrected';
    const emit = brParty(s.seller);
    const dest = brParty(s.buyer);
    const sale = brSale(s, en);
    const originalKey = brNfeKey(addDays(today, -12), '4180', '30418027');
    const n = credit ? '4231' : complement ? '4232' : '4180';
    const issued = credit || complement ? today : addDays(today, -12);
    const chave = credit || complement ? brNfeKey(today, n, credit ? '30423112' : '30423213') : originalKey;

    const rows = credit
        ? [{ ...sale.lines[0], l: { ...sale.lines[0].l, qty: 1 }, vProd: sale.lines[0].l.price, t: brTaxes(sale.lines[0].l.price, s.rate) }]
        : complement
            ? [{ l: { ...sale.lines[0].l, name: en ? `Price supplement – ${sale.lines[0].l.name}` : `Complemento de preço – ${sale.lines[0].l.name}`, qty: 0, price: 0 }, vProd: 400, t: brTaxes(400, s.rate) }]
            : sale.lines;
    const cfop = credit ? '1202' : '5102';
    const vProd = round2(rows.reduce((n2, r) => n2 + r.vProd, 0));
    const tot = (k: keyof ReturnType<typeof brTaxes>) => round2(rows.reduce((n2, r) => n2 + r.t[k], 0));
    const vNF = vProd;
    const vTotTrib = round2(tot('vICMS') + tot('vPIS') + tot('vCOFINS'));
    const natOp = credit ? 'Devolução de venda de mercadoria' : complement ? 'Complemento de preço' : 'Venda de mercadoria adquirida de terceiros';
    const dups = credit || complement ? [] : [30, 60, 90].map((days, i) => {
        const part = i < 2 ? round2(Math.floor(vNF / 3 * 100) / 100) : round2(vNF - 2 * Math.floor(vNF / 3 * 100) / 100);
        return { nDup: `00${i + 1}`, dVenc: brIso(addDays(issued, days)), vDup: part };
    });
    const infCpl = credit
        ? (en ? `Return of 1 chair damaged in transport. Ref. NF-e 4180.` : `Devolução de 1 cadeira avariada no transporte. Ref. NF-e nº 4180.`)
        : complement
            ? (en ? 'Price supplement under the contract adjustment clause. Ref. NF-e 4180.' : 'Complemento de preço conforme cláusula de reajuste contratual. Ref. NF-e nº 4180.')
            : `${en ? 'Purchase order' : 'Pedido de compra'} PC-${today.getFullYear()}-3310. ${en ? 'Approximate taxes' : 'Tributos aproximados'}: R$ ${money(vTotTrib).replace('.', ',')} (Lei 12.741/2012).`;
    const cNF = chave.slice(35, 43);

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<nfeProc xmlns="${BR_NFE_NS}" versao="4.00">`,
        '<NFe>',
        `<infNFe Id="NFe${chave}" versao="4.00">`,
        '<ide>',
        el('cUF', '35'), el('cNF', cNF), el('natOp', natOp), el('mod', '55'), el('serie', '1'), el('nNF', n),
        el('dhEmi', brOffset(issued, '15:30:00')), credit ? '' : el('dhSaiEnt', brOffset(issued, '16:00:00')),
        el('tpNF', credit ? 0 : 1), el('idDest', 1), el('cMunFG', '3550308'), el('tpImp', 1), el('tpEmis', 1), el('cDV', chave.slice(-1)),
        el('tpAmb', 1), el('finNFe', credit ? 4 : complement ? 2 : 1), el('indFinal', 1), el('indPres', 9), el('procEmi', 0), el('verProc', 'eDesign 1.0'),
        credit || complement ? `<NFref>${el('refNFe', originalKey)}</NFref>` : '',
        '</ide>',
        '<emit>', el('CNPJ', emit.cnpj ?? ''), el('xNome', emit.name), el('xFant', emit.fant ?? ''), brAddress('enderEmit', emit), el('IE', emit.ie ?? ''), el('CRT', 3), '</emit>',
        '<dest>', el('CNPJ', dest.cnpj ?? ''), el('xNome', dest.name), brAddress('enderDest', dest), el('indIEDest', 9), el('IM', dest.im ?? ''), el('email', dest.email ?? ''), '</dest>',
        ...rows.map(({ l, vProd: v, t }, i) => [
            `<det nItem="${i + 1}">`,
            '<prod>',
            el('cProd', l.code), el('cEAN', 'SEM GTIN'), el('xProd', l.name), el('NCM', l.ncm), el('CFOP', cfop),
            el('uCom', l.unit), el('qCom', l.qty.toFixed(4)), el('vUnCom', l.price.toFixed(10)), el('vProd', money(v)),
            el('cEANTrib', 'SEM GTIN'), el('uTrib', l.unit), el('qTrib', l.qty.toFixed(4)), el('vUnTrib', l.price.toFixed(10)), el('indTot', 1),
            '</prod>',
            '<imposto>',
            el('vTotTrib', money(t.vICMS + t.vPIS + t.vCOFINS)),
            `<ICMS><ICMS00>${el('orig', 0)}${el('CST', '00')}${el('modBC', 3)}${el('vBC', money(v))}${el('pICMS', s.rate.toFixed(4))}${el('vICMS', money(t.vICMS))}</ICMS00></ICMS>`,
            `<PIS><PISAliq>${el('CST', '01')}${el('vBC', money(t.vBCPis))}${el('pPIS', '1.6500')}${el('vPIS', money(t.vPIS))}</PISAliq></PIS>`,
            `<COFINS><COFINSAliq>${el('CST', '01')}${el('vBC', money(t.vBCPis))}${el('pCOFINS', '7.6000')}${el('vCOFINS', money(t.vCOFINS))}</COFINSAliq></COFINS>`,
            brIbsCbs(t),
            '</imposto>',
            '</det>',
        ].join('')),
        '<total>',
        '<ICMSTot>',
        el('vBC', money(vProd)), el('vICMS', money(tot('vICMS'))), el('vICMSDeson', '0.00'), el('vFCP', '0.00'), el('vBCST', '0.00'), el('vST', '0.00'),
        el('vFCPST', '0.00'), el('vFCPSTRet', '0.00'), el('vProd', money(vProd)), el('vFrete', '0.00'), el('vSeg', '0.00'), el('vDesc', '0.00'),
        el('vII', '0.00'), el('vIPI', '0.00'), el('vIPIDevol', '0.00'), el('vPIS', money(tot('vPIS'))), el('vCOFINS', money(tot('vCOFINS'))),
        el('vOutro', '0.00'), el('vNF', money(vNF)), el('vTotTrib', money(vTotTrib)),
        '</ICMSTot>',
        brIbsCbsTot(tot('vBC'), tot('vIBSUF'), tot('vIBSMun'), tot('vCBS')),
        '</total>',
        '<transp>',
        el('modFrete', credit || complement ? 9 : 0),
        credit || complement ? '' : `<transporta>${el('CNPJ', BR_CARRIER.cnpj ?? '')}${el('xNome', BR_CARRIER.name)}${el('IE', BR_CARRIER.ie ?? '')}${el('xEnder', `${BR_CARRIER.street}, ${BR_CARRIER.nro}`)}${el('xMun', BR_CARRIER.city)}${el('UF', 'SP')}</transporta>`,
        credit || complement ? '' : `<vol>${el('qVol', 8)}${el('esp', 'CAIXA')}${el('marca', 'ERGO')}${el('nVol', '1/8')}${el('pesoL', '164.000')}${el('pesoB', '182.500')}</vol>`,
        '</transp>',
        dups.length ? [
            '<cobr>',
            `<fat>${el('nFat', n)}${el('vOrig', money(vNF))}${el('vDesc', '0.00')}${el('vLiq', money(vNF))}</fat>`,
            ...dups.map(d => `<dup>${el('nDup', d.nDup)}${el('dVenc', d.dVenc)}${el('vDup', money(d.vDup))}</dup>`),
            '</cobr>',
        ].join('') : '',
        '<pag>',
        dups.length
            ? `<detPag>${el('indPag', 1)}${el('tPag', '15')}${el('vPag', money(vNF))}</detPag>`
            : `<detPag>${el('tPag', '90')}${el('vPag', '0.00')}</detPag>`,
        '</pag>',
        `<infAdic>${el('infCpl', infCpl)}</infAdic>`,
        '</infNFe>',
        '</NFe>',
        brProt('protNFe', 'chNFe', chave, issued, `135${String(issued.getFullYear()).slice(2)}${credit ? '0012349871' : complement ? '0012349872' : '0012345678'}`, 'Autorizado o uso da NF-e'),
        '</nfeProc>',
    ].filter(Boolean).join('\n');
}

/** NFC-e modelo 65 de uma loja do Simples Nacional (CSOSN 102; IBS/CBS a partir de 2027 para o SN). */
function brNfce(lang: DocLanguage): string {
    const s = COUNTRY_SAMPLES.BR;
    const en = lang !== 'pt';
    const today = new Date();
    const emit = BR_RETAIL;
    const all = brItems(s, en);
    const rows = [{ ...all[0], qty: 1 }, { ...all[2], qty: 1 }].map(l => ({ l, vProd: round2(l.qty * l.price) }));
    const vNF = round2(rows.reduce((n, r) => n + r.vProd, 0));
    const fed = round2(vNF * 0.1345);
    const est = round2(vNF * 0.18);
    const n = '52831';
    const chave = brChave('SP', today, emit.cnpj ?? '', '65', '1', n, '71829304');
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<nfeProc xmlns="${BR_NFE_NS}" versao="4.00">`,
        '<NFe>',
        `<infNFe Id="NFe${chave}" versao="4.00">`,
        '<ide>',
        el('cUF', '35'), el('cNF', chave.slice(35, 43)), el('natOp', 'Venda ao consumidor'), el('mod', '65'), el('serie', '1'), el('nNF', n),
        el('dhEmi', brOffset(today, '18:42:05')), el('tpNF', 1), el('idDest', 1), el('cMunFG', '3550308'), el('tpImp', 4), el('tpEmis', 1),
        el('cDV', chave.slice(-1)), el('tpAmb', 1), el('finNFe', 1), el('indFinal', 1), el('indPres', 1), el('procEmi', 0), el('verProc', 'eDesign 1.0'),
        '</ide>',
        '<emit>', el('CNPJ', emit.cnpj ?? ''), el('xNome', emit.name), el('xFant', emit.fant ?? ''), brAddress('enderEmit', emit), el('IE', emit.ie ?? ''), el('CRT', 1), '</emit>',
        `<dest>${el('CPF', '12345678909')}${el('indIEDest', 9)}</dest>`,
        ...rows.map(({ l, vProd }, i) => [
            `<det nItem="${i + 1}">`,
            '<prod>',
            el('cProd', l.code), el('cEAN', 'SEM GTIN'), el('xProd', l.name), el('NCM', l.ncm), el('CFOP', '5102'),
            el('uCom', l.unit), el('qCom', l.qty.toFixed(4)), el('vUnCom', l.price.toFixed(10)), el('vProd', money(vProd)),
            el('cEANTrib', 'SEM GTIN'), el('uTrib', l.unit), el('qTrib', l.qty.toFixed(4)), el('vUnTrib', l.price.toFixed(10)), el('indTot', 1),
            '</prod>',
            '<imposto>',
            el('vTotTrib', money(round2(vProd * 0.3145))),
            `<ICMS><ICMSSN102>${el('orig', 0)}${el('CSOSN', '102')}</ICMSSN102></ICMS>`,
            `<PIS><PISOutr>${el('CST', '49')}${el('vBC', '0.00')}${el('pPIS', '0.0000')}${el('vPIS', '0.00')}</PISOutr></PIS>`,
            `<COFINS><COFINSOutr>${el('CST', '49')}${el('vBC', '0.00')}${el('pCOFINS', '0.0000')}${el('vCOFINS', '0.00')}</COFINSOutr></COFINS>`,
            '</imposto>',
            '</det>',
        ].join('')),
        '<total><ICMSTot>',
        ...['vBC', 'vICMS', 'vICMSDeson', 'vFCP', 'vBCST', 'vST', 'vFCPST', 'vFCPSTRet'].map(k => el(k, '0.00')),
        el('vProd', money(vNF)), ...['vFrete', 'vSeg', 'vDesc', 'vII', 'vIPI', 'vIPIDevol', 'vPIS', 'vCOFINS', 'vOutro'].map(k => el(k, '0.00')),
        el('vNF', money(vNF)), el('vTotTrib', money(round2(fed + est))),
        '</ICMSTot></total>',
        `<transp>${el('modFrete', 9)}</transp>`,
        '<pag>',
        `<detPag>${el('indPag', 0)}${el('tPag', '03')}${el('vPag', money(vNF))}<card>${el('tpIntegra', 2)}${el('CNPJ', '01027058000191')}${el('tBand', '01')}${el('cAut', '274615')}</card></detPag>`,
        el('vTroco', '0.00'),
        '</pag>',
        `<infAdic>${el('infCpl', `${en ? 'Approx. taxes' : 'Trib. aprox.'} R$ ${money(fed).replace('.', ',')} ${en ? 'federal' : 'Federal'} ${en ? 'and' : 'e'} R$ ${money(est).replace('.', ',')} ${en ? 'state' : 'Estadual'} - ${en ? 'Source' : 'Fonte'}: IBPT. ${en ? 'Thank you, come back soon!' : 'Obrigado, volte sempre!'}`)}</infAdic>`,
        '</infNFe>',
        `<infNFeSupl>${el('qrCode', `https://www.nfce.fazenda.sp.gov.br/qrcode?p=${chave}|2|1|1|5E8C2A7D41F0B93C6A1E4D27F58B0C3916E2A4D7`)}${el('urlChave', 'https://www.nfce.fazenda.sp.gov.br/consulta')}</infNFeSupl>`,
        '</NFe>',
        brProt('protNFe', 'chNFe', chave, today, `135${String(today.getFullYear()).slice(2)}0098765432`, 'Autorizado o uso da NF-e'),
        '</nfeProc>',
    ].join('\n');
}

/** NFS-e padrão nacional (DPS gerada pelo prestador, NFS-e emitida pela Sefin Nacional). */
function brNfse(lang: DocLanguage): string {
    const s = COUNTRY_SAMPLES.BR;
    const en = lang !== 'pt';
    const today = new Date();
    const prest = brParty(s.seller);
    const toma = brParty(s.buyer);
    const nNFSe = '1287';
    const base = `3550308${2}${2}${prest.cnpj}${nNFSe.padStart(13, '0')}${brYyMm(today)}${'384615072'}`;
    const chave = base + brMod11(base);
    const vServ = round2(6 * localPrice(65, s.scale));
    const vISSQN = round2(vServ * 0.05);
    const vPis = round2(vServ * 0.0165);
    const vCofins = round2(vServ * 0.076);
    const vBC = round2(vServ - vISSQN - vPis - vCofins);
    const vIBSUF = round2(vBC * 0.001);
    const vCBS = round2(vBC * 0.009);
    const vLiq = vServ;
    const desc = en
        ? 'Assembly and installation of 6 office workstations (chairs and desks) at the customer’s premises, including levelling and cable routing.'
        : 'Montagem e instalação de 6 estações de trabalho (cadeiras e mesas) nas dependências do tomador, incluindo nivelamento e passagem de cabos.';
    const endNac = (p: BrParty) => {
        const [cMun] = BR_MUN[p.city] ?? BR_MUN['São Paulo'];
        return `<end><endNac>${el('cMun', cMun)}${el('CEP', p.cep)}</endNac>${el('xLgr', p.street)}${el('nro', p.nro)}${el('xBairro', p.bairro)}</end>`;
    };
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<NFSe xmlns="${BR_NFSE_NS}" versao="1.01">`,
        `<infNFSe Id="NFS${chave}">`,
        el('xLocEmi', 'São Paulo'), el('xLocPrestacao', 'Campinas'), el('nNFSe', nNFSe), el('cLocIncid', '3550308'), el('xLocIncid', 'São Paulo'),
        el('xTribNac', 'Instalação e montagem de aparelhos, máquinas e equipamentos, inclusive montagem industrial, prestados ao usuário final, exclusivamente com material por ele fornecido.'),
        el('verAplic', 'SefinNac_1.6.0'), el('ambGer', 2), el('tpEmis', 1), el('procEmi', 1), el('cStat', 100), el('dhProc', brOffset(today, '10:15:27')),
        el('nDFSe', '208437162'),
        '<emit>', el('CNPJ', prest.cnpj ?? ''), el('IM', '4.876.512-3'), el('xNome', prest.name), el('xFant', prest.fant ?? ''),
        `<enderNac>${el('xLgr', prest.street)}${el('nro', prest.nro)}${el('xBairro', prest.bairro)}${el('cMun', '3550308')}${el('UF', 'SP')}${el('CEP', prest.cep)}</enderNac>`,
        el('fone', prest.fone ?? ''), el('email', prest.email ?? ''), '</emit>',
        `<valores>${el('vBC', money(vServ))}${el('pAliqAplic', '5.00')}${el('vISSQN', money(vISSQN))}${el('vTotalRet', '0.00')}${el('vLiq', money(vLiq))}</valores>`,
        '<IBSCBS>',
        el('cLocalidadeIncid', '3509502'), el('xLocalidadeIncid', 'Campinas'),
        '<valores>', el('vBC', money(vBC)), el('vCalcReeRepRes', '0.00'),
        `<uf>${el('pIBSUF', '0.10')}${el('pRedAliqUF', '0.00')}${el('pAliqEfetUF', '0.10')}</uf>`,
        `<mun>${el('pIBSMun', '0.00')}${el('pRedAliqMun', '0.00')}${el('pAliqEfetMun', '0.00')}</mun>`,
        `<fed>${el('pCBS', '0.90')}${el('pRedAliqCBS', '0.00')}${el('pAliqEfetCBS', '0.90')}</fed>`,
        '</valores>',
        '<totCIBS>', el('vTotNF', money(round2(vLiq + vIBSUF + vCBS))),
        `<gIBS>${el('vIBSTot', money(vIBSUF))}<gIBSUFTot>${el('vDifUF', '0.00')}${el('vIBSUF', money(vIBSUF))}</gIBSUFTot><gIBSMunTot>${el('vDifMun', '0.00')}${el('vIBSMun', '0.00')}</gIBSMunTot></gIBS>`,
        `<gCBS>${el('vDifCBS', '0.00')}${el('vCBS', money(vCBS))}</gCBS>`,
        '</totCIBS>',
        '</IBSCBS>',
        '<DPS versao="1.01">',
        `<infDPS Id="DPS35503082${prest.cnpj}00001${nNFSe.padStart(15, '0')}">`,
        el('tpAmb', 1), el('dhEmi', brOffset(today, '10:14:58')), el('verAplic', 'eDesign 1.0'), el('serie', '1'), el('nDPS', nNFSe), el('dCompet', brIso(today)),
        el('tpEmit', 1), el('cLocEmi', '3550308'),
        '<prest>', el('CNPJ', prest.cnpj ?? ''), el('IM', '4.876.512-3'), el('xNome', prest.name), endNac(prest), el('fone', prest.fone ?? ''), el('email', prest.email ?? ''),
        `<regTrib>${el('opSimpNac', 1)}${el('regEspTrib', 0)}</regTrib>`, '</prest>',
        '<toma>', el('CNPJ', toma.cnpj ?? ''), el('IM', toma.im ?? ''), el('xNome', toma.name), endNac(toma), el('fone', toma.fone ?? ''), el('email', toma.email ?? ''), '</toma>',
        '<serv>',
        `<locPrest>${el('cLocPrestacao', '3509502')}${el('cPaisPrestacao', 'BR')}</locPrest>`,
        `<cServ>${el('cTribNac', '140601')}${el('xDescServ', desc)}${el('cNBS', '114051000')}</cServ>`,
        `<infoCompl>${el('xPed', `PC-${today.getFullYear()}-3310`)}${el('xInfComp', en ? 'Service related to NF-e 4180 (goods supplied by the customer).' : 'Serviço referente à NF-e nº 4180 (bens fornecidos pelo tomador).')}</infoCompl>`,
        '</serv>',
        '<valores>',
        `<vServPrest>${el('vServ', money(vServ))}</vServPrest>`,
        '<trib>',
        `<tribMun>${el('tribISSQN', 1)}${el('tpRetISSQN', 1)}</tribMun>`,
        `<tribFed><piscofins>${el('CST', '01')}${el('vBCPisCofins', money(vServ))}${el('pAliqPis', '1.65')}${el('pAliqCofins', '7.60')}${el('vPis', money(vPis))}${el('vCofins', money(vCofins))}${el('tpRetPisCofins', 2)}</piscofins></tribFed>`,
        `<totTrib><vTotTrib>${el('vTotTribFed', money(round2(vPis + vCofins + vCBS)))}${el('vTotTribEst', money(vIBSUF))}${el('vTotTribMun', money(vISSQN))}</vTotTrib></totTrib>`,
        '</trib>',
        '</valores>',
        `<IBSCBS>${el('finNFSe', 0)}${el('indFinal', 0)}${el('cIndOp', '100301')}${el('indDest', 0)}<valores><trib><gIBSCBS>${el('CST', '000')}${el('cClassTrib', '000001')}</gIBSCBS></trib></valores></IBSCBS>`,
        '</infDPS>',
        '</DPS>',
        '</infNFSe>',
        '</NFSe>',
    ].join('\n');
}

/** CT-e modelo 57 (rodoviário) do frete da venda modelo; o tomador é o remetente (CIF). */
function brCte(lang: DocLanguage): string {
    const s = COUNTRY_SAMPLES.BR;
    const en = lang !== 'pt';
    const today = new Date();
    const issued = addDays(today, -12);
    const emit = BR_CARRIER;
    const rem = brParty(s.seller);
    const dest = brParty(s.buyer);
    const { vProd: vCarga } = brSale(s, en);
    const comps: [string, number][] = [
        ['FRETE PESO', 620], ['FRETE VALOR', round2(vCarga * 0.002)], ['PEDÁGIO', 38.4], ['GRIS', round2(vCarga * 0.001)],
    ];
    const vTPrest = round2(comps.reduce((n, [, v]) => n + v, 0));
    const vICMS = round2(vTPrest * 0.12);
    const vBC = round2(vTPrest - vICMS);
    const vIBSUF = round2(vBC * 0.001);
    const vCBS = round2(vBC * 0.009);
    const nCT = '7715';
    const chave = brChave('SP', issued, emit.cnpj ?? '', '57', '1', nCT, '52190846');
    const party = (tag: string, addrTag: string, p: BrParty) => [
        `<${tag}>`, el('CNPJ', p.cnpj ?? ''), p.ie ? el('IE', p.ie) : '', el('xNome', p.name), p.fant ? el('xFant', p.fant) : '', p.fone ? el('fone', p.fone) : '',
        brAddress(addrTag, { ...p, fone: undefined }), p.email ? el('email', p.email) : '', `</${tag}>`,
    ].join('');
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<cteProc xmlns="${BR_CTE_NS}" versao="4.00">`,
        '<CTe>',
        `<infCte Id="CTe${chave}" versao="4.00">`,
        '<ide>',
        el('cUF', '35'), el('cCT', chave.slice(35, 43)), el('CFOP', '5353'), el('natOp', 'Prestação de serviço de transporte a estabelecimento comercial'),
        el('mod', '57'), el('serie', '1'), el('nCT', nCT), el('dhEmi', brOffset(issued, '16:20:00')), el('tpImp', 1), el('tpEmis', 1), el('cDV', chave.slice(-1)),
        el('tpAmb', 1), el('tpCTe', 0), el('procEmi', 0), el('verProc', 'eDesign 1.0'),
        el('cMunEnv', '3518800'), el('xMunEnv', 'Guarulhos'), el('UFEnv', 'SP'), el('modal', '01'), el('tpServ', 0),
        el('cMunIni', '3550308'), el('xMunIni', 'São Paulo'), el('UFIni', 'SP'), el('cMunFim', '3509502'), el('xMunFim', 'Campinas'), el('UFFim', 'SP'),
        el('retira', 1), el('indIEToma', 1), `<toma3>${el('toma', 0)}</toma3>`,
        '</ide>',
        `<compl>${el('xObs', en ? 'Deliver to the hotel goods receiving area, Mon–Fri 8am–5pm.' : 'Entregar no recebimento de mercadorias do hotel, seg. a sex. das 8h às 17h.')}</compl>`,
        '<emit>', el('CNPJ', emit.cnpj ?? ''), el('IE', emit.ie ?? ''), el('xNome', emit.name), el('xFant', emit.fant ?? ''),
        brAddress('enderEmit', emit, false), el('CRT', 3), '</emit>',
        party('rem', 'enderReme', rem),
        party('dest', 'enderDest', { ...dest, ie: undefined }),
        '<vPrest>', el('vTPrest', money(vTPrest)), el('vRec', money(vTPrest)),
        ...comps.map(([name, v]) => `<Comp>${el('xNome', name)}${el('vComp', money(v))}</Comp>`),
        '</vPrest>',
        '<imp>',
        `<ICMS><ICMS00>${el('CST', '00')}${el('vBC', money(vTPrest))}${el('pICMS', '12.00')}${el('vICMS', money(vICMS))}</ICMS00></ICMS>`,
        el('vTotTrib', money(round2(vICMS + vTPrest * 0.0925))),
        `<IBSCBS>${el('CST', '000')}${el('cClassTrib', '000001')}<gIBSCBS>${el('vBC', money(vBC))}<gIBSUF>${el('pIBSUF', '0.1000')}${el('vIBSUF', money(vIBSUF))}</gIBSUF><gIBSMun>${el('pIBSMun', '0.0000')}${el('vIBSMun', '0.00')}</gIBSMun>${el('vIBS', money(vIBSUF))}<gCBS>${el('pCBS', '0.9000')}${el('vCBS', money(vCBS))}</gCBS></gIBSCBS></IBSCBS>`,
        '</imp>',
        '<infCTeNorm>',
        '<infCarga>', el('vCarga', money(vCarga)), el('proPred', en ? 'Office furniture' : 'Móveis de escritório'), el('xOutCat', en ? 'Boxed' : 'Encaixotado'),
        `<infQ>${el('cUnid', '01')}${el('tpMed', 'PESO BRUTO')}${el('qCarga', '182.5000')}</infQ>`,
        `<infQ>${el('cUnid', '03')}${el('tpMed', 'VOLUMES')}${el('qCarga', '8.0000')}</infQ>`,
        '</infCarga>',
        `<infDoc><infNFe>${el('chave', brNfeKey(issued, '4180', '30418027'))}</infNFe></infDoc>`,
        `<infModal versaoModal="4.00"><rodo>${el('RNTRC', '04518263')}</rodo></infModal>`,
        '</infCTeNorm>',
        '</infCte>',
        `<infCTeSupl>${el('qrCodCTe', `https://nfe.fazenda.sp.gov.br/CTeConsulta/qrCode?chCTe=${chave}&tpAmb=1`)}</infCTeSupl>`,
        '</CTe>',
        brProt('protCTe', 'chCTe', chave, issued, `135${String(issued.getFullYear()).slice(2)}0045612378`, 'Autorizado o uso do CT-e'),
        '</cteProc>',
    ].join('\n');
}

const GENERATORS: Record<string, (kind: IntlDocKind, lang: DocLanguage) => string> = {
    'ru-upd-503': ruUpd,
    'in-gst-einvoice': inEinvoice,
    'in-eway-bill': (_kind, lang) => inEwayBill(lang),
    'cn-fully-digital': cnInvoice,
    'br-nfe': brNfe,
    'br-nfce': (_kind, lang) => brNfce(lang),
    'br-nfse': (_kind, lang) => brNfse(lang),
    'br-cte': (_kind, lang) => brCte(lang),
};

export const isNationalProfile = (profileId: string) => profileId in GENERATORS;

/** Ulusal profilin örnek XML'i; ülke parametresi profil ülkesiyle aynıdır. */
export function generateNationalXml(_country: CountryCode, kind: IntlDocKind, lang: DocLanguage, profileId: string): string {
    return GENERATORS[profileId](kind, lang);
}
