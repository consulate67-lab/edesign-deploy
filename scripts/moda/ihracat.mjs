import {
    kurMetni,
    invoice, xslt, v, t, num, int, dt, unit, iban, each, iff, choose, attr, P, pName, pAddr, pTax, pContact,
    SUP, CUS, BUY, LMT, LX, LX1, gtip, tasima, kap, tlKarsilik, yalniz, notes, totals, bank, qr, logo, svg,
} from './lib.mjs';

const adr = (street, no, district, city, zip) => ({ street, no, district, city, zip });
const gumruk = {
    ids: [['VKN', '1460415308']],
    name: 'Ticaret Bakanlığı Gümrükler Genel Müdürlüğü - Bilgi İşlem Dairesi Başkanlığı',
    addr: { district: 'Çankaya', city: 'Ankara' },
    vd: 'Ulus',
};
const EXEMPT = { code: '301', reason: '11/1-a Mal ihracatı' };
const exp = (incoterm, gtipNo, mode, pkg) => ({ incoterm, gtip: gtipNo, mode, pkg });
const doc = (type) => `$f/cac:AdditionalDocumentReference[cbc:DocumentType='${type}']`;
const buyerName = v(`${BUY}/cac:PartyName/cbc:Name`);
const legal = iff('cac:PartyLegalEntity/cbc:CompanyID', `${t(' · Reg. ')}${v('cac:PartyLegalEntity/cbc:CompanyID')}`);
const kur = kurMetni();
const tarih = `${dt('$f/cbc:IssueDate')}${t(' ')}${v('substring($f/cbc:IssueTime,1,5)')}`;
const kapLine = `${v(`${LX.pkg}/cbc:ID`)}${t(' · ')}${v(`${LX.pkg}/cbc:Quantity`)}${t(' ')}${kap(`${LX.pkg}/cbc:PackagingTypeCode`)}`;

/* ================================================================ 1. Ayakkabı — TIR ile Irak (pasaport / vize) */

