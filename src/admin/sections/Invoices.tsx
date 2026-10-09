import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Check, Copy, FileText, Mail, MapPin, Pencil, Phone, Receipt, RefreshCw, RotateCcw, Search, X } from 'lucide-react';
import { INVOICE_NOTE_MAX, INVOICE_NUMBER_RE, istanbulDate, parseBilling } from '../../../shared/invoice-billing.js';
import { adminApi } from '../adminApi';
import type { AdminInvoice, InvoiceDocumentMode, InvoicePartyType, InvoiceScope } from '../contracts';
import { C, btn, errorText, fmtDateTime, fmtMoney, inputStyle, labelStyle } from '../format';
import { useDebounced } from '../hooks';
import { Badge, Card, Drawer, Empty, ErrorBox, SectionHeader, Spinner } from '../ui';

const PLAN_NAME: Record<string, string> = { one: 'One', basic: 'Basic', pro: 'Pro' };

const SCOPES: { id: InvoiceScope; label: string }[] = [
    { id: 'ready', label: 'Kesime hazır' },
    { id: 'issued', label: 'Kesildi' },
    { id: 'missing', label: 'Bilgi eksik' },
    { id: 'all', label: 'Tümü' },
];

const DOCUMENT_MODES: { id: InvoiceDocumentMode; label: string; hint: string }[] = [
    { id: 'auto', label: 'Otomatik', hint: 'Tüzel kişiye e-Fatura, şahsa e-Arşiv. Kesimde EDM ile alıcının e-Fatura mükellefiyeti kontrol edilir.' },
    { id: 'EFATURA', label: 'e-Fatura', hint: 'Alıcı e-Fatura mükellefi. Kesimde EDM ile yine doğrulanır; değilse e-Arşiv kesilir.' },
    { id: 'EARSIV', label: 'e-Arşiv', hint: 'Alıcı e-Fatura mükellefi değil; doğrudan e-Arşiv kesilir.' },
];

const docLabel = (row: AdminInvoice) => {
    const preferred = row.draft?.document.preferred;
    if (preferred === 'EARSIV') return { label: 'e-Arşiv', color: C.sky };
    if (preferred === 'EFATURA') return { label: 'e-Fatura', color: C.accent };
    return { label: 'Taslak yok', color: C.dim };
};

const statusLabel = (row: AdminInvoice) => {
    if (!row.billing) return { label: 'Bilgi eksik', color: C.red };
    if (row.invoice_status === 'issued') return { label: 'Kesildi', color: C.green };
    return { label: 'Kesime hazır', color: C.amber };
};

const fmtIsoDate = (iso: string | undefined) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : '—');

const CopyValue: React.FC<{ label: string; value: string | null | undefined; icon?: React.ReactNode }> = ({ label, value, icon }) => {
    const [copied, setCopied] = useState(false);
    const text = value?.trim() || '';
    const copy = () => {
        if (!text) return;
        navigator.clipboard?.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        }).catch(() => {});
    };
    return (
        <button type="button" onClick={copy} disabled={!text} title={text ? 'Kopyala' : undefined}
            style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 12, background: C.soft, border: `1px solid ${C.border}`, textAlign: 'left', cursor: text ? 'pointer' : 'default', fontFamily: 'inherit', minWidth: 0 }}>
            {icon && <span style={{ color: C.accent, display: 'flex' }}>{icon}</span>}
            <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.68rem', color: C.dim, fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: '0.86rem', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text || '—'}</div>
            </div>
            {text && <span style={{ color: copied ? C.green : C.dim, display: 'flex' }}>{copied ? <Check size={14} /> : <Copy size={14} />}</span>}
        </button>
    );
};

interface FormState {
    partyType: InvoicePartyType;
    title: string;
    taxId: string;
    taxOffice: string;
    city: string;
    address: string;
    documentMode: InvoiceDocumentMode;
    issueDate: string;
    note: string;
}

