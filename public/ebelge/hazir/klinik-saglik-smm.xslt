<?xml version="1.0" encoding="UTF-8"?>
<!--
  Hazır şablon: Muayenehane / Klinik e-Serbest Meslek Makbuzu — sakin, ferah sağlık teması.
  UBL-TR Invoice (ProfileID EARSIVBELGE, InvoiceTypeCode SERBESTMESLEKMAKBUZU); nihai tüketici hasta (TCKN), stopajsız.
  Notlar: "Diploma / Uzmanlık Tescil No:" başlıkta, "Protokol No:" hasta kartında,
  "POS İşyeri No:", "POS Terminal No:", "Kart No:", "Kart Sahibi:", "Onay Kodu:" kartlı tahsilat panelinde (VUK GT 509 V.5.4).
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" exclude-result-prefixes="n1 cac cbc">

    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:variable name="inv" select="/n1:Invoice"/>
    <xsl:variable name="cur" select="string($inv/cbc:DocumentCurrencyCode)"/>
    <xsl:variable name="curLabel">
        <xsl:choose>
            <xsl:when test="$cur = 'TRY' or $cur = ''">TL</xsl:when>
            <xsl:otherwise><xsl:value-of select="$cur"/></xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:variable name="seller" select="$inv/cac:AccountingSupplierParty/cac:Party"/>
    <xsl:variable name="buyer" select="$inv/cac:AccountingCustomerParty/cac:Party"/>
    <xsl:variable name="docTax" select="$inv/cac:TaxTotal/cac:TaxSubtotal"/>
    <xsl:variable name="docWht" select="$inv/cac:WithholdingTaxTotal/cac:TaxSubtotal"/>
    <xsl:variable name="kdvRows" select="$docTax[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '0015']"/>
    <xsl:variable name="stopajRows" select="($docTax | $docWht)[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '0003' or cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '0011']"/>
    <xsl:variable name="tevkifatRows" select="$docWht[not(cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '0003' or cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '0011')] | $docTax[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '9015']"/>
    <xsl:variable name="brut">
        <xsl:choose>
            <xsl:when test="string(number($inv/cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount)) != 'NaN'"><xsl:value-of select="number($inv/cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount)"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="sum($inv/cac:InvoiceLine/cbc:LineExtensionAmount)"/></xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:variable name="kdv" select="sum($kdvRows/cbc:TaxAmount)"/>
    <xsl:variable name="stopaj" select="sum($stopajRows/cbc:TaxAmount)"/>
    <xsl:variable name="tevkifat" select="sum($tevkifatRows/cbc:TaxAmount)"/>
    <xsl:variable name="net" select="number($brut) - $stopaj"/>
    <xsl:variable name="tahsilKdv" select="$kdv - $tevkifat"/>
    <xsl:variable name="tahsilat">
        <xsl:choose>
            <xsl:when test="string(number($inv/cac:LegalMonetaryTotal/cbc:PayableAmount)) != 'NaN'"><xsl:value-of select="number($inv/cac:LegalMonetaryTotal/cbc:PayableAmount)"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$net + $tahsilKdv"/></xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:variable name="patient">
        <xsl:choose>
            <xsl:when test="normalize-space($buyer/cac:Person/cbc:FamilyName)"><xsl:value-of select="normalize-space(concat($buyer/cac:Person/cbc:FirstName, ' ', $buyer/cac:Person/cbc:FamilyName))"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$buyer/cac:PartyName/cbc:Name"/></xsl:otherwise>
        </xsl:choose>
    </xsl:variable>

    <xsl:template name="tutar">
        <xsl:param name="v"/>
        <xsl:value-of select="format-number(number($v), '###.##0,00', 'tr')"/>
        <xsl:text> </xsl:text>
        <xsl:value-of select="$curLabel"/>
    </xsl:template>

    <xsl:template name="json-tutar">
        <xsl:param name="v"/>
        <xsl:value-of select="format-number(number($v), '0.00')"/>
    </xsl:template>

    <xsl:template name="tarih">
        <xsl:param name="d"/>
        <xsl:value-of select="concat(substring($d, 9, 2), '.', substring($d, 6, 2), '.', substring($d, 1, 4))"/>
    </xsl:template>

    <xsl:template match="/">
        <html lang="tr">
            <head>
                <meta charset="UTF-8"/>
                <title>Serbest Meslek Makbuzu — <xsl:value-of select="$inv/cbc:ID"/></title>
                <script type="text/javascript"><![CDATA[/* QRCode.js — Copyright (c) 2012 davidshimjs, MIT License. GİB resmi e-Arşiv XSLT'sinde gömülü sürüm. */
var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();
]]></script>
                <style type="text/css"><![CDATA[
                    @page { size: A4; margin: 0; }
                    body { margin: 0; background: #eaf4f6; font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #23404a; }
                    .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: #ffffff; box-sizing: border-box; padding: 0 13mm 10mm; }
                    .strip { height: 7px; margin: 0 -13mm; background: linear-gradient(90deg, #14b8a6, #38bdf8 55%, #a5f3fc); }
                    table { border-collapse: collapse; }
                    .head { width: 100%; margin-top: 10mm; }
                    .head td { vertical-align: middle; }
                    .logo { width: 66px; height: 66px; display: block; }
                    .doc { padding-left: 14px; }
                    .doc-name { font-size: 22px; font-weight: 600; color: #0e5a6b; letter-spacing: .2px; }
                    .doc-title { font-size: 12px; color: #14b8a6; font-weight: 600; margin-top: 1px; }
                    .chips { margin-top: 7px; }
                    .chip { display: inline-block; font-size: 9.5px; color: #3b6470; background: #f0fbfc; border: 1px solid #cdeef2; border-radius: 999px; padding: 2px 9px; margin: 0 4px 3px 0; }
                    .qr-wrap { width: 112px; text-align: center; }
                    [data-karekod-box] { width: 100px; height: 100px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-1 -1 27 27' shape-rendering='crispEdges'%3E%3Cpath fill='%230e5a6b' d='M0 0h7v1h-7zM9 0h1v1h-1zM16 0h1v1h-1zM18 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM9 1h2v1h-2zM12 1h4v1h-4zM18 1h1v1h-1zM24 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM11 2h1v1h-1zM14 2h1v1h-1zM16 2h1v1h-1zM18 2h1v1h-1zM20 2h3v1h-3zM24 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM9 3h2v1h-2zM18 3h1v1h-1zM20 3h3v1h-3zM24 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM8 4h3v1h-3zM12 4h2v1h-2zM15 4h1v1h-1zM18 4h1v1h-1zM20 4h3v1h-3zM24 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM9 5h2v1h-2zM12 5h2v1h-2zM16 5h1v1h-1zM18 5h1v1h-1zM24 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h7v1h-7zM8 7h3v1h-3zM12 7h2v1h-2zM1 8h1v1h-1zM3 8h1v1h-1zM6 8h2v1h-2zM9 8h2v1h-2zM13 8h2v1h-2zM16 8h2v1h-2zM19 8h1v1h-1zM21 8h1v1h-1zM24 8h1v1h-1zM0 9h1v1h-1zM2 9h3v1h-3zM7 9h3v1h-3zM11 9h1v1h-1zM17 9h2v1h-2zM20 9h1v1h-1zM2 10h1v1h-1zM5 10h2v1h-2zM10 10h5v1h-5zM17 10h1v1h-1zM19 10h2v1h-2zM0 11h1v1h-1zM2 11h1v1h-1zM4 11h2v1h-2zM7 11h1v1h-1zM9 11h2v1h-2zM15 11h1v1h-1zM17 11h1v1h-1zM20 11h1v1h-1zM24 11h1v1h-1zM2 12h1v1h-1zM5 12h6v1h-6zM14 12h2v1h-2zM17 12h4v1h-4zM23 12h1v1h-1zM0 13h1v1h-1zM2 13h1v1h-1zM4 13h2v1h-2zM8 13h1v1h-1zM10 13h4v1h-4zM15 13h1v1h-1zM17 13h5v1h-5zM1 14h2v1h-2zM6 14h1v1h-1zM9 14h5v1h-5zM20 14h1v1h-1zM4 15h1v1h-1zM12 15h1v1h-1zM14 15h1v1h-1zM16 15h1v1h-1zM18 15h1v1h-1zM21 15h3v1h-3zM0 16h4v1h-4zM6 16h2v1h-2zM11 16h1v1h-1zM14 16h6v1h-6zM12 17h2v1h-2zM17 17h2v1h-2zM23 17h2v1h-2zM0 18h7v1h-7zM8 18h1v1h-1zM11 18h1v1h-1zM13 18h3v1h-3zM18 18h3v1h-3zM23 18h2v1h-2zM0 19h1v1h-1zM6 19h1v1h-1zM8 19h1v1h-1zM10 19h1v1h-1zM13 19h1v1h-1zM0 20h1v1h-1zM2 20h3v1h-3zM6 20h1v1h-1zM8 20h2v1h-2zM14 20h1v1h-1zM16 20h1v1h-1zM19 20h1v1h-1zM22 20h1v1h-1zM24 20h1v1h-1zM0 21h1v1h-1zM2 21h3v1h-3zM6 21h1v1h-1zM8 21h2v1h-2zM12 21h1v1h-1zM16 21h1v1h-1zM18 21h2v1h-2zM21 21h3v1h-3zM0 22h1v1h-1zM2 22h3v1h-3zM6 22h1v1h-1zM12 22h1v1h-1zM14 22h3v1h-3zM18 22h4v1h-4zM0 23h1v1h-1zM6 23h1v1h-1zM8 23h1v1h-1zM10 23h3v1h-3zM14 23h1v1h-1zM19 23h6v1h-6zM0 24h7v1h-7zM9 24h3v1h-3zM13 24h3v1h-3zM18 24h2v1h-2zM21 24h2v1h-2z'/%3E%3C/svg%3E") center / contain no-repeat; }
                    .qr-cap { font-size: 8px; color: #7aa3ad; margin-top: 3px; letter-spacing: 1px; }
                    .titlebar { margin-top: 12px; background: #ecfeff; border-radius: 14px; padding: 10px 14px; }
                    .titlebar table { width: 100%; }
                    .titlebar td { vertical-align: middle; }
                    .t-main { font-size: 15px; font-weight: 700; color: #0e5a6b; letter-spacing: 2px; }
                    .t-sub { font-size: 9.5px; color: #5b8a95; margin-top: 1px; }
                    .meta { text-align: right; white-space: nowrap; }
                    .meta span { display: inline-block; margin-left: 12px; text-align: left; }
                    .meta i { font-style: normal; }
                    .meta .k { display: block; font-size: 8.5px; color: #6c97a1; text-transform: uppercase; letter-spacing: .8px; }
                    .meta .v { display: block; font-size: 11.5px; color: #0e5a6b; font-weight: 600; }
                    .ettn { margin-top: 5px; font-size: 9px; color: #5b8a95; }
                    .ettn b { font-family: Consolas, 'Courier New', monospace; color: #23404a; font-weight: normal; letter-spacing: .3px; }
                    table.cards { width: 100%; margin-top: 12px; border-collapse: separate; border-spacing: 10px 0; margin-left: -10px; width: calc(100% + 20px); }
                    table.cards > tbody > tr > td { width: 50%; vertical-align: top; border: 1px solid #d7eef1; border-radius: 14px; padding: 11px 13px; }
                    .c-h { font-size: 9px; color: #14b8a6; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 7px; }
                    .avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #5eead4, #38bdf8); color: #ffffff; font-weight: 700; font-size: 14px; text-align: center; line-height: 38px; }
                    .p-name { font-size: 14px; font-weight: 600; color: #0e5a6b; }
                    .kv { margin-top: 6px; }
                    .kv td { padding: 1.5px 0; vertical-align: top; }
                    .kv td.k { width: 92px; color: #6c97a1; }
                    .mono { font-family: Consolas, 'Courier New', monospace; letter-spacing: .3px; }
                    .sec-h { margin: 16px 0 6px; font-size: 10px; color: #0e5a6b; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
                    .lines-box { border: 1px solid #d7eef1; border-radius: 14px; overflow: hidden; }
                    table.lines { width: 100%; }
                    table.lines th { background: #f0fbfc; color: #3b6470; font-size: 9.5px; font-weight: 600; letter-spacing: .6px; text-transform: uppercase; text-align: left; padding: 8px 10px; border-bottom: 1px solid #d7eef1; }
                    table.lines td { padding: 9px 10px; border-bottom: 1px solid #edf7f8; vertical-align: top; }
                    table.lines tr:last-child td { border-bottom: 0; }
                    table.lines .num { text-align: right; white-space: nowrap; }
                    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #5eead4; margin-right: 8px; vertical-align: middle; }
                    .item { font-weight: 600; color: #0e5a6b; }
                    .desc { color: #6c97a1; font-size: 10px; margin: 2px 0 0 16px; }
                    table.bottom { width: 100%; margin-top: 14px; }
                    table.bottom > tbody > tr > td { vertical-align: top; }
                    .pos { border: 1px solid #d7eef1; border-radius: 14px; padding: 10px 13px; background: #fbfeff; }
                    .pos table { width: 100%; }
                    .pos td { padding: 2px 0; font-size: 10.5px; }
                    .pos td.k { color: #6c97a1; width: 110px; }
                    .pos-badge { display: inline-block; background: #ccfbf1; color: #0f766e; font-size: 9px; font-weight: 700; border-radius: 999px; padding: 2px 9px; margin-bottom: 6px; letter-spacing: .5px; }
                    .words { margin-top: 10px; color: #0e5a6b; font-style: italic; }
                    .notes { margin-top: 6px; color: #5b8a95; font-size: 10px; line-height: 1.55; }
                    .totals { border-radius: 14px; background: #f0fbfc; padding: 8px 12px; }
                    .totals table { width: 100%; }
                    .totals td { padding: 5px 0; font-size: 11.5px; }
                    .totals td.v { text-align: right; white-space: nowrap; color: #0e5a6b; font-weight: 600; }
                    .totals tr.muted td { color: #8aaeb7; font-size: 10.5px; }
                    .totals tr.muted td.v { color: #8aaeb7; font-weight: normal; }
                    .grand { margin-top: 8px; background: linear-gradient(90deg, #0e7490, #14b8a6); color: #ffffff; border-radius: 12px; padding: 11px 14px; }
                    .grand table { width: 100%; }
                    .grand td { color: #ffffff; }
                    .grand .gk { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; opacity: .9; }
                    .grand .gv { text-align: right; font-size: 18px; font-weight: 700; white-space: nowrap; }
                    table.sign { width: 100%; margin-top: 22px; }
                    table.sign td { vertical-align: bottom; color: #5b8a95; font-size: 10px; }
                    .stamp { width: 170px; height: 76px; border: 1.5px dashed #a5e3ea; border-radius: 14px; color: #a5e3ea; text-align: center; line-height: 76px; letter-spacing: 2px; font-size: 10px; margin-left: auto; }
                    .wish { font-size: 13px; color: #14b8a6; font-weight: 600; }
                    .foot { margin-top: 16px; padding-top: 7px; border-top: 1px solid #edf7f8; font-size: 8.5px; color: #8aaeb7; text-align: center; }
                    @media print { body { background: #fff; } }
                ]]></style>
            </head>
            <body>
                <div class="page">
                    <div class="strip"/>
                    <table class="head">
                        <tr>
                            <td style="width:66px"><img class="logo" alt="Logo" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%2314b8a6'/%3E%3Cstop offset='1' stop-color='%2338bdf8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='60' cy='60' r='58' fill='url(%23g)'/%3E%3Cpath d='M50 30h20v20h20v20H70v20H50V70H30V50h20z' fill='%23ffffff'/%3E%3Cpath d='M60 64c-4-5-12-4-12 3 0 6 12 12 12 12s12-6 12-12c0-7-8-8-12-3z' fill='%2314b8a6'/%3E%3C/svg%3E"/></td>
                            <td class="doc">
                                <div class="doc-name"><xsl:value-of select="$seller/cac:PartyName/cbc:Name"/></div>
                                <div class="doc-title"><xsl:value-of select="$seller/cac:Person/cbc:Title"/></div>
                                <div class="chips">
                                    <xsl:for-each select="$inv/cbc:Note[starts-with(., 'Diploma') or starts-with(., 'Uzmanlık')]"><span class="chip"><xsl:value-of select="."/></span></xsl:for-each>
                                </div>
                            </td>
                            <td class="qr-wrap">
                                <div data-xslt-obj="obj-1" data-obj-kind="karekod" style="width:100px;height:100px;margin:0 auto">
                                    <div data-karekod-box=""><xsl:text> </xsl:text></div>
                                    <span data-karekod-value="" style="display:none">{"vkntckn":"<xsl:value-of select="$seller/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN'][1]"/>","avkntckn":"<xsl:value-of select="$buyer/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN'][1]"/>","tarih":"<xsl:value-of select="$inv/cbc:IssueDate"/>","no":"<xsl:value-of select="$inv/cbc:ID"/>","ettn":"<xsl:value-of select="$inv/cbc:UUID"/>","parabirimi":"<xsl:value-of select="$cur"/>","brutucret":"<xsl:call-template name="json-tutar"><xsl:with-param name="v" select="$brut"/></xsl:call-template>","tahsilkdv":"<xsl:call-template name="json-tutar"><xsl:with-param name="v" select="$tahsilKdv"/></xsl:call-template>","kdvtevkifat":"<xsl:call-template name="json-tutar"><xsl:with-param name="v" select="$tevkifat"/></xsl:call-template>","gvstopaj":"<xsl:call-template name="json-tutar"><xsl:with-param name="v" select="$stopaj"/></xsl:call-template>","kdvtutari":"<xsl:call-template name="json-tutar"><xsl:with-param name="v" select="$kdv"/></xsl:call-template>","netucret":"<xsl:call-template name="json-tutar"><xsl:with-param name="v" select="$net"/></xsl:call-template>","tahsilat":"<xsl:call-template name="json-tutar"><xsl:with-param name="v" select="$tahsilat"/></xsl:call-template>"}</span>
                                    <script type="text/javascript"><![CDATA[(function(){var s=document.currentScript,b=s&&s.parentNode;if(!b||typeof QRCode==='undefined')return;var t=b.querySelector('[data-karekod-box]'),d=b.querySelector('[data-karekod-value]');if(!t||!d||t.querySelector('canvas,img'))return;var w=b.clientWidth||120;new QRCode(t,{text:d.textContent.replace(/\s+/g,' ').trim(),width:w,height:w,correctLevel:QRCode.CorrectLevel.M});})();]]></script>
                                </div>
                                <div class="qr-cap">e-SMM KAREKOD</div>
                            </td>
                        </tr>
                    </table>

                    <div class="titlebar">
                        <table>
                            <tr>
                                <td>
                                    <div class="t-main">SERBEST MESLEK MAKBUZU</div>
                                    <div class="t-sub"><xsl:value-of select="$inv/cbc:ProfileID"/> · <xsl:value-of select="$inv/cbc:InvoiceTypeCode"/></div>
                                </td>
                                <td class="meta">
                                    <span><i class="k">Makbuz No</i><b class="v mono"><xsl:value-of select="$inv/cbc:ID"/></b></span>
                                    <span><i class="k">Tarih</i><b class="v"><xsl:call-template name="tarih"><xsl:with-param name="d" select="$inv/cbc:IssueDate"/></xsl:call-template></b></span>
                                    <span><i class="k">Saat</i><b class="v"><xsl:value-of select="substring($inv/cbc:IssueTime, 1, 5)"/></b></span>
                                </td>
                            </tr>
                        </table>
                        <div class="ettn">ETTN <b><xsl:value-of select="$inv/cbc:UUID"/></b></div>
                    </div>

                    <table class="cards">
                        <tr>
                            <td>
                                <div class="c-h">Hasta Bilgileri</div>
                                <table style="width:100%">
                                    <tr>
                                        <td style="width:46px;vertical-align:middle"><div class="avatar"><xsl:value-of select="concat(substring($buyer/cac:Person/cbc:FirstName, 1, 1), substring($buyer/cac:Person/cbc:FamilyName, 1, 1))"/></div></td>
                                        <td style="vertical-align:middle"><div class="p-name"><xsl:value-of select="$patient"/></div>
                                            <xsl:for-each select="$inv/cbc:Note[starts-with(., 'Protokol')]"><div style="color:#6c97a1;font-size:10px"><xsl:value-of select="."/></div></xsl:for-each>
                                        </td>
                                    </tr>
                                </table>
                                <table class="kv">
                                    <tr><td class="k"><xsl:value-of select="$buyer/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']/@schemeID"/></td><td class="mono"><xsl:value-of select="$buyer/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']"/></td></tr>
                                    <tr><td class="k">Adres</td><td><xsl:value-of select="normalize-space(concat($buyer/cac:PostalAddress/cbc:StreetName, ' No: ', $buyer/cac:PostalAddress/cbc:BuildingNumber, ' ', $buyer/cac:PostalAddress/cbc:CitySubdivisionName, ' / ', $buyer/cac:PostalAddress/cbc:CityName))"/></td></tr>
                                    <xsl:if test="normalize-space($buyer/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name)">
                                        <tr><td class="k">Vergi Dairesi</td><td><xsl:value-of select="$buyer/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/></td></tr>
                                    </xsl:if>
                                    <xsl:if test="normalize-space($buyer/cac:Contact/cbc:Telephone)">
                                        <tr><td class="k">Telefon</td><td><xsl:value-of select="$buyer/cac:Contact/cbc:Telephone"/></td></tr>
                                    </xsl:if>
                                </table>
                            </td>
                            <td>
                                <div class="c-h">Muayenehane</div>
                                <div class="p-name"><xsl:value-of select="normalize-space(concat($seller/cac:Person/cbc:FirstName, ' ', $seller/cac:Person/cbc:FamilyName))"/></div>
                                <table class="kv">
                                    <tr><td class="k">Adres</td><td><xsl:value-of select="normalize-space(concat($seller/cac:PostalAddress/cbc:StreetName, ' No: ', $seller/cac:PostalAddress/cbc:BuildingNumber, ' ', $seller/cac:PostalAddress/cbc:PostalZone, ' ', $seller/cac:PostalAddress/cbc:CitySubdivisionName, ' / ', $seller/cac:PostalAddress/cbc:CityName))"/></td></tr>
                                    <tr><td class="k">Vergi Dairesi</td><td><xsl:value-of select="$seller/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/></td></tr>
                                    <tr><td class="k"><xsl:value-of select="$seller/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']/@schemeID"/></td><td class="mono"><xsl:value-of select="$seller/cac:PartyIdentification/cbc:ID[@schemeID = 'VKN' or @schemeID = 'TCKN']"/></td></tr>
                                    <tr><td class="k">İletişim</td><td><xsl:value-of select="$seller/cac:Contact/cbc:Telephone"/> · <xsl:value-of select="$seller/cac:Contact/cbc:ElectronicMail"/></td></tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <div class="sec-h">Muayene ve Tedavi</div>
                    <div class="lines-box">
                        <table class="lines">
                            <tr>
                                <th>Hizmet</th>
                                <th class="num" style="width:52px">Adet</th>
                                <th class="num" style="width:96px">Birim Ücret</th>
                                <th class="num" style="width:50px">KDV</th>
                                <th class="num" style="width:110px">Tutar</th>
                            </tr>
                            <xsl:for-each select="//cac:InvoiceLine">
                                <tr>
                                    <td>
                                        <div class="item"><span class="dot"/><xsl:value-of select="cac:Item/cbc:Name"/></div>
                                        <xsl:if test="normalize-space(cac:Item/cbc:Description)"><div class="desc"><xsl:value-of select="cac:Item/cbc:Description"/></div></xsl:if>
                                    </td>
                                    <td class="num"><xsl:value-of select="format-number(cbc:InvoicedQuantity, '###.##0,##', 'tr')"/></td>
                                    <td class="num"><xsl:value-of select="format-number(cac:Price/cbc:PriceAmount, '###.##0,00', 'tr')"/></td>
                                    <td class="num"><xsl:if test="cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '0015']/cbc:Percent">%<xsl:value-of select="cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '0015']/cbc:Percent"/></xsl:if></td>
                                    <td class="num"><b><xsl:call-template name="tutar"><xsl:with-param name="v" select="cbc:LineExtensionAmount"/></xsl:call-template></b></td>
                                </tr>
                            </xsl:for-each>
                        </table>
                    </div>

                    <table class="bottom">
                        <tr>
                            <td style="width:55%;padding-right:14px">
                                <xsl:if test="$inv/cbc:Note[starts-with(., 'POS') or starts-with(., 'Kart') or starts-with(., 'Onay')]">
                                    <div class="pos">
                                        <span class="pos-badge">KART İLE TAHSİL EDİLDİ</span>
                                        <table>
                                            <xsl:for-each select="$inv/cbc:Note[starts-with(., 'POS') or starts-with(., 'Kart') or starts-with(., 'Onay')]">
                                                <tr><td class="k"><xsl:value-of select="substring-before(., ':')"/></td><td class="mono"><xsl:value-of select="normalize-space(substring-after(., ':'))"/></td></tr>
                                            </xsl:for-each>
                                            <tr><td class="k">Tahsilat Tutarı</td><td class="mono"><xsl:call-template name="tutar"><xsl:with-param name="v" select="$tahsilat"/></xsl:call-template></td></tr>
                                        </table>
                                        <xsl:for-each select="$inv/cac:PaymentMeans[normalize-space(cbc:InstructionNote)]"><div class="notes" style="margin-top:4px"><xsl:value-of select="cbc:InstructionNote"/></div></xsl:for-each>
                                    </div>
                                </xsl:if>
                                <xsl:for-each select="$inv/cbc:Note[starts-with(., 'Yalnız') or starts-with(., 'YALNIZ')]">
                                    <div class="words"><xsl:value-of select="."/></div>
                                </xsl:for-each>
                                <div class="notes">
                                    <xsl:for-each select="$inv/cbc:Note[not(starts-with(., 'Yalnız') or starts-with(., 'YALNIZ') or starts-with(., 'Diploma') or starts-with(., 'Uzmanlık') or starts-with(., 'Protokol') or starts-with(., 'POS') or starts-with(., 'Kart') or starts-with(., 'Onay'))]">
                                        <div>• <xsl:value-of select="."/></div>
                                    </xsl:for-each>
                                </div>
                            </td>
                            <td>
                                <div class="totals">
                                    <table>
                                        <tr><td>Brüt Ücret</td><td class="v"><xsl:call-template name="tutar"><xsl:with-param name="v" select="$brut"/></xsl:call-template></td></tr>
                                        <xsl:choose>
                                            <xsl:when test="$stopajRows">
                                                <xsl:for-each select="$stopajRows">
                                                    <tr><td>Gelir Vergisi Stopajı (%<xsl:value-of select="cbc:Percent"/>)</td><td class="v">− <xsl:call-template name="tutar"><xsl:with-param name="v" select="cbc:TaxAmount"/></xsl:call-template></td></tr>
                                                </xsl:for-each>
                                            </xsl:when>
                                            <xsl:otherwise>
                                                <tr class="muted"><td>Gelir Vergisi Stopajı</td><td class="v">Uygulanmaz</td></tr>
                                            </xsl:otherwise>
                                        </xsl:choose>
                                        <tr><td>Net Ücret</td><td class="v"><xsl:call-template name="tutar"><xsl:with-param name="v" select="$net"/></xsl:call-template></td></tr>
                                        <xsl:for-each select="$kdvRows">
                                            <tr><td>KDV (%<xsl:value-of select="cbc:Percent"/>)</td><td class="v"><xsl:call-template name="tutar"><xsl:with-param name="v" select="cbc:TaxAmount"/></xsl:call-template></td></tr>
                                        </xsl:for-each>
                                        <xsl:for-each select="$tevkifatRows">
                                            <tr><td>KDV Tevkifatı (<xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode"/>)</td><td class="v">− <xsl:call-template name="tutar"><xsl:with-param name="v" select="cbc:TaxAmount"/></xsl:call-template></td></tr>
                                        </xsl:for-each>
                                    </table>
                                    <div class="grand">
                                        <table>
                                            <tr><td class="gk">Tahsil Edilen</td><td class="gv"><xsl:call-template name="tutar"><xsl:with-param name="v" select="$tahsilat"/></xsl:call-template></td></tr>
                                        </table>
                                    </div>
                                <xsl:if test="/*/cbc:DocumentCurrencyCode != 'TRY' and number(/*/cac:PricingExchangeRate/cbc:CalculationRate) &gt; 0"><xsl:variable name="tlKur" select="number(/*/cac:PricingExchangeRate/cbc:CalculationRate)"/><xsl:variable name="tlKurTarih" select="(/*/cac:PricingExchangeRate/cbc:Date | /*/cbc:IssueDate)[1]"/><div data-tl-karsilik="1" style="margin-top:8px;padding:7px 9px;border:1px dashed #94a3b8;border-radius:6px;background:#f8fafc;font-size:0.92em;color:#0f172a;page-break-inside:avoid"><div style="font-weight:700">TL Karşılıkları</div><div style="font-size:0.88em;color:#475569;margin:1px 0 4px">1 <xsl:value-of select="/*/cbc:DocumentCurrencyCode"/> = <xsl:value-of select="format-number($tlKur, '###.##0,0000', 'tr')"/> TL (TCMB döviz alış, <xsl:value-of select="concat(substring($tlKurTarih, 9, 2), '.', substring($tlKurTarih, 6, 2), '.', substring($tlKurTarih, 1, 4))"/>)</div><table style="width:100%;border-collapse:collapse"><tr><td style="padding:2px 0">Brüt Ücret (TL)</td><td style="padding:2px 0;text-align:right;white-space:nowrap"><xsl:value-of select="format-number(number($brut) * $tlKur, '###.##0,00', 'tr')"/><xsl:text> TL</xsl:text></td></tr><xsl:if test="$stopaj &gt; 0"><tr><td style="padding:2px 0">Stopaj (TL)</td><td style="padding:2px 0;text-align:right;white-space:nowrap"><xsl:text>− </xsl:text><xsl:value-of select="format-number(number($stopaj) * $tlKur, '###.##0,00', 'tr')"/><xsl:text> TL</xsl:text></td></tr></xsl:if><tr><td style="padding:2px 0">Net Ücret (TL)</td><td style="padding:2px 0;text-align:right;white-space:nowrap"><xsl:value-of select="format-number(number($net) * $tlKur, '###.##0,00', 'tr')"/><xsl:text> TL</xsl:text></td></tr><tr><td style="padding:2px 0">Hesaplanan KDV (TL)</td><td style="padding:2px 0;text-align:right;white-space:nowrap"><xsl:value-of select="format-number(number($kdv) * $tlKur, '###.##0,00', 'tr')"/><xsl:text> TL</xsl:text></td></tr><xsl:if test="$tevkifat &gt; 0"><tr><td style="padding:2px 0">KDV Tevkifatı (TL)</td><td style="padding:2px 0;text-align:right;white-space:nowrap"><xsl:text>− </xsl:text><xsl:value-of select="format-number(number($tevkifat) * $tlKur, '###.##0,00', 'tr')"/><xsl:text> TL</xsl:text></td></tr></xsl:if><tr><td style="padding:2px 0;font-weight:700">Tahsil Edilen Tutar (TL)</td><td style="padding:2px 0;text-align:right;white-space:nowrap;font-weight:700"><xsl:value-of select="format-number(number($tahsilat) * $tlKur, '###.##0,00', 'tr')"/><xsl:text> TL</xsl:text></td></tr></table></div></xsl:if></div>
                            </td>
                        </tr>
                    </table>

                    <table class="sign">
                        <tr>
                            <td><div class="wish">Sağlıklı günler dileriz.</div><div>Randevu: <xsl:value-of select="$seller/cac:Contact/cbc:Telephone"/></div></td>
                            <td style="width:190px;text-align:center"><div class="stamp">HEKİM KAŞE / İMZA</div></td>
                        </tr>
                    </table>
                    <div class="foot">Bu makbuz elektronik ortamda düzenlenmiş e-Serbest Meslek Makbuzudur. Makbuz numarası ve ETTN ile ebelge.gib.gov.tr üzerinden doğrulanabilir.</div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>