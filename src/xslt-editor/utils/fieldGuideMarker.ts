/** İndirilen XSLT'deki veri alanı rehberi yorumunun sınırları. */
export const GUIDE_BEGIN = 'EDESIGN-FIELD-GUIDE-BEGIN';
export const GUIDE_END = 'EDESIGN-FIELD-GUIDE-END';
const GUIDE_RE = new RegExp(`<!--\\s*${GUIDE_BEGIN}[\\s\\S]*?${GUIDE_END}\\s*-->\\r?\\n?`, 'g');

export const stripFieldGuide = (xslt: string) => xslt.replace(GUIDE_RE, '');
