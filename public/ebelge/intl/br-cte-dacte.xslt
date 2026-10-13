<?xml version="1.0" encoding="UTF-8"?>
<!--
  DACTE (Documento Auxiliar do Conhecimento de Transporte Eletrônico, modelo 57) — MOC CT-e 4.00,
  modal rodoviário: canhoto, emitente, chave em CODE-128C, tipo e tomador, remetente / destinatário,
  carga, componentes do valor da prestação, ICMS e IBS/CBS, documentos originários e observações.
  Rótulos: parâmetro "lang" = pt (padrão no Brasil) ou en.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:cte="http://www.portalfiscal.inf.br/cte" exclude-result-prefixes="cte">

    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="br" decimal-separator="," grouping-separator="."/>
    <xsl:param name="lang" select="'pt'"/>
    <xsl:variable name="L">
        <xsl:choose>
            <xsl:when test="$lang = 'en'">en</xsl:when>
            <xsl:otherwise>pt</xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:variable name="M" select="'#.##0,00'"/>

    <xsl:template name="t">
        <xsl:param name="k"/>
        <xsl:variable name="row">
            <xsl:choose>
                <xsl:when test="$k='canhoto'">|pt=DECLARO QUE RECEBI OS VOLUMES DESTE CONHECIMENTO EM PERFEITO ESTADO PELO QUE DOU POR CUMPRIDO O PRESENTE CONTRATO DE TRANSPORTE|en=I DECLARE THAT I RECEIVED THE PACKAGES OF THIS BILL OF LADING IN PERFECT CONDITION AND CONSIDER THIS CONTRACT OF CARRIAGE FULFILLED|</xsl:when>
                <xsl:when test="$k='nome'">|pt=NOME|en=NAME|</xsl:when>
                <xsl:when test="$k='rg'">|pt=RG|en=ID DOCUMENT|</xsl:when>
                <xsl:when test="$k='ass'">|pt=ASSINATURA / CARIMBO|en=SIGNATURE / STAMP|</xsl:when>
                <xsl:when test="$k='chegada'">|pt=CHEGADA DATA/HORA|en=ARRIVAL DATE/TIME|</xsl:when>
                <xsl:when test="$k='saida'">|pt=SAÍDA DATA/HORA|en=DEPARTURE DATE/TIME|</xsl:when>
                <xsl:when test="$k='dacte'">|pt=Documento Auxiliar do Conhecimento de Transporte Eletrônico|en=Auxiliary document of the electronic bill of lading|</xsl:when>
                <xsl:when test="$k='modal'">|pt=MODAL|en=MODE|</xsl:when>
                <xsl:when test="$k='m01'">|pt=RODOVIÁRIO|en=ROAD|</xsl:when>
                <xsl:when test="$k='m02'">|pt=AÉREO|en=AIR|</xsl:when>
                <xsl:when test="$k='m03'">|pt=AQUAVIÁRIO|en=WATERWAY|</xsl:when>
                <xsl:when test="$k='m04'">|pt=FERROVIÁRIO|en=RAIL|</xsl:when>
                <xsl:when test="$k='m05'">|pt=DUTOVIÁRIO|en=PIPELINE|</xsl:when>
                <xsl:when test="$k='m06'">|pt=MULTIMODAL|en=MULTIMODAL|</xsl:when>
                <xsl:when test="$k='modelo'">|pt=MODELO|en=MODEL|</xsl:when>
                <xsl:when test="$k='serie'">|pt=SÉRIE|en=SERIES|</xsl:when>
                <xsl:when test="$k='numero'">|pt=NÚMERO|en=NUMBER|</xsl:when>
                <xsl:when test="$k='fl'">|pt=FL|en=SHEET|</xsl:when>
                <xsl:when test="$k='dhEmi'">|pt=DATA E HORA DE EMISSÃO|en=ISSUE DATE AND TIME|</xsl:when>
                <xsl:when test="$k='chave'">|pt=CHAVE DE ACESSO|en=ACCESS KEY|</xsl:when>
                <xsl:when test="$k='consulta'">|pt=Consulta de autenticidade no portal nacional do CT-e, no site da Sefaz Autorizadora, ou em http://www.cte.fazenda.gov.br/portal|en=Verify authenticity on the national CT-e portal, the authorising Sefaz website or http://www.cte.fazenda.gov.br/portal|</xsl:when>
                <xsl:when test="$k='prot'">|pt=PROTOCOLO DE AUTORIZAÇÃO DE USO|en=AUTHORISATION PROTOCOL|</xsl:when>
                <xsl:when test="$k='tpCTe'">|pt=TIPO DO CT-e|en=CT-e TYPE|</xsl:when>
                <xsl:when test="$k='tpServ'">|pt=TIPO DO SERVIÇO|en=SERVICE TYPE|</xsl:when>
                <xsl:when test="$k='tomador'">|pt=TOMADOR DO SERVIÇO|en=PAYER OF THE SERVICE|</xsl:when>
                <xsl:when test="$k='cfop'">|pt=CFOP – NATUREZA DA PRESTAÇÃO|en=CFOP – NATURE OF SERVICE|</xsl:when>
                <xsl:when test="$k='ini'">|pt=INÍCIO DA PRESTAÇÃO|en=START OF SERVICE|</xsl:when>
                <xsl:when test="$k='fim'">|pt=TÉRMINO DA PRESTAÇÃO|en=END OF SERVICE|</xsl:when>
                <xsl:when test="$k='rem'">|pt=REMETENTE|en=SENDER|</xsl:when>
                <xsl:when test="$k='dest'">|pt=DESTINATÁRIO|en=CONSIGNEE|</xsl:when>
                <xsl:when test="$k='end'">|pt=ENDEREÇO|en=ADDRESS|</xsl:when>
                <xsl:when test="$k='mun'">|pt=MUNICÍPIO|en=MUNICIPALITY|</xsl:when>
                <xsl:when test="$k='cep'">|pt=CEP|en=POSTCODE|</xsl:when>
                <xsl:when test="$k='cnpj'">|pt=CNPJ/CPF|en=CNPJ/CPF|</xsl:when>
                <xsl:when test="$k='ie'">|pt=INSCRIÇÃO ESTADUAL|en=STATE REGISTRATION|</xsl:when>
                <xsl:when test="$k='uf'">|pt=UF|en=STATE|</xsl:when>
                <xsl:when test="$k='pais'">|pt=PAÍS|en=COUNTRY|</xsl:when>
                <xsl:when test="$k='fone'">|pt=FONE|en=PHONE|</xsl:when>
                <xsl:when test="$k='proPred'">|pt=PRODUTO PREDOMINANTE|en=MAIN PRODUCT|</xsl:when>
                <xsl:when test="$k='outCat'">|pt=OUTRAS CARACTERÍSTICAS DA CARGA|en=OTHER CARGO CHARACTERISTICS|</xsl:when>
                <xsl:when test="$k='vCarga'">|pt=VALOR TOTAL DA CARGA|en=TOTAL CARGO VALUE|</xsl:when>
                <xsl:when test="$k='qtd'">|pt=QUANTIDADE / UNIDADE DE MEDIDA|en=QUANTITY / UNIT OF MEASURE|</xsl:when>
                <xsl:when test="$k='comp'">|pt=COMPONENTES DO VALOR DA PRESTAÇÃO DO SERVIÇO|en=COMPONENTS OF THE SERVICE VALUE|</xsl:when>
                <xsl:when test="$k='nomeComp'">|pt=NOME|en=NAME|</xsl:when>
                <xsl:when test="$k='valor'">|pt=VALOR|en=VALUE|</xsl:when>
                <xsl:when test="$k='vTPrest'">|pt=VALOR TOTAL DO SERVIÇO|en=TOTAL SERVICE VALUE|</xsl:when>
                <xsl:when test="$k='vRec'">|pt=VALOR A RECEBER|en=AMOUNT RECEIVABLE|</xsl:when>
                <xsl:when test="$k='imp'">|pt=INFORMAÇÕES RELATIVAS AO IMPOSTO|en=TAX INFORMATION|</xsl:when>
                <xsl:when test="$k='sitTrib'">|pt=SITUAÇÃO TRIBUTÁRIA|en=TAX SITUATION|</xsl:when>
                <xsl:when test="$k='bc'">|pt=BASE DE CÁLCULO|en=TAX BASE|</xsl:when>
                <xsl:when test="$k='aliq'">|pt=ALÍQ. ICMS|en=ICMS RATE|</xsl:when>
                <xsl:when test="$k='vIcms'">|pt=VALOR ICMS|en=ICMS AMOUNT|</xsl:when>
                <xsl:when test="$k='redBc'">|pt=% RED. BC|en=% BASE REDUCTION|</xsl:when>
                <xsl:when test="$k='vTotTrib'">|pt=V. APROX. TRIBUTOS|en=APPROX. TAXES|</xsl:when>
                <xsl:when test="$k='ibscbs'">|pt=IBS / CBS|en=IBS / CBS|</xsl:when>
                <xsl:when test="$k='cstIbs'">|pt=CST · CLASS. TRIB.|en=CST · TAX CLASS.|</xsl:when>
                <xsl:when test="$k='bcIbs'">|pt=BASE DE CÁLC. IBS/CBS|en=IBS/CBS TAX BASE|</xsl:when>
                <xsl:when test="$k='vIbsUf'">|pt=VALOR IBS UF|en=IBS (STATE)|</xsl:when>
                <xsl:when test="$k='vIbsMun'">|pt=VALOR IBS MUN.|en=IBS (MUNICIPAL)|</xsl:when>
                <xsl:when test="$k='vCbs'">|pt=VALOR CBS|en=CBS AMOUNT|</xsl:when>
                <xsl:when test="$k='docs'">|pt=DOCUMENTOS ORIGINÁRIOS|en=ORIGINATING DOCUMENTS|</xsl:when>
                <xsl:when test="$k='tpDoc'">|pt=TIPO DOC|en=DOC TYPE|</xsl:when>
                <xsl:when test="$k='emiDoc'">|pt=CNPJ/CPF EMITENTE|en=ISSUER CNPJ/CPF|</xsl:when>
                <xsl:when test="$k='nroDoc'">|pt=SÉRIE/NRO. DOCUMENTO|en=DOC SERIES/NO.|</xsl:when>
                <xsl:when test="$k='chaveDoc'">|pt=CHAVE DE ACESSO|en=ACCESS KEY|</xsl:when>
                <xsl:when test="$k='obs'">|pt=OBSERVAÇÕES|en=REMARKS|</xsl:when>
                <xsl:when test="$k='rodo'">|pt=DADOS ESPECÍFICOS DO MODAL RODOVIÁRIO|en=ROAD TRANSPORT DETAILS|</xsl:when>
                <xsl:when test="$k='rntrc'">|pt=RNTRC DA EMPRESA|en=CARRIER RNTRC|</xsl:when>
                <xsl:when test="$k='lei'">|pt=ESTE CONHECIMENTO DE TRANSPORTE ATENDE À LEGISLAÇÃO DE TRANSPORTE RODOVIÁRIO EM VIGOR|en=THIS BILL OF LADING COMPLIES WITH THE ROAD TRANSPORT LEGISLATION IN FORCE|</xsl:when>
                <xsl:when test="$k='fisco'">|pt=RESERVADO AO FISCO|en=RESERVED FOR THE TAX AUTHORITY|</xsl:when>
                <xsl:when test="$k='qr'">|pt=QR Code|en=QR code|</xsl:when>
                <xsl:when test="$k='homolog'">|pt=CT-E EMITIDO EM AMBIENTE DE HOMOLOGAÇÃO – SEM VALOR FISCAL|en=CT-E ISSUED IN THE TEST ENVIRONMENT – NO FISCAL VALUE|</xsl:when>
                <xsl:when test="$k='tp0'">|pt=Normal|en=Normal|</xsl:when>
                <xsl:when test="$k='tp1'">|pt=Complemento de valores|en=Value supplement|</xsl:when>
                <xsl:when test="$k='tp3'">|pt=Substituto|en=Replacement|</xsl:when>
                <xsl:when test="$k='sv0'">|pt=Normal|en=Normal|</xsl:when>
                <xsl:when test="$k='sv1'">|pt=Subcontratação|en=Subcontracting|</xsl:when>
                <xsl:when test="$k='sv2'">|pt=Redespacho|en=Re-dispatch|</xsl:when>
                <xsl:when test="$k='sv3'">|pt=Redespacho intermediário|en=Intermediate re-dispatch|</xsl:when>
                <xsl:when test="$k='sv4'">|pt=Serviço vinculado a multimodal|en=Multimodal-linked service|</xsl:when>
                <xsl:when test="$k='tm0'">|pt=Remetente|en=Sender|</xsl:when>
                <xsl:when test="$k='tm1'">|pt=Expedidor|en=Shipper|</xsl:when>
                <xsl:when test="$k='tm2'">|pt=Recebedor|en=Receiver|</xsl:when>
                <xsl:when test="$k='tm3'">|pt=Destinatário|en=Consignee|</xsl:when>
                <xsl:when test="$k='tm4'">|pt=Outros|en=Other|</xsl:when>
                <xsl:when test="$k='st00'">|pt=00 - Tributação normal do ICMS|en=00 - Normal ICMS taxation|</xsl:when>
                <xsl:when test="$k='st20'">|pt=20 - Tributação com BC reduzida do ICMS|en=20 - ICMS with reduced base|</xsl:when>
                <xsl:when test="$k='st40'">|pt=40 - ICMS isento|en=40 - ICMS exempt|</xsl:when>
                <xsl:when test="$k='st41'">|pt=41 - ICMS não tributado|en=41 - ICMS not taxed|</xsl:when>
                <xsl:when test="$k='st60'">|pt=60 - ICMS cobrado por substituição tributária|en=60 - ICMS charged by tax substitution|</xsl:when>
                <xsl:when test="$k='st90'">|pt=90 - ICMS outros|en=90 - ICMS other|</xsl:when>
                <xsl:when test="$k='u00'">|pt=M3|en=M3|</xsl:when>
                <xsl:when test="$k='u01'">|pt=KG|en=KG|</xsl:when>
                <xsl:when test="$k='u02'">|pt=TON|en=TON|</xsl:when>
                <xsl:when test="$k='u03'">|pt=UNIDADE|en=UNIT|</xsl:when>
                <xsl:when test="$k='u04'">|pt=LITROS|en=LITRES|</xsl:when>
                <xsl:when test="$k='u05'">|pt=MMBTU|en=MMBTU|</xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="hit" select="substring-before(substring-after($row, concat('|', $L, '=')), '|')"/>
        <xsl:choose>
            <xsl:when test="$hit != ''"><xsl:value-of select="$hit"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="substring-before(substring-after($row, '|pt='), '|')"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="c">
        <xsl:param name="k"/>
        <xsl:param name="v"/>
        <xsl:param name="w"/>
        <xsl:param name="a"/>
        <xsl:param name="span" select="1"/>
        <td colspan="{$span}">
            <xsl:if test="string($w) != ''"><xsl:attribute name="style">width:<xsl:value-of select="$w"/>%</xsl:attribute></xsl:if>
            <xsl:if test="string($a) != ''"><xsl:attribute name="class"><xsl:value-of select="$a"/></xsl:attribute></xsl:if>
            <i><xsl:call-template name="t"><xsl:with-param name="k" select="$k"/></xsl:call-template></i>
            <b><xsl:choose><xsl:when test="normalize-space($v) != ''"><xsl:value-of select="$v"/></xsl:when><xsl:otherwise>&#160;</xsl:otherwise></xsl:choose></b>
        </td>
    </xsl:template>

    <xsl:template name="doc">
        <xsl:param name="s"/>
        <xsl:variable name="d" select="string($s)"/>
        <xsl:choose>
            <xsl:when test="string-length($d) = 14"><xsl:value-of select="concat(substring($d,1,2),'.',substring($d,3,3),'.',substring($d,6,3),'/',substring($d,9,4),'-',substring($d,13,2))"/></xsl:when>
            <xsl:when test="string-length($d) = 11"><xsl:value-of select="concat(substring($d,1,3),'.',substring($d,4,3),'.',substring($d,7,3),'-',substring($d,10,2))"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$d"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="dh">
        <xsl:param name="d"/>
        <xsl:if test="string-length($d) &gt;= 10"><xsl:value-of select="concat(substring($d,9,2),'/',substring($d,6,2),'/',substring($d,1,4))"/></xsl:if>
        <xsl:if test="string-length($d) &gt;= 19"><xsl:value-of select="concat(' ', substring($d,12,8))"/></xsl:if>
    </xsl:template>

    <xsl:template name="cep">
        <xsl:param name="s"/>
        <xsl:choose>
            <xsl:when test="string-length($s) = 8"><xsl:value-of select="concat(substring($s,1,5),'-',substring($s,6,3))"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="grp">
        <xsl:param name="s"/>
        <xsl:value-of select="substring($s, 1, 4)"/>
        <xsl:if test="string-length($s) &gt; 4"><xsl:text> </xsl:text><xsl:call-template name="grp"><xsl:with-param name="s" select="substring($s, 5)"/></xsl:call-template></xsl:if>
    </xsl:template>

    <!-- CODE-128 conjunto C: padrões de barras/espaços (larguras em módulos) dos valores 0–102. -->
    <xsl:variable name="C128" select="'212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131'"/>

    <xsl:template name="bars">
        <xsl:param name="p"/>
        <xsl:param name="i" select="1"/>
        <xsl:if test="$i &lt;= string-length($p)">
            <span class="{substring('sb', 1 + ($i mod 2), 1)}{substring($p, $i, 1)}"/>
            <xsl:call-template name="bars"><xsl:with-param name="p" select="$p"/><xsl:with-param name="i" select="$i + 1"/></xsl:call-template>
        </xsl:if>
    </xsl:template>

    <xsl:template name="c128">
        <xsl:param name="d"/>
        <xsl:param name="n" select="1"/>
        <xsl:param name="sum" select="105"/>
        <xsl:choose>
            <xsl:when test="string-length($d) &gt;= 2">
                <xsl:variable name="v" select="number(substring($d, 1, 2))"/>
                <xsl:call-template name="bars"><xsl:with-param name="p" select="substring($C128, $v * 7 + 1, 6)"/></xsl:call-template>
                <xsl:call-template name="c128">
                    <xsl:with-param name="d" select="substring($d, 3)"/>
                    <xsl:with-param name="n" select="$n + 1"/>
                    <xsl:with-param name="sum" select="$sum + $v * $n"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="bars"><xsl:with-param name="p" select="substring($C128, ($sum mod 103) * 7 + 1, 6)"/></xsl:call-template>
                <xsl:call-template name="bars"><xsl:with-param name="p" select="'2331112'"/></xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="barcode">
        <xsl:param name="d"/>
        <div class="bc">
            <xsl:call-template name="bars"><xsl:with-param name="p" select="'211232'"/></xsl:call-template>
            <xsl:call-template name="c128"><xsl:with-param name="d" select="$d"/></xsl:call-template>
        </div>
    </xsl:template>

    <xsl:template name="party">
        <xsl:param name="p"/>
        <xsl:param name="e"/>
        <xsl:param name="k"/>
        <td class="pt">
            <div class="ph"><xsl:call-template name="t"><xsl:with-param name="k" select="$k"/></xsl:call-template></div>
            <div class="pn"><xsl:value-of select="$p/cte:xNome"/></div>
            <table class="kv">
                <tr><td><xsl:call-template name="t"><xsl:with-param name="k">end</xsl:with-param></xsl:call-template></td><td colspan="3"><xsl:value-of select="concat($e/cte:xLgr, ', ', $e/cte:nro, ' – ', $e/cte:xBairro)"/></td></tr>
                <tr>
                    <td><xsl:call-template name="t"><xsl:with-param name="k">mun</xsl:with-param></xsl:call-template></td><td><xsl:value-of select="$e/cte:xMun"/> – <xsl:value-of select="$e/cte:UF"/></td>
                    <td><xsl:call-template name="t"><xsl:with-param name="k">cep</xsl:with-param></xsl:call-template></td><td><xsl:call-template name="cep"><xsl:with-param name="s" select="$e/cte:CEP"/></xsl:call-template></td>
                </tr>
                <tr>
                    <td><xsl:call-template name="t"><xsl:with-param name="k">cnpj</xsl:with-param></xsl:call-template></td><td><b><xsl:call-template name="doc"><xsl:with-param name="s" select="$p/cte:CNPJ | $p/cte:CPF"/></xsl:call-template></b></td>
                    <td><xsl:call-template name="t"><xsl:with-param name="k">ie</xsl:with-param></xsl:call-template></td><td><xsl:value-of select="$p/cte:IE"/></td>
                </tr>
                <tr>
                    <td><xsl:call-template name="t"><xsl:with-param name="k">pais</xsl:with-param></xsl:call-template></td><td><xsl:value-of select="$e/cte:xPais"/><xsl:if test="not($e/cte:xPais)">Brasil</xsl:if></td>
                    <td><xsl:call-template name="t"><xsl:with-param name="k">fone</xsl:with-param></xsl:call-template></td><td><xsl:value-of select="$p/cte:fone"/></td>
                </tr>
            </table>
        </td>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="cte:cteProc/cte:CTe/cte:infCte | cte:CTe/cte:infCte"/>
    </xsl:template>

    <xsl:template match="cte:infCte">
        <xsl:variable name="ide" select="cte:ide"/>
        <xsl:variable name="emit" select="cte:emit"/>
        <xsl:variable name="prest" select="cte:vPrest"/>
        <xsl:variable name="icms" select="cte:imp/cte:ICMS/*"/>
        <xsl:variable name="ib" select="cte:imp/cte:IBSCBS"/>
        <xsl:variable name="norm" select="cte:infCTeNorm"/>
        <xsl:variable name="prot" select="/cte:cteProc/cte:protCTe/cte:infProt"/>
        <xsl:variable name="chave" select="substring-after(@Id, 'CTe')"/>
        <xsl:variable name="toma" select="$ide/cte:toma3/cte:toma | $ide/cte:toma4/cte:toma"/>
        <html lang="{$L}">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title>DACTE <xsl:value-of select="$ide/cte:nCT"/></title>
                <style type="text/css">
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; background: #eef1f5; color: #000; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; }
                    table { font-size: inherit; color: inherit; }
                    .page { width: 794px; margin: 0 auto; background: #fff; padding: 16px 20px 22px; position: relative; }
                    table.g { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: -1px; }
                    table.g > tbody > tr > td, table.g > tr > td { border: 1px solid #000; padding: 1px 4px 2px; vertical-align: top; overflow: hidden; }
                    table.g td i { display: block; font-style: normal; font-size: 6.5px; color: #222; white-space: nowrap; }
                    table.g td b { display: block; font-size: 9.5px; min-height: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    table.g td.r b { text-align: right; }
                    table.g td.c b { text-align: center; }
                    .sec { font-size: 7.5px; font-weight: bold; text-align: center; border: 1px solid #000; margin-top: -1px; padding: 2px; background: #f3f3f3; }
                    .stub td { height: 30px; }
                    .stub .txt b { white-space: normal !important; font-size: 7.5px !important; font-weight: normal !important; }
                    .cut { border-top: 1px dashed #000; margin: 6px 0 8px; }
                    .emit { text-align: center; vertical-align: middle !important; line-height: 1.45; }
                    .emit .nm { font-size: 12.5px; font-weight: bold; margin-bottom: 4px; }
                    .dacte { text-align: center; }
                    .dacte .t { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
                    .dacte .s { font-size: 7.5px; margin: 2px 0 4px; }
                    .bc { height: 46px; padding: 5px 6px 0; line-height: 0; font-size: 0; white-space: nowrap; text-align: center; }
                    .bc span { display: inline-block; height: 38px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .b1, .b2, .b3, .b4 { background: #000; }
                    .b1, .s1 { width: 1px; } .b2, .s2 { width: 2px; } .b3, .s3 { width: 3px; } .b4, .s4 { width: 4px; }
                    .kk b { text-align: center; letter-spacing: .5px; font-size: 9.5px !important; }
                    .cs { font-size: 7.5px; text-align: center; padding: 3px 4px; line-height: 1.35; }
                    .qr { width: 96px; height: 96px; margin: 4px auto; border: 1px dashed #6b7280; display: table; }
                    .qr span { display: table-cell; vertical-align: middle; text-align: center; color: #6b7280; font-size: 9px; }
                    td.pt { width: 50%; padding: 3px 6px 4px !important; }
                    .ph { font-size: 7px; font-weight: bold; }
                    .pn { font-size: 10.5px; font-weight: bold; margin: 1px 0 2px; }
                    .kv { border-collapse: collapse; width: 100%; }
                    .kv td { padding: 0 6px 1px 0; font-size: 8.5px; vertical-align: top; border: none; }
                    .kv td:nth-child(odd) { color: #444; font-size: 6.8px; white-space: nowrap; padding-top: 1px; }
                    table.cp { width: 100%; border-collapse: collapse; }
                    table.cp td { border: 1px solid #000; padding: 2px 5px; font-size: 9px; }
                    table.cp th { border: 1px solid #000; font-size: 6.8px; font-weight: normal; text-align: left; padding: 2px 5px; }
                    .obs td { height: 54px; }
                    .obs b { white-space: normal !important; font-weight: normal !important; font-size: 8.5px !important; line-height: 1.4; }
                    .wm { position: absolute; top: 300px; left: 0; right: 0; text-align: center; font-size: 22px; font-weight: bold; color: rgba(220, 38, 38, .55); transform: rotate(-18deg); }
                    @media print { html, body { background: #fff; } .page { width: 100%; padding: 0; } }
                </style>
            </head>
            <body>
                <div class="page">
                    <xsl:if test="$ide/cte:tpAmb = '2'"><div class="wm"><xsl:call-template name="t"><xsl:with-param name="k">homolog</xsl:with-param></xsl:call-template></div></xsl:if>

                    <table class="g stub">
                        <tr>
                            <td colspan="3" class="txt"><b><xsl:call-template name="t"><xsl:with-param name="k">canhoto</xsl:with-param></xsl:call-template></b></td>
                            <td rowspan="2" style="width:16%;text-align:center;vertical-align:middle;font-weight:bold;font-size:10px">CT-e<br/><xsl:call-template name="t"><xsl:with-param name="k">numero</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$ide/cte:nCT"/><br/><xsl:call-template name="t"><xsl:with-param name="k">serie</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$ide/cte:serie"/></td>
                        </tr>
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">nome</xsl:with-param><xsl:with-param name="w" select="30"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">ass</xsl:with-param></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">chegada</xsl:with-param><xsl:with-param name="w" select="20"/></xsl:call-template>
                        </tr>
                    </table>
                    <div class="cut"/>

                    <table class="g">
                        <tr>
                            <td class="emit" rowspan="3" style="width:32%">
                                <div class="nm"><xsl:value-of select="$emit/cte:xNome"/></div>
                                <div><xsl:value-of select="$emit/cte:enderEmit/cte:xLgr"/>, <xsl:value-of select="$emit/cte:enderEmit/cte:nro"/> – <xsl:value-of select="$emit/cte:enderEmit/cte:xBairro"/></div>
                                <div><xsl:value-of select="$emit/cte:enderEmit/cte:xMun"/> – <xsl:value-of select="$emit/cte:enderEmit/cte:UF"/> · <xsl:call-template name="t"><xsl:with-param name="k">cep</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:call-template name="cep"><xsl:with-param name="s" select="$emit/cte:enderEmit/cte:CEP"/></xsl:call-template></div>
                                <div>CNPJ <xsl:call-template name="doc"><xsl:with-param name="s" select="$emit/cte:CNPJ"/></xsl:call-template> · IE <xsl:value-of select="$emit/cte:IE"/></div>
                                <xsl:if test="$emit/cte:enderEmit/cte:fone"><div><xsl:call-template name="t"><xsl:with-param name="k">fone</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$emit/cte:enderEmit/cte:fone"/></div></xsl:if>
                            </td>
                            <td class="dacte" colspan="2" style="width:28%">
                                <div class="t">DACTE</div>
                                <div class="s"><xsl:call-template name="t"><xsl:with-param name="k">dacte</xsl:with-param></xsl:call-template></div>
                            </td>
                            <td rowspan="2" style="padding:0">
                                <xsl:call-template name="barcode"><xsl:with-param name="d" select="$chave"/></xsl:call-template>
                            </td>
                        </tr>
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">modal</xsl:with-param><xsl:with-param name="a" select="'c'"/><xsl:with-param name="v"><xsl:call-template name="t"><xsl:with-param name="k" select="concat('m', $ide/cte:modal)"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">dhEmi</xsl:with-param><xsl:with-param name="a" select="'c'"/><xsl:with-param name="v"><xsl:call-template name="dh"><xsl:with-param name="d" select="$ide/cte:dhEmi"/></xsl:call-template></xsl:with-param></xsl:call-template>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding:0">
                                <table class="g" style="margin:0">
                                    <tr>
                                        <xsl:call-template name="c"><xsl:with-param name="k">modelo</xsl:with-param><xsl:with-param name="a" select="'c'"/><xsl:with-param name="v" select="$ide/cte:mod"/></xsl:call-template>
                                        <xsl:call-template name="c"><xsl:with-param name="k">serie</xsl:with-param><xsl:with-param name="a" select="'c'"/><xsl:with-param name="v" select="$ide/cte:serie"/></xsl:call-template>
                                        <xsl:call-template name="c"><xsl:with-param name="k">numero</xsl:with-param><xsl:with-param name="a" select="'c'"/><xsl:with-param name="v" select="$ide/cte:nCT"/></xsl:call-template>
                                        <xsl:call-template name="c"><xsl:with-param name="k">fl</xsl:with-param><xsl:with-param name="a" select="'c'"/><xsl:with-param name="v" select="'1/1'"/></xsl:call-template>
                                    </tr>
                                </table>
                            </td>
                            <td class="kk"><i><xsl:call-template name="t"><xsl:with-param name="k">chave</xsl:with-param></xsl:call-template></i><b><xsl:call-template name="grp"><xsl:with-param name="s" select="$chave"/></xsl:call-template></b></td>
                        </tr>
                    </table>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">tpCTe</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="t"><xsl:with-param name="k" select="concat('tp', $ide/cte:tpCTe)"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">tpServ</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="t"><xsl:with-param name="k" select="concat('sv', $ide/cte:tpServ)"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">tomador</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="t"><xsl:with-param name="k" select="concat('tm', $toma)"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <td rowspan="3" style="width:34%;text-align:center">
                                <div class="qr"><span><xsl:call-template name="t"><xsl:with-param name="k">qr</xsl:with-param></xsl:call-template></span></div>
                                <div class="cs"><xsl:call-template name="t"><xsl:with-param name="k">consulta</xsl:with-param></xsl:call-template></div>
                            </td>
                        </tr>
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">cfop</xsl:with-param><xsl:with-param name="span" select="3"/><xsl:with-param name="v" select="concat($ide/cte:CFOP, ' – ', $ide/cte:natOp)"/></xsl:call-template>
                        </tr>
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">prot</xsl:with-param><xsl:with-param name="span" select="3"/>
                                <xsl:with-param name="v"><xsl:value-of select="$prot/cte:nProt"/><xsl:if test="$prot/cte:dhRecbto"> – <xsl:call-template name="dh"><xsl:with-param name="d" select="$prot/cte:dhRecbto"/></xsl:call-template></xsl:if></xsl:with-param>
                            </xsl:call-template>
                        </tr>
                    </table>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">ini</xsl:with-param><xsl:with-param name="v" select="concat($ide/cte:xMunIni, ' – ', $ide/cte:UFIni)"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">fim</xsl:with-param><xsl:with-param name="v" select="concat($ide/cte:xMunFim, ' – ', $ide/cte:UFFim)"/></xsl:call-template>
                        </tr>
                    </table>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="party"><xsl:with-param name="p" select="cte:rem"/><xsl:with-param name="e" select="cte:rem/cte:enderReme"/><xsl:with-param name="k">rem</xsl:with-param></xsl:call-template>
                            <xsl:call-template name="party"><xsl:with-param name="p" select="cte:dest"/><xsl:with-param name="e" select="cte:dest/cte:enderDest"/><xsl:with-param name="k">dest</xsl:with-param></xsl:call-template>
                        </tr>
                    </table>

                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">proPred</xsl:with-param><xsl:with-param name="w" select="40"/><xsl:with-param name="v" select="$norm/cte:infCarga/cte:proPred"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">outCat</xsl:with-param><xsl:with-param name="v" select="$norm/cte:infCarga/cte:xOutCat"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vCarga</xsl:with-param><xsl:with-param name="w" select="22"/><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v"><xsl:if test="$norm/cte:infCarga/cte:vCarga">R$ <xsl:value-of select="format-number($norm/cte:infCarga/cte:vCarga, $M, 'br')"/></xsl:if></xsl:with-param></xsl:call-template>
                        </tr>
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">qtd</xsl:with-param><xsl:with-param name="span" select="3"/>
                                <xsl:with-param name="v"><xsl:for-each select="$norm/cte:infCarga/cte:infQ"><xsl:if test="position() &gt; 1"> · </xsl:if><xsl:value-of select="cte:tpMed"/>: <xsl:value-of select="format-number(cte:qCarga, '#.##0,####', 'br')"/><xsl:text> </xsl:text><xsl:call-template name="t"><xsl:with-param name="k" select="concat('u', cte:cUnid)"/></xsl:call-template></xsl:for-each></xsl:with-param>
                            </xsl:call-template>
                        </tr>
                    </table>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">comp</xsl:with-param></xsl:call-template></div>
                    <table class="g">
                        <tr>
                            <td style="width:66%;padding:0">
                                <table class="cp">
                                    <tr>
                                        <th><xsl:call-template name="t"><xsl:with-param name="k">nomeComp</xsl:with-param></xsl:call-template></th><th style="text-align:right"><xsl:call-template name="t"><xsl:with-param name="k">valor</xsl:with-param></xsl:call-template></th>
                                        <th><xsl:call-template name="t"><xsl:with-param name="k">nomeComp</xsl:with-param></xsl:call-template></th><th style="text-align:right"><xsl:call-template name="t"><xsl:with-param name="k">valor</xsl:with-param></xsl:call-template></th>
                                    </tr>
                                    <xsl:for-each select="$prest/cte:Comp[position() mod 2 = 1]">
                                        <tr>
                                            <td><xsl:value-of select="cte:xNome"/></td><td style="text-align:right"><xsl:value-of select="format-number(cte:vComp, $M, 'br')"/></td>
                                            <xsl:variable name="next" select="following-sibling::cte:Comp[1]"/>
                                            <td><xsl:value-of select="$next/cte:xNome"/></td><td style="text-align:right"><xsl:if test="$next"><xsl:value-of select="format-number($next/cte:vComp, $M, 'br')"/></xsl:if></td>
                                        </tr>
                                    </xsl:for-each>
                                </table>
                            </td>
                            <td style="padding:0">
                                <table class="g" style="margin:0">
                                    <tr><xsl:call-template name="c"><xsl:with-param name="k">vTPrest</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="concat('R$ ', format-number(sum($prest/cte:vTPrest), $M, 'br'))"/></xsl:call-template></tr>
                                    <tr><xsl:call-template name="c"><xsl:with-param name="k">vRec</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="concat('R$ ', format-number(sum($prest/cte:vRec), $M, 'br'))"/></xsl:call-template></tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">imp</xsl:with-param></xsl:call-template></div>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">sitTrib</xsl:with-param><xsl:with-param name="w" select="32"/><xsl:with-param name="v"><xsl:call-template name="t"><xsl:with-param name="k" select="concat('st', $icms/cte:CST)"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">bc</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($icms/cte:vBC), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">aliq</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($icms/cte:pICMS), '0,00', 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vIcms</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($icms/cte:vICMS), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">redBc</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($icms/cte:pRedBC), '0,00', 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vTotTrib</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum(cte:imp/cte:vTotTrib), $M, 'br')"/></xsl:call-template>
                        </tr>
                        <xsl:if test="$ib">
                            <tr>
                                <xsl:call-template name="c"><xsl:with-param name="k">cstIbs</xsl:with-param><xsl:with-param name="v" select="concat($ib/cte:CST, ' · ', $ib/cte:cClassTrib)"/></xsl:call-template>
                                <xsl:call-template name="c"><xsl:with-param name="k">bcIbs</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($ib/cte:gIBSCBS/cte:vBC), $M, 'br')"/></xsl:call-template>
                                <xsl:call-template name="c"><xsl:with-param name="k">vIbsUf</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($ib/cte:gIBSCBS/cte:gIBSUF/cte:vIBSUF), $M, 'br')"/></xsl:call-template>
                                <xsl:call-template name="c"><xsl:with-param name="k">vIbsMun</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($ib/cte:gIBSCBS/cte:gIBSMun/cte:vIBSMun), $M, 'br')"/></xsl:call-template>
                                <xsl:call-template name="c"><xsl:with-param name="k">vCbs</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($ib/cte:gIBSCBS/cte:gCBS/cte:vCBS), $M, 'br')"/></xsl:call-template>
                                <td><i>&#160;</i><b>&#160;</b></td>
                            </tr>
                        </xsl:if>
                    </table>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">docs</xsl:with-param></xsl:call-template></div>
                    <table class="g">
                        <xsl:for-each select="$norm/cte:infDoc/cte:infNFe">
                            <xsl:variable name="ch" select="string(cte:chave)"/>
                            <tr>
                                <xsl:call-template name="c"><xsl:with-param name="k">tpDoc</xsl:with-param><xsl:with-param name="w" select="10"/><xsl:with-param name="v" select="'NF-e'"/></xsl:call-template>
                                <xsl:call-template name="c"><xsl:with-param name="k">emiDoc</xsl:with-param><xsl:with-param name="w" select="22"/><xsl:with-param name="v"><xsl:call-template name="doc"><xsl:with-param name="s" select="substring($ch, 7, 14)"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                <xsl:call-template name="c"><xsl:with-param name="k">nroDoc</xsl:with-param><xsl:with-param name="w" select="20"/><xsl:with-param name="v" select="concat(number(substring($ch, 23, 3)), ' / ', number(substring($ch, 26, 9)))"/></xsl:call-template>
                                <xsl:call-template name="c"><xsl:with-param name="k">chaveDoc</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="grp"><xsl:with-param name="s" select="$ch"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            </tr>
                        </xsl:for-each>
                    </table>

                    <table class="g obs">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">obs</xsl:with-param><xsl:with-param name="v" select="cte:compl/cte:xObs"/></xsl:call-template>
                        </tr>
                    </table>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">rodo</xsl:with-param></xsl:call-template></div>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">rntrc</xsl:with-param><xsl:with-param name="w" select="24"/><xsl:with-param name="v" select="$norm/cte:infModal/cte:rodo/cte:RNTRC"/></xsl:call-template>
                            <td style="vertical-align:middle;text-align:center;font-size:8px;font-weight:bold"><xsl:call-template name="t"><xsl:with-param name="k">lei</xsl:with-param></xsl:call-template></td>
                        </tr>
                    </table>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
