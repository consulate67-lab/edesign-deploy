// Otomatik üretildi: node scripts/gen-meslek-templates.mjs — elle düzenlemeyin.

export interface MeslekGroup {
    id: string;
    label: string;
    items: { code: string; name: string }[];
}

/** Esnaf ve sanatkâr meslek grupları (meslek-nace.pro sınıflaması). */
export const MESLEK_GROUPS: MeslekGroup[] = [
    {
        id: 'A',
        label: 'Ağaç İşleri',
        items: [
            {
                code: 'A.01',
                name: 'İkinci El Eşya Ticareti'
            },
            {
                code: 'A.02',
                name: 'Kerestecilik'
            },
            {
                code: 'A.03',
                name: 'Marangozluk'
            },
            {
                code: 'A.04',
                name: 'Mobilya Boyacılığı'
            },
            {
                code: 'A.05',
                name: 'Mobilya Döşemeciliği'
            },
            {
                code: 'A.06',
                name: 'Mobilya İmalatı'
            },
            {
                code: 'A.07',
                name: 'Mobilya Ticareti'
            },
            {
                code: 'A.08',
                name: 'Yakacak İmalatı, Ticareti'
            }
        ]
    },
    {
        id: 'B',
        label: 'Eğlence, Dinlenme, Organizasyon',
        items: [
            {
                code: 'B.01',
                name: 'Ajans, Organizasyon Faaliyetleri'
            },
            {
                code: 'B.02',
                name: 'Düğün Salonu İşletmeciliği'
            },
            {
                code: 'B.03',
                name: 'Eğlence Yerleri İşletmeciliği'
            },
            {
                code: 'B.04',
                name: 'Gazinoculuk'
            },
            {
                code: 'B.05',
                name: 'Kahvehanecilik, Kıraathanecilik'
            },
            {
                code: 'B.06',
                name: 'Lokal İşletmeciliği'
            },
            {
                code: 'B.07',
                name: 'Otel, Pansiyon, Yurt İşletmeciliği'
            },
            {
                code: 'B.08',
                name: 'Oyun Salonu, İnternet Kafe İşletmeciliği'
            },
            {
                code: 'B.09',
                name: 'Ses, Sahne Sanatçılığı'
            },
            {
                code: 'B.10',
                name: 'Şans Oyunları Bayiliği'
            }
        ]
    },
    {
        id: 'C',
        label: 'Elektrik, Elektronik, Bilgisayar',
        items: [
            {
                code: 'C.01',
                name: 'Asansör, Yürüyen Merdiven Kurulumu, Bakımı, Onarımı'
            },
            {
                code: 'C.02',
                name: 'Beyaz Eşya Onarımı'
            },
            {
                code: 'C.03',
                name: 'Beyaz Eşya Ticareti'
            },
            {
                code: 'C.04',
                name: 'Bilgisayar Kurulumu, Onarımı, Programlama, Veri Kurtarma'
            },
            {
                code: 'C.05',
                name: 'Elektrik Makineleri İmalatı, Kurulumu, Onarımı'
            },
            {
                code: 'C.06',
                name: 'Elektrik Malzemeleri İmalatı, Ticareti'
            },
            {
                code: 'C.07',
                name: 'Elektrik Sistemleri İmalatı, Kurulumu, Onarımı'
            },
            {
                code: 'C.08',
                name: 'Elektrik Tesisatçılığı'
            },
            {
                code: 'C.09',
                name: 'Elektrikli Ev Aletleri İmalatı, Onarımı'
            },
            {
                code: 'C.10',
                name: 'Elektrikli Ev Aletleri Ticareti'
            },
            {
                code: 'C.11',
                name: 'Elektronik Ürün İmalatı, Onarımı'
            },
            {
                code: 'C.12',
                name: 'Elektronik Ürün Ticareti'
            },
            {
                code: 'C.13',
                name: 'E-Ticaret'
            },
            {
                code: 'C.14',
                name: 'Güvenlik Sistemleri Hizmetleri'
            },
            {
                code: 'C.15',
                name: 'Kayıtlı Medyaların İmalatı, Kiralanması, Ticareti'
            },
            {
                code: 'C.16',
                name: 'Telekomünikasyon Cihazları Onarımı'
            },
            {
                code: 'C.17',
                name: 'Telekomünikasyon Cihazları Ticareti'
            }
        ]
    },
    {
        id: 'D',
        label: 'Gıda, Tarım',
        items: [
            {
                code: 'D.01',
                name: 'Aktar Ürünleri İmalatı, Ticareti'
            },
            {
                code: 'D.02',
                name: 'Arıcılık'
            },
            {
                code: 'D.03',
                name: 'Bakkallık, Bayilik, Büfecilik'
            },
            {
                code: 'D.04',
                name: 'Balıkçılık'
            },
            {
                code: 'D.05',
                name: 'Besicilik, Celeplik'
            },
            {
                code: 'D.06',
                name: 'Bitkisel Ürünlerle İlgili Faaliyetler'
            },
            {
                code: 'D.07',
                name: 'Börekçilik'
            },
            {
                code: 'D.08',
                name: 'Çeşitli Gıdaların İmalatı'
            },
            {
                code: 'D.09',
                name: 'Değirmencilik, Zahirecilik'
            },
            {
                code: 'D.10',
                name: 'Dondurmacılık'
            },
            {
                code: 'D.11',
                name: 'Evcil Hayvan Bakımı, Ticareti'
            },
            {
                code: 'D.12',
                name: 'Fırıncılık'
            },
            {
                code: 'D.13',
                name: 'Gübre, Zirai İlaç İmalatı, Ticareti'
            },
            {
                code: 'D.14',
                name: 'Kantincilik'
            },
            {
                code: 'D.15',
                name: 'Kasaplık'
            },
            {
                code: 'D.16',
                name: 'Kuruyemiş İmalatı, Ticareti'
            },
            {
                code: 'D.17',
                name: 'Lokantacılık'
            },
            {
                code: 'D.18',
                name: 'Manavlık'
            },
            {
                code: 'D.19',
                name: 'Meşrubat İmalatı, Ticareti'
            },
            {
                code: 'D.20',
                name: 'Pastanecilik, Tatlıcılık'
            },
            {
                code: 'D.21',
                name: 'Şarküteri Ürünleri İmalatı, Ticareti'
            },
            {
                code: 'D.22',
                name: 'Şekercilik, Çikolatacılık'
            },
            {
                code: 'D.23',
                name: 'Tavukçuluk'
            },
            {
                code: 'D.24',
                name: 'Yaş Sebze, Meyve Ticareti'
            },
            {
                code: 'D.25',
                name: 'Yufkacılık, Kadayıfçılık'
            }
        ]
    },
    {
        id: 'E',
        label: 'Giyim, Deri Ürün, Ev Tekstili, Dokuma',
        items: [
            {
                code: 'E.01',
                name: 'Ayakkabıcılık'
            },
            {
                code: 'E.02',
                name: 'Çamaşırhane, Kuru Temizleme, Ütücülük Hizmetleri'
            },
            {
                code: 'E.03',
                name: 'Deri Aksesuar İmalatı, Ticareti'
            },
            {
                code: 'E.04',
                name: 'Deri Giyim Eşyası İmalatı, Onarımı'
            },
            {
                code: 'E.05',
                name: 'Deri Giyim Eşyası Ticareti'
            },
            {
                code: 'E.06',
                name: 'Dericilik'
            },
            {
                code: 'E.07',
                name: 'Dokumacılık'
            },
            {
                code: 'E.08',
                name: 'Ev Tekstil Ürünleri İmalatı, Ticareti'
            },
            {
                code: 'E.09',
                name: 'Halı Yıkama Hizmetleri'
            },
            {
                code: 'E.10',
                name: 'Halıcılık, Kilimcilik'
            },
            {
                code: 'E.11',
                name: 'İkinci El Tekstil Ürünleri Ticareti'
            },
            {
                code: 'E.12',
                name: 'Konfeksiyonculuk'
            },
            {
                code: 'E.13',
                name: 'Tasarım Faaliyetleri'
            },
            {
                code: 'E.14',
                name: 'Tekstil Baskıcılığı, Boyacılığı'
            },
            {
                code: 'E.15',
                name: 'Terzilik'
            },
            {
                code: 'E.16',
                name: 'Tuhafiye İmalatı, Ticareti'
            }
        ]
    },
    {
        id: 'F',
        label: 'Hediyelik Eşya, Eğitim, Basım, Fotoğraf, Çeşitli Mallar',
        items: [
            {
                code: 'F.01',
                name: 'Arzuhalcilik, Danışmanlık, Bilgi Hizmetleri'
            },
            {
                code: 'F.02',
                name: 'Basın, Yayım, İletişim'
            },
            {
                code: 'F.03',
                name: 'Bireysel Sanatkârlık Faaliyetleri'
            },
            {
                code: 'F.04',
                name: 'Çeşitli Malların Ticareti'
            },
            {
                code: 'F.05',
                name: 'Çiçekçilik'
            },
            {
                code: 'F.06',
                name: 'Fatura Tahsilat Bürosu İşletmeciliği'
            },
            {
                code: 'F.07',
                name: 'Fotoğrafçılık'
            },
            {
                code: 'F.08',
                name: 'Fotokopicilik, Tez Yazımı'
            },
            {
                code: 'F.09',
                name: 'Hediyelik Eşya İmalatı, Ticareti'
            },
            {
                code: 'F.10',
                name: 'Kağıt, Kağıt Ürünleri İmalatı, Ticareti'
            },
            {
                code: 'F.11',
                name: 'Kauçuk, Plastik Ürünlerin İmalatı, Ticareti'
            },
            {
                code: 'F.12',
                name: 'Kırtasiye İmalatı, Ticareti'
            },
            {
                code: 'F.13',
                name: 'Kitapçılık'
            },
            {
                code: 'F.14',
                name: 'Kreş İşletmeciliği'
            },
            {
                code: 'F.15',
                name: 'Kurs İşletmeciliği'
            },
            {
                code: 'F.16',
                name: 'Matbaacılık'
            },
            {
                code: 'F.17',
                name: 'Müzik Aletleri İmalatı, Onarımı, Ticareti'
            },
            {
                code: 'F.18',
                name: 'Oyuncak İmalatı, Ticareti'
            },
            {
                code: 'F.19',
                name: 'Reklamcılık, Tabelacılık'
            },
            {
                code: 'F.20',
                name: 'Sanat Eseri, Antika Ticareti'
            },
            {
                code: 'F.21',
                name: 'Tercümanlık'
            },
            {
                code: 'F.22',
                name: 'Züccaciye İmalatı, Ticareti'
            }
        ]
    },
    {
        id: 'G',
        label: 'Kuaför, Berber, Temizlik, Spor, Kozmetik, Sağlık',
        items: [
            {
                code: 'G.01',
                name: 'Alternatif Tedavi Merkezi İşletmeciliği'
            },
            {
                code: 'G.02',
                name: 'Cenaze Hizmetleri'
            },
            {
                code: 'G.03',
                name: 'Diş Laboratuvarlarının Faaliyetleri'
            },
            {
                code: 'G.04',
                name: 'Dövme Salonu İşletmeciliği'
            },
            {
                code: 'G.05',
                name: 'Erkek Berberliği'
            },
            {
                code: 'G.06',
                name: 'Genel Temizlik, Haşere Kontrol Faaliyetleri'
            },
            {
                code: 'G.07',
                name: 'Güzellik Salonu İşletmeciliği'
            },
            {
                code: 'G.08',
                name: 'Hasta Bakıcılığı'
            },
            {
                code: 'G.09',
                name: 'Kadın Kuaförlüğü'
            },
            {
                code: 'G.10',
                name: 'Kaplıca, Hamam İşletmeciliği'
            },
            {
                code: 'G.11',
                name: 'Kozmetik İmalatı, Ticareti'
            },
            {
                code: 'G.12',
                name: 'Optik Ürünlerin İmalatı, Ticareti'
            },
            {
                code: 'G.13',
                name: 'Spor Malzemeleri İmalatı, Ticareti'
            },
            {
                code: 'G.14',
                name: 'Spor Tesisi İşletmeciliği'
            },
            {
                code: 'G.15',
                name: 'Temizlik Malzemeleri İmalatı, Ticareti'
            },
            {
                code: 'G.16',
                name: 'Tıbbi Malzemelerin İmalatı, Ticareti'
            },
            {
                code: 'G.17',
                name: 'Tuvalet İşletmeciliği'
            }
        ]
    },
    {
        id: 'H',
        label: 'Metal, Otomotiv, Makine',
        items: [
            {
                code: 'H.01',
                name: 'Alüminyum Ürün İmalatı'
            },
            {
                code: 'H.02',
                name: 'At Arabası İmalatı, Onarımı'
            },
            {
                code: 'H.03',
                name: 'Bakırcılık'
            },
            {
                code: 'H.04',
                name: 'Çilingirlik'
            },
            {
                code: 'H.05',
                name: 'Demir, Çelik Eşya İmalatı, Ticareti'
            },
            {
                code: 'H.06',
                name: 'Deniz Taşıtları İmalatı, Onarımı, Ticareti'
            },
            {
                code: 'H.07',
                name: 'Dökümcülük'
            },
            {
                code: 'H.08',
                name: 'Ev Aletleri İmalatı, Onarımı, Ticareti'
            },
            {
                code: 'H.09',
                name: 'Hurdacılık'
            },
            {
                code: 'H.10',
                name: 'İklimlendirme, Soğutma Sistemi İmalatı, Kurulumu, Onarımı'
            },
            {
                code: 'H.11',
                name: 'Kalaycılık, Kaplamacılık'
            },
            {
                code: 'H.12',
                name: 'Karoser İmalatı, Kaportacılık'
            },
            {
                code: 'H.13',
                name: 'Kuyumculuk'
            },
            {
                code: 'H.14',
                name: 'Makine Kurulumu, Onarımı'
            },
            {
                code: 'H.15',
                name: 'Makine, Yedek Parça Ticareti'
            },
            {
                code: 'H.16',
                name: 'Motosiklet, Bisiklet İmalatı, Onarımı'
            },
            {
                code: 'H.17',
                name: 'Motosiklet, Bisiklet Ticareti'
            },
            {
                code: 'H.18',
                name: 'Oto Bakım Servisçiliği'
            },
            {
                code: 'H.19',
                name: 'Oto Boyacılık'
            },
            {
                code: 'H.20',
                name: 'Oto Döşemecilik'
            },
            {
                code: 'H.21',
                name: 'Oto Elektrikçilik'
            },
            {
                code: 'H.22',
                name: 'Oto Lastik Onarımı'
            },
            {
                code: 'H.23',
                name: 'Oto Lastik Ticareti'
            },
            {
                code: 'H.24',
                name: 'Oto Lpg Montajı'
            },
            {
                code: 'H.25',
                name: 'Oto Yedek Parça İmalatı'
            },
            {
                code: 'H.26',
                name: 'Oto Yedek Parça Ticareti'
            },
            {
                code: 'H.27',
                name: 'Oto Yıkama, Yağlama'
            },
            {
                code: 'H.28',
                name: 'Saatçilik'
            },
            {
                code: 'H.29',
                name: 'Soba, Banyo Kazanı, Şofben İmalatı, Onarımı, Ticareti'
            },
            {
                code: 'H.30',
                name: 'Tenekecilik'
            },
            {
                code: 'H.31',
                name: 'Tornacılık'
            },
            {
                code: 'H.32',
                name: 'Tüp Gaz Bayiliği'
            }
        ]
    },
    {
        id: 'I',
        label: 'Pazar, Seyyar',
        items: [
            {
                code: 'I.01',
                name: 'Pazarda Ayakkabı, Tekstil Ürünleri Ticareti'
            },
            {
                code: 'I.02',
                name: 'Pazarda Bitki, Hayvan, Su Ürünleri Ticareti'
            },
            {
                code: 'I.03',
                name: 'Pazarda Çeşitli Malların Ticareti'
            },
            {
                code: 'I.04',
                name: 'Pazarda Sebze, Meyve Ticareti'
            },
            {
                code: 'I.05',
                name: 'Pazarda Yiyecek, İçecek Ticareti'
            },
            {
                code: 'I.06',
                name: 'Seyyar Satıcılık'
            }
        ]
    },
    {
        id: 'J',
        label: 'Ulaştırma Hizmetleri',
        items: [
            {
                code: 'J.01',
                name: 'Akaryakıt Ticareti'
            },
            {
                code: 'J.02',
                name: 'Durak, Otopark İşletmeciliği'
            },
            {
                code: 'J.03',
                name: 'Faytonculuk'
            },
            {
                code: 'J.04',
                name: 'İş Makinesi İşletmeciliği'
            },
            {
                code: 'J.05',
                name: 'Kara Yolu İle Yük Taşımacılığı'
            },
            {
                code: 'J.06',
                name: 'Minibüsçülük'
            },
            {
                code: 'J.07',
                name: 'Nakliyat Komisyonculuğu'
            },
            {
                code: 'J.08',
                name: 'Oto Galericilik, Oto Kiralama'
            },
            {
                code: 'J.09',
                name: 'Oto Kurtarıcılık'
            },
            {
                code: 'J.10',
                name: 'Otobüsçülük'
            },
            {
                code: 'J.11',
                name: 'Özel Ambulans İşletmeciliği'
            },
            {
                code: 'J.12',
                name: 'Servis Aracı İşletmeciliği'
            },
            {
                code: 'J.13',
                name: 'Su Yolu Taşımacılığı'
            },
            {
                code: 'J.14',
                name: 'Taksicilik'
            },
            {
                code: 'J.15',
                name: 'Trafik Müşavirliği, İş Takipçiliği'
            },
            {
                code: 'J.16',
                name: 'Yük Taşımacılığını Destekleyici Faaliyetler'
            }
        ]
    },
    {
        id: 'K',
        label: 'Yapı Sanatları',
        items: [
            {
                code: 'K.01',
                name: 'Boya, Kimyasal Ürünlerin İmalatı'
            },
            {
                code: 'K.02',
                name: 'Boya, Kimyasal Ürünlerin Ticareti'
            },
            {
                code: 'K.03',
                name: 'Camcılık'
            },
            {
                code: 'K.04',
                name: 'Çevre Düzenleme, Peyzaj Faaliyetleri'
            },
            {
                code: 'K.05',
                name: 'Emlakçılık'
            },
            {
                code: 'K.06',
                name: 'Hırdavatçılık'
            },
            {
                code: 'K.07',
                name: 'İnşaat Malzemeleri İmalatı'
            },
            {
                code: 'K.08',
                name: 'İnşaat Malzemeleri Ticareti'
            },
            {
                code: 'K.09',
                name: 'İnşaatçılık'
            },
            {
                code: 'K.10',
                name: 'Mermer, Taş, Kum Ocakçılığı'
            },
            {
                code: 'K.11',
                name: 'Prefabrik Yapıların İmalatı, Kurulumu, Ticareti'
            },
            {
                code: 'K.12',
                name: 'Pvc Ürün İmalatı'
            },
            {
                code: 'K.13',
                name: 'Pvc Ürün Ticareti'
            },
            {
                code: 'K.14',
                name: 'Sıhhi Tesisatçılık'
            },
            {
                code: 'K.15',
                name: 'Sondajcılık'
            }
        ]
    }
];

export const MESLEK_NAME: Record<string, string> = Object.fromEntries(MESLEK_GROUPS.flatMap(g => g.items.map(i => [i.code, i.name])));
