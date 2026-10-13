/**
 * Ulusal biçimlerin (ФНС УПД 5.03, GST e-Invoice, e-Way Bill, 数电票, NF-e / NFC-e, CT-e, NFS-e) alan kataloğu.
 * Etiketler Türkçe, İngilizce ve belgenin yerel dilinde; diğer dillerde İngilizce.
 * Yollar namespace'siz yerel adlardır (fieldCatalog yol sözdizimi).
 */
import type { DocLanguage } from '../international/registry/docLanguages';
import type { CatalogField, CatalogFormat } from './fieldCatalog';

export type NationalRoot = 'Файл' | 'GSTInvoice' | 'EWayBill' | 'EInvoice' | 'nfeProc' | 'NFe' | 'cteProc' | 'CTe' | 'NFSe';

type Text = [tr: string, en: string, native: string];
type Row = [label: Text, path: string, format?: CatalogFormat];
type Group = [category: Text, rows: Row[]];

const A: CatalogFormat = 'amount';
const N: CatalogFormat = 'number';

const D = 'Документ';
const S = `${D}/СвСчФакт`;
const T = `${D}/ТаблСчФакт`;

const ruParty = (base: string, who: Text): Row[] => {
    const p = (label: Text): Text => [`${who[0]} ${label[0]}`, `${who[1]} ${label[1]}`, `${who[2]}: ${label[2]}`];
    return [
        [p(['Unvanı', 'name', 'наименование']), `${base}/ИдСв/СвЮЛУч/@НаимОрг`],
        [p(['INN', 'INN', 'ИНН']), `${base}/ИдСв/СвЮЛУч/@ИННЮЛ`],
        [p(['KPP', 'KPP', 'КПП']), `${base}/ИдСв/СвЮЛУч/@КПП`],
        [p(['Posta Kodu', 'postcode', 'индекс']), `${base}/Адрес/АдрРФ/@Индекс`],
        [p(['Bölge', 'region', 'регион']), `${base}/Адрес/АдрРФ/@НаимРегион`],
        [p(['Şehir', 'city', 'город']), `${base}/Адрес/АдрРФ/@Город`],
        [p(['Cadde', 'street', 'улица']), `${base}/Адрес/АдрРФ/@Улица`],
        [p(['Bina No', 'building', 'дом']), `${base}/Адрес/АдрРФ/@Дом`],
        [p(['Hesap No', 'account no.', 'расчётный счёт']), `${base}/БанкРекв/@НомерСчета`],
        [p(['Banka', 'bank', 'банк']), `${base}/БанкРекв/СвБанк/@НаимБанк`],
        [p(['BİK', 'BIK', 'БИК']), `${base}/БанкРекв/СвБанк/@БИК`],
        [p(['Telefon', 'phone', 'телефон']), `${base}/Контакт/Тлф`],
        [p(['E-posta', 'e-mail', 'эл. почта']), `${base}/Контакт/ЭлПочта`],
    ];
};

const RU: Group[] = [
    [['Belge', 'Document', 'Документ'], [
        [['Belge No', 'Document no.', 'Номер документа'], `${S}/@НомерДок`],
        [['Belge Tarihi', 'Document date', 'Дата документа'], `${S}/@ДатаДок`],
        [['Fonksiyon (СЧФ/СЧФДОП/ДОП)', 'Function (СЧФ/СЧФДОП/ДОП)', 'Функция'], `${D}/@Функция`],
        [['KND Kodu', 'KND code', 'Код КНД'], `${D}/@КНД`],
        [['Düzeltme No', 'Correction no.', 'Номер исправления'], `${S}/ИспрДок/@НомИспр`],
        [['Para Birimi Kodu', 'Currency code', 'Код валюты'], `${S}/ДенИзм/@КодОКВ`],
        [['Para Birimi Adı', 'Currency name', 'Наименование валюты'], `${S}/ДенИзм/@НаимОКВ`],
        [['Dosya Kimliği', 'File ID', 'Идентификатор файла'], '@ИдФайл'],
        [['Dosyayı Düzenleyen', 'File compiled by', 'Составитель файла'], `${D}/@НаимЭконСубСост`],
        [['Ek Bilgi', 'Additional information', 'Дополнительные сведения'], `${S}/ИнфПолФХЖ1/ТекстИнф/@Значен`],
    ]],
    [['Satıcı', 'Seller', 'Продавец'], ruParty(`${S}/СвПрод`, ['Satıcı', 'Seller', 'Продавец'])],
    [['Alıcı', 'Buyer', 'Покупатель'], ruParty(`${S}/СвПокуп`, ['Alıcı', 'Buyer', 'Покупатель'])],
    [['Sevkiyat', 'Shipment', 'Отгрузка'], [
        [['Alıcı (Teslim Alan) Unvanı', 'Consignee name', 'Грузополучатель'], `${S}/ГрузПолуч/ИдСв/СвЮЛУч/@НаимОрг`],
        [['Sevk Belgesi No', 'Shipment document no.', 'Номер документа об отгрузке'], `${S}/ДокПодтвОтгрНом/@РеквНомерДок`],
        [['Ödeme Belgesi No', 'Payment document no.', 'Номер платёжного документа'], `${S}/СвПРД/@НомерПРД`],
        [['Ödeme Belgesi Tarihi', 'Payment document date', 'Дата платёжного документа'], `${S}/СвПРД/@ДатаПРД`],
        [['Teslim Tarihi', 'Transfer date', 'Дата передачи'], `${D}/СвПродПер/СвПер/@ДатаПер`],
        [['İşlem İçeriği', 'Operation', 'Содержание операции'], `${D}/СвПродПер/СвПер/@СодОпер`],
        [['Devir Dayanağı', 'Basis of transfer', 'Основание передачи'], `${D}/СвПродПер/СвПер/ОснПер/@РеквНаимДок`],
        [['Taşıma Bilgisi', 'Transport details', 'Сведения о транспортировке'], `${D}/СвПродПер/СвПер/Тран/@СвТран`],
    ]],
    [['Kalemler', 'Lines', 'Табличная часть'], [
        [['Satır No', 'Line no.', '№ п/п'], `${T}/СведТов/@НомСтр`, N],
        [['Mal / Hizmet Adı', 'Item name', 'Наименование товара'], `${T}/СведТов/@НаимТов`],
        [['Mal Kodu', 'Item code', 'Код товара'], `${T}/СведТов/ДопСведТов/@КодТов`],
        [['Birim Kodu (OKEİ)', 'Unit code (OKEI)', 'Код единицы (ОКЕИ)'], `${T}/СведТов/@ОКЕИ_Тов`],
        [['Birim', 'Unit', 'Единица измерения'], `${T}/СведТов/@НаимЕдИзм`],
        [['Miktar', 'Quantity', 'Количество'], `${T}/СведТов/@КолТов`, N],
        [['Birim Fiyat', 'Unit price', 'Цена'], `${T}/СведТов/@ЦенаТов`, A],
        [['KDV Hariç Tutar', 'Amount excl. VAT', 'Стоимость без НДС'], `${T}/СведТов/@СтТовБезНДС`, A],
        [['KDV Oranı', 'VAT rate', 'Налоговая ставка'], `${T}/СведТов/@НалСт`],
        [['KDV Tutarı', 'VAT amount', 'Сумма НДС'], `${T}/СведТов/СумНал/СумНал`, A],
        [['KDV Dahil Tutar', 'Amount incl. VAT', 'Стоимость с НДС'], `${T}/СведТов/@СтТовУчНал`, A],
    ]],
    [['Toplamlar', 'Totals', 'Итоги'], [
        [['Toplam (KDV Hariç)', 'Total excl. VAT', 'Всего без НДС'], `${T}/ВсегоОпл/@СтТовБезНДСВсего`, A],
        [['Toplam KDV', 'Total VAT', 'Всего НДС'], `${T}/ВсегоОпл/СумНалВсего/СумНал`, A],
        [['Ödenecek Tutar', 'Total payable', 'Всего к оплате'], `${T}/ВсегоОпл/@СтТовУчНалВсего`, A],
    ]],
    [['İmzalayan', 'Signer', 'Подписант'], [
        [['Görevi', 'Position', 'Должность'], `${D}/Подписант/@Должн`],
        [['Soyadı', 'Surname', 'Фамилия'], `${D}/Подписант/ФИО/@Фамилия`],
        [['Adı', 'Given name', 'Имя'], `${D}/Подписант/ФИО/@Имя`],
        [['Baba Adı', 'Patronymic', 'Отчество'], `${D}/Подписант/ФИО/@Отчество`],
    ]],
];

