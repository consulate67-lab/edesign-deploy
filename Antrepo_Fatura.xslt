<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" exclude-result-prefixes="cac cbc ccts clm54217 clm5639 clm66411 clmIANAMIMEMediaType fn link n1 qdt udt xbrldi xbrli xdt xlink xs xsd xsi"
	xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
	xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
	xmlns:ccts="urn:un:unece:uncefact:documentation:2"
	xmlns:clm54217="urn:un:unece:uncefact:codelist:specification:54217:2001"
	xmlns:clm5639="urn:un:unece:uncefact:codelist:specification:5639:1988"
	xmlns:clm66411="urn:un:unece:uncefact:codelist:specification:66411:2001"
	xmlns:clmIANAMIMEMediaType="urn:un:unece:uncefact:codelist:specification:IANAMIMEMediaType:2003"
	xmlns:fn="http://www.w3.org/2005/xpath-functions"
	xmlns:link="http://www.xbrl.org/2003/linkbase"
	xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
	xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2"
	xmlns:udt="urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2"
	xmlns:xbrldi="http://xbrl.org/2006/xbrldi"
	xmlns:xbrli="http://www.xbrl.org/2003/instance"
	xmlns:xdt="http://www.w3.org/2005/xpath-datatypes"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	xmlns:xs="http://www.w3.org/2001/XMLSchema"
	xmlns:xsd="http://www.w3.org/2001/XMLSchema"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
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
					    border-color:black;
					    background-color:white;
					    -moz-border-radius:;
					}
					
					#lineTableDummyTd{
					    border-width:1px;
					    border-color:white;
					    padding:1px;
					    border-style:inset;
					    border-color:black;
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
					    border-color:black;
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
					    border-color:black;
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
					    border-color:black;
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
					</style>
				<title>e-Fatura</title>
			</head>
			<body style="margin-left=0.6in; margin-right=0.6in;  margin-bottom=0.79in;border-top: 2px solid #000099;height:auto; width:793px; margin-top:10px">
				<xsl:for-each select="$XML">
					<table cellspacing="0px" width="793" cellpadding="-20px" style="border-bottom:2px solid #000099; padding-top:10px;padding-bottom:10px">
						<tbody>
							<tr valign="top" style="width:450px">
								<td style="vertical-align:top;">
									<img width="150px" alt="Firma Logo" style="margin-top:25px;margin-bottom:0px; margin-right:0px;margin-left:15px" src="data:image/png;base64,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" />
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
																				<xsl:text></xsl:text>
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
																				<xsl:text></xsl:text>
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
																				<xsl:text></xsl:text>
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
																				<xsl:text></xsl:text>
																			</span>
																		</xsl:for-each>
																		<xsl:for-each select="cbc:PostalZone">
																			<xsl:apply-templates />
																			<span>
																				<xsl:text></xsl:text>
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
																				<xsl:text></xsl:text>
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
															<tr>
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
															</tr>
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
<td>
 <img src="{$QRSOVOS}" alt="qrcode" width="175px" />
