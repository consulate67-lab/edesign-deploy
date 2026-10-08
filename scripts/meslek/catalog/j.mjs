// J — Taşımacılık, Akaryakıt
export default [
    {
        code: 'J.01', sector: 'enerji', icon: 'fuel', c: ['#dc2626', '#fde047'], f: 'Yol Akaryakıt Petrol Ürünleri Ltd. Şti.', city: 'Ankara', slogan: 'Akaryakıt · LPG · elektrikli araç şarjı',
        why: 'Akaryakıt istasyonu bireysel satışlarda e-Arşiv, filo / kurumsal müşterilere aylık toplu e-Fatura düzenler. ÖTV (I) sayılı liste ürünlerinde rafineri / dağıtıcı aşamasında tahsil edilir; bayi faturasında ayrı ÖTV satırı yer almaz, ÖTV satış fiyatının içindedir. İstasyondaki elektrikli araç şarjı ENERJI profili, SARJ tipi ile faturalanır.',
        docs: [
            {
                k: 'arsiv', n: 'Pompa Satışı e-Arşiv (Plakalı)', w: 'Bireysel müşteriye benzin ve market satışı; plaka ve pompa bilgisi satırda.', lay: 'fis', pay: 'kart',
                l: [['Kurşunsuz benzin 95 oktan', 'LTR', 42.6, 51.2, 20, { PLAKA: '06 BKT 418', POMPA: '4' }], ['Cam suyu 3 lt', 'C62', 1, 120, 20]],
                r: [['EPDK', 'BAY/939-81/22418']],
            },
            {
                k: 'fatura', n: 'Filo Müşterisine Aylık Yakıt Faturası', w: 'Taşıt tanıma sistemiyle (TTS) yapılan aylık filo alımlarının araç bazlı toplu faturası.', lay: 'kurumsal', to: { f: 'Başkent Lojistik Taşımacılık A.Ş.', city: 'Ankara' }, pay: 'vade:30',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026 filo yakıt dönemi', '2026-09-30', '23:59:59'],
                l: [['Motorin (euro diesel)', 'LTR', 1840, 53.4, 20, { PLAKA: '06 BLT 101' }], ['Motorin (euro diesel)', 'LTR', 1615, 53.4, 20, { PLAKA: '06 BLT 102' }], ['Otogaz (LPG)', 'LTR', 420, 27.9, 20, { PLAKA: '06 BLT 214' }]],
                r: [['SOZLESME', 'FLT-2026-031', 'Filo yakıt sözleşmesi']],
            },
            {
                k: 'fatura/sarj', n: 'İstasyonda Elektrikli Araç Şarjı (ENERJI · SARJ)', w: 'Kurumsal müşterinin elektrikli aracına DC hızlı şarj; ENERJI profili, plaka alıcı kimliğinde.', lay: 'modern', to: { f: 'Yeşil Mobilite Araç Kiralama A.Ş.', city: 'Ankara' }, cusIds: [['PLAKA', '06 YMK 220']], pay: 'kart',
                l: [['DC hızlı şarj (120 kW)', 'KWH', 46.8, 11.9, 20, { SOKET: 'CCS2', ISTASYON: 'YOL-ANK-03' }]],
                r: [['SARJOTURUMU', 'S-2026-0918-7714']],
            },
        ],
    },
    {
        code: 'J.02', sector: 'lojistik', icon: 'circle-parking', c: ['#1d4ed8', '#bfdbfe'], f: 'Merkez Otopark ve Garaj İşletmesi', o: 'Selim Kaya', city: 'Ankara', slogan: 'Kapalı otopark · aylık abonelik · şarj',
        why: 'Otopark işletmesi saatlik / aylık abone bireysel müşterilere e-Arşiv, şirketlere e-Fatura düzenler; plaka belgede yer alır. Otoparktaki şarj ünitesinden anlık şarj ENERJI profili SARJANLIK tipiyle (PLAKA + ARACKIMLIKNO) faturalanır.',
        docs: [
            {
                k: 'arsiv', n: 'Aylık Otopark Aboneliği e-Arşiv', w: 'Bireysel aboneye aylık kapalı otopark bedeli; plaka ve dönem belgede.', lay: 'serit', pay: 'kart',
                per: ['2026-10-01', '00:00:00', 'Ekim 2026 abonelik', '2026-10-31', '23:59:59'],
                l: [['Aylık kapalı otopark aboneliği', 'MON', 1, 2400, 20, { PLAKA: '06 AKC 77' }]],
            },
            {
                k: 'fatura', n: 'Şirkete Toplu Otopark Kiralama Faturası', w: 'Şirketin 20 aracı için aylık rezerve otopark yeri kiralaması.', lay: 'kurumsal', to: { f: 'Kızılay Plaza Danışmanlık A.Ş.', city: 'Ankara' }, pay: 'vade:15',
                per: ['2026-10-01', '00:00:00', 'Ekim 2026', '2026-10-31', '23:59:59'],
                l: [['Rezerve otopark yeri (araç/ay)', 'C62', 20, 2100, 20], ['Vale hizmeti (aylık)', 'MON', 1, 6000, 20]],
            },
            {
                k: 'arsiv/sarjanlik', n: 'Otoparkta Anlık Araç Şarjı (ENERJI · SARJANLIK)', w: 'Bireysel müşterinin aracına AC şarj; plaka ve araç kimlik no alıcı tarafında.', lay: 'fis', pay: 'kart', cusIds: [['PLAKA', '06 EVR 506'], ['ARACKIMLIKNO', 'WVWZZZE1ZPP048211']],
                l: [['AC şarj (22 kW)', 'KWH', 18.4, 8.9, 20, { SOKET: 'Type 2' }]],
                r: [['SARJOTURUMU', 'OTP-2026-1007-221']],
            },
        ],
    },
    {
        code: 'J.03', sector: 'yolcu-tasima', icon: 'route', c: ['#92400e', '#fde68a'], f: 'Kapadokya Tur Faytonculuk Ltd. Şti.', city: 'Nevşehir', slogan: 'Fayton turu · grup turları · otel transferi',
        why: 'Fayton ile turistik gezi yolcu taşıma hizmetidir; bireysel turlarda e-Bilet (sefer / güzergâh bilgili), otel ve acentelere toplu satışta e-Fatura düzenlenir.',
        docs: [
            {
                k: 'bilet', n: 'Fayton Turu e-Bileti', w: 'Bireysel yolcuya 1 saatlik vadi fayton turu; kalkış saati ve güzergâh bilette.', perTitle: 'Kalkış', pay: 'kart',
                per: ['2026-10-12', '17:30:00', 'Güvercinlik Vadisi gün batımı turu'],
                l: [['Fayton turu 60 dk (yolcu)', 'C62', 2, 750, 20]],
                r: [['SEFERNO', 'FY-1730'], ['GUZERGAH', 'Göreme – Güvercinlik Vadisi – Uçhisar'], ['PLAKA', 'Fayton No 14']],
            },
            {
                k: 'fatura', n: 'Otele Grup Fayton Turu Faturası', w: 'Butik otel misafirleri için ay boyunca yapılan grup fayton turları.', lay: 'zarif', to: { f: 'Peri Bacası Butik Otel Turizm Ltd. Şti.', city: 'Nevşehir' }, pay: 'vade:30',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026', '2026-09-30', '23:59:59'],
                l: [['Grup fayton turu (fayton/sefer)', 'C62', 38, 2600, 20]],
            },
        ],
    },
    {
        code: 'J.04', sector: 'insaat', icon: 'construction', c: ['#ca8a04', '#292524'], f: 'Güçlü İş Makinaları Kiralama Ltd. Şti.', city: 'Konya', slogan: 'Ekskavatör · kepçe · vinç · biçerdöver',
        why: 'İş makinesi işletmecisi yapım işine alt yüklenici olarak katıldığında hafriyat bedeli belirlenmiş alıcılara 601 kodlu 4/10 KDV tevkifatlı e-Fatura ile faturalanır; operatörsüz makine kiralaması normal e-Fatura, çiftçiye verilen hasat hizmeti e-Arşiv ile belgelenir.',
        docs: [
            {
                k: 'fatura/tevkifat:601', n: 'Şantiye Hafriyat Hakedişi (Tevkifat 601)', w: 'Konut projesinde ekskavatör ve kamyonla temel kazısı alt yüklenici hakedişi; 4/10 tevkifat.', lay: 'endustri', to: { f: 'Selçuklu Yapı Konut İnşaat A.Ş.', city: 'Konya' }, pay: 'vade:30',
                l: [['Temel kazısı (makine + operatör)', 'MTQ', 4200, 145, 20], ['Hafriyat nakli (döküm sahasına)', 'MTQ', 4200, 85, 20]],
                r: [['HAKEDIS', '3', 'Ara hakediş'], ['PROJE', 'Meram Vadi Konutları']],
            },
            {
                k: 'fatura', n: 'Operatörsüz Mini Ekskavatör Kiralama', w: 'Peyzaj firmasına 2 haftalık operatörsüz mini ekskavatör kiralaması.', lay: 'teknik', to: { f: 'Yeşil Vadi Peyzaj Ltd. Şti.', city: 'Konya' }, pay: 'havale',
                per: ['2026-10-05', '08:00:00', 'Kiralama dönemi', '2026-10-18', '18:00:00'],
                l: [['Mini ekskavatör 3,5 t (günlük)', 'DAY', 14, 3800, 20, { MAKINE: 'KMT PC35 · Seri 22418' }], ['Nakliye (gidiş-dönüş)', 'C62', 1, 5000, 20]],
            },
            {
                k: 'arsiv', n: 'Çiftçiye Biçerdöver Hasat Hizmeti e-Arşiv', w: 'Buğday tarlasında dönüm başı biçerdöver hasat hizmeti.', lay: 'defter', pay: 'nakit',
                l: [['Biçerdöver hasat (buğday)', 'C62', 180, 220, 20, { PARSEL: 'Çumra 118 ada 42 parsel' }]],
            },
        ],
    },
    {
        code: 'J.05', sector: 'lojistik', icon: 'truck', c: ['#0f766e', '#99f6e4'], f: 'Yıldız Nakliyat ve Lojistik Ltd. Şti.', city: 'Bursa', slogan: 'Komple tır · parsiyel · uluslararası taşıma',
        why: 'Yük taşıma hizmeti belirlenmiş alıcılara 624 kodlu 2/10 KDV tevkifatlı e-Fatura ile faturalanır; U-ETDS bildirim numarası ve plaka belgeye eklenir. Yurt dışına yapılan taşımalar KDV 14/1 (311) uluslararası taşımacılık istisnasıyla faturalanır. Taşınan malın irsaliyesini yük sahibi düzenler; taşıyıcı bu irsaliyede CarrierParty olarak yer alır.',
        docs: [
            {
                k: 'fatura/tevkifat:624', n: 'Yurt İçi Komple Tır Taşıma (Tevkifat 624)', w: 'Otomotiv yan sanayi firmasına Bursa–Ankara komple tır taşıma; 2/10 tevkifat.', lay: 'endustri', to: { f: 'Nilüfer Otomotiv Yan Sanayi A.Ş.', city: 'Bursa', sanayi: true }, pay: 'vade:45',
                l: [['Komple tır taşıma Bursa → Ankara', 'C62', 3, 28500, 20, { PLAKA: '16 YLD 316', UETDS: 'UET-2026-8841022' }], ['Bekleme bedeli (gün)', 'DAY', 1, 4000, 20]],
                r: [['IRSALIYE', 'NOT2026000004418']],
            },
            {
                k: 'fatura/istisna:311', n: 'Uluslararası Taşıma Faturası (İstisna 311)', w: 'İhracatçı tekstil firmasının yükünün Bursa–Münih taşıması; KDV 14/1 istisnası, EUR.', lay: 'kurumsal', to: { f: 'Uludağ Tekstil İhracat A.Ş.', city: 'Bursa', sanayi: true }, pay: 'vade:30', cur: 'EUR',
                l: [['Uluslararası komple tır Bursa → München', 'C62', 1, 3900, 0, { PLAKA: '16 YLD 422', CMR: 'CMR-TR-2026-55120' }]],
                r: [['BEYANNAME', '26160100EX00442181']],
            },
        ],
    },
    {
        code: 'J.06', sector: 'yolcu-tasima', icon: 'bus-front', c: ['#ea580c', '#fed7aa'], f: 'Polat Minibüs Taşımacılık', o: 'Ali Polat', city: 'Ankara', slogan: 'Hat minibüsü · personel servisi',
        why: 'Hat minibüsü işletmecisinin elektronik kartla biniş gelirleri belediye / toplu taşıma idaresi tarafından hakediş olarak ödenir ve KAMU senaryolu e-Fatura ile faturalanır; boş saatlerde yapılan personel servis taşımacılığı belirlenmiş alıcılara 614 kodlu 5/10 tevkifatlı e-Fatura ile faturalanır.',
        docs: [
            {
                k: 'fatura/kamu', n: 'Belediyeye Kartlı Biniş Hakedişi (KAMU)', w: 'Aylık elektronik kartlı biniş sayısına göre belediye toplu taşıma hakedişi; KAMU senaryosu, IBAN zorunlu.', lay: 'kurumsal', to: { f: 'Ankara Büyükşehir Belediyesi EGO Genel Müdürlüğü', city: 'Ankara' }, pay: 'havale',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026 kartlı biniş', '2026-09-30', '23:59:59'],
                l: [['Kartlı biniş hakedişi (biniş)', 'C62', 18420, 14.5, 20, { HAT: '418 Kızılay – Sincan', PLAKA: '06 M 4182' }]],
                r: [['SOZLESME', 'EGO-MNB-2024-418']],
            },
            {
                k: 'fatura/tevkifat:614', n: 'Sabah-Akşam Personel Servisi (Tevkifat 614)', w: 'Fabrika vardiyası için aylık personel servisi; 5/10 tevkifat.', lay: 'serit', to: { f: 'Sincan Ambalaj Sanayi A.Ş.', city: 'Ankara', sanayi: true }, pay: 'vade:30',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026', '2026-09-30', '23:59:59'],
                l: [['Personel servisi (sefer)', 'C62', 44, 1350, 20, { GUZERGAH: 'Etimesgut – Sincan OSB', PLAKA: '06 M 4182' }]],
            },
        ],
    },
    {
        code: 'J.07', sector: 'lojistik', icon: 'handshake', c: ['#4338ca', '#c7d2fe'], f: 'Köprü Nakliyat Komisyonculuğu', o: 'Mehmet Turan', city: 'Mersin', slogan: 'Yük – araç eşleştirme · nakliye organizasyonu',
        why: 'Nakliyat komisyoncusu taşımayı kendi adına üstleniyorsa taşıma bedelinin tamamını yük sahibine 624 tevkifatlı e-Fatura ile faturalar; aracılık komisyonunu kamyon sahibine (e-Fatura mükellefi değilse) e-Arşiv ile faturalar. C2 / K1 yetki belgesi no belgeye eklenir.',
        docs: [
            {
                k: 'fatura/tevkifat:624', n: 'Yük Sahibine Taşıma Organizasyonu (Tevkifat 624)', w: 'Narenciye ihracatçısının limana 6 kamyon taşıması; 2/10 tevkifat.', lay: 'endustri', to: { f: 'Akdeniz Narenciye İhracat A.Ş.', city: 'Mersin' }, pay: 'vade:15',
                l: [['Kamyon taşıma Erdemli → Mersin Limanı', 'C62', 6, 9500, 20]],
                r: [['YETKI', 'C2-33-2026-1182', 'Nakliyat komisyoncusu yetki belgesi']],
            },
            {
                k: 'arsiv', n: 'Kamyon Sahibine Komisyon e-Arşiv', w: 'Yük bulma ve organizasyon karşılığı kamyon sahibinden alınan aracılık komisyonu.', lay: 'defter', to: 'kisi', pay: 'nakit',
                l: [['Yük aracılık komisyonu (sefer)', 'C62', 4, 1200, 20, { PLAKA: '33 KT 7714' }]],
            },
        ],
    },
    {
        code: 'J.08', sector: 'arac-kiralama', icon: 'key-round', c: ['#0f172a', '#facc15'], f: 'Vizyon Otomotiv Galeri ve Kiralama Ltd. Şti.', city: 'İstanbul', slogan: 'İkinci el araç · günlük ve uzun dönem kiralama',
        why: 'Galeri ikinci el otomobil satışında KDV\'yi alış–satış farkı üzerinden 812 kodlu özel matrah e-Arşiv / e-Fatura ile hesaplar (noter satış bilgisi belgede). Kiralama tarafında günlük kiralama e-Arşiv, kurumsal uzun dönem kiralama aylık e-Fatura ile (InvoicePeriod + plaka) faturalanır.',
        docs: [
            {
                k: 'arsiv/om:812', n: 'İkinci El Otomobil Satışı (Özel Matrah 812)', w: 'Bireysel müşteriye ikinci el otomobil; KDV yalnız kâr marjından, şasi ve noter bilgisi belgede.', lay: 'kart', pay: 'havale',
                l: [['İkinci el otomobil 1.5 dizel (2021 model)', 'C62', 1, 1185000, 20, { PLAKA: '34 VZN 812', SASI: 'NMTKZ3BE40R118842', KM: '64.200', MODELYILI: '2021' }, { om: 55000 }]],
                r: [['NOTER', 'İstanbul 34. Noterliği 26/22418']],
            },
            {
                k: 'fatura', n: 'Kurumsal Uzun Dönem Kiralama Aylık Faturası', w: 'Şirkete 36 ay sözleşmeli 4 aracın aylık kira bedeli; dönem ve plaka bazlı.', lay: 'kurumsal', to: { f: 'Marmara Satış Pazarlama A.Ş.', city: 'İstanbul' }, pay: 'vade:15',
                per: ['2026-10-01', '00:00:00', 'Ekim 2026 kira dönemi', '2026-10-31', '23:59:59'],
                l: [['Aylık araç kirası — C segment', 'MON', 3, 38500, 20, { PLAKA: '34 VZN 101 / 102 / 103' }], ['Aylık araç kirası — hafif ticari', 'MON', 1, 42000, 20, { PLAKA: '34 VZN 204' }]],
                r: [['SOZLESME', 'UDK-2025-0418', '36 ay uzun dönem kiralama']],
            },
            {
                k: 'arsiv', n: 'Günlük Araç Kiralama e-Arşiv', w: 'Bireysel müşteriye 5 günlük araç kiralama; teslim-iade tarihi ve km.', lay: 'serit', pay: 'kart',
                per: ['2026-10-08', '10:00:00', 'Kiralama dönemi', '2026-10-13', '10:00:00'],
                l: [['Günlük kiralama — B segment otomatik', 'DAY', 5, 1900, 20, { PLAKA: '34 VZN 517', KM: '42.180 → 43.020' }], ['Ek sürücü + mini hasar güvencesi', 'DAY', 5, 250, 20]],
            },
        ],
    },
    {
        code: 'J.09', sector: 'otomotiv', icon: 'siren', c: ['#b91c1c', '#fef08a'], f: 'Hızır Oto Kurtarma', o: 'Serkan Çetin', city: 'Ankara', slogan: '7/24 çekici · yol yardım · asistans',
        why: 'Oto kurtarıcı bireysel müşteriye e-Arşiv, sigorta / asistans firmalarına dosya numaralı aylık toplu e-Fatura düzenler; hasar dosya no ve plaka belgeye eklenir.',
        docs: [
            {
                k: 'arsiv', n: 'Bireysel Çekici Hizmeti e-Arşiv', w: 'Arızalı aracın yol kenarından servise çekilmesi; plaka ve mesafe belgede.', lay: 'fis', pay: 'kart',
                l: [['Çekici hizmeti (şehir içi, 18 km)', 'C62', 1, 3200, 20, { PLAKA: '06 DFT 902' }], ['Gece servisi farkı', 'C62', 1, 800, 20]],
            },
            {
                k: 'fatura', n: 'Asistans Firmasına Aylık Çekici Faturası', w: 'Sigorta asistans firmasının yönlendirdiği yol yardım dosyalarının aylık faturası.', lay: 'kurumsal', to: { f: 'Güven Asistans Hizmetleri A.Ş.', city: 'İstanbul' }, pay: 'vade:45',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026', '2026-09-30', '23:59:59'],
                l: [['Çekici hizmeti (dosya)', 'C62', 26, 2900, 20], ['Yerinde akü takviyesi (dosya)', 'C62', 11, 900, 20]],
                r: [['HASAR', 'Ek listede 37 dosya numarası']],
            },
        ],
    },
    {
        code: 'J.10', sector: 'yolcu-tasima', icon: 'bus', c: ['#1e40af', '#fbbf24'], f: 'Uludağ Turizm Seyahat A.Ş.', city: 'Bursa', slogan: 'Şehirler arası otobüs · charter · uluslararası sefer',
        why: 'Şehirler arası otobüs firması yolcu biletini e-Bilet olarak düzenler (sefer no, koltuk, peron, plaka ek alanları). Kurumsal charter seferleri e-Fatura, yurt dışı seferleri KDV 14/1 (311) istisnalı e-Fatura ile belgelenir; U-ETDS bildirimi yapılır.',
        docs: [
            {
                k: 'bilet', n: 'Şehirler Arası Otobüs e-Bileti', w: 'Bursa–Ankara seferi; sefer no, koltuk, peron ve plaka bilet üzerinde.', perTitle: 'Sefer Tarihi', pay: 'kart',
                per: ['2026-10-14', '23:30:00', 'Bursa Otogar → Ankara AŞTİ'],
                l: [['Yolcu bileti Bursa → Ankara', 'C62', 1, 850, 20]],
                r: [['SEFERNO', 'UT-2330-ANK'], ['KOLTUKNO', '21'], ['PERON', '64'], ['PLAKA', '16 UT 1630'], ['KALKIS', 'Bursa Terminali'], ['VARIS', 'Ankara AŞTİ']],
            },
            {
                k: 'fatura', n: 'Kurumsal Charter Sefer Faturası', w: 'Şirketin bayi toplantısı için 3 otobüslük gidiş-dönüş charter seferi.', lay: 'kurumsal', to: { f: 'Nilüfer Beyaz Eşya Pazarlama A.Ş.', city: 'Bursa' }, pay: 'vade:15',
                per: ['2026-11-06', '07:00:00', 'Bursa → Antalya charter', '2026-11-08', '20:00:00'],
                l: [['Charter otobüs (46 koltuk, gidiş-dönüş)', 'C62', 3, 72000, 20]],
                r: [['UETDS', 'UET-2026-1106-552']],
            },
            {
                k: 'fatura/istisna:311', n: 'Yurt Dışı Tur Seferi (İstisna 311)', w: 'Tur operatörüne Bursa–Sofya–Belgrad tur otobüsü taşıması; KDV 14/1 istisnası, EUR.', lay: 'zarif', to: { f: 'Balkan Rotası Turizm Seyahat Ltd. Şti.', city: 'Bursa' }, pay: 'havale', cur: 'EUR',
                per: ['2026-11-20', '06:00:00', 'Balkan turu', '2026-11-25', '22:00:00'],
                l: [['Uluslararası tur otobüsü (5 gün)', 'C62', 1, 6800, 0, { PLAKA: '16 UT 1648', GUZERGAH: 'Bursa – Kapıkule – Sofya – Belgrad' }]],
            },
        ],
    },
    {
        code: 'J.11', sector: 'saglik', icon: 'ambulance', c: ['#dc2626', '#e0f2fe'], f: 'Can Özel Ambulans Hizmetleri Ltd. Şti.', city: 'İzmir', slogan: 'Hasta nakli · etkinlik sağlık ekibi · sözleşmeli ambulans',
        why: 'Özel ambulans firması hasta yakınlarına e-Arşiv, özel hastane ve etkinlik organizatörlerine e-Fatura düzenler; nakil tarihi, plaka ve güzergâh belgede yer alır.',
        docs: [
            {
                k: 'arsiv', n: 'Şehirler Arası Hasta Nakli e-Arşiv', w: 'Hasta yakınına İzmir–Ankara yoğun bakım ambulansı ile nakil.', lay: 'serit', pay: 'havale',
                per: ['2026-10-03', '06:30:00', 'İzmir → Ankara hasta nakli'],
                l: [['Yoğun bakım ambulansı ile nakil (590 km)', 'C62', 1, 38000, 20, { PLAKA: '35 CAN 112' }], ['Refakatçi hekim', 'C62', 1, 6000, 20]],
            },
            {
                k: 'fatura', n: 'Özel Hastaneye Sözleşmeli Ambulans Faturası', w: 'Özel hastaneye aylık sözleşmeli nakil hizmetleri (dönem + sefer sayısı).', lay: 'kurumsal', to: { f: 'Ege Şifa Özel Hastanesi A.Ş.', city: 'İzmir' }, pay: 'vade:30',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026', '2026-09-30', '23:59:59'],
                l: [['Şehir içi hasta nakli (sefer)', 'C62', 64, 2400, 20], ['Ambulans hazırda bekletme (aylık)', 'MON', 1, 45000, 20]],
                r: [['SOZLESME', 'AMB-2026-07']],
            },
        ],
    },
    {
        code: 'J.12', sector: 'yolcu-tasima', icon: 'bus-front', c: ['#15803d', '#fef08a'], f: 'Güvenli Yol Personel Taşımacılık Ltd. Şti.', city: 'Kocaeli', slogan: 'Personel servisi · öğrenci servisi',
        why: 'Personel servis taşımacılığı belirlenmiş alıcılara 614 kodlu 5/10 KDV tevkifatlı e-Fatura ile, kamu kurumlarına KAMU senaryolu tevkifatlı e-Fatura ile faturalanır; öğrenci servisi velilere aylık e-Arşiv ile belgelenir.',
        docs: [
            {
                k: 'fatura/tevkifat:614', n: 'Fabrika Personel Servisi (Tevkifat 614)', w: 'Üç vardiyalı fabrikaya aylık personel servisi; güzergâh ve plaka bazlı, 5/10 tevkifat.', lay: 'endustri', to: { f: 'Dilovası Kimya Sanayi A.Ş.', city: 'Kocaeli', sanayi: true }, pay: 'vade:30',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026', '2026-09-30', '23:59:59'],
                l: [['Servis (sefer) — Gebze hattı', 'C62', 132, 1150, 20, { PLAKA: '41 GY 101' }], ['Servis (sefer) — İzmit hattı', 'C62', 132, 1400, 20, { PLAKA: '41 GY 102' }]],
            },
            {
                k: 'fatura/kamu/tevkifat:614', n: 'Devlet Hastanesi Personel Servisi (KAMU · 614)', w: 'Kamu ihalesiyle devlet hastanesine personel servis hizmeti; KAMU + 614 tevkifat.', lay: 'kurumsal', to: { f: 'Kocaeli Devlet Hastanesi Başhekimliği', city: 'Kocaeli' }, pay: 'havale',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026', '2026-09-30', '23:59:59'],
                l: [['Personel servisi (araç/gün)', 'DAY', 132, 2350, 20]],
                r: [['IHALE', '2025/1184422']],
            },
            {
                k: 'arsiv', n: 'Öğrenci Servisi Aylık e-Arşiv', w: 'Veliye ilkokul öğrencisi aylık servis ücreti.', lay: 'pastel', to: 'kisi', pay: 'havale',
                per: ['2026-10-01', '00:00:00', 'Ekim 2026', '2026-10-31', '23:59:59'],
                l: [['Öğrenci servisi (aylık)', 'MON', 1, 3800, 20, { OGRENCI: 'Ela K. — 3/B', GUZERGAH: 'Yahya Kaptan – Okul' }]],
            },
        ],
    },
    {
        code: 'J.13', sector: 'yolcu-tasima', icon: 'ship', c: ['#0369a1', '#7dd3fc'], f: 'Ege Mavi Yolculuk Turizm A.Ş.', city: 'Muğla', slogan: 'Deniz otobüsü · tekne turu · Yunan adaları seferleri',
        why: 'Deniz yolcu taşımacılığında yolcu biletleri e-Bilet (sefer, iskele, gemi bilgili) olarak düzenlenir. Yunan adalarına yapılan uluslararası seferler KDV 14/1 (311) istisnalı e-Fatura ile tur acentelerine faturalanır; günlük tekne kiralama e-Fatura ile belgelenir.',
        docs: [
            {
                k: 'bilet', n: 'Deniz Otobüsü e-Bileti', w: 'Bodrum–Datça deniz otobüsü yolcu bileti; sefer, iskele ve gemi bilgisi.', perTitle: 'Kalkış', pay: 'kart',
                per: ['2026-10-10', '09:00:00', 'Bodrum → Datça (Körmen)'],
                l: [['Yolcu bileti Bodrum → Datça', 'C62', 2, 900, 20]],
                r: [['SEFERNO', 'EM-0900'], ['GEMI', 'Mavi Yolcu 3'], ['ISKELE', 'Bodrum Limanı'], ['VARIS', 'Körmen İskelesi']],
            },
            {
                k: 'fatura/istisna:311', n: 'Acenteye Kos Adası Seferleri (İstisna 311)', w: 'Tur acentesine Bodrum–Kos günübirlik feribot seferleri; KDV 14/1 istisnası.', lay: 'zarif', to: { f: 'Halikarnas Tur Seyahat Acentesi Ltd. Şti.', city: 'Muğla' }, pay: 'vade:15', cur: 'EUR',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026', '2026-09-30', '23:59:59'],
                l: [['Bodrum → Kos gidiş-dönüş (yolcu)', 'C62', 420, 32, 0, { GEMI: 'Mavi Yolcu 5' }]],
            },
            {
                k: 'fatura', n: 'Günlük Tekne Kiralama Faturası', w: 'Kurumsal etkinlik için kaptanlı günlük tekne kiralama ve ikram.', lay: 'pastel', to: { f: 'Gümüşlük Etkinlik Organizasyon Ltd. Şti.', city: 'Muğla' }, pay: 'havale',
                per: ['2026-10-17', '10:00:00', 'Günlük koy turu', '2026-10-17', '18:00:00'],
                l: [['Kaptanlı tekne kiralama (günlük)', 'DAY', 1, 42000, 20, { TEKNE: 'Mavi Rüya — 18 m' }], ['Öğle yemeği ikramı (kişi)', 'C62', 30, 650, 10]],
            },
        ],
    },
    {
        code: 'J.14', sector: 'yolcu-tasima', icon: 'car-taxi-front', c: ['#facc15', '#18181b'], f: 'Kızılay Taksi', o: 'Hüseyin Kaya', city: 'Ankara', slogan: 'Taksi durağı · havalimanı transferi · kurumsal hesap',
        why: 'Taksiciler çoğunlukla basit usulde ya da işletme esasındadır; işletme esasındaki taksi yolcunun talebinde e-Arşiv düzenler (plaka, güzergâh). Kurumsal hesaplı müşterilere ay sonu toplu e-Fatura / e-Arşiv düzenlenir.',
        docs: [
            {
                k: 'arsiv', n: 'Havalimanı Transferi e-Arşiv', w: 'Yolcuya taksimetre ücreti; plaka ve güzergâh belgede.', lay: 'fis', pay: 'kart',
                l: [['Taksi ücreti Kızılay → Esenboğa', 'C62', 1, 1250, 20, { PLAKA: '06 T 4418', GUZERGAH: 'Kızılay – Esenboğa Havalimanı' }]],
            },
            {
                k: 'fatura', n: 'Kurumsal Hesap Aylık Taksi Faturası', w: 'Şirket çalışanlarının fişle kullandığı taksi yolculuklarının aylık toplamı.', lay: 'defter', to: { f: 'Çankaya Hukuk ve Danışmanlık A.Ş.', city: 'Ankara' }, pay: 'vade:15',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026', '2026-09-30', '23:59:59'],
                l: [['Şehir içi taksi yolculuğu (fiş)', 'C62', 48, 380, 20], ['Havalimanı transferi (fiş)', 'C62', 6, 1250, 20]],
            },
        ],
    },
    {
        code: 'J.15', sector: 'buro', icon: 'clipboard-check', c: ['#7c3aed', '#ddd6fe'], f: 'Yıldız Trafik Müşavirliği', o: 'Gizem Yıldız', city: 'Ankara', slogan: 'Araç tescil · plaka · ruhsat işlemleri',
        why: 'Trafik müşavirliği serbest meslek faaliyeti olduğundan e-Serbest Meslek Makbuzu (e-SMM) düzenlenir; şirket müşterilerde %20 GV stopajı uygulanır. Müşteri adına ödenen harç ve noter ücretleri hizmet bedelinin parçası değildir, avans olarak ayrıca belgelenir.',
        docs: [
            {
                k: 'smm', n: 'Bireysel Araç Tescil İşlemi e-SMM', w: 'Gerçek kişiye ikinci el araç tescil ve plaka işlemi müşavirlik ücreti; stopaj yok.', lay: 'zarif', to: 'kisi', pay: 'nakit',
                l: [['Araç tescil ve plaka işlemleri hizmet bedeli', 'C62', 1, 2500, 20, { PLAKA: '06 GZY 615' }]],
                nt: ['Müşteri adına ödenen tescil harcı ve plaka bedeli avans niteliğinde olup bu makbuzun matrahına dahil değildir.'],
            },
            {
                k: 'smm', n: 'Filo Şirketine Toplu Tescil e-SMM (Stopajlı)', w: 'Araç kiralama şirketinin 12 yeni aracının tescil işlemleri; %20 GV stopajı.', lay: 'kurumsal', to: { f: 'Yeşil Mobilite Araç Kiralama A.Ş.', city: 'Ankara' }, pay: 'havale', slug: 'filo-toplu-tescil',
                l: [['Yeni araç tescil işlemi (araç)', 'C62', 12, 1800, 20], ['Muayene ve egzoz randevu takibi', 'C62', 12, 400, 20]],
            },
        ],
    },
    {
        code: 'J.16', sector: 'lojistik', icon: 'warehouse', c: ['#155e75', '#a5f3fc'], f: 'Mersin Soğuk Hava Depoculuk ve Antrepo A.Ş.', city: 'Mersin', slogan: 'Soğuk hava deposu · antrepo · liman elleçleme',
        why: 'Depolama ve antrepo hizmetleri aylık e-Fatura ile (palet, depo ve dönem bilgisiyle) faturalanır. Limanda gemilere verilen yükleme-boşaltma (elleçleme) hizmetleri KDV 13/b (305) kapsamında istisna e-Fatura ile belgelenir. Depodan çıkan malın irsaliyesini mal sahibi düzenler.',
        docs: [
            {
                k: 'fatura', n: 'Soğuk Hava Deposu Aylık Kira ve Elleçleme', w: 'Narenciye ihracatçısına palet bazlı soğuk depo kira ve depo içi elleçleme bedeli.', lay: 'endustri', to: { f: 'Akdeniz Narenciye İhracat A.Ş.', city: 'Mersin' }, pay: 'vade:30',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026', '2026-09-30', '23:59:59'],
                l: [['Soğuk depo (+4 °C) palet/gün', 'DAY', 6200, 18, 20, { DEPO: 'Oda 3', PALET: '220 palet ortalama' }], ['Giriş-çıkış elleçleme (palet)', 'C62', 480, 65, 20]],
            },
            {
                k: 'fatura/istisna:305', n: 'Gemiye Liman Elleçleme Hizmeti (İstisna 305)', w: 'Gemi acentesi aracılığıyla limanda gemiye konteyner yükleme-boşaltma; KDV 13/b istisnası.', lay: 'teknik', to: { f: 'Mavi Deniz Gemi Acenteliği Ltd. Şti.', city: 'Mersin' }, pay: 'vade:15', cur: 'USD',
                l: [['Konteyner yükleme (40\' FCL)', 'C62', 84, 95, 0, { GEMI: 'MSC AURORA', KONTEYNER: 'Liste ekte' }], ['Konteyner boşaltma (20\' FCL)', 'C62', 56, 70, 0]],
                r: [['ORDINO', 'MRS-2026-0918-44']],
            },
        ],
    },
];