const inParty = (base: string, who: Text, buyer: boolean): Row[] => {
    const p = (label: Text): Text => [`${who[0]} ${label[0]}`, `${who[1]} ${label[1]}`, `${who[2]} ${label[2]}`];
    return [
        [p(['GSTIN', 'GSTIN', 'जीएसटीआईएन']), `${base}/Gstin`],
        [p(['Yasal Unvanı', 'legal name', 'वैधानिक नाम']), `${base}/LglNm`],
        [p(['Ticari Adı', 'trade name', 'व्यापारिक नाम']), `${base}/TrdNm`],
        [p(['Adres', 'address', 'पता']), `${base}/Addr1`],
        [p(['Yer', 'location', 'स्थान']), `${base}/Loc`],
        [p(['PIN Kodu', 'PIN code', 'पिन कोड']), `${base}/Pin`],
        [p(['Eyalet Kodu', 'state code', 'राज्य कोड']), `${base}/Stcd`],
        ...(buyer ? [[p(['Tedarik Yeri', 'place of supply', 'आपूर्ति का स्थान']), `${base}/Pos`] as Row] : []),
        [p(['Telefon', 'phone', 'फ़ोन']), `${base}/Ph`],
        [p(['E-posta', 'e-mail', 'ईमेल']), `${base}/Em`],
    ];
};

const IN_INVOICE: Group[] = [
    [['Belge', 'Document', 'दस्तावेज़'], [
        [['Belge Türü (INV/CRN/DBN)', 'Document type (INV/CRN/DBN)', 'दस्तावेज़ प्रकार'], 'DocDtls/Typ'],
        [['Belge No', 'Document no.', 'दस्तावेज़ संख्या'], 'DocDtls/No'],
        [['Belge Tarihi', 'Document date', 'दस्तावेज़ तिथि'], 'DocDtls/Dt'],
        [['Tedarik Türü', 'Supply type', 'आपूर्ति प्रकार'], 'TranDtls/SupTyp'],
        [['Ters Yükleme', 'Reverse charge', 'रिवर्स चार्ज'], 'TranDtls/RegRev'],
        [['IRN', 'IRN', 'आईआरएन'], 'Irn'],
        [['Onay No', 'Ack no.', 'पावती संख्या'], 'AckNo'],
        [['Onay Tarihi', 'Ack date', 'पावती तिथि'], 'AckDt'],
    ]],
    [['Tedarikçi', 'Supplier', 'आपूर्तिकर्ता'], inParty('SellerDtls', ['Tedarikçi', 'Supplier', 'आपूर्तिकर्ता'], false)],
    [['Alıcı', 'Recipient', 'प्राप्तकर्ता'], inParty('BuyerDtls', ['Alıcı', 'Recipient', 'प्राप्तकर्ता'], true)],
    [['Kalemler', 'Items', 'मदें'], [
        [['Sıra No', 'Sl. no.', 'क्रम संख्या'], 'ItemList/SlNo', N],
        [['Açıklama', 'Description', 'विवरण'], 'ItemList/PrdDesc'],
        [['Hizmet mi (Y/N)', 'Is service (Y/N)', 'सेवा (Y/N)'], 'ItemList/IsServc'],
        [['HSN / SAC Kodu', 'HSN / SAC code', 'एचएसएन / एसएसी कोड'], 'ItemList/HsnCd'],
        [['Miktar', 'Quantity', 'मात्रा'], 'ItemList/Qty', N],
        [['Birim', 'Unit', 'इकाई'], 'ItemList/Unit'],
        [['Birim Fiyat', 'Unit price', 'इकाई मूल्य'], 'ItemList/UnitPrice', A],
        [['Brüt Tutar', 'Gross amount', 'कुल राशि'], 'ItemList/TotAmt', A],
        [['Matrah', 'Taxable value', 'कर योग्य मूल्य'], 'ItemList/AssAmt', A],
        [['GST Oranı', 'GST rate', 'जीएसटी दर'], 'ItemList/GstRt', N],
        [['IGST Tutarı', 'IGST amount', 'आईजीएसटी राशि'], 'ItemList/IgstAmt', A],
        [['CGST Tutarı', 'CGST amount', 'सीजीएसटी राशि'], 'ItemList/CgstAmt', A],
        [['SGST Tutarı', 'SGST amount', 'एसजीएसटी राशि'], 'ItemList/SgstAmt', A],
        [['Kalem Toplamı', 'Item total', 'मद कुल'], 'ItemList/TotItemVal', A],
    ]],
    [['Toplamlar', 'Totals', 'कुल'], [
        [['Toplam Matrah', 'Total taxable value', 'कुल कर योग्य मूल्य'], 'ValDtls/AssVal', A],
        [['Toplam CGST', 'Total CGST', 'कुल सीजीएसटी'], 'ValDtls/CgstVal', A],
        [['Toplam SGST', 'Total SGST', 'कुल एसजीएसटी'], 'ValDtls/SgstVal', A],
        [['Toplam IGST', 'Total IGST', 'कुल आईजीएसटी'], 'ValDtls/IgstVal', A],
        [['Yuvarlama', 'Round off', 'पूर्णांकन'], 'ValDtls/RndOffAmt', A],
        [['Fatura Toplamı', 'Total invoice value', 'कुल बीजक मूल्य'], 'ValDtls/TotInvVal', A],
    ]],
    [['Ödeme ve Referans', 'Payment and references', 'भुगतान और संदर्भ'], [
        [['Hesap Sahibi', 'Payee name', 'प्राप्तकर्ता नाम'], 'PayDtls/Nm'],
        [['Hesap No', 'Account no.', 'खाता संख्या'], 'PayDtls/AccDet'],
        [['IFSC', 'IFSC', 'आईएफएससी'], 'PayDtls/FinInsBr'],
        [['Ödeme Şekli', 'Payment mode', 'भुगतान का तरीका'], 'PayDtls/Mode'],
        [['Ödeme Koşulları', 'Payment terms', 'भुगतान शर्तें'], 'PayDtls/PayTerm'],
        [['Açıklama', 'Remarks', 'टिप्पणी'], 'RefDtls/InvRm'],
        [['Asıl Fatura No', 'Original invoice no.', 'मूल बीजक संख्या'], 'RefDtls/PrecDocDtls/InvNo'],
        [['Asıl Fatura Tarihi', 'Original invoice date', 'मूल बीजक तिथि'], 'RefDtls/PrecDocDtls/InvDt'],
    ]],
];

