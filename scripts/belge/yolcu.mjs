// e-Yolcu Listesi tasarımları (ebilet:eYolcuListesi). Düzenleyen unvanı XML'de olmadığından XSLT değişkenidir.
import { iff, logo, svg, t, v } from '../moda/lib.mjs';
import { yolcuListesi } from './xml.mjs';
import { BL, YL, ebiletXslt } from './kit.mjs';

const AD = ['Ahmet Yılmaz', 'Elif Kaya', 'Mehmet Demir', 'Zeynep Şahin', 'Mustafa Çelik', 'Ayşe Yıldız', 'Emre Aydın', 'Fatma Öztürk', 'Burak Arslan',
    'Merve Doğan', 'Hasan Kılıç', 'Esra Aslan', 'Murat Çetin', 'Gamze Kara', 'Serkan Koç', 'Büşra Kurt', 'Okan Özdemir', 'Derya Şimşek', 'Kerem Polat',
    'Selin Erdoğan', 'Tolga Güneş', 'İrem Aksoy', 'Caner Bulut', 'Nazlı Keskin', 'Barış Yavuz', 'Ceren Tekin', 'Onur Uçar', 'Hande Özkan',
    'Yusuf Taş', 'Sibel Avcı', 'Kaan Yalçın', 'Pınar Karaca', 'Volkan Acar', 'Dilan Turan', 'Erkan Sarı', 'Gizem Bozkurt'];
/** Tohumdan tekrarlanabilir 11 haneli kimlik no. */
const tc = (i, s = 7) => String(10000000000 + ((i * 7919 + s * 104729) * 26544357) % 89999999999).slice(0, 11);
/** [koltuk, ad, kimlik, tutar] dizisi: koltuklar, ad kaydırması, fiyat (sayı ya da koltuğa göre işlev). */
const yolcular = (koltuklar, kayma, fiyat, seed) => koltuklar.map((k, i) => [k, AD[(i + kayma) % AD.length], tc(i + 1, seed), typeof fiyat === 'function' ? fiyat(k, i) : fiyat]);

const tablo = (cols = ['sira', 'koltuk', 'ad', 'kimlikTur', 'kimlik', 'bilet', 'tutar']) => YL.koltuklar((r) => `<tr>${cols.map((c) => `<td class="c-${c}">${r[c]}</td>`).join('')}</tr>`);
const issuerBlock = `<b>${BL.unvan}</b><div>${BL.adres}</div><div>${t('VKN ')}${BL.vkn}${t(' · ')}${BL.vd}${t(' V.D.')}${iff("$duzenleyenTelefon!=''", `${t(' · ')}${BL.tel}`)}</div>`;

/* ------------------------------------------------------------- 1. Uluslararası otobüs */

