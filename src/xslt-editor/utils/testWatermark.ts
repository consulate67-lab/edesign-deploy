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

const css = (rules: string[]) => rules.join(';');

// Ortalama tabloyla yapılır: e-belge görüntüleyicilerinin eski IE motorları
// (çoğu IE7 modunda) transform, flex, rgba ve min() bilmez; tablo hücresinin
// ortalaması her motorda çalışır. Dönüş: transform, bilmeyen IE'de Matrix
// filtresi. position:fixed bilmeyen motor absolute'ta kalır. Boyut sayfaya göre
// ölçeklenir (min(26vw,36vh): dönmüş yazı sayfanın ~%85'i). Şablon CSS'i
// (td kenarlık/arka plan, span stilleri) filigranı bozmasın diye !important.
// Sol padding son harften sonraki letter-spacing'i dengeler.
const IMP = (rule: string) => `${rule}!important`;
const ROTATE = 'rotate(-30deg)';
const IE_ROTATE = "progid:DXImageTransform.Microsoft.Matrix(M11=0.866,M12=0.5,M21=-0.5,M22=0.866,SizingMethod='auto expand')";
const BOX_RESET = [
    'margin:0', 'padding:0', 'border:0', 'background:transparent', 'box-shadow:none', 'float:none',
    'min-width:0', 'max-width:none', 'min-height:0', 'max-height:none', 'opacity:1', 'transform:none',
].map(IMP);
const styled = (tag: string, rules: string[], inner: string) =>
    `<xsl:element name="${tag}"><xsl:attribute name="style">${css(rules)}</xsl:attribute>${inner}</xsl:element>`;

const buildTableWatermark = () => styled('div', [
    'position:absolute', IMP('position:fixed'), IMP('left:0'), IMP('top:0'), IMP('right:auto'), IMP('bottom:auto'),
    IMP('width:100%'), IMP('height:100%'), IMP('display:block'),
    IMP('z-index:2147483647'), IMP('overflow:hidden'), IMP('pointer-events:none'), ...BOX_RESET,
], styled('table', [
    IMP('display:table'), IMP('width:100%'), IMP('height:100%'), IMP('border-collapse:collapse'), IMP('table-layout:auto'), ...BOX_RESET,
], styled('tbody', [IMP('display:table-row-group'), ...BOX_RESET],
    styled('tr', [IMP('display:table-row'), IMP('height:100%'), ...BOX_RESET],
        styled('td', [
            IMP('display:table-cell'), IMP('width:100%'), IMP('height:100%'), IMP('font-size:0'), IMP('line-height:0'),
            IMP('text-align:center'), IMP('vertical-align:middle'), ...BOX_RESET,
        ], styled('span', [
            IMP('display:inline-block'), IMP('zoom:1'), IMP('vertical-align:middle'), `filter:${IE_ROTATE}`,
            IMP(`-webkit-transform:${ROTATE}`), IMP(`-ms-transform:${ROTATE}`), IMP(`transform:${ROTATE}`),
            IMP('font-family:Arial,Helvetica,sans-serif'), IMP('font-size:200px'), IMP('font-size:24vw'), IMP('font-size:min(26vw,36vh)'),
            IMP('font-style:normal'), IMP('font-weight:900'), IMP('line-height:1'), IMP('letter-spacing:0.1em'), IMP('padding:0 0 0 0.1em'),
            IMP('margin:0'), IMP('border:0'), IMP('background:transparent'), IMP('text-transform:none'), IMP('text-shadow:none'),
            IMP('color:#f2a7a7'), IMP('color:rgba(220,38,38,0.36)'),
            IMP('white-space:nowrap'), IMP('user-select:none'), IMP('-webkit-user-select:none'), IMP('-ms-user-select:none'),
            IMP('-webkit-print-color-adjust:exact'), IMP('print-color-adjust:exact'),
        ], `<xsl:value-of select="concat('TE','ST')"/>`))))));

const WATERMARK = buildTableWatermark();

const PREV_ROTATE = 'translate(-50%,-50%) rotate(-30deg)';

/** Önceki sürümlerin filigranları: eski TEST dosyaları da tanınıp temizlenir. */
const LEGACY_WATERMARKS = [
    buildWatermark(
        [
            'position:fixed', 'left:0', 'top:0', 'width:100%', 'height:100%',
            'pointer-events:none', 'z-index:2147483647', 'overflow:hidden', 'margin:0', 'padding:0',
        ].join(';'),
        [
            'position:absolute', 'left:50%', 'top:50%',
            `-webkit-transform:${PREV_ROTATE}`, `-ms-transform:${PREV_ROTATE}`, `transform:${PREV_ROTATE}`,
            'font-family:Arial,Helvetica,sans-serif', 'font-size:200px', 'font-size:min(26vw,36vh)',
            'font-weight:900', 'line-height:1', 'letter-spacing:0.1em', 'padding-left:0.1em',
            'color:#dc2626', 'color:rgba(220,38,38,0.28)',
            'white-space:nowrap', 'user-select:none', '-webkit-user-select:none', '-ms-user-select:none',
            '-webkit-print-color-adjust:exact', 'print-color-adjust:exact',
        ].join(';'),
    ),
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