const ewbParty = (dir: 'from' | 'to', who: Text): Row[] => {
    const p = (label: Text): Text => [`${who[0]} ${label[0]}`, `${who[1]} ${label[1]}`, `${who[2]} ${label[2]}`];
    return [
        [p(['GSTIN', 'GSTIN', 'जीएसटीआईएन']), `${dir}Gstin`],
        [p(['Unvanı', 'name', 'नाम']), `${dir}TrdName`],
        [p(['Adres 1', 'address 1', 'पता 1']), `${dir}Addr1`],
        [p(['Adres 2', 'address 2', 'पता 2']), `${dir}Addr2`],
        [p(['Yer', 'place', 'स्थान']), `${dir}Place`],
        [p(['PIN Kodu', 'PIN code', 'पिन कोड']), `${dir}Pincode`],
        [p(['Eyalet Kodu', 'state code', 'राज्य कोड']), `${dir}StateCode`],
    ];
};

const IN_EWB: Group[] = [
    [['E-Way Bill', 'E-way bill', 'ई-वे बिल'], [
        [['E-Way Bill No', 'E-way bill no.', 'ई-वे बिल संख्या'], 'ewayBillNo'],
        [['Oluşturma Tarihi', 'Generated date', 'जनरेट तिथि'], 'ewayBillDate'],
        [['Geçerlilik Sonu', 'Valid upto', 'वैधता तक'], 'validUpto'],
        [['Tedarik Türü (O/I)', 'Supply type (O/I)', 'आपूर्ति प्रकार'], 'supplyType'],
        [['Alt Tür', 'Sub-supply type', 'उप-आपूर्ति प्रकार'], 'subSupplyType'],
        [['Belge Türü', 'Document type', 'दस्तावेज़ प्रकार'], 'docType'],
        [['Belge No', 'Document no.', 'दस्तावेज़ संख्या'], 'docNo'],
        [['Belge Tarihi', 'Document date', 'दस्तावेज़ तिथि'], 'docDate'],
    ]],
    [['Gönderen', 'From', 'प्रेषक'], ewbParty('from', ['Gönderen', 'Consignor', 'प्रेषक'])],
    [['Alıcı', 'To', 'प्राप्तकर्ता'], ewbParty('to', ['Alıcı', 'Consignee', 'प्राप्तकर्ता'])],
    [['Mallar', 'Goods', 'माल'], [
        [['Ürün Adı', 'Product name', 'उत्पाद का नाम'], 'itemList/productName'],
        [['Ürün Açıklaması', 'Product description', 'उत्पाद विवरण'], 'itemList/productDesc'],
        [['HSN Kodu', 'HSN code', 'एचएसएन कोड'], 'itemList/hsnCode'],
        [['Miktar', 'Quantity', 'मात्रा'], 'itemList/quantity', N],
        [['Birim', 'Unit', 'इकाई'], 'itemList/qtyUnit'],
        [['Matrah', 'Taxable amount', 'कर योग्य राशि'], 'itemList/taxableAmount', A],
        [['IGST Oranı', 'IGST rate', 'आईजीएसटी दर'], 'itemList/igstRate', N],
    ]],
    [['Toplamlar', 'Totals', 'कुल'], [
        [['Toplam Matrah', 'Total taxable amount', 'कुल कर योग्य राशि'], 'totalValue', A],
        [['CGST', 'CGST', 'सीजीएसटी'], 'cgstValue', A],
        [['SGST', 'SGST', 'एसजीएसटी'], 'sgstValue', A],
        [['IGST', 'IGST', 'आईजीएसटी'], 'igstValue', A],
        [['Fatura Toplamı', 'Total invoice value', 'कुल बीजक मूल्य'], 'totInvValue', A],
    ]],
    [['Taşıma', 'Transport', 'परिवहन'], [
        [['Taşıyıcı', 'Transporter', 'ट्रांसपोर्टर'], 'transporterName'],
        [['Taşıyıcı Kimliği', 'Transporter ID', 'ट्रांसपोर्टर आईडी'], 'transporterId'],
        [['Taşıma Şekli (1-4)', 'Mode (1-4)', 'परिवहन साधन'], 'transMode'],
        [['Mesafe (km)', 'Distance (km)', 'दूरी (किमी)'], 'transDistance', N],
        [['Taşıma Belgesi No', 'Transport doc no.', 'परिवहन दस्तावेज़ संख्या'], 'transDocNo'],
        [['Taşıma Belgesi Tarihi', 'Transport doc date', 'परिवहन दस्तावेज़ तिथि'], 'transDocDate'],
        [['Araç Plakası', 'Vehicle no.', 'वाहन संख्या'], 'vehicleNo'],
    ]],
];

