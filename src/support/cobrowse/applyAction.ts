import type { RemoteAction } from '../../admin/contracts';

type Win = Window & typeof globalThis;

const winOf = (n: Node): Win => ((n.ownerDocument ?? (n as Document)).defaultView ?? window) as Win;

const isEl = (n: unknown): n is Element => !!n && (n as Node).nodeType === 1;

const TEXT_INPUT_TYPES = new Set(['', 'text', 'search', 'email', 'url', 'tel', 'number']);

const PRIVATE_SELECTOR = '[data-private], .rr-mask';

/** Parola / dosya alanı ya da gizli işaretli alan: uzaktan değer okunamaz/yazılamaz. */
export function isProtected(n: Node | null | undefined): boolean {
    if (!isEl(n)) return false;
    const tag = n.tagName;
    if (tag === 'INPUT') {
        const type = ((n as HTMLInputElement).type || '').toLowerCase();
        if (type === 'password' || type === 'file' || n.hasAttribute('data-rr-is-password')) return true;
    }
    return !!n.closest(PRIVATE_SELECTOR) && (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (n as HTMLElement).isContentEditable);
}

/** Yalnızca parola/dosya alanları: üzerlerinde hiçbir işlem (tıklama dahil) yapılmaz. */
const isForbidden = (n: Node | null | undefined): boolean => {
    if (!isEl(n) || n.tagName !== 'INPUT') return false;
    const type = ((n as HTMLInputElement).type || '').toLowerCase();
    return type === 'password' || type === 'file' || n.hasAttribute('data-rr-is-password');
};

const isTextField = (el: Element | null): el is HTMLInputElement | HTMLTextAreaElement => {
    if (!el) return false;
    if (el.tagName === 'TEXTAREA') return true;
    return el.tagName === 'INPUT' && TEXT_INPUT_TYPES.has(((el as HTMLInputElement).type || '').toLowerCase());
};

const FOCUSABLE = 'input, textarea, select, button, a[href], [tabindex]:not([tabindex="-1"]), [contenteditable=""], [contenteditable="true"], summary';

/** React'in değer izleyicisini atlatmak için prototipteki yerel setter ile değer yazar. */
export function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
    const w = winOf(el);
    const proto = el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype
        : el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype
            : w.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(el, value);
    else el.value = value;
}

const fire = (el: EventTarget, type: string) => {
    el.dispatchEvent(new Event(type, { bubbles: true }));
};

const setValueAndNotify = (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string, inputType = 'insertText') => {
    setNativeValue(el, value);
    const w = winOf(el);
    try {
        el.dispatchEvent(new w.InputEvent('input', { bubbles: true, inputType }));
    } catch {
        fire(el, 'input');
    }
    fire(el, 'change');
};

const setCaret = (el: HTMLInputElement | HTMLTextAreaElement, pos: number) => {
    try { el.setSelectionRange(pos, pos); } catch { /* number/email desteklemez */ }
};

const selectionOf = (el: HTMLInputElement | HTMLTextAreaElement) => {
    let start: number | null = null;
    let end: number | null = null;
    try { start = el.selectionStart; end = el.selectionEnd; } catch { /* yok say */ }
    const len = el.value.length;
    return { start: start ?? len, end: end ?? len };
};

const pointOf = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
};

const focusFor = (el: Element) => {
    const target = el.closest(FOCUSABLE) as HTMLElement | null;
    const doc = el.ownerDocument;
    if (target && !isForbidden(target)) {
        target.focus({ preventScroll: true });
    } else {
        const active = doc.activeElement as HTMLElement | null;
        if (active && active !== doc.body && !active.contains(el)) active.blur();
    }
};

function remoteClick(el: Element) {
    const w = winOf(el);
    const base = { bubbles: true, cancelable: true, composed: true, view: w, button: 0, ...pointOf(el) };
    const ptr = { ...base, pointerId: 1, pointerType: 'mouse', isPrimary: true };
    const P = w.PointerEvent ?? w.MouseEvent;
    el.dispatchEvent(new P('pointerover', ptr));
    el.dispatchEvent(new w.MouseEvent('mouseover', base));
    el.dispatchEvent(new P('pointerdown', { ...ptr, buttons: 1 }));
    const down = el.dispatchEvent(new w.MouseEvent('mousedown', { ...base, buttons: 1 }));
    if (down) focusFor(el);
    el.dispatchEvent(new P('pointerup', ptr));
    el.dispatchEvent(new w.MouseEvent('mouseup', base));
    if (typeof (el as HTMLElement).click === 'function') (el as HTMLElement).click();
    else el.dispatchEvent(new w.MouseEvent('click', base));
}

const MODIFIERS = ['Ctrl', 'Shift', 'Alt', 'Meta'] as const;

