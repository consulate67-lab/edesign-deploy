<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ccts="urn:un:unece:uncefact:documentation:2" xmlns:clm54217="urn:un:unece:uncefact:codelist:specification:54217:2001" xmlns:clm5639="urn:un:unece:uncefact:codelist:specification:5639:1988" xmlns:clm66411="urn:un:unece:uncefact:codelist:specification:66411:2001" xmlns:clmIANAMIMEMediaType="urn:un:unece:uncefact:codelist:specification:IANAMIMEMediaType:2003" xmlns:fn="http://www.w3.org/2005/xpath-functions" xmlns:link="http://www.xbrl.org/2003/linkbase" xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2" xmlns:udt="urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2" xmlns:xbrldi="http://xbrl.org/2006/xbrldi" xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:xdt="http://www.w3.org/2005/xpath-datatypes" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" exclude-result-prefixes="cac cbc ccts clm54217 clm5639 clm66411 clmIANAMIMEMediaType fn link n1 qdt udt xbrldi xbrli xdt xlink xs xsd xsi">
  <xsl:decimal-format name="european" decimal-separator="," grouping-separator="." NaN="" />
  <xsl:output version="4.0" method="html" indent="no" encoding="UTF-8" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" doctype-system="http://www.w3.org/TR/html4/loose.dtd" />
  <xsl:param name="SV_OutputFormat" select="'HTML'" />
  <xsl:variable name="XML" select="/" />
  <xsl:key name="unitcode" match="cbc:InvoicedQuantity" use="@unitCode" />
  <xsl:template match="/">
    <html>
      <head>
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title />
        <style type="text/css">body{
					    background-color:#FFFFFF;
					    font-family:'Tahoma', "Times New Roman", Times, serif;
					    font-size:11px;
					    color:#666666;
					    width:700px
					}
					
					h1,
					h2{
					    padding-bottom:3px;
					    padding-top:3px;
					    margin-bottom:5px;
					    text-transform:uppercase;
					    font-family:Arial, Helvetica, sans-serif;
					}
					
					h1{
					    font-size:1.4em;
					    text-transform:none;
					}
					
					h2{
					    font-size:1em;
					    color:brown;
					}
					
					h3{
					    font-size:1em;
					    color:#333333;
					    text-align:justify;
					    margin:0;
					    padding:0;
					}
					
					h4{
					    font-size:1.1em;
					    font-style:bold;
					    font-family:Arial, Helvetica, sans-serif;
					    color:#000000;
					    margin:0;
					    padding:0;
					}
					
					hr{
					    height:2px;
					    color:#000000;
					    background-color:#000000;
					    border-bottom:1px solid #000000;
					}
					
					p,
					ul,
					ol{
					    margin-top:1.5em;
					}
					
					ul,
					ol{
					    margin-left:3em;
					}
					
					blockquote{
					    margin-left:3em;
					    margin-right:3em;
					    font-style:italic;
					}
					
					a{
					    text-decoration:none;
					    color:#70A300;
					}
					
					a:hover{
					    border:none;
					    color:#70A300;
					}
					
					#despatchTable{
					    border-collapse:collapse;
					    font-size:11px;
					    float:right;
					    border-color:gray;
					
					}
					
					#ettnTable{
					    border-collapse:collapse;
					    font-size:11px;
					    border-color:gray;
					}
					
					#customerPartyTable{
					    border-width:0px;
					    border-spacing:;
					    border-style:inset;
					    border-color:gray;
					    border-collapse:collapse;
					    background-color:
					    }
					
					#customerIDTable{
					    border-width:2px;
					    border-spacing:;
					    border-style:inset;
					    border-color:gray;
					    border-collapse:collapse;
					    background-color:
					    }
					
					#customerIDTableTd{
					    border-width:2px;
					    border-spacing:;
					    border-style:inset;
					    border-color:gray;
					    border-collapse:collapse;
					    background-color:
					    }
					
					#lineTable{
					    border-width:1px;
					
					    border-style:inset;
					    border-color:gray;
					    border-collapse:collapse;
					
					}
					
					#lineTableTd{
					    border-width:1px;
					    padding:3px;
					    border-style:inset;
					    border-color:gray;
					    background-color:white;
					}
					
					#lineTableTr{
					    border-width:1px;
					    padding:0px;
					    border-style:inset;
					    border-color:white;
					    background-color:white;
					    -moz-border-radius:;
					}
					
					#lineTableDummyTd{
					    border-width:1px;
					    border-color:white;
					    padding:1px;
					    border-style:inset;
					    border-color:white;
					    background-color:white;
					}
					
					#lineTableBudgetTd{
					    border-width:1px;
					    border-spacing:0px;
					    padding:5px;
					    border-style:inset;
					    border-color:gray;
					    background-color:white;
					    -moz-border-radius:;
					}
					
					#notesTable{
					
					    border-width:2px;
					    border-spacing:;
					    border-style:inset;
					    border-color:white;
					    border-collapse:collapse;
					    background-color:
					    border:0px;
					    vertical-align:middle;
					    border-top:1px solid darkgray;
					    }
					
					#notesTableTd{
					
					
					    border-width:0px;
					    border-spacing:;
					    border-style:inset;
					    border-color:white;
					    border-collapse:collapse;
					    background-color:
					    }
					
					table{
					
					    border-spacing:2px;
					
					}
					
					#budgetContainerTable{
					
					    border-width:0px;
					    border-spacing:0px;
					    border-style:inset;
					    border-color:white;
					    border-collapse:collapse;
					
					    margin-top:5px
					
					}
					
					td{
					    border-color:gray;
					}
					#bankingTable{
			border-collapse:collapse;
			border-width: 0px;
			border-style: inset;
			font-size:11px;
			float:left;
			border-color:gray;
			}
			#bankingTable th{
			float:leftt;
			border-color:gray;
			background-color:#000099;
			color: white;
			}
			body2 {font-family:Tahoma;font-size:8pt;padding:0;margin:0;}
			a {color: #0000FF}
			a:hover {text-decoration:underline}
			
			.lastupdate {color:gray;font-size:8pt;padding-top:5px}
			.updatefreq {color:gray;font-size:8pt;padding-top:5px}
			.t {font-family:Tahoma;font-size:8pt;font-weight:bold;text-align:left;vertical-align:bottom}
			.r1 {vertical-align:top}
			.c1_1 {border-top:1px solid #000000;border-left:1px solid #000000}
			.c1_2 {font-weight:normal;vertical-align:bottom;border-top:1px solid #000000;border-left:1px solid #000000;border-right:1px solid #000000}
			.r7 {font-family:Tahoma;font-size:8pt;font-weight:normal}
			.c7_1 {border-top:1px solid #000000}
			.r8 {font-size:8pt}
			.c8_1 {border-top:1px solid #000000;border-left:1px solid #000000;border-right:1px solid #000000}
			.c17_1 {border-top:1px solid #000000;border-left:1px solid #000000;border-bottom:1px solid #000000}
			.c17_2 {border-top:1px solid #000000;border-left:1px solid #000000;border-right:1px solid #000000;border-bottom:1px solid #000000}
					</style>
        <title>e-Arşiv Fatura</title>
      </head>
      <body style="margin-left=0.6in; margin-right=0.6in; margin-bottom=0.79in;border-top: 2px solid #000099; height:auto; width:793px; margin-top:10px">
        <xsl:for-each select="$XML">
          <table cellspacing="0px" width="793" cellpadding="-20px" style="border-bottom:2px solid #000099; padding-top:10px; padding-bottom:10px;">
            <tbody>
              <tr valign="top" style="width:150px">
                <td style="vertical-align:top;">
									<img width="150px" alt="Firma Logo" style="margin-top:25px;margin-bottom:0px; margin-right:0px;margin-left:15px" src="data:image/png;base64,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"/>
								</td>
                <td>
                  <table>
                    <tbody>
                      <tr>
                        <td colspan="4" style="color:black;font-weight:bold;font-size:16px; padding-left:4px">
                          <xsl:for-each select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName">
                            <xsl:value-of select="cbc:Name" />
                          </xsl:for-each>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table>
                            <tbody>
                              <tr>
                                <td style="vertical-align:top;width:55px">
                                  <b>ADRES</b>
                                  <span style="float:right; font-weight:bold"> : </span>
                                </td>
                                <td style="vertical-align:top; " colspan="3">
                                  <xsl:for-each select="n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PostalAddress">
                                    <xsl:if test="cbc:Region !=''">
                                      <xsl:value-of select="cbc:Region" />
                                      <span>
                                        <xsl:text> </xsl:text>
                                      </span>
                                    </xsl:if>
                                    <xsl:for-each select="cbc:StreetName">
                                      <xsl:choose>
                                        <xsl:when test="contains(., 'Mersis No:')">
                                          <xsl:value-of select="normalize-space(substring-before(., 'Mersis No:'))" />
                                        </xsl:when>
                                        <xsl:otherwise>
                                          <xsl:value-of select="." />
                                        </xsl:otherwise>
                                      </xsl:choose>
                                      <span>
                                        <xsl:text> </xsl:text>
                                      </span>
                                    </xsl:for-each>
                                    <xsl:for-each select="cbc:BuildingName">
                                      <xsl:apply-templates />
                                    </xsl:for-each>
                                    <xsl:for-each select="cbc:BuildingNumber">
                                      <xsl:if test=". !=''">
                                        <span>
                                          <xsl:text> No : </xsl:text>
                                        </span>
                                        <xsl:value-of select="." />
                                      </xsl:if>
                                      <span>
                                        <xsl:text>
                                        </xsl:text>
                                      </span>
                                    </xsl:for-each>
                                    <xsl:for-each select="cbc:Room">
                                      <xsl:if test=". !=''">
                                        <span>
                                          <xsl:text>/</xsl:text>
                                        </span>
                                        <xsl:value-of select="." />
                                      </xsl:if>
                                      <span>
                                        <xsl:text>
                                        </xsl:text>
                                      </span>
                                    </xsl:for-each>
                                    <xsl:for-each select="cbc:PostalZone">
                                      <xsl:apply-templates />
                                      <span>
                                        <xsl:text>
                                        </xsl:text>
                                      </span>
                                    </xsl:for-each>
                                    <xsl:for-each select="cbc:CitySubdivisionName">
                                      <xsl:apply-templates />
                                    </xsl:for-each>
                                    <span>
                                      <xsl:text> / </xsl:text>
                                    </span>
                                    <xsl:for-each select="cbc:CityName">
                                      <xsl:apply-templates />
                                      <span>
                                        <xsl:text> </xsl:text>
                                      </span>
                                    </xsl:for-each>
                                  </xsl:for-each>
                                </td>
                              </tr>
                              <tr>
                                <td style="vertical-align:top">
                                  <b>TEL</b>
                                  <span style="float:right;font-weight:bold"> : </span>
                                </td>
                                <td style="vertical-align:top; width:92px">
                                  <xsl:for-each select="//cac:AccountingSupplierParty/cac:Party/cac:Contact">
                                    <xsl:if test="cbc:Telephone">
                                      <xsl:for-each select="cbc:Telephone">
                                        <xsl:apply-templates />
                                      </xsl:for-each>
                                    </xsl:if>
                                  </xsl:for-each>
                                </td>
                                <td style="vertical-align:top; width:95px">
                                  <b>E-MAIL</b>
                                  <span style="float:right; font-weight:bold"> : </span>
                                </td>
                                <td style="vertical-align:top">
                                  <xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:ElectronicMail">
                                    <xsl:value-of select="." />
                                  </xsl:for-each>
                                </td>
                              </tr>
                              <td style="vertical-align:top">
                                <b>FAX</b>
                                <span style="float:right;font-weight:bold"> : </span>
                              </td>
                              <td style="vertical-align:top">
                                <xsl:for-each select="//cac:AccountingSupplierParty/cac:Party/cac:Contact">
                                  <xsl:if test="cbc:Telefax">
                                    <xsl:for-each select="cbc:Telefax">
                                      <xsl:apply-templates />
                                    </xsl:for-each>
                                  </xsl:if>
                                </xsl:for-each>
                              </td>
                              <td style="vertical-align:top">
                                <b>Tic. Sicil No</b>
                                <span style="float:right; font-weight:bold"> : </span>
                              </td>
                              <td style="vertical-align:top">
                                <xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification">
                                  <xsl:if test="cbc:ID !='' and cbc:ID/@schemeID='TICARETSICILNO'">
                                    <xsl:value-of select="cbc:ID" />
                                  </xsl:if>
                                </xsl:for-each>
                              </td>
                              <tr>
                                <td style="vertical-align:top">
                                  <b>V.D.</b>
                                  <span style="float:right;font-weight:bold"> : </span>
                                </td>
                                <td style="vertical-align:top">
                                  <xsl:for-each select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme">
                                    <xsl:for-each select="cbc:Name">
                                      <xsl:apply-templates />
                                    </xsl:for-each>
                                  </xsl:for-each>
                                </td>
                                <td style="vertical-align:top">
                                  <b>Mersis No</b>
                                  <span style="float:right; font-weight:bold"> : </span>
                                </td>
                                <td style="vertical-align:top">
                                  <xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification">
                                    <xsl:if test="cbc:ID !='' and cbc:ID/@schemeID='MERSISNO'">
                                      <xsl:value-of select="cbc:ID" />
                                    </xsl:if>
                                  </xsl:for-each>
                                </td>
                              </tr>
                              <tr>
                                <td style="vertical-align:top">
                                  <b>VKN</b>
                                  <span style="float:right;font-weight:bold"> : </span>
                                </td>
                                <td style="vertical-align:top">
                                  <xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification">
                                    <xsl:if test="cbc:ID !='' and cbc:ID/@schemeID='VKN'">
                                      <xsl:value-of select="cbc:ID" />
                                    </xsl:if>
                                  </xsl:for-each>
                                </td>
                                <td style="vertical-align:top">
                                  <b>WEB</b>
                                  <span style="float:right;font-weight:bold"> : </span>
                                </td>
                                <td style="vertical-align:top">
                                  <xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cbc:WebsiteURI">
                                    <xsl:value-of select="." />
                                  </xsl:for-each>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
				<td><img align="right" src="{$QRSOVOS}" alt="qrcode" width="175px" /></td>
              </tr>
            </tbody>
          </table>
          <table cellspacing="0px" width="763" cellpadding="0px">
            <tbody>
              <tr style="height:118px; " valign="top">
                <td width="40%" valign="top" style="padding-top:10px">
                  <table id="customerPartyTable" align="left" border="0" height="50%" style="margin-bottom: 5px;border: 1px solid black; border-left-width:5px; width:95%; margin-left:-2px">
                    <tbody>
                      <tr style="height:71px; ">
                        <td style="padding:0px">
                          <table align="center" border="0" style="padding:5px 10px">
                            <tbody>
                              <tr>
                                <xsl:for-each select="n1:Invoice">
                                  <xsl:for-each select="cac:AccountingCustomerParty">
                                    <xsl:for-each select="cac:Party">
                                      <td style="width:469px; padding-bottom:2px; padding-left:2px " align="left">
                                        <span style="font-weight:bold; ">
                                          <xsl:text>SAYIN</xsl:text>
                                        </span>
                                      </td>
                                    </xsl:for-each>
                                  </xsl:for-each>
                                </xsl:for-each>
                              </tr>
                              <tr>
                                <xsl:for-each select="n1:Invoice">
                                  <xsl:for-each select="cac:AccountingCustomerParty">
                                    <xsl:for-each select="cac:Party">
                                      <td style="width:469px; padding:1px 0px; padding-left:2px" align="left">
                                        <xsl:if test="cac:PartyName">
                                          <xsl:value-of select="/cbc:Name" />
                                        </xsl:if>
                                        <xsl:for-each select="cac:Person">
                                          <xsl:for-each select="cbc:Title">
                                            <xsl:apply-templates />
                                            <span>
                                              <xsl:text> </xsl:text>
                                            </span>
                                          </xsl:for-each>
                                          <xsl:for-each select="cbc:FirstName">
                                            <xsl:apply-templates />
                                            <span>
                                              <xsl:text> </xsl:text>
                                            </span>
                                          </xsl:for-each>
                                          <xsl:for-each select="cbc:MiddleName">
                                            <xsl:apply-templates />
                                            <span>
                                              <xsl:text>  </xsl:text>
                                            </span>
                                          </xsl:for-each>
                                          <xsl:for-each select="cbc:FamilyName">
                                            <xsl:apply-templates />
                                            <span>
                                              <xsl:text> </xsl:text>
                                            </span>
                                          </xsl:for-each>
                                          <xsl:for-each select="cbc:NameSuffix">
                                            <xsl:apply-templates />
                                          </xsl:for-each>
                                        </xsl:for-each>
                                      </td>
                                    </xsl:for-each>
                                  </xsl:for-each>
                                </xsl:for-each>
                              </tr>
                              <tr>
                                <xsl:for-each select="n1:Invoice">
                                  <xsl:for-each select="cac:AccountingCustomerParty">
                                    <xsl:for-each select="cac:Party">
                                      <td style="width:469px; padding:1px 0px; padding-left:2px" align="left">
                                        <xsl:for-each select="cac:PostalAddress">
                                          <xsl:if test="cbc:Region !=''">
                                            <xsl:value-of select="cbc:Region" />
                                            <span>
                                              <xsl:text> </xsl:text>
                                            </span>
                                          </xsl:if>
                                          <xsl:for-each select="cbc:StreetName">
                                            <xsl:apply-templates />
                                            <span>
                                              <xsl:text> </xsl:text>
                                            </span>
                                          </xsl:for-each>
                                          <xsl:for-each select="cbc:BuildingName">
                                            <xsl:apply-templates />
                                          </xsl:for-each>
                                          <xsl:for-each select="cbc:BuildingNumber">
                                            <xsl:if test=". !=''">
                                              <span>
                                                <xsl:text> No : </xsl:text>
                                              </span>
                                              <xsl:value-of select="." />
                                            </xsl:if>
                                          </xsl:for-each>
                                          <xsl:for-each select="cbc:Room">
                                            <xsl:if test=". !=''">
                                              <span>
                                                <xsl:text>/</xsl:text>
                                              </span>
                                              <xsl:value-of select="." />
                                              <span>
                                                <xsl:text> </xsl:text>
                                              </span>
                                            </xsl:if>
                                          </xsl:for-each>
                                          <xsl:for-each select="cbc:PostalZone">
                                            <xsl:apply-templates />
                                            <span>
                                              <xsl:text> </xsl:text>
                                            </span>
                                          </xsl:for-each>
                                          <xsl:for-each select="cbc:CitySubdivisionName">
                                            <xsl:apply-templates />
                                          </xsl:for-each>
                                          <span>
                                            <xsl:text> / </xsl:text>
                                          </span>
                                          <xsl:for-each select="cbc:CityName">
                                            <xsl:apply-templates />
                                            <span>
                                              <xsl:text> </xsl:text>
                                            </span>
                                          </xsl:for-each>
                                        </xsl:for-each>
                                      </td>
                                    </xsl:for-each>
                                  </xsl:for-each>
                                </xsl:for-each>
                              </tr>
                              <xsl:if test="n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail !=''">
                                <xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail">
                                  <tr align="left" style="width:469px; padding:1px 0px; padding-left:2px">
                                    <td>
                                      <b>
                                        <xsl:text>E-Posta : </xsl:text>
                                      </b>
                                      <xsl:value-of select="." />
                                    </td>
                                  </tr>
                                </xsl:for-each>
                              </xsl:if>
                              <xsl:for-each select="n1:Invoice">
                                <xsl:for-each select="cac:AccountingCustomerParty">
                                  <xsl:for-each select="cac:Party">
                                    <xsl:for-each select="cac:Contact">
                                      <xsl:if test="cbc:Telephone !='' or cbc:Telefax !=''">
                                        <tr align="left">
                                          <td style="width:469px; padding:1px 0px; padding-left:2px;" align="left">
                                            <xsl:if test="cbc:Telephone !=''">
                                              <xsl:for-each select="cbc:Telephone">
                                                <span>
                                                  <b>
                                                    <xsl:text>Tel : </xsl:text>
                                                  </b>
                                                </span>
                                                <xsl:apply-templates />
                                              </xsl:for-each>
                                            </xsl:if>
                                            <xsl:if test="cbc:Telephone !='' and cbc:Telefax !=''">
                                              <b>
                                                <xsl:text> - </xsl:text>
                                              </b>
                                            </xsl:if>
                                            <xsl:if test="cbc:Telefax !=''">
                                              <xsl:for-each select="cbc:Telefax">
                                                <span>
                                                  <b>
                                                    <xsl:text>Fax : </xsl:text>
                                                  </b>
                                                </span>
                                                <xsl:apply-templates />
                                              </xsl:for-each>
                                            </xsl:if>
                                            <span>
                                              <xsl:text> </xsl:text>
                                            </span>
                                          </td>
                                        </tr>
                                      </xsl:if>
                                      <tr align="left">
                                        <td style="padding:1px 0px; padding-left:2px">
                                          <xsl:if test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name">
                                            <span>
                                              <b>
                                                <xsl:text>V.D. : </xsl:text>
                                              </b>
                                              <xsl:value-of select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name" />
                                              <xsl:text> - </xsl:text>
                                            </span>
                                          </xsl:if>
                                          <xsl:if test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID !=''">
                                            <xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification">
                                              <xsl:if test="cbc:ID/@schemeID = 'VKN'">
                                                <b>
                                                  <xsl:value-of select="cbc:ID/@schemeID" />
                                                  <xsl:text> : </xsl:text>
                                                </b>
                                                <xsl:value-of select="cbc:ID" />
                                              </xsl:if>
                                            </xsl:for-each>
                                          </xsl:if>
                                        </td>
                                      </tr>
                                    </xsl:for-each>
                                  </xsl:for-each>
                                </xsl:for-each>
                              </xsl:for-each>
                              <xsl:if test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID !=''">
                                <xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification">
                                  <xsl:if test="cbc:ID/@schemeID != 'VKN'">
                                    <tr align="left">
                                      <td style="width:469px; padding:1px 0px; padding-left:2px" align="left">
                                        <b>
                                          <xsl:value-of select="cbc:ID/@schemeID" />
                                          <xsl:text> : </xsl:text>
                                        </b>
                                        <xsl:value-of select="cbc:ID" />
                                      </td>
                                    </tr>
                                  </xsl:if>
                                </xsl:for-each>
                              </xsl:if>
                              <xsl:if test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:AgentParty/cac:PartyIdentification/cbc:ID !=''">
                                <xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:AgentParty/cac:PartyIdentification">
                                  <tr align="left">
                                    <td style="width:469px; padding:1px 0px; padding-left:2px" align="left">
                                      <b>
                                        <xsl:value-of select="cbc:ID/@schemeID" />
                                        <xsl:text> : </xsl:text>
                                      </b>
                                      <xsl:value-of select="cbc:ID" />
                                    </td>
                                  </tr>
                                </xsl:for-each>
                              </xsl:if>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td width="27%" align="center" valign="middle">
                  <img style="width:91px; margin-top:20px" align="middle" alt="E-Fatura Logo" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wgARCABYAFsDAREAAhEBAxEB/8QAHQAAAgICAwEAAAAAAAAAAAAABgcICQQFAAECA//EABwBAAEEAwEAAAAAAAAAAAAAAAMCBAUGAAEHCP/aAAwDAQACEAMQAAAAtS1nMzDVpcHGEO0CZkfXMPWZGU0KUoV63nMzpOCxxouQCdhKSNy6BlYNGrAmRi9+eKMAKb7I/rM129R8k25eJbijzQ1r3dIS1nv+Y9pNktu81nEtU00/C4o0x+BS5dIx96ZrUihYXWsSj+vB08HYlavNcPIDuNsVz8ppeTafNOnvGmjNMtXZHOS0G68qr6ciJAdhmDavND/e1qIET0ezmz+fNU4Ag5EMgo5afcoeDJzkpXUJz72yshu5o2PhcYq93CQ1h4dYlYuGih0p18Bjs1j5lM2Oc5uEpq557kwzwNxN78eVLUP2fLiz+dJqzHLvKsT51sZAFMbMmLszpcV+oLn/ALXBUqtuu/kqpmi+xLKbx5DkS+qS0BLKl+3lC3YatWRkM+fTTUKq33mGMH1qc1j4NCSA7ZcTePIBUtoglSbWdV9gty8zQYZCYM52cNZSZTQrKyDxvMfawJ0Jsuq802ZOtb9KzrMwVJSznYul3q9rI1A3+gMcCSoS+95zM//EACoQAAEFAQABAwMEAgMAAAAAAAUBAwQGBwIIABESEBMVCSExMhQWFyBB/9oACAEBAAEMAE/ZPoTKDAsB8oYIR4MNvYiNt7Vcup0ouKvV/tAPjh8zsvx52kncsxsg2BxqN2KMjtAuIyJCaa2k86Ures7HChOzLLm8a1QKNpdI0eE9Mp51qYqf9L7fRNAE8TprEibNtL5qfI6LaGo0pZ8xAa87dp9xtr/EIKPyLNK0DnCugjHYcjvHje+7x+Uu9XdcJal4iEfms60VL1XzgSw2yamOaGCndWkXDjUKBfdQnzAWg5FtMixS49LvaR41hRfoYLjwIqYbKyOGIdnvzQEnPs5Jhhy/4xlaDGeLYbj9scIqJ7qq+vK3yFWW/Mz2rz/tDy1s57e7cbjNI3mlGuu32L8OCZWOO8fsSD5ULQcKYYad0/KRGkQOPvzZI4mEkArtTkzq2VB+iN5DeitpGka7b+Gmbd6uz6Wq/V7NkVHIIHJ6oNv5IuNOoSb9eSuqLm1Ce4HPpwXuJ1yXI6itvddpU6kY0u4Q6aDTtOodbBeNGGSTQeA01KDbRba5vAGywrFPekC5nJGCzM59bdSFgW0TqdWzqMfsNumS6fd6Ft7rbEZU9SmXrlrFrmjjQtsvnIizChc161zYzk5fZE9eZGg9G9OJQGX1WGRldctuP9r+/hhntVpNdbv98MjhcjyClZlrmTz6YE0ivszsB8dJBnT+CxqxBiLoGGsAVHi9fzoQhk/STQt+BEnJBrRMl48XumtM1tIVCPJaKQAsid/L1ktAp90JXudbQcYnJDhxgAcyJEQm4sOS6jUd51f41Q64aOGSffa99LEcKlxoVlFXrZ8Z2A/+AiUcGOcAWFTdVlkQ5aDHamfpww3HTlqPfa9/XH7c+tNDnz1JnQKuUaHkcQhvrRLJJ7PjOoXjkj3/AANQPu+/zzKVHrOv65WZz6MN1S3Vm7B2z9UNRSo8xwrgmZxx/a0K4iutuJ7dZtH5lbBTY7n9BMeJErPMiRxx8dgKckShgt7InX6c1f8A8bOnCnfHt36X1p+tVgpjV/JVMtxKk0UD/q9KA1vnj4pu0aNSrvV9cn8IldxmaOp1yO5NMnk5hXvnntvvhf42ivvVbTLdWH0Xla0U/wBfvdbsH/mg2VkLhxywtuonGjSfiw2z/K+E9eQFjYFn4fBf6/v63i0IDoz8aDZuQxWvgbseP0vF7uW7Ky09WWuB7aAI1awQm5g1kbYojq4ZaZbr9sy268XOuff7WX1J/UIzqYHug7UQ8NyRDnvSn2l5/HSkWybd+f8ACcb38H+yZ2WSsJRljkZJ5XDgyBaALhfH29We212nQEJWQ1DHMLZJoWXM2nQ6j2OsOO0AnTg88zbJDcu2p7/TTsvruqAOQ5rp+JLtGg6CADLku1HY1ZlLqL9bhTRWn09kLT4NZyUt26kMqMXtiqVQCLebdcjNxLCGyGs2GABPlIMQpP3quCBk6BnoGdZniXChZT9N1EumtWbOcuMsHl07Up8Ypck9fL6kxAw2PfEmhsWfCI+Mz9cYfYxa/wA2sD7JTtZkwZo224JXLBx+IX7pH/I8d9ZjuWWNdtHsECy9+Lb/AOShZPr9l5dbtl/G00VQ80o2aDexlLr7I5tPr//EADYQAAMAAQMBBgQBDAMBAAAAAAECAwQABRESBhMhMVFhEBQiQYEVFiAjJDJicZGSobFCUlOT/9oACAEBAA0/APhjr12vkVE5zUfdmYgAfzOl573tJub/AJP2qajnlpmg73JA4P1TmZ/x6yMhpDE7KbHClFCwGQSr5NGNSIsrhJh6OGARGOs/bMh0oM2ES+4MljgyASIAStYiRPBPVaY0+xtumQuRtuBueGLyxBk1xz3RTIkQhXg0QA9aAEl15w6iGXmdlslPmoOERqg4VX5oZl+7YToXDowCaxn7rKxnR4ZWI480tCoWsm9nUH9HMqMbbNtxR15OfkkfTKS/5LHwVeSTqGVD5HY8gm2ybLCjdAy2lJ+vN6LERrRuDNySEVAC+5ycjab5jUrikrMCHdBBMCdEt02WhFJuhKBix0+dTdDj5jd5HGYzCFJBvBIia9ImPpCkrxx4ax2mZ990MUM26k4JHh0sORp5d0xRxPlPoBX6ePAiUwR6IBrYtqyTtm3Yu5Nk5e75lslsqt8o9Cd2gq3UZByanwLIB9QyVwth3fZppPeM2rkCGO0Skp2LOSDKiiYXgkp4sKypXbs2EqQxd8jIlavKVAHheZBFcZ+WmfIsPjhRa9qMfBUUEk6ysI02zbN1N4pg7QVZ3GGsx13sQAKdzzQMw5AWeqZN9w2XZKcUGz/Mjm5Nj+stWhJJZyAF6R0B+strFJnueSjcGzDzip9B99Angn21BlGXlhfpQE+Q9WOiA1mPBvQnjks3nrGxsnEx8/FlGlVhkJ0WkUsjzIcAeakggEawL4n5pVw5sdyw91Xxq8QvL2eFSDW4msj1urAjknsrkjbd7lMcJV+kNLKmPtOyEOvoeR8JKd/3mf8A3jFgMabezX4Yg+YiRpxGu4bNujjcmw7rQ2xaQpUtXFAdrUE+SnLkoE+G7c4uH6pz+8/4DQJLknksx8SSfuSfHVz1ZFR5RiP3mP8Aoe51KSQxCyjlrv4d4x1kZsZZqm7MLo54ZSOeCOPIcaogOknTb0eGFzlSoQHnXvEKHwMgAXos0BYE801vgh2P7YQxbisFFyWxrFgeCYZYMg3iQuS/w23tFhjbdt3OtJ4u6R23EArGjzBKql89Kg8NxScyVYA63PPvnfL4uXTKhho5HEZ2qqs6ggnkqoBYgAD4dnYphyH271lDORpuSCfXW/sXgc2wmWip8AvVoFL4jfPIF71DyAeDrZqLVMPAzkyX5B4DvwTwNIgGqYdHTHy0VoUog65hw5CletVJDEL66wcHJzsI7Vu0cl45i/tCJ8vjwnDFRSilUR6a3TbMbM596TVj/vW3dt98x5Jkr1IiVOOeek/crNODrHBWUZjhVBPPA0iFj+A1nblepPsXbj/HGs3KlAAfxMBraNsliSFrgM1P+Z441gVMLmTcqHHmAfbVqxxSfYfV8BTGyEpZ6JOk5XnWsWaYLKKzR5FgrcB+elwCpx9upHK2/AyszJibHGQG7NlxjRGbodukL0frfUcn83sLn/5DVMrB7TQLngCN8YTq3PoKY7c6ozKuRjUDqWUkEexB02PQD+06nk0VgfUMdPvGOD/dqMTQk/bgcnW4ble34F241nZ97c+wIHx2yGRstECMjTzqDu0mQQDyTRTra9txsTj3SYU/61dadkO1zeQngZpCY+Q38M8kzDE+S1bWOiZSZeTCcI5MZqigSVST9CUipYgBtMvB1h7pV0HqjnrXj24YawN0xrEnyAFBzzpNpd5sPV04H+xoIWP8zo4i1P8ANz1H4Z95Yu33Y0SfzRJaU61RT3COyhethx48a2PNPbPtNd3Wxliycrt2FaoUCrvU9fJAJTHPw3bGpiZcHHIpJ1KsP6HXZ6QyezeRbK+Tj2v2qZ4kl8hVNC+N4GslILdKnxBPGDQ4+Re+C+Kl2BINIq/iZEghT58Dx1vcBiZhihfi0x9J/FdA+B7lvA/01fIx9myY90xctPxbkefBVdVqkgO5byLcemo4sp/0UDTuJTfJqJqzseAOT6ngavkNsvZ3YsG9Bmb1RiyRxbxPM7cPw6WQkBSWPAGu0+T+Ut8yEPKCpHCY8z/5RThF/E/HDsMzat0w37vL23LX9y8H81YeRHkw5B1m1niYXbrHxj+Td4xi3DK5B/YMor4EOSnPip1tERj4Wc1qZlMkdTLDpYjipMJNVmBPAcDnkHmUYZNZv0I0p2AaZZSB09QK8A8HRK9fKggFmAB4APmSBzrdHX5THeY6qFm6VI4HABY8cnWyZsMPco44Mnx51LAUTkHvPFCoA++nzvmez/ZnBiRkzmvKyfNqGE5oV4NOtQgbk/Vq0THFjjKfktix288bEB8ST5PU8F/Yfo5KlL42TJaSop+zKwII9iNX6jXszusRvGw1581XHyOXx1P3EXUe2svNluF8/spv/wAla2RNelKGOUOG4UAdDMykeY1uWHh4Fo42Zt5is8V5tIoy1AB5koJP21tsDi4+T2g7TyxoiTUSnDxx2oKgPNG4YHWS5fI2nsRgrCtySSe8zag0BJJ5M1Un11VjS9SzWyMlz5va9C1LMfV2J/Q//8QALREAAQMDAgUDAwUBAAAAAAAAAQACAwQREiExBRATIkEyUWEUI0MzgaGxwUL/2gAIAQIBAT8AsCtk2N0jrDVCBrO2Q/soIGPucNvcqlEU7D26iydTt1szQfKkghHpNinwlos4aLzbnZRRmRRsFrRaD38lTyQ4BjdXBOq5PVdCvijNs03ijW/9qCvp5fN7/wAJhvKWQ6t9lVUgiJLdubGOe7EJkOVo2en/AFVVRftG/k+6+VxSvAb02lGQkWKoqOSqPwqaCKmHTYdVTVPRfcjQqWMxOEjXZX39lPHgQ4ek8oWmOMyefCfUudHZ2/utyuIVX0zPlSvLyclRwfVOwUzRQU2TFTVchqcrppyaHKlmuwxSGwUYEjXQHxqFgU3sgFhp5Uzmn08uMz5S2CIt2hcLhjp2Xeq0x1MODXLh9BjLkSmi2igeY5QQi4Nna73T24uIUs72MaG7WTnF1z5Xuqx5klJKgZlI1VlHI8AMUnUjcWuK4H3tJuvhUzxFKC7VVJvI3T+v8U/6hU+sEbh8pjstU/QFTblqoB94KwDCVVOu8rg8eMPK9gqO0kwI2Ckfm8uKh+7C6Dz4THYyGFEZKvZ0qktVI60gKlkxpi74UmrgqBuMI5TOI0CoY/pKZ0j93aDlG8xHMKqp21LevD+6YchvqFxmkL5Oo0alR08sZ2UsjzSYqGmldJ3hUoLIwAnuY3uKpIX1Ly9+gHlVMwkNm7DbnDP0XXCmpWVAMlMbD2Ti5rTk3ZNiieiyO2KwjYe4LrhwtGqbhpkbnMdFNUjDoxizf7QCvzY57TkDZCrZN21Dbo01JLs6ybw6mH5v4TqSl/JJdNmpoNImXT53Sboc/wD/xAAxEQABAwMCBAQFAwUAAAAAAAABAAIDBAURBhIhMUFRBxAUIhMgYXGBM7HBIyQyQmL/2gAIAQMBAT8A8iQEZD0RcWjBKflrskoFw6prpG/5cU1/yudhYKaAo4BIQxoyU3St2kAcISR+EdHXh5/QKrbJWUA/uGYTvamSebjhF6jb1d5eHWiA8NuNYPsFDRwxt2kDC1VqmCwMLY8F3RagvVVd5DJLwB+ikZu4pvHgoz5E5QjX+uVojT5vdwbuHsbxKt1JHTQBoGAtV36KzUTnZ93RW0TasvgZOcglai07Qx2J0YYPaFK0McWhOG3is4KCa7KZy8vCyy+ktbag83p7xHGXOWvK+qvdY+ClaSG9lpFlfYroyrkhJatdavkmo/TxN27lIcuJT+SaPYmngom+UTN7w3utMUQpKGNo5YC1DVemo3v7BaX1Tbbc+Q1Yy5xVsdTXGBtQxgwV4s1A+M2JnBdU/kmn2pnJQsLnGNvVTQSUx2SjiqMhs7M9x+6s420zPsFrh5jtkpHZM3SVO1vMn+Vp+I0tuYzsF4lVQnuLo+y6cVwJyOaqqeWBue6AIHFNe6nkbKOiurHVcLKwck07X5WjKz19nin+i1bTeptkrR2VmovUXqOD/r9uKgHp6X8fwtZVHqrpK/6rGVZ4c1IfKzLQr1PT1dVil4NCzlFoe3aVaqz07vgyclWQiKXLeR5Lwn1LHBTOt9ScbeX5VTeaCaEs3hWe301LqveXDZxOVcb1RxUbtjxkAq6zGaqe/uVTU0tS/ZGMq41DaSL0sDshMZg58vsnsyPbzVBVtpZN07cnomUbXhstHLl7vwnVdex2zJQq6oO3jO7uopq+saX5JaOajsz3u31Dg3t1Vbe44fZQs2d+qDHOd8R54/KWh4/qKPdD+kcKG5VkLg48cJ94qCANnJQ3OspgWRcMp8s8hDpDnCaz5P/Z" />
                  <h1 align="center" style="padding:0px">
                    <span style="font-weight:bold; ">
                      <xsl:text>e-Arşiv Fatura</xsl:text>
                    </span>
                  </h1>
                  <img alt="" width="110px" src="data:image/jpeg;base64,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" />
                </td>
                <td width="33%" align="center" valign="top" colspan="2" style="padding-top:10px">
                  <table border="0" height="13" id="despatchTable" style="border: 1px solid black; margin-right: 0px;">
                    <tbody>
                      <xsl:if test="n1:Invoice/cbc:CustomizationID !=''">
                        <tr style="height:13px; ">
                          <td style="width:105px; padding:4px;background-color: #; color: black; " align="left">
                            <span style="font-weight:bold; ">
                              <xsl:text>Özelleştirme No</xsl:text>
                            </span>
                          </td>
                          <td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding:4px">
                            <span>:</span>
                          </td>
                          <td style="padding: 4px; min-width: 112px;padding:4px;" align="left">
                            <xsl:for-each select="n1:Invoice">
                              <xsl:for-each select="cbc:CustomizationID">
                                <xsl:apply-templates />
                              </xsl:for-each>
                            </xsl:for-each>
                          </td>
                        </tr>
                      </xsl:if>
                      <xsl:if test="n1:Invoice/cbc:ProfileID !=''">
                        <tr style="height:13px; ">
                          <td align="left" style="width:105px; padding: 4px; background-color: #; color: black; ">
                            <span style="font-weight:bold; ">
                              <xsl:text>Senaryo</xsl:text>
                            </span>
                          </td>
                          <td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">
                            <span>:</span>
                          </td>
                          <td align="left" style="padding: 4px; ">
                            <xsl:for-each select="n1:Invoice">
                              <xsl:for-each select="cbc:ProfileID">
                                <xsl:apply-templates />
                              </xsl:for-each>
                            </xsl:for-each>
                          </td>
                        </tr>
                      </xsl:if>
                      <xsl:if test="n1:Invoice/cbc:InvoiceTypeCode !=''">
                        <tr style="height:13px; ">
                          <td align="left" style="width:105px; padding: 4px; background-color: #; color: black; ">
                            <span style="font-weight:bold; ">
                              <xsl:text>Fatura Tipi</xsl:text>
                            </span>
                          </td>
                          <td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">
                            <span>:</span>
                          </td>
                          <td align="left" style="padding: 4px;">
                            <xsl:for-each select="n1:Invoice">
                              <xsl:for-each select="cbc:InvoiceTypeCode">
                                <xsl:apply-templates />
                              </xsl:for-each>
                            </xsl:for-each>
                          </td>
                        </tr>
                      </xsl:if>
                      <xsl:if test="n1:Invoice/cbc:ID !=''">
                        <tr style="height:13px; ">
                          <td align="left" style="width:105px; padding: 4px; background-color: #;color:black ">
                            <span style="font-weight:bold; ">
                              <xsl:text>Fatura No</xsl:text>
                            </span>
                          </td>
                          <td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">
                            <span>:</span>
                          </td>
                          <td align="left" style="padding: 4px; ">
                            <xsl:for-each select="n1:Invoice">
                              <xsl:for-each select="cbc:ID">
                                <xsl:apply-templates />
                              </xsl:for-each>
                            </xsl:for-each>
                          </td>
                        </tr>
                      </xsl:if>
                      <xsl:if test="n1:Invoice/cbc:IssueDate !=''">
                        <tr style="height:13px; ">
                          <td align="left" style="width:105px; padding: 4px; background-color: #; color:black">
                            <span style="font-weight:bold; ">
                              <xsl:text>Fatura Tarihi</xsl:text>
                            </span>
                          </td>
                          <td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">
                            <span>:</span>
                          </td>
                          <td align="left" style="padding: 4px;">
                            <xsl:for-each select="n1:Invoice">
                              <xsl:for-each select="cbc:IssueDate">
                                <xsl:value-of select="substring(.,9,2)" />-<xsl:value-of select="substring(.,6,2)" />-<xsl:value-of select="substring(.,1,4)" /></xsl:for-each>
                            </xsl:for-each>
                          </td>
                        </tr>
                        <tr style="height:13px; ">
                          <td align="left" style="width:105px; padding: 4px; background-color: #; color:black">
                            <span style="font-weight:bold; ">
                              <xsl:text>Fatura Zamanı</xsl:text>
                            </span>
                          </td>
                          <td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">
                            <span>:</span>
                          </td>
                          <td align="left" style="padding: 4px;">
                            <xsl:if test="n1:Invoice/cbc:IssueTime != ''">
                              <xsl:value-of select="n1:Invoice/cbc:IssueTime" />
                            </xsl:if>
                          </td>
                        </tr>
                        <xsl:for-each select="n1:Invoice/cac:DespatchDocumentReference">
                          <xsl:if test="cbc:ID !=''">
                            <tr style="height:13px; ">
                              <td align="left" style="width:105px; padding: 4px;background-color: #; color: black; ">
                                <span style="font-weight:bold; ">
                                  <xsl:text>İrsaliye No :</xsl:text>
                                </span>
                              </td>
                              <td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">
                                <span>:</span>
                              </td>
                              <td align="left" style="padding: 4px">
                                <xsl:value-of select="cbc:ID" />
                              </td>
                            </tr>
                          </xsl:if>
                          <xsl:if test="cbc:IssueDate !=''">
                            <tr style="height:13px; ">
                              <td align="left" style="width:105px; padding: 4px; background-color: #; color: black; ">
                                <span style="font-weight:bold; ">
                                  <xsl:text>İrsaliye Tarihi :</xsl:text>
                                </span>
                              </td>
                              <td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">
                                <span>:</span>
                              </td>
                              <td align="left">
                                <xsl:for-each select="cbc:IssueDate">
                                  <xsl:value-of select="substring(.,9,2)" />-<xsl:value-of select="substring(.,6,2)" />-<xsl:value-of select="substring(.,1,4)" /></xsl:for-each>
                              </td>
                            </tr>
                          </xsl:if>
                        </xsl:for-each>
                      </xsl:if>
                    </tbody>
                  </table>
                </td>
              </tr>
               <tr align="Left">
                <table id="ettnTable" style="width:377px; margin-bottom:5px">
                  <tr style="height:13px;">
                    <td align="left" valign="top"  style="width:80px ;padding: 5px; color:red ;">
                      <span style="font-weight:bold; ">
                      
                        <xsl:text>E-İRSALİYE YERİNE GEÇER. </xsl:text>
                      </span>
                    </td>
                    
                  </tr>
                </table>
              </tr>
              <tr align="left">
                <table id="ettnTable" style="width:377px; margin-bottom:5px">
                  <tr style="height:13px;">
                    <td align="left" valign="top" style="width:40px ;padding: 5px; color:black;">
                      <span style="font-weight:bold; ">
                        <xsl:text>ETTN :</xsl:text>
                      </span>
                    </td>
                    <td align="left" style="color:dimgray; font-weight:bold ">
                      <xsl:for-each select="n1:Invoice">
                        <xsl:for-each select="cbc:UUID">
                          <xsl:apply-templates />
                        </xsl:for-each>
                      </xsl:for-each>
                    </td>
                  </tr>
                </table>
              </tr>
            </tbody>
          </table>
          <table id="lineTable" width="793" style="border:0px; border-color: gray;">
            <tbody>
              <tr id="lineTableTr">
                <td id="lineTableTd" style="background-color: #; color: black;" align="center">
                  <span style="font-weight:bold; ">
                    <xsl:text>No</xsl:text>
                  </span>
                </td>
                <td id="lineTableTd" style="width:294px; background-color: #; color: black;" align="center">
                  <span style="font-weight:bold; ">
                    <xsl:text>Mal Hizmet</xsl:text>
                  </span>
                </td>
                <td id="lineTableTd" style="background-color: #; color: black;" align="center">
                  <span style="font-weight:bold;">
                    <xsl:text>Miktar</xsl:text>
                  </span>
                </td>
                <td id="lineTableTd" style="background-color: #; color: black;" align="center">
                  <span style="font-weight:bold;">
                    <xsl:text>Birim</xsl:text>
                  </span>
                </td>
                <td id="lineTableTd" style="width:74px; background-color: #; color: black;" align="center">
                  <span style="font-weight:bold; ">
                    <xsl:text>Fiyat</xsl:text>
                  </span>
                </td>
                <td id="lineTableTd" style="width:74px; background-color: #; color: black;" align="center">
                  <span style="font-weight:bold; ">
                    <xsl:text>İskonto Oranı</xsl:text>
                  </span>
                </td>
                <td id="lineTableTd" style="background-color: #; color: black;" align="center">
                  <span style="font-weight:bold; ">
                    <xsl:text>İskonto Tutarı</xsl:text>
                  </span>
                </td>
                <td id="lineTableTd" style="width:100px; background-color: #; color: black;" align="center">
                  <span style="font-weight:bold; ">
                    <xsl:text>KDV Oranı</xsl:text>
                  </span>
                </td>
                <td id="lineTableTd" style="width:84px; background-color: #; color: black;" align="center">
                  <span style="font-weight:bold; ">
                    <xsl:text>KDV Tutarı</xsl:text>
                  </span>
                </td>
                <td id="lineTableTd" style="width:84px; background-color: #; color: black;" align="center">
                  <span style="font-weight:bold; ">
                    <xsl:text>Mal Hizmet Tutarı</xsl:text>
                  </span>
                </td>
              </tr>
              <xsl:for-each select="//n1:Invoice/cac:InvoiceLine">
                <xsl:choose>
                  <xsl:when test=".">
                    <xsl:apply-templates select="." />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:Invoice" />
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:for-each>
              <tr>
                <td colspan="3" style="text-align:right;">
                  <b>Toplam Miktar : </b>
                </td>
                <td style="border:1px solid gray; " colspan="4">
                  <xsl:text> </xsl:text>
                  <xsl:for-each select="//cbc:InvoicedQuantity[generate-id(.)=generate-id(key('unitcode', @unitCode)[1])]">
                    <xsl:variable name="uCode">
                      <xsl:value-of select="@unitCode" />
                    </xsl:variable>
                    <xsl:variable name="lstInvoiceQ" select="//cbc:InvoicedQuantity[@unitCode=$uCode]" />
                    <xsl:call-template name="ShowEmployeesInTeam">
                      <xsl:with-param name="lstInvoiceQ" select="$lstInvoiceQ" />
                    </xsl:call-template>
                  </xsl:for-each>
                </td>
              </tr>
            </tbody>
          </table>
        </xsl:for-each>
        <xsl:variable name="allowTotStyle">
          <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount != 0">min-height:121px;</xsl:if>
        </xsl:variable>
        <table style="margin-left:-3px; margin-right:-3px;">
          <tbody>
            <tr>
              <td style="width:59%; vertical-align:top">
                <table id="notesTable" align="left" width="100%" style="height:auto;min-height: 97px;{$allowTotStyle}border: 1px solid gray;padding-bottom:15px;">
                  <tbody>
                    <tr align="left" valign="top">
                      <td id="notesTableTd" style="padding:10px; width:60%">
                        <xsl:for-each select="//n1:Invoice/cbc:Note">
                          <xsl:variable name="itm" select="." />
                          <xsl:if test="not(starts-with($itm, 'e-Arşiv'))">
                            <xsl:if test="not(starts-with($itm, 'İrsaliye'))">
                              <b>
                                <xsl:value-of select="$itm" disable-output-escaping="yes" />
                              </b>
                              <br />
                            </xsl:if>
                          </xsl:if>
                        </xsl:for-each>
                        <xsl:for-each select="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">
                          <xsl:if test="cbc:Percent=0 and cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015'">
                            <b>      Vergi İstisna Muafiyet Sebebi: </b>
                            <xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReason" />
                            <br />
                          </xsl:if>
                        </xsl:for-each>
                        <xsl:for-each select="n1:Invoice/cac:PaymentMeans">
                          <xsl:if test="cbc:InstructionNote !=''">
                            <b>Ödeme Notu : </b>
                            <xsl:value-of select="//n1:Invoice/cac:PaymentMeans/cbc:InstructionNote" />
                            <br />
                          </xsl:if>
                          <xsl:if test="cbc:PaymentNote !=''">
                            <b>Hesap Açıklaması : </b>
                            <xsl:value-of select="//n1:Invoice/cac:PaymentMeans/cac:PayeeFinancialAccount/cbc:PaymentNote" />
                            <br />
                          </xsl:if>
                        </xsl:for-each>
                      </td>
                    </tr>
                    <tr align="left" valign="top">
                      <td id="notesTableTd" style="padding-left:10px; padding-bottom:10px">
                        <xsl:for-each select="n1:Invoice/cac:PaymentMeans">
                          <xsl:if test="cbc:PaymentDueDate !=''">
                            <b>VADE TARİHİ : </b>
                            <xsl:for-each select="cbc:PaymentDueDate">
                              <xsl:value-of select="substring(.,9,2)" />-<xsl:value-of select="substring(.,6,2)" />-<xsl:value-of select="substring(.,1,4)" /></xsl:for-each>
                            <br />
                          </xsl:if>
                        </xsl:for-each>
                        <xsl:for-each select="n1:Invoice/cac:TaxExchangeRate">
                          <xsl:if test="cbc:CalculationRate !=0">
                            <xsl:if test="cbc:SourceCurrencyCode = 'USD'and cbc:TargetCurrencyCode = 'TRY'">
                              <b>1 DOLAR =</b>
                              <xsl:value-of select="cbc:CalculationRate" />
                              <b>  TL OLARAK ALINMIŞTIR</b>
                            </xsl:if>
                          </xsl:if>
                        </xsl:for-each>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td style="vertical-align:top">
                <table id="budgetContainerTable" width="100%" style="margin-top:0px">
                  <tr id="budgetContainerTr" align="right">
                    <td id="lineTableBudgetTd" align="right" style="background-color: #; color: black;width:68%">
                      <span style="font-weight:bold; ">
                        <xsl:text>Mal Hizmet Toplam Tutarı</xsl:text>
                      </span>
                    </td>
                    <td id="lineTableBudgetTd" style="width:32%;" align="right">
                      <span>
                        <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount, '###.##0,00', 'european')" />
                        <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID">
                          <xsl:text>
                          </xsl:text>
                          <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID = 'TRY'">
                            <xsl:text>TL</xsl:text>
                          </xsl:if>
                          <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID != 'TRY'">
                            <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID" />
                          </xsl:if>
                        </xsl:if>
                      </span>
                    </td>
                  </tr>
                  <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount != 0">
                    <tr id="budgetContainerTr" align="right">
                      <td id="lineTableBudgetTd" align="right" width="200px" style="background-color: #; color: black">
                        <span style="font-weight:bold; ">
                          <xsl:text>Toplam İskonto</xsl:text>
                        </span>
                      </td>
                      <td id="lineTableBudgetTd" style="width:104px; " align="right">
                        <span>
                          <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount, '###.##0,00', 'european')" />
                          <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID">
                            <xsl:text>
                            </xsl:text>
                            <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID = 'TRY'">
                              <xsl:text>TL</xsl:text>
                            </xsl:if>
                            <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID != 'TRY'">
                              <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID" />
                            </xsl:if>
                          </xsl:if>
                        </span>
                      </td>
                    </tr>
                  </xsl:if>
                  <tr id="budgetContainerTr" align="right">
                    <tr id="budgetContainerTr" align="right">
                      <td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
                        <span style="font-weight:bold; ">
                          <xsl:text>Vergiler Hariç Toplam Tutar</xsl:text>
                        </span>
                      </td>
                      <td id="lineTableBudgetTd" style="width:32%;" align="right">
                        <span>
                          <xsl:for-each select="n1:Invoice">
                            <xsl:for-each select="cac:LegalMonetaryTotal">
                              <xsl:for-each select="cbc:TaxExclusiveAmount">
                                <xsl:value-of select="format-number(., '###.##0,00', 'european')" />
                                <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount/@currencyID">
                                  <xsl:text>
                                  </xsl:text>
                                  <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount/@currencyID = 'TRY'">
                                    <xsl:text>TL</xsl:text>
                                  </xsl:if>
                                  <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount/@currencyID != 'TRY'">
                                    <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount/@currencyID" />
                                  </xsl:if>
                                </xsl:if>
                              </xsl:for-each>
                            </xsl:for-each>
                          </xsl:for-each>
                        </span>
                      </td>
                    </tr>
                  </tr>
                  <xsl:for-each select="n1:Invoice/cac:WithholdingTaxTotal/cac:TaxSubtotal">
                    <tr id="budgetContainerTr" align="right">
                      <td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
                        <span style="font-weight:bold; ">
                          <xsl:text>KDV Tevkifatı </xsl:text>
                          <xsl:text>(%</xsl:text>
                          <xsl:value-of select="cbc:Percent" />
                          <xsl:text>)</xsl:text>
                        </span>
                      </td>
                      <td id="lineTableBudgetTd" style="width:104px; " align="right">
                        <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                          <xsl:text>
                          </xsl:text>
                          <xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
                          <xsl:if test="../../cbc:TaxAmount/@currencyID">
                            <xsl:text>
                            </xsl:text>
                            <xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRY' or ./../cbc:TaxAmount/@currencyID = 'TRY'">
                              <xsl:text>TL</xsl:text>
                            </xsl:if>
                            <xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRY' and ./../cbc:TaxAmount/@currencyID != 'TRY'">
                              <xsl:value-of select="../../cbc:TaxAmount/@currencyID" />
                            </xsl:if>
                          </xsl:if>
                        </xsl:for-each>
                      </td>
                    </tr>
                  </xsl:for-each>
                  <xsl:if test="sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount)&gt;0">
                    <tr id="budgetContainerTr" align="right">
                      <td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
                        <span style="font-weight:bold; ">
                          <xsl:text>Tevkifata Tabi İşlem Tutarı</xsl:text>
                        </span>
                      </td>
                      <td id="lineTableBudgetTd" style="width:104px; " align="right">
                        <xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:LineExtensionAmount), '###.##0,00', 'european')" />
                        <xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">
                          <xsl:text>TL</xsl:text>
                        </xsl:if>
                        <xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">
                          <xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />
                        </xsl:if>
                      </td>
                    </tr>
                    <tr id="budgetContainerTr" align="right">
                      <td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color:black">
                        <span style="font-weight:bold; ">
                          <xsl:text>Tevkifata Tabi İşlem Üzerinden Hes. KDV</xsl:text>
                        </span>
                      </td>
                      <td id="lineTableBudgetTd" style="width:104px; " align="right">
                        <xsl:value-of select="format-number(sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount), '###.##0,00', 'european')" />
                        <xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">
                          <xsl:text>TL</xsl:text>
                        </xsl:if>
                        <xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">
                          <xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />
                        </xsl:if>
                      </td>
                    </tr>
                  </xsl:if>
                  <xsl:if test="n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]">
                    <tr id="budgetContainerTr" align="right">
                      <td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
                        <span style="font-weight:bold; ">
                          <xsl:text>Tevkifata Tabi İşlem Tutarı</xsl:text>
                        </span>
                      </td>
                      <td id="lineTableBudgetTd" style="width:104px; " align="right">
                        <xsl:if test="n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]">
                          <xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]/cbc:LineExtensionAmount), '###.##0,00', 'european')" />
                        </xsl:if>
                        <xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='9015'">
                          <xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:LineExtensionAmount), '###.##0,00', 'european')" />
                        </xsl:if>
                        <xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY' or n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">
                          <xsl:text> TL</xsl:text>
                        </xsl:if>
                        <xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY' and n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">
                          <xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />
                        </xsl:if>
                      </td>
                    </tr>
                    <tr id="budgetContainerTr" align="right">
                      <td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
                        <span style="font-weight:bold; ">
                          <xsl:text>Tevkifata Tabi İşlem Üz. Hes. KDV</xsl:text>
                        </span>
                      </td>
                      <td id="lineTableBudgetTd" style="width:104px; " align="right">
                        <xsl:if test="n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]">
                          <xsl:value-of select="format-number(sum(n1:Invoice/cac:WithholdingTaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme]/cbc:TaxableAmount), '###.##0,00', 'european')" />
                        </xsl:if>
                        <xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='9015'">
                          <xsl:value-of select="format-number(sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount), '###.##0,00', 'european')" />
                        </xsl:if>
                        <xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY' or n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">
                          <xsl:text> TL</xsl:text>
                        </xsl:if>
                        <xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY' and n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">
                          <xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />
                        </xsl:if>
                      </td>
                    </tr>
                  </xsl:if>
                  <tr id="budgetContainerTr" align="right">
                    <xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">
                      <tr id="budgetContainerTr" align="right">
                        <td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
                          <span style="font-weight:bold; ">
                            <xsl:text>KDV </xsl:text>
                            <xsl:text>(%</xsl:text>
                            <xsl:value-of select="cbc:Percent" />
                            <xsl:text>/</xsl:text>
                            <xsl:value-of select="format-number(cbc:TaxableAmount, '###.##0,00', 'european')" />
                            <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                              <xsl:if test="../../cbc:TaxAmount/@currencyID">
                                <xsl:text>
                                </xsl:text>
                                <xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRY'">
                                  <xsl:text>TL</xsl:text>
                                </xsl:if>
                                <xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRY'">
                                  <xsl:value-of select="../../cbc:TaxAmount/@currencyID" />
                                </xsl:if>
                              </xsl:if>
                              <xsl:text>)</xsl:text>
                              <xsl:text>
                              </xsl:text>
                            </xsl:for-each>
                          </span>
                        </td>
                        <td id="lineTableBudgetTd" style="width:104px; " align="right">
                          <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                            <xsl:text>
                            </xsl:text>
                            <xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
                            <xsl:if test="../../cbc:TaxAmount/@currencyID">
                              <xsl:text>
                              </xsl:text>
                              <xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRY'">
                                <xsl:text>TL</xsl:text>
                              </xsl:if>
                              <xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRY'">
                                <xsl:value-of select="../../cbc:TaxAmount/@currencyID" />
                              </xsl:if>
                            </xsl:if>
                          </xsl:for-each>
                        </td>
                      </tr>
                    </xsl:for-each>
                  </tr>
                  <tr id="budgetContainerTr" align="right">
                    <td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
                      <span style="font-weight:bold; ">
                        <xsl:text>Beyan Edilecek Toplam KDV</xsl:text>
                      </span>
                    </td>
                    <td align="right" id="lineTableBudgetTd" style="width:104px; ">
                      <xsl:for-each select="n1:Invoice">
                        <xsl:for-each select="cac:TaxTotal">
                          <xsl:for-each select="cbc:TaxAmount">
                            <xsl:value-of select="format-number(., '###.##0,00', 'european')" />
                            <xsl:if test="//n1:Invoice/cac:TaxTotal/cbc:TaxAmount/@currencyID">
                              <xsl:text>
                              </xsl:text>
                              <xsl:if test="//n1:Invoice/cac:TaxTotal/cbc:TaxAmount/@currencyID = 'TRY'">
                                <xsl:text>TL</xsl:text>
                              </xsl:if>
                              <xsl:if test="//n1:Invoice/cac:TaxTotal/cbc:TaxAmount/@currencyID != 'TRY'">
                                <xsl:value-of select="//n1:Invoice/cac:TaxTotal/cbc:TaxAmount/@currencyID" />
                              </xsl:if>
                            </xsl:if>
                          </xsl:for-each>
                        </xsl:for-each>
                      </xsl:for-each>
                    </td>
                  </tr>
                  <tr id="budgetContainerTr" align="right">
                    <td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
                      <span style="font-weight:bold; ">
                        <xsl:text>Vergiler Dahil Toplam Tutar</xsl:text>
                      </span>
                    </td>
                    <td id="lineTableBudgetTd" style="width:104px; " align="right">
                      <xsl:for-each select="n1:Invoice">
                        <xsl:for-each select="cac:LegalMonetaryTotal">
                          <xsl:for-each select="cbc:TaxInclusiveAmount">
                            <xsl:value-of select="format-number(., '###.##0,00', 'european')" />
                            <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID">
                              <xsl:text>
                              </xsl:text>
                              <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID = 'TRY'">
                                <xsl:text>TL</xsl:text>
                              </xsl:if>
                              <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID != 'TRY'">
                                <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID" />
                              </xsl:if>
                            </xsl:if>
                          </xsl:for-each>
                        </xsl:for-each>
                      </xsl:for-each>
                    </td>
                  </tr>
                  <tr id="budgetContainerTr" align="right">
                    <td id="lineTableBudgetTd" style=" background-color: #; color: black; width:200px" align="right">
                      <span style="font-weight:bold; ">
                        <xsl:text>Ödenecek Tutar</xsl:text>
                      </span>
                    </td>
                    <td id="lineTableBudgetTd" style="width:104px; " align="right">
                      <xsl:for-each select="n1:Invoice">
                        <xsl:for-each select="cac:LegalMonetaryTotal">
                          <xsl:for-each select="cbc:PayableAmount">
                            <xsl:value-of select="format-number(., '###.##0,00', 'european')" />
                            <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID">
                              <xsl:text>
                              </xsl:text>
                              <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID = 'TRY'">
                                <xsl:text>TL</xsl:text>
                              </xsl:if>
                              <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID != 'TRY'">
                                <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID" />
                              </xsl:if>
                            </xsl:if>
                          </xsl:for-each>
                        </xsl:for-each>
                      </xsl:for-each>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <table id="notesTable" align="left" width="100%" style="height:auto;border: 1px solid gray; ">
                  <tbody>
                    <tr align="left" valign="top">
                      <td id="notesTableTd" style="padding:5px 10px; width:60%">
                        <xsl:for-each select="n1:Invoice/cbc:Note">
                          <xsl:if test="contains(., 'Yazı ile yalnız :')">
                            <b>
                              <xsl:value-of select="normalize-space(substring-before(.,':'))" />: </b>
                            <xsl:value-of select="normalize-space(substring-after(.,':'))" />
                            <br />
                          </xsl:if>
                        </xsl:for-each>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <body2>
              <table class="t">
                <tr style="height:19px" class="r1">
                  <td class="c1_1" style="width:200px">
			Ödeme şekli
		</td>
                  <td class="c1_2" style="width:200px">
                    <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference">
                      <xsl:text>
                      </xsl:text>
                      <xsl:if test="./cbc:ID='PaymentMethod'">
                        <xsl:value-of select="./cbc:DocumentType" />
                      </xsl:if>
                    </xsl:for-each>
                    <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference/cbc:DocumentType">
                      <xsl:variable name="itm" select="." />
                      <xsl:if test="starts-with($itm, 'KR')">
                        <b>
                          <xsl:value-of select="$itm" disable-output-escaping="yes" />
                        </b>
                        <br />
                      </xsl:if>
                    </xsl:for-each>
                    <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference/cbc:DocumentType">
                      <xsl:variable name="itm" select="." />
                      <xsl:if test="starts-with($itm, 'EFT')">
                        <b>
                          <xsl:value-of select="$itm" disable-output-escaping="yes" />
                        </b>
                        <br />
                      </xsl:if>
                    </xsl:for-each>
                    <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference/cbc:DocumentType">
                      <xsl:variable name="itm" select="." />
                      <xsl:if test="starts-with($itm, 'KAPIDA')">
                        <b>
                          <xsl:value-of select="$itm" disable-output-escaping="yes" />
                        </b>
                        <br />
                      </xsl:if>
                    </xsl:for-each>
                    <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference/cbc:DocumentType">
                      <xsl:variable name="itm" select="." />
                      <xsl:if test="starts-with($itm, 'ODEMEARAC')">
                        <b>
                          <xsl:value-of select="$itm" disable-output-escaping="yes" />
                        </b>
                        <br />
                      </xsl:if>
                    </xsl:for-each>
                    <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference/cbc:DocumentType">
                      <xsl:variable name="itm" select="." />
                      <xsl:if test="starts-with($itm, 'DIG')">
                        <b>
                          <xsl:value-of select="$itm" disable-output-escaping="yes" />
                        </b>
                        <br />
                      </xsl:if>
                    </xsl:for-each>
                  </td>
                </tr>
                <tr style="height:18px" class="r7">
                  <td class="c7_1" style="width:200px">
                  </td>
                  <td class="c7_1" style="width:200px">
                  </td>
                </tr>
                <tr style="height:18px" class="r8">
                  <td colspan="2" class="c8_1">
			İade Bilgileri
		</td>
                </tr>
                <tr style="height:18px">
                  <td colspan="2" class="c8_1">
			Malı iade edenin
		</td>
                </tr>
                <tr style="height:18px">
                  <td class="c1_1" style="width:70px">
			Adı Soyadı
		</td>
                  <td class="c8_1" style="width:600px">
                  </td>
                </tr>
                <tr style="height:18px">
                  <td class="c1_1" style="width:200px">
			Adresi
		</td>
                  <td class="c8_1" style="width:200px">
                  </td>
                </tr>
                <tr style="height:18px">
                  <td class="c1_1" style="width:200px">
			İmzası
		</td>
                  <td class="c8_1" style="width:200px">
                  </td>
                </tr>
                <tr style="height:18px">
                  <td class="c1_1" style="width:200px">
			İade Nedeni
		</td>
                  <td class="c8_1" style="width:200px">
                  </td>
                </tr>
                <tr style="height:18px">
                  <td class="c1_1" style="width:200px">
			Cinsi
		</td>
                  <td class="c8_1" style="width:200px">
                  </td>
                </tr>
                <tr style="height:18px">
                  <td class="c1_1" style="width:200px">
			Miktarı
		</td>
                  <td class="c8_1" style="width:200px">
                  </td>
                </tr>
                <tr style="height:18px">
                  <td class="c1_1" style="width:200px">
			Birim fiyatı
		</td>
                  <td class="c8_1" style="width:200px">
                  </td>
                </tr>
                <tr style="height:18px">
                  <td class="c17_1" style="width:200px">
			Tutarı
		</td>
                  <td class="c17_2" style="width:200px">
                  </td>
                </tr>
              </table>
            </body2>
            <tr>
              <td colspan="2">
                <table id="hesapBilgileri" style="border-top: 1px solid darkgray;padding:10px 0px; border-bottom:2px solid #000099;width:100%; margin-top:5px">
                  <tr>
                  </tr>
                  <tr>
                    <td style="width:100%; padding:0px;">
                      <fieldset style="margin:2px; border: 3px solid black">
                        <table style="font-size: 11px; width:100%;">
                          <tr>
                            <td>
                              <b>İrsaliye Yerine Geçer.</b>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <b>Fatura 8 gün içinde itiraz edilmez ise kabul edilmis sayilir.</b>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <b>e-Arsiv izni kapsaminda elektronik ortamda olusturulmustur.</b>
                            </td>
                          </tr>
                        </table>
                      </fieldset>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
  <xsl:template match="dateFormatter">
    <xsl:value-of select="substring(.,9,2)" />-<xsl:value-of select="substring(.,6,2)" />-<xsl:value-of select="substring(.,1,4)" /></xsl:template>
  <xsl:template match="//n1:Invoice/cac:InvoiceLine">
    <tr id="lineTableTr">
      <td id="lineTableTd">
        <span>
          <xsl:text> </xsl:text>
          <xsl:value-of select="./cbc:ID" />
        </span>
      </td>
      <td id="lineTableTd">
        <span>
          <xsl:text> </xsl:text>
          <xsl:value-of select="./cac:Item/cbc:Name" />
          <xsl:text> </xsl:text>
          <xsl:value-of select="./cac:Item/cbc:BrandName" />
          <xsl:text> </xsl:text>
          <xsl:value-of select="./cac:Item/cbc:ModelName" />
        </span>
      </td>
      <td id="lineTableTd" align="center">
        <span>
          <xsl:value-of select="format-number(./cbc:InvoicedQuantity, '###.###,####', 'european')" />
        </span>
      </td>
      <td align="center" id="lineTableTd">
        <span>
          <xsl:text />
          <xsl:if test="./cbc:InvoicedQuantity/@unitCode">
            <xsl:for-each select="./cbc:InvoicedQuantity">
              <xsl:text />
              <xsl:choose>
                <xsl:when test="@unitCode  = '26'">
                  <span>
                    <xsl:text>Ton</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'BX'">
                  <span>
                    <xsl:text>Kutu</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'NIU'">
                  <span>
                    <xsl:text>Adet</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'C62'">
                  <span>
                    <xsl:text>Adet</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'KGM'">
                  <span>
                    <xsl:text>KG</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'KJO'">
                  <span>
                    <xsl:text>kJ</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'GRM'">
                  <span>
                    <xsl:text>G</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'MGM'">
                  <span>
                    <xsl:text>MG</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'NT'">
                  <span>
                    <xsl:text>Net Ton</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'GT'">
                  <span>
                    <xsl:text>GT</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'MTR'">
                  <span>
                    <xsl:text>M</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'MMT'">
                  <span>
                    <xsl:text>MM</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'KTM'">
                  <span>
                    <xsl:text>KM</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'MLT'">
                  <span>
                    <xsl:text>ML</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'MMQ'">
                  <span>
                    <xsl:text>MM3</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'CLT'">
                  <span>
                    <xsl:text>CL</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'CMK'">
                  <span>
                    <xsl:text>CM2</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'CMQ'">
                  <span>
                    <xsl:text>CM3</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'CMT'">
                  <span>
                    <xsl:text>CM</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'MTK'">
                  <span>
                    <xsl:text>M2</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'MTQ'">
                  <span>
                    <xsl:text>M3</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'DAY'">
                  <span>
                    <xsl:text> Gün</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'MON'">
                  <span>
                    <xsl:text> Ay</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'PA'">
                  <span>
                    <xsl:text> Paket</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'PR'">
                  <span>
                    <xsl:text> Çift</xsl:text>
                  </span>
                </xsl:when>
                <xsl:when test="@unitCode  = 'KWH'">
                  <span>
                    <xsl:text> KWH</xsl:text>
                  </span>
                </xsl:when>
              </xsl:choose>
            </xsl:for-each>
          </xsl:if>
        </span>
      </td>
      <td id="lineTableTd" align="center">
        <span>
          <xsl:text> </xsl:text>
          <xsl:value-of select="format-number(./cac:Price/cbc:PriceAmount, '###.##0,00', 'european')" />
          <xsl:if test="./cac:Price/cbc:PriceAmount/@currencyID">
            <xsl:text>
            </xsl:text>
            <xsl:if test="./cac:Price/cbc:PriceAmount/@currencyID = &quot;TRY&quot; ">
              <xsl:text>TL</xsl:text>
            </xsl:if>
            <xsl:if test="./cac:Price/cbc:PriceAmount/@currencyID != &quot;TRY&quot;">
              <xsl:value-of select="./cac:Price/cbc:PriceAmount/@currencyID" />
            </xsl:if>
          </xsl:if>
        </span>
      </td>
      <td align="center" id="lineTableTd">
        <span>
          <xsl:text> </xsl:text>
          <xsl:if test="./cac:AllowanceCharge/cbc:MultiplierFactorNumeric">
            <xsl:text> %</xsl:text>
            <xsl:value-of select="format-number(./cac:AllowanceCharge/cbc:MultiplierFactorNumeric * 100, '###.##0,00', 'european')" />
          </xsl:if>
        </span>
      </td>
      <td align="center" id="lineTableTd">
        <span>
          <xsl:text> </xsl:text>
          <xsl:if test="./cac:AllowanceCharge">
            <xsl:value-of select="format-number(./cac:AllowanceCharge/cbc:Amount, '###.##0,00', 'european')" />
          </xsl:if>
          <xsl:if test="./cac:AllowanceCharge/cbc:Amount/@currencyID">
            <xsl:text>
            </xsl:text>
            <xsl:if test="./cac:AllowanceCharge/cbc:Amount/@currencyID = 'TRY'">
              <xsl:text>TL</xsl:text>
            </xsl:if>
            <xsl:if test="./cac:AllowanceCharge/cbc:Amount/@currencyID != 'TRY'">
              <xsl:value-of select="./cac:AllowanceCharge/cbc:Amount/@currencyID" />
            </xsl:if>
          </xsl:if>
        </span>
      </td>
      <td align="center" id="lineTableTd">
        <span>
          <xsl:text> </xsl:text>
          <xsl:for-each select="./cac:TaxTotal">
            <xsl:for-each select="cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
              <xsl:if test="cbc:TaxTypeCode='0015' ">
                <xsl:text>
                </xsl:text>
                <xsl:if test="../../cbc:Percent">
                  <xsl:text> %</xsl:text>
                  <xsl:value-of select="format-number(../../cbc:Percent, '###.##0,00', 'european')" />
                </xsl:if>
              </xsl:if>
            </xsl:for-each>
          </xsl:for-each>
        </span>
      </td>
      <td align="center" id="lineTableTd">
        <span>
          <xsl:text> </xsl:text>
          <xsl:for-each select="./cac:TaxTotal">
            <xsl:for-each select="cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
              <xsl:if test="cbc:TaxTypeCode='0015' ">
                <xsl:text>
                </xsl:text>
                <xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
                <xsl:if test="../../cbc:TaxAmount/@currencyID">
                  <xsl:text>
                  </xsl:text>
                  <xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRY'">
                    <xsl:text>TL</xsl:text>
                  </xsl:if>
                  <xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRY'">
                    <xsl:value-of select="../../cbc:TaxAmount/@currencyID" />
                  </xsl:if>
                </xsl:if>
              </xsl:if>
            </xsl:for-each>
          </xsl:for-each>
        </span>
      </td>
      <td id="lineTableTd" align="right">
        <span>
          <xsl:text> </xsl:text>
          <xsl:value-of select="format-number(./cbc:LineExtensionAmount, '###.##0,00', 'european')" />
          <xsl:if test="./cbc:LineExtensionAmount/@currencyID">
            <xsl:text>
            </xsl:text>
            <xsl:if test="./cbc:LineExtensionAmount/@currencyID = 'TRY' ">
              <xsl:text>TL</xsl:text>
            </xsl:if>
            <xsl:if test="./cbc:LineExtensionAmount/@currencyID != 'TRY' ">
              <xsl:value-of select="./cbc:LineExtensionAmount/@currencyID" />
            </xsl:if>
          </xsl:if>
        </span>
      </td>
    </tr>
  </xsl:template>
  <xsl:template match="//n1:Invoice">
    <tr id="lineTableTr">
      <td id="lineTableTd">
        <span>
          <xsl:text> </xsl:text>
        </span>
      </td>
      <td id="lineTableTd">
        <span>
          <xsl:text> </xsl:text>
        </span>
      </td>
      <td id="lineTableTd" align="right">
        <span>
          <xsl:text> </xsl:text>
        </span>
      </td>
      <td id="lineTableTd" align="right">
        <span>
          <xsl:text> </xsl:text>
        </span>
      </td>
      <td id="lineTableTd" align="right">
        <span>
          <xsl:text> </xsl:text>
        </span>
      </td>
      <td id="lineTableTd" align="right">
        <span>
          <xsl:text> </xsl:text>
        </span>
      </td>
      <td id="lineTableTd" align="right">
        <span>
          <xsl:text> </xsl:text>
        </span>
      </td>
      <td id="lineTableTd" align="right">
        <span>
          <xsl:text> </xsl:text>
        </span>
      </td>
      <td id="lineTableTd" align="right">
        <span>
          <xsl:text> </xsl:text>
        </span>
      </td>
      <td id="lineTableTd" align="right">
        <span>
          <xsl:text> </xsl:text>
        </span>
      </td>
      <td id="lineTableTd" align="right">
        <span>
          <xsl:text> </xsl:text>
        </span>
      </td>
    </tr>
  </xsl:template>
  <xsl:template name="ShowEmployeesInTeam">
    <xsl:param name="lstInvoiceQ" />
    <xsl:if test="sum($lstInvoiceQ) !=0">
      <xsl:value-of select="sum($lstInvoiceQ)" />
      <xsl:text> </xsl:text>
      <xsl:if test="$lstInvoiceQ[1]/@unitCode">
        <xsl:choose>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = '26'">
            <span>
              <xsl:text>Ton</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'BX'">
            <span>
              <xsl:text>Kutu</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'LTR'">
            <span>
              <xsl:text>LT</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'NIU'">
            <span>
              <xsl:text>Adet</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'C62'">
            <span>
              <xsl:text>Adet</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'KGM'">
            <span>
              <xsl:text>KG</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'KJO'">
            <span>
              <xsl:text>kJ</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'GRM'">
            <span>
              <xsl:text>G</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MGM'">
            <span>
              <xsl:text>MG</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'NT'">
            <span>
              <xsl:text>Net Ton</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'GT'">
            <span>
              <xsl:text>GT</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MTR'">
            <span>
              <xsl:text>M</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MMT'">
            <span>
              <xsl:text>MM</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'KTM'">
            <span>
              <xsl:text>KM</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MLT'">
            <span>
              <xsl:text>ML</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MMQ'">
            <span>
              <xsl:text>MM3</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'CLT'">
            <span>
              <xsl:text>CL</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'CMK'">
            <span>
              <xsl:text>CM2</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'CMQ'">
            <span>
              <xsl:text>CM3</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'CMT'">
            <span>
              <xsl:text>CM</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MTK'">
            <span>
              <xsl:text>M2</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MTQ'">
            <span>
              <xsl:text>M3</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'DAY'">
            <span>
              <xsl:text> Gün</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MON'">
            <span>
              <xsl:text> Ay</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'PA'">
            <span>
              <xsl:text> Paket</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'PR'">
            <span>
              <xsl:text> Çift</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'KWH'">
            <span>
              <xsl:text> KWH</xsl:text>
            </span>
          </xsl:when>
        </xsl:choose>
      </xsl:if>
      <xsl:if test="position() !=last()">
        <xsl:text> + </xsl:text>
      </xsl:if>
    </xsl:if>
  </xsl:template>
  <xsl:variable name="QRSOVOS">
