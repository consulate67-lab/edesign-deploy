import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    AlertTriangle, ArrowLeft, Bold, Download, Forward, ImageOff, Inbox, Italic, Link2, List, Mail, MailOpen, Paperclip, Pencil, Plus, RefreshCw,
    Reply, ReplyAll, RotateCcw, Search, Send, Settings2, Star, Trash2, Underline, X,
} from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { adminApi } from '../adminApi';
import type { MailAccount, MailAccountInput, MailAction, MailAddress, MailFolder, MailListItem, MailMessage } from '../contracts';
import { C, btn, errorText, fmtDateTime, inputStyle, labelStyle } from '../format';
import { useMediaQuery } from '../hooks';
import { Badge, Empty, ErrorBox, Modal, SectionHeader, Spinner } from '../ui';

const FOLDERS: { id: MailFolder; label: string; icon: React.ReactNode }[] = [
    { id: 'inbox', label: 'Gelen kutusu', icon: <Inbox size={15} /> },
    { id: 'unread', label: 'Okunmamış', icon: <Mail size={15} /> },
    { id: 'starred', label: 'Yıldızlı', icon: <Star size={15} /> },
    { id: 'sent', label: 'Gönderilen', icon: <Send size={15} /> },
    { id: 'trash', label: 'Çöp kutusu', icon: <Trash2 size={15} /> },
];
const PAGE = 50;
const ATTACH_MAX = 4 * 1024 * 1024;

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const textToHtml = (s: string) => escapeHtml(s).replace(/\r?\n/g, '<br>');
const fmtSize = (n: number) => (n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
const fmtAddr = (a: MailAddress) => {
    const name = a.name.replace(/"/g, '');
    return name ? `${/[,;<>@]/.test(name) ? `"${name}"` : name} <${a.address}>` : a.address;
};
const fmtShort = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    return d.toLocaleDateString('tr-TR');
};

/** Alıntı ve iletmede yönetim sayfasına girecek HTML: betik, stil ve olay öznitelikleri atılır. */
const cleanHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script,style,link,meta,iframe,object,embed,form,base,title').forEach((n) => n.remove());
    doc.querySelectorAll('*').forEach((el) => {
        for (const a of [...el.attributes]) {
            if (/^on/i.test(a.name) || (/^(href|src|action)$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) el.removeAttribute(a.name);
        }
    });
    return doc.body.innerHTML;
};

const signatureHtml = (sig: string) => (sig.trim() ? `<br><div>--<br>${textToHtml(sig.trim())}</div>` : '');

const readAsBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).replace(/^data:[^,]*,/, ''));
    r.onerror = () => reject(new Error(`${file.name} okunamadı.`));
    r.readAsDataURL(file);
});

// ------------------------------------------------------------ HTML gövde

const HtmlFrame: React.FC<{ html: string; showImages: boolean }> = ({ html, showImages }) => {
    const ref = useRef<HTMLIFrameElement>(null);
    const [height, setHeight] = useState(200);
    const remote = showImages ? ' https: http:' : '';
    const doc = useMemo(() => `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: cid:${remote}; style-src 'unsafe-inline'${remote}; font-src data:${remote}">
<base target="_blank"><style>body{margin:0;padding:2px;font:14px/1.55 'Segoe UI',Arial,sans-serif;color:#1e1b4b;word-wrap:break-word;overflow-wrap:anywhere}img{max-width:100%;height:auto}table{max-width:100%}blockquote{margin:0 0 0 .8ex;border-left:2px solid #c7c9e8;padding-left:1ex;color:#555}</style>
</head><body>${html}</body></html>`, [html, remote]);

    useEffect(() => {
        const frame = ref.current;
        if (!frame) return;
        let observer: ResizeObserver | null = null;
        const measure = () => {
            const body = frame.contentDocument?.body;
            if (body) setHeight(Math.max(120, body.scrollHeight + 16));
        };
        const onLoad = () => {
            measure();
            const body = frame.contentDocument?.body;
            if (body) {
                observer = new ResizeObserver(measure);
                observer.observe(body);
            }
        };
        frame.addEventListener('load', onLoad);
        return () => { frame.removeEventListener('load', onLoad); observer?.disconnect(); };
    }, [doc]);

    return (
        <iframe ref={ref} title="E-posta içeriği" srcDoc={doc} sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            style={{ width: '100%', height, border: 'none', display: 'block', background: '#fff' }} />
    );
};

// ------------------------------------------------------------ hesap yönetimi

const emptyForm = (): MailAccountInput & { email: string; password: string } => ({ email: '', name: '', password: '', signature: '', popHost: '', smtpHost: '', smtpPort: null });

