// Meslek kataloğundaki belge tanımlarını (k: 'fatura/tevkifat:603' gibi) UBL-TR örnek XML girdisine,
// XSLT yapılandırmasına ve rapor için XML değerlendirme notlarına dönüştürür.
import { invoice, creditNote, despatch, r2 } from './xml.mjs';
import { firm, person, foreignFirm, tourist, carrier, plate, iban, tckn, vkn, rng, hashStr, digits, pick } from './fake.mjs';

/* ------------------------------------------------------------------ resmî kod tabloları */

/** KDV tevkifat kodları (GİB e-Fatura kod listesi) → [ad, oran %]. */
export const TEVKIFAT = {
    601: ['YAPIM İŞLERİ İLE BU İŞLERLE BİRLİKTE İFA EDİLEN MÜHENDİSLİK-MİMARLIK VE ETÜT-PROJE HİZMETLERİ', 40],
    602: ['ETÜT, PLAN-PROJE, DANIŞMANLIK, DENETİM VE BENZERİ HİZMETLER', 90],
    603: ['MAKİNE, TEÇHİZAT, DEMİRBAŞ VE TAŞITLARA AİT TADİL, BAKIM VE ONARIM HİZMETLERİ', 70],
    604: ['YEMEK SERVİS HİZMETİ', 50],
    605: ['ORGANİZASYON HİZMETİ', 50],
    606: ['İŞGÜCÜ TEMİN HİZMETLERİ', 90],
    607: ['ÖZEL GÜVENLİK HİZMETİ', 90],
    608: ['YAPI DENETİM HİZMETLERİ', 90],
    609: ['FASON OLARAK YAPTIRILAN TEKSTİL VE KONFEKSİYON İŞLERİ, ÇANTA VE AYAKKABI DİKİM İŞLERİ VE BU İŞLERE ARACILIK HİZMETLERİ', 70],
    610: ['TURİSTİK MAĞAZALARA VERİLEN MÜŞTERİ BULMA / GÖTÜRME HİZMETLERİ', 90],
    612: ['TEMİZLİK HİZMETİ', 90],
    613: ['ÇEVRE VE BAHÇE BAKIM HİZMETLERİ', 90],
    614: ['SERVİS TAŞIMACILIĞI HİZMETİ', 50],
    615: ['HER TÜRLÜ BASKI VE BASIM HİZMETLERİ', 70],
    617: ['HURDA METALDEN ELDE EDİLEN KÜLÇE TESLİMLERİ', 70],
    618: ['HURDA METALDEN ELDE EDİLENLER DIŞINDAKİ BAKIR, ÇİNKO, ALÜMİNYUM VE KURŞUN KÜLÇE TESLİMLERİ', 70],
    619: ['BAKIR, ÇİNKO, ALÜMİNYUM VE KURŞUN ÜRÜNLERİNİN TESLİMİ', 70],
    620: ['İSTİSNADAN VAZGEÇENLERİN HURDA VE ATIK TESLİMİ', 70],
    621: ['METAL, PLASTİK, LASTİK, KAUÇUK, KÂĞIT VE CAM HURDA VE ATIKLARDAN ELDE EDİLEN HAMMADDE TESLİMİ', 90],
    622: ['PAMUK, TİFTİK, YÜN VE YAPAĞI İLE HAM POST VE DERİ TESLİMLERİ', 90],
    623: ['AĞAÇ VE ORMAN ÜRÜNLERİ TESLİMİ', 50],
    624: ['YÜK TAŞIMACILIĞI HİZMETİ', 20],
    625: ['TİCARİ REKLAM HİZMETLERİ', 30],
    626: ['DİĞER TESLİMLER', 20],
    627: ['DEMİR-ÇELİK ÜRÜNLERİNİN TESLİMİ', 50],
};

/** KDV istisna kodları → gerekçe. */
export const ISTISNA = {
    301: '11/1-a Mal ihracatı',
    302: '11/1-a Hizmet ihracatı',
    304: '13/a Deniz, hava ve demiryolu taşıma araçlarının teslimi ile inşa, tadil, bakım ve onarımları',
    305: '13/b Deniz ve hava taşıma araçları için liman ve hava meydanlarında yapılan hizmetler',
    311: '14/1 Uluslararası taşımacılık',
    317: '17/2-a Genel ve özel bütçeli kamu idarelerine, il özel idarelerine, belediyelere ve köylere bağışlanan mallar',
    334: 'KDV 13/l Yabancılara verilen sağlık hizmetleri',
    335: 'KDV 13/n Basılı kitap ve süreli yayınların teslimleri',
    350: 'Diğerleri',
    501: 'Yolcu beraberi eşya satışı (KDV hesaplanır, yurt dışına çıkışta iade edilir)',
    701: '3065 sayılı KDV Kanununun 11/1-c maddesi kapsamındaki ihraç kayıtlı satış',
};

/** Özel matrah kodları → gerekçe. */
export const OZELMATRAH = {
    805: 'Altından mamul veya altın ihtiva eden ziynet eşyaları ile sikke altınların teslimi',
    808: 'Gümüşten mamul veya gümüş ihtiva eden ziynet eşyaları ile gümüş sikke teslimi',
    812: 'İkinci el motorlu kara taşıtı veya taşınmaz teslimi',
};

export const RATES = { EUR: 49.912, USD: 42.653, GBP: 57.284 };

