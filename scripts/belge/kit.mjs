// CreditNote (e-Döviz / e-Kıymetli Maden, e-Dekont, e-Sigorta Komisyon Gider) ve e-Yolcu Listesi
// şablonlarının ortak XSLT parçaları. Tasarımlar bu blokları kendi HTML iskeleti ve CSS'iyle birleştirir.
import { choose, dt, each, iban, iff, num, pAddr, pContact, pName, pTax, t, v, xslt } from '../moda/lib.mjs';

export const LMT = '$f/cac:LegalMonetaryTotal';
export const SUP = '$f/cac:AccountingSupplierParty/cac:Party';
export const CUS = '$f/cac:AccountingCustomerParty/cac:Party';
export const BUY = '$f/cac:BuyerCustomerParty/cac:Party';

/** Tutarın para birimi (TRY → TL). */
export const cur = (s) => choose([`not(${s}/@currencyID) or ${s}/@currencyID='TRY'`, t('TL')], [null, v(`${s}/@currencyID`)]);
export const cm = (s, p) => `${num(s, p)}${t(' ')}${cur(s)}`;
export const tl = (s) => `${num(s)}${t(' TL')}`;
export const lbl = (s) => `<xsl:call-template name="etiket"><xsl:with-param name="s" select="${s}"/></xsl:call-template>`;
export const pid = (p, k) => `${p}/cac:PartyIdentification/cbc:ID[@schemeID='${k}']`;
export const saat = (s = '$f/cbc:IssueTime') => v(`substring(${s},1,5)`);
export const tarihSaat = () => `${dt('$f/cbc:IssueDate')}${t(' ')}${saat()}`;

/** Taraf bloğu (bağlam dışından çağrılır): ad, adres, vergi, ek kimlikler, iletişim. */
const EK = "cac:PartyIdentification/cbc:ID[not(@schemeID='VKN' or @schemeID='TCKN' or @schemeID='MERSISNO' or @schemeID='MUSTERITURU')]";
export const partyBlock = (P, { contact = true, extra = true } = {}) => each(P, [
    `<div class="p-ad">${pName}</div>`,
    `<div class="p-adr">${pAddr()}</div>`,
    iff("cac:PartyIdentification/cbc:ID[@schemeID='VKN' or @schemeID='TCKN']", `<div class="p-vk">${pTax()}</div>`),
    extra ? iff(EK,
        `<div class="p-ek">${each(EK,
            `<span><i>${lbl('@schemeID')}</i>${t(' ')}${choose(["@schemeID='IBAN'", iban('.')], [null, v('.')])}</span>${t(' ')}`)}</div>`) : '',
    contact ? iff('cac:Contact or cbc:WebsiteURI', `<div class="p-il">${pContact()}</div>`) : '',
].join(''));

/** Belge kimliği satırları: row(etiket, değer). */
export const meta = (row) => [
    row(t('Belge No'), v('$f/cbc:ID')),
    row(t('Düzenleme Tarihi'), tarihSaat()),
    row(t('ETTN'), v('$f/cbc:UUID')),
].join('');

/** Ek belge referansları: row(etiket, değer). */
export const refs = (row) => each('$f/cac:AdditionalDocumentReference', row(
    choose(['cbc:ID/@schemeID', lbl('cbc:ID/@schemeID')], ['cbc:DocumentTypeCode', lbl('cbc:DocumentTypeCode')], [null, lbl('cbc:DocumentType')]),
    v('cbc:ID')));

/** "Yalnız" ve diğer notlar. */
export const yalniz = (b) => each("$f/cbc:Note[starts-with(.,'Yalnız')]", b);
export const notes = (b, extra = '') => each(`$f/cbc:Note[not(starts-with(.,'Yalnız'))${extra}]`, b);

