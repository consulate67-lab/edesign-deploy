// Meslek şablonlarının UBL-TR örnek XML üreticileri: Invoice (e-Fatura, e-Arşiv, e-İhracat, mikro ihracat,
// yolcu beraberi, e-SMM, e-Bilet), CreditNote (e-Müstahsil, e-Gider Pusulası, e-Kıymetli Maden) ve
// DespatchAdvice (e-İrsaliye). Tüm tutarlar satırlardan hesaplanır; eleman sırası UBL 2.1 şemasına uyar.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const r2 = (x) => Math.round(x * 100 + (x >= 0 ? 1e-7 : -1e-7)) / 100;
const f2 = (x) => r2(x).toFixed(2);
const fq = (x) => String(Number(Number(x).toFixed(4)));

/** e(tag, attrs?, ...çocuklar) — çocuklar metin, düğüm, dizi veya boş (null/false/'') olabilir. */
export const e = (tag, ...rest) => {
    const attrs = rest[0] && typeof rest[0] === 'object' && !Array.isArray(rest[0]) && !rest[0].tag ? rest.shift() : {};
    return { tag, attrs, kids: rest.flat(Infinity).filter((k) => k !== null && k !== undefined && k !== false && k !== '') };
};

const ser = (n, ind) => {
    const pad = '    '.repeat(ind);
    const a = Object.entries(n.attrs).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => ` ${k}="${esc(v)}"`).join('');
    if (!n.kids.length) return `${pad}<${n.tag}${a}/>`;
    if (n.kids.every((k) => typeof k !== 'object')) return `${pad}<${n.tag}${a}>${n.kids.map(esc).join('')}</${n.tag}>`;
    return `${pad}<${n.tag}${a}>\n${n.kids.map((k) => (typeof k === 'object' ? ser(k, ind + 1) : `${pad}    ${esc(k)}`)).join('\n')}\n${pad}</${n.tag}>`;
};

export const uuidFrom = (seed) => {
    let h = 2166136261;
    const out = [];
    for (let i = 0; out.length < 32; i++) {
        h ^= seed.charCodeAt(i % seed.length) + i;
        h = Math.imul(h, 16777619) >>> 0;
        out.push(((h >>> 7) & 15).toString(16).toUpperCase());
    }
    const s = out.join('');
    return `${s.slice(0, 8)}-${s.slice(8, 12)}-4${s.slice(13, 16)}-A${s.slice(17, 20)}-${s.slice(20, 32)}`;
};

const BIR = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
const ON = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];
const uc = (n) => {
    const y = Math.floor(n / 100);
    return [y ? (y === 1 ? 'Yüz' : `${BIR[y]} Yüz`) : '', ON[Math.floor((n % 100) / 10)], BIR[n % 10]].filter(Boolean).join(' ');
};
const words = (n) => {
    if (!n) return 'Sıfır';
    const names = ['', 'Bin', 'Milyon', 'Milyar'];
    const parts = [];
    for (let i = 0; n > 0; i++, n = Math.floor(n / 1000)) {
        const g = n % 1000;
        if (g) parts.unshift(i === 1 && g === 1 ? 'Bin' : `${uc(g)}${names[i] ? ` ${names[i]}` : ''}`);
    }
    return parts.join(' ');
};
const CUR = { TRY: ['Türk Lirası', 'Kuruş'], EUR: ['Avro', 'Sent'], USD: ['ABD Doları', 'Sent'], GBP: ['İngiliz Sterlini', 'Peni'] };
export const yaziyla = (amt, cur = 'TRY') => {
    const [a, b] = CUR[cur];
    const tam = Math.floor(amt + 1e-7);
    const k = Math.round((amt - tam) * 100);
    return `Yalnız: ${words(tam)} ${a}${k ? ` ${words(k)} ${b}` : ''}`;
};

/* ------------------------------------------------------------------ ortak parçalar */

