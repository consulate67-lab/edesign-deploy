/**
 * Shopify sipariş → basit UBL-TR Invoice XML (önizleme için).
 */
import { adminGraphql } from './shopify-billing.js';

const ORDERS_QUERY = `
query EdxOrders($first: Int!) {
  orders(first: $first, sortKey: CREATED_AT, reverse: true) {
    edges {
      node {
        id
        name
        createdAt
        displayFinancialStatus
        totalPriceSet { shopMoney { amount currencyCode } }
        customer { displayName email }
      }
    }
  }
}`;

const ORDER_QUERY = `
query EdxOrder($id: ID!) {
  order(id: $id) {
    id
    name
    createdAt
    email
    phone
    note
    displayFinancialStatus
    totalPriceSet { shopMoney { amount currencyCode } }
    subtotalPriceSet { shopMoney { amount currencyCode } }
    totalTaxSet { shopMoney { amount currencyCode } }
    shippingAddress {
      name company address1 address2 city province country countryCodeV2 zip phone
    }
    billingAddress {
      name company address1 address2 city province country countryCodeV2 zip phone
    }
    customer { displayName firstName lastName email phone }
    lineItems(first: 50) {
      edges {
        node {
          title
          quantity
          sku
          originalUnitPriceSet { shopMoney { amount currencyCode } }
          discountedTotalSet { shopMoney { amount currencyCode } }
          taxLines { rate title priceSet { shopMoney { amount } } }
        }
      }
    }
    shippingLine {
      title
      originalPriceSet { shopMoney { amount currencyCode } }
    }
  }
}`;

function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function money(set) {
    const m = set?.shopMoney;
    if (!m) return { amount: '0.00', currency: 'TRY' };
    const n = Number(m.amount);
    return {
        amount: Number.isFinite(n) ? n.toFixed(2) : '0.00',
        currency: m.currencyCode || 'TRY',
    };
}

function gidToOrderId(gid) {
    const s = String(gid || '');
    if (s.startsWith('gid://')) return s;
    if (/^\d+$/.test(s)) return `gid://shopify/Order/${s}`;
    return s;
}

export async function listShopifyOrders({ shop, accessToken, first = 25 }) {
    const data = await adminGraphql({
        shop,
        accessToken,
        query: ORDERS_QUERY,
        variables: { first: Math.min(50, Math.max(1, first)) },
    });
    return (data?.orders?.edges || []).map(({ node }) => {
        const total = money(node.totalPriceSet);
        return {
            id: node.id,
            name: node.name,
            created_at: node.createdAt,
            financial_status: node.displayFinancialStatus,
            total: total.amount,
            currency: total.currency,
            customer: node.customer?.displayName || node.customer?.email || '',
        };
    });
}

export async function getShopifyOrder({ shop, accessToken, orderId }) {
    const data = await adminGraphql({
        shop,
        accessToken,
        query: ORDER_QUERY,
        variables: { id: gidToOrderId(orderId) },
    });
    return data?.order || null;
}

/**
 * Önizleme için yeterli UBL Invoice iskeleti.
 * GİB şematron doğrulaması amaçlanmaz; XSLT satır/tutar/ünvan gösterir.
 */
