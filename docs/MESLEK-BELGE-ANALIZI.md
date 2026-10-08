# Meslek Gruplarına Göre e-Belge Türleri ve XML Değerlendirmesi

> Otomatik üretildi: `node scripts/gen-meslek-templates.mjs`. Kaynak: [meslek-nace.pro/meslek](https://meslek-nace.pro/meslek/) — 11 grup, 184 meslek dalı ve her dalın NACE faaliyet kodları.

Her meslek için faaliyet kodlarındaki işlem karışımı (perakende / toptan satış, imalat, onarım-hizmet, taşıma, alış) incelenerek mesleğin günlük işlemlerinde düzenlemesi gereken e-belge türleri belirlenmiş ve her meslek için **en az iki** örnek tasarım (UBL-TR XML + XSLT) hazırlanmıştır. Tasarımlar galeride *Meslek* filtresiyle bulunur; dosyalar `public/ebelge/hazir/meslek-*.xml|xslt`.

**Önemli:** e-Fatura / e-Arşiv / e-İrsaliye / e-SMM / e-Müstahsil geçiş yükümlülükleri ciro, sektör ve lisans durumuna göre değişir (VUK 509 sıra no.lu Tebliğ ve sonraki değişiklikler). Tevkifat oranları, istisna ve özel matrah kodları belge tarihindeki GİB kod listeleriyle; profil kuralları (HKS, IDIS, ILAC_TIBBICIHAZ, ENERJI, SGK) güncel UBL-TR kılavuzlarıyla doğrulanmalıdır. Örneklerdeki kişi, firma, VKN/TCKN ve IBAN bilgileri kurgusaldır (denetim haneleri geçerlidir).

## 1. Belge türleri ve XML yapıları

| Belge türü | Kök eleman | CustomizationID | ProfileID | Tip kodu | Şablon sayısı |
|---|---|---|---|---|---|
| e-Fatura | Invoice | TR1.2 | TICARIFATURA / TEMELFATURA / HKS / IDIS / ILAC_TIBBICIHAZ / ENERJI / KAMU | SATIS, TEVKIFAT, ISTISNA, OZELMATRAH, IHRACKAYITLI, SGK, HKSSATIS, HKSKOMISYONCU, KONAKLAMAVERGISI, SARJ, SARJANLIK | 177 |
| e-Arşiv Fatura | Invoice | TR1.2 | EARSIVFATURA | SATIS, OZELMATRAH, ISTISNA, TEKNOLOJIDESTEK, KONAKLAMAVERGISI | 145 |
| e-Fatura (İhracat) | Invoice | TR1.2 | IHRACAT | ISTISNA (301) | 17 |
| e-Fatura (Yolcu Beraberi) | Invoice | TR1.2 | YOLCUBERABERFATURA | ISTISNA (501) | 7 |
| e-Arşiv (Mikro İhracat / ETGB) | Invoice | TR1.2 | EARSIVFATURA | ISTISNA (301) | 6 |
| e-SMM | Invoice | TR1.2 | EARSIVBELGE | SERBESTMESLEKMAKBUZU | 15 |
| e-Bilet | Invoice | TR1.2 | e-Bilet (depo kuralı) | SATIS | 6 |
| e-Müstahsil Makbuzu | CreditNote | TR1.2.1 | EARSIVBELGE | MUSTAHSILMAKBUZ | 15 |
| e-Gider Pusulası | CreditNote | TR1.2.1 | GIDERPUSULASI | SATIS / IADE | 13 |
| e-Kıymetli Maden (Alım) | CreditNote | TR1.2.1 | EKIYMETLIMADENBELGE | ALIM | 1 |
| e-İrsaliye | DespatchAdvice | TR1.2.1 | TEMELIRSALIYE / HKSIRSALIYE / IDISIRSALIYE | SEVK | 27 |

Toplam **429** şablon, **184** meslek.

## 2. Meslek gruplarına göre XML değerlendirmesi

### A — Ağaç İşleri

- Perakende mobilya ve ikinci el eşya satışları tüketiciye e-Arşiv (EARSIVFATURA/SATIS); mağazalara, otellere ve müteahhitlere satışlar e-Fatura (TICARIFATURA) olarak düzenlenir. Mobilya ve kereste sevkiyatı nakliye gerektirdiğinden e-İrsaliye (DespatchAdvice, plaka + şoför + teslim adresi) belgelerin ikinci ayağıdır.
- Kereste, tomruk, yakacak odun ve orman ürünleri teslimlerinde belirlenmiş alıcılara KDV tevkifatı 623 (5/10) uygulanır: InvoiceTypeCode TEVKIFAT + WithholdingTaxTotal (TaxTypeCode 623, Percent 50).
- İkinci el eşya tüccarının vatandaştan yaptığı alımlar için e-Gider Pusulası (CreditNote / GIDERPUSULASI) kullanılır; satıcı TCKN + SMS doğrulama kodu ile tanımlanır.
- Ölçü, ağaç cinsi, kaplama ve renk gibi ürün nitelikleri satırda AdditionalItemIdentification (schemeID OLCU / MALZEME / RENK) ile taşınarak tasarımda etiket olarak gösterilir.

| Kod | Meslek | Belge türleri (şablonlar) | Gerekçe |
|---|---|---|---|
| A.01 | İkinci El Eşya Ticareti | Perakende Satış e-Arşiv Faturası — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Vatandaştan Eşya Alımı Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · SATIS` | İkinci el eşyacı vatandaştan belge alamadan eşya satın alır (e-Gider Pusulası) ve tüketiciye perakende satar (e-Arşiv). Kullanılmış eşya satışında genel KDV oranı uygulanır; özel matrah yalnız ikinci el taşıt / taşınmaz içindir. |
| A.02 | Kerestecilik | Kereste Satış Faturası (Tevkifat 623) — *e-Fatura* `TICARIFATURA · TEVKIFAT 623`<br>Kereste Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Kerestecinin müşterisi çoğunlukla mobilya atölyesi, müteahhit ve palet imalatçısıdır (e-Fatura). Ağaç ve orman ürünleri teslimi belirlenmiş alıcılara 623 kodlu 5/10 KDV tevkifatına tabidir; kamyonla sevkiyat e-İrsaliye gerektirir. |
| A.03 | Marangozluk | Ölçüye Özel Mutfak Dolabı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Toplu Kapı İmalatı e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Marangoz ölçüye özel imalatı tüketiciye e-Arşiv ile, müteahhide / firmaya toplu kapı-dolap imalatını e-Fatura ile faturalar. Toplu teslimler şantiyeye irsaliyeli gider; montaj işçiliği aynı faturada hizmet satırıdır. |
| A.04 | Mobilya Boyacılığı | Fason Lake Boya Hizmet Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Mobilya Yenileme e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Mobilya boyacısı ağırlıklı olarak mobilya üreticilerine fason boya / cila yapar (e-Fatura), ev sahiplerine mobilya yenileme hizmeti verir (e-Arşiv). Hizmet niteliğinde olduğundan irsaliye yerine iş emri referansı yeterlidir. |
| A.05 | Mobilya Döşemeciliği | Koltuk Döşeme e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Kafe Oturma Grubu Döşeme e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Döşemeci tüketiciye koltuk döşeme hizmeti (e-Arşiv), kafe-otel gibi işletmelere toplu döşeme (e-Fatura) düzenler. İşletmeye yapılan döşeme işi bakım-onarım niteliğinde değildir; normal KDV ile faturalanır. |
| A.06 | Mobilya İmalatı | Bayiye Toptan Mobilya Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Mobilya İhracat Faturası (FOB) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | Mobilya imalatçısı mağazalara ve bayilere toptan satış (e-Fatura + e-İrsaliye) yapar; yurt dışı bayilere ihracat IHRACAT profiliyle gümrük muhataplı faturalanır. Mobilya GTİP 9403 / 9401 başlıklarındadır. |
| A.07 | Mobilya Ticareti | Online Mobilya Satışı e-Arşiv (İnternet) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Müşteriye Teslim Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Mobilya mağazası tüketiciye e-Arşiv (online satışta internet satışı alanlarıyla) düzenler; teslimat kendi aracıyla yapıldığında mal faturadan önce sevk ediliyorsa e-İrsaliye de düzenlenir. |
| A.08 | Yakacak İmalatı, Ticareti | Kömür ve Odun Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Köylüden Odun Alımı Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · SATIS` | Yakacak satıcısı haneye kömür / odun satışında e-Arşiv düzenler; köylüden odun alımında satıcı belge veremediğinden e-Gider Pusulası kullanılır. Odun (orman ürünü) belirlenmiş alıcıya satılırsa 623 tevkifatı söz konusudur. |

### B — Eğlence, Dinlenme, Organizasyon

- Giriş / bilet satışları e-Bilet (InvoicePeriod etkinlik saati, AdditionalDocumentReference SALON / SIRA / KOLTUKNO / KAPI) ile; masa, paket menü ve servis satışları e-Arşiv ile belgelenir.
- Organizasyon hizmetinin kurum alıcıya faturasında KDV tevkifatı 605 (5/10) uygulanır; düğün / organizasyon paketlerinde InvoicePeriod (etkinlik tarihi) ve sözleşme referansı (AdditionalDocumentReference SOZLESME) önerilir.
- Otel ve pansiyonlarda 7194 sayılı Kanun gereği konaklama vergisi (TaxTypeCode 0059, %2) yalnız oda satırlarında hesaplanır ve KDV matrahına dahildir; InvoiceTypeCode KONAKLAMAVERGISI, giriş-çıkış InvoicePeriod ile verilir. Yabancı misafire sunulan konaklama hizmet ihracatı sayılmaz.
- Ses-sahne sanatçısı ve serbest çalışanlar e-SMM (EARSIVBELGE / SERBESTMESLEKMAKBUZU) düzenler; işverene düzenlenen makbuzda %20 GV stopajı (0003) TaxTotal içinde yer alır.
- Şans oyunları bayileri satış hasılatını değil, kazandıkları komisyonu e-Fatura ile ana bayiye / lisans sahibine faturalar.

| Kod | Meslek | Belge türleri (şablonlar) | Gerekçe |
|---|---|---|---|
| B.01 | Ajans, Organizasyon Faaliyetleri | Kurumsal Lansman Organizasyonu (Tevkifat 605) — *e-Fatura* `TICARIFATURA · TEVKIFAT 605`<br>Doğum Günü Organizasyonu e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Organizasyon ajansı kurumsal müşterilere lansman / toplantı organizasyonu satar; belirlenmiş alıcılara organizasyon hizmetinde 605 kodlu 5/10 KDV tevkifatı uygulanır. Bireysel müşterilere (doğum günü, nişan) e-Arşiv düzenlenir. |
| B.02 | Düğün Salonu İşletmeciliği | Düğün Paketi e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Kurumsal Gala Daveti Faturası (Tevkifat 605) — *e-Fatura* `TICARIFATURA · TEVKIFAT 605` | Düğün salonu bireysel düğün paketlerini e-Arşiv ile faturalar; kurumların gala / yılbaşı davetlerinde salon + yemek + organizasyon hizmeti verildiğinden belirlenmiş alıcılarda 605 tevkifatı uygulanır. |
| B.03 | Eğlence Yerleri İşletmeciliği | Konser Giriş e-Bileti — *e-Bilet* `e-Bilet · SATIS`<br>Masa Adisyonu e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Eğlence mekânı konser / etkinlik girişlerinde e-Bilet, masa harcamalarında e-Arşiv (adisyon) düzenler. Bilet; etkinlik tarihi, salon, sıra-koltuk ve kapı bilgisini taşır. |
| B.04 | Gazinoculuk | Fasıl Gecesi Programlı e-Bilet — *e-Bilet* `e-Bilet · SATIS`<br>Tur Acentesine Grup Satışı e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Gazino; giriş + menü kapsayan program biletlerini e-Bilet, tur acentelerine grup satışlarını e-Fatura ile belgeler. Sahneye çıkan sanatçılar gazinoya e-SMM düzenler (gazino stopaj keser). |
| B.05 | Kahvehanecilik, Kıraathanecilik | Masa Hesabı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>İşyerine Aylık Çay Servisi e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Kahvehanelerin çoğu basit usuldedir; işletme esasına tabi olanlar müşteriye e-Arşiv düzenler. Çevre işyerlerine aylık çay-kahve servisi verildiğinde alıcı e-Fatura mükellefi ise e-Fatura düzenlenir. |
| B.06 | Lokal İşletmeciliği | Üye Harcama e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Dernek Toplantı Yemeği e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Lokal işletmecisi üye harcamalarını e-Arşiv ile, derneklerin / kurumların toplantı-yemek organizasyonlarını e-Fatura ile faturalar. Yemek hizmeti KDV %10, salon kirası %20. |
| B.07 | Otel, Pansiyon, Yurt İşletmeciliği | Misafir Konaklama e-Arşiv (Konaklama Vergisi) — *e-Arşiv Fatura* `EARSIVFATURA · KONAKLAMAVERGISI`<br>Şirket Konaklaması e-Faturası (Konaklama Vergisi) — *e-Fatura* `TICARIFATURA · KONAKLAMAVERGISI`<br>Öğrenci Yurdu Aylık Ücret e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Konaklama tesisleri 7194 sayılı Kanun gereği oda bedeli üzerinden %2 konaklama vergisi hesaplar (InvoiceTypeCode KONAKLAMAVERGISI, TaxTypeCode 0059). Bireysel misafire e-Arşiv, şirkete e-Fatura; öğrenci yurtları konaklama vergisi kapsamı dışındadır. |
| B.08 | Oyun Salonu, İnternet Kafe İşletmeciliği | Saatlik Kullanım ve Bakiye e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>E-Spor Turnuvası Katılım e-Bileti — *e-Bilet* `e-Bilet · SATIS` | Oyun salonu ve internet kafe saatlik kullanım / bakiye yüklemeyi e-Arşiv ile; e-spor turnuvası katılım ve seyirci girişlerini e-Bilet ile belgeler. |
| B.09 | Ses, Sahne Sanatçılığı | Mekâna Sahne Performansı e-SMM (Stopajlı) — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU`<br>Düğün Performansı e-SMM (Gerçek Kişi) — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU` | Ses ve sahne sanatçısı serbest meslek erbabıdır: e-SMM düzenler. İşveren mekân / şirket ise %20 GV stopajı makbuzda gösterilir ve müşteri tarafından ödenecekten düşülür; gerçek kişiye (düğün sahibine) düzenlenen makbuzda stopaj yoktur. |
| B.10 | Şans Oyunları Bayiliği | Piyango Satış Komisyonu e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Spor Bahisleri Komisyon e-Faturası (Temel) — *e-Fatura* `TEMELFATURA · SATIS` | Şans oyunları bayii oyun hasılatını değil, lisans sahibinden aldığı komisyonu faturalar: ana bayi / lisans şirketine aylık komisyon e-Faturası. Komisyon hizmeti %20 KDV’ye tabidir. |

### C — Elektrik, Elektronik, Bilgisayar

- Cihaz satışında seri no, IMEI, garanti süresi satırda AdditionalItemIdentification (SERINO / IMEI / GARANTI) ile taşınır; garanti ve servis takibinde tasarımda belirgin gösterilmelidir.
- Kurumsal müşterilere yapılan makine-teçhizat bakım / onarım ve kurulum hizmetlerinde KDV tevkifatı 603 (7/10) uygulanır; servis formu ve iş emri numarası AdditionalDocumentReference ile verilir.
- Online satış yapan e-ticaret işletmelerinde e-Arşiv internet satışı alanları (WebsiteURI, PaymentMeans + ödeme aracısı, Delivery/CarrierParty + TrackingID) zorunludur; yurt dışı küçük gönderiler ETGB'li mikro ihracat (ISTISNA 301) olarak düzenlenir.
- Telekom cihazı satışlarında öğrenci / teknoloji destek kapsamındaki satışlar InvoiceTypeCode TEKNOLOJIDESTEK ile; abonelik ve hat işlemleri bayi komisyonu e-Fatura ile belgelenir.
- Bilgisayar programlama ve danışmanlık serbest meslek olarak yürütülüyorsa e-SMM, şirket olarak yürütülüyorsa e-Fatura kullanılır.

| Kod | Meslek | Belge türleri (şablonlar) | Gerekçe |
|---|---|---|---|
| C.01 | Asansör, Yürüyen Merdiven Kurulumu, Bakımı, Onarımı | AVM Yürüyen Merdiven Bakım Faturası (Tevkifat 603) — *e-Fatura* `TICARIFATURA · TEVKIFAT 603`<br>Apartman Aylık Bakım e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Asansör firması AVM, otel ve plaza gibi kurumsal müşterilere bakım-onarım (belirlenmiş alıcıda 603 kodlu 7/10 tevkifat) ve apartman yönetimlerine aylık bakım sözleşmesi (yönetim mükellef olmadığından e-Arşiv) faturalar. |
| C.02 | Beyaz Eşya Onarımı | Ev Servisi e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Restoran Endüstriyel Cihaz Onarım Faturası (Tevkifat 603) — *e-Fatura* `TICARIFATURA · TEVKIFAT 603` | Beyaz eşya onarımcısı evlere servis hizmetini e-Arşiv ile, restoran / otel gibi işletmelere endüstriyel cihaz onarımını e-Fatura ile düzenler. Kurumsal belirlenmiş alıcılarda 603 tevkifatı uygulanır. |
| C.03 | Beyaz Eşya Ticareti | Beyaz Eşya Satışı e-Arşiv (Seri No + Garanti) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Otel Toplu Cihaz Satış e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Beyaz eşya bayii tüketiciye cihaz satışını e-Arşiv ile (seri no ve garanti satırda), otel / yurt / şirket gibi toplu alımlarda e-Fatura ile düzenler. Teslimat bayi aracıyla yapılıyorsa e-İrsaliye eşlik eder. |
| C.04 | Bilgisayar Kurulumu, Onarımı, Programlama, Veri Kurtarma | Veri Kurtarma Hizmeti e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Kurum Bilgisayar Bakım-Onarım Faturası (Tevkifat 603) — *e-Fatura* `TICARIFATURA · TEVKIFAT 603` | Bilgisayar servisi bireysel veri kurtarma / onarımı e-Arşiv ile; kurum bilgisayar parkının bakım-onarımını e-Fatura ile faturalar. Demirbaş niteliğindeki bilgisayarların bakım-onarımı belirlenmiş alıcılarda 603 (7/10) tevkifata tabidir. |
| C.05 | Elektrik Makineleri İmalatı, Kurulumu, Onarımı | Motor Sargı Onarım Faturası (Tevkifat 603) — *e-Fatura* `TICARIFATURA · TEVKIFAT 603`<br>Onarılmış Motor Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Elektrik makineleri onarımcısı fabrikaların motor / jeneratör onarımını yapar: makine-teçhizat onarımı 603 (7/10) tevkifatlı e-Fatura. Onarılan motorların fabrikaya dönüşü e-İrsaliye ile sevk edilir. |
| C.06 | Elektrik Malzemeleri İmalatı, Ticareti | Toptan Elektrik Malzemesi e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Şantiyeye Malzeme Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Elektrik malzemeleri toptancısı elektrik müteahhitlerine ve perakendecilere e-Fatura, şantiye teslimlerinde e-İrsaliye düzenler. Kablo ve aydınlatma ürünlerinde marka / kesit / güç satır etiketleriyle belirtilir. |
| C.07 | Elektrik Sistemleri İmalatı, Kurulumu, Onarımı | Pano İmalat ve Montaj Hakedişi (Tevkifat 601) — *e-Fatura* `TICARIFATURA · TEVKIFAT 601`<br>Elektrik Panosu İhracat Faturası (CPT) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | Elektrik sistemleri imalatçısı pano imalatı + montajı yapım işi kapsamında yapıyorsa 601 (4/10) tevkifatlı e-Fatura düzenler; Irak, Azerbaycan gibi ülkelere pano ihracatı IHRACAT profiliyle yapılır. |
| C.08 | Elektrik Tesisatçılığı | Ev Tesisat Yenileme e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Konut Projesi Tesisat Faturası (Tevkifat 601) — *e-Fatura* `TICARIFATURA · TEVKIFAT 601` | Elektrik tesisatçısı evlerde tesisat yenileme / arıza işini e-Arşiv ile, müteahhitlere alt yüklenici olarak yaptığı tesisat işini e-Fatura ile faturalar; yapım işi kapsamındaki tesisat işlerinde 601 (4/10) tevkifatı uygulanır. |
| C.09 | Elektrikli Ev Aletleri İmalatı, Onarımı | Zincir Mağazaya Toptan Satış e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Garanti Dışı Onarım e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Ev aletleri imalatçısı zincir mağazalara e-Fatura + e-İrsaliye ile satış yapar; garanti dışı onarım hizmetini tüketiciye e-Arşiv ile belgeler. |
| C.10 | Elektrikli Ev Aletleri Ticareti | Online Satış e-Arşiv (İnternet) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Cayma Hakkı İadesi e-Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · IADE` | Ev aletleri perakendecisi online satışlarda e-Arşiv internet satışı alanlarını kullanır; cayma hakkıyla iade edilen ürünlerde tüketici fatura düzenleyemediğinden satıcı e-Gider Pusulası (IADE) düzenler. |
| C.11 | Elektronik Ürün İmalatı, Onarımı | Elektronik Kart Satış e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Geliştirme Kiti Mikro İhracat (ETGB) — *e-Arşiv (Mikro İhracat / ETGB)* `EARSIVFATURA · ISTISNA` | Elektronik imalatçısı sanayi müşterilerine kart / modül satışını e-Fatura ile yapar; yurt dışındaki küçük alıcılara kargo ile gönderilen ürünler ETGB’li mikro ihracat (e-Arşiv ISTISNA 301) olarak belgelenir. |
| C.12 | Elektronik Ürün Ticareti | Televizyon Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Öğrenci Teknoloji Destek e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · TEKNOLOJIDESTEK` | Elektronik perakendecisi seri no / garanti bilgili e-Arşiv düzenler; teknoloji destek kapsamındaki öğrenci satışlarında InvoiceTypeCode TEKNOLOJIDESTEK kullanılır (alıcı TCKN ve cihaz IMEI / seri no zorunlu). |
| C.13 | E-Ticaret | İnternet Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Yurt Dışı Sipariş Mikro İhracat (ETGB) — *e-Arşiv (Mikro İhracat / ETGB)* `EARSIVFATURA · ISTISNA`<br>Müşteri İadesi e-Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · IADE` | E-ticaret işletmesinin üç temel belgesi: yurt içi tüketici satışları e-Arşiv internet satışı (web adresi, ödeme aracısı, taşıyıcı), yurt dışı kargo satışları ETGB’li mikro ihracat ve cayma hakkı iadelerinde e-Gider Pusulası (IADE). |
| C.14 | Güvenlik Sistemleri Hizmetleri | Kamera Sistemi Kurulum e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Alarm İzleme Aboneliği e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Güvenlik sistemleri firması işyerlerine kamera / alarm kurulumunu e-Fatura ile; evlere aylık alarm izleme hizmetini dönemli e-Arşiv ile faturalar. Elektronik sistem kurulumu “özel güvenlik hizmeti” (607) değildir; tevkifat uygulanmaz. |
| C.15 | Kayıtlı Medyaların İmalatı, Kiralanması, Ticareti | Plak ve CD Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>CD Çoğaltma Hizmeti e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Kayıtlı medya işletmesi tüketiciye plak / CD satışını e-Arşiv ile; müzik şirketlerine CD çoğaltma ve ambalaj işini e-Fatura ile faturalar. |
| C.16 | Telekomünikasyon Cihazları Onarımı | Ekran Değişimi e-Arşiv (IMEI) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Kurumsal Tablet Onarım e-Faturası (Temel) — *e-Fatura* `TEMELFATURA · SATIS` | Telefon onarımcısı bireysel onarımları IMEI bilgili e-Arşiv ile; kurumların demirbaş telefon / tablet onarımını e-Fatura ile düzenler (alıcı belirlenmiş alıcıysa 603 tevkifat). Temel senaryo, alıcının ret yanıtı göndermesini istemeyen kurumsal müşterilerde tercih edilir. |
| C.17 | Telekomünikasyon Cihazları Ticareti | Öğrenciye Telefon Satışı e-Arşiv (Teknoloji Destek) — *e-Arşiv Fatura* `EARSIVFATURA · TEKNOLOJIDESTEK`<br>Operatöre Aktivasyon Prim e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Telekom cihazı satıcısı tüketiciye IMEI kayıtlı telefon satışı (öğrenci satışlarında TEKNOLOJIDESTEK) düzenler; GSM operatöründen aldığı hat aktivasyon prim / komisyonlarını operatöre e-Fatura ile faturalar. |

### D — Gıda, Tarım

- Çiftçiden (ÇKS kayıtlı üreticiden) yapılan zirai ürün ve hayvan alımlarında e-Müstahsil Makbuzu (CreditNote / EARSIVBELGE / MUSTAHSILMAKBUZ) zorunludur: GV stopajı 0003 bitkisel ürünlerde %2, hayvan ve hayvansal ürünlerde %1; borsa tescil ücreti (8001), Bağ-Kur prim kesintisi (SGK_PRIM) ayrı TaxSubtotal olarak düşülür ve PayableAmount = brüt − kesintiler.
- Yaş sebze-meyve toptan satışında Hal Kayıt Sistemi profili kullanılır: e-Fatura ProfileID HKS + InvoiceTypeCode HKSSATIS (komisyoncu ise HKSKOMISYONCU) ve e-İrsaliye HKSIRSALIYE; her satırda KUNYENO (hal künye no), mal sahibi adı ve VKN/TCKN.
- Gıda perakendesi (bakkal, kasap, fırın, manav, büfe) tüketiciye e-Arşiv; lokanta, otel, kantin ve marketlere toptan teslimler e-Fatura + e-İrsaliye olarak düzenlenir. Temel gıdada KDV %1, işlenmiş gıdada %10 / %20 oranları satır bazında farklılaşır ve TaxTotal oran başına ayrı TaxSubtotal içerir.
- Kurumsal yemek / catering hizmetinde KDV tevkifatı 604 (5/10) uygulanır. Kanatlı ve et ürünlerinde lot / kesim tarihi / son tüketim tarihi satır ek alanlarıdır.
- Değirmenci ve zahirecinin un / yem toptan satışları e-Fatura, üreticiden hububat alımı e-Müstahsil ile; meşrubat ve şekerlemede ÖTV (III) sayılı listedeki ürünler için TaxTypeCode 0073 KDV matrahına dahil edilir.

| Kod | Meslek | Belge türleri (şablonlar) | Gerekçe |
|---|---|---|---|
| D.01 | Aktar Ürünleri İmalatı, Ticareti | Baharat ve Bitki Çayı Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Üreticiden Kekik Alımı e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ` | Aktar tüketiciye perakende satışta e-Arşiv düzenler; dağdan kekik, adaçayı gibi bitkileri toplayan / yetiştiren üreticiden alımda çiftçi fatura düzenleyemediğinden e-Müstahsil Makbuzu (bitkisel ürün %2 stopaj) kullanılır. |
| D.02 | Arıcılık | Arıcıdan Bal Alımı e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ`<br>Market Zincirine Bal Satış e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Bal paketleyici üretici arıcılardan bal alımını e-Müstahsil (hayvansal ürün: %1 stopaj) ile belgeler; paketlediği balı marketlere e-Fatura ile satar. Arıcı ÇKS / arıcılık kayıt numarası satırda belirtilir. |
| D.03 | Bakkallık, Bayilik, Büfecilik | Bakkal Satışı e-Arşiv (Çoklu KDV) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>İşyerine Aylık Mutfak Malzemesi e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Bakkal / büfe tüketiciye talep halinde e-Arşiv düzenler; aynı belgede %1 (ekmek, temel gıda), %10 (işlenmiş gıda) ve %20 (temizlik, tütün dışı ürünler) oranları birlikte bulunur. Çevredeki işyerlerine toplu satışlarda alıcı e-Fatura mükellefiyse e-Fatura düzenlenir. |
| D.04 | Balıkçılık | Balıkçıdan Av Alımı e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ`<br>Restorana Taze Balık e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Balık toptancısı kayık sahibi balıkçılardan av alımını e-Müstahsil (su ürünleri hayvansal ürün: %1 stopaj) ile belgeler; restoran ve marketlere satışı e-Fatura ile yapar (taze balık KDV %1). |
| D.05 | Besicilik, Celeplik | Çiftçiden Besi Danası Alımı e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ`<br>Et Kombinasına Canlı Hayvan e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Besici / celep çiftçiden canlı hayvan alımını e-Müstahsil ile (hayvan %1 stopaj, borsa tescil, mera fonu, Bağ-Kur) belgeler; kesimhane ve et kombinalarına satışı e-Fatura ile yapar (canlı hayvan KDV %1). Küpe numaraları satır ek alanıdır. |
| D.06 | Bitkisel Ürünlerle İlgili Faaliyetler | Çiftçiden Hububat Alımı e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ`<br>Biçerdöver Hasat Hizmeti e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Bitkisel ürün tüccarı / hizmet sağlayıcı çiftçiden hububat alımında e-Müstahsil (%2 stopaj, borsa tescil, Bağ-Kur) düzenler; biçerdöver / ilaçlama gibi tarımsal hizmetleri çiftçiye e-Arşiv ile faturalar. |
| D.07 | Börekçilik | Börek Salonu Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Ofise Tepsi Börek e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Börekçi tüketiciye e-Arşiv düzenler; ofis / kafe / kantinlere tepsi siparişlerinde alıcı e-Fatura mükellefi olduğundan e-Fatura kullanılır. Unlu mamullerde KDV %10. |
| D.08 | Çeşitli Gıdaların İmalatı | Market Zincirine Gıda Satış e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Salça İhracat Faturası (DAP) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | Gıda imalatçısı market zincirlerine e-Fatura + e-İrsaliye ile satış yapar, Irak ve körfez ülkelerine ihracatını IHRACAT profiliyle (gümrük muhataplı, GTİP’li) faturalar. Parti no ve son tüketim tarihi satır ek alanlarıdır. |
| D.09 | Değirmencilik, Zahirecilik | Çiftçiden Buğday Alımı e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ`<br>Fırına Un Satış e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Değirmenci / zahireci çiftçiden hububat alımını e-Müstahsil (%2, borsa tescil) ile; ürettiği unu fırınlara e-Fatura ile (un KDV %1) satar. Kepek ve yem ürünleri farklı KDV oranındadır. |
| D.10 | Dondurmacılık | Dondurma Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Restorana Toptan Dondurma e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Dondurmacı tüketiciye külah / kilo satışında e-Arşiv düzenler; kafe ve restoranlara toptan dondurma satışında e-Fatura kullanır (soğuk zincir için irsaliye tercih edilir). |
| D.11 | Evcil Hayvan Bakımı, Ticareti | Mama ve Bakım Hizmeti e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Veteriner Kliniğine Mama e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Pet shop tüketiciye mama, aksesuar ve bakım hizmetini e-Arşiv ile; veteriner kliniklerine toptan mama satışını e-Fatura ile düzenler. Hayvanın çip numarası bakım hizmeti satırında belirtilebilir. |
| D.12 | Fırıncılık | Fırın Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Lokantaya Aylık Ekmek e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Fırın tüketiciye e-Arşiv düzenler; restoran, kantin ve marketlere günlük ekmek teslimini aylık e-Fatura ile (ekmek KDV %1) faturalar. Dönemsel teslimlerde InvoicePeriod kullanılır. |
| D.13 | Gübre, Zirai İlaç İmalatı, Ticareti | Çiftçiye Reçeteli Zirai İlaç Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Kooperatife Gübre Satış e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Gübre ve zirai ilaç bayii çiftçiye satışta e-Arşiv düzenler; zirai ilaçlar ziraat mühendisi reçetesiyle satılır (reçete no belge referansı). Kooperatif ve tarım işletmelerine e-Fatura kullanılır. Gübre teslimlerinde KDV oranı %0 (istisna dışı, kod 351) — güncel oran kontrol edilmelidir. |
| D.14 | Kantincilik | Kantin Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Fabrikaya Personel Yemeği (Tevkifat 604) — *e-Fatura* `TICARIFATURA · TEVKIFAT 604` | Kantinci öğrencilere / çalışanlara perakende satışta e-Arşiv düzenler; işyerine personel yemeği verdiğinde yemek servis hizmeti belirlenmiş alıcılarda 604 (5/10) tevkifatına tabidir. |
| D.15 | Kasaplık | Et Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Restorana Et Teslimi e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Çiftçiden Kesimlik Hayvan e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ` | Kasap tüketiciye et satışında e-Arşiv (kırmızı et KDV %1), restoran / otellere e-Fatura düzenler; çiftçiden kurbanlık veya kesimlik hayvan alımında e-Müstahsil (hayvan %1 stopaj) kullanılır. |
| D.16 | Kuruyemiş İmalatı, Ticareti | Online Kuruyemiş Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Bahçeden Antep Fıstığı Alımı e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ` | Kuruyemişçi online satışlarda e-Arşiv internet satışı alanlarını kullanır; bahçe sahibinden Antep fıstığı / fındık alımında e-Müstahsil (bitkisel %2 stopaj, borsa tescil) düzenler. |
| D.17 | Lokantacılık | Masa Adisyonu e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Şirkete Toplu Yemek (Tevkifat 604) — *e-Fatura* `TICARIFATURA · TEVKIFAT 604` | Lokanta masa hesabını e-Arşiv ile (yemek KDV %10) düzenler; şirketlere toplu yemek / catering hizmetinde belirlenmiş alıcılara 604 (5/10) KDV tevkifatı uygulanır. |
| D.18 | Manavlık | Manav Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Restorana Sebze-Meyve HKS e-Faturası — *e-Fatura* `HKS · HKSSATIS` | Manav tüketiciye e-Arşiv (taze meyve-sebze KDV %1) düzenler; restoranlara toptan satışta Hal Kayıt Sistemi künyesiyle HKS profilli e-Fatura (HKSSATIS) kullanması gerekir. |
| D.19 | Meşrubat İmalatı, Ticareti | Bayiye Meşrubat Satış e-Faturası (ÖTV) — *e-Fatura* `TICARIFATURA · SATIS`<br>Dağıtım Aracı Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Meşrubat dağıtıcısı market ve büfelere e-Fatura + e-İrsaliye ile satış yapar. Kolalı gazozlar ÖTV (III) sayılı liste kapsamındadır: TaxTypeCode 0073 satır vergisi KDV matrahına dahil edilir; su ve meyve suyu ÖTV dışıdır. |
| D.20 | Pastanecilik, Tatlıcılık | Özel Gün Pastası e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Kafeye Tatlı Tedarik e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Pastane tüketiciye e-Arşiv; kafe ve otellere düzenli pasta / tatlı tedarikinde e-Fatura düzenler. Unlu mamul ve tatlılarda KDV %10. |
| D.21 | Şarküteri Ürünleri İmalatı, Ticareti | Şarküteri Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Otele Kahvaltılık e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Köylüden Peynir Alımı e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ` | Şarküteri tüketiciye e-Arşiv, otel ve kafelere e-Fatura düzenler; köylü üreticiden peynir / tereyağı alımında e-Müstahsil (hayvansal ürün %1 stopaj) kullanılır. |
| D.22 | Şekercilik, Çikolatacılık | Bayram Şekeri Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Lokum İhracat Faturası (CIF) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | Şekerci tüketiciye e-Arşiv (bayram kutuları), yurt dışı distribütörlere lokum ihracatını IHRACAT profiliyle (GTİP 1704) faturalar. |
| D.23 | Tavukçuluk | Restorana Piliç Eti e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Yetiştiriciden Canlı Piliç e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ` | Tavukçuluk işletmesi restoran ve marketlere piliç eti satışında e-Fatura (KDV %1, kesim / parti bilgisi), sözleşmeli yetiştiriciden canlı piliç alımında e-Müstahsil (hayvan %1 stopaj) düzenler. |
| D.24 | Yaş Sebze, Meyve Ticareti | Komisyoncu Satış e-Faturası (HKS) — *e-Fatura* `HKS · HKSKOMISYONCU`<br>Hal Sevk İrsaliyesi (HKS) — *e-İrsaliye* `HKSIRSALIYE · SEVK`<br>Üreticiye Satış Bedeli e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ` | Hal komisyoncusu üreticinin malını onun adına satar: alıcıya HKS profilli e-Fatura (HKSKOMISYONCU), sevkiyatta HKSIRSALIYE, üreticiye satış bedeli için e-Müstahsil Makbuzu düzenler. Tüm belgelerde hal künye numarası yer alır. |
| D.25 | Yufkacılık, Kadayıfçılık | Yufka Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Tatlıcıya Toptan Yufka e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Yufkacı tüketiciye e-Arşiv düzenler (yufka %1); baklava ve kadayıf tatlıcılarına toptan yufka / tel kadayıf satışı e-Fatura ile yapılır. |

### E — Giyim, Deri Ürün, Ev Tekstili, Dokuma

- Konfeksiyon ve dokumacılıkta fason dikim / boyama işleri KDV tevkifatı 609 (7/10), ham deri ve yapağı teslimleri 622 (9/10) kapsamındadır.
- İhracatçıya ihraç kaydıyla teslimde InvoiceTypeCode IHRACKAYITLI (istisna 701): KDV hesaplanıp tecil edilir, PayableAmount = matrah. Doğrudan ihracatta IHRACAT profili ile gümrük muhataplı fatura; satırda INCOTERMS, 12 haneli GTİP ve kap bilgisi.
- Halıcı ve deri mağazalarının turist satışlarında YOLCUBERABERFATURA: BuyerCustomerParty PARTYTYPE=TAXFREE + pasaport, TaxRepresentativeParty aracı kurum, istisna kodu 501 ile KDV hesaplanır.
- Beden, numara, renk, desen, düğüm sıklığı, ebat gibi nitelikler AdditionalItemIdentification (BEDEN / NUMARA / RENK / DESEN / DUGUM / OLCU) ile taşınır.
- Kuru temizleme, terzi ve halı yıkama hizmetlerinde e-Arşiv; ev hanımlarından el dokuması halı / kilim ve ikinci el tekstil alımlarında e-Gider Pusulası kullanılır.

| Kod | Meslek | Belge türleri (şablonlar) | Gerekçe |
|---|---|---|---|
| E.01 | Ayakkabıcılık | Ayakkabı Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Fason Saya Dikim Faturası (Tevkifat 609) — *e-Fatura* `TICARIFATURA · TEVKIFAT 609` | Ayakkabıcı mağazada tüketiciye e-Arşiv (numara / renk satırda) düzenler; markalara yaptığı fason saya dikim işlerinde 609 kodlu (çanta ve ayakkabı dikim işleri) 7/10 KDV tevkifatlı e-Fatura keser. |
| E.02 | Çamaşırhane, Kuru Temizleme, Ütücülük Hizmetleri | Kuru Temizleme e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Otel Çamaşır Hizmeti e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Kuru temizlemeci bireysel müşterilere e-Arşiv düzenler; otel ve restoranlara toplu çamaşır yıkama hizmetini dönemsel e-Fatura ile faturalar (çamaşır yıkama 612 temizlik hizmeti kapsamında değildir). |
| E.03 | Deri Aksesuar İmalatı, Ticareti | Online Deri Çanta Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Turiste Tax Free Satış (Yolcu Beraberi) — *e-Fatura (Yolcu Beraberi)* `YOLCUBERABERFATURA · ISTISNA` | Deri aksesuar satıcısı online satışlarda e-Arşiv internet satışı, turist satışlarında yolcu beraberi eşya faturası (YOLCUBERABERFATURA; KDV hesaplanır, aracı kurumla iade) düzenler. |
| E.04 | Deri Giyim Eşyası İmalatı, Onarımı | İhraç Kayıtlı Deri Ceket Teslimi — *e-Fatura* `TICARIFATURA · IHRACKAYITLI 701`<br>Deri Mont Onarım e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Deri giyim imalatçısı ihracatçı firmaya ihraç kaydıyla teslimde IHRACKAYITLI (istisna 701, KDV tecil) e-Fatura; tüketiciye tadilat / onarım hizmetinde e-Arşiv düzenler. |
| E.05 | Deri Giyim Eşyası Ticareti | Deri Ceket Tax Free Faturası — *e-Fatura (Yolcu Beraberi)* `YOLCUBERABERFATURA · ISTISNA`<br>Mağaza Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Turistik bölgedeki deri mağazası yabancı turistlere yolcu beraberi eşya faturası (Tax Free), yerli müşterilere e-Arşiv düzenler. |
| E.06 | Dericilik | Ham Deri Teslim Faturası (Tevkifat 622) — *e-Fatura* `TICARIFATURA · TEVKIFAT 622`<br>Vatandaştan Kurban Derisi Alımı Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · SATIS` | Tabakhane belirlenmiş alıcılara ham post ve deri tesliminde 622 kodlu 9/10 KDV tevkifatlı e-Fatura düzenler; kurban bayramında vatandaştan / derneklerden belge alamadan aldığı ham deriler için e-Gider Pusulası kullanır. |
| E.07 | Dokumacılık | İhraç Kayıtlı Kumaş Teslim Faturası — *e-Fatura* `TICARIFATURA · IHRACKAYITLI 701`<br>Kumaş İhracat Faturası (EXW) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA`<br>Kumaş Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Dokuma fabrikası konfeksiyon ihracatçılarına ihraç kaydıyla kumaş teslimini IHRACKAYITLI (701, KDV tecil) e-Fatura ile, yurt dışı alıcılara doğrudan ihracatı IHRACAT profiliyle yapar; yurt içi sevkiyatlar e-İrsaliye ile. |
| E.08 | Ev Tekstil Ürünleri İmalatı, Ticareti | Online Nevresim Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Otel Zincirine Tekstil e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Ev tekstili üreticisi online tüketici satışlarında e-Arşiv internet satışı; otel zincirlerine toplu havlu / nevresim satışında e-Fatura düzenler. |
| E.09 | Halı Yıkama Hizmetleri | Halı Yıkama e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Belediyeye Cami Halısı Yıkama (KAMU) — *e-Fatura* `KAMU · SATIS` | Halı yıkamacı evlere metrekare bazlı e-Arşiv düzenler; belediye / müftülük gibi kamu idarelerine (ör. cami halıları) KAMU senaryolu e-Fatura keser (ödeme hesabı IBAN zorunlu). |
| E.10 | Halıcılık, Kilimcilik | El Dokuma Halı Tax Free Faturası — *e-Fatura (Yolcu Beraberi)* `YOLCUBERABERFATURA · ISTISNA`<br>Ev Hanımından Halı Alımı Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · SATIS` | Halıcı turistlere yolcu beraberi eşya faturası (Tax Free) düzenler; evinde halı dokuyan ev hanımlarından alımda (esnaf muaflığı) %2 stopajlı e-Gider Pusulası kullanır. |
| E.11 | İkinci El Tekstil Ürünleri Ticareti | Vintage Giysi Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>İkinci El Giysi Alımı Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · SATIS` | İkinci el tekstil satıcısı tüketiciye e-Arşiv düzenler; vatandaşlardan kilo bazında ikinci el giysi alımını e-Gider Pusulası ile belgeler. |
| E.12 | Konfeksiyonculuk | Fason Dikim Faturası (Tevkifat 609) — *e-Fatura* `TICARIFATURA · TEVKIFAT 609`<br>Hazır Giyim İhracat Faturası (FCA) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA`<br>Fasona Kesilmiş Kumaş Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Konfeksiyoncu markalara fason dikim yapıyorsa 609 (7/10) tevkifatlı e-Fatura, doğrudan yurt dışı alıcıya satışta IHRACAT profilli fatura düzenler; fasona kumaş gönderimi / ürün teslimi e-İrsaliye ile izlenir. |
| E.13 | Tasarım Faaliyetleri | Koleksiyon Tasarımı e-SMM (Stopajlı) — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU`<br>Yurt Dışına Tasarım Hizmeti (İhracat) — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU` | Serbest tasarımcı serbest meslek erbabıdır: yurt içi işverene %20 stopajlı e-SMM düzenler. Yurt dışındaki müşteriye verilen ve yurt dışında yararlanılan tasarım hizmeti hizmet ihracatıdır (KDV 11/1-a, istisna 302). |
| E.14 | Tekstil Baskıcılığı, Boyacılığı | Fason Boya-Baskı Faturası (Tevkifat 609) — *e-Fatura* `TICARIFATURA · TEVKIFAT 609`<br>Boyanmış Kumaş İade Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Tekstil baskı / boyahanesi müşteri kumaşını fason boyar: 609 (7/10) tevkifatlı e-Fatura; işlenen kumaş müşteriye e-İrsaliye ile iade sevk edilir. |
| E.15 | Terzilik | Ismarlama Takım e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Otel Personel Üniforması e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Terzi bireysel ısmarlama ve tadilat işlerini e-Arşiv ile; işletmelere personel üniforması dikimini e-Fatura ile faturalar. |
| E.16 | Tuhafiye İmalatı, Ticareti | Tuhafiye Perakende e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Atölyeye Toptan Aksesuar e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Tuhafiyeci perakende müşterilere e-Arşiv, konfeksiyon atölyelerine toptan aksesuar satışında e-Fatura düzenler. |

### F — Hediyelik Eşya, Eğitim, Basım, Fotoğraf, Çeşitli Mallar

- Matbaa ve baskı işlerinde belirlenmiş alıcılara KDV tevkifatı 615 (7/10), ticari reklam hizmetlerinde 625 (3/10) uygulanır; iş emri / tasarım onay numarası AdditionalDocumentReference olarak verilir.
- Tercüman, arzuhalci, danışman, fotoğraf sanatçısı ve bireysel sanatkâr serbest meslek erbabıdır: e-SMM (SERBESTMESLEKMAKBUZU), işverene düzenlenen makbuzda %20 GV stopajı. Danışmanlık hizmeti belirlenmiş alıcıya verilirse 602 (9/10) KDV tevkifatı da eklenir.
- Kurs ve kreşlerde dönemsel ücretler e-Arşiv'de InvoicePeriod (eğitim dönemi) ile; kitap ve süreli yayınlarda KDV oranı %0 / %10 satır bazında ayrışır.
- Fatura tahsilat büroları tahsil ettikleri faturaları değil, kurumlardan aldıkları komisyonu e-Fatura ile belgeler; müşteriye verilen tahsilat makbuzu e-belge değildir.
- Antika ve sanat eseri satışlarında yabancı alıcıya yolcu beraberi fatura, plastik / kağıt ürün imalatçılarında e-Fatura + e-İrsaliye ve hurda alımında gider pusulası öne çıkar.

| Kod | Meslek | Belge türleri (şablonlar) | Gerekçe |
|---|---|---|---|
| F.01 | Arzuhalcilik, Danışmanlık, Bilgi Hizmetleri | Dilekçe ve Sözleşme Yazımı e-SMM — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU`<br>Kurumsal İK Danışmanlığı e-SMM (Stopaj + Tevkifat 602) — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU` | Arzuhalci ve danışman serbest meslek erbabıdır: vatandaşa dilekçe / sözleşme yazımında e-SMM (gerçek kişi müşteri stopaj sorumlusu değildir), şirketlere danışmanlıkta %20 GV stopajlı e-SMM düzenler. Danışmanlık hizmeti belirlenmiş alıcıya verilirse 602 kodlu 9/10 KDV tevkifatı da uygulanır. |
| F.02 | Basın, Yayım, İletişim | Dağıtıcıya Kitap Satış Faturası (İstisna 335) — *e-Fatura* `TICARIFATURA · ISTISNA 335`<br>Okura Online Kitap Satışı e-Arşiv (İstisna 335) — *e-Arşiv Fatura* `EARSIVFATURA · ISTISNA 335`<br>Dergi İlan Faturası (Tevkifat 625) — *e-Fatura* `TICARIFATURA · TEVKIFAT 625` | Basılı kitap ve süreli yayın teslimleri KDV Kanunu 13/n uyarınca tam istisnadır (poşetli ve elektronik yayınlar hariç): dağıtıcı ve kitapçılara e-Fatura, okura web satışında e-Arşiv internet satışı ISTISNA 335 ile düzenlenir. Dergideki ilan / reklam geliri genel oranda KDV'ye tabidir ve belirlenmiş alıcılarda 625 (3/10) tevkifatı uygulanır. |
| F.03 | Bireysel Sanatkârlık Faaliyetleri | Beste Telif Devri e-SMM (Stopaj %17) — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU`<br>Tablo Satışı e-SMM (Koleksiyoncuya) — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU` | Eser sahibinin (ressam, besteci, yazar) eser satışı ve hak devri GVK 18 kapsamında gelir vergisinden istisnadır ancak şirket alıcılar %17 stopaj keser; eser sahibi e-SMM düzenler (yalnız GVK 94 sorumlularına satış yapıp makbuz yükümlülüğünden çıkanlar için alıcı gider pusulası düzenler). GVK 18 istisnası KDV istisnası değildir. |
| F.04 | Çeşitli Malların Ticareti | Markete Toptan Ev Gereçleri e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Toptan Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK`<br>Irak'a TIR ile İhracat Faturası (DAP) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | Uzmanlaşmamış toptancı perakendecilere e-Fatura ve araçla sevkiyatta e-İrsaliye düzenler; komşu ülkelere TIR ile satışlarda IHRACAT profilli, gümrük muhataplı fatura kullanır. Perakende tezgâh satışları e-Arşiv ile belgelenir. |
| F.05 | Çiçekçilik | Online Çiçek Siparişi e-Arşiv (İnternet) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Otel Aylık Çiçek Düzenleme e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Üreticiden Kesme Çiçek Alımı e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ` | Çiçekçi tüketiciye e-Arşiv (online siparişte internet satışı alanları ve kurye teslimi) düzenler; otel ve şirketlere aylık çiçek düzenleme hizmetini e-Fatura ile faturalar. Kesme çiçeği doğrudan ÇKS kayıtlı üreticiden alıyorsa e-Müstahsil Makbuzu (%2 stopaj) düzenler. |
| F.06 | Fatura Tahsilat Bürosu İşletmeciliği | Ödeme Kuruluşuna Aylık Komisyon e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>İşlem Hizmet Bedeli e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Fatura tahsilat bürosu müşterinin ödediği kurum faturalarını kendi hasılatı olarak değil emanet olarak tahsil eder; gelir olan komisyonu ödeme kuruluşuna / kuruma aylık e-Fatura ile belgeler. Müşteriden ayrıca işlem hizmet bedeli alınıyorsa bunun için e-Arşiv düzenlenir; müşteriye verilen tahsilat dekontu e-belge değildir. |
| F.07 | Fotoğrafçılık | Düğün Çekim Paketi e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>E-Ticaret Ürün Fotoğrafı e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Fotoğrafçı tüketiciye düğün / vesikalık çekimlerinde e-Arşiv, firmalara katalog ve e-ticaret ürün çekimlerinde e-Fatura düzenler. Fotoğraf sanatçısı olarak eser (fotoğraf) hakkı devri yapıyorsa e-SMM ve GVK 18 kapsamında %17 stopaj söz konusu olur. |
| F.08 | Fotokopicilik, Tez Yazımı | Tez Baskı ve Ciltleme e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Üniversiteye Fotokopi Hizmeti (KAMU) — *e-Fatura* `KAMU · SATIS` | Fotokopici öğrencilere ve vatandaşlara e-Arşiv düzenler; üniversite gibi kamu idarelerine yapılan baskı / fotokopi hizmetinde KAMU senaryolu e-Fatura (ödeme IBAN zorunlu) kullanır. Belirlenmiş alıcılara yapılan baskı işi 615 (7/10) tevkifat kapsamına girebilir; sadece fotokopi çekimi ise basım hizmeti sayılmayabilir. |
| F.09 | Hediyelik Eşya İmalatı, Ticareti | Turiste Seramik Satışı (Yolcu Beraberi) — *e-Fatura (Yolcu Beraberi)* `YOLCUBERABERFATURA · ISTISNA`<br>Hediyelik Dükkânına Toptan e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Yurt Dışı Online Sipariş Mikro İhracat (ETGB) — *e-Arşiv (Mikro İhracat / ETGB)* `EARSIVFATURA · ISTISNA` | Hediyelik eşya imalatçı-satıcısı yabancı turistlere yolcu beraberi eşya faturası (Tax Free, istisna 501), yerli ziyaretçilere e-Arşiv, diğer hediyelik dükkânlarına toptan satışta e-Fatura düzenler. Yurt dışına online küçük gönderiler ETGB'li mikro ihracattır. |
| F.10 | Kağıt, Kağıt Ürünleri İmalatı, Ticareti | Gıda Firmasına Koli Satış e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Koli Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK`<br>Toplayıcıdan Atık Kağıt Alımı Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · SATIS` | Kağıt / ambalaj üreticisi sanayicilere koli ve kağıt ürünlerini e-Fatura ile satar, sevkiyatı e-İrsaliye ile yapar. Hammadde olarak sokak toplayıcılarından ve vergiden muaf kişilerden atık kağıt alımlarında e-Gider Pusulası düzenlenir; atıktan elde edilen hammadde (kağıt hamuru) tesliminde 621 (9/10) tevkifat uygulanır. |
| F.11 | Kauçuk, Plastik Ürünlerin İmalatı, Ticareti | Yan Sanayiye Conta ve Hortum e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Rejenere Granül Teslimi (Tevkifat 621) — *e-Fatura* `TICARIFATURA · TEVKIFAT 621`<br>Kauçuk Conta İhracat Faturası (FCA) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | Plastik-kauçuk imalatçısı otomotiv yan sanayi ve sanayi müşterilerine e-Fatura düzenler; atık plastikten rejenere granül teslimleri 621 kodlu 9/10 tevkifata tabidir. Yurt dışı müşterilere IHRACAT profilli fatura (GTİP 39 / 40) kullanılır. |
| F.12 | Kırtasiye İmalatı, Ticareti | Okul Alışverişi e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Özel Okula Toptan Kırtasiye e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Kırtasiyeci veliler ve öğrencilere e-Arşiv düzenler; kurşun kalem, boya kalemi, okul defteri, silgi, kalemtıraş, cetvel gibi ürünler (II) sayılı listede %10, diğer kırtasiye ve fotokopi kağıdı %20 KDV'ye tabidir. Okul ve şirketlere toplu satışta e-Fatura kullanılır. |
| F.13 | Kitapçılık | Kitap Satışı e-Arşiv (İstisna 335) — *e-Arşiv Fatura* `EARSIVFATURA · ISTISNA 335`<br>Okul Kütüphanesine Kitap (KAMU, İstisna 335) — *e-Fatura* `KAMU · ISTISNA 335`<br>Vatandaştan İkinci El Kitap Alımı Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · SATIS` | Basılı kitap ve süreli yayın satışı (ikinci el dahil) KDV 13/n uyarınca tam istisnadır: okura e-Arşiv, okul kütüphanesi gibi kamu idarelerine KAMU senaryolu e-Fatura ISTISNA 335 ile düzenlenir. Sahaf olarak vatandaştan ikinci el kitap alımı e-Gider Pusulası ile belgelenir. |
| F.14 | Kreş İşletmeciliği | Aylık Kreş Ücreti e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Şirkete Kurumsal Kreş Hizmeti e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Kreş velilere aylık ücret için e-Arşiv düzenler (okul öncesi eğitim hizmetinde indirimli KDV oranı); çalışanlarının çocukları için anlaşma yapan şirketlere kurumsal e-Fatura keser. Dönem bilgisi InvoicePeriod ile verilir. |
| F.15 | Kurs İşletmeciliği | Sınav Hazırlık Kursu e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Sürücü Kursu B Sınıfı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Kurumsal İngilizce Eğitimi e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Özel öğretim kursları öğrenci ve velilere dönemsel ücret için e-Arşiv (InvoicePeriod eğitim dönemi), şirketlere personel eğitimi için e-Fatura düzenler. Taksitli tahsilatta tek fatura düzenlenip ödeme planı not olarak verilebilir. |
| F.16 | Matbaacılık | Katalog Baskı Faturası (Tevkifat 615) — *e-Fatura* `TICARIFATURA · TEVKIFAT 615`<br>Düğün Davetiyesi e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Basılı Katalog Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Matbaa her türlü baskı ve basım hizmetinde belirlenmiş alıcılara 615 kodlu 7/10 KDV tevkifatlı e-Fatura düzenler; bireysel müşterilere (davetiye, kartvizit) e-Arşiv keser. Basılı işlerin müşteri deposuna teslimi e-İrsaliye ile yapılır. |
| F.17 | Müzik Aletleri İmalatı, Onarımı, Ticareti | Online Enstrüman Satışı e-Arşiv (İnternet) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>El Yapımı Bağlama Mikro İhracat (ETGB) — *e-Arşiv (Mikro İhracat / ETGB)* `EARSIVFATURA · ISTISNA`<br>Konservatuvara Toplu Enstrüman e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Müzik aleti satıcısı / yapımcısı online satışta e-Arşiv internet satışı, yurt dışından gelen küçük siparişlerde ETGB'li mikro ihracat, okul ve konservatuvarlara toplu satışta e-Fatura düzenler. Onarım hizmetleri de e-Arşiv ile belgelenir. |
| F.18 | Oyuncak İmalatı, Ticareti | Oyuncakçıya Toptan e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Online Oyuncak Satışı e-Arşiv (İnternet) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Oyuncak imalatçısı oyuncakçı ve zincir mağazalara e-Fatura, kendi web sitesinden tüketiciye e-Arşiv internet satışı düzenler. Oyuncaklarda CE işareti ve yaş grubu ürün bilgisi olarak satırda gösterilir. |
| F.19 | Reklamcılık, Tabelacılık | Reklam Kampanyası Faturası (Tevkifat 625) — *e-Fatura* `TICARIFATURA · TEVKIFAT 625`<br>Işıklı Tabela İmalat ve Montaj e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Esnafa Vinil Afiş e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Reklam ajansı / tabelacı reklam kampanyası ve medya planlama hizmetinde belirlenmiş alıcılara 625 (3/10) tevkifatlı e-Fatura; tabela imalatı ve montajı mal teslimi olduğundan normal e-Fatura (tevkifatsız) düzenler. e-Fatura mükellefi olmayan esnafa e-Arşiv kesilir. |
| F.20 | Sanat Eseri, Antika Ticareti | Koleksiyoncuya Eser Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Yabancı Alıcıya Tablo Satışı (Yolcu Beraberi) — *e-Fatura (Yolcu Beraberi)* `YOLCUBERABERFATURA · ISTISNA`<br>Vatandaştan Antika Alımı Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · SATIS` | Sanat galerisi koleksiyonculara e-Arşiv, yabancı alıcılara yolcu beraberi eşya faturası düzenler (kültür varlığı niteliğindeki eserlerin yurt dışına çıkışı yasaktır; çağdaş eserler için uygundur). Vatandaştan belge alınamayan antika / eser alımları e-Gider Pusulası ile belgelenir. |
| F.21 | Tercümanlık | Diploma Tercümesi e-SMM (Bireysel) — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU`<br>Sözleşme Tercümesi e-SMM (Stopajlı) — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU`<br>Yurt Dışına Çeviri Hizmeti (Hizmet İhracatı) — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU` | Tercüman serbest meslek erbabıdır: bireysel müşteriye stopajsız, şirketlere %20 GV stopajlı e-SMM düzenler. Yurt dışındaki müşteriye verilen ve yurt dışında yararlanılan çeviri hizmeti hizmet ihracatıdır (KDV 11/1-a, istisna 302). |
| F.22 | Züccaciye İmalatı, Ticareti | Mağaza Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Restorana Toplu Porselen e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Restorana Teslim Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Züccaciyeci tüketiciye mağazada e-Arşiv, otel ve restoranlara toplu porselen-cam satışında e-Fatura düzenler; toplu teslimatlar kendi aracıyla e-İrsaliye eşliğinde yapılır. |

### G — Kuaför, Berber, Temizlik, Spor, Kozmetik, Sağlık

- Kuaför, berber, güzellik, dövme, hamam ve spor tesisi hizmetleri tüketiciye e-Arşiv ile belgelenir; seans / randevu / üyelik bilgisi InvoicePeriod ve AdditionalDocumentReference (RANDEVU, UYELIK) ile verilir.
- Kurumlara verilen temizlik hizmetinde KDV tevkifatı 612 (9/10); haşere kontrol ve dezenfeksiyon dahil.
- Optik ürünler ve tıbbi malzeme satışlarında SGK'ya faturalama InvoiceTypeCode SGK ile yapılır: alıcı SGK (VKN 7750409379), AccountingCost (SAGLIK_OPT, SAGLIK_MED …), InvoicePeriod ve AdditionalDocumentReference MUKELLEF_KODU / MUKELLEF_ADI / DOSYA_NO zorunludur.
- Tıbbi cihaz ve ilaç tedarikinde ILAC_TIBBICIHAZ profili: GTIN, seri / lot, son kullanma ve ÜTS numarası satır ek alanlarında taşınır.
- Hasta bakıcılığı ve alternatif tedavi bağımsız çalışanlarda e-SMM; cenaze hizmetlerinde ise belediyeye / kurum alıcılara e-Fatura, ailelere e-Arşiv düzenlenir.

| Kod | Meslek | Belge türleri (şablonlar) | Gerekçe |
|---|---|---|---|
| G.01 | Alternatif Tedavi Merkezi İşletmeciliği | Fizik Tedavi Seans Paketi e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Yabancı Hastaya Tedavi Paketi (İstisna 334) — *e-Arşiv Fatura* `EARSIVFATURA · ISTISNA 334` | Fizyoterapi / tamamlayıcı tıp merkezi danışana seans paketleri için e-Arşiv düzenler (sağlık hizmetinde indirimli KDV oranı). Türkiye'de yerleşik olmayan yabancı hastalara verilen ve bedeli döviz olarak ödenen sağlık hizmeti KDV 13/l uyarınca istisnadır (ISTISNA 334); alıcı VKN 2222222222 ile gösterilir. |
| G.02 | Cenaze Hizmetleri | Şehirler Arası Cenaze Nakli e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Belediyeye Cenaze Nakil Hizmeti (KAMU) — *e-Fatura* `KAMU · SATIS` | Özel cenaze hizmet işletmesi ailelere e-Arşiv düzenler; belediyelerin ihaleyle verdiği cenaze nakil / yıkama hizmetlerinde KAMU senaryolu e-Fatura (IBAN zorunlu) kullanır. |
| G.03 | Diş Laboratuvarlarının Faaliyetleri | Diş Kliniğine Aylık Protez e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Diş Hekimine Protez e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Diş laboratuvarı ısmarlama protezleri diş hekimine / kliniğe satar: şirket klinikler e-Fatura mükellefiyse aylık toplu e-Fatura, serbest çalışan diş hekimlerine TCKN ile e-Arşiv düzenlenir. Hasta ve iş emri bilgisi satır ve belge referanslarında taşınır. |
| G.04 | Dövme Salonu İşletmeciliği | Dövme Seansı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Dizi Setine Geçici Dövme e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Dövme stüdyosu bireysel müşterilere seans bazlı e-Arşiv düzenler; dizi / reklam prodüksiyonlarına geçici dövme ve sanatçı hizmetini kurumsal e-Fatura ile faturalar. |
| G.05 | Erkek Berberliği | Berber Hizmeti e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Otel Misafir Berber Hizmeti e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Berberlerin önemli kısmı basit usul / esnaf muaflığındadır ve fatura düzenleme zorunluluğu yoktur; işletme hesabı esasına tabi berber müşteri talebinde e-Arşiv, anlaşmalı otel veya kurumlara verilen hizmette e-Fatura düzenler. |
| G.06 | Genel Temizlik, Haşere Kontrol Faaliyetleri | Aylık Ofis Temizliği Faturası (Tevkifat 612) — *e-Fatura* `TICARIFATURA · TEVKIFAT 612`<br>Hastaneye İlaçlama Hizmeti (KAMU + Tevkifat 612) — *e-Fatura* `KAMU · TEVKIFAT 612`<br>Ev İlaçlama e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Temizlik firması belirlenmiş alıcılara (kamu idareleri, büyük şirketler) verdiği temizlik ve haşere kontrol hizmetinde 612 kodlu 9/10 KDV tevkifatlı e-Fatura düzenler; kamu alıcıda KAMU senaryosu. Ev ilaçlama ve bireysel temizlik hizmetleri e-Arşiv ile belgelenir. |
| G.07 | Güzellik Salonu İşletmeciliği | Lazer ve Cilt Bakımı Paketi e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Otel SPA Taşeron Hizmeti e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Güzellik salonu seans paketlerini e-Arşiv ile belgeler (paket bedeli peşin tahsil ediliyorsa fatura tahsilatta düzenlenir, seans planı belgede gösterilir); otellerin spa bölümüne verdiği taşeron hizmeti e-Fatura ile faturalar. |
| G.08 | Hasta Bakıcılığı | Evde Hasta Bakımı e-SMM — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU`<br>Bakım Evine Hemşirelik e-SMM (Stopajlı) — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU` | Serbest çalışan hemşire / hasta bakıcı serbest meslek erbabıdır: aileye e-SMM (stopajsız), özel bakım evi veya sağlık kuruluşuna verdiği hizmette %20 GV stopajlı e-SMM düzenler. Yatılı bakım evi işleten şirketler ise sakinlere aylık e-Arşiv keser. |
| G.09 | Kadın Kuaförlüğü | Kuaför Hizmeti e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Organizasyon Firmasına Gelin Paketi e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Kadın kuaförü müşteriye e-Arşiv düzenler; düğün organizasyon şirketlerine toplu gelin / nedime hizmetlerini e-Fatura ile faturalar. Satılan bakım ürünleri hizmetle aynı belgede ayrı satırdır. |
| G.10 | Kaplıca, Hamam İşletmeciliği | Hamam Paketi e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Tur Acentesine Grup Hamam e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Hamam ve kaplıca işletmesi bireysel ziyaretçilere e-Arşiv, misafirlerini getiren tur acentelerine toplu e-Fatura düzenler. Turistlere verilen hamam hizmeti Türkiye'de tüketildiğinden hizmet ihracatı değildir; konaklama içermediği için konaklama vergisi de uygulanmaz. |
| G.11 | Kozmetik İmalatı, Ticareti | Eczane Deposuna Kozmetik e-Faturası (ÖTV IV) — *e-Fatura* `TICARIFATURA · SATIS`<br>Online Kozmetik Satışı e-Arşiv (İnternet) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Yurt Dışı Kozmetik Gönderisi Mikro İhracat (ETGB) — *e-Arşiv (Mikro İhracat / ETGB)* `EARSIVFATURA · ISTISNA` | Kozmetik imalatçısı parfüm (kolonya hariç), makyaj ve cilt bakım ürünlerinin ilk tesliminde ÖTV (IV) sayılı liste %20 ÖTV hesaplar (TaxTypeCode 0074, KDV matrahına dahil); şampuan ve kolonya bu kapsam dışındadır. Toptan satış e-Fatura, web satışı e-Arşiv internet satışı, yurt dışına küçük gönderiler mikro ihracat ile belgelenir. |
| G.12 | Optik Ürünlerin İmalatı, Ticareti | Numaralı Gözlük Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>SGK Reçeteli Gözlük Faturası (SAGLIK_OPT) — *e-Fatura* `TICARIFATURA · SGK · SAGLIK_OPT` | Optisyen reçeteli gözlük ve lens satışında tüketiciye e-Arşiv düzenler; SGK'lı hastaların reçeteli gözlük camı / çerçeve bedelini SGK'ya aylık InvoiceTypeCode SGK + AccountingCost SAGLIK_OPT ile faturalar (alıcı SGK, mükellef kodu ve dosya no zorunlu). |
| G.13 | Spor Malzemeleri İmalatı, Ticareti | Spor Salonuna Fitness Ekipmanı e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Online Spor Malzemesi e-Arşiv (İnternet) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Gençlik ve Spor Müdürlüğüne Malzeme (KAMU) — *e-Fatura* `KAMU · SATIS` | Spor malzemesi üreticisi / satıcısı spor salonlarına ve kulüplere e-Fatura, tüketiciye online e-Arşiv internet satışı, gençlik ve spor müdürlükleri gibi kamu idarelerine KAMU senaryolu e-Fatura düzenler. |
| G.14 | Spor Tesisi İşletmeciliği | Yıllık Fitness Üyeliği e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Halı Saha Kiralama e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Kurumsal Üyelik e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Spor tesisi üyelik ve saatlik kullanım bedellerini tüketiciye e-Arşiv (üyelik dönemi InvoicePeriod, üyelik no belge referansı) ile; çalışanları için kurumsal üyelik alan şirketlere e-Fatura ile faturalar. |
| G.15 | Temizlik Malzemeleri İmalatı, Ticareti | Market Zincirine Deterjan e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Deterjan Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK`<br>Azerbaycan'a Deterjan İhracatı (CPT) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | Temizlik ürünleri üreticisi market zincirleri ve toptancılara e-Fatura, sevkiyatlarda e-İrsaliye düzenler; Azerbaycan, Irak gibi pazarlara ihracat IHRACAT profiliyle gümrük muhataplı faturalanır. |
| G.16 | Tıbbi Malzemelerin İmalatı, Ticareti | Hastaneye Steril Sarf Faturası (İlaç / Tıbbi Cihaz) — *e-Fatura* `ILAC_TIBBICIHAZ · SATIS`<br>SGK Medikal Malzeme Faturası (SAGLIK_MED) — *e-Fatura* `TICARIFATURA · SGK · SAGLIK_MED`<br>Hastaya Tekerlekli Sandalye e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Tıbbi malzeme firması hastane ve sağlık kuruluşlarına ILAC_TIBBICIHAZ profilli e-Fatura (GTIN, lot, son kullanma, ÜTS no satırda), SGK'ya reçeteli ortez-protez ve medikal malzemeler için SGK tipli fatura (AccountingCost SAGLIK_MED), hastalara doğrudan satışta e-Arşiv düzenler. |
| G.17 | Tuvalet İşletmeciliği | AVM Tuvalet İşletme Faturası (Tevkifat 612) — *e-Fatura* `TICARIFATURA · TEVKIFAT 612`<br>Kır Düğünü Seyyar WC e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Umumi tuvalet giriş ücretleri ödeme kaydedici cihaz fişiyle belgelenir; işletmeci AVM ve kurumlara verdiği tuvalet işletme-temizlik hizmetini 612 (9/10) tevkifatlı e-Fatura ile, düğün / etkinlik için seyyar WC kabini hizmetini bireysel müşteriye e-Arşiv ile faturalar. |

### H — Metal, Otomotiv, Makine

- Demir-çelik ürün teslimlerinde IDIS profili (e-Fatura ProfileID IDIS, e-İrsaliye IDISIRSALIYE): satıcıda SEVKIYATNO, satırlarda ETIKETNO; belirlenmiş alıcılara 627 (5/10) KDV tevkifatı.
- Hurdacılıkta vatandaştan alım e-Gider Pusulası ile (GVK 9/7 kapsamındaki toplayıcılardan alımda %2 stopaj, GVK 94/13), işlenmiş hurda / külçe satışları 617-621 tevkifat kodlarıyla e-Fatura olarak düzenlenir; kantar fişi AdditionalDocumentReference KANTARFISI.
- Kuyumculukta ziynet eşyası satışı özel matrah 805 (altın) / 808 (gümüş) ile: InvoiceTypeCode OZELMATRAH, KDV yalnız işçilik / kâr farkı üzerinden (TaxableAmount = özel matrah). Müşteriden hurda altın alımı e-Kıymetli Maden belgesi (CreditNote / EKIYMETLIMADENBELGE / ALIM; SUBENO, MUSTERITURU, ISTATISTIKNO; birim GRM).
- Oto servis, kaporta, boya, elektrik ve makine onarımında kurumsal müşterilere 603 (7/10) tevkifat; araç plakası, şasi no ve kilometre satır ek alanları (PLAKA / SASI / KM).
- Deniz taşıtı inşa / onarımında KDV Kanunu 13/a istisnası (ISTISNA 304); motosiklet satışında ÖTV (II) satır vergisi (TaxTypeCode 9077, Percent) KDV matrahına dahildir.

| Kod | Meslek | Belge türleri (şablonlar) | Gerekçe |
|---|---|---|---|
| H.01 | Alüminyum Ürün İmalatı | Alüminyum Profil Satışı (Tevkifat 619) — *e-Fatura* `TICARIFATURA · TEVKIFAT 619`<br>Ev Pencere Doğraması e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Şantiyeye Profil Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Alüminyum ürün teslimleri belirlenmiş alıcılara 619 kodlu (bakır, çinko, alüminyum ve kurşun ürünleri) 7/10 KDV tevkifatlı e-Fatura ile yapılır; ev sahiplerine doğrama ve montaj e-Arşiv ile belgelenir. Şantiyeye profil sevkiyatı e-İrsaliye gerektirir. |
| H.02 | At Arabası İmalatı, Onarımı | Turizm İşletmesine Fayton İmalatı e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>At Arabası Onarım e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | At arabası / fayton imalatçısı turizm işletmelerine e-Fatura, çiftçi ve bireysel alıcılara imalat ve onarım için e-Arşiv düzenler. |
| H.03 | Bakırcılık | Turiste Bakır Eşya Satışı (Yolcu Beraberi) — *e-Fatura (Yolcu Beraberi)* `YOLCUBERABERFATURA · ISTISNA`<br>Kalaylama ve Bakır Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Otel Zincirine Bakır Servis Takımı (Tevkifat 619) — *e-Fatura* `TICARIFATURA · TEVKIFAT 619` | Bakırcı turistlere yolcu beraberi eşya faturası (Tax Free), yerli müşterilere ürün ve kalaylama hizmetinde e-Arşiv düzenler. Bakır ürünlerinin belirlenmiş alıcılara (otel zincirleri gibi) tesliminde 619 kodlu 7/10 KDV tevkifatı uygulanır. |
| H.04 | Çilingirlik | Kapı Açma ve Kilit Değişimi e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Site Yönetimine Kilit Sistemi e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Çilingir bireysel müşterilere kapı açma ve kilit değişimini e-Arşiv ile belgeler; site / plaza yönetimlerine dönemsel anahtar-kilit hizmetlerini e-Fatura ile faturalar. |
| H.05 | Demir, Çelik Eşya İmalatı, Ticareti | İnşaat Demiri Faturası (IDIS + Tevkifat 627) — *e-Fatura* `IDIS · TEVKIFAT 627`<br>Demir-Çelik Sevk İrsaliyesi (IDIS) — *e-İrsaliye* `IDISIRSALIYE · SEVK`<br>Gürcistan'a Çelik Profil İhracatı (DAP) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | Demir-çelik ürünleri IDIS profiliyle (e-Fatura ProfileID IDIS, e-İrsaliye IDISIRSALIYE) belgelenir: satıcıda SEVKIYATNO, her satırda ETIKETNO zorunludur. Belirlenmiş alıcılara teslimde 627 kodlu 5/10 KDV tevkifatı uygulanır; yurt dışı satışlar IHRACAT profilli faturayla yapılır. |
| H.06 | Deniz Taşıtları İmalatı, Onarımı, Ticareti | Turizm Teknesi Bakım-Onarım (İstisna 304) — *e-Fatura* `TICARIFATURA · ISTISNA 304`<br>Yat İhracat Faturası (FOB) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA`<br>Özel Tekne Bakımı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Ticari amaçla kullanılan deniz taşıtlarının (turizm belgeli gulet, balıkçı teknesi vb.) inşa, bakım ve onarımı KDV 13/a uyarınca istisnadır (ISTISNA 304); özel gezinti teknelerinin bakımı KDV'ye tabidir ve e-Arşiv ile faturalanır. Yurt dışı alıcıya tekne satışı IHRACAT profiliyle yapılır. |
| H.07 | Dökümcülük | Makine Firmasına Döküm Parça e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Hurdadan Külçe Teslimi (Tevkifat 617) — *e-Fatura* `TICARIFATURA · TEVKIFAT 617`<br>Döküm Parça Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Dökümhane makine imalatçılarına döküm parçaları e-Fatura ile satar ve e-İrsaliye ile sevk eder. Hurda metalden elde ettiği külçeleri belirlenmiş alıcılara sattığında 617 kodlu 7/10 KDV tevkifatı uygulanır; döküm no ve parti bilgisi satırda taşınır. |
| H.08 | Ev Aletleri İmalatı, Onarımı, Ticareti | Ocak ve Şofben Onarımı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Yemekhane Ekipman Bakımı (Tevkifat 603) — *e-Fatura* `TICARIFATURA · TEVKIFAT 603` | Ev aletleri servisi bireysel müşterilere onarım ve parça satışını e-Arşiv ile belgeler; kamu idareleri ve büyük işletmeler gibi belirlenmiş alıcılara yapılan makine-teçhizat bakım onarımında 603 kodlu 7/10 KDV tevkifatlı e-Fatura düzenler. |
| H.09 | Hurdacılık | Toplayıcıdan Hurda Alımı Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · SATIS`<br>Çelikhaneye Hurda Teslimi (Tevkifat 620) — *e-Fatura* `TICARIFATURA · TEVKIFAT 620`<br>Hurda Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Hurdacı kapı kapı dolaşan toplayıcılardan (GVK 9/7 esnaf muaflığı) yaptığı alımlarda %2 stopajlı e-Gider Pusulası düzenler (nihai tüketicinin kendi hurdası için stopaj yoktur). Hurda teslimleri KDV'den istisna olup istisnadan vazgeçenler belirlenmiş alıcılara 620 kodlu 7/10 tevkifatlı fatura keser; çelikhaneye sevkiyat kantar fişiyle e-İrsaliye ile yapılır. |
| H.10 | İklimlendirme, Soğutma Sistemi İmalatı, Kurulumu, Onarımı | Klima Satış ve Montaj e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Otel Chiller Bakım Faturası (Tevkifat 603) — *e-Fatura* `TICARIFATURA · TEVKIFAT 603`<br>Konut Projesine VRF Tesisatı (Tevkifat 601) — *e-Fatura* `TICARIFATURA · TEVKIFAT 601` | İklimlendirme firması ev kullanıcılarına klima satış-montajında e-Arşiv; otel gibi belirlenmiş alıcılara bakım-onarımda 603 (7/10) tevkifatlı e-Fatura; inşaat projelerinde alt yüklenici olarak yaptığı tesisat yapım işi sayıldığından 601 (4/10) tevkifatlı e-Fatura düzenler. |
| H.11 | Kalaycılık, Kaplamacılık | Fason Galvaniz Kaplama e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Kaplanmış Parça İade Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK`<br>Bakır Kap Kalaylama e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Kaplamacı müşterinin malını fason kaplar: hizmet bedeli için e-Fatura, kaplanmış malın müşteriye geri sevki için e-İrsaliye düzenlenir. Geleneksel kalaycı bireysel müşterilere kap kalaylamayı e-Arşiv ile belgeler. |
| H.12 | Karoser İmalatı, Kaportacılık | Filo Aracı Kaporta Onarımı (Tevkifat 603) — *e-Fatura* `TICARIFATURA · TEVKIFAT 603`<br>Bireysel Kaporta Onarımı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Damper İmalatı e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Kaportacı bireysel araç sahiplerine e-Arşiv; filo şirketleri gibi belirlenmiş alıcılara taşıt onarımında 603 kodlu 7/10 tevkifatlı e-Fatura düzenler. Karoser / damper imalatı mal teslimi olduğundan tevkifatsız e-Fatura ile faturalanır; plaka ve şasi no satırda gösterilir. |
| H.13 | Kuyumculuk | Altın Bilezik Satışı e-Arşiv (Özel Matrah 805) — *e-Arşiv Fatura* `EARSIVFATURA · OZELMATRAH 805`<br>Müşteriden Hurda Altın Alımı — *e-Kıymetli Maden (Alım)* `EKIYMETLIMADENBELGE · ALIM`<br>Kuyumcuya Toptan Gümüş Takı (Özel Matrah 808) — *e-Fatura* `TICARIFATURA · OZELMATRAH 808` | Kuyumcu ziynet eşyası satışında özel matrah uygular: altında 805, gümüşte 808 kodu ile InvoiceTypeCode OZELMATRAH, KDV yalnız satış bedeli ile has / alış değeri arasındaki fark (işçilik + kâr) üzerinden hesaplanır. Müşteriden kullanılmış / hurda altın alımı e-Kıymetli Maden Alım belgesi (CreditNote, EKIYMETLIMADENBELGE, birim gram) ile belgelenir. |
| H.14 | Makine Kurulumu, Onarımı | Pres Bakım-Onarım Faturası (Tevkifat 603) — *e-Fatura* `TICARIFATURA · TEVKIFAT 603`<br>Özel Makine İmalatı e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Azerbaycan'a Makine İhracatı (CIP) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | Makine kurulum-onarım firması belirlenmiş alıcılara makine-teçhizat bakım onarımında 603 kodlu 7/10 tevkifatlı e-Fatura, özel makine imalatı ve tesliminde normal e-Fatura düzenler; yurt dışına makine satışı IHRACAT profiliyle yapılır. |
| H.15 | Makine, Yedek Parça Ticareti | Fabrikaya Rulman ve Kayış e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Yedek Parça Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK`<br>Çiftçiye Traktör Yedek Parça e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Makine yedek parça ticareti fabrikalara e-Fatura ve araçla sevkte e-İrsaliye ile; çiftçi ve bireysel ustalar gibi e-Fatura mükellefi olmayan alıcılara e-Arşiv ile yapılır. Parça / OEM numarası satırda taşınır. |
| H.16 | Motosiklet, Bisiklet İmalatı, Onarımı | Bisiklet Bakım-Onarım e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Belediyeye Bisiklet Filo Bakımı (KAMU) — *e-Fatura* `KAMU · SATIS` | Bisiklet atölyesi bireysel onarım ve satışlarda e-Arşiv; belediyelerin bisiklet paylaşım sistemi bakımı gibi kamu işlerinde KAMU senaryolu e-Fatura (IBAN zorunlu) düzenler. |
| H.17 | Motosiklet, Bisiklet Ticareti | Sıfır Scooter Satışı e-Arşiv (ÖTV) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Kurye Firmasına Toplu Motosiklet e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>İkinci El Motosiklet Satışı (Özel Matrah 812) — *e-Arşiv Fatura* `EARSIVFATURA · OZELMATRAH 812` | Motosiklet bayisi tescil öncesi ilk satışta ÖTV (II) sayılı liste vergisini (TaxTypeCode 9077, KDV matrahına dahil) faturada gösterir; tüketiciye e-Arşiv, kurye firmalarına e-Fatura düzenler. İkinci el motosiklet satışında özel matrah 812 (KDV yalnız alış-satış farkından) uygulanır. |
| H.18 | Oto Bakım Servisçiliği | Periyodik Bakım e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Filo Araç Bakımı (Tevkifat 603) — *e-Fatura* `TICARIFATURA · TEVKIFAT 603` | Oto servis bireysel müşteriye bakım-onarımda e-Arşiv; kamu idareleri, filo şirketleri gibi belirlenmiş alıcılara taşıt bakım onarımında 603 kodlu 7/10 tevkifatlı e-Fatura düzenler. Plaka, km ve iş emri numarası satır / belge alanlarında taşınır. |
| H.19 | Oto Boyacılık | Oto Boya e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Sigorta Hasar Onarımı (Tevkifat 603) — *e-Fatura* `TICARIFATURA · TEVKIFAT 603` | Oto boyacı bireysel araç sahiplerine e-Arşiv düzenler; sigorta şirketi adına yapılan hasar onarımlarında fatura sigorta şirketine (belirlenmiş alıcı) 603 kodlu 7/10 KDV tevkifatlı e-Fatura olarak kesilir, hasar dosya no ve poliçe belge referansıdır. |
| H.20 | Oto Döşemecilik | Deri Koltuk Kaplama e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Otobüs Koltuk Yenileme (Tevkifat 603) — *e-Fatura* `TICARIFATURA · TEVKIFAT 603` | Oto döşemeci bireysel müşterilere e-Arşiv; otobüs firmaları gibi belirlenmiş alıcıların taşıt koltuklarının yenilenmesinde (taşıt tadil-onarımı) 603 kodlu 7/10 tevkifatlı e-Fatura düzenler. |
| H.21 | Oto Elektrikçilik | Akü ve Marş Onarımı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Belediye Otobüsü Elektrik Onarımı (KAMU + 603) — *e-Fatura* `KAMU · TEVKIFAT 603` | Oto elektrikçi bireysel müşterilere e-Arşiv düzenler; belediye otobüsleri gibi kamu araçlarının elektrik onarımında KAMU senaryosu ile 603 (7/10) KDV tevkifatı birlikte uygulanır. |
| H.22 | Oto Lastik Onarımı | Lastik Tamiri ve Balans e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>TIR Lastik Onarımı (Tevkifat 603) — *e-Fatura* `TICARIFATURA · TEVKIFAT 603` | Lastik tamircisi bireysel sürücülere e-Arşiv; lojistik firmaları gibi belirlenmiş alıcıların TIR lastiklerinin onarımında 603 kodlu 7/10 tevkifatlı e-Fatura düzenler. |
| H.23 | Oto Lastik Ticareti | Kış Lastiği Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Filoya Toptan Lastik e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Lastik satıcısı tüketiciye montajlı satışta e-Arşiv, filolara ve servislere toptan satışta e-Fatura düzenler. Lastik ebadı, DOT üretim haftası ve marka satırda taşınır. |
| H.24 | Oto Lpg Montajı | LPG Dönüşüm e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Taksi Kooperatifine Toplu Dönüşüm e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | LPG montajcısı bireysel araç sahiplerine dönüşüm ve bakımda e-Arşiv; taksi kooperatifi gibi işletmelere toplu dönüşümde e-Fatura düzenler. Dönüşüm sonrası TSE / mühendis raporu ve ruhsat tadil bilgisi belge referansıdır. |
| H.25 | Oto Yedek Parça İmalatı | Ana Sanayiye Fren Balatası e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>JIT Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK`<br>Fren Parçası İhracat Faturası (FCA) — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | Oto yedek parça imalatçısı otomotiv ana sanayi ve distribütörlere e-Fatura, tam zamanında (JIT) sevkiyatlarda e-İrsaliye, yurt dışı müşterilere IHRACAT profilli fatura düzenler. OEM parça no ve lot satırda taşınır. |
| H.26 | Oto Yedek Parça Ticareti | Servise Yedek Parça e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Online Yedek Parça Satışı e-Arşiv (İnternet) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Yurt Dışı Parça Siparişi Mikro İhracat (ETGB) — *e-Arşiv (Mikro İhracat / ETGB)* `EARSIVFATURA · ISTISNA` | Oto yedek parça satıcısı servislere e-Fatura, internetten tüketiciye e-Arşiv internet satışı, yurt dışından gelen küçük siparişlerde ETGB'li mikro ihracat düzenler. OEM numarası ve araç uyumluluğu satırda gösterilir. |
| H.27 | Oto Yıkama, Yağlama | Oto Yıkama ve Kaplama e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Kiralama Şirketine Aylık Yıkama e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Oto yıkamacı bireysel müşteriye e-Arşiv; araç kiralama ve filo şirketlerine aylık toplu yıkama hizmetinde e-Fatura düzenler (yıkama, taşıt bakım-onarımı sayılmadığından 603 tevkifatı uygulanmaz). |
| H.28 | Saatçilik | Kol Saati Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Turiste Saat Satışı (Yolcu Beraberi) — *e-Fatura (Yolcu Beraberi)* `YOLCUBERABERFATURA · ISTISNA`<br>Saat Bakım ve Onarım e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Saatçi tüketiciye satış ve servis hizmetinde e-Arşiv (seri no ve garanti satırda), yabancı turistlere yolcu beraberi eşya faturası (Tax Free) düzenler. |
| H.29 | Soba, Banyo Kazanı, Şofben İmalatı, Onarımı, Ticareti | Kuzine Soba Satış ve Montaj e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Köy Okullarına Soba Teslimi (KAMU) — *e-Fatura* `KAMU · SATIS` | Soba ve şofben satıcısı / servisi hanelere satış ve onarımda e-Arşiv; okul ve köy konakları gibi kamu idarelerine soba tesliminde KAMU senaryolu e-Fatura (IBAN zorunlu) düzenler. |
| H.30 | Tenekecilik | Çatı Oluk ve Kaplama e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Müteahhide Çatı İşleri (Tevkifat 601) — *e-Fatura* `TICARIFATURA · TEVKIFAT 601` | Tenekeci / çatı ustası ev sahiplerine çatı onarımında e-Arşiv; müteahhit firmalara alt yüklenici olarak yaptığı çatı işleri yapım işi sayıldığından 601 kodlu 4/10 tevkifatlı e-Fatura düzenler. |
| H.31 | Tornacılık | Fason CNC İşleme e-Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>İşlenmiş Parça Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Tornacı müşterinin malzemesini fason işler veya kendi malzemesiyle parça imal eder: e-Fatura ile faturalar, işlenmiş parçaların sevkini e-İrsaliye ile yapar. Teknik resim / iş emri numarası belge referansıdır. |
| H.32 | Tüp Gaz Bayiliği | Ev Tüpü Teslimi e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Restorana Sanayi Tüpü e-Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Tüpgaz bayisi hanelere e-Arşiv, restoran ve fırın gibi işletmelere e-Fatura düzenler. LPG'nin ÖTV'si (I) sayılı listede dağıtıcı (lisans sahibi) aşamasında alındığından bayi faturasında ayrıca ÖTV satırı yoktur; EPDK lisans no ve tüp seri numarası belgede gösterilir, tüp depozitosu ayrı kayıt edilir. |

### I — Pazar, Seyyar

- Pazarcı ve seyyar satıcıların büyük çoğunluğu basit usul / esnaf muaflığındadır ve satışta fatura düzenleme zorunluluğu yoktur; ancak bilanço / işletme esasına tabi olanlar tüketiciye e-Arşiv düzenler. Şablonlar talep üzerine düzenlenen e-Arşiv ve tedarik tarafındaki belgeleri örnekler.
- Pazarcının hal / toptancıdan aldığı yaş sebze-meyve HKS künyeli e-Fatura ve HKSIRSALIYE ile gelir; tasarımda künye numarası alım kanıtı olarak gösterilir.
- Üreticiden doğrudan alımda e-Müstahsil (bitkisel %2, hayvansal %1 stopaj), belge vermeyen kişilerden alımda e-Gider Pusulası kullanılır.

| Kod | Meslek | Belge türleri (şablonlar) | Gerekçe |
|---|---|---|---|
| I.01 | Pazarda Ayakkabı, Tekstil Ürünleri Ticareti | Pazar Tezgâhı Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Ev Hanımından El Örgüsü Alımı Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · SATIS` | Pazarcıların çoğu basit usul / esnaf muaflığındadır; işletme hesabı esasına geçen pazarcı müşteri talebinde e-Arşiv düzenler. Evinde örgü / dikiş yapan ve GVK 9/6 esnaf muaflığından yararlanan kişilerden alımlar %2 stopajlı e-Gider Pusulası ile belgelenir. |
| I.02 | Pazarda Bitki, Hayvan, Su Ürünleri Ticareti | Pazarda Balık Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Balıkçıdan Av Alımı e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ` | Pazarda balık satan tezgâhçı talep halinde e-Arşiv düzenler (taze balıkta indirimli KDV oranı); balığı doğrudan ruhsatlı balıkçıdan alıyorsa e-Müstahsil Makbuzu (hayvansal ürün %1 stopaj) kullanır. Halden alınan ürünler HKS künyeli belgeyle gelir. |
| I.03 | Pazarda Çeşitli Malların Ticareti | Pazarda Mutfak Eşyası Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Vatandaştan İkinci El Eşya Alımı Gider Pusulası — *e-Gider Pusulası* `GIDERPUSULASI · SATIS` | Pazarda çeşitli mal satan esnaf talep halinde e-Arşiv düzenler; bit pazarı tezgâhları için vatandaştan belge alınamayan ikinci el eşya alımları e-Gider Pusulası ile belgelenir (nihai tüketicinin kendi eşyası için stopaj yoktur). |
| I.04 | Pazarda Sebze, Meyve Ticareti | Pazarda Sebze-Meyve Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Üreticiden Domates Alımı e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ` | Pazarcı manav talep halinde e-Arşiv düzenler (yaş sebze-meyvede indirimli KDV). Üreticiden doğrudan alımda e-Müstahsil (bitkisel ürün %2 stopaj) düzenler; halden / komisyoncudan aldığı ürün HKS künyeli e-Fatura ile gelir ve künye no satışta izlenebilirlik için saklanır. |
| I.05 | Pazarda Yiyecek, İçecek Ticareti | Pazarda Köy Ürünü Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Köylüden Peynir ve Yumurta Alımı e-Müstahsil — *e-Müstahsil Makbuzu* `EARSIVBELGE · MUSTAHSILMAKBUZ` | Pazarda gıda satan tezgâhçı talep halinde e-Arşiv düzenler; ürünlere göre KDV oranı farklılaşır (temel gıda %1, işlenmiş gıda %10). Köydeki üreticiden peynir, bal ve yumurta alımları e-Müstahsil Makbuzu (hayvansal ürün %1 stopaj) ile belgelenir. |
| I.06 | Seyyar Satıcılık | Food Truck Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Şirket Etkinliğine Food Truck İkramı (Tevkifat 604) — *e-Fatura* `TICARIFATURA · TEVKIFAT 604` | Seyyar / food truck işletmesi bireysel müşteriye talep halinde e-Arşiv düzenler; şirket etkinliklerine verdiği yemek ikramı yemek servis hizmeti sayılır ve belirlenmiş alıcılara 604 kodlu 5/10 KDV tevkifatlı e-Fatura ile faturalanır. |

### J — Ulaştırma Hizmetleri

- Yük taşımacılığında belirlenmiş alıcılara KDV tevkifatı 624 (2/10), personel / öğrenci servis taşımacılığında 614 (5/10). Taşıma faturasında plaka, sefer / güzergâh ve CMR / U-ETDS bilgisi AdditionalDocumentReference ile verilir.
- Otobüs, deniz yolu ve fayton gibi yolcu taşımacılığında e-Bilet: InvoicePeriod kalkış zamanı, AdditionalDocumentReference SEFERNO / KOLTUKNO / PERON / PLAKA / GEMI.
- Akaryakıtta ÖTV (I) sayılı liste maktu vergisi rafineri / dağıtıcı aşamasında TaxTypeCode 0071 (PerUnitAmount) ile faturada gösterilir ve KDV matrahına dahildir; istasyon (bayi) faturasında ayrı ÖTV satırı yoktur, satırda plaka ve pompa bilgisi yer alır. Elektrikli araç şarjı ENERJI profili (SARJ / SARJANLIK, alıcıda PLAKA / ARACKIMLIKNO).
- Oto galericiler ikinci el araç satışında özel matrah 812 (KDV yalnız alış-satış farkından); vatandaştan araç alımı noter satış senedi ile belgelenir. Oto kiralamada kiralama dönemi InvoicePeriod ile verilir.
- Uluslararası taşımacılık KDV Kanunu 14/1 istisnası (ISTISNA 311); deniz taşıtı teslim / onarımı 13/a (304). Trafik müşavirliği ve iş takipçiliği serbest meslek kazancı: e-SMM.

| Kod | Meslek | Belge türleri (şablonlar) | Gerekçe |
|---|---|---|---|
| J.01 | Akaryakıt Ticareti | Pompa Satışı e-Arşiv (Plakalı) — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Filo Müşterisine Aylık Yakıt Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>İstasyonda Elektrikli Araç Şarjı (ENERJI · SARJ) — *e-Fatura* `ENERJI · SARJ` | Akaryakıt istasyonu bireysel satışlarda e-Arşiv, filo / kurumsal müşterilere aylık toplu e-Fatura düzenler. ÖTV (I) sayılı liste ürünlerinde rafineri / dağıtıcı aşamasında tahsil edilir; bayi faturasında ayrı ÖTV satırı yer almaz, ÖTV satış fiyatının içindedir. İstasyondaki elektrikli araç şarjı ENERJI profili, SARJ tipi ile faturalanır. |
| J.02 | Durak, Otopark İşletmeciliği | Aylık Otopark Aboneliği e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Şirkete Toplu Otopark Kiralama Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Otoparkta Anlık Araç Şarjı (ENERJI · SARJANLIK) — *e-Arşiv Fatura* `ENERJI · SARJANLIK` | Otopark işletmesi saatlik / aylık abone bireysel müşterilere e-Arşiv, şirketlere e-Fatura düzenler; plaka belgede yer alır. Otoparktaki şarj ünitesinden anlık şarj ENERJI profili SARJANLIK tipiyle (PLAKA + ARACKIMLIKNO) faturalanır. |
| J.03 | Faytonculuk | Fayton Turu e-Bileti — *e-Bilet* `e-Bilet · SATIS`<br>Otele Grup Fayton Turu Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Fayton ile turistik gezi yolcu taşıma hizmetidir; bireysel turlarda e-Bilet (sefer / güzergâh bilgili), otel ve acentelere toplu satışta e-Fatura düzenlenir. |
| J.04 | İş Makinesi İşletmeciliği | Şantiye Hafriyat Hakedişi (Tevkifat 601) — *e-Fatura* `TICARIFATURA · TEVKIFAT 601`<br>Operatörsüz Mini Ekskavatör Kiralama — *e-Fatura* `TICARIFATURA · SATIS`<br>Çiftçiye Biçerdöver Hasat Hizmeti e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | İş makinesi işletmecisi yapım işine alt yüklenici olarak katıldığında hafriyat bedeli belirlenmiş alıcılara 601 kodlu 4/10 KDV tevkifatlı e-Fatura ile faturalanır; operatörsüz makine kiralaması normal e-Fatura, çiftçiye verilen hasat hizmeti e-Arşiv ile belgelenir. |
| J.05 | Kara Yolu İle Yük Taşımacılığı | Yurt İçi Komple Tır Taşıma (Tevkifat 624) — *e-Fatura* `TICARIFATURA · TEVKIFAT 624`<br>Uluslararası Taşıma Faturası (İstisna 311) — *e-Fatura* `TICARIFATURA · ISTISNA 311` | Yük taşıma hizmeti belirlenmiş alıcılara 624 kodlu 2/10 KDV tevkifatlı e-Fatura ile faturalanır; U-ETDS bildirim numarası ve plaka belgeye eklenir. Yurt dışına yapılan taşımalar KDV 14/1 (311) uluslararası taşımacılık istisnasıyla faturalanır. Taşınan malın irsaliyesini yük sahibi düzenler; taşıyıcı bu irsaliyede CarrierParty olarak yer alır. |
| J.06 | Minibüsçülük | Belediyeye Kartlı Biniş Hakedişi (KAMU) — *e-Fatura* `KAMU · SATIS`<br>Sabah-Akşam Personel Servisi (Tevkifat 614) — *e-Fatura* `TICARIFATURA · TEVKIFAT 614` | Hat minibüsü işletmecisinin elektronik kartla biniş gelirleri belediye / toplu taşıma idaresi tarafından hakediş olarak ödenir ve KAMU senaryolu e-Fatura ile faturalanır; boş saatlerde yapılan personel servis taşımacılığı belirlenmiş alıcılara 614 kodlu 5/10 tevkifatlı e-Fatura ile faturalanır. |
| J.07 | Nakliyat Komisyonculuğu | Yük Sahibine Taşıma Organizasyonu (Tevkifat 624) — *e-Fatura* `TICARIFATURA · TEVKIFAT 624`<br>Kamyon Sahibine Komisyon e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Nakliyat komisyoncusu taşımayı kendi adına üstleniyorsa taşıma bedelinin tamamını yük sahibine 624 tevkifatlı e-Fatura ile faturalar; aracılık komisyonunu kamyon sahibine (e-Fatura mükellefi değilse) e-Arşiv ile faturalar. C2 / K1 yetki belgesi no belgeye eklenir. |
| J.08 | Oto Galericilik, Oto Kiralama | İkinci El Otomobil Satışı (Özel Matrah 812) — *e-Arşiv Fatura* `EARSIVFATURA · OZELMATRAH 812`<br>Kurumsal Uzun Dönem Kiralama Aylık Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Günlük Araç Kiralama e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Galeri ikinci el otomobil satışında KDV'yi alış–satış farkı üzerinden 812 kodlu özel matrah e-Arşiv / e-Fatura ile hesaplar (noter satış bilgisi belgede). Kiralama tarafında günlük kiralama e-Arşiv, kurumsal uzun dönem kiralama aylık e-Fatura ile (InvoicePeriod + plaka) faturalanır. |
| J.09 | Oto Kurtarıcılık | Bireysel Çekici Hizmeti e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Asistans Firmasına Aylık Çekici Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Oto kurtarıcı bireysel müşteriye e-Arşiv, sigorta / asistans firmalarına dosya numaralı aylık toplu e-Fatura düzenler; hasar dosya no ve plaka belgeye eklenir. |
| J.10 | Otobüsçülük | Şehirler Arası Otobüs e-Bileti — *e-Bilet* `e-Bilet · SATIS`<br>Kurumsal Charter Sefer Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Yurt Dışı Tur Seferi (İstisna 311) — *e-Fatura* `TICARIFATURA · ISTISNA 311` | Şehirler arası otobüs firması yolcu biletini e-Bilet olarak düzenler (sefer no, koltuk, peron, plaka ek alanları). Kurumsal charter seferleri e-Fatura, yurt dışı seferleri KDV 14/1 (311) istisnalı e-Fatura ile belgelenir; U-ETDS bildirimi yapılır. |
| J.11 | Özel Ambulans İşletmeciliği | Şehirler Arası Hasta Nakli e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Özel Hastaneye Sözleşmeli Ambulans Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Özel ambulans firması hasta yakınlarına e-Arşiv, özel hastane ve etkinlik organizatörlerine e-Fatura düzenler; nakil tarihi, plaka ve güzergâh belgede yer alır. |
| J.12 | Servis Aracı İşletmeciliği | Fabrika Personel Servisi (Tevkifat 614) — *e-Fatura* `TICARIFATURA · TEVKIFAT 614`<br>Devlet Hastanesi Personel Servisi (KAMU · 614) — *e-Fatura* `KAMU · TEVKIFAT 614`<br>Öğrenci Servisi Aylık e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Personel servis taşımacılığı belirlenmiş alıcılara 614 kodlu 5/10 KDV tevkifatlı e-Fatura ile, kamu kurumlarına KAMU senaryolu tevkifatlı e-Fatura ile faturalanır; öğrenci servisi velilere aylık e-Arşiv ile belgelenir. |
| J.13 | Su Yolu Taşımacılığı | Deniz Otobüsü e-Bileti — *e-Bilet* `e-Bilet · SATIS`<br>Acenteye Kos Adası Seferleri (İstisna 311) — *e-Fatura* `TICARIFATURA · ISTISNA 311`<br>Günlük Tekne Kiralama Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Deniz yolcu taşımacılığında yolcu biletleri e-Bilet (sefer, iskele, gemi bilgili) olarak düzenlenir. Yunan adalarına yapılan uluslararası seferler KDV 14/1 (311) istisnalı e-Fatura ile tur acentelerine faturalanır; günlük tekne kiralama e-Fatura ile belgelenir. |
| J.14 | Taksicilik | Havalimanı Transferi e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Kurumsal Hesap Aylık Taksi Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Taksiciler çoğunlukla basit usulde ya da işletme esasındadır; işletme esasındaki taksi yolcunun talebinde e-Arşiv düzenler (plaka, güzergâh). Kurumsal hesaplı müşterilere ay sonu toplu e-Fatura / e-Arşiv düzenlenir. |
| J.15 | Trafik Müşavirliği, İş Takipçiliği | Bireysel Araç Tescil İşlemi e-SMM — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU`<br>Filo Şirketine Toplu Tescil e-SMM (Stopajlı) — *e-SMM* `EARSIVBELGE · SERBESTMESLEKMAKBUZU` | Trafik müşavirliği serbest meslek faaliyeti olduğundan e-Serbest Meslek Makbuzu (e-SMM) düzenlenir; şirket müşterilerde %20 GV stopajı uygulanır. Müşteri adına ödenen harç ve noter ücretleri hizmet bedelinin parçası değildir, avans olarak ayrıca belgelenir. |
| J.16 | Yük Taşımacılığını Destekleyici Faaliyetler | Soğuk Hava Deposu Aylık Kira ve Elleçleme — *e-Fatura* `TICARIFATURA · SATIS`<br>Gemiye Liman Elleçleme Hizmeti (İstisna 305) — *e-Fatura* `TICARIFATURA · ISTISNA 305` | Depolama ve antrepo hizmetleri aylık e-Fatura ile (palet, depo ve dönem bilgisiyle) faturalanır. Limanda gemilere verilen yükleme-boşaltma (elleçleme) hizmetleri KDV 13/b (305) kapsamında istisna e-Fatura ile belgelenir. Depodan çıkan malın irsaliyesini mal sahibi düzenler. |

### K — Yapı Sanatları

- İnşaat taahhüt işlerinde hakediş faturaları KDV tevkifatı 601 (4/10) ile; hakediş no, sözleşme ve proje referansı AdditionalDocumentReference (HAKEDIS / SOZLESME / PROJE), hakediş dönemi InvoicePeriod.
- İnşaat malzemesi ve hırdavat satışlarında şantiyeye teslim e-İrsaliye ile; demir-çelik ürünlerde IDIS ve 627 tevkifat.
- Peyzaj ve bahçe bakım hizmetinde 613 (9/10), boya / kimyasal ürünlerde 626 diğer teslimler tevkifatı (belirlenmiş alıcılara) uygulanabilir.
- Emlakçılar aracılık komisyonu için alıcı ve satıcıya ayrı e-Arşiv / e-Fatura düzenler; kira aracılığında dönem InvoicePeriod ile. Taşınmaz satışı özel matrah 812 kapsamındadır.
- Mermer ve taş ocaklarında blok / plaka ihracatı IHRACAT profili (GTİP 2515 / 6802), sondaj işlerinde ise kurum alıcılara 601 tevkifat uygulanır.

| Kod | Meslek | Belge türleri (şablonlar) | Gerekçe |
|---|---|---|---|
| K.01 | Boya, Kimyasal Ürünlerin İmalatı | Bayiye Boya Satış Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Karayollarına Yol Çizgi Boyası (KAMU · 626) — *e-Fatura* `KAMU · TEVKIFAT 626`<br>Irak'a Boya İhracat Faturası — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | Boya ve kimya üreticisi bayilere e-Fatura, sevkiyatlarda e-İrsaliye, yurt dışına IHRACAT profilli e-Fatura düzenler (GTİP 3208/3209). Kamu idareleri gibi belirlenmiş alıcılara yapılan mal teslimlerinde 626 kodlu "diğer teslimler" 2/10 KDV tevkifatı uygulanır. |
| K.02 | Boya, Kimyasal Ürünlerin Ticareti | Perakende Boya Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Boya Ustasına Vadeli Satış — *e-Fatura* `TICARIFATURA · SATIS` | Boya bayisi bireysel müşteriye e-Arşiv, boya ustası ve müteahhitlere (e-Fatura mükellefiyse) vadeli e-Fatura düzenler; renk kodu ve parti no satırda yer alır. |
| K.03 | Camcılık | Müteahhide Isıcam Satışı — *e-Fatura* `TICARIFATURA · SATIS`<br>Eve Duşakabin ve Ayna Montajı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Camcı müteahhit ve sanayi müşterilerine m² bazlı e-Fatura, ev müşterilerine montaj dahil e-Arşiv düzenler; ölçü ve cam tipi satır ek alanında yer alır, sevk e-İrsaliye ile yapılır. |
| K.04 | Çevre Düzenleme, Peyzaj Faaliyetleri | Otel Bahçe Bakımı Aylık Faturası (Tevkifat 613) — *e-Fatura* `TICARIFATURA · TEVKIFAT 613`<br>Belediye Park Bakım Hakedişi (KAMU · 613) — *e-Fatura* `KAMU · TEVKIFAT 613`<br>Villa Bahçe Düzenleme e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Çevre ve bahçe bakım hizmetleri belirlenmiş alıcılara 613 kodlu 9/10 KDV tevkifatlı e-Fatura ile, belediyelere KAMU senaryolu tevkifatlı e-Fatura ile faturalanır; villa ve ev bahçeleri için e-Arşiv düzenlenir. |
| K.05 | Emlakçılık | Konut Satışı Aracılık Komisyonu e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Kiralama Aracılık Komisyonu e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Şirkete Ofis Kiralama Aracılık Faturası — *e-Fatura* `TICARIFATURA · SATIS` | Emlakçı (yetki belgeli) aracılık komisyonunu alıcı ve satıcıya ayrı ayrı faturalar: gerçek kişilere e-Arşiv, şirketlere e-Fatura. Taşınmaz bilgisi (ada / parsel, tapu) ve yetki belge no belgeye eklenir; kira aracılığında dönem belirtilir. |
| K.06 | Hırdavatçılık | Nalbur Perakende Satışı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>İnşaat Firmasına Toptan Hırdavat — *e-Fatura* `TICARIFATURA · SATIS`<br>Şantiyeye Hırdavat Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Hırdavatçı perakende satışta e-Arşiv, inşaat ve sanayi firmalarına vadeli e-Fatura düzenler; şantiyeye teslimlerde e-İrsaliye ile sevk eder. |
| K.07 | İnşaat Malzemeleri İmalatı | Bayiye Tuğla ve Kiremit Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Fabrikadan Tır Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK`<br>Gürcistan'a Kiremit İhracatı — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | İnşaat malzemesi üreticisi bayilere e-Fatura, fabrikadan tır sevkiyatlarında e-İrsaliye (plaka, dorse, kg) düzenler; komşu ülkelere ihracat IHRACAT profilli e-Fatura ile yapılır. |
| K.08 | İnşaat Malzemeleri Ticareti | Müteahhide Çimento ve Agrega Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Şantiyeye Malzeme Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK`<br>Bireysel Tadilat Malzemesi e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | İnşaat malzemesi bayisi müteahhitlere e-Fatura, tadilat yapan bireylere e-Arşiv düzenler; şantiyeye teslimler e-İrsaliye ile (plaka, şoför) yapılır. İnşaat demiri satıyorsa IDIS profili ve 627 tevkifatı uygulanır. |
| K.09 | İnşaatçılık | Konut Projesi Hakediş Faturası (Tevkifat 601) — *e-Fatura* `TICARIFATURA · TEVKIFAT 601`<br>Okul Binası Kamu Hakedişi (KAMU · 601) — *e-Fatura* `KAMU · TEVKIFAT 601`<br>Bireysel Daire Tadilatı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | Yapım işlerinde hakediş faturaları belirlenmiş alıcılara (A.Ş., kamu) 601 kodlu 4/10 KDV tevkifatı ile; kamu idarelerine KAMU senaryosu + IBAN ile düzenlenir (hakediş no, sözleşme, ihale kayıt no). Bireysel tadilat işleri e-Arşiv ile faturalanır. |
| K.10 | Mermer, Taş, Kum Ocakçılığı | Blok Mermer ve Plaka İhracatı — *e-Fatura (İhracat)* `IHRACAT · ISTISNA`<br>Müteahhide Mermer Plaka Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Ocaktan Kum-Çakıl Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK` | Mermer ocağı blok ve plaka ihracatını IHRACAT profilli e-Fatura ile (GTİP 2515 blok / 6802 işlenmiş) yapar; yurt içi satışlar e-Fatura, ocaktan kamyonla sevkiyatlar e-İrsaliye (tonaj, plaka) ile belgelenir. Maden ruhsat no belgeye eklenir. |
| K.11 | Prefabrik Yapıların İmalatı, Kurulumu, Ticareti | Şantiye Konteyneri Satış Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>Prefabrik Okul Kurulumu (Tevkifat 601) — *e-Fatura* `TICARIFATURA · TEVKIFAT 601`<br>Irak Şantiye Kampı İhracatı — *e-Fatura (İhracat)* `IHRACAT · ISTISNA` | Prefabrik üreticisi konteyner / modül satışını mal teslimi olarak e-Fatura ile, yerinde kurulumlu yapı işlerini yapım işi olarak 601 kodlu 4/10 tevkifatlı e-Fatura ile faturalar; yurt dışı şantiye kampları IHRACAT profiliyle ihraç edilir. |
| K.12 | Pvc Ürün İmalatı | Bayiye PVC Profil Faturası — *e-Fatura* `TICARIFATURA · SATIS`<br>PVC Profil Sevk İrsaliyesi — *e-İrsaliye* `TEMELIRSALIYE · SEVK`<br>Eve Ölçülü PVC Pencere e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS` | PVC ürün imalatçısı bayilere ve müteahhitlere e-Fatura, fabrikadan sevkiyatta e-İrsaliye düzenler; ölçüye özel pencere satışlarında ev müşterisine montajlı e-Arşiv kesilir. |
| K.13 | Pvc Ürün Ticareti | Pencere ve Sineklik Montajı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Site Yönetimine Toplu Kapı Değişimi — *e-Fatura* `TICARIFATURA · SATIS` | PVC ürün satıcısı ev müşterilerine montaj dahil e-Arşiv, site yönetimi / müteahhitlere e-Fatura düzenler; ölçü ve renk bilgisi satırda verilir. |
| K.14 | Sıhhi Tesisatçılık | Kombi ve Doğalgaz Tesisatı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Müteahhide Bina Tesisat İşi (Tevkifat 601) — *e-Fatura* `TICARIFATURA · TEVKIFAT 601` | Sıhhi tesisatçı ev müşterilerine e-Arşiv düzenler; müteahhide alt yüklenici olarak yaptığı bina tesisat işleri yapım işi sayıldığından belirlenmiş alıcılara 601 kodlu 4/10 tevkifatlı e-Fatura kesilir. Doğalgaz proje / onay numarası belgeye eklenir. |
| K.15 | Sondajcılık | Çiftçiye Su Kuyusu Açımı e-Arşiv — *e-Arşiv Fatura* `EARSIVFATURA · SATIS`<br>Belediye İçme Suyu Kuyusu (KAMU · 601) — *e-Fatura* `KAMU · TEVKIFAT 601`<br>Zemin Etüt Sondajı (Tevkifat 602) — *e-Fatura* `TICARIFATURA · TEVKIFAT 602` | Sondaj firması çiftçiye su kuyusu açımını e-Arşiv ile, DSİ / belediye gibi kamu idarelerine yapım işi niteliğindeki sondajı KAMU senaryolu 601 tevkifatlı e-Fatura ile faturalar. Zemin etüdü amaçlı sondaj "etüt, plan-proje" hizmeti olduğundan 602 (9/10) tevkifat uygulanır. |

## 3. Meslek bazında XML ayrıntıları

### A.01 İkinci El Eşya Ticareti

NACE: 477904 Kullanılmış Mobilya, Elektrikli Ve Elektronik Ev Eşyası Perakende Ticareti; 477990 Diğer İkinci El Eşya Perakende Ticareti (İkinci El Motorlu Kara Taşıtları Ve Motosiklet Parçaları Hariç); 479200 Uzmanlaşmış Perakende Ticaret İçin Aracılık Hizmeti Faaliyetleri; 772299 Başka Yerde Sınıflandırılmamış Diğer Kişisel Ve Ev Eşyalarının Kiralanması Ve Operasyonel Leasingi (Müzik Aleti, Giyim Eşyası, Mücevher Vb. İle Video Kasetler, Büro Mobilyaları, Eğlence Ve Spor Ekipmanları Hariç)

**Belge seçimi:** İkinci el eşyacı vatandaştan belge alamadan eşya satın alır (e-Gider Pusulası) ve tüketiciye perakende satar (e-Arşiv). Kullanılmış eşya satışında genel KDV oranı uygulanır; özel matrah yalnız ikinci el taşıt / taşınmaz içindir.

- **Perakende Satış e-Arşiv Faturası** (`meslek-a01-perakende-satis-e-arsiv-faturasi`, e-Arşiv Fatura, yerleşim *fis*): Mağazadan tüketiciye ikinci el mobilya ve beyaz eşya satışı; teslimat ve kurulum hizmeti ayrı satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Vatandaştan Eşya Alımı Gider Pusulası** (`meslek-a01-vatandastan-esya-alimi-gider-pusulasi`, e-Gider Pusulası, yerleşim *defter*): Ev boşaltma / taşınma sırasında vatandaştan toplu eşya alımı; satıcı belge veremediği için gider pusulası düzenlenir.
  - CreditNote · TR1.2.1 · ProfileID GIDERPUSULASI · CreditNoteTypeCode SATIS. Belge vermeyen (vergiden muaf / ÇKS'siz) satıcı AccountingCustomerParty (TCKN + Person, SMS kodu); düzenleyen SMS_PROVIDER. Stopaj yok.

### A.02 Kerestecilik

NACE: 024001 Ormanda Ağaçların Kesilmesi, Dallarından Temizlenmesi, Soyulması Vb. Destekleyici Faaliyetler; 024002 Ormanda Kesilmiş Ve Temizlenmiş Ağaçların Taşınması, İstiflenmesi Ve Yüklenmesi Faaliyetleri; 161101 Kereste İmalatı (Ağaçların Biçilmesi, Planyalanması, Rendelenmesi Ve Şekillendirilmesi Faaliyetleri); 161200 Ahşabın İşlenmesi Ve Bitirilmesi (Bir Ücret Veya Sözleşmeye Dayalı Olarak Gerçekleştirilen); 461302 Kereste Ve Kereste Ürünlerinin Toptan Satışı İle İlgili Aracıların Faaliyetleri; 468302 Ağacın İlk İşlenmesinden Elde Edilen Ürünlerin Toptan Ticareti; 468312 İşlenmemiş Ağaç (Tomruk-Ham Haldeki) Toptan Ticareti (Orman Ağaçları, Endüstriyel Odunlar Vb.); 475210 Ağacın İlk İşlenmesinden Elde Edilen Ürünlerin Perakende Ticareti (Kereste, Ağaç Talaşı Ve Yongası, Kontrplak, Yonga Ve Lifli Levhalar (Mdf, Sunta Vb.), Parke, Ahşap Varil, Fıçı Ve Diğer Muhafazalar, Vb.)

**Belge seçimi:** Kerestecinin müşterisi çoğunlukla mobilya atölyesi, müteahhit ve palet imalatçısıdır (e-Fatura). Ağaç ve orman ürünleri teslimi belirlenmiş alıcılara 623 kodlu 5/10 KDV tevkifatına tabidir; kamyonla sevkiyat e-İrsaliye gerektirir.

- **Kereste Satış Faturası (Tevkifat 623)** (`meslek-a02-kereste-satis-faturasi-tevkifat-623`, e-Fatura, yerleşim *endustri*): Mobilya fabrikasına çam ve kayın kereste teslimi; belirlenmiş alıcıya 5/10 KDV tevkifatı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 623, Percent 50 (5/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Kereste Sevk İrsaliyesi** (`meslek-a02-kereste-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Kereste deposundan inşaat şantiyesine kamyonla sevk; ağırlık, plaka ve şoför bilgisi.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### A.03 Marangozluk

NACE: 161102 Ahşap Demir Yolu Veya Tramvay Traversi İmalatı; 161103 Ağaç Yünü, Ağaç Unu, Ağaç Talaşı, Ağaç Yonga İmalatı; 161104 Ahşap Döşemelerin Ve Yer Döşemelerinin İmalatı (Birleştirilebilir Parkeler Hariç); 162101 Ahşap, Bambu Ve Diğer Odunsu Malzemelerden Kaplamalık Plaka, Levha, Vb. İmalatı (Yaprak Halde) (Preslenmemiş); 162102 Sıkıştırılmış Lif, Tahta Ve Tabakalardan Kontrplak, Mdf, Sunta, Osb, Clt Vb. Levha İmalatı; 162201 Birleştirilmiş Parke Yer Döşemelerinin İmalatı; 162399 Başka Yerde Sınıflandırılmamış Diğer İnşaat Doğrama Ve Marangozluk Ürünleri İmalatı; 162402 Palet, Kutu Palet Ve Diğer Ahşap Yükleme Tablaları İmalatı … (+21 kod)

**Belge seçimi:** Marangoz ölçüye özel imalatı tüketiciye e-Arşiv ile, müteahhide / firmaya toplu kapı-dolap imalatını e-Fatura ile faturalar. Toplu teslimler şantiyeye irsaliyeli gider; montaj işçiliği aynı faturada hizmet satırıdır.

- **Ölçüye Özel Mutfak Dolabı e-Arşiv** (`meslek-a03-olcuye-ozel-mutfak-dolabi-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Ev sahibine ölçüye özel mutfak dolabı imalatı ve montajı; ölçü ve malzeme bilgisi satır etiketlerinde.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Toplu Kapı İmalatı e-Faturası** (`meslek-a03-toplu-kapi-imalati-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Konut projesi için müteahhit firmaya oda kapısı ve vestiyer imalatı; teslim irsaliyeleri faturada referanslı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### A.04 Mobilya Boyacılığı

NACE: 310006 Mobilyaların Boyanması, Verniklenmesi, Cilalanması Vb. Tamamlayıcı İşlerin Yapılması

**Belge seçimi:** Mobilya boyacısı ağırlıklı olarak mobilya üreticilerine fason boya / cila yapar (e-Fatura), ev sahiplerine mobilya yenileme hizmeti verir (e-Arşiv). Hizmet niteliğinde olduğundan irsaliye yerine iş emri referansı yeterlidir.

- **Fason Lake Boya Hizmet Faturası** (`meslek-a04-fason-lake-boya-hizmet-faturasi`, e-Fatura, yerleşim *teknik*): Mobilya üreticisine ait kapak ve gövdelerin fason lake boyanması; iş emri ve parti numarası referanslı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Mobilya Yenileme e-Arşiv** (`meslek-a04-mobilya-yenileme-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Ev sahibinin antika büfe ve sandalyelerinin cila ile yenilenmesi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### A.05 Mobilya Döşemeciliği

NACE: 310005 Yatak Ve Yatak Desteklerinin İmalatı (Kauçuk Şişme Yatak Ve Su Yatağı Hariç); 310008 Sandalyelerin, Koltukların Vb. Döşenmesi Gibi Tamamlayıcı İşlerin Yapılması (Büro Ve Ev Mobilyalarının Yeniden Kaplanması Hariç); 952401 Mobilyaların Ve Ev Döşemelerinin Onarım Ve Bakımı (Halı Ve Kilim Onarımı Hariç)

**Belge seçimi:** Döşemeci tüketiciye koltuk döşeme hizmeti (e-Arşiv), kafe-otel gibi işletmelere toplu döşeme (e-Fatura) düzenler. İşletmeye yapılan döşeme işi bakım-onarım niteliğinde değildir; normal KDV ile faturalanır.

- **Koltuk Döşeme e-Arşiv** (`meslek-a05-koltuk-doseme-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Ev koltuk takımının kumaş ve sünger değişimi; kumaş kartelası satır etiketinde.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Kafe Oturma Grubu Döşeme e-Faturası** (`meslek-a05-kafe-oturma-grubu-doseme-e-faturasi`, e-Fatura, yerleşim *modern*): Kafe zincirine ait oturma gruplarının deri döşemesi; şube referanslı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### A.06 Mobilya İmalatı

NACE: 310001 Yatak Odası, Yemek Odası, Mutfak Mobilyası, Banyo Dolabı, Genç Ve Çocuk Odası Takımı, Gardırop, Vestiyer, Vb. İmalatı (Gömme Dolap, Masa, Zigon, Vb. Dahil); 310002 Büro, Okul, İbadethane, Otel, Lokanta, Sinema, Tiyatro Vb. Kapalı Alanlar İçin Mobilya İmalatı (İskelet İmalatı Dahil; Taş, Beton, Seramikten Olanlar Hariç); 310003 Sandalye, Koltuk, Kanepe, Oturma Takımı, Çekyat, Divan, Markiz, Vb. İmalatı (İskelet İmalatı Dahil; Plastik Olanlar İle Bürolarda Ve Park Ve Bahçelerde Kullanılanlar Hariç); 310004 Mağazalar İçin Tezgah, Banko, Vitrin, Raf, Çekmeceli Dolap Vb. Özel Mobilya İmalatı (Laboratuvarlar Ve Teknik Bürolar İçin Olanlar Hariç); 310007 Park Ve Bahçelerde Kullanılan Bank, Masa, Tabure, Sandalye, Koltuk, Vb. Mobilyaların İmalatı (Plastik Olanlar Hariç); 310090 Diğer Mobilyaların İmalatı; 433201 Hazır Mutfaklar, Mutfak Tezgahları, Gömme Dolaplar, İç Merdivenler İle İnce Tahta, Lambri Ve Benzerlerinin Montajı İşleri

**Belge seçimi:** Mobilya imalatçısı mağazalara ve bayilere toptan satış (e-Fatura + e-İrsaliye) yapar; yurt dışı bayilere ihracat IHRACAT profiliyle gümrük muhataplı faturalanır. Mobilya GTİP 9403 / 9401 başlıklarındadır.

- **Bayiye Toptan Mobilya Faturası** (`meslek-a06-bayiye-toptan-mobilya-faturasi`, e-Fatura, yerleşim *kurumsal*): Mobilya mağazasına yatak odası ve yemek odası takımları toptan satışı; bayi iskontosu satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Mobilya İhracat Faturası (FOB)** (`meslek-a06-mobilya-ihracat-faturasi-fob`, e-Fatura (İhracat), yerleşim *serit*): Almanya’daki bayiye konteynerle masif mobilya ihracatı; GTİP, kap ve INCOTERMS satırda.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (FOB), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz EUR + PricingExchangeRate.

### A.07 Mobilya Ticareti

NACE: 461501 Mobilyaların Toptan Satışı İle İlgili Aracıların Faaliyetleri; 464701 Mobilya Ve Mobilya Aksesuarları Toptan Ticareti (Yatak Dahil); 464704 Büro Mobilyalarının Toptan Ticareti; 475503 Ev Mobilyalarının Ve Aksesuarlarının Perakende Ticareti (Baza, Somya, Karyola Dahil; Hasır Ve Sepetçi Söğüdü Gibi Malzemelerden Olanlar Hariç); 475506 Büro Mobilyaları Ve Aksesuarlarının Perakende Ticareti; 475507 Bahçe Mobilyalarının Perakende Ticareti; 475508 Yatak Perakende Ticareti; 773302 Büro Mobilyalarının Kiralanması Ve Leasingi (Büro Sandalyesi Ve Masasının Kiralanması Dahil) (Finansal Leasing Hariç)

**Belge seçimi:** Mobilya mağazası tüketiciye e-Arşiv (online satışta internet satışı alanlarıyla) düzenler; teslimat kendi aracıyla yapıldığında mal faturadan önce sevk ediliyorsa e-İrsaliye de düzenlenir.

- **Online Mobilya Satışı e-Arşiv (İnternet)** (`meslek-a07-online-mobilya-satisi-e-arsiv-internet`, e-Arşiv Fatura, yerleşim *modern*): Web sitesinden kartla satın alınan yatak ve baza; ödeme aracısı ve kargo / nakliye bilgisi GİB internet satışı alanlarında.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.

- **Müşteriye Teslim Sevk İrsaliyesi** (`meslek-a07-musteriye-teslim-sevk-irsaliyesi`, e-İrsaliye, yerleşim *fis*): Mağaza deposundan müşteri adresine kendi kamyonetiyle koltuk takımı teslimi.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### A.08 Yakacak İmalatı, Ticareti

NACE: 022001 Endüstriyel Ve Yakacak Odun Üretimi (Geleneksel Yöntemlerle Odun Kömürü Üretimi Dahil); 162600 Bitkisel Biyokütleden Katı Yakıt İmalatı; 192012 Turba, Linyit Ve Taş Kömürü Briketleri İmalatı (Kömür Tozundan Basınçla Elde Edilen Yakıt); 468103 Katı Yakıtlar Ve Bunlarla İlgili Ürünlerin Toptan Ticareti; 477802 Kömür Ve Yakacak Odun Perakende Ticareti; 477831 Mağaza, Tezgah, Pazar Yeri Dışında Müşterinin İstediği Yere Ulaştırılarak Yapılan Doğrudan Yakıt Satışı (Kalorifer Yakıtı, Yakacak Odun, Vb.)

**Belge seçimi:** Yakacak satıcısı haneye kömür / odun satışında e-Arşiv düzenler; köylüden odun alımında satıcı belge veremediğinden e-Gider Pusulası kullanılır. Odun (orman ürünü) belirlenmiş alıcıya satılırsa 623 tevkifatı söz konusudur.

- **Kömür ve Odun Satışı e-Arşiv** (`meslek-a08-komur-ve-odun-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *endustri*): Haneye ithal kömür ve meşe odun teslimi; çuval ve ton bazlı satış.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Köylüden Odun Alımı Gider Pusulası** (`meslek-a08-koyluden-odun-alimi-gider-pusulasi`, e-Gider Pusulası, yerleşim *defter*): Kendi arazisinden odun kesen köylüden yakacak odun alımı; GVK 94/13-a gereği %2 stopaj.
  - CreditNote · TR1.2.1 · ProfileID GIDERPUSULASI · CreditNoteTypeCode SATIS. Belge vermeyen (vergiden muaf / ÇKS'siz) satıcı AccountingCustomerParty (TCKN + Person, SMS kodu); düzenleyen SMS_PROVIDER. GV stopajı 0003 %2 (GVK 94/13) TaxTotal'da, ödenecekten düşülür.

### B.01 Ajans, Organizasyon Faaliyetleri

NACE: 749901 Sanatçı, Sporcu, Şovmen, Manken Ve Diğerleri İçin Ajansların Ve Menajerlerin Faaliyetleri; 773999 Başka Yerde Sınıflandırılmamış Diğer Makine Ve Ekipmanların Sürücüsüz Kiralanması Ve Leasingi İle Maddi Malların Kiralanması Ve Operasyonel Leasingi; 781004 Oyuncu Seçme Ajansları Ve Bürolarının Faaliyetleri; 799099 Başka Yerde Sınıflandırılmamış Diğer Rezervasyon Hizmetleri Ve İlgili Faaliyetler (Turizm Tanıtım Faaliyetleri, Vb.); 823002 Kongre Ve Ticari Gösteri Organizasyonu; 824001 Spor, Müzik, Tiyatro Ve Diğer Eğlence Etkinlikleri İçin Yer Ayırma (Rezervasyon) Ve Bilet Satılması Faaliyeti; 902001 Bağımsız Aktör, Aktrist Ve Dublörlerin Faaliyetleri; 903990 Sanat Ve Gösteri Sanatlarına Yönelik Diğer Destek Faaliyetleri (Sanat Ve Gösteri Sanatlarına Yönelik Yönetmenlerin Ve Yapımcıların Faaliyetleri Hariç) … (+2 kod)

**Belge seçimi:** Organizasyon ajansı kurumsal müşterilere lansman / toplantı organizasyonu satar; belirlenmiş alıcılara organizasyon hizmetinde 605 kodlu 5/10 KDV tevkifatı uygulanır. Bireysel müşterilere (doğum günü, nişan) e-Arşiv düzenlenir.

- **Kurumsal Lansman Organizasyonu (Tevkifat 605)** (`meslek-b01-kurumsal-lansman-organizasyonu-tevkifat-605`, e-Fatura, yerleşim *modern*): Firmanın ürün lansmanı için sahne, ses-ışık, ikram ve hostes hizmetlerini içeren organizasyon; etkinlik tarihi dönem alanında.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 605, Percent 50 (5/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Doğum Günü Organizasyonu e-Arşiv** (`meslek-b01-dogum-gunu-organizasyonu-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Bireysel müşteriye çocuk doğum günü organizasyonu; süsleme, animatör ve pasta paketi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### B.02 Düğün Salonu İşletmeciliği

NACE: 932902 Düğün, Balo Ve Kokteyl Salonlarının İşletilmesi; 969914 Nikah Salonlarının Hizmetleri; 969915 Söz, İsteme Ve Davet Evleri Hizmetleri

**Belge seçimi:** Düğün salonu bireysel düğün paketlerini e-Arşiv ile faturalar; kurumların gala / yılbaşı davetlerinde salon + yemek + organizasyon hizmeti verildiğinden belirlenmiş alıcılarda 605 tevkifatı uygulanır.

- **Düğün Paketi e-Arşiv** (`meslek-b02-dugun-paketi-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Düğün sahibine salon kirası, yemekli menü ve süsleme paketi; düğün tarihi ve davetli sayısı belge üzerinde.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Kurumsal Gala Daveti Faturası (Tevkifat 605)** (`meslek-b02-kurumsal-gala-daveti-faturasi-tevkifat-605`, e-Fatura, yerleşim *kurumsal*): Sanayi şirketinin bayi gala yemeği için salon, menü ve sahne organizasyonu.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 605, Percent 50 (5/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### B.03 Eğlence Yerleri İşletmeciliği

NACE: 591402 Sinema Filmi Gösterim Faaliyetleri; 902004 Sirklerin Faaliyetleri; 932101 Eğlence Parkları Ve Tema Parklarının Faaliyetleri (Bağımsız Sağlayıcılar Tarafından Mekanik At Ve Arabaların, Oyunların Ve Gösterilerin İşletilmesi Hariç); 932901 Plaj Alanlarının İşletilmesi (Bu Tesislerin Bütünleyici Bir Parçası Olan Soyunma Odası, Dolap, Sandalye, Kano, Deniz Motosikleti Vb. Kiralanması Dahil); 932910 Dinlence (Rekreasyon) Parklarının Faaliyetleri (Konaklamalı Olanlar İle Eğlence Parkları Ve Tema Parklarının İşletilmesi Hariç); 932999 Başka Yerde Sınıflandırılmamış Diğer Eğlence Ve Dinlence (Rekreasyon) Faaliyetleri

**Belge seçimi:** Eğlence mekânı konser / etkinlik girişlerinde e-Bilet, masa harcamalarında e-Arşiv (adisyon) düzenler. Bilet; etkinlik tarihi, salon, sıra-koltuk ve kapı bilgisini taşır.

- **Konser Giriş e-Bileti** (`meslek-b03-konser-giris-e-bileti`, e-Bilet, yerleşim *bilet*): Canlı konser girişi; etkinlik saati, salon, kapı ve sıra-koltuk ek alanlarla bilet üzerinde.
  - ProfileID e-Bilet (depo şablon kuralı) · SATIS; InvoicePeriod sefer / etkinlik başlangıcı, AdditionalDocumentReference ile SALON, KAPI, SIRA, KOLTUKNO. Yolcu / seyirci AccountingCustomerParty (TCKN + Person).

- **Masa Adisyonu e-Arşiv** (`meslek-b03-masa-adisyonu-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Gece kulübünde masa harcaması; içki ve yiyecekler farklı KDV oranlarında.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### B.04 Gazinoculuk

NACE: 563004 Bar, Meyhane Ve Birahanelerde İçecek Sunum Faaliyetleri (Alkollü-Alkolsüz); 563005 Gazino, Gece Kulübü, Taverna, Diskotek, Kokteyl Salonları, Vb. Yerlerde İçecek Sunum Faaliyetleri (Alkollü-Alkolsüz)

**Belge seçimi:** Gazino; giriş + menü kapsayan program biletlerini e-Bilet, tur acentelerine grup satışlarını e-Fatura ile belgeler. Sahneye çıkan sanatçılar gazinoya e-SMM düzenler (gazino stopaj keser).

- **Fasıl Gecesi Programlı e-Bilet** (`meslek-b04-fasil-gecesi-programli-e-bilet`, e-Bilet, yerleşim *bilet*): Fasıl programı + akşam yemeği dahil kişi başı bilet; masa ve program saati bilet alanlarında.
  - ProfileID e-Bilet (depo şablon kuralı) · SATIS; InvoicePeriod sefer / etkinlik başlangıcı, AdditionalDocumentReference ile MASA, SALON, MENU. Yolcu / seyirci AccountingCustomerParty (TCKN + Person).

- **Tur Acentesine Grup Satışı e-Faturası** (`meslek-b04-tur-acentesine-grup-satisi-e-faturasi`, e-Fatura, yerleşim *kenar*): Yabancı turist grubu için acenteye toplu fasıl gecesi satışı; komisyon iskontosu satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### B.05 Kahvehanecilik, Kıraathanecilik

NACE: 563002 Çay Ocakları, Kıraathaneler, Kahvehaneler, Kafeler (İçecek Ağırlıklı Hizmet Veren), Meyve Suyu Salonları Ve Çay Bahçelerinde İçecek Sunum Faaliyeti; 563090 Seyyar İçecek Satanlar İle Diğer İçecek Sunum Faaliyetleri (Trenlerde Ve Gemilerde İşletilen Barların Faaliyetleri (Alkollü-Alkolsüz) Dahil)

**Belge seçimi:** Kahvehanelerin çoğu basit usuldedir; işletme esasına tabi olanlar müşteriye e-Arşiv düzenler. Çevre işyerlerine aylık çay-kahve servisi verildiğinde alıcı e-Fatura mükellefi ise e-Fatura düzenlenir.

- **Masa Hesabı e-Arşiv** (`meslek-b05-masa-hesabi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Müşteri talebiyle düzenlenen masa hesabı; çay, kahve ve oyun ücreti.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **İşyerine Aylık Çay Servisi e-Faturası** (`meslek-b05-isyerine-aylik-cay-servisi-e-faturasi`, e-Fatura, yerleşim *defter*): Çarşıdaki bankaya / işyerine ay boyu verilen çay-kahve servisinin aylık faturası; dönem alanı dolu.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### B.06 Lokal İşletmeciliği

NACE: 563003 Lokallerde İçecek Sunum Faaliyeti (Alkollü-Alkolsüz)

**Belge seçimi:** Lokal işletmecisi üye harcamalarını e-Arşiv ile, derneklerin / kurumların toplantı-yemek organizasyonlarını e-Fatura ile faturalar. Yemek hizmeti KDV %10, salon kirası %20.

- **Üye Harcama e-Arşiv** (`meslek-b06-uye-harcama-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Lokal üyesinin yemek ve içecek harcaması; üye kart numarası belge alanında.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Dernek Toplantı Yemeği e-Faturası** (`meslek-b06-dernek-toplanti-yemegi-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Mesleki derneğin genel kurul sonrası yemek ve salon kullanımı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### B.07 Otel, Pansiyon, Yurt İşletmeciliği

NACE: 551002 Otel Vb. Konaklama Yerlerinin Faaliyetleri (Günlük Temizlik Ve Yatak Yapma Hizmeti Sağlanan Yerlerin Faaliyetleri) (Kendi Müşterilerine Restoran Hizmeti Vermeyenler İle Devre Mülkler Hariç); 551005 Otel Vb. Konaklama Yerlerinin Faaliyetleri (Günlük Temizlik Ve Yatak Yapma Hizmeti Sağlanan Yerlerin Faaliyetleri) (Kendi Müşterilerine Restoran Hizmeti Verenler İle Devre Mülkler Hariç); 552001 Tatil Ve Diğer Kısa Süreli Konaklama Faaliyetleri (Günlük Temizlik Ve Yatak Yapma Hizmeti Sağlanan Oda Veya Süit Konaklama Faaliyetleri Hariç); 552003 Kendine Ait Veya Kiralanmış Mobilyalı Evlerde Bir Aydan Daha Kısa Süreli Olarak Konaklama Faaliyetleri; 552004 Tatil Amaçlı Pansiyonların Faaliyetleri; 553036 Kamp Alanları Ve Karavan Parkları; 559001 Öğrenci Ve İşçi Yurtları, Pansiyonlar Ve Odası Kiralanan Evlerde Yapılan Konaklama Faaliyetleri (Tatil Amaçlı Olanlar Hariç); 559090 Diğer Konaklama Yerlerinin Faaliyetleri (Başka Bir Birim Tarafından İşletildiğinde Yataklı Vagonlar Vb. Dahil; Misafirhaneler, Öğretmen Evi Vb. Hariç) … (+1 kod)

**Belge seçimi:** Konaklama tesisleri 7194 sayılı Kanun gereği oda bedeli üzerinden %2 konaklama vergisi hesaplar (InvoiceTypeCode KONAKLAMAVERGISI, TaxTypeCode 0059). Bireysel misafire e-Arşiv, şirkete e-Fatura; öğrenci yurtları konaklama vergisi kapsamı dışındadır.

- **Misafir Konaklama e-Arşiv (Konaklama Vergisi)** (`meslek-b07-misafir-konaklama-e-arsiv-konaklama-vergisi`, e-Arşiv Fatura, yerleşim *serit*): Bireysel misafirin 4 gecelik konaklaması; oda satırında %2 konaklama vergisi, ekstra harcamalarda yalnız KDV.
  - ProfileID EARSIVFATURA · InvoiceTypeCode KONAKLAMAVERGISI.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - InvoiceTypeCode KONAKLAMAVERGISI; oda satırlarında TaxTypeCode 0059 (%2) ve KDV matrahına dahil; yemek / ekstra satırlarında yalnız KDV. InvoicePeriod giriş-çıkış.

- **Şirket Konaklaması e-Faturası (Konaklama Vergisi)** (`meslek-b07-sirket-konaklamasi-e-faturasi-konaklama-vergisi`, e-Fatura, yerleşim *kurumsal*): Kurumsal anlaşmalı firmanın personel konaklaması; toplantı salonu konaklama vergisi dışında.
  - InvoiceTypeCode KONAKLAMAVERGISI; oda satırlarında TaxTypeCode 0059 (%2) ve KDV matrahına dahil; yemek / ekstra satırlarında yalnız KDV. InvoicePeriod giriş-çıkış.

- **Öğrenci Yurdu Aylık Ücret e-Arşiv** (`meslek-b07-ogrenci-yurdu-aylik-ucret-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Öğrenci yurdunun aylık barınma ücreti; yurt hizmeti konaklama vergisinden istisna olduğundan yalnız KDV.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### B.08 Oyun Salonu, İnternet Kafe İşletmeciliği

NACE: 619005 İnternet Kafelerin Faaliyetleri; 932903 Oyun Makinelerinin İşletilmesi; 932908 Bilardo Salonlarının Faaliyetleri; 932911 Elektronik Spor (E-Spor) Oyun Merkezlerinin Faaliyetleri

**Belge seçimi:** Oyun salonu ve internet kafe saatlik kullanım / bakiye yüklemeyi e-Arşiv ile; e-spor turnuvası katılım ve seyirci girişlerini e-Bilet ile belgeler.

- **Saatlik Kullanım ve Bakiye e-Arşiv** (`meslek-b08-saatlik-kullanim-ve-bakiye-e-arsiv`, e-Arşiv Fatura, yerleşim *modern*): Üyenin bilgisayar / konsol saatlik kullanımı ve bakiye yükleme; üyelik no belge alanında.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **E-Spor Turnuvası Katılım e-Bileti** (`meslek-b08-e-spor-turnuvasi-katilim-e-bileti`, e-Bilet, yerleşim *bilet*): Hafta sonu e-spor turnuvası katılım bileti; takım ve koltuk ek alanlarla.
  - ProfileID e-Bilet (depo şablon kuralı) · SATIS; InvoicePeriod sefer / etkinlik başlangıcı, AdditionalDocumentReference ile ETKINLIK, SALON, KOLTUKNO. Yolcu / seyirci AccountingCustomerParty (TCKN + Person).

### B.09 Ses, Sahne Sanatçılığı

NACE: 902002 Bağımsız Müzisyen, Ses Sanatçısı, Konuşmacı, Sunucu Vb.lerin Faaliyetleri (Müzik Grupları Dahil); 902003 Canlı Tiyatro, Opera, Bale, Müzikal, Konser Vb. Yapımların Sahneye Konulması Faaliyetleri (İllüzyon Gösterileri, Kukla Gösterileri Ve Kumpanyalar Dahil); 902099 Başka Yerde Sınıflandırılmamış Diğer Gösteri Sanatları

**Belge seçimi:** Ses ve sahne sanatçısı serbest meslek erbabıdır: e-SMM düzenler. İşveren mekân / şirket ise %20 GV stopajı makbuzda gösterilir ve müşteri tarafından ödenecekten düşülür; gerçek kişiye (düğün sahibine) düzenlenen makbuzda stopaj yoktur.

- **Mekâna Sahne Performansı e-SMM (Stopajlı)** (`meslek-b09-mekana-sahne-performansi-e-smm-stopajli`, e-SMM, yerleşim *zarif*): Eğlence mekânında 3 gecelik sahne performansı; işveren şirket %20 stopajı keser.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015) ve GV stopajı 0003 (%20). Ödenecek = brüt + KDV − stopaj.

- **Düğün Performansı e-SMM (Gerçek Kişi)** (`meslek-b09-dugun-performansi-e-smm-gercek-kisi`, e-SMM, yerleşim *pastel*): Düğün sahibine solist ve orkestra hizmeti; gerçek kişi müşteri stopaj sorumlusu olmadığından stopaj satırı yok.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015). Ödenecek = brüt + KDV − stopaj.

### B.10 Şans Oyunları Bayiliği

NACE: 920001 Müşterek Bahis Faaliyetleri (At Yarışı, Köpek Yarışı, Futbol Ve Diğer Spor Yarışmaları Konusunda Bahis Hizmetleri); 920002 Loto Vb. Sayısal Şans Oyunlarına İlişkin Faaliyetler (Piyango Biletlerinin Satışı Dahil)

**Belge seçimi:** Şans oyunları bayii oyun hasılatını değil, lisans sahibinden aldığı komisyonu faturalar: ana bayi / lisans şirketine aylık komisyon e-Faturası. Komisyon hizmeti %20 KDV’ye tabidir.

- **Piyango Satış Komisyonu e-Faturası** (`meslek-b10-piyango-satis-komisyonu-e-faturasi`, e-Fatura, yerleşim *kenar*): Lisans sahibi şirkete aylık piyango ve kazı kazan satış komisyonu; satış hasılatı ve oran açıklamada.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Spor Bahisleri Komisyon e-Faturası (Temel)** (`meslek-b10-spor-bahisleri-komisyon-e-faturasi-temel`, e-Fatura, yerleşim *teknik*): Spor bahisleri operatörüne haftalık kupon satış komisyonu; temel senaryo.
  - TEMELFATURA: alıcı kabul/ret yanıtı gönderemez; iade için ayrı İADE faturası gerekir.

### C.01 Asansör, Yürüyen Merdiven Kurulumu, Bakımı, Onarımı

NACE: 432401 Asansörlerin, Yürüyen Merdivenlerin, Yürüyen Yolların, Otomatik Ve Döner Kapıların Onarım Ve Bakımı Dahil Kurulum İşleri

**Belge seçimi:** Asansör firması AVM, otel ve plaza gibi kurumsal müşterilere bakım-onarım (belirlenmiş alıcıda 603 kodlu 7/10 tevkifat) ve apartman yönetimlerine aylık bakım sözleşmesi (yönetim mükellef olmadığından e-Arşiv) faturalar.

- **AVM Yürüyen Merdiven Bakım Faturası (Tevkifat 603)** (`meslek-c01-avm-yuruyen-merdiven-bakim-faturasi-tevkifat-603`, e-Fatura, yerleşim *teknik*): Alışveriş merkezine yürüyen merdiven ve asansör aylık bakım + parça değişimi; servis formu referanslı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Apartman Aylık Bakım e-Arşiv** (`meslek-c01-apartman-aylik-bakim-e-arsiv`, e-Arşiv Fatura, yerleşim *kurumsal*): Apartman yönetimine aylık asansör bakım sözleşmesi bedeli; yönetim e-Fatura mükellefi olmadığından e-Arşiv.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı e-Fatura mükellefi değil: VKN + PartyName + vergi dairesi.

### C.02 Beyaz Eşya Onarımı

NACE: 952201 Evde Kullanılan Elektrikli Cihazların Onarımı (Buzdolabı, Fırın, Çamaşır Makinesi, Bulaşık Makinesi, Oda Kliması, Elektrikli Küçük Ev Aletleri, Robot Süpürge Vb.)

**Belge seçimi:** Beyaz eşya onarımcısı evlere servis hizmetini e-Arşiv ile, restoran / otel gibi işletmelere endüstriyel cihaz onarımını e-Fatura ile düzenler. Kurumsal belirlenmiş alıcılarda 603 tevkifatı uygulanır.

- **Ev Servisi e-Arşiv** (`meslek-c02-ev-servisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Müşteri evinde çamaşır makinesi arıza onarımı; cihaz seri no ve servis formu belge üzerinde.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Restoran Endüstriyel Cihaz Onarım Faturası (Tevkifat 603)** (`meslek-c02-restoran-endustriyel-cihaz-onarim-faturasi-tevkifat-603`, e-Fatura, yerleşim *endustri*): Otel mutfağındaki endüstriyel bulaşık makinesi ve soğuk odanın onarımı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### C.03 Beyaz Eşya Ticareti

NACE: 464301 Beyaz Eşya Toptan Ticareti; 475401 Beyaz Eşya Ve Elektrikli Küçük Ev Aleti Perakende Ticareti (Radyo, Televizyon Ve Fotoğrafçılık Ürünleri Hariç)

**Belge seçimi:** Beyaz eşya bayii tüketiciye cihaz satışını e-Arşiv ile (seri no ve garanti satırda), otel / yurt / şirket gibi toplu alımlarda e-Fatura ile düzenler. Teslimat bayi aracıyla yapılıyorsa e-İrsaliye eşlik eder.

- **Beyaz Eşya Satışı e-Arşiv (Seri No + Garanti)** (`meslek-c03-beyaz-esya-satisi-e-arsiv-seri-no-garanti`, e-Arşiv Fatura, yerleşim *modern*): Tüketiciye buzdolabı ve bulaşık makinesi satışı; seri no, garanti süresi ve eski cihaz takas indirimi satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Otel Toplu Cihaz Satış e-Faturası** (`meslek-c03-otel-toplu-cihaz-satis-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Otel odaları için mini buzdolabı ve TV toplu satışı; teslimat irsaliyesi referanslı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### C.04 Bilgisayar Kurulumu, Onarımı, Programlama, Veri Kurtarma

NACE: 182003 Yazılımların Çoğaltılması Hizmetleri (Cd, Kaset Vb. Ortamlardaki Bilgisayar Yazılımlarının Ve Verilerin Asıl (Master) Kopyalarından Çoğaltılması); 582101 Video Oyunlarının Yayımlanması; 582901 Diğer Yazılım Programlarının Yayımlanması; 603901 Kullanıcılar Tarafından Üretilen Ve Düzenlenen İçeriği Yayınlayan Ve Editoryal Sorumluluk Ve Kontrol Altında Olmayan Wiki Siteleri, Sosyal Ağ/Sosyal Medya Siteleri Gibi İçerik Paylaşım Sitelerinin Dağıtım Hizmetleri; 603909 Diğer İçerik Dağıtım Faaliyetleri; 621000 Bilgisayar Programlama Faaliyetleri (Sistem, Veri Tabanı, Network, Web Sayfası Vb. Yazılımları İle Müşteriye Özel Yazılımların Kodlanması, Masaüstü Ya Da Mobil Cihazlar İçin Uygulama Geliştirme, Vb); 622000 Bilgisayar Danışmanlığı Ve Bilgisayar Birimleri (Sistemleri) Yönetimi Faaliyetleri (Siber Güvenlik Danışmanlığı Dahil); 629001 Bilgisayarları Felaketten Kurtarma Ve Veri Kurtarma Faaliyetleri … (+6 kod)

**Belge seçimi:** Bilgisayar servisi bireysel veri kurtarma / onarımı e-Arşiv ile; kurum bilgisayar parkının bakım-onarımını e-Fatura ile faturalar. Demirbaş niteliğindeki bilgisayarların bakım-onarımı belirlenmiş alıcılarda 603 (7/10) tevkifata tabidir.

- **Veri Kurtarma Hizmeti e-Arşiv** (`meslek-c04-veri-kurtarma-hizmeti-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Arızalı harici diskten veri kurtarma; cihaz seri no ve kurtarılan veri miktarı açıklamada.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Kurum Bilgisayar Bakım-Onarım Faturası (Tevkifat 603)** (`meslek-c04-kurum-bilgisayar-bakim-onarim-faturasi-tevkifat-603`, e-Fatura, yerleşim *teknik*): Kurumun bilgisayar ve sunucu parkının aylık bakım-onarımı ile parça değişimi.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### C.05 Elektrik Makineleri İmalatı, Kurulumu, Onarımı

NACE: 271101 Elektrik Motoru, Jeneratör Ve Transformatörlerin İmalatı (Aksam Ve Parçaları Hariç); 271103 Elektrik Motoru, Jeneratör Ve Transformatörlerin Aksam Ve Parçalarının İmalatı; 279005 Elektrikli Kaynak Ve Lehim Teçhizatı (Lehim Havyaları, Ark Kaynak Makineleri, Endüksiyon Kaynak Makineleri Vb.) İle Metallerin Veya Sinterlenmiş Metal Karbürlerin Sıcak Spreylenmesi İçin Elektrikli Makine Ve Cihazlarının İmalatı; 331401 Güç Transformatörleri, Dağıtım Transformatörleri Ve Özel Transformatörlerin Onarım Ve Bakımı (Elektrik Dağıtım Ve Kontrol Cihazları Dahil); 331402 Elektrik Motorları, Jeneratörler Ve Motor Jeneratör Setlerinin Onarım Ve Bakımı (Bobinlerin Tekrar Sarımı Dahil); 332051 Elektrikli Ekipmanların Kurulum Hizmetleri (Yollar, Vb. İçin Elektrikli Sinyalizasyon Ekipmanları Hariç))

**Belge seçimi:** Elektrik makineleri onarımcısı fabrikaların motor / jeneratör onarımını yapar: makine-teçhizat onarımı 603 (7/10) tevkifatlı e-Fatura. Onarılan motorların fabrikaya dönüşü e-İrsaliye ile sevk edilir.

- **Motor Sargı Onarım Faturası (Tevkifat 603)** (`meslek-c05-motor-sargi-onarim-faturasi-tevkifat-603`, e-Fatura, yerleşim *endustri*): Un fabrikasının yanan elektrik motorlarının sargı ve rulman yenilemesi.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Onarılmış Motor Sevk İrsaliyesi** (`meslek-c05-onarilmis-motor-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Onarımı tamamlanan motorların müşteri fabrikasına sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### C.06 Elektrik Malzemeleri İmalatı, Ticareti

NACE: 234301 Seramik Yalıtkanların (İzolatörlerin) Ve Yalıtkan Bağlantı Parçalarının İmalatı; 271201 Elektrik Dağıtım Ve Kontrol Cihazları İmalatı; 271202 Elektrik Dağıtım Ve Kontrol Cihazlarının Aksam Ve Parçalarının İmalatı; 273300 Kablolamada Kullanılan Gereçlerin İmalatı; 274002 Hava Ve Motorlu Kara Taşıtları İçin Monoblok Far Üniteleri, Kara, Hava Ve Deniz Taşıtları İçin Elektrikli Aydınlatma Donanımları Veya Görsel Sinyalizasyon Ekipmanları İmalatı (Polis Araçları, Ambulans Vb. Araçların Dış İkaz Lambaları Dahil); 274003 Avize, Aplik Ve Diğer Elektrikli Aydınlatma Armatürleri, Sahne, Fotoğraf Veya Sinema Stüdyoları İçin Projektörler Ve Spot Işıkları, Elektrikli Masa Lambaları, Çalışma Lambaları, Abajur Vb. Lambaların İmalatı (Süsleme İçin Işıklandırma Setleri Dahil); 274004 Sokak Aydınlatma Donanımlarının İmalatı (Trafik Işıkları Hariç); 274005 Pil, Akümülatör Veya Manyeto İle Çalışan Portatif Elektrik Lambaları Ve Elektriksiz Lambalar İle El Feneri, Gaz Ve Lüks Lambası Vb. Aydınlatma Armatürlerinin İmalatı (Taşıtlar İçin Olanlar Hariç) … (+9 kod)

**Belge seçimi:** Elektrik malzemeleri toptancısı elektrik müteahhitlerine ve perakendecilere e-Fatura, şantiye teslimlerinde e-İrsaliye düzenler. Kablo ve aydınlatma ürünlerinde marka / kesit / güç satır etiketleriyle belirtilir.

- **Toptan Elektrik Malzemesi e-Faturası** (`meslek-c06-toptan-elektrik-malzemesi-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Elektrik müteahhidine kablo, sigorta ve LED armatür satışı; ürün kodları ve iskonto satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Şantiyeye Malzeme Sevk İrsaliyesi** (`meslek-c06-santiyeye-malzeme-sevk-irsaliyesi`, e-İrsaliye, yerleşim *serit*): Toptancı deposundan inşaat şantiyesine kablo ve pano malzemesi sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### C.07 Elektrik Sistemleri İmalatı, Kurulumu, Onarımı

NACE: 331490 Diğer Profesyonel Elektrikli Ekipmanların Onarım Ve Bakımı; 332053 Endüstriyel İşlem Kontrol Ekipmanlarının Kurulum Hizmetleri (Otomasyon Destekliler Dahil)

**Belge seçimi:** Elektrik sistemleri imalatçısı pano imalatı + montajı yapım işi kapsamında yapıyorsa 601 (4/10) tevkifatlı e-Fatura düzenler; Irak, Azerbaycan gibi ülkelere pano ihracatı IHRACAT profiliyle yapılır.

- **Pano İmalat ve Montaj Hakedişi (Tevkifat 601)** (`meslek-c07-pano-imalat-ve-montaj-hakedisi-tevkifat-601`, e-Fatura, yerleşim *teknik*): Hastane inşaatı alt yükleniciliğinde AG pano imalatı ve montajı; hakediş no ve dönem bilgisi.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 601, Percent 40 (4/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Elektrik Panosu İhracat Faturası (CPT)** (`meslek-c07-elektrik-panosu-ihracat-faturasi-cpt`, e-Fatura (İhracat), yerleşim *serit*): Irak’taki müşteriye OG hücre ve kompanzasyon panosu ihracatı; karayolu taşıma ve GTİP 8537.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (CPT), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz USD + PricingExchangeRate.

### C.08 Elektrik Tesisatçılığı

NACE: 351100 Yenilenemeyen Kaynaklardan Elektrik Üretimi; 351200 Yenilenebilir Kaynaklardan Elektrik Üretimi; 432101 Bina Ve Bina Dışı Yapıların (Ulaşım İçin Aydınlatma Ve Sinyalizasyon Sistemleri Hariç) Elektrik Tesisatı, Kablolu Televizyon Ve Bilgisayar Ağı Tesisatı İle Konut Tipi Antenler (Uydu Antenleri Dahil), Elektrikli Güneş Enerjisi Kollektörleri, Elektrik Sayaçları, Elektrikli Araçlar İçin Elektrikli Şarj Cihazları Tesisatının Kurulumu, Duvar Dibi Isıtma Sistemleri, Yangın Ve Hırsızlık Alarm Sistemleri Vb. Kurulumu

**Belge seçimi:** Elektrik tesisatçısı evlerde tesisat yenileme / arıza işini e-Arşiv ile, müteahhitlere alt yüklenici olarak yaptığı tesisat işini e-Fatura ile faturalar; yapım işi kapsamındaki tesisat işlerinde 601 (4/10) tevkifatı uygulanır.

- **Ev Tesisat Yenileme e-Arşiv** (`meslek-c08-ev-tesisat-yenileme-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Daire elektrik tesisatının yenilenmesi; malzeme ve işçilik ayrı satırlarda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Konut Projesi Tesisat Faturası (Tevkifat 601)** (`meslek-c08-konut-projesi-tesisat-faturasi-tevkifat-601`, e-Fatura, yerleşim *endustri*): Müteahhit firmanın konut projesinde blok elektrik tesisatı alt yükleniciliği.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 601, Percent 40 (4/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### C.09 Elektrikli Ev Aletleri İmalatı, Onarımı

NACE: 275102 Ev Tipi Elektrikli Su Isıtıcıları (Depolu Su Isıtıcıları, Anında Su Isıtıcıları, Şofben, Termosifon Dahil), Elektrikli Isıtma Cihazları (Elektrikli Soba, Radyatör, Vb.) Ve Elektrikli Toprak Isıtma Cihazlarının İmalatı; 275104 Mutfakta Kullanılan Elektrikli Küçük Ev Aletlerinin İmalatı (Çay Veya Kahve Makinesi, Semaver, Izgara, Kızartma Cihazı, Ekmek Kızartma Makinesi, Mutfak Robotu, Mikser, Blender, Meyve Sıkacağı, Et Kıyma Makinesi, Tost Makinesi, Fritöz Vb.); 275105 Elektrikli Diğer Küçük Ev Aletleri (Elektrotermik El Kurutma Makinesi, Elektrikli Ütü, Havlu Dispenseri, Hava Nemlendirici) İle Elektrikli Battaniyelerin İmalatı; 275107 Elektrikli Ev Aletleri Aksam Ve Parçalarının İmalatı; 275108 Ev Tipi Buzdolabı, Dondurucu, Çamaşır Makinesi, Çamaşır Kurutma Makinesi, Bulaşık Makinesi, Vantilatör, Aspiratör, Fan, Aspiratörlü Davlumbaz, Fırın, Ocak, Mikrodalga Fırın, Elektrikli Pişirme Sacı Vb. İmalatı; 275199 Başka Yerde Sınıflandırılmamış Diğer Elektrikli Ev Aletlerinin İmalatı; 952999 Başka Yerde Sınıflandırılmamış Diğer Kişisel Ve Ev Eşyalarının Onarım Ve Bakımı

**Belge seçimi:** Ev aletleri imalatçısı zincir mağazalara e-Fatura + e-İrsaliye ile satış yapar; garanti dışı onarım hizmetini tüketiciye e-Arşiv ile belgeler.

- **Zincir Mağazaya Toptan Satış e-Faturası** (`meslek-c09-zincir-magazaya-toptan-satis-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Elektronik perakende zincirine ürün sevkiyatı; barkod ve ürün kodu satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Garanti Dışı Onarım e-Arşiv** (`meslek-c09-garanti-disi-onarim-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Yetkili serviste garanti süresi dolmuş süpürgenin onarımı; seri no ve servis kaydı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### C.10 Elektrikli Ev Aletleri Ticareti

NACE: 464390 Diğer Elektrikli Ev Aletleri Toptan Ticareti; 475499 Başka Yerde Sınıflandırılmamış Elektrikli Ev Aletleri Perakende Ticareti (Radyo, Tv Ve Fotoğrafçılık Ürünleri Hariç)

**Belge seçimi:** Ev aletleri perakendecisi online satışlarda e-Arşiv internet satışı alanlarını kullanır; cayma hakkıyla iade edilen ürünlerde tüketici fatura düzenleyemediğinden satıcı e-Gider Pusulası (IADE) düzenler.

- **Online Satış e-Arşiv (İnternet)** (`meslek-c10-online-satis-e-arsiv-internet`, e-Arşiv Fatura, yerleşim *modern*): Web mağazasından kartla satılan kahve makinesi ve süpürge; kargo firması, takip no ve ödeme aracısı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.

- **Cayma Hakkı İadesi e-Gider Pusulası** (`meslek-c10-cayma-hakki-iadesi-e-gider-pusulasi`, e-Gider Pusulası, yerleşim *pastel*): Tüketicinin 14 gün içinde iade ettiği kahve makinesi için iade gider pusulası; iade edilen e-Arşiv faturası referanslı.
  - CreditNote · GIDERPUSULASI · CreditNoteTypeCode IADE: BillingReference/InvoiceDocumentReference (schemeID EARSIV_FATURA) iade edilen e-Arşiv faturası; müşteri Contact ID = iade onay kodu, Name IADEKODU; Delivery/DeliveryParty iade kargosu. Satırlarda iade edilen KDV (0015).

### C.11 Elektronik Ürün İmalatı, Onarımı

NACE: 261104 Diyotların, Transistörlerin, Diyakların, Triyaklar, Tristör, Rezistans, Ledler, Kristal, Röle, Mikro Anahtar, Sabit Veya Ayarlanabilir Direnç Ve Kondansatörler İle Elektronik Entegre Devrelerin İmalatı; 261106 Çıplak Baskılı Devre Kartlarının İmalatı; 261199 Başka Yerde Sınıflandırılmamış Diğer Elektronik Bileşenlerin İmalatı; 261201 Yüklü Elektronik Kart İmalatı (Yüklü Baskılı Devre Kartları, Ses, Görüntü, Denetleyici, Ağ Ve Modem Kartları İle Akıllı Kartlar Vb.); 263003 Kızıl Ötesi (Enfraruj) Sinyal Kullanan İletişim Cihazlarının İmalatı (Örn: Uzaktan Kumanda Cihazları); 263005 Alıcı Ve Verici Antenlerin İmalatı (Harici, Teleskopik, Çubuk, Uydu, Çanak Ve Hava Ve Deniz Taşıtlarının Antenleri); 264010 Mikrofon, Hoparlör Ve Kulaklıklar İle Elektrikli Ses Yükselteçlerinin (Amplifikatörler) İmalatı; 264099 Başka Yerde Sınıflandırılmamış Tüketici Elektroniği Ürünlerinin İmalatı … (+24 kod)

**Belge seçimi:** Elektronik imalatçısı sanayi müşterilerine kart / modül satışını e-Fatura ile yapar; yurt dışındaki küçük alıcılara kargo ile gönderilen ürünler ETGB’li mikro ihracat (e-Arşiv ISTISNA 301) olarak belgelenir.

- **Elektronik Kart Satış e-Faturası** (`meslek-c11-elektronik-kart-satis-e-faturasi`, e-Fatura, yerleşim *teknik*): Beyaz eşya üreticisine kontrol kartı satışı; lot ve revizyon numarası satır etiketlerinde.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Geliştirme Kiti Mikro İhracat (ETGB)** (`meslek-c11-gelistirme-kiti-mikro-ihracat-etgb`, e-Arşiv (Mikro İhracat / ETGB), yerleşim *kenar*): ABD’deki alıcıya web sitesinden satılan geliştirme kitleri; ETGB, GTİP ve kargo takip bilgisi.
  - e-Arşiv (EARSIVFATURA) + InvoiceTypeCode ISTISNA 301; yabancı alıcı VKN 2222222222 ve ülke kodu; AdditionalDocumentReference ETGB; Delivery/CarrierParty + TrackingID; satırda GTİP (AdditionalItemIdentification). Döviz + kur.

### C.12 Elektronik Ürün Ticareti

NACE: 461401 Bilgisayar, Yazılım, Elektronik Ve Telekomünikasyon Donanımlarının Ve Diğer Büro Ekipmanlarının Toptan Satışı İle İlgili Aracıların Faaliyetleri; 461503 Radyo, Televizyon Ve Video Cihazlarının Toptan Satışı İle İlgili Aracıların Faaliyetleri; 464309 Radyo, Televizyon, Video Ve Dvd Cihazlarının Toptan Ticareti (Antenler İle Arabalar İçin Radyo Ve Tv Ekipmanları Dahil); 465001 Bilgisayar, Bilgisayar Çevre Birimleri Ve Yazılımlarının Toptan Ticareti (Bilgisayar Donanımları, Pos Cihazları, Atm Cihazları Vb. Dahil); 465003 Elektronik Cihaz Ve Parçalarının Toptan Ticareti (Elektronik Valfler, Tüpler, Yarı İletken Cihazlar, Mikroçipler, Entegre Devreler, Baskılı Devreler, Vb.) (Seyrüsefer Cihazları Hariç); 465090 Diğer Bilgi Ve İletişim Teknolojisi Ekipmanlarının Toptan Ticareti; 466413 Sanayi, Ticaret, Seyrüsefer Ve Diğer Hizmetlerde Kullanılmak Üzere Başka Yerde Sınıflandırılmamış Diğer Makinelere Ait Parçaların Toptan Ticareti (Motorlu Kara Taşıtları İçin Olanlar Hariç); 474001 Bilgisayarların, Çevre Donanımlarının Ve Yazılımların Perakende Ticareti … (+3 kod)

**Belge seçimi:** Elektronik perakendecisi seri no / garanti bilgili e-Arşiv düzenler; teknoloji destek kapsamındaki öğrenci satışlarında InvoiceTypeCode TEKNOLOJIDESTEK kullanılır (alıcı TCKN ve cihaz IMEI / seri no zorunlu).

- **Televizyon Satışı e-Arşiv** (`meslek-c12-televizyon-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *serit*): Tüketiciye televizyon ve duvar askı aparatı satışı; seri no ve garanti satırda, taksitli kart ödemesi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Öğrenci Teknoloji Destek e-Arşiv** (`meslek-c12-ogrenci-teknoloji-destek-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Teknoloji destek kapsamında öğrenciye dizüstü bilgisayar satışı; TCKN ve seri no zorunlu alanlar.
  - ProfileID EARSIVFATURA · InvoiceTypeCode TEKNOLOJIDESTEK.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - InvoiceTypeCode TEKNOLOJIDESTEK: alıcı TCKN zorunlu; cihaz IMEI / seri no satırda AdditionalItemIdentification.

### C.13 E-Ticaret

NACE: 479114 Radyo, Tv, Posta Yoluyla Veya İnternet Üzerinden Yapılan Perakende Ticaret

**Belge seçimi:** E-ticaret işletmesinin üç temel belgesi: yurt içi tüketici satışları e-Arşiv internet satışı (web adresi, ödeme aracısı, taşıyıcı), yurt dışı kargo satışları ETGB’li mikro ihracat ve cayma hakkı iadelerinde e-Gider Pusulası (IADE).

- **İnternet Satışı e-Arşiv** (`meslek-c13-internet-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *modern*): Web sitesinden kartla verilen siparişin faturası; GİB internet satışı zorunlu alanları dolu.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.

- **Yurt Dışı Sipariş Mikro İhracat (ETGB)** (`meslek-c13-yurt-disi-siparis-mikro-ihracat-etgb`, e-Arşiv (Mikro İhracat / ETGB), yerleşim *kurumsal*): Almanya’dan gelen pazaryeri siparişinin ETGB ile kargo gönderimi.
  - e-Arşiv (EARSIVFATURA) + InvoiceTypeCode ISTISNA 301; yabancı alıcı VKN 2222222222 ve ülke kodu; AdditionalDocumentReference ETGB; Delivery/CarrierParty + TrackingID; satırda GTİP (AdditionalItemIdentification). Döviz + kur.

- **Müşteri İadesi e-Gider Pusulası** (`meslek-c13-musteri-iadesi-e-gider-pusulasi`, e-Gider Pusulası, yerleşim *kart*): Tüketicinin kargo ile iade ettiği ürün için düzenlenen iade gider pusulası.
  - CreditNote · GIDERPUSULASI · CreditNoteTypeCode IADE: BillingReference/InvoiceDocumentReference (schemeID EARSIV_FATURA) iade edilen e-Arşiv faturası; müşteri Contact ID = iade onay kodu, Name IADEKODU; Delivery/DeliveryParty iade kargosu. Satırlarda iade edilen KDV (0015).

### C.14 Güvenlik Sistemleri Hizmetleri

NACE: 263009 Hırsız Ve Yangın Alarm Sistemleri Ve Kapı Konuşma Sistemlerinin (Diyafon) (Görüntülü Olanlar Dahil) İmalatı (Motorlu Kara Taşıtları İçin Alarm Sistemleri Hariç); 265101 Hırsız Ve Yangın Alarm Sistemleri İmalatı (Bir Kontrol İstasyonuna Sinyal Gönderenler) (Motorlu Kara Taşıtları İçin Olanlar Hariç); 464308 Hırsız Ve Yangın Alarmları İle Benzeri Cihazların Toptan Ticareti (Evlerde Kullanım Amaçlı); 800999 Başka Yerde Sınıflandırılmamış Güvenlik Faaliyetleri

**Belge seçimi:** Güvenlik sistemleri firması işyerlerine kamera / alarm kurulumunu e-Fatura ile; evlere aylık alarm izleme hizmetini dönemli e-Arşiv ile faturalar. Elektronik sistem kurulumu “özel güvenlik hizmeti” (607) değildir; tevkifat uygulanmaz.

- **Kamera Sistemi Kurulum e-Faturası** (`meslek-c14-kamera-sistemi-kurulum-e-faturasi`, e-Fatura, yerleşim *endustri*): Fabrikaya IP kamera ve NVR kurulumu; cihaz seri no ve garanti satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Alarm İzleme Aboneliği e-Arşiv** (`meslek-c14-alarm-izleme-aboneligi-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Konut alarm sisteminin aylık 7/24 izleme abonelik bedeli; abone no ve dönem.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### C.15 Kayıtlı Medyaların İmalatı, Kiralanması, Ticareti

NACE: 182002 Ses Ve Görüntü Kayıtlarının Çoğaltılması Hizmetleri (Cd&rsquo;lerin, Dvd&rsquo;lerin, Kasetlerin Ve Benzerlerinin Asıl (Master) Kopyalarından Çoğaltılması); 267020 Boş Manyetik Ses Ve Görüntü Kaset Bantlarının İmalatı (Plak Dahil); 267021 Manyetik Şeritli Kartların İmalatı (Boş Telefon Kartı Dahil); 267099 Başka Yerde Sınıflandırılmamış Manyetik Ve Optik Ortamların İmalatı; 476902 Müzik Ve Video Kayıtlarının Perakende Ticareti; 772201 Video Kasetlerinin, Plakların Ve Disklerin Kiralanması Ve Operasyonel Leasingi; 773907 Ticari Radyo, Televizyon Ve Telekomünikasyon Ekipmanları İle Sinema Filmi Yapım Ekipmanlarının Operatörsüz Olarak Kiralanması Veya Operasyonel Leasingi

**Belge seçimi:** Kayıtlı medya işletmesi tüketiciye plak / CD satışını e-Arşiv ile; müzik şirketlerine CD çoğaltma ve ambalaj işini e-Fatura ile faturalar.

- **Plak ve CD Satışı e-Arşiv** (`meslek-c15-plak-ve-cd-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Mağazadan tüketiciye plak ve CD satışı; katalog no satır etiketinde.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **CD Çoğaltma Hizmeti e-Faturası** (`meslek-c15-cd-cogaltma-hizmeti-e-faturasi`, e-Fatura, yerleşim *kenar*): Müzik yapım şirketine albüm CD çoğaltma, baskı ve ambalaj hizmeti.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### C.16 Telekomünikasyon Cihazları Onarımı

NACE: 422205 Telekomünikasyon Şebeke Ve Ağlarının Bakım Ve Onarımı; 951002 İletişim Araç Ve Gereçlerinin Onarımı (Kablosuz Telefonlar, Telsizler, Cep Telefonları, Çağrı Cihazları, Ticari Kameralar Vb.)

**Belge seçimi:** Telefon onarımcısı bireysel onarımları IMEI bilgili e-Arşiv ile; kurumların demirbaş telefon / tablet onarımını e-Fatura ile düzenler (alıcı belirlenmiş alıcıysa 603 tevkifat). Temel senaryo, alıcının ret yanıtı göndermesini istemeyen kurumsal müşterilerde tercih edilir.

- **Ekran Değişimi e-Arşiv (IMEI)** (`meslek-c16-ekran-degisimi-e-arsiv-imei`, e-Arşiv Fatura, yerleşim *fis*): Akıllı telefon ekran ve batarya değişimi; IMEI ve servis garanti süresi satır etiketinde.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Kurumsal Tablet Onarım e-Faturası (Temel)** (`meslek-c16-kurumsal-tablet-onarim-e-faturasi-temel`, e-Fatura, yerleşim *kurumsal*): Kurye şirketinin el terminali / tabletlerinin toplu onarımı.
  - TEMELFATURA: alıcı kabul/ret yanıtı gönderemez; iade için ayrı İADE faturası gerekir.

### C.17 Telekomünikasyon Cihazları Ticareti

NACE: 465002 Telekomünikasyon Ekipman Ve Parçalarının Toptan Ticareti (Telefon Ve İletişim Ekipmanları Dahil); 474002 Telekomünikasyon Teçhizatının Perakende Ticareti; 612004 Telekomünikasyon Ürünlerinin Yeniden Satışı Ve Telekomünikasyon İçin Aracılık Hizmeti Faaliyetleri

**Belge seçimi:** Telekom cihazı satıcısı tüketiciye IMEI kayıtlı telefon satışı (öğrenci satışlarında TEKNOLOJIDESTEK) düzenler; GSM operatöründen aldığı hat aktivasyon prim / komisyonlarını operatöre e-Fatura ile faturalar.

- **Öğrenciye Telefon Satışı e-Arşiv (Teknoloji Destek)** (`meslek-c17-ogrenciye-telefon-satisi-e-arsiv-teknoloji-destek`, e-Arşiv Fatura, yerleşim *modern*): Teknoloji destek kapsamında öğrenciye akıllı telefon satışı; IMEI ve TCKN zorunlu.
  - ProfileID EARSIVFATURA · InvoiceTypeCode TEKNOLOJIDESTEK.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - InvoiceTypeCode TEKNOLOJIDESTEK: alıcı TCKN zorunlu; cihaz IMEI / seri no satırda AdditionalItemIdentification.

- **Operatöre Aktivasyon Prim e-Faturası** (`meslek-c17-operatore-aktivasyon-prim-e-faturasi`, e-Fatura, yerleşim *teknik*): GSM operatörüne aylık yeni hat ve numara taşıma aktivasyon primleri.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### D.01 Aktar Ürünleri İmalatı, Ticareti

NACE: 108301 Çay Ürünleri İmalatı (Siyah Çay, Yeşil Çay Ve Poşet Çay İle Çay Ekstre, Esans Ve Konsantreleri); 108302 Kahve Ürünleri İmalatı (Çekilmiş Kahve, Çözünebilir Kahve İle Kahve Ekstre, Esans Ve Konsantreleri); 108303 Bitkisel Çayların İmalatı (Nane, Yaban Otu, Papatya, Ihlamur, Kuşburnu Vb. Çaylar); 108304 Kahve İçeren Ve Kahve Yerine Geçebilecek Ürünlerin İmalatı (Şeker, Süt Vb. Karıştırılmış Ürünler Dahil); 108401 Baharat İmalatı (Karabiber, Kırmızı Toz/Pul Biber, Hardal Unu, Tarçın, Yenibahar, Damla Sakızı, Baharat Karışımları Vb.) (İşlenmiş); 463701 Çay Toptan Ticareti; 463702 Kahve, Kakao Ve Baharat Toptan Ticareti; 463703 İçecek Amaçlı Kullanılan Aromatik Bitkilerin Toptan Ticareti … (+1 kod)

**Belge seçimi:** Aktar tüketiciye perakende satışta e-Arşiv düzenler; dağdan kekik, adaçayı gibi bitkileri toplayan / yetiştiren üreticiden alımda çiftçi fatura düzenleyemediğinden e-Müstahsil Makbuzu (bitkisel ürün %2 stopaj) kullanılır.

- **Baharat ve Bitki Çayı Satışı e-Arşiv** (`meslek-d01-baharat-ve-bitki-cayi-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Tüketiciye gramajlı baharat, bitki çayı ve doğal sabun satışı; farklı KDV oranları.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Üreticiden Kekik Alımı e-Müstahsil** (`meslek-d01-ureticiden-kekik-alimi-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *defter*): Toplayıcı / üreticiden kurutulmuş kekik ve adaçayı alımı; %2 GV stopajı ve Bağ-Kur kesintisi.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %2 (zirai ürün), SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

### D.02 Arıcılık

NACE: 014801 Arıcılık, Bal Ve Bal Mumu Üretilmesi (Arı Sütü Dahil)

**Belge seçimi:** Bal paketleyici üretici arıcılardan bal alımını e-Müstahsil (hayvansal ürün: %1 stopaj) ile belgeler; paketlediği balı marketlere e-Fatura ile satar. Arıcı ÇKS / arıcılık kayıt numarası satırda belirtilir.

- **Arıcıdan Bal Alımı e-Müstahsil** (`meslek-d02-aricidan-bal-alimi-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *pastel*): Gezginci arıcıdan süzme ve petek bal alımı; %1 GV stopajı, Bağ-Kur %1, analiz raporu referanslı.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %1 (hayvan / hayvansal ürün), SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

- **Market Zincirine Bal Satış e-Faturası** (`meslek-d02-market-zincirine-bal-satis-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Paketli bal ürünlerinin market zincirine satışı; parti ve son tüketim tarihi satır etiketlerinde.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### D.03 Bakkallık, Bayilik, Büfecilik

NACE: 110703 İçme Suyu Üretimi (Şişelenmiş, Gazsız, Tatlandırılmamış Ve Aromalandırılmamış); 353022 Soğutulmuş Hava Ve Soğutulmuş Su Üretim Ve Dağıtımı (Buz Üretimi Dahil); 461701 Gıda Maddelerinin Toptan Satışı İle İlgili Aracıların Faaliyetleri (Aracı Üretici Birlikleri Dahil, İçecekler İle Yaş Sebze Ve Meyve Hariç); 463403 Su Toptan Ticareti (Su İstasyonları Dahil, Şebeke Suyu Hariç); 463603 Şeker Toptan Ticareti; 463803 Gıda Tuzu (Sofra Tuzu) Toptan Ticareti; 463804 Un, Nişasta, Makarna, Şehriye Vb. Ürünler İle Hazır Gıdaların Toptan Ticareti; 463805 Hazır Homojenize Gıda İle Diyetetik Gıda Ürünleri Toptan Ticareti … (+15 kod)

**Belge seçimi:** Bakkal / büfe tüketiciye talep halinde e-Arşiv düzenler; aynı belgede %1 (ekmek, temel gıda), %10 (işlenmiş gıda) ve %20 (temizlik, tütün dışı ürünler) oranları birlikte bulunur. Çevredeki işyerlerine toplu satışlarda alıcı e-Fatura mükellefiyse e-Fatura düzenlenir.

- **Bakkal Satışı e-Arşiv (Çoklu KDV)** (`meslek-d03-bakkal-satisi-e-arsiv-coklu-kdv`, e-Arşiv Fatura, yerleşim *fis*): Tüketiciye ekmek, süt, atıştırmalık ve temizlik ürünü satışı; üç farklı KDV oranı ayrı vergi alt toplamlarında.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **İşyerine Aylık Mutfak Malzemesi e-Faturası** (`meslek-d03-isyerine-aylik-mutfak-malzemesi-e-faturasi`, e-Fatura, yerleşim *defter*): Çevredeki ofise ay boyu verilen çay, şeker, su ve temizlik malzemelerinin toplu faturası.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### D.04 Balıkçılık

NACE: 031101 Deniz Ve Kıyı Sularında Yapılan Balıkçılık (Gırgır Balıkçılığı, Dalyancılık Dahil); 031102 Deniz Kabuklularının (Midye, Istakoz Vb.), Yumuşakçaların, Diğer Deniz Canlıları Ve Ürünlerinin Toplanması (Sedef, Doğal İnci, Sünger, Mercan, Deniz Yosunu, Vb.); 031201 Tatlı Su Balıkçılığı; 032101 Denizde Yapılan Balık Yetiştiriciliği; 032102 Denizde Yapılan Diğer Su Ürünleri Yetiştiriciliği; 032201 Tatlı Sularda Yapılan Balık Yetiştiriciliği; 032202 Tatlısu Ürünleri Yetiştiriciliği (Balık Hariç); 102003 Balıkların, Kabuklu Deniz Hayvanlarının Ve Yumuşakçaların İşlenmesi Ve Saklanması … (+6 kod)

**Belge seçimi:** Balık toptancısı kayık sahibi balıkçılardan av alımını e-Müstahsil (su ürünleri hayvansal ürün: %1 stopaj) ile belgeler; restoran ve marketlere satışı e-Fatura ile yapar (taze balık KDV %1).

- **Balıkçıdan Av Alımı e-Müstahsil** (`meslek-d04-balikcidan-av-alimi-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *endustri*): Ruhsatlı balıkçı teknesinden hamsi ve istavrit alımı; tekne ruhsat no ve av bölgesi belge alanlarında.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %1 (hayvan / hayvansal ürün), SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

- **Restorana Taze Balık e-Faturası** (`meslek-d04-restorana-taze-balik-e-faturasi`, e-Fatura, yerleşim *serit*): Balık restoranına günlük taze balık teslimi; av tarihi ve av bölgesi satır etiketinde.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### D.05 Besicilik, Celeplik

NACE: 014131 Sütü Sağılan Büyükbaş Hayvan Yetiştiriciliği (Sütü İçin İnek Ve Manda Yetiştiriciliği); 014209 Diğer Sığır Ve Manda Yetiştiriciliği (Sütü İçin Yetiştirilenler Hariç); 014301 At Ve At Benzeri Diğer Hayvan Yetiştiriciliği (Eşek, Katır Veya Bardo Vb.); 014401 Deve Ve Devegillerin Yetiştiriciliği; 014501 Koyun Ve Keçi (Davar) Yetiştiriciliği (İşlenmemiş Süt, Kıl, Tiftik, Yapağı, Yün Vb. Üretimi Dahil); 014802 İpekböceği Yetiştiriciliği Ve Koza Üretimi; 016201 Hayvan Üretimini Destekleyici Olarak Sürülerin Güdülmesi, Başkalarına Ait Hayvanların Beslenmesi, Kümeslerin Temizlenmesi, Kırkma, Sağma, Barınak Sağlama, Nalbantlık Vb. Faaliyetler; 131008 İpeğin Kozadan Ayrılması Ve Sarılması … (+5 kod)

**Belge seçimi:** Besici / celep çiftçiden canlı hayvan alımını e-Müstahsil ile (hayvan %1 stopaj, borsa tescil, mera fonu, Bağ-Kur) belgeler; kesimhane ve et kombinalarına satışı e-Fatura ile yapar (canlı hayvan KDV %1). Küpe numaraları satır ek alanıdır.

- **Çiftçiden Besi Danası Alımı e-Müstahsil** (`meslek-d05-ciftciden-besi-danasi-alimi-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *defter*): Hayvan pazarında üreticiden besilik dana alımı; küpe no, borsa tescil ve mera fonu kesintili.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %1 (hayvan / hayvansal ürün), 8001 borsa tescil %0,2, 9040 mera fonu %0,2, SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

- **Et Kombinasına Canlı Hayvan e-Faturası** (`meslek-d05-et-kombinasina-canli-hayvan-e-faturasi`, e-Fatura, yerleşim *endustri*): Kesimhaneye canlı ağırlık üzerinden besi sığırı satışı; küpe numaraları ve veteriner sağlık raporu referanslı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### D.06 Bitkisel Ürünlerle İlgili Faaliyetler

NACE: 011321 Mantar Ve Yer Mantarları (Domalan) Yetiştirilmesi; 013003 Dikim İçin Sebze Fidesi, Meyve Fidanı Vb. Yetiştirilmesi; 013090 Dikim İçin Çiçek Ve Diğer Bitkilerin Yetiştirilmesi (Dekoratif Amaçlarla Bitki Ve Çim Yetiştirilmesi Dahil, Sebze Fidesi, Meyve Fidanı Hariç); 016103 Bitkisel Üretimi Destekleyici Tarımsal Amaçlı Sulama Faaliyetleri; 016104 Bitkisel Üretimi Destekleyici İlaçlama Ve Zirai Mücadele Faaliyetleri (Zararlı Otların İmhası Dahil, Hava Yoluyla Yapılanlar Hariç); 016106 Hava Yoluyla Yapılan Bitkisel Üretimi Destekleyici Gübreleme, İlaçlama Ve Zirai Mücadele Faaliyetleri (Zararlı Otların İmhası Dahil); 016301 Hasat Sonrası Diğer Ürünlerin Ayıklanması Ve Temizlenmesi İle İlgili Faaliyetler (Pamuğun Çırçırlanması Ve Nişastalı Kök Ürünleri Hariç); 016302 Sert Kabuklu Ürünlerin Kabuklarının Kırılması Ve Temizlenmesi İle İlgili Faaliyetler … (+14 kod)

**Belge seçimi:** Bitkisel ürün tüccarı / hizmet sağlayıcı çiftçiden hububat alımında e-Müstahsil (%2 stopaj, borsa tescil, Bağ-Kur) düzenler; biçerdöver / ilaçlama gibi tarımsal hizmetleri çiftçiye e-Arşiv ile faturalar.

- **Çiftçiden Hububat Alımı e-Müstahsil** (`meslek-d06-ciftciden-hububat-alimi-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *teknik*): Üreticiden buğday ve arpa alımı; kalite analiz değerleri ürün açıklamasında, borsa tescilli.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %2 (zirai ürün), 8001 borsa tescil %0,2, SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

- **Biçerdöver Hasat Hizmeti e-Arşiv** (`meslek-d06-bicerdover-hasat-hizmeti-e-arsiv`, e-Arşiv Fatura, yerleşim *endustri*): Çiftçiye dekar bazında biçerdöver ile hasat ve balya hizmeti.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### D.07 Börekçilik

NACE: 561107 Börekçilerin Faaliyetleri (İmalatçıların Faaliyetleri İle Seyyar Olanlar Hariç)

**Belge seçimi:** Börekçi tüketiciye e-Arşiv düzenler; ofis / kafe / kantinlere tepsi siparişlerinde alıcı e-Fatura mükellefi olduğundan e-Fatura kullanılır. Unlu mamullerde KDV %10.

- **Börek Salonu Satışı e-Arşiv** (`meslek-d07-borek-salonu-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Salonda ve paket servis börek satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Ofise Tepsi Börek e-Faturası** (`meslek-d07-ofise-tepsi-borek-e-faturasi`, e-Fatura, yerleşim *pastel*): Şirket toplantısı için tepsi börek ve poğaça siparişi; teslim saati açıklamada.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### D.08 Çeşitli Gıdaların İmalatı

NACE: 103101 Patatesin İşlenmesi Ve Saklanması (Dondurulmuş, Kurutulmuş, Suyu Çıkartılmış, Ezilmiş Patates İmalatı) (Soyulması Dahil); 103102 Patates Cipsi, Patates Çerezi, Patates Unu Ve Kaba Unlarının İmalatı; 103901 Sebze Ve Meyve Konservesi İmalatı (Salça, Domates Püresi Dahil, Patatesten Olanlar Hariç); 103902 Kavrulmuş, Tuzlanmış Vb. Şekilde İşlem Görmüş Sert Kabuklu Yemişler İle Bu Meyvelerin Püre Ve Ezmelerinin İmalatı (Pişirilerek Yapılanlar); 103903 Meyve Ve Sebzelerden Jöle, Pekmez, Marmelat, Reçel Vb. İmalatı (Pestil İmalatı Dahil); 103904 Tuzlu Su, Sirke, Sirkeli Su, Yağ Veya Diğer Koruyucu Çözeltilerle Korunarak Saklanan Sebze Ve Meyvelerin İmalatı (Turşu, Salamura Yaprak, Sofralık Zeytin Vb. Dahil); 103905 Dondurulmuş Veya Kurutulmuş Meyve Ve Sebzelerin İmalatı; 103907 Susamın İşlenmesi Ve Tahin İmalatı … (+12 kod)

**Belge seçimi:** Gıda imalatçısı market zincirlerine e-Fatura + e-İrsaliye ile satış yapar, Irak ve körfez ülkelerine ihracatını IHRACAT profiliyle (gümrük muhataplı, GTİP’li) faturalar. Parti no ve son tüketim tarihi satır ek alanlarıdır.

- **Market Zincirine Gıda Satış e-Faturası** (`meslek-d08-market-zincirine-gida-satis-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Salça ve turşu ürünlerinin market zinciri deposuna satışı; parti ve STT bilgisi satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Salça İhracat Faturası (DAP)** (`meslek-d08-salca-ihracat-faturasi-dap`, e-Fatura (İhracat), yerleşim *serit*): Irak’taki distribütöre tır ile salça ve konserve ihracatı.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (DAP), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz USD + PricingExchangeRate.

### D.09 Değirmencilik, Zahirecilik

NACE: 106101 Kahvaltılık Tahıl Ürünleri İle Diğer Taneli Tahıl Ürünlerinin İmalatı; 106102 Tahılların Öğütülmesi Ve Un İmalatı; 106105 Pirinç, Pirinç Ezmesi Ve Pirinç Unu İmalatı (Çeltik Fabrikası Ve Ürünleri Dahil); 106106 İrmik İmalatı; 106107 Ön Pişirme Yapılmış Veya Başka Şekilde Hazırlanmış Tane Halde Hububat İmalatı (Bulgur Dahil, Mısır Hariç); 106108 Sebzelerin Ve Baklagillerin Öğütülmesi Ve Sebze Unu İle Ezmelerinin İmalatı (Karışımları İle Hazır Karıştırılmış Sebze Unları Dahil) (Pişirilerek Yapılanlar Hariç); 106190 Dövülmüş Diğer Tahıl Ürünlerinin İmalatı (Bulgur Ve İrmik Hariç); 106201 Nişasta İmalatı (Buğday, Pirinç, Patates, Mısır, Manyok Vb. Ürünlerden) … (+8 kod)

**Belge seçimi:** Değirmenci / zahireci çiftçiden hububat alımını e-Müstahsil (%2, borsa tescil) ile; ürettiği unu fırınlara e-Fatura ile (un KDV %1) satar. Kepek ve yem ürünleri farklı KDV oranındadır.

- **Çiftçiden Buğday Alımı e-Müstahsil** (`meslek-d09-ciftciden-bugday-alimi-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *defter*): Kantar tartımı ile üreticiden buğday alımı; borsa tescil ve Bağ-Kur kesintili.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %2 (zirai ürün), 8001 borsa tescil %0,2, SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

- **Fırına Un Satış e-Faturası** (`meslek-d09-firina-un-satis-e-faturasi`, e-Fatura, yerleşim *endustri*): Fırınlara çuvallık ekmeklik un ve kepek satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### D.10 Dondurmacılık

NACE: 105201 Dondurma İmalatı (Sade, Sebzeli, Meyveli Vb.); 105202 Şerbetli Diğer Yenilebilen Buzlu Gıdaların İmalatı; 463304 Dondurma Ve Diğer Yenilebilir Buzların Toptan Ticareti; 472702 Dondurma, Aromalı Yenilebilir Buzlar Vb. Perakende Ticareti (Pastanelerde Verilen Hizmetler Hariç); 561110 Dondurmacıların Faaliyetleri (İmalatçıların Faaliyetleri İle Seyyar Olanlar Hariç)

**Belge seçimi:** Dondurmacı tüketiciye külah / kilo satışında e-Arşiv düzenler; kafe ve restoranlara toptan dondurma satışında e-Fatura kullanır (soğuk zincir için irsaliye tercih edilir).

- **Dondurma Satışı e-Arşiv** (`meslek-d10-dondurma-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Dükkandan külah ve kilo dondurma satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Restorana Toptan Dondurma e-Faturası** (`meslek-d10-restorana-toptan-dondurma-e-faturasi`, e-Fatura, yerleşim *kart*): Restoranlara kova ambalajlı dondurma satışı; parti ve üretim tarihi.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### D.11 Evcil Hayvan Bakımı, Ticareti

NACE: 014803 Evcil Hayvanların Yetiştirilmesi Ve Üretilmesi (Balık Hariç) (Kedi, Köpek, Kuşlar, Hamsterler Vb.); 109101 Çiftlik Hayvanları İçin Hazır Yem İmalatı; 109201 Ev Hayvanları İçin Hazır Gıda İmalatı (Kedi Ve Köpek Mamaları, Kuş Ve Balık Yemleri Vb.); 462101 Hayvan Yemi Toptan Ticareti; 463802 Ev Hayvanları İçin Yemlerin Veya Yiyeceklerin Toptan Ticareti (Çiftlik Hayvanları İçin Olanlar Hariç); 477601 Ev Hayvanları, Bunların Mama Ve Gıdaları İle Eşyalarının Perakende Ticareti; 969904 Ev Hayvanları Ve Terk Edilmiş Hayvanlar İçin Bakım Hizmetleri

**Belge seçimi:** Pet shop tüketiciye mama, aksesuar ve bakım hizmetini e-Arşiv ile; veteriner kliniklerine toptan mama satışını e-Fatura ile düzenler. Hayvanın çip numarası bakım hizmeti satırında belirtilebilir.

- **Mama ve Bakım Hizmeti e-Arşiv** (`meslek-d11-mama-ve-bakim-hizmeti-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Kedi maması, kum ve tıraş-banyo bakım hizmeti; hayvanın çip no ek alanda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Veteriner Kliniğine Mama e-Faturası** (`meslek-d11-veteriner-klinigine-mama-e-faturasi`, e-Fatura, yerleşim *kenar*): Veteriner kliniğine reçeteli diyet maması toptan satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### D.12 Fırıncılık

NACE: 106109 Fırıncılık Ürünlerinin İmalatında Kullanılan Hamur Ve Un Karışımlarının İmalatı (Sebze Un Karışımları Hariç); 107102 Ekmek İmalatı (Sade Pide Dahil); 107104 Simit İmalatı; 463602 Fırıncılık Mamullerinin Toptan Ticareti; 472401 Ekmek, Pasta Ve Unlu Mamullerin Perakende Ticareti; 561104 Oturacak Yeri Olmayan İçli Pide Ve Lahmacun Fırınlarının Faaliyetleri (Al Götür Tesisi Olarak Hizmet Verenler)

**Belge seçimi:** Fırın tüketiciye e-Arşiv düzenler; restoran, kantin ve marketlere günlük ekmek teslimini aylık e-Fatura ile (ekmek KDV %1) faturalar. Dönemsel teslimlerde InvoicePeriod kullanılır.

- **Fırın Satışı e-Arşiv** (`meslek-d12-firin-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Tüketiciye ekmek, pide ve simit satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Lokantaya Aylık Ekmek e-Faturası** (`meslek-d12-lokantaya-aylik-ekmek-e-faturasi`, e-Fatura, yerleşim *defter*): Lokantaya ay boyu her sabah teslim edilen ekmeğin toplu faturası; dönem ve teslim fişleri.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### D.13 Gübre, Zirai İlaç İmalatı, Ticareti

NACE: 201501 Fosfatlı Veya Potasyumlu Gübreler, İki (Azot Ve Fosfor Veya Fosfor Ve Potasyum) Veya Üç Besin Maddesi (Azot, Fosfor Ve Potasyum) İçeren Gübreler, Sodyum Nitrat İle Diğer Kimyasal Ve Mineral Gübrelerin İmalatı; 201502 Bileşik Azotlu Ürünlerin İmalatı (Gübreler Hariç); 202013 Çimlenmeyi Önleyici Ve Bitki Gelişimini Düzenleyici Ürün İmalatı; 202090 Diğer Zirai Kimyasal Ürünlerin İmalatı (Gübre Ve Azotlu Bileşik İmalatı Hariç); 468502 Suni Gübrelerin Toptan Ticareti (Gübre Mineralleri, Gübre Ve Azot Bileşikleri Ve Turba İle Amonyum Sülfat, Amonyum Nitrat, Sodyum Nitrat, Potasyum Nitrat Vb. Dahil, Nitrik Asit, Sülfonitrik Asit Ve Amonyak Hariç); 468503 Zirai Kimyasal Ürünlerin Toptan Ticareti (Haşere İlaçları, Yabancı Ot İlaçları, Dezenfektanlar, Mantar İlaçları, Çimlenmeyi Önleyici Ürünler, Bitki Gelişimini Düzenleyiciler Ve Diğer Zirai Kimyasal Ürünler); 468504 Hayvansal Veya Bitkisel Gübrelerin Toptan Ticareti (Kapalı Alanda Yapılan Ticaret); 468505 Hayvansal Veya Bitkisel Gübrelerin Toptan Ticareti (Açık Alanda Yapılan Ticaret) … (+1 kod)

**Belge seçimi:** Gübre ve zirai ilaç bayii çiftçiye satışta e-Arşiv düzenler; zirai ilaçlar ziraat mühendisi reçetesiyle satılır (reçete no belge referansı). Kooperatif ve tarım işletmelerine e-Fatura kullanılır. Gübre teslimlerinde KDV oranı %0 (istisna dışı, kod 351) — güncel oran kontrol edilmelidir.

- **Çiftçiye Reçeteli Zirai İlaç Satışı e-Arşiv** (`meslek-d13-ciftciye-receteli-zirai-ilac-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Bağ hastalığı için reçeteli fungisit ve yaprak gübresi satışı; reçete no zorunlu.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Kooperatife Gübre Satış e-Faturası** (`meslek-d13-kooperatife-gubre-satis-e-faturasi`, e-Fatura, yerleşim *endustri*): Tarım kredi kooperatifine çuvallık kimyevi gübre toptan satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### D.14 Kantincilik

NACE: 562201 Kantinlerin Faaliyetleri

**Belge seçimi:** Kantinci öğrencilere / çalışanlara perakende satışta e-Arşiv düzenler; işyerine personel yemeği verdiğinde yemek servis hizmeti belirlenmiş alıcılarda 604 (5/10) tevkifatına tabidir.

- **Kantin Satışı e-Arşiv** (`meslek-d14-kantin-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Kantinden tost, simit ve içecek satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Fabrikaya Personel Yemeği (Tevkifat 604)** (`meslek-d14-fabrikaya-personel-yemegi-tevkifat-604`, e-Fatura, yerleşim *kurumsal*): Fabrika personeline öğle yemeği servisi; aylık öğün sayısı üzerinden, 5/10 KDV tevkifatı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 604, Percent 50 (5/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### D.15 Kasaplık

NACE: 101101 Etin İşlenmesi Ve Saklanması (Mezbahacılık) (Kümes Hayvanlarının Eti Hariç); 101201 Kümes Hayvanları Etlerinin Üretimi (Taze Veya Dondurulmuş) (Yenilebilir Sakatatları Dahil); 101202 Kümes Hayvanlarının Kesilmesi, Temizlenmesi Veya Paketlenmesi İşi İle Uğraşan Mezbahaların Faaliyetleri; 101301 Et Ve Kümes Hayvanları Etlerinden Üretilen Pişmemiş Köfte Vb. Ürünlerin İmalatı; 101302 Et Ve Kümes Hayvanları Etlerinden Üretilen Sosis, Salam, Sucuk, Pastırma, Kavurma Et, Konserve Et, Salamura Et, Jambon Vb. Tuzlanmış, Kurutulmuş Veya Tütsülenmiş Ürünlerin İmalatı (Yemek Olanlar Hariç); 101303 Et Ve Sakatat Unları İmalatı (Et Ve Kümes Hayvanları Etlerinden Üretilen); 101304 Sığır, Koyun, Keçi Vb. Hayvanların Sakatat Ve Yağlarından Yenilebilir Ürünlerin İmalatı; 329999 Başka Yerde Sınıflandırılmamış Diğer İmalatlar (Bağırsak (İpek Böceği Guddesi Hariç), Kursak Ve Mesaneden Mamul Eşyalar Dahil, Tıbbi Amaçlı Steril Olanlar Hariç) … (+7 kod)

**Belge seçimi:** Kasap tüketiciye et satışında e-Arşiv (kırmızı et KDV %1), restoran / otellere e-Fatura düzenler; çiftçiden kurbanlık veya kesimlik hayvan alımında e-Müstahsil (hayvan %1 stopaj) kullanılır.

- **Et Satışı e-Arşiv** (`meslek-d15-et-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Tüketiciye kıyma, kuşbaşı ve sucuk satışı; et %1, işlenmiş ürün %10.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Restorana Et Teslimi e-Faturası** (`meslek-d15-restorana-et-teslimi-e-faturasi`, e-Fatura, yerleşim *endustri*): Kebap restoranına haftalık et teslimi; kesim tarihi ve parti no satır etiketinde.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Çiftçiden Kesimlik Hayvan e-Müstahsil** (`meslek-d15-ciftciden-kesimlik-hayvan-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *defter*): Üreticiden kesimlik koç ve dana alımı; küpe no ve %1 stopaj.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %1 (hayvan / hayvansal ürün), SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

### D.16 Kuruyemiş İmalatı, Ticareti

NACE: 103906 Leblebi İmalatı İle Kavrulmuş Çekirdek, Yerfıstığı Vb. Üretimi (Sert Kabuklular Hariç); 463101 Fındık, Antep Fıstığı, Yer Fıstığı Ve Ceviz Toptan Ticareti (Kavrulmuş Olanlar Hariç); 463109 Kavrulmuş Veya İşlenmiş Kuru Yemiş Toptan Ticareti (Leblebi, Kavrulmuş Fındık, Fıstık, Çekirdek Vb.); 463110 Kuru Üzüm Toptan Ticareti; 463111 Kuru İncir Toptan Ticareti; 463112 Kuru Kayısı Toptan Ticareti; 472105 Kuru Yemiş Perakende Ticareti

**Belge seçimi:** Kuruyemişçi online satışlarda e-Arşiv internet satışı alanlarını kullanır; bahçe sahibinden Antep fıstığı / fındık alımında e-Müstahsil (bitkisel %2 stopaj, borsa tescil) düzenler.

- **Online Kuruyemiş Satışı e-Arşiv** (`meslek-d16-online-kuruyemis-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *modern*): Web sitesinden kuruyemiş paketi siparişi; kargo ve ödeme aracısı bilgisi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.

- **Bahçeden Antep Fıstığı Alımı e-Müstahsil** (`meslek-d16-bahceden-antep-fistigi-alimi-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *zarif*): Üreticiden kabuklu Antep fıstığı alımı; borsa tescil, %2 stopaj ve Bağ-Kur kesintisi.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %2 (zirai ürün), 8001 borsa tescil %0,2, SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

### D.17 Lokantacılık

NACE: 561101 Genel Lokanta Ve Restoranların (İçkili Ve İçkisiz) Faaliyetleri; 561102 Çorbacıların Ve İşkembecilerin Faaliyetleri (İmalatçıların Faaliyetleri İle Seyyar Olanlar Hariç); 561103 Döner, Ciğer, Kokoreç, Köfte Ve Kebapçıların Faaliyeti (Garson Servisi Sunanlar İle Self Servis Sunanlar Dahil; İmalatçıların Ve Al Götür Tesislerin Faaliyetleri İle Seyyar Olanlar Hariç); 561105 Pizzacıların Faaliyeti (Garson Servisi Sunanlar İle Self Servis Sunanlar Dahil; İmalatçıların Ve Al Götür Tesislerin Faaliyetleri İle Seyyar Olanlar Hariç); 561106 Mantıcı Ve Gözlemecilerin Faaliyeti (Garson Servisi Sunanlar İle Self Servis Sunanlar Dahil; İmalatçıların Ve Al Götür Tesislerinin Faaliyetleri İle Seyyar Olanlar Hariç); 561109 Yiyecek Ağırlıklı Hizmet Veren Kafe Ve Kafeteryaların Faaliyetleri; 561111 Oturacak Yeri Olan Fast-Food (Hamburger, Sandviç, Tost Vb.) Satış Yerleri (Büfeler Dahil) Tarafından Sağlanan Yemek Hazırlama Ve Sunum Faaliyetleri; 561113 Lahmacun Ve Pidecilik (İçli Pide (Kıymalı, Peynirli Vb.)) Faaliyeti (Garson Servisi Sunanlar İle Self Servis Sunanlar Dahil; İmalatçıların Ve Al Götür Tesislerin Faaliyetleri İle Seyyar Olanlar Hariç) … (+4 kod)

**Belge seçimi:** Lokanta masa hesabını e-Arşiv ile (yemek KDV %10) düzenler; şirketlere toplu yemek / catering hizmetinde belirlenmiş alıcılara 604 (5/10) KDV tevkifatı uygulanır.

- **Masa Adisyonu e-Arşiv** (`meslek-d17-masa-adisyonu-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Restoranda 4 kişilik masa hesabı; servis ücreti ayrı satır.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Şirkete Toplu Yemek (Tevkifat 604)** (`meslek-d17-sirkete-toplu-yemek-tevkifat-604`, e-Fatura, yerleşim *kurumsal*): Ofise günlük tabldot yemek servisi; aylık öğün sayısı, 5/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 604, Percent 50 (5/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### D.18 Manavlık

NACE: 472101 Taze Sebze Ve Meyve Perakende Ticareti (Manav Ürünleri İle Kültür Mantarı Dahil)

**Belge seçimi:** Manav tüketiciye e-Arşiv (taze meyve-sebze KDV %1) düzenler; restoranlara toptan satışta Hal Kayıt Sistemi künyesiyle HKS profilli e-Fatura (HKSSATIS) kullanması gerekir.

- **Manav Satışı e-Arşiv** (`meslek-d18-manav-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Tüketiciye taze meyve ve sebze satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Restorana Sebze-Meyve HKS e-Faturası** (`meslek-d18-restorana-sebze-meyve-hks-e-faturasi`, e-Fatura, yerleşim *endustri*): Restorana toptan sebze-meyve satışı; satırlarda hal künye no ve mal sahibi bilgisi.
  - ProfileID HKS, InvoiceTypeCode HKSSATIS; her satırda AdditionalItemIdentification KUNYENO (Hal Kayıt Sistemi künye no), MALSAHIBIADSOYADUNVAN ve MALSAHIBIVKNTCKN.

### D.19 Meşrubat İmalatı, Ticareti

NACE: 103201 Katkısız Sebze Ve Meyve Suları İmalatı; 103202 Konsantre Meyve Ve Sebze Suyu İmalatı; 105104 Süt Temelli Hafif İçeceklerin İmalatı (Kefir, Salep Vb.); 110101 Damıtılmış Alkollü İçeceklerin İmalatı (Viski, Brendi, Cin, Likör, Rakı, Votka, Kanyak Vb.); 110103 Etil Alkol Üretimi (Doğal Özellikleri Değiştirilmemiş/Tağyir Edilmemiş, Alkol Derecesi; 110201 Üzümden Şarap, Köpüklü Şarap, Şampanya Vb. İmalatı; 110202 Üzüm Şırası İmalatı; 110301 Elma Şarabı Ve Diğer Fermente Meyve İçeceklerinin İmalatı … (+8 kod)

**Belge seçimi:** Meşrubat dağıtıcısı market ve büfelere e-Fatura + e-İrsaliye ile satış yapar. Kolalı gazozlar ÖTV (III) sayılı liste kapsamındadır: TaxTypeCode 0073 satır vergisi KDV matrahına dahil edilir; su ve meyve suyu ÖTV dışıdır.

- **Bayiye Meşrubat Satış e-Faturası (ÖTV)** (`meslek-d19-bayiye-mesrubat-satis-e-faturasi-otv`, e-Fatura, yerleşim *serit*): Büfe ve marketlere kolalı gazoz, su ve meyve suyu satışı; kolalı ürünlerde ÖTV satırı.
  - ÖTV satır vergisi (TaxTypeCode 0071 I. liste / 9077 II. liste taşıtlar / 0073 III. liste / 0074 IV. liste) KDV matrahına dahil edilir; maktu ÖTV için PerUnitAmount, nispi için Percent kullanılır.

- **Dağıtım Aracı Sevk İrsaliyesi** (`meslek-d19-dagitim-araci-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Depodan market zincirine palet bazında meşrubat sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### D.20 Pastanecilik, Tatlıcılık

NACE: 107101 Taze Pastane Ürünleri İmalatı (Yaş Pasta, Kuru Pasta, Poğaça, Kek, Börek, Pay, Turta, Waffles Vb.); 107103 Hamur Tatlıları İmalatı (Tatlandırılmış Kadayıf, Lokma Tatlısı, Baklava Vb.); 107201 Peksimet, Bisküvi, Gofret, Dondurma Külahı, Kağıt Helva Vb. Ürünlerin İmalatı (Çikolata Kaplı Olanlar Dahil); 107202 Tatlı Veya Tuzlu Hafif Dayanıklı Fırın Ve Pastane Ürünlerinin İmalatı (Kurabiyeler, Krakerler, Galeta, Gevrek Halkalar Vb.); 561108 Pastanelerin Ve Tatlıcıların (Sütlü, Şerbetli Vb.) Faaliyeti (Garson Servisi Sunanlar İle Self Servis Sunanlar Dahil; İmalatçıların Ve Al Götür Tesislerin Faaliyetleri İle Seyyar Olanlar Hariç); 563008 Boza, Şalgam Ve Salep Sunum Faaliyeti

**Belge seçimi:** Pastane tüketiciye e-Arşiv; kafe ve otellere düzenli pasta / tatlı tedarikinde e-Fatura düzenler. Unlu mamul ve tatlılarda KDV %10.

- **Özel Gün Pastası e-Arşiv** (`meslek-d20-ozel-gun-pastasi-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Kişiye özel doğum günü pastası siparişi; kapora ve teslim tarihi açıklamada.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Kafeye Tatlı Tedarik e-Faturası** (`meslek-d20-kafeye-tatli-tedarik-e-faturasi`, e-Fatura, yerleşim *zarif*): Kafe zincirine haftalık cheesecake ve brownie tedariki.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### D.21 Şarküteri Ürünleri İmalatı, Ticareti

NACE: 101203 Kümes Hayvanlarının Yağlarının Sofra Yağına Çevrilmesi; 104101 Ayçiçek Yağı İmalatı; 104102 Bitkisel Sıvı Yağ (Yenilebilen) İmalatı (Soya, Susam, Haşhaş, Pamuk, Fındık, Kolza, Hardal Vb. Yağlar) (Zeytin Yağı, Ayçiçeği Yağı Ve Mısır Yağı Hariç); 104103 Bezir Yağı (Keten Tohumu Yağı, Keten Yağı) İmalatı; 104105 Prina Yağı İmalatı (Diğer Küspelerden Elde Edilen Yağlar Dahil) (Mısır Yağı Hariç); 104106 Kakao Yağı, Badem Yağı, Kekik Yağı, Defne Yağı, Hurma Çekirdeği Veya Babassu Yağı, Hint Yağı, Tung Yağı Ve Diğer Benzer Yağların İmalatı (Bezir Yağı Hariç); 104107 Zeytinyağı İmalatı (Saf, Sızma, Rafine); 104110 Balık Ve Deniz Memelilerinden Yağ Elde Edilmesi … (+14 kod)

**Belge seçimi:** Şarküteri tüketiciye e-Arşiv, otel ve kafelere e-Fatura düzenler; köylü üreticiden peynir / tereyağı alımında e-Müstahsil (hayvansal ürün %1 stopaj) kullanılır.

- **Şarküteri Satışı e-Arşiv** (`meslek-d21-sarkuteri-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Tüketiciye peynir, zeytin, pastırma satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Otele Kahvaltılık e-Faturası** (`meslek-d21-otele-kahvaltilik-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Otelin kahvaltı büfesi için toplu peynir, zeytin ve reçel teslimi.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Köylüden Peynir Alımı e-Müstahsil** (`meslek-d21-koyluden-peynir-alimi-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *defter*): Köydeki üreticiden tam yağlı peynir ve tereyağı alımı; %1 stopaj.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %1 (hayvan / hayvansal ürün), SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

### D.22 Şekercilik, Çikolatacılık

NACE: 108103 Akçaağaç Şurubu İmalatı; 108201 Çikolata Ve Kakao İçeren Şekerlemelerin İmalatı (Beyaz Çikolata Ve Sürülerek Yenebilen Kakaolu Ürünler Hariç); 108202 Şekerlemelerin Ve Şeker Pastillerinin İmalatı (Bonbon Şekeri Vb.) (Kakaolu Şekerlemeler Hariç); 108203 Sürülerek Yenebilen Kakaolu Ürünlerin İmalatı; 108204 Lokum, Pişmaniye, Helva, Karamel, Koz Helva, Fondan, Beyaz Çikolata Vb. İmalatı (Tahin Helvası Dahil); 108205 Ciklet İmalatı (Sakız); 108206 Sert Kabuklu Yemiş, Meyve, Meyve Kabuğu Ve Diğer Bitki Parçalarından Şekerleme İmalatı (Meyan Kökü Hülasaları Dahil); 108207 Kakao Tozu, Kakao Ezmesi/Hamuru Ve Kakao Yağı İmalatı … (+2 kod)

**Belge seçimi:** Şekerci tüketiciye e-Arşiv (bayram kutuları), yurt dışı distribütörlere lokum ihracatını IHRACAT profiliyle (GTİP 1704) faturalar.

- **Bayram Şekeri Satışı e-Arşiv** (`meslek-d22-bayram-sekeri-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Mağazadan bayram için lokum ve çikolata kutuları satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Lokum İhracat Faturası (CIF)** (`meslek-d22-lokum-ihracat-faturasi-cif`, e-Fatura (İhracat), yerleşim *serit*): Dubai’deki distribütöre hava kargo ile lokum ve çikolata ihracatı.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (CIF), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz USD + PricingExchangeRate.

### D.23 Tavukçuluk

NACE: 014701 Kümes Hayvanlarının Yetiştirilmesi (Tavuk, Hindi, Ördek, Kaz Ve Beç Tavuğu Vb.); 014702 Kuluçkahanelerin Faaliyetleri; 014703 Kümes Hayvanlarından Yumurta Üretilmesi; 014899 Başka Yerde Sınıflandırılmamış Diğer Hayvan Yetiştiriciliği; 101204 Kuş Tüyü Ve İnce Kuş Tüyü İmalatı (Derileri Dahil); 461102 Canlı Hayvanların Bir Ücret Veya Sözleşmeye Dayalı Olarak Toptan Satışını Yapan Aracılar; 462302 Canlı Kümes Hayvanları Toptan Ticareti; 477605 Canlı Kümes Hayvanlarının Perakende Ticareti

**Belge seçimi:** Tavukçuluk işletmesi restoran ve marketlere piliç eti satışında e-Fatura (KDV %1, kesim / parti bilgisi), sözleşmeli yetiştiriciden canlı piliç alımında e-Müstahsil (hayvan %1 stopaj) düzenler.

- **Restorana Piliç Eti e-Faturası** (`meslek-d23-restorana-pilic-eti-e-faturasi`, e-Fatura, yerleşim *endustri*): Tavuk döner zincirine but ve göğüs eti satışı; kesim tarihi ve parti numaralı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Yetiştiriciden Canlı Piliç e-Müstahsil** (`meslek-d23-yetistiriciden-canli-pilic-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *teknik*): Sözleşmeli kümesten canlı piliç alımı; canlı ağırlık, kümes no ve %1 stopaj.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %1 (hayvan / hayvansal ürün), SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

### D.24 Yaş Sebze, Meyve Ticareti

NACE: 103999 Başka Yerde Sınıflandırılmamış Meyve Ve Sebzelerin Başka Yöntemlerle İşlenmesi Ve Saklanması (Kesilmiş Ve Paketlenmiş Olanlar Dahil); 461702 Yaş Sebze Ve Meyvelerin Toptan Satışı İle İlgili Aracıların Faaliyetleri (Kabzımallık Ve Aracı Üretici Birlikleri Dahil); 463102 Taze İncir Ve Üzüm Toptan Ticareti; 463103 Narenciye Toptan Ticareti; 463104 Diğer Taze Meyve Sebze Toptan Ticareti (Patates Dahil); 463106 Kültür Mantarı Toptan Ticareti; 463190 Diğer İşlenmiş Veya Korunmuş Sebze Ve Meyve Toptan Ticareti (Reçel, Pekmez, Pestil, Salamura Veya Turşusu Yapılmış Olanlar Dahil) (Fındık, İncir, Üzüm, Narenciye, Zeytin, Kültür Mantarı Ve Kuru Yemiş Hariç)

**Belge seçimi:** Hal komisyoncusu üreticinin malını onun adına satar: alıcıya HKS profilli e-Fatura (HKSKOMISYONCU), sevkiyatta HKSIRSALIYE, üreticiye satış bedeli için e-Müstahsil Makbuzu düzenler. Tüm belgelerde hal künye numarası yer alır.

- **Komisyoncu Satış e-Faturası (HKS)** (`meslek-d24-komisyoncu-satis-e-faturasi-hks`, e-Fatura, yerleşim *endustri*): Üretici adına market zincirine domates ve biber satışı; her satırda künye no ve mal sahibi.
  - ProfileID HKS, InvoiceTypeCode HKSKOMISYONCU; her satırda AdditionalItemIdentification KUNYENO (Hal Kayıt Sistemi künye no), MALSAHIBIADSOYADUNVAN ve MALSAHIBIVKNTCKN.

- **Hal Sevk İrsaliyesi (HKS)** (`meslek-d24-hal-sevk-irsaliyesi-hks`, e-İrsaliye, yerleşim *teknik*): Halden market deposuna künyeli sebze sevki.
  - ProfileID HKSIRSALIYE; satırlarda KUNYENO (Hal Kayıt Sistemi künyesi).
  - DespatchAdvice: Shipment/ShipmentStage plaka + şoför, Delivery/Despatch fiili sevk tarih-saat zorunlu.

- **Üreticiye Satış Bedeli e-Müstahsil** (`meslek-d24-ureticiye-satis-bedeli-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *defter*): Komisyoncunun sattığı ürünlerin bedelini üreticiye öderken düzenlediği müstahsil makbuzu.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %2 (zirai ürün), SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

### D.25 Yufkacılık, Kadayıfçılık

NACE: 107203 Tatlandırılmamış Dayanıklı Hamur Tatlıları İmalatı (Pişirilmiş Olsun Olmasın Tatlandırılmamış Kadayıf, Baklava Vb.) (Yufka İmalatı Dahil)

**Belge seçimi:** Yufkacı tüketiciye e-Arşiv düzenler (yufka %1); baklava ve kadayıf tatlıcılarına toptan yufka / tel kadayıf satışı e-Fatura ile yapılır.

- **Yufka Satışı e-Arşiv** (`meslek-d25-yufka-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Tüketiciye el açması yufka ve tel kadayıf satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Tatlıcıya Toptan Yufka e-Faturası** (`meslek-d25-tatliciya-toptan-yufka-e-faturasi`, e-Fatura, yerleşim *kenar*): Baklava imalathanesine haftalık baklavalık yufka ve kadayıf teslimi.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### E.01 Ayakkabıcılık

NACE: 152006 Ayakkabı Ve Terliklerin Kauçuk Parçalarının İmalatı; 152007 Ayakkabı Ve Terliklerin Plastik Parçalarının İmalatı; 152015 Deriden Ayakkabı, Mes, Bot, Çizme, Postal, Terlik, Vb. İmalatı (Ortopedik Ayakkabı Ve Kayak Ayakkabısı Hariç); 152017 Plastik Veya Kauçuktan Ayakkabı, Bot, Çizme, Postal, Terlik, Vb. İmalatı (Ortopedik Ayakkabı Ve Kayak Ayakkabısı Hariç); 152018 Tekstilden Ve Diğer Malzemelerden Ayakkabı, Mes, Bot, Çizme, Postal, Terlik, Vb. İmalatı (Tamamıyla Tekstilden Olanlar İle Ortopedik Ayakkabı Ve Kayak Ayakkabısı Hariç); 152019 Ayakkabı Ve Terliklerin Deri Parçalarının İmalatı İle Sayacılık Faaliyetleri; 464202 Ayakkabı Toptan Ticareti (Spor Ayakkabıları Hariç); 464208 Ayakkabı Malzemeleri Toptan Ticareti … (+5 kod)

**Belge seçimi:** Ayakkabıcı mağazada tüketiciye e-Arşiv (numara / renk satırda) düzenler; markalara yaptığı fason saya dikim işlerinde 609 kodlu (çanta ve ayakkabı dikim işleri) 7/10 KDV tevkifatlı e-Fatura keser.

- **Ayakkabı Satışı e-Arşiv** (`meslek-e01-ayakkabi-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Mağazadan tüketiciye ayakkabı satışı; numara ve renk satır etiketlerinde.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Fason Saya Dikim Faturası (Tevkifat 609)** (`meslek-e01-fason-saya-dikim-faturasi-tevkifat-609`, e-Fatura, yerleşim *teknik*): Ayakkabı markasının kesilmiş saya parçalarının fason dikimi; 7/10 KDV tevkifatı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 609, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### E.02 Çamaşırhane, Kuru Temizleme, Ütücülük Hizmetleri

NACE: 961001 Giyim Eşyası Ve Diğer Tekstil Ürünlerini Ütüleme Hizmetleri; 961002 Çamaşırhane Hizmetleri; 961003 Kuru Temizleme Hizmetleri

**Belge seçimi:** Kuru temizlemeci bireysel müşterilere e-Arşiv düzenler; otel ve restoranlara toplu çamaşır yıkama hizmetini dönemsel e-Fatura ile faturalar (çamaşır yıkama 612 temizlik hizmeti kapsamında değildir).

- **Kuru Temizleme e-Arşiv** (`meslek-e02-kuru-temizleme-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Takım elbise, mont ve perde kuru temizleme; teslim fiş numarası belge alanında.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Otel Çamaşır Hizmeti e-Faturası** (`meslek-e02-otel-camasir-hizmeti-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Butik otelin çarşaf ve havlularının aylık yıkama-ütü hizmeti.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### E.03 Deri Aksesuar İmalatı, Ticareti

NACE: 151207 Deri, Kösele, Karma Deri Ve Diğer Malzemelerden Bavul Ve Çanta, Deriden Sigaralık, Deri Ayakkabı Bağı, Kişisel Bakım, Dikiş Vb. Amaçlı Seyahat Seti Vb. Ürünlerin İmalatı; 151208 Deriden Veya Diğer Malzemelerden Saraçlık Ve Koşum Takımı İmalatı (Kamçı, Semer, Eyer, Tasma Kayışı, Heybe Vb.); 151209 Deri Saat Kayışı İmalatı; 461602 Deri Eşyalar Ve Seyahat Aksesuarlarının Bir Ücret Veya Sözleşmeye Dayalı Olarak Toptan Satışını Yapan Aracılar; 464901 Deri Eşyalar Ve Seyahat Aksesuarları Toptan Ticareti; 477202 Bavul, El Çantası Ve Diğer Seyahat Aksesuarlarının Perakende Ticareti (Deriden, Deri Bileşimlerinden, Plastik Levhadan, Tekstil Malzemesinden, Vulkanize (Ebonit) Elyaf Veya Mukavvadan); 477205 Saraciye Ürünleri Ve Koşum Takımı Perakende Ticareti (Eyer, Semer, Vb.); 477290 Deriden Veya Deri Bileşimlerinden Diğer Ürünlerin Perakende Ticareti (Deri Veya Deri Bileşimli Giyim Eşyası Hariç)

**Belge seçimi:** Deri aksesuar satıcısı online satışlarda e-Arşiv internet satışı, turist satışlarında yolcu beraberi eşya faturası (YOLCUBERABERFATURA; KDV hesaplanır, aracı kurumla iade) düzenler.

- **Online Deri Çanta Satışı e-Arşiv** (`meslek-e03-online-deri-canta-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *modern*): Web mağazasından deri çanta ve cüzdan siparişi; kargo ve ödeme aracısı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.

- **Turiste Tax Free Satış (Yolcu Beraberi)** (`meslek-e03-turiste-tax-free-satis-yolcu-beraberi`, e-Fatura (Yolcu Beraberi), yerleşim *zarif*): Yabancı turiste deri çanta ve kemer satışı; pasaport, uyruk ve aracı kurum bilgisi.
  - ProfileID YOLCUBERABERFATURA; AccountingCustomerParty = Gümrük (1460415308); BuyerCustomerParty PARTYTYPE=TAXFREE + Person (ad, soyad, NationalityID) + IdentityDocumentReference (pasaport no / tarihi); TaxRepresentativeParty ARACIKURUMVKN + ARACIKURUMETIKET. KDV hesaplanır, istisna kodu 501.

### E.04 Deri Giyim Eşyası İmalatı, Onarımı

NACE: 142401 Deri Giyim Eşyası İmalatı (Deri Ayakkabı Hariç); 142402 Kürklü Deriden Giyim Eşyası, Giysi Aksesuarları Ve Diğer Eşyaların İmalatı (Kürkten Şapka Ve Başlık Hariç); 952907 Deri Ve Deri Bileşimli Giyim Eşyaları İle Kürk Giyim Eşyalarının Onarımı

**Belge seçimi:** Deri giyim imalatçısı ihracatçı firmaya ihraç kaydıyla teslimde IHRACKAYITLI (istisna 701, KDV tecil) e-Fatura; tüketiciye tadilat / onarım hizmetinde e-Arşiv düzenler.

- **İhraç Kayıtlı Deri Ceket Teslimi** (`meslek-e04-ihrac-kayitli-deri-ceket-teslimi`, e-Fatura, yerleşim *endustri*): İhracatçı firmaya ihraç edilmek üzere deri ceket teslimi; KDV hesaplanır ancak tahsil edilmez (tecil).
  - InvoiceTypeCode IHRACKAYITLI; KDV hesaplanır (Percent 20) ancak TaxExemptionReasonCode 701 ile tecil edilir: TaxInclusiveAmount = matrah + KDV, PayableAmount = matrah.

- **Deri Mont Onarım e-Arşiv** (`meslek-e04-deri-mont-onarim-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Müşterinin deri montunda fermuar değişimi ve boy kısaltma.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### E.05 Deri Giyim Eşyası Ticareti

NACE: 461601 Deri Giyim Eşyası, Kürk Ve Ayakkabının Bir Ücret Veya Sözleşmeye Dayalı Olarak Toptan Satışını Yapan Aracılar; 464204 Kürk Ve Deriden Giyim Eşyalarının Toptan Ticareti; 477103 Kürklü Deriden Giyim Eşyalarının Perakende Ticareti (İşlenmiş Kürklü Deriler Dahil); 477107 Deri Veya Deri Bileşimli Giyim Eşyası Perakende Ticareti

**Belge seçimi:** Turistik bölgedeki deri mağazası yabancı turistlere yolcu beraberi eşya faturası (Tax Free), yerli müşterilere e-Arşiv düzenler.

- **Deri Ceket Tax Free Faturası** (`meslek-e05-deri-ceket-tax-free-faturasi`, e-Fatura (Yolcu Beraberi), yerleşim *serit*): Yabancı turiste deri ceket satışı; pasaport ve aracı kurum bilgisi, KDV iadesi için gümrük onayı.
  - ProfileID YOLCUBERABERFATURA; AccountingCustomerParty = Gümrük (1460415308); BuyerCustomerParty PARTYTYPE=TAXFREE + Person (ad, soyad, NationalityID) + IdentityDocumentReference (pasaport no / tarihi); TaxRepresentativeParty ARACIKURUMVKN + ARACIKURUMETIKET. KDV hesaplanır, istisna kodu 501.

- **Mağaza Satışı e-Arşiv** (`meslek-e05-magaza-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Yerli müşteriye deri mont satışı; kampanya indirimi satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### E.06 Dericilik

NACE: 151110 Deri Ve Kürklü Deri İmalatı (Kürkün Ve Derinin Tabaklanması, Sepilenmesi, Boyanması, Cilalanması Ve İşlenmesi)(İşlenmiş Derinin Başka İşlemlere Tabi Tutulmaksızın Yalnızca Tamburda Ütülenmesi Ve Kurutulması Hariç); 151111 Kürklü Derinin Ve Postların Kazınarak Temizlenmesi, Kırkılması, Tüylerinin Yolunması Ve Ağartılması (Postlu Derilerin Terbiyesi Dahil); 151113 Deri Ve Kösele Esaslı Terkip İle Elde Edilen Levha, Yaprak, Şerit Deri Ve Kösele İmalatı; 151114 İşlenmiş Derinin Başka İşlemlere Tabi Tutulmaksızın Yalnızca Tamburda Ütülenmesi Ve Kurutulması; 151299 Deriden Veya Deri Bileşimlerinden Başka Yerde Sınıflandırılmamış Diğer Ürünlerin İmalatı (Makinelerde Veya Mekanik Cihazlarda Kullanılan Veya Diğer Teknik Kullanımlar İçin Ürünler Dahil); 462402 Tabaklanmış Deri, Güderi Ve Kösele Toptan Ticareti

**Belge seçimi:** Tabakhane belirlenmiş alıcılara ham post ve deri tesliminde 622 kodlu 9/10 KDV tevkifatlı e-Fatura düzenler; kurban bayramında vatandaştan / derneklerden belge alamadan aldığı ham deriler için e-Gider Pusulası kullanır.

- **Ham Deri Teslim Faturası (Tevkifat 622)** (`meslek-e06-ham-deri-teslim-faturasi-tevkifat-622`, e-Fatura, yerleşim *endustri*): Deri konfeksiyon fabrikasına tuzlu ham koyun derisi satışı; 9/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 622, Percent 90 (9/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Vatandaştan Kurban Derisi Alımı Gider Pusulası** (`meslek-e06-vatandastan-kurban-derisi-alimi-gider-pusulasi`, e-Gider Pusulası, yerleşim *defter*): Kurban bayramında vatandaştan ham deri alımı; GVK 94/13-a gereği %2 stopaj.
  - CreditNote · TR1.2.1 · ProfileID GIDERPUSULASI · CreditNoteTypeCode SATIS. Belge vermeyen (vergiden muaf / ÇKS'siz) satıcı AccountingCustomerParty (TCKN + Person, SMS kodu); düzenleyen SMS_PROVIDER. GV stopajı 0003 %2 (GVK 94/13) TaxTotal'da, ödenecekten düşülür.

### E.07 Dokumacılık

NACE: 131003 Doğal Pamuk Elyafının İmalatı (Kardelenmesi, Taraklanması Vb.); 131005 Doğal Yün Ve Tiftik Elyafının İmalatı (Kardelenmesi, Taraklanması, Yün Yağının Giderilmesi, Karbonize Edilmesi Ve Yapağının Boyanması Vb.); 131006 Doğal Jüt, Keten Ve Diğer Bitkisel Tekstil Elyaflarının İmalatı (Kardelenmesi, Taraklanması Vb.) (Pamuk Hariç); 131009 Sentetik Veya Suni Devamsız Elyafın Kardelenmesi Ve Taraklanması; 131010 Doğal İpeğin Bükülmesi Ve İplik Haline Getirilmesi; 131012 Pamuk Elyafının Bükülmesi Ve İplik Haline Getirilmesi; 131013 Yün Ve Tiftik Elyafının Bükülmesi Ve İplik Haline Getirilmesi; 131014 Jüt, Keten Ve Diğer Bitkisel Tekstil Elyaflarının Bükülmesi Ve İplik Haline Getirilmesi (Pamuk Hariç) … (+34 kod)

**Belge seçimi:** Dokuma fabrikası konfeksiyon ihracatçılarına ihraç kaydıyla kumaş teslimini IHRACKAYITLI (701, KDV tecil) e-Fatura ile, yurt dışı alıcılara doğrudan ihracatı IHRACAT profiliyle yapar; yurt içi sevkiyatlar e-İrsaliye ile.

- **İhraç Kayıtlı Kumaş Teslim Faturası** (`meslek-e07-ihrac-kayitli-kumas-teslim-faturasi`, e-Fatura, yerleşim *kurumsal*): Konfeksiyon ihracatçısına denim kumaş teslimi; 701 istisna, KDV tecil.
  - InvoiceTypeCode IHRACKAYITLI; KDV hesaplanır (Percent 20) ancak TaxExemptionReasonCode 701 ile tecil edilir: TaxInclusiveAmount = matrah + KDV, PayableAmount = matrah.

- **Kumaş İhracat Faturası (EXW)** (`meslek-e07-kumas-ihracat-faturasi-exw`, e-Fatura (İhracat), yerleşim *serit*): İtalya’daki konfeksiyoncuya top kumaş ihracatı; GTİP 5209, top sayısı kap olarak.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (EXW), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz EUR + PricingExchangeRate.

- **Kumaş Sevk İrsaliyesi** (`meslek-e07-kumas-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Fabrikadan konfeksiyon atölyesine top kumaş sevki; top ve metre bilgisi.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### E.08 Ev Tekstil Ürünleri İmalatı, Ticareti

NACE: 139201 Yatak Örtü Takımları, Yatak Çarşafları, Yastık Kılıfları, Masa Örtüsü İle Tuvalet Ve Mutfakta Kullanılan Örtülerin İmalatı (El Ve Yüz Havluları Dahil); 139202 Yorgan, Kuştüyü Yorgan, Minder, Puf, Yastık, Halı Yastık, Uyku Tulumu Ve Benzerlerinin İmalatı; 139203 Perdelerin Ve İç Storların, Perde Veya Yatak Saçaklarının, Farbelalarının Ve Malzemelerinin İmalatı (Gipür, Hazır Tül Perde Ve Kalın Perdeler Dahil); 139205 Battaniye İmalatı; 139902 Oya, Dantel Ve Nakış İmalatı (Kapitone Ürünleri Dahil) İle Tül Ve Diğer Ağ Kumaşların (Dokuma, Örgü (Triko) Veya Tığ İşi (Kroşe) Olanlar Hariç) İmalatı; 139904 Tekstil Kırpıntısı İmalatı (Yatak, Yorgan, Yastık, Şilte Ve Benzeri Doldurmak İçin); 461604 Tekstil Ürünlerinin Bir Ücret Veya Sözleşmeye Dayalı Olarak Toptan Satışını Yapan Aracılar (İplik, Kumaş, Ev Tekstili, Perde Vb. Ürünler) (Giyim Eşyaları Hariç); 464101 Evde Kullanılan Tekstil Takımları, Perdeler Ve Çeşitli Tekstil Malzemesinden Ev Eşyaları Toptan Ticareti … (+2 kod)

**Belge seçimi:** Ev tekstili üreticisi online tüketici satışlarında e-Arşiv internet satışı; otel zincirlerine toplu havlu / nevresim satışında e-Fatura düzenler.

- **Online Nevresim Satışı e-Arşiv** (`meslek-e08-online-nevresim-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Web mağazasından nevresim ve havlu seti siparişi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.

- **Otel Zincirine Tekstil e-Faturası** (`meslek-e08-otel-zincirine-tekstil-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Otel zincirine logolu havlu, bornoz ve çarşaf satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### E.09 Halı Yıkama Hizmetleri

NACE: 961004 Halı Ve Kilim Yıkama Hizmetleri

**Belge seçimi:** Halı yıkamacı evlere metrekare bazlı e-Arşiv düzenler; belediye / müftülük gibi kamu idarelerine (ör. cami halıları) KAMU senaryolu e-Fatura keser (ödeme hesabı IBAN zorunlu).

- **Halı Yıkama e-Arşiv** (`meslek-e09-hali-yikama-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Evden alınan halıların metrekare bazlı yıkanması ve teslimi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Belediyeye Cami Halısı Yıkama (KAMU)** (`meslek-e09-belediyeye-cami-halisi-yikama-kamu`, e-Fatura, yerleşim *kurumsal*): Belediye ihalesi kapsamında cami halılarının yerinde yıkanması; KAMU senaryosu, IBAN zorunlu.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.

### E.10 Halıcılık, Kilimcilik

NACE: 139301 Halı (Duvar Halısı Dahil) Ve Kilim İmalatı (Paspas, Yolluk Ve Benzeri Tekstil Yer Kaplamaları Dahil); 139302 Halı, Kilim Vb. İçin Çözgücülük, Halı Oymacılığı Vb. Faaliyetler; 464702 Halı, Kilim, Vb. Yer Kaplamaları Toptan Ticareti; 475302 Halı, Kilim Ve Diğer Tekstil Yer Döşemeleri Perakende Ticareti (Keçeden Olanlar Dahil)

**Belge seçimi:** Halıcı turistlere yolcu beraberi eşya faturası (Tax Free) düzenler; evinde halı dokuyan ev hanımlarından alımda (esnaf muaflığı) %2 stopajlı e-Gider Pusulası kullanır.

- **El Dokuma Halı Tax Free Faturası** (`meslek-e10-el-dokuma-hali-tax-free-faturasi`, e-Fatura (Yolcu Beraberi), yerleşim *zarif*): Yabancı turiste ipek halı satışı; düğüm sayısı ve ebat satırda, pasaport ve aracı kurum bilgisi.
  - ProfileID YOLCUBERABERFATURA; AccountingCustomerParty = Gümrük (1460415308); BuyerCustomerParty PARTYTYPE=TAXFREE + Person (ad, soyad, NationalityID) + IdentityDocumentReference (pasaport no / tarihi); TaxRepresentativeParty ARACIKURUMVKN + ARACIKURUMETIKET. KDV hesaplanır, istisna kodu 501.

- **Ev Hanımından Halı Alımı Gider Pusulası** (`meslek-e10-ev-hanimindan-hali-alimi-gider-pusulasi`, e-Gider Pusulası, yerleşim *defter*): Evinde halı dokuyan ve esnaf muaflığından yararlanan kişiden el dokuma halı alımı; %2 stopaj.
  - CreditNote · TR1.2.1 · ProfileID GIDERPUSULASI · CreditNoteTypeCode SATIS. Belge vermeyen (vergiden muaf / ÇKS'siz) satıcı AccountingCustomerParty (TCKN + Person, SMS kodu); düzenleyen SMS_PROVIDER. GV stopajı 0003 %2 (GVK 94/13) TaxTotal'da, ödenecekten düşülür.

### E.11 İkinci El Tekstil Ürünleri Ticareti

NACE: 477906 Kullanılmış Giysiler Ve Aksesuarlarının Perakende Ticareti

**Belge seçimi:** İkinci el tekstil satıcısı tüketiciye e-Arşiv düzenler; vatandaşlardan kilo bazında ikinci el giysi alımını e-Gider Pusulası ile belgeler.

- **Vintage Giysi Satışı e-Arşiv** (`meslek-e11-vintage-giysi-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Mağazadan tüketiciye vintage ceket ve kot satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **İkinci El Giysi Alımı Gider Pusulası** (`meslek-e11-ikinci-el-giysi-alimi-gider-pusulasi`, e-Gider Pusulası, yerleşim *defter*): Vatandaştan kilo bazlı ikinci el giysi ve ayakkabı alımı.
  - CreditNote · TR1.2.1 · ProfileID GIDERPUSULASI · CreditNoteTypeCode SATIS. Belge vermeyen (vergiden muaf / ÇKS'siz) satıcı AccountingCustomerParty (TCKN + Person, SMS kodu); düzenleyen SMS_PROVIDER. Stopaj yok.

### E.12 Konfeksiyonculuk

NACE: 141001 Giyim Eşyası İmalatı (Örgü Veya Tığ İşi Kumaştan Olanlar) (Spor Ve Bebek Giysileri Hariç); 141002 Bebek Giyim Eşyası İmalatı (Örgü Veya Tığ İşi Kumaştan); 141003 Spor Ve Antrenman Giysileri, Kayak Kıyafetleri, Yüzme Kıyafetleri Vb. İmalatı (Örgü Veya Tığ İşi Kumaştan Olanlar); 141004 Çorap İmalatı (Örme Ve Tığ İşi Olan Külotlu Çorap, Tayt Çorap, Kısa Kadın Çorabı, Erkek Çorabı, Patik Ve Diğer Çoraplar); 142101 Dış Giyim Eşyası İmalatı (Örgü Veya Tığ İşi Olanlar Hariç) (Spor Ve Bebek Giysileri Hariç); 142102 Bebek Dış Giyim Eşyası İmalatı (Örgü Veya Tığ İşi Kumaştan Olanlar Hariç); 142103 Gelinlik İmalatı; 142201 Atlet, Fanila, Külot, Slip, İç Etek, Kombinezon, Jüp, Jüpon, Sütyen, Korse Vb. İç Çamaşırı İmalatı (Örgü Veya Tığ İşi Kumaştan Olanlar Hariç) … (+21 kod)

**Belge seçimi:** Konfeksiyoncu markalara fason dikim yapıyorsa 609 (7/10) tevkifatlı e-Fatura, doğrudan yurt dışı alıcıya satışta IHRACAT profilli fatura düzenler; fasona kumaş gönderimi / ürün teslimi e-İrsaliye ile izlenir.

- **Fason Dikim Faturası (Tevkifat 609)** (`meslek-e12-fason-dikim-faturasi-tevkifat-609`, e-Fatura, yerleşim *teknik*): Markanın kesilmiş kumaşlarının fason dikim ve ütü-paket işçiliği; 7/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 609, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Hazır Giyim İhracat Faturası (FCA)** (`meslek-e12-hazir-giyim-ihracat-faturasi-fca`, e-Fatura (İhracat), yerleşim *serit*): Hollanda’daki zincire tişört ve sweatshirt ihracatı; asorti koli.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (FCA), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz EUR + PricingExchangeRate.

- **Fasona Kesilmiş Kumaş Sevk İrsaliyesi** (`meslek-e12-fasona-kesilmis-kumas-sevk-irsaliyesi`, e-İrsaliye, yerleşim *kenar*): Kesimhaneden fason dikim atölyesine kesilmiş parçaların sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### E.13 Tasarım Faaliyetleri

NACE: 741400 Diğer Uzmanlaşmış Tasarım Faaliyetleri (Endüstriyel Ürün Ve Moda Tasarım, İç Tasarım Ve Grafik Tasarım Faaliyetleri Hariç)

**Belge seçimi:** Serbest tasarımcı serbest meslek erbabıdır: yurt içi işverene %20 stopajlı e-SMM düzenler. Yurt dışındaki müşteriye verilen ve yurt dışında yararlanılan tasarım hizmeti hizmet ihracatıdır (KDV 11/1-a, istisna 302).

- **Koleksiyon Tasarımı e-SMM (Stopajlı)** (`meslek-e13-koleksiyon-tasarimi-e-smm-stopajli`, e-SMM, yerleşim *zarif*): Giyim markasına sezon koleksiyon tasarımı ve teknik çizim; %20 GV stopajı.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015) ve GV stopajı 0003 (%20). Ödenecek = brüt + KDV − stopaj.

- **Yurt Dışına Tasarım Hizmeti (İhracat)** (`meslek-e13-yurt-disina-tasarim-hizmeti-ihracat`, e-SMM, yerleşim *modern*): İngiltere’deki markaya logo ve ambalaj tasarımı; hizmet ihracatı istisnası, stopaj yok.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015). Ödenecek = brüt + KDV − stopaj.

### E.14 Tekstil Baskıcılığı, Boyacılığı

NACE: 133001 Kumaş Ve Tekstil Ürünlerini Ağartma Ve Boyama Hizmetleri (Giyim Eşyası Dahil); 133002 Tekstil Elyaf Ve İpliklerini Ağartma Ve Boyama Hizmetleri (Kasarlama Dahil); 133003 Kumaş Ve Tekstil Ürünlerine Baskı Yapılması Hizmetleri (Giyim Eşyası Dahil, Emprime Baskı Dahil, Transfer Baskı Hariç); 133004 Kumaş Ve Tekstil Ürünlerine İlişkin Diğer Bitirme Hizmetleri (Apreleme, Pliseleme, Sanforlama, Vb. Dahil); 133005 Kumaş Ve Tekstil Ürünlerine Transfer Baskı Yapılması Hizmetleri; 961090 Diğer Tekstil Temizleme Hizmetleri İle Giyim Eşyası Ve Diğer Tekstil Ürünlerini Boyama Ve Renklendirme Hizmetleri (İmalat Aşamasında Yapılanlar Hariç)

**Belge seçimi:** Tekstil baskı / boyahanesi müşteri kumaşını fason boyar: 609 (7/10) tevkifatlı e-Fatura; işlenen kumaş müşteriye e-İrsaliye ile iade sevk edilir.

- **Fason Boya-Baskı Faturası (Tevkifat 609)** (`meslek-e14-fason-boya-baski-faturasi-tevkifat-609`, e-Fatura, yerleşim *endustri*): Dokuma fabrikasının ham kumaşlarının reaktif boyama ve dijital baskı işçiliği.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 609, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Boyanmış Kumaş İade Sevk İrsaliyesi** (`meslek-e14-boyanmis-kumas-iade-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Boyama işlemi tamamlanan kumaşların müşteriye sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### E.15 Terzilik

NACE: 141005 Sahne Ve Gösteri Elbiseleri İmalatı, Dokuma, Örgü (Triko) Ve Tığ İşi (Kroşe), Vb. Kumaştan Olanlar; 142104 Siparişe Göre Ölçü Alınarak Dış Giyim Eşyası İmalatı, Dokuma Kumaştan Olanlar (Terzilerin Faaliyetleri) (Giyim Eşyası Tamiri İle Gömlek İmalatı Hariç); 952902 Giyim Eşyası Ve Ev Tekstil Ürünlerinin Onarımı Ve Tadilatı (Deri Giyim Eşyaları Hariç)

**Belge seçimi:** Terzi bireysel ısmarlama ve tadilat işlerini e-Arşiv ile; işletmelere personel üniforması dikimini e-Fatura ile faturalar.

- **Ismarlama Takım e-Arşiv** (`meslek-e15-ismarlama-takim-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Müşteri ölçüsüne göre takım elbise dikimi; kumaş ve prova bilgisi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Otel Personel Üniforması e-Faturası** (`meslek-e15-otel-personel-uniformasi-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Otelin resepsiyon ve servis personeli için üniforma dikimi.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### E.16 Tuhafiye İmalatı, Ticareti

NACE: 139602 Tekstil Malzemelerinden Parça Halinde Kordonlar; İşleme Yapılmamış Şeritçi Eşyası Ve Benzeri Süs Eşyalarının İmalatı; 139604 Tekstil Malzemelerinden Dokuma Etiket, Rozet, Arma Ve Diğer Benzeri Eşyaların İmalatı; 139607 Tekstille Kaplanmış Kauçuk İplik Veya Kordon İle Kauçuk Veya Plastikle Kaplanmış Veya Emdirilmiş Tekstilden İplik Veya Şeritler Ve Bunlardan Yapılmış Mensucat İmalatı; 139903 Keçe, Basınçlı Hassas Giysi Dokumaları, Tekstilden Ayakkabı Bağı, Pudra Ponponu Vb. İmalatı; 139906 Gipe İplik Ve Şeritlerin, Şönil İpliklerin, Şenet İpliklerin İmalatı (Metalize Olanlar İle Gipe Lastikler Hariç); 142904 Eldiven, Kemer, Şal, Papyon, Kravat, Saç Fileleri, Kumaş Mendil, Atkı, Fular Vb. Giysi Aksesuarları İmalatı (Kürklü Deriden Olanlar Hariç); 151211 Kumaş Ve Diğer Malzemelerden Saat Kayışı İmalatı (Metal Olanlar Hariç); 329902 Kot Vb. Baskı Düğmeleri, Çıtçıtlar, Düğmeler, Fermuarlar Vb. İmalatı (Düğme Formları Ve Fermuar Parçaları Dahil) … (+12 kod)

**Belge seçimi:** Tuhafiyeci perakende müşterilere e-Arşiv, konfeksiyon atölyelerine toptan aksesuar satışında e-Fatura düzenler.

- **Tuhafiye Perakende e-Arşiv** (`meslek-e16-tuhafiye-perakende-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Tüketiciye iplik, düğme ve dantel satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Atölyeye Toptan Aksesuar e-Faturası** (`meslek-e16-atolyeye-toptan-aksesuar-e-faturasi`, e-Fatura, yerleşim *kenar*): Konfeksiyon atölyesine fermuar, düğme ve etiket toptan satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### F.01 Arzuhalcilik, Danışmanlık, Bilgi Hizmetleri

NACE: 639200 Diğer Bilgi Hizmeti Faaliyetleri; 702001 İşletme Ve Diğer İdari Danışmanlık Faaliyetleri; 702002 İnsan Kaynakları Yönetim Danışmanlığı Faaliyetleri; 732003 Piyasa Ve Kamuoyu Araştırma Faaliyetleri; 749903 İşyeri Komisyonculuğu Faaliyetleri (Küçük Ve Orta Ölçekli İşletmelerin Alım Ve Satımının Düzenlenmesi Vb.); 781001 İş Bulma Acentelerinin Faaliyetleri (İşe Girecek Kişilerin Seçimi Ve Yerleştirilmesi Faaliyetleri Dahil); 782002 Geçici İş Bulma Acenteleri İle Diğer İnsan Kaynaklarının Sağlanması Faaliyetleri; 821001 Büro Yönetimi Ve Destek Faaliyetleri (Sanal Ofis, Hazır Ofis Ve Paylaşımlı Ofis Hariç) … (+5 kod)

**Belge seçimi:** Arzuhalci ve danışman serbest meslek erbabıdır: vatandaşa dilekçe / sözleşme yazımında e-SMM (gerçek kişi müşteri stopaj sorumlusu değildir), şirketlere danışmanlıkta %20 GV stopajlı e-SMM düzenler. Danışmanlık hizmeti belirlenmiş alıcıya verilirse 602 kodlu 9/10 KDV tevkifatı da uygulanır.

- **Dilekçe ve Sözleşme Yazımı e-SMM** (`meslek-f01-dilekce-ve-sozlesme-yazimi-e-smm`, e-SMM, yerleşim *defter*): Vatandaşa icra itiraz dilekçesi ve kira sözleşmesi hazırlanması; gerçek kişi müşteri olduğundan stopaj yok.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015). Ödenecek = brüt + KDV − stopaj.

- **Kurumsal İK Danışmanlığı e-SMM (Stopaj + Tevkifat 602)** (`meslek-f01-kurumsal-ik-danismanligi-e-smm-stopaj-tevkifat-602`, e-SMM, yerleşim *kurumsal*): Lojistik şirketine aylık insan kaynakları danışmanlığı; %20 GV stopajı ve 9/10 KDV tevkifatı birlikte.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015) ve GV stopajı 0003 (%20); WithholdingTaxTotal 602. Ödenecek = brüt + KDV − stopaj − tevkifat.

### F.02 Basın, Yayım, İletişim

NACE: 581101 Kitap Yayımı (Broşür, Risale, Ansiklopedi Vb. Dahil; Çocuk Kitaplarının, Ders Kitaplarının Ve Yardımcı Ders Kitaplarının Yayımlanması Hariç); 581103 Çocuk Kitaplarının Yayımlanması; 581104 Ders Kitaplarının Ve Yardımcı Ders Kitaplarının Yayımlanması (Sözlük, Atlas, Grafikler, Haritalar Vb. Dahil); 581200 Gazetelerin Yayımlanması (Haftada En Az Dört Kez Yayımlananlar) (Reklam Gazeteleri Dahil); 581302 Eğitime Destek Amaçlı Dergi Ve Süreli Yayınların Yayımlanması (Haftada Dörtten Az Yayımlananlar); 581303 Bilimsel, Teknik, Kültürel Vb. Dergi Ve Süreli Yayınların Yayımlanması (Haftada Dörtten Az Yayımlananlar); 581390 Diğer Dergi Ve Süreli Yayınların Yayımlanması (Haftada Dörtten Az Yayımlananlar) (Çizgi Roman, Magazin Dergileri Vb.); 591201 Sinema Filmi, Video Ve Televizyon Programları Çekim Sonrası Faaliyetleri … (+6 kod)

**Belge seçimi:** Basılı kitap ve süreli yayın teslimleri KDV Kanunu 13/n uyarınca tam istisnadır (poşetli ve elektronik yayınlar hariç): dağıtıcı ve kitapçılara e-Fatura, okura web satışında e-Arşiv internet satışı ISTISNA 335 ile düzenlenir. Dergideki ilan / reklam geliri genel oranda KDV'ye tabidir ve belirlenmiş alıcılarda 625 (3/10) tevkifatı uygulanır.

- **Dağıtıcıya Kitap Satış Faturası (İstisna 335)** (`meslek-f02-dagiticiya-kitap-satis-faturasi-istisna-335`, e-Fatura, yerleşim *kurumsal*): Kitap dağıtım şirketine yeni çıkan roman ve çocuk kitapları; dağıtıcı iskontosu satırda, KDV 13/n istisnası.
  - InvoiceTypeCode ISTISNA; KDV TaxSubtotal Percent 0 + TaxExemptionReasonCode 335 (KDV 13/n Basılı kitap ve süreli yayınların teslimleri).

- **Okura Online Kitap Satışı e-Arşiv (İstisna 335)** (`meslek-f02-okura-online-kitap-satisi-e-arsiv-istisna-335`, e-Arşiv Fatura, yerleşim *pastel*): Yayınevi web sitesinden okura kitap satışı; internet satışı alanları + 13/n istisnası, kargo ücretsiz.
  - ProfileID EARSIVFATURA · InvoiceTypeCode ISTISNA.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.
  - InvoiceTypeCode ISTISNA; KDV TaxSubtotal Percent 0 + TaxExemptionReasonCode 335 (KDV 13/n Basılı kitap ve süreli yayınların teslimleri).

- **Dergi İlan Faturası (Tevkifat 625)** (`meslek-f02-dergi-ilan-faturasi-tevkifat-625`, e-Fatura, yerleşim *modern*): Seramik firmasına dergi tam sayfa ilan ve dijital banner yayını; ticari reklam hizmeti 3/10 tevkifatlı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 625, Percent 30 (3/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### F.03 Bireysel Sanatkârlık Faaliyetleri

NACE: 901100 Edebiyat Eseri Oluşturma Ve Müzikal Kompozisyon Faaliyetleri; 901200 Görsel Sanatlar Yaratıcılık Faaliyetleri; 901300 Diğer Sanatsal Yaratıcılık Faaliyetleri

**Belge seçimi:** Eser sahibinin (ressam, besteci, yazar) eser satışı ve hak devri GVK 18 kapsamında gelir vergisinden istisnadır ancak şirket alıcılar %17 stopaj keser; eser sahibi e-SMM düzenler (yalnız GVK 94 sorumlularına satış yapıp makbuz yükümlülüğünden çıkanlar için alıcı gider pusulası düzenler). GVK 18 istisnası KDV istisnası değildir.

- **Beste Telif Devri e-SMM (Stopaj %17)** (`meslek-f03-beste-telif-devri-e-smm-stopaj-17`, e-SMM, yerleşim *zarif*): Müzik yapım şirketine beste ve söz haklarının devri; GVK 18 kapsamında %17 stopaj.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015) ve GV stopajı 0003 (%17). Ödenecek = brüt + KDV − stopaj.

- **Tablo Satışı e-SMM (Koleksiyoncuya)** (`meslek-f03-tablo-satisi-e-smm-koleksiyoncuya`, e-SMM, yerleşim *kart*): Koleksiyoncuya yağlı boya tablo satışı; gerçek kişi alıcı stopaj sorumlusu değildir.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015). Ödenecek = brüt + KDV − stopaj.

### F.04 Çeşitli Malların Ticareti

NACE: 461901 Uzmanlaşmamış Toptan Ticaret İle İlgili Aracıların Faaliyetleri; 464207 Şemsiye Toptan Ticareti (Güneş Ve Bahçe Şemsiyeleri Hariç); 464999 Başka Yerde Sınıflandırılmamış Diğer Ev Eşyaları Ve Ev Gereçlerinin Toptan Ticareti; 468699 Başka Yerde Sınıflandırılmamış Ara Ürün (Tarım Hariç) Toptan Ticareti; 469001 Uzmanlaşmamış Toptan Ticaret (Bir Başka Ülkeyle Yapılan Toptan Ticaret Hariç); 469004 Başka Ülkeyle Yapılan Uzmanlaşmamış Toptan Ticaret; 471201 Uzmanlaşmamış Diğer Perakende Ticaret (Gıda, İçecek Ve Tütün Ağırlıklı Olmayan); 475599 Başka Yerde Sınıflandırılmamış Diğer Ev Eşyalarının Perakende Ticareti … (+2 kod)

**Belge seçimi:** Uzmanlaşmamış toptancı perakendecilere e-Fatura ve araçla sevkiyatta e-İrsaliye düzenler; komşu ülkelere TIR ile satışlarda IHRACAT profilli, gümrük muhataplı fatura kullanır. Perakende tezgâh satışları e-Arşiv ile belgelenir.

- **Markete Toptan Ev Gereçleri e-Faturası** (`meslek-f04-markete-toptan-ev-gerecleri-e-faturasi`, e-Fatura, yerleşim *kenar*): Mahalle marketine plastik mutfak gereçleri, şemsiye ve temizlik bezi toptan satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Toptan Sevk İrsaliyesi** (`meslek-f04-toptan-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Depodan markete kamyonetle koli sevki; koli adedi ve şoför bilgisi.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

- **Irak'a TIR ile İhracat Faturası (DAP)** (`meslek-f04-irak-a-tir-ile-ihracat-faturasi-dap`, e-Fatura (İhracat), yerleşim *serit*): Erbil'deki toptancıya ev gereçleri ihracatı; GTİP ve koli bilgisi satırda, kara yolu.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (DAP), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz USD + PricingExchangeRate.

### F.05 Çiçekçilik

NACE: 011902 Çiçek Yetiştirilmesi (Lale, Kasımpatı, Zambak, Gül Vb. İle Bunların Tohumları); 462108 Tohum (Yağlı Tohumlar Hariç) Toptan Ticareti; 462201 Çiçeklerin Ve Bitkilerin Toptan Ticareti; 477602 Çiçek, Bitki Ve Tohum Perakende Ticareti; 477826 Yapma Çiçek, Yaprak Ve Meyveler İle Mum Perakende Ticareti

**Belge seçimi:** Çiçekçi tüketiciye e-Arşiv (online siparişte internet satışı alanları ve kurye teslimi) düzenler; otel ve şirketlere aylık çiçek düzenleme hizmetini e-Fatura ile faturalar. Kesme çiçeği doğrudan ÇKS kayıtlı üreticiden alıyorsa e-Müstahsil Makbuzu (%2 stopaj) düzenler.

- **Online Çiçek Siparişi e-Arşiv (İnternet)** (`meslek-f05-online-cicek-siparisi-e-arsiv-internet`, e-Arşiv Fatura, yerleşim *pastel*): Web sitesinden verilen buket siparişi; alıcıya kuryeyle teslim, not kartı satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.

- **Otel Aylık Çiçek Düzenleme e-Faturası** (`meslek-f05-otel-aylik-cicek-duzenleme-e-faturasi`, e-Fatura, yerleşim *zarif*): Otel lobisi ve restoranı için haftalık çiçek düzenlemesi; Eylül dönemi.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Üreticiden Kesme Çiçek Alımı e-Müstahsil** (`meslek-f05-ureticiden-kesme-cicek-alimi-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *defter*): Seracı üreticiden kesme gül ve karanfil alımı; %2 GV stopajı ve Bağ-Kur kesintisi.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %2 (zirai ürün), SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

### F.06 Fatura Tahsilat Bürosu İşletmeciliği

NACE: 829100 Tahsilat Ve Kredi Kayıt Bürolarının Faaliyetleri

**Belge seçimi:** Fatura tahsilat bürosu müşterinin ödediği kurum faturalarını kendi hasılatı olarak değil emanet olarak tahsil eder; gelir olan komisyonu ödeme kuruluşuna / kuruma aylık e-Fatura ile belgeler. Müşteriden ayrıca işlem hizmet bedeli alınıyorsa bunun için e-Arşiv düzenlenir; müşteriye verilen tahsilat dekontu e-belge değildir.

- **Ödeme Kuruluşuna Aylık Komisyon e-Faturası** (`meslek-f06-odeme-kurulusuna-aylik-komisyon-e-faturasi`, e-Fatura, yerleşim *teknik*): Yetkili ödeme kuruluşuna Eylül ayı fatura tahsilat işlem komisyonu; işlem adedi ve tahsilat hacmi satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **İşlem Hizmet Bedeli e-Arşiv** (`meslek-f06-islem-hizmet-bedeli-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Müşteriden alınan fatura ödeme hizmet bedeli; ödenen kurum faturaları belge kapsamı dışında.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### F.07 Fotoğrafçılık

NACE: 464310 Fotoğrafçılıkla İlgili Ürünlerin Toptan Ticareti; 477822 Fotoğrafçılık Malzemeleri Ve Aletlerinin Perakende Ticareti; 742022 Tüketicilere Yönelik Fotoğrafçılık Faaliyetleri (Pasaport, Okul, Düğün Vb. İçin Vesikalık Ve Portre Fotoğrafçılığı Vb.); 742025 Hava Ve Su Altı Fotoğrafçılığı Faaliyetleri; 742026 Reklamcılık İle İlgili Fotoğrafçılık Faaliyetleri (Reklam Görselleri, Broşür, Gazete İlanı, Katalog Vb. İçin Ticari Ürünlerin, Moda Kıyafetlerinin, Makinelerin, Binaların, Kişilerin Vb.nin Fotoğraflarının Çekilmesi); 742027 Etkinlik Fotoğrafçılığı Ve Etkinliklerin Videoya Çekilmesi Faaliyetleri (Düğün, Mezuniyet, Konferans, Resepsiyon, Moda Gösterileri, Spor Ve Diğer İlgi Çekici Olayların Fotoğraflanması Veya Videoya Çekilmesi); 742029 Fotoğraf İşleme Faaliyetleri; 742090 Diğer Fotoğrafçılık Faaliyetleri (Fotomikrografi, Mikrofilm Hizmetleri, Fotoğrafların Restorasyonu Ve Rötuşlama Vb.)

**Belge seçimi:** Fotoğrafçı tüketiciye düğün / vesikalık çekimlerinde e-Arşiv, firmalara katalog ve e-ticaret ürün çekimlerinde e-Fatura düzenler. Fotoğraf sanatçısı olarak eser (fotoğraf) hakkı devri yapıyorsa e-SMM ve GVK 18 kapsamında %17 stopaj söz konusu olur.

- **Düğün Çekim Paketi e-Arşiv** (`meslek-f07-dugun-cekim-paketi-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Düğün günü fotoğraf + klip çekimi ve albüm; çekim tarihi dönem alanında.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **E-Ticaret Ürün Fotoğrafı e-Faturası** (`meslek-f07-e-ticaret-urun-fotografi-e-faturasi`, e-Fatura, yerleşim *modern*): Tekstil firmasına beyaz fon ürün çekimi ve manken çekimi; adet bazlı fiyatlandırma.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### F.08 Fotokopicilik, Tez Yazımı

NACE: 181208 Fotokopi Çekme Faaliyetleri

**Belge seçimi:** Fotokopici öğrencilere ve vatandaşlara e-Arşiv düzenler; üniversite gibi kamu idarelerine yapılan baskı / fotokopi hizmetinde KAMU senaryolu e-Fatura (ödeme IBAN zorunlu) kullanır. Belirlenmiş alıcılara yapılan baskı işi 615 (7/10) tevkifat kapsamına girebilir; sadece fotokopi çekimi ise basım hizmeti sayılmayabilir.

- **Tez Baskı ve Ciltleme e-Arşiv** (`meslek-f08-tez-baski-ve-ciltleme-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Yüksek lisans öğrencisine tez çıktısı, ciltleme ve CD yazımı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Üniversiteye Fotokopi Hizmeti (KAMU)** (`meslek-f08-universiteye-fotokopi-hizmeti-kamu`, e-Fatura, yerleşim *kurumsal*): Üniversite fakültesine sınav evrakı fotokopi ve çoğaltma hizmeti; KAMU senaryosu, IBAN zorunlu.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.

### F.09 Hediyelik Eşya İmalatı, Ticareti

NACE: 231504 Küçük Cam Eşya İmalatı (Biblo, Vb. Süs Eşyası, Boncuklar, İmitasyon İnciler/Taşlar, İmitasyon Mücevherler, Vb. Dahil); 234102 Seramik Ve Porselenden Heykelcik, Vazo, Biblo, Vb. Süs Eşyası İmalatı (Oyuncaklar Hariç); 237002 Doğal Taşlardan, Mermerden, Su Mermerinden, Travertenden, Kayağantaşından Süs Eşyası İmalatı (Lületaşı, Kehribar Ve Benzerlerinden Olanlar Dahil); 321301 İmitasyon (Taklit) Takılar Ve İlgili Eşyaların İmalatı; 329915 Suni Balmumu İle Suni Mumların Ve Müstahzar Mumların İmalatı; 329918 Fildişi, Kemik, Boynuz, Sedef Gibi Hayvansal Malzemelerden Oyma Eşyaların İmalatı; 464912 Hediyelik Eşya Toptan Ticareti (Pipo, Tespih, Bakır Süs Eşyaları, İmitasyon Takılar Dahil); 477804 Hediyelik Eşyaların, El İşi Ürünlerin Ve İmitasyon Takıların Perakende Ticareti (Sanat Eserleri Hariç)

**Belge seçimi:** Hediyelik eşya imalatçı-satıcısı yabancı turistlere yolcu beraberi eşya faturası (Tax Free, istisna 501), yerli ziyaretçilere e-Arşiv, diğer hediyelik dükkânlarına toptan satışta e-Fatura düzenler. Yurt dışına online küçük gönderiler ETGB'li mikro ihracattır.

- **Turiste Seramik Satışı (Yolcu Beraberi)** (`meslek-f09-turiste-seramik-satisi-yolcu-beraberi`, e-Fatura (Yolcu Beraberi), yerleşim *serit*): Yabancı turiste el yapımı Avanos seramiği; pasaport ve aracı kurum bilgisi, KDV iadesi gümrük onayıyla.
  - ProfileID YOLCUBERABERFATURA; AccountingCustomerParty = Gümrük (1460415308); BuyerCustomerParty PARTYTYPE=TAXFREE + Person (ad, soyad, NationalityID) + IdentityDocumentReference (pasaport no / tarihi); TaxRepresentativeParty ARACIKURUMVKN + ARACIKURUMETIKET. KDV hesaplanır, istisna kodu 501.

- **Hediyelik Dükkânına Toptan e-Faturası** (`meslek-f09-hediyelik-dukkanina-toptan-e-faturasi`, e-Fatura, yerleşim *kenar*): Turistik bölgedeki hediyelik eşya dükkânına nazar boncuğu, magnet ve seramik toptan satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Yurt Dışı Online Sipariş Mikro İhracat (ETGB)** (`meslek-f09-yurt-disi-online-siparis-mikro-ihracat-etgb`, e-Arşiv (Mikro İhracat / ETGB), yerleşim *kart*): Fransa'daki müşterinin web sitesi siparişi; ETGB, GTİP ve kargo takip bilgisi.
  - e-Arşiv (EARSIVFATURA) + InvoiceTypeCode ISTISNA 301; yabancı alıcı VKN 2222222222 ve ülke kodu; AdditionalDocumentReference ETGB; Delivery/CarrierParty + TrackingID; satırda GTİP (AdditionalItemIdentification). Döviz + kur.

### F.10 Kağıt, Kağıt Ürünleri İmalatı, Ticareti

NACE: 171108 Kağıt Hamuru İmalatı; 171207 Kağıt Ve Mukavva İmalatı; 172110 Bürolarda, Dükkanlarda Ve Benzeri Yerlerde Kullanılan Kağıt Veya Mukavvadan Dosya Veya Evrak Tasnif Kutuları, Mektup Kutuları Ve Benzeri Eşyaların İmalatı; 172111 Kağıt Ve Kartondan Torba Ve Çanta İmalatı; 172112 Kağıt Veya Mukavvadan Koli, Kutu Ve Benzeri Muhafazaların İmalatı; 172113 Oluklu Kağıt Ve Mukavva İmalatı; 172203 Kağıt Veya Mukavvadan Tepsi, Tabak, Kase, Bardak Ve Benzerlerinin İmalatı; 172304 Kullanıma Hazır Karbon Kağıdı, Kendinden Kopyalı Kağıt Ve Diğer Kopyalama Veya Transfer Kağıtları, Mumlu Teksir Kağıdı, Kağıttan Ofset Tabakalar İle Tutkallı Veya Yapışkanlı Kağıtların İmalatı … (+10 kod)

**Belge seçimi:** Kağıt / ambalaj üreticisi sanayicilere koli ve kağıt ürünlerini e-Fatura ile satar, sevkiyatı e-İrsaliye ile yapar. Hammadde olarak sokak toplayıcılarından ve vergiden muaf kişilerden atık kağıt alımlarında e-Gider Pusulası düzenlenir; atıktan elde edilen hammadde (kağıt hamuru) tesliminde 621 (9/10) tevkifat uygulanır.

- **Gıda Firmasına Koli Satış e-Faturası** (`meslek-f10-gida-firmasina-koli-satis-e-faturasi`, e-Fatura, yerleşim *endustri*): Baskılı oluklu koli ve ara bölme satışı; ölçü ve dalga tipi satır etiketlerinde.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Koli Sevk İrsaliyesi** (`meslek-f10-koli-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Fabrikadan müşteri deposuna paletli koli sevkiyatı; palet adedi ve brüt ağırlık.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

- **Toplayıcıdan Atık Kağıt Alımı Gider Pusulası** (`meslek-f10-toplayicidan-atik-kagit-alimi-gider-pusulasi`, e-Gider Pusulası, yerleşim *defter*): Kapı kapı dolaşarak atık toplayan (GVK 9/7 esnaf muaflığı) kişiden kantarla karton ve kağıt alımı; GVK 94/13-b gereği %2 stopaj.
  - CreditNote · TR1.2.1 · ProfileID GIDERPUSULASI · CreditNoteTypeCode SATIS. Belge vermeyen (vergiden muaf / ÇKS'siz) satıcı AccountingCustomerParty (TCKN + Person, SMS kodu); düzenleyen SMS_PROVIDER. GV stopajı 0003 %2 (GVK 94/13) TaxTotal'da, ödenecekten düşülür.

### F.11 Kauçuk, Plastik Ürünlerin İmalatı, Ticareti

NACE: 151210 Plastik Veya Kauçuk Saat Kayışı İmalatı; 192017 Vazelin, Parafin Mumu, Petrol Mumu, Petrol Koku, Petrol Bitümeni Ve Diğer Petrol Ürünlerinin İmalatı; 201701 Birincil Formda Sentetik Kauçuk İmalatı; 221201 Kauçuktan Tüp, Boru Ve Hortumların İmalatı (Vulkanize Kauçuktan); 221202 Kauçuktan Silgi, Rondela, Conta, Tekne Veya İskele Usturmaçaları, Gözenekli Vulkanize Kauçuktan Teknik İşlerde Kullanılan Diğer Eşyalar İle Demiryolu, Kara Yolu Taşıtları Ve Diğer Araçlar İçin Kalıplanmış Parçaların İmalatı; 221203 Kauçuktan Konveyör Bantları Ve Taşıma Kayışlarının İmalatı; 221204 Vulkanize Edilmiş (Kükürtle Sertleştirilmiş) Kauçuk İmalatı (İp, Kordon, Levha, Tabaka, Şerit, Çubuk Ve Profil Halinde); 221205 Rejenere Kauçuk İmalatı, Birincil Formda Veya Levha, Tabaka Veya Şerit Halinde … (+24 kod)

**Belge seçimi:** Plastik-kauçuk imalatçısı otomotiv yan sanayi ve sanayi müşterilerine e-Fatura düzenler; atık plastikten rejenere granül teslimleri 621 kodlu 9/10 tevkifata tabidir. Yurt dışı müşterilere IHRACAT profilli fatura (GTİP 39 / 40) kullanılır.

- **Yan Sanayiye Conta ve Hortum e-Faturası** (`meslek-f11-yan-sanayiye-conta-ve-hortum-e-faturasi`, e-Fatura, yerleşim *teknik*): Otomotiv yan sanayi firmasına EPDM conta ve radyatör hortumu; parti numarası satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Rejenere Granül Teslimi (Tevkifat 621)** (`meslek-f11-rejenere-granul-teslimi-tevkifat-621`, e-Fatura, yerleşim *endustri*): Atık plastikten elde edilen rejenere PP granül satışı; 9/10 KDV tevkifatı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 621, Percent 90 (9/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Kauçuk Conta İhracat Faturası (FCA)** (`meslek-f11-kaucuk-conta-ihracat-faturasi-fca`, e-Fatura (İhracat), yerleşim *serit*): Romanya'daki montaj fabrikasına conta ihracatı; GTİP 4016 ve koli bilgisi.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (FCA), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz EUR + PricingExchangeRate.

### F.12 Kırtasiye İmalatı, Ticareti

NACE: 205905 Yazım Ve Çizim Mürekkepleri Ve Diğer Mürekkeplerin İmalatı (Matbaa Mürekkebi İmalatı Hariç); 259904 Adi Metalden Büro Malzemeleri İmalatı (Dosya Kutuları, Kaşeler, Zımba Telleri, Kağıt Ataçları Vb.); 329904 Mekanik Olsun Veya Olmasın Her Çeşit Dolma Kalem, Tükenmez Ve Kurşun Kalem İle Boya Kalemi, Pastel Boya İmalatı (Kalem Ucu Ve Kurşun Kalem İçleri Dahil); 329908 Tarih Verme, Damga, Mühür Veya Numara Verme Kaşeleri, Numaratör, Elle Çalışan Basım Aletleri, Kabartma Etiketleri, El Baskı Setleri, Hazır Daktilo Şeritleri Ve Istampaların İmalatı; 464903 Kırtasiye Ürünleri Toptan Ticareti; 464924 Resim, Fotoğraf Vb. İçin Çerçeve Toptan Ticareti; 476201 Kırtasiye Ürünlerinin Perakende Ticareti; 477808 Büro Makine Ve Ekipmanlarının Perakende Ticareti (Hesaplama Makineleri, Daktilolar, Fotokopi Makineleri, Tarama Ve Faks Cihazları, Çizim Masaları Vb.)

**Belge seçimi:** Kırtasiyeci veliler ve öğrencilere e-Arşiv düzenler; kurşun kalem, boya kalemi, okul defteri, silgi, kalemtıraş, cetvel gibi ürünler (II) sayılı listede %10, diğer kırtasiye ve fotokopi kağıdı %20 KDV'ye tabidir. Okul ve şirketlere toplu satışta e-Fatura kullanılır.

- **Okul Alışverişi e-Arşiv** (`meslek-f12-okul-alisverisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Veliye okul listesi alışverişi; %10 ve %20 KDV oranları aynı belgede ayrışır.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Özel Okula Toptan Kırtasiye e-Faturası** (`meslek-f12-ozel-okula-toptan-kirtasiye-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Özel okulun dönem başı kırtasiye ihtiyacı; okul defteri ve ofis malzemeleri.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### F.13 Kitapçılık

NACE: 464911 Kitap, Dergi Ve Gazete Toptan Ticareti; 476100 Kitap Perakende Ticareti; 477903 İkinci El Kitapların Perakende Ticareti (Sahafların Faaliyetleri)

**Belge seçimi:** Basılı kitap ve süreli yayın satışı (ikinci el dahil) KDV 13/n uyarınca tam istisnadır: okura e-Arşiv, okul kütüphanesi gibi kamu idarelerine KAMU senaryolu e-Fatura ISTISNA 335 ile düzenlenir. Sahaf olarak vatandaştan ikinci el kitap alımı e-Gider Pusulası ile belgelenir.

- **Kitap Satışı e-Arşiv (İstisna 335)** (`meslek-f13-kitap-satisi-e-arsiv-istisna-335`, e-Arşiv Fatura, yerleşim *kart*): Okura yeni ve ikinci el kitap satışı; KDV 13/n istisnası nedeniyle KDV gösterilmez.
  - ProfileID EARSIVFATURA · InvoiceTypeCode ISTISNA.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - InvoiceTypeCode ISTISNA; KDV TaxSubtotal Percent 0 + TaxExemptionReasonCode 335 (KDV 13/n Basılı kitap ve süreli yayınların teslimleri).

- **Okul Kütüphanesine Kitap (KAMU, İstisna 335)** (`meslek-f13-okul-kutuphanesine-kitap-kamu-istisna-335`, e-Fatura, yerleşim *kurumsal*): İlçe Milli Eğitim Müdürlüğüne okul kütüphaneleri için kitap teslimi; KAMU senaryosu + 13/n istisnası.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.
  - InvoiceTypeCode ISTISNA; KDV TaxSubtotal Percent 0 + TaxExemptionReasonCode 335 (KDV 13/n Basılı kitap ve süreli yayınların teslimleri).

- **Vatandaştan İkinci El Kitap Alımı Gider Pusulası** (`meslek-f13-vatandastan-ikinci-el-kitap-alimi-gider-pusulasi`, e-Gider Pusulası, yerleşim *defter*): Ev kütüphanesi boşaltan vatandaştan toplu ikinci el kitap alımı.
  - CreditNote · TR1.2.1 · ProfileID GIDERPUSULASI · CreditNoteTypeCode SATIS. Belge vermeyen (vergiden muaf / ÇKS'siz) satıcı AccountingCustomerParty (TCKN + Person, SMS kodu); düzenleyen SMS_PROVIDER. Stopaj yok.

### F.14 Kreş İşletmeciliği

NACE: 851002 Özel Öğretim Kurumları Tarafından Verilen Okul Öncesi Eğitim Faaliyeti (Okula Yönelik Eğitim Verilmeyen Gündüz Bakım (Kreş) Faaliyetleri Hariç); 889101 Çocuk Gündüz Bakım (Kreş) Faaliyetleri (Engelli Çocuklar İçin Olanlar İle Bebek Bakıcılığı Dahil; Okul Öncesi Eğitim Faaliyetleri İle Çocuk Kulüpleri (6 Yaş Ve Üzeri Çocuklar İçin) Hariç)

**Belge seçimi:** Kreş velilere aylık ücret için e-Arşiv düzenler (okul öncesi eğitim hizmetinde indirimli KDV oranı); çalışanlarının çocukları için anlaşma yapan şirketlere kurumsal e-Fatura keser. Dönem bilgisi InvoicePeriod ile verilir.

- **Aylık Kreş Ücreti e-Arşiv** (`meslek-f14-aylik-kres-ucreti-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Veliye Ekim ayı kreş ücreti, yemek ve servis; öğrenci adı satır etiketinde.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Şirkete Kurumsal Kreş Hizmeti e-Faturası** (`meslek-f14-sirkete-kurumsal-kres-hizmeti-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Çalışanlarının çocukları için anlaşmalı şirkete 6 çocuğun aylık kreş bedeli.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### F.15 Kurs İşletmeciliği

NACE: 853215 Ticari Sertifika Veren Havacılık, Yelkencilik, Gemicilik Vb. Kursların Faaliyetleri; 853216 Ticari Taşıt Kullanma Belgesi Veren Sürücü Kurslarının Faaliyetleri; 853290 Mesleki Amaçlı Eğitim Veren Diğer Kursların Faaliyetleri (Özel Öğretim Kurumları Tarafından Verilen Fiziksel Veya Zihinsel Engellilere Yönelik Teknik Ve Mesleki Ortaöğretim (Ortaokul/Lise) Faaliyetleri İle Çıraklık Eğitimi Faaliyetleri Dahil); 855205 Kültürel Eğitim (Bale, Dans, Müzik, Fotoğraf, Halk Oyunu, Resim, Drama, Vb. Eğitimi Dahil, Temel, Orta Ve Yükseköğretim Düzeyinde Verilen Eğitim Hariç); 855301 Sürücü Kursu Faaliyetleri (Ticari Sertifika Veren Sürücülük, Havacılık, Yelkencilik, Gemicilik Eğitimi Hariç); 855903 Bilgisayar, Yazılım, Veri Tabanı, Vb. Eğitimi Veren Kursların Faaliyetleri (Temel, Orta Ve Yükseköğretim Düzeyinde Verilen Eğitim Hariç); 855905 Orta Öğretime, Yüksek Öğretime, Kamu Personeli Vb. Sınavlara Yönelik Kurs Ve Etüt Merkezlerinin Faaliyetleri; 855906 Biçki, Dikiş, Nakış, Halıcılık, Güzellik, Berberlik, Kuaförlük Kurslarının Faaliyetleri … (+7 kod)

**Belge seçimi:** Özel öğretim kursları öğrenci ve velilere dönemsel ücret için e-Arşiv (InvoicePeriod eğitim dönemi), şirketlere personel eğitimi için e-Fatura düzenler. Taksitli tahsilatta tek fatura düzenlenip ödeme planı not olarak verilebilir.

- **Sınav Hazırlık Kursu e-Arşiv** (`meslek-f15-sinav-hazirlik-kursu-e-arsiv`, e-Arşiv Fatura, yerleşim *modern*): YKS hazırlık programı dönem ücreti; taksit planı notlarda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Sürücü Kursu B Sınıfı e-Arşiv** (`meslek-f15-surucu-kursu-b-sinifi-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): B sınıfı sürücü belgesi kursu; teorik + direksiyon dersleri ve sınav harcı ayrımı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Kurumsal İngilizce Eğitimi e-Faturası** (`meslek-f15-kurumsal-ingilizce-egitimi-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Şirket personeline grup halinde iş İngilizcesi eğitimi; ders saati bazlı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### F.16 Matbaacılık

NACE: 133006 Serigrafi Faaliyetleri; 181101 Gazetelerin Basımı (Haftada Dört Veya Daha Fazla Yayınlananlar); 181201 Çıkartma, Takvim, Ticari Katalog, Tanıtım Broşürü, Poster, Satış Bülteni, Kartpostal, Davetiye Ve Tebrik Kartları, Yıllık, Rehber, Resim, Çizim Ve Boyama Kitapları, Çizgi Roman Vb. Basım Hizmetleri; 181202 Gazetelerin, Dergilerin Ve Süreli Yayınların Basım Hizmetleri (Haftada Dört Kereden Daha Az Yayınlananlar); 181203 Ansiklopedi, Sözlük, Kitap, Kitapçık, Müzik Eserleri Ve Müzik El Yazmaları, Atlas, Harita Vb. Basım Hizmetleri; 181204 Röprodüksiyon Basımı (Bir Sanat Eserinin Aslını Bozmadan Basılması); 181206 Posta Pulu, Damga Pulu, Matbu Belgeler, Tapu Senetleri, Akıllı Kart, Çek Defterleri, Kağıt Para Ve Diğer Değerli Kağıtların Ve Benzerlerinin Basım Hizmetleri; 181207 Plastik, Cam, Metal, Ağaç Ve Seramik Üstüne Baskı Hizmetleri … (+4 kod)

**Belge seçimi:** Matbaa her türlü baskı ve basım hizmetinde belirlenmiş alıcılara 615 kodlu 7/10 KDV tevkifatlı e-Fatura düzenler; bireysel müşterilere (davetiye, kartvizit) e-Arşiv keser. Basılı işlerin müşteri deposuna teslimi e-İrsaliye ile yapılır.

- **Katalog Baskı Faturası (Tevkifat 615)** (`meslek-f16-katalog-baski-faturasi-tevkifat-615`, e-Fatura, yerleşim *teknik*): Mobilya üreticisinin ürün kataloğu ve broşür baskısı; 7/10 KDV tevkifatı, iş emri referanslı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 615, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Düğün Davetiyesi e-Arşiv** (`meslek-f16-dugun-davetiyesi-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Çifte özel tasarım düğün davetiyesi ve zarf baskısı; tasarım onay numarası belgede.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Basılı Katalog Sevk İrsaliyesi** (`meslek-f16-basili-katalog-sevk-irsaliyesi`, e-İrsaliye, yerleşim *kenar*): Matbaadan müşteri deposuna koli ve paletli katalog sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### F.17 Müzik Aletleri İmalatı, Onarımı, Ticareti

NACE: 322021 Elektronik Müzik Aletleri Veya Klavyeli Çalgıların İmalatı (Elektrik Gücüyle Ses Üreten Veya Sesi Güçlendirilen Enstrümanlar) (Dijital Piyano, Sintizayzır, Elektrogitar, Vb.); 322023 Ağızları Huni Gibi Genişleyen Neviden Olan Boru Esaslı Müzik Aletleri İle Diğer Üflemeli Müzik Aletlerinin İmalatı (Saksafon, Flüt, Trombon, Borazan, Vb.); 322024 Vurmalı Çalgıların İmalatı (Trampet, Davul, Ksilofon, Zil, Kas Vs.); 322025 Piyanolar Ve Diğer Klavyeli Yaylı/Telli Çalgıların İmalatı; 322026 Borulu Ve Klavyeli Orglar, Armonyumlar, Akordiyonlar, Ağız Mızıkaları (Armonikalar), Tulum Vb. Çalgıların İmalatı; 322027 Müzik Kutuları, Orkestriyonlar, Laternalar, Çıngıraklar Vb. İmalatı; 322028 Metronomlar, Akort Çatalları (Diyapazonlar) Ve Akort Düdükleri, Müzik Kutuları İçin Mekanizmalar, Müzik Aleti Telleri İle Müzik Aletlerinin Parça Ve Aksesuarlarının İmalatı; 322090 Diğer Yaylı/Telli Müzik Aletlerinin İmalatı (Saz, Gitar, Keman, Vb.) … (+5 kod)

**Belge seçimi:** Müzik aleti satıcısı / yapımcısı online satışta e-Arşiv internet satışı, yurt dışından gelen küçük siparişlerde ETGB'li mikro ihracat, okul ve konservatuvarlara toplu satışta e-Fatura düzenler. Onarım hizmetleri de e-Arşiv ile belgelenir.

- **Online Enstrüman Satışı e-Arşiv (İnternet)** (`meslek-f17-online-enstruman-satisi-e-arsiv-internet`, e-Arşiv Fatura, yerleşim *modern*): Web mağazasından klasik gitar ve aksesuar siparişi; kargo ve ödeme aracısı bilgisi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.

- **El Yapımı Bağlama Mikro İhracat (ETGB)** (`meslek-f17-el-yapimi-baglama-mikro-ihracat-etgb`, e-Arşiv (Mikro İhracat / ETGB), yerleşim *kart*): Almanya'daki müzisyene el yapımı uzun sap bağlama; ETGB ve GTİP satırda.
  - e-Arşiv (EARSIVFATURA) + InvoiceTypeCode ISTISNA 301; yabancı alıcı VKN 2222222222 ve ülke kodu; AdditionalDocumentReference ETGB; Delivery/CarrierParty + TrackingID; satırda GTİP (AdditionalItemIdentification). Döviz + kur.

- **Konservatuvara Toplu Enstrüman e-Faturası** (`meslek-f17-konservatuvara-toplu-enstruman-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Özel müzik okuluna keman ve ritim aletleri toplu satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### F.18 Oyuncak İmalatı, Ticareti

NACE: 324003 Yap Boz, Puzzle Ve Benzeri Ürünlerin İmalatı (Lego Vb. Dahil); 324004 İçi Doldurulmuş Oyuncak Bebeklerin Ve Oyuncak Hayvanların İmalatı; 324005 Oyuncak Bebek, Kukla Ve Hayvanlar İle Bunların Giysi, Parça Ve Aksesuarlarının İmalatı (İçi Doldurulmuş Olanlar Hariç); 324009 Oyun Tahtaları (Satranç, Dama, Dart, Tavla Tahtaları, Okey İstekası, Go Vb.) Ve Tabu, Monopol Vb. Oyunların İmalatı; 324010 Tekerlekli Oyuncaklar, Oyuncak Bebek Arabaları, Oyuncak Trenler Ve Diğer Küçültülmüş Boyutlu Modeller/Maketler Veya İnşaat Oyun Takımları, Yarış Setleri İmalatı (Motorlu Olanlar, Pres Döküm Oyuncaklar Ve Plastik Diğer Oyuncaklar Dahil); 324099 Başka Yerde Sınıflandırılmamış Diğer Oyun Ve Oyuncakların İmalatı; 461801 Oyun Ve Oyuncak, Spor Malzemesi, Bisiklet, Kitap, Gazete, Dergi, Kırtasiye Ürünleri, Müzik Aleti, Saat Ve Mücevher İle Fotoğrafçılıkla İlgili Ve Optik Aletlerin Toptan Satışı İle İlgili Aracıların Faaliyetleri; 464904 Oyun Ve Oyuncak Toptan Ticareti … (+1 kod)

**Belge seçimi:** Oyuncak imalatçısı oyuncakçı ve zincir mağazalara e-Fatura, kendi web sitesinden tüketiciye e-Arşiv internet satışı düzenler. Oyuncaklarda CE işareti ve yaş grubu ürün bilgisi olarak satırda gösterilir.

- **Oyuncakçıya Toptan e-Faturası** (`meslek-f18-oyuncakciya-toptan-e-faturasi`, e-Fatura, yerleşim *kenar*): Oyuncak mağaza zincirine ahşap ve eğitici oyuncak toptan satışı; yaş grubu ve CE bilgisi.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Online Oyuncak Satışı e-Arşiv (İnternet)** (`meslek-f18-online-oyuncak-satisi-e-arsiv-internet`, e-Arşiv Fatura, yerleşim *pastel*): Web sitesinden veliye eğitici oyuncak siparişi; kargo bilgisiyle.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.

### F.19 Reklamcılık, Tabelacılık

NACE: 259914 Adi Metallerden İşaret Levhaları Ve Tabelalar İle Rakamlar, Harfler Ve Diğer Sembollerin İmalatı (Oto Plakaları Dahil, Işıklı Olanlar Hariç); 274006 Işıklı Tabela, Işıklı Reklam Panosu Ve Benzerlerinin İmalatı; 279006 Sıvı Kristal Cihazlı (Lcd) Veya Işık Yayan Diyotlu (Led) Gösterge Panelleri İle Bys. Elektrikli Sesli Veya Görsel Sinyalizasyon Cihazlarının İmalatı (Elektronik Sayı Levhası (Skorbord) Dahil); 731101 Reklam Ajanslarının Faaliyetleri (Kullanılacak Medyanın Seçimi, Reklamın Tasarımı, Sözlerin Yazılması, Reklam Filmleri İçin Senaryonun Yazımı, Satış Noktalarında Reklam Ürünlerinin Gösterimi Ve Sunumu Vb.); 741200 Grafik Tasarım Ve Görsel İletişim Faaliyetleri

**Belge seçimi:** Reklam ajansı / tabelacı reklam kampanyası ve medya planlama hizmetinde belirlenmiş alıcılara 625 (3/10) tevkifatlı e-Fatura; tabela imalatı ve montajı mal teslimi olduğundan normal e-Fatura (tevkifatsız) düzenler. e-Fatura mükellefi olmayan esnafa e-Arşiv kesilir.

- **Reklam Kampanyası Faturası (Tevkifat 625)** (`meslek-f19-reklam-kampanyasi-faturasi-tevkifat-625`, e-Fatura, yerleşim *modern*): Mobilya firmasının sezon kampanyası: billboard kiralama, sosyal medya reklamı ve tasarım; 3/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 625, Percent 30 (3/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Işıklı Tabela İmalat ve Montaj e-Faturası** (`meslek-f19-isikli-tabela-imalat-ve-montaj-e-faturasi`, e-Fatura, yerleşim *teknik*): Mağaza cephesine kutu harf LED tabela imalatı ve vinçle montaj; mal teslimi olduğundan tevkifat yok.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Esnafa Vinil Afiş e-Arşiv** (`meslek-f19-esnafa-vinil-afis-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): e-Fatura mükellefi olmayan esnafa vinil afiş ve folyo uygulaması.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### F.20 Sanat Eseri, Antika Ticareti

NACE: 476903 Sanat Eserlerinin Perakende Ticareti (Antika Eşyalar Hariç); 477901 Antika Perakende Ticareti; 903100 Sanat Tesislerinin Ve Alanlarının (Mekanlarının) İşletilmesi; 913000 Kültürel Mirasın Konservasyonu, Restorasyonu Ve Diğer Destek Faaliyetleri (Müzeler Ve Özel Koleksiyonlar Dahil)

**Belge seçimi:** Sanat galerisi koleksiyonculara e-Arşiv, yabancı alıcılara yolcu beraberi eşya faturası düzenler (kültür varlığı niteliğindeki eserlerin yurt dışına çıkışı yasaktır; çağdaş eserler için uygundur). Vatandaştan belge alınamayan antika / eser alımları e-Gider Pusulası ile belgelenir.

- **Koleksiyoncuya Eser Satışı e-Arşiv** (`meslek-f20-koleksiyoncuya-eser-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Çağdaş sanat eseri ve antika obje satışı; eser künyesi ve sertifika referanslı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Yabancı Alıcıya Tablo Satışı (Yolcu Beraberi)** (`meslek-f20-yabanci-aliciya-tablo-satisi-yolcu-beraberi`, e-Fatura (Yolcu Beraberi), yerleşim *serit*): Yabancı turiste çağdaş tablo satışı; pasaport ve aracı kurum bilgisi, KDV iadesi gümrük onayıyla.
  - ProfileID YOLCUBERABERFATURA; AccountingCustomerParty = Gümrük (1460415308); BuyerCustomerParty PARTYTYPE=TAXFREE + Person (ad, soyad, NationalityID) + IdentityDocumentReference (pasaport no / tarihi); TaxRepresentativeParty ARACIKURUMVKN + ARACIKURUMETIKET. KDV hesaplanır, istisna kodu 501.

- **Vatandaştan Antika Alımı Gider Pusulası** (`meslek-f20-vatandastan-antika-alimi-gider-pusulasi`, e-Gider Pusulası, yerleşim *defter*): Aile mirası eşyalarını satan vatandaştan antika obje alımı; ekspertiz tutanağı referanslı.
  - CreditNote · TR1.2.1 · ProfileID GIDERPUSULASI · CreditNoteTypeCode SATIS. Belge vermeyen (vergiden muaf / ÇKS'siz) satıcı AccountingCustomerParty (TCKN + Person, SMS kodu); düzenleyen SMS_PROVIDER. Stopaj yok.

### F.21 Tercümanlık

NACE: 743012 Tercüme Ve Sözlü Tercüme Faaliyetleri (İşaret Dili Dahil)

**Belge seçimi:** Tercüman serbest meslek erbabıdır: bireysel müşteriye stopajsız, şirketlere %20 GV stopajlı e-SMM düzenler. Yurt dışındaki müşteriye verilen ve yurt dışında yararlanılan çeviri hizmeti hizmet ihracatıdır (KDV 11/1-a, istisna 302).

- **Diploma Tercümesi e-SMM (Bireysel)** (`meslek-f21-diploma-tercumesi-e-smm-bireysel`, e-SMM, yerleşim *defter*): Vatandaşa diploma ve transkript yeminli tercümesi; sayfa ve dil çifti satırda.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015). Ödenecek = brüt + KDV − stopaj.

- **Sözleşme Tercümesi e-SMM (Stopajlı)** (`meslek-f21-sozlesme-tercumesi-e-smm-stopajli`, e-SMM, yerleşim *kurumsal*): Dış ticaret şirketine distribütörlük sözleşmesi tercümesi ve toplantı sözlü çevirisi; %20 stopaj.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015) ve GV stopajı 0003 (%20). Ödenecek = brüt + KDV − stopaj.

- **Yurt Dışına Çeviri Hizmeti (Hizmet İhracatı)** (`meslek-f21-yurt-disina-ceviri-hizmeti-hizmet-ihracati`, e-SMM, yerleşim *modern*): Almanya'daki şirkete teknik kılavuz çevirisi; yurt dışında yararlanılan hizmet, KDV istisnası, stopaj yok.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015). Ödenecek = brüt + KDV − stopaj.

### F.22 Züccaciye İmalatı, Ticareti

NACE: 231301 Camdan Şişe, Kavanoz Ve Diğer Muhafaza Kapları, Bardaklar, Termos Ve Diğer Vakumlu Kapların Camdan Yapılmış İç Yüzeyleri İle Camdan Sofra Ve Mutfak Eşyaları İmalatı (Ampuller Hariç); 231302 Tuvalet, Banyo, Büro, İç Dekorasyon, Vb. Amaçlarla Kullanılan Cam Ve Kristal Eşya İmalatı (Camdan Biblo, Boncuk Vb. Küçük Cam Eşyalar Hariç); 234101 Seramik Veya Porselenden Sofra Takımları (Tabak, Bardak, Fincan, Vb.) Ve Diğer Ev Ve Tuvalet Eşyasının İmalatı (Çiniden Olanlar Ve Sıhhi Ürünler Hariç); 234103 Çiniden Sofra Takımı, Ev, Tuvalet Ve Süs Eşyası İmalatı (Çinicilik) (Çini Dekoru Dahil); 234104 Topraktan Güveç, Çanak, Çömlek, Küp, Vazo, Vb. Eşyalar İle Topraktan Heykel Vb. Süs Ve Dekoratif Eşya İmalatı (Porselen Ve Çiniden Olanlar İle Malların Ambalajlanması Ve Taşınması İçin Olanlar Hariç); 234501 Tarımsal Amaçlı Olanlar İle Malların Taşınması Ya Da Ambalajlanması İçin Kullanılan Seramik Ürünlerin İmalatı; 234599 Başka Yerde Sınıflandırılmamış Yapı İşlerinde Kullanılmayan Diğer Seramik Eşyaların İmalatı (Dekoratif Amaçlı Olmayan Seramik Saksılar Dahil); 461590 Diğer Ev Eşyalarının Toptan Satışı İle İlgili Aracıların Faaliyetleri … (+4 kod)

**Belge seçimi:** Züccaciyeci tüketiciye mağazada e-Arşiv, otel ve restoranlara toplu porselen-cam satışında e-Fatura düzenler; toplu teslimatlar kendi aracıyla e-İrsaliye eşliğinde yapılır.

- **Mağaza Satışı e-Arşiv** (`meslek-f22-magaza-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Tüketiciye porselen yemek takımı ve cam bardak seti satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Restorana Toplu Porselen e-Faturası** (`meslek-f22-restorana-toplu-porselen-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Yeni açılan restorana otel tipi porselen, cam ve çatal-bıçak toplu satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Restorana Teslim Sevk İrsaliyesi** (`meslek-f22-restorana-teslim-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Depodan restorana kırılacak eşya sevki; koli adedi ve şoför bilgisi.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### G.01 Alternatif Tedavi Merkezi İşletmeciliği

NACE: 869500 Fizyoterapi Hizmetleri (Tıp Doktorları Dışında Yetkili Kişilerce Sağlanan Fizyoterapi, Ergoterapi Vb. Alanlardaki Hizmetler) (Hastane Dışı); 869600 Geleneksel, Tamamlayıcı Ve Alternatif Tıp Faaliyetleri; 869999 Başka Yerde Sınıflandırılmamış Diğer İnsan Sağlığı Faaliyetleri (Kan Merkezleri İle Kan, Sperm Ve Organ Bankalarının Faaliyetleri Hariç)

**Belge seçimi:** Fizyoterapi / tamamlayıcı tıp merkezi danışana seans paketleri için e-Arşiv düzenler (sağlık hizmetinde indirimli KDV oranı). Türkiye'de yerleşik olmayan yabancı hastalara verilen ve bedeli döviz olarak ödenen sağlık hizmeti KDV 13/l uyarınca istisnadır (ISTISNA 334); alıcı VKN 2222222222 ile gösterilir.

- **Fizik Tedavi Seans Paketi e-Arşiv** (`meslek-g01-fizik-tedavi-seans-paketi-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Danışana 10 seanslık fizik tedavi ve kupa uygulaması; seans planı randevu alanında.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Yabancı Hastaya Tedavi Paketi (İstisna 334)** (`meslek-g01-yabanci-hastaya-tedavi-paketi-istisna-334`, e-Arşiv Fatura, yerleşim *serit*): Türkiye'de yerleşik olmayan yabancı hastaya rehabilitasyon paketi; döviz tahsilat, KDV 13/l istisnası.
  - ProfileID EARSIVFATURA · InvoiceTypeCode ISTISNA.
  - Alıcı e-Fatura mükellefi değil: VKN + PartyName + vergi dairesi.
  - InvoiceTypeCode ISTISNA; KDV TaxSubtotal Percent 0 + TaxExemptionReasonCode 334 (KDV 13/l Yabancılara verilen sağlık hizmetleri).
  - Döviz: DocumentCurrencyCode EUR + PricingExchangeRate (49.912).

### G.02 Cenaze Hizmetleri

NACE: 963001 Cenaze İşleri İle İlgili Faaliyetler (Cenaze Yıkama Yerlerinin İşletilmesi, Cenazenin Nakli, Yıkama Hizmetleri, Defin Hizmetleri Vb.)

**Belge seçimi:** Özel cenaze hizmet işletmesi ailelere e-Arşiv düzenler; belediyelerin ihaleyle verdiği cenaze nakil / yıkama hizmetlerinde KAMU senaryolu e-Fatura (IBAN zorunlu) kullanır.

- **Şehirler Arası Cenaze Nakli e-Arşiv** (`meslek-g02-sehirler-arasi-cenaze-nakli-e-arsiv`, e-Arşiv Fatura, yerleşim *kurumsal*): Aileye cenaze yıkama, tabut ve memleketine nakil hizmeti; güzergâh belge alanında.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Belediyeye Cenaze Nakil Hizmeti (KAMU)** (`meslek-g02-belediyeye-cenaze-nakil-hizmeti-kamu`, e-Fatura, yerleşim *teknik*): Belediye ihalesi kapsamında aylık cenaze nakil araç ve personel hizmeti; KAMU senaryosu.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.

### G.03 Diş Laboratuvarlarının Faaliyetleri

NACE: 325003 Diş Laboratuvarlarının Faaliyetleri (Protez Diş, Metal Kuron, Vb. İmalatı); 325006 Dişçi Çimentosu, Dişçilik Mumları, Dolgu Maddesi, Kemik Tedavisinde Kullanılan Çimento, Jel Preparat, Steril Adhezyon Bariyeri, Dikiş Malzemesi (Katgüt Hariç), Doku Yapıştırıcısı, Laminarya, Emilebilir Hemostatik, Vb. İmalatı

**Belge seçimi:** Diş laboratuvarı ısmarlama protezleri diş hekimine / kliniğe satar: şirket klinikler e-Fatura mükellefiyse aylık toplu e-Fatura, serbest çalışan diş hekimlerine TCKN ile e-Arşiv düzenlenir. Hasta ve iş emri bilgisi satır ve belge referanslarında taşınır.

- **Diş Kliniğine Aylık Protez e-Faturası** (`meslek-g03-dis-klinigine-aylik-protez-e-faturasi`, e-Fatura, yerleşim *teknik*): Ağız ve diş sağlığı polikliniğine Eylül ayı zirkonyum ve implant üstü protez işleri; iş emri bazlı satırlar.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Diş Hekimine Protez e-Arşiv** (`meslek-g03-dis-hekimine-protez-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Serbest çalışan diş hekimine hasta bazlı porselen kron ve hareketli protez; hekim TCKN ile.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### G.04 Dövme Salonu İşletmeciliği

NACE: 969999 Başka Yerde Sınıflandırılmamış Diğer Hizmet Faaliyetleri (Dövme Ve Piercing Hizmetleri Vb.)

**Belge seçimi:** Dövme stüdyosu bireysel müşterilere seans bazlı e-Arşiv düzenler; dizi / reklam prodüksiyonlarına geçici dövme ve sanatçı hizmetini kurumsal e-Fatura ile faturalar.

- **Dövme Seansı e-Arşiv** (`meslek-g04-dovme-seansi-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Müşteriye kol dövmesi (2 seans) ve piercing; seans ve randevu bilgisi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Dizi Setine Geçici Dövme e-Faturası** (`meslek-g04-dizi-setine-gecici-dovme-e-faturasi`, e-Fatura, yerleşim *modern*): Dizi prodüksiyonu için oyunculara geçici dövme tasarımı ve set günü uygulaması.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### G.05 Erkek Berberliği

NACE: 962102 Erkekler İçin Kuaför Ve Berber İşletmelerinin Faaliyetleri

**Belge seçimi:** Berberlerin önemli kısmı basit usul / esnaf muaflığındadır ve fatura düzenleme zorunluluğu yoktur; işletme hesabı esasına tabi berber müşteri talebinde e-Arşiv, anlaşmalı otel veya kurumlara verilen hizmette e-Fatura düzenler.

- **Berber Hizmeti e-Arşiv** (`meslek-g05-berber-hizmeti-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Müşteriye saç kesimi, sakal ve cilt bakımı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Otel Misafir Berber Hizmeti e-Faturası** (`meslek-g05-otel-misafir-berber-hizmeti-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Anlaşmalı otelin misafirlerine verilen aylık berber hizmeti; kişi sayısı bazlı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### G.06 Genel Temizlik, Haşere Kontrol Faaliyetleri

NACE: 812101 Binaların Genel Temizliği (Uzmanlaşmış Temizlik Faaliyetleri Hariç); 812203 Nesne Veya Binaların (Ameliyathaneler Vb.) Sterilizasyonu Faaliyetleri; 812204 Yapıların Dış Cepheleri İçin Buharlı Temizleme, Kum Püskürtme Vb. Uzmanlaşmış Temizlik Faaliyetleri; 812205 Yeni Binaların İnşaat Sonrası Temizliği; 812299 Başka Yerde Sınıflandırılmamış Diğer Bina Ve Endüstriyel Temizlik Faaliyetleri (Sterilizasyon Faaliyetleri Hariç); 812301 Böceklerin, Kemirgenlerin Ve Diğer Zararlıların İmhası Ve Haşere Kontrol Faaliyetleri (Tarımsal Zararlılarla Mücadele Hariç); 812399 Başka Yerde Sınıflandırılmamış Diğer Temizlik Faaliyetleri (Oto Yıkama Hariç)

**Belge seçimi:** Temizlik firması belirlenmiş alıcılara (kamu idareleri, büyük şirketler) verdiği temizlik ve haşere kontrol hizmetinde 612 kodlu 9/10 KDV tevkifatlı e-Fatura düzenler; kamu alıcıda KAMU senaryosu. Ev ilaçlama ve bireysel temizlik hizmetleri e-Arşiv ile belgelenir.

- **Aylık Ofis Temizliği Faturası (Tevkifat 612)** (`meslek-g06-aylik-ofis-temizligi-faturasi-tevkifat-612`, e-Fatura, yerleşim *kurumsal*): Plaza ofislerinin aylık temizlik hizmeti; personel ve sarf malzeme ayrı satırda, 9/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 612, Percent 90 (9/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Hastaneye İlaçlama Hizmeti (KAMU + Tevkifat 612)** (`meslek-g06-hastaneye-ilaclama-hizmeti-kamu-tevkifat-612`, e-Fatura, yerleşim *teknik*): Devlet hastanesine haşere kontrol ve dezenfeksiyon; KAMU senaryosu ve 9/10 tevkifat.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 612, Percent 90 (9/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Ev İlaçlama e-Arşiv** (`meslek-g06-ev-ilaclama-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Daireye hamam böceği ilaçlaması ve garanti kontrolü.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### G.07 Güzellik Salonu İşletmeciliği

NACE: 962201 Güzellik Salonlarının Faaliyetleri (Cilt Bakımı, Kaş Alma, Ağda, Manikür, Pedikür, Makyaj, Kalıcı Makyaj Vb.nin Bir Arada Sunulduğu Salonlar) (Sağlık Bakım Hizmetleri Hariç); 962202 Sadece Manikür Ve Pedikür Hizmeti Sunan Salonların Faaliyetleri; 962203 Sadece Ağdacılık Hizmeti Sunan Salonların Faaliyetleri

**Belge seçimi:** Güzellik salonu seans paketlerini e-Arşiv ile belgeler (paket bedeli peşin tahsil ediliyorsa fatura tahsilatta düzenlenir, seans planı belgede gösterilir); otellerin spa bölümüne verdiği taşeron hizmeti e-Fatura ile faturalar.

- **Lazer ve Cilt Bakımı Paketi e-Arşiv** (`meslek-g07-lazer-ve-cilt-bakimi-paketi-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Danışana 6 seans lazer epilasyon ve cilt bakımı paketi; seans planı ve uzman bilgisi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Otel SPA Taşeron Hizmeti e-Faturası** (`meslek-g07-otel-spa-taseron-hizmeti-e-faturasi`, e-Fatura, yerleşim *zarif*): Otel spa bölümünde verilen bakım hizmetlerinin aylık mutabakat faturası.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### G.08 Hasta Bakıcılığı

NACE: 869401 Ebe, Sağlık Memuru, Sünnetçi, İğneci, Pansumancı Vb.leri Tarafından Verilen Hizmetler (Tıp Doktorları Dışında Yetkili Kişilerce Sağlanan Gebelik Süresince Ve Doğum Sonrası İzleme Ve Tıbbi İşlemleri Kapsayan Aile Planlaması Hizmetleri Dahil) (Hastane Dışı); 869402 Hemşirelik Hizmetleri (Evdeki Hastalar İçin Bakım, Koruma, Anne Bakımı, Çocuk Sağlığı Ve Hemşirelik Bakımı Alanındaki Benzeri Hizmetler Dahil; Hemşireli Yatılı Bakım Tesislerinin Faaliyetleri İle Tıp Doktorlarının Hizmetleri Hariç) (Hastane Dışı); 871001 Hemşireli Yatılı Bakım Faaliyetleri (Hemşireli Bakım Evlerinin, Hemşireli Huzur Evlerinin Faaliyetleri Dahil; Sadece Asgari Düzeyde Hemşire Bakımı Sağlanan Yaşlı Evlerinin, Yetimhanelerin, Yurtların Faaliyetleri İle Evlerde Sağlanan Hizmetler Hariç); 872002 Zihinsel Rahatsızlığı Veya Madde Kullanımı Teşhisi Olan Kişilere Yönelik Yatılı Bakım Faaliyetleri (Hastanelerin Faaliyetleri İle Yatılı Sosyal Hizmet Faaliyetleri Hariç); 873002 Yaşlılara Ve Bedensel Engellilere Yönelik Yatılı Bakım Faaliyetleri (Destekli Yaşam Tesisleri, Hemşire Bakımı Olmayan Huzurevleri Ve Asgari Düzeyde Hemşire Bakımı Olan Evlerin Faaliyetleri Dahil, Yaşlılar İçin Hemşire Bakımlı Evlerin Faaliyetleri Hariç); 881002 Yaşlılar Ve Bedensel Engelliler İçin Barınacak Yer Sağlanmaksızın Verilen Sosyal Hizmetler (Yatılı Bakım Faaliyetleri İle Engelli Çocuklara Yönelik Gündüz Bakım (Kreş) Faaliyetleri Hariç); 889907 Barınacak Yer Sağlanmaksızın Mesleki Rehabilitasyon Hizmetleri (Bedensel Engelliler İçin Rehabilitasyon Hizmetleri Hariç); 889909 Barınacak Yer Sağlanmaksızın Çocuk Ve Gençlere Yönelik Rehabilitasyon Hizmetleri (Zihinsel Engelliler İçin Olanlar Dahil, Bedensel Engellilere Yönelik Olanlar Hariç) … (+2 kod)

**Belge seçimi:** Serbest çalışan hemşire / hasta bakıcı serbest meslek erbabıdır: aileye e-SMM (stopajsız), özel bakım evi veya sağlık kuruluşuna verdiği hizmette %20 GV stopajlı e-SMM düzenler. Yatılı bakım evi işleten şirketler ise sakinlere aylık e-Arşiv keser.

- **Evde Hasta Bakımı e-SMM** (`meslek-g08-evde-hasta-bakimi-e-smm`, e-SMM, yerleşim *pastel*): Aileye aylık evde yaşlı bakımı ve pansuman hizmeti; gerçek kişi müşteri, stopaj yok.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015). Ödenecek = brüt + KDV − stopaj.

- **Bakım Evine Hemşirelik e-SMM (Stopajlı)** (`meslek-g08-bakim-evine-hemsirelik-e-smm-stopajli`, e-SMM, yerleşim *kurumsal*): Özel huzurevine gece nöbeti hemşirelik hizmeti; işveren %20 stopaj keser.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015) ve GV stopajı 0003 (%20). Ödenecek = brüt + KDV − stopaj.

### G.09 Kadın Kuaförlüğü

NACE: 962101 Kadınlar İçin Kuaför İşletmelerinin Faaliyetleri

**Belge seçimi:** Kadın kuaförü müşteriye e-Arşiv düzenler; düğün organizasyon şirketlerine toplu gelin / nedime hizmetlerini e-Fatura ile faturalar. Satılan bakım ürünleri hizmetle aynı belgede ayrı satırdır.

- **Kuaför Hizmeti e-Arşiv** (`meslek-g09-kuafor-hizmeti-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Müşteriye ombre boyama, kesim, fön ve bakım ürünü satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Organizasyon Firmasına Gelin Paketi e-Faturası** (`meslek-g09-organizasyon-firmasina-gelin-paketi-e-faturasi`, e-Fatura, yerleşim *zarif*): Düğün organizasyon şirketine gelin saçı-makyajı ve nedime hizmetleri; etkinlik tarihi dönemde.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### G.10 Kaplıca, Hamam İşletmeciliği

NACE: 962301 Hamam, Sauna, Vb. Yerlerin Faaliyetleri; 962302 Zayıflama Salonu, Masaj Salonu, Solaryum Vb. Yerlerin İşletilmesi Faaliyetleri (Form Tutma Salonlarının Ve Diyetisyenlerin Faaliyetleri Hariç); 962303 Kaplıca, Ilıca, İçmeler, Spa Merkezleri, Vb. Yerlerin Faaliyetleri (Konaklama Hizmetleri Hariç)

**Belge seçimi:** Hamam ve kaplıca işletmesi bireysel ziyaretçilere e-Arşiv, misafirlerini getiren tur acentelerine toplu e-Fatura düzenler. Turistlere verilen hamam hizmeti Türkiye'de tüketildiğinden hizmet ihracatı değildir; konaklama içermediği için konaklama vergisi de uygulanmaz.

- **Hamam Paketi e-Arşiv** (`meslek-g10-hamam-paketi-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Ziyaretçiye termal hamam girişi, kese-köpük ve masaj paketi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Tur Acentesine Grup Hamam e-Faturası** (`meslek-g10-tur-acentesine-grup-hamam-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Yabancı turist grubunu getiren acenteye toplu hamam paketi; grup kodu belge alanında.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### G.11 Kozmetik İmalatı, Ticareti

NACE: 204201 Ağız Veya Diş Bakım Ürünleri İmalatı (Diş Macunu, Vb. İle Takma Dişleri Ağızda Sabit Tutmaya Yarayan Macun Ve Tozlar İle Diş Temizleme İplikleri Dahil); 204202 Kolonya İmalatı; 204203 Parfüm Ve Koku Verici Diğer Sıvı Ürün, Manikür/Pedikür Müstahzarı, Güneş Koruyucu Ürünler, Dudak Ve Göz Makyajı Ürünü, Banyo Tuzu, Kozmetik Veya Kişisel Bakım Amaçlı Pudra, Sabun Ve Organik Yüzey Aktif Müstahzarı, Deodorant, Vb. İmalatı (Kolonya Hariç); 204204 Şampuan, Saç Kremi, Saç Spreyi, Jöle, Saç Düzleştirme Ve Perma Ürünleri, Saç Losyonları, Saç Boyaları, Vb. İmalatı; 205919 Uçucu Yağların İmalatı; 329103 Diş Fırçaları, Saç Fırçaları, Tıraş Fırçaları Ve Kişisel Bakım İçin Kullanılan Diğer Fırçalar İle Resim Fırçaları, Yazı Fırçaları Ve Kozmetik Fırçaların İmalatı; 329906 Peruk, Takma Saç, Takma Sakal, Takma Kaş Vb. İmalatı; 461802 Kozmetik, Parfüm Ve Bakım Ürünleri İle Temizlik Malzemesinin Toptan Satışı İle İlgili Aracıların Faaliyetleri … (+3 kod)

**Belge seçimi:** Kozmetik imalatçısı parfüm (kolonya hariç), makyaj ve cilt bakım ürünlerinin ilk tesliminde ÖTV (IV) sayılı liste %20 ÖTV hesaplar (TaxTypeCode 0074, KDV matrahına dahil); şampuan ve kolonya bu kapsam dışındadır. Toptan satış e-Fatura, web satışı e-Arşiv internet satışı, yurt dışına küçük gönderiler mikro ihracat ile belgelenir.

- **Eczane Deposuna Kozmetik e-Faturası (ÖTV IV)** (`meslek-g11-eczane-deposuna-kozmetik-e-faturasi-otv-iv`, e-Fatura, yerleşim *kurumsal*): Parfüm ve cilt bakım kremlerinde imalatçı ilk teslimi %20 ÖTV; kolonya ve şampuan ÖTV'siz.
  - ÖTV satır vergisi (TaxTypeCode 0071 I. liste / 9077 II. liste taşıtlar / 0073 III. liste / 0074 IV. liste) KDV matrahına dahil edilir; maktu ÖTV için PerUnitAmount, nispi için Percent kullanılır.

- **Online Kozmetik Satışı e-Arşiv (İnternet)** (`meslek-g11-online-kozmetik-satisi-e-arsiv-internet`, e-Arşiv Fatura, yerleşim *pastel*): Web mağazasından tüketiciye parfüm ve krem siparişi; ÖTV fiyata dahil (perakende satışta ayrıca ÖTV hesaplanmaz).
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.

- **Yurt Dışı Kozmetik Gönderisi Mikro İhracat (ETGB)** (`meslek-g11-yurt-disi-kozmetik-gonderisi-mikro-ihracat-etgb`, e-Arşiv (Mikro İhracat / ETGB), yerleşim *kart*): Hollanda'daki müşteriye web siparişi; ETGB ve GTİP 3303 / 3304.
  - e-Arşiv (EARSIVFATURA) + InvoiceTypeCode ISTISNA 301; yabancı alıcı VKN 2222222222 ve ülke kodu; AdditionalDocumentReference ETGB; Delivery/CarrierParty + TrackingID; satırda GTİP (AdditionalItemIdentification). Döviz + kur.

### G.12 Optik Ürünlerin İmalatı, Ticareti

NACE: 267011 Objektif Merceği, Levha Ve Tabaka Halinde Polarizan Madde, Renk Filtresi, Optik Mercek, Prizma, Ayna Ve Diğer Optik Elemanlar İle Dürbün, Optik Mikroskop, Optik Teleskop Ve Diğer Astronomik Aletler İle Bunların Aksam Ve Parçalarının İmalatı; 325004 Gözlükler Ve Lensler İle Parçalarının İmalatı; 331303 Profesyonel Optik Aletlerin Ve Fotoğrafçılık Ekipmanlarının Onarım Ve Bakımı (Tüketici Elektronik Ürünlerinin Onarımı Hariç); 464311 Optik Ürünlerin Toptan Ticareti; 477402 Gözlük, Kontak Lens, Gözlük Camı Vb. Perakende Ticareti; 477807 Optik Ve Hassas Aletlerin Perakende Ticareti (Mikroskop, Dürbün Ve Pusula Dahil; Gözlük Camı, Fotoğrafik Ürünler Hariç)

**Belge seçimi:** Optisyen reçeteli gözlük ve lens satışında tüketiciye e-Arşiv düzenler; SGK'lı hastaların reçeteli gözlük camı / çerçeve bedelini SGK'ya aylık InvoiceTypeCode SGK + AccountingCost SAGLIK_OPT ile faturalar (alıcı SGK, mükellef kodu ve dosya no zorunlu).

- **Numaralı Gözlük Satışı e-Arşiv** (`meslek-g12-numarali-gozluk-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *modern*): Reçeteli progresif cam ve çerçeve satışı; diyoptri değerleri ve reçete numarası satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **SGK Reçeteli Gözlük Faturası (SAGLIK_OPT)** (`meslek-g12-sgk-receteli-gozluk-faturasi-saglik-opt`, e-Fatura, yerleşim *kurumsal*): Eylül ayında SGK provizyonlu verilen gözlük camı ve çerçeve bedellerinin SGK'ya faturası.
  - InvoiceTypeCode SGK; alıcı SGK (VKN 7750409379); AccountingCost SAGLIK_OPT; InvoicePeriod (dönem); AdditionalDocumentReference MUKELLEF_KODU, MUKELLEF_ADI, DOSYA_NO.

### G.13 Spor Malzemeleri İmalatı, Ticareti

NACE: 139610 Can Yeleği Ve Can Kurtaran Simidi İmalatı; 139611 Paraşüt (Yönlendirilebilen Paraşütler Dahil) Ve Rotoşüt İle Bunların Parçalarının İmalatı; 323017 Kar Kayakları, Kayak Ayakkabıları, Kayak Botları, Kayak Batonları, Buz Patenleri Ve Tekerlekli Patenler İle Su Kayağı Araçları, Sörf Tahtaları, Rüzgar Sörfleri Vb. Ekipmanlar İle Bunların Parçalarının İmalatı (Kaykaylar Dahil); 323018 Jimnastik Ve Atletizm Eşyaları İle Form Tutma Salonlarına Ait Eşya Ve Ekipmanların İmalatı (Atlama Beygiri, Dambıl Ve Halterler, Kürek Çekme Ve Bisiklete Binme Aletleri, Ciritler, Çekiçler; Boks Çalışma Topları, Boks Veya Güreş İçin Ringler Vb.); 323019 Spor Amaçlı Dağcılık, Avcılık Veya Balıkçılık Eşyalarının İmalatı (Kasklar, Olta Kamışları, Olta İğneleri Ve Kancaları, Otomatik Olta Makaraları, El Kepçeleri, Kelebek Ağları, Yapma Balıklar, Sinekler Gibi Suni Yemler, Kurşunlar, Yapma Kuşlar Vb.); 323020 Spor Veya Açık Hava Oyunları İçin Diğer Eşyaların İmalatı (Boks Eldiveni, Spor Eldiveni, Yaylar, Beyzbol Ve Golf Sopaları İle Top Ve Diğer Eşyaları, Tenis Masası, Raket, Ağ Ve Topları, Tozluklar, Bacak Koruyucular, Şişme Ve Diğer Havuzlar Vb.); 323021 Top İmalatı (Beyzbol, Futbol, Basketbol Ve Voleybol İçin); 464902 Spor Malzemesi Toptan Ticareti … (+10 kod)

**Belge seçimi:** Spor malzemesi üreticisi / satıcısı spor salonlarına ve kulüplere e-Fatura, tüketiciye online e-Arşiv internet satışı, gençlik ve spor müdürlükleri gibi kamu idarelerine KAMU senaryolu e-Fatura düzenler.

- **Spor Salonuna Fitness Ekipmanı e-Faturası** (`meslek-g13-spor-salonuna-fitness-ekipmani-e-faturasi`, e-Fatura, yerleşim *endustri*): Fitness merkezine koşu bandı, ağırlık seti ve kurulum; seri numaraları satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Online Spor Malzemesi e-Arşiv (İnternet)** (`meslek-g13-online-spor-malzemesi-e-arsiv-internet`, e-Arşiv Fatura, yerleşim *modern*): Web mağazasından yoga matı ve direnç bandı siparişi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.

- **Gençlik ve Spor Müdürlüğüne Malzeme (KAMU)** (`meslek-g13-genclik-ve-spor-mudurlugune-malzeme-kamu`, e-Fatura, yerleşim *kurumsal*): Spor okulları için top, forma ve antrenman ekipmanı; KAMU senaryosu, IBAN zorunlu.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.

### G.14 Spor Tesisi İşletmeciliği

NACE: 855103 Spor Ve Eğlence (Rekreasyon) Eğitimi (Fitness Merkezleri Tarafından Sağlanan Eğitimler İle Temel, Orta Ve Yükseköğretim Düzeyinde Verilen Eğitim Hariç); 931101 Spor Tesislerinin İşletilmesi (Hipodromların İşletilmesi Hariç); 931301 Fitness Merkezlerinin Faaliyetleri (Yoga, Pilates, Tai Chi Stüdyolarının Faaliyetleri Vb. Dahil); 931903 Spor Ve Eğlence Amaçlı Sporlara İlişkin Destek Faaliyetleri; 931999 Başka Yerde Sınıflandırılmamış Diğer Spor Amaçlı Faaliyetler

**Belge seçimi:** Spor tesisi üyelik ve saatlik kullanım bedellerini tüketiciye e-Arşiv (üyelik dönemi InvoicePeriod, üyelik no belge referansı) ile; çalışanları için kurumsal üyelik alan şirketlere e-Fatura ile faturalar.

- **Yıllık Fitness Üyeliği e-Arşiv** (`meslek-g14-yillik-fitness-uyeligi-e-arsiv`, e-Arşiv Fatura, yerleşim *modern*): Üyeye 12 aylık fitness + pilates üyeliği; üyelik dönemi ve kart numarası.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Halı Saha Kiralama e-Arşiv** (`meslek-g14-hali-saha-kiralama-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Haftalık sabit halı saha kiralaması; saat ve saha bilgisi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Kurumsal Üyelik e-Faturası** (`meslek-g14-kurumsal-uyelik-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Şirket çalışanları için 25 kişilik kurumsal fitness üyeliği; aylık faturalama.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### G.15 Temizlik Malzemeleri İmalatı, Ticareti

NACE: 172202 Kağıt Hamurundan, Kağıttan, Selüloz Vatkadan Veya Selüloz Lifli Ağlardan Tuvalet Kağıdı, Kağıt Mendil, Temizlik Veya Yüz Temizleme İçin Kağıt Mendil Ve Havlular İle Masa Örtüsü Ve Peçetelerin İmalatı; 172204 Kağıt Hamurundan, Kağıttan, Selüloz Vatkadan Veya Selüloz Lifli Ağlardan Hijyenik Havlu Ve Tamponlar, Kadın Bağı, Pedler, Bebek Bezleri Vb. Hijyenik Ürünler İle Giyim Eşyası Ve Giysi Aksesuarlarının İmalatı; 201304 Karbonatların İmalatı (Sodyum, Kalsiyum Ve Diğerleri) (Çamaşır Sodası Dahil); 202011 Böcek İlacı, Kemirgen İlacı, Küf Ve Mantar İlacı, Yabancı Otla Mücadele İlacı İmalatı; 202015 Dezenfektan İmalatı (Tarımsal Ve Diğer Kullanımlar İçin) (Hijyenik Maddeler, Bakteriostatlar Ve Sterilize Ediciler Dahil) (Doğal Dezenfektanlar Hariç); 202016 Doğal Dezenfektan İmalatı; 204101 Kapalı Alanlar İçin Kokulu Müstahzarlar Ve Koku Gidericiler İle Suni Mumların İmalatı (Kişisel Kullanım İçin Olanlar Hariç); 204104 Sabun, Yıkama Ve Temizleme Müstahzarları (Deterjanlar) İle Sabun Olarak Kullanılan Müstahzarlar İmalatı (Kişisel Bakım İçin Olanlar İle Ovalama Toz Ve Kremleri Hariç) … (+7 kod)

**Belge seçimi:** Temizlik ürünleri üreticisi market zincirleri ve toptancılara e-Fatura, sevkiyatlarda e-İrsaliye düzenler; Azerbaycan, Irak gibi pazarlara ihracat IHRACAT profiliyle gümrük muhataplı faturalanır.

- **Market Zincirine Deterjan e-Faturası** (`meslek-g15-market-zincirine-deterjan-e-faturasi`, e-Fatura, yerleşim *endustri*): Market zinciri merkez deposuna çamaşır ve bulaşık deterjanı; promosyon iskontosu satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Deterjan Sevk İrsaliyesi** (`meslek-g15-deterjan-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Fabrikadan market zinciri deposuna tır ile paletli sevkiyat.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

- **Azerbaycan'a Deterjan İhracatı (CPT)** (`meslek-g15-azerbaycan-a-deterjan-ihracati-cpt`, e-Fatura (İhracat), yerleşim *serit*): Bakü'deki distribütöre deterjan ve dezenfektan ihracatı; GTİP 3402 / 3808.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (CPT), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz USD + PricingExchangeRate.

### G.16 Tıbbi Malzemelerin İmalatı, Ticareti

NACE: 205907 Laboratuvar İçin Hazır Kültür Ortamları, Model Hamurları, Kompozit Diyagnostik Reaktifler Veya Laboratuvar Reaktifleri İmalatı; 212002 Yapışkanlı Bandajlar, Katkütler Ve Benzeri Tıbbi Malzemelerin Üretimi (Steril Cerrahi Katgütler, Eczacılık Maddeleri İle Birlikte Kullanılan Tamponlar, Hidrofil Pamuk, Gazlı Bez, Sargı Bezi Vb.); 221208 Kauçuktan Hijyenik Ve Eczacılık Ürünlerinin İmalatı (Prezervatifler, Emzikler, Hijyenik Eldivenler Vb. Dahil); 266001 Işınlama, Elektro Medikal Ve Elektro Terapi İle İlgili Cihazların İmalatı; 325002 Tıpta, Cerrahide Ve Dişçilikte Kullanılan Protezler, Ortopedik Cihazlar Ve Aksesuarların İmalatı; 325007 Tıpta, Cerrahide, Dişçilikte Veya Veterinerlikte Kullanılan Şırınga, İğne, Katater, Kanül Ve Benzerlerinin İmalatı; 325014 Tıpta, Cerrahide Ve Dişçilikte Kullanılan Araç-Gereç Ve Cihazların İmalatı (Ortopedik Cihazlar Hariç); 325015 Terapatik Alet Ve Cihazların İmalatı (Suni Solunum Veya Terapatik Solunum Cihazları Hariç) … (+6 kod)

**Belge seçimi:** Tıbbi malzeme firması hastane ve sağlık kuruluşlarına ILAC_TIBBICIHAZ profilli e-Fatura (GTIN, lot, son kullanma, ÜTS no satırda), SGK'ya reçeteli ortez-protez ve medikal malzemeler için SGK tipli fatura (AccountingCost SAGLIK_MED), hastalara doğrudan satışta e-Arşiv düzenler.

- **Hastaneye Steril Sarf Faturası (İlaç / Tıbbi Cihaz)** (`meslek-g16-hastaneye-steril-sarf-faturasi-ilac-tibbi-cihaz`, e-Fatura, yerleşim *teknik*): Özel hastaneye steril enjektör, kateter ve yara örtüsü; GTIN, lot, SKT ve ÜTS takip alanları.
  - ProfileID ILAC_TIBBICIHAZ: satırlarda ürün takip bilgileri (GTIN / seri / lot / son kullanma, ÜTS no) AdditionalItemIdentification ile; alıcı sağlık kuruluşu veya ecza deposu.

- **SGK Medikal Malzeme Faturası (SAGLIK_MED)** (`meslek-g16-sgk-medikal-malzeme-faturasi-saglik-med`, e-Fatura, yerleşim *kurumsal*): Eylül ayında reçeteyle verilen ortez ve hasta bezi bedellerinin SGK'ya faturası.
  - InvoiceTypeCode SGK; alıcı SGK (VKN 7750409379); AccountingCost SAGLIK_MED; InvoicePeriod (dönem); AdditionalDocumentReference MUKELLEF_KODU, MUKELLEF_ADI, DOSYA_NO.

- **Hastaya Tekerlekli Sandalye e-Arşiv** (`meslek-g16-hastaya-tekerlekli-sandalye-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Hasta yakınına katlanır tekerlekli sandalye ve havalı yatak satışı; seri no ve garanti satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### G.17 Tuvalet İşletmeciliği

NACE: 969907 Genel Tuvaletlerin İşletilmesi Faaliyeti

**Belge seçimi:** Umumi tuvalet giriş ücretleri ödeme kaydedici cihaz fişiyle belgelenir; işletmeci AVM ve kurumlara verdiği tuvalet işletme-temizlik hizmetini 612 (9/10) tevkifatlı e-Fatura ile, düğün / etkinlik için seyyar WC kabini hizmetini bireysel müşteriye e-Arşiv ile faturalar.

- **AVM Tuvalet İşletme Faturası (Tevkifat 612)** (`meslek-g17-avm-tuvalet-isletme-faturasi-tevkifat-612`, e-Fatura, yerleşim *kurumsal*): Alışveriş merkezinin tuvaletlerinin aylık işletme ve temizlik hizmeti; personel ve sarf satırları.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 612, Percent 90 (9/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Kır Düğünü Seyyar WC e-Arşiv** (`meslek-g17-kir-dugunu-seyyar-wc-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Kır düğünü için seyyar WC kabini kurulumu, temizlik ve söküm.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### H.01 Alüminyum Ürün İmalatı

NACE: 244216 Alüminyum Folyo İmalatı (Alaşımdan Olanlar Dahil); 244218 Alüminyum Sac, Levha, Tabaka, Şerit İmalatı (Alaşımdan Olanlar Dahil); 244221 Alüminyum Bar, Çubuk, Tel Ve Profil, Tüp, Boru Ve Bağlantı Parçaları İmalatı (Alaşımdan Olanlar Dahil); 251204 Alüminyum Kapı, Pencere, Bunların Kasaları, Kapı Eşiği, Panjur, Vb. İmalatı; 259203 Kapasitesi 300 Lt.yi Geçmeyen Alüminyum Varil Fıçı, Kova Vb. İmalatı (Diş Macunu, Krem Gibi Kapaklı Tüpler Ve Katlanabilir Kutular İle Aerosol Kutuları Dahil); 259901 Demir, Çelik Ve Alüminyumdan Sofra Ve Mutfak Eşyalarının İmalatı (Tencere, Tava, Çaydanlık, Cezve, Yemek Kapları, Bulaşık Telleri Vb.) (Teflon, Emaye Vb. İle Kaplanmışlar Dahil, Bakırdan Olanlar Hariç)

**Belge seçimi:** Alüminyum ürün teslimleri belirlenmiş alıcılara 619 kodlu (bakır, çinko, alüminyum ve kurşun ürünleri) 7/10 KDV tevkifatlı e-Fatura ile yapılır; ev sahiplerine doğrama ve montaj e-Arşiv ile belgelenir. Şantiyeye profil sevkiyatı e-İrsaliye gerektirir.

- **Alüminyum Profil Satışı (Tevkifat 619)** (`meslek-h01-aluminyum-profil-satisi-tevkifat-619`, e-Fatura, yerleşim *endustri*): Yapı firmasına alüminyum doğrama profili ve cephe aksesuarı; 7/10 KDV tevkifatı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 619, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Ev Pencere Doğraması e-Arşiv** (`meslek-h01-ev-pencere-dogramasi-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Ev sahibine ısıcamlı alüminyum pencere ve sürgülü balkon kapısı imalatı ve montajı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Şantiyeye Profil Sevk İrsaliyesi** (`meslek-h01-santiyeye-profil-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Fabrikadan şantiyeye boy profil sevki; ağırlık ve paket bilgisi.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### H.02 At Arabası İmalatı, Onarımı

NACE: 309902 Hayvanlar Tarafından Çekilen Araçların İmalatı (At, Eşek Arabası, Fayton, Vb.); 331799 Başka Yerde Sınıflandırılmamış Diğer Ulaşım Ekipmanlarının Onarım Ve Bakımı

**Belge seçimi:** At arabası / fayton imalatçısı turizm işletmelerine e-Fatura, çiftçi ve bireysel alıcılara imalat ve onarım için e-Arşiv düzenler.

- **Turizm İşletmesine Fayton İmalatı e-Faturası** (`meslek-h02-turizm-isletmesine-fayton-imalati-e-faturasi`, e-Fatura, yerleşim *zarif*): Fayton turu işletmesine iki adet gezi faytonu imalatı; deri döşeme ve aydınlatma satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **At Arabası Onarım e-Arşiv** (`meslek-h02-at-arabasi-onarim-e-arsiv`, e-Arşiv Fatura, yerleşim *defter*): Çiftçinin at arabasının tekerlek çemberi ve dingil onarımı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### H.03 Bakırcılık

NACE: 244401 Bakır, Bakır Matı, Bakır Tozu, Semente Bakır, Bakır Anotu İle Bakır Ve Bakır Alaşımlarının İmalatı; 244403 Bakır Sac, Tabaka, Levha, Şerit, Folyo İmalatı (Alaşımdan Olanlar Dahil); 244404 Bakırın Çekilmesi Ve Haddelenmesi İle Tüp, Boru, Bunların Bağlantı Elemanları, Bar, Çubuk, Tel Ve Profil İmalatı (Alaşımdan Olanlar Dahil); 259906 Bakırdan Sofra Ve Mutfak Eşyası İmalatı (Cezve, Tencere, Çanak, Tabak, İbrik Vb.); 259918 Bakırdan Yapılan Biblolar, Çerçeveler, Aynalar Ve Diğer Süsleme Eşyaları İle Süsleme İşleri (Mutfak Eşyaları Hariç); 475513 Bakır Eşya, Bakır Sofra Ve Mutfak Eşyası Perakende Ticareti

**Belge seçimi:** Bakırcı turistlere yolcu beraberi eşya faturası (Tax Free), yerli müşterilere ürün ve kalaylama hizmetinde e-Arşiv düzenler. Bakır ürünlerinin belirlenmiş alıcılara (otel zincirleri gibi) tesliminde 619 kodlu 7/10 KDV tevkifatı uygulanır.

- **Turiste Bakır Eşya Satışı (Yolcu Beraberi)** (`meslek-h03-turiste-bakir-esya-satisi-yolcu-beraberi`, e-Fatura (Yolcu Beraberi), yerleşim *serit*): Yabancı turiste el işi bakır tepsi ve cezve takımı; pasaport ve aracı kurum bilgisi.
  - ProfileID YOLCUBERABERFATURA; AccountingCustomerParty = Gümrük (1460415308); BuyerCustomerParty PARTYTYPE=TAXFREE + Person (ad, soyad, NationalityID) + IdentityDocumentReference (pasaport no / tarihi); TaxRepresentativeParty ARACIKURUMVKN + ARACIKURUMETIKET. KDV hesaplanır, istisna kodu 501.

- **Kalaylama ve Bakır Satışı e-Arşiv** (`meslek-h03-kalaylama-ve-bakir-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *defter*): Müşterinin bakır kazanlarının kalaylanması ve yeni sahan satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Otel Zincirine Bakır Servis Takımı (Tevkifat 619)** (`meslek-h03-otel-zincirine-bakir-servis-takimi-tevkifat-619`, e-Fatura, yerleşim *kurumsal*): Otel restoranları için bakır servis sahanı ve ibrik; bakır ürünleri teslimi 7/10 tevkifatlı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 619, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### H.04 Çilingirlik

NACE: 256204 Kilit Ve Menteşe İmalatı; 800901 Çilingirlik Hizmetleri; 952904 Anahtar Çoğaltma Hizmetleri

**Belge seçimi:** Çilingir bireysel müşterilere kapı açma ve kilit değişimini e-Arşiv ile belgeler; site / plaza yönetimlerine dönemsel anahtar-kilit hizmetlerini e-Fatura ile faturalar.

- **Kapı Açma ve Kilit Değişimi e-Arşiv** (`meslek-h04-kapi-acma-ve-kilit-degisimi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Gece kapı açma, çelik kapı barel değişimi ve yedek anahtar.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Site Yönetimine Kilit Sistemi e-Faturası** (`meslek-h04-site-yonetimine-kilit-sistemi-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Konut sitesine kartlı geçiş kilidi montajı ve ortak alan anahtar takımları.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### H.05 Demir, Çelik Eşya İmalatı, Ticareti

NACE: 241002 Çelikten Açık Profil İmalatı (Sıcak Haddeleme, Sıcak Çekme Veya Kalıptan Çekme İşlemlerinden Daha İleri İşlem Görmemiş); 241003 Demir Ve Çelikten Sıcak Veya Soğuk Çekilmiş Yassı Hadde Ürünleri İmalatı (Demir Veya Çelik Alaşımlı Levha, Şerit, Sac, Teneke Sac, Vb. Dahil); 241005 Sıcak Haddelenmiş Demir Veya Çelikten Bar Ve Çubukların Üretilmesi (İnşaat Demiri Dahil); 241006 Demir Veya Çelik Granül Ve Demir Tozu Üretilmesi; 241007 Demir Ya Da Çelik Hurdaların Yeniden Eritilmesi; 241008 Demir Cevherinin Doğrudan İndirgenmesiyle Elde Edilen Demirli Ürünler Ve Diğer Sünger Demir Ürünlerinin İmalatı İle Elektroliz Veya Diğer Kimyasal Yöntemlerle İstisnai Saflıkta Demir Üretilmesi; 241009 Çelikten Demir Yolu Ve Tramvay Yolu Yapım Malzemesi (Birleştirilmemiş Raylar İle Ray Donanımı, Aksamı, Vb.) İle Levha Kazıkları (Palplanş) Ve Kaynaklı Açık Profil İmalatı; 241010 Pik Demir Ve Manganezli Dökme Demir (Aynalı Demir/Spiegeleisen) Üretimi (Külçe, Blok, Veya Diğer Birincil Formlarda) … (+62 kod)

**Belge seçimi:** Demir-çelik ürünleri IDIS profiliyle (e-Fatura ProfileID IDIS, e-İrsaliye IDISIRSALIYE) belgelenir: satıcıda SEVKIYATNO, her satırda ETIKETNO zorunludur. Belirlenmiş alıcılara teslimde 627 kodlu 5/10 KDV tevkifatı uygulanır; yurt dışı satışlar IHRACAT profilli faturayla yapılır.

- **İnşaat Demiri Faturası (IDIS + Tevkifat 627)** (`meslek-h05-insaat-demiri-faturasi-idis-tevkifat-627`, e-Fatura, yerleşim *endustri*): Müteahhit firmaya nervürlü inşaat demiri ve hasır çelik; IDIS etiket numaraları ve 5/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 627, Percent 50 (5/10). Ödenecek = KDV dahil − tevkif edilen KDV.
  - ProfileID IDIS: satıcı PartyIdentification SEVKIYATNO (SE-xxxxxxx); satırlarda ETIKETNO (demir-çelik ürün etiket numarası).

- **Demir-Çelik Sevk İrsaliyesi (IDIS)** (`meslek-h05-demir-celik-sevk-irsaliyesi-idis`, e-İrsaliye, yerleşim *teknik*): Depodan şantiyeye tır ile inşaat demiri sevki; IDIS sevkiyat ve etiket numaraları.
  - ProfileID IDISIRSALIYE; gönderici SEVKIYATNO, satırlarda ETIKETNO.
  - DespatchAdvice: Shipment/ShipmentStage plaka + şoför, Delivery/Despatch fiili sevk tarih-saat zorunlu.

- **Gürcistan'a Çelik Profil İhracatı (DAP)** (`meslek-h05-gurcistan-a-celik-profil-ihracati-dap`, e-Fatura (İhracat), yerleşim *serit*): Batum'daki inşaat malzemecisine kutu profil ve sac ihracatı; GTİP 7306 / 7208.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (DAP), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz USD + PricingExchangeRate.

### H.06 Deniz Taşıtları İmalatı, Onarımı, Ticareti

NACE: 259908 Metalden Gemi Ve Tekne Pervaneleri Ve Bunların Aksamları İle Çıpalar, Filika Demirleri Vb. İmalatı; 301107 Gemiler Ve Yüzer Yapılar İçin İç Bölmelerin İmalatı; 301201 Jet Ski Vb. Kişisel Su Araçlarının İmalatı; 301203 Şişirilebilir Motorlu/Motorsuz Botların İmalatı (Eğlence Ve Spor Amaçlı Olanlar); 301204 Eğlence Ve Sportif Amaçlı Motorlu/Motorsuz Yelkenlilerin, Motorlu Tekne Ve Yatların, Sandalların, Kayıkların, Kanoların, Eğlence Amaçlı Hover Kraftların Ve Benzer Araçların İmalatı (Polyester Tekneler Dahil); 331500 Sivil Gemilerin Ve Teknelerin Onarım Ve Bakımı (Yüzen Yapılar, Sandal, Kayık, Vb. Bakım Ve Onarımı İle Bunların Kalafatlanması Dahil); 331902 Halatlar, Gemi Çarmık Ve Halatları İle Yelken Bezleri Ve Bez Astarlı Muşambaların Onarımı; 464926 Spor Ve Eğlence Amaçlı Teknelerin, Kayıkların Ve Kanoların Toptan Ticareti … (+1 kod)

**Belge seçimi:** Ticari amaçla kullanılan deniz taşıtlarının (turizm belgeli gulet, balıkçı teknesi vb.) inşa, bakım ve onarımı KDV 13/a uyarınca istisnadır (ISTISNA 304); özel gezinti teknelerinin bakımı KDV'ye tabidir ve e-Arşiv ile faturalanır. Yurt dışı alıcıya tekne satışı IHRACAT profiliyle yapılır.

- **Turizm Teknesi Bakım-Onarım (İstisna 304)** (`meslek-h06-turizm-teknesi-bakim-onarim-istisna-304`, e-Fatura, yerleşim *teknik*): Mavi tur şirketinin guletinin kışlık bakım ve onarımı; KDV 13/a istisnası, tekne adı belge alanında.
  - InvoiceTypeCode ISTISNA; KDV TaxSubtotal Percent 0 + TaxExemptionReasonCode 304 (13/a Deniz, hava ve demiryolu taşıma araçlarının teslimi ile inşa, tadil, bakım ve onarımları).

- **Yat İhracat Faturası (FOB)** (`meslek-h06-yat-ihracat-faturasi-fob`, e-Fatura (İhracat), yerleşim *serit*): Hollanda'daki alıcıya ahşap gulet satışı; GTİP 8903, deniz yolu teslim.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (FOB), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz EUR + PricingExchangeRate.

- **Özel Tekne Bakımı e-Arşiv** (`meslek-h06-ozel-tekne-bakimi-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Bireysel tekne sahibinin gezi teknesinin bakımı; ticari kullanım olmadığından KDV uygulanır.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### H.07 Dökümcülük

NACE: 244501 Maden Cevherlerinden Ya Da Oksitlerden İşlenmemiş Krom, Manganez, Nikel, Tungsten, Molibden, Tantalum, Kobalt, Bizmut, Titanyum, Zirkonyum, Berilyum, Germanyum Vb. İmalatı (Alaşımları Dahil)(Atık Ve Hurdalardan Dahil); 244502 Krom, Manganez, Tungsten, Molibden, Tantalum, Kobalt, Bizmut, Titanyum, Zirkonyum, Berilyum, Germanyum Vb. Diğer Demir Dışı Metallerden Yapılan Ürünlerin İmalatı (Sermetler Ve Diğer Ara Ürünler Dahil, Nikelden Olanlar Hariç); 245220 Çelik Dökümü; 245301 Hafif Metallerin Dökümü; 245402 Değerli Metallerin Dökümü; 245490 Demir Dışı Diğer Metallerin Dökümü (Değerli Metallerin Dökümü Hariç); 256301 Metalden Kalıp Ve Döküm Modeli İmalatı (Kek Ve Ayakkabı Kalıpları Hariç); 256302 Plastikten Kalıp Ve Döküm Modeli İmalatı (Kek Ve Ayakkabı Kalıpları Hariç) … (+1 kod)

**Belge seçimi:** Dökümhane makine imalatçılarına döküm parçaları e-Fatura ile satar ve e-İrsaliye ile sevk eder. Hurda metalden elde ettiği külçeleri belirlenmiş alıcılara sattığında 617 kodlu 7/10 KDV tevkifatı uygulanır; döküm no ve parti bilgisi satırda taşınır.

- **Makine Firmasına Döküm Parça e-Faturası** (`meslek-h07-makine-firmasina-dokum-parca-e-faturasi`, e-Fatura, yerleşim *endustri*): Tarım makinesi üreticisine sfero döküm şanzıman gövdesi; döküm numarası ve model satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Hurdadan Külçe Teslimi (Tevkifat 617)** (`meslek-h07-hurdadan-kulce-teslimi-tevkifat-617`, e-Fatura, yerleşim *teknik*): Hurda alüminyumdan elde edilen külçelerin sanayiciye satışı; 7/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 617, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Döküm Parça Sevk İrsaliyesi** (`meslek-h07-dokum-parca-sevk-irsaliyesi`, e-İrsaliye, yerleşim *kenar*): Dökümhaneden müşteri fabrikasına sandıklı parça sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### H.08 Ev Aletleri İmalatı, Onarımı, Ticareti

NACE: 275205 Elektriksiz Yemek Pişirme Cihazlarının İmalatı (Gaz Yakıtlı Set Üstü Ocaklar, Gaz Veya Sıvı Yakıtlı Fırınlar Ve Ocaklar Vb.); 275206 Elektriksiz Ev Aletlerinin Aksam Ve Parçalarının İmalatı; 475509 Elektriksiz Fırın Ve Ocaklar İle Hava Ve Su Isıtıcılarının Perakende Ticareti; 952202 Ev Ve Bahçe Gereçlerinin Bakım Ve Onarımı

**Belge seçimi:** Ev aletleri servisi bireysel müşterilere onarım ve parça satışını e-Arşiv ile belgeler; kamu idareleri ve büyük işletmeler gibi belirlenmiş alıcılara yapılan makine-teçhizat bakım onarımında 603 kodlu 7/10 KDV tevkifatlı e-Fatura düzenler.

- **Ocak ve Şofben Onarımı e-Arşiv** (`meslek-h08-ocak-ve-sofben-onarimi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Evde gazlı ocak ve şofben onarımı; değişen parça ve işçilik ayrı satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Yemekhane Ekipman Bakımı (Tevkifat 603)** (`meslek-h08-yemekhane-ekipman-bakimi-tevkifat-603`, e-Fatura, yerleşim *teknik*): Fabrika yemekhanesindeki endüstriyel ocak ve fırınların periyodik bakımı; 7/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### H.09 Hurdacılık

NACE: 381101 Tehlikesiz Atıkların Toplanması (Çöpler, Geri Dönüştürülebilir Maddeler, Tekstil Atıkları, Vb.) (İnşaat Ve Yıkım Atıkları, Çalı, Çırpı, Moloz Gibi Enkazlar Hariç); 381103 Tehlikesiz Atık Transfer İstasyonlarının İşletilmesi; 381201 Tehlikeli Atıkların Toplanması; 382102 Gemi Ve Yüzer Yapıların Hurdalarının Materyallerinin Geri Kazanımı Amacıyla Parçalara Ayrılması (Sökülmesi); 382103 Hurdaların Geri Kazanım Amacıyla Parçalara Ayrılması (Otomobil, Bilgisayar, Televizyon Vb. Donanımlar) (Gemiler Ve Yüzer Yapılar İle Satmak İçin Kullanılabilir Parçalar Oluşturmak Amacıyla Sökme Hariç); 382104 Tasnif Edilmiş Metal Atıklar, Hurdalar Ve Diğer Parçaların Genellikle Mekanik Veya Kimyasal Değişim İşlemleri İle Geri Kazanılması; 382105 Tasnif Edilmiş Metal Dışı Atıklar, Hurdalar Ve Diğer Parçaların Genellikle Mekanik Veya Kimyasal Değişim İşlemleri İle Geri Kazanılması; 382200 Enerji Geri Kazanımı … (+7 kod)

**Belge seçimi:** Hurdacı kapı kapı dolaşan toplayıcılardan (GVK 9/7 esnaf muaflığı) yaptığı alımlarda %2 stopajlı e-Gider Pusulası düzenler (nihai tüketicinin kendi hurdası için stopaj yoktur). Hurda teslimleri KDV'den istisna olup istisnadan vazgeçenler belirlenmiş alıcılara 620 kodlu 7/10 tevkifatlı fatura keser; çelikhaneye sevkiyat kantar fişiyle e-İrsaliye ile yapılır.

- **Toplayıcıdan Hurda Alımı Gider Pusulası** (`meslek-h09-toplayicidan-hurda-alimi-gider-pusulasi`, e-Gider Pusulası, yerleşim *defter*): Kapı kapı hurda toplayan kişiden kantarla demir ve bakır hurda alımı; %2 GV stopajı.
  - CreditNote · TR1.2.1 · ProfileID GIDERPUSULASI · CreditNoteTypeCode SATIS. Belge vermeyen (vergiden muaf / ÇKS'siz) satıcı AccountingCustomerParty (TCKN + Person, SMS kodu); düzenleyen SMS_PROVIDER. GV stopajı 0003 %2 (GVK 94/13) TaxTotal'da, ödenecekten düşülür.

- **Çelikhaneye Hurda Teslimi (Tevkifat 620)** (`meslek-h09-celikhaneye-hurda-teslimi-tevkifat-620`, e-Fatura, yerleşim *endustri*): İstisnadan vazgeçmiş hurdacının çelikhaneye ağır hurda teslimi; 7/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 620, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Hurda Sevk İrsaliyesi** (`meslek-h09-hurda-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Hurda sahasından çelikhaneye tır ile sevk; kantar ağırlıkları ve plaka.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### H.10 İklimlendirme, Soğutma Sistemi İmalatı, Kurulumu, Onarımı

NACE: 282110 Güneşle (Güneş Kolektörleri), Buharla Ve Yağla Isıtma Sistemleri İle Benzeri Ocak Ve Isınma Donanımları Gibi Elektriksiz Ev Tipi Isıtma, Soğutma, Havalandırma Donanımlarının İmalatı; 282501 Sanayi Tipi Soğutucu Ve Dondurucu Donanımları İle Isı Pompalarının İmalatı (Camekanlı, Tezgahlı Veya Mobilya Tipi Soğutucular, Kondenserleri Isı Değiştiricisi Fonksiyonu Gören Kompresörlü Üniteler Vb.); 282502 Sanayi Tipi Fan Ve Vantilatörlerin İmalatı (Çatı Havalandırma Pervaneleri Dahil); 282503 İklimlendirme Cihazlarının (Klimalar) İmalatı (Motorlu Taşıtlarda Kullanılanlar Hariç); 293224 Motorlu Kara Taşıtları İçin İklimlendirme Cihazlarının (Klimalar) İmalatı; 331206 Sanayi Tipi Soğutma Ve Havalandırma Ekipmanlarının Onarım Ve Bakımı; 332045 Sanayi Tipi Isıtma, İklimlendirme Ve Soğutma Cihaz Ve Ekipmanlarının Kurulumu; 353021 Buhar Ve Sıcak Su Üretimi, Toplanması Ve Dağıtımı … (+2 kod)

**Belge seçimi:** İklimlendirme firması ev kullanıcılarına klima satış-montajında e-Arşiv; otel gibi belirlenmiş alıcılara bakım-onarımda 603 (7/10) tevkifatlı e-Fatura; inşaat projelerinde alt yüklenici olarak yaptığı tesisat yapım işi sayıldığından 601 (4/10) tevkifatlı e-Fatura düzenler.

- **Klima Satış ve Montaj e-Arşiv** (`meslek-h10-klima-satis-ve-montaj-e-arsiv`, e-Arşiv Fatura, yerleşim *modern*): Ev kullanıcısına inverter klima, montaj ve bakır boru; seri no ve garanti satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Otel Chiller Bakım Faturası (Tevkifat 603)** (`meslek-h10-otel-chiller-bakim-faturasi-tevkifat-603`, e-Fatura, yerleşim *teknik*): Otelin chiller ve klima santrallerinin sezon öncesi bakım-onarımı; 7/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Konut Projesine VRF Tesisatı (Tevkifat 601)** (`meslek-h10-konut-projesine-vrf-tesisati-tevkifat-601`, e-Fatura, yerleşim *kurumsal*): Konut projesinde alt yüklenici olarak VRF klima tesisatı; yapım işi kapsamında 4/10 tevkifat, hakediş referanslı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 601, Percent 40 (4/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### H.11 Kalaycılık, Kaplamacılık

NACE: 244301 Kurşun Tabaka, Levha, Şerit, Folyo, Kurşun Tozu Ve Pulu İmalatı (Alaşımdan Olanlar Dahil); 244302 Kurşun İmalatı (İşlenmemiş); 244305 Kalay İmalatı (İşlenmemiş Halde); 244306 Çinko İmalatı (İşlenmemiş Halde); 244308 Çinko Sac, Tabaka, Levha, Şerit, Folyo, Çinko Tozları, Vb. İmalatı (Alaşımdan Olanlar Dahil); 255101 Metallerin Nikel İle Kaplanması (Nikelajcılık) Faaliyeti; 255102 Metallerin Kalay İle Kaplanması (Kalaycılık) Faaliyeti; 255109 Metallerin Diğer Malzemelerle Kaplanması (Isıl İşlem Hariç) … (+1 kod)

**Belge seçimi:** Kaplamacı müşterinin malını fason kaplar: hizmet bedeli için e-Fatura, kaplanmış malın müşteriye geri sevki için e-İrsaliye düzenlenir. Geleneksel kalaycı bireysel müşterilere kap kalaylamayı e-Arşiv ile belgeler.

- **Fason Galvaniz Kaplama e-Faturası** (`meslek-h11-fason-galvaniz-kaplama-e-faturasi`, e-Fatura, yerleşim *endustri*): Çelik konstrüksiyon parçalarının sıcak daldırma galvanizi; kg bazlı fason hizmet.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Kaplanmış Parça İade Sevk İrsaliyesi** (`meslek-h11-kaplanmis-parca-iade-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Kaplama sonrası parçaların müşteriye geri sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

- **Bakır Kap Kalaylama e-Arşiv** (`meslek-h11-bakir-kap-kalaylama-e-arsiv`, e-Arşiv Fatura, yerleşim *defter*): Bireysel müşterinin bakır tencere ve kazanlarının kalaylanması.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### H.12 Karoser İmalatı, Kaportacılık

NACE: 292001 Treyler (Römork), Yarı Treyler (Yarı Römork) Ve Mekanik Hareket Ettirici Tertibatı Bulunmayan Diğer Araçların Parçalarının İmalatı (Bu Araçların Karoserleri, Kasaları, Aksları Ve Diğer Parçaları); 292002 Motorlu Kara Taşıtları İçin Karoser, Kabin, Kupa, Dorse Ve Damper İmalatı (Otomobil, Kamyon, Kamyonet, Otobüs, Minibüs, Traktör, Damperli Kamyon Ve Özel Amaçlı Motorlu Kara Taşıtlarının Karoserleri); 292004 Treyler (Römork) Ve Yarı Treyler (Yarı Römork) İmalatı, Römorklar İçin Şasi İmalatı (Karavan Tipinde Olanlar Ve Tarımsal Amaçlı Olanlar Hariç); 292005 Karavan Tipinde Treyler (Römork) Ve Yarı Treyler (Yarı Römork) İmalatı - Ev Olarak Veya Kamp İçin Kullanılanlar; 292006 Motorlu Kara Taşıtlarının Modifiye Edilmesi Ve Karoser Hizmetleri; 309999 Başka Yerde Sınıflandırılmamış Diğer Ulaşım Ekipmanlarının İmalatı; 331230 Tarımsal Amaçlı Kullanılan Römorkların Onarım Ve Bakımı; 953104 Motorlu Kara Taşıtlarının Karoser Ve Kaporta Onarımı Vb. Faaliyetleri

**Belge seçimi:** Kaportacı bireysel araç sahiplerine e-Arşiv; filo şirketleri gibi belirlenmiş alıcılara taşıt onarımında 603 kodlu 7/10 tevkifatlı e-Fatura düzenler. Karoser / damper imalatı mal teslimi olduğundan tevkifatsız e-Fatura ile faturalanır; plaka ve şasi no satırda gösterilir.

- **Filo Aracı Kaporta Onarımı (Tevkifat 603)** (`meslek-h12-filo-araci-kaporta-onarimi-tevkifat-603`, e-Fatura, yerleşim *teknik*): Araç kiralama şirketinin hasarlı aracının kaporta ve boya onarımı; 7/10 tevkifat, plaka ve km satırda.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Bireysel Kaporta Onarımı e-Arşiv** (`meslek-h12-bireysel-kaporta-onarimi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Araç sahibine göçük düzeltme ve lokal boya.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Damper İmalatı e-Faturası** (`meslek-h12-damper-imalati-e-faturasi`, e-Fatura, yerleşim *endustri*): Nakliye firmasının kamyon şasisine hardox damper imalatı ve montajı; mal teslimi.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### H.13 Kuyumculuk

NACE: 089903 Kıymetli Ve Yarı Kıymetli Taşların Ocakçılığı (Kehribar, Oltu Taşı, Lüle Taşı Ve Elmas Hariç); 244116 İşlenmemiş, Yarı İşlenmiş, Toz Halde Altın İmalatı İle Gümüş Veya Adi Metallerin Altınla Preslenerek Kaplanması (Mücevher Ve Benzeri Eşyaların İmalatı Hariç); 244117 İşlenmemiş, Yarı İşlenmiş, Toz Halde Gümüş İmalatı İle Adi Metallerin Gümüşle Preslenerek Kaplanması (Mücevher Ve Benzeri Eşyaların İmalatı Hariç); 244118 İşlenmemiş, Yarı İşlenmiş, Toz Halde Platin İmalatı İle Altın, Gümüş Veya Adi Metallerin Platinle Preslenerek Kaplanması (Paladyum, Rodyum, Osmiyum Ve Rutenyum İmalatı İle Platin Katalizör İmalatı Dahil) (Mücevher Ve Benzeri Eşyaların İmalatı Hariç); 244119 Değerli Metal Alaşımlarının İmalatı (Mücevher Ve Benzeri Eşyaların İmalatı Hariç); 321201 Değerli Metallerden Takı Ve Mücevherlerin İmalatı (Değerli Metallerle Baskı, Yapıştırma Vb. Yöntemlerle Giydirilmiş Adi Metallerden Olanlar Dahil); 321204 İnci Ve Değerli Doğal Taşların İşlenmesi Ve Değerli Taşlardan Takı Ve Mücevher İle Bunların Parçalarının İmalatı (Sentetik Veya Yeniden Oluşturulmuş Olanlar Dahil); 321290 Mücevher Ve Benzeri Diğer Eşyaların İmalatı … (+7 kod)

**Belge seçimi:** Kuyumcu ziynet eşyası satışında özel matrah uygular: altında 805, gümüşte 808 kodu ile InvoiceTypeCode OZELMATRAH, KDV yalnız satış bedeli ile has / alış değeri arasındaki fark (işçilik + kâr) üzerinden hesaplanır. Müşteriden kullanılmış / hurda altın alımı e-Kıymetli Maden Alım belgesi (CreditNote, EKIYMETLIMADENBELGE, birim gram) ile belgelenir.

- **Altın Bilezik Satışı e-Arşiv (Özel Matrah 805)** (`meslek-h13-altin-bilezik-satisi-e-arsiv-ozel-matrah-805`, e-Arşiv Fatura, yerleşim *zarif*): Müşteriye 22 ayar bilezik ve küpe; KDV yalnız işçilik / kâr farkından, ayar-milyem-gram satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode OZELMATRAH.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - InvoiceTypeCode OZELMATRAH; KDV TaxSubtotal TaxableAmount = özel matrah (satış − alış/has değeri), TaxExemptionReasonCode 805. LineExtensionAmount satış bedelinin tamamıdır.

- **Müşteriden Hurda Altın Alımı** (`meslek-h13-musteriden-hurda-altin-alimi`, e-Kıymetli Maden (Alım), yerleşim *defter*): Bireysel müşteriden kullanılmış altın bilezik ve çeyrek alımı; gram, ayar ve milyem bilgisi.
  - CreditNote · ProfileID EKIYMETLIMADENBELGE · CreditNoteTypeCode ALIM: müessese PartyIdentification SUBENO; müşteri MUSTERITURU (GERCEKKISI / TUZELKISI); AdditionalDocumentReference DocumentTypeCode ISTATISTIKNO; miktar GRM (gram), ayar / milyem satır ek alanı; KDV satırı %0 + açıklama.

- **Kuyumcuya Toptan Gümüş Takı (Özel Matrah 808)** (`meslek-h13-kuyumcuya-toptan-gumus-taki-ozel-matrah-808`, e-Fatura, yerleşim *kurumsal*): Başka bir kuyumcuya 925 ayar gümüş takı toptan satışı; KDV işçilik farkından.
  - InvoiceTypeCode OZELMATRAH; KDV TaxSubtotal TaxableAmount = özel matrah (satış − alış/has değeri), TaxExemptionReasonCode 808. LineExtensionAmount satış bedelinin tamamıdır.

### H.14 Makine Kurulumu, Onarımı

NACE: 279001 Elektro Kaplama Makinelerinin İmalatı (Galvanoplasti, Elektro Kaplama, Elektroliz Veya Elektroforez İçin); 281108 Türbin Ve Türbin Parçalarının İmalatı (Rüzgar, Gaz, Su Ve Buhar Türbinleri İle Su Çarkları Ve Bunların Parçaları) (Hava Taşıtları İçin Turbo Jetler Veya Turbo Pervaneler Hariç); 281109 Deniz Taşıtlarında, Demir Yolu Taşıtlarında Ve Sanayide Kullanılan Kıvılcım Ateşlemeli Veya Sıkıştırma Ateşlemeli İçten Yanmalı Motorların Ve Bunların Parçalarının İmalatı (Hava Taşıtı, Motorlu Kara Taşıtı Ve Motosiklet Motorları Hariç); 281110 İçten Yanmalı Motorlar, Dizel Motorlar Vb.de Kullanılan Pistonlar, Silindirler Ve Silindir Blokları, Silindir Başları, Silindir Gömlekleri, Emme Ve Egzos Subapları, Segmanlar, Hareket Kolları, Karbüratörler, Yakıt Memeleri Vb.nin İmalatı (Hava Taşıtı, Motorlu Kara Taşıtı Ve Motosiklet Motorları Hariç); 281205 Akışkan Gücü İle Çalışan Ekipmanların Ve Bunların Parçalarının İmalatı (Hidrolik Ve Pnömatik Motorlar, Hidrolik Pompalar, Hidrolik Ve Pnömatik Valfler, Hidrolik Sistemler Ve Bunların Parçaları); 281301 Hava Veya Vakum Pompaları İle Hava Veya Diğer Gaz Kompresörlerinin İmalatı (El Ve Ayakla Çalışan Hava Pompaları İle Motorlu Taşıtlar İçin Olanlar Hariç); 281302 Sıvı Pompaları Ve Sıvı Elevatörleri İmalatı (Yakıt, Yağlama, Soğutma Ve Diğer Amaçlar İçin) (Deplasmanlı Ve Santrifüjlü Pompalar İle Benzinliklerde Kullanılan Akaryakıt Pompaları Dahil) (Tulumba Dahil, İçten Yanmalı Motorlar İçin Olanlar Hariç); 281303 El Ve Ayakla Çalışan Hava Pompalarının İmalatı … (+84 kod)

**Belge seçimi:** Makine kurulum-onarım firması belirlenmiş alıcılara makine-teçhizat bakım onarımında 603 kodlu 7/10 tevkifatlı e-Fatura, özel makine imalatı ve tesliminde normal e-Fatura düzenler; yurt dışına makine satışı IHRACAT profiliyle yapılır.

- **Pres Bakım-Onarım Faturası (Tevkifat 603)** (`meslek-h14-pres-bakim-onarim-faturasi-tevkifat-603`, e-Fatura, yerleşim *teknik*): Otomotiv yan sanayi fabrikasındaki hidrolik presin revizyonu; 7/10 tevkifat, servis formu referanslı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Özel Makine İmalatı e-Faturası** (`meslek-h14-ozel-makine-imalati-e-faturasi`, e-Fatura, yerleşim *endustri*): Ambalaj firmasına otomatik koli bantlama hattı imalatı ve devreye alma.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Azerbaycan'a Makine İhracatı (CIP)** (`meslek-h14-azerbaycan-a-makine-ihracati-cip`, e-Fatura (İhracat), yerleşim *serit*): Bakü'deki fabrikaya dolum makinesi ihracatı; GTİP 8422, sandıklı kara yolu.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (CIP), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz EUR + PricingExchangeRate.

### H.15 Makine, Yedek Parça Ticareti

NACE: 461402 Tarımsal Ekipmanlar İle Makine Ve Sanayi Ekipmanlarının Toptan Satışı İle İlgili Aracıların Faaliyetleri; 464312 Konutlarda, Bürolarda Ve Mağazalarda Kullanılan Klimaların (İklimlendirme Ekipmanlarının) Toptan Ticareti (Sanayi Tipi Olanlar Hariç); 466102 Tarım, Hayvancılık Ve Ormancılık Makine Ve Ekipmanları İle Aksam Ve Parçalarının Toptan Ticareti; 466103 Çim Biçme Ve Bahçe Makine Ve Ekipmanları İle Aksam Ve Parçalarının Toptan Ticareti; 466201 Ağaç İşleme Takım Tezgahları Ve Parçalarının Toptan Ticareti (Parça Tutucuları Dahil); 466202 Metal İşleme Takım Tezgahlarının Ve Parçalarının Toptan Ticareti (Parça Tutucuları Dahil); 466405 Tekstil Endüstrisi Makineleri İle Dikiş Ve Örgü Makineleri Ve Parçalarının Toptan Ticareti (Ev Tipi Olanlar Hariç); 466406 Kompresör Ve Parçalarının Toptan Ticareti (Soğutma, Hava Ve Diğer Amaçlar İçin) … (+7 kod)

**Belge seçimi:** Makine yedek parça ticareti fabrikalara e-Fatura ve araçla sevkte e-İrsaliye ile; çiftçi ve bireysel ustalar gibi e-Fatura mükellefi olmayan alıcılara e-Arşiv ile yapılır. Parça / OEM numarası satırda taşınır.

- **Fabrikaya Rulman ve Kayış e-Faturası** (`meslek-h15-fabrikaya-rulman-ve-kayis-e-faturasi`, e-Fatura, yerleşim *teknik*): Gıda fabrikasının bakım deposuna rulman, V kayışı ve keçe; OEM numaraları satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Yedek Parça Sevk İrsaliyesi** (`meslek-h15-yedek-parca-sevk-irsaliyesi`, e-İrsaliye, yerleşim *kenar*): Mağazadan fabrikaya koli sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

- **Çiftçiye Traktör Yedek Parça e-Arşiv** (`meslek-h15-ciftciye-traktor-yedek-parca-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Çiftçiye traktör debriyaj seti ve filtre satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### H.16 Motosiklet, Bisiklet İmalatı, Onarımı

NACE: 309102 Motosiklet Parça Ve Aksesuarları İmalatı (Motosikletler İçin Pistonlar, Piston Segmanları, Karbüratörler Dahil); 309201 Bisiklet İmalatı (Yardımcı Elektrikli Motoru Bulunan Bisiklet Dahil) (Çocuklar İçin Plastik Bisikletler Hariç); 309202 Bisiklet Parça Ve Aksesuarlarının İmalatı (Jantlar, Gidonlar, İskelet, Çatallar, Pedal Fren Göbekleri/Poyraları, Göbek/Poyra Frenleri, Krank Dişlileri, Pedallar Ve Serbest Dişlilerin Parçaları, Vb.); 309205 Bebek Arabaları, Pusetler Ve Bunların Parçalarının İmalatı; 309901 Mekanik Hareket Ettirici Tertibatı Bulunmayan Araçların İmalatı (Alışveriş Arabaları, Sanayi El Arabaları, İşportacı Arabaları, Bagaj Arabaları, Elle Çekilen Golf Arabaları, Hasta Nakli İçin Arabalar, Kızaklar Dahil); 952905 Bisiklet Onarımı; 953200 Motosikletlerin Onarım Ve Bakımı

**Belge seçimi:** Bisiklet atölyesi bireysel onarım ve satışlarda e-Arşiv; belediyelerin bisiklet paylaşım sistemi bakımı gibi kamu işlerinde KAMU senaryolu e-Fatura (IBAN zorunlu) düzenler.

- **Bisiklet Bakım-Onarım e-Arşiv** (`meslek-h16-bisiklet-bakim-onarim-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Dağ bisikletinin periyodik bakımı, fren ve vites ayarı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Belediyeye Bisiklet Filo Bakımı (KAMU)** (`meslek-h16-belediyeye-bisiklet-filo-bakimi-kamu`, e-Fatura, yerleşim *kurumsal*): Belediyenin akıllı bisiklet paylaşım sistemindeki bisikletlerin aylık bakım hizmeti; KAMU senaryosu.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.

### H.17 Motosiklet, Bisiklet Ticareti

NACE: 461809 Motosikletler, Motorlu Bisikletler Ve Bunların Parça Ve Aksesuarlarının Toptan Satışı İle İlgili Aracıların Faaliyetleri; 467325 Motosikletler Ve Motorlu Bisikletlerin Parça Ve Aksesuarlarının Toptan Ticareti; 476304 Bisiklet Perakende Ticareti; 478301 Motosikletler Ve Motorlu Bisikletlerin Perakende Ticareti; 478302 Motosikletler Ve Motorlu Bisikletlerin Parça Ve Aksesuarlarının Perakende Ticareti

**Belge seçimi:** Motosiklet bayisi tescil öncesi ilk satışta ÖTV (II) sayılı liste vergisini (TaxTypeCode 9077, KDV matrahına dahil) faturada gösterir; tüketiciye e-Arşiv, kurye firmalarına e-Fatura düzenler. İkinci el motosiklet satışında özel matrah 812 (KDV yalnız alış-satış farkından) uygulanır.

- **Sıfır Scooter Satışı e-Arşiv (ÖTV)** (`meslek-h17-sifir-scooter-satisi-e-arsiv-otv`, e-Arşiv Fatura, yerleşim *modern*): Tüketiciye 125 cc scooter satışı; şasi ve motor no satırda, ÖTV (II) liste KDV matrahına dahil.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - ÖTV satır vergisi (TaxTypeCode 0071 I. liste / 9077 II. liste taşıtlar / 0073 III. liste / 0074 IV. liste) KDV matrahına dahil edilir; maktu ÖTV için PerUnitAmount, nispi için Percent kullanılır.

- **Kurye Firmasına Toplu Motosiklet e-Faturası** (`meslek-h17-kurye-firmasina-toplu-motosiklet-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Kurye şirketine 10 adet 125 cc motosiklet; her satırda ÖTV (II) liste.
  - ÖTV satır vergisi (TaxTypeCode 0071 I. liste / 9077 II. liste taşıtlar / 0073 III. liste / 0074 IV. liste) KDV matrahına dahil edilir; maktu ÖTV için PerUnitAmount, nispi için Percent kullanılır.

- **İkinci El Motosiklet Satışı (Özel Matrah 812)** (`meslek-h17-ikinci-el-motosiklet-satisi-ozel-matrah-812`, e-Arşiv Fatura, yerleşim *kart*): İkinci el motosiklet satışı; KDV yalnız alış ile satış arasındaki farktan, noter satış bilgisi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode OZELMATRAH.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - InvoiceTypeCode OZELMATRAH; KDV TaxSubtotal TaxableAmount = özel matrah (satış − alış/has değeri), TaxExemptionReasonCode 812. LineExtensionAmount satış bedelinin tamamıdır.

### H.18 Oto Bakım Servisçiliği

NACE: 331209 Tarım Ve Ormancılıkta Kullanılan Motokültörler Ve Traktörlerin Onarım Ve Bakımı; 712012 Entegre Mekanik Ve Elektrik Sistemleri Konusunda Teknik Test Ve Analiz Faaliyetleri; 953101 Motorlu Kara Taşıtlarının Genel Onarım Ve Bakımı Faaliyetleri

**Belge seçimi:** Oto servis bireysel müşteriye bakım-onarımda e-Arşiv; kamu idareleri, filo şirketleri gibi belirlenmiş alıcılara taşıt bakım onarımında 603 kodlu 7/10 tevkifatlı e-Fatura düzenler. Plaka, km ve iş emri numarası satır / belge alanlarında taşınır.

- **Periyodik Bakım e-Arşiv** (`meslek-h18-periyodik-bakim-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Bireysel araç sahibine 60.000 km periyodik bakım; parça ve işçilik ayrı satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Filo Araç Bakımı (Tevkifat 603)** (`meslek-h18-filo-arac-bakimi-tevkifat-603`, e-Fatura, yerleşim *teknik*): Kargo şirketinin hafif ticari araçlarının aylık bakım-onarımı; 7/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### H.19 Oto Boyacılık

NACE: 953105 Motorlu Kara Taşıtlarının Boyanması Faaliyetleri

**Belge seçimi:** Oto boyacı bireysel araç sahiplerine e-Arşiv düzenler; sigorta şirketi adına yapılan hasar onarımlarında fatura sigorta şirketine (belirlenmiş alıcı) 603 kodlu 7/10 KDV tevkifatlı e-Fatura olarak kesilir, hasar dosya no ve poliçe belge referansıdır.

- **Oto Boya e-Arşiv** (`meslek-h19-oto-boya-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Araç sahibine kaput ve tampon boyası, pasta cila.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Sigorta Hasar Onarımı (Tevkifat 603)** (`meslek-h19-sigorta-hasar-onarimi-tevkifat-603`, e-Fatura, yerleşim *teknik*): Kasko kapsamındaki aracın boya onarımı; fatura sigorta şirketine, hasar dosya no ve poliçe referanslı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### H.20 Oto Döşemecilik

NACE: 293222 Motorlu Kara Taşıtları İçin Koltuk İmalatı; 301106 Gemiler Ve Yüzer Yapılar İçin Oturulacak Yerlerin İmalatı; 953107 Motorlu Kara Taşıtların Koltuk Ve Döşemelerinin Onarım Ve Bakımı Faaliyetleri

**Belge seçimi:** Oto döşemeci bireysel müşterilere e-Arşiv; otobüs firmaları gibi belirlenmiş alıcıların taşıt koltuklarının yenilenmesinde (taşıt tadil-onarımı) 603 kodlu 7/10 tevkifatlı e-Fatura düzenler.

- **Deri Koltuk Kaplama e-Arşiv** (`meslek-h20-deri-koltuk-kaplama-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Otomobil koltuklarının hakiki deri kaplaması ve tavan döşemesi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Otobüs Koltuk Yenileme (Tevkifat 603)** (`meslek-h20-otobus-koltuk-yenileme-tevkifat-603`, e-Fatura, yerleşim *teknik*): Şehirler arası otobüs firmasının koltuk döşemelerinin yenilenmesi; 7/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### H.21 Oto Elektrikçilik

NACE: 953106 Motorlu Kara Taşıtlarının Elektrik Sistemlerinin Onarım Faaliyetleri

**Belge seçimi:** Oto elektrikçi bireysel müşterilere e-Arşiv düzenler; belediye otobüsleri gibi kamu araçlarının elektrik onarımında KAMU senaryosu ile 603 (7/10) KDV tevkifatı birlikte uygulanır.

- **Akü ve Marş Onarımı e-Arşiv** (`meslek-h21-aku-ve-mars-onarimi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Araç sahibine akü değişimi ve marş motoru onarımı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Belediye Otobüsü Elektrik Onarımı (KAMU + 603)** (`meslek-h21-belediye-otobusu-elektrik-onarimi-kamu-603`, e-Fatura, yerleşim *kurumsal*): Belediye otobüslerinin şarj dinamosu ve aydınlatma onarımı; KAMU senaryosu ve 7/10 tevkifat.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### H.22 Oto Lastik Onarımı

NACE: 221119 Lastik Tekerleklerinin Yeniden İşlenmesi Ve Sırt Geçirilmesi (Lastiğin Kaplanması); 953102 Motorlu Kara Taşıtlarının Lastik Onarımı Faaliyetleri

**Belge seçimi:** Lastik tamircisi bireysel sürücülere e-Arşiv; lojistik firmaları gibi belirlenmiş alıcıların TIR lastiklerinin onarımında 603 kodlu 7/10 tevkifatlı e-Fatura düzenler.

- **Lastik Tamiri ve Balans e-Arşiv** (`meslek-h22-lastik-tamiri-ve-balans-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Yol yardımı ile lastik tamiri, balans ve sibop değişimi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **TIR Lastik Onarımı (Tevkifat 603)** (`meslek-h22-tir-lastik-onarimi-tevkifat-603`, e-Fatura, yerleşim *teknik*): Lojistik şirketinin çekici ve dorse lastiklerinin onarımı ve sırt kaplaması; 7/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 603, Percent 70 (7/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### H.23 Oto Lastik Ticareti

NACE: 467213 Motorlu Kara Taşıtı Lastiklerinin Ve Jantlarının Toptan Ticareti (Motosiklet Lastik Ve Jantları Hariç); 478204 Motorlu Kara Taşıtı Lastiklerinin Ve Jantlarının Perakende Ticareti (Motosiklet Parça Ve Aksesuarları Hariç)

**Belge seçimi:** Lastik satıcısı tüketiciye montajlı satışta e-Arşiv, filolara ve servislere toptan satışta e-Fatura düzenler. Lastik ebadı, DOT üretim haftası ve marka satırda taşınır.

- **Kış Lastiği Satışı e-Arşiv** (`meslek-h23-kis-lastigi-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Araç sahibine 4 adet kış lastiği, montaj ve balans; DOT haftası satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Filoya Toptan Lastik e-Faturası** (`meslek-h23-filoya-toptan-lastik-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Araç kiralama şirketine toptan yaz lastiği satışı; ebat bazlı satırlar.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### H.24 Oto Lpg Montajı

NACE: 953108 Motorlu Kara Taşıtlarına Yakıt Sistemi (Benzin, Dizel, Lpg, Cng, Lng Vb.) Montajı Ve Bakımı Hizmetleri

**Belge seçimi:** LPG montajcısı bireysel araç sahiplerine dönüşüm ve bakımda e-Arşiv; taksi kooperatifi gibi işletmelere toplu dönüşümde e-Fatura düzenler. Dönüşüm sonrası TSE / mühendis raporu ve ruhsat tadil bilgisi belge referansıdır.

- **LPG Dönüşüm e-Arşiv** (`meslek-h24-lpg-donusum-e-arsiv`, e-Arşiv Fatura, yerleşim *teknik*): Benzinli otomobile sıralı LPG sistemi montajı; kit seri no ve tank bilgisi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Taksi Kooperatifine Toplu Dönüşüm e-Faturası** (`meslek-h24-taksi-kooperatifine-toplu-donusum-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Taksi kooperatifine bağlı araçların LPG dönüşümü ve periyodik LPG bakımı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### H.25 Oto Yedek Parça İmalatı

NACE: 282918 İçten Yanmalı Motorlar İçin Yağ Filtresi, Yakıt Filtresi, Hava Filtresi, Gres Nipelleri, Yağ Keçesi Ve Benzerlerinin İmalatı; 293190 Motorlu Kara Taşıtları İçin Diğer Elektrik Ve Elektronik Donanımların İmalatı (Oto Alarm Sistemlerinin İmalatı Dahil); 293220 Motorlu Kara Taşıtları İçin Vites Kutusu, Debriyaj, Fren, Aks, Amortisör Gibi Çeşitli Parça Ve Aksesuarların İmalatı; 293221 Motorlu Kara Taşıtları İçin Karoser, Kabin Ve Kupalara Ait Parça Ve Aksesuarların İmalatı; 309203 Engelli Araçlarının İmalatı (Motorlu, Motorsuz, Akülü, Şarjlı, Vb.); 309204 Engelli Araçlarının Parça Ve Aksesuarlarının İmalatı

**Belge seçimi:** Oto yedek parça imalatçısı otomotiv ana sanayi ve distribütörlere e-Fatura, tam zamanında (JIT) sevkiyatlarda e-İrsaliye, yurt dışı müşterilere IHRACAT profilli fatura düzenler. OEM parça no ve lot satırda taşınır.

- **Ana Sanayiye Fren Balatası e-Faturası** (`meslek-h25-ana-sanayiye-fren-balatasi-e-faturasi`, e-Fatura, yerleşim *endustri*): Otomotiv fabrikasına OEM fren balatası ve disk; parça no ve lot satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **JIT Sevk İrsaliyesi** (`meslek-h25-jit-sevk-irsaliyesi`, e-İrsaliye, yerleşim *teknik*): Montaj hattına tam zamanında sevkiyat; kasa ve palet bilgisi.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

- **Fren Parçası İhracat Faturası (FCA)** (`meslek-h25-fren-parcasi-ihracat-faturasi-fca`, e-Fatura (İhracat), yerleşim *serit*): Almanya'daki distribütöre fren balatası ihracatı; GTİP 8708.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (FCA), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz EUR + PricingExchangeRate.

### H.26 Oto Yedek Parça Ticareti

NACE: 461808 Motorlu Kara Taşıtlarının Parça Ve Aksesuarlarının Toptan Satışı İle İlgili Aracıların Faaliyetleri; 467212 Motorlu Kara Taşıtlarının Parçalarının Toptan Ticareti (Cam, Lastik Ve Jantlar İle Motosiklet Parçaları Hariç); 467214 Motorlu Kara Taşıtlarının Aksesuarlarının Toptan Ticareti (Motosiklet Aksesuarları Hariç); 473002 Motorlu Kara Taşıtları İçin Yağlama Ve Soğutma Ürünlerinin Perakende Ticareti; 478205 Motorlu Kara Taşıtı Camlarının Perakende Ticareti (Motosiklet Parça Ve Aksesuarları Hariç); 478206 Motorlu Kara Taşıtlarının İkinci El (Kullanılmış) Parçalarının Perakende Ticareti (Motosiklet Parça Ve Aksesuarları Hariç); 478207 Motorlu Kara Taşıtlarının Aksesuarlarının Perakende Ticareti (Motosiklet Parça Ve Aksesuarları Hariç); 478208 Motorlu Kara Taşıtlarının Akülerinin Perakende Ticareti … (+1 kod)

**Belge seçimi:** Oto yedek parça satıcısı servislere e-Fatura, internetten tüketiciye e-Arşiv internet satışı, yurt dışından gelen küçük siparişlerde ETGB'li mikro ihracat düzenler. OEM numarası ve araç uyumluluğu satırda gösterilir.

- **Servise Yedek Parça e-Faturası** (`meslek-h26-servise-yedek-parca-e-faturasi`, e-Fatura, yerleşim *teknik*): Oto servise amortisör, triger seti ve filtre; OEM numaraları satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Online Yedek Parça Satışı e-Arşiv (İnternet)** (`meslek-h26-online-yedek-parca-satisi-e-arsiv-internet`, e-Arşiv Fatura, yerleşim *modern*): Web mağazasından tüketiciye fren seti siparişi; araç uyumluluğu ve kargo bilgisi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - İnternet satışı: satıcı WebsiteURI; PaymentMeans (ödeme şekli 48, ödeme tarihi, ödeme aracısı InstructionNote); Delivery/CarrierParty (taşıyıcı VKN + unvan), TrackingID ve ActualDespatchDate.

- **Yurt Dışı Parça Siparişi Mikro İhracat (ETGB)** (`meslek-h26-yurt-disi-parca-siparisi-mikro-ihracat-etgb`, e-Arşiv (Mikro İhracat / ETGB), yerleşim *kart*): Gürcistan'daki müşteriye far ve ayna camı gönderimi; ETGB ve GTİP.
  - e-Arşiv (EARSIVFATURA) + InvoiceTypeCode ISTISNA 301; yabancı alıcı VKN 2222222222 ve ülke kodu; AdditionalDocumentReference ETGB; Delivery/CarrierParty + TrackingID; satırda GTİP (AdditionalItemIdentification). Döviz + kur.

### H.27 Oto Yıkama, Yağlama

NACE: 953103 Motorlu Kara Taşıtlarının Yağlama, Yıkama, Cilalama Vb. Faaliyetleri

**Belge seçimi:** Oto yıkamacı bireysel müşteriye e-Arşiv; araç kiralama ve filo şirketlerine aylık toplu yıkama hizmetinde e-Fatura düzenler (yıkama, taşıt bakım-onarımı sayılmadığından 603 tevkifatı uygulanmaz).

- **Oto Yıkama ve Kaplama e-Arşiv** (`meslek-h27-oto-yikama-ve-kaplama-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Araç iç-dış detaylı yıkama ve seramik kaplama.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Kiralama Şirketine Aylık Yıkama e-Faturası** (`meslek-h27-kiralama-sirketine-aylik-yikama-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Araç kiralama şirketinin teslim öncesi araç yıkamaları; araç adedi bazlı aylık fatura.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### H.28 Saatçilik

NACE: 231508 Duvar Saati, Kol Saati Veya Gözlük İçin Camlar (Bombeli, Kavisli, İçi Oyuk Vb. Şekilde Fakat, Optik Açıdan İşlenmemiş) İle Bu Tür Camların İmalatı İçin Kullanılan İçi Boş Küre Ve Bunların Parçalarının İmalatı; 265203 Devam Kayıt Cihazları, Zaman Kayıt Cihazları, Parkmetreler; Duvar Ve Kol Saati Makineli Zaman Ayarlı Anahtarların İmalatı (Vardiya Saati Vb.); 265204 Kol, Masa, Duvar Ve Cep Saatlerinin, Bunların Makinelerinin, Kasalarının Ve Diğer Parçalarının İmalatı (Kronometreler Ve Taşıtlar İçin Gösterge Panellerinde Bulunan Saatler Ve Benzeri Tipteki Saatler Dahil); 464802 Saat Toptan Ticareti; 477703 Saat (Kol, Masa, Duvar Vb. Saatler İle Kronometreler) Perakende Ticareti; 952501 Saatlerin Onarımı (Kronometreler Dahil, Devam Kayıt Cihazları Hariç); 952503 Saatlerin Yenilenmesi Hizmeti Faaliyetleri (Telefon Özelliği Olmayan Akıllı Saatler)

**Belge seçimi:** Saatçi tüketiciye satış ve servis hizmetinde e-Arşiv (seri no ve garanti satırda), yabancı turistlere yolcu beraberi eşya faturası (Tax Free) düzenler.

- **Kol Saati Satışı e-Arşiv** (`meslek-h28-kol-saati-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Müşteriye otomatik kol saati satışı; seri no ve garanti süresi satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Turiste Saat Satışı (Yolcu Beraberi)** (`meslek-h28-turiste-saat-satisi-yolcu-beraberi`, e-Fatura (Yolcu Beraberi), yerleşim *serit*): Yabancı turiste lüks kol saati satışı; pasaport ve aracı kurum bilgisi.
  - ProfileID YOLCUBERABERFATURA; AccountingCustomerParty = Gümrük (1460415308); BuyerCustomerParty PARTYTYPE=TAXFREE + Person (ad, soyad, NationalityID) + IdentityDocumentReference (pasaport no / tarihi); TaxRepresentativeParty ARACIKURUMVKN + ARACIKURUMETIKET. KDV hesaplanır, istisna kodu 501.

- **Saat Bakım ve Onarım e-Arşiv** (`meslek-h28-saat-bakim-ve-onarim-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Mekanik saatin genel bakımı, cam ve pil değişimi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### H.29 Soba, Banyo Kazanı, Şofben İmalatı, Onarımı, Ticareti

NACE: 275202 Elektriksiz Ev Tipi Gaz, Sıvı Veya Katı Yakıtlı Soba, Kuzine, Izgara, Şömine, Mangal, Semaver, Su Isıtıcısı (Termosifon, Şofben Vb.) Vb. Aletlerin İmalatı; 952203 Termosifon, Şofben, Banyo Kazanı Vb. Onarım Ve Bakımı (Merkezi Isıtma Kazanlarının (Boylerler) Onarımı Hariç)

**Belge seçimi:** Soba ve şofben satıcısı / servisi hanelere satış ve onarımda e-Arşiv; okul ve köy konakları gibi kamu idarelerine soba tesliminde KAMU senaryolu e-Fatura (IBAN zorunlu) düzenler.

- **Kuzine Soba Satış ve Montaj e-Arşiv** (`meslek-h29-kuzine-soba-satis-ve-montaj-e-arsiv`, e-Arşiv Fatura, yerleşim *defter*): Haneye fırınlı kuzine soba, baca borusu ve montaj.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Köy Okullarına Soba Teslimi (KAMU)** (`meslek-h29-koy-okullarina-soba-teslimi-kamu`, e-Fatura, yerleşim *kurumsal*): İl Milli Eğitim Müdürlüğüne köy okulları için kömür sobası teslimi; KAMU senaryosu.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.

### H.30 Tenekecilik

NACE: 259913 Metalden Çatı Olukları, Çatı Kaplamaları Vb. İmalatı; 434100 Çatı İşleri

**Belge seçimi:** Tenekeci / çatı ustası ev sahiplerine çatı onarımında e-Arşiv; müteahhit firmalara alt yüklenici olarak yaptığı çatı işleri yapım işi sayıldığından 601 kodlu 4/10 tevkifatlı e-Fatura düzenler.

- **Çatı Oluk ve Kaplama e-Arşiv** (`meslek-h30-cati-oluk-ve-kaplama-e-arsiv`, e-Arşiv Fatura, yerleşim *defter*): Ev sahibine galvaniz oluk, dere ve çatı kaplama onarımı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Müteahhide Çatı İşleri (Tevkifat 601)** (`meslek-h30-muteahhide-cati-isleri-tevkifat-601`, e-Fatura, yerleşim *kurumsal*): Konut projesinin çatı kaplama ve oluk işleri; yapım işi, 4/10 tevkifat ve hakediş referansı.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 601, Percent 40 (4/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### H.31 Tornacılık

NACE: 254004 Metallerin Dövülmesi, Preslenmesi, Baskılanması Ve Damgalanması; 254005 Toz Metalürjisi; 255301 Metallerin Makinede İşlenmesi (Torna Tesfiye İşleri, Metal Parçaları Delme, Tornalama, Frezeleme, Rendeleme, Parlatma, Oluk Açma, Perdahlama, Birleştirme, Kaynak Yapma, Çapak Alma, Kumlama, Vb. Faaliyetler); 255302 Cnc Oksijen, Cnc Plazma, Cnc Su Jeti Vb. Makinelerinin Kullanılması Yoluyla Metallerin Kesilmesi Veya Üzerlerinin Yazılması; 255303 Lazer Işınlarının Kullanılması Yoluyla Metallerin Kesilmesi Veya Üzerlerinin Yazılması; 281401 Sanayi Musluk, Valf Ve Vanaları, Sıhhi Tesisat Ve Isıtmada Kullanılan Musluk Ve Vanalar İle Doğalgaz Vanaları, Dökme Olanlar; 281402 Sanayi Musluk, Valf Ve Vanaları, Sıhhi Tesisat Ve Isıtmada Kullanılan Musluk Ve Vanalar İle Doğalgaz Vanaları, Dökme Olanlar Hariç

**Belge seçimi:** Tornacı müşterinin malzemesini fason işler veya kendi malzemesiyle parça imal eder: e-Fatura ile faturalar, işlenmiş parçaların sevkini e-İrsaliye ile yapar. Teknik resim / iş emri numarası belge referansıdır.

- **Fason CNC İşleme e-Faturası** (`meslek-h31-fason-cnc-isleme-e-faturasi`, e-Fatura, yerleşim *teknik*): Makine imalatçısına CNC torna ve freze ile mil ve flanş imalatı; teknik resim no satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **İşlenmiş Parça Sevk İrsaliyesi** (`meslek-h31-islenmis-parca-sevk-irsaliyesi`, e-İrsaliye, yerleşim *kenar*): Atölyeden müşteri fabrikasına sandıklı parça sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### H.32 Tüp Gaz Bayiliği

NACE: 477810 Evlerde Kullanılan Tüpgaz Perakende Ticareti

**Belge seçimi:** Tüpgaz bayisi hanelere e-Arşiv, restoran ve fırın gibi işletmelere e-Fatura düzenler. LPG'nin ÖTV'si (I) sayılı listede dağıtıcı (lisans sahibi) aşamasında alındığından bayi faturasında ayrıca ÖTV satırı yoktur; EPDK lisans no ve tüp seri numarası belgede gösterilir, tüp depozitosu ayrı kayıt edilir.

- **Ev Tüpü Teslimi e-Arşiv** (`meslek-h32-ev-tupu-teslimi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Haneye 12 kg tüpgaz kapıya teslim; tüp seri no ve EPDK lisans bilgisi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Restorana Sanayi Tüpü e-Faturası** (`meslek-h32-restorana-sanayi-tupu-e-faturasi`, e-Fatura, yerleşim *kurumsal*): Restorana aylık 45 kg sanayi tüpü teslimleri; tüp seri numaraları satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### I.01 Pazarda Ayakkabı, Tekstil Ürünleri Ticareti

NACE: 475106 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Tuhafiye, Manifatura Ve Mefruşat Ürünleri Perakende Ticareti (Seyyar Satıcılar Hariç); 477113 Tezgahlar Ve Pazar Yerleri Vasıtasıyla İç Giyim Eşyası, Dış Giyim Eşyası, Çorap, Giysi Aksesuarı Ve Ayakkabı Perakende Ticareti (Seyyar Satıcılar Hariç)

**Belge seçimi:** Pazarcıların çoğu basit usul / esnaf muaflığındadır; işletme hesabı esasına geçen pazarcı müşteri talebinde e-Arşiv düzenler. Evinde örgü / dikiş yapan ve GVK 9/6 esnaf muaflığından yararlanan kişilerden alımlar %2 stopajlı e-Gider Pusulası ile belgelenir.

- **Pazar Tezgâhı Satışı e-Arşiv** (`meslek-i01-pazar-tezgahi-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Müşteriye çorap, pijama takımı ve nevresim satışı; müşteri talebiyle düzenlenen belge.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Ev Hanımından El Örgüsü Alımı Gider Pusulası** (`meslek-i01-ev-hanimindan-el-orgusu-alimi-gider-pusulasi`, e-Gider Pusulası, yerleşim *defter*): Evinde örgü yapan esnaf muaflığı belgeli kişiden yün çorap ve patik alımı; %2 stopaj.
  - CreditNote · TR1.2.1 · ProfileID GIDERPUSULASI · CreditNoteTypeCode SATIS. Belge vermeyen (vergiden muaf / ÇKS'siz) satıcı AccountingCustomerParty (TCKN + Person, SMS kodu); düzenleyen SMS_PROVIDER. GV stopajı 0003 %2 (GVK 94/13) TaxTotal'da, ödenecekten düşülür.

### I.02 Pazarda Bitki, Hayvan, Su Ürünleri Ticareti

NACE: 472302 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Balık Ve Diğer Su Ürünleri Perakende Ticareti (Seyyar Satıcılar Hariç); 477606 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Çiçek, Bitki Ve Bitki Tohumu (Çiçek Toprağı Ve Saksıları Dahil) Perakende Ticareti (Seyyar Satıcılar Hariç); 477607 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Canlı Büyük Ve Küçükbaş Hayvan, Canlı Kümes Hayvanı, Ev Hayvanı Ve Yemlerinin Perakende Ticareti (Seyyar Satıcılar Hariç)

**Belge seçimi:** Pazarda balık satan tezgâhçı talep halinde e-Arşiv düzenler (taze balıkta indirimli KDV oranı); balığı doğrudan ruhsatlı balıkçıdan alıyorsa e-Müstahsil Makbuzu (hayvansal ürün %1 stopaj) kullanır. Halden alınan ürünler HKS künyeli belgeyle gelir.

- **Pazarda Balık Satışı e-Arşiv** (`meslek-i02-pazarda-balik-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Müşteriye hamsi, istavrit ve temizlik hizmeti.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Balıkçıdan Av Alımı e-Müstahsil** (`meslek-i02-balikcidan-av-alimi-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *endustri*): Ruhsatlı küçük balıkçı teknesinden sabah avı alımı; %1 GV stopajı ve Bağ-Kur kesintisi.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %1 (hayvan / hayvansal ürün), SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

### I.03 Pazarda Çeşitli Malların Ticareti

NACE: 471203 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Bys. Diğer Malların Perakende Ticareti (Seyyar Satıcılar Hariç); 475224 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Mutfak Eşyaları İle Banyo Ve Tuvalette Kullanılan Eşyaların Perakende Ticareti (Seyyar Satıcılar Hariç); 475225 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Elektrikli Alet, Cihaz Ve Elektrik Malzemeleri, El Aletleri İle Hırdavat Perakende Ticareti (Seyyar Satıcılar Hariç); 475304 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Halı, Kilim, Vb. Perakende Ticareti (Seyyar Satıcılar Hariç); 475512 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Ev Ve Büro Mobilyaları (Ağaç, Metal, Vb.) Perakende Ticareti (Seyyar Satıcılar Hariç); 476409 Tezgahlar Ve Pazar Yerleri Vasıtasıyla İmitasyon Takı, Süs Eşyası, Oyun, Oyuncak, Turistik Ve Hediyelik Eşya Perakende Ticareti (Seyyar Satıcılar Hariç); 477502 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Kişisel Bakım Ve Kozmetik Ürünleri (Diş Fırçaları, Saç Fırçaları, Elektriksiz Tıraş Makineleri, Jilet, Ustura, Parfümeri Ürünleri Ve Kolonya, Doğal Sünger, Sabun Vb. Dahil) Perakende Ticareti (Seyyar Satıcılar Hariç)

**Belge seçimi:** Pazarda çeşitli mal satan esnaf talep halinde e-Arşiv düzenler; bit pazarı tezgâhları için vatandaştan belge alınamayan ikinci el eşya alımları e-Gider Pusulası ile belgelenir (nihai tüketicinin kendi eşyası için stopaj yoktur).

- **Pazarda Mutfak Eşyası Satışı e-Arşiv** (`meslek-i03-pazarda-mutfak-esyasi-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Müşteriye tencere, saklama kabı ve oyuncak satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Vatandaştan İkinci El Eşya Alımı Gider Pusulası** (`meslek-i03-vatandastan-ikinci-el-esya-alimi-gider-pusulasi`, e-Gider Pusulası, yerleşim *defter*): Bit pazarı tezgâhı için vatandaştan eski bakır ve plak alımı.
  - CreditNote · TR1.2.1 · ProfileID GIDERPUSULASI · CreditNoteTypeCode SATIS. Belge vermeyen (vergiden muaf / ÇKS'siz) satıcı AccountingCustomerParty (TCKN + Person, SMS kodu); düzenleyen SMS_PROVIDER. Stopaj yok.

### I.04 Pazarda Sebze, Meyve Ticareti

NACE: 472106 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Sebze Ve Meyve (Taze Veya İşlenmiş) (Zeytin Dahil) Perakende Ticareti (Seyyar Satıcılar Hariç)

**Belge seçimi:** Pazarcı manav talep halinde e-Arşiv düzenler (yaş sebze-meyvede indirimli KDV). Üreticiden doğrudan alımda e-Müstahsil (bitkisel ürün %2 stopaj) düzenler; halden / komisyoncudan aldığı ürün HKS künyeli e-Fatura ile gelir ve künye no satışta izlenebilirlik için saklanır.

- **Pazarda Sebze-Meyve Satışı e-Arşiv** (`meslek-i04-pazarda-sebze-meyve-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Müşteriye domates, biber, üzüm ve zeytin satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Üreticiden Domates Alımı e-Müstahsil** (`meslek-i04-ureticiden-domates-alimi-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *defter*): Bahçe sahibi üreticiden doğrudan domates ve biber alımı; %2 stopaj ve Bağ-Kur kesintisi.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %2 (zirai ürün), SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

### I.05 Pazarda Yiyecek, İçecek Ticareti

NACE: 471103 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Diğer Gıda Ürünleri (Bal, Un, Tahıl, Pirinç, Bakliyat Vb. Dahil) Perakende Ticareti (Seyyar Satıcılar Hariç); 472207 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Şarküteri Ürünleri, Süt Ve Süt Ürünleri İle Yumurta Perakende Ticareti (Seyyar Satıcılar Hariç); 472403 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Fırın Ürünleri Perakende Ticareti (Seyyar Satıcılar Hariç); 472404 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Şekerleme Perakende Ticareti (Seyyar Satıcılar Hariç); 472709 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Yenilebilir Katı Ve Sıvı Yağ (Tereyağı Hariç) Perakende Ticareti (Seyyar Satıcılar Hariç); 472710 Tezgahlar Ve Pazar Yerleri Vasıtasıyla Çay, Kahve, Kakao, Baharat Perakende Ticareti (Seyyar Satıcılar Hariç)

**Belge seçimi:** Pazarda gıda satan tezgâhçı talep halinde e-Arşiv düzenler; ürünlere göre KDV oranı farklılaşır (temel gıda %1, işlenmiş gıda %10). Köydeki üreticiden peynir, bal ve yumurta alımları e-Müstahsil Makbuzu (hayvansal ürün %1 stopaj) ile belgelenir.

- **Pazarda Köy Ürünü Satışı e-Arşiv** (`meslek-i05-pazarda-koy-urunu-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Müşteriye peynir, yumurta, zeytinyağı ve bal satışı; farklı KDV oranları aynı belgede.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Köylüden Peynir ve Yumurta Alımı e-Müstahsil** (`meslek-i05-koyluden-peynir-ve-yumurta-alimi-e-mustahsil`, e-Müstahsil Makbuzu, yerleşim *defter*): Köydeki üreticiden beyaz peynir ve yumurta alımı; %1 GV stopajı.
  - CreditNote · CustomizationID TR1.2.1 · ProfileID EARSIVBELGE · CreditNoteTypeCode MUSTAHSILMAKBUZ. Kesintiler TaxTotal'da: 0003 GV stopajı %1 (hayvan / hayvansal ürün), SGK_PRIM Bağ-Kur %1. Satıcı (düzenleyen) Contact/OtherCommunication SMS_PROVIDER; üretici Contact ID (SMS doğrulama kodu) + Name "SMS". PayableAmount = brüt − kesintiler.

### I.06 Seyyar Satıcılık

NACE: 471104 Seyyar Olarak Ve Motorlu Araçlarla Gıda Ürünleri Ve İçeceklerin (Alkollü İçecekler Hariç) Perakende Ticareti; 471106 Mağaza, Tezgah, Pazar Yeri Dışında Yapılan Perakende Ticaret; 471202 Seyyar Olarak Ve Motorlu Araçlarla Diğer Malların Perakende Ticareti; 475107 Seyyar Olarak Ve Motorlu Araçlarla Tekstil, Giyim Eşyası Ve Ayakkabı Perakende Ticareti; 561200 Seyyar Yemek Hizmeti Faaliyetleri

**Belge seçimi:** Seyyar / food truck işletmesi bireysel müşteriye talep halinde e-Arşiv düzenler; şirket etkinliklerine verdiği yemek ikramı yemek servis hizmeti sayılır ve belirlenmiş alıcılara 604 kodlu 5/10 KDV tevkifatlı e-Fatura ile faturalanır.

- **Food Truck Satışı e-Arşiv** (`meslek-i06-food-truck-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Müşteriye dürüm, patates ve içecek satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Şirket Etkinliğine Food Truck İkramı (Tevkifat 604)** (`meslek-i06-sirket-etkinligine-food-truck-ikrami-tevkifat-604`, e-Fatura, yerleşim *modern*): Teknoloji şirketinin yerleşke şenliğinde 250 kişilik food truck ikramı; 5/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 604, Percent 50 (5/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### J.01 Akaryakıt Ticareti

NACE: 205124 Sıvı Biyoyakıt İmalatı; 468101 Sıvı Yakıtlar Ve Bunlarla İlgili Ürünlerin Toptan Ticareti; 473001 Motorlu Kara Taşıtı Ve Motosiklet Yakıtının Perakende Ticareti; 477809 Evlerde Kullanılan Fuel Oil Perakende Ticareti

**Belge seçimi:** Akaryakıt istasyonu bireysel satışlarda e-Arşiv, filo / kurumsal müşterilere aylık toplu e-Fatura düzenler. ÖTV (I) sayılı liste ürünlerinde rafineri / dağıtıcı aşamasında tahsil edilir; bayi faturasında ayrı ÖTV satırı yer almaz, ÖTV satış fiyatının içindedir. İstasyondaki elektrikli araç şarjı ENERJI profili, SARJ tipi ile faturalanır.

- **Pompa Satışı e-Arşiv (Plakalı)** (`meslek-j01-pompa-satisi-e-arsiv-plakali`, e-Arşiv Fatura, yerleşim *fis*): Bireysel müşteriye benzin ve market satışı; plaka ve pompa bilgisi satırda.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Filo Müşterisine Aylık Yakıt Faturası** (`meslek-j01-filo-musterisine-aylik-yakit-faturasi`, e-Fatura, yerleşim *kurumsal*): Taşıt tanıma sistemiyle (TTS) yapılan aylık filo alımlarının araç bazlı toplu faturası.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **İstasyonda Elektrikli Araç Şarjı (ENERJI · SARJ)** (`meslek-j01-istasyonda-elektrikli-arac-sarji-enerji-sarj`, e-Fatura, yerleşim *modern*): Kurumsal müşterinin elektrikli aracına DC hızlı şarj; ENERJI profili, plaka alıcı kimliğinde.
  - ProfileID ENERJI, InvoiceTypeCode SARJ; araç bilgisi alıcı PartyIdentification PLAKA, oturum / dönem bilgisi AdditionalDocumentReference.

### J.02 Durak, Otopark İşletmeciliği

NACE: 522107 Otopark Ve Garaj İşletmeciliği (Bisiklet Parkları Ve Karavanların Kışın Saklanması Dahil); 522109 Kara Yolu Yolcu Taşımacılığına Yönelik Otobüs Terminal Hizmetleri; 522110 Kara Yolu Yolcu Taşımacılığına Yönelik Otobüs, Minibüs Ve Taksi Duraklarının İşletilmesi (Otobüs Terminal Hizmetleri Hariç); 522190 Kara Taşımacılığını Destekleyici Diğer Hizmetler (Kamyon Terminal İşletmeciliği Dahil); 969905 Kendi Hesabına Çalışan Valelerin Hizmetleri

**Belge seçimi:** Otopark işletmesi saatlik / aylık abone bireysel müşterilere e-Arşiv, şirketlere e-Fatura düzenler; plaka belgede yer alır. Otoparktaki şarj ünitesinden anlık şarj ENERJI profili SARJANLIK tipiyle (PLAKA + ARACKIMLIKNO) faturalanır.

- **Aylık Otopark Aboneliği e-Arşiv** (`meslek-j02-aylik-otopark-aboneligi-e-arsiv`, e-Arşiv Fatura, yerleşim *serit*): Bireysel aboneye aylık kapalı otopark bedeli; plaka ve dönem belgede.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Şirkete Toplu Otopark Kiralama Faturası** (`meslek-j02-sirkete-toplu-otopark-kiralama-faturasi`, e-Fatura, yerleşim *kurumsal*): Şirketin 20 aracı için aylık rezerve otopark yeri kiralaması.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Otoparkta Anlık Araç Şarjı (ENERJI · SARJANLIK)** (`meslek-j02-otoparkta-anlik-arac-sarji-enerji-sarjanlik`, e-Arşiv Fatura, yerleşim *fis*): Bireysel müşterinin aracına AC şarj; plaka ve araç kimlik no alıcı tarafında.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SARJANLIK.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - ProfileID ENERJI, InvoiceTypeCode SARJANLIK; araç bilgisi alıcı PartyIdentification PLAKA + ARACKIMLIKNO, oturum / dönem bilgisi AdditionalDocumentReference.

### J.03 Faytonculuk

NACE: 493900 Başka Yerde Sınıflandırılmamış Kara Taşımacılığı İle Yapılan Diğer Yolcu Taşımacılığı

**Belge seçimi:** Fayton ile turistik gezi yolcu taşıma hizmetidir; bireysel turlarda e-Bilet (sefer / güzergâh bilgili), otel ve acentelere toplu satışta e-Fatura düzenlenir.

- **Fayton Turu e-Bileti** (`meslek-j03-fayton-turu-e-bileti`, e-Bilet, yerleşim *bilet*): Bireysel yolcuya 1 saatlik vadi fayton turu; kalkış saati ve güzergâh bilette.
  - ProfileID e-Bilet (depo şablon kuralı) · SATIS; InvoicePeriod sefer / etkinlik başlangıcı, AdditionalDocumentReference ile SEFERNO, GUZERGAH, PLAKA. Yolcu / seyirci AccountingCustomerParty (TCKN + Person).

- **Otele Grup Fayton Turu Faturası** (`meslek-j03-otele-grup-fayton-turu-faturasi`, e-Fatura, yerleşim *zarif*): Butik otel misafirleri için ay boyunca yapılan grup fayton turları.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### J.04 İş Makinesi İşletmeciliği

NACE: 016102 Bitkisel Üretimi Destekleyici Mahsulün Hasat Ve Harmanlanması, Biçilmesi, Balyalanması, Biçerdöver İşletilmesi Vb. Faaliyetler; 370001 Kanalizasyon (Kanalizasyon Atıklarının Uzaklaştırılması Ve Arıtılması, Kanalizasyon Sistemlerinin Ve Atık Su Arıtma Tesislerinin İşletimi, Foseptik Çukurların Ve Havuzların Boşaltılması Ve Temizlenmesi, Seyyar Tuvalet Faaliyetleri Vb.); 439904 Vinç Ve Benzeri Diğer İnşaat Ekipmanlarının Operatörü İle Birlikte Kiralanması (Özel Bir İnşaat Çeşidinde Yer Almayan); 773201 Bina Ve Bina Dışı İnşaatlarda Kullanılan Makine Ve Ekipmanların Operatörsüz Olarak Kiralanması Ve Operasyonel Leasingi (Kurma/Sökme Hariç)

**Belge seçimi:** İş makinesi işletmecisi yapım işine alt yüklenici olarak katıldığında hafriyat bedeli belirlenmiş alıcılara 601 kodlu 4/10 KDV tevkifatlı e-Fatura ile faturalanır; operatörsüz makine kiralaması normal e-Fatura, çiftçiye verilen hasat hizmeti e-Arşiv ile belgelenir.

- **Şantiye Hafriyat Hakedişi (Tevkifat 601)** (`meslek-j04-santiye-hafriyat-hakedisi-tevkifat-601`, e-Fatura, yerleşim *endustri*): Konut projesinde ekskavatör ve kamyonla temel kazısı alt yüklenici hakedişi; 4/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 601, Percent 40 (4/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Operatörsüz Mini Ekskavatör Kiralama** (`meslek-j04-operatorsuz-mini-ekskavator-kiralama`, e-Fatura, yerleşim *teknik*): Peyzaj firmasına 2 haftalık operatörsüz mini ekskavatör kiralaması.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Çiftçiye Biçerdöver Hasat Hizmeti e-Arşiv** (`meslek-j04-ciftciye-bicerdover-hasat-hizmeti-e-arsiv`, e-Arşiv Fatura, yerleşim *defter*): Buğday tarlasında dönüm başı biçerdöver hasat hizmeti.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### J.05 Kara Yolu İle Yük Taşımacılığı

NACE: 494101 Kara Yolu İle Şehir İçi Yük Taşımacılığı (Gıda, Sıvı, Kuru Yük Vb.) (Gaz Ve Petrol Ürünleri Hariç); 494102 Kara Yolu İle Şehirler Arası Yük Taşımacılığı (Gıda, Sıvı, Kuru Yük, Vb.) (Gaz Ve Petrol Ürünleri Hariç); 494103 Kara Yolu İle Uluslararası Yük Taşımacılığı (Gıda, Sıvı, Kuru Yük, Vb.) (Gaz Ve Petrol Ürünleri Hariç); 494105 Kara Yolu İle Canlı Hayvan Taşımacılığı (Çiftlik Hayvanları, Kümes Hayvanları, Vahşi Hayvanlar Vb.); 494106 Sürücüsü İle Birlikte Kamyon, Beton Mikseri Ve Diğer Motorlu Yük Taşıma Araçlarının Kiralanması; 494108 Kara Yolu İle Şehir İçi Yük Taşımacılığı (Gaz Ve Petrol Ürünleri, Kimyasal Ürünler Vb.); 494109 Kara Yolu İle Şehirler Arası Yük Taşımacılığı (Gaz Ve Petrol Ürünleri, Kimyasal Ürünler Vb.); 494110 Kara Yolu İle Uluslararası Yük Taşımacılığı (Gaz Ve Petrol Ürünleri, Kimyasal Ürünler Vb.) … (+2 kod)

**Belge seçimi:** Yük taşıma hizmeti belirlenmiş alıcılara 624 kodlu 2/10 KDV tevkifatlı e-Fatura ile faturalanır; U-ETDS bildirim numarası ve plaka belgeye eklenir. Yurt dışına yapılan taşımalar KDV 14/1 (311) uluslararası taşımacılık istisnasıyla faturalanır. Taşınan malın irsaliyesini yük sahibi düzenler; taşıyıcı bu irsaliyede CarrierParty olarak yer alır.

- **Yurt İçi Komple Tır Taşıma (Tevkifat 624)** (`meslek-j05-yurt-ici-komple-tir-tasima-tevkifat-624`, e-Fatura, yerleşim *endustri*): Otomotiv yan sanayi firmasına Bursa–Ankara komple tır taşıma; 2/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 624, Percent 20 (2/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Uluslararası Taşıma Faturası (İstisna 311)** (`meslek-j05-uluslararasi-tasima-faturasi-istisna-311`, e-Fatura, yerleşim *kurumsal*): İhracatçı tekstil firmasının yükünün Bursa–Münih taşıması; KDV 14/1 istisnası, EUR.
  - InvoiceTypeCode ISTISNA; KDV TaxSubtotal Percent 0 + TaxExemptionReasonCode 311 (14/1 Uluslararası taşımacılık).
  - Döviz: DocumentCurrencyCode EUR + PricingExchangeRate (49.912).

### J.06 Minibüsçülük

NACE: 493106 Minibüs Ve Dolmuş İle Yapılan Şehir İçi Ve Banliyö Yolcu Taşımacılığı (Belirlenmiş Güzergahlarda); 493190 Kara Yoluyla Tarifeli Diğer Yolcu Taşımacılığı

**Belge seçimi:** Hat minibüsü işletmecisinin elektronik kartla biniş gelirleri belediye / toplu taşıma idaresi tarafından hakediş olarak ödenir ve KAMU senaryolu e-Fatura ile faturalanır; boş saatlerde yapılan personel servis taşımacılığı belirlenmiş alıcılara 614 kodlu 5/10 tevkifatlı e-Fatura ile faturalanır.

- **Belediyeye Kartlı Biniş Hakedişi (KAMU)** (`meslek-j06-belediyeye-kartli-binis-hakedisi-kamu`, e-Fatura, yerleşim *kurumsal*): Aylık elektronik kartlı biniş sayısına göre belediye toplu taşıma hakedişi; KAMU senaryosu, IBAN zorunlu.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.

- **Sabah-Akşam Personel Servisi (Tevkifat 614)** (`meslek-j06-sabah-aksam-personel-servisi-tevkifat-614`, e-Fatura, yerleşim *serit*): Fabrika vardiyası için aylık personel servisi; 5/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 614, Percent 50 (5/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### J.07 Nakliyat Komisyonculuğu

NACE: 522603 Kara Yolu Yük Nakliyat Acentelerinin Faaliyetleri; 523102 Kara Yolu Yük Nakliyat Komisyoncularının Faaliyetleri

**Belge seçimi:** Nakliyat komisyoncusu taşımayı kendi adına üstleniyorsa taşıma bedelinin tamamını yük sahibine 624 tevkifatlı e-Fatura ile faturalar; aracılık komisyonunu kamyon sahibine (e-Fatura mükellefi değilse) e-Arşiv ile faturalar. C2 / K1 yetki belgesi no belgeye eklenir.

- **Yük Sahibine Taşıma Organizasyonu (Tevkifat 624)** (`meslek-j07-yuk-sahibine-tasima-organizasyonu-tevkifat-624`, e-Fatura, yerleşim *endustri*): Narenciye ihracatçısının limana 6 kamyon taşıması; 2/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 624, Percent 20 (2/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Kamyon Sahibine Komisyon e-Arşiv** (`meslek-j07-kamyon-sahibine-komisyon-e-arsiv`, e-Arşiv Fatura, yerleşim *defter*): Yük bulma ve organizasyon karşılığı kamyon sahibinden alınan aracılık komisyonu.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### J.08 Oto Galericilik, Oto Kiralama

NACE: 478114 Otomobillerin Ve Hafif Motorlu Kara Taşıtlarının Perakende Ticareti (Elektrikli Olanlar İle Ambulans Ve Minibüs Benzeri Motorlu Yolcu Taşıtları Dahil); 478190 Diğer Motorlu Kara Taşıtlarının Perakende Ticareti (Kamyonlar, Çekiciler, Römorklar, Yarı Römorklar, Kamp Araçları Vb., Elektrikli Olanlar Dahil); 493204 Kara Yoluyla Tarifesiz Yolcu Taşımacılığı; 493302 Sürücüsü İle Birlikte Diğer Özel Araç Kiralama Faaliyeti; 771101 Motorlu Hafif Kara Taşıtlarının Ve Arabaların Sürücüsüz Olarak Kiralanması Ve Operasyonel Leasingi (Motosiklet Ve Motokaravan İçin Olanlar Hariç); 771201 Motorlu Ağır Kara Taşıtlarının Sürücüsüz Olarak Kiralanması Ve Operasyonel Leasingi (Ağırlığı 3.5 Tondan Daha Fazla Olanlar) (Motokaravan İçin Olanlar Hariç)

**Belge seçimi:** Galeri ikinci el otomobil satışında KDV'yi alış–satış farkı üzerinden 812 kodlu özel matrah e-Arşiv / e-Fatura ile hesaplar (noter satış bilgisi belgede). Kiralama tarafında günlük kiralama e-Arşiv, kurumsal uzun dönem kiralama aylık e-Fatura ile (InvoicePeriod + plaka) faturalanır.

- **İkinci El Otomobil Satışı (Özel Matrah 812)** (`meslek-j08-ikinci-el-otomobil-satisi-ozel-matrah-812`, e-Arşiv Fatura, yerleşim *kart*): Bireysel müşteriye ikinci el otomobil; KDV yalnız kâr marjından, şasi ve noter bilgisi belgede.
  - ProfileID EARSIVFATURA · InvoiceTypeCode OZELMATRAH.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).
  - InvoiceTypeCode OZELMATRAH; KDV TaxSubtotal TaxableAmount = özel matrah (satış − alış/has değeri), TaxExemptionReasonCode 812. LineExtensionAmount satış bedelinin tamamıdır.

- **Kurumsal Uzun Dönem Kiralama Aylık Faturası** (`meslek-j08-kurumsal-uzun-donem-kiralama-aylik-faturasi`, e-Fatura, yerleşim *kurumsal*): Şirkete 36 ay sözleşmeli 4 aracın aylık kira bedeli; dönem ve plaka bazlı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Günlük Araç Kiralama e-Arşiv** (`meslek-j08-gunluk-arac-kiralama-e-arsiv`, e-Arşiv Fatura, yerleşim *serit*): Bireysel müşteriye 5 günlük araç kiralama; teslim-iade tarihi ve km.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### J.09 Oto Kurtarıcılık

NACE: 522104 Kara Yolu Taşımacılığı İle İlgili Özel Ve Ticari Araçlar İçin Çekme Ve Yol Yardımı Faaliyetleri

**Belge seçimi:** Oto kurtarıcı bireysel müşteriye e-Arşiv, sigorta / asistans firmalarına dosya numaralı aylık toplu e-Fatura düzenler; hasar dosya no ve plaka belgeye eklenir.

- **Bireysel Çekici Hizmeti e-Arşiv** (`meslek-j09-bireysel-cekici-hizmeti-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Arızalı aracın yol kenarından servise çekilmesi; plaka ve mesafe belgede.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Asistans Firmasına Aylık Çekici Faturası** (`meslek-j09-asistans-firmasina-aylik-cekici-faturasi`, e-Fatura, yerleşim *kurumsal*): Sigorta asistans firmasının yönlendirdiği yol yardım dosyalarının aylık faturası.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### J.10 Otobüsçülük

NACE: 493104 Halk Otobüsü/Otobüs İle Yapılan Şehir İçi Ve Banliyö Yolcu Taşımacılığı; 493107 Kara Yolu (Otobüs, Vb.) İle Uluslararası Yolcu Taşımacılığı; 493108 Şehirler Arası Tarifeli Kara Yolu Yolcu Taşımacılığı

**Belge seçimi:** Şehirler arası otobüs firması yolcu biletini e-Bilet olarak düzenler (sefer no, koltuk, peron, plaka ek alanları). Kurumsal charter seferleri e-Fatura, yurt dışı seferleri KDV 14/1 (311) istisnalı e-Fatura ile belgelenir; U-ETDS bildirimi yapılır.

- **Şehirler Arası Otobüs e-Bileti** (`meslek-j10-sehirler-arasi-otobus-e-bileti`, e-Bilet, yerleşim *bilet*): Bursa–Ankara seferi; sefer no, koltuk, peron ve plaka bilet üzerinde.
  - ProfileID e-Bilet (depo şablon kuralı) · SATIS; InvoicePeriod sefer / etkinlik başlangıcı, AdditionalDocumentReference ile SEFERNO, KOLTUKNO, PERON, PLAKA, KALKIS, VARIS. Yolcu / seyirci AccountingCustomerParty (TCKN + Person).

- **Kurumsal Charter Sefer Faturası** (`meslek-j10-kurumsal-charter-sefer-faturasi`, e-Fatura, yerleşim *kurumsal*): Şirketin bayi toplantısı için 3 otobüslük gidiş-dönüş charter seferi.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Yurt Dışı Tur Seferi (İstisna 311)** (`meslek-j10-yurt-disi-tur-seferi-istisna-311`, e-Fatura, yerleşim *zarif*): Tur operatörüne Bursa–Sofya–Belgrad tur otobüsü taşıması; KDV 14/1 istisnası, EUR.
  - InvoiceTypeCode ISTISNA; KDV TaxSubtotal Percent 0 + TaxExemptionReasonCode 311 (14/1 Uluslararası taşımacılık).
  - Döviz: DocumentCurrencyCode EUR + PricingExchangeRate (49.912).

### J.11 Özel Ambulans İşletmeciliği

NACE: 869200 Ambulansla Hasta Taşıma

**Belge seçimi:** Özel ambulans firması hasta yakınlarına e-Arşiv, özel hastane ve etkinlik organizatörlerine e-Fatura düzenler; nakil tarihi, plaka ve güzergâh belgede yer alır.

- **Şehirler Arası Hasta Nakli e-Arşiv** (`meslek-j11-sehirler-arasi-hasta-nakli-e-arsiv`, e-Arşiv Fatura, yerleşim *serit*): Hasta yakınına İzmir–Ankara yoğun bakım ambulansı ile nakil.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Özel Hastaneye Sözleşmeli Ambulans Faturası** (`meslek-j11-ozel-hastaneye-sozlesmeli-ambulans-faturasi`, e-Fatura, yerleşim *kurumsal*): Özel hastaneye aylık sözleşmeli nakil hizmetleri (dönem + sefer sayısı).
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### J.12 Servis Aracı İşletmeciliği

NACE: 493109 Şehir İçi, Banliyö Ve Kırsal Alanlarda Kara Yolu İle Personel, Öğrenci, Vb. Grup Taşımacılığı (Şehir İçi Personel Ve Okul Servisleri, Vb.); 493110 Kara Yolu Şehir İçi Ve Şehirler Arası Havaalanı Servisleri İle Yolcu Taşımacılığı

**Belge seçimi:** Personel servis taşımacılığı belirlenmiş alıcılara 614 kodlu 5/10 KDV tevkifatlı e-Fatura ile, kamu kurumlarına KAMU senaryolu tevkifatlı e-Fatura ile faturalanır; öğrenci servisi velilere aylık e-Arşiv ile belgelenir.

- **Fabrika Personel Servisi (Tevkifat 614)** (`meslek-j12-fabrika-personel-servisi-tevkifat-614`, e-Fatura, yerleşim *endustri*): Üç vardiyalı fabrikaya aylık personel servisi; güzergâh ve plaka bazlı, 5/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 614, Percent 50 (5/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Devlet Hastanesi Personel Servisi (KAMU · 614)** (`meslek-j12-devlet-hastanesi-personel-servisi-kamu-614`, e-Fatura, yerleşim *kurumsal*): Kamu ihalesiyle devlet hastanesine personel servis hizmeti; KAMU + 614 tevkifat.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 614, Percent 50 (5/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Öğrenci Servisi Aylık e-Arşiv** (`meslek-j12-ogrenci-servisi-aylik-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Veliye ilkokul öğrencisi aylık servis ücreti.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### J.13 Su Yolu Taşımacılığı

NACE: 501012 Deniz Ve Kıyı Sularında Yolcu Gemilerinin Ve Teknelerinin Mürettebatıyla Birlikte Kiralanması (Gezinti Tekneleri Dahil); 501013 Kıyı Sularında Yolcuların Feribotlarla, Kruvaziyer Gemilerle Ve Teknelerle Taşınması (Deniz Otobüsleri İşletmeciliği Dahil; Uluslararası Denizler İle Göl Ve Nehirlerde Yapılanlar Hariç); 501014 Deniz Ve Kıyı Sularında Yat İşletmeciliği; 501015 Deniz Ve Kıyı Sularında Gezi Veya Tur Bot Ve Teknelerinin İşletilmesi (Yat İşletmeciliği Hariç); 501090 Deniz Ve Kıyı Sularında Diğer Yolcu Taşımacılığı (Deniz Taksi Vb. Dahil); 503008 İç Sularda Yolcu Taşımacılığı (Nehir, Kanal Ve Göllerde Yapılanlar, Vb.) (Gezinti Amaçlı Olanlar Dahil); 503009 İç Sularda Yolcu Taşıma Gemilerinin Ve Teknelerinin Mürettebatıyla Birlikte Kiralanması; 504005 İç Sularda Yük Taşımacılığı (Nehir, Kanal Ve Göllerde Yapılanlar, Vb.) … (+4 kod)

**Belge seçimi:** Deniz yolcu taşımacılığında yolcu biletleri e-Bilet (sefer, iskele, gemi bilgili) olarak düzenlenir. Yunan adalarına yapılan uluslararası seferler KDV 14/1 (311) istisnalı e-Fatura ile tur acentelerine faturalanır; günlük tekne kiralama e-Fatura ile belgelenir.

- **Deniz Otobüsü e-Bileti** (`meslek-j13-deniz-otobusu-e-bileti`, e-Bilet, yerleşim *bilet*): Bodrum–Datça deniz otobüsü yolcu bileti; sefer, iskele ve gemi bilgisi.
  - ProfileID e-Bilet (depo şablon kuralı) · SATIS; InvoicePeriod sefer / etkinlik başlangıcı, AdditionalDocumentReference ile SEFERNO, GEMI, ISKELE, VARIS. Yolcu / seyirci AccountingCustomerParty (TCKN + Person).

- **Acenteye Kos Adası Seferleri (İstisna 311)** (`meslek-j13-acenteye-kos-adasi-seferleri-istisna-311`, e-Fatura, yerleşim *zarif*): Tur acentesine Bodrum–Kos günübirlik feribot seferleri; KDV 14/1 istisnası.
  - InvoiceTypeCode ISTISNA; KDV TaxSubtotal Percent 0 + TaxExemptionReasonCode 311 (14/1 Uluslararası taşımacılık).
  - Döviz: DocumentCurrencyCode EUR + PricingExchangeRate (49.912).

- **Günlük Tekne Kiralama Faturası** (`meslek-j13-gunluk-tekne-kiralama-faturasi`, e-Fatura, yerleşim *pastel*): Kurumsal etkinlik için kaptanlı günlük tekne kiralama ve ikram.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### J.14 Taksicilik

NACE: 493301 Taksi İle Yolcu Taşımacılığı

**Belge seçimi:** Taksiciler çoğunlukla basit usulde ya da işletme esasındadır; işletme esasındaki taksi yolcunun talebinde e-Arşiv düzenler (plaka, güzergâh). Kurumsal hesaplı müşterilere ay sonu toplu e-Fatura / e-Arşiv düzenlenir.

- **Havalimanı Transferi e-Arşiv** (`meslek-j14-havalimani-transferi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Yolcuya taksimetre ücreti; plaka ve güzergâh belgede.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Kurumsal Hesap Aylık Taksi Faturası** (`meslek-j14-kurumsal-hesap-aylik-taksi-faturasi`, e-Fatura, yerleşim *defter*): Şirket çalışanlarının fişle kullandığı taksi yolculuklarının aylık toplamı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### J.15 Trafik Müşavirliği, İş Takipçiliği

NACE: 829904 Trafik Müşavirliği; 829908 İş Takipçiliği Faaliyeti

**Belge seçimi:** Trafik müşavirliği serbest meslek faaliyeti olduğundan e-Serbest Meslek Makbuzu (e-SMM) düzenlenir; şirket müşterilerde %20 GV stopajı uygulanır. Müşteri adına ödenen harç ve noter ücretleri hizmet bedelinin parçası değildir, avans olarak ayrıca belgelenir.

- **Bireysel Araç Tescil İşlemi e-SMM** (`meslek-j15-bireysel-arac-tescil-islemi-e-smm`, e-SMM, yerleşim *zarif*): Gerçek kişiye ikinci el araç tescil ve plaka işlemi müşavirlik ücreti; stopaj yok.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015). Ödenecek = brüt + KDV − stopaj.

- **Filo Şirketine Toplu Tescil e-SMM (Stopajlı)** (`meslek-j15-filo-toplu-tescil`, e-SMM, yerleşim *kurumsal*): Araç kiralama şirketinin 12 yeni aracının tescil işlemleri; %20 GV stopajı.
  - CustomizationID TR1.2 · ProfileID EARSIVBELGE · InvoiceTypeCode SERBESTMESLEKMAKBUZU. TaxTotal içinde KDV (0015) ve GV stopajı 0003 (%20). Ödenecek = brüt + KDV − stopaj.

### J.16 Yük Taşımacılığını Destekleyici Faaliyetler

NACE: 521002 Frigorifik Depolama Ve Antrepoculuk Faaliyetleri (Bozulabilir Gıda Ürünleri Dahil Dondurulmuş Veya Soğutulmuş Mallar İçin Depolama); 521003 Hububat Depolama Ve Antrepoculuk Faaliyetleri (Hububat Silolarının İşletilmesi Vb.); 521005 Dökme Sıvı Depolama Ve Antrepoculuk Faaliyetleri (Yağ, Şarap Vb. Dahil; Petrol, Petrol Ürünleri, Kimyasallar, Gaz Vb. Hariç); 521090 Diğer Depolama Ve Antrepoculuk Faaliyetleri (Frigorifik Depolar İle Hububat, Kimyasallar, Dökme Sıvı Ve Gaz Depolama Faaliyetleri Hariç); 522106 Kara Taşımacılığına Yönelik Emanet Büroları İşletmeciliği (Demir Yollarında Yapılanlar Dahil); 522408 Su Yolu Taşımacılığıyla İlgili Kargo Ve Bagaj Yükleme Boşaltma (Elleçleme) Hizmetleri; 522410 Kara Yolu Taşımacılığıyla İlgili Kargo Yükleme Boşaltma (Elleçleme) Hizmetleri; 522411 Demir Yolu Taşımacılığıyla İlgili Kargo Yükleme Boşaltma (Elleçleme) Hizmetleri … (+10 kod)

**Belge seçimi:** Depolama ve antrepo hizmetleri aylık e-Fatura ile (palet, depo ve dönem bilgisiyle) faturalanır. Limanda gemilere verilen yükleme-boşaltma (elleçleme) hizmetleri KDV 13/b (305) kapsamında istisna e-Fatura ile belgelenir. Depodan çıkan malın irsaliyesini mal sahibi düzenler.

- **Soğuk Hava Deposu Aylık Kira ve Elleçleme** (`meslek-j16-soguk-hava-deposu-aylik-kira-ve-ellecleme`, e-Fatura, yerleşim *endustri*): Narenciye ihracatçısına palet bazlı soğuk depo kira ve depo içi elleçleme bedeli.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Gemiye Liman Elleçleme Hizmeti (İstisna 305)** (`meslek-j16-gemiye-liman-ellecleme-hizmeti-istisna-305`, e-Fatura, yerleşim *teknik*): Gemi acentesi aracılığıyla limanda gemiye konteyner yükleme-boşaltma; KDV 13/b istisnası.
  - InvoiceTypeCode ISTISNA; KDV TaxSubtotal Percent 0 + TaxExemptionReasonCode 305 (13/b Deniz ve hava taşıma araçları için liman ve hava meydanlarında yapılan hizmetler).
  - Döviz: DocumentCurrencyCode USD + PricingExchangeRate (42.653).

### K.01 Boya, Kimyasal Ürünlerin İmalatı

NACE: 201101 Sanayi Gazları İmalatı; 201201 Boya Maddeleri Ve Pigment İmalatı (Birincil Formda Veya Konsantre Olarak Herhangi Bir Kaynaktan) (Hazır Boyalar Hariç); 201202 Tabaklama Ekstreleri, Bitkisel Kökenli; Tanenler Ve Tuzları, Eterleri, Esterleri Ve Diğer Türevleri; Bitkisel Veya Hayvansal Kökenli Renklendirme Maddelerinin İmalatı; 201302 Metalik Halojenler, Hipokloritler, Kloratlar Ve Perkloratların İmalatı (Çamaşır Suyu Dahil); 201303 Sülfidler (Sülfürler), Sülfatlar, Fosfinatlar, Fosfonatlar, Fosfatlar Ve Nitratların İmalatı (Şap Dahil); 201390 Diğer Metal Tuzları Ve Temel İnorganik Kimyasalların İmalatı; 201399 Başka Yerde Sınıflandırılmamış Kimyasal Elementler, İnorganik Asitler Ve Bileşiklerin İmalatı; 201400 Diğer Organik Temel Kimyasalların İmalatı … (+23 kod)

**Belge seçimi:** Boya ve kimya üreticisi bayilere e-Fatura, sevkiyatlarda e-İrsaliye, yurt dışına IHRACAT profilli e-Fatura düzenler (GTİP 3208/3209). Kamu idareleri gibi belirlenmiş alıcılara yapılan mal teslimlerinde 626 kodlu "diğer teslimler" 2/10 KDV tevkifatı uygulanır.

- **Bayiye Boya Satış Faturası** (`meslek-k01-bayiye-boya-satis-faturasi`, e-Fatura, yerleşim *endustri*): Boya bayisine iç ve dış cephe boyası; parti no ve renk kodu satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Karayollarına Yol Çizgi Boyası (KAMU · 626)** (`meslek-k01-karayollarina-yol-cizgi-boyasi-kamu-626`, e-Fatura, yerleşim *kurumsal*): Karayolları bölge müdürlüğüne termoplastik yol çizgi boyası; KAMU senaryosu ve 2/10 tevkifat.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 626, Percent 20 (2/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Irak'a Boya İhracat Faturası** (`meslek-k01-irak-a-boya-ihracat-faturasi`, e-Fatura (İhracat), yerleşim *kurumsal*): Erbil'deki distribütöre su bazlı boya ihracatı; GTİP ve kap bilgisi satırda.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (DAP), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz USD + PricingExchangeRate.

### K.02 Boya, Kimyasal Ürünlerin Ticareti

NACE: 468304 Boya, Vernik Ve Lak Toptan Ticareti; 468501 Endüstriyel Kimyasalların Toptan Ticareti (Anilin, Matbaa Mürekkebi, Kimyasal Yapıştırıcı, Havai Fişek, Boyama Maddeleri, Sentetik Reçine, Metil Alkol, Parafin, Esans Ve Tatlandırıcı, Soda, Sanayi Tuzu, Parafin, Nitrik Asit, Amonyak, Sanayi Gazları Vb.); 475203 Boya, Vernik, Lak, Solvent Vb. Ürünlerin Perakende Ticareti

**Belge seçimi:** Boya bayisi bireysel müşteriye e-Arşiv, boya ustası ve müteahhitlere (e-Fatura mükellefiyse) vadeli e-Fatura düzenler; renk kodu ve parti no satırda yer alır.

- **Perakende Boya Satışı e-Arşiv** (`meslek-k02-perakende-boya-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Bireysel müşteriye renk karışımlı iç cephe boyası ve fırça seti.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Boya Ustasına Vadeli Satış** (`meslek-k02-boya-ustasina-vadeli-satis`, e-Fatura, yerleşim *defter*): Site boyası işi alan boya taahhüt firmasına vadeli toplu satış.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### K.03 Camcılık

NACE: 231101 Düz Cam İmalatı (Telli, Buzlu Cam, Renkli Veya Boyalı Düz Cam Dahil) (Dökülmüş, Haddelenmiş, Çekilmiş, Üflenmiş, Float, Yüzeyi Parlatılmış Veya Cilalanmış Ancak Başka Şekilde İşlenmemiş Olanlar); 231201 Cam Ayna İmalatı; 231203 Çok Katlı Yalıtım Camları İmalatı; 231204 Levha Veya Tabaka Halinde İşlenmiş Cam İmalatı (Kavislendirilmiş, Kenarları İşlenmiş, Gravür Yapılmış, Delinmiş, Emaylanmış/Sırlanmış Veya Başka Bir Şekilde İşlenmiş, Fakat Çerçevelenmemiş Veya Monte Edilmemiş Olanlar) (Optik Camlar Dahil); 231401 Cam Elyafı İmalatı (Cam Yünü Ve Bunlardan Yapılmış Dokuma Dışı Ürünler Dahil); 231501 Laboratuvar, Hijyen Veya Eczacılık İle İlgili Cam Eşyalar İle Cam Ampullerin (Serum Ampulleri) İmalatı (Ambalajlama Ve Taşımada Kullanılanlar Hariç); 231502 Lamba Ve Aydınlatma Teçhizatının, Işıklı İşaretlerin, İsim Tabelalarının Vb.nin Cam Parçalarının İmalatı (Cam Tabelaların İmalatı Dahil); 231505 Vitray Cam İmalatı … (+6 kod)

**Belge seçimi:** Camcı müteahhit ve sanayi müşterilerine m² bazlı e-Fatura, ev müşterilerine montaj dahil e-Arşiv düzenler; ölçü ve cam tipi satır ek alanında yer alır, sevk e-İrsaliye ile yapılır.

- **Müteahhide Isıcam Satışı** (`meslek-k03-muteahhide-isicam-satisi`, e-Fatura, yerleşim *teknik*): Konut projesine ölçülü ısıcam ünitesi; ölçü ve cam tipi satırda.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Eve Duşakabin ve Ayna Montajı e-Arşiv** (`meslek-k03-eve-dusakabin-ve-ayna-montaji-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Ev müşterisine temperli duşakabin ve banyo aynası montajı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### K.04 Çevre Düzenleme, Peyzaj Faaliyetleri

NACE: 813006 Çevre Düzenlemesi Ve Bakımı Faaliyetleri

**Belge seçimi:** Çevre ve bahçe bakım hizmetleri belirlenmiş alıcılara 613 kodlu 9/10 KDV tevkifatlı e-Fatura ile, belediyelere KAMU senaryolu tevkifatlı e-Fatura ile faturalanır; villa ve ev bahçeleri için e-Arşiv düzenlenir.

- **Otel Bahçe Bakımı Aylık Faturası (Tevkifat 613)** (`meslek-k04-otel-bahce-bakimi-aylik-faturasi-tevkifat-613`, e-Fatura, yerleşim *pastel*): Tatil köyü bahçe ve çim alan aylık bakımı; 9/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 613, Percent 90 (9/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Belediye Park Bakım Hakedişi (KAMU · 613)** (`meslek-k04-belediye-park-bakim-hakedisi-kamu-613`, e-Fatura, yerleşim *kurumsal*): Belediye park ve refüjlerinin ihaleli bakım hizmeti; KAMU + 613 tevkifat.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 613, Percent 90 (9/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Villa Bahçe Düzenleme e-Arşiv** (`meslek-k04-villa-bahce-duzenleme-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Villa sahibine hazır rulo çim, otomatik sulama ve ağaç dikimi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### K.05 Emlakçılık

NACE: 683101 Gayrimenkul Faaliyetleri İçin Aracılık Hizmeti Faaliyetleri; 683201 Gayrimenkul Değerleme (Eskpertiz) , Danışmanlık Ve Emanet Aracılarının (Escrow) Faaliyetleri; 683202 Bir Ücret Veya Sözleşmeye Dayalı Olarak Yapılan Diğer Gayrimenkul Yönetimi Faaliyetleri (Apartman Yöneticiliği Hariç); 683203 Bir Ücret Veya Sözleşmeye Dayalı Olarak Yapılan Kira Toplama Faaliyetleri; 683204 Bir Ücret Veya Sözleşmeye Dayalı Olarak Yapılan Apartman Yöneticiliği; 811001 Tesis Bünyesindeki Kombine Destek Hizmetleri

**Belge seçimi:** Emlakçı (yetki belgeli) aracılık komisyonunu alıcı ve satıcıya ayrı ayrı faturalar: gerçek kişilere e-Arşiv, şirketlere e-Fatura. Taşınmaz bilgisi (ada / parsel, tapu) ve yetki belge no belgeye eklenir; kira aracılığında dönem belirtilir.

- **Konut Satışı Aracılık Komisyonu e-Arşiv** (`meslek-k05-konut-satisi-aracilik-komisyonu-e-arsiv`, e-Arşiv Fatura, yerleşim *zarif*): Daire alıcısına satış bedeli üzerinden %2 + KDV hizmet bedeli; ada/parsel ve yetki belgesi.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Kiralama Aracılık Komisyonu e-Arşiv** (`meslek-k05-kiralama-aracilik`, e-Arşiv Fatura, yerleşim *pastel*): Kiracıya bir aylık kira bedeli + KDV hizmet bedeli; kira başlangıcı belgede.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Şirkete Ofis Kiralama Aracılık Faturası** (`meslek-k05-sirkete-ofis-kiralama-aracilik-faturasi`, e-Fatura, yerleşim *kurumsal*): Şirketin yeni bölge ofisi için kiralama aracılık hizmeti.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### K.06 Hırdavatçılık

NACE: 461502 Hırdavatçı (Nalburiye) Eşyalarının, Madeni Eşyaların Ve El Aletlerinin Toptan Satışı İle İlgili Aracıların Faaliyetleri; 468401 Hırdavat (Nalburiye) Malzemesi Ve El Aletleri Toptan Ticareti (Çivi, Raptiye, Vida, Adi Metalden Kilit, Menteşe, Bağlantı Parçası, Çekiç, Testere, Pense, Tornavida, Takım Tezgahı Uçları, Çengel, Halka, Perçin, Vb.); 468402 Sıhhi Tesisat Ve Isıtma Tesisatı Malzemesi Toptan Ticareti (Lavabo Musluğu, Vana, Valf, Tıkaç, T-Parçaları, Bağlantılar, Vb.) (Kombiler Ve Radyatörler Hariç); 468405 Tarım Ve Ormancılık Alet Ve Malzemeleri Toptan Ticareti (Balta, Kazma, Orak, Tırpan, Vb. Dahil, Tarımsal Amaçlı Makine Ve Ekipmanlar Hariç); 475202 Hırdavat (Nalburiye) Ve El Aletleri Perakende Ticareti; 475206 Sıhhi Tesisat Ve Isıtma Tesisatı Malzemesi Perakende Ticareti (Kombiler Ve Radyatörler Hariç)

**Belge seçimi:** Hırdavatçı perakende satışta e-Arşiv, inşaat ve sanayi firmalarına vadeli e-Fatura düzenler; şantiyeye teslimlerde e-İrsaliye ile sevk eder.

- **Nalbur Perakende Satışı e-Arşiv** (`meslek-k06-nalbur-perakende-satisi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Bireysel müşteriye matkap, vida ve silikon satışı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **İnşaat Firmasına Toptan Hırdavat** (`meslek-k06-insaat-firmasina-toptan-hirdavat`, e-Fatura, yerleşim *endustri*): İnşaat firmasına vadeli bağlantı elemanı ve el aleti satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Şantiyeye Hırdavat Sevk İrsaliyesi** (`meslek-k06-santiyeye-hirdavat-sevk-irsaliyesi`, e-İrsaliye, yerleşim *defter*): Faturadaki malzemenin şantiyeye kamyonetle sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### K.07 İnşaat Malzemeleri İmalatı

NACE: 172402 Duvar Kağıdı Ve Benzeri Duvar Kaplamalarının İmalatı (Tekstilden Olanlar Hariç); 205918 Mikronize Edilmiş Ve Stearik Asitle Kaplanmış Kalsit İmalatı; 222401 Plastikten Banyo Küvetleri, Lavabolar, Klozet Kapakları, Oturakları Ve Rezervuarları İle Benzeri Sıhhi Ürünlerin İmalatı (Kalıcı Tesisat İçin Kullanılan Montaj Ve Bağlantı Parçaları Dahil); 222404 Vinil, Linolyum (Muşamba) Gibi Esnek Yer Kaplamaları İle Plastik Zemin, Duvar Ve Tavan Kaplamalarının İmalatı (Duvar Kağıdı Hariç); 222499 Başka Yerde Sınıflandırılmamış Plastik İnşaat Malzemelerinin İmalatı (Plastik Suni Taş-Mermerit İmalatı Hariç); 231503 Sıkıştırılmış Veya Kalıplanmış Camdan Döşeme Blokları, Tuğlalar, Karolar Ve Diğer Ürünler, Kurşunlu Lambalar Ve Benzerleri, Blok, Plaka Veya Benzer Şekillerdeki Gözenekli, Köpüklü Camların İmalatı (Vitray Cam Hariç); 232016 Silisli Süzme Topraktan (Kizelgur) Isı Yalıtımlı Seramik Ürünler İle Ateşe Dayanıklı Briket, Blok, Tuğla, Ateş Tuğlası, Vb. Ateşe Dayanıklı Seramik Yapı Ürünleri İmalatı; 232017 Ateşe Dayanıklı İmbikler, Damıtma Kabı, Eritme Potası, Vana Ucu, Tüp, Boru, Döküm Potaları, Mufl Ocağı, Püskürtme Tüpleri Vb. Seramik Ürünlerin İmalatı … (+25 kod)

**Belge seçimi:** İnşaat malzemesi üreticisi bayilere e-Fatura, fabrikadan tır sevkiyatlarında e-İrsaliye (plaka, dorse, kg) düzenler; komşu ülkelere ihracat IHRACAT profilli e-Fatura ile yapılır.

- **Bayiye Tuğla ve Kiremit Faturası** (`meslek-k07-bayiye-tugla-ve-kiremit-faturasi`, e-Fatura, yerleşim *endustri*): Yapı malzemesi bayisine palet bazlı tuğla ve kiremit satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Fabrikadan Tır Sevk İrsaliyesi** (`meslek-k07-fabrikadan-tir-sevk-irsaliyesi`, e-İrsaliye, yerleşim *endustri*): Tuğla yükünün dorseli tırla bayiye sevki; palet ve tonaj bilgisi.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

- **Gürcistan'a Kiremit İhracatı** (`meslek-k07-gurcistan-a-kiremit-ihracati`, e-Fatura (İhracat), yerleşim *kurumsal*): Batum'daki yapı market zincirine kiremit ihracatı; GTİP 6905.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (FCA), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz USD + PricingExchangeRate.

### K.08 İnşaat Malzemeleri Ticareti

NACE: 461301 İnşaat Malzemesi Toptan Satışı İle İlgili Aracıların Faaliyetleri (İnşaat Demiri Ve Kerestesi Hariç); 468301 Çimento, Alçı, Harç, Kireç, Mozaik Vb. İnşaat Malzemeleri Toptan Ticareti; 468305 Banyo Küvetleri, Lavabolar, Eviyeler, Klozet Kapakları, Tuvalet Taşı Ve Rezervuarları İle Seramikten Karo Ve Fayans Vb. Sıhhi Ürünlerin Toptan Ticareti; 468308 Taş, Kum, Çakıl, Mıcır, Kil, Kaolin Vb. İnşaat Malzemeleri Toptan Ticareti; 468310 Tuğla, Kiremit, Briket, Kaldırım Taşı Vb. İnşaat Malzemeleri Toptan Ticareti; 468315 İnşaatlarda İzolasyon Amaçlı Kullanılan Malzemelerin Toptan Ticareti; 468317 Alçı Ve Alçı Esaslı Bileşenlerden İnşaat Amaçlı Ürünlerin Toptan Ticareti; 468318 Duvar Kağıdı, Tekstil Duvar Kaplamaları, Plastikten Zemin, Duvar Veya Tavan Kaplamalarının Toptan Ticareti … (+9 kod)

**Belge seçimi:** İnşaat malzemesi bayisi müteahhitlere e-Fatura, tadilat yapan bireylere e-Arşiv düzenler; şantiyeye teslimler e-İrsaliye ile (plaka, şoför) yapılır. İnşaat demiri satıyorsa IDIS profili ve 627 tevkifatı uygulanır.

- **Müteahhide Çimento ve Agrega Faturası** (`meslek-k08-muteahhide-cimento-ve-agrega-faturasi`, e-Fatura, yerleşim *endustri*): Konut şantiyesine çimento, kum ve gazbeton satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Şantiyeye Malzeme Sevk İrsaliyesi** (`meslek-k08-santiyeye-malzeme-sevk-irsaliyesi`, e-İrsaliye, yerleşim *defter*): Çimento ve kumun kamyonla şantiyeye sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

- **Bireysel Tadilat Malzemesi e-Arşiv** (`meslek-k08-bireysel-tadilat-malzemesi-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Ev tadilatı yapan müşteriye alçı, seramik yapıştırıcı ve taşyünü.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### K.09 İnşaatçılık

NACE: 081104 Süsleme Ve Yapı Taşlarının Kırılması Ve Kabaca Kesilmesi; 237001 Taş Ve Mermerin Kesilmesi, Şekil Verilmesi Ve Bitirilmesi (Doğal Taşlardan, Mermerden, Su Mermerinden, Travertenden, Kayağantaşından Levha/Tabaka, Kurna, Lavabo, Karo, Kaldırım Taşı, Yapı Taşı, Mezar Taşı, Vb. İmalatı Dahil, Süs Eşyası Hariç); 381102 İnşaat Ve Yıkım Atıklarının, Çalı, Çırpı, Moloz Gibi Enkazların Toplanması Ve Kaldırılması; 410001 İkamet Amaçlı Binaların İnşaatı (Ahşap Binaların İnşaatı Hariç); 410002 İkamet Amaçlı Olmayan Binaların İnşaatı; 410003 Mevcut İkamet Amaçlı Olan Veya İkamet Amaçlı Olmayan Binaların Yeniden Düzenlenmesi Veya Yenilenmesi (Büyük Çaplı Revizyon) (Tarihi Yapıların Restorasyonu Hariç); 410004 İkamet Amaçlı Ahşap Binaların İnşaatı; 421102 Yol Yüzeylerinin Asfaltlanması Ve Onarımı, Kaldırım, Kasis, Bisiklet Yolu Vb.lerin İnşaatı … (+24 kod)

**Belge seçimi:** Yapım işlerinde hakediş faturaları belirlenmiş alıcılara (A.Ş., kamu) 601 kodlu 4/10 KDV tevkifatı ile; kamu idarelerine KAMU senaryosu + IBAN ile düzenlenir (hakediş no, sözleşme, ihale kayıt no). Bireysel tadilat işleri e-Arşiv ile faturalanır.

- **Konut Projesi Hakediş Faturası (Tevkifat 601)** (`meslek-k09-konut-projesi-hakedis-faturasi-tevkifat-601`, e-Fatura, yerleşim *endustri*): İşveren A.Ş.'ye kaba inşaat ara hakedişi; 4/10 tevkifat, hakediş dönemi.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 601, Percent 40 (4/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Okul Binası Kamu Hakedişi (KAMU · 601)** (`meslek-k09-okul-binasi-kamu-hakedisi-kamu-601`, e-Fatura, yerleşim *kurumsal*): İl milli eğitim müdürlüğüne okul yapımı hakedişi; KAMU senaryosu + 601 tevkifat.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 601, Percent 40 (4/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Bireysel Daire Tadilatı e-Arşiv** (`meslek-k09-bireysel-daire-tadilati-e-arsiv`, e-Arşiv Fatura, yerleşim *kart*): Daire sahibine banyo-mutfak yenileme işçilik ve malzeme bedeli.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### K.10 Mermer, Taş, Kum Ocakçılığı

NACE: 081101 Mermer Ocakçılığı (Traverten Dahil); 081102 Granit Ocakçılığı; 081103 Yapı Taşları Ocakçılığı; 081105 Dolomit Ve Kayağan Taşı (Arduvaz / Kayraktaşı) Ocakçılığı; 081106 Kireçtaşı (Kalker) Ocakçılığı (Kireçtaşının Kabaca Kırılması Ve Parçalanması Dahil); 081107 Tebeşir, Alçıtaşı Ve Anhidrit Ocakçılığı (Çıkarma, Parçalama, Pişirme İşlemi Dahil); 081201 Çakıl Ve Kum Ocakçılığı (Taşların Kırılması İle Kil Ve Kaolin Madenciliği Hariç); 081202 Çakıl Taşlarının Kırılması Ve Parçalanması … (+4 kod)

**Belge seçimi:** Mermer ocağı blok ve plaka ihracatını IHRACAT profilli e-Fatura ile (GTİP 2515 blok / 6802 işlenmiş) yapar; yurt içi satışlar e-Fatura, ocaktan kamyonla sevkiyatlar e-İrsaliye (tonaj, plaka) ile belgelenir. Maden ruhsat no belgeye eklenir.

- **Blok Mermer ve Plaka İhracatı** (`meslek-k10-blok-mermer-ve-plaka-ihracati`, e-Fatura (İhracat), yerleşim *kurumsal*): Dubai'deki ithalatçıya blok mermer ve cilalı plaka; GTİP 2515 / 6802, konteynerle.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (FOB), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz USD + PricingExchangeRate.

- **Müteahhide Mermer Plaka Faturası** (`meslek-k10-muteahhide-mermer-plaka-faturasi`, e-Fatura, yerleşim *teknik*): Otel projesine ebatlı mermer plaka ve basamak satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Ocaktan Kum-Çakıl Sevk İrsaliyesi** (`meslek-k10-ocaktan-kum-cakil-sevk-irsaliyesi`, e-İrsaliye, yerleşim *endustri*): Kırma taş ve kumun kamyonla hazır beton tesisine sevki; kantar fişi.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

### K.11 Prefabrik Yapıların İmalatı, Kurulumu, Ticareti

NACE: 162302 Ahşap Prefabrik Yapılar Ve Ahşap Taşınabilir Evlerin İmalatı; 222405 Plastikten Prefabrik Yapıların İmalatı; 236103 Betondan Yapılmış Prefabrik Yapıların İmalatı; 410005 Prefabrik Binalar İçin Bileşenlerin Alanda Birleştirilmesi Ve Kurulması; 435004 Prefabrik Yüzme Havuzlarının Kurulumu; 435006 Prefabrik Yapıların Montajı Ve Kurulması (Prefabrik Binalar Ve Yüzme Havuzları Hariç Her Çeşit Prefabrik Sokak Düzeneklerinin (Otobüs Durağı, Telefon Kulübesi, Bank Vb.) Kurulumu Vb.); 468316 Betondan, Çimentodan Ve Suni Taştan Prefabrik Yapıların, Yapı Elemanlarının Ve Diğer Ürünlerin Toptan Ticareti; 468321 Plastikten Prefabrik Yapılar Ve Yapı Elemanlarının Toptan Ticareti … (+2 kod)

**Belge seçimi:** Prefabrik üreticisi konteyner / modül satışını mal teslimi olarak e-Fatura ile, yerinde kurulumlu yapı işlerini yapım işi olarak 601 kodlu 4/10 tevkifatlı e-Fatura ile faturalar; yurt dışı şantiye kampları IHRACAT profiliyle ihraç edilir.

- **Şantiye Konteyneri Satış Faturası** (`meslek-k11-santiye-konteyneri-satis-faturasi`, e-Fatura, yerleşim *teknik*): İnşaat firmasına yaşam ve ofis konteyneri satışı (mal teslimi).
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **Prefabrik Okul Kurulumu (Tevkifat 601)** (`meslek-k11-prefabrik-okul-kurulumu-tevkifat-601`, e-Fatura, yerleşim *endustri*): Özel eğitim kurumu için yerinde kurulumlu prefabrik bina yapım işi; 4/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 601, Percent 40 (4/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Irak Şantiye Kampı İhracatı** (`meslek-k11-irak-santiye-kampi-ihracati`, e-Fatura (İhracat), yerleşim *kurumsal*): Irak'taki şantiye için demonte prefabrik kamp binaları; GTİP 9406.
  - ProfileID IHRACAT + InvoiceTypeCode ISTISNA (301). AccountingCustomerParty = Gümrükler Genel Müdürlüğü (VKN 1460415308); gerçek alıcı BuyerCustomerParty (PARTYTYPE=EXPORT). Satırda Delivery: DeliveryTerms INCOTERMS (DAP), GoodsItem/RequiredCustomsID (12 haneli GTİP), ShipmentStage/TransportModeCode, ActualPackage (kap). Döviz USD + PricingExchangeRate.

### K.12 Pvc Ürün İmalatı

NACE: 222308 Plastikten Kapı Ve Pencere İmalatı

**Belge seçimi:** PVC ürün imalatçısı bayilere ve müteahhitlere e-Fatura, fabrikadan sevkiyatta e-İrsaliye düzenler; ölçüye özel pencere satışlarında ev müşterisine montajlı e-Arşiv kesilir.

- **Bayiye PVC Profil Faturası** (`meslek-k12-bayiye-pvc-profil-faturasi`, e-Fatura, yerleşim *endustri*): PVC doğrama atölyesine profil, takviye sacı ve conta satışı.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

- **PVC Profil Sevk İrsaliyesi** (`meslek-k12-pvc-profil-sevk-irsaliyesi`, e-İrsaliye, yerleşim *endustri*): Profillerin dorseli tırla bayiye sevki.
  - DespatchAdvice · TR1.2.1 · TEMELIRSALIYE · SEVK: DespatchSupplierParty / DeliveryCustomerParty; Shipment altında plaka (LicensePlateID schemeID PLAKA), şoför (DriverPerson + TCKN), fiili sevk tarihi/saati, teslim adresi; satırda DeliveredQuantity.

- **Eve Ölçülü PVC Pencere e-Arşiv** (`meslek-k12-eve-olculu-pvc-pencere-e-arsiv`, e-Arşiv Fatura, yerleşim *pastel*): Ev müşterisine ölçülü ısıcamlı PVC pencere ve montaj.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

### K.13 Pvc Ürün Ticareti

NACE: 468311 Plastik Kapı, Pencere Ve Bunların Kasaları İle Kapı Eşikleri, Panjurlar, Jaluziler, Storlar Vb. Eşyaların Toptan Ticareti; 475209 Plastik Kapı, Pencere Ve Bunların Kasaları İle Kapı Eşikleri, Panjurlar, Jaluziler, Storlar Ve Benzeri Eşyaların Perakende Ticareti (Pvc Olanlar Dahil)

**Belge seçimi:** PVC ürün satıcısı ev müşterilerine montaj dahil e-Arşiv, site yönetimi / müteahhitlere e-Fatura düzenler; ölçü ve renk bilgisi satırda verilir.

- **Pencere ve Sineklik Montajı e-Arşiv** (`meslek-k13-pencere-ve-sineklik-montaji-e-arsiv`, e-Arşiv Fatura, yerleşim *fis*): Daireye PVC pencere, plise sineklik ve jaluzi montajı.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Site Yönetimine Toplu Kapı Değişimi** (`meslek-k13-site-yonetimine-toplu-kapi-degisimi`, e-Fatura, yerleşim *kurumsal*): Site blok giriş kapılarının PVC kapıyla değiştirilmesi.
  - ProfileID TICARIFATURA, InvoiceTypeCode SATIS; alıcı e-Fatura mükellefi (GİB adres defterinde kayıtlı etiket).

### K.14 Sıhhi Tesisatçılık

NACE: 432203 Bina Ve Diğer İnşaat Projelerinde Su Ve Kanalizasyon Tesisatı Ve Onarımı; 432205 Gaz Tesisatı Faaliyetleri (Hastanelerdeki Oksijen Gazı Temini İçin Kurulum İşleri Dahil)

**Belge seçimi:** Sıhhi tesisatçı ev müşterilerine e-Arşiv düzenler; müteahhide alt yüklenici olarak yaptığı bina tesisat işleri yapım işi sayıldığından belirlenmiş alıcılara 601 kodlu 4/10 tevkifatlı e-Fatura kesilir. Doğalgaz proje / onay numarası belgeye eklenir.

- **Kombi ve Doğalgaz Tesisatı e-Arşiv** (`meslek-k14-kombi-ve-dogalgaz-tesisati-e-arsiv`, e-Arşiv Fatura, yerleşim *serit*): Daireye doğalgaz iç tesisatı, kombi ve petek montajı; proje onay no belgede.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Müteahhide Bina Tesisat İşi (Tevkifat 601)** (`meslek-k14-muteahhide-bina-tesisat-isi-tevkifat-601`, e-Fatura, yerleşim *endustri*): Konut projesinin sıhhi tesisat alt yüklenici hakedişi; 4/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 601, Percent 40 (4/10). Ödenecek = KDV dahil − tevkif edilen KDV.

### K.15 Sondajcılık

NACE: 422102 Su Kuyusu Açma Ve Septik Sistem Kurulum Faaliyetleri (Kuyu, Artezyen Vb.); 431301 Test Sondajı Ve Delme (Madencilikle Bağlantılı Olarak Gerçekleştirilen Test Sondajı Hariç)

**Belge seçimi:** Sondaj firması çiftçiye su kuyusu açımını e-Arşiv ile, DSİ / belediye gibi kamu idarelerine yapım işi niteliğindeki sondajı KAMU senaryolu 601 tevkifatlı e-Fatura ile faturalar. Zemin etüdü amaçlı sondaj "etüt, plan-proje" hizmeti olduğundan 602 (9/10) tevkifat uygulanır.

- **Çiftçiye Su Kuyusu Açımı e-Arşiv** (`meslek-k15-ciftciye-su-kuyusu-acimi-e-arsiv`, e-Arşiv Fatura, yerleşim *defter*): Tarla sulaması için metre bazlı su kuyusu sondajı ve muhafaza borusu.
  - ProfileID EARSIVFATURA · InvoiceTypeCode SATIS.
  - Alıcı gerçek kişi: AccountingCustomerParty TCKN + Person (ad/soyad).

- **Belediye İçme Suyu Kuyusu (KAMU · 601)** (`meslek-k15-belediye-icme-suyu-kuyusu-kamu-601`, e-Fatura, yerleşim *kurumsal*): Belediyeye içme suyu sondaj kuyusu yapım işi; KAMU + 601 tevkifat.
  - KAMU senaryosu: kamu idaresi alıcı; PaymentMeans/PayeeFinancialAccount (IBAN) zorunlu.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 601, Percent 40 (4/10). Ödenecek = KDV dahil − tevkif edilen KDV.

- **Zemin Etüt Sondajı (Tevkifat 602)** (`meslek-k15-zemin-etut-sondaji-tevkifat-602`, e-Fatura, yerleşim *teknik*): İnşaat firmasına zemin etüdü amaçlı karotlu sondaj ve rapor; 9/10 tevkifat.
  - InvoiceTypeCode TEVKIFAT; belge ve satır düzeyinde WithholdingTaxTotal → TaxTypeCode 602, Percent 90 (9/10). Ödenecek = KDV dahil − tevkif edilen KDV.
