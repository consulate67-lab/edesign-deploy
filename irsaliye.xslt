<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ccts="urn:un:unece:uncefact:documentation:2" xmlns:clm54217="urn:un:unece:uncefact:codelist:specification:54217:2001" xmlns:clm5639="urn:un:unece:uncefact:codelist:specification:5639:1988" xmlns:clm66411="urn:un:unece:uncefact:codelist:specification:66411:2001" xmlns:clmIANAMIMEMediaType="urn:un:unece:uncefact:codelist:specification:IANAMIMEMediaType:2003" xmlns:fn="http://www.w3.org/2005/xpath-functions" xmlns:link="http://www.xbrl.org/2003/linkbase" xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2" xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2" xmlns:udt="urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2" xmlns:xbrldi="http://xbrl.org/2006/xbrldi" xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:xdt="http://www.w3.org/2005/xpath-datatypes" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" exclude-result-prefixes="cac cbc ccts clm54217 clm5639 clm66411 clmIANAMIMEMediaType fn link n1 qdt udt xbrldi xbrli xdt xlink xs xsd xsi">
  <xsl:character-map name="a">
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
    <xsl:output-character character="" string="" />
  </xsl:character-map>
  <xsl:decimal-format name="european" decimal-separator="," grouping-separator="." NaN="" />
  <xsl:output version="4.0" method="html" indent="no" encoding="UTF-8" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" doctype-system="http://www.w3.org/TR/html4/loose.dtd" use-character-maps="a" />
  <xsl:param name="SV_OutputFormat" select="'HTML'" />
  <xsl:variable name="XML" select="/" />
  <xsl:param name="param_logo" />
  <xsl:variable name="var_logo" />
  <xsl:variable name="var_qr" />
  <xsl:template match="/">
    <html>
      <head>
        <style type="text/css">
                    body {
                        background-color: #FFFFFF;
                        font-family: 'Tahoma', "Times New Roman", Times, serif;
                        font-size: 11px;
                        color: #666666;
                    }
                    h1, h2 {
                        padding-bottom: 3px;
                        padding-top: 3px;
                        margin-bottom: 5px;
                        text-transform: uppercase;
                        font-family: Arial, Helvetica, sans-serif;
                    }
                    h1 {
                        font-size: 1.4em;
                        text-transform:none;
                    }
                    h2 {
                        font-size: 1em;
                        color: brown;
                    }
                    h3 {
                        font-size: 1em;
                        color: #333333;
                        text-align: justify;
                        margin: 0;
                        padding: 0;
                    }
                    h4 {
                        font-size: 1.1em;
                        font-style: bold;
                        font-family: Arial, Helvetica, sans-serif;
                        color: #000000;
                        margin: 0;
                        padding: 0;
                    }
                    hr {
                        height:2px;
                        color: #000000;
                        background-color: #000000;
                        border-bottom: 1px solid #000000;
                    }
                    p, ul, ol {
                        margin-top: 1.5em;
                    }
                    ul, ol {
                        margin-left: 3em;
                    }
                    blockquote {
                        margin-left: 3em;
                        margin-right: 3em;
                        font-style: italic;
                    }
                    a {
                        text-decoration: none;
                        color: #70A300;
                    }
                    a:hover {
                        border: none;
                        color: #70A300;
                    }
                    #despatchTable {
                        border-collapse:collapse;
                        font-size:11px;
                        float:right;
                        border-color:gray;
                    }
                    #ettnTable {
                        border-collapse:collapse;
                        font-size:11px;
                        border-color:gray;
                    }
                    #customerPartyTable {
                        border-width: 0px;
                        border-spacing:;
                        border-style: inset;
                        border-color: gray;
                        border-collapse: collapse;
                        background-color:
                    }
                    #customerIDTable {
                        border-width: 2px;
                        border-spacing:;
                        border-style: inset;
                        border-color: gray;
                        border-collapse: collapse;
                        background-color:
                    }
                    #customerIDTableTd {
                        border-width: 2px;
                        border-spacing:;
                        border-style: inset;
                        border-color: gray;
                        border-collapse: collapse;
                        background-color:
                    }
                    #lineTable {
                        border-width:2px;
                        border-spacing:;
                        border-style: inset;
                        border-color: black;
                        border-collapse: collapse;
                        background-color:;
                    }
                    td.lineTableTd {
                        border-width: 1px;
                        padding: 1px;
                        border-style: inset;
                        border-color: black;
                        background-color: white;
                    }
                    tr.lineTableTr {
                        border-width: 1px;
                        padding: 0px;
                        border-style: inset;
                        border-color: black;
                        background-color: white;
                        -moz-border-radius:;
                    }
                    #lineTableDummyTd {
                        border-width: 1px;
                        border-color:white;
                        padding: 1px;
                        border-style: inset;
                        border-color: black;
                        background-color: white;
                    }
                    td.lineTableBudgetTd {
                        border-width: 2px;
                        border-spacing:0px;
                        padding: 1px;
                        border-style: inset;
                        border-color: black;
                        background-color: white;
                        -moz-border-radius:;
                    }
                    #notesTable {
                        border-width: 2px;
                        border-spacing:;
                        border-style: inset;
                        border-color: black;
                        border-collapse: collapse;
                        background-color:
                    }
                    #notesTableTd {
                        border-width: 0px;
                        border-spacing:;
                        border-style: inset;
                        border-color: black;
                        border-collapse: collapse;
                        background-color: ;
                        vertical-align: top;
                    }
                    table {
                        border-spacing:0px;
                    }
                    #budgetContainerTable {
                        border-width: 0px;
                        border-spacing: 0px;
                        border-style: inset;
                        border-color: black;
                        border-collapse: collapse;
                        background-color:;
                    }
                    td {
                        border-color:gray;
                    }</style>
        <title>e-İrsaliye</title>
      </head>
      <body style="margin-left=0.6in; margin-right=0.6in; margin-top=0.79in; margin-bottom=0.79in">
        <xsl:for-each select="$XML">
          <table style="border-color:blue; " border="0" cellspacing="0px" width="800" cellpadding="0px">
            <tbody>
              <tr valign="top">
                <td width="40%">
                  <br />
                  <hr />
                  <table align="center" border="0" width="100%">
                    <tbody>
                      <tr align="left">
                        <xsl:for-each select="n1:DespatchAdvice/cac:DespatchSupplierParty/cac:Party">
                          <td align="left">
                            <xsl:if test="cac:PartyName">
                              <xsl:value-of select="cac:PartyName/cbc:Name" />
                              <br />
                            </xsl:if>
                          </td>
                        </xsl:for-each>
                      </tr>
                      <tr align="left">
                        <xsl:for-each select="n1:DespatchAdvice/cac:DespatchSupplierParty/cac:Party">
                          <td align="left">
                            <xsl:for-each select="cac:PostalAddress">
                              <xsl:for-each select="cbc:District">
                                <xsl:apply-templates />
                                <xsl:text>
                                </xsl:text>
                              </xsl:for-each>
                              <xsl:for-each select="cbc:StreetName">
                                <xsl:apply-templates />
                                <xsl:text>
                                </xsl:text>
                              </xsl:for-each>
                              <xsl:for-each select="cbc:BuildingName">
                                <xsl:apply-templates />
                              </xsl:for-each>
                              <xsl:if test="cbc:BuildingNumber">
                                <xsl:text> No:</xsl:text>
                                <xsl:for-each select="cbc:BuildingNumber">
                                  <xsl:apply-templates />
                                </xsl:for-each>
                                <xsl:text>
                                </xsl:text>
                              </xsl:if>
                              <xsl:for-each select="cbc:Room">
                                <xsl:text>Kapı No:</xsl:text>
                                <xsl:apply-templates />
                                <xsl:text>
                                </xsl:text>
                              </xsl:for-each>
                              <br />
                              <xsl:for-each select="cbc:PostalZone">
                                <xsl:apply-templates />
                                <xsl:text>
                                </xsl:text>
                              </xsl:for-each>
                              <xsl:for-each select="cbc:CitySubdivisionName">
                                <xsl:apply-templates />
                              </xsl:for-each>
                              <xsl:text>/ </xsl:text>
                              <xsl:for-each select="cbc:CityName">
                                <xsl:apply-templates />
                                <xsl:text>
                                </xsl:text>
                              </xsl:for-each>
                            </xsl:for-each>
                          </td>
                        </xsl:for-each>
                      </tr>
                      <xsl:if test="//n1:DespatchAdvice/cac:DespatchSupplierParty/cac:Party/cac:Contact/cbc:Telephone or //n1:DespatchAdvice/cac:DespatchSupplierParty/cac:Party/cac:Contact/cbc:Telefax">
                        <tr align="left">
                          <xsl:for-each select="n1:DespatchAdvice/cac:DespatchSupplierParty/cac:Party">
                            <td align="left">
                              <xsl:for-each select="cac:Contact">
                                <xsl:if test="cbc:Telephone">
                                  <xsl:text>Tel: </xsl:text>
                                  <xsl:for-each select="cbc:Telephone">
                                    <xsl:apply-templates />
                                  </xsl:for-each>
                                </xsl:if>
                                <xsl:if test="cbc:Telefax">
                                  <xsl:text> Fax: </xsl:text>
                                  <xsl:for-each select="cbc:Telefax">
                                    <xsl:apply-templates />
                                  </xsl:for-each>
                                </xsl:if>
                                <xsl:text>
                                </xsl:text>
                              </xsl:for-each>
                            </td>
                          </xsl:for-each>
                        </tr>
                      </xsl:if>
                      <xsl:for-each select="//n1:DespatchAdvice/cac:DespatchSupplierParty/cac:Party/cbc:WebsiteURI">
                        <tr align="left">
                          <td>
                            <xsl:text>Web Sitesi: </xsl:text>
                            <xsl:value-of select="." />
                          </td>
                        </tr>
                      </xsl:for-each>
                      <xsl:for-each select="//n1:DespatchAdvice/cac:DespatchSupplierParty/cac:Party/cac:Contact/cbc:ElectronicMail">
                        <tr align="left">
                          <td>
                            <xsl:text>E-Posta: </xsl:text>
                            <xsl:value-of select="." />
                          </td>
                        </tr>
                      </xsl:for-each>
                      <tr align="left">
                        <xsl:for-each select="n1:DespatchAdvice/cac:DespatchSupplierParty/cac:Party">
                          <td align="left">
                            <xsl:text>Vergi Dairesi: </xsl:text>
                            <xsl:for-each select="cac:PartyTaxScheme">
                              <xsl:for-each select="cac:TaxScheme">
                                <xsl:for-each select="cbc:Name">
                                  <xsl:apply-templates />
                                </xsl:for-each>
                              </xsl:for-each>
                              <xsl:text>
                              </xsl:text>
                            </xsl:for-each>
                          </td>
                        </xsl:for-each>
                      </tr>
                      <xsl:for-each select="//n1:DespatchAdvice/cac:DespatchSupplierParty/cac:Party/cac:PartyIdentification">
                        <tr align="left">
                          <td>
                            <xsl:value-of select="cbc:ID/@schemeID" />
                            <xsl:text>: </xsl:text>
                            <xsl:value-of select="cbc:ID" />
                          </td>
                        </tr>
                      </xsl:for-each>
                      <tr align="left">
                        <xsl:for-each select="n1:DespatchAdvice/cac:DespatchSupplierParty/cac:Party/cac:PhysicalLocation">
                          <td align="left">
                            <b>
                              <xsl:for-each select="cbc:ID">
                                <xsl:apply-templates />
                                <xsl:text>:</xsl:text>
                              </xsl:for-each>
                            </b>
                            <br />
                            <xsl:for-each select="cac:Address">
                              <xsl:for-each select="cbc:StreetName">
                                <xsl:apply-templates />
                                <xsl:text>
                                </xsl:text>
                              </xsl:for-each>
                              <xsl:for-each select="cbc:BuildingName">
                                <xsl:apply-templates />
                              </xsl:for-each>
                              <xsl:if test="cbc:BuildingNumber">
                                <xsl:text> No:</xsl:text>
                                <xsl:for-each select="cbc:BuildingNumber">
                                  <xsl:apply-templates />
                                </xsl:for-each>
                                <xsl:for-each select="cbc:Room">
                                  <xsl:apply-templates />
                                </xsl:for-each>
                                <xsl:text>
                                </xsl:text>
                              </xsl:if>
                              <br />
                              <xsl:for-each select="cbc:PostalZone">
                                <xsl:apply-templates />
                                <xsl:text>
                                </xsl:text>
                              </xsl:for-each>
                              <xsl:for-each select="cbc:CitySubdivisionName">
                                <xsl:apply-templates />
                              </xsl:for-each>
                              <xsl:text>/ </xsl:text>
                              <xsl:for-each select="cbc:CityName">
                                <xsl:apply-templates />
                                <xsl:text>  /</xsl:text>
                              </xsl:for-each>
                              <xsl:for-each select="cac:Country/cbc:Name">
                                <xsl:apply-templates />
                                <xsl:text>
                                </xsl:text>
                              </xsl:for-each>
                            </xsl:for-each>
                          </td>
                        </xsl:for-each>
                      </tr>
                    </tbody>
                  </table>
                  <hr />
                </td>
                <td width="20%" align="center" valign="middle">
                  <br />
                  <br />

                  <h1 align="center">
                    <span style="font-weight:bold; ">
                      <xsl:text>e-İRSALİYE</xsl:text>
                    </span>
                  </h1>
                </td>
               <td width="15%" align="right" valign="bottom">
                  <div id="qrcode">
                     <img src="{$QRSOVOS}" alt="qrcode" width="175px" />
                     <xsl:text>
                     </xsl:text>
                  </div>
                  <div id="qrvalue" style="visibility: hidden">
                    <xsl:value-of select="n1:DespatchAdvice/cbc:UUID" />
                  </div>
                </td>
              </tr>
              <tr style="height:118px; " valign="top">
                <td width="40%" align="right" valign="bottom">
                  <table id="customerPartyTable" align="left" border="0">
                    <tbody>
                      <tr style="height:71px; ">
                        <td>
                          <hr />
                          <table align="center" border="0">
                            <tbody>
                              <tr>
                                <xsl:for-each select="n1:DespatchAdvice/cac:DeliveryCustomerParty/cac:Party">
                                  <td style="width:469px; " align="left">
                                    <span style="font-weight:bold; ">
                                      <xsl:text>SAYIN</xsl:text>
                                    </span>
                                  </td>
                                </xsl:for-each>
                              </tr>
                              <tr>
                                <xsl:choose>
                                  <xsl:when test="n1:DespatchAdvice/cac:BuyerCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID='PARTYTYPE' and text()='TAXFREE']">
                                    <xsl:for-each select="n1:DespatchAdvice/cac:BuyerCustomerParty/cac:Party">
                                      <xsl:call-template name="Party_Title">
                                        <xsl:with-param name="PartyType">TAXFREE</xsl:with-param>
                                      </xsl:call-template>
                                    </xsl:for-each>
                                  </xsl:when>
                                  <xsl:otherwise>
                                    <xsl:for-each select="n1:DespatchAdvice/cac:DeliveryCustomerParty/cac:Party">
                                      <xsl:call-template name="Party_Title">
                                        <xsl:with-param name="PartyType">OTHER</xsl:with-param>
                                      </xsl:call-template>
                                    </xsl:for-each>
                                  </xsl:otherwise>
                                </xsl:choose>
                              </tr>
                              <xsl:choose>
                                <xsl:when test="n1:DespatchAdvice/cac:BuyerCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID='PARTYTYPE' and text()='TAXFREE']">
                                  <xsl:for-each select="n1:DespatchAdvice/cac:BuyerCustomerParty/cac:Party">
                                    <tr>
                                      <xsl:call-template name="Party_Adress">
                                        <xsl:with-param name="PartyType">TAXFREE</xsl:with-param>
                                      </xsl:call-template>
                                    </tr>
                                    <xsl:call-template name="Party_Other">
                                      <xsl:with-param name="PartyType">TAXFREE</xsl:with-param>
                                    </xsl:call-template>
                                  </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                  <xsl:for-each select="n1:DespatchAdvice/cac:DeliveryCustomerParty/cac:Party">
                                    <tr>
                                      <xsl:call-template name="Party_Adress">
                                        <xsl:with-param name="PartyType">OTHER</xsl:with-param>
                                      </xsl:call-template>
                                    </tr>
                                    <xsl:call-template name="Party_Other">
                                      <xsl:with-param name="PartyType">OTHER</xsl:with-param>
                                    </xsl:call-template>
                                  </xsl:for-each>
                                </xsl:otherwise>
                              </xsl:choose>
                            </tbody>
                          </table>
                          <hr />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <br />
                </td>
                <td width="60%" align="center" valign="bottom" colspan="3">
                  <table border="1" id="despatchTable">
                    <tbody>
                      <tr>
                        <td style="width:105px;" align="left">
                          <span style="font-weight:bold; ">
                            <xsl:text>Özelleştirme No:</xsl:text>
                          </span>
                        </td>
                        <td style="width:110px;" align="left">
                          <xsl:for-each select="n1:DespatchAdvice/cbc:CustomizationID">
                            <xsl:apply-templates />
                          </xsl:for-each>
                        </td>
                      </tr>
                      <tr style="height:13px; ">
                        <td align="left">
                          <span style="font-weight:bold; ">
                            <xsl:text>Senaryo:</xsl:text>
                          </span>
                        </td>
                        <td align="left">
                          <xsl:for-each select="n1:DespatchAdvice/cbc:ProfileID">
                            <xsl:apply-templates />
                          </xsl:for-each>
                        </td>
                      </tr>
                      <tr style="height:13px; ">
                        <td align="left">
                          <span style="font-weight:bold; ">
                            <xsl:text>İrsaliye Tipi:</xsl:text>
                          </span>
                        </td>
                        <td align="left">
                          <xsl:for-each select="n1:DespatchAdvice/cbc:DespatchAdviceTypeCode">
                            <xsl:apply-templates />
                          </xsl:for-each>
                        </td>
                      </tr>
                      <tr style="height:13px; ">
                        <td align="left">
                          <span style="font-weight:bold; ">
                            <xsl:text>İrsaliye No:</xsl:text>
                          </span>
                        </td>
                        <td align="left">
                          <xsl:for-each select="n1:DespatchAdvice/cbc:ID">
                            <xsl:apply-templates />
                          </xsl:for-each>
                        </td>
                      </tr>
                      <tr style="height:13px; ">
                        <td align="left">
                          <span style="font-weight:bold; ">
                            <xsl:text>İrsaliye Tarihi:</xsl:text>
                          </span>
                        </td>
                        <td align="left">
                          <xsl:for-each select="n1:DespatchAdvice/cbc:IssueDate">
                            <xsl:apply-templates select="." />
                          </xsl:for-each>
                        </td>
                      </tr>
                      <tr style="height:13px; ">
                        <td align="left">
                          <span style="font-weight:bold; ">
                            <xsl:text>İrsaliye Zamanı:</xsl:text>
                          </span>
                        </td>
                        <td align="left">
                          <xsl:for-each select="n1:DespatchAdvice/cbc:IssueTime">
                            <xsl:apply-templates select="." />
                          </xsl:for-each>
                        </td>
                      </tr>
                      <tr style="height:13px; ">
                        <td align="left">
                          <span style="font-weight:bold; ">
                            <xsl:text>Sevk Tarihi:</xsl:text>
                          </span>
                        </td>
                        <td align="left">
                          <xsl:for-each select="n1:DespatchAdvice/cac:Shipment/cac:Delivery/cac:Despatch/cbc:ActualDespatchDate">
                            <xsl:apply-templates select="." />
                          </xsl:for-each>
                        </td>
                      </tr>
                      <tr style="height:13px; ">
                        <td align="left">
                          <span style="font-weight:bold; ">
                            <xsl:text>Sevk Zamanı:</xsl:text>
                          </span>
                        </td>
                        <td align="left">
                          <xsl:for-each select="n1:DespatchAdvice/cac:Shipment/cac:Delivery/cac:Despatch/cbc:ActualDespatchTime">
                            <xsl:apply-templates select="." />
                          </xsl:for-each>
                        </td>
                      </tr>
                      <xsl:if test="n1:DespatchAdvice/cac:OrderReference">
                        <tr style="height:13px">
                          <td align="left">
                            <span style="font-weight:bold; ">
                              <xsl:text>Sipariş No:</xsl:text>
                            </span>
                          </td>
                          <td align="left">
                            <xsl:for-each select="n1:DespatchAdvice/cac:OrderReference/cbc:ID">
                              <xsl:apply-templates />
                            </xsl:for-each>
                          </td>
                        </tr>
                      </xsl:if>
                      <xsl:if test="n1:DespatchAdvice/cac:OrderReference/cbc:IssueDate">
                        <tr style="height:13px">
                          <td align="left">
                            <span style="font-weight:bold; ">
                              <xsl:text>Sipariş Tarihi:</xsl:text>
                            </span>
                          </td>
                          <td align="left">
                            <xsl:for-each select="n1:DespatchAdvice/cac:OrderReference/cbc:IssueDate">
                              <xsl:apply-templates select="." />
                            </xsl:for-each>
                          </td>
                        </tr>
                      </xsl:if>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr align="left">
                <td align="left" valign="top" id="ettnTable">
                  <span style="font-weight:bold; ">
                    <xsl:text>ETTN: </xsl:text>
                  </span>
                  <xsl:for-each select="n1:DespatchAdvice/cbc:UUID">
                    <xsl:apply-templates />
                  </xsl:for-each>
                </td>
              </tr>
            </tbody>
          </table>
          <div id="lineTableAligner">
            <span>
              <xsl:text>
              </xsl:text>
            </span>
          </div>
          <table border="1" id="lineTable" width="800">
            <tbody>
              <tr class="lineTableTr">
                <td class="lineTableTd" style="width:5%" align="center">
                  <span style="font-weight:bold;">
                    <xsl:text>Sıra No</xsl:text>
                  </span>
                </td>
                <td class="lineTableTd" style="width:35%" align="center">
                  <span style="font-weight:bold;">
                    <xsl:text>Mal</xsl:text>
                  </span>
                </td>
                <td class="lineTableTd" style="width:10%" align="center">
                  <span style="font-weight:bold;">
                    <xsl:text>Miktar</xsl:text>
                  </span>
                </td>
                <td class="lineTableTd" style="width:20%" align="center">
                  <span style="font-weight:bold;">
                    <xsl:text>Sonra Gönderilecek Miktar</xsl:text>
                  </span>
                </td>
                <td class="lineTableTd" style="width:20%" align="center">
                  <span style="font-weight:bold;">
                    <xsl:text>Tutar</xsl:text>
                  </span>
                </td>
              </tr>
              <xsl:if test="count(//n1:DespatchAdvice/cac:DespatchLine) &gt;= 10">
                <xsl:for-each select="//n1:DespatchAdvice/cac:DespatchLine">
                  <xsl:apply-templates select="." />
                </xsl:for-each>
              </xsl:if>
              <xsl:if test="count(//n1:DespatchAdvice/cac:DespatchLine) &lt; 10">
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[1]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[1]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[2]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[2]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[3]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[3]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[4]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[4]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[5]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[5]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[6]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[6]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[7]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[7]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[8]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[8]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[9]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[9]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[10]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[10]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[11]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[11]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[12]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[12]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[13]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[13]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[14]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[14]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[15]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[15]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[16]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[16]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[17]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[17]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[18]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[18]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[19]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[19]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:choose>
                  <xsl:when test="//n1:DespatchAdvice/cac:DespatchLine[20]">
                    <xsl:apply-templates select="//n1:DespatchAdvice/cac:DespatchLine[20]" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="//n1:DespatchAdvice" />
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:if>
            </tbody>
          </table>
        </xsl:for-each>
        <br />
        <table id="budgetContainerTable" width="800px">
          <tr align="right">
            <td />
            <td class="lineTableBudgetTd" align="right" width="129px">
              <span style="font-weight:bold; ">
                <xsl:text>Toplam Miktar</xsl:text>
              </span>
            </td>
            <td class="lineTableBudgetTd" style="width:129px; " align="right">
              <xsl:value-of select="format-number(sum(//./cbc:DeliveredQuantity),'###.##0,00', 'european')" />
            </td>
          </tr>
        </table>
        <br />
        <xsl:if test="//n1:DespatchAdvice/cac:AdditionalDocumentReference">
          <table id="lineTable" width="800">
            <thead>
              <tr>
                <td align="left">
                  <span style="font-weight:bold; " align="center">     İlgili Dokümanlar</span>
                </td>
                <td align="left">
                  <span style="font-weight:bold; " align="center">
                  </span>
                </td>
                <td align="left">
                  <span style="font-weight:bold; " align="center">
                  </span>
                </td>
                <td align="left">
                  <span style="font-weight:bold; " align="center">
                  </span>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr align="left" class="lineTableTr">
                <td class="lineTableTd">
                  <span style="font-weight:bold; " align="center">     Doküman No</span>
                </td>
                <td class="lineTableTd">
                  <span style="font-weight:bold; " align="center">     Tarih</span>
                </td>
                <td class="lineTableTd">
                  <span style="font-weight:bold; " align="center">     Doküman Tipi</span>
                </td>
                <td class="lineTableTd">
                  <span style="font-weight:bold; " align="center">     Açıklama</span>
                </td>
              </tr>
              <xsl:for-each select="//n1:DespatchAdvice/cac:AdditionalDocumentReference">
                <tr align="left" class="lineTableTr">
                  <td class="lineTableTd">
                    <xsl:value-of select="./cbc:ID" />
                  </td>
                  <td class="lineTableTd">
                    <xsl:for-each select="./cbc:IssueDate">
                      <xsl:apply-templates select="." />
                    </xsl:for-each>
                  </td>
                  <td class="lineTableTd">
                    <xsl:value-of select="./cbc:DocumentType" />
                  </td>
                  <td class="lineTableTd">
                    <xsl:value-of select="./cbc:DocumentDescription" />
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </xsl:if>
        <br />
        <table id="notesTable" width="800" align="left">
          <thead>
            <tr>
              <td align="left">
                <span style="font-weight:bold; " align="center">     Açıklamalar</span>
              </td>
              <td align="left">
                <span style="font-weight:bold; " align="center">     Taşıyıcı Bilgileri</span>
              </td>
              <td align="left">
                <span style="font-weight:bold; " align="center">     Teslimat Bilgileri</span>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr align="left">
              <td id="notesTableTd" height="100">
                <xsl:for-each select="//n1:DespatchAdvice/cbc:Note">
                  <b>      Not: </b>
                  <xsl:value-of select="." />
                  <br />
                </xsl:for-each>
                <xsl:for-each select="//cac:SellerSupplierParty">
                  <b>      Asıl Satıcı VKN: </b>
                  <xsl:value-of select="cac:Party/cac:PartyIdentification/cbc:ID" />
                  <br />
                  <b>      Asıl Satıcı Ünvan: </b>
                  <xsl:value-of select="cac:Party/cac:PartyName/cbc:Name" />
                  <br />
                </xsl:for-each>
                <xsl:for-each select="//cac:BuyerCustomerParty">
                  <b>      Asıl Alıcı VKN: </b>
                  <xsl:value-of select="cac:Party/cac:PartyIdentification/cbc:ID" />
                  <br />
                  <b>      Asıl Alıcı Ünvan: </b>
                  <xsl:value-of select="cac:Party/cac:PartyName/cbc:Name" />
                  <br />
                </xsl:for-each>
                <xsl:for-each select="//cac:OriginatorCustomerParty">
                  <b>      İşlemleri Başlatan Alıcı VKN: </b>
                  <xsl:value-of select="cac:Party/cac:PartyIdentification/cbc:ID" />
                  <br />
                  <b>      İşlemleri Başlatan Alıcı Ünvan: </b>
                  <xsl:value-of select="cac:Party/cac:PartyName/cbc:Name" />
                  <br />
                </xsl:for-each>
                <xsl:for-each select="//cac:DespatchSupplierParty/cac:Party/cac:Person">
                  <xsl:if test="cbc:FirstName">
                    <b>      Teslim Eden: </b>
                    <xsl:for-each select="cbc:Title">
                      <xsl:apply-templates />
                      <xsl:text>
                      </xsl:text>
                    </xsl:for-each>
                    <xsl:for-each select="cbc:FirstName">
                      <xsl:apply-templates />
                      <xsl:text>
                      </xsl:text>
                    </xsl:for-each>
                    <xsl:for-each select="cbc:MiddleName">
                      <xsl:apply-templates />
                      <xsl:text>
                      </xsl:text>
                    </xsl:for-each>
                    <xsl:for-each select="cbc:FamilyName">
                      <xsl:apply-templates />
                      <xsl:text>
                      </xsl:text>
                    </xsl:for-each>
                    <xsl:for-each select="cbc:NameSuffix">
                      <xsl:apply-templates />
                    </xsl:for-each>
                    <br />
                  </xsl:if>
                </xsl:for-each>
              </td>
              <td id="notesTableTd" height="100">
                <xsl:for-each select="//cac:CarrierParty">
                  <b>       Taşıyıcı Firma: </b>
                                    VKN: 
                                    <xsl:value-of select="./cac:PartyIdentification/cbc:ID" />, 
                                    <xsl:value-of select="./cac:PartyName/cbc:Name" /><br /></xsl:for-each>
                <xsl:for-each select="//cac:ShipmentStage/cac:TransportMeans/cac:RoadTransport/cbc:LicensePlateID">
                  <b>       Araç plaka numarası: </b>
                  <xsl:value-of select="." />
                  <br />
                </xsl:for-each>
                <xsl:for-each select="//cac:TransportHandlingUnit/cac:TransportEquipment/cbc:ID[@schemeID = 'DORSEPLAKA']">
                  <b>       Dorse plaka numarası: </b>
                  <xsl:value-of select="." />
                  <br />
                </xsl:for-each>
                <xsl:for-each select="//cac:ShipmentStage/cac:DriverPerson">
                  <xsl:if test="cbc:FirstName">
                    <b>       Şoför: </b>
                    <xsl:for-each select="cbc:Title">
                      <xsl:apply-templates />
                      <xsl:text>
                      </xsl:text>
                    </xsl:for-each>
                    <xsl:for-each select="cbc:FirstName">
                      <xsl:apply-templates />
                      <xsl:text>
                      </xsl:text>
                    </xsl:for-each>
                    <xsl:for-each select="cbc:MiddleName">
                      <xsl:apply-templates />
                      <xsl:text>
                      </xsl:text>
                    </xsl:for-each>
                    <xsl:for-each select="cbc:FamilyName">
                      <xsl:apply-templates />
                      <xsl:text>
                      </xsl:text>
                    </xsl:for-each>, TCKN:
                                        
                                        <xsl:for-each select="cbc:NationalityID"><xsl:apply-templates /></xsl:for-each><br /></xsl:if>
                </xsl:for-each>
              </td>
              <td id="notesTableTd" height="100">
                <xsl:for-each select="n1:DespatchAdvice/cac:Shipment/cac:Delivery">
                  <xsl:value-of select="./cac:DeliveryAddress/cbc:StreetName" />
                  <br />
                  <xsl:value-of select="./cac:DeliveryAddress/cbc:CitySubdivisionName" />
                  <xsl:text> / </xsl:text>
                  <xsl:value-of select="./cac:DeliveryAddress/cbc:CityName" />
                  <br />
                </xsl:for-each>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
  <xsl:template match="//n1:DespatchAdvice/cac:DespatchLine">
    <tr class="lineTableTr">
      <td class="lineTableTd">
        <xsl:text>
        </xsl:text>
        <xsl:value-of select="./cbc:ID" />
      </td>
      <td class="lineTableTd">
        <xsl:text>
        </xsl:text>
        <xsl:value-of select="./cac:Item/cbc:Name" />
      </td>
      <td class="lineTableTd" align="right">
        <xsl:text>
        </xsl:text>
        <xsl:value-of select="format-number(./cbc:DeliveredQuantity, '###.###,####', 'european')" />
        <xsl:if test="./cbc:DeliveredQuantity/@unitCode">
          <xsl:for-each select="./cbc:DeliveredQuantity">
            <xsl:text>
            </xsl:text>
            <xsl:choose>
              <xsl:when test="@unitCode  = '26'">
                <xsl:text>ton</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'BX'">
                <xsl:text>Kutu</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'LTR'">
                <xsl:text>lt</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'C62'">
                <xsl:text>Adet</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'NIU'">
                <xsl:text>Adet</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'KGM'">
                <xsl:text>kg</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'KJO'">
                <xsl:text>kJ</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'GRM'">
                <xsl:text>g</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MGM'">
                <xsl:text>mg</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'NT'">
                <xsl:text>Net Ton</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'GT'">
                <xsl:text>Gross Ton</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MTR'">
                <xsl:text>m</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MMT'">
                <xsl:text>mm</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'KTM'">
                <xsl:text>km</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MLT'">
                <xsl:text>ml</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MMQ'">
                <xsl:text>mm3</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'CLT'">
                <xsl:text>cl</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'CMK'">
                <xsl:text>cm2</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'CMQ'">
                <xsl:text>cm3</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'CMT'">
                <xsl:text>cm</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MTK'">
                <xsl:text>m2</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MTQ'">
                <xsl:text>m3</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'DAY'">
                <xsl:text> Gün</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MON'">
                <xsl:text> Ay</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'PA'">
                <xsl:text> Paket</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'KWH'">
                <xsl:text> KWH</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'ANN'">
                <xsl:text> Yıl</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'HUR'">
                <xsl:text> Saat</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'D61'">
                <xsl:text> Dakika</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'D62'">
                <xsl:text> Saniye</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'CCT'">
                <xsl:text> Ton baş.taşıma kap.</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'D30'">
                <xsl:text> Brüt kalori</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'D40'">
                <xsl:text> 1000 lt</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'LPA'">
                <xsl:text> saf alkol lt</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'B32'">
                <xsl:text> kg.m2</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'NCL'">
                <xsl:text> hücre adet</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'PR'">
                <xsl:text> Çift</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'R9'">
                <xsl:text> 1000 m3</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'SET'">
                <xsl:text> Set</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'T3'">
                <xsl:text> 1000 adet</xsl:text>
              </xsl:when>
            </xsl:choose>
          </xsl:for-each>
        </xsl:if>
      </td>
      <td class="lineTableTd" align="right">
        <xsl:text>
        </xsl:text>
        <xsl:value-of select="format-number(./cbc:OutstandingQuantity, '###.###,####', 'european')" />
        <xsl:if test="./cbc:OutstandingQuantity/@unitCode">
          <xsl:for-each select="./cbc:OutstandingQuantity">
            <xsl:text>
            </xsl:text>
            <xsl:choose>
              <xsl:when test="@unitCode  = '26'">
                <xsl:text>ton</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'BX'">
                <xsl:text>Kutu</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'LTR'">
                <xsl:text>lt</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'C62'">
                <xsl:text>Adet</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'NIU'">
                <xsl:text>Adet</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'KGM'">
                <xsl:text>kg</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'KJO'">
                <xsl:text>kJ</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'GRM'">
                <xsl:text>g</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MGM'">
                <xsl:text>mg</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'NT'">
                <xsl:text>Net Ton</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'GT'">
                <xsl:text>Gross Ton</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MTR'">
                <xsl:text>m</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MMT'">
                <xsl:text>mm</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'KTM'">
                <xsl:text>km</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MLT'">
                <xsl:text>ml</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MMQ'">
                <xsl:text>mm3</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'CLT'">
                <xsl:text>cl</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'CMK'">
                <xsl:text>cm2</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'CMQ'">
                <xsl:text>cm3</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'CMT'">
                <xsl:text>cm</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MTK'">
                <xsl:text>m2</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MTQ'">
                <xsl:text>m3</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'DAY'">
                <xsl:text> Gün</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'MON'">
                <xsl:text> Ay</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'PA'">
                <xsl:text> Paket</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'KWH'">
                <xsl:text> KWH</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'ANN'">
                <xsl:text> Yıl</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'HUR'">
                <xsl:text> Saat</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'D61'">
                <xsl:text> Dakika</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'D62'">
                <xsl:text> Saniye</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'CCT'">
                <xsl:text> Ton baş.taşıma kap.</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'D30'">
                <xsl:text> Brüt kalori</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'D40'">
                <xsl:text> 1000 lt</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'LPA'">
                <xsl:text> saf alkol lt</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'B32'">
                <xsl:text> kg.m2</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'NCL'">
                <xsl:text> hücre adet</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'PR'">
                <xsl:text> Çift</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'R9'">
                <xsl:text> 1000 m3</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'SET'">
                <xsl:text> Set</xsl:text>
              </xsl:when>
              <xsl:when test="@unitCode  = 'T3'">
                <xsl:text> 1000 adet</xsl:text>
              </xsl:when>
            </xsl:choose>
          </xsl:for-each>
        </xsl:if>
      </td>
      <td class="lineTableTd" align="right">
        <xsl:text>
        </xsl:text>
        <xsl:value-of select="//n1:Invoice/cac:InvoiceLine" />
        <xsl:if test="./cac:Shipment/cac:GoodsItem/cac:InvoiceLine/cbc:LineExtensionAmount/@currencyID">
          <xsl:text>
          </xsl:text>
          <xsl:if test="./cac:Shipment/cac:GoodsItem/cac:InvoiceLine/cbc:LineExtensionAmount/@currencyID = &quot;TRL&quot; or ./cac:Shipment/cac:GoodsItem/cac:InvoiceLine/cbc:LineExtensionAmount/@currencyID = &quot;TRY&quot;">
            <xsl:text>TL</xsl:text>
          </xsl:if>
          <xsl:if test="./cac:Shipment/cac:GoodsItem/cac:InvoiceLine/cbc:LineExtensionAmount/@currencyID != &quot;TRL&quot; and ./cac:Shipment/cac:GoodsItem/cac:InvoiceLine/cbc:LineExtensionAmount/@currencyID != &quot;TRY&quot;">
            <xsl:value-of select="./cac:Shipment/cac:GoodsItem/cac:InvoiceLine/cbc:LineExtensionAmount/@currencyID" />
          </xsl:if>
        </xsl:if>
      </td>
    </tr>
  </xsl:template>
  <xsl:template match="//cbc:IssueDate">
    <xsl:value-of select="substring(.,9,2)" />-
        <xsl:value-of select="substring(.,6,2)" />-
        <xsl:value-of select="substring(.,1,4)" /></xsl:template>
  <xsl:template match="//cbc:ActualDespatchDate">
    <xsl:value-of select="substring(.,9,2)" />-
        <xsl:value-of select="substring(.,6,2)" />-
        <xsl:value-of select="substring(.,1,4)" /></xsl:template>
  <xsl:template match="//n1:DespatchAdvice">
    <tr class="lineTableTr">
      <td class="lineTableTd">
        <xsl:text>
        </xsl:text>
      </td>
      <td class="lineTableTd">
        <xsl:text>
        </xsl:text>
      </td>
      <td class="lineTableTd" align="right">
        <xsl:text>
        </xsl:text>
      </td>
      <td class="lineTableTd" align="right">
        <xsl:text>
        </xsl:text>
      </td>
      <td class="lineTableTd" align="right">
        <xsl:text>
        </xsl:text>
      </td>
    </tr>
  </xsl:template>
  <xsl:template name="Party_Title">
    <xsl:param name="PartyType" />
    <td style="width:469px; " align="left">
      <xsl:for-each select="cac:Person">
        <xsl:for-each select="cbc:Title">
          <xsl:apply-templates />
          <xsl:text>
          </xsl:text>
        </xsl:for-each>
        <xsl:for-each select="cbc:FirstName">
          <xsl:apply-templates />
          <xsl:text>
          </xsl:text>
        </xsl:for-each>
        <xsl:for-each select="cbc:MiddleName">
          <xsl:apply-templates />
          <xsl:text>
          </xsl:text>
        </xsl:for-each>
        <xsl:for-each select="cbc:FamilyName">
          <xsl:apply-templates />
          <xsl:text>
          </xsl:text>
        </xsl:for-each>
        <xsl:for-each select="cbc:NameSuffix">
          <xsl:apply-templates />
        </xsl:for-each>
        <xsl:if test="$PartyType='TAXFREE'">
          <br />
          <xsl:text>Pasaport No: </xsl:text>
          <xsl:value-of select="cac:IdentityDocumentReference/cbc:ID" />
          <br />
          <xsl:text>Ülkesi: </xsl:text>
          <xsl:value-of select="cbc:NationalityID" />
        </xsl:if>
      </xsl:for-each>
    </td>
  </xsl:template>
  <xsl:template name="Party_Adress">
    <xsl:param name="PartyType" />
    <td style="width:469px; " align="left">
      <xsl:for-each select="cac:PostalAddress">
        <xsl:for-each select="cbc:District">
          <xsl:apply-templates />
        </xsl:for-each>
        <xsl:for-each select="cbc:StreetName">
          <xsl:apply-templates />
          <xsl:text>
          </xsl:text>
        </xsl:for-each>
        <xsl:for-each select="cbc:BuildingName">
          <xsl:apply-templates />
        </xsl:for-each>
        <xsl:for-each select="cbc:BuildingNumber">
          <xsl:text> No:</xsl:text>
          <xsl:apply-templates />
          <xsl:text>
          </xsl:text>
        </xsl:for-each>
        <br />
        <xsl:for-each select="cbc:Room">
          <xsl:text>Kapı No:</xsl:text>
          <xsl:apply-templates />
          <xsl:text>
          </xsl:text>
        </xsl:for-each>
        <br />
        <xsl:for-each select="cbc:PostalZone">
          <xsl:apply-templates />
          <xsl:text>
          </xsl:text>
        </xsl:for-each>
        <xsl:for-each select="cbc:CitySubdivisionName">
          <xsl:apply-templates />
          <xsl:text>/ </xsl:text>
        </xsl:for-each>
        <xsl:for-each select="cbc:CityName">
          <xsl:apply-templates />
          <xsl:text>
          </xsl:text>
        </xsl:for-each>
        <xsl:for-each select="cac:Country/cbc:Name">
          <xsl:apply-templates />
          <xsl:text>
          </xsl:text>
          <xsl:text>
          </xsl:text>
        </xsl:for-each>
        <xsl:if test="$PartyType='TAXFREE'">
          <br />
          <xsl:value-of select="cac:Country/cbc:Name" />
          <br />
        </xsl:if>
      </xsl:for-each>
    </td>
  </xsl:template>
  <xsl:template name="Party_Other">
    <xsl:param name="PartyType" />
    <xsl:for-each select="cbc:WebsiteURI">
      <tr align="left">
        <td>
          <xsl:text>Web Sitesi: </xsl:text>
          <xsl:value-of select="." />
        </td>
      </tr>
    </xsl:for-each>
    <xsl:for-each select="cac:Contact/cbc:ElectronicMail">
      <tr align="left">
        <td>
          <xsl:text>E-Posta: </xsl:text>
          <xsl:value-of select="." />
        </td>
      </tr>
    </xsl:for-each>
    <xsl:for-each select="cac:Contact">
      <xsl:if test="cbc:Telephone or cbc:Telefax">
        <tr align="left">
          <td style="width:469px; " align="left">
            <xsl:for-each select="cbc:Telephone">
              <xsl:text>Tel: </xsl:text>
              <xsl:apply-templates />
            </xsl:for-each>
            <xsl:for-each select="cbc:Telefax">
              <xsl:text> Fax: </xsl:text>
              <xsl:apply-templates />
            </xsl:for-each>
            <xsl:text>
            </xsl:text>
          </td>
        </tr>
      </xsl:if>
    </xsl:for-each>
    <xsl:if test="$PartyType!='TAXFREE'">
      <xsl:for-each select="cac:PartyTaxScheme/cac:TaxScheme/cbc:Name">
        <tr align="left">
          <td>
            <xsl:text>Vergi Dairesi: </xsl:text>
            <xsl:apply-templates />
          </td>
        </tr>
      </xsl:for-each>
      <xsl:for-each select="cac:PartyIdentification">
        <tr align="left">
          <td>
            <xsl:value-of select="cbc:ID/@schemeID" />
            <xsl:text>: </xsl:text>
            <xsl:value-of select="cbc:ID" />
          </td>
        </tr>
      </xsl:for-each>
    </xsl:if>
  </xsl:template>
  <xsl:template name="Curr_Type">
    <xsl:value-of select="format-number(., '###.##0,00', 'european')" />
    <xsl:if test="@currencyID">
      <xsl:text>
      </xsl:text>
      <xsl:choose>
        <xsl:when test="@currencyID = 'TRL' or @currencyID = 'TRY'">
          <xsl:text>TL</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@currencyID" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>
