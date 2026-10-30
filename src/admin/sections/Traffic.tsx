import React, { useCallback, useEffect, useState } from 'react';
import { Copy, ExternalLink, MousePointerClick, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { adminApi } from '../adminApi';
import type { TrafficGroup, TrafficGroupDetail } from '../contracts';
import { C, btn, errorText, fmtNumber, fmtRelative } from '../format';
import { useNow } from '../hooks';
import { Card, Empty, ErrorBox, SectionHeader, Spinner } from '../ui';

const copy = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};

export const Traffic: React.FC = () => {
    const [groups, setGroups] = useState<TrafficGroup[]>([]);
    const [totals, setTotals] = useState({ groups: 0, clicks: 0, clicks7d: 0 });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [detail, setDetail] = useState<TrafficGroupDetail | null>(null);
    const [form, setForm] = useState({ name: '', slug: '', destinationUrl: 'https://www.edxdocu.com/', note: '' });
    const [copied, setCopied] = useState<string | null>(null);
    const now = useNow(30_000);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.trafficGroups();
            setGroups(data.groups);
            setTotals(data.totals);
            setError(null);
        } catch (e) {
            setError(errorText(e));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const create = async () => {
        if (!form.name.trim()) return;
        setBusy(true);
        try {
            await adminApi.createTrafficGroup({
                name: form.name.trim(),
                slug: form.slug.trim() || undefined,
                destinationUrl: form.destinationUrl.trim() || undefined,
                note: form.note.trim() || undefined,
            });
            setForm({ name: '', slug: '', destinationUrl: 'https://www.edxdocu.com/', note: '' });
            await load();
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    const remove = async (g: TrafficGroup) => {
        if (!confirm(`“${g.name}” grubu ve tüm tıklama kayıtları silinsin mi?`)) return;
        setBusy(true);
        try {
            await adminApi.deleteTrafficGroup(g.id);
            if (detail?.group.id === g.id) setDetail(null);
            await load();
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    const openDetail = async (id: number) => {
        setBusy(true);
        try {
            setDetail(await adminApi.trafficGroupDetail(id));
            setError(null);
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    const doCopy = async (url: string, id: number) => {
        if (await copy(url)) {
            setCopied(String(id));
            setTimeout(() => setCopied(null), 1500);
        }
    };

    return (
        <div data-admin-section="traffic">
            <SectionHeader
                icon={<MousePointerClick size={20} />}
                title="Grup tıklamaları"
                subtitle="LinkedIn / WhatsApp / Telegram gruplarına özel link verin; tıklamalar hangi gruptan geldiğini burada görünür."
                actions={<button type="button" onClick={() => void load()} style={btn('ghost', true)} disabled={loading}>{loading ? <Spinner size={14} /> : <RefreshCw size={14} />} Yenile</button>}
            />
            {error && <div style={{ marginBottom: 16 }}><ErrorBox>{error}</ErrorBox></div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Grup', value: totals.groups, color: '#6366f1' },
                    { label: 'Toplam tıklama', value: totals.clicks, color: '#0ea5e9' },
                    { label: 'Son 7 gün', value: totals.clicks7d, color: '#10b981' },
                ].map((s) => (
                    <div key={s.label} style={{
                        padding: '14px 16px', borderRadius: 14, background: `linear-gradient(160deg, #fff 55%, ${s.color}14)`,
                        border: `1px solid ${s.color}40`, borderTop: `3px solid ${s.color}`,
                    }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.text }}>{fmtNumber(s.value)}</div>
                        <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 16, alignItems: 'start' }}>
                <Card title={<><Plus size={16} /> Yeni grup linki</>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.muted }}>
                            Grup adı
                            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="örn. LinkedIn Mali Müşavirler" style={inputStyle} />
                        </label>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.muted }}>
                            Kısa kod (isteğe bağlı)
                            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                                placeholder="otomatik üretilir" style={inputStyle} />
                        </label>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.muted }}>
                            Hedef adres
                            <input value={form.destinationUrl} onChange={(e) => setForm((f) => ({ ...f, destinationUrl: e.target.value }))}
                                placeholder="https://www.edxdocu.com/" style={inputStyle} />
                        </label>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.muted }}>
                            Not
                            <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                                placeholder="hangi grupta paylaşılacak" style={inputStyle} />
                        </label>
                        <button type="button" disabled={busy || !form.name.trim()} onClick={() => void create()} style={btn('primary')}>
                            {busy ? <Spinner size={14} /> : <Plus size={14} />} Oluştur
                        </button>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: C.muted, lineHeight: 1.45 }}>
                            Oluşan <code>/g/…</code> linkini gruba yapıştırın. Tıklayanlar hedefe gider; sayı bu panelde birikir.
                        </p>
                    </div>
                </Card>

                <Card title="Gruplar">
                    {loading && groups.length === 0 ? <div style={{ display: 'flex', gap: 8, color: C.muted }}><Spinner /> Yükleniyor…</div>
                        : groups.length === 0 ? <Empty>Henüz grup yok. Soldan ilk linki oluşturun.</Empty>
                            : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', color: C.muted, fontSize: '0.72rem' }}>
                                                <th style={th}>Grup</th>
                                                <th style={th}>7g</th>
                                                <th style={th}>30g</th>
                                                <th style={th}>Toplam</th>
                                                <th style={th}>Tekil</th>
                                                <th style={th}>Son</th>
                                                <th style={th} />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groups.map((g) => (
                                                <tr key={g.id} className="adm-click" onClick={() => void openDetail(g.id)}>
                                                    <td style={td}>
                                                        <div style={{ fontWeight: 700 }}>{g.name}</div>
                                                        <div style={{ fontSize: '0.72rem', color: C.muted, wordBreak: 'break-all' }}>{g.shareUrl}</div>
                                                    </td>
                                                    <td style={td}><strong>{fmtNumber(g.clicks7d)}</strong></td>
                                                    <td style={td}>{fmtNumber(g.clicks30d)}</td>
                                                    <td style={td}>{fmtNumber(g.clicksTotal)}</td>
                                                    <td style={td}>{fmtNumber(g.uniqueTotal)}</td>
                                                    <td style={td}>{g.lastClickAt ? fmtRelative(g.lastClickAt, now) : '—'}</td>
                                                    <td style={{ ...td, whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                                                        <button type="button" title="Linki kopyala" style={btn('ghost', true)} onClick={() => void doCopy(g.shareUrl, g.id)}>
                                                            <Copy size={13} /> {copied === String(g.id) ? 'Kopyalandı' : ''}
                                                        </button>
                                                        <a href={g.shareUrl} target="_blank" rel="noreferrer" style={{ ...btn('ghost', true), textDecoration: 'none' }}><ExternalLink size={13} /></a>
                                                        <button type="button" title="Sil" style={btn('danger', true)} disabled={busy} onClick={() => void remove(g)}><Trash2 size={13} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                </Card>
            </div>

            {detail && (
                <div style={{ marginTop: 16 }}>
                    <Card
                        title={<>{detail.group.name} · tıklama detayı</>}
                        actions={<button type="button" style={btn('ghost', true)} onClick={() => setDetail(null)}><X size={14} /> Kapat</button>}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: 8 }}>Kaynak (referrer)</div>
                                {detail.byReferrer.length === 0 ? <Empty>Henüz tıklama yok.</Empty> : (
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {detail.byReferrer.map((r) => (
                                            <li key={r.source} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '0.82rem' }}>
                                                <span style={{ color: C.text, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.source}</span>
                                                <strong>{fmtNumber(r.clicks)}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: 8 }}>Son 30 gün (günlük)</div>
                                {detail.byDay.length === 0 ? <Empty>Veri yok.</Empty> : (
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflow: 'auto' }}>
                                        {[...detail.byDay].reverse().map((d) => (
                                            <li key={d.day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                                <span style={{ color: C.muted }}>{d.day}</span>
                                                <strong>{fmtNumber(d.clicks)}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: 8 }}>Son tıklamalar</div>
                                {detail.clicks.length === 0 ? <Empty>Henüz tıklama yok.</Empty> : (
                                    <div style={{ overflowX: 'auto', maxHeight: 280 }}>
                                        <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                                            <thead>
                                                <tr style={{ color: C.muted, textAlign: 'left' }}>
                                                    <th style={th}>Zaman</th>
                                                    <th style={th}>Kaynak</th>
                                                    <th style={th}>Tarayıcı</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detail.clicks.map((c) => (
                                                    <tr key={c.id}>
                                                        <td style={td}>{fmtRelative(c.createdAt, now)}</td>
                                                        <td style={{ ...td, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.referrer || '(doğrudan)'}</td>
                                                        <td style={{ ...td, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', color: C.muted }}>{c.userAgent.slice(0, 80)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', marginTop: 4, boxSizing: 'border-box',
    padding: '9px 11px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'inherit', fontSize: '0.86rem',
};

const th: React.CSSProperties = { padding: '8px 10px', fontWeight: 700, borderBottom: `1px solid ${C.border}` };
const td: React.CSSProperties = { padding: '10px', borderBottom: `1px solid ${C.border}`, verticalAlign: 'top' };