const formFrom = (row: AdminInvoice): FormState => ({
    partyType: row.billing?.partyType ?? 'company',
    title: row.billing?.title ?? row.full_name ?? '',
    taxId: row.billing?.taxId ?? '',
    taxOffice: row.billing?.taxOffice ?? '',
    city: row.billing?.city ?? '',
    address: row.billing?.address ?? '',
    documentMode: row.draft?.document.mode ?? 'auto',
    issueDate: row.draft?.issueDate ?? istanbulDate(),
    note: row.draft?.notes?.[0] ?? '',
});

const InvoiceForm: React.FC<{ row: AdminInvoice; onSaved: (row: AdminInvoice) => void; onCancel?: () => void }> = ({ row, onSaved, onCancel }) => {
    const [form, setForm] = useState<FormState>(() => formFrom(row));
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => { setForm(f => ({ ...f, [key]: value })); setError(null); };
    const sole = form.partyType === 'sole';
    const today = istanbulDate();

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        const { documentMode, issueDate, note, ...billing } = form;
        const parsed = parseBilling(billing);
        if ('error' in parsed) return setError(parsed.error);
        if (!issueDate || issueDate > today) return setError('Fatura tarihi bugünden ileri olamaz.');
        setSaving(true);
        try {
            onSaved(await adminApi.updateInvoice(row.id, { billing, documentMode, issueDate, note }));
        } catch (err) {
            setError(errorText(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form data-admin-invoice-form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
                {(['company', 'sole'] as const).map(id => (
                    <button key={id} type="button" data-invoice-party={id} onClick={() => setForm(f => ({ ...f, partyType: id, taxId: f.partyType === id ? f.taxId : '' }))}
                        style={btn(form.partyType === id ? 'primary' : 'secondary', true)}>
                        {id === 'company' ? 'Tüzel kişi (VKN)' : 'Şahıs firması (T.C.)'}
                    </button>
                ))}
            </div>
            <label>
                <span style={labelStyle}>{sole ? 'Ad soyad / firma ünvanı' : 'Firma ünvanı'}</span>
                <input data-invoice-title value={form.title} onChange={e => set('title', e.target.value)} maxLength={160} style={inputStyle} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                <label>
                    <span style={labelStyle}>{sole ? 'T.C. kimlik no (11 hane)' : 'Vergi numarası (10 hane)'}</span>
                    <input data-invoice-taxid value={form.taxId} inputMode="numeric" maxLength={sole ? 11 : 10}
                        onChange={e => set('taxId', e.target.value.replace(/\D/g, ''))} style={{ ...inputStyle, fontVariantNumeric: 'tabular-nums' }} />
                </label>
                <label>
                    <span style={labelStyle}>Vergi dairesi</span>
                    <input data-invoice-office value={form.taxOffice} onChange={e => set('taxOffice', e.target.value)} maxLength={80} style={inputStyle} />
                </label>
                <label>
                    <span style={labelStyle}>İl</span>
                    <input data-invoice-city value={form.city} onChange={e => set('city', e.target.value)} maxLength={40} style={inputStyle} />
                </label>
            </div>
            <label>
                <span style={labelStyle}>Adres</span>
                <input data-invoice-address value={form.address} onChange={e => set('address', e.target.value)} maxLength={240} style={inputStyle} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                <label>
                    <span style={labelStyle}>Belge türü</span>
                    <select data-invoice-document value={form.documentMode} onChange={e => set('documentMode', e.target.value as InvoiceDocumentMode)} style={inputStyle}>
                        {DOCUMENT_MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                </label>
                <label>
                    <span style={labelStyle}>Fatura tarihi</span>
                    <input data-invoice-date type="date" value={form.issueDate} max={today} onChange={e => set('issueDate', e.target.value)} style={inputStyle} />
                </label>
            </div>
            <div style={{ fontSize: '0.78rem', color: C.muted, lineHeight: 1.5, marginTop: -4 }}>
                {DOCUMENT_MODES.find(m => m.id === form.documentMode)?.hint}
            </div>
            <label>
                <span style={labelStyle}>Fatura notu (isteğe bağlı)</span>
                <textarea data-invoice-note value={form.note} onChange={e => set('note', e.target.value)} maxLength={INVOICE_NOTE_MAX} rows={2}
                    style={{ ...inputStyle, resize: 'vertical' }} />
            </label>
            {error && <ErrorBox>{error}</ErrorBox>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {onCancel && <button type="button" onClick={onCancel} style={btn('ghost')} disabled={saving}>Vazgeç</button>}
                <button type="submit" data-invoice-save style={btn('primary')} disabled={saving}>
                    {saving ? <Spinner size={14} color="white" /> : <Check size={15} />} Kaydet ve taslağı yenile
                </button>
            </div>
        </form>
    );
};

const IssueCard: React.FC<{ row: AdminInvoice; onSaved: (row: AdminInvoice) => void }> = ({ row, onSaved }) => {
    const [number, setNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const run = async (status: 'issued' | 'ready') => {
        if (status === 'issued' && !INVOICE_NUMBER_RE.test(number)) {
            return setError('Fatura numarası 16 karakter olmalı: 3 harf/rakam seri + yıl + 9 hane sıra (ör. EDX2026000000001).');
        }
        setBusy(true);
        setError(null);
        try {
            onSaved(await adminApi.setInvoiceStatus(row.id, status, status === 'issued' ? number : undefined));
            setNumber('');
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    if (row.invoice_status === 'issued') {
        return (
            <Card title="EDM kesimi" pad>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: '0.68rem', color: C.dim, fontWeight: 700 }}>Fatura numarası</div>
                        <div data-invoice-number style={{ fontWeight: 800, color: C.greenText, fontVariantNumeric: 'tabular-nums' }}>{row.invoice_number}</div>
                        <div style={{ fontSize: '0.76rem', color: C.muted }}>{fmtDateTime(row.invoice_issued_at)} tarihinde kesildi olarak işaretlendi.</div>
                    </div>
                    <button type="button" data-invoice-reopen onClick={() => run('ready')} style={btn('secondary', true)} disabled={busy}>
                        {busy ? <Spinner size={14} /> : <RotateCcw size={14} />} Kesime geri al
                    </button>
                </div>
                {error && <div style={{ marginTop: 10 }}><ErrorBox>{error}</ErrorBox></div>}
            </Card>
        );
    }

    return (
        <Card title="EDM kesimi" pad>
            <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: C.muted, lineHeight: 1.5 }}>
                EDM bağlantısı kurulana kadar faturayı EDM portalından bu taslaktaki bilgilerle kesin, sonra numarasını buraya girin.
                Bağlantı kurulduğunda bu adım bu ekrandan otomatik yapılacak.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input data-invoice-number-input value={number} placeholder="EDX2026000000001" maxLength={16}
                    onChange={e => { setNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setError(null); }}
                    style={{ ...inputStyle, flex: '1 1 200px', width: 'auto', fontVariantNumeric: 'tabular-nums', letterSpacing: 0.5 }} />
                <button type="button" data-invoice-issue onClick={() => run('issued')} style={btn('success')} disabled={busy || !number}>
                    {busy ? <Spinner size={14} /> : <Check size={15} />} Kesildi olarak işaretle
                </button>
            </div>
            {error && <div style={{ marginTop: 10 }}><ErrorBox>{error}</ErrorBox></div>}
        </Card>
    );
};

const InvoiceDetail: React.FC<{ row: AdminInvoice; onClose: () => void; onSaved: (row: AdminInvoice) => void }> = ({ row, onClose, onSaved }) => {
    const draft = row.draft;
    const billing = row.billing;
    const doc = docLabel(row);
    const status = statusLabel(row);
    const sole = billing?.partyType === 'sole';
    const issued = row.invoice_status === 'issued';
    const [editing, setEditing] = useState(!billing);

    const saved = (next: AdminInvoice) => {
        setEditing(false);
        onSaved(next);
    };

    return (
        <Drawer onClose={onClose} width={680} title={
            <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{billing?.title || row.full_name || row.username}</div>
                <div style={{ fontSize: '0.76rem', color: C.muted }}>
                    {billing ? `${sole ? 'Şahıs firması' : 'Tüzel kişi'} · ${billing.scheme} ${billing.taxId}` : 'Fatura bilgisi girilmemiş'}
                </div>
            </div>
        }>
            <div data-admin-invoice={row.id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Badge color={status.color}>{status.label}</Badge>
                    {draft && <Badge color={doc.color}>{doc.label}</Badge>}
                    <Badge color={C.green}>{PLAN_NAME[row.plan_id] || row.plan_id}</Badge>
                    <span style={{ fontSize: '0.8rem', color: C.muted }}>{fmtMoney(row.amount)} · {fmtDateTime(row.paid_at)}</span>
                    {!editing && !issued && (
                        <button type="button" data-invoice-edit onClick={() => setEditing(true)} style={{ ...btn('secondary', true), marginLeft: 'auto' }}>
                            <Pencil size={13} /> Düzenle
                        </button>
                    )}
                </div>

                {editing ? (
                    <Card title={billing ? 'Fatura bilgilerini düzenle' : 'Fatura bilgilerini girin'} pad>
                        {!billing && (
                            <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: C.muted, lineHeight: 1.5 }}>
                                Bu ödeme fatura bilgisi alınmadan yapılmış. Bilgileri müşteriden alıp girin; taslak oluşur ve kesime hazır olur.
                            </p>
                        )}
                        <InvoiceForm row={row} onSaved={saved} onCancel={billing ? () => setEditing(false) : undefined} />
                    </Card>
                ) : billing && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                        <CopyValue icon={<Building2 size={15} />} label="Ünvan" value={billing.title} />
                        <CopyValue icon={<FileText size={15} />} label={sole ? 'T.C. kimlik no' : 'Vergi numarası'} value={billing.taxId} />
                        <CopyValue icon={<Receipt size={15} />} label="Vergi dairesi" value={billing.taxOffice} />
                        <CopyValue icon={<MapPin size={15} />} label="Adres" value={[billing.address !== billing.city ? billing.address : '', billing.city].filter(Boolean).join(', ')} />
                        <CopyValue icon={<Mail size={15} />} label="E-posta" value={row.username} />
                        <CopyValue icon={<Phone size={15} />} label="Telefon" value={row.phone_number || draft?.customer.phone} />
                    </div>
                )}

                {draft && (
                    <Card title="Fatura satırı" pad>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="adm-table">
                                <thead>
                                    <tr><th>Hizmet</th><th style={{ textAlign: 'right' }}>Matrah</th><th style={{ textAlign: 'right' }}>KDV %{draft.totals.vatRate}</th><th style={{ textAlign: 'right' }}>Toplam</th></tr>
                                </thead>
                                <tbody>
                                    {draft.lines.map(line => (
                                        <tr key={line.id}>
                                            <td>
                                                <div style={{ fontWeight: 700 }}>{line.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: C.muted }}>{line.description} · {line.quantity} adet</div>
                                            </td>
                                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(line.lineExtension)}</td>
                                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(line.vatAmount)}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(draft.totals.payable)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ marginTop: 12, fontSize: '0.8rem', color: C.muted, lineHeight: 1.5 }}>
                            Satış fiyatı KDV dahildir. Belge türü {doc.label} ({draft.document.profileId}), senaryo satış, fatura tarihi {fmtIsoDate(draft.issueDate)}.
                            {draft.document.checkUserBeforeSend ? ' Kesimden önce EDM ile alıcının e-Fatura mükellefi olup olmadığı doğrulanır; değilse e-Arşiv kesilir.' : ''}
                        </div>
                        {draft.notes?.[0] && (
                            <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 10, background: C.soft, fontSize: '0.82rem', color: C.text }}>
                                <b>Not:</b> {draft.notes[0]}
                            </div>
                        )}
                    </Card>
                )}

                {draft && <IssueCard row={row} onSaved={onSaved} />}

                {draft && (
                    <Card title="EDM kesim alanları" pad>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                            <CopyValue label="Alıcı VKN / TCKN" value={draft.edm.receiverVkn} />
                            <CopyValue label="Senaryo" value={draft.document.profileId} />
                            <CopyValue label="Fatura tipi" value={draft.document.invoiceTypeCode} />
                            <CopyValue label="Matrah" value={draft.totals.taxExclusive.toFixed(2)} />
                            <CopyValue label={`KDV %${draft.totals.vatRate}`} value={draft.totals.vat.toFixed(2)} />
                            <CopyValue label="Ödenecek" value={draft.totals.payable.toFixed(2)} />
                            <CopyValue label="Ödeme şekli" value={draft.payment.channel} />
                            <CopyValue label="Ödeme aracısı" value={draft.payment.agent} />
                            <CopyValue label="Sipariş no" value={draft.payment.merchantOid || row.merchant_oid} />
                            <CopyValue label="Web sitesi" value={draft.payment.website} />
                        </div>
                        <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: C.muted, lineHeight: 1.5 }}>
                            {draft.supplier.note} İnternet satışı olarak kesilir. Alanlara tıklayınca kopyalanır.
                        </p>
                    </Card>
                )}
            </div>
        </Drawer>
    );
};

