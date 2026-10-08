// C — Elektrik, Elektronik, Bilgisayar
export default [
    {
        code: 'C.01', sector: 'teknik-servis', icon: 'arrow-up-down', c: ['#334155', '#38bdf8'], f: 'Dikey Asansör Mühendislik Ltd. Şti.', city: 'İstanbul', slogan: 'Asansör · yürüyen merdiven · montaj ve periyodik bakım',
        why: 'Asansör firması AVM, otel ve plaza gibi kurumsal müşterilere bakım-onarım (belirlenmiş alıcıda 603 kodlu 7/10 tevkifat) ve apartman yönetimlerine aylık bakım sözleşmesi (yönetim mükellef olmadığından e-Arşiv) faturalar.',
        docs: [
            {
                k: 'fatura/tevkifat:603', n: 'AVM Yürüyen Merdiven Bakım Faturası (Tevkifat 603)', w: 'Alışveriş merkezine yürüyen merdiven ve asansör aylık bakım + parça değişimi; servis formu referanslı.', lay: 'teknik', to: { f: 'Marmara Park Alışveriş Merkezi Yatırım A.Ş.', city: 'İstanbul' }, pay: 'vade:30',
                per: ['2026-09-01', null, 'Eylül 2026 periyodik bakım', '2026-09-30'],
                l: [['Yürüyen merdiven periyodik bakım', 'C62', 8, 6500, 20, { SERINO: 'YM-01…YM-08' }], ['Panoramik asansör periyodik bakım', 'C62', 4, 4800, 20], ['Basamak zinciri değişimi', 'C62', 1, 68000, 20, { PARCA: 'ESC-CH-133' }]],
                r: [['SERVISFORM', 'DA-SF-2026-1184'], ['SOZLESME', 'MP-BKM-2025-07']],
            },
            {
                k: 'arsiv', n: 'Apartman Aylık Bakım e-Arşiv', w: 'Apartman yönetimine aylık asansör bakım sözleşmesi bedeli; yönetim e-Fatura mükellefi olmadığından e-Arşiv.', lay: 'kurumsal', to: { f: 'Lale Apartmanı Yöneticiliği', city: 'İstanbul' }, pay: 'havale',
                per: ['2026-10-01', null, 'Ekim 2026 bakım dönemi', '2026-10-31'],
                l: [['Asansör aylık bakım (8 durak)', 'MON', 1, 3200, 20], ['Kapı kilit kontağı değişimi', 'C62', 2, 650, 20]],
                r: [['SOZLESME', 'DA-APT-2026-221']],
                nt: ['Yıllık periyodik kontrol (yeşil etiket) randevusu 14.11.2026 tarihine planlanmıştır.'],
            },
        ],
    },
    {
        code: 'C.02', sector: 'teknik-servis', icon: 'washing-machine', c: ['#0369a1', '#7dd3fc'], f: 'Hızlı Beyaz Eşya Servisi', o: 'Onur Aksoy', city: 'İzmir', slogan: 'Buzdolabı · çamaşır · bulaşık makinesi onarımı',
        why: 'Beyaz eşya onarımcısı evlere servis hizmetini e-Arşiv ile, restoran / otel gibi işletmelere endüstriyel cihaz onarımını e-Fatura ile düzenler. Kurumsal belirlenmiş alıcılarda 603 tevkifatı uygulanır.',
        docs: [
            {
                k: 'arsiv', n: 'Ev Servisi e-Arşiv', w: 'Müşteri evinde çamaşır makinesi arıza onarımı; cihaz seri no ve servis formu belge üzerinde.', lay: 'fis', pay: 'kart',
                l: [['Servis çıkış ücreti', 'C62', 1, 500, 20], ['Çamaşır makinesi motor kömürü değişimi', 'SET', 1, 850, 20, { SERINO: 'WM8-482910', GARANTI: '6 ay işçilik' }], ['Pompa filtresi temizliği', 'C62', 1, 350, 20]],
                r: [['SERVISFORM', 'HBS-26-3381']],
            },
            {
                k: 'fatura/tevkifat:603', n: 'Restoran Endüstriyel Cihaz Onarım Faturası (Tevkifat 603)', w: 'Otel mutfağındaki endüstriyel bulaşık makinesi ve soğuk odanın onarımı.', lay: 'endustri', to: { f: 'Körfez Otelcilik Turizm A.Ş.', city: 'İzmir' }, pay: 'vade:15',
                l: [['Endüstriyel bulaşık makinesi rezistans değişimi', 'C62', 1, 7800, 20, { SERINO: 'IBM-2290' }], ['Soğuk oda kompresör gaz dolumu', 'C62', 1, 5400, 20], ['Teknik servis işçiliği', 'HUR', 6, 900, 20]],
                r: [['IS_EMRI', 'KO-BKM-0912']],
            },
        ],
    },
    {
        code: 'C.03', sector: 'elektronik', icon: 'refrigerator', c: ['#1e40af', '#93c5fd'], f: 'Çelik Beyaz Eşya Ticaret', o: 'Cem Çelik', city: 'Kocaeli', slogan: 'Yetkili satıcı · beyaz eşya · ankastre',
        why: 'Beyaz eşya bayii tüketiciye cihaz satışını e-Arşiv ile (seri no ve garanti satırda), otel / yurt / şirket gibi toplu alımlarda e-Fatura ile düzenler. Teslimat bayi aracıyla yapılıyorsa e-İrsaliye eşlik eder.',
        docs: [
            {
                k: 'arsiv', n: 'Beyaz Eşya Satışı e-Arşiv (Seri No + Garanti)', w: 'Tüketiciye buzdolabı ve bulaşık makinesi satışı; seri no, garanti süresi ve eski cihaz takas indirimi satırda.', lay: 'modern', pay: 'kart',
                l: [['No-Frost buzdolabı 540 lt', 'C62', 1, 38500, 20, { SERINO: 'RF540-2611843', GARANTI: '3 yıl üretici' }, { disc: { rate: 0.05, reason: 'Eski cihaz takas indirimi' } }], ['Bulaşık makinesi 5 programlı', 'C62', 1, 21900, 20, { SERINO: 'DW5-9902114', GARANTI: '3 yıl üretici' }], ['Montaj ve eski cihaz alımı', 'C62', 1, 0, 20]],
            },
            {
                k: 'fatura', n: 'Otel Toplu Cihaz Satış e-Faturası', w: 'Otel odaları için mini buzdolabı ve TV toplu satışı; teslimat irsaliyesi referanslı.', lay: 'kurumsal', to: { f: 'İzmit Körfez Otel İşletmeleri Ltd. Şti.', city: 'Kocaeli' }, pay: 'vade:30',
                l: [['Minibar buzdolabı 40 lt', 'C62', 60, 7400, 20], ['Ankastre ocak 4 gözlü', 'C62', 2, 12800, 20], ['Davlumbaz 90 cm', 'C62', 2, 9900, 20]],
                r: [['IRSALIYE', 'CBE2026000000731'], ['SIPARIS', 'IKO-SA-0918']],
            },
        ],
    },
    {
        code: 'C.04', sector: 'bilisim', icon: 'laptop', c: ['#4338ca', '#a5b4fc'], f: 'Bit Bilişim Teknik Servis', o: 'Tolga Keskin', city: 'Ankara', slogan: 'Bilgisayar onarım · veri kurtarma · ağ kurulumu',
        why: 'Bilgisayar servisi bireysel veri kurtarma / onarımı e-Arşiv ile; kurum bilgisayar parkının bakım-onarımını e-Fatura ile faturalar. Demirbaş niteliğindeki bilgisayarların bakım-onarımı belirlenmiş alıcılarda 603 (7/10) tevkifata tabidir.',
        docs: [
            {
                k: 'arsiv', n: 'Veri Kurtarma Hizmeti e-Arşiv', w: 'Arızalı harici diskten veri kurtarma; cihaz seri no ve kurtarılan veri miktarı açıklamada.', lay: 'kart', pay: 'kart',
                l: [['Mekanik arızalı HDD veri kurtarma', 'C62', 1, 9500, 20, { SERINO: 'WX12A9-55431', KAPASITE: '2 TB' }, { desc: '1,4 TB veri kurtarıldı; temiz oda işlemi' }], ['Kurtarılan veri için harici SSD 2 TB', 'C62', 1, 4600, 20]],
                r: [['SERVISFORM', 'BIT-VK-26-118']],
            },
            {
                k: 'fatura/tevkifat:603', n: 'Kurum Bilgisayar Bakım-Onarım Faturası (Tevkifat 603)', w: 'Kurumun bilgisayar ve sunucu parkının aylık bakım-onarımı ile parça değişimi.', lay: 'teknik', to: { f: 'Başkent Lojistik Hizmetleri A.Ş.', city: 'Ankara' }, pay: 'vade:30',
                per: ['2026-09-01', null, 'Eylül 2026 BT bakım', '2026-09-30'],
                l: [['Bilgisayar periyodik bakım (cihaz)', 'C62', 45, 350, 20], ['Sunucu disk değişimi (RAID yeniden kurulum)', 'C62', 2, 7200, 20, { SERINO: 'SRV-01' }], ['Yerinde teknik destek', 'HUR', 12, 950, 20]],
                r: [['SOZLESME', 'BIT-KRM-2026-04']],
            },
        ],
    },
    {
        code: 'C.05', sector: 'teknik-servis', icon: 'cog', c: ['#9a3412', '#fdba74'], f: 'Volt Elektrik Motor Sargı San. Ltd. Şti.', city: 'Konya', slogan: 'Elektrik motoru sargı · trafo · jeneratör onarımı', sanayi: true,
        why: 'Elektrik makineleri onarımcısı fabrikaların motor / jeneratör onarımını yapar: makine-teçhizat onarımı 603 (7/10) tevkifatlı e-Fatura. Onarılan motorların fabrikaya dönüşü e-İrsaliye ile sevk edilir.',
        docs: [
            {
                k: 'fatura/tevkifat:603', n: 'Motor Sargı Onarım Faturası (Tevkifat 603)', w: 'Un fabrikasının yanan elektrik motorlarının sargı ve rulman yenilemesi.', lay: 'endustri', to: { f: 'Selçuklu Un Sanayi A.Ş.', city: 'Konya', sanayi: true }, pay: 'vade:30',
                l: [['75 kW motor komple sargı', 'C62', 1, 48000, 20, { GUC: '75 kW · 1500 d/d', SERINO: 'GMT-75-1192' }], ['22 kW motor sargı', 'C62', 2, 16500, 20, { GUC: '22 kW' }], ['Rulman ve balans', 'SET', 3, 3800, 20]],
                r: [['IS_EMRI', 'VLT-26-0441']],
            },
            {
                k: 'irsaliye', n: 'Onarılmış Motor Sevk İrsaliyesi', w: 'Onarımı tamamlanan motorların müşteri fabrikasına sevki.', lay: 'teknik', to: { f: 'Selçuklu Un Sanayi A.Ş.', city: 'Konya', sanayi: true }, kg: 1180, kap: 3,
                l: [['75 kW elektrik motoru (onarılmış)', 'C62', 1, 0, 20, { SERINO: 'GMT-75-1192' }, { sid: 'ONR-75' }], ['22 kW elektrik motoru (onarılmış)', 'C62', 2, 0, 20, {}, { sid: 'ONR-22' }]],
                r: [['IS_EMRI', 'VLT-26-0441']],
                nt: ['Mallar onarım amaçlı alınmış olup müşteriye iade sevkiyatıdır.'],
            },
        ],
    },
    {
        code: 'C.06', sector: 'elektronik', icon: 'plug-zap', c: ['#ca8a04', '#fde047'], f: 'Işık Elektrik Malzemeleri Tic. Ltd. Şti.', city: 'Bursa', slogan: 'Kablo · anahtar-priz · aydınlatma toptan',
        why: 'Elektrik malzemeleri toptancısı elektrik müteahhitlerine ve perakendecilere e-Fatura, şantiye teslimlerinde e-İrsaliye düzenler. Kablo ve aydınlatma ürünlerinde marka / kesit / güç satır etiketleriyle belirtilir.',
        docs: [
            {
                k: 'fatura', n: 'Toptan Elektrik Malzemesi e-Faturası', w: 'Elektrik müteahhidine kablo, sigorta ve LED armatür satışı; ürün kodları ve iskonto satırda.', lay: 'kurumsal', to: { f: 'Ulu Elektrik Taahhüt Ltd. Şti.', city: 'Bursa' }, pay: 'vade:60',
                l: [['NYM kablo 3x2,5 mm²', 'MTR', 1500, 38, 20, { MARKA: 'Hes Kablo' }, { sid: 'NYM-3X25', disc: { rate: 0.08, reason: 'Müteahhit iskontosu' } }], ['Otomatik sigorta C16', 'C62', 120, 145, 20, {}, { sid: 'SG-C16' }], ['LED panel armatür 60x60 40 W', 'C62', 80, 690, 20, { GUC: '40 W' }, { sid: 'LP-6060' }]],
                r: [['SIPARIS', 'UE-2026-412'], ['IRSALIYE', 'IEM2026000001882']],
            },
            {
                k: 'irsaliye', n: 'Şantiyeye Malzeme Sevk İrsaliyesi', w: 'Toptancı deposundan inşaat şantiyesine kablo ve pano malzemesi sevki.', lay: 'serit', to: { f: 'Ulu Elektrik Taahhüt Ltd. Şti.', city: 'Bursa' }, kg: 940, kap: 14,
                l: [['NYM kablo 3x2,5 mm² (makara)', 'MTR', 1500, 0, 20, {}, { sid: 'NYM-3X25' }], ['Otomatik sigorta C16', 'C62', 120, 0, 20, {}, { sid: 'SG-C16' }], ['LED panel armatür 60x60', 'C62', 80, 0, 20, {}, { sid: 'LP-6060' }]],
                r: [['SIPARIS', 'UE-2026-412']],
            },
        ],
    },
    {
        code: 'C.07', sector: 'teknik-servis', icon: 'circuit-board', c: ['#0f766e', '#99f6e4'], f: 'Pano Sistem Elektrik Mühendislik A.Ş.', city: 'Ankara', slogan: 'OG/AG pano imalatı · otomasyon · montaj', sanayi: true,
        why: 'Elektrik sistemleri imalatçısı pano imalatı + montajı yapım işi kapsamında yapıyorsa 601 (4/10) tevkifatlı e-Fatura düzenler; Irak, Azerbaycan gibi ülkelere pano ihracatı IHRACAT profiliyle yapılır.',
        docs: [
            {
                k: 'fatura/tevkifat:601', n: 'Pano İmalat ve Montaj Hakedişi (Tevkifat 601)', w: 'Hastane inşaatı alt yükleniciliğinde AG pano imalatı ve montajı; hakediş no ve dönem bilgisi.', lay: 'teknik', to: { f: 'Anadolu Yapı Taahhüt A.Ş.', city: 'Ankara' }, pay: 'vade:30',
                per: ['2026-09-01', null, '3 no.lu hakediş dönemi', '2026-09-30'],
                l: [['AG ana dağıtım panosu imalatı', 'C62', 2, 385000, 20], ['Kat dağıtım panosu', 'C62', 12, 42000, 20], ['Pano montaj ve test işçiliği', 'C62', 1, 96000, 20]],
                r: [['HAKEDIS', 'HKD-03'], ['SOZLESME', 'AYT-ALT-2026-18'], ['PROJE', 'Etlik Devlet Hastanesi Ek Bina']],
            },
            {
                k: 'ihracat', n: 'Elektrik Panosu İhracat Faturası (CPT)', w: 'Irak’taki müşteriye OG hücre ve kompanzasyon panosu ihracatı; karayolu taşıma ve GTİP 8537.', lay: 'serit', to: 'IQ', cur: 'USD', inc: 'CPT', mode: 3, pkg: 'PX',
                l: [['OG modüler hücre 36 kV', 'C62', 6, 14800, 0, {}, { g: '853720910000', kap: 6 }], ['Kompanzasyon panosu 400 kVAr', 'C62', 2, 9600, 0, {}, { g: '853710980000', kap: 2 }]],
                r: [['CMR', 'CMR-26-118842'], ['BEYANNAME', '26060100EX00921744']],
            },
        ],
    },
    {
        code: 'C.08', sector: 'teknik-servis', icon: 'zap', c: ['#eab308', '#1f2937'], f: 'Güç Elektrik Tesisat', o: 'Serkan Uçar', city: 'Samsun', slogan: 'Ev · işyeri elektrik tesisatı · arıza',
        why: 'Elektrik tesisatçısı evlerde tesisat yenileme / arıza işini e-Arşiv ile, müteahhitlere alt yüklenici olarak yaptığı tesisat işini e-Fatura ile faturalar; yapım işi kapsamındaki tesisat işlerinde 601 (4/10) tevkifatı uygulanır.',
        docs: [
            {
                k: 'arsiv', n: 'Ev Tesisat Yenileme e-Arşiv', w: 'Daire elektrik tesisatının yenilenmesi; malzeme ve işçilik ayrı satırlarda.', lay: 'fis', pay: 'nakit',
                l: [['Elektrik tesisatı yenileme işçiliği (3+1 daire)', 'C62', 1, 18000, 20], ['Kablo, buat ve spiral boru', 'SET', 1, 7400, 20], ['Kaçak akım rölesi 30 mA', 'C62', 1, 950, 20]],
            },
            {
                k: 'fatura/tevkifat:601', n: 'Konut Projesi Tesisat Faturası (Tevkifat 601)', w: 'Müteahhit firmanın konut projesinde blok elektrik tesisatı alt yükleniciliği.', lay: 'endustri', to: { f: 'Atakum Yapı İnşaat Ltd. Şti.', city: 'Samsun' }, pay: 'vade:45',
                l: [['Daire elektrik tesisatı (anahtar teslim)', 'C62', 16, 21000, 20], ['Ortak alan aydınlatma tesisatı', 'C62', 1, 46000, 20]],
                r: [['SOZLESME', 'AY-2026-ELK-02'], ['PROJE', 'Atakum Park Evleri A Blok']],
            },
        ],
    },
    {
        code: 'C.09', sector: 'elektronik', icon: 'microwave', c: ['#be185d', '#f9a8d4'], f: 'Ayaz Küçük Ev Aletleri San. Tic. A.Ş.', city: 'İstanbul', slogan: 'Küçük ev aletleri üretimi ve yetkili servis', sanayi: true,
        why: 'Ev aletleri imalatçısı zincir mağazalara e-Fatura + e-İrsaliye ile satış yapar; garanti dışı onarım hizmetini tüketiciye e-Arşiv ile belgeler.',
        docs: [
            {
                k: 'fatura', n: 'Zincir Mağazaya Toptan Satış e-Faturası', w: 'Elektronik perakende zincirine ürün sevkiyatı; barkod ve ürün kodu satırda.', lay: 'kurumsal', to: { f: 'Tekno Market Mağazacılık A.Ş.', city: 'İstanbul' }, pay: 'vade:60',
                l: [['Tost makinesi 1800 W', 'C62', 400, 1450, 20, { BARKOD: '8690000412218' }, { sid: 'AY-TM18' }], ['Kettle 1,7 lt', 'C62', 600, 690, 20, { BARKOD: '8690000412225' }, { sid: 'AY-KT17' }], ['El blenderi seti', 'C62', 300, 1290, 20, { BARKOD: '8690000412232' }, { sid: 'AY-BL3' }]],
                r: [['SIPARIS', 'TM-PO-2026-88412'], ['IRSALIYE', 'AKE2026000008841']],
            },
            {
                k: 'arsiv', n: 'Garanti Dışı Onarım e-Arşiv', w: 'Yetkili serviste garanti süresi dolmuş süpürgenin onarımı; seri no ve servis kaydı.', lay: 'kart', pay: 'kart',
                l: [['Elektrikli süpürge motor değişimi', 'C62', 1, 1850, 20, { SERINO: 'AY-VC2200-77812' }], ['Servis işçiliği', 'C62', 1, 450, 20]],
                r: [['SERVISFORM', 'AY-SRV-26-4410']],
            },
        ],
    },
    {
        code: 'C.10', sector: 'elektronik', icon: 'cooking-pot', c: ['#7c3aed', '#ddd6fe'], f: 'Pratik Ev Elektroniği', o: 'Gizem Korkmaz', city: 'Eskişehir', slogan: 'Küçük ev aletleri · online ve mağaza satış',
        why: 'Ev aletleri perakendecisi online satışlarda e-Arşiv internet satışı alanlarını kullanır; cayma hakkıyla iade edilen ürünlerde tüketici fatura düzenleyemediğinden satıcı e-Gider Pusulası (IADE) düzenler.',
        docs: [
            {
                k: 'arsiv/net', n: 'Online Satış e-Arşiv (İnternet)', w: 'Web mağazasından kartla satılan kahve makinesi ve süpürge; kargo firması, takip no ve ödeme aracısı.', lay: 'modern',
                l: [['Espresso makinesi 15 bar', 'C62', 1, 8900, 20, { GARANTI: '2 yıl' }], ['Dikey şarjlı süpürge', 'C62', 1, 11400, 20, { GARANTI: '2 yıl' }], ['Kargo bedeli', 'C62', 1, 0, 20]],
            },
            {
                k: 'gider/iade', n: 'Cayma Hakkı İadesi e-Gider Pusulası', w: 'Tüketicinin 14 gün içinde iade ettiği kahve makinesi için iade gider pusulası; iade edilen e-Arşiv faturası referanslı.', lay: 'pastel',
                l: [['Espresso makinesi 15 bar (iade)', 'C62', 1, 8900, 20]],
                nt: ['6502 sayılı Kanun kapsamında cayma hakkı kullanılmıştır.'],
            },
        ],
    },
    {
        code: 'C.11', sector: 'elektronik', icon: 'cpu', c: ['#065f46', '#6ee7b7'], f: 'Devre Elektronik Tasarım San. Ltd. Şti.', city: 'Kocaeli', slogan: 'Elektronik kart üretimi · SMT dizgi · onarım', sanayi: true,
        why: 'Elektronik imalatçısı sanayi müşterilerine kart / modül satışını e-Fatura ile yapar; yurt dışındaki küçük alıcılara kargo ile gönderilen ürünler ETGB’li mikro ihracat (e-Arşiv ISTISNA 301) olarak belgelenir.',
        docs: [
            {
                k: 'fatura', n: 'Elektronik Kart Satış e-Faturası', w: 'Beyaz eşya üreticisine kontrol kartı satışı; lot ve revizyon numarası satır etiketlerinde.', lay: 'teknik', to: { f: 'Marmara Ev Cihazları Sanayi A.Ş.', city: 'Kocaeli', sanayi: true }, pay: 'vade:60',
                l: [['Bulaşık makinesi kontrol kartı Rev.C', 'C62', 2000, 410, 20, { LOT: 'L2609-118', SURUM: 'Rev.C' }, { sid: 'DE-DWC-03' }], ['Ekran kartı (dokunmatik)', 'C62', 2000, 265, 20, { LOT: 'L2609-121' }, { sid: 'DE-TCH-07' }]],
                r: [['SIPARIS', 'MEC-PO-26-5531']],
            },
            {
                k: 'mikro', n: 'Geliştirme Kiti Mikro İhracat (ETGB)', w: 'ABD’deki alıcıya web sitesinden satılan geliştirme kitleri; ETGB, GTİP ve kargo takip bilgisi.', lay: 'kenar', to: 'US', cur: 'USD',
                l: [['IoT geliştirme kiti', 'C62', 12, 64, 0, {}, { g: '847330800000' }], ['Sensör modülü seti', 'C62', 20, 18, 0, {}, { g: '903180800000' }]],
            },
        ],
    },
    {
        code: 'C.12', sector: 'elektronik', icon: 'tv', c: ['#1d4ed8', '#c7d2fe'], f: 'Ekran Elektronik Mağazası', o: 'Barış Akın', city: 'Adana', slogan: 'TV · bilgisayar · telefon · aksesuar',
        why: 'Elektronik perakendecisi seri no / garanti bilgili e-Arşiv düzenler; teknoloji destek kapsamındaki öğrenci satışlarında InvoiceTypeCode TEKNOLOJIDESTEK kullanılır (alıcı TCKN ve cihaz IMEI / seri no zorunlu).',
        docs: [
            {
                k: 'arsiv', n: 'Televizyon Satışı e-Arşiv', w: 'Tüketiciye televizyon ve duvar askı aparatı satışı; seri no ve garanti satırda, taksitli kart ödemesi.', lay: 'serit', pay: 'kart',
                l: [['65" 4K QLED televizyon', 'C62', 1, 42900, 20, { SERINO: 'QL65-26A88124', GARANTI: '2 yıl' }], ['Hareketli duvar askı aparatı', 'C62', 1, 1450, 20], ['Duvara montaj', 'C62', 1, 600, 20]],
                nt: ['Kredi kartına 6 taksit uygulanmıştır.'],
            },
            {
                k: 'arsiv/tekno', n: 'Öğrenci Teknoloji Destek e-Arşiv', w: 'Teknoloji destek kapsamında öğrenciye dizüstü bilgisayar satışı; TCKN ve seri no zorunlu alanlar.', lay: 'pastel', pay: 'kart',
                l: [['Dizüstü bilgisayar 15,6" i5 / 16 GB', 'C62', 1, 27500, 20, { SERINO: 'NB15-5X0912', OGRENCI: 'Ç. Üni. 2026-1184' }]],
            },
        ],
    },
    {
        code: 'C.13', sector: 'eticaret', icon: 'shopping-cart', c: ['#9333ea', '#f472b6'], f: 'Sepetim Online Ticaret Ltd. Şti.', city: 'İstanbul', slogan: 'Online mağaza · pazaryeri · yurt dışı satış',
        why: 'E-ticaret işletmesinin üç temel belgesi: yurt içi tüketici satışları e-Arşiv internet satışı (web adresi, ödeme aracısı, taşıyıcı), yurt dışı kargo satışları ETGB’li mikro ihracat ve cayma hakkı iadelerinde e-Gider Pusulası (IADE).',
        docs: [
            {
                k: 'arsiv/net', n: 'İnternet Satışı e-Arşiv', w: 'Web sitesinden kartla verilen siparişin faturası; GİB internet satışı zorunlu alanları dolu.', lay: 'modern',
                l: [['Kablosuz kulaklık', 'C62', 1, 2490, 20, { RENK: 'Siyah' }], ['Akıllı saat kayışı', 'C62', 2, 290, 20], ['Hediye paketi', 'C62', 1, 50, 20]],
                r: [['SIPARISNO', 'SPT-2026-1048812']],
            },
            {
                k: 'mikro', n: 'Yurt Dışı Sipariş Mikro İhracat (ETGB)', w: 'Almanya’dan gelen pazaryeri siparişinin ETGB ile kargo gönderimi.', lay: 'kurumsal', to: 'DE', cur: 'EUR',
                l: [['El yapımı seramik kupa seti', 'SET', 3, 34, 0, {}, { g: '691200300000' }], ['Pamuklu peştamal', 'C62', 4, 18, 0, {}, { g: '630260000000' }]],
                r: [['SIPARISNO', 'MP-DE-88421']],
            },
            {
                k: 'gider/iade', n: 'Müşteri İadesi e-Gider Pusulası', w: 'Tüketicinin kargo ile iade ettiği ürün için düzenlenen iade gider pusulası.', lay: 'kart',
                l: [['Kablosuz kulaklık (iade)', 'C62', 1, 2490, 20]],
            },
        ],
    },
    {
        code: 'C.14', sector: 'teknik-servis', icon: 'cctv', c: ['#111827', '#ef4444'], f: 'Kalkan Güvenlik Sistemleri Ltd. Şti.', city: 'Gaziantep', slogan: 'Kamera · alarm · geçiş kontrol · 7/24 izleme',
        why: 'Güvenlik sistemleri firması işyerlerine kamera / alarm kurulumunu e-Fatura ile; evlere aylık alarm izleme hizmetini dönemli e-Arşiv ile faturalar. Elektronik sistem kurulumu “özel güvenlik hizmeti” (607) değildir; tevkifat uygulanmaz.',
        docs: [
            {
                k: 'fatura', n: 'Kamera Sistemi Kurulum e-Faturası', w: 'Fabrikaya IP kamera ve NVR kurulumu; cihaz seri no ve garanti satırda.', lay: 'endustri', to: { f: 'Şahinbey Ambalaj Sanayi A.Ş.', city: 'Gaziantep', sanayi: true }, pay: 'vade:30',
                l: [['IP bullet kamera 4 MP', 'C62', 24, 3450, 20, { GARANTI: '2 yıl' }], ['NVR kayıt cihazı 32 kanal + 8 TB', 'C62', 1, 28500, 20, { SERINO: 'NVR32-55102' }], ['Kablolama ve kurulum işçiliği', 'C62', 1, 36000, 20]],
            },
            {
                k: 'arsiv', n: 'Alarm İzleme Aboneliği e-Arşiv', w: 'Konut alarm sisteminin aylık 7/24 izleme abonelik bedeli; abone no ve dönem.', lay: 'kart', pay: 'kart',
                per: ['2026-10-01', null, 'Ekim 2026 izleme', '2026-10-31'],
                l: [['7/24 alarm izleme hizmeti', 'MON', 1, 450, 20], ['GSM haberleşme modülü hattı', 'MON', 1, 90, 20]],
                r: [['ABONE', 'KLK-AB-11842']],
            },
        ],
    },
    {
        code: 'C.15', sector: 'elektronik', icon: 'disc-3', c: ['#be123c', '#111827'], f: 'Plakçı Müzik Medya', o: 'Cem Tekin', city: 'İstanbul', slogan: 'Plak · CD · film arşivi · baskı',
        why: 'Kayıtlı medya işletmesi tüketiciye plak / CD satışını e-Arşiv ile; müzik şirketlerine CD çoğaltma ve ambalaj işini e-Fatura ile faturalar.',
        docs: [
            {
                k: 'arsiv', n: 'Plak ve CD Satışı e-Arşiv', w: 'Mağazadan tüketiciye plak ve CD satışı; katalog no satır etiketinde.', lay: 'zarif', pay: 'kart',
                l: [['Plak — Türk pop klasikleri 1975 (2LP)', 'C62', 1, 1850, 20, { KATALOG: 'PLK-75-002' }], ['CD — Anadolu rock derlemesi', 'C62', 2, 420, 20, { KATALOG: 'CD-AR-118' }], ['Plak temizleme seti', 'SET', 1, 380, 20]],
            },
            {
                k: 'fatura', n: 'CD Çoğaltma Hizmeti e-Faturası', w: 'Müzik yapım şirketine albüm CD çoğaltma, baskı ve ambalaj hizmeti.', lay: 'kenar', to: { f: 'Ritim Müzik Yapım ve Prodüksiyon Ltd. Şti.', city: 'İstanbul' }, pay: 'vade:30',
                l: [['CD çoğaltma (glass master dahil)', 'C62', 3000, 18, 20], ['Digipack ambalaj', 'C62', 3000, 14, 20], ['Bandrol uygulaması', 'C62', 3000, 2, 20]],
                r: [['SIPARIS', 'RMY-2026-044'], ['BANDROL', 'KTB-B-26-118844']],
            },
        ],
    },
    {
        code: 'C.16', sector: 'teknik-servis', icon: 'smartphone', c: ['#0284c7', '#bae6fd'], f: 'Mobil Tamir Telefon Servisi', o: 'Emre Bulut', city: 'Kayseri', slogan: 'Ekran · batarya · anakart onarımı',
        why: 'Telefon onarımcısı bireysel onarımları IMEI bilgili e-Arşiv ile; kurumların demirbaş telefon / tablet onarımını e-Fatura ile düzenler (alıcı belirlenmiş alıcıysa 603 tevkifat). Temel senaryo, alıcının ret yanıtı göndermesini istemeyen kurumsal müşterilerde tercih edilir.',
        docs: [
            {
                k: 'arsiv', n: 'Ekran Değişimi e-Arşiv (IMEI)', w: 'Akıllı telefon ekran ve batarya değişimi; IMEI ve servis garanti süresi satır etiketinde.', lay: 'fis', pay: 'kart',
                l: [['Ekran değişimi (OLED)', 'C62', 1, 5400, 20, { IMEI: '356998112045871', GARANTI: '6 ay' }], ['Batarya değişimi', 'C62', 1, 1600, 20], ['Ekran koruyucu', 'C62', 1, 250, 20]],
                r: [['SERVISFORM', 'MT-26-2281']],
            },
            {
                k: 'fatura/temel', n: 'Kurumsal Tablet Onarım e-Faturası (Temel)', w: 'Kurye şirketinin el terminali / tabletlerinin toplu onarımı.', lay: 'kurumsal', to: { f: 'Erciyes Kurye Dağıtım Hizmetleri Ltd. Şti.', city: 'Kayseri' }, pay: 'vade:15',
                l: [['El terminali ekran değişimi', 'C62', 9, 2900, 20], ['Şarj soketi onarımı', 'C62', 6, 950, 20], ['Teşhis ve test', 'C62', 15, 150, 20]],
                r: [['IS_EMRI', 'EKD-2026-31']],
            },
        ],
    },
    {
        code: 'C.17', sector: 'elektronik', icon: 'tablet-smartphone', c: ['#dc2626', '#fecaca'], f: 'Sinyal İletişim Bayii', o: 'Kemal Öztürk', city: 'Malatya', slogan: 'Operatör bayii · telefon · aksesuar',
        why: 'Telekom cihazı satıcısı tüketiciye IMEI kayıtlı telefon satışı (öğrenci satışlarında TEKNOLOJIDESTEK) düzenler; GSM operatöründen aldığı hat aktivasyon prim / komisyonlarını operatöre e-Fatura ile faturalar.',
        docs: [
            {
                k: 'arsiv/tekno', n: 'Öğrenciye Telefon Satışı e-Arşiv (Teknoloji Destek)', w: 'Teknoloji destek kapsamında öğrenciye akıllı telefon satışı; IMEI ve TCKN zorunlu.', lay: 'modern', pay: 'kart',
                l: [['Akıllı telefon 128 GB', 'C62', 1, 15900, 20, { IMEI: '353901104772615', GARANTI: '2 yıl' }]],
            },
            {
                k: 'fatura', n: 'Operatöre Aktivasyon Prim e-Faturası', w: 'GSM operatörüne aylık yeni hat ve numara taşıma aktivasyon primleri.', lay: 'teknik', to: { f: 'Türk Mobil İletişim Hizmetleri A.Ş.', city: 'İstanbul' }, pay: 'havale',
                per: ['2026-09-01', null, 'Eylül 2026 aktivasyon dönemi', '2026-09-30'],
                l: [['Faturalı yeni hat aktivasyon primi', 'C62', 84, 350, 20], ['Numara taşıma primi', 'C62', 37, 500, 20], ['Cihaz kampanya satış primi', 'C62', 1, 6200, 20]],
                r: [['BAYI', 'TMI-44-0218']],
            },
        ],
    },
];
