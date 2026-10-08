// I — Pazar, Seyyar
export default [
    {
        code: 'I.01', sector: 'pazar', icon: 'store', c: ['#9333ea', '#f5d0fe'], f: 'Turan Pazar Tekstil', o: 'Ramazan Turan', city: 'İstanbul', slogan: 'Semt pazarı · çorap · iç giyim · ev tekstili',
        why: 'Pazarcıların çoğu basit usul / esnaf muaflığındadır; işletme hesabı esasına geçen pazarcı müşteri talebinde e-Arşiv düzenler. Evinde örgü / dikiş yapan ve GVK 9/6 esnaf muaflığından yararlanan kişilerden alımlar %2 stopajlı e-Gider Pusulası ile belgelenir.',
        docs: [
            {
                k: 'arsiv', n: 'Pazar Tezgâhı Satışı e-Arşiv', w: 'Müşteriye çorap, pijama takımı ve nevresim satışı; müşteri talebiyle düzenlenen belge.', lay: 'fis', pay: 'nakit',
                l: [['Pamuklu çorap (12\'li paket)', 'PA', 2, 180, 20], ['Pijama takımı (kadın)', 'C62', 1, 450, 20, { BEDEN: 'L' }], ['Nevresim takımı (tek kişilik)', 'SET', 1, 650, 20]],
            },
            {
                k: 'gider/stopaj:2', n: 'Ev Hanımından El Örgüsü Alımı Gider Pusulası', w: 'Evinde örgü yapan esnaf muaflığı belgeli kişiden yün çorap ve patik alımı; %2 stopaj.', lay: 'defter', pay: 'nakit',
                l: [['El örgüsü yün çorap', 'PR', 40, 120, 0], ['El örgüsü bebek patiği', 'PR', 30, 90, 0]],
                nt: ['Satıcı GVK 9/6 kapsamında esnaf muaflığı belgesine sahiptir.'],
            },
        ],
    },
    {
        code: 'I.02', sector: 'pazar', icon: 'fish', c: ['#0369a1', '#bae6fd'], f: 'Deniz Pazar Balık ve Fide', o: 'Yusuf Kılıç', city: 'Samsun', slogan: 'Pazarda taze balık · fide · çiçek',
        why: 'Pazarda balık satan tezgâhçı talep halinde e-Arşiv düzenler (taze balıkta indirimli KDV oranı); balığı doğrudan ruhsatlı balıkçıdan alıyorsa e-Müstahsil Makbuzu (hayvansal ürün %1 stopaj) kullanır. Halden alınan ürünler HKS künyeli belgeyle gelir.',
        docs: [
            {
                k: 'arsiv', n: 'Pazarda Balık Satışı e-Arşiv', w: 'Müşteriye hamsi, istavrit ve temizlik hizmeti.', lay: 'fis', pay: 'nakit',
                l: [['Hamsi (taze)', 'KGM', 2, 160, 1], ['İstavrit', 'KGM', 1, 220, 1], ['Domates fidesi (viyol)', 'C62', 2, 90, 1]],
            },
            {
                k: 'mustahsil/hayvan', n: 'Balıkçıdan Av Alımı e-Müstahsil', w: 'Ruhsatlı küçük balıkçı teknesinden sabah avı alımı; %1 GV stopajı ve Bağ-Kur kesintisi.', lay: 'endustri',
                l: [['Hamsi (taze)', 'KGM', 260, 95, 0], ['İstavrit', 'KGM', 80, 130, 0]],
                r: [['TEKNE', 'Yıldız Reis — 55-SM-0418'], ['RUHSAT', 'SÜR-55-2026-1182', 'Su ürünleri ruhsat tezkeresi']],
            },
        ],
    },
    {
        code: 'I.03', sector: 'pazar', icon: 'shopping-basket', c: ['#c2410c', '#fed7aa'], f: 'Bereket Pazar Züccaciye', o: 'Emine Aslan', city: 'Bursa', slogan: 'Pazarda mutfak eşyası · oyuncak · ikinci el',
        why: 'Pazarda çeşitli mal satan esnaf talep halinde e-Arşiv düzenler; bit pazarı tezgâhları için vatandaştan belge alınamayan ikinci el eşya alımları e-Gider Pusulası ile belgelenir (nihai tüketicinin kendi eşyası için stopaj yoktur).',
        docs: [
            {
                k: 'arsiv', n: 'Pazarda Mutfak Eşyası Satışı e-Arşiv', w: 'Müşteriye tencere, saklama kabı ve oyuncak satışı.', lay: 'fis', pay: 'nakit',
                l: [['Çelik tencere 5 lt', 'C62', 1, 450, 20], ['Plastik saklama kabı seti', 'SET', 2, 120, 20], ['Oyuncak araba (sürtmeli)', 'C62', 1, 90, 20]],
            },
            {
                k: 'gider', n: 'Vatandaştan İkinci El Eşya Alımı Gider Pusulası', w: 'Bit pazarı tezgâhı için vatandaştan eski bakır ve plak alımı.', lay: 'defter', pay: 'nakit',
                l: [['Eski bakır sahan (kullanılmış)', 'C62', 6, 150, 0], ['Taş plak (45\'lik)', 'C62', 40, 25, 0]],
            },
        ],
    },
    {
        code: 'I.04', sector: 'pazar', icon: 'cherry', c: ['#16a34a', '#fecaca'], f: 'Yeşil Tezgâh Manav', o: 'Hatice Doğan', city: 'İzmir', slogan: 'Semt pazarında sebze · meyve · zeytin',
        why: 'Pazarcı manav talep halinde e-Arşiv düzenler (yaş sebze-meyvede indirimli KDV). Üreticiden doğrudan alımda e-Müstahsil (bitkisel ürün %2 stopaj) düzenler; halden / komisyoncudan aldığı ürün HKS künyeli e-Fatura ile gelir ve künye no satışta izlenebilirlik için saklanır.',
        docs: [
            {
                k: 'arsiv', n: 'Pazarda Sebze-Meyve Satışı e-Arşiv', w: 'Müşteriye domates, biber, üzüm ve zeytin satışı.', lay: 'fis', pay: 'nakit',
                l: [['Domates', 'KGM', 3, 35, 1], ['Sivri biber', 'KGM', 1, 60, 1], ['Çekirdeksiz üzüm', 'KGM', 2, 70, 1], ['Siyah zeytin (gemlik)', 'KGM', 1, 320, 1]],
            },
            {
                k: 'mustahsil/bitki', n: 'Üreticiden Domates Alımı e-Müstahsil', w: 'Bahçe sahibi üreticiden doğrudan domates ve biber alımı; %2 stopaj ve Bağ-Kur kesintisi.', lay: 'defter',
                l: [['Domates (sofralık)', 'KGM', 600, 18, 0], ['Sivri biber', 'KGM', 150, 32, 0]],
                r: [['CKS', 'ÇKS-35-2026-44812']],
            },
        ],
    },
    {
        code: 'I.05', sector: 'pazar', icon: 'milk', c: ['#ca8a04', '#fef9c3'], f: 'Köy Ürünleri Pazar Tezgâhı', o: 'Ayşe Polat', city: 'Balıkesir', slogan: 'Köy peyniri · zeytinyağı · bal · yumurta',
        why: 'Pazarda gıda satan tezgâhçı talep halinde e-Arşiv düzenler; ürünlere göre KDV oranı farklılaşır (temel gıda %1, işlenmiş gıda %10). Köydeki üreticiden peynir, bal ve yumurta alımları e-Müstahsil Makbuzu (hayvansal ürün %1 stopaj) ile belgelenir.',
        docs: [
            {
                k: 'arsiv', n: 'Pazarda Köy Ürünü Satışı e-Arşiv', w: 'Müşteriye peynir, yumurta, zeytinyağı ve bal satışı; farklı KDV oranları aynı belgede.', lay: 'pastel', pay: 'nakit',
                l: [['Ezine tipi beyaz peynir', 'KGM', 1, 420, 1], ['Köy yumurtası (30\'lu)', 'C62', 1, 210, 1], ['Natürel sızma zeytinyağı 1 lt', 'C62', 2, 480, 10], ['Çiçek balı 850 g', 'C62', 1, 380, 10]],
            },
            {
                k: 'mustahsil/hayvan', n: 'Köylüden Peynir ve Yumurta Alımı e-Müstahsil', w: 'Köydeki üreticiden beyaz peynir ve yumurta alımı; %1 GV stopajı.', lay: 'defter',
                l: [['Beyaz peynir (teneke)', 'KGM', 68, 290, 0], ['Köy yumurtası', 'C62', 900, 5.5, 0]],
            },
        ],
    },
    {
        code: 'I.06', sector: 'pazar', icon: 'caravan', c: ['#e11d48', '#fde68a'], f: 'Lezzet Durağı Seyyar Gıda', o: 'Emre Kurt', city: 'İstanbul', slogan: 'Food truck · etkinlik ikramı · seyyar satış',
        why: 'Seyyar / food truck işletmesi bireysel müşteriye talep halinde e-Arşiv düzenler; şirket etkinliklerine verdiği yemek ikramı yemek servis hizmeti sayılır ve belirlenmiş alıcılara 604 kodlu 5/10 KDV tevkifatlı e-Fatura ile faturalanır.',
        docs: [
            {
                k: 'arsiv', n: 'Food Truck Satışı e-Arşiv', w: 'Müşteriye dürüm, patates ve içecek satışı.', lay: 'fis', pay: 'kart',
                l: [['Tavuk dürüm', 'C62', 2, 180, 10], ['Patates kızartması', 'C62', 1, 90, 10], ['Ayran', 'C62', 2, 35, 10]],
            },
            {
                k: 'fatura/tevkifat:604', n: 'Şirket Etkinliğine Food Truck İkramı (Tevkifat 604)', w: 'Teknoloji şirketinin yerleşke şenliğinde 250 kişilik food truck ikramı; 5/10 tevkifat.', lay: 'modern', to: { f: 'Boğaziçi Yazılım Teknolojileri A.Ş.', city: 'İstanbul' }, pay: 'vade:15',
                per: ['2026-09-25', '12:00:00', 'Yerleşke şenliği'],
                l: [['Food truck ikram menüsü (kişi)', 'C62', 250, 260, 10], ['Araç ve personel (yarım gün)', 'C62', 1, 6000, 20]],
            },
        ],
    },
];
