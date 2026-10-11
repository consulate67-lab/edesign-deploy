// e-Dekont tasarımları (DEKONT / VTA / GVTA profilleri).
import { dt, each, iff, logo, num, qr, t, v, yaziyla } from '../moda/lib.mjs';
import { creditNote, r2 } from './xml.mjs';
import { BUY, CUS, DK, LMT, SUP, cnXslt, cm, meta, notes, partyBlock, pid, profilAd, refs, tarihSaat, yalniz } from './kit.mjs';

/**
 * Ödeme / elektronik para kuruluşu biçimi (İŞLEM TUTARI … AÇIKLAMA satırları) veya bankaların serbest
 * satırları (lines). Komisyon BSMV'si %5.
 */
const dekont = (d) => {
    let lines;
    let taxes;
    let lmt;
    let pay;
    if (d.lines) {
        const sum = r2(d.lines.filter((l) => l.price !== undefined).reduce((a, l) => a + l.price, 0));
        const tax = d.tax ? r2(d.tax.base * d.tax.pct / 100) : 0;
        pay = r2(sum + tax);
        lines = d.lines.map((l) => ({ ...l, cur: 'TRY' }));
        taxes = [{ name: 'BSMV', code: '0021', pct: d.tax?.pct ?? 0, base: d.tax?.base ?? 0, amount: tax, cur: 'TRY' }];
        lmt = [['LineExtensionAmount', sum, 'TRY'], ['TaxExclusiveAmount', sum, 'TRY'], ['TaxInclusiveAmount', pay, 'TRY'], ['PayableAmount', pay, 'TRY']];
    } else {
        const bsmv = r2(d.fee * 0.05);
        pay = r2(d.amount + d.fee + bsmv);
        const L = (name, price, desc) => ({ name, price, desc, cur: 'TRY' });
        lines = [L('İŞLEM TUTARI', d.amount), L('KOMİSYON TUTARI', d.fee), L('TOPLAM TUTAR', pay), L('ÖDENECEK TUTAR', pay),
            L('İŞLEM TİPİ', undefined, d.tip), L('AÇIKLAMA', undefined, d.aciklama)];
        taxes = [{ name: 'BSMV', code: '0021', pct: 5, base: d.fee, amount: bsmv, cur: 'TRY' }];
        lmt = [['LineExtensionAmount', d.amount, 'TRY'], ['TaxExclusiveAmount', r2(d.amount + d.fee), 'TRY'], ['TaxInclusiveAmount', pay, 'TRY'], ['PayableAmount', pay, 'TRY']];
    }
    return creditNote({
        ...d, profile: d.profile ?? 'DEKONT', currency: 'TRY',
        notes: [yaziyla(pay, 'TRY'), ...(d.notes ?? [])],
        lines, taxes, lmt,
    });
};

const addr = (street, no, district, city, zip) => ({ street, no, district, city, zip });
const TEBLIG = 'Bu dekont 509 Sıra No\'lu VUK Genel Tebliği kapsamında elektronik ortamda düzenlenmiş olup ıslak imza gerektirmez.';

const SVG = {
    lodos: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 44"><path d="M6 30 Q22 6 40 22 T74 16" fill="none" stroke="#5ad1ff" stroke-width="5" stroke-linecap="round"/><path d="M6 38 Q24 20 42 32 T76 28" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/><text x="82" y="29" font-family="Segoe UI,Arial" font-weight="800" font-size="19" fill="#fff">LODOS</text><text x="83" y="40" font-family="Segoe UI,Arial" font-size="8.5" letter-spacing="2.4" fill="#9fdcff">BANKASI</text></svg>`,
    kardelen: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 44"><g transform="translate(22 22)" stroke="#166534" stroke-width="3" stroke-linecap="round"><path d="M0-16V16M-14-8L14 8M-14 8L14-8"/><circle r="4" fill="#22c55e" stroke="none"/></g><text x="46" y="27" font-family="Georgia,serif" font-weight="700" font-size="19" fill="#14532d">Kardelen</text><text x="47" y="39" font-family="Segoe UI,Arial" font-size="8.5" letter-spacing="3" fill="#15803d">BANK</text></svg>`,
    toroslar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 172 44"><path d="M4 38 L22 10 L32 24 L40 14 L58 38 Z" fill="#7f1d1d"/><path d="M22 10 L27 18 L18 18 Z" fill="#fff"/><text x="64" y="26" font-family="Georgia,serif" font-weight="700" font-size="16" fill="#7f1d1d">TOROSLAR</text><text x="65" y="38" font-family="Segoe UI,Arial" font-size="8" letter-spacing="3.2" fill="#991b1b">BANKASI</text></svg>`,
    meltem: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 44"><rect x="2" y="6" width="34" height="32" rx="7" fill="#d9f99d"/><path d="M8 28h22M8 22h16M8 16h22" stroke="#14532d" stroke-width="3" stroke-linecap="round"/><text x="44" y="27" font-family="Segoe UI,Arial" font-weight="800" font-size="18" fill="#ecfccb">MELTEM</text><text x="45" y="38" font-family="Segoe UI,Arial" font-size="8" letter-spacing="2.6" fill="#bef264">BANKASI A.Ş.</text></svg>`,
    marti: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 40"><path d="M4 20 Q12 10 20 18 Q28 10 36 20 Q28 15 20 23 Q12 15 4 20 Z" fill="#fff"/><text x="44" y="24" font-family="Segoe UI,Arial" font-weight="800" font-size="16" fill="#fff">martı</text><text x="45" y="34" font-family="Segoe UI,Arial" font-size="7.5" letter-spacing="3" fill="#e9d5ff">CÜZDAN</text></svg>`,
    papatya: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 40"><g transform="translate(20 20)" fill="#111"><circle r="5" fill="#111"/><ellipse rx="4" ry="11" transform="rotate(0) translate(0 -11)" fill="none" stroke="#111" stroke-width="2"/><ellipse rx="4" ry="11" transform="rotate(72) translate(0 -11)" fill="none" stroke="#111" stroke-width="2"/><ellipse rx="4" ry="11" transform="rotate(144) translate(0 -11)" fill="none" stroke="#111" stroke-width="2"/><ellipse rx="4" ry="11" transform="rotate(216) translate(0 -11)" fill="none" stroke="#111" stroke-width="2"/><ellipse rx="4" ry="11" transform="rotate(288) translate(0 -11)" fill="none" stroke="#111" stroke-width="2"/></g><text x="42" y="25" font-family="Consolas,monospace" font-weight="700" font-size="16" fill="#111">papatya</text><text x="43" y="35" font-family="Consolas,monospace" font-size="7.5" fill="#111">ÖDEME HİZMETLERİ</text></svg>`,
};

const kalemRow = (a, b, c) => `<tr><td class="k-ad">${a}${iff('cac:Item/cbc:Description', `<span class="k-ac">${b}</span>`)}</td><td class="k-tt">${c}</td></tr>`;
const taxRow = (a, b, c) => `<tr><td class="k-ad">${a}${b}</td><td class="k-tt">${c}</td></tr>`;
/** DK.tutarlar ile hem satır hem vergi satırı aynı row'u kullanır; vergi bağlamında Item olmadığından açıklama boş kalır. */
const tutarRow = (a, b, c) => (b ? kalemRow(a, b, c) : taxRow(a, b, c));

/* ------------------------------------------------------------- 1. Kurumsal EFT */

