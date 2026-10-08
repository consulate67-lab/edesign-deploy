import {
    despatch, xslt, v, t, num, int, dt, unit, each, iff, choose, attr, P, PS, pName, pAddr, pTax, pContact,
    DSUP, DCUS, BUY, qr, logo, svg,
} from './lib.mjs';

const adr = (street, no, district, city, zip) => ({ street, no, district, city, zip });

const SH = '$f/cac:Shipment';
const DLV = `${SH}/cac:Delivery`;
const DA = `${DLV}/cac:DeliveryAddress`;
const PLATE = `${SH}/cac:ShipmentStage/cac:TransportMeans/cac:RoadTransport/cbc:LicensePlateID`;
const DRV = `${SH}/cac:ShipmentStage/cac:DriverPerson`;
const DL = '$f/cac:DespatchLine';
const CONTACT = '$f/cac:DespatchSupplierParty/cac:DespatchContact/cbc:Name';
const sevk = `${dt(`${DLV}/cac:Despatch/cbc:ActualDespatchDate`)}${t(' ')}${v(`substring(${DLV}/cac:Despatch/cbc:ActualDespatchTime,1,5)`)}`;
const duzenleme = `${dt('$f/cbc:IssueDate')}${t(' ')}${v('substring($f/cbc:IssueTime,1,5)')}`;
const sofor = v(`concat(${DRV}/cbc:FirstName,' ',${DRV}/cbc:FamilyName)`);
/** DeliveryAddress bağlamında adres. */
const aAddr = [
    v('cbc:StreetName'), iff('cbc:BuildingNumber', `${t(' No:')}${v('cbc:BuildingNumber')}`),
    t(' · '), iff('cbc:PostalZone', `${v('cbc:PostalZone')}${t(' ')}`), v('cbc:CitySubdivisionName'), t(' / '), v('cbc:CityName'),
].join('');
const doc = (type) => `$f/cac:AdditionalDocumentReference[cbc:DocumentType='${type}']`;

/* ================================================================ 1. Ayakkabı koli manifestosu */

const patika = {
    web: 'https://www.patikaayakkabi.com.tr',
    ids: [['VKN', '7240183659'], ['MERSISNO', '0724018365900015']],
    name: 'Patika Ayakkabı Sanayi ve Ticaret A.Ş.',
    addr: adr('Başpınar OSB 4. Bölge 83411 Nolu Cad.', '12', 'Şehitkamil', 'Gaziantep', '27600'),
    vd: 'Gaziantep Kurumlar', tel: '0342 337 50 12', mail: 'sevkiyat@patikaayakkabi.com.tr',
};
const adimla = {
    ids: [['VKN', '0129384756']],
    name: 'Adımla Mağazaları A.Ş. — Merkez Depo',
    addr: adr('Hadımköy Mah. Lojistik Cad.', '7', 'Arnavutköy', 'İstanbul', '34555'),
    vd: 'Büyükçekmece', tel: '0212 771 40 00', mail: 'depo@adimla.com.tr',
};
const koli = (from, to, renk, start, counts) => {
    const seri = counts.reduce((a, b) => a + b, 0);
    return {
        qty: (to - from + 1) * seri,
        props: {
            KOLI: `${String(from).padStart(2, '0')}–${String(to).padStart(2, '0')}`, KOLIADET: String(to - from + 1), SERICIFT: String(seri), RENK: renk,
            ...Object.fromEntries(counts.map((c, i) => [`NUMARA-${start + i}`, String(c)])),
        },
    };
};

