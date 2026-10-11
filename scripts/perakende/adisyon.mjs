// Perakende satışta adisyon tarzı e-Arşiv faturalar (lokanta, kafe, pastane, paket servis, dondurmacı ...).
// Yiyecek ve alkolsüz içecekte %10, alkollü içecek ve gıda dışı ürünlerde %20 KDV. Satır fiyatları menüdeki
// KDV dahil fiyattan hesaplanır (M); servis ücreti / kuver alınmaz.
import { adr, kisi, nihai, firma, L, isk, R } from './fx.mjs';

const r2 = (n) => Math.round(n * 100 + 1e-7) / 100;
/**
 * Menü satırı: KDV dahil menü fiyatından birim fiyat (KDV hariç). Satır matrahı ile yuvarlanmış KDV'nin toplamı
 * menü tutarına (miktar × menü fiyatı) kuruşu kuruşuna eşit olacak matrah seçilir.
 */
const M = (name, unit, qty, menu, kdv, props = {}, x = {}) => {
    const gross = r2(qty * menu);
    const base = r2(gross / (1 + kdv / 100));
    const net = [0, -0.01, 0.01, -0.02, 0.02].map((d) => r2(base + d)).find((n) => r2(n + r2((n * kdv) / 100)) === gross);
    if (net === undefined) throw new Error(`${name}: ${qty} × ${menu} için KDV dahil tutarı tutan matrah yok; menü fiyatını değiştirin.`);
    const price = Math.round((net / qty) * 1e6) / 1e6;
    if (r2(qty * price) !== net) throw new Error(`${name}: birim fiyat yuvarlaması matrahı bozuyor.`);
    return L(name, unit, qty, price, kdv, props, x);
};
const KART = (date, note) => ({ code: '48', due: date, note });
const NAKIT = (date, note = 'Nakit') => ({ code: '10', due: date, note });

