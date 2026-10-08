import {
    invoice, xslt, v, t, num, int, dt, unit, iban, each, iff, choose, attr, P, PS, money, pName, pAddr, pTax, pContact,
    SUP, CUS, LMT, yalniz, notes, totals, bank, qr, logo, svg,
} from './lib.mjs';

const adr = (street, no, district, city, zip) => ({ street, no, district, city, zip });

/* ================================================================ 1. Ayakkabı toptan seri (asorti) */

const adim = {
    web: 'https://www.adimadimayakkabi.com.tr',
    ids: [['VKN', '0047382916'], ['MERSISNO', '0004738291600019']],
    name: 'Adım Adım Ayakkabı İmalat San. ve Tic. Ltd. Şti.',
    addr: adr('Işıkkent Ayakkabıcılar Sitesi 7. Blok', '14', 'Bornova', 'İzmir', '35070'),
    vd: 'Bornova', tel: '0232 472 18 40', mail: 'satis@adimadimayakkabi.com.tr',
};
const kaldirim = {
    ids: [['VKN', '4910283746']],
    name: 'Kaldırım Ayakkabı Mağazacılık A.Ş.',
    addr: adr('Kızılay Mah. Atatürk Bulvarı', '88/4', 'Çankaya', 'Ankara', '06420'),
    vd: 'Kavaklıdere', tel: '0312 418 22 60', mail: 'satinalma@kaldirimayakkabi.com.tr',
};
const asorti = (from, counts) => Object.fromEntries(counts.map((c, i) => [`NUMARA-${from + i}`, String(c)]));
const seri = (seriSayisi, renk, malzeme, from, counts) => ({
    RENK: renk, MALZEME: malzeme, SERIADET: String(seriSayisi), SERICIFT: String(counts.reduce((a, b) => a + b, 0)), ...asorti(from, counts),
});

const f1 = {
    id: 'ayakkabi-toptan-seri-fatura',
    xml: invoice({
        comment: `Hazır şablon örneği: Ayakkabı imalatçısının mağaza zincirine toptan seri (asorti) satışı — TICARIFATURA · SATIS, KDV %10.
            Satırda seri dağılımı: AdditionalItemIdentification NUMARA-36 … NUMARA-45 (seri başına çift), SERIADET, SERICIFT, RENK, MALZEME.`,
        profile: 'TICARIFATURA', type: 'SATIS', id: 'ADM2026000001847', date: '2026-10-07', time: '14:20:00',
        notes: ['Ayakkabılar 12\'li / 10\'lu seri kolilerde, numara etiketli kutularda teslim edilir.', 'Defolu ürün iadesi teslimden itibaren 15 gün içinde kabul edilir.'],
        order: { id: 'KLD-SA-26-0912', date: '2026-09-18' },
        despatch: [{ id: 'ADI2026000003310', date: '2026-10-07' }],
        supplier: adim, customer: kaldirim,
        payment: { code: '42', due: '2026-12-06', iban: 'TR320001500158007301462519', bank: 'Vakıfbank — Işıkkent Şubesi' },
        terms: '60 gün vadeli · Vade sonrası aylık %3 vade farkı uygulanır.',
        lines: [
            { name: 'Klasik Bağcıklı Erkek Ayakkabı', desc: 'Saya hakiki dana deri, termo kösele taban', model: 'BSM-2214', unit: 'PR', qty: 120, price: 1150, kdv: 10, props: seri(10, 'Siyah', 'Dana deri · Termo', 40, [1, 2, 3, 3, 2, 1]) },
            { name: 'Erkek Loafer', desc: 'Süet saya, deri astar, kauçuk taban', model: 'BSM-2231', unit: 'PR', qty: 80, price: 1290, kdv: 10, props: seri(8, 'Taba', 'Süet · Kauçuk', 40, [1, 2, 2, 2, 2, 1]) },
            { name: 'Kadın Stiletto 9 cm', desc: 'Rugan saya, deri iç taban', model: 'KDN-118', unit: 'PR', qty: 72, price: 980, kdv: 10, props: seri(6, 'Bordo', 'Rugan · Deri', 36, [1, 2, 3, 3, 2, 1]) },
            { name: 'Kadın Babet', desc: 'Nubuk saya, ortopedik iç taban', model: 'KDN-140', unit: 'PR', qty: 100, price: 690, kdv: 10, props: seri(10, 'Bej', 'Nubuk · EVA', 36, [1, 2, 2, 2, 2, 1]) },
            { name: 'Çocuk Spor Ayakkabı', desc: 'Cırt cırtlı, ışıklı taban', model: 'ÇCK-07', unit: 'PR', qty: 60, price: 540, kdv: 10, disc: { rate: 0.05, reason: 'Sezon açılış iskontosu' }, props: seri(6, 'Lacivert', 'Tekstil · PVC', 28, [2, 2, 2, 2, 1, 1]) },
        ],
    }),
};
f1.xslt = xslt({
    title: 'Toptan Seri Faturası',
    comment: `Adım Adım Ayakkabı — toptan seri (asorti) satış e-Faturası. Ayakkabı kutusu konsepti: kraft karton zemin, kutu etiketi
        biçiminde fatura kartı, her model için kutu-etiketli satır ve numara asorti ızgarası (NUMARA-xx), seri × çift hesabı, şablon harfli toplam.`,
    css: `
        body { background: #6b5139; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; color: #1c1917; }
        .sayfa { background-color: #c9a678; background-image: repeating-linear-gradient(90deg, rgba(92,64,36,.06) 0 1px, transparent 1px 7px), repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 2px, transparent 2px 9px); padding: 10mm 11mm 9mm 11mm; }
        .ust { display: flex; gap: 12px; align-items: stretch; }
        .marka { flex: 1; display: flex; gap: 12px; align-items: flex-start; }
        .unvan { font-family: 'Arial Black', 'Segoe UI', sans-serif; font-size: 17px; line-height: 1.15; text-transform: uppercase; letter-spacing: -.2px; }
        .adr { margin-top: 5px; line-height: 1.55; color: #3f2d1c; font-size: 9.5px; }
        .damga { display: inline-block; margin-top: 8px; border: 2.5px solid #1c1917; padding: 3px 10px; font-family: 'Arial Black', sans-serif; font-size: 20px; letter-spacing: 3px; transform: rotate(-2deg); }
        .damga small { display: block; font-family: 'Segoe UI', sans-serif; font-size: 8.5px; letter-spacing: 2px; font-weight: 700; }
        .etiket { width: 76mm; background: #fffdf8; border: 2px solid #1c1917; box-shadow: 3px 3px 0 rgba(28,25,23,.35); display: flex; }
        .etiket .bas { writing-mode: vertical-rl; transform: rotate(180deg); background: #1c1917; color: #fbbf24; font-family: 'Arial Black', sans-serif; letter-spacing: 3px; font-size: 11px; text-align: center; padding: 6px 4px; }
        .etiket table { border-collapse: collapse; flex: 1; }
        .etiket td { border-bottom: 1px solid #1c1917; padding: 3px 6px; }
        .etiket td.k { font-size: 7.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; width: 26mm; border-right: 1px solid #1c1917; }
        .etiket td.d { font-weight: 800; font-size: 10.5px; }
        .etiket td.ettn { font-family: Consolas, monospace; font-size: 7.5px; font-weight: 400; }
        .etiket .qr { padding: 5px; border-left: 2px solid #1c1917; display: flex; align-items: center; background: #ffffff; }
        .ozet { display: flex; margin: 11px 0 9px 0; background: #1c1917; color: #fffdf8; }
        .ozet > div { flex: 1; padding: 6px 10px; border-right: 1px dashed rgba(255,253,248,.35); }
        .ozet > div:last-child { border-right: 0; }
        .ozet .k { font-size: 7.5px; letter-spacing: 1.5px; text-transform: uppercase; color: #fbbf24; font-weight: 800; }
        .ozet .v { font-family: 'Arial Black', sans-serif; font-size: 15px; }
        .taraf { display: flex; gap: 10px; }
        .kart { flex: 1; background: #fffdf8; border: 2px solid #1c1917; padding: 7px 10px; line-height: 1.5; position: relative; }
        .kart:before { content: ''; position: absolute; top: -7px; left: 40%; width: 46px; height: 13px; background: rgba(250,204,21,.65); transform: rotate(-3deg); }
        .kart .k { font-size: 7.5px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 800; color: #78350f; }
        .kart .ad { font-weight: 800; font-size: 12px; }
        .kutu { display: flex; background: #fffdf8; border: 2px solid #1c1917; margin-top: 8px; }
        .kutu .no { width: 15mm; background: #1c1917; color: #fffdf8; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px; }
        .kutu .no b { font-family: 'Arial Black', sans-serif; font-size: 19px; color: #fbbf24; line-height: 1; }
        .kutu .no span { font-size: 7px; letter-spacing: 1px; margin-top: 3px; }
        .kutu .govde { flex: 1; padding: 6px 9px; }
        .kutu .model { font-family: Consolas, monospace; font-weight: 700; font-size: 9px; border: 1.5px solid #1c1917; padding: 0 5px; }
        .kutu .ad { font-weight: 800; font-size: 11.5px; margin-left: 6px; }
        .kutu .acik { color: #57534e; font-size: 9px; margin-top: 2px; }
        .kutu .renk { display: inline-block; margin-top: 4px; font-size: 8.5px; font-weight: 700; background: #f5e9d7; padding: 1px 7px; border-radius: 8px; }
        .asorti { display: inline-flex; margin-top: 4px; border: 1.5px solid #1c1917; }
        .asorti span { min-width: 25px; text-align: center; border-right: 1px solid #1c1917; font-weight: 800; font-size: 10px; }
        .asorti span:last-child { border-right: 0; }
        .asorti em { display: block; font-style: normal; background: #1c1917; color: #fffdf8; font-size: 8px; padding: 1px 0; }
        .kutu .hesap { width: 47mm; border-left: 2px dashed #1c1917; padding: 6px 9px; text-align: right; }
        .kutu .hesap .x { font-size: 9px; color: #57534e; }
        .kutu .hesap .cift { font-family: 'Arial Black', sans-serif; font-size: 15px; }
        .kutu .hesap .isk { color: #b45309; font-size: 8.5px; font-weight: 700; }
        .kutu .hesap .tut { font-weight: 800; font-size: 12px; border-top: 1px solid #d6c3a5; margin-top: 3px; padding-top: 2px; }
        .alt { display: flex; gap: 12px; margin-top: 12px; align-items: flex-start; }
        .alt .sol { flex: 1; }
        .yalniz { background: #fffdf8; border: 2px solid #1c1917; padding: 5px 9px; font-weight: 800; font-style: italic; }
        .notlar { margin: 8px 0; padding-left: 16px; line-height: 1.5; }
        .banka { background: #fffdf8; border: 2px dashed #1c1917; padding: 6px 10px; }
        .banka .ib { font-family: Consolas, monospace; font-size: 11.5px; font-weight: 700; }
        .alt .sag { width: 80mm; }
        table.top { width: 100%; border-collapse: collapse; background: #fffdf8; border: 2px solid #1c1917; }
        table.top td { padding: 4px 8px; border-bottom: 1px solid #e7d8c0; }
        table.top td.t { text-align: right; font-weight: 700; white-space: nowrap; }
        table.top tr.isk td { color: #b45309; }
        table.top tr.ara td { border-top: 2px solid #1c1917; font-weight: 800; }
        .odenecek { background: #1c1917; color: #fbbf24; margin-top: 6px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; font-family: 'Arial Black', sans-serif; letter-spacing: 1px; }
        .odenecek .v { font-size: 19px; color: #fffdf8; }
        .dip { margin-top: 10px; font-size: 8.5px; color: #3f2d1c; border-top: 2px solid #1c1917; padding-top: 5px; }`,
    body: `
<div class="sayfa">
    <div class="ust">
        <div class="marka">
            ${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#1c1917"/><path d="M9 43 L9 31 Q21 31 27 22 L35 22 Q39 31 51 33 Q57 34 57 43 Z" fill="#fbbf24"/><rect x="9" y="43" width="48" height="5" fill="#fffdf8"/><circle cx="31" cy="27" r="1.6" fill="#1c1917"/><circle cx="35" cy="30" r="1.6" fill="#1c1917"/></svg>`, 62, 62)}
            <div>
                ${each(SUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div>`)}
                <div class="damga">${t('FATURA')}<small>${t('TOPTAN SERİ SATIŞ')}</small></div>
            </div>
        </div>
        <div class="etiket">
            <div class="bas">${t('KUTU ETİKETİ')}</div>
            <table>
                <tr><td class="k">${t('Fatura No')}</td><td class="d">${v('$f/cbc:ID')}</td></tr>
                <tr><td class="k">${t('Tarih')}</td><td class="d">${dt('$f/cbc:IssueDate')}${t(' ')}${v('substring($f/cbc:IssueTime,1,5)')}</td></tr>
                <tr><td class="k">${t('Senaryo / Tip')}</td><td class="d">${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:InvoiceTypeCode')}</td></tr>
                <tr><td class="k">${t('Sipariş')}</td><td class="d">${v('$f/cac:OrderReference/cbc:ID')}</td></tr>
                <tr><td class="k">${t('İrsaliye')}</td><td class="d">${v('$f/cac:DespatchDocumentReference/cbc:ID')}</td></tr>
                <tr><td class="k" style="border-bottom:0">${t('ETTN')}</td><td class="d ettn" style="border-bottom:0">${v('$f/cbc:UUID')}</td></tr>
            </table>
            <div class="qr">${qr(78)}</div>
        </div>
    </div>
    <div class="ozet">
        <div><div class="k">${t('Model')}</div><div class="v">${v('count($f/cac:InvoiceLine)')}</div></div>
        <div><div class="k">${t('Seri / Koli')}</div><div class="v">${int(`sum($f/cac:InvoiceLine/${P('SERIADET')})`)}</div></div>
        <div><div class="k">${t('Toplam Çift')}</div><div class="v">${int('sum($f/cac:InvoiceLine/cbc:InvoicedQuantity)')}</div></div>
        <div><div class="k">${t('Ort. Çift Fiyatı')}</div><div class="v">${num(`${LMT}/cbc:TaxExclusiveAmount div sum($f/cac:InvoiceLine/cbc:InvoicedQuantity)`)}${t(' ')}${v('$pb')}</div></div>
        <div><div class="k">${t('Vade')}</div><div class="v">${dt('$f/cac:PaymentMeans/cbc:PaymentDueDate')}</div></div>
    </div>
    <div class="taraf">
        <div class="kart">
            <div class="k">${t('Sayın / Alıcı')}</div>
            ${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}
        </div>
        <div class="kart" style="flex:.7">
            <div class="k">${t('Ödeme Koşulu')}</div>
            <div class="ad">${v('$f/cac:PaymentTerms/cbc:Note')}</div>
        </div>
    </div>
    ${each('$f/cac:InvoiceLine', `
    <div class="kutu">
        <div class="no"><b>${v('cbc:ID')}</b><span>${t('MODEL')}</span></div>
        <div class="govde">
            <span class="model">${v('cac:Item/cbc:ModelName')}</span><span class="ad">${v('cac:Item/cbc:Name')}</span>
            <div class="acik">${v('cac:Item/cbc:Description')}${iff(P('MALZEME'), `${t(' · ')}${v(P('MALZEME'))}`)}</div>
            <span class="renk">${t('● ')}${v(P('RENK'))}</span><br/>
            <span class="asorti">${each(PS('NUMARA-'), `<span><em>${v("substring-after(@schemeID,'-')")}</em>${v('.')}</span>`)}</span>
        </div>
        <div class="hesap">
            <div class="x">${v(P('SERIADET'))}${t(' seri × ')}${v(P('SERICIFT'))}${t(' çift')}</div>
            <div class="cift">${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}</div>
            <div class="x">${t('× ')}${money('cac:Price/cbc:PriceAmount')}${t(' · KDV %')}${v('cac:TaxTotal/cac:TaxSubtotal/cbc:Percent')}</div>
            ${each('cac:AllowanceCharge', `<div class="isk">${v('cbc:AllowanceChargeReason')}${t(' −')}${money('cbc:Amount')}</div>`)}
            <div class="tut">${money('cbc:LineExtensionAmount')}</div>
        </div>
    </div>`)}
    <div class="alt">
        <div class="sol">
            ${yalniz(`<div class="yalniz">${v('.')}</div>`)}
            <ul class="notlar">${notes(`<li>${v('.')}</li>`)}</ul>
            ${bank(`<div class="banka"><b>${t('HAVALE / EFT')}</b>${t(' · ')}${v('cbc:PaymentNote')}<div class="ib">${iban('cbc:ID')}</div></div>`)}
        </div>
        <div class="sag">
            <table class="top">${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
            <div class="odenecek"><span>${t('ÖDENECEK')}</span><span class="v">${money(`${LMT}/cbc:PayableAmount`)}</span></div>
        </div>
    </div>
    <div class="dip">${t('Kutular numara etiketlidir; seri dağılımı kolinin yan yüzündeki etiketle aynıdır. Bu belge 213 sayılı VUK kapsamında elektronik ortamda düzenlenmiştir.')}</div>
</div>`,
});

