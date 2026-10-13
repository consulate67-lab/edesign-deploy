// Yabancı dil tanıtım e-postalarını üretir: node marketing/build-intl-brochures.mjs
// Her ülkeye kendi resmî formatı öne çıkarılarak yazılır; EN 16931 yalnız Avrupa'yı kapsar.
// Türkçe broşür (email-tanitim.html) elle bakılır; buradaki metinler değişince betiği yeniden çalıştırın.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://www.edxdocu.com/';
const MAIL = 'destek@edxdocu.com';

const LATIN = 'Arial,Helvetica,sans-serif';
const FONTS = {
    zh: "Arial,'Microsoft YaHei','PingFang SC','Noto Sans SC',sans-serif",
    hi: "Arial,'Nirmala UI','Noto Sans Devanagari',sans-serif",
};

const FORMATS = [
    'EN 16931 (UBL)', 'Peppol BIS Billing 3.0', 'XRechnung 3.0', 'CIUS-RO', 'HR CIUS', 'CIUS-PT', 'Peppol Despatch Advice',
    'DBNAlliance (US)', 'NF-e · NFS-e · CT-e (BR)', 'GST e-Invoice · e-Way Bill (IN)', 'FNS UPD 5.03 (RU)', '数电发票 (CN)', 'UBL-TR (TR)',
];

