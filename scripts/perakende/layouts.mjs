// Perakende şablonlarının sayfa yerleşimleri. Her yerleşim (S, K) → { css, body } döndürür;
// S şablon tanımı, K tanıma göre hazırlanmış parçalar (satırlar, bloklar, logo).
import {
    t, v, each, iff, choose, num, qr, LMT, docTitle, docNo, docDate, docTime, ettn, payable, saving, lineCount, qtySum,
    metaRows, supName, supInfo, cusName, cusInfo, cusLabel, sumTable, yaziyla, notList, ref, hasRef,
} from './kit.mjs';

const kv = (l, val) => `<tr><td class="k">${l}</td><td class="v">${val}</td></tr>`;
const meta = (o) => `<table class="mt">${metaRows(kv, o)}</table>`;
const tagline = (S) => (S.tagline ? `<div class="slg">${t(S.tagline)}</div>` : '');
const savePct = `${v(`round(100 * ${LMT}/cbc:AllowanceTotalAmount div (${LMT}/cbc:LineExtensionAmount))`)}`;
const store = iff(hasRef('MAGAZA'), `${ref('MAGAZA')}${iff(`${hasRef('MAGAZA')}/cbc:DocumentDescription`, `${t(' · ')}${ref('MAGAZA', 'cbc:DocumentDescription')}`)}`);
const barcode = (h = 26) => `<div style="height:${h}px;background:repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 3px, currentColor 3px 5px, transparent 5px 6px, currentColor 6px 7px, transparent 7px 10px, currentColor 10px 12px, transparent 12px 13px)"></div>`;

