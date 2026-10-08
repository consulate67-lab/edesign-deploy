// Meslek şablonları için tekrarlanabilir (tohumlu) kurgusal veri: adres, kişi, VKN / TCKN / IBAN (denetim
// haneleri geçerli), plaka ve yabancı alıcılar. Aynı meslek kodu her çalıştırmada aynı veriyi üretir.

export const hashStr = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    return h;
};
export const rng = (seed) => {
    let a = hashStr(String(seed));
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const digits = (r, n) => Array.from({ length: n }, () => Math.floor(r() * 10)).join('');

export function tckn(seed) {
    const r = rng(`tckn:${seed}`);
    const d = [1 + Math.floor(r() * 9), ...Array.from({ length: 8 }, () => Math.floor(r() * 10))];
    const d10 = (((d[0] + d[2] + d[4] + d[6] + d[8]) * 7 - (d[1] + d[3] + d[5] + d[7])) % 10 + 10) % 10;
    const d11 = (d.reduce((a, x) => a + x, 0) + d10) % 10;
    return [...d, d10, d11].join('');
}

export function vkn(seed) {
    const r = rng(`vkn:${seed}`);
    const d = Array.from({ length: 9 }, () => Math.floor(r() * 10));
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        const tmp = (d[i] + (9 - i)) % 10;
        let v = (tmp * 2 ** (9 - i)) % 9;
        if (tmp !== 0 && v === 0) v = 9;
        sum += v;
    }
    return [...d, (10 - (sum % 10)) % 10].join('');
}

export const BANKS = [
    ['00010', 'T.C. Ziraat Bankası'], ['00012', 'Türkiye Halk Bankası'], ['00015', 'Türkiye Vakıflar Bankası'],
    ['00064', 'Türkiye İş Bankası'], ['00062', 'Türkiye Garanti Bankası'], ['00046', 'Akbank'],
    ['00067', 'Yapı ve Kredi Bankası'], ['00134', 'Denizbank'], ['00032', 'Türk Ekonomi Bankası'], ['00205', 'Kuveyt Türk Katılım Bankası'],
];

export function iban(seed) {
    const r = rng(`iban:${seed}`);
    const [code, name] = pick(r, BANKS);
    const bban = `${code}0${digits(r, 16)}`;
    const num = BigInt(`${bban}292700`);
    const check = String(98n - (num % 97n)).padStart(2, '0');
    return { iban: `TR${check}${bban}`, bank: name };
}