const T = {
    en: {
        subject: 'Your e-invoice layout, ready in minutes – EN 16931 & Peppol',
        title: 'edXdocu · Your e-invoice layout, ready in minutes',
        preheader: 'Design EN 16931, Peppol and XRechnung invoice layouts with drag and drop. No XSLT needed.',
        badge: 'NEW · e-Document Designer',
        h1: 'Your e-invoice layout,<br>ready in minutes',
        sub: '<strong>EN 16931, Peppol BIS 3 and XRechnung</strong> compliant – ready for 38 countries, including national formats for the USA, Brazil, India, China and Russia.<br>No XSLT, just drag and drop.',
        cta1: 'Try it now',
        stats: [['38', 'countries'], ['EN 16931', 'Peppol BIS 3 · XRechnung'], ['100%', 'web-based, no installation']],
        whatLabel: 'WHAT DOES IT DO?',
        whatTitle: 'Your invoice, in your brand',
        whatText: 'Your logo, stamp, bank details and item table –<br class="hide-sm"> each placed exactly where you want with drag and drop.',
        inv: {
            logo: 'YOUR LOGO', company: 'Sample Office Supplies Ltd.', taxId: 'VAT ID: GB123456789', doc: 'Invoice',
            no: 'No: INV-2026-000123', date: 'Date: 13/10/2026', cols: ['Item / Service', 'Qty', 'Amount'],
            items: [['A4 copy paper', '2 boxes'], ['Toner', '1 pc']], bank: 'Bank details', bankValue: 'IBAN: XX00 0000 0000 0000 0000 00', stamp: 'STAMP',
        },
        howLabel: 'HOW IT WORKS',
        howTitle: 'Ready in 3 steps',
        steps: [
            ['Pick the country and document', 'The wizard lists the local documents with the right XML profile. Start from a ready template or upload your own XSLT.'],
            ['Add your logo, stamp and bank details', 'Drag and drop the fields; adjust colours, fonts and layout visually.'],
            ['Preview with your XML, then download', 'See the result instantly with a real invoice and load the XSLT into your e-invoicing or Peppol platform.'],
        ],
        features: [
            ['Drag & Drop', 'No XSLT or coding needed.'],
            ['EN 16931 & Peppol', 'Peppol BIS 3, XRechnung 3.0 and core rule checks.'],
            ['Live Preview', 'See every change with your own XML.'],
            ['Local Labels', 'Labels in the country’s language, or in English.'],
        ],
        formatsTitle: 'One editor, 38 countries',
        who: '<strong>Who is it for?</strong> Peppol access points, e-invoicing providers, ERP and accounting software vendors, accountants<br class="hide-sm"> and every company that wants to send invoices in its own brand.',
        finalTitle: 'Create your first layout today',
        finalText: 'Open an account, pick a template, see the result in minutes.',
        cta2: 'Create account',
        brand: 'edXdocu · e-Document Designer',
        legal: [
            'This informational email was sent to your business because it may be relevant to your field of activity.',
            'If you prefer not to receive it, you can {link}unsubscribe with one click{/link}; your request is applied immediately.',
            'To learn the source of your address or have it deleted from our records, write to {mail}.',
        ],
    },
    de: {
        subject: 'Ihr E-Rechnungs-Layout in wenigen Minuten – EN 16931 & Peppol',
        title: 'edXdocu · Ihr E-Rechnungs-Layout in wenigen Minuten',
        preheader: 'Gestalten Sie EN 16931-, Peppol- und XRechnung-Layouts per Drag & Drop – ganz ohne XSLT.',
        badge: 'NEU · E-Beleg-Designer',
        h1: 'Ihr E-Rechnungs-Layout –<br>fertig in wenigen Minuten',
        sub: 'Konform mit <strong>EN 16931, Peppol BIS 3 und XRechnung</strong> – bereit für 38 Länder, inklusive nationaler Formate für die USA, Brasilien, Indien, China und Russland.<br>Ohne XSLT, einfach per Drag & Drop.',
        cta1: 'Jetzt ausprobieren',
        stats: [['38', 'Länder'], ['EN 16931', 'Peppol BIS 3 · XRechnung'], ['100 %', 'webbasiert, keine Installation']],
        whatLabel: 'WOFÜR?',
        whatTitle: 'Ihre Rechnung in Ihrem Design',
        whatText: 'Logo, Stempel, Bankverbindung und Positionstabelle –<br class="hide-sm"> alles per Drag & Drop genau dort, wo Sie es möchten.',
        inv: {
            logo: 'IHR LOGO', company: 'Muster Bürobedarf GmbH', taxId: 'USt-IdNr.: DE123456789', doc: 'Rechnung',
            no: 'Nr.: RE-2026-000123', date: 'Datum: 13.10.2026', cols: ['Artikel / Leistung', 'Menge', 'Betrag'],
            items: [['Kopierpapier A4', '2 Kartons'], ['Toner', '1 Stück']], bank: 'Bankverbindung', bankValue: 'IBAN: DE00 0000 0000 0000 0000 00', stamp: 'STEMPEL',
        },
        howLabel: 'SO FUNKTIONIERT ES',
        howTitle: 'In 3 Schritten fertig',
        steps: [
            ['Land und Beleg wählen', 'Der Assistent listet die landesüblichen Belege mit dem passenden XML-Profil. Starten Sie mit einer Vorlage oder laden Sie Ihr eigenes XSLT hoch.'],
            ['Logo, Stempel und Bankverbindung hinzufügen', 'Felder per Drag & Drop platzieren; Farben, Schriften und Layout direkt sichtbar anpassen.'],
            ['Mit eigenem XML prüfen und herunterladen', 'Sehen Sie das Ergebnis sofort mit einer echten Rechnung und laden Sie das XSLT in Ihre E-Rechnungs- oder Peppol-Plattform.'],
        ],
        features: [
            ['Drag & Drop', 'Kein XSLT- oder Programmierwissen nötig.'],
            ['EN 16931 & Peppol', 'Peppol BIS 3, XRechnung 3.0 und Prüfung der Kernregeln.'],
            ['Live-Vorschau', 'Jede Änderung sofort mit Ihrem eigenen XML.'],
            ['Landessprache', 'Beschriftungen in der Landessprache oder auf Englisch.'],
        ],
        formatsTitle: 'Ein Editor, 38 Länder',
        who: '<strong>Für wen?</strong> Peppol Access Points, E-Rechnungs-Dienstleister, ERP- und Buchhaltungssoftware-Anbieter, Steuerberater<br class="hide-sm"> und alle Unternehmen, die Rechnungen in ihrem eigenen Design versenden möchten.',
        finalTitle: 'Erstellen Sie heute Ihr erstes Layout',
        finalText: 'Konto eröffnen, Vorlage wählen, Ergebnis in wenigen Minuten sehen.',
        cta2: 'Konto erstellen',
        brand: 'edXdocu · E-Beleg-Designer',
        legal: [
            'Diese Informations-E-Mail wurde an Ihr Unternehmen gesendet, da sie für Ihren Tätigkeitsbereich relevant sein könnte.',
            'Wenn Sie keine weiteren E-Mails wünschen, können Sie sich {link}mit einem Klick abmelden{/link}; Ihre Anfrage wird sofort umgesetzt.',
            'Um die Herkunft Ihrer Adresse zu erfahren oder deren Löschung zu verlangen, schreiben Sie an {mail}.',
        ],
    },
    fr: {
        subject: 'Votre modèle de facture électronique prêt en quelques minutes – EN 16931 & Peppol',
        title: 'edXdocu · Votre modèle de facture électronique en quelques minutes',
        preheader: 'Concevez vos modèles EN 16931, Peppol et XRechnung par glisser-déposer, sans XSLT.',
        badge: 'NOUVEAU · Concepteur d’e-documents',
        h1: 'Votre modèle de facture<br>électronique en quelques minutes',
        sub: 'Conforme <strong>EN 16931, Peppol BIS 3 et XRechnung</strong> – prêt pour 38 pays, y compris les formats nationaux des États-Unis, du Brésil, de l’Inde, de la Chine et de la Russie.<br>Sans XSLT, par simple glisser-déposer.',
        cta1: 'Essayer maintenant',
        stats: [['38', 'pays'], ['EN 16931', 'Peppol BIS 3 · XRechnung'], ['100 %', 'en ligne, sans installation']],
        whatLabel: 'À QUOI ÇA SERT ?',
        whatTitle: 'Votre facture, à votre image',
        whatText: 'Votre logo, votre cachet, vos coordonnées bancaires et le tableau des lignes –<br class="hide-sm"> chaque élément placé où vous voulez par glisser-déposer.',
        inv: {
            logo: 'VOTRE LOGO', company: 'Exemple Fournitures SARL', taxId: 'N° TVA : FR12345678901', doc: 'Facture',
            no: 'N° : FA-2026-000123', date: 'Date : 13/10/2026', cols: ['Article / Service', 'Qté', 'Montant'],
            items: [['Papier A4', '2 cartons'], ['Toner', '1 unité']], bank: 'Coordonnées bancaires', bankValue: 'IBAN : FR00 0000 0000 0000 0000 0000 000', stamp: 'CACHET',
        },
        howLabel: 'COMMENT ÇA MARCHE ?',
        howTitle: 'Prêt en 3 étapes',
        steps: [
            ['Choisissez le pays et le document', 'L’assistant liste les documents locaux avec le bon profil XML. Partez d’un modèle prêt à l’emploi ou importez votre propre XSLT.'],
            ['Ajoutez logo, cachet et coordonnées bancaires', 'Glissez-déposez les champs ; ajustez couleurs, polices et mise en page en direct.'],
            ['Prévisualisez avec votre XML, puis téléchargez', 'Voyez le résultat immédiatement avec une vraie facture et chargez le XSLT dans votre plateforme de facturation électronique ou Peppol.'],
        ],
        features: [
            ['Glisser-déposer', 'Aucune connaissance XSLT ni code requise.'],
            ['EN 16931 & Peppol', 'Peppol BIS 3, XRechnung 3.0 et contrôle des règles de base.'],
            ['Aperçu en direct', 'Chaque modification visible avec votre propre XML.'],
            ['Libellés locaux', 'Libellés dans la langue du pays, ou en anglais.'],
        ],
        formatsTitle: 'Un éditeur, 38 pays',
        who: '<strong>Pour qui ?</strong> Points d’accès Peppol, plateformes de facturation électronique, éditeurs d’ERP et de logiciels comptables, experts-comptables<br class="hide-sm"> et toute entreprise qui souhaite envoyer ses factures à son image.',
        finalTitle: 'Créez votre premier modèle dès aujourd’hui',
        finalText: 'Ouvrez un compte, choisissez un modèle, voyez le résultat en quelques minutes.',
        cta2: 'Créer un compte',
        brand: 'edXdocu · Concepteur d’e-documents',
        legal: [
            'Cet e-mail d’information a été envoyé à votre entreprise car il peut concerner votre domaine d’activité.',
            'Si vous ne souhaitez plus le recevoir, vous pouvez {link}vous désinscrire en un clic{/link} ; votre demande est appliquée immédiatement.',
            'Pour connaître l’origine de votre adresse ou demander sa suppression de nos fichiers, écrivez à {mail}.',
        ],
    },
    es: {
        subject: 'Su diseño de factura electrónica, listo en minutos – EN 16931 y Peppol',
        title: 'edXdocu · Su diseño de factura electrónica, listo en minutos',
        preheader: 'Diseñe plantillas EN 16931, Peppol y XRechnung arrastrando y soltando, sin XSLT.',
        badge: 'NUEVO · Diseñador de e-documentos',
        h1: 'Su diseño de factura electrónica,<br>listo en minutos',
        sub: 'Conforme a <strong>EN 16931, Peppol BIS 3 y XRechnung</strong>: listo para 38 países, incluidos los formatos nacionales de EE. UU., Brasil, India, China y Rusia.<br>Sin XSLT, solo arrastrar y soltar.',
        cta1: 'Pruébelo ahora',
        stats: [['38', 'países'], ['EN 16931', 'Peppol BIS 3 · XRechnung'], ['100 %', 'web, sin instalación']],
        whatLabel: '¿PARA QUÉ SIRVE?',
        whatTitle: 'Su factura, con su imagen',
        whatText: 'Su logotipo, sello, datos bancarios y tabla de líneas:<br class="hide-sm"> todo se coloca donde quiera arrastrando y soltando.',
        inv: {
            logo: 'SU LOGOTIPO', company: 'Ejemplo Suministros S.L.', taxId: 'NIF: ESB12345678', doc: 'Factura',
            no: 'N.º: FAC-2026-000123', date: 'Fecha: 13/10/2026', cols: ['Artículo / Servicio', 'Cant.', 'Importe'],
            items: [['Papel A4', '2 cajas'], ['Tóner', '1 ud.']], bank: 'Datos bancarios', bankValue: 'IBAN: ES00 0000 0000 0000 0000 0000', stamp: 'SELLO',
        },
        howLabel: '¿CÓMO FUNCIONA?',
        howTitle: 'Listo en 3 pasos',
        steps: [
            ['Elija el país y el documento', 'El asistente muestra los documentos locales con el perfil XML adecuado. Empiece con una plantilla o suba su propio XSLT.'],
            ['Añada logotipo, sello y datos bancarios', 'Arrastre y suelte los campos; ajuste colores, fuentes y diseño viendo el resultado.'],
            ['Previsualice con su XML y descargue', 'Vea el resultado al instante con una factura real y cargue el XSLT en su plataforma de facturación electrónica o Peppol.'],
        ],
        features: [
            ['Arrastrar y soltar', 'No necesita saber XSLT ni programar.'],
            ['EN 16931 y Peppol', 'Peppol BIS 3, XRechnung 3.0 y verificación de reglas básicas.'],
            ['Vista previa en vivo', 'Vea cada cambio con su propio XML.'],
            ['Etiquetas locales', 'Etiquetas en el idioma del país o en inglés.'],
        ],
        formatsTitle: 'Un editor, 38 países',
        who: '<strong>¿Para quién?</strong> Puntos de acceso Peppol, proveedores de facturación electrónica, fabricantes de ERP y software contable, asesorías<br class="hide-sm"> y cualquier empresa que quiera enviar sus facturas con su propia imagen.',
        finalTitle: 'Cree su primer diseño hoy',
        finalText: 'Abra una cuenta, elija una plantilla y vea el resultado en minutos.',
        cta2: 'Crear cuenta',
        brand: 'edXdocu · Diseñador de e-documentos',
        legal: [
            'Este correo informativo se ha enviado a su empresa porque puede ser de interés para su sector de actividad.',
            'Si no desea recibir más mensajes, puede {link}darse de baja con un clic{/link}; su solicitud se aplica de inmediato.',
            'Para conocer el origen de su dirección o solicitar su eliminación de nuestros registros, escriba a {mail}.',
        ],
    },
    ru: {
        subject: 'Макет УПД за несколько минут – формат ФНС 5.03',
        title: 'edXdocu · Макет УПД за несколько минут',
        preheader: 'Оформляйте УПД по формату ФНС 5.03 перетаскиванием – без XSLT. Для Европы – EN 16931 и Peppol.',
        badge: 'НОВИНКА · Конструктор e-документов',
        h1: 'Ваш макет УПД –<br>за несколько минут',
        sub: 'Макеты <strong>УПД по формату ФНС 5.03</strong> (счёт-фактура и передаточный документ), а также EN 16931 и Peppol для Европы и национальные форматы США, Бразилии, Индии и Китая – всего 38 стран.<br>Без XSLT – простым перетаскиванием.',
        cta1: 'Попробовать',
        stats: [['38', 'стран'], ['УПД 5.03', 'формат ФНС России'], ['100%', 'онлайн, без установки']],
        whatLabel: 'ДЛЯ ЧЕГО?',
        whatTitle: 'Ваш счёт в вашем фирменном стиле',
        whatText: 'Логотип, печать, банковские реквизиты и таблица позиций –<br class="hide-sm"> всё размещается там, где нужно, перетаскиванием.',
        inv: {
            logo: 'ВАШ ЛОГОТИП', company: 'ООО «Пример Канцтовары»', taxId: 'ИНН: 7701234567', doc: 'Счёт-фактура',
            no: '№ СФ-2026-000123', date: 'Дата: 13.10.2026', cols: ['Товар / услуга', 'Кол-во', 'Сумма'],
            items: [['Бумага A4', '2 коробки'], ['Тонер', '1 шт.']], bank: 'Банковские реквизиты', bankValue: 'Р/с: 4070 2810 0000 0000 0000', stamp: 'ПЕЧАТЬ',
        },
        howLabel: 'КАК ЭТО РАБОТАЕТ?',
        howTitle: 'Готово за 3 шага',
        steps: [
            ['Выберите страну и документ', 'Мастер покажет местные документы с нужным XML-профилем. Начните с готового шаблона или загрузите свой XSLT.'],
            ['Добавьте логотип, печать и реквизиты', 'Перетаскивайте поля; настраивайте цвета, шрифты и макет, сразу видя результат.'],
            ['Проверьте на своём XML и скачайте', 'Сразу увидите результат на реальном документе и загрузите XSLT в свою систему ЭДО или учётную систему.'],
        ],
        features: [
            ['Перетаскивание', 'Знание XSLT и программирования не требуется.'],
            ['УПД 5.03 (ФНС)', 'Счёт-фактура и передаточный документ по XSD ФНС; для Европы – EN 16931 и Peppol.'],
            ['Предпросмотр', 'Каждое изменение сразу видно на вашем XML.'],
            ['Местный язык', 'Подписи на языке страны или на английском.'],
        ],
        formatsTitle: 'Один редактор, 38 стран',
        who: '<strong>Для кого?</strong> Операторы ЭДО, разработчики ERP и учётных систем, бухгалтеры<br class="hide-sm"> и любая компания, которая хочет оформлять документы в своём фирменном стиле.',
        finalTitle: 'Создайте первый макет уже сегодня',
        finalText: 'Откройте аккаунт, выберите шаблон и увидите результат через несколько минут.',
        cta2: 'Создать аккаунт',
        brand: 'edXdocu · Конструктор электронных документов',
        legal: [
            'Это информационное письмо отправлено вашей компании, так как оно может быть полезно для вашей сферы деятельности.',
            'Если вы не хотите получать такие письма, вы можете {link}отписаться одним щелчком{/link}; запрос выполняется сразу.',
            'Чтобы узнать источник вашего адреса или попросить удалить его из наших записей, напишите на {mail}.',
        ],
    },
    zh: {
        subject: '几分钟完成数电发票版式设计 – GB/T 42965',
        title: 'edXdocu · 几分钟完成数电发票版式设计',
        preheader: '拖放即可设计数电发票（GB/T 42965）版式，无需 XSLT；欧洲业务另支持 EN 16931 和 Peppol。',
        badge: '全新 · 电子单据设计器',
        h1: '您的数电发票版式，<br>几分钟即可完成',
        sub: '支持 <strong>数电发票（GB/T 42965）</strong>，同时覆盖欧洲的 EN 16931 / Peppol 以及美国、巴西、印度和俄罗斯的本国格式，共 38 个国家。<br>无需 XSLT，拖放即可。',
        cta1: '立即试用',
        stats: [['38', '个国家'], ['数电发票', 'GB/T 42965'], ['100%', '网页版，无需安装']],
        whatLabel: '能做什么？',
        whatTitle: '体现您品牌的发票',
        whatText: '您的标志、印章、银行信息和明细表格——<br class="hide-sm">拖放即可放到任何位置。',
        inv: {
            logo: '您的标志', company: '示例办公用品有限公司', taxId: '税号：91110000MA0000000X', doc: '发票',
            no: '编号：INV-2026-000123', date: '日期：2026-10-13', cols: ['商品 / 服务', '数量', '金额'],
            items: [['A4 复印纸', '2 箱'], ['墨粉', '1 个']], bank: '银行信息', bankValue: '账号：0000 0000 0000 0000', stamp: '印章',
        },
        howLabel: '如何使用？',
        howTitle: '三步完成',
        steps: [
            ['选择国家和单据', '向导会列出当地单据及对应的 XML 规范。可从现成模板开始，也可上传您自己的 XSLT。'],
            ['添加标志、印章和银行信息', '拖放字段，直观调整颜色、字体和版式。'],
            ['用您的 XML 预览并下载', '用真实发票即时查看效果，然后将 XSLT 导入您的电子发票或 ERP 系统。'],
        ],
        features: [
            ['拖放设计', '无需 XSLT 或编程知识。'],
            ['数电发票', '按 GB/T 42965 结构设计版式；欧洲业务另支持 EN 16931 与 Peppol。'],
            ['实时预览', '每次修改都能用您自己的 XML 查看。'],
            ['本地语言标签', '标签可使用该国语言或英语。'],
        ],
        formatsTitle: '一个编辑器，覆盖 38 个国家',
        who: '<strong>适用对象：</strong>电子发票服务商、ERP 和财务软件厂商、会计师事务所，<br class="hide-sm">以及所有希望以自有品牌输出发票的企业。',
        finalTitle: '今天就创建您的第一个版式',
        finalText: '开通账户，选择模板，几分钟内即可看到效果。',
        cta2: '创建账户',
        brand: 'edXdocu · 电子单据设计器',
        legal: [
            '本信息邮件发送给贵公司，因为其内容可能与贵公司的业务领域相关。',
            '如不希望再收到此类邮件，您可以{link}一键退订{/link}，退订请求将立即生效。',
            '如需了解您的邮箱地址来源或要求从我们的记录中删除，请发送邮件至 {mail}。',
        ],
    },
    hi: {
        subject: 'आपका GST ई-इनवॉइस लेआउट, कुछ ही मिनटों में',
        title: 'edXdocu · आपका GST ई-इनवॉइस लेआउट, कुछ ही मिनटों में',
        preheader: 'ड्रैग-एंड-ड्रॉप से GST ई-इनवॉइस (INV-01) और ई-वे बिल लेआउट बनाएँ – XSLT की ज़रूरत नहीं।',
        badge: 'नया · ई-दस्तावेज़ डिज़ाइनर',
        h1: 'आपका GST ई-इनवॉइस लेआउट,<br>कुछ ही मिनटों में तैयार',
        sub: '<strong>GST ई-इनवॉइस (INV-01) और ई-वे बिल</strong> के लिए तैयार – साथ ही यूरोप के लिए EN 16931 / Peppol और अमेरिका, ब्राज़ील, चीन व रूस के राष्ट्रीय फ़ॉर्मेट: कुल 38 देश।<br>XSLT के बिना, बस ड्रैग-एंड-ड्रॉप।',
        cta1: 'अभी आज़माएँ',
        stats: [['38', 'देश'], ['GST', 'ई-इनवॉइस · ई-वे बिल'], ['100%', 'वेब-आधारित, कोई इंस्टॉलेशन नहीं']],
        whatLabel: 'यह क्या करता है?',
        whatTitle: 'आपका इनवॉइस, आपके ब्रांड में',
        whatText: 'आपका लोगो, मुहर, बैंक विवरण और आइटम तालिका –<br class="hide-sm"> सब कुछ ड्रैग-एंड-ड्रॉप से जहाँ चाहें वहाँ।',
        inv: {
            logo: 'आपका लोगो', company: 'सैंपल ऑफ़िस सप्लाइज़ प्रा. लि.', taxId: 'GSTIN: 27ABCDE1234F1Z5', doc: 'टैक्स इनवॉइस',
            no: 'नं.: INV-2026-000123', date: 'दिनांक: 13/10/2026', cols: ['आइटम / सेवा', 'मात्रा', 'राशि'],
            items: [['A4 कॉपी पेपर', '2 बॉक्स'], ['टोनर', '1 नग']], bank: 'बैंक विवरण', bankValue: 'खाता सं.: 0000 0000 0000 0000', stamp: 'मुहर',
        },
        howLabel: 'यह कैसे काम करता है?',
        howTitle: '3 चरणों में तैयार',
        steps: [
            ['देश और दस्तावेज़ चुनें', 'विज़ार्ड सही XML प्रोफ़ाइल के साथ स्थानीय दस्तावेज़ दिखाता है। तैयार टेम्पलेट से शुरू करें या अपनी XSLT फ़ाइल अपलोड करें।'],
            ['लोगो, मुहर और बैंक विवरण जोड़ें', 'फ़ील्ड को ड्रैग-एंड-ड्रॉप करें; रंग, फ़ॉन्ट और लेआउट देखते हुए बदलें।'],
            ['अपने XML से प्रीव्यू करें और डाउनलोड करें', 'असली इनवॉइस के साथ तुरंत परिणाम देखें और XSLT को अपने ई-इनवॉइसिंग या ERP सिस्टम में लोड करें।'],
        ],
        features: [
            ['ड्रैग-एंड-ड्रॉप', 'XSLT या कोडिंग का ज्ञान ज़रूरी नहीं।'],
            ['GST ई-इनवॉइस', 'INV-01 (IRP स्कीमा 1.1) और ई-वे बिल; यूरोप के लिए EN 16931 और Peppol।'],
            ['लाइव प्रीव्यू', 'हर बदलाव अपने XML के साथ देखें।'],
            ['स्थानीय लेबल', 'लेबल देश की भाषा में या अंग्रेज़ी में।'],
        ],
        formatsTitle: 'एक एडिटर, 38 देश',
        who: '<strong>किसके लिए?</strong> GST सुविधा प्रदाता (GSP), ई-इनवॉइसिंग सेवा प्रदाता, ERP और अकाउंटिंग सॉफ़्टवेयर कंपनियाँ, अकाउंटेंट<br class="hide-sm"> और हर वह कंपनी जो अपने ब्रांड में इनवॉइस भेजना चाहती है।',
        finalTitle: 'आज ही अपना पहला लेआउट बनाएँ',
        finalText: 'खाता खोलें, टेम्पलेट चुनें और कुछ ही मिनटों में परिणाम देखें।',
        cta2: 'खाता बनाएँ',
        brand: 'edXdocu · ई-दस्तावेज़ डिज़ाइनर',
        legal: [
            'यह सूचना ईमेल आपके व्यवसाय को इसलिए भेजा गया है क्योंकि यह आपके कार्यक्षेत्र से संबंधित हो सकता है।',
            'यदि आप आगे ऐसे ईमेल नहीं चाहते, तो {link}एक क्लिक में सदस्यता छोड़ें{/link}; आपका अनुरोध तुरंत लागू होता है।',
            'अपने पते का स्रोत जानने या हमारे रिकॉर्ड से उसे हटवाने के लिए {mail} पर लिखें।',
        ],
    },
    pt: {
        subject: 'Seu DANFE com a cara da sua empresa, pronto em minutos – NF-e, NFS-e e CT-e',
        title: 'edXdocu · Seu DANFE personalizado, pronto em minutos',
        preheader: 'Crie layouts de DANFE, DANFSe e DACTE arrastando e soltando, sem XSLT.',
        badge: 'NOVO · Designer de documentos fiscais',
        h1: 'Seu DANFE personalizado,<br>pronto em minutos',
        sub: 'Pronto para <strong>NF-e, NFC-e, NFS-e Padrão Nacional e CT-e</strong>, já com os campos de IBS e CBS da Reforma Tributária – além de EN 16931 / Peppol para a Europa: 38 países no total.<br>Sem XSLT, basta arrastar e soltar.',
        cta1: 'Experimente agora',
        stats: [['38', 'países'], ['NF-e 4.00', 'DANFE · DANFSe · DACTE'], ['100%', 'on-line, sem instalação']],
        whatLabel: 'PARA QUE SERVE?',
        whatTitle: 'Sua nota fiscal, com a sua marca',
        whatText: 'Logotipo, carimbo, dados bancários e tabela de itens:<br class="hide-sm"> tudo no lugar que você quiser, arrastando e soltando.',
        inv: {
            logo: 'SEU LOGOTIPO', company: 'Exemplo Papelaria Ltda.', taxId: 'CNPJ: 12.345.678/0001-95', doc: 'Nota fiscal',
            no: 'Nº: 000.000.123', date: 'Emissão: 13/10/2026', cols: ['Produto / Serviço', 'Qtd.', 'Valor'],
            items: [['Papel A4', '2 caixas'], ['Toner', '1 un.']], bank: 'Dados bancários', bankValue: 'Banco 000 · Ag. 0000 · C/C 00000-0', stamp: 'CARIMBO',
        },
        howLabel: 'COMO FUNCIONA?',
        howTitle: 'Pronto em 3 passos',
        steps: [
            ['Escolha o país e o documento', 'O assistente mostra NF-e, NFC-e, NFS-e e CT-e com o leiaute XML correto. Comece por um modelo ou envie seu próprio XSLT.'],
            ['Adicione logotipo, carimbo e dados bancários', 'Arraste e solte os campos; ajuste cores, fontes e layout vendo o resultado.'],
            ['Visualize com seu XML e baixe', 'Veja o resultado na hora com uma nota real e carregue o XSLT no seu ERP ou emissor de NF-e.'],
        ],
        features: [
            ['Arrastar e soltar', 'Não é preciso saber XSLT nem programar.'],
            ['Documentos fiscais', 'DANFE, DANFE NFC-e, DANFSe e DACTE com validação de chave de acesso, CNPJ e totais.'],
            ['Visualização ao vivo', 'Veja cada alteração com o seu próprio XML.'],
            ['Rótulos locais', 'Rótulos em português ou em inglês.'],
        ],
        formatsTitle: 'Um editor, 38 países',
        who: '<strong>Para quem?</strong> Emissores de NF-e, fabricantes de ERP e software contábil, escritórios de contabilidade<br class="hide-sm"> e toda empresa que quer enviar suas notas com a própria marca.',
        finalTitle: 'Crie seu primeiro layout hoje',
        finalText: 'Abra uma conta, escolha um modelo e veja o resultado em minutos.',
        cta2: 'Criar conta',
        brand: 'edXdocu · Designer de documentos fiscais',
        legal: [
            'Este e-mail informativo foi enviado à sua empresa por tratar de assunto relacionado à sua área de atuação.',
            'Se não quiser receber novas mensagens, você pode {link}cancelar a inscrição com um clique{/link}; o pedido vale imediatamente.',
            'Para saber a origem do seu endereço ou pedir a exclusão dos seus dados (LGPD), escreva para {mail}.',
        ],
    },
};

