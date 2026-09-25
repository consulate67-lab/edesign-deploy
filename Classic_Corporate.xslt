<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" 
    exclude-result-prefixes="cac cbc">

    <xsl:output method="html" encoding="UTF-8" indent="yes" />
    <xsl:decimal-format name="european" decimal-separator="," grouping-separator="." NaN="" />

    <xsl:template match="/">
        <html>
            <head>
                <title>Fatura</title>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 10px; color: #000; margin: 0; padding: 20px; }
                    .page-container { border: 1px solid #ccc; padding: 20px; max-width: 900px; margin: 0 auto; background: white; }
                    
                    /* Utility */
                    .w-full { width: 100%; }
                    .flex { display: flex; }
                    .justify-between { justify-content: space-between; }
                    .border-blue { border: 2px solid #1e3a8a; } /* Dark Blue */
                    .border-top-blue { border-top: 3px solid #1e3a8a; }
                    .border-bottom-blue { border-bottom: 3px solid #1e3a8a; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .font-bold { font-weight: bold; }
                    .mb-10 { margin-bottom: 10px; }
                    .mt-10 { margin-top: 10px; }
                    
                    /* Header */
                    .header-section { display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #ccc; margin-bottom: 20px; }
                    .company-logo { width: 150px; height: auto; display: block; }
                    .company-details { font-size: 9px; line-height: 1.3; margin-left: 20px; flex: 1; }
                    .company-title { font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #1e3a8a; }
                    .qr-code { width: 100px; height: 100px; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #888; border: 1px solid #ddd; }

                    /* Info Section */
                    .info-section { display: flex; gap: 10px; margin-bottom: 15px; align-items: stretch; }
                    
                    .customer-box { flex: 2; border: 1px solid #000; padding: 0; }
                    .box-header { background: #f3f3f3; color: #000; font-weight: bold; padding: 4px; border-bottom: 1px solid #000; font-size: 10px; }
                    .box-content { padding: 8px; font-size: 10px; line-height: 1.4; }
                    
                    .logo-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                    .gib-logo { width: 60px; height: auto; margin-bottom: 5px; }
                    .doc-type-label { font-size: 14px; font-weight: bold; color: #d00; }
                    
                    .invoice-meta { flex: 1.5; border: 1px solid #000; font-size: 9px; }
                    .meta-row { display: flex; border-bottom: 1px solid #ddd; }
                    .meta-row:last-child { border-bottom: none; }
                    .meta-label { width: 40%; background: #f3f3f3; padding: 4px; font-weight: bold; border-right: 1px solid #ddd; }
                    .meta-value { width: 60%; padding: 4px; }

                    /* ETTN Row */
                    .ettn-row { font-weight: bold; font-size: 10px; margin-bottom: 10px; padding: 4px 0; border-bottom: 1px solid #ccc; }

                    /* Items Table */
                    .items-table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 10px; }
                    .items-table th { border: 1px solid #888; background: #eee; padding: 6px 4px; font-weight: bold; text-align: center; }
                    .items-table td { border: 1px solid #888; padding: 6px 4px; }
                    
                    /* Footer Area */
                    .notes-area { width: 60%; float: left; font-size: 10px; border: 1px solid #ccc; padding: 8px; margin-right: 2%; min-height: 80px; }
                    .totals-area { width: 38%; float: right; }
                    .totals-table { width: 100%; border-collapse: collapse; font-size: 10px; }
                    .totals-table td { padding: 4px; border: 1px solid #888; }
                    .totals-label { background: #f3f3f3; font-weight: bold; text-align: right; }
                    .totals-value { text-align: right; }

                    /* Clear float */
                    .clearfix::after { content: ""; clear: both; display: table; }

                    /* Bank Info */
                    .bank-section { margin-top: 20px; border-top: 2px solid #eee; padding-top: 10px; }
                    .bank-title { font-weight: bold; margin-bottom: 5px; font-size: 10px; color: #555; }
                    .bank-table { width: 100%; font-size: 9px; border-collapse: collapse; }
                    .bank-table th { background: #1e3a8a; color: white; padding: 4px; text-align: left; }
                    .bank-table td { border: 1px solid #ddd; padding: 4px; }

                    /* Bottom Footer */
                    .bottom-footer { margin-top: 30px; text-align: center; font-size: 8px; color: #666; border-top: 2px solid #1e3a8a; padding-top: 5px; }
                </style>
            </head>
            <body>
                <div class="page-container">
                    
                    <!-- TOP HEADER: Logo & Company -->
                    <div class="header-section">
                        <div style="display:flex; align-items:center;">
                            <!-- Placeholder Logo -->
                             <svg class="company-logo" viewBox="0 0 200 60" style="width:120px; height:40px;">
                                <rect width="100%" height="100%" fill="#eee"/>
                                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="#888">LOGO</text>
                            </svg>
                            
                            <div class="company-details">
                                <div class="company-title">
                                    <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
                                </div>
                                <div>
                                    <strong>ADRES: </strong> 
                                    <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>
                                    <xsl:text> </xsl:text>
                                    <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:BuildingNumber"/>
                                    <xsl:text>, </xsl:text>
                                    <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CitySubdivisionName"/>
                                    <xsl:text> / </xsl:text>
                                    <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CityName"/>
                                </div>
                                <div style="display:flex; gap:10px; margin-top:4px;">
                                    <span><strong>TEL: </strong> 0312 000 00 00</span>
                                    <span><strong>WEB: </strong> <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cbc:WebsiteURI"/></span>
                                </div>
                                <div style="display:flex; gap:10px; margin-top:4px;">
                                    <span><strong>VKN: </strong> <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID='VKN']"/></span>
                                    <span><strong>VD: </strong> <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/></span>
                                </div>
                            </div>
                        </div>

                        <!-- QR Code -->
                        <div class="qr-code">
                            <div>KAREKOD</div>
                        </div>
                    </div>

                    <!-- MIDDLE SECTION: Customer & Meta -->
                    <div class="info-section">
                        <!-- Customer -->
                        <div class="customer-box">
                            <div class="box-header">SAYIN</div>
                            <div class="box-content">
                                <div class="font-bold mb-10">
                                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/>
                                    <xsl:if test="not(//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name)">
                                        <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Person/cbc:FirstName"/>
                                        <xsl:text> </xsl:text>
                                        <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Person/cbc:FamilyName"/>
                                    </xsl:if>
                                </div>
                                <div>
                                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>
                                    <xsl:text> </xsl:text>
                                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:CitySubdivisionName"/>
                                    <xsl:text> / </xsl:text>
                                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:CityName"/>
                                </div>
                                <div class="mt-10">
                                    <strong>VKN/TCKN: </strong> <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID"/>
                                </div>
                            </div>
                        </div>

                        <!-- Logo Center -->
                        <div class="logo-center">
                            <!-- GIB Logo Placeholder (Red Circle) -->
                            <div style="width:50px; height:50px; background:#e00; border-radius:50%; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px; margin-bottom:5px;">GIB</div>
                            <div class="doc-type-label">
                                <xsl:choose>
                                    <xsl:when test="//cbc:ProfileID = 'EARSIVFATURA'">e-Arşiv Fatura</xsl:when>
                                    <xsl:otherwise>e-Fatura</xsl:otherwise>
                                </xsl:choose>
                            </div>
                        </div>

                        <!-- Invoice Meta -->
                        <div class="invoice-meta">
                            <div class="meta-row">
                                <div class="meta-label">Özelleştirme No</div>
                                <div class="meta-value"><xsl:value-of select="//cbc:CustomizationID"/></div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-label">Senaryo</div>
                                <div class="meta-value"><xsl:value-of select="//cbc:ProfileID"/></div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-label">Fatura Tipi</div>
                                <div class="meta-value"><xsl:value-of select="//cbc:InvoiceTypeCode"/></div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-label">Fatura No</div>
                                <div class="meta-value"><xsl:value-of select="//cbc:ID"/></div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-label">Fatura Tarihi</div>
                                <div class="meta-value"><xsl:value-of select="//cbc:IssueDate"/></div>
                            </div>
                        </div>
                    </div>

                    <!-- ETTN -->
                    <div class="ettn-row">
                        ETTN: <span style="font-weight:normal"><xsl:value-of select="//cbc:UUID"/></span>
                    </div>

                    <!-- TABLE -->
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th style="width:30px">No</th>
                                <th>Mal / Hizmet</th>
                                <th style="width:50px">Miktar</th>
                                <th style="width:50px">Birim</th>
                                <th style="width:80px">Birim Fiyat</th>
                                <th style="width:60px">İsk. Oranı</th>
                                <th style="width:60px">İsk. Tutar</th>
                                <th style="width:40px">KDV</th>
                                <th style="width:60px">KDV Tutar</th>
                                <th style="width:90px">Mal Hizmet Tutarı</th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="//cac:InvoiceLine">
                                <tr>
                                    <td class="text-center"><xsl:value-of select="position()"/></td>
                                    <td><xsl:value-of select="cac:Item/cbc:Name"/></td>
                                    <td class="text-right"><xsl:value-of select="cbc:InvoicedQuantity"/></td>
                                    <td class="text-center"><xsl:value-of select="cbc:InvoicedQuantity/@unitCode"/></td>
                                    <td class="text-right"><xsl:value-of select="format-number(cac:Price/cbc:PriceAmount, '###.##0,00', 'european')"/></td>
                                    <td class="text-center">
                                        <!-- Discount Rate Logic if exists, usually calculated -->
                                         <xsl:choose>
                                            <xsl:when test="cac:AllowanceCharge/cbc:MultiplierFactorNumeric">
                                                %<xsl:value-of select="cac:AllowanceCharge/cbc:MultiplierFactorNumeric * 100"/>
                                            </xsl:when>
                                            <xsl:otherwise>0</xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td class="text-right">
                                         <xsl:choose>
                                            <xsl:when test="cac:AllowanceCharge/cbc:Amount">
                                                <xsl:value-of select="format-number(cac:AllowanceCharge/cbc:Amount, '###.##0,00', 'european')"/>
                                            </xsl:when>
                                            <xsl:otherwise>0,00</xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td class="text-center">
                                        %<xsl:value-of select="(cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:Percent) | (cac:Item/cac:ClassifiedTaxCategory/cbc:Percent)"/>
                                    </td>
                                    <td class="text-right">
                                        <xsl:value-of select="format-number((cac:TaxTotal/cac:TaxSubtotal/cbc:TaxAmount), '###.##0,00', 'european')"/>
                                    </td>
                                    <td class="text-right font-bold">
                                        <xsl:value-of select="format-number(cbc:LineExtensionAmount, '###.##0,00', 'european')"/>
                                    </td>
                                </tr>
                            </xsl:for-each>
                        </tbody>
                        <!-- Optional: Total Qty Row if needed, skipping for cleaner look akin to screenshot which has it outside or below -->
                    </table>
                    
                    <div style="text-align:right; font-size:10px; font-weight:bold; margin-bottom:10px; border-bottom:1px solid #ccc; padding-bottom:5px;">
                        Toplam Satır Sayısı: <xsl:value-of select="count(//cac:InvoiceLine)"/>
                    </div>

                    <!-- FOOTER CONTENT -->
                    <div class="clearfix">
                        <div class="notes-area">
                            <strong>Not:</strong> <br/>
                            <xsl:value-of select="//cbc:Note"/>
                        </div>

                        <div class="totals-area">
                            <table class="totals-table">
                                <tr>
                                    <td class="totals-label">Mal Hizmet Toplam Tutarı</td>
                                    <td class="totals-value"><xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:LineExtensionAmount, '###.##0,00', 'european')"/></td>
                                </tr>
                                <tr>
                                    <td class="totals-label">Hesaplanan KDV</td>
                                    <td class="totals-value"><xsl:value-of select="format-number(//cac:TaxTotal/cbc:TaxAmount, '###.##0,00', 'european')"/></td>
                                </tr>
                                <tr>
                                    <td class="totals-label">Vergiler Dahil Toplam Tutar</td>
                                    <td class="totals-value"><xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount, '###.##0,00', 'european')"/></td>
                                </tr>
                                <tr>
                                    <td class="totals-label" style="background:#ddd; font-size:11px;">Ödenecek Tutar</td>
                                    <td class="totals-value" style="font-weight:bold; font-size:12px;">
                                        <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:PayableAmount, '###.##0,00', 'european')"/> 
                                        <xsl:text> </xsl:text>
                                        <xsl:value-of select="//cbc:DocumentCurrencyCode"/>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- BANK INFO (Static Placeholder as requested) -->
                    <div class="bank-section">
                        <div class="bank-title">HESAP BİLGİLERİMİZ</div>
                        <table class="bank-table">
                            <thead>
                                <tr>
                                    <th>BANKA ADI</th>
                                    <th>ŞUBE ADI</th>
                                    <th>ŞUBE KODU</th>
                                    <th>HESAP NO</th>
                                    <th>IBAN</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Garanti Bankası TL</td>
                                    <td>İkitelli OSB Şubesi</td>
                                    <td>0373</td>
                                    <td>6298390</td>
                                    <td>TR45 0006 2000 3730 0006 2983 90</td>
                                </tr>
                                <tr>
                                    <td>Garanti Bankası USD</td>
                                    <td>İkitelli OSB Şubesi</td>
                                    <td>0373</td>
                                    <td>9091742</td>
                                    <td>TR48 0006 2000 3730 0009 0917 42</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- BOTTOM -->
                    <div class="bottom-footer">
                        BU BELGE ELEKTRONİK İMZALIDIR. İMZA GEÇERLİLİĞİ GİB ÜZERİNDEN KONTROL EDİLEBİLİR.
                    </div>

                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
