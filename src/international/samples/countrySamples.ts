/**
 * Ülke örnek verileri: kurgusal firmalar, yerel adres ve kimlik biçimleri.
 * IBAN'lar ulusal IBAN kayıtlarındaki örnek numaralardır; KDV oranları
 * 2026 standart oranlarıdır (Avrupa Komisyonu oran tablosu).
 */
import type { CountryCode } from '../registry/countryProfiles';

export interface SampleParty {
    name: string;
    legal: string;
    street: string;
    city: string;
    postal: string;
    /** KDV kimliği (ülke önekiyle) ya da AB dışı ulusal vergi no. */
    vat: string;
    /** Peppol EAS şeması ve elektronik adres. */
    endpoint: [scheme: string, id: string];
    /** Ticaret sicili / şirket no (şema boş olabilir). */
    reg?: [scheme: string, id: string];
    contact?: [name: string, phone: string, email: string];
}

export interface CountrySample {
    seller: SampleParty;
    buyer: SampleParty;
    iban: string;
    bic: string;
    /** Fatura numarası öneki (ör. RE, F, FT). */
    prefix: string;
    carrier: string;
    /** Standart KDV oranı (%). */
    rate: number;
    /** EUR fiyatlarına göre çarpan (yerel para birimi). */
    scale: number;
    /** Alıcı referansı (DE: Leitweg-ID). */
    buyerRef?: string;
}

const p = (
    name: string, legal: string, street: string, postal: string, city: string, vat: string,
    endpoint: [string, string], reg?: [string, string], contact?: [string, string, string],
): SampleParty => ({ name, legal, street, postal, city, vat, endpoint, reg, contact });