const AccountsModal: React.FC<{ accounts: MailAccount[]; configured: boolean; onClose: () => void; onChanged: () => void }> = ({ accounts, configured, onClose, onChanged }) => {
    const pushToast = useUiStore((s) => s.pushToast);
    const [editing, setEditing] = useState<number | 'new' | null>(accounts.length ? null : 'new');
    const [form, setForm] = useState(emptyForm);
    const [advanced, setAdvanced] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startEdit = (a: MailAccount | null) => {
        setError(null);
        setAdvanced(!!(a?.pop_host || a?.smtp_host || a?.smtp_port));
        setForm(a ? { email: a.email, name: a.name, password: '', signature: a.signature, popHost: a.pop_host ?? '', smtpHost: a.smtp_host ?? '', smtpPort: a.smtp_port } : emptyForm());
        setEditing(a ? a.id : 'new');
    };

    const save = async () => {
        setBusy(true);
        setError(null);
        try {
            const input: MailAccountInput = {
                name: form.name.trim(), signature: form.signature, popHost: form.popHost?.trim(), smtpHost: form.smtpHost?.trim(), smtpPort: form.smtpPort || null,
                ...(form.password && { password: form.password }),
            };
            if (editing === 'new') await adminApi.addMailAccount({ ...input, email: form.email.trim() });
            else if (typeof editing === 'number') await adminApi.updateMailAccount(editing, input);
            pushToast({ kind: 'success', title: editing === 'new' ? 'Hesap eklendi' : 'Hesap güncellendi', description: editing === 'new' ? 'İletiler arka planda alınıyor.' : undefined, ttl: 5000 });
            setEditing(null);
            onChanged();
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    const remove = async (a: MailAccount) => {
        if (!window.confirm(`${a.email} hesabı panelden kaldırılsın mı? Buradaki kopyalar silinir; sunucudaki e-postalarınıza dokunulmaz.`)) return;
        try {
            await adminApi.deleteMailAccount(a.id);
            onChanged();
        } catch (e) {
            pushToast({ kind: 'error', title: 'Kaldırılamadı', description: errorText(e), ttl: 7000 });
        }
    };

    const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

    return (
        <Modal title="E-posta hesapları" onClose={onClose} width={620}>
            {!configured && <div style={{ marginBottom: 12 }}><ErrorBox>Sunucuda posta köprüsü tanımlı değil (MAIL_RELAY_URL / MAIL_RELAY_SECRET).</ErrorBox></div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {accounts.map((a) => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 12, background: editing === a.id ? C.soft : '#fff' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.86rem', color: C.text }}>{a.name ? `${a.name} · ` : ''}{a.email}</div>
                            <div style={{ fontSize: '0.74rem', color: a.last_error ? C.redText : C.dim }}>
                                {a.last_error ? a.last_error : `Sunucuda ${a.server_count ?? '?'} ileti · son eşitleme ${fmtDateTime(a.last_sync_at)}`}
                            </div>
                        </div>
                        <button type="button" onClick={() => startEdit(a)} style={btn('ghost', true)}><Pencil size={13} /> Düzenle</button>
                        <button type="button" onClick={() => void remove(a)} style={btn('danger', true)}><Trash2 size={13} /></button>
                    </div>
                ))}
                {!accounts.length && <Empty>Henüz hesap yok.</Empty>}
            </div>
            {editing === null ? (
                <button type="button" onClick={() => startEdit(null)} style={btn('primary')}><Plus size={14} /> Hesap ekle</button>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, border: `1px solid ${C.borderStrong}`, borderRadius: 14 }}>
                    <b style={{ fontSize: '0.9rem', color: C.text }}>{editing === 'new' ? 'Yeni hesap' : form.email}</b>
                    {editing === 'new' && (
                        <label><span style={labelStyle}>E-posta adresi</span>
                            <input value={form.email} onChange={(e) => set({ email: e.target.value })} type="email" autoComplete="off" placeholder="destek@edxdocu.com" style={inputStyle} />
                        </label>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <label><span style={labelStyle}>Gönderen adı</span>
                            <input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="edXdocu Destek" style={inputStyle} />
                        </label>
                        <label><span style={labelStyle}>{editing === 'new' ? 'Parola' : 'Yeni parola (değişmeyecekse boş)'}</span>
                            <input value={form.password} onChange={(e) => set({ password: e.target.value })} type="password" autoComplete="new-password" style={inputStyle} />
                        </label>
                    </div>
                    <label><span style={labelStyle}>İmza</span>
                        <textarea value={form.signature} onChange={(e) => set({ signature: e.target.value })} rows={3} placeholder={'Saygılarımızla,\nedXdocu · www.edxdocu.com'} style={{ ...inputStyle, resize: 'vertical' }} />
                    </label>
                    <button type="button" onClick={() => setAdvanced((v) => !v)} style={{ ...btn('ghost', true), alignSelf: 'flex-start' }}>
                        <Settings2 size={13} /> Sunucu ayarları {advanced ? '(gizle)' : '(isteğe bağlı)'}
                    </button>
                    {advanced && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 10 }}>
                            <label><span style={labelStyle}>POP3 sunucusu</span>
                                <input value={form.popHost} onChange={(e) => set({ popHost: e.target.value })} placeholder="mail.alanadi.com" style={inputStyle} />
                            </label>
                            <label><span style={labelStyle}>SMTP sunucusu</span>
                                <input value={form.smtpHost} onChange={(e) => set({ smtpHost: e.target.value })} placeholder="mail.alanadi.com" style={inputStyle} />
                            </label>
                            <label><span style={labelStyle}>SMTP portu</span>
                                <select value={form.smtpPort ?? ''} onChange={(e) => set({ smtpPort: e.target.value ? Number(e.target.value) : null })} style={inputStyle}>
                                    <option value="">587</option><option value="465">465</option><option value="25">25</option>
                                </select>
                            </label>
                        </div>
                    )}
                    <span style={{ fontSize: '0.74rem', color: C.dim }}>Boş bırakılırsa e-posta adresinin alan adındaki <b>mail.</b> sunucusu kullanılır. Parola şifrelenerek saklanır; kaydederken giriş denenir.</span>
                    {error && <ErrorBox>{error}</ErrorBox>}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" disabled={busy || (editing === 'new' && (!form.email || !form.password))} onClick={() => void save()}
                            style={{ ...btn('primary'), opacity: busy || (editing === 'new' && (!form.email || !form.password)) ? 0.55 : 1 }}>
                            {busy ? <Spinner size={14} color="white" /> : null} {busy ? 'Giriş deneniyor…' : 'Kaydet'}
                        </button>
                        <button type="button" onClick={() => setEditing(null)} style={btn('ghost')}>Vazgeç</button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

// ------------------------------------------------------------ yazma penceresi

interface Draft {
    accountId: number;
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    html: string;
    replyTo?: number;
    forwardOf?: { id: number; attachments: MailMessage['attachments'] };
}

const Composer: React.FC<{ accounts: MailAccount[]; draft: Draft; onClose: () => void; onSent: () => void }> = ({ accounts, draft, onClose, onSent }) => {
    const pushToast = useUiStore((s) => s.pushToast);
    const editorRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [accountId, setAccountId] = useState(draft.accountId);
    const [to, setTo] = useState(draft.to);
    const [cc, setCc] = useState(draft.cc);
    const [bcc, setBcc] = useState(draft.bcc);
    const [showCc, setShowCc] = useState(!!(draft.cc || draft.bcc));
    const [subject, setSubject] = useState(draft.subject);
    const [files, setFiles] = useState<{ filename: string; contentType: string; data: string; size: number }[]>([]);
    const [keepForwarded, setKeepForwarded] = useState(true);
    const [sending, setSending] = useState(false);

    useLayoutEffect(() => {
        if (editorRef.current) editorRef.current.innerHTML = draft.html;
    }, [draft.html]);

    const forwarded = draft.forwardOf?.attachments.filter((a) => !a.inline) ?? [];
    const totalSize = files.reduce((n, f) => n + f.size, 0) + (keepForwarded ? forwarded.reduce((n, a) => n + a.size, 0) : 0);

    const addFiles = async (list: FileList | null) => {
        if (!list?.length) return;
        try {
            const added = await Promise.all([...list].map(async (f) => ({ filename: f.name, contentType: f.type || 'application/octet-stream', data: await readAsBase64(f), size: f.size })));
            setFiles((prev) => [...prev, ...added]);
        } catch (e) {
            pushToast({ kind: 'error', title: 'Dosya eklenemedi', description: errorText(e), ttl: 6000 });
        }
    };

    const exec = (cmd: string, value?: string) => {
        editorRef.current?.focus();
        document.execCommand(cmd, false, value);
    };

    const send = async () => {
        if (!to.trim() && !cc.trim() && !bcc.trim()) return pushToast({ kind: 'error', title: 'Alıcı yazın', ttl: 4000 });
        if (totalSize > ATTACH_MAX) return pushToast({ kind: 'error', title: 'Ekler çok büyük', description: 'Toplam en fazla 4 MB olabilir.', ttl: 6000 });
        if (!subject.trim() && !window.confirm('Konu boş. Yine de gönderilsin mi?')) return;
        setSending(true);
        try {
            const r = await adminApi.sendMail({
                accountId, to, cc: showCc ? cc : '', bcc: showCc ? bcc : '', subject: subject.trim(), html: editorRef.current?.innerHTML ?? '',
                attachments: files.map(({ filename, contentType, data }) => ({ filename, contentType, data })),
                ...(draft.replyTo && { replyTo: draft.replyTo }),
                ...(draft.forwardOf && keepForwarded && forwarded.length && { forwardAttachmentsOf: draft.forwardOf.id }),
            });
            pushToast({ kind: r.warning ? 'info' : 'success', title: 'Gönderildi', description: r.warning, ttl: r.warning ? 10000 : 4000 });
            onSent();
        } catch (e) {
            pushToast({ kind: 'error', title: 'Gönderilemedi', description: errorText(e), ttl: 10000 });
        } finally {
            setSending(false);
        }
    };

    const tool = (icon: React.ReactNode, title: string, onClick: () => void) => (
        <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            style={{ ...btn('ghost', true), padding: '4px 7px', border: 'none' }}>{icon}</button>
    );

    return (
        <Modal title={draft.replyTo ? 'Yanıtla' : draft.forwardOf ? 'İlet' : 'Yeni ileti'} onClose={() => { if (window.confirm('Taslak silinsin mi?')) onClose(); }} width={760}
            actions={<button type="button" disabled={sending} onClick={() => void send()} style={{ ...btn('primary', true), opacity: sending ? 0.6 : 1 }}>
                {sending ? <Spinner size={13} color="white" /> : <Send size={13} />} Gönder
            </button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); void send(); } }}>
                <Row label="Kimden">
                    <select value={accountId} onChange={(e) => setAccountId(Number(e.target.value))} style={inputStyle}>
                        {accounts.map((a) => <option key={a.id} value={a.id}>{a.name ? `${a.name} <${a.email}>` : a.email}</option>)}
                    </select>
                </Row>
                <Row label="Kime" extra={!showCc && <button type="button" onClick={() => setShowCc(true)} style={{ ...btn('ghost', true), border: 'none' }}>Bilgi / Gizli</button>}>
                    <input value={to} onChange={(e) => setTo(e.target.value)} autoFocus={!draft.to} placeholder="ad@ornek.com, ikinci@ornek.com" style={inputStyle} />
                </Row>
                {showCc && <>
                    <Row label="Bilgi"><input value={cc} onChange={(e) => setCc(e.target.value)} style={inputStyle} /></Row>
                    <Row label="Gizli"><input value={bcc} onChange={(e) => setBcc(e.target.value)} style={inputStyle} /></Row>
                </>}
                <Row label="Konu"><input value={subject} onChange={(e) => setSubject(e.target.value)} autoFocus={!!draft.to && !draft.subject} style={inputStyle} /></Row>
                <div style={{ border: `1px solid ${C.borderStrong}`, borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: 2, padding: 4, borderBottom: `1px solid ${C.border}`, background: C.soft, flexWrap: 'wrap' }}>
                        {tool(<Bold size={14} />, 'Kalın', () => exec('bold'))}
                        {tool(<Italic size={14} />, 'İtalik', () => exec('italic'))}
                        {tool(<Underline size={14} />, 'Altı çizili', () => exec('underline'))}
                        {tool(<List size={14} />, 'Madde listesi', () => exec('insertUnorderedList'))}
                        {tool(<Link2 size={14} />, 'Bağlantı', () => { const url = window.prompt('Bağlantı adresi', 'https://'); if (url && /^(https?:|mailto:)/i.test(url)) exec('createLink', url); })}
                        <span style={{ flex: 1 }} />
                        {tool(<Paperclip size={14} />, 'Dosya ekle', () => fileRef.current?.click())}
                    </div>
                    <div ref={editorRef} contentEditable suppressContentEditableWarning autoFocus={!!draft.to && !!draft.subject}
                        style={{ minHeight: 240, maxHeight: '48vh', overflowY: 'auto', padding: 12, fontSize: '0.9rem', lineHeight: 1.55, color: C.text, outline: 'none', background: '#fff' }} />
                </div>
                <input ref={fileRef} type="file" multiple onChange={(e) => { void addFiles(e.target.files); e.target.value = ''; }} style={{ display: 'none' }} />
                {(files.length > 0 || forwarded.length > 0) && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {files.map((f, i) => (
                            <Badge key={`${f.filename}-${i}`} color={C.accent}>
                                <Paperclip size={11} /> {f.filename} · {fmtSize(f.size)}
                                <button type="button" onClick={() => setFiles((list) => list.filter((_, j) => j !== i))} title="Kaldır"
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', color: 'inherit' }}><X size={11} /></button>
                            </Badge>
                        ))}
                        {forwarded.length > 0 && (
                            <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: '0.78rem', color: C.muted }}>
                                <input type="checkbox" checked={keepForwarded} onChange={(e) => setKeepForwarded(e.target.checked)} />
                                Özgün ekleri de ilet ({forwarded.map((a) => a.filename).join(', ')})
                            </label>
                        )}
                        <span style={{ fontSize: '0.74rem', color: totalSize > ATTACH_MAX ? C.redText : C.dim }}>Toplam {fmtSize(totalSize)} / 4 MB</span>
                    </div>
                )}
                <span style={{ fontSize: '0.72rem', color: C.dim }}>Ctrl + Enter ile gönderebilirsiniz. Birden çok alıcıyı virgülle ayırın.</span>
            </div>
        </Modal>
    );
};

