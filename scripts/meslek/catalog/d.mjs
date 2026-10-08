// D — Gıda, Tarım
export default [
    {
        code: 'D.01', sector: 'gida', icon: 'leaf', c: ['#3f6212', '#d9f99d'], f: 'Şifa Aktar Baharat', o: 'Ömer Turan', city: 'Gaziantep', slogan: 'Baharat · bitki çayı · doğal ürünler',
        why: 'Aktar tüketiciye perakende satışta e-Arşiv düzenler; dağdan kekik, adaçayı gibi bitkileri toplayan / yetiştiren üreticiden alımda çiftçi fatura düzenleyemediğinden e-Müstahsil Makbuzu (bitkisel ürün %2 stopaj) kullanılır.',
        docs: [
            {
                k: 'arsiv', n: 'Baharat ve Bitki Çayı Satışı e-Arşiv', w: 'Tüketiciye gramajlı baharat, bitki çayı ve doğal sabun satışı; farklı KDV oranları.', lay: 'fis', pay: 'nakit',
                l: [['Pul biber (Antep, acı)', 'KGM', 0.5, 420, 10], ['Sumak', 'KGM', 0.25, 380, 10], ['Ihlamur', 'KGM', 0.1, 1600, 10], ['Bıttım sabunu', 'C62', 3, 85, 20]],
            },
            {
                k: 'mustahsil/bitki', n: 'Üreticiden Kekik Alımı e-Müstahsil', w: 'Toplayıcı / üreticiden kurutulmuş kekik ve adaçayı alımı; %2 GV stopajı ve Bağ-Kur kesintisi.', lay: 'defter',
                l: [['Kurutulmuş kekik (Origanum onites)', 'KGM', 240, 210, 0, { RUTUBET: '%9' }], ['Kurutulmuş adaçayı', 'KGM', 90, 180, 0]],
                r: [['KANTARFISI', 'SFA-KT-26-0081']],
            },
        ],
    },
    {
        code: 'D.02', sector: 'tarim', icon: 'hexagon', c: ['#ca8a04', '#fef08a'], f: 'Altınpetek Bal Paketleme Ltd. Şti.', city: 'Ordu', slogan: 'Süzme bal · petek bal · arı ürünleri', sanayi: true,
        why: 'Bal paketleyici üretici arıcılardan bal alımını e-Müstahsil (hayvansal ürün: %1 stopaj) ile belgeler; paketlediği balı marketlere e-Fatura ile satar. Arıcı ÇKS / arıcılık kayıt numarası satırda belirtilir.',
        docs: [
            {
                k: 'mustahsil/hayvan', n: 'Arıcıdan Bal Alımı e-Müstahsil', w: 'Gezginci arıcıdan süzme ve petek bal alımı; %1 GV stopajı, Bağ-Kur %1, analiz raporu referanslı.', lay: 'pastel',
                l: [['Süzme çiçek balı (teneke)', 'KGM', 620, 290, 0, { ANALIZ: 'Nem %17,2 · HMF uygun' }], ['Kestane balı', 'KGM', 140, 520, 0], ['Petek bal (çerçeve)', 'KGM', 85, 410, 0]],
                r: [['ISLETME', 'ARC-52-04418', 'Arıcılık kayıt sistemi'], ['RAPOR', 'LAB-26-0915', 'Bal analiz raporu']],
            },
            {
                k: 'fatura', n: 'Market Zincirine Bal Satış e-Faturası', w: 'Paketli bal ürünlerinin market zincirine satışı; parti ve son tüketim tarihi satır etiketlerinde.', lay: 'kurumsal', to: { f: 'Karadeniz Gıda Market Zincirleri A.Ş.', city: 'Samsun' }, pay: 'vade:45',
                l: [['Süzme çiçek balı 850 g kavanoz', 'C62', 1200, 360, 10, { LOT: 'AP-2609-12', SKT: '09.2028' }, { sid: 'AP-SZ-850' }], ['Kestane balı 450 g', 'C62', 400, 340, 10, { LOT: 'AP-2609-15' }, { sid: 'AP-KS-450' }]],
                r: [['SIPARIS', 'KGM-PO-26-7712']],
            },
        ],
    },
    {
        code: 'D.03', sector: 'gida', icon: 'store', c: ['#2563eb', '#fde68a'], f: 'Mahalle Bakkalı Güneş', o: 'Hasan Güneş', city: 'Bursa', slogan: 'Bakkal · bayi · büfe — her gün açık',
        why: 'Bakkal / büfe tüketiciye talep halinde e-Arşiv düzenler; aynı belgede %1 (ekmek, temel gıda), %10 (işlenmiş gıda) ve %20 (temizlik, tütün dışı ürünler) oranları birlikte bulunur. Çevredeki işyerlerine toplu satışlarda alıcı e-Fatura mükellefiyse e-Fatura düzenlenir.',
        docs: [
            {
                k: 'arsiv', n: 'Bakkal Satışı e-Arşiv (Çoklu KDV)', w: 'Tüketiciye ekmek, süt, atıştırmalık ve temizlik ürünü satışı; üç farklı KDV oranı ayrı vergi alt toplamlarında.', lay: 'fis', pay: 'nakit',
                l: [['Ekmek 250 g', 'C62', 4, 15, 1], ['Kuru fasulye 1 kg', 'C62', 1, 95, 1], ['Bisküvi', 'C62', 3, 32, 10], ['Bulaşık deterjanı 1 lt', 'C62', 1, 89, 20]],
            },
            {
                k: 'fatura', n: 'İşyerine Aylık Mutfak Malzemesi e-Faturası', w: 'Çevredeki ofise ay boyu verilen çay, şeker, su ve temizlik malzemelerinin toplu faturası.', lay: 'defter', to: { f: 'Nilüfer Muhasebe ve Danışmanlık Ltd. Şti.', city: 'Bursa' }, pay: 'havale',
                per: ['2026-09-01', null, 'Eylül 2026 ofis alımları', '2026-09-30'],
                l: [['Siyah çay 1 kg', 'C62', 6, 310, 10], ['Toz şeker 5 kg', 'C62', 2, 210, 10], ['Damacana su 19 lt', 'C62', 16, 95, 10], ['Kağıt havlu 12\'li', 'C62', 4, 220, 20]],
            },
        ],
    },
    {
        code: 'D.04', sector: 'tarim', icon: 'fish', c: ['#0c4a6e', '#7dd3fc'], f: 'Karadeniz Su Ürünleri Ticaret Ltd. Şti.', city: 'Trabzon', slogan: 'Taze balık toptan · av sezonu 2026-27',
        why: 'Balık toptancısı kayık sahibi balıkçılardan av alımını e-Müstahsil (su ürünleri hayvansal ürün: %1 stopaj) ile belgeler; restoran ve marketlere satışı e-Fatura ile yapar (taze balık KDV %1).',
        docs: [
            {
                k: 'mustahsil/hayvan', n: 'Balıkçıdan Av Alımı e-Müstahsil', w: 'Ruhsatlı balıkçı teknesinden hamsi ve istavrit alımı; tekne ruhsat no ve av bölgesi belge alanlarında.', lay: 'endustri',
                l: [['Hamsi (taze)', 'KGM', 1800, 85, 0], ['İstavrit', 'KGM', 420, 110, 0], ['Mezgit', 'KGM', 160, 140, 0]],
                r: [['TEKNE', 'TS-61-0418 Deniz Yıldızı'], ['RUHSAT', 'SÜR-61-2026-0331', 'Su ürünleri ruhsat tezkeresi']],
            },
            {
                k: 'fatura', n: 'Restorana Taze Balık e-Faturası', w: 'Balık restoranına günlük taze balık teslimi; av tarihi ve av bölgesi satır etiketinde.', lay: 'serit', to: { f: 'Sahil Balık Restoran İşletmeleri Ltd. Şti.', city: 'Trabzon' }, pay: 'vade:15',
                l: [['Hamsi', 'KGM', 60, 140, 1, { TARIH: 'Av: 06.10.2026', MENSE: 'Doğu Karadeniz' }], ['Levrek (kültür, 400-600 g)', 'KGM', 25, 420, 1], ['Kalkan', 'KGM', 8, 1250, 1]],
            },
        ],
    },
    {
        code: 'D.05', sector: 'tarim', icon: 'beef', c: ['#7f1d1d', '#fca5a5'], f: 'Ova Besi ve Hayvancılık Tic. Ltd. Şti.', city: 'Erzurum', slogan: 'Besi · celep · canlı hayvan ticareti',
        why: 'Besici / celep çiftçiden canlı hayvan alımını e-Müstahsil ile (hayvan %1 stopaj, borsa tescil, mera fonu, Bağ-Kur) belgeler; kesimhane ve et kombinalarına satışı e-Fatura ile yapar (canlı hayvan KDV %1). Küpe numaraları satır ek alanıdır.',
        docs: [
            {
                k: 'mustahsil/hayvan/borsa/mera', n: 'Çiftçiden Besi Danası Alımı e-Müstahsil', w: 'Hayvan pazarında üreticiden besilik dana alımı; küpe no, borsa tescil ve mera fonu kesintili.', lay: 'defter',
                l: [['Besilik dana — Simental (küpe TR250004418)', 'C62', 1, 64000, 0, { KUPENO: 'TR250004418', IRK: 'Simental' }], ['Besilik dana — Montofon (küpe TR250004425)', 'C62', 1, 58000, 0, { KUPENO: 'TR250004425', IRK: 'Montofon' }], ['Kuzu (12 baş)', 'C62', 12, 6800, 0]],
                r: [['BORSATESCIL', '2026/25-11873', 'Erzurum Ticaret Borsası']],
            },
            {
                k: 'fatura', n: 'Et Kombinasına Canlı Hayvan e-Faturası', w: 'Kesimhaneye canlı ağırlık üzerinden besi sığırı satışı; küpe numaraları ve veteriner sağlık raporu referanslı.', lay: 'endustri', to: { f: 'Palandöken Et Entegre Tesisleri A.Ş.', city: 'Erzurum', sanayi: true }, pay: 'vade:15',
                l: [['Besi sığırı canlı ağırlık (8 baş)', 'KGM', 4960, 245, 1, { KUPENO: 'TR250004418 … 0479' }], ['Nakliye (hayvan taşıma)', 'C62', 1, 6500, 20]],
                r: [['VETERINER', 'VSR-25-2026-4412', 'Veteriner sağlık raporu']],
            },
        ],
    },
    {
        code: 'D.06', sector: 'tarim', icon: 'wheat', c: ['#a16207', '#fde047'], f: 'Bereket Tarım Ürünleri Ltd. Şti.', city: 'Konya', slogan: 'Hububat · bakliyat alım · hasat hizmetleri',
        why: 'Bitkisel ürün tüccarı / hizmet sağlayıcı çiftçiden hububat alımında e-Müstahsil (%2 stopaj, borsa tescil, Bağ-Kur) düzenler; biçerdöver / ilaçlama gibi tarımsal hizmetleri çiftçiye e-Arşiv ile faturalar.',
        docs: [
            {
                k: 'mustahsil/bitki/borsa', n: 'Çiftçiden Hububat Alımı e-Müstahsil', w: 'Üreticiden buğday ve arpa alımı; kalite analiz değerleri ürün açıklamasında, borsa tescilli.', lay: 'teknik',
                l: [['Ekmeklik buğday (Bezostaja)', 'KGM', 22400, 13.4, 0, { PROTEIN: '%12,6', HEKTOLITRE: '79,8 kg' }], ['Arpa (yemlik)', 'KGM', 8600, 10.9, 0, { RUTUBET: '%11,9' }]],
                r: [['BORSATESCIL', '2026/42-30881', 'Konya Ticaret Borsası'], ['KANTARFISI', 'BT-KF-26-1182']],
            },
            {
                k: 'arsiv', n: 'Biçerdöver Hasat Hizmeti e-Arşiv', w: 'Çiftçiye dekar bazında biçerdöver ile hasat ve balya hizmeti.', lay: 'endustri', pay: 'havale',
                l: [['Biçerdöver hasat (buğday)', 'C62', 180, 420, 20, { PARSEL: 'Karatay 118 ada 4 parsel' }, { desc: '180 dekar' }], ['Saman balya', 'C62', 620, 22, 20]],
            },
        ],
    },
    {
        code: 'D.07', sector: 'gida', icon: 'croissant', c: ['#c2410c', '#fed7aa'], f: 'Saray Börek Salonu', o: 'Yusuf Kılıç', city: 'İstanbul', slogan: 'Su böreği · kol böreği · ofis tepsileri',
        why: 'Börekçi tüketiciye e-Arşiv düzenler; ofis / kafe / kantinlere tepsi siparişlerinde alıcı e-Fatura mükellefi olduğundan e-Fatura kullanılır. Unlu mamullerde KDV %10.',
        docs: [
            {
                k: 'arsiv', n: 'Börek Salonu Satışı e-Arşiv', w: 'Salonda ve paket servis börek satışı.', lay: 'fis', pay: 'kart',
                l: [['Su böreği (porsiyon)', 'C62', 2, 160, 10], ['Kol böreği — ıspanaklı (kg)', 'KGM', 0.75, 520, 10], ['Ayran', 'C62', 2, 35, 10], ['Çay', 'C62', 2, 20, 10]],
            },
            {
                k: 'fatura', n: 'Ofise Tepsi Börek e-Faturası', w: 'Şirket toplantısı için tepsi börek ve poğaça siparişi; teslim saati açıklamada.', lay: 'pastel', to: { f: 'Maslak Finans Danışmanlık A.Ş.', city: 'İstanbul' }, pay: 'havale',
                l: [['Tepsi su böreği (30 dilim)', 'C62', 3, 2100, 10], ['Karışık poğaça', 'C62', 120, 28, 10], ['Teslimat', 'C62', 1, 250, 20]],
                r: [['SIPARIS', 'SRB-26-0412']],
            },
        ],
    },
    {
        code: 'D.08', sector: 'gida', icon: 'factory', c: ['#b91c1c', '#fecaca'], f: 'Anadolu Sofrası Gıda San. Tic. A.Ş.', city: 'Hatay', slogan: 'Salça · turşu · konserve üretimi', sanayi: true,
        why: 'Gıda imalatçısı market zincirlerine e-Fatura + e-İrsaliye ile satış yapar, Irak ve körfez ülkelerine ihracatını IHRACAT profiliyle (gümrük muhataplı, GTİP’li) faturalar. Parti no ve son tüketim tarihi satır ek alanlarıdır.',
        docs: [
            {
                k: 'fatura', n: 'Market Zincirine Gıda Satış e-Faturası', w: 'Salça ve turşu ürünlerinin market zinciri deposuna satışı; parti ve STT bilgisi satırda.', lay: 'kurumsal', to: { f: 'Çukurova Market Zinciri A.Ş.', city: 'Adana' }, pay: 'vade:60',
                l: [['Domates salçası 830 g', 'C62', 2400, 68, 10, { LOT: 'AS-2609-22', SKT: '09.2028' }, { sid: 'AS-SLC-830' }], ['Biber salçası 1650 g', 'C62', 800, 145, 10, { LOT: 'AS-2609-24' }, { sid: 'AS-BBR-1650' }], ['Karışık turşu 2 kg', 'C62', 600, 120, 10, {}, { sid: 'AS-TRS-2' }]],
                r: [['SIPARIS', 'CMZ-PO-88121'], ['IRSALIYE', 'ASG2026000011842']],
            },
            {
                k: 'ihracat', n: 'Salça İhracat Faturası (DAP)', w: 'Irak’taki distribütöre tır ile salça ve konserve ihracatı.', lay: 'serit', to: 'IQ', cur: 'USD', inc: 'DAP', mode: 3, pkg: 'CT',
                l: [['Domates salçası 830 g (12\'li koli)', 'BX', 1800, 13.2, 0, {}, { g: '200290910000', kap: 1800 }], ['Közlenmiş biber konservesi 680 g', 'BX', 400, 16.8, 0, {}, { g: '200599800000', kap: 400 }]],
                r: [['CMR', 'CMR-26-55102'], ['SERTIFIKA', 'Menşe şahadetnamesi A-26-11842']],
            },
        ],
    },
    {
        code: 'D.09', sector: 'gida', icon: 'wind', c: ['#854d0e', '#fef3c7'], f: 'Değirmenci Un ve Zahire Tic. Ltd. Şti.', city: 'Afyonkarahisar', slogan: 'Un · kepek · yem · zahire', sanayi: true,
        why: 'Değirmenci / zahireci çiftçiden hububat alımını e-Müstahsil (%2, borsa tescil) ile; ürettiği unu fırınlara e-Fatura ile (un KDV %1) satar. Kepek ve yem ürünleri farklı KDV oranındadır.',
        docs: [
            {
                k: 'mustahsil/bitki/borsa', n: 'Çiftçiden Buğday Alımı e-Müstahsil', w: 'Kantar tartımı ile üreticiden buğday alımı; borsa tescil ve Bağ-Kur kesintili.', lay: 'defter',
                l: [['Anadolu sert buğday', 'KGM', 16800, 13.1, 0, { PROTEIN: '%13,1', RUTUBET: '%11,2' }], ['Çavdar', 'KGM', 2400, 11.4, 0]],
                r: [['KANTARFISI', 'DUZ-KF-26-4471'], ['BORSATESCIL', '2026/03-9118']],
            },
            {
                k: 'fatura', n: 'Fırına Un Satış e-Faturası', w: 'Fırınlara çuvallık ekmeklik un ve kepek satışı.', lay: 'endustri', to: { f: 'Altın Başak Fırıncılık Ltd. Şti.', city: 'Afyonkarahisar' }, pay: 'vade:30',
                l: [['Ekmeklik un tip 550 (50 kg)', 'BG', 160, 1080, 1, { LOT: 'UN-2610-03' }], ['Böreklik un (25 kg)', 'BG', 40, 640, 1], ['Kepek (yemlik)', 'TNE', 2, 7600, 1]],
            },
        ],
    },
    {
        code: 'D.10', sector: 'gida', icon: 'ice-cream-cone', c: ['#db2777', '#fbcfe8'], f: 'Maraşlı Dondurma', o: 'İbrahim Doğan', city: 'Kahramanmaraş', slogan: 'Maraş dondurması · kilo ve külah',
        why: 'Dondurmacı tüketiciye külah / kilo satışında e-Arşiv düzenler; kafe ve restoranlara toptan dondurma satışında e-Fatura kullanır (soğuk zincir için irsaliye tercih edilir).',
        docs: [
            {
                k: 'arsiv', n: 'Dondurma Satışı e-Arşiv', w: 'Dükkandan külah ve kilo dondurma satışı.', lay: 'pastel', pay: 'kart',
                l: [['Maraş dondurması — sade (kg)', 'KGM', 1, 780, 10], ['Fıstıklı dondurma (kg)', 'KGM', 0.5, 960, 10], ['Külah dondurma', 'C62', 3, 120, 10]],
            },
            {
                k: 'fatura', n: 'Restorana Toptan Dondurma e-Faturası', w: 'Restoranlara kova ambalajlı dondurma satışı; parti ve üretim tarihi.', lay: 'kart', to: { f: 'Onikişubat Kebap Salonu Ltd. Şti.', city: 'Kahramanmaraş' }, pay: 'vade:15',
                l: [['Sade Maraş dondurması 5 kg kova', 'C62', 12, 3400, 10, { URETIM: '05.10.2026' }], ['Kaymaklı dondurma 5 kg kova', 'C62', 6, 3600, 10], ['Soğutucu kova teslimatı', 'C62', 1, 400, 20]],
            },
        ],
    },
    {
        code: 'D.11', sector: 'perakende', icon: 'dog', c: ['#9a3412', '#fed7aa'], f: 'Pati Dostu Pet Shop', o: 'Merve Aslan', city: 'İzmir', slogan: 'Mama · aksesuar · pet kuaför',
        why: 'Pet shop tüketiciye mama, aksesuar ve bakım hizmetini e-Arşiv ile; veteriner kliniklerine toptan mama satışını e-Fatura ile düzenler. Hayvanın çip numarası bakım hizmeti satırında belirtilebilir.',
        docs: [
            {
                k: 'arsiv', n: 'Mama ve Bakım Hizmeti e-Arşiv', w: 'Kedi maması, kum ve tıraş-banyo bakım hizmeti; hayvanın çip no ek alanda.', lay: 'pastel', pay: 'kart',
                l: [['Yetişkin kedi maması 10 kg', 'C62', 1, 2850, 20], ['Bentonit kedi kumu 10 lt', 'C62', 2, 260, 20], ['Banyo + tıraş (orta boy köpek)', 'C62', 1, 1100, 20, { CIP: '900108001441872' }]],
            },
            {
                k: 'fatura', n: 'Veteriner Kliniğine Mama e-Faturası', w: 'Veteriner kliniğine reçeteli diyet maması toptan satışı.', lay: 'kenar', to: { f: 'Bornova Veteriner Kliniği Ltd. Şti.', city: 'İzmir' }, pay: 'vade:30',
                l: [['Böbrek diyet maması 2 kg', 'C62', 24, 1180, 20, { SKT: '04.2028' }], ['Hipoalerjenik köpek maması 12 kg', 'C62', 8, 3950, 20]],
            },
        ],
    },
    {
        code: 'D.12', sector: 'gida', icon: 'cookie', c: ['#b45309', '#fde68a'], f: 'Taş Fırın Ekmek', o: 'Mustafa Şimşek', city: 'Ankara', slogan: 'Odun ateşinde ekmek · pide · simit',
        why: 'Fırın tüketiciye e-Arşiv düzenler; restoran, kantin ve marketlere günlük ekmek teslimini aylık e-Fatura ile (ekmek KDV %1) faturalar. Dönemsel teslimlerde InvoicePeriod kullanılır.',
        docs: [
            {
                k: 'arsiv', n: 'Fırın Satışı e-Arşiv', w: 'Tüketiciye ekmek, pide ve simit satışı.', lay: 'fis', pay: 'nakit',
                l: [['Ekmek 250 g', 'C62', 6, 15, 1], ['Ramazan pidesi', 'C62', 2, 40, 1], ['Simit', 'C62', 4, 20, 10]],
            },
            {
                k: 'fatura', n: 'Lokantaya Aylık Ekmek e-Faturası', w: 'Lokantaya ay boyu her sabah teslim edilen ekmeğin toplu faturası; dönem ve teslim fişleri.', lay: 'defter', to: { f: 'Ulus Ev Yemekleri Lokantası Ltd. Şti.', city: 'Ankara' }, pay: 'havale',
                per: ['2026-09-01', null, 'Eylül 2026 teslimleri (30 gün)', '2026-09-30'],
                l: [['Ekmek 250 g', 'C62', 2400, 14, 1], ['Lavaş', 'C62', 600, 12, 1]],
                nt: ['Günlük teslim fişleri faturaya eklidir.'],
            },
        ],
    },
    {
        code: 'D.13', sector: 'tarim', icon: 'sprout', c: ['#166534', '#86efac'], f: 'Verim Tarım Gübre ve İlaç Bayii', o: 'Ahmet Kaya', city: 'Manisa', slogan: 'Gübre · zirai ilaç · tohum · sulama',
        why: 'Gübre ve zirai ilaç bayii çiftçiye satışta e-Arşiv düzenler; zirai ilaçlar ziraat mühendisi reçetesiyle satılır (reçete no belge referansı). Kooperatif ve tarım işletmelerine e-Fatura kullanılır. Gübre teslimlerinde KDV oranı %0 (istisna dışı, kod 351) — güncel oran kontrol edilmelidir.',
        docs: [
            {
                k: 'arsiv', n: 'Çiftçiye Reçeteli Zirai İlaç Satışı e-Arşiv', w: 'Bağ hastalığı için reçeteli fungisit ve yaprak gübresi satışı; reçete no zorunlu.', lay: 'kart', pay: 'nakit',
                l: [['Fungisit (bakır oksiklorür) 1 kg', 'C62', 6, 640, 20, { LOT: 'ZI-2608-41' }], ['İnsektisit 250 ml', 'C62', 4, 820, 20], ['Yaprak gübresi 1 lt', 'C62', 5, 310, 0, {}, { ex: { code: '351', reason: 'Gübre teslimi — KDV oranı %0' } }]],
                r: [['RECETE', 'ZR-45-2026-11842', 'Zirai ilaç reçetesi (ziraat mühendisi)']],
            },
            {
                k: 'fatura', n: 'Kooperatife Gübre Satış e-Faturası', w: 'Tarım kredi kooperatifine çuvallık kimyevi gübre toptan satışı.', lay: 'endustri', to: { f: 'Akhisar Tarım Kredi Kooperatifi', city: 'Manisa' }, pay: 'vade:30',
                l: [['Amonyum nitrat %33 (50 kg)', 'BG', 400, 980, 0, {}, { ex: { code: '351', reason: 'Gübre teslimi — KDV oranı %0' } }], ['DAP 18-46-0 (50 kg)', 'BG', 200, 1450, 0, {}, { ex: { code: '351', reason: 'Gübre teslimi — KDV oranı %0' } }], ['Damla sulama borusu 16 mm', 'MTR', 2000, 6.5, 20]],
            },
        ],
    },
    {
        code: 'D.14', sector: 'yeme-icme', icon: 'sandwich', c: ['#0d9488', '#99f6e4'], f: 'Okul Kantini Yıldırım', o: 'Zeynep Yıldırım', city: 'Denizli', slogan: 'Okul ve işyeri kantini · tost · içecek',
        why: 'Kantinci öğrencilere / çalışanlara perakende satışta e-Arşiv düzenler; işyerine personel yemeği verdiğinde yemek servis hizmeti belirlenmiş alıcılarda 604 (5/10) tevkifatına tabidir.',
        docs: [
            {
                k: 'arsiv', n: 'Kantin Satışı e-Arşiv', w: 'Kantinden tost, simit ve içecek satışı.', lay: 'fis', pay: 'nakit',
                l: [['Kaşarlı tost', 'C62', 2, 75, 10], ['Ayran', 'C62', 2, 25, 10], ['Su 500 ml', 'C62', 3, 12, 10]],
            },
            {
                k: 'fatura/tevkifat:604', n: 'Fabrikaya Personel Yemeği (Tevkifat 604)', w: 'Fabrika personeline öğle yemeği servisi; aylık öğün sayısı üzerinden, 5/10 KDV tevkifatı.', lay: 'kurumsal', to: { f: 'Denizli Tekstil Dokuma Sanayi A.Ş.', city: 'Denizli', sanayi: true }, pay: 'vade:30',
                per: ['2026-09-01', null, 'Eylül 2026 öğle yemeği', '2026-09-30'],
                l: [['Öğle yemeği (4 çeşit)', 'C62', 2860, 145, 10], ['Ara öğün (çay-simit)', 'C62', 1400, 30, 10]],
            },
        ],
    },
    {
        code: 'D.15', sector: 'gida', icon: 'beef', c: ['#991b1b', '#fecaca'], f: 'Yıldız Et Kasabı', o: 'Mehmet Yıldız', city: 'Kayseri', slogan: 'Kasap · şarküteri · kurbanlık',
        why: 'Kasap tüketiciye et satışında e-Arşiv (kırmızı et KDV %1), restoran / otellere e-Fatura düzenler; çiftçiden kurbanlık veya kesimlik hayvan alımında e-Müstahsil (hayvan %1 stopaj) kullanılır.',
        docs: [
            {
                k: 'arsiv', n: 'Et Satışı e-Arşiv', w: 'Tüketiciye kıyma, kuşbaşı ve sucuk satışı; et %1, işlenmiş ürün %10.', lay: 'fis', pay: 'kart',
                l: [['Dana kıyma', 'KGM', 1.5, 720, 1], ['Kuzu pirzola', 'KGM', 1, 980, 1], ['Kayseri sucuğu', 'KGM', 0.5, 1150, 10]],
            },
            {
                k: 'fatura', n: 'Restorana Et Teslimi e-Faturası', w: 'Kebap restoranına haftalık et teslimi; kesim tarihi ve parti no satır etiketinde.', lay: 'endustri', to: { f: 'Erciyes Kebap Salonu Ltd. Şti.', city: 'Kayseri' }, pay: 'vade:15',
                l: [['Dana antrikot', 'KGM', 40, 950, 1, { LOT: 'K-2610-02', TARIH: 'Kesim: 04.10.2026' }], ['Kuzu kol', 'KGM', 25, 820, 1], ['Kebaplık kıyma (yağlı)', 'KGM', 60, 690, 1]],
            },
            {
                k: 'mustahsil/hayvan', n: 'Çiftçiden Kesimlik Hayvan e-Müstahsil', w: 'Üreticiden kesimlik koç ve dana alımı; küpe no ve %1 stopaj.', lay: 'defter',
                l: [['Kesimlik koç (küpe TR380012441)', 'C62', 6, 9800, 0, { KUPENO: 'TR380012441…446' }], ['Kesimlik dana (küpe TR380009918)', 'C62', 1, 72000, 0, { KUPENO: 'TR380009918' }]],
            },
        ],
    },
    {
        code: 'D.16', sector: 'gida', icon: 'nut', c: ['#78350f', '#fcd34d'], f: 'Fıstıkçı Kuruyemiş Gıda Ltd. Şti.', city: 'Gaziantep', slogan: 'Antep fıstığı · kuruyemiş · online sipariş',
        why: 'Kuruyemişçi online satışlarda e-Arşiv internet satışı alanlarını kullanır; bahçe sahibinden Antep fıstığı / fındık alımında e-Müstahsil (bitkisel %2 stopaj, borsa tescil) düzenler.',
        docs: [
            {
                k: 'arsiv/net', n: 'Online Kuruyemiş Satışı e-Arşiv', w: 'Web sitesinden kuruyemiş paketi siparişi; kargo ve ödeme aracısı bilgisi.', lay: 'modern',
                l: [['Antep fıstığı — kavrulmuş (1 kg)', 'C62', 1, 1450, 10], ['Fıstıklı baklava kutusu 1 kg', 'C62', 1, 1800, 10], ['Karışık kuruyemiş 500 g', 'C62', 2, 380, 10]],
            },
            {
                k: 'mustahsil/bitki/borsa', n: 'Bahçeden Antep Fıstığı Alımı e-Müstahsil', w: 'Üreticiden kabuklu Antep fıstığı alımı; borsa tescil, %2 stopaj ve Bağ-Kur kesintisi.', lay: 'zarif',
                l: [['Kabuklu Antep fıstığı (boz)', 'KGM', 1850, 620, 0, { RUTUBET: '%6' }], ['Yeşil iç fıstık (duble)', 'KGM', 240, 1350, 0]],
                r: [['BORSATESCIL', '2026/27-6612', 'Gaziantep Ticaret Borsası']],
            },
        ],
    },
    {
        code: 'D.17', sector: 'yeme-icme', icon: 'utensils', c: ['#c2410c', '#ffedd5'], f: 'Hünkar Lokantası', o: 'Halil Yılmaz', city: 'İstanbul', slogan: 'Ev yemekleri · kebap · toplu yemek',
        why: 'Lokanta masa hesabını e-Arşiv ile (yemek KDV %10) düzenler; şirketlere toplu yemek / catering hizmetinde belirlenmiş alıcılara 604 (5/10) KDV tevkifatı uygulanır.',
        docs: [
            {
                k: 'arsiv', n: 'Masa Adisyonu e-Arşiv', w: 'Restoranda 4 kişilik masa hesabı; servis ücreti ayrı satır.', lay: 'fis', pay: 'kart',
                l: [['Hünkar beğendi', 'C62', 2, 520, 10, { MASA: '12' }], ['Mercimek çorbası', 'C62', 4, 140, 10], ['Ayran', 'C62', 4, 45, 10], ['Künefe', 'C62', 2, 260, 10]],
            },
            {
                k: 'fatura/tevkifat:604', n: 'Şirkete Toplu Yemek (Tevkifat 604)', w: 'Ofise günlük tabldot yemek servisi; aylık öğün sayısı, 5/10 tevkifat.', lay: 'kurumsal', to: { f: 'Boğaziçi Yazılım Teknolojileri A.Ş.', city: 'İstanbul' }, pay: 'vade:30',
                per: ['2026-09-01', null, 'Eylül 2026 tabldot', '2026-09-30'],
                l: [['Tabldot öğle yemeği', 'C62', 1680, 185, 10], ['Diyet menü', 'C62', 220, 210, 10]],
            },
        ],
    },
    {
        code: 'D.18', sector: 'gida', icon: 'apple', c: ['#15803d', '#fca5a5'], f: 'Bahçe Manav', o: 'Fatma Erdoğan', city: 'Mersin', slogan: 'Taze meyve · sebze · günlük',
        why: 'Manav tüketiciye e-Arşiv (taze meyve-sebze KDV %1) düzenler; restoranlara toptan satışta Hal Kayıt Sistemi künyesiyle HKS profilli e-Fatura (HKSSATIS) kullanması gerekir.',
        docs: [
            {
                k: 'arsiv', n: 'Manav Satışı e-Arşiv', w: 'Tüketiciye taze meyve ve sebze satışı.', lay: 'pastel', pay: 'nakit',
                l: [['Domates', 'KGM', 3, 35, 1], ['Mandalina (Mersin)', 'KGM', 2, 40, 1], ['Muz (yerli)', 'KGM', 1.5, 80, 1], ['Maydanoz', 'C62', 2, 15, 1]],
            },
            {
                k: 'fatura/hks', n: 'Restorana Sebze-Meyve HKS e-Faturası', w: 'Restorana toptan sebze-meyve satışı; satırlarda hal künye no ve mal sahibi bilgisi.', lay: 'endustri', to: { f: 'Akdeniz Balık ve Meze Restoran Ltd. Şti.', city: 'Mersin' }, pay: 'vade:15',
                l: [['Domates (sofralık)', 'KGM', 120, 28, 1], ['Limon (Mersin)', 'KGM', 60, 30, 1], ['Roka', 'KGM', 15, 90, 1]],
            },
        ],
    },
    {
        code: 'D.19', sector: 'gida', icon: 'cup-soda', c: ['#dc2626', '#fef08a'], f: 'Serin Meşrubat Dağıtım A.Ş.', city: 'Adana', slogan: 'Su · gazoz · meyve suyu bayii', sanayi: true,
        why: 'Meşrubat dağıtıcısı market ve büfelere e-Fatura + e-İrsaliye ile satış yapar. Kolalı gazozlar ÖTV (III) sayılı liste kapsamındadır: TaxTypeCode 0073 satır vergisi KDV matrahına dahil edilir; su ve meyve suyu ÖTV dışıdır.',
        docs: [
            {
                k: 'fatura', n: 'Bayiye Meşrubat Satış e-Faturası (ÖTV)', w: 'Büfe ve marketlere kolalı gazoz, su ve meyve suyu satışı; kolalı ürünlerde ÖTV satırı.', lay: 'serit', to: { f: 'Seyhan Toptan Gıda Ltd. Şti.', city: 'Adana' }, pay: 'vade:30',
                l: [['Kolalı gazoz 1 lt (12\'li)', 'BX', 150, 260, 20, {}, { taxes: [{ code: '0073', name: 'ÖTV (III) SAYILI LİSTE', pct: 25 }] }], ['Doğal kaynak suyu 0,5 lt (24\'lü)', 'BX', 300, 120, 10], ['Meyve suyu 1 lt (12\'li)', 'BX', 80, 340, 10]],
                r: [['IRSALIYE', 'SMD2026000004418']],
            },
            {
                k: 'irsaliye', n: 'Dağıtım Aracı Sevk İrsaliyesi', w: 'Depodan market zincirine palet bazında meşrubat sevki.', lay: 'teknik', to: { f: 'Seyhan Toptan Gıda Ltd. Şti.', city: 'Adana' }, kg: 6240, kap: 8,
                l: [['Kolalı gazoz 1 lt (12\'li)', 'BX', 150, 0, 20, {}, { sid: 'SR-KL-1' }], ['Doğal kaynak suyu 0,5 lt (24\'lü)', 'BX', 300, 0, 10, {}, { sid: 'SR-SU-05' }], ['Meyve suyu 1 lt (12\'li)', 'BX', 80, 0, 10, {}, { sid: 'SR-MS-1' }]],
            },
        ],
    },
    {
        code: 'D.20', sector: 'gida', icon: 'cake-slice', c: ['#be185d', '#fce7f3'], f: 'Lezzet Pastanesi', o: 'Ayşe Polat', city: 'Eskişehir', slogan: 'Yaş pasta · kurabiye · özel gün pastaları',
        why: 'Pastane tüketiciye e-Arşiv; kafe ve otellere düzenli pasta / tatlı tedarikinde e-Fatura düzenler. Unlu mamul ve tatlılarda KDV %10.',
        docs: [
            {
                k: 'arsiv', n: 'Özel Gün Pastası e-Arşiv', w: 'Kişiye özel doğum günü pastası siparişi; kapora ve teslim tarihi açıklamada.', lay: 'pastel', pay: 'kart',
                l: [['Özel tasarım pasta (20 kişilik)', 'C62', 1, 3800, 10], ['Kurabiye (kg)', 'KGM', 1, 650, 10], ['Mum ve süsleme', 'SET', 1, 120, 20]],
                nt: ['Kapora 1.000 TL sipariş günü alınmıştır.'],
            },
            {
                k: 'fatura', n: 'Kafeye Tatlı Tedarik e-Faturası', w: 'Kafe zincirine haftalık cheesecake ve brownie tedariki.', lay: 'zarif', to: { f: 'Porsuk Kafe İşletmeleri Ltd. Şti.', city: 'Eskişehir' }, pay: 'vade:15',
                l: [['Cheesecake (bütün, 12 dilim)', 'C62', 20, 1100, 10], ['Brownie tepsi (24 dilim)', 'C62', 10, 980, 10], ['Tiramisu kase', 'C62', 40, 140, 10]],
            },
        ],
    },
    {
        code: 'D.21', sector: 'gida', icon: 'ham', c: ['#9f1239', '#fde68a'], f: 'Trakya Şarküteri Gıda Ltd. Şti.', city: 'Tekirdağ', slogan: 'Peynir · zeytin · şarküteri ürünleri',
        why: 'Şarküteri tüketiciye e-Arşiv, otel ve kafelere e-Fatura düzenler; köylü üreticiden peynir / tereyağı alımında e-Müstahsil (hayvansal ürün %1 stopaj) kullanılır.',
        docs: [
            {
                k: 'arsiv', n: 'Şarküteri Satışı e-Arşiv', w: 'Tüketiciye peynir, zeytin, pastırma satışı.', lay: 'kart', pay: 'kart',
                l: [['Eski kaşar (kg)', 'KGM', 0.5, 680, 10], ['Gemlik zeytin (kg)', 'KGM', 1, 320, 10], ['Pastırma (kg)', 'KGM', 0.25, 2400, 10]],
            },
            {
                k: 'fatura', n: 'Otele Kahvaltılık e-Faturası', w: 'Otelin kahvaltı büfesi için toplu peynir, zeytin ve reçel teslimi.', lay: 'kurumsal', to: { f: 'Marmara Sahil Otelcilik A.Ş.', city: 'Tekirdağ' }, pay: 'vade:30',
                l: [['Beyaz peynir teneke 17 kg', 'C62', 6, 4200, 10, { LOT: 'TS-2609-08' }], ['Siyah zeytin 10 kg', 'C62', 8, 2100, 10], ['Ev yapımı reçel 5 kg', 'C62', 6, 1350, 10]],
            },
            {
                k: 'mustahsil/hayvan', n: 'Köylüden Peynir Alımı e-Müstahsil', w: 'Köydeki üreticiden tam yağlı peynir ve tereyağı alımı; %1 stopaj.', lay: 'defter',
                l: [['Tam yağlı beyaz peynir (köy)', 'KGM', 180, 290, 0], ['Köy tereyağı', 'KGM', 40, 520, 0]],
            },
        ],
    },
    {
        code: 'D.22', sector: 'gida', icon: 'candy', c: ['#c026d3', '#fbcfe8'], f: 'Hacı Şekerci Lokum ve Çikolata A.Ş.', city: 'İstanbul', slogan: 'Lokum · akide · çikolata · 1899', sanayi: true,
        why: 'Şekerci tüketiciye e-Arşiv (bayram kutuları), yurt dışı distribütörlere lokum ihracatını IHRACAT profiliyle (GTİP 1704) faturalar.',
        docs: [
            {
                k: 'arsiv', n: 'Bayram Şekeri Satışı e-Arşiv', w: 'Mağazadan bayram için lokum ve çikolata kutuları satışı.', lay: 'zarif', pay: 'kart',
                l: [['Çifte kavrulmuş fıstıklı lokum 1 kg kutu', 'C62', 2, 980, 10], ['Akide şekeri 500 g', 'C62', 3, 240, 10], ['Spesiyal çikolata kutusu', 'C62', 2, 650, 10]],
            },
            {
                k: 'ihracat', n: 'Lokum İhracat Faturası (CIF)', w: 'Dubai’deki distribütöre hava kargo ile lokum ve çikolata ihracatı.', lay: 'serit', to: 'AE', cur: 'USD', inc: 'CIF', mode: 4, pkg: 'CT',
                l: [['Fıstıklı lokum 500 g', 'C62', 2400, 6.8, 0, {}, { g: '170490710000', kap: 100 }], ['Gül lokumu 500 g', 'C62', 1200, 5.4, 0, {}, { g: '170490710000', kap: 50 }]],
                r: [['KONSIMENTO', 'AWB 235-44128830']],
            },
        ],
    },
    {
        code: 'D.23', sector: 'tarim', icon: 'egg', c: ['#ea580c', '#fef3c7'], f: 'Bolu Piliç Entegre Tavukçuluk A.Ş.', city: 'Sakarya', slogan: 'Piliç · yumurta · sözleşmeli yetiştiricilik', sanayi: true,
        why: 'Tavukçuluk işletmesi restoran ve marketlere piliç eti satışında e-Fatura (KDV %1, kesim / parti bilgisi), sözleşmeli yetiştiriciden canlı piliç alımında e-Müstahsil (hayvan %1 stopaj) düzenler.',
        docs: [
            {
                k: 'fatura', n: 'Restorana Piliç Eti e-Faturası', w: 'Tavuk döner zincirine but ve göğüs eti satışı; kesim tarihi ve parti numaralı.', lay: 'endustri', to: { f: 'Sakarya Döner Restoranları Ltd. Şti.', city: 'Sakarya' }, pay: 'vade:15',
                l: [['Piliç but (kemiksiz)', 'KGM', 420, 195, 1, { LOT: 'BP-2610-04', TARIH: 'Kesim: 05.10.2026' }], ['Piliç göğüs fileto', 'KGM', 300, 230, 1], ['Kanat', 'KGM', 80, 150, 1]],
            },
            {
                k: 'mustahsil/hayvan', n: 'Yetiştiriciden Canlı Piliç e-Müstahsil', w: 'Sözleşmeli kümesten canlı piliç alımı; canlı ağırlık, kümes no ve %1 stopaj.', lay: 'teknik',
                l: [['Canlı piliç (canlı ağırlık)', 'KGM', 18400, 58, 0, { ISLETME: 'Kümes TR54-K-0412' }]],
                r: [['SOZLESME', 'BP-YS-2026-118', 'Sözleşmeli yetiştiricilik']],
            },
        ],
    },
    {
        code: 'D.24', sector: 'tarim', icon: 'carrot', c: ['#ea580c', '#bbf7d0'], f: 'Hal Yeşil Komisyonculuk Ltd. Şti.', city: 'Antalya', slogan: 'Hal komisyoncusu · yaş sebze-meyve',
        why: 'Hal komisyoncusu üreticinin malını onun adına satar: alıcıya HKS profilli e-Fatura (HKSKOMISYONCU), sevkiyatta HKSIRSALIYE, üreticiye satış bedeli için e-Müstahsil Makbuzu düzenler. Tüm belgelerde hal künye numarası yer alır.',
        docs: [
            {
                k: 'fatura/hkskom', n: 'Komisyoncu Satış e-Faturası (HKS)', w: 'Üretici adına market zincirine domates ve biber satışı; her satırda künye no ve mal sahibi.', lay: 'endustri', to: { f: 'Akdeniz Market Zinciri A.Ş.', city: 'Antalya' }, pay: 'vade:15',
                l: [['Domates (salkım)', 'KGM', 4200, 24, 1], ['Sivri biber', 'KGM', 1600, 38, 1], ['Hıyar', 'KGM', 2200, 18, 1]],
            },
            {
                k: 'irsaliye/hks', n: 'Hal Sevk İrsaliyesi (HKS)', w: 'Halden market deposuna künyeli sebze sevki.', lay: 'teknik', to: { f: 'Akdeniz Market Zinciri A.Ş.', city: 'Antalya' }, kg: 8100, kap: 540,
                l: [['Domates (salkım)', 'KGM', 4200, 0, 1], ['Sivri biber', 'KGM', 1600, 0, 1], ['Hıyar', 'KGM', 2200, 0, 1]],
            },
            {
                k: 'mustahsil/bitki', n: 'Üreticiye Satış Bedeli e-Müstahsil', w: 'Komisyoncunun sattığı ürünlerin bedelini üreticiye öderken düzenlediği müstahsil makbuzu.', lay: 'defter',
                l: [['Domates (salkım)', 'KGM', 4200, 21, 0], ['Sivri biber', 'KGM', 1600, 34, 0]],
            },
        ],
    },
    {
        code: 'D.25', sector: 'gida', icon: 'layers', c: ['#a16207', '#fef9c3'], f: 'Ustam Yufka Kadayıf', o: 'Emine Çetin', city: 'Malatya', slogan: 'El açması yufka · tel kadayıf · baklavalık',
        why: 'Yufkacı tüketiciye e-Arşiv düzenler (yufka %1); baklava ve kadayıf tatlıcılarına toptan yufka / tel kadayıf satışı e-Fatura ile yapılır.',
        docs: [
            {
                k: 'arsiv', n: 'Yufka Satışı e-Arşiv', w: 'Tüketiciye el açması yufka ve tel kadayıf satışı.', lay: 'fis', pay: 'nakit',
                l: [['El açması yufka (5\'li)', 'C62', 3, 110, 1], ['Tel kadayıf (kg)', 'KGM', 1, 160, 1]],
            },
            {
                k: 'fatura', n: 'Tatlıcıya Toptan Yufka e-Faturası', w: 'Baklava imalathanesine haftalık baklavalık yufka ve kadayıf teslimi.', lay: 'kenar', to: { f: 'Malatya Baklava Tatlı Sanayi Ltd. Şti.', city: 'Malatya' }, pay: 'vade:15',
                l: [['Baklavalık yufka (kg)', 'KGM', 240, 120, 1], ['Tel kadayıf (kg)', 'KGM', 180, 140, 1]],
            },
        ],
    },
];
