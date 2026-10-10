/**
 * EN 16931 fatura tasarımları (Invoice + CreditNote). Her tasarım temel şablonun
 * etiket / biçim kütüphanesini (30 belge dili) kullanır; yalnız sayfa düzeni ve CSS
 * farklıdır. Başlık, belge türü kodundan (380/381/384/386/326/389) otomatik gelir.
 */
import type { IntlDocKind } from '../docText/types';
import {
    ALLOWANCES, BANK, BASE_CSS, DUE, FOOTER, HAS_DUE, ID, INFO_STRIP, NOTES, PARTIES, PAYABLE, PAYABLE_AMOUNT,
    PAYMENT, PAYMENT_DETAILS, PRECEDING_LIST, PROFILE, PROLOGUE, SELLER_LINE, TITLE,
    address, date, lines, metaCells, metaRows, partyCard, partyIds, partyName, section, t, totals, vatTable,
} from './blocks';

export interface InvoiceDesign {
    id: string;
    /** Sihirbaz kartı / önizleme vurgu rengi. */
    accent: string;
    /** Öne çıkarıldığı belge türleri (sihirbazda listenin başına alınır). */
    recommended?: IntlDocKind[];
    css: string;
    body: string;
}

const summary = (left: string, right: string) =>
    `<table class="summary"><tr><td class="sl">${left}</td><td class="sr">${right}</td></tr></table>`;

const minimal: InvoiceDesign = {
    id: 'minimal', accent: '#18181b',
    css: `
html, body { background: #f4f4f5; color: #18181b; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; }
.page { padding: 48px 52px 30px; }
.hd { width: 100%; }
.hd td { vertical-align: bottom; }
.seller-name { font-size: 15px; font-weight: bold; }
.profile { color: #71717a; font-size: 9px; margin-top: 4px; letter-spacing: .8px; text-transform: uppercase; }
h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
.doc-no { color: #52525b; margin-top: 3px; font-size: 12px; }
.rule { border-top: 1px solid #18181b; margin: 18px 0 14px; }
.metas td.m { padding: 0 28px 0 0; }
.mk { color: #71717a; font-size: 9px; text-transform: uppercase; letter-spacing: .6px; }
.mv { font-weight: bold; margin-top: 2px; }
.parties { margin-top: 24px; }
.parties td.pc { padding-right: 24px; }
.party-label { color: #71717a; font-size: 9px; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 6px; }
.party-name { font-size: 13px; margin-bottom: 3px; }
.party-line, .ids td { color: #3f3f46; }
.info-strip { margin-top: 16px; color: #3f3f46; }
.section-title { margin: 26px 0 6px; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; }
.lines th { font-size: 9px; text-transform: uppercase; letter-spacing: .5px; color: #71717a; font-weight: normal; padding: 6px 8px; border-bottom: 1px solid #18181b; }
.lines td { padding: 8px; border-bottom: 1px solid #e4e4e7; }
.summary { margin-top: 8px; }
.summary td.sr { padding-top: 26px; }
.pay-box { color: #3f3f46; }
.payable { margin-top: 8px; padding-top: 10px; border-top: 2px solid #18181b; }
.payable .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; }
.payable .amount { font-size: 22px; font-weight: bold; text-align: right; }
.footer { margin-top: 34px; padding-top: 10px; border-top: 1px solid #e4e4e7; color: #a1a1aa; font-size: 9px; line-height: 1.6; }
`,
    body: `<table class="hd"><tr>
<td><div class="seller-name">${partyName('$seller')}</div><div class="profile">${PROFILE}</div></td>
<td class="r"><h1>${TITLE}</h1><div class="doc-no">${ID}</div></td>
</tr></table>
<div class="rule"></div>
<table class="metas"><tr>${metaCells()}</tr></table>
${PARTIES}
${INFO_STRIP}
${section('lines')}
${lines()}
${ALLOWANCES}
${summary(`${section('vatBreakdown')}${vatTable()}${PAYMENT}${NOTES}`, `${totals()}${PAYABLE}`)}
${FOOTER}`,
};

