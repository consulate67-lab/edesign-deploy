/**
 * EN 16931 fatura tasarımlarının ortak XSLT parçaları. Etiket, tarih, sayı ve
 * taraf şablonları (t, date, num, money, party-card …) temel şablondan
 * (public/ebelge/intl/en16931-invoice.xslt) gelir; burada yalnız gövde parçaları var.
 */

export const t = (k: string) => `<xsl:call-template name="t"><xsl:with-param name="k">${k}</xsl:with-param></xsl:call-template>`;
export const TITLE = '<xsl:call-template name="t"><xsl:with-param name="k" select="$titleKey"/></xsl:call-template>';
export const ID = '<xsl:value-of select="cbc:ID"/>';
export const PROFILE = '<xsl:value-of select="$profileName"/>';

export const date = (xp: string) => `<xsl:call-template name="date"><xsl:with-param name="value" select="${xp}"/></xsl:call-template>`;
export const num = (xp: string, pattern?: string) =>
    `<xsl:call-template name="num"><xsl:with-param name="v" select="${xp}"/>${pattern ? `<xsl:with-param name="pattern" select="'${pattern}'"/>` : ''}</xsl:call-template>`;
export const money = (xp: string, cur = '$cur') =>
    `<xsl:call-template name="money"><xsl:with-param name="v" select="${xp}"/><xsl:with-param name="cur" select="${cur}"/></xsl:call-template>`;
export const partyName = (party: string) => `<xsl:call-template name="party-name"><xsl:with-param name="party" select="${party}"/></xsl:call-template>`;
export const address = (a: string) => `<xsl:call-template name="address"><xsl:with-param name="a" select="${a}"/></xsl:call-template>`;
export const partyCard = (party: string, label: string) =>
    `<xsl:call-template name="party-card"><xsl:with-param name="party" select="${party}"/><xsl:with-param name="label">${label}</xsl:with-param></xsl:call-template>`;
export const section = (k: string) => `<div class="section-title">${t(k)}</div>`;

export const DUE = '(cbc:DueDate | cac:PaymentMeans/cbc:PaymentDueDate)[1]';
export const HAS_DUE = 'cbc:DueDate or cac:PaymentMeans/cbc:PaymentDueDate';
export const PAYABLE_AMOUNT = money('$totals/cbc:PayableAmount');

export const PROLOGUE = `
        <xsl:variable name="cur" select="cbc:DocumentCurrencyCode"/>
        <xsl:variable name="typeCode" select="cbc:InvoiceTypeCode | cbc:CreditNoteTypeCode"/>
        <xsl:variable name="titleKey">
            <xsl:choose>
                <xsl:when test="local-name()='CreditNote' or $typeCode='381'">credit</xsl:when>
                <xsl:when test="$typeCode='384'">corrected</xsl:when>
                <xsl:when test="$typeCode='386'">prepayment</xsl:when>
                <xsl:when test="$typeCode='389'">selfbilled</xsl:when>
                <xsl:when test="$typeCode='326'">partial</xsl:when>
                <xsl:otherwise>invoice</xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="profileName">
            <xsl:choose>
                <xsl:when test="contains(cbc:CustomizationID, 'xrechnung')">XRechnung</xsl:when>
                <xsl:when test="contains(cbc:CustomizationID, 'peppol.eu')">Peppol BIS Billing 3.0</xsl:when>
                <xsl:when test="contains(cbc:CustomizationID, 'CIUS-RO')">RO e-Factura (CIUS-RO)</xsl:when>
                <xsl:when test="contains(cbc:CustomizationID, 'nlcius')">NLCIUS</xsl:when>
                <xsl:when test="contains(cbc:CustomizationID, 'CIUS-PT')">CIUS-PT</xsl:when>
                <xsl:when test="contains(cbc:CustomizationID, 'mfin.gov.hr')">HR eRačun</xsl:when>
                <xsl:when test="starts-with(cbc:CustomizationID, 'urn:cen.eu:en16931')">EN 16931</xsl:when>
                <xsl:otherwise><xsl:value-of select="cbc:CustomizationID"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="seller" select="cac:AccountingSupplierParty/cac:Party"/>
        <xsl:variable name="buyer" select="cac:AccountingCustomerParty/cac:Party"/>
        <xsl:variable name="vatTotal" select="cac:TaxTotal[cac:TaxSubtotal][1]"/>
        <xsl:variable name="totals" select="cac:LegalMonetaryTotal"/>`;

