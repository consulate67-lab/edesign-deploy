// H — Metal, Otomotiv, Makine
export default [
    {
        code: 'H.01', sector: 'metal', icon: 'panels-top-left', c: ['#475569', '#cbd5e1'], f: 'Ege Alüminyum Doğrama San. Tic. Ltd. Şti.', city: 'İzmir', slogan: 'Alüminyum profil · doğrama · cephe', sanayi: true,
        why: 'Alüminyum ürün teslimleri belirlenmiş alıcılara 619 kodlu (bakır, çinko, alüminyum ve kurşun ürünleri) 7/10 KDV tevkifatlı e-Fatura ile yapılır; ev sahiplerine doğrama ve montaj e-Arşiv ile belgelenir. Şantiyeye profil sevkiyatı e-İrsaliye gerektirir.',
        docs: [
            {
                k: 'fatura/tevkifat:619', n: 'Alüminyum Profil Satışı (Tevkifat 619)', w: 'Yapı firmasına alüminyum doğrama profili ve cephe aksesuarı; 7/10 KDV tevkifatı.', lay: 'endustri', to: { f: 'Kordon Yapı İnşaat Taahhüt A.Ş.', city: 'İzmir' }, pay: 'vade:45',
                l: [['Isı yalıtımlı pencere profili (eloksal)', 'KGM', 4200, 210, 20, { RENK: 'Antrasit RAL 7016', BOY: '6,5 m' }], ['Cephe kapak profili', 'KGM', 1600, 195, 20], ['Pencere aksesuar seti', 'SET', 180, 420, 20]],
                r: [['IRSALIYE', 'EAD2026000003317']],
            },
            {
                k: 'arsiv', n: 'Ev Pencere Doğraması e-Arşiv', w: 'Ev sahibine ısıcamlı alüminyum pencere ve sürgülü balkon kapısı imalatı ve montajı.', lay: 'zarif', pay: 'havale',
                l: [['Alüminyum pencere (ısıcamlı)', 'MTK', 9.6, 6800, 20, { OLCU: '8 adet' }], ['Sürgülü balkon kapısı', 'C62', 1, 24000, 20, { OLCU: '240 x 220 cm' }], ['Söküm, montaj ve silikon', 'C62', 1, 4500, 20]],
            },
            {
                k: 'irsaliye', n: 'Şantiyeye Profil Sevk İrsaliyesi', w: 'Fabrikadan şantiyeye boy profil sevki; ağırlık ve paket bilgisi.', lay: 'teknik', to: { f: 'Kordon Yapı İnşaat Taahhüt A.Ş.', city: 'İzmir' }, kg: 5800, kap: 42,
                l: [['Isı yalıtımlı pencere profili (eloksal)', 'KGM', 4200, 0, 20, { BOY: '6,5 m · 28 paket' }], ['Cephe kapak profili', 'KGM', 1600, 0, 20, { BOY: '6,5 m · 14 paket' }]],
            },
        ],
    },
    {
        code: 'H.02', sector: 'uretim', icon: 'tractor', c: ['#78350f', '#fde68a'], f: 'Kervan Fayton ve At Arabası İmalathanesi', o: 'Yusuf Akın', city: 'Konya', slogan: 'Fayton · at arabası · tekerlek onarımı', sanayi: true,
        why: 'At arabası / fayton imalatçısı turizm işletmelerine e-Fatura, çiftçi ve bireysel alıcılara imalat ve onarım için e-Arşiv düzenler.',
        docs: [
            {
                k: 'fatura', n: 'Turizm İşletmesine Fayton İmalatı e-Faturası', w: 'Fayton turu işletmesine iki adet gezi faytonu imalatı; deri döşeme ve aydınlatma satırda.', lay: 'zarif', to: { f: 'Kapadokya Tur Faytonculuk Ltd. Şti.', city: 'Nevşehir' }, pay: 'vade:30',
                l: [['Gezi faytonu (4 kişilik, körüklü)', 'C62', 2, 185000, 20, { MALZEME: 'Dişbudak gövde, deri döşeme' }], ['LED fener ve reflektör seti', 'SET', 2, 3500, 20]],
            },
            {
                k: 'arsiv', n: 'At Arabası Onarım e-Arşiv', w: 'Çiftçinin at arabasının tekerlek çemberi ve dingil onarımı.', lay: 'defter', pay: 'nakit',
                l: [['Ahşap tekerlek çember değişimi', 'C62', 2, 1800, 20], ['Dingil ve rulman yenileme', 'C62', 1, 2400, 20]],
            },
        ],
    },
    {
        code: 'H.03', sector: 'metal', icon: 'soup', c: ['#b45309', '#fed7aa'], f: 'Usta Bakır İşleri', o: 'İbrahim Kurt', city: 'Gaziantep', slogan: 'El işi bakır · kalaylama · Antep bakırcılığı',
        why: 'Bakırcı turistlere yolcu beraberi eşya faturası (Tax Free), yerli müşterilere ürün ve kalaylama hizmetinde e-Arşiv düzenler. Bakır ürünlerinin belirlenmiş alıcılara (otel zincirleri gibi) tesliminde 619 kodlu 7/10 KDV tevkifatı uygulanır.',
        docs: [
            {
                k: 'yolcu', n: 'Turiste Bakır Eşya Satışı (Yolcu Beraberi)', w: 'Yabancı turiste el işi bakır tepsi ve cezve takımı; pasaport ve aracı kurum bilgisi.', lay: 'serit', pay: 'kart',
                l: [['El işlemeli bakır tepsi Ø 60 cm', 'C62', 1, 9500, 20, { MALZEME: 'Dövme bakır, kalaylı' }], ['Bakır cezve takımı (4 fincan)', 'SET', 2, 2800, 20]],
            },
            {
                k: 'arsiv', n: 'Kalaylama ve Bakır Satışı e-Arşiv', w: 'Müşterinin bakır kazanlarının kalaylanması ve yeni sahan satışı.', lay: 'defter', pay: 'nakit',
                l: [['Bakır kap kalaylama', 'C62', 6, 350, 20], ['Bakır sahan (kapaklı)', 'C62', 2, 1400, 20]],
            },
            {
                k: 'fatura/tevkifat:619', n: 'Otel Zincirine Bakır Servis Takımı (Tevkifat 619)', w: 'Otel restoranları için bakır servis sahanı ve ibrik; bakır ürünleri teslimi 7/10 tevkifatlı.', lay: 'kurumsal', to: { f: 'Şahinbey Grand Otel Turizm A.Ş.', city: 'Gaziantep' }, pay: 'vade:30',
                l: [['Bakır servis sahanı (tek kişilik)', 'C62', 200, 650, 20], ['Bakır ibrik', 'C62', 40, 1800, 20]],
            },
        ],
    },
    {
        code: 'H.04', sector: 'genel-hizmet', icon: 'key-round', c: ['#a16207', '#fef9c3'], f: 'Anahtar Usta Çilingir', o: 'Mustafa Şimşek', city: 'İstanbul', slogan: '7/24 kapı açma · kilit · anahtar çoğaltma',
        why: 'Çilingir bireysel müşterilere kapı açma ve kilit değişimini e-Arşiv ile belgeler; site / plaza yönetimlerine dönemsel anahtar-kilit hizmetlerini e-Fatura ile faturalar.',
        docs: [
            {
                k: 'arsiv', n: 'Kapı Açma ve Kilit Değişimi e-Arşiv', w: 'Gece kapı açma, çelik kapı barel değişimi ve yedek anahtar.', lay: 'fis', pay: 'kart',
                l: [['Kapı açma (gece servisi)', 'C62', 1, 1200, 20], ['Çelik kapı barel değişimi (A sınıfı)', 'C62', 1, 1600, 20], ['Anahtar çoğaltma', 'C62', 3, 120, 20]],
            },
            {
                k: 'fatura', n: 'Site Yönetimine Kilit Sistemi e-Faturası', w: 'Konut sitesine kartlı geçiş kilidi montajı ve ortak alan anahtar takımları.', lay: 'kurumsal', to: { f: 'Ataşehir Park Evleri Site Yönetimi', city: 'İstanbul' }, pay: 'havale',
                l: [['Kartlı geçiş kilidi (blok girişi)', 'C62', 6, 7800, 20], ['Proximity kart', 'C62', 400, 45, 20], ['Ortak alan anahtar takımı', 'SET', 12, 260, 20]],
            },
        ],
    },
    {
        code: 'H.05', sector: 'metal', icon: 'container', c: ['#334155', '#f97316'], f: 'Anadolu Demir Çelik Ticaret A.Ş.', city: 'Kocaeli', slogan: 'İnşaat demiri · profil · sac', sanayi: true,
        why: 'Demir-çelik ürünleri IDIS profiliyle (e-Fatura ProfileID IDIS, e-İrsaliye IDISIRSALIYE) belgelenir: satıcıda SEVKIYATNO, her satırda ETIKETNO zorunludur. Belirlenmiş alıcılara teslimde 627 kodlu 5/10 KDV tevkifatı uygulanır; yurt dışı satışlar IHRACAT profilli faturayla yapılır.',
        docs: [
            {
                k: 'fatura/idis/tevkifat:627', n: 'İnşaat Demiri Faturası (IDIS + Tevkifat 627)', w: 'Müteahhit firmaya nervürlü inşaat demiri ve hasır çelik; IDIS etiket numaraları ve 5/10 tevkifat.', lay: 'endustri', to: { f: 'Körfez Konut İnşaat A.Ş.', city: 'Kocaeli' }, pay: 'cek:60',
                l: [['Nervürlü inşaat demiri Ø 12 (B500C)', 'TNE', 24, 24800, 20, { CAP: 'Ø 12 mm', DOKUM: 'DK-26-4418' }], ['Nervürlü inşaat demiri Ø 16 (B500C)', 'TNE', 18, 24500, 20, { CAP: 'Ø 16 mm' }], ['Hasır çelik Q257', 'TNE', 6, 27900, 20]],
                r: [['IRSALIYE', 'ADC2026000011842']],
            },
            {
                k: 'irsaliye/idis', n: 'Demir-Çelik Sevk İrsaliyesi (IDIS)', w: 'Depodan şantiyeye tır ile inşaat demiri sevki; IDIS sevkiyat ve etiket numaraları.', lay: 'teknik', to: { f: 'Körfez Konut İnşaat A.Ş.', city: 'Kocaeli' }, kg: 48000, kap: 36, dorse: true,
                l: [['Nervürlü inşaat demiri Ø 12 (B500C)', 'TNE', 24, 0, 20, { CAP: 'Ø 12 mm' }], ['Nervürlü inşaat demiri Ø 16 (B500C)', 'TNE', 18, 0, 20, { CAP: 'Ø 16 mm' }], ['Hasır çelik Q257', 'TNE', 6, 0, 20]],
            },
            {
                k: 'ihracat', n: 'Gürcistan\'a Çelik Profil İhracatı (DAP)', w: 'Batum\'daki inşaat malzemecisine kutu profil ve sac ihracatı; GTİP 7306 / 7208.', lay: 'serit', to: 'GE', cur: 'USD', inc: 'DAP', mode: 3, pkg: 'BE',
                l: [['Kutu profil 40 x 40 x 2', 'TNE', 22, 760, 0, {}, { g: '730661920000', kap: 22 }], ['Sıcak haddelenmiş sac 3 mm', 'TNE', 18, 640, 0, {}, { g: '720838000000', kap: 9 }]],
            },
        ],
    },
    {
        code: 'H.06', sector: 'uretim', icon: 'sailboat', c: ['#1e3a8a', '#7dd3fc'], f: 'Bodrum Gulet Tersanesi Ltd. Şti.', city: 'Muğla', slogan: 'Gulet inşası · tekne bakım-onarım · yat', sanayi: true,
        why: 'Ticari amaçla kullanılan deniz taşıtlarının (turizm belgeli gulet, balıkçı teknesi vb.) inşa, bakım ve onarımı KDV 13/a uyarınca istisnadır (ISTISNA 304); özel gezinti teknelerinin bakımı KDV\'ye tabidir ve e-Arşiv ile faturalanır. Yurt dışı alıcıya tekne satışı IHRACAT profiliyle yapılır.',
        docs: [
            {
                k: 'fatura/istisna:304', n: 'Turizm Teknesi Bakım-Onarım (İstisna 304)', w: 'Mavi tur şirketinin guletinin kışlık bakım ve onarımı; KDV 13/a istisnası, tekne adı belge alanında.', lay: 'teknik', to: { f: 'Ege Mavi Yolculuk Turizm A.Ş.', city: 'Muğla' }, pay: 'vade:30',
                l: [['Karina zımpara, macun ve zehirli boya', 'MTK', 140, 950, 0], ['Güverte tik yenileme', 'MTK', 36, 7800, 0], ['Ana makine revizyonu', 'C62', 1, 145000, 0]],
                r: [['GEMI', 'M/S Mavi Rüya — TUGS 4418'], ['IS_EMRI', 'BGT-IE-26-041']],
            },
            {
                k: 'ihracat', n: 'Yat İhracat Faturası (FOB)', w: 'Hollanda\'daki alıcıya ahşap gulet satışı; GTİP 8903, deniz yolu teslim.', lay: 'serit', to: 'NL', cur: 'EUR', inc: 'FOB', mode: 1, pkg: 'NE',
                l: [['Ahşap gulet 24 m (motorlu yelkenli)', 'C62', 1, 1450000, 0, { MALZEME: 'Maun / iroko' }, { g: '890392990000', kap: 1 }]],
            },
            {
                k: 'arsiv', n: 'Özel Tekne Bakımı e-Arşiv', w: 'Bireysel tekne sahibinin gezi teknesinin bakımı; ticari kullanım olmadığından KDV uygulanır.', lay: 'kart', pay: 'havale',
                l: [['Karina temizlik ve zehirli boya', 'MTK', 28, 850, 20], ['Dıştan takma motor bakımı', 'C62', 1, 9500, 20]],
                r: [['TEKNE', 'Deniz Kızı — 48-BD-2214']],
            },
        ],
    },
    {
        code: 'H.07', sector: 'metal', icon: 'flame-kindling', c: ['#9a3412', '#fdba74'], f: 'Konya Döküm Sanayi Ltd. Şti.', city: 'Konya', slogan: 'Pik · sfero · alüminyum döküm', sanayi: true,
        why: 'Dökümhane makine imalatçılarına döküm parçaları e-Fatura ile satar ve e-İrsaliye ile sevk eder. Hurda metalden elde ettiği külçeleri belirlenmiş alıcılara sattığında 617 kodlu 7/10 KDV tevkifatı uygulanır; döküm no ve parti bilgisi satırda taşınır.',
        docs: [
            {
                k: 'fatura', n: 'Makine Firmasına Döküm Parça e-Faturası', w: 'Tarım makinesi üreticisine sfero döküm şanzıman gövdesi; döküm numarası ve model satırda.', lay: 'endustri', to: { f: 'Selçuklu Tarım Makinaları San. A.Ş.', city: 'Konya', sanayi: true }, pay: 'vade:60',
                l: [['Sfero döküm şanzıman gövdesi (GGG40)', 'C62', 320, 1850, 20, { DOKUM: 'KD-26-0918', AGIRLIK: '42 kg' }], ['Pik döküm kasnak', 'C62', 600, 420, 20, { DOKUM: 'KD-26-0921' }]],
                r: [['SIPARIS', 'STM-PO-26-114'], ['IRSALIYE', 'KDS2026000002211']],
            },
            {
                k: 'fatura/tevkifat:617', n: 'Hurdadan Külçe Teslimi (Tevkifat 617)', w: 'Hurda alüminyumdan elde edilen külçelerin sanayiciye satışı; 7/10 tevkifat.', lay: 'teknik', to: { f: 'Anadolu Alüminyum Jant San. A.Ş.', city: 'Konya', sanayi: true }, pay: 'vade:30',
                l: [['Alüminyum külçe (AlSi7Mg, hurdadan)', 'KGM', 18000, 112, 20, { PARTINO: 'KD-ALK-2609' }]],
                r: [['ANALIZ', 'Spektral analiz raporu SA-26-118']],
            },
            {
                k: 'irsaliye', n: 'Döküm Parça Sevk İrsaliyesi', w: 'Dökümhaneden müşteri fabrikasına sandıklı parça sevki.', lay: 'kenar', to: { f: 'Selçuklu Tarım Makinaları San. A.Ş.', city: 'Konya', sanayi: true }, kg: 15960, kap: 28,
                l: [['Sfero döküm şanzıman gövdesi (GGG40)', 'C62', 320, 0, 20, { SANDIK: '16 sandık' }], ['Pik döküm kasnak', 'C62', 600, 0, 20, { SANDIK: '12 sandık' }]],
            },
        ],
    },
    {
        code: 'H.08', sector: 'teknik-servis', icon: 'heater', c: ['#dc2626', '#fecaca'], f: 'Isıl Ev Aletleri Servis', o: 'Serkan Aksoy', city: 'Kayseri', slogan: 'Ocak · şofben · ev aletleri onarımı',
        why: 'Ev aletleri servisi bireysel müşterilere onarım ve parça satışını e-Arşiv ile belgeler; kamu idareleri ve büyük işletmeler gibi belirlenmiş alıcılara yapılan makine-teçhizat bakım onarımında 603 kodlu 7/10 KDV tevkifatlı e-Fatura düzenler.',
        docs: [
            {
                k: 'arsiv', n: 'Ocak ve Şofben Onarımı e-Arşiv', w: 'Evde gazlı ocak ve şofben onarımı; değişen parça ve işçilik ayrı satırda.', lay: 'fis', pay: 'nakit',
                l: [['Şofben gaz valfi değişimi', 'C62', 1, 1400, 20], ['Ocak termokupl değişimi', 'C62', 2, 280, 20], ['Servis işçiliği', 'C62', 1, 750, 20]],
                r: [['SERVISFORM', 'ISL-26-1184']],
            },
            {
                k: 'fatura/tevkifat:603', n: 'Yemekhane Ekipman Bakımı (Tevkifat 603)', w: 'Fabrika yemekhanesindeki endüstriyel ocak ve fırınların periyodik bakımı; 7/10 tevkifat.', lay: 'teknik', to: { f: 'Erciyes Kablo Sanayi A.Ş.', city: 'Kayseri', sanayi: true }, pay: 'vade:30',
                l: [['Endüstriyel ocak periyodik bakım', 'C62', 4, 1800, 20], ['Konveksiyonel fırın onarımı', 'C62', 1, 6500, 20], ['Yedek parça (brülör seti)', 'SET', 2, 2200, 20]],
                r: [['SERVISFORM', 'ISL-KRM-26-031']],
            },
        ],
    },
    {
        code: 'H.09', sector: 'geri-donusum', icon: 'trash-2', c: ['#57534e', '#a8a29e'], f: 'Demir Hurda Geri Dönüşüm Ltd. Şti.', city: 'Kocaeli', slogan: 'Hurda metal alım-satım · geri kazanım', sanayi: true,
        why: 'Hurdacı kapı kapı dolaşan toplayıcılardan (GVK 9/7 esnaf muaflığı) yaptığı alımlarda %2 stopajlı e-Gider Pusulası düzenler (nihai tüketicinin kendi hurdası için stopaj yoktur). Hurda teslimleri KDV\'den istisna olup istisnadan vazgeçenler belirlenmiş alıcılara 620 kodlu 7/10 tevkifatlı fatura keser; çelikhaneye sevkiyat kantar fişiyle e-İrsaliye ile yapılır.',
        docs: [
            {
                k: 'gider/stopaj:2', n: 'Toplayıcıdan Hurda Alımı Gider Pusulası', w: 'Kapı kapı hurda toplayan kişiden kantarla demir ve bakır hurda alımı; %2 GV stopajı.', lay: 'defter', pay: 'nakit',
                l: [['Karışık demir hurda', 'KGM', 1260, 9.5, 0], ['Bakır kablo hurdası (soyulmuş)', 'KGM', 42, 310, 0], ['Alüminyum hurda', 'KGM', 85, 62, 0]],
                r: [['KANTARFISI', 'DHG-KF-26-8812']],
            },
            {
                k: 'fatura/tevkifat:620', n: 'Çelikhaneye Hurda Teslimi (Tevkifat 620)', w: 'İstisnadan vazgeçmiş hurdacının çelikhaneye ağır hurda teslimi; 7/10 tevkifat.', lay: 'endustri', to: { f: 'Marmara Çelik Haddecilik A.Ş.', city: 'Kocaeli', sanayi: true }, pay: 'vade:15',
                l: [['HMS 1 ağır hurda', 'TNE', 64, 9600, 20, { KALITE: 'HMS 1' }], ['Paket hurda (balyalı)', 'TNE', 22, 8900, 20]],
                r: [['KANTARFISI', 'MCH-KF-26-2214'], ['IRSALIYE', 'DHG2026000004411']],
            },
            {
                k: 'irsaliye', n: 'Hurda Sevk İrsaliyesi', w: 'Hurda sahasından çelikhaneye tır ile sevk; kantar ağırlıkları ve plaka.', lay: 'teknik', to: { f: 'Marmara Çelik Haddecilik A.Ş.', city: 'Kocaeli', sanayi: true }, kg: 86000, kap: 3, dorse: true,
                l: [['HMS 1 ağır hurda', 'TNE', 64, 0, 20], ['Paket hurda (balyalı)', 'TNE', 22, 0, 20]],
                r: [['KANTARFISI', 'DHG-KF-26-8840', 'Çıkış kantarı']],
            },
        ],
    },
    {
        code: 'H.10', sector: 'teknik-servis', icon: 'air-vent', c: ['#0284c7', '#e0f2fe'], f: 'Serin Hava İklimlendirme Sistemleri Ltd. Şti.', city: 'Antalya', slogan: 'Klima · VRF · soğuk oda · bakım',
        why: 'İklimlendirme firması ev kullanıcılarına klima satış-montajında e-Arşiv; otel gibi belirlenmiş alıcılara bakım-onarımda 603 (7/10) tevkifatlı e-Fatura; inşaat projelerinde alt yüklenici olarak yaptığı tesisat yapım işi sayıldığından 601 (4/10) tevkifatlı e-Fatura düzenler.',
        docs: [
            {
                k: 'arsiv', n: 'Klima Satış ve Montaj e-Arşiv', w: 'Ev kullanıcısına inverter klima, montaj ve bakır boru; seri no ve garanti satırda.', lay: 'modern', pay: 'kart',
                l: [['Inverter split klima 18.000 BTU', 'C62', 2, 32000, 20, { SERINO: 'SRN-26-44180 / 44181', GARANTI: '3 yıl' }], ['Montaj ve ilk çalıştırma', 'C62', 2, 1500, 20], ['İlave bakır boru (izoleli)', 'MTR', 6, 450, 20]],
            },
            {
                k: 'fatura/tevkifat:603', n: 'Otel Chiller Bakım Faturası (Tevkifat 603)', w: 'Otelin chiller ve klima santrallerinin sezon öncesi bakım-onarımı; 7/10 tevkifat.', lay: 'teknik', to: { f: 'Lara Beach Resort Otelcilik A.Ş.', city: 'Antalya' }, pay: 'vade:30',
                l: [['Chiller periyodik bakım', 'C62', 2, 18500, 20], ['Klima santrali filtre ve kayış değişimi', 'C62', 6, 3200, 20], ['Kompresör onarımı', 'C62', 1, 42000, 20]],
                r: [['SERVISFORM', 'SHI-26-0441']],
            },
            {
                k: 'fatura/tevkifat:601', n: 'Konut Projesine VRF Tesisatı (Tevkifat 601)', w: 'Konut projesinde alt yüklenici olarak VRF klima tesisatı; yapım işi kapsamında 4/10 tevkifat, hakediş referanslı.', lay: 'kurumsal', to: { f: 'Konyaaltı Konut Yapı A.Ş.', city: 'Antalya' }, pay: 'vade:30',
                per: ['2026-09-01', null, '3 No.lu hakediş dönemi', '2026-09-30'],
                l: [['VRF dış ünite montajı', 'C62', 4, 28000, 20], ['İç ünite ve bakır tesisat (daire)', 'C62', 24, 14500, 20]],
                r: [['HAKEDIS', '3'], ['SOZLESME', 'KKY-VRF-2026'], ['PROJE', 'Konyaaltı Vista Evleri']],
            },
        ],
    },
    {
        code: 'H.11', sector: 'metal', icon: 'paint-bucket', c: ['#64748b', '#e2e8f0'], f: 'Parlak Galvaniz Kaplama San. Ltd. Şti.', city: 'Bursa', slogan: 'Sıcak daldırma galvaniz · nikel · krom · kalay', sanayi: true,
        why: 'Kaplamacı müşterinin malını fason kaplar: hizmet bedeli için e-Fatura, kaplanmış malın müşteriye geri sevki için e-İrsaliye düzenlenir. Geleneksel kalaycı bireysel müşterilere kap kalaylamayı e-Arşiv ile belgeler.',
        docs: [
            {
                k: 'fatura', n: 'Fason Galvaniz Kaplama e-Faturası', w: 'Çelik konstrüksiyon parçalarının sıcak daldırma galvanizi; kg bazlı fason hizmet.', lay: 'endustri', to: { f: 'Nilüfer Çelik Konstrüksiyon A.Ş.', city: 'Bursa', sanayi: true }, pay: 'vade:30',
                l: [['Sıcak daldırma galvaniz (EN ISO 1461)', 'KGM', 14200, 14, 20, { KALINLIK: '85 µm' }], ['Kumlama ön işlem', 'KGM', 3800, 4.5, 20]],
                r: [['IS_EMRI', 'PGK-IE-26-1182'], ['PARTINO', 'NCK-2609-04']],
            },
            {
                k: 'irsaliye', n: 'Kaplanmış Parça İade Sevk İrsaliyesi', w: 'Kaplama sonrası parçaların müşteriye geri sevki.', lay: 'teknik', to: { f: 'Nilüfer Çelik Konstrüksiyon A.Ş.', city: 'Bursa', sanayi: true }, kg: 14650, kap: 18,
                l: [['Galvanizli çelik konstrüksiyon parçası', 'KGM', 14200, 0, 20, { PARTINO: 'NCK-2609-04' }]],
                nt: ['Mallar fason kaplama sonrası sahibine iade edilmektedir; satış değildir.'],
            },
            {
                k: 'arsiv', n: 'Bakır Kap Kalaylama e-Arşiv', w: 'Bireysel müşterinin bakır tencere ve kazanlarının kalaylanması.', lay: 'defter', pay: 'nakit',
                l: [['Bakır tencere kalaylama', 'C62', 5, 300, 20], ['Bakır kazan kalaylama (büyük)', 'C62', 1, 900, 20]],
            },
        ],
    },
    {
        code: 'H.12', sector: 'otomotiv', icon: 'car-front', c: ['#b91c1c', '#fecaca'], f: 'Usta Kaporta Boya ve Karoser', o: 'Ahmet Koç', city: 'Konya', slogan: 'Kaporta · karoser · damper imalatı', sanayi: true,
        why: 'Kaportacı bireysel araç sahiplerine e-Arşiv; filo şirketleri gibi belirlenmiş alıcılara taşıt onarımında 603 kodlu 7/10 tevkifatlı e-Fatura düzenler. Karoser / damper imalatı mal teslimi olduğundan tevkifatsız e-Fatura ile faturalanır; plaka ve şasi no satırda gösterilir.',
        docs: [
            {
                k: 'fatura/tevkifat:603', n: 'Filo Aracı Kaporta Onarımı (Tevkifat 603)', w: 'Araç kiralama şirketinin hasarlı aracının kaporta ve boya onarımı; 7/10 tevkifat, plaka ve km satırda.', lay: 'teknik', to: { f: 'Anadolu Filo Kiralama A.Ş.', city: 'Konya' }, pay: 'vade:30',
                l: [['Ön tampon ve çamurluk onarımı', 'C62', 1, 8500, 20, { PLAKA: '42 AFK 418', KM: '48.210' }], ['Sağ ön kapı değişimi (orijinal)', 'C62', 1, 21000, 20, { PARCA: '5NA831056' }], ['Boya işçiliği (2 parça)', 'C62', 2, 4500, 20]],
                r: [['IS_EMRI', 'UKB-26-0912']],
            },
            {
                k: 'arsiv', n: 'Bireysel Kaporta Onarımı e-Arşiv', w: 'Araç sahibine göçük düzeltme ve lokal boya.', lay: 'fis', pay: 'kart',
                l: [['Boyasız göçük düzeltme', 'C62', 3, 900, 20, { PLAKA: '42 ABC 117' }], ['Arka çamurluk lokal boya', 'C62', 1, 3800, 20]],
            },
            {
                k: 'fatura', n: 'Damper İmalatı e-Faturası', w: 'Nakliye firmasının kamyon şasisine hardox damper imalatı ve montajı; mal teslimi.', lay: 'endustri', to: { f: 'Konya Hafriyat Nakliyat Ltd. Şti.', city: 'Konya' }, pay: 'senet:90',
                l: [['Hardox damper kasa 16 m³', 'C62', 1, 680000, 20, { SASI: 'WDB9302031L418277', MALZEME: 'Hardox 450' }], ['Hidrolik kaldırma sistemi', 'SET', 1, 145000, 20]],
            },
        ],
    },
    {
        code: 'H.13', sector: 'kuyumcu', icon: 'diamond', c: ['#a16207', '#fef08a'], f: 'Altınbaş Kuyumculuk', o: 'Kemal Altun', city: 'İstanbul', slogan: 'Altın · pırlanta · gümüş · takı',
        why: 'Kuyumcu ziynet eşyası satışında özel matrah uygular: altında 805, gümüşte 808 kodu ile InvoiceTypeCode OZELMATRAH, KDV yalnız satış bedeli ile has / alış değeri arasındaki fark (işçilik + kâr) üzerinden hesaplanır. Müşteriden kullanılmış / hurda altın alımı e-Kıymetli Maden Alım belgesi (CreditNote, EKIYMETLIMADENBELGE, birim gram) ile belgelenir.',
        docs: [
            {
                k: 'arsiv/om:805', n: 'Altın Bilezik Satışı e-Arşiv (Özel Matrah 805)', w: 'Müşteriye 22 ayar bilezik ve küpe; KDV yalnız işçilik / kâr farkından, ayar-milyem-gram satırda.', lay: 'zarif', pay: 'kart',
                l: [['22 ayar burma bilezik', 'GRM', 30, 4120, 20, { AYAR: '22', MILYEM: '916', HAS: '27,48', ISCILIK: '150 TL/gr' }, { om: 6200 }], ['14 ayar pırlanta tektaş küpe (0,10 ct)', 'C62', 1, 28500, 20, { AYAR: '14', MILYEM: '585' }, { om: 9800 }]],
            },
            {
                k: 'kmaden', n: 'Müşteriden Hurda Altın Alımı', w: 'Bireysel müşteriden kullanılmış altın bilezik ve çeyrek alımı; gram, ayar ve milyem bilgisi.', lay: 'defter',
                l: [['Kullanılmış 22 ayar bilezik', 'GRM', 22.4, 3780, 0, { AYAR: '22', MILYEM: '916' }], ['Çeyrek altın (eski tarihli)', 'C62', 4, 6650, 0, { AYAR: '22' }]],
            },
            {
                k: 'fatura/om:808', n: 'Kuyumcuya Toptan Gümüş Takı (Özel Matrah 808)', w: 'Başka bir kuyumcuya 925 ayar gümüş takı toptan satışı; KDV işçilik farkından.', lay: 'kurumsal', to: { f: 'Kapalıçarşı Gümüş Takı Ltd. Şti.', city: 'İstanbul' }, pay: 'havale',
                l: [['925 gümüş zincir kolye', 'GRM', 1800, 95, 20, { AYAR: '925', ISCILIK: '38 TL/gr' }, { om: 68400 }], ['925 gümüş yüzük (taşlı)', 'GRM', 600, 110, 20, { AYAR: '925' }, { om: 31800 }]],
            },
        ],
    },
    {
        code: 'H.14', sector: 'metal', icon: 'drill', c: ['#1e40af', '#fbbf24'], f: 'Teknik Makina Montaj Bakım San. Tic. Ltd. Şti.', city: 'Kocaeli', slogan: 'Makine imalatı · kurulum · bakım-onarım', sanayi: true,
        why: 'Makine kurulum-onarım firması belirlenmiş alıcılara makine-teçhizat bakım onarımında 603 kodlu 7/10 tevkifatlı e-Fatura, özel makine imalatı ve tesliminde normal e-Fatura düzenler; yurt dışına makine satışı IHRACAT profiliyle yapılır.',
        docs: [
            {
                k: 'fatura/tevkifat:603', n: 'Pres Bakım-Onarım Faturası (Tevkifat 603)', w: 'Otomotiv yan sanayi fabrikasındaki hidrolik presin revizyonu; 7/10 tevkifat, servis formu referanslı.', lay: 'teknik', to: { f: 'Gebze Metal Pres San. A.Ş.', city: 'Kocaeli', sanayi: true }, pay: 'vade:30',
                l: [['Hidrolik pres revizyonu (400 ton)', 'C62', 1, 185000, 20, { MAKINE: 'HP-400 seri 2011-118' }], ['Hidrolik pompa ve conta seti', 'SET', 1, 64000, 20], ['Teknisyen işçiliği', 'HUR', 46, 1200, 20]],
                r: [['SERVISFORM', 'TMM-SF-26-0441']],
            },
            {
                k: 'fatura', n: 'Özel Makine İmalatı e-Faturası', w: 'Ambalaj firmasına otomatik koli bantlama hattı imalatı ve devreye alma.', lay: 'endustri', to: { f: 'Körfez Ambalaj Kağıt Karton San. A.Ş.', city: 'Kocaeli', sanayi: true }, pay: 'senet:120',
                l: [['Otomatik koli bantlama makinesi', 'C62', 2, 420000, 20, { SERINO: 'TMM-KB-26-01/02', GARANTI: '2 yıl' }], ['Konveyör hattı (12 m)', 'C62', 1, 160000, 20], ['Montaj ve devreye alma', 'C62', 1, 45000, 20]],
            },
            {
                k: 'ihracat', n: 'Azerbaycan\'a Makine İhracatı (CIP)', w: 'Bakü\'deki fabrikaya dolum makinesi ihracatı; GTİP 8422, sandıklı kara yolu.', lay: 'serit', to: 'AZ', cur: 'EUR', inc: 'CIP', mode: 3, pkg: 'CS',
                l: [['Sıvı dolum makinesi (8 nozul)', 'C62', 1, 68000, 0, {}, { g: '842230000000', kap: 3 }], ['Yedek parça seti', 'SET', 1, 4200, 0, {}, { g: '842290900000', kap: 1 }]],
            },
        ],
    },
    {
        code: 'H.15', sector: 'metal', icon: 'settings', c: ['#0f766e', '#fde68a'], f: 'Ostim Rulman ve Makina Yedek Parça Tic. Ltd. Şti.', city: 'Ankara', slogan: 'Rulman · kayış · tarım makinesi yedek parça',
        why: 'Makine yedek parça ticareti fabrikalara e-Fatura ve araçla sevkte e-İrsaliye ile; çiftçi ve bireysel ustalar gibi e-Fatura mükellefi olmayan alıcılara e-Arşiv ile yapılır. Parça / OEM numarası satırda taşınır.',
        docs: [
            {
                k: 'fatura', n: 'Fabrikaya Rulman ve Kayış e-Faturası', w: 'Gıda fabrikasının bakım deposuna rulman, V kayışı ve keçe; OEM numaraları satırda.', lay: 'teknik', to: { f: 'Başkent Un Sanayi A.Ş.', city: 'Ankara', sanayi: true }, pay: 'vade:30',
                l: [['Rulman 6205-2RS', 'C62', 120, 145, 20, { OEM: 'SKF 6205-2RSH' }], ['V kayışı SPB 2000', 'C62', 40, 380, 20], ['Mil keçesi 45x62x8', 'C62', 80, 55, 20]],
                r: [['SIPARIS', 'BUN-BK-26-418']],
            },
            {
                k: 'irsaliye', n: 'Yedek Parça Sevk İrsaliyesi', w: 'Mağazadan fabrikaya koli sevki.', lay: 'kenar', to: { f: 'Başkent Un Sanayi A.Ş.', city: 'Ankara', sanayi: true }, kg: 96, kap: 6,
                l: [['Rulman 6205-2RS', 'C62', 120, 0, 20], ['V kayışı SPB 2000', 'C62', 40, 0, 20], ['Mil keçesi 45x62x8', 'C62', 80, 0, 20]],
            },
            {
                k: 'arsiv', n: 'Çiftçiye Traktör Yedek Parça e-Arşiv', w: 'Çiftçiye traktör debriyaj seti ve filtre satışı.', lay: 'fis', pay: 'nakit',
                l: [['Traktör debriyaj seti', 'SET', 1, 9800, 20, { OEM: 'NH 5165890' }], ['Hava filtresi', 'C62', 1, 850, 20], ['Hidrolik yağ 20 lt', 'C62', 1, 2600, 20]],
            },
        ],
    },
    {
        code: 'H.16', sector: 'otomotiv', icon: 'bike', c: ['#16a34a', '#bbf7d0'], f: 'Pedal Bisiklet Atölyesi', o: 'Tolga Bulut', city: 'Sakarya', slogan: 'Bisiklet imalatı · onarım · bakım',
        why: 'Bisiklet atölyesi bireysel onarım ve satışlarda e-Arşiv; belediyelerin bisiklet paylaşım sistemi bakımı gibi kamu işlerinde KAMU senaryolu e-Fatura (IBAN zorunlu) düzenler.',
        docs: [
            {
                k: 'arsiv', n: 'Bisiklet Bakım-Onarım e-Arşiv', w: 'Dağ bisikletinin periyodik bakımı, fren ve vites ayarı.', lay: 'fis', pay: 'kart',
                l: [['Periyodik bakım (tam)', 'C62', 1, 900, 20], ['Hidrolik fren balatası', 'PR', 2, 350, 20], ['Zincir değişimi (12 vites)', 'C62', 1, 1100, 20]],
            },
            {
                k: 'fatura/kamu', n: 'Belediyeye Bisiklet Filo Bakımı (KAMU)', w: 'Belediyenin akıllı bisiklet paylaşım sistemindeki bisikletlerin aylık bakım hizmeti; KAMU senaryosu.', lay: 'kurumsal', to: { f: 'Adapazarı Belediye Başkanlığı', city: 'Sakarya' }, pay: 'havale',
                per: ['2026-09-01', null, 'Eylül 2026 bakım dönemi', '2026-09-30'],
                l: [['Paylaşımlı bisiklet periyodik bakım', 'C62', 180, 420, 20], ['Lastik ve iç lastik değişimi', 'C62', 64, 380, 20]],
                r: [['IHALE', '2026/DT-0418', 'Doğrudan temin']],
            },
        ],
    },
    {
        code: 'H.17', sector: 'otomotiv', icon: 'gauge', c: ['#dc2626', '#1f2937'], f: 'Hız Motor Motosiklet Bayi Ltd. Şti.', city: 'İzmir', slogan: 'Yeni ve ikinci el motosiklet · scooter',
        why: 'Motosiklet bayisi tescil öncesi ilk satışta ÖTV (II) sayılı liste vergisini (TaxTypeCode 9077, KDV matrahına dahil) faturada gösterir; tüketiciye e-Arşiv, kurye firmalarına e-Fatura düzenler. İkinci el motosiklet satışında özel matrah 812 (KDV yalnız alış-satış farkından) uygulanır.',
        docs: [
            {
                k: 'arsiv', n: 'Sıfır Scooter Satışı e-Arşiv (ÖTV)', w: 'Tüketiciye 125 cc scooter satışı; şasi ve motor no satırda, ÖTV (II) liste KDV matrahına dahil.', lay: 'modern', pay: 'kart',
                l: [['Scooter 125 cc (2026 model)', 'C62', 1, 78000, 20, { SASI: 'LZSJCML07T5418277', MOTORNO: 'JF81E-4418277', MODELYILI: '2026' }, { taxes: [{ code: '9077', name: 'ÖTV (II) SAYILI LİSTE', pct: 8 }] }], ['Kask ve kilit seti', 'SET', 1, 3500, 20]],
            },
            {
                k: 'fatura', n: 'Kurye Firmasına Toplu Motosiklet e-Faturası', w: 'Kurye şirketine 10 adet 125 cc motosiklet; her satırda ÖTV (II) liste.', lay: 'kurumsal', to: { f: 'Ege Hızlı Kurye Dağıtım Ltd. Şti.', city: 'İzmir' }, pay: 'senet:60',
                l: [['Motosiklet 125 cc (kurye tipi, arka çanta)', 'C62', 10, 72000, 20, { MODELYILI: '2026' }, { taxes: [{ code: '9077', name: 'ÖTV (II) SAYILI LİSTE', pct: 8 }] }]],
            },
            {
                k: 'arsiv/om:812', n: 'İkinci El Motosiklet Satışı (Özel Matrah 812)', w: 'İkinci el motosiklet satışı; KDV yalnız alış ile satış arasındaki farktan, noter satış bilgisi.', lay: 'kart', pay: 'havale',
                l: [['İkinci el motosiklet 650 cc (2022 model)', 'C62', 1, 365000, 20, { PLAKA: '35 HMR 41', KM: '18.400', MODELYILI: '2022' }, { om: 24000 }]],
                r: [['NOTER', 'İzmir 21. Noterliği 26/18842']],
            },
        ],
    },
    {
        code: 'H.18', sector: 'otomotiv', icon: 'car', c: ['#1d4ed8', '#bfdbfe'], f: 'Güven Oto Servis', o: 'Erkan Polat', city: 'Ankara', slogan: 'Periyodik bakım · mekanik · traktör onarımı',
        why: 'Oto servis bireysel müşteriye bakım-onarımda e-Arşiv; kamu idareleri, filo şirketleri gibi belirlenmiş alıcılara taşıt bakım onarımında 603 kodlu 7/10 tevkifatlı e-Fatura düzenler. Plaka, km ve iş emri numarası satır / belge alanlarında taşınır.',
        docs: [
            {
                k: 'arsiv', n: 'Periyodik Bakım e-Arşiv', w: 'Bireysel araç sahibine 60.000 km periyodik bakım; parça ve işçilik ayrı satırda.', lay: 'fis', pay: 'kart',
                l: [['Motor yağı 5W-30 (5 lt)', 'C62', 1, 2400, 20, { PLAKA: '06 GOS 318', KM: '60.120' }], ['Yağ, hava, polen filtresi seti', 'SET', 1, 1800, 20], ['Ön fren balatası', 'SET', 1, 2600, 20], ['Bakım işçiliği', 'HUR', 2.5, 1100, 20]],
                r: [['IS_EMRI', 'GOS-26-4418']],
            },
            {
                k: 'fatura/tevkifat:603', n: 'Filo Araç Bakımı (Tevkifat 603)', w: 'Kargo şirketinin hafif ticari araçlarının aylık bakım-onarımı; 7/10 tevkifat.', lay: 'teknik', to: { f: 'Anadolu Kargo Lojistik A.Ş.', city: 'Ankara' }, pay: 'vade:30',
                per: ['2026-09-01', null, 'Eylül 2026 bakım dönemi', '2026-09-30'],
                l: [['Panelvan periyodik bakım', 'C62', 14, 6800, 20], ['Debriyaj seti değişimi', 'C62', 2, 14500, 20, { PLAKA: '06 AKL 114 / 06 AKL 127' }]],
                r: [['SOZLESME', 'AKL-BKM-2026']],
            },
        ],
    },
    {
        code: 'H.19', sector: 'otomotiv', icon: 'paintbrush', c: ['#c2410c', '#ffedd5'], f: 'Renk Oto Boya', o: 'Hüseyin Polat', city: 'İzmir', slogan: 'Fırın boya · lokal boya · pasta cila',
        why: 'Oto boyacı bireysel araç sahiplerine e-Arşiv düzenler; sigorta şirketi adına yapılan hasar onarımlarında fatura sigorta şirketine (belirlenmiş alıcı) 603 kodlu 7/10 KDV tevkifatlı e-Fatura olarak kesilir, hasar dosya no ve poliçe belge referansıdır.',
        docs: [
            {
                k: 'arsiv', n: 'Oto Boya e-Arşiv', w: 'Araç sahibine kaput ve tampon boyası, pasta cila.', lay: 'fis', pay: 'kart',
                l: [['Kaput boya (fırın)', 'C62', 1, 5500, 20, { PLAKA: '35 RNK 220', RENK: 'Metalik gri' }], ['Arka tampon boya', 'C62', 1, 3200, 20], ['Pasta cila (tüm araç)', 'C62', 1, 2500, 20]],
            },
            {
                k: 'fatura/tevkifat:603', n: 'Sigorta Hasar Onarımı (Tevkifat 603)', w: 'Kasko kapsamındaki aracın boya onarımı; fatura sigorta şirketine, hasar dosya no ve poliçe referanslı.', lay: 'teknik', to: { f: 'Ege Sigorta A.Ş.', city: 'İzmir' }, pay: 'vade:30',
                l: [['Sol yan boya (2 kapı + marşpiyel)', 'C62', 1, 14500, 20, { PLAKA: '35 ZK 4418' }], ['Boya malzemesi', 'C62', 1, 6200, 20]],
                r: [['HASAR', 'ES-2026-HSR-118842'], ['POLICE', 'ES-KSK-26-44180'], ['EKSPERTIZ', 'Eksper raporu 26/0912']],
            },
        ],
    },
    {
        code: 'H.20', sector: 'otomotiv', icon: 'armchair', c: ['#7c2d12', '#e7e5e4'], f: 'Konfor Oto Döşeme', o: 'Burak Kaya', city: 'Bursa', slogan: 'Deri koltuk · tavan döşeme · otobüs koltuğu',
        why: 'Oto döşemeci bireysel müşterilere e-Arşiv; otobüs firmaları gibi belirlenmiş alıcıların taşıt koltuklarının yenilenmesinde (taşıt tadil-onarımı) 603 kodlu 7/10 tevkifatlı e-Fatura düzenler.',
        docs: [
            {
                k: 'arsiv', n: 'Deri Koltuk Kaplama e-Arşiv', w: 'Otomobil koltuklarının hakiki deri kaplaması ve tavan döşemesi.', lay: 'kart', pay: 'kart',
                l: [['Koltuk deri kaplama (5 koltuk)', 'SET', 1, 18500, 20, { PLAKA: '16 KOD 118', RENK: 'Taba' }], ['Tavan döşeme yenileme', 'C62', 1, 4500, 20]],
            },
            {
                k: 'fatura/tevkifat:603', n: 'Otobüs Koltuk Yenileme (Tevkifat 603)', w: 'Şehirler arası otobüs firmasının koltuk döşemelerinin yenilenmesi; 7/10 tevkifat.', lay: 'teknik', to: { f: 'Uludağ Turizm Seyahat A.Ş.', city: 'Bursa' }, pay: 'vade:30',
                l: [['Otobüs koltuğu döşeme yenileme', 'C62', 46, 2400, 20, { PLAKA: '16 UT 4418' }], ['Koltuk süngeri değişimi', 'C62', 46, 650, 20]],
            },
        ],
    },
    {
        code: 'H.21', sector: 'otomotiv', icon: 'battery-charging', c: ['#ca8a04', '#1e293b'], f: 'Volt Oto Elektrik', o: 'Cem Arslan', city: 'Konya', slogan: 'Akü · marş · şarj dinamosu · arıza tespit',
        why: 'Oto elektrikçi bireysel müşterilere e-Arşiv düzenler; belediye otobüsleri gibi kamu araçlarının elektrik onarımında KAMU senaryosu ile 603 (7/10) KDV tevkifatı birlikte uygulanır.',
        docs: [
            {
                k: 'arsiv', n: 'Akü ve Marş Onarımı e-Arşiv', w: 'Araç sahibine akü değişimi ve marş motoru onarımı.', lay: 'fis', pay: 'kart',
                l: [['Akü 72 Ah', 'C62', 1, 4200, 20, { PLAKA: '42 VLT 72', GARANTI: '2 yıl' }], ['Marş motoru kömür ve bendiks değişimi', 'C62', 1, 1800, 20], ['Arıza tespit (OBD)', 'C62', 1, 500, 20]],
            },
            {
                k: 'fatura/kamu/tevkifat:603', n: 'Belediye Otobüsü Elektrik Onarımı (KAMU + 603)', w: 'Belediye otobüslerinin şarj dinamosu ve aydınlatma onarımı; KAMU senaryosu ve 7/10 tevkifat.', lay: 'kurumsal', to: { f: 'Konya Büyükşehir Belediyesi Ulaşım Daire Başkanlığı', city: 'Konya' }, pay: 'havale',
                l: [['Şarj dinamosu revizyonu', 'C62', 6, 6800, 20], ['LED iç aydınlatma onarımı', 'C62', 12, 1200, 20]],
                r: [['IHALE', '2026/DT-7741', 'Doğrudan temin']],
            },
        ],
    },
    {
        code: 'H.22', sector: 'otomotiv', icon: 'circle-dot', c: ['#1f2937', '#facc15'], f: 'Yol Lastik Tamir', o: 'Recep Yıldız', city: 'Afyonkarahisar', slogan: '7/24 lastik tamiri · balans · kaplama',
        why: 'Lastik tamircisi bireysel sürücülere e-Arşiv; lojistik firmaları gibi belirlenmiş alıcıların TIR lastiklerinin onarımında 603 kodlu 7/10 tevkifatlı e-Fatura düzenler.',
        docs: [
            {
                k: 'arsiv', n: 'Lastik Tamiri ve Balans e-Arşiv', w: 'Yol yardımı ile lastik tamiri, balans ve sibop değişimi.', lay: 'fis', pay: 'nakit',
                l: [['Lastik tamiri (mantar)', 'C62', 1, 400, 20, { PLAKA: '03 YLT 18' }], ['Balans ayarı', 'C62', 4, 150, 20], ['Sibop değişimi', 'C62', 4, 40, 20]],
            },
            {
                k: 'fatura/tevkifat:603', n: 'TIR Lastik Onarımı (Tevkifat 603)', w: 'Lojistik şirketinin çekici ve dorse lastiklerinin onarımı ve sırt kaplaması; 7/10 tevkifat.', lay: 'teknik', to: { f: 'Anadolu Transit Lojistik A.Ş.', city: 'Afyonkarahisar' }, pay: 'vade:30',
                l: [['TIR lastiği vulkanize tamir', 'C62', 6, 1200, 20], ['Lastik sırt kaplama 315/80 R22.5', 'C62', 8, 6500, 20]],
            },
        ],
    },
    {
        code: 'H.23', sector: 'otomotiv', icon: 'disc', c: ['#111827', '#9ca3af'], f: 'Lastikçi Kardeşler Oto Lastik Tic. Ltd. Şti.', city: 'Bursa', slogan: 'Yaz · kış · 4 mevsim lastik · jant',
        why: 'Lastik satıcısı tüketiciye montajlı satışta e-Arşiv, filolara ve servislere toptan satışta e-Fatura düzenler. Lastik ebadı, DOT üretim haftası ve marka satırda taşınır.',
        docs: [
            {
                k: 'arsiv', n: 'Kış Lastiği Satışı e-Arşiv', w: 'Araç sahibine 4 adet kış lastiği, montaj ve balans; DOT haftası satırda.', lay: 'fis', pay: 'kart',
                l: [['Kış lastiği 205/55 R16 91H', 'C62', 4, 3900, 20, { MARKA: 'Lassa', URETIM: 'DOT 3226' }], ['Montaj + balans', 'C62', 4, 200, 20], ['Lastik oteli (sezonluk)', 'C62', 1, 1200, 20]],
            },
            {
                k: 'fatura', n: 'Filoya Toptan Lastik e-Faturası', w: 'Araç kiralama şirketine toptan yaz lastiği satışı; ebat bazlı satırlar.', lay: 'kurumsal', to: { f: 'Anadolu Filo Kiralama A.Ş.', city: 'Konya' }, pay: 'vade:60',
                l: [['Yaz lastiği 195/65 R15', 'C62', 120, 2700, 20, { URETIM: 'DOT 2826' }], ['Yaz lastiği 215/60 R17', 'C62', 60, 4100, 20, { URETIM: 'DOT 2926' }]],
                r: [['SIPARIS', 'AFK-LST-26-09']],
            },
        ],
    },
    {
        code: 'H.24', sector: 'otomotiv', icon: 'fuel', c: ['#0369a1', '#fde047'], f: 'Gaz Oto LPG Dönüşüm', o: 'Osman Akın', city: 'Ankara', slogan: 'LPG / CNG dönüşüm · bakım · TSE uygunluk',
        why: 'LPG montajcısı bireysel araç sahiplerine dönüşüm ve bakımda e-Arşiv; taksi kooperatifi gibi işletmelere toplu dönüşümde e-Fatura düzenler. Dönüşüm sonrası TSE / mühendis raporu ve ruhsat tadil bilgisi belge referansıdır.',
        docs: [
            {
                k: 'arsiv', n: 'LPG Dönüşüm e-Arşiv', w: 'Benzinli otomobile sıralı LPG sistemi montajı; kit seri no ve tank bilgisi.', lay: 'teknik', pay: 'kart',
                l: [['Sıralı enjeksiyon LPG kiti', 'SET', 1, 21000, 20, { PLAKA: '06 GZO 118', SERINO: 'BRC-SQ-26-4418' }], ['Silindirik LPG tankı 60 lt', 'C62', 1, 5800, 20], ['Montaj ve ayar işçiliği', 'C62', 1, 6500, 20]],
                r: [['RAPOR', 'Mühendis uygunluk raporu 26/0441']],
            },
            {
                k: 'fatura', n: 'Taksi Kooperatifine Toplu Dönüşüm e-Faturası', w: 'Taksi kooperatifine bağlı araçların LPG dönüşümü ve periyodik LPG bakımı.', lay: 'kurumsal', to: { f: 'Kızılay Taksi Durağı Kooperatifi', city: 'Ankara' }, pay: 'vade:30',
                l: [['Sıralı LPG dönüşümü (taksi)', 'C62', 8, 31000, 20], ['LPG periyodik bakım (filtre + ayar)', 'C62', 20, 1100, 20]],
            },
        ],
    },
    {
        code: 'H.25', sector: 'otomotiv', icon: 'cog', c: ['#991b1b', '#fca5a5'], f: 'Marmara Fren Sistemleri San. A.Ş.', city: 'Bursa', slogan: 'Fren balatası · disk · OEM tedarik', sanayi: true,
        why: 'Oto yedek parça imalatçısı otomotiv ana sanayi ve distribütörlere e-Fatura, tam zamanında (JIT) sevkiyatlarda e-İrsaliye, yurt dışı müşterilere IHRACAT profilli fatura düzenler. OEM parça no ve lot satırda taşınır.',
        docs: [
            {
                k: 'fatura', n: 'Ana Sanayiye Fren Balatası e-Faturası', w: 'Otomotiv fabrikasına OEM fren balatası ve disk; parça no ve lot satırda.', lay: 'endustri', to: { f: 'Bursa Otomotiv Sanayi A.Ş.', city: 'Bursa', sanayi: true }, pay: 'vade:90',
                l: [['Ön fren balatası (OEM)', 'SET', 8000, 310, 20, { OEM: '7701208118', LOT: 'MFS-2609-12' }], ['Fren diski Ø 280', 'C62', 6000, 540, 20, { OEM: '402060010R' }]],
                r: [['SIPARIS', 'BOS-PO-26-77812'], ['IRSALIYE', 'MFS2026000018842']],
            },
            {
                k: 'irsaliye', n: 'JIT Sevk İrsaliyesi', w: 'Montaj hattına tam zamanında sevkiyat; kasa ve palet bilgisi.', lay: 'teknik', to: { f: 'Bursa Otomotiv Sanayi A.Ş.', city: 'Bursa', sanayi: true }, kg: 9600, kap: 20,
                l: [['Ön fren balatası (OEM)', 'SET', 8000, 0, 20, { KASA: '160 kasa · 10 palet' }], ['Fren diski Ø 280', 'C62', 6000, 0, 20, { KASA: '10 palet' }]],
                r: [['SIPARIS', 'BOS-PO-26-77812']],
            },
            {
                k: 'ihracat', n: 'Fren Parçası İhracat Faturası (FCA)', w: 'Almanya\'daki distribütöre fren balatası ihracatı; GTİP 8708.', lay: 'serit', to: 'DE', cur: 'EUR', inc: 'FCA', mode: 3, pkg: 'PX',
                l: [['Fren balatası seti (aftermarket)', 'SET', 12000, 7.4, 0, {}, { g: '870830910000', kap: 24 }], ['Fren diski', 'C62', 4000, 11.8, 0, {}, { g: '870830910000', kap: 16 }]],
            },
        ],
    },
    {
        code: 'H.26', sector: 'otomotiv', icon: 'package-search', c: ['#1e3a8a', '#fbbf24'], f: 'Sanayi Oto Yedek Parça Tic. Ltd. Şti.', city: 'Ankara', slogan: 'Orijinal · muadil · çıkma oto yedek parça',
        why: 'Oto yedek parça satıcısı servislere e-Fatura, internetten tüketiciye e-Arşiv internet satışı, yurt dışından gelen küçük siparişlerde ETGB\'li mikro ihracat düzenler. OEM numarası ve araç uyumluluğu satırda gösterilir.',
        docs: [
            {
                k: 'fatura', n: 'Servise Yedek Parça e-Faturası', w: 'Oto servise amortisör, triger seti ve filtre; OEM numaraları satırda.', lay: 'teknik', to: { f: 'Güven Oto Servis Ltd. Şti.', city: 'Ankara' }, pay: 'vade:30',
                l: [['Ön amortisör (çift)', 'PR', 4, 3400, 20, { OEM: '54302-4EA0B' }], ['Triger seti + devirdaim', 'SET', 3, 4800, 20], ['Yağ filtresi', 'C62', 30, 180, 20]],
            },
            {
                k: 'arsiv/net', n: 'Online Yedek Parça Satışı e-Arşiv (İnternet)', w: 'Web mağazasından tüketiciye fren seti siparişi; araç uyumluluğu ve kargo bilgisi.', lay: 'modern',
                l: [['Ön fren disk + balata seti', 'SET', 1, 4200, 20, { OEM: '1K0615301AA', OZELLIK: 'Golf 7 uyumlu' }], ['Fren hidroliği DOT4 1 lt', 'C62', 1, 320, 20]],
            },
            {
                k: 'mikro', n: 'Yurt Dışı Parça Siparişi Mikro İhracat (ETGB)', w: 'Gürcistan\'daki müşteriye far ve ayna camı gönderimi; ETGB ve GTİP.', lay: 'kart', to: 'GE', cur: 'USD',
                l: [['Ön far (sağ)', 'C62', 1, 145, 0, {}, { g: '851220000000' }], ['Ayna camı (ısıtmalı)', 'C62', 2, 22, 0, {}, { g: '700910000000' }]],
            },
        ],
    },
    {
        code: 'H.27', sector: 'otomotiv', icon: 'spray-can', c: ['#0ea5e9', '#e0f2fe'], f: 'Köpük Oto Yıkama ve Kuaför', o: 'Barış Şahin', city: 'İstanbul', slogan: 'İç-dış yıkama · seramik kaplama · yağlama',
        why: 'Oto yıkamacı bireysel müşteriye e-Arşiv; araç kiralama ve filo şirketlerine aylık toplu yıkama hizmetinde e-Fatura düzenler (yıkama, taşıt bakım-onarımı sayılmadığından 603 tevkifatı uygulanmaz).',
        docs: [
            {
                k: 'arsiv', n: 'Oto Yıkama ve Kaplama e-Arşiv', w: 'Araç iç-dış detaylı yıkama ve seramik kaplama.', lay: 'fis', pay: 'kart',
                l: [['İç-dış detaylı yıkama', 'C62', 1, 900, 20, { PLAKA: '34 KPK 34' }], ['Seramik kaplama (9H)', 'C62', 1, 9500, 20], ['Motor yıkama', 'C62', 1, 400, 20]],
            },
            {
                k: 'fatura', n: 'Kiralama Şirketine Aylık Yıkama e-Faturası', w: 'Araç kiralama şirketinin teslim öncesi araç yıkamaları; araç adedi bazlı aylık fatura.', lay: 'kurumsal', to: { f: 'İstanbul Rent A Car Turizm A.Ş.', city: 'İstanbul' }, pay: 'vade:15',
                per: ['2026-09-01', null, 'Eylül 2026', '2026-09-30'],
                l: [['Teslim öncesi iç-dış yıkama', 'C62', 420, 450, 20], ['Koltuk yıkama', 'C62', 18, 1200, 20]],
            },
        ],
    },
    {
        code: 'H.28', sector: 'perakende', icon: 'watch', c: ['#0f172a', '#d4af37'], f: 'Zaman Saat Galerisi', o: 'Ali Özkan', city: 'İstanbul', slogan: 'Kol saati · servis · pil ve kordon',
        why: 'Saatçi tüketiciye satış ve servis hizmetinde e-Arşiv (seri no ve garanti satırda), yabancı turistlere yolcu beraberi eşya faturası (Tax Free) düzenler.',
        docs: [
            {
                k: 'arsiv', n: 'Kol Saati Satışı e-Arşiv', w: 'Müşteriye otomatik kol saati satışı; seri no ve garanti süresi satırda.', lay: 'zarif', pay: 'kart',
                l: [['Otomatik kol saati (safir cam)', 'C62', 1, 38500, 20, { MARKA: 'Tissot', SERINO: 'T1374071105100-4418', GARANTI: '2 yıl' }], ['Deri kordon (ek)', 'C62', 1, 1200, 20]],
            },
            {
                k: 'yolcu', n: 'Turiste Saat Satışı (Yolcu Beraberi)', w: 'Yabancı turiste lüks kol saati satışı; pasaport ve aracı kurum bilgisi.', lay: 'serit', pay: 'kart',
                l: [['İsviçre otomatik kronograf', 'C62', 1, 92000, 20, { SERINO: 'ZSG-CH-26-118' }]],
            },
            {
                k: 'arsiv', n: 'Saat Bakım ve Onarım e-Arşiv', w: 'Mekanik saatin genel bakımı, cam ve pil değişimi.', lay: 'fis', pay: 'nakit', slug: 'saat-bakim-ve-onarim-e-arsiv',
                l: [['Mekanik saat genel bakım', 'C62', 1, 3500, 20], ['Safir cam değişimi', 'C62', 1, 1800, 20], ['Pil değişimi', 'C62', 2, 250, 20]],
                r: [['SERVISFORM', 'ZSG-SRV-26-0441']],
            },
        ],
    },
    {
        code: 'H.29', sector: 'teknik-servis', icon: 'thermometer-sun', c: ['#b91c1c', '#fde68a'], f: 'Ateş Soba ve Şofben Servisi', o: 'Halil Doğan', city: 'Erzurum', slogan: 'Kuzine · soba · şofben · baca',
        why: 'Soba ve şofben satıcısı / servisi hanelere satış ve onarımda e-Arşiv; okul ve köy konakları gibi kamu idarelerine soba tesliminde KAMU senaryolu e-Fatura (IBAN zorunlu) düzenler.',
        docs: [
            {
                k: 'arsiv', n: 'Kuzine Soba Satış ve Montaj e-Arşiv', w: 'Haneye fırınlı kuzine soba, baca borusu ve montaj.', lay: 'defter', pay: 'nakit',
                l: [['Fırınlı kuzine soba (döküm)', 'C62', 1, 14500, 20], ['Baca borusu ve dirsek seti', 'SET', 1, 1800, 20], ['Montaj ve baca kontrolü', 'C62', 1, 900, 20]],
            },
            {
                k: 'fatura/kamu', n: 'Köy Okullarına Soba Teslimi (KAMU)', w: 'İl Milli Eğitim Müdürlüğüne köy okulları için kömür sobası teslimi; KAMU senaryosu.', lay: 'kurumsal', to: { f: 'Erzurum İl Milli Eğitim Müdürlüğü', city: 'Erzurum' }, pay: 'havale',
                l: [['Kömür sobası (okul tipi, büyük)', 'C62', 40, 9800, 20], ['Baca borusu seti', 'SET', 40, 1500, 20]],
                r: [['IHALE', '2026/611842', 'Açık ihale']],
            },
        ],
    },
    {
        code: 'H.30', sector: 'insaat', icon: 'house', c: ['#7f1d1d', '#d6d3d1'], f: 'Çatı Usta Tenekecilik', o: 'Murat Arslan', city: 'Trabzon', slogan: 'Çatı · oluk · trapez sac kaplama',
        why: 'Tenekeci / çatı ustası ev sahiplerine çatı onarımında e-Arşiv; müteahhit firmalara alt yüklenici olarak yaptığı çatı işleri yapım işi sayıldığından 601 kodlu 4/10 tevkifatlı e-Fatura düzenler.',
        docs: [
            {
                k: 'arsiv', n: 'Çatı Oluk ve Kaplama e-Arşiv', w: 'Ev sahibine galvaniz oluk, dere ve çatı kaplama onarımı.', lay: 'defter', pay: 'havale',
                l: [['Galvaniz yağmur oluğu', 'MTR', 42, 380, 20], ['Oluk iniş borusu', 'MTR', 18, 260, 20], ['Çatı kaplama onarımı (trapez sac)', 'MTK', 36, 640, 20]],
            },
            {
                k: 'fatura/tevkifat:601', n: 'Müteahhide Çatı İşleri (Tevkifat 601)', w: 'Konut projesinin çatı kaplama ve oluk işleri; yapım işi, 4/10 tevkifat ve hakediş referansı.', lay: 'kurumsal', to: { f: 'Karadeniz Yapı İnşaat A.Ş.', city: 'Trabzon' }, pay: 'vade:30',
                per: ['2026-09-01', null, '2 No.lu hakediş dönemi', '2026-09-30'],
                l: [['Sandviç panel çatı kaplama', 'MTK', 860, 1150, 20], ['Oluk ve dere işleri', 'MTR', 240, 420, 20]],
                r: [['HAKEDIS', '2'], ['PROJE', 'Akçaabat Sahil Konutları']],
            },
        ],
    },
    {
        code: 'H.31', sector: 'metal', icon: 'drill', c: ['#334155', '#38bdf8'], f: 'Hassas Torna CNC İşleme', o: 'Kaan Öztürk', city: 'Konya', slogan: 'CNC torna · freze · lazer kesim', sanayi: true,
        why: 'Tornacı müşterinin malzemesini fason işler veya kendi malzemesiyle parça imal eder: e-Fatura ile faturalar, işlenmiş parçaların sevkini e-İrsaliye ile yapar. Teknik resim / iş emri numarası belge referansıdır.',
        docs: [
            {
                k: 'fatura', n: 'Fason CNC İşleme e-Faturası', w: 'Makine imalatçısına CNC torna ve freze ile mil ve flanş imalatı; teknik resim no satırda.', lay: 'teknik', to: { f: 'Selçuklu Tarım Makinaları San. A.Ş.', city: 'Konya', sanayi: true }, pay: 'vade:45',
                l: [['Şanzıman mili (42CrMo4, CNC torna)', 'C62', 400, 680, 20, { PARCA: 'STM-TR-1184 Rev.C' }], ['Bağlantı flanşı (CNC freze)', 'C62', 800, 240, 20, { PARCA: 'STM-FL-0412' }], ['Lazer kesim sac parça', 'C62', 1500, 35, 20]],
                r: [['IS_EMRI', 'HTC-26-0918']],
            },
            {
                k: 'irsaliye', n: 'İşlenmiş Parça Sevk İrsaliyesi', w: 'Atölyeden müşteri fabrikasına sandıklı parça sevki.', lay: 'kenar', to: { f: 'Selçuklu Tarım Makinaları San. A.Ş.', city: 'Konya', sanayi: true }, kg: 3800, kap: 12,
                l: [['Şanzıman mili (CNC torna)', 'C62', 400, 0, 20, { SANDIK: '8 sandık' }], ['Bağlantı flanşı (CNC freze)', 'C62', 800, 0, 20, { SANDIK: '4 sandık' }]],
                r: [['IS_EMRI', 'HTC-26-0918']],
            },
        ],
    },
    {
        code: 'H.32', sector: 'enerji', icon: 'flame', c: ['#ea580c', '#fef3c7'], f: 'Alev Tüpgaz Bayii', o: 'Hakan Kara', city: 'Samsun', slogan: 'Tüpgaz · kapıya teslim · EPDK lisanslı',
        why: 'Tüpgaz bayisi hanelere e-Arşiv, restoran ve fırın gibi işletmelere e-Fatura düzenler. LPG\'nin ÖTV\'si (I) sayılı listede dağıtıcı (lisans sahibi) aşamasında alındığından bayi faturasında ayrıca ÖTV satırı yoktur; EPDK lisans no ve tüp seri numarası belgede gösterilir, tüp depozitosu ayrı kayıt edilir.',
        docs: [
            {
                k: 'arsiv', n: 'Ev Tüpü Teslimi e-Arşiv', w: 'Haneye 12 kg tüpgaz kapıya teslim; tüp seri no ve EPDK lisans bilgisi.', lay: 'fis', pay: 'nakit',
                l: [['Tüpgaz 12 kg (dolum)', 'C62', 1, 1450, 20, { TUP: 'TP-12-4418277' }], ['Kapıya teslim', 'C62', 1, 0, 20]],
                r: [['EPDK', 'LPG/BAY/1184-44/2026']],
                nt: ['Boş tüp iade alınmıştır; depozito uygulanmamıştır.'],
            },
            {
                k: 'fatura', n: 'Restorana Sanayi Tüpü e-Faturası', w: 'Restorana aylık 45 kg sanayi tüpü teslimleri; tüp seri numaraları satırda.', lay: 'kurumsal', to: { f: 'Karadeniz Lezzet Restoran Ltd. Şti.', city: 'Samsun' }, pay: 'vade:15',
                per: ['2026-09-01', null, 'Eylül 2026 teslimleri', '2026-09-30'],
                l: [['Sanayi tüpü 45 kg (dolum)', 'C62', 14, 5200, 20, { TUP: 'TP-45-1182…1195' }]],
                r: [['EPDK', 'LPG/BAY/1184-44/2026']],
            },
        ],
    },
];
