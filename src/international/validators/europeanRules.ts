/**
 * EN 16931 (UBL) iş kurallarının alt kümesi, Peppol BIS Billing 3.0 ve
 * XRechnung 3.0 ek kuralları, Peppol BIS Despatch Advice 3 zorunlu alanları.
 * Resmî Schematron'un yerini tutmaz; önizleme öncesi en sık hataları yakalar.
 */
import type { UiLanguage } from '../registry/countryProfiles';
import { ruleMessages, type RuleMessage, type RuleMessageKey } from './europeanRuleMessages';

export interface RuleIssue {
    /** Resmî kural kimliği (ör. BR-CO-15, PEPPOL-EN16931-R003, BR-DE-15). */
    rule: string;
    text: string;
}

const children = (el: Element, name: string) => Array.from(el.children).filter((c) => c.localName === name);

/** Yerel adlarla çocuk yolu: 'AccountingSupplierParty/Party/PostalAddress'. */
const all = (el: Element, path: string): Element[] =>
    path.split('/').reduce<Element[]>((cur, step) => cur.flatMap((e) => children(e, step)), [el]);
const text = (el: Element, path: string) => all(el, path)[0]?.textContent?.trim() ?? '';
const amount = (el: Element, path: string) => Number(text(el, path)) || 0;
const near = (a: number, b: number, tolerance = 0.01) => Math.abs(a - b) <= tolerance + 1e-9;
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const fmt = (n: number) => n.toFixed(2);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const vatId = (party: Element) =>
    all(party, 'PartyTaxScheme').find((s) => text(s, 'TaxScheme/ID') === 'VAT' && text(s, 'CompanyID'));
const otherTaxId = (party: Element) =>
    all(party, 'PartyTaxScheme').find((s) => text(s, 'TaxScheme/ID') !== 'VAT' && text(s, 'CompanyID'));

const EXEMPT_CATEGORIES = ['E', 'AE', 'K', 'G', 'O'];
const CREDIT_TRANSFER = ['30', '58'];
const CARD = ['48', '54', '55'];
const DIRECT_DEBIT = ['49', '59'];

const PEPPOL_BILLING_ID = 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0';
const XRECHNUNG_ID = 'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0';
const DESPATCH_CUSTOMIZATION = 'urn:fdc:peppol.eu:poacc:trns:despatch_advice:3';
const DESPATCH_PROFILE = 'urn:fdc:peppol.eu:poacc:bis:despatch_advice:3';

const collector = (m: RuleMessage) => {
    const issues: RuleIssue[] = [];
    const add = (rule: string, key: RuleMessageKey, params?: Record<string, string | number>) => issues.push({ rule, text: m(key, params) });
    return { issues, add };
};