const metaRow = (k: string, v: string) =>
    `<xsl:call-template name="meta-row"><xsl:with-param name="k">${k}</xsl:with-param><xsl:with-param name="v" select="${v}"/></xsl:call-template>`;

/** Dikey anahtar / değer satırları (class="key" / "value"); bir table içine konur. */
export const metaRows = ({ due = true, preceding = true } = {}) => [
    `<tr><td class="key">${t('date')}</td><td class="value">${date('cbc:IssueDate')}</td></tr>`,
    due ? `<xsl:if test="${HAS_DUE}"><tr><td class="key">${t('due')}</td><td class="value">${date(DUE)}</td></tr></xsl:if>` : '',
    metaRow('currency', '$cur'),
    metaRow('buyerRef', 'cbc:BuyerReference'),
    metaRow('order', 'cac:OrderReference/cbc:ID'),
    metaRow('contract', 'cac:ContractDocumentReference/cbc:ID'),
    metaRow('project', 'cac:ProjectReference/cbc:ID'),
    preceding ? metaRow('preceding', 'cac:BillingReference/cac:InvoiceDocumentReference/cbc:ID') : '',
].filter(Boolean).join('\n');

const cell = (k: string, value: string, test?: string) => {
    const td = `<td class="m"><div class="mk">${t(k)}</div><div class="mv">${value}</div></td>`;
    return test ? `<xsl:if test="${test}">${td}</xsl:if>` : td;
};
const valueCell = (k: string, xp: string) => cell(k, `<xsl:value-of select="${xp}"/>`, `normalize-space(${xp}) != ''`);

/** Yatay bilgi hücreleri (td.m > .mk + .mv); bir tr içine konur. */
export const metaCells = ({ issue = true, due = true, preceding = true, currency = true } = {}) => [
    issue ? cell('date', date('cbc:IssueDate')) : '',
    due ? cell('due', date(DUE), HAS_DUE) : '',
    valueCell('buyerRef', 'cbc:BuyerReference'),
    valueCell('order', 'cac:OrderReference/cbc:ID'),
    valueCell('contract', 'cac:ContractDocumentReference/cbc:ID'),
    valueCell('project', 'cac:ProjectReference/cbc:ID'),
    preceding ? valueCell('preceding', 'cac:BillingReference/cac:InvoiceDocumentReference/cbc:ID') : '',
    currency ? cell('currency', '<xsl:value-of select="$cur"/>') : '',
].filter(Boolean).join('\n');

export const PARTIES = `<table class="parties"><tr>
<td class="pc pc-seller">${partyCard('$seller', 'seller')}</td>
<td class="pc pc-buyer">${partyCard('$buyer', 'buyer')}</td>
</tr></table>`;

/** "Ad · Cadde · PK Şehir · Ülke" tek satır (gönderen satırı, antet). */
export const SELLER_LINE = `${partyName('$seller')}<xsl:for-each select="$seller/cac:PostalAddress"><xsl:if test="cbc:StreetName"><xsl:text> · </xsl:text><xsl:value-of select="cbc:StreetName"/></xsl:if><xsl:if test="cbc:PostalZone or cbc:CityName"><xsl:text> · </xsl:text><xsl:value-of select="normalize-space(concat(cbc:PostalZone, ' ', cbc:CityName))"/></xsl:if><xsl:if test="cac:Country/cbc:IdentificationCode"><xsl:text> · </xsl:text><xsl:value-of select="cac:Country/cbc:IdentificationCode"/></xsl:if></xsl:for-each>`;