const zeugma = {
    web: 'https://www.zeugmashoes.com',
    ids: [['VKN', '9912034857'], ['MERSISNO', '0991203485700014']],
    name: 'Zeugma Ayakkabı Sanayi ve Dış Ticaret A.Ş.',
    addr: adr('Başpınar OSB 5. Bölge 83524 Nolu Cad.', '6', 'Şehitkamil', 'Gaziantep', '27600'),
    vd: 'Gaziantep Kurumlar', tel: '+90 342 337 82 00', mail: 'export@zeugmashoes.com',
};
const rafidain = {
    ids: [['PARTYTYPE', 'EXPORT']],
    name: 'Al-Rafidain Footwear Trading Co.',
    addr: { street: '60 Meter Street', no: '214', district: 'Ankawa', city: 'Erbil', zip: '44001', cc: 'IQ', country: 'Irak' },
    legal: ['Al-Rafidain Footwear Trading Co.', 'IQ-ERB-0048213'], tel: '+964 750 448 2130', mail: 'import@alrafidain-shoes.iq',
};
const x1 = {
    id: 'ayakkabi-ihracat-tir-fatura',
    xml: invoice({
        comment: `Hazır şablon örneği: Ayakkabı ihracatı, TIR ile Irak'a (Habur çıkışlı) — IHRACAT · ISTISNA (301), USD, DAP Erbil, karayolu (3).
            AccountingCustomerParty Gümrükler Genel Müdürlüğü, BuyerCustomerParty PARTYTYPE EXPORT; satırda GTİP, kap no / adet, NUMARA ve RENK.`,
        profile: 'IHRACAT', type: 'ISTISNA', id: 'ZGM2026000000318', date: '2026-10-07', time: '15:30:00', currency: 'USD', rate: 42.653,
        notes: ['Çıkış gümrüğü: Habur Gümrük Müdürlüğü — Varış: İbrahim Halil / Erbil', 'TIR: 27 ZGM 318 · Dorse 27 ZGM 319 · Sürücü: Ahmet Çelik', 'Shipping marks: AL-RAFIDAIN / ERBIL / C/No 1-340'],
        order: { id: 'ARF-PO-2026-077', date: '2026-09-15' },
        docs: [
            { id: 'TR-TIR-2611842', date: '2026-10-07', type: 'TIRKARNESI', desc: 'TIR karnesi' },
            { id: 'CMR-ZGM-0318', date: '2026-10-07', type: 'CMR', desc: 'Karayolu taşıma senedi' },
        ],
        supplier: zeugma, customer: gumruk, buyer: rafidain, exemption: EXEMPT,
        payment: { code: '42', due: '2026-11-06', iban: 'TR710001200945200058000318', ibanCur: 'USD', bank: 'Halkbank — Gaziantep Ticari Şube · SWIFT TRHBTR2A' },
        terms: '%30 peşin, bakiye vesaik mukabili · 30% advance, balance CAD',
        lines: [
            { name: 'Erkek deri klasik ayakkabı', desc: 'Men\'s leather dress shoes', model: 'ZG-M-410', unit: 'PR', qty: 1440, price: 18.4, props: { NUMARA: '40–45', RENK: 'Siyah / Black' }, exp: exp('DAP', '640399930000', 3, ['1-120', 120, 'CT']) },
            { name: 'Erkek deri bot', desc: 'Men\'s leather ankle boots', model: 'ZG-M-455', unit: 'PR', qty: 720, price: 24.5, props: { NUMARA: '40–45', RENK: 'Kahve / Brown' }, exp: exp('DAP', '640391960000', 3, ['121-180', 60, 'CT']) },
            { name: 'Kadın sneaker', desc: 'Women\'s sneakers, textile upper', model: 'ZG-W-218', unit: 'PR', qty: 1200, price: 11.75, props: { NUMARA: '36–41', RENK: 'Beyaz / White' }, exp: exp('DAP', '640411000000', 3, ['181-280', 100, 'CT']) },
            { name: 'Çocuk sandalet', desc: 'Kids\' sandals, PU sole', model: 'ZG-K-077', unit: 'PR', qty: 720, price: 6.9, props: { NUMARA: '26–31', RENK: 'Karışık / Assorted' }, exp: exp('DAP', '640299980000', 3, ['281-340', 60, 'CT']) },
        ],
    }),
};
const guilloche = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60" fill="none" stroke-width=".6">
    <path d="M0 30 Q15 0 30 30 T60 30 T90 30 T120 30" stroke="#c9b27a"/><path d="M0 30 Q15 60 30 30 T60 30 T90 30 T120 30" stroke="#c9b27a"/>
    <path d="M0 20 Q15 -5 30 20 T60 20 T90 20 T120 20" stroke="#d8c9a3"/><path d="M0 40 Q15 65 30 40 T60 40 T90 40 T120 40" stroke="#d8c9a3"/>
    <path d="M0 10 Q15 30 30 10 T60 10 T90 10 T120 10" stroke="#e3d8bc"/><path d="M0 50 Q15 30 30 50 T60 50 T90 50 T120 50" stroke="#e3d8bc"/></svg>`);
const LT = '&lt;';
const MRZ = 'abcdefghijklmnopqrstuvwxyzçğıöşü .-,/';
const MRZU = `ABCDEFGHIJKLMNOPQRSTUVWXYZCGIOSU${LT.repeat(5)}`;
const fill = LT.repeat(44);
x1.xslt = xslt({
    title: 'e-İhracat Faturası',
    comment: `Zeugma Ayakkabı — TIR ile Irak'a ayakkabı ihracatı e-Faturası. Pasaport / vize konsepti: bordo-altın pasaport kapağı başlık,
        giyoş (guilloche) desenli zemin, karekodun fotoğraf yerinde durduğu kimlik sayfası, verilerden üretilen makinede okunur
        bölge (MRZ), gümrük çıkış / teslim şartı / KDV istisnası mühürlerinin basıldığı vize sayfası.`,
    css: `
        body { background: #2b1a1f; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #1f1a17; }
        .sayfa { background-color: #f6f1e4; background-image: url("${guilloche}"); padding-bottom: 9mm; }
        .kapak { background: #6b1d2a; background-image: radial-gradient(circle at 15% 50%, rgba(255,255,255,.08), transparent 45%); color: #e7c873; padding: 7mm 12mm; display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #d4af37; }
        .kapak h1 { margin: 0; font-family: 'Palatino Linotype', 'Book Antiqua', Georgia, serif; font-size: 22px; letter-spacing: 5px; font-weight: 400; }
        .kapak .alt { font-size: 9px; letter-spacing: 4px; opacity: .85; }
        .kapak .ad { font-size: 11px; margin-top: 4px; color: #f5e6b8; letter-spacing: .5px; }
        .rota { margin-left: auto; text-align: center; border: 1.5px solid #d4af37; border-radius: 6px; padding: 5px 12px; }
        .rota b { display: block; font-family: 'Palatino Linotype', Georgia, serif; font-size: 22px; letter-spacing: 3px; font-weight: 400; }
        .rota span { font-size: 8px; letter-spacing: 2px; }
        .biyo { margin: 7mm 12mm 0 12mm; background: rgba(255,253,246,.88); border: 1px solid #c9b27a; border-radius: 8px; padding: 9px 12px 0 12px; box-shadow: 0 2px 0 #e3d8bc; }
        .biyo .bas { display: flex; justify-content: space-between; font-size: 8px; letter-spacing: 2.5px; color: #6b1d2a; font-weight: 700; border-bottom: 1px solid #e3d8bc; padding-bottom: 4px; }
        .biyo .ic { display: flex; gap: 12px; padding: 8px 0; }
        .foto { width: 31mm; text-align: center; font-size: 7px; letter-spacing: 1.5px; color: #8a7a55; }
        .foto > div { border: 1px solid #c9b27a; background: #ffffff; padding: 5px; margin-bottom: 3px; display: flex; justify-content: center; }
        .alanlar { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 12px; align-content: start; }
        .alan .k { font-size: 7px; letter-spacing: 1px; color: #8a7a55; text-transform: uppercase; }
        .alan .v { font-weight: 700; font-size: 10.5px; }
        .alan .v.m { font-family: Consolas, monospace; font-size: 8.5px; font-weight: 400; }
        .mrz { font-family: 'OCR-B', 'OCR B Std', Consolas, monospace; font-size: 12.5px; letter-spacing: 2.6px; background: rgba(0,0,0,.035); margin: 0 -12px; padding: 6px 12px; border-top: 1px solid #e3d8bc; border-radius: 0 0 8px 8px; line-height: 1.5; white-space: nowrap; overflow: hidden; }
        .taraf { display: flex; gap: 8px; margin: 9px 12mm 0 12mm; }
        .taraf > div { flex: 1; border-left: 3px solid #6b1d2a; background: rgba(255,253,246,.85); padding: 5px 9px; line-height: 1.5; }
        .taraf .k { font-size: 7.5px; letter-spacing: 2px; color: #6b1d2a; font-weight: 700; }
        .taraf .ad { font-weight: 800; font-size: 11px; }
        .taraf .gum { flex: .8; border-left-color: #8a7a55; font-size: 9px; color: #57534e; }
        table.kalem { width: calc(100% - 24mm); margin: 10px 12mm 0 12mm; border-collapse: collapse; background: rgba(255,253,246,.9); }
        table.kalem th { background: #6b1d2a; color: #e7c873; font-weight: 600; font-size: 8px; letter-spacing: 1px; padding: 5px 6px; text-align: left; }
        table.kalem th.s, table.kalem td.s { text-align: right; }
        table.kalem td { padding: 5px 6px; border-bottom: 1px solid #e3d8bc; vertical-align: top; }
        table.kalem td.g { font-family: Consolas, monospace; font-size: 9px; color: #6b1d2a; white-space: nowrap; }
        table.kalem .ad { font-weight: 700; font-size: 10.5px; }
        table.kalem small { display: block; color: #78716c; font-size: 8.5px; }
        .alt { display: flex; gap: 10px; margin: 10px 12mm 0 12mm; align-items: stretch; }
        .vize { flex: 1; border: 1px dashed #c9b27a; border-radius: 6px; background: rgba(255,253,246,.6); position: relative; min-height: 50mm; padding: 6px 9px; }
        .vize .k { font-size: 7.5px; letter-spacing: 2.5px; color: #8a7a55; font-weight: 700; }
        .muhur { position: absolute; text-align: center; font-family: 'Arial Black', Arial, sans-serif; mix-blend-mode: multiply; line-height: 1.25; }
        .m1 { left: 10px; top: 22px; border: 3px solid rgba(21,128,61,.75); color: rgba(21,128,61,.85); padding: 4px 8px; transform: rotate(-9deg); font-size: 8px; letter-spacing: 1px; border-radius: 3px; }
        .m1 b { display: block; font-size: 13px; }
        .m2 { left: 110px; top: 14px; width: 86px; height: 86px; border-radius: 50%; border: 3px double rgba(126,34,206,.75); color: rgba(126,34,206,.85); padding-top: 20px; font-size: 7.5px; transform: rotate(12deg); }
        .m2 b { display: block; font-size: 17px; }
        .m3 { left: 30px; top: 92px; border: 2.5px solid rgba(29,78,216,.75); color: rgba(29,78,216,.85); border-radius: 50%; padding: 6px 16px; font-size: 7.5px; transform: rotate(-4deg); }
        .m3 b { display: block; font-size: 12px; }
        .m4 { left: 205px; top: 82px; border: 2px solid rgba(185,28,28,.7); color: rgba(185,28,28,.8); padding: 3px 7px; font-size: 7.5px; transform: rotate(7deg); }
        .m4 b { display: block; font-size: 10px; }
        .toplam { width: 78mm; background: rgba(255,253,246,.95); border: 1px solid #c9b27a; border-radius: 6px; padding: 7px 10px; }
        .toplam table { width: 100%; border-collapse: collapse; }
        .toplam td { padding: 2px 0; }
        .toplam td.t { text-align: right; font-weight: 700; }
        .toplam tr.ist td { color: #1d4ed8; }
        .toplam tr.ara td { border-top: 1px solid #c9b27a; font-weight: 800; }
        .odenecek { background: #6b1d2a; color: #e7c873; border-radius: 4px; padding: 6px 10px; margin-top: 5px; display: flex; justify-content: space-between; align-items: baseline; }
        .odenecek b { font-family: 'Palatino Linotype', Georgia, serif; font-size: 20px; font-weight: 400; color: #fff7e0; }
        .tl { font-size: 8.5px; color: #78716c; text-align: right; margin-top: 3px; }
        .dip { margin: 9px 12mm 0 12mm; display: flex; gap: 10px; font-size: 9px; line-height: 1.5; }
        .dip > div { flex: 1; }
        .dip .yalniz { font-style: italic; font-weight: 700; color: #6b1d2a; }
        .dip ul { margin: 2px 0 0 0; padding-left: 14px; }
        .banka { border: 1px solid #c9b27a; border-radius: 6px; padding: 5px 9px; background: rgba(255,253,246,.9); }
        .banka .ib { font-family: Consolas, monospace; font-size: 11px; font-weight: 700; color: #6b1d2a; }`,
    body: `
<div class="sayfa">
    <div class="kapak">
        ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="#d4af37" stroke-width="2"/><circle cx="32" cy="32" r="23" fill="none" stroke="#d4af37" stroke-width=".8"/><path d="M16 40 L16 33 Q25 33 29 26 L35 26 Q38 33 47 34 Q50 35 50 40 Z" fill="#d4af37"/><path d="M14 44 H50" stroke="#d4af37" stroke-width="2"/><path d="M32 10 L34 15 L39 15 L35 18 L37 23 L32 20 L27 23 L29 18 L25 15 L30 15 Z" fill="#d4af37"/></svg>', 60, 60)}
        <div>
            <h1>${t('e-İHRACAT FATURASI')}</h1>
            <div class="alt">${t('EXPORT INVOICE · IHRACAT · ISTISNA')}</div>
            <div class="ad">${each(SUP, pName)}</div>
        </div>
        <div class="rota">
            <b>${v(`${SUP}/cac:PostalAddress/cac:Country/cbc:IdentificationCode`)}${t(' → ')}${v(`${BUY}/cac:PostalAddress/cac:Country/cbc:IdentificationCode`)}</b>
            <span>${tasima(LX1.mode)}${t(' · ')}${v(LX1.incoterm)}</span>
        </div>
    </div>
    <div class="biyo">
        <div class="bas"><span>${t('FATURA SAYFASI · INVOICE DATA PAGE')}</span><span>${t('TÜRKİYE CUMHURİYETİ · e-FATURA')}</span></div>
        <div class="ic">
            <div class="foto"><div>${qr(98)}</div>${t('GİB KAREKOD')}</div>
            <div class="alanlar">
                <div class="alan"><div class="k">${t('Fatura No / Invoice No')}</div><div class="v">${v('$f/cbc:ID')}</div></div>
                <div class="alan"><div class="k">${t('Tarih / Date')}</div><div class="v">${tarih}</div></div>
                <div class="alan"><div class="k">${t('Senaryo · Tip / Type')}</div><div class="v">${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:InvoiceTypeCode')}</div></div>
                <div class="alan"><div class="k">${t('Teslim Şartı / Incoterms')}</div><div class="v">${v(LX1.incoterm)}${t(' ')}${v(`${BUY}/cac:PostalAddress/cbc:CityName`)}</div></div>
                <div class="alan"><div class="k">${t('Taşıma / Transport')}</div><div class="v">${tasima(LX1.mode)}${t(' / ')}${tasima(LX1.mode, true)}</div></div>
                <div class="alan"><div class="k">${t('Döviz Kuru / Rate')}</div><div class="v">${kur}</div></div>
                <div class="alan"><div class="k">${t('Sipariş / P.O.')}</div><div class="v">${v('$f/cac:OrderReference/cbc:ID')}</div></div>
                <div class="alan"><div class="k">${t('TIR Karnesi / CMR')}</div><div class="v">${v(`${doc('TIRKARNESI')}/cbc:ID`)}${t(' · ')}${v(`${doc('CMR')}/cbc:ID`)}</div></div>
                <div class="alan"><div class="k">${t('ETTN / UUID')}</div><div class="v m">${v('$f/cbc:UUID')}</div></div>
            </div>
        </div>
        <div class="mrz">${v(`substring(concat('IHR${LT}TUR${LT}', translate(${BUY}/cac:PartyName/cbc:Name, '${MRZ}', '${MRZU}'), '${fill}'), 1, 44)`)}<br/>${v(`substring(concat($f/cbc:ID, '${LT}', $f/cbc:DocumentCurrencyCode, translate(format-number(${LMT}/cbc:PayableAmount, '0000000.00'), '.', ''), '${LT}', ${LX1.incoterm}, '${LT}', translate($f/cbc:IssueDate, '-', ''), '${fill}'), 1, 44)`)}</div>
    </div>
    <div class="taraf">
        <div><div class="k">${t('İHRACATÇI / EXPORTER')}</div>${each(SUP, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}</div>
        <div><div class="k">${t('ALICI / BUYER')}</div>${each(BUY, `<div class="ad">${pName}</div>${pAddr()}<br/>${v('cac:Contact/cbc:Telephone')}${t(' · ')}${v('cac:Contact/cbc:ElectronicMail')}${legal}`)}</div>
        <div class="gum"><div class="k">${t('FATURA MUHATABI')}</div>${each(CUS, `<b>${pName}</b><br/>${pTax()}`)}</div>
    </div>
    <table class="kalem">
        <tr><th>${t('GTİP / HS')}</th><th>${t('ÜRÜN / DESCRIPTION')}</th><th>${t('KAP / PACKAGES')}</th><th class="s">${t('MİKTAR')}</th><th class="s">${t('FİYAT')}</th><th class="s">${t('TUTAR')}</th></tr>
        ${each('$f/cac:InvoiceLine', `<tr>
            <td class="g">${gtip(LX.gtip)}</td>
            <td><div class="ad">${v('cac:Item/cbc:Name')}</div><small>${v('cac:Item/cbc:Description')}${t(' · ')}${v('cac:Item/cbc:ModelName')}${t(' · No ')}${v(P('NUMARA'))}${t(' · ')}${v(P('RENK'))}</small></td>
            <td>${kapLine}</td>
            <td class="s">${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}</td>
            <td class="s">${num('cac:Price/cbc:PriceAmount')}</td>
            <td class="s"><b>${num('cbc:LineExtensionAmount')}</b></td>
        </tr>`)}
    </table>
    <div class="alt">
        <div class="vize">
            <div class="k">${t('VİZE SAYFASI · GÜMRÜK KAŞELERİ')}</div>
            <div class="muhur m1">${t('T.C. HABUR GÜMRÜK')}<b>${t('ÇIKIŞ · EXIT')}</b>${dt('$f/cbc:IssueDate')}</div>
            <div class="muhur m2">${t('TESLİM ŞARTI')}<b>${v(LX1.incoterm)}</b>${v(`translate(${BUY}/cac:PostalAddress/cbc:CityName,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')`)}</div>
            <div class="muhur m3">${t('KDV İSTİSNA')}<b>${v('$f/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReasonCode')}</b>${v('$f/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReason')}</div>
            <div class="muhur m4">${t('KAP ADEDİ')}<b>${int(`sum($f/cac:InvoiceLine/${LX.pkg}/cbc:Quantity)`)}${t(' ')}${kap(`${LX1.pkg}/cbc:PackagingTypeCode`)}</b></div>
        </div>
        <div class="toplam">
            <table>${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
            <div class="odenecek"><span>${t('ÖDENECEK / TOTAL')}</span><b>${num(`${LMT}/cbc:PayableAmount`)}${t(' ')}${v('$pb')}</b></div>
            <div class="tl">${t('TL karşılığı: ')}${tlKarsilik()}${t(' TL · ')}${kur}</div>
        </div>
    </div>
    <div class="dip">
        <div>
            ${yalniz(`<div class="yalniz">${v('.')}</div>`)}
            <ul>${notes(`<li>${v('.')}</li>`)}</ul>
        </div>
        <div>
            ${bank(`<div class="banka"><b>${v('cbc:PaymentNote')}</b><div class="ib">${iban('cbc:ID')}</div>${v('cbc:CurrencyCode')}${t(' hesabı · Vade ')}${dt('$f/cac:PaymentMeans/cbc:PaymentDueDate')}<br/>${v('$f/cac:PaymentTerms/cbc:Note')}</div>`)}
        </div>
    </div>
</div>`,
});

/* ================================================================ 2. Hazır giyim — İngiltere (lüks minimal, iki dilli) */

const lale = {
    web: 'https://www.maisonlale.com',
    ids: [['VKN', '6120394857'], ['MERSISNO', '0612039485700019']],
    name: 'Maison Lale Tekstil ve Dış Ticaret A.Ş.',
    addr: adr('Mahmutbey Mah. Taşocağı Yolu Cad.', '19', 'Bağcılar', 'İstanbul', '34218'),
    vd: 'Güneşli', tel: '+90 212 444 52 53', mail: 'export@maisonlale.com',
};
const harrow = {
    ids: [['PARTYTYPE', 'EXPORT']],
    name: 'Harrow & Finch Ltd.',
    addr: { street: 'Great Portland Street', no: '48', district: 'Fitzrovia', city: 'London', zip: 'W1W 7ND', cc: 'GB', country: 'Birleşik Krallık' },
    legal: ['Harrow & Finch Ltd.', 'GB 412 7781 06'], tel: '+44 20 7946 0318', mail: 'buying@harrowfinch.co.uk',
};
const x2 = {
    id: 'hazir-giyim-ihracat-fatura',
    xml: invoice({
        comment: `Hazır şablon örneği: Kadın hazır giyim ihracatı, İngiltere — IHRACAT · ISTISNA (301), GBP, FOB Ambarlı, denizyolu (1).
            Satırda GTİP, kap no / adet, STIL, RENK, KOMPOZISYON ve ORAN (koli içi beden oranı) ek tanımları.`,
        profile: 'IHRACAT', type: 'ISTISNA', id: 'MLL2026000000127', date: '2026-10-06', time: '16:40:00', currency: 'GBP', rate: 57.284,
        notes: ['Port of loading: Ambarlı, İstanbul — Port of discharge: Felixstowe · Vessel: CMA CGM TANGO 0FX4KW', 'Shipping marks: H&F / LONDON / AW26 / C/No 1-196'],
        order: { id: 'HF-AW26-0412', date: '2026-07-22' },
        supplier: lale, customer: gumruk, buyer: harrow, exemption: EXEMPT,
        payment: { code: '42', due: '2026-12-05', iban: 'TR180006400000211230046127', ibanCur: 'GBP', bank: 'Türkiye İş Bankası — Güneşli Ticari Şube · SWIFT ISBKTRIS' },
        terms: '60 gün vadeli mal mukabili · Open account, 60 days',
        lines: [
            { name: 'Kadın kruvaze yün kaban', desc: 'Women\'s double-breasted wool coat', sid: 'AW26-CT-01', unit: 'C62', qty: 480, price: 68, props: { RENK: 'Camel', KOMPOZISYON: '70% Wool · 30% Polyamide', ORAN: 'S1 · M2 · L2 · XL1' }, exp: exp('FOB', '620231000000', 1, ['1-80', 80, 'CT']) },
            { name: 'Kadın krep blazer ceket', desc: 'Tailored crepe blazer', sid: 'AW26-BL-07', unit: 'C62', qty: 360, price: 42.5, props: { RENK: 'Ivory', KOMPOZISYON: '64% Polyester · 32% Viscose · 4% Elastane', ORAN: 'S2 · M3 · L2 · XL1' }, exp: exp('FOB', '620433900000', 1, ['81-126', 46, 'CT']) },
            { name: 'Kadın pileli bol paça pantolon', desc: 'Wide-leg pleated trousers', sid: 'AW26-TR-12', unit: 'C62', qty: 600, price: 21.8, props: { RENK: 'Black', KOMPOZISYON: '100% Polyester', ORAN: 'S3 · M5 · L4 · XL3' }, exp: exp('FOB', '620463900000', 1, ['127-166', 40, 'CT']) },
            { name: 'Kadın merino triko kazak', desc: 'Merino crew-neck jumper', sid: 'AW26-KN-04', unit: 'C62', qty: 540, price: 19.4, props: { RENK: 'Charcoal', KOMPOZISYON: '100% Merino Wool', ORAN: 'S4 · M6 · L5 · XL3' }, exp: exp('FOB', '611011100000', 1, ['167-196', 30, 'CT']) },
        ],
    }),
};
const iki = (tr, en) => `${t(tr)}<i>${t(en)}</i>`;
x2.xslt = xslt({
    title: 'e-İhracat Faturası',
    comment: `Maison Lale — İngiltere'ye kadın hazır giyim ihracatı e-Faturası. Lüks moda evi konsepti: yalnızca siyah-beyaz, Didot / Bodoni
        serif başlıklar, geniş boşluklar, iki dilli (TR / EN) etiketler, ince çizgili tablo; stil kodu, renk, kompozisyon ve beden oranı
        satır altında; ödenecek tutar iple asılı bir ürün etiketi (swing tag) üzerinde.`,
    css: `
        body { background: #e7e5e4; font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 9.5px; color: #0a0a0a; }
        .sayfa { background: #ffffff; padding: 15mm 16mm 12mm 16mm; }
        .serif { font-family: Didot, 'Bodoni MT', 'Playfair Display', 'Times New Roman', serif; }
        .ust { text-align: center; }
        .ust .marka { font-family: Didot, 'Bodoni MT', 'Times New Roman', serif; font-size: 26px; letter-spacing: 12px; margin-top: 6px; }
        .ust .adr { font-size: 8px; letter-spacing: .8px; color: #57534e; margin-top: 4px; }
        .cizgi { height: 1px; background: #0a0a0a; margin: 6mm 0 6mm 0; position: relative; }
        .cizgi:after { content: ''; position: absolute; left: 50%; top: -3px; width: 7px; height: 7px; margin-left: -4px; background: #ffffff; border: 1px solid #0a0a0a; transform: rotate(45deg); }
        .bas { display: flex; align-items: flex-start; gap: 14px; }
        .bas h1 { margin: 0; font-family: Didot, 'Bodoni MT', 'Times New Roman', serif; font-weight: 400; font-style: italic; font-size: 44px; line-height: .9; }
        .bas h1 span { display: block; font-style: normal; font-family: 'Segoe UI', sans-serif; font-size: 8px; letter-spacing: 3px; margin-top: 8px; white-space: nowrap; }
        .meta { margin-left: auto; border-collapse: collapse; }
        .meta td { padding: 2.5px 0 2.5px 12px; font-size: 9.5px; white-space: nowrap; }
        .meta td.k { color: #78716c; font-size: 7.5px; letter-spacing: 1.5px; text-transform: uppercase; text-align: right; }
        .meta td.k i, th i, .k i { display: block; font-style: italic; letter-spacing: .5px; text-transform: none; font-family: Didot, 'Bodoni MT', 'Times New Roman', serif; font-size: 9px; }
        .taraf { display: grid; grid-template-columns: 1fr 1fr .85fr; gap: 16px; margin-top: 6mm; }
        .taraf > div { border-top: 1px solid #0a0a0a; padding-top: 5px; line-height: 1.6; }
        .taraf .k { font-size: 7.5px; letter-spacing: 2px; text-transform: uppercase; color: #78716c; margin-bottom: 3px; }
        .taraf .ad { font-family: Didot, 'Bodoni MT', 'Times New Roman', serif; font-size: 14px; }
        table.kalem { width: 100%; border-collapse: collapse; margin-top: 7mm; }
        table.kalem th { font-weight: 400; font-size: 7.5px; letter-spacing: 1px; white-space: nowrap; text-transform: uppercase; text-align: left; padding: 0 6px 5px 0; border-bottom: 1px solid #0a0a0a; color: #57534e; vertical-align: bottom; }
        table.kalem th.s, table.kalem td.s { text-align: right; }
        table.kalem td { padding: 9px 6px 9px 0; border-bottom: 1px solid #e7e5e4; vertical-align: top; }
        table.kalem td.no { font-family: Didot, 'Bodoni MT', 'Times New Roman', serif; font-size: 18px; width: 9mm; }
        table.kalem .ad { font-family: Didot, 'Bodoni MT', 'Times New Roman', serif; font-size: 13px; }
        table.kalem .en { font-style: italic; color: #57534e; font-family: Didot, 'Bodoni MT', 'Times New Roman', serif; font-size: 10.5px; }
        table.kalem .det { margin-top: 4px; font-size: 8px; letter-spacing: .6px; color: #78716c; }
        table.kalem .det b { color: #0a0a0a; font-weight: 600; }
        table.kalem td.g { font-family: Consolas, monospace; font-size: 8.5px; white-space: nowrap; }
        table.kalem td.tt { font-family: Didot, 'Bodoni MT', 'Times New Roman', serif; font-size: 13px; white-space: nowrap; }
        .alt { display: flex; gap: 14mm; margin-top: 7mm; align-items: flex-start; }
        .alt .sol { flex: 1; line-height: 1.65; }
        .alt .sol .k { font-size: 7.5px; letter-spacing: 2px; text-transform: uppercase; color: #78716c; margin-top: 8px; }
        .alt .sol .yalniz { font-family: Didot, 'Bodoni MT', 'Times New Roman', serif; font-style: italic; font-size: 12px; }
        .alt .sol .ib { font-family: Consolas, monospace; font-size: 10.5px; letter-spacing: .5px; }
        .sag { width: 70mm; }
        .sag table { width: 100%; border-collapse: collapse; }
        .sag td { padding: 3px 0; border-bottom: 1px solid #f5f5f4; }
        .sag td.t { text-align: right; }
        .sag tr.ara td { border-bottom: 1px solid #0a0a0a; }
        .ip { width: 1px; height: 12mm; background: #0a0a0a; margin: 2mm auto -1px auto; transform: rotate(-6deg); transform-origin: top; }
        .etiket { position: relative; border: 1px solid #0a0a0a; border-radius: 6px 6px 3px 3px; padding: 16px 14px 12px 14px; text-align: center; transform: rotate(-3deg); box-shadow: 4px 6px 0 rgba(0,0,0,.06); clip-path: polygon(16% 0, 84% 0, 100% 12%, 100% 100%, 0 100%, 0 12%); background: #fafaf9; }
        .etiket:before { content: ''; position: absolute; top: 5px; left: 50%; width: 8px; height: 8px; margin-left: -5px; border-radius: 50%; border: 1px solid #0a0a0a; background: #ffffff; }
        .etiket .k { font-size: 7.5px; letter-spacing: 3px; text-transform: uppercase; }
        .etiket .v { font-family: Didot, 'Bodoni MT', 'Times New Roman', serif; font-size: 27px; margin: 3px 0; }
        .etiket .tl { font-size: 8px; color: #57534e; letter-spacing: .5px; }
        .dip { margin-top: 10mm; text-align: center; font-size: 7.5px; letter-spacing: 5px; color: #78716c; text-transform: uppercase; }
        .dip span { display: block; margin-top: 3px; letter-spacing: .5px; text-transform: none; font-family: Consolas, monospace; }`,
    body: `
<div class="sayfa">
    <div class="ust">
        ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="none" stroke="#0a0a0a" stroke-width="1"/><circle cx="32" cy="32" r="27" fill="none" stroke="#0a0a0a" stroke-width=".5"/><text x="32" y="41" text-anchor="middle" font-family="Didot, Bodoni MT, Times New Roman, serif" font-size="25" fill="#0a0a0a">ML</text></svg>', 58, 58)}
        ${each(SUP, `<div class="marka">${t('MAISON LALE')}</div><div class="adr">${pName}${t(' — ')}${pAddr()}</div><div class="adr">${pTax()}${t(' — ')}${pContact()}</div>`)}
    </div>
    <div class="cizgi"></div>
    <div class="bas">
        <h1>${t('Fatura')}<span>${t('EXPORT INVOICE · e-İHRACAT')}</span></h1>
        <table class="meta">
            <tr><td class="k">${iki('Fatura No', 'Invoice no.')}</td><td>${v('$f/cbc:ID')}</td><td class="k">${iki('Teslim', 'Incoterms')}</td><td>${v(LX1.incoterm)}${t(' — ')}${tasima(LX1.mode)}${t(' / ')}${tasima(LX1.mode, true)}</td></tr>
            <tr><td class="k">${iki('Tarih', 'Date')}</td><td>${tarih}</td><td class="k">${iki('Sipariş', 'Purchase order')}</td><td>${v('$f/cac:OrderReference/cbc:ID')}</td></tr>
            <tr><td class="k">${iki('Senaryo', 'Profile')}</td><td>${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:InvoiceTypeCode')}</td><td class="k">${iki('Kur', 'Exchange rate')}</td><td>${kur}</td></tr>
        </table>
        ${qr(74)}
    </div>
    <div class="taraf">
        <div><div class="k">${iki('Alıcı', 'Buyer')}</div>${each(BUY, `<div class="ad">${pName}</div>${pAddr(', ')}<br/>${pContact()}${legal}`)}</div>
        <div><div class="k">${iki('İhracatçı', 'Exporter')}</div>${each(SUP, `<div class="ad">${pName}</div>${pAddr(', ')}<br/>${pTax()}`)}</div>
        <div><div class="k">${iki('Fatura muhatabı', 'Addressee')}</div>${each(CUS, `${pName}<br/>${pTax()}`)}</div>
    </div>
    <table class="kalem">
        <tr><th></th><th>${iki('Ürün', 'Description')}</th><th>${iki('GTİP', 'HS code')}</th><th>${iki('Koli', 'Cartons')}</th><th class="s">${iki('Adet', 'Qty')}</th><th class="s">${iki('Birim fiyat', 'Unit price')}</th><th class="s">${iki('Tutar', 'Amount')}</th></tr>
        ${each('$f/cac:InvoiceLine', `<tr>
            <td class="no">${v("format-number(cbc:ID,'00')")}</td>
            <td><div class="ad">${v('cac:Item/cbc:Name')}</div><div class="en">${v('cac:Item/cbc:Description')}</div>
                <div class="det">${t('Style ')}<b>${v('cac:Item/cac:SellersItemIdentification/cbc:ID')}</b>${t(' · Colour ')}<b>${v(P('RENK'))}</b>${t(' · ')}${v(P('KOMPOZISYON'))}${t(' · Ratio ')}<b>${v(P('ORAN'))}</b></div></td>
            <td class="g">${gtip(LX.gtip)}</td>
            <td>${v(`${LX.pkg}/cbc:ID`)}<br/>${v(`${LX.pkg}/cbc:Quantity`)}${t(' ctn')}</td>
            <td class="s">${int('cbc:InvoicedQuantity')}</td>
            <td class="s">${num('cac:Price/cbc:PriceAmount')}</td>
            <td class="s tt">${num('cbc:LineExtensionAmount')}</td>
        </tr>`)}
    </table>
    <div class="alt">
        <div class="sol">
            ${yalniz(`<div class="yalniz">${v('.')}</div>`)}
            <div class="k">${iki('Notlar', 'Remarks')}</div>
            ${notes(`<div>${v('.')}</div>`)}
            <div class="k">${iki('Ödeme', 'Payment')}</div>
            ${v('$f/cac:PaymentTerms/cbc:Note')}${t(' — ')}${dt('$f/cac:PaymentMeans/cbc:PaymentDueDate')}
            ${bank(`<div>${v('cbc:PaymentNote')}</div><div class="ib">${iban('cbc:ID')}${t(' · ')}${v('cbc:CurrencyCode')}</div>`)}
        </div>
        <div class="sag">
            <table>${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
            <div class="ip"></div>
            <div class="etiket">
                <div class="k">${t('Ödenecek · Total due')}</div>
                <div class="v">${num(`${LMT}/cbc:PayableAmount`)}${t(' ')}${v('$pb')}</div>
                <div class="tl">${t('≈ ')}${tlKarsilik()}${t(' TL')}</div>
            </div>
        </div>
    </div>
    <div class="dip">${t('Teşekkürler · Thank you')}<span>${t('ETTN ')}${v('$f/cbc:UUID')}</span></div>
</div>`,
});

/* ================================================================ 3. Denim kumaş — İtalya (deri etiket, turuncu dikiş, bakır perçin) */

const marasDenim = {
    web: 'https://www.marasdenim.com',
    ids: [['VKN', '6012938475'], ['MERSISNO', '0601293847500012']],
    name: 'Maraş Denim Dokuma Sanayi ve Ticaret A.Ş.',
    addr: adr('Organize Sanayi Bölgesi 7. Cad.', '15', 'Dulkadiroğlu', 'Kahramanmaraş', '46050'),
    vd: 'Kahramanmaraş Kurumlar', tel: '+90 344 236 40 00', mail: 'export@marasdenim.com',
};
const tessuti = {
    ids: [['PARTYTYPE', 'EXPORT']],
    name: 'Tessuti Blu S.r.l.',
    addr: { street: 'Via Fratelli Cervi', no: '27', district: 'Carpi', city: 'Modena', zip: '41012', cc: 'IT', country: 'İtalya' },
    legal: ['Tessuti Blu S.r.l.', 'IT03921480362'], tel: '+39 059 642 118', mail: 'acquisti@tessutiblu.it',
};
const x3 = {
    id: 'denim-kumas-ihracat-fatura',
    xml: invoice({
        comment: `Hazır şablon örneği: Denim kumaş ihracatı, İtalya — IHRACAT · ISTISNA (301), EUR, CIF Genova, denizyolu (1), top (RO) ambalaj.
            Satırda GTİP, top no / adet, AGIRLIK (oz), EN, KOMPOZISYON, YIKAMA ve RENKKOD ek tanımları; konşimento ve sigorta belgeleri.`,
        profile: 'IHRACAT', type: 'ISTISNA', id: 'MRD2026000000944', date: '2026-10-05', time: '13:10:00', currency: 'EUR', rate: 49.912,
        notes: ['Port of loading: Mersin — Port of discharge: Genova · Vessel: MSC GIULIA 641W', 'Insurance: All risks, 110% of CIF value', 'Shipping marks: TESSUTI BLU / GENOVA / PO 7781 / Roll R1-R142'],
        order: { id: 'TB-PO-7781', date: '2026-08-30' },
        docs: [
            { id: 'MSCUMR2611844', date: '2026-10-05', type: 'KONSIMENTO', desc: 'Bill of Lading' },
            { id: 'ANS-26-118833', date: '2026-10-04', type: 'SIGORTA', desc: 'Nakliyat sigorta poliçesi' },
        ],
        supplier: marasDenim, customer: gumruk, buyer: tessuti, exemption: EXEMPT,
        payment: { code: '42', due: '2026-10-20', iban: 'TR330006100519786457841326', ibanCur: 'EUR', bank: 'Yapı Kredi — Kahramanmaraş Şubesi · SWIFT YAPITRIS' },
        terms: 'Gayrikabili rücu akreditif, görüldüğünde · Irrevocable L/C at sight',
        lines: [
            { name: 'Rigid denim kumaş', desc: '100% cotton, 3/1 RHT, rope dyed indigo', sid: 'MD-1350-RG', unit: 'MTR', qty: 12000, price: 3.85, props: { AGIRLIK: '13,5 oz', EN: '150 cm', KOMPOZISYON: '%100 pamuk', YIKAMA: 'Rinse', RENKKOD: '#1e3a5f' }, exp: exp('CIF', '520942000000', 1, ['R1-R48', 48, 'RO']) },
            { name: 'Stretch denim kumaş', desc: '98% cotton 2% elastane, 3/1 LHT', sid: 'MD-1100-ST', unit: 'MTR', qty: 9600, price: 4.2, props: { AGIRLIK: '11 oz', EN: '145 cm', KOMPOZISYON: '%98 pamuk %2 elastan', YIKAMA: 'Stone wash', RENKKOD: '#3b5f8f' }, exp: exp('CIF', '521142000000', 1, ['R49-R88', 40, 'RO']) },
            { name: 'Selvedge denim kumaş', desc: 'Shuttle loom, red-line selvedge', sid: 'MD-1400-SV', unit: 'MTR', qty: 4800, price: 7.6, props: { AGIRLIK: '14 oz', EN: '80 cm', KOMPOZISYON: '%100 pamuk', YIKAMA: 'Raw', RENKKOD: '#14243b' }, exp: exp('CIF', '520942000000', 1, ['R89-R112', 24, 'RO']) },
            { name: 'Siyah denim kumaş', desc: 'Sulphur black, overdyed', sid: 'MD-1000-BK', unit: 'MTR', qty: 6000, price: 3.95, props: { AGIRLIK: '10 oz', EN: '150 cm', KOMPOZISYON: '%100 pamuk', YIKAMA: 'Black wash', RENKKOD: '#26282c' }, exp: exp('CIF', '520942000000', 1, ['R113-R142', 30, 'RO']) },
        ],
    }),
};
const at = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="#4a2c12" stroke-width="2.4" stroke-dasharray="4 3"/><path d="M14 40 Q20 26 32 24 Q44 22 50 30 L47 33 Q42 28 34 30 Q26 32 22 42 Z" fill="#4a2c12"/><path d="M22 42 L20 50 M30 40 L30 50 M40 36 L42 48" stroke="#4a2c12" stroke-width="3"/></svg>');
x3.xslt = xslt({
    title: 'e-İhracat Faturası',
    comment: `Maraş Denim — İtalya'ya denim kumaş ihracatı e-Faturası. Kot konsepti: indigo dimi dokulu zemin, kabartma deri bel
        etiketi (patch) başlık, turuncu kontrast dikişli kartlar, bakır perçinler, her satırda RENKKOD ile boyanan kumaş kartelası,
        ağırlık (oz) / en / yıkama çipleri ve arka cep biçiminde toplam alanı.`,
    css: `
        body { background: #0f1d33; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #1c1917; }
        .sayfa { background-color: #2a4a73; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,.07) 0 1px, transparent 1px 3px), repeating-linear-gradient(45deg, rgba(0,0,0,.14) 0 1px, transparent 1px 4px); padding: 9mm 10mm; }
        .percin { position: absolute; width: 13px; height: 13px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #fde1b8, #c47a35 45%, #6b3a12 90%); box-shadow: 0 1px 2px rgba(0,0,0,.5); }
        .yama { position: relative; background: #8b5a2b; background-image: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18), transparent 60%), repeating-linear-gradient(10deg, rgba(0,0,0,.05) 0 2px, transparent 2px 6px); border-radius: 6px; padding: 10px; box-shadow: 0 3px 8px rgba(0,0,0,.45); }
        .yama .ic { border: 2px dashed #f0b56b; border-radius: 4px; padding: 9px 14px; display: flex; gap: 14px; align-items: center; color: #3b220d; }
        .yama .unvan { font-family: 'Rockwell', 'Arial Black', Georgia, serif; font-weight: 800; font-size: 17px; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 0 rgba(255,255,255,.25), -1px -1px 0 rgba(0,0,0,.25); }
        .yama .adr { font-size: 8.5px; line-height: 1.45; color: #4a2c12; }
        .yama .baslik { margin-left: auto; text-align: right; }
        .yama .baslik b { display: block; font-family: 'Rockwell', 'Arial Black', Georgia, serif; font-size: 21px; letter-spacing: 2px; text-shadow: 1px 1px 0 rgba(255,255,255,.25), -1px -1px 0 rgba(0,0,0,.3); }
        .yama .baslik span { font-size: 8px; letter-spacing: 3px; font-weight: 700; }
        .yama .qr { background: #f5efe2; padding: 4px; border-radius: 3px; }
        .kart { position: relative; background: #f5efe2; border-radius: 5px; margin-top: 9px; padding: 9px 12px; box-shadow: 0 2px 6px rgba(0,0,0,.35); }
        .kart:before { content: ''; position: absolute; inset: 4px; border: 1.5px dashed #e08a2c; border-radius: 3px; pointer-events: none; }
        .satir { display: flex; gap: 9px; }
        .satir > .kart { flex: 1; }
        .k { font-size: 7.5px; letter-spacing: 2px; font-weight: 800; color: #b45309; text-transform: uppercase; }
        .ad { font-weight: 800; font-size: 11px; color: #1e3a5f; }
        .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px 10px; }
        .meta b { display: block; font-size: 10.5px; color: #1e3a5f; }
        .top { display: flex; gap: 10px; align-items: center; padding: 7px 0; border-bottom: 1px dashed #d6c7a8; }
        .top:last-child { border-bottom: 0; }
        .kartela { width: 18mm; height: 18mm; border-radius: 3px; position: relative; box-shadow: inset 0 0 0 1px rgba(0,0,0,.25); background-image: repeating-linear-gradient(135deg, rgba(255,255,255,.18) 0 1px, transparent 1px 3px); flex-shrink: 0; }
        .kartela:after { content: ''; position: absolute; right: -1px; top: -1px; width: 0; height: 0; border-style: solid; border-width: 0 12px 12px 0; border-color: transparent #f5efe2 transparent transparent; }
        .top .bilgi { flex: 1; }
        .top .bilgi .ad { font-size: 12px; }
        .top .bilgi .en { color: #57534e; font-size: 9px; font-style: italic; }
        .cip { display: inline-block; border: 1.5px solid #e08a2c; color: #9a3412; border-radius: 10px; padding: 0 7px; font-size: 8.5px; font-weight: 700; margin: 3px 3px 0 0; background: #fff7ed; }
        .top .gt { width: 30mm; font-size: 8.5px; color: #57534e; line-height: 1.5; }
        .top .gt b { font-family: Consolas, monospace; color: #1e3a5f; }
        .top .tut { width: 34mm; text-align: right; line-height: 1.4; }
        .top .tut b { display: block; font-size: 13px; color: #1e3a5f; }
        .alt { display: flex; gap: 10px; align-items: flex-start; }
        .alt .sol { flex: 1; }
        .etiket { background: #ffffff; border-radius: 2px; padding: 8px 12px; margin-top: 9px; font-size: 9px; line-height: 1.55; box-shadow: 0 2px 6px rgba(0,0,0,.3); border-left: 6px solid #e08a2c; }
        .etiket .ib { font-family: Consolas, monospace; font-size: 11px; font-weight: 700; color: #1e3a5f; }
        .cep { width: 78mm; margin-top: 9px; background-color: #3b5f8f; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,.1) 0 1px, transparent 1px 3px); color: #f5efe2; padding: 12px 16px 26px 16px; clip-path: polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%); position: relative; }
        .cep:before { content: ''; position: absolute; inset: 5px 5px 0 5px; border: 1.5px dashed #f0a54a; clip-path: polygon(0 0, 100% 0, 100% 80%, 50% 99%, 0 80%); }
        .cep table { width: 100%; border-collapse: collapse; position: relative; }
        .cep td { padding: 2px 0; font-size: 9.5px; }
        .cep td.t { text-align: right; font-weight: 700; }
        .cep tr.ara td { border-top: 1px dashed #f0a54a; }
        .cep .od { text-align: center; margin-top: 6px; position: relative; }
        .cep .od span { font-size: 8px; letter-spacing: 3px; color: #f0b56b; font-weight: 800; }
        .cep .od b { display: block; font-family: 'Rockwell', 'Arial Black', Georgia, serif; font-size: 23px; color: #ffffff; }
        .cep .od i { font-style: normal; font-size: 8.5px; color: #dbe4f0; }`,
    body: `
<div class="sayfa">
    <div class="yama">
        <div class="percin" style="left:4px;top:4px"></div><div class="percin" style="right:4px;top:4px"></div><div class="percin" style="left:4px;bottom:4px"></div><div class="percin" style="right:4px;bottom:4px"></div>
        <div class="ic">
            <img data-xslt-obj="obj-logo" alt="Logo" width="60" height="60" src="${at}"/>
            <div>${each(SUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div>`)}</div>
            <div class="baslik"><b>${t('EXPORT INVOICE')}</b><span>${t('e-İHRACAT FATURASI · ')}${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:InvoiceTypeCode')}</span></div>
            <div class="qr">${qr(76)}</div>
        </div>
    </div>
    <div class="kart">
        <div class="meta">
            <div><span class="k">${t('Fatura No')}</span><b>${v('$f/cbc:ID')}</b></div>
            <div><span class="k">${t('Tarih')}</span><b>${tarih}</b></div>
            <div><span class="k">${t('Teslim / Taşıma')}</span><b>${v(LX1.incoterm)}${t(' Genova · ')}${tasima(LX1.mode)}</b></div>
            <div><span class="k">${t('Kur')}</span><b>${kur}</b></div>
            <div><span class="k">${t('Sipariş')}</span><b>${v('$f/cac:OrderReference/cbc:ID')}</b></div>
            <div><span class="k">${t('Konşimento B/L')}</span><b>${v(`${doc('KONSIMENTO')}/cbc:ID`)}</b></div>
            <div><span class="k">${t('Sigorta poliçesi')}</span><b>${v(`${doc('SIGORTA')}/cbc:ID`)}</b></div>
            <div><span class="k">${t('ETTN')}</span><b style="font-family:Consolas,monospace;font-size:8px;font-weight:400">${v('$f/cbc:UUID')}</b></div>
        </div>
    </div>
    <div class="satir">
        <div class="kart"><div class="k">${t('Alıcı · Buyer')}</div>${each(BUY, `<div class="ad">${pName}</div>${pAddr()}<br/>${pContact()}${legal}`)}</div>
        <div class="kart" style="flex:.8"><div class="k">${t('Fatura muhatabı')}</div>${each(CUS, `<div class="ad" style="font-size:9.5px">${pName}</div>${pTax()}`)}</div>
    </div>
    <div class="kart">
        <div class="k">${t('Kumaş topları · Fabric rolls')}</div>
        ${each('$f/cac:InvoiceLine', `<div class="top">
            <div class="kartela">${attr('style', `background-color:${v(P('RENKKOD'))}`)}</div>
            <div class="bilgi">
                <div class="ad">${v('cac:Item/cbc:Name')}${t(' · ')}${v('cac:Item/cac:SellersItemIdentification/cbc:ID')}</div>
                <div class="en">${v('cac:Item/cbc:Description')}</div>
                <span class="cip">${v(P('AGIRLIK'))}</span><span class="cip">${t('En ')}${v(P('EN'))}</span><span class="cip">${v(P('KOMPOZISYON'))}</span><span class="cip">${v(P('YIKAMA'))}</span>
            </div>
            <div class="gt">${t('GTİP ')}<b>${gtip(LX.gtip)}</b><br/>${t('Top ')}${v(`${LX.pkg}/cbc:ID`)}<br/>${v(`${LX.pkg}/cbc:Quantity`)}${t(' ')}${kap(`${LX.pkg}/cbc:PackagingTypeCode`)}</div>
            <div class="tut">${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}${t(' × ')}${num('cac:Price/cbc:PriceAmount')}<b>${num('cbc:LineExtensionAmount')}${t(' ')}${v('$pb')}</b></div>
        </div>`)}
    </div>
    <div class="alt">
        <div class="sol">
            <div class="etiket">
                ${yalniz(`<b>${v('.')}</b><br/>`)}
                ${notes(`${t('— ')}${v('.')}<br/>`)}
            </div>
            <div class="etiket">
                <b>${t('Ödeme · Payment: ')}</b>${v('$f/cac:PaymentTerms/cbc:Note')}
                ${bank(`<br/>${v('cbc:PaymentNote')}<div class="ib">${iban('cbc:ID')}${t(' · ')}${v('cbc:CurrencyCode')}</div>`)}
            </div>
        </div>
        <div class="cep">
            <table>${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
            <div class="od"><span>${t('ÖDENECEK · TOTAL')}</span><b>${num(`${LMT}/cbc:PayableAmount`)}${t(' ')}${v('$pb')}</b><i>${t('≈ ')}${tlKarsilik()}${t(' TL')}</i></div>
        </div>
    </div>
</div>`,
});

/* ================================================================ 4. Deri ceket — Japonya (minimal, hanko mühür) */

const sultan = {
    web: 'https://www.sultanleather.com.tr',
    ids: [['VKN', '7820193465'], ['MERSISNO', '0782019346500016']],
    name: 'Sultan Deri Konfeksiyon Sanayi ve Dış Ticaret Ltd. Şti.',
    addr: adr('Kazlıçeşme Mah. Deri Sanayicileri Cad.', '41', 'Zeytinburnu', 'İstanbul', '34020'),
    vd: 'Zeytinburnu', tel: '+90 212 547 61 00', mail: 'export@sultanleather.com.tr',
};
const kawa = {
    ids: [['PARTYTYPE', 'EXPORT']],
    name: 'Kawa Select Co., Ltd.',
    addr: { street: 'Jingumae 4-chome', no: '12-10', district: 'Shibuya-ku', city: 'Tokyo', zip: '150-0001', cc: 'JP', country: 'Japonya' },
    legal: ['Kawa Select Co., Ltd.', '0110-01-084213'], tel: '+81 3 6812 4410', mail: 'buying@kawaselect.jp',
};
const x4 = {
    id: 'deri-ceket-ihracat-japonya',
    xml: invoice({
        comment: `Hazır şablon örneği: Deri giyim ihracatı, Japonya — IHRACAT · ISTISNA (301), USD, CIP Tokyo, havayolu (4), AWB ve sigorta belgeleri.
            Satırda GTİP, koli no / adet, DERI (deri cinsi), RENK ve ORAN (beden oranı) ek tanımları.`,
        profile: 'IHRACAT', type: 'ISTISNA', id: 'SLT2026000000208', date: '2026-10-07', time: '10:15:00', currency: 'USD', rate: 42.653,
        notes: ['Airport of departure: İstanbul (IST) — Airport of destination: Tokyo Narita (NRT) · Flight TK0050', 'Shipping marks: KAWA SELECT / TOKYO / C/No 1-38'],
        order: { id: 'KS-26-0917', date: '2026-08-12' },
        docs: [
            { id: '235-44182091', date: '2026-10-07', type: 'AWB', desc: 'Air waybill' },
            { id: 'NAK-26-JP-0208', date: '2026-10-07', type: 'SIGORTA', desc: 'Nakliyat sigortası (CIP)' },
        ],
        supplier: sultan, customer: gumruk, buyer: kawa, exemption: EXEMPT,
        payment: { code: '42', due: '2026-10-07', iban: 'TR560001001745398712505208', ibanCur: 'USD', bank: 'Ziraat Bankası — Zeytinburnu Şubesi · SWIFT TCZBTR2A' },
        terms: 'Peşin havale · T/T in advance (received)',
        lines: [
            { name: 'Kuzu nappa biker ceket', desc: 'Lamb nappa biker jacket', sid: 'SL-BK-01', unit: 'C62', qty: 120, price: 168, props: { DERI: 'Kuzu nappa 0,6 mm', RENK: 'Ceviz', ORAN: 'S2 · M3 · L1' }, exp: exp('CIP', '420310000000', 4, ['1-20', 20, 'CT']) },
            { name: 'Süet trençkot', desc: 'Goat suede trench coat', sid: 'SL-TC-03', unit: 'C62', qty: 48, price: 236, props: { DERI: 'Keçi süet', RENK: 'Kum', ORAN: 'S2 · M2 · L2' }, exp: exp('CIP', '420310000000', 4, ['21-28', 8, 'CT']) },
            { name: 'Bitkisel tabaklı deri yelek', desc: 'Vegetable-tanned leather vest', sid: 'SL-VS-02', unit: 'C62', qty: 60, price: 92, props: { DERI: 'Dana, bitkisel tabak', RENK: 'Konyak', ORAN: 'M1 · L1' }, exp: exp('CIP', '420310000000', 4, ['29-32', 4, 'CT']) },
            { name: 'Kaşmir astarlı deri eldiven', desc: 'Cashmere-lined leather gloves', sid: 'SL-GL-11', unit: 'PR', qty: 300, price: 18.5, props: { DERI: 'Kuzu nappa', RENK: 'Siyah', ORAN: '7 · 7,5 · 8' }, exp: exp('CIP', '420329000000', 4, ['33-35', 3, 'CT']) },
            { name: 'Pirinç tokalı deri kemer', desc: 'Full-grain belt, brass buckle', sid: 'SL-BT-05', unit: 'C62', qty: 240, price: 14.2, props: { DERI: 'Dana, tam damar', RENK: 'Kahve', ORAN: '85 · 90 · 95 · 100' }, exp: exp('CIP', '420330000000', 4, ['36-38', 3, 'CT']) },
        ],
    }),
};
const hanko = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="9" fill="#c8102e"/><rect x="9" y="9" width="46" height="46" rx="6" fill="none" stroke="#faf7f0" stroke-width="2"/><text x="32" y="30" text-anchor="middle" font-family="Yu Mincho, MS Mincho, serif" font-size="17" fill="#faf7f0">皮革</text><text x="32" y="48" text-anchor="middle" font-family="Georgia, serif" font-size="11" letter-spacing="2" fill="#faf7f0">SULTAN</text></svg>');
const enso = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M150 40 C190 80 180 160 110 175 C50 188 15 140 25 90 C33 50 75 22 120 28" fill="none" stroke="#1c1917" stroke-width="9" stroke-linecap="round" opacity=".14"/><path d="M118 26 C126 27 134 30 140 34" fill="none" stroke="#1c1917" stroke-width="5" stroke-linecap="round" opacity=".1"/></svg>');
x4.xslt = xslt({
    title: 'e-İhracat Faturası',
    comment: `Sultan Deri — Japonya'ya deri giyim ihracatı e-Faturası. Japon minimalizmi konsepti: washi kâğıdı tonu, dikey yazılmış
        başlık sütunu (輸出請求書), kırmızı hanko mühür, ince çizgiler ve geniş boşluklar, iki haneli büyük satır numaraları, enso
        fırça dairesi önünde ödenecek tutar; havayolu (AWB) ve CIP sigorta bilgisi.`,
    css: `
        body { background: #d6d3cb; font-family: 'Yu Gothic', 'Hiragino Sans', 'Segoe UI', sans-serif; font-size: 9.5px; color: #1c1917; }
        .sayfa { background: #faf7f0; background-image: radial-gradient(rgba(120,100,70,.05) 1px, transparent 1px); background-size: 7px 7px; display: flex; padding: 14mm 14mm 12mm 0; }
        .dikey { width: 30mm; display: flex; flex-direction: column; align-items: center; gap: 14px; border-right: 1px solid #1c1917; margin-right: 10mm; }
        .dikey h1 { writing-mode: vertical-rl; margin: 0; font-family: 'Yu Mincho', 'MS Mincho', 'Hiragino Mincho ProN', serif; font-weight: 500; font-size: 32px; letter-spacing: 14px; }
        .dikey .alt { writing-mode: vertical-rl; font-size: 9px; letter-spacing: 5px; color: #57534e; }
        .dikey .no { writing-mode: vertical-rl; font-family: Consolas, monospace; font-size: 10px; letter-spacing: 2px; margin-top: auto; }
        .govde { flex: 1; }
        .ust { display: flex; justify-content: space-between; align-items: flex-start; }
        .ust .unvan { font-size: 12.5px; font-weight: 600; letter-spacing: .5px; }
        .ust .adr { font-size: 8.5px; color: #57534e; line-height: 1.6; margin-top: 3px; }
        .ust .sag { display: flex; gap: 10px; align-items: flex-start; }
        .meta { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid #1c1917; border-bottom: 1px solid #1c1917; margin-top: 6mm; }
        .meta > div { padding: 6px 8px 6px 0; }
        .meta > div + div { border-left: 1px solid #d6d3cb; padding-left: 8px; }
        .jp { display: block; font-family: 'Yu Mincho', 'MS Mincho', serif; font-size: 9px; color: #c8102e; letter-spacing: 2px; }
        .k { font-size: 7.5px; letter-spacing: 1.5px; color: #78716c; text-transform: uppercase; }
        .meta b { display: block; font-weight: 600; font-size: 10.5px; margin-top: 2px; }
        .taraf { display: grid; grid-template-columns: 1.2fr 1fr; gap: 12mm; margin-top: 5mm; line-height: 1.6; }
        .taraf .ad { font-size: 13px; font-weight: 600; }
        .liste { margin-top: 4mm; }
        .kalem { display: flex; align-items: baseline; gap: 12px; padding: 6px 0; border-bottom: 1px solid #e7e2d6; }
        .kalem .no { font-family: 'Yu Mincho', 'MS Mincho', Georgia, serif; font-size: 24px; font-weight: 300; color: #a8a29e; width: 13mm; }
        .kalem .ad { flex: 1; }
        .kalem .ad b { font-size: 12px; font-weight: 600; }
        .kalem .ad i { font-style: normal; color: #78716c; margin-left: 6px; }
        .kalem .ad div { font-size: 8.5px; color: #57534e; margin-top: 3px; letter-spacing: .3px; }
        .kalem .ad span.r { display: inline-block; width: 7px; height: 7px; background: #c8102e; border-radius: 50%; margin: 0 4px 0 6px; }
        .kalem .mk { width: 30mm; text-align: right; color: #57534e; }
        .kalem .tt { width: 30mm; text-align: right; font-size: 13px; font-weight: 300; }
        .alt { display: flex; gap: 10mm; margin-top: 5mm; align-items: flex-start; }
        .alt .sol { flex: 1; line-height: 1.7; }
        .alt .sol .yalniz { font-size: 10.5px; border-left: 3px solid #c8102e; padding-left: 8px; margin-bottom: 6px; }
        .alt .sol .ib { font-family: Consolas, monospace; font-size: 10.5px; }
        .sag2 { width: 72mm; }
        .sag2 table { width: 100%; border-collapse: collapse; }
        .sag2 td { padding: 3px 0; border-bottom: 1px solid #e7e2d6; }
        .sag2 td.t { text-align: right; }
        .enso { position: relative; height: 46mm; display: flex; flex-direction: column; justify-content: center; align-items: center; background-repeat: no-repeat; background-position: center; background-size: 45mm 45mm; }
        .enso .v { font-family: 'Yu Mincho', 'MS Mincho', Georgia, serif; font-size: 27px; font-weight: 400; }
        .enso .tl { font-size: 8.5px; color: #78716c; }
        .enso img { position: absolute; right: 2mm; bottom: 4mm; transform: rotate(-8deg); opacity: .92; }`,
    body: `
<div class="sayfa">
    <div class="dikey">
        <h1>${t('輸出請求書')}</h1>
        <div class="alt">${t('e-İHRACAT FATURASI · EXPORT INVOICE')}</div>
        <div class="no">${v('$f/cbc:ID')}</div>
    </div>
    <div class="govde">
        <div class="ust">
            <div>
                ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#1c1917" stroke-width="1.2"/><path d="M22 20 L32 15 L42 20 L44 46 L20 46 Z" fill="none" stroke="#1c1917" stroke-width="1.6"/><path d="M32 15 V46 M27 18 L32 28 L37 18" fill="none" stroke="#1c1917" stroke-width="1.2"/></svg>', 46, 46)}
                ${each(SUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div>`)}
            </div>
            <div class="sag">${qr(80)}</div>
        </div>
        <div class="meta">
            <div><span class="jp">${t('発行日')}</span><span class="k">${t('Tarih')}</span><b>${tarih}</b></div>
            <div><span class="jp">${t('取引条件')}</span><span class="k">${t('Teslim · Taşıma')}</span><b>${v(LX1.incoterm)}${t(' Tokyo · ')}${tasima(LX1.mode)}</b></div>
            <div><span class="jp">${t('航空運送状')}</span><span class="k">${t('AWB')}</span><b>${v(`${doc('AWB')}/cbc:ID`)}</b></div>
            <div><span class="jp">${t('為替')}</span><span class="k">${t('Kur')}</span><b>${kur}</b></div>
        </div>
        <div class="taraf">
            <div><span class="jp">${t('買手')}</span><span class="k">${t('Alıcı · Buyer')}</span>${each(BUY, `<div class="ad">${pName}</div>${pAddr()}<br/>${pContact()}${legal}`)}</div>
            <div><span class="jp">${t('宛先')}</span><span class="k">${t('Fatura muhatabı')}</span>${each(CUS, `<div>${pName}</div>${pTax()}`)}<div style="margin-top:4px">${t('Sipariş ')}${v('$f/cac:OrderReference/cbc:ID')}${t(' · Sigorta ')}${v(`${doc('SIGORTA')}/cbc:ID`)}</div></div>
        </div>
        <div class="liste">
            ${each('$f/cac:InvoiceLine', `<div class="kalem">
                <div class="no">${v("format-number(cbc:ID,'00')")}</div>
                <div class="ad"><b>${v('cac:Item/cbc:Name')}</b><i>${v('cac:Item/cbc:Description')}</i>
                    <div>${v('cac:Item/cac:SellersItemIdentification/cbc:ID')}<span class="r"></span>${v(P('DERI'))}${t(' · ')}${v(P('RENK'))}${t(' · ')}${v(P('ORAN'))}<span class="r"></span>${t('GTİP ')}${gtip(LX.gtip)}<span class="r"></span>${kapLine}</div></div>
                <div class="mk">${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}${t(' × ')}${num('cac:Price/cbc:PriceAmount')}</div>
                <div class="tt">${num('cbc:LineExtensionAmount')}</div>
            </div>`)}
        </div>
        <div class="alt">
            <div class="sol">
                ${yalniz(`<div class="yalniz">${v('.')}</div>`)}
                ${notes(`<div>${v('.')}</div>`)}
                <div style="margin-top:6px"><span class="jp">${t('支払')}</span>${v('$f/cac:PaymentTerms/cbc:Note')}</div>
                ${bank(`<div>${v('cbc:PaymentNote')}</div><div class="ib">${iban('cbc:ID')}${t(' · ')}${v('cbc:CurrencyCode')}</div>`)}
                <div style="margin-top:6px;font-family:Consolas,monospace;font-size:8px;color:#78716c">${t('ETTN ')}${v('$f/cbc:UUID')}</div>
            </div>
            <div class="sag2">
                <table>${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
                <div class="enso" style="background-image:url(&quot;${enso}&quot;)">
                    <span class="jp">${t('合計')}</span><span class="k">${t('Ödenecek · Total')}</span>
                    <div class="v">${num(`${LMT}/cbc:PayableAmount`)}${t(' ')}${v('$pb')}</div>
                    <div class="tl">${t('≈ ')}${tlKarsilik()}${t(' TL')}</div>
                    <img alt="" width="54" height="54" src="${hanko}"/>
                </div>
            </div>
        </div>
    </div>
</div>`,
});

/* ================================================================ 5. Terlik / sandalet — BAE (konteyner manifestosu) */

const akdeniz = {
    web: 'https://www.akdenizterlik.com',
    ids: [['VKN', '0391827465'], ['MERSISNO', '0039182746500011']],
    name: 'Akdeniz Terlik ve Plastik Sanayi A.Ş.',
    addr: adr('Mersin-Tarsus OSB 3. Cad.', '27', 'Akdeniz', 'Mersin', '33140'),
    vd: 'Uray', tel: '+90 324 676 20 20', mail: 'export@akdenizterlik.com',
};
const gulf = {
    ids: [['PARTYTYPE', 'EXPORT']],
    name: 'Gulf Steps General Trading LLC',
    addr: { street: 'Al Ras, Old Souk Building', no: 'B-14', district: 'Deira', city: 'Dubai', cc: 'AE', country: 'Birleşik Arap Emirlikleri' },
    legal: ['Gulf Steps General Trading LLC', 'DED-1048213'], tel: '+971 4 226 1840', mail: 'purchase@gulfsteps.ae',
};
const x5 = {
    id: 'terlik-sandalet-konteyner-ihracat',
    xml: invoice({
        comment: `Hazır şablon örneği: Terlik ve sandalet ihracatı, Birleşik Arap Emirlikleri — IHRACAT · ISTISNA (301), USD, FCA Mersin, denizyolu (1).
            Konteyner (KONTEYNER) ve konşimento (KONSIMENTO) belge referansları; satırda GTİP, koli no / adet, KOLIICI (koli içi çift) ve RENK.`,
        profile: 'IHRACAT', type: 'ISTISNA', id: 'AKT2026000000561', date: '2026-10-06', time: '09:20:00', currency: 'USD', rate: 42.653,
        notes: ['Port of loading: Mersin (TRMER) — Port of discharge: Jebel Ali (AEJEA) · Vessel: MAERSK KOLKATA 641E', 'Shipping marks: GULF STEPS / JEBEL ALI / C/No 1-1180'],
        order: { id: 'GS-PO-26-1180', date: '2026-09-02' },
        docs: [
            { id: 'MSKU4826137', date: '2026-10-06', type: 'KONTEYNER', desc: '40\' HC · 45G1 · Mühür ML-TR2271845' },
            { id: 'MAEU264418805', date: '2026-10-06', type: 'KONSIMENTO', desc: 'Bill of Lading · MAERSK KOLKATA 641E' },
        ],
        supplier: akdeniz, customer: gumruk, buyer: gulf, exemption: EXEMPT,
        payment: { code: '42', due: '2026-10-30', iban: 'TR120001500158007309845561', ibanCur: 'USD', bank: 'Vakıfbank — Mersin Serbest Bölge Şubesi · SWIFT TVBATR2A' },
        terms: '%30 peşin, %70 konşimento kopyası karşılığı · 30% T/T advance, 70% against copy B/L',
        lines: [
            { name: 'EVA plaj terliği', desc: 'EVA flip-flops, unisex', sid: 'AK-FF-101', unit: 'PR', qty: 14400, price: 1.35, props: { KOLIICI: '36', RENK: '6 renk asorti' }, exp: exp('FCA', '640220000000', 1, ['1-400', 400, 'CT']) },
            { name: 'Kadın bantlı sandalet', desc: 'Women\'s PU strap sandals', sid: 'AK-SD-214', unit: 'PR', qty: 7200, price: 3.8, props: { KOLIICI: '24', RENK: 'Siyah · Taba · Beyaz' }, exp: exp('FCA', '640299980000', 1, ['401-700', 300, 'CT']) },
            { name: 'Peluş ev terliği', desc: 'Plush home slippers', sid: 'AK-HS-330', unit: 'PR', qty: 9600, price: 1.95, props: { KOLIICI: '32', RENK: 'Gri · Pudra · Lacivert' }, exp: exp('FCA', '640520990000', 1, ['701-1000', 300, 'CT']) },
            { name: 'Işıklı çocuk sandaleti', desc: 'Kids\' light-up sandals', sid: 'AK-KS-045', unit: 'PR', qty: 4320, price: 2.6, props: { KOLIICI: '24', RENK: 'Pembe · Mavi' }, exp: exp('FCA', '640299980000', 1, ['1001-1180', 180, 'CT']) },
        ],
    }),
};
const gemi = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><path d="M4 20 H60 L52 30 H12 Z" fill="#1f2937"/><rect x="14" y="12" width="9" height="8" fill="#c2410c"/><rect x="24" y="12" width="9" height="8" fill="#0369a1"/><rect x="34" y="12" width="9" height="8" fill="#15803d"/><rect x="19" y="5" width="9" height="7" fill="#ca8a04"/><rect x="29" y="5" width="9" height="7" fill="#c2410c"/><rect x="46" y="6" width="7" height="14" fill="#1f2937"/></svg>');
const KN = `${doc('KONTEYNER')}/cbc:ID`;
x5.xslt = xslt({
    title: 'e-İhracat Faturası',
    comment: `Akdeniz Terlik — BAE'ye terlik / sandalet ihracatı e-Faturası. Konteyner konsepti: oluklu çelik konteyner kapısı biçiminde
        başlık (şablon harfli konteyner no, ISO tip kodu, kapı kilit kolları, CSC levhası üzerinde ihracatçı), liman rotası, satır
        koli adetlerine göre oranlanmış konteyner yükleme planı, manifesto tablosu ve sarı mühür etiketi.`,
    css: `
        body { background: #1f2937; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #111827; }
        .sayfa { background: #e5e7eb; }
        .kapi { position: relative; height: 64mm; background: repeating-linear-gradient(90deg, #b45309 0 9px, #8f3d06 9px 11px, #c2570c 11px 20px, #9a4307 20px 22px); border-bottom: 6px solid #4b2105; color: #fff7ed; padding: 7mm 12mm; overflow: hidden; }
        .kapi:before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 3px; background: #4b2105; box-shadow: 1px 0 0 rgba(255,255,255,.15); }
        .kol { position: absolute; top: 0; bottom: 0; width: 7px; background: linear-gradient(90deg, #6b7280, #e5e7eb, #6b7280); }
        .kol:after { content: ''; position: absolute; left: -6px; top: 55%; width: 19px; height: 30px; border: 3px solid #d1d5db; border-radius: 3px; background: rgba(0,0,0,.15); }
        .stencil { font-family: Stencil, 'Stencil Std', Impact, 'Arial Black', sans-serif; letter-spacing: 3px; text-shadow: 0 0 1px rgba(0,0,0,.4); }
        .kapi .no { position: absolute; right: 14mm; top: 7mm; text-align: right; }
        .kapi .no b { display: block; font-size: 30px; }
        .kapi .no span { font-size: 15px; }
        .kapi .baslik { position: absolute; left: 14mm; top: 7mm; }
        .kapi .baslik b { display: block; font-size: 25px; }
        .kapi .baslik span { font-family: 'Segoe UI', sans-serif; font-size: 9px; letter-spacing: 3px; font-weight: 700; }
        .kapi .agirlik { position: absolute; right: 40mm; bottom: 7mm; text-align: right; font-size: 9.5px; line-height: 1.45; letter-spacing: 1.5px; }
        .csc { position: absolute; left: 14mm; bottom: 6mm; width: 84mm; background: linear-gradient(135deg, #d1d5db, #f3f4f6 45%, #9ca3af); color: #111827; border-radius: 3px; padding: 5px 9px; font-size: 8px; line-height: 1.45; box-shadow: 0 1px 3px rgba(0,0,0,.5); }
        .csc:before, .csc:after { content: ''; position: absolute; top: 4px; width: 5px; height: 5px; border-radius: 50%; background: #6b7280; }
        .csc:before { left: 4px; } .csc:after { right: 4px; }
        .csc b { font-size: 10px; }
        .csc .k { font-size: 6.5px; letter-spacing: 2px; font-weight: 800; color: #4b5563; }
        .kapi .qr { position: absolute; right: 14mm; bottom: 6mm; background: #ffffff; padding: 4px; border-radius: 2px; }
        .ic { padding: 7mm 12mm 9mm 12mm; }
        .rota { display: flex; align-items: center; gap: 10px; background: #111827; color: #f9fafb; border-radius: 4px; padding: 7px 12px; }
        .rota .liman { text-align: center; }
        .rota .liman b { display: block; font-size: 13px; letter-spacing: 1px; }
        .rota .liman span { font-size: 8px; color: #9ca3af; letter-spacing: 1.5px; }
        .rota .yol { flex: 1; text-align: center; position: relative; font-size: 8.5px; color: #fbbf24; }
        .rota .yol:before { content: ''; position: absolute; left: 0; right: 0; top: 50%; border-top: 2px dashed #4b5563; }
        .rota .yol img { position: relative; background: #111827; padding: 0 6px; }
        .rota .yol div { position: relative; }
        .bilgi { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-top: 8px; }
        .bilgi > div { background: #ffffff; border-top: 3px solid #c2410c; padding: 4px 7px; }
        .k { font-size: 7px; letter-spacing: 1.5px; color: #6b7280; font-weight: 800; text-transform: uppercase; }
        .bilgi b { display: block; font-size: 10px; }
        .taraf { display: flex; gap: 8px; margin-top: 8px; }
        .taraf > div { flex: 1; background: #ffffff; padding: 6px 9px; line-height: 1.5; }
        .taraf .ad { font-weight: 800; font-size: 11px; }
        .plan { margin-top: 10px; }
        .plan .bar { display: flex; height: 26px; border: 3px solid #374151; border-right-width: 8px; background: #374151; gap: 2px; }
        .plan .bar div { display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: 9px; white-space: nowrap; overflow: hidden; background-image: repeating-linear-gradient(90deg, rgba(255,255,255,.12) 0 1px, transparent 1px 8px); }
        .plan .bar div:nth-child(1) { background-color: #c2410c; }
        .plan .bar div:nth-child(2) { background-color: #0369a1; }
        .plan .bar div:nth-child(3) { background-color: #15803d; }
        .plan .bar div:nth-child(4) { background-color: #a16207; }
        .plan .bar div:nth-child(5) { background-color: #7e22ce; }
        .plan .ol { display: flex; justify-content: space-between; font-size: 7.5px; color: #6b7280; letter-spacing: 1px; margin-top: 2px; }
        table.mf { width: 100%; border-collapse: collapse; margin-top: 9px; background: #ffffff; font-size: 9.5px; }
        table.mf th { background: #374151; color: #f9fafb; text-align: left; padding: 4px 6px; font-size: 7.5px; letter-spacing: 1.2px; font-weight: 700; }
        table.mf td { padding: 5px 6px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        table.mf th.s, table.mf td.s { text-align: right; }
        table.mf td.m { font-family: Consolas, monospace; font-size: 9px; white-space: nowrap; }
        table.mf td small { display: block; color: #6b7280; }
        table.mf td .renk { display: inline-block; width: 9px; height: 9px; margin-right: 5px; vertical-align: middle; }
        table.mf tr:nth-child(2) .renk { background: #c2410c; } table.mf tr:nth-child(3) .renk { background: #0369a1; }
        table.mf tr:nth-child(4) .renk { background: #15803d; } table.mf tr:nth-child(5) .renk { background: #a16207; }
        table.mf tr:nth-child(6) .renk { background: #7e22ce; }
        table.mf tr.top td { background: #f3f4f6; font-weight: 800; border-top: 2px solid #374151; }
        .alt { display: flex; gap: 10px; margin-top: 10px; align-items: flex-start; }
        .alt .sol { flex: 1; font-size: 9px; line-height: 1.55; }
        .muhur { display: inline-flex; align-items: center; gap: 8px; background: #facc15; border-radius: 14px 4px 4px 14px; padding: 4px 12px 4px 4px; margin-bottom: 7px; box-shadow: 0 1px 2px rgba(0,0,0,.3); }
        .muhur:before { content: ''; width: 18px; height: 18px; border-radius: 50%; background: #1f2937; border: 3px solid #fde68a; }
        .muhur b { font-family: Consolas, monospace; font-size: 12px; letter-spacing: 1px; }
        .muhur span { font-size: 7px; letter-spacing: 1.5px; font-weight: 800; display: block; }
        .alt .sol ul { margin: 3px 0 6px 0; padding-left: 14px; }
        .alt .sol .ib { font-family: Consolas, monospace; font-size: 10.5px; font-weight: 700; }
        .alt .sol .yalniz { font-weight: 800; font-style: italic; }
        .toplam { width: 78mm; background: #ffffff; border: 3px solid #374151; }
        .toplam table { width: 100%; border-collapse: collapse; }
        .toplam td { padding: 3px 8px; border-bottom: 1px solid #e5e7eb; }
        .toplam td.t { text-align: right; font-weight: 700; }
        .toplam .od { background: #c2410c; color: #ffffff; padding: 7px 10px; display: flex; justify-content: space-between; align-items: center; }
        .toplam .od b { font-size: 19px; }
        .toplam .tl { font-size: 8.5px; color: #6b7280; padding: 3px 8px; text-align: right; }`,
    body: `
<div class="sayfa">
    <div class="kapi">
        <div class="kol" style="left:40%"></div><div class="kol" style="left:46%"></div><div class="kol" style="left:54%"></div><div class="kol" style="left:60%"></div>
        <div class="baslik stencil"><b>${t('EXPORT INVOICE')}</b><span>${t('e-İHRACAT FATURASI · ')}${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:InvoiceTypeCode')}</span></div>
        <div class="no stencil"><b>${v(`concat(substring(${KN},1,4),' ',substring(${KN},5,6),' ',substring(${KN},11,1))`)}</b><span>${t('45G1')}</span></div>
        <div class="agirlik stencil">${t('MAX GROSS 32.500 KG')}<br/>${t('TARE 3.900 KG')}<br/>${t('CU.CAP. 76,3 M³')}</div>
        <div class="csc">
            <div class="k">${t('CSC SAFETY APPROVAL · İHRACATÇI / EXPORTER')}</div>
            ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="6" fill="#c2410c"/><path d="M14 40 Q14 22 32 20 Q50 22 50 40 Q50 46 44 46 H20 Q14 46 14 40 Z" fill="#fff7ed"/><path d="M24 30 Q32 24 40 30" stroke="#c2410c" stroke-width="3" fill="none"/></svg>', 30, 30, ' style="float:left;margin:2px 7px 0 0"')}
            ${each(SUP, `<b>${pName}</b><br/>${pAddr()}<br/>${pTax()}`)}
        </div>
        <div class="qr">${qr(72)}</div>
    </div>
    <div class="ic">
        <div class="rota">
            <div class="liman">${each(SUP, `<b>${v("translate(cac:PostalAddress/cbc:CityName,'abcçdefgğhıijklmnoöprsştuüvyz','ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ')")}</b>`)}<span>${t('TRMER · YÜKLEME')}</span></div>
            <div class="yol"><img alt="" width="64" height="32" src="${gemi}"/><div>${v(`${doc('KONSIMENTO')}/cbc:DocumentDescription`)}</div></div>
            <div class="liman"><b>${t('JEBEL ALI')}</b><span>${t('AEJEA · ')}${v(`translate(${BUY}/cac:PostalAddress/cbc:CityName,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')`)}</span></div>
        </div>
        <div class="bilgi">
            <div><span class="k">${t('Fatura No')}</span><b>${v('$f/cbc:ID')}</b></div>
            <div><span class="k">${t('Tarih')}</span><b>${tarih}</b></div>
            <div><span class="k">${t('Teslim · Taşıma')}</span><b>${v(LX1.incoterm)}${t(' Mersin · ')}${tasima(LX1.mode)}</b></div>
            <div><span class="k">${t('Konşimento')}</span><b>${v(`${doc('KONSIMENTO')}/cbc:ID`)}</b></div>
            <div><span class="k">${t('Kur')}</span><b>${kur}</b></div>
        </div>
        <div class="taraf">
            <div><span class="k">${t('Alıcı · Consignee')}</span>${each(BUY, `<div class="ad">${pName}</div>${pAddr()}<br/>${pContact()}${legal}`)}</div>
            <div><span class="k">${t('Fatura muhatabı')}</span>${each(CUS, `<div class="ad" style="font-size:9.5px">${pName}</div>${pTax()}`)}<br/>${t('Sipariş ')}${v('$f/cac:OrderReference/cbc:ID')}</div>
        </div>
        <div class="plan">
            <span class="k">${t('Yükleme planı · Load plan (koli oranına göre)')}</span>
            <div class="bar">${each('$f/cac:InvoiceLine', `<div>${attr('style', `width:${v(`${LX.pkg}/cbc:Quantity * 100 div sum($f/cac:InvoiceLine/${LX.pkg}/cbc:Quantity)`)}%`)}${v('cbc:ID')}${t(' · ')}${v(`${LX.pkg}/cbc:Quantity`)}${t(' ctn')}</div>`)}</div>
            <div class="ol"><span>${t('◀ BURUN / NOSE')}</span><span>${t('KAPI / DOOR ▶')}</span></div>
        </div>
        <table class="mf">
            <tr><th>${t('C/NO')}</th><th>${t('GTİP')}</th><th>${t('ÜRÜN / DESCRIPTION')}</th><th class="s">${t('KOLİ')}</th><th class="s">${t('ÇİFT/KOLİ')}</th><th class="s">${t('MİKTAR')}</th><th class="s">${t('FİYAT')}</th><th class="s">${t('TUTAR')}</th></tr>
            ${each('$f/cac:InvoiceLine', `<tr>
                <td class="m"><span class="renk"></span>${v(`${LX.pkg}/cbc:ID`)}</td>
                <td class="m">${gtip(LX.gtip)}</td>
                <td><b>${v('cac:Item/cbc:Name')}</b><small>${v('cac:Item/cbc:Description')}${t(' · ')}${v('cac:Item/cac:SellersItemIdentification/cbc:ID')}${t(' · ')}${v(P('RENK'))}</small></td>
                <td class="s">${int(`${LX.pkg}/cbc:Quantity`)}</td>
                <td class="s">${v(P('KOLIICI'))}</td>
                <td class="s">${int('cbc:InvoicedQuantity')}${t(' ')}${unit('cbc:InvoicedQuantity/@unitCode')}</td>
                <td class="s">${num('cac:Price/cbc:PriceAmount')}</td>
                <td class="s"><b>${num('cbc:LineExtensionAmount')}</b></td>
            </tr>`)}
            <tr class="top"><td colspan="3">${t('TOPLAM / TOTAL')}</td><td class="s">${int(`sum($f/cac:InvoiceLine/${LX.pkg}/cbc:Quantity)`)}</td><td></td><td class="s">${int('sum($f/cac:InvoiceLine/cbc:InvoicedQuantity)')}${t(' çift')}</td><td></td><td class="s">${num(`${LMT}/cbc:LineExtensionAmount`)}</td></tr>
        </table>
        <div class="alt">
            <div class="sol">
                <div class="muhur"><div><span>${t('KONTEYNER MÜHÜRÜ · SEAL')}</span><b>${v(`substring-after(${doc('KONTEYNER')}/cbc:DocumentDescription,'Mühür ')`)}</b></div></div>
                ${yalniz(`<div class="yalniz">${v('.')}</div>`)}
                <ul>${notes(`<li>${v('.')}</li>`)}</ul>
                <b>${t('Ödeme: ')}</b>${v('$f/cac:PaymentTerms/cbc:Note')}
                ${bank(`<br/>${v('cbc:PaymentNote')}<div class="ib">${iban('cbc:ID')}${t(' · ')}${v('cbc:CurrencyCode')}</div>`)}
                <div style="font-family:Consolas,monospace;font-size:8px;color:#6b7280;margin-top:4px">${t('ETTN ')}${v('$f/cbc:UUID')}</div>
            </div>
            <div class="toplam">
                <table>${totals((l, val, c) => `<tr class="${c}"><td>${l}</td><td class="t">${val}</td></tr>`)}</table>
                <div class="od"><span class="stencil">${t('TOTAL')}</span><b>${num(`${LMT}/cbc:PayableAmount`)}${t(' ')}${v('$pb')}</b></div>
                <div class="tl">${t('TL karşılığı ')}${tlKarsilik()}${t(' TL')}</div>
            </div>
        </div>
    </div>
</div>`,
});

export default [x1, x2, x3, x4, x5];