/* ================================================================ 2. Ham deri (tevkifat 622 · 9/10) */

const aksu = {
    ids: [['VKN', '0216593047'], ['MERSISNO', '0021659304700015']],
    name: 'Aksu Ham Deri ve Post Ticaret Ltd. Şti.',
    addr: adr('Hasanağa OSB 4. Cad.', '9', 'Nilüfer', 'Bursa', '16225'),
    vd: 'Nilüfer', tel: '0224 411 07 52', mail: 'muhasebe@aksuhamderi.com.tr',
};
const seyhan = {
    web: 'https://www.seyhantabakhane.com.tr',
    ids: [['VKN', '7620194583']],
    name: 'Seyhan Tabakhane Deri Sanayi A.Ş.',
    addr: adr('Tuzla Deri OSB Mah. Kazlıçeşme Cad.', '31', 'Tuzla', 'İstanbul', '34957'),
    vd: 'Tuzla', tel: '0216 394 30 30', mail: 'satinalma@seyhantabakhane.com.tr',
};
const f2 = {
    id: 'ham-deri-tevkifat-fatura',
    xml: invoice({
        comment: `Hazır şablon örneği: Ham deri toplayıcısının tabakhaneye tuzlu ham deri teslimi — TICARIFATURA · TEVKIFAT,
            tevkifat kodu 622 (pamuk, tiftik, yün ve yapağı ile ham post ve deri teslimleri) 9/10.
            Satırda KALITE, CINS, ADET, ORTKG (ortalama kg / deri), MENSE ek tanımları.`,
        profile: 'TICARIFATURA', type: 'TEVKIFAT', id: 'AKS2026000000523', date: '2026-10-06', time: '16:45:00',
        notes: ['Deriler kesimden sonraki 24 saat içinde tuzlanmış, istif halinde 10 gün dinlendirilmiştir.', 'Kantar fişi no: K-26-10-0611 · Nem tespiti tabakhane laboratuvarında yapılmıştır.'],
        order: { id: 'STD-HD-0318', date: '2026-09-25' },
        despatch: [{ id: 'AKI2026000000611', date: '2026-10-06' }],
        supplier: aksu, customer: seyhan,
        withholding: { code: '622', name: 'Pamuk, Tiftik, Yün ve Yapağı ile Ham Post ve Deri Teslimleri', pct: 90 },
        payment: { code: '42', due: '2026-11-05', iban: 'TR710006400000116730184425', bank: 'Türkiye İş Bankası — Bursa Nilüfer Şubesi' },
        terms: '30 gün vadeli, kantar ve kalite tasnifi sonrası ödenir.',
        lines: [
            { name: 'Tuzlu Büyükbaş Ham Deri', desc: 'Dana, kasap kesimi, kafa-kuyruk alınmış', unit: 'KGM', qty: 9240, price: 38.5, props: { CINS: 'Büyükbaş · Dana', KALITE: 'A', ADET: '420', ORTKG: '22,0', MENSE: 'Bursa – Karacabey' } },
            { name: 'Tuzlu Büyükbaş Ham Deri', desc: 'Dana, nakil ve kene izli', unit: 'KGM', qty: 3780, price: 31, props: { CINS: 'Büyükbaş · Dana', KALITE: 'B', ADET: '180', ORTKG: '21,0', MENSE: 'Balıkesir' } },
            { name: 'Yapağılı Koyun Derisi', desc: 'Kıvırcık ırkı, yün boyu 2–3 cm', unit: 'C62', qty: 1200, price: 145, props: { CINS: 'Küçükbaş · Koyun', KALITE: 'A', ADET: '1200', ORTKG: '3,4', MENSE: 'Trakya' } },
            { name: 'Keçi Derisi', desc: 'Kıl keçisi, tuzlu, katlanmış', unit: 'C62', qty: 600, price: 120, props: { CINS: 'Küçükbaş · Keçi', KALITE: 'B', ADET: '600', ORTKG: '2,1', MENSE: 'Kütahya' } },
        ],
    }),
};
f2.xslt = xslt({
    title: 'Ham Deri Faturası',
    comment: `Aksu Ham Deri — tabakhaneye tuzlu ham deri teslim e-Faturası (TEVKIFAT 622 · 9/10). Tabakhane defteri konsepti:
        dikişli koyu deri başlık ve yaldızlı kabartma başlık, çizgili defter sayfası, kalite (A/B) mühür rozetleri, adet / kg özeti ve deri etiketli tevkifat kutusu.`,
    css: `
        body { background: #2a1a10; font-family: Georgia, 'Palatino Linotype', serif; font-size: 10.5px; color: #2b1b10; }
        .sayfa { background: #f6efe1; }
        .kapak { background-color: #4a2c1a; background-image: radial-gradient(rgba(0,0,0,.22) 1px, transparent 1.4px), radial-gradient(rgba(255,255,255,.05) 1px, transparent 1.6px); background-size: 5px 5px, 9px 9px; background-position: 0 0, 2px 3px; color: #f3e3c3; padding: 9mm 11mm 8mm 11mm; position: relative; }
        .kapak:after { content: ''; position: absolute; left: 5mm; right: 5mm; top: 4mm; bottom: 4mm; border: 1.5px dashed rgba(201,161,74,.7); border-radius: 6px; pointer-events: none; }
        .kapak .satir { display: flex; gap: 14px; align-items: center; }
        .kapak .unvan { font-size: 18px; font-weight: 700; color: #e8c879; letter-spacing: .4px; }
        .kapak .adr { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; color: #d9c4a0; line-height: 1.6; margin-top: 3px; }
        .kapak h1 { margin: 8px 0 0 0; text-align: center; font-size: 26px; letter-spacing: 7px; color: #e8c879; font-weight: 400; text-shadow: 0 1px 0 #000000, 0 -1px 0 rgba(255,236,190,.35); }
        .kapak .alt-baslik { text-align: center; font-style: italic; color: #d9c4a0; font-size: 10px; letter-spacing: 2px; }
        .defter { padding: 6mm 11mm 8mm 19mm; background-image: linear-gradient(90deg, transparent 13mm, rgba(185,28,28,.45) 13mm, rgba(185,28,28,.45) 13.3mm, transparent 13.3mm), repeating-linear-gradient(180deg, transparent 0 21px, rgba(120,90,60,.18) 21px 22px); }
        .bilgi { display: flex; gap: 10px; }
        .bilgi .kart { flex: 1; border: 1px solid #b89a6c; background: rgba(255,251,240,.85); padding: 6px 10px; line-height: 1.55; }
        .bilgi .k { font-variant: small-caps; letter-spacing: 1.5px; color: #7c4a1e; font-size: 10px; border-bottom: 1px solid #d9c6a3; margin-bottom: 3px; }
        .bilgi .ad { font-weight: 700; font-size: 12px; }
        .bilgi table { width: 100%; border-collapse: collapse; }
        .bilgi table td { padding: 1.5px 0; }
        .bilgi table td.d { text-align: right; font-weight: 700; font-family: 'Segoe UI', Arial, sans-serif; }
        .sayac { display: flex; margin: 10px 0; }
        .sayac > div { flex: 1; text-align: center; border-top: 2px solid #4a2c1a; border-bottom: 2px solid #4a2c1a; padding: 5px 0; }
        .sayac > div + div { border-left: 1px solid #b89a6c; }
        .sayac .v { font-size: 18px; font-weight: 700; color: #4a2c1a; }
        .sayac .k { font-variant: small-caps; letter-spacing: 1px; color: #7c4a1e; }
        table.kalem { width: 100%; border-collapse: collapse; }
        table.kalem th { font-variant: small-caps; letter-spacing: 1px; font-weight: 400; color: #7c4a1e; border-bottom: 2px double #4a2c1a; padding: 4px; text-align: left; font-size: 10.5px; }
        table.kalem td { padding: 6px 4px; border-bottom: 1px solid #d9c6a3; vertical-align: middle; }
        table.kalem .sag { text-align: right; white-space: nowrap; }
        table.kalem .ad { font-weight: 700; font-size: 11.5px; }
        table.kalem .acik { font-style: italic; color: #6b5641; font-size: 9.5px; }
        .muhur { display: inline-block; width: 30px; height: 30px; border-radius: 50%; text-align: center; line-height: 26px; font-weight: 700; font-size: 15px; border: 2px solid; box-shadow: inset 0 0 0 2px #f6efe1, inset 0 0 0 3px currentColor; }
        .muhur.A { color: #a16207; background: #fbe7b4; }
        .muhur.B { color: #57534e; background: #e7e5e4; }
        .cins { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5px; background: #4a2c1a; color: #f3e3c3; padding: 1px 6px; border-radius: 2px; }
        .alt { display: flex; gap: 14px; margin-top: 12px; }
        .alt .sol { flex: 1; }
        .yalniz { font-style: italic; font-weight: 700; color: #4a2c1a; border-left: 3px solid #a16207; padding: 3px 9px; }
        .notlar { padding-left: 16px; line-height: 1.55; }
        .tevk { position: relative; background: #4a2c1a; color: #f3e3c3; padding: 8px 12px 8px 26px; border-radius: 4px 14px 14px 4px; margin-top: 6px; }
        .tevk:before { content: ''; position: absolute; left: 9px; top: 50%; width: 9px; height: 9px; margin-top: -5px; border-radius: 50%; background: #f6efe1; box-shadow: 0 0 0 2px #c9a14a; }
        .tevk b { color: #e8c879; font-size: 12px; }
        .banka { border: 1px dashed #7c4a1e; padding: 6px 10px; margin-top: 8px; font-family: 'Segoe UI', Arial, sans-serif; }
        .banka .ib { font-family: Consolas, monospace; font-weight: 700; font-size: 11px; }
        .alt .sag { width: 78mm; }
        table.top { width: 100%; border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; }
        table.top td { padding: 4px 4px; border-bottom: 1px solid #d9c6a3; }
        table.top td.t { text-align: right; font-weight: 700; white-space: nowrap; }
        table.top tr.tvk td { color: #b91c1c; }
        table.top tr.ara td { border-top: 2px double #4a2c1a; font-weight: 700; }
        .odenecek { margin-top: 6px; border: 2px solid #4a2c1a; padding: 8px 12px; text-align: right; background: #fbe7b4; }
        .odenecek .k { font-variant: small-caps; letter-spacing: 2px; color: #7c4a1e; }
        .odenecek .v { font-size: 20px; font-weight: 700; }
        .dip { margin-top: 12px; border-top: 1px solid #b89a6c; padding-top: 5px; font-size: 8.5px; color: #6b5641; font-style: italic; }`,
    body: `
<div class="sayfa">
    <div class="kapak">
        <div class="satir">
            ${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#2b1b10" stroke="#c9a14a" stroke-width="2"/><path d="M32 9 Q38 15 46 12 Q46 21 52 25 Q47 31 51 39 Q44 41 43 50 Q37 48 32 55 Q27 48 21 50 Q20 41 13 39 Q17 31 12 25 Q18 21 18 12 Q26 15 32 9 Z" fill="#c9a14a"/><path d="M32 17 Q36 21 41 19 Q41 25 45 28 Q42 32 44 37 Q39 38 38 44 Q35 43 32 47 Q29 43 26 44 Q25 38 20 37 Q22 32 19 28 Q23 25 23 19 Q28 21 32 17 Z" fill="none" stroke="#2b1b10" stroke-width="1" stroke-dasharray="2 2"/></svg>`, 60, 60)}
            <div style="flex:1">
                ${each(SUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div>`)}
            </div>
            <div style="background:#ffffff;padding:5px;border-radius:3px">${qr(80)}</div>
        </div>
        <h1>${t('HAM DERİ FATURASI')}</h1>
        <div class="alt-baslik">${t('— tuzlu ham deri ve post teslimi · KDV tevkifatlı —')}</div>
    </div>
    <div class="defter">
        <div class="bilgi">
            <div class="kart">
                <div class="k">${t('teslim alan tabakhane')}</div>
                ${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}
            </div>
            <div class="kart" style="flex:.8">
                <div class="k">${t('fatura')}</div>
                <table>
                    <tr><td>${t('Fatura No')}</td><td class="d">${v('$f/cbc:ID')}</td></tr>
                    <tr><td>${t('Tarih')}</td><td class="d">${dt('$f/cbc:IssueDate')}</td></tr>
                    <tr><td>${t('Senaryo / Tip')}</td><td class="d">${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:InvoiceTypeCode')}</td></tr>
                    <tr><td>${t('Sipariş')}</td><td class="d">${v('$f/cac:OrderReference/cbc:ID')}</td></tr>
                    <tr><td>${t('İrsaliye')}</td><td class="d">${v('$f/cac:DespatchDocumentReference/cbc:ID')}</td></tr>
                    <tr><td colspan="2" style="font-family:Consolas,monospace;font-size:8px;color:#6b5641">${t('ETTN ')}${v('$f/cbc:UUID')}</td></tr>
                </table>
            </div>
        </div>
        <div class="sayac">
            <div><div class="v">${int(`sum($f/cac:InvoiceLine/${P('ADET')})`)}</div><div class="k">${t('toplam deri (adet)')}</div></div>
            <div><div class="v">${int("sum($f/cac:InvoiceLine/cbc:InvoicedQuantity[@unitCode='KGM'])")}</div><div class="k">${t('büyükbaş kantar (kg)')}</div></div>
            <div><div class="v">${v(`count($f/cac:InvoiceLine[${P('KALITE')}='A'])`)}${t(' / ')}${v('count($f/cac:InvoiceLine)')}</div><div class="k">${t('A kalite parti')}</div></div>
            <div><div class="v">${dt('$f/cac:PaymentMeans/cbc:PaymentDueDate')}</div><div class="k">${t('vade')}</div></div>
        </div>
        <table class="kalem">
            <tr><th>${t('Kalite')}</th><th>${t('Cins / Açıklama')}</th><th>${t('Menşe')}</th><th class="sag">${t('Adet')}</th><th class="sag">${t('Miktar')}</th><th class="sag">${t('Birim Fiyat')}</th><th class="sag">${t('Tutar')}</th></tr>
            ${each('$f/cac:InvoiceLine', `<tr>
                <td><span>${attr('class', `muhur ${v(P('KALITE'))}`)}${v(P('KALITE'))}</span></td>
                <td><span class="cins">${v(P('CINS'))}</span>${t(' ')}<span class="ad">${v('cac:Item/cbc:Name')}</span><div class="acik">${v('cac:Item/cbc:Description')}${t(' · ort. ')}${v(P('ORTKG'))}${t(' kg / deri')}</div></td>
                <td>${v(P('MENSE'))}</td>
                <td class="sag">${int(P('ADET'))}</td>
                <td class="sag"><b>${int('cbc:InvoicedQuantity')}</b>${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}</td>
                <td class="sag">${money('cac:Price/cbc:PriceAmount')}</td>
                <td class="sag"><b>${money('cbc:LineExtensionAmount')}</b></td>
            </tr>`)}
        </table>
        <div class="alt">
            <div class="sol">
                ${yalniz(`<div class="yalniz">${v('.')}</div>`)}
                <ul class="notlar">${notes(`<li>${v('.')}</li>`)}</ul>
                ${each('$f/cac:WithholdingTaxTotal/cac:TaxSubtotal', `<div class="tevk"><b>${t('Tevkifat ')}${v('cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode')}${t(' · ')}${v('cbc:Percent div 10')}${t('/10')}</b><br/>${v('cac:TaxCategory/cac:TaxScheme/cbc:Name')}${t(' — alıcı tarafından beyan edilecek KDV: ')}${money('cbc:TaxAmount')}</div>`)}
                ${bank(`<div class="banka">${v('cbc:PaymentNote')}<div class="ib">${iban('cbc:ID')}</div>${v('$f/cac:PaymentTerms/cbc:Note')}</div>`)}
            </div>
            <div class="sag">
                <table class="top">${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
                <div class="odenecek"><div class="k">${t('ödenecek tutar')}</div><div class="v">${money(`${LMT}/cbc:PayableAmount`)}</div></div>
            </div>
        </div>
        <div class="dip">${t('Ham deri ve post teslimlerinde KDV\'nin 9/10\'u alıcı tarafından sorumlu sıfatıyla beyan edilir. Bu belge elektronik ortamda düzenlenmiştir.')}</div>
    </div>
</div>`,
});