/** Taraf vergi / sicil / elektronik adres / iletişim satırları (div). */
export const partyIds = (party: string) => `<xsl:for-each select="${party}/cac:PartyTaxScheme[cbc:CompanyID]">
<div><xsl:choose><xsl:when test="cac:TaxScheme/cbc:ID='VAT'">${t('vat')}</xsl:when><xsl:otherwise>${t('taxNo')}</xsl:otherwise></xsl:choose>: <xsl:value-of select="cbc:CompanyID"/></div>
</xsl:for-each>
<xsl:if test="${party}/cac:PartyLegalEntity/cbc:CompanyID"><div>${t('reg')}: <xsl:value-of select="${party}/cac:PartyLegalEntity/cbc:CompanyID"/></div></xsl:if>
<xsl:if test="${party}/cbc:EndpointID"><div>${t('endpoint')}: <xsl:if test="${party}/cbc:EndpointID/@schemeID"><xsl:value-of select="${party}/cbc:EndpointID/@schemeID"/><xsl:text>:</xsl:text></xsl:if><xsl:value-of select="${party}/cbc:EndpointID"/></div></xsl:if>
<xsl:if test="${party}/cac:Contact">
<div>${t('contact')}: <xsl:value-of select="${party}/cac:Contact/cbc:Name"/></div>
<xsl:if test="${party}/cac:Contact/cbc:Telephone"><div><xsl:value-of select="${party}/cac:Contact/cbc:Telephone"/></div></xsl:if>
<xsl:if test="${party}/cac:Contact/cbc:ElectronicMail"><div><xsl:value-of select="${party}/cac:Contact/cbc:ElectronicMail"/></div></xsl:if>
</xsl:if>`;

/** Banka hesapları (IBAN / BIC / hesap adı). */
export const BANK = `<xsl:for-each select="cac:PaymentMeans[cac:PayeeFinancialAccount/cbc:ID]">
<div><b>IBAN</b><xsl:text> </xsl:text><xsl:value-of select="cac:PayeeFinancialAccount/cbc:ID"/></div>
<xsl:if test="cac:PayeeFinancialAccount/cac:FinancialInstitutionBranch/cbc:ID"><div><b>BIC</b><xsl:text> </xsl:text><xsl:value-of select="cac:PayeeFinancialAccount/cac:FinancialInstitutionBranch/cbc:ID"/></div></xsl:if>
<xsl:if test="cac:PayeeFinancialAccount/cbc:Name"><div><xsl:value-of select="cac:PayeeFinancialAccount/cbc:Name"/></div></xsl:if>
</xsl:for-each>`;

export const INFO_STRIP = `<xsl:if test="cac:InvoicePeriod or cac:Delivery">
<div class="info-strip">
<xsl:if test="cac:InvoicePeriod">
<b>${t('period')}:</b><xsl:text> </xsl:text>${date('cac:InvoicePeriod/cbc:StartDate')}<xsl:text> – </xsl:text>${date('cac:InvoicePeriod/cbc:EndDate')}<xsl:text>&#160;&#160;&#160;</xsl:text>
</xsl:if>
<xsl:if test="cac:Delivery/cbc:ActualDeliveryDate">
<b>${t('delivery')}:</b><xsl:text> </xsl:text>${date('cac:Delivery/cbc:ActualDeliveryDate')}<xsl:text>&#160;&#160;&#160;</xsl:text>
</xsl:if>
<xsl:if test="cac:Delivery/cac:DeliveryLocation/cac:Address or cac:Delivery/cac:DeliveryParty">
<b>${t('deliverTo')}:</b><xsl:text> </xsl:text>
<xsl:value-of select="cac:Delivery/cac:DeliveryParty/cac:PartyName/cbc:Name"/>
<xsl:for-each select="cac:Delivery/cac:DeliveryLocation/cac:Address">
<xsl:if test="../../cac:DeliveryParty"><xsl:text>, </xsl:text></xsl:if>
<xsl:value-of select="normalize-space(concat(cbc:StreetName, ', ', cbc:PostalZone, ' ', cbc:CityName, ' ', cac:Country/cbc:IdentificationCode))"/>
</xsl:for-each>
</xsl:if>
</div>
</xsl:if>`;