<xsl:text>https://qr.sovostr.com/qr?data=</xsl:text>
        <xsl:text>{"vkntckn":"</xsl:text>       
        <xsl:value-of select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"avkntckn":"</xsl:text>
        <xsl:value-of select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"senaryo":"</xsl:text>
        <xsl:value-of select="//n1:Invoice/cbc:ProfileID"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"tip":"</xsl:text>
        <xsl:value-of select="//n1:Invoice/cbc:InvoiceTypeCode"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"tarih":"</xsl:text>
        <xsl:value-of select="//n1:Invoice/cbc:IssueDate"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"no":"</xsl:text>
        <xsl:value-of select="//n1:Invoice/cbc:ID"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"ettn":"</xsl:text>
        <xsl:value-of select="//n1:Invoice/cbc:UUID"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"parabirimi":"</xsl:text>
        <xsl:value-of select="//n1:Invoice/cbc:DocumentCurrencyCode"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"malhizmettoplam":"</xsl:text>
        <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount"/>
        <xsl:text>",</xsl:text>
        <xsl:for-each select="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015']">
            <xsl:text>"kdvmatrah(</xsl:text>
            <xsl:value-of select="format-number(cbc:Percent,'#','european')"/>
            <xsl:text>)":"</xsl:text>
            <xsl:value-of select="format-number(cbc:TaxableAmount, '###.##0,00', 'european')"/>
            <xsl:text>",</xsl:text>
            <xsl:text>"hesaplanankdv(</xsl:text>
            <xsl:value-of select="format-number(cbc:Percent,'#','european')"/>
            <xsl:text>)":"</xsl:text>
            <xsl:value-of select="format-number(cbc:TaxAmount, '###.##0,00', 'european')"/>
            <xsl:text>",</xsl:text>
        </xsl:for-each>
        <xsl:text>"vergidahil":"</xsl:text>
        <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount, '###.##0,00', 'european')"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"odenecek":"</xsl:text>
        <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount, '###.##0,00', 'european')"/>
        <xsl:text>"}</xsl:text>
</xsl:variable>
</xsl:stylesheet>