import React, { useCallback, useEffect, useState } from 'react';
import { MousePointerClick, RefreshCw, X } from 'lucide-react';
import { adminApi } from '../adminApi';
import type { TrafficOverview, TrafficSourceDetail } from '../contracts';
import { C, btn, errorText, fmtNumber, fmtRelative } from '../format';
import { useNow } from '../hooks';
import { Card, Empty, ErrorBox, SectionHeader, Spinner } from '../ui';

const DAY_OPTS = [1, 7, 30, 90] as const;

export const Traffic: React.FC = () => {
    const [days, setDays] = useState<number>(7);
    const [data, setData] = useState<TrafficOverview | null>(null);
    const [detail, setDetail] = useState<TrafficSourceDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const now = useNow(30_000);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setData(await adminApi.trafficOverview(days));
            setError(null);
        } catch (e) {
            setError(errorText(e));
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => { void load(); }, [load]);

    const openSource = async (source: string) => {
        try {
            setDetail(await adminApi.trafficSourceDetail(source, days));
            setError(null);
        } catch (e) {
            setError(errorText(e));
        }
    };

    const maxVisits = Math.max(1, ...(data?.sources.map((s) => s.visits) ?? [1]));

    return (
        <div data-admin-section="traffic">
            <SectionHeader
                icon={<MousePointerClick size={20} />}
                title="Ziyaret kaynakları"
                subtitle="Sayfa ziyaretlerinin nereden geldiği: LinkedIn, Google, doğrudan giriş vb. gruplar halinde."
                actions={(
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {DAY_OPTS.map((d) => (
                            <button key={d} type="button" onClick={() => setDays(d)}
                                style={btn(days === d ? 'primary' : 'ghost', true)}>
                                {d === 1 ? 'Bugün' : `${d} gün`}
                            </button>
                        ))}
                        <button type="button" onClick={() => void load()} style={btn('ghost', true)} disabled={loading}>
                            {loading ? <Spinner size={14} /> : <RefreshCw size={14} />} Yenile
                        </button>
                    </div>
                )}
            />
            {error && <div style={{ marginBottom: 16 }}><ErrorBox>{error}</ErrorBox></div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Seçilen dönem', value: data?.totals.visits, color: '#6366f1' },
                    { label: 'Tekil ziyaretçi', value: data?.totals.uniqueVisitors, color: '#0ea5e9' },
                    { label: 'Son 24 saat', value: data?.totals.visits1d, color: '#10b981' },
                    { label: 'Tüm zamanlar', value: data?.totals.visitsAll, color: '#8b5cf6' },
                ].map((s) => (
                    <div key={s.label} style={{
                        padding: '14px 16px', borderRadius: 14, background: `linear-gradient(160deg, #fff 55%, ${s.color}14)`,
                        border: `1px solid ${s.color}40`, borderTop: `3px solid ${s.color}`,
                    }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{data ? fmtNumber(s.value || 0) : '…'}</div>
                        <div style={{ fontSize: '0.74rem', color: C.muted, fontWeight: 600 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                <Card title="Kaynak grupları">
                    {!data || data.sources.length === 0 ? (
                        <Empty>{loading ? 'Yükleniyor…' : 'Henüz ziyaret yok. Site gezildikçe LinkedIn, Google, doğrudan vb. burada birikir.'}</Empty>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {data.sources.map((s) => (
                                <button key={s.source} type="button" onClick={() => void openSource(s.source)}
                                    style={{
                                        display: 'block', width: '100%', textAlign: 'left', border: `1px solid ${C.border}`,
                                        borderRadius: 12, padding: '10px 12px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                                    }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                                        <strong style={{ fontSize: '0.88rem' }}>{s.source}</strong>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>{fmtNumber(s.visits)}</span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 99, background: C.soft, overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.round((s.visits / maxVisits) * 100)}%`, height: '100%', background: '#6366f1', borderRadius: 99 }} />
                                    </div>
                                    <div style={{ marginTop: 6, fontSize: '0.72rem', color: C.muted }}>
                                        {fmtNumber(s.uniqueVisitors)} tekil
                                        {s.lastVisitAt ? ` · son ${fmtRelative(s.lastVisitAt, now)}` : ''}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                <Card title="En çok görülen sayfalar">
                    {!data || data.paths.length === 0 ? <Empty>Veri yok.</Empty> : (
                        <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                                <tr style={{ color: C.muted, textAlign: 'left', fontSize: '0.72rem' }}>
                                    <th style={th}>Sayfa</th>
                                    <th style={th}>Ziyaret</th>
                                    <th style={th}>Kaynak çeşidi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.paths.map((p) => (
                                    <tr key={p.path}>
                                        <td style={td}><code style={{ fontSize: '0.78rem' }}>{p.path}</code></td>
                                        <td style={td}><strong>{fmtNumber(p.visits)}</strong></td>
                                        <td style={td}>{fmtNumber(p.sources)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>

                <Card title="Günlük ziyaret">
                    {!data || data.byDay.length === 0 ? <Empty>Veri yok.</Empty> : (
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflow: 'auto' }}>
                            {[...data.byDay].reverse().map((d) => (
                                <li key={d.day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                    <span style={{ color: C.muted }}>{d.day}</span>
                                    <strong>{fmtNumber(d.visits)}</strong>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            {detail && (
                <div style={{ marginTop: 16 }}>
                    <Card
                        title={<>{detail.source} — detay ({detail.days} gün)</>}
                        actions={<button type="button" style={btn('ghost', true)} onClick={() => setDetail(null)}><X size={14} /> Kapat</button>}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: 8 }}>Bu kaynaktan açılan sayfalar</div>
                                {detail.paths.length === 0 ? <Empty>Yok</Empty> : (
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {detail.paths.map((p) => (
                                            <li key={p.path} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '0.82rem' }}>
                                                <code style={{ fontSize: '0.76rem' }}>{p.path}</code>
                                                <strong>{fmtNumber(p.visits)}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: 8 }}>Referrer alan adları</div>
                                {detail.hosts.length === 0 ? <Empty>Yok</Empty> : (
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {detail.hosts.map((h) => (
                                            <li key={h.host} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                                <span>{h.host}</span>
                                                <strong>{fmtNumber(h.visits)}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: 8 }}>Son ziyaretler</div>
                                {detail.recent.length === 0 ? <Empty>Yok</Empty> : (
                                    <div style={{ overflowX: 'auto', maxHeight: 260 }}>
                                        <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                                            <thead>
                                                <tr style={{ color: C.muted, textAlign: 'left' }}>
                                                    <th style={th}>Zaman</th>
                                                    <th style={th}>Sayfa</th>
                                                    <th style={th}>Referrer</th>
                                                    <th style={th}>UTM</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detail.recent.map((r, i) => (
                                                    <tr key={`${r.createdAt}-${i}`}>
                                                        <td style={td}>{fmtRelative(r.createdAt, now)}</td>
                                                        <td style={td}><code>{r.path}</code></td>
                                                        <td style={{ ...td, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.referrer || '—'}</td>
                                                        <td style={td}>{[r.utmSource, r.utmCampaign].filter(Boolean).join(' / ') || '—'}</td>
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

const th: React.CSSProperties = { padding: '8px 10px', fontWeight: 700, borderBottom: `1px solid ${C.border}` };
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: `1px solid ${C.border}`, verticalAlign: 'top' };