/** EN 16931 çekirdek kuralları (UBL Invoice / CreditNote). */
function en16931Issues(root: Element, m: RuleMessage): RuleIssue[] {
    const { issues, add } = collector(m);
    const credit = root.localName === 'CreditNote';
    const lineTag = credit ? 'CreditNoteLine' : 'InvoiceLine';
    const qtyTag = credit ? 'CreditedQuantity' : 'InvoicedQuantity';

    if (!text(root, 'CustomizationID')) add('BR-01', 'BR-01');
    if (!text(root, 'ID')) add('BR-02', 'BR-02');
    const issueDate = text(root, 'IssueDate');
    if (!issueDate) add('BR-03', 'BR-03');
    else if (!ISO_DATE.test(issueDate)) add('BR-03', 'issueDateFormat', { date: issueDate });
    if (!text(root, credit ? 'CreditNoteTypeCode' : 'InvoiceTypeCode')) add('BR-04', 'BR-04');
    const currency = text(root, 'DocumentCurrencyCode');
    if (!currency) add('BR-05', 'BR-05');

    const seller = all(root, 'AccountingSupplierParty/Party')[0];
    const buyer = all(root, 'AccountingCustomerParty/Party')[0];
    if (!seller || !text(seller, 'PartyLegalEntity/RegistrationName')) add('BR-06', 'BR-06');
    if (!buyer || !text(buyer, 'PartyLegalEntity/RegistrationName')) add('BR-07', 'BR-07');
    if (!seller || !all(seller, 'PostalAddress').length) add('BR-08', 'BR-08');
    else if (!text(seller, 'PostalAddress/Country/IdentificationCode')) add('BR-09', 'BR-09');
    if (!buyer || !all(buyer, 'PostalAddress').length) add('BR-10', 'BR-10');
    else if (!text(buyer, 'PostalAddress/Country/IdentificationCode')) add('BR-11', 'BR-11');

    const totals = all(root, 'LegalMonetaryTotal')[0];
    const total = (tag: string) => (totals ? text(totals, tag) : '');
    if (!total('LineExtensionAmount')) add('BR-12', 'BR-12');
    if (!total('TaxExclusiveAmount')) add('BR-13', 'BR-13');
    if (!total('TaxInclusiveAmount')) add('BR-14', 'BR-14');
    if (!total('PayableAmount')) add('BR-15', 'BR-15');

    const lines = children(root, lineTag);
    if (!lines.length) add('BR-16', 'BR-16', { tag: lineTag });
    const lineProblems = new Map<'BR-21' | 'BR-22' | 'BR-23' | 'BR-24' | 'BR-25' | 'BR-26' | 'BR-CO-04', string[]>();
    const flag = (rule: Parameters<typeof lineProblems.set>[0], id: string) => lineProblems.set(rule, [...(lineProblems.get(rule) ?? []), id || '?']);
    for (const line of lines) {
        const id = text(line, 'ID');
        if (!id) flag('BR-21', id);
        const qty = all(line, qtyTag)[0];
        if (!qty?.textContent?.trim()) flag('BR-22', id);
        else if (!qty.getAttribute('unitCode')) flag('BR-23', id);
        if (!text(line, 'LineExtensionAmount')) flag('BR-24', id);
        if (!text(line, 'Item/Name')) flag('BR-25', id);
        if (!text(line, 'Price/PriceAmount')) flag('BR-26', id);
        if (!text(line, 'Item/ClassifiedTaxCategory/ID')) flag('BR-CO-04', id);
    }
    for (const [rule, ids] of lineProblems) add(rule, 'onLines', { text: m(rule, { tag: qtyTag }), ids: ids.slice(0, 4).join(', ') });

    const docAc = children(root, 'AllowanceCharge');
    const isCharge = (ac: Element) => text(ac, 'ChargeIndicator') === 'true';
    const allowances = docAc.filter((ac) => !isCharge(ac)).reduce((t, ac) => t + amount(ac, 'Amount'), 0);
    const charges = docAc.filter(isCharge).reduce((t, ac) => t + amount(ac, 'Amount'), 0);
    for (const ac of docAc) {
        if (!text(ac, 'TaxCategory/ID')) {
            if (isCharge(ac)) add('BR-37', 'chargeCategory');
            else add('BR-32', 'allowanceCategory');
        }
        if (!text(ac, 'AllowanceChargeReason') && !text(ac, 'AllowanceChargeReasonCode')) {
            if (isCharge(ac)) add('BR-38', 'chargeReason');
            else add('BR-33', 'allowanceReason');
        }
    }

    if (totals && lines.length) {
        const lineSum = lines.reduce((t, l) => t + amount(l, 'LineExtensionAmount'), 0);
        const declared = Number(total('LineExtensionAmount')) || 0;
        if (!near(round2(lineSum), declared)) add('BR-CO-10', 'BR-CO-10', { sum: fmt(lineSum), declared: fmt(declared) });
        if (docAc.length || total('AllowanceTotalAmount')) {
            if (!near(allowances, Number(total('AllowanceTotalAmount')) || 0)) {
                add('BR-CO-11', 'BR-CO-11', { sum: fmt(allowances), declared: total('AllowanceTotalAmount') || m('empty') });
            }
        }
        if (docAc.length || total('ChargeTotalAmount')) {
            if (!near(charges, Number(total('ChargeTotalAmount')) || 0)) {
                add('BR-CO-12', 'BR-CO-12', { sum: fmt(charges), declared: total('ChargeTotalAmount') || m('empty') });
            }
        }
        const taxExcl = Number(total('TaxExclusiveAmount')) || 0;
        const expectedExcl = declared - (Number(total('AllowanceTotalAmount')) || 0) + (Number(total('ChargeTotalAmount')) || 0);
        if (!near(taxExcl, expectedExcl)) add('BR-CO-13', 'BR-CO-13', { value: fmt(taxExcl), lines: fmt(declared), expected: fmt(expectedExcl) });
    }

    const vatTotals = children(root, 'TaxTotal');
    const vatTotal = vatTotals.find((t) => children(t, 'TaxSubtotal').length) ?? null;
    const subtotals = vatTotal ? children(vatTotal, 'TaxSubtotal') : [];
    if (!subtotals.length) add('BR-CO-18', 'BR-CO-18');
    if (vatTotal && subtotals.length) {
        const sum = subtotals.reduce((t, s) => t + amount(s, 'TaxAmount'), 0);
        if (!near(round2(sum), amount(vatTotal, 'TaxAmount'))) add('BR-CO-14', 'BR-CO-14', { value: text(vatTotal, 'TaxAmount'), sum: fmt(sum) });
    }
    for (const s of subtotals) {
        const cat = text(s, 'TaxCategory/ID');
        const rate = Number(text(s, 'TaxCategory/Percent')) || 0;
        const expected = round2(amount(s, 'TaxableAmount') * rate / 100);
        if (!near(expected, amount(s, 'TaxAmount'))) {
            add('BR-CO-17', 'BR-CO-17', { cat, rate, value: text(s, 'TaxAmount'), base: text(s, 'TaxableAmount'), expected: fmt(expected) });
        }
        if (EXEMPT_CATEGORIES.includes(cat) && !text(s, 'TaxCategory/TaxExemptionReason') && !text(s, 'TaxCategory/TaxExemptionReasonCode')) {
            add(`BR-${cat === 'K' ? 'IC' : cat}-10`, 'exemptionReason', { cat });
        }
    }

    // BR-S-08 benzeri: her kategori/oran için matrah = kalemler − indirimler + masraflar.
    const key = (cat: string, rate: string) => `${cat}|${Number(rate) || 0}`;
    const base = new Map<string, number>();
    const addBase = (k: string, v: number) => base.set(k, (base.get(k) ?? 0) + v);
    for (const l of lines) addBase(key(text(l, 'Item/ClassifiedTaxCategory/ID'), text(l, 'Item/ClassifiedTaxCategory/Percent')), amount(l, 'LineExtensionAmount'));
    for (const ac of docAc) addBase(key(text(ac, 'TaxCategory/ID'), text(ac, 'TaxCategory/Percent')), isCharge(ac) ? amount(ac, 'Amount') : -amount(ac, 'Amount'));
    for (const s of subtotals) {
        const k = key(text(s, 'TaxCategory/ID'), text(s, 'TaxCategory/Percent'));
        const expected = round2(base.get(k) ?? 0);
        if (!near(expected, amount(s, 'TaxableAmount'))) {
            const [cat, rate] = k.split('|');
            add(`BR-${cat === 'K' ? 'IC' : cat}-08`, 'taxableAmount', { cat, rate, value: text(s, 'TaxableAmount'), expected: fmt(expected) });
        }
    }
    const declaredKeys = new Set(subtotals.map((s) => key(text(s, 'TaxCategory/ID'), text(s, 'TaxCategory/Percent'))));
    for (const k of base.keys()) {
        if (!declaredKeys.has(k) && subtotals.length) {
            const [cat, rate] = k.split('|');
            add('BR-CO-18', 'missingBreakdown', { cat, rate });
        }
    }

    if (totals && vatTotal) {
        const expectedIncl = (Number(total('TaxExclusiveAmount')) || 0) + amount(vatTotal, 'TaxAmount');
        if (!near(Number(total('TaxInclusiveAmount')) || 0, expectedIncl)) add('BR-CO-15', 'BR-CO-15', { value: total('TaxInclusiveAmount'), expected: fmt(expectedIncl) });
    }
    if (totals) {
        const expectedPay = (Number(total('TaxInclusiveAmount')) || 0) - (Number(total('PrepaidAmount')) || 0) + (Number(total('PayableRoundingAmount')) || 0);
        if (!near(Number(total('PayableAmount')) || 0, expectedPay)) add('BR-CO-16', 'BR-CO-16', { value: total('PayableAmount'), expected: fmt(expectedPay) });
        if ((Number(total('PayableAmount')) || 0) > 0 && !text(root, 'DueDate') && !text(root, 'PaymentTerms/Note')) add('BR-CO-25', 'BR-CO-25');
    }

    const categories = new Set([...lines.map((l) => text(l, 'Item/ClassifiedTaxCategory/ID')), ...subtotals.map((s) => text(s, 'TaxCategory/ID'))]);
    const needsSellerVat = ['S', 'Z', 'E', 'AE', 'K', 'G'].filter((c) => categories.has(c));
    if (seller && needsSellerVat.length && !vatId(seller) && !all(root, 'TaxRepresentativeParty').length) {
        add(`BR-${needsSellerVat[0] === 'K' ? 'IC' : needsSellerVat[0]}-02`, 'sellerVat', { cats: needsSellerVat.join(', ') });
    }
    if (buyer && (categories.has('AE') || categories.has('K')) && !vatId(buyer)) {
        add(categories.has('AE') ? 'BR-AE-02' : 'BR-IC-02', 'buyerVat');
    }

    for (const pm of children(root, 'PaymentMeans')) {
        const code = text(pm, 'PaymentMeansCode');
        if (!code) add('BR-49', 'BR-49');
        if (CREDIT_TRANSFER.includes(code) && !text(pm, 'PayeeFinancialAccount/ID')) add('BR-50', 'BR-50');
    }

    if (currency) {
        const bad = Array.from(root.getElementsByTagName('*')).find((e) => {
            const c = e.getAttribute('currencyID');
            return c && c !== currency && !(e.localName === 'TaxAmount' && e.parentElement?.localName === 'TaxTotal');
        });
        if (bad) add('BR-CL-03', 'BR-CL-03', { element: bad.localName, found: bad.getAttribute('currencyID') ?? '', currency });
    }
    return issues;
}

