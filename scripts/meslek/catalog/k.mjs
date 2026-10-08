// K — Yapı Sanatları
export default [
    {
        code: 'K.01', sector: 'uretim', icon: 'flask-round', c: ['#0e7490', '#fde047'], f: 'Kimtaş Boya ve Kimya San. A.Ş.', city: 'Kocaeli', sanayi: true, slogan: 'İç-dış cephe boyası · yol çizgi boyası · endüstriyel kaplama',
        why: 'Boya ve kimya üreticisi bayilere e-Fatura, sevkiyatlarda e-İrsaliye, yurt dışına IHRACAT profilli e-Fatura düzenler (GTİP 3208/3209). Kamu idareleri gibi belirlenmiş alıcılara yapılan mal teslimlerinde 626 kodlu "diğer teslimler" 2/10 KDV tevkifatı uygulanır.',
        docs: [
            {
                k: 'fatura', n: 'Bayiye Boya Satış Faturası', w: 'Boya bayisine iç ve dış cephe boyası; parti no ve renk kodu satırda.', lay: 'endustri', to: { f: 'Renk Dünyası Boya Hırdavat', city: 'Antalya' }, pay: 'vade:60',
                l: [['İç cephe silikonlu boya 15 lt', 'C62', 120, 1650, 20, { RENK: 'KMT-1018 Kırık Beyaz', PARTINO: 'P2609-118' }], ['Dış cephe akrilik boya 15 lt', 'C62', 80, 2100, 20, { RENK: 'KMT-3302 Toprak', PARTINO: 'P2609-122' }], ['Astar 20 kg', 'C62', 40, 980, 20]],
                r: [['IRSALIYE', 'KMT2026000018841']],
            },
            {
                k: 'fatura/kamu/tevkifat:626', n: 'Karayollarına Yol Çizgi Boyası (KAMU · 626)', w: 'Karayolları bölge müdürlüğüne termoplastik yol çizgi boyası; KAMU senaryosu ve 2/10 tevkifat.', lay: 'kurumsal', to: { f: 'Karayolları 1. Bölge Müdürlüğü', city: 'İstanbul' }, pay: 'havale',
                l: [['Termoplastik yol çizgi boyası (beyaz)', 'KGM', 18000, 62, 20, { STANDART: 'TS EN 1871' }], ['Cam küre (reflektif)', 'KGM', 3000, 38, 20]],
                r: [['IHALE', '2026/442218']],
            },
            {
                k: 'ihracat', n: 'Irak\'a Boya İhracat Faturası', w: 'Erbil\'deki distribütöre su bazlı boya ihracatı; GTİP ve kap bilgisi satırda.', lay: 'kurumsal', to: 'IQ', cur: 'USD', inc: 'DAP', pkg: 'PX',
                l: [['Su bazlı iç cephe boyası 15 lt', 'C62', 960, 38, 0, {}, { g: '320910000011', kap: 24 }], ['Akrilik dış cephe boyası 15 lt', 'C62', 480, 46, 0, {}, { g: '320910000019', kap: 12 }]],
            },
        ],
    },
    {
        code: 'K.02', sector: 'perakende', icon: 'paint-roller', c: ['#be123c', '#fecdd3'], f: 'Renk Dünyası Boya Hırdavat', o: 'Orhan Güneş', city: 'Antalya', slogan: 'Boya · renk karışım · yalıtım',
        why: 'Boya bayisi bireysel müşteriye e-Arşiv, boya ustası ve müteahhitlere (e-Fatura mükellefiyse) vadeli e-Fatura düzenler; renk kodu ve parti no satırda yer alır.',
        docs: [
            {
                k: 'arsiv', n: 'Perakende Boya Satışı e-Arşiv', w: 'Bireysel müşteriye renk karışımlı iç cephe boyası ve fırça seti.', lay: 'fis', pay: 'kart',
                l: [['İç cephe boyası 7,5 lt (karışım)', 'C62', 3, 1150, 20, { RENK: 'Mavi Sis 4012' }], ['Rulo + fırça seti', 'SET', 1, 320, 20], ['Maskeleme bandı', 'C62', 4, 45, 20]],
            },
            {
                k: 'fatura', n: 'Boya Ustasına Vadeli Satış', w: 'Site boyası işi alan boya taahhüt firmasına vadeli toplu satış.', lay: 'defter', to: { f: 'Akdeniz Boya Dekorasyon Ltd. Şti.', city: 'Antalya' }, pay: 'vade:45',
                l: [['Dış cephe akrilik boya 15 lt', 'C62', 60, 2350, 20, { RENK: 'KMT-3302 Toprak' }], ['Mantolama yapıştırma harcı 25 kg', 'C62', 120, 310, 20]],
            },
        ],
    },
    {
        code: 'K.03', sector: 'insaat', icon: 'app-window', c: ['#0284c7', '#e0f2fe'], f: 'Şeffaf Cam Ayna Ltd. Şti.', city: 'Ankara', slogan: 'Isıcam · temperli cam · duşakabin · ayna',
        why: 'Camcı müteahhit ve sanayi müşterilerine m² bazlı e-Fatura, ev müşterilerine montaj dahil e-Arşiv düzenler; ölçü ve cam tipi satır ek alanında yer alır, sevk e-İrsaliye ile yapılır.',
        docs: [
            {
                k: 'fatura', n: 'Müteahhide Isıcam Satışı', w: 'Konut projesine ölçülü ısıcam ünitesi; ölçü ve cam tipi satırda.', lay: 'teknik', to: { f: 'Kuzey Yapı İnşaat Taahhüt Ltd. Şti.', city: 'Ankara' }, pay: 'vade:30',
                l: [['Isıcam 4+16+4 Low-E', 'MTK', 412, 1180, 20, { OLCU: 'Ölçü listesi ekte (186 adet)' }], ['Temperli cam 8 mm (balkon)', 'MTK', 96, 1450, 20]],
                r: [['PROJE', 'Bilkent Park Konutları B Blok']],
            },
            {
                k: 'arsiv', n: 'Eve Duşakabin ve Ayna Montajı e-Arşiv', w: 'Ev müşterisine temperli duşakabin ve banyo aynası montajı.', lay: 'pastel', pay: 'kart',
                l: [['Temperli duşakabin (90x90)', 'C62', 1, 9800, 20, { OLCU: '90 x 90 x 190 cm' }], ['Banyo aynası (rodajlı)', 'MTK', 1.2, 2200, 20], ['Montaj işçiliği', 'C62', 1, 1500, 20]],
            },
        ],
    },
    {
        code: 'K.04', sector: 'insaat', icon: 'shrub', c: ['#15803d', '#bbf7d0'], f: 'Yeşil Vadi Peyzaj Ltd. Şti.', city: 'Antalya', slogan: 'Peyzaj uygulama · bahçe bakımı · park bakım',
        why: 'Çevre ve bahçe bakım hizmetleri belirlenmiş alıcılara 613 kodlu 9/10 KDV tevkifatlı e-Fatura ile, belediyelere KAMU senaryolu tevkifatlı e-Fatura ile faturalanır; villa ve ev bahçeleri için e-Arşiv düzenlenir.',
        docs: [
            {
                k: 'fatura/tevkifat:613', n: 'Otel Bahçe Bakımı Aylık Faturası (Tevkifat 613)', w: 'Tatil köyü bahçe ve çim alan aylık bakımı; 9/10 tevkifat.', lay: 'pastel', to: { f: 'Lara Palmiye Otelcilik A.Ş.', city: 'Antalya' }, pay: 'vade:30',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026', '2026-09-30', '23:59:59'],
                l: [['Bahçe ve çim alan bakımı (aylık)', 'MON', 1, 145000, 20, { METREKARE: '38.000' }], ['Mevsimlik çiçek dikimi', 'C62', 2400, 28, 20]],
            },
            {
                k: 'fatura/kamu/tevkifat:613', n: 'Belediye Park Bakım Hakedişi (KAMU · 613)', w: 'Belediye park ve refüjlerinin ihaleli bakım hizmeti; KAMU + 613 tevkifat.', lay: 'kurumsal', to: { f: 'Muratpaşa Belediye Başkanlığı', city: 'Antalya' }, pay: 'havale',
                per: ['2026-09-01', '00:00:00', 'Eylül 2026', '2026-09-30', '23:59:59'],
                l: [['Park ve refüj bakımı (m²/ay)', 'MTK', 120000, 2.1, 20]],
                r: [['IHALE', '2025/887412'], ['HAKEDIS', '9']],
            },
            {
                k: 'arsiv', n: 'Villa Bahçe Düzenleme e-Arşiv', w: 'Villa sahibine hazır rulo çim, otomatik sulama ve ağaç dikimi.', lay: 'zarif', pay: 'havale',
                l: [['Hazır rulo çim (serim dahil)', 'MTK', 260, 145, 20], ['Otomatik sulama sistemi', 'SET', 1, 28000, 20], ['Zeytin ağacı (yaşlı, dikim dahil)', 'C62', 2, 18500, 20]],
            },
        ],
    },
    {
        code: 'K.05', sector: 'emlak', icon: 'building-2', c: ['#1e3a8a', '#fcd34d'], f: 'Mavi Kapı Gayrimenkul', o: 'Deniz Kaya', city: 'İzmir', slogan: 'Satılık · kiralık · kurumsal ofis kiralama',
        why: 'Emlakçı (yetki belgeli) aracılık komisyonunu alıcı ve satıcıya ayrı ayrı faturalar: gerçek kişilere e-Arşiv, şirketlere e-Fatura. Taşınmaz bilgisi (ada / parsel, tapu) ve yetki belge no belgeye eklenir; kira aracılığında dönem belirtilir.',
        docs: [
            {
                k: 'arsiv', n: 'Konut Satışı Aracılık Komisyonu e-Arşiv', w: 'Daire alıcısına satış bedeli üzerinden %2 + KDV hizmet bedeli; ada/parsel ve yetki belgesi.', lay: 'zarif', pay: 'havale',
                l: [['Taşınmaz alım aracılık hizmet bedeli', 'C62', 1, 132000, 20, { PARSEL: 'Karşıyaka 1418 ada 22 parsel', DAIRE: 'B Blok D:12' }]],
                r: [['YETKI', '3500418', 'Taşınmaz ticareti yetki belgesi']],
            },
            {
                k: 'arsiv', n: 'Kiralama Aracılık Komisyonu e-Arşiv', w: 'Kiracıya bir aylık kira bedeli + KDV hizmet bedeli; kira başlangıcı belgede.', lay: 'pastel', pay: 'havale', slug: 'kiralama-aracilik',
                per: ['2026-10-15', '00:00:00', 'Kira başlangıcı'],
                l: [['Kiralama aracılık hizmet bedeli', 'C62', 1, 28000, 20, { ADRES: 'Bostanlı Mah. 1782 Sk. No:4 D:6' }]],
            },
            {
                k: 'fatura', n: 'Şirkete Ofis Kiralama Aracılık Faturası', w: 'Şirketin yeni bölge ofisi için kiralama aracılık hizmeti.', lay: 'kurumsal', to: { f: 'Ege Bilişim Çözümleri A.Ş.', city: 'İzmir' }, pay: 'vade:15',
                l: [['Ofis kiralama aracılık hizmeti', 'C62', 1, 96000, 20, { METREKARE: '420', ADRES: 'Bayraklı Plaza K:14' }]],
            },
        ],
    },
    {
        code: 'K.06', sector: 'perakende', icon: 'hammer', c: ['#b45309', '#fde68a'], f: 'Usta Hırdavat Nalbur', o: 'Mustafa Demir', city: 'Kayseri', slogan: 'Hırdavat · el aletleri · bağlantı elemanları',
        why: 'Hırdavatçı perakende satışta e-Arşiv, inşaat ve sanayi firmalarına vadeli e-Fatura düzenler; şantiyeye teslimlerde e-İrsaliye ile sevk eder.',
        docs: [
            {
                k: 'arsiv', n: 'Nalbur Perakende Satışı e-Arşiv', w: 'Bireysel müşteriye matkap, vida ve silikon satışı.', lay: 'fis', pay: 'kart',
                l: [['Akülü matkap 18V', 'C62', 1, 3450, 20, { GARANTI: '2 yıl' }], ['Ahşap vidası 4x40 (kutu)', 'BX', 2, 140, 20], ['Şeffaf silikon', 'C62', 3, 95, 20]],
            },
            {
                k: 'fatura', n: 'İnşaat Firmasına Toptan Hırdavat', w: 'İnşaat firmasına vadeli bağlantı elemanı ve el aleti satışı.', lay: 'endustri', to: { f: 'Erciyes Yapı Taahhüt Ltd. Şti.', city: 'Kayseri' }, pay: 'vade:30',
                l: [['Dübel 10 mm (100\'lü)', 'BX', 40, 220, 20], ['Çelik dübel M10', 'C62', 800, 18, 20], ['Kesme taşı 230 mm', 'C62', 150, 55, 20], ['İş eldiveni', 'PR', 200, 35, 20]],
                r: [['IRSALIYE', 'UST2026000001882']],
            },
            {
                k: 'irsaliye', n: 'Şantiyeye Hırdavat Sevk İrsaliyesi', w: 'Faturadaki malzemenin şantiyeye kamyonetle sevki.', lay: 'defter', to: { f: 'Erciyes Yapı Taahhüt Ltd. Şti.', city: 'Kayseri' },
                l: [['Dübel 10 mm (100\'lü)', 'BX', 40, 220, 20], ['Çelik dübel M10', 'C62', 800, 18, 20], ['Kesme taşı 230 mm', 'C62', 150, 55, 20]],
                kg: 240, kap: 12,
            },
        ],
    },
    {
        code: 'K.07', sector: 'uretim', icon: 'brick-wall', c: ['#9a3412', '#fed7aa'], f: 'Anadolu Tuğla Kiremit San. A.Ş.', city: 'Eskişehir', sanayi: true, slogan: 'Tuğla · kiremit · gazbeton',
        why: 'İnşaat malzemesi üreticisi bayilere e-Fatura, fabrikadan tır sevkiyatlarında e-İrsaliye (plaka, dorse, kg) düzenler; komşu ülkelere ihracat IHRACAT profilli e-Fatura ile yapılır.',
        docs: [
            {
                k: 'fatura', n: 'Bayiye Tuğla ve Kiremit Faturası', w: 'Yapı malzemesi bayisine palet bazlı tuğla ve kiremit satışı.', lay: 'endustri', to: { f: 'Yapı Market İnşaat Malzemeleri Tic. Ltd. Şti.', city: 'Gaziantep' }, pay: 'vade:60',
                l: [['Yatay delikli tuğla 19x19x13,5', 'C62', 24000, 9.8, 20, { PALET: '60 palet' }], ['Marsilya kiremit', 'C62', 12000, 14.5, 20, { PALET: '40 palet' }]],
            },
            {
                k: 'irsaliye', n: 'Fabrikadan Tır Sevk İrsaliyesi', w: 'Tuğla yükünün dorseli tırla bayiye sevki; palet ve tonaj bilgisi.', lay: 'endustri', to: { f: 'Yapı Market İnşaat Malzemeleri Tic. Ltd. Şti.', city: 'Gaziantep' }, dorse: true,
                l: [['Yatay delikli tuğla 19x19x13,5', 'C62', 6000, 9.8, 20, { PALET: '15 palet' }]],
                kg: 24600, kap: 15,
            },
            {
                k: 'ihracat', n: 'Gürcistan\'a Kiremit İhracatı', w: 'Batum\'daki yapı market zincirine kiremit ihracatı; GTİP 6905.', lay: 'kurumsal', to: 'GE', cur: 'USD', inc: 'FCA', pkg: 'PX',
                l: [['Marsilya kiremit (palet)', 'C62', 18000, 0.38, 0, {}, { g: '690510000000', kap: 60 }]],
            },
        ],
    },
    {
        code: 'K.08', sector: 'insaat', icon: 'blocks', c: ['#57534e', '#fbbf24'], f: 'Yapı Market İnşaat Malzemeleri Tic. Ltd. Şti.', city: 'Gaziantep', slogan: 'Çimento · kum · çakıl · yalıtım',
        why: 'İnşaat malzemesi bayisi müteahhitlere e-Fatura, tadilat yapan bireylere e-Arşiv düzenler; şantiyeye teslimler e-İrsaliye ile (plaka, şoför) yapılır. İnşaat demiri satıyorsa IDIS profili ve 627 tevkifatı uygulanır.',
        docs: [
            {
                k: 'fatura', n: 'Müteahhide Çimento ve Agrega Faturası', w: 'Konut şantiyesine çimento, kum ve gazbeton satışı.', lay: 'endustri', to: { f: 'Şahinbey Konut İnşaat Ltd. Şti.', city: 'Gaziantep' }, pay: 'vade:45',
                l: [['Portland çimento CEM I 42,5 (50 kg)', 'BG', 800, 210, 20], ['Yıkanmış kum', 'TNE', 60, 520, 20], ['Gazbeton 60x25x20', 'MTQ', 48, 2350, 20]],
            },
            {
                k: 'irsaliye', n: 'Şantiyeye Malzeme Sevk İrsaliyesi', w: 'Çimento ve kumun kamyonla şantiyeye sevki.', lay: 'defter', to: { f: 'Şahinbey Konut İnşaat Ltd. Şti.', city: 'Gaziantep' },
                l: [['Portland çimento CEM I 42,5 (50 kg)', 'BG', 400, 210, 20], ['Yıkanmış kum', 'TNE', 20, 520, 20]],
                kg: 40000, kap: 2,
            },
            {
                k: 'arsiv', n: 'Bireysel Tadilat Malzemesi e-Arşiv', w: 'Ev tadilatı yapan müşteriye alçı, seramik yapıştırıcı ve taşyünü.', lay: 'fis', pay: 'kart',
                l: [['Saten alçı 25 kg', 'BG', 10, 260, 20], ['Seramik yapıştırıcı 25 kg', 'BG', 8, 240, 20], ['Taşyünü levha 5 cm (paket)', 'PA', 6, 690, 20]],
            },
        ],
    },
    {
        code: 'K.09', sector: 'insaat', icon: 'hard-hat', c: ['#f59e0b', '#1f2937'], f: 'Kuzey Yapı İnşaat Taahhüt Ltd. Şti.', city: 'Ankara', slogan: 'Konut · kamu yapım işleri · tadilat',
        why: 'Yapım işlerinde hakediş faturaları belirlenmiş alıcılara (A.Ş., kamu) 601 kodlu 4/10 KDV tevkifatı ile; kamu idarelerine KAMU senaryosu + IBAN ile düzenlenir (hakediş no, sözleşme, ihale kayıt no). Bireysel tadilat işleri e-Arşiv ile faturalanır.',
        docs: [
            {
                k: 'fatura/tevkifat:601', n: 'Konut Projesi Hakediş Faturası (Tevkifat 601)', w: 'İşveren A.Ş.\'ye kaba inşaat ara hakedişi; 4/10 tevkifat, hakediş dönemi.', lay: 'endustri', to: { f: 'Çankaya Gayrimenkul Geliştirme A.Ş.', city: 'Ankara' }, pay: 'vade:30',
                per: ['2026-09-01', '00:00:00', '5 No\'lu ara hakediş', '2026-09-30', '23:59:59'],
                l: [['Betonarme kaba inşaat (m²)', 'MTK', 2400, 6800, 20], ['Duvar örme (m²)', 'MTK', 3100, 640, 20]],
                r: [['HAKEDIS', '5'], ['SOZLESME', 'KZY-2025-014'], ['PROJE', 'Çayyolu Vadi Evleri']],
            },
            {
                k: 'fatura/kamu/tevkifat:601', n: 'Okul Binası Kamu Hakedişi (KAMU · 601)', w: 'İl milli eğitim müdürlüğüne okul yapımı hakedişi; KAMU senaryosu + 601 tevkifat.', lay: 'kurumsal', to: { f: 'Ankara Valiliği Yatırım İzleme ve Koordinasyon Başkanlığı', city: 'Ankara' }, pay: 'havale',
                per: ['2026-09-01', '00:00:00', '3 No\'lu hakediş', '2026-09-30', '23:59:59'],
                l: [['24 derslikli okul binası yapım işi (hakediş tutarı)', 'C62', 1, 8450000, 20]],
                r: [['IHALE', '2025/1018842'], ['HAKEDIS', '3'], ['SOZLESME', 'YIKOB-2025-118']],
            },
            {
                k: 'arsiv', n: 'Bireysel Daire Tadilatı e-Arşiv', w: 'Daire sahibine banyo-mutfak yenileme işçilik ve malzeme bedeli.', lay: 'kart', pay: 'havale',
                l: [['Banyo yenileme (malzeme + işçilik)', 'C62', 1, 145000, 20], ['Mutfak tezgâh ve fayans yenileme', 'C62', 1, 98000, 20]],
            },
        ],
    },
    {
        code: 'K.10', sector: 'uretim', icon: 'mountain', c: ['#78716c', '#f5f5f4'], f: 'Afyon Mermer Ocakçılık San. A.Ş.', city: 'Afyonkarahisar', sanayi: true, slogan: 'Blok mermer · plaka · kum-çakıl',
        why: 'Mermer ocağı blok ve plaka ihracatını IHRACAT profilli e-Fatura ile (GTİP 2515 blok / 6802 işlenmiş) yapar; yurt içi satışlar e-Fatura, ocaktan kamyonla sevkiyatlar e-İrsaliye (tonaj, plaka) ile belgelenir. Maden ruhsat no belgeye eklenir.',
        docs: [
            {
                k: 'ihracat', n: 'Blok Mermer ve Plaka İhracatı', w: 'Dubai\'deki ithalatçıya blok mermer ve cilalı plaka; GTİP 2515 / 6802, konteynerle.', lay: 'kurumsal', to: 'AE', cur: 'USD', inc: 'FOB', mode: 1, pkg: 'NE',
                l: [['Afyon beyaz blok mermer', 'MTQ', 42, 920, 0, {}, { g: '251512000000', kap: 14 }], ['Cilalı mermer plaka 2 cm', 'MTK', 1800, 48, 0, {}, { g: '680291000000', kap: 18 }]],
                r: [['RUHSAT', 'İR-03-2018-4412', 'Maden işletme ruhsatı']],
            },
            {
                k: 'fatura', n: 'Müteahhide Mermer Plaka Faturası', w: 'Otel projesine ebatlı mermer plaka ve basamak satışı.', lay: 'teknik', to: { f: 'Kuzey Yapı İnşaat Taahhüt Ltd. Şti.', city: 'Ankara' }, pay: 'vade:45',
                l: [['Mermer plaka 60x60x2 cilalı', 'MTK', 640, 1250, 20], ['Mermer basamak 120x33x3', 'C62', 180, 1450, 20]],
            },
            {
                k: 'irsaliye', n: 'Ocaktan Kum-Çakıl Sevk İrsaliyesi', w: 'Kırma taş ve kumun kamyonla hazır beton tesisine sevki; kantar fişi.', lay: 'endustri', to: { f: 'Frig Hazır Beton San. A.Ş.', city: 'Afyonkarahisar', sanayi: true },
                l: [['Kırma taş 0-5 mm', 'TNE', 28, 320, 20], ['Mıcır 5-12 mm', 'TNE', 26, 340, 20]],
                r: [['KANTARFISI', 'KF-2026-0918-221']],
            },
        ],
    },
    {
        code: 'K.11', sector: 'insaat', icon: 'house-plus', c: ['#0f766e', '#ccfbf1'], f: 'Modüler Prefabrik Yapı San. A.Ş.', city: 'Ankara', sanayi: true, slogan: 'Prefabrik bina · konteyner · şantiye kampı',
        why: 'Prefabrik üreticisi konteyner / modül satışını mal teslimi olarak e-Fatura ile, yerinde kurulumlu yapı işlerini yapım işi olarak 601 kodlu 4/10 tevkifatlı e-Fatura ile faturalar; yurt dışı şantiye kampları IHRACAT profiliyle ihraç edilir.',
        docs: [
            {
                k: 'fatura', n: 'Şantiye Konteyneri Satış Faturası', w: 'İnşaat firmasına yaşam ve ofis konteyneri satışı (mal teslimi).', lay: 'teknik', to: { f: 'Erciyes Yapı Taahhüt Ltd. Şti.', city: 'Kayseri' }, pay: 'vade:30',
                l: [['Ofis konteyneri 3x6 m', 'C62', 4, 185000, 20], ['WC-duş konteyneri 3x6 m', 'C62', 1, 240000, 20], ['Nakliye ve vinçle indirme', 'C62', 1, 28000, 20]],
            },
            {
                k: 'fatura/tevkifat:601', n: 'Prefabrik Okul Kurulumu (Tevkifat 601)', w: 'Özel eğitim kurumu için yerinde kurulumlu prefabrik bina yapım işi; 4/10 tevkifat.', lay: 'endustri', to: { f: 'Bilge Eğitim Kurumları A.Ş.', city: 'Ankara' }, pay: 'vade:30',
                l: [['Prefabrik bina yapımı (kurulum dahil)', 'MTK', 640, 14500, 20], ['Zemin betonu ve ankraj', 'C62', 1, 280000, 20]],
                r: [['SOZLESME', 'MPY-2026-021']],
            },
            {
                k: 'ihracat', n: 'Irak Şantiye Kampı İhracatı', w: 'Irak\'taki şantiye için demonte prefabrik kamp binaları; GTİP 9406.', lay: 'kurumsal', to: 'IQ', cur: 'USD', inc: 'DAP', pkg: 'PK',
                l: [['Demonte prefabrik yatakhane binası', 'C62', 6, 42000, 0, {}, { g: '940690100000', kap: 18 }], ['Demonte yemekhane binası', 'C62', 1, 68000, 0, {}, { g: '940690100000', kap: 4 }]],
            },
        ],
    },
    {
        code: 'K.12', sector: 'uretim', icon: 'door-open', c: ['#2563eb', '#f1f5f9'], f: 'Pen Plast PVC Doğrama San. Ltd. Şti.', city: 'Konya', sanayi: true, slogan: 'PVC profil · pencere · kapı · sineklik',
        why: 'PVC ürün imalatçısı bayilere ve müteahhitlere e-Fatura, fabrikadan sevkiyatta e-İrsaliye düzenler; ölçüye özel pencere satışlarında ev müşterisine montajlı e-Arşiv kesilir.',
        docs: [
            {
                k: 'fatura', n: 'Bayiye PVC Profil Faturası', w: 'PVC doğrama atölyesine profil, takviye sacı ve conta satışı.', lay: 'endustri', to: { f: 'Işık Pencere PVC Sistemleri', city: 'İstanbul' }, pay: 'vade:60',
                l: [['PVC kasa profili 70 mm (6 m)', 'MTR', 3600, 112, 20, { RENK: 'Beyaz' }], ['Galvaniz takviye sacı', 'MTR', 3000, 46, 20], ['EPDM conta', 'MTR', 5000, 6.5, 20]],
            },
            {
                k: 'irsaliye', n: 'PVC Profil Sevk İrsaliyesi', w: 'Profillerin dorseli tırla bayiye sevki.', lay: 'endustri', to: { f: 'Işık Pencere PVC Sistemleri', city: 'İstanbul' }, dorse: true,
                l: [['PVC kasa profili 70 mm (6 m)', 'MTR', 3600, 112, 20], ['Galvaniz takviye sacı', 'MTR', 3000, 46, 20]],
                kg: 9800, kap: 42,
            },
            {
                k: 'arsiv', n: 'Eve Ölçülü PVC Pencere e-Arşiv', w: 'Ev müşterisine ölçülü ısıcamlı PVC pencere ve montaj.', lay: 'pastel', pay: 'havale',
                l: [['PVC pencere (ısıcamlı, açılır)', 'MTK', 11.4, 4200, 20, { OLCU: '6 adet, ölçü listesi ekte' }], ['Sökme + montaj işçiliği', 'C62', 6, 900, 20]],
            },
        ],
    },
    {
        code: 'K.13', sector: 'perakende', icon: 'blinds', c: ['#4f46e5', '#e0e7ff'], f: 'Işık Pencere PVC Sistemleri', o: 'Barış Aksoy', city: 'İstanbul', slogan: 'PVC pencere · jaluzi · sineklik montaj',
        why: 'PVC ürün satıcısı ev müşterilerine montaj dahil e-Arşiv, site yönetimi / müteahhitlere e-Fatura düzenler; ölçü ve renk bilgisi satırda verilir.',
        docs: [
            {
                k: 'arsiv', n: 'Pencere ve Sineklik Montajı e-Arşiv', w: 'Daireye PVC pencere, plise sineklik ve jaluzi montajı.', lay: 'fis', pay: 'kart',
                l: [['PVC pencere (ısıcamlı)', 'MTK', 6.8, 4600, 20], ['Plise sineklik', 'C62', 4, 1350, 20], ['Alüminyum jaluzi', 'MTK', 5.2, 980, 20]],
            },
            {
                k: 'fatura', n: 'Site Yönetimine Toplu Kapı Değişimi', w: 'Site blok giriş kapılarının PVC kapıyla değiştirilmesi.', lay: 'kurumsal', to: { f: 'Ataşehir Konakları Toplu Yapı Yönetimi', city: 'İstanbul' }, pay: 'vade:30',
                l: [['PVC bina giriş kapısı (çift kanat)', 'C62', 8, 38000, 20, { RENK: 'Antrasit' }], ['Kartlı geçiş kilit sistemi', 'SET', 8, 6500, 20]],
            },
        ],
    },
    {
        code: 'K.14', sector: 'insaat', icon: 'shower-head', c: ['#0891b2', '#cffafe'], f: 'Akış Sıhhi Tesisat ve Doğalgaz', o: 'Ercan Kılıç', city: 'Ankara', slogan: 'Su tesisatı · doğalgaz · kombi montaj',
        why: 'Sıhhi tesisatçı ev müşterilerine e-Arşiv düzenler; müteahhide alt yüklenici olarak yaptığı bina tesisat işleri yapım işi sayıldığından belirlenmiş alıcılara 601 kodlu 4/10 tevkifatlı e-Fatura kesilir. Doğalgaz proje / onay numarası belgeye eklenir.',
        docs: [
            {
                k: 'arsiv', n: 'Kombi ve Doğalgaz Tesisatı e-Arşiv', w: 'Daireye doğalgaz iç tesisatı, kombi ve petek montajı; proje onay no belgede.', lay: 'serit', pay: 'havale',
                l: [['Doğalgaz iç tesisatı (proje + montaj)', 'C62', 1, 18500, 20], ['Yoğuşmalı kombi 24 kW', 'C62', 1, 34000, 20, { SERINO: 'KB24-2609-4418', GARANTI: '3 yıl' }], ['Panel radyatör 600x1200', 'C62', 6, 3200, 20]],
                r: [['PROJE_NO', 'BŞG-2026-118842', 'Doğalgaz proje onayı']],
            },
            {
                k: 'fatura/tevkifat:601', n: 'Müteahhide Bina Tesisat İşi (Tevkifat 601)', w: 'Konut projesinin sıhhi tesisat alt yüklenici hakedişi; 4/10 tevkifat.', lay: 'endustri', to: { f: 'Çankaya Gayrimenkul Geliştirme A.Ş.', city: 'Ankara' }, pay: 'vade:30',
                l: [['Daire sıhhi tesisat (malzeme + işçilik)', 'C62', 48, 42000, 20], ['Ortak alan yangın tesisatı', 'C62', 1, 360000, 20]],
                r: [['HAKEDIS', '2'], ['PROJE', 'Çayyolu Vadi Evleri']],
            },
        ],
    },
    {
        code: 'K.15', sector: 'insaat', icon: 'arrow-down-to-dot', c: ['#1d4ed8', '#fde68a'], f: 'Derin Sondaj Su Kuyusu Ltd. Şti.', city: 'Konya', slogan: 'Su kuyusu · zemin etüt sondajı · jeotermal',
        why: 'Sondaj firması çiftçiye su kuyusu açımını e-Arşiv ile, DSİ / belediye gibi kamu idarelerine yapım işi niteliğindeki sondajı KAMU senaryolu 601 tevkifatlı e-Fatura ile faturalar. Zemin etüdü amaçlı sondaj "etüt, plan-proje" hizmeti olduğundan 602 (9/10) tevkifat uygulanır.',
        docs: [
            {
                k: 'arsiv', n: 'Çiftçiye Su Kuyusu Açımı e-Arşiv', w: 'Tarla sulaması için metre bazlı su kuyusu sondajı ve muhafaza borusu.', lay: 'defter', pay: 'havale',
                l: [['Su kuyusu sondajı (metre)', 'MTR', 180, 950, 20, { PARSEL: 'Karatay 214 ada 6 parsel' }], ['Muhafaza borusu çelik 10"', 'MTR', 180, 780, 20]],
                r: [['RUHSAT', 'DSİ-42-2026-3318', 'Yeraltı suyu arama belgesi']],
            },
            {
                k: 'fatura/kamu/tevkifat:601', n: 'Belediye İçme Suyu Kuyusu (KAMU · 601)', w: 'Belediyeye içme suyu sondaj kuyusu yapım işi; KAMU + 601 tevkifat.', lay: 'kurumsal', to: { f: 'Ereğli Belediye Başkanlığı', city: 'Konya' }, pay: 'havale',
                l: [['İçme suyu sondaj kuyusu (metre)', 'MTR', 320, 2400, 20], ['Pompa testi ve kuyu geliştirme', 'C62', 1, 85000, 20]],
                r: [['IHALE', '2026/552184']],
            },
            {
                k: 'fatura/tevkifat:602', n: 'Zemin Etüt Sondajı (Tevkifat 602)', w: 'İnşaat firmasına zemin etüdü amaçlı karotlu sondaj ve rapor; 9/10 tevkifat.', lay: 'teknik', to: { f: 'Selçuklu Yapı Konut İnşaat A.Ş.', city: 'Konya' }, pay: 'vade:30',
                l: [['Karotlu zemin sondajı (metre)', 'MTR', 120, 1400, 20], ['Zemin etüt raporu', 'C62', 1, 45000, 20]],
                r: [['PROJE', 'Meram Vadi Konutları']],
            },
        ],
    },
];