/** Kalem tablosu; sütun genişlikleri: sıra, miktar, birim fiyat, KDV %, net. */
export const lines = (w: [number, number, number, number, number] = [34, 86, 92, 54, 100]) => `<table class="lines">
<thead><tr>
<th class="c" style="width:${w[0]}px">${t('pos')}</th>
<th>${t('item')}</th>
<th class="r" style="width:${w[1]}px">${t('qty')}</th>
<th class="r" style="width:${w[2]}px">${t('price')}</th>
<th class="r" style="width:${w[3]}px">${t('vatRate')}</th>
<th class="r" style="width:${w[4]}px">${t('net')}</th>
</tr></thead>
<tbody>
<xsl:for-each select="cac:InvoiceLine | cac:CreditNoteLine">
<xsl:variable name="q" select="cbc:InvoicedQuantity | cbc:CreditedQuantity"/>
<tr>
<td class="c"><xsl:value-of select="cbc:ID"/></td>
<td>
<div class="item-name"><xsl:value-of select="cac:Item/cbc:Name"/></div>
<xsl:if test="cac:Item/cbc:Description"><div class="muted"><xsl:value-of select="cac:Item/cbc:Description"/></div></xsl:if>
<xsl:if test="cac:Item/cac:SellersItemIdentification/cbc:ID"><div class="muted">${t('itemNo')}<xsl:text> </xsl:text><xsl:value-of select="cac:Item/cac:SellersItemIdentification/cbc:ID"/></div></xsl:if>
<xsl:if test="cbc:Note"><div class="muted"><xsl:value-of select="cbc:Note"/></div></xsl:if>
<xsl:for-each select="cac:AllowanceCharge">
<div class="adj">
<xsl:choose>
<xsl:when test="cbc:ChargeIndicator='true'">+ ${t('charge')}</xsl:when>
<xsl:otherwise>− ${t('allowance')}</xsl:otherwise>
</xsl:choose>
<xsl:if test="cbc:AllowanceChargeReason"><xsl:text> · </xsl:text><xsl:value-of select="cbc:AllowanceChargeReason"/></xsl:if>
<xsl:text>: </xsl:text>${num('cbc:Amount')}
</div>
</xsl:for-each>
</td>
<td class="r">${num('$q', '4')}<xsl:text> </xsl:text><xsl:call-template name="unit"><xsl:with-param name="code" select="$q/@unitCode"/></xsl:call-template></td>
<td class="r">${num('cac:Price/cbc:PriceAmount', 'p')}<xsl:if test="cac:Price/cbc:BaseQuantity and number(cac:Price/cbc:BaseQuantity) != 1"><div class="muted">/ <xsl:value-of select="cac:Price/cbc:BaseQuantity"/></div></xsl:if></td>
<td class="r"><xsl:choose><xsl:when test="cac:Item/cac:ClassifiedTaxCategory/cbc:Percent">${num('cac:Item/cac:ClassifiedTaxCategory/cbc:Percent', '4')}%</xsl:when><xsl:otherwise><xsl:value-of select="cac:Item/cac:ClassifiedTaxCategory/cbc:ID"/></xsl:otherwise></xsl:choose></td>
<td class="r">${num('cbc:LineExtensionAmount')}</td>
</tr>
</xsl:for-each>
</tbody>
</table>`;

export const ALLOWANCES = `<xsl:if test="cac:AllowanceCharge">
${section('allowances')}
<table class="lines allow"><tbody>
<xsl:for-each select="cac:AllowanceCharge">
<tr>
<td>
<xsl:choose><xsl:when test="cbc:ChargeIndicator='true'">${t('charge')}</xsl:when><xsl:otherwise>${t('allowance')}</xsl:otherwise></xsl:choose>
<xsl:if test="cbc:AllowanceChargeReason"><xsl:text> · </xsl:text><xsl:value-of select="cbc:AllowanceChargeReason"/></xsl:if>
<xsl:if test="cbc:MultiplierFactorNumeric"><span class="muted"><xsl:text> (</xsl:text><xsl:value-of select="cbc:MultiplierFactorNumeric"/><xsl:text>% × </xsl:text>${num('cbc:BaseAmount')})</span></xsl:if>
</td>
<td class="r" style="width:90px">${t('vatRate')}<xsl:text> </xsl:text><xsl:value-of select="cac:TaxCategory/cbc:Percent"/>%</td>
<td class="r" style="width:110px"><xsl:if test="cbc:ChargeIndicator!='true'">− </xsl:if>${num('cbc:Amount')}</td>
</tr>
</xsl:for-each>
</tbody></table>
</xsl:if>`;