const ulus = {
    id: 'uluslararasi-otobus-yolcu-listesi',
    sector: 'yolcu-tasima',
    accent: '#1e3a8a',
    name: 'Uluslararası Otobüs e-Yolcu Listesi',
    description: 'Balkan hattında uluslararası otobüs seferi için e-Yolcu Listesi: pasaport lacivertinde başlık, damga görünümlü sefer mührü, T.C. / pasaport kimlik rozetli yolcu tablosu ve yabancı yolcu sayacı.',
    tags: ['Uluslararası', 'Pasaport', 'Kimlik rozeti', 'Sefer mührü', 'Balkan hattı'],
    xml: yolcuListesi({
        comment: 'Hazır şablon örneği: Uluslararası Otobüs e-Yolcu Listesi (İstanbul → Sofya). T.C. vatandaşları TCKN, yabancı yolcular pasaport no ile.',
        vkn: '1830462975', start: '2026-10-09', signed: '2026-10-09T06:40:00+03:00',
        trips: [{
            no: 'BLK2026000003318', time: '07:00', date: '2026-10-09', from: 'İstanbul Esenler Otogarı · Uluslararası Peron 4', sefer: 'IST-SOF-0700', plate: '34BLK318',
            seats: [
                [3, 'Elif Arslan', tc(1, 3), 1450], [4, 'Georgi Ivanov', 'BG3841257', 1450], [5, 'Maria Petrova', 'BG7719023', 1450], [8, 'Hasan Çelik', tc(2, 3), 1450],
                [9, 'Ayten Çelik', tc(3, 3), 1300], [12, 'Stefan Dimitrov', 'BG5502841', 1450], [15, 'Lukas Weber', 'C4XK7Z912', 1450], [16, 'Anna Weber', 'C4XK7Z955', 1450],
                [19, 'Selim Yazıcı', tc(4, 3), 1450], [22, 'Ivana Koleva', 'BG6610238', 1450], [23, 'Mihai Popescu', '053881274', 1450], [27, 'Gülşen Tunç', tc(5, 3), 1300],
            ],
        }],
    }),
    xslt: ebiletXslt({
        title: 'e-Yolcu Listesi',
        comment: 'Uluslararası Otobüs e-Yolcu Listesi: pasaport lacivert başlık, sefer mührü ve kimlik rozetli yolcu tablosu.',
        issuer: { unvan: 'Balkan Ekspres Uluslararası Turizm A.Ş.', adres: 'Esenler Otogarı Uluslararası Peronlar 4-6, Esenler / İstanbul', vd: 'Esenler', tel: '(212) 658 44 18' },
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #0f172a; background: #fff; }
            .bas { background: #1e3a8a; color: #e0e7ff; padding: 10mm 14mm 15mm; position: relative; overflow: hidden; }
            .bas::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(45deg, rgba(255,255,255,.04) 0 2mm, transparent 2mm 4mm); }
            .bas > * { position: relative; } .bas .ust { display: flex; justify-content: space-between; align-items: center; }
            .bas h1 { margin: 6mm 0 0; font-size: 21pt; color: #fff; letter-spacing: 1px; } .bas h1 small { display: block; font-size: 9pt; letter-spacing: 4px; color: #c7d2fe; font-weight: 400; margin-top: 1mm; }
            .bas .is { font-size: 8.3pt; color: #c7d2fe; text-align: right; } .bas .is b { color: #fff; font-size: 10pt; display: block; }
            .damga { position: absolute; right: 16mm; bottom: 3mm; width: 31mm; height: 31mm; border-radius: 50%; border: .8mm solid #fbbf24; color: #fbbf24; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(-12deg); font-weight: 800; font-size: 7pt; text-align: center; letter-spacing: 1px; }
            .damga b { font-size: 10.5pt; } .damga span { font-size: 6.3pt; }
            .ic { padding: 8mm 14mm 0; }
            .bilgi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border: 1px solid #c7d2fe; border-radius: 3mm; overflow: hidden; }
            .bilgi div { padding: 3mm 4mm; border-right: 1px solid #e0e7ff; } .bilgi div:last-child { border-right: 0; } .bilgi i { display: block; font-style: normal; font-size: 7.4pt; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; } .bilgi b { font-size: 10.5pt; }
            .bilgi .gen { grid-column: span 2; border-top: 1px solid #e0e7ff; } .bilgi .gen2 { grid-column: span 2; border-top: 1px solid #e0e7ff; }
            table.y { width: 100%; border-collapse: collapse; margin-top: 7mm; }
            table.y th { text-align: left; font-size: 7.6pt; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; padding: 2mm; border-bottom: 2px solid #1e3a8a; }
            table.y td { padding: 2.4mm 2mm; border-bottom: 1px solid #e0e7ff; } .c-koltuk { font-weight: 800; color: #1e3a8a; } .c-tutar { text-align: right; font-variant-numeric: tabular-nums; } .c-bilet { font-family: Consolas, monospace; font-size: 8pt; color: #475569; }
            .c-kimlikTur { font-size: 7.6pt; } table.y th:last-child { text-align: right; }
            .alt { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-top: 6mm; }
            .alt div { background: #eef2ff; border-radius: 3mm; padding: 4mm; } .alt i { display: block; font-style: normal; font-size: 7.4pt; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; } .alt b { font-size: 13pt; } .alt .h { background: #1e3a8a; color: #fff; } .alt .h i { color: #c7d2fe; }
            .imza { margin-top: 7mm; font-size: 7.6pt; color: #64748b; border-top: 1px solid #e0e7ff; padding-top: 3mm; word-break: break-all; }
        `,
        body: `<div class="sayfa">
    <div class="bas"><div class="ust">${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><rect x="2" y="8" width="44" height="24" rx="6" fill="#fbbf24"/><rect x="8" y="13" width="10" height="8" rx="1" fill="#1e3a8a"/><rect x="21" y="13" width="10" height="8" rx="1" fill="#1e3a8a"/><rect x="34" y="13" width="8" height="8" rx="1" fill="#1e3a8a"/><circle cx="13" cy="33" r="4" fill="#fff"/><circle cx="36" cy="33" r="4" fill="#fff"/><text x="54" y="22" font-family="Segoe UI,Arial" font-weight="800" font-size="15" fill="#fff">BALKAN</text><text x="55" y="33" font-family="Segoe UI,Arial" font-size="8" letter-spacing="3" fill="#fbbf24">EKSPRES</text></svg>`, 160, 40)}
        <div class="is">${issuerBlock}</div></div>
        <h1>${t('e-YOLCU LİSTESİ')}<small>${t('INTERNATIONAL PASSENGER MANIFEST')}</small></h1>
        ${YL.listeler(`<div class="damga">${t('SEFER')}<b>${YL.sefer}</b><span>${YL.tarih}${t(' · ')}${YL.saat}</span></div>`)}</div>
    ${YL.listeler(`<div class="ic">
        <div class="bilgi"><div><i>${t('Liste No')}</i><b>${YL.no}</b></div><div><i>${t('Sefer Tarihi')}</i><b>${YL.tarih}</b></div><div><i>${t('Hareket Saati')}</i><b>${YL.saat}</b></div><div><i>${t('Araç Plakası')}</i><b>${YL.plaka}</b></div>
            <div class="gen"><i>${t('Hareket Noktası')}</i><b>${YL.nokta}</b></div><div class="gen2"><i>${t('Liste Tarih Aralığı / UUID')}</i><b style="font-size:8.5pt">${BL.aralik}${t(' · ')}${BL.uuid}</b></div></div>
        <table class="y"><tr><th>${t('#')}</th><th>${t('Koltuk')}</th><th>${t('Ad Soyad')}</th><th>${t('Kimlik')}</th><th>${t('No')}</th><th>${t('Bilet No')}</th><th>${t('Tutar')}</th></tr>${tablo()}</table>
        <div class="alt"><div><i>${t('Yolcu')}</i><b>${YL.sayi}</b></div><div><i>${t('Yabancı uyruklu (pasaport)')}</i><b>${v('count(ebilet:koltukListesi/ebilet:koltuk[ebilet:pasaportNo])')}</b></div><div class="h"><i>${t('Toplam hasılat')}</i><b>${YL.hasilat}</b></div></div>
        <div class="imza">${t('Özet değer: ')}${YL.ozet}</div></div>`)}
</div>`,
    }),
};

/* ------------------------------------------------------------- 2. VIP gece seferi (2+1 koltuk planı) */

const gece = {
    id: 'vip-gece-seferi-yolcu-listesi',
    sector: 'yolcu-tasima',
    accent: '#312e81',
    name: 'VIP Gece Seferi e-Yolcu Listesi',
    description: '2+1 VIP otobüsün gece seferi için e-Yolcu Listesi: gece mavisi yıldızlı başlık, 30 koltuklu 2+1 koltuk planı ve doluluk oranı, yolcu tablosu, taşıtı işleten komisyonu ve KDV kartı.',
    tags: ['VIP 2+1', 'Gece seferi', 'Koltuk planı', 'Doluluk', 'İşleten komisyonu'],
    xml: yolcuListesi({
        comment: 'Hazır şablon örneği: VIP Gece Seferi e-Yolcu Listesi (Ankara → İzmir, 2+1 30 koltuk). Taşıtı işleten mükellef ve komisyonu bilgili.',
        vkn: '4207395186', start: '2026-10-10', signed: '2026-10-10T23:10:00+03:00',
        trips: [{
            no: 'GYT2026000012904', time: '23:30', date: '2026-10-10', from: 'Ankara AŞTİ · Peron 21', sefer: 'GY-2330-IZM', plate: '06GYT904',
            operator: ['5813027469', 0.10],
            seats: yolcular([1, 2, 3, 5, 6, 8, 9, 11, 12, 14, 16, 17, 19, 22, 23, 25, 28, 29], 4, (k) => (k % 3 === 0 ? 1290 : 1150), 11),
        }],
    }),
    xslt: ebiletXslt({
        title: 'e-Yolcu Listesi',
        comment: 'VIP Gece Seferi e-Yolcu Listesi: gece mavisi başlık, 2+1 koltuk planı, doluluk ve işleten komisyonu.',
        issuer: { unvan: 'Gece Yıldızı Turizm Taşımacılık A.Ş.', adres: 'AŞTİ Peron 21-23, Söğütözü, Çankaya / Ankara', vd: 'Maltepe', tel: '0850 460 23 30' },
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #1e1b4b; background: #fff; }
            .bas { background: radial-gradient(1px 1px at 20% 30%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 70% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 60%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 40% 70%, #c7d2fe 50%, transparent 51%), radial-gradient(1px 1px at 55% 45%, #fff 50%, transparent 51%), linear-gradient(160deg, #0b0a2a, #1e1b4b 60%, #312e81); color: #e0e7ff; padding: 10mm 14mm; display: flex; justify-content: space-between; align-items: center; }
            .bas h1 { margin: 0; font-size: 20pt; color: #fff; } .bas h1 small { display: block; font-size: 9pt; color: #a5b4fc; font-weight: 400; margin-top: 1mm; }
            .bas .ay { width: 16mm; height: 16mm; border-radius: 50%; box-shadow: inset -4mm -1mm 0 0 #fde68a; }
            .ic { padding: 7mm 14mm 0; display: grid; grid-template-columns: 1fr 44mm; gap: 8mm; }
            .duz { font-size: 8.3pt; color: #4338ca; } .duz b { color: #1e1b4b; font-size: 10pt; display: block; }
            .sefer { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-top: 5mm; }
            .sefer div { background: #eef2ff; border-radius: 3mm; padding: 3mm 4mm; } .sefer i { display: block; font-style: normal; font-size: 7.4pt; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; } .sefer b { font-size: 11pt; }
            .sefer .g { grid-column: span 3; }
            table.y { width: 100%; border-collapse: collapse; margin-top: 6mm; }
            table.y th { background: #1e1b4b; color: #e0e7ff; font-weight: 600; font-size: 7.6pt; padding: 1.8mm 2mm; text-align: left; } table.y th:last-child { text-align: right; }
            table.y td { padding: 1.8mm 2mm; border-bottom: 1px solid #eef2ff; } table.y tr:nth-child(even) td { background: #f8f9ff; } .c-koltuk { font-weight: 800; color: #4338ca; } .c-tutar { text-align: right; } .c-bilet { font-family: Consolas, monospace; font-size: 7.8pt; }
            .plan { background: #1e1b4b; border-radius: 6mm 6mm 3mm 3mm; padding: 6mm 4mm 4mm; color: #c7d2fe; text-align: center; }
            .plan .on { font-size: 7pt; letter-spacing: 2px; margin-bottom: 3mm; }
            .izg { display: grid; grid-template-columns: 7mm 5mm 7mm 7mm; gap: 1.6mm; justify-content: center; }
            .kt { height: 7mm; border-radius: 1.5mm 1.5mm .6mm .6mm; background: #312e81; color: #818cf8; font-size: 7pt; display: flex; align-items: center; justify-content: center; }
            .kt:nth-child(3n+1) { grid-column: 1; } .kt:nth-child(3n+2) { grid-column: 3; } .kt:nth-child(3n) { grid-column: 4; }
            .kt.dolu { background: #fbbf24; color: #1e1b4b; font-weight: 800; }
            .dol { margin-top: 4mm; font-size: 8pt; } .dol b { display: block; font-size: 16pt; color: #fbbf24; }
            .kom { margin-top: 5mm; background: #eef2ff; border-radius: 3mm; padding: 4mm; font-size: 8.3pt; } .kom h3 { margin: 0 0 2mm; font-size: 7.6pt; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; } .kom div { display: flex; justify-content: space-between; padding: .8mm 0; }
            .hs { margin-top: 5mm; background: #312e81; color: #fff; border-radius: 3mm; padding: 4mm; } .hs i { display: block; font-style: normal; font-size: 7.4pt; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px; } .hs b { font-size: 15pt; }
            .oz { margin: 6mm 14mm 0; font-size: 7.4pt; color: #6366f1; word-break: break-all; }
        `,
        body: `<div class="sayfa">
    <div class="bas"><div>${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 40"><path d="M20 4 L24 15 L36 15 L26 22 L30 34 L20 27 L10 34 L14 22 L4 15 L16 15 Z" fill="#fde68a"/><text x="44" y="22" font-family="Segoe UI,Arial" font-weight="800" font-size="14" fill="#fff">GECE YILDIZI</text><text x="45" y="33" font-family="Segoe UI,Arial" font-size="7.5" letter-spacing="3" fill="#a5b4fc">VIP TURİZM</text></svg>`, 150, 40)}
        <h1 style="margin-top:4mm">${t('e-Yolcu Listesi')}<small>${t('VIP 2+1 · gece seferi')}</small></h1></div><div class="ay"></div></div>
    ${YL.listeler(`<div class="ic"><div><div class="duz">${issuerBlock}</div>
        <div class="sefer"><div><i>${t('Sefer No')}</i><b>${YL.sefer}</b></div><div><i>${t('Tarih · Saat')}</i><b>${YL.tarih}${t(' ')}${YL.saat}</b></div><div><i>${t('Plaka')}</i><b>${YL.plaka}</b></div>
            <div class="g"><i>${t('Hareket Noktası · Liste No')}</i><b>${YL.nokta}${t(' · ')}${YL.no}</b></div></div>
        <table class="y"><tr><th>${t('Koltuk')}</th><th>${t('Yolcu')}</th><th>${t('Kimlik')}</th><th>${t('Bilet No')}</th><th>${t('Tutar')}</th></tr>${tablo(['koltuk', 'ad', 'kimlik', 'bilet', 'tutar'])}</table></div>
        <div><div class="plan"><div class="on">${t('ÖN · ŞOFÖR')}</div><div class="izg">${YL.izgara(30)}</div><div class="dol">${t('Doluluk')}<b>${t('%')}${v('round(count(ebilet:koltukListesi/ebilet:koltuk) div 30 * 100)')}</b>${YL.sayi}${t(' / 30 koltuk')}</div></div>
            <div class="hs"><i>${t('Toplam hasılat')}</i><b>${YL.hasilat}</b></div>
            ${YL.isleten(`<div class="kom"><h3>${t('Taşıtı işleten')}</h3><div><span>${t('VKN')}</span><b>${YL.islVkn}</b></div><div><span>${t('Komisyon')}</span><b>${YL.komisyon}</b></div><div><span>${t('Komisyon KDV')}</span><b>${YL.komKdv}</b></div></div>`)}</div></div>
        <div class="oz">${t('Liste: ')}${BL.aralik}${t(' · UUID ')}${BL.uuid}${t(' · Özet ')}${YL.ozet}</div>`)}
</div>`,
    }),
};

/* ------------------------------------------------------------- 3. İlçe minibüsü (günlük, çok seferli) */

const minibus = {
    id: 'ilce-minibus-yolcu-listesi',
    sector: 'yolcu-tasima',
    accent: '#0f766e',
    name: 'İlçe Minibüsü Günlük e-Yolcu Listesi',
    description: 'İl–ilçe hattında çalışan minibüs kooperatifinin aynı güne ait birden çok seferini tek belgede listeleyen e-Yolcu Listesi: sade form başlığı, sefer başına kompakt kart ve tablo, günlük toplam yolcu ve hasılat.',
    tags: ['Minibüs', 'Çok seferli', 'Günlük liste', 'Kooperatif', 'Kompakt form'],
    xml: yolcuListesi({
        comment: 'Hazır şablon örneği: İlçe Minibüsü Günlük e-Yolcu Listesi (Karaman → Ermenek, aynı gün iki sefer; 16 koltuklu minibüs).',
        vkn: '9031726485', start: '2026-10-08', signed: '2026-10-08T18:00:00+03:00',
        trips: [
            { no: 'GKS2026000020711', time: '07:15', date: '2026-10-08', from: 'Karaman Otogarı · İlçe Peronu 12', sefer: 'KRM-ERM-0715', plate: '70GK418', seats: yolcular([1, 2, 4, 5, 7, 9, 12, 15], 9, 240, 21) },
            { no: 'GKS2026000020712', time: '12:30', date: '2026-10-08', from: 'Karaman Otogarı · İlçe Peronu 12', sefer: 'KRM-ERM-1230', plate: '70GK418', seats: yolcular([1, 3, 6, 8, 10, 14], 17, 240, 22) },
        ],
    }),
    xslt: ebiletXslt({
        title: 'e-Yolcu Listesi',
        comment: 'İlçe Minibüsü Günlük e-Yolcu Listesi: sade form başlığı, sefer başına kompakt kart ve günlük toplam.',
        issuer: { unvan: 'Göksu Ermenek Yolcu Taşıma Kooperatifi', adres: 'Karaman Otogarı İlçe Peronları No:12, Merkez / Karaman', vd: 'Karaman', tel: '(338) 213 40 12' },
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #134e4a; background: #fff; padding: 12mm 14mm; }
            .bas { display: grid; grid-template-columns: auto 1fr auto; gap: 6mm; align-items: center; border: 1.5px solid #0f766e; border-radius: 2mm; padding: 4mm 5mm; }
            .bas h1 { margin: 0; font-size: 15pt; } .bas .duz { font-size: 8.3pt; color: #3f6f6a; } .bas .duz b { color: #134e4a; font-size: 9.5pt; display: block; }
            .bas .gun { text-align: center; background: #0f766e; color: #fff; border-radius: 2mm; padding: 2.5mm 4mm; } .bas .gun i { display: block; font-style: normal; font-size: 7pt; letter-spacing: 1px; color: #99f6e4; } .bas .gun b { font-size: 12pt; }
            .sef { margin-top: 6mm; border: 1px solid #99f6e4; border-radius: 2mm; overflow: hidden; }
            .sef .k { display: grid; grid-template-columns: repeat(5, auto); justify-content: space-between; gap: 3mm; background: #f0fdfa; padding: 3mm 4mm; border-bottom: 1px solid #99f6e4; }
            .sef .k i { display: block; font-style: normal; font-size: 7.2pt; color: #0d9488; text-transform: uppercase; letter-spacing: .8px; } .sef .k b { font-size: 10pt; }
            table.y { width: 100%; border-collapse: collapse; } table.y th { font-size: 7.4pt; color: #0d9488; text-transform: uppercase; letter-spacing: .8px; text-align: left; padding: 1.8mm 4mm; border-bottom: 1px solid #ccfbf1; }
            table.y td { padding: 1.6mm 4mm; border-bottom: 1px solid #f0fdfa; } .c-tutar { text-align: right; } table.y th:last-child { text-align: right; } .c-bilet { font-family: Consolas, monospace; font-size: 7.8pt; color: #3f6f6a; }
            .sef .t { display: flex; justify-content: flex-end; gap: 8mm; padding: 2.5mm 4mm; font-size: 8.5pt; background: #fafffe; } .sef .t b { color: #0f766e; }
            .gt { margin-top: 6mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
            .gt div { border: 1.5px solid #0f766e; border-radius: 2mm; padding: 3.5mm 4mm; } .gt i { display: block; font-style: normal; font-size: 7.4pt; color: #0d9488; text-transform: uppercase; letter-spacing: 1px; } .gt b { font-size: 14pt; }
            .gt .h { background: #0f766e; color: #fff; } .gt .h i { color: #99f6e4; }
            .uuid { margin-top: 6mm; font-size: 7.4pt; color: #3f6f6a; }
        `,
        body: `<div class="sayfa">
    <div class="bas">${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><rect x="2" y="6" width="56" height="24" rx="5" fill="#0f766e"/><rect x="7" y="10" width="9" height="8" rx="1" fill="#ccfbf1"/><rect x="19" y="10" width="9" height="8" rx="1" fill="#ccfbf1"/><rect x="31" y="10" width="9" height="8" rx="1" fill="#ccfbf1"/><rect x="44" y="10" width="10" height="14" rx="1" fill="#ccfbf1"/><circle cx="14" cy="31" r="4.5" fill="#134e4a"/><circle cx="46" cy="31" r="4.5" fill="#134e4a"/></svg>`, 64, 40)}
        <div><h1>${t('Günlük e-Yolcu Listesi')}</h1><div class="duz">${issuerBlock}</div></div>
        <div class="gun"><i>${t('LİSTE TARİHİ')}</i><b>${BL.aralik}</b><i style="margin-top:1mm">${v('count(/ebilet:eYolcuListesi/ebilet:yolcuListesi)')}${t(' SEFER')}</i></div></div>
    ${YL.listeler(`<div class="sef"><div class="k"><div><i>${t('Sefer')}</i><b>${YL.sefer}</b></div><div><i>${t('Saat')}</i><b>${YL.saat}</b></div><div><i>${t('Plaka')}</i><b>${YL.plaka}</b></div><div><i>${t('Hareket Noktası')}</i><b>${YL.nokta}</b></div><div><i>${t('Liste No')}</i><b>${YL.no}</b></div></div>
        <table class="y"><tr><th>${t('#')}</th><th>${t('Koltuk')}</th><th>${t('Ad Soyad')}</th><th>${t('Kimlik')}</th><th>${t('Bilet No')}</th><th>${t('Tutar')}</th></tr>${tablo(['sira', 'koltuk', 'ad', 'kimlik', 'bilet', 'tutar'])}</table>
        <div class="t"><span>${t('Yolcu: ')}<b>${YL.sayi}${t(' / 16')}</b></span><span>${t('Hasılat: ')}<b>${YL.hasilat}</b></span></div></div>`)}
    <div class="gt"><div><i>${t('Günlük sefer')}</i><b>${v('count(/ebilet:eYolcuListesi/ebilet:yolcuListesi)')}</b></div><div><i>${t('Toplam yolcu')}</i><b>${v('count(/ebilet:eYolcuListesi/ebilet:yolcuListesi/ebilet:koltukListesi/ebilet:koltuk)')}</b></div>
        <div class="h"><i>${t('Günlük hasılat')}</i><b>${v("format-number(sum(/ebilet:eYolcuListesi/ebilet:yolcuListesi/ebilet:toplamHasilat), '###.##0,00', 'edesign-tr')")}${t(' TL')}</b></div></div>
    <div class="uuid">${t('UUID ')}${BL.uuid}</div>
</div>`,
    }),
};

/* ------------------------------------------------------------- 4. Kültür turu (2+2 plan, broşür) */

const SILUET = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 30" preserveAspectRatio="none"><path d="M0 30 V22 Q8 20 12 12 Q14 6 16 12 Q20 20 28 21 Q34 18 38 8 Q40 2 42 8 Q46 18 54 22 Q70 24 80 18 Q86 10 88 4 Q90 0 92 4 Q94 12 100 18 Q120 24 140 20 Q146 12 148 6 Q150 2 152 6 Q156 16 164 20 Q180 24 190 16 Q194 10 196 16 Q200 22 210 22 V30 Z" fill="#c2410c" opacity=".85"/><path d="M0 30 V26 Q40 22 80 26 T160 25 T210 26 V30 Z" fill="#7c2d12"/></svg>`;

const tur = {
    id: 'kultur-turu-yolcu-listesi',
    sector: 'turizm',
    accent: '#c2410c',
    name: 'Kültür Turu Otobüsü e-Yolcu Listesi',
    description: 'Seyahat acentesinin Kapadokya kültür turu otobüsü için e-Yolcu Listesi: kiremit-kum broşür başlığı, peri bacası silueti, 46 koltuklu 2+2 plan, iki sütunlu yolcu listesi ve kiralık aracı işleten komisyonu.',
    tags: ['Kültür turu', 'Seyahat acentesi', '2+2 koltuk planı', 'Broşür', 'İşleten komisyonu'],
    xml: yolcuListesi({
        comment: 'Hazır şablon örneği: Kültür Turu Otobüsü e-Yolcu Listesi (İstanbul → Kapadokya, 2+2 46 koltuk). Otobüs kiralık; taşıtı işleten komisyonu bilgili.',
        vkn: '7520384196', start: '2026-10-16', signed: '2026-10-16T06:00:00+03:00',
        trips: [{
            no: 'PRB2026000000614', time: '06:30', date: '2026-10-16', from: 'İstanbul Kadıköy Rıhtım · Tur buluşma noktası', sefer: 'PRB-KPD-0630', plate: '34PRB46',
            operator: ['3405927816', 0.12],
            seats: yolcular([1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 15, 16, 17, 18, 21, 22, 25, 26, 29, 30, 33, 34, 37, 38], 13, (k) => (k <= 8 ? 3150 : 2850), 31),
        }],
    }),
    xslt: ebiletXslt({
        title: 'e-Yolcu Listesi',
        comment: 'Kültür Turu Otobüsü e-Yolcu Listesi: kiremit-kum broşür başlığı, 2+2 koltuk planı ve iki sütunlu yolcu listesi.',
        issuer: { unvan: 'Peri Bacası Turizm Seyahat Acentası Ltd. Şti.', adres: 'Mecidiyeköy Mahallesi Büyükdere Caddesi No:91, Şişli / İstanbul', vd: 'Mecidiyeköy', tel: '(212) 356 46 46' },
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #431407; background: #fffaf3; }
            .bas { position: relative; height: 62mm; background: linear-gradient(180deg, #fdba74 0%, #fed7aa 55%, #fff7ed 100%); overflow: hidden; padding: 9mm 14mm; }
            .bas::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 24mm; background: url("${svg(SILUET)}") bottom / 100% 100% no-repeat; }
            .bas .ust { display: flex; justify-content: space-between; align-items: flex-start; position: relative; }
            .bas h1 { margin: 5mm 0 0; font-family: Georgia, serif; font-size: 25pt; color: #7c2d12; position: relative; z-index: 1; } .bas h1 small { display: block; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #9a3412; letter-spacing: 3px; margin-top: 1mm; }
            .bas .duz { font-size: 8pt; color: #7c2d12; text-align: right; max-width: 80mm; } .bas .duz b { display: block; font-size: 9.5pt; }
            .ic { padding: 6mm 14mm 0; display: grid; grid-template-columns: 1fr 48mm; gap: 7mm; }
            .rozet { display: flex; flex-wrap: wrap; gap: 2mm; } .rozet span { background: #fff; border: 1px solid #fdba74; border-radius: 10mm; padding: 1.2mm 3.5mm; font-size: 8.3pt; } .rozet b { color: #c2410c; }
            .liste { columns: 2; column-gap: 6mm; margin-top: 5mm; }
            .yo { break-inside: avoid; display: grid; grid-template-columns: 8mm 1fr auto; gap: 2mm; align-items: center; padding: 1.6mm 0; border-bottom: 1px dotted #fdba74; font-size: 8.5pt; }
            .yo .no { background: #c2410c; color: #fff; border-radius: 50%; width: 7mm; height: 7mm; display: flex; align-items: center; justify-content: center; font-size: 7.4pt; font-weight: 700; }
            .yo small { display: block; color: #9a3412; font-size: 7.2pt; } .yo .tt { font-size: 8pt; font-weight: 600; }
            .plan { background: #fff; border: 1px solid #fed7aa; border-radius: 6mm 6mm 2mm 2mm; padding: 5mm 3mm 4mm; text-align: center; }
            .plan .on { font-size: 7pt; letter-spacing: 2px; color: #9a3412; margin-bottom: 2.5mm; }
            .izg { display: grid; grid-template-columns: 6.5mm 6.5mm 4mm 6.5mm 6.5mm; gap: 1.3mm; justify-content: center; }
            .kt { height: 6mm; border-radius: 1.2mm 1.2mm .5mm .5mm; background: #ffedd5; color: #c2410c; font-size: 6.4pt; display: flex; align-items: center; justify-content: center; }
            .kt:nth-child(4n+1) { grid-column: 1; } .kt:nth-child(4n+2) { grid-column: 2; } .kt:nth-child(4n+3) { grid-column: 4; } .kt:nth-child(4n) { grid-column: 5; }
            .kt.dolu { background: #c2410c; color: #fff; font-weight: 700; }
            .ozet { margin-top: 4mm; background: #7c2d12; color: #ffedd5; border-radius: 3mm; padding: 4mm; font-size: 8pt; } .ozet b { display: block; font-size: 14pt; color: #fff; margin: .5mm 0 2mm; }
            .kom { margin-top: 3mm; border: 1px dashed #c2410c; border-radius: 3mm; padding: 3mm 4mm; font-size: 8pt; } .kom div { display: flex; justify-content: space-between; padding: .5mm 0; }
            .oz { margin: 6mm 14mm 0; font-size: 7.2pt; color: #9a3412; word-break: break-all; }
        `,
        body: `<div class="sayfa">
    <div class="bas"><div class="ust">${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 40"><path d="M6 36 Q10 20 14 12 Q16 6 18 12 Q22 20 26 36 Z" fill="#7c2d12"/><circle cx="16" cy="9" r="3.5" fill="#c2410c"/><text x="34" y="22" font-family="Georgia,serif" font-weight="700" font-size="15" fill="#7c2d12">Peri Bacası</text><text x="35" y="33" font-family="Segoe UI,Arial" font-size="7.5" letter-spacing="2.5" fill="#9a3412">TURİZM · SEYAHAT</text></svg>`, 150, 40)}
            <div class="duz">${issuerBlock}</div></div>
        <h1>${t('Kapadokya Kültür Turu')}<small>${t('e-YOLCU LİSTESİ')}</small></h1></div>
    ${YL.listeler(`<div class="ic"><div>
        <div class="rozet"><span>${t('Sefer ')}<b>${YL.sefer}</b></span><span>${t('Hareket ')}<b>${YL.tarih}${t(' ')}${YL.saat}</b></span><span>${t('Plaka ')}<b>${YL.plaka}</b></span><span>${t('Liste ')}<b>${YL.no}</b></span><span>${t('Buluşma ')}<b>${YL.nokta}</b></span></div>
        <div class="liste">${YL.koltuklar((r) => `<div class="yo"><span class="no">${r.koltuk}</span><span>${r.ad}<small>${r.kimlik}${t(' · ')}${r.bilet}</small></span><span class="tt">${r.tutar}</span></div>`)}</div></div>
        <div><div class="plan"><div class="on">${t('ÖN · REHBER')}</div><div class="izg">${YL.izgara(46)}</div></div>
            <div class="ozet">${t('Katılımcı')}<b>${YL.sayi}${t(' kişi')}</b>${t('Toplam hasılat')}<b>${YL.hasilat}</b>${t('Kişi başı ortalama ')}${YL.ortalama}</div>
            ${YL.isleten(`<div class="kom"><b>${t('Kiralık araç — işleten')}</b><div><span>${t('VKN')}</span><span>${YL.islVkn}</span></div><div><span>${t('Komisyon')}</span><span>${YL.komisyon}</span></div><div><span>${t('KDV')}</span><span>${YL.komKdv}</span></div></div>`)}</div></div>
        <div class="oz">${t('Liste tarihi ')}${BL.aralik}${t(' · UUID ')}${BL.uuid}${t(' · Özet değer ')}${YL.ozet}</div>`)}
</div>`,
    }),
};

/* ------------------------------------------------------------- 5. Havalimanı servisi (kalkış panosu) */

const servis = {
    id: 'havalimani-servis-yolcu-listesi',
    sector: 'yolcu-tasima',
    accent: '#eab308',
    name: 'Havalimanı Servisi e-Yolcu Listesi',
    description: 'Şehir merkezi – havalimanı servis otobüsü için e-Yolcu Listesi: siyah kalkış panosu başlığı, sarı paleta harfli sefer / saat / plaka hücreleri, pano satırı görünümlü yolcu tablosu ve doluluk çubuğu.',
    tags: ['Havalimanı servisi', 'Kalkış panosu', 'Midibüs', 'Doluluk çubuğu', 'Erken sefer'],
    xml: yolcuListesi({
        comment: 'Hazır şablon örneği: Havalimanı Servisi e-Yolcu Listesi (Taksim → İstanbul Havalimanı, 27 koltuklu midibüs).',
        vkn: '2864031759', start: '2026-10-11', signed: '2026-10-11T04:50:00+03:00',
        trips: [{
            no: 'HVR2026000041127', time: '05:00', date: '2026-10-11', from: 'Taksim Meydanı · Servis Durağı 2', sefer: 'HVR-IST-0500', plate: '34HVR127',
            seats: yolcular([1, 2, 4, 5, 6, 8, 11, 12, 14, 17, 18, 20, 23, 25, 26], 21, 395, 41),
        }],
    }),
    xslt: ebiletXslt({
        title: 'e-Yolcu Listesi',
        comment: 'Havalimanı Servisi e-Yolcu Listesi: siyah kalkış panosu, sarı paleta hücreleri ve pano satırı tablo.',
        issuer: { unvan: 'Havaray Servis Taşımacılık A.Ş.', adres: 'Cumhuriyet Mahallesi Taksim Caddesi No:3, Beyoğlu / İstanbul', vd: 'Beyoğlu', tel: '444 42 87' },
        css: `
            .sayfa { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #111; background: #fff; }
            .pano { background: #0a0a0a; color: #fde047; padding: 9mm 12mm 8mm; }
            .pano .ust { display: flex; justify-content: space-between; align-items: center; } .pano .ust .duz { font-size: 7.8pt; color: #a3a3a3; text-align: right; } .pano .ust .duz b { color: #fde047; font-size: 9pt; display: block; }
            .pano h1 { margin: 6mm 0 3mm; font-family: Consolas, monospace; font-size: 13pt; letter-spacing: 4px; color: #e5e5e5; font-weight: 400; }
            .hucre { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.4fr; gap: 2mm; }
            .hucre div { background: #171717; border-radius: 1mm; padding: 2mm 3mm; } .hucre i { display: block; font-style: normal; font-family: Consolas, monospace; font-size: 6.8pt; color: #737373; letter-spacing: 1.5px; }
            .hucre b { font-family: Consolas, monospace; font-size: 15pt; letter-spacing: 2px; background: repeating-linear-gradient(180deg, transparent 0 48%, #000 48% 52%, transparent 52% 100%); }
            .nokta { margin-top: 2mm; font-family: Consolas, monospace; font-size: 9pt; color: #d4d4d4; }
            .dl { display: flex; align-items: center; gap: 3mm; margin-top: 4mm; font-family: Consolas, monospace; font-size: 8pt; color: #a3a3a3; } .dl .c { flex: 1; height: 2.5mm; background: #262626; } .dl .c div { height: 100%; background: #fde047; }
            table.y { width: calc(100% - 24mm); margin: 6mm 12mm 0; border-collapse: separate; border-spacing: 0 1.2mm; font-family: Consolas, monospace; font-size: 8.6pt; }
            table.y th { text-align: left; font-size: 7pt; color: #737373; letter-spacing: 1.5px; font-weight: 400; padding: 0 2.5mm; } table.y th:last-child { text-align: right; }
            table.y td { background: #f5f5f4; padding: 2.2mm 2.5mm; } table.y td:first-child { border-left: 1.2mm solid #eab308; } .c-koltuk { font-weight: 700; } .c-tutar { text-align: right; } .c-ad { font-family: 'Segoe UI', Arial, sans-serif; text-transform: uppercase; font-weight: 600; }
            .alt { margin: 5mm 12mm 0; display: grid; grid-template-columns: 1fr 1fr 1.3fr; gap: 3mm; }
            .alt div { border: 1px solid #e7e5e4; padding: 3mm 4mm; } .alt i { display: block; font-style: normal; font-size: 7pt; color: #78716c; letter-spacing: 1.2px; font-family: Consolas, monospace; } .alt b { font-size: 13pt; }
            .alt .h { background: #0a0a0a; color: #fde047; border-color: #0a0a0a; } .alt .h i { color: #a3a3a3; }
            .oz { margin: 5mm 12mm 0; font-family: Consolas, monospace; font-size: 7pt; color: #78716c; word-break: break-all; }
        `,
        body: `<div class="sayfa">
    ${YL.listeler(`<div class="pano"><div class="ust">${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 40"><path d="M4 26 L30 18 L38 6 L42 8 L38 20 L50 22 L52 26 L36 26 L28 36 L24 34 L28 26 Z" fill="#fde047"/><text x="60" y="24" font-family="Consolas,monospace" font-weight="700" font-size="16" fill="#fde047">HAVARAY</text><text x="61" y="34" font-family="Consolas,monospace" font-size="7.5" letter-spacing="2" fill="#a3a3a3">SERVİS</text></svg>`, 150, 40)}
        <div class="duz">${issuerBlock}</div></div>
        <h1>${t('KALKIŞ / DEPARTURE · e-YOLCU LİSTESİ')}</h1>
        <div class="hucre"><div><i>${t('SEFER')}</i><b>${YL.sefer}</b></div><div><i>${t('SAAT')}</i><b>${YL.saat}</b></div><div><i>${t('TARİH')}</i><b>${YL.tarih}</b></div><div><i>${t('PLAKA')}</i><b>${YL.plaka}</b></div></div>
        <div class="nokta">${t('▶ ')}${YL.nokta}${t('  ·  LİSTE ')}${YL.no}</div>
        <div class="dl"><span>${t('DOLULUK')}</span><div class="c"><div><xsl:attribute name="style">width:<xsl:value-of select="round(count(ebilet:koltukListesi/ebilet:koltuk) div 27 * 100)"/>%</xsl:attribute></div></div><span>${YL.sayi}${t('/27')}</span></div></div>
    <table class="y"><tr><th>${t('KOLTUK')}</th><th>${t('YOLCU')}</th><th>${t('KİMLİK')}</th><th>${t('BİLET')}</th><th>${t('ÜCRET')}</th></tr>${tablo(['koltuk', 'ad', 'kimlik', 'bilet', 'tutar'])}</table>
    <div class="alt"><div><i>${t('YOLCU')}</i><b>${YL.sayi}</b></div><div><i>${t('ORTALAMA')}</i><b>${YL.ortalama}</b></div><div class="h"><i>${t('TOPLAM HASILAT')}</i><b>${YL.hasilat}</b></div></div>
    <div class="oz">${t('VKN ')}${BL.vkn}${t(' · UUID ')}${BL.uuid}${t(' · ÖZET ')}${YL.ozet}</div>`)}
</div>`,
    }),
};

/* ------------------------------------------------------------- 6. Bayram ek seferi (resmî manifesto) */

const bayram = {
    id: 'bayram-ek-sefer-yolcu-listesi',
    sector: 'yolcu-tasima',
    accent: '#374151',
    name: 'Bayram Ek Seferi Yolcu Manifestosu',
    description: 'Bayram yoğunluğunda konan ek sefer için yazıcı dostu siyah-beyaz e-Yolcu Listesi: resmî manifesto başlığı, sefer bilgi çizelgesi, 2+2 koltuk krokisi, numaralı yolcu cetveli, işleten komisyonu ve şoför / muavin / yazıhane imza kutuları.',
    tags: ['Ek sefer', 'Manifesto', '2+2 kroki', 'Yazıcı dostu', 'İmza kutuları'],
    xml: yolcuListesi({
        comment: 'Hazır şablon örneği: Bayram Ek Seferi Yolcu Manifestosu (İstanbul → Erzurum, 2+2 46 koltuk, ek sefer). Taşıtı işleten komisyonu bilgili.',
        vkn: '5108247396', start: '2026-11-26', signed: '2026-11-26T17:30:00+03:00',
        trips: [{
            no: 'PLD2026000051480', time: '18:00', date: '2026-11-26', from: 'İstanbul Esenler Otogarı · Peron 118 (ek sefer)', sefer: 'PLD-ERZ-1800-EK', plate: '25PLD148',
            operator: ['4027183659', 0.10],
            seats: yolcular([1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 13, 14, 15, 16, 18, 19, 21, 22, 23, 24, 26, 27, 29, 30, 31, 33, 35, 37, 38, 41, 42, 45], 2, 1650, 51),
        }],
    }),
    xslt: ebiletXslt({
        title: 'e-Yolcu Listesi',
        comment: 'Bayram Ek Seferi Yolcu Manifestosu: yazıcı dostu siyah-beyaz manifesto, 2+2 kroki ve imza kutuları.',
        issuer: { unvan: 'Palandöken Seyahat A.Ş.', adres: 'Esenler Otogarı Peron 116-118, Esenler / İstanbul', vd: 'Esenler', tel: '0850 225 25 25' },
        css: `
            .sayfa { font-family: Arial, Helvetica, sans-serif; font-size: 8.6pt; color: #111; background: #fff; padding: 10mm 12mm; }
            .bas { display: grid; grid-template-columns: auto 1fr auto; gap: 5mm; align-items: center; border-bottom: 2.5px solid #111; padding-bottom: 3mm; }
            .bas h1 { margin: 0; font-size: 15pt; letter-spacing: 1.5px; } .bas h1 small { display: block; font-size: 8pt; font-weight: 400; letter-spacing: 0; margin-top: .5mm; }
            .bas .ek { border: 2px solid #111; padding: 2mm 4mm; font-weight: 800; font-size: 11pt; letter-spacing: 2px; transform: rotate(-3deg); }
            .duz { font-size: 7.8pt; margin-top: 2mm; }
            .govde { display: grid; grid-template-columns: 1fr 42mm; gap: 6mm; margin-top: 4mm; }
            table.b { width: 100%; border-collapse: collapse; } table.b td { border: 1px solid #111; padding: 1.5mm 2.5mm; } table.b td:nth-child(odd) { background: #f3f4f6; font-weight: 700; width: 30mm; font-size: 7.6pt; }
            table.y { width: 100%; border-collapse: collapse; margin-top: 4mm; } table.y th { border: 1px solid #111; background: #111; color: #fff; font-size: 7.2pt; padding: 1.3mm 1.5mm; text-align: left; }
            table.y td { border: 1px solid #9ca3af; padding: .9mm 1.5mm; font-size: 7.9pt; } .c-sira, .c-koltuk { text-align: center; } .c-tutar { text-align: right; } .c-bilet { font-family: Consolas, monospace; font-size: 7.3pt; }
            .kroki { border: 1.5px solid #111; padding: 3mm 2mm; text-align: center; } .kroki .on { font-size: 6.8pt; letter-spacing: 1.5px; margin-bottom: 2mm; border-bottom: 1px solid #111; padding-bottom: 1mm; }
            .izg { display: grid; grid-template-columns: 6mm 6mm 3mm 6mm 6mm; gap: 1mm; justify-content: center; }
            .kt { height: 5.4mm; border: 1px solid #111; font-size: 6.2pt; display: flex; align-items: center; justify-content: center; }
            .kt:nth-child(4n+1) { grid-column: 1; } .kt:nth-child(4n+2) { grid-column: 2; } .kt:nth-child(4n+3) { grid-column: 4; } .kt:nth-child(4n) { grid-column: 5; }
            .kt.dolu { background: #111; color: #fff; font-weight: 700; }
            .ok { font-size: 7pt; margin-top: 2mm; text-align: left; } .ok span { display: inline-block; width: 3mm; height: 3mm; border: 1px solid #111; vertical-align: middle; margin-right: 1mm; } .ok span.d { background: #111; }
            .ozet { margin-top: 4mm; border: 1.5px solid #111; } .ozet div { display: flex; justify-content: space-between; padding: 1.4mm 2.5mm; border-bottom: 1px solid #d1d5db; font-size: 7.8pt; } .ozet div:last-child { border-bottom: 0; } .ozet .h { background: #111; color: #fff; font-weight: 700; }
            .imza { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-top: 6mm; } .imza div { border: 1px solid #111; height: 19mm; padding: 2mm; font-size: 7.4pt; font-weight: 700; position: relative; } .imza div span { position: absolute; left: 2mm; right: 2mm; bottom: 2mm; border-top: 1px dashed #111; font-weight: 400; text-align: center; padding-top: .8mm; }
            .oz { margin-top: 3mm; font-size: 6.8pt; color: #4b5563; word-break: break-all; }
        `,
        body: `<div class="sayfa">
    <div class="bas">${logo(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M2 42 L18 12 L26 26 L32 18 L46 42 Z" fill="#111"/><path d="M18 12 L22 19 L14 19 Z" fill="#fff"/></svg>`, 44, 44)}
        <div><h1>${t('YOLCU MANİFESTOSU')}<small>${t('e-Yolcu Listesi · ')}${BL.unvan}</small></h1><div class="duz">${BL.adres}${t(' · VKN ')}${BL.vkn}${t(' · ')}${BL.vd}${t(' V.D. · ')}${BL.tel}</div></div>
        <div class="ek">${t('EK SEFER')}</div></div>
    ${YL.listeler(`<div class="govde"><div>
        <table class="b"><tr><td>${t('Liste No')}</td><td>${YL.no}</td><td>${t('Sefer No')}</td><td>${YL.sefer}</td></tr>
            <tr><td>${t('Sefer Tarihi')}</td><td>${YL.tarih}</td><td>${t('Hareket Saati')}</td><td>${YL.saat}</td></tr>
            <tr><td>${t('Araç Plakası')}</td><td>${YL.plaka}</td><td>${t('Liste Aralığı')}</td><td>${BL.aralik}</td></tr>
            <tr><td>${t('Hareket Noktası')}</td><td colspan="3">${YL.nokta}</td></tr></table>
        <table class="y"><tr><th>${t('Sıra')}</th><th>${t('Koltuk')}</th><th>${t('Adı Soyadı')}</th><th>${t('Kimlik Türü')}</th><th>${t('Kimlik No')}</th><th>${t('Bilet No')}</th><th>${t('Ücret')}</th></tr>${tablo()}</table></div>
        <div><div class="kroki"><div class="on">${t('KOLTUK KROKİSİ · ÖN')}</div><div class="izg">${YL.izgara(46)}</div><div class="ok"><span class="d"></span>${t('dolu ')}<span></span>${t('boş')}</div></div>
            <div class="ozet"><div><span>${t('Yolcu')}</span><b>${YL.sayi}${t(' / 46')}</b></div><div><span>${t('Boş koltuk')}</span><b>${v('46 - count(ebilet:koltukListesi/ebilet:koltuk)')}</b></div>
                ${YL.isleten(`<div><span>${t('İşleten VKN')}</span><b>${YL.islVkn}</b></div><div><span>${t('Komisyon')}</span><b>${YL.komisyon}</b></div><div><span>${t('Komisyon KDV')}</span><b>${YL.komKdv}</b></div>`)}
                <div class="h"><span>${t('Hasılat')}</span><span>${YL.hasilat}</span></div></div></div></div>
        <div class="oz">${t('UUID ')}${BL.uuid}${t(' · Özet değer ')}${YL.ozet}</div>`)}
    <div class="imza"><div>${t('Şoför')}<span>${t('Ad soyad / imza')}</span></div><div>${t('Muavin')}<span>${t('Ad soyad / imza')}</span></div><div>${t('Yazıhane yetkilisi')}<span>${t('Kaşe / imza')}</span></div></div>
</div>`,
    }),
};

export default [ulus, gece, minibus, tur, servis, bayram];
