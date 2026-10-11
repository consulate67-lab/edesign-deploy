// e-Sigorta Komisyon Gider Belgesi tasarımları (EARSIVBELGE · SIGORTAKOMISYONGIDERBELGESI).
import { dt, each, iff, logo, num, qr, t, v, yaziyla } from '../moda/lib.mjs';
import { creditNote, r2 } from './xml.mjs';
import { CUS, LMT, SG, SUP, cnXslt, meta, notes, partyBlock, tl, yalniz } from './kit.mjs';

/**
 * Her branş satırında istihsal (ChargeIndicator true) ve iptal (false) komisyonu; toplamlar GİB örneğindeki gibi
 * AllowanceTotalAmount (istihsal) ve ChargeTotalAmount (iptal) alanlarında. Satır ve ödenecek tutar net komisyondur.
 * lines: [{ name, desc, n (poliçe adedi), rate, prim (istihsal prim matrahı), iptal (iptal prim matrahı) }]
 */
const sigorta = (d) => {
    const lines = d.lines.map((l) => {
        const ist = r2(l.prim * l.rate);
        const ipt = r2(l.iptal * l.rate);
        return {
            name: l.name, desc: l.desc, qty: l.n, cur: 'TRY', amount: r2(ist - ipt), ist, ipt,
            ac: [{ charge: false, reason: 'IPTAL', rate: l.rate, amount: ipt, base: l.iptal }, { charge: true, reason: 'Istihsal', rate: l.rate, amount: ist, base: l.prim }],
        };
    });
    const ist = r2(lines.reduce((a, l) => a + l.ist, 0));
    const ipt = r2(lines.reduce((a, l) => a + l.ipt, 0));
    const net = r2(ist - ipt);
    return creditNote({
        ...d, profile: 'EARSIVBELGE', type: 'SIGORTAKOMISYONGIDERBELGESI', currency: 'TRY',
        notes: [yaziyla(net, 'TRY'), ...(d.notes ?? [])],
        payments: [{ code: '42', due: d.due, payee: d.bank[2], cur: 'TRY', bank: [d.bank[0], d.bank[1]] }],
        lmt: [['LineExtensionAmount', net, 'TRY'], ['TaxExclusiveAmount', net, 'TRY'], ['TaxInclusiveAmount', net, 'TRY'],
            ['AllowanceTotalAmount', ist, 'TRY'], ['ChargeTotalAmount', ipt, 'TRY'], ['PayableAmount', net, 'TRY']],
        lines,
    });
};

const addr = (street, no, district, city, zip) => ({ street, no, district, city, zip });
const TEBLIG = 'Bu belge 509 Sıra No\'lu VUK Genel Tebliği kapsamında sigorta şirketi tarafından elektronik ortamda düzenlenmiştir.';
const NET = `${LMT}/cbc:PayableAmount`;
/** Satır bağlamında: net komisyonun istihsale oranı (%). */
const ORAN_NET = `round(cbc:LineExtensionAmount div (${SG.ist} + 0.0001) * 100)`;
const width = (expr) => `<xsl:attribute name="style">width:<xsl:value-of select="${expr}"/>%</xsl:attribute>`;

/* ------------------------------------------------------------- 1. Bankasürans */

