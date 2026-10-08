/**
 * XPath ifadelerinden konum yollarını ve kısa XML alan adlarını çıkarır.
 * Tasarım listesinde / özellik panelinde verinin XML'deki adını göstermek için.
 */

const OPERATORS = new Set(['and', 'or', 'div', 'mod']);
const NODE_TESTS = new Set(['text()', 'node()', 'comment()']);
const TOKEN_CHAR = /[\w$@./*:-]/;

/** Köşeli parantezli koşulları (iç içe ve tırnaklı olanlar dahil) siler. */
export function stripPredicates(path: string): string {
    let out = '';
    let depth = 0;
    for (let i = 0; i < path.length; i++) {
        const c = path[i];
        if (depth > 0 && (c === '"' || c === "'")) {
            const j = path.indexOf(c, i + 1);
            i = j < 0 ? path.length : j;
            continue;
        }
        if (c === '[') depth++;
        else if (c === ']') depth = Math.max(0, depth - 1);
        else if (depth === 0) out += c;
    }
    return out;
}

/**
 * İfadedeki konum yolları (`cac:X/cbc:Y[@a='b']`, `$f/cbc:ID`, `.`); fonksiyon
 * adları, işleçler, sayılar ve metin sabitleri atlanır.
 */
export function xpathPaths(expr: string): string[] {
    const out: string[] = [];
    const n = expr.length;
    let i = 0;
    while (i < n) {
        const c = expr[i];
        if (c === '"' || c === "'") {
            const j = expr.indexOf(c, i + 1);
            i = j < 0 ? n : j + 1;
            continue;
        }
        if (!TOKEN_CHAR.test(c) || (c === '-' && !/\w/.test(expr[i + 1] ?? ''))) { i++; continue; }
        let j = i;
        let depth = 0;
        while (j < n) {
            const d = expr[j];
            if (depth > 0) {
                if (d === '"' || d === "'") {
                    const k = expr.indexOf(d, j + 1);
                    j = k < 0 ? n : k + 1;
                    continue;
                }
                if (d === '[') depth++;
                else if (d === ']') depth--;
                j++;
                continue;
            }
            if (d === '[') { depth++; j++; continue; }
            if (TOKEN_CHAR.test(d)) { j++; continue; }
            if (d === '(' && expr[j + 1] === ')' && /(^|\/)(text|node|comment)$/.test(expr.slice(i, j))) { j += 2; continue; }
            break;
        }
        const token = expr.slice(i, j).replace(/\/+$/, '');
        i = j;
        let k = j;
        while (k < n && /\s/.test(expr[k])) k++;
        if (expr[k] === '(') continue;
        if (!token || OPERATORS.has(token) || /^[\d.]+$/.test(token) && token !== '.' || !/[A-Za-z_.$@*]/.test(token)) continue;
        if (!out.includes(token)) out.push(token);
    }
    return out;
}

/**
 * Yolun kısa XML adı: son iki eleman (önekleri atılmış) ve varsa öznitelik,
 * ör. `PartyIdentification/ID/@schemeID`. Göreli yollar `context` ile çözülür.
 */
export function xmlFieldName(path: string, context = ''): string {
    const norm = (s: string) => stripPredicates(s.replace(/\*\[local-name\(\)\s*=\s*['"]([\w.-]+)['"]\]/g, '$1'))
        .replace(/^\$[\w.-]+/, '')
        .replace(/[\w-]+::/g, '');
    const p = norm(path);
    const steps: string[] = [];
    const push = (raw: string) => {
        const s = raw.trim();
        if (!s || s === '.' || NODE_TESTS.has(s)) return;
        if (s === '..') { steps.pop(); return; }
        steps.push(s.startsWith('@') ? s : s.replace(/^[\w.-]+:/, ''));
    };
    if (!p.trim().startsWith('/') && context) norm(context).split('/').forEach(push);
    p.split('/').forEach(push);
    const attr = steps.length && steps[steps.length - 1].startsWith('@') ? steps.pop()! : null;
    const name = [...steps.slice(-2), ...(attr ? [attr] : [])].join('/');
    return name || path.trim();
}

export interface XsltVariable { name: string; select: string; offset: number; withParam: boolean }

/** `select`'li xsl:variable / xsl:param / xsl:with-param tanımları (kaynak sırasıyla). */
export function xsltVariables(xslt: string): XsltVariable[] {
    const out: XsltVariable[] = [];
    for (const m of xslt.matchAll(/<xsl:(variable|param|with-param)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g)) {
        const attrs = m[2];
        const name = attrs.match(/\sname\s*=\s*(["'])([\s\S]*?)\1/)?.[2];
        const select = attrs.match(/\sselect\s*=\s*(["'])([\s\S]*?)\1/)?.[2];
        if (name && select) {
            out.push({ name, select: select.replace(/&apos;/g, "'").replace(/&quot;/g, '"'), offset: m.index ?? 0, withParam: m[1] === 'with-param' });
        }
    }
    return out;
}

/**
 * Konumda geçerli tanım: önce kendinden önceki en yakın variable / param;
 * yoksa (isimli şablon parametresi) tüm çağrılarda aynı değeri veren with-param.
 */
function variableAt(vars: XsltVariable[], name: string, offset: number): XsltVariable | null {
    const own = vars.filter(v => v.name === name && !v.withParam);
    const before = own.filter(v => v.offset < offset).pop();
    if (before) return before;
    const calls = vars.filter(v => v.name === name && v.withParam);
    if (calls.length && calls.every(v => v.select === calls[0].select)) return calls[0];
    return own[0] ?? null;
}

/**
 * `$değişken/...` ile başlayan yolu değişkenin (basit yol olan) select'iyle
 * açar. Değişken göreli ise kendi tanımındaki bağlam da döner.
 */
export function resolveVariablePath(
    path: string,
    offset: number,
    vars: XsltVariable[],
    contextOf: (offset: number) => string,
): { path: string; context: string | null } {
    let current = path;
    let context: string | null = null;
    for (let depth = 0; depth < 4; depth++) {
        const m = current.match(/^\$([\w.-]+)([\s\S]*)$/);
        if (!m) break;
        const def = variableAt(vars, m[1], offset);
        if (!def) break;
        const inner = xpathPaths(def.select);
        if (inner.length !== 1 || /\(/.test(def.select.replace(/(?:text|node|comment)\(\)/g, ''))) break;
        current = `${inner[0]}${m[2]}`;
        context = inner[0].startsWith('/') || inner[0].startsWith('$') ? '' : contextOf(def.offset);
        offset = def.offset;
    }
    return { path: current, context };
}
