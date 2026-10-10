<?xml version="1.0" encoding="UTF-8"?>
<!--
  Peppol BIS Despatch Advice 3 (UBL 2.1 DespatchAdvice) görünümü.
  Etiket dili "lang" parametresiyle seçilir (AB/AEA dilleri + tr; bilinmeyen dil: en).
  Etiket satırları scripts/build-intl-xslt-labels.mjs ile src/international/docText'ten üretilir.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="n1 cac cbc">

    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:param name="lang" select="'en'"/>
    <xsl:variable name="L">
        <xsl:choose>
            <xsl:when test="$lang != '' and contains('|tr|en|de|fr|es|it|nl|pt|pl|cs|sk|sl|hr|hu|ro|bg|el|da|sv|nb|fi|et|lv|lt|is|mt|ga|ca|eu|gl|', concat('|', $lang, '|'))"><xsl:value-of select="$lang"/></xsl:when>
            <xsl:otherwise>en</xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <!-- Sayı biçimi: dot = 1,234.5 · space = 1 234,5 · comma = 1.234,5 -->
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

    <xsl:template name="t">
        <xsl:param name="k"/>
        <xsl:variable name="row">
            <xsl:choose>
                <xsl:when test="$k='title'">|tr=Sevk İrsaliyesi|en=Delivery note|de=Lieferschein|fr=Bon de livraison|es=Albarán|it=Documento di trasporto (DDT)|nl=Pakbon|pt=Guia de remessa|pl=Wydanie zewnętrzne (WZ)|cs=Dodací list|sk=Dodací list|sl=Dobavnica|hr=Otpremnica|hu=Szállítólevél|ro=Aviz de însoțire a mărfii|bg=Стокова разписка|el=Δελτίο αποστολής|da=Følgeseddel|sv=Följesedel|nb=Følgeseddel|fi=Lähete|et=Saateleht|lv=Pavadzīme|lt=Važtaraštis|is=Fylgiseðill|mt=Nota tal-kunsinna|ga=Nóta seachadta|ca=Albarà|eu=Albarana|gl=Albará|</xsl:when>
                <xsl:when test="$k='date'">|tr=Düzenleme tarihi|en=Issue date|de=Datum|fr=Date|es=Fecha|it=Data emissione|nl=Datum|pt=Data de emissão|pl=Data wystawienia|cs=Datum vystavení|sk=Dátum vyhotovenia|sl=Datum izdaje|hr=Datum izdavanja|hu=Kiállítás dátuma|ro=Data emiterii|bg=Дата на издаване|el=Ημερομηνία έκδοσης|da=Dato|sv=Datum|nb=Dato|fi=Päivämäärä|et=Kuupäev|lv=Izrakstīšanas datums|lt=Išrašymo data|is=Útgáfudagur|mt=Data tal-ħruġ|ga=Dáta eisiúna|ca=Data d’emissió|eu=Jaulkipen-data|gl=Data de emisión|</xsl:when>
                <xsl:when test="$k='order'">|tr=Sipariş no|en=Order reference|de=Bestellnummer|fr=N° de commande|es=N.º de pedido|it=Rif. ordine|nl=Orderreferentie|pt=Ref. da encomenda|pl=Nr zamówienia|cs=Objednávka|sk=Objednávka|sl=Naročilo|hr=Narudžba|hu=Megrendelés|ro=Ref. comandă|bg=Поръчка|el=Αρ. παραγγελίας|da=Ordrereference|sv=Orderreferens|nb=Ordrereferanse|fi=Tilausviite|et=Tellimuse viide|lv=Pasūtījuma atsauce|lt=Užsakymo nuoroda|is=Pöntun|mt=Ref. tal-ordni|ga=Tagairt ordaithe|ca=Núm. de comanda|eu=Eskaera zk.|gl=N.º de pedido|</xsl:when>
                <xsl:when test="$k='supplier'">|tr=Gönderen|en=Despatch party|de=Lieferant|fr=Expéditeur|es=Expedidor|it=Mittente|nl=Verzender|pt=Expedidor|pl=Wysyłający|cs=Odesílatel|sk=Odosielateľ|sl=Pošiljatelj|hr=Pošiljatelj|hu=Feladó|ro=Expeditor|bg=Изпращач|el=Αποστολέας|da=Afsender|sv=Avsändare|nb=Avsender|fi=Lähettäjä|et=Saatja|lv=Nosūtītājs|lt=Siuntėjas|is=Sendandi|mt=Mittent|ga=Seoltóir|ca=Expedidor|eu=Bidaltzailea|gl=Expedidor|</xsl:when>
                <xsl:when test="$k='deliveryParty'">|tr=Teslim alan|en=Delivery party|de=Warenempfänger|fr=Destinataire|es=Destinatario|it=Destinatario|nl=Ontvanger|pt=Destinatário|pl=Odbiorca|cs=Příjemce|sk=Príjemca|sl=Prejemnik|hr=Primatelj|hu=Átvevő|ro=Destinatar|bg=Получател|el=Παραλήπτης|da=Modtager|sv=Mottagare|nb=Mottaker|fi=Vastaanottaja|et=Kauba saaja|lv=Kravas saņēmējs|lt=Krovinio gavėjas|is=Viðtakandi|mt=Destinatarju|ga=Faighteoir|ca=Destinatari|eu=Hartzailea|gl=Destinatario|</xsl:when>
                <xsl:when test="$k='buyer'">|tr=Alıcı|en=Buyer|de=Käufer|fr=Acheteur|es=Comprador|it=Acquirente|nl=Koper|pt=Adquirente|pl=Nabywca|cs=Odběratel|sk=Odberateľ|sl=Kupec|hr=Kupac|hu=Vevő|ro=Cumpărător|bg=Купувач|el=Αγοραστής|da=Køber|sv=Köpare|nb=Kjøper|fi=Ostaja|et=Ostja|lv=Pircējs|lt=Pirkėjas|is=Kaupandi|mt=Xerrej|ga=Ceannaitheoir|ca=Comprador|eu=Eroslea|gl=Comprador|</xsl:when>
                <xsl:when test="$k='seller'">|tr=Satıcı|en=Seller|de=Verkäufer|fr=Vendeur|es=Vendedor|it=Venditore|nl=Verkoper|pt=Vendedor|pl=Sprzedawca|cs=Dodavatel|sk=Dodávateľ|sl=Prodajalec|hr=Prodavatelj|hu=Eladó|ro=Vânzător|bg=Продавач|el=Πωλητής|da=Sælger|sv=Säljare|nb=Selger|fi=Myyjä|et=Müüja|lv=Pārdevējs|lt=Pardavėjas|is=Seljandi|mt=Bejjiegħ|ga=Díoltóir|ca=Venedor|eu=Saltzailea|gl=Vendedor|</xsl:when>
                <xsl:when test="$k='endpoint'">|tr=Elektronik adres|en=Electronic address|de=Elektronische Adresse|fr=Adresse électronique|es=Dirección electrónica|it=Indirizzo elettronico|nl=Elektronisch adres|pt=Endereço eletrónico|pl=Adres elektroniczny|cs=Elektronická adresa|sk=Elektronická adresa|sl=Elektronski naslov|hr=Elektronička adresa|hu=Elektronikus cím|ro=Adresă electronică|bg=Електронен адрес|el=Ηλεκτρονική διεύθυνση|da=Elektronisk adresse|sv=Elektronisk adress|nb=Elektronisk adresse|fi=Sähköinen osoite|et=E-aadress|lv=Elektroniskā adrese|lt=Elektroninis adresas|is=Rafrænt heimilisfang|mt=Indirizz elettroniku|ga=Seoladh leictreonach|ca=Adreça electrònica|eu=Helbide elektronikoa|gl=Enderezo electrónico|</xsl:when>
                <xsl:when test="$k='partyId'">|tr=Tanımlayıcı|en=Identifier|de=Kennung|fr=Identifiant|es=Identificador|it=Identificativo|nl=Identificatie|pt=Identificador|pl=Identyfikator|cs=Identifikátor|sk=Identifikátor|sl=Identifikator|hr=Identifikator|hu=Azonosító|ro=Identificator|bg=Идентификатор|el=Αναγνωριστικό|da=ID|sv=ID|nb=ID|fi=Tunniste|et=Tunnus|lv=Identifikators|lt=Identifikatorius|is=Auðkenni|mt=Identifikatur|ga=Aitheantóir|ca=Identificador|eu=Identifikatzailea|gl=Identificador|</xsl:when>
                <xsl:when test="$k='contact'">|tr=İletişim|en=Contact|de=Kontakt|fr=Contact|es=Contacto|it=Referente|nl=Contactpersoon|pt=Contacto|pl=Kontakt|cs=Kontakt|sk=Kontakt|sl=Kontakt|hr=Kontakt|hu=Kapcsolattartó|ro=Contact|bg=Контакт|el=Επικοινωνία|da=Kontaktperson|sv=Kontaktperson|nb=Kontaktperson|fi=Yhteyshenkilö|et=Kontaktisik|lv=Kontaktpersona|lt=Kontaktinis asmuo|is=Tengiliður|mt=Kuntatt|ga=Teagmháil|ca=Contacte|eu=Harremana|gl=Contacto|</xsl:when>
                <xsl:when test="$k='shipment'">|tr=Sevkiyat|en=Shipment|de=Sendung|fr=Expédition|es=Envío|it=Spedizione|nl=Zending|pt=Expedição|pl=Przesyłka|cs=Zásilka|sk=Zásielka|sl=Pošiljka|hr=Pošiljka|hu=Küldemény|ro=Expediere|bg=Пратка|el=Αποστολή|da=Forsendelse|sv=Försändelse|nb=Forsendelse|fi=Lähetys|et=Saadetis|lv=Sūtījums|lt=Siunta|is=Sending|mt=Spedizzjoni|ga=Lastas|ca=Enviament|eu=Bidalketa|gl=Envío|</xsl:when>
                <xsl:when test="$k='shipmentId'">|tr=Sevkiyat no|en=Shipment ID|de=Sendungsnummer|fr=N° d’expédition|es=N.º de envío|it=ID spedizione|nl=Zendingsnummer|pt=ID da expedição|pl=Nr przesyłki|cs=Číslo zásilky|sk=Číslo zásielky|sl=ID pošiljke|hr=ID pošiljke|hu=Küldeményazonosító|ro=ID expediere|bg=Номер на пратката|el=Κωδικός αποστολής|da=Forsendelses-ID|sv=Försändelse-ID|nb=Forsendelses-ID|fi=Lähetyksen tunniste|et=Saadetise tunnus|lv=Sūtījuma ID|lt=Siuntos ID|is=Auðkenni sendingar|mt=ID tal-ispedizzjoni|ga=ID an lastais|ca=ID de l’enviament|eu=Bidalketaren IDa|gl=ID do envío|</xsl:when>
                <xsl:when test="$k='despatched'">|tr=Sevk zamanı|en=Despatched|de=Versandt am|fr=Expédié le|es=Expedido el|it=Data spedizione|nl=Verzonden|pt=Expedido em|pl=Data wysyłki|cs=Odesláno|sk=Odoslané|sl=Odpremljeno|hr=Otpremljeno|hu=Feladva|ro=Expediat|bg=Изпратено|el=Ημερομηνία αποστολής|da=Afsendt|sv=Avsänt|nb=Sendt|fi=Lähetetty|et=Lähetatud|lv=Nosūtīts|lt=Išsiųsta|is=Sent|mt=Data tal-ispedizzjoni|ga=Dáta seolta|ca=Data d’expedició|eu=Bidalketa-data|gl=Data de expedición|</xsl:when>
                <xsl:when test="$k='estimated'">|tr=Tahmini teslim|en=Estimated delivery|de=Voraussichtliche Lieferung|fr=Livraison prévue|es=Entrega prevista|it=Consegna prevista|nl=Verwachte levering|pt=Entrega prevista|pl=Przewidywana dostawa|cs=Předpokládané dodání|sk=Predpokladané dodanie|sl=Predvidena dobava|hr=Očekivana isporuka|hu=Várható kézbesítés|ro=Livrare estimată|bg=Очаквана доставка|el=Εκτιμώμενη παράδοση|da=Forventet levering|sv=Beräknad leverans|nb=Forventet levering|fi=Arvioitu toimitus|et=Eeldatav tarne|lv=Paredzamā piegāde|lt=Numatomas pristatymas|is=Áætluð afhending|mt=Kunsinna stmata|ga=Seachadadh measta|ca=Lliurament previst|eu=Aurreikusitako entrega|gl=Entrega prevista|</xsl:when>
                <xsl:when test="$k='carrier'">|tr=Taşıyıcı|en=Carrier|de=Spediteur|fr=Transporteur|es=Transportista|it=Vettore|nl=Vervoerder|pt=Transportador|pl=Przewoźnik|cs=Dopravce|sk=Dopravca|sl=Prevoznik|hr=Prijevoznik|hu=Fuvarozó|ro=Transportator|bg=Превозвач|el=Μεταφορέας|da=Transportør|sv=Transportör|nb=Transportør|fi=Kuljetusliike|et=Vedaja|lv=Pārvadātājs|lt=Vežėjas|is=Flutningsaðili|mt=Trasportatur|ga=Iompróir|ca=Transportista|eu=Garraiolaria|gl=Transportista|</xsl:when>
                <xsl:when test="$k='tracking'">|tr=Takip no|en=Tracking ID|de=Sendungsverfolgung|fr=N° de suivi|es=N.º de seguimiento|it=N. tracciamento|nl=Trackingnummer|pt=N.º de seguimento|pl=Nr śledzenia|cs=Sledovací číslo|sk=Sledovacie číslo|sl=Številka za sledenje|hr=Broj za praćenje|hu=Nyomkövetési szám|ro=Nr. urmărire|bg=Номер за проследяване|el=Αρ. παρακολούθησης|da=Sporingsnummer|sv=Spårningsnummer|nb=Sporingsnummer|fi=Seurantanumero|et=Jälgimisnumber|lv=Izsekošanas nr.|lt=Sekimo Nr.|is=Rakningarnúmer|mt=Nru tal-intraċċar|ga=Uimh. rianaithe|ca=Núm. de seguiment|eu=Jarraipen zk.|gl=N.º de seguimento|</xsl:when>
                <xsl:when test="$k='weight'">|tr=Brüt ağırlık|en=Gross weight|de=Bruttogewicht|fr=Poids brut|es=Peso bruto|it=Peso lordo|nl=Brutogewicht|pt=Peso bruto|pl=Waga brutto|cs=Hmotnost brutto|sk=Hmotnosť brutto|sl=Bruto teža|hr=Bruto težina|hu=Bruttó tömeg|ro=Greutate brută|bg=Бруто тегло|el=Μικτό βάρος|da=Bruttovægt|sv=Bruttovikt|nb=Bruttovekt|fi=Bruttopaino|et=Brutokaal|lv=Bruto svars|lt=Bruto svoris|is=Brúttóþyngd|mt=Piż gross|ga=Meáchan comhlán|ca=Pes brut|eu=Pisu gordina|gl=Peso bruto|</xsl:when>
                <xsl:when test="$k='volume'">|tr=Hacim|en=Volume|de=Volumen|fr=Volume|es=Volumen|it=Volume|nl=Volume|pt=Volume|pl=Objętość|cs=Objem|sk=Objem|sl=Prostornina|hr=Volumen|hu=Térfogat|ro=Volum|bg=Обем|el=Όγκος|da=Volumen|sv=Volym|nb=Volum|fi=Tilavuus|et=Maht|lv=Tilpums|lt=Tūris|is=Rúmmál|mt=Volum|ga=Toirt|ca=Volum|eu=Bolumena|gl=Volume|</xsl:when>
                <xsl:when test="$k='deliverTo'">|tr=Teslim adresi|en=Delivery address|de=Lieferanschrift|fr=Adresse de livraison|es=Dirección de entrega|it=Luogo di destinazione|nl=Afleveradres|pt=Local de descarga|pl=Adres dostawy|cs=Dodací adresa|sk=Dodacia adresa|sl=Naslov dobave|hr=Adresa isporuke|hu=Szállítási cím|ro=Adresa de livrare|bg=Адрес за доставка|el=Διεύθυνση παράδοσης|da=Leveringsadresse|sv=Leveransadress|nb=Leveringsadresse|fi=Toimitusosoite|et=Tarneaadress|lv=Piegādes adrese|lt=Pristatymo adresas|is=Afhendingarstaður|mt=Indirizz tal-kunsinna|ga=Seoladh seachadta|ca=Adreça de lliurament|eu=Entrega-helbidea|gl=Enderezo de entrega|</xsl:when>
                <xsl:when test="$k='units'">|tr=Taşıma birimleri|en=Handling units|de=Packstücke|fr=Unités de manutention|es=Unidades de manipulación|it=Colli|nl=Colli|pt=Volumes|pl=Jednostki transportowe|cs=Přepravní jednotky|sk=Prepravné jednotky|sl=Transportne enote|hr=Transportne jedinice|hu=Szállítási egységek|ro=Unități de transport|bg=Транспортни единици|el=Μονάδες μεταφοράς|da=Kolli|sv=Kollin|nb=Kolli|fi=Kuljetusyksiköt|et=Transpordiühikud|lv=Transporta vienības|lt=Transporto vienetai|is=Flutningseiningar|mt=Unitajiet tal-immaniġġar|ga=Aonaid láimhseála|ca=Bults|eu=Fardoak|gl=Vultos|</xsl:when>
                <xsl:when test="$k='lines'">|tr=Sevk edilen kalemler|en=Despatched lines|de=Gelieferte Positionen|fr=Lignes expédiées|es=Líneas expedidas|it=Righe spedite|nl=Verzonden artikelen|pt=Linhas expedidas|pl=Wydane pozycje|cs=Dodané položky|sk=Dodané položky|sl=Odpremljene postavke|hr=Otpremljene stavke|hu=Szállított tételek|ro=Linii expediate|bg=Експедирани стоки|el=Γραμμές αποστολής|da=Afsendte varer|sv=Levererade rader|nb=Sendte varer|fi=Lähetetyt rivit|et=Lähetatud read|lv=Nosūtītās preces|lt=Išsiųstos prekės|is=Sendar línur|mt=Linji mibgħuta|ga=Línte seolta|ca=Línies expedides|eu=Bidalitako lerroak|gl=Liñas expedidas|</xsl:when>
                <xsl:when test="$k='pos'">|tr=#|en=#|de=Pos.|fr=N°|es=N.º|it=N.|nl=Nr.|pt=N.º|pl=Lp.|cs=Č.|sk=Č.|sl=Zap. št.|hr=R. br.|hu=Ssz.|ro=Nr.|bg=№|el=Α/Α|da=Nr.|sv=Nr|nb=Nr.|fi=Nro|et=Nr|lv=Nr.|lt=Eil. Nr.|is=Nr.|mt=Nru|ga=Uimh.|ca=Núm.|eu=Zk.|gl=N.º|</xsl:when>
                <xsl:when test="$k='item'">|tr=Ürün|en=Item|de=Artikel|fr=Article|es=Artículo|it=Articolo|nl=Artikel|pt=Artigo|pl=Towar|cs=Položka|sk=Položka|sl=Artikel|hr=Artikl|hu=Termék|ro=Articol|bg=Стока|el=Είδος|da=Vare|sv=Artikel|nb=Vare|fi=Tuote|et=Kaup|lv=Prece|lt=Prekė|is=Vara|mt=Oġġett|ga=Mír|ca=Article|eu=Artikulua|gl=Artigo|</xsl:when>
                <xsl:when test="$k='itemNo'">|tr=Ürün kodu|en=Item no.|de=Art.-Nr.|fr=Réf.|es=Ref.|it=Codice art.|nl=Art.nr.|pt=Ref. artigo|pl=Kod towaru|cs=Kód|sk=Kód|sl=Šifra|hr=Šifra|hu=Cikkszám|ro=Cod articol|bg=Код|el=Κωδικός|da=Varenr.|sv=Art.nr|nb=Varenr.|fi=Tuotenro|et=Tootekood|lv=Preces kods|lt=Prekės kodas|is=Vörunr.|mt=Nru tal-oġġett|ga=Uimh. míre|ca=Ref.|eu=Erref.|gl=Ref.|</xsl:when>
                <xsl:when test="$k='orderLine'">|tr=Sipariş satırı|en=Order line|de=Bestellposition|fr=Ligne de commande|es=Línea de pedido|it=Riga ordine|nl=Orderregel|pt=Linha da encomenda|pl=Poz. zamówienia|cs=Řádek objednávky|sk=Riadok objednávky|sl=Postavka naročila|hr=Stavka narudžbe|hu=Megrendelési tétel|ro=Linie comandă|bg=Ред от поръчката|el=Γραμμή παραγγελίας|da=Ordrelinje|sv=Orderrad|nb=Ordrelinje|fi=Tilausrivi|et=Tellimuse rida|lv=Pasūtījuma rinda|lt=Užsakymo eilutė|is=Pöntunarlína|mt=Linja tal-ordni|ga=Líne ordaithe|ca=Línia de comanda|eu=Eskaera-lerroa|gl=Liña de pedido|</xsl:when>
                <xsl:when test="$k='lot'">|tr=Parti|en=Lot|de=Charge|fr=Lot|es=Lote|it=Lotto|nl=Lot|pt=Lote|pl=Partia|cs=Šarže|sk=Šarža|sl=Lot|hr=Lot|hu=Sarzs|ro=Lot|bg=Партида|el=Παρτίδα|da=Batch|sv=Batch|nb=Batch|fi=Erä|et=Partii|lv=Partija|lt=Partija|is=Lota|mt=Lott|ga=Baisc|ca=Lot|eu=Lotea|gl=Lote|</xsl:when>
                <xsl:when test="$k='expiry'">|tr=Son kullanma|en=Expiry|de=Verfallsdatum|fr=Date limite|es=Caducidad|it=Scadenza|nl=Houdbaar tot|pt=Validade|pl=Data ważności|cs=Spotřebujte do|sk=Spotrebujte do|sl=Rok uporabe|hr=Rok trajanja|hu=Lejárat|ro=Expirare|bg=Годно до|el=Λήξη|da=Udløb|sv=Bäst före|nb=Best før|fi=Viimeinen käyttöpäivä|et=Kõlblik kuni|lv=Derīgs līdz|lt=Tinka iki|is=Fyrningardagur|mt=Skadenza|ga=Dáta éaga|ca=Caducitat|eu=Iraungitzea|gl=Caducidade|</xsl:when>
                <xsl:when test="$k='delivered'">|tr=Sevk edilen|en=Delivered|de=Geliefert|fr=Livré|es=Entregado|it=Consegnato|nl=Geleverd|pt=Entregue|pl=Wydano|cs=Dodáno|sk=Dodané|sl=Dobavljeno|hr=Isporučeno|hu=Szállítva|ro=Livrat|bg=Доставено|el=Παραδόθηκε|da=Leveret|sv=Levererat|nb=Levert|fi=Toimitettu|et=Tarnitud|lv=Piegādāts|lt=Pristatyta|is=Afhent|mt=Ikkunsinnat|ga=Seachadta|ca=Lliurat|eu=Entregatua|gl=Entregado|</xsl:when>
                <xsl:when test="$k='backorder'">|tr=Bekleyen|en=Backorder|de=Rückstand|fr=Reliquat|es=Pendiente|it=Inevaso|nl=Nalevering|pt=Pendente|pl=Zaległe|cs=Nedodáno|sk=Nedodané|sl=Nedobavljeno|hr=Naknadna isporuka|hu=Hátralék|ro=Restant|bg=Недоставено|el=Εκκρεμεί|da=Restordre|sv=Restnoterat|nb=Restordre|fi=Jälkitoimitus|et=Järeltarne|lv=Nepiegādāts|lt=Nepristatyta|is=Í bið|mt=Pendenti|ga=Fós le seachadadh|ca=Pendent|eu=Zain|gl=Pendente|</xsl:when>
                <xsl:when test="$k='notes'">|tr=Notlar|en=Notes|de=Hinweise|fr=Remarques|es=Notas|it=Note|nl=Opmerkingen|pt=Observações|pl=Uwagi|cs=Poznámky|sk=Poznámky|sl=Opombe|hr=Napomene|hu=Megjegyzések|ro=Mențiuni|bg=Забележки|el=Παρατηρήσεις|da=Bemærkninger|sv=Noteringar|nb=Merknader|fi=Lisätiedot|et=Märkused|lv=Piezīmes|lt=Pastabos|is=Athugasemdir|mt=Noti|ga=Nótaí|ca=Notes|eu=Oharrak|gl=Notas|</xsl:when>
                <xsl:when test="$k='legal'">|tr=Bu görünüm XML sevk bildiriminin okunabilir sunumudur.|en=This is a human-readable rendering of the XML despatch advice.|de=Diese Ansicht ist eine lesbare Darstellung des XML-Lieferavis.|fr=Cette vue est une représentation lisible de l’avis d’expédition XML.|es=Esta vista es una representación legible del aviso de expedición XML.|it=Questa è una rappresentazione leggibile dell’avviso di spedizione XML.|nl=Dit is een leesbare weergave van het XML-verzendbericht.|pt=Esta é uma representação legível do aviso de expedição em XML.|pl=To jest wizualizacja awiza wysyłki zapisanego w pliku XML.|cs=Toto je čitelné zobrazení avíza o odeslání ve formátu XML.|sk=Toto je čitateľné zobrazenie avíza o odoslaní vo formáte XML.|sl=To je berljiv prikaz dobavnice v obliki XML.|hr=Ovo je čitljiv prikaz XML otpremnice.|hu=Ez az XML szállítási értesítő olvasható megjelenítése.|ro=Aceasta este o reprezentare lizibilă a avizului de expediție XML.|bg=Това е визуализация за четене на XML известието за експедиция.|el=Η παρούσα είναι αναγνώσιμη απεικόνιση του δελτίου αποστολής σε μορφή XML.|da=Dette er en læsbar visning af XML-følgesedlen.|sv=Detta är en läsbar återgivning av XML-följesedeln.|nb=Dette er en lesbar visning av XML-følgeseddelen.|fi=Tämä on XML-lähetysilmoituksen luettava esitys.|et=See on XML-saatelehe inimloetav esitus.|lv=Šis ir XML pavadzīmes cilvēkam lasāms attēlojums.|lt=Tai žmogui skaitomas XML važtaraščio vaizdas.|is=Þetta er læsileg framsetning á XML-fylgiseðlinum.|mt=Din hija rappreżentazzjoni li tinqara tal-avviż tal-kunsinna XML.|ga=Is léiriú inléite é seo ar an bhfógra seolta XML.|ca=Aquesta vista és una representació llegible de l’albarà XML.|eu=Ikuspegi hau XML albaranaren irakurtzeko moduko irudikapena da.|gl=Esta vista é unha representación lexible do albará XML.|</xsl:when>
                <xsl:when test="$k='pcs'">|tr=adet|en=pcs|de=Stk.|fr=pce|es=ud.|it=pz|nl=st.|pt=un.|pl=szt.|cs=ks|sk=ks|sl=kos|hr=kom|hu=db|ro=buc.|bg=бр.|el=τεμ.|da=stk.|sv=st|nb=stk.|fi=kpl|et=tk|lv=gab.|lt=vnt.|is=stk.|mt=biċċiet|ga=píosaí|ca=u.|eu=ud.|gl=ud.|</xsl:when>
                <xsl:when test="$k='pallet'">|tr=Palet|en=Pallet|de=Palette|fr=Palette|es=Palé|it=Pallet|nl=Pallet|pt=Palete|pl=Paleta|cs=Paleta|sk=Paleta|sl=Paleta|hr=Paleta|hu=Raklap|ro=Palet|bg=Палет|el=Παλέτα|da=Palle|sv=Pall|nb=Pall|fi=Lava|et=Alus|lv=Palete|lt=Padėklas|is=Bretti|mt=Palett|ga=Pailléad|ca=Palet|eu=Paleta|gl=Palé|</xsl:when>
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
        <xsl:param name="time"/>
        <xsl:if test="string-length(normalize-space($value)) &gt;= 10">
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
        </xsl:if>
        <xsl:if test="string-length($time) &gt;= 5"><xsl:text> </xsl:text><xsl:value-of select="substring($time,1,5)"/></xsl:if>
    </xsl:template>

    <xsl:template name="num">
        <xsl:param name="v"/>
        <xsl:choose>
            <xsl:when test="string(number($v)) = 'NaN'"><xsl:value-of select="$v"/></xsl:when>
            <xsl:when test="$NS='dot'"><xsl:value-of select="format-number(number($v), '#,##0.###', 'dot')"/></xsl:when>
            <xsl:when test="$NS='space'"><xsl:value-of select="format-number(number($v), '#&#160;##0,###', 'space')"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="format-number(number($v), '#.##0,###', 'comma')"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="qty">
        <xsl:param name="q"/>
        <xsl:call-template name="num"><xsl:with-param name="v" select="$q"/></xsl:call-template>
        <xsl:text> </xsl:text>
        <xsl:choose>
            <xsl:when test="$q/@unitCode='C62' or $q/@unitCode='H87' or $q/@unitCode='EA'"><xsl:call-template name="t"><xsl:with-param name="k">pcs</xsl:with-param></xsl:call-template></xsl:when>
            <xsl:when test="$q/@unitCode='KGM'">kg</xsl:when>
            <xsl:when test="$q/@unitCode='TNE'">t</xsl:when>
            <xsl:when test="$q/@unitCode='LTR'">l</xsl:when>
            <xsl:when test="$q/@unitCode='MTR'">m</xsl:when>
            <xsl:when test="$q/@unitCode='MTQ'">m³</xsl:when>
            <xsl:otherwise><xsl:value-of select="$q/@unitCode"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="party-card">
        <xsl:param name="party"/>
        <xsl:param name="label"/>
        <div class="party">
            <div class="party-label"><xsl:call-template name="t"><xsl:with-param name="k" select="$label"/></xsl:call-template></div>
            <div class="party-name">
                <xsl:choose>
                    <xsl:when test="$party/cac:PartyName/cbc:Name"><xsl:value-of select="$party/cac:PartyName/cbc:Name"/></xsl:when>
                    <xsl:otherwise><xsl:value-of select="$party/cac:PartyLegalEntity/cbc:RegistrationName"/></xsl:otherwise>
                </xsl:choose>
            </div>
            <xsl:for-each select="$party/cac:PostalAddress">
                <div class="party-line"><xsl:value-of select="cbc:StreetName"/></div>
                <div class="party-line"><xsl:value-of select="normalize-space(concat(cbc:PostalZone, ' ', cbc:CityName, ' ', cac:Country/cbc:IdentificationCode))"/></div>
            </xsl:for-each>
            <table class="ids">
                <xsl:if test="$party/cbc:EndpointID">
                    <tr><td><xsl:call-template name="t"><xsl:with-param name="k">endpoint</xsl:with-param></xsl:call-template></td><td><xsl:value-of select="$party/cbc:EndpointID/@schemeID"/>:<xsl:value-of select="$party/cbc:EndpointID"/></td></tr>
                </xsl:if>
                <xsl:for-each select="$party/cac:PartyIdentification/cbc:ID">
                    <tr><td><xsl:call-template name="t"><xsl:with-param name="k">partyId</xsl:with-param></xsl:call-template></td><td><xsl:if test="@schemeID"><xsl:value-of select="@schemeID"/>:</xsl:if><xsl:value-of select="."/></td></tr>
                </xsl:for-each>
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

    <xsl:template match="/">
        <xsl:apply-templates select="n1:DespatchAdvice"/>
    </xsl:template>

    <xsl:template match="n1:DespatchAdvice">
        <xsl:variable name="ship" select="cac:Shipment"/>
        <xsl:variable name="addr" select="($ship/cac:Delivery/cac:DeliveryAddress | $ship/cac:Delivery/cac:DeliveryLocation/cac:Address)[1]"/>
        <html lang="{$L}">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title><xsl:call-template name="t"><xsl:with-param name="k">title</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="cbc:ID"/></title>
                <style type="text/css">
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; background: #edf4f3; color: #1b2f2d; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 11.5px; }
                    table { font-size: inherit; color: inherit; }
                    .page { width: 794px; margin: 0 auto; background: #fff; }
                    .topline { height: 8px; background: linear-gradient(90deg,#115e59,#0d9488,#5eead4); }
                    .header { padding: 30px 40px 20px; border-bottom: 1px solid #d9e8e6; display: table; width: 100%; }
                    .header-left, .header-right { display: table-cell; vertical-align: top; }
                    .header-right { width: 280px; }
                    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #e0f2f0; color: #115e59; font-size: 9.5px; font-weight: bold; letter-spacing: .8px; text-transform: uppercase; }
                    h1 { margin: 12px 0 4px; font-size: 27px; color: #0f2b28; }
                    .doc-no { color: #4a6663; font-size: 13px; font-weight: bold; }
                    .meta { width: 100%; border-collapse: collapse; }
                    .meta td { padding: 4px 0; vertical-align: top; }
                    .meta .key { color: #6b8582; font-size: 9.5px; text-transform: uppercase; letter-spacing: .5px; padding-right: 10px; }
                    .meta .value { text-align: right; font-weight: bold; }
                    .content { padding: 22px 40px 30px; }
                    .parties { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
                    .parties > tbody > tr > td { vertical-align: top; }
                    .parties > tbody > tr > td + td { padding-left: 12px; }
                    .party { padding: 15px 17px; border: 1px solid #d9e8e6; border-radius: 12px; background: #fafdfc; min-height: 150px; }
                    .party-label { color: #0d9488; font-size: 9.5px; font-weight: bold; letter-spacing: 1.1px; text-transform: uppercase; margin-bottom: 8px; }
                    .party-name { font-size: 14px; font-weight: bold; color: #0f2b28; margin-bottom: 4px; }
                    .party-line { color: #4a6663; line-height: 1.5; }
                    .ids { margin-top: 8px; border-collapse: collapse; width: 100%; }
                    .ids td { padding: 2px 0; vertical-align: top; color: #4a6663; font-size: 10.5px; }
                    .ids td:first-child { width: 110px; color: #7a918e; }
                    .section-title { margin: 22px 0 8px; font-size: 10.5px; letter-spacing: 1px; text-transform: uppercase; color: #0f2b28; font-weight: bold; }
                    .ship { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #d9e8e6; border-radius: 12px; }
                    .ship td { padding: 10px 14px; vertical-align: top; width: 25%; border-right: 1px solid #edf4f3; }
                    .ship td:last-child { border-right: 0; }
                    .ship .k { color: #7a918e; font-size: 9.5px; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 3px; }
                    .ship .v { font-weight: bold; color: #1b2f2d; line-height: 1.45; }
                    .grid { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #d9e8e6; border-radius: 10px; overflow: hidden; }
                    .grid th { background: #eef7f6; color: #3d5a57; font-size: 9.5px; text-transform: uppercase; letter-spacing: .4px; text-align: left; padding: 8px 10px; border-bottom: 1px solid #d9e8e6; }
                    .grid td { padding: 9px 10px; border-bottom: 1px solid #edf4f3; vertical-align: top; line-height: 1.45; }
                    .grid tr:last-child td { border-bottom: 0; }
                    .r { text-align: right !important; white-space: nowrap; }
                    .c { text-align: center !important; }
                    .muted { color: #7a918e; font-size: 10px; }
                    .item-name { font-weight: bold; color: #0f2b28; }
                    .warn { color: #b45309; font-size: 10px; }
                    .chip { display: inline-block; margin: 0 6px 6px 0; padding: 5px 9px; border: 1px solid #d9e8e6; border-radius: 8px; background: #fafdfc; font-size: 10.5px; }
                    .footer { margin-top: 24px; padding: 12px 40px 22px; border-top: 1px solid #d9e8e6; color: #7a918e; font-size: 9px; line-height: 1.6; }
                    @media print { html, body { background: #fff; } .page { width: 100%; } }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="topline"></div>
                    <div class="header">
                        <div class="header-left">
                            <span class="badge">Peppol BIS Despatch Advice 3</span>
                            <h1><xsl:call-template name="t"><xsl:with-param name="k">title</xsl:with-param></xsl:call-template></h1>
                            <div class="doc-no"><xsl:value-of select="cbc:ID"/></div>
                        </div>
                        <div class="header-right">
                            <table class="meta">
                                <tr>
                                    <td class="key"><xsl:call-template name="t"><xsl:with-param name="k">date</xsl:with-param></xsl:call-template></td>
                                    <td class="value"><xsl:call-template name="date"><xsl:with-param name="value" select="cbc:IssueDate"/><xsl:with-param name="time" select="cbc:IssueTime"/></xsl:call-template></td>
                                </tr>
                                <xsl:if test="cac:OrderReference/cbc:ID">
                                    <tr>
                                        <td class="key"><xsl:call-template name="t"><xsl:with-param name="k">order</xsl:with-param></xsl:call-template></td>
                                        <td class="value"><xsl:value-of select="cac:OrderReference/cbc:ID"/></td>
                                    </tr>
                                </xsl:if>
                                <xsl:if test="$ship/cbc:ID">
                                    <tr>
                                        <td class="key"><xsl:call-template name="t"><xsl:with-param name="k">shipmentId</xsl:with-param></xsl:call-template></td>
                                        <td class="value"><xsl:value-of select="$ship/cbc:ID"/></td>
                                    </tr>
                                </xsl:if>
                            </table>
                        </div>
                    </div>

                    <div class="content">
                        <table class="parties">
                            <tr>
                                <td><xsl:call-template name="party-card"><xsl:with-param name="party" select="cac:DespatchSupplierParty/cac:Party"/><xsl:with-param name="label">supplier</xsl:with-param></xsl:call-template></td>
                                <td><xsl:call-template name="party-card"><xsl:with-param name="party" select="cac:DeliveryCustomerParty/cac:Party"/><xsl:with-param name="label">deliveryParty</xsl:with-param></xsl:call-template></td>
                                <xsl:if test="cac:BuyerCustomerParty/cac:Party">
                                    <td><xsl:call-template name="party-card"><xsl:with-param name="party" select="cac:BuyerCustomerParty/cac:Party"/><xsl:with-param name="label">buyer</xsl:with-param></xsl:call-template></td>
                                </xsl:if>
                            </tr>
                        </table>

                        <div class="section-title"><xsl:call-template name="t"><xsl:with-param name="k">shipment</xsl:with-param></xsl:call-template></div>
                        <table class="ship">
                            <tr>
                                <td>
                                    <div class="k"><xsl:call-template name="t"><xsl:with-param name="k">despatched</xsl:with-param></xsl:call-template></div>
                                    <div class="v"><xsl:call-template name="date"><xsl:with-param name="value" select="$ship/cac:Delivery/cac:Despatch/cbc:ActualDespatchDate"/><xsl:with-param name="time" select="$ship/cac:Delivery/cac:Despatch/cbc:ActualDespatchTime"/></xsl:call-template></div>
                                </td>
                                <td>
                                    <div class="k"><xsl:call-template name="t"><xsl:with-param name="k">estimated</xsl:with-param></xsl:call-template></div>
                                    <div class="v">
                                        <xsl:for-each select="$ship/cac:Delivery/cac:EstimatedDeliveryPeriod">
                                            <xsl:call-template name="date"><xsl:with-param name="value" select="cbc:StartDate"/><xsl:with-param name="time" select="cbc:StartTime"/></xsl:call-template>
                                            <xsl:if test="cbc:EndTime"><xsl:text> – </xsl:text><xsl:value-of select="substring(cbc:EndTime,1,5)"/></xsl:if>
                                        </xsl:for-each>
                                    </div>
                                </td>
                                <td>
                                    <div class="k"><xsl:call-template name="t"><xsl:with-param name="k">carrier</xsl:with-param></xsl:call-template></div>
                                    <div class="v">
                                        <xsl:value-of select="$ship/cac:Delivery/cac:CarrierParty/cac:PartyName/cbc:Name"/>
                                        <xsl:if test="$ship/cac:Delivery/cbc:TrackingID"><div class="muted"><xsl:call-template name="t"><xsl:with-param name="k">tracking</xsl:with-param></xsl:call-template>: <xsl:value-of select="$ship/cac:Delivery/cbc:TrackingID"/></div></xsl:if>
                                    </div>
                                </td>
                                <td>
                                    <div class="k"><xsl:call-template name="t"><xsl:with-param name="k">weight</xsl:with-param></xsl:call-template></div>
                                    <div class="v">
                                        <xsl:if test="$ship/cbc:GrossWeightMeasure"><xsl:call-template name="qty"><xsl:with-param name="q" select="$ship/cbc:GrossWeightMeasure"/></xsl:call-template></xsl:if>
                                        <xsl:if test="$ship/cbc:GrossVolumeMeasure"><div class="muted"><xsl:call-template name="t"><xsl:with-param name="k">volume</xsl:with-param></xsl:call-template>: <xsl:call-template name="qty"><xsl:with-param name="q" select="$ship/cbc:GrossVolumeMeasure"/></xsl:call-template></div></xsl:if>
                                    </div>
                                </td>
                            </tr>
                        </table>

                        <xsl:if test="$addr">
                            <div class="section-title"><xsl:call-template name="t"><xsl:with-param name="k">deliverTo</xsl:with-param></xsl:call-template></div>
                            <div class="chip"><xsl:value-of select="normalize-space(concat($addr/cbc:StreetName, ', ', $addr/cbc:PostalZone, ' ', $addr/cbc:CityName, ' ', $addr/cac:Country/cbc:IdentificationCode))"/></div>
                        </xsl:if>

                        <xsl:if test="$ship/cac:TransportHandlingUnit">
                            <div class="section-title"><xsl:call-template name="t"><xsl:with-param name="k">units</xsl:with-param></xsl:call-template></div>
                            <xsl:for-each select="$ship/cac:TransportHandlingUnit">
                                <span class="chip">
                                    <xsl:choose>
                                        <xsl:when test="cbc:TransportHandlingUnitTypeCode='PX'"><xsl:call-template name="t"><xsl:with-param name="k">pallet</xsl:with-param></xsl:call-template></xsl:when>
                                        <xsl:otherwise><xsl:value-of select="cbc:TransportHandlingUnitTypeCode"/></xsl:otherwise>
                                    </xsl:choose>
                                    <xsl:text> · </xsl:text>
                                    <xsl:if test="cbc:ID/@schemeID"><xsl:value-of select="cbc:ID/@schemeID"/><xsl:text> </xsl:text></xsl:if>
                                    <xsl:value-of select="cbc:ID"/>
                                </span>
                            </xsl:for-each>
                        </xsl:if>

                        <div class="section-title"><xsl:call-template name="t"><xsl:with-param name="k">lines</xsl:with-param></xsl:call-template></div>
                        <table class="grid">
                            <thead>
                                <tr>
                                    <th class="c" style="width:34px"><xsl:call-template name="t"><xsl:with-param name="k">pos</xsl:with-param></xsl:call-template></th>
                                    <th><xsl:call-template name="t"><xsl:with-param name="k">item</xsl:with-param></xsl:call-template></th>
                                    <th style="width:150px"><xsl:call-template name="t"><xsl:with-param name="k">lot</xsl:with-param></xsl:call-template></th>
                                    <th class="r" style="width:100px"><xsl:call-template name="t"><xsl:with-param name="k">delivered</xsl:with-param></xsl:call-template></th>
                                    <th class="r" style="width:90px"><xsl:call-template name="t"><xsl:with-param name="k">backorder</xsl:with-param></xsl:call-template></th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:for-each select="cac:DespatchLine">
                                    <tr>
                                        <td class="c"><xsl:value-of select="cbc:ID"/></td>
                                        <td>
                                            <div class="item-name"><xsl:value-of select="cac:Item/cbc:Name"/></div>
                                            <xsl:if test="cac:Item/cbc:Description"><div class="muted"><xsl:value-of select="cac:Item/cbc:Description"/></div></xsl:if>
                                            <div class="muted">
                                                <xsl:if test="cac:Item/cac:SellersItemIdentification/cbc:ID"><xsl:call-template name="t"><xsl:with-param name="k">itemNo</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="cac:Item/cac:SellersItemIdentification/cbc:ID"/><xsl:text>   </xsl:text></xsl:if>
                                                <xsl:if test="cac:Item/cac:StandardItemIdentification/cbc:ID">GTIN <xsl:value-of select="cac:Item/cac:StandardItemIdentification/cbc:ID"/><xsl:text>   </xsl:text></xsl:if>
                                                <xsl:if test="cac:OrderLineReference/cbc:LineID"><xsl:call-template name="t"><xsl:with-param name="k">orderLine</xsl:with-param></xsl:call-template><xsl:text> </xsl:text><xsl:value-of select="cac:OrderLineReference/cbc:LineID"/></xsl:if>
                                            </div>
                                            <xsl:if test="cbc:BackorderReason"><div class="warn"><xsl:value-of select="cbc:BackorderReason"/></div></xsl:if>
                                            <xsl:if test="cbc:Note"><div class="muted"><xsl:value-of select="cbc:Note"/></div></xsl:if>
                                        </td>
                                        <td>
                                            <xsl:for-each select="cac:Item/cac:ItemInstance">
                                                <div><xsl:value-of select="cac:LotIdentification/cbc:LotNumberID"/><xsl:value-of select="cbc:SerialID"/></div>
                                                <xsl:if test="cac:LotIdentification/cbc:ExpiryDate or cbc:BestBeforeDate">
                                                    <div class="muted"><xsl:call-template name="t"><xsl:with-param name="k">expiry</xsl:with-param></xsl:call-template>: <xsl:call-template name="date"><xsl:with-param name="value" select="(cac:LotIdentification/cbc:ExpiryDate | cbc:BestBeforeDate)[1]"/></xsl:call-template></div>
                                                </xsl:if>
                                            </xsl:for-each>
                                        </td>
                                        <td class="r"><b><xsl:call-template name="qty"><xsl:with-param name="q" select="cbc:DeliveredQuantity"/></xsl:call-template></b></td>
                                        <td class="r">
                                            <xsl:if test="number(cbc:BackorderQuantity) &gt; 0"><span class="warn"><xsl:call-template name="qty"><xsl:with-param name="q" select="cbc:BackorderQuantity"/></xsl:call-template></span></xsl:if>
                                        </td>
                                    </tr>
                                </xsl:for-each>
                            </tbody>
                        </table>

                        <xsl:if test="cbc:Note">
                            <div class="section-title"><xsl:call-template name="t"><xsl:with-param name="k">notes</xsl:with-param></xsl:call-template></div>
                            <xsl:for-each select="cbc:Note"><div class="muted" style="font-size:11px"><xsl:value-of select="."/></div></xsl:for-each>
                        </xsl:if>
                    </div>

                    <div class="footer">
                        <div><xsl:call-template name="t"><xsl:with-param name="k">legal</xsl:with-param></xsl:call-template></div>
                        <div><xsl:value-of select="cbc:CustomizationID"/><xsl:if test="cbc:ProfileID"><xsl:text> · </xsl:text><xsl:value-of select="cbc:ProfileID"/></xsl:if></div>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
