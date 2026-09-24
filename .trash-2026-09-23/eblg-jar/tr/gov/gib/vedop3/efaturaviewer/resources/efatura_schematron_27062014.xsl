<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:schold="http://www.ascc.net/xml/schematron"
                xmlns:iso="http://purl.oclc.org/dsdl/schematron"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                xmlns:sh="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader"
                xmlns:ef="http://www.efatura.gov.tr/package-namespace"
                xmlns:inv="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
                xmlns:apr="urn:oasis:names:specification:ubl:schema:xsd:ApplicationResponse-2"
                xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
                xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
                xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
                xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                xmlns:xades="http://uri.etsi.org/01903/v1.3.2#"
                xmlns:hr="http://www.hr-xml.org/3"
                xmlns:oa="http://www.openapplications.org/oagis/9"
                version="1.0"><!--Implementers: please note that overriding process-prolog or process-root is 
    the preferred method for meta-stylesheets to use where possible. -->
<xsl:param name="archiveDirParameter"/>
   <xsl:param name="archiveNameParameter"/>
   <xsl:param name="fileNameParameter"/>
   <xsl:param name="fileDirParameter"/>
   <xsl:variable name="document-uri">
      <xsl:value-of select="document-uri(/)"/>
   </xsl:variable>

   <!--PHASES-->


<!--PROLOG-->


<!--XSD TYPES FOR XSLT2-->


<!--KEYS AND FUNCTIONS-->


<!--DEFAULT RULES-->


<!--MODE: SCHEMATRON-SELECT-FULL-PATH-->
<!--This mode can be used to generate an ugly though full XPath for locators-->
<xsl:template match="*" mode="schematron-select-full-path">
      <xsl:apply-templates select="." mode="schematron-get-full-path"/>
   </xsl:template>

   <!--MODE: SCHEMATRON-FULL-PATH-->