/** Peppol BIS Billing 3.0 ek kuralları. */
function peppolIssues(root: Element, strictCustomization: boolean, m: RuleMessage): RuleIssue[] {
    const { issues, add } = collector(m);
    const customization = text(root, 'CustomizationID');
    if (strictCustomization && !customization.startsWith(PEPPOL_BILLING_ID)) {
        add('PEPPOL-EN16931-R004', 'mustEqual', { field: 'CustomizationID', value: PEPPOL_BILLING_ID });
    }
    if (!text(root, 'ProfileID')) add('PEPPOL-EN16931-R001', 'PEPPOL-EN16931-R001');
    if (!text(root, 'BuyerReference') && !text(root, 'OrderReference/ID')) add('PEPPOL-EN16931-R003', 'PEPPOL-EN16931-R003');
    const endpoint = (path: string) => all(root, `${path}/Party/EndpointID`)[0];
    const sellerEp = endpoint('AccountingSupplierParty');
    const buyerEp = endpoint('AccountingCustomerParty');
    if (!sellerEp?.textContent?.trim()) add('PEPPOL-EN16931-R020', 'sellerEndpoint');
    else if (!sellerEp.getAttribute('schemeID')) add('PEPPOL-EN16931-R020', 'sellerScheme');
    if (!buyerEp?.textContent?.trim()) add('PEPPOL-EN16931-R010', 'buyerEndpoint');
    else if (!buyerEp.getAttribute('schemeID')) add('PEPPOL-EN16931-R010', 'buyerScheme');

    for (const ac of children(root, 'AllowanceCharge')) {
        const pct = text(ac, 'MultiplierFactorNumeric');
        const baseAmount = text(ac, 'BaseAmount');
        if (pct && baseAmount && !near(round2(Number(baseAmount) * Number(pct) / 100), amount(ac, 'Amount'))) {
            add('PEPPOL-EN16931-R040', 'PEPPOL-EN16931-R040', { value: text(ac, 'Amount'), base: baseAmount, pct, expected: fmt(Number(baseAmount) * Number(pct) / 100) });
        }
    }
    const credit = root.localName === 'CreditNote';
    for (const line of children(root, credit ? 'CreditNoteLine' : 'InvoiceLine')) {
        const qty = Number(text(line, credit ? 'CreditedQuantity' : 'InvoicedQuantity')) || 0;
        const price = Number(text(line, 'Price/PriceAmount')) || 0;
        const baseQty = Number(text(line, 'Price/BaseQuantity')) || 1;
        const lineAc = children(line, 'AllowanceCharge').reduce((t, ac) => t + (text(ac, 'ChargeIndicator') === 'true' ? 1 : -1) * amount(ac, 'Amount'), 0);
        const expected = round2(qty * price / baseQty + lineAc);
        if (!near(expected, amount(line, 'LineExtensionAmount'), 0.02)) {
            add('PEPPOL-EN16931-R120', 'PEPPOL-EN16931-R120', { id: text(line, 'ID'), value: text(line, 'LineExtensionAmount'), expected: fmt(expected) });
        }
    }
    return issues;
}