/** KDV dökümü; sütun genişlikleri: %, matrah, vergi. */
export const vatTable = (w: [number, number, number] = [56, 110, 100]) => `<table class="lines vat">
<thead><tr>
<th>${t('category')}</th>
<th class="r" style="width:${w[0]}px">%</th>
<th class="r" style="width:${w[1]}px">${t('taxable')}</th>
<th class="r" style="width:${w[2]}px">${t('taxAmount')}</th>
</tr></thead>
<tbody>
<xsl:for-each select="$vatTotal/cac:TaxSubtotal">
<tr>
<td>
<xsl:call-template name="vat-category"><xsl:with-param name="id" select="cac:TaxCategory/cbc:ID"/></xsl:call-template>
<span class="muted"><xsl:text> (</xsl:text><xsl:value-of select="cac:TaxCategory/cbc:ID"/>)</span>
<xsl:if test="cac:TaxCategory/cbc:TaxExemptionReason or cac:TaxCategory/cbc:TaxExemptionReasonCode">
<div class="muted">
<xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReasonCode"/>
<xsl:if test="cac:TaxCategory/cbc:TaxExemptionReasonCode and cac:TaxCategory/cbc:TaxExemptionReason"><xsl:text> · </xsl:text></xsl:if>
<xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReason"/>
</div>
</xsl:if>
</td>
<td class="r">${num('cac:TaxCategory/cbc:Percent', '4')}</td>
<td class="r">${num('cbc:TaxableAmount')}</td>
<td class="r">${num('cbc:TaxAmount')}</td>
</tr>
</xsl:for-each>
</tbody>
</table>`;

const payLine = (k: string, xp: string) =>
    `<xsl:if test="${xp}"><div><b>${t(k)}:</b><xsl:text> </xsl:text><xsl:value-of select="${xp}"/></div></xsl:if>`;

export const PAYMENT_DETAILS = `<xsl:for-each select="cac:PaymentMeans">
<div><b>${t('means')}:</b><xsl:text> </xsl:text><xsl:call-template name="means"><xsl:with-param name="code" select="cbc:PaymentMeansCode"/></xsl:call-template></div>
<xsl:if test="cac:PayeeFinancialAccount/cbc:ID"><div><b>IBAN:</b><xsl:text> </xsl:text><xsl:value-of select="cac:PayeeFinancialAccount/cbc:ID"/></div></xsl:if>
<xsl:if test="cac:PayeeFinancialAccount/cac:FinancialInstitutionBranch/cbc:ID"><div><b>BIC:</b><xsl:text> </xsl:text><xsl:value-of select="cac:PayeeFinancialAccount/cac:FinancialInstitutionBranch/cbc:ID"/></div></xsl:if>
${payLine('accountName', 'cac:PayeeFinancialAccount/cbc:Name')}
${payLine('remittance', 'cbc:PaymentID')}
${payLine('mandate', 'cac:PaymentMandate/cbc:ID')}
${payLine('card', 'cac:CardAccount/cbc:PrimaryAccountNumberID')}
</xsl:for-each>
<xsl:if test="cac:PaymentTerms/cbc:Note"><div class="terms"><b>${t('terms')}:</b><xsl:text> </xsl:text><xsl:value-of select="cac:PaymentTerms/cbc:Note"/></div></xsl:if>`;

export const PAYMENT = `<xsl:if test="cac:PaymentMeans or cac:PaymentTerms">
${section('payment')}
<div class="pay-box">
${PAYMENT_DETAILS}
</div>
</xsl:if>`;

export const NOTES = `<xsl:if test="cbc:Note">
${section('notes')}
<ul class="notes"><xsl:for-each select="cbc:Note"><li><xsl:call-template name="note-text"><xsl:with-param name="text" select="."/></xsl:call-template></li></xsl:for-each></ul>
</xsl:if>`;

const totalRow = (k: string, xp: string, sign = '', cur = '$cur') =>
    `<tr><td>${t(k)}</td><td>${sign}${money(xp, cur)}</td></tr>`;