const Row: React.FC<{ label: string; children: React.ReactNode; extra?: React.ReactNode }> = ({ label, children, extra }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 52, flexShrink: 0, fontSize: '0.78rem', fontWeight: 700, color: C.muted }}>{label}</span>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        {extra}
    </div>
);

// ------------------------------------------------------------ okuma alanı

const MessageView: React.FC<{
    message: MailMessage;
    onReply: (all: boolean) => void;
    onForward: () => void;
    onAction: (action: MailAction) => void;
    onBack?: () => void;
}> = ({ message: m, onReply, onForward, onAction, onBack }) => {
    const pushToast = useUiStore((s) => s.pushToast);
    const [showImages, setShowImages] = useState(false);
    const hasRemote = !!m.html_body && /<img[^>]+src\s*=\s*["']?https?:/i.test(m.html_body);
    const files = m.attachments.filter((a) => !a.inline);

    const download = async (i: number, filename: string) => {
        try {
            const blob = await adminApi.mailAttachment(m.id, i);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 10_000);
        } catch (e) {
            pushToast({ kind: 'error', title: 'Ek indirilemedi', description: errorText(e), ttl: 6000 });
        }
    };

    const act = (icon: React.ReactNode, label: string, onClick: () => void, variant: 'ghost' | 'danger' = 'ghost') => (
        <button type="button" onClick={onClick} title={label} style={btn(variant, true)}>{icon}<span className="adm-mail-label">{label}</span></button>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                {onBack && act(<ArrowLeft size={13} />, 'Liste', onBack)}
                {m.folder !== 'trash' && <>
                    {act(<Reply size={13} />, 'Yanıtla', () => onReply(false))}
                    {act(<ReplyAll size={13} />, 'Tümünü yanıtla', () => onReply(true))}
                </>}
                {act(<Forward size={13} />, 'İlet', onForward)}
                {act(<Star size={13} fill={m.starred ? '#f59e0b' : 'none'} color={m.starred ? '#f59e0b' : 'currentColor'} />, m.starred ? 'Yıldızı kaldır' : 'Yıldızla', () => onAction(m.starred ? 'unstar' : 'star'))}
                {m.folder === 'inbox' && act(<MailOpen size={13} />, 'Okunmadı yap', () => onAction('unread'))}
                <span style={{ flex: 1 }} />
                {m.folder === 'trash'
                    ? <>{act(<RotateCcw size={13} />, 'Geri al', () => onAction('restore'))}{act(<Trash2 size={13} />, 'Kalıcı sil', () => onAction('purge'), 'danger')}</>
                    : act(<Trash2 size={13} />, 'Çöpe at', () => onAction('trash'), 'danger')}
            </div>
            <h2 style={{ margin: '14px 0 8px', fontSize: '1.12rem', fontWeight: 800, color: C.text, overflowWrap: 'anywhere' }}>{m.subject || '(konu yok)'}</h2>
            <div style={{ fontSize: '0.8rem', color: C.muted, display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
                <span><b style={{ color: C.text }}>{m.from_name || m.from_addr}</b>{m.from_name && <> &lt;{m.from_addr}&gt;</>}</span>
                {m.to_addrs.length > 0 && <span>Kime: {m.to_addrs.map(fmtAddr).join(', ')}</span>}
                {m.cc_addrs.length > 0 && <span>Bilgi: {m.cc_addrs.map(fmtAddr).join(', ')}</span>}
                {m.bcc_addrs.length > 0 && <span>Gizli: {m.bcc_addrs.map(fmtAddr).join(', ')}</span>}
                <span style={{ color: C.dim }}>{fmtDateTime(m.sent_at)} · {m.account_email}</span>
            </div>
            {files.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {files.map((a) => (
                        <button key={a.i} type="button" onClick={() => void download(a.i, a.filename)} style={btn('secondary', true)}>
                            <Download size={13} /> {a.filename} <span style={{ color: C.dim, fontWeight: 600 }}>{fmtSize(a.size)}</span>
                        </button>
                    ))}
                </div>
            )}
            {hasRemote && !showImages && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', marginBottom: 10, borderRadius: 10, background: C.soft, fontSize: '0.78rem', color: C.muted }}>
                    <ImageOff size={14} /> Gizliliğiniz için uzak görseller gösterilmedi.
                    <button type="button" onClick={() => setShowImages(true)} style={{ ...btn('ghost', true), marginLeft: 'auto' }}>Görselleri göster</button>
                </div>
            )}
            {m.html_body
                ? <HtmlFrame html={m.html_body} showImages={showImages} />
                : <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.55, color: C.text, overflowWrap: 'anywhere' }}>{m.text_body || ''}</div>}
        </div>
    );
};