/** Ek alan şemaları ve belge türleri için Türkçe etiketler (XSLT etiket şablonuna yazılır). */
export const LABELS = {
    PLAKA: 'Plaka', ARACKIMLIKNO: 'Araç Kimlik No', KUNYENO: 'Künye No', MALSAHIBIADSOYADUNVAN: 'Mal Sahibi',
    MALSAHIBIVKNTCKN: 'Mal Sahibi VKN/TCKN', SEVKIYATNO: 'Sevkiyat No', ETIKETNO: 'Etiket No', SUBENO: 'Şube No',
    MUSTERITURU: 'Müşteri Türü', ISTATISTIKNO: 'İstatistik No', PARTYTYPE: 'Taraf Tipi', ARACIKURUMVKN: 'Aracı Kurum VKN',
    ARACIKURUMETIKET: 'Aracı Kurum Etiketi', MUKELLEF_KODU: 'Mükellef Kodu', MUKELLEF_ADI: 'Mükellef Adı', DOSYA_NO: 'Dosya No',
    MENSE: 'Menşe', BANDROL: 'Bandrol No', IMEI: 'IMEI', SERINO: 'Seri No', GARANTI: 'Garanti', RENK: 'Renk', BEDEN: 'Beden', NUMARA: 'Numara', AYAR: 'Ayar',
    MILYEM: 'Milyem', HAS: 'Has (gr)', ISCILIK: 'İşçilik', LOT: 'Lot / Parti', SKT: 'Son Kullanma', GTIP: 'GTİP', GTIN: 'GTIN',
    ETGB: 'ETGB No', SASI: 'Şasi No', MOTORNO: 'Motor No', KM: 'Kilometre', MODELYILI: 'Model Yılı', NOTER: 'Noter Satış',
    SEFERNO: 'Sefer No', KOLTUKNO: 'Koltuk No', PERON: 'Peron', PNR: 'PNR', GEMI: 'Gemi / Tekne', KANTARFISI: 'Kantar Fişi',
    BORSATESCIL: 'Borsa Tescil', PROJE: 'Proje', HAKEDIS: 'Hakediş No', SOZLESME: 'Sözleşme No', IHALE: 'İhale Kayıt No',
    RANDEVU: 'Randevu', SEANS: 'Seans', ODA: 'Oda', REZERVASYON: 'Rezervasyon', MASA: 'Masa', SALON: 'Salon', SIRA: 'Sıra',
    KAPI: 'Kapı', MAHKEME: 'Mahkeme', ESAS: 'Esas No', RECETE: 'Reçete No', PROVIZYON: 'Provizyon No', UTS: 'ÜTS No',
    BARKOD: 'Barkod', KUPENO: 'Küpe No', IRK: 'Irk', ISLETME: 'İşletme No', CKS: 'ÇKS No', PARSEL: 'Ada / Parsel',
    SAYAC: 'Sayaç No', ABONE: 'Abone No', TESISAT: 'Tesisat No', IS_EMRI: 'İş Emri', SERVISFORM: 'Servis Formu',
    KATALOG: 'Katalog No', OLCU: 'Ölçü', MALZEME: 'Malzeme', CINS: 'Cins', SINIF: 'Sınıf', DESEN: 'Desen', DUGUM: 'Düğüm',
    YAS: 'Yaş', AGIRLIK: 'Ağırlık', HACIM: 'Hacim', DIOPTRI: 'Diyoptri', MARKA: 'Marka', SURE: 'Süre', TARIH: 'Tarih',
    ETKINLIK: 'Etkinlik', KALKIS: 'Kalkış', VARIS: 'Varış', SIPARISNO: 'Sipariş No', KARGO: 'Kargo', TESLIM: 'Teslim',
    DORSE: 'Dorse', CMR: 'CMR No', SEFER: 'Sefer', KONTEYNER: 'Konteyner', UND: 'U-ETDS Bildirim', UETDS: 'U-ETDS No',
    SERVIS: 'Servis Güzergâhı', GUZERGAH: 'Güzergâh', ARAC: 'Araç', ISKELE: 'İskele', TEKNE: 'Tekne', ROTA: 'Rota',
    DOGUM: 'Doğum Tarihi', HAYVANNO: 'Hayvan Pasaport No', CIP: 'Çip No', VETERINER: 'Veteriner Hekim', ASI: 'Aşı',
    ELEKTRIKSAYAC: 'Elektrik Sayacı', ENDEKS: 'Endeks', KWH: 'Tüketim (kWh)', SOKET: 'Soket', ISTASYON: 'İstasyon',
    YAKIT: 'Yakıt', POMPA: 'Pompa', EPDK: 'EPDK Lisans', TUP: 'Tüp Seri No', DEPOZITO: 'Depozito', MUAYENE: 'Muayene',
    RUHSAT: 'Ruhsat', TESCIL: 'Tescil', TAKIP: 'Takip No', KUTUK: 'Kütük No', SIGORTA: 'Poliçe No', DOSYA: 'Dosya No',
    ARSIV: 'Arşiv No', SAYFA: 'Sayfa', KELIME: 'Kelime', DIL: 'Dil Çifti', YEMIN: 'Yeminli Tercüman No', NOTERONAY: 'Noter Onayı',
    KURS: 'Kurs', DONEM: 'Dönem', OGRENCI: 'Öğrenci', SINAV: 'Sınav', EHLIYET: 'Ehliyet Sınıfı', BELGE: 'Belge No',
    LISANS: 'Lisans', ALAN: 'Alan Adı', HOSTING: 'Hosting', SURUM: 'Sürüm', KULLANICI: 'Kullanıcı', FATURADONEM: 'Fatura Dönemi',
    HAT: 'Hat No', TARIFE: 'Tarife', KONTOR: 'Kontör', ICCID: 'ICCID', OPERATOR: 'Operatör', BAYI: 'Bayi Kodu',
    KUPON: 'Kupon', OYUN: 'Oyun', CEKILIS: 'Çekiliş', TERMINAL: 'Terminal', ISTIF: 'İstif', DEPO: 'Depo', PALET: 'Palet',
    ADRES: 'Adres', KAT: 'Kat', DAIRE: 'Daire', METREKARE: 'Alan (m²)', TAPU: 'Tapu', YETKI: 'Yetki Belgesi',
    SOZLESMETARIH: 'Sözleşme Tarihi', KIRA: 'Kira Dönemi', AIDAT: 'Aidat Dönemi', SAYIM: 'Sayım', NUMUNE: 'Numune',
    ANALIZ: 'Analiz', RAPOR: 'Rapor No', SERTIFIKA: 'Sertifika', STANDART: 'Standart', TSE: 'TSE Belge', CE: 'CE',
    PARTINO: 'Parti No', URETIM: 'Üretim Tarihi', DOKUM: 'Döküm No', KALITE: 'Kalite', CAP: 'Çap', BOY: 'Boy', EN: 'En',
    KALINLIK: 'Kalınlık', RUTUBET: 'Rutubet', PROTEIN: 'Protein', HEKTOLITRE: 'Hektolitre', FIRE: 'Fire', DARA: 'Dara',
    BRUT: 'Brüt', NET: 'Net', KASA: 'Kasa', KOLI: 'Koli', CUVAL: 'Çuval', SANDIK: 'Sandık', BALYA: 'Balya',
    URUNKODU: 'Ürün Kodu', TESCILNO: 'Tescil No', HALKAYIT: 'Hal Kayıt', BILDIRIM: 'Bildirim No', SARJOTURUMU: 'Şarj Oturumu',
    SendingType: 'Gönderim Şekli', OZELLIK: 'Özellik', KAPASITE: 'Kapasite', GUC: 'Güç', VOLTAJ: 'Voltaj', MOTOR: 'Motor',
    YIL: 'Yıl', MAKINE: 'Makine', PARCA: 'Parça No', OEM: 'OEM No', FIS: 'Fiş No', ISTEK: 'Talep No', ONAY: 'Onay Kodu',
    MUHUR: 'Mühür', TADILAT: 'Tadilat', PROJE_NO: 'Proje No', PAFTA: 'Pafta', ZEMIN: 'Zemin', TOPRAK: 'Toprak Analizi',
    HASTA: 'Hasta', KUAFOR: 'Uzman', PAKET: 'Paket', UYELIK: 'Üyelik No', KART: 'Kart No', PUAN: 'Puan', SEZON: 'Sezon',
    BILET: 'Bilet No', KATEGORI: 'Kategori', TRIBUN: 'Tribün', BLOK: 'Blok', ORGANIZASYON: 'Organizasyon', DAVETLI: 'Davetli',
    MEKAN: 'Mekân', MENU: 'Menü', KISI: 'Kişi Sayısı', SAAT: 'Saat', KONSER: 'Konser', SANATCI: 'Sanatçı', TUR: 'Tur Kodu',
    REHBER: 'Rehber', VIZE: 'Vize', TASIMA: 'Taşıma', NAVLUN: 'Navlun', KONSIMENTO: 'Konşimento', ORDINO: 'Ordino',
    BEYANNAME: 'Beyanname No', ANTREPO: 'Antrepo', SERBEST: 'Serbest Bölge', ETIKET: 'Etiket', KAREKOD: 'Karekod',
    ISLEM: 'İşlem No', DEKONT: 'Dekont No', REFERANS: 'Referans', ACENTE: 'Acente', POLICE: 'Poliçe', HASAR: 'Hasar Dosyası',
    EKSPERTIZ: 'Ekspertiz', DEGER: 'Değer', IHRACATCI: 'İhracatçı', DIIB: 'DİİB No', TESCILBEYAN: 'Tescil Beyannamesi',
    ISBN: 'ISBN',
};