const cnParty = (side: 'Seller' | 'Buyer', who: Text): Row[] => {
    const base = `EInvoiceData/${side}Information/${side}`;
    const p = (label: Text): Text => [`${who[0]} ${label[0]}`, `${who[1]} ${label[1]}`, `${who[2]}${label[2]}`];
    return [
        [p(['Unvanı', 'name', '名称']), `${base}Name`],
        [p(['Vergi Kimlik No', 'taxpayer ID', '纳税人识别号']), `${base}IdNum`],
        [p(['Adres', 'address', '地址']), `${base}Addr`],
        [p(['Telefon', 'phone', '电话']), `${base}TelNum`],
        [p(['Banka', 'bank', '开户银行']), `${base}BankName`],
        [p(['Hesap No', 'account no.', '银行账号']), `${base}BankAccNum`],
    ];
};

const CN: Group[] = [
    [['Belge', 'Document', '发票信息'], [
        [['Fatura No', 'Invoice no.', '发票号码'], 'Header/EIid'],
        [['Düzenleme Tarihi', 'Issue date', '开票日期'], 'TaxSupervisionInfo/IssueTime'],
        [['Talep Zamanı', 'Request time', '请求时间'], 'EInvoiceData/BasicInformation/RequestTime'],
        [['Mavi / Kırmızı (Y/N)', 'Blue / red (Y/N)', '蓝字发票标志'], 'Header/InherentLabel/InIssuType/LabelCode'],
        [['Fatura Türü', 'Invoice type', '发票票种'], 'Header/InherentLabel/GeneralOrSpecialVAT/LabelName'],
        [['Düzenleyen', 'Issued by', '开票人'], 'EInvoiceData/BasicInformation/Drawer'],
        [['Açıklama', 'Remarks', '备注'], 'EInvoiceData/AdditionalInformation/Remark'],
        [['Vergi Dairesi', 'Tax authority', '税务机关名称'], 'TaxSupervisionInfo/TaxBureauName'],
    ]],
    [['Satıcı', 'Seller', '销售方'], cnParty('Seller', ['Satıcı', 'Seller', '销售方'])],
    [['Alıcı', 'Buyer', '购买方'], cnParty('Buyer', ['Alıcı', 'Buyer', '购买方'])],
    [['Kalemler', 'Items', '项目明细'], [
        [['Kalem Adı', 'Item name', '项目名称'], 'EInvoiceData/IssuItemInformation/ItemName'],
        [['Özellik / Model', 'Specification', '规格型号'], 'EInvoiceData/IssuItemInformation/SpecMod'],
        [['Birim', 'Unit', '单位'], 'EInvoiceData/IssuItemInformation/MeaUnits'],
        [['Miktar', 'Quantity', '数量'], 'EInvoiceData/IssuItemInformation/Quantity', N],
        [['Birim Fiyat', 'Unit price', '单价'], 'EInvoiceData/IssuItemInformation/UnPrice', A],
        [['Tutar', 'Amount', '金额'], 'EInvoiceData/IssuItemInformation/Amount', A],
        [['Vergi Oranı', 'Tax rate', '税率'], 'EInvoiceData/IssuItemInformation/TaxRate', N],
        [['Vergi Tutarı', 'Tax amount', '税额'], 'EInvoiceData/IssuItemInformation/ComTaxAm', A],
        [['Vergi Sınıf Kodu', 'Tax classification code', '税收分类编码'], 'EInvoiceData/IssuItemInformation/TaxClassificationCode'],
    ]],
    [['Toplamlar', 'Totals', '合计'], [
        [['Vergisiz Toplam', 'Total excl. tax', '合计金额'], 'EInvoiceData/BasicInformation/TotalAmWithoutTax', A],
        [['Toplam Vergi', 'Total tax', '合计税额'], 'EInvoiceData/BasicInformation/TotalTaxAm', A],
        [['Vergi Dahil Toplam', 'Total incl. tax', '价税合计（小写）'], 'EInvoiceData/BasicInformation/TotalTax-includedAmount', A],
        [['Vergi Dahil Toplam (yazıyla)', 'Total incl. tax (in words)', '价税合计（大写）'], 'EInvoiceData/BasicInformation/TotalTax-includedAmountInChinese'],
    ]],
];

const brAddr = (base: string, who: Text): Row[] => {
    const p = (label: Text): Text => [`${who[0]} ${label[0]}`, `${who[1]} ${label[1]}`, `${label[2]} do ${who[2]}`];
    return [
        [p(['Cadde', 'street', 'Logradouro']), `${base}/xLgr`],
        [p(['Bina No', 'number', 'Número']), `${base}/nro`],
        [p(['Mahalle', 'district', 'Bairro']), `${base}/xBairro`],
        [p(['Belediye Kodu (IBGE)', 'municipality code (IBGE)', 'Código do município']), `${base}/cMun`],
        [p(['Şehir', 'city', 'Município']), `${base}/xMun`],
        [p(['Eyalet (UF)', 'state (UF)', 'UF']), `${base}/UF`],
        [p(['Posta Kodu (CEP)', 'postcode (CEP)', 'CEP']), `${base}/CEP`],
    ];
};

const brParty = (base: string, addr: string, who: Text, extra: Row[] = [], phone = `${addr}/fone`): Row[] => {
    const p = (label: Text): Text => [`${who[0]} ${label[0]}`, `${who[1]} ${label[1]}`, `${label[2]} do ${who[2]}`];
    return [
        [p(['CNPJ', 'CNPJ', 'CNPJ']), `${base}/CNPJ`],
        [p(['CPF', 'CPF', 'CPF']), `${base}/CPF`],
        [p(['Unvanı', 'name', 'Razão social']), `${base}/xNome`],
        [p(['Ticari Adı', 'trade name', 'Nome fantasia']), `${base}/xFant`],
        [p(['Eyalet Vergi No (IE)', 'state registration (IE)', 'Inscrição estadual']), `${base}/IE`],
        ...extra,
        ...brAddr(`${base}/${addr}`, who),
        [p(['Telefon', 'phone', 'Telefone']), `${base}/${phone}`],
        [p(['E-posta', 'e-mail', 'E-mail']), `${base}/email`],
    ];
};