export const CITIES = [
    { city: 'İstanbul', tel: '0212', plate: '34', zip: '34', d: [['Fatih', 'Fatih'], ['Şişli', 'Şişli'], ['Bağcılar', 'Bağcılar'], ['Ümraniye', 'Ümraniye'], ['Kadıköy', 'Kadıköy'], ['Beylikdüzü', 'Beylikdüzü']] },
    { city: 'Ankara', tel: '0312', plate: '06', zip: '06', d: [['Çankaya', 'Çankaya'], ['Yenimahalle', 'Ostim'], ['Altındağ', 'Ulus'], ['Keçiören', 'Keçiören'], ['Etimesgut', 'Etimesgut']] },
    { city: 'İzmir', tel: '0232', plate: '35', zip: '35', d: [['Konak', 'Kordon'], ['Bornova', 'Bornova'], ['Karşıyaka', 'Karşıyaka'], ['Buca', 'Buca'], ['Torbalı', 'Torbalı']] },
    { city: 'Bursa', tel: '0224', plate: '16', zip: '16', d: [['Osmangazi', 'Çekirge'], ['Nilüfer', 'Ertuğrulgazi'], ['Yıldırım', 'Yıldırım'], ['İnegöl', 'İnegöl']] },
    { city: 'Antalya', tel: '0242', plate: '07', zip: '07', d: [['Muratpaşa', 'Muratpaşa'], ['Kepez', 'Kalekapı'], ['Alanya', 'Alanya'], ['Manavgat', 'Manavgat']] },
    { city: 'Konya', tel: '0332', plate: '42', zip: '42', d: [['Selçuklu', 'Selçuk'], ['Karatay', 'Mevlana'], ['Meram', 'Meram'], ['Ereğli', 'Ereğli']] },
    { city: 'Gaziantep', tel: '0342', plate: '27', zip: '27', d: [['Şahinbey', 'Şehitkamil'], ['Şehitkamil', 'Suburcu'], ['Nizip', 'Nizip']] },
    { city: 'Kayseri', tel: '0352', plate: '38', zip: '38', d: [['Melikgazi', 'Erciyes'], ['Kocasinan', 'Kocasinan'], ['Talas', 'Talas']] },
    { city: 'Adana', tel: '0322', plate: '01', zip: '01', d: [['Seyhan', '5 Ocak'], ['Çukurova', 'Çukurova'], ['Ceyhan', 'Ceyhan']] },
    { city: 'Mersin', tel: '0324', plate: '33', zip: '33', d: [['Akdeniz', 'Uray'], ['Yenişehir', 'Liman'], ['Tarsus', 'Tarsus'], ['Silifke', 'Silifke']] },
    { city: 'Samsun', tel: '0362', plate: '55', zip: '55', d: [['İlkadım', 'Gaziler'], ['Atakum', '19 Mayıs'], ['Bafra', 'Bafra'], ['Çarşamba', 'Çarşamba']] },
    { city: 'Trabzon', tel: '0462', plate: '61', zip: '61', d: [['Ortahisar', 'Karadeniz'], ['Akçaabat', 'Akçaabat'], ['Of', 'Of']] },
    { city: 'Eskişehir', tel: '0222', plate: '26', zip: '26', d: [['Odunpazarı', 'Anadolu'], ['Tepebaşı', 'Kurtuluş']] },
    { city: 'Denizli', tel: '0258', plate: '20', zip: '20', d: [['Merkezefendi', 'Gökpınar'], ['Pamukkale', 'Pamukkale'], ['Buldan', 'Buldan']] },
    { city: 'Kocaeli', tel: '0262', plate: '41', zip: '41', d: [['İzmit', 'Tepecik'], ['Gebze', 'Gebze'], ['Dilovası', 'Gebze']] },
    { city: 'Manisa', tel: '0236', plate: '45', zip: '45', d: [['Yunusemre', 'Mesir'], ['Akhisar', 'Akhisar'], ['Turgutlu', 'Turgutlu']] },
    { city: 'Hatay', tel: '0326', plate: '31', zip: '31', d: [['Antakya', 'Antakya'], ['İskenderun', 'Sahil'], ['Dörtyol', 'Dörtyol']] },
    { city: 'Erzurum', tel: '0442', plate: '25', zip: '25', d: [['Yakutiye', 'Aziziye'], ['Palandöken', 'Kazımkarabekir']] },
    { city: 'Malatya', tel: '0422', plate: '44', zip: '44', d: [['Battalgazi', 'Fırat'], ['Yeşilyurt', 'Beydağı']] },
    { city: 'Muğla', tel: '0252', plate: '48', zip: '48', d: [['Bodrum', 'Bodrum'], ['Fethiye', 'Fethiye'], ['Marmaris', 'Marmaris'], ['Menteşe', 'Muğla']] },
    { city: 'Sakarya', tel: '0264', plate: '54', zip: '54', d: [['Adapazarı', 'Gümrükönü'], ['Serdivan', 'Sakarya'], ['Hendek', 'Hendek']] },
    { city: 'Tekirdağ', tel: '0282', plate: '59', zip: '59', d: [['Süleymanpaşa', 'Süleymanpaşa'], ['Çorlu', 'Çorlu'], ['Çerkezköy', 'Çerkezköy']] },
    { city: 'Afyonkarahisar', tel: '0272', plate: '03', zip: '03', d: [['Merkez', 'Tınaztepe'], ['Sandıklı', 'Sandıklı']] },
    { city: 'Diyarbakır', tel: '0412', plate: '21', zip: '21', d: [['Bağlar', 'Gökalp'], ['Kayapınar', 'Süleyman Nazif']] },
    { city: 'Ordu', tel: '0452', plate: '52', zip: '52', d: [['Altınordu', 'Boztepe'], ['Ünye', 'Ünye'], ['Fatsa', 'Fatsa']] },
    { city: 'Balıkesir', tel: '0266', plate: '10', zip: '10', d: [['Karesi', 'Kurtdereli'], ['Altıeylül', 'Karesi'], ['Bandırma', 'Bandırma'], ['Ayvalık', 'Ayvalık']] },
    { city: 'Rize', tel: '0464', plate: '53', zip: '53', d: [['Merkez', 'Rize'], ['Çayeli', 'Çayeli'], ['Pazar', 'Pazar']] },
    { city: 'Nevşehir', tel: '0384', plate: '50', zip: '50', d: [['Ürgüp', 'Ürgüp'], ['Avanos', 'Avanos'], ['Merkez', 'Nevşehir']] },
    { city: 'Çanakkale', tel: '0286', plate: '17', zip: '17', d: [['Merkez', 'Çanakkale'], ['Biga', 'Biga'], ['Ayvacık', 'Ayvacık']] },
    { city: 'Kahramanmaraş', tel: '0344', plate: '46', zip: '46', d: [['Onikişubat', 'Aslanbey'], ['Dulkadiroğlu', 'Aslanbey']] },
];
export const cityByName = (name) => CITIES.find((c) => c.city === name);