export default [
    /* -------------------------------------------------------------- A1 */
    {
        id: 'adisyon-esnaf-lokantasi-arsiv', sector: 'perakende', doc: 'arsiv', layout: 'ad-klasik', footer: 'Asıl · Müşteri nüshası',
        name: 'Esnaf Lokantası Adisyonu e-Arşiv (Garson Bloknotu)',
        description: 'Esnaf lokantaları için karbonlu garson bloknotu görünümlü adisyon e-Arşiv: kırmızı seri numaralı adisyon, masa / garson / kişi kutuları, tükenmez kalemle yazılmış ADET–CİNSİ–FİYATI–TUTARI satırları, ikram, "Ödendi" mührü ve %10 KDV dökümü.',
        tags: ['Adisyon', 'Garson bloknotu', 'Masa / garson', '%10 KDV', 'İkram'],
        theme: { a: '#166534', b: '#14532d', t: '#ecf7e6', ink: '#1f2937', soft: '#4b5563', line: '#b7d7a8', on: '#ffffff', bg: '#9a7350', hf: 'hand', bf: 'sans' },
        logo: { icon: 'tabak', shape: 'circle', bg: '#166534', fg: '#ffffff' },
        tagline: 'Ev yemekleri · Sulu yemek · 1968’den beri',
        data: {
            id: 'LKN2026000184203', date: '2026-10-09', time: '13:12:00',
            notes: ['Fiyatlarımıza KDV dahildir. Servis ücreti alınmaz.'],
            supplier: firma('6120458831', 'Ustaoğlu Esnaf Lokantası Ltd. Şti.', adr('Hacı Bayram Mah. Çankırı Cad.', '17', 'Altındağ', 'Ankara', '06050'), 'Ulus', '0312 311 40 68', 'ustaoglu@example.com'),
            customer: kisi('34871206514', 'Serkan', 'Ateş', adr('Anafartalar Mah. Posta Cad.', '8/4', 'Altındağ', 'Ankara', '06050'), '0532 418 27 09'),
            payment: NAKIT('2026-10-09'),
            docs: [R('ADISYON', '0412', '2026-10-09'), R('MASA', '7', '2026-10-09', 'Salon'), R('GARSON', 'Mehmet', '2026-10-09'), R('KISI', '3', '2026-10-09')],
            lines: [
                M('Mercimek Çorbası', 'PTN', 3, 90, 10),
                M('Kuru Fasulye', 'PTN', 2, 160, 10),
                M('Pirinç Pilavı', 'PTN', 2, 70, 10),
                M('İzmir Köfte', 'PTN', 1, 240, 10, {}, { note: 'Patatesi bol' }),
                M('Cacık', 'PTN', 2, 60, 10),
                M('Ayran', 'C62', 3, 35, 10),
                M('Fırın Sütlaç', 'C62', 1, 95, 10, {}, isk(1, 'Müessese ikramı')),
                M('Çay', 'C62', 3, 25, 10),
            ],
        },
    },
    /* -------------------------------------------------------------- A2 */
    {
        id: 'adisyon-kahve-gel-al-arsiv', sector: 'perakende', doc: 'arsiv', layout: 'ad-kahve', footer: 'İYİ KAHVELER · İYİ GÜNLER',
        name: 'Kahve Dükkânı Gel-Al Adisyonu e-Arşiv (Kraft Fiş)',
        description: 'Üçüncü dalga kahveciler için kraft kâğıt fiş görünümlü adisyon e-Arşiv: iri sipariş numarası, barista ve gel-al bilgisi, bardak boyu rozeti, süt / şurup / shot seçimleri, sadakat kartı damgaları ve %10 / %20 karışık KDV.',
        tags: ['Adisyon', 'Gel-al', 'Sipariş no', 'Sadakat kartı', '%10 / %20 KDV'],
        theme: { a: '#9a3412', b: '#3b2516', t: '#f5e9d3', ink: '#3b2516', soft: '#6b4f3a', line: '#d6bf98', bg: '#2b1d14', hf: 'century', bf: 'mono' },
        logo: { icon: 'fincan', shape: 'circle', bg: '#3b2516', fg: '#f3e3c4' },
        tagline: 'Specialty coffee · Roastery',
        data: {
            id: 'KHV2026000058911', date: '2026-10-10', time: '08:41:00',
            notes: ['Fiyatlarımıza KDV dahildir.'],
            supplier: firma('2950316742', 'Kavrul Kahve Kavurma ve Gıda A.Ş.', adr('Caferağa Mah. Moda Cad.', '112/A', 'Kadıköy', 'İstanbul', '34710'), 'Kadıköy', '0216 330 47 12', 'merhaba@kavrul.example.com', 'www.kavrul.example.com'),
            customer: kisi('51406382270', 'Ece', 'Durmaz', adr('Osmanağa Mah. Kuşdili Cad.', '24/6', 'Kadıköy', 'İstanbul', '34714'), '0541 762 30 18', 'ece.durmaz@example.com'),
            payment: KART('2026-10-10', 'Kredi kartı · temassız'),
            docs: [
                R('SIPARIS', '47', '2026-10-10'), R('SERVIS', 'Gel-al', '2026-10-10'), R('GARSON', 'Eda', '2026-10-10'), R('ADISYON', 'K-2210', '2026-10-10'),
                R('SADAKAT', '7', '2026-10-10', 'Kart LB-2210 · 3 kahve daha, 10. kahve bizden.'),
            ],
            lines: [
                M('Flat White', 'C62', 1, 135, 10, { BOY: 'M', SUT: 'Yulaf sütü', SHOT: 'Çift shot' }),
                M('Iced Latte', 'C62', 1, 145, 10, { BOY: 'L', SUT: 'Laktozsuz', SURUP: 'Karamel' }, { note: 'Az buz' }),
                M('Filtre Kahve · Etiyopya Guji', 'C62', 1, 120, 10, { BOY: 'S' }, { desc: 'V60 demleme · 18 g / 300 ml' }),
                M('Cortado', 'C62', 1, 95, 10, { BOY: 'S' }),
                M('Tarçınlı Rulo', 'C62', 2, 110, 10, {}, { note: 'Isıtılarak' }),
                M('Paslanmaz Termos Bardak 350 ml', 'C62', 1, 690, 20, {}, isk(0.15, 'Sadakat kartı %15')),
            ],
        },
    },
    /* -------------------------------------------------------------- A3 */
    {
        id: 'adisyon-pastane-siparis-arsiv', sector: 'perakende', doc: 'arsiv', layout: 'ad-pastane',
        name: 'Pastane Sipariş Adisyonu e-Arşiv (Dantel Tabak)',
        description: 'Pastaneler için dantel tabak başlıklı sipariş adisyonu e-Arşiv: sipariş ve teslim saati, pasta üzerine yazı kartı, Pastalar / Kuru pasta / Ekstralar grupları, kilogramla baklava, alerji notu ve mum setinde %20 KDV ile kampanya indirimi.',
        tags: ['Adisyon', 'Pasta siparişi', 'Pasta yazısı', 'Kg ile satış', '%10 / %20 KDV'],
        theme: { a: '#db2777', b: '#9d174d', t: '#fdf2f8', ink: '#3f1d2e', soft: '#8a5a70', line: '#f5d0e1', bg: '#fdf2f8', hf: 'palatino', bf: 'sans' },
        logo: { icon: 'pasta', shape: 'circle', bg: '#db2777', fg: '#ffffff' },
        tagline: 'Pastane · Baklava · Butik pasta',
        data: {
            id: 'PST2026000031746', date: '2026-10-10', time: '11:05:00',
            notes: ['Fiyatlarımıza KDV dahildir. Yaş pastalar +4 °C’de saklanmalıdır.'],
            supplier: firma('7340925518', 'Gülbahçe Pastacılık Gıda San. Tic. Ltd. Şti.', adr('Alsancak Mah. Kıbrıs Şehitleri Cad.', '58', 'Konak', 'İzmir', '35220'), 'Kordon', '0232 463 18 55', 'siparis@gulbahce.example.com', 'www.gulbahce.example.com'),
            customer: kisi('28630174952', 'Merve', 'Kaplan', adr('Alsancak Mah. 1453 Sok.', '12/3', 'Konak', 'İzmir', '35220'), '0533 205 61 47', 'merve.kaplan@example.com'),
            payment: KART('2026-10-10', 'Banka kartı · sipariş anında'),
            docs: [
                R('SIPARIS', 'P-1186', '2026-10-10'), R('TESLIM', '17:30', '2026-10-10', 'Mağazadan teslim'), R('GARSON', 'Selin', '2026-10-10'),
                R('ADISYON', 'PS-1186', '2026-10-10'), R('PASTAYAZI', 'İyi ki doğdun Defne!', '2026-10-10', 'Beyaz çikolata yazı · gül krema süsleme · 7 mum'),
            ],
            lines: [
                M('Çilekli Yaş Pasta (12 kişilik)', 'C62', 1, 1450, 10, { GRUP: 'Pastalar', OLCU: 'Ø 26 cm' }, { note: 'Fındıksız — alerji' }),
                M('Profiterol Kase', 'C62', 2, 160, 10, { GRUP: 'Pastalar' }),
                M('Fıstıklı Baklava', 'KGM', 1.2, 1300, 10, { GRUP: 'Baklava & Kuru Pasta' }, { desc: 'Antep fıstığı · hediye kutusu' }),
                M('Tuzlu Kurabiye', 'KGM', 0.5, 480, 10, { GRUP: 'Baklava & Kuru Pasta' }),
                M('Doğum Günü Mum Seti (7 adet)', 'C62', 1, 60, 20, { GRUP: 'Ekstralar' }, isk(0.2, 'Pasta siparişine %20')),
                M('Pasta Süsü Rakam Mum "7"', 'C62', 1, 90, 20, { GRUP: 'Ekstralar' }),
            ],
        },
    },
    /* -------------------------------------------------------------- A4 */
    {
        id: 'adisyon-ocakbasi-kebap-arsiv', sector: 'perakende', doc: 'arsiv', layout: 'ad-ocakbasi',
        name: 'Ocakbaşı Kebap Adisyonu e-Arşiv (Izgara Başlık)',
        description: 'Kebapçı ve ocakbaşı restoranları için ızgara ve köz parıltılı başlıklı adisyon e-Arşiv: iri masa kartı, Mezeler / Izgaralar / Ara sıcaklar / İçecekler / Tatlı grupları iki sütunda, "acısız" mutfak notları, ikramlar ve kişi başı tutar.',
        tags: ['Adisyon', 'Masa kartı', 'Grup başlıkları', 'Kişi başı', 'İkram'],
        theme: { a: '#ea580c', b: '#9a3412', t: '#fff7ed', ink: '#1c1917', soft: '#78716c', line: '#e7d9c5', bg: '#44403c', bf: 'sans' },
        logo: { icon: 'ates', shape: 'hex', bg: '#ea580c', fg: '#ffffff' },
        tagline: 'Ocakbaşı · Kebap · Lahmacun',
        data: {
            id: 'OCK2026000247718', date: '2026-10-09', time: '21:36:00',
            notes: ['Fiyatlarımıza KDV dahildir. Servis ücreti alınmaz.'],
            supplier: firma('4180673295', 'Közde Ocakbaşı Restoran Gıda Ltd. Şti.', adr('Şehitkamil Mah. Prof. Dr. Necmettin Erbakan Cad.', '41', 'Şehitkamil', 'Gaziantep', '27060'), 'Şehitkamil', '0342 323 77 41', 'rezervasyon@kozde.example.com'),
            customer: kisi('40217958360', 'Burak', 'Yılmazer', adr('İncilipınar Mah. Muammer Aksoy Bulv.', '19/7', 'Şehitkamil', 'Gaziantep', '27090'), '0544 318 92 05'),
            payment: KART('2026-10-09', 'Kredi kartı · masada POS'),
            docs: [R('ADISYON', 'O-7731', '2026-10-09'), R('MASA', 'O-3', '2026-10-09', 'Ocak başı'), R('GARSON', 'Ramazan', '2026-10-09'), R('KISI', '4', '2026-10-09')],
            lines: [
                M('Acılı Ezme', 'PTN', 2, 120, 10, { GRUP: 'Mezeler' }, { note: 'Az acılı' }),
                M('Haydari', 'PTN', 1, 120, 10, { GRUP: 'Mezeler' }),
                M('Humus', 'PTN', 1, 140, 10, { GRUP: 'Mezeler' }),
                M('Lahmacun', 'C62', 4, 110, 10, { GRUP: 'Ara Sıcaklar' }),
                M('İçli Köfte', 'C62', 4, 75, 10, { GRUP: 'Ara Sıcaklar' }),
                M('Adana Kebap', 'PTN', 2, 420, 10, { GRUP: 'Izgaralar' }, { note: 'Acısız istendi' }),
                M('Urfa Kebap', 'PTN', 1, 420, 10, { GRUP: 'Izgaralar' }),
                M('Kuzu Şiş', 'PTN', 1, 520, 10, { GRUP: 'Izgaralar' }, { note: 'Orta pişmiş' }),
                M('Patlıcan Kebabı', 'PTN', 1, 480, 10, { GRUP: 'Izgaralar' }, { desc: 'Közde patlıcan, kuzu kıyma' }),
                M('Yayık Ayran', 'C62', 4, 45, 10, { GRUP: 'İçecekler' }),
                M('Şalgam', 'C62', 2, 45, 10, { GRUP: 'İçecekler' }, { note: 'Acılı' }),
                M('Künefe', 'PTN', 2, 220, 10, { GRUP: 'Tatlı & Çay' }, isk(0.5, '1 porsiyon ikram')),
                M('Çay', 'C62', 4, 20, 10, { GRUP: 'Tatlı & Çay' }, isk(1, 'Çay ikramı')),
            ],
        },
    },
    /* -------------------------------------------------------------- A5 */
    {
        id: 'adisyon-balik-restoran-arsiv', sector: 'perakende', doc: 'arsiv', layout: 'ad-balik',
        name: 'Balık Restoranı Adisyonu e-Arşiv (Dalga & Halat)',
        description: 'Balık restoranları ve meyhaneler için lacivert dalga başlıklı adisyon e-Arşiv: masa kartı (teras / deniz tarafı), tezgâhtan kilogramla balık, alkollü içecekte %20 / yemekte %10 KDV dökümü, ev ikramı ve kişi başı tutar.',
        tags: ['Adisyon', 'Kg ile balık', '%10 / %20 KDV', 'Masa kartı', 'Kişi başı'],
        theme: { a: '#13315c', b: '#0b2545', t: '#eef3f8', ink: '#0f172a', soft: '#5b6474', line: '#d9cfb8', bg: '#8da9c4', bf: 'serif' },
        logo: { icon: 'balik', shape: 'circle', bg: '#d4b483', fg: '#0b2545' },
        tagline: 'Balık · Meze · Rakı sofrası',
        data: {
            id: 'BLK2026000093355', date: '2026-10-10', time: '23:18:00',
            notes: ['Fiyatlarımıza KDV ve ÖTV dahildir. Servis ücreti alınmaz.'],
            supplier: firma('8306152947', 'Mavi Liman Balık Restoran İşletmeciliği A.Ş.', adr('Kuruçeşme Mah. Muallim Naci Cad.', '64', 'Beşiktaş', 'İstanbul', '34345'), 'Beşiktaş', '0212 263 51 90', 'rezervasyon@maviliman.example.com', 'www.maviliman.example.com'),
            customer: kisi('19584376022', 'Okan', 'Demirtaş', adr('Arnavutköy Mah. Beyazgül Sok.', '3/2', 'Beşiktaş', 'İstanbul', '34345'), '0535 640 18 72', 'okan.demirtas@example.com'),
            payment: KART('2026-10-10', 'Kredi kartı · tek çekim'),
            docs: [R('ADISYON', 'B-5520', '2026-10-10'), R('MASA', 'T-14', '2026-10-10', 'Teras · deniz tarafı'), R('GARSON', 'Kemal', '2026-10-10'), R('KISI', '4', '2026-10-10')],
            lines: [
                M('Deniz Börülcesi', 'PTN', 1, 180, 10, { GRUP: 'Soğuk Mezeler' }),
                M('Atom', 'PTN', 1, 150, 10, { GRUP: 'Soğuk Mezeler' }),
                M('Lakerda', 'PTN', 1, 380, 10, { GRUP: 'Soğuk Mezeler' }),
                M('Fava', 'PTN', 1, 160, 10, { GRUP: 'Soğuk Mezeler' }),
                M('Kalamar Tava', 'PTN', 1, 420, 10, { GRUP: 'Ara Sıcaklar' }),
                M('Karides Güveç', 'PTN', 1, 480, 10, { GRUP: 'Ara Sıcaklar' }, { note: 'Kaşarsız' }),
                M('Levrek Izgara', 'KGM', 1.1, 1600, 10, { GRUP: 'Tezgâhtan' }, { desc: 'Tezgâhtan seçildi · 2 adet' }),
                M('Çupra Buğulama', 'KGM', 0.8, 1500, 10, { GRUP: 'Tezgâhtan' }),
                M('Rakı 70 cl', 'C62', 1, 2200, 20, { GRUP: 'İçecekler' }),
                M('Soda', 'C62', 3, 40, 10, { GRUP: 'İçecekler' }),
                M('İrmik Helvası', 'PTN', 1, 150, 10, { GRUP: 'Tatlı' }, isk(1, 'Ev ikramı')),
            ],
        },
    },
    /* -------------------------------------------------------------- A6 */
    {
        id: 'adisyon-paket-pizza-arsiv', sector: 'perakende', doc: 'arsiv', layout: 'ad-paket',
        name: 'Paket Servis Pizza Adisyonu e-Arşiv (Kutu Etiketi)',
        description: 'Pizzacılar ve paket servis yapan restoranlar için damalı bantlı pizza kutusu görünümlü adisyon e-Arşiv: sipariş numarası ve kanalı, teslimat adresi ve adres notu, sipariş → kurye → tahmini teslim akışı, hazırlandı işaretli satırlar, kampanya indirimi ve kapıda ödeme kutusu.',
        tags: ['Adisyon', 'Paket servis', 'Teslimat adresi', 'Kurye', 'Kapıda ödeme'],
        theme: { a: '#b91c1c', b: '#7f1d1d', t: '#fef2f2', ink: '#1f2937', soft: '#6b7280', line: '#e5e7eb', bg: '#c9a57d', bf: 'sans' },
        logo: { icon: 'pizza', shape: 'circle', bg: '#b91c1c', fg: '#ffffff' },
        tagline: 'Taş fırın pizza · Paket servis',
        data: {
            id: 'PZA2026000127403', date: '2026-10-10', time: '19:41:00',
            notes: ['Fiyatlarımıza KDV dahildir. Afiyet olsun!'],
            supplier: firma('5627093184', 'Fırıncı Pizza Gıda Ltd. Şti.', adr('Atatürk Mah. Ataşehir Bulv.', '28/B', 'Ataşehir', 'İstanbul', '34758'), 'Kozyatağı', '0216 455 31 27', 'siparis@firinci.example.com', 'www.firinci.example.com'),
            customer: kisi('63019482756', 'Deniz', 'Aksu', adr('Barbaros Mah. Mor Sümbül Sok.', '7/B-12', 'Ataşehir', 'İstanbul', '34746'), '0532 907 14 63'),
            payment: KART('2026-10-10', 'Kapıda kredi kartı (mobil POS)'),
            delivery: { date: '2026-10-10', time: '19:58:00', addr: adr('Barbaros Mah. Mor Sümbül Sok.', '7/B-12', 'Ataşehir', 'İstanbul', '34746') },
            docs: [
                R('SIPARIS', '3127', '2026-10-10'), R('KANAL', 'Telefon', '2026-10-10', 'Paket servis hattı'), R('KURYE', 'Burak T.', '2026-10-10', 'Motokurye · 34 FPZ 127'),
                R('TESLIM', '20:25', '2026-10-10'), R('ADRESNOT', 'Site girişi B blok; zil çalışmıyor, lütfen arayın.', '2026-10-10'), R('ADISYON', 'PK-3127', '2026-10-10'),
            ],
            lines: [
                M('Margherita Pizza (Orta, 30 cm)', 'C62', 1, 380, 10, {}, { desc: 'Domates sos, mozzarella, fesleğen' }),
                M('Karışık Pizza (Büyük, 36 cm)', 'C62', 1, 520, 10, {}, { desc: 'Sucuk, sosis, mantar, biber, zeytin', note: 'Zeytinsiz', ...isk(0.3, '2. pizza %30 kampanya') }),
                M('Sarımsaklı Ekmek', 'C62', 1, 120, 10),
                M('Tavuk Kanat (8 adet)', 'C62', 1, 260, 10, {}, { note: 'Acı sos ayrı paket' }),
                M('Kola 1 L', 'C62', 2, 70, 10),
                M('Tiramisu', 'C62', 1, 150, 10),
            ],
        },
    },
    /* -------------------------------------------------------------- A7 */
    {
        id: 'adisyon-kiosk-burger-arsiv', sector: 'perakende', doc: 'arsiv', layout: 'ad-kiosk',
        name: 'Burger Kiosk Sipariş Adisyonu e-Arşiv (LED Ekran)',
        description: 'Food court ve hızlı servis restoranları için LED ekran sipariş numaralı adisyon e-Arşiv: çağrı cihazı numarası, kiosk bilgisi, Restoranda / Gel-al seçimi, menü içerikli ürün kartları (boy, içecek, sos), kupon indirimi.',
        tags: ['Adisyon', 'Self servis kiosk', 'Çağrı cihazı', 'Menü kartları', 'Kupon'],
        theme: { a: '#dc2626', b: '#991b1b', t: '#fef3c7', ink: '#111827', soft: '#6b7280', line: '#e5e7eb', bg: '#111827', bf: 'sans' },
        logo: { icon: 'burger', shape: 'square', bg: '#fbbf24', fg: '#111827' },
        tagline: 'Smash burger · Food court',
        data: {
            id: 'BRG2026000412886', date: '2026-10-11', time: '13:27:00',
            notes: ['Fiyatlarımıza KDV dahildir.'],
            supplier: firma('9013648275', 'Kızgın Tava Hızlı Servis Gıda A.Ş.', adr('Kızılırmak Mah. Ufuk Üniversitesi Cad.', '1/Z-41', 'Çankaya', 'Ankara', '06510'), 'Çankaya', '0312 219 01 28', 'destek@kizgintava.example.com', 'www.kizgintava.example.com'),
            customer: nihai(adr('Kızılırmak Mah. Ufuk Üniversitesi Cad.', '1', 'Çankaya', 'Ankara', '06510')),
            payment: KART('2026-10-11', 'Kiosk · temassız kart'),
            docs: [
                R('SIPARIS', '128', '2026-10-11'), R('CAGRI', '23', '2026-10-11', 'Cihaz titreşince teslim noktasına gelin'), R('KIOSK', 'K-04', '2026-10-11'),
                R('SERVIS', 'Restoranda', '2026-10-11'), R('ADISYON', 'FC-128', '2026-10-11'),
            ],
            lines: [
                M('Double Smash Cheeseburger Menü', 'C62', 1, 365, 10, { BOY: 'Orta menü', ICECEK: 'Ayran', SOS: 'Barbekü' }, { desc: 'Burger + orta patates + içecek' }),
                M('Çıtır Tavuk Burger Menü', 'C62', 1, 320, 10, { BOY: 'Büyük menü', ICECEK: 'Kola Zero' }, { desc: 'Burger + büyük patates + içecek', note: 'Turşusuz' }),
                M('Çocuk Menüsü', 'C62', 1, 230, 10, { ICECEK: 'Meyve suyu' }, { desc: 'Mini burger + küçük patates + oyuncak' }),
                M('Soğan Halkası (8’li)', 'C62', 1, 95, 10, { SOS: 'Ranch' }),
                M('Sufle', 'C62', 2, 90, 10, {}, isk(0.25, 'Uygulama kuponu: 2. sufle %50')),
                M('Ekstra Sos', 'C62', 2, 15, 10, { SOS: 'Acı mayonez' }),
            ],
        },
    },
    /* -------------------------------------------------------------- A8 */
    {
        id: 'adisyon-serpme-kahvalti-arsiv', sector: 'perakende', doc: 'arsiv', layout: 'ad-kahvalti',
        name: 'Serpme Kahvaltı Adisyonu e-Arşiv (Kareli Örtü)',
        description: 'Kahvaltı salonları ve köy kahvaltıcıları için kareli masa örtüsü üzerinde tabak başlıklı adisyon e-Arşiv: masa (bahçe) ve kişi sayısı rozetleri, kişi başı tutar, Serpme / Sıcaklar / İçecekler grupları iki sütunda, mutfak notları ve ikram.',
        tags: ['Adisyon', 'Kahvaltı', 'Kişi başı', 'Masa rozetleri', 'İkram'],
        theme: { a: '#b45309', b: '#92400e', t: '#fef3c7', ink: '#292524', soft: '#78716c', line: '#e7dcc8', bg: '#fca5a5', hf: 'hand', bf: 'sans' },
        logo: { icon: 'cay', shape: 'circle', bg: '#b45309', fg: '#ffffff' },
        tagline: 'Köy kahvaltısı · Bahçe',
        data: {
            id: 'KHT2026000066120', date: '2026-10-11', time: '11:48:00',
            notes: ['Fiyatlarımıza KDV dahildir. Servis ücreti alınmaz.'],
            supplier: firma('3709815426', 'Bağ Evi Kahvaltı ve Gıda Ltd. Şti.', adr('Beylerbeyi Mah. Abdullah Ağa Cad.', '33', 'Üsküdar', 'İstanbul', '34676'), 'Üsküdar', '0216 318 62 40', 'merhaba@bagevi.example.com'),
            customer: kisi('72540163988', 'Aslı', 'Şahin', adr('Kuzguncuk Mah. İcadiye Cad.', '15/1', 'Üsküdar', 'İstanbul', '34674'), '0536 211 74 30', 'asli.sahin@example.com'),
            payment: KART('2026-10-11', 'Kredi kartı · masada POS'),
            docs: [R('ADISYON', 'KH-0905', '2026-10-11'), R('MASA', 'B-6', '2026-10-11', 'Bahçe'), R('GARSON', 'Zeynep', '2026-10-11'), R('KISI', '4', '2026-10-11')],
            lines: [
                M('Serpme Kahvaltı (kişi başı)', 'PTN', 4, 650, 10, { GRUP: 'Serpme' }, { desc: '5 çeşit peynir, zeytin, bal-kaymak, reçeller, söğüş, simit, pişi' }),
                M('Bal-Kaymak (ilave)', 'PTN', 1, 180, 10, { GRUP: 'Serpme' }),
                M('Sucuklu Yumurta (sahan)', 'PTN', 2, 220, 10, { GRUP: 'Sıcaklar' }, { note: 'Biri az pişmiş' }),
                M('Menemen', 'PTN', 1, 200, 10, { GRUP: 'Sıcaklar' }, { note: 'Soğanlı' }),
                M('Patates Kızartması', 'PTN', 1, 150, 10, { GRUP: 'Sıcaklar' }),
                M('Demlik Çay (sınırsız)', 'C62', 4, 60, 10, { GRUP: 'İçecekler' }),
                M('Taze Portakal Suyu', 'C62', 2, 110, 10, { GRUP: 'İçecekler' }),
                M('Türk Kahvesi', 'C62', 2, 90, 10, { GRUP: 'İçecekler' }, isk(1, 'Kahve ikramı')),
            ],
        },
    },
    /* -------------------------------------------------------------- A9 */
    {
        id: 'adisyon-maras-dondurma-arsiv', sector: 'perakende', doc: 'arsiv', layout: 'ad-dondurma',
        name: 'Maraş Dondurması Adisyonu e-Arşiv (Külah & Toplar)',
        description: 'Dondurmacılar için renkli dondurma topları ve waffle külah bantlı adisyon e-Arşiv: top sayısı rozetleri, aroma etiketleri, külah / kap / kilogramla eve paket satış, hafta içi indirim ve termo kutuda %20 KDV.',
        tags: ['Adisyon', 'Top sayısı', 'Aromalar', 'Kg ile satış', '%10 / %20 KDV'],
        theme: { a: '#db2777', b: '#0f766e', t: '#fdf2f8', ink: '#1f2937', soft: '#6b7280', line: '#fbcfe8', bg: '#ccfbf1', bf: 'round' },
        logo: { icon: 'dondurma', shape: 'circle', bg: '#0f766e', fg: '#ffffff' },
        tagline: 'Maraş dondurması · 1952',
        data: {
            id: 'DND2026000019274', date: '2026-10-11', time: '16:22:00',
            notes: ['Fiyatlarımıza KDV dahildir.'],
            supplier: firma('1462837059', 'Ahırdağı Dondurma Gıda San. Tic. Ltd. Şti.', adr('Kurtuluş Mah. Trabzon Cad.', '14', 'Dulkadiroğlu', 'Kahramanmaraş', '46050'), 'Aslanbey', '0344 223 19 52', 'iletisim@ahirdagi.example.com'),
            customer: kisi('85213607449', 'Kerem', 'Özdemir', adr('Yenişehir Mah. Azerbaycan Bulv.', '102/5', 'Onikişubat', 'Kahramanmaraş', '46100'), '0543 118 27 66'),
            payment: NAKIT('2026-10-11', 'Nakit'),
            docs: [R('SIPARIS', 'D-218', '2026-10-11'), R('SERVIS', 'Külah · kap', '2026-10-11'), R('GARSON', 'Kasa 2', '2026-10-11'), R('ADISYON', 'MD-218', '2026-10-11')],
            lines: [
                M('Maraş Dondurması · Külah', 'C62', 2, 145, 10, { TOP: '3', A1: 'Sade kaymak', A2: 'Antep fıstığı', A3: 'Çikolata' }),
                M('Maraş Dondurması · Kap', 'C62', 1, 175, 10, { TOP: '4', A1: 'Limon', A2: 'Çilek', A3: 'Karadut', A4: 'Vişne' }),
                M('Kesme Dondurma (eve paket)', 'KGM', 0.5, 1100, 10, { A1: 'Sade kaymak' }, { desc: 'Termo kutuda · 2 saat dayanır', ...isk(0.1, 'Hafta içi eve paket %10') }),
                M('Dondurmalı İrmik Helvası', 'PTN', 1, 190, 10, {}, { note: 'Helva sıcak servis' }),
                M('Sıcak Salep', 'C62', 2, 95, 10, { EK: 'Tarçınlı' }),
                M('Termo Taşıma Kutusu', 'C62', 1, 40, 20),
            ],
        },
    },
    /* -------------------------------------------------------------- A10 */
    {
        id: 'adisyon-fine-dining-arsiv', sector: 'perakende', doc: 'arsiv', layout: 'ad-fine',
        name: 'Fine Dining Tadım Menüsü Adisyonu e-Arşiv (Siyah & Altın)',
        description: 'Fine dining restoranlar için siyah-altın çerçeveli tadım menüsü adisyonu e-Arşiv: şef masası, maître ve sommelier bilgisi, tabak tabak menü açıklaması, şarap ve alkolsüz eşleştirme (%20 / %10 KDV), şefin ikramı, şirkete (VKN) fatura ve imza alanı.',
        tags: ['Adisyon', 'Tadım menüsü', 'Şarap eşleştirme', 'Şirkete fatura', '%10 / %20 KDV'],
        theme: { a: '#b89b5e', b: '#8b6f3a', t: '#1c1917', ink: '#e7e2d6', soft: '#a8a29e', line: '#3f3a33', paper: '#0c0c0c', on: '#0c0c0c', bg: '#000000', bf: 'garamond', fs: '10.5px' },
        logo: { text: 'M', shape: 'ring', bg: '#0c0c0c', fg: '#b89b5e', font: 'Didot,Georgia,serif', weight: 400 },
        tagline: 'Tadım menüsü · Galata',
        data: {
            id: 'MRA2026000004518', date: '2026-10-10', time: '23:52:00',
            notes: ['Fiyatlarımıza KDV ve ÖTV dahildir. Servis ücreti alınmaz.'],
            supplier: firma('6490381275', 'Mira Gastronomi Turizm A.Ş.', adr('Bereketzade Mah. Galata Kulesi Sok.', '9', 'Beyoğlu', 'İstanbul', '34421'), 'Beyoğlu', '0212 245 90 09', 'reservations@mira.example.com', 'www.mira.example.com', '0649038127500017'),
            customer: firma('2871046539', 'Lodos Yazılım ve Danışmanlık A.Ş.', adr('Esentepe Mah. Büyükdere Cad.', '201/18', 'Şişli', 'İstanbul', '34394'), 'Zincirlikuyu', '0212 356 40 10', 'muhasebe@lodos.example.com'),
            payment: KART('2026-10-10', 'Kurumsal kredi kartı'),
            docs: [
                R('ADISYON', 'MR-0451', '2026-10-10'), R('MASA', '12', '2026-10-10', 'Şef masası'), R('GARSON', 'Can Aksoy', '2026-10-10', 'Sommelier Ece Tan'),
                R('KISI', '4', '2026-10-10'),
            ],
            lines: [
                M('Tadım Menüsü · 9 Tabak', 'PTN', 4, 4200, 10, { GRUP: 'Tadım Menüsü' }, { desc: 'Lakerda tartar · Közlenmiş kereviz · Ege levreği · Kuzu incik · Ayva & kaymak' }),
                M('Trüflü Mantı', 'PTN', 2, 950, 10, { GRUP: 'Mutfaktan Ekler' }, { note: 'Glütensiz hamur' }),
                M('Şarap Eşleştirmesi · 7 Kadeh', 'C62', 3, 2600, 20, { GRUP: 'Eşleştirmeler' }, { desc: 'Narince, Emir, Kalecik Karası, Öküzgözü' }),
                M('Alkolsüz Eşleştirme', 'C62', 1, 1400, 10, { GRUP: 'Eşleştirmeler' }, { desc: 'Kombucha, fermente şuruplar, soğuk demleme çay' }),
                M('Kalecik Karası 2019 · 75 cl', 'C62', 1, 3800, 20, { GRUP: 'Şarap Listesinden' }),
                M('Maden Suyu', 'C62', 4, 90, 10, { GRUP: 'Kapanış' }),
                M('Espresso', 'C62', 3, 180, 10, { GRUP: 'Kapanış' }),
                M('Petit Four Tabağı', 'PTN', 1, 450, 10, { GRUP: 'Kapanış' }, isk(1, 'Şefin ikramı')),
            ],
        },
    },
];