const corporate: InvoiceDesign = {
    id: 'corporate', accent: '#0b2545',
    css: `
html, body { background: #e9edf3; color: #1b2636; }
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11.5px; }
.band { background: #0b2545; color: #fff; padding: 30px 40px 26px; }
.band-t { width: 100%; }
.band-t td { vertical-align: top; }
.co { font-size: 20px; font-weight: bold; letter-spacing: .3px; }
.co-line { margin-top: 6px; color: #8da9c4; font-size: 10.5px; }
.title { font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
.no { margin-top: 4px; color: #c9d6e6; font-size: 13px; }
.strip { background: #13315c; color: #fff; padding: 12px 40px; }
.metas td.m { padding-right: 30px; }
.mk { color: #8da9c4; font-size: 9px; text-transform: uppercase; letter-spacing: .6px; }
.mv { font-weight: bold; margin-top: 2px; }
.content { padding: 24px 40px 10px; }
.parties { border-collapse: separate; border-spacing: 0; }
.parties td.pc-seller { padding-right: 9px; }
.parties td.pc-buyer { padding-left: 9px; }
.party { border-left: 4px solid #13315c; background: #f4f7fb; padding: 14px 16px; }
.party-label { color: #13315c; font-size: 9.5px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
.party-name { font-size: 14px; margin-bottom: 3px; }
.party-line, .ids td { color: #46556b; }
.info-strip { margin-top: 14px; padding: 9px 14px; background: #f4f7fb; color: #46556b; }
.section-title { margin: 18px 0 7px; font-size: 11px; font-weight: bold; color: #0b2545; text-transform: uppercase; letter-spacing: .8px; }
.lines th { background: #0b2545; color: #fff; font-size: 9.5px; text-transform: uppercase; letter-spacing: .4px; padding: 8px 10px; }
.lines td { padding: 8px 10px; border-bottom: 1px solid #dde3ec; }
.lines tbody tr:nth-child(even) td { background: #f7f9fc; }
.summary { margin-top: 6px; }
.totals td { border-bottom: 1px solid #dde3ec; }
.summary td.sr { padding-top: 34px; }
.payable { margin-top: 12px; padding: 14px 16px; background: #0b2545; color: #fff; }
.payable .label { font-size: 9.5px; letter-spacing: 1px; text-transform: uppercase; color: #8da9c4; font-weight: bold; }
.payable .amount { margin-top: 4px; font-size: 22px; font-weight: bold; text-align: right; }
.pay-box { padding: 12px 14px; border: 1px solid #dde3ec; color: #46556b; }
.footer { margin-top: 20px; padding: 12px 40px 22px; background: #f4f7fb; color: #6b7a90; font-size: 9px; line-height: 1.6; }
`,
    body: `<div class="band"><table class="band-t"><tr>
<td><div class="co">${partyName('$seller')}</div><div class="co-line">${SELLER_LINE}</div></td>
<td class="r"><div class="title">${TITLE}</div><div class="no">${ID}</div></td>
</tr></table></div>
<div class="strip"><table class="metas"><tr>${metaCells()}</tr></table></div>
<div class="content">
${PARTIES}
${INFO_STRIP}
${section('lines')}
${lines()}
${ALLOWANCES}
${summary(`${section('vatBreakdown')}${vatTable()}`, `${totals()}${PAYABLE}`)}
${summary(PAYMENT, NOTES)}
</div>
${FOOTER}`,
};

const sidebar: InvoiceDesign = {
    id: 'sidebar', accent: '#115e59',
    css: `
html, body { background: #e6eeed; color: #1f2d2c; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
.frame { width: 100%; table-layout: fixed; }
.side { width: 226px; vertical-align: top; background: #115e59; color: #e6f4f1; padding: 34px 22px; min-height: 1123px; height: 1123px; }
.main { vertical-align: top; padding: 34px 30px 20px; }
.profile { display: inline-block; padding: 3px 9px; border: 1px solid #5eead4; border-radius: 999px; font-size: 9px; letter-spacing: .6px; text-transform: uppercase; color: #99f6e4; }
h1 { margin: 14px 0 4px; font-size: 24px; line-height: 1.15; color: #fff; }
.no { font-size: 13px; font-weight: bold; color: #ccfbf1; margin-bottom: 18px; }
.meta { width: 100%; }
.meta td { display: block; padding: 0; }
.meta .key { margin-top: 10px; color: #99f6e4; font-size: 9px; text-transform: uppercase; letter-spacing: .6px; }
.meta .value { font-weight: bold; color: #fff; }
.side-pay { margin-top: 24px; padding: 14px; background: rgba(255,255,255,.1); border-radius: 10px; }
.side-pay .label { color: #99f6e4; font-size: 9px; text-transform: uppercase; letter-spacing: .8px; font-weight: bold; }
.side-pay .amount { margin-top: 4px; font-size: 19px; font-weight: bold; color: #fff; }
.side .section-title { color: #99f6e4; margin: 22px 0 6px; font-size: 9px; text-transform: uppercase; letter-spacing: .8px; font-weight: bold; }
.side .pay-box { color: #e6f4f1; font-size: 10.5px; word-break: break-all; }
.side .pay-box b { color: #fff; }
.parties td.pc-seller { padding-right: 8px; }
.parties td.pc-buyer { padding-left: 8px; }
.parties { border-bottom: 2px solid #115e59; }
.party { padding: 0 0 12px; }
.party-label { color: #0f766e; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.party-name { font-size: 13px; margin-bottom: 3px; }
.party-line, .ids td { color: #4b5c5a; }
.ids td:first-child { width: 96px; }
.info-strip { margin-top: 12px; color: #4b5c5a; }
.main .section-title { margin: 22px 0 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: .8px; color: #115e59; }
.lines th { font-size: 9px; text-transform: uppercase; color: #0f766e; padding: 6px 6px; border-bottom: 2px solid #115e59; }
.lines td { padding: 7px 6px; border-bottom: 1px solid #e2e8e7; }
.tot-wrap { width: 100%; margin-top: 14px; }
.tot-wrap td.tw { width: 290px; vertical-align: top; }
.totals tr.grand td { padding-top: 9px; border-top: 2px solid #115e59; font-size: 15px; color: #115e59; font-weight: bold; }
.footer { margin-top: 26px; padding-top: 10px; border-top: 1px solid #e2e8e7; color: #7b8c8a; font-size: 9px; line-height: 1.6; }
`,
    body: `<table class="frame"><tr>
<td class="side">
<span class="profile">${PROFILE}</span>
<h1>${TITLE}</h1>
<div class="no">${ID}</div>
<table class="meta">${metaRows()}</table>
<div class="side-pay"><div class="label">${t('payable')}</div><div class="amount">${PAYABLE_AMOUNT}</div></div>
${PAYMENT}
</td>
<td class="main">
${PARTIES}
${INFO_STRIP}
${section('lines')}
${lines([26, 66, 72, 42, 80])}
${ALLOWANCES}
${section('vatBreakdown')}
${vatTable([46, 96, 86])}
<table class="tot-wrap"><tr><td></td><td class="tw">${totals({ grand: true })}</td></tr></table>
${NOTES}
${FOOTER}
</td>
</tr></table>`,
};