export const TEMPLATES = `
    <xsl:template name="etiket">
        <xsl:param name="s"/>
        <xsl:choose>
            <xsl:when test="$s='TCKN'">T.C. Kimlik No</xsl:when>
            <xsl:when test="$s='VKN'">Vergi No</xsl:when>
            <xsl:when test="$s='MUSTERINO'">Müşteri No</xsl:when>
            <xsl:when test="$s='MUSTERITURU'">Müşteri Türü</xsl:when>
            <xsl:when test="$s='ABONENO'">Abone No</xsl:when>
            <xsl:when test="$s='PLAKA'">Plaka</xsl:when>
            <xsl:when test="$s='SUBEKODU'">Şube Kodu</xsl:when>
            <xsl:when test="$s='SUBEADI'">Şube</xsl:when>
            <xsl:when test="$s='SUBENO'">Şube No</xsl:when>
            <xsl:when test="$s='TICARETSICILNO'">Ticaret Sicil No</xsl:when>
            <xsl:when test="$s='LEVHANO'">Levha No</xsl:when>
            <xsl:when test="$s='ISLEMREFNO' or $s='ISLEMREFERANSNO'">İşlem Referans No</xsl:when>
            <xsl:when test="$s='ISLEMKANALI'">İşlem Kanalı</xsl:when>
            <xsl:when test="$s='BELGE_NO'">Tahakkuk / Belge No</xsl:when>
            <xsl:when test="$s='BELGENO' or $s='FATURA'">Fatura No</xsl:when>
            <xsl:when test="$s='BANKAPROVIZYONNO'">Provizyon No</xsl:when>
            <xsl:when test="$s='ISTATISTIKNO'">İstatistik No</xsl:when>
            <xsl:when test="$s='KREDINO'">Kredi No</xsl:when>
            <xsl:when test="$s='BEYANNAMENO'">Beyanname No</xsl:when>
            <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template name="dekontTip">
        <xsl:param name="s"/>
        <xsl:choose>
            <xsl:when test="$s='NKT'">Nakit İşlem</xsl:when>
            <xsl:when test="$s='HVL'">Havale</xsl:when>
            <xsl:when test="$s='EFT'">EFT</xsl:when>
            <xsl:when test="$s='SWT'">SWIFT</xsl:when>
            <xsl:when test="$s='DVZ'">Döviz İşlemi</xsl:when>
            <xsl:when test="$s='PAGO'">Para Gönderme</xsl:when>
            <xsl:when test="$s='PAL'">Para Alma</xsl:when>
            <xsl:when test="$s='POSH'">POS Hizmeti</xsl:when>
            <xsl:when test="$s='FTM'">Fatura Tahsilatı</xsl:when>
            <xsl:when test="$s='EPIH'">Elektronik Para İhracı</xsl:when>
            <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template name="profilAd">
        <xsl:param name="s"/>
        <xsl:choose>
            <xsl:when test="$s='DEKONT'">e-Dekont</xsl:when>
            <xsl:when test="$s='DEKONTIPTAL'">e-Dekont İptal</xsl:when>
            <xsl:when test="$s='VTA'">Vergi Tahsil Alındısı</xsl:when>
            <xsl:when test="$s='VTAIPTAL'">Vergi Tahsil Alındısı İptal</xsl:when>
            <xsl:when test="$s='GVTA'">Gümrük Vergi Tahsil Alındısı</xsl:when>
            <xsl:when test="$s='GVTAIPTAL'">Gümrük Vergi Tahsil Alındısı İptal</xsl:when>
            <xsl:when test="$s='EDOVIZBELGE'">e-Döviz Belgesi</xsl:when>
            <xsl:when test="$s='EKIYMETLIMADENBELGE'">e-Kıymetli Maden Belgesi</xsl:when>
            <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template name="birimAd">
        <xsl:param name="u"/>
        <xsl:choose>
            <xsl:when test="$u='GRM'">gr</xsl:when>
            <xsl:when test="$u='C62'">adet</xsl:when>
            <xsl:when test="$u='KGM'">kg</xsl:when>
            <xsl:otherwise><xsl:value-of select="$u"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>`;

export const profilAd = (s = '$f/cbc:ProfileID') => `<xsl:call-template name="profilAd"><xsl:with-param name="s" select="${s}"/></xsl:call-template>`;
export const birim = (s) => `<xsl:call-template name="birimAd"><xsl:with-param name="u" select="${s}"/></xsl:call-template>`;

/** CreditNote kökünde XSLT; ortak etiket şablonlarıyla. */
export const cnXslt = ({ comment, title, css, body }) => xslt({ root: 'CreditNote', comment, title, css, body, templates: TEMPLATES });

/* ------------------------------------------------------------- e-Dekont */