export const COUNTRY_SAMPLES: Record<CountryCode, CountrySample> = {
    AT: {
        seller: p('Huber Büromöbel', 'Huber Büromöbel GmbH', 'Mariahilfer Straße 88', '1070', 'Wien', 'ATU12345678', ['9914', 'ATU12345678'], ['', 'FN 123456a'], ['Martina Huber', '+43 1 523 44 10', 'rechnung@huber-bueromoebel.at']),
        buyer: p('Gasthof Alpenblick', 'Alpenblick Gastronomie KG', 'Dorfstraße 5', '6020', 'Innsbruck', 'ATU87654321', ['9914', 'ATU87654321']),
        iban: 'AT611904300234573201', bic: 'BKAUATWW', prefix: 'RE', carrier: 'Alpen Spedition GmbH', rate: 20, scale: 1,
    },
    BE: {
        seller: p('Atelier Lumière', 'Atelier Lumière SRL', 'Rue de la Loi 12', '1000', 'Bruxelles', 'BE0477472701', ['0208', '0477472701'], ['0208', '0477472701'], ['Claire Dubois', '+32 2 555 18 40', 'facturation@atelier-lumiere.be']),
        buyer: p('Brasserie du Parc', 'Brasserie du Parc SA', 'Avenue Louise 250', '1050', 'Ixelles', 'BE0403170701', ['0208', '0403170701'], ['0208', '0403170701']),
        iban: 'BE68539007547034', bic: 'GKCCBEBB', prefix: 'F', carrier: 'Benelux Express NV', rate: 21, scale: 1,
    },
    BG: {
        seller: p('Офис Комфорт', 'Офис Комфорт ЕООД', 'бул. Витоша 45', '1000', 'София', 'BG123456789', ['9926', 'BG123456789'], ['', '123456789'], ['Мария Петрова', '+359 2 981 22 33', 'faktura@ofis-komfort.bg']),
        buyer: p('Хотел Черно море', 'Черно море АД', 'ул. Приморска 12', '9000', 'Варна', 'BG987654321', ['9926', 'BG987654321']),
        iban: 'BG80BNBG96611020345678', bic: 'BNBGBGSD', prefix: 'Ф', carrier: 'Еконт Експрес', rate: 20, scale: 1,
    },
    HR: {
        seller: p('Uredski Namještaj Horvat', 'Horvat Namještaj d.o.o.', 'Ilica 120', '10000', 'Zagreb', 'HR12345678901', ['9934', 'HR12345678901'], ['', '12345678901'], ['Ana Horvat', '+385 1 4833 210', 'racuni@horvat-namjestaj.hr']),
        buyer: p('Hotel Jadran', 'Jadran Turizam d.d.', 'Obala kneza Branimira 8', '21000', 'Split', 'HR98765432109', ['9934', 'HR98765432109']),
        iban: 'HR1210010051863000160', bic: 'HNBAHR2X', prefix: 'R', carrier: 'Overseas Express d.o.o.', rate: 25, scale: 1,
    },
    CY: {
        seller: p('Γραφείο Άνεση', 'Grafeio Anesi Ltd', 'Λεωφόρος Μακαρίου 44', '1065', 'Λευκωσία', 'CY10123456X', ['9928', 'CY10123456X'], ['', 'HE123456'], ['Ελένη Γεωργίου', '+357 22 445566', 'invoices@anesi.com.cy']),
        buyer: p('Ξενοδοχείο Θάλασσα', 'Thalassa Hotels Ltd', 'Λεωφόρος Γρίβα Διγενή 20', '3041', 'Λεμεσός', 'CY10987654Z', ['9928', 'CY10987654Z']),
        iban: 'CY17002001280000001200527600', bic: 'BCYPCY2N', prefix: 'ΤΙΜ', carrier: 'ACS Courier', rate: 19, scale: 1,
    },
    CZ: {
        seller: p('Kancelářský nábytek Novák', 'Novák nábytek s.r.o.', 'Václavské náměstí 21', '110 00', 'Praha 1', 'CZ12345678', ['9929', 'CZ12345678'], ['', '12345678'], ['Petra Nováková', '+420 224 123 456', 'fakturace@novak-nabytek.cz']),
        buyer: p('Hotel Morava', 'Morava Hotels a.s.', 'Masarykova 34', '602 00', 'Brno', 'CZ87654321', ['9929', 'CZ87654321']),
        iban: 'CZ6508000000192000145399', bic: 'GIBACZPX', prefix: 'FV', carrier: 'PPL CZ s.r.o.', rate: 21, scale: 25,
    },
    DK: {
        seller: p('Hansen Kontormøbler', 'Hansen Kontormøbler ApS', 'Vesterbrogade 54', '1620', 'København V', 'DK12345678', ['0184', '12345678'], ['0184', '12345678'], ['Mette Hansen', '+45 33 12 34 56', 'faktura@hansen-kontor.dk']),
        buyer: p('Café Havnen', 'Havnen Restauration A/S', 'Havnegade 3', '8000', 'Aarhus C', 'DK87654321', ['0184', '87654321']),
        iban: 'DK5000400440116243', bic: 'DABADKKK', prefix: 'F', carrier: 'DanFragt A/S', rate: 25, scale: 7.5,
    },
    EE: {
        seller: p('Kontorimööbel Tamm', 'Tamm Mööbel OÜ', 'Narva mnt 7', '10117', 'Tallinn', 'EE123456789', ['9931', 'EE123456789'], ['0191', '12345678'], ['Kadri Tamm', '+372 612 3456', 'arved@tamm-moobel.ee']),
        buyer: p('Hotell Emajõgi', 'Emajõe Hotellid AS', 'Riia 15', '51010', 'Tartu', 'EE987654321', ['9931', 'EE987654321']),
        iban: 'EE382200221020145685', bic: 'HABAEE2X', prefix: 'A', carrier: 'DPD Eesti AS', rate: 24, scale: 1,
    },
    FI: {
        seller: p('Toimistokaluste Virtanen', 'Virtanen Kalusteet Oy', 'Mannerheimintie 22', '00100', 'Helsinki', 'FI12345678', ['0216', '003712345678'], ['0037', '1234567-8'], ['Laura Virtanen', '+358 9 123 4567', 'laskutus@virtanen-kalusteet.fi']),
        buyer: p('Hotelli Aura', 'Aura Hotellit Oy', 'Aurakatu 10', '20100', 'Turku', 'FI87654321', ['0216', '003787654321']),
        iban: 'FI2112345600000785', bic: 'NDEAFIHH', prefix: 'L', carrier: 'Posti Oy', rate: 25.5, scale: 1,
    },
    FR: {
        seller: p('Mobilier Bureau Martin', 'Martin Mobilier SAS', '18 rue de Rivoli', '75004', 'Paris', 'FR40303265045', ['0009', '30326504500024'], ['0002', '303265045'], ['Sophie Martin', '+33 1 42 76 40 40', 'facturation@martin-mobilier.fr']),
        buyer: p('Hôtel des Lumières', 'Hôtel des Lumières SARL', '5 place Bellecour', '69002', 'Lyon', 'FR82552100554', ['0009', '55210055400013'], ['0002', '552100554']),
        iban: 'FR1420041010050500013M02606', bic: 'PSSTFRPP', prefix: 'F', carrier: 'Transports Durand', rate: 20, scale: 1,
    },
    DE: {
        seller: p('Müller Büroeinrichtung', 'Müller Büroeinrichtung GmbH', 'Hauptstraße 15', '10115', 'Berlin', 'DE123456789', ['EM', 'rechnung@mueller-buero.de'], ['', 'HRB 104582 B'], ['Anna Müller', '+49 30 1234567', 'rechnung@mueller-buero.de']),
        buyer: p('Bezirksamt Mitte', 'Bezirksamt Mitte von Berlin', 'Karl-Marx-Allee 31', '10178', 'Berlin', 'DE811234567', ['EM', 'e-rechnung@ba-mitte.berlin.de']),
        iban: 'DE89370400440532013000', bic: 'COBADEFFXXX', prefix: 'RE', carrier: 'Spedition Schneider GmbH', rate: 19, scale: 1,
        buyerRef: '04011000-1234512345-06',
    },
    GR: {
        seller: p('Έπιπλα Γραφείου Παπαδόπουλος', 'Papadopoulos Epipla A.E.', 'Οδός Ερμού 45', '105 63', 'Αθήνα', 'EL123456789', ['9933', 'EL123456789'], ['', '123456789000'], ['Μαρία Παπαδοπούλου', '+30 210 3214567', 'timologia@papadopoulos-epipla.gr']),
        buyer: p('Ξενοδοχείο Αιγαίο', 'Aigaio Xenodocheia A.E.', 'Λεωφόρος Νίκης 12', '546 24', 'Θεσσαλονίκη', 'EL987654321', ['9933', 'EL987654321']),
        iban: 'GR1601101250000000012300695', bic: 'ETHNGRAA', prefix: 'ΤΠΥ', carrier: 'ACS Courier', rate: 24, scale: 1,
    },
    HU: {
        seller: p('Kovács Irodabútor', 'Kovács Irodabútor Kft.', 'Andrássy út 60', '1062', 'Budapest', 'HU12345678', ['9910', 'HU12345678'], ['', '01-09-123456'], ['Kovács Eszter', '+36 1 234 5678', 'szamla@kovacs-irodabutor.hu']),
        buyer: p('Hotel Duna', 'Duna Szálloda Zrt.', 'Széchenyi tér 4', '6720', 'Szeged', 'HU87654321', ['9910', 'HU87654321']),
        iban: 'HU42117730161111101800000000', bic: 'OTPVHUHB', prefix: 'SZ', carrier: 'GLS Hungary Kft.', rate: 27, scale: 400,
    },
    IE: {
        seller: p('Murphy Office Furniture', 'Murphy Office Furniture Ltd', '22 Grafton Street', 'D02 VX63', 'Dublin 2', 'IE1234567T', ['9935', 'IE1234567T'], ['', '654321'], ['Siobhán Murphy', '+353 1 677 1234', 'accounts@murphyoffice.ie']),
        buyer: p('The Harbour Hotel', 'Harbour Hospitality Ltd', '3 Quay Street', 'H91 X2K4', 'Galway', 'IE7654321W', ['9935', 'IE7654321W']),
        iban: 'IE29AIBK93115212345678', bic: 'AIBKIE2D', prefix: 'INV', carrier: 'Irish Freight Services', rate: 23, scale: 1,
    },
    IT: {
        seller: p('Arredo Ufficio Rossi', 'Rossi Arredamenti S.r.l.', 'Via del Corso 112', '00186', 'Roma', 'IT01234567890', ['0211', 'IT01234567890'], ['', 'RM-1234567'], ['Giulia Rossi', '+39 06 678 9012', 'fatture@rossi-arredamenti.it']),
        buyer: p('Albergo Bellavista', 'Bellavista Hotel S.p.A.', 'Corso Buenos Aires 20', '20124', 'Milano', 'IT09876543210', ['0211', 'IT09876543210']),
        iban: 'IT60X0542811101000000123456', bic: 'BPMOIT22', prefix: 'FT', carrier: 'Bartolini S.p.A.', rate: 22, scale: 1,
    },
    LV: {
        seller: p('Biroja mēbeles Bērziņš', 'Bērziņa mēbeles SIA', 'Brīvības iela 85', 'LV-1001', 'Rīga', 'LV40001234567', ['9939', 'LV40001234567'], ['0218', '40001234567'], ['Ilze Bērziņa', '+371 6712 3456', 'rekini@berzina-mebeles.lv']),
        buyer: p('Viesnīca Jūrmala', 'Jūrmalas viesnīcas AS', 'Jomas iela 30', 'LV-2015', 'Jūrmala', 'LV40007654321', ['9939', 'LV40007654321']),
        iban: 'LV80BANK0000435195001', bic: 'HABALV22', prefix: 'R', carrier: 'DPD Latvija SIA', rate: 21, scale: 1,
    },
    LT: {
        seller: p('Biuro baldai Kazlauskas', 'Kazlausko baldai UAB', 'Gedimino pr. 20', 'LT-01103', 'Vilnius', 'LT123456789012', ['9937', 'LT123456789012'], ['', '123456789'], ['Rūta Kazlauskienė', '+370 5 212 3456', 'saskaitos@kazlausko-baldai.lt']),
        buyer: p('Viešbutis Nemunas', 'Nemuno viešbučiai UAB', 'Laisvės al. 50', 'LT-44240', 'Kaunas', 'LT987654321098', ['9937', 'LT987654321098']),
        iban: 'LT121000011101001000', bic: 'HABALT22', prefix: 'PVM', carrier: 'Venipak UAB', rate: 21, scale: 1,
    },
    LU: {
        seller: p('Bureau Design Weber', 'Weber Design S.à r.l.', '12 Grand-Rue', '1660', 'Luxembourg', 'LU12345678', ['9938', 'LU12345678'], ['', 'B123456'], ['Anne Weber', '+352 22 33 44', 'facturation@weber-design.lu']),
        buyer: p('Hôtel de la Moselle', 'Moselle Hôtellerie S.A.', '5 route du Vin', '5401', 'Ahn', 'LU87654321', ['9938', 'LU87654321']),
        iban: 'LU280019400644750000', bic: 'BCEELULL', prefix: 'F', carrier: 'Lux Transports S.A.', rate: 17, scale: 1,
    },
    MT: {
        seller: p('Borg Office Supplies', 'Borg Office Supplies Ltd', '45 Republic Street', 'VLT 1117', 'Valletta', 'MT12345678', ['9943', 'MT12345678'], ['', 'C 12345'], ['Maria Borg', '+356 2122 3344', 'accounts@borgoffice.com.mt']),
        buyer: p('Sliema Bay Hotel', 'Sliema Bay Hospitality Ltd', '10 Tower Road', 'SLM 1600', 'Sliema', 'MT87654321', ['9943', 'MT87654321']),
        iban: 'MT84MALT011000012345MTLCAST001S', bic: 'MALTMTMT', prefix: 'INV', carrier: 'Malta Freight Ltd', rate: 18, scale: 1,
    },
    NL: {
        seller: p('Van Dijk Kantoorinrichting', 'Van Dijk Kantoorinrichting B.V.', 'Industrieweg 40', '3542 AD', 'Utrecht', 'NL123456789B01', ['0106', '34112233'], ['0106', '34112233'], ['Sanne van Dijk', '+31 30 123 45 67', 'facturen@vandijk-kantoor.nl']),
        buyer: p('Hotel De Molen', 'De Molen Hotels B.V.', 'Molenstraat 8', '3811 HJ', 'Amersfoort', 'NL987654321B01', ['0106', '56778899'], ['0106', '56778899']),
        iban: 'NL91ABNA0417164300', bic: 'ABNANL2A', prefix: 'F', carrier: 'Snel Transport B.V.', rate: 21, scale: 1,
    },
    PL: {
        seller: p('Meble Biurowe Kowalski', 'Kowalski Meble Sp. z o.o.', 'ul. Marszałkowska 84', '00-514', 'Warszawa', 'PL5260001234', ['9945', 'PL5260001234'], ['', 'KRS 0000123456'], ['Anna Kowalska', '+48 22 628 12 34', 'faktury@kowalski-meble.pl']),
        buyer: p('Hotel Wawel', 'Wawel Hotele S.A.', 'ul. Floriańska 15', '31-019', 'Kraków', 'PL6760009876', ['9945', 'PL6760009876']),
        iban: 'PL61109010140000071219812874', bic: 'WBKPPLPP', prefix: 'FV', carrier: 'InPost Sp. z o.o.', rate: 23, scale: 4.3,
    },
    PT: {
        seller: p('Mobiliário de Escritório Silva', 'Silva Mobiliário, Lda.', 'Avenida da Liberdade 110', '1250-146', 'Lisboa', 'PT501234567', ['9946', 'PT501234567'], ['', '501234567'], ['Ana Silva', '+351 21 342 1234', 'faturacao@silva-mobiliario.pt']),
        buyer: p('Hotel Ribeira', 'Ribeira Hotéis, S.A.', 'Rua das Flores 20', '4050-262', 'Porto', 'PT509876543', ['9946', 'PT509876543']),
        iban: 'PT50000201231234567890154', bic: 'CGDIPTPL', prefix: 'FT', carrier: 'CTT Expresso', rate: 23, scale: 1,
    },
    RO: {
        seller: p('Mobilier Birou Popescu', 'Popescu Mobilier S.R.L.', 'Calea Victoriei 120', '010093', 'București', 'RO12345678', ['9947', 'RO12345678'], ['', 'J40/1234/2015'], ['Elena Popescu', '+40 21 312 3456', 'facturare@popescu-mobilier.ro']),
        buyer: p('Hotel Transilvania', 'Transilvania Hoteluri S.A.', 'Strada Memorandumului 28', '400114', 'Cluj-Napoca', 'RO87654321', ['9947', 'RO87654321']),
        iban: 'RO49AAAA1B31007593840000', bic: 'RNCBROBU', prefix: 'FCT', carrier: 'Fan Courier S.A.', rate: 21, scale: 5,
    },
    SK: {
        seller: p('Kancelársky nábytok Horváth', 'Horváth nábytok s.r.o.', 'Obchodná 12', '811 06', 'Bratislava', 'SK2020123456', ['9950', 'SK2020123456'], ['', '12345678'], ['Jana Horváthová', '+421 2 5443 1234', 'fakturacia@horvath-nabytok.sk']),
        buyer: p('Hotel Tatry', 'Tatry Hotels a.s.', 'Hlavná 50', '040 01', 'Košice', 'SK2020654321', ['9950', 'SK2020654321']),
        iban: 'SK3112000000198742637541', bic: 'SUBASKBX', prefix: 'FA', carrier: 'SPS Slovakia s.r.o.', rate: 23, scale: 1,
    },
    SI: {
        seller: p('Pisarniško pohištvo Novak', 'Novak pohištvo d.o.o.', 'Slovenska cesta 40', '1000', 'Ljubljana', 'SI12345678', ['9949', 'SI12345678'], ['', '1234567000'], ['Maja Novak', '+386 1 234 56 78', 'racuni@novak-pohistvo.si']),
        buyer: p('Hotel Bled', 'Blejski hoteli d.d.', 'Cesta svobode 12', '4260', 'Bled', 'SI87654321', ['9949', 'SI87654321']),
        iban: 'SI56263300012039086', bic: 'LJBASI2X', prefix: 'R', carrier: 'Pošta Slovenije d.o.o.', rate: 22, scale: 1,
    },
    ES: {
        seller: p('Mobiliario de Oficina García', 'García Mobiliario, S.L.', 'Calle Gran Vía 28', '28013', 'Madrid', 'ESB12345674', ['9920', 'ESB12345674'], ['', 'B12345674'], ['Lucía García', '+34 91 521 12 34', 'facturacion@garcia-mobiliario.es']),
        buyer: p('Hotel Mediterráneo', 'Mediterráneo Hoteles, S.A.', 'Passeig de Gràcia 50', '08007', 'Barcelona', 'ESA87654321', ['9920', 'ESA87654321']),
        iban: 'ES9121000418450200051332', bic: 'CAIXESBBXXX', prefix: 'FAC', carrier: 'SEUR S.A.', rate: 21, scale: 1,
    },
    SE: {
        seller: p('Lindqvist Kontorsmöbler', 'Lindqvist Kontorsmöbler AB', 'Drottninggatan 55', '111 21', 'Stockholm', 'SE556000123401', ['0007', '5560001234'], ['0007', '5560001234'], ['Karin Lindqvist', '+46 8 123 456 78', 'faktura@lindqvist-kontor.se']),
        buyer: p('Hotell Göta', 'Göta Hotell AB', 'Kungsportsavenyen 10', '411 36', 'Göteborg', 'SE556987654301', ['0007', '5569876543'], ['0007', '5569876543']),
        iban: 'SE4550000000058398257466', bic: 'ESSESESS', prefix: 'F', carrier: 'DB Schenker AB', rate: 25, scale: 11,
    },
    IS: {
        seller: p('Skrifstofuhúsgögn Jónsson', 'Jónsson húsgögn ehf.', 'Laugavegur 77', '101', 'Reykjavík', 'IS123456', ['0196', '5501234560'], ['0196', '5501234560'], ['Guðrún Jónsdóttir', '+354 551 2345', 'reikningar@jonsson-husgogn.is']),
        buyer: p('Hótel Norðurljós', 'Norðurljós hótel hf.', 'Hafnarstræti 20', '600', 'Akureyri', 'IS654321', ['0196', '6609876540'], ['0196', '6609876540']),
        iban: 'IS140159260076545510730339', bic: 'NBIIISRE', prefix: 'R', carrier: 'Eimskip hf.', rate: 24, scale: 150,
    },
    LI: {
        seller: p('Büromöbel Frick', 'Frick Büromöbel AG', 'Städtle 30', '9490', 'Vaduz', 'LI12345', ['9936', 'LI12345'], ['', 'FL-0002.123.456-7'], ['Sandra Frick', '+423 232 12 34', 'rechnung@frick-bueromoebel.li']),
        buyer: p('Hotel Malbun', 'Malbun Hotel AG', 'Malbunstrasse 5', '9497', 'Triesenberg', 'LI54321', ['9936', 'LI54321']),
        iban: 'LI21088100002324013AA', bic: 'LILALI2X', prefix: 'RE', carrier: 'Liechtensteinische Post AG', rate: 8.1, scale: 0.95,
    },
    NO: {
        seller: p('Berg Kontormøbler', 'Berg Kontormøbler AS', 'Karl Johans gate 25', '0159', 'Oslo', 'NO923456789MVA', ['0192', '923456789'], ['0192', '923456789'], ['Ingrid Berg', '+47 22 12 34 56', 'faktura@berg-kontor.no']),
        buyer: p('Hotell Bryggen', 'Bryggen Hotell AS', 'Bryggen 15', '5003', 'Bergen', 'NO987654321MVA', ['0192', '987654321'], ['0192', '987654321']),
        iban: 'NO9386011117947', bic: 'DNBANOKK', prefix: 'F', carrier: 'Bring Cargo AS', rate: 25, scale: 11.5,
    },
    GB: {
        seller: p('Smith Office Furniture', 'Smith Office Furniture Ltd', '221 Oxford Street', 'W1D 2LP', 'London', 'GB123456789', ['9932', 'GB123456789'], ['', '01234567'], ['Emma Smith', '+44 20 7946 0123', 'accounts@smithoffice.co.uk']),
        buyer: p('The Royal Crescent Hotel', 'Crescent Hospitality Ltd', '16 Royal Crescent', 'BA1 2LS', 'Bath', 'GB987654321', ['9932', 'GB987654321']),
        iban: 'GB29NWBK60161331926819', bic: 'NWBKGB2L', prefix: 'INV', carrier: 'Swift Haulage Ltd', rate: 20, scale: 0.85,
    },
    CH: {
        seller: p('Büromöbel Keller', 'Keller Büromöbel AG', 'Bahnhofstrasse 45', '8001', 'Zürich', 'CHE-123.456.789 MWST', ['0183', 'CHE123456789'], ['0183', 'CHE123456789'], ['Laura Keller', '+41 44 123 45 67', 'rechnung@keller-bueromoebel.ch']),
        buyer: p('Hotel Bellevue', 'Bellevue Hotels AG', 'Rue du Rhône 30', '1204', 'Genève', 'CHE-987.654.321 MWST', ['0183', 'CHE987654321'], ['0183', 'CHE987654321']),
        iban: 'CH9300762011623852957', bic: 'UBSWCHZH80A', prefix: 'RE', carrier: 'Planzer Transport AG', rate: 8.1, scale: 0.95,
    },
};
