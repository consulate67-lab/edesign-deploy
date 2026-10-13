<?xml version="1.0" encoding="UTF-8"?>
<!--
  DANFE NFC-e (Nota Fiscal de Consumidor Eletrônica, modelo 65) — Manual de Especificações
  Técnicas do DANFE NFC-e e QR Code, leiaute de bobina 80 mm.
  Divisões: emitente, itens, totais e pagamentos, consulta pela chave, consumidor,
  identificação e protocolo, QR Code e tributos aproximados (Lei 12.741/2012).
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
                <xsl:when test="$k='title'">|pt=Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica|en=Auxiliary document of the consumer electronic invoice|</xsl:when>
                <xsl:when test="$k='cod'">|pt=Código|en=Code|</xsl:when>
                <xsl:when test="$k='desc'">|pt=Descrição|en=Description|</xsl:when>
                <xsl:when test="$k='qtd'">|pt=Qtde|en=Qty|</xsl:when>
                <xsl:when test="$k='un'">|pt=UN|en=Unit|</xsl:when>
                <xsl:when test="$k='vUn'">|pt=Vl Unit|en=Unit price|</xsl:when>
                <xsl:when test="$k='vTot'">|pt=Vl Total|en=Total|</xsl:when>
                <xsl:when test="$k='qItens'">|pt=Qtde. total de itens|en=Total number of items|</xsl:when>
                <xsl:when test="$k='vProd'">|pt=Valor total R$|en=Total value R$|</xsl:when>
                <xsl:when test="$k='vDesc'">|pt=Descontos R$|en=Discounts R$|</xsl:when>
                <xsl:when test="$k='vOutro'">|pt=Acréscimos R$|en=Surcharges R$|</xsl:when>
                <xsl:when test="$k='vNF'">|pt=Valor a Pagar R$|en=Amount payable R$|</xsl:when>
                <xsl:when test="$k='pag'">|pt=FORMA DE PAGAMENTO|en=PAYMENT METHOD|</xsl:when>
                <xsl:when test="$k='vPag'">|pt=VALOR PAGO R$|en=AMOUNT PAID R$|</xsl:when>
                <xsl:when test="$k='troco'">|pt=Troco R$|en=Change R$|</xsl:when>
                <xsl:when test="$k='consulta'">|pt=Consulte pela Chave de Acesso em|en=Look up by access key at|</xsl:when>
                <xsl:when test="$k='consumidor'">|pt=CONSUMIDOR|en=CONSUMER|</xsl:when>
                <xsl:when test="$k='naoIdent'">|pt=CONSUMIDOR NÃO IDENTIFICADO|en=UNIDENTIFIED CONSUMER|</xsl:when>
                <xsl:when test="$k='nfce'">|pt=NFC-e nº|en=NFC-e no.|</xsl:when>
                <xsl:when test="$k='serie'">|pt=Série|en=Series|</xsl:when>
                <xsl:when test="$k='prot'">|pt=Protocolo de autorização|en=Authorisation protocol|</xsl:when>
                <xsl:when test="$k='dtAut'">|pt=Data de autorização|en=Authorisation date|</xsl:when>
                <xsl:when test="$k='via'">|pt=Via consumidor|en=Consumer copy|</xsl:when>
                <xsl:when test="$k='trib'">|pt=Tributos Totais Incidentes (Lei Federal 12.741/2012) R$|en=Total taxes incurred (Federal Law 12,741/2012) R$|</xsl:when>
                <xsl:when test="$k='qr'">|pt=QR Code da NFC-e|en=NFC-e QR code|</xsl:when>
                <xsl:when test="$k='homolog'">|pt=EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO – SEM VALOR FISCAL|en=ISSUED IN THE TEST ENVIRONMENT – NO FISCAL VALUE|</xsl:when>
                <xsl:when test="$k='p01'">|pt=Dinheiro|en=Cash|</xsl:when>
                <xsl:when test="$k='p02'">|pt=Cheque|en=Cheque|</xsl:when>
                <xsl:when test="$k='p03'">|pt=Cartão de Crédito|en=Credit card|</xsl:when>
                <xsl:when test="$k='p04'">|pt=Cartão de Débito|en=Debit card|</xsl:when>
                <xsl:when test="$k='p05'">|pt=Crédito Loja|en=Store credit|</xsl:when>
                <xsl:when test="$k='p10'">|pt=Vale Alimentação|en=Food voucher|</xsl:when>
                <xsl:when test="$k='p11'">|pt=Vale Refeição|en=Meal voucher|</xsl:when>
                <xsl:when test="$k='p12'">|pt=Vale Presente|en=Gift voucher|</xsl:when>
                <xsl:when test="$k='p13'">|pt=Vale Combustível|en=Fuel voucher|</xsl:when>
                <xsl:when test="$k='p15'">|pt=Boleto Bancário|en=Bank slip (boleto)|</xsl:when>
                <xsl:when test="$k='p16'">|pt=Depósito Bancário|en=Bank deposit|</xsl:when>
                <xsl:when test="$k='p17'">|pt=PIX|en=PIX|</xsl:when>
                <xsl:when test="$k='p18'">|pt=Transferência bancária|en=Bank transfer|</xsl:when>
                <xsl:when test="$k='p19'">|pt=Programa de fidelidade|en=Loyalty programme|</xsl:when>
                <xsl:when test="$k='p90'">|pt=Sem pagamento|en=No payment|</xsl:when>
                <xsl:when test="$k='p99'">|pt=Outros|en=Other|</xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="hit" select="substring-before(substring-after($row, concat('|', $L, '=')), '|')"/>
        <xsl:choose>
            <xsl:when test="$hit != ''"><xsl:value-of select="$hit"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="substring-before(substring-after($row, '|pt='), '|')"/></xsl:otherwise>
        </xsl:choose>
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
        <xsl:if test="string-length($d) &gt;= 19"><xsl:value-of select="concat(substring($d,9,2),'/',substring($d,6,2),'/',substring($d,1,4),' ',substring($d,12,8))"/></xsl:if>
    </xsl:template>

    <xsl:template name="grp">
        <xsl:param name="s"/>
        <xsl:value-of select="substring($s, 1, 4)"/>
        <xsl:if test="string-length($s) &gt; 4"><xsl:text> </xsl:text><xsl:call-template name="grp"><xsl:with-param name="s" select="substring($s, 5)"/></xsl:call-template></xsl:if>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="nfe:nfeProc/nfe:NFe | nfe:NFe"/>
    </xsl:template>

    <xsl:template match="nfe:NFe">
        <xsl:variable name="inf" select="nfe:infNFe"/>
        <xsl:variable name="ide" select="$inf/nfe:ide"/>
        <xsl:variable name="emit" select="$inf/nfe:emit"/>
        <xsl:variable name="dest" select="$inf/nfe:dest"/>
        <xsl:variable name="tot" select="$inf/nfe:total/nfe:ICMSTot"/>
        <xsl:variable name="prot" select="/nfe:nfeProc/nfe:protNFe/nfe:infProt"/>
        <xsl:variable name="chave" select="substring-after($inf/@Id, 'NFe')"/>
        <html lang="{$L}">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title>NFC-e <xsl:value-of select="$ide/nfe:nNF"/></title>
                <style type="text/css">
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; background: #eef1f5; color: #000; }
                    body { font-family: "Courier New", Consolas, monospace; font-size: 11px; }
                    table { font-size: inherit; color: inherit; }
                    .roll { width: 320px; margin: 0 auto; background: #fff; padding: 14px 12px 18px; }
                    .c { text-align: center; }
                    .r { text-align: right; white-space: nowrap; }
                    .div { border-top: 1px dashed #000; margin: 7px 0; }
                    .nm { font-weight: bold; font-size: 12px; }
                    .t { font-weight: bold; font-size: 10.5px; margin-top: 4px; }
                    table.it { width: 100%; border-collapse: collapse; }
                    table.it th { font-weight: bold; font-size: 9.5px; text-align: left; padding: 1px 2px; border-bottom: 1px solid #000; }
                    table.it td { padding: 2px 2px; vertical-align: top; font-size: 10px; }
                    table.sum { width: 100%; border-collapse: collapse; }
                    table.sum td { padding: 1px 0; }
                    .big td { font-weight: bold; font-size: 12px; }
                    .key { font-size: 10.5px; letter-spacing: .3px; word-spacing: 2px; }
                    .qr { width: 132px; height: 132px; margin: 6px auto; border: 1px dashed #6b7280; display: table; }
                    .qr span { display: table-cell; vertical-align: middle; text-align: center; color: #6b7280; font-size: 10px; padding: 8px; font-family: Arial, sans-serif; }
                    .url { font-size: 8.5px; word-break: break-all; color: #374151; }
                    .wm { text-align: center; font-weight: bold; color: #b91c1c; margin-bottom: 6px; }
                    @media print { html, body { background: #fff; } .roll { width: 80mm; padding: 2mm; } }
                </style>
            </head>
            <body>
                <div class="roll">
                    <xsl:if test="$ide/nfe:tpAmb = '2'"><div class="wm"><xsl:call-template name="t"><xsl:with-param name="k">homolog</xsl:with-param></xsl:call-template></div></xsl:if>

                    <div class="c">
                        <div class="nm"><xsl:value-of select="$emit/nfe:xFant"/><xsl:if test="not($emit/nfe:xFant)"><xsl:value-of select="$emit/nfe:xNome"/></xsl:if></div>
                        <xsl:if test="$emit/nfe:xFant"><div><xsl:value-of select="$emit/nfe:xNome"/></div></xsl:if>
                        <div>CNPJ: <xsl:call-template name="doc"><xsl:with-param name="s" select="$emit/nfe:CNPJ"/></xsl:call-template> · IE: <xsl:value-of select="$emit/nfe:IE"/></div>
                        <div><xsl:value-of select="$emit/nfe:enderEmit/nfe:xLgr"/>, <xsl:value-of select="$emit/nfe:enderEmit/nfe:nro"/>, <xsl:value-of select="$emit/nfe:enderEmit/nfe:xBairro"/></div>
                        <div><xsl:value-of select="$emit/nfe:enderEmit/nfe:xMun"/> – <xsl:value-of select="$emit/nfe:enderEmit/nfe:UF"/></div>
                        <div class="t"><xsl:call-template name="t"><xsl:with-param name="k">title</xsl:with-param></xsl:call-template></div>
                    </div>
                    <div class="div"/>

                    <table class="it">
                        <thead>
                            <tr>
                                <th><xsl:call-template name="t"><xsl:with-param name="k">cod</xsl:with-param></xsl:call-template></th>
                                <th><xsl:call-template name="t"><xsl:with-param name="k">desc</xsl:with-param></xsl:call-template></th>
                                <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">qtd</xsl:with-param></xsl:call-template></th>
                                <th><xsl:call-template name="t"><xsl:with-param name="k">un</xsl:with-param></xsl:call-template></th>
                                <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">vUn</xsl:with-param></xsl:call-template></th>
                                <th class="r"><xsl:call-template name="t"><xsl:with-param name="k">vTot</xsl:with-param></xsl:call-template></th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="$inf/nfe:det">
                                <tr>
                                    <td><xsl:value-of select="nfe:prod/nfe:cProd"/></td>
                                    <td><xsl:value-of select="nfe:prod/nfe:xProd"/></td>
                                    <td class="r"><xsl:value-of select="format-number(nfe:prod/nfe:qCom, '#.##0,###', 'br')"/></td>
                                    <td><xsl:value-of select="nfe:prod/nfe:uCom"/></td>
                                    <td class="r"><xsl:value-of select="format-number(nfe:prod/nfe:vUnCom, $M, 'br')"/></td>
                                    <td class="r"><xsl:value-of select="format-number(nfe:prod/nfe:vProd, $M, 'br')"/></td>
                                </tr>
                            </xsl:for-each>
                        </tbody>
                    </table>
                    <div class="div"/>

                    <table class="sum">
                        <tr><td><xsl:call-template name="t"><xsl:with-param name="k">qItens</xsl:with-param></xsl:call-template></td><td class="r"><xsl:value-of select="count($inf/nfe:det)"/></td></tr>
                        <tr><td><xsl:call-template name="t"><xsl:with-param name="k">vProd</xsl:with-param></xsl:call-template></td><td class="r"><xsl:value-of select="format-number(sum($tot/nfe:vProd), $M, 'br')"/></td></tr>
                        <xsl:if test="number($tot/nfe:vDesc) &gt; 0"><tr><td><xsl:call-template name="t"><xsl:with-param name="k">vDesc</xsl:with-param></xsl:call-template></td><td class="r">-<xsl:value-of select="format-number(sum($tot/nfe:vDesc), $M, 'br')"/></td></tr></xsl:if>
                        <xsl:if test="number($tot/nfe:vOutro) + number($tot/nfe:vFrete) &gt; 0"><tr><td><xsl:call-template name="t"><xsl:with-param name="k">vOutro</xsl:with-param></xsl:call-template></td><td class="r"><xsl:value-of select="format-number(sum($tot/nfe:vOutro) + sum($tot/nfe:vFrete), $M, 'br')"/></td></tr></xsl:if>
                        <tr class="big"><td><xsl:call-template name="t"><xsl:with-param name="k">vNF</xsl:with-param></xsl:call-template></td><td class="r"><xsl:value-of select="format-number(sum($tot/nfe:vNF), $M, 'br')"/></td></tr>
                        <tr><td style="padding-top:5px"><b><xsl:call-template name="t"><xsl:with-param name="k">pag</xsl:with-param></xsl:call-template></b></td><td class="r" style="padding-top:5px"><b><xsl:call-template name="t"><xsl:with-param name="k">vPag</xsl:with-param></xsl:call-template></b></td></tr>
                        <xsl:for-each select="$inf/nfe:pag/nfe:detPag">
                            <tr><td><xsl:call-template name="t"><xsl:with-param name="k" select="concat('p', nfe:tPag)"/></xsl:call-template></td><td class="r"><xsl:value-of select="format-number(nfe:vPag, $M, 'br')"/></td></tr>
                        </xsl:for-each>
                        <xsl:if test="$inf/nfe:pag/nfe:vTroco"><tr><td><xsl:call-template name="t"><xsl:with-param name="k">troco</xsl:with-param></xsl:call-template></td><td class="r"><xsl:value-of select="format-number($inf/nfe:pag/nfe:vTroco, $M, 'br')"/></td></tr></xsl:if>
                    </table>
                    <div class="div"/>

                    <div class="c">
                        <b><xsl:call-template name="t"><xsl:with-param name="k">consulta</xsl:with-param></xsl:call-template></b>
                        <div class="url"><xsl:value-of select="nfe:infNFeSupl/nfe:urlChave"/></div>
                        <div class="key"><xsl:call-template name="grp"><xsl:with-param name="s" select="$chave"/></xsl:call-template></div>
                    </div>
                    <div class="div"/>

                    <div class="c">
                        <xsl:choose>
                            <xsl:when test="$dest/nfe:CPF | $dest/nfe:CNPJ">
                                <b><xsl:call-template name="t"><xsl:with-param name="k">consumidor</xsl:with-param></xsl:call-template></b> –
                                <xsl:choose><xsl:when test="$dest/nfe:CPF">CPF </xsl:when><xsl:otherwise>CNPJ </xsl:otherwise></xsl:choose>
                                <xsl:call-template name="doc"><xsl:with-param name="s" select="$dest/nfe:CPF | $dest/nfe:CNPJ"/></xsl:call-template>
                                <xsl:if test="$dest/nfe:xNome"><div><xsl:value-of select="$dest/nfe:xNome"/></div></xsl:if>
                            </xsl:when>
                            <xsl:otherwise><b><xsl:call-template name="t"><xsl:with-param name="k">naoIdent</xsl:with-param></xsl:call-template></b></xsl:otherwise>
                        </xsl:choose>
                    </div>
                    <div class="div"/>

                    <div class="c">
                        <b><xsl:call-template name="t"><xsl:with-param name="k">nfce</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$ide/nfe:nNF"/>
                        · <xsl:call-template name="t"><xsl:with-param name="k">serie</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="$ide/nfe:serie"/>
                        · <xsl:call-template name="dh"><xsl:with-param name="d" select="$ide/nfe:dhEmi"/></xsl:call-template></b>
                        <div><xsl:call-template name="t"><xsl:with-param name="k">via</xsl:with-param></xsl:call-template></div>
                        <div><xsl:call-template name="t"><xsl:with-param name="k">prot</xsl:with-param></xsl:call-template>: <xsl:value-of select="$prot/nfe:nProt"/></div>
                        <div><xsl:call-template name="t"><xsl:with-param name="k">dtAut</xsl:with-param></xsl:call-template>: <xsl:call-template name="dh"><xsl:with-param name="d" select="$prot/nfe:dhRecbto"/></xsl:call-template></div>
                        <div class="qr"><span><xsl:call-template name="t"><xsl:with-param name="k">qr</xsl:with-param></xsl:call-template></span></div>
                        <div class="url"><xsl:value-of select="nfe:infNFeSupl/nfe:qrCode"/></div>
                    </div>
                    <div class="div"/>

                    <div class="c">
                        <xsl:call-template name="t"><xsl:with-param name="k">trib</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><b><xsl:value-of select="format-number(sum($tot/nfe:vTotTrib), $M, 'br')"/></b>
                        <xsl:if test="$inf/nfe:infAdic/nfe:infCpl"><div style="margin-top:5px"><xsl:value-of select="$inf/nfe:infAdic/nfe:infCpl"/></div></xsl:if>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