const address = (a, tag = 'cac:PostalAddress') => a && e(tag,
    a.street && e('cbc:StreetName', a.street),
    a.bname && e('cbc:BuildingName', a.bname),
    a.no && e('cbc:BuildingNumber', a.no),
    e('cbc:CitySubdivisionName', a.district),
    e('cbc:CityName', a.city),
    a.zip && e('cbc:PostalZone', a.zip),
    e('cac:Country', e('cbc:IdentificationCode', a.cc ?? 'TR'), e('cbc:Name', a.country ?? 'Türkiye')));

/**
 * Taraf: { web, ids: [[şema, no]], name, addr, vd, tel, mail, sms: [sağlayıcı, no], code: [kod, ad],
 * person: [ad, soyad], nationality, passport: [no, tarih] }
 */
export const party = (p, tag = 'cac:Party') => e(tag,
    p.web && e('cbc:WebsiteURI', p.web),
    (p.ids ?? []).map(([scheme, id]) => e('cac:PartyIdentification', e('cbc:ID', { schemeID: scheme }, id))),
    p.name && e('cac:PartyName', e('cbc:Name', p.name)),
    address(p.addr),
    p.vd && e('cac:PartyTaxScheme', e('cac:TaxScheme', e('cbc:Name', p.vd))),
    (p.tel || p.mail || p.sms || p.code) && e('cac:Contact',
        p.code && e('cbc:ID', p.code[0]),
        p.code && e('cbc:Name', p.code[1]),
        p.tel && e('cbc:Telephone', p.tel),
        p.mail && e('cbc:ElectronicMail', p.mail),
        p.sms && e('cac:OtherCommunication', e('cbc:ChannelCode', { name: p.sms[2] ?? 'SMS_PROVIDER' }, p.sms[0]), e('cbc:Value', p.sms[1]))),
    p.person && e('cac:Person',
        e('cbc:FirstName', p.person[0]),
        e('cbc:FamilyName', p.person[1]),
        p.nationality && e('cbc:NationalityID', p.nationality),
        p.passport && e('cac:IdentityDocumentReference', e('cbc:ID', p.passport[0]), e('cbc:IssueDate', p.passport[1]))));

const taxId = (p) => (p.ids ?? []).find(([k]) => k === 'VKN' || k === 'TCKN');

const signature = (s, id) => {
    const vkn = taxId(s);
    return e('cac:Signature',
        e('cbc:ID', { schemeID: 'VKN_TCKN' }, vkn[1]),
        e('cac:SignatoryParty', e('cac:PartyIdentification', e('cbc:ID', { schemeID: vkn[0] }, vkn[1])), address(s.addr)),
        e('cac:DigitalSignatureAttachment', e('cac:ExternalReference', e('cbc:URI', `#Signature_${id}`))));
};

const docRef = (tag, d, date) => e(tag,
    e('cbc:ID', d.scheme ? { schemeID: d.scheme } : {}, d.id),
    e('cbc:IssueDate', d.date ?? date),
    d.typeCode && e('cbc:DocumentTypeCode', d.typeCode),
    d.type && e('cbc:DocumentType', d.type),
    d.desc && e('cbc:DocumentDescription', d.desc));

const item = (l) => e('cac:Item',
    l.desc && e('cbc:Description', l.desc),
    e('cbc:Name', l.name),
    l.brand && e('cbc:BrandName', l.brand),
    l.model && e('cbc:ModelName', l.model),
    l.sid && e('cac:SellersItemIdentification', e('cbc:ID', l.sid)),
    Object.entries(l.props ?? {}).map(([k, val]) => e('cac:AdditionalItemIdentification', e('cbc:ID', { schemeID: k }, val))),
    l.origin && e('cac:OriginCountry', e('cbc:IdentificationCode', l.origin[0]), e('cbc:Name', l.origin[1])));