const elegant: InvoiceDesign = {
    id: 'elegant', accent: '#a07d3c',
    css: `
html, body { background: #efe9dd; color: #2b2622; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 11.5px; }
.page { background: #fffdf8; padding: 46px 56px 30px; }
.masthead { text-align: center; }
.co { font-size: 19px; letter-spacing: 4px; text-transform: uppercase; }
.co-line { margin-top: 6px; color: #7a6f63; font-size: 10.5px; font-style: italic; }
.double { margin: 18px auto 16px; width: 100%; height: 5px; border-top: 1px solid #a07d3c; border-bottom: 1px solid #a07d3c; }
h1 { margin: 0; font-size: 26px; font-weight: normal; font-variant: small-caps; letter-spacing: 3px; color: #2b2622; }
.no { margin-top: 4px; color: #a07d3c; font-size: 13px; letter-spacing: 1px; }
.metas { margin: 18px auto 0; }
.metas td.m { padding: 0 16px; text-align: center; border-right: 1px solid #e6dcc8; }
.mk { color: #a07d3c; font-size: 9.5px; font-style: italic; }
.mv { margin-top: 2px; }
.parties { margin-top: 28px; }
.parties td.pc { padding: 0 18px; }
.party-label { color: #a07d3c; font-style: italic; font-size: 11px; margin-bottom: 6px; border-bottom: 1px solid #e6dcc8; padding-bottom: 4px; }
.party-name { font-size: 14px; margin-bottom: 3px; }
.party-line, .ids td { color: #5c534a; }
.info-strip { margin-top: 18px; text-align: center; color: #5c534a; font-style: italic; }
.section-title { margin: 28px 0 8px; text-align: center; color: #a07d3c; font-size: 12px; font-variant: small-caps; letter-spacing: 2px; }
.lines th { font-weight: normal; font-style: italic; color: #7a6f63; padding: 6px 8px; border-top: 1px solid #a07d3c; border-bottom: 1px solid #a07d3c; }
.lines td { padding: 8px; border-bottom: 1px dotted #d8ccb4; }
.summary { margin-top: 6px; }
.summary td.sr { padding-top: 44px; }
.pay-box { color: #5c534a; }
.payable { margin-top: 10px; padding: 10px 0 0; border-top: 3px double #a07d3c; }
.payable .label { font-style: italic; color: #a07d3c; }
.payable .amount { font-size: 22px; text-align: right; }
.footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e6dcc8; text-align: center; color: #9c9184; font-size: 9px; line-height: 1.6; font-style: italic; }
`,
    body: `<div class="masthead">
<div class="co">${partyName('$seller')}</div>
<div class="co-line">${SELLER_LINE}</div>
<div class="double"></div>
<h1>${TITLE}</h1>
<div class="no">${ID}</div>
<table class="metas"><tr>${metaCells()}</tr></table>
</div>
${PARTIES}
${INFO_STRIP}
${section('lines')}
${lines()}
${ALLOWANCES}
${summary(`${section('vatBreakdown')}${vatTable()}${PAYMENT}${NOTES}`, `${totals()}${PAYABLE}`)}
${FOOTER}`,
};