export function orderToUblInvoiceXml(order, { supplierName = 'Shopify Mağaza' } = {}) {
    if (!order) return '';
    const total = money(order.totalPriceSet);
    const sub = money(order.subtotalPriceSet);
    const tax = money(order.totalTaxSet);
    const bill = order.billingAddress || order.shippingAddress || {};
    const cust = order.customer || {};
    const buyerName = bill.name || bill.company || cust.displayName
        || [cust.firstName, cust.lastName].filter(Boolean).join(' ')
        || order.email || 'Müşteri';
    const lines = (order.lineItems?.edges || []).map((e) => e.node);
    const issueDate = (order.createdAt || new Date().toISOString()).slice(0, 10);
    const invId = String(order.name || 'SIP').replace(/[^A-Za-z0-9_-]/g, '');

    const lineXml = lines.map((li, i) => {
        const unit = money(li.originalUnitPriceSet);
        const lineTotal = money(li.discountedTotalSet);
        const qty = Number(li.quantity) || 1;
        const taxLine = (li.taxLines || [])[0];
        const rate = taxLine?.rate != null ? Number(taxLine.rate) * 100 : 20;
        const taxAmt = taxLine?.priceSet ? money(taxLine.priceSet).amount : '0.00';
        return `
  <cac:InvoiceLine>
    <cbc:ID>${i + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">${qty}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${esc(lineTotal.currency)}">${esc(lineTotal.amount)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${esc(lineTotal.currency)}">${esc(taxAmt)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${esc(lineTotal.currency)}">${esc(lineTotal.amount)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${esc(lineTotal.currency)}">${esc(taxAmt)}</cbc:TaxAmount>
        <cbc:Percent>${esc(rate.toFixed(2))}</cbc:Percent>
        <cac:TaxCategory>
          <cac:TaxScheme><cbc:Name>KDV</cbc:Name><cbc:TaxTypeCode>0015</cbc:TaxTypeCode></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${esc(li.title)}</cbc:Name>
      ${li.sku ? `<cac:SellersItemIdentification><cbc:ID>${esc(li.sku)}</cbc:ID></cac:SellersItemIdentification>` : ''}
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${esc(unit.currency)}">${esc(unit.amount)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>TEMELFATURA</cbc:ProfileID>
  <cbc:ID>${esc(invId)}</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:IssueDate>${esc(issueDate)}</cbc:IssueDate>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${esc(total.currency)}</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>${lines.length}</cbc:LineCountNumeric>
  <cbc:Note>Shopify sipariş önizlemesi · ${esc(order.name)} · EDXDOCU</cbc:Note>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${esc(supplierName)}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:CityName>İstanbul</cbc:CityName>
        <cac:Country><cbc:IdentificationCode>TR</cbc:IdentificationCode><cbc:Name>Türkiye</cbc:Name></cac:Country>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${esc(buyerName)}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${esc([bill.address1, bill.address2].filter(Boolean).join(' '))}</cbc:StreetName>
        <cbc:CityName>${esc(bill.city || '')}</cbc:CityName>
        <cbc:PostalZone>${esc(bill.zip || '')}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${esc(bill.countryCodeV2 || 'TR')}</cbc:IdentificationCode>
          <cbc:Name>${esc(bill.country || 'Türkiye')}</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      ${order.email || cust.email ? `<cac:Contact><cbc:ElectronicMail>${esc(order.email || cust.email)}</cbc:ElectronicMail></cac:Contact>` : ''}
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${esc(tax.currency)}">${esc(tax.amount)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${esc(sub.currency)}">${esc(sub.amount)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${esc(sub.currency)}">${esc(sub.amount)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${esc(total.currency)}">${esc(total.amount)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${esc(total.currency)}">${esc(total.amount)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${lineXml}
</Invoice>
`;
}

/** Test XSLT: görünür damga + yorum. */
export function applyTestWatermark(xslt) {
    let out = String(xslt || '');
    const stamp = `<!-- EDXDOCU-TEST:${new Date().toISOString()} -->\n`;
    if (!out.includes('EDXDOCU-TEST:')) {
        const decl = out.match(/^\uFEFF?\s*<\?xml[^?]*\?>[ \t]*\r?\n?/);
        out = decl ? out.slice(0, decl[0].length) + stamp + out.slice(decl[0].length) : stamp + out;
    }
    const banner = `
<div id="edxdocu-test-banner" style="position:fixed;top:8px;right:8px;z-index:99999;background:#b91c1c;color:#fff;padding:8px 14px;font:700 14px/1.2 Segoe UI,sans-serif;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.35)">TEST / ÖRNEK — EdXDocu</div>
`;
    if (/<body\b[^>]*>/i.test(out) && !/edxdocu-test-banner/i.test(out)) {
        out = out.replace(/<body\b[^>]*>/i, (m) => `${m}${banner}`);
    } else if (!/edxdocu-test-banner/i.test(out)) {
        // XSLT çıktısına gömmek için template ekle
        const inject = `
  <xsl:template match="/" priority="1000">
    <xsl:text disable-output-escaping="yes">${banner.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</xsl:text>
    <xsl:apply-templates select="node()"/>
  </xsl:template>
`;
        // Basit: dosya başına HTML comment + style notu yeterli; transform sonrası client damgası da basılabilir
        void inject;
        out = `<!-- EDXDOCU-TEST-BANNER: TEST / ORNEK -->\n` + out;
    }
    return out;
}
