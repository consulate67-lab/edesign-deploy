// B — Eğlence, Dinlenme, Organizasyon
export default [
    {
        code: 'B.01', sector: 'etkinlik', icon: 'party-popper', c: ['#c026d3', '#f0abfc'], f: 'Konfeti Organizasyon Ajans Ltd. Şti.', city: 'İzmir', slogan: 'Lansman · kongre · özel gün organizasyonu',
        why: 'Organizasyon ajansı kurumsal müşterilere lansman / toplantı organizasyonu satar; belirlenmiş alıcılara organizasyon hizmetinde 605 kodlu 5/10 KDV tevkifatı uygulanır. Bireysel müşterilere (doğum günü, nişan) e-Arşiv düzenlenir.',
        docs: [
            {
                k: 'fatura/tevkifat:605', n: 'Kurumsal Lansman Organizasyonu (Tevkifat 605)', w: 'Firmanın ürün lansmanı için sahne, ses-ışık, ikram ve hostes hizmetlerini içeren organizasyon; etkinlik tarihi dönem alanında.', lay: 'modern', to: { f: 'Egeli Kozmetik Sanayi A.Ş.', city: 'İzmir' }, pay: 'vade:30',
                per: ['2026-09-26', '18:00:00', 'Ürün lansmanı — Kordon Etkinlik Alanı', '2026-09-26', '23:30:00'],
                l: [['Sahne, LED ekran ve truss kurulumu', 'C62', 1, 145000, 20], ['Ses ve ışık sistemi + teknik ekip', 'C62', 1, 88000, 20], ['Kokteyl ikramı (400 kişi)', 'C62', 400, 450, 20], ['Hostes ve karşılama ekibi', 'HUR', 48, 650, 20]],
                r: [['SOZLESME', 'KNF-2026-077'], ['PROJE', 'Egeli Glow Lansmanı']],
            },
            {
                k: 'arsiv', n: 'Doğum Günü Organizasyonu e-Arşiv', w: 'Bireysel müşteriye çocuk doğum günü organizasyonu; süsleme, animatör ve pasta paketi.', lay: 'pastel', pay: 'kart',
                per: ['2026-10-11', '14:00:00', 'Doğum günü partisi — müşteri adresi', '2026-10-11', '17:00:00'],
                l: [['Balon ve tema süsleme paketi', 'SET', 1, 6500, 20], ['Animatör + yüz boyama (3 saat)', 'HUR', 3, 1500, 20], ['Doğum günü pastası (30 kişilik)', 'C62', 1, 2400, 10]],
            },
        ],
    },
    {
        code: 'B.02', sector: 'etkinlik', icon: 'gem', c: ['#9f1239', '#fecdd3'], f: 'Beyaz Saray Düğün Salonu', o: 'Murat Şahin', city: 'Gaziantep', slogan: 'Düğün · nişan · kına · kurumsal davet',
        why: 'Düğün salonu bireysel düğün paketlerini e-Arşiv ile faturalar; kurumların gala / yılbaşı davetlerinde salon + yemek + organizasyon hizmeti verildiğinden belirlenmiş alıcılarda 605 tevkifatı uygulanır.',
        docs: [
            {
                k: 'arsiv', n: 'Düğün Paketi e-Arşiv', w: 'Düğün sahibine salon kirası, yemekli menü ve süsleme paketi; düğün tarihi ve davetli sayısı belge üzerinde.', lay: 'zarif', pay: 'havale',
                per: ['2026-10-17', '19:00:00', 'Düğün — Kristal Salon', '2026-10-18', '00:00:00'],
                l: [['Salon kirası (Kristal Salon, 5 saat)', 'C62', 1, 60000, 20], ['Yemekli düğün menüsü', 'C62', 450, 520, 10, { MENU: 'Antep menüsü — yuvalama, kebap, baklava' }], ['Gelin masası ve çiçek süsleme', 'SET', 1, 12000, 20], ['Orkestra ve DJ', 'C62', 1, 25000, 20]],
                r: [['SOZLESME', 'BS-2026-0218', 'Kapora sözleşmesi']],
                nt: ['Kapora 120.000 TL sözleşme tarihinde tahsil edilmiştir.'],
            },
            {
                k: 'fatura/tevkifat:605', n: 'Kurumsal Gala Daveti Faturası (Tevkifat 605)', w: 'Sanayi şirketinin bayi gala yemeği için salon, menü ve sahne organizasyonu.', lay: 'kurumsal', to: { f: 'Antep Halı Sanayi ve Ticaret A.Ş.', city: 'Gaziantep', sanayi: true }, pay: 'vade:15',
                per: ['2026-09-30', '19:30:00', 'Bayi gala yemeği'],
                l: [['Salon tahsisi ve organizasyon', 'C62', 1, 75000, 20], ['Gala menüsü', 'C62', 300, 780, 20], ['Sahne, ses-ışık ve sunucu', 'C62', 1, 38000, 20]],
            },
        ],
    },
    {
        code: 'B.03', sector: 'eglence', icon: 'music-4', c: ['#4f46e5', '#a5b4fc'], f: 'Nota Sahne Eğlence Ltd. Şti.', city: 'İstanbul', slogan: 'Canlı müzik · konser · gece kulübü',
        why: 'Eğlence mekânı konser / etkinlik girişlerinde e-Bilet, masa harcamalarında e-Arşiv (adisyon) düzenler. Bilet; etkinlik tarihi, salon, sıra-koltuk ve kapı bilgisini taşır.',
        docs: [
            {
                k: 'bilet', n: 'Konser Giriş e-Bileti', w: 'Canlı konser girişi; etkinlik saati, salon, kapı ve sıra-koltuk ek alanlarla bilet üzerinde.', perTitle: 'Etkinlik', pay: 'kart',
                per: ['2026-10-16', '21:30:00', 'Akustik Gece — canlı konser'],
                l: [['Konser girişi — balkon', 'C62', 2, 1250, 20]],
                r: [['SALON', 'Ana Sahne'], ['KAPI', 'B Kapısı'], ['SIRA', 'Balkon 3'], ['KOLTUKNO', '14-15']],
            },
            {
                k: 'arsiv', n: 'Masa Adisyonu e-Arşiv', w: 'Gece kulübünde masa harcaması; içki ve yiyecekler farklı KDV oranlarında.', lay: 'fis', pay: 'kart',
                l: [['Masa rezervasyon ücreti (4 kişi)', 'C62', 1, 2000, 20, { MASA: 'VIP 7' }], ['Meyve tabağı', 'C62', 1, 900, 10], ['Meşrubat', 'C62', 8, 140, 20], ['Peynir tabağı', 'C62', 2, 650, 10]],
            },
        ],
    },
    {
        code: 'B.04', sector: 'eglence', icon: 'mic-vocal', c: ['#b91c1c', '#fca5a5'], f: 'Boğaziçi Fasıl Gazinosu', o: 'Kaan Yıldırım', city: 'İstanbul', slogan: 'Fasıl · Türk sanat müziği · sahne yemeği',
        why: 'Gazino; giriş + menü kapsayan program biletlerini e-Bilet, tur acentelerine grup satışlarını e-Fatura ile belgeler. Sahneye çıkan sanatçılar gazinoya e-SMM düzenler (gazino stopaj keser).',
        docs: [
            {
                k: 'bilet', n: 'Fasıl Gecesi Programlı e-Bilet', w: 'Fasıl programı + akşam yemeği dahil kişi başı bilet; masa ve program saati bilet alanlarında.', perTitle: 'Program', pay: 'kart',
                per: ['2026-10-10', '20:30:00', 'Cumartesi fasıl gecesi'],
                l: [['Fasıl programı + yemek (kişi)', 'C62', 4, 2400, 10]],
                r: [['MASA', '22'], ['SALON', 'Boğaz Salonu'], ['MENU', 'Fasıl menüsü']],
            },
            {
                k: 'fatura', n: 'Tur Acentesine Grup Satışı e-Faturası', w: 'Yabancı turist grubu için acenteye toplu fasıl gecesi satışı; komisyon iskontosu satırda.', lay: 'kenar', to: { f: 'Anatolia Discovery Turizm Seyahat Acentesi Ltd. Şti.', city: 'İstanbul' }, pay: 'vade:15',
                l: [['Fasıl gecesi grup paketi (kişi)', 'C62', 42, 2100, 10, {}, { disc: { rate: 0.1, reason: 'Acente komisyonu' } }], ['Rehber ve şoför ikramı', 'C62', 2, 0, 10], ['Grup transfer koordinasyonu', 'C62', 1, 3500, 20]],
                r: [['TUR', 'ADT-26-1007'], ['REZERVASYON', 'BFG-2026-0931']],
            },
        ],
    },
    {
        code: 'B.05', sector: 'yeme-icme', icon: 'coffee', c: ['#78350f', '#fde68a'], f: 'Çınaraltı Kıraathanesi', o: 'Recep Polat', city: 'Trabzon', slogan: 'Çay · kahve · oyun salonu',
        why: 'Kahvehanelerin çoğu basit usuldedir; işletme esasına tabi olanlar müşteriye e-Arşiv düzenler. Çevre işyerlerine aylık çay-kahve servisi verildiğinde alıcı e-Fatura mükellefi ise e-Fatura düzenlenir.',
        docs: [
            {
                k: 'arsiv', n: 'Masa Hesabı e-Arşiv', w: 'Müşteri talebiyle düzenlenen masa hesabı; çay, kahve ve oyun ücreti.', lay: 'fis', pay: 'nakit',
                l: [['Çay (ince belli)', 'C62', 12, 20, 10], ['Türk kahvesi', 'C62', 4, 60, 10], ['Okey oyun ücreti (saat)', 'HUR', 2, 80, 20]],
            },
            {
                k: 'fatura', n: 'İşyerine Aylık Çay Servisi e-Faturası', w: 'Çarşıdaki bankaya / işyerine ay boyu verilen çay-kahve servisinin aylık faturası; dönem alanı dolu.', lay: 'defter', to: { f: 'Karadeniz Sigorta Aracılık Hizmetleri Ltd. Şti.', city: 'Trabzon' }, pay: 'havale',
                per: ['2026-09-01', null, 'Eylül 2026 çay-kahve servisi', '2026-09-30'],
                l: [['Çay servisi', 'C62', 640, 18, 10], ['Türk kahvesi servisi', 'C62', 120, 55, 10], ['Bitki çayı', 'C62', 60, 30, 10]],
            },
        ],
    },
    {
        code: 'B.06', sector: 'yeme-icme', icon: 'wine', c: ['#365314', '#bef264'], f: 'Öğretmenler Lokali İşletmesi', o: 'Halil Kurt', city: 'Eskişehir', slogan: 'Üyelere özel lokal · yemek · toplantı salonu',
        why: 'Lokal işletmecisi üye harcamalarını e-Arşiv ile, derneklerin / kurumların toplantı-yemek organizasyonlarını e-Fatura ile faturalar. Yemek hizmeti KDV %10, salon kirası %20.',
        docs: [
            {
                k: 'arsiv', n: 'Üye Harcama e-Arşiv', w: 'Lokal üyesinin yemek ve içecek harcaması; üye kart numarası belge alanında.', lay: 'kart', pay: 'kart',
                l: [['Günün menüsü', 'C62', 2, 380, 10], ['Izgara köfte porsiyon', 'C62', 1, 420, 10], ['Ayran', 'C62', 3, 45, 10]],
                r: [['UYELIK', 'ÖL-0418']],
            },
            {
                k: 'fatura', n: 'Dernek Toplantı Yemeği e-Faturası', w: 'Mesleki derneğin genel kurul sonrası yemek ve salon kullanımı.', lay: 'kurumsal', to: { f: 'Eskişehir Eğitimciler Derneği', city: 'Eskişehir' }, pay: 'havale',
                l: [['Toplantı salonu kullanımı (4 saat)', 'HUR', 4, 1500, 20], ['Akşam yemeği menüsü', 'C62', 85, 520, 10], ['Kahve ikramı', 'C62', 85, 60, 10]],
            },
        ],
    },
    {
        code: 'B.07', sector: 'turizm', icon: 'hotel', c: ['#0e7490', '#67e8f9'], f: 'Akdeniz Mavi Otel Turizm A.Ş.', city: 'Antalya', slogan: 'Otel · pansiyon · öğrenci yurdu',
        why: 'Konaklama tesisleri 7194 sayılı Kanun gereği oda bedeli üzerinden %2 konaklama vergisi hesaplar (InvoiceTypeCode KONAKLAMAVERGISI, TaxTypeCode 0059). Bireysel misafire e-Arşiv, şirkete e-Fatura; öğrenci yurtları konaklama vergisi kapsamı dışındadır.',
        docs: [
            {
                k: 'arsiv/konaklama', n: 'Misafir Konaklama e-Arşiv (Konaklama Vergisi)', w: 'Bireysel misafirin 4 gecelik konaklaması; oda satırında %2 konaklama vergisi, ekstra harcamalarda yalnız KDV.', lay: 'serit', pay: 'kart',
                per: ['2026-10-02', '14:00:00', 'Giriş – çıkış', '2026-10-06', '12:00:00'],
                l: [['Deniz manzaralı oda — oda + kahvaltı', 'DAY', 4, 4800, 10, { ODA: '512' }, { kv: true }], ['Minibar', 'C62', 1, 640, 20], ['Spa masaj (50 dk)', 'C62', 1, 2200, 20]],
                r: [['REZERVASYON', 'AMO-26-88213']],
            },
            {
                k: 'fatura/konaklama', n: 'Şirket Konaklaması e-Faturası (Konaklama Vergisi)', w: 'Kurumsal anlaşmalı firmanın personel konaklaması; toplantı salonu konaklama vergisi dışında.', lay: 'kurumsal', to: { f: 'Toros Enerji Elektrik Üretim A.Ş.', city: 'Ankara' }, pay: 'vade:30',
                per: ['2026-09-21', null, 'Saha ekibi konaklaması', '2026-09-25'],
                l: [['Standart oda — tam pansiyon (6 oda)', 'DAY', 24, 3900, 10, {}, { kv: true }], ['Toplantı salonu (yarım gün)', 'C62', 2, 7500, 20], ['Kahve molası', 'C62', 40, 180, 10]],
                r: [['SOZLESME', 'KRM-2026-014', 'Kurumsal fiyat anlaşması']],
            },
            {
                k: 'arsiv', n: 'Öğrenci Yurdu Aylık Ücret e-Arşiv', w: 'Öğrenci yurdunun aylık barınma ücreti; yurt hizmeti konaklama vergisinden istisna olduğundan yalnız KDV.', lay: 'pastel', to: 'kisi', pay: 'havale',
                per: ['2026-10-01', null, 'Ekim 2026 yurt ücreti', '2026-10-31'],
                l: [['Yurt barınma ücreti — 2 kişilik oda', 'MON', 1, 11500, 10, { ODA: 'C-204', OGRENCI: 'Öğrenci no 26-0412' }], ['Yemek kartı yüklemesi', 'MON', 1, 3500, 10]],
                nt: ['Öğrenci yurtları 7194 sayılı Kanun kapsamında konaklama vergisine tabi değildir.'],
            },
        ],
    },
    {
        code: 'B.08', sector: 'eglence', icon: 'gamepad-2', c: ['#7e22ce', '#22d3ee'], f: 'Pixel Arena Oyun Salonu', o: 'Burak Aydın', city: 'Ankara', slogan: 'İnternet kafe · PlayStation · e-spor',
        why: 'Oyun salonu ve internet kafe saatlik kullanım / bakiye yüklemeyi e-Arşiv ile; e-spor turnuvası katılım ve seyirci girişlerini e-Bilet ile belgeler.',
        docs: [
            {
                k: 'arsiv', n: 'Saatlik Kullanım ve Bakiye e-Arşiv', w: 'Üyenin bilgisayar / konsol saatlik kullanımı ve bakiye yükleme; üyelik no belge alanında.', lay: 'modern', pay: 'kart',
                l: [['Oyun bilgisayarı kullanım (saat)', 'HUR', 5, 60, 20], ['PlayStation 5 salon (saat)', 'HUR', 2, 120, 20], ['Bakiye yükleme paketi', 'C62', 1, 500, 20], ['Enerji içeceği', 'C62', 2, 75, 20]],
                r: [['UYELIK', 'PXA-10982']],
            },
            {
                k: 'bilet', n: 'E-Spor Turnuvası Katılım e-Bileti', w: 'Hafta sonu e-spor turnuvası katılım bileti; takım ve koltuk ek alanlarla.', perTitle: 'Turnuva', pay: 'kart',
                per: ['2026-10-18', '13:00:00', 'Pixel Cup — Valorant 5v5'],
                l: [['Turnuva katılım (oyuncu)', 'C62', 1, 400, 20]],
                r: [['ETKINLIK', 'PIXEL CUP #7'], ['SALON', 'Arena'], ['KOLTUKNO', 'PC-17']],
            },
        ],
    },
    {
        code: 'B.09', sector: 'etkinlik', icon: 'mic', c: ['#1d4ed8', '#fbbf24'], f: 'Deniz Kaya Müzik', o: 'Deniz Kaya', city: 'İzmir', slogan: 'Solist · düğün ve sahne performansı',
        why: 'Ses ve sahne sanatçısı serbest meslek erbabıdır: e-SMM düzenler. İşveren mekân / şirket ise %20 GV stopajı makbuzda gösterilir ve müşteri tarafından ödenecekten düşülür; gerçek kişiye (düğün sahibine) düzenlenen makbuzda stopaj yoktur.',
        docs: [
            {
                k: 'smm', n: 'Mekâna Sahne Performansı e-SMM (Stopajlı)', w: 'Eğlence mekânında 3 gecelik sahne performansı; işveren şirket %20 stopajı keser.', lay: 'zarif', to: { f: 'Nota Sahne Eğlence Ltd. Şti.', city: 'İstanbul' },
                per: ['2026-09-24', null, '3 gece sahne programı', '2026-09-26'],
                l: [['Canlı sahne performansı (gece)', 'C62', 3, 18000, 20]],
                r: [['SOZLESME', 'NS-SAN-2026-31']],
            },
            {
                k: 'smm', n: 'Düğün Performansı e-SMM (Gerçek Kişi)', w: 'Düğün sahibine solist ve orkestra hizmeti; gerçek kişi müşteri stopaj sorumlusu olmadığından stopaj satırı yok.', lay: 'pastel', to: 'kisi',
                per: ['2026-10-17', '20:00:00', 'Düğün performansı'],
                l: [['Solist + 4 kişilik orkestra', 'C62', 1, 45000, 20], ['Ses sistemi kiralama', 'C62', 1, 8000, 20]],
            },
        ],
    },
    {
        code: 'B.10', sector: 'eglence', icon: 'clover', c: ['#15803d', '#fde047'], f: 'Bereket Şans Oyunları Bayii', o: 'Erkan Güneş', city: 'Samsun', slogan: 'Milli Piyango · iddaa · şans oyunları bayii',
        why: 'Şans oyunları bayii oyun hasılatını değil, lisans sahibinden aldığı komisyonu faturalar: ana bayi / lisans şirketine aylık komisyon e-Faturası. Komisyon hizmeti %20 KDV’ye tabidir.',
        docs: [
            {
                k: 'fatura', n: 'Piyango Satış Komisyonu e-Faturası', w: 'Lisans sahibi şirkete aylık piyango ve kazı kazan satış komisyonu; satış hasılatı ve oran açıklamada.', lay: 'kenar', to: { f: 'Anadolu Piyango Lisans İşletmeciliği A.Ş.', city: 'İstanbul' }, pay: 'havale',
                per: ['2026-09-01', null, 'Eylül 2026 satış dönemi', '2026-09-30'],
                l: [['Piyango bileti satış komisyonu', 'C62', 1, 38400, 20, {}, { desc: 'Satış hasılatı 480.000 TL × %8' }], ['Kazı kazan satış komisyonu', 'C62', 1, 9150, 20, {}, { desc: 'Satış hasılatı 91.500 TL × %10' }]],
                r: [['BAYI', 'APL-55-0721']],
            },
            {
                k: 'fatura/temel', n: 'Spor Bahisleri Komisyon e-Faturası (Temel)', w: 'Spor bahisleri operatörüne haftalık kupon satış komisyonu; temel senaryo.', lay: 'teknik', to: { f: 'Saha Sportif Oyunlar Teknoloji A.Ş.', city: 'İstanbul' }, pay: 'havale',
                per: ['2026-09-28', null, '40. hafta kupon satışları', '2026-10-04'],
                l: [['Kupon satış komisyonu', 'C62', 1, 21600, 20, {}, { desc: 'Net satış 270.000 TL × %8' }], ['Canlı bahis satış prim komisyonu', 'C62', 1, 3200, 20, {}, { desc: 'Hedef üstü satış primi' }]],
                r: [['BAYI', 'SSO-55-1184'], ['TERMINAL', 'TRM-55-0442']],
            },
        ],
    },
];
