// E — Giyim, Deri Ürün, Ev Tekstili, Dokuma
export default [
    {
        code: 'E.01', sector: 'ayakkabi', icon: 'footprints', c: ['#92400e', '#fcd34d'], f: 'Adım Ayakkabı Atölyesi', o: 'Murat Özkan', city: 'İstanbul', slogan: 'El yapımı ayakkabı · imalat · satış', sanayi: true,
        why: 'Ayakkabıcı mağazada tüketiciye e-Arşiv (numara / renk satırda) düzenler; markalara yaptığı fason saya dikim işlerinde 609 kodlu (çanta ve ayakkabı dikim işleri) 7/10 KDV tevkifatlı e-Fatura keser.',
        docs: [
            {
                k: 'arsiv', n: 'Ayakkabı Satışı e-Arşiv', w: 'Mağazadan tüketiciye ayakkabı satışı; numara ve renk satır etiketlerinde.', lay: 'fis', pay: 'kart',
                l: [['Klasik deri erkek ayakkabı', 'PR', 1, 3200, 20, { NUMARA: '42', RENK: 'Kahve' }], ['Deri kadın babet', 'PR', 1, 2400, 20, { NUMARA: '38', RENK: 'Siyah' }], ['Ayakkabı bakım kremi', 'C62', 1, 180, 20]],
            },
            {
                k: 'fatura/tevkifat:609', n: 'Fason Saya Dikim Faturası (Tevkifat 609)', w: 'Ayakkabı markasının kesilmiş saya parçalarının fason dikimi; 7/10 KDV tevkifatı.', lay: 'teknik', to: { f: 'Moda Adım Ayakkabı Sanayi A.Ş.', city: 'İstanbul', sanayi: true }, pay: 'vade:30',
                l: [['Saya dikim — erkek klasik model', 'PR', 1200, 85, 20, { KATALOG: 'MA-2611' }], ['Saya dikim — kadın bot', 'PR', 600, 110, 20, { KATALOG: 'MA-2648' }]],
                r: [['IS_EMRI', 'MA-FSN-26-0912'], ['IRSALIYE', 'MAS2026000004412']],
            },
        ],
    },
    {
        code: 'E.02', sector: 'temizlik', icon: 'shirt', c: ['#0284c7', '#e0f2fe'], f: 'Beyaz Kuru Temizleme', o: 'Derya Kara', city: 'Ankara', slogan: 'Kuru temizleme · ütü · çamaşırhane',
        why: 'Kuru temizlemeci bireysel müşterilere e-Arşiv düzenler; otel ve restoranlara toplu çamaşır yıkama hizmetini dönemsel e-Fatura ile faturalar (çamaşır yıkama 612 temizlik hizmeti kapsamında değildir).',
        docs: [
            {
                k: 'arsiv', n: 'Kuru Temizleme e-Arşiv', w: 'Takım elbise, mont ve perde kuru temizleme; teslim fiş numarası belge alanında.', lay: 'fis', pay: 'nakit',
                l: [['Takım elbise kuru temizleme', 'C62', 2, 320, 20], ['Mont (kaz tüyü)', 'C62', 1, 450, 20], ['Perde yıkama-ütü', 'MTK', 12, 70, 20]],
                r: [['FIS', 'BKT-26-11842']],
            },
            {
                k: 'fatura', n: 'Otel Çamaşır Hizmeti e-Faturası', w: 'Butik otelin çarşaf ve havlularının aylık yıkama-ütü hizmeti.', lay: 'kurumsal', to: { f: 'Kızılay Butik Otel Turizm Ltd. Şti.', city: 'Ankara' }, pay: 'vade:30',
                per: ['2026-09-01', null, 'Eylül 2026 çamaşır hizmeti', '2026-09-30'],
                l: [['Çarşaf / nevresim yıkama-ütü (kg)', 'KGM', 1420, 38, 20], ['Havlu yıkama (kg)', 'KGM', 860, 32, 20], ['Masa örtüsü kolalı ütü', 'C62', 240, 25, 20]],
            },
        ],
    },
    {
        code: 'E.03', sector: 'ayakkabi', icon: 'briefcase', c: ['#7c2d12', '#fdba74'], f: 'Kapalıçarşı Deri Aksesuar', o: 'Gül Arslan', city: 'İstanbul', slogan: 'Deri çanta · cüzdan · kemer',
        why: 'Deri aksesuar satıcısı online satışlarda e-Arşiv internet satışı, turist satışlarında yolcu beraberi eşya faturası (YOLCUBERABERFATURA; KDV hesaplanır, aracı kurumla iade) düzenler.',
        docs: [
            {
                k: 'arsiv/net', n: 'Online Deri Çanta Satışı e-Arşiv', w: 'Web mağazasından deri çanta ve cüzdan siparişi; kargo ve ödeme aracısı.', lay: 'modern',
                l: [['Hakiki deri omuz çantası', 'C62', 1, 4800, 20, { RENK: 'Taba' }], ['Deri kartlık', 'C62', 1, 650, 20, { RENK: 'Siyah' }]],
            },
            {
                k: 'yolcu', n: 'Turiste Tax Free Satış (Yolcu Beraberi)', w: 'Yabancı turiste deri çanta ve kemer satışı; pasaport, uyruk ve aracı kurum bilgisi.', lay: 'zarif', pay: 'kart',
                l: [['El yapımı deri sırt çantası', 'C62', 1, 7200, 20, { RENK: 'Konyak' }], ['Deri kemer', 'C62', 2, 950, 20]],
            },
        ],
    },
    {
        code: 'E.04', sector: 'ayakkabi', icon: 'scissors', c: ['#57534e', '#d6d3d1'], f: 'Ustaoğlu Deri Konfeksiyon', o: 'İbrahim Ustaoğlu', city: 'İzmir', slogan: 'Deri ceket imalatı · tadilat · onarım', sanayi: true,
        why: 'Deri giyim imalatçısı ihracatçı firmaya ihraç kaydıyla teslimde IHRACKAYITLI (istisna 701, KDV tecil) e-Fatura; tüketiciye tadilat / onarım hizmetinde e-Arşiv düzenler.',
        docs: [
            {
                k: 'fatura/ihrackayitli', n: 'İhraç Kayıtlı Deri Ceket Teslimi', w: 'İhracatçı firmaya ihraç edilmek üzere deri ceket teslimi; KDV hesaplanır ancak tahsil edilmez (tecil).', lay: 'endustri', to: { f: 'Ege Leather Dış Ticaret A.Ş.', city: 'İzmir' }, pay: 'vade:60',
                l: [['Kuzu nappa deri ceket (erkek)', 'C62', 400, 3900, 20, { BEDEN: 'S-XXL asorti' }], ['Deri yelek (kadın)', 'C62', 250, 2400, 20]],
                r: [['SIPARIS', 'EGL-PO-26-118'], ['DIIB', 'Ihr. kayıt 2026/IK-4418']],
            },
            {
                k: 'arsiv', n: 'Deri Mont Onarım e-Arşiv', w: 'Müşterinin deri montunda fermuar değişimi ve boy kısaltma.', lay: 'kart', pay: 'nakit',
                l: [['Fermuar değişimi (deri mont)', 'C62', 1, 750, 20], ['Boy kısaltma', 'C62', 1, 900, 20], ['Deri boya-bakım', 'C62', 1, 600, 20]],
            },
        ],
    },
    {
        code: 'E.05', sector: 'ayakkabi', icon: 'shopping-bag', c: ['#78350f', '#fef3c7'], f: 'Anatolia Leather Mağazacılık Ltd. Şti.', city: 'Antalya', slogan: 'Deri ceket · kürk · turist mağazası',
        why: 'Turistik bölgedeki deri mağazası yabancı turistlere yolcu beraberi eşya faturası (Tax Free), yerli müşterilere e-Arşiv düzenler.',
        docs: [
            {
                k: 'yolcu', n: 'Deri Ceket Tax Free Faturası', w: 'Yabancı turiste deri ceket satışı; pasaport ve aracı kurum bilgisi, KDV iadesi için gümrük onayı.', lay: 'serit', pay: 'kart',
                l: [['Kuzu deri ceket (kadın)', 'C62', 1, 14500, 20, { BEDEN: 'M', RENK: 'Bordo' }], ['Deri eldiven', 'PR', 1, 1200, 20]],
            },
            {
                k: 'arsiv', n: 'Mağaza Satışı e-Arşiv', w: 'Yerli müşteriye deri mont satışı; kampanya indirimi satırda.', lay: 'zarif', pay: 'kart',
                l: [['Deri mont (erkek)', 'C62', 1, 9800, 20, { BEDEN: 'L' }, { disc: { rate: 0.15, reason: 'Sezon sonu indirimi' } }]],
            },
        ],
    },
    {
        code: 'E.06', sector: 'ayakkabi', icon: 'layers-3', c: ['#713f12', '#fde68a'], f: 'Menderes Deri Tabakhanesi Ltd. Şti.', city: 'Denizli', slogan: 'Ham deri işleme · tabaklama', sanayi: true,
        why: 'Tabakhane belirlenmiş alıcılara ham post ve deri tesliminde 622 kodlu 9/10 KDV tevkifatlı e-Fatura düzenler; kurban bayramında vatandaştan / derneklerden belge alamadan aldığı ham deriler için e-Gider Pusulası kullanır.',
        docs: [
            {
                k: 'fatura/tevkifat:622', n: 'Ham Deri Teslim Faturası (Tevkifat 622)', w: 'Deri konfeksiyon fabrikasına tuzlu ham koyun derisi satışı; 9/10 tevkifat.', lay: 'endustri', to: { f: 'Ege Deri Konfeksiyon Sanayi A.Ş.', city: 'İzmir', sanayi: true }, pay: 'vade:45',
                l: [['Tuzlu ham koyun derisi (A kalite)', 'C62', 1800, 260, 20, { KALITE: 'A' }], ['Tuzlu ham keçi derisi', 'C62', 600, 210, 20]],
            },
            {
                k: 'gider/stopaj:2', n: 'Vatandaştan Kurban Derisi Alımı Gider Pusulası', w: 'Kurban bayramında vatandaştan ham deri alımı; GVK 94/13-a gereği %2 stopaj.', lay: 'defter', pay: 'nakit',
                l: [['Ham koyun derisi (kurbanlık)', 'C62', 40, 180, 0], ['Ham sığır derisi', 'C62', 3, 950, 0]],
            },
        ],
    },
    {
        code: 'E.07', sector: 'tekstil', icon: 'spool', c: ['#1e3a8a', '#93c5fd'], f: 'Anadolu Dokuma Tekstil San. A.Ş.', city: 'Kahramanmaraş', slogan: 'Pamuklu dokuma · denim · ihracat', sanayi: true,
        why: 'Dokuma fabrikası konfeksiyon ihracatçılarına ihraç kaydıyla kumaş teslimini IHRACKAYITLI (701, KDV tecil) e-Fatura ile, yurt dışı alıcılara doğrudan ihracatı IHRACAT profiliyle yapar; yurt içi sevkiyatlar e-İrsaliye ile.',
        docs: [
            {
                k: 'fatura/ihrackayitli', n: 'İhraç Kayıtlı Kumaş Teslim Faturası', w: 'Konfeksiyon ihracatçısına denim kumaş teslimi; 701 istisna, KDV tecil.', lay: 'kurumsal', to: { f: 'Maraş Jeans Dış Ticaret A.Ş.', city: 'Kahramanmaraş' }, pay: 'vade:60',
                l: [['Denim kumaş 12 oz (indigo)', 'MTR', 18000, 142, 20, { EN: '150 cm', DESEN: '3/1 dimi' }], ['Gabardin kumaş', 'MTR', 6000, 118, 20, { EN: '155 cm' }]],
            },
            {
                k: 'ihracat', n: 'Kumaş İhracat Faturası (EXW)', w: 'İtalya’daki konfeksiyoncuya top kumaş ihracatı; GTİP 5209, top sayısı kap olarak.', lay: 'serit', to: 'IT', cur: 'EUR', inc: 'EXW', mode: 3, pkg: 'RO',
                l: [['Denim kumaş 12 oz', 'MTR', 22000, 3.1, 0, { EN: '150 cm' }, { g: '520942000000', kap: 220 }], ['Streç denim 10 oz', 'MTR', 8000, 3.4, 0, {}, { g: '521142000000', kap: 80 }]],
            },
            {
                k: 'irsaliye', n: 'Kumaş Sevk İrsaliyesi', w: 'Fabrikadan konfeksiyon atölyesine top kumaş sevki; top ve metre bilgisi.', lay: 'teknik', to: { f: 'Maraş Jeans Dış Ticaret A.Ş.', city: 'Kahramanmaraş' }, kg: 9400, kap: 180, dorse: true,
                l: [['Denim kumaş 12 oz (indigo)', 'MTR', 18000, 0, 20, { KOLI: '180 top' }, { sid: 'AD-DNM-12' }]],
            },
        ],
    },
    {
        code: 'E.08', sector: 'tekstil', icon: 'bed', c: ['#0f766e', '#ccfbf1'], f: 'Pamuk Evi Ev Tekstili Ltd. Şti.', city: 'Denizli', slogan: 'Nevresim · havlu · bornoz', sanayi: true,
        why: 'Ev tekstili üreticisi online tüketici satışlarında e-Arşiv internet satışı; otel zincirlerine toplu havlu / nevresim satışında e-Fatura düzenler.',
        docs: [
            {
                k: 'arsiv/net', n: 'Online Nevresim Satışı e-Arşiv', w: 'Web mağazasından nevresim ve havlu seti siparişi.', lay: 'pastel',
                l: [['Pamuk saten nevresim takımı (çift)', 'SET', 1, 2900, 20, { RENK: 'Gri' }], ['Havlu seti 4\'lü', 'SET', 1, 1100, 20]],
            },
            {
                k: 'fatura', n: 'Otel Zincirine Tekstil e-Faturası', w: 'Otel zincirine logolu havlu, bornoz ve çarşaf satışı.', lay: 'kurumsal', to: { f: 'Ege Resort Otelcilik A.Ş.', city: 'Muğla' }, pay: 'vade:60',
                l: [['Logolu banyo havlusu 70x140', 'C62', 1500, 290, 20], ['Bornoz (otel tipi)', 'C62', 600, 640, 20], ['Çarşaf 160x240 (ranforce)', 'C62', 1200, 260, 20]],
                r: [['SIPARIS', 'ERO-SA-26-334']],
            },
        ],
    },
    {
        code: 'E.09', sector: 'temizlik', icon: 'droplets', c: ['#0369a1', '#a5f3fc'], f: 'Pırıl Halı Yıkama', o: 'Selin Bulut', city: 'Konya', slogan: 'Halı · koltuk · yorgan yıkama — servisli',
        why: 'Halı yıkamacı evlere metrekare bazlı e-Arşiv düzenler; belediye / müftülük gibi kamu idarelerine (ör. cami halıları) KAMU senaryolu e-Fatura keser (ödeme hesabı IBAN zorunlu).',
        docs: [
            {
                k: 'arsiv', n: 'Halı Yıkama e-Arşiv', w: 'Evden alınan halıların metrekare bazlı yıkanması ve teslimi.', lay: 'fis', pay: 'nakit',
                l: [['Makine halısı yıkama', 'MTK', 18, 70, 20], ['El dokuma halı yıkama', 'MTK', 6, 140, 20], ['Servis (alma-teslim)', 'C62', 1, 0, 20]],
            },
            {
                k: 'fatura/kamu', n: 'Belediyeye Cami Halısı Yıkama (KAMU)', w: 'Belediye ihalesi kapsamında cami halılarının yerinde yıkanması; KAMU senaryosu, IBAN zorunlu.', lay: 'kurumsal', to: { f: 'Selçuklu Belediye Başkanlığı', city: 'Konya' }, pay: 'havale',
                l: [['Cami halısı yerinde yıkama', 'MTK', 4200, 45, 20], ['Leke çıkarma ve dezenfeksiyon', 'MTK', 4200, 8, 20]],
                r: [['IHALE', '2026/884125', 'Doğrudan temin'], ['SOZLESME', 'SB-2026-HY-04']],
            },
        ],
    },
    {
        code: 'E.10', sector: 'tekstil', icon: 'grid-3x3', c: ['#9f1239', '#fde68a'], f: 'Kapadokya Halı Kilim Evi Ltd. Şti.', city: 'Nevşehir', slogan: 'El dokuma halı · kilim · koleksiyon',
        why: 'Halıcı turistlere yolcu beraberi eşya faturası (Tax Free) düzenler; evinde halı dokuyan ev hanımlarından alımda (esnaf muaflığı) %2 stopajlı e-Gider Pusulası kullanır.',
        docs: [
            {
                k: 'yolcu', n: 'El Dokuma Halı Tax Free Faturası', w: 'Yabancı turiste ipek halı satışı; düğüm sayısı ve ebat satırda, pasaport ve aracı kurum bilgisi.', lay: 'zarif', pay: 'kart',
                l: [['İpek Hereke halı 100x150', 'C62', 1, 145000, 20, { DUGUM: '100x100 / cm²', OLCU: '100 x 150 cm' }], ['Yün kilim 80x120', 'C62', 1, 14000, 20, { OLCU: '80 x 120 cm' }]],
                r: [['SERTIFIKA', 'KHK-ORJ-26-0412', 'El dokuma orijinallik sertifikası']],
            },
            {
                k: 'gider/stopaj:2', n: 'Ev Hanımından Halı Alımı Gider Pusulası', w: 'Evinde halı dokuyan ve esnaf muaflığından yararlanan kişiden el dokuma halı alımı; %2 stopaj.', lay: 'defter', pay: 'havale',
                l: [['Yün halı (Avanos motifi) 120x180', 'C62', 2, 21000, 0, { OLCU: '120 x 180 cm' }]],
                nt: ['Satıcı GVK 9/6 kapsamında evde üretilen ürünler için esnaf muaflığı belgesine sahiptir.'],
            },
        ],
    },
    {
        code: 'E.11', sector: 'tekstil', icon: 'recycle', c: ['#4d7c0f', '#ecfccb'], f: 'Döngü İkinci El Giyim', o: 'Esra Tekin', city: 'İzmir', slogan: 'Vintage · ikinci el · tekstil geri dönüşüm',
        why: 'İkinci el tekstil satıcısı tüketiciye e-Arşiv düzenler; vatandaşlardan kilo bazında ikinci el giysi alımını e-Gider Pusulası ile belgeler.',
        docs: [
            {
                k: 'arsiv', n: 'Vintage Giysi Satışı e-Arşiv', w: 'Mağazadan tüketiciye vintage ceket ve kot satışı.', lay: 'pastel', pay: 'kart',
                l: [['Vintage kot ceket', 'C62', 1, 1100, 20, { BEDEN: 'M' }], ['Yün kaban (ikinci el)', 'C62', 1, 1600, 20, { BEDEN: 'L' }]],
            },
            {
                k: 'gider', n: 'İkinci El Giysi Alımı Gider Pusulası', w: 'Vatandaştan kilo bazlı ikinci el giysi ve ayakkabı alımı.', lay: 'defter', pay: 'nakit',
                l: [['İkinci el giysi (karışık)', 'KGM', 42, 30, 0], ['İkinci el ayakkabı', 'PR', 8, 60, 0]],
            },
        ],
    },
    {
        code: 'E.12', sector: 'tekstil', icon: 'shirt', c: ['#a21caf', '#f5d0fe'], f: 'Moda Hat Konfeksiyon San. Ltd. Şti.', city: 'İstanbul', slogan: 'Hazır giyim üretim · fason · ihracat', sanayi: true,
        why: 'Konfeksiyoncu markalara fason dikim yapıyorsa 609 (7/10) tevkifatlı e-Fatura, doğrudan yurt dışı alıcıya satışta IHRACAT profilli fatura düzenler; fasona kumaş gönderimi / ürün teslimi e-İrsaliye ile izlenir.',
        docs: [
            {
                k: 'fatura/tevkifat:609', n: 'Fason Dikim Faturası (Tevkifat 609)', w: 'Markanın kesilmiş kumaşlarının fason dikim ve ütü-paket işçiliği; 7/10 tevkifat.', lay: 'teknik', to: { f: 'Trend Giyim Mağazacılık A.Ş.', city: 'İstanbul' }, pay: 'vade:30',
                l: [['Kadın elbise dikim (fason)', 'C62', 3000, 95, 20, { KATALOG: 'TG-W26-118' }], ['Erkek gömlek dikim (fason)', 'C62', 2400, 70, 20, { KATALOG: 'TG-M26-044' }], ['Ütü-paket', 'C62', 5400, 8, 20]],
            },
            {
                k: 'ihracat', n: 'Hazır Giyim İhracat Faturası (FCA)', w: 'Hollanda’daki zincire tişört ve sweatshirt ihracatı; asorti koli.', lay: 'serit', to: 'NL', cur: 'EUR', inc: 'FCA', mode: 3, pkg: 'CT',
                l: [['Pamuklu tişört', 'C62', 6000, 4.6, 0, { BEDEN: 'S-XL asorti' }, { g: '610910000000', kap: 120 }], ['Sweatshirt', 'C62', 2400, 11.2, 0, {}, { g: '611020100000', kap: 80 }]],
            },
            {
                k: 'irsaliye', n: 'Fasona Kesilmiş Kumaş Sevk İrsaliyesi', w: 'Kesimhaneden fason dikim atölyesine kesilmiş parçaların sevki.', lay: 'kenar', to: { f: 'Çağlar Fason Dikim Atölyesi', city: 'İstanbul', sanayi: true }, kg: 820, kap: 46,
                l: [['Kesilmiş elbise parçaları (set)', 'SET', 3000, 0, 20, { KATALOG: 'TG-W26-118' }], ['Astar ve tela', 'MTR', 1800, 0, 20]],
                nt: ['Mallar fason işlenmek üzere gönderilmiştir; satış değildir.'],
            },
        ],
    },
    {
        code: 'E.13', sector: 'buro', icon: 'pen-tool', c: ['#db2777', '#111827'], f: 'Elif Demir Tasarım', o: 'Elif Demir', city: 'İstanbul', slogan: 'Moda · grafik · ürün tasarımı',
        why: 'Serbest tasarımcı serbest meslek erbabıdır: yurt içi işverene %20 stopajlı e-SMM düzenler. Yurt dışındaki müşteriye verilen ve yurt dışında yararlanılan tasarım hizmeti hizmet ihracatıdır (KDV 11/1-a, istisna 302).',
        docs: [
            {
                k: 'smm', n: 'Koleksiyon Tasarımı e-SMM (Stopajlı)', w: 'Giyim markasına sezon koleksiyon tasarımı ve teknik çizim; %20 GV stopajı.', lay: 'zarif', to: { f: 'Trend Giyim Mağazacılık A.Ş.', city: 'İstanbul' },
                l: [['İlkbahar-yaz koleksiyon tasarımı (24 model)', 'C62', 1, 120000, 20], ['Teknik çizim ve ölçü tablosu', 'C62', 24, 1500, 20]],
                r: [['SOZLESME', 'TG-TSR-2026-03']],
            },
            {
                k: 'smm/istisna:302', n: 'Yurt Dışına Tasarım Hizmeti (İhracat)', w: 'İngiltere’deki markaya logo ve ambalaj tasarımı; hizmet ihracatı istisnası, stopaj yok.', lay: 'modern', to: 'GB', cur: 'GBP', stopaj: 0,
                l: [['Marka kimliği ve logo tasarımı', 'C62', 1, 2400, 0], ['Ambalaj tasarımı (3 ürün)', 'C62', 3, 650, 0]],
            },
        ],
    },
    {
        code: 'E.14', sector: 'tekstil', icon: 'palette', c: ['#7e22ce', '#fae8ff'], f: 'Renkli Baskı Boya Tekstil Ltd. Şti.', city: 'Bursa', slogan: 'Kumaş boyama · dijital baskı · apre', sanayi: true,
        why: 'Tekstil baskı / boyahanesi müşteri kumaşını fason boyar: 609 (7/10) tevkifatlı e-Fatura; işlenen kumaş müşteriye e-İrsaliye ile iade sevk edilir.',
        docs: [
            {
                k: 'fatura/tevkifat:609', n: 'Fason Boya-Baskı Faturası (Tevkifat 609)', w: 'Dokuma fabrikasının ham kumaşlarının reaktif boyama ve dijital baskı işçiliği.', lay: 'endustri', to: { f: 'Uludağ Dokuma Sanayi A.Ş.', city: 'Bursa', sanayi: true }, pay: 'vade:45',
                l: [['Reaktif boyama (pamuklu)', 'MTR', 24000, 14, 20, { RENK: 'Lacivert — Pantone 19-4024' }], ['Dijital baskı', 'MTR', 6000, 32, 20, { DESEN: 'Çiçek desen D-118' }], ['Apre ve sanfor', 'MTR', 30000, 3, 20]],
                r: [['PARTINO', 'UD-26-0918']],
            },
            {
                k: 'irsaliye', n: 'Boyanmış Kumaş İade Sevk İrsaliyesi', w: 'Boyama işlemi tamamlanan kumaşların müşteriye sevki.', lay: 'teknik', to: { f: 'Uludağ Dokuma Sanayi A.Ş.', city: 'Bursa', sanayi: true }, kg: 7800, kap: 240,
                l: [['Boyalı kumaş — lacivert', 'MTR', 24000, 0, 20, { PARTINO: 'UD-26-0918' }], ['Baskılı kumaş', 'MTR', 6000, 0, 20]],
                nt: ['Mallar fason işleme sonrası sahibine iade edilmektedir.'],
            },
        ],
    },
    {
        code: 'E.15', sector: 'tekstil', icon: 'ruler', c: ['#1e3a8a', '#e0e7ff'], f: 'Usta Terzi', o: 'Kemal Aydın', city: 'Bursa', slogan: 'Ismarlama · tadilat · üniforma',
        why: 'Terzi bireysel ısmarlama ve tadilat işlerini e-Arşiv ile; işletmelere personel üniforması dikimini e-Fatura ile faturalar.',
        docs: [
            {
                k: 'arsiv', n: 'Ismarlama Takım e-Arşiv', w: 'Müşteri ölçüsüne göre takım elbise dikimi; kumaş ve prova bilgisi.', lay: 'zarif', pay: 'kart',
                l: [['Ismarlama takım elbise dikimi', 'C62', 1, 14000, 20, { MALZEME: 'Yün %100 Super 120s' }], ['Pantolon paça + bel tadilatı', 'C62', 2, 350, 20]],
                nt: ['Prova tarihleri: 22.09.2026 ve 01.10.2026.'],
            },
            {
                k: 'fatura', n: 'Otel Personel Üniforması e-Faturası', w: 'Otelin resepsiyon ve servis personeli için üniforma dikimi.', lay: 'kurumsal', to: { f: 'Çekirge Termal Otel A.Ş.', city: 'Bursa' }, pay: 'vade:30',
                l: [['Resepsiyon ceketi', 'C62', 24, 2800, 20, { BEDEN: 'Ölçüye göre' }], ['Servis yeleği', 'C62', 40, 950, 20], ['Logo nakışı', 'C62', 64, 120, 20]],
            },
        ],
    },
    {
        code: 'E.16', sector: 'tekstil', icon: 'scissors-line-dashed', c: ['#be123c', '#ffe4e6'], f: 'İğne İplik Tuhafiye Toptan', o: 'Nur Kılıç', city: 'İstanbul', slogan: 'Düğme · fermuar · iplik · aksesuar',
        why: 'Tuhafiyeci perakende müşterilere e-Arşiv, konfeksiyon atölyelerine toptan aksesuar satışında e-Fatura düzenler.',
        docs: [
            {
                k: 'arsiv', n: 'Tuhafiye Perakende e-Arşiv', w: 'Tüketiciye iplik, düğme ve dantel satışı.', lay: 'fis', pay: 'nakit',
                l: [['Örgü ipliği 100 g', 'C62', 6, 85, 20], ['Sedef düğme (10\'lu)', 'C62', 3, 60, 20], ['Dantel şerit', 'MTR', 4, 35, 20]],
            },
            {
                k: 'fatura', n: 'Atölyeye Toptan Aksesuar e-Faturası', w: 'Konfeksiyon atölyesine fermuar, düğme ve etiket toptan satışı.', lay: 'kenar', to: { f: 'Çağlar Fason Dikim Atölyesi', city: 'İstanbul' }, pay: 'vade:30',
                l: [['Metal fermuar 18 cm', 'C62', 5000, 6.5, 20], ['Polyester düğme 20 mm', 'C62', 20000, 0.6, 20], ['Dokuma beden etiketi', 'C62', 10000, 0.45, 20]],
            },
        ],
    },
];