/** NF-e / NFC-e: `inf` infNFe'nin, `nfe` NFe'nin kökten yolu (nfeProc altında ya da kök). */
const brNfe = (proc: boolean): Group[] => {
    const nfe = proc ? 'NFe/' : '';
    const inf = `${nfe}infNFe`;
    const det = `${inf}/det`;
    const tax = `${det}/imposto`;
    const tot = `${inf}/total/ICMSTot`;
    const rtc = `${inf}/total/IBSCBSTot`;
    return [
        [['Belge', 'Document', 'Nota fiscal'], [
            [['Erişim Anahtarı', 'Access key', 'Chave de acesso'], `${inf}/@Id`],
            [['Fatura No', 'Invoice no.', 'Número'], `${inf}/ide/nNF`, N],
            [['Seri', 'Series', 'Série'], `${inf}/ide/serie`],
            [['Model (55/65)', 'Model (55/65)', 'Modelo'], `${inf}/ide/mod`],
            [['İşlemin Niteliği', 'Nature of operation', 'Natureza da operação'], `${inf}/ide/natOp`],
            [['Düzenleme Tarihi', 'Issue date', 'Data de emissão'], `${inf}/ide/dhEmi`],
            [['Çıkış / Giriş Tarihi', 'Exit / entry date', 'Data de saída/entrada'], `${inf}/ide/dhSaiEnt`],
            [['Giriş / Çıkış (0/1)', 'Entry / exit (0/1)', 'Tipo (entrada/saída)'], `${inf}/ide/tpNF`],
            [['Amaç (finNFe)', 'Purpose (finNFe)', 'Finalidade de emissão'], `${inf}/ide/finNFe`],
            [['İlgili NF-e Anahtarı', 'Referenced NF-e key', 'Chave da NF-e referenciada'], `${inf}/ide/NFref/refNFe`],
            ...(proc ? [
                [['Yetki Protokolü', 'Authorisation protocol', 'Protocolo de autorização'], 'protNFe/infProt/nProt'] as Row,
                [['Yetki Tarihi', 'Authorisation date', 'Data de autorização'], 'protNFe/infProt/dhRecbto'] as Row,
            ] : []),
        ]],
        [['Satıcı', 'Issuer', 'Emitente'], brParty(`${inf}/emit`, 'enderEmit', ['Satıcı', 'Issuer', 'emitente'], [
            [['Vergi Rejimi (CRT)', 'Tax regime (CRT)', 'Código de regime tributário'], `${inf}/emit/CRT`],
        ])],
        [['Alıcı', 'Recipient', 'Destinatário'], brParty(`${inf}/dest`, 'enderDest', ['Alıcı', 'Recipient', 'destinatário'], [
            [['Alıcı Belediye Vergi No (IM)', 'Recipient municipal registration', 'Inscrição municipal do destinatário'], `${inf}/dest/IM`],
        ])],
        [['Kalemler', 'Items', 'Produtos / serviços'], [
            [['Sıra No', 'Item no.', 'Nº do item'], `${det}/@nItem`, N],
            [['Ürün Kodu', 'Product code', 'Código do produto'], `${det}/prod/cProd`],
            [['Açıklama', 'Description', 'Descrição'], `${det}/prod/xProd`],
            [['NCM', 'NCM', 'NCM/SH'], `${det}/prod/NCM`],
            [['CFOP', 'CFOP', 'CFOP'], `${det}/prod/CFOP`],
            [['Birim', 'Unit', 'Unidade'], `${det}/prod/uCom`],
            [['Miktar', 'Quantity', 'Quantidade'], `${det}/prod/qCom`, N],
            [['Birim Fiyat', 'Unit price', 'Valor unitário'], `${det}/prod/vUnCom`, A],
            [['Tutar', 'Amount', 'Valor total'], `${det}/prod/vProd`, A],
            [['ICMS CST', 'ICMS CST', 'CST do ICMS'], `${tax}/ICMS/ICMS00/CST`],
            [['ICMS Matrahı', 'ICMS base', 'Base de cálculo do ICMS'], `${tax}/ICMS/ICMS00/vBC`, A],
            [['ICMS Oranı', 'ICMS rate', 'Alíquota do ICMS'], `${tax}/ICMS/ICMS00/pICMS`, N],
            [['ICMS Tutarı', 'ICMS amount', 'Valor do ICMS'], `${tax}/ICMS/ICMS00/vICMS`, A],
            [['PIS Tutarı', 'PIS amount', 'Valor do PIS'], `${tax}/PIS/PISAliq/vPIS`, A],
            [['COFINS Tutarı', 'COFINS amount', 'Valor da COFINS'], `${tax}/COFINS/COFINSAliq/vCOFINS`, A],
            [['IBS/CBS CST', 'IBS/CBS CST', 'CST do IBS/CBS'], `${tax}/IBSCBS/CST`],
            [['Vergi Sınıf Kodu (cClassTrib)', 'Tax classification (cClassTrib)', 'Classificação tributária'], `${tax}/IBSCBS/cClassTrib`],
            [['IBS/CBS Matrahı', 'IBS/CBS base', 'Base de cálculo do IBS/CBS'], `${tax}/IBSCBS/gIBSCBS/vBC`, A],
            [['IBS (Eyalet) Oranı', 'IBS (state) rate', 'Alíquota do IBS UF'], `${tax}/IBSCBS/gIBSCBS/gIBSUF/pIBSUF`, N],
            [['IBS (Eyalet) Tutarı', 'IBS (state) amount', 'Valor do IBS UF'], `${tax}/IBSCBS/gIBSCBS/gIBSUF/vIBSUF`, A],
            [['IBS (Belediye) Tutarı', 'IBS (municipal) amount', 'Valor do IBS municipal'], `${tax}/IBSCBS/gIBSCBS/gIBSMun/vIBSMun`, A],
            [['CBS Oranı', 'CBS rate', 'Alíquota da CBS'], `${tax}/IBSCBS/gIBSCBS/gCBS/pCBS`, N],
            [['CBS Tutarı', 'CBS amount', 'Valor da CBS'], `${tax}/IBSCBS/gIBSCBS/gCBS/vCBS`, A],
            [['Yaklaşık Vergi Yükü', 'Approximate taxes', 'Tributos aproximados'], `${tax}/vTotTrib`, A],
        ]],
        [['Toplamlar', 'Totals', 'Cálculo do imposto'], [
            [['ICMS Matrahı', 'ICMS base', 'Base de cálculo do ICMS'], `${tot}/vBC`, A],
            [['ICMS Toplamı', 'Total ICMS', 'Valor do ICMS'], `${tot}/vICMS`, A],
            [['Ürünler Toplamı', 'Total products', 'Valor total dos produtos'], `${tot}/vProd`, A],
            [['Navlun', 'Freight', 'Valor do frete'], `${tot}/vFrete`, A],
            [['Sigorta', 'Insurance', 'Valor do seguro'], `${tot}/vSeg`, A],
            [['İndirim', 'Discount', 'Desconto'], `${tot}/vDesc`, A],
            [['IPI', 'IPI', 'Valor do IPI'], `${tot}/vIPI`, A],
            [['PIS', 'PIS', 'Valor do PIS'], `${tot}/vPIS`, A],
            [['COFINS', 'COFINS', 'Valor da COFINS'], `${tot}/vCOFINS`, A],
            [['Diğer Giderler', 'Other expenses', 'Outras despesas acessórias'], `${tot}/vOutro`, A],
            [['Fatura Toplamı', 'Invoice total', 'Valor total da nota'], `${tot}/vNF`, A],
            [['Yaklaşık Vergi Toplamı', 'Approximate taxes', 'Valor aproximado dos tributos'], `${tot}/vTotTrib`, A],
            [['IBS/CBS Matrahı', 'IBS/CBS base', 'Base de cálculo do IBS/CBS'], `${rtc}/vBCIBSCBS`, A],
            [['IBS (Eyalet) Toplamı', 'Total IBS (state)', 'Total do IBS UF'], `${rtc}/gIBS/gIBSUF/vIBSUF`, A],
            [['IBS (Belediye) Toplamı', 'Total IBS (municipal)', 'Total do IBS municipal'], `${rtc}/gIBS/gIBSMun/vIBSMun`, A],
            [['IBS Toplamı', 'Total IBS', 'Total do IBS'], `${rtc}/gIBS/vIBS`, A],
            [['CBS Toplamı', 'Total CBS', 'Total da CBS'], `${rtc}/gCBS/vCBS`, A],
        ]],
        [['Taşıma', 'Transport', 'Transportador / volumes'], [
            [['Navlun Şekli', 'Freight mode', 'Modalidade do frete'], `${inf}/transp/modFrete`],
            [['Taşıyıcı CNPJ', 'Carrier CNPJ', 'CNPJ do transportador'], `${inf}/transp/transporta/CNPJ`],
            [['Taşıyıcı Unvanı', 'Carrier name', 'Razão social do transportador'], `${inf}/transp/transporta/xNome`],
            [['Koli Adedi', 'Packages', 'Quantidade de volumes'], `${inf}/transp/vol/qVol`, N],
            [['Ambalaj Türü', 'Package type', 'Espécie'], `${inf}/transp/vol/esp`],
            [['Net Ağırlık', 'Net weight', 'Peso líquido'], `${inf}/transp/vol/pesoL`, N],
            [['Brüt Ağırlık', 'Gross weight', 'Peso bruto'], `${inf}/transp/vol/pesoB`, N],
        ]],
        [['Ödeme', 'Payment', 'Fatura / duplicatas'], [
            [['Fatura No', 'Invoice no.', 'Número da fatura'], `${inf}/cobr/fat/nFat`],
            [['Net Tutar', 'Net amount', 'Valor líquido'], `${inf}/cobr/fat/vLiq`, A],
            [['Taksit No', 'Instalment no.', 'Número da duplicata'], `${inf}/cobr/dup/nDup`],
            [['Vade', 'Due date', 'Vencimento'], `${inf}/cobr/dup/dVenc`],
            [['Taksit Tutarı', 'Instalment amount', 'Valor da duplicata'], `${inf}/cobr/dup/vDup`, A],
            [['Ödeme Aracı', 'Payment means', 'Meio de pagamento'], `${inf}/pag/detPag/tPag`],
            [['Ödenen Tutar', 'Amount paid', 'Valor pago'], `${inf}/pag/detPag/vPag`, A],
            [['Para Üstü', 'Change', 'Troco'], `${inf}/pag/vTroco`, A],
        ]],
        [['Ek Bilgi', 'Additional information', 'Dados adicionais'], [
            [['Tamamlayıcı Bilgi', 'Complementary information', 'Informações complementares'], `${inf}/infAdic/infCpl`],
            [['QR Kod Adresi (NFC-e)', 'QR code URL (NFC-e)', 'QR Code (NFC-e)'], `${nfe}infNFeSupl/qrCode`],
            [['Sorgu Adresi (NFC-e)', 'Lookup URL (NFC-e)', 'URL de consulta (NFC-e)'], `${nfe}infNFeSupl/urlChave`],
        ]],
    ];
};

