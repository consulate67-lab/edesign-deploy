// F — Hediyelik Eşya, Eğitim, Basım, Fotoğraf, Çeşitli Mallar
export default [
    {
        code: 'F.01', sector: 'buro', icon: 'file-pen-line', c: ['#1e40af', '#bfdbfe'], f: 'Adalet Arzuhal ve Danışmanlık Bürosu', o: 'Hasan Yıldırım', city: 'Ankara', slogan: 'Dilekçe · sözleşme · işletme ve İK danışmanlığı',
        why: 'Arzuhalci ve danışman serbest meslek erbabıdır: vatandaşa dilekçe / sözleşme yazımında e-SMM (gerçek kişi müşteri stopaj sorumlusu değildir), şirketlere danışmanlıkta %20 GV stopajlı e-SMM düzenler. Danışmanlık hizmeti belirlenmiş alıcıya verilirse 602 kodlu 9/10 KDV tevkifatı da uygulanır.',
        docs: [
            {
                k: 'smm', n: 'Dilekçe ve Sözleşme Yazımı e-SMM', w: 'Vatandaşa icra itiraz dilekçesi ve kira sözleşmesi hazırlanması; gerçek kişi müşteri olduğundan stopaj yok.', lay: 'defter', to: 'kisi',
                l: [['İcra müdürlüğüne itiraz dilekçesi', 'C62', 1, 750, 20], ['Konut kira sözleşmesi hazırlama', 'C62', 1, 1200, 20], ['Evrak çıktısı ve dosyalama', 'C62', 1, 100, 20]],
            },
            {
                k: 'smm/tevkifat:602', n: 'Kurumsal İK Danışmanlığı e-SMM (Stopaj + Tevkifat 602)', w: 'Lojistik şirketine aylık insan kaynakları danışmanlığı; %20 GV stopajı ve 9/10 KDV tevkifatı birlikte.', lay: 'kurumsal', to: { f: 'Başkent Lojistik Hizmetleri A.Ş.', city: 'Ankara' },
                per: ['2026-09-01', null, 'Eylül 2026 danışmanlık dönemi', '2026-09-30'],
                l: [['Aylık İK danışmanlık hizmeti', 'MON', 1, 40000, 20], ['Performans değerlendirme sistemi kurulumu', 'C62', 1, 25000, 20]],
                r: [['SOZLESME', 'BLH-DAN-2026-07']],
            },
        ],
    },
    {
        code: 'F.02', sector: 'medya', icon: 'newspaper', c: ['#0f172a', '#f59e0b'], f: 'Kardelen Yayınevi Basın Yayın Ltd. Şti.', city: 'İstanbul', slogan: 'Kitap · dergi · dijital yayıncılık',
        why: 'Basılı kitap ve süreli yayın teslimleri KDV Kanunu 13/n uyarınca tam istisnadır (poşetli ve elektronik yayınlar hariç): dağıtıcı ve kitapçılara e-Fatura, okura web satışında e-Arşiv internet satışı ISTISNA 335 ile düzenlenir. Dergideki ilan / reklam geliri genel oranda KDV\'ye tabidir ve belirlenmiş alıcılarda 625 (3/10) tevkifatı uygulanır.',
        docs: [
            {
                k: 'fatura/istisna:335', n: 'Dağıtıcıya Kitap Satış Faturası (İstisna 335)', w: 'Kitap dağıtım şirketine yeni çıkan roman ve çocuk kitapları; dağıtıcı iskontosu satırda, KDV 13/n istisnası.', lay: 'kurumsal', to: { f: 'Pegasus Kitap Dağıtım A.Ş.', city: 'İstanbul' }, pay: 'vade:60',
                l: [['Roman — Kuzey Rüzgârı (karton kapak)', 'C62', 1200, 280, 0, { ISBN: '978-605-9411-28-3' }, { disc: { rate: 0.45, reason: 'Dağıtıcı iskontosu' } }], ['Çocuk kitabı seti (5 kitap)', 'SET', 400, 450, 0, { ISBN: '978-605-9411-31-3' }, { disc: { rate: 0.45, reason: 'Dağıtıcı iskontosu' } }], ['Kardelen Edebiyat Dergisi — Ekim sayısı', 'C62', 1500, 90, 0, {}, { disc: { rate: 0.4, reason: 'Bayi iskontosu' } }]],
                r: [['IRSALIYE', 'KYB2026000001184']],
                nt: ['3065 sayılı KDV Kanununun (13/n) maddesi hükmü gereğince KDV hesaplanmamıştır.'],
            },
            {
                k: 'arsiv/net/istisna:335', n: 'Okura Online Kitap Satışı e-Arşiv (İstisna 335)', w: 'Yayınevi web sitesinden okura kitap satışı; internet satışı alanları + 13/n istisnası, kargo ücretsiz.', lay: 'pastel',
                l: [['Roman — Kuzey Rüzgârı', 'C62', 1, 280, 0, { ISBN: '978-605-9411-28-3' }], ['Deneme — Şehrin Kıyısında', 'C62', 1, 240, 0, { ISBN: '978-605-9411-19-1' }]],
                nt: ['3065 sayılı KDV Kanununun (13/n) maddesi hükmü gereğince KDV hesaplanmamıştır.'],
            },
            {
                k: 'fatura/tevkifat:625', n: 'Dergi İlan Faturası (Tevkifat 625)', w: 'Seramik firmasına dergi tam sayfa ilan ve dijital banner yayını; ticari reklam hizmeti 3/10 tevkifatlı.', lay: 'modern', to: { f: 'Ege Seramik Sanayi A.Ş.', city: 'İzmir', sanayi: true }, pay: 'vade:30',
                l: [['Tam sayfa renkli ilan (Ekim sayısı)', 'C62', 1, 85000, 20], ['Web sitesi banner yayını (30 gün)', 'DAY', 30, 700, 20]],
                r: [['SOZLESME', 'KY-ILN-26-114']],
            },
        ],
    },
    {
        code: 'F.03', sector: 'medya', icon: 'brush', c: ['#9d174d', '#fbcfe8'], f: 'Deniz Aksoy Sanat Atölyesi', o: 'Deniz Aksoy', city: 'İzmir', slogan: 'Resim · beste · edebi eser',
        why: 'Eser sahibinin (ressam, besteci, yazar) eser satışı ve hak devri GVK 18 kapsamında gelir vergisinden istisnadır ancak şirket alıcılar %17 stopaj keser; eser sahibi e-SMM düzenler (yalnız GVK 94 sorumlularına satış yapıp makbuz yükümlülüğünden çıkanlar için alıcı gider pusulası düzenler). GVK 18 istisnası KDV istisnası değildir.',
        docs: [
            {
                k: 'smm', n: 'Beste Telif Devri e-SMM (Stopaj %17)', w: 'Müzik yapım şirketine beste ve söz haklarının devri; GVK 18 kapsamında %17 stopaj.', lay: 'zarif', to: { f: 'Ritim Müzik Yapım Ltd. Şti.', city: 'İstanbul' }, stopaj: 17,
                l: [['Beste ve söz hakkı devri — "Sahil Yolu"', 'C62', 1, 60000, 20], ['Düzenleme (aranje) hakkı', 'C62', 1, 15000, 20]],
                r: [['SOZLESME', 'RMY-TLF-2026-12']],
                nt: ['Eser sahibi GVK 18. madde istisnasından yararlanmaktadır; kesilen %17 stopaj nihai vergidir.'],
            },
            {
                k: 'smm', n: 'Tablo Satışı e-SMM (Koleksiyoncuya)', w: 'Koleksiyoncuya yağlı boya tablo satışı; gerçek kişi alıcı stopaj sorumlusu değildir.', lay: 'kart', to: 'kisi',
                l: [['Yağlı boya tuval — "Kordon’da Akşam" 100 x 140 cm', 'C62', 1, 85000, 20, { OLCU: '100 x 140 cm', MALZEME: 'Tuval üzerine yağlı boya' }], ['Çerçeveleme ve teslim', 'C62', 1, 3500, 20]],
                r: [['SERTIFIKA', 'DA-2026-014', 'Eser orijinallik sertifikası']],
            },
        ],
    },
    {
        code: 'F.04', sector: 'toptan', icon: 'package', c: ['#0369a1', '#fde68a'], f: 'Yıldız Toptan Ev Gereçleri Tic. Ltd. Şti.', city: 'Gaziantep', slogan: 'Ev gereçleri · plastik · tuhafiye toptan',
        why: 'Uzmanlaşmamış toptancı perakendecilere e-Fatura ve araçla sevkiyatta e-İrsaliye düzenler; komşu ülkelere TIR ile satışlarda IHRACAT profilli, gümrük muhataplı fatura kullanır. Perakende tezgâh satışları e-Arşiv ile belgelenir.',
        docs: [
            {
                k: 'fatura', n: 'Markete Toptan Ev Gereçleri e-Faturası', w: 'Mahalle marketine plastik mutfak gereçleri, şemsiye ve temizlik bezi toptan satışı.', lay: 'kenar', to: { f: 'Bereket Market Gıda Ltd. Şti.', city: 'Gaziantep' }, pay: 'vade:30',
                l: [['Plastik saklama kabı seti (3\'lü)', 'SET', 120, 95, 20], ['Katlanır şemsiye', 'C62', 80, 140, 20], ['Mikrofiber temizlik bezi (5\'li)', 'PA', 200, 48, 20], ['Çamaşır mandalı (24\'lü)', 'PA', 150, 22, 20]],
                r: [['IRSALIYE', 'YTE2026000002218']],
            },
            {
                k: 'irsaliye', n: 'Toptan Sevk İrsaliyesi', w: 'Depodan markete kamyonetle koli sevki; koli adedi ve şoför bilgisi.', lay: 'teknik', to: { f: 'Bereket Market Gıda Ltd. Şti.', city: 'Gaziantep' }, kg: 640, kap: 34,
                l: [['Plastik saklama kabı seti (3\'lü)', 'SET', 120, 0, 20, { KOLI: '10 koli' }], ['Katlanır şemsiye', 'C62', 80, 0, 20, { KOLI: '4 koli' }], ['Mikrofiber temizlik bezi (5\'li)', 'PA', 200, 0, 20, { KOLI: '10 koli' }]],
            },
            {
                k: 'ihracat', n: 'Irak\'a TIR ile İhracat Faturası (DAP)', w: 'Erbil\'deki toptancıya ev gereçleri ihracatı; GTİP ve koli bilgisi satırda, kara yolu.', lay: 'serit', to: 'IQ', cur: 'USD', inc: 'DAP', mode: 3, pkg: 'CT',
                l: [['Plastik saklama kabı seti', 'SET', 3000, 2.4, 0, {}, { g: '392410000000', kap: 250 }], ['Paslanmaz çaydanlık takımı', 'SET', 800, 9.5, 0, {}, { g: '732393000000', kap: 100 }], ['Şemsiye', 'C62', 2000, 3.1, 0, {}, { g: '660191000000', kap: 80 }]],
                r: [['BEYANNAME', '26270100EX00211846']],
            },
        ],
    },
    {
        code: 'F.05', sector: 'perakende', icon: 'flower-2', c: ['#be185d', '#bbf7d0'], f: 'Lale Bahçesi Çiçekçilik', o: 'Gül Şahin', city: 'İzmir', slogan: 'Buket · aranjman · kurumsal çiçek',
        why: 'Çiçekçi tüketiciye e-Arşiv (online siparişte internet satışı alanları ve kurye teslimi) düzenler; otel ve şirketlere aylık çiçek düzenleme hizmetini e-Fatura ile faturalar. Kesme çiçeği doğrudan ÇKS kayıtlı üreticiden alıyorsa e-Müstahsil Makbuzu (%2 stopaj) düzenler.',
        docs: [
            {
                k: 'arsiv/net', n: 'Online Çiçek Siparişi e-Arşiv (İnternet)', w: 'Web sitesinden verilen buket siparişi; alıcıya kuryeyle teslim, not kartı satırda.', lay: 'pastel',
                l: [['Kırmızı gül buketi (21 adet)', 'C62', 1, 1450, 20], ['Orkide (çift dal, seramik saksı)', 'C62', 1, 1100, 20], ['Not kartı ve kurye teslimi', 'C62', 1, 150, 20]],
            },
            {
                k: 'fatura', n: 'Otel Aylık Çiçek Düzenleme e-Faturası', w: 'Otel lobisi ve restoranı için haftalık çiçek düzenlemesi; Eylül dönemi.', lay: 'zarif', to: { f: 'Kordon Palas Otelcilik A.Ş.', city: 'İzmir' }, pay: 'vade:30',
                per: ['2026-09-01', null, 'Eylül 2026 çiçek düzenleme', '2026-09-30'],
                l: [['Lobi aranjmanı (haftalık yenileme)', 'C62', 4, 4800, 20], ['Restoran masa çiçeği', 'C62', 120, 85, 20], ['Resepsiyon orkide bakımı', 'MON', 1, 1500, 20]],
                r: [['SOZLESME', 'KP-CCK-2026-02']],
            },
            {
                k: 'mustahsil/bitki', n: 'Üreticiden Kesme Çiçek Alımı e-Müstahsil', w: 'Seracı üreticiden kesme gül ve karanfil alımı; %2 GV stopajı ve Bağ-Kur kesintisi.', lay: 'defter',
                l: [['Kesme gül (dal)', 'C62', 1200, 9, 0, { CINS: 'Red Naomi' }], ['Kesme karanfil (dal)', 'C62', 800, 5, 0]],
                r: [['CKS', 'ÇKS-35-2026-118842']],
            },
        ],
    },
    {
        code: 'F.06', sector: 'finans', icon: 'receipt', c: ['#0f766e', '#99f6e4'], f: 'Hızlı Fatura Ödeme Merkezi', o: 'Ömer Kurt', city: 'Samsun', slogan: 'Elektrik · su · doğalgaz · telefon fatura ödeme',
        why: 'Fatura tahsilat bürosu müşterinin ödediği kurum faturalarını kendi hasılatı olarak değil emanet olarak tahsil eder; gelir olan komisyonu ödeme kuruluşuna / kuruma aylık e-Fatura ile belgeler. Müşteriden ayrıca işlem hizmet bedeli alınıyorsa bunun için e-Arşiv düzenlenir; müşteriye verilen tahsilat dekontu e-belge değildir.',
        docs: [
            {
                k: 'fatura', n: 'Ödeme Kuruluşuna Aylık Komisyon e-Faturası', w: 'Yetkili ödeme kuruluşuna Eylül ayı fatura tahsilat işlem komisyonu; işlem adedi ve tahsilat hacmi satırda.', lay: 'teknik', to: { f: 'Anadolu Ödeme Hizmetleri ve Elektronik Para A.Ş.', city: 'İstanbul' }, pay: 'havale',
                per: ['2026-09-01', null, 'Eylül 2026 tahsilat dönemi', '2026-09-30'],
                l: [['Fatura tahsilat işlem komisyonu', 'C62', 6840, 2.5, 20, {}, { desc: '6.840 işlem × 2,50 TL' }], ['Tahsilat hacmi primi', 'C62', 1, 3100, 20, {}, { desc: '3.100.000 TL tahsilat × binde 1' }]],
                r: [['BAYI', 'AOH-55-0918']],
            },
            {
                k: 'arsiv', n: 'İşlem Hizmet Bedeli e-Arşiv', w: 'Müşteriden alınan fatura ödeme hizmet bedeli; ödenen kurum faturaları belge kapsamı dışında.', lay: 'fis', pay: 'nakit',
                l: [['Fatura ödeme hizmet bedeli', 'C62', 4, 10, 20, {}, { desc: 'Elektrik, su, doğalgaz, GSM' }]],
                nt: ['Tahsil edilen kurum faturaları (3.842,60 TL) emanet niteliğindedir ve bu belgenin konusu değildir.'],
            },
        ],
    },
    {
        code: 'F.07', sector: 'medya', icon: 'camera', c: ['#111827', '#fbbf24'], f: 'Kare Fotoğraf Stüdyosu', o: 'Burak Polat', city: 'Bursa', slogan: 'Düğün · vesikalık · ürün fotoğrafı',
        why: 'Fotoğrafçı tüketiciye düğün / vesikalık çekimlerinde e-Arşiv, firmalara katalog ve e-ticaret ürün çekimlerinde e-Fatura düzenler. Fotoğraf sanatçısı olarak eser (fotoğraf) hakkı devri yapıyorsa e-SMM ve GVK 18 kapsamında %17 stopaj söz konusu olur.',
        docs: [
            {
                k: 'arsiv', n: 'Düğün Çekim Paketi e-Arşiv', w: 'Düğün günü fotoğraf + klip çekimi ve albüm; çekim tarihi dönem alanında.', lay: 'zarif', pay: 'havale',
                per: ['2026-09-26', '14:00:00', 'Düğün çekimi'],
                l: [['Düğün fotoğraf çekimi (tam gün)', 'C62', 1, 18000, 20], ['Düğün klibi (4K, kurgu dahil)', 'C62', 1, 12000, 20], ['Albüm 30 x 40 cm (40 sayfa)', 'C62', 1, 6500, 20]],
                r: [['SOZLESME', 'KFS-2026-088']],
                nt: ['%30 kapora 14.07.2026 tarihinde alınmıştır.'],
            },
            {
                k: 'fatura', n: 'E-Ticaret Ürün Fotoğrafı e-Faturası', w: 'Tekstil firmasına beyaz fon ürün çekimi ve manken çekimi; adet bazlı fiyatlandırma.', lay: 'modern', to: { f: 'Nilüfer Tekstil Pazarlama Ltd. Şti.', city: 'Bursa' }, pay: 'vade:15',
                l: [['Beyaz fon ürün fotoğrafı (retuşlu)', 'C62', 240, 120, 20], ['Manken çekimi (yarım gün)', 'C62', 1, 9000, 20], ['Stüdyo ve ışık ekipmanı', 'C62', 1, 2500, 20]],
                r: [['SIPARIS', 'NTP-FT-26-41']],
            },
        ],
    },
    {
        code: 'F.08', sector: 'buro', icon: 'printer', c: ['#4338ca', '#c7d2fe'], f: 'Kampüs Fotokopi ve Tez Merkezi', o: 'Merve Koç', city: 'Eskişehir', slogan: 'Fotokopi · baskı · tez ciltleme',
        why: 'Fotokopici öğrencilere ve vatandaşlara e-Arşiv düzenler; üniversite gibi kamu idarelerine yapılan baskı / fotokopi hizmetinde KAMU senaryolu e-Fatura (ödeme IBAN zorunlu) kullanır. Belirlenmiş alıcılara yapılan baskı işi 615 (7/10) tevkifat kapsamına girebilir; sadece fotokopi çekimi ise basım hizmeti sayılmayabilir.',
        docs: [
            {
                k: 'arsiv', n: 'Tez Baskı ve Ciltleme e-Arşiv', w: 'Yüksek lisans öğrencisine tez çıktısı, ciltleme ve CD yazımı.', lay: 'fis', pay: 'kart',
                l: [['Tez çıktısı (renkli sayfa)', 'C62', 24, 6, 20], ['Tez çıktısı (siyah-beyaz sayfa)', 'C62', 186, 1.5, 20], ['Sert kapak ciltleme (yaldızlı)', 'C62', 4, 220, 20], ['CD yazma ve etiket', 'C62', 2, 40, 20]],
            },
            {
                k: 'fatura/kamu', n: 'Üniversiteye Fotokopi Hizmeti (KAMU)', w: 'Üniversite fakültesine sınav evrakı fotokopi ve çoğaltma hizmeti; KAMU senaryosu, IBAN zorunlu.', lay: 'kurumsal', to: { f: 'Eskişehir Teknik Üniversitesi Rektörlüğü', city: 'Eskişehir' }, pay: 'havale',
                l: [['Sınav evrakı fotokopi (A4)', 'C62', 42000, 0.55, 20], ['Spiralli ders notu çoğaltma', 'C62', 300, 45, 20]],
                r: [['IHALE', '2026/DT-1184', 'Doğrudan temin']],
            },
        ],
    },
    {
        code: 'F.09', sector: 'perakende', icon: 'gift', c: ['#c2410c', '#fed7aa'], f: 'Kapadokya Hediyelik Eşya Ltd. Şti.', city: 'Nevşehir', slogan: 'Seramik · nazar boncuğu · el sanatları',
        why: 'Hediyelik eşya imalatçı-satıcısı yabancı turistlere yolcu beraberi eşya faturası (Tax Free, istisna 501), yerli ziyaretçilere e-Arşiv, diğer hediyelik dükkânlarına toptan satışta e-Fatura düzenler. Yurt dışına online küçük gönderiler ETGB\'li mikro ihracattır.',
        docs: [
            {
                k: 'yolcu', n: 'Turiste Seramik Satışı (Yolcu Beraberi)', w: 'Yabancı turiste el yapımı Avanos seramiği; pasaport ve aracı kurum bilgisi, KDV iadesi gümrük onayıyla.', lay: 'serit', pay: 'kart',
                l: [['El yapımı çini tabak Ø 40 cm', 'C62', 2, 3800, 20, { MALZEME: 'Avanos kili, el boyaması' }], ['Seramik vazo (testi)', 'C62', 1, 2600, 20]],
            },
            {
                k: 'fatura', n: 'Hediyelik Dükkânına Toptan e-Faturası', w: 'Turistik bölgedeki hediyelik eşya dükkânına nazar boncuğu, magnet ve seramik toptan satışı.', lay: 'kenar', to: { f: 'Göreme Souvenir Turizm Ltd. Şti.', city: 'Nevşehir' }, pay: 'vade:30',
                l: [['Cam nazar boncuğu (orta boy)', 'C62', 2000, 6, 20], ['Peri bacası figürlü magnet', 'C62', 1500, 12, 20], ['Mini seramik testi', 'C62', 600, 35, 20]],
            },
            {
                k: 'mikro', n: 'Yurt Dışı Online Sipariş Mikro İhracat (ETGB)', w: 'Fransa\'daki müşterinin web sitesi siparişi; ETGB, GTİP ve kargo takip bilgisi.', lay: 'kart', to: 'FR', cur: 'EUR',
                l: [['El yapımı çini kase seti', 'SET', 2, 48, 0, {}, { g: '691200300000' }], ['Cam nazar boncuğu duvar süsü', 'C62', 3, 14, 0, {}, { g: '701890100000' }]],
            },
        ],
    },
    {
        code: 'F.10', sector: 'uretim', icon: 'package-open', c: ['#92400e', '#e7e5e4'], f: 'Körfez Ambalaj Kağıt Karton San. A.Ş.', city: 'Kocaeli', slogan: 'Oluklu mukavva · koli · kağıt torba', sanayi: true,
        why: 'Kağıt / ambalaj üreticisi sanayicilere koli ve kağıt ürünlerini e-Fatura ile satar, sevkiyatı e-İrsaliye ile yapar. Hammadde olarak sokak toplayıcılarından ve vergiden muaf kişilerden atık kağıt alımlarında e-Gider Pusulası düzenlenir; atıktan elde edilen hammadde (kağıt hamuru) tesliminde 621 (9/10) tevkifat uygulanır.',
        docs: [
            {
                k: 'fatura', n: 'Gıda Firmasına Koli Satış e-Faturası', w: 'Baskılı oluklu koli ve ara bölme satışı; ölçü ve dalga tipi satır etiketlerinde.', lay: 'endustri', to: { f: 'Marmara Bisküvi Gıda San. A.Ş.', city: 'Kocaeli', sanayi: true }, pay: 'vade:60',
                l: [['Oluklu koli 3 dalga, 2 renk baskılı', 'C62', 18000, 14.5, 20, { OLCU: '40 x 30 x 25 cm', KALITE: 'BC dalga' }], ['Karton ara bölme', 'C62', 18000, 2.2, 20], ['Kağıt şerit bant', 'C62', 400, 38, 20]],
                r: [['SIPARIS', 'MB-SAT-26-4418'], ['IRSALIYE', 'KAK2026000008812']],
            },
            {
                k: 'irsaliye', n: 'Koli Sevk İrsaliyesi', w: 'Fabrikadan müşteri deposuna paletli koli sevkiyatı; palet adedi ve brüt ağırlık.', lay: 'teknik', to: { f: 'Marmara Bisküvi Gıda San. A.Ş.', city: 'Kocaeli', sanayi: true }, kg: 7200, kap: 24, dorse: true,
                l: [['Oluklu koli 3 dalga, 2 renk baskılı', 'C62', 18000, 0, 20, { PALET: '18 palet' }], ['Karton ara bölme', 'C62', 18000, 0, 20, { PALET: '6 palet' }]],
                r: [['SIPARIS', 'MB-SAT-26-4418']],
            },
            {
                k: 'gider/stopaj:2', n: 'Toplayıcıdan Atık Kağıt Alımı Gider Pusulası', w: 'Kapı kapı dolaşarak atık toplayan (GVK 9/7 esnaf muaflığı) kişiden kantarla karton ve kağıt alımı; GVK 94/13-b gereği %2 stopaj.', lay: 'defter', pay: 'nakit',
                l: [['Atık oluklu karton', 'KGM', 1840, 3.4, 0], ['Karışık atık kağıt', 'KGM', 620, 2.1, 0]],
                r: [['KANTARFISI', 'KAK-KF-26-3318']],
            },
        ],
    },
    {
        code: 'F.11', sector: 'uretim', icon: 'cylinder', c: ['#1d4ed8', '#a5b4fc'], f: 'Polimer Plastik Kauçuk San. Tic. Ltd. Şti.', city: 'Bursa', slogan: 'Kauçuk conta · hortum · plastik enjeksiyon', sanayi: true,
        why: 'Plastik-kauçuk imalatçısı otomotiv yan sanayi ve sanayi müşterilerine e-Fatura düzenler; atık plastikten rejenere granül teslimleri 621 kodlu 9/10 tevkifata tabidir. Yurt dışı müşterilere IHRACAT profilli fatura (GTİP 39 / 40) kullanılır.',
        docs: [
            {
                k: 'fatura', n: 'Yan Sanayiye Conta ve Hortum e-Faturası', w: 'Otomotiv yan sanayi firmasına EPDM conta ve radyatör hortumu; parti numarası satırda.', lay: 'teknik', to: { f: 'Uludağ Oto Parça San. A.Ş.', city: 'Bursa', sanayi: true }, pay: 'vade:60',
                l: [['EPDM kapı fitili profil', 'MTR', 12000, 18, 20, { PARTINO: 'PK-26-0912' }], ['Radyatör hortumu Ø 32 mm', 'C62', 4000, 64, 20, { OEM: '1K0121101' }], ['O-ring seti (NBR)', 'SET', 1500, 22, 20]],
                r: [['SIPARIS', 'UOP-PO-26-3381'], ['IRSALIYE', 'PPK2026000004410']],
            },
            {
                k: 'fatura/tevkifat:621', n: 'Rejenere Granül Teslimi (Tevkifat 621)', w: 'Atık plastikten elde edilen rejenere PP granül satışı; 9/10 KDV tevkifatı.', lay: 'endustri', to: { f: 'Marmara Plastik Ambalaj San. A.Ş.', city: 'Kocaeli', sanayi: true }, pay: 'vade:30',
                l: [['Rejenere PP granül (siyah)', 'KGM', 18000, 24, 20, { KALITE: 'MFI 12' }], ['Rejenere HDPE granül (natürel)', 'KGM', 6000, 29, 20]],
            },
            {
                k: 'ihracat', n: 'Kauçuk Conta İhracat Faturası (FCA)', w: 'Romanya\'daki montaj fabrikasına conta ihracatı; GTİP 4016 ve koli bilgisi.', lay: 'serit', to: 'RO', cur: 'EUR', inc: 'FCA', mode: 3, pkg: 'CT',
                l: [['Kauçuk conta (vulkanize)', 'C62', 40000, 0.42, 0, {}, { g: '401693000000', kap: 80 }], ['Kauçuk hortum', 'MTR', 6000, 1.6, 0, {}, { g: '400932000000', kap: 40 }]],
            },
        ],
    },
    {
        code: 'F.12', sector: 'perakende', icon: 'pencil', c: ['#ca8a04', '#fef08a'], f: 'Okul Yolu Kırtasiye', o: 'Ebru Çelik', city: 'Konya', slogan: 'Okul · ofis · sanat malzemeleri',
        why: 'Kırtasiyeci veliler ve öğrencilere e-Arşiv düzenler; kurşun kalem, boya kalemi, okul defteri, silgi, kalemtıraş, cetvel gibi ürünler (II) sayılı listede %10, diğer kırtasiye ve fotokopi kağıdı %20 KDV\'ye tabidir. Okul ve şirketlere toplu satışta e-Fatura kullanılır.',
        docs: [
            {
                k: 'arsiv', n: 'Okul Alışverişi e-Arşiv', w: 'Veliye okul listesi alışverişi; %10 ve %20 KDV oranları aynı belgede ayrışır.', lay: 'fis', pay: 'kart',
                l: [['Okul defteri 80 yaprak (kareli)', 'C62', 6, 45, 10], ['Kurşun kalem (12\'li)', 'PA', 1, 90, 10], ['Kuru boya 24 renk', 'C62', 1, 160, 10], ['Silgi ve kalemtıraş seti', 'SET', 1, 40, 10], ['Okul çantası', 'C62', 1, 1100, 20], ['Fotokopi kağıdı A4 (500 yaprak)', 'PA', 1, 190, 20]],
            },
            {
                k: 'fatura', n: 'Özel Okula Toptan Kırtasiye e-Faturası', w: 'Özel okulun dönem başı kırtasiye ihtiyacı; okul defteri ve ofis malzemeleri.', lay: 'kurumsal', to: { f: 'Selçuklu Özel Eğitim Kurumları A.Ş.', city: 'Konya' }, pay: 'vade:30',
                l: [['Okul defteri 60 yaprak', 'C62', 1500, 38, 10], ['Tahta kalemi (12\'li)', 'PA', 80, 210, 20], ['Fotokopi kağıdı A4 (koli)', 'BX', 60, 900, 20], ['Dosya klasör geniş', 'C62', 300, 55, 20]],
                r: [['SIPARIS', 'SOE-SAT-26-118']],
            },
        ],
    },
    {
        code: 'F.13', sector: 'perakende', icon: 'book-open', c: ['#7c2d12', '#fde68a'], f: 'Sayfa Kitabevi ve Sahaf', o: 'Selin Arslan', city: 'Ankara', slogan: 'Yeni ve ikinci el kitap · sahaf',
        why: 'Basılı kitap ve süreli yayın satışı (ikinci el dahil) KDV 13/n uyarınca tam istisnadır: okura e-Arşiv, okul kütüphanesi gibi kamu idarelerine KAMU senaryolu e-Fatura ISTISNA 335 ile düzenlenir. Sahaf olarak vatandaştan ikinci el kitap alımı e-Gider Pusulası ile belgelenir.',
        docs: [
            {
                k: 'arsiv/istisna:335', n: 'Kitap Satışı e-Arşiv (İstisna 335)', w: 'Okura yeni ve ikinci el kitap satışı; KDV 13/n istisnası nedeniyle KDV gösterilmez.', lay: 'kart', pay: 'kart',
                l: [['Roman — Kuzey Rüzgârı', 'C62', 1, 280, 0, { ISBN: '978-605-9411-28-3' }], ['Tarih — Selçuklu Kervansarayları', 'C62', 1, 420, 0], ['İkinci el — Saatleri Ayarlama Enstitüsü (1961 baskı)', 'C62', 1, 900, 0]],
                nt: ['3065 sayılı KDV Kanununun (13/n) maddesi hükmü gereğince KDV hesaplanmamıştır.'],
            },
            {
                k: 'fatura/kamu/istisna:335', n: 'Okul Kütüphanesine Kitap (KAMU, İstisna 335)', w: 'İlçe Milli Eğitim Müdürlüğüne okul kütüphaneleri için kitap teslimi; KAMU senaryosu + 13/n istisnası.', lay: 'kurumsal', to: { f: 'Çankaya İlçe Milli Eğitim Müdürlüğü', city: 'Ankara' }, pay: 'havale',
                l: [['Çocuk klasikleri seti (10 kitap)', 'SET', 40, 1200, 0], ['Bilim ansiklopedisi (4 cilt)', 'SET', 20, 2400, 0], ['Türkçe sözlük', 'C62', 60, 380, 0]],
                r: [['IHALE', '2026/MEB-DT-441', 'Doğrudan temin']],
                nt: ['3065 sayılı KDV Kanununun (13/n) maddesi hükmü gereğince KDV hesaplanmamıştır.'],
            },
            {
                k: 'gider', n: 'Vatandaştan İkinci El Kitap Alımı Gider Pusulası', w: 'Ev kütüphanesi boşaltan vatandaştan toplu ikinci el kitap alımı.', lay: 'defter', pay: 'nakit',
                l: [['İkinci el roman ve hikâye kitabı', 'C62', 140, 25, 0], ['Eski baskı ansiklopedi seti', 'SET', 1, 1500, 0]],
            },
        ],
    },
    {
        code: 'F.14', sector: 'egitim', icon: 'baby', c: ['#db2777', '#bae6fd'], f: 'Minik Adımlar Kreş ve Gündüz Bakımevi', o: 'Aslı Güneş', city: 'İstanbul', slogan: 'Kreş · anaokulu · gündüz bakım',
        why: 'Kreş velilere aylık ücret için e-Arşiv düzenler (okul öncesi eğitim hizmetinde indirimli KDV oranı); çalışanlarının çocukları için anlaşma yapan şirketlere kurumsal e-Fatura keser. Dönem bilgisi InvoicePeriod ile verilir.',
        docs: [
            {
                k: 'arsiv', n: 'Aylık Kreş Ücreti e-Arşiv', w: 'Veliye Ekim ayı kreş ücreti, yemek ve servis; öğrenci adı satır etiketinde.', lay: 'pastel', pay: 'havale',
                per: ['2026-10-01', null, 'Ekim 2026 eğitim dönemi', '2026-10-31'],
                l: [['Aylık kreş eğitim ücreti (tam gün)', 'MON', 1, 14500, 10, { OGRENCI: 'Defne Y. — 4 yaş grubu' }], ['Yemek ücreti (kahvaltı + öğle)', 'MON', 1, 3200, 10], ['Servis ücreti', 'MON', 1, 2400, 20]],
            },
            {
                k: 'fatura', n: 'Şirkete Kurumsal Kreş Hizmeti e-Faturası', w: 'Çalışanlarının çocukları için anlaşmalı şirkete 6 çocuğun aylık kreş bedeli.', lay: 'kurumsal', to: { f: 'Boğaziçi Yazılım Teknolojileri A.Ş.', city: 'İstanbul' }, pay: 'vade:15',
                per: ['2026-10-01', null, 'Ekim 2026', '2026-10-31'],
                l: [['Kurumsal kreş hizmeti (çocuk başı)', 'MON', 6, 13000, 10], ['Yemek ücreti (çocuk başı)', 'MON', 6, 3000, 10]],
                r: [['SOZLESME', 'BYT-KRS-2026']],
            },
        ],
    },
    {
        code: 'F.15', sector: 'egitim', icon: 'graduation-cap', c: ['#6d28d9', '#ddd6fe'], f: 'Akademi Plus Kurs Merkezi Ltd. Şti.', city: 'Ankara', slogan: 'Sınav hazırlık · dil · sürücü kursu',
        why: 'Özel öğretim kursları öğrenci ve velilere dönemsel ücret için e-Arşiv (InvoicePeriod eğitim dönemi), şirketlere personel eğitimi için e-Fatura düzenler. Taksitli tahsilatta tek fatura düzenlenip ödeme planı not olarak verilebilir.',
        docs: [
            {
                k: 'arsiv', n: 'Sınav Hazırlık Kursu e-Arşiv', w: 'YKS hazırlık programı dönem ücreti; taksit planı notlarda.', lay: 'modern', pay: 'kart',
                per: ['2026-09-15', null, '2026-2027 YKS hazırlık dönemi', '2027-06-15'],
                l: [['YKS sayısal hazırlık programı', 'C62', 1, 54000, 10, { OGRENCI: 'Kaan D. — 12. sınıf' }], ['Deneme sınavı paketi (24 deneme)', 'C62', 1, 4800, 10]],
                nt: ['Ücret 9 eşit taksitle kredi kartından tahsil edilmektedir.'],
            },
            {
                k: 'arsiv', n: 'Sürücü Kursu B Sınıfı e-Arşiv', w: 'B sınıfı sürücü belgesi kursu; teorik + direksiyon dersleri ve sınav harcı ayrımı.', lay: 'kart', pay: 'kart', slug: 'surucu-kursu-b-sinifi-e-arsiv',
                l: [['B sınıfı sürücü kursu (teorik + 16 saat direksiyon)', 'C62', 1, 22000, 10, { EHLIYET: 'B' }], ['Ek direksiyon dersi', 'HUR', 2, 1200, 10]],
                nt: ['Direksiyon sınav harcı ve sağlık raporu bu faturaya dahil değildir.'],
            },
            {
                k: 'fatura', n: 'Kurumsal İngilizce Eğitimi e-Faturası', w: 'Şirket personeline grup halinde iş İngilizcesi eğitimi; ders saati bazlı.', lay: 'kurumsal', to: { f: 'Ostim Makina San. A.Ş.', city: 'Ankara', sanayi: true }, pay: 'vade:30',
                per: ['2026-09-01', null, 'Eylül 2026 eğitim dönemi', '2026-09-30'],
                l: [['İş İngilizcesi grup dersi', 'HUR', 32, 1400, 10, { KURS: 'B1 — 8 katılımcı' }], ['Eğitim materyali', 'C62', 8, 650, 10]],
                r: [['SOZLESME', 'OMS-EGT-2026-04']],
            },
        ],
    },
    {
        code: 'F.16', sector: 'medya', icon: 'printer-check', c: ['#0e7490', '#f472b6'], f: 'Renk Ofset Matbaacılık San. Tic. Ltd. Şti.', city: 'İstanbul', slogan: 'Ofset · dijital baskı · ambalaj', sanayi: true,
        why: 'Matbaa her türlü baskı ve basım hizmetinde belirlenmiş alıcılara 615 kodlu 7/10 KDV tevkifatlı e-Fatura düzenler; bireysel müşterilere (davetiye, kartvizit) e-Arşiv keser. Basılı işlerin müşteri deposuna teslimi e-İrsaliye ile yapılır.',
        docs: [
            {
                k: 'fatura/tevkifat:615', n: 'Katalog Baskı Faturası (Tevkifat 615)', w: 'Mobilya üreticisinin ürün kataloğu ve broşür baskısı; 7/10 KDV tevkifatı, iş emri referanslı.', lay: 'teknik', to: { f: 'Masko Line Mobilya Ltd. Şti.', city: 'İstanbul', sanayi: true }, pay: 'vade:45',
                l: [['Ürün kataloğu 64 sayfa, 4 renk, amerikan cilt', 'C62', 5000, 68, 20, { OLCU: '21 x 28 cm', MALZEME: '150 gr kuşe' }], ['A4 broşür, 3 kırım', 'C62', 20000, 2.8, 20], ['Selefon ve lak uygulaması', 'C62', 5000, 6, 20]],
                r: [['IS_EMRI', 'RO-IE-26-0912'], ['IRSALIYE', 'ROM2026000003310']],
            },
            {
                k: 'arsiv', n: 'Düğün Davetiyesi e-Arşiv', w: 'Çifte özel tasarım düğün davetiyesi ve zarf baskısı; tasarım onay numarası belgede.', lay: 'zarif', pay: 'kart',
                l: [['Düğün davetiyesi (varak yaldız)', 'C62', 300, 18, 20], ['Baskılı zarf', 'C62', 300, 4, 20], ['Kişiye özel tasarım', 'C62', 1, 750, 20]],
                r: [['ONAY', 'TSR-26-0441', 'Tasarım onay formu']],
            },
            {
                k: 'irsaliye', n: 'Basılı Katalog Sevk İrsaliyesi', w: 'Matbaadan müşteri deposuna koli ve paletli katalog sevki.', lay: 'kenar', to: { f: 'Masko Line Mobilya Ltd. Şti.', city: 'İstanbul', sanayi: true }, kg: 2150, kap: 4,
                l: [['Ürün kataloğu 64 sayfa', 'C62', 5000, 0, 20, { KOLI: '100 koli' }], ['A4 broşür, 3 kırım', 'C62', 20000, 0, 20, { KOLI: '40 koli' }]],
                r: [['IS_EMRI', 'RO-IE-26-0912']],
            },
        ],
    },
    {
        code: 'F.17', sector: 'perakende', icon: 'guitar', c: ['#78350f', '#fcd34d'], f: 'Melodi Müzik Aletleri', o: 'Cem Doğan', city: 'İstanbul', slogan: 'Bağlama · gitar · onarım · el yapımı',
        why: 'Müzik aleti satıcısı / yapımcısı online satışta e-Arşiv internet satışı, yurt dışından gelen küçük siparişlerde ETGB\'li mikro ihracat, okul ve konservatuvarlara toplu satışta e-Fatura düzenler. Onarım hizmetleri de e-Arşiv ile belgelenir.',
        docs: [
            {
                k: 'arsiv/net', n: 'Online Enstrüman Satışı e-Arşiv (İnternet)', w: 'Web mağazasından klasik gitar ve aksesuar siparişi; kargo ve ödeme aracısı bilgisi.', lay: 'modern',
                l: [['Klasik gitar 4/4 (masif ladin kapak)', 'C62', 1, 9800, 20, { SERINO: 'MLD-CG-26118' }], ['Gitar kılıfı (yastıklı)', 'C62', 1, 900, 20], ['Akort aleti', 'C62', 1, 350, 20]],
            },
            {
                k: 'mikro', n: 'El Yapımı Bağlama Mikro İhracat (ETGB)', w: 'Almanya\'daki müzisyene el yapımı uzun sap bağlama; ETGB ve GTİP satırda.', lay: 'kart', to: 'DE', cur: 'EUR',
                l: [['El yapımı uzun sap bağlama (dut gövde)', 'C62', 1, 620, 0, {}, { g: '920290000000' }], ['Bağlama teli seti', 'SET', 3, 8, 0, {}, { g: '920930000000' }]],
            },
            {
                k: 'fatura', n: 'Konservatuvara Toplu Enstrüman e-Faturası', w: 'Özel müzik okuluna keman ve ritim aletleri toplu satışı.', lay: 'kurumsal', to: { f: 'Nota Sanat Eğitim Kurumları Ltd. Şti.', city: 'İstanbul' }, pay: 'vade:30',
                l: [['Öğrenci kemanı 4/4 (set)', 'SET', 12, 6400, 20], ['Orff çalgı seti', 'SET', 4, 8800, 20], ['Nota sehpası', 'C62', 20, 450, 20]],
            },
        ],
    },
    {
        code: 'F.18', sector: 'perakende', icon: 'toy-brick', c: ['#e11d48', '#fde047'], f: 'Neşeli Oyuncak San. Tic. Ltd. Şti.', city: 'İstanbul', slogan: 'Eğitici oyuncak · ahşap oyuncak · kutu oyunu', sanayi: true,
        why: 'Oyuncak imalatçısı oyuncakçı ve zincir mağazalara e-Fatura, kendi web sitesinden tüketiciye e-Arşiv internet satışı düzenler. Oyuncaklarda CE işareti ve yaş grubu ürün bilgisi olarak satırda gösterilir.',
        docs: [
            {
                k: 'fatura', n: 'Oyuncakçıya Toptan e-Faturası', w: 'Oyuncak mağaza zincirine ahşap ve eğitici oyuncak toptan satışı; yaş grubu ve CE bilgisi.', lay: 'kenar', to: { f: 'Oyun Dünyası Mağazacılık A.Ş.', city: 'İstanbul' }, pay: 'vade:60',
                l: [['Ahşap yapboz 24 parça', 'C62', 600, 145, 20, { YAS: '3+', CE: 'EN 71' }], ['Kutu oyunu — Kelime Avı', 'C62', 400, 260, 20, { YAS: '8+' }], ['Ahşap tren seti', 'SET', 150, 690, 20, { YAS: '3+', CE: 'EN 71' }]],
                r: [['SIPARIS', 'ODM-PO-26-7718']],
            },
            {
                k: 'arsiv/net', n: 'Online Oyuncak Satışı e-Arşiv (İnternet)', w: 'Web sitesinden veliye eğitici oyuncak siparişi; kargo bilgisiyle.', lay: 'pastel',
                l: [['Ahşap tren seti', 'SET', 1, 990, 20, { YAS: '3+' }], ['Kutu oyunu — Kelime Avı', 'C62', 1, 380, 20, { YAS: '8+' }]],
            },
        ],
    },
    {
        code: 'F.19', sector: 'medya', icon: 'megaphone', c: ['#ea580c', '#1f2937'], f: 'Işık Reklam ve Tabela', o: 'Kaan Şimşek', city: 'Kayseri', slogan: 'Işıklı tabela · reklam · grafik tasarım', sanayi: true,
        why: 'Reklam ajansı / tabelacı reklam kampanyası ve medya planlama hizmetinde belirlenmiş alıcılara 625 (3/10) tevkifatlı e-Fatura; tabela imalatı ve montajı mal teslimi olduğundan normal e-Fatura (tevkifatsız) düzenler. e-Fatura mükellefi olmayan esnafa e-Arşiv kesilir.',
        docs: [
            {
                k: 'fatura/tevkifat:625', n: 'Reklam Kampanyası Faturası (Tevkifat 625)', w: 'Mobilya firmasının sezon kampanyası: billboard kiralama, sosyal medya reklamı ve tasarım; 3/10 tevkifat.', lay: 'modern', to: { f: 'Erciyes Mobilya Sanayi A.Ş.', city: 'Kayseri', sanayi: true }, pay: 'vade:30',
                per: ['2026-09-15', null, 'Sonbahar kampanyası yayın dönemi', '2026-10-15'],
                l: [['Billboard kiralama (14 gün, 6 yüz)', 'C62', 6, 9500, 20], ['Sosyal medya reklam yönetimi', 'MON', 1, 18000, 20], ['Kampanya görsel tasarımı', 'C62', 1, 12000, 20]],
                r: [['SOZLESME', 'EMS-RKL-2026-09']],
            },
            {
                k: 'fatura', n: 'Işıklı Tabela İmalat ve Montaj e-Faturası', w: 'Mağaza cephesine kutu harf LED tabela imalatı ve vinçle montaj; mal teslimi olduğundan tevkifat yok.', lay: 'teknik', to: { f: 'Talas Eczacılık Ltd. Şti.', city: 'Kayseri' }, pay: 'havale',
                l: [['Kutu harf LED tabela', 'MTK', 6.5, 5200, 20, { OLCU: '650 x 100 cm', MALZEME: 'Paslanmaz + pleksi' }], ['Vinçli montaj ve elektrik bağlantısı', 'C62', 1, 4500, 20]],
            },
            {
                k: 'arsiv', n: 'Esnafa Vinil Afiş e-Arşiv', w: 'e-Fatura mükellefi olmayan esnafa vinil afiş ve folyo uygulaması.', lay: 'fis', pay: 'nakit',
                l: [['Vinil afiş baskı', 'MTK', 8, 220, 20], ['Cam folyo uygulaması', 'MTK', 4, 380, 20]],
            },
        ],
    },
    {
        code: 'F.20', sector: 'perakende', icon: 'frame', c: ['#713f12', '#e7e5e4'], f: 'Galata Sanat ve Antika Galerisi', o: 'Pınar Aydın', city: 'İstanbul', slogan: 'Çağdaş sanat · antika · ekspertiz',
        why: 'Sanat galerisi koleksiyonculara e-Arşiv, yabancı alıcılara yolcu beraberi eşya faturası düzenler (kültür varlığı niteliğindeki eserlerin yurt dışına çıkışı yasaktır; çağdaş eserler için uygundur). Vatandaştan belge alınamayan antika / eser alımları e-Gider Pusulası ile belgelenir.',
        docs: [
            {
                k: 'arsiv', n: 'Koleksiyoncuya Eser Satışı e-Arşiv', w: 'Çağdaş sanat eseri ve antika obje satışı; eser künyesi ve sertifika referanslı.', lay: 'zarif', pay: 'havale',
                l: [['Tuval üzerine akrilik — "Haliç" 120 x 160 cm', 'C62', 1, 145000, 20, { OLCU: '120 x 160 cm' }], ['Antika gümüş kaplama semaver (19. yy sonu)', 'C62', 1, 38000, 20, { EKSPERTIZ: 'GSA-EKS-26-041' }]],
                r: [['SERTIFIKA', 'GSA-26-0118', 'Eser orijinallik sertifikası']],
            },
            {
                k: 'yolcu', n: 'Yabancı Alıcıya Tablo Satışı (Yolcu Beraberi)', w: 'Yabancı turiste çağdaş tablo satışı; pasaport ve aracı kurum bilgisi, KDV iadesi gümrük onayıyla.', lay: 'serit', pay: 'kart',
                l: [['Çağdaş tablo — "Galata Işıkları" 70 x 90 cm', 'C62', 1, 64000, 20, { OLCU: '70 x 90 cm' }]],
                nt: ['Eser kültür varlığı niteliğinde değildir (2026 tarihli çağdaş eser).'],
            },
            {
                k: 'gider', n: 'Vatandaştan Antika Alımı Gider Pusulası', w: 'Aile mirası eşyalarını satan vatandaştan antika obje alımı; ekspertiz tutanağı referanslı.', lay: 'defter', pay: 'havale',
                l: [['Antika duvar saati (Fransız, mekanik)', 'C62', 1, 22000, 0], ['Bakır kazan ve sahan takımı', 'SET', 1, 6500, 0]],
                r: [['EKSPERTIZ', 'GSA-EKS-26-052', 'Ekspertiz tutanağı']],
            },
        ],
    },
    {
        code: 'F.21', sector: 'buro', icon: 'languages', c: ['#0f766e', '#ccfbf1'], f: 'Elif Kaya Yeminli Tercümanlık', o: 'Elif Kaya', city: 'İzmir', slogan: 'Yeminli tercüme · noter onayı · sözlü çeviri',
        why: 'Tercüman serbest meslek erbabıdır: bireysel müşteriye stopajsız, şirketlere %20 GV stopajlı e-SMM düzenler. Yurt dışındaki müşteriye verilen ve yurt dışında yararlanılan çeviri hizmeti hizmet ihracatıdır (KDV 11/1-a, istisna 302).',
        docs: [
            {
                k: 'smm', n: 'Diploma Tercümesi e-SMM (Bireysel)', w: 'Vatandaşa diploma ve transkript yeminli tercümesi; sayfa ve dil çifti satırda.', lay: 'defter', to: 'kisi',
                l: [['Yeminli tercüme — diploma (TR > EN)', 'C62', 1, 900, 20, { DIL: 'Türkçe > İngilizce' }], ['Yeminli tercüme — transkript', 'C62', 3, 750, 20, { DIL: 'Türkçe > İngilizce' }]],
                r: [['YEMIN', 'İzmir 4. Noterliği — 2019/1184']],
            },
            {
                k: 'smm', n: 'Sözleşme Tercümesi e-SMM (Stopajlı)', w: 'Dış ticaret şirketine distribütörlük sözleşmesi tercümesi ve toplantı sözlü çevirisi; %20 stopaj.', lay: 'kurumsal', to: { f: 'Ege Leather Dış Ticaret A.Ş.', city: 'İzmir' },
                l: [['Hukuki metin tercümesi (EN > TR)', 'C62', 18, 1100, 20, { DIL: 'İngilizce > Türkçe' }], ['Ardıl sözlü çeviri (toplantı)', 'HUR', 4, 2500, 20]],
                r: [['SOZLESME', 'EGL-TRC-26-07']],
            },
            {
                k: 'smm/istisna:302', n: 'Yurt Dışına Çeviri Hizmeti (Hizmet İhracatı)', w: 'Almanya\'daki şirkete teknik kılavuz çevirisi; yurt dışında yararlanılan hizmet, KDV istisnası, stopaj yok.', lay: 'modern', to: 'DE', cur: 'EUR', stopaj: 0,
                l: [['Teknik kılavuz çevirisi (DE > TR)', 'C62', 42, 22, 0, { DIL: 'Almanca > Türkçe' }], ['Terminoloji sözlüğü oluşturma', 'C62', 1, 180, 0]],
            },
        ],
    },
    {
        code: 'F.22', sector: 'perakende', icon: 'glass-water', c: ['#0891b2', '#e0f2fe'], f: 'Kristal Züccaciye Tic. Ltd. Şti.', city: 'İstanbul', slogan: 'Porselen · cam · otel ve restoran ekipmanı',
        why: 'Züccaciyeci tüketiciye mağazada e-Arşiv, otel ve restoranlara toplu porselen-cam satışında e-Fatura düzenler; toplu teslimatlar kendi aracıyla e-İrsaliye eşliğinde yapılır.',
        docs: [
            {
                k: 'arsiv', n: 'Mağaza Satışı e-Arşiv', w: 'Tüketiciye porselen yemek takımı ve cam bardak seti satışı.', lay: 'fis', pay: 'kart',
                l: [['Porselen yemek takımı 24 parça', 'SET', 1, 4800, 20, { MARKA: 'Kütahya Porselen' }], ['Cam su bardağı (6\'lı)', 'SET', 2, 240, 20], ['Çelik tencere seti 7 parça', 'SET', 1, 3900, 20]],
            },
            {
                k: 'fatura', n: 'Restorana Toplu Porselen e-Faturası', w: 'Yeni açılan restorana otel tipi porselen, cam ve çatal-bıçak toplu satışı.', lay: 'kurumsal', to: { f: 'Boğaz Lezzet Restoran İşletmeciliği Ltd. Şti.', city: 'İstanbul' }, pay: 'vade:30',
                l: [['Otel tipi düz tabak Ø 27 cm', 'C62', 300, 165, 20], ['Kristal şarap kadehi', 'C62', 240, 120, 20], ['Paslanmaz çatal-bıçak seti (kişilik)', 'SET', 120, 280, 20]],
                r: [['IRSALIYE', 'KZT2026000001842']],
            },
            {
                k: 'irsaliye', n: 'Restorana Teslim Sevk İrsaliyesi', w: 'Depodan restorana kırılacak eşya sevki; koli adedi ve şoför bilgisi.', lay: 'teknik', to: { f: 'Boğaz Lezzet Restoran İşletmeciliği Ltd. Şti.', city: 'İstanbul' }, kg: 480, kap: 38,
                l: [['Otel tipi düz tabak Ø 27 cm', 'C62', 300, 0, 20, { KOLI: '25 koli' }], ['Kristal şarap kadehi', 'C62', 240, 0, 20, { KOLI: '10 koli' }], ['Paslanmaz çatal-bıçak seti', 'SET', 120, 0, 20, { KOLI: '3 koli' }]],
                nt: ['Kırılacak eşya — dikkatli taşınmalıdır.'],
            },
        ],
    },
];