const withFeature = (features, feature) => features.map((f, i) => (i === 1 ? feature : f));
const withStep = (steps, text) => steps.map((s, i) => (i === 2 ? [s[0], text] : s));

T['en-in'] = {
    ...T.en,
    subject: 'Your GST e-invoice layout, ready in minutes',
    title: 'edXdocu · Your GST e-invoice layout, ready in minutes',
    preheader: 'Design GST e-Invoice (INV-01) and e-Way Bill layouts with drag and drop. No XSLT needed.',
    h1: 'Your GST e-invoice layout,<br>ready in minutes',
    sub: 'Ready for <strong>GST e-Invoice (INV-01) and e-Way Bill</strong> – plus EN 16931 / Peppol for Europe and national formats for the USA, Brazil, China and Russia: 38 countries in total.<br>No XSLT, just drag and drop.',
    stats: [['38', 'countries'], ['GST', 'e-Invoice · e-Way Bill'], ['100%', 'web-based, no installation']],
    inv: {
        ...T.en.inv, company: 'Sample Office Supplies Pvt. Ltd.', taxId: 'GSTIN: 27ABCDE1234F1Z5', doc: 'Tax Invoice',
        bankValue: 'A/c No.: 0000 0000 0000 · IFSC: XXXX0000000',
    },
    steps: withStep(T.en.steps, 'See the result instantly with a real invoice and load the XSLT into your e-invoicing or ERP system.'),
    features: withFeature(T.en.features, ['GST e-Invoice', 'INV-01 (IRP schema 1.1) and e-Way Bill; EN 16931 and Peppol for Europe.']),
    who: '<strong>Who is it for?</strong> GST Suvidha Providers (GSPs), e-invoicing providers, ERP and accounting software vendors, accountants<br class="hide-sm"> and every company that wants to send invoices in its own brand.',
};

