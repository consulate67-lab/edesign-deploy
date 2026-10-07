/**
 * Onaylanmamış (ücretsiz) indirmelere eklenen TEST filigranı. Filigran XSLT
 * çıktısına sabit konumlu, sayfa ortasında büyük bir yazı olarak eklenir;
 * yazdırmada her sayfada tekrar eder. Düz bir <div> yerine xsl:element ile
 * üretilir ki dosyada kolayca aranıp silinmesin. Editöre geri yüklenen test
 * dosyasından tam eşleşmeyle çıkarılır.
 */

const OVERLAY_STYLE = [
    'position:fixed', 'left:0', 'top:0', 'width:100%', 'height:100%',
    'display:flex', 'align-items:center', 'justify-content:center',
    'pointer-events:none', 'z-index:2147483647', 'overflow:hidden',
].join(';');

const TEXT_STYLE = [
    'font-family:Arial,Helvetica,sans-serif', 'font-size:240px', 'font-weight:900',
    'letter-spacing:24px', 'color:rgba(220,38,38,0.28)', 'transform:rotate(-30deg)',
    'white-space:nowrap', 'user-select:none',
    '-webkit-print-color-adjust:exact', 'print-color-adjust:exact',
].join(';');

const WATERMARK =
    `<xsl:element name="div"><xsl:attribute name="style">${OVERLAY_STYLE}</xsl:attribute>`
    + `<xsl:element name="span"><xsl:attribute name="style">${TEXT_STYLE}</xsl:attribute>`
    + `<xsl:value-of select="concat('TE','ST')"/></xsl:element></xsl:element>`;

const BODY_OPEN_RE = /<body\b(?:[^>"']|"[^"]*"|'[^']*')*>/i;
const ROOT_TEMPLATE_RE = /<xsl:template\b(?:[^>"']|"[^"]*"|'[^']*')*\bmatch\s*=\s*(["'])\/\1(?:[^>"']|"[^"]*"|'[^']*')*>/;

/**
 * Baştaki BOM ve UTF-8 BOM'un Latin-1 okunmuş hali ("ï»¿"). Dosyaya yazılırsa
 * <?xml bildirimi ilk karakter olmaz ve XSLT başka sistemlerde açılmaz.
 */
export const stripLeadingBom = (xslt: string) => xslt.replace(/^(?:\uFEFF|\u00EF\u00BB\u00BF)+/, '');

export const hasTestWatermark = (xslt: string | null | undefined) => !!xslt && xslt.includes(WATERMARK);

export const stripTestWatermark = (xslt: string) => xslt.split(WATERMARK).join('');

/** Filigranlı kopya; filigranın konacağı yer (<body> ya da kök template) yoksa null. */
export function addTestWatermark(xslt: string): string | null {
    const clean = stripTestWatermark(xslt);
    const m = clean.match(BODY_OPEN_RE) ?? clean.match(ROOT_TEMPLATE_RE);
    if (m?.index === undefined) return null;
    const at = m.index + m[0].length;
    return clean.slice(0, at) + WATERMARK + clean.slice(at);
}