/** XRechnung 3.0 (KoSIT) BR-DE kuralları. */
function xrechnungIssues(root: Element, m: RuleMessage): RuleIssue[] {
    const { issues, add } = collector(m);
    if (!text(root, 'CustomizationID').includes('urn:xeinkauf.de:kosit:xrechnung_3')) {
        add('BR-DE-21', 'mustEqual', { field: 'CustomizationID', value: XRECHNUNG_ID });
    }
    if (!text(root, 'BuyerReference')) add('BR-DE-15', 'BR-DE-15');
    const seller = all(root, 'AccountingSupplierParty/Party')[0];
    const buyer = all(root, 'AccountingCustomerParty/Party')[0];
    if (seller) {
        if (!text(seller, 'PostalAddress/CityName')) add('BR-DE-3', 'BR-DE-3');
        if (!text(seller, 'PostalAddress/PostalZone')) add('BR-DE-4', 'BR-DE-4');
        const contact = all(seller, 'Contact')[0];
        if (!contact) add('BR-DE-2', 'BR-DE-2');
        else {
            if (!text(contact, 'Name')) add('BR-DE-5', 'BR-DE-5');
            if (!text(contact, 'Telephone')) add('BR-DE-6', 'BR-DE-6');
            if (!text(contact, 'ElectronicMail')) add('BR-DE-7', 'BR-DE-7');
        }
        if (!vatId(seller) && !otherTaxId(seller)) add('BR-DE-16', 'BR-DE-16');
        if (!text(seller, 'EndpointID')) add('XRechnung 3.0', 'sellerEndpointBt34');
    }
    if (buyer) {
        if (!text(buyer, 'PostalAddress/CityName')) add('BR-DE-8', 'BR-DE-8');
        if (!text(buyer, 'PostalAddress/PostalZone')) add('BR-DE-9', 'BR-DE-9');
        if (!text(buyer, 'EndpointID')) add('XRechnung 3.0', 'buyerEndpointBt49');
    }
    const means = children(root, 'PaymentMeans');
    if (!means.length) add('BR-DE-1', 'BR-DE-1');
    for (const pm of means) {
        const code = text(pm, 'PaymentMeansCode');
        if (CREDIT_TRANSFER.includes(code) && !text(pm, 'PayeeFinancialAccount/ID')) add('BR-DE-23-a', 'BR-DE-23-a');
        if (CARD.includes(code) && !text(pm, 'CardAccount/PrimaryAccountNumberID')) add('BR-DE-24-a', 'BR-DE-24-a');
        if (DIRECT_DEBIT.includes(code) && (!text(pm, 'PaymentMandate/ID') || !text(pm, 'PaymentMandate/PayerFinancialAccount/ID'))) {
            add('BR-DE-25', 'BR-DE-25');
        }
    }
    return issues;
}

