/**
 * Grafik objesi: belge satırlarından (her kalem bir çubuk / dilim) ya da
 * kullanıcının tanımladığı satırlardan (etiket + alan / sabit sayı) üretilen
 * yatay çubuk, sütun ve halka grafikleri. Satır tablosunun içine konunca o
 * satırın toplam içindeki payını gösteren ince çubuk olur.
 *
 * Çıktı saf XSLT 1.0'dır: yerleşim tablo + yüzde / piksel genişliklerle
 * yapılır (eski görüntüleyiciler de çizer); halka SVG `stroke-dasharray` ile
 * çizilir (trigonometri gerekmez). Ayarlar `data-chart-*` attribute'larında.
 */
import {
    ensureDecimalFormat, fieldXPath, formatted, formulaExpression, isLineField, lineRootXPath, FORMULA_OPS,
    type CatalogField, type FormulaModel, type FormulaOp,
} from './fieldCatalog';
import type { DocLanguage } from '../international/registry/docLanguages';

export type ChartType = 'bar' | 'column' | 'donut';
export type ChartSource = 'lines' | 'rows';
export type ChartShow = 'value' | 'percent' | 'both' | 'none';
export type ChartPalette = 'ocean' | 'sunset' | 'forest' | 'brand' | 'mono';

/**
 * Elle tanımlanan satır: `value` katalog alanı (`field:<anahtar>`) ya da sabit sayı.
 * Alan değerine formül uygulanabilir: `op` ile `b` (sabit sayı ya da `field:<anahtar>`).
 */
export interface ChartRow { label: string; value: string; op?: FormulaOp; b?: string }

export interface ChartModel {
    type: ChartType;
    source: ChartSource;
    /** Satır kaynağında etiket ve değer alanlarının katalog anahtarları. */
    label: string;
    value: string;
    /** Değer alanına uygulanan formül (her satır için ayrı hesaplanır). */
    op: FormulaOp;
    b: string;
    rows: ChartRow[];
    title: string;
    palette: ChartPalette;
    show: ChartShow;
    decimals: number;
    /** Satır kaynağında büyükten küçüğe sırala (halka belge sırasıyla çizilir). */
    sort: boolean;
    limit: number;
    /** Satır içi pay çubuğu: kalınlık (px), zemin rengi, renk geçişinin iki ucu (boş = paletten). */
    height: number;
    track: string;
    c1: string;
    c2: string;
}

export const CHART_TYPES: ChartType[] = ['bar', 'column', 'donut'];
export const CHART_SOURCES: ChartSource[] = ['lines', 'rows'];
export const CHART_SHOWS: ChartShow[] = ['both', 'value', 'percent', 'none'];

