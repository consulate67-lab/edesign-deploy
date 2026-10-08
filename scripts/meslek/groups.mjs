// Meslek grupları (A–K) ve grup düzeyinde UBL-TR XML değerlendirmesi (rapora yazılır).

export const GROUPS = {
    A: {
        label: 'Ağaç İşleri',
        xml: [
            'Perakende mobilya ve ikinci el eşya satışları tüketiciye e-Arşiv (EARSIVFATURA/SATIS); mağazalara, otellere ve müteahhitlere satışlar e-Fatura (TICARIFATURA) olarak düzenlenir. Mobilya ve kereste sevkiyatı nakliye gerektirdiğinden e-İrsaliye (DespatchAdvice, plaka + şoför + teslim adresi) belgelerin ikinci ayağıdır.',
            'Kereste, tomruk, yakacak odun ve orman ürünleri teslimlerinde belirlenmiş alıcılara KDV tevkifatı 623 (5/10) uygulanır: InvoiceTypeCode TEVKIFAT + WithholdingTaxTotal (TaxTypeCode 623, Percent 50).',
            'İkinci el eşya tüccarının vatandaştan yaptığı alımlar için e-Gider Pusulası (CreditNote / GIDERPUSULASI) kullanılır; satıcı TCKN + SMS doğrulama kodu ile tanımlanır.',
            'Ölçü, ağaç cinsi, kaplama ve renk gibi ürün nitelikleri satırda AdditionalItemIdentification (schemeID OLCU / MALZEME / RENK) ile taşınarak tasarımda etiket olarak gösterilir.',
        ],
    },
    B: {
        label: 'Eğlence, Dinlenme, Organizasyon',
        xml: [
            'Giriş / bilet satışları e-Bilet (InvoicePeriod etkinlik saati, AdditionalDocumentReference SALON / SIRA / KOLTUKNO / KAPI) ile; masa, paket menü ve servis satışları e-Arşiv ile belgelenir.',
            'Organizasyon hizmetinin kurum alıcıya faturasında KDV tevkifatı 605 (5/10) uygulanır; düğün / organizasyon paketlerinde InvoicePeriod (etkinlik tarihi) ve sözleşme referansı (AdditionalDocumentReference SOZLESME) önerilir.',
            'Otel ve pansiyonlarda 7194 sayılı Kanun gereği konaklama vergisi (TaxTypeCode 0059, %2) yalnız oda satırlarında hesaplanır ve KDV matrahına dahildir; InvoiceTypeCode KONAKLAMAVERGISI, giriş-çıkış InvoicePeriod ile verilir. Yabancı misafire sunulan konaklama hizmet ihracatı sayılmaz.',
            'Ses-sahne sanatçısı ve serbest çalışanlar e-SMM (EARSIVBELGE / SERBESTMESLEKMAKBUZU) düzenler; işverene düzenlenen makbuzda %20 GV stopajı (0003) TaxTotal içinde yer alır.',
            'Şans oyunları bayileri satış hasılatını değil, kazandıkları komisyonu e-Fatura ile ana bayiye / lisans sahibine faturalar.',
        ],
    },
    C: {
        label: 'Elektrik, Elektronik, Bilgisayar',
        xml: [
            'Cihaz satışında seri no, IMEI, garanti süresi satırda AdditionalItemIdentification (SERINO / IMEI / GARANTI) ile taşınır; garanti ve servis takibinde tasarımda belirgin gösterilmelidir.',
            'Kurumsal müşterilere yapılan makine-teçhizat bakım / onarım ve kurulum hizmetlerinde KDV tevkifatı 603 (7/10) uygulanır; servis formu ve iş emri numarası AdditionalDocumentReference ile verilir.',
            'Online satış yapan e-ticaret işletmelerinde e-Arşiv internet satışı alanları (WebsiteURI, PaymentMeans + ödeme aracısı, Delivery/CarrierParty + TrackingID) zorunludur; yurt dışı küçük gönderiler ETGB\'li mikro ihracat (ISTISNA 301) olarak düzenlenir.',
            'Telekom cihazı satışlarında öğrenci / teknoloji destek kapsamındaki satışlar InvoiceTypeCode TEKNOLOJIDESTEK ile; abonelik ve hat işlemleri bayi komisyonu e-Fatura ile belgelenir.',
            'Bilgisayar programlama ve danışmanlık serbest meslek olarak yürütülüyorsa e-SMM, şirket olarak yürütülüyorsa e-Fatura kullanılır.',
        ],
    },
    D: {
        label: 'Gıda, Tarım',
        xml: [
            'Çiftçiden (ÇKS kayıtlı üreticiden) yapılan zirai ürün ve hayvan alımlarında e-Müstahsil Makbuzu (CreditNote / EARSIVBELGE / MUSTAHSILMAKBUZ) zorunludur: GV stopajı 0003 bitkisel ürünlerde %2, hayvan ve hayvansal ürünlerde %1; borsa tescil ücreti (8001), Bağ-Kur prim kesintisi (SGK_PRIM) ayrı TaxSubtotal olarak düşülür ve PayableAmount = brüt − kesintiler.',
            'Yaş sebze-meyve toptan satışında Hal Kayıt Sistemi profili kullanılır: e-Fatura ProfileID HKS + InvoiceTypeCode HKSSATIS (komisyoncu ise HKSKOMISYONCU) ve e-İrsaliye HKSIRSALIYE; her satırda KUNYENO (hal künye no), mal sahibi adı ve VKN/TCKN.',
            'Gıda perakendesi (bakkal, kasap, fırın, manav, büfe) tüketiciye e-Arşiv; lokanta, otel, kantin ve marketlere toptan teslimler e-Fatura + e-İrsaliye olarak düzenlenir. Temel gıdada KDV %1, işlenmiş gıdada %10 / %20 oranları satır bazında farklılaşır ve TaxTotal oran başına ayrı TaxSubtotal içerir.',
            'Kurumsal yemek / catering hizmetinde KDV tevkifatı 604 (5/10) uygulanır. Kanatlı ve et ürünlerinde lot / kesim tarihi / son tüketim tarihi satır ek alanlarıdır.',
            'Değirmenci ve zahirecinin un / yem toptan satışları e-Fatura, üreticiden hububat alımı e-Müstahsil ile; meşrubat ve şekerlemede ÖTV (III) sayılı listedeki ürünler için TaxTypeCode 0073 KDV matrahına dahil edilir.',
        ],
    },
    E: {
        label: 'Giyim, Deri Ürün, Ev Tekstili, Dokuma',
        xml: [
            'Konfeksiyon ve dokumacılıkta fason dikim / boyama işleri KDV tevkifatı 609 (7/10), ham deri ve yapağı teslimleri 622 (9/10) kapsamındadır.',
            'İhracatçıya ihraç kaydıyla teslimde InvoiceTypeCode IHRACKAYITLI (istisna 701): KDV hesaplanıp tecil edilir, PayableAmount = matrah. Doğrudan ihracatta IHRACAT profili ile gümrük muhataplı fatura; satırda INCOTERMS, 12 haneli GTİP ve kap bilgisi.',
            'Halıcı ve deri mağazalarının turist satışlarında YOLCUBERABERFATURA: BuyerCustomerParty PARTYTYPE=TAXFREE + pasaport, TaxRepresentativeParty aracı kurum, istisna kodu 501 ile KDV hesaplanır.',
            'Beden, numara, renk, desen, düğüm sıklığı, ebat gibi nitelikler AdditionalItemIdentification (BEDEN / NUMARA / RENK / DESEN / DUGUM / OLCU) ile taşınır.',
            'Kuru temizleme, terzi ve halı yıkama hizmetlerinde e-Arşiv; ev hanımlarından el dokuması halı / kilim ve ikinci el tekstil alımlarında e-Gider Pusulası kullanılır.',
        ],
    },
    F: {
        label: 'Hediyelik Eşya, Eğitim, Basım, Fotoğraf, Çeşitli Mallar',
        xml: [
            'Matbaa ve baskı işlerinde belirlenmiş alıcılara KDV tevkifatı 615 (7/10), ticari reklam hizmetlerinde 625 (3/10) uygulanır; iş emri / tasarım onay numarası AdditionalDocumentReference olarak verilir.',
            'Tercüman, arzuhalci, danışman, fotoğraf sanatçısı ve bireysel sanatkâr serbest meslek erbabıdır: e-SMM (SERBESTMESLEKMAKBUZU), işverene düzenlenen makbuzda %20 GV stopajı. Danışmanlık hizmeti belirlenmiş alıcıya verilirse 602 (9/10) KDV tevkifatı da eklenir.',
            'Kurs ve kreşlerde dönemsel ücretler e-Arşiv\'de InvoicePeriod (eğitim dönemi) ile; kitap ve süreli yayınlarda KDV oranı %0 / %10 satır bazında ayrışır.',
            'Fatura tahsilat büroları tahsil ettikleri faturaları değil, kurumlardan aldıkları komisyonu e-Fatura ile belgeler; müşteriye verilen tahsilat makbuzu e-belge değildir.',
            'Antika ve sanat eseri satışlarında yabancı alıcıya yolcu beraberi fatura, plastik / kağıt ürün imalatçılarında e-Fatura + e-İrsaliye ve hurda alımında gider pusulası öne çıkar.',
        ],
    },
    G: {
        label: 'Kuaför, Berber, Temizlik, Spor, Kozmetik, Sağlık',
        xml: [
            'Kuaför, berber, güzellik, dövme, hamam ve spor tesisi hizmetleri tüketiciye e-Arşiv ile belgelenir; seans / randevu / üyelik bilgisi InvoicePeriod ve AdditionalDocumentReference (RANDEVU, UYELIK) ile verilir.',
            'Kurumlara verilen temizlik hizmetinde KDV tevkifatı 612 (9/10); haşere kontrol ve dezenfeksiyon dahil.',
            'Optik ürünler ve tıbbi malzeme satışlarında SGK\'ya faturalama InvoiceTypeCode SGK ile yapılır: alıcı SGK (VKN 7750409379), AccountingCost (SAGLIK_OPT, SAGLIK_MED …), InvoicePeriod ve AdditionalDocumentReference MUKELLEF_KODU / MUKELLEF_ADI / DOSYA_NO zorunludur.',
            'Tıbbi cihaz ve ilaç tedarikinde ILAC_TIBBICIHAZ profili: GTIN, seri / lot, son kullanma ve ÜTS numarası satır ek alanlarında taşınır.',
            'Hasta bakıcılığı ve alternatif tedavi bağımsız çalışanlarda e-SMM; cenaze hizmetlerinde ise belediyeye / kurum alıcılara e-Fatura, ailelere e-Arşiv düzenlenir.',
        ],
    },
    H: {
        label: 'Metal, Otomotiv, Makine',
        xml: [
            'Demir-çelik ürün teslimlerinde IDIS profili (e-Fatura ProfileID IDIS, e-İrsaliye IDISIRSALIYE): satıcıda SEVKIYATNO, satırlarda ETIKETNO; belirlenmiş alıcılara 627 (5/10) KDV tevkifatı.',
            'Hurdacılıkta vatandaştan alım e-Gider Pusulası ile (GVK 9/7 kapsamındaki toplayıcılardan alımda %2 stopaj, GVK 94/13), işlenmiş hurda / külçe satışları 617-621 tevkifat kodlarıyla e-Fatura olarak düzenlenir; kantar fişi AdditionalDocumentReference KANTARFISI.',
            'Kuyumculukta ziynet eşyası satışı özel matrah 805 (altın) / 808 (gümüş) ile: InvoiceTypeCode OZELMATRAH, KDV yalnız işçilik / kâr farkı üzerinden (TaxableAmount = özel matrah). Müşteriden hurda altın alımı e-Kıymetli Maden belgesi (CreditNote / EKIYMETLIMADENBELGE / ALIM; SUBENO, MUSTERITURU, ISTATISTIKNO; birim GRM).',
            'Oto servis, kaporta, boya, elektrik ve makine onarımında kurumsal müşterilere 603 (7/10) tevkifat; araç plakası, şasi no ve kilometre satır ek alanları (PLAKA / SASI / KM).',
            'Deniz taşıtı inşa / onarımında KDV Kanunu 13/a istisnası (ISTISNA 304); motosiklet satışında ÖTV (II) satır vergisi (TaxTypeCode 9077, Percent) KDV matrahına dahildir.',
        ],
    },
    I: {
        label: 'Pazar, Seyyar',
        xml: [
            'Pazarcı ve seyyar satıcıların büyük çoğunluğu basit usul / esnaf muaflığındadır ve satışta fatura düzenleme zorunluluğu yoktur; ancak bilanço / işletme esasına tabi olanlar tüketiciye e-Arşiv düzenler. Şablonlar talep üzerine düzenlenen e-Arşiv ve tedarik tarafındaki belgeleri örnekler.',
            'Pazarcının hal / toptancıdan aldığı yaş sebze-meyve HKS künyeli e-Fatura ve HKSIRSALIYE ile gelir; tasarımda künye numarası alım kanıtı olarak gösterilir.',
            'Üreticiden doğrudan alımda e-Müstahsil (bitkisel %2, hayvansal %1 stopaj), belge vermeyen kişilerden alımda e-Gider Pusulası kullanılır.',
        ],
    },
    J: {
        label: 'Ulaştırma Hizmetleri',
        xml: [
            'Yük taşımacılığında belirlenmiş alıcılara KDV tevkifatı 624 (2/10), personel / öğrenci servis taşımacılığında 614 (5/10). Taşıma faturasında plaka, sefer / güzergâh ve CMR / U-ETDS bilgisi AdditionalDocumentReference ile verilir.',
            'Otobüs, deniz yolu ve fayton gibi yolcu taşımacılığında e-Bilet: InvoicePeriod kalkış zamanı, AdditionalDocumentReference SEFERNO / KOLTUKNO / PERON / PLAKA / GEMI.',
            'Akaryakıtta ÖTV (I) sayılı liste maktu vergisi rafineri / dağıtıcı aşamasında TaxTypeCode 0071 (PerUnitAmount) ile faturada gösterilir ve KDV matrahına dahildir; istasyon (bayi) faturasında ayrı ÖTV satırı yoktur, satırda plaka ve pompa bilgisi yer alır. Elektrikli araç şarjı ENERJI profili (SARJ / SARJANLIK, alıcıda PLAKA / ARACKIMLIKNO).',
            'Oto galericiler ikinci el araç satışında özel matrah 812 (KDV yalnız alış-satış farkından); vatandaştan araç alımı noter satış senedi ile belgelenir. Oto kiralamada kiralama dönemi InvoicePeriod ile verilir.',
            'Uluslararası taşımacılık KDV Kanunu 14/1 istisnası (ISTISNA 311); deniz taşıtı teslim / onarımı 13/a (304). Trafik müşavirliği ve iş takipçiliği serbest meslek kazancı: e-SMM.',
        ],
    },
    K: {
        label: 'Yapı Sanatları',
        xml: [
            'İnşaat taahhüt işlerinde hakediş faturaları KDV tevkifatı 601 (4/10) ile; hakediş no, sözleşme ve proje referansı AdditionalDocumentReference (HAKEDIS / SOZLESME / PROJE), hakediş dönemi InvoicePeriod.',
            'İnşaat malzemesi ve hırdavat satışlarında şantiyeye teslim e-İrsaliye ile; demir-çelik ürünlerde IDIS ve 627 tevkifat.',
            'Peyzaj ve bahçe bakım hizmetinde 613 (9/10), boya / kimyasal ürünlerde 626 diğer teslimler tevkifatı (belirlenmiş alıcılara) uygulanabilir.',
            'Emlakçılar aracılık komisyonu için alıcı ve satıcıya ayrı e-Arşiv / e-Fatura düzenler; kira aracılığında dönem InvoicePeriod ile. Taşınmaz satışı özel matrah 812 kapsamındadır.',
            'Mermer ve taş ocaklarında blok / plaka ihracatı IHRACAT profili (GTİP 2515 / 6802), sondaj işlerinde ise kurum alıcılara 601 tevkifat uygulanır.',
        ],
    },
};