<xsl:variable name="QRSOVOS">
    <xsl:text> https://qr.sovostr.com/qr?data=</xsl:text>
        <xsl:text>{"vkntckn":"</xsl:text>       
        <xsl:value-of select="//cac:DespatchSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"avkntckn":"</xsl:text>
        <xsl:value-of select="//cac:DeliveryCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"senaryo":"</xsl:text>
        <xsl:value-of select="//cbc:ProfileID"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"tip":"</xsl:text>
        <xsl:value-of select="//cbc:DespatchAdviceTypeCode"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"tarih":"</xsl:text>
        <xsl:value-of select="//cbc:IssueDate"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"no":"</xsl:text>
        <xsl:value-of select="//cbc:ID"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"ettn":"</xsl:text>
        <xsl:value-of select="//cbc:UUID"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"sevktarihi":"</xsl:text>
        <xsl:value-of select="//cac:Shipment/cac:Delivery/cac:Despatch/cbc:ActualDespatchDate"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"sevkzamani":"</xsl:text>
        <xsl:value-of select="substring(//cac:Shipment/cac:Delivery/cac:Despatch/cbc:ActualDespatchTime,1,8)"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"tasiyicivkn":"</xsl:text>
        <xsl:value-of select="//cac:Shipment/cac:Delivery/cac:CarrierParty/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']"/>
        <xsl:text>",</xsl:text>
        <xsl:text>"plaka":"</xsl:text>
        <xsl:value-of select="//cac:Shipment/cac:ShipmentStage/cac:TransportMeans/cac:RoadTransport/cbc:LicensePlateID"/>
        <xsl:text>"}</xsl:text>
</xsl:variable>
</xsl:stylesheet>