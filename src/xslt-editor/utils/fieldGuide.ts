/**
 * İndirilen XSLT'nin başına eklenen "veri alanı rehberi": tasarımdaki her
 * değerin XML'de nereden geldiği, nasıl dönüştürüldüğü (substring, not
 * filtresi, tarih/sayı biçimi…) ve XML'de nasıl doldurulacağı.
 * Rehber yalnızca bir XML yorumudur; dosya geri yüklenince ayıklanır.
 */
import i18n from '../../i18n';
import { bindingLabel, type CatalogField } from '../fieldCatalog';
import { stripPredicates, xpathPaths } from './xpathNames';
import { GUIDE_BEGIN, GUIDE_END, stripFieldGuide } from './fieldGuideMarker';
import type editorTr from '../../i18n/locales/editor/tr';

const TAG_RE = /<!--[\s\S]*?-->|<(\/?)xsl:([\w-]+)\b((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;

const attrOf = (attrs: string, name: string) => {
    const v = attrs.match(new RegExp(`\\s${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`))?.[2];
    return v === undefined ? null : decodeXml(v);
};

const decodeXml = (s: string) => s
    .replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#160;|&nbsp;/g, ' ').replace(/&amp;/g, '&');

/** `*[local-name()='X']` → `X`; okunabilir yol / ifade. */
const simplify = (s: string) => s.replace(/\*\[local-name\(\)\s*=\s*['"]([\w.-]+)['"]\]/g, '$1').replace(/\s+/g, ' ').trim();

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// ----------------------------------------------------------------------------
// Değişkenler ve isimli şablonlar
// ----------------------------------------------------------------------------

interface Var { name: string; select: string; offset: number }
interface NamedTemplate { start: number; end: number; body: string; params: Map<string, string | null> }

function collect(xslt: string) {
    const templates = new Map<string, NamedTemplate>();
    const ranges: { start: number; end: number }[] = [];
    for (const m of xslt.matchAll(/<xsl:template\b((?:[^>"']|"[^"]*"|'[^']*')*?)>([\s\S]*?)<\/xsl:template\s*>/g)) {
        const name = attrOf(m[1], 'name');
        if (!name) continue;
        const bodyStart = (m.index ?? 0) + m[0].indexOf('>') + 1;
        const params = new Map<string, string | null>();
        for (const p of m[2].matchAll(/<xsl:param\b((?:[^>"']|"[^"]*"|'[^']*')*?)\/?>/g)) {
            const pn = attrOf(p[1], 'name');
            if (pn) params.set(pn, attrOf(p[1], 'select'));
        }
        templates.set(name, { start: bodyStart, end: (m.index ?? 0) + m[0].length, body: m[2], params });
        ranges.push({ start: m.index ?? 0, end: (m.index ?? 0) + m[0].length });
    }
    const inNamed = (offset: number) => ranges.some(r => offset > r.start && offset < r.end);
    const vars: Var[] = [];
    for (const m of xslt.matchAll(/<xsl:(variable|param)\b((?:[^>"']|"[^"]*"|'[^']*')*?)\/?>/g)) {
        const offset = m.index ?? 0;
        if (m[1] === 'param' && inNamed(offset)) continue;
        const name = attrOf(m[2], 'name');
        const select = attrOf(m[2], 'select');
        if (name && select) vars.push({ name, select, offset });
    }
    return { templates, inNamed, vars };
}

/** Basit yol / sabit değilse parantez içine alır (yerine konulduğu ifade bozulmasın). */
function wrap(expr: string): string {
    const t = expr.trim();
    if (/^'[^']*'$|^"[^"]*"$|^-?[\d.]+$/.test(t)) return t;
    return /^[\w$@./*:-]+$/.test(stripPredicates(t).replace(/(?:text|node)\(\)/g, 'x')) ? t : `(${t})`;
}

function makeInliner(vars: Var[]) {
    const lookup = (name: string, offset: number) => {
        const own = vars.filter(v => v.name === name);
        return own.filter(v => v.offset < offset).pop() ?? own[0] ?? null;
    };
    const inline = (expr: string, offset: number, depth = 0): string => expr.replace(/\$([\w.-]+)/g, (m, name: string) => {
        const v = depth < 6 ? lookup(name, offset) : null;
        return v ? wrap(inline(v.select, v.offset, depth + 1)) : m;
    });
    return inline;
}

const substArgs = (expr: string, args: Map<string, string>) =>
    expr.replace(/\$([\w.-]+)/g, (m, name: string) => (args.has(name) ? wrap(args.get(name)!) : m));

interface Expansion { exprs: string[]; codes: string[] }

/** Çağrılan isimli şablonun ürettiği değer ifadeleri (parametreler yerine konmuş). */
function expandTemplate(
    name: string, args: Map<string, string>, chain: string[],
    templates: Map<string, NamedTemplate>, inline: (e: string, o: number) => string,
): Expansion {
    const tpl = templates.get(name);
    const out: Expansion = { exprs: [], codes: [] };
    if (!tpl || chain.includes(name) || chain.length > 3) return out;
    const full = new Map(args);
    for (const [p, def] of tpl.params) if (!full.has(p) && def) full.set(p, def);
    const subst = (e: string, at: number) => substArgs(inline(e, tpl.start + at), full);
    type Call = { name: string; args: Map<string, string> };
    const calls: Call[] = [];
    for (const m of tpl.body.matchAll(TAG_RE)) {
        if (!m[2]) continue;
        const [, close, tag, attrs, self] = m;
        const at = m.index ?? 0;
        if (!close && (tag === 'value-of' || tag === 'copy-of')) {
            const sel = attrOf(attrs, 'select');
            if (sel) out.exprs.push(subst(sel, at));
        } else if (!close && (tag === 'when' || tag === 'if')) {
            // Yalnızca veriden gelen parametrenin karşılaştırıldığı kodlar (sabit etiket anahtarları değil).
            const test = attrOf(attrs, 'test') ?? '';
            for (const c of test.matchAll(/\$([\w.-]+)\s*=\s*'([^']*)'/g)) {
                const arg = full.get(c[1]);
                if (arg && !/^\s*['"]/.test(arg) && xpathPaths(arg).some(p => !p.startsWith('$'))) out.codes.push(c[2]);
            }
        } else if (tag === 'call-template') {
            if (!close) {
                const call = { name: attrOf(attrs, 'name') ?? '', args: new Map<string, string>() };
                if (self) out.exprs.push(...expandTemplate(call.name, call.args, [...chain, name], templates, inline).exprs);
                else calls.push(call);
            } else {
                const call = calls.pop();
                if (call) {
                    const sub = expandTemplate(call.name, call.args, [...chain, name], templates, inline);
                    out.exprs.push(...sub.exprs);
                    out.codes.push(...sub.codes);
                }
            }
        } else if (tag === 'with-param' && !close && calls.length) {
            const pn = attrOf(attrs, 'name');
            const sel = attrOf(attrs, 'select');
            if (pn && sel) calls[calls.length - 1].args.set(pn, subst(sel, at));
        }
    }
    return out;
}

// ----------------------------------------------------------------------------
// Açıklama
// ----------------------------------------------------------------------------

interface Call { name: string; args: string[]; at: number; end: number }

/** İfadedeki tüm fonksiyon çağrıları (iç içe olanlar dahil), argümanlarıyla. */
function functionCalls(expr: string): Call[] {
    const out: Call[] = [];
    for (const m of expr.matchAll(/(?<![\w:@$.-])([a-z][\w-]*)\s*\(/g)) {
        const at = m.index ?? 0;
        let i = at + m[0].length;
        let depth = 0;
        let cur = '';
        const args: string[] = [];
        for (; i < expr.length; i++) {
            const c = expr[i];
            if (c === "'" || c === '"') {
                const j = expr.indexOf(c, i + 1);
                const end = j < 0 ? expr.length : j;
                cur += expr.slice(i, end + 1);
                i = end;
                continue;
            }
            if (c === '(' || c === '[') depth++;
            else if (c === ')' || c === ']') {
                if (depth === 0) break;
                depth--;
            } else if (c === ',' && depth === 0) {
                args.push(cur.trim());
                cur = '';
                continue;
            }
            cur += c;
        }
        if (cur.trim()) args.push(cur.trim());
        out.push({ name: m[1], args, at, end: i });
    }
    return out;
}

/** Parantez, köşeli parantez ve tırnak dışındaki `sep` karakterinden böler. */
function splitTop(s: string, sep: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let cur = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === "'" || c === '"') {
            const j = s.indexOf(c, i + 1);
            const end = j < 0 ? s.length : j;
            cur += s.slice(i, end + 1);
            i = end;
            continue;
        }
        if (c === '(' || c === '[') depth++;
        else if (c === ')' || c === ']') depth--;
        if (c === sep && depth === 0) {
            out.push(cur.trim());
            cur = '';
            continue;
        }
        cur += c;
    }
    out.push(cur.trim());
    return out;
}

const literal = (s: string | undefined) => s?.match(/^\s*(['"])([\s\S]*)\1\s*$/)?.[2] ?? null;
const num = (s: string | undefined) => (s && /^\s*\d+\s*$/.test(s) ? Number(s) : null);

/** Yollardaki köşeli parantez koşulları (en dıştakiler). */
function predicates(path: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let start = -1;
    for (let i = 0; i < path.length; i++) {
        const c = path[i];
        if (c === "'" || c === '"') {
            const j = path.indexOf(c, i + 1);
            i = j < 0 ? path.length : j;
            continue;
        }
        if (c === '[') { if (depth++ === 0) start = i + 1; }
        else if (c === ']' && --depth === 0) out.push(path.slice(start, i).trim());
    }
    return out;
}

type FnKey = keyof typeof editorTr.guide.fn;
type GuideKey = 'title' | 'generated' | 'intro' | 'footer' | `section.${keyof typeof editorTr.guide.section}` | `label.${keyof typeof editorTr.guide.label}`;
const fnText = (k: FnKey, o?: Record<string, unknown>): string => i18n.t(`editor.guide.fn.${k}`, o ?? {});

function describe(exprs: string[], paths: string[], codes: string[]): string[] {
    const t = fnText;
    const steps: string[] = [];
    const push = (s: string) => { if (!steps.includes(s)) steps.push(s); };
    const preds = paths.flatMap(p => predicates(simplify(p)));
    // Döngü / yol koşulundaki not filtreleri (ör. for-each cbc:Note[starts-with(., 'Yalnız')]) önce anlatılır.
    const filters = preds.filter(pred => /starts-with|contains\(/.test(pred));
    const explain = (expr: string) => {
        const all = functionCalls(expr);
        const isDate = [[1, 4], [6, 2], [9, 2]].every(([a, b]) => all.some(c => c.name === 'substring' && num(c.args[1]) === a && num(c.args[2]) === b));
        for (const c of [...all].reverse()) {
            const within = (names: string[]) => all.some(n => names.includes(n.name) && n.at < c.at && n.end > c.at);
            if (within(['starts-with', 'contains'])) continue;
            const negated = within(['not']);
            const [a0, a1, a2] = c.args;
            switch (c.name) {
                case 'substring': {
                    const from = num(a1);
                    const len = num(a2);
                    if (literal(a0) !== null) push(t('lookup'));
                    else if (isDate && [[1, 4], [6, 2], [9, 2]].some(([a, b]) => from === a && len === b)) push(t('date'));
                    else if (from === 12 && len === 5 || from === 1 && len === 5 && /Time/.test(a0 ?? '')) push(t('time'));
                    else if (/string-length\(/.test(a1 ?? '') && a2 === undefined) {
                        const n = a1?.match(/-\s*(\d+)\s*\+\s*1\s*$/)?.[1];
                        push(n ? t('lastN', { n }) : t('substringExpr'));
                    }
                    else if (from !== null && len !== null) push(t('substring', { from, to: from + len - 1, len }));
                    else if (from !== null && a2 === undefined) push(t('substringFrom', { from }));
                    else push(t('substringExpr'));
                    break;
                }
                case 'substring-before':
                case 'substring-after': {
                    const sep = literal(a1);
                    const key = c.name === 'substring-before' ? 'before' : 'after';
                    push(sep !== null ? t(key, { sep }) : t(`${key}Expr`));
                    break;
                }
                case 'starts-with':
                case 'contains': {
                    const text = literal(a1);
                    const base = c.name === 'contains' ? 'contains' : 'startsWith';
                    const key = negated ? (`${base}Not` as const) : base;
                    push(text !== null ? t(key, { text }) : t(`${key}Expr`));
                    break;
                }
                case 'normalize-space': push(t('trim')); break;
                case 'translate': {
                    const from = literal(a1) ?? '';
                    const to = literal(a2) ?? '';
                    if (from.length > 20 && /^\p{Ll}+$/u.test(from) && /^\p{Lu}+$/u.test(to)) push(t('upper'));
                    else if (from.length > 20 && /^\p{Lu}+$/u.test(from) && /^\p{Ll}+$/u.test(to)) push(t('lower'));
                    else push(t('translate', { from: clip(from, 30), to: clip(to, 30) }));
                    break;
                }
                case 'concat': push(t('concat')); break;
                case 'format-number': push(t('number', { pattern: literal(a1) ?? '?' })); break;
                case 'sum': push(t('sum')); break;
                case 'count': push(t('count')); break;
                case 'string-length': push(t('length')); break;
                case 'floor': case 'round': case 'ceiling': push(t('round')); break;
                default: break;
            }
        }
    };
    filters.forEach(explain);
    for (const pred of preds) {
        if (/^\d+$/.test(pred)) push(pred === '1' ? t('first') : t('nth', { n: pred }));
        else if (/^last\(\)$/.test(pred)) push(t('last'));
        else if (!/starts-with|contains\(/.test(pred)) push(t('where', { cond: clip(pred, 100) }));
    }
    exprs.forEach(explain);
    if (codes.length) {
        const shown = [...new Set(codes)];
        push(t('codes', { codes: shown.slice(0, 10).join(', ') + (shown.length > 10 ? ', …' : '') }));
    }
    return steps;
}

// ----------------------------------------------------------------------------
// Bağlam, yol ve örnek değer
// ----------------------------------------------------------------------------

/** Göreli yolu bağlamla birleştirir; `.` ve `..` adımlarını çözer. */
function fullPath(path: string, ctx: string): string {
    const p = path.trim();
    const joined = p.startsWith('/') || p.startsWith('(') ? p : ctx ? `${ctx}/${p}` : `/${p}`;
    const out: string[] = [];
    for (const s of joined.split(/\/(?![^[]*\])/)) {
        const step = s.trim();
        if (step === '.' && out.length) continue;
        if (step === '..') {
            if (out.length && out[out.length - 1] !== '') out.pop();
            continue;
        }
        out.push(step);
    }
    return out.join('/') || '/';
}

/** Değerin hemen önündeki tasarım metni (ör. "Fatura No", "Plaka:") — alanın kâğıttaki adı. */
function nearbyText(xslt: string, offset: number): string | null {
    const before = xslt.slice(Math.max(0, offset - 400), offset);
    const matches = [...before.matchAll(/>([^<>]*\p{L}{2}[^<>]*)</gu)];
    const m = matches.pop();
    if (!m || m.index === undefined) return null;
    const between = before.slice(m.index + m[0].length - 1);
    if (/<xsl:(?:value-of|copy-of|call-template|apply-templates)\b|<\/(?:td|th|tr|table|li|p|h\d|style|script)>|<\/xsl:(?:when|otherwise|if|choose|for-each|variable)>|<br\b/i.test(between)) return null;
    if (/<(?:style|script)\b[^>]*$|<xsl:(?:when|otherwise|variable|param|with-param|attribute)\b[^>]*>$/i.test(before.slice(0, m.index + 1))) return null;
    const text = decodeXml(m[1]).replace(/\s+/g, ' ').replace(/^[\s:：·|/–-]+|[\s:：·|/–-]+$/g, '');
    return text.length >= 2 && text.length <= 60 ? text : null;
}

function makeSampler(xml: string, xslt: string) {
    if (typeof DOMParser === 'undefined' || !xml.trim()) return null;
    const doc = new DOMParser().parseFromString(xml.replace(/^\uFEFF/, ''), 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) return null;
    const ns = new Map<string, string>();
    for (const m of xslt.matchAll(/xmlns:([\w.-]+)\s*=\s*["']([^"']+)["']/g)) if (!ns.has(m[1])) ns.set(m[1], m[2]);
    const resolver = (p: string | null) => (p ? ns.get(p) ?? null : null);
    const nodes = new Map<string, Node | null>();
    const contextNode = (ctx: string): Node | null => {
        if (!ctx) return doc;
        if (!nodes.has(ctx)) {
            try {
                nodes.set(ctx, doc.evaluate(ctx, doc, resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
            } catch {
                nodes.set(ctx, null);
            }
        }
        return nodes.get(ctx) ?? null;
    };
    return (expr: string, ctx: string): string | null => {
        if (/\$|format-number|current\(|key\(|document\(|generate-id/.test(expr)) return null;
        const node = contextNode(ctx);
        if (!node) return null;
        try {
            return doc.evaluate(`string(${expr})`, node, resolver, XPathResult.STRING_TYPE, null).stringValue.replace(/\s+/g, ' ').trim();
        } catch {
            return null;
        }
    };
}

function fillExample(path: string, raw: string | null): string | null {
    const steps = stripPredicates(simplify(path)).split('/').map(s => s.trim()).filter(Boolean);
    const last = steps.pop();
    const value = raw ? clip(raw, 90) : '…';
    const isName = (s: string | undefined) => !!s && /^[\w.-]+(?::[\w.-]+)?$/.test(s);
    if (last?.startsWith('@')) {
        const parent = steps.pop();
        return isName(parent) && isName(last.slice(1)) ? `<${parent} ${last.slice(1)}="${value}">…</${parent}>` : null;
    }
    return isName(last) ? `<${last}>${value}</${last}>` : null;
}

// ----------------------------------------------------------------------------
// Rehber
// ----------------------------------------------------------------------------

interface Entry {
    title: string;
    catalogLabel: string | null;
    paths: string[];
    how: string[];
    fill: string | null;
    shown: string | null;
    conditions: string[];
    expr: string | null;
    section: string;
}

interface Open { kind: 'fe' | 'cond' | 'call'; value: string; args?: Map<string, string>; offset: number }

function collectEntries(xslt: string, xml: string, catalog: CatalogField[]): Entry[] {
    const { templates, inNamed, vars } = collect(xslt);
    const inline = makeInliner(vars);
    const sample = makeSampler(xml, xslt);
    const rootName = xml.replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').match(/<(?:[\w.-]+:)?([\w.-]+)/)?.[1] ?? null;
    const entries: Entry[] = [];
    const seen = new Set<string>();
    let base = '';
    let stack: Open[] = [];

    /** `a | b` birleşiminden bu XML'e uyan (kök adıyla biten) seçenek. */
    const pickUnion = (s: string) => {
        const parts = splitTop(s, '|');
        if (parts.length < 2) return s.trim();
        return parts.find(p => rootName && new RegExp(`(?:^|[/:'])${rootName}'?\\]?$`).test(p)) ?? parts[0];
    };
    const isRootStep = (s: string) => !!rootName && new RegExp(`^(?:[\\w.-]+:)?${rootName}$|^\\*\\[local-name\\(\\)\\s*=\\s*'${rootName}'\\]$`).test(s);
    const contextPath = () => {
        const m = base && pickUnion(base);
        let ctx = !m || m === '/' ? '' : m.startsWith('/') ? m : isRootStep(m) ? `/${m}` : `//${m}`;
        for (const o of stack) {
            if (o.kind !== 'fe') continue;
            const s = pickUnion(o.value);
            ctx = s.startsWith('/') || s.startsWith('(') ? s : ctx ? `${ctx}/${s}` : `/${s}`;
        }
        return fullPath(ctx, '');
    };

    const add = (offset: number, allExprs: string[], codes: string[]) => {
        // Belge türüne göre ayrılan dallar (ör. irsaliye bölümü) bu XML'de hiç görünmez.
        for (const o of stack) {
            if (o.kind !== 'cond' || !rootName) continue;
            const s = simplify(o.value);
            const other = s.match(/^\/(?:[\w.-]+:)?([\w.-]+)$/)?.[1] ?? (/\bor\b/.test(s) ? null : s.match(/local-name\(\/\*\)\s*=\s*'([\w.-]+)'/)?.[1]);
            if (other && other !== rootName) return;
        }
        const ctx = contextPath();
        const dataPaths = (e: string) => xpathPaths(e).filter(p => !p.startsWith('$') && p !== '*' && /[A-Za-z.@]/.test(p));
        const exprs = allExprs.filter(e => dataPaths(e).length);
        const raw = [...new Set(exprs.flatMap(dataPaths))];
        if (!raw.length) return;
        const paths = [...new Set(raw.map(p => fullPath(p, ctx)))];
        const labels = [...new Set(paths.map(p => bindingLabel(simplify(p), catalog, '')).filter((l): l is string => !!l))];
        const catalogLabel = labels.length ? labels.join(' + ') : null;
        const shortName = stripPredicates(simplify(paths[0])).split('/').filter(s => s && s !== '*').slice(-2).join('/');
        const title = nearbyText(xslt, offset) ?? catalogLabel ?? shortName;
        const how = describe(exprs, paths, codes);
        const firstValue = sample?.(raw[0], ctx) ?? null;
        let shown: string | null = null;
        for (const e of exprs) {
            const v = sample?.(e, ctx);
            if (v) { shown = v; break; }
        }
        const conditions: string[] = [];
        const own = new Set(paths.map(p => stripPredicates(simplify(p))));
        for (const o of [...stack].reverse()) {
            if (o.kind !== 'cond' || conditions.length >= 2) continue;
            const test = o.value;
            const testPaths = xpathPaths(test).filter(p => !p.startsWith('$')).map(p => stripPredicates(simplify(fullPath(p, ctx))));
            const compares = /[=<>]/.test(stripPredicates(test));
            if (!compares && testPaths.every(p => [...own].some(o => o === p || o.startsWith(`${p}/`)))) continue;
            conditions.push(clip(simplify(test), 160));
        }
        const exprText = exprs.map(simplify).join('  |  ');
        const plain = exprs.length === 1 && xpathPaths(exprs[0]).length === 1 && xpathPaths(exprs[0])[0] === exprs[0].trim();
        const entry: Entry = {
            title,
            catalogLabel: catalogLabel && catalogLabel !== title ? catalogLabel : null,
            paths: paths.map(simplify),
            how,
            fill: fillExample(paths[0], firstValue),
            shown: shown && shown !== firstValue ? clip(shown, 90) : null,
            conditions,
            expr: plain ? null : clip(exprText, 220),
            section: /^\/{0,2}[^/]*$/.test(simplify(ctx)) ? '' : simplify(ctx),
        };
        const key = `${entry.title}|${entry.paths.join(',')}|${entry.how.join(',')}|${entry.conditions.join(',')}`;
        if (seen.has(key)) return;
        seen.add(key);
        entries.push(entry);
    };

    for (const m of xslt.matchAll(TAG_RE)) {
        if (!m[2]) continue;
        const [, close, tag, attrs, self] = m;
        const offset = m.index ?? 0;
        if (tag === 'template') {
            stack = [];
            base = close ? '' : attrOf(attrs, 'match')?.trim() ?? '';
            continue;
        }
        const named = inNamed(offset);
        if (tag === 'for-each' || tag === 'if' || tag === 'when') {
            if (close) {
                const kind = tag === 'for-each' ? 'fe' : 'cond';
                const i = stack.map(o => o.kind).lastIndexOf(kind);
                if (i >= 0) stack.splice(i, 1);
            } else if (!self) {
                const value = attrOf(attrs, tag === 'for-each' ? 'select' : 'test') ?? '';
                stack.push({ kind: tag === 'for-each' ? 'fe' : 'cond', value: inline(value, offset), offset });
            }
            continue;
        }
        if (named) continue;
        if (!close && (tag === 'value-of' || tag === 'copy-of')) {
            const sel = attrOf(attrs, 'select');
            if (sel) add(offset, [inline(sel, offset)], []);
        } else if (tag === 'call-template') {
            const finish = (name: string, args: Map<string, string>, at: number) => {
                const x = expandTemplate(name, args, [], templates, inline);
                if (x.exprs.length) add(at, x.exprs, x.codes);
            };
            if (!close && self) finish(attrOf(attrs, 'name') ?? '', new Map(), offset);
            else if (!close) stack.push({ kind: 'call', value: attrOf(attrs, 'name') ?? '', args: new Map(), offset });
            else {
                const i = stack.map(o => o.kind).lastIndexOf('call');
                if (i >= 0) {
                    const [call] = stack.splice(i, 1);
                    finish(call.value, call.args!, call.offset);
                }
            }
        } else if (tag === 'with-param' && !close) {
            const call = [...stack].reverse().find(o => o.kind === 'call');
            const pn = attrOf(attrs, 'name');
            const sel = attrOf(attrs, 'select');
            if (call && pn && sel) call.args!.set(pn, inline(sel, offset));
        }
    }
    return entries;
}

/** Yorum içinde geçersiz olan `--` dizilerini böler. */
const commentSafe = (s: string) => s.replace(/-{2,}/g, d => d.split('').join(' ')).replace(/-$/, '- ');

function guideLines(xslt: string, xml: string, catalog: CatalogField[], designName: string): string[] | null {
    const entries = collectEntries(stripFieldGuide(xslt), xml, catalog);
    if (!entries.length) return null;
    const t = (k: GuideKey, o?: Record<string, unknown>): string => i18n.t(`editor.guide.${k}`, o ?? {});
    const labels = {
        xml: t('label.xml'), how: t('label.how'), fill: t('label.fill'), shown: t('label.shown'),
        cond: t('label.condition'), expr: t('label.expr'),
    };
    const pad = Math.max(...Object.values(labels).map(l => l.length));
    const line = (label: string, value: string) => `     ${label.padEnd(pad)} : ${value}`;
    const rule = '='.repeat(78);
    const out: string[] = [
        rule,
        ` ${t('title')}`,
        ...(designName ? [` ${designName}`] : []),
        ` ${t('generated', { date: new Date().toISOString().slice(0, 10), count: entries.length })}`,
        rule,
        ...t('intro').split('\n').map(s => ` ${s}`),
        rule,
    ];
    let section: string | null = null;
    entries.forEach((e, i) => {
        if (e.section !== section) {
            section = e.section;
            const name = stripPredicates(section).split('/').filter(Boolean).pop() ?? '';
            out.push('', section ? `## ${t('section.repeat', { path: section, name })}` : `## ${t('section.document')}`, '');
        }
        out.push(` ${String(i + 1).padStart(3)}) ${e.title}${e.catalogLabel ? `  —  ${e.catalogLabel}` : ''}`);
        out.push(line(labels.xml, e.paths.join('  +  ')));
        out.push(line(labels.how, e.how.length ? e.how.join(' → ') : fnText('direct')));
        if (e.fill) out.push(line(labels.fill, e.fill));
        if (e.shown) out.push(line(labels.shown, e.shown));
        for (const c of e.conditions) out.push(line(labels.cond, c));
        if (e.expr) out.push(line(labels.expr, e.expr));
    });
    out.push('', rule, ` ${t('footer')}`, rule);
    return out;
}

export function buildFieldGuide(xslt: string, xml: string, catalog: CatalogField[], designName = ''): string | null {
    const lines = guideLines(xslt, xml, catalog, designName);
    return lines ? `<!-- ${commentSafe([GUIDE_BEGIN, ...lines, GUIDE_END].join('\n'))} -->` : null;
}

/** Rehberi XSLT'nin yanında ayrı bir .txt dosyası olarak indirir (Not Defteri için BOM + CRLF). */
export function downloadFieldGuide(baseName: string, xslt: string, xml: string, catalog: CatalogField[], designName = ''): void {
    let lines: string[] | null = null;
    try {
        lines = guideLines(xslt, xml, catalog, designName);
    } catch (err) {
        console.warn('[fieldGuide] rehber dosyası oluşturulamadı', err);
    }
    if (!lines) return;
    const text = `\uFEFF${lines.join('\r\n')}\r\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}_${i18n.t('editor.guide.fileSuffix')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** Rehberi XML bildiriminin hemen altına ekler (varsa eskisini değiştirir). */
export function withFieldGuide(xslt: string, xml: string, catalog: CatalogField[], designName = ''): string {
    const clean = stripFieldGuide(xslt);
    let guide: string | null = null;
    try {
        guide = buildFieldGuide(clean, xml, catalog, designName);
    } catch (err) {
        console.warn('[fieldGuide] rehber oluşturulamadı', err);
    }
    if (!guide) return clean;
    const decl = clean.match(/^\s*<\?xml[^?]*\?>[ \t]*(?:\r?\n)?/);
    const at = decl ? decl[0].length : 0;
    const sep = decl && !decl[0].endsWith('\n') ? '\n' : '';
    return `${clean.slice(0, at)}${sep}${guide}\n${clean.slice(at)}`;
}