const i1 = {
    id: 'ayakkabi-koli-irsaliye',
    xml: despatch({
        comment: `Hazır şablon örneği: Ayakkabı fabrikasından mağaza zinciri deposuna koli sevkiyatı — TEMELIRSALIYE · SEVK.
            Satırda KOLI (koli aralığı), KOLIADET, SERICIFT (koli başına çift), RENK ve NUMARA-xx (koli içi asorti) ek tanımları.`,
        id: 'PTK2026000004718', date: '2026-10-08', time: '07:10:00',
        notes: ['Her kolide 1 seri bulunur; koli etiketleri sipariş satır numarasıyla eşleşir.', 'Koliler üst üste en fazla 6 sıra istiflenmelidir.'],
        order: { id: 'ADM-PO-2026-3318', date: '2026-09-22' },
        docs: [{ id: 'PTK-CL-1047', date: '2026-10-08', type: 'CEKILISTESI', desc: 'Koli çeki listesi' }],
        supplier: patika, contact: 'Serkan Yıldız (Sevkiyat Şefi)', customer: adimla,
        ship: {
            id: 'SVK-26-1047', kg: 412.5, goods: 5, units: 34, value: 186400, plate: '27 PTK 412',
            driver: ['Mehmet', 'Aslan', '28471039562'], addr: adimla.addr, date: '2026-10-08', time: '07:30:00',
        },
        lines: [
            { name: 'Erkek Klasik Ayakkabı', desc: 'Dana deri saya, termo taban', model: 'PTK-1201', unit: 'PR', ...koli(1, 8, 'Siyah', 40, [1, 2, 3, 3, 2, 1]) },
            { name: 'Erkek Deri Bot', desc: 'Su itici nubuk, kauçuk taban', model: 'PTK-1340', unit: 'PR', ...koli(9, 14, 'Kahve', 40, [1, 2, 2, 2, 2, 1]) },
            { name: 'Kadın Çizme', desc: 'Yan fermuarlı, 5 cm topuk', model: 'PTK-2210', unit: 'PR', ...koli(15, 20, 'Siyah', 36, [1, 2, 2, 2, 1]) },
            { name: 'Kadın Sneaker', desc: 'Deri saya, EVA taban', model: 'PTK-2290', unit: 'PR', ...koli(21, 28, 'Beyaz', 36, [1, 2, 3, 3, 2, 1]) },
            { name: 'Çocuk Bot', desc: 'Cırt cırtlı, polar astarlı', model: 'PTK-3105', unit: 'PR', ...koli(29, 34, 'Lacivert', 28, [2, 2, 2, 2, 1, 1]) },
        ],
    }),
};
const ok = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="none"/><path d="M12 34 V12 M6 18 L12 10 L18 18 M28 34 V12 M22 18 L28 10 L34 18" stroke="#111" stroke-width="3.2" fill="none" stroke-linecap="square"/><path d="M5 37 H35" stroke="#111" stroke-width="3"/></svg>');
const semsiye = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M5 20 Q20 2 35 20 Z" fill="#111"/><path d="M20 20 V32 Q20 36 16 36" stroke="#111" stroke-width="3" fill="none"/><path d="M9 8 L11 12 M31 8 L29 12 M20 3 V6" stroke="#111" stroke-width="2"/></svg>');
const istif = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="9" y="25" width="22" height="10" fill="none" stroke="#111" stroke-width="2.6"/><rect x="9" y="14" width="22" height="10" fill="none" stroke="#111" stroke-width="2.6"/><path d="M20 3 V11 M16 7 L20 11 L24 7" stroke="#111" stroke-width="2.6" fill="none"/><text x="34" y="33" font-family="Arial" font-weight="900" font-size="9" fill="#111">6</text></svg>');
i1.xslt = xslt({
    root: 'DespatchAdvice',
    title: 'Koli Sevk İrsaliyesi',
    comment: `Patika Ayakkabı — fabrika → depo koli sevkiyatı e-İrsaliyesi. Koli manifestosu konsepti: sarı/siyah tehlike şeridi,
        şablon (stencil) harfler, koli aralığı damgalı satır kartları, koli içi asorti ızgarası (NUMARA-xx), koli × seri = çift hesabı,
        taşıma işaretleri (bu taraf yukarı, kuru tut, istif sınırı), TR plakası biçiminde araç bilgisi.`,
    css: `
        body { background: #3f3f46; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; color: #111111; }
        .sayfa { background: #f4f1e8; padding: 0 0 8mm 0; }
        .serit { height: 13px; background: repeating-linear-gradient(-45deg, #facc15 0 14px, #111111 14px 28px); }
        .ic { padding: 0 11mm; }
        .ust { display: flex; align-items: center; gap: 14px; padding: 9px 0 10px 0; border-bottom: 4px solid #111111; }
        .marka { flex: 1; display: flex; gap: 10px; align-items: center; }
        .unvan { font-weight: 900; font-size: 13.5px; text-transform: uppercase; }
        .adr { font-size: 9px; line-height: 1.5; color: #3f3f46; }
        .baslik { text-align: right; }
        .baslik .sevk { font-family: Stencil, 'Stencil Std', Impact, 'Arial Black', sans-serif; font-size: 50px; line-height: .9; letter-spacing: 4px; }
        .baslik .alt { font-weight: 900; letter-spacing: 2.5px; font-size: 9px; background: #111111; color: #facc15; padding: 2px 6px; margin-top: 3px; }
        .qr { background: #ffffff; padding: 4px; border: 2px solid #111111; }
        .bilgi { display: grid; grid-template-columns: repeat(6, 1fr); border-bottom: 2px solid #111111; }
        .bilgi > div { padding: 5px 7px; border-right: 1px solid #111111; }
        .bilgi > div:last-child { border-right: 0; }
        .bilgi .k { font-size: 7px; font-weight: 900; letter-spacing: 1.3px; text-transform: uppercase; color: #71717a; }
        .bilgi .v { font-weight: 800; font-size: 10.5px; }
        .ettn { font-family: Consolas, monospace; font-size: 8px; padding: 3px 7px; border-bottom: 2px solid #111111; }
        .taraf { display: flex; gap: 9px; margin-top: 10px; }
        .kart { flex: 1; border: 2px solid #111111; background: #ffffff; padding: 6px 9px; line-height: 1.5; }
        .kart .k { display: inline-block; background: #111111; color: #facc15; font-weight: 900; font-size: 7.5px; letter-spacing: 1.5px; padding: 1px 6px; margin-bottom: 3px; }
        .kart .ad { font-weight: 900; font-size: 11.5px; }
        .plaka { display: inline-flex; align-items: stretch; border: 2px solid #111111; border-radius: 4px; background: #ffffff; font-family: 'Arial Black', sans-serif; font-size: 17px; letter-spacing: 1px; margin: 2px 0 4px 0; overflow: hidden; }
        .plaka span { background: #1d4ed8; color: #ffffff; font-size: 8px; display: flex; align-items: flex-end; padding: 0 3px 3px 3px; font-family: Arial, sans-serif; }
        .plaka b { padding: 1px 9px; }
        .ozet { display: flex; margin-top: 10px; background: #111111; color: #f4f1e8; }
        .ozet > div { flex: 1; padding: 6px 10px; border-right: 2px dashed #facc15; }
        .ozet > div:last-child { border-right: 0; }
        .ozet .k { color: #facc15; font-size: 7.5px; font-weight: 900; letter-spacing: 2px; }
        .ozet .v { font-family: Stencil, Impact, 'Arial Black', sans-serif; font-size: 26px; line-height: 1.05; letter-spacing: 1px; }
        .bolum { display: flex; align-items: center; gap: 8px; margin: 12px 0 4px 0; font-weight: 900; letter-spacing: 3px; font-size: 10px; }
        .bolum:after { content: ''; flex: 1; height: 6px; background: repeating-linear-gradient(-45deg, #facc15 0 6px, #111111 6px 12px); }
        .koli { display: flex; border: 2px solid #111111; background: #e9d8b4; margin-top: 6px; position: relative; }
        .koli:before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 26px; margin-left: -13px; background: rgba(250,250,240,.35); border-left: 1px dashed rgba(0,0,0,.18); border-right: 1px dashed rgba(0,0,0,.18); }
        .kno { width: 25mm; background: #111111; color: #facc15; text-align: center; padding: 5px 3px; position: relative; }
        .kno small { display: block; font-size: 7.5px; letter-spacing: 2px; font-weight: 900; color: #f4f1e8; }
        .kno b { display: block; font-family: Stencil, Impact, 'Arial Black', sans-serif; font-size: 21px; letter-spacing: 1px; line-height: 1.1; }
        .kno span { font-size: 8.5px; font-weight: 800; color: #f4f1e8; }
        .govde { flex: 1; padding: 6px 10px; position: relative; }
        .govde .model { font-family: Consolas, monospace; font-weight: 800; background: #111111; color: #f4f1e8; padding: 0 5px; font-size: 9px; }
        .govde .ad { font-weight: 900; font-size: 12px; margin-left: 5px; text-transform: uppercase; }
        .govde .acik { font-size: 9px; color: #44403c; margin: 1px 0 4px 0; }
        .asorti { display: inline-flex; border: 2px solid #111111; background: #ffffff; vertical-align: middle; }
        .asorti span { min-width: 26px; text-align: center; border-right: 1px solid #111111; font-weight: 900; font-size: 11px; }
        .asorti span:last-child { border-right: 0; }
        .asorti em { display: block; font-style: normal; background: #facc15; font-size: 8px; border-bottom: 1px solid #111111; }
        .asorti span.bas { background: #111111; color: #facc15; font-size: 7.5px; padding: 0 4px; display: flex; align-items: center; letter-spacing: 1px; }
        .renk { display: inline-block; font-weight: 800; font-size: 9px; border: 1.5px solid #111111; padding: 1px 6px; margin-left: 8px; background: #ffffff; vertical-align: middle; }
        .hesap { width: 40mm; border-left: 2px solid #111111; padding: 6px 9px; text-align: right; background: #f4f1e8; position: relative; }
        .hesap .x { font-size: 9px; font-weight: 700; color: #57534e; }
        .hesap .cift { font-family: Stencil, Impact, 'Arial Black', sans-serif; font-size: 25px; line-height: 1; }
        .hesap .cift small { font-family: 'Segoe UI', sans-serif; font-size: 9px; font-weight: 900; letter-spacing: 1px; }
        .alt { display: flex; gap: 12px; margin-top: 12px; }
        .notlar { flex: 1; border: 2px dashed #111111; padding: 6px 10px; background: #ffffff; }
        .notlar ul { margin: 3px 0 0 0; padding-left: 15px; line-height: 1.55; }
        .isaret { display: flex; gap: 6px; align-items: center; }
        .isaret div { border: 2px solid #111111; background: #ffffff; padding: 3px; text-align: center; font-size: 6.5px; font-weight: 900; letter-spacing: .5px; width: 52px; }
        .imza { display: flex; gap: 9px; margin-top: 12px; }
        .imza > div { flex: 1; border: 2px solid #111111; height: 23mm; padding: 5px 8px; background: #ffffff; position: relative; }
        .imza .k { font-weight: 900; letter-spacing: 2px; font-size: 8px; }
        .imza .n { position: absolute; bottom: 5px; left: 8px; right: 8px; border-top: 1px dotted #111111; padding-top: 2px; font-size: 9px; }
        .dip { position: absolute; left: 0; right: 0; bottom: 0; height: 9px; background: repeating-linear-gradient(-45deg, #facc15 0 14px, #111111 14px 28px); }`,
    body: `
<div class="sayfa">
    <div class="serit"></div>
    <div class="ic">
        <div class="ust">
            <div class="marka">
                ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#111"/><path d="M10 22 L32 11 L54 22 L54 46 L32 56 L10 46 Z" fill="#facc15"/><path d="M10 22 L32 33 L54 22 M32 33 V56" stroke="#111" stroke-width="3" fill="none"/><path d="M19 39 Q24 33 30 37 L30 44 L19 44 Z" fill="#111"/></svg>', 58, 58)}
                <div>${each(DSUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div>`)}</div>
            </div>
            <div class="baslik"><div class="sevk">${t('SEVK')}</div><div class="alt">${t('e-İRSALİYE · KOLİ MANİFESTOSU')}</div></div>
            <div class="qr">${qr(80)}</div>
        </div>
        <div class="bilgi">
            <div><div class="k">${t('İrsaliye No')}</div><div class="v">${v('$f/cbc:ID')}</div></div>
            <div><div class="k">${t('Düzenleme')}</div><div class="v">${duzenleme}</div></div>
            <div><div class="k">${t('Fiili Sevk')}</div><div class="v">${sevk}</div></div>
            <div><div class="k">${t('Senaryo / Tip')}</div><div class="v">${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:DespatchAdviceTypeCode')}</div></div>
            <div><div class="k">${t('Sipariş')}</div><div class="v">${v('$f/cac:OrderReference/cbc:ID')}</div></div>
            <div><div class="k">${t('Çeki Listesi')}</div><div class="v">${v(`${doc('CEKILISTESI')}/cbc:ID`)}</div></div>
        </div>
        <div class="ettn">${t('ETTN ')}${v('$f/cbc:UUID')}${t('  ·  Sevkiyat ')}${v(`${SH}/cbc:ID`)}</div>
        <div class="taraf">
            <div class="kart">
                <div class="k">${t('TESLİM ALAN')}</div>
                ${each(DCUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}
            </div>
            <div class="kart">
                <div class="k">${t('TESLİMAT ADRESİ')}</div>
                ${each(DA, `<div>${aAddr}</div>`)}
                <div style="margin-top:4px"><b>${t('Sevk sorumlusu: ')}</b>${v(CONTACT)}</div>
            </div>
            <div class="kart" style="flex:.8">
                <div class="k">${t('ARAÇ / ŞOFÖR')}</div>
                <div><div class="plaka"><span>${t('TR')}</span><b>${v(PLATE)}</b></div></div>
                <b>${sofor}</b>${t(' · TCKN ')}${v(`${DRV}/cbc:NationalityID`)}
            </div>
        </div>
        <div class="ozet">
            <div><div class="k">${t('KOLİ')}</div><div class="v">${int(`sum(${DL}/${P('KOLIADET')})`)}</div></div>
            <div><div class="k">${t('TOPLAM ÇİFT')}</div><div class="v">${int(`sum(${DL}/cbc:DeliveredQuantity)`)}</div></div>
            <div><div class="k">${t('MODEL')}</div><div class="v">${v(`count(${DL})`)}</div></div>
            <div><div class="k">${t('BRÜT KG')}</div><div class="v">${num(`${SH}/cbc:GrossWeightMeasure`, '###.##0,0')}</div></div>
        </div>
        <div class="bolum">${t('KOLİ LİSTESİ')}</div>
        ${each(DL, `<div class="koli">
            <div class="kno"><small>${t('KOLİ NO')}</small><b>${v(P('KOLI'))}</b><span>${v(P('KOLIADET'))}${t(' koli')}</span></div>
            <div class="govde">
                <span class="model">${v('cac:Item/cbc:ModelName')}</span><span class="ad">${v('cac:Item/cbc:Name')}</span>
                <div class="acik">${v('cac:Item/cbc:Description')}</div>
                <div class="asorti"><span class="bas">${t('NO')}<br/>${t('ÇİFT')}</span>${each(PS('NUMARA-'), `<span><em>${v("substring-after(@schemeID,'-')")}</em>${v('.')}</span>`)}</div>
                <span class="renk">${v(P('RENK'))}</span>
            </div>
            <div class="hesap">
                <div class="x">${v(P('KOLIADET'))}${t(' koli × ')}${v(P('SERICIFT'))}${t(' çift')}</div>
                <div class="cift">${int('cbc:DeliveredQuantity')}${t(' ')}<small>${t('ÇİFT')}</small></div>
            </div>
        </div>`)}
        <div class="alt">
            <div class="notlar"><b>${t('SEVK NOTLARI')}</b><ul>${each('$f/cbc:Note', `<li>${v('.')}</li>`)}</ul></div>
            <div class="isaret">
                <div><img alt="" width="34" height="34" src="${ok}"/><br/>${t('BU TARAF YUKARI')}</div>
                <div><img alt="" width="34" height="34" src="${semsiye}"/><br/>${t('KURU TUTUN')}</div>
                <div><img alt="" width="34" height="34" src="${istif}"/><br/>${t('EN FAZLA 6 SIRA')}</div>
            </div>
        </div>
        <div class="imza">
            <div><div class="k">${t('TESLİM EDEN')}</div><div class="n">${v(CONTACT)}</div></div>
            <div><div class="k">${t('ŞOFÖR')}</div><div class="n">${sofor}</div></div>
            <div><div class="k">${t('TESLİM ALAN · KOLİ SAYIMI')}</div><div class="n">${t('Ad Soyad / İmza / Kaşe')}</div></div>
        </div>
    </div>
    <div class="dip"></div>
</div>`,
});

/* ================================================================ 2. Boyahane → konfeksiyon (renk laboratuvarı) */

const renkhane = {
    web: 'https://www.renkhaneboya.com.tr',
    ids: [['VKN', '7349102856'], ['MERSISNO', '0734910285600011']],
    name: 'Renkhane Boya Apre Sanayi ve Ticaret A.Ş.',
    addr: adr('Velimeşe OSB 3. Cadde', '22', 'Ergene', 'Tekirdağ', '59930'),
    vd: 'Çorlu', tel: '0282 674 30 30', mail: 'sevk@renkhaneboya.com.tr',
};
const atlas = {
    web: 'https://www.atlaskonfeksiyon.com.tr',
    ids: [['VKN', '1093847562']],
    name: 'Atlas Konfeksiyon Ltd. Şti.',
    addr: adr('Güneşli Mah. Koçman Cad.', '41', 'Bağcılar', 'İstanbul', '34212'),
    vd: 'Güneşli', tel: '0212 651 22 80', mail: 'kumas@atlaskonfeksiyon.com.tr',
};
const top = (renk, kod, pantone, lot, topAdet, kg, en, gramaj, haslik) => ({
    RENK: renk, RENKKOD: kod, PANTONE: pantone, LOT: lot, TOP: String(topAdet), KG: String(kg), EN: en, GRAMAJ: gramaj,
    YIKAMA: String(haslik[0]), SURTME: String(haslik[1]), ISIK: String(haslik[2]),
});

const i2 = {
    id: 'kumas-boyahane-irsaliye',
    xml: despatch({
        comment: `Hazır şablon örneği: Fason boyahaneden konfeksiyona boyalı kumaş top sevkiyatı — TEMELIRSALIYE · SEVK, miktar metre (MTR).
            Satırda RENK, RENKKOD (#hex), PANTONE, LOT, TOP (top adedi), KG, EN, GRAMAJ ve YIKAMA / SURTME / ISIK haslık notları (1–5).`,
        id: 'RNK2026000000882', date: '2026-10-08', time: '09:40:00',
        notes: ['Fason boya-apre işlemi sonrası iadedir; ham kumaş Atlas Konfeksiyon\'a aittir.', 'Renk onayı lab-dip numunelerine göre verilmiştir, ±%3 metraj toleransı vardır.'],
        order: { id: 'ATL-BY-26-118', date: '2026-09-24' },
        docs: [{ id: 'RNK-IE-2026-0882', date: '2026-09-29', type: 'ISEMRI', desc: 'Boya-apre iş emri' }],
        supplier: renkhane, contact: 'Gökhan Er (Kalite Kontrol)', customer: atlas,
        ship: {
            id: 'RNK-SVK-0882', kg: 1846.2, goods: 4, units: 38, plate: '59 RNK 220',
            driver: ['Hüseyin', 'Kurt', '19283746510'], addr: atlas.addr, date: '2026-10-08', time: '10:15:00',
        },
        lines: [
            { name: 'Süprem Örme Kumaş', desc: '%100 pamuk 30/1 penye · reaktif boya', unit: 'MTR', qty: 1520, props: top('Gece Mavisi', '#1e3a8a', '19-3933 TCX', 'L-26-4411', 12, 486.4, '180 cm', '160 g/m²', [4.5, 4, 5]) },
            { name: 'Ribana Kumaş', desc: '%95 pamuk %5 elastan · 1×1', unit: 'MTR', qty: 640, props: top('Bordo', '#9f1239', '19-1934 TCX', 'L-26-4412', 6, 211.2, '120 cm tüp', '240 g/m²', [4, 4, 4.5]) },
            { name: 'İki İplik Kumaş', desc: 'Şardonlu, %100 pamuk', unit: 'MTR', qty: 1180, props: top('Haki', '#556b2f', '18-0523 TCX', 'L-26-4413', 10, 531, '185 cm', '260 g/m²', [4, 3.5, 4.5]) },
            { name: 'Viskon Dokuma', desc: 'Pamuklu görünüm, yumuşak tuşe', unit: 'MTR', qty: 980, props: top('Kiremit', '#c2410c', '17-1340 TCX', 'L-26-4414', 10, 617.6, '145 cm', '125 g/m²', [3.5, 4, 4]) },
        ],
    }),
};
const haslik = (k, label) => `<div class="has"><span class="hk">${t(label)}</span><span class="cubuk"><i>${attr('style', `width:${v(`${P(k)} * 20`)}%`)}</i></span><b>${v(`translate(${P(k)},'.',',')`)}</b></div>`;
i2.xslt = xslt({
    root: 'DespatchAdvice',
    title: 'Boyalı Kumaş Sevk İrsaliyesi',
    comment: `Renkhane Boya Apre — boyalı kumaş teslim e-İrsaliyesi. Renk laboratuvarı konsepti: tayf şeridi, süreç adımları
        (ham kabul → ön terbiye → boyama → apre → kalite → sevk), her satır için RENKKOD ile boyanan Pantone tarzı renk kartı,
        lot / top / metre / kg / en / gramaj künyesi ve haslık çubukları (YIKAMA, SURTME, ISIK).`,
    css: `
        body { background: #e5e7eb; font-family: 'Helvetica Neue', 'Segoe UI', Arial, sans-serif; font-size: 10.5px; color: #1f2937; }
        .sayfa { background: #ffffff; padding: 0 12mm 10mm 12mm; }
        .tayf { height: 9px; margin: 0 -12mm; background: linear-gradient(90deg, #7c3aed, #2563eb, #06b6d4, #10b981, #84cc16, #facc15, #f97316, #ef4444, #db2777); }
        .ust { display: flex; justify-content: space-between; align-items: flex-start; padding-top: 10px; }
        .marka { display: flex; gap: 10px; align-items: center; }
        .unvan { font-size: 15px; font-weight: 800; letter-spacing: -.2px; }
        .adr { color: #6b7280; font-size: 9px; line-height: 1.5; }
        .sag { display: flex; gap: 10px; align-items: flex-start; }
        .baslik { text-align: right; }
        .baslik .k { font-size: 8px; letter-spacing: 3px; color: #9ca3af; font-weight: 700; }
        .baslik h1 { margin: 0; font-size: 22px; font-weight: 300; letter-spacing: -.3px; }
        .baslik h1 b { font-weight: 800; }
        .baslik .no { font-family: Consolas, monospace; font-size: 11px; font-weight: 700; }
        .baslik table { margin-left: auto; margin-top: 3px; border-collapse: collapse; font-size: 9px; }
        .baslik td { padding: 1px 0 1px 8px; color: #6b7280; }
        .baslik td.d { color: #111827; font-weight: 700; }
        .surec { display: flex; margin: 12px 0 10px 0; position: relative; }
        .surec:before { content: ''; position: absolute; top: 11px; left: 6%; right: 6%; height: 2px; background: #d1d5db; }
        .surec > div { flex: 1; text-align: center; position: relative; font-size: 8.5px; color: #6b7280; }
        .surec .d { width: 24px; height: 24px; border-radius: 50%; margin: 0 auto 3px auto; background: #ffffff; border: 2px solid #10b981; color: #10b981; font-weight: 900; line-height: 20px; font-size: 11px; }
        .surec .son .d { background: #111827; border-color: #111827; color: #ffffff; }
        .surec .son { color: #111827; font-weight: 800; }
        .taraf { display: flex; gap: 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
        .taraf > div { flex: 1; padding: 7px 10px 7px 0; line-height: 1.5; }
        .taraf > div + div { border-left: 1px solid #e5e7eb; padding-left: 10px; }
        .taraf .k { font-size: 7.5px; letter-spacing: 2px; color: #9ca3af; font-weight: 800; }
        .taraf .ad { font-weight: 800; font-size: 11px; }
        .kartlar { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
        .renk { border: 1px solid #e5e7eb; border-radius: 3px; overflow: hidden; display: flex; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
        .chip { width: 36mm; color: #ffffff; padding: 7px 8px; display: flex; flex-direction: column; justify-content: space-between; min-height: 47mm; }
        .chip .no { font-size: 8px; letter-spacing: 1.5px; opacity: .8; font-weight: 700; }
        .chip .pan { font-weight: 900; font-size: 13px; letter-spacing: .3px; }
        .chip .rad { font-size: 11px; opacity: .92; }
        .chip .lot { font-family: Consolas, monospace; font-size: 9px; background: rgba(0,0,0,.22); padding: 1px 4px; border-radius: 2px; align-self: flex-start; }
        .bilgi { flex: 1; padding: 7px 9px; }
        .bilgi .ad { font-weight: 800; font-size: 11.5px; }
        .bilgi .acik { color: #6b7280; font-size: 9px; margin-bottom: 5px; }
        .bilgi table { width: 100%; border-collapse: collapse; }
        .bilgi td { padding: 2px 0; border-bottom: 1px dotted #e5e7eb; font-size: 9.5px; }
        .bilgi td.d { text-align: right; font-weight: 700; }
        .bilgi tr.mt td { font-size: 12px; font-weight: 900; color: #111827; border-bottom: 1px solid #111827; }
        .has { display: flex; align-items: center; gap: 5px; margin-top: 3px; font-size: 8.5px; }
        .has .hk { width: 36px; color: #6b7280; }
        .has .cubuk { flex: 1; height: 5px; background: repeating-linear-gradient(90deg, #f3f4f6 0 19.4%, #ffffff 19.4% 20%); border-radius: 3px; overflow: hidden; }
        .has i { display: block; height: 100%; background: linear-gradient(90deg, #fca5a5, #fde047, #4ade80); }
        .has b { width: 18px; text-align: right; }
        .toplam { display: flex; margin-top: 12px; border: 1px solid #111827; }
        .toplam > div { flex: 1; padding: 6px 10px; border-right: 1px solid #e5e7eb; }
        .toplam > div:last-child { border-right: 0; }
        .toplam .k { font-size: 7.5px; letter-spacing: 2px; color: #6b7280; font-weight: 800; }
        .toplam .v { font-size: 18px; font-weight: 300; }
        .toplam .v b { font-weight: 900; }
        .alt { display: flex; gap: 14px; margin-top: 12px; }
        .alt .not { flex: 1; font-size: 9.5px; line-height: 1.55; color: #374151; }
        .alt .not ul { margin: 2px 0 0 0; padding-left: 14px; }
        .alt .arac { width: 62mm; background: #f9fafb; border-radius: 3px; padding: 7px 10px; line-height: 1.6; font-size: 9.5px; }
        .imza { display: flex; gap: 12px; margin-top: 18px; }
        .imza div { flex: 1; border-top: 1px solid #111827; padding-top: 3px; font-size: 8.5px; color: #6b7280; letter-spacing: 1px; }
        .imza b { display: block; color: #111827; letter-spacing: 0; font-size: 9.5px; }`,
    body: `
<div class="sayfa">
    <div class="tayf"></div>
    <div class="ust">
        <div class="marka">
            ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="24" cy="26" r="16" fill="#06b6d4" opacity=".85"/><circle cx="40" cy="26" r="16" fill="#db2777" opacity=".8"/><circle cx="32" cy="40" r="16" fill="#facc15" opacity=".8"/></svg>', 58, 58)}
            <div>${each(DSUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div>`)}</div>
        </div>
        <div class="sag">
            <div class="baslik">
                <div class="k">${t('E-İRSALİYE')}</div>
                <h1>${t('Boyalı Kumaş ')}<b>${t('Teslim')}</b></h1>
                <div class="no">${v('$f/cbc:ID')}</div>
                <table>
                    <tr><td>${t('Düzenleme')}</td><td class="d">${duzenleme}</td></tr>
                    <tr><td>${t('Fiili sevk')}</td><td class="d">${sevk}</td></tr>
                    <tr><td>${t('Senaryo')}</td><td class="d">${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:DespatchAdviceTypeCode')}</td></tr>
                    <tr><td>${t('İş emri')}</td><td class="d">${v(`${doc('ISEMRI')}/cbc:ID`)}</td></tr>
                    <tr><td>${t('Sipariş')}</td><td class="d">${v('$f/cac:OrderReference/cbc:ID')}</td></tr>
                </table>
            </div>
            ${qr(86)}
        </div>
    </div>
    <div class="surec">
        <div><div class="d">${t('✓')}</div>${t('Ham kabul')}</div>
        <div><div class="d">${t('✓')}</div>${t('Ön terbiye')}</div>
        <div><div class="d">${t('✓')}</div>${t('Boyama')}</div>
        <div><div class="d">${t('✓')}</div>${t('Apre / Fikse')}</div>
        <div><div class="d">${t('✓')}</div>${t('Kalite kontrol')}</div>
        <div class="son"><div class="d">${t('→')}</div>${t('Sevk · ')}${dt(`${DLV}/cac:Despatch/cbc:ActualDespatchDate`)}</div>
    </div>
    <div class="taraf">
        <div><div class="k">${t('TESLİM ALAN')}</div>${each(DCUS, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}</div>
        <div><div class="k">${t('TESLİMAT ADRESİ')}</div>${each(DA, aAddr)}<div style="margin-top:4px;color:#6b7280">${t('ETTN ')}<span style="font-family:Consolas,monospace;color:#111827">${v('$f/cbc:UUID')}</span></div></div>
    </div>
    <div class="kartlar">
        ${each(DL, `<div class="renk">
            <div class="chip">${attr('style', `background:${v(P('RENKKOD'))}`)}
                <div class="no">${t('SATIR ')}${v('cbc:ID')}</div>
                <div><div class="pan">${v(P('PANTONE'))}</div><div class="rad">${v(P('RENK'))}</div></div>
                <div class="lot">${v(P('LOT'))}</div>
            </div>
            <div class="bilgi">
                <div class="ad">${v('cac:Item/cbc:Name')}</div>
                <div class="acik">${v('cac:Item/cbc:Description')}</div>
                <table>
                    <tr class="mt"><td>${t('Metraj')}</td><td class="d">${int('cbc:DeliveredQuantity')}${t(' ')}${unit('cbc:DeliveredQuantity/@unitCode')}</td></tr>
                    <tr><td>${t('Top adedi')}</td><td class="d">${v(P('TOP'))}${t(' top')}</td></tr>
                    <tr><td>${t('Ağırlık')}</td><td class="d">${num(P('KG'), '###.##0,0')}${t(' kg')}</td></tr>
                    <tr><td>${t('En / Gramaj')}</td><td class="d">${v(P('EN'))}${t(' · ')}${v(P('GRAMAJ'))}</td></tr>
                </table>
                ${haslik('YIKAMA', 'Yıkama')}${haslik('SURTME', 'Sürtme')}${haslik('ISIK', 'Işık')}
            </div>
        </div>`)}
    </div>
    <div class="toplam">
        <div><div class="k">${t('RENK / LOT')}</div><div class="v"><b>${v(`count(${DL})`)}</b></div></div>
        <div><div class="k">${t('TOP')}</div><div class="v"><b>${int(`sum(${DL}/${P('TOP')})`)}</b></div></div>
        <div><div class="k">${t('TOPLAM METRE')}</div><div class="v"><b>${int(`sum(${DL}/cbc:DeliveredQuantity)`)}</b>${t(' m')}</div></div>
        <div><div class="k">${t('BRÜT AĞIRLIK')}</div><div class="v"><b>${num(`${SH}/cbc:GrossWeightMeasure`, '###.##0,0')}</b>${t(' kg')}</div></div>
    </div>
    <div class="alt">
        <div class="not"><b>${t('Notlar')}</b><ul>${each('$f/cbc:Note', `<li>${v('.')}</li>`)}</ul>${t('Haslık değerleri gri skala (1–5) üzerinden verilmiştir.')}</div>
        <div class="arac">
            <b>${t('Araç ')}</b>${v(PLATE)}<br/>
            <b>${t('Şoför ')}</b>${sofor}${t(' · ')}${v(`${DRV}/cbc:NationalityID`)}<br/>
            <b>${t('Sevkiyat ')}</b>${v(`${SH}/cbc:ID`)}
        </div>
    </div>
    <div class="imza">
        <div>${t('KALİTE KONTROL')}<b>${v(CONTACT)}</b></div>
        <div>${t('ŞOFÖR')}<b>${sofor}</b></div>
        <div>${t('TESLİM ALAN · KUMAŞ KABUL')}<b>${t('Ad Soyad / İmza')}</b></div>
    </div>
</div>`,
});

/* ================================================================ 3. Dağıtım merkezi → mağaza (rota haritası) */

const lina = {
    web: 'https://www.linagiyim.com.tr',
    ids: [['VKN', '6082913745'], ['MERSISNO', '0608291374500017']],
    name: 'Lina Giyim Mağazacılık A.Ş. — Tuzla Dağıtım Merkezi',
    addr: adr('Aydınlı Mah. Lojistik Sok.', '5', 'Tuzla', 'İstanbul', '34953'),
    vd: 'Tuzla', tel: '0216 593 40 40', mail: 'dagitim@linagiyim.com.tr',
};
const linaBursa = {
    ids: [['VKN', '6082913745'], ['SUBENO', 'BRS-118']],
    name: 'Lina Giyim — Bursa Kent Meydanı Mağazası',
    addr: { street: 'Santral Garaj Mah. Kent Meydanı AVM Kat:1', no: '118', district: 'Osmangazi', city: 'Bursa', zip: '16200' },
    vd: 'Tuzla', tel: '0224 270 11 18', mail: 'bursakentmeydani@linagiyim.com.tr',
};
const hizliHat = {
    ids: [['VKN', '4567012398']],
    name: 'Hızlı Hat Lojistik A.Ş.',
    addr: adr('Gebze OSB 1600. Sok.', '1604', 'Gebze', 'Kocaeli', '41400'),
};
const beden = (o) => Object.fromEntries(Object.entries(o).map(([k, n]) => [`BEDEN-${k}`, String(n)]));

const i3 = {
    id: 'konfeksiyon-magaza-dagitim-irsaliye',
    xml: despatch({
        comment: `Hazır şablon örneği: Hazır giyim zincirinin dağıtım merkezinden mağazasına sevkiyat (şubeler arası) — TEMELIRSALIYE · SEVK.
            Satırda SEVK (ASKILI / KATLI), REYON, RENK, RENKKOD, TASIMA (askı arabası / koli) ve BEDEN-xx dağılımı; taşıyıcı firma ve mühür no.`,
        id: 'LNA2026000055821', date: '2026-10-08', time: '05:45:00',
        notes: ['Askılı ürünler askı arabasıyla, katlı ürünler numaralı kolilerle sevk edilmiştir.', 'Mağaza kabulünde mühür no ve taşıma birimi sayısı kontrol edilmelidir.'],
        order: { id: 'RPL-BRS118-2641', date: '2026-10-07' },
        docs: [{ id: 'MHR-448120', date: '2026-10-08', type: 'MUHUR', desc: 'Araç kapı mühür no' }],
        supplier: lina, contact: 'Elif Tan (Dağıtım Planlama)', customer: linaBursa,
        ship: {
            id: 'HH-26-55821', kg: 286.4, goods: 6, units: 14, plate: '34 HHL 707', carrier: hizliHat,
            driver: ['Onur', 'Kılıç', '37462819054'], addr: linaBursa.addr, date: '2026-10-08', time: '06:00:00',
        },
        lines: [
            { name: 'Yün Karışımlı Kaban', sid: 'LN-KB-2601', unit: 'C62', qty: 24, props: { SEVK: 'ASKILI', REYON: 'Kadın Dış Giyim', RENK: 'Deve tüyü', RENKKOD: '#c8a27a', TASIMA: 'Askı arabası A1', ...beden({ S: 4, M: 8, L: 8, XL: 4 }) } },
            { name: 'Midi Saten Elbise', sid: 'LN-EL-2614', unit: 'C62', qty: 36, props: { SEVK: 'ASKILI', REYON: 'Kadın Elbise', RENK: 'Zümrüt', RENKKOD: '#047857', TASIMA: 'Askı arabası A2', ...beden({ S: 8, M: 12, L: 10, XL: 6 }) } },
            { name: 'Tek Düğme Blazer Ceket', sid: 'LN-BL-2620', unit: 'C62', qty: 30, props: { SEVK: 'ASKILI', REYON: 'Kadın Ceket', RENK: 'Siyah', RENKKOD: '#18181b', TASIMA: 'Askı arabası A3', ...beden({ S: 6, M: 10, L: 9, XL: 5 }) } },
            { name: 'Basic Bisiklet Yaka Tişört', sid: 'LN-TS-2602', unit: 'C62', qty: 120, props: { SEVK: 'KATLI', REYON: 'Basic', RENK: 'Beyaz', RENKKOD: '#f4f4f5', TASIMA: 'Koli K1–K4', ...beden({ S: 30, M: 40, L: 30, XL: 20 }) } },
            { name: 'Balıkçı Yaka Triko Kazak', sid: 'LN-TR-2633', unit: 'C62', qty: 60, props: { SEVK: 'KATLI', REYON: 'Triko', RENK: 'Bordo', RENKKOD: '#881337', TASIMA: 'Koli K5–K7', ...beden({ S: 12, M: 20, L: 18, XL: 10 }) } },
            { name: 'Yüksek Bel Mom Jean', sid: 'LN-DN-2641', unit: 'C62', qty: 72, props: { SEVK: 'KATLI', REYON: 'Denim', RENK: 'Açık mavi', RENKKOD: '#93c5fd', TASIMA: 'Koli K8–K11', ...beden({ 26: 12, 28: 22, 30: 22, 32: 16 }) } },
        ],
    }),
};
const aski = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M20 12 Q20 6 24 7 Q27 8 26 11 Q25 13 22 14 L20 16 L4 30 Q3 32 6 32 H34 Q37 32 36 30 L20 16" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/></svg>');
const katli = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="6" y="26" width="28" height="7" rx="1.5" fill="#fff"/><rect x="8" y="18" width="24" height="7" rx="1.5" fill="#fff" opacity=".85"/><rect x="10" y="10" width="20" height="7" rx="1.5" fill="#fff" opacity=".7"/></svg>');
const grup = (tip, baslik, ikon) => `
        <div class="grup">
            <div class="gbas"><img alt="" width="22" height="22" src="${ikon}"/><b>${t(baslik)}</b><span>${v(`count(${DL}[${P('SEVK')}='${tip}'])`)}${t(' model · ')}${int(`sum(${DL}[${P('SEVK')}='${tip}']/cbc:DeliveredQuantity)`)}${t(' adet')}</span></div>
            ${each(`${DL}[${P('SEVK')}='${tip}']`, `<div class="urun">
                <div class="nokta">${attr('style', `background:${v(P('RENKKOD'))}`)}</div>
                <div class="ad"><div class="sku">${v('cac:Item/cac:SellersItemIdentification/cbc:ID')}${t(' · ')}${v(P('REYON'))}</div><b>${v('cac:Item/cbc:Name')}</b><div class="rk">${v(P('RENK'))}${t(' · ')}${v(P('TASIMA'))}</div></div>
                <div class="dag">${each(PS('BEDEN-'), `<div><i>${attr('style', `height:${v('round(. * 130 div ../../../cbc:DeliveredQuantity)')}px`)}</i><b>${v('.')}</b><span>${v("substring-after(@schemeID,'-')")}</span></div>`)}</div>
                <div class="adet">${int('cbc:DeliveredQuantity')}<small>${t('adet')}</small></div>
            </div>`)}
        </div>`;
i3.xslt = xslt({
    root: 'DespatchAdvice',
    title: 'Mağaza Sevk İrsaliyesi',
    comment: `Lina Giyim — dağıtım merkezinden mağazaya sevk e-İrsaliyesi. Metro hattı konsepti: çıkış → taşıyıcı → mağaza durakları
        olan rota haritası, askılı ve katlı ürünler için ayrı gruplar (SEVK ek tanımı), her model için renk noktası ve beden dağılımı
        sütun grafiği (BEDEN-xx), mühür no ile mağaza kabul kontrol listesi. Teal / turuncu renk düzeni.`,
    css: `
        body { background: #ccfbf1; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; color: #0f172a; }
        .sayfa { background: #ffffff; }
        .bant { background: #0f766e; color: #ffffff; padding: 9mm 12mm 16mm 12mm; display: flex; justify-content: space-between; align-items: flex-start; }
        .bant .marka { display: flex; gap: 10px; align-items: center; }
        .bant .unvan { font-size: 13.5px; font-weight: 800; }
        .bant .adr { font-size: 9px; opacity: .85; line-height: 1.5; }
        .bant h1 { margin: 0; text-align: right; font-size: 25px; font-weight: 900; letter-spacing: -.5px; line-height: 1; }
        .bant h1 span { display: block; font-size: 9px; letter-spacing: 3px; color: #fdba74; font-weight: 800; margin-bottom: 4px; }
        .bant .no { text-align: right; font-family: Consolas, monospace; font-size: 11.5px; margin-top: 4px; }
        .rota { margin: -11mm 12mm 0 12mm; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 14px rgba(15,118,110,.18); padding: 12px 16px 10px 16px; display: flex; align-items: flex-start; gap: 14px; }
        .hat { flex: 1; display: flex; position: relative; }
        .hat:before { content: ''; position: absolute; left: 16.6%; right: 16.6%; top: 9px; height: 6px; border-radius: 3px; background: linear-gradient(90deg, #0f766e 0 50%, #f97316 50% 100%); }
        .durak { flex: 1; text-align: center; position: relative; font-size: 9px; line-height: 1.45; color: #475569; }
        .durak .d { width: 24px; height: 24px; border-radius: 50%; background: #ffffff; border: 5px solid #0f766e; margin: 0 auto 4px auto; }
        .durak.ara .d { border-color: #f97316; }
        .durak.son .d { border-color: #f97316; background: #f97316; box-shadow: 0 0 0 4px #ffedd5; }
        .durak .k { font-size: 7.5px; letter-spacing: 2px; font-weight: 800; color: #0f766e; }
        .durak.ara .k, .durak.son .k { color: #ea580c; }
        .durak b { display: block; color: #0f172a; font-size: 10px; }
        .govde { padding: 10px 12mm 10mm 12mm; }
        .bilgi { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
        .bilgi > div { background: #f0fdfa; border-radius: 6px; padding: 5px 8px; }
        .bilgi .k { font-size: 7.5px; letter-spacing: 1.2px; color: #0f766e; font-weight: 800; text-transform: uppercase; }
        .bilgi .v { font-weight: 800; }
        .ettn { font-family: Consolas, monospace; font-size: 8px; color: #64748b; margin: 4px 0 0 2px; }
        .grup { margin-top: 12px; border: 1.5px solid #99f6e4; border-radius: 8px; overflow: hidden; }
        .gbas { background: #0f766e; color: #ffffff; display: flex; align-items: center; gap: 8px; padding: 4px 10px; }
        .gbas b { font-size: 11px; letter-spacing: 2px; }
        .gbas span { margin-left: auto; font-weight: 700; color: #fdba74; }
        .grup + .grup .gbas { background: #ea580c; }
        .grup + .grup .gbas span { color: #ffedd5; }
        .grup + .grup { border-color: #fed7aa; }
        .urun { display: flex; align-items: flex-end; gap: 10px; padding: 7px 10px; border-top: 1px solid #f1f5f9; }
        .nokta { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #e2e8f0; align-self: center; flex-shrink: 0; }
        .urun .ad { flex: 1; align-self: center; }
        .urun .sku { font-size: 8.5px; color: #64748b; font-family: Consolas, monospace; }
        .urun .ad b { font-size: 11.5px; }
        .urun .rk { font-size: 9px; color: #475569; }
        .dag { display: flex; gap: 4px; align-items: flex-end; height: 64px; }
        .dag > div { width: 27px; text-align: center; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; }
        .dag i { display: block; width: 15px; background: linear-gradient(180deg, #2dd4bf, #0f766e); border-radius: 3px 3px 0 0; }
        .grup + .grup .dag i { background: linear-gradient(180deg, #fdba74, #ea580c); }
        .dag b { font-size: 9px; order: -1; }
        .dag span { font-size: 8px; color: #64748b; border-top: 1px solid #cbd5e1; width: 100%; font-weight: 700; }
        .adet { width: 20mm; text-align: right; font-size: 20px; font-weight: 900; align-self: center; line-height: 1; }
        .adet small { display: block; font-size: 8px; color: #64748b; font-weight: 700; }
        .alt { display: flex; gap: 12px; margin-top: 12px; }
        .kabul { flex: 1; background: #fff7ed; border-radius: 8px; padding: 8px 12px; }
        .kabul .k { font-weight: 900; color: #ea580c; letter-spacing: 1.5px; font-size: 9px; margin-bottom: 4px; }
        .kabul div.c { padding: 2px 0; }
        .kabul div.c:before { content: '☐ '; font-size: 12px; color: #ea580c; }
        .ozet { width: 66mm; background: #0f172a; color: #ffffff; border-radius: 8px; padding: 9px 12px; }
        .ozet table { width: 100%; border-collapse: collapse; }
        .ozet td { padding: 2px 0; }
        .ozet td.d { text-align: right; font-weight: 800; }
        .ozet tr.b td { font-size: 15px; color: #5eead4; border-top: 1px solid #334155; padding-top: 4px; }
        .notlar { margin: 10px 0 0 0; padding-left: 15px; color: #475569; font-size: 9.5px; line-height: 1.5; }
        .imza { display: flex; gap: 12px; margin-top: 14px; }
        .imza div { flex: 1; border-top: 2px solid #0f766e; padding-top: 3px; font-size: 8px; letter-spacing: 1.5px; color: #64748b; font-weight: 700; }
        .imza b { display: block; color: #0f172a; font-size: 9.5px; letter-spacing: 0; }`,
    body: `
<div class="sayfa">
    <div class="bant">
        <div class="marka">
            ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff"/><path d="M32 17 Q32 12 36 13 Q39 14 38 17 Q37 19 34 20 L32 22 L15 37 Q13 40 17 40 H47 Q51 40 49 37 L32 22" fill="none" stroke="#0f766e" stroke-width="3.2" stroke-linejoin="round"/><circle cx="32" cy="48" r="3" fill="#f97316"/></svg>', 54, 54)}
            <div>${each(DSUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div>`)}</div>
        </div>
        <div>
            <h1><span>${t('E-İRSALİYE · ŞUBE SEVKİ')}</span>${t('Mağaza Sevkiyatı')}</h1>
            <div class="no">${v('$f/cbc:ID')}</div>
        </div>
    </div>
    <div class="rota">
        <div class="hat">
            <div class="durak"><div class="d"></div><div class="k">${t('ÇIKIŞ')}</div>${each(DSUP, `<b>${v('cac:PostalAddress/cbc:CitySubdivisionName')}${t(' / ')}${v('cac:PostalAddress/cbc:CityName')}</b>`)}${sevk}</div>
            <div class="durak ara"><div class="d"></div><div class="k">${t('TAŞIYICI')}</div>${each(`${DLV}/cac:CarrierParty`, `<b>${pName}</b>`)}${t('Plaka ')}${v(PLATE)}${t(' · ')}${sofor}</div>
            <div class="durak son"><div class="d"></div><div class="k">${t('VARIŞ · MAĞAZA')}</div>${each(DCUS, `<b>${pName}</b>${t('Mağaza no ')}${v("cac:PartyIdentification/cbc:ID[@schemeID='SUBENO']")}`)}</div>
        </div>
        ${qr(78)}
    </div>
    <div class="govde">
        <div class="bilgi">
            <div><div class="k">${t('Düzenleme')}</div><div class="v">${duzenleme}</div></div>
            <div><div class="k">${t('Senaryo / Tip')}</div><div class="v">${v('$f/cbc:ProfileID')}${t(' · ')}${v('$f/cbc:DespatchAdviceTypeCode')}</div></div>
            <div><div class="k">${t('İkmal Emri')}</div><div class="v">${v('$f/cac:OrderReference/cbc:ID')}</div></div>
            <div><div class="k">${t('Mühür No')}</div><div class="v">${v(`${doc('MUHUR')}/cbc:ID`)}</div></div>
            <div><div class="k">${t('Taşıma Birimi')}</div><div class="v">${v(`${SH}/cbc:TotalTransportHandlingUnitQuantity`)}${t(' birim')}</div></div>
        </div>
        <div class="ettn">${t('ETTN ')}${v('$f/cbc:UUID')}${t(' · Teslimat: ')}${each(DA, aAddr)}</div>
        ${grup('ASKILI', 'ASKILI ÜRÜN', aski)}
        ${grup('KATLI', 'KATLI ÜRÜN', katli)}
        <div class="alt">
            <div class="kabul">
                <div class="k">${t('MAĞAZA KABUL KONTROLÜ')}</div>
                <div class="c">${t('Araç mühürü sağlam — no ')}<b>${v(`${doc('MUHUR')}/cbc:ID`)}</b></div>
                <div class="c">${t('Taşıma birimi sayısı tutuyor (')}${v(`${SH}/cbc:TotalTransportHandlingUnitQuantity`)}${t(')')}</div>
                <div class="c">${t('Askılı ürünlerde ezilme / leke yok')}</div>
                <div class="c">${t('Koliler hasarsız, bant sağlam')}</div>
            </div>
            <div class="ozet">
                <table>
                    <tr><td>${t('Askılı')}</td><td class="d">${int(`sum(${DL}[${P('SEVK')}='ASKILI']/cbc:DeliveredQuantity)`)}${t(' adet')}</td></tr>
                    <tr><td>${t('Katlı')}</td><td class="d">${int(`sum(${DL}[${P('SEVK')}='KATLI']/cbc:DeliveredQuantity)`)}${t(' adet')}</td></tr>
                    <tr><td>${t('Brüt ağırlık')}</td><td class="d">${num(`${SH}/cbc:GrossWeightMeasure`, '###.##0,0')}${t(' kg')}</td></tr>
                    <tr class="b"><td>${t('Toplam')}</td><td class="d">${int(`sum(${DL}/cbc:DeliveredQuantity)`)}${t(' adet')}</td></tr>
                </table>
            </div>
        </div>
        <ul class="notlar">${each('$f/cbc:Note', `<li>${v('.')}</li>`)}</ul>
        <div class="imza">
            <div>${t('DAĞITIM PLANLAMA')}<b>${v(CONTACT)}</b></div>
            <div>${t('TAŞIYICI / ŞOFÖR')}<b>${sofor}</b></div>
            <div>${t('MAĞAZA MÜDÜRÜ')}<b>${t('Ad Soyad / İmza')}</b></div>
        </div>
    </div>
</div>`,
});

/* ================================================================ 4. Tabakhane → saraciye (daktilo) */

const gediz = {
    ids: [['VKN', '3920184756']],
    name: 'Gediz Deri Sanayi ve Ticaret Ltd. Şti.',
    addr: adr('Menemen Deri OSB 4. Sokak', '18', 'Menemen', 'İzmir', '35660'),
    vd: 'Menemen', tel: '0232 833 14 70', mail: 'sevk@gedizderi.com.tr',
};
const kosele = {
    ids: [['VKN', '5810273946']],
    name: 'Kösele Saraciye ve Ayakkabı San. Ltd. Şti.',
    addr: adr('Maltepe Mah. Aymakoop 4. Blok', '214', 'Zeytinburnu', 'İstanbul', '34010'),
    vd: 'Merter', tel: '0212 482 66 14', mail: 'deri@koseleayakkabi.com.tr',
};
const i4 = {
    id: 'deri-tabakhane-irsaliye',
    xml: despatch({
        comment: `Hazır şablon örneği: Tabakhaneden ayakkabı-saraciye imalatçısına deri sevkiyatı — TEMELIRSALIYE · SEVK, miktar ft² (FTK).
            Satırda PARTI, KALITE (A / B), KALINLIK, ADET (deri sayısı), BALYA ve RENK ek tanımları.`,
        id: 'GDZ2026000000317', date: '2026-10-08', time: '08:05:00',
        notes: ['Deriler nem kaybını önlemek için streç naylonla sarılmış, balyalar numaralandırılmıştır.', 'Ölçümler elektronik ölçüm makinesinde yapılmıştır; ±%1 tolerans.'],
        order: { id: 'KSL-D-26-077', date: '2026-09-30' },
        docs: [{ id: 'GDZ-OL-2610-17', date: '2026-10-07', type: 'OLCUMRAPORU', desc: 'Deri ölçüm raporu' }],
        supplier: gediz, contact: 'Ömer Gediz', customer: kosele,
        ship: {
            id: 'GDZ-S-0317', kg: 920, goods: 4, units: 9, plate: '35 GDZ 186',
            driver: ['Ramazan', 'Öztürk', '45612378904'], addr: kosele.addr, date: '2026-10-08', time: '08:30:00',
        },
        lines: [
            { name: 'Wet-Blue Büyükbaş Deri', desc: 'Kromlu yarı mamul, tıraşlı', unit: 'FTK', qty: 4200, props: { PARTI: 'WB-2609-14', KALITE: 'A', KALINLIK: '1,4–1,6 mm', ADET: '96', BALYA: '3' } },
            { name: 'Crust Dana Deri', desc: 'Boyasız, yağlanmış', unit: 'FTK', qty: 2650, props: { PARTI: 'CR-2609-03', KALITE: 'A/B', KALINLIK: '1,2–1,4 mm', ADET: '58', BALYA: '2' } },
            { name: 'Finisajlı Nubuk Deri', desc: 'Zımparalı, su itici · Taba', unit: 'FTK', qty: 1800, props: { PARTI: 'NB-2609-07', KALITE: 'A', KALINLIK: '1,6–1,8 mm', ADET: '40', BALYA: '2', RENK: 'Taba' } },
            { name: 'Astarlık Keçi Derisi', desc: 'Bitkisel tabaklı, doğal', unit: 'FTK', qty: 2400, props: { PARTI: 'KC-2609-21', KALITE: 'B', KALINLIK: '0,6–0,8 mm', ADET: '400', BALYA: '2' } },
        ],
    }),
};
i4.xslt = xslt({
    root: 'DespatchAdvice',
    title: 'Deri Sevk İrsaliyesi',
    comment: `Gediz Deri — tabakhaneden saraciyeye deri sevk e-İrsaliyesi. Daktilo konsepti: eskimiş sepya kâğıt, delgeç delikleri,
        Courier daktilo yazısı, eşittir çizgileriyle çerçeve, kesikli çizgili tablo; parti / kalite / kalınlık / deri adedi / balya / ft²
        sütunları, kırmızı "SEVK EDİLDİ" ve mavi "KALİTE KONTROL" ıslak damgaları.`,
    css: `
        body { background: #57534e; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #292524; }
        .sayfa { background: #f3e9d2; background-image: radial-gradient(ellipse at 80% 12%, rgba(255,255,255,.45), transparent 55%), radial-gradient(ellipse at 15% 90%, rgba(120,84,40,.12), transparent 50%); padding: 13mm 14mm 12mm 22mm; }
        .delik { position: absolute; left: 7mm; width: 15px; height: 15px; border-radius: 50%; background: #57534e; box-shadow: inset 1px 1px 2px rgba(0,0,0,.6); }
        .leke { position: absolute; right: 18mm; bottom: 34mm; width: 70px; height: 70px; border-radius: 50%; border: 5px solid rgba(120,72,30,.12); box-shadow: inset 0 0 6px rgba(120,72,30,.12); }
        .ust { text-align: center; line-height: 1.45; }
        .ust .unvan { font-size: 15px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; }
        .cizgi { overflow: hidden; white-space: nowrap; letter-spacing: 1px; color: #57534e; margin: 3px 0; }
        h1 { margin: 6px 0 2px 0; font-size: 21px; letter-spacing: 8px; text-align: center; font-weight: 700; }
        h1 + div { text-align: center; letter-spacing: 2px; font-size: 10px; }
        .kafa { display: flex; gap: 16px; margin-top: 10px; align-items: flex-start; }
        .kafa table { border-collapse: collapse; }
        .kafa td { padding: 1px 6px 1px 0; vertical-align: top; }
        .kafa td.k { white-space: nowrap; }
        .kafa .alici { flex: 1; border: 1px dashed #57534e; padding: 6px 9px; line-height: 1.45; }
        .kafa .alici .k { text-decoration: underline; letter-spacing: 2px; }
        table.liste { width: 100%; border-collapse: collapse; margin-top: 12px; }
        table.liste th { border-top: 2px solid #292524; border-bottom: 1px dashed #292524; padding: 4px 5px; text-align: left; font-weight: 700; font-size: 10px; letter-spacing: 1px; }
        table.liste td { border-bottom: 1px dashed #a8a29e; padding: 5px 5px; vertical-align: top; }
        table.liste td.s, table.liste th.s { text-align: right; }
        table.liste td small { display: block; color: #57534e; font-size: 9.5px; }
        table.liste tr.top td { border-top: 2px solid #292524; border-bottom: 3px double #292524; font-weight: 700; }
        .kalite { display: inline-block; border: 1.5px solid #292524; border-radius: 50%; min-width: 24px; text-align: center; font-weight: 700; padding: 1px 3px; }
        .damga { position: absolute; font-family: 'Arial Black', Arial, sans-serif; text-align: center; mix-blend-mode: multiply; }
        .kirmizi { left: 34mm; top: -34px; width: 112px; height: 112px; border-radius: 50%; border: 4px double rgba(185,28,28,.78); color: rgba(185,28,28,.78); transform: rotate(-16deg); font-size: 8.5px; letter-spacing: 1px; padding-top: 27px; line-height: 1.35; }
        .kirmizi b { display: block; font-size: 12px; letter-spacing: 0; white-space: nowrap; border-top: 2px solid rgba(185,28,28,.6); border-bottom: 2px solid rgba(185,28,28,.6); margin: 3px 8px; }
        .mavi { left: 100mm; width: 150px; border: 3px solid rgba(30,64,175,.7); color: rgba(30,64,175,.7); transform: rotate(4deg); padding: 4px 6px; font-size: 10px; letter-spacing: 1.5px; line-height: 1.3; }
        .mavi b { display: block; font-size: 14px; }
        .alt { display: flex; gap: 16px; margin-top: 14px; }
        .alt .not { flex: 1; line-height: 1.55; }
        .alt .not div:before { content: '- '; }
        .arac { width: 70mm; border: 1px dashed #57534e; padding: 6px 9px; line-height: 1.55; }
        .imza { display: flex; justify-content: space-between; margin-top: 26px; }
        .imza > div { width: 60mm; text-align: center; position: relative; }
        .imza .c { border-top: 1px solid #292524; padding-top: 3px; margin-top: 22px; }
        .ettn { margin-top: 12px; font-size: 9px; color: #57534e; display: flex; justify-content: space-between; align-items: flex-end; }`,
    body: `
<div class="sayfa">
    <div class="delik" style="top:70mm"></div><div class="delik" style="top:150mm"></div><div class="delik" style="top:230mm"></div>
    <div class="leke"></div>
    <div class="ust">
        ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M14 8 Q32 16 50 8 Q54 20 48 26 Q56 34 52 48 Q40 44 32 56 Q24 44 12 48 Q8 34 16 26 Q10 20 14 8 Z" fill="none" stroke="#292524" stroke-width="2.4"/><text x="32" y="38" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="15" fill="#292524">GD</text></svg>', 52, 52)}
        ${each(DSUP, `<div class="unvan">${pName}</div><div>${pAddr()}</div><div>${pTax()}</div><div>${pContact()}</div>`)}
    </div>
    <div class="cizgi">${t('='.repeat(110))}</div>
    <h1>${t('SEVK İRSALİYESİ')}</h1>
    <div>${t('( e-İrsaliye — ')}${v('$f/cbc:ProfileID')}${t(' / ')}${v('$f/cbc:DespatchAdviceTypeCode')}${t(' )')}</div>
    <div class="cizgi">${t('='.repeat(110))}</div>
    <div class="kafa">
        <table>
            <tr><td class="k">${t('İrsaliye No ..:')}</td><td><b>${v('$f/cbc:ID')}</b></td></tr>
            <tr><td class="k">${t('Düzenleme ....:')}</td><td>${duzenleme}</td></tr>
            <tr><td class="k">${t('Fiili Sevk ...:')}</td><td>${sevk}</td></tr>
            <tr><td class="k">${t('Sipariş ......:')}</td><td>${v('$f/cac:OrderReference/cbc:ID')}${t(' / ')}${dt('$f/cac:OrderReference/cbc:IssueDate')}</td></tr>
            <tr><td class="k">${t('Ölçüm Raporu .:')}</td><td>${v(`${doc('OLCUMRAPORU')}/cbc:ID`)}</td></tr>
        </table>
        <div class="alici">
            <div class="k">${t('SAYIN')}</div>
            ${each(DCUS, `<b>${pName}</b><br/>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}
        </div>
        ${qr(84)}
    </div>
    <table class="liste">
        <tr><th>${t('S.')}</th><th>${t('PARTİ NO')}</th><th>${t('CİNSİ')}</th><th>${t('KAL.')}</th><th>${t('KALINLIK')}</th><th class="s">${t('DERİ')}</th><th class="s">${t('BALYA')}</th><th class="s">${t('MİKTAR')}</th></tr>
        ${each(DL, `<tr>
            <td>${v('cbc:ID')}${t('.')}</td>
            <td><b>${v(P('PARTI'))}</b></td>
            <td><b>${v('cac:Item/cbc:Name')}</b><small>${v('cac:Item/cbc:Description')}</small></td>
            <td><span class="kalite">${v(P('KALITE'))}</span></td>
            <td>${v(P('KALINLIK'))}</td>
            <td class="s">${int(P('ADET'))}${t(' ad.')}</td>
            <td class="s">${v(P('BALYA'))}</td>
            <td class="s"><b>${int('cbc:DeliveredQuantity')}</b>${t(' ')}${unit('cbc:DeliveredQuantity/@unitCode')}</td>
        </tr>`)}
        <tr class="top"><td></td><td colspan="4">${t('TOPLAM  (')}${v(`count(${DL})`)}${t(' kalem)')}</td><td class="s">${int(`sum(${DL}/${P('ADET')})`)}${t(' ad.')}</td><td class="s">${int(`sum(${DL}/${P('BALYA')})`)}</td><td class="s">${int(`sum(${DL}/cbc:DeliveredQuantity)`)}${t(' ft²')}</td></tr>
    </table>
    <div class="damga mavi" style="margin-top:6px;position:relative;left:auto;display:inline-block;margin-left:95mm">${t('KALİTE KONTROL')}<b>${t('✓ ONAYLI')}</b>${t('Ölçüm: ')}${v(`${doc('OLCUMRAPORU')}/cbc:ID`)}</div>
    <div class="alt">
        <div class="not"><b>${t('AÇIKLAMALAR:')}</b>${each('$f/cbc:Note', `<div>${v('.')}</div>`)}</div>
        <div class="arac">
            ${t('Plaka .....: ')}<b>${v(PLATE)}</b><br/>
            ${t('Şoför .....: ')}${sofor}<br/>
            ${t('T.C. ......: ')}${v(`${DRV}/cbc:NationalityID`)}<br/>
            ${t('Brüt Ağ. ..: ')}${num(`${SH}/cbc:GrossWeightMeasure`, '###.##0,0')}${t(' kg')}<br/>
            ${t('Teslim ....: ')}${each(DA, `${v('cbc:CitySubdivisionName')}${t(' / ')}${v('cbc:CityName')}`)}
        </div>
    </div>
    <div class="imza">
        <div>${t('TESLİM EDEN')}<div class="c">${v(CONTACT)}</div>
            <div class="damga kirmizi">${t('GEDİZ DERİ')}<b>${t('SEVK EDİLDİ')}</b>${dt(`${DLV}/cac:Despatch/cbc:ActualDespatchDate`)}<br/>${t('MENEMEN')}</div></div>
        <div>${t('TESLİM ALAN')}<div class="c">${t('Ad Soyad / İmza / Kaşe')}</div></div>
    </div>
    <div class="ettn"><span>${t('ETTN: ')}${v('$f/cbc:UUID')}</span><span>${t('Sayfa 1/1')}</span></div>
</div>`,
});

/* ================================================================ 5. Kesimhane → dikim atölyesi (teknik çizim) */

const dogruKesim = {
    ids: [['VKN', '2840193756']],
    name: 'Doğru Kesim Tekstil Ltd. Şti.',
    addr: adr('Merter Keresteciler Sitesi Fatih Cad.', '33', 'Güngören', 'İstanbul', '34173'),
    vd: 'Merter', tel: '0212 504 77 33', mail: 'kesim@dogrukesim.com.tr',
};
const ustaEller = {
    ids: [['TCKN', '41827365910']],
    name: 'Usta Eller Dikim Atölyesi',
    person: ['Hatice', 'Demir'],
    addr: adr('Yenibosna Merkez Mah. 29 Ekim Cad.', '9/2', 'Bahçelievler', 'İstanbul', '34197'),
    vd: 'Bahçelievler', tel: '0532 640 18 27',
};
const i5 = {
    id: 'kesimhane-dikim-irsaliye',
    xml: despatch({
        comment: `Hazır şablon örneği: Kesimhaneden fason dikim atölyesine kesilmiş parça (demet) sevkiyatı — TEMELIRSALIYE · SEVK; ana firma
            BuyerCustomerParty. Satırda PASTAL, KAT (pastal kat adedi), DEMET, KUMAS, PARCA (parça listesi) ve BEDEN-xx dağılımı.`,
        id: 'DKS2026000001263', date: '2026-10-08', time: '11:20:00',
        notes: ['Demetler beden etiketli ve numaralıdır; parça sayımı demet fişine göre yapılmalıdır.', 'Fason dikim sonrası ürünler Atlas Konfeksiyon\'a teslim edilecektir.'],
        order: { id: 'ATL-FS-26-0412', date: '2026-10-01' },
        docs: [{ id: 'KF-26-118/120', date: '2026-10-07', type: 'KESIMFOYU', desc: 'Kesim föyü' }],
        supplier: dogruKesim, contact: 'Cem Aydın (Kesim Şefi)', customer: ustaEller, buyer: atlas,
        ship: {
            id: 'DKS-SVK-1263', kg: 168, goods: 3, units: 42, plate: '34 DKS 052',
            driver: ['Yusuf', 'Bayram', '52918374620'], addr: ustaEller.addr, date: '2026-10-08', time: '11:40:00',
        },
        lines: [
            { name: 'Erkek Polo Yaka Tişört — Kesilmiş Parça', model: 'ATL-PL-2611', unit: 'C62', qty: 960, props: { PASTAL: 'P-118', KAT: '80', DEMET: '16', KUMAS: 'Pike %100 pamuk · Lacivert', PARCA: 'Ön beden ×1|Arka beden ×1|Kol ×2|Yaka ×1|Pat ×2', ...beden({ S: 160, M: 320, L: 320, XL: 160 }) } },
            { name: 'Kadın Basic Elbise — Kesilmiş Parça', model: 'ATL-EL-2622', unit: 'C62', qty: 480, props: { PASTAL: 'P-119', KAT: '60', DEMET: '12', KUMAS: 'Viskon dokuma · Kiremit', PARCA: 'Ön ×1|Arka ×2|Kol ×2|Yaka pervazı ×1', ...beden({ S: 120, M: 160, L: 120, XL: 80 }) } },
            { name: 'Çocuk Eşofman Altı — Kesilmiş Parça', model: 'ATL-CE-2630', unit: 'C62', qty: 720, props: { PASTAL: 'P-120', KAT: '90', DEMET: '14', KUMAS: 'İki iplik · Haki', PARCA: 'Ön paça ×2|Arka paça ×2|Bel ×1|Cep ×2', ...beden({ '4-5Y': 180, '6-7Y': 240, '8-9Y': 180, '10-11Y': 120 }) } },
        ],
    }),
};
const kalip = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120" fill="none" stroke="#e0f2fe" stroke-width="1.3">
    <path d="M14 22 L40 12 Q50 22 60 12 L86 22 L80 42 L68 38 L68 108 L32 108 L32 38 L20 42 Z"/>
    <path d="M40 12 Q50 30 60 12" stroke-dasharray="3 2"/>
    <path d="M100 30 L122 20 L144 30 L138 100 L106 100 Z"/>
    <path d="M154 40 Q172 26 190 40 L198 78 L146 78 Z"/>
    <path d="M150 92 H206 V104 H150 Z"/>
    <path d="M50 52 V96 M122 38 V90 M172 46 V72" stroke-dasharray="6 3" stroke="#7dd3fc"/>
    <path d="M32 116 H68 M32 113 V119 M68 113 V119" stroke="#7dd3fc"/>
    <text x="50" y="70" fill="#e0f2fe" stroke="none" font-family="Consolas" font-size="7" text-anchor="middle">ÖN</text>
    <text x="122" y="64" fill="#e0f2fe" stroke="none" font-family="Consolas" font-size="7" text-anchor="middle">ARKA</text>
    <text x="172" y="66" fill="#e0f2fe" stroke="none" font-family="Consolas" font-size="7" text-anchor="middle">KOL ×2</text>
    <text x="178" y="101" fill="#e0f2fe" stroke="none" font-family="Consolas" font-size="7" text-anchor="middle">YAKA</text>
</svg>`);
i5.xslt = xslt({
    root: 'DespatchAdvice',
    title: 'Kesim Sevk İrsaliyesi',
    comment: `Doğru Kesim — kesimhaneden fason dikim atölyesine kesilmiş parça sevk e-İrsaliyesi. Teknik çizim (blueprint) konsepti:
        lacivert milimetrik zemin, açık mavi çizgiler, kalıp parçaları çizimi; her satır pastal no / kat / demet künyeli panel, beden
        tablosu (BEDEN-xx), parça listesi (PARCA, | ile ayrılmış) ve sağ altta mühendislik antet kutusu.`,
    css: `
        body { background: #082f49; font-family: Consolas, 'Lucida Console', monospace; font-size: 10.5px; color: #e0f2fe; }
        .sayfa { background-color: #0b3a66; background-image: linear-gradient(rgba(186,230,253,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(186,230,253,.13) 1px, transparent 1px), linear-gradient(rgba(186,230,253,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(186,230,253,.05) 1px, transparent 1px); background-size: 10mm 10mm, 10mm 10mm, 2mm 2mm, 2mm 2mm; padding: 9mm 10mm 10mm 10mm; }
        .cerceve { border: 2px solid #bae6fd; padding: 8px 10px 10px 10px; min-height: 276mm; position: relative; }
        .cerceve:before { content: ''; position: absolute; inset: 3px; border: 1px solid rgba(186,230,253,.4); pointer-events: none; }
        .ust { display: flex; gap: 12px; align-items: flex-start; }
        .marka { display: flex; gap: 10px; align-items: center; }
        .unvan { font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
        .adr { font-size: 8.5px; color: #7dd3fc; line-height: 1.5; }
        h1 { margin: 6px 0 0 0; font-family: 'Arial Black', Arial, sans-serif; font-size: 28px; letter-spacing: 3px; color: transparent; -webkit-text-stroke: 1.1px #e0f2fe; line-height: 1; }
        h1 + div { font-size: 9px; letter-spacing: 4px; color: #7dd3fc; margin-top: 3px; }
        .cizim { margin-left: auto; border: 1px dashed #7dd3fc; padding: 4px; text-align: center; font-size: 7.5px; color: #7dd3fc; letter-spacing: 1px; }
        .qr { background: #ffffff; padding: 4px; }
        .taraf { display: flex; gap: 8px; margin-top: 10px; }
        .taraf > div { flex: 1; border: 1px solid #7dd3fc; padding: 5px 8px; line-height: 1.5; font-size: 9.5px; position: relative; }
        .taraf .k { position: absolute; top: -7px; left: 8px; background: #0b3a66; padding: 0 5px; font-size: 7.5px; letter-spacing: 2px; color: #fbbf24; font-weight: 700; }
        .taraf .ad { font-weight: 700; font-size: 11px; color: #ffffff; }
        .panel { border: 1.5px solid #e0f2fe; margin-top: 12px; }
        .pbas { display: flex; background: rgba(224,242,254,.12); border-bottom: 1.5px solid #e0f2fe; }
        .pbas > div { padding: 4px 9px; border-right: 1px solid rgba(224,242,254,.5); }
        .pbas .k { font-size: 7px; letter-spacing: 1.5px; color: #7dd3fc; }
        .pbas .v { font-size: 13px; font-weight: 700; color: #fbbf24; }
        .pbas .ad { flex: 1; border-right: 0; }
        .pbas .ad .v { color: #ffffff; font-size: 11.5px; }
        .pgovde { display: flex; }
        .pgovde .sol { flex: 1; padding: 6px 9px; }
        .kumas { color: #7dd3fc; margin-bottom: 5px; }
        table.beden { border-collapse: collapse; }
        table.beden td { border: 1px solid #7dd3fc; padding: 2px 9px; text-align: center; }
        table.beden tr:first-child td { color: #7dd3fc; font-size: 8.5px; }
        table.beden td.b { text-align: left; color: #fbbf24; font-size: 8px; letter-spacing: 1px; }
        table.beden tr + tr td { font-weight: 700; font-size: 11.5px; color: #ffffff; }
        .parca { margin-top: 6px; }
        .parca span { display: inline-block; border: 1px dashed #bae6fd; padding: 1px 6px; margin: 2px 4px 0 0; font-size: 9px; }
        .pgovde .sag { width: 40mm; border-left: 1.5px solid #e0f2fe; padding: 6px 9px; text-align: right; }
        .pgovde .sag .k { font-size: 7.5px; letter-spacing: 1.5px; color: #7dd3fc; }
        .pgovde .sag .v { font-family: 'Arial Black', Arial, sans-serif; font-size: 22px; color: #ffffff; line-height: 1.1; }
        .pgovde .sag .f { font-size: 8.5px; color: #bae6fd; }
        .alt { display: flex; gap: 10px; margin-top: 12px; align-items: flex-end; }
        .alt .not { flex: 1; font-size: 9.5px; line-height: 1.55; border-left: 3px solid #fbbf24; padding-left: 8px; }
        table.antet { border-collapse: collapse; width: 98mm; background: rgba(8,47,73,.55); }
        table.antet td { border: 1.5px solid #e0f2fe; padding: 3px 6px; vertical-align: top; }
        table.antet .k { display: block; font-size: 6.5px; letter-spacing: 1.5px; color: #7dd3fc; }
        table.antet b { color: #ffffff; font-size: 10px; }
        table.antet td.buyuk b { font-family: 'Arial Black', Arial, sans-serif; font-size: 13px; color: #fbbf24; letter-spacing: 1px; }`,
    body: `
<div class="sayfa">
    <div class="cerceve">
        <div class="ust">
            <div>
                <div class="marka">
                    ${logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#e0f2fe" stroke-width="2.4"><circle cx="18" cy="46" r="8"/><circle cx="46" cy="46" r="8"/><path d="M23 40 L50 8 M41 40 L14 8"/><circle cx="32" cy="25" r="2" fill="#fbbf24" stroke="none"/></svg>', 52, 52)}
                    <div>${each(DSUP, `<div class="unvan">${pName}</div><div class="adr">${pAddr()}<br/>${pTax()}<br/>${pContact()}</div>`)}</div>
                </div>
                <h1>${t('KESİM SEVK')}</h1>
                <div>${t('E-İRSALİYE · KESİLMİŞ PARÇA / DEMET')}</div>
            </div>
            <div class="cizim"><img alt="" width="220" height="120" src="${kalip}"/><div>${t('KALIP PARÇALARI · ÖLÇEKSİZ')}</div></div>
            <div class="qr">${qr(82)}</div>
        </div>
        <div class="taraf">
            <div><div class="k">${t('TESLİM ALAN · FASON DİKİM')}</div>${each(DCUS, `<div class="ad">${pName}</div>${v("concat(cac:Person/cbc:FirstName,' ',cac:Person/cbc:FamilyName)")}<br/>${pAddr()}<br/>${pTax()}<br/>${pContact()}`)}</div>
            <div><div class="k">${t('ANA FİRMA')}</div>${each(BUY, `<div class="ad">${pName}</div>${pAddr()}<br/>${pTax()}`)}<br/>${t('Sipariş ')}${v('$f/cac:OrderReference/cbc:ID')}</div>
            <div style="flex:.75"><div class="k">${t('ARAÇ')}</div>${t('Plaka ')}<b>${v(PLATE)}</b><br/>${sofor}<br/>${t('TCKN ')}${v(`${DRV}/cbc:NationalityID`)}<br/>${t('Brüt ')}${num(`${SH}/cbc:GrossWeightMeasure`, '###.##0,0')}${t(' kg')}</div>
        </div>
        ${each(DL, `<div class="panel">
            <div class="pbas">
                <div><div class="k">${t('PASTAL')}</div><div class="v">${v(P('PASTAL'))}</div></div>
                <div><div class="k">${t('KAT')}</div><div class="v">${v(P('KAT'))}</div></div>
                <div><div class="k">${t('DEMET')}</div><div class="v">${v(P('DEMET'))}</div></div>
                <div><div class="k">${t('MODEL')}</div><div class="v">${v('cac:Item/cbc:ModelName')}</div></div>
                <div class="ad"><div class="k">${t('ÜRÜN')}</div><div class="v">${v('cac:Item/cbc:Name')}</div></div>
            </div>
            <div class="pgovde">
                <div class="sol">
                    <div class="kumas">${t('KUMAŞ: ')}${v(P('KUMAS'))}</div>
                    <table class="beden">
                        <tr><td class="b">${t('BEDEN')}</td>${each(PS('BEDEN-'), `<td>${v("substring-after(@schemeID,'-')")}</td>`)}</tr>
                        <tr><td class="b">${t('ADET')}</td>${each(PS('BEDEN-'), `<td>${int('.')}</td>`)}</tr>
                    </table>
                    <div class="parca">${t('PARÇA / ADET BAŞINA: ')}<xsl:call-template name="parca"><xsl:with-param name="s" select="${P('PARCA')}"/></xsl:call-template></div>
                </div>
                <div class="sag">
                    <div class="k">${t('KESİLEN')}</div>
                    <div class="v">${int('cbc:DeliveredQuantity')}</div>
                    <div class="f">${unit('cbc:DeliveredQuantity/@unitCode')}${t(' · ')}${v(P('KAT'))}${t(' kat × ')}${v(`cbc:DeliveredQuantity div ${P('KAT')}`)}${t(' adet/kat')}</div>
                </div>
            </div>
        </div>`)}
        <div class="alt">
            <div class="not">
                <b>${t('NOTLAR')}</b>${each('$f/cbc:Note', `<div>${t('› ')}${v('.')}</div>`)}
                <div style="margin-top:4px;color:#7dd3fc">${t('ETTN ')}${v('$f/cbc:UUID')}</div>
            </div>
            <table class="antet">
                <tr><td colspan="2" class="buyuk"><span class="k">${t('İRSALİYE NO')}</span><b>${v('$f/cbc:ID')}</b></td><td><span class="k">${t('SENARYO')}</span><b>${v('$f/cbc:ProfileID')}</b></td></tr>
                <tr><td><span class="k">${t('DÜZENLEME')}</span><b>${duzenleme}</b></td><td><span class="k">${t('FİİLİ SEVK')}</span><b>${sevk}</b></td><td><span class="k">${t('KESİM FÖYÜ')}</span><b>${v(`${doc('KESIMFOYU')}/cbc:ID`)}</b></td></tr>
                <tr><td><span class="k">${t('HAZIRLAYAN')}</span><b>${v(CONTACT)}</b></td><td><span class="k">${t('TOPLAM PARÇA')}</span><b>${int(`sum(${DL}/cbc:DeliveredQuantity)`)}${t(' adet')}</b></td><td><span class="k">${t('DEMET')}</span><b>${int(`sum(${DL}/${P('DEMET')})`)}</b></td></tr>
                <tr><td colspan="2"><span class="k">${t('TESLİM ALAN — İMZA')}</span><b>${t(' ')}</b><br/><br/></td><td><span class="k">${t('SAYFA')}</span><b>${t('1 / 1')}</b></td></tr>
            </table>
        </div>
    </div>
</div>`,
    templates: `
    <xsl:template name="parca">
        <xsl:param name="s"/>
        <xsl:choose>
            <xsl:when test="contains($s,'|')"><span><xsl:value-of select="substring-before($s,'|')"/></span><xsl:call-template name="parca"><xsl:with-param name="s" select="substring-after($s,'|')"/></xsl:call-template></xsl:when>
            <xsl:when test="string-length($s) &gt; 0"><span><xsl:value-of select="$s"/></span></xsl:when>
        </xsl:choose>
    </xsl:template>`,
});

export default [i1, i2, i3, i4, i5];
