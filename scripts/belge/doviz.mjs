// e-Döviz ve e-Kıymetli Maden belgesi tasarımları (EDOVIZBELGE / EKIYMETLIMADENBELGE · ALIM / SATIM).
import { each, iff, logo, num, qr, t, v, yaziyla } from '../moda/lib.mjs';
import { creditNote, r2 } from './xml.mjs';
import { CUS, DV, LMT, SUP, cnXslt, meta, notes, partyBlock, profilAd, refs, yalniz } from './kit.mjs';

/**
 * Satırlar belge para biriminde (döviz veya TRY); TL karşılığı kurla, BSMV (kambiyo) TL üzerinden hesaplanır.
 * ALIM'da müesseseden müşteriye ödenen, SATIM'da müşteriden tahsil edilen tutar PayableAmount'tur.
 */
const doviz = (d) => {
    const cur = d.cur ?? 'TRY';
    const lines = d.lines.map((l) => ({ ...l, cur, amount: r2(l.qty * l.price) }));
    const sum = r2(lines.reduce((a, l) => a + l.amount, 0));
    const tl = cur === 'TRY' ? sum : r2(sum * d.rate);
    const pct = d.tax?.pct ?? 0;
    const tax = r2((tl * pct) / 100);
    const pay = r2(tl + tax);
    return creditNote({
        ...d,
        notes: [...(d.kur ?? []).map(([c, a, s]) => `Kur Tablosu | ${c} | ${a} | ${s}`), ...(d.notes ?? []), yaziyla(pay, 'TRY')],
        refs: [{ id: d.ist, code: 'ISTATISTIKNO' }],
        xrate: cur === 'TRY' ? null : ['TRY', cur, (1 / d.rate).toFixed(6)],
        taxes: [{ name: d.tax?.name ?? 'BSMV', code: d.tax?.code ?? '0021', pct, base: tl, amount: tax, cur: 'TRY' }],
        lmt: [['LineExtensionAmount', sum, cur], ['TaxExclusiveAmount', tl, 'TRY'], ['TaxInclusiveAmount', pay, 'TRY'], ['PayableAmount', pay, 'TRY']],
        lines,
    });
};

const addr = (street, no, district, city, zip) => ({ street, no, district, city, zip });
const TEBLIG = 'Bu belge 509 Sıra No\'lu VUK Genel Tebliği kapsamında elektronik ortamda düzenlenmiştir.';

/* ------------------------------------------------------------- 1. Döviz bürosu ALIM */