/** "Shift+Tab", "Ctrl+a" gibi birleşik tuşları ayrıştırır. */
export function parseKey(raw: string) {
    const mods = { ctrlKey: false, shiftKey: false, altKey: false, metaKey: false };
    let key = raw;
    for (;;) {
        const m = MODIFIERS.find((p) => key.startsWith(`${p}+`) && key.length > p.length + 1);
        if (!m) break;
        mods[`${m.toLowerCase()}Key` as keyof typeof mods] = true;
        key = key.slice(m.length + 1);
    }
    return { key, ...mods };
}

const KEY_CODES: Record<string, number> = {
    Backspace: 8, Tab: 9, Enter: 13, Escape: 27, ' ': 32, PageUp: 33, PageDown: 34, End: 35, Home: 36,
    ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Delete: 46,
};

const codeFor = (key: string) => {
    if (key.length === 1) {
        if (/[a-z]/i.test(key)) return `Key${key.toUpperCase()}`;
        if (/[0-9]/.test(key)) return `Digit${key}`;
        if (key === ' ') return 'Space';
        return '';
    }
    return key;
};

function keyEvent(target: Element, type: string, key: string, mods: ReturnType<typeof parseKey>) {
    const w = winOf(target);
    const ev = new w.KeyboardEvent(type, {
        key, code: codeFor(key), bubbles: true, cancelable: true, composed: true,
        ctrlKey: mods.ctrlKey, shiftKey: mods.shiftKey, altKey: mods.altKey, metaKey: mods.metaKey,
    });
    const code = KEY_CODES[key] ?? (key.length === 1 ? key.toUpperCase().charCodeAt(0) : 0);
    try {
        Object.defineProperty(ev, 'keyCode', { get: () => code });
        Object.defineProperty(ev, 'which', { get: () => code });
    } catch { /* yok say */ }
    return target.dispatchEvent(ev);
}

const focusables = (doc: Document) =>
    Array.from(doc.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((e) =>
        !(e as HTMLButtonElement).disabled && e.getClientRects().length > 0 && !e.closest('[data-cobrowse-ui]'));

function moveFocus(from: Element, back: boolean) {
    const list = focusables(from.ownerDocument);
    if (!list.length) return;
    const i = list.indexOf(from as HTMLElement);
    const next = list[(i + (back ? -1 : 1) + list.length) % list.length] ?? list[0];
    next.focus({ preventScroll: false });
}

function editableKey(el: HTMLInputElement | HTMLTextAreaElement, key: string, mods: ReturnType<typeof parseKey>): boolean {
    const v = el.value;
    const { start, end } = selectionOf(el);
    if (mods.ctrlKey || mods.metaKey) {
        if (key.toLowerCase() === 'a') { el.select(); return true; }
        return false;
    }
    if (key.length === 1) {
        if (el.readOnly || el.disabled) return true;
        const max = el.maxLength > 0 ? el.maxLength : Infinity;
        if (v.length - (end - start) >= max) return true;
        setValueAndNotify(el, v.slice(0, start) + key + v.slice(end));
        setCaret(el, start + 1);
        return true;
    }
    switch (key) {
        case 'Backspace': {
            if (el.readOnly || el.disabled) return true;
            if (start === end && start === 0) return true;
            const from = start === end ? start - 1 : start;
            setValueAndNotify(el, v.slice(0, from) + v.slice(end), 'deleteContentBackward');
            setCaret(el, from);
            return true;
        }
        case 'Delete': {
            if (el.readOnly || el.disabled) return true;
            const to = start === end ? Math.min(v.length, end + 1) : end;
            setValueAndNotify(el, v.slice(0, start) + v.slice(to), 'deleteContentForward');
            setCaret(el, start);
            return true;
        }
        case 'ArrowLeft': setCaret(el, Math.max(0, start === end ? start - 1 : start)); return true;
        case 'ArrowRight': setCaret(el, Math.min(v.length, start === end ? end + 1 : end)); return true;
        case 'Home': setCaret(el, 0); return true;
        case 'End': setCaret(el, v.length); return true;
        case 'Enter':
            if (el.tagName === 'TEXTAREA') {
                setValueAndNotify(el, `${v.slice(0, start)}\n${v.slice(end)}`, 'insertLineBreak');
                setCaret(el, start + 1);
            } else {
                const form = (el as HTMLInputElement).form;
                if (form) {
                    if (typeof form.requestSubmit === 'function') form.requestSubmit();
                    else form.submit();
                }
            }
            return true;
    }
    return false;
}

function contentEditableKey(el: HTMLElement, key: string, mods: ReturnType<typeof parseKey>): boolean {
    const doc = el.ownerDocument;
    if (mods.ctrlKey || mods.metaKey) {
        if (key.toLowerCase() === 'a') { doc.execCommand('selectAll'); return true; }
        return false;
    }
    if (key.length === 1) return doc.execCommand('insertText', false, key) || true;
    if (key === 'Backspace') return doc.execCommand('delete') || true;
    if (key === 'Delete') return doc.execCommand('forwardDelete') || true;
    if (key === 'Enter') return doc.execCommand('insertLineBreak') || true;
    return false;
}

function remoteKey(target: Element, raw: string) {
    const mods = parseKey(raw);
    const { key } = mods;
    const notCancelled = keyEvent(target, 'keydown', key, mods);
    if (notCancelled) {
        if (key.length === 1 && !mods.ctrlKey && !mods.metaKey) keyEvent(target, 'keypress', key, mods);
        let handled = false;
        if (isTextField(target)) handled = editableKey(target, key, mods);
        else if ((target as HTMLElement).isContentEditable) handled = contentEditableKey(target as HTMLElement, key, mods);
        if (!handled) {
            if (key === 'Tab') moveFocus(target, mods.shiftKey);
            else if ((key === 'Enter' || key === ' ') && target.matches('button, a[href], summary, [role="button"], input[type="checkbox"], input[type="radio"], input[type="submit"], input[type="button"]')) {
                (target as HTMLElement).click();
            }
        }
    }
    keyEvent(target, 'keyup', key, mods);
}

function remoteInput(el: Element, value: string) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        const field = el as HTMLInputElement;
        if (field.readOnly || field.disabled) return;
        const type = (field.type || '').toLowerCase();
        if (type === 'checkbox' || type === 'radio') return;
        field.focus({ preventScroll: true });
        setValueAndNotify(field, value);
        setCaret(field, value.length);
        return;
    }
    if (el.tagName === 'SELECT') {
        setValueAndNotify(el as HTMLSelectElement, value);
        return;
    }
    const editable = (el as HTMLElement).isContentEditable ? el as HTMLElement : null;
    if (editable) {
        editable.focus({ preventScroll: true });
        const doc = editable.ownerDocument;
        const sel = doc.getSelection();
        const range = doc.createRange();
        range.selectNodeContents(editable);
        sel?.removeAllRanges();
        sel?.addRange(range);
        if (!doc.execCommand('insertText', false, value)) {
            editable.textContent = value;
            fire(editable, 'input');
        }
    }
}