const ifNonZero = (xp: string, row: string) => `<xsl:if test="${xp} and number(${xp}) != 0">${row}</xsl:if>`;

/** Toplamlar tablosu; grand: ödenecek tutar son satır (class="grand") olarak. */
export const totals = ({ grand = false } = {}) => `<table class="totals">
${totalRow('sumLines', '$totals/cbc:LineExtensionAmount')}
${ifNonZero('$totals/cbc:AllowanceTotalAmount', totalRow('totalAllow', '$totals/cbc:AllowanceTotalAmount', '− '))}
${ifNonZero('$totals/cbc:ChargeTotalAmount', totalRow('totalCharge', '$totals/cbc:ChargeTotalAmount'))}
${totalRow('taxExcl', '$totals/cbc:TaxExclusiveAmount')}
${totalRow('taxTotal', '$vatTotal/cbc:TaxAmount')}
<xsl:for-each select="cac:TaxTotal[not(cac:TaxSubtotal)][cbc:TaxAmount/@currencyID != $cur]">${totalRow('taxAccounting', 'cbc:TaxAmount', '', 'cbc:TaxAmount/@currencyID')}</xsl:for-each>
${totalRow('taxIncl', '$totals/cbc:TaxInclusiveAmount')}
${ifNonZero('$totals/cbc:PrepaidAmount', totalRow('prepaid', '$totals/cbc:PrepaidAmount', '− '))}
${ifNonZero('$totals/cbc:PayableRoundingAmount', totalRow('rounding', '$totals/cbc:PayableRoundingAmount'))}
${grand ? `<tr class="grand"><td>${t('payable')}</td><td>${PAYABLE_AMOUNT}</td></tr>` : ''}
</table>`;

export const PAYABLE = `<div class="payable"><div class="label">${t('payable')}</div><div class="amount">${PAYABLE_AMOUNT}</div></div>`;

/** İlgili (düzeltilen / iade edilen) faturalar. */
export const PRECEDING_LIST = `<xsl:for-each select="cac:BillingReference/cac:InvoiceDocumentReference">
<div class="ref-v"><xsl:value-of select="cbc:ID"/><xsl:if test="cbc:IssueDate"><xsl:text> · </xsl:text>${date('cbc:IssueDate')}</xsl:if></div>
</xsl:for-each>`;

export const FOOTER = `<div class="footer">
<div>${t('legal')}</div>
<div><xsl:value-of select="cbc:CustomizationID"/><xsl:if test="cbc:ProfileID"><xsl:text> · </xsl:text><xsl:value-of select="cbc:ProfileID"/></xsl:if></div>
</div>`;

/** Her tasarımda ortak temel CSS. */
export const BASE_CSS = `
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
table { font-size: inherit; color: inherit; border-collapse: collapse; }
.page { width: 794px; margin: 0 auto; background: #fff; }
.r { text-align: right !important; white-space: nowrap; }
.c { text-align: center !important; }
.item-name { font-weight: bold; }
.muted { font-size: 10px; opacity: .72; }
.adj { color: #b45309; font-size: 10px; }
.parties { width: 100%; table-layout: fixed; }
.parties td.pc { width: 50%; vertical-align: top; }
.party-name { font-weight: bold; }
.party-line { line-height: 1.5; }
.ids { margin-top: 8px; width: 100%; }
.ids td { padding: 1px 0; vertical-align: top; font-size: 10px; }
.ids td:first-child { width: 118px; opacity: .75; }
.lines { width: 100%; }
.lines th { text-align: left; }
.lines td { vertical-align: top; line-height: 1.45; }
.summary { width: 100%; }
.summary td.sl, .summary td.sr { vertical-align: top; }
.summary td.sl { width: 56%; padding-right: 22px; }
.totals { width: 100%; }
.totals td { padding: 5px 0; }
.totals td:last-child { text-align: right; white-space: nowrap; font-weight: bold; }
.pay-box { line-height: 1.6; }
.terms { margin-top: 6px; }
.notes { margin: 0; padding-left: 18px; line-height: 1.6; }
.info-strip { line-height: 1.6; }
.metas td.m { vertical-align: top; }
@media print { html, body { background: #fff !important; } .page { width: 100%; box-shadow: none !important; } }
`;