const sub = (cur, t) => e('cac:TaxSubtotal',
    t.base !== undefined && e('cbc:TaxableAmount', { currencyID: cur }, f2(t.base)),
    e('cbc:TaxAmount', { currencyID: cur }, f2(t.amount)),
    t.seq && e('cbc:CalculationSequenceNumeric', String(t.seq)),
    t.pct !== undefined && e('cbc:Percent', String(t.pct)),
    t.perUnit !== undefined && e('cbc:PerUnitAmount', { currencyID: cur }, fq(t.perUnit)),
    e('cac:TaxCategory',
        t.ex?.code && e('cbc:TaxExemptionReasonCode', t.ex.code),
        t.ex && e('cbc:TaxExemptionReason', t.ex.reason),
        e('cac:TaxScheme', e('cbc:Name', t.name), e('cbc:TaxTypeCode', t.code))));

const taxTotal = (cur, subs) => e('cac:TaxTotal',
    e('cbc:TaxAmount', { currencyID: cur }, f2(subs.reduce((a, s) => a + s.amount, 0))),
    subs.map((s) => sub(cur, s)));

const whTotal = (cur, w, base, amount) => e('cac:WithholdingTaxTotal',
    e('cbc:TaxAmount', { currencyID: cur }, f2(amount)),
    sub(cur, { base, amount, pct: w.pct, name: w.name, code: w.code }));

const NS = {
    Invoice: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
    CreditNote: 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
    DespatchAdvice: 'urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2',
};
const rootAttrs = (root) => ({
    xmlns: NS[root],
    'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
    'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
    'xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
});
const head = (root, d, customization = 'TR1.2') => [
    e('ext:UBLExtensions', e('ext:UBLExtension', e('ext:ExtensionContent'))),
    e('cbc:UBLVersionID', '2.1'),
    e('cbc:CustomizationID', customization),
    e('cbc:ProfileID', d.profile),
    e('cbc:ID', d.id),
    e('cbc:CopyIndicator', 'false'),
    e('cbc:UUID', uuidFrom(d.id)),
    e('cbc:IssueDate', d.date),
    e('cbc:IssueTime', d.time),
];
const wrap = (comment, node) => `<?xml version="1.0" encoding="UTF-8"?>\n<!--\n${comment.trim().split('\n').map((s) => `  ${s.trim()}`).join('\n')}\n  Tüm kişi ve firma bilgileri kurgusaldır.\n-->\n${ser(node, 0)}\n`;

const paymentMeans = (p, cur) => p && e('cac:PaymentMeans',
    e('cbc:PaymentMeansCode', p.code ?? '42'),
    p.due && e('cbc:PaymentDueDate', p.due),
    p.note && e('cbc:InstructionNote', p.note),
    p.iban && e('cac:PayeeFinancialAccount',
        e('cbc:ID', p.iban),
        e('cbc:CurrencyCode', p.ibanCur ?? cur),
        p.bank && e('cbc:PaymentNote', p.bank)));

const period = (p) => p && e('cac:InvoicePeriod',
    e('cbc:StartDate', p.start),
    p.startTime && e('cbc:StartTime', p.startTime),
    p.end && e('cbc:EndDate', p.end),
    p.endTime && e('cbc:EndTime', p.endTime),
    p.desc && e('cbc:Description', p.desc));

/* ------------------------------------------------------------------ Invoice */

const KDV = { name: 'KDV', code: '0015' };
const STOPAJ = { name: 'GV STOPAJI', code: '0003' };

/**
 * Fatura türü belgeler. Satır: { name, desc, unit, qty, price, kdv, disc: {rate, reason}, props, om (özel matrah tutarı),
 * taxes: [{code, name, pct | perUnit}] (ÖTV / konaklama vergisi; KDV matrahına dahil), exp: {incoterm, gtip, mode, pkg} }.
 * Belge: exemption {code, reason, keepKdv}, withholding {code, name, pct}, stopaj (GV stopajı %), period, delivery, payment.
 */