const brCte = (proc: boolean): Group[] => {
    const inf = `${proc ? 'CTe/' : ''}infCte`;
    const norm = `${inf}/infCTeNorm`;
    return [
        [['Belge', 'Document', 'Conhecimento de transporte'], [
            [['Erişim Anahtarı', 'Access key', 'Chave de acesso'], `${inf}/@Id`],
            [['CT-e No', 'CT-e no.', 'Número'], `${inf}/ide/nCT`, N],
            [['Seri', 'Series', 'Série'], `${inf}/ide/serie`],
            [['CFOP', 'CFOP', 'CFOP'], `${inf}/ide/CFOP`],
            [['İşlemin Niteliği', 'Nature of operation', 'Natureza da operação'], `${inf}/ide/natOp`],
            [['Düzenleme Tarihi', 'Issue date', 'Data de emissão'], `${inf}/ide/dhEmi`],
            [['Taşıma Türü (modal)', 'Transport mode', 'Modal'], `${inf}/ide/modal`],
            [['Hizmet Türü', 'Service type', 'Tipo do serviço'], `${inf}/ide/tpServ`],
            [['CT-e Türü', 'CT-e type', 'Tipo do CT-e'], `${inf}/ide/tpCTe`],
            [['Çıkış Şehri', 'Origin city', 'Início da prestação'], `${inf}/ide/xMunIni`],
            [['Çıkış Eyaleti', 'Origin state', 'UF de início'], `${inf}/ide/UFIni`],
            [['Varış Şehri', 'Destination city', 'Término da prestação'], `${inf}/ide/xMunFim`],
            [['Varış Eyaleti', 'Destination state', 'UF de término'], `${inf}/ide/UFFim`],
            [['Gözlem', 'Remarks', 'Observações'], `${inf}/compl/xObs`],
            ...(proc ? [[['Yetki Protokolü', 'Authorisation protocol', 'Protocolo de autorização'], 'protCTe/infProt/nProt'] as Row] : []),
        ]],
        [['Taşıyıcı', 'Carrier', 'Emitente'], brParty(`${inf}/emit`, 'enderEmit', ['Taşıyıcı', 'Carrier', 'emitente'])],
        [['Gönderen', 'Sender', 'Remetente'], brParty(`${inf}/rem`, 'enderReme', ['Gönderen', 'Sender', 'remetente'], [], 'fone')],
        [['Alıcı', 'Consignee', 'Destinatário'], brParty(`${inf}/dest`, 'enderDest', ['Alıcı', 'Consignee', 'destinatário'], [], 'fone')],
        [['Hizmet Bedeli', 'Service value', 'Componentes do valor da prestação'], [
            [['Bileşen Adı', 'Component', 'Nome do componente'], `${inf}/vPrest/Comp/xNome`],
            [['Bileşen Tutarı', 'Component amount', 'Valor do componente'], `${inf}/vPrest/Comp/vComp`, A],
            [['Hizmet Toplamı', 'Total service value', 'Valor total da prestação'], `${inf}/vPrest/vTPrest`, A],
            [['Tahsil Edilecek', 'Amount receivable', 'Valor a receber'], `${inf}/vPrest/vRec`, A],
        ]],
        [['Vergiler', 'Taxes', 'Informações relativas ao imposto'], [
            [['ICMS CST', 'ICMS CST', 'Situação tributária'], `${inf}/imp/ICMS/ICMS00/CST`],
            [['ICMS Matrahı', 'ICMS base', 'Base de cálculo'], `${inf}/imp/ICMS/ICMS00/vBC`, A],
            [['ICMS Oranı', 'ICMS rate', 'Alíquota do ICMS'], `${inf}/imp/ICMS/ICMS00/pICMS`, N],
            [['ICMS Tutarı', 'ICMS amount', 'Valor do ICMS'], `${inf}/imp/ICMS/ICMS00/vICMS`, A],
            [['IBS Tutarı', 'IBS amount', 'Valor do IBS'], `${inf}/imp/IBSCBS/gIBSCBS/vIBS`, A],
            [['CBS Tutarı', 'CBS amount', 'Valor da CBS'], `${inf}/imp/IBSCBS/gIBSCBS/gCBS/vCBS`, A],
            [['Yaklaşık Vergi Yükü', 'Approximate taxes', 'Tributos aproximados'], `${inf}/imp/vTotTrib`, A],
        ]],
        [['Yük', 'Cargo', 'Informações da carga'], [
            [['Yük Değeri', 'Cargo value', 'Valor da carga'], `${norm}/infCarga/vCarga`, A],
            [['Ana Ürün', 'Main product', 'Produto predominante'], `${norm}/infCarga/proPred`],
            [['Ölçü Türü', 'Measure type', 'Tipo de medida'], `${norm}/infCarga/infQ/tpMed`],
            [['Miktar', 'Quantity', 'Quantidade'], `${norm}/infCarga/infQ/qCarga`, N],
            [['Taşınan NF-e Anahtarı', 'Carried NF-e key', 'Chave da NF-e transportada'], `${norm}/infDoc/infNFe/chave`],
            [['RNTRC', 'RNTRC', 'RNTRC'], `${norm}/infModal/rodo/RNTRC`],
        ]],
    ];
};

