<?xml version="1.0" encoding="UTF-8"?>
<!--
  DANFSe v2.0 (Documento Auxiliar da NFS-e, Padrão Nacional) — NT SE/CGNFS-e nº 008/2026:
  A4 retrato, uma página; blocos de prestador, tomador, intermediário, serviço, tributação
  municipal (ISSQN), federal (exceto CBS), IBS/CBS, valor total e informações complementares.
  Campos sem informação recebem "-". Rótulos: parâmetro "lang" = pt (padrão no Brasil) ou en.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:nfse="http://www.sped.fazenda.gov.br/nfse" exclude-result-prefixes="nfse">

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
                <xsl:when test="$k='sub'">|pt=Documento Auxiliar da NFS-e|en=Auxiliary document of the NFS-e|</xsl:when>
                <xsl:when test="$k='amb1'">|pt=Ambiente de produção|en=Production environment|</xsl:when>
                <xsl:when test="$k='amb2'">|pt=Ambiente de homologação – sem valor jurídico|en=Test environment – no legal value|</xsl:when>
                <xsl:when test="$k='chave'">|pt=Chave de Acesso da NFS-e|en=NFS-e access key|</xsl:when>
                <xsl:when test="$k='nNFSe'">|pt=Número da NFS-e|en=NFS-e number|</xsl:when>
                <xsl:when test="$k='compet'">|pt=Competência da NFS-e|en=Service period|</xsl:when>
                <xsl:when test="$k='dhNFSe'">|pt=Data e Hora da emissão da NFS-e|en=NFS-e issue date and time|</xsl:when>
                <xsl:when test="$k='nDPS'">|pt=Número da DPS|en=DPS number|</xsl:when>
                <xsl:when test="$k='serieDPS'">|pt=Série da DPS|en=DPS series|</xsl:when>
                <xsl:when test="$k='dhDPS'">|pt=Data e Hora da emissão da DPS|en=DPS issue date and time|</xsl:when>
                <xsl:when test="$k='consulta'">|pt=A autenticidade desta NFS-e pode ser verificada pela leitura deste código QR ou pela consulta da chave de acesso no portal nacional da NFS-e.|en=The authenticity of this NFS-e can be verified by scanning this QR code or by looking up the access key on the national NFS-e portal.|</xsl:when>
                <xsl:when test="$k='prest'">|pt=EMITENTE DA NFS-e · PRESTADOR DO SERVIÇO|en=NFS-e ISSUER · SERVICE PROVIDER|</xsl:when>
                <xsl:when test="$k='toma'">|pt=TOMADOR DO SERVIÇO|en=SERVICE RECIPIENT|</xsl:when>
                <xsl:when test="$k='interm'">|pt=INTERMEDIÁRIO DO SERVIÇO|en=SERVICE INTERMEDIARY|</xsl:when>
                <xsl:when test="$k='naoInterm'">|pt=INTERMEDIÁRIO DO SERVIÇO NÃO IDENTIFICADO NA NFS-e|en=NO SERVICE INTERMEDIARY IDENTIFIED IN THE NFS-e|</xsl:when>
                <xsl:when test="$k='cnpjCpf'">|pt=CNPJ / CPF / NIF|en=CNPJ / CPF / NIF|</xsl:when>
                <xsl:when test="$k='im'">|pt=Inscrição Municipal|en=Municipal registration|</xsl:when>
                <xsl:when test="$k='fone'">|pt=Telefone|en=Phone|</xsl:when>
                <xsl:when test="$k='nome'">|pt=Nome / Nome Empresarial|en=Name / Company name|</xsl:when>
                <xsl:when test="$k='email'">|pt=E-mail|en=E-mail|</xsl:when>
                <xsl:when test="$k='end'">|pt=Endereço|en=Address|</xsl:when>
                <xsl:when test="$k='mun'">|pt=Município|en=Municipality|</xsl:when>
                <xsl:when test="$k='cep'">|pt=CEP|en=Postcode (CEP)|</xsl:when>
                <xsl:when test="$k='simples'">|pt=Simples Nacional na Data de Competência|en=Simples Nacional on the service date|</xsl:when>
                <xsl:when test="$k='regEsp'">|pt=Regime Especial de Tributação|en=Special tax regime|</xsl:when>
                <xsl:when test="$k='serv'">|pt=SERVIÇO PRESTADO|en=SERVICE PROVIDED|</xsl:when>
                <xsl:when test="$k='cTribNac'">|pt=Código de Tributação Nacional|en=National tax code|</xsl:when>
                <xsl:when test="$k='cTribMun'">|pt=Código de Tributação Municipal|en=Municipal tax code|</xsl:when>
                <xsl:when test="$k='locPrest'">|pt=Local da Prestação|en=Place of service|</xsl:when>
                <xsl:when test="$k='pais'">|pt=País da Prestação|en=Country of service|</xsl:when>
                <xsl:when test="$k='cNBS'">|pt=Código NBS|en=NBS code|</xsl:when>
                <xsl:when test="$k='descServ'">|pt=Descrição do Serviço|en=Service description|</xsl:when>
                <xsl:when test="$k='tribMun'">|pt=TRIBUTAÇÃO MUNICIPAL (ISSQN)|en=MUNICIPAL TAXATION (ISSQN)|</xsl:when>
                <xsl:when test="$k='tribISSQN'">|pt=Tributação do ISSQN|en=ISSQN taxation|</xsl:when>
                <xsl:when test="$k='locIncid'">|pt=Município de Incidência do ISSQN|en=ISSQN taxing municipality|</xsl:when>
                <xsl:when test="$k='vServ'">|pt=Valor do Serviço|en=Service value|</xsl:when>
                <xsl:when test="$k='descIncond'">|pt=Desconto Incondicionado|en=Unconditional discount|</xsl:when>
                <xsl:when test="$k='descCond'">|pt=Desconto Condicionado|en=Conditional discount|</xsl:when>
                <xsl:when test="$k='deducoes'">|pt=Total Deduções / Reduções|en=Total deductions / reductions|</xsl:when>
                <xsl:when test="$k='bcIss'">|pt=Base de Cálculo do ISSQN|en=ISSQN tax base|</xsl:when>
                <xsl:when test="$k='aliq'">|pt=Alíquota Aplicada|en=Applied rate|</xsl:when>
                <xsl:when test="$k='retIss'">|pt=Retenção do ISSQN|en=ISSQN withholding|</xsl:when>
                <xsl:when test="$k='vIss'">|pt=ISSQN Apurado|en=ISSQN calculated|</xsl:when>
                <xsl:when test="$k='tribFed'">|pt=TRIBUTAÇÃO FEDERAL (EXCETO CBS)|en=FEDERAL TAXATION (EXCEPT CBS)|</xsl:when>
                <xsl:when test="$k='irrf'">|pt=IRRF|en=IRRF|</xsl:when>
                <xsl:when test="$k='cp'">|pt=Contribuição Previdenciária – Retida|en=Social security – withheld|</xsl:when>
                <xsl:when test="$k='csll'">|pt=CSLL – Retida|en=CSLL – withheld|</xsl:when>
                <xsl:when test="$k='pis'">|pt=PIS – Débito Apuração Própria|en=PIS – own assessment|</xsl:when>
                <xsl:when test="$k='cofins'">|pt=COFINS – Débito Apuração Própria|en=COFINS – own assessment|</xsl:when>
                <xsl:when test="$k='retPisCofins'">|pt=Retenção do PIS/COFINS|en=PIS/COFINS withholding|</xsl:when>
                <xsl:when test="$k='ibscbs'">|pt=TRIBUTAÇÃO IBS / CBS|en=IBS / CBS TAXATION|</xsl:when>
                <xsl:when test="$k='locIbs'">|pt=Localidade de Incidência do IBS/CBS|en=IBS/CBS place of supply|</xsl:when>
                <xsl:when test="$k='cst'">|pt=CST|en=CST|</xsl:when>
                <xsl:when test="$k='cClassTrib'">|pt=Classificação Tributária|en=Tax classification|</xsl:when>
                <xsl:when test="$k='bcIbs'">|pt=Base de Cálculo IBS/CBS|en=IBS/CBS tax base|</xsl:when>
                <xsl:when test="$k='aIbsUf'">|pt=Alíquota Efetiva IBS UF|en=Effective IBS UF rate|</xsl:when>
                <xsl:when test="$k='aIbsMun'">|pt=Alíquota Efetiva IBS Mun.|en=Effective IBS municipal rate|</xsl:when>
                <xsl:when test="$k='aCbs'">|pt=Alíquota Efetiva CBS|en=Effective CBS rate|</xsl:when>
                <xsl:when test="$k='vIbs'">|pt=Valor do IBS|en=IBS amount|</xsl:when>
                <xsl:when test="$k='vCbs'">|pt=Valor da CBS|en=CBS amount|</xsl:when>
                <xsl:when test="$k='total'">|pt=VALOR TOTAL DA NFS-e|en=NFS-e TOTAL VALUE|</xsl:when>
                <xsl:when test="$k='vRet'">|pt=Total das Retenções|en=Total withholdings|</xsl:when>
                <xsl:when test="$k='vLiq'">|pt=Valor Líquido da NFS-e|en=Net value of the NFS-e|</xsl:when>
                <xsl:when test="$k='vIbsCbs'">|pt=Total IBS/CBS|en=Total IBS/CBS|</xsl:when>
                <xsl:when test="$k='vTotNF'">|pt=Valor Total da NFS-e|en=NFS-e total value|</xsl:when>
                <xsl:when test="$k='infCompl'">|pt=INFORMAÇÕES COMPLEMENTARES|en=COMPLEMENTARY INFORMATION|</xsl:when>
                <xsl:when test="$k='ped'">|pt=Pedido|en=Order|</xsl:when>
                <xsl:when test="$k='lei'">|pt=Totais aproximados dos tributos cfe. Lei nº 12.741/2012 – Federais: R$|en=Approximate taxes under Law 12,741/2012 – Federal: R$|</xsl:when>
                <xsl:when test="$k='est'">|pt=Estaduais: R$|en=State: R$|</xsl:when>
                <xsl:when test="$k='munic'">|pt=Municipais: R$|en=Municipal: R$|</xsl:when>
                <xsl:when test="$k='qr'">|pt=QR Code|en=QR code|</xsl:when>
                <xsl:when test="$k='sn1'">|pt=Não optante|en=Not opted in|</xsl:when>
                <xsl:when test="$k='sn2'">|pt=Optante – MEI|en=Opted in – MEI|</xsl:when>
                <xsl:when test="$k='sn3'">|pt=Optante – ME/EPP|en=Opted in – ME/EPP|</xsl:when>
                <xsl:when test="$k='re0'">|pt=Nenhum|en=None|</xsl:when>
                <xsl:when test="$k='ti1'">|pt=Operação tributável|en=Taxable operation|</xsl:when>
                <xsl:when test="$k='ti2'">|pt=Imunidade|en=Immunity|</xsl:when>
                <xsl:when test="$k='ti3'">|pt=Exportação de serviço|en=Export of service|</xsl:when>
                <xsl:when test="$k='ti4'">|pt=Não incidência|en=Not applicable|</xsl:when>
                <xsl:when test="$k='rt1'">|pt=Não retido|en=Not withheld|</xsl:when>
                <xsl:when test="$k='rt2'">|pt=Retido pelo tomador|en=Withheld by the recipient|</xsl:when>
                <xsl:when test="$k='rt3'">|pt=Retido pelo intermediário|en=Withheld by the intermediary|</xsl:when>
                <xsl:when test="$k='rp1'">|pt=PIS/COFINS/CSLL retidos|en=PIS/COFINS/CSLL withheld|</xsl:when>
                <xsl:when test="$k='rp2'">|pt=PIS/COFINS/CSLL não retidos|en=PIS/COFINS/CSLL not withheld|</xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="hit" select="substring-before(substring-after($row, concat('|', $L, '=')), '|')"/>
        <xsl:choose>
            <xsl:when test="$hit != ''"><xsl:value-of select="$hit"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="substring-before(substring-after($row, '|pt='), '|')"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Campo: rótulo e conteúdo; sem informação → "-". -->
    <xsl:template name="f">
        <xsl:param name="k"/>
        <xsl:param name="v"/>
        <xsl:param name="span" select="1"/>
        <td colspan="{$span}">
            <i><xsl:call-template name="t"><xsl:with-param name="k" select="$k"/></xsl:call-template></i>
            <b><xsl:choose><xsl:when test="normalize-space($v) != ''"><xsl:value-of select="$v"/></xsl:when><xsl:otherwise>-</xsl:otherwise></xsl:choose></b>
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

    <xsl:template name="money">
        <xsl:param name="x"/>
        <xsl:if test="string(number($x)) != 'NaN'"><xsl:value-of select="concat('R$ ', format-number($x, $M, 'br'))"/></xsl:if>
    </xsl:template>

    <xsl:template name="pct">
        <xsl:param name="x"/>
        <xsl:if test="string(number($x)) != 'NaN'"><xsl:value-of select="concat(format-number($x, '0,00', 'br'), '%')"/></xsl:if>
    </xsl:template>

    <xsl:template name="party">
        <xsl:param name="p"/>
        <xsl:param name="k"/>
        <xsl:param name="mun"/>
        <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k" select="$k"/></xsl:call-template></div>
        <table class="g">
            <tr>
                <xsl:call-template name="f"><xsl:with-param name="k">cnpjCpf</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="doc"><xsl:with-param name="s" select="$p/nfse:CNPJ | $p/nfse:CPF | $p/nfse:NIF"/></xsl:call-template></xsl:with-param></xsl:call-template>
                <xsl:call-template name="f"><xsl:with-param name="k">im</xsl:with-param><xsl:with-param name="v" select="$p/nfse:IM"/></xsl:call-template>
                <xsl:call-template name="f"><xsl:with-param name="k">fone</xsl:with-param><xsl:with-param name="v" select="$p/nfse:fone"/></xsl:call-template>
            </tr>
            <tr>
                <xsl:call-template name="f"><xsl:with-param name="k">nome</xsl:with-param><xsl:with-param name="v" select="$p/nfse:xNome"/><xsl:with-param name="span" select="2"/></xsl:call-template>
                <xsl:call-template name="f"><xsl:with-param name="k">email</xsl:with-param><xsl:with-param name="v" select="$p/nfse:email"/></xsl:call-template>
            </tr>
            <tr>
                <xsl:variable name="e" select="$p/nfse:enderNac | $p/nfse:end"/>
                <xsl:call-template name="f"><xsl:with-param name="k">end</xsl:with-param><xsl:with-param name="v"><xsl:if test="$e/nfse:xLgr"><xsl:value-of select="concat($e/nfse:xLgr, ', ', $e/nfse:nro, ', ', $e/nfse:xBairro)"/></xsl:if></xsl:with-param></xsl:call-template>
                <xsl:call-template name="f"><xsl:with-param name="k">mun</xsl:with-param><xsl:with-param name="v" select="$mun"/></xsl:call-template>
                <xsl:call-template name="f"><xsl:with-param name="k">cep</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="cep"><xsl:with-param name="s" select="$e/nfse:CEP | $e/nfse:endNac/nfse:CEP"/></xsl:call-template></xsl:with-param></xsl:call-template>
            </tr>
        </table>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="nfse:NFSe/nfse:infNFSe"/>
    </xsl:template>

    <xsl:template match="nfse:infNFSe">
        <xsl:variable name="dps" select="nfse:DPS/nfse:infDPS"/>
        <xsl:variable name="v" select="nfse:valores"/>
        <xsl:variable name="dv" select="$dps/nfse:valores"/>
        <xsl:variable name="pc" select="$dv/nfse:trib/nfse:tribFed/nfse:piscofins"/>
        <xsl:variable name="ib" select="nfse:IBSCBS"/>
        <xsl:variable name="chave" select="substring-after(@Id, 'NFS')"/>
        <html lang="{$L}">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title>DANFSe <xsl:value-of select="nfse:nNFSe"/></title>
                <style type="text/css">
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; background: #eef1f5; color: #000; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; }
                    table { font-size: inherit; color: inherit; }
                    .page { width: 794px; margin: 0 auto; background: #fff; padding: 18px 22px 24px; border: 1pt solid #000; position: relative; }
                    .top { display: table; width: 100%; border-bottom: .5pt solid #000; padding-bottom: 8px; }
                    .top > div { display: table-cell; vertical-align: middle; }
                    .logo { width: 92px; }
                    .logo span { display: inline-block; border: 2px solid #000; border-radius: 6px; padding: 6px 8px; font-weight: bold; font-size: 15px; letter-spacing: .5px; }
                    .ttl { text-align: center; }
                    .ttl .a { font-size: 15px; font-weight: bold; }
                    .ttl .b { font-size: 11px; margin-top: 2px; }
                    .mun { width: 230px; text-align: right; font-size: 9.5px; line-height: 1.45; }
                    .sec { background: #f2f2f2; font-weight: bold; font-size: 8.5px; padding: 3px 4px; margin-top: 8px; border: .5pt solid #000; border-bottom: none; }
                    table.g { width: 100%; border-collapse: collapse; table-layout: fixed; }
                    table.g td { border: .5pt solid #000; padding: 2px 4px 3px; vertical-align: top; }
                    table.g td i { display: block; font-style: normal; font-size: 7px; color: #222; }
                    table.g td b { display: block; font-size: 9.5px; min-height: 12px; }
                    .head { display: table; width: 100%; margin-top: 8px; }
                    .head > div { display: table-cell; vertical-align: top; }
                    .qr { width: 118px; padding-left: 10px; text-align: center; }
                    .qr .box { width: 108px; height: 108px; border: 1px dashed #6b7280; display: table; }
                    .qr .box span { display: table-cell; vertical-align: middle; color: #6b7280; font-size: 9px; padding: 6px; }
                    .qr p { font-size: 7px; margin: 3px 0 0; line-height: 1.3; text-align: left; }
                    .key b { letter-spacing: .4px; font-size: 10px !important; }
                    .desc b { font-weight: normal !important; line-height: 1.45; }
                    .note { border: .5pt solid #000; padding: 4px 6px; font-size: 9px; line-height: 1.5; min-height: 46px; }
                    .wm { position: absolute; top: 360px; left: 0; right: 0; text-align: center; font-size: 26px; font-weight: bold; color: rgba(220, 38, 38, .45); transform: rotate(-18deg); }
                    @media print { html, body { background: #fff; } .page { width: 100%; padding: 6mm; } }
                </style>
            </head>
            <body>
                <div class="page">
                    <xsl:if test="$dps/nfse:tpAmb = '2'"><div class="wm"><xsl:call-template name="t"><xsl:with-param name="k">amb2</xsl:with-param></xsl:call-template></div></xsl:if>
                    <div class="top">
                        <div class="logo"><span>NFS-e</span></div>
                        <div class="ttl">
                            <div class="a">DANFSe v2.0</div>
                            <div class="b"><xsl:call-template name="t"><xsl:with-param name="k">sub</xsl:with-param></xsl:call-template></div>
                        </div>
                        <div class="mun">
                            <b><xsl:value-of select="nfse:xLocEmi"/></b><br/>
                            <xsl:call-template name="t"><xsl:with-param name="k" select="concat('amb', $dps/nfse:tpAmb)"/></xsl:call-template>
                        </div>
                    </div>

                    <div class="head">
                        <div>
                            <table class="g">
                                <tr>
                                    <td colspan="3" class="key"><i><xsl:call-template name="t"><xsl:with-param name="k">chave</xsl:with-param></xsl:call-template></i><b><xsl:value-of select="$chave"/></b></td>
                                </tr>
                                <tr>
                                    <xsl:call-template name="f"><xsl:with-param name="k">nNFSe</xsl:with-param><xsl:with-param name="v" select="nfse:nNFSe"/></xsl:call-template>
                                    <xsl:call-template name="f"><xsl:with-param name="k">compet</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="dh"><xsl:with-param name="d" select="$dps/nfse:dCompet"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                    <xsl:call-template name="f"><xsl:with-param name="k">dhNFSe</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="dh"><xsl:with-param name="d" select="nfse:dhProc"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                </tr>
                                <tr>
                                    <xsl:call-template name="f"><xsl:with-param name="k">nDPS</xsl:with-param><xsl:with-param name="v" select="$dps/nfse:nDPS"/></xsl:call-template>
                                    <xsl:call-template name="f"><xsl:with-param name="k">serieDPS</xsl:with-param><xsl:with-param name="v" select="$dps/nfse:serie"/></xsl:call-template>
                                    <xsl:call-template name="f"><xsl:with-param name="k">dhDPS</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="dh"><xsl:with-param name="d" select="$dps/nfse:dhEmi"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                </tr>
                            </table>
                        </div>
                        <div class="qr">
                            <div class="box"><span><xsl:call-template name="t"><xsl:with-param name="k">qr</xsl:with-param></xsl:call-template></span></div>
                            <p><xsl:call-template name="t"><xsl:with-param name="k">consulta</xsl:with-param></xsl:call-template></p>
                        </div>
                    </div>

                    <xsl:call-template name="party">
                        <xsl:with-param name="p" select="nfse:emit"/>
                        <xsl:with-param name="k">prest</xsl:with-param>
                        <xsl:with-param name="mun" select="concat(nfse:xLocEmi, ' – ', nfse:emit/nfse:enderNac/nfse:UF)"/>
                    </xsl:call-template>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="f"><xsl:with-param name="k">simples</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="t"><xsl:with-param name="k" select="concat('sn', $dps/nfse:prest/nfse:regTrib/nfse:opSimpNac)"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">regEsp</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="t"><xsl:with-param name="k" select="concat('re', $dps/nfse:prest/nfse:regTrib/nfse:regEspTrib)"/></xsl:call-template></xsl:with-param></xsl:call-template>
                        </tr>
                    </table>

                    <xsl:call-template name="party">
                        <xsl:with-param name="p" select="$dps/nfse:toma"/>
                        <xsl:with-param name="k">toma</xsl:with-param>
                        <xsl:with-param name="mun" select="$dps/nfse:toma/nfse:end/nfse:endNac/nfse:cMun"/>
                    </xsl:call-template>

                    <xsl:choose>
                        <xsl:when test="$dps/nfse:interm">
                            <xsl:call-template name="party"><xsl:with-param name="p" select="$dps/nfse:interm"/><xsl:with-param name="k">interm</xsl:with-param></xsl:call-template>
                        </xsl:when>
                        <xsl:otherwise>
                            <div class="sec" style="border-bottom:.5pt solid #000;text-align:center"><xsl:call-template name="t"><xsl:with-param name="k">naoInterm</xsl:with-param></xsl:call-template></div>
                        </xsl:otherwise>
                    </xsl:choose>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">serv</xsl:with-param></xsl:call-template></div>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="f"><xsl:with-param name="k">cTribNac</xsl:with-param>
                                <xsl:with-param name="v"><xsl:variable name="c" select="$dps/nfse:serv/nfse:cServ/nfse:cTribNac"/><xsl:value-of select="concat(substring($c,1,2),'.',substring($c,3,2),'.',substring($c,5,2), ' – ', nfse:xTribNac)"/></xsl:with-param>
                                <xsl:with-param name="span" select="2"/>
                            </xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">cTribMun</xsl:with-param><xsl:with-param name="v" select="$dps/nfse:serv/nfse:cServ/nfse:cTribMun"/></xsl:call-template>
                        </tr>
                        <tr>
                            <xsl:call-template name="f"><xsl:with-param name="k">locPrest</xsl:with-param><xsl:with-param name="v" select="nfse:xLocPrestacao"/></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">pais</xsl:with-param><xsl:with-param name="v" select="$dps/nfse:serv/nfse:locPrest/nfse:cPaisPrestacao"/></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">cNBS</xsl:with-param><xsl:with-param name="v" select="$dps/nfse:serv/nfse:cServ/nfse:cNBS"/></xsl:call-template>
                        </tr>
                        <tr class="desc">
                            <xsl:call-template name="f"><xsl:with-param name="k">descServ</xsl:with-param><xsl:with-param name="v" select="$dps/nfse:serv/nfse:cServ/nfse:xDescServ"/><xsl:with-param name="span" select="3"/></xsl:call-template>
                        </tr>
                    </table>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">tribMun</xsl:with-param></xsl:call-template></div>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="f"><xsl:with-param name="k">tribISSQN</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="t"><xsl:with-param name="k" select="concat('ti', $dv/nfse:trib/nfse:tribMun/nfse:tribISSQN)"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">locIncid</xsl:with-param><xsl:with-param name="v" select="nfse:xLocIncid"/></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">retIss</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="t"><xsl:with-param name="k" select="concat('rt', $dv/nfse:trib/nfse:tribMun/nfse:tpRetISSQN)"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">vServ</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$dv/nfse:vServPrest/nfse:vServ"/></xsl:call-template></xsl:with-param></xsl:call-template>
                        </tr>
                        <tr>
                            <xsl:call-template name="f"><xsl:with-param name="k">descIncond</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$dv/nfse:vDescCondIncond/nfse:vDescIncond"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">deducoes</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$v/nfse:vCalcDR"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">bcIss</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$v/nfse:vBC"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">aliq</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="pct"><xsl:with-param name="x" select="$v/nfse:pAliqAplic"/></xsl:call-template></xsl:with-param></xsl:call-template>
                        </tr>
                        <tr>
                            <xsl:call-template name="f"><xsl:with-param name="k">vIss</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$v/nfse:vISSQN"/></xsl:call-template></xsl:with-param><xsl:with-param name="span" select="4"/></xsl:call-template>
                        </tr>
                    </table>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">tribFed</xsl:with-param></xsl:call-template></div>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="f"><xsl:with-param name="k">irrf</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$dv/nfse:trib/nfse:tribFed/nfse:vRetIRRF"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">cp</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$dv/nfse:trib/nfse:tribFed/nfse:vRetCP"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">csll</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$dv/nfse:trib/nfse:tribFed/nfse:vRetCSLL"/></xsl:call-template></xsl:with-param></xsl:call-template>
                        </tr>
                        <tr>
                            <xsl:call-template name="f"><xsl:with-param name="k">pis</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$pc/nfse:vPis"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">cofins</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$pc/nfse:vCofins"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">retPisCofins</xsl:with-param><xsl:with-param name="v"><xsl:if test="$pc/nfse:tpRetPisCofins"><xsl:call-template name="t"><xsl:with-param name="k" select="concat('rp', $pc/nfse:tpRetPisCofins)"/></xsl:call-template></xsl:if></xsl:with-param></xsl:call-template>
                        </tr>
                    </table>

                    <xsl:if test="$ib">
                        <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">ibscbs</xsl:with-param></xsl:call-template></div>
                        <table class="g">
                            <tr>
                                <xsl:call-template name="f"><xsl:with-param name="k">locIbs</xsl:with-param><xsl:with-param name="v" select="$ib/nfse:xLocalidadeIncid"/></xsl:call-template>
                                <xsl:call-template name="f"><xsl:with-param name="k">cst</xsl:with-param><xsl:with-param name="v" select="$dps/nfse:IBSCBS/nfse:valores/nfse:trib/nfse:gIBSCBS/nfse:CST"/></xsl:call-template>
                                <xsl:call-template name="f"><xsl:with-param name="k">cClassTrib</xsl:with-param><xsl:with-param name="v" select="$dps/nfse:IBSCBS/nfse:valores/nfse:trib/nfse:gIBSCBS/nfse:cClassTrib"/></xsl:call-template>
                                <xsl:call-template name="f"><xsl:with-param name="k">bcIbs</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$ib/nfse:valores/nfse:vBC"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            </tr>
                            <tr>
                                <xsl:call-template name="f"><xsl:with-param name="k">aIbsUf</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="pct"><xsl:with-param name="x" select="$ib/nfse:valores/nfse:uf/nfse:pAliqEfetUF"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                <xsl:call-template name="f"><xsl:with-param name="k">aIbsMun</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="pct"><xsl:with-param name="x" select="$ib/nfse:valores/nfse:mun/nfse:pAliqEfetMun"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                <xsl:call-template name="f"><xsl:with-param name="k">aCbs</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="pct"><xsl:with-param name="x" select="$ib/nfse:valores/nfse:fed/nfse:pAliqEfetCBS"/></xsl:call-template></xsl:with-param></xsl:call-template>
                                <xsl:call-template name="f"><xsl:with-param name="k">vIbs</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$ib/nfse:totCIBS/nfse:gIBS/nfse:vIBSTot"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            </tr>
                            <tr>
                                <xsl:call-template name="f"><xsl:with-param name="k">vCbs</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$ib/nfse:totCIBS/nfse:gCBS/nfse:vCBS"/></xsl:call-template></xsl:with-param><xsl:with-param name="span" select="4"/></xsl:call-template>
                            </tr>
                        </table>
                    </xsl:if>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">total</xsl:with-param></xsl:call-template></div>
                    <table class="g">
                        <tr>
                            <xsl:call-template name="f"><xsl:with-param name="k">vServ</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$dv/nfse:vServPrest/nfse:vServ"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">descCond</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$dv/nfse:vDescCondIncond/nfse:vDescCond"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">descIncond</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$dv/nfse:vDescCondIncond/nfse:vDescIncond"/></xsl:call-template></xsl:with-param></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">vRet</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$v/nfse:vTotalRet"/></xsl:call-template></xsl:with-param></xsl:call-template>
                        </tr>
                        <tr>
                            <xsl:call-template name="f"><xsl:with-param name="k">vLiq</xsl:with-param><xsl:with-param name="v"><xsl:call-template name="money"><xsl:with-param name="x" select="$v/nfse:vLiq"/></xsl:call-template></xsl:with-param><xsl:with-param name="span" select="2"/></xsl:call-template>
                            <xsl:call-template name="f"><xsl:with-param name="k">vIbsCbs</xsl:with-param><xsl:with-param name="v"><xsl:if test="$ib"><xsl:call-template name="money"><xsl:with-param name="x" select="sum($ib/nfse:totCIBS/nfse:gIBS/nfse:vIBSTot) + sum($ib/nfse:totCIBS/nfse:gCBS/nfse:vCBS)"/></xsl:call-template></xsl:if></xsl:with-param></xsl:call-template>
                            <td><i><xsl:call-template name="t"><xsl:with-param name="k">vTotNF</xsl:with-param></xsl:call-template></i><b style="font-size:12px"><xsl:choose><xsl:when test="$ib/nfse:totCIBS/nfse:vTotNF"><xsl:call-template name="money"><xsl:with-param name="x" select="$ib/nfse:totCIBS/nfse:vTotNF"/></xsl:call-template></xsl:when><xsl:otherwise><xsl:call-template name="money"><xsl:with-param name="x" select="$v/nfse:vLiq"/></xsl:call-template></xsl:otherwise></xsl:choose></b></td>
                        </tr>
                    </table>

                    <div class="sec"><xsl:call-template name="t"><xsl:with-param name="k">infCompl</xsl:with-param></xsl:call-template></div>
                    <div class="note">
                        <xsl:if test="$dps/nfse:serv/nfse:infoCompl/nfse:xPed"><xsl:call-template name="t"><xsl:with-param name="k">ped</xsl:with-param></xsl:call-template>: <xsl:value-of select="$dps/nfse:serv/nfse:infoCompl/nfse:xPed"/>. </xsl:if>
                        <xsl:value-of select="$dps/nfse:serv/nfse:infoCompl/nfse:xInfComp"/>
                        <xsl:variable name="tt" select="$dv/nfse:trib/nfse:totTrib/nfse:vTotTrib"/>
                        <xsl:if test="$tt">
                            <div>
                                <xsl:call-template name="t"><xsl:with-param name="k">lei</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="format-number(sum($tt/nfse:vTotTribFed), $M, 'br')"/>;
                                <xsl:call-template name="t"><xsl:with-param name="k">est</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="format-number(sum($tt/nfse:vTotTribEst), $M, 'br')"/>;
                                <xsl:call-template name="t"><xsl:with-param name="k">munic</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="format-number(sum($tt/nfse:vTotTribMun), $M, 'br')"/>.
                            </div>
                        </xsl:if>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