const compact: InvoiceDesign = {
    id: 'compact', accent: '#4338ca',
    css: `
html, body { background: #eef0f6; color: #1e2235; }
body { font-family: Tahoma, Verdana, Arial, sans-serif; font-size: 10px; }
.page { padding: 26px 30px 18px; }
.hd { width: 100%; border-bottom: 3px solid #4338ca; }
.hd td { vertical-align: top; padding-bottom: 10px; }
h1 { margin: 0; font-size: 20px; color: #4338ca; }
.no { margin-top: 3px; font-weight: bold; }
.profile { color: #6b7090; font-size: 9px; margin-top: 2px; }
.meta { float: right; }
.meta td { padding: 1px 0 1px 12px; }
.meta .key { color: #6b7090; }
.meta .value { font-weight: bold; text-align: right; }
.trio { width: 100%; table-layout: fixed; margin-top: 12px; border-collapse: separate; border-spacing: 6px 0; }
.trio td.tc { vertical-align: top; border: 1px solid #d9dcea; padding: 9px 10px; }
.party-label, .trio .section-title { color: #4338ca; font-size: 8.5px; font-weight: bold; text-transform: uppercase; letter-spacing: .8px; margin: 0 0 4px; }
.party-name { font-size: 11px; }
.party-line, .ids td { color: #474d68; }
.ids td { font-size: 9px; }
.ids td:first-child { width: 88px; }
.pay-box { color: #474d68; }
.info-strip { margin-top: 8px; padding: 5px 8px; background: #f1f2f9; color: #474d68; }
.section-title { margin: 14px 0 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: .8px; color: #4338ca; }
.lines th { background: #e3e5f5; color: #2e3170; font-size: 8.5px; text-transform: uppercase; padding: 5px 6px; }
.lines td { padding: 4px 6px; line-height: 1.35; }
.lines tbody tr:nth-child(even) td { background: #f6f7fc; }
.muted, .adj { font-size: 9px; }
.summary { margin-top: 4px; }
.summary td.sr { padding-top: 22px; }
.totals td { padding: 3px 0; border-bottom: 1px solid #e3e5f5; }
.totals tr.grand td { padding: 6px 8px; background: #4338ca; color: #fff; font-size: 13px; border: 0; }
.footer { margin-top: 18px; padding-top: 6px; border-top: 1px solid #d9dcea; color: #8a8fac; font-size: 8.5px; line-height: 1.5; }
`,
    body: `<table class="hd"><tr>
<td><h1>${TITLE}</h1><div class="no">${ID}</div><div class="profile">${PROFILE}</div></td>
<td><table class="meta">${metaRows()}</table></td>
</tr></table>
<table class="trio"><tr>
<td class="tc">${partyCard('$seller', 'seller')}</td>
<td class="tc">${partyCard('$buyer', 'buyer')}</td>
<td class="tc"><div class="section-title">${t('payment')}</div><div class="pay-box">${PAYMENT_DETAILS}</div></td>
</tr></table>
${INFO_STRIP}
${section('lines')}
${lines([26, 70, 76, 44, 84])}
${ALLOWANCES}
${summary(`${section('vatBreakdown')}${vatTable([44, 92, 84])}${NOTES}`, totals({ grand: true }))}
${FOOTER}`,
};

const bold: InvoiceDesign = {
    id: 'bold', accent: '#047857', recommended: ['prepayment', 'partial'],
    css: `
html, body { background: #e7f0ec; color: #12261e; }
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11.5px; }
.page { padding: 36px 40px 24px; }
.hd { width: 100%; }
.hd td { vertical-align: top; }
.profile { color: #047857; font-size: 9.5px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
h1 { margin: 8px 0 2px; font-size: 34px; line-height: 1.05; color: #0b1f17; }
.no { font-size: 14px; color: #3e5a4f; font-weight: bold; }
.metas { margin-top: 16px; }
.metas td.m { padding-right: 22px; }
.mk { color: #5b7a6e; font-size: 9px; text-transform: uppercase; letter-spacing: .6px; }
.mv { font-weight: bold; margin-top: 2px; }
.due-card { width: 290px; margin-left: auto; padding: 20px 22px; border-radius: 16px; background: #047857; color: #fff; }
.due-card .label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold; color: #a7f3d0; }
.due-card .amount { margin-top: 6px; font-size: 30px; font-weight: bold; }
.due-card .due { margin-top: 8px; font-size: 12px; font-weight: bold; }
.due-card .bank { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,.25); font-size: 10.5px; line-height: 1.6; color: #d1fae5; }
.parties { margin-top: 26px; border-collapse: separate; border-spacing: 0; }
.parties td.pc-seller { padding-right: 9px; }
.parties td.pc-buyer { padding-left: 9px; }
.party { padding: 14px 16px; border: 2px solid #d1e7dd; border-radius: 14px; }
.party-label { color: #047857; font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.party-name { font-size: 14px; margin-bottom: 3px; }
.party-line, .ids td { color: #3e5a4f; }
.info-strip { margin-top: 14px; padding: 9px 14px; border-radius: 10px; background: #ecf7f2; color: #3e5a4f; }
.section-title { margin: 18px 0 7px; font-size: 10.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #0b1f17; }
.lines th { color: #047857; font-size: 9.5px; text-transform: uppercase; padding: 8px 10px; border-bottom: 2px solid #047857; }
.lines td { padding: 7px 10px; border-bottom: 1px solid #e0ece6; }
.summary { margin-top: 6px; }
.summary td.sr { padding-top: 34px; }
.totals td { border-bottom: 1px solid #e0ece6; }
.totals tr.grand td { padding: 10px 0; border-bottom: 0; border-top: 3px solid #047857; color: #047857; font-size: 17px; font-weight: bold; }
.pay-box { padding: 12px 14px; border-radius: 12px; background: #f5faf8; color: #3e5a4f; }
.footer { margin-top: 26px; padding-top: 10px; border-top: 1px solid #e0ece6; color: #7d978c; font-size: 9px; line-height: 1.6; }
`,
    body: `<table class="hd"><tr>
<td>
<div class="profile">${PROFILE}</div>
<h1>${TITLE}</h1>
<div class="no">${ID}</div>
<table class="metas"><tr>${metaCells({ due: false })}</tr></table>
</td>
<td style="width:310px">
<div class="due-card">
<div class="label">${t('payable')}</div>
<div class="amount">${PAYABLE_AMOUNT}</div>
<xsl:if test="${HAS_DUE}"><div class="due">${t('due')}: ${date(DUE)}</div></xsl:if>
<xsl:if test="cac:PaymentMeans[cac:PayeeFinancialAccount/cbc:ID] or cac:PaymentMeans/cbc:PaymentID">
<div class="bank">${BANK}<xsl:for-each select="cac:PaymentMeans[cbc:PaymentID][1]"><div>${t('remittance')}: <xsl:value-of select="cbc:PaymentID"/></div></xsl:for-each></div>
</xsl:if>
</div>
</td>
</tr></table>
${PARTIES}
${INFO_STRIP}
${section('lines')}
${lines()}
${ALLOWANCES}
${summary(`${section('vatBreakdown')}${vatTable()}${PAYMENT}${NOTES}`, totals({ grand: true }))}
${FOOTER}`,
};