/* ------------------------------------------------------------------ sabit taraflar */

const GUMRUK = {
    ids: [['VKN', '1460415308']], name: 'Ticaret Bakanlığı Gümrükler Genel Müdürlüğü - Bilgi İşlem Dairesi Başkanlığı',
    addr: { district: 'Çankaya', city: 'Ankara' }, vd: 'Ulus',
};
const ARACI = {
    ids: [['ARACIKURUMVKN', vkn('aracikurum-taxfree')], ['ARACIKURUMETIKET', 'urn:mail:taxfreegb@globaliade.com.tr']],
    name: 'Global İade Aracı Kurum Hizmetleri A.Ş.', addr: { street: 'Büyükdere Cad.', no: '127', district: 'Şişli', city: 'İstanbul', zip: '34394' },
};
const SGK = {
    ids: [['VKN', '7750409379']], name: 'Sosyal Güvenlik Kurumu Başkanlığı',
    addr: { street: 'Mithatpaşa Cad.', no: '7', district: 'Çankaya', city: 'Ankara', zip: '06410' }, vd: 'Kocatepe',
};
const SMS_PROVIDERS = ['Anadolu Mesaj Teknolojileri A.Ş.', 'e-Belge Mobil Onay Hizmetleri A.Ş.', 'Tebliğ SMS Bilişim Ltd. Şti.'];
const PAY_AGENTS = ['İyzi Ödeme ve Elektronik Para Hizmetleri A.Ş.', 'PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.', 'Param Ödeme Kuruluşu A.Ş.'];

/* ------------------------------------------------------------------ belge türleri */

/** Temel belge türleri: XML ailesi, galeri belge türü / modül, XSLT başlık ve rol etiketleri. */
export const KINDS = {
    arsiv: { fam: 'invoice', doc: 'arsiv', module: 'arsiv', title: 'e-Arşiv Fatura', profile: 'EARSIVFATURA', type: 'SATIS', roles: ['Satıcı', 'Alıcı'], cols: 'inv', payLabel: 'Ödenecek Tutar', label: 'e-Arşiv Fatura' },
    fatura: { fam: 'invoice', doc: 'fatura', module: 'fatura', title: 'e-Fatura', profile: 'TICARIFATURA', type: 'SATIS', roles: ['Satıcı', 'Alıcı'], cols: 'inv', payLabel: 'Ödenecek Tutar', label: 'e-Fatura' },
    ihracat: { fam: 'invoice', doc: 'ihracat', module: 'ihracat', title: 'İhracat Faturası', profile: 'IHRACAT', type: 'ISTISNA', roles: ['İhracatçı', 'Alıcı · Buyer'], parties: 'ihracat', cols: 'inv', payLabel: 'Fatura Tutarı', label: 'e-Fatura (İhracat)' },
    yolcu: { fam: 'invoice', doc: 'ihracat', module: 'ihracat', title: 'Yolcu Beraberi Fatura', profile: 'YOLCUBERABERFATURA', type: 'ISTISNA', roles: ['Satıcı', 'Yolcu · Tax Free'], parties: 'yolcu', cols: 'inv', payLabel: 'Ödenen Tutar', label: 'e-Fatura (Yolcu Beraberi)' },
    mikro: { fam: 'invoice', doc: 'mikro-ihracat', module: 'mikro_ihracat', title: 'e-Arşiv · Mikro İhracat', profile: 'EARSIVFATURA', type: 'ISTISNA', roles: ['Satıcı', 'Yurt Dışı Alıcı'], cols: 'inv', payLabel: 'Fatura Tutarı', label: 'e-Arşiv (Mikro İhracat / ETGB)' },
    smm: { fam: 'invoice', doc: 'smm', module: 'smm', title: 'e-Serbest Meslek Makbuzu', profile: 'EARSIVBELGE', type: 'SERBESTMESLEKMAKBUZU', roles: ['Serbest Meslek Erbabı', 'Müşteri'], cols: 'smm', grossLabel: 'Brüt Ücret', payLabel: 'Net Ödenen', noLabel: 'Makbuz No', label: 'e-SMM' },
    bilet: { fam: 'invoice', doc: 'bilet', module: 'bilet', title: 'e-Bilet', profile: 'e-Bilet', type: 'SATIS', roles: ['Düzenleyen', 'Yolcu'], cols: 'inv', payLabel: 'Bilet Bedeli', noLabel: 'Bilet No', label: 'e-Bilet' },
    mustahsil: { fam: 'credit', doc: 'mustahsil', module: 'mustahsil', title: 'e-Müstahsil Makbuzu', profile: 'EARSIVBELGE', type: 'MUSTAHSILMAKBUZ', roles: ['Alıcı (Düzenleyen)', 'Müstahsil (Üretici)'], cols: 'credit', grossLabel: 'Ürün Bedeli (Brüt)', payLabel: 'Müstahsile Ödenen', noLabel: 'Makbuz No', itemHead: 'Ürün', label: 'e-Müstahsil Makbuzu' },
    gider: { fam: 'credit', doc: 'gider-pusulasi', module: 'gider-pusulasi', title: 'e-Gider Pusulası', profile: 'GIDERPUSULASI', type: 'SATIS', roles: ['Düzenleyen', 'Satıcı (Belge Vermeyen)'], cols: 'credit', grossLabel: 'Mal / Hizmet Bedeli', payLabel: 'Ödenen Net Tutar', noLabel: 'Pusula No', label: 'e-Gider Pusulası' },
    kmaden: { fam: 'credit', doc: 'doviz', module: 'doviz', title: 'Kıymetli Maden Alım Belgesi', profile: 'EKIYMETLIMADENBELGE', type: 'ALIM', roles: ['Alıcı (Müessese)', 'Satıcı (Müşteri)'], cols: 'credit', grossLabel: 'Alım Bedeli', payLabel: 'Müşteriye Ödenen', itemHead: 'Kıymetli Maden', label: 'e-Kıymetli Maden (Alım)' },
    irsaliye: { fam: 'despatch', doc: 'irsaliye', module: 'irsaliye', title: 'e-İrsaliye', profile: 'TEMELIRSALIYE', type: 'SEVK', roles: ['Gönderici', 'Teslim Alan'], cols: 'despatch', noLabel: 'İrsaliye No', itemHead: 'Ürün', label: 'e-İrsaliye' },
};

