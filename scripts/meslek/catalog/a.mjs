// A — Ağaç İşleri
export default [
    {
        code: 'A.01', sector: 'mobilya', icon: 'sofa', c: ['#8b5e34', '#d4a373'], f: 'Yıldız Spot Eşya', o: 'Mehmet Yıldız', city: 'Konya', slogan: 'İkinci el mobilya · beyaz eşya · alım-satım',
        why: 'İkinci el eşyacı vatandaştan belge alamadan eşya satın alır (e-Gider Pusulası) ve tüketiciye perakende satar (e-Arşiv). Kullanılmış eşya satışında genel KDV oranı uygulanır; özel matrah yalnız ikinci el taşıt / taşınmaz içindir.',
        docs: [
            {
                k: 'arsiv', n: 'Perakende Satış e-Arşiv Faturası', w: 'Mağazadan tüketiciye ikinci el mobilya ve beyaz eşya satışı; teslimat ve kurulum hizmeti ayrı satırda.', lay: 'fis', pay: 'nakit',
                l: [['İkinci el 3+3+1 koltuk takımı', 'SET', 1, 9500, 20, { RENK: 'Antrasit', KALITE: 'A — temiz' }], ['İkinci el çamaşır makinesi 8 kg', 'C62', 1, 6200, 20, { MARKA: 'Arçelik', GARANTI: '3 ay dükkan garantisi' }], ['Şehir içi teslimat ve montaj', 'C62', 1, 750, 20]],
                nt: ['Kullanılmış ürünlerde 3 ay dükkan garantisi verilmiştir; garanti kapsamı fiziksel hasar içermez.'],
            },
            {
                k: 'gider', n: 'Vatandaştan Eşya Alımı Gider Pusulası', w: 'Ev boşaltma / taşınma sırasında vatandaştan toplu eşya alımı; satıcı belge veremediği için gider pusulası düzenlenir.', lay: 'defter', pay: 'nakit',
                l: [['Ceviz kaplama yatak odası takımı (kullanılmış)', 'SET', 1, 7000, 0], ['Yemek masası + 6 sandalye (kullanılmış)', 'SET', 1, 4200, 0], ['Buzdolabı No-Frost (kullanılmış)', 'C62', 1, 3800, 0]],
                r: [['EKSPERTIZ', 'EKS-2026-0412', 'Ekspertiz / değer tespit tutanağı']],
                nt: ['Eşyalar satıcının kendi kullanımındaki ev eşyası olup ticari faaliyet kapsamında satılmamıştır.'],
            },
        ],
    },
    {
        code: 'A.02', sector: 'mobilya', icon: 'trees', c: ['#4d7c0f', '#a3e635'], f: 'Doğa Orman Ürünleri Kereste San. Tic. Ltd. Şti.', city: 'Bursa', slogan: 'Kereste · tomruk · palet ve ambalaj ahşabı', sanayi: true,
        why: 'Kerestecinin müşterisi çoğunlukla mobilya atölyesi, müteahhit ve palet imalatçısıdır (e-Fatura). Ağaç ve orman ürünleri teslimi belirlenmiş alıcılara 623 kodlu 5/10 KDV tevkifatına tabidir; kamyonla sevkiyat e-İrsaliye gerektirir.',
        docs: [
            {
                k: 'fatura/tevkifat:623', n: 'Kereste Satış Faturası (Tevkifat 623)', w: 'Mobilya fabrikasına çam ve kayın kereste teslimi; belirlenmiş alıcıya 5/10 KDV tevkifatı.', lay: 'endustri', to: { f: 'Ergin Mobilya Sanayi A.Ş.', city: 'Bursa', sanayi: true }, pay: 'vade:45',
                l: [['Çam kereste 1. sınıf 5 x 10 cm', 'MTQ', 18, 9800, 20, { OLCU: '5 x 10 x 400 cm', RUTUBET: '%14 fırınlanmış' }], ['Kayın kereste buharlı 3 cm', 'MTQ', 6.5, 21500, 20, { OLCU: '3 x 20 x 300 cm', KALITE: 'AB' }], ['Kontrplak 18 mm okume', 'C62', 120, 1350, 20, { OLCU: '170 x 220 cm' }]],
                r: [['SIPARIS', 'ERG-SA-2026-0388'], ['IRSALIYE', 'DOK2026000003118']],
            },
            {
                k: 'irsaliye', n: 'Kereste Sevk İrsaliyesi', w: 'Kereste deposundan inşaat şantiyesine kamyonla sevk; ağırlık, plaka ve şoför bilgisi.', lay: 'teknik', to: { f: 'Kuzey Yapı İnşaat Taahhüt Ltd. Şti.', city: 'Bursa' }, kg: 14200, kap: 9, dorse: true,
                l: [['İnşaatlık çam kereste 2. sınıf', 'MTQ', 22, 0, 20, { OLCU: '5 x 10 x 400 cm' }, { sid: 'KRS-CAM-2' }], ['Kalıp tahtası 2,5 cm', 'MTQ', 9, 0, 20, { OLCU: '2,5 x 20 x 400 cm' }, { sid: 'KLP-25' }], ['Ahşap palet 80 x 120', 'C62', 40, 0, 20, {}, { sid: 'PLT-EUR' }]],
                r: [['SIPARIS', 'KY-2026/771']],
                nt: ['Yük branda ile örtülmüş ve spanzetle sabitlenmiştir.'],
            },
        ],
    },
    {
        code: 'A.03', sector: 'mobilya', icon: 'hammer', c: ['#92400e', '#fbbf24'], f: 'Usta Ahşap Marangoz Atölyesi', o: 'Hüseyin Kara', city: 'Kayseri', slogan: 'Ölçüye özel mutfak · kapı · vestiyer', sanayi: true,
        why: 'Marangoz ölçüye özel imalatı tüketiciye e-Arşiv ile, müteahhide / firmaya toplu kapı-dolap imalatını e-Fatura ile faturalar. Toplu teslimler şantiyeye irsaliyeli gider; montaj işçiliği aynı faturada hizmet satırıdır.',
        docs: [
            {
                k: 'arsiv', n: 'Ölçüye Özel Mutfak Dolabı e-Arşiv', w: 'Ev sahibine ölçüye özel mutfak dolabı imalatı ve montajı; ölçü ve malzeme bilgisi satır etiketlerinde.', lay: 'zarif', pay: 'havale',
                l: [['Mutfak alt dolap (lake kapak)', 'MTR', 4.2, 7800, 20, { MALZEME: '18 mm MDF lam', RENK: 'Mat beyaz' }], ['Mutfak üst dolap (cam kapak)', 'MTR', 3.6, 6200, 20, { MALZEME: '18 mm MDF lam' }], ['Boy dolabı (ankastre fırın yuvalı)', 'C62', 1, 14500, 20], ['Montaj ve yerinde uyarlama işçiliği', 'C62', 1, 6000, 20]],
                r: [['SOZLESME', 'UA-2026-061', 'Ölçü ve tasarım onay formu']],
                nt: ['%40 kapora 12.09.2026 tarihinde alınmıştır; kalan bakiye montaj sonrası tahsil edilmiştir.'],
            },
            {
                k: 'fatura', n: 'Toplu Kapı İmalatı e-Faturası', w: 'Konut projesi için müteahhit firmaya oda kapısı ve vestiyer imalatı; teslim irsaliyeleri faturada referanslı.', lay: 'kurumsal', to: { f: 'Erciyes Konut Yapı A.Ş.', city: 'Kayseri' }, pay: 'vade:30',
                l: [['Amerikan panel oda kapısı (kasa + pervaz)', 'C62', 48, 6900, 20, { OLCU: '90 x 210 cm', RENK: 'Ceviz' }], ['Vestiyer modülü', 'C62', 24, 8400, 20, { MALZEME: 'Suntalam' }], ['Kapı montaj işçiliği', 'C62', 48, 650, 20]],
                r: [['IRSALIYE', 'UAM2026000000412'], ['IRSALIYE', 'UAM2026000000419'], ['PROJE', 'Talas Vadi Evleri B Blok']],
            },
        ],
    },
    {
        code: 'A.04', sector: 'mobilya', icon: 'paint-roller', c: ['#be123c', '#fda4af'], f: 'Renk Mobilya Boya Atölyesi', o: 'Kemal Arslan', city: 'İstanbul', slogan: 'Lake · cila · eskitme · mobilya yenileme', sanayi: true,
        why: 'Mobilya boyacısı ağırlıklı olarak mobilya üreticilerine fason boya / cila yapar (e-Fatura), ev sahiplerine mobilya yenileme hizmeti verir (e-Arşiv). Hizmet niteliğinde olduğundan irsaliye yerine iş emri referansı yeterlidir.',
        docs: [
            {
                k: 'fatura', n: 'Fason Lake Boya Hizmet Faturası', w: 'Mobilya üreticisine ait kapak ve gövdelerin fason lake boyanması; iş emri ve parti numarası referanslı.', lay: 'teknik', to: { f: 'Masko Line Mobilya Ltd. Şti.', city: 'İstanbul', sanayi: true }, pay: 'vade:30',
                l: [['Parlak lake boya (2 kat astar + 2 kat son kat)', 'MTK', 86, 640, 20, { RENK: 'RAL 9016', KALITE: 'Parlaklık 90 gloss' }], ['Mat lake boya kapak', 'MTK', 42, 520, 20, { RENK: 'NCS S 2002-Y' }], ['Zımpara ve tamir dolgu', 'HUR', 14, 450, 20]],
                r: [['IS_EMRI', 'RNK-IE-2026-284'], ['PARTINO', 'ML-26-0941']],
            },
            {
                k: 'arsiv', n: 'Mobilya Yenileme e-Arşiv', w: 'Ev sahibinin antika büfe ve sandalyelerinin cila ile yenilenmesi.', lay: 'pastel', pay: 'kart',
                l: [['Ceviz büfe sökme, zımpara ve selülozik cila', 'C62', 1, 8500, 20], ['Sandalye eskitme boya', 'C62', 6, 1100, 20, { RENK: 'Krem eskitme' }], ['Adresten alma ve teslim', 'C62', 1, 900, 20]],
            },
        ],
    },
    {
        code: 'A.05', sector: 'mobilya', icon: 'armchair', c: ['#7c3aed', '#c4b5fd'], f: 'Konfor Döşeme Atölyesi', o: 'Ali Çetin', city: 'Ankara', slogan: 'Koltuk döşeme · kumaş değişimi · sünger', sanayi: true,
        why: 'Döşemeci tüketiciye koltuk döşeme hizmeti (e-Arşiv), kafe-otel gibi işletmelere toplu döşeme (e-Fatura) düzenler. İşletmeye yapılan döşeme işi bakım-onarım niteliğinde değildir; normal KDV ile faturalanır.',
        docs: [
            {
                k: 'arsiv', n: 'Koltuk Döşeme e-Arşiv', w: 'Ev koltuk takımının kumaş ve sünger değişimi; kumaş kartelası satır etiketinde.', lay: 'kart', pay: 'kart',
                l: [['Üçlü koltuk döşeme işçiliği', 'C62', 2, 3200, 20], ['Berjer döşeme işçiliği', 'C62', 2, 1800, 20], ['Döşemelik kumaş — kadife', 'MTR', 18, 520, 20, { RENK: 'Zümrüt yeşili', KATALOG: 'Velvet 214' }], ['D32 yüksek yoğunluk sünger', 'MTK', 6, 780, 20]],
            },
            {
                k: 'fatura', n: 'Kafe Oturma Grubu Döşeme e-Faturası', w: 'Kafe zincirine ait oturma gruplarının deri döşemesi; şube referanslı.', lay: 'modern', to: { f: 'Çekirdek Kahve Gıda A.Ş.', city: 'Ankara' }, pay: 'vade:30',
                l: [['Bench oturma deri döşeme', 'MTR', 14, 4100, 20, { MALZEME: 'Suni deri — yanmaz', RENK: 'Taba' }], ['Sandalye minder döşeme', 'C62', 40, 650, 20], ['Sökme, nakliye ve yerinde montaj', 'C62', 1, 5500, 20]],
                r: [['SIPARIS', 'CKD-SAT-2026-118'], ['ADRES', 'Kızılay Şubesi']],
            },
        ],
    },
    {
        code: 'A.06', sector: 'mobilya', icon: 'bed-double', c: ['#0f766e', '#5eead4'], f: 'İnegöl Masif Mobilya San. Tic. A.Ş.', city: 'Bursa', slogan: 'Masif ahşap mobilya üretimi · 1987', sanayi: true,
        why: 'Mobilya imalatçısı mağazalara ve bayilere toptan satış (e-Fatura + e-İrsaliye) yapar; yurt dışı bayilere ihracat IHRACAT profiliyle gümrük muhataplı faturalanır. Mobilya GTİP 9403 / 9401 başlıklarındadır.',
        docs: [
            {
                k: 'fatura', n: 'Bayiye Toptan Mobilya Faturası', w: 'Mobilya mağazasına yatak odası ve yemek odası takımları toptan satışı; bayi iskontosu satırda.', lay: 'kurumsal', to: { f: 'Aksoy Home Mobilya Ltd. Şti.', city: 'İzmir' }, pay: 'senet:90',
                l: [['Masif meşe yatak odası takımı', 'SET', 4, 98000, 20, { RENK: 'Doğal meşe' }, { disc: { rate: 0.12, reason: 'Bayi iskontosu' } }], ['Masif ceviz yemek odası takımı', 'SET', 3, 86000, 20, {}, { disc: { rate: 0.12, reason: 'Bayi iskontosu' } }], ['TV ünitesi masif', 'C62', 6, 18500, 20]],
                r: [['IRSALIYE', 'IMM2026000004121']],
            },
            {
                k: 'ihracat', n: 'Mobilya İhracat Faturası (FOB)', w: 'Almanya’daki bayiye konteynerle masif mobilya ihracatı; GTİP, kap ve INCOTERMS satırda.', lay: 'serit', to: 'DE', cur: 'EUR', inc: 'FOB', mode: 1, pkg: 'PX',
                l: [['Masif meşe yemek masası', 'C62', 40, 640, 0, {}, { g: '940360100000', kap: 10 }], ['Masif meşe sandalye', 'C62', 240, 92, 0, {}, { g: '940161000000', kap: 20 }], ['Masif meşe konsol', 'C62', 30, 410, 0, {}, { g: '940360900000', kap: 6 }]],
                r: [['KONTEYNER', 'MSCU 482917-3'], ['BEYANNAME', '26160300EX00418273']],
            },
        ],
    },
    {
        code: 'A.07', sector: 'mobilya', icon: 'lamp', c: ['#b45309', '#fcd34d'], f: 'Evim Mobilya Mağazası', o: 'Selim Öztürk', city: 'Antalya', slogan: 'Koltuk · yatak · yemek odası · teslim & kurulum',
        why: 'Mobilya mağazası tüketiciye e-Arşiv (online satışta internet satışı alanlarıyla) düzenler; teslimat kendi aracıyla yapıldığında mal faturadan önce sevk ediliyorsa e-İrsaliye de düzenlenir.',
        docs: [
            {
                k: 'arsiv/net', n: 'Online Mobilya Satışı e-Arşiv (İnternet)', w: 'Web sitesinden kartla satın alınan yatak ve baza; ödeme aracısı ve kargo / nakliye bilgisi GİB internet satışı alanlarında.', lay: 'modern',
                l: [['Ortopedik yatak 160 x 200', 'C62', 1, 14900, 20, { GARANTI: '10 yıl' }], ['Sandıklı baza + başlık 160 x 200', 'SET', 1, 17800, 20, { RENK: 'Bej' }], ['Kurulum hizmeti', 'C62', 1, 0, 20]],
            },
            {
                k: 'irsaliye', n: 'Müşteriye Teslim Sevk İrsaliyesi', w: 'Mağaza deposundan müşteri adresine kendi kamyonetiyle koltuk takımı teslimi.', lay: 'fis', kg: 260, kap: 5,
                l: [['Köşe koltuk takımı (3 modül)', 'SET', 1, 0, 20, { RENK: 'Antrasit' }, { sid: 'KK-ROMA' }], ['Orta sehpa', 'C62', 1, 0, 20, {}, { sid: 'SH-ROMA' }]],
                r: [['SIPARIS', 'EVM-2026-1185']],
            },
        ],
    },
    {
        code: 'A.08', sector: 'enerji', icon: 'flame', c: ['#c2410c', '#fdba74'], f: 'Sıcak Yuva Yakacak', o: 'Osman Doğan', city: 'Erzurum', slogan: 'Kömür · odun · pelet — kapıya teslim',
        why: 'Yakacak satıcısı haneye kömür / odun satışında e-Arşiv düzenler; köylüden odun alımında satıcı belge veremediğinden e-Gider Pusulası kullanılır. Odun (orman ürünü) belirlenmiş alıcıya satılırsa 623 tevkifatı söz konusudur.',
        docs: [
            {
                k: 'arsiv', n: 'Kömür ve Odun Satışı e-Arşiv', w: 'Haneye ithal kömür ve meşe odun teslimi; çuval ve ton bazlı satış.', lay: 'endustri', pay: 'nakit',
                l: [['İthal torba kömür 25 kg (6.500 kcal)', 'BG', 80, 340, 20, { MENSE: 'Kolombiya' }], ['Meşe odun (kuru)', 'TNE', 2, 7200, 20], ['Kapıya teslim ve istifleme', 'C62', 1, 600, 20]],
                nt: ['Kömür, Çevre ve Şehircilik İl Müdürlüğü uygunluk belgeli olup satışı yapılan bölge için izinlidir.'],
            },
            {
                k: 'gider/stopaj:2', n: 'Köylüden Odun Alımı Gider Pusulası', w: 'Kendi arazisinden odun kesen köylüden yakacak odun alımı; GVK 94/13-a gereği %2 stopaj.', lay: 'defter', pay: 'havale',
                l: [['Kuru meşe odunu', 'TNE', 6, 4300, 0], ['Gürgen odunu', 'TNE', 3, 3900, 0]],
                r: [['KANTARFISI', 'KF-26-2207', 'Belediye kantarı']],
            },
        ],
    },
];
