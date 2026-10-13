/**
 * Ulusal biçimlerin (ФНС УПД 5.03, GST e-Invoice, e-Way Bill, 数电票) alan kataloğu.
 * Etiketler Türkçe, İngilizce ve belgenin yerel dilinde; diğer dillerde İngilizce.
 * Yollar namespace'siz yerel adlardır (fieldCatalog yol sözdizimi).
 */
import type { DocLanguage } from '../international/registry/docLanguages';
import type { CatalogField, CatalogFormat } from './fieldCatalog';

export type NationalRoot = 'Файл' | 'GSTInvoice' | 'EWayBill' | 'EInvoice';

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

const CATALOGS: Record<NationalRoot, { native: DocLanguage; groups: Group[] }> = {
    Файл: { native: 'ru', groups: RU },
    GSTInvoice: { native: 'hi', groups: IN_INVOICE },
    EWayBill: { native: 'hi', groups: IN_EWB },
    EInvoice: { native: 'zh', groups: CN },
};

export const NATIONAL_ROOTS = Object.keys(CATALOGS) as NationalRoot[];

const ROOT_RE = /<(Файл|GSTInvoice|EWayBill|EInvoice)[\s>/]/;

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
