/**
 * Onaylanmamış (ücretsiz) indirmelere eklenen TEST filigranı. Filigran XSLT
 * çıktısına sabit konumlu, sayfa ortasında büyük bir yazı olarak eklenir;
 * yazdırmada her sayfada tekrar eder. Düz bir <div> yerine xsl:element ile
 * üretilir ki dosyada kolayca aranıp silinmesin. Editöre geri yüklenen test
 * dosyasından tam eşleşmeyle çıkarılır.
 */

const buildWatermark = (overlayStyle: string, textStyle: string) =>
    `<xsl:element name="div"><xsl:attribute name="style">${overlayStyle}</xsl:attribute>`
    + `<xsl:element name="span"><xsl:attribute name="style">${textStyle}</xsl:attribute>`
    + `<xsl:value-of select="concat('TE','ST')"/></xsl:element></xsl:element>`;

// Ortalama flex yerine left/top %50 + translate ile yapılır: e-belge
// görüntüleyicilerinin eski IE motorları flex ve min() bilmez. Boyut sayfaya
// göre ölçeklenir (min(26vw,36vh): dönmüş yazı sayfanın ~%85'i); bilmeyen
// motorlar 200px'te kalır. padding-left, son harften sonraki letter-spacing'i
// dengeler; yazı tam ortalanır.
const ROTATE = 'translate(-50%,-50%) rotate(-30deg)';
const WATERMARK = buildWatermark(
    [
        'position:fixed', 'left:0', 'top:0', 'width:100%', 'height:100%',
        'pointer-events:none', 'z-index:2147483647', 'overflow:hidden', 'margin:0', 'padding:0',
    ].join(';'),
    [
        'position:absolute', 'left:50%', 'top:50%',
        `-webkit-transform:${ROTATE}`, `-ms-transform:${ROTATE}`, `transform:${ROTATE}`,
        'font-family:Arial,Helvetica,sans-serif', 'font-size:200px', 'font-size:min(26vw,36vh)',
        'font-weight:900', 'line-height:1', 'letter-spacing:0.1em', 'padding-left:0.1em',
        'color:#dc2626', 'color:rgba(220,38,38,0.28)',
        'white-space:nowrap', 'user-select:none', '-webkit-user-select:none', '-ms-user-select:none',
        '-webkit-print-color-adjust:exact', 'print-color-adjust:exact',
    ].join(';'),
);

/** Önceki sürümlerin filigranları: eski TEST dosyaları da tanınıp temizlenir. */
const LEGACY_WATERMARKS = [
    buildWatermark(
        [
            'position:fixed', 'left:0', 'top:0', 'width:100%', 'height:100%',
            'display:flex', 'align-items:center', 'justify-content:center',
            'pointer-events:none', 'z-index:2147483647', 'overflow:hidden',
        ].join(';'),
        [
            'font-family:Arial,Helvetica,sans-serif', 'font-size:240px', 'font-weight:900',
            'letter-spacing:24px', 'color:rgba(220,38,38,0.28)', 'transform:rotate(-30deg)',
            'white-space:nowrap', 'user-select:none',
            '-webkit-print-color-adjust:exact', 'print-color-adjust:exact',
        ].join(';'),
    ),
];
const ALL_WATERMARKS = [WATERMARK, ...LEGACY_WATERMARKS];

const BODY_OPEN_RE = /<body\b(?:[^>"']|"[^"]*"|'[^']*')*>/i;
const ROOT_TEMPLATE_RE = /<xsl:template\b(?:[^>"']|"[^"]*"|'[^']*')*\bmatch\s*=\s*(["'])\/\1(?:[^>"']|"[^"]*"|'[^']*')*>/;

/**
 * Baştaki BOM ve UTF-8 BOM'un Latin-1 okunmuş hali ("ï»¿"). Dosyaya yazılırsa
 * <?xml bildirimi ilk karakter olmaz ve XSLT başka sistemlerde açılmaz.
 */
export const stripLeadingBom = (xslt: string) => xslt.replace(/^(?:\uFEFF|\u00EF\u00BB\u00BF)+/, '');

export const hasTestWatermark = (xslt: string | null | undefined) => !!xslt && ALL_WATERMARKS.some(w => xslt.includes(w));

export const stripTestWatermark = (xslt: string) => ALL_WATERMARKS.reduce((s, w) => s.split(w).join(''), xslt);

/** Filigranlı kopya; filigranın konacağı yer (<body> ya da kök template) yoksa null. */
export function addTestWatermark(xslt: string): string | null {
    const clean = stripTestWatermark(xslt);
    const m = clean.match(BODY_OPEN_RE) ?? clean.match(ROOT_TEMPLATE_RE);
    if (m?.index === undefined) return null;
    const at = m.index + m[0].length;
    return clean.slice(0, at) + WATERMARK + clean.slice(at);
}