<!--This mode can be used to generate an ugly though full XPath for locators-->
<xsl:template match="*" mode="schematron-get-full-path">
      <xsl:apply-templates select="parent::*" mode="schematron-get-full-path"/>
      <xsl:text>/</xsl:text>
      <xsl:choose>
         <xsl:when test="namespace-uri()=''">
            <xsl:value-of select="name()"/>
            <xsl:variable name="p_1" select="1+    count(preceding-sibling::*[name()=name(current())])"/>
            <xsl:if test="$p_1&gt;1 or following-sibling::*[name()=name(current())]">[<xsl:value-of select="$p_1"/>]</xsl:if>
         </xsl:when>
         <xsl:otherwise>
            <xsl:text>*[local-name()='</xsl:text>
            <xsl:value-of select="local-name()"/>
            <xsl:text>']</xsl:text>
            <xsl:variable name="p_2"
                          select="1+   count(preceding-sibling::*[local-name()=local-name(current())])"/>
            <xsl:if test="$p_2&gt;1 or following-sibling::*[local-name()=local-name(current())]">[<xsl:value-of select="$p_2"/>]</xsl:if>
         </xsl:otherwise>
      </xsl:choose>
   </xsl:template>
   <xsl:template match="@*" mode="schematron-get-full-path">
      <xsl:text>/</xsl:text>
      <xsl:choose>
         <xsl:when test="namespace-uri()=''">@<xsl:value-of select="name()"/>
         </xsl:when>
         <xsl:otherwise>
            <xsl:text>@*[local-name()='</xsl:text>
            <xsl:value-of select="local-name()"/>
            <xsl:text>' and namespace-uri()='</xsl:text>
            <xsl:value-of select="namespace-uri()"/>
            <xsl:text>']</xsl:text>
         </xsl:otherwise>
      </xsl:choose>
   </xsl:template>

   <!--MODE: SCHEMATRON-FULL-PATH-2-->
<!--This mode can be used to generate prefixed XPath for humans-->
<xsl:template match="node() | @*" mode="schematron-get-full-path-2">
      <xsl:for-each select="ancestor-or-self::*">
         <xsl:text>/</xsl:text>
         <xsl:value-of select="name(.)"/>
         <xsl:if test="preceding-sibling::*[name(.)=name(current())]">
            <xsl:text>[</xsl:text>
            <xsl:value-of select="count(preceding-sibling::*[name(.)=name(current())])+1"/>
            <xsl:text>]</xsl:text>
         </xsl:if>
      </xsl:for-each>
      <xsl:if test="not(self::*)">
         <xsl:text/>/@<xsl:value-of select="name(.)"/>
      </xsl:if>
   </xsl:template>
   <!--MODE: SCHEMATRON-FULL-PATH-3-->
<!--This mode can be used to generate prefixed XPath for humans 
	(Top-level element has index)-->
<xsl:template match="node() | @*" mode="schematron-get-full-path-3">
      <xsl:for-each select="ancestor-or-self::*">
         <xsl:text>/</xsl:text>
         <xsl:value-of select="name(.)"/>
         <xsl:if test="parent::*">
            <xsl:text>[</xsl:text>
            <xsl:value-of select="count(preceding-sibling::*[name(.)=name(current())])+1"/>
            <xsl:text>]</xsl:text>
         </xsl:if>
      </xsl:for-each>
      <xsl:if test="not(self::*)">
         <xsl:text/>/@<xsl:value-of select="name(.)"/>
      </xsl:if>
   </xsl:template>

   <!--MODE: GENERATE-ID-FROM-PATH -->
<xsl:template match="/" mode="generate-id-from-path"/>
   <xsl:template match="text()" mode="generate-id-from-path">
      <xsl:apply-templates select="parent::*" mode="generate-id-from-path"/>
      <xsl:value-of select="concat('.text-', 1+count(preceding-sibling::text()), '-')"/>
   </xsl:template>
   <xsl:template match="comment()" mode="generate-id-from-path">
      <xsl:apply-templates select="parent::*" mode="generate-id-from-path"/>
      <xsl:value-of select="concat('.comment-', 1+count(preceding-sibling::comment()), '-')"/>
   </xsl:template>
   <xsl:template match="processing-instruction()" mode="generate-id-from-path">
      <xsl:apply-templates select="parent::*" mode="generate-id-from-path"/>
      <xsl:value-of select="concat('.processing-instruction-', 1+count(preceding-sibling::processing-instruction()), '-')"/>
   </xsl:template>
   <xsl:template match="@*" mode="generate-id-from-path">
      <xsl:apply-templates select="parent::*" mode="generate-id-from-path"/>
      <xsl:value-of select="concat('.@', name())"/>
   </xsl:template>
   <xsl:template match="*" mode="generate-id-from-path" priority="-0.5">
      <xsl:apply-templates select="parent::*" mode="generate-id-from-path"/>
      <xsl:text>.</xsl:text>
      <xsl:value-of select="concat('.',name(),'-',1+count(preceding-sibling::*[name()=name(current())]),'-')"/>
   </xsl:template>

   <!--MODE: GENERATE-ID-2 -->
<xsl:template match="/" mode="generate-id-2">U</xsl:template>
   <xsl:template match="*" mode="generate-id-2" priority="2">
      <xsl:text>U</xsl:text>
      <xsl:number level="multiple" count="*"/>
   </xsl:template>
   <xsl:template match="node()" mode="generate-id-2">
      <xsl:text>U.</xsl:text>
      <xsl:number level="multiple" count="*"/>
      <xsl:text>n</xsl:text>
      <xsl:number count="node()"/>
   </xsl:template>
   <xsl:template match="@*" mode="generate-id-2">
      <xsl:text>U.</xsl:text>
      <xsl:number level="multiple" count="*"/>
      <xsl:text>_</xsl:text>
      <xsl:value-of select="string-length(local-name(.))"/>
      <xsl:text>_</xsl:text>
      <xsl:value-of select="translate(name(),':','.')"/>
   </xsl:template>
   <!--Strip characters--><xsl:template match="text()" priority="-1"/>

   <!--SCHEMA SETUP-->
<xsl:template match="/">
      <xsl:apply-templates select="/" mode="M0"/>
      <xsl:apply-templates select="/" mode="M1"/>
      <xsl:apply-templates select="/" mode="M19"/>
      <xsl:apply-templates select="/" mode="M20"/>
      <xsl:apply-templates select="/" mode="M21"/>
      <xsl:apply-templates select="/" mode="M22"/>
      <xsl:apply-templates select="/" mode="M23"/>
      <xsl:apply-templates select="/" mode="M24"/>
      <xsl:apply-templates select="/" mode="M25"/>
   </xsl:template>

   <!--SCHEMATRON PATTERNS-->


<!--PATTERN codes-->
<xsl:variable name="ProfileIDType" select="',TICARIFATURA,TEMELFATURA,YOLCUBERABERFATURA,'"/>
   <xsl:variable name="InvoiceTypeCodeList" select="',SATIS,IADE,'"/>
   <xsl:variable name="EnvelopeType"
                 select="',SENDERENVELOPE,POSTBOXENVELOPE,SYSTEMENVELOPE,USERENVELOPE,'"/>
   <xsl:variable name="ElementType"
                 select="',INVOICE,APPLICATIONRESPONSE,PROCESSUSERACCOUNT,CANCELUSERACCOUNT,'"/>
   <xsl:variable name="TaxType"
                 select="',0003,0015,0061,0071,0073,0074,0075,0076,0077,1047,1048,4080,4081,9015,9021,9077,8001,8002,8003,8004,8005,8006,8007,8008,9040,0011,'"/>
   <xsl:variable name="PartyIdentificationIDType"
                 select="',TCKN,VKN,HIZMETNO,MUSTERINO,TESISATNO,TELEFONNO,DISTRIBUTORNO,TICARETSICILNO,TAPDKNO,BAYINO,ABONENO,SAYACNO,EPDKNO,SUBENO,PASAPORTNO,ARACIKURUMETIKET,ARACIKURUMVKN,CIFTCINO,IMALATCINO,DOSYANO,HASTANO,MERSISNO,'"/>
   <xsl:variable name="ResponseCodeType" select="',KABUL,RED,IADE,S_APR,'"/>
   <xsl:variable name="ContactTypeIdentifierType" select="',UNVAN,VKN_TCKN,'"/>
   <xsl:variable name="CurrencyCodeList"
                 select="',AED,AFN,ALL,AMD,ANG,AOA,ARS,AUD,AWG,AZM,BAM,BBD,BDT,BGN,BHD,BIF,BMD,BND,BOB,BRL,BSD,BTN,BWP,BYR,BZD,CAD,CDF,CHF,CLP,CNY,COP,CRC,CUP,CVE,CYP,CZK,DJF,DKK,DOP,DZD,EEK,EGP,ERN,ETB,EUR,FJD,FKP,GBP,GEL,GHC,GIP,GMD,GNF,GTQ,GYD,HKD,HNL,HRK,HTG,HUF,IDR,ILS,INR,IQD,IRR,ISK,JMD,JOD,JPY,KES,KGS,KHR,KMF,KPW,KRW,KWD,KYD,KZT,LAK,LBP,LKR,LRD,LSL,LTL,LVL,LYD,MAD,MDL,MGF,MKD,MMK,MNT,MOP,MRO,MTL,MUR,MVR,MWK,MXN,MYR,MZM,NAD,NGN,NIO,NOK,NPR,NZD,OMR,PAB,PEN,PGK,PHP,PKR,PLN,PYG,QAR,ROL,RUB,RWF,SAR,SBD,SCR,SDD,SEK,SGD,SHP,SIT,SKK,SLL,SOS,SRG,STD,SVC,SYP,SZL,THB,TJS,TMM,TND,TOP,TRL,TTD,TWD,TZS,UAH,UGX,USD,UYU,UZS,VEB,VND,VUV,WST,XAF,XAG,XAU,XCD,XDR,XOF,XPD,XPF,XPT,YER,YUM,ZAR,ZMK,ZWD,'"/>
   <xsl:variable name="CountryCodeList"
                 select="',AF,AX,AL,DZ,AS,AD,AO,AI,AQ,AG,AR,AM,AW,AU,AT,AZ,BS,BH,BD,BB,BY,BE,BZ,BJ,BM,BT,BO,BA,BW,BV,BR,IO,BN,BG,BF,BI,KH,CM,CA,CV,KY,CF,TD,CL,CN,CX,CC,CO,KM,CG,CD,CK,CR,CI,HR,CU,CY,CZ,DK,DJ,DM,DO,EC,EG,SV,GQ,ER,EE,ET,FK,FO,FJ,FI,FR,GF,PF,TF,GA,GM,GE,DE,GH,GI,GR,GL,GD,GP,GU,GT,GG,GN,GW,GY,HT,HM,VA,HN,HK,HU,IS,IN,ID,IR,IQ,IE,IM,IL,IT,JM,JP,JE,JO,KZ,KE,KI,KP,KR,KW,KG,LA,LV,LB,LS,LR,LY,LI,LT,LU,MO,MK,MG,MW,MY,MV,ML,MT,MH,MQ,MR,MU,YT,MX,FM,MD,MC,MN,ME,MS,MA,MZ,MM,NA,NR,NP,NL,AN,NC,NZ,NI,NE,NG,NU,NF,MP,NO,OM,PK,PW,PS,PA,PG,PY,PE,PH,PN,PL,PT,PR,QA,RE,RO,RU,RW,BL,SH,KN,LC,MF,PM,VC,WS,SM,ST,SA,SN,RS,SC,SL,SG,SK,SI,SB,SO,ZA,GS,ES,LK,SD,SR,SJ,SZ,SE,CH,SY,TW,TJ,TZ,TH,TL,TG,TK,TO,TT,TN,TR,TM,TC,TV,UG,UA,AE,GB,US,UM,UY,UZ,VU,VE,VN,VG,VI,WF,EH,YE,ZM,ZW,'"/>
   <xsl:variable name="UserType" select="',1,2,11,12,'"/>
   <xsl:variable name="ReservedAliases" select="',usergb,GIB,archive'"/>
   <xsl:template match="text()" priority="-1" mode="M0"/>
   <xsl:template match="@*|node()" priority="-2" mode="M0">
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M0"/>
   </xsl:template>

   <!--PATTERN abstracts-->
<xsl:template match="text()" priority="-1" mode="M1"/>
   <xsl:template match="@*|node()" priority="-2" mode="M1">
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M1"/>
   </xsl:template>
   <xsl:param name="envelopeType"
              select="/sh:StandardBusinessDocument/sh:StandardBusinessDocumentHeader/sh:DocumentIdentification/sh:Type"/>
   <xsl:param name="senderId"
              select="/sh:StandardBusinessDocument/sh:StandardBusinessDocumentHeader/sh:Sender/sh:ContactInformation[sh:ContactTypeIdentifier = 'VKN_TCKN']/sh:Contact"/>
   <xsl:param name="senderAlias"
              select="/sh:StandardBusinessDocument/sh:StandardBusinessDocumentHeader/sh:Sender/sh:Identifier"/>
   <xsl:param name="receiverId"
              select="/sh:StandardBusinessDocument/sh:StandardBusinessDocumentHeader/sh:Receiver/sh:ContactInformation[sh:ContactTypeIdentifier = 'VKN_TCKN']/sh:Contact"/>
   <xsl:param name="receiverAlias"
              select="/sh:StandardBusinessDocument/sh:StandardBusinessDocumentHeader/sh:Receiver/sh:Identifier"/>
   <xsl:param name="responseCode"
              select="//apr:ApplicationResponse/cac:DocumentResponse/cac:Response/cbc:ResponseCode"/>

   <!--PATTERN document-->


	<!--RULE -->
<xsl:template match="sh:StandardBusinessDocument" priority="1000" mode="M19">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="sh:StandardBusinessDocumentHeader"/>
         <xsl:otherwise>sh:StandardBusinessDocumentHeader zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ef:Package"/>
         <xsl:otherwise>ef:Package zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M19"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M19"/>
   <xsl:template match="@*|node()" priority="-2" mode="M19">
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M19"/>
   </xsl:template>

   <!--PATTERN header-->


	<!--RULE -->
<xsl:template match="sh:StandardBusinessDocumentHeader" priority="1008" mode="M20">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="sh:HeaderVersion = '1.0'"/>
         <xsl:otherwise>Geçersiz sh:HeaderVersion elemanı değeri. sh:HeaderVersion elemanı '1.0' değerine eşit olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(sh:Sender) = 1"/>
         <xsl:otherwise>sh:Sender zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(sh:Receiver) = 1"/>
         <xsl:otherwise>sh:Receiver zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M20"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="sh:StandardBusinessDocumentHeader/sh:Sender/sh:Identifier"
                 priority="1007"
                 mode="M20">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="string-length(normalize-space(string(.))) != 0"/>
         <xsl:otherwise>Geçersiz <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı değeri. Boş olmayan bir değer içermelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M20"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="sh:StandardBusinessDocumentHeader/sh:Receiver/sh:Identifier"
                 priority="1006"
                 mode="M20">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="string-length(normalize-space(string(.))) != 0"/>
         <xsl:otherwise>Geçersiz <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı değeri. Boş olmayan bir değer içermelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M20"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="sh:StandardBusinessDocumentHeader/sh:Sender" priority="1005" mode="M20">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(sh:ContactInformation) &gt; 0"/>
         <xsl:otherwise>En az bir sh:ContactInformation elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(sh:ContactInformation[sh:ContactTypeIdentifier = 'VKN_TCKN']) = 1 "/>
         <xsl:otherwise>sh:ContactTypeIdentifier elemanı değeri 'VKN_TCKN' ye eşit olan bir tane sh:ContactInformation elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M20"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="sh:StandardBusinessDocumentHeader/sh:Receiver" priority="1004"
                 mode="M20">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(sh:ContactInformation) &gt; 0"/>
         <xsl:otherwise>En az bir sh:ContactInformation elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(sh:ContactInformation[sh:ContactTypeIdentifier = 'VKN_TCKN']) = 1 "/>
         <xsl:otherwise>sh:ContactTypeIdentifier elemanı değeri 'VKN_TCKN' ye eşit olan bir tane sh:ContactInformation elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M20"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="sh:StandardBusinessDocumentHeader/sh:Sender/sh:ContactInformation"
                 priority="1003"
                 mode="M20">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="sh:ContactTypeIdentifier"/>
         <xsl:otherwise>sh:ContactTypeIdentifier zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(sh:ContactTypeIdentifier) or contains($ContactTypeIdentifierType, concat(',',sh:ContactTypeIdentifier,','))"/>
         <xsl:otherwise>Geçersiz sh:ContactTypeIdentifier değeri : '<xsl:text/>
            <xsl:value-of select="sh:ContactTypeIdentifier"/>
            <xsl:text/>'. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(sh:ContactTypeIdentifier) or not(sh:ContactTypeIdentifier = 'VKN_TCKN') or string-length(sh:Contact) = 11 or string-length(sh:Contact) = 10"/>
         <xsl:otherwise>sh:ContactTypeIdentifier elemanın değeri 'VKN_TCKN' olması durumunda sh:Contact elemanına 10 haneli vergi kimlik numarası ve ya 11 haneli TC kimlik numarası yazılmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M20"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="sh:StandardBusinessDocumentHeader/sh:Receiver/sh:ContactInformation"
                 priority="1002"
                 mode="M20">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="sh:ContactTypeIdentifier"/>
         <xsl:otherwise>sh:ContactTypeIdentifier zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(sh:ContactTypeIdentifier) or contains($ContactTypeIdentifierType, concat(',',sh:ContactTypeIdentifier,','))"/>
         <xsl:otherwise>Geçersiz sh:ContactTypeIdentifier değeri : '<xsl:text/>
            <xsl:value-of select="sh:ContactTypeIdentifier"/>
            <xsl:text/>'. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(sh:ContactTypeIdentifier) or not(sh:ContactTypeIdentifier = 'VKN_TCKN') or string-length(sh:Contact) = 11 or string-length(sh:Contact) = 10"/>
         <xsl:otherwise>sh:ContactTypeIdentifier elemanın değeri 'VKN_TCKN' olması durumunda sh:Contact elemanına 10 haneli vergi kimlik numarası ve ya 11 haneli TC kimlik numarası yazılmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M20"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="sh:StandardBusinessDocumentHeader/sh:DocumentIdentification"
                 priority="1001"
                 mode="M20">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="sh:TypeVersion = '1.0'"/>
         <xsl:otherwise>Geçersiz sh:TypeVersion elemanı değeri. sh:TypeVersion '1.0' değerine eşit olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="contains($EnvelopeType, concat(',',sh:Type,','))"/>
         <xsl:otherwise>Geçersiz zarf türü : '<xsl:text/>
            <xsl:value-of select="sh:Type"/>
            <xsl:text/>'. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(sh:Type = 'SENDERENVELOPE') or not(//ElementType != 'INVOICE')"/>
         <xsl:otherwise>SENDERENVELOPE türündeki zarf Invoice şemasında göre oluşturulmuş belge taşımalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(sh:Type = 'POSTBOXENVELOPE') or not(//ElementType != 'APPLICATIONRESPONSE')"/>
         <xsl:otherwise>POSTBOXENVELOPE türündeki zarf ApplicationResponse şemasında göre oluşturulmuş belge taşımalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(sh:Type = 'SYSTEMENVELOPE') or not(//ElementType != 'APPLICATIONRESPONSE')"/>
         <xsl:otherwise>SYSTEMENVELOPE türündeki zarf ApplicationResponse şemasına göre oluşturulmuş belge taşımalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(sh:Type = 'USERENVELOPE') or (//ElementType = 'PROCESSUSERACCOUNT' or //ElementType = 'CANCELUSERACCOUNT')"/>
         <xsl:otherwise>USERENVELOPE türündeki zarf ProcessUserAccount ve ya CancelUserAccount şemasına göre oluşturulmuş belge taşımalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(sh:Type = 'USERENVELOPE') or ($receiverId = '3900383669' and $receiverAlias = 'GIB')"/>
         <xsl:otherwise>USERENVELOPE türündeki zarfı yalnızca 3900383669 vergi kimlik numaralı ve GIB etiketli kullanıcıya gönderebilirsiniz.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(sh:Type = 'USERENVELOPE') or ($senderAlias = 'usergb' or $senderAlias = 'archive')"/>
         <xsl:otherwise>USERENVELOPE türündeki zarfı yalnızca 'usergb' ve ya 'archive' etiketine sahip kullanıcı gönderebilir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M20"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="sh:StandardBusinessDocumentHeader/sh:DocumentIdentification/sh:InstanceIdentifier"
                 priority="1000"
                 mode="M20">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="matches(.,'^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$')"/>
         <xsl:otherwise>Geçersiz <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı değeri. <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı UUID formatında olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M20"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M20"/>
   <xsl:template match="@*|node()" priority="-2" mode="M20">
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M20"/>
   </xsl:template>

   <!--PATTERN package-->


	<!--RULE -->
<xsl:template match="ef:Package" priority="1001" mode="M21">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(Elements) &lt; 11"/>
         <xsl:otherwise>ef:Package elemanı içerisinde en fazla 10 tane Elements elemanı olabilir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M21"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="ef:Package/Elements" priority="1000" mode="M21">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="contains($ElementType, concat(',',ElementType,','))"/>
         <xsl:otherwise>Geçersiz  ElementType değeri : '<xsl:text/>
            <xsl:value-of select="ElementType"/>
            <xsl:text/>'. Geçerli ElementType değerleri için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ElementCount &lt; 1001"/>
         <xsl:otherwise>ElementCount elemanın değeri en fazla 1000 olabilir..<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(ElementList/*) = ElementCount "/>
         <xsl:otherwise>ElementList elemanı içersinde bulunan eleman sayısı ElementCount elemanı değerine eşit olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ElementType='INVOICE') or count(ElementList/inv:Invoice)=ElementCount"/>
         <xsl:otherwise>ElementList elemanı içerisinde bulunan inv:Invoice elemanı sayısı ElementCount elemanı değerine eşit olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ElementType='APPLICATIONRESPONSE') or count(ElementList/apr:ApplicationResponse)=ElementCount"/>
         <xsl:otherwise>ElementList elemanı içerisinde bulunan apr:ApplicationResponse elemanı sayısı ElementCount elemanı değerine eşit olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ElementType='PROCESSUSERACCOUNT') or count(ElementList/hr:ProcessUserAccount)=ElementCount"/>
         <xsl:otherwise>ElementList elemanı içerisinde bulunan hr:ProcessUserAccount elemanı sayısı ElementCount elemanı değerine eşit olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ElementType='CANCELUSERACCOUNT') or count(ElementList/hr:CancelUserAccount)=ElementCount"/>
         <xsl:otherwise>ElementList elemanı içerisinde bulunan hr:CancelUserAccount elemanı sayısı ElementCount elemanı değerine eşit olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ElementType='INVOICE') or count(ElementList/inv:Invoice) &lt; 101 "/>
         <xsl:otherwise>ElementList elemanı içerisinde bulunan inv:Invoice elemanı sayısı 100'den fazla olamaz.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M21"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M21"/>
   <xsl:template match="@*|node()" priority="-2" mode="M21">
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M21"/>
   </xsl:template>

   <!--PATTERN invoice-->


	<!--RULE -->
<xsl:template match="inv:Invoice/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/ds:Signature"
                 priority="1023"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:SignedInfo/ds:Reference/ds:Transforms"/>
         <xsl:otherwise>ds:SignedInfo/ds:Reference/ds:Transforms elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:KeyInfo"/>
         <xsl:otherwise>ds:KeyInfo elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:KeyInfo) or ds:KeyInfo/ds:X509Data"/>
         <xsl:otherwise>ds:KeyInfo elemanı içerisindeki ds:X509Data elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:Object"/>
         <xsl:otherwise>ds:Object elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:Object) or ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningTime"/>
         <xsl:otherwise>xades:SigningTime elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:Object) or ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningCertificate"/>
         <xsl:otherwise>xades:SigningCertificate elemanı zorunlu bir elemandır<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(ds:SignedInfo/ds:Reference[@URI = '']) = 1 "/>
         <xsl:otherwise>ds:SignedInfo elamanı içerisinde URI niteliği boşluğa("") eşit olan sadece bir tane ds:Reference elemanı bulunmaldır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/ds:Signature/ds:KeyInfo/ds:X509Data"
                 priority="1022"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:X509Certificate"/>
         <xsl:otherwise>ds:X509Data elemanı içerisindeki ds:X509Certificate elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/ds:Signature/ds:KeyInfo/ds:X509Data/ds:X509SubjectName"
                 priority="1021"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="string-length(normalize-space(.)) != 0 "/>
         <xsl:otherwise> ds:X509SubjectName elemanının değeri boşluk olmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice" priority="1020" mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="cbc:UBLVersionID = '2.0'"/>
         <xsl:otherwise>Geçersiz cbc:UBLVersionID elemanı değeri : '<xsl:text/>
            <xsl:value-of select="cbc:UBLVersionID"/>
            <xsl:text/>'. cbc:UBLVersionID değeri '2.0' olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="cbc:CustomizationID = 'TR1.0'"/>
         <xsl:otherwise>Geçersiz cbc:CustomizationID elemanı değeri : '<xsl:text/>
            <xsl:value-of select="cbc:CustomizationID"/>
            <xsl:text/>' cbc:CustomizationID elemanı değeri 'TR1.0' olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="contains($ProfileIDType, concat(',',cbc:ProfileID,','))"/>
         <xsl:otherwise>Geçersiz cbc:ProfileID elemanı değeri : '<xsl:text/>
            <xsl:value-of select="cbc:ProfileID"/>
            <xsl:text/>'. Geçerli cbc:ProfileID değerleri için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="matches(cbc:ID,'^[A-Za-z0-9]{3}20[0-9]{2}[0-9]{9}$')"/>
         <xsl:otherwise>Geçersiz cbc:ID elemanı değeri. cbc:ID elemanı 'ABC2009123456789' formatında olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="cbc:CopyIndicator = 'false'"/>
         <xsl:otherwise>Geçersiz cbc:CopyIndicator elemanı değeri. cbc:CopyIndicator elemanı 'false' değerine eşit olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="xs:date(cbc:IssueDate) le xs:date(current-date())"/>
         <xsl:otherwise>İleri tarihe ait fatura düzenlenemez.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="xs:date('2005-01-01+02:00')  le xs:date(cbc:IssueDate)"/>
         <xsl:otherwise>01.01.2005 tarihinden öncesine ait fatura düzenlenemez.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="contains($InvoiceTypeCodeList, concat(',',cbc:InvoiceTypeCode,','))"/>
         <xsl:otherwise>Geçersiz cbc:InvoiceTypeCode elemanı değeri : '<xsl:text/>
            <xsl:value-of select="cbc:InvoiceTypeCode"/>
            <xsl:text/>'. Geçerli cbc:InvoiceTypeCode değerleri için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="contains($CurrencyCodeList, concat(',',cbc:DocumentCurrencyCode,','))"/>
         <xsl:otherwise>Geçersiz cbc:DocumentCurrencyCode elemanı değeri. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:TaxCurrencyCode) or contains($CurrencyCodeList, concat(',',cbc:TaxCurrencyCode,','))"/>
         <xsl:otherwise>Geçersiz cbc:TaxCurrencyCode elemanı değeri. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:PricingCurrencyCode) or contains($CurrencyCodeList, concat(',',cbc:PricingCurrencyCode,','))"/>
         <xsl:otherwise>Geçersiz cbc:PricingCurrencyCode elemanı değeri. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:PaymentCurrencyCode) or contains($CurrencyCodeList, concat(',',cbc:PaymentCurrencyCode,','))"/>
         <xsl:otherwise>Geçersiz cbc:PaymentCurrencyCode elemanı değeri. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:PaymentAlternativeCurrencyCode) or contains($CurrencyCodeList, concat(',',cbc:PaymentAlternativeCurrencyCode,','))"/>
         <xsl:otherwise>Geçersiz cbc:PaymentAlternativeCurrencyCode elemanı değeri. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(//cbc:SourceCurrencyCode) or contains($CurrencyCodeList,concat(',',//cbc:SourceCurrencyCode,','))"/>
         <xsl:otherwise>Geçersiz cbc:SourceCurrencyCode elemanı değeri. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(//cbc:TargetCurrencyCode) or contains($CurrencyCodeList,concat(',',//cbc:TargetCurrencyCode,','))"/>
         <xsl:otherwise>Geçersiz cbc:TargetCurrencyCode elemanı değeri. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(//cbc:CurrencyCode) or contains($CurrencyCodeList,concat(',',//cbc:CurrencyCode,','))"/>
         <xsl:otherwise>Geçersiz cbc:CurrencyCode elemanı değeri. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(//cbc:IdentificationCode) or contains($CountryCodeList,concat(',',//cbc:IdentificationCode,','))"/>
         <xsl:otherwise>Geçersiz cbc:IdentificationCode elemanı değeri. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(cac:Signature) &lt;= 1"/>
         <xsl:otherwise>En fazla bir tane cac:Signature elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cbc:UUID" priority="1019" mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="matches(.,'^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$')"/>
         <xsl:otherwise>Geçersiz <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı değeri. <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı UUID formatında olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:Signature" priority="1018" mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="cbc:ID/@schemeID='VKN_TCKN'"/>
         <xsl:otherwise>cac:Signature elemanı içerisindeki cbc:ID elemanının schemeID niteliği değeri 'VKN_TCKN' olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='VKN_TCKN') or string-length(cbc:ID) = 11 or string-length(cbc:ID) = 10"/>
         <xsl:otherwise>schemeID niteliği 'VKN_TCKN' ye eşit olan elemanın uzunluğu vergi kimlik numarası için 10 karakter TC kimlik numrası için 11 karakter olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID"
                 priority="1017"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="contains($PartyIdentificationIDType, concat(',',@schemeID,','))"/>
         <xsl:otherwise>Geçersiz schemeID niteliği : '<xsl:text/>
            <xsl:value-of select="@schemeID"/>
            <xsl:text/>'. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification"
                 priority="1016"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='VKN') or string-length(cbc:ID)=10"/>
         <xsl:otherwise>cbc:ID elemanının schemeID niteliği değeri 'VKN' olması durumunda cbc:ID elemanına 10 haneli vergi kimlik numarası yazılmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='TCKN') or string-length(cbc:ID)=11"/>
         <xsl:otherwise>cbc:ID elemanının schemeID niteliği değeri 'TCKN' olması durumunda cbc:ID elemanına 11 haneli TC kimlik numarası yazılmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='VKN') or not(string-length(cbc:ID)=10) or not($senderId) or $senderId = cbc:ID"/>
         <xsl:otherwise>Zarfı gönderen kullanıcı(<xsl:text/>
            <xsl:value-of select="$senderId"/>
            <xsl:text/>) ile faturayı düzenleyen kullanıcı(<xsl:text/>
            <xsl:value-of select="cbc:ID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='TCKN') or not(string-length(cbc:ID)=11) or not($senderId) or $senderId = cbc:ID"/>
         <xsl:otherwise>Zarfı gönderen kullanıcı(<xsl:text/>
            <xsl:value-of select="$senderId"/>
            <xsl:text/>) ile faturayı düzenleyen kullanıcı(<xsl:text/>
            <xsl:value-of select="cbc:ID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:AccountingSupplierParty/cac:Party" priority="1015"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(cac:PartyIdentification/cbc:ID[@schemeID='TCKN'])=1 or count(cac:PartyIdentification/cbc:ID[@schemeID='VKN'])=1"/>
         <xsl:otherwise>schemeID niteliği değeri 'VKN' ve ya 'TCKN' olan bir tane cbc:ID elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(cac:PartyIdentification/cbc:ID[@schemeID='TCKN'])=1 and count(cac:PartyIdentification/cbc:ID[@schemeID='VKN'])=1)"/>
         <xsl:otherwise>schemeID niteliği değeri hem 'VKN' hem de 'TCKN' olan cbc:ID elemanları bulunmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cac:PartyIdentification/cbc:ID/@schemeID='VKN') or cac:PartyName"/>
         <xsl:otherwise>schemeID niteliği değeri 'VKN' olması durumunda cac:PartyName elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cac:PartyIdentification/cbc:ID/@schemeID='VKN') or not(cac:PartyName) or string-length(normalize-space(string(cac:PartyName/cbc:Name))) != 0"/>
         <xsl:otherwise>cac:PartyName elemanı geçerli ve boş değer içermeyen cbc:Name elemanı içermelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cac:PartyIdentification/cbc:ID/@schemeID='TCKN') or cac:Person"/>
         <xsl:otherwise>schemeID niteliği değeri 'TCKN' olması durumunda cac:Person elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cac:PartyIdentification/cbc:ID/@schemeID='TCKN') or not(cac:Person) or (string-length(normalize-space(string(cac:Person/cbc:FirstName))) != 0   and string-length(normalize-space(string(cac:Person/cbc:FamilyName))) != 0)"/>
         <xsl:otherwise>cac:Person elemanı geçerli ve boş değer içermeyen cbc:FirstName ve cbc:FamilyName elemanlarına sahip olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID"
                 priority="1014"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="contains($PartyIdentificationIDType, concat(',',@schemeID,','))"/>
         <xsl:otherwise>Geçersiz schemeID niteliği : '<xsl:text/>
            <xsl:value-of select="@schemeID"/>
            <xsl:text/>'. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification"
                 priority="1013"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='VKN') or string-length(cbc:ID)=10"/>
         <xsl:otherwise>cbc:ID elemanının schemeID niteliği değeri 'VKN' olması durumunda cbc:ID elemanına 10 haneli vergi kimlik numarası yazılmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='TCKN') or string-length(cbc:ID)=11"/>
         <xsl:otherwise>cbc:ID elemanının schemeID niteliği değeri 'TCKN' olması durumunda cbc:ID elemanına 11 haneli TC kimlik numarası yazılmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='VKN') or not(string-length(cbc:ID)=10) or not($receiverId) or $receiverId = cbc:ID"/>
         <xsl:otherwise>Zarfı alan kullanıcı(<xsl:text/>
            <xsl:value-of select="$receiverId"/>
            <xsl:text/>) ile faturayı alan kullanıcı(<xsl:text/>
            <xsl:value-of select="cbc:ID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='TCKN') or not(string-length(cbc:ID)=11) or not($receiverId) or $receiverId = cbc:ID"/>
         <xsl:otherwise>Zarfı alan kullanıcı(<xsl:text/>
            <xsl:value-of select="$receiverId"/>
            <xsl:text/>) ile faturayı alan kullanıcı(<xsl:text/>
            <xsl:value-of select="cbc:ID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:AccountingCustomerParty/cac:Party" priority="1012"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(cac:PartyIdentification/cbc:ID[@schemeID='TCKN'])=1 or count(cac:PartyIdentification/cbc:ID[@schemeID='VKN'])=1"/>
         <xsl:otherwise>schemeID niteliği değeri 'VKN' ve ya 'TCKN' olan bir tane cbc:ID elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(cac:PartyIdentification/cbc:ID[@schemeID='TCKN'])=1 and count(cac:PartyIdentification/cbc:ID[@schemeID='VKN'])=1)"/>
         <xsl:otherwise>schemeID niteliği değeri hem 'VKN' hem de 'TCKN' olan cbc:ID elemanları bulunmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cac:PartyIdentification/cbc:ID/@schemeID='VKN') or cac:PartyName"/>
         <xsl:otherwise>schemeID niteliği değeri 'VKN' olması durumunda cac:PartyName elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cac:PartyIdentification/cbc:ID/@schemeID='VKN') or not(cac:PartyName) or string-length(normalize-space(string(cac:PartyName/cbc:Name))) != 0"/>
         <xsl:otherwise>cac:PartyName elemanı geçerli ve boş değer içermeyen cbc:Name elemanı içermelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cac:PartyIdentification/cbc:ID/@schemeID='TCKN') or cac:Person"/>
         <xsl:otherwise>schemeID niteliği değeri 'TCKN' olması durumunda cac:Person elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cac:PartyIdentification/cbc:ID/@schemeID='TCKN') or not(cac:Person) or (string-length(normalize-space(string(cac:Person/cbc:FirstName))) != 0   and string-length(normalize-space(string(cac:Person/cbc:FamilyName))) != 0)"/>
         <xsl:otherwise>cac:Person elemanı geçerli ve boş değer içermeyen cbc:FirstName ve cbc:FamilyName elemanlarına sahip olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode"
                 priority="1011"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="contains($TaxType, concat(',',.,','))"/>
         <xsl:otherwise>Geçersiz  cbc:TaxTypeCode değeri : '<xsl:text/>
            <xsl:value-of select="."/>
            <xsl:text/>'. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:InvoiceLine/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode"
                 priority="1010"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="contains($TaxType, concat(',',.,','))"/>
         <xsl:otherwise>Geçersiz  cbc:TaxTypeCode değeri : '<xsl:text/>
            <xsl:value-of select="."/>
            <xsl:text/>'. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:TaxTotal/cac:TaxSubtotal" priority="1009" mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:TaxAmount = 0) or not(cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '0015') or string-length(normalize-space(cac:TaxCategory/cbc:TaxExemptionReason)) &gt; 0 "/>
         <xsl:otherwise>Vergi miktarı 0 olan 0015 vergi kodlu KDV için cbc:TaxExemptionReason(vergi istisna muhafiyet sebebi) elemanı bulunmalıdır ve boş değer içermemelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:InvoiceLine/cac:TaxTotal/cac:TaxSubtotal"
                 priority="1008"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:TaxAmount = 0) or not(cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '0015') or string-length(normalize-space(cac:TaxCategory/cbc:TaxExemptionReason)) &gt; 0 "/>
         <xsl:otherwise>Vergi miktarı 0 olan 0015 vergi kodlu KDV için cbc:TaxExemptionReason(vergi istisna muhafiyet sebebi) elemanı bulunmalıdır ve boş değer içermemelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount"
                 priority="1007"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="matches(.,'^(\s)*?[0-9][0-9]{0,16}(,[0-9]{3})*(\.[0-9]{1,2}(\s)*?)?(\s)*?$')"/>
         <xsl:otherwise>Geçersiz <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı değeri. <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı noktadan önce en fazla 15 , noktadan sonra(kuruş) en fazla 2 haneli olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount"
                 priority="1006"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="matches(.,'^(\s)*?[0-9][0-9]{0,16}(,[0-9]{3})*(\.[0-9]{1,2}(\s)*?)?(\s)*?$')"/>
         <xsl:otherwise>Geçersiz <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı değeri. <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı noktadan önce en fazla 15 , noktadan sonra(kuruş) en fazla 2 haneli olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount"
                 priority="1005"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="matches(.,'^(\s)*?[0-9][0-9]{0,16}(,[0-9]{3})*(\.[0-9]{1,2}(\s)*?)?(\s)*?$')"/>
         <xsl:otherwise>Geçersiz <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı değeri. <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı noktadan önce en fazla 15 , noktadan sonra(kuruş) en fazla 2 haneli olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount"
                 priority="1004"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="matches(.,'^(\s)*?[0-9][0-9]{0,16}(,[0-9]{3})*(\.[0-9]{1,2}(\s)*?)?(\s)*?$')"/>
         <xsl:otherwise>Geçersiz <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı değeri. <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı noktadan önce en fazla 15 , noktadan sonra(kuruş) en fazla 2 haneli olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount" priority="1003"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="matches(.,'^(\s)*?[0-9][0-9]{0,16}(,[0-9]{3})*(\.[0-9]{1,2}(\s)*?)?(\s)*?$')"/>
         <xsl:otherwise>Geçersiz <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı değeri. <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı noktadan önce en fazla 15 , noktadan sonra(kuruş) en fazla 2 haneli olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/ds:Signature/ds:SignedInfo/ds:Reference/ds:Transforms"
                 priority="1002"
                 mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(ds:Transform) &lt;= 1"/>
         <xsl:otherwise>ds:Transforms elemanı içerisinde en fazla bir tane ds:Transform elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:TaxTotal/cbc:TaxAmount" priority="1001" mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="matches(.,'^(\s)*?[0-9][0-9]{0,16}(,[0-9]{3})*(\.[0-9]{1,2}(\s)*?)?(\s)*?$')"/>
         <xsl:otherwise>Geçersiz <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı değeri. <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı noktadan önce en fazla 15 , noktadan sonra(kuruş) en fazla 2 haneli olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="inv:Invoice/cac:Signature/cac:SignatoryParty" priority="1000" mode="M22">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(cac:PartyIdentification/cbc:ID[@schemeID='TCKN']) &gt; 0 or count(cac:PartyIdentification/cbc:ID[@schemeID='VKN']) &gt; 0"/>
         <xsl:otherwise>cac:SignatoryParty alanı schemeID niteliği değeri 'VKN' veya 'TCKN' olan en az bir cac:PartyIdentification/cbc:ID elemanı içermelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M22"/>
   <xsl:template match="@*|node()" priority="-2" mode="M22">
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M22"/>
   </xsl:template>

   <!--PATTERN applicationresponse-->


	<!--RULE -->
<xsl:template match="apr:ApplicationResponse/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/ds:Signature"
                 priority="1014"
                 mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:SignedInfo/ds:Reference/ds:Transforms"/>
         <xsl:otherwise>ds:SignedInfo/ds:Reference/ds:Transforms elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:KeyInfo"/>
         <xsl:otherwise>ds:KeyInfo elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:KeyInfo) or ds:KeyInfo/ds:X509Data"/>
         <xsl:otherwise>ds:KeyInfo elemanı içerisindeki ds:X509Data elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:Object"/>
         <xsl:otherwise>ds:Object elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:Object) or ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningTime"/>
         <xsl:otherwise>xades:SigningTime elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:Object) or ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningCertificate"/>
         <xsl:otherwise>xades:SigningCertificate elemanı zorunlu bir elemandır<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/ds:Signature/ds:KeyInfo/ds:X509Data"
                 priority="1013"
                 mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:X509Certificate"/>
         <xsl:otherwise>ds:X509Data elemanı içerisindeki ds:X509Certificate elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/ds:Signature/ds:KeyInfo/ds:X509Data/ds:X509SubjectName"
                 priority="1012"
                 mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="string-length(normalize-space(.)) != 0 "/>
         <xsl:otherwise> ds:X509SubjectName elemanının değeri boşluk olmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse" priority="1011" mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="cbc:UBLVersionID = '2.0'"/>
         <xsl:otherwise>Geçersiz cbc:UBLVersionID elemanı değeri : '<xsl:text/>
            <xsl:value-of select="cbc:UBLVersionID"/>
            <xsl:text/>'. cbc:UBLVersionID değeri '2.0' olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="cbc:CustomizationID = 'TR1.0'"/>
         <xsl:otherwise>Geçersiz cbc:CustomizationID elemanı değeri : '<xsl:text/>
            <xsl:value-of select="cbc:CustomizationID"/>
            <xsl:text/>' cbc:CustomizationID elemanı değeri 'TR1.0' olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'S_APR') or cbc:ProfileID = 'UBL-TR-PROFILE-1'"/>
         <xsl:otherwise>Sistem yanıtı için cbc:ProfileID  elemanı değeri 'UBL-TR-PROFILE-1' olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or cbc:ProfileID = 'TICARIFATURA'"/>
         <xsl:otherwise>Uygulama yanıtı için cbc:ProfileID  elemanı değeri 'TICARIFATURA' olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="string-length(normalize-space(string(cbc:ID))) != 0"/>
         <xsl:otherwise>Geçersiz cbc:ID elemanı değeri. cbc:ID elemanı boş olamaz.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(//cbc:IdentificationCode) or contains($CountryCodeList,concat(',',//cbc:IdentificationCode,','))"/>
         <xsl:otherwise>Geçersiz cbc:IdentificationCode elemanı değeri. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or cac:Signature"/>
         <xsl:otherwise>Uygulama yanıtı için cac:Signature elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or ext:UBLExtensions"/>
         <xsl:otherwise>Uygulama yanıtı için imza bilgisinin konulduğu ext:UBLExtensions elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(cac:DocumentResponse) = 1"/>
         <xsl:otherwise>cac:DocumentResponse elemanından bir tane olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(cac:Signature) &lt;= 1"/>
         <xsl:otherwise>En fazla bir tane cac:Signature elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/cac:Signature" priority="1010" mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="cbc:ID/@schemeID='VKN_TCKN'"/>
         <xsl:otherwise>cac:Signature elemanı içerisindeki cbc:ID elemanının schemeID niteliği değeri 'VKN_TCKN' olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='VKN_TCKN') or string-length(cbc:ID) = 11 or string-length(cbc:ID) = 10"/>
         <xsl:otherwise>schemeID niteliği 'VKN_TCKN' ye eşit olan elemanın uzunluğu vergi kimlik numarası için 10 karakter TC kimlik numrası için 11 karakter olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/cbc:UUID" priority="1009" mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="matches(.,'^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$')"/>
         <xsl:otherwise>Geçersiz <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı değeri. <xsl:text/>
            <xsl:value-of select="name(.)"/>
            <xsl:text/> elemanı UUID formatında olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/cac:SenderParty/cac:PartyIdentification/cbc:ID"
                 priority="1008"
                 mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="contains($PartyIdentificationIDType, concat(',',@schemeID,','))"/>
         <xsl:otherwise>Geçersiz schemeID niteliği : '<xsl:text/>
            <xsl:value-of select="@schemeID"/>
            <xsl:text/>'. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/cac:SenderParty/cac:PartyIdentification"
                 priority="1007"
                 mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='VKN') or string-length(cbc:ID)=10"/>
         <xsl:otherwise>cbc:ID elemanının schemeID niteliği değeri 'VKN' olması durumunda cbc:ID elemanına 10 haneli vergi kimlik numarası yazılmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='TCKN') or string-length(cbc:ID)=11"/>
         <xsl:otherwise>cbc:ID elemanının schemeID niteliği değeri 'TCKN' olması durumunda cbc:ID elemanına 11 haneli TC kimlik numarası yazılmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'S_APR') or not(cbc:ID/@schemeID='VKN') or not(string-length(cbc:ID)=10) or not($senderId) or $senderId = cbc:ID"/>
         <xsl:otherwise>Zarfı gönderen kullanıcı(<xsl:text/>
            <xsl:value-of select="$senderId"/>
            <xsl:text/>) ile sistem yanıtınını düzenleyen kullanıcı(<xsl:text/>
            <xsl:value-of select="cbc:ID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'S_APR') or not(cbc:ID/@schemeID='TCKN') or not(string-length(cbc:ID)=11) or not($senderId) or $senderId = cbc:ID"/>
         <xsl:otherwise>Zarfı gönderen kullanıcı(<xsl:text/>
            <xsl:value-of select="$senderId"/>
            <xsl:text/>) ile sistem yanıtınını düzenleyen kullanıcı(<xsl:text/>
            <xsl:value-of select="cbc:ID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or not(cbc:ID/@schemeID='VKN') or not(string-length(cbc:ID)=10) or not($senderId) or $senderId = cbc:ID"/>
         <xsl:otherwise>Zarfı gönderen kullanıcı(<xsl:text/>
            <xsl:value-of select="$senderId"/>
            <xsl:text/>) ile uygulama yanıtınını düzenleyen kullanıcı(<xsl:text/>
            <xsl:value-of select="cbc:ID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or not(cbc:ID/@schemeID='TCKN') or not(string-length(cbc:ID)=11) or not($senderId) or $senderId = cbc:ID"/>
         <xsl:otherwise>Zarfı gönderen kullanıcı(<xsl:text/>
            <xsl:value-of select="$senderId"/>
            <xsl:text/>) ile uygulama yanıtınını düzenleyen kullanıcı(<xsl:text/>
            <xsl:value-of select="cbc:ID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/cac:SenderParty" priority="1006" mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(cac:PartyIdentification/cbc:ID[@schemeID='TCKN'])=1 or count(cac:PartyIdentification/cbc:ID[@schemeID='VKN'])=1"/>
         <xsl:otherwise>schemeID niteliği değeri 'VKN' ve ya 'TCKN' olan bir tane cbc:ID elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(cac:PartyIdentification/cbc:ID[@schemeID='TCKN'])=1 and count(cac:PartyIdentification/cbc:ID[@schemeID='VKN'])=1)"/>
         <xsl:otherwise>schemeID niteliği değeri hem 'VKN' hem de 'TCKN' olan cbc:ID elemanları bulunmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or not(cac:PartyIdentification/cbc:ID/@schemeID='VKN') or cac:PartyName"/>
         <xsl:otherwise>schemeID niteliği değeri 'VKN' olması durumunda cac:PartyName elemanı bulunmalıdır<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or not(cac:PartyIdentification/cbc:ID/@schemeID='VKN') or not(cac:PartyName) or string-length(normalize-space(string(cac:PartyName/cbc:Name))) != 0"/>
         <xsl:otherwise>cac:PartyName elemanı geçerli ve boş değer içermeyen cbc:Name elemanı içermelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or not(cac:PartyIdentification/cbc:ID/@schemeID='TCKN') or cac:Person"/>
         <xsl:otherwise>schemeID niteliği değeri 'TCKN' olması durumunda cac:Person elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or not(cac:PartyIdentification/cbc:ID/@schemeID='TCKN') or not(cac:Person) or (string-length(normalize-space(string(cac:Person/cbc:FirstName))) != 0   and string-length(normalize-space(string(cac:Person/cbc:FamilyName))) != 0)"/>
         <xsl:otherwise>cac:Person elemanı geçerli ve boş değer içermeyen cbc:FirstName ve cbc:FamilyName elemanlarına sahip olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/cac:ReceiverParty/cac:PartyIdentification/cbc:ID"
                 priority="1005"
                 mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="contains($PartyIdentificationIDType, concat(',',@schemeID,','))"/>
         <xsl:otherwise>Geçersiz schemeID niteliği : '<xsl:text/>
            <xsl:value-of select="@schemeID"/>
            <xsl:text/>'. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/cac:ReceiverParty/cac:PartyIdentification"
                 priority="1004"
                 mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='VKN') or string-length(cbc:ID)=10"/>
         <xsl:otherwise>cbc:ID elemanının schemeID niteliği değeri 'VKN' olması durumunda cbc:ID elemanına 10 haneli vergi kimlik numarası yazılmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ID/@schemeID='TCKN') or string-length(cbc:ID)=11"/>
         <xsl:otherwise>cbc:ID elemanının schemeID niteliği değeri 'TCKN' olması durumunda cbc:ID elemanına 11 haneli TC kimlik numarası yazılmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'S_APR') or not(cbc:ID/@schemeID='VKN') or not(string-length(cbc:ID)=10) or not($receiverId) or $receiverId = cbc:ID"/>
         <xsl:otherwise>Zarfı alan kullanıcı(<xsl:text/>
            <xsl:value-of select="$receiverId"/>
            <xsl:text/>) ile sistem yanıtınını alan kullanıcı(<xsl:text/>
            <xsl:value-of select="cbc:ID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'S_APR') or not(cbc:ID/@schemeID='TCKN') or not(string-length(cbc:ID)=11) or not($receiverId) or $receiverId = cbc:ID"/>
         <xsl:otherwise>Zarfı alan kullanıcı(<xsl:text/>
            <xsl:value-of select="$receiverId"/>
            <xsl:text/>) ile sistem yanıtınını alan kullanıcı(<xsl:text/>
            <xsl:value-of select="cbc:ID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or not(cbc:ID/@schemeID='VKN') or not(string-length(cbc:ID)=10) or not($receiverId) or $receiverId = cbc:ID"/>
         <xsl:otherwise>Zarfı alan kullanıcı(<xsl:text/>
            <xsl:value-of select="$receiverId"/>
            <xsl:text/>) ile uygulama yanıtınını alan kullanıcı(<xsl:text/>
            <xsl:value-of select="cbc:ID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or not(cbc:ID/@schemeID='TCKN') or not(string-length(cbc:ID)=11) or not($receiverId) or $receiverId = cbc:ID"/>
         <xsl:otherwise>Zarfı alan kullanıcı(<xsl:text/>
            <xsl:value-of select="$receiverId"/>
            <xsl:text/>) ile uygulama yanıtınını alan kullanıcı(<xsl:text/>
            <xsl:value-of select="cbc:ID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/cac:ReceiverParty" priority="1003" mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(cac:PartyIdentification/cbc:ID[@schemeID='TCKN'])=1 or count(cac:PartyIdentification/cbc:ID[@schemeID='VKN'])=1"/>
         <xsl:otherwise>schemeID niteliği değeri 'VKN' ve ya 'TCKN' olan bir tane cbc:ID elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(cac:PartyIdentification/cbc:ID[@schemeID='TCKN'])=1 and count(cac:PartyIdentification/cbc:ID[@schemeID='VKN'])=1)"/>
         <xsl:otherwise>schemeID niteliği değeri hem 'VKN' hem de 'TCKN' olan cbc:ID elemanları bulunmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or not(cac:PartyIdentification/cbc:ID/@schemeID='VKN') or cac:PartyName"/>
         <xsl:otherwise>schemeID niteliği değeri 'VKN' olması durumunda cac:PartyName elemanı bulunmalıdır<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or not(cac:PartyIdentification/cbc:ID/@schemeID='VKN') or not(cac:PartyName) or string-length(normalize-space(string(cac:PartyName/cbc:Name))) != 0"/>
         <xsl:otherwise>cac:PartyName elemanı geçerli ve boş değer içermeyen cbc:Name elemanı içermelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or not(cac:PartyIdentification/cbc:ID/@schemeID='TCKN') or cac:Person"/>
         <xsl:otherwise>schemeID niteliği değeri 'TCKN' olması durumunda cac:Person elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'KABUL' or $responseCode = 'RED' or $responseCode = 'IADE') or not(cac:PartyIdentification/cbc:ID/@schemeID='TCKN') or not(cac:Person) or (string-length(normalize-space(string(cac:Person/cbc:FirstName))) != 0   and string-length(normalize-space(string(cac:Person/cbc:FamilyName))) != 0)"/>
         <xsl:otherwise>cac:Person elemanı geçerli ve boş değer içermeyen cbc:FirstName ve cbc:FamilyName elemanlarına sahip olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/cac:DocumentResponse" priority="1002" mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'S_APR') or count(cac:LineResponse) = 1"/>
         <xsl:otherwise>Sistem yanıtı belgesi için cac:LineResponse elemanı zorunludur ve bir tane olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'S_APR') or not(count(cac:LineResponse) = 1) or count(cac:LineResponse/cac:Response) = 1"/>
         <xsl:otherwise>cac:LineResponse elemanı içerisinde bir tane cac:Response elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($responseCode = 'S_APR') or not(count(cac:LineResponse) = 1) or not(count(cac:LineResponse/cac:Response) = 1) or cac:LineResponse/cac:Response/cbc:ResponseCode"/>
         <xsl:otherwise>cac:Response elemanı içerisinde cbc:ResponseCode elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/cac:DocumentResponse/cac:Response"
                 priority="1001"
                 mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="cbc:ResponseCode"/>
         <xsl:otherwise>cbc:ResponseCode zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(cbc:ResponseCode) or contains($ResponseCodeType, concat(',',cbc:ResponseCode,','))"/>
         <xsl:otherwise>Geçersiz cbc:ResponseCode elemanı değeri '<xsl:text/>
            <xsl:value-of select="cbc:ResponseCode"/>
            <xsl:text/>'. Geçerli değerler için kod listesine bakınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="apr:ApplicationResponse/cac:DocumentResponse/cac:LineResponse/cac:Response"
                 priority="1000"
                 mode="M23">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(cbc:Description) = 1"/>
         <xsl:otherwise>cac:Response elemanı içerisinde bir tane cbc:Description elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M23"/>
   <xsl:template match="@*|node()" priority="-2" mode="M23">
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M23"/>
   </xsl:template>

   <!--PATTERN processuseraccount-->


	<!--RULE -->
<xsl:template match="hr:ProcessUserAccount/oa:ApplicationArea" priority="1011" mode="M24">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(oa:Sender) = 1 "/>
         <xsl:otherwise>Bir tane oa:Sender elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(oa:Signature) = 1 "/>
         <xsl:otherwise>oa:Signature zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:ProcessUserAccount/oa:ApplicationArea/oa:Sender" priority="1010"
                 mode="M24">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="oa:LogicalID"/>
         <xsl:otherwise>oa:LogicalID zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(oa:LogicalID) or (string-length(normalize-space(oa:LogicalID)) = 10 or string-length(normalize-space(oa:LogicalID)) = 11)"/>
         <xsl:otherwise>oa:LogicalID elemanı 10 haneli VKN ve ya 11 haneli TCKN olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(oa:LogicalID) or not(string-length(normalize-space(oa:LogicalID)) = 10 or string-length(normalize-space(oa:LogicalID)) = 11) or not($senderId) or oa:LogicalID = $senderId"/>
         <xsl:otherwise>Zarfı gönderen kullanıcı(<xsl:text/>
            <xsl:value-of select="$senderId"/>
            <xsl:text/>) ile kullanıcı işlemi yapacak özel entegratör(<xsl:text/>
            <xsl:value-of select="oa:LogicalID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:ProcessUserAccount/oa:ApplicationArea/oa:Signature" priority="1009"
                 mode="M24">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(ds:Signature) = 1"/>
         <xsl:otherwise>oa:Signature elemanı içerisinde ds:Signature elemanı zorunludur.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:ProcessUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature"
                 priority="1008"
                 mode="M24">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:SignedInfo/ds:Reference/ds:Transforms"/>
         <xsl:otherwise>ds:SignedInfo/ds:Reference/ds:Transforms elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:KeyInfo"/>
         <xsl:otherwise>ds:KeyInfo elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:KeyInfo) or ds:KeyInfo/ds:X509Data"/>
         <xsl:otherwise>ds:KeyInfo elemanı içerisindeki ds:X509Data elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:Object"/>
         <xsl:otherwise>ds:Object elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:Object) or ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningTime"/>
         <xsl:otherwise>xades:SigningTime elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:Object) or ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningCertificate"/>
         <xsl:otherwise>xades:SigningCertificate elemanı zorunlu bir elemandır<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:ProcessUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature/ds:KeyInfo/ds:X509Data"
                 priority="1007"
                 mode="M24">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:X509Certificate"/>
         <xsl:otherwise>ds:X509Data elemanı içerisindeki ds:X509Certificate elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:ProcessUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature/ds:KeyInfo/ds:X509Data/ds:X509SubjectName"
                 priority="1006"
                 mode="M24">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="string-length(normalize-space(.)) != 0 "/>
         <xsl:otherwise> ds:X509SubjectName elemanının değeri boşluk olmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:ProcessUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature/ds:Object/xades:QualifyingProperties/xades:UnsignedProperties/xades:UnsignedSignatureProperties/xades:CounterSignature"
                 priority="1005"
                 mode="M24">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(ds:Signature) = 1"/>
         <xsl:otherwise>xades:CounterSignature elemanı içerisinde ds:Signature elemanı zorunludur.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:ProcessUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature/ds:Object/xades:QualifyingProperties/xades:UnsignedProperties/xades:UnsignedSignatureProperties/xades:CounterSignature/ds:Signature"
                 priority="1004"
                 mode="M24">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:SignedInfo/ds:Reference/ds:Transforms"/>
         <xsl:otherwise>ds:SignedInfo/ds:Reference/ds:Transforms elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:KeyInfo"/>
         <xsl:otherwise>ds:KeyInfo elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:KeyInfo) or ds:KeyInfo/ds:X509Data"/>
         <xsl:otherwise>ds:KeyInfo elemanı içerisindeki ds:X509Data elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:Object"/>
         <xsl:otherwise>ds:Object elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:Object) or ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningTime"/>
         <xsl:otherwise>xades:SigningTime elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:Object) or ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningCertificate"/>
         <xsl:otherwise>xades:SigningCertificate elemanı zorunlu bir elemandır<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:ProcessUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature/ds:Object/xades:QualifyingProperties/xades:UnsignedProperties/xades:UnsignedSignatureProperties/xades:CounterSignature/ds:Signature/ds:KeyInfo/ds:X509Data"
                 priority="1003"
                 mode="M24">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:X509Certificate"/>
         <xsl:otherwise>ds:X509Data elemanı içerisindeki ds:X509Certificate elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:ProcessUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature/ds:Object/xades:QualifyingProperties/xades:UnsignedProperties/xades:UnsignedSignatureProperties/xades:CounterSignature/ds:Signature/ds:KeyInfo/ds:X509Data/ds:X509SubjectName"
                 priority="1002"
                 mode="M24">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="string-length(normalize-space(.)) != 0 "/>
         <xsl:otherwise> ds:X509SubjectName elemanının değeri boşluk olmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:ProcessUserAccount/hr:DataArea" priority="1001" mode="M24">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'archive') or count(hr:UserAccount) = 1 "/>
         <xsl:otherwise>Fatura saklama hizmeti için oluşturulan belgelerde yalnızca bir tane hr:UserAccount elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:ProcessUserAccount/hr:DataArea/hr:UserAccount" priority="1000"
                 mode="M24">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(hr:UserID) = 1"/>
         <xsl:otherwise>hr:UserAccount elemanı içersinde hr:UserID zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(hr:PersonName) = 1"/>
         <xsl:otherwise>hr:UserAccount elemanı içersinde hr:PersonName zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'usergb') or count(hr:UserRole) = 1"/>
         <xsl:otherwise>hr:UserAccount elemanı içersinde hr:UserRole zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'archive') or count(hr:UserRole) = 0"/>
         <xsl:otherwise>Fatura saklama hizmeti verecekler için hr:UserAccount elemanı içersinde hr:UserRole elemanı girilmemelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'usergb') or count(hr:AuthorizedWorkScope) = 1"/>
         <xsl:otherwise>hr:UserAccount elemanı içersinde hr:AuthorizedWorkScope zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'archive') or count(hr:AuthorizedWorkScope) = 0"/>
         <xsl:otherwise>Fatura saklama hizmeti verecekler için hr:UserAccount elemanı içersinde hr:AuthorizedWorkScope elemanı girilmemelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(hr:AccountConfiguration) = 1"/>
         <xsl:otherwise>hr:UserAccount elemanı içersinde hr:AccountConfiguration zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:UserID) or (string-length(normalize-space(hr:UserID)) = 10 or string-length(normalize-space(hr:UserID)) = 11)"/>
         <xsl:otherwise>hr:UserID elemanına 10 haneli VKN ve ya 11 haneli TCKN yazılmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:UserID) or not(string-length(normalize-space(hr:UserID)) = 10) or not(hr:PersonName) or string-length(hr:PersonName/hr:FormattedName) &gt; 0 "/>
         <xsl:otherwise>Vergi kimlik numarasına sahip kullanıcılar için unvan bilgisi hr:FormattedName elemanına yazılmaldır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:UserID) or not(string-length(normalize-space(hr:UserID)) = 11) or not(hr:PersonName) or (string-length(hr:PersonName/oa:GivenName) &gt; 0 and string-length(hr:PersonName/hr:FamilyName) &gt; 0 )"/>
         <xsl:otherwise>TC kimlik numarasına sahip kullanıcı için ad bilgisi oa:GivenName elemanına ve soyad bilgisi hr:FamilyName elemanına yazılmaldır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(hr:UserRole) = 1) or hr:UserRole/hr:RoleCode "/>
         <xsl:otherwise>hr:RoleCode zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(hr:UserRole) = 1) or not(hr:UserRole/hr:RoleCode) or (normalize-space(hr:UserRole/hr:RoleCode) = 'GB' or normalize-space(hr:UserRole/hr:RoleCode) = 'PK')"/>
         <xsl:otherwise>hr:RoleCode elemanı değeri 'GB' ve ya 'PK' olabilir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(hr:AuthorizedWorkScope) = 1) or string-length(normalize-space(hr:AuthorizedWorkScope/hr:WorkScopeCode)) &gt; 0 "/>
         <xsl:otherwise>hr:WorkScopeCode(etiket) zorunlu bir elemandır ve boş bırakılmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(hr:AuthorizedWorkScope) = 1) or string-length(normalize-space(hr:AuthorizedWorkScope/hr:WorkScopeCode)) &lt;= 250 "/>
         <xsl:otherwise>hr:WorkScopeCode(etiket) zorunlu bir elemandır ve 250 karakterden fazla olmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(hr:AuthorizedWorkScope) = 1) or not(contains($ReservedAliases, concat(',',normalize-space(hr:AuthorizedWorkScope/hr:WorkScopeCode),','))) "/>
         <xsl:otherwise>hr:WorkScopeCode(etiket) elemanında yasaklı bir etiket kullanmaktasınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(hr:AuthorizedWorkScope) = 1) or matches(normalize-space(hr:AuthorizedWorkScope/hr:WorkScopeCode),'^urn:[A-Za-z0-9][A-Za-z0-9-]{0,31}:([A-Za-z0-9()+,-.:=@;$_!*]|%[0-9A-Fa-f]{2})+$')"/>
         <xsl:otherwise>Geçersiz hr:WorkScopeCode(etiket) değeri : <xsl:text/>
            <xsl:value-of select="hr:AuthorizedWorkScope/hr:WorkScopeCode"/>
            <xsl:text/>. hr:WorkScopeCode(etiket) zorunlu bir elemandır ve urn formatında olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'usergb') or not(count(hr:AccountConfiguration) = 1) or contains(',1,2,', concat(',',hr:AccountConfiguration/hr:UserOptionCode,',')) "/>
         <xsl:otherwise>hr:UserOptionCode zorunlu bir elemandır ve değeri 1 ve ya 2 olabilir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'archive') or not(count(hr:AccountConfiguration) = 1) or contains(',11,12,', concat(',',hr:AccountConfiguration/hr:UserOptionCode,',')) "/>
         <xsl:otherwise>hr:UserOptionCode zorunlu bir elemandır ve değeri 11 ve ya 12 olabilir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:UserID) or not(following-sibling::hr:UserAccount) or  normalize-space(hr:UserID) = following-sibling::node()/normalize-space(hr:UserID)"/>
         <xsl:otherwise>ProcessUserAccount ve CancelUserAccount belgesinde aynı hr:UserID'ye ait işlem yapılmalıdır. Farklı iki hr:UserID(<xsl:text/>
            <xsl:value-of select="hr:UserID"/>
            <xsl:text/>, <xsl:text/>
            <xsl:value-of select="following::node()/hr:UserID"/>
            <xsl:text/>) bulundu. <xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:PersonName) or not(hr:PersonName/hr:FormattedName) or not(following-sibling::hr:UserAccount) or  hr:PersonName/normalize-space(hr:FormattedName) = following::node()/hr:PersonName/normalize-space(hr:FormattedName)"/>
         <xsl:otherwise>ProcessUserAccount ve CancelUserAccount belgesinde aynı hr:FormattedName'e ait işlem yapılmalıdır. Farklı iki hr:FormattedName(<xsl:text/>
            <xsl:value-of select="hr:PersonName/hr:FormattedName"/>
            <xsl:text/>, <xsl:text/>
            <xsl:value-of select="following-sibling::node()/hr:PersonName/hr:FormattedName"/>
            <xsl:text/>) bulundu.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:PersonName) or not(hr:PersonName/oa:GivenName)     or not(following-sibling::hr:UserAccount) or  hr:PersonName/normalize-space(oa:GivenName)     = following::node()/hr:PersonName/normalize-space(oa:GivenName)"/>
         <xsl:otherwise>ProcessUserAccount ve CancelUserAccount belgesinde aynı oa:GivenName'e ait işlem yapılmalıdır. Farklı iki oa:GivenName(<xsl:text/>
            <xsl:value-of select="hr:PersonName/oa:GivenName"/>
            <xsl:text/>, <xsl:text/>
            <xsl:value-of select="following::node()/hr:PersonName/oa:GivenName"/>
            <xsl:text/>) bulundu.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:PersonName) or not(hr:PersonName/hr:MiddleName)    or not(following-sibling::hr:UserAccount) or  hr:PersonName/normalize-space(hr:MiddleName)    = following::node()/hr:PersonName/normalize-space(hr:MiddleName)"/>
         <xsl:otherwise>ProcessUserAccount ve CancelUserAccount belgesinde aynı hr:MiddleName'e ait işlem yapılmalıdır. Farklı iki hr:MiddleName(<xsl:text/>
            <xsl:value-of select="hr:PersonName/hr:MiddleName"/>
            <xsl:text/>, <xsl:text/>
            <xsl:value-of select="following::node()/hr:PersonName/hr:MiddleName"/>
            <xsl:text/>) bulundu.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:PersonName) or not(hr:PersonName/hr:FamilyName)    or not(following-sibling::hr:UserAccount) or  hr:PersonName/normalize-space(hr:FamilyName)    = following::node()/hr:PersonName/normalize-space(hr:FamilyName)"/>
         <xsl:otherwise>ProcessUserAccount ve CancelUserAccount belgesinde aynı hr:FamilyName'e ait işlem yapılmalıdır. Farklı iki hr:FamilyName(<xsl:text/>
            <xsl:value-of select="hr:PersonName/hr:FamilyName"/>
            <xsl:text/>, <xsl:text/>
            <xsl:value-of select="following::node()/hr:PersonName/hr:FamilyName"/>
            <xsl:text/>) bulundu.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:AccountConfiguration) or not(hr:AccountConfiguration/hr:UserOptionCode) or not(following-sibling::hr:UserAccount) or  hr:AccountConfiguration/normalize-space(hr:UserOptionCode) = following::node()/hr:AccountConfiguration/normalize-space(hr:UserOptionCode)"/>
         <xsl:otherwise>ProcessUserAccount ve CancelUserAccount belgesinde aynı hr:UserOptionCode'e ait işlem yapılmalıdır. Farklı iki hr:UserOptionCode(<xsl:text/>
            <xsl:value-of select="hr:AccountConfiguration/hr:UserOptionCode"/>
            <xsl:text/>, <xsl:text/>
            <xsl:value-of select="following::node()/hr:AccountConfiguration/hr:UserOptionCode"/>
            <xsl:text/>) bulundu.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M24"/>
   <xsl:template match="@*|node()" priority="-2" mode="M24">
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M24"/>
   </xsl:template>

   <!--PATTERN canceluseraccount-->


	<!--RULE -->
<xsl:template match="hr:CancelUserAccount/oa:ApplicationArea" priority="1011" mode="M25">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(oa:Sender) = 1 "/>
         <xsl:otherwise>Bir tane oa:Sender elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(oa:Signature) = 1 "/>
         <xsl:otherwise>oa:Signature zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:CancelUserAccount/oa:ApplicationArea/oa:Sender" priority="1010"
                 mode="M25">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="oa:LogicalID"/>
         <xsl:otherwise>oa:LogicalID zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(oa:LogicalID) or (string-length(normalize-space(oa:LogicalID)) = 10 or string-length(normalize-space(oa:LogicalID)) = 11)"/>
         <xsl:otherwise>oa:LogicalID elemanı 10 haneli VKN ve ya 11 haneli TCKN olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(oa:LogicalID) or not(string-length(normalize-space(oa:LogicalID)) = 10 or string-length(normalize-space(oa:LogicalID)) = 11) or not($senderId) or oa:LogicalID = $senderId"/>
         <xsl:otherwise>Zarfı gönderen kullanıcı(<xsl:text/>
            <xsl:value-of select="$senderId"/>
            <xsl:text/>) ile kullanıcı işlemi yapacak özel entegratör(<xsl:text/>
            <xsl:value-of select="oa:LogicalID"/>
            <xsl:text/>) aynı olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:CancelUserAccount/oa:ApplicationArea/oa:Signature" priority="1009"
                 mode="M25">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(ds:Signature) = 1"/>
         <xsl:otherwise>oa:Signature elemanı içerisinde ds:Signature elemanı zorunludur.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:CancelUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature"
                 priority="1008"
                 mode="M25">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:SignedInfo/ds:Reference/ds:Transforms"/>
         <xsl:otherwise>ds:SignedInfo/ds:Reference/ds:Transforms elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:KeyInfo"/>
         <xsl:otherwise>ds:KeyInfo elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:KeyInfo) or ds:KeyInfo/ds:X509Data"/>
         <xsl:otherwise>ds:KeyInfo elemanı içerisindeki ds:X509Data elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:Object"/>
         <xsl:otherwise>ds:Object elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:Object) or ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningTime"/>
         <xsl:otherwise>xades:SigningTime elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:Object) or ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningCertificate"/>
         <xsl:otherwise>xades:SigningCertificate elemanı zorunlu bir elemandır<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:CancelUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature/ds:KeyInfo/ds:X509Data"
                 priority="1007"
                 mode="M25">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:X509Certificate"/>
         <xsl:otherwise>ds:X509Data elemanı içerisindeki ds:X509Certificate elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:CancelUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature/ds:KeyInfo/ds:X509Data/ds:X509SubjectName"
                 priority="1006"
                 mode="M25">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="string-length(normalize-space(.)) != 0 "/>
         <xsl:otherwise> ds:X509SubjectName elemanının değeri boşluk olmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:CancelUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature/ds:Object/xades:QualifyingProperties/xades:UnsignedProperties/xades:UnsignedSignatureProperties/xades:CounterSignature"
                 priority="1005"
                 mode="M25">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(ds:Signature) = 1"/>
         <xsl:otherwise>xades:CounterSignature elemanı içerisinde ds:Signature elemanı zorunludur.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:CancelUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature/ds:Object/xades:QualifyingProperties/xades:UnsignedProperties/xades:UnsignedSignatureProperties/xades:CounterSignature/ds:Signature"
                 priority="1004"
                 mode="M25">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:SignedInfo/ds:Reference/ds:Transforms"/>
         <xsl:otherwise>ds:SignedInfo/ds:Reference/ds:Transforms elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:KeyInfo"/>
         <xsl:otherwise>ds:KeyInfo elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:KeyInfo) or ds:KeyInfo/ds:X509Data"/>
         <xsl:otherwise>ds:KeyInfo elemanı içerisindeki ds:X509Data elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:Object"/>
         <xsl:otherwise>ds:Object elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:Object) or ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningTime"/>
         <xsl:otherwise>xades:SigningTime elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(ds:Object) or ds:Object/xades:QualifyingProperties/xades:SignedProperties/xades:SignedSignatureProperties/xades:SigningCertificate"/>
         <xsl:otherwise>xades:SigningCertificate elemanı zorunlu bir elemandır<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:CancelUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature/ds:Object/xades:QualifyingProperties/xades:UnsignedProperties/xades:UnsignedSignatureProperties/xades:CounterSignature/ds:Signature/ds:KeyInfo/ds:X509Data"
                 priority="1003"
                 mode="M25">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="ds:X509Certificate"/>
         <xsl:otherwise>ds:X509Data elemanı içerisindeki ds:X509Certificate elemanı zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:CancelUserAccount/oa:ApplicationArea/oa:Signature/ds:Signature/ds:Object/xades:QualifyingProperties/xades:UnsignedProperties/xades:UnsignedSignatureProperties/xades:CounterSignature/ds:Signature/ds:KeyInfo/ds:X509Data/ds:X509SubjectName"
                 priority="1002"
                 mode="M25">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="string-length(normalize-space(.)) != 0 "/>
         <xsl:otherwise> ds:X509SubjectName elemanının değeri boşluk olmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:CancelUserAccount/hr:DataArea" priority="1001" mode="M25">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'archive') or count(hr:UserAccount) = 1 "/>
         <xsl:otherwise>Fatura saklama hizmeti için oluşturulan belgelerde yalnızca bir tane hr:UserAccount elemanı bulunmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>

	  <!--RULE -->
<xsl:template match="hr:CancelUserAccount/hr:DataArea/hr:UserAccount" priority="1000"
                 mode="M25">

		<!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(hr:UserID) = 1"/>
         <xsl:otherwise>hr:UserAccount elemanı içersinde hr:UserID zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(hr:PersonName) = 1"/>
         <xsl:otherwise>hr:UserAccount elemanı içersinde hr:PersonName zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'usergb') or count(hr:UserRole) = 1"/>
         <xsl:otherwise>hr:UserAccount elemanı içersinde hr:UserRole zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'archive') or count(hr:UserRole) = 0"/>
         <xsl:otherwise>Fatura saklama hizmeti verecekler için hr:UserAccount elemanı içersinde hr:UserRole elemanı girilmemelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'usergb') or count(hr:AuthorizedWorkScope) = 1"/>
         <xsl:otherwise>hr:UserAccount elemanı içersinde hr:AuthorizedWorkScope zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'archive') or count(hr:AuthorizedWorkScope) = 0"/>
         <xsl:otherwise>Fatura saklama hizmeti verecekler için hr:UserAccount elemanı içersinde hr:AuthorizedWorkScope elemanı girilmemelidir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="count(hr:AccountConfiguration) = 1"/>
         <xsl:otherwise>hr:UserAccount elemanı içersinde hr:AccountConfiguration zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:UserID) or (string-length(normalize-space(hr:UserID)) = 10 or string-length(normalize-space(hr:UserID)) = 11)"/>
         <xsl:otherwise>hr:UserID elemanına 10 haneli VKN ve ya 11 haneli TCKN yazılmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:UserID) or not(string-length(normalize-space(hr:UserID)) = 10) or not(hr:PersonName) or string-length(hr:PersonName/hr:FormattedName) &gt; 0 "/>
         <xsl:otherwise>Vergi kimlik numarasına sahip kullanıcılar için unvan bilgisi hr:FormattedName elemanına yazılmaldır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:UserID) or not(string-length(normalize-space(hr:UserID)) = 11) or not(hr:PersonName) or (string-length(hr:PersonName/oa:GivenName) &gt; 0 and string-length(hr:PersonName/hr:FamilyName) &gt; 0 )"/>
         <xsl:otherwise>TC kimlik numarasına sahip kullanıcı için ad bilgisi oa:GivenName elemanına ve soyad bilgisi hr:FamilyName elemanına yazılmaldır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(hr:UserRole) = 1) or hr:UserRole/hr:RoleCode "/>
         <xsl:otherwise>hr:RoleCode zorunlu bir elemandır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(hr:UserRole) = 1) or not(hr:UserRole/hr:RoleCode) or (normalize-space(hr:UserRole/hr:RoleCode) = 'GB' or normalize-space(hr:UserRole/hr:RoleCode) = 'PK')"/>
         <xsl:otherwise>hr:RoleCode elemanı değeri 'GB' ve ya 'PK' olabilir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(hr:AuthorizedWorkScope) = 1) or string-length(normalize-space(hr:AuthorizedWorkScope/hr:WorkScopeCode)) &gt; 0 "/>
         <xsl:otherwise>hr:WorkScopeCode(etiket) zorunlu bir elemandır ve boş bırakılmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(hr:AuthorizedWorkScope) = 1) or string-length(normalize-space(hr:AuthorizedWorkScope/hr:WorkScopeCode)) &lt;= 250 "/>
         <xsl:otherwise>hr:WorkScopeCode(etiket) zorunlu bir elemandır ve 250 karakterden fazla olmamalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(hr:AuthorizedWorkScope) = 1) or not(contains($ReservedAliases, concat(',',normalize-space(hr:AuthorizedWorkScope/hr:WorkScopeCode),','))) "/>
         <xsl:otherwise>hr:WorkScopeCode(etiket) elemanında yasaklı bir etiket kullanmaktasınız.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(count(hr:AuthorizedWorkScope) = 1) or matches(normalize-space(hr:AuthorizedWorkScope/hr:WorkScopeCode),'^urn:[A-Za-z0-9][A-Za-z0-9-]{0,31}:([A-Za-z0-9()+,-.:=@;$_!*]|%[0-9A-Fa-f]{2})+$')"/>
         <xsl:otherwise>Geçersiz hr:WorkScopeCode(etiket) değeri : <xsl:text/>
            <xsl:value-of select="hr:AuthorizedWorkScope/hr:WorkScopeCode"/>
            <xsl:text/>. hr:WorkScopeCode(etiket) zorunlu bir elemandır ve urn formatında olmalıdır.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'usergb') or not(count(hr:AccountConfiguration) = 1) or contains(',1,2,', concat(',',hr:AccountConfiguration/hr:UserOptionCode,',')) "/>
         <xsl:otherwise>hr:UserOptionCode zorunlu bir elemandır ve değeri 1 ve ya 2 olabilir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not($senderAlias = 'archive') or not(count(hr:AccountConfiguration) = 1) or contains(',11,12,', concat(',',hr:AccountConfiguration/hr:UserOptionCode,',')) "/>
         <xsl:otherwise>hr:UserOptionCode zorunlu bir elemandır ve değeri 11 ve ya 12 olabilir.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:UserID) or not(following-sibling::hr:UserAccount) or  normalize-space(hr:UserID) = following-sibling::node()/normalize-space(hr:UserID)"/>
         <xsl:otherwise>ProcessUserAccount ve CancelUserAccount belgesinde aynı hr:UserID'ye ait işlem yapılmalıdır. Farklı iki hr:UserID(<xsl:text/>
            <xsl:value-of select="hr:UserID"/>
            <xsl:text/>, <xsl:text/>
            <xsl:value-of select="following::node()/hr:UserID"/>
            <xsl:text/>) bulundu. <xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:PersonName) or not(hr:PersonName/hr:FormattedName) or not(following-sibling::hr:UserAccount) or  hr:PersonName/normalize-space(hr:FormattedName) = following::node()/hr:PersonName/normalize-space(hr:FormattedName)"/>
         <xsl:otherwise>ProcessUserAccount ve CancelUserAccount belgesinde aynı hr:FormattedName'e ait işlem yapılmalıdır. Farklı iki hr:FormattedName(<xsl:text/>
            <xsl:value-of select="hr:PersonName/hr:FormattedName"/>
            <xsl:text/>, <xsl:text/>
            <xsl:value-of select="following-sibling::node()/hr:PersonName/hr:FormattedName"/>
            <xsl:text/>) bulundu.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:PersonName) or not(hr:PersonName/oa:GivenName)     or not(following-sibling::hr:UserAccount) or  hr:PersonName/normalize-space(oa:GivenName)     = following::node()/hr:PersonName/normalize-space(oa:GivenName)"/>
         <xsl:otherwise>ProcessUserAccount ve CancelUserAccount belgesinde aynı oa:GivenName'e ait işlem yapılmalıdır. Farklı iki oa:GivenName(<xsl:text/>
            <xsl:value-of select="hr:PersonName/oa:GivenName"/>
            <xsl:text/>, <xsl:text/>
            <xsl:value-of select="following::node()/hr:PersonName/oa:GivenName"/>
            <xsl:text/>) bulundu.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:PersonName) or not(hr:PersonName/hr:MiddleName)    or not(following-sibling::hr:UserAccount) or  hr:PersonName/normalize-space(hr:MiddleName)    = following::node()/hr:PersonName/normalize-space(hr:MiddleName)"/>
         <xsl:otherwise>ProcessUserAccount ve CancelUserAccount belgesinde aynı hr:MiddleName'e ait işlem yapılmalıdır. Farklı iki hr:MiddleName(<xsl:text/>
            <xsl:value-of select="hr:PersonName/hr:MiddleName"/>
            <xsl:text/>, <xsl:text/>
            <xsl:value-of select="following::node()/hr:PersonName/hr:MiddleName"/>
            <xsl:text/>) bulundu.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:PersonName) or not(hr:PersonName/hr:FamilyName)    or not(following-sibling::hr:UserAccount) or  hr:PersonName/normalize-space(hr:FamilyName)    = following::node()/hr:PersonName/normalize-space(hr:FamilyName)"/>
         <xsl:otherwise>ProcessUserAccount ve CancelUserAccount belgesinde aynı hr:FamilyName'e ait işlem yapılmalıdır. Farklı iki hr:FamilyName(<xsl:text/>
            <xsl:value-of select="hr:PersonName/hr:FamilyName"/>
            <xsl:text/>, <xsl:text/>
            <xsl:value-of select="following::node()/hr:PersonName/hr:FamilyName"/>
            <xsl:text/>) bulundu.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>

		    <!--ASSERT -->
<xsl:choose>
         <xsl:when test="not(hr:AccountConfiguration) or not(hr:AccountConfiguration/hr:UserOptionCode) or not(following-sibling::hr:UserAccount) or  hr:AccountConfiguration/normalize-space(hr:UserOptionCode) = following::node()/hr:AccountConfiguration/normalize-space(hr:UserOptionCode)"/>
         <xsl:otherwise>ProcessUserAccount ve CancelUserAccount belgesinde aynı hr:UserOptionCode'e ait işlem yapılmalıdır. Farklı iki hr:UserOptionCode(<xsl:text/>
            <xsl:value-of select="hr:AccountConfiguration/hr:UserOptionCode"/>
            <xsl:text/>, <xsl:text/>
            <xsl:value-of select="following::node()/hr:AccountConfiguration/hr:UserOptionCode"/>
            <xsl:text/>) bulundu.<xsl:value-of select="string('&#xA;')"/>
         </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>
   <xsl:template match="text()" priority="-1" mode="M25"/>
   <xsl:template match="@*|node()" priority="-2" mode="M25">
      <xsl:apply-templates select="*|comment()|processing-instruction()" mode="M25"/>
   </xsl:template>
</xsl:stylesheet>