</td>
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
																					<span style="font-weight:bold; ">
																						<xsl:value-of select="cac:PartyName/cbc:Name" />
																					</span>
																				</xsl:if>
																				<xsl:for-each select="cac:Person">
																					<xsl:for-each select="cbc:Title">
																						<xsl:apply-templates />
																						<span>
																							<xsl:text></xsl:text>
																						</span>
																					</xsl:for-each>
																					<xsl:for-each select="cbc:MiddleName">
																						<xsl:apply-templates />
																						<span>
																							<xsl:text></xsl:text>
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
																							<xsl:text></xsl:text>
																						</span>
																					</xsl:if>
																					<xsl:for-each select="cbc:StreetName">
																						<xsl:apply-templates />
																						<span>
																							<xsl:text></xsl:text>
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
																								<xsl:text></xsl:text>
																							</span>
																						</xsl:if>
																					</xsl:for-each>
																					<xsl:for-each select="cbc:PostalZone">
																						<xsl:apply-templates />
																						<span>
																							<xsl:text></xsl:text>
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
																							<xsl:text></xsl:text>
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
																							<xsl:text></xsl:text>
																						</span>
																					</td>
																				</tr>
																			</xsl:if>
																		</xsl:for-each>
																		<tr align="left">
																			<td style="padding:1px 0px; padding-left:2px">
																				<xsl:if test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name">
																					<span>
																						<b>
																							<xsl:text>V.D. : </xsl:text>
																						</b>
																						<xsl:value-of select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name" />
																						<xsl:text></xsl:text>
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
									<img style="width:90px;" align="middle" alt="E-Fatura Logo" src="data:image/jpeg;base64,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" />
									<h1 align="center" style="padding:0px">
										<span style="font-weight:bold; ">
											<xsl:text>e-Fatura</xsl:text>
										</span>
									</h1>
								</td>
								<td width="33%" align="center" valign="top" colspan="2" style="padding-top:10px">
									<table border="0" height="13" id="despatchTable" style="border: 1px solid black; margin-right: -2px;">
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
													<td align="left" style="width:105px; padding: 4px; background-color: #; color: black; ">
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
																<xsl:value-of select="substring(.,9,2)" />-
																<xsl:value-of select="substring(.,6,2)" />-
																<xsl:value-of select="substring(.,1,4)" />
															</xsl:for-each>
														</xsl:for-each>
													</td>
												</tr>
												<xsl:for-each select="n1:Invoice/cac:DespatchDocumentReference">
													<xsl:if test="cbc:ID !=''">
														<tr style="height:13px; ">
															<td align="left" style="width:105px; padding: 4px; background-color: #; color: black; ">
																<span style="font-weight:bold; ">
																	<xsl:text>İrsaliye No</xsl:text>
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
															<td align="left" style="width:105px; padding: 4px; background-color: #; color:black">
																<span style="font-weight:bold; ">
																	<xsl:text>İrsaliye Tarihi</xsl:text>
																</span>
															</td>
															<td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">
																<span>: </span>
															</td>
															<td align="left" style="padding: 4px;">
																<xsl:for-each select="cbc:IssueDate">
																	<xsl:value-of select="substring(.,9,2)" />-
																	<xsl:value-of select="substring(.,6,2)" />-
																	<xsl:value-of select="substring(.,1,4)" />
																</xsl:for-each>
															</td>
														</tr>
													</xsl:if>
												</xsl:for-each>
											</xsl:if>
										</tbody>
									</table>
								</td>
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
								<td id="lineTableTd" style="width:84px; background-color: #; color:black;" align="center">
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
									<xsl:text></xsl:text>
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
												<xsl:for-each select="n1:Invoice/cbc:Note">
													<xsl:if test="not(contains(., '#')) and not(contains(., 'Yazı ile yalnız :')) and . !='' ">
														<b>Not : </b>
														<xsl:value-of select="." />
														<br />
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
													<xsl:text></xsl:text>
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
														<xsl:text></xsl:text>
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
									<xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">
										<tr id="budgetContainerTr" align="right">
											<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
												<span style="font-weight:bold; ">
													<xsl:text>Hesaplanan KDV </xsl:text>
													<xsl:text>(%</xsl:text>
													<xsl:value-of select="cbc:Percent" />
													<xsl:text>)</xsl:text>
												</span>
											</td>
											<td id="lineTableBudgetTd" style="width:104px; " align="right">
												<xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
													<xsl:text></xsl:text>
													<xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
													<xsl:if test="../../cbc:TaxAmount/@currencyID">
														<xsl:text></xsl:text>
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
													<xsl:text></xsl:text>
													<xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
													<xsl:if test="../../cbc:TaxAmount/@currencyID">
														<xsl:text></xsl:text>
														<xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRL' or ../../cbc:TaxAmount/@currencyID = 'TRY'">
															<xsl:text>TL</xsl:text>
														</xsl:if>
														<xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRL' and ../../cbc:TaxAmount/@currencyID != 'TRY'">
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
											<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
												<span style="font-weight:bold; ">
													<xsl:text>Tevkifata Tabi İşlem Üz. Hes.KDV</xsl:text>
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
										<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
											<span style="font-weight:bold; ">
												<xsl:text>Beyan Edilecek KDV</xsl:text>
											</span>
										</td>
										<td align="right" id="lineTableBudgetTd" style="width:104px; ">
											<xsl:for-each select="n1:Invoice">
												<xsl:for-each select="cac:TaxTotal">
													<xsl:for-each select="cbc:TaxAmount">
														<xsl:value-of select="format-number(., '###.##0,00', 'european')" />
														<xsl:if test="//n1:Invoice/cac:TaxTotal/cbc:TaxAmount/@currencyID">
															<xsl:text></xsl:text>
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
															<xsl:text></xsl:text>
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
															<xsl:text></xsl:text>
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
								<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID != 'TRY'">
									<table id="budgetContainerTable" width="100%" style="margin-top:0px">
										<tr id="budgetContainerTr" align="right">
											<td id="lineTableBudgetTd" align="right" style="background-color: #; color: black;width:68%">
												<span style="font-weight:bold; ">
													<xsl:text>Mal Hizmet Toplam Tutarı</xsl:text>
												</span>
											</td>
											<td id="lineTableBudgetTd" style="width:32%;" align="right">
												<span>
													<xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
													<xsl:text> TL</xsl:text>
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
															<xsl:text></xsl:text>
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
										<xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">
											<tr id="budgetContainerTr" align="right">
												<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
													<span style="font-weight:bold; ">
														<xsl:text>Hesaplanan KDV </xsl:text>
														<xsl:text>(%</xsl:text>
														<xsl:value-of select="cbc:Percent" />
														<xsl:text>)</xsl:text>
													</span>
												</td>
												<td id="lineTableBudgetTd" style="width:104px; " align="right">
													<span>
														<xsl:value-of select="format-number(//n1:Invoice/cac:TaxTotal/cbc:TaxAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
														<xsl:text> TL</xsl:text>
													</span>
												</td>
											</tr>
										</xsl:for-each>
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
														<xsl:text></xsl:text>
														<span>
															<xsl:value-of select="format-number(../../cbc:TaxAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
															<xsl:text> TL</xsl:text>
														</span>
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
													<xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:LineExtensionAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate), '###.##0,00', 'european')" />
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
													<xsl:value-of select="format-number(sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate), '###.##0,00', 'european')" />
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
														<xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]/cbc:LineExtensionAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate), '###.##0,00', 'european')" />
													</xsl:if>
													<xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='9015'">
														<xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:LineExtensionAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate), '###.##0,00', 'european')" />
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
														<xsl:value-of select="format-number(sum(n1:Invoice/cac:WithholdingTaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme]/cbc:TaxableAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate), '###.##0,00', 'european')" />
													</xsl:if>
													<xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='9015'">
														<xsl:value-of select="format-number(sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate), '###.##0,00', 'european')" />
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
											<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
												<span style="font-weight:bold; ">
													<xsl:text>Beyan Edilecek KDV</xsl:text>
												</span>
											</td>
											<td align="right" id="lineTableBudgetTd" style="width:104px; ">
												<span>
													<xsl:value-of select="format-number(//n1:Invoice/cac:TaxTotal/cbc:TaxAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
													<xsl:text> TL</xsl:text>
												</span>
											</td>
										</tr>
										<tr id="budgetContainerTr" align="right">
											<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">
												<span style="font-weight:bold; ">
													<xsl:text>Vergiler Dahil Toplam Tutar</xsl:text>
												</span>
											</td>
											<td id="lineTableBudgetTd" style="width:104px; " align="right">
												<span>
													<xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
													<xsl:text> TL</xsl:text>
												</span>
											</td>
										</tr>
										<tr id="budgetContainerTr" align="right">
											<td id="lineTableBudgetTd" style=" background-color: #; color: black; width:200px" align="right">
												<span style="font-weight:bold; ">
													<xsl:text>Ödenecek Tutar</xsl:text>
												</span>
											</td>
											<td id="lineTableBudgetTd" style="width:104px; " align="right">
												<span>
													<xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
													<xsl:text> TL</xsl:text>
												</span>
											</td>
										</tr>
									</table>
								</xsl:if>
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
															<xsl:value-of select="normalize-space(substring-before(.,':'))" />: 
														</b>
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
						<tr>
							<td colspan="2">
								<table id="hesapBilgileri" style="border-top: 1px solid darkgray;padding:10px 0px; border-bottom:2px solid #000099;width:100%; margin-top:5px">
									<tr>
										<td style="width:100%; padding:0px">
											<fieldset style="margin:2px">
												<legend style="background-color:white">
													<b>
 HESAP BİLGİLERİMİZ</b>
												</legend>
												<table style="width:100%" id="bankingTable" border="1">
													<tr>
														<th style="width: 110px" align="left">
			BANKA ADI
		</th>
														<th style="width: 160px" align="left">
			ŞUBE ADI
		</th>
														<th style="width: 80px" align="left">
			ŞUBE KODU
		</th>
														<th style="width: 80px" align="left">

			HESAP NO

		</th>
														<th style="width: 220px" align="left">
			IBAN
		</th>
													</tr>
													<tr>
														<td>Garanti Bankası TL</td>
														<td>İkitelli OSB Şubesi</td>
														<td align="left">0373</td>
														<td>6298390</td>
														<td>TR45 0006 2000 3730 0006 2983 90</td>
													</tr>
													<tr>
														<td>Garanti Bankası USD</td>
														<td>İkitelli OSB Şubesi</td>
														<td align="left">0373</td>
														<td>9091742</td>
														<td>TR48 0006 2000 3730 0009 0917 42</td>
													</tr>
													<tr>
														<td></td>
														<td></td>
														<td align="left"></td>
														<td></td>
														<td></td>
													</tr>
													<tr>
														<td></td>
														<td></td>
														<td align="left"></td>
														<td></td>
														<td></td>
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
				<b> CABANI FABRIKA SATIŞ MAĞAZASI ALIŞVERİŞİNİZ İÇİN TEŞEKKÜR EDERİZ, MAĞAZALARIMIZDAN ALINAN SERİ SONU VE OUTLET ÜRÜNLERİN İADE EDİLEMEYECEĞİNİ VEYA DEĞİŞTİLEMEYECEĞİNİ LÜTFEN DİKKATE ALIN. ANCAK BU DURUM YASAL HAKLARINIZI ETKİLEMEZ. SORULARINIZI MAĞAZALARDAKİ CABANI ÇALIŞANLARINA SORABİLİRSİNİZ. </b>
			</body>
		</html>
	</xsl:template>
	<xsl:template match="dateFormatter">
		<xsl:value-of select="substring(.,9,2)" />-
		<xsl:value-of select="substring(.,6,2)" />-
		<xsl:value-of select="substring(.,1,4)" />
	</xsl:template>
	<xsl:template match="//n1:Invoice/cac:InvoiceLine">
		<tr id="lineTableTr">
			<td id="lineTableTd">
				<span>
					<xsl:text></xsl:text>
					<xsl:value-of select="./cbc:ID" />
				</span>
			</td>
			<td id="lineTableTd">
				<span>
					<xsl:text></xsl:text>
					<xsl:value-of select="./cac:Item/cbc:Name" />
					<xsl:text></xsl:text>
					<xsl:value-of select="./cac:Item/cbc:BrandName" />
					<xsl:text></xsl:text>
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
								<xsl:when test="@unitCode  = 'ANN'">
									<xsl:text> Yıl</xsl:text>
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
								<xsl:when test="@unitCode  = 'DMT'">
									<span>
										<xsl:text> Desi</xsl:text>
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
					<xsl:text></xsl:text>
					<xsl:value-of select="format-number(./cac:Price/cbc:PriceAmount, '###.##0,00', 'european')" />
					<xsl:if test="./cac:Price/cbc:PriceAmount/@currencyID">
						<xsl:text></xsl:text>
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
					<xsl:text></xsl:text>
					<xsl:if test="./cac:AllowanceCharge/cbc:MultiplierFactorNumeric">
						<xsl:text> %</xsl:text>
						<xsl:value-of select="format-number(./cac:AllowanceCharge/cbc:MultiplierFactorNumeric * 100, '###.##0,00', 'european')" />
					</xsl:if>
				</span>
			</td>
			<td align="center" id="lineTableTd">
				<span>
					<xsl:text></xsl:text>
					<xsl:if test="./cac:AllowanceCharge">
						<xsl:value-of select="format-number(./cac:AllowanceCharge/cbc:Amount, '###.##0,00', 'european')" />
					</xsl:if>
					<xsl:if test="./cac:AllowanceCharge/cbc:Amount/@currencyID">
						<xsl:text></xsl:text>
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
					<xsl:text></xsl:text>
					<xsl:for-each select="./cac:TaxTotal">
						<xsl:for-each select="cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
							<xsl:if test="cbc:TaxTypeCode='0015' ">
								<xsl:text></xsl:text>
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
					<xsl:text></xsl:text>
					<xsl:for-each select="./cac:TaxTotal">
						<xsl:for-each select="cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
							<xsl:if test="cbc:TaxTypeCode='0015' ">
								<xsl:text></xsl:text>
								<xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
								<xsl:if test="../../cbc:TaxAmount/@currencyID">
									<xsl:text></xsl:text>
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
					<xsl:text></xsl:text>
					<xsl:value-of select="format-number(./cbc:LineExtensionAmount, '###.##0,00', 'european')" />
					<xsl:if test="./cbc:LineExtensionAmount/@currencyID">
						<xsl:text></xsl:text>
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
					<xsl:text></xsl:text>
				</span>
			</td>
			<td id="lineTableTd">
				<span>
					<xsl:text></xsl:text>
				</span>
			</td>
			<td id="lineTableTd" align="right">
				<span>
					<xsl:text></xsl:text>
				</span>
			</td>
			<td id="lineTableTd" align="right">
				<span>
					<xsl:text></xsl:text>
				</span>
			</td>
			<td id="lineTableTd" align="right">
				<span>
					<xsl:text></xsl:text>
				</span>
			</td>
			<td id="lineTableTd" align="right">
				<span>
					<xsl:text></xsl:text>
				</span>
			</td>
			<td id="lineTableTd" align="right">
				<span>
					<xsl:text></xsl:text>
				</span>
			</td>
			<td id="lineTableTd" align="right">
				<span>
					<xsl:text></xsl:text>
				</span>
			</td>
			<td id="lineTableTd" align="right">
				<span>
					<xsl:text></xsl:text>
				</span>
			</td>
			<td id="lineTableTd" align="right">
				<span>
					<xsl:text></xsl:text>
				</span>
			</td>
			<td id="lineTableTd" align="right">
				<span>
					<xsl:text></xsl:text>
				</span>
			</td>
		</tr>
	</xsl:template>
	<xsl:template name="ShowEmployeesInTeam">
		<xsl:param name="lstInvoiceQ" />
		<xsl:if test="sum($lstInvoiceQ) !=0">
			<xsl:value-of select="sum($lstInvoiceQ)" />
			<xsl:text></xsl:text>
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
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'ANN'">
						<xsl:text> Yıl</xsl:text>
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
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'DMT'">
						<span>
							<xsl:text> Desi</xsl:text>
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
	<xsl:template name="dovizi_oku">
		<xsl:param name="doviz" />
		<xsl:variable name="okunacak" select="." />
		<xsl:variable name="noktadan_sonra" select="round(($okunacak - floor($okunacak)) * 100)" />
		<xsl:call-template name="sayi_oku">
			<xsl:with-param name="okunacak" select="." />
		</xsl:call-template>
		<xsl:if test="$doviz">
			<xsl:choose>
				<xsl:when test="$doviz =  'TRL' or $doviz =  'TRY'">
					<xsl:value-of select="' Türk Lirası'" />
					<xsl:if test="$noktadan_sonra &gt; 0">
						<xsl:value-of select="' '" />
						<xsl:call-template name="sayi_oku">
							<xsl:with-param name="okunacak" select="$noktadan_sonra" />
						</xsl:call-template>
						<xsl:value-of select="' Kuruş'" />
					</xsl:if>
				</xsl:when>
				<xsl:otherwise>
					<xsl:text></xsl:text>
					<xsl:value-of select="$doviz" />
					<xsl:if test="$noktadan_sonra &gt; 0">
						<xsl:value-of select="' '" />
						<xsl:call-template name="sayi_oku">
							<xsl:with-param name="okunacak" select="$noktadan_sonra" />
						</xsl:call-template>
						<xsl:value-of select="' Cent'" />
					</xsl:if>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:if>
	</xsl:template>
	<xsl:template name="sayi_oku">
		<xsl:param name="okunacak" />
		<xsl:variable name="tam_sayi" select="floor($okunacak)" />
		<xsl:variable name="birler" select="floor($okunacak) mod 10" />
		<xsl:variable name="onlar" select="floor(floor($tam_sayi mod 100) div 10)" />
		<xsl:variable name="yuzler" select="floor(floor($tam_sayi mod 1000) div 100)" />
		<xsl:variable name="binler" select="floor(floor($tam_sayi mod 1000000) div 1000)" />
		<xsl:variable name="milyonlar" select="floor(floor($tam_sayi mod 1000000000) div 1000000)" />
		<xsl:variable name="milyarlar" select="floor(floor($tam_sayi mod 1000000000000) div 1000000000)" />
		<xsl:if test="$milyarlar &gt; 0">
			<xsl:call-template name="sayi_oku_3hane">
				<xsl:with-param name="sayi" select="$milyarlar" />
			</xsl:call-template> Milyar
		
		</xsl:if>
		<xsl:if test="$milyonlar &gt; 0">
			<xsl:call-template name="sayi_oku_3hane">
				<xsl:with-param name="sayi" select="$milyonlar" />
			</xsl:call-template> Milyon
		
		</xsl:if>
		<xsl:if test="$binler &gt; 0">
			<xsl:if test="$binler = 1">Bin </xsl:if>
			<xsl:if test="$binler &gt; 1">
				<xsl:call-template name="sayi_oku_3hane">
					<xsl:with-param name="sayi" select="$binler" />
				</xsl:call-template> Bin
			
			</xsl:if>
		</xsl:if>
		<xsl:call-template name="yuzler_oku">
			<xsl:with-param name="sayi" select="$yuzler" />
		</xsl:call-template>
		<xsl:call-template name="onlar_oku">
			<xsl:with-param name="sayi" select="$onlar" />
		</xsl:call-template>
		<xsl:call-template name="birler_oku">
			<xsl:with-param name="sayi" select="$birler" />
		</xsl:call-template>
	</xsl:template>
	<xsl:template name="sayi_oku_3hane">
		<xsl:param name="sayi" />
		<xsl:variable name="tam_sayi" select="floor($sayi)" />
		<xsl:variable name="birler" select="floor($sayi) mod 10" />
		<xsl:variable name="onlar" select="floor(floor($tam_sayi mod 100) div 10)" />
		<xsl:variable name="yuzler" select="floor(floor($tam_sayi mod 1000) div 100)" />
		<xsl:call-template name="yuzler_oku">
			<xsl:with-param name="sayi" select="$yuzler" />
		</xsl:call-template>
		<xsl:call-template name="onlar_oku">
			<xsl:with-param name="sayi" select="$onlar" />
		</xsl:call-template>
		<xsl:call-template name="birler_oku">
			<xsl:with-param name="sayi" select="$birler" />
		</xsl:call-template>
	</xsl:template>
	<xsl:template name="birler_oku">
		<xsl:param name="sayi" />
		<xsl:choose>
			<xsl:when test="$sayi =  1">Bir </xsl:when>
			<xsl:when test="$sayi =  2">İki </xsl:when>
			<xsl:when test="$sayi =  3">Üç </xsl:when>
			<xsl:when test="$sayi =  4">Dört </xsl:when>
			<xsl:when test="$sayi =  5">Beş </xsl:when>
			<xsl:when test="$sayi =  6">Altı </xsl:when>
			<xsl:when test="$sayi =  7">Yedi </xsl:when>
			<xsl:when test="$sayi =  8">Sekiz </xsl:when>
			<xsl:when test="$sayi =  9">Dokuz </xsl:when>
			<xsl:otherwise></xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="onlar_oku">
		<xsl:param name="sayi" />
		<xsl:choose>
			<xsl:when test="$sayi =  1">On </xsl:when>
			<xsl:when test="$sayi =  2">Yirmi </xsl:when>
			<xsl:when test="$sayi =  3">Otuz </xsl:when>
			<xsl:when test="$sayi =  4">Kırk </xsl:when>
			<xsl:when test="$sayi =  5">Elli </xsl:when>
			<xsl:when test="$sayi =  6">Altmış </xsl:when>
			<xsl:when test="$sayi =  7">Yetmiş </xsl:when>
			<xsl:when test="$sayi =  8">Seksen </xsl:when>
			<xsl:when test="$sayi =  9">Doksan </xsl:when>
			<xsl:otherwise />
		</xsl:choose>
	</xsl:template>
	<xsl:template name="yuzler_oku">
		<xsl:param name="sayi" />
		<xsl:choose>
			<xsl:when test="$sayi =  1">Yüz </xsl:when>
			<xsl:when test="$sayi =  2">İki Yüz </xsl:when>
			<xsl:when test="$sayi =  3">Üç Yüz </xsl:when>
			<xsl:when test="$sayi =  4">Dört Yüz </xsl:when>
			<xsl:when test="$sayi =  5">Beş Yüz </xsl:when>
			<xsl:when test="$sayi =  6">Altı Yüz </xsl:when>
			<xsl:when test="$sayi =  7">Yedi Yüz </xsl:when>
			<xsl:when test="$sayi =  8">Sekiz Yüz </xsl:when>
			<xsl:when test="$sayi =  9">Dokuz Yüz </xsl:when>
			<xsl:otherwise />
		</xsl:choose>
	</xsl:template>
	<xsl:template name="binler_oku">
		<xsl:param name="sayi" />
		<xsl:choose>
			<xsl:when test="$sayi =  1">Bin </xsl:when>
			<xsl:when test="$sayi =  2">İki Bin </xsl:when>
			<xsl:when test="$sayi =  3">Üç Bin </xsl:when>
			<xsl:when test="$sayi =  4">Dört Bin </xsl:when>
			<xsl:when test="$sayi =  5">Beş Bin </xsl:when>
			<xsl:when test="$sayi =  6">Altı Bin </xsl:when>
			<xsl:when test="$sayi =  7">Yedi Bin </xsl:when>
			<xsl:when test="$sayi =  8">Sekiz Bin </xsl:when>
			<xsl:when test="$sayi =  9">Dokuz Bin </xsl:when>
			<xsl:otherwise />
		</xsl:choose>
	</xsl:template>
	<xsl:template name="onbinler_oku">
		<xsl:param name="sayi" />
		<xsl:if test="$sayi &gt; 0">
			<xsl:call-template name="onlar_oku">
				<xsl:with-param name="sayi" select="$sayi" />
			</xsl:call-template>Bin
			
		
		</xsl:if>
	</xsl:template>
	<xsl:template name="parcala">
		<xsl:param name="csv" />
		<xsl:param name="isaret" />
		<xsl:variable name="first-item" select="normalize-space(substring-before( concat( $csv, '|'), '|'))" />
		<xsl:if test="$csv">
			<xsl:if test="normalize-space(substring-after(concat($first-item, ''), $isaret))">
				<xsl:value-of disable-output-escaping="yes" select="normalize-space(substring-after(concat($first-item, ''), $isaret))" />
			</xsl:if>
			<xsl:call-template name="parcala">
				<xsl:with-param name="csv" select="substring-after($csv,'|')" />
				<xsl:with-param name="isaret" select="$isaret" />
			</xsl:call-template>
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
		