/* ------------------------------------------------------------------ yardımcılar */

const pad = (n, w = 2) => String(n).padStart(w, '0');
const ascii = (s) => s.toLocaleUpperCase('tr').replace(/Ç/g, 'C').replace(/Ğ/g, 'G').replace(/İ/g, 'I').replace(/Ö/g, 'O').replace(/Ş/g, 'S').replace(/Ü/g, 'U').replace(/Â/g, 'A').replace(/[^A-Z]/g, '');
export const slug = (s) => s.toLocaleLowerCase('tr').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const addDays = (d, n) => {
    const x = new Date(`${d}T12:00:00Z`);
    x.setUTCDate(x.getUTCDate() + n);
    return x.toISOString().slice(0, 10);
};
const prefixOf = (name) => {
    const w = name.split(/\s+/).map(ascii).filter((s) => s && !['VE', 'LTD', 'STI', 'AS', 'SAN', 'TIC'].includes(s));
    const p = w.length >= 3 ? w.slice(0, 3).map((s) => s[0]).join('') : w.length === 2 ? w[0].slice(0, 2) + w[1][0] : (w[0] ?? 'MSL').slice(0, 3);
    return p.padEnd(3, 'X');
};
const isCompany = (name) => /(A\.Ş\.|Ltd\.|Şti\.|Koop|Kooperatif|Birliği|Belediye|Bakanlığı|Müdürlüğü|Üniversitesi|Hastanesi|Vakfı|Derneği|GmbH|LLC|B\.V\.)/.test(name);

/** Satır demeti → xml.mjs satırı. [ad, birim, miktar, fiyat, kdv?, ek alanlar?, diğer?] */
const toLine = (l) => {
    if (!Array.isArray(l)) return l;
    const [name, unit, qty, price, kdv = 20, props, extra = {}] = l;
    return { name, unit, qty, price, kdv, props, ...extra };
};

/** Müşteri: 'kisi' (gerçek kişi), 'firma' (genel firma), firma adı, { f, city, sanayi }, ülke kodu (yabancı), 'turist'. */
function customerOf(to, seed, city) {
    if (!to || to === 'kisi') return person(seed, city);
    if (to === 'turist') return tourist(seed);
    if (typeof to === 'string' && /^[A-Z]{2}$/.test(to)) return foreignFirm(seed, to);
    const o = typeof to === 'string' ? { f: to } : to;
    if (o.kisi) return { ...person(seed, o.city ?? city), ...o.kisi };
    const c = firm(`${seed}:${o.f}`, o.f, o.city ?? city, { mersis: /A\.Ş\./.test(o.f), sanayi: o.sanayi });
    return o.ids ? { ...c, ids: [...c.ids, ...o.ids] } : c;
}

function supplierOf(prof, opt = {}) {
    if (prof.o) {
        const [ad, ...soy] = prof.o.split(' ');
        const p = firm(prof.code, prof.f, prof.city, { web: opt.web, sanayi: prof.sanayi });
        return { ...p, ids: [['TCKN', tckn(prof.code)]], person: [ad, soy.join(' ')] };
    }
    return firm(prof.code, prof.f, prof.city, { mersis: isCompany(prof.f), web: opt.web || prof.web, sanayi: prof.sanayi });
}

function paymentOf(spec, kind, d, seed, sup) {
    const acct = iban(`${seed}:${sup.ids[0][1]}`);
    const withIban = { iban: acct.iban, bank: `${acct.bank} — ${sup.addr.city} Şubesi` };
    if (spec === 'yok') return undefined;
    const [k, n] = String(spec ?? '').split(':');
    if (k === 'nakit') return { code: '10' };
    if (k === 'kart') return { code: '48', due: d.date };
    if (k === 'cek') return { code: '20', due: addDays(d.date, Number(n ?? 60)), note: 'Keşide edilen çek ile ödenecektir.' };
    if (k === 'senet') return { code: '60', due: addDays(d.date, Number(n ?? 90)) };
    if (k === 'havale') return { code: '42', due: d.date, ...withIban };
    if (k === 'vade') return { code: '42', due: addDays(d.date, Number(n ?? 30)), ...withIban };
    if (kind === 'arsiv' || kind === 'bilet') return { code: '48', due: d.date };
    if (kind === 'gider') return { code: '10' };
    if (kind === 'irsaliye') return undefined;
    if (kind === 'smm') return { code: '42', due: d.date, ...withIban };
    return { code: '42', due: addDays(d.date, 30), ...withIban };
}

/* ------------------------------------------------------------------ ana dönüştürücü */

/**
 * prof: katalog mesleği; doc: belge tanımı; i: sıra. Dönüş: { id, K (XSLT yapılandırması), xml, totals, feat, meta }.
 */