export function invoice(d) {
    const cur = d.currency ?? 'TRY';
    const lines = d.lines.map((l, i) => {
        const gross = r2(l.qty * l.price);
        const da = l.disc ? r2(gross * l.disc.rate) : 0;
        const net = r2(gross - da);
        const extra = (l.taxes ?? []).map((t) => (t.perUnit !== undefined
            ? { ...t, amount: r2(t.perUnit * l.qty) }
            : { ...t, base: net, amount: r2((net * t.pct) / 100) }));
        const ex = l.ex ?? d.exemption ?? (l.om !== undefined ? d.om : null);
        const pct = ex && !ex.keepKdv && l.om === undefined ? 0 : (l.kdv ?? 20);
        const kdvBase = l.om !== undefined ? l.om : r2(net + extra.reduce((a, t) => a + t.amount, 0));
        const kdv = r2((kdvBase * pct) / 100);
        const wh = d.withholding && !l.noWh ? r2((kdv * d.withholding.pct) / 100) : 0;
        const st = d.stopaj ? r2((net * d.stopaj) / 100) : 0;
        return { ...l, no: i + 1, gross, da, net, extra, ex, pct, kdvBase, kdv, wh, st };
    });
    const sum = (f) => r2(lines.reduce((a, l) => a + f(l), 0));
    const gross = sum((l) => l.gross);
    const disc = sum((l) => l.da);
    const net = sum((l) => l.net);
    const extraTotal = sum((l) => l.extra.reduce((a, t) => a + t.amount, 0));
    const kdv = sum((l) => l.kdv);
    const wh = sum((l) => l.wh);
    const st = sum((l) => l.st);
    const inclusive = r2(net + extraTotal + kdv);
    // İhraç kayıtlı satışta KDV hesaplanır ama tahsil edilmez (tecil): ödenecek = matrah.
    const payable = d.tecil ? r2(inclusive - kdv - wh - st) : r2(inclusive - wh - st);

    const subs = [];
    const extraCodes = [...new Set(lines.flatMap((l) => l.extra.map((t) => t.code)))];
    for (const code of extraCodes) {
        const g = lines.flatMap((l) => l.extra.filter((t) => t.code === code));
        const per = g[0].perUnit !== undefined;
        subs.push({
            code, name: g[0].name, amount: r2(g.reduce((a, t) => a + t.amount, 0)),
            base: per ? undefined : r2(g.reduce((a, t) => a + t.base, 0)), pct: per ? undefined : g[0].pct, perUnit: per ? g[0].perUnit : undefined,
        });
    }
    const kdvKeys = [...new Set(lines.map((l) => `${l.pct}|${l.ex?.code ?? ''}`))];
    for (const key of kdvKeys) {
        const g = lines.filter((l) => `${l.pct}|${l.ex?.code ?? ''}` === key);
        subs.push({ ...KDV, base: r2(g.reduce((a, l) => a + l.kdvBase, 0)), amount: r2(g.reduce((a, l) => a + l.kdv, 0)), pct: g[0].pct, ex: g[0].ex });
    }
    if (d.stopaj) subs.push({ ...STOPAJ, base: net, amount: st, pct: d.stopaj });
    subs.forEach((s, i) => { s.seq = i + 1; });

    const notes = [yaziyla(payable, cur), ...(d.notes ?? [])];
    const node = e('Invoice', rootAttrs('Invoice'),
        head('Invoice', d),
        e('cbc:InvoiceTypeCode', d.type),
        notes.map((n) => e('cbc:Note', n)),
        e('cbc:DocumentCurrencyCode', cur),
        d.accountingCost && e('cbc:AccountingCost', d.accountingCost),
        e('cbc:LineCountNumeric', String(lines.length)),
        period(d.period),
        d.order && docRef('cac:OrderReference', d.order, d.date),
        d.billing && e('cac:BillingReference', docRef('cac:InvoiceDocumentReference', d.billing, d.date)),
        (d.despatch ?? []).map((x) => docRef('cac:DespatchDocumentReference', x, d.date)),
        (d.docs ?? []).map((x) => docRef('cac:AdditionalDocumentReference', x, d.date)),
        signature(d.supplier, d.id),
        e('cac:AccountingSupplierParty', party(d.supplier)),
        e('cac:AccountingCustomerParty', party(d.customer)),
        d.buyer && e('cac:BuyerCustomerParty', party(d.buyer)),
        d.taxRep && e('cac:TaxRepresentativeParty',
            d.taxRep.ids.map(([s, id]) => e('cac:PartyIdentification', e('cbc:ID', { schemeID: s }, id))),
            e('cac:PartyName', e('cbc:Name', d.taxRep.name)),
            address(d.taxRep.addr)),
        d.delivery && e('cac:Delivery',
            d.delivery.tracking && e('cbc:TrackingID', d.delivery.tracking),
            d.delivery.addr && e('cac:DeliveryAddress', address(d.delivery.addr).kids),
            d.delivery.carrier && party(d.delivery.carrier, 'cac:CarrierParty'),
            e('cac:Despatch', e('cbc:ActualDespatchDate', d.delivery.date), d.delivery.time && e('cbc:ActualDespatchTime', d.delivery.time))),
        paymentMeans(d.payment, cur),
        d.terms && e('cac:PaymentTerms', e('cbc:Note', d.terms)),
        cur !== 'TRY' && e('cac:PricingExchangeRate',
            e('cbc:SourceCurrencyCode', cur), e('cbc:TargetCurrencyCode', 'TRY'),
            e('cbc:CalculationRate', String(d.rate)), e('cbc:Date', d.date)),
        taxTotal(cur, subs),
        d.withholding && whTotal(cur, d.withholding, kdv, wh),
        e('cac:LegalMonetaryTotal',
            e('cbc:LineExtensionAmount', { currencyID: cur }, f2(gross)),
            e('cbc:TaxExclusiveAmount', { currencyID: cur }, f2(net)),
            e('cbc:TaxInclusiveAmount', { currencyID: cur }, f2(inclusive)),
            e('cbc:AllowanceTotalAmount', { currencyID: cur }, f2(disc)),
            e('cbc:PayableAmount', { currencyID: cur }, f2(payable))),
        lines.map((l) => e('cac:InvoiceLine',
            e('cbc:ID', String(l.no)),
            l.note && e('cbc:Note', l.note),
            e('cbc:InvoicedQuantity', { unitCode: l.unit ?? 'C62' }, fq(l.qty)),
            e('cbc:LineExtensionAmount', { currencyID: cur }, f2(l.net)),
            l.exp && e('cac:Delivery',
                e('cac:DeliveryAddress', address(l.exp.addr ?? d.buyer?.addr ?? d.customer.addr).kids),
                e('cac:DeliveryTerms', e('cbc:ID', { schemeID: 'INCOTERMS' }, l.exp.incoterm)),
                e('cac:Shipment',
                    e('cbc:ID'),
                    e('cac:GoodsItem', e('cbc:RequiredCustomsID', l.exp.gtip)),
                    e('cac:ShipmentStage', e('cbc:TransportModeCode', String(l.exp.mode))),
                    l.exp.pkg && e('cac:TransportHandlingUnit', e('cac:ActualPackage',
                        e('cbc:ID', l.exp.pkg[0]), e('cbc:Quantity', String(l.exp.pkg[1])), e('cbc:PackagingTypeCode', l.exp.pkg[2] ?? 'CT'))))),
            l.disc && e('cac:AllowanceCharge',
                e('cbc:ChargeIndicator', 'false'),
                e('cbc:AllowanceChargeReason', l.disc.reason),
                e('cbc:MultiplierFactorNumeric', String(l.disc.rate)),
                e('cbc:Amount', { currencyID: cur }, f2(l.da)),
                e('cbc:BaseAmount', { currencyID: cur }, f2(l.gross))),
            taxTotal(cur, [
                ...l.extra.map((t) => ({ ...t })),
                { ...KDV, base: l.kdvBase, amount: l.kdv, pct: l.pct, ex: l.ex },
            ].map((s, i) => ({ ...s, seq: i + 1 }))),
            d.withholding && !l.noWh && whTotal(cur, d.withholding, l.kdv, l.wh),
            item(l),
            e('cac:Price', e('cbc:PriceAmount', { currencyID: cur }, fq(l.price))))));
    return { xml: wrap(d.comment, node), totals: { gross, disc, net, kdv, wh, st, payable, extraTotal } };
}

