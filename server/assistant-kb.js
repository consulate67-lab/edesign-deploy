/**
 * Asistanın yerleşik bilgi bankası. Yönetim panelinden eklenen kayıtlar bunlara eklenir.
 * actions: önyüzde düğmeye dönüşen kısa kodlar (register, login, pricing, docs, faq, product, contact).
 */
const tl = (n) => `${Number(n).toLocaleString('tr-TR')} TL`;

export const buildSeedKb = (packages) => {
    const list = Object.values(packages);
    const paketler = list.map((p) => `- **${p.name}:** ${tl(p.price)} · ${p.credits} tasarım hakkı (tasarım başına ${tl(Math.round(p.price / p.credits))})`).join('\n');
    const enUcuz = list.reduce((a, b) => (Number(a.price) <= Number(b.price) ? a : b));

    return [
        {
            id: 's-nedir',
            q: 'Bu site ne işe yarar? eBelge Tasarımcı nedir?',
            keywords: 'site nedir ne ise yarar amac hizmet urun platform edxdocu ebelge tasarimci xslt gorunum',
            a: 'eBelge Tasarımcı, GİB uyumlu e-belgelerinizin (e-Fatura, e-Arşiv, e-İrsaliye ve 12 tür daha) **görünüm dosyasını (XSLT)** hazırlamanızı sağlar.\n- Hazır şablon seçer ya da kendi XSLT dosyanızı yüklersiniz.\n- Logo, kaşe, banka bilgisi ve alanları görsel editörde sürükle-bırak ile düzenlersiniz.\n- Kendi XML örneğinizle önizler, beğenince XSLT dosyasını indirip entegratörünüze yüklersiniz.',
            actions: ['register', 'product'],
        },
        {
            id: 's-baslangic',
            q: 'Nasıl başlarım? İlk tasarımı nasıl yaparım?',
            keywords: 'nasil baslarim ilk tasarim adim adim kullanim rehber basla yeni tasarim olustur',
            a: 'Üç adımda başlayabilirsiniz:\n- **Hesap açın** ve giriş yapın.\n- Seçim ekranındaki sihirbazda **1. Belge türü**, **2. Tasarım (XSLT)**, **3. Veri (XML)** adımlarını izleyin ya da "Sektörünüze Hazır Şablonlar" bölümünden bir şablon seçin.\n- Tasarım ekranında düzenleyin, **Kaydet** ile kaydedin, **Test İndir (ücretsiz)** ile kendi sisteminizde deneyin; memnunsanız **Onayla (1 hak)** ile son dosyayı indirin.',
            actions: ['register', 'login'],
        },
        {
            id: 's-fiyat',
            q: 'Fiyatlar nedir? Paketler ne kadar?',
            keywords: 'fiyat ucret paket ne kadar kac para tl one basic pro abonelik ucretli',
            a: `Tek seferlik ödeme, abonelik yok. Haklar süresizdir:\n${paketler}\n\nFiyatlara KDV dahildir. Tüm paketlerde tüm belge türleri, hazır şablonlar ve XSLT indirme vardır.`,
            actions: ['pricing', 'register'],
        },
        {
            id: 's-hak',
            q: 'Tasarım hakkı ne zaman harcanır? Kaydetmek hak harcar mı?',
            keywords: 'hak kredi harcanir dusulur kaydet onay onayla ne zaman kullanilir tasarim hakki',
            a: 'Tasarım hakkı yalnızca **Onayla** adımında, tasarım başına bir kez harcanır.\n- **Kaydet:** ücretsiz, istediğiniz kadar.\n- **Test İndir:** ücretsiz (dosyada büyük TEST yazısı bulunur).\n- **Onayla (1 hak):** tasarım kilitlenir ve TEST yazısız son dosya iner.\n- Onaylanmış tasarımı "Tamamlanan Tasarımlar" listesinden **ücretsiz** tekrar indirebilirsiniz.',
            actions: ['pricing'],
        },
        {
            id: 's-ucretsiz',
            q: 'Ücretsiz deneme var mı? Bedava kullanabilir miyim?',
            keywords: 'ucretsiz bedava deneme free trial demo para odemeden deneyebilir miyim',
            a: 'Üyelik ücretsizdir ve hak satın almadan da çok şey yapabilirsiniz:\n- Tüm şablonları ve editörü kullanıp tasarım yapabilir, kaydedebilirsiniz.\n- **Test İndir** ile dosyayı ücretsiz indirip kendi sisteminizde deneyebilirsiniz (sayfa ortasında TEST yazısı olur).\n\nTEST yazısız son dosya için **Onayla** adımında 1 tasarım hakkı gerekir. Yeni hesaplar 0 hakla başlar.',
            actions: ['register', 'pricing'],
        },
        {
            id: 's-test',
            q: 'Test İndir nedir? Neden TEST yazıyor?',
            keywords: 'test indir test yazisi filigran watermark deneme dosyasi ortada test',
            a: '**Test İndir (ücretsiz)**, tasarımınızı kendi entegratörünüzde veya programınızda denemeniz için dosyayı sayfa ortasında büyük, çapraz bir **TEST** yazısıyla indirir.\n- Hak harcamaz, istediğiniz kadar indirebilirsiniz.\n- TEST dosyasını sihirbazda tekrar yüklerseniz yazı otomatik kaldırılır ve tasarıma kaldığınız yerden devam edersiniz.\n- TEST yazısız son dosya için **Onayla (1 hak)** kullanın.',
            actions: [],
        },
        {
            id: 's-onay',
            q: 'Onayladıktan sonra tasarımı değiştirebilir miyim?',
            keywords: 'onay sonrasi degistir duzenle kilit kilitlenir onaylanan tasarim tekrar duzenleme',
            a: 'Onaylanan tasarım **kilitlenir**, artık düzenlenemez; yalnızca indirilebilir.\n- "Tamamlanan Tasarımlar" listesinden **Önizle** ve **İndir** ile ücretsiz tekrar indirebilirsiniz.\n- Değişiklik gerekiyorsa yeni bir tasarım başlatmanız gerekir (onayda yeniden 1 hak kullanılır).\n\nBu yüzden onaydan önce **Test İndir** ile denemenizi öneririm.',
            actions: [],
        },
        {
            id: 's-belgeler',
            q: 'Hangi belge türlerini tasarlayabilirim?',
            keywords: 'hangi belge turleri desteklenen e-fatura e-arsiv e-irsaliye e-smm e-mustahsil e-dekont e-bilet e-makbuz liste tur',
            a: 'Toplam 15 belge türü desteklenir:\n- e-Fatura, e-Arşiv, e-İrsaliye, e-İrsaliye Yanıtı, e-İhracat\n- e-SMM, e-Müstahsil, e-Gider Pusulası, e-Döviz / Kıymetli Maden\n- e-Dekont, e-Sigorta Komisyon Gider Belgesi\n- e-Bilet, e-Bilet Raporu, e-Yolcu Listesi, e-Makbuz\n\nÇoğu türde GİB resmi şablonu ve sektörlere göre hazır şablonlar bulunur.',
            actions: ['docs'],
        },
        {
            id: 's-xslt',
            q: 'XSLT bilmem gerekiyor mu? XSLT nedir?',
            keywords: 'xslt nedir bilmem gerekir kod yazmam gerekir mi teknik bilgi yazilim',
            a: 'Hayır, XSLT bilmeniz gerekmez. XSLT, e-belge XML verisinin ekranda ve çıktıda nasıl görüneceğini belirleyen tasarım dosyasıdır.\n- Hazır bir şablon seçip görsel editörde **sürükle-bırak** ile düzenlersiniz.\n- İsterseniz kendi XSLT dosyanızı (.xslt / .xsl, en fazla 5 MB) sihirbazın 2. adımında **Kendi XSLT dosyamı kullan** ile yükleyebilirsiniz.',
            actions: ['product'],
        },
        {
            id: 's-xml',
            q: 'Kendi XML dosyamla önizleme yapabilir miyim?',
            keywords: 'xml yukle kendi xml ornek veri onizleme gib ornek belge veri secimi',
            a: 'Evet. Sihirbazın **3. Veri (XML)** adımında üç seçenek vardır:\n- **Varsayılan örnek XML**\n- **GİB resmi örnek belgeler**\n- **Kendi XML dosyamı seç** (.xml, en fazla 5 MB)\n\nXML yalnızca önizleme içindir; tasarım her veriyle çalışır. Yüklediğiniz dosya için otomatik **uygunluk kontrolü** yapılır.',
            actions: [],
        },
        {
            id: 's-kendi-xslt',
            q: 'Elimdeki mevcut XSLT tasarımını yükleyip düzenleyebilir miyim?',
            keywords: 'mevcut xslt yukle elimdeki tasarim duzenle entegrator xslt dosyasi import',
            a: 'Evet. Giriş yaptıktan sonra sihirbazda belge türünü seçin, **2. Tasarım (XSLT)** adımında **Kendi XSLT dosyamı kullan** deyip dosyanızı seçin veya sürükleyin. Dosya kontrol edilir, ardından tasarım ekranında görsel olarak düzenleyebilirsiniz.\n\nNot: Daha önce onaylanmış (satın alınmış) bir tasarım dosyası tekrar düzenlemeye açılmaz; onu "Tamamlanan Tasarımlar"dan indirebilirsiniz.',
            actions: ['login'],
        },
        {
            id: 's-logo',
            q: 'Logo, kaşe veya imza nasıl eklenir?',
            keywords: 'logo kase imza resim ekle gorsel png muhur antet',
            a: 'Tasarım ekranında üstteki **Ekle** çubuğundan **Resim**\'i seçin (tıklayın ya da önizlemede istediğiniz yere sürükleyin), ardından **Resim Seç** ile logonuzu, kaşenizi veya imzanızı yükleyin. Resim dosyanın içine gömülür, ayrıca bir yere yüklemeniz gerekmez. Boyut ve konumu sağdaki panelden ayarlayabilirsiniz.',
            actions: [],
        },
        {
            id: 's-banka',
            q: 'Banka / IBAN bilgisi nasıl eklenir?',
            keywords: 'banka iban hesap bilgisi odeme bilgisi sube ekle',
            a: 'Tasarım ekranındaki **Tüm Belge Alanları** listesinde "IBAN", "Banka / Şube" gibi ödeme alanları vardır; arama kutusuna "IBAN" yazıp alanı tıklayın veya önizlemeye sürükleyin. Değerler XML\'deki ödeme bilgisinden otomatik gelir. Sabit bir banka bilgisi yazmak isterseniz **Metin** öğesi de ekleyebilirsiniz.',
            actions: [],
        },
        {
            id: 's-karekod',
            q: 'Karekod (QR) ekleyebilir miyim?',
            keywords: 'karekod qr kod barkod gib karekod standardi',
            a: 'Evet. **Ekle** çubuğundaki **Karekod** öğesi GİB Karekod Standardı içeriğini belgeden otomatik üretir. GİB\'e göre karekod belgenin sağ üst köşesinde yer almalıdır.',
            actions: [],
        },
        {
            id: 's-editor',
            q: 'Tasarım ekranında neler yapabilirim?',
            keywords: 'editor tasarim ekrani ozellikler surukle birak tablo kolon metin formul geri al zoom',
            a: 'Tasarım ekranında:\n- **Ekle** çubuğu: Metin, Resim, Tablo, Formül, Kutu, Karekod, Kolon, Arka Plan\n- **Tüm Belge Alanları**: XML\'deki her alanı arayıp tıklayarak veya sürükleyerek ekleme\n- Yazı tipi, renk, boşluk ve kenarlık ayarları; tablo kolonu gizleme / silme\n- **Geri Al (Ctrl+Z)** / **İleri Al (Ctrl+Y)**, yakınlaştırma ve genişliğe sığdırma\n- **Kaydet**, **Test İndir (ücretsiz)**, **Onayla (1 hak)**',
            actions: [],
        },
        {
            id: 's-sablon',
            q: 'Hazır şablonlar var mı? Sektörüme uygun şablon nasıl bulurum?',
            keywords: 'hazir sablon galeri sektor sektorel ornek tasarim template sablonlar',
            a: 'Evet. Giriş yaptıktan sonra seçim ekranındaki **Sektörünüze Hazır Şablonlar** bölümü size birkaç soru sorar: belge türü, firma alanınız, logo ve banka/IBAN bilgisi. Yanıtlarınıza uygun şablonlar listelenir; ayrıca arama yapıp fatura tipine ve firma kategorisine göre filtreleyebilirsiniz. Şablonu önizleyip tek tıkla tasarım ekranında açar, kendi bilgilerinize göre düzenlersiniz. Ayrıca her belge türü için GİB resmi şablonu da vardır.',
            actions: ['register'],
        },
        {
            id: 's-sablon-logo',
            q: 'Hazır şablonları kendi logomla görebilir miyim? Banka bilgisi olmayan şablon var mı?',
            keywords: 'hazir sablon logo logomu yukle onizleme banka iban olmasin olsun soru sorular tercih logosuz',
            a: '**Sektörünüze Hazır Şablonlar** bölümündeki sorularda logonuzu yükleyebilirsiniz; tüm şablon önizlemeleri ve açtığınız tasarım logonuzla gelir. **Örnek logo kalsın** ya da **Logo kullanmayacağım** da seçebilirsiniz.\n- Banka sorusunda **Evet** derseniz yalnızca banka/IBAN bölümü olan şablonlar listelenir; **Hayır** derseniz banka bölümü şablonlardan kaldırılır.\n- Tercihlerinizi listenin üstündeki **Logoyu değiştir** ve **Soruları yeniden yanıtla** düğmeleriyle değiştirebilirsiniz.',
            actions: ['register'],
        },
        {
            id: 's-gib',
            q: 'Tasarımlar GİB uyumlu mu?',
            keywords: 'gib uyumlu ubl-tr resmi standart mevzuat gecerli uyum e-fatura paketi',
            a: 'Şablonlar GİB UBL-TR 1.2.1 yapısına göre hazırlanır ve GİB\'in yayımladığı örnek XML\'lerle denenir. Sihirbaz yüklediğiniz dosyalarda belge türü, profil ve tutar tutarlılığı gibi kontrolleri yapıp uyarı verir.\n\nYine de son dosyayı entegratörünüzde **Test İndir** ile denemenizi öneririz; zorunlu alanların görünür kalmasından kullanıcı sorumludur.',
            actions: [],
        },
        {
            id: 's-entegrator',
            q: 'İndirdiğim XSLT dosyasını nereye yüklerim?',
            keywords: 'entegrator yukle nereye kullan portal gib portal ozel entegrator xslt dosyasi kullanma',
            a: 'İndirdiğiniz .xslt dosyasını e-belge gönderdiğiniz **özel entegratörün** veya muhasebe/ERP programınızın "fatura görünümü / XSLT şablonu" ayarına yüklersiniz. Entegratör bu dosyayı belgenin içine gömer ve alıcı belgeyi sizin tasarımınızla görür. Önce **Test İndir** dosyasıyla denemeniz önerilir.',
            actions: [],
        },
        {
            id: 's-satin',
            q: 'Nasıl satın alırım? Ödeme nasıl yapılır?',
            keywords: 'satin al odeme kredi karti iyzico 3d secure taksit paket al nasil oderim',
            a: `Önce üye olup giriş yapın, sonra seçim ekranının sağ üstündeki **Paket Al** düğmesine tıklayın.\n- Paketinizi seçip **Satın Al** deyin; ödeme **iyzico 3D Secure** ile yapılır, kart bilgileriniz sunucumuza ulaşmaz.\n- Ödeme başarılı olunca haklar hesabınıza otomatik yüklenir.\n\nPaketler ${tl(enUcuz.price)}'den başlar.`,
            actions: ['pricing', 'login'],
        },
        {
            id: 's-iade',
            q: 'İade var mı? Kalan haklarım ne olur?',
            keywords: 'iade geri odeme iptal kalan hak sure dolar mi hak devri',
            a: 'Haklar **süresizdir**, kullanana kadar hesabınızda kalır. Kullanıcı sözleşmesine göre satın alınan haklar iade edilmez ve başka hesaplara aktarılamaz. Ödeme sorunu yaşadıysanız destek ekibine yazın.',
            actions: ['contact'],
        },
        {
            id: 's-fatura-ödeme',
            q: 'Ödeme başarısız oldu, ne yapmalıyım?',
            keywords: 'odeme basarisiz hata kart reddedildi cekim yapildi hak yuklenmedi',
            a: 'Kartınızdan çekim yapılmadıysa tekrar deneyebilirsiniz; 3D Secure şifresinin doğru girildiğinden ve kartınızın internet alışverişine açık olduğundan emin olun. Çekim yapıldığı hâlde hak yüklenmediyse giriş yaptıktan sonra sağ alttaki **Destek** düğmesinden talep açın veya bize yazın.',
            actions: ['contact'],
        },
        {
            id: 's-uyelik',
            q: 'Nasıl üye olurum? Kayıt için ne gerekir?',
            keywords: 'uye ol kayit hesap ac uyelik kaydol register bilgiler',
            a: '**Hesap aç** düğmesiyle kayıt formunu açın: Ad Soyad, Firma Adı, E-posta ve Şifre zorunlu; Telefon isteğe bağlıdır. **Hesabı Oluştur** dedikten sonra otomatik giriş yapılır. Üyelik ücretsizdir.',
            actions: ['register'],
        },
        {
            id: 's-sifre',
            q: 'Şifremi unuttum, ne yapmalıyım?',
            keywords: 'sifre unuttum sifremi sifirla parola giris yapamiyorum hesaba giremiyorum',
            a: 'Şu an otomatik şifre sıfırlama yok. Kayıtlı e-posta adresinizle birlikte destek ekibine yazın; hesabınızı doğruladıktan sonra şifrenizi sıfırlarız.',
            actions: ['contact'],
        },
        {
            id: 's-giris',
            q: 'Giriş yapamıyorum',
            keywords: 'giris yapamiyorum login hata kullanici bulunamadi sifre hatali oturum',
            a: 'Lütfen şunları kontrol edin:\n- E-posta adresini kayıt olduğunuz şekliyle yazdığınızdan emin olun.\n- "Kullanıcı bulunamadı" uyarısı alıyorsanız önce **Hesap aç** ile kayıt olun.\n- "Şifre hatalı" diyorsa büyük/küçük harf ve klavye dilini kontrol edin.\n\nSorun sürerse bize yazın.',
            actions: ['login', 'contact'],
        },
        {
            id: 's-tasarimlarim',
            q: 'Kaydettiğim tasarımlar nerede?',
            keywords: 'tasarimlarim kaydettigim nerede devam eden tamamlanan taslak liste bulamiyorum',
            a: 'Giriş yaptıktan sonra seçim ekranında:\n- **Devam Eden Tasarımlar:** kaydettiğiniz taslaklar; **Devam et** ile açarsınız.\n- **Tamamlanan Tasarımlar:** onayladıklarınız; **Önizle** ve **İndir** (ücretsiz) ile tekrar indirirsiniz.',
            actions: ['login'],
        },
        {
            id: 's-destek',
            q: 'Destek ekibine nasıl ulaşırım?',
            keywords: 'destek iletisim ulas telefon whatsapp mail e-posta yardim canli destek musteri hizmetleri',
            a: 'Üye girişi yaptıysanız sağ alttaki **Destek** düğmesinden **Yeni talep** açabilir veya **Online destek iste** ile ekranınızı onayınızla paylaşarak canlı yardım alabilirsiniz. Giriş yapmadan da sayfanın altındaki **İletişim** bağlantısından WhatsApp ile bize yazabilirsiniz.',
            actions: ['contact', 'login'],
        },
        {
            id: 's-online',
            q: 'Online destek (ekran paylaşımı) nasıl çalışır?',
            keywords: 'online destek ekran paylasimi uzaktan baglanti canli yardim cobrowse',
            a: 'Giriş yaptıktan sonra **Destek** düğmesinden **Online destek iste** deyin ve onay verin. Destek ekibi ekranınızı canlı görebilir ve sizin adınıza tıklayıp yazabilir; şifre alanları gizlenir. Bağlantıyı sayfanın üstündeki kırmızı çubuktan istediğiniz an bitirebilirsiniz.',
            actions: ['login'],
        },
        {
            id: 's-kvkk',
            q: 'Verilerim güvende mi? Nerede saklanıyor?',
            keywords: 'veri guvenlik kvkk gizlilik saklama sunucu kisisel veri',
            a: 'Kullanıcı ve tasarım verileriniz KVKK kapsamında PostgreSQL veritabanında saklanır; ödemelerde kart bilgileriniz sunucumuza ulaşmaz (iyzico 3D Secure). Ayrıntılar sayfanın altındaki **KVKK** ve **Çerez Politikası** metinlerindedir.',
            actions: ['faq'],
        },
        {
            id: 's-irsaliye-yanit',
            q: 'e-İrsaliye yanıtı tasarımında eksik / fazla / red satırları gösterilir mi?',
            keywords: 'irsaliye yaniti eksik fazla red kabul teslim receiptadvice mal kabul',
            a: 'Evet. e-İrsaliye Yanıtı için hazır şablonlar (Depo Mal Kabul, Mağaza Teslim Alma, Hammadde Giriş Kontrol) her satırda irsaliyedeki, teslim alınan, **eksik**, **fazla**, **reddedilen** ve kabul edilen miktarları ayrı renklerle ve red nedenleriyle gösterir.',
            actions: ['docs'],
        },
        {
            id: 's-mobil',
            q: 'Telefondan veya tabletten kullanabilir miyim?',
            keywords: 'mobil telefon tablet uygulama indir program kurulum tarayici',
            a: 'Site tarayıcıda çalışır, kurulum gerekmez. Tanıtım ve hesap işlemleri telefonda da rahatça yapılır; tasarım ekranı ise geniş ekran gerektirdiği için bilgisayarda kullanmanızı öneririz.',
            actions: [],
        },
    ];
};

export const SUGGESTIONS = [
    'Bu site ne işe yarar?',
    'Fiyatlar nedir?',
    'İlk tasarımı nasıl yaparım?',
    'Tasarım hakkı ne zaman harcanır?',
    'XSLT bilmem gerekir mi?',
    'Hangi belgeler destekleniyor?',
];