export function build(prof, doc, i) {
    const [base, ...vars] = doc.k.split('/');
    const KB = KINDS[base];
    if (!KB) throw new Error(`${prof.code}: bilinmeyen belge türü ${doc.k}`);
    const K = { ...KB, layout: doc.lay };
    const seed = `${prof.code}#${i}`;
    const r = rng(seed);
    const h = hashStr(seed);
    const date = doc.date ?? `2026-10-${pad(1 + (h % 7))}`;
    const time = `${pad(8 + (h % 10))}:${pad((h >>> 4) % 60)}:${pad((h >>> 10) % 60)}`;
    const pre = doc.pre ?? prefixOf(prof.f);
    const id = `${pre}2026${pad(1 + (h % 99999), 9)}`;
    const info = [];
    const tags = [];
    const notes = [...(doc.nt ?? [])];
    const city = doc.city ?? prof.city;
    const varMap = Object.fromEntries(vars.map((x) => { const [a, b] = x.split(':'); return [a, b ?? true]; }));

    const net = base === 'arsiv' && varMap.net;
    const sup = supplierOf(prof, { web: net || base === 'mikro' });
    if (doc.supIds) sup.ids.push(...doc.supIds);
    const d = {
        id, date, time, profile: KB.profile, type: KB.type, notes, supplier: sup,
        lines: doc.l.map(toLine),
        comment: `Meslek şablonu: ${prof.code} ${prof.name} — ${doc.n} (${KB.label})\n${doc.w ?? ''}`,
    };
    const refs = doc.r ?? [];
    d.docs = refs.filter(([t]) => t !== 'SIPARIS' && t !== 'IRSALIYE').map(([type, rid, desc]) => (type.startsWith('#') ? { id: rid, typeCode: type.slice(1), desc } : { id: rid, type, desc }));
    const ord = refs.find(([t]) => t === 'SIPARIS');
    if (ord) d.order = { id: ord[1], date: ord[2] ?? addDays(date, -3) };
    d.despatch = refs.filter(([t]) => t === 'IRSALIYE').map(([, rid, dd]) => ({ id: rid, date: dd ?? date }));
    if (doc.per) d.period = { start: doc.per[0], startTime: doc.per[1], desc: doc.per[2], end: doc.per[3], endTime: doc.per[4] };

    /* ---------------- müşteri */
    if (base === 'ihracat' || base === 'yolcu') {
        d.customer = GUMRUK;
    } else if (base === 'mustahsil' || (base === 'gider' && !doc.to)) {
        d.customer = customerOf('kisi', seed, city);
    } else if (varMap.sgk) {
        d.customer = SGK;
    } else {
        d.customer = customerOf(doc.to, seed, city);
    }
    if (doc.cusIds) d.customer = { ...d.customer, ids: [...d.customer.ids, ...doc.cusIds] };
    const personCus = d.customer.ids?.[0]?.[0] === 'TCKN';

    /* ---------------- ödeme */
    d.payment = paymentOf(doc.pay, base, d, seed, sup);

    /* ---------------- türe özgü alanlar */
    const sub = [KB.profile, KB.type];
    switch (base) {
    case 'arsiv':
    case 'fatura': {
        if (base === 'arsiv') {
            notes.push('e-Arşiv izni kapsamında elektronik ortamda iletilmiştir.');
            info.push(personCus ? 'Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).' : 'Alıcı e-Fatura mükellefi değil: VKN + PartyName + vergi dairesi.');
        }
        if (varMap.temel) { d.profile = 'TEMELFATURA'; sub[0] = 'TEMELFATURA'; info.push('TEMELFATURA: alıcı kabul/ret yanıtı gönderemez; iade için ayrı İADE faturası gerekir.'); }
        if (varMap.kamu) { d.profile = 'KAMU'; sub[0] = 'KAMU'; info.push('KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.'); }
        if (net) {
            K.title = 'e-Arşiv Fatura · İnternet Satışı';
            const agent = pick(r, PAY_AGENTS);
            d.payment = { code: '48', due: date, note: `Ödeme aracısı: ${agent} · Sanal POS (3D Secure)` };
            d.delivery = { carrier: carrier(seed), tracking: `${digits(r, 12)}`, date, time: `${pad(14 + (h % 4))}:30:00`, addr: d.customer.addr };
            notes.push('Bu satış internet üzerinden yapılmıştır.');
            info.push('İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.');
            tags.push('İnternet satışı');
        }
        if (varMap.tevkifat) {
            const [name, pct] = TEVKIFAT[varMap.tevkifat];
            d.type = 'TEVKIFAT'; sub[1] = `TEVKIFAT ${varMap.tevkifat}`;
            d.withholding = { code: String(varMap.tevkifat), name, pct };
            notes.push(`KDV Genel Uygulama Tebliği uyarınca ${varMap.tevkifat} kodlu "${name.toLocaleLowerCase('tr')}" için ${pct / 10}/10 oranında KDV tevkifatı uygulanmıştır.`);
            info.push(`InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode ${varMap.tevkifat}, Percent ${pct} (${pct / 10}/10). Ödenecek = KDV dahil − tevkif edilen KDV.`);
            tags.push(`Tevkifat ${varMap.tevkifat} (${pct / 10}/10)`);
        }
        if (varMap.istisna) {
            const code = String(varMap.istisna);
            d.type = 'ISTISNA'; sub[1] = `ISTISNA ${code}`;
            d.exemption = { code, reason: ISTISNA[code] };
            info.push(`InvoiceTypeCode ISTISNA; KDV TaxSubtotal Percent 0 + TaxExemptionReasonCode ${code} (${ISTISNA[code]}).`);
            tags.push(`İstisna ${code}`);
            if (code === '302' && d.customer.ids[0][1] === '2222222222') info.push('Yurt dışı müşteri: VKN alanına 2222222222, ülke kodu PostalAddress/Country.');
        }
        if (varMap.om) {
            const code = String(varMap.om);
            d.type = 'OZELMATRAH'; sub[1] = `OZELMATRAH ${code}`;
            d.om = { code, reason: OZELMATRAH[code] };
            info.push(`InvoiceTypeCode OZELMATRAH; KDV TaxSubtotal TaxableAmount = özel matrah (satış − alış/has değeri), TaxExemptionReasonCode ${code}. LineExtensionAmount satış bedelinin tamamıdır.`);
            tags.push(`Özel matrah ${code}`);
        }
        if (varMap.ihrackayitli) {
            d.type = 'IHRACKAYITLI'; sub[1] = 'IHRACKAYITLI 701';
            d.exemption = { code: '701', reason: ISTISNA['701'], keepKdv: true };
            d.tecil = true;
            notes.push('Mallar 3065 sayılı KDV Kanunu 11/1-c maddesi kapsamında ihraç kaydıyla teslim edilmiş olup hesaplanan KDV tahsil edilmemiş, tecil edilmiştir.');
            info.push('InvoiceTypeCode IHRACKAYITLI; KDV hesaplanır (Percent 20) ancak TaxExemptionReasonCode 701 ile tecil edilir: TaxInclusiveAmount = matrah + KDV, PayableAmount = matrah.');
            tags.push('İhraç kayıtlı');
        }
        if (varMap.hks || varMap.hkskom) {
            d.profile = 'HKS'; d.type = varMap.hkskom ? 'HKSKOMISYONCU' : 'HKSSATIS'; sub.splice(0, 2, 'HKS', d.type);
            d.lines.forEach((l, j) => {
                const owner = person(`${seed}:mal:${j % 2}`, city);
                l.props = { KUNYENO: `26${date.slice(5, 7)}${digits(rng(`${seed}:k${j}`), 15)}`, MALSAHIBIADSOYADUNVAN: `${owner.person.join(' ')}`, MALSAHIBIVKNTCKN: owner.ids[0][1], ...(l.props ?? {}) };
            });
            info.push(`ProfileID HKS, InvoiceTypeCode ${d.type}; her satırda AdditionalItemIdentification KUNYENO (Hal Kayıt Sistemi künye no), MALSAHIBIADSOYADUNVAN ve MALSAHIBIVKNTCKN.`);
            tags.push('HKS künye');
        }
        if (varMap.idis) {
            d.profile = 'IDIS'; sub[0] = 'IDIS';
            sup.ids.push(['SEVKIYATNO', `SE-${digits(r, 7)}`]);
            d.lines.forEach((l, j) => { l.props = { ETIKETNO: `${ascii(prof.f).slice(0, 2)}${digits(rng(`${seed}:e${j}`), 7)}`, ...(l.props ?? {}) }; });
            info.push('ProfileID IDIS: satıcı PartyIdentification SEVKIYATNO (SE-xxxxxxx); satırlarda ETIKETNO (demir-çelik ürün etiket numarası).');
            tags.push('IDIS');
        }
        if (varMap.ilac) {
            d.profile = 'ILAC_TIBBICIHAZ'; sub[0] = 'ILAC_TIBBICIHAZ';
            info.push('ProfileID ILAC_TIBBICIHAZ: satırlarda ürün takip bilgileri (GTIN / seri / lot / son kullanma, ÜTS no) AdditionalItemIdentification ile; alıcı sağlık kuruluşu veya ecza deposu.');
            tags.push('İlaç / tıbbi cihaz');
        }
        if (varMap.sgk) {
            d.type = 'SGK'; sub[1] = `SGK · ${varMap.sgk}`;
            d.accountingCost = varMap.sgk;
            const per = d.period ?? { start: `${date.slice(0, 8)}01`, end: addDays(`${date.slice(0, 8)}01`, 27) };
            d.period = { ...per, desc: per.desc ?? 'Fatura dönemi (SGK)' };
            d.docs.push({ id: `${digits(r, 8)}`, type: 'MUKELLEF_KODU' }, { id: prof.f, type: 'MUKELLEF_ADI' }, { id: `${digits(r, 6)}`, type: 'DOSYA_NO' });
            info.push(`InvoiceTypeCode SGK; alıcı SGK (VKN 7750409379); AccountingCost ${varMap.sgk}; InvoicePeriod (dönem); AdditionalDocumentReference MUKELLEF_KODU, MUKELLEF_ADI, DOSYA_NO.`);
            tags.push('SGK');
        }
        if (varMap.konaklama) {
            d.type = 'KONAKLAMAVERGISI'; sub[1] = 'KONAKLAMAVERGISI';
            d.lines.forEach((l) => { if (l.kv) l.taxes = [{ code: '0059', name: 'KONAKLAMA VERGİSİ', pct: 2 }]; });
            notes.push('7194 sayılı Kanun uyarınca konaklama bedeli üzerinden %2 konaklama vergisi hesaplanmıştır.');
            info.push('InvoiceTypeCode KONAKLAMAVERGISI; oda satırlarında TaxTypeCode 0059 (%2) ve KDV matrahına dahil; yemek / ekstra satırlarında yalnız KDV. InvoicePeriod giriş-çıkış.');
            tags.push('Konaklama vergisi');
        }
        if (varMap.sarj || varMap.sarjanlik) {
            d.profile = 'ENERJI'; d.type = varMap.sarjanlik ? 'SARJANLIK' : 'SARJ'; sub.splice(0, 2, 'ENERJI', d.type);
            info.push(`ProfileID ENERJI, InvoiceTypeCode ${d.type}; araç bilgisi alıcı PartyIdentification PLAKA${varMap.sarjanlik ? ' + ARACKIMLIKNO' : ''}, oturum / dönem bilgisi AdditionalDocumentReference.`);
            tags.push('Şarj hizmeti');
        }
        if (varMap.tekno) {
            d.type = 'TEKNOLOJIDESTEK'; sub[1] = 'TEKNOLOJIDESTEK';
            info.push('InvoiceTypeCode TEKNOLOJIDESTEK: alıcı TCKN zorunlu; cihaz IMEI / seri no satırda AdditionalItemIdentification.');
            tags.push('Teknoloji destek');
        }
        if (d.lines.some((l) => l.taxes?.some((x) => ['0071', '0073', '0074', '9077'].includes(x.code)))) {
            info.push('ÖTV satır vergisi (TaxTypeCode 0071 I. liste / 9077 II. liste taşıtlar / 0073 III. liste / 0074 IV. liste) KDV matrahına dahil edilir; maktu ÖTV için PerUnitAmount, nispi için Percent kullanılır.');
            tags.push('ÖTV');
        }
        if (base === 'fatura' && !info.length) info.push(`ProfileID ${d.profile}, InvoiceTypeCode ${d.type}; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).`);
        if (doc.cur) { d.currency = doc.cur; d.rate = RATES[doc.cur]; info.push(`Döviz: DocumentCurrencyCode ${doc.cur} + PricingExchangeRate (${RATES[doc.cur]}).`); }
        break;
    }
    case 'ihracat': {
        d.currency = doc.cur ?? 'EUR'; d.rate = RATES[d.currency];
        d.exemption = { code: '301', reason: ISTISNA['301'] };
        const b = foreignFirm(seed, doc.to ?? 'DE');
        d.buyer = { ...b, ids: [['PARTYTYPE', 'EXPORT']] };
        d.lines.forEach((l, j) => {
            l.exp = { incoterm: doc.inc ?? 'FOB', gtip: l.g, mode: doc.mode ?? 3, pkg: [`${pre}-${pad(j + 1)}`, l.kap ?? 1, doc.pkg ?? 'CT'] };
        });
        notes.push('Mal ihracatı KDV Kanunu 11/1-a maddesi uyarınca KDV’den istisnadır. Gümrük beyannamesi bilgileri GİB tarafından fatura ile eşleştirilir.');
        info.push(`ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (${doc.inc ?? 'FOB'}), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz ${d.currency} + PricingExchangeRate.`);
        tags.push(`İhracat ${doc.inc ?? 'FOB'}`);
        break;
    }
    case 'yolcu': {
        const tr = tourist(seed);
        d.buyer = tr;
        d.taxRep = ARACI;
        d.exemption = { code: '501', reason: ISTISNA['501'], keepKdv: true };
        notes.push('Yolcu beraberi eşya: KDV hesaplanmış olup eşyanın 3 ay içinde yurt dışına çıkarılması ve gümrük onayı ile aracı kurum üzerinden iade edilecektir.');
        info.push('ProfileID YOLCUBERABERFATURA; AccountingCustomerParty = Gümrük (1460415308); BuyerCustomerParty PARTYTYPE=TAXFREE + Person (ad, soyad, NationalityID) + IdentityDocumentReference (pasaport no / tarihi); TaxRepresentativeParty ARACIKURUMVKN + ARACIKURUMETIKET. KDV hesaplanır, istisna kodu 501.');
        tags.push('Tax Free');
        break;
    }
    case 'mikro': {
        d.currency = doc.cur ?? 'EUR'; d.rate = RATES[d.currency];
        d.exemption = { code: '301', reason: ISTISNA['301'] };
        d.docs.push({ id: `26341300EX${digits(r, 6)}`, type: 'ETGB', desc: 'Elektronik Ticaret Gümrük Beyannamesi' });
        d.lines.forEach((l) => { l.props = { GTIP: l.g, ...(l.props ?? {}) }; });
        d.delivery = { carrier: carrier(seed), tracking: `TR${digits(r, 10)}`, date, time: '16:00:00', addr: d.customer.addr };
        d.payment = { code: '48', due: date, note: 'Pazaryeri / sanal POS tahsilatı' };
        notes.push('Bu satış internet üzerinden yapılmıştır. ETGB kapsamında mikro ihracat — KDV Kanunu 11/1-a istisnası.');
        info.push('e-Arşiv (EARSIVFATURA) + InvoiceTypeCode ISTISNA 301; yabancı alıcı VKN 2222222222 ve ülke kodu; AdditionalDocumentReference ETGB; Delivery/CarrierParty + TrackingID; satırda GTİP (AdditionalItemIdentification). Döviz + kur.');
        tags.push('ETGB');
        break;
    }
    case 'smm': {
        const st = doc.stopaj ?? (personCus ? 0 : 20);
        if (st) d.stopaj = st;
        if (varMap.tevkifat) {
            const [name, pct] = TEVKIFAT[varMap.tevkifat];
            d.withholding = { code: String(varMap.tevkifat), name, pct };
            tags.push(`Tevkifat ${varMap.tevkifat}`);
        }
        notes.push(st ? `Gelir Vergisi Kanunu 94/2-b uyarınca %${st} gelir vergisi stopajı müşteri tarafından kesilip beyan edilecektir.` : 'Müşteri gerçek kişi (tevkifat yükümlüsü değil): gelir vergisi stopajı uygulanmamıştır.');
        info.push(`CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015)${st ? ` ve GV stopajı 0003 (%${st})` : ''}${varMap.tevkifat ? `; WithholdingTaxTotal ${varMap.tevkifat}` : ''}. Ödenecek = brüt + KDV − stopaj${varMap.tevkifat ? ' − tevkifat' : ''}.`);
        if (st) tags.push(`Stopaj %${st}`);
        break;
    }
    case 'bilet': {
        K.layout = 'bilet';
        K.periodTitle = doc.perTitle ?? 'Tarih / Saat';
        if (!refs.some(([t]) => t === 'SEFERNO')) K.roles = ['Düzenleyen', 'Katılımcı'];
        info.push(`ProfileID e-Bilet (depo şablon kuralı) · SATIS; InvoicePeriod sefer / etkinlik başlangıcı, AdditionalDocumentReference ile ${refs.map(([t]) => t).join(', ')}. Yolcu / seyirci AccountingCustomerParty (TCKN + Person).`);
        break;
    }
    case 'mustahsil': {
        const isH = varMap.hayvan;
        const cuts = [{ code: '0003', name: 'GELİR VERGİSİ S. (MUHTASAR)', pct: isH ? 1 : 2 }];
        if (varMap.borsa) cuts.push({ code: '8001', name: 'BORSA TESCİL ÜCRETİ', pct: 0.2 });
        if (varMap.mera) cuts.push({ code: '9040', name: 'MERA FONU', pct: 0.2 });
        if (!varMap.nosgk) cuts.push({ code: 'SGK_PRIM', name: 'SGK (BAĞ-KUR) PRİM KESİNTİSİ', pct: 1 });
        d.cuts = cuts;
        sup.sms = [pick(r, SMS_PROVIDERS), vkn(`sms:${seed}`)];
        d.customer = { ...d.customer, code: [digits(r, 6), 'SMS'] };
        const acct = iban(`${seed}:ciftci`);
        d.payment = { code: '42', due: addDays(date, 2), iban: acct.iban, bank: `${acct.bank} (üretici hesabı)` };
        d.delivery = { date: addDays(date, -1) };
        info.push(`CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %${isH ? 1 : 2} (${isH ? 'hayvan / hayvansal ürün' : 'zirai ürün'})${varMap.borsa ? ', 8001 borsa tescil %0,2' : ''}${varMap.mera ? ', 9040 mera fonu %0,2' : ''}${varMap.nosgk ? '' : ', SGK_PRIM Bağ-Kur %1'}. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.`);
        tags.push(isH ? 'Stopaj %1' : 'Stopaj %2');
        break;
    }
    case 'gider': {
        sup.sms = [pick(r, SMS_PROVIDERS), vkn(`sms:${seed}`)];
        if (varMap.iade) {
            d.type = 'IADE'; sub[1] = 'IADE';
            K.title = 'e-Gider Pusulası · İade'; K.roles = ['Düzenleyen (İadeyi Alan)', 'İade Eden Müşteri']; K.billingLabel = 'İade Edilen Fatura';
            d.billing = { id: doc.iade?.[0] ?? `${pre}2026${pad(1 + ((h >>> 3) % 99999), 9)}`, date: doc.iade?.[1] ?? addDays(date, -9), scheme: 'EARSIV_FATURA' };
            d.customer = { ...d.customer, code: [digits(r, 6), 'IADEKODU'] };
            d.delivery = { date, carrier: carrier(seed) };
            d.payment = doc.pay ? d.payment : { code: '48', due: date, note: 'İade tutarı müşterinin kartına iade edilmiştir.' };
            info.push('CreditNote · GIDERPUSULASI · CreditNoteTypeCode IADE: BillingReference/InvoiceDocumentReference (schemeID EARSIV_FATURA) iade edilen e-Arşiv faturası; müşteri Contact ID = iade onay kodu, Name IADEKODU; Delivery/DeliveryParty iade kargosu. Satırlarda iade edilen KDV (0015).');
            tags.push('İade');
        } else {
            const st = Number(varMap.stopaj ?? 0);
            if (st) d.cuts = [{ code: '0003', name: 'GELİR VERGİSİ S. (MUHTASAR)', pct: st }];
            d.customer = { ...d.customer, code: [digits(r, 6), 'SMS'] };
            info.push(`CreditNote · TR1.2.1 · ProfileID GIDERPUSULASI · CreditNoteTypeCode SATIS. Belge vermeyen (vergiden muaf / ÇKS'siz) satıcı AccountingCustomerParty (TCKN + Person, SMS kodu); düzenleyen SMS_PROVIDER.${st ? ` GV stopajı 0003 %${st} (GVK 94/13) TaxTotal'da, ödenecekten düşülür.` : ' Stopaj yok.'}`);
            if (st) tags.push(`Stopaj %${st}`);
        }
        break;
    }
    case 'kmaden': {
        sup.ids.push(['SUBENO', doc.sube ?? `${ascii(city).slice(0, 3)}-${digits(r, 4)}`]);
        d.customer = { ...d.customer, ids: [...d.customer.ids, ['MUSTERITURU', 'GERCEKKISI']] };
        d.docs.push({ id: `${digits(r, 3)}.${digits(r, 3)}.${digits(r, 4)}`, typeCode: 'ISTATISTIKNO' });
        d.kdvRow = { reason: 'Vergi mükellefi olmayan gerçek kişiden hurda / kullanılmış kıymetli maden alımı; KDV hesaplanmamıştır.' };
        d.payment = doc.pay ? d.payment : { code: '46', note: 'Bedel müşterinin hesabına EFT ile ödenmiştir.' };
        info.push('CreditNote · ProfileID EKIYMETLIMADENBELGE · CreditNoteTypeCode ALIM: müessese PartyIdentification SUBENO; müşteri MUSTERITURU (GERCEKKISI / TUZELKISI); AdditionalDocumentReference DocumentTypeCode ISTATISTIKNO; miktar GRM (gram), ayar / milyem satır ek alanı; KDV satırı %0 + açıklama.');
        tags.push('Gram / ayar');
        break;
    }
    case 'irsaliye': {
        if (varMap.hks) {
            d.profile = 'HKSIRSALIYE'; sub[0] = 'HKSIRSALIYE';
            d.lines.forEach((l, j) => { l.props = { KUNYENO: `26${date.slice(5, 7)}${digits(rng(`${seed}:k${j}`), 15)}`, ...(l.props ?? {}) }; });
            info.push('ProfileID HKSIRSALIYE; satırlarda KUNYENO (Hal Kayıt Sistemi künyesi).');
            tags.push('HKS künye');
        }
        if (varMap.idis) {
            d.profile = 'IDISIRSALIYE'; sub[0] = 'IDISIRSALIYE';
            sup.ids.push(['SEVKIYATNO', `SE-${digits(r, 7)}`]);
            d.lines.forEach((l, j) => { l.props = { ETIKETNO: `${ascii(prof.f).slice(0, 2)}${digits(rng(`${seed}:e${j}`), 7)}`, ...(l.props ?? {}) }; });
            info.push('ProfileID IDISIRSALIYE; gönderici SEVKIYATNO, satırlarda ETIKETNO.');
            tags.push('IDIS');
        }
        const pl = plate(seed, cityPlate(city));
        const drv = person(`${seed}:sofor`, city);
        const kg = doc.kg ?? r2(d.lines.reduce((a, l) => a + (l.unit === 'KGM' ? l.qty : l.unit === 'TNE' ? l.qty * 1000 : l.qty * (l.kg ?? 1)), 0));
        d.ship = {
            id: '1', kg, units: doc.kap ?? d.lines.length, value: doc.value, plate: pl,
            trailer: doc.dorse ? plate(`${seed}:dorse`, cityPlate(city)) : undefined,
            driver: [drv.person[0], drv.person[1], drv.ids[0][1]], carrier: doc.tasiyici ? carrier(seed) : undefined,
            addr: d.customer.addr, date, time: `${pad(7 + (h % 9))}:15:00`,
        };
        if (!varMap.hks && !varMap.idis) info.push('DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.');
        else info.push('DespatchAdvice: Shipment/ShipmentStage plaka + şoför, Delivery/Despatch fiili sevk tarih-saat zorunlu.');
        break;
    }
    default:
    }

    if (base === 'arsiv' && !info.some((s) => s.includes('EARSIVFATURA'))) info.unshift(`ProfileID EARSIVFATURA · InvoiceTypeCode ${d.type}.`);
    if (doc.roles) K.roles = doc.roles;

    const built = K.fam === 'invoice' ? invoice(d) : K.fam === 'credit' ? creditNote(d) : despatch(d);
    const feat = {
        disc: d.lines.some((l) => l.disc), extra: d.lines.some((l) => l.taxes?.length), wh: !!d.withholding && K.fam === 'invoice',
        exp: base === 'ihracat', cuts: !!d.cuts?.length, kdv: K.fam === 'credit' && (d.lines.some((l) => l.kdv) || !!d.kdvRow),
    };
    K.subtitle = sub.join(' · ');
    const slugN = doc.slug ?? slug(doc.n);
    return {
        id: `meslek-${prof.code.toLowerCase().replace('.', '')}-${slugN}`,
        K, xml: built.xml, totals: built.totals, feat, sub: K.subtitle,
        meta: { base, docTypeId: KB.doc, moduleId: KB.module, label: KB.label, tags, info, profile: d.profile, type: d.type },
    };
}

const PLATES = { İstanbul: '34', Ankara: '06', İzmir: '35', Bursa: '16', Antalya: '07', Konya: '42', Gaziantep: '27', Kayseri: '38', Adana: '01', Mersin: '33', Samsun: '55', Trabzon: '61', Eskişehir: '26', Denizli: '20', Kocaeli: '41', Manisa: '45', Hatay: '31', Erzurum: '25', Malatya: '44', Muğla: '48', Sakarya: '54', Tekirdağ: '59', Afyonkarahisar: '03', Diyarbakır: '21', Ordu: '52', Balıkesir: '10', Rize: '53', Nevşehir: '50', Çanakkale: '17', Kahramanmaraş: '46' };
const cityPlate = (c) => PLATES[c] ?? '06';