const nordic: InvoiceDesign = {
    id: 'nordic', accent: '#0f766e',
    css: `
html, body { background: #e8efed; color: #24302e; }
body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 11.5px; }
.page { padding: 40px 44px 26px; }
.hd-t { width: 100%; }
.co { font-size: 14px; font-weight: bold; color: #0f766e; }
.pill { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #e3f1ee; color: #0f766e; font-size: 9.5px; font-weight: bold; }
h1 { margin: 26px 0 2px; font-size: 36px; font-weight: 300; color: #1b2725; }
.no { color: #64748b; font-size: 13px; }
.cards { margin: 22px -8px 0; border-collapse: separate; border-spacing: 8px 0; }
.cards td.m { background: #f2f6f5; border-radius: 12px; padding: 10px 14px; }
.mk { color: #6b8580; font-size: 9px; text-transform: uppercase; letter-spacing: .6px; }
.mv { margin-top: 3px; font-weight: 600; }
.parties { margin-top: 16px; border-collapse: separate; border-spacing: 0; }
.parties td.pc-seller { padding-right: 8px; }
.parties td.pc-buyer { padding-left: 8px; }
.party { background: #f2f6f5; border-radius: 16px; padding: 16px 18px; }
.party-label { color: #0f766e; font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.party-name { font-size: 14px; margin-bottom: 3px; }
.party-line, .ids td { color: #52625f; }
.info-strip { margin-top: 12px; padding: 10px 16px; border-radius: 12px; background: #f2f6f5; color: #52625f; }
.section-title { margin: 20px 0 7px; font-size: 13px; font-weight: 300; color: #0f766e; }
.lines th { color: #6b8580; font-size: 9.5px; font-weight: normal; text-transform: uppercase; letter-spacing: .5px; padding: 8px 10px; border-bottom: 1px solid #d5e2df; }
.lines td { padding: 8px 10px; border-bottom: 1px solid #edf2f1; }
.summary { margin-top: 6px; }
.summary td.sr { padding-top: 42px; }
.tot-card { background: #f2f6f5; border-radius: 16px; padding: 14px 18px; }
.totals td { color: #52625f; }
.payable { margin-top: 10px; padding: 16px 18px; border-radius: 16px; background: #0f766e; color: #fff; }
.payable .label { font-size: 9.5px; text-transform: uppercase; letter-spacing: 1px; color: #ccfbf1; }
.payable .amount { margin-top: 4px; font-size: 24px; font-weight: 300; text-align: right; }
.pay-box { padding: 14px 16px; border-radius: 14px; border: 1px solid #d5e2df; color: #52625f; }
.footer { margin-top: 28px; color: #8aa09b; font-size: 9px; line-height: 1.6; }
`,
    body: `<table class="hd-t"><tr>
<td><div class="co">${partyName('$seller')}</div></td>
<td class="r"><span class="pill">${PROFILE}</span></td>
</tr></table>
<h1>${TITLE}</h1>
<div class="no">${ID}</div>
<table class="cards metas"><tr>${metaCells()}</tr></table>
${PARTIES}
${INFO_STRIP}
${section('lines')}
${lines()}
${ALLOWANCES}
${summary(`${section('vatBreakdown')}${vatTable()}${PAYMENT}${NOTES}`, `<div class="tot-card">${totals()}</div>${PAYABLE}`)}
${FOOTER}`,
};

