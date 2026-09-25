<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" 
    xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
    exclude-result-prefixes="cac cbc n1">

    <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN"/>

    <xsl:decimal-format name="european" decimal-separator="," grouping-separator="." NaN="" />

    <xsl:template match="/">
        <html>
            <head>
                <title>E-Invoice</title>
                <style type="text/css">
                    body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-size: 10pt; color: #334155; margin: 0; padding: 20px; background: white; }
                    .container { width: 100%; max-width: 800px; margin: 0 auto; }
                    
                    /* Header */
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; }
                    .brand { display: flex; flex-direction: column; }
                    .brand h1 { margin: 0; font-size: 24pt; color: #0f172a; text-transform: uppercase; letter-spacing: -1px; }
                    .brand span { font-size: 10pt; color: #64748b; font-weight: 500; }
                    .meta td { padding: 2px 0; color: #475569; }
                    .meta strong { color: #0f172a; font-weight: 600; margin-right: 8px; }

                    /* Parties */
                    .parties { display: flex; width: 100%; gap: 2rem; margin-bottom: 2rem; }
                    .box { flex: 1; padding: 1.5rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
                    .box h3 { margin: 0 0 10px 0; font-size: 9pt; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }
                    .party-name { font-size: 11pt; font-weight: bold; color: #0f172a; margin-bottom: 8px; display: block; }
                    .address-line { display: block; margin-bottom: 2px; line-height: 1.4; color: #475569; }

                    /* Table */
                    table.lines { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                    table.lines th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 12px; font-size: 9pt; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
                    table.lines td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
                    table.lines tr:last-child td { border-bottom: none; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }

                    /* Totals */
                    .totals { display: flex; justify-content: flex-end; }
                    .totals-table { width: 300px; border-collapse: collapse; }
                    .totals-table td { padding: 8px; text-align: right; }
                    .totals-table .label { color: #64748b; font-weight: 500; }
                    .totals-table .amount { color: #0f172a; font-weight: 600; }
                    .grand-total { font-size: 14pt; border-top: 2px solid #0f172a; margin-top: 8px; padding-top: 12px !important; color: #0f172a; font-weight: 800 !important; }

                    /* Footer */
                    .footer { margin-top: 3rem; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 1rem; }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- HEADER -->
                    <div class="header">
                        <div class="brand">
                            <xsl:if test="//cbc:ProfileID = 'TICARIFATURA'">
                                <span style="color: #f59e0b; font-weight: bold;">TİCARİ FATURA</span>
                            </xsl:if>
                            <xsl:if test="//cbc:ProfileID = 'TEMELFATURA'">
                                <span style="color: #64748b; font-weight: bold;">TEMEL FATURA</span>
                            </xsl:if>
                            <h1>E-FATURA</h1>
                            <span><xsl:value-of select="//cbc:ID"/></span>
                        </div>
                        <table class="meta">
                            <tr>
                                <td><strong>ETTN:</strong></td>
                                <td><xsl:value-of select="//cbc:UUID"/></td>
                            </tr>
                            <tr>
                                <td><strong>Tarih:</strong></td>
                                <td><xsl:value-of select="//cbc:IssueDate"/></td>
                            </tr>
                            <tr>
                                <td><strong>Senaryo:</strong></td>
                                <td><xsl:value-of select="//cbc:ProfileID"/></td>
                            </tr>
                             <tr>
                                <td><strong>Para Birimi:</strong></td>
                                <td><xsl:value-of select="//cbc:DocumentCurrencyCode"/></td>
                            </tr>
                        </table>
                    </div>

                    <!-- PARTIES -->
                    <div class="parties">
                        <!-- Supplier -->
                        <div class="box">
                            <h3>Gönderen (Satıcı)</h3>
                            <span class="party-name">
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
                            </span>
                             <div class="address-line">
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>
                                <xsl:text> </xsl:text>
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:BuildingNumber"/>
                            </div>
                            <div class="address-line">
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CitySubdivisionName"/>
                                <xsl:text> / </xsl:text>
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CityName"/>
                            </div>
                            <div class="address-line">
                                <strong>VKN: </strong> <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID='VKN']"/>
                            </div>
                        </div>

                        <!-- Customer -->
                        <div class="box">
                            <h3>Alıcı (Müşteri)</h3>
                            <span class="party-name">
                                <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/>
                                <xsl:if test="not(//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name)">
                                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Person/cbc:FirstName"/>
                                    <xsl:text> </xsl:text>
                                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Person/cbc:FamilyName"/>
                                </xsl:if>
                            </span>
                             <div class="address-line">
                                <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>
                            </div>
                            <div class="address-line">
                                <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:CityName"/>
                            </div>
                            <div class="address-line">
                                <strong>VKN/TCKN: </strong> 
                                <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID"/>
                            </div>
                        </div>
                    </div>

                    <!-- LINES -->
                    <table class="lines">
                        <thead>
                            <tr>
                                <th width="5%">#</th>
                                <th width="35%">Ürün / Hizmet</th>
                                <th width="10%" class="text-right">Miktar</th>
                                <th width="12%" class="text-right">Birim Fiyat</th>
                                <th width="10%" class="text-right">İskonto</th>
                                <th width="8%" class="text-center">KDV</th>
                                <th width="10%" class="text-right">KDV Tutarı</th>
                                <th width="10%" class="text-right">Tutar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="//cac:InvoiceLine">
                                <tr>
                                    <td><xsl:value-of select="position()"/></td>
                                    <td>
                                        <div style="font-weight:600;"><xsl:value-of select="cac:Item/cbc:Name"/></div>
                                        <div style="font-size:8pt; color:#64748b;"><xsl:value-of select="cac:Item/cbc:Description"/></div>
                                    </td>
                                    <td class="text-right">
                                        <xsl:value-of select="cbc:InvoicedQuantity"/> 
                                        <xsl:text> </xsl:text>
                                        <span style="font-size:8pt"><xsl:value-of select="cbc:InvoicedQuantity/@unitCode"/></span>
                                    </td>
                                    <td class="text-right"><xsl:value-of select="format-number(cac:Price/cbc:PriceAmount, '###.##0,00', 'european')"/></td>
                                    <td class="text-right">
                                        <xsl:choose>
                                            <xsl:when test="cac:AllowanceCharge/cbc:Amount">
                                                 <xsl:value-of select="format-number(cac:AllowanceCharge/cbc:Amount, '###.##0,00', 'european')"/>
                                            </xsl:when>
                                            <xsl:otherwise>-</xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td class="text-center">
                                        %<xsl:value-of select="cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:Percent"/>
                                    </td>
                                    <td class="text-right">
                                        <xsl:value-of select="format-number(cac:TaxTotal/cac:TaxSubtotal/cbc:TaxAmount, '###.##0,00', 'european')"/>
                                    </td>
                                    <td class="text-right" style="font-weight:600;">
                                        <xsl:value-of select="format-number(cbc:LineExtensionAmount, '###.##0,00', 'european')"/>
                                    </td>
                                </tr>
                            </xsl:for-each>
                        </tbody>
                    </table>

                    <!-- TOTALS -->
                    <div class="totals">
                        <table class="totals-table">
                            <tr>
                                <td class="label">Ara Toplam</td>
                                <td class="amount"><xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:LineExtensionAmount, '###.##0,00', 'european')"/></td>
                            </tr>
                            <tr>
                                <td class="label">İskonto Toplamı</td>
                                <td class="amount"><xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount, '###.##0,00', 'european')"/></td>
                            </tr>
                            <tr>
                                <td class="label">KDV Toplamı</td>
                                <td class="amount"><xsl:value-of select="format-number(//cac:TaxTotal/cbc:TaxAmount, '###.##0,00', 'european')"/></td>
                            </tr>
                             <tr>
                                <td class="label grand-total">GENEL TOPLAM</td>
                                <td class="amount grand-total"><xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:PayableAmount, '###.##0,00', 'european')"/> <xsl:value-of select="//cbc:DocumentCurrencyCode"/></td>
                            </tr>
                        </table>
                    </div>

                    <!-- FOOTER -->
                    <div class="footer">
                        Bu belge elektronik imzalıdır.
                        <br/>
                        <xsl:value-of select="//cbc:Note"/>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