export const Invoices: React.FC = () => {
    const [scope, setScope] = useState<InvoiceScope>('ready');
    const [query, setQuery] = useState('');
    const q = useDebounced(query.trim().toLocaleLowerCase('tr'), 250);
    const [rows, setRows] = useState<AdminInvoice[] | null>(null);
    const [missing, setMissing] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const [selected, setSelected] = useState<number | null>(null);
    const requestKey = `${scope}:${reloadKey}`;
    const loading = loadedKey !== requestKey;

    useEffect(() => {
        let alive = true;
        adminApi.invoices(scope)
            .then(r => { if (alive) { setRows(r.items); setMissing(r.paidWithoutBilling); setError(null); } })
            .catch(e => { if (alive) setError(errorText(e)); })
            .finally(() => { if (alive) setLoadedKey(`${scope}:${reloadKey}`); });
        return () => { alive = false; };
    }, [scope, reloadKey]);

    const list = useMemo(() => (rows ?? []).filter(row => {
        if (!q) return true;
        const hay = `${row.billing?.title || ''} ${row.billing?.taxId || ''} ${row.invoice_number || ''} ${row.username} ${row.full_name || ''}`.toLocaleLowerCase('tr');
        return hay.includes(q);
    }), [rows, q]);
    const open = list.find(r => r.id === selected) ?? null;

    const replaceRow = (next: AdminInvoice) => {
        setRows(rs => {
            const prev = rs?.find(r => r.id === next.id);
            if (prev && !prev.billing && next.billing) setMissing(m => Math.max(0, m - 1));
            return rs?.map(r => (r.id === next.id ? next : r)) ?? rs;
        });
    };

    return (
        <div data-admin-section="invoices">
            <SectionHeader
                icon={<Receipt size={20} />}
                title="Faturalar"
                subtitle="Kartla ödemesi alınmış firmalar. Paket tutarı KDV ayrılarak EDM kesimine hazırlanır; bilgileri buradan düzeltebilirsiniz."
                actions={<button type="button" onClick={() => setReloadKey(k => k + 1)} style={btn('ghost', true)} disabled={loading}>{loading ? <Spinner size={14} /> : <RefreshCw size={14} />} Yenile</button>}
            />

            {missing > 0 && scope !== 'missing' && (
                <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', color: C.amberText, fontSize: '0.82rem', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ flex: 1 }}>Fatura bilgisi olmayan {missing} başarılı ödeme var. Bilgileri girerseniz kesim taslağı oluşur.</span>
                    <button type="button" onClick={() => setScope('missing')} style={btn('secondary', true)}>Bilgileri gir</button>
                </div>
            )}
            {error && <div style={{ marginBottom: 12 }}><ErrorBox>{error}</ErrorBox></div>}

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {SCOPES.map(s => (
                        <button key={s.id} type="button" data-admin-invoice-scope={s.id} onClick={() => setScope(s.id)}
                            style={btn(scope === s.id ? 'primary' : 'secondary', true)}>
                            {s.label}{s.id === 'missing' && missing > 0 ? ` (${missing})` : ''}
                        </button>
                    ))}
                </div>
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 420 }}>
                    <Search size={15} color={C.dim} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input data-admin-invoice-search value={query} onChange={e => setQuery(e.target.value)} placeholder="Ünvan, vergi no, fatura no veya e-posta"
                        style={{ ...inputStyle, paddingLeft: 36, borderRadius: 999 }} />
                    {query && (
                        <button type="button" aria-label="Aramayı temizle" onClick={() => setQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex' }}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: C.muted }}>{rows ? `${list.length} kayıt` : ''}</span>
            </div>

            <Card pad={false} style={{ overflow: 'hidden' }}>
                {!rows && !error ? (
                    <div style={{ display: 'flex', gap: 8, color: C.muted, padding: 20 }}><Spinner /> Yükleniyor…</div>
                ) : list.length === 0 ? (
                    <div style={{ padding: 8 }}><Empty>{{
                        ready: 'Kesime hazır fatura yok.',
                        issued: 'Kesildi olarak işaretlenmiş fatura yok.',
                        missing: 'Fatura bilgisi eksik ödeme yok.',
                        all: 'Fatura kaydı yok.',
                    }[scope]}</Empty></div>
                ) : (
                    <div className="adm-scroll" style={{ overflow: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
                        <table className="adm-table" data-admin-invoices-table>
                            <thead>
                                <tr>
                                    <th>Firma</th>
                                    <th>Kimlik</th>
                                    <th>Paket</th>
                                    <th style={{ textAlign: 'right' }}>Tutar</th>
                                    <th>Belge</th>
                                    <th>Durum</th>
                                    <th>Ödeme</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map(row => {
                                    const doc = docLabel(row);
                                    const status = statusLabel(row);
                                    return (
                                        <tr key={row.id} data-admin-invoice-row={row.id} onClick={() => setSelected(row.id)} style={{ cursor: 'pointer' }}>
                                            <td>
                                                <div style={{ fontWeight: 700 }}>{row.billing?.title || row.full_name || '—'}</div>
                                                <div style={{ fontSize: '0.75rem', color: C.muted }}>
                                                    {row.billing ? (row.billing.partyType === 'sole' ? 'Şahıs firması' : 'Tüzel kişi') : 'Bilgi yok'} · {row.username}
                                                </div>
                                            </td>
                                            <td style={{ fontVariantNumeric: 'tabular-nums' }}>{row.billing ? `${row.billing.scheme} ${row.billing.taxId}` : '—'}</td>
                                            <td>{PLAN_NAME[row.plan_id] || row.plan_id}</td>
                                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{fmtMoney(row.amount)}</td>
                                            <td>{row.draft ? <Badge color={doc.color}>{doc.label}</Badge> : '—'}</td>
                                            <td>
                                                <Badge color={status.color}>{status.label}</Badge>
                                                {row.invoice_number && <div style={{ fontSize: '0.72rem', color: C.muted, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{row.invoice_number}</div>}
                                            </td>
                                            <td style={{ color: C.muted, whiteSpace: 'nowrap' }}>{fmtDateTime(row.paid_at)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
            {open && <InvoiceDetail key={open.id} row={open} onClose={() => setSelected(null)} onSaved={replaceRow} />}
        </div>
    );
};