const LN = '$f/cac:CreditNoteLine';
const OZEL = "cac:Item/cbc:Name='TOPLAM TUTAR' or cac:Item/cbc:Name='ÖDENECEK TUTAR'";
export const DK = {
    /** Tutarlı satırlar (toplam / ödenecek hariç) ve vergi satırları: row(etiket, açıklama, tutar). */
    tutarlar: (row) => [
        each(`${LN}[cac:Price][not(${OZEL})]`, row(v('cac:Item/cbc:Name'), v('cac:Item/cbc:Description'), cm('cac:Price/cbc:PriceAmount'))),
        each('$f/cac:TaxTotal/cac:TaxSubtotal[cbc:TaxAmount &gt; 0]', row(
            `${v('cac:TaxCategory/cac:TaxScheme/cbc:Name')}${t(' (%')}${v('cbc:Percent')}${t(')')}`, '', cm('cbc:TaxAmount'))),
    ].join(''),
    /** Açıklama satırları (tutarsız): row(etiket, açıklama). İşlem tipi ayrıca gösterildiğinden hariç tutulabilir. */
    bilgiler: (row, skipTip = true) => each(`${LN}[not(cac:Price)]${skipTip ? "[not(cac:Item/cbc:Name='İŞLEM TİPİ')]" : ''}`, row(v('cac:Item/cbc:Name'), v('cac:Item/cbc:Description'))),
    islemTipi: choose(
        [`${LN}[cac:Item/cbc:Name='İŞLEM TİPİ']`, v(`${LN}[cac:Item/cbc:Name='İŞLEM TİPİ']/cac:Item/cbc:Description`)],
        [null, `<xsl:call-template name="dekontTip"><xsl:with-param name="s" select="$f/cbc:CreditNoteTypeCode"/></xsl:call-template>`]),
    aciklama: v(`${LN}[cac:Item/cbc:Name='AÇIKLAMA']/cac:Item/cbc:Description`),
    odenecek: cm(`${LMT}/cbc:PayableAmount`),
    /** İşlem başlangıç / bitiş (valör) zamanı. */
    islemZamani: iff('$f/cac:PaymentTerms/cac:SettlementPeriod', `${dt('$f/cac:PaymentTerms/cac:SettlementPeriod/cbc:StartDate')}${t(' ')}${v('$f/cac:PaymentTerms/cac:SettlementPeriod/cbc:StartTime')}`),
};

/* ------------------------------------------------------------- e-Döviz / Kıymetli Maden */

const KUR = "$f/cbc:Note[starts-with(.,'Kur Tablosu')]";
export const DV = {
    /** "Kur Tablosu | USD | 42,1460 | 42,5280" notları: row(döviz, alış, satış). */
    kurlar: (row) => each(KUR, row(
        v("substring-before(substring-after(.,'| '),' |')"),
        v("substring-before(substring-after(substring-after(.,'| '),'| '),' |')"),
        v("substring-after(substring-after(substring-after(.,'| '),'| '),'| ')"))),
    varKur: KUR,
    /** Satırlar: row({ ad, aciklama, miktar, birim, fiyat, tutar }). */
    satirlar: (row) => each(LN, row({
        no: v('cbc:ID'),
        ad: v('cac:Item/cbc:Name'),
        aciklama: v('cac:Item/cbc:Description'),
        miktar: num('cbc:CreditedQuantity', '###.##0,##'),
        birim: birim('cbc:CreditedQuantity/@unitCode'),
        fiyat: cm('cac:Price/cbc:PriceAmount', '###.##0,00##'),
        tutar: cm('cbc:LineExtensionAmount'),
    })),
    /** Döviz cinsi satır toplamı TL'den farklıysa işlem kuru. */
    dovizli: `${LMT}/cbc:LineExtensionAmount/@currencyID!='TRY'`,
    islemKuru: num(`${LMT}/cbc:TaxExclusiveAmount div ${LMT}/cbc:LineExtensionAmount`, '###.##0,0000'),
    /** Toplam satırları: row(etiket, tutar). */
    toplamlar: (row) => [
        row(t('Toplam'), cm(`${LMT}/cbc:LineExtensionAmount`)),
        iff(`${LMT}/cbc:LineExtensionAmount/@currencyID!='TRY'`, [
            row(`${t('İşlem Kuru (1 ')}${v(`${LMT}/cbc:LineExtensionAmount/@currencyID`)}${t(')')}`, `${num(`${LMT}/cbc:TaxExclusiveAmount div ${LMT}/cbc:LineExtensionAmount`, '###.##0,0000')}${t(' TL')}`),
            row(t('TL Karşılığı'), cm(`${LMT}/cbc:TaxExclusiveAmount`)),
        ].join('')),
        each('$f/cac:TaxTotal/cac:TaxSubtotal', row(
            `${v('cac:TaxCategory/cac:TaxScheme/cbc:Name')}${t(' (%')}${num('cbc:Percent', '##0,##')}${t(')')}`, cm('cbc:TaxAmount'))),
    ].join(''),
    odenecek: cm(`${LMT}/cbc:PayableAmount`),
    /** Ödeme araçları: row(açıklama, hesap). */
    odemeler: (row) => each('$f/cac:PaymentMeans', row(v('cbc:InstructionNote'),
        choose(["cac:PayerFinancialAccount/cbc:ID!='0'", iban('cac:PayerFinancialAccount/cbc:ID')],
            ["cac:PayeeFinancialAccount/cbc:ID!='0'", iban('cac:PayeeFinancialAccount/cbc:ID')], [null, t('Elden / efektif')]))),
    musteriTuru: choose(
        [`${CUS}/cac:PartyIdentification/cbc:ID[@schemeID='MUSTERITURU']='GERCEKKISI'`, t('Gerçek kişi')],
        [`${CUS}/cac:PartyIdentification/cbc:ID[@schemeID='MUSTERITURU']='TUZELKISI'`, t('Tüzel kişi')], [null, t('—')]),
    tip: choose(["$f/cbc:CreditNoteTypeCode='ALIM'", t('ALIM')], [null, t('SATIM')]),
};

