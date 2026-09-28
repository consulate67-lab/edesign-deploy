ï»¿<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="cac cbc">

    <xsl:output method="html" encoding="UTF-8" indent="yes"/>
    <xsl:strip-space elements="*"/>

    <!-- Ana sablon -->
    <xsl:template match="/">
        <html>
            <head>
                <meta charset="UTF-8"/>
                <title>e-ArÃÅ¸iv Fatura</title>
                <style><![CDATA[
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; background: #f8fafc; padding: 20px; }
                    .page { max-width: 800px; margin: 0 auto; background: #fff; padding: 32px 36px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                    .header { display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 16px; align-items: start; padding-bottom: 16px; border-bottom: 2px solid #1e3a8a; }
                    .logo-area { font-size: 22px; font-weight: 800; color: #f97316; line-height: 1; padding-top: 8px; }
                    .logo-area .tag { font-size: 9px; letter-spacing: 4px; color: #475569; margin-top: 4px; }
                    .center-title { text-align: center; }
                    .gib-logo { display: inline-flex; flex-direction: column; align-items: center; }
                    .gib-circle { width: 96px; height: 96px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 1px 6px rgba(30, 58, 138, 0.18); }
                    .gib-subtitle { font-size: 8px; color: #1e3a8a; margin-top: 4px; letter-spacing: 1.5px; font-weight: 700; }
                    .doc-title { font-size: 18px; font-weight: 800; color: #1e293b; margin-top: 8px; letter-spacing: 1px; }
                    .kase { font-size: 8px; color: #1e3a8a; margin-top: 6px; line-height: 1.4; }
                    .qr-area { width: 120px; height: 120px; background: repeating-conic-gradient(#1e293b 0deg 90deg, #fff 90deg 180deg); background-size: 8px 8px; border: 3px solid #1e293b; margin-left: auto; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; }
                    .info-box h3 { font-size: 11px; font-weight: 700; color: #1e3a8a; letter-spacing: 1px; margin-bottom: 6px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
                    .info-line { display: flex; font-size: 10px; line-height: 1.5; padding: 2px 0; }
                    .info-line .lbl { width: 90px; color: #64748b; flex-shrink: 0; }
                    .info-line .val { color: #1e293b; font-weight: 600; flex: 1; }
                    .belge-table { float: right; border-collapse: collapse; font-size: 10px; margin-top: 12px; }
                    .belge-table td { padding: 3px 8px; border: 1px solid #cbd5e1; }
                    .belge-table td:first-child { font-weight: 700; color: #475569; background: #f1f5f9; width: 100px; }
                    .belge-table td:last-child { font-weight: 600; min-width: 160px; }
                    .ettn { font-size: 8px; color: #64748b; margin-top: 16px; letter-spacing: 0.5px; word-break: break-all; }
                    .urun-table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 10px; }
                    .urun-table th { background: #1e3a8a; color: #fff; padding: 8px 6px; text-align: left; font-weight: 700; font-size: 10px; letter-spacing: 0.5px; }
                    .urun-table td { padding: 6px; border: 1px solid #cbd5e1; }
                    .urun-table td.num { text-align: right; }
                    .urun-table tr:last-child td { font-weight: 700; background: #f1f5f9; }
                    .signature { margin-top: 36px; padding: 28px; border: 4px dashed #4338ca; border-radius: 16px; background: linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(67,56,202,0.18) 100%); text-align: center; }
                    .signature .title { display: inline-block; padding: 8px 24px; background: linear-gradient(135deg, #4338ca, #6366f1); color: #fff; font-size: 16px; font-weight: 800; letter-spacing: 3px; border-radius: 8px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4); }
                    .signature .sub { font-size: 10px; color: #4338ca; letter-spacing: 2px; margin-top: 12px; font-weight: 700; }
                    .signature .body { font-size: 11px; color: #1e1b4b; margin-top: 16px; line-height: 1.6; max-width: 600px; margin-left: auto; margin-right: auto; }
                    .footer-note { font-size: 8px; color: #94a3b8; margin-top: 32px; text-align: center; line-height: 1.4; padding-top: 12px; border-top: 1px solid #e2e8f0; }
                ]]></style>
            </head>
            <body>
                <div class="page">
                    <!-- HEADER -->
                    <div class="header">
                        <!-- Sol: SatÃÂ±cÃÂ± Logo -->
                        <div class="logo-area">
                            <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
                            <div class="tag">YAZILIM</div>
                        </div>

                        <!-- Orta: GÃÂ°B Logo + BaÃÅ¸lÃÂ±k -->
                        <div class="center-title">
                            <div class="gib-logo">
                                <!-- Phase A.2.3: Gercek GIB logosu Ã¢â¬â mavi dis halka + egri yazilar + kirmizi GIB wordmark -->
                                <div class="gib-circle"><img src="data:image/jpeg;base64,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" style="width:100%;height:100%;display:block;border-radius:50%;object-fit:cover;" alt="GIB"/></div>
                            </div>
                            <div class="doc-title">e-ArÃÅ¸iv Fatura</div>
                            <div class="kase">
                                ÃâRNEK ÃÂ°MZALI KAÃÂE - 3<br/>
                                No.0000000000000001<br/>
                                ErcÃÂ¼yes Teknopark Tekno-3<br/>
                                TEL: 0000 000 00 00<br/>
                                ÃâRNEK V.D: 1111111111
                            </div>
                        </div>

                        <!-- SaÃÅ¸: QR Kod -->
                        <div class="qr-area"></div>
                    </div>

                    <!-- BÃÂ°LGÃÂ°LER: SatÃÂ±cÃÂ± + MÃÂ¼ÃÅ¸teri + Belge -->
                    <div class="info-grid">
                        <!-- Sol: SatÃÂ±cÃÂ± -->
                        <div class="info-box">
                            <h3>SATICI</h3>
                            <div class="info-line"><span class="lbl">Firma:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/></span></div>
                            <div class="info-line"><span class="lbl">Adres:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:StreetName"/></span></div>
                            <div class="info-line"><span class="lbl">Tel:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:Telephone"/></span></div>
                            <div class="info-line"><span class="lbl">Web Sitesi:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cbc:WebsiteURI"/></span></div>
                            <div class="info-line"><span class="lbl">E-Posta:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:ElectronicMail"/></span></div>
                            <div class="info-line"><span class="lbl">Vergi Dairesi:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme"/></span></div>
                            <div class="info-line"><span class="lbl">VKN:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"/></span></div>
                            <div class="info-line"><span class="lbl">Mersis No:</span><span class="val">0000000000000</span></div>
                            <div class="info-line"><span class="lbl">ÃÂ°ÃÅ¸letme Merkezi:</span><span class="val">[ÃÂ°ÃÅ¸letme Merkezi]</span></div>
                        </div>

                        <!-- SaÃÅ¸: MÃÂ¼ÃÅ¸teri + Belge -->
                        <div class="info-box">
                            <h3>SAYIN</h3>
                            <div class="info-line"><span class="lbl">Firma:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/></span></div>
                            <div class="info-line"><span class="lbl">Adres:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:StreetName"/></span></div>
                            <div class="info-line"><span class="lbl">E-Posta:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail"/></span></div>
                            <div class="info-line"><span class="lbl">Tel:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telephone"/></span></div>
                            <div class="info-line"><span class="lbl">Vergi Dairesi:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme"/></span></div>
                            <div class="info-line"><span class="lbl">VKN:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"/></span></div>

                            <table class="belge-table">
                                <tr><td>ÃâzelleÃÅ¸tirme No:</td><td><xsl:value-of select="//cbc:CustomizationID"/></td></tr>
                                <tr><td>Senaryo:</td><td><xsl:value-of select="//cbc:ProfileID"/></td></tr>
                                <tr><td>Fatura Tipi:</td>
                                    <td>
                                        <xsl:choose>
                                            <xsl:when test="//cbc:InvoiceTypeCode">
                                                <xsl:call-template name="arsiv-fmt-invoice-type">
                                                    <xsl:with-param name="code" select="//cbc:InvoiceTypeCode"/>
                                                </xsl:call-template>
                                            </xsl:when>
                                            <xsl:otherwise>SATIÅ</xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                </tr>
                                <tr><td>Fatura No:</td><td><xsl:value-of select="//cbc:ID"/></td></tr>
                                <tr><td>Fatura Tarihi:</td><td><xsl:value-of select="//cbc:IssueDate"/></td></tr>
                                <tr><td>Fatura Saati:</td><td><xsl:value-of select="substring(//cbc:IssueTime, 1, 5)"/></td></tr>
                            </table>

                            <div class="ettn">
                                <strong>ETTN:</strong> <xsl:value-of select="//cbc:UUID"/>
                            </div>
                        </div>
                    </div>

                    <!-- ÃÅRÃÅN/HÃÂ°ZMET -->
                    <table class="urun-table">
                        <thead>
                            <tr>
                                <th style="width:30px">SÃÂ±ra No</th>
                                <th>Mal/Hizmet</th>
                                <th style="width:60px">Miktar</th>
                                <th style="width:80px">Birim Fiyat</th>
                                <th style="width:60px">ÃÂ°skonto OranÃÂ±</th>
                                <th style="width:80px">ÃÂ°skonto TutarÃÂ±</th>
                                <th style="width:60px">KDV OranÃÂ±</th>
                                <th style="width:80px">KDV TutarÃÂ±</th>
                                <th style="width:90px">Mal Hizmet TutarÃÂ±</th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="//cac:InvoiceLine">
                                <tr>
                                    <td class="num"><xsl:value-of select="position()"/></td>
                                    <td><xsl:value-of select="cac:Item/cbc:Description"/></td>
                                    <td class="num"><xsl:value-of select="cbc:InvoicedQuantity"/> <xsl:value-of select="cbc:InvoicedQuantity/@unitCode"/></td>
                                    <td class="num"><xsl:value-of select="format-number(cac:Price/cbc:PriceAmount, '#,##0.00')"/> TL</td>
                                    <td class="num">%0</td>
                                    <td class="num">0,00 TL</td>
                                    <td class="num">
                                <xsl:value-of select="cac:TaxTotal/cac:TaxSubtotal/cbc:Percent"/>%
                                    </td>
                                    <td class="num">
                                <xsl:value-of select="format-number(cac:TaxTotal/cbc:TaxAmount, '#,##0.00')"/> TL
                                    </td>
                                    <td class="num">
                                <xsl:value-of select="format-number(cbc:LineExtensionAmount, '#,##0.00')"/> TL
                                    </td>
                                </tr>
                            </xsl:for-each>
                            <tr>
                                <td colspan="8" style="text-align:right">Mal Hizmet Toplam TutarÃÂ±</td>
                                <td class="num">
                                    <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:LineExtensionAmount, '#,##0.00')"/> TL
                                </td>
                            </tr>
                            <tr>
                                <td colspan="8" style="text-align:right">Toplam ÃÂ°skonto</td>
                                <td class="num">0,00 TL</td>
                            </tr>
                            <tr>
                                <td colspan="8" style="text-align:right">KDV Dahil Toplam Tutar</td>
                                <td class="num">
                                    <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount, '#,##0.00')"/> TL
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- E-ÃÂ°MZA ALANI (GÃÂ°B ZORUNLU) -->
                    <div class="signature">
                        <div class="title">E-ARÃÂÃÂ°V FATURASI</div>
                        <div class="sub">ELEKTRONÃÂ°K ÃÂ°MZA / E-ARÃÂÃÂ°V</div>
                        <div class="body">
                            Bu belge <strong>5070 sayÃÂ±lÃÂ± Elektronik ÃÂ°mza Kanunu</strong> ve <strong>GÃÂ°B e-ArÃÅ¸iv YÃÂ¶netmeliÃÅ¸i</strong> gereÃÅ¸i
                            elektronik olarak imzalanmÃÂ±ÃÅ¸tÃÂ±r. Belge iÃÂ§eriÃÅ¸i deÃÅ¸iÃÅ¸tirilemez; tahrifat halinde geÃÂ§ersizdir.
                            <br/><br/>
                            <strong>Belge No:</strong> <xsl:value-of select="//cbc:ID"/><br/>
                            <strong>ÃÂ°mza Tarihi:</strong> <xsl:value-of select="//cbc:IssueDate"/><br/>
                            <strong>Mali DeÃÅ¸er:</strong> <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:PayableAmount, '#,##0.00')"/> TL
                        </div>
                    </div>

                    <!-- FOOTER -->
                    <div class="footer-note">
                        Belge elektronik ortamda oluÃÅ¸turulmuÃÅ¸tur.<br/>
                        GÃÂ°B e-ArÃÅ¸iv sistemi ÃÂ¼zerinden elektronik imza ile onaylanmÃÂ±ÃÅ¸tÃÂ±r.
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>

    <!-- Phase 11.1: e-Arsiv icin Fatura Tipi kodunu Turkce karsiligina cevir -->
    <xsl:template name="arsiv-fmt-invoice-type">
        <xsl:param name="code" select="''"/>
        <xsl:choose>
            <xsl:when test="$code = 'SATIS'">SATIÅ</xsl:when>
            <xsl:when test="$code = 'IADE'">Ä°ADE</xsl:when>
            <xsl:when test="$code = 'EARSIVFATURA'">e-ARÅÄ°V FATURA</xsl:when>
            <xsl:when test="$code = 'EARSIVKAGITFATURA'">e-ARÅÄ°V KAGIT</xsl:when>
            <xsl:otherwise><xsl:value-of select="$code"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

</xsl:stylesheet>
