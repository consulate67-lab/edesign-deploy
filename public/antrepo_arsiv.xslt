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
                  <img style="width:91px; margin-top:20px" align="middle" alt="E-Fatura Logo" src="data:image/jpeg;base64,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" />
                  <h1 align="center" style="padding:0px">
                    <span style="font-weight:bold; ">
                      <xsl:text>e-Arşiv Fatura</xsl:text>
                    </span>
                  </h1>
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
                    <td style="width:100%; padding:0px">
                      <fieldset style="margin:2px">
                        <legend style="background-color:white">
                          <b>HESAP BİLGİLERİMİZ</b>
                        </legend>
                        <table style="width:100%" id="bankingTable" border="1">
                          <tr>
                            <th style="width: 110px" align="left">BANKA ADI</th>
                            <th style="width: 160px" align="left">ŞUBE ADI</th>
                            <th style="width: 80px" align="left">ŞUBE KODU</th>
                            <th style="width: 80px" align="left">HESAP NO</th>
                            <th style="width: 220px" align="left">IBAN</th>
                          </tr>
                          <tr>
                            <td>Örnek Bank TL</td>
                            <td>Merkez Şubesi</td>
                            <td align="left">0001</td>
                            <td>12345678</td>
                            <td>TR00 0000 0000 0000 0000 0000 00</td>
                          </tr>
                          <tr>
                            <td>Örnek Bank USD</td>
                            <td>Merkez Şubesi</td>
                            <td align="left">0001</td>
                            <td>87654321</td>
                            <td>TR00 0000 0000 0000 0000 0000 01</td>
                          </tr>
                        </table>
                      </fieldset>
                    </td>
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