const MAH = ['Cumhuriyet', 'Atatürk', 'Yeni', 'Fatih', 'Hürriyet', 'Gazi', 'Yıldız', 'Çarşı', 'İstiklal', 'Barbaros', 'Mimar Sinan', 'Orhangazi', 'Sanayi', 'Kurtuluş', 'Yavuz Selim', 'Esentepe', 'Gültepe', 'Bahçelievler'];
const CAD = ['Atatürk Cad.', 'İnönü Cad.', 'Cumhuriyet Cad.', 'Gazi Bulvarı', 'Çarşı Sok.', 'Lale Sok.', 'Menekşe Sok.', 'Fevzi Çakmak Cad.', 'Mevlana Cad.', 'Ankara Yolu Cad.', 'Sanayi Cad.', 'Kordon Boyu Cad.', 'Zafer Sok.', 'Gül Sok.', 'Karanfil Sok.', 'Hal Yolu Cad.'];

/** Adres; sanayi=true ise sanayi sitesi / OSB adresi. */
export function addr(seed, cityName, opt = {}) {
    const r = rng(`addr:${seed}`);
    const c = (cityName && cityByName(cityName)) || pick(r, CITIES);
    const [district, vd] = pick(r, c.d);
    const street = opt.sanayi
        ? `${pick(r, ['Organize Sanayi Bölgesi', 'Küçük Sanayi Sitesi', 'Sanayi Sitesi'])} ${1 + Math.floor(r() * 12)}. Cad.`
        : `${pick(r, MAH)} Mah. ${pick(r, CAD)}`;
    return {
        a: { street, no: opt.no ?? `${1 + Math.floor(r() * 140)}${r() < 0.3 ? `/${1 + Math.floor(r() * 9)}` : ''}`, district, city: c.city, zip: `${c.zip}${digits(r, 3)}` },
        vd, tel: `${c.tel} ${digits(r, 3)} ${digits(r, 2)} ${digits(r, 2)}`, plate: c.plate, city: c.city,
    };
}

const AD_E = ['Mehmet', 'Ahmet', 'Mustafa', 'Hüseyin', 'Hasan', 'İbrahim', 'Murat', 'Emre', 'Burak', 'Serkan', 'Kemal', 'Osman', 'Yusuf', 'Ömer', 'Ali', 'Cem', 'Tolga', 'Kaan', 'Halil', 'Recep', 'Erkan', 'Selim', 'Barış', 'Onur'];
const AD_K = ['Ayşe', 'Fatma', 'Zeynep', 'Elif', 'Emine', 'Hatice', 'Merve', 'Esra', 'Büşra', 'Selin', 'Deniz', 'Ebru', 'Gül', 'Derya', 'Özlem', 'Sibel', 'Nur', 'Canan', 'Gizem', 'Pınar', 'Aslı', 'Melike', 'Dilek', 'Sevgi'];
const SOYAD = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat', 'Korkmaz', 'Erdoğan', 'Güneş', 'Aksoy', 'Tekin', 'Bulut', 'Turan', 'Uçar', 'Akın', 'Keskin', 'Ateş'];