T['en-us'] = {
    ...T.en,
    subject: 'Your e-invoice layout, ready in minutes – DBNAlliance UBL',
    preheader: 'Design DBNAlliance (UBL 2.3) e-invoice layouts with drag and drop. No XSLT needed.',
    sub: 'Ready for <strong>DBNAlliance e-invoicing (UBL 2.3)</strong> – plus EN 16931 / Peppol for Europe and national formats for Brazil, India, China and Russia: 38 countries in total.<br>No XSLT, just drag and drop.',
    stats: [['38', 'countries'], ['DBNAlliance', 'UBL 2.3 · US e-invoicing'], ['100%', 'web-based, no installation']],
    inv: {
        ...T.en.inv, company: 'Sample Office Supplies Inc.', taxId: 'EIN: 12-3456789', date: 'Date: 10/13/2026',
        bankValue: 'Routing: 000000000 · Account: 0000000000',
    },
    steps: withStep(T.en.steps, 'See the result instantly with a real invoice and load the XSLT into your e-invoicing or ERP platform.'),
    features: withFeature(T.en.features, ['DBNAlliance', 'Core Invoice on UBL 2.3; EN 16931 and Peppol for Europe.']),
    who: '<strong>Who is it for?</strong> DBNAlliance access points, e-invoicing providers, ERP and accounting software vendors, accountants<br class="hide-sm"> and every company that wants to send invoices in its own brand.',
};