const alim = {
    id: 'doviz-burosu-alim',
    sector: 'kuyumcu',
    moduleId: 'doviz',
    accent: '#0f766e',
    name: 'Döviz Bürosu Alım Belgesi',
    description: 'Döviz bürosunun müşteriden efektif aldığı ALIM belgesi: büyük işlem kuru göstergesi, "alınan döviz → ödenen TL" akış kartları, günün alış / satış kur tablosu, kupür dökümü ve ödeme hesabı.',
    tags: ['döviz', 'ALIM', 'işlem kuru', 'kur tablosu', 'kupür'],
    xml: doviz({
        comment: 'Hazır şablon örneği: Döviz Bürosu Alım Belgesi — EDOVIZBELGE · ALIM (müşteriden efektif avro alımı, TL karşılığı havale).',
        profile: 'EDOVIZBELGE', type: 'ALIM', id: 'GLT2026000006215', date: '2026-10-09', time: '15:22:08', ist: 'B7712',
        cur: 'EUR', rate: 48.912,
        kur: [['USD', '42,1460', '42,5280'], ['EUR', '48,9120', '49,3650'], ['GBP', '56,3840', '56,9970'], ['CHF', '52,6150', '53,2240']],
        notes: ['Banknotlar müşteri huzurunda sayılmış; UV ve manyetik mürekkep kontrolünden geçirilmiştir.', 'Döviz alım işleminde kambiyo muameleleri vergisi (BSMV) uygulanmamıştır.', TEBLIG],
        supplier: {
            name: 'Galata Döviz Ticaret A.Ş.', web: 'https://www.galatadoviz.com.tr',
            ids: [['VKN', '3710592846'], ['SUBENO', 'IST-0412']],
            addr: addr('Bankalar Caddesi', '24', 'Beyoğlu', 'İstanbul', '34420'), vd: 'Beyoğlu', tel: '(212) 292 44 12', mail: 'islem@galatadoviz.com.tr',
        },
        customer: {
            person: ['Deniz', 'AKSU'], ids: [['TCKN', '28196403571'], ['MUSTERITURU', 'GERCEKKISI']],
            addr: addr('Cihangir Mahallesi Sıraselviler Caddesi', '62/4', 'Beyoğlu', 'İstanbul', '34433'), tel: '(533) 408 21 67',
        },
        payments: [
            { code: '10', note: 'Müşteri — efektif avro elden teslim edildi', payer: '0' },
            { code: '42', note: 'Müessese — TL karşılığı müşteri hesabına havale edildi', payee: 'TR360001000144000418236501' },
        ],
        lines: [
            { name: '100 EUR Banknot', desc: 'Europa serisi', qty: 12, price: 100 },
            { name: '50 EUR Banknot', desc: 'Europa serisi', qty: 6, price: 50 },
            { name: '20 EUR Banknot', desc: 'Europa serisi', qty: 5, price: 20 },
        ],
    }),
    xslt: cnXslt({
        title: 'e-Döviz Belgesi',
        comment: 'Döviz Bürosu Alım Belgesi (EDOVIZBELGE · ALIM): işlem kuru göstergesi, alınan döviz → ödenen TL akışı, kur tablosu ve kupür dökümü.',
        css: `
            .sayfa { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 9.5pt; color: #0f172a; padding: 12mm 14mm; background: #fff; }
            .bas { display: flex; justify-content: space-between; align-items: flex-start; }
            .bas .fa { font-size: 8.5pt; color: #475569; margin-top: 2mm; max-width: 95mm; } .bas .fa b { display: block; font-size: 11pt; color: #0f172a; }
            .bas .sag { text-align: right; } .bas .sag h1 { margin: 0; font-size: 19pt; font-weight: 800; letter-spacing: -.3px; } .bas .sag h1 span { color: #0f766e; }
            .rozet { display: inline-block; margin-top: 2mm; background: #ccfbf1; color: #115e59; font-weight: 700; font-size: 8pt; border-radius: 10mm; padding: 1mm 4mm; }
            .kur { margin-top: 8mm; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 6mm 0; display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 4mm; align-items: center; }
            .kur .k { text-align: center; } .kur .k i { display: block; font-style: normal; font-size: 7.8pt; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .kur .k b { font-size: 17pt; } .kur .k.mid b { font-size: 21pt; color: #0f766e; } .kur .ok { font-size: 18pt; color: #94a3b8; }
            .iki { display: grid; grid-template-columns: 1fr 72mm; gap: 8mm; margin-top: 7mm; }
            h3 { margin: 0 0 2.5mm; font-size: 8pt; text-transform: uppercase; letter-spacing: 1.2px; color: #0f766e; }
            .p-ad { font-weight: 700; font-size: 11pt; } .p-adr, .p-vk, .p-il, .p-ek { font-size: 8.5pt; color: #475569; margin-top: .6mm; } .p-ek i { font-style: normal; color: #0f766e; }
            .mt { margin-top: 4mm; display: grid; grid-template-columns: auto 1fr; gap: 1mm 4mm; font-size: 8.5pt; } .mt i { font-style: normal; color: #64748b; }
            table.tab { width: 100%; border-collapse: collapse; font-size: 8.8pt; } table.tab th { background: #0f172a; color: #fff; font-weight: 600; padding: 1.8mm 2.5mm; text-align: right; } table.tab th:first-child { text-align: left; }
            table.tab td { padding: 1.8mm 2.5mm; border-bottom: 1px solid #e2e8f0; text-align: right; font-variant-numeric: tabular-nums; } table.tab td:first-child { text-align: left; font-weight: 700; }
            table.kal { width: 100%; border-collapse: collapse; margin-top: 7mm; } table.kal th { font-size: 7.8pt; text-transform: uppercase; letter-spacing: .8px; color: #64748b; text-align: right; border-bottom: 2px solid #0f172a; padding: 2mm; }
            table.kal th:nth-child(-n+2), table.kal td:nth-child(-n+2) { text-align: left; } table.kal td { padding: 2.6mm 2mm; border-bottom: 1px solid #e2e8f0; text-align: right; font-variant-numeric: tabular-nums; }
            .alt { display: grid; grid-template-columns: 1fr 80mm; gap: 8mm; margin-top: 6mm; }
            .top div { display: flex; justify-content: space-between; padding: 1.6mm 0; border-bottom: 1px dotted #cbd5e1; } .top .ode { border: 0; margin-top: 2mm; background: #0f766e; color: #fff; padding: 3.5mm 4mm; border-radius: 2mm; font-weight: 700; font-size: 12pt; }
            .ode-h div { font-size: 8.5pt; padding: 1mm 0; } .ode-h i { font-style: normal; color: #64748b; display: block; font-size: 7.8pt; }
            .yz { font-style: italic; font-size: 8.5pt; color: #334155; margin-top: 2mm; }
            .son { display: flex; gap: 6mm; align-items: flex-end; margin-top: 8mm; border-top: 1px solid #e2e8f0; padding-top: 4mm; } .son ul { flex: 1; margin: 0; padding-left: 4mm; font-size: 7.8pt; color: #64748b; line-height: 1.6; }
        `,
        body: `<div class="sayfa">
    <div class="bas"><div>${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 40"><rect x="1" y="4" width="32" height="32" rx="16" fill="#0f766e"/><text x="17" y="27" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="20" fill="#fff">€</text><text x="40" y="22" font-family="Segoe UI,Arial" font-weight="800" font-size="16" fill="#0f172a">GALATA</text><text x="40" y="33" font-family="Segoe UI,Arial" font-size="8" letter-spacing="3" fill="#0f766e">DÖVİZ</text></svg>`, 150, 40)}
        <div class="fa">${each(SUP, `<b>${v('cac:PartyName/cbc:Name')}</b>${v('cac:PostalAddress/cbc:StreetName')}${t(' No:')}${v('cac:PostalAddress/cbc:BuildingNumber')}${t(' · ')}${v('cac:PostalAddress/cbc:CitySubdivisionName')}${t(' / ')}${v('cac:PostalAddress/cbc:CityName')}<br/>${t('VKN ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='VKN']")}${t(' · ')}${v('cac:PartyTaxScheme/cac:TaxScheme/cbc:Name')}${t(' V.D. · Şube ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='SUBENO']")}<br/>${v('cac:Contact/cbc:Telephone')}${t(' · ')}${v('cbc:WebsiteURI')}`)}</div></div>
        <div class="sag"><h1>${t('DÖVİZ ')}<span>${DV.tip}</span></h1><div class="rozet">${profilAd()}</div></div></div>
    <div class="kur"><div class="k"><i>${t('Müşteriden alınan')}</i><b>${num(`${LMT}/cbc:LineExtensionAmount`)}${t(' ')}${v(`${LMT}/cbc:LineExtensionAmount/@currencyID`)}</b></div><div class="ok">×</div>
        <div class="k mid"><i>${t('İşlem kuru (alış)')}</i><b>${DV.islemKuru}</b></div><div class="ok">=</div>
        <div class="k"><i>${t('Müşteriye ödenen')}</i><b>${DV.odenecek}</b></div></div>
    <div class="iki"><div><h3>${t('Müşteri')}</h3>${partyBlock(CUS)}<div class="p-il">${t('Müşteri türü: ')}${DV.musteriTuru}</div>
            <div class="mt">${meta((a, b) => `<i>${a}</i><span>${b}</span>`)}${refs((a, b) => `<i>${a}</i><span>${b}</span>`)}</div></div>
        <div><h3>${t('Günün kurları')}</h3><table class="tab"><tr><th>${t('Döviz')}</th><th>${t('Alış')}</th><th>${t('Satış')}</th></tr>${DV.kurlar((c, a, s) => `<tr><td>${c}</td><td>${a}</td><td>${s}</td></tr>`)}</table></div></div>
    <table class="kal"><tr><th>${t('#')}</th><th>${t('Kupür')}</th><th>${t('Adet')}</th><th>${t('Birim')}</th><th>${t('Tutar')}</th></tr>
        ${DV.satirlar((r) => `<tr><td>${r.no}</td><td><b>${r.ad}</b><div style="font-size:8pt;color:#64748b">${r.aciklama}</div></td><td>${r.miktar}</td><td>${r.fiyat}</td><td>${r.tutar}</td></tr>`)}</table>
    <div class="alt"><div><h3>${t('Ödeme')}</h3><div class="ode-h">${DV.odemeler((a, b) => `<div><i>${a}</i>${b}</div>`)}</div>${yalniz(`<div class="yz">${v('.')}</div>`)}</div>
        <div class="top">${DV.toplamlar((a, b) => `<div><span>${a}</span><b>${b}</b></div>`)}<div class="ode"><span>${t('Ödenecek')}</span><span>${DV.odenecek}</span></div></div></div>
    <div class="son"><ul>${notes(`<li>${v('.')}</li>`, " and not(starts-with(.,'Kur Tablosu'))")}</ul>${qr(84)}</div>
</div>`,
    }),
};

/* ------------------------------------------------------------- 2. Gram altın SATIM */

const altin = {
    id: 'gram-altin-satim',
    sector: 'kuyumcu',
    moduleId: 'doviz-satim',
    accent: '#a16207',
    name: 'Gram Külçe Altın Satım Sertifikası',
    description: 'Kıymetli maden aracı kurumun sertifikalı gram külçe altın satışı için e-Kıymetli Maden SATIM belgesi: siyah-altın gravürlü sertifika çerçevesi, külçe kartları, günün has altın kurları ve KDV istisnalı toplam plaketi.',
    tags: ['kıymetli maden', 'SATIM', 'gram altın', 'külçe', 'sertifika'],
    xml: doviz({
        comment: 'Hazır şablon örneği: Gram Külçe Altın Satım Sertifikası — EKIYMETLIMADENBELGE · SATIM (995/1000 sertifikalı külçe).',
        profile: 'EKIYMETLIMADENBELGE', type: 'SATIM', id: 'NRO2026000011834', date: '2026-10-10', time: '11:48:30', ist: 'K2209',
        tax: { name: 'KDV', code: '0015', pct: 0 },
        kur: [['HAS ALTIN (gr)', '5.746,20', '5.812,40'], ['22 AYAR (gr)', '5.210,00', '5.398,00'], ['ÇEYREK', '9.380,00', '9.565,00'], ['GÜMÜŞ (gr)', '55,90', '57,40']],
        notes: ['Külçeler 995/1000 saflıkta, seri numaralı ve mühürlü sertifika ambalajında teslim edilmiştir.', 'Standart ve has altın teslimi KDV Kanunu 17/4-h kapsamında KDV\'den istisnadır.', TEBLIG],
        supplier: {
            name: 'Nuruosmaniye Kıymetli Madenler A.Ş.', web: 'https://www.nuruosmaniyealtin.com.tr',
            ids: [['VKN', '6420819573'], ['SUBENO', 'KPC-0007']],
            addr: addr('Nuruosmaniye Caddesi', '61', 'Fatih', 'İstanbul', '34120'), vd: 'Sultanahmet', tel: '(212) 519 07 07', mail: 'satis@nuruosmaniyealtin.com.tr',
        },
        customer: {
            person: ['Ayşe Nur', 'TEKİN'], ids: [['TCKN', '17305928460'], ['MUSTERITURU', 'GERCEKKISI']],
            addr: addr('Göztepe Mahallesi Tütüncü Mehmet Efendi Caddesi', '104/7', 'Kadıköy', 'İstanbul', '34730'), tel: '(532) 771 03 48',
        },
        payments: [
            { code: '42', note: 'Müşteri — bedel havale ile ödendi', payer: 'TR560006400000110287345621' },
            { code: '10', note: 'Müessese — külçeler sertifikalı ambalajında elden teslim edildi', payee: '0' },
        ],
        lines: [
            { name: '1 gr Külçe Altın', desc: '995/1000 · Seri NRO-1G-418201…418204', qty: 4, price: 5812.40 },
            { name: '5 gr Külçe Altın', desc: '995/1000 · Seri NRO-5G-207733…207734', qty: 2, price: 28961.00 },
            { name: '10 gr Külçe Altın', desc: '995/1000 · Seri NRO-10G-098152', qty: 1, price: 57835.00 },
        ],
    }),
    xslt: cnXslt({
        title: 'e-Kıymetli Maden Belgesi',
        comment: 'Gram Külçe Altın Satım Sertifikası (EKIYMETLIMADENBELGE · SATIM): gravürlü siyah-altın çerçeve, külçe kartları ve toplam plaketi.',
        css: `
            .sayfa { font-family: Georgia, 'Times New Roman', serif; font-size: 9.5pt; color: #1c1917; background: #fbf7ee; padding: 8mm; }
            .cer { border: 2.5mm solid #111; outline: .6mm solid #c9a227; outline-offset: -1.6mm; min-height: 281mm; padding: 0 0 8mm; position: relative; }
            .bas { background: #111 repeating-radial-gradient(circle at 50% 120%, #1c1c1c 0 1.2mm, #111 1.2mm 2.4mm); color: #e9d48b; padding: 8mm 10mm 7mm; display: flex; align-items: center; gap: 7mm; }
            .bas .ad { flex: 1; } .bas .ad b { display: block; font-size: 15pt; letter-spacing: 1px; color: #f5e3a3; } .bas .ad span { font-size: 8.5pt; color: #bfa75a; font-family: 'Segoe UI', Arial, sans-serif; }
            .bas .ser { text-align: right; } .bas .ser h1 { margin: 0; font-size: 13pt; letter-spacing: 3px; font-weight: 400; } .bas .ser div { font-size: 8.5pt; color: #bfa75a; margin-top: 1mm; font-family: 'Segoe UI', Arial, sans-serif; }
            .ser-no { font-family: Consolas, monospace; color: #f5e3a3; font-size: 10pt; }
            .kurlar { display: flex; justify-content: center; gap: 0; background: #c9a227; color: #111; font-family: 'Segoe UI', Arial, sans-serif; font-size: 8pt; }
            .kurlar div { padding: 1.8mm 3mm; border-right: 1px solid rgba(0,0,0,.25); white-space: nowrap; font-size: 7.6pt; } .kurlar div:last-child { border-right: 0; } .kurlar b { margin-left: 1.5mm; }
            .ic { padding: 7mm 10mm 0; }
            .taraf { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
            h3 { margin: 0 0 2mm; font-size: 8pt; letter-spacing: 2.5px; text-transform: uppercase; color: #a16207; font-weight: 400; border-bottom: 1px solid #e7d7a6; padding-bottom: 1mm; }
            .p-ad { font-size: 12pt; font-weight: 700; } .p-adr, .p-vk, .p-il, .p-ek { font-size: 8.5pt; color: #57534e; font-family: 'Segoe UI', Arial, sans-serif; margin-top: .6mm; } .p-ek i { font-style: normal; color: #a16207; }
            .mt { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5pt; display: grid; grid-template-columns: auto 1fr; gap: 1mm 4mm; } .mt i { font-style: normal; color: #78716c; }
            .kulceler { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; margin-top: 8mm; }
            .kulce { text-align: center; }
            .bar { height: 26mm; clip-path: polygon(12% 0, 88% 0, 100% 100%, 0 100%); background: linear-gradient(160deg, #fff3b0 0%, #e2b93b 35%, #b8860b 60%, #f4d26b 85%, #c99a1d 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #4a3407; }
            .bar b { font-size: 11.5pt; padding: 0 16%; text-align: center; line-height: 1.15; } .bar span { font-size: 7.5pt; letter-spacing: 1.5px; font-family: 'Segoe UI', Arial, sans-serif; }
            .kulce .alt { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.3pt; margin-top: 2mm; color: #57534e; } .kulce .alt b { display: block; font-size: 11pt; color: #1c1917; margin-top: .8mm; }
            .alt2 { display: grid; grid-template-columns: 1fr 82mm; gap: 8mm; margin-top: 9mm; align-items: start; }
            .plaket { background: #111; color: #f5e3a3; padding: 5mm 6mm; border: .6mm solid #c9a227; outline: 1px solid #111; outline-offset: 1mm; }
            .plaket div { display: flex; justify-content: space-between; font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.8pt; padding: 1mm 0; color: #d6c27e; } .plaket .son { border-top: 1px solid #c9a227; margin-top: 2mm; padding-top: 3mm; font-size: 14pt; color: #f5e3a3; font-family: Georgia, serif; }
            .odm div { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5pt; margin-bottom: 1.5mm; } .odm i { display: block; font-style: normal; color: #78716c; font-size: 7.8pt; }
            .yz { font-style: italic; font-size: 9pt; margin-top: 3mm; color: #57534e; }
            .not { position: absolute; left: 10mm; right: 10mm; bottom: 8mm; display: flex; gap: 6mm; align-items: flex-end; }
            .not ul { flex: 1; margin: 0; padding-left: 4mm; font-size: 7.8pt; color: #57534e; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; }
            .imza { position: absolute; right: 10mm; bottom: 38mm; width: 50mm; text-align: center; font-size: 8pt; color: #78716c; border-top: 1px solid #a8a29e; padding-top: 1.5mm; }
        `,
        body: `<div class="sayfa"><div class="cer">
    <div class="bas">${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><circle cx="30" cy="30" r="27" fill="none" stroke="#c9a227" stroke-width="2"/><circle cx="30" cy="30" r="22" fill="none" stroke="#c9a227" stroke-width=".8"/><text x="30" y="38" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#f5e3a3">N</text></svg>`, 60, 60)}
        <div class="ad">${each(SUP, `<b>${v('cac:PartyName/cbc:Name')}</b><span>${v('cac:PostalAddress/cbc:StreetName')}${t(' No:')}${v('cac:PostalAddress/cbc:BuildingNumber')}${t(' · ')}${v('cac:PostalAddress/cbc:CitySubdivisionName')}${t(' / ')}${v('cac:PostalAddress/cbc:CityName')}${t(' · VKN ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='VKN']")}${t(' · ')}${v('cac:PartyTaxScheme/cac:TaxScheme/cbc:Name')}${t(' V.D.')}</span>`)}</div>
        <div class="ser"><h1>${t('SATIM SERTİFİKASI')}</h1><div>${profilAd()}</div><div class="ser-no">${v('$f/cbc:ID')}</div></div></div>
    <div class="kurlar">${DV.kurlar((c, a, s) => `<div>${c}<b>${a}</b>${t(' / ')}<b style="margin:0">${s}</b></div>`)}</div>
    <div class="ic">
        <div class="taraf"><div><h3>${t('Alıcı')}</h3>${partyBlock(CUS)}</div><div><h3>${t('Belge')}</h3><div class="mt">${meta((a, b) => `<i>${a}</i><span>${b}</span>`)}${refs((a, b) => `<i>${a}</i><span>${b}</span>`)}<i>${t('Müşteri türü')}</i><span>${DV.musteriTuru}</span></div></div></div>
        <div class="kulceler">${DV.satirlar((r) => `<div class="kulce"><div class="bar"><b>${r.ad}</b><span>${t('FINE GOLD 995,0')}</span></div><div class="alt">${r.aciklama}<br/>${r.miktar}${t(' ')}${r.birim}${t(' × ')}${r.fiyat}<b>${r.tutar}</b></div></div>`)}</div>
        <div class="alt2"><div><h3>${t('Ödeme ve Teslim')}</h3><div class="odm">${DV.odemeler((a, b) => `<div><i>${a}</i>${b}</div>`)}</div>${yalniz(`<div class="yz">${v('.')}</div>`)}</div>
            <div class="plaket">${DV.toplamlar((a, b) => `<div><span>${a}</span><span>${b}</span></div>`)}<div class="son"><span>${t('Ödenecek')}</span><span>${DV.odenecek}</span></div></div></div>
    </div>
    <div class="imza">${t('Yetkili imza / kaşe')}</div>
    <div class="not"><ul>${notes(`<li>${v('.')}</li>`, " and not(starts-with(.,'Kur Tablosu'))")}</ul>${qr(80)}</div>
</div></div>`,
    }),
};

/* ------------------------------------------------------------- 3. Hurda gümüş ALIM */

const MILYEM = "number(substring(substring-after(cac:Item/cbc:Description,'Milyem '),1,3))";
const gumus = {
    id: 'gumus-hurda-alim',
    sector: 'kuyumcu',
    moduleId: 'doviz',
    accent: '#475569',
    name: 'Hurda Gümüş Ayar Analizi ve Alım Belgesi',
    description: 'Gümüş atölyesinin firmadan hurda gümüş aldığı e-Kıymetli Maden ALIM belgesi: milimetrik laboratuvar başlığı, numune / istatistik no, milyem çubuklu analiz tablosu, toplam brüt gram ve ödenen tutar özeti.',
    tags: ['kıymetli maden', 'ALIM', 'gümüş', 'milyem', 'tüzel müşteri'],
    xml: doviz({
        comment: 'Hazır şablon örneği: Hurda Gümüş Ayar Analizi ve Alım Belgesi — EKIYMETLIMADENBELGE · ALIM (tüzel kişiden gram bazında gümüş alımı).',
        profile: 'EKIYMETLIMADENBELGE', type: 'ALIM', id: 'KZG2026000002417', date: '2026-10-08', time: '10:05:51', ist: 'A0391',
        tax: { name: 'KDV', code: '0015', pct: 0 },
        kur: [['GÜMÜŞ 999 (gr)', '55,90', '57,40'], ['GÜMÜŞ 925 (gr)', '51,80', '53,10'], ['GÜMÜŞ 800 (gr)', '44,60', '45,90']],
        notes: ['Tartım kalibre terazide müşteri yetkilisi huzurunda yapılmış, ayar XRF cihazıyla ölçülmüştür.', 'Bedel analiz sonucu ve günün alış kuru üzerinden hesaplanmıştır.', TEBLIG],
        supplier: {
            name: 'Kazazlar Gümüş Rafineri ve Telkari San. Ltd. Şti.', web: 'https://www.kazazlargumus.com.tr',
            ids: [['VKN', '5240716938'], ['SUBENO', 'TZN-0001']],
            addr: addr('Kazazlar Sokak', '18', 'Ortahisar', 'Trabzon', '61030'), vd: 'Karadeniz', tel: '(462) 321 58 18', mail: 'alim@kazazlargumus.com.tr',
        },
        customer: {
            name: 'Safranbolu Bakır ve Gümüş El Sanatları Ltd. Şti.', ids: [['VKN', '7381025946'], ['MUSTERITURU', 'TUZELKISI']],
            addr: addr('Çarşı Mahallesi Arasta Sokak', '9', 'Safranbolu', 'Karabük', '78600'), vd: 'Safranbolu', tel: '(370) 712 40 19',
        },
        payments: [
            { code: '10', note: 'Müşteri — hurda gümüş teslim edildi, tartım ve ayar analizi yapıldı', payer: '0' },
            { code: '42', note: 'Müessese — bedel müşteri banka hesabına havale edildi', payee: 'TR780011100000000082741936' },
        ],
        lines: [
            { name: '925 Ayar Hurda Gümüş Çatal-Bıçak Takımı', desc: 'Milyem 925 · Has 1.147,46 gr', qty: 1240.5, unit: 'GRM', price: 51.80 },
            { name: '800 Ayar Eski Gümüş Tepsi ve Şekerlik', desc: 'Milyem 800 · Has 489,60 gr', qty: 612, unit: 'GRM', price: 44.60 },
            { name: '999 Gümüş Granül (atölye artığı)', desc: 'Milyem 999 · Has 499,50 gr', qty: 500, unit: 'GRM', price: 56.10 },
        ],
    }),
    xslt: cnXslt({
        title: 'e-Kıymetli Maden Belgesi',
        comment: 'Hurda Gümüş Ayar Analizi ve Alım Belgesi (EKIYMETLIMADENBELGE · ALIM): milimetrik laboratuvar başlığı ve milyem çubuklu analiz tablosu.',
        css: `
            .sayfa { font-family: Consolas, 'Courier New', monospace; font-size: 9pt; color: #1e293b; background: #fff; }
            .lab { background-color: #f8fafc; background-image: linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px), linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px); background-size: 2mm 2mm, 2mm 2mm, 10mm 10mm, 10mm 10mm; padding: 10mm 14mm 7mm; border-bottom: 1.5mm solid #475569; }
            .lab .ust { display: flex; justify-content: space-between; align-items: flex-start; }
            .lab h1 { margin: 4mm 0 0; font-size: 16pt; letter-spacing: 1px; color: #0f172a; } .lab h1 small { display: block; font-size: 8.5pt; color: #64748b; letter-spacing: 3px; margin-top: 1mm; }
            .num { background: #0f172a; color: #e2e8f0; padding: 3mm 4mm; text-align: right; font-size: 8pt; } .num b { display: block; font-size: 11.5pt; color: #fff; margin-top: .5mm; }
            .ic { padding: 7mm 14mm 0; }
            .taraf { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
            .kutu { border: 1px solid #cbd5e1; padding: 4mm; } .kutu h3 { margin: -6.5mm 0 2mm; font-size: 7.8pt; background: #fff; display: inline-block; padding: 0 2mm; color: #475569; letter-spacing: 1.5px; }
            .p-ad { font-weight: 700; font-size: 10pt; font-family: 'Segoe UI', Arial, sans-serif; } .p-adr, .p-vk, .p-il, .p-ek { font-size: 8pt; color: #475569; margin-top: .6mm; } .p-ek i { font-style: normal; color: #0f172a; }
            .mt { display: grid; grid-template-columns: auto 1fr; gap: .8mm 3mm; font-size: 8pt; } .mt i { font-style: normal; color: #64748b; }
            table.an { width: 100%; border-collapse: collapse; margin-top: 7mm; }
            table.an th { background: #475569; color: #f8fafc; font-weight: 400; font-size: 7.8pt; letter-spacing: 1px; padding: 2mm; text-align: right; } table.an th:nth-child(2) { text-align: left; }
            table.an td { padding: 2.8mm 2mm; border-bottom: 1px solid #e2e8f0; text-align: right; vertical-align: top; } table.an td:nth-child(2) { text-align: left; font-family: 'Segoe UI', Arial, sans-serif; }
            .mil { width: 30mm; margin-left: auto; } .mil .c { height: 2.6mm; background: #e2e8f0; margin-top: 1mm; } .mil .c div { height: 100%; background: linear-gradient(90deg, #94a3b8, #475569); }
            .ozet { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; margin-top: 6mm; border: 1px solid #475569; }
            .ozet div { padding: 3.5mm 4mm; border-right: 1px solid #cbd5e1; } .ozet div:last-child { border-right: 0; background: #0f172a; color: #fff; }
            .ozet i { display: block; font-style: normal; font-size: 7.5pt; color: #64748b; letter-spacing: 1px; } .ozet div:last-child i { color: #94a3b8; } .ozet b { font-size: 13pt; }
            .alt { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 6mm; font-size: 8.3pt; }
            .alt .r div { display: flex; justify-content: space-between; padding: 1mm 0; border-bottom: 1px dashed #cbd5e1; }
            .alt .o div { margin-bottom: 1.5mm; } .alt .o i { display: block; font-style: normal; color: #64748b; }
            .kurt { font-size: 8pt; } .kurt span { display: inline-block; border: 1px solid #cbd5e1; padding: 1mm 2.5mm; margin: 0 1.5mm 1.5mm 0; }
            .son { display: flex; gap: 6mm; align-items: flex-end; margin: 7mm 14mm 0; } .son ul { flex: 1; margin: 0; padding-left: 4mm; font-size: 7.6pt; color: #64748b; line-height: 1.6; }
        `,
        body: `<div class="sayfa">
    <div class="lab"><div class="ust">${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><path d="M6 34 L18 6 L30 34 Z" fill="none" stroke="#475569" stroke-width="2.5"/><path d="M12 24 h12" stroke="#94a3b8" stroke-width="2"/><text x="38" y="22" font-family="Georgia,serif" font-weight="700" font-size="17" fill="#0f172a">Kazazlar</text><text x="39" y="33" font-family="Consolas,monospace" font-size="8" letter-spacing="2" fill="#475569">GÜMÜŞ · TELKARİ</text></svg>`, 160, 40)}
        <div class="num">${t('BELGE NO')}<b>${v('$f/cbc:ID')}</b>${t('NUMUNE / İST. NO ')}${v("$f/cac:AdditionalDocumentReference[cbc:DocumentTypeCode='ISTATISTIKNO']/cbc:ID")}</div></div>
        <h1>${t('AYAR ANALİZİ VE ')}${DV.tip}${t(' BELGESİ')}<small>${profilAd()}</small></h1></div>
    <div class="ic">
        <div class="taraf"><div class="kutu"><h3>${t('MÜESSESE')}</h3>${partyBlock(SUP)}</div><div class="kutu"><h3>${t('SATICI MÜŞTERİ')}</h3>${partyBlock(CUS)}<div class="p-il">${t('Müşteri türü: ')}${DV.musteriTuru}</div></div></div>
        <table class="an"><tr><th>${t('NO')}</th><th>${t('MALZEME / ANALİZ')}</th><th>${t('BRÜT')}</th><th>${t('MİLYEM')}</th><th>${t('BİRİM FİYAT')}</th><th>${t('TUTAR')}</th></tr>
            ${DV.satirlar((r) => `<tr><td>${r.no}</td><td><b>${r.ad}</b><div style="font-size:7.8pt;color:#64748b">${r.aciklama}</div></td><td>${r.miktar}${t(' ')}${r.birim}</td>
            <td><div class="mil">${v(MILYEM)}${t(' ‰')}<div class="c"><div><xsl:attribute name="style">width:<xsl:value-of select="${MILYEM} div 10"/>%</xsl:attribute></div></div></div></td><td>${r.fiyat}</td><td><b>${r.tutar}</b></td></tr>`)}</table>
        <div class="ozet"><div><i>${t('TOPLAM BRÜT')}</i><b>${num('sum($f/cac:CreditNoteLine/cbc:CreditedQuantity)', '###.##0,00')}${t(' gr')}</b></div>
            <div><i>${t('KALEM')}</i><b>${v('count($f/cac:CreditNoteLine)')}</b></div><div><i>${t('MÜŞTERİYE ÖDENEN')}</i><b>${DV.odenecek}</b></div></div>
        <div class="alt"><div><div class="kurt">${DV.kurlar((c, a, s) => `<span>${c}${t(' ')}${a}${t(' / ')}${s}</span>`)}</div><div class="o">${DV.odemeler((a, b) => `<div><i>${a}</i>${b}</div>`)}</div></div>
            <div class="r">${DV.toplamlar((a, b) => `<div><span>${a}</span><b>${b}</b></div>`)}${yalniz(`<div style="border:0;font-style:italic">${v('.')}</div>`)}</div></div>
        <div class="mt" style="margin-top:5mm">${meta((a, b) => `<i>${a}</i><span>${b}</span>`)}</div>
    </div>
    <div class="son"><ul>${notes(`<li>${v('.')}</li>`, " and not(starts-with(.,'Kur Tablosu'))")}</ul>${qr(84)}</div>
</div>`,
    }),
};

export default [alim, altin, gumus];
