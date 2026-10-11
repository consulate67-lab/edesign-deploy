// Perakende şablon tanımları için kısa yardımcılar (örnek veriler kurgusaldır).

export const adr = (street, no, district, city, zip) => ({ street, no, district, city, zip });
export const kisi = (tckn, ad, soyad, addr, tel, mail) => ({ ids: [['TCKN', tckn]], person: [ad, soyad], addr, tel, mail });
/** Adı soyadı bilinmeyen nihai tüketici (e-Arşiv'de 11111111111). */
export const nihai = (addr) => ({ ids: [['TCKN', '11111111111']], person: ['Nihai', 'Tüketici'], addr });
export const firma = (vkn, name, addr, vd, tel, mail, web, mersis) => ({
    web, ids: [['VKN', vkn], ...(mersis ? [['MERSISNO', mersis]] : [])], name, addr, vd, tel, mail,
});
/** Satır: ad, birim (C62 adet, PR çift, MTR metre, SET, KGM ...), miktar, birim fiyat, KDV %, ek tanımlar, diğer alanlar. */
export const L = (name, unit, qty, price, kdv, props = {}, x = {}) => ({ name, unit, qty, price, kdv, props, ...x });
export const isk = (rate, reason, x = {}) => ({ disc: { rate, reason }, ...x });
/** Ek belge (AdditionalDocumentReference): tür, no, tarih, açıklama. */
export const R = (type, id, date, desc) => ({ type, id, date, desc });

/** ISO 13616 kontrol haneli TR IBAN: 5 haneli banka kodu + 16 haneli hesap. */
export const trIban = (bankCode, account) => {
    const bban = `${bankCode}0${account}`;
    const digits = `${bban}2927` + '00';
    let rem = 0;
    for (const d of digits) rem = (rem * 10 + Number(d)) % 97;
    return `TR${String(98 - rem).padStart(2, '0')}${bban}`;
};
