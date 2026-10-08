import {
    invoice, xslt, v, t, num, int, dt, unit, each, iff, choose, attr, P, pName, pAddr, pTax, pContact,
    SUP, CUS, LMT, tlKarsilik, yalniz, notes, totals, qr, logo, svg,
} from './lib.mjs';

const adr = (street, no, district, city, zip) => ({ street, no, district, city, zip });
const yabanci = (first, last, addr, tel, mail) => ({ ids: [['VKN', '2222222222']], name: `${first} ${last}`, person: [first, last], addr, tel, mail });
const EXEMPT = { code: '301', reason: '11/1-a Mal ihracatı' };
const MIKRO_NOT = 'Bu fatura ETGB kapsamında mikro ihracat (e-ihracat) faturasıdır; KDV 3065 s. Kanun 11/1-a uyarınca istisnadır.';
const DLV = '$f/cac:Delivery';
const carrier = v(`${DLV}/cac:CarrierParty/cac:PartyName/cbc:Name`);
const takip = v(`${DLV}/cbc:TrackingID`);
const gonderim = dt(`${DLV}/cac:Despatch/cbc:ActualDespatchDate`);
const etgb = "$f/cac:AdditionalDocumentReference[cbc:DocumentType='ETGB']";
const odeme = v('$f/cac:PaymentMeans/cbc:InstructionNote');
const kur = `${t('1 ')}${v('$f/cbc:DocumentCurrencyCode')}${t(' = ')}${num('$kur', '###.##0,0000')}${t(' TL')}`;
const tarih = `${dt('$f/cbc:IssueDate')}${t(' ')}${v('substring($f/cbc:IssueTime,1,5)')}`;
const dAddr = [
    v(`${DLV}/cac:DeliveryAddress/cbc:StreetName`), iff(`${DLV}/cac:DeliveryAddress/cbc:BuildingNumber`, `${t(' ')}${v(`${DLV}/cac:DeliveryAddress/cbc:BuildingNumber`)}`), t(', '),
    iff(`${DLV}/cac:DeliveryAddress/cbc:PostalZone`, `${v(`${DLV}/cac:DeliveryAddress/cbc:PostalZone`)}${t(' ')}`),
    v(`${DLV}/cac:DeliveryAddress/cbc:CityName`), t(' · '), v(`${DLV}/cac:DeliveryAddress/cac:Country/cbc:Name`),
].join('');
const ulke = v(`${CUS}/cac:PostalAddress/cac:Country/cbc:Name`);
const gtip = (s) => v(`concat(substring(${s},1,4),'.',substring(${s},5,2),'.',substring(${s},7,2),'.',substring(${s},9,2),'.',substring(${s},11,2))`);

/* ================================================================ 1. El yapımı deri çanta — ABD (kraft, washi bant) */