const NFSE_DPS = 'infNFSe/DPS/infDPS';
const NFSE: Group[] = [
    [['Belge', 'Document', 'NFS-e'], [
        [['Erişim Anahtarı', 'Access key', 'Chave de acesso'], 'infNFSe/@Id'],
        [['NFS-e No', 'NFS-e no.', 'Número da NFS-e'], 'infNFSe/nNFSe', N],
        [['İşlem Tarihi', 'Processing date', 'Data/hora da emissão da NFS-e'], 'infNFSe/dhProc'],
        [['DPS No', 'DPS no.', 'Número da DPS'], `${NFSE_DPS}/nDPS`, N],
        [['DPS Serisi', 'DPS series', 'Série da DPS'], `${NFSE_DPS}/serie`],
        [['DPS Tarihi', 'DPS date', 'Data/hora da emissão da DPS'], `${NFSE_DPS}/dhEmi`],
        [['Hizmet Dönemi', 'Service period', 'Competência'], `${NFSE_DPS}/dCompet`],
        [['Düzenlendiği Yer', 'Place of issue', 'Município emissor'], 'infNFSe/xLocEmi'],
        [['Hizmet Yeri', 'Place of service', 'Local da prestação'], 'infNFSe/xLocPrestacao'],
        [['Vergilendirme Yeri', 'Place of taxation', 'Município de incidência'], 'infNFSe/xLocIncid'],
        [['Ulusal Vergi Kodu Açıklaması', 'National tax code description', 'Descrição do código de tributação nacional'], 'infNFSe/xTribNac'],
    ]],
    [['Hizmet Veren', 'Provider', 'Prestador do serviço'], [
        [['Hizmet Veren CNPJ', 'Provider CNPJ', 'CNPJ do prestador'], 'infNFSe/emit/CNPJ'],
        [['Hizmet Veren Belediye Vergi No (IM)', 'Provider municipal registration', 'Inscrição municipal do prestador'], 'infNFSe/emit/IM'],
        [['Hizmet Veren Unvanı', 'Provider name', 'Nome / razão social do prestador'], 'infNFSe/emit/xNome'],
        [['Hizmet Veren Cadde', 'Provider street', 'Logradouro do prestador'], 'infNFSe/emit/enderNac/xLgr'],
        [['Hizmet Veren Bina No', 'Provider number', 'Número do prestador'], 'infNFSe/emit/enderNac/nro'],
        [['Hizmet Veren Mahalle', 'Provider district', 'Bairro do prestador'], 'infNFSe/emit/enderNac/xBairro'],
        [['Hizmet Veren Eyalet', 'Provider state', 'UF do prestador'], 'infNFSe/emit/enderNac/UF'],
        [['Hizmet Veren Posta Kodu', 'Provider postcode', 'CEP do prestador'], 'infNFSe/emit/enderNac/CEP'],
        [['Hizmet Veren Telefon', 'Provider phone', 'Telefone do prestador'], 'infNFSe/emit/fone'],
        [['Hizmet Veren E-posta', 'Provider e-mail', 'E-mail do prestador'], 'infNFSe/emit/email'],
    ]],
    [['Hizmet Alan', 'Customer', 'Tomador do serviço'], [
        [['Hizmet Alan CNPJ', 'Customer CNPJ', 'CNPJ do tomador'], `${NFSE_DPS}/toma/CNPJ`],
        [['Hizmet Alan CPF', 'Customer CPF', 'CPF do tomador'], `${NFSE_DPS}/toma/CPF`],
        [['Hizmet Alan Belediye Vergi No (IM)', 'Customer municipal registration', 'Inscrição municipal do tomador'], `${NFSE_DPS}/toma/IM`],
        [['Hizmet Alan Unvanı', 'Customer name', 'Nome / razão social do tomador'], `${NFSE_DPS}/toma/xNome`],
        [['Hizmet Alan Cadde', 'Customer street', 'Logradouro do tomador'], `${NFSE_DPS}/toma/end/xLgr`],
        [['Hizmet Alan Bina No', 'Customer number', 'Número do tomador'], `${NFSE_DPS}/toma/end/nro`],
        [['Hizmet Alan Mahalle', 'Customer district', 'Bairro do tomador'], `${NFSE_DPS}/toma/end/xBairro`],
        [['Hizmet Alan Posta Kodu', 'Customer postcode', 'CEP do tomador'], `${NFSE_DPS}/toma/end/endNac/CEP`],
        [['Hizmet Alan Telefon', 'Customer phone', 'Telefone do tomador'], `${NFSE_DPS}/toma/fone`],
        [['Hizmet Alan E-posta', 'Customer e-mail', 'E-mail do tomador'], `${NFSE_DPS}/toma/email`],
    ]],
    [['Hizmet', 'Service', 'Serviço prestado'], [
        [['Ulusal Vergi Kodu', 'National tax code', 'Código de tributação nacional'], `${NFSE_DPS}/serv/cServ/cTribNac`],
        [['Hizmet Açıklaması', 'Service description', 'Descrição do serviço'], `${NFSE_DPS}/serv/cServ/xDescServ`],
        [['NBS Kodu', 'NBS code', 'Código NBS'], `${NFSE_DPS}/serv/cServ/cNBS`],
        [['Sipariş No', 'Order no.', 'Número do pedido'], `${NFSE_DPS}/serv/infoCompl/xPed`],
        [['Ek Bilgi', 'Additional information', 'Informações complementares'], `${NFSE_DPS}/serv/infoCompl/xInfComp`],
    ]],
    [['Tutarlar', 'Amounts', 'Valores e tributação'], [
        [['Hizmet Bedeli', 'Service value', 'Valor do serviço'], `${NFSE_DPS}/valores/vServPrest/vServ`, A],
        [['ISSQN Matrahı', 'ISSQN base', 'Base de cálculo do ISSQN'], 'infNFSe/valores/vBC', A],
        [['ISSQN Oranı', 'ISSQN rate', 'Alíquota aplicada'], 'infNFSe/valores/pAliqAplic', N],
        [['ISSQN Tutarı', 'ISSQN amount', 'ISSQN apurado'], 'infNFSe/valores/vISSQN', A],
        [['Toplam Stopaj', 'Total withheld', 'Total das retenções'], 'infNFSe/valores/vTotalRet', A],
        [['Net Tutar', 'Net amount', 'Valor líquido da NFS-e'], 'infNFSe/valores/vLiq', A],
        [['PIS', 'PIS', 'PIS'], `${NFSE_DPS}/valores/trib/tribFed/piscofins/vPis`, A],
        [['COFINS', 'COFINS', 'COFINS'], `${NFSE_DPS}/valores/trib/tribFed/piscofins/vCofins`, A],
        [['Yaklaşık Federal Vergi', 'Approx. federal taxes', 'Tributos federais aproximados'], `${NFSE_DPS}/valores/trib/totTrib/vTotTrib/vTotTribFed`, A],
        [['Yaklaşık Eyalet Vergisi', 'Approx. state taxes', 'Tributos estaduais aproximados'], `${NFSE_DPS}/valores/trib/totTrib/vTotTrib/vTotTribEst`, A],
        [['Yaklaşık Belediye Vergisi', 'Approx. municipal taxes', 'Tributos municipais aproximados'], `${NFSE_DPS}/valores/trib/totTrib/vTotTrib/vTotTribMun`, A],
    ]],
    [['IBS / CBS', 'IBS / CBS', 'Tributação IBS / CBS'], [
        [['IBS/CBS Matrahı', 'IBS/CBS base', 'Base de cálculo do IBS/CBS'], 'infNFSe/IBSCBS/valores/vBC', A],
        [['IBS (Eyalet) Oranı', 'IBS (state) rate', 'Alíquota do IBS UF'], 'infNFSe/IBSCBS/valores/uf/pIBSUF', N],
        [['CBS Oranı', 'CBS rate', 'Alíquota da CBS'], 'infNFSe/IBSCBS/valores/fed/pCBS', N],
        [['IBS Toplamı', 'Total IBS', 'Valor total do IBS'], 'infNFSe/IBSCBS/totCIBS/gIBS/vIBSTot', A],
        [['CBS Toplamı', 'Total CBS', 'Valor total da CBS'], 'infNFSe/IBSCBS/totCIBS/gCBS/vCBS', A],
        [['NFS-e Toplamı (IBS/CBS dahil)', 'NFS-e total (incl. IBS/CBS)', 'Valor total da NFS-e'], 'infNFSe/IBSCBS/totCIBS/vTotNF', A],
    ]],
];