export const LAYOUTS = {
    /* ------------------------------------------------------------ 1. Vitrin: çizgili tente, tabela, kemerli camlar */
    vitrin: { lines: 'kart', make: (S, K) => ({
        css: `
.sayfa { padding: 0 11mm 10mm 11mm; }
.aw { margin: 0 -11mm; height: 15mm; background: repeating-linear-gradient(90deg, var(--a) 0 14mm, var(--t) 14mm 28mm); position: relative; }
.aw:after { content: ''; position: absolute; left: 0; right: 0; bottom: -6mm; height: 6mm; background: radial-gradient(circle at 7mm 0, var(--a) 6.6mm, transparent 6.9mm) 0 0 / 28mm 6mm repeat-x, radial-gradient(circle at 21mm 0, var(--t) 6.6mm, transparent 6.9mm) 0 0 / 28mm 6mm repeat-x; }
.tabela { margin: 11mm auto 0 auto; width: 128mm; text-align: center; border: 2px solid var(--ink); outline: 1px solid var(--ink); outline-offset: 3px; padding: 6px 10px 8px 10px; position: relative; }
.tabela:before, .tabela:after { content: ''; position: absolute; top: -11mm; width: 1px; height: 11mm; background: var(--ink); }
.tabela:before { left: 18mm; } .tabela:after { right: 18mm; }
.tabela .ad { font-size: 19px; letter-spacing: 1px; margin-top: 2px; }
.tabela .slg { font-size: 8.5px; letter-spacing: 3px; text-transform: uppercase; color: var(--soft); }
.tabela .bil { font-size: 8.3px; color: var(--soft); margin-top: 3px; }
.camlar { display: flex; gap: 6mm; margin-top: 7mm; align-items: stretch; }
.cam { flex: 1; border: 2px solid var(--ink); border-radius: 36mm 36mm 3px 3px; padding: 13mm 9mm 7px 9mm; text-align: center; background: linear-gradient(160deg, var(--t) 0%, var(--paper) 55%); }
.cam .bas { font-size: 8px; letter-spacing: 3px; text-transform: uppercase; color: var(--a); font-weight: 700; }
.cam .ad { font-size: 14px; margin: 2px 0 3px 0; }
.cam table.mt { margin: 0 auto; border-collapse: collapse; text-align: left; }
.cam table.mt td { padding: 1px 4px; } .cam table.mt td.k { color: var(--soft); } .cam table.mt td.v { font-weight: 600; }
.kapi { width: 30mm; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px; font-size: 7.5px; color: var(--soft); }
.vit { margin-top: 6mm; border-top: 3px solid var(--ink); padding-top: 4mm; }
.vit h3 { margin: 0 0 3mm 0; font-size: 9px; letter-spacing: 4px; text-transform: uppercase; text-align: center; color: var(--a); }
.alt2 { display: flex; gap: 7mm; margin-top: 5mm; align-items: flex-start; }
.alt2 .sol { flex: 1; }
.alt2 .sag { width: 78mm; }
.fiyat { margin-top: 6px; background: var(--a); color: var(--on); padding: 8px 14px 8px 22px; position: relative; clip-path: polygon(10mm 0, 100% 0, 100% 100%, 10mm 100%, 0 50%); display: flex; justify-content: space-between; align-items: center; }
.fiyat:before { content: ''; position: absolute; left: 4.5mm; top: calc(50% - 3px); width: 6px; height: 6px; border-radius: 50%; background: var(--paper); }
.fiyat b { font-size: 18px; }
.fiyat span { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; padding-left: 8mm; }
.yzy { font-style: italic; color: var(--soft); margin-top: 4px; }
.dip { margin-top: 5mm; padding-top: 3mm; border-top: 1px solid var(--line); font-size: 8.3px; color: var(--soft); display: flex; justify-content: space-between; gap: 8mm; }`,
        body: `
<div class="sayfa">
<div class="aw"></div>
<div class="tabela">${K.logo(46)}<div class="ad hf">${supName}</div>${tagline(S)}<div class="bil">${supInfo()}</div></div>
<div class="camlar">
    <div class="cam"><div class="bas">${cusLabel}</div><div class="ad hf">${cusName}</div><div class="ack">${cusInfo()}</div></div>
    <div class="kapi">${qr(84)}<span>${t('GİB karekodu')}</span></div>
    <div class="cam"><div class="bas">${docTitle}</div>${meta()}</div>
</div>
<div class="vit"><h3>${t(S.linesTitle ?? 'Alışverişiniz')}</h3>${K.lines}</div>
<div class="alt2">
    <div class="sol">${K.blocks}</div>
    <div class="sag">${sumTable()}<div class="fiyat"><span>${t('Ödenecek')}</span><b class="hf">${payable}</b></div><div class="yzy">${yaziyla}</div></div>
</div>
<div class="dip"><div>${notList()}</div><div class="ettn">${t('ETTN ')}${ettn}</div></div>
</div>`,
    }) },

    /* ------------------------------------------------------------ 2. Askı etiketi: solda ipli büyük etiket */
    askili: { lines: 'etiket', make: (S, K) => ({
        css: `
.sayfa { display: flex; gap: 8mm; padding: 10mm 10mm 10mm 8mm; }
.sol { width: 62mm; flex-shrink: 0; }
.ip { height: 14mm; width: 40mm; margin-left: 11mm; border: 1.5px solid var(--soft); border-bottom: 0; border-radius: 50% 50% 0 0 / 100% 100% 0 0; }
.tag { margin-top: -1mm; background: var(--a); color: var(--on); clip-path: polygon(50% 0, 100% 13mm, 100% 100%, 0 100%, 0 13mm); padding: 18mm 7mm 8mm 7mm; text-align: center; position: relative; min-height: 190mm; }
.tag:before { content: ''; position: absolute; left: calc(50% - 5px); top: 7mm; width: 10px; height: 10px; border-radius: 50%; background: var(--paper); box-shadow: 0 0 0 2px rgba(255,255,255,.4); }
.tag .ad { font-size: 15px; margin-top: 4px; line-height: 1.25; }
.tag .slg { font-size: 8px; letter-spacing: 2.5px; text-transform: uppercase; opacity: .85; margin-top: 2px; }
.tag .ayr { border-top: 1px dashed rgba(255,255,255,.55); margin: 5mm 0; }
.tag .bt { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; }
.tag .no { font-family: Consolas, monospace; font-size: 11px; margin-top: 2px; }
.tag .tutar { font-size: 25px; font-weight: 700; margin: 2px 0; }
.tag .kk { font-size: 7.5px; letter-spacing: 2px; text-transform: uppercase; opacity: .8; }
.tag .qr { background: #ffffff; display: inline-block; padding: 5px; border-radius: 4px; margin-top: 4mm; }
.tag .sat { font-size: 7.8px; opacity: .9; margin-top: 5mm; line-height: 1.5; }
.sag { flex: 1; min-width: 0; }
.ust { display: flex; gap: 6mm; }
.ust > div { flex: 1; }
.kut { border: 1px solid var(--line); border-radius: 6px; padding: 7px 10px; }
.kut .bas { font-size: 7.5px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); font-weight: 700; }
.kut .ad { font-size: 12.5px; font-weight: 600; margin: 2px 0; }
table.mt { border-collapse: collapse; width: 100%; } table.mt td { padding: 1.5px 0; } table.mt td.k { color: var(--soft); } table.mt td.v { text-align: right; font-weight: 600; }
.bh { margin: 6mm 0 3mm 0; font-size: 8px; letter-spacing: 3px; text-transform: uppercase; color: var(--soft); border-bottom: 1px solid var(--line); padding-bottom: 2px; }
.toplar { display: flex; gap: 6mm; margin-top: 4mm; }
.toplar .bl { flex: 1; }
.toplar .tp { width: 72mm; }
.yzy { font-style: italic; color: var(--soft); margin-top: 4px; font-size: 9px; }
.dip { margin-top: 5mm; font-size: 8.3px; color: var(--soft); }`,
        body: `
<div class="sayfa">
<div class="sol"><div class="ip"></div><div class="tag">
    ${K.logo(50)}
    <div class="ad hf">${supName}</div>${tagline(S)}
    <div class="ayr"></div>
    <div class="bt">${docTitle}</div><div class="no">${docNo}</div><div class="kk">${docDate}${t(' · ')}${docTime}</div>
    <div class="ayr"></div>
    <div class="kk">${t('Ödenecek Tutar')}</div><div class="tutar hf">${payable}</div><div class="kk">${lineCount}${t(' kalem · ')}${qtySum}${t(' birim')}</div>
    <div class="qr">${qr(86)}</div>
    <div class="sat">${supInfo(' · ', '<br/>')}</div>
</div></div>
<div class="sag">
    <div class="ust">
        <div class="kut"><div class="bas">${cusLabel}</div><div class="ad">${cusName}</div><div class="ack">${cusInfo()}</div></div>
        <div class="kut">${meta()}</div>
    </div>
    <div class="bh">${t(S.linesTitle ?? 'Ürünler')}</div>
    ${K.lines}
    <div class="toplar"><div class="bl">${K.blocks}</div><div class="tp">${sumTable()}<div class="yzy">${yaziyla}</div></div></div>
    <div class="dip">${notList()}<div class="ettn">${t('ETTN ')}${ettn}</div></div>
</div>
</div>`,
    }) },

    /* ------------------------------------------------------------ 3. Termal fiş: dar, tırtıklı kenarlı */
    fis: { lines: 'fis', make: (S, K) => ({
        css: `
.sayfa { background: transparent; padding: 12mm 0; }
.rc { width: 116mm; margin: 0 auto; background: var(--paper); padding: 9mm 8mm; position: relative; font-family: Consolas, 'Courier New', monospace; font-size: 9.5px; box-shadow: 0 1px 4px rgba(0,0,0,.12); }
.rc:before, .rc:after { content: ''; position: absolute; left: 0; right: 0; height: 8px; background-size: 8px 8px; background-repeat: repeat-x; }
.rc:before { top: -8px; background-image: linear-gradient(45deg, var(--paper) 4px, transparent 0), linear-gradient(-45deg, var(--paper) 4px, transparent 0); background-position: left bottom; }
.rc:after { bottom: -8px; background-image: linear-gradient(135deg, var(--paper) 4px, transparent 0), linear-gradient(-135deg, var(--paper) 4px, transparent 0); background-position: left top; }
.mrk { text-align: center; }
.mrk .ad { font-size: 15px; font-weight: 700; margin-top: 3px; text-transform: uppercase; }
.mrk .slg { font-size: 8.5px; color: var(--a); letter-spacing: 1px; }
.mrk .bil { font-size: 8.3px; margin-top: 3px; }
.cz { border-top: 1px dashed var(--ink); margin: 6px 0; height: 0; }
.cz2 { border-top: 3px double var(--ink); margin: 7px 0; }
.bt { text-align: center; font-weight: 700; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; background: var(--a); color: var(--on); padding: 3px 0; }
table.mt { width: 100%; border-collapse: collapse; } table.mt td { padding: 1px 0; } table.mt td.v { text-align: right; }
.mus .ad { font-weight: 700; }
table.top { font-size: 9.5px; }
.tot { display: flex; justify-content: space-between; align-items: baseline; font-size: 16px; font-weight: 700; padding: 4px 0; }
.yzy { font-size: 8.5px; text-align: center; }
.bar { margin: 8px 12mm 2px 12mm; color: var(--ink); }
.ettn { text-align: center; display: block; }
.qrk { text-align: center; margin-top: 6px; }
.son { text-align: center; margin-top: 6px; font-size: 9px; }
.son b { display: block; letter-spacing: 3px; color: var(--a); }
.rc .blk h4 { text-align: center; }
.rc .b-kart { margin: 0 auto; }`,
        body: `
<div class="sayfa"><div class="rc">
<div class="mrk">${K.logo(42)}<div class="ad">${supName}</div>${tagline(S)}<div class="bil">${supInfo(' · ', '<br/>')}</div></div>
<div class="cz2"></div>
<div class="bt">${docTitle}</div>
${meta()}
<div class="cz"></div>
<div class="mus">${cusLabel}${t(': ')}<span class="ad">${cusName}</span><br/>${cusInfo()}</div>
<div class="cz2"></div>
${K.lines}
<div class="cz"></div>
${sumTable()}
<div class="cz2"></div>
<div class="tot"><span>${t('TOPLAM')}</span><span>${payable}</span></div>
<div class="yzy">${yaziyla}</div>
<div class="cz"></div>
${K.blocks}
<div class="bar">${barcode(30)}</div><span class="ettn">${ettn}</span>
<div class="qrk">${qr(92)}</div>
<div class="son">${notList()}<b>${t(S.footer ?? '*** TEŞEKKÜRLER ***')}</b></div>
</div></div>`,
    }) },

    /* ------------------------------------------------------------ 4. Lookbook: fotoğraf karoları */
    lookbook: { lines: 'kart', make: (S, K) => ({
        css: `
.sayfa { padding: 11mm 12mm; }
.bs { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid var(--ink); padding-bottom: 5mm; }
.bs .mk { display: flex; gap: 12px; align-items: center; }
.bs .ad { font-size: 27px; line-height: 1.05; max-width: 110mm; }
.bs .slg { font-size: 8.5px; letter-spacing: 4px; text-transform: uppercase; color: var(--a); margin-top: 3px; }
.bs .bt { text-align: right; }
.bs .bt .t1 { font-size: 9px; letter-spacing: 5px; text-transform: uppercase; }
.bs .bt .t2 { font-size: 20px; }
.inf { display: grid; grid-template-columns: 1.3fr 1fr 1fr auto; gap: 6mm; padding: 4mm 0; border-bottom: 1px solid var(--line); font-size: 8.8px; }
.inf .k { font-size: 7.5px; letter-spacing: 2px; text-transform: uppercase; color: var(--soft); margin-bottom: 2px; }
.inf .ad { font-size: 12px; }
table.mt { border-collapse: collapse; } table.mt td { padding: 1px 6px 1px 0; } table.mt td.k { color: var(--soft); }
.ser { display: flex; justify-content: space-between; font-size: 8px; letter-spacing: 3px; text-transform: uppercase; color: var(--soft); margin: 5mm 0 3mm 0; }
.kartlar .kk { width: calc(33.33% - 2.67mm); flex-direction: column; border-radius: 0; border: 0; background: transparent; }
.kartlar .kk .gor { width: auto; height: 34mm; flex-direction: row; gap: 6px; }
.kartlar .kk .ic { padding: 6px 0 0 0; }
.kartlar .kk .ic .kad { font-size: 11.5px; font-weight: 400; }
.alt2 { display: flex; gap: 8mm; margin-top: 6mm; border-top: 1px solid var(--ink); padding-top: 4mm; }
.alt2 .sol { flex: 1; }
.alt2 .sag { width: 76mm; }
.od { display: flex; justify-content: space-between; align-items: baseline; border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink); padding: 6px 0; margin-top: 4px; }
.od span { font-size: 8px; letter-spacing: 3px; text-transform: uppercase; }
.od b { font-size: 22px; font-weight: 400; }
.yzy { font-style: italic; color: var(--soft); margin-top: 4px; }
.dip { margin-top: 5mm; font-size: 8.3px; color: var(--soft); display: flex; justify-content: space-between; gap: 6mm; }`,
        body: `
<div class="sayfa">
<div class="bs"><div class="mk">${K.logo(54)}<div><div class="ad hf">${supName}</div>${tagline(S)}</div></div><div class="bt"><div class="t1">${docTitle}</div><div class="t2 hf">${docNo}</div></div></div>
<div class="inf">
    <div><div class="k">${cusLabel}</div><div class="ad hf">${cusName}</div>${cusInfo()}</div>
    <div><div class="k">${t('Belge')}</div>${meta({ pay: false })}</div>
    <div><div class="k">${t('Satıcı')}</div>${supInfo(' · ', '<br/>')}</div>
    <div>${qr(80)}</div>
</div>
<div class="ser"><span>${t(S.season ?? 'Koleksiyon')}</span><span>${lineCount}${t(' parça')}</span><span>${docDate}</span></div>
${K.lines}
<div class="alt2">
    <div class="sol">${iff('$f/cac:PaymentMeans/cbc:InstructionNote', `<div class="ack">${t('Ödeme: ')}${v('$f/cac:PaymentMeans/cbc:InstructionNote')}</div>`)}${K.blocks}</div>
    <div class="sag">${sumTable()}<div class="od"><span>${t('Ödenecek')}</span><b class="hf">${payable}</b></div><div class="yzy">${yaziyla}</div></div>
</div>
<div class="dip"><div>${notList()}</div><div class="ettn">${ettn}</div></div>
</div>`,
    }) },

    /* ------------------------------------------------------------ 5. Ayakkabı kutusu etiketi: kraft zemin, ızgara etiket */
    kutu: { lines: 'kutu', make: (S, K) => ({
        css: `
.sayfa { padding: 10mm 11mm; background: var(--paper); background-image: radial-gradient(rgba(0,0,0,.05) 1px, transparent 1.2px); background-size: 5px 5px; }
.lbl { display: grid; grid-template-columns: 52mm 1fr 1fr 1fr; border: 2px solid var(--ink); background: #ffffff; }
.lbl > div { border-right: 1.5px solid var(--ink); border-bottom: 1.5px solid var(--ink); padding: 5px 8px; }
.lbl .k { font-size: 6.8px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--soft); }
.lbl .v { font-size: 12.5px; font-weight: 700; text-transform: uppercase; }
.lbl .mk { grid-row: span 2; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: var(--a); color: var(--on); }
.lbl .mk .ad { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 3px; line-height: 1.2; }
.lbl .bk { grid-column: span 3; display: flex; gap: 10px; align-items: center; }
.lbl .bk .br { flex: 1; color: var(--ink); }
.lbl .bk .ettn { white-space: nowrap; }
.lbl .bt { background: var(--ink); color: var(--paper); }
.lbl .bt .k { color: var(--paper); opacity: .7; }
.taraf { display: grid; grid-template-columns: 1fr 1fr auto; gap: 5mm; margin-top: 5mm; }
.taraf .kut { border: 1.5px solid var(--ink); background: rgba(255,255,255,.7); padding: 6px 9px; }
.taraf .kut .k { font-size: 7px; letter-spacing: 2px; text-transform: uppercase; background: var(--ink); color: var(--paper); display: inline-block; padding: 1px 6px; margin-bottom: 3px; }
.taraf .kut .ad { font-weight: 700; font-size: 11px; }
table.mt { border-collapse: collapse; width: 100%; } table.mt td { padding: 1px 0; } table.mt td.k { color: var(--soft); } table.mt td.v { text-align: right; font-weight: 600; }
.bh { margin: 6mm 0 3mm 0; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; font-weight: 700; display: flex; gap: 8px; align-items: center; }
.bh:after { content: ''; flex: 1; height: 6px; background: repeating-linear-gradient(-45deg, var(--ink) 0 2px, transparent 2px 6px); }
.kutular .kt { background: #ffffff; }
.alt2 { display: flex; gap: 6mm; margin-top: 3mm; }
.alt2 .sol { flex: 1; }
.alt2 .sag { width: 80mm; border: 2px solid var(--ink); background: #ffffff; padding: 6px 10px; }
.od { margin: 6px -10px -6px -10px; background: var(--ink); color: var(--paper); padding: 7px 10px; display: flex; justify-content: space-between; align-items: baseline; }
.od span { font-size: 8px; letter-spacing: 3px; text-transform: uppercase; }
.od b { font-size: 19px; }
.yzy { font-size: 8.5px; font-style: italic; margin-top: 6px; }
.dip { margin-top: 5mm; font-size: 8.3px; color: var(--soft); }`,
        body: `
<div class="sayfa">
<div class="lbl">
    <div class="mk">${K.logo(46)}<div class="ad hf">${supName}</div>${tagline(S)}</div>
    <div class="bt"><div class="k">${t('Belge')}</div><div class="v">${docTitle}</div></div>
    <div><div class="k">${t('Fatura No')}</div><div class="v">${docNo}</div></div>
    <div><div class="k">${t('Tarih · Saat')}</div><div class="v">${docDate}${t(' · ')}${docTime}</div></div>
    <div><div class="k">${t('Kalem')}</div><div class="v">${lineCount}</div></div>
    <div><div class="k">${t(S.qtyLabel ?? 'Toplam miktar')}</div><div class="v">${qtySum}</div></div>
    <div><div class="k">${t('Ödenecek')}</div><div class="v">${payable}</div></div>
    <div class="bk"><div class="br">${barcode(26)}</div><span class="ettn">${t('ETTN ')}${ettn}</span></div>
</div>
<div class="taraf">
    <div class="kut"><span class="k">${cusLabel}</span><div class="ad">${cusName}</div>${cusInfo()}</div>
    <div class="kut"><span class="k">${t('Satıcı')}</span><div style="font-size:8.5px">${supInfo(' · ', '<br/>')}</div>${meta({ profile: true }).replace('<table class="mt">', '<table class="mt" style="margin-top:3px">')}</div>
    <div>${qr(92)}</div>
</div>
<div class="bh">${t(S.linesTitle ?? 'Kutu içeriği')}</div>
${K.lines}
<div class="alt2"><div class="sol">${K.blocks}</div><div class="sag">${sumTable()}<div class="yzy">${yaziyla}</div><div class="od"><span>${t('Ödenecek')}</span><b>${payable}</b></div></div></div>
<div class="dip">${notList()}</div>
</div>`,
    }) },

    /* ------------------------------------------------------------ 6. Spor şeridi: koyu başlık, çapraz şeritler, skor tabelası */
    serit: { lines: 'kompakt', make: (S, K) => ({
        css: `
.sayfa { padding: 0 0 10mm 0; }
.hd { background: var(--ink); color: #ffffff; padding: 9mm 11mm 8mm 11mm; position: relative; overflow: hidden; display: flex; gap: 12px; align-items: center; }
.hd:after { content: ''; position: absolute; right: -10mm; top: 0; bottom: 0; width: 82mm; background: repeating-linear-gradient(115deg, transparent 0 7mm, var(--a) 7mm 12mm, transparent 12mm 16mm, var(--b) 16mm 19mm, transparent 19mm 26mm); opacity: .95; }
.hd .ad { font-size: 22px; font-style: italic; text-transform: uppercase; line-height: 1; position: relative; z-index: 1; max-width: 115mm; }
.hd .slg { color: var(--a); font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; font-weight: 700; position: relative; z-index: 1; }
.hd .bt { position: absolute; right: 11mm; bottom: 4mm; z-index: 2; background: #ffffff; color: var(--ink); font-style: italic; font-weight: 800; text-transform: uppercase; padding: 3px 10px; transform: skewX(-12deg); font-size: 11px; letter-spacing: 1px; }
.skor { display: flex; margin: 0 11mm; transform: translateY(-1px); }
.skor > div { flex: 1; background: var(--a); color: var(--on); padding: 5px 9px; border-right: 2px solid var(--paper); }
.skor > div:last-child { border-right: 0; background: var(--b); }
.skor .k { font-size: 6.8px; letter-spacing: 1.5px; text-transform: uppercase; opacity: .85; }
.skor .v { font-size: 12px; font-weight: 800; font-style: italic; }
.ic { padding: 0 11mm; }
.taraf { display: grid; grid-template-columns: 1fr 1fr auto; gap: 6mm; margin-top: 6mm; }
.taraf .kut { border-left: 5px solid var(--a); padding: 2px 0 2px 9px; }
.taraf .kut .k { font-size: 7.5px; letter-spacing: 2px; text-transform: uppercase; color: var(--soft); font-weight: 700; }
.taraf .kut .ad { font-size: 12px; font-weight: 800; font-style: italic; text-transform: uppercase; }
table.mt { border-collapse: collapse; } table.mt td { padding: 1px 6px 1px 0; } table.mt td.k { color: var(--soft); } table.mt td.v { font-weight: 600; }
.bh { margin: 6mm 0 2mm 0; font-size: 13px; font-style: italic; font-weight: 800; text-transform: uppercase; }
.bh i { display: inline-block; width: 22px; height: 8px; margin-left: 6px; background: repeating-linear-gradient(115deg, var(--a) 0 3px, transparent 3px 6px); }
table.kz th { transform: none; font-style: italic; }
.alt2 { display: flex; gap: 6mm; margin-top: 5mm; }
.alt2 .sol { flex: 1; }
.alt2 .sag { width: 80mm; }
.od { margin-top: 6px; background: var(--ink); color: #ffffff; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; transform: skewX(-8deg); }
.od span, .od b { transform: skewX(8deg); }
.od span { font-size: 8.5px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); font-weight: 700; }
.od b { font-size: 20px; font-style: italic; }
.yzy { font-size: 8.5px; color: var(--soft); margin-top: 6px; }
.dip { margin-top: 5mm; font-size: 8.3px; color: var(--soft); display: flex; justify-content: space-between; gap: 6mm; }`,
        body: `
<div class="sayfa">
<div class="hd">${K.logo(54)}<div><div class="ad hf">${supName}</div>${tagline(S)}</div><div class="bt">${docTitle}</div></div>
<div class="skor">
    <div><div class="k">${t('Fatura No')}</div><div class="v">${docNo}</div></div>
    <div><div class="k">${t('Tarih')}</div><div class="v">${docDate}${t(' ')}${docTime}</div></div>
    <div><div class="k">${t('Kalem / Adet')}</div><div class="v">${lineCount}${t(' / ')}${qtySum}</div></div>
    <div><div class="k">${t('Ödenecek')}</div><div class="v">${payable}</div></div>
</div>
<div class="ic">
<div class="taraf">
    <div class="kut"><div class="k">${cusLabel}</div><div class="ad hf">${cusName}</div>${cusInfo()}</div>
    <div class="kut"><div class="k">${t('Satıcı')}</div>${supInfo(' · ', '<br/>')}${meta({ profile: true }).replace('<table class="mt">', '<table class="mt" style="margin-top:3px">')}</div>
    <div>${qr(88)}</div>
</div>
<div class="bh hf">${t(S.linesTitle ?? 'Sepetiniz')}<i></i></div>
${K.lines}
<div class="alt2"><div class="sol">${K.blocks}</div><div class="sag">${sumTable()}<div class="od"><span>${t('Ödenecek')}</span><b class="hf">${payable}</b></div><div class="yzy">${yaziyla}</div></div></div>
<div class="dip"><div>${notList()}</div><div class="ettn">${t('ETTN ')}${ettn}</div></div>
</div>
</div>`,
    }) },

    /* ------------------------------------------------------------ 7. Atölye: dikişli çerçeve, lastik damga, mühür */
    atolye: { lines: 'liste', make: (S, K) => ({
        css: `
.sayfa { padding: 8mm; }
.cer { border: 2px dashed var(--a); border-radius: 12px; min-height: 280mm; padding: 9mm 10mm; box-shadow: 0 0 0 4mm var(--t); margin: 4mm; }
.bs { display: flex; gap: 14px; align-items: center; }
.bs .ad { font-size: 23px; font-style: italic; line-height: 1.1; }
.bs .slg { font-size: 8.5px; letter-spacing: 3px; text-transform: uppercase; color: var(--a); margin-top: 3px; }
.bs .bil { font-size: 8.3px; color: var(--soft); margin-top: 3px; }
.dmg { margin-left: auto; border: 2.5px solid var(--a); color: var(--a); padding: 6px 12px; transform: rotate(-5deg); text-align: center; border-radius: 4px; opacity: .9; }
.dmg .t1 { font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
.dmg .t2 { font-family: Consolas, monospace; font-size: 10px; }
.ayr { text-align: center; color: var(--a); margin: 5mm 0; letter-spacing: 8px; font-size: 10px; }
.ikili { display: flex; gap: 8mm; }
.ikili > div { flex: 1; }
.ikili .k { font-size: 8px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--a); border-bottom: 1px dashed var(--a); padding-bottom: 2px; margin-bottom: 3px; }
.ikili .ad { font-size: 13px; font-style: italic; }
table.mt { border-collapse: collapse; width: 100%; } table.mt td { padding: 1.5px 0; border-bottom: 1px dotted var(--line); } table.mt td.k { color: var(--soft); } table.mt td.v { text-align: right; }
.liste .ll .nn { font-style: italic; }
.alt2 { display: flex; gap: 8mm; margin-top: 6mm; align-items: flex-start; }
.alt2 .sol { flex: 1; }
.alt2 .sag { width: 74mm; }
.muhur { width: 40mm; height: 40mm; border-radius: 50%; border: 2px solid var(--a); box-shadow: inset 0 0 0 4px var(--paper), inset 0 0 0 5.5px var(--a); margin: 6px auto 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--a); transform: rotate(-8deg); text-align: center; }
.muhur span { font-size: 7.5px; letter-spacing: 2.5px; text-transform: uppercase; }
.muhur b { font-size: 15px; margin: 2px 0; }
.yzy { font-style: italic; text-align: center; margin-top: 6px; }
.dip { display: flex; gap: 6mm; justify-content: space-between; align-items: flex-end; margin-top: 6mm; font-size: 8.3px; color: var(--soft); }`,
        body: `
<div class="sayfa"><div class="cer">
<div class="bs">${K.logo(62)}<div><div class="ad hf">${supName}</div>${tagline(S)}<div class="bil">${supInfo()}</div></div><div class="dmg"><div class="t1">${docTitle}</div><div class="t2">${docNo}</div></div></div>
<div class="ayr">${t('✂ - - - - - - - - - - - - - - - - - - - -')}</div>
<div class="ikili">
    <div><div class="k">${cusLabel}</div><div class="ad hf">${cusName}</div>${cusInfo()}</div>
    <div><div class="k">${t('Belge bilgileri')}</div>${meta()}</div>
</div>
<div class="ayr">${t(S.linesTitle ?? '— el emeği, göz nuru —')}</div>
${K.lines}
<div class="alt2"><div class="sol">${K.blocks}</div><div class="sag">${sumTable()}<div class="muhur"><span>${t('Ödenecek')}</span><b class="hf">${payable}</b><span>${docDate}</span></div></div></div>
<div class="yzy">${yaziyla}</div>
<div class="dip"><div>${notList()}<div class="ettn">${t('ETTN ')}${ettn}</div></div>${qr(84)}</div>
</div></div>`,
    }) },

    /* ------------------------------------------------------------ 8. Minimal (İsviçre ızgarası) */
    minimal: { lines: 'tablo', make: (S, K) => ({
        css: `
.sayfa { padding: 13mm 14mm; }
.ust { display: flex; justify-content: space-between; font-size: 7.5px; letter-spacing: 2px; text-transform: uppercase; color: var(--soft); }
.ust b { color: var(--ink); }
.no { font-size: 34px; font-weight: 300; letter-spacing: -1px; margin: 6mm 0 2mm 0; line-height: 1; }
.no i { display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: var(--a); margin-left: 6px; vertical-align: 8px; }
.bt { font-size: 12px; font-weight: 700; }
.grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0 8mm; border-top: 2px solid var(--ink); margin-top: 6mm; padding-top: 3mm; }
.grid .k { font-size: 7.5px; letter-spacing: 2px; text-transform: uppercase; color: var(--soft); margin-bottom: 3px; }
.grid .ad { font-weight: 700; font-size: 10.5px; }
table.mt { border-collapse: collapse; width: 100%; } table.mt td { padding: 1px 0; } table.mt td.k { color: var(--soft); } table.mt td.v { text-align: right; }
.bh { margin-top: 8mm; border-top: 2px solid var(--ink); }
table.kl th { text-transform: uppercase; letter-spacing: 1px; font-size: 7.3px; color: var(--soft); border-bottom: 1px solid var(--ink); }
.bdg { background: transparent; border: 1px solid var(--a); }
.alt2 { display: grid; grid-template-columns: 1fr 78mm; gap: 8mm; margin-top: 6mm; }
.od { border-top: 2px solid var(--ink); margin-top: 4px; padding-top: 6px; }
.od .k { font-size: 7.5px; letter-spacing: 2px; text-transform: uppercase; color: var(--soft); }
.od b { display: block; font-size: 28px; font-weight: 300; letter-spacing: -.5px; }
.od b:after { content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--a); margin-left: 5px; }
.yzy { font-size: 8.5px; color: var(--soft); margin-top: 3px; }
.dip { display: flex; gap: 6mm; align-items: flex-end; margin-top: 8mm; border-top: 1px solid var(--line); padding-top: 3mm; font-size: 8.3px; color: var(--soft); }
.dip .nt { flex: 1; }`,
        body: `
<div class="sayfa">
<div class="ust"><span><b>${supName}</b></span><span>${t(S.tagline ?? '')}</span><span>${docTitle}</span></div>
<div style="display:flex;justify-content:space-between;align-items:flex-end">
    <div><div class="no hf">${docNo}<i></i></div><div class="bt">${docTitle}${t(' — ')}${docDate}</div></div>
    ${K.logo(56)}
</div>
<div class="grid">
    <div><div class="k">${t('Satıcı')}</div><div class="ad">${supName}</div>${supInfo(' · ', '<br/>')}</div>
    <div><div class="k">${cusLabel}</div><div class="ad">${cusName}</div>${cusInfo()}</div>
    <div><div class="k">${t('Belge')}</div>${meta()}</div>
</div>
<div class="bh"></div>
${K.lines}
<div class="alt2"><div>${K.blocks}</div><div>${sumTable()}<div class="od"><span class="k">${t('Ödenecek tutar')}</span><b class="hf">${payable}</b></div><div class="yzy">${yaziyla}</div></div></div>
<div class="dip">${qr(76)}<div class="nt">${notList()}<div class="ettn">${t('ETTN ')}${ettn}</div></div></div>
</div>`,
    }) },

    /* ------------------------------------------------------------ 9. Pastel: puantiyeli zemin, baloncuklar */
    pastel: { lines: 'kart', make: (S, K) => ({
        css: `
.sayfa { padding: 9mm; background-color: var(--t); background-image: radial-gradient(var(--b) 1.4px, transparent 1.6px), radial-gradient(var(--a) 1.4px, transparent 1.6px); background-size: 18px 18px; background-position: 0 0, 9px 9px; }
.kg { background: var(--paper); border-radius: 22px; padding: 8mm 9mm; min-height: 276mm; box-shadow: 0 2px 0 var(--a); }
.bs { display: flex; align-items: center; gap: 12px; }
.bs .ad { font-size: 20px; font-weight: 700; color: var(--a); line-height: 1.15; }
.bs .slg { font-size: 9px; color: var(--soft); }
.balon { margin-left: auto; background: var(--a); color: var(--on); border-radius: 18px 18px 18px 4px; padding: 8px 14px; text-align: center; }
.balon .t1 { font-size: 12px; font-weight: 700; }
.balon .t2 { font-size: 8.5px; opacity: .9; }
.bil { font-size: 8.3px; color: var(--soft); margin-top: 3mm; padding: 4px 10px; background: var(--t); border-radius: 12px; }
.taraf { display: grid; grid-template-columns: 1fr 1fr auto; gap: 4mm; margin-top: 4mm; }
.taraf .kut { border-radius: 16px; padding: 7px 11px; background: var(--t); }
.taraf .kut:nth-child(2) { background: var(--paper); border: 2px dotted var(--b); }
.taraf .kut .k { font-size: 8px; font-weight: 700; color: var(--a); }
.taraf .kut .ad { font-size: 12px; font-weight: 700; }
table.mt { border-collapse: collapse; width: 100%; } table.mt td { padding: 1px 0; } table.mt td.k { color: var(--soft); } table.mt td.v { text-align: right; font-weight: 600; }
.bh { margin: 5mm 0 3mm 0; font-size: 13px; font-weight: 700; color: var(--a); }
.bh:before { content: '\\2605'; color: var(--b); margin-right: 6px; }
.kartlar .kk { border-radius: 16px; border: 2px solid var(--t); }
.kartlar .kk .gor { border-radius: 14px 0 0 14px; }
.kartlar .kk .gor .bb { border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 13px; padding: 0; }
.alt2 { display: flex; gap: 6mm; margin-top: 5mm; align-items: flex-start; }
.alt2 .sol { flex: 1; }
.alt2 .sag { width: 78mm; background: var(--t); border-radius: 16px; padding: 8px 12px; }
.top2 { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.dairesi { width: 30mm; height: 30mm; border-radius: 50%; background: var(--a); color: var(--on); display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 4px 4px 0 var(--b); }
.dairesi span { font-size: 7.5px; } .dairesi b { font-size: 13px; }
.yzy { font-size: 8.5px; color: var(--soft); }
.dip { margin-top: 5mm; font-size: 8.3px; color: var(--soft); text-align: center; }`,
        body: `
<div class="sayfa"><div class="kg">
<div class="bs">${K.logo(58)}<div><div class="ad hf">${supName}</div>${tagline(S)}</div><div class="balon"><div class="t1">${docTitle}</div><div class="t2">${docNo}</div></div></div>
<div class="bil">${supInfo()}</div>
<div class="taraf">
    <div class="kut"><div class="k">${cusLabel}</div><div class="ad hf">${cusName}</div>${cusInfo()}</div>
    <div class="kut">${meta()}</div>
    <div>${qr(84)}</div>
</div>
<div class="bh hf">${t(S.linesTitle ?? 'Sepetimizdekiler')}</div>
${K.lines}
<div class="alt2"><div class="sol">${K.blocks}</div><div class="sag">${sumTable()}<div class="top2"><div class="dairesi"><span>${t('Ödenecek')}</span><b class="hf">${payable}</b></div><div class="yzy">${yaziyla}</div></div></div></div>
<div class="dip">${notList()}<div class="ettn">${t('ETTN ')}${ettn}</div></div>
</div></div>`,
    }) },

    /* ------------------------------------------------------------ 10. Kurumsal (e-Fatura): çerçeveli künye, taraf kutuları */
    kurumsal: { lines: 'tablo', make: (S, K) => {
        const guv = S.variant === 'guvenlik';
        const blok = S.variant === 'blok';
        return {
            css: `
.sayfa { padding: ${guv || blok ? '0' : '11mm'} 12mm 10mm 12mm; }
${guv ? `.hz { height: 7mm; margin: 0 -12mm 8mm -12mm; background: repeating-linear-gradient(-45deg, var(--a) 0 9px, var(--ink) 9px 18px); }` : ''}
${blok ? `.bs { margin: 0 -12mm; padding: 9mm 12mm 7mm 12mm; background: var(--a); color: var(--on); }
.bs .ad { color: var(--on); } .bs .slg { color: var(--on); opacity: .85; } .bs .bil { color: var(--on); opacity: .8; }
.kunye { background: var(--paper); color: var(--ink); border-color: var(--paper); box-shadow: 0 2px 8px rgba(0,0,0,.18); }` : ''}
${!guv && !blok ? '.sayfa { border-top: 5mm solid var(--a); }' : ''}
.bs { display: flex; gap: 8mm; align-items: flex-start; }
.bs .mk { flex: 1; display: flex; gap: 12px; }
.bs .ad { font-size: 15px; font-weight: 700; color: var(--ink); }
.bs .slg { font-size: 8.5px; color: var(--a); font-weight: 600; margin: 1px 0 3px 0; }
.bs .bil { font-size: 8.5px; color: var(--soft); }
.kunye { width: 76mm; border: 1.5px solid var(--ink); }
.kunye .bt { background: var(--ink); color: #ffffff; text-align: center; font-size: 13px; font-weight: 700; letter-spacing: 2px; padding: 5px; text-transform: uppercase; }
.kunye table.mt { width: 100%; border-collapse: collapse; }
.kunye table.mt td { padding: 2.5px 7px; border-top: 1px solid var(--line); }
.kunye table.mt td.k { color: var(--soft); width: 33mm; } .kunye table.mt td.v { font-weight: 600; }
.taraf { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 6mm; }
.taraf .kut { border: 1px solid var(--line); }
.taraf .kut .k { background: var(--t); color: var(--a); font-size: 8px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; padding: 3px 9px; ${guv ? 'border-left: 4px solid var(--a);' : ''} }
.taraf .kut .i { padding: 6px 9px; }
.taraf .kut .ad { font-weight: 700; font-size: 11px; }
table.kl { margin-top: 5mm; border: 1px solid var(--line); }
table.kl th { background: var(--a); color: var(--on); }
table.kl td { border-right: 1px solid var(--line); }
.alt2 { display: flex; gap: 6mm; margin-top: 4mm; align-items: flex-start; }
.alt2 .sol { flex: 1; }
.alt2 .sag { width: 82mm; border: 1px solid var(--line); padding: 6px 10px; }
.od { margin: 6px -10px -6px -10px; background: var(--a); color: var(--on); padding: 7px 10px; display: flex; justify-content: space-between; align-items: center; ${guv ? 'border-left: 8px solid var(--ink);' : ''} }
.od span { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
.od b { font-size: 17px; }
.yzy { font-style: italic; margin-top: 4mm; padding: 4px 9px; background: var(--t); }
.dip { display: flex; gap: 6mm; align-items: flex-end; margin-top: 5mm; border-top: 1px solid var(--line); padding-top: 3mm; font-size: 8.3px; color: var(--soft); }
.dip .nt { flex: 1; }`,
            body: `
<div class="sayfa">
${guv ? '<div class="hz"></div>' : ''}
<div class="bs">
    <div class="mk">${K.logo(60)}<div><div class="ad hf">${supName}</div>${tagline(S)}<div class="bil">${supInfo(' · ', '<br/>')}</div></div></div>
    <div class="kunye"><div class="bt">${docTitle}</div>${meta()}</div>
</div>
<div class="taraf">
    <div class="kut"><div class="k">${cusLabel}</div><div class="i"><div class="ad">${cusName}</div>${cusInfo()}</div></div>
    <div class="kut"><div class="k">${t('Teslimat ve sipariş')}</div><div class="i">${iff('$f/cac:Delivery/cac:DeliveryAddress', `${v('$f/cac:Delivery/cac:DeliveryAddress/cbc:StreetName')}${t(' ')}${v('$f/cac:Delivery/cac:DeliveryAddress/cbc:BuildingNumber')}${t(' · ')}${v('$f/cac:Delivery/cac:DeliveryAddress/cbc:CitySubdivisionName')}${t(' / ')}${v('$f/cac:Delivery/cac:DeliveryAddress/cbc:CityName')}<br/>`)}${choose(['$f/cac:OrderReference', `${t('Sipariş: ')}<b>${v('$f/cac:OrderReference/cbc:ID')}</b>${t(' · ')}${v("concat(substring($f/cac:OrderReference/cbc:IssueDate,9,2),'.',substring($f/cac:OrderReference/cbc:IssueDate,6,2),'.',substring($f/cac:OrderReference/cbc:IssueDate,1,4))")}<br/>`], [null, ''])}${iff('$f/cac:PaymentTerms/cbc:Note', `${t('Ödeme koşulu: ')}${v('$f/cac:PaymentTerms/cbc:Note')}`)}</div></div>
</div>
${K.lines}
<div class="alt2"><div class="sol">${K.blocks}</div><div class="sag">${sumTable()}<div class="od"><span>${t('Ödenecek Tutar')}</span><b>${payable}</b></div></div></div>
<div class="yzy">${yaziyla}</div>
<div class="dip">${qr(84)}<div class="nt">${notList()}<div class="ettn">${t('ETTN ')}${ettn}</div></div></div>
</div>`,
        };
    } },

    /* ------------------------------------------------------------ 11. Zincir mağaza: marka çubuğu, mağaza / kasa rozeti */
    zincir: { lines: 'kompakt', make: (S, K) => ({
        css: `
.sayfa { padding: 0 0 10mm 0; }
.bar { background: var(--a); color: var(--on); display: flex; align-items: center; gap: 12px; padding: 7mm 11mm; }
.bar .ad { font-size: 19px; font-weight: 800; letter-spacing: .5px; }
.bar .slg { font-size: 8.5px; opacity: .85; letter-spacing: 1px; }
.bar .bt { margin-left: auto; text-align: right; }
.bar .bt .t1 { font-size: 15px; font-weight: 300; letter-spacing: 1px; }
.bar .bt .pill { display: inline-block; margin-top: 3px; background: var(--on); color: var(--a); border-radius: 20px; padding: 2px 10px; font-size: 8.5px; font-weight: 700; }
.pills { display: flex; flex-wrap: wrap; gap: 5px; padding: 3mm 11mm; background: var(--t); }
.pills span { background: var(--paper); border-radius: 20px; padding: 2px 10px; font-size: 8.5px; }
.pills span b { color: var(--a); }
.ic { padding: 0 11mm; }
.taraf { display: grid; grid-template-columns: 1fr 1fr auto; gap: 6mm; margin: 5mm 0; }
.taraf .k { font-size: 7.5px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); font-weight: 700; }
.taraf .ad { font-weight: 700; font-size: 11px; }
.alt3 { display: grid; grid-template-columns: 1fr 80mm; gap: 6mm; margin-top: 5mm; }
.kaz { display: flex; align-items: center; gap: 8px; border: 2px solid var(--a); border-radius: 8px; padding: 6px 10px; margin-bottom: 4px; color: var(--a); }
.kaz b { font-size: 15px; }
.od { margin-top: 6px; background: var(--ink); color: var(--paper); border-radius: 8px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; }
.od span { font-size: 9px; letter-spacing: 1px; text-transform: uppercase; }
.od b { font-size: 19px; }
.yzy { font-size: 8.5px; color: var(--soft); margin-top: 5px; }
.dip { margin-top: 5mm; font-size: 8.3px; color: var(--soft); display: flex; justify-content: space-between; gap: 6mm; border-top: 1px solid var(--line); padding-top: 3mm; }`,
        body: `
<div class="sayfa">
<div class="bar">${K.logo(52)}<div><div class="ad hf">${supName}</div>${tagline(S)}</div><div class="bt"><div class="t1">${docTitle}</div>${iff(hasRef('MAGAZA'), `<span class="pill">${store}</span>`)}</div></div>
<div class="pills">${metaRows((l, val) => `<span>${l}${t(': ')}<b>${val}</b></span>`)}</div>
<div class="ic">
<div class="taraf">
    <div><div class="k">${cusLabel}</div><div class="ad">${cusName}</div>${cusInfo()}</div>
    <div><div class="k">${t('Mağaza')}</div>${supInfo(' · ', '<br/>')}</div>
    <div>${qr(84)}</div>
</div>
${K.lines}
<div class="alt3">
    <div>${K.blocks}</div>
    <div>${iff(`${LMT}/cbc:AllowanceTotalAmount &gt; 0`, `<div class="kaz"><span>${t('Bugünkü kazancınız')}</span><b style="margin-left:auto">${saving}</b></div>`)}${sumTable()}<div class="od"><span>${t('Ödenecek')}</span><b class="hf">${payable}</b></div><div class="yzy">${yaziyla}</div></div>
</div>
<div class="dip"><div>${notList()}</div><div class="ettn">${t('ETTN ')}${ettn}</div></div>
</div>
</div>`,
    }) },

    /* ------------------------------------------------------------ 12. Outlet: sarı-siyah, indirim çıkartması */
    outlet: { lines: 'etiket', make: (S, K) => ({
        css: `
.sayfa { padding: 0 0 10mm 0; }
.hd { background: var(--ink); color: var(--a); padding: 8mm 11mm; display: flex; align-items: center; gap: 12px; position: relative; }
.hd .ad { font-size: 25px; text-transform: uppercase; line-height: 1; color: var(--a); }
.hd .slg { color: #ffffff; font-size: 9px; letter-spacing: 4px; text-transform: uppercase; margin-top: 4px; }
.stk { position: absolute; right: 14mm; top: 4mm; width: 34mm; height: 34mm; border-radius: 50%; background: var(--a); color: var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(12deg); box-shadow: 0 0 0 3px var(--ink), 0 0 0 5px var(--a); }
.stk b { font-size: 24px; line-height: 1; font-weight: 900; }
.stk span { font-size: 7.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.bant { background: repeating-linear-gradient(-45deg, var(--a) 0 12px, var(--ink) 12px 24px); height: 5mm; }
.ic { padding: 0 11mm; }
.bilgi { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6mm; margin: 5mm 0; }
.bilgi .k { font-size: 8px; font-weight: 900; text-transform: uppercase; background: var(--ink); color: var(--a); display: inline-block; padding: 1px 6px; margin-bottom: 3px; }
.bilgi .ad { font-weight: 800; font-size: 11px; }
table.mt { border-collapse: collapse; width: 100%; } table.mt td { padding: 1px 0; } table.mt td.v { text-align: right; font-weight: 700; }
.etiketler .et .uc { background: var(--ink); }
.etiketler .et .gv { background: var(--t); }
.etiketler .et .fy b { color: var(--ink); background: var(--a); display: inline-block; padding: 0 6px; }
.alt2 { display: flex; gap: 6mm; margin-top: 4mm; }
.alt2 .sol { flex: 1; }
.alt2 .sag { width: 80mm; border: 3px solid var(--ink); padding: 6px 10px; }
.od { margin: 6px -10px -6px -10px; background: var(--ink); padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; }
.od span { color: #ffffff; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
.od b { color: var(--a); font-size: 21px; }
.yzy { font-size: 8.5px; margin-top: 4mm; font-weight: 600; }
.dip { margin-top: 4mm; font-size: 8.3px; color: var(--soft); display: flex; gap: 6mm; align-items: flex-end; }
.dip .nt { flex: 1; }`,
        body: `
<div class="sayfa">
<div class="hd">${K.logo(54)}<div><div class="ad hf">${supName}</div>${tagline(S)}</div>${iff(`${LMT}/cbc:AllowanceTotalAmount &gt; 0`, `<div class="stk"><span>${t('Bu fişte')}</span><b class="hf">${t('-%')}${savePct}</b><span>${t('ek indirim')}</span></div>`)}</div>
<div class="bant"></div>
<div class="ic">
<div class="bilgi">
    <div><span class="k">${docTitle}</span>${meta()}</div>
    <div><span class="k">${cusLabel}</span><div class="ad">${cusName}</div>${cusInfo()}</div>
    <div><span class="k">${t('Mağaza')}</span>${supInfo(' · ', '<br/>')}</div>
</div>
${K.lines}
<div class="alt2"><div class="sol">${K.blocks}</div><div class="sag">${sumTable()}<div class="od"><span>${t('Ödenecek')}</span><b class="hf">${payable}</b></div></div></div>
<div class="yzy">${yaziyla}</div>
<div class="dip">${qr(80)}<div class="nt">${notList()}<div class="ettn">${t('ETTN ')}${ettn}</div></div></div>
</div>
</div>`,
    }) },

    /* ------------------------------------------------------------ 13. Lüks: siyah başlık, altın çizgiler */
    luks: { lines: 'liste', make: (S, K) => ({
        css: `
.sayfa { padding: 0 0 0 0; }
.hd { background: var(--ink); color: var(--a); text-align: center; padding: 9mm 12mm 7mm 12mm; position: relative; }
.hd:after { content: ''; position: absolute; left: 6mm; right: 6mm; top: 4mm; bottom: 4mm; border: 1px solid var(--a); outline: 1px solid var(--a); outline-offset: -4px; pointer-events: none; }
.hd .ad { font-size: 20px; letter-spacing: 7px; text-transform: uppercase; margin-top: 4px; color: #ffffff; }
.hd .slg { font-size: 8px; letter-spacing: 5px; text-transform: uppercase; margin-top: 3px; }
.hd .bil { font-size: 8px; color: #d6d3d1; margin-top: 4px; letter-spacing: .3px; }
.ic { padding: 7mm 14mm 6mm 14mm; }
.ayr { display: flex; align-items: center; gap: 10px; margin: 5mm 0 3mm 0; color: var(--a); font-size: 8.5px; letter-spacing: 5px; text-transform: uppercase; }
.ayr:before, .ayr:after { content: ''; flex: 1; border-top: 1px solid var(--a); }
.ikili { display: flex; gap: 10mm; }
.ikili > div { flex: 1; }
.ikili .k { font-size: 8px; letter-spacing: 3px; color: var(--a); text-transform: uppercase; }
.ikili .ad { font-size: 14px; font-style: italic; }
table.mt { border-collapse: collapse; width: 100%; } table.mt td { padding: 1.5px 0; } table.mt td.k { color: var(--soft); } table.mt td.v { text-align: right; }
.liste .ll .nn { color: var(--a); font-style: italic; }
.liste .ll .ff i { border-bottom-color: var(--a); }
.alt2 { display: flex; gap: 8mm; margin-top: 5mm; align-items: flex-start; }
.alt2 .sol { flex: 1; }
.alt2 .sag { width: 76mm; }
.od { text-align: center; margin-top: 8px; border-top: 1px solid var(--a); border-bottom: 1px solid var(--a); padding: 7px 0; }
.od span { font-size: 8px; letter-spacing: 5px; color: var(--a); text-transform: uppercase; }
.od b { display: block; font-size: 22px; font-weight: 400; }
.yzy { font-style: italic; text-align: center; margin-top: 5px; color: var(--soft); }
.ft { background: var(--ink); color: #d6d3d1; padding: 5mm 14mm; display: flex; gap: 8mm; align-items: center; font-size: 8.3px; }
.ft .nt { flex: 1; }
.ft .ettn { color: var(--a); }
.ft .q { background: #ffffff; padding: 4px; }`,
        body: `
<div class="sayfa">
<div class="hd">${K.logo(56)}<div class="ad hf">${supName}</div>${tagline(S)}<div class="bil">${supInfo()}</div></div>
<div class="ic">
<div class="ayr">${docTitle}</div>
<div class="ikili">
    <div><div class="k">${cusLabel}</div><div class="ad hf">${cusName}</div>${cusInfo()}</div>
    <div>${meta()}</div>
</div>
<div class="ayr">${t(S.linesTitle ?? 'Seçimleriniz')}</div>
${K.lines}
<div class="alt2"><div class="sol">${K.blocks}</div><div class="sag">${sumTable()}<div class="od"><span>${t('Ödenecek')}</span><b class="hf">${payable}</b></div><div class="yzy">${yaziyla}</div></div></div>
</div>
<div class="ft"><div class="q">${qr(76)}</div><div class="nt">${notList()}<div class="ettn">${t('ETTN ')}${ettn}</div></div></div>
</div>`,
    }) },

    /* ------------------------------------------------------------ 14. Kumaş: dokuma desenli başlık, kenar (kumaş kenarı) yazısı, dokuma etiket */
    kumas: { lines: 'tablo', make: (S, K) => ({
        css: `
.sayfa { padding: 0 0 10mm 0; }
.dk { background-color: var(--a); background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.13) 0 2px, transparent 2px 4px), repeating-linear-gradient(90deg, rgba(0,0,0,.14) 0 2px, transparent 2px 4px); color: var(--on); padding: 8mm 11mm; display: flex; align-items: center; gap: 12px; }
.dk .ad { font-size: 20px; line-height: 1.1; }
.dk .slg { font-size: 8.5px; letter-spacing: 3px; text-transform: uppercase; opacity: .9; margin-top: 3px; }
.dk .bil { font-size: 8px; opacity: .85; margin-top: 3px; }
.kenar { background: var(--paper); border-bottom: 1px solid var(--line); white-space: nowrap; overflow: hidden; font-size: 7px; letter-spacing: 3px; text-transform: uppercase; color: var(--a); padding: 2px 0; }
.ic { padding: 0 11mm; }
.ust { display: flex; gap: 6mm; margin-top: 6mm; align-items: flex-start; }
.ust .mus { flex: 1; }
.ust .mus .k { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); font-weight: 700; }
.ust .mus .ad { font-size: 13px; font-weight: 600; }
.dokuma { width: 80mm; background: var(--b); color: var(--on); padding: 6px 12px 8px 12px; position: relative; box-shadow: inset 0 0 0 3px var(--b), inset 0 0 0 4px rgba(255,255,255,.55); }
.dokuma:before, .dokuma:after { content: ''; position: absolute; top: -2mm; bottom: -2mm; width: 4mm; background: repeating-linear-gradient(0deg, var(--b) 0 1.5px, transparent 1.5px 3px); }
.dokuma:before { left: -4mm; } .dokuma:after { right: -4mm; }
.dokuma .bt { text-align: center; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,.5); padding-bottom: 3px; margin-bottom: 3px; }
.dokuma table.mt { width: 100%; border-collapse: collapse; } .dokuma table.mt td { padding: 1px 0; } .dokuma table.mt td.v { text-align: right; font-weight: 600; }
.sw { width: 20px; height: 20px; border-radius: 3px; float: left; margin: 0 8px 4px 0; background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.18) 0 2px, transparent 2px 4px) !important; }
table.kl { margin-top: 5mm; }
table.kl th { border-bottom: 2px solid var(--a); color: var(--a); text-transform: uppercase; letter-spacing: 1px; }
.alt2 { display: flex; gap: 6mm; margin-top: 5mm; }
.alt2 .sol { flex: 1; }
.alt2 .sag { width: 80mm; }
.od { margin-top: 6px; background-color: var(--a); background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.12) 0 2px, transparent 2px 4px); color: var(--on); padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
.od b { font-size: 18px; }
.yzy { font-style: italic; color: var(--soft); margin-top: 5px; }
.dip { margin-top: 5mm; font-size: 8.3px; color: var(--soft); display: flex; gap: 6mm; align-items: flex-end; }
.dip .nt { flex: 1; }`,
        body: `
<div class="sayfa">
<div class="dk">${K.logo(56)}<div><div class="ad hf">${supName}</div>${tagline(S)}<div class="bil">${supInfo()}</div></div></div>
<div class="kenar">${t(`${S.selvage ?? 'Orijinal kumaş'} · `.repeat(14))}</div>
<div class="ic">
<div class="ust">
    <div class="mus"><div class="k">${cusLabel}</div><div class="ad hf">${cusName}</div>${cusInfo()}</div>
    <div class="dokuma"><div class="bt">${docTitle}</div>${meta()}</div>
</div>
${K.lines}
<div class="alt2"><div class="sol">${K.blocks}</div><div class="sag">${sumTable()}<div class="od"><span>${t('Ödenecek')}</span><b class="hf">${payable}</b></div><div class="yzy">${yaziyla}</div></div></div>
<div class="dip">${qr(80)}<div class="nt">${notList()}<div class="ettn">${t('ETTN ')}${ettn}</div></div></div>
</div>
</div>`,
    }) },

    /* ------------------------------------------------------------ 15. Sosyal medya butiği: profil başlığı, gönderi karoları, mesaj balonu */
    sosyal: { lines: 'kart', make: (S, K) => ({
        css: `
.sayfa { padding: 9mm 12mm; }
.pr { display: flex; gap: 8mm; align-items: center; }
.av { width: 30mm; height: 30mm; border-radius: 50%; padding: 3px; background: linear-gradient(45deg, #f59e0b, var(--a) 50%, var(--b)); flex-shrink: 0; }
.av > div { width: 100%; height: 100%; border-radius: 50%; background: var(--paper); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 3px solid var(--paper); }
.pr .hn { font-size: 17px; font-weight: 600; }
.pr .ad { font-size: 9px; color: var(--soft); }
.st { display: flex; gap: 8mm; margin: 4px 0; }
.st div { text-align: center; } .st b { display: block; font-size: 13px; } .st span { font-size: 8px; color: var(--soft); }
.btn { display: inline-block; background: linear-gradient(90deg, var(--a), var(--b)); color: #ffffff; border-radius: 6px; padding: 3px 14px; font-weight: 600; font-size: 9px; }
.bio { font-size: 8.5px; color: var(--soft); margin-top: 3px; }
.sekme { display: flex; justify-content: center; gap: 14mm; border-top: 1px solid var(--line); margin-top: 5mm; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: var(--soft); }
.sekme span { padding: 4px 0; } .sekme span.ak { color: var(--ink); border-top: 1.5px solid var(--ink); font-weight: 700; }
.kartlar { gap: 2mm; }
.kartlar .kk { width: calc(33.33% - 1.34mm); flex-direction: column; border: 0; border-radius: 0; }
.kartlar .kk .gor { width: auto; height: 30mm; background: linear-gradient(135deg, var(--t), var(--paper)); }
.kartlar .kk .ic { padding: 5px 2px 0 2px; }
.kartlar .kk .ic .alt { border-top: 0; }
.msj { display: flex; gap: 6mm; margin-top: 5mm; }
.msj > div { flex: 1; }
.bal { border-radius: 16px; padding: 8px 12px; background: var(--t); margin-bottom: 3px; }
.bal.sag { background: linear-gradient(90deg, var(--a), var(--b)); color: #ffffff; border-radius: 16px 16px 4px 16px; }
.bal.sol { border-radius: 16px 16px 16px 4px; }
.bal .k { font-size: 7.5px; letter-spacing: 1.5px; text-transform: uppercase; opacity: .8; }
.bal .ad { font-weight: 700; font-size: 11px; }
table.mt { border-collapse: collapse; width: 100%; } table.mt td { padding: 1px 0; } table.mt td.v { text-align: right; font-weight: 600; }
.alt2 { display: flex; gap: 6mm; margin-top: 3mm; }
.alt2 .sol { flex: 1; }
.alt2 .sg { width: 78mm; }
.od { margin-top: 6px; background: linear-gradient(90deg, var(--a), var(--b)); color: #ffffff; border-radius: 10px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
.od b { font-size: 18px; }
.yzy { font-size: 8.5px; color: var(--soft); margin-top: 5px; }
.dip { margin-top: 5mm; font-size: 8.3px; color: var(--soft); display: flex; gap: 6mm; align-items: flex-end; }
.dip .nt { flex: 1; }`,
        body: `
<div class="sayfa">
<div class="pr">
    <div class="av"><div>${K.logo(80)}</div></div>
    <div style="flex:1">
        <div class="hn">${t(S.handle ?? '@magaza')}</div>
        <div class="st"><div><b>${lineCount}</b><span>${t('ürün')}</span></div><div><b>${qtySum}</b><span>${t('adet')}</span></div><div><b>${payable}</b><span>${t('toplam')}</span></div></div>
        <span class="btn">${docTitle}${t(' · ')}${docNo}</span>
        <div class="ad" style="margin-top:4px"><b>${supName}</b></div>
        <div class="bio">${supInfo()}</div>
    </div>
    ${qr(84)}
</div>
<div class="sekme"><span class="ak">${t('Sipariş')}</span><span>${docDate}${t(' · ')}${docTime}</span><span>${t(S.tagline ?? '')}</span></div>
${K.lines}
<div class="msj">
    <div><div class="bal sol"><div class="k">${cusLabel}</div><div class="ad">${cusName}</div>${cusInfo()}</div></div>
    <div><div class="bal sag">${meta()}</div></div>
</div>
<div class="alt2"><div class="sol">${K.blocks}</div><div class="sg">${sumTable()}<div class="od"><span>${t('Ödenecek')}</span><b class="hf">${payable}</b></div><div class="yzy">${yaziyla}</div></div></div>
<div class="dip"><div class="nt">${notList()}<div class="ettn">${t('ETTN ')}${ettn}</div></div></div>
</div>`,
    }) },

    /* ------------------------------------------------------------ 16. Hediye: kurdeleli sayfa, hediye etiketi */
    hediye: { lines: 'liste', make: (S, K) => ({
        css: `
.sayfa { padding: 0 12mm 10mm 12mm; position: relative; overflow: hidden; }
.sayfa:before { content: ''; position: absolute; top: 0; bottom: 0; right: 30mm; width: 9mm; background: var(--a); opacity: .9; }
.kur { margin: 0 -12mm; height: 9mm; background: var(--a); margin-top: 22mm; position: relative; }
.fiyonk { position: absolute; right: 21mm; top: -11mm; width: 27mm; height: 22mm; z-index: 2; }
.fiyonk:before, .fiyonk:after { content: ''; position: absolute; top: 3mm; width: 13mm; height: 14mm; border: 3.5mm solid var(--b); border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; }
.fiyonk:before { left: -1mm; transform: rotate(-30deg); } .fiyonk:after { right: -1mm; transform: rotate(30deg); }
.fiyonk i { position: absolute; left: calc(50% - 3.5mm); top: 7mm; width: 7mm; height: 8mm; border-radius: 2mm; background: var(--b); z-index: 3; }
.bs { position: absolute; top: 6mm; left: 12mm; display: flex; gap: 10px; align-items: center; }
.bs .ad { font-size: 17px; line-height: 1.1; }
.bs .slg { font-size: 8.5px; color: var(--soft); letter-spacing: 2px; text-transform: uppercase; }
.ic { position: relative; z-index: 1; max-width: 148mm; }
.ust { display: flex; gap: 6mm; margin-top: 6mm; align-items: flex-start; }
.hetk { flex: 1; position: relative; background: var(--t); padding: 8px 12px 8px 22px; clip-path: polygon(10mm 0, 100% 0, 100% 100%, 10mm 100%, 0 50%); }
.hetk:before { content: ''; position: absolute; left: 4mm; top: calc(50% - 3px); width: 6px; height: 6px; border-radius: 50%; background: var(--paper); }
.hetk .k { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); padding-left: 6mm; }
.hetk .ad { font-size: 14px; font-style: italic; padding-left: 6mm; }
.hetk .ack { padding-left: 6mm; }
.belge { width: 64mm; }
.belge .bt { font-size: 13px; color: var(--a); }
table.mt { border-collapse: collapse; width: 100%; } table.mt td { padding: 1px 0; } table.mt td.k { color: var(--soft); } table.mt td.v { text-align: right; }
.sat { font-size: 8.3px; color: var(--soft); margin-top: 4mm; }
.bh { margin: 5mm 0 1mm 0; font-size: 14px; font-style: italic; color: var(--a); }
.alt2 { display: flex; gap: 6mm; margin-top: 5mm; }
.alt2 .sol { flex: 1; }
.alt2 .sag { width: 70mm; }
.od { margin-top: 6px; border: 2px solid var(--a); border-radius: 12px; padding: 7px 12px; text-align: center; }
.od span { font-size: 8px; letter-spacing: 3px; text-transform: uppercase; color: var(--a); }
.od b { display: block; font-size: 20px; }
.yzy { font-style: italic; color: var(--soft); margin-top: 5px; }
.dip { margin-top: 5mm; font-size: 8.3px; color: var(--soft); display: flex; gap: 6mm; align-items: flex-end; }
.dip .nt { flex: 1; }`,
        body: `
<div class="sayfa">
<div class="bs">${K.logo(52)}<div><div class="ad hf">${supName}</div>${tagline(S)}</div></div>
<div class="kur"><div class="fiyonk"><i></i></div></div>
<div class="ic">
<div class="ust">
    <div class="hetk"><div class="k">${cusLabel}</div><div class="ad hf">${cusName}</div><div class="ack">${cusInfo()}</div></div>
    <div class="belge"><div class="bt hf">${docTitle}</div>${meta()}</div>
</div>
<div class="sat">${supInfo()}</div>
<div class="bh hf">${t(S.linesTitle ?? 'Hediyeleriniz')}</div>
${K.lines}
<div class="alt2"><div class="sol">${K.blocks}</div><div class="sag">${sumTable()}<div class="od"><span>${t('Ödenecek')}</span><b class="hf">${payable}</b></div><div class="yzy">${yaziyla}</div></div></div>
<div class="dip">${qr(80)}<div class="nt">${notList()}<div class="ettn">${t('ETTN ')}${ettn}</div></div></div>
</div>
</div>`,
    }) },

    /* ------------------------------------------------------------ 17. Defter: çizgili kâğıt, kırmızı marj, ataş */
    defter: { lines: 'tablo', make: (S, K) => ({
        css: `
.sayfa { padding: 12mm 12mm 10mm 26mm; background-color: var(--paper); background-image: linear-gradient(90deg, transparent 20mm, #f87171 20mm, #f87171 20.5mm, transparent 20.5mm), repeating-linear-gradient(180deg, transparent 0 23px, #c7d7ee 23px 24px); }
.atas { position: absolute; top: -3mm; right: 30mm; width: 9mm; height: 30mm; border: 2px solid #9ca3af; border-radius: 5mm; }
.atas:after { content: ''; position: absolute; left: 1.5mm; right: 1.5mm; top: 4mm; bottom: 1.5mm; border: 2px solid #9ca3af; border-top: 0; border-radius: 0 0 4mm 4mm; }
.bs { display: flex; gap: 12px; align-items: center; }
.bs .ad { font-size: 21px; line-height: 1.15; color: var(--a); }
.bs .slg { font-size: 9px; color: var(--soft); }
.bil { font-size: 8.5px; color: var(--soft); margin-top: 2mm; }
.bt { margin-top: 4mm; display: flex; align-items: baseline; gap: 10px; }
.bt .t1 { font-size: 16px; border-bottom: 3px solid var(--b); }
.bt .t2 { font-family: Consolas, monospace; font-size: 11px; }
.ikili { display: flex; gap: 8mm; margin-top: 4mm; }
.ikili > div { flex: 1; }
.ikili .k { font-size: 10px; color: var(--a); }
.ikili .ad { font-weight: 700; font-size: 11px; }
table.mt { border-collapse: collapse; width: 100%; } table.mt td { padding: 1.5px 0; } table.mt td.k { color: var(--soft); } table.mt td.v { text-align: right; font-weight: 600; }
table.kl { margin-top: 5mm; }
table.kl th { font-size: 9px; color: var(--a); border-bottom: 2px solid var(--a); }
table.kl td { border-bottom: 1px dashed #c7d7ee; background: transparent; }
.alt2 { display: flex; gap: 6mm; margin-top: 5mm; }
.alt2 .sol { flex: 1; }
.alt2 .sag { width: 76mm; }
.od { margin-top: 6px; display: flex; justify-content: space-between; align-items: baseline; border-bottom: 4px double var(--a); padding: 4px 0; }
.od span { font-size: 13px; color: var(--a); }
.od b { font-size: 19px; }
.yzy { font-size: 9px; margin-top: 5px; }
.dip { margin-top: 5mm; font-size: 8.3px; color: var(--soft); display: flex; gap: 6mm; align-items: flex-end; }
.dip .nt { flex: 1; }
.imza { font-size: 13px; color: var(--a); transform: rotate(-4deg); text-align: center; border-top: 1px solid var(--soft); padding-top: 2px; width: 40mm; }`,
        body: `
<div class="sayfa">
<div class="atas"></div>
<div class="bs">${K.logo(54)}<div><div class="ad hf">${supName}</div>${tagline(S)}</div></div>
<div class="bil">${supInfo()}</div>
<div class="bt"><span class="t1 hf">${docTitle}</span><span class="t2">${t('No: ')}${docNo}</span></div>
<div class="ikili">
    <div><div class="k hf">${cusLabel}</div><div class="ad">${cusName}</div>${cusInfo()}</div>
    <div>${meta()}</div>
</div>
${K.lines}
<div class="alt2"><div class="sol">${K.blocks}</div><div class="sag">${sumTable()}<div class="od"><span class="hf">${t('Ödenecek')}</span><b>${payable}</b></div><div class="yzy">${yaziyla}</div></div></div>
<div class="dip">${qr(80)}<div class="nt">${notList()}<div class="ettn">${t('ETTN ')}${ettn}</div></div><div class="imza hf">${t(S.sign ?? 'Teşekkürler')}</div></div>
</div>`,
    }) },
};
