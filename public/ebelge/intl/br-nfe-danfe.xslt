<?xml version="1.0" encoding="UTF-8"?>
<!--
  DANFE (Documento Auxiliar da NF-e, modelo 55) — MOC 7.0 Anexo II, leiaute NF-e 4.00
  com o bloco "TOTAL DO IBS / CBS" da Reforma Tributária (NT 2025.002-RTC, NT 2026.010).
  Código de barras CODE-128C da chave de acesso; canhoto, fatura/duplicatas, transportador e itens.
  Rótulos: parâmetro "lang" = pt (padrão no Brasil) ou en.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:nfe="http://www.portalfiscal.inf.br/nfe" exclude-result-prefixes="nfe">

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
                <xsl:when test="$k='receb1'">|pt=RECEBEMOS DE |en=RECEIVED FROM |</xsl:when>
                <xsl:when test="$k='receb2'">|pt= OS PRODUTOS E/OU SERVIÇOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA AO LADO|en= THE GOODS AND/OR SERVICES LISTED IN THE ELECTRONIC INVOICE INDICATED ALONGSIDE|</xsl:when>
                <xsl:when test="$k='dtReceb'">|pt=DATA DE RECEBIMENTO|en=DATE RECEIVED|</xsl:when>
                <xsl:when test="$k='assReceb'">|pt=IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR|en=RECIPIENT'S NAME AND SIGNATURE|</xsl:when>
                <xsl:when test="$k='danfe'">|pt=Documento Auxiliar da Nota Fiscal Eletrônica|en=Auxiliary document of the electronic invoice|</xsl:when>
                <xsl:when test="$k='entSai'">|pt=0 - ENTRADA&lt;br/&gt;1 - SAÍDA|en=0 - INBOUND&lt;br/&gt;1 - OUTBOUND|</xsl:when>
                <xsl:when test="$k='no'">|pt=Nº|en=No.|</xsl:when>
                <xsl:when test="$k='serie'">|pt=SÉRIE|en=SERIES|</xsl:when>
                <xsl:when test="$k='folha'">|pt=FOLHA 1/1|en=SHEET 1/1|</xsl:when>
                <xsl:when test="$k='chave'">|pt=CHAVE DE ACESSO|en=ACCESS KEY|</xsl:when>
                <xsl:when test="$k='consulta'">|pt=Consulta de autenticidade no portal nacional da NF-e www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora|en=Verify authenticity on the national NF-e portal www.nfe.fazenda.gov.br/portal or on the authorising Sefaz website|</xsl:when>
                <xsl:when test="$k='natOp'">|pt=NATUREZA DA OPERAÇÃO|en=NATURE OF OPERATION|</xsl:when>
                <xsl:when test="$k='prot'">|pt=PROTOCOLO DE AUTORIZAÇÃO DE USO|en=AUTHORISATION PROTOCOL|</xsl:when>
                <xsl:when test="$k='ie'">|pt=INSCRIÇÃO ESTADUAL|en=STATE REGISTRATION (IE)|</xsl:when>
                <xsl:when test="$k='ieSt'">|pt=INSCRIÇÃO ESTADUAL DO SUBST. TRIBUT.|en=IE OF TAX SUBSTITUTE|</xsl:when>
                <xsl:when test="$k='cnpj'">|pt=CNPJ|en=CNPJ|</xsl:when>
                <xsl:when test="$k='crt'">|pt=CÓDIGO DE REGIME TRIBUTÁRIO|en=TAX REGIME CODE (CRT)|</xsl:when>
                <xsl:when test="$k='dest'">|pt=DESTINATÁRIO / REMETENTE|en=RECIPIENT / SENDER|</xsl:when>
                <xsl:when test="$k='nome'">|pt=NOME / RAZÃO SOCIAL|en=NAME / COMPANY NAME|</xsl:when>
                <xsl:when test="$k='cnpjCpf'">|pt=CNPJ / CPF|en=CNPJ / CPF|</xsl:when>
                <xsl:when test="$k='dtEmi'">|pt=DATA DA EMISSÃO|en=ISSUE DATE|</xsl:when>
                <xsl:when test="$k='end'">|pt=ENDEREÇO|en=ADDRESS|</xsl:when>
                <xsl:when test="$k='bairro'">|pt=BAIRRO / DISTRITO|en=DISTRICT|</xsl:when>
                <xsl:when test="$k='cep'">|pt=CEP|en=POSTCODE (CEP)|</xsl:when>
                <xsl:when test="$k='dtSai'">|pt=DATA DA SAÍDA / ENTRADA|en=EXIT / ENTRY DATE|</xsl:when>
                <xsl:when test="$k='mun'">|pt=MUNICÍPIO|en=MUNICIPALITY|</xsl:when>
                <xsl:when test="$k='fone'">|pt=FONE / FAX|en=PHONE|</xsl:when>
                <xsl:when test="$k='uf'">|pt=UF|en=STATE|</xsl:when>
                <xsl:when test="$k='hrSai'">|pt=HORA DA SAÍDA / ENTRADA|en=EXIT / ENTRY TIME|</xsl:when>
                <xsl:when test="$k='fatura'">|pt=FATURA / DUPLICATAS|en=INVOICE / INSTALMENTS|</xsl:when>
                <xsl:when test="$k='venc'">|pt=Venc.|en=Due|</xsl:when>
                <xsl:when test="$k='valor'">|pt=Valor|en=Amount|</xsl:when>
                <xsl:when test="$k='calc'">|pt=CÁLCULO DO IMPOSTO|en=TAX CALCULATION|</xsl:when>
                <xsl:when test="$k='bcIcms'">|pt=BASE DE CÁLC. DO ICMS|en=ICMS TAX BASE|</xsl:when>
                <xsl:when test="$k='vIcms'">|pt=VALOR DO ICMS|en=ICMS AMOUNT|</xsl:when>
                <xsl:when test="$k='bcSt'">|pt=BASE DE CÁLC. ICMS S.T.|en=ICMS ST TAX BASE|</xsl:when>
                <xsl:when test="$k='vSt'">|pt=VALOR DO ICMS SUBST.|en=ICMS ST AMOUNT|</xsl:when>
                <xsl:when test="$k='vTotTrib'">|pt=V. APROX. DOS TRIBUTOS|en=APPROX. TAXES|</xsl:when>
                <xsl:when test="$k='vProd'">|pt=V. TOTAL DOS PRODUTOS|en=TOTAL PRODUCTS|</xsl:when>
                <xsl:when test="$k='vFrete'">|pt=VALOR DO FRETE|en=FREIGHT|</xsl:when>
                <xsl:when test="$k='vSeg'">|pt=VALOR DO SEGURO|en=INSURANCE|</xsl:when>
                <xsl:when test="$k='vDesc'">|pt=DESCONTO|en=DISCOUNT|</xsl:when>
                <xsl:when test="$k='vOutro'">|pt=OUTRAS DESPESAS|en=OTHER EXPENSES|</xsl:when>
                <xsl:when test="$k='vIpi'">|pt=VALOR TOTAL DO IPI|en=IPI AMOUNT|</xsl:when>
                <xsl:when test="$k='vPis'">|pt=VALOR DO PIS|en=PIS AMOUNT|</xsl:when>
                <xsl:when test="$k='vCofins'">|pt=VALOR DA COFINS|en=COFINS AMOUNT|</xsl:when>
                <xsl:when test="$k='vNF'">|pt=V. TOTAL DA NOTA|en=INVOICE TOTAL|</xsl:when>
                <xsl:when test="$k='rtc'">|pt=TOTAL DO IBS / CBS|en=IBS / CBS TOTALS|</xsl:when>
                <xsl:when test="$k='bcIbsCbs'">|pt=BASE DE CÁLC. IBS / CBS|en=IBS / CBS TAX BASE|</xsl:when>
                <xsl:when test="$k='vIbsUf'">|pt=VALOR DO IBS UF|en=IBS (STATE)|</xsl:when>
                <xsl:when test="$k='vIbsMun'">|pt=VALOR DO IBS MUNICIPAL|en=IBS (MUNICIPAL)|</xsl:when>
                <xsl:when test="$k='vIbs'">|pt=VALOR TOTAL DO IBS|en=TOTAL IBS|</xsl:when>
                <xsl:when test="$k='vCbs'">|pt=VALOR DA CBS|en=CBS AMOUNT|</xsl:when>
                <xsl:when test="$k='vCredPres'">|pt=CRÉDITO PRESUMIDO|en=PRESUMED CREDIT|</xsl:when>
                <xsl:when test="$k='transp'">|pt=TRANSPORTADOR / VOLUMES TRANSPORTADOS|en=CARRIER / PACKAGES|</xsl:when>
                <xsl:when test="$k='modFrete'">|pt=FRETE POR CONTA|en=FREIGHT PAID BY|</xsl:when>
                <xsl:when test="$k='antt'">|pt=CÓDIGO ANTT|en=ANTT CODE|</xsl:when>
                <xsl:when test="$k='placa'">|pt=PLACA DO VEÍCULO|en=VEHICLE PLATE|</xsl:when>
                <xsl:when test="$k='qVol'">|pt=QUANTIDADE|en=QUANTITY|</xsl:when>
                <xsl:when test="$k='esp'">|pt=ESPÉCIE|en=TYPE|</xsl:when>
                <xsl:when test="$k='marca'">|pt=MARCA|en=BRAND|</xsl:when>
                <xsl:when test="$k='nVol'">|pt=NUMERAÇÃO|en=NUMBERING|</xsl:when>
                <xsl:when test="$k='pesoB'">|pt=PESO BRUTO|en=GROSS WEIGHT|</xsl:when>
                <xsl:when test="$k='pesoL'">|pt=PESO LÍQUIDO|en=NET WEIGHT|</xsl:when>
                <xsl:when test="$k='itens'">|pt=DADOS DOS PRODUTOS / SERVIÇOS|en=PRODUCTS / SERVICES|</xsl:when>
                <xsl:when test="$k='cod'">|pt=CÓDIGO|en=CODE|</xsl:when>
                <xsl:when test="$k='desc'">|pt=DESCRIÇÃO DO PRODUTO / SERVIÇO|en=DESCRIPTION OF GOODS / SERVICES|</xsl:when>
                <xsl:when test="$k='ncm'">|pt=NCM/SH&lt;br/&gt;cClassTrib|en=NCM/SH&lt;br/&gt;cClassTrib|</xsl:when>
                <xsl:when test="$k='cst'">|pt=CST&lt;br/&gt;CFOP|en=CST&lt;br/&gt;CFOP|</xsl:when>
                <xsl:when test="$k='un'">|pt=UN|en=UNIT|</xsl:when>
                <xsl:when test="$k='qtd'">|pt=QUANT.|en=QTY|</xsl:when>
                <xsl:when test="$k='vUn'">|pt=VALOR UNIT.|en=UNIT PRICE|</xsl:when>
                <xsl:when test="$k='vTot'">|pt=VALOR TOTAL|en=TOTAL|</xsl:when>
                <xsl:when test="$k='bases'">|pt=BC ICMS&lt;br/&gt;BC IBS/CBS|en=ICMS BASE&lt;br/&gt;IBS/CBS BASE|</xsl:when>
                <xsl:when test="$k='icms'">|pt=ALÍQ. ICMS&lt;br/&gt;V. ICMS|en=ICMS %&lt;br/&gt;ICMS|</xsl:when>
                <xsl:when test="$k='cbs'">|pt=ALÍQ. CBS&lt;br/&gt;V. CBS|en=CBS %&lt;br/&gt;CBS|</xsl:when>
                <xsl:when test="$k='ibsuf'">|pt=ALÍQ. IBS UF&lt;br/&gt;V. IBS UF|en=IBS UF %&lt;br/&gt;IBS UF|</xsl:when>
                <xsl:when test="$k='adic'">|pt=DADOS ADICIONAIS|en=ADDITIONAL DATA|</xsl:when>
                <xsl:when test="$k='infCpl'">|pt=INFORMAÇÕES COMPLEMENTARES|en=COMPLEMENTARY INFORMATION|</xsl:when>
                <xsl:when test="$k='fisco'">|pt=RESERVADO AO FISCO|en=RESERVED FOR THE TAX AUTHORITY|</xsl:when>
                <xsl:when test="$k='ref'">|pt=NF-e referenciada|en=Referenced NF-e|</xsl:when>
                <xsl:when test="$k='homolog'">|pt=NF-E EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO – SEM VALOR FISCAL|en=NF-E ISSUED IN THE TEST ENVIRONMENT – NO FISCAL VALUE|</xsl:when>
                <xsl:when test="$k='fin1'">|pt=NF-e|en=NF-e|</xsl:when>
                <xsl:when test="$k='fin2'">|pt=NF-e complementar|en=Supplementary NF-e|</xsl:when>
                <xsl:when test="$k='fin3'">|pt=NF-e de ajuste|en=Adjustment NF-e|</xsl:when>
                <xsl:when test="$k='fin4'">|pt=Devolução de mercadoria|en=Return of goods|</xsl:when>
                <xsl:when test="$k='fin5'">|pt=Nota de crédito|en=Credit note|</xsl:when>
                <xsl:when test="$k='fin6'">|pt=Nota de débito|en=Debit note|</xsl:when>
                <xsl:when test="$k='crt1'">|pt=1 - Simples Nacional|en=1 - Simples Nacional|</xsl:when>
                <xsl:when test="$k='crt2'">|pt=2 - Simples Nacional, excesso de sublimite|en=2 - Simples Nacional, above sub-limit|</xsl:when>
                <xsl:when test="$k='crt3'">|pt=3 - Regime Normal|en=3 - Normal regime|</xsl:when>
                <xsl:when test="$k='crt4'">|pt=4 - MEI|en=4 - MEI|</xsl:when>
                <xsl:when test="$k='frete0'">|pt=0 - Remetente (CIF)|en=0 - Sender (CIF)|</xsl:when>
                <xsl:when test="$k='frete1'">|pt=1 - Destinatário (FOB)|en=1 - Recipient (FOB)|</xsl:when>
                <xsl:when test="$k='frete2'">|pt=2 - Terceiros|en=2 - Third party|</xsl:when>
                <xsl:when test="$k='frete3'">|pt=3 - Próprio remetente|en=3 - Own transport (sender)|</xsl:when>
                <xsl:when test="$k='frete4'">|pt=4 - Próprio destinatário|en=4 - Own transport (recipient)|</xsl:when>
                <xsl:when test="$k='frete9'">|pt=9 - Sem ocorrência de transporte|en=9 - No transport|</xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="hit" select="substring-before(substring-after($row, concat('|', $L, '=')), '|')"/>
        <xsl:variable name="out">
            <xsl:choose>
                <xsl:when test="$hit != ''"><xsl:value-of select="$hit"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="substring-before(substring-after($row, '|pt='), '|')"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="contains($out, '&lt;br/&gt;')"><xsl:value-of select="substring-before($out, '&lt;br/&gt;')"/><br/><xsl:value-of select="substring-after($out, '&lt;br/&gt;')"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$out"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Célula de formulário: rótulo pequeno e valor; vazio mostra espaço. -->
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

    <xsl:template name="dt">
        <xsl:param name="d"/>
        <xsl:if test="string-length($d) &gt;= 10"><xsl:value-of select="concat(substring($d,9,2),'/',substring($d,6,2),'/',substring($d,1,4))"/></xsl:if>
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

    <xsl:template match="/">
        <xsl:apply-templates select="nfe:nfeProc/nfe:NFe/nfe:infNFe | nfe:NFe/nfe:infNFe"/>
    </xsl:template>

    <xsl:template match="nfe:infNFe">
        <xsl:variable name="ide" select="nfe:ide"/>
        <xsl:variable name="emit" select="nfe:emit"/>
        <xsl:variable name="dest" select="nfe:dest"/>
        <xsl:variable name="tot" select="nfe:total/nfe:ICMSTot"/>
        <xsl:variable name="rtc" select="nfe:total/nfe:IBSCBSTot"/>
        <xsl:variable name="tr" select="nfe:transp"/>
        <xsl:variable name="prot" select="/nfe:nfeProc/nfe:protNFe/nfe:infProt"/>
        <xsl:variable name="chave" select="substring-after(@Id, 'NFe')"/>
        <xsl:variable name="nNF" select="format-number($ide/nfe:nNF, '000.000.000', 'br')"/>
        <xsl:variable name="serie" select="format-number($ide/nfe:serie, '000')"/>
        <html lang="{$L}">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title>DANFE <xsl:value-of select="$nNF"/></title>
                <style type="text/css">
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; background: #eef1f5; color: #000; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; }
                    table { font-size: inherit; color: inherit; }
                    .page { width: 794px; margin: 0 auto; background: #fff; padding: 16px 20px 22px; position: relative; }
                    table.g { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: -1px; }
                    table.g td { border: 1px solid #000; padding: 1px 4px 2px; vertical-align: top; overflow: hidden; }
                    table.g td i { display: block; font-style: normal; font-size: 6.5px; letter-spacing: .2px; color: #222; white-space: nowrap; }
                    table.g td b { display: block; font-size: 9.5px; min-height: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    table.g td.r b { text-align: right; }
                    table.g td.c b { text-align: center; }
                    .sec { font-size: 7.5px; font-weight: bold; margin: 7px 0 2px; }
                    .stub td { height: 34px; }
                    .stub .nf { text-align: center; font-weight: bold; font-size: 11px; vertical-align: middle; }
                    .cut { border-top: 1px dashed #000; margin: 6px 0 8px; }
                    .head td { height: 128px; }
                    .emit { text-align: center; vertical-align: middle !important; }
                    .emit .nm { font-size: 13px; font-weight: bold; margin-bottom: 6px; }
                    .emit div { line-height: 1.45; }
                    .danfe { text-align: center; }
                    .danfe .t { font-size: 17px; font-weight: bold; letter-spacing: 1px; margin-top: 2px; }
                    .danfe .s { font-size: 8px; margin: 2px 0 6px; }
                    .danfe .tp { display: table; margin: 0 auto 6px; font-size: 7.5px; text-align: left; }
                    .danfe .tp span { display: table-cell; vertical-align: middle; padding-right: 8px; }
                    .danfe .tp em { display: table-cell; vertical-align: middle; font-style: normal; border: 1px solid #000; width: 20px; height: 20px; text-align: center; font-size: 13px; font-weight: bold; }
                    .danfe .no { font-size: 10.5px; font-weight: bold; line-height: 1.4; }
                    .key { padding: 0 !important; }
                    .key .kk { border-top: 1px solid #000; padding: 1px 4px 2px; }
                    .key .kk i { display: block; font-style: normal; font-size: 6.5px; }
                    .key .kk b { display: block; font-size: 10px; text-align: center; letter-spacing: .6px; }
                    .key .cs { border-top: 1px solid #000; padding: 4px 6px; font-size: 8.5px; text-align: center; line-height: 1.35; }
                    .bc { height: 46px; padding: 5px 10px 0; line-height: 0; font-size: 0; white-space: nowrap; text-align: center; }
                    .bc span { display: inline-block; height: 38px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .b1, .b2, .b3, .b4 { background: #000; }
                    .b1, .s1 { width: 1px; } .b2, .s2 { width: 2px; } .b3, .s3 { width: 3px; } .b4, .s4 { width: 4px; }
                    .dups { display: table; width: 100%; border-collapse: collapse; margin-top: -1px; }
                    .dups > div { display: table-cell; border: 1px solid #000; padding: 2px 6px; font-size: 8.5px; line-height: 1.4; }
                    table.it { width: 100%; border-collapse: collapse; table-layout: fixed; }
                    table.it th { border: 1px solid #000; font-size: 6.3px; font-weight: normal; padding: 2px 1px; text-align: center; vertical-align: middle; line-height: 1.25; }
                    table.it td { border-left: 1px solid #000; border-right: 1px solid #000; font-size: 7.6px; padding: 2px 2px; vertical-align: top; line-height: 1.35; }
                    table.it tbody tr:last-child td { border-bottom: 1px solid #000; }
                    table.it td.n { text-align: right; white-space: nowrap; }
                    table.it td.m { text-align: center; }
                    .adic td { height: 92px; }
                    .adic b { white-space: normal !important; font-weight: normal !important; font-size: 8.5px !important; line-height: 1.4; }
                    .wm { position: absolute; top: 300px; left: 0; right: 0; text-align: center; font-size: 22px; font-weight: bold; color: rgba(220, 38, 38, .55); transform: rotate(-18deg); }
                    @media print { html, body { background: #fff; } .page { width: 100%; padding: 0; } }
                </style>
            </head>
            <body>
                <div class="page">
                    <xsl:if test="$ide/nfe:tpAmb = '2'"><div class="wm"><xsl:call-template name="t"><xsl:with-param name="k">homolog</xsl:with-param></xsl:call-template></div></xsl:if>

                    <!-- Canhoto -->
                    <table class="g stub">
                        <tr>
                            <td colspan="2" style="width:82%"><b style="white-space:normal;font-size:8px;font-weight:normal"><xsl:call-template name="t"><xsl:with-param name="k">receb1</xsl:with-param></xsl:call-template><xsl:value-of select="$emit/nfe:xNome"/><xsl:call-template name="t"><xsl:with-param name="k">receb2</xsl:with-param></xsl:call-template></b></td>
                            <td rowspan="2" class="nf" style="width:18%">NF-e<br/><xsl:call-template name="t"><xsl:with-param name="k">no</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$nNF"/><br/><xsl:call-template name="t"><xsl:with-param name="k">serie</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$serie"/></td>
                        </tr>
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">dtReceb</xsl:with-param><xsl:with-param name="w" select="22"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">assReceb</xsl:with-param></xsl:call-template>
                        </tr>
                    </table>
                    <div class="cut"/>

                    <!-- Emitente, DANFE, chave -->
                    <table class="g head">
                        <tr>
                            <td class="emit" style="width:39%">
                                <div class="nm"><xsl:value-of select="$emit/nfe:xNome"/></div>
                                <div><xsl:value-of select="$emit/nfe:enderEmit/nfe:xLgr"/>, <xsl:value-of select="$emit/nfe:enderEmit/nfe:nro"/></div>
                                <div><xsl:value-of select="$emit/nfe:enderEmit/nfe:xBairro"/> – <xsl:call-template name="cep"><xsl:with-param name="s" select="$emit/nfe:enderEmit/nfe:CEP"/></xsl:call-template></div>
                                <div><xsl:value-of select="$emit/nfe:enderEmit/nfe:xMun"/> – <xsl:value-of select="$emit/nfe:enderEmit/nfe:UF"/></div>
                                <xsl:if test="$emit/nfe:enderEmit/nfe:fone"><div><xsl:call-template name="t"><xsl:with-param name="k">fone</xsl:with-param></xsl:call-template>: <xsl:value-of select="$emit/nfe:enderEmit/nfe:fone"/></div></xsl:if>
                            </td>
                            <td class="danfe" style="width:19%">
                                <div class="t">DANFE</div>
                                <div class="s"><xsl:call-template name="t"><xsl:with-param name="k">danfe</xsl:with-param></xsl:call-template></div>
                                <div class="tp"><span><xsl:call-template name="t"><xsl:with-param name="k">entSai</xsl:with-param></xsl:call-template></span><em><xsl:value-of select="$ide/nfe:tpNF"/></em></div>
                                <div class="no"><xsl:call-template name="t"><xsl:with-param name="k">no</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$nNF"/></div>
                                <div class="no"><xsl:call-template name="t"><xsl:with-param name="k">serie</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$serie"/></div>
                                <div class="no" style="font-weight:normal;font-size:8.5px"><xsl:call-template name="t"><xsl:with-param name="k">folha</xsl:with-param></xsl:call-template></div>
                            </td>
                            <td class="key">
                                <xsl:call-template name="barcode"><xsl:with-param name="d" select="$chave"/></xsl:call-template>
                                <div class="kk"><i><xsl:call-template name="t"><xsl:with-param name="k">chave</xsl:with-param></xsl:call-template></i><b><xsl:call-template name="grp"><xsl:with-param name="s" select="$chave"/></xsl:call-template></b></div>
                                <div class="cs"><xsl:call-template name="t"><xsl:with-param name="k">consulta</xsl:with-param></xsl:call-template></div>
                            </td>
                        </tr>
                    </table>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">natOp</xsl:with-param><xsl:with-param name="v" select="$ide/nfe:natOp"/><xsl:with-param name="w" select="58"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">prot</xsl:with-param><xsl:with-param name="a" select="'c'"/>
                                <xsl:with-param name="v"><xsl:value-of select="$prot/nfe:nProt"/><xsl:if test="$prot/nfe:dhRecbto"> – <xsl:call-template name="dt"><xsl:with-param name="d" select="$prot/nfe:dhRecbto"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="substring($prot/nfe:dhRecbto, 12, 8)"/></xsl:if></xsl:with-param>
                            </xsl:call-template>
                        </tr>
                    </table>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">ie</xsl:with-param><xsl:with-param name="v" select="$emit/nfe:IE"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">ieSt</xsl:with-param><xsl:with-param name="v" select="$emit/nfe:IEST"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">cnpj</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="doc"><xsl:with-param name="s" select="$emit/nfe:CNPJ | $emit/nfe:CPF"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">crt</xsl:with-param><xsl:with-param name="w" select="31"/><xsl:with-param name="v"><xsl:call-template name="t"><xsl:with-param name="k" select="concat('crt', $emit/nfe:CRT)"/></xsl:call-template></xsl:with-param></xsl:call-template>
                        </tr>
                    </table>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">dest</xsl:with-param></xsl:call-template></div>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">nome</xsl:with-param><xsl:with-param name="v" select="$dest/nfe:xNome"/><xsl:with-param name="span" select="2"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">cnpjCpf</xsl:with-param><xsl:with-param name="w" select="20"/><xsl:with-param name="v"><xsl:call-template name="doc"><xsl:with-param name="s" select="$dest/nfe:CNPJ | $dest/nfe:CPF"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">dtEmi</xsl:with-param><xsl:with-param name="w" select="15"/><xsl:with-param name="a" select="'c'"/><xsl:with-param name="v"><xsl:call-template name="dt"><xsl:with-param name="d" select="$ide/nfe:dhEmi"/></xsl:call-template></xsl:with-param></xsl:call-template>
                        </tr>
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">end</xsl:with-param><xsl:with-param name="w" select="42"/><xsl:with-param name="v" select="concat($dest/nfe:enderDest/nfe:xLgr, ', ', $dest/nfe:enderDest/nfe:nro)"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">bairro</xsl:with-param><xsl:with-param name="v" select="$dest/nfe:enderDest/nfe:xBairro"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">cep</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="cep"><xsl:with-param name="s" select="$dest/nfe:enderDest/nfe:CEP"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">dtSai</xsl:with-param><xsl:with-param name="a" select="'c'"/><xsl:with-param name="v"><xsl:call-template name="dt"><xsl:with-param name="d" select="$ide/nfe:dhSaiEnt"/></xsl:call-template></xsl:with-param></xsl:call-template>
                        </tr>
                    </table>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">mun</xsl:with-param><xsl:with-param name="w" select="32"/><xsl:with-param name="v" select="$dest/nfe:enderDest/nfe:xMun"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">fone</xsl:with-param><xsl:with-param name="v" select="$dest/nfe:enderDest/nfe:fone"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">uf</xsl:with-param><xsl:with-param name="w" select="6"/><xsl:with-param name="a" select="'c'"/><xsl:with-param name="v" select="$dest/nfe:enderDest/nfe:UF"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">ie</xsl:with-param><xsl:with-param name="w" select="20"/><xsl:with-param name="v" select="$dest/nfe:IE"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">hrSai</xsl:with-param><xsl:with-param name="w" select="15"/><xsl:with-param name="a" select="'c'"/><xsl:with-param name="v" select="substring($ide/nfe:dhSaiEnt, 12, 8)"/></xsl:call-template>
                        </tr>
                    </table>

                    <xsl:if test="nfe:cobr/nfe:dup">
                        <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">fatura</xsl:with-param></xsl:call-template></div>
                        <div class="dups">
                            <xsl:for-each select="nfe:cobr/nfe:dup">
                                <div>
                                    <xsl:call-template name="t"><xsl:with-param name="k">no</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><b><xsl:value-of select="nfe:nDup"/></b><br/>
                                    <xsl:call-template name="t"><xsl:with-param name="k">venc</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:call-template name="dt"><xsl:with-param name="d" select="nfe:dVenc"/></xsl:call-template><br/>
                                    <xsl:call-template name="t"><xsl:with-param name="k">valor</xsl:with-param></xsl:call-template> R$ <b><xsl:value-of select="format-number(nfe:vDup, $M, 'br')"/></b>
                                </div>
                            </xsl:for-each>
                        </div>
                    </xsl:if>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">calc</xsl:with-param></xsl:call-template></div>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">bcIcms</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vBC), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vIcms</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vICMS), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">bcSt</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vBCST), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vSt</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vST), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vPis</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vPIS), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vProd</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vProd), $M, 'br')"/></xsl:call-template>
                        </tr>
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">vFrete</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vFrete), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vSeg</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vSeg), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vDesc</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vDesc), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vOutro</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vOutro), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vCofins</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vCOFINS), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vNF</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vNF), $M, 'br')"/></xsl:call-template>
                        </tr>
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">vIpi</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vIPI), $M, 'br')"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">vTotTrib</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($tot/nfe:vTotTrib), $M, 'br')"/></xsl:call-template>
                            <td colspan="4" style="border-left-color:#000"><i>&#160;</i><b>&#160;</b></td>
                        </tr>
                    </table>

                    <xsl:if test="$rtc">
                        <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">rtc</xsl:with-param></xsl:call-template></div>
                        <table class="g">
                            <tr>
                                <xsl:call-template name="c"><xsl:with-param name="k">bcIbsCbs</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($rtc/nfe:vBCIBSCBS), $M, 'br')"/></xsl:call-template>
                                <xsl:call-template name="c"><xsl:with-param name="k">vIbsUf</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($rtc/nfe:gIBS/nfe:gIBSUF/nfe:vIBSUF), $M, 'br')"/></xsl:call-template>
                                <xsl:call-template name="c"><xsl:with-param name="k">vIbsMun</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($rtc/nfe:gIBS/nfe:gIBSMun/nfe:vIBSMun), $M, 'br')"/></xsl:call-template>
                                <xsl:call-template name="c"><xsl:with-param name="k">vIbs</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($rtc/nfe:gIBS/nfe:vIBS), $M, 'br')"/></xsl:call-template>
                                <xsl:call-template name="c"><xsl:with-param name="k">vCbs</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($rtc/nfe:gCBS/nfe:vCBS), $M, 'br')"/></xsl:call-template>
                                <xsl:call-template name="c"><xsl:with-param name="k">vCredPres</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="format-number(sum($rtc/nfe:gIBS/nfe:vCredPres) + sum($rtc/nfe:gCBS/nfe:vCredPres), $M, 'br')"/></xsl:call-template>
                            </tr>
                        </table>
                    </xsl:if>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">transp</xsl:with-param></xsl:call-template></div>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">nome</xsl:with-param><xsl:with-param name="w" select="34"/><xsl:with-param name="v" select="$tr/nfe:transporta/nfe:xNome"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">modFrete</xsl:with-param><xsl:with-param name="w" select="18"/><xsl:with-param name="v"><xsl:call-template name="t"><xsl:with-param name="k" select="concat('frete', $tr/nfe:modFrete)"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">antt</xsl:with-param><xsl:with-param name="v" select="$tr/nfe:veicTransp/nfe:RNTC"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">placa</xsl:with-param><xsl:with-param name="v" select="$tr/nfe:veicTransp/nfe:placa"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">uf</xsl:with-param><xsl:with-param name="w" select="5"/><xsl:with-param name="a" select="'c'"/><xsl:with-param name="v" select="$tr/nfe:veicTransp/nfe:UF"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">cnpjCpf</xsl:with-param><xsl:with-param name="w" select="17"/><xsl:with-param name="v"><xsl:call-template name="doc"><xsl:with-param name="s" select="$tr/nfe:transporta/nfe:CNPJ | $tr/nfe:transporta/nfe:CPF"/></xsl:call-template></xsl:with-param></xsl:call-template>
                        </tr>
                    </table>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">end</xsl:with-param><xsl:with-param name="w" select="42"/><xsl:with-param name="v" select="$tr/nfe:transporta/nfe:xEnder"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">mun</xsl:with-param><xsl:with-param name="v" select="$tr/nfe:transporta/nfe:xMun"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">uf</xsl:with-param><xsl:with-param name="w" select="5"/><xsl:with-param name="a" select="'c'"/><xsl:with-param name="v" select="$tr/nfe:transporta/nfe:UF"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">ie</xsl:with-param><xsl:with-param name="w" select="17"/><xsl:with-param name="v" select="$tr/nfe:transporta/nfe:IE"/></xsl:call-template>
                        </tr>
                    </table>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="c"><xsl:with-param name="k">qVol</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v" select="$tr/nfe:vol/nfe:qVol"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">esp</xsl:with-param><xsl:with-param name="v" select="$tr/nfe:vol/nfe:esp"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">marca</xsl:with-param><xsl:with-param name="v" select="$tr/nfe:vol/nfe:marca"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">nVol</xsl:with-param><xsl:with-param name="v" select="$tr/nfe:vol/nfe:nVol"/></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">pesoB</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v"><xsl:if test="$tr/nfe:vol/nfe:pesoB"><xsl:value-of select="format-number(sum($tr/nfe:vol/nfe:pesoB), '#.##0,000', 'br')"/></xsl:if></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="c"><xsl:with-param name="k">pesoL</xsl:with-param><xsl:with-param name="a" select="'r'"/><xsl:with-param name="v"><xsl:if test="$tr/nfe:vol/nfe:pesoL"><xsl:value-of select="format-number(sum($tr/nfe:vol/nfe:pesoL), '#.##0,000', 'br')"/></xsl:if></xsl:with-param></xsl:call-template>
                        </tr>
                    </table>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">itens</xsl:with-param></xsl:call-template></div>
                    <table class="it">
                        <thead>
                            <tr>
                                <th style="width:8%"><xsl:call-template name="t"><xsl:with-param name="k">cod</xsl:with-param></xsl:call-template></th>
                                <th><xsl:call-template name="t"><xsl:with-param name="k">desc</xsl:with-param></xsl:call-template></th>
                                <th style="width:7.5%"><xsl:call-template name="t"><xsl:with-param name="k">ncm</xsl:with-param></xsl:call-template></th>
                                <th style="width:5%"><xsl:call-template name="t"><xsl:with-param name="k">cst</xsl:with-param></xsl:call-template></th>
                                <th style="width:4%"><xsl:call-template name="t"><xsl:with-param name="k">un</xsl:with-param></xsl:call-template></th>
                                <th style="width:6.5%"><xsl:call-template name="t"><xsl:with-param name="k">qtd</xsl:with-param></xsl:call-template></th>
                                <th style="width:7.5%"><xsl:call-template name="t"><xsl:with-param name="k">vUn</xsl:with-param></xsl:call-template></th>
                                <th style="width:8%"><xsl:call-template name="t"><xsl:with-param name="k">vTot</xsl:with-param></xsl:call-template></th>
                                <th style="width:8%"><xsl:call-template name="t"><xsl:with-param name="k">bases</xsl:with-param></xsl:call-template></th>
                                <th style="width:7%"><xsl:call-template name="t"><xsl:with-param name="k">icms</xsl:with-param></xsl:call-template></th>
                                <th style="width:6.5%"><xsl:call-template name="t"><xsl:with-param name="k">cbs</xsl:with-param></xsl:call-template></th>
                                <th style="width:6.5%"><xsl:call-template name="t"><xsl:with-param name="k">ibsuf</xsl:with-param></xsl:call-template></th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="nfe:det">
                                <xsl:variable name="icms" select="nfe:imposto/nfe:ICMS/*"/>
                                <xsl:variable name="ib" select="nfe:imposto/nfe:IBSCBS"/>
                                <tr>
                                    <td><xsl:value-of select="nfe:prod/nfe:cProd"/></td>
                                    <td><xsl:value-of select="nfe:prod/nfe:xProd"/><xsl:if test="nfe:infAdProd"><br/><span style="color:#444"><xsl:value-of select="nfe:infAdProd"/></span></xsl:if></td>
                                    <td class="m"><xsl:value-of select="nfe:prod/nfe:NCM"/><br/><xsl:value-of select="$ib/nfe:cClassTrib"/></td>
                                    <td class="m"><xsl:value-of select="$icms/nfe:orig"/><xsl:value-of select="$icms/nfe:CST | $icms/nfe:CSOSN"/><br/><xsl:value-of select="nfe:prod/nfe:CFOP"/></td>
                                    <td class="m"><xsl:value-of select="nfe:prod/nfe:uCom"/></td>
                                    <td class="n"><xsl:value-of select="format-number(nfe:prod/nfe:qCom, '#.##0,0000', 'br')"/></td>
                                    <td class="n"><xsl:value-of select="format-number(nfe:prod/nfe:vUnCom, $M, 'br')"/></td>
                                    <td class="n"><xsl:value-of select="format-number(nfe:prod/nfe:vProd, $M, 'br')"/></td>
                                    <td class="n"><xsl:value-of select="format-number(sum($icms/nfe:vBC), $M, 'br')"/><br/><xsl:value-of select="format-number(sum($ib/nfe:gIBSCBS/nfe:vBC), $M, 'br')"/></td>
                                    <td class="n"><xsl:value-of select="format-number(sum($icms/nfe:pICMS), '0,00', 'br')"/><br/><xsl:value-of select="format-number(sum($icms/nfe:vICMS), $M, 'br')"/></td>
                                    <td class="n"><xsl:value-of select="format-number(sum($ib/nfe:gIBSCBS/nfe:gCBS/nfe:pCBS), '0,00', 'br')"/><br/><xsl:value-of select="format-number(sum($ib/nfe:gIBSCBS/nfe:gCBS/nfe:vCBS), $M, 'br')"/></td>
                                    <td class="n"><xsl:value-of select="format-number(sum($ib/nfe:gIBSCBS/nfe:gIBSUF/nfe:pIBSUF), '0,00', 'br')"/><br/><xsl:value-of select="format-number(sum($ib/nfe:gIBSCBS/nfe:gIBSUF/nfe:vIBSUF), $M, 'br')"/></td>
                                </tr>
                            </xsl:for-each>
                        </tbody>
                    </table>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">adic</xsl:with-param></xsl:call-template></div>
                    <table class="g adic">
                        <tr>
                            <td style="width:68%">
                                <i><xsl:call-template name="t"><xsl:with-param name="k">infCpl</xsl:with-param></xsl:call-template></i>
                                <b>
                                    <xsl:call-template name="t"><xsl:with-param name="k" select="concat('fin', $ide/nfe:finNFe)"/></xsl:call-template>.<xsl:text> </xsl:text>
                                    <xsl:for-each select="$ide/nfe:NFref/nfe:refNFe"><xsl:call-template name="t"><xsl:with-param name="k">ref</xsl:with-param></xsl:call-template>: <xsl:call-template name="grp"><xsl:with-param name="s" select="."/></xsl:call-template>. </xsl:for-each>
                                    <xsl:value-of select="nfe:infAdic/nfe:infCpl"/>
                                </b>
                            </td>
                            <td>
                                <i><xsl:call-template name="t"><xsl:with-param name="k">fisco</xsl:with-param></xsl:call-template></i>
                                <b><xsl:value-of select="nfe:infAdic/nfe:infAdFisco"/></b>
                            </td>
                        </tr>
                    </table>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