const CATALOGS: Record<NationalRoot, { native: DocLanguage; groups: Group[] }> = {
    Файл: { native: 'ru', groups: RU },
    GSTInvoice: { native: 'hi', groups: IN_INVOICE },
    EWayBill: { native: 'hi', groups: IN_EWB },
    EInvoice: { native: 'zh', groups: CN },
    nfeProc: { native: 'pt', groups: brNfe(true) },
    NFe: { native: 'pt', groups: brNfe(false) },
    cteProc: { native: 'pt', groups: brCte(true) },
    CTe: { native: 'pt', groups: brCte(false) },
    NFSe: { native: 'pt', groups: NFSE },
};

export const NATIONAL_ROOTS = Object.keys(CATALOGS) as NationalRoot[];

const ROOT_RE = /<(Файл|GSTInvoice|EWayBill|EInvoice|nfeProc|NFe|cteProc|CTe|NFSe)[\s>/]/;

/** XML'in ulusal kökü (ilk eleman); değilse null. */
export function nationalRootOf(xml: string): NationalRoot | null {
    const body = xml.replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '');
    const m = body.match(/<([^\s>/!?]+)/);
    return m && ROOT_RE.test(`<${m[1]} `) ? m[1] as NationalRoot : null;
}

const cache = new Map<string, CatalogField[]>();

export function nationalCatalog(root: NationalRoot, lang: DocLanguage): CatalogField[] {
    const id = `${root}:${lang}`;
    const hit = cache.get(id);
    if (hit) return hit;
    const { native, groups } = CATALOGS[root];
    const pick = (t: Text) => (lang === 'tr' ? t[0] : lang === native ? t[2] : t[1]);
    const fields = groups.flatMap(([category, rows]) => rows.map(([label, path, format]): CatalogField => ({
        key: `${root}/${path}`,
        label: pick(label),
        category: pick(category),
        path: `${root}/${path}`,
        format: format ?? 'text',
    })));
    cache.set(id, fields);
    return fields;
}