/* ------------------------------------------------------------------ CreditNote */

/**
 * e-Müstahsil Makbuzu, e-Gider Pusulası ve e-Kıymetli Maden belgesi. Kesintiler (cuts: [{code, name, pct}]) brüt
 * tutar üzerinden hesaplanıp ödenecekten düşülür; satırda kdv verilirse KDV eklenir (gider pusulası iadesi).
 */
export function creditNote(d) {
    const cur = 'TRY';
    const lines = d.lines.map((l, i) => {
        const net = r2(l.qty * l.price);
        const pct = l.kdv ?? 0;
        const kdv = r2((net * pct) / 100);
        const cuts = (d.cuts ?? []).map((c) => ({ ...c, base: net, amount: r2((net * c.pct) / 100) }));
        return { ...l, no: i + 1, net, pct, kdv, cuts };
    });
    const net = r2(lines.reduce((a, l) => a + l.net, 0));
    const kdv = r2(lines.reduce((a, l) => a + l.kdv, 0));
    const subs = (d.cuts ?? []).map((c) => ({ ...c, base: net, amount: r2(lines.reduce((a, l) => a + l.cuts.find((x) => x.code === c.code).amount, 0)) }));
    const cutTotal = r2(subs.reduce((a, s) => a + s.amount, 0));
    const kdvKeys = [...new Set(lines.map((l) => l.pct))];
    const kdvSubs = d.kdvRow || kdv > 0
        ? kdvKeys.map((p) => {
            const g = lines.filter((l) => l.pct === p);
            return { ...KDV, base: r2(g.reduce((a, l) => a + l.net, 0)), amount: r2(g.reduce((a, l) => a + l.kdv, 0)), pct: p, ex: d.kdvRow };
        })
        : [];
    const all = [...kdvSubs, ...subs].map((s, i) => ({ ...s, seq: i + 1 }));
    const inclusive = r2(net + kdv);
    const payable = r2(inclusive - cutTotal);
    const notes = [yaziyla(payable, cur), ...(d.notes ?? [])];
    const node = e('CreditNote', rootAttrs('CreditNote'),
        head('CreditNote', d, 'TR1.2.1'),
        e('cbc:CreditNoteTypeCode', d.type),
        notes.map((n) => e('cbc:Note', n)),
        e('cbc:DocumentCurrencyCode', cur),
        e('cbc:LineCountNumeric', String(lines.length)),
        d.billing && e('cac:BillingReference', docRef('cac:InvoiceDocumentReference', d.billing, d.date)),
        (d.docs ?? []).map((x) => docRef('cac:AdditionalDocumentReference', x, d.date)),
        signature(d.supplier, d.id),
        e('cac:AccountingSupplierParty', party(d.supplier)),
        e('cac:AccountingCustomerParty', party(d.customer)),
        d.delivery && e('cac:Delivery',
            e('cbc:ActualDeliveryDate', d.delivery.date ?? d.date),
            d.delivery.carrier && party(d.delivery.carrier, 'cac:DeliveryParty')),
        paymentMeans(d.payment, cur),
        all.length > 0 && taxTotal(cur, all),
        e('cac:LegalMonetaryTotal',
            e('cbc:LineExtensionAmount', { currencyID: cur }, f2(net)),
            e('cbc:TaxExclusiveAmount', { currencyID: cur }, f2(net)),
            e('cbc:TaxInclusiveAmount', { currencyID: cur }, f2(inclusive)),
            e('cbc:PayableAmount', { currencyID: cur }, f2(payable))),
        lines.map((l) => e('cac:CreditNoteLine',
            e('cbc:ID', String(l.no)),
            l.note && e('cbc:Note', l.note),
            e('cbc:CreditedQuantity', { unitCode: l.unit ?? 'C62' }, fq(l.qty)),
            e('cbc:LineExtensionAmount', { currencyID: cur }, f2(l.net)),
            (l.cuts.length > 0 || l.kdv > 0 || d.kdvRow) && taxTotal(cur, [
                ...(l.kdv > 0 || d.kdvRow ? [{ ...KDV, base: l.net, amount: l.kdv, pct: l.pct, ex: d.kdvRow }] : []),
                ...l.cuts,
            ].map((s, i) => ({ ...s, seq: i + 1 }))),
            item(l),
            e('cac:Price', e('cbc:PriceAmount', { currencyID: cur }, fq(l.price))))));
    return { xml: wrap(d.comment, node), totals: { net, kdv, cut: cutTotal, payable } };
}