const eft = {
    id: 'banka-eft-dekont',
    sector: 'finans',
    accent: '#0b3d91',
    name: 'Kurumsal EFT e-Dekontu',
    description: 'Bankanın ticari müşterisi adına gönderdiği EFT için e-Dekont: lacivert banka başlığı, gönderen → alıcı hesap kartları, işlem referansı ve kanal bilgisi, komisyon + BSMV dökümü ve hesaptan çekilen toplam.',
    tags: ['EFT', 'Kurumsal', 'Gönderen → alıcı', 'BSMV', 'İşlem referansı'],
    xml: dekont({
        comment: 'Hazır şablon örneği: Kurumsal EFT e-Dekontu — DEKONT · EFT (ticari müşteri tedarikçisine fatura ödemesi).',
        type: 'EFT', id: 'LDS2026000184273', date: '2026-10-09', time: '10:42:16',
        refs: [
            { id: 'LDS20261009EFT0418273', scheme: 'ISLEMREFNO', type: 'ISLEMREFERANSNO', desc: 'ISLEMREFERANSNO' },
            { id: 'KURUMSAL İNTERNET ŞUBESİ', scheme: 'ISLEMKANALI', type: 'ISLEMKANALI', desc: 'ISLEMKANALI' },
        ],
        supplier: {
            web: 'https://www.lodosbank.com.tr', name: 'Lodos Bankası A.Ş.',
            ids: [['VKN', '6080412395'], ['MERSISNO', '0608041239500017'], ['SUBEKODU', '1047'], ['SUBEADI', 'Bornova Ticari Şubesi']],
            addr: addr('Ankara Caddesi', '81', 'Bornova', 'İzmir', '35030'), vd: 'Bornova', tel: '0850 222 56 37', mail: 'ticari@lodosbank.com.tr',
        },
        customer: {
            name: 'Ege Örme Tekstil San. ve Tic. Ltd. Şti.',
            ids: [['VKN', '3290571846'], ['MUSTERINO', '70412236'], ['IBAN', 'TR410009900001047000082317']],
            addr: addr('Kemalpaşa OSB 12. Sokak', '7', 'Kemalpaşa', 'İzmir', '35730'), vd: 'Kemalpaşa', tel: '(232) 877 41 20',
        },
        buyer: {
            name: 'Bergama İplik Sanayi A.Ş.',
            ids: [['VKN', '1520943768'], ['IBAN', 'TR930006200041200006298754']],
            addr: addr('Organize Sanayi Bölgesi 3. Cadde', '14', 'Bergama', 'İzmir', '35700'), vd: 'Bergama',
        },
        settle: ['2026-10-09', '10:42:15', '2026-10-09', '10:42:16'],
        amount: 146850, fee: 18,
        tip: 'GİDEN EFT', aciklama: 'FTR2026000009127 NOLU FATURA ÖDEMESİ - EYLÜL İPLİK ALIMI',
        notes: ['EFT işlemi TCMB EFT sistemi üzerinden alıcı bankaya iletilmiştir.', 'Lodos Bankası A.Ş. · Ticaret Sicil No: 104523', TEBLIG],
    }),
    xslt: cnXslt({
        title: 'e-Dekont',
        comment: 'Kurumsal EFT e-Dekontu (DEKONT · EFT): lacivert banka başlığı, gönderen → alıcı kartları, komisyon/BSMV dökümü.',
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5pt; color: #1e293b; background: #fff; }
            .bas { background: linear-gradient(120deg, #072a66, #0b3d91 60%, #1557c0); color: #fff; padding: 9mm 14mm 8mm; display: flex; align-items: center; gap: 8mm; }
            .bas .ad { flex: 1; } .bas .ad b { display: block; font-size: 13pt; } .bas .ad span { font-size: 8.5pt; color: #bfdbfe; }
            .bas .tur { text-align: right; } .bas .tur b { display: block; font-size: 17pt; letter-spacing: .5px; } .bas .tur span { display: inline-block; margin-top: 1.5mm; background: #5ad1ff; color: #072a66; font-weight: 700; padding: .8mm 3mm; border-radius: 3mm; font-size: 8.5pt; }
            .serit { height: 2mm; background: repeating-linear-gradient(90deg, #5ad1ff 0 12mm, #1557c0 12mm 24mm); }
            .ic { padding: 8mm 14mm 0; }
            .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm 6mm; padding-bottom: 6mm; border-bottom: 1px solid #e2e8f0; }
            .meta div i { display: block; font-style: normal; font-size: 7.5pt; color: #64748b; text-transform: uppercase; letter-spacing: .6px; }
            .meta div b { font-size: 9.5pt; word-break: break-all; }
            .taraf { display: grid; grid-template-columns: 1fr 12mm 1fr; align-items: stretch; margin: 7mm 0; }
            .kart { border: 1px solid #cbd5e1; border-radius: 3mm; padding: 4.5mm 5mm; }
            .kart h3 { margin: 0 0 2mm; font-size: 8pt; color: #0b3d91; text-transform: uppercase; letter-spacing: 1px; }
            .ok { display: flex; align-items: center; justify-content: center; font-size: 20pt; color: #1557c0; }
            .p-ad { font-weight: 700; font-size: 10.5pt; margin-bottom: 1mm; } .p-adr, .p-vk, .p-il { color: #475569; font-size: 8.5pt; }
            .p-ek { margin-top: 2mm; display: grid; gap: .8mm; font-size: 8.5pt; } .p-ek i { font-style: normal; color: #64748b; display: inline-block; min-width: 26mm; }
            .tutar { display: grid; grid-template-columns: 1.3fr 1fr; gap: 8mm; align-items: start; }
            table.kalem { width: 100%; border-collapse: collapse; }
            table.kalem td { padding: 2.6mm 0; border-bottom: 1px dashed #cbd5e1; }
            .k-tt { text-align: right; font-weight: 600; white-space: nowrap; } .k-ac { display: block; color: #64748b; font-size: 8pt; }
            .ode { background: #eff6ff; border-left: 2mm solid #0b3d91; padding: 5mm; border-radius: 0 3mm 3mm 0; }
            .ode span { font-size: 8pt; color: #475569; text-transform: uppercase; letter-spacing: .6px; } .ode b { display: block; font-size: 19pt; color: #0b3d91; margin: 1mm 0 2mm; }
            .ode small { font-size: 8pt; color: #334155; font-style: italic; }
            .acik { margin-top: 7mm; background: #f8fafc; border-radius: 3mm; padding: 4mm 5mm; }
            .acik h4 { margin: 0 0 1.5mm; font-size: 8pt; color: #0b3d91; text-transform: uppercase; letter-spacing: 1px; }
            .alt { display: flex; gap: 8mm; align-items: flex-end; margin: 9mm 14mm 0; padding-top: 5mm; border-top: 1px solid #e2e8f0; }
            .alt ul { flex: 1; margin: 0; padding-left: 4mm; color: #64748b; font-size: 7.8pt; line-height: 1.6; }
            .kase { position: absolute; right: 18mm; top: 166mm; width: 28mm; height: 28mm; border: 1.2mm double #1557c0; border-radius: 50%; color: #1557c0; opacity: .5; transform: rotate(-14deg); display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 800; font-size: 9pt; text-align: center; line-height: 1.2; }
        `,
        body: `<div class="sayfa">
    <div class="bas">${logo(SVG.lodos, 150, 44)}<div class="ad">${each(SUP, `<b>${v('cac:PartyName/cbc:Name')}</b><span>${v("cac:PartyIdentification/cbc:ID[@schemeID='SUBEADI']")}${t(' · Şube Kodu ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='SUBEKODU']")}</span>`)}</div>
        <div class="tur"><b>${profilAd()}</b><span>${DK.islemTipi}</span></div></div>
    <div class="serit"></div>
    <div class="ic">
        <div class="meta">${meta((a, b) => `<div><i>${a}</i><b>${b}</b></div>`)}${refs((a, b) => `<div><i>${a}</i><b>${b}</b></div>`)}<div><i>${t('İşlem Zamanı')}</i><b>${DK.islemZamani}</b></div></div>
        <div class="taraf"><div class="kart"><h3>${t('Gönderen (Hesap Sahibi)')}</h3>${partyBlock(CUS, { contact: false })}</div><div class="ok">➜</div>
            <div class="kart"><h3>${t('Alıcı')}</h3>${partyBlock(BUY, { contact: false })}</div></div>
        <div class="tutar"><table class="kalem">${DK.tutarlar(tutarRow)}</table>
            <div class="ode"><span>${t('Hesabınızdan çekilen toplam')}</span><b>${DK.odenecek}</b>${yalniz(`<small>${v('.')}</small>`)}</div></div>
        <div class="acik"><h4>${t('Açıklama')}</h4>${DK.aciklama}</div>
    </div>
    <div class="alt"><ul>${notes(`<li>${v('.')}</li>`)}</ul>${qr(88)}</div>
    <div class="kase"><span>${t('e-DEKONT')}</span><span style="font-size:7pt">${dt('$f/cbc:IssueDate')}</span></div>
</div>`,
    }),
};

/* ------------------------------------------------------------- 2. Kredi taksit tahsilatı */

const TAKSIT = "$f/cac:CreditNoteLine[cac:Item/cbc:Name='Taksit No']/cac:Item/cbc:Description";
const kredi = {
    id: 'kredi-taksit-tahsilat-dekont',
    sector: 'finans',
    accent: '#15803d',
    name: 'Kredi Taksit Tahsilat e-Dekontu',
    description: 'Bankanın gişede nakit tahsil ettiği ihtiyaç kredisi taksiti için e-Dekont (NKT): taksit ilerleme çubuğu, anapara / faiz / KKDF / BSMV ayrıştırması, kalan anapara ve kredi bilgileri kartı.',
    tags: ['NKT', 'Kredi taksiti', 'Anapara / faiz', 'KKDF', 'İlerleme çubuğu'],
    xml: dekont({
        comment: 'Hazır şablon örneği: Kredi Taksit Tahsilat e-Dekontu — DEKONT · NKT (gişede nakit taksit ödemesi, banka serbest satır biçimi).',
        type: 'NKT', id: 'KRD2026000072915', date: '2026-10-08', time: '11:15:02',
        refs: [{ id: 'KRD20261008NKT0072915', scheme: 'ISLEMREFNO', type: 'ISLEMREFERANSNO', desc: 'ISLEMREFERANSNO' }, { id: 'GİŞE', scheme: 'ISLEMKANALI', type: 'ISLEMKANALI', desc: 'ISLEMKANALI' }],
        supplier: {
            web: 'https://www.kardelenbank.com.tr', name: 'Kardelen Bank A.Ş.',
            ids: [['VKN', '5170283946'], ['MERSISNO', '0517028394600011'], ['SUBEKODU', '0382'], ['SUBEADI', 'Kayseri Talas Şubesi']],
            addr: addr('Talas Bulvarı', '146', 'Talas', 'Kayseri', '38280'), vd: 'Erciyes', tel: '0850 455 38 38',
        },
        customer: {
            person: ['Hüseyin', 'KARACA'], ids: [['TCKN', '41207635918'], ['MUSTERINO', '18820457']],
            addr: addr('Mevlana Mahallesi Kirazlı Sokak', '23/5', 'Talas', 'Kayseri', '38280'), tel: '(535) 612 44 09',
        },
        settle: ['2026-10-08', '11:15:02', '2026-10-08', '11:15:02'],
        lines: [
            { name: 'Kredi No', desc: 'TK-2026-0047812 · 24 ay vadeli ihtiyaç kredisi' },
            { name: 'Taksit No', desc: '7 / 24' },
            { name: 'Anapara', price: 8412.30 },
            { name: 'Faiz Tutarı', desc: 'Aylık %3,19', price: 2145.60 },
            { name: 'KKDF', desc: 'Faizin %15\'i', price: 321.84 },
            { name: 'Kalan Anapara', desc: '139.284,55 TL' },
            { name: 'Sonraki Taksit', desc: '08.11.2026 · 10.987,02 TL' },
            { name: 'AÇIKLAMA', desc: 'EKİM 2026 KREDİ TAKSİT TAHSİLATI - NAKİT' },
        ],
        tax: { base: 2145.60, pct: 5 },
        notes: ['Taksit tutarı gişede nakit olarak tahsil edilmiştir.', TEBLIG],
    }),
    xslt: cnXslt({
        title: 'e-Dekont',
        comment: 'Kredi Taksit Tahsilat e-Dekontu (DEKONT · NKT): taksit ilerleme çubuğu, anapara/faiz/KKDF/BSMV ayrıştırması.',
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5pt; color: #14261a; background: #fbfdf9; padding: 12mm 14mm; }
            .ust { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #15803d; padding-bottom: 4mm; }
            .ust .sag { text-align: right; } .ust .sag b { display: block; font-size: 16pt; color: #14532d; } .ust .sag span { color: #4d7c0f; font-size: 8.5pt; }
            .sube { margin-top: 3mm; font-size: 8.5pt; color: #3f5f46; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 7mm; }
            .kutu { background: #fff; border: 1px solid #d9e8d5; border-radius: 4mm; padding: 5mm; }
            .kutu h3 { margin: 0 0 3mm; font-size: 8pt; text-transform: uppercase; letter-spacing: 1.2px; color: #15803d; }
            .p-ad { font-weight: 700; font-size: 11pt; } .p-adr, .p-vk, .p-il, .p-ek { font-size: 8.5pt; color: #4b5d4f; margin-top: .8mm; } .p-ek span { margin-right: 4mm; } .p-ek i { font-style: normal; color: #15803d; }
            .ilerle { margin-top: 7mm; background: #fff; border: 1px solid #d9e8d5; border-radius: 4mm; padding: 5mm 6mm; }
            .ilerle .ust2 { display: flex; justify-content: space-between; font-size: 9pt; } .ilerle .ust2 b { font-size: 13pt; color: #14532d; }
            .bar { margin-top: 3mm; height: 5mm; background: repeating-linear-gradient(90deg, #ecfccb 0 calc(100%/24 - 1px), #fff calc(100%/24 - 1px) calc(100%/24)); border-radius: 2.5mm; overflow: hidden; border: 1px solid #bbf7d0; }
            .bar div { height: 100%; background: linear-gradient(90deg, #16a34a, #84cc16); }
            .bilgi { margin-top: 4mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
            .bilgi div { font-size: 8.5pt; } .bilgi i { display: block; font-style: normal; color: #6b8a6f; font-size: 7.5pt; text-transform: uppercase; letter-spacing: .5px; }
            table.kalem { width: 100%; border-collapse: collapse; margin-top: 7mm; }
            table.kalem th { text-align: left; font-size: 7.8pt; text-transform: uppercase; letter-spacing: 1px; color: #15803d; border-bottom: 2px solid #15803d; padding: 2mm 0; }
            table.kalem td { padding: 2.8mm 0; border-bottom: 1px solid #e3eee0; } .k-tt { text-align: right; font-weight: 600; } .k-ac { color: #6b8a6f; font-size: 8pt; margin-left: 2mm; }
            .toplam { display: flex; justify-content: space-between; align-items: center; margin-top: 5mm; background: #14532d; color: #fff; border-radius: 4mm; padding: 5mm 6mm; }
            .toplam b { font-size: 18pt; } .toplam small { display: block; font-size: 8pt; color: #bbf7d0; margin-top: 1mm; }
            .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5mm 6mm; font-size: 8.5pt; } .meta i { font-style: normal; color: #6b8a6f; display: inline-block; min-width: 34mm; }
            .alt { display: flex; gap: 8mm; margin-top: 8mm; align-items: flex-end; } .alt ul { flex: 1; margin: 0; padding-left: 4mm; font-size: 7.8pt; color: #4b5d4f; line-height: 1.6; }
        `,
        body: `<div class="sayfa">
    <div class="ust">${logo(SVG.kardelen, 160, 44)}<div class="sag"><b>${t('Kredi Taksit Tahsilatı')}</b><span>${profilAd()}${t(' · ')}${DK.islemTipi}</span></div></div>
    <div class="sube">${each(SUP, `${v('cac:PartyName/cbc:Name')}${t(' · ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='SUBEADI']")}${t(' (')}${v("cac:PartyIdentification/cbc:ID[@schemeID='SUBEKODU']")}${t(') · VKN ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='VKN']")}${t(' · ')}${v('cac:Contact/cbc:Telephone')}`)}</div>
    <div class="grid"><div class="kutu"><h3>${t('Kredi Müşterisi')}</h3>${partyBlock(CUS)}</div>
        <div class="kutu"><h3>${t('Dekont Bilgileri')}</h3><div class="meta">${meta((a, b) => `<div><i>${a}</i>${b}</div>`)}${refs((a, b) => `<div><i>${a}</i>${b}</div>`)}</div></div></div>
    <div class="ilerle"><div class="ust2"><span>${t('Ödenen taksit')}</span><b>${v(TAKSIT)}</b></div>
        <div class="bar"><div><xsl:attribute name="style">width:<xsl:value-of select="round(number(substring-before(${TAKSIT},' /')) div number(substring-after(${TAKSIT},'/ ')) * 100)"/>%</xsl:attribute></div></div>
        <div class="bilgi">${each("$f/cac:CreditNoteLine[not(cac:Price)][not(cac:Item/cbc:Name='Taksit No' or cac:Item/cbc:Name='AÇIKLAMA')]", `<div><i>${v('cac:Item/cbc:Name')}</i>${v('cac:Item/cbc:Description')}</div>`)}</div></div>
    <table class="kalem"><tr><th>${t('Taksit Bileşeni')}</th><th style="text-align:right">${t('Tutar')}</th></tr>${DK.tutarlar(tutarRow)}</table>
    <div class="toplam"><div>${t('Tahsil edilen taksit tutarı')}${yalniz(`<small>${v('.')}</small>`)}</div><b>${DK.odenecek}</b></div>
    <div class="alt"><ul><li>${DK.aciklama}</li>${notes(`<li>${v('.')}</li>`)}</ul>${qr(84)}</div>
</div>`,
    }),
};

/* ------------------------------------------------------------- 3. MTV vergi tahsil alındısı */

const mtv = {
    id: 'mtv-vergi-tahsil-alindisi',
    sector: 'finans',
    accent: '#b91c1c',
    name: 'Motorlu Taşıtlar Vergisi Tahsil Alındısı',
    description: 'Anlaşmalı bankanın tahsil ettiği MTV taksiti için Vergi Tahsil Alındısı (VTA): resmî alındı çerçevesi, plaka rozeti, vergi kodu / dönem / tahakkuk no tablosu, nevi bazında tutarlar ve tahsilat mührü.',
    tags: ['VTA', 'MTV', 'Plaka', 'Vergi kodu', 'Tahakkuk no'],
    xml: dekont({
        comment: 'Hazır şablon örneği: Motorlu Taşıtlar Vergisi Tahsil Alındısı — VTA · KKI (kartla MTV taksit ödemesi; banka serbest satır biçimi).',
        profile: 'VTA', type: 'KKI', id: 'TRS2026000318406', date: '2026-07-24', time: '16:08:44',
        refs: [{ id: 'MTV2026A0418277', scheme: 'BELGE_NO', type: 'BELGE_NO' }],
        supplier: {
            web: 'https://www.toroslarbankasi.com.tr', name: 'Toroslar Bankası A.Ş.',
            ids: [['VKN', '8530164927'], ['SUBEKODU', '0611'], ['SUBEADI', 'Ankara Kızılay Şubesi']],
            addr: addr('Atatürk Bulvarı', '109', 'Çankaya', 'Ankara', '06420'), vd: 'Kavaklıdere', tel: '0850 724 06 06',
        },
        customer: {
            person: ['Zeynep', 'ARSLAN'], ids: [['TCKN', '52814093762'], ['PLAKA', '06 ABR 418']],
            addr: addr('Ayrancı Mahallesi Hoşdere Caddesi', '57/12', 'Çankaya', 'Ankara', '06540'),
        },
        lines: [
            { name: 'Vergi T. Kodu', desc: '9047' },
            { name: 'Vergi Dairesi', desc: 'Çankaya Vergi Dairesi Müdürlüğü' },
            { name: 'Dönem', desc: '2026 / 2. Taksit' },
            { name: 'Nevi', desc: 'MOTORLU TAŞITLAR VERGİSİ', price: 6418.00 },
            { name: 'Nevi', desc: '2026/1 TAKSİT GECİKME ZAMMI', price: 186.12 },
        ],
        notes: ['Tahsilat banka kartı ile alınmış, ilgili vergi dairesi hesabına aktarılmıştır.', 'Bu alındı 509 Sıra No\'lu VUK Genel Tebliği kapsamında elektronik ortamda düzenlenmiştir.'],
    }),
    xslt: cnXslt({
        title: 'Vergi Tahsil Alındısı',
        comment: 'Motorlu Taşıtlar Vergisi Tahsil Alındısı (VTA): resmî alındı çerçevesi, plaka rozeti, vergi kodu tablosu ve tahsilat mührü.',
        css: `
            .sayfa { font-family: 'Times New Roman', Georgia, serif; font-size: 10pt; color: #1c1917; background: #fff; padding: 12mm; }
            .cerceve { border: 3px double #b91c1c; padding: 8mm 9mm; min-height: 270mm; position: relative; }
            .bas { display: grid; grid-template-columns: 44mm 1fr 44mm; align-items: center; text-align: center; border-bottom: 1.5px solid #b91c1c; padding-bottom: 5mm; }
            .bas h1 { margin: 0; font-size: 16pt; white-space: nowrap; letter-spacing: 2px; color: #991b1b; } .bas h1 + div { font-size: 9pt; letter-spacing: 3px; color: #57534e; margin-top: 1mm; }
            .no { text-align: right; font-family: Consolas, 'Courier New', monospace; font-size: 8.5pt; } .no b { display: block; font-size: 11pt; color: #991b1b; }
            .iki { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 6mm; }
            .iki h3 { margin: 0 0 2mm; font-size: 8.5pt; font-family: Arial, sans-serif; letter-spacing: 1.5px; color: #991b1b; text-transform: uppercase; border-bottom: 1px solid #fecaca; padding-bottom: 1mm; }
            .p-ad { font-weight: 700; font-size: 11pt; } .p-adr, .p-vk, .p-il { font-size: 9pt; color: #44403c; } .p-ek { display: none; }
            .plaka { display: inline-flex; align-items: stretch; border: 2px solid #1c1917; border-radius: 2mm; overflow: hidden; margin-top: 3mm; font-family: Arial, sans-serif; font-weight: 800; font-size: 15pt; }
            .plaka i { background: #1d4ed8; color: #fff; font-style: normal; font-size: 7pt; padding: 1mm 1.5mm; display: flex; align-items: flex-end; } .plaka span { padding: 1mm 4mm; letter-spacing: 1.5px; }
            table.vt { width: 100%; border-collapse: collapse; margin-top: 6mm; font-family: Consolas, 'Courier New', monospace; font-size: 9pt; }
            table.vt th, table.vt td { border: 1px solid #d6d3d1; padding: 2mm 3mm; text-align: left; } table.vt th { background: #fef2f2; color: #991b1b; font-family: Arial, sans-serif; font-size: 8pt; letter-spacing: .6px; width: 45mm; }
            table.nevi { width: 100%; border-collapse: collapse; margin-top: 6mm; }
            table.nevi th { background: #991b1b; color: #fff; font-family: Arial, sans-serif; font-size: 8.5pt; padding: 2.2mm 3mm; text-align: left; letter-spacing: .6px; }
            table.nevi td { border-bottom: 1px solid #e7e5e4; padding: 2.6mm 3mm; } .k-tt { text-align: right; font-family: Consolas, monospace; } .k-ac { font-weight: 700; margin-left: 2mm; }
            table.nevi tr.top td { border-top: 2px solid #991b1b; font-weight: 700; font-size: 12pt; }
            .yaz { margin-top: 3mm; font-style: italic; font-size: 9.5pt; }
            .muhur { position: absolute; right: 18mm; bottom: 46mm; width: 38mm; height: 38mm; border-radius: 50%; border: 2px solid #b91c1c; color: #b91c1c; display: flex; align-items: center; justify-content: center; text-align: center; font-family: Arial, sans-serif; font-weight: 800; font-size: 9pt; transform: rotate(-12deg); opacity: .65; box-shadow: inset 0 0 0 2.5mm #fff, inset 0 0 0 3mm #b91c1c; line-height: 1.3; }
            .alt { position: absolute; left: 9mm; right: 9mm; bottom: 8mm; display: flex; gap: 6mm; align-items: flex-end; font-size: 8pt; color: #57534e; } .alt ul { flex: 1; margin: 0; padding-left: 4mm; line-height: 1.6; }
        `,
        body: `<div class="sayfa"><div class="cerceve">
    <div class="bas"><div style="text-align:left">${logo(SVG.toroslar, 158, 40)}</div><div><h1>${t('VERGİ TAHSİL ALINDISI')}</h1><div>${t('MOTORLU TAŞITLAR VERGİSİ')}</div></div>
        <div class="no">${t('Alındı No')}<b>${v('$f/cbc:ID')}</b>${tarihSaat()}</div></div>
    <div class="iki"><div><h3>${t('Tahsilatı Yapan Banka')}</h3>${partyBlock(SUP)}<div class="p-il">${t('Şube: ')}${v(`${pid(SUP, 'SUBEADI')}`)}${t(' (')}${v(pid(SUP, 'SUBEKODU'))}${t(')')}</div></div>
        <div><h3>${t('Mükellef')}</h3>${partyBlock(CUS)}${iff(pid(CUS, 'PLAKA'), `<div class="plaka"><i>${t('TR')}</i><span>${v(pid(CUS, 'PLAKA'))}</span></div>`)}</div></div>
    <table class="vt">${each("$f/cac:CreditNoteLine[not(cac:Price)]", `<tr><th>${v('cac:Item/cbc:Name')}</th><td>${v('cac:Item/cbc:Description')}</td></tr>`)}${refs((a, b) => `<tr><th>${a}</th><td>${b}</td></tr>`)}<tr><th>${t('ETTN')}</th><td>${v('$f/cbc:UUID')}</td></tr></table>
    <table class="nevi"><tr><th>${t('Vergi Nevi')}</th><th style="text-align:right">${t('Tutar')}</th></tr>
        ${each('$f/cac:CreditNoteLine[cac:Price]', `<tr><td>${v('cac:Item/cbc:Description')}</td><td class="k-tt">${cm('cac:Price/cbc:PriceAmount')}</td></tr>`)}
        ${each('$f/cac:TaxTotal/cac:TaxSubtotal[cbc:TaxAmount &gt; 0]', `<tr><td>${v('cac:TaxCategory/cac:TaxScheme/cbc:Name')}</td><td class="k-tt">${cm('cbc:TaxAmount')}</td></tr>`)}
        <tr class="top"><td>${t('TAHSİL EDİLEN TOPLAM')}</td><td class="k-tt">${DK.odenecek}</td></tr></table>
    ${yalniz(`<div class="yaz">${v('.')}</div>`)}
    <div class="muhur">${t('TAHSİL')}<br/>${t('EDİLMİŞTİR')}<br/>${dt('$f/cbc:IssueDate')}</div>
    <div class="alt"><ul>${notes(`<li>${v('.')}</li>`)}</ul>${qr(84)}</div>
</div></div>`,
    }),
};

/* ------------------------------------------------------------- 4. Gümrük vergisi tahsilatı */

const gumruk = {
    id: 'gumruk-vergi-tahsil-dekont',
    sector: 'finans',
    accent: '#14532d',
    name: 'Gümrük Vergisi Tahsil Alındısı (İthalat)',
    description: 'İthalatçı firmanın beyanname vergilerini bankadan havaleyle ödemesi için Gümrük Vergi Tahsil Alındısı (GVTA): konteyner şeritli başlık, beyanname tescil no kartı, vergi kodu çipleri ve kod bazında tutar dağılımı çubukları.',
    tags: ['GVTA', 'Gümrük', 'Beyanname', 'Vergi kodu', 'Havale'],
    xml: dekont({
        comment: 'Hazır şablon örneği: Gümrük Vergisi Tahsil Alındısı — GVTA · HVL (ithalat beyannamesi vergilerinin havaleyle ödenmesi).',
        profile: 'GVTA', type: 'HVL', id: 'MLT2026000092647', date: '2026-10-06', time: '14:31:09',
        refs: [{ id: '26330100IM00247118', scheme: 'BELGE_NO', type: 'BELGE_NO' }],
        supplier: {
            web: 'https://www.meltembank.com.tr', name: 'Meltem Bankası A.Ş.',
            ids: [['VKN', '6210948375'], ['SUBEKODU', '0733'], ['SUBEADI', 'Mersin Serbest Bölge Şubesi']],
            addr: addr('Serbest Bölge 3. Cadde', '2', 'Akdeniz', 'Mersin', '33020'), vd: 'Uray', tel: '0850 333 07 33',
        },
        customer: {
            name: 'Çukurova Makine İthalat ve Dış Ticaret A.Ş.', ids: [['VKN', '8460215937']],
            addr: addr('Huzurkent Mahallesi 2. Organize Sanayi', '41', 'Yüreğir', 'Adana', '01350'), vd: 'Ziyapaşa', tel: '(322) 394 18 00',
        },
        lines: [
            { name: 'Gümrük İdaresi', desc: 'Mersin Gümrük Müdürlüğü (330100)' },
            { name: 'Gümrük Vergi Kodu', desc: '10', price: 18420.00 },
            { name: 'Gümrük Vergi Kodu', desc: '40', price: 93707.08 },
            { name: 'Gümrük Vergi Kodu', desc: '89', price: 495.10 },
            { name: 'AÇIKLAMA', desc: 'CNC TORNA TEZGAHI İTHALATI - 2 KAP / 6.840 KG' },
        ],
        notes: ['Vergiler müşterinin 0733-00418275 numaralı hesabından havale ile tahsil edilmiştir.', TEBLIG],
    }),
    xslt: cnXslt({
        title: 'Gümrük Vergi Tahsil Alındısı',
        comment: 'Gümrük Vergisi Tahsil Alındısı (GVTA · HVL): konteyner şeritli başlık, beyanname kartı, vergi kodu çipleri ve dağılım çubukları.',
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5pt; color: #0f1f17; background: #f6f8f4; }
            .bas { background: #0f2e1d; color: #ecfccb; padding: 9mm 14mm 7mm; display: flex; justify-content: space-between; align-items: center; }
            .bas h1 { margin: 0; font-size: 15pt; letter-spacing: .5px; } .bas h1 small { display: block; font-size: 8.5pt; color: #a3e635; letter-spacing: 2px; font-weight: 600; margin-top: 1mm; }
            .kont { height: 7mm; background: repeating-linear-gradient(90deg, #b45309 0 30mm, #1e3a8a 30mm 60mm, #15803d 60mm 90mm, #a16207 90mm 120mm); position: relative; }
            .kont::after { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(0,0,0,.25) 0 1px, transparent 1px 3mm); }
            .ic { padding: 8mm 14mm; }
            .beyan { display: grid; grid-template-columns: 1.4fr 1fr; gap: 6mm; }
            .bk { background: #fff; border-radius: 3mm; padding: 5mm 6mm; box-shadow: 0 1px 0 #d9e3d2; }
            .bk h3 { margin: 0 0 2.5mm; font-size: 7.8pt; letter-spacing: 1.3px; text-transform: uppercase; color: #4d7c0f; }
            .tescil { font-family: Consolas, monospace; font-size: 17pt; font-weight: 700; color: #0f2e1d; letter-spacing: 1px; }
            .p-ad { font-weight: 700; font-size: 10.5pt; } .p-adr, .p-vk, .p-il, .p-ek { font-size: 8.5pt; color: #4b5b50; }
            .mt div { display: flex; justify-content: space-between; font-size: 8.5pt; padding: 1.2mm 0; border-bottom: 1px dotted #d9e3d2; } .mt i { font-style: normal; color: #5f7464; white-space: nowrap; } .mt span { text-align: right; word-break: break-all; margin-left: 3mm; }
            .p-ek span { margin-right: 2mm; }
            .kodlar { margin-top: 7mm; display: grid; gap: 3mm; }
            .kod { display: grid; grid-template-columns: 22mm 1fr 40mm; gap: 4mm; align-items: center; background: #fff; border-radius: 3mm; padding: 3.5mm 5mm; }
            .chip { background: #0f2e1d; color: #a3e635; font-family: Consolas, monospace; font-weight: 700; font-size: 13pt; text-align: center; border-radius: 2mm; padding: 1.5mm 0; }
            .cubuk { height: 3.5mm; background: #e7efe1; border-radius: 2mm; overflow: hidden; } .cubuk div { height: 100%; background: linear-gradient(90deg, #4d7c0f, #a3e635); }
            .kod b { text-align: right; font-size: 11pt; }
            .top { margin-top: 5mm; display: flex; justify-content: space-between; align-items: center; background: #a3e635; color: #0f2e1d; border-radius: 3mm; padding: 5mm 6mm; }
            .top b { font-size: 19pt; } .top small { display: block; font-size: 8pt; margin-top: 1mm; }
            .acik { margin-top: 6mm; font-size: 9pt; } .acik i { font-style: normal; color: #4d7c0f; font-weight: 700; margin-right: 2mm; }
            .alt { display: flex; gap: 8mm; align-items: flex-end; margin-top: 8mm; } .alt ul { flex: 1; margin: 0; padding-left: 4mm; color: #4b5b50; font-size: 7.8pt; line-height: 1.6; }
        `,
        body: `<div class="sayfa">
    <div class="bas"><h1>${profilAd()}<small>${t('İTHALAT VERGİLERİ · ')}${DK.islemTipi}</small></h1>${logo(SVG.meltem, 150, 44)}</div>
    <div class="kont"></div>
    <div class="ic">
        <div class="beyan"><div class="bk"><h3>${t('Beyanname Tescil No')}</h3><div class="tescil">${v("$f/cac:AdditionalDocumentReference/cbc:ID[@schemeID='BELGE_NO']")}</div>
            <div style="margin-top:2mm;font-size:8.5pt;color:#4b5b50">${v("$f/cac:CreditNoteLine[cac:Item/cbc:Name='Gümrük İdaresi']/cac:Item/cbc:Description")}</div>
            <h3 style="margin-top:5mm">${t('Yükümlü (İthalatçı)')}</h3>${partyBlock(CUS)}</div>
            <div class="bk"><h3>${t('Alındı')}</h3><div class="mt">${meta((a, b) => `<div><i>${a}</i><span>${b}</span></div>`)}</div>
                <h3 style="margin-top:5mm">${t('Tahsilatı Yapan Banka')}</h3>${partyBlock(SUP, { contact: false })}</div></div>
        <div class="kodlar">${each("$f/cac:CreditNoteLine[cac:Price]", `<div class="kod"><div class="chip">${v('cac:Item/cbc:Description')}</div>
            <div><div style="font-size:8pt;color:#5f7464;margin-bottom:1mm">${v('cac:Item/cbc:Name')}${t(' · pay %')}${num(`cac:Price/cbc:PriceAmount div ${LMT}/cbc:PayableAmount * 100`, '##0,0')}</div>
            <div class="cubuk"><div><xsl:attribute name="style">width:<xsl:value-of select="round(cac:Price/cbc:PriceAmount div ${LMT}/cbc:PayableAmount * 100)"/>%</xsl:attribute></div></div></div>
            <b>${cm('cac:Price/cbc:PriceAmount')}</b></div>`)}</div>
        <div class="top"><div>${t('Tahsil edilen toplam vergi')}${yalniz(`<small>${v('.')}</small>`)}</div><b>${DK.odenecek}</b></div>
        <div class="acik"><i>${t('Açıklama')}</i>${DK.aciklama}</div>
        <div class="alt"><ul>${notes(`<li>${v('.')}</li>`)}</ul>${qr(84)}</div>
    </div>
</div>`,
    }),
};

/* ------------------------------------------------------------- 5. Fatura tahsilatı (fiş) */

const fatura = {
    id: 'fatura-tahsilat-dekont',
    sector: 'finans',
    accent: '#111111',
    name: 'Fatura Tahsilatı e-Dekontu (Fiş)',
    description: 'Ödeme kuruluşunun mobil uygulamadan tahsil ettiği elektrik faturası için e-Dekont (FTM): termal fiş görünümü, yırtık kenarlar, abone / fatura no, kurum bilgisi, komisyon ve BSMV, barkod şeridi.',
    tags: ['FTM', 'Fatura tahsilatı', 'Abone no', 'Termal fiş', 'Ödeme kuruluşu'],
    xml: dekont({
        comment: 'Hazır şablon örneği: Fatura Tahsilatı e-Dekontu — DEKONT · FTM (ödeme kuruluşu, elektrik faturası tahsilatı).',
        type: 'FTM', id: 'PPY2026000418306', date: '2026-10-10', time: '20:14:37',
        refs: [
            { id: 'KEP2026000918274', scheme: 'BELGENO', type: 'FATURA', desc: 'FATURA' },
            { id: 'PPY20261010FTM0418306', scheme: 'ISLEMREFNO', type: 'ISLEMREFERANSNO', desc: 'ISLEMREFERANSNO' },
            { id: 'MOBİL UYGULAMA', scheme: 'ISLEMKANALI', type: 'ISLEMKANALI', desc: 'ISLEMKANALI' },
        ],
        supplier: {
            web: 'https://www.papatyaodeme.com.tr', name: 'Papatya Ödeme Hizmetleri A.Ş.',
            ids: [['VKN', '7140385926'], ['MERSISNO', '0714038592600014'], ['SUBEKODU', '001'], ['SUBEADI', 'Genel Müdürlük']],
            addr: addr('Esentepe Mahallesi Büyükdere Caddesi', '199', 'Şişli', 'İstanbul', '34394'), vd: 'Zincirlikuyu', tel: '0850 840 72 72', mail: 'destek@papatyaodeme.com.tr',
        },
        customer: {
            name: 'Selin ÖZTÜRK', person: ['Selin', 'ÖZTÜRK'],
            ids: [['TCKN', '36081472590'], ['MUSTERINO', '50284117'], ['ABONENO', '4001827736'], ['IBAN', 'TR120001500158007309182746']],
            addr: addr('Kılıçaslan Mahallesi Atatürk Bulvarı', '88/3', 'Merkez', 'Kırşehir', '40100'), tel: '(542) 318 77 06',
        },
        buyer: {
            name: 'Kızılırmak Elektrik Perakende Satış A.Ş.', ids: [['VKN', '5590274163']],
            addr: addr('Yenice Mahallesi Terminal Caddesi', '12', 'Merkez', 'Kırşehir', '40100'), vd: 'Kırşehir',
        },
        settle: ['2026-10-10', '20:14:37', '2026-10-10', '20:14:38'],
        amount: 1284.60, fee: 4.90,
        tip: 'FATURA TAHSİLATI', aciklama: 'ELEKTRİK FATURASI - EYLÜL 2026 TÜKETİMİ (412 kWh)',
        notes: ['Ödeme kurum sistemine anlık bildirilmiştir; kurum kayıtlarında 1 iş günü içinde görünür.', 'Papatya Ödeme Hizmetleri A.Ş., 6493 sayılı Kanun kapsamında TCMB tarafından yetkilendirilmiş ödeme kuruluşudur.', TEBLIG],
    }),
    xslt: cnXslt({
        title: 'e-Dekont',
        comment: 'Fatura Tahsilatı e-Dekontu (DEKONT · FTM): termal fiş görünümü, yırtık kenarlar, abone/fatura no ve barkod şeridi.',
        css: `
            .sayfa { background: #e7e5e4; padding: 7mm 0; font-family: Consolas, 'Courier New', monospace; font-size: 9pt; color: #111; }
            .fis { width: 96mm; margin: 0 auto; background: #fff; padding: 9mm 7mm 8mm; position: relative; box-shadow: 0 1mm 3mm rgba(0,0,0,.12); }
            .fis::before, .fis::after { content: ''; position: absolute; left: 0; right: 0; height: 3mm; background: linear-gradient(-45deg, transparent 1.5mm, #fff 0) 0 0 / 3mm 3mm repeat-x, linear-gradient(45deg, transparent 1.5mm, #fff 0) 0 0 / 3mm 3mm repeat-x; }
            .fis::before { top: -3mm; transform: rotate(180deg); } .fis::after { bottom: -3mm; }
            .orta { text-align: center; } .orta .k { font-size: 8pt; color: #444; }
            h1 { font-size: 12pt; margin: 3mm 0 1mm; letter-spacing: 2px; text-align: center; }
            .cizgi { border-top: 1px dashed #111; margin: 3mm 0; } .cift { border-top: 3px double #111; margin: 3mm 0; }
            .s { display: flex; justify-content: space-between; gap: 3mm; padding: .6mm 0; } .s i { font-style: normal; color: #444; white-space: nowrap; } .s span { text-align: right; word-break: break-all; }
            .p-ad { font-weight: 700; } .p-adr, .p-vk, .p-il { font-size: 8pt; color: #333; } .p-ek { font-size: 8pt; } .p-ek span { display: block; } .p-ek i { font-style: normal; color: #444; }
            .b { font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1mm; }
            table.kalem { width: 100%; border-collapse: collapse; } table.kalem td { padding: .8mm 0; } .k-tt { text-align: right; } .k-ac { display: block; font-size: 8pt; color: #444; }
            .tutar { text-align: center; margin: 2mm 0; } .tutar b { font-size: 18pt; display: block; letter-spacing: 1px; } .tutar small { font-size: 7.5pt; }
            .barkod { height: 12mm; margin: 4mm 4mm 1mm; background: repeating-linear-gradient(90deg, #111 0 .4mm, #fff .4mm .9mm, #111 .9mm 1.6mm, #fff 1.6mm 1.9mm, #111 1.9mm 2.1mm, #fff 2.1mm 2.9mm); }
            .qrk { display: flex; justify-content: center; margin-top: 3mm; }
            .not { font-size: 7.3pt; color: #333; line-height: 1.45; margin-top: 1.5mm; }
        `,
        body: `<div class="sayfa"><div class="fis">
    <div class="orta">${logo(SVG.papatya, 140, 40)}<div class="k">${each(SUP, `${v('cac:PartyName/cbc:Name')}<br/>${t('VKN ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='VKN']")}${t(' · MERSİS ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='MERSISNO']")}`)}</div></div>
    <h1>${t('e-DEKONT')}</h1><div class="orta k">${DK.islemTipi}</div>
    <div class="cift"></div>
    ${meta((a, b) => `<div class="s"><i>${a}</i><span>${b}</span></div>`)}${refs((a, b) => `<div class="s"><i>${a}</i><span>${b}</span></div>`)}
    <div class="cizgi"></div>
    <div class="b">${t('Ödeyen')}</div>${partyBlock(CUS, { contact: false })}
    <div class="cizgi"></div>
    ${iff(BUY, `<div class="b">${t('Fatura Kurumu')}</div>${partyBlock(BUY, { contact: false })}<div class="cizgi"></div>`)}
    <table class="kalem">${DK.tutarlar(tutarRow)}</table>
    <div class="cift"></div>
    <div class="tutar">${t('ÖDENEN TOPLAM')}<b>${DK.odenecek}</b>${yalniz(`<small>${v('.')}</small>`)}</div>
    <div class="cizgi"></div>
    <div class="not">${DK.aciklama}</div>
    ${notes(`<div class="not">${t('* ')}${v('.')}</div>`)}
    <div class="barkod"></div><div class="orta k">${v('$f/cbc:ID')}</div>
    <div class="qrk">${qr(72)}</div>
</div></div>`,
    }),
};

/* ------------------------------------------------------------- 6. Cüzdandan para gönderme (mobil) */

const SURE = '$f/cac:PaymentTerms/cac:SettlementPeriod';
const cuzdan = {
    id: 'cuzdan-para-gonderme-dekont',
    sector: 'finans',
    accent: '#6d28d9',
    name: 'Cüzdan Para Gönderme e-Dekontu (Mobil)',
    description: 'Elektronik para kuruluşunun mobil cüzdandan cüzdana para gönderimi için e-Dekont (PAGO): mor uygulama ekranı başlığı, onay rozetiyle büyük tutar, gönderen → alıcı avatar kartları, işlem zaman çizelgesi, komisyon ve BSMV dökümü.',
    tags: ['PAGO', 'Mobil cüzdan', 'Elektronik para', 'Zaman çizelgesi', 'Avatar kartları'],
    xml: dekont({
        comment: 'Hazır şablon örneği: Cüzdan Para Gönderme e-Dekontu — DEKONT · PAGO (elektronik para kuruluşu, cüzdandan cüzdana gönderim).',
        type: 'PAGO', id: 'MRT2026000527814', date: '2026-10-11', time: '13:22:48',
        refs: [
            { id: 'MRT20261011PAGO0527814', scheme: 'ISLEMREFNO', type: 'ISLEMREFERANSNO', desc: 'ISLEMREFERANSNO' },
            { id: 'MOBİL UYGULAMA (iOS)', scheme: 'ISLEMKANALI', type: 'ISLEMKANALI', desc: 'ISLEMKANALI' },
        ],
        supplier: {
            web: 'https://www.marticuzdan.com.tr', name: 'Martı Elektronik Para ve Ödeme Hizmetleri A.Ş.',
            ids: [['VKN', '6120938457'], ['MERSISNO', '0612093845700019']],
            addr: addr('Maslak Mahallesi Eski Büyükdere Caddesi', '27', 'Sarıyer', 'İstanbul', '34485'), vd: 'Maslak', tel: '0850 811 62 78', mail: 'destek@marticuzdan.com.tr',
        },
        customer: {
            person: ['Deniz', 'ACAR'], ids: [['TCKN', '28417063952'], ['MUSTERINO', '90 532 418 27 66']],
            addr: addr('Göztepe Mahallesi Tanzimat Sokak', '14/6', 'Kadıköy', 'İstanbul', '34730'), tel: '(532) 418 27 66',
        },
        buyer: {
            person: ['Ece', 'YAVUZ'], ids: [['TCKN', '17530492864'], ['MUSTERINO', '90 544 207 31 58']],
            addr: addr('Alsancak Mahallesi Kıbrıs Şehitleri Caddesi', '122/3', 'Konak', 'İzmir', '35220'),
        },
        settle: ['2026-10-11', '13:22:46', '2026-10-11', '13:22:48'],
        amount: 2750, fee: 3.50,
        tip: 'CÜZDANDAN CÜZDANA PARA GÖNDERME', aciklama: 'EKİM AYI EV KİRASI PAYI - DENİZ',
        notes: ['Gönderim alıcının Martı Cüzdan hesabına anlık olarak aktarılmıştır.', 'Martı Elektronik Para ve Ödeme Hizmetleri A.Ş., 6493 sayılı Kanun kapsamında TCMB tarafından yetkilendirilmiş elektronik para kuruluşudur.', TEBLIG],
    }),
    xslt: cnXslt({
        title: 'e-Dekont',
        comment: 'Cüzdan Para Gönderme e-Dekontu (DEKONT · PAGO): mor uygulama ekranı başlığı, onay rozeti, avatar kartları ve işlem zaman çizelgesi.',
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5pt; color: #1e1b2e; background: #f5f3ff; padding: 0 0 10mm; }
            .bas { background: linear-gradient(150deg, #4c1d95, #6d28d9 55%, #a855f7); color: #fff; padding: 9mm 14mm 26mm; border-radius: 0 0 10mm 10mm; }
            .bas .ust { display: flex; justify-content: space-between; align-items: center; } .bas .ust span { font-size: 8.5pt; color: #e9d5ff; text-align: right; }
            .kart { margin: -18mm 14mm 0; background: #fff; border-radius: 6mm; box-shadow: 0 2mm 6mm rgba(76,29,149,.15); padding: 8mm 9mm 7mm; text-align: center; position: relative; }
            .onay { width: 15mm; height: 15mm; border-radius: 50%; background: #22c55e; color: #fff; font-size: 20pt; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: -15mm auto 3mm; border: 1.5mm solid #fff; }
            .kart .tip { font-size: 8.5pt; color: #7c3aed; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; }
            .kart .tt { font-size: 28pt; font-weight: 800; color: #2e1065; margin: 1mm 0; } .kart small { color: #6b7280; font-style: italic; font-size: 8.5pt; }
            .kisi { display: grid; grid-template-columns: 1fr 12mm 1fr; align-items: center; margin-top: 6mm; text-align: left; }
            .av { display: flex; gap: 3.5mm; align-items: flex-start; background: #faf5ff; border-radius: 4mm; padding: 4mm; }
            .av .yuz { flex: none; width: 11mm; height: 11mm; border-radius: 50%; background: #ddd6fe; color: #5b21b6; font-weight: 800; font-size: 12pt; display: flex; align-items: center; justify-content: center; }
            .av h4 { margin: 0 0 1mm; font-size: 7.5pt; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; }
            .p-ad { font-weight: 700; font-size: 10.5pt; } .p-adr, .p-il { display: none; } .p-vk, .p-ek { font-size: 8pt; color: #6b7280; } .p-ek i { font-style: normal; }
            .kisi .ok { text-align: center; font-size: 16pt; color: #a855f7; }
            .iki { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin: 7mm 14mm 0; }
            .kutu { background: #fff; border-radius: 4mm; padding: 5mm 6mm; } .kutu h3 { margin: 0 0 3mm; font-size: 7.8pt; color: #7c3aed; text-transform: uppercase; letter-spacing: 1.2px; }
            .zc { position: relative; padding-left: 7mm; } .zc::before { content: ''; position: absolute; left: 2mm; top: 1.5mm; bottom: 1.5mm; width: .6mm; background: #ddd6fe; }
            .zc div { position: relative; padding: 0 0 3.5mm; } .zc div::before { content: ''; position: absolute; left: -6.5mm; top: .8mm; width: 3.4mm; height: 3.4mm; border-radius: 50%; background: #7c3aed; box-shadow: 0 0 0 1mm #ede9fe; }
            .zc div:last-child::before { background: #22c55e; box-shadow: 0 0 0 1mm #dcfce7; } .zc b { display: block; font-size: 9pt; } .zc span { font-size: 8pt; color: #6b7280; }
            table.kalem { width: 100%; border-collapse: collapse; } table.kalem td { padding: 2mm 0; border-bottom: 1px solid #f3e8ff; font-size: 9pt; }
            .k-tt { text-align: right; font-weight: 600; white-space: nowrap; } .k-ac { display: block; color: #6b7280; font-size: 7.8pt; }
            .cek { margin-top: 5mm; display: flex; justify-content: space-between; align-items: center; background: #2e1065; color: #fff; border-radius: 3mm; padding: 3.5mm 4mm; } .cek span { font-size: 8.5pt; color: #ddd6fe; } .cek b { font-size: 13pt; }
            .bil { margin-top: 3mm; font-size: 7.8pt; color: #6b7280; line-height: 1.5; }
            .mt div { display: flex; justify-content: space-between; gap: 4mm; font-size: 8.3pt; padding: 1.2mm 0; border-bottom: 1px dotted #e9d5ff; } .mt i { font-style: normal; color: #6b7280; white-space: nowrap; } .mt span { text-align: right; word-break: break-all; }
            .acik { margin: 6mm 14mm 0; background: #ede9fe; border-radius: 4mm; padding: 4mm 6mm; font-size: 9pt; } .acik i { font-style: normal; font-weight: 700; color: #6d28d9; margin-right: 2mm; }
            .alt { display: flex; gap: 8mm; align-items: flex-end; margin: 7mm 14mm 0; } .alt ul { flex: 1; margin: 0; padding-left: 4mm; color: #6b7280; font-size: 7.8pt; line-height: 1.6; }
            .alt .kurum { font-size: 8pt; color: #4c1d95; margin-bottom: 2mm; list-style: none; margin-left: -4mm; }
        `,
        body: `<div class="sayfa">
    <div class="bas"><div class="ust">${logo(SVG.marti, 150, 40)}<span>${profilAd()}<br/>${tarihSaat()}</span></div></div>
    <div class="kart"><div class="onay">✓</div><div class="tip">${DK.islemTipi}</div><div class="tt">${DK.odenecek}</div>${yalniz(`<small>${v('.')}</small>`)}
        <div class="kisi"><div class="av"><div class="yuz">${v(`substring(${CUS}/cac:Person/cbc:FirstName,1,1)`)}${v(`substring(${CUS}/cac:Person/cbc:FamilyName,1,1)`)}</div><div><h4>${t('Gönderen')}</h4>${partyBlock(CUS, { contact: false })}</div></div>
            <div class="ok">➜</div>
            <div class="av"><div class="yuz">${v(`substring(${BUY}/cac:Person/cbc:FirstName,1,1)`)}${v(`substring(${BUY}/cac:Person/cbc:FamilyName,1,1)`)}</div><div><h4>${t('Alıcı')}</h4>${partyBlock(BUY, { contact: false })}</div></div></div></div>
    <div class="iki"><div class="kutu"><h3>${t('Tutar Dökümü')}</h3><table class="kalem">${DK.tutarlar(tutarRow)}</table>
            <div class="cek"><span>${t('Cüzdandan çekilen')}</span><b>${DK.odenecek}</b></div><div class="bil">${t('Alıcıya ulaşan tutar komisyon ve BSMV düşülmeden işlem tutarının tamamıdır.')}</div></div>
        <div class="kutu"><h3>${t('İşlem Durumu')}</h3><div class="zc">
            <div><b>${t('Talimat alındı')}</b><span>${dt(`${SURE}/cbc:StartDate`)}${t(' ')}${v(`${SURE}/cbc:StartTime`)}</span></div>
            <div><b>${t('Bakiye kontrolü ve onay')}</b><span>${t('Martı Cüzdan · anlık')}</span></div>
            <div><b>${t('Alıcı cüzdanına aktarıldı')}</b><span>${dt(`${SURE}/cbc:EndDate`)}${t(' ')}${v(`${SURE}/cbc:EndTime`)}</span></div></div>
            <h3 style="margin-top:4mm">${t('Dekont Bilgileri')}</h3><div class="mt">${meta((a, b) => `<div><i>${a}</i><span>${b}</span></div>`)}${refs((a, b) => `<div><i>${a}</i><span>${b}</span></div>`)}</div></div></div>
    <div class="acik"><i>${t('Açıklama')}</i>${DK.aciklama}</div>
    <div class="alt"><ul><li class="kurum">${each(SUP, `<b>${v('cac:PartyName/cbc:Name')}</b>${t(' · VKN ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='VKN']")}${t(' · MERSİS ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='MERSISNO']")}${t(' · ')}${v('cac:Contact/cbc:Telephone')}`)}</li>${notes(`<li>${v('.')}</li>`)}</ul>${qr(84)}</div>
</div>`,
    }),
};

export default [eft, kredi, mtv, gumruk, fatura, cuzdan];