const din: InvoiceDesign = {
    id: 'din', accent: '#1f2937',
    css: `
html, body { background: #e5e7eb; color: #111827; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 11.5px; }
.page { padding: 34px 38px 0 76px; min-height: 1123px; position: relative; }
.lh { width: 100%; }
.lh td { vertical-align: top; }
.lh .co { font-size: 18px; font-weight: bold; }
.lh .co-addr { margin-top: 4px; color: #4b5563; font-size: 10.5px; line-height: 1.45; }
.addr-zone { width: 100%; margin-top: 30px; }
.addr-zone td { vertical-align: top; }
.window { width: 324px; height: 170px; padding-top: 2px; }
.sender { font-size: 8px; color: #4b5563; text-decoration: underline; margin-bottom: 10px; }
.rcpt-name { font-weight: bold; font-size: 12px; }
.rcpt { line-height: 1.45; }
.rcpt-id { margin-top: 6px; font-size: 10px; color: #4b5563; }
.info { padding-left: 30px; }
.meta { width: 100%; }
.meta td { padding: 1.5px 0; }
.meta .key { color: #4b5563; padding-right: 10px; }
.meta .value { text-align: right; white-space: nowrap; }
.subject { margin-top: 18px; font-size: 15px; font-weight: bold; }
.info-strip { margin-top: 8px; color: #374151; }
.section-title { margin: 18px 0 6px; font-weight: bold; }
.lines { margin-top: 16px; }
.lines th { padding: 6px 6px; border-top: 1px solid #111827; border-bottom: 1px solid #111827; font-size: 10.5px; }
.lines td { padding: 6px; border-bottom: 1px solid #e5e7eb; }
.summary { margin-top: 10px; }
.summary td.sr { padding-top: 30px; }
.totals td { padding: 3px 0; }
.totals td:last-child { font-weight: normal; }
.totals tr.grand td { padding-top: 6px; border-top: 1px solid #111827; border-bottom: 3px double #111827; font-weight: bold; font-size: 13px; }
.pay-box { color: #374151; }
.din-footer { margin: 36px -38px 0 -76px; padding: 12px 38px 18px 76px; border-top: 1px solid #9ca3af; font-size: 9px; color: #4b5563; line-height: 1.5; }
.din-footer table { width: 100%; table-layout: fixed; }
.din-footer td { vertical-align: top; padding-right: 12px; }
.din-footer .legal { margin-top: 8px; color: #9ca3af; }
`,
    body: `<table class="lh"><tr>
<td></td>
<td class="r" style="width:300px"><div class="co">${partyName('$seller')}</div><div class="co-addr">${address('$seller/cac:PostalAddress')}</div></td>
</tr></table>
<table class="addr-zone"><tr>
<td class="window">
<div class="sender">${SELLER_LINE}</div>
<div class="rcpt-name">${partyName('$buyer')}</div>
<div class="rcpt">${address('$buyer/cac:PostalAddress')}</div>
<div class="rcpt-id">${partyIds('$buyer')}</div>
</td>
<td class="info"><table class="meta">${metaRows()}</table></td>
</tr></table>
<div class="subject">${TITLE}<xsl:text> </xsl:text>${ID}</div>
${INFO_STRIP}
${lines()}
${ALLOWANCES}
${summary(`${section('vatBreakdown')}${vatTable()}`, totals({ grand: true }))}
${PAYMENT}
${NOTES}
<div class="din-footer">
<table><tr>
<td><b>${partyName('$seller')}</b>${address('$seller/cac:PostalAddress')}</td>
<td>${partyIds('$seller')}</td>
<td>${BANK}</td>
</tr></table>
<div class="legal">${t('legal')} · <xsl:value-of select="cbc:CustomizationID"/></div>
</div>`,
};

const gradient: InvoiceDesign = {
    id: 'gradient', accent: '#7c3aed',
    css: `
html, body { background: #f1edfb; color: #221b33; }
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11.5px; }
.hero { padding: 34px 40px 64px; color: #fff; background: linear-gradient(120deg,#5b21b6,#7c3aed 45%,#db2777); }
.hero-t { width: 100%; }
.hero-t td { vertical-align: top; }
.pill { display: inline-block; padding: 4px 11px; border-radius: 999px; background: rgba(255,255,255,.18); font-size: 9.5px; font-weight: bold; letter-spacing: .6px; }
h1 { margin: 12px 0 2px; font-size: 32px; }
.no { font-size: 13px; opacity: .9; }
.amt-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: .85; font-weight: bold; }
.amt { margin-top: 4px; font-size: 28px; font-weight: bold; }
.float { margin: -38px 40px 0; padding: 14px 18px; background: #fff; border-radius: 14px; box-shadow: 0 10px 30px rgba(76,29,149,.18); }
.metas td.m { padding-right: 26px; }
.mk { color: #8b7fb0; font-size: 9px; text-transform: uppercase; letter-spacing: .6px; }
.mv { margin-top: 2px; font-weight: bold; }
.content { padding: 22px 40px 10px; }
.parties { border-collapse: separate; border-spacing: 0; }
.parties td.pc-seller { padding-right: 9px; }
.parties td.pc-buyer { padding-left: 9px; }
.party { padding: 16px 18px; border-radius: 14px; background: #fff; box-shadow: 0 4px 18px rgba(76,29,149,.10); border: 1px solid #ede9fe; }
.party-label { font-size: 9.5px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; color: #db2777; }
.party-name { font-size: 14px; margin-bottom: 3px; }
.party-line, .ids td { color: #5b5274; }
.info-strip { margin-top: 14px; padding: 9px 14px; border-radius: 10px; background: #f5f3ff; color: #5b5274; }
.section-title { margin: 18px 0 7px; font-size: 10.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #6d28d9; }
.lines { border-radius: 12px; overflow: hidden; }
.lines th { background: #f5f3ff; color: #6d28d9; font-size: 9.5px; text-transform: uppercase; padding: 9px 10px; }
.lines td { padding: 7px 10px; border-bottom: 1px solid #f0ecfa; }
.summary { margin-top: 6px; }
.summary td.sr { padding-top: 34px; }
.totals td { border-bottom: 1px solid #f0ecfa; }
.totals tr.grand td { padding: 12px 14px; border: 0; color: #fff; font-size: 16px; background: linear-gradient(120deg,#7c3aed,#db2777); }
.totals tr.grand td:first-child { border-radius: 10px 0 0 10px; }
.totals tr.grand td:last-child { border-radius: 0 10px 10px 0; }
.pay-box { padding: 12px 14px; border-radius: 12px; border: 1px solid #ede9fe; color: #5b5274; }
.footer { margin-top: 18px; padding: 12px 40px 22px; color: #9b91b8; font-size: 9px; line-height: 1.6; }
`,
    body: `<div class="hero"><table class="hero-t"><tr>
<td><span class="pill">${PROFILE}</span><h1>${TITLE}</h1><div class="no">${ID}</div></td>
<td class="r"><div class="amt-label">${t('payable')}</div><div class="amt">${PAYABLE_AMOUNT}</div></td>
</tr></table></div>
<div class="float"><table class="metas"><tr>${metaCells()}</tr></table></div>
<div class="content">
${PARTIES}
${INFO_STRIP}
${section('lines')}
${lines()}
${ALLOWANCES}
${summary(`${section('vatBreakdown')}${vatTable()}${PAYMENT}${NOTES}`, totals({ grand: true }))}
</div>
${FOOTER}`,
};

