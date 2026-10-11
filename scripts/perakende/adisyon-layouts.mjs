// Adisyon tarzı e-Arşiv yerleşimleri (lokanta, kafe, pastane, ocakbaşı, balık, paket servis, kiosk, kahvaltı,
// dondurma, fine dining). Satırlar menüdeki gibi KDV dahil fiyatla gösterilir; altta matrah / KDV dökümü yer alır.
import {
    t, v, num, each, iff, choose, attr, P, money, LMT, qr,
    docTitle, docNo, docDate, docTime, ettn, payable, supName, supInfo, cusName, cusInfo, cusLabel,
    yaziyla, notList, ref, hasRef,
} from './kit.mjs';

const LINES = '$f/cac:InvoiceLine';
const PCT = 'cac:TaxTotal/cac:TaxSubtotal/cbc:Percent';
const id = (k) => ref(k);
const ds = (k) => ref(k, 'cbc:DocumentDescription');
const has = (k) => hasRef(k);
const opt = (k, html) => iff(has(k), html);
const payNote = v('$f/cac:PaymentMeans/cbc:InstructionNote');
const kisiBasi = money(`${LMT}/cbc:PayableAmount div number(${hasRef('KISI')}/cbc:ID)`);

/** Satır (InvoiceLine bağlamı) parçaları. */
const X = {
    no: v('cbc:ID'),
    ad: v('cac:Item/cbc:Name'),
    ack: (c = 'ack') => iff('cac:Item/cbc:Description', `<div class="${c}">${v('cac:Item/cbc:Description')}</div>`),
    not: (c = 'mut', pre = '↳ ') => iff('cbc:Note', `<div class="${c}">${t(pre)}${v('cbc:Note')}</div>`),
    adet: num('cbc:InvoicedQuantity', '###.##0,###'),
    birim: choose(
        ["cbc:InvoicedQuantity/@unitCode='KGM'", t(' kg')],
        ["cbc:InvoicedQuantity/@unitCode='LTR'", t(' L')],
        ["cbc:InvoicedQuantity/@unitCode='PTN'", t(' porsiyon')],
        [null, ''],
    ),
    fiyat: money(`(cbc:LineExtensionAmount + cac:TaxTotal/cbc:TaxAmount + sum(cac:AllowanceCharge/cbc:Amount) * (1 + ${PCT} div 100)) div cbc:InvoicedQuantity`),
    tutar: money('cbc:LineExtensionAmount + cac:TaxTotal/cbc:TaxAmount'),
    kdv: `${t('%')}${v(PCT)}`,
    isk: (c = 'isk') => each('cac:AllowanceCharge', `<div class="${c}">${v('cbc:AllowanceChargeReason')}${t(' − ')}${money(`cbc:Amount * (1 + ../${PCT} div 100)`)}</div>`),
    p: (k) => v(P(k)),
    cips: (c = 'cp', hide = []) => each(`cac:Item/cac:AdditionalItemIdentification/cbc:ID[not(${['GRUP', ...hide].map((k) => `@schemeID='${k}'`).join(' or ')})]`, `<span class="${c}">${v('.')}</span>`),
    grup: (html) => iff(`${P('GRUP')} and not(preceding-sibling::cac:InvoiceLine[1]/${P('GRUP')} = ${P('GRUP')})`, html(v(P('GRUP')))),
};
X.miktar = `${X.adet}${X.birim}`;
X.hesap = `${X.miktar}${t(' × ')}${X.fiyat}`;

/** Matrah / KDV dökümü: row(etiket, tutar, sınıf). */
const ozet = (row) => [
    iff(`${LMT}/cbc:AllowanceTotalAmount &gt; 0`, row(t('İndirim / ikram (KDV hariç)'), `${t('− ')}${money(`${LMT}/cbc:AllowanceTotalAmount`)}`, 'isk')),
    row(t('KDV hariç tutar'), money(`${LMT}/cbc:TaxExclusiveAmount`), ''),
    each('$f/cac:TaxTotal/cac:TaxSubtotal', row(`${t('KDV %')}${v('cbc:Percent')}${t(' · matrah ')}${num('cbc:TaxableAmount')}`, money('cbc:TaxAmount'), '')),
].join('');
const ozetTablo = (c = 'oz') => `<table class="${c}">${ozet((l, val, k) => `<tr class="${k}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>`;

const musteri = `${cusLabel}${t(' ')}<b>${cusName}</b><br/>${cusInfo()}`;
const satici = `<b>${supName}</b><br/>${supInfo(' · ', '<br/>')}`;
const tagline = (S) => (S.tagline ? t(S.tagline) : '');
/** GİB karekodu ve belge künyesi. */
const resmi = (q = 80) => `<div class="resmi"><div class="qrw">${qr(q)}</div><div class="rb"><b>${docTitle}</b>${t(' · No ')}${docNo}<br/>${t('Düzenleme ')}${docDate}${t(' ')}${docTime}<br/><span class="ettn">${t('ETTN ')}${ettn}</span>${opt('ADISYON', `<br/>${t('Adisyon ')}${id('ADISYON')}${t(' bu e-Arşiv faturaya dönüştürülmüştür.')}`)}<div class="nl">${notList()}</div></div></div>`;
/** Sadakat kartı damgaları (SADAKAT: dolu sayı · açıklama). */
const damgalar = (n, mark = (i) => String(i)) => Array.from({ length: n }, (_, k) => k + 1)
    .map((i) => `<span>${attr('class', choose([`number(${hasRef('SADAKAT')}/cbc:ID) &gt;= ${i}`, t('d')], [null, t('')]))}${t(mark(i))}</span>`).join('');

const ORTAK = `
.sayfa { box-sizing: border-box; }
.r { text-align: right; } .c { text-align: center; } .nw { white-space: nowrap; }
.ack { color: var(--soft); font-size: 8.6px; }
.mut { color: var(--a); font-size: 8.4px; font-style: italic; }
.isk { color: #15803d; font-size: 8.4px; }
table.oz { width: 100%; border-collapse: collapse; font-size: 8.8px; }
table.oz td { padding: 1.5px 0; } table.oz td.t { text-align: right; white-space: nowrap; padding-left: 8px; }
table.oz tr.isk td { color: #15803d; }
.resmi { display: flex; gap: 10px; align-items: center; font-size: 8.2px; line-height: 1.4; }
.resmi .qrw { background: #ffffff; padding: 4px; border-radius: 4px; line-height: 0; flex-shrink: 0; }
.resmi .rb { flex: 1; min-width: 0; }
.resmi .nl { margin-top: 3px; color: var(--soft); }
.ettn { font-family: Consolas, monospace; font-size: 7.6px; word-break: break-all; }
.yzy { font-size: 8.4px; font-style: italic; }`;

const L = (make) => ({ lines: 'tablo', make: (S, K) => { const o = make(S, K); return { css: `${ORTAK}\n${o.css}`, body: o.body }; } });