export interface ApplyContext {
    getNode(id: number): Node | null;
    showPointer(x: number, y: number): void;
}

/** Yönetici işlemini sayfaya uygular. Uygulanmazsa (korumalı / bulunamadı) false döner. */
export function applyRemoteAction(action: RemoteAction, ctx: ApplyContext): boolean {
    if (action.type === 'pointer') {
        ctx.showPointer(action.x, action.y);
        return true;
    }
    if (action.type === 'scroll') {
        const n = action.id != null ? ctx.getNode(action.id) : null;
        if (isEl(n) && n !== n.ownerDocument.documentElement && n !== n.ownerDocument.body) {
            n.scrollTo({ left: action.x, top: action.y });
        } else {
            const w = n ? winOf(n) : window;
            w.scrollTo({ left: action.x, top: action.y });
        }
        return true;
    }
    if (action.type === 'key') {
        let target: Node | null = action.id != null ? ctx.getNode(action.id) : null;
        if (target && !isEl(target)) target = target.parentElement;
        if (!target) target = document.activeElement ?? document.body;
        // Odak aynı kökenli bir iframe içindeyse en içteki etkin öğeye in.
        while (isEl(target) && target.tagName === 'IFRAME') {
            const inner: Element | null | undefined = (target as HTMLIFrameElement).contentDocument?.activeElement;
            if (!inner) break;
            target = inner;
        }
        if (!isEl(target) || isProtected(target) || target.closest('[data-cobrowse-ui]')) return false;
        remoteKey(target, action.key);
        return true;
    }
    let node = ctx.getNode(action.id);
    if (node && !isEl(node)) node = node.parentElement;
    if (!isEl(node) || node.closest('[data-cobrowse-ui]')) return false;
    switch (action.type) {
        case 'click':
            if (isForbidden(node)) return false;
            remoteClick(node);
            return true;
        case 'input':
            if (isProtected(node)) return false;
            remoteInput(node, action.value);
            return true;
        case 'check': {
            const el = node as HTMLInputElement;
            if (el.tagName !== 'INPUT' || el.disabled) return false;
            if (el.checked !== action.checked) el.click();
            return true;
        }
        case 'select': {
            if (node.tagName !== 'SELECT' || isProtected(node) || (node as HTMLSelectElement).disabled) return false;
            setValueAndNotify(node as HTMLSelectElement, action.value);
            return true;
        }
    }
    return false;
}