const ledger: InvoiceDesign = {
    id: 'ledger', accent: '#9a3412',
    css: `
html, body { background: #efe6dc; color: #2a1d14; }
body { font-family: Verdana, Arial, sans-serif; font-size: 10.5px; }
.page { background: #fffaf5; padding: 32px 36px 24px; }
.box { width: 100%; border: 1.5px solid #9a3412; }
.box td { border: 1px solid #e3c9b3; vertical-align: top; }
.hdr td.title-cell { padding: 14px 16px; border-right: 1.5px solid #9a3412; }
h1 { margin: 0; font-size: 22px; color: #9a3412; text-transform: uppercase; letter-spacing: 1px; }
.profile { margin-top: 4px; color: #7c5b45; font-size: 9.5px; }
.hdr td.id-cell { width: 230px; padding: 14px 16px; text-align: right; font-family: Consolas, 'Courier New', monospace; font-size: 17px; font-weight: bold; vertical-align: middle; }
.metas { margin-top: -1.5px; }
.metas td.m { padding: 7px 10px; }
.mk { color: #9a3412; font-size: 8.5px; text-transform: uppercase; letter-spacing: .5px; }
.mv { margin-top: 2px; font-family: Consolas, 'Courier New', monospace; font-size: 11px; }
.parties { margin-top: 12px; border: 1.5px solid #9a3412; }
.parties td.pc { padding: 12px 14px; }
.parties td.pc-seller { border-right: 1px solid #e3c9b3; }
.party-label { color: #9a3412; font-size: 8.5px; font-weight: bold; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 5px; }
.party-name { font-size: 12.5px; margin-bottom: 3px; }
.party-line, .ids td { color: #5c4334; }
.info-strip { margin-top: 10px; padding: 7px 10px; border: 1px dashed #c9a184; color: #5c4334; }
.section-title { margin: 18px 0 5px; font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: .8px; color: #9a3412; }
.lines { border: 1.5px solid #9a3412; }
.lines th { background: #f6e7da; color: #7c2d12; font-size: 8.5px; text-transform: uppercase; padding: 6px 7px; border: 1px solid #e3c9b3; }
.lines td { padding: 6px 7px; border: 1px solid #ecd9c8; }
.lines td.r { font-family: Consolas, 'Courier New', monospace; font-size: 10.5px; }
.summary { margin-top: 4px; }
.summary td.sr { padding-top: 23px; }
.totals { border: 1.5px solid #9a3412; }
.totals td { padding: 5px 9px; border-bottom: 1px solid #ecd9c8; }
.totals td:last-child { font-family: Consolas, 'Courier New', monospace; }
.totals tr.grand td { background: #9a3412; color: #fff; font-size: 13px; padding: 8px 9px; }
.pay-box { padding: 9px 11px; border: 1px solid #e3c9b3; color: #5c4334; }
.footer { margin-top: 20px; padding-top: 8px; border-top: 1.5px solid #9a3412; color: #8c6e5a; font-size: 8.5px; line-height: 1.6; }
`,
    body: `<table class="box hdr"><tr>
<td class="title-cell"><h1>${TITLE}</h1><div class="profile">${PROFILE}</div></td>
<td class="id-cell">${ID}</td>
</tr></table>
<table class="box metas"><tr>${metaCells()}</tr></table>
${PARTIES}
${INFO_STRIP}
${section('lines')}
${lines()}
${ALLOWANCES}
${summary(`${section('vatBreakdown')}${vatTable()}${PAYMENT}${NOTES}`, totals({ grand: true }))}
${FOOTER}`,
};