export const ADISYON_LAYOUTS = {
    /* ------------------------------------------------------------ 1. Esnaf lokantası: karbonlu garson bloknotu */
    'ad-klasik': L((S, K) => ({
        css: `
.sayfa { background: #9a7350 repeating-linear-gradient(90deg, rgba(0,0,0,.06) 0 2px, transparent 2px 11px); padding: 11mm 0; }
.pad { width: 152mm; margin: 0 auto; background: var(--t); box-shadow: 3px 4px 10px rgba(0,0,0,.4); position: relative; }
.pad .tp { height: 10mm; background: var(--a); border-bottom: 2px dashed rgba(255,255,255,.75); position: relative; }
.pad .tp:after { content: ''; position: absolute; left: 7mm; right: 7mm; top: 3.2mm; height: 3.6mm; background: radial-gradient(circle, #9a7350 1.5mm, transparent 1.6mm) 0 0 / 9mm 3.6mm repeat-x; }
.pad .ic { padding: 5mm 8mm 6mm; }
.bas { display: flex; align-items: center; gap: 10px; border-bottom: 2px solid var(--a); padding-bottom: 3mm; }
.bas .ad { font-size: 17px; font-weight: 800; color: var(--a); text-transform: uppercase; letter-spacing: .5px; line-height: 1.1; }
.bas .slg { font-size: 8.5px; color: var(--soft); }
.bas .sr { margin-left: auto; text-align: right; }
.bas .sr small { display: block; font-size: 7.5px; letter-spacing: 3px; color: var(--a); font-weight: 700; }
.bas .sr b { font-family: Consolas, monospace; font-size: 19px; color: #c81e1e; letter-spacing: 1px; }
.kutu { display: grid; grid-template-columns: 1.2fr 1fr .7fr 1.2fr; border: 1.5px solid var(--a); margin-top: 3mm; }
.kutu div { padding: 3px 7px; border-right: 1.5px solid var(--a); }
.kutu div:last-child { border-right: 0; }
.kutu small { display: block; font-size: 7px; letter-spacing: 1.5px; color: var(--a); font-weight: 700; text-transform: uppercase; }
.el { color: #1e3a8a; }
.kutu b { font-size: 12.5px; font-weight: 400; }
table.ad { width: 100%; border-collapse: collapse; margin-top: 3mm; border: 1.5px solid var(--a); }
table.ad th { background: var(--a); color: var(--on); font-size: 7.5px; letter-spacing: 1.5px; padding: 3px 6px; text-align: left; }
table.ad th.r { text-align: right; } table.ad th.c { text-align: center; }
table.ad td { border-bottom: 1px solid var(--line); border-right: 1.5px solid var(--a); padding: 3px 6px; vertical-align: top; height: 6.4mm; }
table.ad td:last-child { border-right: 0; }
table.ad td.adt { width: 12mm; text-align: center; font-size: 13px; }
table.ad td.cn .kad { font-size: 12px; }
table.ad td.cn .kd { float: right; font-size: 7.5px; color: var(--soft); font-family: Consolas, monospace; margin-top: 3px; }
table.ad td.fy { width: 24mm; text-align: right; white-space: nowrap; font-size: 11px; }
table.ad td.tt { width: 27mm; text-align: right; white-space: nowrap; font-size: 12px; }
.alt { display: flex; gap: 6mm; margin-top: 3mm; position: relative; }
.alt .sol { flex: 1; font-size: 8.4px; }
.alt .sol .k { font-size: 7px; letter-spacing: 1.5px; color: var(--a); font-weight: 700; text-transform: uppercase; margin-top: 4px; }
.alt .tpl { width: 64mm; border: 1.5px solid var(--a); align-self: flex-start; }
.alt .tpl table.oz { margin: 4px 0; } .alt .tpl table.oz td { padding: 1.5px 8px; }
.alt .tpl .big { display: flex; justify-content: space-between; align-items: baseline; background: var(--a); color: var(--on); padding: 5px 8px; font-weight: 800; letter-spacing: 1px; }
.alt .tpl .big b { font-size: 17px; font-weight: 400; color: #ffffff; }
.alt .tpl .yzy { padding: 4px 8px; }
.muhur { position: absolute; right: 70mm; top: 6mm; width: 27mm; height: 27mm; border-radius: 50%; border: 2.5px double #c81e1e; color: #c81e1e; transform: rotate(-14deg); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: .82; font-size: 7px; text-align: center; line-height: 1.2; }
.muhur b { font-size: 13px; letter-spacing: 2px; }
.dip { border-top: 1.5px solid var(--a); margin-top: 4mm; padding-top: 3mm; }
.nus { text-align: center; font-size: 7px; letter-spacing: 3px; color: var(--soft); margin-top: 3mm; text-transform: uppercase; }`,
        body: `
<div class="sayfa"><div class="pad"><div class="tp"></div><div class="ic">
<div class="bas">${K.logo(50)}<div><div class="ad">${supName}</div><div class="slg">${tagline(S)}</div></div>
    <div class="sr"><small>${t('ADİSYON')}</small><b>${t('№ ')}${id('ADISYON')}</b></div></div>
<div class="kutu">
    <div><small>${t('Masa')}</small><b class="hf el">${id('MASA')}${opt('MASA', `${t(' · ')}${ds('MASA')}`)}</b></div>
    <div><small>${t('Garson')}</small><b class="hf el">${id('GARSON')}</b></div>
    <div><small>${t('Kişi')}</small><b class="hf el">${id('KISI')}</b></div>
    <div><small>${t('Tarih / Saat')}</small><b class="hf el">${docDate}${t(' ')}${docTime}</b></div>
</div>
<table class="ad"><thead><tr><th class="c">${t('ADET')}</th><th>${t('CİNSİ')}</th><th class="r">${t('FİYATI')}</th><th class="r">${t('TUTARI')}</th></tr></thead><tbody>
${each(LINES, `<tr><td class="adt hf el">${X.adet}</td><td class="cn"><span class="kd">${X.kdv}</span><div class="kad hf el">${X.ad}</div>${X.not('mut el')}${X.isk()}</td><td class="fy hf el">${X.fiyat}</td><td class="tt hf el">${X.tutar}</td></tr>`)}
<tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr>
</tbody></table>
<div class="alt">
    <div class="sol"><div class="k">${t('Müşteri')}</div>${musteri}<div class="k">${t('Ödeme')}</div>${payNote}</div>
    <div class="muhur"><span>${docDate}</span><b>${t('ÖDENDİ')}</b><span>${t('Teşekkürler')}</span></div>
    <div class="tpl">${ozetTablo()}<div class="big"><span>${t('TOPLAM')}</span><b class="hf">${payable}</b></div><div class="yzy">${yaziyla}</div></div>
</div>
<div class="dip"><div style="font-size:8.4px;margin-bottom:3mm">${satici}</div>${resmi(78)}</div>
<div class="nus">${t(S.footer ?? 'Asıl · Müşteri nüshası')}</div>
</div></div></div>`,
    })),

    /* ------------------------------------------------------------ 2. Üçüncü dalga kahve: kraft fiş, sipariş numarası, sadakat kartı */
    'ad-kahve': L((S, K) => ({
        css: `
.sayfa { background: #2b1d14; background-image: radial-gradient(circle at 20% 12%, rgba(255,255,255,.06), transparent 45%); padding: 7mm 0; }
.fis { width: 128mm; margin: 0 auto; padding: 7mm 9mm 7mm; position: relative; color: #3b2516; background-color: #e9d5b2; background-image: radial-gradient(rgba(110,70,30,.16) .8px, transparent 1.1px), radial-gradient(rgba(110,70,30,.1) .8px, transparent 1.1px); background-size: 7px 7px, 11px 11px; background-position: 0 0, 3px 5px; box-shadow: 0 3px 12px rgba(0,0,0,.45); font-family: Consolas, 'Courier New', monospace; font-size: 9.4px; }
.leke { position: absolute; right: -10mm; bottom: 8mm; width: 36mm; height: 36mm; border-radius: 50%; background: radial-gradient(circle, transparent 57%, rgba(120,72,30,.26) 60%, rgba(120,72,30,.1) 64%, transparent 69%); }
.bas { text-align: center; }
.bas .ad { font-family: 'Century Gothic', Futura, sans-serif; font-size: 17px; letter-spacing: 4px; text-transform: uppercase; font-weight: 700; margin-top: 3px; }
.bas .slg { font-size: 8.2px; letter-spacing: 2px; color: var(--a); text-transform: uppercase; }
.cz { border-top: 1.5px dashed rgba(59,37,22,.55); margin: 3mm 0; }
.sira { display: flex; align-items: center; gap: 6mm; }
.sira .no { width: 26mm; height: 26mm; border-radius: 50%; border: 3px solid var(--a); display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; transform: rotate(-6deg); }
.sira .no small { font-size: 7px; letter-spacing: 2px; }
.sira .no b { font-size: 31px; line-height: 1; color: var(--a); font-family: 'Century Gothic', sans-serif; }
.sira table { border-collapse: collapse; flex: 1; } .sira td { padding: 1.5px 0; } .sira td.v { text-align: right; font-weight: 700; }
.pil { display: inline-block; background: var(--a); color: #fff8ec; border-radius: 9px; padding: 1px 9px; letter-spacing: 1.5px; font-size: 8.4px; }
.kl { display: grid; grid-template-columns: 9mm 1fr auto; gap: 0 3mm; padding: 1.7mm 0; border-bottom: 1px dotted rgba(59,37,22,.45); }
.kl .boy { width: 8mm; height: 8mm; border-radius: 50%; background: #3b2516; color: #f3e3c4; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 10px; }
.kl .kad { font-weight: 700; font-size: 10px; }
.kl .cp { display: inline-block; border: 1px dashed rgba(59,37,22,.6); border-radius: 8px; padding: 0 6px; margin: 2px 4px 0 0; font-size: 7.9px; }
.kl .pr { text-align: right; white-space: nowrap; }
.kl .pr b { display: block; font-size: 10.5px; }
.kl .pr small { color: rgba(59,37,22,.7); font-size: 7.8px; }
.ack { color: rgba(59,37,22,.75); }
.tot { display: flex; justify-content: space-between; align-items: baseline; font-size: 17px; font-weight: 700; margin-top: 2mm; }
.kart { border: 1.5px dashed #3b2516; border-radius: 5px; padding: 6px 9px; margin-top: 4mm; }
.kart .bs { display: flex; justify-content: space-between; font-weight: 700; letter-spacing: 1px; font-size: 8.4px; text-transform: uppercase; }
.kart .dm { display: flex; gap: 4px; margin: 5px 0 3px; }
.kart .dm span { flex: 1; height: 7.5mm; border-radius: 50%; border: 1.5px solid #3b2516; display: flex; align-items: center; justify-content: center; font-size: 7.5px; color: rgba(59,37,22,.55); }
.kart .dm span.d { background: #3b2516; color: #f3e3c4; }
.kart .dm span:last-child { border-style: dashed; }
.alt { font-size: 8.3px; }
.iki { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; font-size: 8px; }
.resmi { margin-top: 3mm; }
.son { text-align: center; margin-top: 3mm; letter-spacing: 3px; font-weight: 700; font-size: 8.6px; }`,
        body: `
<div class="sayfa"><div class="fis"><div class="leke"></div>
<div class="bas">${K.logo(46)}<div class="ad">${supName}</div><div class="slg">${tagline(S)}</div></div>
<div class="cz"></div>
<div class="sira"><div class="no"><small>${t('SİPARİŞ')}</small><b>${t('#')}${id('SIPARIS')}</b></div>
<table>
    <tr><td>${t('Servis')}</td><td class="v"><span class="pil">${id('SERVIS')}</span></td></tr>
    <tr><td>${t('Barista')}</td><td class="v">${id('GARSON')}</td></tr>
    <tr><td>${t('Tarih')}</td><td class="v">${docDate}${t(' ')}${docTime}</td></tr>
    <tr><td>${t('Adisyon')}</td><td class="v">${id('ADISYON')}</td></tr>
</table></div>
<div class="cz"></div>
${each(LINES, `<div class="kl"><div class="boy">${choose([P('BOY'), X.p('BOY')], [null, t('•')])}</div><div><div class="kad">${X.ad}</div>${X.ack()}<div>${X.cips('cp', ['BOY'])}</div>${X.not('mut', '✎ ')}${X.isk()}</div><div class="pr"><b>${X.tutar}</b><small>${X.hesap}</small></div></div>`)}
<div style="margin-top:3mm">${ozetTablo()}</div>
<div class="tot"><span>${t('TOPLAM')}</span><span>${payable}</span></div>
<div class="yzy">${yaziyla}</div>
<div class="alt">${t('Ödeme: ')}${payNote}</div>
${opt('SADAKAT', `<div class="kart"><div class="bs"><span>${t('Sadakat kartı')}</span><span>${id('SADAKAT')}${t(' / 10')}</span></div><div class="dm">${damgalar(10, (i) => (i === 10 ? '★' : String(i)))}</div><div class="ack">${ds('SADAKAT')}</div></div>`)}
<div class="cz"></div>
<div class="iki"><div>${satici}</div><div>${musteri}</div></div>
${resmi(76)}
<div class="son">${t(S.footer ?? 'İYİ KAHVELER')}</div>
</div></div>`,
    })),

    /* ------------------------------------------------------------ 3. Pastane: dantel tabak, pasta yazısı kartı, teslim saati */
    'ad-pastane': L((S, K) => ({
        css: `
.sayfa { background-color: #fdf2f8; background-image: radial-gradient(#fbcfe8 1.2px, transparent 1.5px); background-size: 14px 14px; padding: 23mm 13mm 6mm; }
.kart { background: #ffffff; border-radius: 5mm; position: relative; padding: 0 11mm 6mm; box-shadow: 0 2px 10px rgba(190,24,93,.12); }
.kart:before, .kart:after { content: ''; position: absolute; top: 14mm; bottom: 14mm; width: 3mm; background-size: 3mm 4.4mm; background-repeat: repeat-y; }
.kart:before { left: 0; background-image: radial-gradient(circle at 0 50%, #fdf2f8 1.5mm, transparent 1.6mm); }
.kart:after { right: 0; background-image: radial-gradient(circle at 100% 50%, #fdf2f8 1.5mm, transparent 1.6mm); }
.dantel { width: 58mm; height: 58mm; margin: 0 auto -17mm; top: -20mm; border-radius: 50%; background: radial-gradient(circle, #ffffff 60%, transparent 61%), repeating-conic-gradient(#ffffff 0 5deg, #fbcfe8 5deg 10deg); position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.dantel:after { content: ''; position: absolute; inset: 7mm; border-radius: 50%; border: 2px dotted var(--a); }
.dantel .ad { font-size: 15px; font-style: italic; color: var(--a); line-height: 1.1; padding: 0 10mm; margin-top: 2px; }
.dantel .slg { font-size: 6.4px; letter-spacing: 1.2px; padding: 0 12mm; margin-top: 2px; text-transform: uppercase; color: var(--soft); }
.ser { display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 2.5mm 0; }
.ser div + div { border-left: 1px solid var(--line); }
.ser small { display: block; font-size: 7px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--soft); }
.ser b { font-size: 11px; color: var(--ink); }
.yazi { margin: 3mm auto 0; border: 1.5px dashed var(--a); border-radius: 4mm; padding: 2mm 6mm; text-align: center; background: var(--t); width: 120mm; }
.yazi small { font-size: 7.2px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); font-weight: 700; }
.yazi b { display: block; font-size: 21px; font-style: italic; font-weight: 400; color: var(--b); margin: 1px 0; }
.gb { text-align: center; margin: 3mm 0 1mm; }
.gb span { display: inline-block; background: var(--a); color: #ffffff; font-size: 7.8px; letter-spacing: 2.5px; text-transform: uppercase; padding: 2px 14px; border-radius: 9px; }
.kl { padding: 1.3mm 0; border-bottom: 1px dashed #f3d1e1; }
.kl .s1 { display: flex; align-items: baseline; gap: 6px; }
.kl .s1 .kad { font-size: 11.5px; font-style: italic; }
.kl .s1 i { flex: 1; border-bottom: 1.5px dotted #e7a6c4; transform: translateY(-3px); }
.kl .s1 b { font-size: 11px; white-space: nowrap; }
.kl .s2 { font-size: 8.3px; color: var(--soft); }
.cp { display: inline-block; background: var(--t); color: var(--b); border-radius: 7px; padding: 0 6px; margin-left: 4px; font-size: 7.8px; }
.alt { display: grid; grid-template-columns: 1fr 70mm; gap: 8mm; margin-top: 4mm; }
.alt .k { font-size: 7.2px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--a); font-weight: 700; margin-bottom: 2px; }
.alt .ib { font-size: 8.4px; margin-bottom: 3mm; }
.tkt { background: var(--t); border-radius: 4mm; padding: 4mm 5mm; }
.tkt .big { display: flex; justify-content: space-between; align-items: baseline; border-top: 2px solid var(--a); margin-top: 3px; padding-top: 4px; }
.tkt .big span { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); font-weight: 700; }
.tkt .big b { font-size: 19px; color: var(--b); }
.resmi { margin-top: 3mm; border-top: 1px solid var(--line); padding-top: 3mm; }`,
        body: `
<div class="sayfa"><div class="kart">
<div class="dantel">${K.logo(36)}<div class="ad hf">${supName}</div><div class="slg">${tagline(S)}</div></div>
<div class="ser">
    <div><small>${t('Sipariş')}</small><b>${id('SIPARIS')}</b></div>
    <div><small>${t('Teslim')}</small><b>${id('TESLIM')}</b><br/><span class="ack">${ds('TESLIM')}</span></div>
    <div><small>${t('Hazırlayan')}</small><b>${id('GARSON')}</b></div>
    <div><small>${t('Tarih')}</small><b>${docDate}</b><br/><span class="ack">${docTime}</span></div>
</div>
${opt('PASTAYAZI', `<div class="yazi"><small>${t('Pasta üzerine yazı')}</small><b class="hf">${id('PASTAYAZI')}</b><span class="ack">${ds('PASTAYAZI')}</span></div>`)}
${each(LINES, `${X.grup((g) => `<div class="gb"><span>${g}</span></div>`)}<div class="kl"><div class="s1"><span class="kad hf">${X.ad}</span>${X.cips()}<i></i><b>${X.tutar}</b></div><div class="s2">${X.hesap}${t(' · KDV ')}${X.kdv}</div>${X.ack()}${X.not()}${X.isk()}</div>`)}
<div class="alt">
    <div><div class="k">${t('Müşteri')}</div><div class="ib">${musteri}</div><div class="k">${t('Pastane')}</div><div class="ib">${satici}</div></div>
    <div class="tkt">${ozetTablo()}<div class="big"><span>${t('Toplam')}</span><b class="hf">${payable}</b></div><div class="yzy">${yaziyla}</div><div class="ack" style="margin-top:3px">${t('Ödeme: ')}${payNote}</div></div>
</div>
${resmi(80)}
</div></div>`,
    })),

    /* ------------------------------------------------------------ 4. Ocakbaşı: ızgara başlık, köz parıltısı, iki sütun grup listesi */
    'ad-ocakbasi': L((S, K) => ({
        css: `
.sayfa { background: #f5efe6; }
.izg { background: #1c1917; color: #ffffff; padding: 9mm 12mm 13mm; position: relative; overflow: hidden; }
.izg:before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 2.5mm, transparent 2.5mm 9mm); }
.izg:after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 16mm; background: radial-gradient(ellipse at 50% 130%, rgba(249,115,22,.95), rgba(220,38,38,.4) 45%, transparent 72%); }
.izg .ic { position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; }
.izg .ad { font-family: Impact, 'Arial Black', sans-serif; font-size: 29px; letter-spacing: 1.5px; text-transform: uppercase; color: #fdba74; line-height: 1; }
.izg .slg { font-size: 8.6px; letter-spacing: 3px; text-transform: uppercase; color: #d6d3d1; margin-top: 4px; }
.izg .masa { margin-left: auto; border: 2px solid #f97316; border-radius: 3mm; padding: 2mm 5mm; text-align: center; background: rgba(0,0,0,.55); }
.izg .masa small { display: block; font-size: 7px; letter-spacing: 3px; color: #fdba74; }
.izg .masa b { font-family: Impact, sans-serif; font-size: 30px; line-height: 1; letter-spacing: 1px; }
.izg .masa span { display: block; font-size: 7.6px; color: #d6d3d1; }
.serit { display: grid; grid-template-columns: repeat(4, 1fr); background: var(--a); color: #ffffff; }
.serit div { padding: 2.4mm 12mm 2.4mm 5mm; border-right: 1px solid rgba(255,255,255,.3); }
.serit div:first-child { padding-left: 12mm; }
.serit div:last-child { border-right: 0; }
.serit small { display: block; font-size: 6.8px; letter-spacing: 2px; text-transform: uppercase; opacity: .85; }
.serit b { font-size: 10.5px; }
.gv { padding: 6mm 12mm 0; }
.st { column-count: 2; column-gap: 9mm; column-rule: 1px dashed #d6c7b2; }
.gb { break-inside: avoid; font-family: Impact, 'Arial Black', sans-serif; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #1c1917; border-bottom: 2.5px solid #1c1917; margin: 0 0 2mm; padding-top: 1mm; }
.gb:before { content: ''; display: inline-block; width: 7px; height: 7px; background: var(--a); transform: rotate(45deg); margin-right: 7px; vertical-align: 2px; }
.kl { break-inside: avoid; display: flex; gap: 7px; padding: 1.6mm 0 2.4mm; }
.kl .ad2 { min-width: 7.5mm; height: 7.5mm; border-radius: 50%; background: #1c1917; color: #fdba74; font-weight: 800; font-size: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kl .md { flex: 1; min-width: 0; }
.kl .md .kad { font-weight: 700; font-size: 10.2px; }
.kl .tt { text-align: right; white-space: nowrap; }
.kl .tt b { display: block; font-size: 10.5px; }
.kl .tt small { font-size: 7.6px; color: var(--soft); }
.mut { color: #c2410c; }
.toplam { margin: 5mm 12mm 0; background: #1c1917; color: #ffffff; border-radius: 3mm; display: grid; grid-template-columns: 1fr 70mm; overflow: hidden; }
.toplam .sl { padding: 4mm 5mm; font-size: 8.5px; color: #e7e5e4; }
.toplam .sl table.oz { color: #e7e5e4; }
.toplam .sg { padding: 4mm 5mm; text-align: right; background: radial-gradient(ellipse at 50% 140%, rgba(249,115,22,.9), rgba(220,38,38,.45) 50%, #292524 80%); display: flex; flex-direction: column; justify-content: center; }
.toplam .sg small { font-size: 7.6px; letter-spacing: 3px; color: #fed7aa; }
.toplam .sg b { font-family: Impact, sans-serif; font-size: 27px; letter-spacing: 1px; font-weight: 400; color: #ffffff; }
.toplam .sg span { font-size: 8.4px; color: #ffedd5; }
.bilgi { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; padding: 5mm 12mm 0; font-size: 8.4px; }
.bilgi .k { font-family: Impact, sans-serif; letter-spacing: 2px; font-size: 9px; color: var(--a); margin-bottom: 2px; }
.dp { padding: 4mm 12mm 8mm; }`,
        body: `
<div class="sayfa">
<div class="izg"><div class="ic">${K.logo(60)}<div><div class="ad">${supName}</div><div class="slg">${tagline(S)}</div></div>
    <div class="masa"><small>${t('MASA')}</small><b>${id('MASA')}</b><span>${ds('MASA')}</span></div></div></div>
<div class="serit">
    <div><small>${t('Adisyon')}</small><b>${id('ADISYON')}</b></div>
    <div><small>${t('Garson')}</small><b>${id('GARSON')}</b></div>
    <div><small>${t('Kişi')}</small><b>${id('KISI')}${t(' kişi')}</b></div>
    <div><small>${t('Tarih / Saat')}</small><b>${docDate}${t(' ')}${docTime}</b></div>
</div>
<div class="gv"><div class="st">
${each(LINES, `${X.grup((g) => `<div class="gb">${g}</div>`)}<div class="kl"><div class="ad2">${X.adet}${t('×')}</div><div class="md"><div class="kad">${X.ad}</div>${X.ack()}${X.not('mut', '• ')}${X.isk()}</div><div class="tt"><b>${X.tutar}</b><small>${X.fiyat}${t(' · ')}${X.kdv}</small></div></div>`)}
</div></div>
<div class="toplam"><div class="sl">${ozetTablo()}<div class="yzy" style="margin-top:3px">${yaziyla}</div></div>
    <div class="sg"><small>${t('TOPLAM')}</small><b>${payable}</b><span>${t('Kişi başı ')}${kisiBasi}</span><span>${payNote}</span></div></div>
<div class="bilgi"><div><div class="k">${t('MÜŞTERİ')}</div>${musteri}</div><div><div class="k">${t('İŞLETME')}</div>${satici}</div></div>
<div class="dp">${resmi(78)}</div>
</div>`,
    })),

    /* ------------------------------------------------------------ 5. Balık lokantası: lacivert dalga, halat ayraç, masa kartı */
    'ad-balik': L((S, K) => ({
        css: `
.sayfa { background: #f4f1ea; }
.ust { background: #0b2545; color: #ffffff; padding: 8mm 12mm 5mm; text-align: center; }
.ust .ad { font-size: 25px; letter-spacing: 4px; text-transform: uppercase; margin-top: 3px; }
.ust .slg { font-style: italic; color: #d4b483; font-size: 10px; }
.dalga { height: 7mm; background: radial-gradient(circle at 5mm -1mm, #0b2545 5mm, transparent 5.3mm) 0 0 / 10mm 7mm repeat-x, radial-gradient(circle at 10mm 0, #13315c 5.5mm, transparent 5.8mm) 0 0 / 10mm 7mm repeat-x; }
.halat { height: 2.6mm; margin: 3mm 12mm; border-radius: 2mm; background: repeating-linear-gradient(60deg, #c8a96a 0 1.5mm, #8b6b3d 1.5mm 3mm); }
.gv { display: grid; grid-template-columns: 1fr 63mm; gap: 8mm; padding: 0 12mm; }
.gb { font-variant: small-caps; letter-spacing: 2px; font-size: 11.5px; color: #13315c; border-bottom: 1px solid #c8a96a; margin: 3mm 0 1mm; padding-bottom: 1px; }
.kl { padding: 1.6mm 0; border-bottom: 1px dotted #cbbf9f; }
.kl .s1 { display: flex; justify-content: space-between; gap: 8px; }
.kl .s1 .kad { font-size: 11px; }
.kl .s1 b { white-space: nowrap; font-size: 10.5px; }
.kl .s2 { font-size: 8.2px; color: var(--soft); }
.mut { color: #0e7490; }
.masa { border: 2px solid #0b2545; border-radius: 3mm; text-align: center; padding: 3mm; background: #ffffff; position: relative; }
.masa:before { content: ''; position: absolute; inset: 1.2mm; border: 1px dashed #c8a96a; border-radius: 2mm; }
.masa small { display: block; font-size: 7px; letter-spacing: 3px; text-transform: uppercase; color: var(--soft); }
.masa b { display: block; font-size: 34px; color: #0b2545; line-height: 1.05; }
.masa i { color: #8b6b3d; }
.masa table { width: 100%; border-collapse: collapse; margin-top: 2mm; font-size: 8.4px; text-align: left; }
.masa td { padding: 1.5px 0; border-top: 1px solid #ede6d6; } .masa td.v { text-align: right; font-weight: 700; }
.kdvk { margin-top: 4mm; font-size: 8.3px; }
.kdvk h4 { margin: 0 0 2px; font-variant: small-caps; letter-spacing: 2px; font-size: 10px; color: #13315c; font-weight: 400; }
.kdvk table { width: 100%; border-collapse: collapse; } .kdvk th { text-align: left; font-weight: 400; color: var(--soft); font-size: 7.3px; border-bottom: 1px solid #c8a96a; }
.kdvk td { padding: 1.5px 0; } .kdvk .r { text-align: right; }
.tp { margin-top: 4mm; background: #0b2545; color: #ffffff; border-radius: 3mm; padding: 4mm; text-align: center; }
.tp small { display: block; letter-spacing: 3px; font-size: 7.2px; color: #d4b483; }
.tp b { display: block; font-size: 22px; color: #f1dcae; font-weight: 400; }
.tp span { font-size: 8.3px; }
.bilgi { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; padding: 0 12mm; font-size: 8.3px; }
.bilgi .k { font-variant: small-caps; letter-spacing: 2px; color: #13315c; font-size: 10px; }
.dp { padding: 4mm 12mm 8mm; }`,
        body: `
<div class="sayfa">
<div class="ust">${K.logo(50)}<div class="ad">${supName}</div><div class="slg">${tagline(S)}</div></div>
<div class="dalga"></div>
<div class="gv">
    <div>${each(LINES, `${X.grup((g) => `<div class="gb">${g}</div>`)}<div class="kl"><div class="s1"><span class="kad">${X.ad}</span><b>${X.tutar}</b></div><div class="s2">${X.hesap}${t(' · KDV ')}${X.kdv}</div>${X.ack()}${X.not('mut', '~ ')}${X.isk()}</div>`)}</div>
    <div>
        <div class="masa"><small>${t('Masa')}</small><b>${id('MASA')}</b><i>${ds('MASA')}</i>
            <table><tr><td>${t('Adisyon')}</td><td class="v">${id('ADISYON')}</td></tr><tr><td>${t('Garson')}</td><td class="v">${id('GARSON')}</td></tr><tr><td>${t('Kişi')}</td><td class="v">${id('KISI')}</td></tr><tr><td>${t('Tarih')}</td><td class="v">${docDate}${t(' ')}${docTime}</td></tr></table></div>
        <div class="kdvk"><h4>${t('KDV dökümü')}</h4><table><tr><th>${t('Oran')}</th><th>${t('Kapsam')}</th><th class="r">${t('Matrah')}</th><th class="r">${t('KDV')}</th></tr>
            ${each('$f/cac:TaxTotal/cac:TaxSubtotal', `<tr><td>${t('%')}${v('cbc:Percent')}</td><td>${choose(["cbc:Percent='20'", t('Alkollü içecek')], ["cbc:Percent='10'", t('Yemek, alkolsüz içecek')], [null, t('Diğer')])}</td><td class="r">${num('cbc:TaxableAmount')}</td><td class="r">${num('cbc:TaxAmount')}</td></tr>`)}
            ${iff(`${LMT}/cbc:AllowanceTotalAmount &gt; 0`, `<tr><td colspan="3" class="isk">${t('İkram / indirim (KDV hariç)')}</td><td class="r isk">${t('−')}${num(`${LMT}/cbc:AllowanceTotalAmount`)}</td></tr>`)}
        </table></div>
        <div class="tp"><small>${t('TOPLAM')}</small><b>${payable}</b><span>${t('Kişi başı ')}${kisiBasi}</span><br/><span>${payNote}</span></div>
        <div class="yzy" style="margin-top:2mm;text-align:center">${yaziyla}</div>
    </div>
</div>
<div class="halat"></div>
<div class="bilgi"><div><div class="k">${t('Misafirimiz')}</div>${musteri}</div><div><div class="k">${t('Lokanta')}</div>${satici}</div></div>
<div class="dp">${resmi(78)}</div>
</div>`,
    })),

    /* ------------------------------------------------------------ 6. Paket servis: pizza kutusu, damalı bant, teslimat akışı */
    'ad-paket': L((S, K) => ({
        css: `
.sayfa { background-color: #c9a57d; background-image: repeating-linear-gradient(90deg, rgba(0,0,0,.05) 0 1px, transparent 1px 4px); padding: 10mm 12mm; }
.kutu { background: #ffffff; border-radius: 3mm; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,.25); }
.dama { height: 9mm; background: conic-gradient(var(--a) 25%, #ffffff 0 50%, var(--a) 0 75%, #ffffff 0) 0 0 / 9mm 9mm; }
.bas { display: flex; align-items: center; gap: 12px; padding: 5mm 9mm 4mm; position: relative; }
.bas .ad { font-family: Impact, 'Arial Black', sans-serif; font-size: 27px; color: var(--a); text-transform: uppercase; letter-spacing: 1px; line-height: 1; }
.bas .slg { font-size: 8.5px; letter-spacing: 2px; text-transform: uppercase; color: var(--soft); margin-top: 3px; }
.bas .dmg { margin-left: auto; border: 2.5px dashed var(--a); color: var(--a); padding: 2mm 4mm; transform: rotate(5deg); text-align: center; font-weight: 800; letter-spacing: 2px; }
.bas .dmg small { display: block; font-size: 7px; letter-spacing: 1px; font-weight: 600; }
.bant { background: #1f2937; color: #ffffff; display: flex; align-items: center; justify-content: space-between; padding: 3mm 9mm; }
.bant .no { font-family: Consolas, monospace; font-size: 22px; font-weight: 700; letter-spacing: 2px; }
.bant .no small { font-size: 9px; letter-spacing: 3px; color: #fca5a5; margin-right: 6px; }
.bant span { font-size: 9px; }
.tes { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; padding: 4mm 9mm; }
.adres { border: 1.5px solid #1f2937; border-radius: 2.5mm; padding: 3mm 4mm 3mm 13mm; position: relative; font-size: 9px; align-self: start; }
.adres:before { content: ''; position: absolute; left: 4mm; top: 3.5mm; width: 5mm; height: 5mm; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: var(--a); }
.adres:after { content: ''; position: absolute; left: 5.6mm; top: 5.1mm; width: 1.8mm; height: 1.8mm; border-radius: 50%; background: #ffffff; }
.sat { border: 1.5px dashed #1f2937; border-radius: 2.5mm; padding: 3mm 4mm; }
.adres .k, .akis .k, .sat .k { font-size: 7px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); font-weight: 800; }
.adres b { font-size: 10.5px; }
.akis { position: relative; padding-left: 4mm; }
.akis .ad3 { position: relative; padding: 0 0 2.6mm 6mm; font-size: 8.8px; }
.akis .ad3:before { content: ''; position: absolute; left: -1.2mm; top: 1mm; width: 2.6mm; height: 2.6mm; border-radius: 50%; background: var(--a); }
.akis .ad3:after { content: ''; position: absolute; left: 0; top: 3.6mm; bottom: -1mm; border-left: 2px dotted var(--a); }
.akis .ad3:last-child:after { display: none; }
.akis .ad3 b { display: block; font-size: 10px; }
table.kl { width: calc(100% - 18mm); margin: 0 9mm; border-collapse: collapse; }
table.kl th { font-size: 7.3px; letter-spacing: 1.5px; text-transform: uppercase; text-align: left; border-bottom: 2px solid #1f2937; padding: 3px 4px; }
table.kl th.r { text-align: right; }
table.kl td { border-bottom: 1px dashed #d1d5db; padding: 2.2mm 4px; vertical-align: top; }
table.kl td.ck { width: 6mm; } table.kl td.ck i { display: block; width: 3.6mm; height: 3.6mm; border: 1.5px solid #1f2937; border-radius: 1mm; text-align: center; font-style: normal; font-size: 9px; line-height: 3.4mm; font-weight: 800; color: var(--a); }
table.kl td.ad4 { width: 13mm; font-weight: 800; font-size: 11px; }
table.kl .kad { font-weight: 700; font-size: 10.3px; }
table.kl td.r { white-space: nowrap; }
.alt { display: grid; grid-template-columns: 1fr 72mm; gap: 7mm; padding: 4mm 9mm 0; }
.kapi { border: 2.5px solid var(--a); border-radius: 3mm; padding: 3mm 4mm; text-align: center; margin-bottom: 3mm; }
.kapi small { display: block; font-size: 7px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); font-weight: 800; }
.kapi b { font-size: 21px; }
.ib { font-size: 8.3px; }
.dp { padding: 4mm 9mm 6mm; }`,
        body: `
<div class="sayfa"><div class="kutu"><div class="dama"></div>
<div class="bas">${K.logo(58)}<div><div class="ad">${supName}</div><div class="slg">${tagline(S)}</div></div>
    <div class="dmg">${t('PAKET SERVİS')}<small>${t('Sıcak teslim')}</small></div></div>
<div class="bant"><div class="no"><small>${t('SİPARİŞ')}</small>${t('#')}${id('SIPARIS')}</div><span>${t('Kanal: ')}<b>${id('KANAL')}</b>${t(' · ')}${ds('KANAL')}</span></div>
<div class="tes">
    <div class="adres"><div class="k">${t('Teslimat adresi')}</div><b>${cusName}</b><br/>
        ${each('$f/cac:Delivery/cac:DeliveryAddress', `${v('cbc:StreetName')}${t(' No: ')}${v('cbc:BuildingNumber')}<br/>${v('cbc:CitySubdivisionName')}${t(' / ')}${v('cbc:CityName')}`)}
        ${iff('$f/cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telephone', `<br/>${t('Tel: ')}${v('$f/cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telephone')}`)}
        ${opt('ADRESNOT', `<div class="mut" style="margin-top:2px">${t('Not: ')}${id('ADRESNOT')}</div>`)}</div>
    <div class="akis"><div class="k" style="margin-bottom:2mm">${t('Teslimat akışı')}</div>
        <div class="ad3">${t('Sipariş alındı')}<b>${docTime}</b></div>
        <div class="ad3">${t('Fırından çıktı · kuryeye verildi')}<b>${v('substring($f/cac:Delivery/cac:Despatch/cbc:ActualDespatchTime,1,5)')}</b></div>
        <div class="ad3">${t('Kurye')}<b>${id('KURYE')}</b><span class="ack">${ds('KURYE')}</span></div>
        <div class="ad3">${t('Tahmini teslim')}<b>${id('TESLIM')}</b></div></div>
</div>
<table class="kl"><thead><tr><th></th><th>${t('Adet')}</th><th>${t('Ürün')}</th><th class="r">${t('Birim')}</th><th class="r">${t('KDV')}</th><th class="r">${t('Tutar')}</th></tr></thead><tbody>
${each(LINES, `<tr><td class="ck"><i>${t('✓')}</i></td><td class="ad4">${X.adet}${t(' ×')}</td><td><div class="kad">${X.ad}</div>${X.ack()}${X.not()}${X.isk()}</td><td class="r">${X.fiyat}</td><td class="r">${X.kdv}</td><td class="r"><b>${X.tutar}</b></td></tr>`)}
</tbody></table>
<div class="alt">
    <div class="ib"><div class="sat"><div class="k">${t('Satıcı')}</div>${satici}</div><div class="yzy" style="margin-top:3mm">${yaziyla}</div></div>
    <div><div class="kapi"><small>${t('Kapıda ödenecek')}</small><b>${payable}</b><br/><span class="ack">${payNote}</span></div>${ozetTablo()}</div>
</div>
<div class="dp">${resmi(78)}</div>
<div class="dama" style="height:5mm;background-size:5mm 5mm"></div>
</div></div>`,
    })),

    /* ------------------------------------------------------------ 7. Kiosk / food court: LED sipariş ekranı, çağrı cihazı, menü kartları */
    'ad-kiosk': L((S, K) => ({
        css: `
.sayfa { background: #111827; padding: 10mm 13mm; color: #f9fafb; }
.ekran { border: 2px solid #374151; border-radius: 5mm; padding: 5mm 6mm; display: flex; align-items: center; gap: 12px; background: linear-gradient(180deg, #1f2937, #111827); }
.ekran .ad { font-family: 'Trebuchet MS', sans-serif; font-size: 23px; font-weight: 800; color: #fbbf24; line-height: 1; }
.ekran .slg { font-size: 8.5px; letter-spacing: 2px; color: #9ca3af; text-transform: uppercase; margin-top: 3px; }
.led { margin-left: auto; background-color: #000000; background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 3px); border-radius: 3mm; padding: 2mm 6mm; text-align: center; border: 1.5px solid #4b5563; }
.led small { display: block; font-size: 7.2px; letter-spacing: 3px; color: #fca5a5; }
.led b { font-family: Consolas, 'Courier New', monospace; font-size: 42px; color: #fbbf24; letter-spacing: 5px; line-height: 1; text-shadow: 0 0 6px rgba(251,191,36,.75); }
.cagri { display: flex; align-items: center; gap: 5mm; margin: 4mm 0; }
.cagri .cc { width: 18mm; height: 18mm; border-radius: 50%; background: #fbbf24; color: #111827; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 0 2.5mm rgba(251,191,36,.2), 0 0 0 5mm rgba(251,191,36,.08); flex-shrink: 0; margin-left: 3mm; }
.cagri .cc small { font-size: 6px; letter-spacing: 1px; font-weight: 700; }
.cagri .cc b { font-size: 20px; line-height: 1; }
.cagri .tx { flex: 1; font-size: 9px; color: #d1d5db; margin-left: 3mm; }
.cagri .tx b { color: #ffffff; font-size: 11px; }
.mod { display: flex; gap: 2mm; }
.mod span { border: 1.5px solid #4b5563; border-radius: 10mm; padding: 1.5mm 4mm; font-size: 8.5px; font-weight: 700; letter-spacing: 1px; color: #9ca3af; }
.mod span.on { background: #fbbf24; border-color: #fbbf24; color: #111827; }
.kagit { background: #ffffff; color: var(--ink); border-radius: 5mm; padding: 5mm 6mm; }
.mk { display: grid; grid-template-columns: 1fr 1fr; gap: 3.5mm; }
.mc { border: 1.5px solid #e5e7eb; border-radius: 3.5mm; overflow: hidden; display: flex; flex-direction: column; break-inside: avoid; }
.mc .ub { height: 2.2mm; background: var(--a); }
.mc .ic { padding: 2.5mm 3.5mm; flex: 1; display: flex; flex-direction: column; }
.mc .s1 { display: flex; gap: 6px; align-items: flex-start; }
.mc .q { background: #111827; color: #fbbf24; font-weight: 800; border-radius: 1.5mm; padding: 0 5px; font-size: 10px; }
.mc .kad { font-weight: 800; font-size: 10.5px; }
.mc .cp { display: inline-block; background: #fef3c7; color: #92400e; border-radius: 1.5mm; padding: 0 5px; margin: 2px 4px 0 0; font-size: 7.8px; font-weight: 600; }
.mc .s3 { margin-top: auto; padding-top: 2mm; display: flex; justify-content: space-between; align-items: baseline; border-top: 1px dashed #e5e7eb; }
.mc .s3 b { font-size: 12px; }
.alt { display: grid; grid-template-columns: 1fr 72mm; gap: 7mm; margin-top: 4mm; }
.tpl .big { display: flex; justify-content: space-between; align-items: baseline; background: #111827; color: #ffffff; border-radius: 2.5mm; padding: 2.5mm 4mm; margin-top: 2mm; }
.tpl .big b { font-size: 20px; color: #fbbf24; }
.ib { font-size: 8.3px; }
.ib .k { font-size: 7px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); font-weight: 800; margin-top: 2mm; }
.resmi { margin-top: 4mm; border-top: 1px solid #e5e7eb; padding-top: 3mm; }`,
        body: `
<div class="sayfa">
<div class="ekran">${K.logo(56)}<div><div class="ad">${supName}</div><div class="slg">${tagline(S)}</div></div>
    <div class="led"><small>${t('SİPARİŞ NO')}</small><b>${id('SIPARIS')}</b></div></div>
<div class="cagri">${opt('CAGRI', `<div class="cc"><small>${t('ÇAĞRI')}</small><b>${id('CAGRI')}</b></div>`)}
    <div class="tx"><b>${ds('CAGRI')}</b><br/>${t('Kiosk ')}${id('KIOSK')}${t(' · ')}${docDate}${t(' ')}${docTime}${t(' · Adisyon ')}${id('ADISYON')}</div>
    <div class="mod"><span>${attr('class', choose([`${hasRef('SERVIS')}/cbc:ID='Restoranda'`, t('on')], [null, t('')]))}${t('RESTORANDA')}</span><span>${attr('class', choose([`${hasRef('SERVIS')}/cbc:ID='Gel-al'`, t('on')], [null, t('')]))}${t('GEL-AL')}</span></div></div>
<div class="kagit">
<div class="mk">${each(LINES, `<div class="mc"><div class="ub"></div><div class="ic"><div class="s1"><span class="q">${X.adet}${t('×')}</span><div><div class="kad">${X.ad}</div>${X.ack()}</div></div><div>${X.cips()}</div>${X.not()}${X.isk()}<div class="s3"><span class="ack">${X.fiyat}${t(' · KDV ')}${X.kdv}</span><b>${X.tutar}</b></div></div></div>`)}</div>
<div class="alt">
    <div class="ib"><div class="k">${t('Müşteri')}</div>${musteri}<div class="k">${t('İşletme')}</div>${satici}</div>
    <div class="tpl">${ozetTablo()}<div class="big"><span>${t('TOPLAM')}</span><b>${payable}</b></div><div class="ack" style="margin-top:2px">${payNote}</div><div class="yzy">${yaziyla}</div></div>
</div>
${resmi(78)}
</div>
</div>`,
    })),

    /* ------------------------------------------------------------ 8. Serpme kahvaltı: kareli masa örtüsü, tabak başlık, kişi başı */
    'ad-kahvalti': L((S, K) => ({
        css: `
.sayfa { background-color: #ffffff; background-image: linear-gradient(90deg, rgba(220,38,38,.42) 50%, transparent 50%), linear-gradient(rgba(220,38,38,.42) 50%, transparent 50%); background-size: 12mm 12mm; padding: 12mm; }
.kart { background: #fffdf7; border-radius: 6mm; padding: 7mm 10mm; box-shadow: 0 3px 12px rgba(0,0,0,.18); }
.bas { text-align: center; }
.tabak { width: 40mm; height: 40mm; margin: 0 auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #ffffff 0 50%, #f1ebde 51% 56%, #ffffff 57% 66%, #e6dcc6 67% 69%, #ffffff 70%); box-shadow: 0 2px 6px rgba(0,0,0,.15); }
.bas .ad { font-size: 23px; color: var(--a); margin-top: 3mm; line-height: 1.1; }
.bas .slg { font-size: 8.6px; letter-spacing: 3px; text-transform: uppercase; color: var(--soft); }
.rozet { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin: 5mm 0 3mm; }
.rozet div { border: 2px solid var(--a); border-radius: 4mm; text-align: center; padding: 2mm; }
.rozet div.vu { background: var(--a); color: #ffffff; }
.rozet small { display: block; font-size: 7px; letter-spacing: 2px; text-transform: uppercase; opacity: .8; }
.rozet b { font-size: 14px; }
.gb { text-align: center; color: var(--a); font-size: 13px; margin: 4mm 0 1mm; }
.gb:before, .gb:after { content: ''; display: inline-block; width: 18mm; border-top: 1.5px dashed var(--a); vertical-align: 4px; margin: 0 3mm; }
.st { column-count: 2; column-gap: 10mm; }
.kl { break-inside: avoid; padding: 1.6mm 0; }
.kl .s1 { display: flex; align-items: baseline; gap: 5px; }
.kl .s1 .kad { font-size: 10.5px; font-weight: 600; }
.kl .s1 i { flex: 1; border-bottom: 1.5px dotted #d4c4a8; transform: translateY(-3px); }
.kl .s1 b { white-space: nowrap; font-size: 10.5px; }
.kl .s2 { font-size: 8px; color: var(--soft); }
.alt { display: grid; grid-template-columns: 1fr 74mm; gap: 8mm; margin-top: 5mm; border-top: 2px dashed var(--a); padding-top: 4mm; }
.ib { font-size: 8.4px; }
.ib .k { font-size: 7.2px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); font-weight: 700; margin-top: 2mm; }
.big { display: flex; justify-content: space-between; align-items: baseline; background: var(--a); color: #ffffff; border-radius: 10mm; padding: 2mm 5mm; margin-top: 2mm; }
.big b { font-size: 19px; }
.resmi { margin-top: 4mm; }`,
        body: `
<div class="sayfa"><div class="kart">
<div class="bas"><div class="tabak">${K.logo(40)}</div><div class="ad hf">${supName}</div><div class="slg">${tagline(S)}</div></div>
<div class="rozet">
    <div><small>${t('Masa')}</small><b>${id('MASA')}</b><br/><span class="ack">${ds('MASA')}</span></div>
    <div><small>${t('Kişi')}</small><b>${id('KISI')}</b><br/><span class="ack">${t('Garson ')}${id('GARSON')}</span></div>
    <div><small>${t('Adisyon')}</small><b>${id('ADISYON')}</b><br/><span class="ack">${docDate}${t(' ')}${docTime}</span></div>
    <div class="vu"><small>${t('Kişi başı')}</small><b>${kisiBasi}</b><br/><span style="font-size:8px">${t('KDV dahil')}</span></div>
</div>
<div class="st">${each(LINES, `${X.grup((g) => `<div class="gb hf">${g}</div>`)}<div class="kl"><div class="s1"><span class="kad">${X.ad}</span><i></i><b>${X.tutar}</b></div><div class="s2">${X.hesap}${t(' · KDV ')}${X.kdv}</div>${X.ack()}${X.not()}${X.isk()}</div>`)}</div>
<div class="alt">
    <div class="ib"><div class="k">${t('Müşteri')}</div>${musteri}<div class="k">${t('İşletme')}</div>${satici}</div>
    <div>${ozetTablo()}<div class="big"><span>${t('Toplam')}</span><b class="hf">${payable}</b></div><div class="ack" style="margin-top:2px;text-align:center">${payNote}</div><div class="yzy" style="text-align:center">${yaziyla}</div></div>
</div>
${resmi(78)}
</div></div>`,
    })),

    /* ------------------------------------------------------------ 9. Dondurmacı: dondurma topları, külah deseni, top sayısı rozetleri */
    'ad-dondurma': L((S, K) => ({
        css: `
.sayfa { background: #ccfbf1; background-image: radial-gradient(rgba(255,255,255,.7) 2px, transparent 2.5px); background-size: 16px 16px; padding: 8mm 0; }
.kulah { width: 156mm; margin: 0 auto; background: #ffffff; border-radius: 8mm; overflow: hidden; box-shadow: 0 3px 12px rgba(13,148,136,.25); }
.toplar { position: relative; height: 32mm; background: #fff7ed; }
.toplar span { position: absolute; bottom: -5mm; width: 30mm; height: 30mm; border-radius: 50% 50% 44% 44%; box-shadow: inset -2mm -2mm 0 rgba(0,0,0,.06); }
.waf { height: 13mm; background-color: #e3a865; background-image: repeating-linear-gradient(45deg, rgba(120,70,20,.4) 0 1px, transparent 1px 4mm), repeating-linear-gradient(-45deg, rgba(120,70,20,.4) 0 1px, transparent 1px 4mm); position: relative; display: flex; align-items: center; justify-content: center; }
.waf .ad { font-family: 'Trebuchet MS', sans-serif; font-weight: 800; font-size: 21px; color: #ffffff; letter-spacing: 1px; text-shadow: 0 2px 0 rgba(120,70,20,.6); }
.ust { display: flex; align-items: center; gap: 4mm; padding: 4mm 8mm 0; }
.ust .slg { font-size: 8.6px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); font-weight: 700; flex: 1; min-width: 46mm; }
.cips { display: flex; gap: 2mm; flex-wrap: wrap; justify-content: flex-end; }
.cips span { background: var(--t); border-radius: 10mm; padding: 1mm 3.5mm; font-size: 8.4px; }
.cips b { color: var(--a); }
.gv { padding: 3mm 8mm 0; }
.kl { display: flex; align-items: center; gap: 4mm; padding: 2.2mm 0; border-bottom: 1.5px dotted #fbcfe8; }
.kl .top { width: 11mm; height: 11mm; border-radius: 50%; background: radial-gradient(circle at 24% 20%, rgba(255,255,255,.4) 0 .9mm, transparent 1.1mm), var(--a); color: #ffffff; text-shadow: 0 1px 1px rgba(0,0,0,.25); display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; line-height: 1; }
.kl .top b { font-size: 12.5px; } .kl .top small { font-size: 6px; letter-spacing: .5px; font-weight: 700; }
.kl .md { flex: 1; min-width: 0; }
.kl .kad { font-weight: 700; font-size: 10.6px; }
.kl .cp { display: inline-block; border-radius: 10mm; padding: 0 6px; margin: 2px 4px 0 0; font-size: 7.8px; background: #ecfeff; color: #0f766e; border: 1px solid #99f6e4; }
.kl .tt { text-align: right; white-space: nowrap; }
.kl .tt b { display: block; font-size: 11px; }
.kl .tt small { font-size: 7.8px; color: var(--soft); }
.alt { display: grid; grid-template-columns: 1fr 66mm; gap: 7mm; padding: 4mm 8mm 0; }
.ib { font-size: 8.3px; }
.ib .k { font-size: 7px; letter-spacing: 2px; text-transform: uppercase; color: var(--a); font-weight: 800; margin-top: 2mm; }
.big { background: linear-gradient(90deg, var(--a), #f472b6); color: #ffffff; border-radius: 4mm; padding: 2.5mm 4mm; display: flex; justify-content: space-between; align-items: baseline; margin-top: 2mm; }
.big b { font-size: 19px; }
.dp { padding: 4mm 8mm 7mm; }`,
        body: `
<div class="sayfa"><div class="kulah">
<div class="toplar">
    <span style="left:8mm;background:#f9a8d4"></span><span style="left:34mm;background:#99f6e4;bottom:-3mm"></span><span style="left:60mm;background:#7c4a2d"></span>
    <span style="left:86mm;background:#bef264;bottom:-3mm"></span><span style="left:112mm;background:#fef3c7"></span>
</div>
<div class="waf"><div class="ad">${supName}</div></div>
<div class="ust">${K.logo(40)}<div class="slg">${tagline(S)}</div>
    <div class="cips"><span>${t('Sipariş ')}<b>${id('SIPARIS')}</b></span><span>${t('Servis ')}<b>${id('SERVIS')}</b></span><span>${t('Kasa ')}<b>${id('GARSON')}</b></span><span>${docDate}${t(' ')}${docTime}</span></div></div>
<div class="gv">${each(LINES, `<div class="kl"><div class="top">${choose([P('TOP'), `<b>${X.p('TOP')}</b><small>${t('TOP')}</small>`], ["cbc:InvoicedQuantity/@unitCode='KGM'", `<b>${X.adet}</b><small>${t('KG')}</small>`], [null, `<b>${X.adet}</b><small>${t('ADET')}</small>`])}</div><div class="md"><div class="kad">${X.ad}</div>${X.ack()}<div>${X.cips('cp', ['TOP'])}</div>${X.not()}${X.isk()}</div><div class="tt"><b>${X.tutar}</b><small>${X.hesap}${t(' · ')}${X.kdv}</small></div></div>`)}</div>
<div class="alt">
    <div class="ib"><div class="k">${t('Müşteri')}</div>${musteri}<div class="k">${t('İşletme')}</div>${satici}</div>
    <div>${ozetTablo()}<div class="big"><span>${t('Toplam')}</span><b>${payable}</b></div><div class="ack" style="margin-top:2px">${payNote}</div><div class="yzy">${yaziyla}</div></div>
</div>
<div class="dp">${resmi(76)}</div>
</div></div>`,
    })),

    /* ------------------------------------------------------------ 10. Fine dining: siyah-altın tadım menüsü, şarap eşleştirmesi */
    'ad-fine': L((S, K) => ({
        css: `
.sayfa { background: #0c0c0c; color: #e7e2d6; padding: 7mm 11mm; }
.cer { border: 1px solid #b89b5e; outline: 1px solid rgba(184,155,94,.4); outline-offset: 2mm; padding: 6mm 12mm 5mm; }
.bas { text-align: center; }
.bas .ad { font-family: 'Bodoni MT', Didot, 'Times New Roman', serif; font-size: 25px; letter-spacing: 7px; text-transform: uppercase; color: #f3e7c9; margin-top: 3mm; }
.bas .slg { font-style: italic; color: #b89b5e; font-size: 10px; }
.kural { display: flex; align-items: center; gap: 3mm; color: #b89b5e; margin: 3mm 0; font-size: 8px; }
.kural:before, .kural:after { content: ''; flex: 1; height: 1px; background: #b89b5e; }
.meta { display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; font-size: 8.4px; }
.meta small { display: block; font-size: 6.8px; letter-spacing: 3px; text-transform: uppercase; color: #b89b5e; }
.meta b { font-weight: 400; font-size: 11px; color: #f3e7c9; }
.gb { text-align: center; font-size: 8px; letter-spacing: 4px; text-transform: uppercase; color: #b89b5e; margin: 3mm 0 .5mm; }
.kl { text-align: center; padding: 1mm 0; }
.kl .kad { font-size: 11.5px; letter-spacing: 1.5px; text-transform: uppercase; color: #f3e7c9; }
.kl .ack { color: #a8a29e; font-style: italic; font-size: 9px; }
.kl .fy { font-size: 8.4px; color: #b89b5e; margin-top: 1px; }
.mut { color: #d6c08f; }
.isk { color: #86efac; }
.alt { display: grid; grid-template-columns: 1fr 70mm; gap: 9mm; margin-top: 3mm; }
.ib { font-size: 8.4px; color: #d6d3d1; }
.ib .k { font-size: 6.8px; letter-spacing: 3px; text-transform: uppercase; color: #b89b5e; margin-top: 2mm; }
table.oz { color: #d6d3d1; }
.big { border-top: 1px solid #b89b5e; border-bottom: 1px solid #b89b5e; margin-top: 2mm; padding: 2mm 0; display: flex; justify-content: space-between; align-items: baseline; }
.big span { font-size: 7.5px; letter-spacing: 3px; text-transform: uppercase; color: #b89b5e; }
.big b { font-size: 19px; font-weight: 400; color: #f3e7c9; }
.imza { display: flex; justify-content: space-between; margin-top: 4mm; font-size: 8px; color: #a8a29e; }
.imza div { width: 55mm; border-top: 1px solid #57534e; padding-top: 1.5mm; text-align: center; }
.resmi { margin-top: 4mm; color: #d6d3d1; }
.resmi .nl { color: #a8a29e; }`,
        body: `
<div class="sayfa"><div class="cer">
<div class="bas">${K.logo(52)}<div class="ad">${supName}</div><div class="slg">${tagline(S)}</div></div>
<div class="kural">${t('◆')}</div>
<div class="meta">
    <div><small>${t('Masa')}</small><b>${id('MASA')}</b><br/>${ds('MASA')}</div>
    <div><small>${t('Misafir')}</small><b>${id('KISI')}${t(' kişi')}</b></div>
    <div><small>${t('Maître')}</small><b>${id('GARSON')}</b><br/>${ds('GARSON')}</div>
    <div><small>${t('Akşam')}</small><b>${docDate}</b><br/>${docTime}</div>
</div>
<div class="kural">${t('◆')}</div>
${each(LINES, `${X.grup((g) => `<div class="gb">${g}</div>`)}<div class="kl"><div class="kad">${X.ad}</div>${X.ack()}${X.not('mut', '')}<div class="fy">${X.hesap}${t(' · KDV ')}${X.kdv}${t(' — ')}${X.tutar}</div>${X.isk()}</div>`)}
<div class="kural">${t('◆')}</div>
<div class="alt">
    <div class="ib"><div class="k">${t('Fatura edilen')}</div>${musteri}<div class="k">${t('Restoran')}</div>${satici}</div>
    <div>${ozetTablo()}<div class="big"><span>${t('Toplam')}</span><b>${payable}</b></div><div class="ib" style="margin-top:2px">${payNote}</div><div class="yzy" style="color:#a8a29e">${yaziyla}</div></div>
</div>
<div class="imza"><div>${t('Misafir imzası')}</div><div>${t('Maître · ')}${id('GARSON')}</div></div>
${resmi(76)}
</div></div>`,
    })),
};
