import i18n from '../i18n';
import { extraDocTextPack, findCountry, isDocLanguage, type DocLanguage, type DocObjectTexts } from '../international';

const LANG_PARAM = /<xsl:param\s+name="lang"\s+select="'([a-z]{2})'"\s*\/>/;
const CUSTOMIZATION = /<(?:[\w.-]+:)?CustomizationID\b[^>]*>\s*([^<\s]+)/;
const SUPPLIER_COUNTRY = /<(?:[\w.-]+:)?(?:AccountingSupplierParty|DespatchSupplierParty)\b[\s\S]*?<(?:[\w.-]+:)?IdentificationCode\b[^>]*>\s*([A-Z]{2})\s*</;

/** EN 16931 / Peppol / XRechnung belgesi mi (GİB UBL-TR değil). */
export const isIntlXml = (xml: string): boolean => {
    const id = xml.match(CUSTOMIZATION)?.[1] ?? '';
    return !!id && !/^TR\d/i.test(id);
};

/**
 * Belgenin (fatura objelerinin) dili: şablonun `lang` parametresi, yoksa
 * Avrupa belgesinde satıcı ülkesinin ilk belge dili; GİB belgeleri Türkçedir.
 */
export function documentLanguage(xslt: string, xml: string): DocLanguage {
    const param = xslt.match(LANG_PARAM)?.[1];
    if (isDocLanguage(param)) return param;
    if (!isIntlXml(xml)) return 'tr';
    const country = xml.match(SUPPLIER_COUNTRY)?.[1];
    return (country && findCountry(country)?.docLanguages[0]) || 'en';
}

type DocKey = `editor.doc.${keyof DocObjectTexts}`;

/** Belge dilinde metin; tasarıma eklenen obje içerikleri için. */
export const docT = (lang: DocLanguage) => {
    const pack = extraDocTextPack(lang);
    if (!pack) return (key: DocKey, vars?: Record<string, string | number>) => i18n.getFixedT(lang)(key, vars ?? {});
    return (key: DocKey, vars?: Record<string, string | number>) =>
        pack.objects[key.slice('editor.doc.'.length) as keyof DocObjectTexts]
            .replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(vars?.[k] ?? ''));
};