// ------------------------------------------------------------ bölüm

export const Webmail: React.FC = () => {
    const pushToast = useUiStore((s) => s.pushToast);
    const narrow = useMediaQuery('(max-width: 1100px)');
    const [configured, setConfigured] = useState(true);
    const [accounts, setAccounts] = useState<MailAccount[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [account, setAccount] = useState<number | 'all'>('all');
    const [folder, setFolder] = useState<MailFolder>('inbox');
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [list, setList] = useState<MailListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState<Set<number>>(new Set());
    const [openId, setOpenId] = useState<number | null>(null);
    const [message, setMessage] = useState<MailMessage | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [manage, setManage] = useState(false);
    const [draft, setDraft] = useState<Draft | null>(null);
    const listLen = useRef(0);
    listLen.current = list.length;

    const loadAccounts = useCallback(async () => {
        try {
            const r = await adminApi.mailAccounts();
            setConfigured(r.configured);
            setAccounts(r.accounts);
            setError(null);
        } catch (e) {
            setError(errorText(e));
        }
    }, []);

    const loadList = useCallback(async (mode: 'reset' | 'more' | 'refresh') => {
        setLoading(mode !== 'refresh');
        try {
            const offset = mode === 'more' ? listLen.current : 0;
            const limit = mode === 'refresh' ? Math.min(100, Math.max(PAGE, listLen.current)) : PAGE;
            const r = await adminApi.mailMessages({ account, folder, q: query || undefined, offset, limit });
            setList((prev) => (mode === 'more' ? [...prev, ...r.messages] : r.messages));
            setTotal(r.total);
            if (mode === 'reset') setChecked(new Set());
        } catch (e) {
            if (mode !== 'refresh') pushToast({ kind: 'error', title: 'İletiler alınamadı', description: errorText(e), ttl: 6000 });
        } finally {
            setLoading(false);
        }
    }, [account, folder, query, pushToast]);

    useEffect(() => { void loadAccounts(); }, [loadAccounts]);
    useEffect(() => { void loadList('reset'); }, [loadList]);
    useEffect(() => {
        const t = setTimeout(() => setQuery(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);
    useEffect(() => {
        const t = setInterval(() => {
            if (document.hidden) return;
            void loadAccounts();
            void loadList('refresh');
        }, 60_000);
        return () => clearInterval(t);
    }, [loadAccounts, loadList]);

    const open = async (id: number) => {
        setOpenId(id);
        setMessage(null);
        try {
            const m = await adminApi.mailMessage(id);
            setMessage(m);
            setList((prev) => prev.map((x) => (x.id === id ? { ...x, seen: true } : x)));
            setAccounts((prev) => prev?.map((a) => (a.id === m.account_id && !list.find((x) => x.id === id)?.seen && m.folder === 'inbox' ? { ...a, unread: Math.max(0, a.unread - 1) } : a)) ?? prev);
        } catch (e) {
            pushToast({ kind: 'error', title: 'İleti açılamadı', description: errorText(e), ttl: 6000 });
            setOpenId(null);
        }
    };

    const runAction = async (ids: number[], action: MailAction) => {
        if (!ids.length) return;
        let server = false;
        if (action === 'purge') {
            if (!window.confirm(`${ids.length} ileti kalıcı olarak silinsin mi?`)) return;
            server = window.confirm('Posta sunucusundan da silinsin mi?\n\nTamam: sunucudan da sil (telefon ve diğer programlardan da kalkar)\nİptal: yalnız bu panelden sil');
        }
        try {
            const r = await adminApi.mailAction(ids, action, server);
            if (r.warning) pushToast({ kind: 'info', title: 'Kısmen tamamlandı', description: r.warning, ttl: 9000 });
            const leaves = action === 'trash' || action === 'restore' || action === 'purge' || (action === 'unstar' && folder === 'starred') || (action === 'read' && folder === 'unread');
            if (leaves && openId && ids.includes(openId)) { setOpenId(null); setMessage(null); }
            if (!leaves && message && ids.includes(message.id)) {
                setMessage({ ...message, seen: action === 'read' ? true : action === 'unread' ? false : message.seen, starred: action === 'star' ? true : action === 'unstar' ? false : message.starred });
                if (action === 'unread') { setOpenId(null); setMessage(null); }
            }
            setChecked(new Set());
            await Promise.all([loadList('refresh'), loadAccounts()]);
        } catch (e) {
            pushToast({ kind: 'error', title: 'İşlem yapılamadı', description: errorText(e), ttl: 7000 });
        }
    };

    const sync = async () => {
        if (!accounts?.length) return;
        setSyncing(true);
        let fetched = 0;
        const errors: string[] = [];
        for (const a of accounts.filter((x) => account === 'all' || x.id === account)) {
            try {
                fetched += (await adminApi.syncMailAccount(a.id)).fetched;
            } catch (e) {
                errors.push(`${a.email}: ${errorText(e)}`);
            }
        }
        setSyncing(false);
        if (errors.length) pushToast({ kind: 'error', title: 'Bazı hesaplar alınamadı', description: errors.join('\n'), ttl: 10000 });
        else pushToast({ kind: 'success', title: fetched ? `${fetched} yeni ileti` : 'Yeni ileti yok', ttl: 3000 });
        await Promise.all([loadAccounts(), loadList('refresh')]);
    };

    const defaultAccount = () => (account !== 'all' ? account : accounts?.[0]?.id ?? 0);
    const accountById = (id: number) => accounts?.find((a) => a.id === id);

    const compose = () => {
        const id = defaultAccount();
        setDraft({ accountId: id, to: '', cc: '', bcc: '', subject: '', html: `<div><br></div>${signatureHtml(accountById(id)?.signature ?? '')}` });
    };

    const quote = (m: MailMessage, heading: string) => {
        const body = m.html_body ? cleanHtml(m.html_body) : textToHtml(m.text_body ?? '');
        return `<div style="color:#555">${heading}</div><blockquote style="margin:0 0 0 .8ex;border-left:2px solid #c7c9e8;padding-left:1ex">${body}</blockquote>`;
    };

    const reply = (all: boolean) => {
        if (!message) return;
        const own = accountById(message.account_id)?.email ?? '';
        const sender = message.folder === 'sent' ? message.to_addrs : [{ name: message.from_name, address: message.reply_to || message.from_addr }];
        const others = all ? [...message.to_addrs, ...message.cc_addrs] : [];
        const seen = new Set<string>([own]);
        const uniq = (xs: MailAddress[]) => xs.filter((x) => x.address && !seen.has(x.address) && seen.add(x.address)).map(fmtAddr);
        const to = uniq(sender);
        const cc = uniq(others);
        const sig = signatureHtml(accountById(message.account_id)?.signature ?? '');
        setDraft({
            accountId: message.account_id,
            to: to.join(', '),
            cc: cc.join(', '),
            bcc: '',
            subject: /^(re|ynt|yanıt)\s*:/i.test(message.subject) ? message.subject : `Re: ${message.subject}`,
            html: `<div><br></div>${sig}<br>${quote(message, `${fmtDateTime(message.sent_at)} tarihinde ${escapeHtml(message.from_name || message.from_addr)} yazdı:`)}`,
            replyTo: message.id,
        });
    };

    const forward = () => {
        if (!message) return;
        const head = [
            '---------- İletilen ileti ----------',
            `Kimden: ${fmtAddr({ name: message.from_name, address: message.from_addr })}`,
            `Tarih: ${fmtDateTime(message.sent_at)}`,
            `Konu: ${message.subject}`,
            message.to_addrs.length ? `Kime: ${message.to_addrs.map(fmtAddr).join(', ')}` : '',
        ].filter(Boolean).map(escapeHtml).join('<br>');
        setDraft({
            accountId: message.account_id, to: '', cc: '', bcc: '',
            subject: /^(fwd?|ilt)\s*:/i.test(message.subject) ? message.subject : `Fwd: ${message.subject}`,
            html: `<div><br></div>${signatureHtml(accountById(message.account_id)?.signature ?? '')}<br>${quote(message, head)}`,
            forwardOf: { id: message.id, attachments: message.attachments },
        });
    };

    const totalUnread = accounts?.reduce((n, a) => n + a.unread, 0) ?? 0;
    const allChecked = list.length > 0 && list.every((m) => checked.has(m.id));
    const checkedIds = [...checked];
    const showList = !narrow || openId === null;
    const showReader = !narrow || openId !== null;

    if (!accounts) {
        return error ? <ErrorBox>{error}</ErrorBox> : <div style={{ display: 'flex', gap: 8, color: C.muted }}><Spinner /> Yükleniyor…</div>;
    }

    const navItem = (active: boolean, onClick: () => void, children: React.ReactNode, key?: string | number) => (
        <button key={key} type="button" onClick={onClick} className="adm-nav-btn" style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: active ? 800 : 600, textAlign: 'left',
            background: active ? 'rgba(99,102,241,0.12)' : 'transparent', color: active ? C.accentText : C.text,
        }}>{children}</button>
    );

    const sidebar = (
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <button type="button" disabled={!accounts.length} onClick={compose} style={{ ...btn('primary'), marginBottom: 10, opacity: accounts.length ? 1 : 0.55 }}><Pencil size={14} /> Yeni ileti</button>
            <span style={{ ...labelStyle, margin: '4px 10px' }}>Hesaplar</span>
            {navItem(account === 'all', () => { setAccount('all'); setOpenId(null); }, <>
                <Inbox size={15} /><span style={{ flex: 1 }}>Tüm hesaplar</span>{totalUnread > 0 && <Badge color={C.accent} solid>{totalUnread}</Badge>}
            </>)}
            {accounts.map((a) => navItem(account === a.id, () => { setAccount(a.id); setOpenId(null); }, <>
                {a.last_error ? <span title={a.last_error} style={{ display: 'inline-flex' }}><AlertTriangle size={14} color={C.red} /></span> : <Mail size={14} />}
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.email}>{a.email}</span>
                {a.unread > 0 && <Badge color={C.accent} solid>{a.unread}</Badge>}
            </>, a.id))}
            <button type="button" onClick={() => setManage(true)} style={{ ...btn('ghost', true), margin: '4px 0 10px', justifyContent: 'flex-start' }}><Settings2 size={13} /> Hesapları yönet</button>
            <span style={{ ...labelStyle, margin: '4px 10px' }}>Klasörler</span>
            {FOLDERS.map((f) => navItem(folder === f.id, () => { setFolder(f.id); setOpenId(null); }, <>{f.icon}<span>{f.label}</span></>, f.id))}
        </aside>
    );

    return (
        <div data-admin-section="webmail">
            <style>{'.adm-mail-row:hover { background: #f7f7ff !important; } @media (max-width: 1400px) { .adm-mail-label { display: none; } }'}</style>
            <SectionHeader icon={<Inbox size={20} />} title="E-posta"
                subtitle="Hostingdeki e-posta hesaplarınız tek yerde: gelen postalar birkaç dakikada bir kendiliğinden alınır, buradan yanıtlar ve yeni ileti gönderirsiniz."
                actions={<button type="button" disabled={syncing || !accounts.length} onClick={() => void sync()} style={btn('secondary', true)}>
                    {syncing ? <Spinner size={13} /> : <RefreshCw size={13} />} {syncing ? 'Alınıyor…' : 'Postaları al'}
                </button>} />
            {!configured && <div style={{ marginBottom: 12 }}><ErrorBox>Sunucuda posta köprüsü tanımlı değil; hesap eklenemez.</ErrorBox></div>}
            {!accounts.length ? (
                <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 30, textAlign: 'center' }}>
                    <Inbox size={36} color={C.accent} />
                    <h3 style={{ margin: '10px 0 6px', color: C.text }}>Henüz e-posta hesabı eklenmedi</h3>
                    <p style={{ margin: '0 0 16px', color: C.muted, fontSize: '0.86rem' }}>Hostingde tanımlı adreslerinizi (ör. destek@, info@) parolalarıyla ekleyin.</p>
                    <button type="button" onClick={() => setManage(true)} style={btn('primary')}><Plus size={14} /> Hesap ekle</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '210px minmax(300px, 380px) 1fr', gap: 14, alignItems: 'start' }}>
                    {narrow ? (openId === null && <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 10 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button type="button" onClick={compose} style={btn('primary', true)}><Pencil size={13} /> Yeni ileti</button>
                            <select value={account} onChange={(e) => setAccount(e.target.value === 'all' ? 'all' : Number(e.target.value))} style={{ ...inputStyle, width: 'auto', flex: 1, minWidth: 160 }}>
                                <option value="all">Tüm hesaplar{totalUnread ? ` (${totalUnread})` : ''}</option>
                                {accounts.map((a) => <option key={a.id} value={a.id}>{a.email}{a.unread ? ` (${a.unread})` : ''}</option>)}
                            </select>
                            <select value={folder} onChange={(e) => setFolder(e.target.value as MailFolder)} style={{ ...inputStyle, width: 'auto' }}>
                                {FOLDERS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                            </select>
                            <button type="button" onClick={() => setManage(true)} style={btn('ghost', true)} title="Hesapları yönet"><Settings2 size={13} /></button>
                        </div>
                    </div>) : sidebar}

                    {showList && (
                        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: narrow ? undefined : 'calc(100vh - 190px)' }}>
                            <div style={{ padding: 10, borderBottom: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={14} color={C.dim} style={{ position: 'absolute', left: 10, top: 11 }} />
                                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Konu, kişi ya da içerikte ara" style={{ ...inputStyle, paddingLeft: 30 }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minHeight: 28 }}>
                                    <input type="checkbox" checked={allChecked} title="Tümünü seç"
                                        onChange={() => setChecked(allChecked ? new Set() : new Set(list.map((m) => m.id)))} />
                                    {checked.size > 0 ? <>
                                        <span style={{ fontSize: '0.76rem', color: C.muted, fontWeight: 700 }}>{checked.size} seçili</span>
                                        {folder === 'trash' ? <>
                                            <button type="button" onClick={() => void runAction(checkedIds, 'restore')} style={btn('ghost', true)} title="Geri al"><RotateCcw size={13} /></button>
                                            <button type="button" onClick={() => void runAction(checkedIds, 'purge')} style={btn('danger', true)} title="Kalıcı sil"><Trash2 size={13} /></button>
                                        </> : <>
                                            <button type="button" onClick={() => void runAction(checkedIds, 'read')} style={btn('ghost', true)} title="Okundu yap"><MailOpen size={13} /></button>
                                            <button type="button" onClick={() => void runAction(checkedIds, 'unread')} style={btn('ghost', true)} title="Okunmadı yap"><Mail size={13} /></button>
                                            <button type="button" onClick={() => void runAction(checkedIds, 'star')} style={btn('ghost', true)} title="Yıldızla"><Star size={13} /></button>
                                            <button type="button" onClick={() => void runAction(checkedIds, 'trash')} style={btn('danger', true)} title="Çöpe at"><Trash2 size={13} /></button>
                                        </>}
                                    </> : <span style={{ fontSize: '0.76rem', color: C.dim }}>{total} ileti</span>}
                                </div>
                            </div>
                            <div className="adm-scroll" style={{ overflowY: 'auto', flex: 1 }}>
                                {loading && !list.length ? <div style={{ padding: 20, display: 'flex', gap: 8, color: C.muted }}><Spinner /> Yükleniyor…</div>
                                    : !list.length ? <Empty>{query ? 'Aramayla eşleşen ileti yok.' : 'Bu klasör boş.'}</Empty>
                                    : list.map((m) => {
                                        const who = m.folder === 'sent' ? `Kime: ${m.to_addrs.map((a) => a.name || a.address).join(', ')}` : m.from_name || m.from_addr || '(gönderen yok)';
                                        const active = openId === m.id;
                                        return (
                                            <div key={m.id} className="adm-mail-row" onClick={() => void open(m.id)} style={{
                                                display: 'flex', gap: 8, padding: '9px 10px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer',
                                                background: active ? 'rgba(99,102,241,0.1)' : m.seen ? '#fff' : '#fbfbff',
                                                borderLeft: `3px solid ${m.seen ? 'transparent' : C.accent}`,
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 2 }} onClick={(e) => e.stopPropagation()}>
                                                    <input type="checkbox" checked={checked.has(m.id)} onChange={() => setChecked((s) => { const n = new Set(s); if (n.has(m.id)) n.delete(m.id); else n.add(m.id); return n; })} />
                                                    <button type="button" title={m.starred ? 'Yıldızı kaldır' : 'Yıldızla'} onClick={() => void runAction([m.id], m.starred ? 'unstar' : 'star')}
                                                        style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex' }}>
                                                        <Star size={14} color={m.starred ? '#f59e0b' : '#c3c6dc'} fill={m.starred ? '#f59e0b' : 'none'} />
                                                    </button>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                                                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.84rem', fontWeight: m.seen ? 600 : 800, color: C.text }}>{who}</span>
                                                        {m.has_attachments && <Paperclip size={12} color={C.dim} />}
                                                        <span style={{ fontSize: '0.72rem', color: m.seen ? C.dim : C.accentText, fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtShort(m.sent_at)}</span>
                                                    </div>
                                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', fontWeight: m.seen ? 500 : 800, color: C.text }}>{m.subject || '(konu yok)'}</div>
                                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.76rem', color: C.dim }}>{m.snippet}</div>
                                                    {account === 'all' && accounts.length > 1 && <div style={{ fontSize: '0.68rem', color: C.dim, marginTop: 2 }}>{m.account_email}</div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                {list.length < total && (
                                    <div style={{ padding: 10, textAlign: 'center' }}>
                                        <button type="button" disabled={loading} onClick={() => void loadList('more')} style={btn('ghost', true)}>{loading ? <Spinner size={13} /> : null} Daha fazla</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {showReader && (
                        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, minWidth: 0, minHeight: narrow ? undefined : 'calc(100vh - 190px)' }}>
                            {openId === null ? (
                                <div style={{ height: '100%', minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: C.dim }}>
                                    <MailOpen size={34} />
                                    <span style={{ fontSize: '0.86rem' }}>Okumak için bir ileti seçin</span>
                                </div>
                            ) : !message ? (
                                <div style={{ display: 'flex', gap: 8, color: C.muted }}><Spinner /> Açılıyor…</div>
                            ) : (
                                <MessageView key={message.id} message={message} onReply={reply} onForward={forward}
                                    onAction={(a) => void runAction([message.id], a)} onBack={narrow ? () => { setOpenId(null); setMessage(null); } : undefined} />
                            )}
                        </div>
                    )}
                </div>
            )}
            {manage && <AccountsModal accounts={accounts} configured={configured} onClose={() => setManage(false)} onChanged={() => { void loadAccounts(); void loadList('refresh'); }} />}
            {draft && accounts.length > 0 && (
                <Composer accounts={accounts} draft={draft} onClose={() => setDraft(null)}
                    onSent={() => { setDraft(null); void loadList('refresh'); }} />
            )}
        </div>
    );
};
