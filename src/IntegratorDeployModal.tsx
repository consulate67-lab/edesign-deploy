import React, { useEffect, useState } from 'react';
import { CloudUpload, Loader2, Plus, X } from 'lucide-react';
import {
    api,
    type IntegratorAccount,
    type IntegratorProvider,
    type SavedDesign,
    type TemplateDeployment,
} from './api';

const STATUS_TR: Record<TemplateDeployment['status'], string> = {
    queued: 'Kuyrukta',
    uploading: 'Yükleniyor',
    uploaded: 'Yüklendi',
    rejected: 'Reddedildi',
    failed: 'Başarısız',
    pending_provider: 'Sağlayıcı bekleniyor',
};

/** Onaylı tasarımı müşterinin entegratör hesabına XSLT olarak gönderme (Yol A). */
export const IntegratorDeployModal: React.FC<{
    design: SavedDesign;
    onClose: () => void;
}> = ({ design, onClose }) => {
    const [providers, setProviders] = useState<IntegratorProvider[]>([]);
    const [accounts, setAccounts] = useState<IntegratorAccount[]>([]);
    const [deployments, setDeployments] = useState<TemplateDeployment[]>([]);
    const [accountId, setAccountId] = useState<number | ''>('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [providerId, setProviderId] = useState('edm');
    const [environment, setEnvironment] = useState<'test' | 'live'>('test');
    const [label, setLabel] = useState('');
    const [creds, setCreds] = useState<Record<string, string>>({});

    const provider = providers.find((p) => p.id === providerId);

    const reload = async () => {
        const [p, a, d] = await Promise.all([
            api.integratorProviders(),
            api.integratorAccounts(),
            api.integratorDeployments(design.id),
        ]);
        setProviders(p.providers);
        setAccounts(a.accounts);
        setDeployments(d.deployments);
        if (!accountId && a.accounts[0]) setAccountId(a.accounts[0].id);
    };

    useEffect(() => {
        let cancelled = false;
        setBusy(true);
        reload()
            .catch((e) => { if (!cancelled) setError((e as Error).message); })
            .finally(() => { if (!cancelled) setBusy(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- design.id sabitleyen ilk yükleme
    }, [design.id]);

    const saveAccount = async () => {
        setBusy(true);
        setError(null);
        try {
            const r = await api.saveIntegratorAccount({
                provider: providerId,
                label: label.trim() || undefined,
                environment,
                credentials: creds,
            });
            setShowAdd(false);
            setCreds({});
            setLabel('');
            await reload();
            setAccountId(r.account.id);
            setInfo('Hesap kaydedildi. Sağlayıcı API’si bağlanınca buradan yükleyebilirsiniz.');
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    };

    const deploy = async () => {
        if (!accountId) {
            setError('Bir entegratör hesabı seçin.');
            return;
        }
        setBusy(true);
        setError(null);
        setInfo(null);
        try {
            const r = await api.deployDesignToIntegrator(design.id, Number(accountId));
            const st = r.deployment.status;
            setInfo(`Durum: ${STATUS_TR[st] ?? st}`);
            await reload();
        } catch (e) {
            setError((e as Error).message);
            try { await reload(); } catch { /* ignore */ }
        } finally {
            setBusy(false);
        }
    };

    return (
        <div
            data-integrator-deploy
            style={{
                position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(15, 23, 42, 0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto',
                    background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                    boxShadow: '0 24px 60px rgba(15,23,42,0.25)', padding: '22px 22px 18px', color: '#0f172a',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <CloudUpload size={22} color="#4f46e5" style={{ marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 17, fontWeight: 800 }}>Entegratöre yükle</div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 1.45 }}>
                            “{design.name}” onaylı XSLT’sini bağlı entegratör hesabınıza şablon olarak gönderir.
                            Belge kesmez; yalnız tasarım teslimidir.
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Kapat"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={18} />
                    </button>
                </div>

                {error && (
                    <div style={{ marginBottom: 10, padding: '10px 12px', borderRadius: 10, background: '#fef2f2', color: '#b91c1c', fontSize: 13 }}>
                        {error}
                    </div>
                )}
                {info && (
                    <div style={{ marginBottom: 10, padding: '10px 12px', borderRadius: 10, background: '#ecfdf5', color: '#047857', fontSize: 13 }}>
                        {info}
                    </div>
                )}

                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    Entegratör hesabı
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : '')}
                        style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    >
                        <option value="">Seçin…</option>
                        {accounts.map((a) => {
                            const p = providers.find((x) => x.id === a.provider);
                            return (
                                <option key={a.id} value={a.id}>
                                    {(p?.name || a.provider)}
                                    {a.label ? ` — ${a.label}` : ''}
                                    {` (${a.environment})`}
                                    {!a.providerReady ? ' · API bekleniyor' : ''}
                                </option>
                            );
                        })}
                    </select>
                    <button
                        type="button"
                        onClick={() => setShowAdd((v) => !v)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 8,
                            border: '1px solid #c7d2fe', background: '#eef2ff', color: '#3730a3', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        }}
                    >
                        <Plus size={14} /> Hesap
                    </button>
                </div>

                {showAdd && (
                    <div style={{ marginBottom: 14, padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'grid', gap: 8 }}>
                            <select value={providerId} onChange={(e) => { setProviderId(e.target.value); setCreds({}); }}
                                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}>
                                {providers.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}{p.ready ? '' : ' (yakında)'}</option>
                                ))}
                            </select>
                            {provider && (
                                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{provider.summary}</div>
                            )}
                            <select value={environment} onChange={(e) => setEnvironment(e.target.value as 'test' | 'live')}
                                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}>
                                <option value="test">Test ortamı</option>
                                <option value="live">Canlı</option>
                            </select>
                            <input
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="Etiket (isteğe bağlı, örn. Merkez)"
                                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                            />
                            {(provider?.fields || []).map((f) => (
                                <input
                                    key={f.key}
                                    type={f.type === 'password' ? 'password' : 'text'}
                                    value={creds[f.key] || ''}
                                    onChange={(e) => setCreds((c) => ({ ...c, [f.key]: e.target.value }))}
                                    placeholder={f.label + (f.required ? ' *' : '')}
                                    autoComplete="off"
                                    style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                                />
                            ))}
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => void saveAccount()}
                                style={{
                                    padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    background: '#4f46e5', color: '#fff', fontWeight: 700, fontSize: 13,
                                }}
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    disabled={busy || !accountId}
                    onClick={() => void deploy()}
                    style={{
                        width: '100%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                        padding: '11px 14px', borderRadius: 10, border: 'none', cursor: busy || !accountId ? 'default' : 'pointer',
                        background: busy || !accountId ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5, #4338ca)',
                        color: '#fff', fontWeight: 800, fontSize: 14, opacity: busy || !accountId ? 0.7 : 1,
                    }}
                >
                    {busy ? <Loader2 size={16} className="spin" /> : <CloudUpload size={16} />}
                    Şablonu gönder
                </button>

                {deployments.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Son denemeler</div>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {deployments.slice(0, 5).map((d) => (
                                <li key={d.id} style={{ fontSize: 12, color: '#334155', padding: '8px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <strong>{STATUS_TR[d.status]}</strong>
                                    {d.fileName ? ` · ${d.fileName}` : ''}
                                    {d.error ? <div style={{ color: '#b91c1c', marginTop: 4 }}>{d.error}</div> : null}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