const banka = {
    id: 'bankasurans-komisyon-gider',
    sector: 'sigorta',
    accent: '#0369a1',
    name: 'Bankasürans Komisyon Gider Belgesi',
    description: 'Hayat ve emeklilik şirketinin acente bankaya düzenlediği aylık e-Sigorta Komisyon Gider Belgesi: istihsal / iptal / net gösterge kutuları, branş bazında prim matrahı, oran ve komisyon sütunları, banka hesabına ödeme bilgisi.',
    tags: ['Bankasürans', 'Hayat', 'İstihsal / iptal', 'Gösterge kutuları', 'Aylık dönem'],
    xml: sigorta({
        comment: 'Hazır şablon örneği: Bankasürans Komisyon Gider Belgesi — EARSIVBELGE · SIGORTAKOMISYONGIDERBELGESI (hayat şirketinden acente bankaya).',
        id: 'ATH2026000009184', date: '2026-10-05', time: '10:00:00',
        period: { start: '2026-09-01', end: '2026-09-30', desc: 'EYLÜL - 2026' },
        supplier: {
            name: 'Atlas Hayat ve Emeklilik A.Ş.', web: 'https://www.atlashayat.com.tr',
            ids: [['VKN', '1084729356'], ['TICARETSICILNO', '512844-0'], ['MERSISNO', '0108472935600016']],
            addr: addr('Saray Mahallesi Dr. Adnan Büyükdeniz Caddesi', '4', 'Ümraniye', 'İstanbul', '34768'), vd: 'Büyük Mükellefler', tel: '(216) 444 28 56', mail: 'bankasurans@atlashayat.com.tr',
        },
        customer: {
            name: 'Lodos Bankası A.Ş.', ids: [['VKN', '6080412395'], ['LEVHANO', 'T34-2011-08127']],
            addr: addr('Ankara Caddesi', '81', 'Bornova', 'İzmir', '35030'), vd: 'Bornova', tel: '0850 222 56 37', mail: 'sigorta.operasyon@lodosbank.com.tr',
        },
        bank: ['Lodos Bankası A.Ş.', 'Genel Müdürlük', 'TR710009900000000410000101'], due: '2026-10-15',
        notes: ['Komisyonlar Lodos Bankası şube kanalında satılan poliçeler için hesaplanmıştır.', 'İptal komisyonları, ilgili dönemde iptal edilen poliçelerin iade primleri üzerinden mahsup edilmiştir.', TEBLIG],
        lines: [
            { name: 'Hayat', desc: 'Kredi bağlantılı hayat · 412 poliçe', n: 412, rate: 0.25, prim: 1284600, iptal: 96300 },
            { name: 'Kaza', desc: 'Ferdi kaza · 188 poliçe', n: 188, rate: 0.30, prim: 214800, iptal: 12400 },
            { name: 'Yangın Ve Doğal Afetler', desc: 'Konut paket · 236 poliçe', n: 236, rate: 0.20, prim: 438200, iptal: 18900 },
            { name: 'Zorunlu Deprem (DASK)', desc: '301 poliçe', n: 301, rate: 0.175, prim: 286950, iptal: 9100 },
        ],
    }),
    xslt: cnXslt({
        title: 'e-Sigorta Komisyon Gider Belgesi',
        comment: 'Bankasürans Komisyon Gider Belgesi: istihsal/iptal/net gösterge kutuları ve branş tablosu.',
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #0c1a2b; padding: 12mm 13mm; background: #fff; }
            .bas { display: flex; justify-content: space-between; align-items: center; padding-bottom: 5mm; border-bottom: 1px solid #e0f2fe; }
            .bas h1 { margin: 0; font-size: 15pt; color: #075985; text-align: right; } .bas h1 small { display: block; font-size: 8.5pt; color: #64748b; font-weight: 400; margin-top: 1mm; }
            .donem { display: inline-block; margin-top: 2mm; background: #0369a1; color: #fff; border-radius: 10mm; padding: 1mm 4mm; font-size: 8.5pt; font-weight: 700; }
            .taraf { display: grid; grid-template-columns: 1fr 1fr 62mm; gap: 6mm; margin-top: 6mm; }
            h3 { margin: 0 0 2mm; font-size: 7.6pt; text-transform: uppercase; letter-spacing: 1.2px; color: #0369a1; }
            .p-ad { font-weight: 700; font-size: 10pt; } .p-adr, .p-vk, .p-il, .p-ek { font-size: 8pt; color: #475569; margin-top: .6mm; } .p-ek i { font-style: normal; color: #0369a1; }
            .mt { font-size: 8pt; display: grid; grid-template-columns: auto 1fr; gap: .8mm 3mm; } .mt i { font-style: normal; color: #64748b; } .mt span { word-break: break-all; }
            .kpi { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-top: 7mm; }
            .kpi div { border-radius: 3mm; padding: 4.5mm 5mm; background: #f0f9ff; border: 1px solid #bae6fd; } .kpi i { display: block; font-style: normal; font-size: 7.8pt; color: #0369a1; text-transform: uppercase; letter-spacing: 1px; }
            .kpi b { font-size: 15pt; } .kpi .ipt { background: #fff7ed; border-color: #fed7aa; } .kpi .ipt i { color: #c2410c; } .kpi .net { background: #0369a1; border-color: #0369a1; color: #fff; } .kpi .net i { color: #bae6fd; }
            table.br { width: 100%; border-collapse: collapse; margin-top: 7mm; font-variant-numeric: tabular-nums; }
            table.br th { background: #0c4a6e; color: #fff; font-weight: 600; font-size: 7.6pt; padding: 2mm 1.8mm; text-align: right; } table.br th:first-child { text-align: left; border-radius: 2mm 0 0 0; } table.br th:last-child { border-radius: 0 2mm 0 0; }
            table.br td { padding: 2.6mm 1.8mm; border-bottom: 1px solid #e2e8f0; text-align: right; } table.br td:first-child { text-align: left; } table.br tr:nth-child(odd) td { background: #f8fafc; }
            .ac { display: block; font-size: 7.6pt; color: #64748b; } .ip { color: #c2410c; }
            table.br tr.top td { background: #e0f2fe; font-weight: 700; border-top: 2px solid #0369a1; }
            .alt { display: grid; grid-template-columns: 1fr auto; gap: 8mm; margin-top: 7mm; align-items: end; }
            .odeme { border-left: 1.5mm solid #0369a1; padding: 3mm 5mm; background: #f8fafc; font-size: 8.5pt; } .odeme b { display: block; font-size: 11pt; margin-top: 1mm; }
            .yz { font-style: italic; margin-top: 2mm; color: #334155; }
            ul.n { margin: 6mm 0 0; padding-left: 4mm; font-size: 7.6pt; color: #64748b; line-height: 1.6; }
        `,
        body: `<div class="sayfa">
    <div class="bas">${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 44"><circle cx="22" cy="22" r="18" fill="none" stroke="#0369a1" stroke-width="3"/><path d="M4 22h36M22 4c-8 10-8 26 0 36M22 4c8 10 8 26 0 36" fill="none" stroke="#0369a1" stroke-width="1.6"/><text x="48" y="24" font-family="Segoe UI,Arial" font-weight="800" font-size="17" fill="#0c4a6e">ATLAS</text><text x="49" y="35" font-family="Segoe UI,Arial" font-size="7.5" letter-spacing="1.6" fill="#0369a1">HAYAT · EMEKLİLİK</text></svg>`, 150, 44)}
        <div style="text-align:right"><h1>${t('Komisyon Gider Belgesi')}<small>${t('e-Sigorta Komisyon Gider Belgesi · Bankasürans')}</small></h1><span class="donem">${SG.donem}</span></div></div>
    <div class="taraf"><div><h3>${t('Sigorta Şirketi')}</h3>${partyBlock(SUP)}</div><div><h3>${t('Acente (Banka)')}</h3>${partyBlock(CUS)}</div>
        <div><h3>${t('Belge')}</h3><div class="mt">${meta((a, b) => `<i>${a}</i><span>${b}</span>`)}<i>${t('Dönem')}</i><span>${SG.donemAralik}</span></div></div></div>
    <div class="kpi"><div><i>${t('İstihsal komisyonu')}</i><b>${tl(SG.istTop)}</b></div><div class="ipt"><i>${t('İptal komisyonu')}</i><b>${t('− ')}${tl(SG.iptTop)}</b></div><div class="net"><i>${t('Net komisyon')}</i><b>${tl(NET)}</b></div></div>
    <table class="br"><tr><th>${t('Branş')}</th><th>${t('Poliçe')}</th><th>${t('Prim Matrahı')}</th><th>${t('Oran')}</th><th>${t('İstihsal Kom.')}</th><th>${t('İptal Matrahı')}</th><th>${t('İptal Kom.')}</th><th>${t('Net')}</th></tr>
        ${SG.satirlar(`<tr><td><b>${v('cac:Item/cbc:Name')}</b><span class="ac">${v('cac:Item/cbc:Description')}</span></td><td>${SG.adet}</td><td>${num(SG.istMatrah)}</td><td>${t('%')}${SG.oran}</td><td>${num(SG.ist)}</td><td class="ip">${num(SG.iptMatrah)}</td><td class="ip">${num(SG.ipt)}</td><td><b>${num(SG.satirNet)}</b></td></tr>`)}
        <tr class="top"><td>${t('TOPLAM')}</td><td>${v('sum($f/cac:CreditNoteLine/cbc:CreditedQuantity)')}</td><td></td><td></td><td>${num(SG.istTop)}</td><td></td><td class="ip">${num(SG.iptTop)}</td><td>${num(NET)}</td></tr></table>
    <div class="alt"><div class="odeme">${t('Net komisyon ')}${SG.vade}${t(' tarihinde aşağıdaki hesaba ödenecektir:')}<b>${SG.banka}</b>${yalniz(`<div class="yz">${v('.')}</div>`)}</div>${qr(86)}</div>
    <ul class="n">${notes(`<li>${v('.')}</li>`)}</ul>
</div>`,
    }),
};

/* ------------------------------------------------------------- 2. Broker hesap cetveli */

const broker = {
    id: 'broker-komisyon-cetveli',
    sector: 'sigorta',
    accent: '#78350f',
    name: 'Broker Komisyon Hesap Cetveli',
    description: 'Sigorta şirketinin brokere düzenlediği ticari branşlar e-Sigorta Komisyon Gider Belgesi: fildişi zeminde serif hesap cetveli, branş başına noktalı satırlarla istihsal / iptal / net, kenar notlu özet ve ödeme bilgisi.',
    tags: ['Broker', 'Ticari branşlar', 'Hesap cetveli', 'Serif', 'Nakliyat / mühendislik'],
    xml: sigorta({
        comment: 'Hazır şablon örneği: Broker Komisyon Hesap Cetveli — EARSIVBELGE · SIGORTAKOMISYONGIDERBELGESI (ticari branşlarda broker komisyonu).',
        id: 'KYS2026000003377', date: '2026-10-06', time: '09:15:00',
        period: { start: '2026-09-01', end: '2026-09-30', desc: 'EYLÜL - 2026' },
        supplier: {
            name: 'Kuzey Yıldızı Sigorta A.Ş.', web: 'https://www.kuzeyyildizisigorta.com.tr',
            ids: [['VKN', '5729104836'], ['MERSISNO', '0572910483600012']],
            addr: addr('Maslak Mahallesi Eski Büyükdere Caddesi', '27', 'Sarıyer', 'İstanbul', '34485'), vd: 'Büyük Mükellefler', tel: '(212) 365 70 00', mail: 'broker@kuzeyyildizisigorta.com.tr',
        },
        customer: {
            name: 'Meridyen Sigorta ve Reasürans Brokerliği A.Ş.', ids: [['VKN', '6193027485'], ['LEVHANO', 'B-2009-00214']],
            addr: addr('Levent Mahallesi Büyükdere Caddesi', '185', 'Beşiktaş', 'İstanbul', '34394'), vd: 'Zincirlikuyu', tel: '(212) 284 66 10',
        },
        bank: ['Kardelen Bank A.Ş.', 'Levent Kurumsal Şubesi', 'TR240001200945600010026718'], due: '2026-10-20',
        notes: ['Komisyon oranları 2026 yılı broker protokolü ekindeki oran tablosuna göre uygulanmıştır.', TEBLIG],
        lines: [
            { name: 'Yangın Ve Doğal Afetler', desc: 'Sanayi tesisleri yangın · 14 poliçe', n: 14, rate: 0.12, prim: 3840000, iptal: 0 },
            { name: 'Nakliyat', desc: 'Emtia nakliyat (abonman dahil) · 26 poliçe', n: 26, rate: 0.15, prim: 912500, iptal: 48000 },
            { name: 'Genel Zararlar', desc: 'Makine kırılması ve montaj · 9 poliçe', n: 9, rate: 0.10, prim: 1264000, iptal: 120000 },
            { name: 'Genel Sorumluluk', desc: 'İşveren ve üçüncü şahıs mali mesuliyet · 11 poliçe', n: 11, rate: 0.125, prim: 486000, iptal: 0 },
            { name: 'Su Araçları', desc: 'Tekne ve yat · 4 poliçe', n: 4, rate: 0.10, prim: 342000, iptal: 36000 },
        ],
    }),
    xslt: cnXslt({
        title: 'e-Sigorta Komisyon Gider Belgesi',
        comment: 'Broker Komisyon Hesap Cetveli: fildişi zeminde serif cetvel, noktalı satırlar ve kenar özetli yerleşim.',
        css: `
            .sayfa { font-family: Georgia, 'Times New Roman', serif; font-size: 10pt; color: #292524; background: #fdfaf3; padding: 14mm 16mm; }
            .bas { text-align: center; border-bottom: 1px solid #292524; padding-bottom: 5mm; }
            .bas .sir { font-size: 9pt; letter-spacing: 4px; text-transform: uppercase; color: #78350f; margin-top: 2mm; }
            .bas h1 { margin: 3mm 0 0; font-size: 22pt; font-weight: 400; font-style: italic; } .bas .alt { font-size: 9pt; color: #78716c; margin-top: 1.5mm; letter-spacing: 1px; }
            .cizgi2 { border-top: 3px double #292524; margin-top: 1mm; }
            .govde { display: grid; grid-template-columns: 1fr 52mm; gap: 9mm; margin-top: 8mm; }
            .kenar { border-left: 1px solid #d6cfc0; padding-left: 6mm; font-size: 8.8pt; }
            .kenar h3 { margin: 0 0 1.5mm; font-size: 8pt; letter-spacing: 2px; text-transform: uppercase; color: #78350f; font-weight: 400; } .kenar section { margin-bottom: 6mm; }
            .p-ad { font-weight: 700; } .p-adr, .p-vk, .p-il, .p-ek { font-size: 8.3pt; color: #57534e; margin-top: .6mm; } .p-ek i { font-style: italic; }
            .mt div { margin-bottom: 1mm; } .mt i { display: block; color: #78716c; font-size: 7.8pt; } .mt span { word-break: break-all; }
            .brans { margin-bottom: 6mm; } .brans h4 { margin: 0; font-size: 12pt; } .brans h4 small { font-weight: 400; font-style: italic; color: #78716c; font-size: 9pt; margin-left: 2mm; }
            .sat { display: flex; align-items: baseline; gap: 2mm; font-size: 9.5pt; margin-top: 1.2mm; } .sat .d { flex: 1; border-bottom: 1px dotted #a8a29e; transform: translateY(-1mm); } .sat b { font-variant-numeric: tabular-nums; }
            .sat.ip { color: #9a3412; } .sat.net { font-weight: 700; }
            .ozet { border-top: 3px double #292524; padding-top: 4mm; margin-top: 2mm; }
            .ozet .sat { font-size: 11pt; } .ozet .sat.net { font-size: 15pt; }
            .yz { font-style: italic; color: #57534e; margin-top: 3mm; font-size: 9.5pt; }
            .son { display: flex; gap: 8mm; align-items: flex-end; margin-top: 10mm; } .son ul { flex: 1; margin: 0; padding-left: 4mm; font-size: 8pt; color: #78716c; line-height: 1.6; }
        `,
        body: `<div class="sayfa">
    <div class="bas">${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><path d="M30 4 L35 25 L56 30 L35 35 L30 56 L25 35 L4 30 L25 25 Z" fill="#292524"/><circle cx="30" cy="30" r="4" fill="#fdfaf3"/></svg>`, 44, 44)}
        <div class="sir">${v(`${SUP}/cac:PartyName/cbc:Name`)}</div><h1>${t('Komisyon Hesap Cetveli')}</h1>
        <div class="alt">${t('e-Sigorta Komisyon Gider Belgesi · ')}${SG.donem}${t(' · No ')}${v('$f/cbc:ID')}</div></div><div class="cizgi2"></div>
    <div class="govde"><div>
        ${SG.satirlar(`<div class="brans"><h4>${v('cac:Item/cbc:Name')}<small>${v('cac:Item/cbc:Description')}</small></h4>
            <div class="sat"><span>${t('İstihsal: ')}${num(SG.istMatrah)}${t(' TL prim × %')}${SG.oran}</span><span class="d"></span><b>${num(SG.ist)}</b></div>
            ${iff(`${SG.ipt} &gt; 0`, `<div class="sat ip"><span>${t('İptal: ')}${num(SG.iptMatrah)}${t(' TL iade primi × %')}${SG.oran}</span><span class="d"></span><b>${t('− ')}${num(SG.ipt)}</b></div>`)}
            <div class="sat net"><span>${t('Net')}</span><span class="d"></span><b>${tl(SG.satirNet)}</b></div></div>`)}
        <div class="ozet"><div class="sat"><span>${t('Toplam istihsal komisyonu')}</span><span class="d"></span><b>${tl(SG.istTop)}</b></div>
            <div class="sat ip"><span>${t('Toplam iptal komisyonu')}</span><span class="d"></span><b>${t('− ')}${tl(SG.iptTop)}</b></div>
            <div class="sat net"><span>${t('Ödenecek net komisyon')}</span><span class="d"></span><b>${tl(NET)}</b></div>${yalniz(`<div class="yz">${v('.')}</div>`)}</div>
    </div>
    <div class="kenar"><section><h3>${t('Broker')}</h3>${partyBlock(CUS)}</section><section><h3>${t('Sigorta Şirketi')}</h3>${partyBlock(SUP, { contact: false })}</section>
        <section><h3>${t('Belge')}</h3><div class="mt">${meta((a, b) => `<div><i>${a}</i><span>${b}</span></div>`)}<div><i>${t('Dönem')}</i>${SG.donemAralik}</div></div></section>
        <section><h3>${t('Ödeme')}</h3>${t('Vade ')}${SG.vade}<br/>${SG.banka}</section></div></div>
    <div class="son"><ul>${notes(`<li>${v('.')}</li>`)}</ul>${qr(84)}</div>
</div>`,
    }),
};

/* ------------------------------------------------------------- 3. Sağlık branşı kartları */

const saglik = {
    id: 'saglik-sigorta-komisyon-gider',
    sector: 'sigorta',
    accent: '#0d9488',
    name: 'Sağlık Sigortası Komisyon Gider Belgesi',
    description: 'Sağlık sigortası şirketinin acenteye aylık e-Sigorta Komisyon Gider Belgesi: yuvarlak branş kartları, net / istihsal halka göstergesi, istihsal ve iptal mini çubukları, poliçe adedi ve oran rozetleri.',
    tags: ['Sağlık', 'Tamamlayıcı sağlık', 'Branş kartları', 'Halka gösterge', 'Acente'],
    xml: sigorta({
        comment: 'Hazır şablon örneği: Sağlık Sigortası Komisyon Gider Belgesi — EARSIVBELGE · SIGORTAKOMISYONGIDERBELGESI.',
        id: 'SFA2026000005521', date: '2026-10-04', time: '08:30:00',
        period: { start: '2026-09-01', end: '2026-09-30', desc: 'EYLÜL - 2026' },
        supplier: {
            name: 'Şifa Sağlık Sigorta A.Ş.', web: 'https://www.sifasaglik.com.tr',
            ids: [['VKN', '8126450397'], ['MERSISNO', '0812645039700018']],
            addr: addr('Kavacık Mahallesi Ekinciler Caddesi', '19', 'Beykoz', 'İstanbul', '34810'), vd: 'Beykoz', tel: '(216) 680 44 00', mail: 'acente@sifasaglik.com.tr',
        },
        customer: {
            name: 'Nefes Sigorta Aracılık Hizmetleri Ltd. Şti.', ids: [['VKN', '6390218457'], ['LEVHANO', 'T06-2018-11204']],
            addr: addr('Kızılay Mahallesi Gazi Mustafa Kemal Bulvarı', '38/6', 'Çankaya', 'Ankara', '06420'), vd: 'Kavaklıdere', tel: '(312) 418 25 25',
        },
        bank: ['Toroslar Bankası A.Ş.', 'Ankara Kızılay Şubesi', 'TR420001500158007312446018'], due: '2026-10-12',
        notes: ['Grup sağlık poliçelerinde komisyon, yürürlükteki sözleşme primi üzerinden hesaplanmıştır.', TEBLIG],
        lines: [
            { name: 'Hastalık/Sağlık', desc: 'Bireysel sağlık', n: 148, rate: 0.15, prim: 2486000, iptal: 112400 },
            { name: 'Hastalık/Sağlık', desc: 'Tamamlayıcı sağlık (TSS)', n: 264, rate: 0.17, prim: 1742400, iptal: 61200 },
            { name: 'Hastalık/Sağlık', desc: 'Seyahat sağlık', n: 517, rate: 0.25, prim: 206800, iptal: 4100 },
            { name: 'Hastalık/Sağlık', desc: 'Grup sağlık (3 kurum)', n: 3, rate: 0.08, prim: 1180000, iptal: 0 },
        ],
    }),
    xslt: cnXslt({
        title: 'e-Sigorta Komisyon Gider Belgesi',
        comment: 'Sağlık Sigortası Komisyon Gider Belgesi: yuvarlak branş kartları, halka gösterge ve mini çubuklar.',
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #0f2e2b; background: #f3faf9; padding: 11mm 13mm; }
            .bas { background: #fff; border-radius: 5mm; padding: 6mm 7mm; display: grid; grid-template-columns: auto 1fr auto; gap: 6mm; align-items: center; box-shadow: 0 .5mm 0 #ccebe7; }
            .bas h1 { margin: 0; font-size: 14pt; color: #115e59; } .bas h1 small { display: block; font-weight: 400; font-size: 8.5pt; color: #5b7b77; margin-top: .8mm; }
            .halka { width: 30mm; height: 30mm; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            .halka div { width: 22mm; height: 22mm; border-radius: 50%; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7pt; color: #5b7b77; } .halka b { font-size: 12pt; color: #0f766e; }
            .taraf { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; margin-top: 5mm; }
            .tk { background: #fff; border-radius: 4mm; padding: 4mm 5mm; } .tk h3 { margin: 0 0 2mm; font-size: 7.6pt; text-transform: uppercase; letter-spacing: 1.2px; color: #0d9488; }
            .p-ad { font-weight: 700; } .p-adr, .p-vk, .p-il, .p-ek { font-size: 7.9pt; color: #5b7b77; margin-top: .5mm; } .p-ek i { font-style: normal; color: #0d9488; }
            .mt { display: grid; grid-template-columns: auto 1fr; gap: .8mm 3mm; font-size: 7.9pt; } .mt i { font-style: normal; color: #5b7b77; } .mt span { word-break: break-all; }
            .kartlar { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-top: 5mm; }
            .kart { background: #fff; border-radius: 4mm; padding: 5mm; border-top: 1.5mm solid #14b8a6; }
            .kart .ust { display: flex; justify-content: space-between; align-items: flex-start; } .kart h4 { margin: 0; font-size: 11pt; } .kart h4 small { display: block; font-weight: 400; color: #5b7b77; font-size: 8pt; margin-top: .5mm; }
            .rz { display: flex; gap: 1.5mm; } .rz span { background: #ccfbf1; color: #115e59; border-radius: 3mm; padding: .6mm 2.2mm; font-size: 7.5pt; font-weight: 700; }
            .cb { margin-top: 3.5mm; font-size: 7.8pt; } .cb .l { display: flex; justify-content: space-between; color: #5b7b77; margin-top: 1.6mm; } .cb .c { height: 2.2mm; background: #e6f4f2; border-radius: 1.1mm; overflow: hidden; margin-top: .6mm; }
            .cb .c div { height: 100%; background: #14b8a6; } .cb .c.ip div { background: #fb923c; }
            .kart .net { margin-top: 3mm; display: flex; justify-content: space-between; align-items: baseline; border-top: 1px dashed #ccebe7; padding-top: 2.5mm; } .kart .net b { font-size: 13pt; color: #0f766e; }
            .top { margin-top: 5mm; display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 4mm; }
            .top div { background: #fff; border-radius: 4mm; padding: 4mm 5mm; } .top i { display: block; font-style: normal; font-size: 7.6pt; color: #5b7b77; text-transform: uppercase; letter-spacing: 1px; } .top b { font-size: 13pt; }
            .top .n { background: #0f766e; color: #fff; } .top .n i { color: #99f6e4; }
            .son { display: flex; gap: 6mm; align-items: flex-end; margin-top: 5mm; background: #fff; border-radius: 4mm; padding: 4mm 5mm; }
            .son .s { flex: 1; font-size: 8pt; } .son ul { margin: 2mm 0 0; padding-left: 4mm; color: #5b7b77; line-height: 1.55; font-size: 7.6pt; } .yz { font-style: italic; }
        `,
        body: `<div class="sayfa">
    <div class="bas">${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="12" fill="#0d9488"/><path d="M24 12v24M12 24h24" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>`, 46, 46)}
        <h1>${v(`${SUP}/cac:PartyName/cbc:Name`)}<small>${t('e-Sigorta Komisyon Gider Belgesi · ')}${SG.donem}</small></h1>
        <div class="halka"><xsl:attribute name="style">background:conic-gradient(#14b8a6 <xsl:value-of select="${SG.pay(NET)}"/>%, #fed7aa 0)</xsl:attribute><div><b>${t('%')}${v(SG.pay(NET))}</b>${t('net / istihsal')}</div></div></div>
    <div class="taraf"><div class="tk"><h3>${t('Acente')}</h3>${partyBlock(CUS)}</div><div class="tk"><h3>${t('Sigorta Şirketi')}</h3>${partyBlock(SUP, { contact: false })}</div>
        <div class="tk"><h3>${t('Belge')}</h3><div class="mt">${meta((a, b) => `<i>${a}</i><span>${b}</span>`)}<i>${t('Dönem')}</i><span>${SG.donemAralik}</span></div></div></div>
    <div class="kartlar">${SG.satirlar(`<div class="kart"><div class="ust"><h4>${v('cac:Item/cbc:Description')}<small>${v('cac:Item/cbc:Name')}</small></h4><div class="rz"><span>${SG.adet}${t(' poliçe')}</span><span>${t('%')}${SG.oran}</span></div></div>
        <div class="cb"><div class="l"><span>${t('İstihsal · prim ')}${num(SG.istMatrah)}</span><b>${num(SG.ist)}</b></div><div class="c"><div style="width:100%"></div></div>
            <div class="l"><span>${t('İptal · prim ')}${num(SG.iptMatrah)}</span><b>${t('− ')}${num(SG.ipt)}</b></div><div class="c ip"><div>${width(`round(${SG.ipt} div (${SG.ist} + 0.0001) * 100)`)}</div></div></div>
        <div class="net"><span>${t('Net komisyon')}</span><b>${tl(SG.satirNet)}</b></div></div>`)}</div>
    <div class="top"><div><i>${t('İstihsal')}</i><b>${tl(SG.istTop)}</b></div><div><i>${t('İptal')}</i><b>${t('− ')}${tl(SG.iptTop)}</b></div><div class="n"><i>${t('Ödenecek net komisyon')}</i><b>${tl(NET)}</b></div></div>
    <div class="son"><div class="s"><b>${t('Ödeme: ')}</b>${SG.vade}${t(' · ')}${SG.banka}${yalniz(`<div class="yz">${v('.')}</div>`)}<ul>${notes(`<li>${v('.')}</li>`)}</ul></div>${qr(80)}</div>
</div>`,
    }),
};

/* ------------------------------------------------------------- 4. Kasko & trafik paneli */

const kasko = {
    id: 'kasko-trafik-komisyon-paneli',
    sector: 'sigorta',
    accent: '#ea580c',
    name: 'Kasko & Trafik Acente Komisyon Paneli',
    description: 'Oto galeri bünyesindeki acenteye motor branşları için aylık e-Sigorta Komisyon Gider Belgesi: koyu panel başlığı, turuncu gösterge şeritleri, branş başına net / istihsal oranı çubuğu ve göze çarpan net komisyon kutusu.',
    tags: ['Kasko', 'Trafik', 'Motor branşları', 'Koyu panel', 'Oran çubuğu'],
    xml: sigorta({
        comment: 'Hazır şablon örneği: Kasko & Trafik Acente Komisyon Paneli — EARSIVBELGE · SIGORTAKOMISYONGIDERBELGESI (motor branşları).',
        id: 'OTY2026000014402', date: '2026-10-03', time: '17:45:00',
        period: { start: '2026-09-01', end: '2026-09-30', desc: 'EYLÜL - 2026' },
        supplier: {
            name: 'Otoyol Sigorta A.Ş.', web: 'https://www.otoyolsigorta.com.tr',
            ids: [['VKN', '6841037295'], ['MERSISNO', '0684103729500013']],
            addr: addr('İçerenköy Mahallesi Umut Sokak', '10', 'Ataşehir', 'İstanbul', '34752'), vd: 'Büyük Mükellefler', tel: '0850 711 06 06', mail: 'acente@otoyolsigorta.com.tr',
        },
        customer: {
            name: 'Hız Otomotiv Sigorta Aracılık Ltd. Şti.', ids: [['VKN', '4710825936'], ['LEVHANO', 'T16-2016-07732']],
            addr: addr('Organize Sanayi Bölgesi Mavi Cadde', '4', 'Nilüfer', 'Bursa', '16140'), vd: 'Nilüfer', tel: '(224) 243 70 70',
        },
        bank: ['Meltem Bankası A.Ş.', 'Bursa Nilüfer Şubesi', 'TR380006701000000058129044'], due: '2026-10-10',
        notes: ['Komisyonlar galeri satışlarına bağlı kasko ve zorunlu trafik poliçelerinden hesaplanmıştır.', TEBLIG],
        lines: [
            { name: 'Kara Araçları', desc: 'Kasko · 96 poliçe', n: 96, rate: 0.15, prim: 3124000, iptal: 187000 },
            { name: 'Kara Araçları Sorumluluk', desc: 'Zorunlu trafik · 214 poliçe', n: 214, rate: 0.08, prim: 2782000, iptal: 98400 },
            { name: 'Hukuksal Koruma', desc: 'Motorlu araç hukuksal koruma · 61 poliçe', n: 61, rate: 0.25, prim: 42700, iptal: 1400 },
            { name: 'Kaza', desc: 'Koltuk ferdi kaza · 58 poliçe', n: 58, rate: 0.25, prim: 34800, iptal: 0 },
        ],
    }),
    xslt: cnXslt({
        title: 'e-Sigorta Komisyon Gider Belgesi',
        comment: 'Kasko & Trafik Acente Komisyon Paneli: koyu panel başlığı, turuncu gösterge şeritleri ve oran çubukları.',
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #111827; background: #fff; }
            .panel { background: #111827; color: #e5e7eb; padding: 9mm 13mm 7mm; }
            .panel .ust { display: flex; justify-content: space-between; align-items: center; }
            .panel h1 { margin: 0; font-size: 16pt; color: #fff; letter-spacing: .4px; } .panel h1 span { color: #fb923c; } .panel .alt { font-size: 8.5pt; color: #9ca3af; margin-top: 1mm; }
            .gost { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-top: 6mm; }
            .gost div { background: #1f2937; border-radius: 2mm; padding: 3.5mm 4mm; border-bottom: 1mm solid #374151; } .gost i { display: block; font-style: normal; font-size: 7.4pt; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
            .gost b { font-size: 13pt; color: #fff; } .gost .o { border-bottom-color: #f97316; } .gost .o b { color: #fdba74; }
            .ic { padding: 7mm 13mm 0; }
            .taraf { display: grid; grid-template-columns: 1fr 1fr 60mm; gap: 6mm; }
            h3 { margin: 0 0 2mm; font-size: 7.6pt; text-transform: uppercase; letter-spacing: 1.2px; color: #ea580c; }
            .p-ad { font-weight: 700; } .p-adr, .p-vk, .p-il, .p-ek { font-size: 8pt; color: #4b5563; margin-top: .5mm; } .p-ek i { font-style: normal; color: #ea580c; }
            .mt { display: grid; grid-template-columns: auto 1fr; gap: .8mm 3mm; font-size: 8pt; } .mt i { font-style: normal; color: #6b7280; } .mt span { word-break: break-all; }
            .satir { display: grid; grid-template-columns: 52mm 1fr 34mm; gap: 5mm; align-items: center; padding: 4mm 0; border-bottom: 1px solid #e5e7eb; }
            .satir h4 { margin: 0; font-size: 10.5pt; } .satir h4 small { display: block; font-weight: 400; color: #6b7280; font-size: 8pt; margin-top: .5mm; }
            .satir .d { font-size: 7.8pt; color: #4b5563; } .satir .d span { display: inline-block; margin-right: 4mm; } .satir .d b { color: #111827; }
            .og { height: 3mm; background: #f3f4f6; border-radius: 1.5mm; overflow: hidden; margin-top: 1.5mm; } .og div { height: 100%; background: linear-gradient(90deg, #f97316, #fbbf24); }
            .satir .n { text-align: right; } .satir .n b { display: block; font-size: 12pt; } .satir .n i { font-style: normal; font-size: 7.6pt; color: #6b7280; }
            .net { margin-top: 6mm; display: grid; grid-template-columns: 1fr auto; gap: 6mm; align-items: center; background: #fff7ed; border: 1.5px solid #fb923c; border-radius: 3mm; padding: 5mm 6mm; }
            .net b { font-size: 19pt; color: #c2410c; } .net .yz { font-size: 8.3pt; font-style: italic; margin-top: 1mm; }
            .son { display: flex; gap: 6mm; align-items: flex-end; margin-top: 6mm; } .son ul { flex: 1; margin: 0; padding-left: 4mm; color: #6b7280; font-size: 7.6pt; line-height: 1.6; }
        `,
        body: `<div class="sayfa">
    <div class="panel"><div class="ust"><div><h1>${t('KOMİSYON ')}<span>${t('PANELİ')}</span></h1><div class="alt">${t('e-Sigorta Komisyon Gider Belgesi · ')}${SG.donem}${t(' · ')}${v('$f/cbc:ID')}</div></div>
        ${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 40"><path d="M4 32 A16 16 0 0 1 36 32" fill="none" stroke="#f97316" stroke-width="4"/><path d="M20 32 L29 17" stroke="#fff" stroke-width="3" stroke-linecap="round"/><text x="44" y="24" font-family="Segoe UI,Arial" font-weight="800" font-size="16" fill="#fff">OTOYOL</text><text x="45" y="34" font-family="Segoe UI,Arial" font-size="7.5" letter-spacing="3" fill="#fb923c">SİGORTA</text></svg>`, 150, 40)}</div>
        <div class="gost"><div><i>${t('Poliçe')}</i><b>${v('sum($f/cac:CreditNoteLine/cbc:CreditedQuantity)')}</b></div><div><i>${t('İstihsal')}</i><b>${tl(SG.istTop)}</b></div>
            <div><i>${t('İptal')}</i><b>${t('− ')}${tl(SG.iptTop)}</b></div><div class="o"><i>${t('Net')}</i><b>${tl(NET)}</b></div></div></div>
    <div class="ic">
        <div class="taraf"><div><h3>${t('Acente')}</h3>${partyBlock(CUS)}</div><div><h3>${t('Sigorta Şirketi')}</h3>${partyBlock(SUP, { contact: false })}</div>
            <div><h3>${t('Belge')}</h3><div class="mt">${meta((a, b) => `<i>${a}</i><span>${b}</span>`)}<i>${t('Dönem')}</i><span>${SG.donemAralik}</span></div></div></div>
        <div style="margin-top:5mm">${SG.satirlar(`<div class="satir"><h4>${v('cac:Item/cbc:Name')}<small>${v('cac:Item/cbc:Description')}</small></h4>
            <div class="d"><span>${t('Prim ')}<b>${num(SG.istMatrah)}</b></span><span>${t('Oran ')}<b>${t('%')}${SG.oran}</b></span><span>${t('İstihsal ')}<b>${num(SG.ist)}</b></span><span>${t('İptal ')}<b>${num(SG.ipt)}</b></span>
                <div class="og"><div>${width(ORAN_NET)}</div></div></div>
            <div class="n"><b>${tl(SG.satirNet)}</b><i>${t('net · %')}${v(ORAN_NET)}</i></div></div>`)}</div>
        <div class="net"><div>${t('Ödenecek net komisyon · vade ')}${SG.vade}<div style="font-size:8.3pt;color:#4b5563;margin-top:1mm">${SG.banka}</div>${yalniz(`<div class="yz">${v('.')}</div>`)}</div><b>${tl(NET)}</b></div>
        <div class="son"><ul>${notes(`<li>${v('.')}</li>`)}</ul>${qr(82)}</div>
    </div>
</div>`,
    }),
};

/* ------------------------------------------------------------- 5. Tarım & DASK (çeyreklik, kenar çubuklu) */

const tarim = {
    id: 'tarim-dask-komisyon-gider',
    sector: 'sigorta',
    accent: '#4d7c0f',
    name: 'Tarım ve DASK Çeyreklik Komisyon Belgesi',
    description: 'Taşradaki şahıs acentesine tarım sigortası ve zorunlu deprem branşlarında üç aylık e-Sigorta Komisyon Gider Belgesi: tarla şeritli yeşil kenar çubuğu, ay rozetli dönem, sade branş tablosu ve ödeme özeti.',
    tags: ['Tarım sigortası', 'DASK', 'Çeyreklik dönem', 'Şahıs acente', 'Kenar çubuğu'],
    xml: sigorta({
        comment: 'Hazır şablon örneği: Tarım ve DASK Çeyreklik Komisyon Belgesi — EARSIVBELGE · SIGORTAKOMISYONGIDERBELGESI (3 aylık dönem, şahıs acente).',
        id: 'TPS2026000000873', date: '2026-10-07', time: '14:00:00',
        period: { start: '2026-07-01', end: '2026-09-30', desc: '3. ÇEYREK - 2026' },
        supplier: {
            name: 'Toprak Sigorta A.Ş.', web: 'https://www.topraksigorta.com.tr',
            ids: [['VKN', '8305164729'], ['MERSISNO', '0830516472900015']],
            addr: addr('Mustafa Kemal Mahallesi Dumlupınar Bulvarı', '266', 'Çankaya', 'Ankara', '06510'), vd: 'Başkent', tel: '(312) 219 40 40', mail: 'acente@topraksigorta.com.tr',
        },
        customer: {
            person: ['Mehmet', 'ÇİFTÇİ'], name: 'Bereket Sigorta Acenteliği - Mehmet ÇİFTÇİ',
            ids: [['TCKN', '30587214698'], ['LEVHANO', 'T42-2014-02291']],
            addr: addr('Hükümet Caddesi', '22/1', 'Ereğli', 'Konya', '42310'), vd: 'Ereğli', tel: '(332) 713 52 52',
        },
        bank: ['Kardelen Bank A.Ş.', 'Konya Ereğli Şubesi', 'TR150001200986500010026419'], due: '2026-10-21',
        notes: ['Tarım sigortası poliçeleri TARSİM havuzu adına tanzim edilmiştir.', 'Dönem: Temmuz, Ağustos ve Eylül 2026 tanzim ve iptalleri.', TEBLIG],
        lines: [
            { name: 'Zorunlu Deprem (DASK)', desc: '642 poliçe', n: 642, rate: 0.175, prim: 584220, iptal: 14300 },
            { name: 'Tarım — Bitkisel Ürün', desc: 'Buğday, şeker pancarı, mısır', n: 87, rate: 0.10, prim: 1126400, iptal: 22800 },
            { name: 'Tarım — Büyükbaş Hayvan Hayat', desc: '412 baş', n: 34, rate: 0.10, prim: 412600, iptal: 0 },
            { name: 'Tarım — Sera', desc: '18,5 dekar', n: 12, rate: 0.10, prim: 268000, iptal: 18000 },
            { name: 'Yangın Ve Doğal Afetler', desc: 'Çiftlik ve ahır', n: 21, rate: 0.20, prim: 96500, iptal: 0 },
        ],
    }),
    xslt: cnXslt({
        title: 'e-Sigorta Komisyon Gider Belgesi',
        comment: 'Tarım ve DASK Çeyreklik Komisyon Belgesi: tarla şeritli yeşil kenar çubuğu ve sade branş tablosu.',
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #1a2e05; background: #fff; display: grid; grid-template-columns: 62mm 1fr; }
            .kenar { background: #365314; color: #ecfccb; padding: 10mm 7mm; position: relative; overflow: hidden; }
            .kenar::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 60mm; background: repeating-linear-gradient(160deg, #4d7c0f 0 4mm, #3f6212 4mm 8mm, #65a30d 8mm 9mm); opacity: .7; }
            .kenar > * { position: relative; z-index: 1; }
            .kenar h3 { margin: 6mm 0 1.5mm; font-size: 7.4pt; letter-spacing: 1.6px; text-transform: uppercase; color: #bef264; }
            .kenar .p-ad { font-weight: 700; font-size: 9.5pt; color: #fff; } .kenar .p-adr, .kenar .p-vk, .kenar .p-il, .kenar .p-ek { font-size: 7.8pt; color: #d9f99d; margin-top: .5mm; } .kenar .p-ek i { font-style: normal; color: #bef264; }
            .kenar .od { font-size: 8pt; line-height: 1.5; }
            .ana { padding: 11mm 11mm 10mm; }
            .ana h1 { margin: 0; font-size: 18pt; color: #365314; } .ana .alt { color: #65a30d; font-size: 9pt; margin-top: 1mm; font-weight: 600; }
            .aylar { display: flex; gap: 2mm; margin-top: 4mm; } .aylar span { border: 1px solid #a3e635; border-radius: 3mm; padding: 1mm 3mm; font-size: 8pt; color: #3f6212; background: #f7fee7; }
            .mt { display: grid; grid-template-columns: auto 1fr; gap: .8mm 4mm; font-size: 8pt; margin-top: 5mm; } .mt i { font-style: normal; color: #65a30d; } .mt span { word-break: break-all; }
            table.br { width: 100%; border-collapse: collapse; margin-top: 7mm; font-variant-numeric: tabular-nums; }
            table.br th { font-size: 7.6pt; color: #3f6212; text-transform: uppercase; letter-spacing: .8px; text-align: right; padding: 2mm 1.5mm; border-bottom: 2px solid #365314; } table.br th:first-child { text-align: left; }
            table.br td { padding: 2.6mm 1.5mm; text-align: right; border-bottom: 1px solid #ecfccb; } table.br td:first-child { text-align: left; } table.br tr:nth-child(even) td { background: #f7fee7; }
            .ac { display: block; color: #65a30d; font-size: 7.6pt; }
            .ozet { margin-top: 6mm; margin-left: auto; width: 88mm; } .ozet div { display: flex; justify-content: space-between; padding: 1.8mm 0; border-bottom: 1px solid #ecfccb; }
            .ozet .n { background: #365314; color: #fff; border: 0; padding: 3.5mm 4mm; border-radius: 2mm; margin-top: 2mm; font-weight: 700; font-size: 12pt; }
            .yz { font-style: italic; font-size: 8.3pt; color: #3f6212; margin-top: 3mm; text-align: right; }
            .son { display: flex; gap: 6mm; align-items: flex-end; margin-top: 8mm; } .son ul { flex: 1; margin: 0; padding-left: 4mm; color: #4d7c0f; font-size: 7.6pt; line-height: 1.6; }
        `,
        body: `<div class="sayfa">
    <div class="kenar">${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 44"><path d="M4 36 Q20 10 36 36 Z" fill="#a3e635"/><path d="M20 36 V14 M20 22 Q12 18 10 12 M20 26 Q28 22 30 16" stroke="#ecfccb" stroke-width="2" fill="none"/><text x="44" y="24" font-family="Georgia,serif" font-weight="700" font-size="17" fill="#fff">Toprak</text><text x="45" y="35" font-family="Segoe UI,Arial" font-size="7.5" letter-spacing="3" fill="#bef264">SİGORTA</text></svg>`, 150, 44)}
        <h3>${t('Sigorta Şirketi')}</h3>${partyBlock(SUP)}
        <h3>${t('Acente')}</h3>${partyBlock(CUS)}
        <h3>${t('Ödeme')}</h3><div class="od">${t('Vade: ')}${SG.vade}<br/>${SG.banka}</div></div>
    <div class="ana"><h1>${t('Komisyon Gider Belgesi')}</h1><div class="alt">${t('e-Sigorta Komisyon Gider Belgesi · ')}${SG.donem}</div>
        <div class="aylar"><span>${dt('$f/cac:InvoicePeriod/cbc:StartDate')}</span><span>${t('→')}</span><span>${dt('$f/cac:InvoicePeriod/cbc:EndDate')}</span></div>
        <div class="mt">${meta((a, b) => `<i>${a}</i><span>${b}</span>`)}</div>
        <table class="br"><tr><th>${t('Branş')}</th><th>${t('Adet')}</th><th>${t('Oran')}</th><th>${t('İstihsal')}</th><th>${t('İptal')}</th><th>${t('Net')}</th></tr>
            ${SG.satirlar(`<tr><td><b>${v('cac:Item/cbc:Name')}</b><span class="ac">${v('cac:Item/cbc:Description')}${t(' · prim ')}${num(SG.istMatrah)}</span></td><td>${SG.adet}</td><td>${t('%')}${SG.oran}</td><td>${num(SG.ist)}</td><td>${num(SG.ipt)}</td><td><b>${num(SG.satirNet)}</b></td></tr>`)}</table>
        <div class="ozet"><div><span>${t('İstihsal komisyonu')}</span><b>${tl(SG.istTop)}</b></div><div><span>${t('İptal komisyonu')}</span><b>${t('− ')}${tl(SG.iptTop)}</b></div><div class="n"><span>${t('Net komisyon')}</span><span>${tl(NET)}</span></div></div>
        ${yalniz(`<div class="yz">${v('.')}</div>`)}
        <div class="son"><ul>${notes(`<li>${v('.')}</li>`)}</ul>${qr(80)}</div></div>
</div>`,
    }),
};

/* ------------------------------------------------------------- 6. Mutabakat cetveli */

const mutabakat = {
    id: 'acente-komisyon-mutabakat',
    sector: 'sigorta',
    accent: '#111827',
    name: 'Acente Komisyon Mutabakat Cetveli',
    description: 'Çok branşlı büyük acenteye aylık e-Sigorta Komisyon Gider Belgesi: yazıcı dostu siyah-beyaz mutabakat cetveli, sıkışık 8 branş tablosu, eksi bakiyeli branş vurgusu, branş kodları ve iki taraflı onay kutuları.',
    tags: ['Mutabakat', 'Çok branş', 'Eksi bakiye', 'Yazıcı dostu', 'Onay kutuları'],
    xml: sigorta({
        comment: 'Hazır şablon örneği: Acente Komisyon Mutabakat Cetveli — EARSIVBELGE · SIGORTAKOMISYONGIDERBELGESI (8 branş, biri iptal ağırlıklı eksi bakiyeli).',
        id: 'MGS2026000021938', date: '2026-09-05', time: '11:00:00',
        period: { start: '2026-08-01', end: '2026-08-31', desc: 'AĞUSTOS - 2026' },
        supplier: {
            name: 'Marmara Genel Sigorta A.Ş.', web: 'https://www.marmarasigorta.com.tr',
            ids: [['VKN', '6127408395'], ['MERSISNO', '0612740839500011']],
            addr: addr('Kozyatağı Mahallesi Değirmen Sokak', '18', 'Kadıköy', 'İstanbul', '34742'), vd: 'Büyük Mükellefler', tel: '(216) 600 00 60', mail: 'mutabakat@marmarasigorta.com.tr',
        },
        customer: {
            name: 'Boğaziçi Sigorta Aracılık Hizmetleri A.Ş.', ids: [['VKN', '2016483759'], ['LEVHANO', 'T34-2007-01188']],
            addr: addr('Barbaros Bulvarı', '74/8', 'Beşiktaş', 'İstanbul', '34353'), vd: 'Beşiktaş', tel: '(212) 259 30 30',
        },
        bank: ['Lodos Bankası A.Ş.', 'Beşiktaş Şubesi', 'TR860009900000000510004417'], due: '2026-09-15',
        notes: ['Finansal kayıplar branşında dönem içi iptaller istihsali aştığından branş neti eksidir; toplam nete mahsup edilmiştir.', 'Mutabakata itirazlar belge tarihinden itibaren 10 gün içinde yazılı olarak bildirilmelidir.', TEBLIG],
        lines: [
            { name: 'Kara Araçları', desc: 'Branş 01', n: 210, rate: 0.15, prim: 5840000, iptal: 412000 },
            { name: 'Kara Araçları Sorumluluk', desc: 'Branş 02', n: 480, rate: 0.08, prim: 4920000, iptal: 205000 },
            { name: 'Yangın Ve Doğal Afetler', desc: 'Branş 03', n: 164, rate: 0.20, prim: 980000, iptal: 64000 },
            { name: 'Nakliyat', desc: 'Branş 04', n: 22, rate: 0.15, prim: 310000, iptal: 18500 },
            { name: 'Genel Sorumluluk', desc: 'Branş 05', n: 17, rate: 0.125, prim: 228000, iptal: 0 },
            { name: 'Genel Zararlar', desc: 'Branş 06', n: 6, rate: 0.10, prim: 412000, iptal: 0 },
            { name: 'Kaza', desc: 'Branş 07', n: 95, rate: 0.30, prim: 118000, iptal: 9600 },
            { name: 'Finansal Kayıplar', desc: 'Branş 08', n: 2, rate: 0.10, prim: 24000, iptal: 96000 },
        ],
    }),
    xslt: cnXslt({
        title: 'e-Sigorta Komisyon Gider Belgesi',
        comment: 'Acente Komisyon Mutabakat Cetveli: yazıcı dostu siyah-beyaz cetvel, eksi bakiye vurgusu ve onay kutuları.',
        css: `
            .sayfa { font-family: Arial, Helvetica, sans-serif; font-size: 8.8pt; color: #111; background: #fff; padding: 11mm 12mm; }
            .bas { display: grid; grid-template-columns: 1fr auto; border: 2px solid #111; }
            .bas .sol { padding: 4mm 5mm; display: flex; gap: 5mm; align-items: center; } .bas h1 { margin: 0; font-size: 14pt; letter-spacing: .5px; } .bas h1 small { display: block; font-weight: 400; font-size: 8pt; margin-top: .6mm; }
            .bas .sag { border-left: 2px solid #111; display: grid; grid-template-columns: auto auto; font-size: 8pt; } .bas .sag div { padding: 1.5mm 3mm; border-bottom: 1px solid #111; } .bas .sag div:nth-child(odd) { background: #f3f4f6; font-weight: 700; border-right: 1px solid #111; }
            .bas .sag div:nth-last-child(-n+2) { border-bottom: 0; }
            .taraf { display: grid; grid-template-columns: 1fr 1fr; border: 2px solid #111; border-top: 0; }
            .taraf > div { padding: 3mm 5mm; } .taraf > div + div { border-left: 1px solid #111; }
            h3 { margin: 0 0 1.5mm; font-size: 7.4pt; letter-spacing: 1.2px; text-transform: uppercase; }
            .p-ad { font-weight: 700; } .p-adr, .p-vk, .p-il, .p-ek { font-size: 7.8pt; margin-top: .4mm; } .p-ek i { font-style: normal; font-weight: 700; }
            table.c { width: 100%; border-collapse: collapse; margin-top: 5mm; font-variant-numeric: tabular-nums; }
            table.c th { border: 1px solid #111; background: #111; color: #fff; font-size: 7.4pt; padding: 1.6mm 1.5mm; text-align: right; } table.c th:nth-child(-n+2) { text-align: left; }
            table.c td { border: 1px solid #9ca3af; padding: 1.8mm 1.5mm; text-align: right; } table.c td:nth-child(-n+2) { text-align: left; }
            table.c tr.eksi td { background: #fee2e2; } table.c tr.eksi td:last-child { font-weight: 700; color: #b91c1c; }
            table.c tr.t td { border: 1px solid #111; font-weight: 700; background: #f3f4f6; }
            .alt { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; border: 2px solid #111; margin-top: 5mm; }
            .alt > div { padding: 3mm 4mm; min-height: 30mm; } .alt > div + div { border-left: 1px solid #111; }
            .alt .net b { display: block; font-size: 15pt; margin-top: 1mm; } .alt .yz { font-size: 7.8pt; font-style: italic; margin-top: 1.5mm; }
            .onay { font-size: 7.8pt; } .onay .imza { margin-top: 13mm; border-top: 1px dashed #111; padding-top: 1mm; text-align: center; color: #4b5563; }
            .son { display: flex; gap: 6mm; align-items: flex-end; margin-top: 5mm; } .son ul { flex: 1; margin: 0; padding-left: 4mm; font-size: 7.6pt; line-height: 1.55; }
        `,
        body: `<div class="sayfa">
    <div class="bas"><div class="sol">${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><rect x="2" y="2" width="40" height="40" fill="#111"/><path d="M8 32 L16 14 L22 26 L28 14 L36 32" fill="none" stroke="#fff" stroke-width="3"/></svg>`, 40, 40)}
        <h1>${t('KOMİSYON MUTABAKAT CETVELİ')}<small>${v(`${SUP}/cac:PartyName/cbc:Name`)}${t(' · e-Sigorta Komisyon Gider Belgesi')}</small></h1></div>
        <div class="sag"><div>${t('Belge No')}</div><div>${v('$f/cbc:ID')}</div><div>${t('Tarih')}</div><div>${dt('$f/cbc:IssueDate')}</div><div>${t('Dönem')}</div><div>${SG.donem}</div><div>${t('ETTN')}</div><div style="font-size:6.8pt">${v('$f/cbc:UUID')}</div></div></div>
    <div class="taraf"><div><h3>${t('Sigorta Şirketi')}</h3>${partyBlock(SUP)}</div><div><h3>${t('Acente')}</h3>${partyBlock(CUS)}</div></div>
    <table class="c"><tr><th>${t('Kod')}</th><th>${t('Branş')}</th><th>${t('Poliçe')}</th><th>${t('Oran')}</th><th>${t('Prim')}</th><th>${t('İstihsal')}</th><th>${t('İade Primi')}</th><th>${t('İptal')}</th><th>${t('Net')}</th></tr>
        ${SG.satirlar(`<tr>${iff('cbc:LineExtensionAmount &lt; 0', '<xsl:attribute name="class">eksi</xsl:attribute>')}<td>${v("substring-after(cac:Item/cbc:Description,'Branş ')")}</td><td>${v('cac:Item/cbc:Name')}</td><td>${SG.adet}</td><td>${t('%')}${SG.oran}</td><td>${num(SG.istMatrah)}</td><td>${num(SG.ist)}</td><td>${num(SG.iptMatrah)}</td><td>${num(SG.ipt)}</td><td>${num(SG.satirNet)}</td></tr>`)}
        <tr class="t"><td></td><td>${t('TOPLAM')}</td><td>${v('sum($f/cac:CreditNoteLine/cbc:CreditedQuantity)')}</td><td></td><td>${num('sum($f/cac:CreditNoteLine/cac:AllowanceCharge[cbc:AllowanceChargeReason=\'Istihsal\']/cbc:BaseAmount)')}</td><td>${num(SG.istTop)}</td><td>${num('sum($f/cac:CreditNoteLine/cac:AllowanceCharge[cbc:AllowanceChargeReason=\'IPTAL\']/cbc:BaseAmount)')}</td><td>${num(SG.iptTop)}</td><td>${num(NET)}</td></tr></table>
    <div class="alt"><div class="net">${t('ÖDENECEK NET KOMİSYON')}<b>${tl(NET)}</b>${t('Vade ')}${SG.vade}<div style="font-size:7.8pt;margin-top:1mm">${SG.banka}</div>${yalniz(`<div class="yz">${v('.')}</div>`)}</div>
        <div class="onay">${t('Sigorta şirketi onayı')}<div class="imza">${t('Kaşe / imza')}</div></div><div class="onay">${t('Acente onayı')}<div class="imza">${t('Kaşe / imza')}</div></div></div>
    <div class="son"><ul>${notes(`<li>${v('.')}</li>`)}</ul>${qr(80)}</div>
</div>`,
    }),
};

export default [banka, broker, saglik, kasko, tarim, mutabakat];