export function person(seed, cityName) {
    const r = rng(`kisi:${seed}`);
    const ad = pick(r, r() < 0.5 ? AD_E : AD_K);
    const soyad = pick(r, SOYAD);
    const ad2 = addr(`kisi:${seed}`, cityName);
    const slug = (s) => s.toLocaleLowerCase('tr').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
    return {
        ids: [['TCKN', tckn(seed)]], person: [ad, soyad], addr: ad2.a,
        tel: `05${pick(r, ['32', '33', '35', '42', '44', '05', '06', '52', '55', '59'])} ${digits(r, 3)} ${digits(r, 2)} ${digits(r, 2)}`,
        mail: r() < 0.6 ? `${slug(ad)}.${slug(soyad)}@example.com` : undefined,
    };
}

export const domainOf = (name) => name.toLocaleLowerCase('tr')
    .replace(/\b(ltd|şti|a\.ş|tic|san|ve|ltd\.|şti\.|a\.ş\.|tic\.|san\.|ticaret|sanayi|limited|şirketi|anonim)\b\.?/g, ' ')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/â/g, 'a').replace(/î/g, 'i')
    .replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/).slice(0, 2).join('');

/** Firma (VKN'li). */
export function firm(seed, name, cityName, opt = {}) {
    const ad = addr(`firma:${seed}`, cityName, opt);
    const dom = domainOf(name);
    return {
        ids: [['VKN', vkn(seed)], ...(opt.mersis ? [['MERSISNO', `0${vkn(seed)}00001${Math.floor(rng(seed)() * 9)}`]] : [])],
        name, addr: ad.a, vd: ad.vd, tel: ad.tel, mail: `${opt.mailUser ?? 'info'}@${dom}.com.tr`, web: opt.web ? `https://www.${dom}.com.tr` : undefined,
    };
}

export const FOREIGN = {
    DE: [{ name: 'Rheinland Handelshaus GmbH', street: 'Hansaallee 214', city: 'Düsseldorf', district: 'Nordrhein-Westfalen', zip: '40549', country: 'Almanya' }, { name: 'Bayern Import KG', street: 'Landsberger Str. 302', city: 'München', district: 'Bayern', zip: '80687', country: 'Almanya' }],
    NL: [{ name: 'Van der Berg Trading B.V.', street: 'Waalhaven Z.z. 44', city: 'Rotterdam', district: 'Zuid-Holland', zip: '3089 JH', country: 'Hollanda' }],
    GB: [{ name: 'Thames Valley Supplies Ltd.', street: '18 Bath Road', city: 'Reading', district: 'Berkshire', zip: 'RG1 6NB', country: 'Birleşik Krallık' }],
    FR: [{ name: 'Maison Duval SARL', street: '27 Rue de la République', city: 'Lyon', district: 'Auvergne-Rhône-Alpes', zip: '69002', country: 'Fransa' }],
    US: [{ name: 'Lakeshore Imports LLC', street: '1450 W Fulton St', city: 'Chicago', district: 'Illinois', zip: '60607', country: 'Amerika Birleşik Devletleri' }],
    AE: [{ name: 'Al Noor General Trading LLC', street: 'Al Maktoum Rd, Deira', city: 'Dubai', district: 'Dubai', zip: '00000', country: 'Birleşik Arap Emirlikleri' }],
    IQ: [{ name: 'Dijla Trading Company', street: '60 Meter St.', city: 'Erbil', district: 'Kürdistan Bölgesi', zip: '44001', country: 'Irak' }],
    GE: [{ name: 'Batumi Market Group LLC', street: 'Chavchavadze St. 51', city: 'Batum', district: 'Acara', zip: '6010', country: 'Gürcistan' }],
    RO: [{ name: 'Carpati Distributie SRL', street: 'Bd. Iuliu Maniu 7', city: 'Bükreş', district: 'Sektör 6', zip: '061072', country: 'Romanya' }],
    IT: [{ name: 'Lombardia Forniture S.r.l.', street: 'Via Mecenate 76', city: 'Milano', district: 'Lombardia', zip: '20138', country: 'İtalya' }],
    AZ: [{ name: 'Xəzər Ticarət MMC', street: 'Nizami küç. 92', city: 'Bakü', district: 'Nəsimi', zip: 'AZ1010', country: 'Azerbaycan' }],
    SA: [{ name: 'Al Riyadh Building Materials Co.', street: 'King Fahd Rd', city: 'Riyad', district: 'Al Olaya', zip: '12214', country: 'Suudi Arabistan' }],
};