const kavun = {
    web: 'https://www.kavunleather.com',
    ids: [['TCKN', '38271946502']],
    name: 'Kavun Deri Atölyesi',
    person: ['Elif', 'Kavun'],
    addr: adr('Kemeraltı Çarşısı, Anafartalar Cad.', '214', 'Konak', 'İzmir', '35250'),
    vd: 'Kemeraltı', tel: '+90 532 418 26 70', mail: 'hello@kavunleather.com',
};
const ptt = { ids: [['VKN', '7320068060']], name: 'PTT A.Ş. — Uluslararası Kargo (EMS)', addr: { district: 'Altındağ', city: 'Ankara' } };
const m1 = {
    id: 'atolye-deri-canta-mikro',
    xml: invoice({
        comment: `Hazır şablon örneği: El yapımı deri ürünlerin ABD'deki bireysel alıcıya mikro ihracatı (ETGB) — EARSIVFATURA · ISTISNA (301), USD.
            Yurt dışı alıcı VKN 2222222222; ETGB no AdditionalDocumentReference (ETGB); internet satışı bilgileri, PTT EMS gönderisi.
            Satırda DERI, RENK, GTIP ek tanımları.`,
        profile: 'EARSIVFATURA', type: 'ISTISNA', id: 'KVN2026000000093', date: '2026-10-07', time: '18:25:00', currency: 'USD', rate: 42.653,
        notes: [MIKRO_NOT, 'Her ürün elde dikilmiştir; deri doğal izler taşıyabilir.'],
        order: { id: 'HM-3318209471', date: '2026-10-03' },
        docs: [{ id: '26350100EX004418', date: '2026-10-07', type: 'ETGB', desc: 'Elektronik Ticaret Gümrük Beyannamesi' }],
        supplier: kavun, exemption: EXEMPT,
        customer: yabanci('Emily', 'Carter', { street: 'SE Belmont St', no: '2418', district: 'Buckman', city: 'Portland, OR', zip: '97214', cc: 'US', country: 'Amerika Birleşik Devletleri' }, '+1 503 555 0148', 'emily.carter@example.com'),
        delivery: {
            tracking: 'EE418263975TR', date: '2026-10-08', time: '10:30:00', carrier: ptt,
            addr: { street: 'SE Belmont St', no: '2418', district: 'Buckman', city: 'Portland, OR', zip: '97214', cc: 'US', country: 'Amerika Birleşik Devletleri' },
        },
        payment: { code: '48', due: '2026-10-03', note: 'Kredi kartı · Ödeme aracısı: el yapımı ürün pazaryeri (kartlı ödeme)' },
        lines: [
            { name: 'El dikimi deri omuz çantası', desc: 'Hand-stitched leather shoulder bag', sid: 'KV-BG-07', unit: 'C62', qty: 1, price: 148, props: { DERI: 'Bitkisel tabaklı dana', RENK: 'Konyak', RENKKOD: '#9a5b2c', GTIP: '420221000000' } },
            { name: 'Deri cüzdan', desc: 'Bifold leather wallet, initials embossed', sid: 'KV-WL-12', unit: 'C62', qty: 1, price: 46, props: { DERI: 'Crazy horse', RENK: 'Koyu kahve', RENKKOD: '#4a2c17', GTIP: '420231000000' } },
            { name: 'Deri kartlık', desc: 'Minimal card holder', sid: 'KV-CH-03', unit: 'C62', qty: 2, price: 22, props: { DERI: 'Bitkisel tabaklı dana', RENK: 'Taba · Zeytin', RENKKOD: '#b07a3e', GTIP: '420232000000' } },
        ],
    }),
};
const bant = (renk, aci, ust, sol) => `<div class="bant" style="background-color:${renk};transform:rotate(${aci}deg);top:${ust};left:${sol}"></div>`;
m1.xslt = xslt({
    title: 'e-Arşiv Fatura (Mikro İhracat)',
    comment: `Kavun Deri Atölyesi — ABD'ye el yapımı deri ürün mikro ihracatı e-Arşiv faturası. El yapımı / kraft konsepti: kraft kâğıt
        zemin, washi bantla tutturulmuş beyaz kartlar, el yazısı başlıklar, deri renginde (RENKKOD) yuvarlak ürün etiketleri,
        "Handmade in Türkiye" damgası, ETGB ve PTT EMS takip bilgisi, alıcıya teşekkür kartı.`,
    css: `
        body { background: #8b6b47; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #2b2118; }
        .sayfa { background-color: #c9a97b; background-image: radial-gradient(rgba(90,60,30,.12) 1px, transparent 1.2px), radial-gradient(rgba(255,255,255,.12) 1px, transparent 1.4px); background-size: 9px 9px, 13px 13px; background-position: 0 0, 4px 6px; padding: 10mm 12mm; }
        .el { font-family: 'Ink Free', 'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive; }
        .kart { position: relative; background: #fffdf7; padding: 10px 14px; box-shadow: 0 3px 8px rgba(60,40,20,.28); margin-top: 10px; }
        .bant { position: absolute; width: 74px; height: 20px; opacity: .78; background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.35) 0 4px, transparent 4px 8px); }
        .ust { display: flex; gap: 14px; align-items: center; transform: rotate(-.6deg); }
        .ust .ad { font-size: 30px; line-height: 1; color: #5b3a1e; }
        .ust .alt { font-size: 9px; letter-spacing: 3px; color: #8a6a48; margin-top: 4px; }
        .ust .adr { font-size: 8.5px; color: #6b5a48; line-height: 1.5; margin-top: 4px; }
        .damga { margin-left: auto; width: 92px; height: 92px; border-radius: 50%; border: 2.5px dashed #9a5b2c; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #9a5b2c; transform: rotate(10deg); text-align: center; font-weight: 800; font-size: 8px; letter-spacing: 1.5px; }
        .damga b { font-family: 'Ink Free', 'Segoe Print', cursive; font-size: 17px; letter-spacing: 0; }
        .iki { display: flex; gap: 12px; }
        .iki > .kart { flex: 1; }
        .baslik { font-size: 16px; color: #5b3a1e; margin-bottom: 3px; }
        .satir { display: flex; justify-content: space-between; padding: 2px 0; border-bottom: 1px dotted #e3d5bf; }
        .satir span:first-child { color: #8a6a48; }
        .satir b { font-weight: 700; }
        .urun { display: flex; gap: 12px; align-items: center; padding: 7px 0; border-bottom: 1px dashed #e3d5bf; }
        .urun:last-child { border-bottom: 0; }
        .etiket { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fffdf7; font-size: 15px; box-shadow: inset 0 0 0 3px rgba(255,255,255,.35), 0 0 0 1px #c9a97b; flex-shrink: 0; }
        .urun .bilgi { flex: 1; }
        .urun .bilgi b { font-size: 11.5px; }
        .urun .bilgi i { display: block; color: #6b5a48; }
        .urun .bilgi small { color: #8a6a48; font-size: 8.5px; }
        .urun .tut { text-align: right; width: 34mm; }
        .urun .tut b { display: block; font-size: 12.5px; }
        table.top { width: 100%; border-collapse: collapse; }
        table.top td { padding: 3px 0; border-bottom: 1px dotted #e3d5bf; }
        table.top td.t { text-align: right; font-weight: 700; }
        table.top tr.ist td { color: #2f6b3a; }
        .odenen { margin-top: 6px; display: flex; justify-content: space-between; align-items: baseline; color: #5b3a1e; }
        .odenen b { font-size: 25px; }
        .tesekkur { background: #f4e6cf; transform: rotate(1.2deg); text-align: center; padding: 14px 18px; }
        .tesekkur .el { font-size: 22px; color: #9a5b2c; }
        .tesekkur p { margin: 5px 0 0 0; line-height: 1.55; color: #5b4a38; }
        .kucuk { font-size: 8.5px; color: #6b5a48; line-height: 1.55; }`,
    body: `
<div class="sayfa">
    <div class="kart ust">
        ${bant('#e9a8a0', -8, '-9px', '22px')}${bant('#9cc5a1', 6, '-8px', '78%')}
        ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#9a5b2c"/><path d="M18 28 Q18 20 26 20 H38 Q46 20 46 28 V44 H18 Z" fill="none" stroke="#fffdf7" stroke-width="2.4" stroke-dasharray="3 2.4"/><path d="M24 20 Q24 12 32 12 Q40 12 40 20" fill="none" stroke="#fffdf7" stroke-width="2.4"/></svg>', 62, 62)}
        <div>
            ${each(SUP, `<div class="ad el">${pName}</div><div class="alt">${t('HANDMADE LEATHER · e-ARŞİV FATURA · MİKRO İHRACAT')}</div><div class="adr">${v("concat(cac:Person/cbc:FirstName,' ',cac:Person/cbc:FamilyName)")}${t(' · ')}${pAddr()}<br/>${pTax()}${t(' · ')}${pContact()}</div>`)}
        </div>
        <div class="damga">${t('HANDMADE IN')}<b>${t('Türkiye')}</b>${t('★ İZMİR ★')}</div>
        <div style="background:#ffffff;padding:4px;box-shadow:0 1px 3px rgba(0,0,0,.2)">${qr(78)}</div>
    </div>
    <div class="iki">
        <div class="kart">
            ${bant('#f2d27a', -4, '-9px', '38%')}
            <div class="baslik el">${t('Fatura')}</div>
            <div class="satir"><span>${t('No')}</span><b>${v('$f/cbc:ID')}</b></div>
            <div class="satir"><span>${t('Tarih')}</span><b>${tarih}</b></div>
            <div class="satir"><span>${t('Senaryo / Tip')}</span><b>${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:InvoiceTypeCode')}</b></div>
            <div class="satir"><span>${t('Sipariş no')}</span><b>${v('$f/cac:OrderReference/cbc:ID')}</b></div>
            <div class="satir"><span>${t('ETGB no')}</span><b>${v(`${etgb}/cbc:ID`)}</b></div>
            <div class="satir"><span>${t('Kur')}</span><b>${kur}</b></div>
            <div class="kucuk" style="margin-top:4px">${t('ETTN ')}${v('$f/cbc:UUID')}</div>
        </div>
        <div class="kart">
            ${bant('#a9c6e8', 5, '-9px', '30%')}
            <div class="baslik el">${t('Ship to · Alıcı')}</div>
            ${each(CUS, `<b style="font-size:12px">${pName}</b><br/>${pAddr()}<br/>${pContact()}<br/><span class="kucuk">${t('VKN ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='VKN']")}${t(' (yurt dışı alıcı)')}</span>`)}
            <div class="satir" style="margin-top:5px"><span>${t('Kargo')}</span><b>${carrier}</b></div>
            <div class="satir"><span>${t('Takip no')}</span><b style="font-family:Consolas,monospace">${takip}</b></div>
            <div class="satir"><span>${t('Gönderim')}</span><b>${gonderim}</b></div>
        </div>
    </div>
    <div class="kart">
        ${bant('#e9a8a0', 3, '-9px', '6%')}${bant('#9cc5a1', -5, '-9px', '84%')}
        <div class="baslik el">${t('Siparişiniz · Your order')}</div>
        ${each('$f/cac:InvoiceLine', `<div class="urun">
            <div class="etiket el">${attr('style', `background:${v(P('RENKKOD'))}`)}${v('cbc:ID')}</div>
            <div class="bilgi"><b>${v('cac:Item/cbc:Name')}</b><i>${v('cac:Item/cbc:Description')}</i>
                <small>${v(P('DERI'))}${t(' · ')}${v(P('RENK'))}${t(' · GTİP ')}${gtip(P('GTIP'))}${t(' · ')}${v('cac:Item/cac:SellersItemIdentification/cbc:ID')}</small></div>
            <div class="tut">${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}${t(' × ')}${num('cac:Price/cbc:PriceAmount')}<b>${num('cbc:LineExtensionAmount')}${t(' ')}${v('$pb')}</b></div>
        </div>`)}
    </div>
    <div class="iki">
        <div class="kart tesekkur">
            ${bant('#f2d27a', -3, '-9px', '40%')}
            <div class="el">${t('Thank you, ')}${v(`${CUS}/cac:Person/cbc:FirstName`)}${t('!')}</div>
            <p>${t('Siparişiniz İzmir\'deki atölyemizde elde kesilip dikildi. Deriyi ayda bir doğal bakım yağıyla besleyin.')}</p>
            <p class="kucuk">${t('Ödeme: ')}${odeme}</p>
        </div>
        <div class="kart">
            ${bant('#a9c6e8', -6, '-9px', '60%')}
            <table class="top">${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
            <div class="odenen"><span class="el" style="font-size:16px">${t('Toplam')}</span><b class="el">${num(`${LMT}/cbc:PayableAmount`)}${t(' ')}${v('$pb')}</b></div>
            <div class="kucuk" style="text-align:right">${t('TL karşılığı ')}${tlKarsilik()}${t(' TL')}</div>
            ${yalniz(`<div class="kucuk" style="font-style:italic;margin-top:3px">${v('.')}</div>`)}
        </div>
    </div>
    <div class="kucuk" style="margin-top:8px;color:#3b2a1a">${notes(`${t('• ')}${v('.')}<br/>`)}</div>
</div>`,
});

/* ================================================================ 2. Havlu / bornoz — Almanya (pazaryeri sipariş föyü + paket fişi) */

const buldan = {
    web: 'https://www.buldandokuma.com.tr',
    ids: [['VKN', '1928374650'], ['MERSISNO', '0192837465000013']],
    name: 'Buldan Dokuma Tekstil Ltd. Şti.',
    addr: adr('Yeni Mah. Dokumacılar Cad.', '18', 'Buldan', 'Denizli', '20400'),
    vd: 'Buldan', tel: '+90 258 361 44 18', mail: 'shop@buldandokuma.com.tr',
};
const m2 = {
    id: 'pazaryeri-havlu-mikro',
    xml: invoice({
        comment: `Hazır şablon örneği: Pazaryerinden Almanya'daki bireysel alıcıya havlu / bornoz mikro ihracatı (ETGB) — EARSIVFATURA · ISTISNA (301), EUR.
            Yurt dışı alıcı VKN 2222222222, ETGB referansı, ekspres kargo; satırda SKU (SellersItemIdentification), RENK, EBAT, GTIP.`,
        profile: 'EARSIVFATURA', type: 'ISTISNA', id: 'BLD2026000002217', date: '2026-10-06', time: '14:05:00', currency: 'EUR', rate: 49.912,
        notes: [MIKRO_NOT, 'İlk yıkamadan önce ürünleri ayrı yıkayınız · Vor dem ersten Gebrauch separat waschen.'],
        order: { id: '303-4471982-6620118', date: '2026-10-04' },
        docs: [{ id: '26200300EX011873', date: '2026-10-06', type: 'ETGB', desc: 'Elektronik Ticaret Gümrük Beyannamesi' }],
        supplier: buldan, exemption: EXEMPT,
        customer: yabanci('Lukas', 'Becker', { street: 'Aachener Straße', no: '512', district: 'Braunsfeld', city: 'Köln', zip: '50933', cc: 'DE', country: 'Almanya' }, '+49 221 555 0193', 'lukas.becker@example.com'),
        delivery: {
            tracking: '1846 2290 4417', date: '2026-10-07', time: '16:00:00',
            carrier: { ids: [['VKN', '3020052424']], name: 'DHL Express Türkiye', addr: { district: 'Bakırköy', city: 'İstanbul' } },
            addr: { street: 'Aachener Straße', no: '512', district: 'Braunsfeld', city: 'Köln', zip: '50933', cc: 'DE', country: 'Almanya' },
        },
        payment: { code: '48', due: '2026-10-04', note: 'Pazaryeri ödeme sistemi · Kredi kartı' },
        lines: [
            { name: 'Pamuklu şal yaka bornoz', desc: 'Bademantel mit Schalkragen, 100% Baumwolle', sid: 'BLD-BR-L-ANT', unit: 'C62', qty: 2, price: 54.9, props: { RENK: 'Antrasit', EBAT: 'L', GTIP: '620891000000' } },
            { name: 'Banyo havlusu seti 4\'lü', desc: 'Badetuch-Set 4-teilig, 600 g/m²', sid: 'BLD-HS-4-SAL', unit: 'SET', qty: 1, price: 39.9, props: { RENK: 'Adaçayı', EBAT: '2×70×140 · 2×50×90', GTIP: '630260000000' } },
            { name: 'Waffle el havlusu', desc: 'Waffel-Gästehandtuch', sid: 'BLD-WF-30-BEJ', unit: 'C62', qty: 4, price: 8.5, props: { RENK: 'Bej', EBAT: '30×50', GTIP: '630260000000' } },
        ],
    }),
};
const barkod = (h, n = 46) => {
    let x = 0; let r = '';
    for (let i = 0; i < n; i++) { const w = [1, 2, 1, 3, 1, 1, 2][(i * 7 + 3) % 7]; if (i % 2 === 0) r += `<rect x="${x}" y="0" width="${w}" height="${h}" fill="#111827"/>`; x += w + 1; }
    return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} ${h}" preserveAspectRatio="none">${r}</svg>`);
};
m2.xslt = xslt({
    title: 'e-Arşiv Fatura (Mikro İhracat)',
    comment: `Buldan Dokuma — pazaryeri üzerinden Almanya'ya havlu / bornoz mikro ihracatı e-Arşiv faturası. Sipariş föyü konsepti:
        sol sütunda sipariş özeti ve barkod, üstte sipariş numarası çubuğu, gönderim adımları, yoğun veri tablosu (SKU, ebat, renk, GTİP),
        altta kesik çizgiyle ayrılan, kutuya konacak paket fişi (packing slip). Nötr gri tonlar, lime vurgu.`,
    css: `
        body { background: #cbd5e1; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5px; color: #0f172a; }
        .sayfa { background: #ffffff; display: flex; flex-direction: column; }
        .cubuk { background: #0f172a; color: #e2e8f0; display: flex; align-items: center; gap: 14px; padding: 7px 10mm; }
        .cubuk b { color: #bef264; font-size: 13px; letter-spacing: .5px; }
        .cubuk span { font-size: 8.5px; letter-spacing: 1px; }
        .cubuk .sag { margin-left: auto; }
        .gov { display: flex; flex: 1; }
        .yan { width: 58mm; background: #f1f5f9; padding: 8mm 6mm; border-right: 1px solid #e2e8f0; }
        .yan .k { font-size: 7px; letter-spacing: 1.5px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-top: 9px; }
        .yan .v { font-weight: 700; font-size: 10px; }
        .yan .unvan { font-size: 12.5px; font-weight: 800; margin-top: 6px; }
        .yan .adr { font-size: 8.5px; color: #475569; line-height: 1.5; }
        .yan .bar { margin-top: 10px; background: #ffffff; padding: 6px; text-align: center; font-family: Consolas, monospace; font-size: 8px; letter-spacing: 1px; border: 1px solid #e2e8f0; }
        .yan .qr { margin-top: 10px; background: #ffffff; padding: 6px; display: flex; justify-content: center; border: 1px solid #e2e8f0; }
        .ana { flex: 1; padding: 8mm 9mm; }
        .ana h1 { margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -.4px; }
        .ana h1 span { display: inline-block; background: #bef264; font-size: 8.5px; letter-spacing: 1.5px; padding: 2px 7px; margin-left: 8px; vertical-align: middle; border-radius: 2px; }
        .ana .alt { color: #64748b; margin-top: 2px; }
        .adim { display: flex; margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; }
        .adim div { flex: 1; padding: 5px 8px; font-size: 8.5px; color: #64748b; border-right: 1px solid #e2e8f0; position: relative; }
        .adim div:last-child { border-right: 0; }
        .adim div b { display: block; color: #0f172a; font-size: 9.5px; }
        .adim div.ok { background: #f7fee7; }
        .adim div.ok:before { content: '✓'; position: absolute; right: 7px; top: 5px; color: #65a30d; font-weight: 900; }
        .taraf { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
        .taraf > div { border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 9px; line-height: 1.5; }
        .taraf .k { font-size: 7px; letter-spacing: 1.5px; color: #64748b; font-weight: 700; }
        table.tb { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.tb th { text-align: left; font-size: 7.5px; letter-spacing: 1px; color: #64748b; font-weight: 700; padding: 4px 5px; border-bottom: 2px solid #0f172a; }
        table.tb th.s, table.tb td.s { text-align: right; white-space: nowrap; }
        table.tb td { padding: 6px 5px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
        table.tb td.sku { font-family: Consolas, monospace; font-size: 8.5px; color: #334155; }
        table.tb td small { display: block; color: #64748b; }
        table.tb tr:nth-child(even) td { background: #f8fafc; }
        .toplam { display: flex; gap: 10px; margin-top: 10px; }
        .toplam .not { flex: 1; font-size: 8.5px; color: #475569; line-height: 1.55; }
        .toplam table { width: 70mm; border-collapse: collapse; }
        .toplam td { padding: 3px 5px; }
        .toplam td.t { text-align: right; font-weight: 700; }
        .toplam tr.ist td { color: #4d7c0f; }
        .toplam tr.son td { background: #0f172a; color: #bef264; font-size: 14px; font-weight: 800; padding: 6px 5px; }
        .kes { border-top: 2px dashed #94a3b8; margin: 0 6mm; position: relative; }
        .kes:before { content: '✂'; position: absolute; left: 4mm; top: -11px; background: #ffffff; padding: 0 4px; color: #64748b; font-size: 13px; }
        .fis { padding: 6mm 10mm 8mm 10mm; display: flex; gap: 12px; }
        .fis .k { font-size: 7px; letter-spacing: 1.5px; color: #64748b; font-weight: 700; }
        .fis .adres { width: 70mm; border: 2px solid #0f172a; padding: 7px 10px; font-size: 11px; line-height: 1.45; }
        .fis .adres b { font-size: 13px; }
        .fis ul { margin: 2px 0 0 0; padding-left: 0; list-style: none; flex: 1; }
        .fis li { padding: 3px 0; border-bottom: 1px dotted #cbd5e1; }
        .fis li:before { content: '☐ '; color: #65a30d; }`,
    body: `
<div class="sayfa">
    <div class="cubuk"><span>${t('SİPARİŞ / ORDER')}</span><b>${v('$f/cac:OrderReference/cbc:ID')}</b><span>${dt('$f/cac:OrderReference/cbc:IssueDate')}</span><span class="sag">${t('E-ARŞİV FATURA · MİKRO İHRACAT (ETGB)')}</span></div>
    <div class="gov">
        <div class="yan">
            ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0f172a"/><path d="M14 22 H50 M14 30 H50 M14 38 H50 M14 46 H50" stroke="#bef264" stroke-width="3"/><path d="M20 16 V50 M32 16 V50 M44 16 V50" stroke="#e2e8f0" stroke-width="1.4" stroke-dasharray="2 2"/></svg>', 50, 50)}
            ${each(SUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div>`)}
            <div class="k">${t('Fatura no')}</div><div class="v">${v('$f/cbc:ID')}</div>
            <div class="k">${t('Düzenleme')}</div><div class="v">${tarih}</div>
            <div class="k">${t('Senaryo / Tip')}</div><div class="v">${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:InvoiceTypeCode')}</div>
            <div class="k">${t('ETGB')}</div><div class="v">${v(`${etgb}/cbc:ID`)}</div>
            <div class="k">${t('Döviz kuru')}</div><div class="v">${kur}</div>
            <div class="k">${t('Ödeme')}</div><div class="v">${odeme}</div>
            <div class="bar"><img alt="" width="160" height="34" src="${barkod(34)}"/><br/>${v('$f/cbc:ID')}</div>
            <div class="qr">${qr(92)}</div>
            <div class="k">${t('ETTN')}</div><div style="font-family:Consolas,monospace;font-size:7.5px;word-break:break-all">${v('$f/cbc:UUID')}</div>
        </div>
        <div class="ana">
            <h1>${t('Fatura · Rechnung')}<span>${t('KDV İSTİSNA 301')}</span></h1>
            <div class="alt">${t('Pazaryeri siparişi · ')}${v('count($f/cac:InvoiceLine)')}${t(' kalem · ')}${int('sum($f/cac:InvoiceLine/cbc:InvoicedQuantity)')}${t(' ürün')}</div>
            <div class="adim">
                <div class="ok"><b>${t('Sipariş')}</b>${dt('$f/cac:OrderReference/cbc:IssueDate')}</div>
                <div class="ok"><b>${t('Ödeme')}</b>${dt('$f/cac:PaymentMeans/cbc:PaymentDueDate')}</div>
                <div class="ok"><b>${t('Fatura')}</b>${dt('$f/cbc:IssueDate')}</div>
                <div class="ok"><b>${t('Kargoya verildi')}</b>${gonderim}</div>
                <div><b>${t('Gümrük (ETGB)')}</b>${v(`${etgb}/cbc:ID`)}</div>
            </div>
            <div class="taraf">
                <div><div class="k">${t('FATURA ADRESİ · RECHNUNGSADRESSE')}</div>${each(CUS, `<b>${pName}</b><br/>${pAddr()}<br/>${pContact()}<br/>${t('VKN ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='VKN']")}`)}</div>
                <div><div class="k">${t('TESLİMAT · LIEFERUNG')}</div><b>${carrier}</b><br/>${t('Takip: ')}<b style="font-family:Consolas,monospace">${takip}</b><br/>${dAddr}</div>
            </div>
            <table class="tb">
                <tr><th>${t('SKU')}</th><th>${t('ÜRÜN / ARTIKEL')}</th><th>${t('EBAT · RENK')}</th><th>${t('GTİP')}</th><th class="s">${t('ADET')}</th><th class="s">${t('FİYAT')}</th><th class="s">${t('TUTAR')}</th></tr>
                ${each('$f/cac:InvoiceLine', `<tr>
                    <td class="sku">${v('cac:Item/cac:SellersItemIdentification/cbc:ID')}</td>
                    <td><b>${v('cac:Item/cbc:Name')}</b><small>${v('cac:Item/cbc:Description')}</small></td>
                    <td>${v(P('EBAT'))}<small>${v(P('RENK'))}</small></td>
                    <td class="sku">${gtip(P('GTIP'))}</td>
                    <td class="s">${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}</td>
                    <td class="s">${num('cac:Price/cbc:PriceAmount')}</td>
                    <td class="s"><b>${num('cbc:LineExtensionAmount')}</b></td>
                </tr>`)}
            </table>
            <div class="toplam">
                <div class="not">${yalniz(`<b>${v('.')}</b><br/>`)}${notes(`${v('.')}<br/>`)}</div>
                <table>
                    ${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}
                    <tr class="son"><td>${t('Ödenen')}</td><td class="t">${num(`${LMT}/cbc:PayableAmount`)}${t(' ')}${v('$pb')}</td></tr>
                    <tr><td style="color:#64748b">${t('TL karşılığı')}</td><td class="t" style="color:#64748b">${tlKarsilik()}${t(' TL')}</td></tr>
                </table>
            </div>
        </div>
    </div>
    <div class="kes"></div>
    <div class="fis">
        <div class="adres"><div class="k">${t('PAKET FİŞİ · PACKING SLIP')}</div>${each(CUS, `<b>${pName}</b><br/>${pAddr(', ')}`)}<br/>${t('Sipariş ')}${v('$f/cac:OrderReference/cbc:ID')}</div>
        <ul>${each('$f/cac:InvoiceLine', `<li>${int('cbc:InvoicedQuantity')}${t(' × ')}${v('cac:Item/cbc:Name')}${t(' — ')}${v(P('EBAT'))}${t(' · ')}${v(P('RENK'))}</li>`)}</ul>
        <div style="text-align:center"><img alt="" width="120" height="44" src="${barkod(44, 40)}"/><div style="font-family:Consolas,monospace;font-size:9px">${takip}</div></div>
    </div>
</div>`,
});

/* ================================================================ 3. Sneaker — Hollanda (numara dönüşüm tablosu, açılı bloklar) */

const kicks = {
    web: 'https://www.kickslab.com.tr',
    ids: [['VKN', '5402918736'], ['MERSISNO', '0540291873600015']],
    name: 'Kicks Lab Ayakkabı E-Ticaret A.Ş.',
    addr: adr('Caferağa Mah. Moda Cad.', '87', 'Kadıköy', 'İstanbul', '34710'),
    vd: 'Kadıköy', tel: '+90 216 330 44 87', mail: 'orders@kickslab.com.tr',
};
const m3 = {
    id: 'sneaker-eticaret-mikro',
    xml: invoice({
        comment: `Hazır şablon örneği: Sneaker e-ticaret sitesinden Hollanda'daki bireysel alıcıya mikro ihracat (ETGB) — EARSIVFATURA · ISTISNA (301), EUR.
            Satırda NUMARA (EU), US, UK, CM numara karşılıkları, RENK ve GTIP ek tanımları; UPS ekspres gönderi.`,
        profile: 'EARSIVFATURA', type: 'ISTISNA', id: 'KCK2026000004102', date: '2026-10-07', time: '11:48:00', currency: 'EUR', rate: 49.912,
        notes: [MIKRO_NOT, 'Kutular orijinal ambalajında, çift kutu (double box) ile gönderilmiştir.'],
        order: { id: 'KL-EU-260412', date: '2026-10-06' },
        docs: [{ id: '26341300EX007731', date: '2026-10-07', type: 'ETGB', desc: 'Elektronik Ticaret Gümrük Beyannamesi' }],
        supplier: kicks, exemption: EXEMPT,
        customer: yabanci('Daan', 'de Vries', { street: 'Prinsengracht', no: '263', district: 'Centrum', city: 'Amsterdam', zip: '1016 GV', cc: 'NL', country: 'Hollanda' }, '+31 20 555 0172', 'daan.devries@example.com'),
        delivery: {
            tracking: '1Z 9X4 418 04 2261 7730', date: '2026-10-08', time: '15:30:00',
            carrier: { ids: [['VKN', '8920052814']], name: 'UPS Express', addr: { district: 'Bağcılar', city: 'İstanbul' } },
            addr: { street: 'Prinsengracht', no: '263', district: 'Centrum', city: 'Amsterdam', zip: '1016 GV', cc: 'NL', country: 'Hollanda' },
        },
        payment: { code: '48', due: '2026-10-06', note: 'Kredi kartı · 3D Secure · Ödeme aracısı: PayTR' },
        lines: [
            { name: 'Retro koşu ayakkabısı', desc: 'Suede / mesh runner', sid: 'KL-RN-90-GRY', unit: 'PR', qty: 1, price: 139, props: { NUMARA: '44', US: '10', UK: '9.5', CM: '28', RENK: 'Gri · Krem', GTIP: '640411000000' } },
            { name: 'Basketbol botu', desc: 'High-top leather sneaker', sid: 'KL-HT-85-WRD', unit: 'PR', qty: 1, price: 169, props: { NUMARA: '44', US: '10', UK: '9.5', CM: '28', RENK: 'Beyaz · Kırmızı', GTIP: '640319000000' } },
            { name: 'Sneaker temizlik kiti', desc: 'Foam cleaner, brush, microfibre', sid: 'KL-CK-01', unit: 'SET', qty: 1, price: 19, props: { RENK: '—', GTIP: '340520000000' } },
        ],
    }),
};
const BOY = [['40', '7', '6', '25'], ['41', '8', '7', '26'], ['42', '8.5', '7.5', '26.5'], ['43', '9.5', '8.5', '27.5'], ['44', '10', '9.5', '28'], ['45', '11', '10', '29'], ['46', '12', '11', '30']];
const secili = (eu) => iff(`$f/cac:InvoiceLine/${P('NUMARA')}='${eu}'`, attr('class', 'sec'));
m3.xslt = xslt({
    title: 'e-Arşiv Fatura (Mikro İhracat)',
    comment: `Kicks Lab — Hollanda'ya sneaker mikro ihracatı e-Arşiv faturası. Sokak modası konsepti: eğik (skew) siyah / kırmızı bloklar,
        büyük kontur yazı, EU / US / UK / cm numara dönüşüm tablosu (satın alınan numara NUMARA ek tanımından otomatik vurgulanır),
        her çift için numara rozeti, UPS takip ve ETGB bilgisi.`,
    css: `
        body { background: #18181b; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #09090b; }
        .sayfa { background: #fafafa; overflow: hidden; padding-bottom: 9mm; }
        .ust { position: relative; height: 54mm; background: #09090b; color: #fafafa; padding: 8mm 12mm; overflow: hidden; }
        .ust:after { content: ''; position: absolute; right: -20mm; top: -10mm; width: 90mm; height: 90mm; background: #ef4444; transform: skewX(-18deg); }
        .ust:before { content: ''; position: absolute; right: 62mm; top: -10mm; width: 8mm; height: 90mm; background: #fafafa; transform: skewX(-18deg); z-index: 1; }
        .ust > * { position: relative; z-index: 2; }
        .ust .marka { display: flex; gap: 10px; align-items: center; }
        .ust .unvan { font-weight: 900; font-size: 15px; letter-spacing: .5px; }
        .ust .adr { font-size: 8.5px; color: #a1a1aa; line-height: 1.5; }
        .ust h1 { margin: 6mm 0 0 0; font-family: 'Arial Black', Impact, sans-serif; font-size: 40px; line-height: .9; font-style: italic; letter-spacing: -1px; color: transparent; -webkit-text-stroke: 1.5px #fafafa; }
        .ust h1 b { color: #fafafa; -webkit-text-stroke: 0; }
        .ust .etk { display: inline-block; margin-top: 4px; background: #fafafa; color: #09090b; font-weight: 900; font-size: 9px; letter-spacing: 2px; padding: 2px 8px; transform: skewX(-12deg); }
        .ust .qr { position: absolute; right: 12mm; top: 9mm; background: #ffffff; padding: 5px; transform: rotate(4deg); z-index: 3; }
        .ust .no { position: absolute; right: 12mm; bottom: 7mm; text-align: right; z-index: 3; color: #ffffff; }
        .ust .no b { display: block; font-family: 'Arial Black', Impact, sans-serif; font-size: 15px; font-style: italic; }
        .ic { padding: 0 12mm; }
        .bilgi { display: flex; margin-top: -6mm; position: relative; z-index: 4; }
        .bilgi > div { flex: 1; background: #ffffff; border: 2px solid #09090b; margin-right: -2px; padding: 5px 8px; transform: skewX(-8deg); }
        .bilgi > div > * { transform: skewX(8deg); }
        .bilgi .k { font-size: 7px; letter-spacing: 1.5px; color: #71717a; font-weight: 800; display: block; }
        .bilgi b { font-size: 10.5px; display: block; }
        .taraf { display: flex; gap: 10px; margin-top: 10px; }
        .taraf > div { flex: 1; border-left: 6px solid #09090b; padding: 4px 10px; line-height: 1.5; background: #ffffff; }
        .taraf > div.kirmizi { border-left-color: #ef4444; }
        .taraf .k { font-size: 7.5px; letter-spacing: 2px; font-weight: 900; }
        .taraf .ad { font-size: 12px; font-weight: 900; }
        .baslik { font-family: 'Arial Black', Impact, sans-serif; font-style: italic; font-size: 14px; margin: 12px 0 5px 0; display: flex; align-items: center; gap: 8px; }
        .baslik:after { content: ''; flex: 1; height: 4px; background: repeating-linear-gradient(-60deg, #09090b 0 6px, transparent 6px 10px); }
        table.boy { border-collapse: collapse; width: 100%; text-align: center; table-layout: fixed; }
        table.boy td { border: 1.5px solid #09090b; padding: 4px 0; font-weight: 700; }
        table.boy td.b { background: #09090b; color: #fafafa; font-size: 8px; letter-spacing: 1.5px; width: 16mm; }
        table.boy td.sec { background: #ef4444; color: #ffffff; font-weight: 900; }
        .cift { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 2px solid #e4e4e7; }
        .rozet { width: 16mm; height: 16mm; background: #09090b; color: #fafafa; transform: skewX(-10deg); display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .rozet b { font-family: 'Arial Black', Impact, sans-serif; font-size: 20px; line-height: 1; font-style: italic; }
        .rozet span { font-size: 7px; letter-spacing: 1.5px; color: #ef4444; font-weight: 900; }
        .cift .ad { flex: 1; }
        .cift .ad b { font-size: 12.5px; font-weight: 900; text-transform: uppercase; }
        .cift .ad div { font-size: 8.5px; color: #52525b; margin-top: 2px; }
        .cift .ad em { font-style: normal; display: inline-block; border: 1.5px solid #09090b; padding: 0 5px; font-size: 8px; font-weight: 800; margin: 3px 4px 0 0; }
        .cift .tut { text-align: right; width: 30mm; }
        .cift .tut b { display: block; font-family: 'Arial Black', Impact, sans-serif; font-size: 15px; font-style: italic; }
        .alt { display: flex; gap: 12px; margin-top: 12px; align-items: flex-start; }
        .alt .sol { flex: 1; font-size: 9px; line-height: 1.55; }
        .alt .sol .kargo { background: #09090b; color: #fafafa; padding: 7px 10px; transform: skewX(-6deg); margin-bottom: 7px; }
        .alt .sol .kargo > div { transform: skewX(6deg); }
        .alt .sol .kargo b { color: #ef4444; font-family: Consolas, monospace; font-size: 12px; }
        .toplam { width: 76mm; border: 2.5px solid #09090b; background: #ffffff; }
        .toplam table { width: 100%; border-collapse: collapse; }
        .toplam td { padding: 3px 8px; }
        .toplam td.t { text-align: right; font-weight: 800; }
        .toplam .od { background: #ef4444; color: #ffffff; padding: 7px 10px; display: flex; justify-content: space-between; align-items: center; }
        .toplam .od b { font-family: 'Arial Black', Impact, sans-serif; font-size: 20px; font-style: italic; }
        .toplam .tl { font-size: 8.5px; color: #71717a; text-align: right; padding: 3px 8px; }`,
    body: `
<div class="sayfa">
    <div class="ust">
        <div class="marka">
            ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#fafafa"/><path d="M8 40 L8 30 Q20 30 26 20 L34 21 Q38 30 50 32 Q57 33 57 40 Z" fill="#09090b"/><path d="M8 40 H57 V45 H8 Z" fill="#ef4444"/><path d="M28 26 L33 24 M31 30 L36 28" stroke="#fafafa" stroke-width="1.8"/></svg>', 48, 48)}
            <div>${each(SUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div>`)}</div>
        </div>
        <h1>${t('E-ARŞİV ')}<b>${t('FATURA')}</b></h1>
        <div class="etk">${t('MİKRO İHRACAT · ETGB · KDV İSTİSNA 301')}</div>
        <div class="qr">${qr(82)}</div>
        <div class="no">${t('INVOICE')}<b>${v('$f/cbc:ID')}</b></div>
    </div>
    <div class="ic">
        <div class="bilgi">
            <div><span class="k">${t('TARİH')}</span><b>${tarih}</b></div>
            <div><span class="k">${t('SİPARİŞ')}</span><b>${v('$f/cac:OrderReference/cbc:ID')}</b></div>
            <div><span class="k">${t('ETGB')}</span><b>${v(`${etgb}/cbc:ID`)}</b></div>
            <div><span class="k">${t('SENARYO')}</span><b>${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:InvoiceTypeCode')}</b></div>
            <div><span class="k">${t('KUR')}</span><b>${kur}</b></div>
        </div>
        <div class="taraf">
            <div><div class="k">${t('ALICI / BUYER')}</div>${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pContact()}<br/>${t('VKN ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='VKN']")}${t(' · yurt dışı')}`)}</div>
            <div class="kirmizi"><div class="k">${t('ÖDEME / PAYMENT')}</div>${odeme}<br/>${t('Ödeme tarihi ')}${dt('$f/cac:PaymentMeans/cbc:PaymentDueDate')}<br/>${t('ETTN ')}<span style="font-family:Consolas,monospace;font-size:8px">${v('$f/cbc:UUID')}</span></div>
        </div>
        <div class="baslik">${t('SIZE CHART · NUMARA TABLOSU')}</div>
        <table class="boy">
            <tr><td class="b">${t('EU')}</td>${BOY.map(([eu]) => `<td>${secili(eu)}${t(eu)}</td>`).join('')}</tr>
            <tr><td class="b">${t('US')}</td>${BOY.map(([eu, us]) => `<td>${secili(eu)}${t(us)}</td>`).join('')}</tr>
            <tr><td class="b">${t('UK')}</td>${BOY.map(([eu, , uk]) => `<td>${secili(eu)}${t(uk)}</td>`).join('')}</tr>
            <tr><td class="b">${t('CM')}</td>${BOY.map(([eu, , , cm]) => `<td>${secili(eu)}${t(cm)}</td>`).join('')}</tr>
        </table>
        <div class="baslik">${t('YOUR KICKS · SEPET')}</div>
        ${each('$f/cac:InvoiceLine', `<div class="cift">
            <div class="rozet">${choose([P('NUMARA'), `<b>${v(P('NUMARA'))}</b><span>${t('EU')}</span>`], [null, `<b>${v('cbc:ID')}</b><span>${t('KİT')}</span>`])}</div>
            <div class="ad"><b>${v('cac:Item/cbc:Name')}</b><div>${v('cac:Item/cbc:Description')}${t(' · ')}${v('cac:Item/cac:SellersItemIdentification/cbc:ID')}${t(' · GTİP ')}${gtip(P('GTIP'))}</div>
                ${iff(P('US'), `<em>${t('US ')}${v(P('US'))}</em><em>${t('UK ')}${v(P('UK'))}</em><em>${v(P('CM'))}${t(' cm')}</em>`)}<em>${v(P('RENK'))}</em></div>
            <div class="tut">${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}${t(' × ')}${num('cac:Price/cbc:PriceAmount')}<b>${num('cbc:LineExtensionAmount')}${t(' ')}${v('$pb')}</b></div>
        </div>`)}
        <div class="alt">
            <div class="sol">
                <div class="kargo"><div>${carrier}${t(' · ')}${gonderim}<br/><b>${takip}</b><br/>${dAddr}</div></div>
                ${yalniz(`<b>${v('.')}</b><br/>`)}
                ${notes(`${t('— ')}${v('.')}<br/>`)}
            </div>
            <div class="toplam">
                <table>${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
                <div class="od"><span>${t('TOTAL')}</span><b>${num(`${LMT}/cbc:PayableAmount`)}${t(' ')}${v('$pb')}</b></div>
                <div class="tl">${t('TL karşılığı ')}${tlKarsilik()}${t(' TL')}</div>
            </div>
        </div>
    </div>
</div>`,
});

/* ================================================================ 4. Peştamal — Avustralya (İznik çini, Osmanlı kemeri) */

const ege = {
    web: 'https://www.egepestamal.com',
    ids: [['TCKN', '24618397520']],
    name: 'Ege Peştamal',
    person: ['Zeynep', 'Arslan'],
    addr: adr('Cumhuriyet Mah. Kanbur Sok.', '6', 'Buldan', 'Denizli', '20400'),
    vd: 'Buldan', tel: '+90 535 288 41 06', mail: 'merhaba@egepestamal.com',
};
const m4 = {
    id: 'pestemal-mikro-ihracat',
    xml: invoice({
        comment: `Hazır şablon örneği: El tezgâhı peştamal ve hamam ürünlerinin Avustralya'daki bireysel alıcıya mikro ihracatı (ETGB) —
            EARSIVFATURA · ISTISNA (301), AUD. PTT EMS gönderisi; satırda DOKUMA, EBAT, RENK, GTIP ek tanımları.`,
        profile: 'EARSIVFATURA', type: 'ISTISNA', id: 'EGP2026000000614', date: '2026-10-05', time: '20:40:00', currency: 'AUD', rate: 28.145,
        notes: [MIKRO_NOT, 'Peştamallar Buldan\'da el tezgâhında dokunmuştur; ilk yıkamada hafif çekme olabilir.'],
        order: { id: 'EP-AU-0614', date: '2026-10-02' },
        docs: [{ id: '26200100EX002964', date: '2026-10-05', type: 'ETGB', desc: 'Elektronik Ticaret Gümrük Beyannamesi' }],
        supplier: ege, exemption: EXEMPT,
        customer: yabanci('Olivia', 'Thompson', { street: 'Glebe Point Road', no: '118', district: 'Glebe', city: 'Sydney NSW', zip: '2037', cc: 'AU', country: 'Avustralya' }, '+61 2 5550 1844', 'olivia.thompson@example.com'),
        delivery: {
            tracking: 'EE402918463TR', date: '2026-10-06', time: '11:15:00', carrier: ptt,
            addr: { street: 'Glebe Point Road', no: '118', district: 'Glebe', city: 'Sydney NSW', zip: '2037', cc: 'AU', country: 'Avustralya' },
        },
        payment: { code: '48', due: '2026-10-02', note: 'Kredi kartı · Ödeme aracısı: PayTR' },
        lines: [
            { name: 'El tezgâhı peştamal', desc: 'Handwoven Turkish towel (peshtemal)', sid: 'EP-PS-01', unit: 'C62', qty: 4, price: 32, props: { DOKUMA: 'Balıksırtı, %100 pamuk', EBAT: '100×180 cm', RENK: 'Turkuaz · Lacivert', RENKKOD: '#0e7490', GTIP: '630260000000' } },
            { name: 'İpek karışımlı peştamal', desc: 'Silk-blend peshtemal, tasselled', sid: 'EP-PS-07', unit: 'C62', qty: 2, price: 46, props: { DOKUMA: 'Düz dokuma, %70 pamuk %30 ipek', EBAT: '95×175 cm', RENK: 'Nar çiçeği', RENKKOD: '#b91c1c', GTIP: '630260000000' } },
            { name: 'Hamam seti', desc: 'Kese, olive oil soap & copper bowl', sid: 'EP-HM-03', unit: 'SET', qty: 1, price: 58, props: { DOKUMA: 'Kese + zeytinyağı sabunu + bakır tas', EBAT: '3 parça', RENK: 'Bakır', RENKKOD: '#b45309', GTIP: '741810000000' } },
        ],
    }),
};
const cini = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <rect width="48" height="48" fill="#f8fafc"/>
    <path d="M24 4 Q30 14 24 22 Q18 14 24 4 Z" fill="#1e40af"/><path d="M24 44 Q30 34 24 26 Q18 34 24 44 Z" fill="#1e40af"/>
    <path d="M4 24 Q14 18 22 24 Q14 30 4 24 Z" fill="#0e7490"/><path d="M44 24 Q34 18 26 24 Q34 30 44 24 Z" fill="#0e7490"/>
    <circle cx="24" cy="24" r="3.4" fill="#c0392b"/>
    <path d="M0 0 Q6 6 0 12 M48 0 Q42 6 48 12 M0 48 Q6 42 0 36 M48 48 Q42 42 48 36" stroke="#16a34a" stroke-width="2" fill="none"/>
    <circle cx="8" cy="8" r="2.4" fill="#c0392b"/><circle cx="40" cy="8" r="2.4" fill="#c0392b"/><circle cx="8" cy="40" r="2.4" fill="#c0392b"/><circle cx="40" cy="40" r="2.4" fill="#c0392b"/></svg>`);
const lale = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60"><path d="M20 58 Q19 40 20 26" stroke="#16a34a" stroke-width="2" fill="none"/><path d="M20 44 Q10 40 8 30 Q16 34 20 42" fill="#16a34a"/><path d="M20 26 Q8 22 10 6 Q16 14 20 4 Q24 14 30 6 Q32 22 20 26 Z" fill="#c0392b"/><path d="M20 24 Q16 16 20 8 Q24 16 20 24" fill="#e57368"/></svg>');
m4.xslt = xslt({
    title: 'e-Arşiv Fatura (Mikro İhracat)',
    comment: `Ege Peştamal — Avustralya'ya peştamal mikro ihracatı e-Arşiv faturası. İznik çinisi konsepti: kobalt / turkuaz / mercan kırmızısı,
        çini desenli kenar şeritleri, Osmanlı kemeri biçimli başlık, lale motifleri, her ürün için RENKKOD ile boyanmış kemerli
        kumaş kartı, ETGB ve PTT EMS bilgisi.`,
    css: `
        body { background: #1e3a8a; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #172554; }
        .sayfa { background: #fdfbf5; padding: 9mm 18mm; }
        .sayfa:before, .sayfa:after { content: ''; position: absolute; top: 0; bottom: 0; width: 10mm; background-image: url("${cini}"); background-size: 38px 38px; }
        .sayfa:before { left: 0; border-right: 2px solid #0e7490; }
        .sayfa:after { right: 0; border-left: 2px solid #0e7490; }
        .kemer { position: relative; background: #1e40af; color: #f8fafc; border-radius: 50% 50% 0 0 / 34mm 34mm 0 0; padding: 14mm 12mm 7mm 12mm; text-align: center; border: 3px solid #0e7490; box-shadow: inset 0 0 0 5px #fdfbf5, inset 0 0 0 7px #c0392b; }
        .kemer .unvan { font-family: 'Palatino Linotype', 'Book Antiqua', Georgia, serif; font-size: 25px; letter-spacing: 3px; }
        .kemer .adr { font-size: 8.5px; color: #bfdbfe; line-height: 1.5; margin-top: 3px; }
        .kemer h1 { margin: 6px 0 0 0; font-family: 'Palatino Linotype', Georgia, serif; font-weight: 400; font-size: 13px; letter-spacing: 5px; color: #fde68a; }
        .kemer .lale { position: absolute; bottom: 5mm; width: 26px; height: 40px; }
        .serit { height: 14px; background-image: url("${cini}"); background-size: 14px 14px; border-top: 2px solid #0e7490; border-bottom: 2px solid #0e7490; }
        .ic { padding: 0 2mm; }
        .ust { display: flex; gap: 10px; margin-top: 9px; }
        .ust > div { flex: 1; border: 1.5px solid #0e7490; border-radius: 6px; padding: 6px 10px; background: #ffffff; line-height: 1.55; position: relative; }
        .ust .k { position: absolute; top: -8px; left: 10px; background: #fdfbf5; padding: 0 6px; font-size: 8px; letter-spacing: 2px; color: #c0392b; font-weight: 800; }
        .ust .ad { font-family: 'Palatino Linotype', Georgia, serif; font-size: 14px; color: #1e40af; }
        .ust table { border-collapse: collapse; width: 100%; }
        .ust td { padding: 1.5px 0; }
        .ust td.d { text-align: right; font-weight: 700; }
        .ust .qrk { flex: 0 0 auto; display: flex; align-items: center; }
        .urunler { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
        .urun { background: #ffffff; border: 1.5px solid #1e40af; border-radius: 50% 50% 6px 6px / 22mm 22mm 6px 6px; overflow: hidden; text-align: center; }
        .urun .kumas { height: 26mm; background-image: repeating-linear-gradient(90deg, rgba(255,255,255,.22) 0 2px, transparent 2px 7px), repeating-linear-gradient(0deg, rgba(0,0,0,.08) 0 1px, transparent 1px 4px); display: flex; align-items: flex-end; justify-content: center; color: #ffffff; font-family: 'Palatino Linotype', Georgia, serif; font-size: 22px; padding-bottom: 4px; text-shadow: 0 1px 2px rgba(0,0,0,.35); }
        .urun .gov { padding: 6px 8px 8px 8px; }
        .urun b { display: block; font-family: 'Palatino Linotype', Georgia, serif; font-size: 12.5px; color: #1e40af; }
        .urun i { display: block; color: #475569; font-size: 9px; }
        .urun .det { font-size: 8.5px; color: #334155; margin-top: 4px; line-height: 1.5; }
        .urun .tut { margin-top: 5px; border-top: 1px dashed #0e7490; padding-top: 4px; }
        .urun .tut strong { display: block; color: #c0392b; font-size: 13px; }
        .alt { display: flex; gap: 10px; margin-top: 12px; align-items: flex-start; }
        .alt .sol { flex: 1; font-size: 9px; line-height: 1.6; }
        .alt .sol .kargo { border: 1.5px dashed #0e7490; border-radius: 6px; padding: 6px 10px; background: #ecfeff; margin-bottom: 7px; }
        .alt .sol .kargo b { font-family: Consolas, monospace; color: #1e40af; font-size: 11.5px; }
        .alt .sol .yalniz { font-family: 'Palatino Linotype', Georgia, serif; font-style: italic; font-size: 11px; color: #1e40af; }
        .toplam { width: 74mm; background: #ffffff; border: 1.5px solid #1e40af; border-radius: 6px; overflow: hidden; }
        .toplam table { width: 100%; border-collapse: collapse; }
        .toplam td { padding: 3px 9px; border-bottom: 1px solid #e0f2fe; }
        .toplam td.t { text-align: right; font-weight: 700; }
        .toplam tr.ist td { color: #0e7490; }
        .toplam .od { background: #1e40af; color: #fde68a; padding: 8px 10px; text-align: center; }
        .toplam .od b { display: block; font-family: 'Palatino Linotype', Georgia, serif; font-size: 22px; color: #ffffff; font-weight: 400; }
        .toplam .tl { font-size: 8.5px; text-align: center; color: #475569; padding: 3px; }`,
    body: `
<div class="sayfa">
    <div class="kemer">
        <img class="lale" alt="" style="left:12mm" src="${lale}"/><img class="lale" alt="" style="right:12mm" src="${lale}"/>
        ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fdfbf5"/><circle cx="32" cy="32" r="26" fill="none" stroke="#0e7490" stroke-width="2"/><path d="M32 12 Q40 24 32 32 Q24 24 32 12 Z M32 52 Q40 40 32 32 Q24 40 32 52 Z M12 32 Q24 24 32 32 Q24 40 12 32 Z M52 32 Q40 24 32 32 Q40 40 52 32 Z" fill="#1e40af"/><circle cx="32" cy="32" r="4" fill="#c0392b"/></svg>', 54, 54)}
        ${each(SUP, `<div class="unvan">${pName}</div><div class="adr">${v("concat(cac:Person/cbc:FirstName,' ',cac:Person/cbc:FamilyName)")}${t(' · ')}${pAddr()}<br/>${pTax()}${t(' · ')}${pContact()}</div>`)}
        <h1>${t('E-ARŞİV FATURA · MİKRO İHRACAT')}</h1>
    </div>
    <div class="serit"></div>
    <div class="ic">
        <div class="ust">
            <div>
                <div class="k">${t('FATURA')}</div>
                <table>
                    <tr><td>${t('No')}</td><td class="d">${v('$f/cbc:ID')}</td></tr>
                    <tr><td>${t('Tarih')}</td><td class="d">${tarih}</td></tr>
                    <tr><td>${t('Senaryo / Tip')}</td><td class="d">${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:InvoiceTypeCode')}</td></tr>
                    <tr><td>${t('Sipariş')}</td><td class="d">${v('$f/cac:OrderReference/cbc:ID')}</td></tr>
                    <tr><td>${t('ETGB')}</td><td class="d">${v(`${etgb}/cbc:ID`)}</td></tr>
                    <tr><td>${t('Kur')}</td><td class="d">${kur}</td></tr>
                </table>
            </div>
            <div>
                <div class="k">${t('ALICI · BUYER')}</div>
                ${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pContact()}<br/>${t('VKN ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='VKN']")}${t(' (yurt dışı alıcı)')}`)}
                <div style="margin-top:3px;color:#475569">${t('Ödeme: ')}${odeme}</div>
            </div>
            <div class="qrk">${qr(96)}</div>
        </div>
        <div class="urunler">
            ${each('$f/cac:InvoiceLine', `<div class="urun">
                <div class="kumas">${attr('style', `background-color:${v(P('RENKKOD'))}`)}${v('cbc:ID')}</div>
                <div class="gov">
                    <b>${v('cac:Item/cbc:Name')}</b><i>${v('cac:Item/cbc:Description')}</i>
                    <div class="det">${v(P('DOKUMA'))}<br/>${v(P('EBAT'))}${t(' · ')}${v(P('RENK'))}<br/>${t('GTİP ')}${gtip(P('GTIP'))}</div>
                    <div class="tut">${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}${t(' × ')}${num('cac:Price/cbc:PriceAmount')}<strong>${num('cbc:LineExtensionAmount')}${t(' ')}${v('$pb')}</strong></div>
                </div>
            </div>`)}
        </div>
        <div class="alt">
            <div class="sol">
                <div class="kargo">${t('Gönderi: ')}${carrier}${t(' · ')}${gonderim}<br/>${t('Takip ')}<b>${takip}</b><br/>${dAddr}</div>
                ${yalniz(`<div class="yalniz">${v('.')}</div>`)}
                ${notes(`${t('❀ ')}${v('.')}<br/>`)}
                <div style="font-family:Consolas,monospace;font-size:8px;color:#64748b;margin-top:4px">${t('ETTN ')}${v('$f/cbc:UUID')}</div>
            </div>
            <div class="toplam">
                <table>${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
                <div class="od">${t('ÖDENEN · TOTAL')}<b>${num(`${LMT}/cbc:PayableAmount`)}${t(' ')}${v('$pb')}</b></div>
                <div class="tl">${t('TL karşılığı ')}${tlKarsilik()}${t(' TL')}</div>
            </div>
        </div>
    </div>
    <div class="serit" style="margin-top:12px"></div>
</div>`,
});

/* ================================================================ 5. Abiye elbise — İngiltere (dantel, kişiye özel ölçü) */

const defne = {
    web: 'https://www.atelierdefne.com',
    ids: [['VKN', '0817263945'], ['MERSISNO', '0081726394500012']],
    name: 'Atelier Defne Abiye Moda Ltd. Şti.',
    addr: adr('Nişantaşı Mah. Abdi İpekçi Cad.', '42/3', 'Şişli', 'İstanbul', '34367'),
    vd: 'Şişli', tel: '+90 212 296 18 42', mail: 'couture@atelierdefne.com',
};
const m5 = {
    id: 'abiye-elbise-mikro',
    xml: invoice({
        comment: `Hazır şablon örneği: Kişiye özel ölçülü abiye elbisenin İngiltere'deki bireysel alıcıya mikro ihracatı (ETGB) — EARSIVFATURA · ISTISNA (301), GBP.
            Satırda GOGUS, BEL, BASEN, BOY (cm) ölçü ek tanımları, KUMAS, RENK, GTIP; FedEx ekspres gönderi.`,
        profile: 'EARSIVFATURA', type: 'ISTISNA', id: 'ADF2026000000371', date: '2026-10-07', time: '17:10:00', currency: 'GBP', rate: 57.284,
        notes: [MIKRO_NOT, 'Elbise müşteri ölçülerine göre dikilmiştir; kişiye özel ürünlerde cayma hakkı uygulanmaz.'],
        order: { id: 'AD-UK-0371', date: '2026-09-12' },
        docs: [{ id: '26341300EX009245', date: '2026-10-07', type: 'ETGB', desc: 'Elektronik Ticaret Gümrük Beyannamesi' }],
        supplier: defne, exemption: EXEMPT,
        customer: yabanci('Charlotte', 'Evans', { street: 'Wilmslow Road', no: '77', district: 'Didsbury', city: 'Manchester', zip: 'M20 5WG', cc: 'GB', country: 'Birleşik Krallık' }, '+44 161 555 0129', 'charlotte.evans@example.com'),
        delivery: {
            tracking: '7731 4482 0916', date: '2026-10-08', time: '14:00:00',
            carrier: { ids: [['VKN', '3880530286']], name: 'FedEx Express', addr: { district: 'Esenyurt', city: 'İstanbul' } },
            addr: { street: 'Wilmslow Road', no: '77', district: 'Didsbury', city: 'Manchester', zip: 'M20 5WG', cc: 'GB', country: 'Birleşik Krallık' },
        },
        payment: { code: '48', due: '2026-09-12', note: 'Kredi kartı · %50 kapora + %50 teslimden önce · Ödeme aracısı: PayTR' },
        lines: [
            { name: 'Dantel işlemeli abiye elbise', desc: 'Made-to-measure lace evening gown', sid: 'AD-EG-2611', unit: 'C62', qty: 1, price: 1180, props: { GOGUS: '88', BEL: '68', BASEN: '96', BOY: '168', KUMAS: 'Fransız danteli · ipek astar', RENK: 'Şampanya', GTIP: '620443000000' } },
            { name: 'Tül bolero', desc: 'Embroidered tulle bolero', sid: 'AD-BL-0412', unit: 'C62', qty: 1, price: 220, props: { KUMAS: 'İşlemeli tül', RENK: 'Şampanya', GTIP: '620433000000' } },
            { name: 'Saten clutch çanta', desc: 'Satin clutch with crystal clasp', sid: 'AD-CL-0207', unit: 'C62', qty: 1, price: 95, props: { KUMAS: 'İpek saten', RENK: 'Altın', GTIP: '420232000000' } },
        ],
    }),
};
const siluet = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 220" fill="none" stroke="#8a6d3b" stroke-width="1.4">
    <path d="M48 14 Q60 26 72 14 L78 30 Q74 52 70 62 Q82 110 104 206 H16 Q38 110 50 62 Q46 52 42 30 Z" fill="#f7ecdb"/>
    <path d="M43 32 Q60 40 77 32" stroke-dasharray="3 2"/>
    <path d="M50 62 Q60 66 70 62" stroke-dasharray="3 2"/>
    <path d="M45 96 Q60 102 75 96" stroke-dasharray="3 2"/>
    <path d="M42 35 H12 M49 63 H12 M44 97 H12" stroke="#c2a36b" stroke-width=".8"/>
    <path d="M110 14 V206 M106 14 H114 M106 206 H114" stroke="#c2a36b" stroke-width=".8"/>
    <path d="M16 206 Q24 198 32 206 Q40 198 48 206 Q56 198 64 206 Q72 198 80 206 Q88 198 96 206 Q100 202 104 206" stroke="#c2a36b"/></svg>`);
m5.xslt = xslt({
    title: 'e-Arşiv Fatura (Mikro İhracat)',
    comment: `Atelier Defne — İngiltere'ye kişiye özel abiye elbise mikro ihracatı e-Arşiv faturası. Gelinlik / abiye butiği konsepti:
        şampanya zemin, dantel fistolu (scallop) üst ve alt kenar, altın el yazısı başlık, elbise silüeti üzerinde müşteri ölçüleri
        (GOGUS, BEL, BASEN, BOY ek tanımları), kumaş ve renk bilgisi, FedEx ve ETGB bilgisi.`,
    css: `
        body { background: #e8dcc8; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #3b2f22; }
        .sayfa { background: #fbf6ee; padding: 15mm 14mm 14mm 14mm; }
        .fisto { position: absolute; left: 0; right: 0; height: 14px; background-image: radial-gradient(circle at 10px 0, transparent 7px, #efe1c9 7.5px, #efe1c9 10px, transparent 10.5px), radial-gradient(circle at 10px 0, #fbf6ee 3px, transparent 3.5px); background-size: 20px 14px; }
        .fisto.ust { top: 0; background-image: radial-gradient(circle at 10px 14px, #efe1c9 9px, transparent 9.5px), radial-gradient(circle at 10px 10px, #fbf6ee 2px, transparent 2.5px); height: 14px; background-color: transparent; }
        .fisto.alt { bottom: 0; background-image: radial-gradient(circle at 10px 0, #efe1c9 9px, transparent 9.5px), radial-gradient(circle at 10px 4px, #fbf6ee 2px, transparent 2.5px); }
        .bant { position: absolute; left: 0; right: 0; height: 6mm; background: #efe1c9; }
        .script { font-family: 'Edwardian Script ITC', 'Segoe Script', 'Snell Roundhand', 'Brush Script MT', cursive; }
        .bas { text-align: center; position: relative; }
        .bas .marka { font-size: 44px; color: #a07c3b; line-height: 1; }
        .bas .unvan { font-size: 9px; letter-spacing: 4px; color: #8a6d3b; margin-top: 2px; }
        .bas .adr { font-size: 8.5px; color: #7c6a55; margin-top: 3px; line-height: 1.5; }
        .bas .qr { position: absolute; right: 0; top: 0; background: #ffffff; padding: 4px; border: 1px solid #e3cfa9; }
        .cizgi { display: flex; align-items: center; gap: 10px; margin: 8px 0; color: #c2a36b; font-size: 9px; letter-spacing: 4px; }
        .cizgi:before, .cizgi:after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #c2a36b, transparent); }
        .bilgi { display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; border-top: 1px solid #e3cfa9; border-bottom: 1px solid #e3cfa9; }
        .bilgi > div { padding: 6px 4px; }
        .bilgi > div + div { border-left: 1px solid #efe1c9; }
        .k { font-size: 7px; letter-spacing: 2px; color: #a07c3b; text-transform: uppercase; }
        .bilgi b { display: block; font-size: 10.5px; font-weight: 600; margin-top: 2px; }
        .orta { display: flex; gap: 12px; margin-top: 10px; }
        .olcu { width: 64mm; position: relative; background: #ffffff; border: 1px solid #e3cfa9; border-radius: 50% 50% 4px 4px / 16mm 16mm 4px 4px; padding: 10px 8px 8px 8px; text-align: center; }
        .olcu .kutu { position: relative; width: 120px; height: 220px; margin: 4px auto 0 auto; }
        .olcu .e { position: absolute; width: 46px; font-size: 8.5px; color: #3b2f22; text-align: right; line-height: 1.1; }
        .olcu .e b { display: block; font-size: 12px; color: #a07c3b; }
        .sag { flex: 1; }
        .kart { background: #ffffff; border: 1px solid #e3cfa9; border-radius: 4px; padding: 7px 10px; line-height: 1.55; margin-bottom: 9px; }
        .kart .ad { font-family: 'Palatino Linotype', Georgia, serif; font-size: 15px; color: #6b5330; }
        .urun { display: flex; align-items: baseline; gap: 8px; padding: 6px 0; border-bottom: 1px dotted #e3cfa9; }
        .urun:last-child { border-bottom: 0; }
        .urun .ad { flex: 1; }
        .urun .ad b { font-family: 'Palatino Linotype', Georgia, serif; font-size: 13px; font-weight: 400; color: #3b2f22; }
        .urun .ad i { display: block; color: #8a7760; }
        .urun .ad small { color: #8a6d3b; font-size: 8.5px; }
        .urun .tt { white-space: nowrap; text-align: right; }
        .urun .tt b { display: block; font-size: 12px; }
        .alt { display: flex; gap: 12px; margin-top: 4px; align-items: flex-start; }
        .alt .sol { flex: 1; font-size: 9px; line-height: 1.6; color: #5b4a36; }
        .alt .sol .yalniz { font-family: 'Palatino Linotype', Georgia, serif; font-style: italic; font-size: 11px; color: #6b5330; }
        .toplam { width: 74mm; }
        .toplam table { width: 100%; border-collapse: collapse; }
        .toplam td { padding: 3px 0; border-bottom: 1px solid #efe1c9; }
        .toplam td.t { text-align: right; }
        .toplam .od { text-align: center; margin-top: 6px; border: 1px solid #c2a36b; padding: 7px; position: relative; }
        .toplam .od:before { content: ''; position: absolute; inset: 3px; border: 1px solid #efe1c9; }
        .toplam .od b { display: block; font-family: 'Palatino Linotype', Georgia, serif; font-size: 23px; font-weight: 400; color: #6b5330; }
        .toplam .od .script { font-size: 22px; color: #a07c3b; }
        .imza { text-align: right; margin-top: 10px; font-size: 26px; color: #a07c3b; }`,
    body: `
<div class="sayfa">
    <div class="bant" style="top:0"></div><div class="fisto alt" style="top:6mm"></div>
    <div class="bant" style="bottom:0"></div><div class="fisto ust" style="bottom:6mm;top:auto"></div>
    <div class="bas">
        ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="#c2a36b" stroke-width="1.2"/><path d="M26 14 Q32 20 38 14 L40 22 Q38 28 36 31 Q42 44 48 52 H16 Q22 44 28 31 Q26 28 24 22 Z" fill="#efe1c9" stroke="#a07c3b" stroke-width="1.2"/></svg>', 46, 46)}
        <div class="marka script">${t('Atelier Defne')}</div>
        ${each(SUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}${t(' · ')}${pContact()}</div>`)}
        <div class="qr">${qr(78)}</div>
    </div>
    <div class="cizgi">${t('E-ARŞİV FATURA · MİKRO İHRACAT')}</div>
    <div class="bilgi">
        <div><span class="k">${t('Fatura No')}</span><b>${v('$f/cbc:ID')}</b></div>
        <div><span class="k">${t('Tarih')}</span><b>${tarih}</b></div>
        <div><span class="k">${t('ETGB')}</span><b>${v(`${etgb}/cbc:ID`)}</b></div>
        <div><span class="k">${t('Kur')}</span><b>${kur}</b></div>
    </div>
    <div class="orta">
        <div class="olcu">
            <span class="k">${t('Kişiye özel ölçüler · cm')}</span>
            ${each(`$f/cac:InvoiceLine[${P('GOGUS')}][1]`, `<div class="kutu">
                <img alt="" width="120" height="220" src="${siluet}"/>
                <div class="e" style="left:-38px;top:22px">${t('Göğüs')}<b>${v(P('GOGUS'))}</b></div>
                <div class="e" style="left:-38px;top:50px">${t('Bel')}<b>${v(P('BEL'))}</b></div>
                <div class="e" style="left:-38px;top:84px">${t('Basen')}<b>${v(P('BASEN'))}</b></div>
                <div class="e" style="right:-42px;top:100px;text-align:left">${t('Boy')}<b>${v(P('BOY'))}</b></div>
            </div>
            <div style="font-size:8.5px;color:#8a6d3b;margin-top:2px">${v(P('KUMAS'))}${t(' · ')}${v(P('RENK'))}</div>`)}
        </div>
        <div class="sag">
            <div class="kart">
                <span class="k">${t('Alıcı · Client')}</span>
                ${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pContact()}<br/>${t('VKN ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='VKN']")}${t(' (yurt dışı alıcı)')}`)}
            </div>
            <div class="kart">
                <span class="k">${t('Gönderi · Delivery')}</span><br/>
                ${carrier}${t(' · ')}${gonderim}${t(' · Takip ')}<b style="font-family:Consolas,monospace">${takip}</b><br/>${dAddr}<br/>
                <span style="color:#8a7760">${t('Sipariş ')}${v('$f/cac:OrderReference/cbc:ID')}${t(' · ')}${dt('$f/cac:OrderReference/cbc:IssueDate')}${t(' · ')}${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:InvoiceTypeCode')}</span>
            </div>
            <div class="kart">
                ${each('$f/cac:InvoiceLine', `<div class="urun">
                    <div class="ad"><b>${v('cac:Item/cbc:Name')}</b><i>${v('cac:Item/cbc:Description')}</i><small>${v(P('KUMAS'))}${t(' · ')}${v(P('RENK'))}${t(' · GTİP ')}${gtip(P('GTIP'))}</small></div>
                    <div class="tt">${int('cbc:InvoicedQuantity')}${t(' × ')}${num('cac:Price/cbc:PriceAmount')}<b>${num('cbc:LineExtensionAmount')}${t(' ')}${v('$pb')}</b></div>
                </div>`)}
            </div>
        </div>
    </div>
    <div class="alt">
        <div class="sol">
            ${yalniz(`<div class="yalniz">${v('.')}</div>`)}
            ${notes(`${t('◆ ')}${v('.')}<br/>`)}
            ${t('Ödeme: ')}${odeme}
            <div style="font-family:Consolas,monospace;font-size:8px;color:#8a7760;margin-top:4px">${t('ETTN ')}${v('$f/cbc:UUID')}</div>
        </div>
        <div class="toplam">
            <table>${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
            <div class="od"><span class="script">${t('Toplam')}</span><b>${num(`${LMT}/cbc:PayableAmount`)}${t(' ')}${v('$pb')}</b><span class="k">${t('≈ ')}${tlKarsilik()}${t(' TL')}</span></div>
        </div>
    </div>
    <div class="imza script">${t('with love, Defne')}</div>
</div>`,
});

export default [m1, m2, m3, m4, m5];
