import {
    invoice, xslt, v, t, num, int, dt, unit, each, iff, choose, attr, P, PS, money, pName, pAddr, pTax, pContact,
    SUP, CUS, LMT, yalniz, notes, totals, qr, logo, svg,
} from './lib.mjs';

const adr = (street, no, district, city, zip) => ({ street, no, district, city, zip });
const kisi = (tckn, ad, soyad, addr, tel, mail) => ({ ids: [['TCKN', tckn]], person: [ad, soyad], addr, tel, mail });
const meta = (sep = ' · ') => `${v('$f/cbc:ProfileID')}${t(sep)}${v('$f/cbc:InvoiceTypeCode')}`;
const odeme = `${v('$f/cac:PaymentMeans/cbc:InstructionNote')}`;
const satir = (l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`;

/* ================================================================ 1. Ayakkabı butiği */

const f1 = {
    id: 'ayakkabi-butik-arsiv',
    xml: invoice({
        comment: `Hazır şablon örneği: Ayakkabı butiğinin bireysel müşteriye perakende satışı — EARSIVFATURA · SATIS.
            Ayakkabılarda KDV %10, bakım ürünlerinde %20. Satırda NUMARA, RENK, MALZEME ek tanımları; sadakat kartı iskontosu.`,
        profile: 'EARSIVFATURA', type: 'SATIS', id: 'NBA2026000018422', date: '2026-10-07', time: '17:42:00',
        notes: ['Değişim: 30 gün içinde, kullanılmamış ürün ve bu belgeyle tüm mağazalarımızda.', 'Kasa 2 · Satış danışmanı: Defne Y.'],
        supplier: {
            web: 'https://www.nisantasikundura.com', ids: [['VKN', '6390214785'], ['MERSISNO', '0639021478500014']],
            name: 'Nişantaşı Kundura Butik Ltd. Şti.', addr: adr('Teşvikiye Mah. Abdi İpekçi Cad.', '27/1', 'Şişli', 'İstanbul', '34367'),
            vd: 'Şişli', tel: '0212 231 27 27', mail: 'butik@nisantasikundura.com',
        },
        customer: kisi('28417630952', 'Selin', 'Akbulut', adr('Bağdat Cad. Yeşil Apt.', '312 D:9', 'Kadıköy', 'İstanbul', '34728'), '0532 410 27 63', 'selin.akbulut@example.com'),
        payment: { code: '48', due: '2026-10-07', note: 'Kredi kartı · tek çekim · **** 4417' },
        lines: [
            { name: 'Diz Boyu Deri Çizme', desc: 'Yan fermuarlı, 4 cm blok topuk', unit: 'PR', qty: 1, price: 4890, kdv: 10, model: 'NK-W-2610', props: { NUMARA: '39', RENK: 'Siyah', MALZEME: 'Dana deri · deri astar' } },
            { name: 'Oxford Erkek Ayakkabı', desc: 'Goodyear dikiş, deri taban', unit: 'PR', qty: 1, price: 3650, kdv: 10, model: 'NK-M-1180', disc: { rate: 0.1, reason: 'Sadakat kartı %10' }, props: { NUMARA: '43', RENK: 'Kahve', MALZEME: 'Boyalı dana deri' } },
            { name: 'Sedir Ağacı Ayakkabı Kalıbı', desc: 'Nem alıcı, koku önleyici', unit: 'PR', qty: 1, price: 690, kdv: 20, props: { NUMARA: '42-43', RENK: 'Doğal' } },
            { name: 'Deri Bakım Kremi', desc: 'Renksiz, arı mumlu 75 ml', unit: 'C62', qty: 2, price: 290, kdv: 20, props: { RENK: 'Renksiz' } },
        ],
    }),
};
f1.xslt = xslt({
    title: 'e-Arşiv Fatura',
    comment: `Nişantaşı Kundura — ayakkabı butiği e-Arşiv faturası. Lüks butik konsepti: krem zemin, yaldız çift çerçeve, ortalanmış
        monogram ve serif başlık, her ürün için numara rozeti ve noktalı fiyat çizgisi, deri bakım önerileri kartı.`,
    css: `
        body { background: #e9e2d4; font-family: 'Palatino Linotype', 'Book Antiqua', Georgia, serif; font-size: 10.5px; color: #2d2620; }
        .sayfa { background: #fbf8f1; padding: 8mm; }
        .cerceve { border: 1px solid #b08d57; outline: 1px solid #b08d57; outline-offset: -5px; min-height: 280mm; padding: 9mm 11mm; }
        .bas { text-align: center; }
        .bas .unvan { font-size: 19px; letter-spacing: 6px; text-transform: uppercase; margin-top: 6px; }
        .bas .adr { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5px; color: #7a6a58; letter-spacing: .4px; line-height: 1.6; margin-top: 3px; }
        .ayrac { display: flex; align-items: center; gap: 10px; margin: 10px 0; color: #b08d57; font-size: 9px; letter-spacing: 4px; text-transform: uppercase; }
        .ayrac:before, .ayrac:after { content: ''; flex: 1; border-top: 1px solid #d9c6a5; }
        .ikili { display: flex; gap: 14px; }
        .ikili > div { flex: 1; line-height: 1.6; }
        .ikili .k { font-size: 8.5px; letter-spacing: 3px; color: #b08d57; text-transform: uppercase; }
        .ikili .ad { font-size: 13px; font-style: italic; }
        .ikili table { width: 100%; border-collapse: collapse; }
        .ikili td { padding: 1.5px 0; }
        .ikili td.d { text-align: right; font-family: 'Segoe UI', Arial, sans-serif; font-weight: 600; }
        .urun { display: flex; align-items: center; gap: 14px; padding: 9px 0; border-bottom: 1px solid #ece2cf; }
        .rozet { width: 46px; height: 46px; border-radius: 50%; border: 1px solid #b08d57; box-shadow: inset 0 0 0 3px #fbf8f1, inset 0 0 0 4px #d9c6a5; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .rozet b { font-size: 15px; font-weight: 400; line-height: 1; }
        .rozet span { font-size: 6.5px; letter-spacing: 2px; color: #b08d57; }
        .urun .orta { flex: 1; }
        .urun .ad { font-size: 13px; }
        .urun .acik { font-style: italic; color: #7a6a58; font-size: 9.5px; }
        .urun .renk { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5px; letter-spacing: 1px; text-transform: uppercase; color: #7a6a58; }
        .urun .fiyat { width: 52mm; display: flex; align-items: baseline; gap: 6px; }
        .urun .fiyat i { flex: 1; border-bottom: 1px dotted #b08d57; transform: translateY(-3px); }
        .urun .fiyat b { font-weight: 400; font-size: 12.5px; white-space: nowrap; }
        .urun .isk { font-family: 'Segoe UI', Arial, sans-serif; color: #9a3412; font-size: 8.5px; }
        .alt { display: flex; gap: 16px; margin-top: 12px; }
        .bakim { flex: 1; background: #f4ecdd; padding: 9px 12px; line-height: 1.6; }
        .bakim .k { font-size: 8.5px; letter-spacing: 3px; color: #b08d57; text-transform: uppercase; }
        .bakim ul { margin: 4px 0 0 0; padding-left: 15px; font-style: italic; }
        .toplam { width: 78mm; }
        table.top { width: 100%; border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5px; }
        table.top td { padding: 3.5px 0; }
        table.top td.t { text-align: right; white-space: nowrap; }
        table.top tr.isk td { color: #9a3412; }
        table.top tr.ara td { border-top: 1px solid #b08d57; font-weight: 600; }
        .odenecek { text-align: center; margin-top: 8px; border-top: 1px solid #b08d57; border-bottom: 1px solid #b08d57; padding: 7px 0; }
        .odenecek .k { font-size: 8.5px; letter-spacing: 4px; color: #b08d57; }
        .odenecek .v { font-size: 22px; }
        .son { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 14px; }
        .son .not { font-style: italic; color: #7a6a58; line-height: 1.6; max-width: 120mm; }
        .yalniz { font-style: italic; text-align: center; margin-top: 6px; }`,
    body: `
<div class="sayfa"><div class="cerceve">
    <div class="bas">
        ${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fbf8f1" stroke="#b08d57" stroke-width="1.2"/><circle cx="32" cy="32" r="26" fill="none" stroke="#b08d57" stroke-width=".6"/><text x="32" y="40" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-style="italic" fill="#2d2620">NK</text></svg>`, 58, 58)}
        ${each(SUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div>`)}
    </div>
    <div class="ayrac">${t('e-Arşiv Fatura')}</div>
    <div class="ikili">
        <div><div class="k">${t('Sayın')}</div>${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}</div>
        <div style="flex:.75">
            <table>
                <tr><td>${t('Fatura No')}</td><td class="d">${v('$f/cbc:ID')}</td></tr>
                <tr><td>${t('Tarih / Saat')}</td><td class="d">${dt('$f/cbc:IssueDate')}${t(' ')}${v('substring($f/cbc:IssueTime,1,5)')}</td></tr>
                <tr><td>${t('Senaryo / Tip')}</td><td class="d">${meta()}</td></tr>
                <tr><td>${t('Ödeme')}</td><td class="d">${odeme}</td></tr>
                <tr><td colspan="2" style="font-family:Consolas,monospace;font-size:7.5px;color:#7a6a58;text-align:right">${v('$f/cbc:UUID')}</td></tr>
            </table>
        </div>
        <div style="flex:0 0 auto">${qr(82)}</div>
    </div>
    <div class="ayrac">${t('Seçimleriniz')}</div>
    ${each('$f/cac:InvoiceLine', `
    <div class="urun">
        <div class="rozet"><b>${choose([P('NUMARA'), v(P('NUMARA'))], [null, t('—')])}</b><span>${t('NO')}</span></div>
        <div class="orta">
            <div class="ad">${v('cac:Item/cbc:Name')}</div>
            <div class="acik">${v('cac:Item/cbc:Description')}${iff(P('MALZEME'), `${t(' · ')}${v(P('MALZEME'))}`)}</div>
            <div class="renk">${v(P('RENK'))}${iff('cac:Item/cbc:ModelName', `${t(' · ')}${v('cac:Item/cbc:ModelName')}`)}${t(' · ')}${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}${t(' · KDV %')}${v('cac:TaxTotal/cac:TaxSubtotal/cbc:Percent')}</div>
            ${each('cac:AllowanceCharge', `<div class="isk">${v('cbc:AllowanceChargeReason')}${t(' − ')}${money('cbc:Amount')}</div>`)}
        </div>
        <div class="fiyat"><i></i><b>${money('cbc:LineExtensionAmount')}</b></div>
    </div>`)}
    <div class="alt">
        <div class="bakim">
            <div class="k">${t('Bakım önerileri')}</div>
            <ul>
                <li>${t('Deri ayakkabılarınızı her kullanımdan sonra kalıbına geçirin.')}</li>
                <li>${t('Bakım kremini ayda bir, yumuşak bezle ince bir kat sürün.')}</li>
                <li>${t('Islanan ürünleri ısı kaynağından uzakta, oda sıcaklığında kurutun.')}</li>
            </ul>
        </div>
        <div class="toplam">
            <table class="top">${totals(satir)}</table>
            <div class="odenecek"><div class="k">${t('ÖDENEN TUTAR')}</div><div class="v">${money(`${LMT}/cbc:PayableAmount`)}</div></div>
        </div>
    </div>
    ${yalniz(`<div class="yalniz">${v('.')}</div>`)}
    <div class="son">
        <div class="not">${notes(`${v('.')}<br/>`)}</div>
        <div style="text-align:right;font-size:8.5px;letter-spacing:2px;color:#b08d57">${t('TEŞEKKÜR EDERİZ')}</div>
    </div>
</div></div>`,
});

/* ================================================================ 2. Butik giyim — editoryal */

const f2 = {
    id: 'butik-giyim-editoryal-arsiv',
    xml: invoice({
        comment: `Hazır şablon örneği: Butik giyim mağazasının perakende satışı — EARSIVFATURA · SATIS, KDV %10.
            Satırda BEDEN, RENK, RENKKOD, KUMAS ek tanımları; değişim kuponu AdditionalDocumentReference (DocumentType DEGISIM).`,
        profile: 'EARSIVFATURA', type: 'SATIS', id: 'KMB2026000003175', date: '2026-10-07', time: '15:05:00',
        notes: ['Kuponu kesip saklayın: değişimde fatura aranmaz.', 'Kaşmir ürünlerde kuru temizleme önerilir.'],
        docs: [{ id: 'DGS-58213', date: '2026-11-06', type: 'DEGISIM', desc: '30 gün içinde beden / renk değişimi' }],
        supplier: {
            web: 'https://www.kumrubutik.com', ids: [['VKN', '5103928476']],
            name: 'Kumru Butik Giyim Tic. Ltd. Şti.', addr: adr('Alsancak Mah. Kıbrıs Şehitleri Cad.', '96', 'Konak', 'İzmir', '35220'),
            vd: 'Kordon', tel: '0232 464 96 96', mail: 'merhaba@kumrubutik.com',
        },
        customer: kisi('41729305186', 'Derin', 'Ateşoğlu', adr('Mithatpaşa Cad. Deniz Apt.', '1180 D:4', 'Karabağlar', 'İzmir', '35290'), '0544 318 26 07', 'derin.a@example.com'),
        payment: { code: '48', due: '2026-10-07', note: 'Banka kartı · temassız' },
        lines: [
            { name: 'Yün Karışımlı Kruvaze Palto', desc: 'Astarlı, şal yaka', unit: 'C62', qty: 1, price: 7450, kdv: 10, model: 'AW26-PL-04', props: { BEDEN: 'M', RENK: 'Deve tüyü', RENKKOD: '#c19a6b', KUMAS: '%70 yün · %30 poliamid' } },
            { name: 'İpek Saten Bluz', desc: 'Fiyonk yaka, düğmeli manşet', unit: 'C62', qty: 1, price: 2980, kdv: 10, model: 'AW26-BL-11', props: { BEDEN: 'S', RENK: 'Ekru', RENKKOD: '#efe6d2', KUMAS: '%100 ipek' } },
            { name: 'Yüksek Bel Pileli Pantolon', desc: 'Geniş paça, kemer detaylı', unit: 'C62', qty: 1, price: 2390, kdv: 10, model: 'AW26-PT-02', props: { BEDEN: '36', RENK: 'Antrasit', RENKKOD: '#3f3f46', KUMAS: '%62 PES · %33 VIS · %5 EA' } },
            { name: 'Kaşmir Atkı', desc: '180 × 70 cm, saçaklı', unit: 'C62', qty: 1, price: 1850, kdv: 10, model: 'AW26-AC-07', disc: { rate: 0.15, reason: 'Sezon sonu %15' }, props: { BEDEN: 'STD', RENK: 'Bordo', RENKKOD: '#7f1d1d', KUMAS: '%100 kaşmir' } },
        ],
    }),
};
f2.xslt = xslt({
    title: 'e-Arşiv Fatura',
    comment: `Kumru Butik — butik giyim e-Arşiv faturası. Editoryal dergi kapağı konsepti: sayfa genişliğinde dev serif marka başlığı,
        sayı / sezon satırı, kapak yazısı gibi müşteri ve fatura bilgileri, 01–04 numaralı editoryal ürün listesi ve kesilebilir değişim kuponu.`,
    css: `
        body { background: #d6d3d1; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #111111; }
        .sayfa { background: #ffffff; padding: 9mm 12mm; }
        .sayi { display: flex; justify-content: space-between; font-size: 8.5px; letter-spacing: 3px; text-transform: uppercase; border-bottom: 1px solid #111111; padding-bottom: 4px; }
        .mast { font-family: 'Bodoni MT', Didot, 'Times New Roman', serif; font-size: 112px; line-height: .9; letter-spacing: -3px; text-align: center; margin: 4px 0 0 0; font-weight: 700; }
        .mast-alt { text-align: center; font-family: 'Bodoni MT', Georgia, serif; font-style: italic; font-size: 13px; border-bottom: 3px double #111111; padding-bottom: 6px; }
        .kapak { display: flex; gap: 16px; margin-top: 10px; }
        .kapak .sol { flex: 1; }
        .kapak .baslik { font-family: 'Bodoni MT', Georgia, serif; font-size: 26px; line-height: 1.05; font-style: italic; }
        .kapak .baslik b { font-style: normal; color: #b91c1c; }
        .kapak .kim { margin-top: 8px; line-height: 1.6; }
        .kapak .kim .ad { font-family: 'Bodoni MT', Georgia, serif; font-size: 15px; }
        .kapak .sag { width: 64mm; border-left: 1px solid #111111; padding-left: 12px; line-height: 1.75; }
        .kapak .sag .k { font-size: 7.5px; letter-spacing: 2px; text-transform: uppercase; color: #737373; }
        .kapak .sag .v { font-family: 'Bodoni MT', Georgia, serif; font-size: 13px; }
        .liste { margin-top: 12px; border-top: 1px solid #111111; }
        .kalem { display: flex; gap: 14px; padding: 10px 0; border-bottom: 1px solid #d4d4d4; align-items: baseline; }
        .kalem .no { font-family: 'Bodoni MT', Georgia, serif; font-size: 34px; line-height: 1; width: 16mm; color: #b91c1c; }
        .kalem .orta { flex: 1; }
        .kalem .ad { font-family: 'Bodoni MT', Georgia, serif; font-size: 16px; }
        .kalem .acik { color: #525252; margin-top: 2px; }
        .kalem .tag { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
        .kalem .tag i { display: inline-block; width: 9px; height: 9px; border-radius: 50%; vertical-align: -1px; margin-right: 4px; border: 1px solid #a3a3a3; }
        .kalem .sag { width: 40mm; text-align: right; font-family: 'Bodoni MT', Georgia, serif; font-size: 15px; }
        .kalem .sag small { display: block; font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5px; color: #b91c1c; }
        .alt { display: flex; gap: 16px; margin-top: 12px; }
        .alt .sol { flex: 1; font-family: 'Bodoni MT', Georgia, serif; font-style: italic; line-height: 1.6; font-size: 11px; }
        .alt .sag { width: 74mm; }
        table.top { width: 100%; border-collapse: collapse; }
        table.top td { padding: 3.5px 0; border-bottom: 1px solid #e5e5e5; }
        table.top td.t { text-align: right; white-space: nowrap; }
        table.top tr.isk td { color: #b91c1c; }
        table.top tr.ara td { font-weight: 700; border-bottom: 1px solid #111111; }
        .odenecek { display: flex; justify-content: space-between; align-items: baseline; padding: 8px 0; border-bottom: 3px double #111111; }
        .odenecek .k { font-size: 8px; letter-spacing: 3px; }
        .odenecek .v { font-family: 'Bodoni MT', Georgia, serif; font-size: 24px; }
        .kupon { margin-top: 16px; border: 1.5px dashed #111111; display: flex; position: relative; }
        .kupon:before { content: '✂'; position: absolute; left: 10mm; top: -10px; background: #ffffff; padding: 0 4px; font-size: 13px; }
        .kupon .sol { background: #111111; color: #ffffff; padding: 10px 14px; font-family: 'Bodoni MT', Georgia, serif; font-size: 22px; font-style: italic; display: flex; align-items: center; }
        .kupon .orta { flex: 1; padding: 8px 12px; line-height: 1.6; }
        .kupon .kod { font-family: Consolas, monospace; font-size: 15px; letter-spacing: 3px; font-weight: 700; }
        .kupon .qr { padding: 6px; border-left: 1.5px dashed #111111; }`,
    body: `
<div class="sayfa">
    <div class="sayi"><span>${t('Sayı ')}${v('substring($f/cbc:ID,10)')}</span><span>${t('Sonbahar / Kış ')}${v('substring($f/cbc:IssueDate,1,4)')}</span><span>${dt('$f/cbc:IssueDate')}</span></div>
    ${each(SUP, `<div class="mast">${t('KUMRU')}</div><div class="mast-alt">${pName}${t(' — ')}${pAddr(', ')}</div>`)}
    <div class="kapak">
        <div class="sol">
            <div class="baslik">${t('Bu sezon ')}<b>${v('count($f/cac:InvoiceLine)')}${t(' parça')}</b>${t(' seçtiniz;')}<br/>${t('işte faturanız.')}</div>
            <div class="kim">${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}</div>
        </div>
        <div class="sag">
            <div class="k">${t('e-Arşiv Fatura No')}</div><div class="v">${v('$f/cbc:ID')}</div>
            <div class="k">${t('Tarih · Saat')}</div><div class="v">${dt('$f/cbc:IssueDate')}${t(' · ')}${v('substring($f/cbc:IssueTime,1,5)')}</div>
            <div class="k">${t('Senaryo · Tip')}</div><div class="v">${meta()}</div>
            <div class="k">${t('Ödeme')}</div><div class="v">${odeme}</div>
            ${each(SUP, `<div class="k">${t('Satıcı')}</div><div style="font-size:8.5px">${pTax()}<br/>${pContact()}</div>`)}
        </div>
    </div>
    <div class="liste">
        ${each('$f/cac:InvoiceLine', `
        <div class="kalem">
            <div class="no">${v("format-number(cbc:ID,'00')")}</div>
            <div class="orta">
                <div class="ad">${v('cac:Item/cbc:Name')}</div>
                <div class="acik">${v('cac:Item/cbc:Description')}${t(' — ')}${v(P('KUMAS'))}</div>
                <div class="tag"><i>${attr('style', `background:${v(P('RENKKOD'))}`)}</i>${v(P('RENK'))}${t('   ·   Beden ')}${v(P('BEDEN'))}${t('   ·   ')}${v('cac:Item/cbc:ModelName')}</div>
            </div>
            <div class="sag">${money('cbc:LineExtensionAmount')}${each('cac:AllowanceCharge', `<small>${v('cbc:AllowanceChargeReason')}${t(' (−')}${money('cbc:Amount')}${t(')')}</small>`)}</div>
        </div>`)}
    </div>
    <div class="alt">
        <div class="sol">${yalniz(`${v('.')}<br/>`)}${notes(`${t('— ')}${v('.')}<br/>`)}</div>
        <div class="sag">
            <table class="top">${totals(satir)}</table>
            <div class="odenecek"><span class="k">${t('ÖDENEN')}</span><span class="v">${money(`${LMT}/cbc:PayableAmount`)}</span></div>
        </div>
    </div>
    ${each("$f/cac:AdditionalDocumentReference[cbc:DocumentType='DEGISIM']", `
    <div class="kupon">
        <div class="sol">${t('Değişim')}<br/>${t('Kuponu')}</div>
        <div class="orta">
            <div class="kod">${v('cbc:ID')}</div>
            ${v('cbc:DocumentDescription')}${t(' · Son tarih: ')}<b>${dt('cbc:IssueDate')}</b><br/>
            ${t('Fatura ')}${v('$f/cbc:ID')}${t(' · ETTN ')}<span style="font-family:Consolas,monospace;font-size:8px">${v('$f/cbc:UUID')}</span>
        </div>
        <div class="qr">${qr(74)}</div>
    </div>`)}
</div>`,
});

/* ================================================================ 3. Online moda mağazası (internet satışı) */

const f3 = {
    id: 'moda-eticaret-arsiv',
    xml: invoice({
        comment: `Hazır şablon örneği: Online moda mağazasının internet satışı — EARSIVFATURA · SATIS, KDV %10.
            GİB internet satışı bilgileri: web adresi (WebsiteURI), ödeme şekli / aracısı (PaymentMeans/InstructionNote), ödeme tarihi,
            gönderim tarihi ve taşıyıcı (Delivery/CarrierParty, TrackingID). İade kodu AdditionalDocumentReference (IADEKODU).
            Satırda BEDEN, RENK, RENKKOD ek tanımları; kupon iskontosu.`,
        profile: 'EARSIVFATURA', type: 'SATIS', id: 'MDL2026000094418', date: '2026-10-06', time: '21:14:00',
        notes: ['Bu satış internet üzerinden yapılmıştır.', 'Cayma hakkı: teslimden itibaren 14 gün içinde ücretsiz iade.'],
        order: { id: 'MDL-6612904', date: '2026-10-06' },
        docs: [{ id: 'IADE-7K3Q9X', date: '2026-10-20', type: 'IADEKODU', desc: 'Kargo şubesinde bu kodu gösterin' }],
        supplier: {
            web: 'https://www.modalina.com.tr', ids: [['VKN', '6203918475'], ['MERSISNO', '0620391847500018']],
            name: 'Modalina E-Ticaret A.Ş.', addr: adr('Maslak Mah. Büyükdere Cad.', '255', 'Sarıyer', 'İstanbul', '34485'),
            vd: 'Maslak', tel: '0850 460 66 25', mail: 'destek@modalina.com.tr',
        },
        customer: kisi('35290417638', 'Kaan', 'Yıldırım', adr('Bahçelievler Mah. 7. Cad.', '42/6', 'Çankaya', 'Ankara', '06490'), '0505 772 18 34', 'kaan.yildirim@example.com'),
        delivery: {
            tracking: 'RK 2610 4471 2289', date: '2026-10-07', time: '09:40:00',
            addr: adr('Bahçelievler Mah. 7. Cad.', '42/6', 'Çankaya', 'Ankara', '06490'),
            carrier: { ids: [['VKN', '7340192856']], name: 'Rota Kargo ve Lojistik A.Ş.', addr: { district: 'Esenyurt', city: 'İstanbul' } },
        },
        payment: { code: '48', due: '2026-10-06', note: 'Kredi kartı (3 taksit) · Ödeme aracısı: PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.' },
        lines: [
            { name: 'Oversize Kapüşonlu Sweatshirt', desc: 'Şardonlu üç iplik', unit: 'C62', qty: 1, price: 899.9, kdv: 10, sid: 'MDL-SW-3310', disc: { rate: 0.15, reason: 'Kupon MODA15' }, props: { BEDEN: 'L', RENK: 'Adaçayı', RENKKOD: '#94a684' } },
            { name: 'Mom Fit Jean', desc: 'Yüksek bel, taşlanmış', unit: 'C62', qty: 1, price: 1099.9, kdv: 10, sid: 'MDL-DN-0721', disc: { rate: 0.15, reason: 'Kupon MODA15' }, props: { BEDEN: '30/32', RENK: 'Açık mavi', RENKKOD: '#8fb3d9' } },
            { name: 'Basic Tişört 3\'lü Paket', desc: '%100 pamuk, bisiklet yaka', unit: 'SET', qty: 1, price: 599.9, kdv: 10, sid: 'MDL-TS-0003', props: { BEDEN: 'M', RENK: 'Beyaz · Siyah · Gri', RENKKOD: '#e5e7eb' } },
            { name: 'Kalın Taban Sneaker', desc: 'Suni deri, kauçuk taban', unit: 'PR', qty: 1, price: 1449.9, kdv: 10, sid: 'MDL-SN-1180', props: { BEDEN: '42', RENK: 'Kırık beyaz', RENKKOD: '#f5f0e6' } },
        ],
    }),
};
f3.xslt = xslt({
    title: 'e-Arşiv Fatura',
    comment: `Modalina — online moda mağazası e-Arşiv faturası (internet satışı). Mobil uygulama konsepti: mor-pembe degrade başlık,
        yuvarlak köşeli kartlar, sipariş durum çizelgesi, renkli ürün küçük resimleri, GİB internet satışı bilgi ızgarası ve barkodlu iade kodu kartı.`,
    css: `
        body { background: #ede9fe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; color: #1e1b4b; }
        .sayfa { background: #f5f3ff; padding: 0 0 9mm 0; }
        .ust { background: linear-gradient(120deg, #6d28d9 0%, #c026d3 55%, #f472b6 100%); color: #ffffff; padding: 9mm 11mm 16mm 11mm; border-radius: 0 0 26px 26px; }
        .ust .satir { display: flex; align-items: center; gap: 12px; }
        .ust .unvan { font-size: 17px; font-weight: 800; }
        .ust .adr { font-size: 9px; opacity: .85; line-height: 1.55; }
        .ust h1 { margin: 12px 0 0 0; font-size: 26px; font-weight: 800; letter-spacing: -.5px; }
        .ust h1 small { font-size: 11px; font-weight: 600; opacity: .85; margin-left: 8px; }
        .kartlar { padding: 0 11mm; margin-top: -11mm; }
        .kart { background: #ffffff; border-radius: 16px; box-shadow: 0 4px 14px rgba(76,29,149,.12); padding: 10px 14px; margin-bottom: 9px; }
        .kart .k { font-size: 8px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #a21caf; margin-bottom: 4px; }
        .durum { display: flex; align-items: center; }
        .durum .adim { flex: 1; text-align: center; position: relative; font-size: 8.5px; font-weight: 700; color: #6b7280; }
        .durum .adim:before { content: ''; position: absolute; top: 8px; left: -50%; right: 50%; height: 3px; background: #c4b5fd; }
        .durum .adim:first-child:before { display: none; }
        .durum .adim i { display: block; position: relative; width: 19px; height: 19px; margin: 0 auto 3px auto; border-radius: 50%; background: #7c3aed; color: #ffffff; font-style: normal; line-height: 19px; font-size: 10px; }
        .durum .adim.bek { color: #9ca3af; }
        .durum .adim.bek i { background: #e5e7eb; color: #9ca3af; }
        .ikili { display: flex; gap: 9px; }
        .ikili .kart { flex: 1; line-height: 1.55; }
        .ikili .ad { font-weight: 800; font-size: 12px; }
        .izgara { display: flex; flex-wrap: wrap; }
        .izgara > div { width: 33.3%; padding: 3px 0; }
        .izgara span { display: block; font-size: 8px; color: #6b7280; }
        .izgara b { font-size: 10px; }
        .urun { display: flex; align-items: center; gap: 12px; padding: 7px 0; border-bottom: 1px solid #f3e8ff; }
        .urun:last-child { border-bottom: 0; }
        .resim { width: 44px; height: 54px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: flex-end; justify-content: center; font-size: 8px; font-weight: 800; padding-bottom: 3px; color: #1e1b4b; box-shadow: inset 0 -16px 0 rgba(255,255,255,.65); }
        .urun .orta { flex: 1; }
        .urun .ad { font-weight: 800; font-size: 11px; }
        .urun .acik { color: #6b7280; font-size: 9px; }
        .hap { display: inline-block; background: #f3e8ff; color: #6d28d9; border-radius: 10px; padding: 1px 8px; font-size: 8.5px; font-weight: 700; margin: 3px 4px 0 0; }
        .hap.kupon { background: #fce7f3; color: #be185d; }
        .urun .sag { text-align: right; }
        .urun .sag s { color: #9ca3af; font-size: 9px; display: block; }
        .urun .sag b { font-size: 12px; }
        .alt { display: flex; gap: 9px; }
        .alt .kart { flex: 1; }
        table.top { width: 100%; border-collapse: collapse; }
        table.top td { padding: 3.5px 0; }
        table.top td.t { text-align: right; font-weight: 700; white-space: nowrap; }
        table.top tr.isk td { color: #be185d; }
        table.top tr.ara td { border-top: 1px dashed #c4b5fd; }
        .odenecek { margin-top: 6px; background: linear-gradient(120deg, #6d28d9, #c026d3); color: #ffffff; border-radius: 12px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; }
        .odenecek .v { font-size: 19px; font-weight: 800; }
        .iade { display: flex; align-items: center; gap: 12px; }
        .iade .kod { font-family: Consolas, monospace; font-size: 16px; font-weight: 700; letter-spacing: 2px; color: #6d28d9; }
        .iade .barkod { height: 30px; flex: 1; background-image: repeating-linear-gradient(90deg, #1e1b4b 0 2px, transparent 2px 3px, #1e1b4b 3px 4px, transparent 4px 7px, #1e1b4b 7px 10px, transparent 10px 11px); border-radius: 3px; }`,
    body: `
<div class="sayfa">
    <div class="ust">
        <div class="satir">
            ${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#ffffff"/><path d="M22 18 L27 14 Q32 19 37 14 L42 18 L49 26 L43 31 L41 28 L41 50 L23 50 L23 28 L21 31 L15 26 Z" fill="#c026d3"/></svg>`, 50, 50)}
            ${each(SUP, `<div><div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div></div>`)}
        </div>
        <h1>${t('Siparişin yolda!')}<small>${t('e-Arşiv Fatura · ')}${v('$f/cbc:ID')}</small></h1>
    </div>
    <div class="kartlar">
        <div class="kart">
            <div class="durum">
                <div class="adim"><i>${t('✓')}</i>${t('Sipariş alındı')}<br/>${dt('$f/cac:OrderReference/cbc:IssueDate')}</div>
                <div class="adim"><i>${t('✓')}</i>${t('Faturalandı')}<br/>${dt('$f/cbc:IssueDate')}</div>
                <div class="adim"><i>${t('✓')}</i>${t('Kargoya verildi')}<br/>${dt('$f/cac:Delivery/cac:Despatch/cbc:ActualDespatchDate')}</div>
                <div class="adim bek"><i>${t('4')}</i>${t('Teslim')}<br/>${t('1–2 iş günü')}</div>
            </div>
        </div>
        <div class="ikili">
            <div class="kart"><div class="k">${t('Teslimat & Fatura')}</div>${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}</div>
            <div class="kart" style="flex:0 0 auto;display:flex;align-items:center">${qr(86)}</div>
        </div>
        <div class="kart">
            <div class="k">${t('İnternet satışı bilgileri')}</div>
            <div class="izgara">
                <div><span>${t('Web adresi')}</span><b>${v(`${SUP}/cbc:WebsiteURI`)}</b></div>
                <div><span>${t('Sipariş no')}</span><b>${v('$f/cac:OrderReference/cbc:ID')}</b></div>
                <div><span>${t('Ödeme tarihi')}</span><b>${dt('$f/cac:PaymentMeans/cbc:PaymentDueDate')}</b></div>
                <div style="width:66.6%"><span>${t('Ödeme şekli / aracısı')}</span><b>${odeme}</b></div>
                <div><span>${t('Gönderim tarihi')}</span><b>${dt('$f/cac:Delivery/cac:Despatch/cbc:ActualDespatchDate')}</b></div>
                <div style="width:66.6%"><span>${t('Taşıyıcı')}</span><b>${v('$f/cac:Delivery/cac:CarrierParty/cac:PartyName/cbc:Name')}${t(' · VKN ')}${v('$f/cac:Delivery/cac:CarrierParty/cac:PartyIdentification/cbc:ID')}</b></div>
                <div><span>${t('Kargo takip')}</span><b>${v('$f/cac:Delivery/cbc:TrackingID')}</b></div>
                <div style="width:66.6%"><span>${t('ETTN')}</span><b style="font-family:Consolas,monospace;font-size:8.5px">${v('$f/cbc:UUID')}</b></div>
                <div><span>${t('Senaryo / Tip')}</span><b>${meta()}</b></div>
            </div>
        </div>
        <div class="kart">
            <div class="k">${t('Sepetin · ')}${v('count($f/cac:InvoiceLine)')}${t(' ürün')}</div>
            ${each('$f/cac:InvoiceLine', `
            <div class="urun">
                <div class="resim">${attr('style', `background:${v(P('RENKKOD'))}`)}${v(P('BEDEN'))}</div>
                <div class="orta">
                    <div class="ad">${v('cac:Item/cbc:Name')}</div>
                    <div class="acik">${v('cac:Item/cbc:Description')}${t(' · ')}${v('cac:Item/cac:SellersItemIdentification/cbc:ID')}</div>
                    <span class="hap">${t('Beden ')}${v(P('BEDEN'))}</span><span class="hap">${v(P('RENK'))}</span><span class="hap">${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}</span>
                    ${each('cac:AllowanceCharge', `<span class="hap kupon">${v('cbc:AllowanceChargeReason')}</span>`)}
                </div>
                <div class="sag">${iff('cac:AllowanceCharge', `<s>${money('cac:AllowanceCharge/cbc:BaseAmount')}</s>`)}<b>${money('cbc:LineExtensionAmount')}</b><br/><span style="font-size:8.5px;color:#6b7280">${t('KDV %')}${v('cac:TaxTotal/cac:TaxSubtotal/cbc:Percent')}</span></div>
            </div>`)}
        </div>
        <div class="alt">
            <div class="kart">
                <div class="k">${t('Kolay iade')}</div>
                ${each("$f/cac:AdditionalDocumentReference[cbc:DocumentType='IADEKODU']", `<div class="iade"><div><div class="kod">${v('cbc:ID')}</div>${v('cbc:DocumentDescription')}<br/>${t('Son iade tarihi: ')}<b>${dt('cbc:IssueDate')}</b></div><div class="barkod"></div></div>`)}
                <div style="margin-top:6px;color:#6b7280;line-height:1.5">${yalniz(`<b>${v('.')}</b><br/>`)}${notes(`${v('.')}<br/>`)}</div>
            </div>
            <div class="kart" style="flex:0 0 78mm">
                <table class="top">${totals(satir)}</table>
                <div class="odenecek"><span>${t('Ödenen')}</span><span class="v">${money(`${LMT}/cbc:PayableAmount`)}</span></div>
            </div>
        </div>
    </div>
</div>`,
});

/* ================================================================ 4. Terzi — ısmarlama takım elbise */

const f4 = {
    id: 'terzi-ismarlama-arsiv',
    xml: invoice({
        comment: `Hazır şablon örneği: Terzinin ısmarlama takım elbise satışı — EARSIVFATURA · SATIS. Giyim KDV %10, tadilat hizmeti %20.
            İlk satırda OLCU-xx (cm) ölçü kartı ve KUMAS; prova ve teslim tarihleri AdditionalDocumentReference (PROVA / TESLIM).`,
        profile: 'EARSIVFATURA', type: 'SATIS', id: 'KTR2026000000641', date: '2026-10-05', time: '12:30:00',
        notes: ['12.09.2026 tarihinde alınan 5.000,00 TL kapora bu faturanın ödemesine mahsup edilmiştir.', 'Kumaş artığı ve yedek düğmeler takımla birlikte teslim edilmiştir.'],
        docs: [
            { id: '1. Prova', date: '2026-09-24', type: 'PROVA', desc: 'Kaba prova — omuz ve yaka oturumu' },
            { id: '2. Prova', date: '2026-10-01', type: 'PROVA', desc: 'İnce prova — kol boyu ve paça' },
            { id: 'Teslim', date: '2026-10-05', type: 'TESLIM', desc: 'Ütülü, askılı kılıfta teslim' },
        ],
        supplier: {
            ids: [['VKN', '5728301946']], name: 'Kaya Terzihanesi — Hüsnü Kaya',
            addr: adr('Kızılay Mah. Sakarya Cad. Terziler Pasajı', '14/7', 'Çankaya', 'Ankara', '06420'),
            vd: 'Kızılbey', tel: '0312 431 14 07', mail: 'husnukaya@kayaterzihanesi.com',
        },
        customer: kisi('19384057266', 'Burak', 'Ertunç', adr('Ümitköy Mah. 8. Cad.', '19/3', 'Çankaya', 'Ankara', '06810'), '0532 271 90 44', 'burak.ertunc@example.com'),
        payment: { code: '10', due: '2026-10-05', note: 'Nakit + kapora mahsubu' },
        lines: [
            { name: 'Ismarlama Takım Elbise', desc: 'Tek düğme ceket, çift yırtmaç, kenar dikişli + pileli pantolon', unit: 'SET', qty: 1, price: 18500, kdv: 10, props: { KUMAS: 'Super 120\'s yün · Lacivert', 'OLCU-Göğüs': '104', 'OLCU-Bel': '88', 'OLCU-Kalça': '102', 'OLCU-Omuz': '46', 'OLCU-Kol': '63', 'OLCU-Boy': '182' } },
            { name: 'Ismarlama Yelek', desc: 'Beş düğmeli, ipek sırt', unit: 'C62', qty: 1, price: 4200, kdv: 10, props: { KUMAS: 'Takımla aynı kumaş' } },
            { name: 'Ismarlama Gömlek', desc: 'İtalyan yaka, monogramlı manşet', unit: 'C62', qty: 2, price: 1850, kdv: 10, props: { KUMAS: 'Poplin pamuk · Beyaz / Açık mavi' } },
            { name: 'Kol ve Paça Tadilatı', desc: 'Mevcut paltoda kol kısaltma', unit: 'C62', qty: 1, price: 450, kdv: 20, props: { KUMAS: 'Hizmet' } },
        ],
    }),
};
f4.xslt = xslt({
    title: 'e-Arşiv Fatura',
    comment: `Kaya Terzihanesi — ısmarlama takım elbise e-Arşiv faturası. Terzi kalıp kâğıdı konsepti: noktalı ızgara zemin, kesik çizgili
        kalıp parçası silüetleri, tebeşir mavisi başlıklar, mezura şeridi üzerinde ölçü kartı (OLCU-xx), prova zaman çizelgesi.`,
    css: `
        body { background: #d9d4c7; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; color: #1f2937; }
        .sayfa { background-color: #fbfaf5; background-image: radial-gradient(#c7c2b4 .8px, transparent .9px); background-size: 5mm 5mm; padding: 10mm 11mm; overflow: hidden; }
        .kalip { position: absolute; border: 1.5px dashed rgba(29,78,216,.18); pointer-events: none; }
        .kalip.k1 { width: 90mm; height: 120mm; border-radius: 45% 55% 20% 30%; right: -22mm; top: 40mm; transform: rotate(12deg); }
        .kalip.k2 { width: 60mm; height: 150mm; border-radius: 30% 30% 50% 50%; left: -26mm; top: 140mm; transform: rotate(-8deg); }
        .tebesir { font-family: 'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive; color: #1d4ed8; }
        .ust { display: flex; gap: 12px; align-items: flex-start; position: relative; }
        .ust .unvan { font-family: Georgia, serif; font-size: 18px; }
        .ust .adr { font-size: 9px; color: #6b7280; line-height: 1.55; }
        .ust h1 { margin: 6px 0 0 0; font-size: 26px; font-weight: 400; }
        .ust .bilgi { margin-left: auto; text-align: right; line-height: 1.6; }
        .ust .bilgi b { font-family: Consolas, monospace; }
        .mezura { margin: 12px 0 10px 0; position: relative; height: 15mm; background-color: #fde047; background-image: repeating-linear-gradient(90deg, #3f3f00 0 1px, transparent 1px 3.78px), repeating-linear-gradient(90deg, #3f3f00 0 1.4px, transparent 1.4px 18.9px); background-size: 100% 3.4mm, 100% 5.5mm; background-repeat: repeat-x; border-top: 1px solid #ca8a04; border-bottom: 1px solid #ca8a04; display: flex; align-items: flex-end; }
        .mezura .olcu { flex: 1; text-align: center; padding-bottom: 2px; }
        .mezura .olcu b { display: block; font-family: Georgia, serif; font-size: 15px; color: #1f2937; line-height: 1; }
        .mezura .olcu span { font-size: 7.5px; letter-spacing: 1px; text-transform: uppercase; color: #713f12; font-weight: 700; }
        .ikili { display: flex; gap: 12px; position: relative; }
        .ikili > div { flex: 1; background: rgba(255,255,255,.75); border: 1px solid #d6d3c8; padding: 8px 11px; line-height: 1.55; }
        .ikili .ad { font-family: Georgia, serif; font-size: 13px; }
        .prova { display: flex; margin: 10px 0 4px 0; position: relative; }
        .prova > div { flex: 1; position: relative; padding-top: 16px; text-align: center; font-size: 9px; }
        .prova > div:before { content: ''; position: absolute; top: 6px; left: 0; right: 0; border-top: 2px dashed #1d4ed8; }
        .prova > div:after { content: '✕'; position: absolute; top: -2px; left: 50%; margin-left: -6px; color: #1d4ed8; font-weight: 700; font-size: 13px; background: #fbfaf5; }
        .prova b { display: block; font-size: 11px; }
        table.kalem { width: 100%; border-collapse: collapse; margin-top: 10px; position: relative; background: rgba(255,255,255,.7); }
        table.kalem th { text-align: left; font-weight: 400; color: #1d4ed8; font-size: 12px; border-bottom: 2px solid #1d4ed8; padding: 4px 6px; }
        table.kalem td { padding: 7px 6px; border-bottom: 1px dashed #c7c2b4; vertical-align: top; }
        table.kalem .sag { text-align: right; white-space: nowrap; }
        table.kalem .ad { font-family: Georgia, serif; font-size: 12px; }
        table.kalem .acik { color: #6b7280; font-size: 9px; }
        .alt { display: flex; gap: 14px; margin-top: 12px; position: relative; }
        .alt .sol { flex: 1; line-height: 1.6; }
        .alt .sag { width: 78mm; background: rgba(255,255,255,.8); border: 1px solid #d6d3c8; padding: 8px 10px; }
        table.top { width: 100%; border-collapse: collapse; }
        table.top td { padding: 3px 0; }
        table.top td.t { text-align: right; font-weight: 700; white-space: nowrap; }
        table.top tr.ara td { border-top: 2px solid #1d4ed8; }
        .odenecek { margin-top: 6px; text-align: right; }
        .odenecek .v { font-family: Georgia, serif; font-size: 22px; }
        .imza { margin-top: 14px; display: flex; justify-content: space-between; position: relative; }
        .imza div { width: 60mm; border-top: 1px solid #1f2937; text-align: center; padding-top: 3px; font-size: 9px; color: #6b7280; }`,
    body: `
<div class="sayfa">
    <div class="kalip k1"></div><div class="kalip k2"></div>
    <div class="ust">
        ${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1d4ed8"/><path d="M18 46 L30 20 L34 20 L46 46" fill="none" stroke="#fde047" stroke-width="3" stroke-linecap="round"/><circle cx="22" cy="46" r="4" fill="none" stroke="#ffffff" stroke-width="2"/><circle cx="42" cy="46" r="4" fill="none" stroke="#ffffff" stroke-width="2"/><line x1="32" y1="14" x2="32" y2="21" stroke="#ffffff" stroke-width="2"/></svg>`, 56, 56)}
        <div>
            ${each(SUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div>`)}
            <h1 class="tebesir">${t('Ismarlama — e-Arşiv Fatura')}</h1>
        </div>
        <div class="bilgi">
            ${t('No ')}<b>${v('$f/cbc:ID')}</b><br/>${t('Tarih ')}<b>${dt('$f/cbc:IssueDate')}</b><br/>${meta()}<br/>
            <div style="display:inline-block;margin-top:4px;background:#ffffff;padding:3px">${qr(72)}</div>
        </div>
    </div>
    ${each('$f/cac:InvoiceLine[1]', `<div class="mezura">${each(PS('OLCU-'), `<div class="olcu"><b>${v('.')}</b><span>${v("substring-after(@schemeID,'-')")}${t(' cm')}</span></div>`)}</div>`)}
    <div class="ikili">
        <div><span class="tebesir" style="font-size:12px">${t('Müşteri')}</span>${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}</div>
        <div style="flex:.8"><span class="tebesir" style="font-size:12px">${t('Kumaş & ödeme')}</span><br/>${v(`$f/cac:InvoiceLine[1]/${P('KUMAS')}`)}<br/>${t('Ödeme: ')}<b>${odeme}</b><br/><span style="font-family:Consolas,monospace;font-size:8px;color:#6b7280">${t('ETTN ')}${v('$f/cbc:UUID')}</span></div>
    </div>
    <div class="prova">${each("$f/cac:AdditionalDocumentReference[cbc:DocumentType='PROVA' or cbc:DocumentType='TESLIM']", `<div><b class="tebesir">${v('cbc:ID')}</b>${dt('cbc:IssueDate')}<br/><span style="color:#6b7280">${v('cbc:DocumentDescription')}</span></div>`)}</div>
    <table class="kalem">
        <tr><th class="tebesir">${t('Ürün / İşçilik')}</th><th class="tebesir">${t('Kumaş')}</th><th class="tebesir sag">${t('Miktar')}</th><th class="tebesir sag">${t('Birim')}</th><th class="tebesir sag">${t('KDV')}</th><th class="tebesir sag">${t('Tutar')}</th></tr>
        ${each('$f/cac:InvoiceLine', `<tr>
            <td><div class="ad">${v('cac:Item/cbc:Name')}</div><div class="acik">${v('cac:Item/cbc:Description')}</div></td>
            <td>${v(P('KUMAS'))}</td>
            <td class="sag">${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}</td>
            <td class="sag">${money('cac:Price/cbc:PriceAmount')}</td>
            <td class="sag">${t('%')}${v('cac:TaxTotal/cac:TaxSubtotal/cbc:Percent')}</td>
            <td class="sag"><b>${money('cbc:LineExtensionAmount')}</b></td>
        </tr>`)}
    </table>
    <div class="alt">
        <div class="sol">${yalniz(`<div class="tebesir" style="font-size:12px">${v('.')}</div>`)}<ul style="padding-left:16px">${notes(`<li>${v('.')}</li>`)}</ul></div>
        <div class="sag">
            <table class="top">${totals(satir)}</table>
            <div class="odenecek"><span class="tebesir">${t('Ödenecek ')}</span><span class="v">${money(`${LMT}/cbc:PayableAmount`)}</span></div>
        </div>
    </div>
    <div class="imza"><div>${t('Teslim eden — Usta')}</div><div>${t('Teslim alan — Müşteri')}</div></div>
</div>`,
});

/* ================================================================ 5. Çocuk ayakkabı mağazası */

const f5 = {
    id: 'cocuk-ayakkabi-arsiv',
    xml: invoice({
        comment: `Hazır şablon örneği: Çocuk ayakkabı mağazasının perakende satışı — EARSIVFATURA · SATIS, KDV %10.
            Satırda NUMARA, RENK, AYAK (ölçülen ayak uzunluğu), GENISLIK ek tanımları; bir sonraki ölçüm hatırlatması
            AdditionalDocumentReference (DocumentType OLCUM).`,
        profile: 'EARSIVFATURA', type: 'SATIS', id: 'MNA2026000007729', date: '2026-10-07', time: '11:25:00',
        notes: ['Ölçüm: Ela (2 yaş) ve Can (6 yaş) · Ölçen: Gizem K.', 'Çocuk ayağı 3–4 ayda bir numara büyür; düzenli ölçüm öneririz.'],
        docs: [{ id: 'Ölçüm günü', date: '2027-01-07', type: 'OLCUM', desc: 'Ücretsiz ayak ölçümü için bekleriz' }],
        supplier: {
            web: 'https://www.minikadimlar.com.tr', ids: [['VKN', '6017294385']],
            name: 'Minik Adımlar Çocuk Ayakkabı Ltd. Şti.', addr: adr('Nilüfer Mah. FSM Bulvarı', '118', 'Nilüfer', 'Bursa', '16110'),
            vd: 'Nilüfer', tel: '0224 452 11 22', mail: 'merhaba@minikadimlar.com.tr',
        },
        customer: kisi('50318274961', 'Merve', 'Toprak', adr('Ataevler Mah. Gökçe Sok.', '6/2', 'Nilüfer', 'Bursa', '16140'), '0537 618 03 92', 'merve.toprak@example.com'),
        payment: { code: '48', due: '2026-10-07', note: 'Kredi kartı · tek çekim' },
        lines: [
            { name: 'İlk Adım Ayakkabısı', desc: 'Esnek taban, bilek destekli', unit: 'PR', qty: 1, price: 1290, kdv: 10, props: { NUMARA: '21', RENK: 'Pembe', RENKKOD: '#f9a8d4', AYAK: '12,8 cm', GENISLIK: 'Geniş (G)' } },
            { name: 'Su Geçirmez Yağmur Botu', desc: 'Polar astarlı, reflektörlü', unit: 'PR', qty: 1, price: 890, kdv: 10, props: { NUMARA: '22', RENK: 'Sarı', RENKKOD: '#fde047', AYAK: '12,8 cm', GENISLIK: 'Geniş (G)' } },
            { name: 'Okul Ayakkabısı', desc: 'Deri saya, cırt cırtlı', unit: 'PR', qty: 1, price: 1590, kdv: 10, disc: { rate: 0.1, reason: 'Okula dönüş %10' }, props: { NUMARA: '31', RENK: 'Lacivert', RENKKOD: '#93c5fd', AYAK: '19,4 cm', GENISLIK: 'Orta (F)' } },
            { name: 'Kaydırmaz Taban Çorap 3\'lü', desc: 'Pamuklu, silikon noktalı', unit: 'SET', qty: 2, price: 179, kdv: 10, props: { NUMARA: '19-22', RENK: 'Karışık', RENKKOD: '#a7f3d0' } },
        ],
    }),
};
f5.xslt = xslt({
    title: 'e-Arşiv Fatura',
    comment: `Minik Adımlar — çocuk ayakkabı mağazası e-Arşiv faturası. Oyunbaz pastel konsept: yuvarlak renkli lekeler, ayak izi simgeleri,
        her ürün farklı pastel renkte kart, ayak izi içinde numara, ölçülen ayak uzunluğu ve genişlik, bir sonraki ölçüm günü hatırlatma kartı.`,
    css: `
        body { background: #fef3c7; font-family: 'Trebuchet MS', 'Segoe UI', sans-serif; font-size: 10.5px; color: #3b3355; }
        .sayfa { background: #fffdf7; padding: 10mm 11mm; overflow: hidden; }
        .leke { position: absolute; border-radius: 50%; opacity: .55; }
        .leke.l1 { width: 70mm; height: 70mm; background: #fbcfe8; right: -20mm; top: -22mm; }
        .leke.l2 { width: 40mm; height: 40mm; background: #bae6fd; right: 42mm; top: -14mm; }
        .leke.l3 { width: 60mm; height: 60mm; background: #bbf7d0; left: -24mm; bottom: -18mm; }
        .ust { position: relative; display: flex; gap: 12px; align-items: center; }
        .ust .unvan { font-size: 19px; font-weight: 700; color: #7c3aed; }
        .ust .adr { font-size: 9px; color: #6b6585; line-height: 1.55; }
        .baslik { position: relative; margin: 12px 0 8px 0; display: flex; align-items: center; gap: 10px; }
        .baslik h1 { margin: 0; font-size: 24px; color: #3b3355; }
        .baslik .iz { font-size: 18px; letter-spacing: 6px; color: #f472b6; }
        .ikili { display: flex; gap: 10px; position: relative; }
        .ikili > div { background: #ffffff; border-radius: 18px; border: 2px solid #ede9fe; padding: 9px 13px; line-height: 1.55; }
        .ikili .k { font-size: 8.5px; font-weight: 700; color: #7c3aed; letter-spacing: 1px; text-transform: uppercase; }
        .ikili .ad { font-size: 13px; font-weight: 700; }
        .urunler { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 11px; position: relative; }
        .urun { width: calc(50% - 4.5px); border-radius: 20px; padding: 10px 12px; display: flex; gap: 10px; align-items: center; }
        .urun:nth-child(4n+1) { background: #fce7f3; }
        .urun:nth-child(4n+2) { background: #fef9c3; }
        .urun:nth-child(4n+3) { background: #dbeafe; }
        .urun:nth-child(4n+4) { background: #dcfce7; }
        .ayak { width: 40px; height: 54px; flex-shrink: 0; background-size: 100% 100%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; color: #ffffff; padding-top: 10px; }
        .ayak.uzun { font-size: 8px; letter-spacing: -.2px; }
        .urun .orta { flex: 1; }
        .urun .ad { font-weight: 700; font-size: 11.5px; }
        .urun .acik { font-size: 9px; color: #6b6585; }
        .urun .olc { display: inline-block; margin-top: 3px; background: #ffffff; border-radius: 10px; padding: 1px 8px; font-size: 8.5px; font-weight: 700; }
        .urun .fiyat { font-size: 13px; font-weight: 700; margin-top: 3px; }
        .urun .isk { font-size: 8.5px; color: #db2777; font-weight: 700; }
        .alt { display: flex; gap: 10px; margin-top: 11px; position: relative; }
        .hatir { flex: 1; background: #ede9fe; border-radius: 20px; padding: 10px 14px; line-height: 1.6; }
        .hatir .gun { font-size: 22px; font-weight: 700; color: #7c3aed; }
        .toplam { width: 80mm; background: #ffffff; border-radius: 20px; border: 2px solid #ede9fe; padding: 9px 12px; }
        table.top { width: 100%; border-collapse: collapse; }
        table.top td { padding: 3px 0; }
        table.top td.t { text-align: right; font-weight: 700; white-space: nowrap; }
        table.top tr.isk td { color: #db2777; }
        table.top tr.ara td { border-top: 2px dotted #c4b5fd; }
        .odenecek { margin-top: 6px; background: #7c3aed; color: #ffffff; border-radius: 14px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
        .odenecek .v { font-size: 19px; font-weight: 700; }
        .notlar { position: relative; margin-top: 9px; color: #6b6585; line-height: 1.6; }`,
    body: `
<div class="sayfa">
    <div class="leke l1"></div><div class="leke l2"></div><div class="leke l3"></div>
    <div class="ust">
        ${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#7c3aed"/><ellipse cx="25" cy="38" rx="7" ry="11" fill="#fde047"/><circle cx="21" cy="23" r="2.4" fill="#fde047"/><circle cx="26" cy="21.5" r="2.1" fill="#fde047"/><ellipse cx="41" cy="31" rx="6" ry="9.5" fill="#f9a8d4"/><circle cx="38" cy="18.5" r="2" fill="#f9a8d4"/><circle cx="42.5" cy="17.5" r="1.8" fill="#f9a8d4"/></svg>`, 58, 58)}
        ${each(SUP, `<div style="flex:1"><div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div></div>`)}
        <div style="background:#ffffff;padding:5px;border-radius:12px">${qr(76)}</div>
    </div>
    <div class="baslik"><h1>${t('e-Arşiv Fatura')}</h1><span class="iz">${t('👣 👣 👣')}</span></div>
    <div class="ikili">
        <div style="flex:1"><div class="k">${t('Aile')}</div>${each(CUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}</div>
        <div style="width:70mm"><div class="k">${t('Fatura')}</div>${t('No: ')}<b>${v('$f/cbc:ID')}</b><br/>${t('Tarih: ')}<b>${dt('$f/cbc:IssueDate')}${t(' ')}${v('substring($f/cbc:IssueTime,1,5)')}</b><br/>${meta()}<br/>${t('Ödeme: ')}<b>${odeme}</b><br/><span style="font-family:Consolas,monospace;font-size:7.5px">${v('$f/cbc:UUID')}</span></div>
    </div>
    <div class="urunler">
        ${each('$f/cac:InvoiceLine', `
        <div class="urun">
            <div class="ayak">${attr('style', `background-image:url(&quot;${svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 54"><ellipse cx="20" cy="33" rx="13" ry="19" fill="#7c3aed"/><circle cx="9" cy="10" r="3.6" fill="#7c3aed"/><circle cx="16" cy="6.5" r="3.4" fill="#7c3aed"/><circle cx="23.5" cy="6" r="3.1" fill="#7c3aed"/><circle cx="30" cy="8.5" r="2.8" fill="#7c3aed"/><circle cx="35" cy="13" r="2.4" fill="#7c3aed"/></svg>')}&quot;)`)}${iff(`string-length(${P('NUMARA')}) &gt; 2`, attr('class', 'ayak uzun'))}${v(P('NUMARA'))}</div>
            <div class="orta">
                <div class="ad">${v('cac:Item/cbc:Name')}</div>
                <div class="acik">${v('cac:Item/cbc:Description')}${t(' · ')}${v(P('RENK'))}${t(' · ')}${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}</div>
                ${iff(P('AYAK'), `<span class="olc">${t('📏 ')}${v(P('AYAK'))}${t(' · ')}${v(P('GENISLIK'))}</span>`)}
                ${each('cac:AllowanceCharge', `<div class="isk">${v('cbc:AllowanceChargeReason')}${t(' −')}${money('cbc:Amount')}</div>`)}
                <div class="fiyat">${money('cbc:LineExtensionAmount')}</div>
            </div>
        </div>`)}
    </div>
    <div class="alt">
        <div class="hatir">
            ${each("$f/cac:AdditionalDocumentReference[cbc:DocumentType='OLCUM']", `<b>${v('cbc:ID')}</b><div class="gun">${dt('cbc:IssueDate')}</div>${v('cbc:DocumentDescription')}`)}
            <div style="margin-top:6px">${yalniz(`<b>${v('.')}</b>`)}</div>
        </div>
        <div class="toplam">
            <table class="top">${totals(satir)}</table>
            <div class="odenecek"><span>${t('Ödenen')}</span><span class="v">${money(`${LMT}/cbc:PayableAmount`)}</span></div>
        </div>
    </div>
    <div class="notlar">${notes(`${t('★ ')}${v('.')}<br/>`)}</div>
</div>`,
});

export default [f1, f2, f3, f4, f5];