/* ------------------------------------------------------------- e-Sigorta Komisyon Gider */

const IST = "cac:AllowanceCharge[cbc:AllowanceChargeReason='Istihsal']";
const IPT = "cac:AllowanceCharge[cbc:AllowanceChargeReason='IPTAL']";
export const SG = {
    istTop: `sum(${LN}/${IST}/cbc:Amount)`,
    iptTop: `sum(${LN}/${IPT}/cbc:Amount)`,
    net: `${LMT}/cbc:PayableAmount`,
    /** Satır bağlamı yolları. */
    ist: `${IST}/cbc:Amount`,
    ipt: `${IPT}/cbc:Amount`,
    istMatrah: `${IST}/cbc:BaseAmount`,
    iptMatrah: `${IPT}/cbc:BaseAmount`,
    oran: num(`${IST}/cbc:MultiplierFactorNumeric * 100`, '##0,##'),
    adet: v('cbc:CreditedQuantity'),
    satirNet: 'cbc:LineExtensionAmount',
    satirlar: (b) => each(LN, b),
    donem: v('$f/cac:InvoicePeriod/cbc:Description'),
    donemAralik: `${dt('$f/cac:InvoicePeriod/cbc:StartDate')}${t(' – ')}${dt('$f/cac:InvoicePeriod/cbc:EndDate')}`,
    /** Net komisyonun istihsale oranı (%), çubuk genişliği için. */
    pay: (s) => `round(${s} div (${`sum(${LN}/${IST}/cbc:Amount)`} + 0.0001) * 100)`,
    banka: each('$f/cac:PaymentMeans/cac:PayeeFinancialAccount', `${v('cac:FinancialInstitutionBranch/cac:FinancialInstitution/cbc:Name')}${t(' · ')}${v('cac:FinancialInstitutionBranch/cbc:Name')}${t(' · ')}${v('cbc:ID')}`),
    vade: dt('$f/cac:PaymentMeans/cbc:PaymentDueDate'),
};

/* ------------------------------------------------------------- e-Yolcu Listesi */

export const YL = {
    /** yolcuListesi bağlamında. */
    no: v('ebilet:yolcuListesiNo'),
    sefer: v('ebilet:seferNumarasi'),
    tarih: dt('ebilet:seferTarihi'),
    saat: v("substring(substring-after(ebilet:haraketZamani,'T'),1,5)"),
    nokta: v('ebilet:hareketNoktasi'),
    plaka: v('ebilet:aracPlakasi'),
    hasilat: tl('ebilet:toplamHasilat'),
    ozet: v('ebilet:ozetDeger'),
    sayi: v('count(ebilet:koltukListesi/ebilet:koltuk)'),
    ortalama: tl('ebilet:toplamHasilat div count(ebilet:koltukListesi/ebilet:koltuk)'),
    isleten: (b) => iff('ebilet:aracIsleten', b),
    islVkn: v('ebilet:aracIsleten/ebilet:vkn'),
    komisyon: tl('ebilet:aracIsleten/ebilet:komisyonTutar'),
    komKdv: tl('ebilet:aracIsleten/ebilet:komisyonKDV'),
    /** Koltuklar (koltuk no sırasıyla): row({ sira, koltuk, bilet, ad, kimlikTur, kimlik, tutar }). */
    koltuklar: (row) => `<xsl:for-each select="ebilet:koltukListesi/ebilet:koltuk"><xsl:sort select="ebilet:koltukNo" data-type="number"/>${row({
        sira: v('position()'),
        koltuk: v('ebilet:koltukNo'),
        bilet: v('ebilet:biletNo'),
        ad: v('ebilet:adSoyad'),
        kimlikTur: choose(['ebilet:pasaportNo', t('Pasaport')], [null, t('T.C. / YKN')]),
        kimlik: choose(['ebilet:pasaportNo', v('ebilet:pasaportNo')], [null, v("concat(substring(ebilet:tcknYkn,1,3),'*****',substring(ebilet:tcknYkn,9,3))")]),
        tutar: tl('ebilet:tutar'),
    })}</xsl:for-each>`,
    /** Koltuk planı: 1..kapasite arası kutular (dolu olanlar "dolu" sınıflı). */
    izgara: (kapasite) => `<xsl:call-template name="izgara"><xsl:with-param name="ks" select="ebilet:koltukListesi/ebilet:koltuk"/><xsl:with-param name="max" select="${kapasite}"/></xsl:call-template>`,
    listeler: (b) => each('/ebilet:eYolcuListesi/ebilet:yolcuListesi', b),
};