export function foreignFirm(seed, cc) {
    const r = rng(`yabanci:${seed}`);
    const f = pick(r, FOREIGN[cc]);
    return {
        ids: [['VKN', '2222222222']], name: f.name,
        addr: { street: f.street, district: f.district, city: f.city, zip: f.zip, cc, country: f.country },
        tel: `+${digits(r, 2)} ${digits(r, 3)} ${digits(r, 4)}`, mail: `purchasing@${domainOf(f.name)}.com`,
    };
}

const TOURISTS = [
    ['James', 'Whitmore', 'GB', 'Birleşik Krallık', 'Manchester', 'Greater Manchester', 'M1 4BT'],
    ['Anna', 'Schneider', 'DE', 'Almanya', 'Hamburg', 'Hamburg', '20095'],
    ['Lucas', 'Martin', 'FR', 'Fransa', 'Bordeaux', 'Nouvelle-Aquitaine', '33000'],
    ['Emily', 'Carter', 'US', 'Amerika Birleşik Devletleri', 'Boston', 'Massachusetts', '02108'],
    ['Sofia', 'Rossi', 'IT', 'İtalya', 'Torino', 'Piemonte', '10121'],
    ['Daan', 'de Vries', 'NL', 'Hollanda', 'Utrecht', 'Utrecht', '3511'],
    ['Olga', 'Ivanova', 'KZ', 'Kazakistan', 'Almatı', 'Almatı', '050000'],
    ['Hiroshi', 'Tanaka', 'JP', 'Japonya', 'Osaka', 'Osaka', '530-0001'],
];

export function tourist(seed) {
    const r = rng(`turist:${seed}`);
    const [ad, soyad, cc, country, city, district, zip] = pick(r, TOURISTS);
    return {
        ids: [['PARTYTYPE', 'TAXFREE']], person: [ad, soyad], nationality: cc,
        passport: [`${cc === 'US' ? '' : cc}${digits(r, 8)}`, `2023-0${1 + Math.floor(r() * 9)}-1${Math.floor(r() * 9)}`],
        addr: { street: `${1 + Math.floor(r() * 90)} ${pick(r, ['High Street', 'Hauptstraße', 'Rue Centrale', 'Main Street', 'Via Roma', 'Kerkstraat'])}`, district, city, zip, cc, country },
        mail: `${ad.toLowerCase()}.${soyad.toLowerCase().replace(/\s/g, '')}@example.com`,
    };
}

export function plate(seed, cityPlate) {
    const r = rng(`plaka:${seed}`);
    const L = 'ABCDEFGHJKLMNPRSTUVYZ';
    const letters = Array.from({ length: 1 + Math.floor(r() * 3) }, () => L[Math.floor(r() * L.length)]).join('');
    return `${cityPlate}${letters}${100 + Math.floor(r() * 899)}`;
}

export const CARRIERS = [
    { name: 'Hızır Kargo ve Lojistik A.Ş.', city: 'İstanbul' },
    { name: 'Pusula Kargo Taşımacılık A.Ş.', city: 'Ankara' },
    { name: 'Rüzgâr Ekspres Kurye Hizmetleri Ltd. Şti.', city: 'İzmir' },
    { name: 'Anadolu Hat Nakliyat Ltd. Şti.', city: 'Konya' },
];
export function carrier(seed) {
    const r = rng(`tasiyici:${seed}`);
    const c = pick(r, CARRIERS);
    return firm(`tasiyici:${c.name}`, c.name, c.city);
}

export { pick, digits };
