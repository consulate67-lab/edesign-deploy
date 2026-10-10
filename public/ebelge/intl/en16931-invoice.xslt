<?xml version="1.0" encoding="UTF-8"?>
<!--
  EN 16931 UBL 2.1 fatura görünümü (Invoice ve CreditNote).
  Peppol BIS Billing 3.0, XRechnung (UBL) ve diğer EN 16931 CIUS profilleriyle çalışır.
  Etiket dili "lang" parametresiyle seçilir (AB/AEA dilleri + tr; bilinmeyen dil: en).
  Etiket satırları scripts/build-intl-xslt-labels.mjs ile src/international/docText'ten üretilir.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
    xmlns:n2="urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="n1 n2 cac cbc">

    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:param name="lang" select="'en'"/>
    <xsl:variable name="L">
        <xsl:choose>
            <xsl:when test="$lang != '' and contains('|tr|en|de|fr|es|it|nl|pt|pl|cs|sk|sl|hr|hu|ro|bg|el|da|sv|nb|fi|et|lv|lt|is|mt|ga|ca|eu|gl|', concat('|', $lang, '|'))"><xsl:value-of select="$lang"/></xsl:when>
            <xsl:otherwise>en</xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <!-- Sayı biçimi: dot = 1,234.50 · space = 1 234,50 · comma = 1.234,50 -->
    <xsl:variable name="NS">
        <xsl:choose>
            <xsl:when test="$L='en' or $L='mt' or $L='ga'">dot</xsl:when>
            <xsl:when test="contains('|fr|pt|pl|cs|sk|hu|bg|sv|nb|fi|et|lv|lt|', concat('|', $L, '|'))">space</xsl:when>
            <xsl:otherwise>comma</xsl:otherwise>
        </xsl:choose>
    </xsl:variable>

    <xsl:decimal-format name="dot" decimal-separator="." grouping-separator="," NaN=""/>
    <xsl:decimal-format name="comma" decimal-separator="," grouping-separator="." NaN=""/>
    <xsl:decimal-format name="space" decimal-separator="," grouping-separator="&#160;" NaN=""/>

    <!-- Etiketler: |dil=metin| satırları; satırda dil yoksa İngilizce kullanılır. -->
    <xsl:template name="t">
        <xsl:param name="k"/>
        <xsl:variable name="row">
            <xsl:choose>
                <xsl:when test="$k='invoice'">|tr=Fatura|en=Invoice|de=Rechnung|fr=Facture|es=Factura|it=Fattura|nl=Factuur|pt=Fatura|pl=Faktura|cs=Faktura – daňový doklad|sk=Faktúra|sl=Račun|hr=Račun|hu=Számla|ro=Factură|bg=Фактура|el=Τιμολόγιο|da=Faktura|sv=Faktura|nb=Faktura|fi=Lasku|et=Arve|lv=Rēķins|lt=PVM sąskaita faktūra|is=Reikningur|mt=Fattura|ga=Sonrasc|ca=Factura|eu=Faktura|gl=Factura|</xsl:when>
                <xsl:when test="$k='credit'">|tr=İade Faturası|en=Credit note|de=Gutschrift|fr=Avoir|es=Factura rectificativa|it=Nota di credito|nl=Creditnota|pt=Nota de crédito|pl=Faktura korygująca|cs=Opravný daňový doklad (dobropis)|sk=Dobropis|sl=Dobropis|hr=Knjižno odobrenje|hu=Jóváíró számla|ro=Factură de stornare|bg=Кредитно известие|el=Πιστωτικό τιμολόγιο|da=Kreditnota|sv=Kreditfaktura|nb=Kreditnota|fi=Hyvityslasku|et=Kreeditarve|lv=Kredītrēķins|lt=Kreditinė PVM sąskaita faktūra|is=Kreditreikningur|mt=Nota ta’ kreditu|ga=Nóta creidmheasa|ca=Factura rectificativa (abonament)|eu=Faktura zuzentzailea (abonua)|gl=Factura rectificativa (abono)|</xsl:when>
                <xsl:when test="$k='corrected'">|tr=Düzeltme Faturası|en=Corrected invoice|de=Rechnungskorrektur|fr=Facture rectificative|es=Factura rectificativa por sustitución|it=Fattura rettificativa|nl=Gecorrigeerde factuur|pt=Fatura retificativa|pl=Korekta faktury|cs=Opravný daňový doklad|sk=Opravná faktúra|sl=Popravek računa|hr=Ispravak računa|hu=Helyesbítő számla|ro=Factură de corecție|bg=Коригирана фактура|el=Διορθωτικό τιμολόγιο|da=Korrigeret faktura|sv=Korrigerad faktura|nb=Korrigert faktura|fi=Korjattu lasku|et=Parandatud arve|lv=Labots rēķins|lt=Patikslinta PVM sąskaita faktūra|is=Leiðréttur reikningur|mt=Fattura korretta|ga=Sonrasc ceartaithe|ca=Factura rectificativa|eu=Faktura zuzentzailea|gl=Factura rectificativa|</xsl:when>
                <xsl:when test="$k='prepayment'">|tr=Avans Faturası|en=Prepayment invoice|de=Vorauszahlungsrechnung|fr=Facture d’acompte|es=Factura de anticipo|it=Fattura di acconto|nl=Voorschotfactuur|pt=Fatura de adiantamento|pl=Faktura zaliczkowa|cs=Zálohová faktura|sk=Zálohová faktúra|sl=Avansni račun|hr=Račun za predujam|hu=Előlegszámla|ro=Factură de avans|bg=Авансова фактура|el=Τιμολόγιο προκαταβολής|da=Forudbetalingsfaktura|sv=Förskottsfaktura|nb=Forskuddsfaktura|fi=Ennakkolasku|et=Ettemaksuarve|lv=Avansa rēķins|lt=Išankstinė sąskaita faktūra|is=Fyrirframgreiðslureikningur|mt=Fattura ta’ ħlas bil-quddiem|ga=Sonrasc réamhíocaíochta|ca=Factura de bestreta|eu=Aurrerakin-faktura|gl=Factura de anticipo|</xsl:when>
                <xsl:when test="$k='selfbilled'">|tr=Alıcı Tarafından Düzenlenen Fatura|en=Self-billed invoice|de=Gutschrift (Selbstfakturierung)|fr=Autofacture|es=Autofactura|it=Autofattura|nl=Factuur uitgereikt door afnemer|pt=Fatura (autofaturação)|pl=Faktura (samofakturowanie)|cs=Daňový doklad vystavený odběratelem|sk=Faktúra vyhotovená odberateľom|sl=Račun (samofakturiranje)|hr=Račun (samoizdavanje)|hu=Számla (önszámlázás)|ro=Autofactură|bg=Фактура (самофактуриране)|el=Τιμολόγιο αυτοτιμολόγησης|da=Selvfaktureret faktura|sv=Självfaktura|nb=Selvfaktura|fi=Itselaskutus|et=Ostja koostatud arve|lv=Pašaprēķina rēķins|lt=Pirkėjo išrašyta PVM sąskaita faktūra|is=Reikningur útgefinn af kaupanda|mt=Fattura ta’ awtofatturazzjoni|ga=Sonrasc féinbhillithe|ca=Autofactura|eu=Autofaktura|gl=Autofactura|</xsl:when>
                <xsl:when test="$k='partial'">|tr=Kısmi Fatura|en=Partial invoice|de=Teilrechnung|fr=Facture partielle|es=Factura parcial|it=Fattura parziale|nl=Deelfactuur|pt=Fatura parcial|pl=Faktura częściowa|cs=Dílčí faktura|sk=Čiastková faktúra|sl=Delni račun|hr=Djelomični račun|hu=Részszámla|ro=Factură parțială|bg=Частична фактура|el=Μερικό τιμολόγιο|da=Acontofaktura|sv=Delfaktura|nb=Delfaktura|fi=Osalasku|et=Osaarve|lv=Daļējs rēķins|lt=Dalinė PVM sąskaita faktūra|is=Hlutareikningur|mt=Fattura parzjali|ga=Sonrasc páirteach|ca=Factura parcial|eu=Faktura partziala|gl=Factura parcial|</xsl:when>
                <xsl:when test="$k='number'">|tr=Fatura no|en=Invoice no.|de=Rechnungsnummer|fr=N° de facture|es=N.º de factura|it=Fattura n.|nl=Factuurnr.|pt=Fatura n.º|pl=Nr faktury|cs=Číslo faktury|sk=Číslo faktúry|sl=Št. računa|hr=Broj računa|hu=Számlaszám|ro=Factură nr.|bg=Фактура №|el=Αρ. τιμολογίου|da=Fakturanr.|sv=Fakturanr|nb=Fakturanr.|fi=Laskun nro|et=Arve nr|lv=Rēķina nr.|lt=Sąskaitos faktūros Nr.|is=Reikningsnr.|mt=Fattura Nru|ga=Uimh. sonraisc|ca=Factura núm.|eu=Faktura zk.|gl=Factura n.º|</xsl:when>
                <xsl:when test="$k='date'">|tr=Düzenleme tarihi|en=Issue date|de=Rechnungsdatum|fr=Date d’émission|es=Fecha de emisión|it=Data emissione|nl=Factuurdatum|pt=Data de emissão|pl=Data wystawienia|cs=Datum vystavení|sk=Dátum vyhotovenia|sl=Datum izdaje|hr=Datum izdavanja|hu=Kiállítás dátuma|ro=Data emiterii|bg=Дата на издаване|el=Ημερομηνία έκδοσης|da=Fakturadato|sv=Fakturadatum|nb=Fakturadato|fi=Laskun pvm|et=Arve kuupäev|lv=Izrakstīšanas datums|lt=Išrašymo data|is=Útgáfudagur|mt=Data tal-ħruġ|ga=Dáta eisiúna|ca=Data d’emissió|eu=Jaulkipen-data|gl=Data de emisión|</xsl:when>
                <xsl:when test="$k='due'">|tr=Vade tarihi|en=Due date|de=Fällig am|fr=Date d’échéance|es=Fecha de vencimiento|it=Scadenza|nl=Vervaldatum|pt=Vencimento|pl=Termin płatności|cs=Datum splatnosti|sk=Dátum splatnosti|sl=Datum zapadlosti|hr=Datum dospijeća|hu=Fizetési határidő|ro=Scadență|bg=Срок за плащане|el=Ημερομηνία λήξης|da=Forfaldsdato|sv=Förfallodatum|nb=Forfallsdato|fi=Eräpäivä|et=Maksetähtaeg|lv=Apmaksas termiņš|lt=Apmokėti iki|is=Gjalddagi|mt=Data tal-iskadenza|ga=Dáta dlite|ca=Data de venciment|eu=Muga-eguna|gl=Data de vencemento|</xsl:when>
                <xsl:when test="$k='currency'">|tr=Para birimi|en=Currency|de=Währung|fr=Devise|es=Moneda|it=Valuta|nl=Valuta|pt=Moeda|pl=Waluta|cs=Měna|sk=Mena|sl=Valuta|hr=Valuta|hu=Pénznem|ro=Monedă|bg=Валута|el=Νόμισμα|da=Valuta|sv=Valuta|nb=Valuta|fi=Valuutta|et=Valuuta|lv=Valūta|lt=Valiuta|is=Gjaldmiðill|mt=Munita|ga=Airgeadra|ca=Moneda|eu=Moneta|gl=Moeda|</xsl:when>
                <xsl:when test="$k='buyerRef'">|tr=Alıcı referansı|en=Buyer reference|de=Käuferreferenz|fr=Référence acheteur|es=Referencia del comprador|it=Rif. acquirente|nl=Uw referentie|pt=Ref. do adquirente|pl=Referencja nabywcy|cs=Reference odběratele|sk=Referencia odberateľa|sl=Sklic kupca|hr=Referenca kupca|hu=Vevői hivatkozás|ro=Ref. cumpărător|bg=Референция на получателя|el=Αναφορά αγοραστή|da=Deres reference|sv=Er referens|nb=Deres referanse|fi=Viitteenne|et=Ostja viide|lv=Pircēja atsauce|lt=Pirkėjo nuoroda|is=Tilvísun kaupanda|mt=Ref. tax-xerrej|ga=Tagairt an cheannaitheora|ca=Ref. del comprador|eu=Eroslearen erref.|gl=Ref. do comprador|</xsl:when>
                <xsl:when test="$k='order'">|tr=Sipariş no|en=Order reference|de=Bestellnummer|fr=N° de commande|es=N.º de pedido|it=Rif. ordine|nl=Orderreferentie|pt=Ref. da encomenda|pl=Nr zamówienia|cs=Objednávka|sk=Objednávka|sl=Naročilo|hr=Narudžba|hu=Megrendelés|ro=Ref. comandă|bg=Поръчка|el=Αρ. παραγγελίας|da=Ordrereference|sv=Orderreferens|nb=Ordrereferanse|fi=Tilausviite|et=Tellimuse viide|lv=Pasūtījuma atsauce|lt=Užsakymo nuoroda|is=Pöntun|mt=Ref. tal-ordni|ga=Tagairt ordaithe|ca=Núm. de comanda|eu=Eskaera zk.|gl=N.º de pedido|</xsl:when>
                <xsl:when test="$k='contract'">|tr=Sözleşme no|en=Contract|de=Vertragsnummer|fr=Contrat|es=Contrato|it=Contratto|nl=Contract|pt=Contrato|pl=Umowa|cs=Smlouva|sk=Zmluva|sl=Pogodba|hr=Ugovor|hu=Szerződés|ro=Contract|bg=Договор|el=Σύμβαση|da=Kontrakt|sv=Avtal|nb=Kontrakt|fi=Sopimus|et=Leping|lv=Līgums|lt=Sutartis|is=Samningur|mt=Kuntratt|ga=Conradh|ca=Contracte|eu=Kontratua|gl=Contrato|</xsl:when>
                <xsl:when test="$k='project'">|tr=Proje|en=Project|de=Projekt|fr=Projet|es=Proyecto|it=Progetto|nl=Project|pt=Projeto|pl=Projekt|cs=Projekt|sk=Projekt|sl=Projekt|hr=Projekt|hu=Projekt|ro=Proiect|bg=Проект|el=Έργο|da=Projekt|sv=Projekt|nb=Prosjekt|fi=Projekti|et=Projekt|lv=Projekts|lt=Projektas|is=Verkefni|mt=Proġett|ga=Tionscadal|ca=Projecte|eu=Proiektua|gl=Proxecto|</xsl:when>
                <xsl:when test="$k='preceding'">|tr=İlgili fatura|en=Preceding invoice|de=Bezug auf Rechnung|fr=Facture d’origine|es=Factura rectificada|it=Fattura precedente|nl=Voorgaande factuur|pt=Fatura anterior|pl=Faktura pierwotna|cs=Původní faktura|sk=Pôvodná faktúra|sl=Predhodni račun|hr=Prethodni račun|hu=Előzmény számla|ro=Factura anterioară|bg=Към фактура|el=Σχετικό τιμολόγιο|da=Tidligere faktura|sv=Tidigare faktura|nb=Tidligere faktura|fi=Aiempi lasku|et=Eelnev arve|lv=Iepriekšējais rēķins|lt=Ankstesnė sąskaita faktūra|is=Fyrri reikningur|mt=Fattura preċedenti|ga=Sonrasc roimhe seo|ca=Factura rectificada|eu=Faktura zuzendua|gl=Factura rectificada|</xsl:when>
                <xsl:when test="$k='period'">|tr=Fatura dönemi|en=Invoice period|de=Leistungszeitraum|fr=Période de facturation|es=Período de facturación|it=Periodo di fatturazione|nl=Factuurperiode|pt=Período de faturação|pl=Okres rozliczeniowy|cs=Fakturační období|sk=Fakturačné obdobie|sl=Obračunsko obdobje|hr=Obračunsko razdoblje|hu=Elszámolási időszak|ro=Perioada de facturare|bg=Период на фактуриране|el=Περίοδος τιμολόγησης|da=Faktureringsperiode|sv=Faktureringsperiod|nb=Faktureringsperiode|fi=Laskutuskausi|et=Arveldusperiood|lv=Norēķinu periods|lt=Atsiskaitymo laikotarpis|is=Reikningstímabil|mt=Perjodu tal-fatturazzjoni|ga=Tréimhse sonrascaithe|ca=Període de facturació|eu=Fakturazio-aldia|gl=Período de facturación|</xsl:when>
                <xsl:when test="$k='delivery'">|tr=Teslim tarihi|en=Delivery date|de=Lieferdatum|fr=Date de livraison|es=Fecha de entrega|it=Data consegna|nl=Leverdatum|pt=Data de entrega|pl=Data dostawy|cs=Datum dodání|sk=Dátum dodania|sl=Datum dobave|hr=Datum isporuke|hu=Teljesítés dátuma|ro=Data livrării|bg=Дата на доставка|el=Ημερομηνία παράδοσης|da=Leveringsdato|sv=Leveransdatum|nb=Leveringsdato|fi=Toimituspäivä|et=Tarnekuupäev|lv=Piegādes datums|lt=Pristatymo data|is=Afhendingardagur|mt=Data tal-kunsinna|ga=Dáta seachadta|ca=Data de lliurament|eu=Entrega-data|gl=Data de entrega|</xsl:when>
                <xsl:when test="$k='deliverTo'">|tr=Teslim yeri|en=Deliver to|de=Lieferanschrift|fr=Lieu de livraison|es=Lugar de entrega|it=Luogo di consegna|nl=Afleveradres|pt=Local de entrega|pl=Miejsce dostawy|cs=Místo dodání|sk=Miesto dodania|sl=Naslov dobave|hr=Mjesto isporuke|hu=Szállítási cím|ro=Livrare la|bg=Място на доставка|el=Τόπος παράδοσης|da=Leveringsadresse|sv=Leveransadress|nb=Leveringsadresse|fi=Toimitusosoite|et=Tarneaadress|lv=Piegādes adrese|lt=Pristatymo adresas|is=Afhendingarstaður|mt=Post tal-kunsinna|ga=Seoladh seachadta|ca=Lloc de lliurament|eu=Entrega-lekua|gl=Lugar de entrega|</xsl:when>
                <xsl:when test="$k='seller'">|tr=Satıcı|en=Seller|de=Verkäufer|fr=Vendeur|es=Vendedor|it=Venditore|nl=Verkoper|pt=Vendedor|pl=Sprzedawca|cs=Dodavatel|sk=Dodávateľ|sl=Prodajalec|hr=Prodavatelj|hu=Eladó|ro=Vânzător|bg=Доставчик|el=Πωλητής|da=Sælger|sv=Säljare|nb=Selger|fi=Myyjä|et=Müüja|lv=Pārdevējs|lt=Pardavėjas|is=Seljandi|mt=Bejjiegħ|ga=Díoltóir|ca=Venedor|eu=Saltzailea|gl=Vendedor|</xsl:when>
                <xsl:when test="$k='buyer'">|tr=Alıcı|en=Buyer|de=Käufer|fr=Acheteur|es=Comprador|it=Acquirente|nl=Koper|pt=Adquirente|pl=Nabywca|cs=Odběratel|sk=Odberateľ|sl=Kupec|hr=Kupac|hu=Vevő|ro=Cumpărător|bg=Получател|el=Αγοραστής|da=Køber|sv=Köpare|nb=Kjøper|fi=Ostaja|et=Ostja|lv=Pircējs|lt=Pirkėjas|is=Kaupandi|mt=Xerrej|ga=Ceannaitheoir|ca=Comprador|eu=Eroslea|gl=Comprador|</xsl:when>
                <xsl:when test="$k='payee'">|tr=Ödeme alacak taraf|en=Payee|de=Zahlungsempfänger|fr=Bénéficiaire|es=Beneficiario|it=Beneficiario|nl=Begunstigde|pt=Beneficiário|pl=Odbiorca płatności|cs=Příjemce platby|sk=Príjemca platby|sl=Prejemnik plačila|hr=Primatelj plaćanja|hu=Kedvezményezett|ro=Beneficiar plată|bg=Получател на плащането|el=Δικαιούχος πληρωμής|da=Betalingsmodtager|sv=Betalningsmottagare|nb=Betalingsmottaker|fi=Maksunsaaja|et=Makse saaja|lv=Maksājuma saņēmējs|lt=Mokėjimo gavėjas|is=Greiðsluviðtakandi|mt=Benefiċjarju|ga=Íocaí|ca=Beneficiari|eu=Onuraduna|gl=Beneficiario|</xsl:when>
                <xsl:when test="$k='vat'">|tr=KDV no|en=VAT ID|de=USt-IdNr.|fr=N° TVA|es=NIF-IVA|it=Partita IVA|nl=Btw-nummer|pt=N.º de IVA|pl=NIP|cs=DIČ|sk=IČ DPH|sl=ID za DDV|hr=PDV ID broj|hu=Közösségi adószám|ro=Cod TVA|bg=ДДС №|el=Αρ. ΦΠΑ|da=Momsnr.|sv=Momsreg.nr|nb=Mva-nr.|fi=ALV-tunniste|et=KMKR nr|lv=PVN reģ. nr.|lt=PVM mokėtojo kodas|is=VSK-númer|mt=Nru tal-VAT|ga=Uimhir CBL|ca=NIF-IVA|eu=IFZ-BEZ|gl=NIF-IVE|</xsl:when>
                <xsl:when test="$k='taxNo'">|tr=Vergi no|en=Tax number|de=Steuernummer|fr=N° fiscal|es=N.º fiscal|it=Codice fiscale|nl=Fiscaal nummer|pt=NIF|pl=Numer podatkowy|cs=Daňové číslo|sk=DIČ|sl=Davčna številka|hr=Porezni broj|hu=Adószám|ro=Cod fiscal|bg=Данъчен номер|el=ΑΦΜ|da=Skattenr.|sv=Skattenummer|nb=Skattenummer|fi=Veronumero|et=Maksunumber|lv=Nodokļu maksātāja nr.|lt=Mokesčių mokėtojo kodas|is=Skattnúmer|mt=Nru tat-taxxa (TIN)|ga=Uimhir chánach|ca=NIF|eu=IFZ|gl=NIF|</xsl:when>
                <xsl:when test="$k='reg'">|tr=Sicil no|en=Legal registration|de=Registernummer|fr=Identifiant légal|es=Identificador legal|it=Iscrizione registro imprese|nl=Registratienummer|pt=Registo comercial|pl=Numer rejestrowy|cs=IČO|sk=IČO|sl=Matična številka|hr=Matični broj|hu=Cégjegyzékszám|ro=Nr. Reg. Com.|bg=ЕИК|el=Αρ. μητρώου|da=CVR-nr.|sv=Org.nr|nb=Org.nr.|fi=Y-tunnus|et=Registrikood|lv=Reģ. nr.|lt=Įmonės kodas|is=Kennitala|mt=Reġistrazzjoni legali|ga=Clárú dlíthiúil|ca=Identificador legal|eu=Identifikatzaile legala|gl=Identificador legal|</xsl:when>
                <xsl:when test="$k='endpoint'">|tr=Elektronik adres|en=Electronic address|de=Elektronische Adresse|fr=Adresse électronique|es=Dirección electrónica|it=Indirizzo elettronico|nl=Elektronisch adres|pt=Endereço eletrónico|pl=Adres elektroniczny|cs=Elektronická adresa|sk=Elektronická adresa|sl=Elektronski naslov|hr=Elektronička adresa|hu=Elektronikus cím|ro=Adresă electronică|bg=Електронен адрес|el=Ηλεκτρονική διεύθυνση|da=Elektronisk adresse|sv=Elektronisk adress|nb=Elektronisk adresse|fi=Verkkolaskuosoite|et=E-arve aadress|lv=Elektroniskā adrese|lt=Elektroninis adresas|is=Rafrænt heimilisfang|mt=Indirizz elettroniku|ga=Seoladh leictreonach|ca=Adreça electrònica|eu=Helbide elektronikoa|gl=Enderezo electrónico|</xsl:when>
                <xsl:when test="$k='contact'">|tr=İletişim|en=Contact|de=Kontakt|fr=Contact|es=Contacto|it=Referente|nl=Contactpersoon|pt=Contacto|pl=Kontakt|cs=Kontakt|sk=Kontakt|sl=Kontakt|hr=Kontakt|hu=Kapcsolattartó|ro=Contact|bg=Контакт|el=Επικοινωνία|da=Kontaktperson|sv=Kontaktperson|nb=Kontaktperson|fi=Yhteyshenkilö|et=Kontaktisik|lv=Kontaktpersona|lt=Kontaktinis asmuo|is=Tengiliður|mt=Kuntatt|ga=Teagmháil|ca=Contacte|eu=Harremana|gl=Contacto|</xsl:when>
                <xsl:when test="$k='lines'">|tr=Kalemler|en=Invoice lines|de=Rechnungspositionen|fr=Lignes de facture|es=Líneas de factura|it=Righe fattura|nl=Factuurregels|pt=Linhas da fatura|pl=Pozycje faktury|cs=Položky faktury|sk=Položky faktúry|sl=Postavke računa|hr=Stavke računa|hu=Számlatételek|ro=Linii factură|bg=Стоки и услуги|el=Γραμμές τιμολογίου|da=Fakturalinjer|sv=Fakturarader|nb=Fakturalinjer|fi=Laskurivit|et=Arveread|lv=Rēķina rindas|lt=Sąskaitos eilutės|is=Reikningslínur|mt=Linji tal-fattura|ga=Línte sonraisc|ca=Línies de factura|eu=Fakturaren lerroak|gl=Liñas da factura|</xsl:when>
                <xsl:when test="$k='pos'">|tr=#|en=#|de=Pos.|fr=N°|es=N.º|it=N.|nl=Nr.|pt=N.º|pl=Lp.|cs=Č.|sk=Č.|sl=Zap. št.|hr=R. br.|hu=Ssz.|ro=Nr.|bg=№|el=Α/Α|da=Nr.|sv=Nr|nb=Nr.|fi=Nro|et=Nr|lv=Nr.|lt=Eil. Nr.|is=Nr.|mt=Nru|ga=Uimh.|ca=Núm.|eu=Zk.|gl=N.º|</xsl:when>
                <xsl:when test="$k='item'">|tr=Açıklama|en=Description|de=Bezeichnung|fr=Désignation|es=Descripción|it=Descrizione|nl=Omschrijving|pt=Descrição|pl=Nazwa|cs=Popis|sk=Popis|sl=Opis|hr=Opis|hu=Megnevezés|ro=Descriere|bg=Наименование|el=Περιγραφή|da=Beskrivelse|sv=Beskrivning|nb=Beskrivelse|fi=Kuvaus|et=Kirjeldus|lv=Nosaukums|lt=Pavadinimas|is=Lýsing|mt=Deskrizzjoni|ga=Cur síos|ca=Descripció|eu=Deskribapena|gl=Descrición|</xsl:when>
                <xsl:when test="$k='itemNo'">|tr=Ürün kodu|en=Item no.|de=Art.-Nr.|fr=Réf.|es=Ref.|it=Codice art.|nl=Art.nr.|pt=Ref. artigo|pl=Kod towaru|cs=Kód|sk=Kód|sl=Šifra|hr=Šifra|hu=Cikkszám|ro=Cod articol|bg=Код|el=Κωδικός|da=Varenr.|sv=Art.nr|nb=Varenr.|fi=Tuotenro|et=Tootekood|lv=Preces kods|lt=Prekės kodas|is=Vörunr.|mt=Nru tal-oġġett|ga=Uimh. míre|ca=Ref.|eu=Erref.|gl=Ref.|</xsl:when>
                <xsl:when test="$k='qty'">|tr=Miktar|en=Quantity|de=Menge|fr=Quantité|es=Cantidad|it=Quantità|nl=Aantal|pt=Quantidade|pl=Ilość|cs=Množství|sk=Množstvo|sl=Količina|hr=Količina|hu=Mennyiség|ro=Cantitate|bg=Количество|el=Ποσότητα|da=Antal|sv=Antal|nb=Antall|fi=Määrä|et=Kogus|lv=Daudzums|lt=Kiekis|is=Magn|mt=Kwantità|ga=Cainníocht|ca=Quantitat|eu=Kantitatea|gl=Cantidade|</xsl:when>
                <xsl:when test="$k='price'">|tr=Birim fiyat|en=Unit price|de=Einzelpreis|fr=Prix unitaire|es=Precio unitario|it=Prezzo unitario|nl=Stukprijs|pt=Preço unitário|pl=Cena jedn. netto|cs=Cena za jedn.|sk=Jedn. cena|sl=Cena na enoto|hr=Jed. cijena|hu=Egységár|ro=Preț unitar|bg=Ед. цена|el=Τιμή μονάδας|da=Enhedspris|sv=À-pris|nb=Enhetspris|fi=À-hinta|et=Ühikuhind|lv=Cena|lt=Kaina|is=Einingarverð|mt=Prezz unitarju|ga=Praghas aonaid|ca=Preu unitari|eu=Unitate-prezioa|gl=Prezo unitario|</xsl:when>
                <xsl:when test="$k='vatRate'">|tr=KDV|en=VAT|de=USt.|fr=TVA|es=IVA|it=IVA|nl=Btw|pt=IVA|pl=VAT|cs=DPH|sk=DPH|sl=DDV|hr=PDV|hu=ÁFA|ro=TVA|bg=ДДС|el=ΦΠΑ|da=Moms|sv=Moms|nb=Mva|fi=ALV|et=KM|lv=PVN|lt=PVM|is=VSK|mt=VAT|ga=CBL|ca=IVA|eu=BEZ|gl=IVE|</xsl:when>
                <xsl:when test="$k='net'">|tr=Net tutar|en=Net amount|de=Nettobetrag|fr=Montant HT|es=Importe neto|it=Importo netto|nl=Nettobedrag|pt=Valor líquido|pl=Wartość netto|cs=Bez DPH|sk=Bez DPH|sl=Neto znesek|hr=Neto iznos|hu=Nettó érték|ro=Valoare netă|bg=Стойност|el=Καθαρή αξία|da=Nettobeløb|sv=Nettobelopp|nb=Nettobeløp|fi=Netto|et=Netosumma|lv=Summa bez PVN|lt=Suma be PVM|is=Nettóupphæð|mt=Ammont nett|ga=Glanmhéid|ca=Import net|eu=Zenbateko garbia|gl=Importe neto|</xsl:when>
                <xsl:when test="$k='allowances'">|tr=İndirim ve masraflar|en=Allowances and charges|de=Nachlässe und Zuschläge|fr=Remises et frais|es=Descuentos y cargos|it=Sconti e maggiorazioni|nl=Kortingen en toeslagen|pt=Descontos e encargos|pl=Rabaty i opłaty dodatkowe|cs=Slevy a příplatky|sk=Zľavy a prirážky|sl=Popusti in doplačila|hr=Popusti i dodatni troškovi|hu=Engedmények és felárak|ro=Reduceri și taxe suplimentare|bg=Отстъпки и надбавки|el=Εκπτώσεις και επιβαρύνσεις|da=Rabatter og gebyrer|sv=Rabatter och avgifter|nb=Rabatter og gebyrer|fi=Alennukset ja lisämaksut|et=Allahindlused ja lisatasud|lv=Atlaides un piemaksas|lt=Nuolaidos ir priemokos|is=Afslættir og gjöld|mt=Skontijiet u ħlasijiet addizzjonali|ga=Lascainí agus muirir|ca=Descomptes i càrrecs|eu=Deskontuak eta kargak|gl=Descontos e cargos|</xsl:when>
                <xsl:when test="$k='allowance'">|tr=İndirim|en=Allowance|de=Nachlass|fr=Remise|es=Descuento|it=Sconto|nl=Korting|pt=Desconto|pl=Rabat|cs=Sleva|sk=Zľava|sl=Popust|hr=Popust|hu=Engedmény|ro=Reducere|bg=Отстъпка|el=Έκπτωση|da=Rabat|sv=Rabatt|nb=Rabatt|fi=Alennus|et=Allahindlus|lv=Atlaide|lt=Nuolaida|is=Afsláttur|mt=Skont|ga=Lascaine|ca=Descompte|eu=Deskontua|gl=Desconto|</xsl:when>
                <xsl:when test="$k='charge'">|tr=Masraf|en=Charge|de=Zuschlag|fr=Frais|es=Cargo|it=Maggiorazione|nl=Toeslag|pt=Encargo|pl=Opłata dodatkowa|cs=Příplatek|sk=Prirážka|sl=Doplačilo|hr=Dodatni trošak|hu=Felár|ro=Taxă suplimentară|bg=Надбавка|el=Επιβάρυνση|da=Gebyr|sv=Avgift|nb=Gebyr|fi=Lisämaksu|et=Lisatasu|lv=Piemaksa|lt=Priemoka|is=Gjald|mt=Ħlas addizzjonali|ga=Muirear|ca=Càrrec|eu=Karga|gl=Cargo|</xsl:when>
                <xsl:when test="$k='vatBreakdown'">|tr=KDV dökümü|en=VAT breakdown|de=Umsatzsteuer-Aufschlüsselung|fr=Ventilation de la TVA|es=Desglose del IVA|it=Riepilogo IVA|nl=Btw-specificatie|pt=Resumo do IVA|pl=Zestawienie VAT|cs=Rekapitulace DPH|sk=Rekapitulácia DPH|sl=Rekapitulacija DDV|hr=Rekapitulacija PDV-a|hu=ÁFA-összesítő|ro=Defalcare TVA|bg=ДДС по ставки|el=Ανάλυση ΦΠΑ|da=Momsspecifikation|sv=Momsspecifikation|nb=Mva-spesifikasjon|fi=ALV-erittely|et=Käibemaksu jaotus|lv=PVN sadalījums|lt=PVM suvestinė|is=Sundurliðun VSK|mt=Tqassim tal-VAT|ga=Miondealú CBL|ca=Desglossament de l’IVA|eu=BEZaren xehapena|gl=Desagregación do IVE|</xsl:when>
                <xsl:when test="$k='category'">|tr=Kategori|en=Category|de=Kategorie|fr=Catégorie|es=Categoría|it=Categoria|nl=Categorie|pt=Categoria|pl=Kategoria|cs=Kategorie|sk=Kategória|sl=Kategorija|hr=Kategorija|hu=Kategória|ro=Categorie|bg=Категория|el=Κατηγορία|da=Kategori|sv=Kategori|nb=Kategori|fi=Luokka|et=Kategooria|lv=Kategorija|lt=Kategorija|is=Flokkur|mt=Kategorija|ga=Catagóir|ca=Categoria|eu=Kategoria|gl=Categoría|</xsl:when>
                <xsl:when test="$k='taxable'">|tr=Matrah|en=Taxable amount|de=Bemessungsgrundlage|fr=Base HT|es=Base imponible|it=Imponibile|nl=Grondslag|pt=Incidência|pl=Podstawa|cs=Základ daně|sk=Základ dane|sl=Davčna osnova|hr=Porezna osnovica|hu=Adóalap|ro=Bază impozabilă|bg=Данъчна основа|el=Φορολογητέα αξία|da=Momsgrundlag|sv=Underlag|nb=Grunnlag|fi=Veron peruste|et=Maksustatav summa|lv=Apliekamā summa|lt=Apmokestinamoji vertė|is=Skattstofn|mt=Ammont taxxabbli|ga=Méid incháinithe|ca=Base imposable|eu=Zerga-oinarria|gl=Base impoñible|</xsl:when>
                <xsl:when test="$k='taxAmount'">|tr=KDV tutarı|en=VAT amount|de=Steuerbetrag|fr=Montant TVA|es=Cuota de IVA|it=Imposta|nl=Btw-bedrag|pt=Valor do IVA|pl=Kwota VAT|cs=Výše DPH|sk=Výška DPH|sl=Znesek DDV|hr=Iznos PDV-a|hu=ÁFA összege|ro=Valoare TVA|bg=Сума на ДДС|el=Ποσό ΦΠΑ|da=Momsbeløb|sv=Momsbelopp|nb=Mva-beløp|fi=ALV:n määrä|et=Käibemaks|lv=PVN summa|lt=PVM suma|is=VSK-upphæð|mt=Ammont tal-VAT|ga=Méid CBL|ca=Quota d’IVA|eu=BEZ kuota|gl=Cota de IVE|</xsl:when>
                <xsl:when test="$k='sumLines'">|tr=Kalemler toplamı|en=Sum of line net amounts|de=Summe Positionen netto|fr=Total lignes HT|es=Suma de líneas|it=Totale righe|nl=Som nettoregelbedragen|pt=Soma das linhas|pl=Suma wartości netto pozycji|cs=Součet položek bez DPH|sk=Súčet položiek bez DPH|sl=Vsota neto zneskov postavk|hr=Zbroj neto iznosa stavki|hu=Tételek nettó összege|ro=Total linii|bg=Сума на редовете без ДДС|el=Σύνολο γραμμών|da=Sum af linjer netto|sv=Summa rader netto|nb=Sum linjer netto|fi=Rivit yhteensä|et=Ridade netosumma|lv=Rindu summa bez PVN|lt=Eilučių suma be PVM|is=Samtala nettóupphæða lína|mt=Total tal-linji|ga=Suim na nglanmhéideanna líne|ca=Suma de línies|eu=Lerroen batura|gl=Suma de liñas|</xsl:when>
                <xsl:when test="$k='totalAllow'">|tr=İndirimler|en=Allowances|de=Nachlässe|fr=Remises|es=Descuentos|it=Sconti|nl=Kortingen|pt=Descontos|pl=Rabaty|cs=Slevy|sk=Zľavy|sl=Popusti|hr=Popusti|hu=Engedmények|ro=Reduceri|bg=Отстъпки|el=Εκπτώσεις|da=Rabatter|sv=Rabatter|nb=Rabatter|fi=Alennukset|et=Allahindlused|lv=Atlaides|lt=Nuolaidos|is=Afslættir|mt=Skontijiet|ga=Lascainí|ca=Descomptes|eu=Deskontuak|gl=Descontos|</xsl:when>
                <xsl:when test="$k='totalCharge'">|tr=Masraflar|en=Charges|de=Zuschläge|fr=Frais|es=Cargos|it=Maggiorazioni|nl=Toeslagen|pt=Encargos|pl=Opłaty dodatkowe|cs=Příplatky|sk=Prirážky|sl=Doplačila|hr=Dodatni troškovi|hu=Felárak|ro=Taxe suplimentare|bg=Надбавки|el=Επιβαρύνσεις|da=Gebyrer|sv=Avgifter|nb=Gebyrer|fi=Lisämaksut|et=Lisatasud|lv=Piemaksas|lt=Priemokos|is=Gjöld|mt=Ħlasijiet addizzjonali|ga=Muirir|ca=Càrrecs|eu=Kargak|gl=Cargos|</xsl:when>
                <xsl:when test="$k='taxExcl'">|tr=KDV hariç toplam|en=Total without VAT|de=Gesamt netto|fr=Total HT|es=Total sin IVA|it=Totale IVA esclusa|nl=Totaal excl. btw|pt=Total sem IVA|pl=Razem netto|cs=Celkem bez DPH|sk=Spolu bez DPH|sl=Skupaj brez DDV|hr=Ukupno bez PDV-a|hu=Nettó összesen|ro=Total fără TVA|bg=Общо без ДДС|el=Σύνολο χωρίς ΦΠΑ|da=I alt ekskl. moms|sv=Summa exkl. moms|nb=Sum ekskl. mva|fi=Yhteensä veroton|et=Summa käibemaksuta|lv=Kopā bez PVN|lt=Iš viso be PVM|is=Samtals án VSK|mt=Total mingħajr VAT|ga=Iomlán gan CBL|ca=Total sense IVA|eu=Guztira BEZik gabe|gl=Total sen IVE|</xsl:when>
                <xsl:when test="$k='taxTotal'">|tr=KDV toplamı|en=Total VAT|de=Umsatzsteuer|fr=Total TVA|es=Total IVA|it=Totale IVA|nl=Totaal btw|pt=Total do IVA|pl=Razem VAT|cs=DPH celkem|sk=DPH spolu|sl=Skupaj DDV|hr=Ukupno PDV|hu=ÁFA összesen|ro=Total TVA|bg=Общо ДДС|el=Σύνολο ΦΠΑ|da=Moms i alt|sv=Summa moms|nb=Sum mva|fi=ALV yhteensä|et=Käibemaks kokku|lv=PVN kopā|lt=PVM iš viso|is=VSK samtals|mt=Total tal-VAT|ga=CBL iomlán|ca=Total IVA|eu=BEZa guztira|gl=Total IVE|</xsl:when>
                <xsl:when test="$k='taxAccounting'">|tr=KDV (muhasebe para birimi)|en=VAT in accounting currency|de=USt. in Buchungswährung|fr=TVA en devise de comptabilisation|es=IVA en moneda contable|it=IVA in valuta contabile|nl=Btw in boekingsvaluta|pt=IVA na moeda contabilística|pl=VAT w walucie rozliczenia|cs=DPH v účetní měně|sk=DPH v účtovnej mene|sl=DDV v valuti obračuna|hr=PDV u obračunskoj valuti|hu=ÁFA az elszámolási pénznemben|ro=TVA în moneda contabilă|bg=ДДС в отчетна валута|el=ΦΠΑ σε λογιστικό νόμισμα|da=Moms i regnskabsvaluta|sv=Moms i redovisningsvaluta|nb=Mva i regnskapsvaluta|fi=ALV kirjanpitovaluutassa|et=KM arvestusvaluutas|lv=PVN uzskaites valūtā|lt=PVM apskaitos valiuta|is=VSK í uppgjörsgjaldmiðli|mt=VAT fil-munita tal-kontabilità|ga=CBL san airgeadra cuntasaíochta|ca=IVA en moneda comptable|eu=BEZa kontabilitate-monetan|gl=IVE en moeda contable|</xsl:when>
                <xsl:when test="$k='taxIncl'">|tr=KDV dahil toplam|en=Total with VAT|de=Gesamt brutto|fr=Total TTC|es=Total con IVA|it=Totale IVA inclusa|nl=Totaal incl. btw|pt=Total com IVA|pl=Razem brutto|cs=Celkem s DPH|sk=Spolu s DPH|sl=Skupaj z DDV|hr=Ukupno s PDV-om|hu=Bruttó összesen|ro=Total cu TVA|bg=Общо с ДДС|el=Σύνολο με ΦΠΑ|da=I alt inkl. moms|sv=Summa inkl. moms|nb=Sum inkl. mva|fi=Yhteensä verollinen|et=Summa käibemaksuga|lv=Kopā ar PVN|lt=Iš viso su PVM|is=Samtals með VSK|mt=Total inkluż il-VAT|ga=Iomlán le CBL|ca=Total amb IVA|eu=Guztira BEZa barne|gl=Total con IVE|</xsl:when>
                <xsl:when test="$k='prepaid'">|tr=Ödenen tutar|en=Paid amount|de=Bereits bezahlt|fr=Acompte versé|es=Importe pagado|it=Importo pagato|nl=Reeds betaald|pt=Valor pago|pl=Zapłacono|cs=Uhrazeno|sk=Uhradené|sl=Plačano|hr=Plaćeno|hu=Kifizetett összeg|ro=Sumă plătită|bg=Платено|el=Καταβληθέν ποσό|da=Betalt beløb|sv=Betalt belopp|nb=Betalt beløp|fi=Maksettu|et=Tasutud|lv=Samaksāts|lt=Sumokėta|is=Greitt|mt=Ammont imħallas|ga=Méid íoctha|ca=Import pagat|eu=Ordaindutako zenbatekoa|gl=Importe pagado|</xsl:when>
                <xsl:when test="$k='rounding'">|tr=Yuvarlama|en=Rounding|de=Rundung|fr=Arrondi|es=Redondeo|it=Arrotondamento|nl=Afronding|pt=Arredondamento|pl=Zaokrąglenie|cs=Zaokrouhlení|sk=Zaokrúhlenie|sl=Zaokrožitev|hr=Zaokruživanje|hu=Kerekítés|ro=Rotunjire|bg=Закръгляне|el=Στρογγυλοποίηση|da=Afrunding|sv=Öresavrundning|nb=Øreavrunding|fi=Pyöristys|et=Ümardus|lv=Noapaļošana|lt=Apvalinimas|is=Námundun|mt=Arrotondament|ga=Slánú|ca=Arrodoniment|eu=Biribiltzea|gl=Arredondamento|</xsl:when>
                <xsl:when test="$k='payable'">|tr=Ödenecek tutar|en=Amount due|de=Zahlbetrag|fr=Net à payer|es=Importe a pagar|it=Totale da pagare|nl=Te betalen|pt=Total a pagar|pl=Do zapłaty|cs=K úhradě|sk=Na úhradu|sl=Za plačilo|hr=Za platiti|hu=Fizetendő|ro=Total de plată|bg=Сума за плащане|el=Πληρωτέο ποσό|da=Til betaling|sv=Att betala|nb=Å betale|fi=Maksettava|et=Tasuda|lv=Summa apmaksai|lt=Mokėtina suma|is=Til greiðslu|mt=Ammont dovut|ga=Méid dlite|ca=Import a pagar|eu=Ordaintzeko zenbatekoa|gl=Importe a pagar|</xsl:when>
                <xsl:when test="$k='payment'">|tr=Ödeme bilgileri|en=Payment details|de=Zahlungsinformationen|fr=Modalités de paiement|es=Datos de pago|it=Dati di pagamento|nl=Betalingsgegevens|pt=Dados de pagamento|pl=Dane do płatności|cs=Platební údaje|sk=Platobné údaje|sl=Podatki za plačilo|hr=Podaci za plaćanje|hu=Fizetési adatok|ro=Date de plată|bg=Данни за плащане|el=Στοιχεία πληρωμής|da=Betalingsoplysninger|sv=Betalningsuppgifter|nb=Betalingsinformasjon|fi=Maksutiedot|et=Makseandmed|lv=Maksājuma informācija|lt=Mokėjimo informacija|is=Greiðsluupplýsingar|mt=Dettalji tal-ħlas|ga=Sonraí íocaíochta|ca=Dades de pagament|eu=Ordainketa-datuak|gl=Datos de pagamento|</xsl:when>
                <xsl:when test="$k='means'">|tr=Ödeme şekli|en=Payment means|de=Zahlungsart|fr=Moyen de paiement|es=Medio de pago|it=Modalità di pagamento|nl=Betaalwijze|pt=Meio de pagamento|pl=Forma płatności|cs=Způsob platby|sk=Spôsob úhrady|sl=Način plačila|hr=Način plaćanja|hu=Fizetési mód|ro=Modalitate de plată|bg=Начин на плащане|el=Τρόπος πληρωμής|da=Betalingsform|sv=Betalningssätt|nb=Betalingsmåte|fi=Maksutapa|et=Makseviis|lv=Maksājuma veids|lt=Mokėjimo būdas|is=Greiðslumáti|mt=Mezz ta’ ħlas|ga=Modh íocaíochta|ca=Mitjà de pagament|eu=Ordainbidea|gl=Medio de pagamento|</xsl:when>
                <xsl:when test="$k='accountName'">|tr=Hesap sahibi|en=Account name|de=Kontoinhaber|fr=Titulaire du compte|es=Titular de la cuenta|it=Intestatario del conto|nl=Ten name van|pt=Titular da conta|pl=Posiadacz rachunku|cs=Majitel účtu|sk=Majiteľ účtu|sl=Imetnik računa|hr=Vlasnik računa|hu=Számlatulajdonos|ro=Titular cont|bg=Титуляр на сметката|el=Δικαιούχος λογαριασμού|da=Kontonavn|sv=Kontonamn|nb=Kontonavn|fi=Tilin nimi|et=Konto omanik|lv=Konta īpašnieks|lt=Sąskaitos savininkas|is=Reikningseigandi|mt=Isem tal-kont|ga=Ainm an chuntais|ca=Titular del compte|eu=Kontuaren titularra|gl=Titular da conta|</xsl:when>
                <xsl:when test="$k='remittance'">|tr=Ödeme açıklaması|en=Payment reference|de=Verwendungszweck|fr=Référence de paiement|es=Referencia de pago|it=Causale di pagamento|nl=Betalingskenmerk|pt=Referência de pagamento|pl=Tytuł przelewu|cs=Variabilní symbol|sk=Variabilný symbol|sl=Sklic plačila|hr=Poziv na broj|hu=Közlemény|ro=Referință plată|bg=Основание за плащане|el=Αιτιολογία πληρωμής|da=Betalingsreference|sv=Betalningsreferens|nb=KID / betalingsreferanse|fi=Viitenumero|et=Viitenumber|lv=Maksājuma mērķis|lt=Mokėjimo paskirtis|is=Greiðslutilvísun|mt=Referenza tal-ħlas|ga=Tagairt íocaíochta|ca=Referència de pagament|eu=Ordainketa-erreferentzia|gl=Referencia de pagamento|</xsl:when>
                <xsl:when test="$k='mandate'">|tr=Talimat no|en=Mandate reference|de=Mandatsreferenz|fr=Référence de mandat|es=Referencia de mandato|it=Rif. mandato|nl=Machtigingskenmerk|pt=Ref. da autorização|pl=Numer mandatu|cs=Mandát k inkasu|sk=Mandát na inkaso|sl=Sklic soglasja|hr=Referenca suglasnosti|hu=Megbízás azonosítója|ro=Ref. mandat|bg=Мандат за директен дебит|el=Αναφορά εντολής|da=Mandatreference|sv=Medgivandereferens|nb=Fullmaktsreferanse|fi=Valtuutuksen viite|et=Volituse viide|lv=Pilnvaras atsauce|lt=Sutikimo nuoroda|is=Tilvísun heimildar|mt=Ref. tal-mandat|ga=Tagairt an tsainordaithe|ca=Referència del mandat|eu=Aginduaren erreferentzia|gl=Referencia do mandato|</xsl:when>
                <xsl:when test="$k='card'">|tr=Kart|en=Card|de=Karte|fr=Carte|es=Tarjeta|it=Carta|nl=Kaart|pt=Cartão|pl=Karta|cs=Karta|sk=Karta|sl=Kartica|hr=Kartica|hu=Kártya|ro=Card|bg=Карта|el=Κάρτα|da=Kort|sv=Kort|nb=Kort|fi=Kortti|et=Kaart|lv=Karte|lt=Kortelė|is=Kort|mt=Karta|ga=Cárta|ca=Targeta|eu=Txartela|gl=Tarxeta|</xsl:when>
                <xsl:when test="$k='terms'">|tr=Ödeme koşulları|en=Payment terms|de=Zahlungsbedingungen|fr=Conditions de paiement|es=Condiciones de pago|it=Condizioni di pagamento|nl=Betalingsvoorwaarden|pt=Condições de pagamento|pl=Warunki płatności|cs=Platební podmínky|sk=Platobné podmienky|sl=Plačilni pogoji|hr=Uvjeti plaćanja|hu=Fizetési feltételek|ro=Condiții de plată|bg=Условия за плащане|el=Όροι πληρωμής|da=Betalingsbetingelser|sv=Betalningsvillkor|nb=Betalingsbetingelser|fi=Maksuehdot|et=Maksetingimused|lv=Apmaksas noteikumi|lt=Mokėjimo sąlygos|is=Greiðsluskilmálar|mt=Termini tal-ħlas|ga=Téarmaí íocaíochta|ca=Condicions de pagament|eu=Ordainketa-baldintzak|gl=Condicións de pagamento|</xsl:when>
                <xsl:when test="$k='notes'">|tr=Notlar|en=Notes|de=Hinweise|fr=Remarques|es=Notas|it=Note|nl=Opmerkingen|pt=Observações|pl=Uwagi|cs=Poznámky|sk=Poznámky|sl=Opombe|hr=Napomene|hu=Megjegyzések|ro=Mențiuni|bg=Забележки|el=Παρατηρήσεις|da=Bemærkninger|sv=Noteringar|nb=Merknader|fi=Lisätiedot|et=Märkused|lv=Piezīmes|lt=Pastabos|is=Athugasemdir|mt=Noti|ga=Nótaí|ca=Notes|eu=Oharrak|gl=Notas|</xsl:when>
                <xsl:when test="$k='legal'">|tr=Bu görünüm XML faturanın okunabilir sunumudur; hukuken geçerli belge XML dosyasıdır.|en=This is a human-readable rendering; the XML file is the legally valid invoice.|de=Diese Ansicht ist eine lesbare Darstellung; rechtlich maßgeblich ist die XML-Datei.|fr=Cette vue est une représentation lisible ; la facture légale est le fichier XML.|es=Esta vista es una representación legible; la factura legal es el archivo XML.|it=Questa è una rappresentazione leggibile; la fattura con valore legale è il file XML.|nl=Dit is een leesbare weergave; het XML-bestand is de rechtsgeldige factuur.|pt=Esta é uma representação legível; a fatura juridicamente válida é o ficheiro XML.|pl=To jest wizualizacja dokumentu; prawnie wiążącą fakturą jest plik XML.|cs=Toto je čitelné zobrazení; právně platnou fakturou je soubor XML.|sk=Toto je čitateľné zobrazenie; právne platnou faktúrou je súbor XML.|sl=To je berljiv prikaz; pravno veljaven račun je datoteka XML.|hr=Ovo je čitljiv prikaz; pravno valjani račun je XML datoteka.|hu=Ez egy olvasható megjelenítés; a jogilag érvényes számla az XML-fájl.|ro=Aceasta este o reprezentare lizibilă; factura valabilă din punct de vedere legal este fișierul XML.|bg=Това е визуализация за четене; юридически валидната фактура е XML файлът.|el=Η παρούσα είναι αναγνώσιμη απεικόνιση, το νομικά έγκυρο τιμολόγιο είναι το αρχείο XML.|da=Dette er en læsbar visning; XML-filen er den juridisk gyldige faktura.|sv=Detta är en läsbar återgivning; XML-filen är den juridiskt giltiga fakturan.|nb=Dette er en lesbar visning; XML-filen er den juridisk gyldige fakturaen.|fi=Tämä on luettava esitys; oikeudellisesti pätevä lasku on XML-tiedosto.|et=See on inimloetav esitus; juriidiliselt kehtiv arve on XML-fail.|lv=Šis ir cilvēkam lasāms attēlojums; juridiski derīgais rēķins ir XML fails.|lt=Tai žmogui skaitomas vaizdas; teisiškai galiojanti sąskaita faktūra yra XML failas.|is=Þetta er læsileg framsetning; XML-skráin er hinn lagalega gildi reikningur.|mt=Din hija rappreżentazzjoni li tinqara; il-fattura legalment valida hija l-fajl XML.|ga=Is léiriú inléite é seo; is é an comhad XML an sonrasc atá bailí go dlíthiúil.|ca=Aquesta vista és una representació llegible; la factura amb validesa legal és el fitxer XML.|eu=Ikuspegi hau irakurtzeko moduko irudikapena da; balio juridikoa duen faktura XML fitxategia da.|gl=Esta vista é unha representación lexible; a factura con validez legal é o ficheiro XML.|</xsl:when>
                <xsl:when test="$k='pcs'">|tr=adet|en=pcs|de=Stk.|fr=pce|es=ud.|it=pz|nl=st.|pt=un.|pl=szt.|cs=ks|sk=ks|sl=kos|hr=kom|hu=db|ro=buc.|bg=бр.|el=τεμ.|da=stk.|sv=st|nb=stk.|fi=kpl|et=tk|lv=gab.|lt=vnt.|is=stk.|mt=biċċiet|ga=píosaí|ca=u.|eu=ud.|gl=ud.|</xsl:when>
                <xsl:when test="$k='hour'">|tr=saat|en=h|de=Std.|fr=h|es=h|it=h|nl=uur|pt=h|pl=godz.|cs=hod|sk=hod|sl=ura|hr=sat|hu=óra|ro=h|bg=ч|el=ώρ.|da=t.|sv=tim|nb=t|fi=h|et=h|lv=st.|lt=val.|is=klst.|mt=siegħa|ga=uair|ca=h|eu=h|gl=h|</xsl:when>
                <xsl:when test="$k='day'">|tr=gün|en=day|de=Tag|fr=jour|es=día|it=giorno|nl=dag|pt=dia|pl=dzień|cs=den|sk=deň|sl=dan|hr=dan|hu=nap|ro=zi|bg=ден|el=ημέρα|da=dag|sv=dag|nb=dag|fi=pv|et=päev|lv=d.|lt=d.|is=dagur|mt=jum|ga=lá|ca=dia|eu=egun|gl=día|</xsl:when>
                <xsl:when test="$k='month'">|tr=ay|en=month|de=Monat|fr=mois|es=mes|it=mese|nl=maand|pt=mês|pl=mies.|cs=měs.|sk=mes.|sl=mesec|hr=mjesec|hu=hónap|ro=lună|bg=мес.|el=μήνας|da=md.|sv=mån|nb=mnd.|fi=kk|et=kuu|lv=mēn.|lt=mėn.|is=mánuður|mt=xahar|ga=mí|ca=mes|eu=hilabete|gl=mes|</xsl:when>
                <xsl:when test="$k='lumpsum'">|tr=götürü|en=lump sum|de=pauschal|fr=forfait|es=global|it=forfait|nl=forfait|pt=valor global|pl=ryczałt|cs=paušál|sk=paušál|sl=pavšal|hr=paušal|hu=átalány|ro=forfetar|bg=паушално|el=κατ’ αποκοπή|da=fast pris|sv=fast pris|nb=fastpris|fi=erä|et=kompl|lv=kompl.|lt=kompl.|is=fast gjald|mt=somma f’daqqa|ga=cnapshuim|ca=global|eu=globala|gl=global|</xsl:when>
                <xsl:when test="$k='m10'">|tr=Nakit|en=Cash|de=Bar|fr=Espèces|es=Efectivo|it=Contanti|nl=Contant|pt=Numerário|pl=Gotówka|cs=Hotově|sk=V hotovosti|sl=Gotovina|hr=Gotovina|hu=Készpénz|ro=Numerar|bg=В брой|el=Μετρητά|da=Kontant|sv=Kontant|nb=Kontant|fi=Käteinen|et=Sularaha|lv=Skaidra nauda|lt=Grynieji pinigai|is=Reiðufé|mt=Flus kontanti|ga=Airgead tirim|ca=Efectiu|eu=Eskudirua|gl=Efectivo|</xsl:when>
                <xsl:when test="$k='m30'">|tr=Havale|en=Credit transfer|de=Überweisung|fr=Virement|es=Transferencia|it=Bonifico|nl=Overboeking|pt=Transferência bancária|pl=Przelew|cs=Bankovním převodem|sk=Bankovým prevodom|sl=Nakazilo|hr=Kreditni transfer|hu=Átutalás|ro=Ordin de plată|bg=Банков превод|el=Τραπεζική μεταφορά|da=Bankoverførsel|sv=Banköverföring|nb=Bankoverføring|fi=Tilisiirto|et=Pangaülekanne|lv=Pārskaitījums|lt=Kredito pervedimas|is=Millifærsla|mt=Trasferiment ta’ kreditu|ga=Aistriú creidmheasa|ca=Transferència|eu=Transferentzia|gl=Transferencia|</xsl:when>
                <xsl:when test="$k='m42'">|tr=Banka hesabına ödeme|en=Payment to bank account|de=Zahlung auf Bankkonto|fr=Paiement sur compte bancaire|es=Pago en cuenta bancaria|it=Pagamento su conto bancario|nl=Betaling op bankrekening|pt=Pagamento em conta bancária|pl=Wpłata na rachunek bankowy|cs=Platba na bankovní účet|sk=Platba na bankový účet|sl=Plačilo na bančni račun|hr=Uplata na bankovni račun|hu=Bankszámlára fizetés|ro=Plată în cont bancar|bg=Плащане по банкова сметка|el=Κατάθεση σε τραπεζικό λογαριασμό|da=Betaling til bankkonto|sv=Betalning till bankkonto|nb=Betaling til bankkonto|fi=Maksu pankkitilille|et=Makse pangakontole|lv=Maksājums uz bankas kontu|lt=Mokėjimas į banko sąskaitą|is=Greiðsla inn á bankareikning|mt=Ħlas f’kont bankarju|ga=Íocaíocht chuig cuntas bainc|ca=Pagament en compte bancari|eu=Banku-kontuan ordaintzea|gl=Pagamento en conta bancaria|</xsl:when>
                <xsl:when test="$k='m48'">|tr=Banka kartı|en=Bank card|de=Bankkarte|fr=Carte bancaire|es=Tarjeta bancaria|it=Carta bancaria|nl=Betaalkaart|pt=Cartão bancário|pl=Karta płatnicza|cs=Platební karta|sk=Platobná karta|sl=Bančna kartica|hr=Bankovna kartica|hu=Bankkártya|ro=Card bancar|bg=Банкова карта|el=Τραπεζική κάρτα|da=Betalingskort|sv=Bankkort|nb=Bankkort|fi=Pankkikortti|et=Pangakaart|lv=Bankas karte|lt=Banko kortelė|is=Bankakort|mt=Karta bankarja|ga=Cárta bainc|ca=Targeta bancària|eu=Banku-txartela|gl=Tarxeta bancaria|</xsl:when>
                <xsl:when test="$k='m49'">|tr=Otomatik ödeme|en=Direct debit|de=Lastschrift|fr=Prélèvement|es=Domiciliación|it=Addebito diretto|nl=Automatische incasso|pt=Débito direto|pl=Polecenie zapłaty|cs=Inkaso|sk=Inkaso|sl=Direktna obremenitev|hr=Izravno terećenje|hu=Csoportos beszedés|ro=Debitare directă|bg=Директен дебит|el=Άμεση χρέωση|da=Direkte debitering|sv=Autogiro|nb=Direkte debitering|fi=Suoraveloitus|et=Otsekorraldus|lv=Tiešais debets|lt=Tiesioginis debetas|is=Beingreiðsla|mt=Debitu dirett|ga=Dochar díreach|ca=Domiciliació bancària|eu=Banku-helbideratzea|gl=Domiciliación bancaria|</xsl:when>
                <xsl:when test="$k='m54'">|tr=Kredi kartı|en=Credit card|de=Kreditkarte|fr=Carte de crédit|es=Tarjeta de crédito|it=Carta di credito|nl=Creditcard|pt=Cartão de crédito|pl=Karta kredytowa|cs=Kreditní karta|sk=Kreditná karta|sl=Kreditna kartica|hr=Kreditna kartica|hu=Hitelkártya|ro=Card de credit|bg=Кредитна карта|el=Πιστωτική κάρτα|da=Kreditkort|sv=Kreditkort|nb=Kredittkort|fi=Luottokortti|et=Krediitkaart|lv=Kredītkarte|lt=Kredito kortelė|is=Kreditkort|mt=Karta ta’ kreditu|ga=Cárta creidmheasa|ca=Targeta de crèdit|eu=Kreditu-txartela|gl=Tarxeta de crédito|</xsl:when>
                <xsl:when test="$k='m57'">|tr=Daimi talimat|en=Standing agreement|de=Dauerauftrag|fr=Accord permanent|es=Acuerdo permanente|it=Accordo permanente|nl=Vaste overeenkomst|pt=Acordo permanente|pl=Zlecenie stałe|cs=Trvalý příkaz|sk=Trvalý príkaz|sl=Trajni nalog|hr=Trajni nalog|hu=Állandó megbízás|ro=Acord permanent|bg=Постоянно нареждане|el=Πάγια εντολή|da=Fast aftale|sv=Stående överenskommelse|nb=Fast avtale|fi=Pysyvä sopimus|et=Püsikorraldus|lv=Pastāvīgais rīkojums|lt=Periodinis mokėjimas|is=Fastur greiðslusamningur|mt=Ftehim permanenti|ga=Comhaontú buan|ca=Acord permanent|eu=Akordio iraunkorra|gl=Acordo permanente|</xsl:when>
                <xsl:when test="$k='m58'">|tr=SEPA havale|en=SEPA credit transfer|de=SEPA-Überweisung|fr=Virement SEPA|es=Transferencia SEPA|it=Bonifico SEPA|nl=SEPA-overboeking|pt=Transferência SEPA|pl=Przelew SEPA|cs=Převod SEPA|sk=Prevod SEPA|sl=SEPA nakazilo|hr=SEPA kreditni transfer|hu=SEPA-átutalás|ro=Transfer SEPA|bg=SEPA кредитен превод|el=Μεταφορά πίστωσης SEPA|da=SEPA-overførsel|sv=SEPA-överföring|nb=SEPA-overføring|fi=SEPA-tilisiirto|et=SEPA ülekanne|lv=SEPA pārskaitījums|lt=SEPA kredito pervedimas|is=SEPA-millifærsla|mt=Trasferiment ta’ kreditu SEPA|ga=Aistriú creidmheasa SEPA|ca=Transferència SEPA|eu=SEPA transferentzia|gl=Transferencia SEPA|</xsl:when>
                <xsl:when test="$k='m59'">|tr=SEPA otomatik ödeme|en=SEPA direct debit|de=SEPA-Lastschrift|fr=Prélèvement SEPA|es=Adeudo directo SEPA|it=Addebito diretto SEPA|nl=SEPA-incasso|pt=Débito direto SEPA|pl=Polecenie zapłaty SEPA|cs=Inkaso SEPA|sk=Inkaso SEPA|sl=SEPA direktna obremenitev|hr=SEPA izravno terećenje|hu=SEPA csoportos beszedés|ro=Debitare directă SEPA|bg=SEPA директен дебит|el=Άμεση χρέωση SEPA|da=SEPA direkte debitering|sv=SEPA-autogiro|nb=SEPA direkte debitering|fi=SEPA-suoraveloitus|et=SEPA otsekorraldus|lv=SEPA tiešais debets|lt=SEPA tiesioginis debetas|is=SEPA-beingreiðsla|mt=Debitu dirett SEPA|ga=Dochar díreach SEPA|ca=Càrrec directe SEPA|eu=SEPA zordunketa zuzena|gl=Adebedo directo SEPA|</xsl:when>
                <xsl:when test="$k='catS'">|tr=Standart oran|en=Standard rate|de=Normalsatz|fr=Taux normal|es=Tipo general|it=Aliquota ordinaria|nl=Standaardtarief|pt=Taxa normal|pl=Stawka podstawowa|cs=Základní sazba|sk=Základná sadzba|sl=Splošna stopnja|hr=Standardna stopa|hu=Általános adókulcs|ro=Cotă standard|bg=Стандартна ставка|el=Κανονικός συντελεστής|da=Standardsats|sv=Normalskattesats|nb=Standardsats|fi=Yleinen verokanta|et=Standardmäär|lv=Standarta likme|lt=Standartinis tarifas|is=Almennt þrep|mt=Rata standard|ga=Ráta caighdeánach|ca=Tipus general|eu=Tasa orokorra|gl=Tipo xeral|</xsl:when>
                <xsl:when test="$k='catZ'">|tr=Sıfır oran|en=Zero rated|de=Nullsatz|fr=Taux zéro|es=Tipo cero|it=Aliquota zero|nl=Nultarief|pt=Taxa zero|pl=Stawka 0%|cs=Nulová sazba|sk=Nulová sadzba|sl=Ničelna stopnja|hr=Nulta stopa|hu=Nulla százalékos kulcs|ro=Cotă zero|bg=Нулева ставка|el=Μηδενικός συντελεστής|da=Nulsats|sv=Nollskattesats|nb=Nullsats|fi=Nollaverokanta|et=Nullmäär|lv=Nulles likme|lt=Nulinis tarifas|is=Núllhlutfall|mt=Rata żero|ga=Ráta nialasach|ca=Tipus zero|eu=Zero tasa|gl=Tipo cero|</xsl:when>
                <xsl:when test="$k='catE'">|tr=İstisna|en=Exempt|de=Steuerbefreit|fr=Exonéré|es=Exento|it=Esente|nl=Vrijgesteld|pt=Isento|pl=Zwolnione z VAT|cs=Osvobozeno od DPH|sk=Oslobodené od dane|sl=Oproščeno|hr=Oslobođeno|hu=Adómentes|ro=Scutit|bg=Освободена доставка|el=Απαλλασσόμενο|da=Momsfritaget|sv=Undantagen från moms|nb=Unntatt fra mva|fi=Verovapaa|et=Maksuvaba|lv=Atbrīvots no PVN|lt=Neapmokestinama|is=Undanþegið|mt=Eżenti|ga=Díolmhaithe|ca=Exempt|eu=Salbuetsia|gl=Exento|</xsl:when>
                <xsl:when test="$k='catAE'">|tr=Alıcı tarafından beyan (reverse charge)|en=Reverse charge|de=Steuerschuldnerschaft des Leistungsempfängers|fr=Autoliquidation|es=Inversión del sujeto pasivo|it=Inversione contabile|nl=Btw verlegd|pt=Autoliquidação|pl=Odwrotne obciążenie|cs=Přenesená daňová povinnost|sk=Prenesenie daňovej povinnosti|sl=Obrnjena davčna obveznost|hr=Prijenos porezne obveze|hu=Fordított adózás|ro=Taxare inversă|bg=Обратно начисляване|el=Αντίστροφη επιβάρυνση|da=Omvendt betalingspligt|sv=Omvänd betalningsskyldighet|nb=Omvendt avgiftsplikt|fi=Käännetty verovelvollisuus|et=Pöördmaksustamine|lv=Apgrieztā maksāšana|lt=Atvirkštinis apmokestinimas|is=Öfug skattskylda|mt=Inverżjoni tal-ħlas|ga=Aisiompú muirir|ca=Inversió del subjecte passiu|eu=Subjektu pasiboaren inbertsioa|gl=Inversión do suxeito pasivo|</xsl:when>
                <xsl:when test="$k='catK'">|tr=AB içi teslim|en=Intra-community supply|de=Innergemeinschaftliche Lieferung|fr=Livraison intracommunautaire|es=Entrega intracomunitaria|it=Cessione intracomunitaria|nl=Intracommunautaire levering|pt=Transmissão intracomunitária|pl=Wewnątrzwspólnotowa dostawa towarów|cs=Dodání zboží do jiného členského státu|sk=Dodanie tovaru do iného členského štátu|sl=Dobava znotraj Skupnosti|hr=Isporuka unutar EU|hu=Közösségen belüli értékesítés|ro=Livrare intracomunitară|bg=Вътреобщностна доставка|el=Ενδοκοινοτική παράδοση|da=Levering inden for EU|sv=Unionsintern leverans|nb=Levering innen EU/EØS|fi=Yhteisömyynti|et=Ühendusesisene käive|lv=Piegāde Kopienas iekšienē|lt=Tiekimas Bendrijos viduje|is=Afhending innan ESB|mt=Provvista intra-Komunitarja|ga=Soláthar laistigh den Chomhphobal|ca=Lliurament intracomunitari|eu=Erkidego barruko entrega|gl=Entrega intracomunitaria|</xsl:when>
                <xsl:when test="$k='catG'">|tr=İhracat|en=Export outside the EU|de=Ausfuhrlieferung|fr=Exportation hors UE|es=Exportación|it=Esportazione extra UE|nl=Export buiten de EU|pt=Exportação para fora da UE|pl=Eksport poza UE|cs=Vývoz mimo EU|sk=Vývoz mimo EÚ|sl=Izvoz izven EU|hr=Izvoz izvan EU|hu=EU-n kívüli export|ro=Export în afara UE|bg=Износ извън ЕС|el=Εξαγωγή εκτός ΕΕ|da=Eksport uden for EU|sv=Export utanför EU|nb=Eksport utenfor EU|fi=Vienti EU:n ulkopuolelle|et=Eksport väljapoole ELi|lv=Eksports ārpus ES|lt=Eksportas už ES ribų|is=Útflutningur út fyrir ESB|mt=Esportazzjoni barra mill-UE|ga=Onnmhairiú lasmuigh den AE|ca=Exportació fora de la UE|eu=EBtik kanpoko esportazioa|gl=Exportación fóra da UE|</xsl:when>
                <xsl:when test="$k='catO'">|tr=KDV kapsamı dışı|en=Not subject to VAT|de=Nicht steuerbar|fr=Hors champ de la TVA|es=No sujeto a IVA|it=Fuori campo IVA|nl=Niet onderworpen aan btw|pt=Não sujeito a IVA|pl=Nie podlega opodatkowaniu|cs=Nepodléhá DPH|sk=Nepodlieha DPH|sl=Ni predmet DDV|hr=Nije predmet PDV-a|hu=ÁFA hatályán kívül|ro=Neimpozabil|bg=Не подлежи на облагане с ДДС|el=Εκτός πεδίου ΦΠΑ|da=Ikke momspligtig|sv=Ej föremål för moms|nb=Utenfor mva-området|fi=Ei ALV:n alainen|et=Ei kuulu käibemaksu alla|lv=Neapliekams ar PVN|lt=Ne PVM objektas|is=Utan gildissviðs VSK|mt=Mhux suġġett għall-VAT|ga=Nach bhfuil faoi réir CBL|ca=No subjecte a IVA|eu=BEZaren kargapean ez|gl=Non suxeito a IVE|</xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="hit" select="substring-before(substring-after($row, concat('|', $L, '=')), '|')"/>
        <xsl:choose>
            <xsl:when test="$hit != ''"><xsl:value-of select="$hit"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="substring-before(substring-after($row, '|en='), '|')"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="date">
        <xsl:param name="value"/>
        <xsl:choose>
            <xsl:when test="string-length(normalize-space($value)) &gt;= 10">
                <xsl:call-template name="date-format"><xsl:with-param name="value" select="$value"/></xsl:call-template>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$value"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="date-format">
        <xsl:param name="value"/>
        <xsl:variable name="y" select="substring($value,1,4)"/>
        <xsl:variable name="m" select="substring($value,6,2)"/>
        <xsl:variable name="d" select="substring($value,9,2)"/>
        <xsl:choose>
            <xsl:when test="$L='sv' or $L='lt'"><xsl:value-of select="concat($y,'-',$m,'-',$d)"/></xsl:when>
            <xsl:when test="$L='hu'"><xsl:value-of select="concat($y,'. ',$m,'. ',$d,'.')"/></xsl:when>
            <xsl:when test="$L='nl'"><xsl:value-of select="concat($d,'-',$m,'-',$y)"/></xsl:when>
            <xsl:when test="$L='eu'"><xsl:value-of select="concat($y,'/',$m,'/',$d)"/></xsl:when>
            <xsl:when test="contains('|de|tr|pl|cs|sk|sl|hr|ro|bg|da|nb|fi|et|lv|is|', concat('|', $L, '|'))"><xsl:value-of select="concat($d,'.',$m,'.',$y)"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="concat($d,'/',$m,'/',$y)"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="num">
        <xsl:param name="v"/>
        <xsl:param name="pattern" select="'2'"/>
        <xsl:choose>
            <xsl:when test="string(number($v)) = 'NaN'"><xsl:value-of select="$v"/></xsl:when>
            <xsl:when test="$NS='dot' and $pattern='2'"><xsl:value-of select="format-number(number($v), '#,##0.00', 'dot')"/></xsl:when>
            <xsl:when test="$NS='dot' and $pattern='p'"><xsl:value-of select="format-number(number($v), '#,##0.00##', 'dot')"/></xsl:when>
            <xsl:when test="$NS='dot'"><xsl:value-of select="format-number(number($v), '#,##0.####', 'dot')"/></xsl:when>
            <xsl:when test="$NS='space' and $pattern='2'"><xsl:value-of select="format-number(number($v), '#&#160;##0,00', 'space')"/></xsl:when>
            <xsl:when test="$NS='space' and $pattern='p'"><xsl:value-of select="format-number(number($v), '#&#160;##0,00##', 'space')"/></xsl:when>
            <xsl:when test="$NS='space'"><xsl:value-of select="format-number(number($v), '#&#160;##0,####', 'space')"/></xsl:when>
            <xsl:when test="$pattern='2'"><xsl:value-of select="format-number(number($v), '#.##0,00', 'comma')"/></xsl:when>
            <xsl:when test="$pattern='p'"><xsl:value-of select="format-number(number($v), '#.##0,00##', 'comma')"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="format-number(number($v), '#.##0,####', 'comma')"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="money">
        <xsl:param name="v"/>
        <xsl:param name="cur"/>
        <xsl:call-template name="num"><xsl:with-param name="v" select="$v"/></xsl:call-template>
        <xsl:if test="$cur != ''"><xsl:text>&#160;</xsl:text><xsl:value-of select="$cur"/></xsl:if>
    </xsl:template>

    <xsl:template name="unit">
        <xsl:param name="code"/>
        <xsl:choose>
            <xsl:when test="$code='C62' or $code='H87' or $code='EA' or $code='XPP'"><xsl:call-template name="t"><xsl:with-param name="k">pcs</xsl:with-param></xsl:call-template></xsl:when>
            <xsl:when test="$code='HUR'"><xsl:call-template name="t"><xsl:with-param name="k">hour</xsl:with-param></xsl:call-template></xsl:when>
            <xsl:when test="$code='DAY'"><xsl:call-template name="t"><xsl:with-param name="k">day</xsl:with-param></xsl:call-template></xsl:when>
            <xsl:when test="$code='MON'"><xsl:call-template name="t"><xsl:with-param name="k">month</xsl:with-param></xsl:call-template></xsl:when>
            <xsl:when test="$code='LS'"><xsl:call-template name="t"><xsl:with-param name="k">lumpsum</xsl:with-param></xsl:call-template></xsl:when>
            <xsl:when test="$code='KGM'">kg</xsl:when>
            <xsl:when test="$code='GRM'">g</xsl:when>
            <xsl:when test="$code='TNE'">t</xsl:when>
            <xsl:when test="$code='MTR'">m</xsl:when>
            <xsl:when test="$code='MTK'">m²</xsl:when>
            <xsl:when test="$code='MTQ'">m³</xsl:when>
            <xsl:when test="$code='LTR'">l</xsl:when>
            <xsl:when test="$code='KWH'">kWh</xsl:when>
            <xsl:when test="$code='KMT'">km</xsl:when>
            <xsl:otherwise><xsl:value-of select="$code"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="vat-category">
        <xsl:param name="id"/>
        <xsl:choose>
            <xsl:when test="$id='S' or $id='Z' or $id='E' or $id='AE' or $id='K' or $id='G' or $id='O'">
                <xsl:call-template name="t"><xsl:with-param name="k" select="concat('cat', $id)"/></xsl:call-template>
            </xsl:when>
            <xsl:when test="$id='L'">IGIC</xsl:when>
            <xsl:when test="$id='M'">IPSI</xsl:when>
            <xsl:otherwise><xsl:value-of select="$id"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="means">
        <xsl:param name="code"/>
        <xsl:choose>
            <xsl:when test="$code='10' or $code='30' or $code='42' or $code='48' or $code='49' or $code='54' or $code='57' or $code='58' or $code='59'">
                <xsl:call-template name="t"><xsl:with-param name="k" select="concat('m', $code)"/></xsl:call-template>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$code"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- "#PMT#metin" gibi konu kodlu notlarda kodu gizler. -->
    <xsl:template name="note-text">
        <xsl:param name="text"/>
        <xsl:choose>
            <xsl:when test="starts-with($text, '#') and contains(substring($text, 2), '#')">
                <xsl:value-of select="substring-after(substring($text, 2), '#')"/>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$text"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="party-name">
        <xsl:param name="party"/>
        <xsl:choose>
            <xsl:when test="$party/cac:PartyName/cbc:Name"><xsl:value-of select="$party/cac:PartyName/cbc:Name"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$party/cac:PartyLegalEntity/cbc:RegistrationName"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="address">
        <xsl:param name="a"/>
        <xsl:if test="$a/cbc:StreetName"><div><xsl:value-of select="$a/cbc:StreetName"/></div></xsl:if>
        <xsl:if test="$a/cbc:AdditionalStreetName"><div><xsl:value-of select="$a/cbc:AdditionalStreetName"/></div></xsl:if>
        <xsl:if test="$a/cac:AddressLine/cbc:Line"><div><xsl:value-of select="$a/cac:AddressLine/cbc:Line"/></div></xsl:if>
        <xsl:if test="$a/cbc:PostalZone or $a/cbc:CityName">
            <div>
                <xsl:value-of select="normalize-space(concat($a/cbc:PostalZone, ' ', $a/cbc:CityName))"/>
                <xsl:if test="$a/cbc:CountrySubentity"><xsl:text>, </xsl:text><xsl:value-of select="$a/cbc:CountrySubentity"/></xsl:if>
            </div>
        </xsl:if>
        <xsl:if test="$a/cac:Country/cbc:IdentificationCode"><div class="country"><xsl:value-of select="$a/cac:Country/cbc:IdentificationCode"/></div></xsl:if>
    </xsl:template>

    <xsl:template name="party-card">
        <xsl:param name="party"/>
        <xsl:param name="label"/>
        <div class="party">
            <div class="party-label"><xsl:call-template name="t"><xsl:with-param name="k" select="$label"/></xsl:call-template></div>
            <div class="party-name"><xsl:call-template name="party-name"><xsl:with-param name="party" select="$party"/></xsl:call-template></div>
            <xsl:if test="$party/cac:PartyName/cbc:Name and $party/cac:PartyLegalEntity/cbc:RegistrationName and $party/cac:PartyName/cbc:Name != $party/cac:PartyLegalEntity/cbc:RegistrationName">
                <div class="party-line"><xsl:value-of select="$party/cac:PartyLegalEntity/cbc:RegistrationName"/></div>
            </xsl:if>
            <div class="party-line"><xsl:call-template name="address"><xsl:with-param name="a" select="$party/cac:PostalAddress"/></xsl:call-template></div>
            <table class="ids">
                <xsl:for-each select="$party/cac:PartyTaxScheme[cbc:CompanyID]">
                    <tr>
                        <td>
                            <xsl:choose>
                                <xsl:when test="cac:TaxScheme/cbc:ID='VAT'"><xsl:call-template name="t"><xsl:with-param name="k">vat</xsl:with-param></xsl:call-template></xsl:when>
                                <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k">taxNo</xsl:with-param></xsl:call-template></xsl:otherwise>
                            </xsl:choose>
                        </td>
                        <td><xsl:value-of select="cbc:CompanyID"/></td>
                    </tr>
                </xsl:for-each>
                <xsl:if test="$party/cac:PartyLegalEntity/cbc:CompanyID">
                    <tr>
                        <td><xsl:call-template name="t"><xsl:with-param name="k">reg</xsl:with-param></xsl:call-template></td>
                        <td><xsl:value-of select="$party/cac:PartyLegalEntity/cbc:CompanyID"/></td>
                    </tr>
                </xsl:if>
                <xsl:if test="$party/cbc:EndpointID">
                    <tr>
                        <td><xsl:call-template name="t"><xsl:with-param name="k">endpoint</xsl:with-param></xsl:call-template></td>
                        <td><xsl:if test="$party/cbc:EndpointID/@schemeID"><xsl:value-of select="$party/cbc:EndpointID/@schemeID"/><xsl:text>:</xsl:text></xsl:if><xsl:value-of select="$party/cbc:EndpointID"/></td>
                    </tr>
                </xsl:if>
                <xsl:if test="$party/cac:Contact">
                    <tr>
                        <td><xsl:call-template name="t"><xsl:with-param name="k">contact</xsl:with-param></xsl:call-template></td>
                        <td>
                            <xsl:value-of select="$party/cac:Contact/cbc:Name"/>
                            <xsl:if test="$party/cac:Contact/cbc:Telephone"><div><xsl:value-of select="$party/cac:Contact/cbc:Telephone"/></div></xsl:if>
                            <xsl:if test="$party/cac:Contact/cbc:ElectronicMail"><div><xsl:value-of select="$party/cac:Contact/cbc:ElectronicMail"/></div></xsl:if>
                        </td>
                    </tr>
                </xsl:if>
            </table>
        </div>
    </xsl:template>

    <xsl:template name="meta-row">
        <xsl:param name="k"/>
        <xsl:param name="v"/>
        <xsl:if test="normalize-space($v) != ''">
            <tr>
                <td class="key"><xsl:call-template name="t"><xsl:with-param name="k" select="$k"/></xsl:call-template></td>
                <td class="value"><xsl:value-of select="$v"/></td>
            </tr>
        </xsl:if>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="n1:Invoice | n2:CreditNote"/>
    </xsl:template>

    <xsl:template match="n1:Invoice | n2:CreditNote">
        <xsl:variable name="cur" select="cbc:DocumentCurrencyCode"/>
        <xsl:variable name="typeCode" select="cbc:InvoiceTypeCode | cbc:CreditNoteTypeCode"/>
        <xsl:variable name="titleKey">
            <xsl:choose>
                <xsl:when test="local-name()='CreditNote' or $typeCode='381'">credit</xsl:when>
                <xsl:when test="$typeCode='384'">corrected</xsl:when>
                <xsl:when test="$typeCode='386'">prepayment</xsl:when>
                <xsl:when test="$typeCode='389'">selfbilled</xsl:when>
                <xsl:when test="$typeCode='326'">partial</xsl:when>
                <xsl:otherwise>invoice</xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="profileName">
            <xsl:choose>
                <xsl:when test="contains(cbc:CustomizationID, 'xrechnung')">XRechnung</xsl:when>
                <xsl:when test="contains(cbc:CustomizationID, 'peppol.eu')">Peppol BIS Billing 3.0</xsl:when>
                <xsl:when test="contains(cbc:CustomizationID, 'CIUS-RO')">RO e-Factura (CIUS-RO)</xsl:when>
                <xsl:when test="contains(cbc:CustomizationID, 'nlcius')">NLCIUS</xsl:when>
                <xsl:when test="contains(cbc:CustomizationID, 'CIUS-PT')">CIUS-PT</xsl:when>
                <xsl:when test="contains(cbc:CustomizationID, 'mfin.gov.hr')">HR eRačun</xsl:when>
                <xsl:when test="starts-with(cbc:CustomizationID, 'urn:cen.eu:en16931')">EN 16931</xsl:when>
                <xsl:otherwise><xsl:value-of select="cbc:CustomizationID"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="seller" select="cac:AccountingSupplierParty/cac:Party"/>
        <xsl:variable name="buyer" select="cac:AccountingCustomerParty/cac:Party"/>
        <xsl:variable name="vatTotal" select="cac:TaxTotal[cac:TaxSubtotal][1]"/>
        <xsl:variable name="totals" select="cac:LegalMonetaryTotal"/>

        <html lang="{$L}">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title><xsl:call-template name="t"><xsl:with-param name="k" select="$titleKey"/></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="cbc:ID"/></title>
                <style type="text/css">
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; background: #eef2f8; color: #1d2a3d; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 11.5px; }
                    table { font-size: inherit; color: inherit; }
                    .page { width: 794px; margin: 0 auto; background: #fff; }
                    .topline { height: 8px; background: linear-gradient(90deg,#1e3a8a,#2563eb,#60a5fa); }
                    .header { padding: 32px 40px 22px; border-bottom: 1px solid #dfe6f1; display: table; width: 100%; }
                    .header-left, .header-right { display: table-cell; vertical-align: top; }
                    .header-right { width: 300px; }
                    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #e8efff; color: #1e40af; font-size: 9.5px; font-weight: bold; letter-spacing: .8px; text-transform: uppercase; }
                    h1 { margin: 12px 0 4px; font-size: 30px; letter-spacing: .5px; color: #0f1d33; }
                    .doc-no { color: #4b5d78; font-size: 13px; font-weight: bold; }
                    .meta { width: 100%; border-collapse: collapse; }
                    .meta td { padding: 4px 0; vertical-align: top; }
                    .meta .key { color: #6b7a90; font-size: 9.5px; text-transform: uppercase; letter-spacing: .5px; padding-right: 10px; }
                    .meta .value { text-align: right; font-weight: bold; color: #1d2a3d; white-space: nowrap; }
                    .content { padding: 24px 40px 30px; }
                    .parties { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
                    .parties > tbody > tr > td { width: 50%; vertical-align: top; }
                    .parties > tbody > tr > td:first-child { padding-right: 8px; }
                    .parties > tbody > tr > td:last-child { padding-left: 8px; }
                    .party { padding: 16px 18px; border: 1px solid #dfe6f1; border-radius: 12px; background: #fafcff; min-height: 170px; }
                    .party-label { color: #2563eb; font-size: 9.5px; font-weight: bold; letter-spacing: 1.1px; text-transform: uppercase; margin-bottom: 8px; }
                    .party-name { font-size: 14px; font-weight: bold; color: #0f1d33; margin-bottom: 4px; }
                    .party-line { color: #4b5d78; line-height: 1.5; }
                    .party-line .country { font-weight: bold; color: #1d2a3d; }
                    .ids { margin-top: 8px; border-collapse: collapse; width: 100%; }
                    .ids td { padding: 2px 0; vertical-align: top; color: #4b5d78; font-size: 10.5px; }
                    .ids td:first-child { width: 120px; color: #7b889c; }
                    .info-strip { margin-top: 14px; padding: 10px 14px; border-radius: 10px; background: #f3f6fb; color: #4b5d78; line-height: 1.6; }
                    .info-strip b { color: #1d2a3d; }
                    .section-title { margin: 24px 0 8px; font-size: 10.5px; letter-spacing: 1px; text-transform: uppercase; color: #0f1d33; font-weight: bold; }
                    .grid { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #dfe6f1; border-radius: 10px; overflow: hidden; }
                    .grid th { background: #f0f4fb; color: #3b4c66; font-size: 9.5px; text-transform: uppercase; letter-spacing: .4px; text-align: left; padding: 8px 10px; border-bottom: 1px solid #dfe6f1; }
                    .grid td { padding: 9px 10px; border-bottom: 1px solid #eef2f8; vertical-align: top; line-height: 1.45; }
                    .grid tr:last-child td { border-bottom: 0; }
                    .r { text-align: right !important; white-space: nowrap; }
                    .c { text-align: center !important; }
                    .muted { color: #7b889c; font-size: 10px; }
                    .item-name { font-weight: bold; color: #0f1d33; }
                    .adj { color: #b45309; font-size: 10px; }
                    .summary { width: 100%; border-collapse: collapse; margin-top: 16px; }
                    .summary > tbody > tr > td { vertical-align: top; }
                    .pay-box { padding: 14px 16px; border: 1px solid #dfe6f1; border-radius: 12px; line-height: 1.6; color: #4b5d78; }
                    .pay-box b { color: #1d2a3d; }
                    .totals { width: 100%; border-collapse: collapse; }
                    .totals td { padding: 6px 0; border-bottom: 1px solid #eef2f8; }
                    .totals td:last-child { text-align: right; font-weight: bold; white-space: nowrap; }
                    .payable { margin-top: 12px; padding: 16px 18px; border-radius: 12px; color: #fff; background: linear-gradient(135deg,#1e3a8a,#2563eb); }
                    .payable .label { font-size: 9.5px; letter-spacing: 1px; text-transform: uppercase; opacity: .85; font-weight: bold; }
                    .payable .amount { margin-top: 4px; font-size: 24px; font-weight: bold; text-align: right; }
                    .notes { margin: 0; padding-left: 18px; color: #4b5d78; line-height: 1.6; }
                    .footer { margin-top: 26px; padding: 12px 40px 22px; border-top: 1px solid #dfe6f1; color: #7b889c; font-size: 9px; line-height: 1.6; }
                    @media print { html, body { background: #fff; } .page { width: 100%; } }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="topline"></div>
                    <div class="header">
                        <div class="header-left">
                            <span class="badge"><xsl:value-of select="$profileName"/></span>
                            <h1><xsl:call-template name="t"><xsl:with-param name="k" select="$titleKey"/></xsl:call-template></h1>
                            <div class="doc-no"><xsl:value-of select="cbc:ID"/></div>
                        </div>
                        <div class="header-right">
                            <table class="meta">
                                <tr>
                                    <td class="key"><xsl:call-template name="t"><xsl:with-param name="k">date</xsl:with-param></xsl:call-template></td>
                                    <td class="value"><xsl:call-template name="date"><xsl:with-param name="value" select="cbc:IssueDate"/></xsl:call-template></td>
                                </tr>
                                <xsl:if test="cbc:DueDate or cac:PaymentMeans/cbc:PaymentDueDate">
                                    <tr>
                                        <td class="key"><xsl:call-template name="t"><xsl:with-param name="k">due</xsl:with-param></xsl:call-template></td>
                                        <td class="value"><xsl:call-template name="date"><xsl:with-param name="value" select="(cbc:DueDate | cac:PaymentMeans/cbc:PaymentDueDate)[1]"/></xsl:call-template></td>
                                    </tr>
                                </xsl:if>
                                <xsl:call-template name="meta-row"><xsl:with-param name="k">currency</xsl:with-param><xsl:with-param name="v" select="$cur"/></xsl:call-template>
                                <xsl:call-template name="meta-row"><xsl:with-param name="k">buyerRef</xsl:with-param><xsl:with-param name="v" select="cbc:BuyerReference"/></xsl:call-template>
                                <xsl:call-template name="meta-row"><xsl:with-param name="k">order</xsl:with-param><xsl:with-param name="v" select="cac:OrderReference/cbc:ID"/></xsl:call-template>
                                <xsl:call-template name="meta-row"><xsl:with-param name="k">contract</xsl:with-param><xsl:with-param name="v" select="cac:ContractDocumentReference/cbc:ID"/></xsl:call-template>
                                <xsl:call-template name="meta-row"><xsl:with-param name="k">project</xsl:with-param><xsl:with-param name="v" select="cac:ProjectReference/cbc:ID"/></xsl:call-template>
                                <xsl:call-template name="meta-row"><xsl:with-param name="k">preceding</xsl:with-param><xsl:with-param name="v" select="cac:BillingReference/cac:InvoiceDocumentReference/cbc:ID"/></xsl:call-template>
                            </table>
                        </div>
                    </div>

                    <div class="content">
                        <table class="parties">
                            <tr>
                                <td><xsl:call-template name="party-card"><xsl:with-param name="party" select="$seller"/><xsl:with-param name="label">seller</xsl:with-param></xsl:call-template></td>
                                <td><xsl:call-template name="party-card"><xsl:with-param name="party" select="$buyer"/><xsl:with-param name="label">buyer</xsl:with-param></xsl:call-template></td>
                            </tr>
                        </table>

                        <xsl:if test="cac:InvoicePeriod or cac:Delivery">
                            <div class="info-strip">
                                <xsl:if test="cac:InvoicePeriod">
                                    <b><xsl:call-template name="t"><xsl:with-param name="k">period</xsl:with-param></xsl:call-template>:</b><xsl:text> </xsl:text>
                                    <xsl:call-template name="date"><xsl:with-param name="value" select="cac:InvoicePeriod/cbc:StartDate"/></xsl:call-template>
                                    <xsl:text> – </xsl:text>
                                    <xsl:call-template name="date"><xsl:with-param name="value" select="cac:InvoicePeriod/cbc:EndDate"/></xsl:call-template>
                                    <xsl:text>&#160;&#160;&#160;</xsl:text>
                                </xsl:if>
                                <xsl:if test="cac:Delivery/cbc:ActualDeliveryDate">
                                    <b><xsl:call-template name="t"><xsl:with-param name="k">delivery</xsl:with-param></xsl:call-template>:</b><xsl:text> </xsl:text>
                                    <xsl:call-template name="date"><xsl:with-param name="value" select="cac:Delivery/cbc:ActualDeliveryDate"/></xsl:call-template>
                                    <xsl:text>&#160;&#160;&#160;</xsl:text>
                                </xsl:if>
                                <xsl:if test="cac:Delivery/cac:DeliveryLocation/cac:Address or cac:Delivery/cac:DeliveryParty">
                                    <b><xsl:call-template name="t"><xsl:with-param name="k">deliverTo</xsl:with-param></xsl:call-template>:</b><xsl:text> </xsl:text>
                                    <xsl:value-of select="cac:Delivery/cac:DeliveryParty/cac:PartyName/cbc:Name"/>
                                    <xsl:for-each select="cac:Delivery/cac:DeliveryLocation/cac:Address">
                                        <xsl:if test="../../cac:DeliveryParty"><xsl:text>, </xsl:text></xsl:if>
                                        <xsl:value-of select="normalize-space(concat(cbc:StreetName, ', ', cbc:PostalZone, ' ', cbc:CityName, ' ', cac:Country/cbc:IdentificationCode))"/>
                                    </xsl:for-each>
                                </xsl:if>
                            </div>
                        </xsl:if>

                        <div class="section-title"><xsl:call-template name="t"><xsl:with-param name="k">lines</xsl:with-param></xsl:call-template></div>
                        <table class="grid">
                            <thead>
                                <tr>
                                    <th class="c" style="width:34px"><xsl:call-template name="t"><xsl:with-param name="k">pos</xsl:with-param></xsl:call-template></th>
                                    <th><xsl:call-template name="t"><xsl:with-param name="k">item</xsl:with-param></xsl:call-template></th>
                                    <th class="r" style="width:86px"><xsl:call-template name="t"><xsl:with-param name="k">qty</xsl:with-param></xsl:call-template></th>
                                    <th class="r" style="width:92px"><xsl:call-template name="t"><xsl:with-param name="k">price</xsl:with-param></xsl:call-template></th>
                                    <th class="r" style="width:54px"><xsl:call-template name="t"><xsl:with-param name="k">vatRate</xsl:with-param></xsl:call-template></th>
                                    <th class="r" style="width:100px"><xsl:call-template name="t"><xsl:with-param name="k">net</xsl:with-param></xsl:call-template></th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:for-each select="cac:InvoiceLine | cac:CreditNoteLine">
                                    <xsl:variable name="q" select="cbc:InvoicedQuantity | cbc:CreditedQuantity"/>
                                    <tr>
                                        <td class="c"><xsl:value-of select="cbc:ID"/></td>
                                        <td>
                                            <div class="item-name"><xsl:value-of select="cac:Item/cbc:Name"/></div>
                                            <xsl:if test="cac:Item/cbc:Description"><div class="muted"><xsl:value-of select="cac:Item/cbc:Description"/></div></xsl:if>
                                            <xsl:if test="cac:Item/cac:SellersItemIdentification/cbc:ID">
                                                <div class="muted"><xsl:call-template name="t"><xsl:with-param name="k">itemNo</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="cac:Item/cac:SellersItemIdentification/cbc:ID"/></div>
                                            </xsl:if>
                                            <xsl:if test="cbc:Note"><div class="muted"><xsl:value-of select="cbc:Note"/></div></xsl:if>
                                            <xsl:for-each select="cac:AllowanceCharge">
                                                <div class="adj">
                                                    <xsl:choose>
                                                        <xsl:when test="cbc:ChargeIndicator='true'">+ <xsl:call-template name="t"><xsl:with-param name="k">charge</xsl:with-param></xsl:call-template></xsl:when>
                                                        <xsl:otherwise>− <xsl:call-template name="t"><xsl:with-param name="k">allowance</xsl:with-param></xsl:call-template></xsl:otherwise>
                                                    </xsl:choose>
                                                    <xsl:if test="cbc:AllowanceChargeReason"><xsl:text> · </xsl:text><xsl:value-of select="cbc:AllowanceChargeReason"/></xsl:if>
                                                    <xsl:text>: </xsl:text>
                                                    <xsl:call-template name="num"><xsl:with-param name="v" select="cbc:Amount"/></xsl:call-template>
                                                </div>
                                            </xsl:for-each>
                                        </td>
                                        <td class="r">
                                            <xsl:call-template name="num"><xsl:with-param name="v" select="$q"/><xsl:with-param name="pattern" select="'4'"/></xsl:call-template>
                                            <xsl:text> </xsl:text>
                                            <xsl:call-template name="unit"><xsl:with-param name="code" select="$q/@unitCode"/></xsl:call-template>
                                        </td>
                                        <td class="r">
                                            <xsl:call-template name="num"><xsl:with-param name="v" select="cac:Price/cbc:PriceAmount"/><xsl:with-param name="pattern" select="'p'"/></xsl:call-template>
                                            <xsl:if test="cac:Price/cbc:BaseQuantity and number(cac:Price/cbc:BaseQuantity) != 1">
                                                <div class="muted">/ <xsl:value-of select="cac:Price/cbc:BaseQuantity"/></div>
                                            </xsl:if>
                                        </td>
                                        <td class="r">
                                            <xsl:choose>
                                                <xsl:when test="cac:Item/cac:ClassifiedTaxCategory/cbc:Percent">
                                                    <xsl:call-template name="num"><xsl:with-param name="v" select="cac:Item/cac:ClassifiedTaxCategory/cbc:Percent"/><xsl:with-param name="pattern" select="'4'"/></xsl:call-template>%
                                                </xsl:when>
                                                <xsl:otherwise><xsl:value-of select="cac:Item/cac:ClassifiedTaxCategory/cbc:ID"/></xsl:otherwise>
                                            </xsl:choose>
                                        </td>
                                        <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="cbc:LineExtensionAmount"/></xsl:call-template></td>
                                    </tr>
                                </xsl:for-each>
                            </tbody>
                        </table>

                        <xsl:if test="cac:AllowanceCharge">
                            <div class="section-title"><xsl:call-template name="t"><xsl:with-param name="k">allowances</xsl:with-param></xsl:call-template></div>
                            <table class="grid">
                                <tbody>
                                    <xsl:for-each select="cac:AllowanceCharge">
                                        <tr>
                                            <td>
                                                <xsl:choose>
                                                    <xsl:when test="cbc:ChargeIndicator='true'"><xsl:call-template name="t"><xsl:with-param name="k">charge</xsl:with-param></xsl:call-template></xsl:when>
                                                    <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k">allowance</xsl:with-param></xsl:call-template></xsl:otherwise>
                                                </xsl:choose>
                                                <xsl:if test="cbc:AllowanceChargeReason"><xsl:text> · </xsl:text><xsl:value-of select="cbc:AllowanceChargeReason"/></xsl:if>
                                                <xsl:if test="cbc:MultiplierFactorNumeric">
                                                    <span class="muted"><xsl:text> (</xsl:text><xsl:value-of select="cbc:MultiplierFactorNumeric"/><xsl:text>% × </xsl:text><xsl:call-template name="num"><xsl:with-param name="v" select="cbc:BaseAmount"/></xsl:call-template>)</span>
                                                </xsl:if>
                                            </td>
                                            <td class="r" style="width:90px">
                                                <xsl:call-template name="t"><xsl:with-param name="k">vatRate</xsl:with-param></xsl:call-template>
                                                <xsl:text> </xsl:text>
                                                <xsl:value-of select="cac:TaxCategory/cbc:Percent"/>%
                                            </td>
                                            <td class="r" style="width:110px">
                                                <xsl:if test="cbc:ChargeIndicator!='true'">− </xsl:if>
                                                <xsl:call-template name="num"><xsl:with-param name="v" select="cbc:Amount"/></xsl:call-template>
                                            </td>
                                        </tr>
                                    </xsl:for-each>
                                </tbody>
                            </table>
                        </xsl:if>

                        <div class="section-title"><xsl:call-template name="t"><xsl:with-param name="k">vatBreakdown</xsl:with-param></xsl:call-template></div>
                        <table class="grid">
                            <thead>
                                <tr>
                                    <th><xsl:call-template name="t"><xsl:with-param name="k">category</xsl:with-param></xsl:call-template></th>
                                    <th class="r" style="width:70px">%</th>
                                    <th class="r" style="width:130px"><xsl:call-template name="t"><xsl:with-param name="k">taxable</xsl:with-param></xsl:call-template></th>
                                    <th class="r" style="width:120px"><xsl:call-template name="t"><xsl:with-param name="k">taxAmount</xsl:with-param></xsl:call-template></th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:for-each select="$vatTotal/cac:TaxSubtotal">
                                    <tr>
                                        <td>
                                            <xsl:call-template name="vat-category"><xsl:with-param name="id" select="cac:TaxCategory/cbc:ID"/></xsl:call-template>
                                            <span class="muted"><xsl:text> (</xsl:text><xsl:value-of select="cac:TaxCategory/cbc:ID"/>)</span>
                                            <xsl:if test="cac:TaxCategory/cbc:TaxExemptionReason or cac:TaxCategory/cbc:TaxExemptionReasonCode">
                                                <div class="muted">
                                                    <xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReasonCode"/>
                                                    <xsl:if test="cac:TaxCategory/cbc:TaxExemptionReasonCode and cac:TaxCategory/cbc:TaxExemptionReason"><xsl:text> · </xsl:text></xsl:if>
                                                    <xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReason"/>
                                                </div>
                                            </xsl:if>
                                        </td>
                                        <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="cac:TaxCategory/cbc:Percent"/><xsl:with-param name="pattern" select="'4'"/></xsl:call-template></td>
                                        <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="cbc:TaxableAmount"/></xsl:call-template></td>
                                        <td class="r"><xsl:call-template name="num"><xsl:with-param name="v" select="cbc:TaxAmount"/></xsl:call-template></td>
                                    </tr>
                                </xsl:for-each>
                            </tbody>
                        </table>

                        <table class="summary">
                            <tr>
                                <td style="width:58%; padding-right:16px;">
                                    <xsl:if test="cac:PaymentMeans or cac:PaymentTerms">
                                        <div class="section-title" style="margin-top:0"><xsl:call-template name="t"><xsl:with-param name="k">payment</xsl:with-param></xsl:call-template></div>
                                        <div class="pay-box">
                                            <xsl:for-each select="cac:PaymentMeans">
                                                <div>
                                                    <b><xsl:call-template name="t"><xsl:with-param name="k">means</xsl:with-param></xsl:call-template>:</b><xsl:text> </xsl:text>
                                                    <xsl:call-template name="means"><xsl:with-param name="code" select="cbc:PaymentMeansCode"/></xsl:call-template>
                                                </div>
                                                <xsl:if test="cac:PayeeFinancialAccount/cbc:ID"><div><b>IBAN:</b><xsl:text> </xsl:text><xsl:value-of select="cac:PayeeFinancialAccount/cbc:ID"/></div></xsl:if>
                                                <xsl:if test="cac:PayeeFinancialAccount/cac:FinancialInstitutionBranch/cbc:ID"><div><b>BIC:</b><xsl:text> </xsl:text><xsl:value-of select="cac:PayeeFinancialAccount/cac:FinancialInstitutionBranch/cbc:ID"/></div></xsl:if>
                                                <xsl:if test="cac:PayeeFinancialAccount/cbc:Name"><div><b><xsl:call-template name="t"><xsl:with-param name="k">accountName</xsl:with-param></xsl:call-template>:</b><xsl:text> </xsl:text><xsl:value-of select="cac:PayeeFinancialAccount/cbc:Name"/></div></xsl:if>
                                                <xsl:if test="cbc:PaymentID"><div><b><xsl:call-template name="t"><xsl:with-param name="k">remittance</xsl:with-param></xsl:call-template>:</b><xsl:text> </xsl:text><xsl:value-of select="cbc:PaymentID"/></div></xsl:if>
                                                <xsl:if test="cac:PaymentMandate/cbc:ID"><div><b><xsl:call-template name="t"><xsl:with-param name="k">mandate</xsl:with-param></xsl:call-template>:</b><xsl:text> </xsl:text><xsl:value-of select="cac:PaymentMandate/cbc:ID"/></div></xsl:if>
                                                <xsl:if test="cac:CardAccount/cbc:PrimaryAccountNumberID"><div><b><xsl:call-template name="t"><xsl:with-param name="k">card</xsl:with-param></xsl:call-template>:</b><xsl:text> </xsl:text><xsl:value-of select="cac:CardAccount/cbc:PrimaryAccountNumberID"/></div></xsl:if>
                                            </xsl:for-each>
                                            <xsl:if test="cac:PaymentTerms/cbc:Note">
                                                <div style="margin-top:6px"><b><xsl:call-template name="t"><xsl:with-param name="k">terms</xsl:with-param></xsl:call-template>:</b><xsl:text> </xsl:text><xsl:value-of select="cac:PaymentTerms/cbc:Note"/></div>
                                            </xsl:if>
                                        </div>
                                    </xsl:if>
                                    <xsl:if test="cbc:Note">
                                        <div class="section-title"><xsl:call-template name="t"><xsl:with-param name="k">notes</xsl:with-param></xsl:call-template></div>
                                        <ul class="notes">
                                            <xsl:for-each select="cbc:Note">
                                                <li><xsl:call-template name="note-text"><xsl:with-param name="text" select="."/></xsl:call-template></li>
                                            </xsl:for-each>
                                        </ul>
                                    </xsl:if>
                                </td>
                                <td>
                                    <table class="totals">
                                        <tr><td><xsl:call-template name="t"><xsl:with-param name="k">sumLines</xsl:with-param></xsl:call-template></td><td><xsl:call-template name="money"><xsl:with-param name="v" select="$totals/cbc:LineExtensionAmount"/><xsl:with-param name="cur" select="$cur"/></xsl:call-template></td></tr>
                                        <xsl:if test="$totals/cbc:AllowanceTotalAmount and number($totals/cbc:AllowanceTotalAmount) != 0">
                                            <tr><td><xsl:call-template name="t"><xsl:with-param name="k">totalAllow</xsl:with-param></xsl:call-template></td><td>− <xsl:call-template name="money"><xsl:with-param name="v" select="$totals/cbc:AllowanceTotalAmount"/><xsl:with-param name="cur" select="$cur"/></xsl:call-template></td></tr>
                                        </xsl:if>
                                        <xsl:if test="$totals/cbc:ChargeTotalAmount and number($totals/cbc:ChargeTotalAmount) != 0">
                                            <tr><td><xsl:call-template name="t"><xsl:with-param name="k">totalCharge</xsl:with-param></xsl:call-template></td><td><xsl:call-template name="money"><xsl:with-param name="v" select="$totals/cbc:ChargeTotalAmount"/><xsl:with-param name="cur" select="$cur"/></xsl:call-template></td></tr>
                                        </xsl:if>
                                        <tr><td><xsl:call-template name="t"><xsl:with-param name="k">taxExcl</xsl:with-param></xsl:call-template></td><td><xsl:call-template name="money"><xsl:with-param name="v" select="$totals/cbc:TaxExclusiveAmount"/><xsl:with-param name="cur" select="$cur"/></xsl:call-template></td></tr>
                                        <tr><td><xsl:call-template name="t"><xsl:with-param name="k">taxTotal</xsl:with-param></xsl:call-template></td><td><xsl:call-template name="money"><xsl:with-param name="v" select="$vatTotal/cbc:TaxAmount"/><xsl:with-param name="cur" select="$cur"/></xsl:call-template></td></tr>
                                        <xsl:for-each select="cac:TaxTotal[not(cac:TaxSubtotal)][cbc:TaxAmount/@currencyID != $cur]">
                                            <tr><td><xsl:call-template name="t"><xsl:with-param name="k">taxAccounting</xsl:with-param></xsl:call-template></td><td><xsl:call-template name="money"><xsl:with-param name="v" select="cbc:TaxAmount"/><xsl:with-param name="cur" select="cbc:TaxAmount/@currencyID"/></xsl:call-template></td></tr>
                                        </xsl:for-each>
                                        <tr><td><xsl:call-template name="t"><xsl:with-param name="k">taxIncl</xsl:with-param></xsl:call-template></td><td><xsl:call-template name="money"><xsl:with-param name="v" select="$totals/cbc:TaxInclusiveAmount"/><xsl:with-param name="cur" select="$cur"/></xsl:call-template></td></tr>
                                        <xsl:if test="$totals/cbc:PrepaidAmount and number($totals/cbc:PrepaidAmount) != 0">
                                            <tr><td><xsl:call-template name="t"><xsl:with-param name="k">prepaid</xsl:with-param></xsl:call-template></td><td>− <xsl:call-template name="money"><xsl:with-param name="v" select="$totals/cbc:PrepaidAmount"/><xsl:with-param name="cur" select="$cur"/></xsl:call-template></td></tr>
                                        </xsl:if>
                                        <xsl:if test="$totals/cbc:PayableRoundingAmount and number($totals/cbc:PayableRoundingAmount) != 0">
                                            <tr><td><xsl:call-template name="t"><xsl:with-param name="k">rounding</xsl:with-param></xsl:call-template></td><td><xsl:call-template name="money"><xsl:with-param name="v" select="$totals/cbc:PayableRoundingAmount"/><xsl:with-param name="cur" select="$cur"/></xsl:call-template></td></tr>
                                        </xsl:if>
                                    </table>
                                    <div class="payable">
                                        <div class="label"><xsl:call-template name="t"><xsl:with-param name="k">payable</xsl:with-param></xsl:call-template></div>
                                        <div class="amount"><xsl:call-template name="money"><xsl:with-param name="v" select="$totals/cbc:PayableAmount"/><xsl:with-param name="cur" select="$cur"/></xsl:call-template></div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div class="footer">
                        <div><xsl:call-template name="t"><xsl:with-param name="k">legal</xsl:with-param></xsl:call-template></div>
                        <div>
                            <xsl:value-of select="cbc:CustomizationID"/>
                            <xsl:if test="cbc:ProfileID"><xsl:text> · </xsl:text><xsl:value-of select="cbc:ProfileID"/></xsl:if>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