const reference: InvoiceDesign = {
    id: 'reference', accent: '#c2410c', recommended: ['credit', 'corrected'],
    css: `
html, body { background: #eceff3; color: #1f2733; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 11.5px; }
.kind { --accent: #0369a1; --soft: #e0f2fe; }
.kind.k-credit { --accent: #c2410c; --soft: #ffedd5; }
.kind.k-corrected { --accent: #7c3aed; --soft: #ede9fe; }
.kind.k-prepayment { --accent: #0e7490; --soft: #cffafe; }
.banner { padding: 26px 40px 22px; background: var(--accent); color: #fff; }
.b-t { width: 100%; }
.b-t td { vertical-align: top; }
h1 { margin: 0; font-size: 28px; }
.no { margin-top: 4px; font-size: 13px; opacity: .92; }
.pill { display: inline-block; padding: 4px 11px; border-radius: 999px; background: rgba(255,255,255,.2); font-size: 9.5px; font-weight: bold; }
.content { padding: 22px 40px 10px; }
.ref-box { width: 100%; margin-bottom: 18px; border-collapse: separate; border-spacing: 0; border: 2px solid var(--accent); border-radius: 12px; background: var(--soft); }
.ref-box td { padding: 14px 18px; vertical-align: top; }
.ref-k { color: var(--accent); font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
.ref-v { font-size: 15px; font-weight: bold; }
.ref-amt { font-size: 20px; font-weight: bold; color: var(--accent); }
.metas td.m { padding-right: 26px; }
.mk { color: #6b7686; font-size: 9px; text-transform: uppercase; letter-spacing: .6px; }
.mv { margin-top: 2px; font-weight: bold; }
.parties { margin-top: 18px; border-collapse: separate; border-spacing: 0; }
.parties td.pc-seller { padding-right: 9px; }
.parties td.pc-buyer { padding-left: 9px; }
.party { padding: 14px 16px; border: 1px solid #dde2e9; border-radius: 12px; }
.party-label { color: var(--accent); font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.party-name { font-size: 14px; margin-bottom: 3px; }
.party-line, .ids td { color: #4f5b6b; }
.info-strip { margin-top: 14px; padding: 9px 14px; border-radius: 10px; background: #f3f5f8; color: #4f5b6b; }
.section-title { margin: 18px 0 7px; font-size: 10.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #1f2733; }
.lines th { color: var(--accent); font-size: 9.5px; text-transform: uppercase; padding: 8px 10px; border-bottom: 2px solid var(--accent); }
.lines td { padding: 7px 10px; border-bottom: 1px solid #e6eaf0; }
.summary { margin-top: 6px; }
.summary td.sr { padding-top: 34px; }
.totals td { border-bottom: 1px solid #e6eaf0; }
.payable { margin-top: 12px; padding: 14px 16px; border-radius: 12px; background: var(--accent); color: #fff; }
.payable .label { font-size: 9.5px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold; opacity: .85; }
.payable .amount { margin-top: 4px; font-size: 22px; font-weight: bold; text-align: right; }
.pay-box { padding: 12px 14px; border: 1px solid #dde2e9; border-radius: 12px; color: #4f5b6b; }
.footer { margin-top: 20px; padding: 12px 40px 22px; border-top: 1px solid #dde2e9; color: #8792a2; font-size: 9px; line-height: 1.6; }
`,
    body: `<div class="kind k-{$titleKey}">
<div class="banner"><table class="b-t"><tr>
<td><h1>${TITLE}</h1><div class="no">${ID} · ${date('cbc:IssueDate')}</div></td>
<td class="r"><span class="pill">${PROFILE}</span></td>
</tr></table></div>
<div class="content">
<xsl:if test="cac:BillingReference/cac:InvoiceDocumentReference/cbc:ID">
<table class="ref-box"><tr>
<td><div class="ref-k">${t('preceding')}</div>${PRECEDING_LIST}</td>
<td class="r"><div class="ref-k">${t('payable')}</div><div class="ref-amt">${PAYABLE_AMOUNT}</div></td>
</tr></table>
</xsl:if>
<table class="metas"><tr>${metaCells({ issue: false, preceding: false })}</tr></table>
${PARTIES}
${INFO_STRIP}
${NOTES}
${section('lines')}
${lines()}
${ALLOWANCES}
${summary(`${section('vatBreakdown')}${vatTable()}${PAYMENT}`, `${totals()}${PAYABLE}`)}
</div>
${FOOTER}
</div>`,
};

/** Temel şablon dışındaki tasarımlar (sihirbazdaki sırayla). */
export const INVOICE_DESIGNS: InvoiceDesign[] = [minimal, corporate, sidebar, elegant, compact, bold, nordic, din, gradient, ledger, reference];

export const CLASSIC_DESIGN_ID = 'classic';

const ROOT_TEMPLATE = '<xsl:template match="/">';

/** Temel EN 16931 şablonunun kütüphanesi + tasarımın sayfa düzeni → tam XSLT. */
export function composeInvoiceDesign(baseXslt: string, design: InvoiceDesign): string {
    const cut = baseXslt.indexOf(ROOT_TEMPLATE);
    if (cut < 0) return baseXslt;
    return `${baseXslt.slice(0, cut).trimEnd()}

    <!-- Tasarım: ${design.id} -->
    <xsl:template match="/">
        <xsl:apply-templates select="n1:Invoice | n2:CreditNote"/>
    </xsl:template>

    <xsl:template match="n1:Invoice | n2:CreditNote">${PROLOGUE}

        <html lang="{$L}">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title>${TITLE}<xsl:text> </xsl:text>${ID}</title>
                <style type="text/css">${BASE_CSS}${design.css}</style>
            </head>
            <body>
                <div class="page design-${design.id}">
${design.body}
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
`;
}

export const findInvoiceDesign = (id: string) => INVOICE_DESIGNS.find(d => d.id === id);
