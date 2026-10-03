import{a as vt,j as e}from"./index-8d1h8a_v.js";import{r as s}from"./vendor-i18n-DHuaKvBu.js";import{F as wt}from"./vendor-monaco-CEdeCNnk.js";import{g as It}from"./xsltContent-BjI-G6Ew.js";import{c as Ct,ab as Pt,ac as Dt,l as tt,b as kt,ad as ot,ae as it,v as St,D as Mt,S as Nt,X as Lt,af as Rt,ag as Et,ah as Bt,ai as xt,aj as Ht,ak as Xt}from"./vendor-icons-B1jIovmE.js";import"./vendor-dnd-CqERqPL6.js";import"./vendor-state-DwZYYq12.js";const Qt=`\uFEFF<?xml version="1.0" encoding="utf-8"?>\r
<xsl:stylesheet version="2.0"\r
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" exclude-result-prefixes="cac cbc ccts clm54217 clm5639 clm66411 clmIANAMIMEMediaType fn link n1 qdt udt xbrldi xbrli xdt xlink xs xsd xsi"\r
	xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"\r
	xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"\r
	xmlns:ccts="urn:un:unece:uncefact:documentation:2"\r
	xmlns:clm54217="urn:un:unece:uncefact:codelist:specification:54217:2001"\r
	xmlns:clm5639="urn:un:unece:uncefact:codelist:specification:5639:1988"\r
	xmlns:clm66411="urn:un:unece:uncefact:codelist:specification:66411:2001"\r
	xmlns:clmIANAMIMEMediaType="urn:un:unece:uncefact:codelist:specification:IANAMIMEMediaType:2003"\r
	xmlns:fn="http://www.w3.org/2005/xpath-functions"\r
	xmlns:link="http://www.xbrl.org/2003/linkbase"\r
	xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"\r
	xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2"\r
	xmlns:udt="urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2"\r
	xmlns:xbrldi="http://xbrl.org/2006/xbrldi"\r
	xmlns:xbrli="http://www.xbrl.org/2003/instance"\r
	xmlns:xdt="http://www.w3.org/2005/xpath-datatypes"\r
	xmlns:xlink="http://www.w3.org/1999/xlink"\r
	xmlns:xs="http://www.w3.org/2001/XMLSchema"\r
	xmlns:xsd="http://www.w3.org/2001/XMLSchema"\r
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\r
	xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">\r
	<xsl:decimal-format name="european" decimal-separator="," grouping-separator="." NaN="" />\r
	<xsl:output version="4.0" method="html" indent="no" encoding="UTF-8" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" doctype-system="http://www.w3.org/TR/html4/loose.dtd" />\r
	<xsl:param name="SV_OutputFormat" select="'HTML'" />\r
	<xsl:variable name="XML" select="/" />\r
	<xsl:key name="unitcode" match="cbc:InvoicedQuantity" use="@unitCode" />\r
	<xsl:template match="/">\r
		<html>\r
			<head>\r
				<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\r
				<meta http-equiv="Pragma" content="no-cache" />\r
				<meta http-equiv="Expires" content="0" />\r
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />\r
				<title />\r
				<style type="text/css">body{\r
					    background-color:#FFFFFF;\r
					    font-family:'Tahoma', "Times New Roman", Times, serif;\r
					    font-size:11px;\r
					    color:#666666;\r
					    width:700px\r
					}\r
					\r
					h1,\r
					h2{\r
					    padding-bottom:3px;\r
					    padding-top:3px;\r
					    margin-bottom:5px;\r
					    text-transform:uppercase;\r
					    font-family:Arial, Helvetica, sans-serif;\r
					}\r
					\r
					h1{\r
					    font-size:1.4em;\r
					    text-transform:none;\r
					}\r
					\r
					h2{\r
					    font-size:1em;\r
					    color:brown;\r
					}\r
					\r
					h3{\r
					    font-size:1em;\r
					    color:#333333;\r
					    text-align:justify;\r
					    margin:0;\r
					    padding:0;\r
					}\r
					\r
					h4{\r
					    font-size:1.1em;\r
					    font-style:bold;\r
					    font-family:Arial, Helvetica, sans-serif;\r
					    color:#000000;\r
					    margin:0;\r
					    padding:0;\r
					}\r
					\r
					hr{\r
					    height:2px;\r
					    color:#000000;\r
					    background-color:#000000;\r
					    border-bottom:1px solid #000000;\r
					}\r
					\r
					p,\r
					ul,\r
					ol{\r
					    margin-top:1.5em;\r
					}\r
					\r
					ul,\r
					ol{\r
					    margin-left:3em;\r
					}\r
					\r
					blockquote{\r
					    margin-left:3em;\r
					    margin-right:3em;\r
					    font-style:italic;\r
					}\r
					\r
					a{\r
					    text-decoration:none;\r
					    color:#70A300;\r
					}\r
					\r
					a:hover{\r
					    border:none;\r
					    color:#70A300;\r
					}\r
					\r
					#despatchTable{\r
					    border-collapse:collapse;\r
					    font-size:11px;\r
					    float:right;\r
					    border-color:gray;\r
					\r
					}\r
					\r
					#ettnTable{\r
					    border-collapse:collapse;\r
					    font-size:11px;\r
					    border-color:gray;\r
					}\r
					\r
					#customerPartyTable{\r
					    border-width:0px;\r
					    border-spacing:;\r
					    border-style:inset;\r
					    border-color:gray;\r
					    border-collapse:collapse;\r
					    background-color:\r
					    }\r
					\r
					#customerIDTable{\r
					    border-width:2px;\r
					    border-spacing:;\r
					    border-style:inset;\r
					    border-color:gray;\r
					    border-collapse:collapse;\r
					    background-color:\r
					    }\r
					\r
					#customerIDTableTd{\r
					    border-width:2px;\r
					    border-spacing:;\r
					    border-style:inset;\r
					    border-color:gray;\r
					    border-collapse:collapse;\r
					    background-color:\r
					    }\r
					\r
					#lineTable{\r
					    border-width:1px;\r
					\r
					    border-style:inset;\r
					    border-color:gray;\r
					    border-collapse:collapse;\r
					\r
					}\r
					\r
					#lineTableTd{\r
					    border-width:1px;\r
					    padding:3px;\r
					    border-style:inset;\r
					    border-color:gray;\r
					    background-color:white;\r
					}\r
					\r
					#lineTableTr{\r
					    border-width:1px;\r
					    padding:0px;\r
					    border-style:inset;\r
					    border-color:black;\r
					    background-color:white;\r
					    -moz-border-radius:;\r
					}\r
					\r
					#lineTableDummyTd{\r
					    border-width:1px;\r
					    border-color:white;\r
					    padding:1px;\r
					    border-style:inset;\r
					    border-color:black;\r
					    background-color:white;\r
					}\r
					\r
					#lineTableBudgetTd{\r
					    border-width:1px;\r
					    border-spacing:0px;\r
					    padding:5px;\r
					    border-style:inset;\r
					    border-color:gray;\r
					    background-color:white;\r
					    -moz-border-radius:;\r
					}\r
					\r
					#notesTable{\r
					\r
					    border-width:2px;\r
					    border-spacing:;\r
					    border-style:inset;\r
					    border-color:black;\r
					    border-collapse:collapse;\r
					    background-color:\r
					    border:0px;\r
					    vertical-align:middle;\r
					    border-top:1px solid darkgray;\r
					    }\r
					\r
					#notesTableTd{\r
					\r
					\r
					    border-width:0px;\r
					    border-spacing:;\r
					    border-style:inset;\r
					    border-color:black;\r
					    border-collapse:collapse;\r
					    background-color:\r
					    }\r
					\r
					table{\r
					\r
					    border-spacing:2px;\r
					\r
					}\r
					\r
					#budgetContainerTable{\r
					\r
					    border-width:0px;\r
					    border-spacing:0px;\r
					    border-style:inset;\r
					    border-color:black;\r
					    border-collapse:collapse;\r
					\r
					    margin-top:5px\r
					\r
					}\r
					\r
					td{\r
					    border-color:gray;\r
					}\r
					#bankingTable{\r
			border-collapse:collapse;\r
			border-width: 0px;\r
			border-style: inset;\r
			font-size:11px;\r
			float:left;\r
			border-color:gray;\r
			}\r
			#bankingTable th{\r
			float:leftt;\r
			border-color:gray;\r
			background-color:#000099;\r
			color: white;\r
			}\r
					</style>\r
				<title>e-Fatura</title>\r
			</head>\r
			<body style="margin-left=0.6in; margin-right=0.6in;  margin-bottom=0.79in;border-top: 2px solid #000099;height:auto; width:793px; margin-top:10px">\r
				<xsl:for-each select="$XML">\r
					<table cellspacing="0px" width="793" cellpadding="-20px" style="border-bottom:2px solid #000099; padding-top:10px;padding-bottom:10px">\r
						<tbody>\r
							<tr valign="top" style="width:450px">\r
								<td style="vertical-align:top;">\r
									<img width="150px" alt="Firma Logo" style="margin-top:25px;margin-bottom:0px; margin-right:0px;margin-left:15px" src="data:image/png;base64,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" />\r
								</td>\r
								<td>\r
									<table>\r
										<tbody>\r
											<tr>\r
												<td colspan="4" style="color:black;font-weight:bold;font-size:16px; padding-left:4px">\r
													<xsl:for-each select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName">\r
														<xsl:value-of select="cbc:Name" />\r
													</xsl:for-each>\r
												</td>\r
											</tr>\r
											<tr>\r
												<td>\r
													<table>\r
														<tbody>\r
															<tr>\r
																<td style="vertical-align:top;width:55px">\r
																	<b>ADRES</b>\r
																	<span style="float:right; font-weight:bold"> : </span>\r
																</td>\r
																<td style="vertical-align:top; " colspan="3">\r
																	<xsl:for-each select="n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PostalAddress">\r
																		<xsl:if test="cbc:Region !=''">\r
																			<xsl:value-of select="cbc:Region" />\r
																			<span>\r
																				<xsl:text></xsl:text>\r
																			</span>\r
																		</xsl:if>\r
																		<xsl:for-each select="cbc:StreetName">\r
																			<xsl:choose>\r
																				<xsl:when test="contains(., 'Mersis No:')">\r
																					<xsl:value-of select="normalize-space(substring-before(., 'Mersis No:'))" />\r
																				</xsl:when>\r
																				<xsl:otherwise>\r
																					<xsl:value-of select="." />\r
																				</xsl:otherwise>\r
																			</xsl:choose>\r
																			<span>\r
																				<xsl:text></xsl:text>\r
																			</span>\r
																		</xsl:for-each>\r
																		<xsl:for-each select="cbc:BuildingName">\r
																			<xsl:apply-templates />\r
																		</xsl:for-each>\r
																		<xsl:for-each select="cbc:BuildingNumber">\r
																			<xsl:if test=". !=''">\r
																				<span>\r
																					<xsl:text> No : </xsl:text>\r
																				</span>\r
																				<xsl:value-of select="." />\r
																			</xsl:if>\r
																			<span>\r
																				<xsl:text></xsl:text>\r
																			</span>\r
																		</xsl:for-each>\r
																		<xsl:for-each select="cbc:Room">\r
																			<xsl:if test=". !=''">\r
																				<span>\r
																					<xsl:text>/</xsl:text>\r
																				</span>\r
																				<xsl:value-of select="." />\r
																			</xsl:if>\r
																			<span>\r
																				<xsl:text></xsl:text>\r
																			</span>\r
																		</xsl:for-each>\r
																		<xsl:for-each select="cbc:PostalZone">\r
																			<xsl:apply-templates />\r
																			<span>\r
																				<xsl:text></xsl:text>\r
																			</span>\r
																		</xsl:for-each>\r
																		<xsl:for-each select="cbc:CitySubdivisionName">\r
																			<xsl:apply-templates />\r
																		</xsl:for-each>\r
																		<span>\r
																			<xsl:text> / </xsl:text>\r
																		</span>\r
																		<xsl:for-each select="cbc:CityName">\r
																			<xsl:apply-templates />\r
																			<span>\r
																				<xsl:text></xsl:text>\r
																			</span>\r
																		</xsl:for-each>\r
																	</xsl:for-each>\r
																</td>\r
															</tr>\r
															<tr>\r
																<td style="vertical-align:top">\r
																	<b>TEL</b>\r
																	<span style="float:right;font-weight:bold"> : </span>\r
																</td>\r
																<td style="vertical-align:top; width:92px">\r
																	<xsl:for-each select="//cac:AccountingSupplierParty/cac:Party/cac:Contact">\r
																		<xsl:if test="cbc:Telephone">\r
																			<xsl:for-each select="cbc:Telephone">\r
																				<xsl:apply-templates />\r
																			</xsl:for-each>\r
																		</xsl:if>\r
																	</xsl:for-each>\r
																</td>\r
																<td style="vertical-align:top; width:95px">\r
																	<b>E-MAIL</b>\r
																	<span style="float:right; font-weight:bold"> : </span>\r
																</td>\r
																<td style="vertical-align:top">\r
																	<xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:ElectronicMail">\r
																		<xsl:value-of select="." />\r
																	</xsl:for-each>\r
																</td>\r
															</tr>\r
															<tr>\r
																<td style="vertical-align:top">\r
																	<b>FAX</b>\r
																	<span style="float:right;font-weight:bold"> : </span>\r
																</td>\r
																<td style="vertical-align:top">\r
																	<xsl:for-each select="//cac:AccountingSupplierParty/cac:Party/cac:Contact">\r
																		<xsl:if test="cbc:Telefax">\r
																			<xsl:for-each select="cbc:Telefax">\r
																				<xsl:apply-templates />\r
																			</xsl:for-each>\r
																		</xsl:if>\r
																	</xsl:for-each>\r
																</td>\r
																<td style="vertical-align:top">\r
																	<b>Tic. Sicil No</b>\r
																	<span style="float:right; font-weight:bold"> : </span>\r
																</td>\r
																<td style="vertical-align:top">\r
																	<xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification">\r
																		<xsl:if test="cbc:ID !='' and cbc:ID/@schemeID='TICARETSICILNO'">\r
																			<xsl:value-of select="cbc:ID" />\r
																		</xsl:if>\r
																	</xsl:for-each>\r
																</td>\r
															</tr>\r
															<tr>\r
																<td style="vertical-align:top">\r
																	<b>V.D.</b>\r
																	<span style="float:right;font-weight:bold"> : </span>\r
																</td>\r
																<td style="vertical-align:top">\r
																	<xsl:for-each select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme">\r
																		<xsl:for-each select="cbc:Name">\r
																			<xsl:apply-templates />\r
																		</xsl:for-each>\r
																	</xsl:for-each>\r
																</td>\r
																<td style="vertical-align:top">\r
																	<b>Mersis No</b>\r
																	<span style="float:right; font-weight:bold"> : </span>\r
																</td>\r
																<td style="vertical-align:top">\r
																	<xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification">\r
																		<xsl:if test="cbc:ID !='' and cbc:ID/@schemeID='MERSISNO'">\r
																			<xsl:value-of select="cbc:ID" />\r
																		</xsl:if>\r
																	</xsl:for-each>\r
																</td>\r
															</tr>\r
															<tr>\r
																<td style="vertical-align:top">\r
																	<b>VKN</b>\r
																	<span style="float:right;font-weight:bold"> : </span>\r
																</td>\r
																<td style="vertical-align:top">\r
																	<xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification">\r
																		<xsl:if test="cbc:ID !='' and cbc:ID/@schemeID='VKN'">\r
																			<xsl:value-of select="cbc:ID" />\r
																		</xsl:if>\r
																	</xsl:for-each>\r
																</td>\r
																<td style="vertical-align:top">\r
																	<b>WEB</b>\r
																	<span style="float:right;font-weight:bold"> : </span>\r
																</td>\r
																<td style="vertical-align:top">\r
																	<xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cbc:WebsiteURI">\r
																		<xsl:value-of select="." />\r
																	</xsl:for-each>\r
																</td>\r
															</tr>\r
														</tbody>\r
													</table>\r
												</td>\r
											</tr>\r
										</tbody>\r
									</table>\r
								</td>\r
<td>\r
 <img src="{$QRSOVOS}" alt="qrcode" width="175px" />\r
</td>\r
							</tr>\r
						</tbody>\r
					</table>\r
					<table cellspacing="0px" width="763" cellpadding="0px">\r
						<tbody>\r
							<tr style="height:118px; " valign="top">\r
								<td width="40%" valign="top" style="padding-top:10px">\r
									<table id="customerPartyTable" align="left" border="0" height="50%" style="margin-bottom: 5px;border: 1px solid black; border-left-width:5px; width:95%; margin-left:-2px">\r
										<tbody>\r
											<tr style="height:71px; ">\r
												<td style="padding:0px">\r
													<table align="center" border="0" style="padding:5px 10px">\r
														<tbody>\r
															<tr>\r
																<xsl:for-each select="n1:Invoice">\r
																	<xsl:for-each select="cac:AccountingCustomerParty">\r
																		<xsl:for-each select="cac:Party">\r
																			<td style="width:469px; padding-bottom:2px; padding-left:2px " align="left">\r
																				<span style="font-weight:bold; ">\r
																					<xsl:text>SAYIN</xsl:text>\r
																				</span>\r
																			</td>\r
																		</xsl:for-each>\r
																	</xsl:for-each>\r
																</xsl:for-each>\r
															</tr>\r
															<tr>\r
																<xsl:for-each select="n1:Invoice">\r
																	<xsl:for-each select="cac:AccountingCustomerParty">\r
																		<xsl:for-each select="cac:Party">\r
																			<td style="width:469px; padding:1px 0px; padding-left:2px" align="left">\r
																				<xsl:if test="cac:PartyName">\r
																					<span style="font-weight:bold; ">\r
																						<xsl:value-of select="cac:PartyName/cbc:Name" />\r
																					</span>\r
																				</xsl:if>\r
																				<xsl:for-each select="cac:Person">\r
																					<xsl:for-each select="cbc:Title">\r
																						<xsl:apply-templates />\r
																						<span>\r
																							<xsl:text></xsl:text>\r
																						</span>\r
																					</xsl:for-each>\r
																					<xsl:for-each select="cbc:MiddleName">\r
																						<xsl:apply-templates />\r
																						<span>\r
																							<xsl:text></xsl:text>\r
																						</span>\r
																					</xsl:for-each>\r
																					<xsl:for-each select="cbc:NameSuffix">\r
																						<xsl:apply-templates />\r
																					</xsl:for-each>\r
																				</xsl:for-each>\r
																			</td>\r
																		</xsl:for-each>\r
																	</xsl:for-each>\r
																</xsl:for-each>\r
															</tr>\r
															<tr>\r
																<xsl:for-each select="n1:Invoice">\r
																	<xsl:for-each select="cac:AccountingCustomerParty">\r
																		<xsl:for-each select="cac:Party">\r
																			<td style="width:469px; padding:1px 0px; padding-left:2px" align="left">\r
																				<xsl:for-each select="cac:PostalAddress">\r
																					<xsl:if test="cbc:Region !=''">\r
																						<xsl:value-of select="cbc:Region" />\r
																						<span>\r
																							<xsl:text></xsl:text>\r
																						</span>\r
																					</xsl:if>\r
																					<xsl:for-each select="cbc:StreetName">\r
																						<xsl:apply-templates />\r
																						<span>\r
																							<xsl:text></xsl:text>\r
																						</span>\r
																					</xsl:for-each>\r
																					<xsl:for-each select="cbc:BuildingName">\r
																						<xsl:apply-templates />\r
																					</xsl:for-each>\r
																					<xsl:for-each select="cbc:BuildingNumber">\r
																						<xsl:if test=". !=''">\r
																							<span>\r
																								<xsl:text> No : </xsl:text>\r
																							</span>\r
																							<xsl:value-of select="." />\r
																						</xsl:if>\r
																					</xsl:for-each>\r
																					<xsl:for-each select="cbc:Room">\r
																						<xsl:if test=". !=''">\r
																							<span>\r
																								<xsl:text>/</xsl:text>\r
																							</span>\r
																							<xsl:value-of select="." />\r
																							<span>\r
																								<xsl:text></xsl:text>\r
																							</span>\r
																						</xsl:if>\r
																					</xsl:for-each>\r
																					<xsl:for-each select="cbc:PostalZone">\r
																						<xsl:apply-templates />\r
																						<span>\r
																							<xsl:text></xsl:text>\r
																						</span>\r
																					</xsl:for-each>\r
																					<xsl:for-each select="cbc:CitySubdivisionName">\r
																						<xsl:apply-templates />\r
																					</xsl:for-each>\r
																					<span>\r
																						<xsl:text> / </xsl:text>\r
																					</span>\r
																					<xsl:for-each select="cbc:CityName">\r
																						<xsl:apply-templates />\r
																						<span>\r
																							<xsl:text></xsl:text>\r
																						</span>\r
																					</xsl:for-each>\r
																				</xsl:for-each>\r
																			</td>\r
																		</xsl:for-each>\r
																	</xsl:for-each>\r
																</xsl:for-each>\r
															</tr>\r
															<xsl:if test="n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail !=''">\r
																<xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail">\r
																	<tr align="left" style="width:469px; padding:1px 0px; padding-left:2px">\r
																		<td>\r
																			<b>\r
																				<xsl:text>E-Posta : </xsl:text>\r
																			</b>\r
																			<xsl:value-of select="." />\r
																		</td>\r
																	</tr>\r
																</xsl:for-each>\r
															</xsl:if>\r
															<xsl:for-each select="n1:Invoice">\r
																<xsl:for-each select="cac:AccountingCustomerParty">\r
																	<xsl:for-each select="cac:Party">\r
																		<xsl:for-each select="cac:Contact">\r
																			<xsl:if test="cbc:Telephone !='' or cbc:Telefax !=''">\r
																				<tr align="left">\r
																					<td style="width:469px; padding:1px 0px; padding-left:2px;" align="left">\r
																						<xsl:if test="cbc:Telephone !=''">\r
																							<xsl:for-each select="cbc:Telephone">\r
																								<span>\r
																									<b>\r
																										<xsl:text>Tel : </xsl:text>\r
																									</b>\r
																								</span>\r
																								<xsl:apply-templates />\r
																							</xsl:for-each>\r
																						</xsl:if>\r
																						<xsl:if test="cbc:Telephone !='' and cbc:Telefax !=''">\r
																							<b>\r
																								<xsl:text> - </xsl:text>\r
																							</b>\r
																						</xsl:if>\r
																						<xsl:if test="cbc:Telefax !=''">\r
																							<xsl:for-each select="cbc:Telefax">\r
																								<span>\r
																									<b>\r
																										<xsl:text>Fax : </xsl:text>\r
																									</b>\r
																								</span>\r
																								<xsl:apply-templates />\r
																							</xsl:for-each>\r
																						</xsl:if>\r
																						<span>\r
																							<xsl:text></xsl:text>\r
																						</span>\r
																					</td>\r
																				</tr>\r
																			</xsl:if>\r
																		</xsl:for-each>\r
																		<tr align="left">\r
																			<td style="padding:1px 0px; padding-left:2px">\r
																				<xsl:if test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name">\r
																					<span>\r
																						<b>\r
																							<xsl:text>V.D. : </xsl:text>\r
																						</b>\r
																						<xsl:value-of select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name" />\r
																						<xsl:text></xsl:text>\r
																					</span>\r
																				</xsl:if>\r
																				<xsl:if test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID !=''">\r
																					<xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification">\r
																						<xsl:if test="cbc:ID/@schemeID = 'VKN'">\r
																							<b>\r
																								<xsl:value-of select="cbc:ID/@schemeID" />\r
																								<xsl:text> : </xsl:text>\r
																							</b>\r
																							<xsl:value-of select="cbc:ID" />\r
																						</xsl:if>\r
																					</xsl:for-each>\r
																				</xsl:if>\r
																			</td>\r
																		</tr>\r
																	</xsl:for-each>\r
																</xsl:for-each>\r
															</xsl:for-each>\r
															<xsl:if test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID !=''">\r
																<xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification">\r
																	<xsl:if test="cbc:ID/@schemeID != 'VKN'">\r
																		<tr align="left">\r
																			<td style="width:469px; padding:1px 0px; padding-left:2px" align="left">\r
																				<b>\r
																					<xsl:value-of select="cbc:ID/@schemeID" />\r
																					<xsl:text> : </xsl:text>\r
																				</b>\r
																				<xsl:value-of select="cbc:ID" />\r
																			</td>\r
																		</tr>\r
																	</xsl:if>\r
																</xsl:for-each>\r
															</xsl:if>\r
															<xsl:if test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:AgentParty/cac:PartyIdentification/cbc:ID !=''">\r
																<xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:AgentParty/cac:PartyIdentification">\r
																	<tr align="left">\r
																		<td style="width:469px; padding:1px 0px; padding-left:2px" align="left">\r
																			<b>\r
																				<xsl:value-of select="cbc:ID/@schemeID" />\r
																				<xsl:text> : </xsl:text>\r
																			</b>\r
																			<xsl:value-of select="cbc:ID" />\r
																		</td>\r
																	</tr>\r
																</xsl:for-each>\r
															</xsl:if>\r
														</tbody>\r
													</table>\r
												</td>\r
											</tr>\r
										</tbody>\r
									</table>\r
								</td>\r
								<td width="27%" align="center" valign="middle">\r
									<img style="width:90px;" align="middle" alt="E-Fatura Logo" src="data:image/jpeg;base64,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" />\r
									<h1 align="center" style="padding:0px">\r
										<span style="font-weight:bold; ">\r
											<xsl:text>e-Fatura</xsl:text>\r
										</span>\r
									</h1>\r
								</td>\r
								<td width="33%" align="center" valign="top" colspan="2" style="padding-top:10px">\r
									<table border="0" height="13" id="despatchTable" style="border: 1px solid black; margin-right: -2px;">\r
										<tbody>\r
											<xsl:if test="n1:Invoice/cbc:CustomizationID !=''">\r
												<tr style="height:13px; ">\r
													<td style="width:105px; padding:4px;background-color: #; color: black; " align="left">\r
														<span style="font-weight:bold; ">\r
															<xsl:text>Özelleştirme No</xsl:text>\r
														</span>\r
													</td>\r
													<td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding:4px">\r
														<span>:</span>\r
													</td>\r
													<td style="padding: 4px; min-width: 112px;padding:4px;" align="left">\r
														<xsl:for-each select="n1:Invoice">\r
															<xsl:for-each select="cbc:CustomizationID">\r
																<xsl:apply-templates />\r
															</xsl:for-each>\r
														</xsl:for-each>\r
													</td>\r
												</tr>\r
											</xsl:if>\r
											<xsl:if test="n1:Invoice/cbc:ProfileID !=''">\r
												<tr style="height:13px; ">\r
													<td align="left" style="width:105px; padding: 4px; background-color: #; color: black; ">\r
														<span style="font-weight:bold; ">\r
															<xsl:text>Senaryo</xsl:text>\r
														</span>\r
													</td>\r
													<td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">\r
														<span>:</span>\r
													</td>\r
													<td align="left" style="padding: 4px; ">\r
														<xsl:for-each select="n1:Invoice">\r
															<xsl:for-each select="cbc:ProfileID">\r
																<xsl:apply-templates />\r
															</xsl:for-each>\r
														</xsl:for-each>\r
													</td>\r
												</tr>\r
											</xsl:if>\r
											<xsl:if test="n1:Invoice/cbc:InvoiceTypeCode !=''">\r
												<tr style="height:13px; ">\r
													<td align="left" style="width:105px; padding: 4px; background-color: #; color: black; ">\r
														<span style="font-weight:bold; ">\r
															<xsl:text>Fatura Tipi</xsl:text>\r
														</span>\r
													</td>\r
													<td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">\r
														<span>:</span>\r
													</td>\r
													<td align="left" style="padding: 4px;">\r
														<xsl:for-each select="n1:Invoice">\r
															<xsl:for-each select="cbc:InvoiceTypeCode">\r
																<xsl:apply-templates />\r
															</xsl:for-each>\r
														</xsl:for-each>\r
													</td>\r
												</tr>\r
											</xsl:if>\r
											<xsl:if test="n1:Invoice/cbc:ID !=''">\r
												<tr style="height:13px; ">\r
													<td align="left" style="width:105px; padding: 4px; background-color: #; color: black; ">\r
														<span style="font-weight:bold; ">\r
															<xsl:text>Fatura No</xsl:text>\r
														</span>\r
													</td>\r
													<td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">\r
														<span>:</span>\r
													</td>\r
													<td align="left" style="padding: 4px; ">\r
														<xsl:for-each select="n1:Invoice">\r
															<xsl:for-each select="cbc:ID">\r
																<xsl:apply-templates />\r
															</xsl:for-each>\r
														</xsl:for-each>\r
													</td>\r
												</tr>\r
											</xsl:if>\r
											<xsl:if test="n1:Invoice/cbc:IssueDate !=''">\r
												<tr style="height:13px; ">\r
													<td align="left" style="width:105px; padding: 4px; background-color: #; color:black">\r
														<span style="font-weight:bold; ">\r
															<xsl:text>Fatura Tarihi</xsl:text>\r
														</span>\r
													</td>\r
													<td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">\r
														<span>:</span>\r
													</td>\r
													<td align="left" style="padding: 4px;">\r
														<xsl:for-each select="n1:Invoice">\r
															<xsl:for-each select="cbc:IssueDate">\r
																<xsl:value-of select="substring(.,9,2)" />-\r
																<xsl:value-of select="substring(.,6,2)" />-\r
																<xsl:value-of select="substring(.,1,4)" />\r
															</xsl:for-each>\r
														</xsl:for-each>\r
													</td>\r
												</tr>\r
												<xsl:for-each select="n1:Invoice/cac:DespatchDocumentReference">\r
													<xsl:if test="cbc:ID !=''">\r
														<tr style="height:13px; ">\r
															<td align="left" style="width:105px; padding: 4px; background-color: #; color: black; ">\r
																<span style="font-weight:bold; ">\r
																	<xsl:text>İrsaliye No</xsl:text>\r
																</span>\r
															</td>\r
															<td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">\r
																<span>:</span>\r
															</td>\r
															<td align="left" style="padding: 4px">\r
																<xsl:value-of select="cbc:ID" />\r
															</td>\r
														</tr>\r
													</xsl:if>\r
													<xsl:if test="cbc:IssueDate !=''">\r
														<tr style="height:13px; ">\r
															<td align="left" style="width:105px; padding: 4px; background-color: #; color:black">\r
																<span style="font-weight:bold; ">\r
																	<xsl:text>İrsaliye Tarihi</xsl:text>\r
																</span>\r
															</td>\r
															<td style="background-color: #;border-color:lightgray; width:1px; font-weight:bold;color:black;padding: 4px">\r
																<span>: </span>\r
															</td>\r
															<td align="left" style="padding: 4px;">\r
																<xsl:for-each select="cbc:IssueDate">\r
																	<xsl:value-of select="substring(.,9,2)" />-\r
																	<xsl:value-of select="substring(.,6,2)" />-\r
																	<xsl:value-of select="substring(.,1,4)" />\r
																</xsl:for-each>\r
															</td>\r
														</tr>\r
													</xsl:if>\r
												</xsl:for-each>\r
											</xsl:if>\r
										</tbody>\r
									</table>\r
								</td>\r
							</tr>\r
							<tr align="left">\r
								<table id="ettnTable" style="width:377px; margin-bottom:5px">\r
									<tr style="height:13px;">\r
										<td align="left" valign="top" style="width:40px ;padding: 5px; color:black;">\r
											<span style="font-weight:bold; ">\r
												<xsl:text>ETTN :</xsl:text>\r
											</span>\r
										</td>\r
										<td align="left" style="color:dimgray; font-weight:bold ">\r
											<xsl:for-each select="n1:Invoice">\r
												<xsl:for-each select="cbc:UUID">\r
													<xsl:apply-templates />\r
												</xsl:for-each>\r
											</xsl:for-each>\r
										</td>\r
									</tr>\r
								</table>\r
							</tr>\r
						</tbody>\r
					</table>\r
					<table id="lineTable" width="793" style="border:0px; border-color: gray;">\r
						<tbody>\r
							<tr id="lineTableTr">\r
								<td id="lineTableTd" style="background-color: #; color: black;" align="center">\r
									<span style="font-weight:bold; ">\r
										<xsl:text>No</xsl:text>\r
									</span>\r
								</td>\r
								<td id="lineTableTd" style="width:294px; background-color: #; color: black;" align="center">\r
									<span style="font-weight:bold; ">\r
										<xsl:text>Mal Hizmet</xsl:text>\r
									</span>\r
								</td>\r
								<td id="lineTableTd" style="background-color: #; color: black;" align="center">\r
									<span style="font-weight:bold;">\r
										<xsl:text>Miktar</xsl:text>\r
									</span>\r
								</td>\r
								<td id="lineTableTd" style="background-color: #; color: black;" align="center">\r
									<span style="font-weight:bold;">\r
										<xsl:text>Birim</xsl:text>\r
									</span>\r
								</td>\r
								<td id="lineTableTd" style="width:74px; background-color: #; color: black;" align="center">\r
									<span style="font-weight:bold; ">\r
										<xsl:text>Fiyat</xsl:text>\r
									</span>\r
								</td>\r
								<td id="lineTableTd" style="width:74px; background-color: #; color: black;" align="center">\r
									<span style="font-weight:bold; ">\r
										<xsl:text>İskonto Oranı</xsl:text>\r
									</span>\r
								</td>\r
								<td id="lineTableTd" style="background-color: #; color: black;" align="center">\r
									<span style="font-weight:bold; ">\r
										<xsl:text>İskonto Tutarı</xsl:text>\r
									</span>\r
								</td>\r
								<td id="lineTableTd" style="width:100px; background-color: #; color: black;" align="center">\r
									<span style="font-weight:bold; ">\r
										<xsl:text>KDV Oranı</xsl:text>\r
									</span>\r
								</td>\r
								<td id="lineTableTd" style="width:84px; background-color: #; color:black;" align="center">\r
									<span style="font-weight:bold; ">\r
										<xsl:text>KDV Tutarı</xsl:text>\r
									</span>\r
								</td>\r
								<td id="lineTableTd" style="width:84px; background-color: #; color: black;" align="center">\r
									<span style="font-weight:bold; ">\r
										<xsl:text>Mal Hizmet Tutarı</xsl:text>\r
									</span>\r
								</td>\r
							</tr>\r
							<xsl:for-each select="//n1:Invoice/cac:InvoiceLine">\r
								<xsl:choose>\r
									<xsl:when test=".">\r
										<xsl:apply-templates select="." />\r
									</xsl:when>\r
									<xsl:otherwise>\r
										<xsl:apply-templates select="//n1:Invoice" />\r
									</xsl:otherwise>\r
								</xsl:choose>\r
							</xsl:for-each>\r
							<tr>\r
								<td colspan="3" style="text-align:right;">\r
									<b>Toplam Miktar : </b>\r
								</td>\r
								<td style="border:1px solid gray; " colspan="4">\r
									<xsl:text></xsl:text>\r
									<xsl:for-each select="//cbc:InvoicedQuantity[generate-id(.)=generate-id(key('unitcode', @unitCode)[1])]">\r
										<xsl:variable name="uCode">\r
											<xsl:value-of select="@unitCode" />\r
										</xsl:variable>\r
										<xsl:variable name="lstInvoiceQ" select="//cbc:InvoicedQuantity[@unitCode=$uCode]" />\r
										<xsl:call-template name="ShowEmployeesInTeam">\r
											<xsl:with-param name="lstInvoiceQ" select="$lstInvoiceQ" />\r
										</xsl:call-template>\r
									</xsl:for-each>\r
								</td>\r
							</tr>\r
						</tbody>\r
					</table>\r
				</xsl:for-each>\r
				<xsl:variable name="allowTotStyle">\r
					<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount != 0">min-height:121px;</xsl:if>\r
				</xsl:variable>\r
				<table style="margin-left:-3px; margin-right:-3px;">\r
					<tbody>\r
						<tr>\r
							<td style="width:59%; vertical-align:top">\r
								<table id="notesTable" align="left" width="100%" style="height:auto;min-height: 97px;{$allowTotStyle}border: 1px solid gray;padding-bottom:15px;">\r
									<tbody>\r
										<tr align="left" valign="top">\r
											<td id="notesTableTd" style="padding:10px; width:60%">\r
												<xsl:for-each select="n1:Invoice/cbc:Note">\r
													<xsl:if test="not(contains(., '#')) and not(contains(., 'Yazı ile yalnız :')) and . !='' ">\r
														<b>Not : </b>\r
														<xsl:value-of select="." />\r
														<br />\r
													</xsl:if>\r
												</xsl:for-each>\r
												<xsl:for-each select="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">\r
													<xsl:if test="cbc:Percent=0 and cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015'">\r
														<b>      Vergi İstisna Muafiyet Sebebi: </b>\r
														<xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReason" />\r
														<br />\r
													</xsl:if>\r
												</xsl:for-each>\r
												<xsl:for-each select="n1:Invoice/cac:PaymentMeans">\r
													<xsl:if test="cbc:InstructionNote !=''">\r
														<b>Ödeme Notu : </b>\r
														<xsl:value-of select="//n1:Invoice/cac:PaymentMeans/cbc:InstructionNote" />\r
														<br />\r
													</xsl:if>\r
													<xsl:if test="cbc:PaymentNote !=''">\r
														<b>Hesap Açıklaması : </b>\r
														<xsl:value-of select="//n1:Invoice/cac:PaymentMeans/cac:PayeeFinancialAccount/cbc:PaymentNote" />\r
														<br />\r
													</xsl:if>\r
												</xsl:for-each>\r
											</td>\r
										</tr>\r
									</tbody>\r
								</table>\r
							</td>\r
							<td style="vertical-align:top">\r
								<table id="budgetContainerTable" width="100%" style="margin-top:0px">\r
									<tr id="budgetContainerTr" align="right">\r
										<td id="lineTableBudgetTd" align="right" style="background-color: #; color: black;width:68%">\r
											<span style="font-weight:bold; ">\r
												<xsl:text>Mal Hizmet Toplam Tutarı</xsl:text>\r
											</span>\r
										</td>\r
										<td id="lineTableBudgetTd" style="width:32%;" align="right">\r
											<span>\r
												<xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount, '###.##0,00', 'european')" />\r
												<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID">\r
													<xsl:text></xsl:text>\r
													<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID = 'TRY'">\r
														<xsl:text>TL</xsl:text>\r
													</xsl:if>\r
													<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID != 'TRY'">\r
														<xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID" />\r
													</xsl:if>\r
												</xsl:if>\r
											</span>\r
										</td>\r
									</tr>\r
									<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount != 0">\r
										<tr id="budgetContainerTr" align="right">\r
											<td id="lineTableBudgetTd" align="right" width="200px" style="background-color: #; color: black">\r
												<span style="font-weight:bold; ">\r
													<xsl:text>Toplam İskonto</xsl:text>\r
												</span>\r
											</td>\r
											<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
												<span>\r
													<xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount, '###.##0,00', 'european')" />\r
													<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID">\r
														<xsl:text></xsl:text>\r
														<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID = 'TRY'">\r
															<xsl:text>TL</xsl:text>\r
														</xsl:if>\r
														<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID != 'TRY'">\r
															<xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID" />\r
														</xsl:if>\r
													</xsl:if>\r
												</span>\r
											</td>\r
										</tr>\r
									</xsl:if>\r
									<xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">\r
										<tr id="budgetContainerTr" align="right">\r
											<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
												<span style="font-weight:bold; ">\r
													<xsl:text>Hesaplanan KDV </xsl:text>\r
													<xsl:text>(%</xsl:text>\r
													<xsl:value-of select="cbc:Percent" />\r
													<xsl:text>)</xsl:text>\r
												</span>\r
											</td>\r
											<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
												<xsl:for-each select="cac:TaxCategory/cac:TaxScheme">\r
													<xsl:text></xsl:text>\r
													<xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />\r
													<xsl:if test="../../cbc:TaxAmount/@currencyID">\r
														<xsl:text></xsl:text>\r
														<xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRY'">\r
															<xsl:text>TL</xsl:text>\r
														</xsl:if>\r
														<xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRY'">\r
															<xsl:value-of select="../../cbc:TaxAmount/@currencyID" />\r
														</xsl:if>\r
													</xsl:if>\r
												</xsl:for-each>\r
											</td>\r
										</tr>\r
									</xsl:for-each>\r
									<xsl:for-each select="n1:Invoice/cac:WithholdingTaxTotal/cac:TaxSubtotal">\r
										<tr id="budgetContainerTr" align="right">\r
											<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
												<span style="font-weight:bold; ">\r
													<xsl:text>KDV Tevkifatı </xsl:text>\r
													<xsl:text>(%</xsl:text>\r
													<xsl:value-of select="cbc:Percent" />\r
													<xsl:text>)</xsl:text>\r
												</span>\r
											</td>\r
											<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
												<xsl:for-each select="cac:TaxCategory/cac:TaxScheme">\r
													<xsl:text></xsl:text>\r
													<xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />\r
													<xsl:if test="../../cbc:TaxAmount/@currencyID">\r
														<xsl:text></xsl:text>\r
														<xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRL' or ../../cbc:TaxAmount/@currencyID = 'TRY'">\r
															<xsl:text>TL</xsl:text>\r
														</xsl:if>\r
														<xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRL' and ../../cbc:TaxAmount/@currencyID != 'TRY'">\r
															<xsl:value-of select="../../cbc:TaxAmount/@currencyID" />\r
														</xsl:if>\r
													</xsl:if>\r
												</xsl:for-each>\r
											</td>\r
										</tr>\r
									</xsl:for-each>\r
									<xsl:if test="sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount)&gt;0">\r
										<tr id="budgetContainerTr" align="right">\r
											<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
												<span style="font-weight:bold; ">\r
													<xsl:text>Tevkifata Tabi İşlem Tutarı</xsl:text>\r
												</span>\r
											</td>\r
											<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
												<xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:LineExtensionAmount), '###.##0,00', 'european')" />\r
												<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">\r
													<xsl:text>TL</xsl:text>\r
												</xsl:if>\r
												<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">\r
													<xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />\r
												</xsl:if>\r
											</td>\r
										</tr>\r
										<tr id="budgetContainerTr" align="right">\r
											<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
												<span style="font-weight:bold; ">\r
													<xsl:text>Tevkifata Tabi İşlem Üz. Hes.KDV</xsl:text>\r
												</span>\r
											</td>\r
											<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
												<xsl:value-of select="format-number(sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount), '###.##0,00', 'european')" />\r
												<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">\r
													<xsl:text>TL</xsl:text>\r
												</xsl:if>\r
												<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">\r
													<xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />\r
												</xsl:if>\r
											</td>\r
										</tr>\r
									</xsl:if>\r
									<xsl:if test="n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]">\r
										<tr id="budgetContainerTr" align="right">\r
											<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
												<span style="font-weight:bold; ">\r
													<xsl:text>Tevkifata Tabi İşlem Tutarı</xsl:text>\r
												</span>\r
											</td>\r
											<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
												<xsl:if test="n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]">\r
													<xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]/cbc:LineExtensionAmount), '###.##0,00', 'european')" />\r
												</xsl:if>\r
												<xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='9015'">\r
													<xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:LineExtensionAmount), '###.##0,00', 'european')" />\r
												</xsl:if>\r
												<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY' or n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">\r
													<xsl:text> TL</xsl:text>\r
												</xsl:if>\r
												<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY' and n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">\r
													<xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />\r
												</xsl:if>\r
											</td>\r
										</tr>\r
										<tr id="budgetContainerTr" align="right">\r
											<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
												<span style="font-weight:bold; ">\r
													<xsl:text>Tevkifata Tabi İşlem Üz. Hes. KDV</xsl:text>\r
												</span>\r
											</td>\r
											<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
												<xsl:if test="n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]">\r
													<xsl:value-of select="format-number(sum(n1:Invoice/cac:WithholdingTaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme]/cbc:TaxableAmount), '###.##0,00', 'european')" />\r
												</xsl:if>\r
												<xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='9015'">\r
													<xsl:value-of select="format-number(sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount), '###.##0,00', 'european')" />\r
												</xsl:if>\r
												<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY' or n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">\r
													<xsl:text> TL</xsl:text>\r
												</xsl:if>\r
												<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY' and n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">\r
													<xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />\r
												</xsl:if>\r
											</td>\r
										</tr>\r
									</xsl:if>\r
									<tr id="budgetContainerTr" align="right">\r
										<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
											<span style="font-weight:bold; ">\r
												<xsl:text>Beyan Edilecek KDV</xsl:text>\r
											</span>\r
										</td>\r
										<td align="right" id="lineTableBudgetTd" style="width:104px; ">\r
											<xsl:for-each select="n1:Invoice">\r
												<xsl:for-each select="cac:TaxTotal">\r
													<xsl:for-each select="cbc:TaxAmount">\r
														<xsl:value-of select="format-number(., '###.##0,00', 'european')" />\r
														<xsl:if test="//n1:Invoice/cac:TaxTotal/cbc:TaxAmount/@currencyID">\r
															<xsl:text></xsl:text>\r
															<xsl:if test="//n1:Invoice/cac:TaxTotal/cbc:TaxAmount/@currencyID = 'TRY'">\r
																<xsl:text>TL</xsl:text>\r
															</xsl:if>\r
															<xsl:if test="//n1:Invoice/cac:TaxTotal/cbc:TaxAmount/@currencyID != 'TRY'">\r
																<xsl:value-of select="//n1:Invoice/cac:TaxTotal/cbc:TaxAmount/@currencyID" />\r
															</xsl:if>\r
														</xsl:if>\r
													</xsl:for-each>\r
												</xsl:for-each>\r
											</xsl:for-each>\r
										</td>\r
									</tr>\r
									<tr id="budgetContainerTr" align="right">\r
										<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
											<span style="font-weight:bold; ">\r
												<xsl:text>Vergiler Dahil Toplam Tutar</xsl:text>\r
											</span>\r
										</td>\r
										<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
											<xsl:for-each select="n1:Invoice">\r
												<xsl:for-each select="cac:LegalMonetaryTotal">\r
													<xsl:for-each select="cbc:TaxInclusiveAmount">\r
														<xsl:value-of select="format-number(., '###.##0,00', 'european')" />\r
														<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID">\r
															<xsl:text></xsl:text>\r
															<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID = 'TRY'">\r
																<xsl:text>TL</xsl:text>\r
															</xsl:if>\r
															<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID != 'TRY'">\r
																<xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID" />\r
															</xsl:if>\r
														</xsl:if>\r
													</xsl:for-each>\r
												</xsl:for-each>\r
											</xsl:for-each>\r
										</td>\r
									</tr>\r
									<tr id="budgetContainerTr" align="right">\r
										<td id="lineTableBudgetTd" style=" background-color: #; color: black; width:200px" align="right">\r
											<span style="font-weight:bold; ">\r
												<xsl:text>Ödenecek Tutar</xsl:text>\r
											</span>\r
										</td>\r
										<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
											<xsl:for-each select="n1:Invoice">\r
												<xsl:for-each select="cac:LegalMonetaryTotal">\r
													<xsl:for-each select="cbc:PayableAmount">\r
														<xsl:value-of select="format-number(., '###.##0,00', 'european')" />\r
														<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID">\r
															<xsl:text></xsl:text>\r
															<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID = 'TRY'">\r
																<xsl:text>TL</xsl:text>\r
															</xsl:if>\r
															<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID != 'TRY'">\r
																<xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID" />\r
															</xsl:if>\r
														</xsl:if>\r
													</xsl:for-each>\r
												</xsl:for-each>\r
											</xsl:for-each>\r
										</td>\r
									</tr>\r
								</table>\r
								<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID != 'TRY'">\r
									<table id="budgetContainerTable" width="100%" style="margin-top:0px">\r
										<tr id="budgetContainerTr" align="right">\r
											<td id="lineTableBudgetTd" align="right" style="background-color: #; color: black;width:68%">\r
												<span style="font-weight:bold; ">\r
													<xsl:text>Mal Hizmet Toplam Tutarı</xsl:text>\r
												</span>\r
											</td>\r
											<td id="lineTableBudgetTd" style="width:32%;" align="right">\r
												<span>\r
													<xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />\r
													<xsl:text> TL</xsl:text>\r
												</span>\r
											</td>\r
										</tr>\r
										<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount != 0">\r
											<tr id="budgetContainerTr" align="right">\r
												<td id="lineTableBudgetTd" align="right" width="200px" style="background-color: #; color: black">\r
													<span style="font-weight:bold; ">\r
														<xsl:text>Toplam İskonto</xsl:text>\r
													</span>\r
												</td>\r
												<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
													<span>\r
														<xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount, '###.##0,00', 'european')" />\r
														<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID">\r
															<xsl:text></xsl:text>\r
															<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID = 'TRY'">\r
																<xsl:text>TL</xsl:text>\r
															</xsl:if>\r
															<xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID != 'TRY'">\r
																<xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID" />\r
															</xsl:if>\r
														</xsl:if>\r
													</span>\r
												</td>\r
											</tr>\r
										</xsl:if>\r
										<xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">\r
											<tr id="budgetContainerTr" align="right">\r
												<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
													<span style="font-weight:bold; ">\r
														<xsl:text>Hesaplanan KDV </xsl:text>\r
														<xsl:text>(%</xsl:text>\r
														<xsl:value-of select="cbc:Percent" />\r
														<xsl:text>)</xsl:text>\r
													</span>\r
												</td>\r
												<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
													<span>\r
														<xsl:value-of select="format-number(//n1:Invoice/cac:TaxTotal/cbc:TaxAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />\r
														<xsl:text> TL</xsl:text>\r
													</span>\r
												</td>\r
											</tr>\r
										</xsl:for-each>\r
										<xsl:for-each select="n1:Invoice/cac:WithholdingTaxTotal/cac:TaxSubtotal">\r
											<tr id="budgetContainerTr" align="right">\r
												<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
													<span style="font-weight:bold; ">\r
														<xsl:text>KDV Tevkifatı </xsl:text>\r
														<xsl:text>(%</xsl:text>\r
														<xsl:value-of select="cbc:Percent" />\r
														<xsl:text>)</xsl:text>\r
													</span>\r
												</td>\r
												<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
													<xsl:for-each select="cac:TaxCategory/cac:TaxScheme">\r
														<xsl:text></xsl:text>\r
														<span>\r
															<xsl:value-of select="format-number(../../cbc:TaxAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />\r
															<xsl:text> TL</xsl:text>\r
														</span>\r
													</xsl:for-each>\r
												</td>\r
											</tr>\r
										</xsl:for-each>\r
										<xsl:if test="sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount)&gt;0">\r
											<tr id="budgetContainerTr" align="right">\r
												<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
													<span style="font-weight:bold; ">\r
														<xsl:text>Tevkifata Tabi İşlem Tutarı</xsl:text>\r
													</span>\r
												</td>\r
												<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
													<xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:LineExtensionAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate), '###.##0,00', 'european')" />\r
													<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">\r
														<xsl:text>TL</xsl:text>\r
													</xsl:if>\r
													<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">\r
														<xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />\r
													</xsl:if>\r
												</td>\r
											</tr>\r
											<tr id="budgetContainerTr" align="right">\r
												<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color:black">\r
													<span style="font-weight:bold; ">\r
														<xsl:text>Tevkifata Tabi İşlem Üzerinden Hes. KDV</xsl:text>\r
													</span>\r
												</td>\r
												<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
													<xsl:value-of select="format-number(sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate), '###.##0,00', 'european')" />\r
													<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">\r
														<xsl:text>TL</xsl:text>\r
													</xsl:if>\r
													<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">\r
														<xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />\r
													</xsl:if>\r
												</td>\r
											</tr>\r
										</xsl:if>\r
										<xsl:if test="n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]">\r
											<tr id="budgetContainerTr" align="right">\r
												<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
													<span style="font-weight:bold; ">\r
														<xsl:text>Tevkifata Tabi İşlem Tutarı</xsl:text>\r
													</span>\r
												</td>\r
												<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
													<xsl:if test="n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]">\r
														<xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]/cbc:LineExtensionAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate), '###.##0,00', 'european')" />\r
													</xsl:if>\r
													<xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='9015'">\r
														<xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:LineExtensionAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate), '###.##0,00', 'european')" />\r
													</xsl:if>\r
													<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY' or n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">\r
														<xsl:text> TL</xsl:text>\r
													</xsl:if>\r
													<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY' and n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">\r
														<xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />\r
													</xsl:if>\r
												</td>\r
											</tr>\r
											<tr id="budgetContainerTr" align="right">\r
												<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
													<span style="font-weight:bold; ">\r
														<xsl:text>Tevkifata Tabi İşlem Üz. Hes. KDV</xsl:text>\r
													</span>\r
												</td>\r
												<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
													<xsl:if test="n1:Invoice/cac:InvoiceLine[cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme]">\r
														<xsl:value-of select="format-number(sum(n1:Invoice/cac:WithholdingTaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme]/cbc:TaxableAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate), '###.##0,00', 'european')" />\r
													</xsl:if>\r
													<xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='9015'">\r
														<xsl:value-of select="format-number(sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate), '###.##0,00', 'european')" />\r
													</xsl:if>\r
													<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY' or n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">\r
														<xsl:text> TL</xsl:text>\r
													</xsl:if>\r
													<xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY' and n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">\r
														<xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />\r
													</xsl:if>\r
												</td>\r
											</tr>\r
										</xsl:if>\r
										<tr id="budgetContainerTr" align="right">\r
											<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
												<span style="font-weight:bold; ">\r
													<xsl:text>Beyan Edilecek KDV</xsl:text>\r
												</span>\r
											</td>\r
											<td align="right" id="lineTableBudgetTd" style="width:104px; ">\r
												<span>\r
													<xsl:value-of select="format-number(//n1:Invoice/cac:TaxTotal/cbc:TaxAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />\r
													<xsl:text> TL</xsl:text>\r
												</span>\r
											</td>\r
										</tr>\r
										<tr id="budgetContainerTr" align="right">\r
											<td id="lineTableBudgetTd" width="200px" align="right" style="background-color: #; color: black">\r
												<span style="font-weight:bold; ">\r
													<xsl:text>Vergiler Dahil Toplam Tutar</xsl:text>\r
												</span>\r
											</td>\r
											<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
												<span>\r
													<xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />\r
													<xsl:text> TL</xsl:text>\r
												</span>\r
											</td>\r
										</tr>\r
										<tr id="budgetContainerTr" align="right">\r
											<td id="lineTableBudgetTd" style=" background-color: #; color: black; width:200px" align="right">\r
												<span style="font-weight:bold; ">\r
													<xsl:text>Ödenecek Tutar</xsl:text>\r
												</span>\r
											</td>\r
											<td id="lineTableBudgetTd" style="width:104px; " align="right">\r
												<span>\r
													<xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />\r
													<xsl:text> TL</xsl:text>\r
												</span>\r
											</td>\r
										</tr>\r
									</table>\r
								</xsl:if>\r
							</td>\r
						</tr>\r
						<tr>\r
							<td colspan="2">\r
								<table id="notesTable" align="left" width="100%" style="height:auto;border: 1px solid gray; ">\r
									<tbody>\r
										<tr align="left" valign="top">\r
											<td id="notesTableTd" style="padding:5px 10px; width:60%">\r
												<xsl:for-each select="n1:Invoice/cbc:Note">\r
													<xsl:if test="contains(., 'Yazı ile yalnız :')">\r
														<b>\r
															<xsl:value-of select="normalize-space(substring-before(.,':'))" />: \r
														</b>\r
														<xsl:value-of select="normalize-space(substring-after(.,':'))" />\r
														<br />\r
													</xsl:if>\r
												</xsl:for-each>\r
											</td>\r
										</tr>\r
									</tbody>\r
								</table>\r
							</td>\r
						</tr>\r
						<tr>\r
							<td colspan="2">\r
								<table id="hesapBilgileri" style="border-top: 1px solid darkgray;padding:10px 0px; border-bottom:2px solid #000099;width:100%; margin-top:5px">\r
									<tr>\r
										<td style="width:100%; padding:0px">\r
											<fieldset style="margin:2px">\r
												<legend style="background-color:white">\r
													<b>\r
 HESAP BİLGİLERİMİZ</b>\r
												</legend>\r
												<table style="width:100%" id="bankingTable" border="1">\r
													<tr>\r
														<th style="width: 110px" align="left">\r
			BANKA ADI\r
		</th>\r
														<th style="width: 160px" align="left">\r
			ŞUBE ADI\r
		</th>\r
														<th style="width: 80px" align="left">\r
			ŞUBE KODU\r
		</th>\r
														<th style="width: 80px" align="left">\r
\r
			HESAP NO\r
\r
		</th>\r
														<th style="width: 220px" align="left">\r
			IBAN\r
		</th>\r
													</tr>\r
													<tr>\r
														<td>Garanti Bankası TL</td>\r
														<td>İkitelli OSB Şubesi</td>\r
														<td align="left">0373</td>\r
														<td>6298390</td>\r
														<td>TR45 0006 2000 3730 0006 2983 90</td>\r
													</tr>\r
													<tr>\r
														<td>Garanti Bankası USD</td>\r
														<td>İkitelli OSB Şubesi</td>\r
														<td align="left">0373</td>\r
														<td>9091742</td>\r
														<td>TR48 0006 2000 3730 0009 0917 42</td>\r
													</tr>\r
													<tr>\r
														<td></td>\r
														<td></td>\r
														<td align="left"></td>\r
														<td></td>\r
														<td></td>\r
													</tr>\r
													<tr>\r
														<td></td>\r
														<td></td>\r
														<td align="left"></td>\r
														<td></td>\r
														<td></td>\r
													</tr>\r
												</table>\r
											</fieldset>\r
										</td>\r
									</tr>\r
								</table>\r
							</td>\r
						</tr>\r
					</tbody>\r
				</table>\r
				<b> CABANI FABRIKA SATIŞ MAĞAZASI ALIŞVERİŞİNİZ İÇİN TEŞEKKÜR EDERİZ, MAĞAZALARIMIZDAN ALINAN SERİ SONU VE OUTLET ÜRÜNLERİN İADE EDİLEMEYECEĞİNİ VEYA DEĞİŞTİLEMEYECEĞİNİ LÜTFEN DİKKATE ALIN. ANCAK BU DURUM YASAL HAKLARINIZI ETKİLEMEZ. SORULARINIZI MAĞAZALARDAKİ CABANI ÇALIŞANLARINA SORABİLİRSİNİZ. </b>\r
			</body>\r
		</html>\r
	</xsl:template>\r
	<xsl:template match="dateFormatter">\r
		<xsl:value-of select="substring(.,9,2)" />-\r
		<xsl:value-of select="substring(.,6,2)" />-\r
		<xsl:value-of select="substring(.,1,4)" />\r
	</xsl:template>\r
	<xsl:template match="//n1:Invoice/cac:InvoiceLine">\r
		<tr id="lineTableTr">\r
			<td id="lineTableTd">\r
				<span>\r
					<xsl:text></xsl:text>\r
					<xsl:value-of select="./cbc:ID" />\r
				</span>\r
			</td>\r
			<td id="lineTableTd">\r
				<span>\r
					<xsl:text></xsl:text>\r
					<xsl:value-of select="./cac:Item/cbc:Name" />\r
					<xsl:text></xsl:text>\r
					<xsl:value-of select="./cac:Item/cbc:BrandName" />\r
					<xsl:text></xsl:text>\r
					<xsl:value-of select="./cac:Item/cbc:ModelName" />\r
				</span>\r
			</td>\r
			<td id="lineTableTd" align="center">\r
				<span>\r
					<xsl:value-of select="format-number(./cbc:InvoicedQuantity, '###.###,####', 'european')" />\r
				</span>\r
			</td>\r
			<td align="center" id="lineTableTd">\r
				<span>\r
					<xsl:text />\r
					<xsl:if test="./cbc:InvoicedQuantity/@unitCode">\r
						<xsl:for-each select="./cbc:InvoicedQuantity">\r
							<xsl:text />\r
							<xsl:choose>\r
								<xsl:when test="@unitCode  = '26'">\r
									<span>\r
										<xsl:text>Ton</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'BX'">\r
									<span>\r
										<xsl:text>Kutu</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'NIU'">\r
									<span>\r
										<xsl:text>Adet</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'C62'">\r
									<span>\r
										<xsl:text>Adet</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'KGM'">\r
									<span>\r
										<xsl:text>KG</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'KJO'">\r
									<span>\r
										<xsl:text>kJ</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'GRM'">\r
									<span>\r
										<xsl:text>G</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'MGM'">\r
									<span>\r
										<xsl:text>MG</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'NT'">\r
									<span>\r
										<xsl:text>Net Ton</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'GT'">\r
									<span>\r
										<xsl:text>GT</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'MTR'">\r
									<span>\r
										<xsl:text>M</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'MMT'">\r
									<span>\r
										<xsl:text>MM</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'KTM'">\r
									<span>\r
										<xsl:text>KM</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'MLT'">\r
									<span>\r
										<xsl:text>ML</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'ANN'">\r
									<xsl:text> Yıl</xsl:text>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'MMQ'">\r
									<span>\r
										<xsl:text>MM3</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'CLT'">\r
									<span>\r
										<xsl:text>CL</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'CMK'">\r
									<span>\r
										<xsl:text>CM2</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'CMQ'">\r
									<span>\r
										<xsl:text>CM3</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'CMT'">\r
									<span>\r
										<xsl:text>CM</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'MTK'">\r
									<span>\r
										<xsl:text>M2</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'MTQ'">\r
									<span>\r
										<xsl:text>M3</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'DAY'">\r
									<span>\r
										<xsl:text> Gün</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'MON'">\r
									<span>\r
										<xsl:text> Ay</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'PA'">\r
									<span>\r
										<xsl:text> Paket</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'PR'">\r
									<span>\r
										<xsl:text> Çift</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'DMT'">\r
									<span>\r
										<xsl:text> Desi</xsl:text>\r
									</span>\r
								</xsl:when>\r
								<xsl:when test="@unitCode  = 'KWH'">\r
									<span>\r
										<xsl:text> KWH</xsl:text>\r
									</span>\r
								</xsl:when>\r
							</xsl:choose>\r
						</xsl:for-each>\r
					</xsl:if>\r
				</span>\r
			</td>\r
			<td id="lineTableTd" align="center">\r
				<span>\r
					<xsl:text></xsl:text>\r
					<xsl:value-of select="format-number(./cac:Price/cbc:PriceAmount, '###.##0,00', 'european')" />\r
					<xsl:if test="./cac:Price/cbc:PriceAmount/@currencyID">\r
						<xsl:text></xsl:text>\r
						<xsl:if test="./cac:Price/cbc:PriceAmount/@currencyID = &quot;TRY&quot; ">\r
							<xsl:text>TL</xsl:text>\r
						</xsl:if>\r
						<xsl:if test="./cac:Price/cbc:PriceAmount/@currencyID != &quot;TRY&quot;">\r
							<xsl:value-of select="./cac:Price/cbc:PriceAmount/@currencyID" />\r
						</xsl:if>\r
					</xsl:if>\r
				</span>\r
			</td>\r
			<td align="center" id="lineTableTd">\r
				<span>\r
					<xsl:text></xsl:text>\r
					<xsl:if test="./cac:AllowanceCharge/cbc:MultiplierFactorNumeric">\r
						<xsl:text> %</xsl:text>\r
						<xsl:value-of select="format-number(./cac:AllowanceCharge/cbc:MultiplierFactorNumeric * 100, '###.##0,00', 'european')" />\r
					</xsl:if>\r
				</span>\r
			</td>\r
			<td align="center" id="lineTableTd">\r
				<span>\r
					<xsl:text></xsl:text>\r
					<xsl:if test="./cac:AllowanceCharge">\r
						<xsl:value-of select="format-number(./cac:AllowanceCharge/cbc:Amount, '###.##0,00', 'european')" />\r
					</xsl:if>\r
					<xsl:if test="./cac:AllowanceCharge/cbc:Amount/@currencyID">\r
						<xsl:text></xsl:text>\r
						<xsl:if test="./cac:AllowanceCharge/cbc:Amount/@currencyID = 'TRY'">\r
							<xsl:text>TL</xsl:text>\r
						</xsl:if>\r
						<xsl:if test="./cac:AllowanceCharge/cbc:Amount/@currencyID != 'TRY'">\r
							<xsl:value-of select="./cac:AllowanceCharge/cbc:Amount/@currencyID" />\r
						</xsl:if>\r
					</xsl:if>\r
				</span>\r
			</td>\r
			<td align="center" id="lineTableTd">\r
				<span>\r
					<xsl:text></xsl:text>\r
					<xsl:for-each select="./cac:TaxTotal">\r
						<xsl:for-each select="cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">\r
							<xsl:if test="cbc:TaxTypeCode='0015' ">\r
								<xsl:text></xsl:text>\r
								<xsl:if test="../../cbc:Percent">\r
									<xsl:text> %</xsl:text>\r
									<xsl:value-of select="format-number(../../cbc:Percent, '###.##0,00', 'european')" />\r
								</xsl:if>\r
							</xsl:if>\r
						</xsl:for-each>\r
					</xsl:for-each>\r
				</span>\r
			</td>\r
			<td align="center" id="lineTableTd">\r
				<span>\r
					<xsl:text></xsl:text>\r
					<xsl:for-each select="./cac:TaxTotal">\r
						<xsl:for-each select="cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">\r
							<xsl:if test="cbc:TaxTypeCode='0015' ">\r
								<xsl:text></xsl:text>\r
								<xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />\r
								<xsl:if test="../../cbc:TaxAmount/@currencyID">\r
									<xsl:text></xsl:text>\r
									<xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRY'">\r
										<xsl:text>TL</xsl:text>\r
									</xsl:if>\r
									<xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRY'">\r
										<xsl:value-of select="../../cbc:TaxAmount/@currencyID" />\r
									</xsl:if>\r
								</xsl:if>\r
							</xsl:if>\r
						</xsl:for-each>\r
					</xsl:for-each>\r
				</span>\r
			</td>\r
			<td id="lineTableTd" align="right">\r
				<span>\r
					<xsl:text></xsl:text>\r
					<xsl:value-of select="format-number(./cbc:LineExtensionAmount, '###.##0,00', 'european')" />\r
					<xsl:if test="./cbc:LineExtensionAmount/@currencyID">\r
						<xsl:text></xsl:text>\r
						<xsl:if test="./cbc:LineExtensionAmount/@currencyID = 'TRY' ">\r
							<xsl:text>TL</xsl:text>\r
						</xsl:if>\r
						<xsl:if test="./cbc:LineExtensionAmount/@currencyID != 'TRY' ">\r
							<xsl:value-of select="./cbc:LineExtensionAmount/@currencyID" />\r
						</xsl:if>\r
					</xsl:if>\r
				</span>\r
			</td>\r
		</tr>\r
	</xsl:template>\r
	<xsl:template match="//n1:Invoice">\r
		<tr id="lineTableTr">\r
			<td id="lineTableTd">\r
				<span>\r
					<xsl:text></xsl:text>\r
				</span>\r
			</td>\r
			<td id="lineTableTd">\r
				<span>\r
					<xsl:text></xsl:text>\r
				</span>\r
			</td>\r
			<td id="lineTableTd" align="right">\r
				<span>\r
					<xsl:text></xsl:text>\r
				</span>\r
			</td>\r
			<td id="lineTableTd" align="right">\r
				<span>\r
					<xsl:text></xsl:text>\r
				</span>\r
			</td>\r
			<td id="lineTableTd" align="right">\r
				<span>\r
					<xsl:text></xsl:text>\r
				</span>\r
			</td>\r
			<td id="lineTableTd" align="right">\r
				<span>\r
					<xsl:text></xsl:text>\r
				</span>\r
			</td>\r
			<td id="lineTableTd" align="right">\r
				<span>\r
					<xsl:text></xsl:text>\r
				</span>\r
			</td>\r
			<td id="lineTableTd" align="right">\r
				<span>\r
					<xsl:text></xsl:text>\r
				</span>\r
			</td>\r
			<td id="lineTableTd" align="right">\r
				<span>\r
					<xsl:text></xsl:text>\r
				</span>\r
			</td>\r
			<td id="lineTableTd" align="right">\r
				<span>\r
					<xsl:text></xsl:text>\r
				</span>\r
			</td>\r
			<td id="lineTableTd" align="right">\r
				<span>\r
					<xsl:text></xsl:text>\r
				</span>\r
			</td>\r
		</tr>\r
	</xsl:template>\r
	<xsl:template name="ShowEmployeesInTeam">\r
		<xsl:param name="lstInvoiceQ" />\r
		<xsl:if test="sum($lstInvoiceQ) !=0">\r
			<xsl:value-of select="sum($lstInvoiceQ)" />\r
			<xsl:text></xsl:text>\r
			<xsl:if test="$lstInvoiceQ[1]/@unitCode">\r
				<xsl:choose>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = '26'">\r
						<span>\r
							<xsl:text>Ton</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'BX'">\r
						<span>\r
							<xsl:text>Kutu</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'LTR'">\r
						<span>\r
							<xsl:text>LT</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'NIU'">\r
						<span>\r
							<xsl:text>Adet</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'C62'">\r
						<span>\r
							<xsl:text>Adet</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'KGM'">\r
						<span>\r
							<xsl:text>KG</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'KJO'">\r
						<span>\r
							<xsl:text>kJ</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'GRM'">\r
						<span>\r
							<xsl:text>G</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MGM'">\r
						<span>\r
							<xsl:text>MG</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'NT'">\r
						<span>\r
							<xsl:text>Net Ton</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'ANN'">\r
						<xsl:text> Yıl</xsl:text>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'GT'">\r
						<span>\r
							<xsl:text>GT</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MTR'">\r
						<span>\r
							<xsl:text>M</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MMT'">\r
						<span>\r
							<xsl:text>MM</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'KTM'">\r
						<span>\r
							<xsl:text>KM</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MLT'">\r
						<span>\r
							<xsl:text>ML</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MMQ'">\r
						<span>\r
							<xsl:text>MM3</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'CLT'">\r
						<span>\r
							<xsl:text>CL</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'CMK'">\r
						<span>\r
							<xsl:text>CM2</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'CMQ'">\r
						<span>\r
							<xsl:text>CM3</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'CMT'">\r
						<span>\r
							<xsl:text>CM</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MTK'">\r
						<span>\r
							<xsl:text>M2</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MTQ'">\r
						<span>\r
							<xsl:text>M3</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'DAY'">\r
						<span>\r
							<xsl:text> Gün</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'MON'">\r
						<span>\r
							<xsl:text> Ay</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'PA'">\r
						<span>\r
							<xsl:text> Paket</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'PR'">\r
						<span>\r
							<xsl:text> Çift</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'DMT'">\r
						<span>\r
							<xsl:text> Desi</xsl:text>\r
						</span>\r
					</xsl:when>\r
					<xsl:when test="$lstInvoiceQ[1]/@unitCode  = 'KWH'">\r
						<span>\r
							<xsl:text> KWH</xsl:text>\r
						</span>\r
					</xsl:when>\r
				</xsl:choose>\r
			</xsl:if>\r
			<xsl:if test="position() !=last()">\r
				<xsl:text> + </xsl:text>\r
			</xsl:if>\r
		</xsl:if>\r
	</xsl:template>\r
	<xsl:template name="dovizi_oku">\r
		<xsl:param name="doviz" />\r
		<xsl:variable name="okunacak" select="." />\r
		<xsl:variable name="noktadan_sonra" select="round(($okunacak - floor($okunacak)) * 100)" />\r
		<xsl:call-template name="sayi_oku">\r
			<xsl:with-param name="okunacak" select="." />\r
		</xsl:call-template>\r
		<xsl:if test="$doviz">\r
			<xsl:choose>\r
				<xsl:when test="$doviz =  'TRL' or $doviz =  'TRY'">\r
					<xsl:value-of select="' Türk Lirası'" />\r
					<xsl:if test="$noktadan_sonra &gt; 0">\r
						<xsl:value-of select="' '" />\r
						<xsl:call-template name="sayi_oku">\r
							<xsl:with-param name="okunacak" select="$noktadan_sonra" />\r
						</xsl:call-template>\r
						<xsl:value-of select="' Kuruş'" />\r
					</xsl:if>\r
				</xsl:when>\r
				<xsl:otherwise>\r
					<xsl:text></xsl:text>\r
					<xsl:value-of select="$doviz" />\r
					<xsl:if test="$noktadan_sonra &gt; 0">\r
						<xsl:value-of select="' '" />\r
						<xsl:call-template name="sayi_oku">\r
							<xsl:with-param name="okunacak" select="$noktadan_sonra" />\r
						</xsl:call-template>\r
						<xsl:value-of select="' Cent'" />\r
					</xsl:if>\r
				</xsl:otherwise>\r
			</xsl:choose>\r
		</xsl:if>\r
	</xsl:template>\r
	<xsl:template name="sayi_oku">\r
		<xsl:param name="okunacak" />\r
		<xsl:variable name="tam_sayi" select="floor($okunacak)" />\r
		<xsl:variable name="birler" select="floor($okunacak) mod 10" />\r
		<xsl:variable name="onlar" select="floor(floor($tam_sayi mod 100) div 10)" />\r
		<xsl:variable name="yuzler" select="floor(floor($tam_sayi mod 1000) div 100)" />\r
		<xsl:variable name="binler" select="floor(floor($tam_sayi mod 1000000) div 1000)" />\r
		<xsl:variable name="milyonlar" select="floor(floor($tam_sayi mod 1000000000) div 1000000)" />\r
		<xsl:variable name="milyarlar" select="floor(floor($tam_sayi mod 1000000000000) div 1000000000)" />\r
		<xsl:if test="$milyarlar &gt; 0">\r
			<xsl:call-template name="sayi_oku_3hane">\r
				<xsl:with-param name="sayi" select="$milyarlar" />\r
			</xsl:call-template> Milyar\r
		\r
		</xsl:if>\r
		<xsl:if test="$milyonlar &gt; 0">\r
			<xsl:call-template name="sayi_oku_3hane">\r
				<xsl:with-param name="sayi" select="$milyonlar" />\r
			</xsl:call-template> Milyon\r
		\r
		</xsl:if>\r
		<xsl:if test="$binler &gt; 0">\r
			<xsl:if test="$binler = 1">Bin </xsl:if>\r
			<xsl:if test="$binler &gt; 1">\r
				<xsl:call-template name="sayi_oku_3hane">\r
					<xsl:with-param name="sayi" select="$binler" />\r
				</xsl:call-template> Bin\r
			\r
			</xsl:if>\r
		</xsl:if>\r
		<xsl:call-template name="yuzler_oku">\r
			<xsl:with-param name="sayi" select="$yuzler" />\r
		</xsl:call-template>\r
		<xsl:call-template name="onlar_oku">\r
			<xsl:with-param name="sayi" select="$onlar" />\r
		</xsl:call-template>\r
		<xsl:call-template name="birler_oku">\r
			<xsl:with-param name="sayi" select="$birler" />\r
		</xsl:call-template>\r
	</xsl:template>\r
	<xsl:template name="sayi_oku_3hane">\r
		<xsl:param name="sayi" />\r
		<xsl:variable name="tam_sayi" select="floor($sayi)" />\r
		<xsl:variable name="birler" select="floor($sayi) mod 10" />\r
		<xsl:variable name="onlar" select="floor(floor($tam_sayi mod 100) div 10)" />\r
		<xsl:variable name="yuzler" select="floor(floor($tam_sayi mod 1000) div 100)" />\r
		<xsl:call-template name="yuzler_oku">\r
			<xsl:with-param name="sayi" select="$yuzler" />\r
		</xsl:call-template>\r
		<xsl:call-template name="onlar_oku">\r
			<xsl:with-param name="sayi" select="$onlar" />\r
		</xsl:call-template>\r
		<xsl:call-template name="birler_oku">\r
			<xsl:with-param name="sayi" select="$birler" />\r
		</xsl:call-template>\r
	</xsl:template>\r
	<xsl:template name="birler_oku">\r
		<xsl:param name="sayi" />\r
		<xsl:choose>\r
			<xsl:when test="$sayi =  1">Bir </xsl:when>\r
			<xsl:when test="$sayi =  2">İki </xsl:when>\r
			<xsl:when test="$sayi =  3">Üç </xsl:when>\r
			<xsl:when test="$sayi =  4">Dört </xsl:when>\r
			<xsl:when test="$sayi =  5">Beş </xsl:when>\r
			<xsl:when test="$sayi =  6">Altı </xsl:when>\r
			<xsl:when test="$sayi =  7">Yedi </xsl:when>\r
			<xsl:when test="$sayi =  8">Sekiz </xsl:when>\r
			<xsl:when test="$sayi =  9">Dokuz </xsl:when>\r
			<xsl:otherwise></xsl:otherwise>\r
		</xsl:choose>\r
	</xsl:template>\r
	<xsl:template name="onlar_oku">\r
		<xsl:param name="sayi" />\r
		<xsl:choose>\r
			<xsl:when test="$sayi =  1">On </xsl:when>\r
			<xsl:when test="$sayi =  2">Yirmi </xsl:when>\r
			<xsl:when test="$sayi =  3">Otuz </xsl:when>\r
			<xsl:when test="$sayi =  4">Kırk </xsl:when>\r
			<xsl:when test="$sayi =  5">Elli </xsl:when>\r
			<xsl:when test="$sayi =  6">Altmış </xsl:when>\r
			<xsl:when test="$sayi =  7">Yetmiş </xsl:when>\r
			<xsl:when test="$sayi =  8">Seksen </xsl:when>\r
			<xsl:when test="$sayi =  9">Doksan </xsl:when>\r
			<xsl:otherwise />\r
		</xsl:choose>\r
	</xsl:template>\r
	<xsl:template name="yuzler_oku">\r
		<xsl:param name="sayi" />\r
		<xsl:choose>\r
			<xsl:when test="$sayi =  1">Yüz </xsl:when>\r
			<xsl:when test="$sayi =  2">İki Yüz </xsl:when>\r
			<xsl:when test="$sayi =  3">Üç Yüz </xsl:when>\r
			<xsl:when test="$sayi =  4">Dört Yüz </xsl:when>\r
			<xsl:when test="$sayi =  5">Beş Yüz </xsl:when>\r
			<xsl:when test="$sayi =  6">Altı Yüz </xsl:when>\r
			<xsl:when test="$sayi =  7">Yedi Yüz </xsl:when>\r
			<xsl:when test="$sayi =  8">Sekiz Yüz </xsl:when>\r
			<xsl:when test="$sayi =  9">Dokuz Yüz </xsl:when>\r
			<xsl:otherwise />\r
		</xsl:choose>\r
	</xsl:template>\r
	<xsl:template name="binler_oku">\r
		<xsl:param name="sayi" />\r
		<xsl:choose>\r
			<xsl:when test="$sayi =  1">Bin </xsl:when>\r
			<xsl:when test="$sayi =  2">İki Bin </xsl:when>\r
			<xsl:when test="$sayi =  3">Üç Bin </xsl:when>\r
			<xsl:when test="$sayi =  4">Dört Bin </xsl:when>\r
			<xsl:when test="$sayi =  5">Beş Bin </xsl:when>\r
			<xsl:when test="$sayi =  6">Altı Bin </xsl:when>\r
			<xsl:when test="$sayi =  7">Yedi Bin </xsl:when>\r
			<xsl:when test="$sayi =  8">Sekiz Bin </xsl:when>\r
			<xsl:when test="$sayi =  9">Dokuz Bin </xsl:when>\r
			<xsl:otherwise />\r
		</xsl:choose>\r
	</xsl:template>\r
	<xsl:template name="onbinler_oku">\r
		<xsl:param name="sayi" />\r
		<xsl:if test="$sayi &gt; 0">\r
			<xsl:call-template name="onlar_oku">\r
				<xsl:with-param name="sayi" select="$sayi" />\r
			</xsl:call-template>Bin\r
			\r
		\r
		</xsl:if>\r
	</xsl:template>\r
	<xsl:template name="parcala">\r
		<xsl:param name="csv" />\r
		<xsl:param name="isaret" />\r
		<xsl:variable name="first-item" select="normalize-space(substring-before( concat( $csv, '|'), '|'))" />\r
		<xsl:if test="$csv">\r
			<xsl:if test="normalize-space(substring-after(concat($first-item, ''), $isaret))">\r
				<xsl:value-of disable-output-escaping="yes" select="normalize-space(substring-after(concat($first-item, ''), $isaret))" />\r
			</xsl:if>\r
			<xsl:call-template name="parcala">\r
				<xsl:with-param name="csv" select="substring-after($csv,'|')" />\r
				<xsl:with-param name="isaret" select="$isaret" />\r
			</xsl:call-template>\r
		</xsl:if>\r
	</xsl:template>\r
<xsl:variable name="QRSOVOS">\r
<xsl:text>https://qr.sovostr.com/qr?data=</xsl:text>\r
		<xsl:text>{"vkntckn":"</xsl:text>		\r
		<xsl:value-of select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']"/>\r
		<xsl:text>",</xsl:text>\r
		<xsl:text>"avkntckn":"</xsl:text>\r
		<xsl:value-of select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']"/>\r
		<xsl:text>",</xsl:text>\r
		<xsl:text>"senaryo":"</xsl:text>\r
		<xsl:value-of select="//n1:Invoice/cbc:ProfileID"/>\r
		<xsl:text>",</xsl:text>\r
		<xsl:text>"tip":"</xsl:text>\r
		<xsl:value-of select="//n1:Invoice/cbc:InvoiceTypeCode"/>\r
		<xsl:text>",</xsl:text>\r
		<xsl:text>"tarih":"</xsl:text>\r
		<xsl:value-of select="//n1:Invoice/cbc:IssueDate"/>\r
		<xsl:text>",</xsl:text>\r
		<xsl:text>"no":"</xsl:text>\r
		<xsl:value-of select="//n1:Invoice/cbc:ID"/>\r
		<xsl:text>",</xsl:text>\r
		<xsl:text>"ettn":"</xsl:text>\r
		<xsl:value-of select="//n1:Invoice/cbc:UUID"/>\r
		<xsl:text>",</xsl:text>\r
		<xsl:text>"parabirimi":"</xsl:text>\r
		<xsl:value-of select="//n1:Invoice/cbc:DocumentCurrencyCode"/>\r
		<xsl:text>",</xsl:text>\r
		<xsl:text>"malhizmettoplam":"</xsl:text>\r
		<xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount"/>\r
		<xsl:text>",</xsl:text>\r
		<xsl:for-each select="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015']">\r
			<xsl:text>"kdvmatrah(</xsl:text>\r
			<xsl:value-of select="format-number(cbc:Percent,'#','european')"/>\r
			<xsl:text>)":"</xsl:text>\r
			<xsl:value-of select="format-number(cbc:TaxableAmount, '###.##0,00', 'european')"/>\r
			<xsl:text>",</xsl:text>\r
			<xsl:text>"hesaplanankdv(</xsl:text>\r
			<xsl:value-of select="format-number(cbc:Percent,'#','european')"/>\r
			<xsl:text>)":"</xsl:text>\r
			<xsl:value-of select="format-number(cbc:TaxAmount, '###.##0,00', 'european')"/>\r
			<xsl:text>",</xsl:text>\r
		</xsl:for-each>\r
		<xsl:text>"vergidahil":"</xsl:text>\r
		<xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount, '###.##0,00', 'european')"/>\r
		<xsl:text>",</xsl:text>\r
		<xsl:text>"odenecek":"</xsl:text>\r
		<xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount, '###.##0,00', 'european')"/>\r
		<xsl:text>"}</xsl:text>\r
</xsl:variable>\r
</xsl:stylesheet>\r
		`,jt=`\uFEFF<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ccts="urn:un:unece:uncefact:documentation:2" xmlns:clm54217="urn:un:unece:uncefact:codelist:specification:54217:2001" xmlns:clm5639="urn:un:unece:uncefact:codelist:specification:5639:1988" xmlns:clm66411="urn:un:unece:uncefact:codelist:specification:66411:2001" xmlns:clmIANAMIMEMediaType="urn:un:unece:uncefact:codelist:specification:IANAMIMEMediaType:2003" xmlns:fn="http://www.w3.org/2005/xpath-functions" xmlns:link="http://www.xbrl.org/2003/linkbase" xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2" xmlns:udt="urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2" xmlns:xbrldi="http://xbrl.org/2006/xbrldi" xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:xdt="http://www.w3.org/2005/xpath-datatypes" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" exclude-result-prefixes="cac cbc ccts clm54217 clm5639 clm66411 clmIANAMIMEMediaType fn link n1 qdt udt xbrldi xbrli xdt xlink xs xsd xsi">
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
</xsl:stylesheet>`;function dt(d){return d.charCodeAt(0)===65279?d.slice(1):d}const zt=dt(Qt),Vt=dt(jt),Kt=[{id:"antrepo-fatura",label:"Antrepo e-Fatura",description:"Profesyonel e-Fatura tasarımı — UBL-TR standart görünüm (tedarikçi/müşteri kartları, ürün tablosu, KDV, toplam). 119 KB.",moduleId:"fatura",docName:"Antrepo e-Fatura",xslt:zt},{id:"antrepo-arsiv",label:"Antrepo e-Arşiv",description:"Profesyonel e-Arşiv tasarımı — UBL-TR standart görünüm (tedarikçi/müşteri kartları, ürün tablosu, KDV, toplam). 127 KB.",moduleId:"arsiv",docName:"Antrepo e-Arşiv",xslt:Vt}],qt=d=>Kt.find(p=>p.id===d),Yt=new Set(["div","span","p","table","tr","td","th","h1","h2","h3","h4","h5","h6","img","a"]);function Wt(d,p,m){const y=performance.now();let a=p;a.charCodeAt(0)===65279&&(a=a.slice(1));let T=d;if(T.charCodeAt(0)===65279&&(T=T.slice(1)),!a.trim()||!T.trim())return{html:"",error:"XSLT veya XML boş",durationMs:0};try{const c=new DOMParser,u=c.parseFromString(a,"application/xml"),i=c.parseFromString(T,"application/xml"),f=u.querySelector("parsererror");if(f)return{html:"",error:`XSLT parse hatası: ${f.textContent?.trim().slice(0,200)||"bilinmiyor"}`,durationMs:performance.now()-y};const b=i.querySelector("parsererror");if(b)return{html:"",error:`XML parse hatası: ${b.textContent?.trim().slice(0,200)||"bilinmiyor"}`,durationMs:performance.now()-y};const B=new XSLTProcessor;B.importStylesheet(u);const k=B.transformToDocument(i),P=k.body||k.documentElement;if(P){let v=0;const H=Y=>{if(Y.nodeType!==1)return;const L=Y,Z=L.tagName.toLowerCase();if(Yt.has(Z)){L.setAttribute("data-render-index",String(v));const R=m[v];R&&L.setAttribute("data-xpath",R),v++}for(const R of Array.from(L.childNodes))H(R)};H(P)}let A=new XMLSerializer().serializeToString(k);return!A.includes("<html")&&!A.includes("<HTML")?A=`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${A}</body></html>`:/charset/i.test(A)||(A=A.replace(/<head([^>]*)>/i,'<head$1><meta charset="utf-8">')),{html:A,error:null,durationMs:performance.now()-y}}catch(c){return{html:"",error:`Render hatası: ${c.message||"bilinmeyen"}`,durationMs:performance.now()-y}}}function Ft(d){const p=[];try{const y=new DOMParser().parseFromString(d,"application/xml"),a=T=>{if(T.nodeType!==1)return;const c=T,u=c.localName;if(u==="value-of"||u==="copy-of"){const i=c.getAttribute("select");i&&p.push(i)}for(const i of Array.from(c.childNodes))a(i)};a(y.documentElement)}catch(m){console.warn("[xsltRender] parseXsltXPathBindings error:",m)}return p}const q=[{id:"template-root",category:"Yapı",label:"xsl:template (root)",description:"Kök template — tüm XML'i kapsayan ana şablon.",template:`<xsl:template match="/\${1:Invoice}">
  <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        \${2:body { font-family: Tahoma; font-size: 11px; }}
      </style>
    </head>
    <body>
      \${0:<!-- İçerik -->}
    </body>
  </html>
</xsl:template>`,preview:'<xsl:template match="/Invoice">'},{id:"template-with-param",category:"Yapı",label:"xsl:template + param",description:"Parametre alan şablon — xsl:call-template ile çağrılır.",template:'<xsl:template name="${1:sablon_adi}">\n  <xsl:param name="${2:degisken}">${3:varsayilan}</xsl:param>\n  ${0:<!-- İçerik -->}\n</xsl:template>',preview:'<xsl:template name="...">'},{id:"for-each",category:"Döngü",label:"xsl:for-each",description:"Seçili node'lar üzerinde döngü.",template:'<xsl:for-each select="${1:cbc:ID}">\n  ${0:<!-- Döngü içeriği -->}\n</xsl:for-each>',preview:'<xsl:for-each select="...">'},{id:"for-each-sort",category:"Döngü",label:"for-each + sort",description:"Sıralı döngü (alfabetik/numerik).",template:'<xsl:for-each select="${1:cac:InvoiceLine}">\n  <xsl:sort select="${2:cbc:ID}" data-type="${3:number}"/>\n  ${0:<!-- Sıralı içerik -->}\n</xsl:for-each>',preview:"<xsl:for-each><xsl:sort>"},{id:"choose-when",category:"Koşul",label:"choose / when / otherwise",description:"Çoklu koşul — ilk doğru when çalışır, yoksa otherwise.",template:`<xsl:choose>
  <xsl:when test="\${1:condition}">
    \${2:<!-- doğruysa -->}
  </xsl:when>
  <xsl:otherwise>
    \${3:<!-- yanlışsa -->}
  </xsl:otherwise>
</xsl:choose>`,preview:"<xsl:choose>"},{id:"if",category:"Koşul",label:"xsl:if",description:"Basit koşul — sadece doğruysa çalışır.",template:'<xsl:if test="${1:condition}">\n  ${0:<!-- doğruysa -->}\n</xsl:if>',preview:'<xsl:if test="...">'},{id:"format-number-tr",category:"Format",label:"Para formatı (TR)",description:"Türk Lirası: 1.234,56 (binlik nokta, ondalık virgül).",template:`<xsl:value-of select="format-number(\${1:.}, '#,##0.00', 'tr_TR')"/>`,preview:"format-number(. , tr_TR)"},{id:"format-date",category:"Format",label:"Tarih formatı",description:"UBL-TR tarihini GG.AA.YYYY formatına çevir.",template:`<xsl:value-of select="concat(
  substring(\${1:cbc:IssueDate}, 9, 2), '.',
  substring(\${1:cbc:IssueDate}, 6, 2), '.',
  substring(\${1:cbc:IssueDate}, 1, 4)
)"/>`,preview:"concat(substring(...))"},{id:"sum-tax",category:"Hesaplama",label:"KDV toplamı",description:"Tüm satırların KDV toplamını hesapla.",template:`<xsl:value-of select="format-number(
  sum(//cac:TaxTotal/cbc:TaxAmount),
  '#,##0.00', 'tr_TR'
)"/>`,preview:"sum(TaxTotal/TaxAmount)"},{id:"line-extension",category:"Hesaplama",label:"Satır toplamı",description:"InvoiceLine.LineExtensionAmount toplamı (KDV hariç tutar).",template:`<xsl:value-of select="format-number(
  sum(//cac:InvoiceLine/cbc:LineExtensionAmount),
  '#,##0.00', 'tr_TR'
)"/>`,preview:"sum(LineExtensionAmount)"},{id:"table-header-row",category:"Tablo",label:"Tablo başlık (th)",description:"Standart fatura tablo başlığı: sıra, ürün, miktar, fiyat, KDV, tutar.",template:`<tr style="background:#f1f5f9; font-weight:bold;">
  <th style="padding:6px; text-align:left;">\${1:Sıra}</th>
  <th style="padding:6px; text-align:left;">\${2:Ürün/Hizmet}</th>
  <th style="padding:6px; text-align:right;">\${3:Miktar}</th>
  <th style="padding:6px; text-align:right;">\${4:Birim Fiyat}</th>
  <th style="padding:6px; text-align:right;">\${5:KDV %}</th>
  <th style="padding:6px; text-align:right;">\${6:Tutar}</th>
</tr>`,preview:"<tr><th>...</th></tr>"},{id:"table-data-row",category:"Tablo",label:"Tablo satır (td)",description:"InvoiceLine'dan tek satır — xsl:for-each içinde kullanılır.",template:`<tr>
  <td style="padding:6px;"><xsl:value-of select="position()"/></td>
  <td style="padding:6px;"><xsl:value-of select="cac:Item/cbc:Name"/></td>
  <td style="padding:6px; text-align:right;"><xsl:value-of select="cbc:InvoicedQuantity"/></td>
  <td style="padding:6px; text-align:right;"><xsl:value-of select="format-number(cac:Price/cbc:PriceAmount, '#,##0.00', 'tr_TR')"/></td>
  <td style="padding:6px; text-align:right;">\${1:%18}</td>
  <td style="padding:6px; text-align:right;"><xsl:value-of select="format-number(cbc:LineExtensionAmount, '#,##0.00', 'tr_TR')"/></td>
</tr>`,preview:'<tr><xsl:value-of select="...">'}],Gt=["Yapı","Döngü","Koşul","Format","Hesaplama","Tablo"],Ut=d=>d==="all"?q:q.filter(p=>p.category===d),Ot=()=>{const d={Yapı:0,Döngü:0,Koşul:0,Format:0,Hesaplama:0,Tablo:0};for(const p of q)d[p.category]++;return d},et=[{name:"stylesheet",fullName:"xsl:stylesheet",description:"XSLT ana kök elementi. version ve xmlns:xsl zorunlu.",commonAttrs:["version","xmlns:xsl","xmlns:cac","xmlns:cbc","exclude-result-prefixes"],empty:!1},{name:"template",fullName:"xsl:template",description:"Bir pattern eşleştiğinde çalışan şablon.",commonAttrs:["match","name","mode","priority"],empty:!1},{name:"apply-templates",fullName:"xsl:apply-templates",description:"Seçili node'lara eşleşen template'i uygula.",commonAttrs:["select","mode"],empty:!0},{name:"call-template",fullName:"xsl:call-template",description:"İsimle belirtilmiş template'i çağır.",commonAttrs:["name"],empty:!1},{name:"param",fullName:"xsl:param",description:"Template parametresi.",commonAttrs:["name","select"],empty:!1},{name:"with-param",fullName:"xsl:with-param",description:"call-template veya apply-templates'e parametre geç.",commonAttrs:["name","select"],empty:!1},{name:"variable",fullName:"xsl:variable",description:"Yerel değişken tanımla.",commonAttrs:["name","select"],empty:!1},{name:"for-each",fullName:"xsl:for-each",description:"Seçili node'lar üzerinde döngü.",commonAttrs:["select"],empty:!1},{name:"sort",fullName:"xsl:sort",description:"for-each içinde sıralama.",commonAttrs:["select","data-type","order","case-order"],empty:!0},{name:"if",fullName:"xsl:if",description:"Basit koşul — sadece doğruysa çalışır.",commonAttrs:["test"],empty:!1},{name:"choose",fullName:"xsl:choose",description:"Çoklu koşul bloğu aç.",commonAttrs:[],empty:!1},{name:"when",fullName:"xsl:when",description:"Koşul — choose içinde. İlk doğru olan çalışır.",commonAttrs:["test"],empty:!1},{name:"otherwise",fullName:"xsl:otherwise",description:"Tüm when'ler yanlışsa çalışır — choose sonunda.",commonAttrs:[],empty:!1},{name:"value-of",fullName:"xsl:value-of",description:"XPath ifadesinin değerini yaz.",commonAttrs:["select","disable-output-escaping"],empty:!0},{name:"copy-of",fullName:"xsl:copy-of",description:"Node'un derin kopyasını yapıştır.",commonAttrs:["select"],empty:!0},{name:"element",fullName:"xsl:element",description:"Dinamik isimle element oluştur.",commonAttrs:["name","namespace"],empty:!1},{name:"attribute",fullName:"xsl:attribute",description:"Dinamik isimle attribute ekle.",commonAttrs:["name","namespace"],empty:!1},{name:"text",fullName:"xsl:text",description:"Ham metin çıktısı (whitespace korunur).",commonAttrs:["disable-output-escaping"],empty:!1},{name:"comment",fullName:"xsl:comment",description:"HTML/XML yorumu oluştur.",commonAttrs:[],empty:!1},{name:"output",fullName:"xsl:output",description:"Çıktı formatı (method, encoding, doctype).",commonAttrs:["method","version","encoding","doctype-public","indent"],empty:!0},{name:"import",fullName:"xsl:import",description:"Başka bir XSLT stilini içe aktar (stylesheet altında, en başta).",commonAttrs:["href"],empty:!0},{name:"include",fullName:"xsl:include",description:"XSLT stilini dahil et (import'tan sonra).",commonAttrs:["href"],empty:!0},{name:"strip-space",fullName:"xsl:strip-space",description:"Boşlukları koruma — belirtilen element'lerden.",commonAttrs:["elements"],empty:!0},{name:"preserve-space",fullName:"xsl:preserve-space",description:"Boşlukları koru — belirtilen element'lerde.",commonAttrs:["elements"],empty:!0},{name:"number",fullName:"xsl:number",description:"Sayaç veya liste numarası oluştur.",commonAttrs:["value","format","level","count","from"],empty:!0},{name:"key",fullName:"xsl:key",description:"Anahtar tanımla — key() fonksiyonu için.",commonAttrs:["name","match","use"],empty:!0},{name:"message",fullName:"xsl:message",description:"Test/debug mesajı.",commonAttrs:["terminate"],empty:!1},{name:"fallback",fullName:"xsl:fallback",description:"XSLT 2.0/3.0 yoksa çalışacak fallback.",commonAttrs:[],empty:!1}],Zt=[{xpath:"cbc:ID",description:"Belge numarası (örn: fatura ID)"},{xpath:"cbc:IssueDate",description:"Düzenleme tarihi (YYYY-MM-DD)"},{xpath:"cbc:IssueTime",description:"Düzenleme saati (HH:MM:SS)"},{xpath:"cbc:InvoiceTypeCode",description:"Fatura tipi (SATIS/IADE)"},{xpath:"cbc:DocumentCurrencyCode",description:"Para birimi (TRY/USD/EUR)"},{xpath:"cbc:TaxAmount",description:"KDV tutarı"},{xpath:"cbc:LineExtensionAmount",description:"Satır toplamı (KDV hariç)"},{xpath:"cbc:TaxExclusiveAmount",description:"Vergi hariç toplam"},{xpath:"cbc:TaxInclusiveAmount",description:"Vergi dahil toplam"},{xpath:"cbc:PayableAmount",description:"Ödenecek tutar"},{xpath:"cbc:UUID",description:"ETTN (UUID)"},{xpath:"cbc:Note",description:"Not (fatura başlığı, banka bilgisi)"},{xpath:"cbc:Name",description:"İsim (Party Name, Item Name)"},{xpath:"cbc:StreetName",description:"Sokak adresi"},{xpath:"cbc:CityName",description:"Şehir"},{xpath:"cac:AccountingSupplierParty",description:"Tedarikçi tarafı (satıcı)"},{xpath:"cac:AccountingCustomerParty",description:"Müşteri tarafı (alıcı)"},{xpath:"cac:Party",description:"Taraf (tedarikçi/müşteri detayı)"},{xpath:"cac:PartyName",description:"Taraf adı"},{xpath:"cac:PartyIdentification",description:"Taraf kimlik (VKN/TCKN)"},{xpath:"cac:PartyTaxScheme",description:"Vergi şeması"},{xpath:"cac:PostalAddress",description:"Posta adresi"},{xpath:"cac:TaxScheme",description:"Vergi şeması"},{xpath:"cac:TaxTotal",description:"Toplam vergi"},{xpath:"cac:LegalMonetaryTotal",description:"Yasal parasal toplam"},{xpath:"cac:InvoiceLine",description:"Fatura satırı (ürün/hizmet)"},{xpath:"cac:Item",description:"Ürün/hizmet"},{xpath:"cac:Price",description:"Fiyat"},{xpath:"cac:TaxSubtotal",description:"Vergi alt toplamı"},{xpath:"cac:TaxCategory",description:"Vergi kategorisi"}];function Jt(d){const p=[],m=d.split(`
`);m.forEach((a,T)=>{const c=T+1;if(a.match(/disable-output-escaping\s*=\s*["']yes["']/i)){const f=a.indexOf("disable-output-escaping")+1;p.push({lineNumber:c,column:f,endLineNumber:c,endColumn:f+25,message:'disable-output-escaping="yes" modern tarayıcılarda yok sayılır (deprecated). Kullanmaktan kaçın.',severity:"warning"})}if(/<xsl:import\b/.test(a)){const f=a.indexOf("<xsl:import")+1;p.push({lineNumber:c,column:f,endLineNumber:c,endColumn:f+11,message:"xsl:import yerine xsl:include kullan (aynı precedence, daha okunaklı).",severity:"info"})}const i=a.match(/format-number\(([^)]*)\)/);if(i&&i[1]&&i[1].split(",").length<2){const b=a.indexOf("format-number")+1;p.push({lineNumber:c,column:b,endLineNumber:c,endColumn:b+13,message:"format-number 2 veya 3 argüman almalı (value, pattern [, decimal-format-name]).",severity:"warning"})}});const y=[];return m.forEach((a,T)=>{const c=T+1;let u=0;for(;u<a.length;){const i=a.indexOf("<",u);if(i===-1)break;const f=a.indexOf(">",i);if(f===-1)break;const b=a.substring(i+1,f).trim();if(b.startsWith("!--")){u=f+1;continue}const B=b.endsWith("/"),P=b.replace(/\/$/,"").split(/\s+/)[0],N=P.startsWith("xsl:");if(!B&&N)if(!P.startsWith("/"))y.push({name:P,line:c,col:i+1});else{const A=P.substring(1),v=y[y.length-1];v&&v.name===A?y.pop():p.push({lineNumber:c,column:i+1,endLineNumber:c,endColumn:f+1,message:`Beklenmeyen kapanış tag'i: </${A}>. Açılış: <${v?.name||"yok"}>.`,severity:"warning"})}u=f+1}}),y.forEach(a=>{p.push({lineNumber:a.line,column:a.col,endLineNumber:a.line,endColumn:a.col+a.name.length+1,message:`Açılış tag'i kapatılmamış: <${a.name}>.`,severity:"error"})}),p}const nt=[{id:"fatura",label:"e-Fatura",inlineKey:"gib/v2/e-Fatura-Sablon.xslt"},{id:"arsiv",label:"e-Arşiv",inlineKey:"gib/v2/e-Arsiv-Sablon.xslt"},{id:"irsaliye",label:"e-İrsaliye",inlineKey:"community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt"},{id:"ihracat",label:"e-İhracat",inlineKey:"community/IRPTeam-eFatura.xslt"},{id:"mikro_ihracat",label:"e-Mikro İhracat",inlineKey:"community/IRPTeam-eFatura.xslt"},{id:"smm",label:"e-SMM",inlineKey:"community/hzkucuk-eFatura-smm.xslt"},{id:"mustahsil",label:"e-Müstahsil",inlineKey:"community/hzkucuk-eFatura-mustahsil.xslt"},{id:"bilet",label:"e-Bilet",inlineKey:"community/hzkucuk-eFatura-bilet.xslt"},{id:"makbuz",label:"e-Makbuz",inlineKey:"community/hzkucuk-eFatura-makbuz.xslt"},{id:"antrepo-fatura",label:"Antrepo e-Fatura",antrepoId:"antrepo-fatura",isAntrepo:!0},{id:"antrepo-arsiv",label:"Antrepo e-Arşiv",antrepoId:"antrepo-arsiv",isAntrepo:!0}],$t=`<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:ID>FTR-2026-00001</cbc:ID>
  <cbc:IssueDate>2026-09-28</cbc:IssueDate>
  <cbc:IssueTime>10:00:00</cbc:IssueTime>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>ÖRNEK TEDARİKÇİ A.Ş.</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Atatürk Cad. No:1</cbc:StreetName>
        <cbc:CityName>İstanbul</cbc:CityName>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>ÖRNEK MÜŞTERİ LTD.</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Cumhuriyet Cad. No:5</cbc:StreetName>
        <cbc:CityName>Ankara</cbc:CityName>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal><cbc:TaxAmount currencyID="TRY">180.00</cbc:TaxAmount></cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="TRY">1000.00</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="TRY">1000.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="TRY">1180.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="TRY">1180.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">10</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">500.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Name>Örnek Ürün A</cbc:Name></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">50.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
  <cac:InvoiceLine>
    <cbc:ID>2</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">10</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">500.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Name>Örnek Ürün B</cbc:Name></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">50.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`,se=({initialModuleId:d="fatura",initialXslt:p,docName:m="XSLT Tasarım",onBack:y})=>{const[a,T]=s.useState(d),[c,u]=s.useState(""),[i,f]=s.useState($t),[b,B]=s.useState("xslt"),[k,P]=s.useState(""),[N,A]=s.useState(null),[v,H]=s.useState(.6),[Y,L]=s.useState(800),[Z,R]=s.useState(0),[pt,lt]=s.useState(!1),[W,J]=s.useState(!1),[w,Q]=s.useState("idle"),[rt,j]=s.useState(""),$=s.useRef(null),F=s.useRef(null),G=s.useRef(null),z=s.useRef(null),[S,at]=s.useState("all"),[U,bt]=s.useState(""),[M,st]=s.useState(!0),[V,ut]=s.useState(null),[O,ft]=s.useState([]),I=s.useMemo(()=>nt.find(t=>t.id===a)||nt[0],[a]);s.useEffect(()=>{if(p&&a===d){u(p);return}if(I.antrepoId){const n=qt(I.antrepoId);if(n){u(n.xslt),console.log(`[XSLTEditor] Module switch → ${I.id} loaded Antrepo ${n.xslt.length} chars`);return}console.warn(`[XSLTEditor] Antrepo template bulunamadı: ${I.antrepoId}`),u("<!-- Antrepo template bulunamadı -->");return}const t=It(I.inlineKey||"");t?(u(t),console.log(`[XSLTEditor] Module switch → ${I.id} loaded ${t.length} chars from ${I.inlineKey}`)):(console.warn(`[XSLTEditor] Inline XSLT yok: ${I.inlineKey}`),u("<!-- Bu modül için inline XSLT bulunamadı -->"))},[a,I.antrepoId,I.inlineKey,p,d]);const _=s.useCallback(()=>{lt(!0);const t=performance.now();try{let n=c;n.charCodeAt(0)===65279&&(n=n.slice(1));let l=i;l.charCodeAt(0)===65279&&(l=l.slice(1));const r=Wt(l,n,O);P(r.html),A(r.error),R(r.durationMs)}catch(n){A(n.message||"Bilinmeyen render hatası"),P(""),R(performance.now()-t)}finally{lt(!1)}},[c,i,O]);s.useEffect(()=>(z.current&&clearTimeout(z.current),z.current=setTimeout(_,500),()=>{z.current&&clearTimeout(z.current)}),[_]),s.useEffect(()=>{_()},[]);const ht=s.useCallback(async()=>{Q("saving"),j("Kaydediliyor...");try{const t=window.prompt?.("Tasarım adı:",m)??m;if(!t||!t.trim()){Q("idle"),j("İptal edildi");return}const n=await vt.saveDesign({name:t.trim(),module_id:a,xslt_content:c,custom_content:void 0,theme_color:"#1e3a8a",sections:{},status:"draft"});Q("saved"),j(`✅ Kaydedildi (#${n.design.id}) — "${n.design.name}"`),console.log("[XSLTEditor] Saved:",n.design)}catch(t){Q("error"),j(`⚠ Kayıt hatası: ${t.message}`)}},[m,a,c]),gt=s.useCallback(()=>{const t=`${m.replace(/\s+/g,"_")}_${a}.xslt`,n=new Blob([c],{type:"application/xml;charset=utf-8"}),l=URL.createObjectURL(n),r=document.createElement("a");r.href=l,r.download=t,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(l),Q("idle"),j(`📥 İndirildi: ${t} · ${(c.length/1024).toFixed(1)} kB`)},[c,a,m]);s.useEffect(()=>{if(!W)return;const t=n=>{n.target.closest("[data-module-menu]")||J(!1)};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[W]);const mt=s.useMemo(()=>Ot(),[]),ct=s.useMemo(()=>{const t=Ut(S);if(!U.trim())return t;const n=U.toLowerCase();return t.filter(l=>l.label.toLowerCase().includes(n)||l.description.toLowerCase().includes(n)||l.category.toLowerCase().includes(n))},[S,U]),yt=s.useCallback(t=>{const n=F.current,l=G.current;if(!n){console.warn("[XSLTEditor] Editor ref yok, snippet eklenemedi:",t.id);return}const r=n.getSelection();if(!r)return;const h={range:r,text:t.template,forceInsertMarkers:!0};n.executeEdits("snippet",[h]),n.focus();const o=n.getPosition();if(o&&l){n.revealPositionInCenter(o);const x=n.deltaDecorations([],[{range:new l.Range(o.lineNumber,o.column,o.lineNumber,o.column+Math.max(1,t.template.length)),options:{inlineClassName:"xslt-click-highlight"}}]);setTimeout(()=>{n.deltaDecorations(x,[])},2e3),console.log(`[XSLTEditor] Snippet highlight: ${t.id} → ${o.lineNumber}:${o.column} (${t.template.length} chars)`)}console.log(`[XSLTEditor] Snippet eklendi: ${t.id} (${t.template.length} chars)`)},[]);s.useEffect(()=>{if(b!=="xslt")return;const t=G.current;if(!t)return;const n=setTimeout(()=>{const l=F.current;if(!l)return;const r=l.getModel();if(!r)return;const o=Jt(c).map(x=>({severity:x.severity==="error"?t.MarkerSeverity.Error:x.severity==="warning"?t.MarkerSeverity.Warning:t.MarkerSeverity.Info,message:x.message,startLineNumber:x.lineNumber,startColumn:x.column,endLineNumber:x.endLineNumber,endColumn:x.endColumn}));t.editor.setModelMarkers(r,"xslt-lint",o)},800);return()=>clearTimeout(n)},[c,b]);const Tt=s.useCallback((t,n)=>{F.current=t,G.current=n,console.log("[XSLTEditor] Monaco editor mount edildi, XSLT provider kayıt ediliyor"),n.languages.registerCompletionItemProvider("xml",{triggerCharacters:["<"," ","="],provideCompletionItems:(l,r)=>{const o=l.getLineContent(r.lineNumber).substring(0,r.column-1),x=l.getWordUntilPosition(r),D={startLineNumber:r.lineNumber,endLineNumber:r.lineNumber,startColumn:x.startColumn,endColumn:x.endColumn};if(o.match(/<\s*xsl:$/))return{suggestions:et.map(g=>({label:g.fullName,kind:n.languages.CompletionItemKind.Function,insertText:g.empty?`${g.name} $1/>$0`:`${g.name} $1>$0</${g.fullName}>`,insertTextRules:n.languages.CompletionItemInsertTextRule.InsertAsSnippet,documentation:{value:`**${g.fullName}**

${g.description}

Common attrs: ${g.commonAttrs.join(", ")||"yok"}`,isTrusted:!0},detail:g.fullName,range:D}))};if(o.endsWith("<")||o.match(/<\s*$/))return{suggestions:[...et.map(C=>({label:C.fullName,kind:n.languages.CompletionItemKind.Function,insertText:C.empty?`${C.name} $1/>$0`:`${C.name} $1>$0</${C.fullName}>`,insertTextRules:n.languages.CompletionItemInsertTextRule.InsertAsSnippet,documentation:{value:`${C.description}`},detail:C.fullName,range:D})),{label:"html",kind:n.languages.CompletionItemKind.Snippet,insertText:"html>$1</html>",insertTextRules:n.languages.CompletionItemInsertTextRule.InsertAsSnippet,documentation:"HTML kök element",range:D}]};if(o.match(/<\s*xsl:\w+\s+$/)){const C=o.match(/<\s*xsl:(\w+)/)?.[1],E=et.find(K=>K.name===C);return E?{suggestions:E.commonAttrs.map(K=>({label:K,kind:n.languages.CompletionItemKind.Property,insertText:`${K}="$1"`,insertTextRules:n.languages.CompletionItemInsertTextRule.InsertAsSnippet,documentation:`${E.fullName} @${K}`,range:D}))}:{suggestions:[]}}return{suggestions:[]}}}),n.languages.registerCompletionItemProvider("xml",{triggerCharacters:['"',":","/"],provideCompletionItems:(l,r)=>{const o=l.getLineContent(r.lineNumber).substring(0,r.column-1),x=o.lastIndexOf('"'),D=o.lastIndexOf('select="');if(D===-1||x>D)return{suggestions:[]};const g=l.getWordUntilPosition(r),C={startLineNumber:r.lineNumber,endLineNumber:r.lineNumber,startColumn:g.startColumn,endColumn:g.endColumn};return{suggestions:Zt.map(E=>({label:E.xpath,kind:n.languages.CompletionItemKind.Field,insertText:E.xpath,documentation:{value:E.description},detail:"UBL-TR XPath",range:C}))}}})},[]);s.useEffect(()=>{ft(Ft(c))},[c]),s.useEffect(()=>{if(V===null)return;const t=F.current,n=G.current;if(!t||!n)return;const l=O[V];if(!l){console.log("[XSLTEditor] Preview click → renderIndex",V,"için xpath bulunamadı (annotation listesinin dışında olabilir)");return}const r=t.getModel();if(!r)return;const h=r.getValue();let o=h.indexOf(l);if(o===-1){const g=l.split("/").pop()||l;o=h.indexOf(g)}if(o===-1){console.log("[XSLTEditor] XSLT içinde binding bulunamadı:",l);return}const x=r.getPositionAt(o);t.revealPositionInCenter(x),t.setPosition(x),t.focus();const D=t.deltaDecorations([],[{range:new n.Range(x.lineNumber,x.column,x.lineNumber,x.column+l.length),options:{inlineClassName:"xslt-click-highlight"}}]);setTimeout(()=>{t.deltaDecorations(D,[])},2e3),console.log(`[XSLTEditor] Preview click → renderIndex=${V} xpath="${l}" position=${x.lineNumber}:${x.column}`)},[V,O]);const X=s.useCallback(t=>{const n=t.target;if(!n||typeof n.closest!="function")return;const l=n.closest("[data-render-index]");if(!l)return;const r=l.getAttribute("data-render-index");if(!r)return;const h=Number(r);isNaN(h)||(t.preventDefault(),t.stopPropagation(),ut(h))},[]),At=s.useCallback(()=>{const t=$.current;if(!t)return;const n=t.contentDocument;if(!n)return;const l=()=>{const r=n.body;if(!r){console.warn("[XSLTEditor] iframe.body null — 100ms sonra retry"),setTimeout(l,100);return}const h=r.scrollHeight||r.offsetHeight||800;L(h),console.log(`[XSLTEditor] iframe loaded — body.scrollHeight=${h}px, zoom=${v}`),r.addEventListener("click",X,{capture:!0}),console.log("[XSLTEditor] iframe click listener attached (capture:true)")};l()},[X,v]);return s.useEffect(()=>{const t=$.current;if(!t)return;const n=t.contentDocument;if(!n||!n.body)return;n.body.removeEventListener("click",X,{capture:!0});const l=n.body,r=l.scrollHeight||l.offsetHeight||800;return L(r),l.addEventListener("click",X,{capture:!0}),console.log(`[XSLTEditor] iframe listener re-bound (previewHtml changed, scrollHeight=${r})`),()=>{const h=t.contentDocument;h?.body&&h.body.removeEventListener("click",X,{capture:!0})}},[k,X]),e.jsxs("div",{"data-xslt-editor":!0,style:{display:"flex",flexDirection:"column",height:"100vh",background:"#0f172a",color:"#e2e8f0",fontFamily:"system-ui, -apple-system, sans-serif",overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",height:"56px",padding:"0 16px",background:"#1e293b",borderBottom:"1px solid #334155",flexShrink:0},children:[e.jsxs("button",{onClick:y,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 12px",background:"rgba(99, 102, 241, 0.15)",border:"1px solid rgba(99, 102, 241, 0.4)",borderRadius:"6px",color:"#a5b4fc",fontSize:"13px",fontWeight:600,cursor:"pointer"},title:"Geri (Selection)",children:[e.jsx(Ct,{size:16}),"Geri"]}),e.jsxs("button",{onClick:()=>st(!M),title:M?"Snippet panelini kapat (preview genişler)":"Snippet panelini aç","data-toggle-snippet-panel":!0,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 10px",background:M?"rgba(16, 185, 129, 0.15)":"rgba(99, 102, 241, 0.15)",border:"1px solid "+(M?"rgba(16, 185, 129, 0.4)":"rgba(99, 102, 241, 0.4)"),borderRadius:"6px",color:M?"#6ee7b7":"#a5b4fc",fontSize:"12px",fontWeight:600,cursor:"pointer"},children:[M?e.jsx(Pt,{size:14}):e.jsx(Dt,{size:14}),M?"Panel":"Panel Aç"]}),e.jsx("div",{style:{fontSize:"14px",fontWeight:700,color:"#cbd5e1",marginRight:"8px"},children:m}),e.jsxs("div",{"data-module-menu":!0,style:{position:"relative"},children:[e.jsxs("button",{onClick:()=>J(!W),style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 12px",background:"rgba(16, 185, 129, 0.12)",border:"1px solid rgba(16, 185, 129, 0.4)",borderRadius:"6px",color:"#34d399",fontSize:"13px",fontWeight:600,cursor:"pointer"},children:[e.jsx(tt,{size:14}),I.label,e.jsx(kt,{size:14})]}),W&&e.jsx("div",{style:{position:"absolute",top:"calc(100% + 4px)",left:0,minWidth:"220px",background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",boxShadow:"0 12px 32px rgba(0,0,0,0.5)",padding:"4px",zIndex:50},children:nt.map(t=>e.jsx("div",{onClick:()=>{T(t.id),J(!1)},style:{padding:"8px 12px",borderRadius:"4px",cursor:"pointer",background:t.id===a?"rgba(99, 102, 241, 0.2)":"transparent",color:t.id===a?"#a5b4fc":"#cbd5e1",fontSize:"13px",fontWeight:t.id===a?700:500,transition:"background 0.1s"},onMouseEnter:n=>{t.id!==a&&(n.currentTarget.style.background="rgba(99, 102, 241, 0.08)")},onMouseLeave:n=>{t.id!==a&&(n.currentTarget.style.background="transparent")},children:t.label},t.id))})]}),e.jsx("div",{style:{flex:1}}),rt&&e.jsx("div",{style:{padding:"4px 10px",background:w==="error"?"rgba(239, 68, 68, 0.15)":w==="saved"?"rgba(16, 185, 129, 0.15)":"transparent",border:w==="error"?"1px solid rgba(239, 68, 68, 0.4)":w==="saved"?"1px solid rgba(16, 185, 129, 0.4)":"1px solid transparent",borderRadius:"4px",color:w==="error"?"#fca5a5":w==="saved"?"#6ee7b7":"#94a3b8",fontSize:"11px",fontWeight:600,maxWidth:"320px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:rt}),e.jsxs("button",{onClick:ht,disabled:w==="saving",style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 12px",background:w==="saved"?"rgba(16, 185, 129, 0.2)":"rgba(99, 102, 241, 0.15)",border:"1px solid rgba(99, 102, 241, 0.4)",borderRadius:"6px",color:"#a5b4fc",fontSize:"13px",fontWeight:600,cursor:w==="saving"?"wait":"pointer",opacity:w==="saving"?.6:1},children:[w==="saving"?e.jsx(ot,{size:14,className:"spin"}):w==="saved"?e.jsx(it,{size:14}):e.jsx(St,{size:14}),"Kaydet"]}),e.jsxs("button",{onClick:gt,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",background:"linear-gradient(135deg, #6366f1, #4f46e5)",border:"none",borderRadius:"6px",color:"white",fontSize:"13px",fontWeight:700,cursor:"pointer",boxShadow:"0 2px 8px rgba(99, 102, 241, 0.3)"},children:[e.jsx(Mt,{size:14}),"İndir .xslt"]})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:M?"240px 1fr 1fr":"0px 1fr 1fr",flex:1,minHeight:0,transition:"grid-template-columns 0.2s ease"},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",background:"#0f172a",borderRight:"1px solid #334155",minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",padding:"0 12px",height:"36px",background:"#1e293b",borderBottom:"1px solid #334155",fontSize:"11px",fontWeight:700,letterSpacing:"0.5px",textTransform:"uppercase",color:"#34d399"},children:[e.jsx(Nt,{size:13}),e.jsx("span",{children:"Snippet Galerisi"}),e.jsx("span",{style:{marginLeft:"auto",padding:"2px 6px",background:"rgba(16, 185, 129, 0.18)",borderRadius:"3px",fontSize:"9px",color:"#6ee7b7"},children:q.length}),e.jsx("button",{onClick:()=>st(!1),title:"Snippet panelini kapat (preview alanı genişler)","data-close-snippet-panel":!0,style:{marginLeft:"6px",padding:"2px 4px",background:"transparent",border:"none",color:"#64748b",cursor:"pointer",display:"flex",alignItems:"center",borderRadius:"3px"},onMouseEnter:t=>{t.currentTarget.style.background="rgba(239, 68, 68, 0.15)",t.currentTarget.style.color="#fca5a5"},onMouseLeave:t=>{t.currentTarget.style.background="transparent",t.currentTarget.style.color="#64748b"},children:e.jsx(Lt,{size:12})})]}),e.jsx("div",{style:{padding:"8px 10px",borderBottom:"1px solid #1e293b"},children:e.jsxs("div",{style:{position:"relative"},children:[e.jsx(Rt,{size:12,style:{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:"#64748b"}}),e.jsx("input",{type:"text",value:U,onChange:t=>bt(t.target.value),placeholder:"Ara: KDV, tablo, döngü...",style:{width:"100%",padding:"6px 8px 6px 26px",background:"#1e293b",border:"1px solid #334155",borderRadius:"4px",color:"#e2e8f0",fontSize:"11px",outline:"none"},onFocus:t=>t.currentTarget.style.borderColor="#6366f1",onBlur:t=>t.currentTarget.style.borderColor="#334155"})]})}),e.jsxs("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px",padding:"8px 10px",borderBottom:"1px solid #1e293b"},children:[e.jsxs("button",{onClick:()=>at("all"),style:{padding:"3px 9px",background:S==="all"?"rgba(99, 102, 241, 0.25)":"#1e293b",border:"1px solid "+(S==="all"?"rgba(99, 102, 241, 0.5)":"#334155"),borderRadius:"3px",color:S==="all"?"#a5b4fc":"#94a3b8",fontSize:"10px",fontWeight:700,cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.3px"},children:["Hepsi · ",q.length]}),Gt.map(t=>e.jsxs("button",{onClick:()=>at(t),style:{padding:"3px 9px",background:S===t?"rgba(99, 102, 241, 0.25)":"#1e293b",border:"1px solid "+(S===t?"rgba(99, 102, 241, 0.5)":"#334155"),borderRadius:"3px",color:S===t?"#a5b4fc":"#94a3b8",fontSize:"10px",fontWeight:700,cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.3px"},children:[t," · ",mt[t]]},t))]}),e.jsx("div",{style:{flex:1,minHeight:0,overflowY:"auto",padding:"6px"},children:ct.length===0?e.jsx("div",{style:{padding:"20px 12px",textAlign:"center",color:"#64748b",fontSize:"11px"},children:"Sonuç yok. Arama veya kategoriyi değiştirin."}):ct.map(t=>e.jsxs("div",{"data-snippet-id":t.id,onClick:()=>yt(t),title:t.description,style:{padding:"8px 10px",marginBottom:"4px",background:"#1e293b",border:"1px solid #334155",borderRadius:"4px",cursor:"pointer",transition:"background 0.1s, border-color 0.1s"},onMouseEnter:n=>{n.currentTarget.style.background="rgba(99, 102, 241, 0.12)",n.currentTarget.style.borderColor="rgba(99, 102, 241, 0.4)"},onMouseLeave:n=>{n.currentTarget.style.background="#1e293b",n.currentTarget.style.borderColor="#334155"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"},children:[e.jsx(tt,{size:11,color:"#34d399"}),e.jsx("span",{style:{fontSize:"12px",fontWeight:600,color:"#e2e8f0"},children:t.label}),e.jsx("span",{style:{marginLeft:"auto",padding:"1px 5px",background:"rgba(52, 211, 153, 0.12)",border:"1px solid rgba(52, 211, 153, 0.3)",borderRadius:"3px",fontSize:"8px",fontWeight:700,color:"#6ee7b7",letterSpacing:"0.5px",textTransform:"uppercase"},children:t.category})]}),e.jsx("div",{style:{fontSize:"10px",color:"#64748b",fontFamily:"monospace",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:t.preview||t.template.replace(/\s+/g," ").slice(0,50)})]},t.id))})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",background:"#1e1e1e",borderRight:"1px solid #334155",minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"4px",padding:"0 12px",height:"36px",background:"#0f172a",borderBottom:"1px solid #334155"},children:[["xslt","xml"].map(t=>e.jsxs("button",{onClick:()=>B(t),style:{display:"flex",alignItems:"center",gap:"6px",padding:"4px 12px",background:b===t?"#1e293b":"transparent",border:"none",borderBottom:b===t?"2px solid #6366f1":"2px solid transparent",color:b===t?"#a5b4fc":"#94a3b8",fontSize:"12px",fontWeight:b===t?700:500,cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.5px"},children:[t==="xslt"?e.jsx(tt,{size:13}):e.jsx(Et,{size:13}),t.toUpperCase()," · ",(b===t?t==="xslt"?c.length:i.length:0).toLocaleString()," chars"]},t)),e.jsx("div",{style:{flex:1}}),e.jsx("div",{style:{fontSize:"10px",color:"#64748b",fontFamily:"monospace"},children:b==="xslt"?`XSLT · ${(c.length/1024).toFixed(1)} kB`:`XML · ${(i.length/1024).toFixed(1)} kB`})]}),e.jsx("div",{style:{flex:1,minHeight:0,position:"relative"},children:e.jsx(wt,{height:"100%",language:"xml",theme:"vs-dark",value:b==="xslt"?c:i,onChange:t=>{const n=t||"";b==="xslt"?u(n):f(n)},onMount:Tt,options:{minimap:{enabled:!0,scale:1},fontSize:13,fontFamily:'"Fira Code", "Cascadia Code", Menlo, Monaco, Consolas, monospace',wordWrap:"on",automaticLayout:!0,tabSize:2,lineNumbers:"on",renderLineHighlight:"all",scrollBeyondLastLine:!1,folding:!0,bracketPairColorization:{enabled:!0},formatOnPaste:!0,cursorBlinking:"smooth"}})})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",background:"#0f172a",minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",padding:"0 12px",height:"36px",background:"#1e293b",borderBottom:"1px solid #334155",fontSize:"11px",fontWeight:700,letterSpacing:"0.5px",textTransform:"uppercase"},children:[e.jsx(Bt,{size:13,color:"#34d399"}),e.jsx("span",{style:{color:"#6ee7b7"},children:"Canlı Önizleme"}),e.jsx("div",{style:{flex:1}}),pt?e.jsxs("span",{style:{color:"#fbbf24",display:"flex",alignItems:"center",gap:"4px"},children:[e.jsx(ot,{size:11,className:"spin"})," Render ediliyor..."]}):N?e.jsxs("span",{style:{color:"#fca5a5",display:"flex",alignItems:"center",gap:"4px"},children:[e.jsx(xt,{size:11})," Hata"]}):e.jsxs("span",{style:{color:"#6ee7b7",display:"flex",alignItems:"center",gap:"4px"},children:[e.jsx(it,{size:11})," ",Z.toFixed(1),"ms"]}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"2px",padding:"0 4px",marginLeft:"8px",borderLeft:"1px solid #334155"},children:[e.jsx("button",{onClick:()=>H(t=>Math.max(.25,Math.round((t-.1)*100)/100)),title:"Zoom out (-10%)",style:{padding:"2px 4px",background:"transparent",border:"none",color:"#94a3b8",cursor:"pointer",display:"flex",alignItems:"center"},onMouseEnter:t=>t.currentTarget.style.color="#a5b4fc",onMouseLeave:t=>t.currentTarget.style.color="#94a3b8",children:e.jsx(Ht,{size:11})}),e.jsxs("span",{style:{fontSize:"10px",fontFamily:"monospace",color:"#cbd5e1",minWidth:"34px",textAlign:"center",padding:"0 2px"},children:[Math.round(v*100),"%"]}),e.jsx("button",{onClick:()=>H(t=>Math.min(2,Math.round((t+.1)*100)/100)),title:"Zoom in (+10%)",style:{padding:"2px 4px",background:"transparent",border:"none",color:"#94a3b8",cursor:"pointer",display:"flex",alignItems:"center"},onMouseEnter:t=>t.currentTarget.style.color="#a5b4fc",onMouseLeave:t=>t.currentTarget.style.color="#94a3b8",children:e.jsx(Xt,{size:11})}),e.jsx("button",{onClick:()=>H(.6),title:"Default zoom (60%)",style:{padding:"1px 5px",background:"transparent",border:"1px solid #334155",borderRadius:"2px",color:"#94a3b8",fontSize:"9px",fontWeight:700,cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.3px",marginLeft:"2px"},onMouseEnter:t=>{t.currentTarget.style.background="rgba(99, 102, 241, 0.15)",t.currentTarget.style.borderColor="rgba(99, 102, 241, 0.5)",t.currentTarget.style.color="#a5b4fc"},onMouseLeave:t=>{t.currentTarget.style.background="transparent",t.currentTarget.style.borderColor="#334155",t.currentTarget.style.color="#94a3b8"},children:"Fit"})]})]}),N&&e.jsxs("div",{style:{padding:"10px 16px",background:"rgba(239, 68, 68, 0.12)",borderBottom:"1px solid rgba(239, 68, 68, 0.4)",color:"#fca5a5",fontSize:"12px",fontFamily:"monospace",maxHeight:"120px",overflow:"auto"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"},children:[e.jsx(xt,{size:14}),e.jsx("strong",{children:"Render Hatası"})]}),e.jsx("div",{style:{whiteSpace:"pre-wrap",fontSize:"11px"},children:N})]}),e.jsx("div",{style:{flex:1,minHeight:0,position:"relative",background:"#475569",backgroundImage:"radial-gradient(at 50% 50%, #64748b 0%, #1e293b 100%)",overflow:"auto",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"48px 24px"},children:k?e.jsx("iframe",{ref:$,srcDoc:k,onLoad:At,style:{border:"1px solid rgba(0,0,0,0.12)",background:"white",boxShadow:"0 25px 50px -12px rgba(0,0,0,0.55), 0 12px 24px -8px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.04)",borderRadius:"2px",width:`${100/v*.95}%`,maxWidth:"1100px",minWidth:"500px",height:`${Y}px`,overflow:"auto",transform:`scale(${v})`,transformOrigin:"center top"},title:"XSLT Render Preview"}):e.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"#94a3b8",fontSize:"14px",background:"#1e293b"},children:N?"Render hatası — XSLT/XML'i kontrol edin":"Render bekleniyor..."})})]})]})]})};export{se as XSLTEditor,se as default};
