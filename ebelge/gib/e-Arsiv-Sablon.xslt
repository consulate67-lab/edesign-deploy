<?xml version="1.0" encoding="UTF-8"?>
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
                <title>e-Arşiv Fatura</title>
                <style><![CDATA[
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; background: #f8fafc; padding: 20px; }
                    .page { max-width: 800px; margin: 0 auto; background: #fff; padding: 32px 36px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                    .header { display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 16px; align-items: start; padding-bottom: 16px; border-bottom: 2px solid #1e3a8a; }
                    .logo-area { font-size: 22px; font-weight: 800; color: #f97316; line-height: 1; padding-top: 8px; }
                    .logo-area .tag { font-size: 9px; letter-spacing: 4px; color: #475569; margin-top: 4px; }
                    .center-title { text-align: center; }
                    .gib-logo { display: inline-flex; flex-direction: column; align-items: center; }
                    .gib-circle { width: 56px; height: 56px; border-radius: 50%; background: #1e3a8a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; }
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
                        <!-- Sol: Satıcı Logo -->
                        <div class="logo-area">
                            <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
                            <div class="tag">YAZILIM</div>
                        </div>

                        <!-- Orta: GİB Logo + Başlık -->
                        <div class="center-title">
                            <div class="gib-logo">
                                <div class="gib-circle">G</div>
                                <div class="gib-subtitle">T.C. MALİYE BAKANLIĞI<br/>GELİR İDARESİ BAŞKANLIĞI</div>
                            </div>
                            <div class="doc-title">e-Arşiv Fatura</div>
                            <div class="kase">
                                ÖRNEK İMZALI KAŞE - 3<br/>
                                No.0000000000000001<br/>
                                Ercüyes Teknopark Tekno-3<br/>
                                TEL: 0000 000 00 00<br/>
                                ÖRNEK V.D: 1111111111
                            </div>
                        </div>

                        <!-- Sağ: QR Kod -->
                        <div class="qr-area"></div>
                    </div>

                    <!-- BİLGİLER: Satıcı + Müşteri + Belge -->
                    <div class="info-grid">
                        <!-- Sol: Satıcı -->
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
                            <div class="info-line"><span class="lbl">İşletme Merkezi:</span><span class="val">[İşletme Merkezi]</span></div>
                        </div>

                        <!-- Sağ: Müşteri + Belge -->
                        <div class="info-box">
                            <h3>SAYIN</h3>
                            <div class="info-line"><span class="lbl">Firma:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/></span></div>
                            <div class="info-line"><span class="lbl">Adres:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:StreetName"/></span></div>
                            <div class="info-line"><span class="lbl">E-Posta:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail"/></span></div>
                            <div class="info-line"><span class="lbl">Tel:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telephone"/></span></div>
                            <div class="info-line"><span class="lbl">Vergi Dairesi:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme"/></span></div>
                            <div class="info-line"><span class="lbl">VKN:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"/></span></div>

                            <table class="belge-table">
                                <tr><td>Özelleştirme No:</td><td>TR1.2</td></tr>
                                <tr><td>Senaryo:</td><td>EARSIVFATURA</td></tr>
                                <tr><td>Fatura Tipi:</td><td>SATIS</td></tr>
                                <tr><td>Fatura No:</td><td><xsl:value-of select="//cbc:ID"/></td></tr>
                                <tr><td>Fatura Tarihi:</td><td><xsl:value-of select="//cbc:IssueDate"/></td></tr>
                                <tr><td>Fatura Saati:</td><td><xsl:value-of select="substring(//cbc:IssueTime, 1, 5)"/></td></tr>
                            </table>

                            <div class="ettn">
                                <strong>ETTN:</strong> <xsl:value-of select="//cbc:UUID"/>
                            </div>
                        </div>
                    </div>

                    <!-- ÜRÜN/HİZMET -->
                    <table class="urun-table">
                        <thead>
                            <tr>
                                <th style="width:30px">Sıra No</th>
                                <th>Mal/Hizmet</th>
                                <th style="width:60px">Miktar</th>
                                <th style="width:80px">Birim Fiyat</th>
                                <th style="width:60px">İskonto Oranı</th>
                                <th style="width:80px">İskonto Tutarı</th>
                                <th style="width:60px">KDV Oranı</th>
                                <th style="width:80px">KDV Tutarı</th>
                                <th style="width:90px">Mal Hizmet Tutarı</th>
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
                                <td colspan="8" style="text-align:right">Mal Hizmet Toplam Tutarı</td>
                                <td class="num">
                                    <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:LineExtensionAmount, '#,##0.00')"/> TL
                                </td>
                            </tr>
                            <tr>
                                <td colspan="8" style="text-align:right">Toplam İskonto</td>
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

                    <!-- E-İMZA ALANI (GİB ZORUNLU) -->
                    <div class="signature">
                        <div class="title">E-ARŞİV FATURASI</div>
                        <div class="sub">ELEKTRONİK İMZA / E-ARŞİV</div>
                        <div class="body">
                            Bu belge <strong>5070 sayılı Elektronik İmza Kanunu</strong> ve <strong>GİB e-Arşiv Yönetmeliği</strong> gereği
                            elektronik olarak imzalanmıştır. Belge içeriği değiştirilemez; tahrifat halinde geçersizdir.
                            <br/><br/>
                            <strong>Belge No:</strong> <xsl:value-of select="//cbc:ID"/><br/>
                            <strong>İmza Tarihi:</strong> <xsl:value-of select="//cbc:IssueDate"/><br/>
                            <strong>Mali Değer:</strong> <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:PayableAmount, '#,##0.00')"/> TL
                        </div>
                    </div>

                    <!-- FOOTER -->
                    <div class="footer-note">
                        Belge elektronik ortamda oluşturulmuştur.<br/>
                        GİB e-Arşiv sistemi üzerinden elektronik imza ile onaylanmıştır.
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>

</xsl:stylesheet>