/** e-Yolcu Listesi XSLT'si. Düzenleyen unvanı / adresi XML'de bulunmadığından değişken olarak gömülür. */
export function ebiletXslt({ comment, title, issuer, css, body }) {
    const q = (s) => `'${s}'`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<!--
${comment.trim().split('\n').map((s) => `  ${s.trim()}`).join('\n')}
  Düzenleyen unvan / adres / vergi dairesi XML'de bulunmadığından aşağıdaki değişkenlerden okunur.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:ebilet="http://ebilet.efatura.gov.tr"
    exclude-result-prefixes="ebilet">
    <xsl:output method="html" encoding="UTF-8" indent="no"/>
    <xsl:decimal-format name="edesign-tr" decimal-separator="," grouping-separator="." NaN=""/>

    <xsl:variable name="duzenleyenUnvan" select="${q(issuer.unvan)}"/>
    <xsl:variable name="duzenleyenAdres" select="${q(issuer.adres)}"/>
    <xsl:variable name="duzenleyenVergiDairesi" select="${q(issuer.vd)}"/>
    <xsl:variable name="duzenleyenTelefon" select="${q(issuer.tel ?? '')}"/>
    <xsl:variable name="bl" select="/ebilet:eYolcuListesi/ebilet:baslik"/>

    <xsl:template name="tarih">
        <xsl:param name="d"/>
        <xsl:if test="string-length($d) &gt;= 10"><xsl:value-of select="concat(substring($d,9,2),'.',substring($d,6,2),'.',substring($d,1,4))"/></xsl:if>
    </xsl:template>
    <xsl:template name="izgara">
        <xsl:param name="ks"/>
        <xsl:param name="i" select="1"/>
        <xsl:param name="max"/>
        <xsl:if test="$i &lt;= $max">
            <span>
                <xsl:attribute name="class">kt<xsl:if test="$ks[ebilet:koltukNo=$i]"> dolu</xsl:if></xsl:attribute>
                <xsl:value-of select="$i"/>
            </span>
            <xsl:call-template name="izgara">
                <xsl:with-param name="ks" select="$ks"/>
                <xsl:with-param name="i" select="$i + 1"/>
                <xsl:with-param name="max" select="$max"/>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>

    <xsl:template match="/">
        <html lang="tr">
            <head>
                <meta charset="utf-8"/>
                <title>${title} <xsl:value-of select="/ebilet:eYolcuListesi/ebilet:yolcuListesi[1]/ebilet:yolcuListesiNo"/></title>
                <style>
                    @page { size: A4; margin: 0; }
                    * { box-sizing: border-box; }
                    table { font-size: inherit; line-height: inherit; color: inherit; }
                    body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .sayfa { width: 210mm; min-height: 297mm; margin: 0 auto; position: relative; }
${css.trim().split('\n').map((s) => `                    ${s.trim()}`).join('\n')}
                </style>
            </head>
            <body>
${body}
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
`;
}

/** Başlık (baslik) alanları. */
export const BL = {
    vkn: v('$bl/ebilet:gonderen/ebilet:vkn'),
    aralik: `${dt('$bl/ebilet:baslangicTarihi')}${iff('$bl/ebilet:bitisTarihi!=$bl/ebilet:baslangicTarihi', `${t(' – ')}${dt('$bl/ebilet:bitisTarihi')}`)}`,
    uuid: v('$bl/ebilet:uuid'),
    unvan: v('$duzenleyenUnvan'),
    adres: v('$duzenleyenAdres'),
    vd: v('$duzenleyenVergiDairesi'),
    tel: v('$duzenleyenTelefon'),
};