/** Broşürün format listesinde öne alınan ulusal format. */
const LEAD_FORMAT = {
    ru: 'FNS UPD 5.03 (RU)', zh: '数电发票 (CN)', hi: 'GST e-Invoice · e-Way Bill (IN)', pt: 'NF-e · NFS-e · CT-e (BR)',
    'en-in': 'GST e-Invoice · e-Way Bill (IN)', 'en-us': 'DBNAlliance (US)',
};
const formatsFor = (id) => (LEAD_FORMAT[id] ? [LEAD_FORMAT[id], ...FORMATS.filter((f) => f !== LEAD_FORMAT[id])] : FORMATS);

const esc = (s) => s.replace(/&(?![a-z#0-9]+;)/gi, '&amp;');
const strip = (s) => s.replace(/<br[^>]*>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const siteLang = (id) => id.slice(0, 2);
const link = (id, content) => `${SITE}?lang=${siteLang(id)}&utm_source=email&utm_medium=email&utm_campaign=tanitim-intl&utm_content=${content}-${id}`;

const html = (id, source) => {
    const lang = siteLang(id);
    const d = JSON.parse(JSON.stringify(source), (_, v) => (typeof v === 'string' ? esc(v) : v));
    const F = FONTS[lang] ?? LATIN;
    const ls = FONTS[lang] ? '0' : '1.5px';
    const unsub = `{{UNSUBSCRIBE_URL}}&amp;lang=${lang}`;
    const label = (text) => `<p style="margin:0 0 6px 0;font-family:${F};font-size:12px;font-weight:bold;letter-spacing:${ls};color:#6d28d9;text-align:center;">${text}</p>`;
    const stat = ([value, caption], i) => `
          <td class="stat${i === 0 ? ' stat-first' : ''}" width="${i === 1 ? 34 : 33}%" align="center" style="padding:22px 0;${i ? 'border-left:1px solid #e4e7ef;' : ''}font-family:${F};">
            <div style="font-size:${value.length > 9 ? 19 : value.length > 6 ? 22 : 26}px;font-weight:bold;color:#6d28d9;">${value}</div>
            <div style="font-size:13px;color:#4a5568;padding-top:2px;">${caption}</div>
          </td>`;
    const step = ([title, text], i) => `
        <tr>
          <td width="52" valign="top" style="padding:0 0 20px 0;">
            <div style="width:38px;height:38px;line-height:38px;text-align:center;background-color:${i === 2 ? '#f59e0b' : '#6d28d9'};border-radius:19px;font-family:${LATIN};font-size:17px;font-weight:bold;color:#ffffff;">${i + 1}</div>
          </td>
          <td valign="top" style="padding:0 0 20px 0;font-family:${F};">
            <div style="font-size:16px;font-weight:bold;color:#0b1324;">${title}</div>
            <div style="font-size:14px;line-height:21px;color:#4a5568;padding-top:3px;">${text}</div>
          </td>
        </tr>`;
    const feature = ([title, text], i) => `
          <td class="stack stack-pad" width="50%" valign="top" style="padding:${i % 2 ? `0 0 ${i < 2 ? 12 : 0}px 6px` : `0 6px ${i < 2 ? 12 : 0}px 0`};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f6f7fb" style="background-color:#f6f7fb;border-radius:12px;">
              <tr><td style="padding:18px;font-family:${F};">
                <div style="font-size:15px;font-weight:bold;color:#6d28d9;">&#10003; ${esc(title)}</div>
                <div style="font-size:13px;line-height:20px;color:#4a5568;padding-top:4px;">${text}</div>
              </td></tr>
            </table>
          </td>`;
    const item = ([name, qty]) => `
              <tr>
                <td style="padding:8px 10px;color:#0b1324;border-bottom:1px solid #e4e7ef;">${name}</td>
                <td align="center" style="padding:8px 10px;color:#4a5568;border-bottom:1px solid #e4e7ef;white-space:nowrap;">${qty}</td>
                <td align="right" style="padding:8px 10px;color:#0b1324;border-bottom:1px solid #e4e7ef;">&#8226;&#8226;&#8226;</td>
              </tr>`;
    const legal = d.legal.map((line) => line
        .replace('{link}', `<a href="${unsub}" target="_blank" style="color:#7a8599;text-decoration:underline;">`)
        .replace('{/link}', '</a>')
        .replace('{mail}', `<a href="mailto:${MAIL}" style="color:#7a8599;text-decoration:underline;">${MAIL}</a>`)).join('<br>\n      ');
    const button = (href, text, bg, color) => `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td align="center" bgcolor="${bg}" style="background-color:${bg};border-radius:10px;">
            <a href="${href}" target="_blank" style="display:inline-block;padding:15px 34px;font-family:${F};font-size:16px;font-weight:bold;color:${color};border-radius:10px;">
              ${text} &rarr;
            </a>
          </td>
        </tr>
      </table>`;
    const inv = d.inv;

    return `<!DOCTYPE html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${d.title}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>table,td,div,p,a,span{font-family:${F} !important;}</style>
<![endif]-->
<style>
  body{margin:0;padding:0;width:100% !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;}
  img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;display:block;}
  a{text-decoration:none;}
  @media only screen and (max-width:620px){
    .container{width:100% !important;}
    .px{padding-left:20px !important;padding-right:20px !important;}
    .h1{font-size:28px !important;line-height:34px !important;}
    .stack{display:block !important;width:100% !important;}
    .stack-pad{padding:0 0 12px 0 !important;}
    .stat{display:block !important;width:100% !important;border-left:0 !important;border-top:1px solid #e4e7ef !important;padding:14px 0 !important;}
    .stat-first{border-top:0 !important;}
    .hide-sm{display:none !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f1f4f9;">

<div style="display:none;font-size:1px;color:#f1f4f9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
  ${d.preheader}
  &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f1f4f9" style="background-color:#f1f4f9;">
<tr>
<td align="center" style="padding:24px 10px;">

<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;">

  <tr>
    <td align="center" class="px" style="padding:28px 40px 20px 40px;background-color:#ffffff;">
      <a href="${esc(link(id, 'logo'))}" target="_blank">
        <img src="${SITE}logo-600x200.png" width="180" height="60" alt="edXdocu" style="width:180px;height:60px;color:#6d28d9;font-family:${LATIN};font-size:26px;font-weight:bold;">
      </a>
    </td>
  </tr>

  <tr>
    <td bgcolor="#5b21b6" class="px" style="background-color:#5b21b6;background-image:linear-gradient(135deg,#7c3aed 0%,#5b21b6 55%,#2563eb 100%);padding:44px 40px 40px 40px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td bgcolor="#f59e0b" style="background-color:#f59e0b;border-radius:20px;padding:6px 14px;font-family:${F};font-size:12px;font-weight:bold;letter-spacing:${ls};color:#ffffff;">
            ${d.badge}
          </td>
        </tr>
      </table>
      <h1 class="h1" style="margin:20px 0 14px 0;font-family:${F};font-size:32px;line-height:40px;font-weight:bold;color:#ffffff;">
        ${d.h1}
      </h1>
      <p style="margin:0 0 28px 0;font-family:${F};font-size:16px;line-height:25px;color:#ede9fe;">
        ${d.sub.replace(/<strong>/g, '<strong style="color:#ffffff;">')}
      </p>${button(esc(link(id, 'hero')), d.cta1, '#ffffff', '#5b21b6')}
    </td>
  </tr>

  <tr>
    <td class="px" style="padding:0 40px;background-color:#ffffff;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${d.stats.map(stat).join('')}
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td bgcolor="#f5f3ff" class="px" style="background-color:#f5f3ff;padding:36px 40px;">
      ${label(d.whatLabel)}
      <h2 style="margin:0 0 8px 0;font-family:${F};font-size:23px;line-height:30px;color:#0b1324;text-align:center;">${d.whatTitle}</h2>
      <p style="margin:0 0 24px 0;font-family:${F};font-size:15px;line-height:23px;color:#4a5568;text-align:center;">
        ${d.whatText}
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background-color:#ffffff;border:1px solid #e4e7ef;border-radius:12px;">
        <tr>
          <td style="padding:22px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="top" style="font-family:${F};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td bgcolor="#ede9fe" style="background-color:#ede9fe;border:1px dashed #a78bfa;border-radius:6px;padding:10px 14px;font-size:12px;font-weight:bold;color:#6d28d9;">${inv.logo}</td>
                    </tr>
                  </table>
                  <div style="padding-top:10px;font-size:14px;font-weight:bold;color:#0b1324;">${inv.company}</div>
                  <div style="font-size:12px;color:#7a8599;padding-top:2px;">${inv.taxId}</div>
                </td>
                <td valign="top" align="right" style="font-family:${F};">
                  <div style="font-size:16px;font-weight:bold;color:#6d28d9;">${inv.doc}</div>
                  <div style="font-size:12px;color:#7a8599;padding-top:4px;">${inv.no}</div>
                  <div style="font-size:12px;color:#7a8599;padding-top:2px;">${inv.date}</div>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;font-family:${F};font-size:13px;">
              <tr>
                <td bgcolor="#6d28d9" style="background-color:#6d28d9;color:#ffffff;font-weight:bold;padding:8px 10px;">${inv.cols[0]}</td>
                <td bgcolor="#6d28d9" align="center" style="background-color:#6d28d9;color:#ffffff;font-weight:bold;padding:8px 10px;">${inv.cols[1]}</td>
                <td bgcolor="#6d28d9" align="right" style="background-color:#6d28d9;color:#ffffff;font-weight:bold;padding:8px 10px;">${inv.cols[2]}</td>
              </tr>${inv.items.map(item).join('')}
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
              <tr>
                <td valign="middle" style="font-family:${F};font-size:12px;line-height:18px;color:#4a5568;">
                  <strong style="color:#0b1324;">${inv.bank}</strong><br>
                  ${inv.bankValue}
                </td>
                <td valign="middle" align="right" width="90">
                  <div style="width:64px;height:64px;line-height:64px;border:2px solid #ef4444;border-radius:34px;text-align:center;font-family:${F};font-size:${inv.stamp.length > 6 ? 10 : 11}px;font-weight:bold;color:#ef4444;margin-left:auto;">${inv.stamp}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td class="px" style="padding:36px 40px 12px 40px;background-color:#ffffff;">
      ${label(d.howLabel)}
      <h2 style="margin:0 0 24px 0;font-family:${F};font-size:23px;line-height:30px;color:#0b1324;text-align:center;">${d.howTitle}</h2>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${d.steps.map(step).join('')}
      </table>
    </td>
  </tr>

  <tr>
    <td class="px" style="padding:8px 40px 32px 40px;background-color:#ffffff;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${d.features.slice(0, 2).map(feature).join('')}
        </tr>
        <tr>${d.features.slice(2).map((f, i) => feature(f, i + 2)).join('')}
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td bgcolor="#f6f7fb" class="px" style="background-color:#f6f7fb;padding:30px 40px;text-align:center;">
      <h2 style="margin:0 0 14px 0;font-family:${F};font-size:19px;line-height:26px;color:#0b1324;">${d.formatsTitle}</h2>
      <p style="margin:0;font-family:${LATIN};font-size:14px;line-height:26px;color:#4a5568;">
        ${formatsFor(id).map((f) => `<span style="white-space:nowrap;">${f}</span>`).join(' &nbsp;·&nbsp; ')}
      </p>
      <p style="margin:18px 0 0 0;font-family:${F};font-size:14px;line-height:22px;color:#0b1324;">
        ${d.who}
      </p>
    </td>
  </tr>

  <tr>
    <td bgcolor="#0b1324" class="px" style="background-color:#0b1324;padding:40px 40px;text-align:center;">
      <h2 style="margin:0 0 10px 0;font-family:${F};font-size:24px;line-height:31px;color:#ffffff;">${d.finalTitle}</h2>
      <p style="margin:0 0 24px 0;font-family:${F};font-size:15px;line-height:23px;color:#cbd5e1;">
        ${d.finalText}
      </p>${button(esc(link(id, 'final')), d.cta2, '#f59e0b', '#ffffff')}
    </td>
  </tr>

  <tr>
    <td class="px" style="padding:26px 40px 30px 40px;background-color:#ffffff;text-align:center;font-family:${F};font-size:12px;line-height:19px;color:#7a8599;">
      <strong style="color:#4a5568;">${d.brand}</strong><br>
      <a href="mailto:${MAIL}" style="color:#6d28d9;">${MAIL}</a> &nbsp;·&nbsp; <a href="${esc(link(id, 'footer'))}" target="_blank" style="color:#6d28d9;">www.edxdocu.com</a>
      <br><br>
      ${legal}
    </td>
  </tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->

</td>
</tr>
</table>
</body>
</html>
`;
};

const text = (id, d) => {
    const lang = siteLang(id);
    const legal = d.legal.map((line) => line.replace('{link}', '').replace('{/link}', '').replace('{mail}', MAIL));
    return [
        d.brand,
        '',
        strip(d.h1).toUpperCase(),
        '',
        strip(d.sub),
        '',
        `${d.cta1}: ${link(id, 'hero')}`,
        '',
        d.stats.map(([v, c]) => `${v} ${c}`).join(' · '),
        '',
        '',
        d.whatLabel,
        `${d.whatTitle}. ${strip(d.whatText)}`,
        '',
        '',
        d.howTitle.toUpperCase(),
        ...d.steps.flatMap(([t, x], i) => [`${i + 1}. ${t}`, `   ${x}`]),
        '',
        '',
        ...d.features.map(([t, x]) => `- ${t}: ${x}`),
        '',
        '',
        d.formatsTitle.toUpperCase(),
        formatsFor(id).join(', '),
        '',
        strip(d.who),
        '',
        '',
        d.finalTitle.toUpperCase(),
        `${d.cta2}: ${link(id, 'final')}`,
        '--',
        d.brand,
        `${MAIL} · www.edxdocu.com`,
        '',
        legal[0],
        legal[1],
        `{{UNSUBSCRIBE_URL}}&lang=${lang}`,
        legal[2],
        '',
    ].join('\n');
};

const subjects = {};
for (const [id, d] of Object.entries(T)) {
    writeFileSync(join(OUT, `email-tanitim-${id}.html`), html(id, d));
    writeFileSync(join(OUT, `email-tanitim-${id}.txt`), text(id, d));
    subjects[id] = d.subject;
}
writeFileSync(join(OUT, 'email-tanitim-subjects.json'), `${JSON.stringify(subjects, null, 4)}\n`);
console.log('ok', Object.keys(T).join(', '));