export const CHART_PALETTES: Record<ChartPalette, string[]> = {
    ocean: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
    sunset: ['#f97316', '#ef4444', '#ec4899', '#f59e0b', '#a855f7', '#fb7185'],
    forest: ['#059669', '#22c55e', '#84cc16', '#14b8a6', '#0ea5e9', '#65a30d'],
    brand: ['#477d8c', '#f97316', '#8aa882', '#fbbf24', '#64748b', '#e11d48'],
    mono: ['#312e81', '#4338ca', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
};

export const DEFAULT_CHART: ChartModel = {
    type: 'bar', source: 'lines', label: '', value: '', op: 'none', b: '20', rows: [], title: '',
    palette: 'ocean', show: 'both', decimals: 2, sort: true, limit: 8,
    height: 6, track: '#eef2f7', c1: '', c2: '',
};

const MAX_LIMIT = 20;
export const BAR_HEIGHT_MIN = 2;
export const BAR_HEIGHT_MAX = 24;

/** Stil içine yazılacak renk: XSLT / HTML'i bozabilecek karakter içermemeli. */
const safeColor = (v: string | null) => {
    const s = (v ?? '').trim();
    return /^[#\w(),.% -]{0,48}$/.test(s) ? s : '';
};

/** Rengi beyaza doğru açar (degradenin açık ucu). */
function lighten(hex: string, amount = 0.38): string {
    const n = parseInt(hex.slice(1), 16);
    const mix = (c: number) => Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0');
    return `#${mix(n >> 16)}${mix((n >> 8) & 255)}${mix(n & 255)}`;
}

const oneOf = <T extends string>(v: string | null, list: readonly T[], fallback: T): T =>
    (v && (list as readonly string[]).includes(v) ? v : fallback) as T;
const OPS = FORMULA_OPS.map(o => o.id);

export function readChart(el: Element): ChartModel {
    const get = (n: string) => el.getAttribute(`data-chart-${n}`);
    let rows: ChartRow[] = [];
    try {
        const parsed = JSON.parse(get('rows') || '[]');
        if (Array.isArray(parsed)) {
            rows = parsed
                .filter(r => r && typeof r.label === 'string' && typeof r.value === 'string')
                .map(r => ({ label: r.label, value: r.value, op: oneOf(r.op ?? null, OPS, 'none'), b: typeof r.b === 'string' ? r.b : '20' }));
        }
    } catch { /* bozuk değer: boş liste */ }
    return {
        type: oneOf(get('type'), CHART_TYPES, DEFAULT_CHART.type),
        source: oneOf(get('source'), CHART_SOURCES, DEFAULT_CHART.source),
        label: get('label') ?? '',
        value: get('value') ?? '',
        op: oneOf(get('op'), OPS, DEFAULT_CHART.op),
        b: get('b') ?? DEFAULT_CHART.b,
        rows,
        title: get('title') ?? '',
        palette: oneOf(get('palette'), Object.keys(CHART_PALETTES) as ChartPalette[], DEFAULT_CHART.palette),
        show: oneOf(get('show'), CHART_SHOWS, DEFAULT_CHART.show),
        decimals: Math.min(4, Math.max(0, Number(get('decimals') ?? DEFAULT_CHART.decimals) || 0)),
        sort: get('sort') !== '0',
        limit: Math.min(MAX_LIMIT, Math.max(1, Number(get('limit') ?? DEFAULT_CHART.limit) || DEFAULT_CHART.limit)),
        height: Math.min(BAR_HEIGHT_MAX, Math.max(BAR_HEIGHT_MIN, Number(get('height') ?? DEFAULT_CHART.height) || DEFAULT_CHART.height)),
        track: get('track') === null ? DEFAULT_CHART.track : safeColor(get('track')),
        c1: safeColor(get('c1')),
        c2: safeColor(get('c2')),
    };
}

export const chartAttrs = (m: ChartModel): [string, string][] => [
    ['data-chart-type', m.type],
    ['data-chart-source', m.source],
    ['data-chart-label', m.label],
    ['data-chart-value', m.value],
    ['data-chart-op', m.op],
    ['data-chart-b', m.b],
    ['data-chart-rows', JSON.stringify(m.rows)],
    ['data-chart-title', m.title],
    ['data-chart-palette', m.palette],
    ['data-chart-show', m.show],
    ['data-chart-decimals', String(m.decimals)],
    ['data-chart-sort', m.sort ? '1' : '0'],
    ['data-chart-limit', String(m.limit)],
    ['data-chart-height', String(m.height)],
    ['data-chart-track', safeColor(m.track)],
    ['data-chart-c1', safeColor(m.c1)],
    ['data-chart-c2', safeColor(m.c2)],
];

const isNumeric = (f: CatalogField) => f.format === 'amount' || f.format === 'number';

/** Satır tutarı ve mal adı yolları: UBL, УПД, GST e-Invoice / e-Way Bill, 数电票. */
const LINE_AMOUNT_RE = /(?:LineExtensionAmount|СведТов\/@СтТовБезНДС|ItemList\/AssAmt|itemList\/taxableAmount|IssuItemInformation\/Amount)$/;
const LINE_NAME_RE = /(?:Item\/Name|СведТов\/@НаимТов|ItemList\/PrdDesc|itemList\/productName|IssuItemInformation\/ItemName)$/;

/** Yeni grafik: fatura satırlarının tutarları, etiket olarak mal / hizmet adı. */
export function defaultChart(catalog: CatalogField[]): ChartModel {
    const lineNums = catalog.filter(f => isLineField(f) && isNumeric(f));
    const value = lineNums.find(f => LINE_AMOUNT_RE.test(f.path)) ?? lineNums.find(f => f.format === 'amount') ?? lineNums[0];
    if (value) {
        const root = lineRootXPath(value);
        const texts = catalog.filter(f => isLineField(f) && !isNumeric(f) && lineRootXPath(f) === root);
        const label = texts.find(f => LINE_NAME_RE.test(f.path)) ?? texts[0];
        return { ...DEFAULT_CHART, value: value.key, label: label?.key ?? '', title: value.label };
    }
    const nums = catalog.filter(isNumeric).slice(0, 3);
    return { ...DEFAULT_CHART, source: 'rows', rows: nums.map(f => ({ label: f.label, value: `field:${f.key}` })) };
}

/** Pay çubuğu objesi: yalnız çubuk (yazısız), biraz kalın ve canlı renk geçişli. */
export const shareBarChart = (catalog: CatalogField[]): ChartModel =>
    ({ ...defaultChart(catalog), source: 'lines', show: 'none', height: 7, c1: '#22d3ee', c2: '#a3e635' });

const escapeText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s: string) => escapeText(s).replace(/"/g, '&quot;').replace(/\{/g, '{{').replace(/\}/g, '}}');
const numeric = (path: string) => `sum(${path}[number(.) = number(.)])`;

interface Ctx { m: ChartModel; lang: DocLanguage; vp: string; colors: string[]; lights: string[] }

const pct = (c: Ctx, expr: string) => {
    const v = `<xsl:value-of select="${formatted(expr, 1, c.lang)}"/>`;
    return c.lang === 'tr' ? `%${v}` : c.lang === 'en' ? `${v}%` : `${v}&#160;%`;
};
const num = (c: Ctx, expr: string) => `<xsl:value-of select="${formatted(expr, c.m.decimals, c.lang)}"/>`;

/** Değer / yüzde metni; yüzde toplam sıfırken yazılmaz. */
function valueText(c: Ctx, v: string, total: string): string {
    const share = `<xsl:if test="${total} &gt; 0">${pct(c, `${v} * 100 div ${total}`)}</xsl:if>`;
    switch (c.m.show) {
        case 'value': return num(c, v);
        case 'percent': return share;
        case 'both': return `${num(c, v)}<xsl:if test="${total} &gt; 0"><span style="color:#94a3b8;font-weight:600"> · ${pct(c, `${v} * 100 div ${total}`)}</span></xsl:if>`;
        default: return '';
    }
}

function header(c: Ctx, total: string): string {
    const showTotal = c.m.type !== 'donut' && (c.m.show === 'value' || c.m.show === 'both');
    if (!c.m.title && !showTotal) return '';
    return '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 12px 0"><tr>'
        + `<td style="font-size:11px;font-weight:700;letter-spacing:0.02em;color:#475569">${escapeText(c.m.title)}</td>`
        + (showTotal ? `<td style="text-align:right;font-size:13px;font-weight:800;color:#0f172a;white-space:nowrap">${num(c, total)}</td>` : '')
        + '</tr></table>';
}

/** Değerin en büyüğe oranı (yüzde / piksel); değer ya da en büyük sıfırsa 0. */
const scaled = (name: string, v: string, max: string, scale: string, min = '0') =>
    `<xsl:variable name="${name}"><xsl:choose><xsl:when test="${max} &gt; 0 and ${v} &gt; 0">`
    + `<xsl:value-of select="${min} + ${scale}"/></xsl:when><xsl:otherwise>${min}</xsl:otherwise></xsl:choose></xsl:variable>`;

const blank = '<xsl:text> </xsl:text>';

function barItem(c: Ctx, label: string, v: string, max: string, total: string, color: string, light: string, w: string): string {
    return scaled(w.slice(1), v, max, `round(${v} * 1000 div ${max}) div 10`)
        + '<div style="margin:0 0 10px 0">'
        + '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse"><tr>'
        + `<td style="padding:0 0 4px 0;font-size:11px;color:#334155">${label}</td>`
        + `<td style="padding:0 0 4px 8px;font-size:11px;font-weight:700;color:#0f172a;text-align:right;white-space:nowrap">${valueText(c, v, total)}</td>`
        + '</tr></table>'
        + '<div style="height:8px;background-color:#eef2f7;border-radius:99px;overflow:hidden;font-size:0;line-height:0">'
        + `<div style="height:8px;border-radius:99px;width:{${w}}%;background-color:${color};background-image:linear-gradient(90deg,${color},${light})">${blank}</div>`
        + '</div></div>';
}

function columnCell(c: Ctx, v: string, max: string, total: string, color: string, light: string, h: string): string {
    const text = valueText(c, v, total);
    return scaled(h.slice(1), v, max, `round(${v} * 108 div ${max})`, '2')
        + '<td style="vertical-align:bottom;text-align:center;padding:0 3px;border-bottom:1px solid #e2e8f0">'
        + (text ? `<div style="font-size:9px;font-weight:700;color:#0f172a;margin:0 0 4px 0;line-height:1.3">${text}</div>` : '')
        + `<div style="margin:0 auto;width:70%;max-width:44px;height:{${h}}px;border-radius:7px 7px 2px 2px;background-color:${color};background-image:linear-gradient(180deg,${light},${color});font-size:0;line-height:0">${blank}</div>`
        + '</td>';
}

const columnLabel = (label: string) =>
    '<td style="padding:6px 2px 0 2px;vertical-align:top">'
    + `<div style="font-size:9px;line-height:11px;max-height:22px;overflow:hidden;color:#64748b;text-align:center;word-wrap:break-word">${label}</div></td>`;

const R = '15.91549';
function donutSlice(v: string, total: string, before: string, color: string): string {
    return `<xsl:if test="${v} &gt; 0"><circle cx="21" cy="21" r="${R}" fill="none" stroke="${color}" stroke-width="6" `
        + `stroke-dasharray="{${v} * 100 div ${total}} {100 - ${v} * 100 div ${total}}" stroke-dashoffset="{25 - ${before} * 100 div ${total}}"/></xsl:if>`;
}

function donutFrame(c: Ctx, total: string, slices: string, legend: string): string {
    return '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse"><tr>'
        + '<td style="width:132px;vertical-align:middle;padding:0 14px 0 0">'
        + '<div style="position:relative;width:120px;height:120px">'
        + '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 42 42" style="display:block">'
        + `<circle cx="21" cy="21" r="${R}" fill="none" stroke="#eef2f7" stroke-width="6"/>`
        + `<xsl:if test="${total} &gt; 0">${slices}</xsl:if>`
        + '</svg>'
        + '<table cellpadding="0" cellspacing="0" style="position:absolute;left:0;top:0;width:120px;height:120px;border-collapse:collapse"><tr>'
        + `<td style="text-align:center;vertical-align:middle;font-size:11px;font-weight:800;color:#0f172a;line-height:1.2">${num(c, total)}</td>`
        + '</tr></table>'
        + '</div></td>'
        + `<td style="vertical-align:middle">${legend}</td>`
        + '</tr></table>';
}

function legendItem(c: Ctx, label: string, v: string, total: string, color: string): string {
    return '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 6px 0"><tr>'
        + `<td style="width:15px;vertical-align:middle"><div style="width:9px;height:9px;border-radius:3px;background-color:${color};font-size:0;line-height:0">${blank}</div></td>`
        + `<td style="font-size:11px;color:#334155;vertical-align:middle">${label}</td>`
        + `<td style="text-align:right;font-size:11px;font-weight:700;color:#0f172a;white-space:nowrap;padding:0 0 0 8px;vertical-align:middle">${valueText(c, v, total)}</td>`
        + '</tr></table>';
}

const more = (count: string, limit: number) =>
    `<xsl:if test="${count} &gt; ${limit}"><div style="font-size:10px;color:#94a3b8;margin:2px 0 0 0">+<xsl:value-of select="${count} - ${limit}"/></div></xsl:if>`;

const asFormula = (a: string, op: FormulaOp, b: string): FormulaModel => ({ a, op, b, decimals: 0, label: '', suffix: '' });

/** node-set uzantısıyla (exsl, yoksa msxsl) hesaplanan değişken; ikisi de yoksa 0. */
const nodeSetVar = (name: string, expr: (fn: string) => string) =>
    `<xsl:variable name="${name}"><xsl:choose>`
    + `<xsl:when test="function-available('exsl:node-set')"><xsl:value-of select="${expr('exsl:node-set')}"/></xsl:when>`
    + `<xsl:when test="function-available('msxsl:node-set')"><xsl:value-of select="${expr('msxsl:node-set')}"/></xsl:when>`
    + '<xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:variable>';

/** node-set kullanan içerik uzantı ad alanlarını kendi kabında tanımlar; şablonun kökü değişmez. */
const withNodeSet = (content: string) =>
    '<div xmlns:exsl="http://exslt.org/common" xmlns:msxsl="urn:schemas-microsoft-com:xslt" xsl:exclude-result-prefixes="exsl msxsl">'
    + `${content}</div>`;

interface LineSource {
    root: string;
    /** Satır bağlamında, formül uygulanmış satır değeri. */
    expr: string;
    /** Satır kümesinin toplamı; iki satır alanının çarpımı / bölümü gibi doğrusal olmayan formülde null. */
    sumOf: (nodes: string) => string | null;
}

function lineSource(m: ChartModel, catalog: CatalogField[]): LineSource | null {
    const fv = catalog.find(f => f.key === m.value);
    const root = fv ? lineRootXPath(fv) : null;
    if (!fv || !root) return null;
    const fb = m.op !== 'none' && m.b.startsWith('field:') ? catalog.find(f => f.key === m.b.slice(6)) : undefined;
    if (fb && isLineField(fb) && lineRootXPath(fb) !== root) return null;
    const fx = formulaExpression(asFormula(m.value, m.op, m.b), catalog, true);
    if (!fx) return null;
    const bRel = fb && isLineField(fb) ? fieldXPath(fb, true) : null;
    const B = fb ? `number(${fieldXPath(fb)})` : String(Number(m.b.replace(',', '.')));
    const aRel = fieldXPath(fv, true);
    const sumOf = (nodes: string): string | null => {
        const sa = numeric(`${nodes}/${aRel}`);
        const sb = bRel ? numeric(`${nodes}/${bRel}`) : '';
        switch (m.op) {
            case 'none': return sa;
            case 'add': return bRel ? `${sa} + ${sb}` : `${sa} + ${B} * count(${nodes})`;
            case 'sub': return bRel ? `${sa} - ${sb}` : `${sa} - ${B} * count(${nodes})`;
            case 'percent': return bRel ? null : `${sa} * ${B} div 100`;
            case 'mul': return bRel ? null : `${sa} * ${B}`;
            case 'div': return bRel ? null : `${sa} div ${B}`;
        }
    };
    return { root, expr: fx.expr, sumOf };
}

/** Toplam değişkeni (`<vp>t`); doğrusal olmayan formülde satır değerleri listesi (`<vp>l`) üzerinden. */
function lineTotal(vp: string, src: LineSource): { vars: string; list: boolean } {
    const linear = src.sumOf(src.root);
    if (linear !== null) return { vars: `<xsl:variable name="${vp}t" select="${linear}"/>`, list: false };
    return {
        vars: `<xsl:variable name="${vp}l"><xsl:for-each select="${src.root}"><v><xsl:value-of select="${src.expr}"/></v></xsl:for-each></xsl:variable>`
            + nodeSetVar(`${vp}t`, fn => `sum(${fn}($${vp}l)/*[number(.) = number(.)])`),
        list: true,
    };
}

/** Belge satırlarından: her satır (kalem) bir çubuk / sütun / dilim. */
function linesChart(c: Ctx, catalog: CatalogField[]): string | null {
    const src = lineSource(c.m, catalog);
    if (!src) return null;
    const { root, expr } = src;
    const fl = catalog.find(f => f.key === c.m.label);
    const label = fl && lineRootXPath(fl) === root
        ? `<xsl:value-of select="${fieldXPath(fl, true)}"/>`
        : '<xsl:value-of select="position()"/>.';
    const { vp, m } = c;
    const T = `$${vp}t`, M = `$${vp}m`, V = `$${vp}v`;
    const color = `{substring('${c.colors.join('')}', ((position() - 1) mod ${c.colors.length}) * 7 + 1, 7)}`;
    const light = `{substring('${c.lights.join('')}', ((position() - 1) mod ${c.lights.length}) * 7 + 1, 7)}`;
    const sort = m.sort && m.type !== 'donut' ? `<xsl:sort select="${expr}" data-type="number" order="descending"/>` : '';
    const each = (body: string) => `<xsl:for-each select="${root}">${sort}<xsl:if test="position() &lt;= ${m.limit}">`
        + `<xsl:variable name="${vp}v" select="${expr}"/>${body}</xsl:if></xsl:for-each>`;
    const total = lineTotal(vp, src);
    const vars = total.vars
        + `<xsl:variable name="${vp}m"><xsl:for-each select="${root}"><xsl:sort select="${expr}" data-type="number" order="descending"/>`
        + `<xsl:if test="position() = 1"><xsl:value-of select="${expr}"/></xsl:if></xsl:for-each></xsl:variable>`;
    const rest = more(`count(${root})`, m.limit);

    let out: string;
    if (m.type === 'bar') out = vars + header(c, T) + each(barItem(c, label, V, M, T, color, light, `$${vp}w`)) + rest;
    else if (m.type === 'column') {
        out = vars + header(c, T)
            + '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;table-layout:fixed">'
            + `<tr>${each(columnCell(c, V, M, T, color, light, `$${vp}h`))}</tr>`
            + `<tr>${each(columnLabel(label))}</tr></table>` + rest;
    } else {
        const step = root.split('/').pop() ?? '*';
        const before = total.list
            ? `<xsl:variable name="${vp}i" select="position()"/>`
                + nodeSetVar(`${vp}b`, fn => `sum(${fn}($${vp}l)/*[position() &lt; $${vp}i][number(.) = number(.)])`)
            : `<xsl:variable name="${vp}b" select="${src.sumOf(`preceding-sibling::${step}`)}"/>`;
        const slices = each(before + donutSlice(V, T, `$${vp}b`, color));
        out = vars + header(c, T) + donutFrame(c, T, slices, each(legendItem(c, label, V, T, color)) + rest);
    }
    return total.list ? withNodeSet(out) : out;
}

/** Elle tanımlanan satırlardan (her satır bir alan ya da sabit sayı). */
function rowsChart(c: Ctx, catalog: CatalogField[]): string | null {
    const rows = c.m.rows.map(r => {
        if (r.value.startsWith('field:')) {
            const fx = formulaExpression(asFormula(r.value.slice(6), r.op ?? 'none', r.b ?? ''), catalog, false);
            return fx ? { label: r.label, expr: fx.expr, field: true } : null;
        }
        const n = Number(r.value.replace(',', '.'));
        return Number.isFinite(n) ? { label: r.label, expr: String(n), field: false } : null;
    }).filter((r): r is { label: string; expr: string; field: boolean } => !!r);
    if (!rows.length) return null;
    const { vp, m } = c;
    const v = (i: number) => `$${vp}r${i}`;
    // Belgede olmayan alan 0 sayılır (toplam NaN olmasın).
    let vars = rows.map((r, i) => (r.field
        ? `<xsl:variable name="${vp}r${i}"><xsl:choose><xsl:when test="number(${r.expr}) = number(${r.expr})"><xsl:value-of select="${r.expr}"/></xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:variable>`
        : `<xsl:variable name="${vp}r${i}" select="${r.expr}"/>`)).join('');
    vars += `<xsl:variable name="${vp}t" select="${rows.map((_, i) => v(i)).join(' + ')}"/>`;
    vars += `<xsl:variable name="${vp}m0" select="${v(0)}"/>`;
    for (let i = 1; i < rows.length; i++) {
        const p = `$${vp}m${i - 1}`;
        vars += `<xsl:variable name="${vp}m${i}" select="${p} * number(${p} &gt;= ${v(i)}) + ${v(i)} * number(${p} &lt; ${v(i)})"/>`;
    }
    const T = `$${vp}t`, M = `$${vp}m${rows.length - 1}`;
    const col = (i: number) => c.colors[i % c.colors.length];
    const lig = (i: number) => c.lights[i % c.lights.length];
    const label = (i: number) => escapeText(rows[i].label);

    if (m.type === 'bar') return vars + header(c, T) + rows.map((_, i) => barItem(c, label(i), v(i), M, T, col(i), lig(i), `$${vp}w${i}`)).join('');
    if (m.type === 'column') {
        return vars + header(c, T)
            + '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;table-layout:fixed">'
            + `<tr>${rows.map((_, i) => columnCell(c, v(i), M, T, col(i), lig(i), `$${vp}h${i}`)).join('')}</tr>`
            + `<tr>${rows.map((_, i) => columnLabel(label(i))).join('')}</tr></table>`;
    }
    const before = (i: number) => (i === 0 ? '0' : `(${rows.slice(0, i).map((_, j) => v(j)).join(' + ')})`);
    const slices = rows.map((_, i) => donutSlice(v(i), T, before(i), col(i))).join('');
    return vars + header(c, T) + donutFrame(c, T, slices, rows.map((_, i) => legendItem(c, label(i), v(i), T, col(i))).join(''));
}

/** Satır tablosunun içinde: bu satırın değerinin tüm satırların toplamındaki payı. */
function inlineChart(c: Ctx, catalog: CatalogField[]): string | null {
    const src = lineSource(c.m, catalog);
    if (!src) return null;
    const { vp } = c;
    const T = `$${vp}t`, V = `$${vp}v`;
    const text = valueText(c, V, T);
    const total = lineTotal(vp, src);
    const h = c.m.height;
    const track = safeColor(c.m.track) || 'transparent';
    const from = safeColor(c.m.c1) || c.colors[0];
    const to = safeColor(c.m.c2) || (safeColor(c.m.c1) ? from : c.lights[0]);
    const out = total.vars
        + `<xsl:variable name="${vp}v" select="${src.expr}"/>`
        + scaled(`${vp}w`, V, T, `round(${V} * 1000 div ${T}) div 10`)
        + `<div style="height:${h}px;background-color:${track};border-radius:99px;overflow:hidden;font-size:0;line-height:0;margin:3px 0 2px 0">`
        + `<div style="height:${h}px;border-radius:99px;width:{$${vp}w}%;background-color:${from};background-image:linear-gradient(90deg,${from},${to})">${blank}</div>`
        + '</div>'
        + (text ? `<div style="font-size:9px;color:#64748b;white-space:nowrap">${text}</div>` : '');
    return total.list ? withNodeSet(out) : out;
}

/** Grafik objesinin XSLT içeriği; veri alanı bulunamazsa null. */
export function chartContent(id: string, m: ChartModel, catalog: CatalogField[], inLine: boolean, lang: DocLanguage = 'tr'): string | null {
    const colors = CHART_PALETTES[m.palette];
    const c: Ctx = { m, lang, vp: `edc${id.replace(/\W/g, '')}_`, colors, lights: colors.map(x => lighten(x)) };
    if (inLine) return inlineChart(c, catalog);
    return m.source === 'rows' ? rowsChart(c, catalog) : linesChart(c, catalog);
}

export const CHART_BOX_STYLE = 'box-sizing:border-box;width:100%;max-width:560px;margin:10px 0;padding:14px 16px;'
    + 'border:1px solid #e7ebf2;border-radius:14px;background-color:#ffffff;page-break-inside:avoid';
export const CHART_INLINE_STYLE = 'min-width:70px';

export function chartSnippet(id: string, m: ChartModel, catalog: CatalogField[], inLine: boolean, lang: DocLanguage = 'tr'): string {
    const attrs = chartAttrs(m).map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join('');
    return `<div data-xslt-obj="${id}" data-obj-kind="chart"${attrs} style="${inLine ? CHART_INLINE_STYLE : CHART_BOX_STYLE}">`
        + `${chartContent(id, m, catalog, inLine, lang) ?? ''}</div>`;
}

/**
 * Grafiği örnek XML ile tarayıcıda çizer (panel önizlemesi ve anında
 * güncelleme için). Satır içi grafik ilk satırın bağlamında çizilir.
 */
export function renderChartHtml(id: string, m: ChartModel, catalog: CatalogField[], inLine: boolean, xmlDoc: Document | null, lang: DocLanguage = 'tr'): string {
    const content = chartContent(id, m, catalog, inLine, lang);
    if (!content || !xmlDoc || typeof XSLTProcessor === 'undefined') return '';
    const fv = catalog.find(f => f.key === m.value);
    const root = inLine && fv ? lineRootXPath(fv) : null;
    const body = root ? `<xsl:for-each select="${root}[1]">${content}</xsl:for-each>` : content;
    const xsl = ensureDecimalFormat('<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">'
        + `<xsl:output method="html"/><xsl:template match="/"><div>${body}</div></xsl:template></xsl:stylesheet>`);
    try {
        const proc = new XSLTProcessor();
        const sheet = new DOMParser().parseFromString(xsl, 'application/xml');
        if (sheet.getElementsByTagName('parsererror').length) return '';
        proc.importStylesheet(sheet);
        const frag = proc.transformToFragment(xmlDoc, document);
        const box = document.createElement('div');
        box.appendChild(frag);
        return (box.firstElementChild as HTMLElement | null)?.innerHTML ?? '';
    } catch {
        return '';
    }
}