/** Seçilen fatura profiline göre kural sonuçları; mesajlar `lang` dilinde. */
export function europeanInvoiceIssues(root: Element, profileId: string, lang: UiLanguage = 'tr'): RuleIssue[] {
    const m = ruleMessages(lang);
    const issues = en16931Issues(root, m);
    if (profileId === 'peppol-bis-billing-3') issues.push(...peppolIssues(root, true, m));
    if (profileId === 'de-xrechnung-ubl') issues.push(...peppolIssues(root, false, m).filter((i) => i.rule !== 'PEPPOL-EN16931-R004'), ...xrechnungIssues(root, m));
    return issues;
}

/** Peppol BIS Despatch Advice 3 zorunlu alanları ve tutarlılık kontrolleri. */
export function peppolDespatchIssues(root: Element, lang: UiLanguage = 'tr'): RuleIssue[] {
    const m = ruleMessages(lang);
    const { issues, add: addRule } = collector(m);
    const rule = 'Peppol DA 3';
    const add = (key: RuleMessageKey, params?: Record<string, string | number>) => addRule(rule, key, params);
    if (text(root, 'CustomizationID') !== DESPATCH_CUSTOMIZATION) add('mustEqual', { field: 'CustomizationID', value: DESPATCH_CUSTOMIZATION });
    if (text(root, 'ProfileID') !== DESPATCH_PROFILE) add('mustEqual', { field: 'ProfileID', value: DESPATCH_PROFILE });
    if (!text(root, 'ID')) add('despatchId');
    if (!ISO_DATE.test(text(root, 'IssueDate'))) add('despatchIssueDate');
    for (const [path, labelKey] of [['DespatchSupplierParty', 'despatchParty'], ['DeliveryCustomerParty', 'deliveryParty']] as const) {
        const party = all(root, `${path}/Party`)[0];
        const label = m(labelKey);
        if (!party) {
            add('partyMissing', { party: label, path });
            continue;
        }
        const ep = all(party, 'EndpointID')[0];
        if (!ep?.textContent?.trim() || !ep.getAttribute('schemeID')) add('partyEndpoint', { party: label });
        if (!text(party, 'PartyLegalEntity/RegistrationName') && !text(party, 'PartyName/Name')) add('partyName', { party: label });
    }
    const shipment = all(root, 'Shipment')[0];
    if (!shipment) add('shipment');
    else if (!text(shipment, 'ID')) add('shipmentId');
    const lines = children(root, 'DespatchLine');
    if (!lines.length) add('despatchLines');
    const missing = (pred: (l: Element) => boolean) => lines.filter(pred).map((l) => text(l, 'ID') || '?');
    const noQty = missing((l) => !text(l, 'DeliveredQuantity') || !all(l, 'DeliveredQuantity')[0]?.getAttribute('unitCode'));
    if (noQty.length) add('deliveredQuantity', { ids: noQty.join(', ') });
    const noName = missing((l) => !text(l, 'Item/Name'));
    if (noName.length) add('itemName', { ids: noName.join(', ') });
    const noOrderLine = missing((l) => !text(l, 'OrderLineReference/LineID'));
    if (noOrderLine.length) add('orderLine', { ids: noOrderLine.join(', ') });
    const noReason = missing((l) => Number(text(l, 'BackorderQuantity')) > 0 && !text(l, 'BackorderReason'));
    if (noReason.length) add('backorderReason', { ids: noReason.join(', ') });
    const badGtin = lines.flatMap((l) => all(l, 'Item/StandardItemIdentification/ID'))
        .filter((e) => e.getAttribute('schemeID') === '0160' && !/^\d{8}$|^\d{12,14}$/.test(e.textContent?.trim() ?? ''))
        .map((e) => e.textContent?.trim() ?? '');
    if (badGtin.length) add('gtin', { values: badGtin.join(', ') });
    return issues;
}