/* ================================================================ 3. Dokuma kumaş top satışı (Bauhaus) */

const nilufer = {
    web: 'https://www.niluferdokuma.com.tr',
    ids: [['VKN', '6310482759'], ['MERSISNO', '0631048275900017']],
    name: 'Nilüfer Dokuma Kumaş Sanayi A.Ş.',
    addr: adr('Demirtaş OSB Mah. Kahverengi Cad.', '12', 'Osmangazi', 'Bursa', '16245'),
    vd: 'Ertuğrulgazi', tel: '0224 261 44 00', mail: 'siparis@niluferdokuma.com.tr',
};
const atlas = {
    ids: [['VKN', '1209374658']],
    name: 'Atlas Konfeksiyon Ltd. Şti.',
    addr: adr('Merter Mah. Keresteciler Sitesi Fatih Cad.', '44', 'Güngören', 'İstanbul', '34173'),
    vd: 'Merter', tel: '0212 637 51 20', mail: 'kumas@atlaskonfeksiyon.com.tr',
};
const f3 = {
    id: 'kumas-top-fatura',
    xml: invoice({
        comment: `Hazır şablon örneği: Dokuma fabrikasının konfeksiyoncuya top kumaş satışı — TICARIFATURA · SATIS, KDV %10.
            Satırda TOPNO, TOPADET, EN (cm), GRAMAJ (g/m²), ORGU (dimi / bezayagi / saten / panama), RENK, RENKKOD (#hex),
            KOMP-xx (lif kompozisyonu yüzdesi) ek tanımları.`,
        profile: 'TICARIFATURA', type: 'SATIS', id: 'NDK2026000004126', date: '2026-10-05', time: '10:10:00',
        notes: ['Toplar 50 m ± %3 boyda sarılmıştır; metraj top etiketlerindeki ölçüye göre faturalanmıştır.', 'Kesimden önce çekmezlik testi yapılması önerilir (yıkama sonrası çekme ≤ %3).'],
        order: { id: 'ATL-26-1187', date: '2026-09-22' },
        despatch: [{ id: 'NDI2026000002240', date: '2026-10-05' }],
        supplier: nilufer, customer: atlas,
        payment: { code: '42', due: '2026-12-04', iban: 'TR200006701000000041287719', bank: 'Yapı Kredi — Demirtaş OSB Şubesi' },
        terms: '60 gün vade · Çek veya havale',
        lines: [
            { name: 'Pamuk Gabardin', desc: '2/1 dimi, şardonsuz, sanfor apre', unit: 'MTR', qty: 1200, price: 128.5, kdv: 10, sid: 'GB-240-HK', props: { TOPNO: 'T-24811 … T-24834', TOPADET: '24', EN: '150', GRAMAJ: '240', ORGU: 'dimi', RENK: 'Haki', RENKKOD: '#7a7a4a', 'KOMP-CO': '97', 'KOMP-EA': '3' } },
            { name: 'Viskon Poplin', desc: 'Bezayağı, yumuşak tuşe', unit: 'MTR', qty: 800, price: 96, kdv: 10, sid: 'VP-115-EK', props: { TOPNO: 'T-24835 … T-24850', TOPADET: '16', EN: '145', GRAMAJ: '115', ORGU: 'bezayagi', RENK: 'Ekru', RENKKOD: '#eee4cf', 'KOMP-CV': '100' } },
            { name: 'Polyester Saten', desc: 'Parlak yüz, astar ve abiye', unit: 'MTR', qty: 650, price: 112, kdv: 10, sid: 'PS-135-LC', disc: { rate: 0.03, reason: 'Toplu alım iskontosu' }, props: { TOPNO: 'T-24851 … T-24863', TOPADET: '13', EN: '150', GRAMAJ: '135', ORGU: 'saten', RENK: 'Lacivert', RENKKOD: '#1f2a4d', 'KOMP-PES': '100' } },
            { name: 'Keten Karışımlı Panama', desc: 'Sepet örgü, yazlık ceket-pantolon', unit: 'MTR', qty: 500, price: 164, kdv: 10, sid: 'KP-210-BJ', props: { TOPNO: 'T-24864 … T-24873', TOPADET: '10', EN: '140', GRAMAJ: '210', ORGU: 'panama', RENK: 'Bej', RENKKOD: '#d8c3a5', 'KOMP-LI': '55', 'KOMP-CO': '45' } },
        ],
    }),
};
f3.xslt = xslt({
    title: 'Kumaş Faturası',
    comment: `Nilüfer Dokuma — top kumaş satış e-Faturası. Bauhaus konsepti: kırmızı daire / sarı kare / mavi üçgen geometrik başlık, kalın
        siyah çizgili ızgara, her kalemde kumaşın gerçek renginde ve örgüsünde (dimi, bezayağı, saten, panama) desenli numune karesi,
        lif kompozisyonu yüzde çubuğu, top / en / gramaj göstergeleri.`,
    css: `
        body { background: #e5e5e5; font-family: 'Century Gothic', 'Trebuchet MS', 'Segoe UI', sans-serif; font-size: 10.5px; color: #111111; }
        .sayfa { background: #fafaf7; padding: 0 0 9mm 0; }
        .geo { position: relative; height: 54mm; overflow: hidden; border-bottom: 5px solid #111111; }
        .geo .daire { position: absolute; width: 58mm; height: 58mm; border-radius: 50%; background: #e63946; right: 18mm; top: -16mm; }
        .geo .kare { position: absolute; width: 30mm; height: 30mm; background: #ffbe0b; right: 4mm; bottom: 0; }
        .geo .ucgen { position: absolute; right: 62mm; bottom: 0; width: 0; height: 0; border-left: 17mm solid transparent; border-right: 17mm solid transparent; border-bottom: 28mm solid #1d4ed8; }
        .geo .cizgi { position: absolute; left: 0; right: 0; top: 30mm; height: 4px; background: #111111; }
        .geo .metin { position: absolute; left: 11mm; top: 8mm; width: 108mm; }
        .geo h1 { margin: 0; font-family: 'Arial Black', 'Segoe UI', sans-serif; font-size: 44px; letter-spacing: -2px; line-height: .9; }
        .geo h1 span { color: #1d4ed8; }
        .geo .alt { position: absolute; left: 11mm; top: 36mm; display: flex; gap: 10px; align-items: center; }
        .geo .unvan { font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
        .geo .adr { font-size: 8.5px; line-height: 1.5; color: #333333; }
        .izgara { display: flex; border-bottom: 3px solid #111111; }
        .izgara > div { flex: 1; padding: 6px 11px; border-right: 3px solid #111111; }
        .izgara > div:last-child { border-right: 0; }
        .izgara .k { font-size: 7.5px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
        .izgara .v { font-family: 'Arial Black', sans-serif; font-size: 13px; }
        .izgara .kirmizi { background: #e63946; color: #ffffff; }
        .taraf { display: flex; border-bottom: 3px solid #111111; }
        .taraf > div { padding: 8px 11px; line-height: 1.55; }
        .taraf .ad { font-weight: 700; font-size: 12.5px; }
        .taraf .k { font-size: 7.5px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #1d4ed8; }
        .icerik { padding: 0 11mm; }
        .kalem { display: flex; gap: 12px; padding: 9px 0; border-bottom: 2px solid #111111; align-items: center; }
        .numune { width: 21mm; height: 21mm; flex-shrink: 0; border: 3px solid #111111; position: relative; }
        .numune.dimi { background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.22) 0 2px, transparent 2px 5px); }
        .numune.bezayagi { background-image: linear-gradient(90deg, rgba(0,0,0,.08) 50%, transparent 50%), linear-gradient(0deg, rgba(0,0,0,.08) 50%, transparent 50%); background-size: 4px 4px; }
        .numune.saten { background-image: linear-gradient(120deg, rgba(255,255,255,0) 20%, rgba(255,255,255,.45) 45%, rgba(255,255,255,0) 70%); }
        .numune.panama { background-image: linear-gradient(90deg, rgba(0,0,0,.12) 2px, transparent 2px), linear-gradient(0deg, rgba(0,0,0,.12) 2px, transparent 2px); background-size: 6px 6px; }
        .numune span { position: absolute; left: -3px; bottom: -3px; background: #111111; color: #ffffff; font-size: 7px; font-weight: 700; padding: 1px 4px; text-transform: uppercase; letter-spacing: 1px; }
        .kalem .orta { flex: 1; }
        .kalem .ad { font-family: 'Arial Black', sans-serif; font-size: 13px; }
        .kalem .acik { color: #444444; font-size: 9px; }
        .olcu { display: flex; gap: 0; margin-top: 4px; }
        .olcu div { border: 2px solid #111111; padding: 1px 6px; margin-right: -2px; font-size: 9px; }
        .olcu b { font-size: 10.5px; }
        .komp { display: flex; height: 9px; margin-top: 5px; border: 2px solid #111111; width: 70mm; }
        .komp span { display: block; height: 100%; }
        .komp-et { font-size: 8px; margin-top: 2px; letter-spacing: .5px; }
        .kalem .sag { width: 44mm; text-align: right; }
        .kalem .metre { font-family: 'Arial Black', sans-serif; font-size: 17px; }
        .kalem .fiyat { font-size: 9px; color: #444444; }
        .kalem .isk { font-size: 8.5px; color: #e63946; font-weight: 700; }
        .kalem .tutar { display: inline-block; margin-top: 3px; background: #111111; color: #ffffff; padding: 2px 8px; font-weight: 700; }
        .alt { display: flex; gap: 14px; margin-top: 12px; }
        .alt .sol { flex: 1; }
        .yalniz { border-left: 8px solid #ffbe0b; padding: 4px 9px; font-weight: 700; }
        .notlar { padding-left: 16px; line-height: 1.55; }
        .banka { border: 3px solid #111111; padding: 6px 10px; }
        .banka .ib { font-family: Consolas, monospace; font-size: 11.5px; font-weight: 700; }
        .alt .sag { width: 80mm; }
        table.top { width: 100%; border-collapse: collapse; }
        table.top td { padding: 4px 2px; border-bottom: 1px solid #111111; }
        table.top td.t { text-align: right; font-weight: 700; white-space: nowrap; }
        table.top tr.isk td { color: #e63946; }
        table.top tr.ara td { border-bottom: 3px solid #111111; font-weight: 700; }
        .odenecek { margin-top: 6px; background: #1d4ed8; color: #ffffff; padding: 10px 12px; position: relative; overflow: hidden; }
        .odenecek:after { content: ''; position: absolute; right: -10mm; top: -10mm; width: 26mm; height: 26mm; border-radius: 50%; background: #ffbe0b; }
        .odenecek .k { font-size: 8px; letter-spacing: 2px; font-weight: 700; }
        .odenecek .v { font-family: 'Arial Black', sans-serif; font-size: 20px; position: relative; z-index: 1; }`,
    body: `
<div class="sayfa">
    <div class="geo">
        <div class="daire"></div><div class="ucgen"></div><div class="kare"></div><div class="cizgi"></div>
        <div class="metin"><h1>${t('KUMAŞ')}<br/><span>${t('FATURA')}</span></h1></div>
        <div class="alt">
            ${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#111111"/><circle cx="22" cy="22" r="14" fill="#e63946"/><rect x="34" y="34" width="22" height="22" fill="#ffbe0b"/><path d="M8 56 L22 34 L36 56 Z" fill="#1d4ed8"/></svg>`, 46, 46)}
            ${each(SUP, `<div><div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div></div>`)}
        </div>
    </div>
    <div class="izgara">
        <div class="kirmizi"><div class="k">${t('Fatura No')}</div><div class="v">${v('$f/cbc:ID')}</div></div>
        <div><div class="k">${t('Tarih')}</div><div class="v">${dt('$f/cbc:IssueDate')}</div></div>
        <div><div class="k">${t('Senaryo')}</div><div class="v">${v('$f/cbc:ProfileID')}</div></div>
        <div><div class="k">${t('Toplam Metre')}</div><div class="v">${int('sum($f/cac:InvoiceLine/cbc:InvoicedQuantity)')}${t(' m')}</div></div>
        <div><div class="k">${t('Top')}</div><div class="v">${int(`sum($f/cac:InvoiceLine/${P('TOPADET')})`)}</div></div>
    </div>
    <div class="taraf">
        <div style="flex:1;border-right:3px solid #111111">
            <div class="k">${t('Alıcı')}</div>
            ${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}
        </div>
        <div style="width:58mm;border-right:3px solid #111111">
            <div class="k">${t('Belge')}</div>
            ${t('Tip: ')}<b>${v('$f/cbc:InvoiceTypeCode')}</b><br/>${t('Sipariş: ')}<b>${v('$f/cac:OrderReference/cbc:ID')}</b><br/>${t('İrsaliye: ')}<b>${v('$f/cac:DespatchDocumentReference/cbc:ID')}</b><br/>
            <span style="font-family:Consolas,monospace;font-size:7.5px">${v('$f/cbc:UUID')}</span>
        </div>
        <div style="width:30mm;display:flex;align-items:center;justify-content:center">${qr(86)}</div>
    </div>
    <div class="icerik">
        ${each('$f/cac:InvoiceLine', `
        <div class="kalem">
            <div>${attr('class', `numune ${v(P('ORGU'))}`)}${attr('style', `background-color:${v(P('RENKKOD'))}`)}<span>${v(P('ORGU'))}</span></div>
            <div class="orta">
                <div class="ad">${v('cac:Item/cbc:Name')}${t(' · ')}${v(P('RENK'))}</div>
                <div class="acik">${v('cac:Item/cac:SellersItemIdentification/cbc:ID')}${t(' — ')}${v('cac:Item/cbc:Description')}${t(' · Top ')}${v(P('TOPNO'))}</div>
                <div class="olcu"><div>${t('EN ')}<b>${v(P('EN'))}</b>${t(' cm')}</div><div>${t('GRAMAJ ')}<b>${v(P('GRAMAJ'))}</b>${t(' g/m²')}</div><div>${t('TOP ')}<b>${v(P('TOPADET'))}</b></div></div>
                <div class="komp">${each(PS('KOMP-'), `<span>${attr('style', `width:${v('.')}%;background:${choose(["@schemeID='KOMP-CO'", '#ffbe0b'], ["@schemeID='KOMP-EA'", '#e63946'], ["@schemeID='KOMP-CV'", '#2a9d8f'], ["@schemeID='KOMP-PES'", '#1d4ed8'], ["@schemeID='KOMP-LI'", '#a3b18a'], [null, '#888888'])}`)}</span>`)}</div>
                <div class="komp-et">${each(PS('KOMP-'), `${t('%')}${v('.')}${t(' ')}${v("substring-after(@schemeID,'-')")}${iff('position()!=last()', t(' · '))}`)}</div>
            </div>
            <div class="sag">
                <div class="metre">${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}</div>
                <div class="fiyat">${t('× ')}${money('cac:Price/cbc:PriceAmount')}${t(' · KDV %')}${v('cac:TaxTotal/cac:TaxSubtotal/cbc:Percent')}</div>
                ${each('cac:AllowanceCharge', `<div class="isk">${v('cbc:AllowanceChargeReason')}${t(' −')}${money('cbc:Amount')}</div>`)}
                <div class="tutar">${money('cbc:LineExtensionAmount')}</div>
            </div>
        </div>`)}
        <div class="alt">
            <div class="sol">
                ${yalniz(`<div class="yalniz">${v('.')}</div>`)}
                <ul class="notlar">${notes(`<li>${v('.')}</li>`)}</ul>
                ${bank(`<div class="banka"><b>${v('cbc:PaymentNote')}</b><div class="ib">${iban('cbc:ID')}</div>${t('Vade: ')}${dt('../cbc:PaymentDueDate')}${t(' · ')}${v('$f/cac:PaymentTerms/cbc:Note')}</div>`)}
            </div>
            <div class="sag">
                <table class="top">${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
                <div class="odenecek"><div class="k">${t('ÖDENECEK TUTAR')}</div><div class="v">${money(`${LMT}/cbc:PayableAmount`)}</div></div>
            </div>
        </div>
    </div>
</div>`,
});

/* ================================================================ 4. İplik (laboratuvar sertifikası) */

const maras = {
    web: 'https://www.marasring.com.tr',
    ids: [['VKN', '6084219375'], ['MERSISNO', '0608421937500021']],
    name: 'Maraş Ring İplik Sanayi A.Ş.',
    addr: adr('Organize Sanayi Bölgesi 3. Kısım 8. Cad.', '5', 'Onikişubat', 'Kahramanmaraş', '46060'),
    vd: 'Aslanbey', tel: '0344 236 18 18', mail: 'iplik@marasring.com.tr',
};
const buldan = {
    ids: [['VKN', '1873402965']],
    name: 'Buldan Örme Kumaş Tekstil Ltd. Şti.',
    addr: adr('Denizli OSB 1. Cad.', '27', 'Honaz', 'Denizli', '20330'),
    vd: 'Gökpınar', tel: '0258 269 40 80', mail: 'hammadde@buldanorme.com.tr',
};
const f4 = {
    id: 'iplik-lot-fatura',
    xml: invoice({
        comment: `Hazır şablon örneği: İplikhanenin örme fabrikasına lot bazlı iplik satışı — TICARIFATURA · SATIS.
            Satırda LOT, NE (iplik numarası), HAMMADDE, BUKUM (TPM), MUKAVEMET (cN/tex), NEM (%), USTER (CV%), BOBIN (adet), SONUC ek tanımları.`,
        profile: 'TICARIFATURA', type: 'SATIS', id: 'MRI2026000006352', date: '2026-10-02', time: '08:30:00',
        notes: ['Her lot için Uster test raporu ve pamuk menşe sertifikası sevkiyatla birlikte gönderilmiştir.', 'Lot karışımı yapılmaması rica olunur; reklamasyonlar lot etiketiyle bildirilmelidir.'],
        order: { id: 'BLD-HM-2609-04', date: '2026-09-15' },
        despatch: [{ id: 'MRI2026000006340', date: '2026-10-01' }],
        supplier: maras, customer: buldan,
        payment: { code: '42', due: '2026-12-01', iban: 'TR460001000254853921465001', bank: 'Ziraat Bankası — Kahramanmaraş Ticari Şube' },
        terms: '60 gün vade · Vade farkı aylık %2,75',
        lines: [
            { name: 'Ne 30/1 Penye Ring İplik', desc: 'Örmeye uygun, mumlu, 1,20 kg konik bobin', unit: 'KGM', qty: 4320, price: 152.4, sid: 'PR-30-1', props: { LOT: 'L-2610-07', NE: '30/1', HAMMADDE: '%100 Pamuk (Ege)', BUKUM: '820 TPM', MUKAVEMET: '16,8 cN/tex', NEM: '%7,2', USTER: 'CV %11,4', BOBIN: '3600', SONUC: 'UYGUN' } },
            { name: 'Ne 20/1 Open-End İplik', desc: 'Denim ve kalın örme için', unit: 'KGM', qty: 6000, price: 98.75, sid: 'OE-20-1', props: { LOT: 'L-2610-11', NE: '20/1', HAMMADDE: '%100 Pamuk (Harran)', BUKUM: '640 TPM', MUKAVEMET: '13,2 cN/tex', NEM: '%7,5', USTER: 'CV %12,8', BOBIN: '3000', SONUC: 'UYGUN' } },
            { name: 'Ne 40/1 Compact Penye İplik', desc: 'Kompakt eğirme, düşük tüylülük', unit: 'KGM', qty: 1800, price: 214, sid: 'CP-40-1', props: { LOT: 'L-2609-28', NE: '40/1', HAMMADDE: '%100 Pamuk (Ege)', BUKUM: '960 TPM', MUKAVEMET: '18,9 cN/tex', NEM: '%7,0', USTER: 'CV %10,6', BOBIN: '1500', SONUC: 'UYGUN' } },
            { name: '150D/48F Polyester Tekstüre', desc: 'Ham beyaz, yarı mat', unit: 'KGM', qty: 2400, price: 86.2, sid: 'PT-150-48', props: { LOT: 'L-2610-02', NE: '150D/48F', HAMMADDE: '%100 Polyester', BUKUM: 'Tekstüre', MUKAVEMET: '38,0 cN/tex', NEM: '%0,4', USTER: 'Çekme %22', BOBIN: '960', SONUC: 'UYGUN' } },
        ],
    }),
};
f4.xslt = xslt({
    title: 'İplik Faturası',
    comment: `Maraş Ring İplik — lot bazlı iplik satış e-Faturası. Laboratuvar sertifikası konsepti: milimetrik mavi ızgara zemin, tek aralıklı
        yazı, her lot için bobin simgeli test kartı (Ne, büküm, mukavemet, nem, Uster), "UYGUN" onay damgası ve sertifika numaralı başlık.`,
    css: `
        body { background: #cbd5e1; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; color: #0f172a; }
        .sayfa { background-color: #ffffff; background-image: linear-gradient(rgba(14,116,144,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(14,116,144,.07) 1px, transparent 1px), linear-gradient(rgba(14,116,144,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(14,116,144,.13) 1px, transparent 1px); background-size: 1mm 1mm, 1mm 1mm, 10mm 10mm, 10mm 10mm; padding: 10mm 11mm; }
        .mono { font-family: Consolas, 'Lucida Console', monospace; }
        .bas { display: flex; border: 1.5px solid #0e7490; background: #ffffff; }
        .bas .sol { flex: 1; padding: 9px 12px; display: flex; gap: 12px; }
        .bas .unvan { font-weight: 700; font-size: 14px; color: #0e7490; }
        .bas .adr { font-size: 9px; line-height: 1.55; color: #334155; }
        .bas .sag { width: 70mm; border-left: 1.5px solid #0e7490; }
        .bas .sag .t1 { background: #0e7490; color: #ffffff; padding: 6px 10px; font-family: Consolas, monospace; font-size: 11px; letter-spacing: 1px; }
        .bas .sag table { width: 100%; border-collapse: collapse; font-family: Consolas, monospace; font-size: 9.5px; }
        .bas .sag td { padding: 2.5px 10px; border-bottom: 1px dotted #94a3b8; }
        .bas .sag td.d { text-align: right; font-weight: 700; }
        .baslik { display: flex; align-items: flex-end; justify-content: space-between; margin: 10px 0 8px 0; }
        .baslik h1 { margin: 0; font-family: Consolas, monospace; font-size: 20px; letter-spacing: 1px; color: #0f172a; }
        .baslik h1 small { display: block; font-size: 9.5px; color: #0e7490; letter-spacing: 3px; }
        .taraf { display: flex; gap: 10px; }
        .taraf > div { flex: 1; background: #ffffff; border: 1px solid #94a3b8; padding: 7px 10px; line-height: 1.55; }
        .taraf .k { font-family: Consolas, monospace; font-size: 8.5px; color: #0e7490; letter-spacing: 1px; }
        .taraf .ad { font-weight: 700; font-size: 11.5px; }
        .lotlar { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .lot { width: calc(50% - 4px); background: #ffffff; border: 1px solid #0e7490; }
        .lot .ust { display: flex; align-items: center; gap: 8px; background: #ecfeff; border-bottom: 1px solid #0e7490; padding: 5px 8px; }
        .lot .ust .ad { font-weight: 700; font-size: 11px; flex: 1; }
        .lot .ust .lno { font-family: Consolas, monospace; font-size: 9px; background: #0e7490; color: #ffffff; padding: 1px 6px; }
        .lot table { width: 100%; border-collapse: collapse; font-family: Consolas, monospace; font-size: 9px; }
        .lot td { padding: 2px 8px; border-bottom: 1px dotted #cbd5e1; }
        .lot td.d { text-align: right; font-weight: 700; }
        .lot .dip { display: flex; justify-content: space-between; align-items: center; padding: 5px 8px; }
        .lot .tut { font-weight: 700; font-size: 12px; }
        .uygun { font-family: Consolas, monospace; font-weight: 700; color: #15803d; border: 2px solid #15803d; padding: 0 6px; transform: rotate(-6deg); display: inline-block; font-size: 10px; letter-spacing: 1px; }
        .alt { display: flex; gap: 12px; margin-top: 12px; }
        .alt .sol { flex: 1; }
        .yalniz { font-family: Consolas, monospace; background: #ffffff; border: 1px dashed #0e7490; padding: 5px 9px; font-size: 10px; }
        .notlar { padding-left: 16px; line-height: 1.55; }
        .banka { background: #ffffff; border: 1px solid #94a3b8; padding: 6px 10px; }
        .banka .ib { font-family: Consolas, monospace; font-size: 11px; font-weight: 700; }
        .alt .sag { width: 80mm; }
        table.top { width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #0e7490; font-family: Consolas, monospace; font-size: 9.5px; }
        table.top td { padding: 4px 8px; border-bottom: 1px dotted #94a3b8; }
        table.top td.t { text-align: right; font-weight: 700; white-space: nowrap; }
        table.top tr.ara td { border-top: 1.5px solid #0e7490; }
        .odenecek { margin-top: 6px; background: #0f172a; color: #67e8f9; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; font-family: Consolas, monospace; }
        .odenecek .v { font-size: 18px; color: #ffffff; font-weight: 700; }`,
    body: `
<div class="sayfa">
    <div class="bas">
        <div class="sol">
            ${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="6" fill="#0e7490"/><path d="M22 10 L42 10 L46 54 L18 54 Z" fill="#ecfeff"/><g stroke="#0e7490" stroke-width="1.6"><line x1="21" y1="18" x2="43" y2="18"/><line x1="20.5" y1="24" x2="43.5" y2="24"/><line x1="20" y1="30" x2="44" y2="30"/><line x1="19.5" y1="36" x2="44.5" y2="36"/><line x1="19" y1="42" x2="45" y2="42"/><line x1="18.6" y1="48" x2="45.4" y2="48"/></g><rect x="27" y="4" width="10" height="6" fill="#67e8f9"/></svg>`, 56, 56)}
            ${each(SUP, `<div><div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div></div>`)}
        </div>
        <div class="sag">
            <div class="t1">${t('FATURA · ')}${v('$f/cbc:ID')}</div>
            <table>
                <tr><td>${t('tarih')}</td><td class="d">${dt('$f/cbc:IssueDate')}${t(' ')}${v('substring($f/cbc:IssueTime,1,5)')}</td></tr>
                <tr><td>${t('senaryo')}</td><td class="d">${v('$f/cbc:ProfileID')}</td></tr>
                <tr><td>${t('tip')}</td><td class="d">${v('$f/cbc:InvoiceTypeCode')}</td></tr>
                <tr><td>${t('sipariş')}</td><td class="d">${v('$f/cac:OrderReference/cbc:ID')}</td></tr>
                <tr><td>${t('irsaliye')}</td><td class="d">${v('$f/cac:DespatchDocumentReference/cbc:ID')}</td></tr>
            </table>
        </div>
    </div>
    <div class="baslik">
        <h1><small>${t('TEST · SEVK · FATURA')}</small>${t('İPLİK LOT FATURASI')}</h1>
        <div style="display:flex;gap:10px;align-items:center">
            <div class="mono" style="font-size:8px;text-align:right;color:#475569">${t('ETTN')}<br/>${v('$f/cbc:UUID')}</div>
            <div style="background:#ffffff;padding:4px;border:1px solid #0e7490">${qr(76)}</div>
        </div>
    </div>
    <div class="taraf">
        <div><div class="k">${t('// ALICI')}</div>${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}</div>
        <div style="flex:.6"><div class="k">${t('// ÖZET')}</div>
            <span class="mono">${t('lot      : ')}<b>${v('count($f/cac:InvoiceLine)')}</b><br/>${t('net kg   : ')}<b>${num('sum($f/cac:InvoiceLine/cbc:InvoicedQuantity)', '###.##0')}</b><br/>${t('bobin    : ')}<b>${int(`sum($f/cac:InvoiceLine/${P('BOBIN')})`)}</b><br/>${t('vade     : ')}<b>${dt('$f/cac:PaymentMeans/cbc:PaymentDueDate')}</b></span>
        </div>
    </div>
    <div class="lotlar">
        ${each('$f/cac:InvoiceLine', `
        <div class="lot">
            <div class="ust">
                <img width="16" height="22" alt="" src="${svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 22"><path d="M3 2 L13 2 L15 20 L1 20 Z" fill="#67e8f9" stroke="#0e7490"/><line x1="2.5" y1="7" x2="13.5" y2="7" stroke="#0e7490"/><line x1="2" y1="12" x2="14" y2="12" stroke="#0e7490"/><line x1="1.5" y1="17" x2="14.5" y2="17" stroke="#0e7490"/></svg>`)}"/>
                <span class="ad">${v('cac:Item/cbc:Name')}</span><span class="lno">${v(P('LOT'))}</span>
            </div>
            <table>
                <tr><td>${t('iplik no')}</td><td class="d">${v(P('NE'))}</td><td>${t('büküm')}</td><td class="d">${v(P('BUKUM'))}</td></tr>
                <tr><td>${t('mukavemet')}</td><td class="d">${v(P('MUKAVEMET'))}</td><td>${t('nem')}</td><td class="d">${v(P('NEM'))}</td></tr>
                <tr><td>${t('düzgünsüzlük')}</td><td class="d">${v(P('USTER'))}</td><td>${t('bobin')}</td><td class="d">${int(P('BOBIN'))}</td></tr>
                <tr><td colspan="4" style="color:#475569">${v(P('HAMMADDE'))}${t(' · ')}${v('cac:Item/cbc:Description')}</td></tr>
            </table>
            <div class="dip">
                <span class="uygun">${t('✓ ')}${v(P('SONUC'))}</span>
                <span class="mono">${num('cbc:InvoicedQuantity', '###.##0')}${t(' kg × ')}${num('cac:Price/cbc:PriceAmount')}</span>
                <span class="tut">${money('cbc:LineExtensionAmount')}</span>
            </div>
        </div>`)}
    </div>
    <div class="alt">
        <div class="sol">
            ${yalniz(`<div class="yalniz">${v('.')}</div>`)}
            <ul class="notlar">${notes(`<li>${v('.')}</li>`)}</ul>
            ${bank(`<div class="banka"><span class="mono" style="color:#0e7490">${t('// ÖDEME')}</span>${t(' ')}${v('cbc:PaymentNote')}<div class="ib">${iban('cbc:ID')}</div>${v('$f/cac:PaymentTerms/cbc:Note')}</div>`)}
        </div>
        <div class="sag">
            <table class="top">${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
            <div class="odenecek"><span>${t('> ÖDENECEK')}</span><span class="v">${money(`${LMT}/cbc:PayableAmount`)}</span></div>
        </div>
    </div>
</div>`,
});

/* ================================================================ 5. Spor ayakkabı distribütörü (streetwear) */

const pist = {
    web: 'https://www.pistsports.com.tr',
    ids: [['VKN', '7294016385'], ['MERSISNO', '0729401638500012']],
    name: 'Pist Spor Ürünleri Dağıtım A.Ş.',
    addr: adr('Esenyurt Lojistik Merkezi Doğan Araslı Bulvarı', '201', 'Esenyurt', 'İstanbul', '34510'),
    vd: 'Esenyurt', tel: '0850 340 74 78', mail: 'b2b@pistsports.com.tr',
};
const sokak = {
    ids: [['VKN', '8102937465']],
    name: 'Sokak Sneaker Store Ltd. Şti.',
    addr: adr('Caferağa Mah. Moda Cad.', '61/A', 'Kadıköy', 'İstanbul', '34710'),
    vd: 'Kadıköy', tel: '0216 336 61 61', mail: 'store@sokaksneaker.com',
};
const f5 = {
    id: 'sneaker-distributor-fatura',
    xml: invoice({
        comment: `Hazır şablon örneği: Spor ayakkabı distribütörünün sneaker mağazasına sezon "drop" satışı — TICARIFATURA · SATIS, KDV %10.
            Satırda COLORWAY, DROP, NUMARA-xx (beden dağılımı) ek tanımları; lansman ve kampanya iskontoları satır bazında.`,
        profile: 'TICARIFATURA', type: 'SATIS', id: 'PST2026000012094', date: '2026-10-08', time: '11:00:00',
        notes: ['Lansman ürünleri 17.10.2026 saat 10:00 öncesi satışa sunulamaz (embargo).', 'Kutular orijinal ambalajında, hologram etiketlidir.'],
        order: { id: 'B2B-SKK-7741', date: '2026-09-30' },
        despatch: [{ id: 'PSI2026000008817', date: '2026-10-08' }],
        supplier: pist, customer: sokak,
        payment: { code: '42', due: '2026-11-07', iban: 'TR150004600153888000197355', bank: 'Akbank — Esenyurt Ticari Şube' },
        terms: '30 gün vade',
        lines: [
            { name: 'AIRWAVE RUNNER 2', desc: 'Koşu · nefes alan file saya', model: 'AWR2-702', unit: 'PR', qty: 48, price: 2450, kdv: 10, disc: { rate: 0.1, reason: 'Lansman' }, props: { COLORWAY: 'Volt / Black', DROP: 'FW26-01', ...asorti(40, [4, 8, 12, 12, 8, 4]) } },
            { name: 'COURT LOW 85', desc: 'Retro basketbol · deri saya', model: 'CL85-100', unit: 'PR', qty: 36, price: 1990, kdv: 10, props: { COLORWAY: 'Triple White', DROP: 'CORE', ...asorti(36, [3, 6, 9, 9, 6, 3]) } },
            { name: 'TRAIL GRIP GTX', desc: 'Arazi · su geçirmez membran', model: 'TGX-330', unit: 'PR', qty: 18, price: 3280, kdv: 10, props: { COLORWAY: 'Olive / Ember', DROP: 'FW26-02', ...asorti(41, [3, 4, 5, 4, 2]) } },
            { name: 'SLIDE CLOUD', desc: 'Terlik · tek parça EVA', model: 'SLC-010', unit: 'PR', qty: 60, price: 640, kdv: 10, disc: { rate: 0.05, reason: 'Kampanya' }, props: { COLORWAY: 'Black', DROP: 'CORE', ...asorti(38, [10, 12, 14, 12, 8, 4]) } },
        ],
    }),
};
f5.xslt = xslt({
    title: 'Sneaker Faturası',
    comment: `Pist Spor — sneaker mağazasına sezon satışı e-Faturası. Streetwear konsepti: siyah zemin üzerine dış hatlı dev "FATURA" yazısı,
        neon yeşil vurgular, eğik "DROP" çıkartması, kalemlerde 01/02 numaralı satırlar, colorway etiketi ve hap biçiminde numara dağılımı.`,
    css: `
        body { background: #0a0a0a; font-family: Bahnschrift, 'Arial Narrow', 'Segoe UI', sans-serif; font-size: 10.5px; color: #0a0a0a; }
        .sayfa { background: #f4f4f0; }
        .ust { background: #0a0a0a; color: #f4f4f0; padding: 9mm 11mm 7mm 11mm; position: relative; overflow: hidden; }
        .ust .dev { font-family: Impact, 'Arial Black', sans-serif; font-size: 92px; line-height: .85; letter-spacing: 2px; color: transparent; -webkit-text-stroke: 1.5px #c6ff00; position: absolute; right: -4mm; top: 4mm; opacity: .9; }
        .ust .satir { display: flex; gap: 12px; align-items: center; position: relative; }
        .ust .unvan { font-family: Impact, 'Arial Black', sans-serif; font-size: 22px; letter-spacing: 1px; text-transform: uppercase; }
        .ust .adr { font-size: 9px; color: #a3a3a3; line-height: 1.55; }
        .sticker { position: absolute; right: 16mm; bottom: 6mm; background: #c6ff00; color: #0a0a0a; font-family: Impact, 'Arial Black', sans-serif; font-size: 15px; padding: 5px 12px; transform: rotate(-8deg); box-shadow: 3px 3px 0 #f4f4f0; letter-spacing: 1px; }
        .meta { display: flex; margin-top: 12px; position: relative; }
        .meta > div { padding-right: 18px; }
        .meta .k { font-size: 8px; letter-spacing: 2px; color: #c6ff00; }
        .meta .v { font-size: 14px; font-weight: 700; }
        .govde { padding: 7mm 11mm 9mm 11mm; }
        .taraf { display: flex; gap: 10px; align-items: stretch; }
        .taraf .kart { flex: 1; border: 2.5px solid #0a0a0a; padding: 7px 10px; line-height: 1.55; background: #ffffff; }
        .taraf .k { display: inline-block; background: #0a0a0a; color: #c6ff00; font-size: 8px; letter-spacing: 2px; padding: 1px 6px; margin-bottom: 3px; }
        .taraf .ad { font-family: Impact, 'Arial Black', sans-serif; font-size: 15px; letter-spacing: .5px; }
        .satir2 { display: flex; align-items: center; gap: 12px; border-bottom: 2.5px solid #0a0a0a; padding: 9px 0; }
        .satir2 .idx { font-family: Impact, 'Arial Black', sans-serif; font-size: 34px; color: #0a0a0a; -webkit-text-stroke: 0; width: 15mm; line-height: 1; }
        .satir2 .idx span { background: #c6ff00; padding: 0 4px; }
        .satir2 .orta { flex: 1; }
        .satir2 .ad { font-family: Impact, 'Arial Black', sans-serif; font-size: 18px; letter-spacing: .5px; font-style: italic; }
        .satir2 .acik { font-size: 9px; color: #525252; }
        .cw { display: inline-block; margin-top: 3px; border: 2px solid #0a0a0a; font-size: 8.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
        .cw b { background: #0a0a0a; color: #c6ff00; padding: 1px 5px; display: inline-block; }
        .cw i { font-style: normal; padding: 1px 6px; display: inline-block; }
        .run { margin-top: 5px; }
        .run span { display: inline-block; border: 1.5px solid #0a0a0a; border-radius: 12px; padding: 0 6px; margin-right: 3px; font-size: 9px; font-weight: 700; }
        .run span em { font-style: normal; color: #737373; font-weight: 400; margin-right: 3px; }
        .satir2 .sag { width: 46mm; text-align: right; }
        .satir2 .adet { font-family: Impact, 'Arial Black', sans-serif; font-size: 22px; }
        .satir2 .fiyat { font-size: 9px; color: #525252; }
        .satir2 .isk { display: inline-block; background: #ff3d00; color: #ffffff; font-size: 8.5px; font-weight: 700; padding: 0 5px; transform: rotate(-3deg); }
        .satir2 .tut { font-size: 13px; font-weight: 700; margin-top: 2px; }
        .alt { display: flex; gap: 14px; margin-top: 12px; }
        .alt .sol { flex: 1; }
        .yalniz { font-family: Impact, 'Arial Black', sans-serif; letter-spacing: .5px; font-size: 11px; background: #c6ff00; display: inline-block; padding: 2px 8px; }
        .notlar { padding-left: 16px; line-height: 1.55; }
        .banka { border: 2.5px dashed #0a0a0a; padding: 6px 10px; }
        .banka .ib { font-family: Consolas, monospace; font-size: 11.5px; font-weight: 700; }
        .alt .sag { width: 80mm; }
        table.top { width: 100%; border-collapse: collapse; }
        table.top td { padding: 4px 2px; border-bottom: 1px solid #d4d4d4; }
        table.top td.t { text-align: right; font-weight: 700; white-space: nowrap; }
        table.top tr.isk td { color: #ff3d00; }
        table.top tr.ara td { border-bottom: 2.5px solid #0a0a0a; font-weight: 700; }
        .odenecek { margin-top: 6px; background: #0a0a0a; color: #c6ff00; padding: 10px 12px; }
        .odenecek .k { font-size: 8px; letter-spacing: 3px; }
        .odenecek .v { font-family: Impact, 'Arial Black', sans-serif; font-size: 26px; letter-spacing: 1px; }
        .barkod { height: 22px; margin-top: 10px; background-image: repeating-linear-gradient(90deg, #0a0a0a 0 2px, transparent 2px 4px, #0a0a0a 4px 5px, transparent 5px 8px, #0a0a0a 8px 11px, transparent 11px 12px); }`,
    body: `
<div class="sayfa">
    <div class="ust">
        <div class="dev">${t('FATURA')}</div>
        <div class="satir">
            ${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#c6ff00"/><path d="M36 6 L14 36 L30 36 L26 58 L50 26 L34 26 Z" fill="#0a0a0a"/></svg>`, 54, 54)}
            ${each(SUP, `<div><div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div></div>`)}
        </div>
        <div class="meta">
            <div><div class="k">${t('FATURA NO')}</div><div class="v">${v('$f/cbc:ID')}</div></div>
            <div><div class="k">${t('TARİH')}</div><div class="v">${dt('$f/cbc:IssueDate')}</div></div>
            <div><div class="k">${t('SENARYO')}</div><div class="v">${v('$f/cbc:ProfileID')}</div></div>
            <div><div class="k">${t('ÇİFT')}</div><div class="v">${int('sum($f/cac:InvoiceLine/cbc:InvoicedQuantity)')}</div></div>
            <div><div class="k">${t('VADE')}</div><div class="v">${dt('$f/cac:PaymentMeans/cbc:PaymentDueDate')}</div></div>
        </div>
        <div class="sticker">${t('DROP ')}${v(`$f/cac:InvoiceLine[1]/${P('DROP')}`)}</div>
    </div>
    <div class="govde">
        <div class="taraf">
            <div class="kart"><span class="k">${t('SHIP TO / ALICI')}</span>${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}</div>
            <div class="kart" style="flex:.55"><span class="k">${t('REF')}</span><br/>${t('Sipariş ')}<b>${v('$f/cac:OrderReference/cbc:ID')}</b><br/>${t('İrsaliye ')}<b>${v('$f/cac:DespatchDocumentReference/cbc:ID')}</b><br/>${t('Tip ')}<b>${v('$f/cbc:InvoiceTypeCode')}</b><br/><span style="font-family:Consolas,monospace;font-size:7.5px">${v('$f/cbc:UUID')}</span></div>
            <div class="kart" style="flex:0 0 auto;display:flex;align-items:center">${qr(84)}</div>
        </div>
        ${each('$f/cac:InvoiceLine', `
        <div class="satir2">
            <div class="idx"><span>${v("format-number(cbc:ID,'00')")}</span></div>
            <div class="orta">
                <div class="ad">${v('cac:Item/cbc:Name')}</div>
                <div class="acik">${v('cac:Item/cbc:ModelName')}${t(' · ')}${v('cac:Item/cbc:Description')}</div>
                <span class="cw"><b>${t('COLORWAY')}</b><i>${v(P('COLORWAY'))}</i></span>
                <div class="run">${each(PS('NUMARA-'), `<span><em>${v("substring-after(@schemeID,'-')")}</em>${v('.')}</span>`)}</div>
            </div>
            <div class="sag">
                <div class="adet">${int('cbc:InvoicedQuantity')}${t(' ÇİFT')}</div>
                <div class="fiyat">${t('× ')}${money('cac:Price/cbc:PriceAmount')}${t(' · KDV %')}${v('cac:TaxTotal/cac:TaxSubtotal/cbc:Percent')}</div>
                ${each('cac:AllowanceCharge', `<div class="isk">${v('cbc:AllowanceChargeReason')}${t(' %')}${v('cbc:MultiplierFactorNumeric * 100')}</div>`)}
                <div class="tut">${money('cbc:LineExtensionAmount')}</div>
            </div>
        </div>`)}
        <div class="alt">
            <div class="sol">
                ${yalniz(`<div class="yalniz">${v('.')}</div>`)}
                <ul class="notlar">${notes(`<li>${v('.')}</li>`)}</ul>
                ${bank(`<div class="banka"><b>${v('cbc:PaymentNote')}</b><div class="ib">${iban('cbc:ID')}</div>${v('$f/cac:PaymentTerms/cbc:Note')}</div>`)}
                <div class="barkod"></div>
            </div>
            <div class="sag">
                <table class="top">${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
                <div class="odenecek"><div class="k">${t('TOTAL / ÖDENECEK')}</div><div class="v">${money(`${LMT}/cbc:PayableAmount`)}</div></div>
            </div>
        </div>
    </div>
</div>`,
});

export default [f1, f2, f3, f4, f5];