/* ------------------------------------------------------------------ DespatchAdvice */

/** e-İrsaliye; ship: { id, kg, units, value, plate, trailer, driver: [ad, soyad, tckn], carrier, addr, date, time }. */
export function despatch(d) {
    const s = d.ship;
    const node = e('DespatchAdvice', rootAttrs('DespatchAdvice'),
        head('DespatchAdvice', d, 'TR1.2.1'),
        e('cbc:DespatchAdviceTypeCode', 'SEVK'),
        (d.notes ?? []).map((n) => e('cbc:Note', n)),
        e('cbc:LineCountNumeric', String(d.lines.length)),
        d.order && docRef('cac:OrderReference', d.order, d.date),
        (d.docs ?? []).map((x) => docRef('cac:AdditionalDocumentReference', x, d.date)),
        signature(d.supplier, d.id),
        e('cac:DespatchSupplierParty', party(d.supplier), d.contact && e('cac:DespatchContact', e('cbc:Name', d.contact))),
        e('cac:DeliveryCustomerParty', party(d.customer)),
        d.buyer && e('cac:BuyerCustomerParty', party(d.buyer)),
        e('cac:Shipment',
            e('cbc:ID', s.id),
            s.kg && e('cbc:GrossWeightMeasure', { unitCode: 'KGM' }, s.kg.toFixed(3)),
            s.goods && e('cbc:TotalGoodsItemQuantity', String(s.goods)),
            s.units && e('cbc:TotalTransportHandlingUnitQuantity', String(s.units)),
            s.value && e('cac:GoodsItem', e('cbc:ValueAmount', { currencyID: 'TRY' }, f2(s.value))),
            e('cac:ShipmentStage',
                s.plate && e('cac:TransportMeans', e('cac:RoadTransport', e('cbc:LicensePlateID', { schemeID: 'PLAKA' }, s.plate))),
                s.driver && e('cac:DriverPerson',
                    e('cbc:FirstName', s.driver[0]), e('cbc:FamilyName', s.driver[1]), e('cbc:Title', 'Şoför'), e('cbc:NationalityID', s.driver[2]))),
            e('cac:Delivery',
                s.addr && e('cac:DeliveryAddress', address(s.addr).kids),
                s.carrier && party(s.carrier, 'cac:CarrierParty'),
                e('cac:Despatch', e('cbc:ActualDespatchDate', s.date), e('cbc:ActualDespatchTime', s.time))),
            s.trailer && e('cac:TransportHandlingUnit', e('cac:TransportEquipment', e('cbc:ID', { schemeID: 'DORSEPLAKA' }, s.trailer)))),
        d.lines.map((l, i) => e('cac:DespatchLine',
            e('cbc:ID', String(i + 1)),
            l.note && e('cbc:Note', l.note),
            e('cbc:DeliveredQuantity', { unitCode: l.unit ?? 'C62' }, fq(l.qty)),
            e('cac:OrderLineReference', e('cbc:LineID', String(i + 1))),
            item(l))));
    return { xml: wrap(d.comment, node), totals: {} };
}
