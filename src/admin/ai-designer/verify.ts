/**
 * Doğrulama matrisi: her belge tipi × 5 stil × parametre kombinasyonları × varyasyonlar.
 * Tarayıcıda çalışır (XSLTProcessor gerekir):
 *   const m = await import('/edesign-deploy/src/admin/ai-designer/verify.ts'); await m.runMatrix();
 */
import { WIZARD_DOC_TYPES, loadSampleXml, type WizardDocType } from '../../wizard/docTypes';
import { validateXslt } from '../../wizard/validate';
import { generateDesign } from './generator';
import { customizeSampleXml, isTransformError, renderHtml } from './preview';
import { RECEIPT_PAPER_DOCS, defaultParams, sectionsFor } from './questions';
import type { DesignParams, StyleId } from './types';

const STYLES: StyleId[] = ['klasik', 'modern', 'kurumsal', 'minimal', 'kompakt'];
const LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const TRICKY = 'Ağ & Yol <Test> "çift" \'tek\' {Süslü} ]]> -- son';

export interface MatrixFailure { docType: string; combo: string; style: StyleId; variant: number; problems: string[] }
export interface MatrixResult {
    total: number;
    passed: number;
    errors: number;
    warnings: number;
    failures: MatrixFailure[];
    byDocType: Record<string, { total: number; passed: number; warnings: number }>;
    ms: number;
}

function combos(dt: WizardDocType): [string, Partial<DesignParams>][] {
    const all = Object.fromEntries(sectionsFor(dt.id).map(s => [s.id, true]));
    const none = Object.fromEntries(sectionsFor(dt.id).map(s => [s.id, false]));
    const texts = { slogan: TRICKY, headerNote: TRICKY, footer: `${TRICKY}\nİkinci satır`, thanks: TRICKY, returnPolicy: TRICKY, contact: TRICKY, legal: TRICKY };
    const banks = [
        { bank: 'Ziraat Bankası', branch: 'Kadıköy {1}', holder: TRICKY, iban: 'TR33 0006 1005 1978 6457 8413 26', currency: 'TRY' },
        { bank: 'Garanti BBVA', branch: '', holder: 'Örnek A.Ş.', iban: 'TR32 0010 0099 9999 9999 9999 99', currency: 'EUR' },
    ];
    const list: [string, Partial<DesignParams>][] = [
        ['yalın', { logo: null, banks: [], sections: none, texts: {}, companyName: '' }],
        ['tam', { logo: LOGO, banks, sections: all, texts, companyName: TRICKY, profession: TRICKY, logoPosition: 'sol', qrPosition: 'sag-ust', bankPosition: 'alt', colorMode: 'dengeli' }],
        ['tam-sağ', { logo: LOGO, banks, sections: all, texts, logoPosition: 'sag', qrPosition: 'sol-ust', bankPosition: 'yan', colorMode: 'canli', logoSize: 'buyuk', font: 'georgia' }],
        ['tam-orta', { logo: null, banks, sections: all, texts, logoPosition: 'orta', qrPosition: 'alt', bankPosition: 'alt', colorMode: 'sade', fontScale: 'buyuk', accent: '#fde047' }],
    ];
    if (RECEIPT_PAPER_DOCS.includes(dt.id)) {
        list.push(['fiş-tam', { paper: 'fis80', logo: LOGO, banks, sections: all, texts }]);
        list.push(['fiş-yalın', { paper: 'fis80', logo: null, banks: [], sections: none, texts: {} }]);
    }
    return list;
}

export async function runMatrix(opts: { variants?: number[]; docTypes?: string[] } = {}): Promise<MatrixResult> {
    const started = performance.now();
    const variants = opts.variants ?? [0, 1, 2, 4];
    const res: MatrixResult = { total: 0, passed: 0, errors: 0, warnings: 0, failures: [], byDocType: {}, ms: 0 };
    for (const dt of WIZARD_DOC_TYPES.filter(d => !opts.docTypes || opts.docTypes.includes(d.id))) {
        const xml = await loadSampleXml(dt);
        const stat = { total: 0, passed: 0, warnings: 0 };
        for (const [comboName, patch] of combos(dt)) {
            for (const style of STYLES) {
                for (const variant of variants) {
                    const params: DesignParams = { ...defaultParams(dt.id, 'turizm', 'turizm'), ...patch, style, variant };
                    const problems: string[] = [];
                    let warn = 0;
                    try {
                        const g = generateDesign(params, dt);
                        const v = validateXslt(g.xslt, dt, xml);
                        for (const c of v.checks) {
                            if (c.level === 'error') problems.push(`HATA: ${c.text}`);
                            if (c.level === 'warn') { warn++; problems.push(`UYARI: ${c.text}`); }
                        }
                        const html = renderHtml(customizeSampleXml(xml, params, dt), g.xslt);
                        if (isTransformError(html) || !/<html/i.test(html)) problems.push('Dönüşüm başarısız');
                        if (params.texts.thanks && !html.includes('{Süslü}')) problems.push('Özel metin çıktıda yok');
                        if (!g.name || !g.description || !g.tags.length) problems.push('Ad / açıklama / etiket eksik');
                    } catch (e) {
                        problems.push(`İstisna: ${e instanceof Error ? e.message : String(e)}`);
                    }
                    res.total++;
                    stat.total++;
                    res.warnings += warn;
                    stat.warnings += warn;
                    const hasError = problems.some(p => !p.startsWith('UYARI'));
                    if (hasError) res.errors++;
                    if (!problems.length) {
                        res.passed++;
                        stat.passed++;
                    } else if (res.failures.length < 40) {
                        res.failures.push({ docType: dt.id, combo: comboName, style, variant, problems });
                    }
                }
            }
        }
        res.byDocType[dt.id] = stat;
    }
    res.ms = Math.round(performance.now() - started);
    return res;
}
