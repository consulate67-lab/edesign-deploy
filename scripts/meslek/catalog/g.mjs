// G — Kuaför, Berber, Temizlik, Spor, Kozmetik, Sağlık
export default [
    {
        code: 'G.01', sector: 'saglik', icon: 'hand-heart', c: ['#0d9488', '#ccfbf1'], f: 'Denge Fizyoterapi ve Tamamlayıcı Tıp Merkezi Ltd. Şti.', city: 'Antalya', slogan: 'Fizik tedavi · GETAT · rehabilitasyon',
        why: 'Fizyoterapi / tamamlayıcı tıp merkezi danışana seans paketleri için e-Arşiv düzenler (sağlık hizmetinde indirimli KDV oranı). Türkiye\'de yerleşik olmayan yabancı hastalara verilen ve bedeli döviz olarak ödenen sağlık hizmeti KDV 13/l uyarınca istisnadır (ISTISNA 334); alıcı VKN 2222222222 ile gösterilir.',
        docs: [
            {
                k: 'arsiv', n: 'Fizik Tedavi Seans Paketi e-Arşiv', w: 'Danışana 10 seanslık fizik tedavi ve kupa uygulaması; seans planı randevu alanında.', lay: 'pastel', pay: 'kart',
                l: [['Fizik tedavi seansı (45 dk)', 'C62', 10, 1200, 10, { SEANS: '10 seans — haftada 3' }], ['Kupa (hacamat) uygulaması', 'C62', 2, 900, 10], ['Kinezyo bant uygulaması', 'C62', 4, 250, 10]],
                r: [['RANDEVU', 'DFT-26-4418'], ['RAPOR', 'Ortopedi uzmanı yönlendirme raporu']],
            },
            {
                k: 'arsiv/istisna:334', n: 'Yabancı Hastaya Tedavi Paketi (İstisna 334)', w: 'Türkiye\'de yerleşik olmayan yabancı hastaya rehabilitasyon paketi; döviz tahsilat, KDV 13/l istisnası.', lay: 'serit', pay: 'kart', cur: 'EUR',
                to: { kisi: { ids: [['VKN', '2222222222']], person: ['James', 'Whitmore'], addr: { street: '14 High Street', district: 'Greater Manchester', city: 'Manchester', zip: 'M1 4BT', cc: 'GB', country: 'Birleşik Krallık' } } },
                l: [['Bel fıtığı rehabilitasyon paketi (10 gün)', 'C62', 1, 1800, 0], ['Hidroterapi seansı', 'C62', 5, 60, 0]],
                r: [['HASTA', 'Pasaport 1288 4417 · GB']],
                nt: ['Hizmet bedeli yurt dışından döviz olarak tahsil edilmiştir.'],
            },
        ],
    },
    {
        code: 'G.02', sector: 'genel-hizmet', icon: 'flower', c: ['#334155', '#cbd5e1'], f: 'Huzur Cenaze Hizmetleri Ltd. Şti.', city: 'Bursa', slogan: 'Cenaze nakil · yıkama · defin organizasyonu',
        why: 'Özel cenaze hizmet işletmesi ailelere e-Arşiv düzenler; belediyelerin ihaleyle verdiği cenaze nakil / yıkama hizmetlerinde KAMU senaryolu e-Fatura (IBAN zorunlu) kullanır.',
        docs: [
            {
                k: 'arsiv', n: 'Şehirler Arası Cenaze Nakli e-Arşiv', w: 'Aileye cenaze yıkama, tabut ve memleketine nakil hizmeti; güzergâh belge alanında.', lay: 'kurumsal', pay: 'havale',
                l: [['Cenaze yıkama ve kefenleme', 'C62', 1, 3500, 20], ['Tabut (ahşap, standart)', 'C62', 1, 6000, 20], ['Cenaze aracıyla nakil (Bursa – Trabzon)', 'KMT', 1050, 18, 20]],
                r: [['GUZERGAH', 'Bursa – Trabzon / Akçaabat']],
            },
            {
                k: 'fatura/kamu', n: 'Belediyeye Cenaze Nakil Hizmeti (KAMU)', w: 'Belediye ihalesi kapsamında aylık cenaze nakil araç ve personel hizmeti; KAMU senaryosu.', lay: 'teknik', to: { f: 'Osmangazi Belediye Başkanlığı', city: 'Bursa' }, pay: 'havale',
                per: ['2026-09-01', null, 'Eylül 2026 hizmet dönemi', '2026-09-30'],
                l: [['Cenaze nakil aracı (şoförlü)', 'MON', 3, 85000, 20], ['Gassal personel hizmeti', 'MON', 2, 52000, 20]],
                r: [['IHALE', '2026/412887', 'Açık ihale'], ['SOZLESME', 'OB-CNZ-2026-03']],
            },
        ],
    },
    {
        code: 'G.03', sector: 'saglik', icon: 'smile', c: ['#0284c7', '#f0f9ff'], f: 'Beyaz İnci Diş Protez Laboratuvarı', o: 'Recep Ateş', city: 'İzmir', slogan: 'Zirkonyum · porselen · implant üstü protez', sanayi: true,
        why: 'Diş laboratuvarı ısmarlama protezleri diş hekimine / kliniğe satar: şirket klinikler e-Fatura mükellefiyse aylık toplu e-Fatura, serbest çalışan diş hekimlerine TCKN ile e-Arşiv düzenlenir. Hasta ve iş emri bilgisi satır ve belge referanslarında taşınır.',
        docs: [
            {
                k: 'fatura', n: 'Diş Kliniğine Aylık Protez e-Faturası', w: 'Ağız ve diş sağlığı polikliniğine Eylül ayı zirkonyum ve implant üstü protez işleri; iş emri bazlı satırlar.', lay: 'teknik', to: { f: 'Karşıyaka Dent Ağız ve Diş Sağlığı Polikliniği Ltd. Şti.', city: 'İzmir' }, pay: 'vade:30',
                per: ['2026-09-01', null, 'Eylül 2026 laboratuvar işleri', '2026-09-30'],
                l: [['Zirkonyum kron (üye)', 'C62', 38, 2400, 10, { IS_EMRI: '19 iş emri' }], ['İmplant üstü metal destekli porselen', 'C62', 12, 3100, 10], ['Gece plağı (sert)', 'C62', 6, 1500, 10]],
            },
            {
                k: 'arsiv', n: 'Diş Hekimine Protez e-Arşiv', w: 'Serbest çalışan diş hekimine hasta bazlı porselen kron ve hareketli protez; hekim TCKN ile.', lay: 'kart', pay: 'havale',
                l: [['Metal destekli porselen kron', 'C62', 4, 1900, 10, { HASTA: 'A.Y. — 14-15-16-17' }], ['Tam protez (üst çene, akrilik)', 'C62', 1, 6500, 10, { HASTA: 'M.K.' }]],
                r: [['IS_EMRI', 'BIL-26-0918']],
            },
        ],
    },
    {
        code: 'G.04', sector: 'guzellik', icon: 'feather', c: ['#111827', '#f43f5e'], f: 'Mürekkep Dövme Stüdyosu', o: 'Onur Keskin', city: 'İstanbul', slogan: 'Dövme · piercing · kalıcı makyaj silme',
        why: 'Dövme stüdyosu bireysel müşterilere seans bazlı e-Arşiv düzenler; dizi / reklam prodüksiyonlarına geçici dövme ve sanatçı hizmetini kurumsal e-Fatura ile faturalar.',
        docs: [
            {
                k: 'arsiv', n: 'Dövme Seansı e-Arşiv', w: 'Müşteriye kol dövmesi (2 seans) ve piercing; seans ve randevu bilgisi.', lay: 'kart', pay: 'kart',
                l: [['Dövme — ön kol, siyah-gri (seans)', 'C62', 2, 4500, 20, { SEANS: '2 / 2' }], ['Piercing (kulak kepçesi, titanyum)', 'C62', 1, 900, 20], ['Dövme bakım kremi', 'C62', 1, 250, 20]],
                r: [['RANDEVU', 'MDS-26-1182']],
            },
            {
                k: 'fatura', n: 'Dizi Setine Geçici Dövme e-Faturası', w: 'Dizi prodüksiyonu için oyunculara geçici dövme tasarımı ve set günü uygulaması.', lay: 'modern', to: { f: 'Boğaziçi Film Yapım A.Ş.', city: 'İstanbul' }, pay: 'vade:30',
                l: [['Geçici dövme tasarımı (karakter)', 'C62', 3, 6000, 20], ['Set günü uygulama (sanatçı + malzeme)', 'DAY', 4, 7500, 20]],
                r: [['SOZLESME', 'BFY-SET-26-044'], ['PROJE', '"Kıyı" dizisi 2. sezon']],
            },
        ],
    },
    {
        code: 'G.05', sector: 'guzellik', icon: 'scissors', c: ['#1e293b', '#fbbf24'], f: 'Usta Halil Erkek Kuaförü', o: 'Halil Turan', city: 'Gaziantep', slogan: 'Saç · sakal · damat tıraşı',
        why: 'Berberlerin önemli kısmı basit usul / esnaf muaflığındadır ve fatura düzenleme zorunluluğu yoktur; işletme hesabı esasına tabi berber müşteri talebinde e-Arşiv, anlaşmalı otel veya kurumlara verilen hizmette e-Fatura düzenler.',
        docs: [
            {
                k: 'arsiv', n: 'Berber Hizmeti e-Arşiv', w: 'Müşteriye saç kesimi, sakal ve cilt bakımı.', lay: 'fis', pay: 'nakit',
                l: [['Saç kesimi', 'C62', 1, 450, 20], ['Sakal tıraşı ve şekillendirme', 'C62', 1, 250, 20], ['Erkek cilt bakımı (maske)', 'C62', 1, 400, 20]],
            },
            {
                k: 'fatura', n: 'Otel Misafir Berber Hizmeti e-Faturası', w: 'Anlaşmalı otelin misafirlerine verilen aylık berber hizmeti; kişi sayısı bazlı.', lay: 'kurumsal', to: { f: 'Şahinbey Grand Otel Turizm A.Ş.', city: 'Gaziantep' }, pay: 'vade:15',
                per: ['2026-09-01', null, 'Eylül 2026', '2026-09-30'],
                l: [['Misafir saç kesimi', 'C62', 64, 400, 20], ['Damat tıraşı paketi', 'C62', 3, 2500, 20]],
                r: [['SOZLESME', 'SGO-BRB-2026']],
            },
        ],
    },
    {
        code: 'G.06', sector: 'temizlik', icon: 'spray-can', c: ['#0369a1', '#bae6fd'], f: 'Parlak Tesis Temizlik Hizmetleri Ltd. Şti.', city: 'Ankara', slogan: 'Ofis temizliği · ilaçlama · inşaat sonrası',
        why: 'Temizlik firması belirlenmiş alıcılara (kamu idareleri, büyük şirketler) verdiği temizlik ve haşere kontrol hizmetinde 612 kodlu 9/10 KDV tevkifatlı e-Fatura düzenler; kamu alıcıda KAMU senaryosu. Ev ilaçlama ve bireysel temizlik hizmetleri e-Arşiv ile belgelenir.',
        docs: [
            {
                k: 'fatura/tevkifat:612', n: 'Aylık Ofis Temizliği Faturası (Tevkifat 612)', w: 'Plaza ofislerinin aylık temizlik hizmeti; personel ve sarf malzeme ayrı satırda, 9/10 tevkifat.', lay: 'kurumsal', to: { f: 'Başkent Doğalgaz Dağıtım A.Ş.', city: 'Ankara' }, pay: 'vade:30',
                per: ['2026-09-01', null, 'Eylül 2026 temizlik hizmeti', '2026-09-30'],
                l: [['Temizlik personeli (aylık)', 'MON', 8, 42000, 20], ['Temizlik sarf malzemesi', 'MON', 1, 14500, 20], ['Cam silme (dış cephe, platformlu)', 'MTK', 1200, 18, 20]],
                r: [['SOZLESME', 'BDG-TMZ-2026-01']],
            },
            {
                k: 'fatura/kamu/tevkifat:612', n: 'Hastaneye İlaçlama Hizmeti (KAMU + Tevkifat 612)', w: 'Devlet hastanesine haşere kontrol ve dezenfeksiyon; KAMU senaryosu ve 9/10 tevkifat.', lay: 'teknik', to: { f: 'Etlik Şehir Hastanesi Başhekimliği', city: 'Ankara' }, pay: 'havale',
                l: [['Haşere kontrol uygulaması (kemirgen + böcek)', 'MTK', 18000, 1.2, 20], ['ULV dezenfeksiyon (ameliyathane)', 'MTK', 2400, 4.5, 20]],
                r: [['IHALE', '2026/558214', 'Açık ihale'], ['RAPOR', 'Biyosidal uygulama raporu 26/09']],
            },
            {
                k: 'arsiv', n: 'Ev İlaçlama e-Arşiv', w: 'Daireye hamam böceği ilaçlaması ve garanti kontrolü.', lay: 'fis', pay: 'kart',
                l: [['Ev ilaçlama (3+1 daire)', 'C62', 1, 1800, 20], ['Jel yem uygulaması', 'C62', 1, 600, 20]],
                nt: ['Uygulama 3 ay garantilidir; 30. gün kontrol ziyareti ücretsizdir.'],
            },
        ],
    },
    {
        code: 'G.07', sector: 'guzellik', icon: 'sparkles', c: ['#c026d3', '#fae8ff'], f: 'Lotus Güzellik Merkezi', o: 'Melike Polat', city: 'Antalya', slogan: 'Cilt bakımı · lazer · kalıcı makyaj',
        why: 'Güzellik salonu seans paketlerini e-Arşiv ile belgeler (paket bedeli peşin tahsil ediliyorsa fatura tahsilatta düzenlenir, seans planı belgede gösterilir); otellerin spa bölümüne verdiği taşeron hizmeti e-Fatura ile faturalar.',
        docs: [
            {
                k: 'arsiv', n: 'Lazer ve Cilt Bakımı Paketi e-Arşiv', w: 'Danışana 6 seans lazer epilasyon ve cilt bakımı paketi; seans planı ve uzman bilgisi.', lay: 'pastel', pay: 'kart',
                l: [['Lazer epilasyon — tüm bacak (seans)', 'C62', 6, 1500, 20, { SEANS: '6 seans · 4 hafta arayla' }], ['Hydrafacial cilt bakımı', 'C62', 2, 2200, 20, { KUAFOR: 'Uzm. Est. Gizem A.' }]],
                r: [['RANDEVU', 'LGM-26-3318']],
            },
            {
                k: 'fatura', n: 'Otel SPA Taşeron Hizmeti e-Faturası', w: 'Otel spa bölümünde verilen bakım hizmetlerinin aylık mutabakat faturası.', lay: 'zarif', to: { f: 'Lara Beach Resort Otelcilik A.Ş.', city: 'Antalya' }, pay: 'vade:30',
                per: ['2026-09-01', null, 'Eylül 2026 SPA mutabakatı', '2026-09-30'],
                l: [['Cilt bakımı (misafir)', 'C62', 142, 900, 20], ['Manikür + pedikür (misafir)', 'C62', 96, 650, 20]],
                r: [['SOZLESME', 'LBR-SPA-2026']],
            },
        ],
    },
    {
        code: 'G.08', sector: 'saglik', icon: 'heart-handshake', c: ['#0e7490', '#fecdd3'], f: 'Fatma Kılıç Evde Bakım Hemşireliği', o: 'Fatma Kılıç', city: 'Ankara', slogan: 'Evde hasta bakımı · pansuman · yaşlı bakımı',
        why: 'Serbest çalışan hemşire / hasta bakıcı serbest meslek erbabıdır: aileye e-SMM (stopajsız), özel bakım evi veya sağlık kuruluşuna verdiği hizmette %20 GV stopajlı e-SMM düzenler. Yatılı bakım evi işleten şirketler ise sakinlere aylık e-Arşiv keser.',
        docs: [
            {
                k: 'smm', n: 'Evde Hasta Bakımı e-SMM', w: 'Aileye aylık evde yaşlı bakımı ve pansuman hizmeti; gerçek kişi müşteri, stopaj yok.', lay: 'pastel', to: 'kisi',
                per: ['2026-09-01', null, 'Eylül 2026 bakım dönemi', '2026-09-30'],
                l: [['Evde yaşlı bakımı (gündüz, hafta içi)', 'DAY', 22, 1800, 10], ['Yara pansumanı ve enjeksiyon', 'C62', 8, 300, 10]],
                r: [['HASTA', 'S.Ö. — 82 yaş']],
            },
            {
                k: 'smm', n: 'Bakım Evine Hemşirelik e-SMM (Stopajlı)', w: 'Özel huzurevine gece nöbeti hemşirelik hizmeti; işveren %20 stopaj keser.', lay: 'kurumsal', to: { f: 'Gül Bahçesi Huzurevi ve Bakım Merkezi Ltd. Şti.', city: 'Ankara' },
                per: ['2026-09-01', null, 'Eylül 2026', '2026-09-30'],
                l: [['Gece nöbeti hemşirelik hizmeti', 'C62', 12, 4500, 10]],
                r: [['SOZLESME', 'GBH-HMS-2026']],
            },
        ],
    },
    {
        code: 'G.09', sector: 'guzellik', icon: 'wand-sparkles', c: ['#be185d', '#fbcfe8'], f: 'Saç Tasarım Kadın Kuaförü', o: 'Sibel Korkmaz', city: 'İzmir', slogan: 'Saç boyama · gelin saçı · keratin',
        why: 'Kadın kuaförü müşteriye e-Arşiv düzenler; düğün organizasyon şirketlerine toplu gelin / nedime hizmetlerini e-Fatura ile faturalar. Satılan bakım ürünleri hizmetle aynı belgede ayrı satırdır.',
        docs: [
            {
                k: 'arsiv', n: 'Kuaför Hizmeti e-Arşiv', w: 'Müşteriye ombre boyama, kesim, fön ve bakım ürünü satışı.', lay: 'pastel', pay: 'kart',
                l: [['Ombre / balyaj boyama', 'C62', 1, 3500, 20], ['Saç kesimi + fön', 'C62', 1, 700, 20], ['Keratin bakım şampuanı', 'C62', 1, 480, 20]],
                r: [['RANDEVU', 'STK-26-0912']],
            },
            {
                k: 'fatura', n: 'Organizasyon Firmasına Gelin Paketi e-Faturası', w: 'Düğün organizasyon şirketine gelin saçı-makyajı ve nedime hizmetleri; etkinlik tarihi dönemde.', lay: 'zarif', to: { f: 'Ege Düş Organizasyon Ltd. Şti.', city: 'İzmir' }, pay: 'vade:15',
                per: ['2026-09-27', '10:00:00', 'Düğün hazırlığı'],
                l: [['Gelin saçı + makyaj (prova dahil)', 'C62', 1, 12000, 20], ['Nedime saç ve makyaj', 'C62', 4, 2500, 20], ['Mekânda hazır bekleme (saat)', 'HUR', 4, 600, 20]],
            },
        ],
    },
    {
        code: 'G.10', sector: 'turizm', icon: 'bath', c: ['#b45309', '#fef3c7'], f: 'Tarihi Çekirge Hamamı ve Spa Ltd. Şti.', city: 'Bursa', slogan: 'Termal hamam · kese-köpük · masaj',
        why: 'Hamam ve kaplıca işletmesi bireysel ziyaretçilere e-Arşiv, misafirlerini getiren tur acentelerine toplu e-Fatura düzenler. Turistlere verilen hamam hizmeti Türkiye\'de tüketildiğinden hizmet ihracatı değildir; konaklama içermediği için konaklama vergisi de uygulanmaz.',
        docs: [
            {
                k: 'arsiv', n: 'Hamam Paketi e-Arşiv', w: 'Ziyaretçiye termal hamam girişi, kese-köpük ve masaj paketi.', lay: 'zarif', pay: 'kart',
                l: [['Termal hamam girişi', 'C62', 2, 650, 20], ['Kese + köpük masajı', 'C62', 2, 900, 20], ['Aromaterapi masajı (50 dk)', 'C62', 1, 2200, 20]],
            },
            {
                k: 'fatura', n: 'Tur Acentesine Grup Hamam e-Faturası', w: 'Yabancı turist grubunu getiren acenteye toplu hamam paketi; grup kodu belge alanında.', lay: 'kurumsal', to: { f: 'Anatolia Gate Turizm Seyahat Acentası A.Ş.', city: 'İstanbul' }, pay: 'vade:30',
                l: [['Grup hamam paketi (kişi)', 'C62', 42, 1300, 20], ['Rehber ve şoför (ücretsiz)', 'C62', 2, 0, 20]],
                r: [['TUR', 'AGT-BRS-2609']],
            },
        ],
    },
    {
        code: 'G.11', sector: 'guzellik', icon: 'flask-conical', c: ['#7c3aed', '#e9d5ff'], f: 'Lavanta Kozmetik San. Tic. Ltd. Şti.', city: 'Antalya', slogan: 'Parfüm · cilt bakımı · doğal kozmetik', sanayi: true,
        why: 'Kozmetik imalatçısı parfüm (kolonya hariç), makyaj ve cilt bakım ürünlerinin ilk tesliminde ÖTV (IV) sayılı liste %20 ÖTV hesaplar (TaxTypeCode 0074, KDV matrahına dahil); şampuan ve kolonya bu kapsam dışındadır. Toptan satış e-Fatura, web satışı e-Arşiv internet satışı, yurt dışına küçük gönderiler mikro ihracat ile belgelenir.',
        docs: [
            {
                k: 'fatura', n: 'Eczane Deposuna Kozmetik e-Faturası (ÖTV IV)', w: 'Parfüm ve cilt bakım kremlerinde imalatçı ilk teslimi %20 ÖTV; kolonya ve şampuan ÖTV\'siz.', lay: 'kurumsal', to: { f: 'Akdeniz Ecza Deposu A.Ş.', city: 'Antalya' }, pay: 'vade:60',
                l: [['Lavanta parfüm EDP 50 ml', 'C62', 600, 320, 20, { LOT: 'LK-2609-04' }, { taxes: [{ code: '0074', name: 'ÖTV (IV) SAYILI LİSTE', pct: 20 }] }], ['Nemlendirici yüz kremi 50 ml', 'C62', 900, 180, 20, { LOT: 'LK-2609-11' }, { taxes: [{ code: '0074', name: 'ÖTV (IV) SAYILI LİSTE', pct: 20 }] }], ['Lavanta kolonyası 400 ml', 'C62', 1200, 85, 20], ['Doğal şampuan 400 ml', 'C62', 800, 95, 20]],
                r: [['IRSALIYE', 'LKS2026000002281']],
            },
            {
                k: 'arsiv/net', n: 'Online Kozmetik Satışı e-Arşiv (İnternet)', w: 'Web mağazasından tüketiciye parfüm ve krem siparişi; ÖTV fiyata dahil (perakende satışta ayrıca ÖTV hesaplanmaz).', lay: 'pastel',
                l: [['Lavanta parfüm EDP 50 ml', 'C62', 1, 690, 20], ['Nemlendirici yüz kremi 50 ml', 'C62', 2, 390, 20]],
            },
            {
                k: 'mikro', n: 'Yurt Dışı Kozmetik Gönderisi Mikro İhracat (ETGB)', w: 'Hollanda\'daki müşteriye web siparişi; ETGB ve GTİP 3303 / 3304.', lay: 'kart', to: 'NL', cur: 'EUR',
                l: [['Lavanta parfüm EDP 50 ml', 'C62', 3, 22, 0, {}, { g: '330300900000' }], ['Nemlendirici yüz kremi 50 ml', 'C62', 4, 12, 0, {}, { g: '330499000000' }]],
            },
        ],
    },
    {
        code: 'G.12', sector: 'saglik', icon: 'glasses', c: ['#1d4ed8', '#dbeafe'], f: 'Net Bakış Optik', o: 'Canan Erdoğan', city: 'Ankara', slogan: 'Numaralı gözlük · lens · SGK anlaşmalı',
        why: 'Optisyen reçeteli gözlük ve lens satışında tüketiciye e-Arşiv düzenler; SGK\'lı hastaların reçeteli gözlük camı / çerçeve bedelini SGK\'ya aylık InvoiceTypeCode SGK + AccountingCost SAGLIK_OPT ile faturalar (alıcı SGK, mükellef kodu ve dosya no zorunlu).',
        docs: [
            {
                k: 'arsiv', n: 'Numaralı Gözlük Satışı e-Arşiv', w: 'Reçeteli progresif cam ve çerçeve satışı; diyoptri değerleri ve reçete numarası satırda.', lay: 'modern', pay: 'kart',
                l: [['Progresif cam (inceltilmiş, mavi filtre)', 'PR', 1, 7800, 10, { DIOPTRI: 'Sağ +1,25 / Sol +1,50 · Add +2,00' }], ['Gözlük çerçevesi (titanyum)', 'C62', 1, 3200, 10, { MARKA: 'Lindberg' }], ['Güneş gözlüğü (polarize)', 'C62', 1, 2900, 20]],
                r: [['RECETE', '2R7K9QX', 'e-Reçete']],
            },
            {
                k: 'fatura/sgk:SAGLIK_OPT', n: 'SGK Reçeteli Gözlük Faturası (SAGLIK_OPT)', w: 'Eylül ayında SGK provizyonlu verilen gözlük camı ve çerçeve bedellerinin SGK\'ya faturası.', lay: 'kurumsal', pay: 'havale',
                per: ['2026-09-01', null, 'Eylül 2026 fatura dönemi', '2026-09-30'],
                l: [['Uzak gözlük camı (SGK)', 'PR', 46, 220, 10], ['Yakın gözlük camı (SGK)', 'PR', 31, 220, 10], ['Gözlük çerçevesi (SGK)', 'C62', 52, 180, 10]],
            },
        ],
    },
    {
        code: 'G.13', sector: 'spor', icon: 'dumbbell', c: ['#15803d', '#bbf7d0'], f: 'Atlet Spor Malzemeleri San. Tic. Ltd. Şti.', city: 'İstanbul', slogan: 'Fitness ekipmanı · top · takım malzemesi', sanayi: true,
        why: 'Spor malzemesi üreticisi / satıcısı spor salonlarına ve kulüplere e-Fatura, tüketiciye online e-Arşiv internet satışı, gençlik ve spor müdürlükleri gibi kamu idarelerine KAMU senaryolu e-Fatura düzenler.',
        docs: [
            {
                k: 'fatura', n: 'Spor Salonuna Fitness Ekipmanı e-Faturası', w: 'Fitness merkezine koşu bandı, ağırlık seti ve kurulum; seri numaraları satırda.', lay: 'endustri', to: { f: 'Form Plus Spor Kulübü Ltd. Şti.', city: 'İzmir' }, pay: 'senet:90',
                l: [['Profesyonel koşu bandı', 'C62', 6, 98000, 20, { SERINO: 'ATL-TR-26-0441…446', GARANTI: '2 yıl' }], ['Dambıl seti 2,5–40 kg (raf dahil)', 'SET', 1, 72000, 20], ['Kurulum ve montaj', 'C62', 1, 6500, 20]],
            },
            {
                k: 'arsiv/net', n: 'Online Spor Malzemesi e-Arşiv (İnternet)', w: 'Web mağazasından yoga matı ve direnç bandı siparişi.', lay: 'modern',
                l: [['Yoga matı 6 mm', 'C62', 1, 650, 20], ['Direnç bandı seti (5\'li)', 'SET', 1, 420, 20], ['Kettlebell 12 kg', 'C62', 1, 980, 20]],
            },
            {
                k: 'fatura/kamu', n: 'Gençlik ve Spor Müdürlüğüne Malzeme (KAMU)', w: 'Spor okulları için top, forma ve antrenman ekipmanı; KAMU senaryosu, IBAN zorunlu.', lay: 'kurumsal', to: { f: 'İstanbul Gençlik ve Spor İl Müdürlüğü', city: 'İstanbul' }, pay: 'havale',
                l: [['Futbol topu (FIFA Quality, No: 5)', 'C62', 200, 780, 20], ['Antrenman forması (baskılı)', 'C62', 400, 320, 20], ['Antrenman konisi seti', 'SET', 50, 260, 20]],
                r: [['IHALE', '2026/DT-3318', 'Doğrudan temin']],
            },
        ],
    },
    {
        code: 'G.14', sector: 'spor', icon: 'trophy', c: ['#ea580c', '#fed7aa'], f: 'Form Plus Spor Kulübü Ltd. Şti.', city: 'İzmir', slogan: 'Fitness · pilates · halı saha',
        why: 'Spor tesisi üyelik ve saatlik kullanım bedellerini tüketiciye e-Arşiv (üyelik dönemi InvoicePeriod, üyelik no belge referansı) ile; çalışanları için kurumsal üyelik alan şirketlere e-Fatura ile faturalar.',
        docs: [
            {
                k: 'arsiv', n: 'Yıllık Fitness Üyeliği e-Arşiv', w: 'Üyeye 12 aylık fitness + pilates üyeliği; üyelik dönemi ve kart numarası.', lay: 'modern', pay: 'kart',
                per: ['2026-10-01', null, '12 aylık üyelik', '2027-09-30'],
                l: [['Fitness üyeliği (12 ay)', 'C62', 1, 24000, 20], ['Reformer pilates (8 ders)', 'C62', 1, 6400, 20]],
                r: [['UYELIK', 'FP-2026-11842']],
            },
            {
                k: 'arsiv', n: 'Halı Saha Kiralama e-Arşiv', w: 'Haftalık sabit halı saha kiralaması; saat ve saha bilgisi.', lay: 'fis', pay: 'nakit', slug: 'hali-saha-kiralama-e-arsiv',
                l: [['Halı saha kiralama (21:00–22:00)', 'HUR', 4, 1500, 20, { SAAT: 'Salı 21:00' }], ['Yelek ve top', 'C62', 1, 0, 20]],
            },
            {
                k: 'fatura', n: 'Kurumsal Üyelik e-Faturası', w: 'Şirket çalışanları için 25 kişilik kurumsal fitness üyeliği; aylık faturalama.', lay: 'kurumsal', to: { f: 'Ege Yazılım Teknolojileri A.Ş.', city: 'İzmir' }, pay: 'vade:15',
                per: ['2026-10-01', null, 'Ekim 2026', '2026-10-31'],
                l: [['Kurumsal fitness üyeliği (kişi / ay)', 'MON', 25, 1500, 20]],
                r: [['SOZLESME', 'EYT-FPS-2026']],
            },
        ],
    },
    {
        code: 'G.15', sector: 'temizlik', icon: 'droplet', c: ['#0891b2', '#cffafe'], f: 'Hijyen Kimya Temizlik Ürünleri San. A.Ş.', city: 'Kocaeli', slogan: 'Deterjan · dezenfektan · kağıt hijyen', sanayi: true,
        why: 'Temizlik ürünleri üreticisi market zincirleri ve toptancılara e-Fatura, sevkiyatlarda e-İrsaliye düzenler; Azerbaycan, Irak gibi pazarlara ihracat IHRACAT profiliyle gümrük muhataplı faturalanır.',
        docs: [
            {
                k: 'fatura', n: 'Market Zincirine Deterjan e-Faturası', w: 'Market zinciri merkez deposuna çamaşır ve bulaşık deterjanı; promosyon iskontosu satırda.', lay: 'endustri', to: { f: 'Bereket Market Gıda Ltd. Şti.', city: 'Gaziantep' }, pay: 'vade:60',
                l: [['Toz çamaşır deterjanı 9 kg', 'C62', 1200, 310, 20, {}, { disc: { rate: 0.08, reason: 'Kampanya iskontosu' } }], ['Bulaşık deterjanı 1,5 lt', 'C62', 3000, 62, 20], ['Çamaşır suyu 3,5 lt', 'C62', 2400, 48, 20]],
                r: [['SIPARIS', 'BRK-PO-26-1182'], ['IRSALIYE', 'HKT2026000006614']],
            },
            {
                k: 'irsaliye', n: 'Deterjan Sevk İrsaliyesi', w: 'Fabrikadan market zinciri deposuna tır ile paletli sevkiyat.', lay: 'teknik', to: { f: 'Bereket Market Gıda Ltd. Şti.', city: 'Gaziantep' }, kg: 21400, kap: 33, dorse: true,
                l: [['Toz çamaşır deterjanı 9 kg', 'C62', 1200, 0, 20, { PALET: '15 palet' }], ['Bulaşık deterjanı 1,5 lt', 'C62', 3000, 0, 20, { PALET: '10 palet' }], ['Çamaşır suyu 3,5 lt', 'C62', 2400, 0, 20, { PALET: '8 palet' }]],
            },
            {
                k: 'ihracat', n: 'Azerbaycan\'a Deterjan İhracatı (CPT)', w: 'Bakü\'deki distribütöre deterjan ve dezenfektan ihracatı; GTİP 3402 / 3808.', lay: 'serit', to: 'AZ', cur: 'USD', inc: 'CPT', mode: 3, pkg: 'PX',
                l: [['Toz çamaşır deterjanı 9 kg', 'C62', 2400, 6.9, 0, {}, { g: '340220900000', kap: 30 }], ['Yüzey dezenfektanı 1 lt', 'C62', 4800, 1.4, 0, {}, { g: '380894900000', kap: 12 }]],
            },
        ],
    },
    {
        code: 'G.16', sector: 'saglik', icon: 'stethoscope', c: ['#0f766e', '#a7f3d0'], f: 'Medikal Destek Tıbbi Ürünler Tic. Ltd. Şti.', city: 'Ankara', slogan: 'Tıbbi sarf · ortez · hasta bakım ürünleri',
        why: 'Tıbbi malzeme firması hastane ve sağlık kuruluşlarına ILAC_TIBBICIHAZ profilli e-Fatura (GTIN, lot, son kullanma, ÜTS no satırda), SGK\'ya reçeteli ortez-protez ve medikal malzemeler için SGK tipli fatura (AccountingCost SAGLIK_MED), hastalara doğrudan satışta e-Arşiv düzenler.',
        docs: [
            {
                k: 'fatura/ilac', n: 'Hastaneye Steril Sarf Faturası (İlaç / Tıbbi Cihaz)', w: 'Özel hastaneye steril enjektör, kateter ve yara örtüsü; GTIN, lot, SKT ve ÜTS takip alanları.', lay: 'teknik', to: { f: 'Çankaya Özel Hastanesi A.Ş.', city: 'Ankara' }, pay: 'vade:90',
                l: [['Steril enjektör 5 ml (100\'lü)', 'BX', 120, 210, 10, { GTIN: '08681234500127', LOT: 'SE2609A', SKT: '09.2030', UTS: 'UTS-0868123450012' }], ['IV kateter 20G (50\'li)', 'BX', 40, 640, 10, { GTIN: '08681234500219', LOT: 'IK2608C', SKT: '08.2029' }], ['Gümüşlü yara örtüsü 10 x 10', 'C62', 300, 165, 10, { GTIN: '08681234500325', LOT: 'YO2607B', SKT: '07.2028' }]],
                r: [['SIPARIS', 'COH-SA-26-0912']],
            },
            {
                k: 'fatura/sgk:SAGLIK_MED', n: 'SGK Medikal Malzeme Faturası (SAGLIK_MED)', w: 'Eylül ayında reçeteyle verilen ortez ve hasta bezi bedellerinin SGK\'ya faturası.', lay: 'kurumsal', pay: 'havale',
                per: ['2026-09-01', null, 'Eylül 2026 fatura dönemi', '2026-09-30'],
                l: [['Dizlik ortez (menteşeli)', 'C62', 18, 1450, 10], ['Hasta bezi (yetişkin, 30\'lu)', 'PA', 260, 310, 10], ['Bel korsesi', 'C62', 24, 980, 10]],
            },
            {
                k: 'arsiv', n: 'Hastaya Tekerlekli Sandalye e-Arşiv', w: 'Hasta yakınına katlanır tekerlekli sandalye ve havalı yatak satışı; seri no ve garanti satırda.', lay: 'pastel', pay: 'kart',
                l: [['Katlanır tekerlekli sandalye (alüminyum)', 'C62', 1, 9800, 10, { SERINO: 'TS-26-0441', GARANTI: '2 yıl' }], ['Havalı yatak (kompresörlü)', 'C62', 1, 3400, 10]],
            },
        ],
    },
    {
        code: 'G.17', sector: 'genel-hizmet', icon: 'door-closed', c: ['#475569', '#e2e8f0'], f: 'Temiz Nokta WC İşletmeciliği', o: 'Erkan Uçar', city: 'İstanbul', slogan: 'Umumi tuvalet · AVM WC işletmesi · seyyar kabin',
        why: 'Umumi tuvalet giriş ücretleri ödeme kaydedici cihaz fişiyle belgelenir; işletmeci AVM ve kurumlara verdiği tuvalet işletme-temizlik hizmetini 612 (9/10) tevkifatlı e-Fatura ile, düğün / etkinlik için seyyar WC kabini hizmetini bireysel müşteriye e-Arşiv ile faturalar.',
        docs: [
            {
                k: 'fatura/tevkifat:612', n: 'AVM Tuvalet İşletme Faturası (Tevkifat 612)', w: 'Alışveriş merkezinin tuvaletlerinin aylık işletme ve temizlik hizmeti; personel ve sarf satırları.', lay: 'kurumsal', to: { f: 'Marmara Park AVM Yönetimi A.Ş.', city: 'İstanbul' }, pay: 'vade:30',
                per: ['2026-09-01', null, 'Eylül 2026', '2026-09-30'],
                l: [['WC görevli personel (vardiyalı)', 'MON', 6, 38000, 20], ['Hijyen sarf (kağıt, sabun, dezenfektan)', 'MON', 1, 26000, 20]],
                r: [['SOZLESME', 'MPA-WC-2026-01']],
            },
            {
                k: 'arsiv', n: 'Kır Düğünü Seyyar WC e-Arşiv', w: 'Kır düğünü için seyyar WC kabini kurulumu, temizlik ve söküm.', lay: 'fis', pay: 'havale',
                per: ['2026-09-19', '15:00:00', 'Kır düğünü'],
                l: [['Seyyar WC kabini (lavabolu)', 'C62', 4, 1800, 20], ['Etkinlik süresince temizlik görevlisi', 'C62', 1, 2500, 20], ['Nakliye, kurulum ve söküm', 'C62', 1, 3000, 20]],
            },
        ],
    },
];
