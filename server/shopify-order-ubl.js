/**
 * Shopify sipariş → basit UBL-TR Invoice XML (önizleme için).
 * Mağaza (Shop) bilgisi → satıcı (AccountingSupplierParty) + banka (PaymentMeans).
 */
import { adminGraphql } from './shopify-billing.js';

const SHOP_QUERY = `
query EdxShop {
  shop {
    name
    email
    contactEmail
    myshopifyDomain
    primaryDomain { url host }
    billingAddress {
      company
      address1
      address2
      city
      province
      country
      countryCodeV2
      zip
      phone
    }
  }
}`;

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

/**
 * Shopify Admin Shop → önizleme / form için satıcı profili.
 * Banka Shopify’da yok; UI’dan gelir.
 */
export async function getShopifyShop({ shop, accessToken }) {
    const data = await adminGraphql({ shop, accessToken, query: SHOP_QUERY });
    const s = data?.shop;
    if (!s) return null;
    const addr = s.billingAddress || {};
    const website = s.primaryDomain?.url
        || (s.primaryDomain?.host ? `https://${s.primaryDomain.host}` : '')
        || (s.myshopifyDomain ? `https://${s.myshopifyDomain}` : '');
    const company = addr.company || s.name || '';
    const street = [addr.address1, addr.address2].filter(Boolean).join(' ').trim();
    return {
        name: company || s.name || '',
        shop_name: s.name || '',
        email: s.contactEmail || s.email || '',
        phone: addr.phone || '',
        website,
        address: street,
        city: addr.city || '',
        province: addr.province || '',
        zip: addr.zip || '',
        country: addr.country || 'Türkiye',
        country_code: addr.countryCodeV2 || 'TR',
        myshopify_domain: s.myshopifyDomain || shop || '',
    };
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

function normalizeSupplier(raw = {}) {
    return {
        name: String(raw.name || raw.company_name || raw.supplierName || '').slice(0, 200),
        email: String(raw.email || '').slice(0, 200),
        phone: String(raw.phone || '').slice(0, 64),
        website: String(raw.website || '').slice(0, 300),
        address: String(raw.address || '').slice(0, 300),
        city: String(raw.city || '').slice(0, 120),
        province: String(raw.province || '').slice(0, 120),
        zip: String(raw.zip || '').slice(0, 32),
        country: String(raw.country || 'Türkiye').slice(0, 80),
        country_code: String(raw.country_code || 'TR').slice(0, 8),
        bank_name: String(raw.bank_name || '').slice(0, 120),
        iban: String(raw.iban || '').replace(/\s+/g, '').toUpperCase().slice(0, 34),
        account_name: String(raw.account_name || '').slice(0, 200),
    };
}

function paymentMeansXml(supplier, currency = 'TRY') {
    const s = normalizeSupplier(supplier);
    if (!s.iban && !s.bank_name && !s.account_name) return '';
    const noteParts = [s.bank_name, s.account_name].filter(Boolean);
    return `
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
    <cac:PayeeFinancialAccount>
      ${s.iban ? `<cbc:ID>${esc(s.iban)}</cbc:ID>` : ''}
      <cbc:CurrencyCode>${esc(currency)}</cbc:CurrencyCode>
      ${s.account_name ? `<cbc:Name>${esc(s.account_name)}</cbc:Name>` : ''}
      ${noteParts.length ? `<cbc:PaymentNote>${esc(noteParts.join(' · '))}</cbc:PaymentNote>` : ''}
      ${s.bank_name ? `<cac:FinancialInstitutionBranch><cac:FinancialInstitution><cbc:Name>${esc(s.bank_name)}</cbc:Name></cac:FinancialInstitution></cac:FinancialInstitutionBranch>` : ''}
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>`;
}

function supplierPartyXml(supplier) {
    const s = normalizeSupplier(supplier);
    const name = s.name || 'Shopify Mağaza';
    return `
  <cac:AccountingSupplierParty>
    <cac:Party>
      ${s.website ? `<cbc:WebsiteURI>${esc(s.website)}</cbc:WebsiteURI>` : ''}
      <cac:PartyName><cbc:Name>${esc(name)}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        ${s.address ? `<cbc:StreetName>${esc(s.address)}</cbc:StreetName>` : ''}
        ${s.city ? `<cbc:CityName>${esc(s.city)}</cbc:CityName>` : '<cbc:CityName>İstanbul</cbc:CityName>'}
        ${s.zip ? `<cbc:PostalZone>${esc(s.zip)}</cbc:PostalZone>` : ''}
        <cac:Country>
          <cbc:IdentificationCode>${esc(s.country_code || 'TR')}</cbc:IdentificationCode>
          <cbc:Name>${esc(s.country || 'Türkiye')}</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      ${(s.phone || s.email) ? `<cac:Contact>
        ${s.phone ? `<cbc:Telephone>${esc(s.phone)}</cbc:Telephone>` : ''}
        ${s.email ? `<cbc:ElectronicMail>${esc(s.email)}</cbc:ElectronicMail>` : ''}
      </cac:Contact>` : ''}
    </cac:Party>
  </cac:AccountingSupplierParty>`;
}

function replaceCbcInBlock(block, tag, value) {
    if (value == null || value === '') return block;
    const escVal = esc(value);
    const re = new RegExp(`(<cbc:${tag}\\b[^>]*>)([\\s\\S]*?)(</cbc:${tag}>)`, 'i');
    if (re.test(block)) return block.replace(re, `$1${escVal}$3`);
    return block;
}

/**
 * Örnek UBL XML içindeki satıcı + banka alanlarını Shopify / form verisiyle değiştirir.
 */
export function applySupplierToUblXml(xml, supplier = {}) {
    const s = normalizeSupplier(supplier);
    if (!xml || (!s.name && !s.email && !s.phone && !s.website && !s.address && !s.iban && !s.bank_name)) {
        return xml || '';
    }
    let out = String(xml);

    out = out.replace(
        /(<cac:AccountingSupplierParty\b[\s\S]*?<\/cac:AccountingSupplierParty>)/i,
        (full) => {
            let block = full;
            if (s.website) {
                if (/<cbc:WebsiteURI\b/i.test(block)) block = replaceCbcInBlock(block, 'WebsiteURI', s.website);
                else block = block.replace(/(<cac:Party\b[^>]*>)/i, `$1\n      <cbc:WebsiteURI>${esc(s.website)}</cbc:WebsiteURI>`);
            }
            if (s.name) {
                block = block.replace(
                    /(<cac:PartyName>\s*<cbc:Name>)([\s\S]*?)(<\/cbc:Name>\s*<\/cac:PartyName>)/i,
                    `$1${esc(s.name)}$3`
                );
            }
            if (s.address) block = replaceCbcInBlock(block, 'StreetName', s.address);
            if (s.city) block = replaceCbcInBlock(block, 'CityName', s.city);
            if (s.zip) block = replaceCbcInBlock(block, 'PostalZone', s.zip);
            // Country IdentificationCode + Name inside PostalAddress/Country only
            block = block.replace(
                /(<cac:PostalAddress\b[\s\S]*?<cac:Country\b[\s\S]*?<cbc:IdentificationCode\b[^>]*>)([\s\S]*?)(<\/cbc:IdentificationCode>)/i,
                (m0, a, _b, c) => (s.country_code ? `${a}${esc(s.country_code)}${c}` : m0)
            );
            block = block.replace(
                /(<cac:PostalAddress\b[\s\S]*?<cac:Country\b[\s\S]*?<cbc:Name\b[^>]*>)([\s\S]*?)(<\/cbc:Name>)/i,
                (m0, a, _b, c) => (s.country ? `${a}${esc(s.country)}${c}` : m0)
            );
            if (s.phone || s.email) {
                if (/<cac:Contact\b/i.test(block)) {
                    if (s.phone) block = replaceCbcInBlock(block, 'Telephone', s.phone);
                    if (s.email) block = replaceCbcInBlock(block, 'ElectronicMail', s.email);
                } else {
                    const contact = `<cac:Contact>
        ${s.phone ? `<cbc:Telephone>${esc(s.phone)}</cbc:Telephone>` : ''}
        ${s.email ? `<cbc:ElectronicMail>${esc(s.email)}</cbc:ElectronicMail>` : ''}
      </cac:Contact>
    </cac:Party>`;
                    block = block.replace(/<\/cac:Party>\s*<\/cac:AccountingSupplierParty>/i, `${contact}</cac:AccountingSupplierParty>`);
                }
            }
            return block;
        }
    );

    if (s.iban || s.bank_name || s.account_name) {
        const pay = paymentMeansXml(s).trim();
        if (/<cac:PaymentMeans\b/i.test(out)) {
            out = out.replace(/<cac:PaymentMeans\b[\s\S]*?<\/cac:PaymentMeans>/i, pay);
        } else if (/<cac:TaxTotal\b/i.test(out)) {
            out = out.replace(/<cac:TaxTotal\b/i, `${pay}\n  <cac:TaxTotal`);
        } else {
            out = out.replace(/<\/Invoice>\s*$/i, `${pay}\n</Invoice>`);
        }
    }
    return out;
}

/**
 * Önizleme için yeterli UBL Invoice iskeleti.
 * GİB şematron doğrulaması amaçlanmaz; XSLT satır/tutar/ünvan gösterir.
 */
export function orderToUblInvoiceXml(order, supplier = {}) {
    if (!order) return '';
    const s = normalizeSupplier(typeof supplier === 'string'
        ? { name: supplier }
        : supplier);
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
  ${supplierPartyXml(s)}
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
      ${order.email || cust.email || order.phone || bill.phone || cust.phone ? `<cac:Contact>
        ${order.phone || bill.phone || cust.phone ? `<cbc:Telephone>${esc(order.phone || bill.phone || cust.phone)}</cbc:Telephone>` : ''}
        ${order.email || cust.email ? `<cbc:ElectronicMail>${esc(order.email || cust.email)}</cbc:ElectronicMail>` : ''}
      </cac:Contact>` : ''}
    </cac:Party>
  </cac:AccountingCustomerParty>
  ${paymentMeansXml(s, total.currency)}
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
