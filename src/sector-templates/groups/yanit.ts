import { hazirPath, type SectorTemplate } from '../types';

/** e-İrsaliye Yanıtı (ReceiptAdvice): teslim alınan / eksik / fazla / reddedilen satırlar. */
export const YANIT_TEMPLATES: SectorTemplate[] = [
    {
        id: 'depo-mal-kabul-yaniti',
        sector: 'lojistik',
        name: 'Depo Mal Kabul Yanıtı',
        description: 'Depo ve dağıtım merkezleri için sipariş → irsaliye → teslim → yanıt akışı, koli bazında kabul / eksik / fazla / red özet kartları, dağılım çubuğu ve satır bazında red nedenleri.',
        docTypeId: 'irsaliye-yanit',
        moduleId: 'irsaliye-yanit',
        accent: '#0891b2',
        xslt: hazirPath('depo-mal-kabul-yaniti', 'xslt'),
        xml: hazirPath('depo-mal-kabul-yaniti', 'xml'),
        tags: ['Kabul / eksik / fazla / red', 'Özet kartları', 'Red nedeni', 'Belge akışı', 'Kontrol imzası'],
    },
    {
        id: 'magaza-teslim-alma-yaniti',
        sector: 'perakende',
        name: 'Mağaza Teslim Alma Yanıtı',
        description: 'Mağazaların tedarikçiye gönderdiği yanıt: kabul oranı halkası, ürün kartlarında teslim çubuğu, eksik / fazla / defolu etiketleri ve geç teslim notları.',
        docTypeId: 'irsaliye-yanit',
        moduleId: 'irsaliye-yanit',
        accent: '#7c3aed',
        xslt: hazirPath('magaza-teslim-alma-yaniti', 'xslt'),
        xml: hazirPath('magaza-teslim-alma-yaniti', 'xml'),
        tags: ['Kabul oranı', 'Ürün kartları', 'Teslim çubuğu', 'Defolu / yanlış ürün', 'Geç teslim'],
    },
    {
        id: 'uretim-hammadde-kabul-yaniti',
        sector: 'uretim',
        name: 'Hammadde Giriş Kontrol Yanıtı',
        description: 'Fabrikaların hammadde girişinde kullandığı kalite kontrol yanıtı: lot numaralı malzeme tablosu, ± miktar farkı, UYGUN / ŞARTLI / RET sonucu ve numaralı uygunsuzluk kayıtları.',
        docTypeId: 'irsaliye-yanit',
        moduleId: 'irsaliye-yanit',
        accent: '#f97316',
        xslt: hazirPath('uretim-hammadde-kabul-yaniti', 'xslt'),
        xml: hazirPath('uretim-hammadde-kabul-yaniti', 'xml'),
        tags: ['Lot numarası', 'Miktar farkı', 'Uygunsuzluk kaydı', 'Kalite kontrol', 'Karışık birim'],
    },
];
