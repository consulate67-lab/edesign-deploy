import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, FileUp, RefreshCw, ShieldAlert, XCircle } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { adminApi } from '../adminApi';
import type { OfficialRevision, OfficialSource } from '../contracts';
import { C, btn, errorText } from '../format';
import { Card, ErrorBox, SectionHeader, Spinner } from '../ui';

const STATUS_TR: Record<OfficialRevision['status'], string> = {
    pending: 'Onay bekliyor',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    applied: 'Uygulandı',
    failed: 'Başarısız',
};

const statusColor = (s: OfficialRevision['status']) => {
    if (s === 'pending') return C.amber;
    if (s === 'applied') return C.green;
    if (s === 'failed') return C.red;
    if (s === 'rejected') return C.muted;
    return C.sky;
};

export const Revisions: React.FC = () => {
    const pushToast = useUiStore(s => s.pushToast);
    const [sources, setSources] = useState<OfficialSource[]>([]);
    const [revisions, setRevisions] = useState<OfficialRevision[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | 'check' | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const uploadFor = useRef<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [s, r] = await Promise.all([
                adminApi.officialSources(),
                adminApi.officialRevisions(),
            ]);
            setSources(s);
            setRevisions(r);
            setError(null);
        } catch (e) {
            setError(errorText(e));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const pending = revisions.filter(r => r.status === 'pending' || r.status === 'failed').length;

    const checkNow = async () => {
        setBusyId('check');
        try {
            const result = await adminApi.checkOfficialRevisions();
            pushToast({
                kind: 'success',
                title: 'Kaynak kontrolü bitti',
                description: result.created.length
                    ? `${result.created.length} yeni bekleyen revizyon.`
                    : 'Yeni değişiklik yok.',
                ttl: 6000,
            });
            await load();
        } catch (e) {
            pushToast({ kind: 'error', title: 'Kontrol başarısız', description: errorText(e), ttl: 8000 });
        } finally {
            setBusyId(null);
        }
    };

    const approve = async (id: number) => {
        setBusyId(id);
        try {
            const rev = await adminApi.approveOfficialRevision(id);
            pushToast({
                kind: 'success',
                title: 'Revizyon uygulandı',
                description: rev.summary || 'Resmi dosyalar güncellendi.',
                ttl: 7000,
            });
            await load();
        } catch (e) {
            pushToast({ kind: 'error', title: 'Onay / indirme başarısız', description: errorText(e), ttl: 9000 });
            await load();
        } finally {
            setBusyId(null);
        }
    };

    const reject = async (id: number) => {
        setBusyId(id);
        try {
            await adminApi.rejectOfficialRevision(id);
            pushToast({ kind: 'info', title: 'Revizyon reddedildi', description: 'Bu uzak sürüm artık izlenen taban kabul edilir.', ttl: 6000 });
            await load();
        } catch (e) {
            pushToast({ kind: 'error', title: 'Reddedilemedi', description: errorText(e), ttl: 7000 });
        } finally {
            setBusyId(null);
        }
    };

    const pickUpload = (id: number) => {
        uploadFor.current = id;
        fileRef.current?.click();
    };

    const onUpload = async (file: File | null) => {
        const id = uploadFor.current;
        uploadFor.current = null;
        if (!file || !id) return;
        setBusyId(id);
        try {
            const data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ''));
                reader.onerror = () => reject(new Error('Dosya okunamadı.'));
                reader.readAsDataURL(file);
            });
            const rev = await adminApi.uploadOfficialRevision(id, data, file.name);
            pushToast({
                kind: 'success',
                title: 'Paket yüklendi ve uygulandı',
                description: rev.summary || file.name,
                ttl: 7000,
            });
            await load();
        } catch (e) {
            pushToast({ kind: 'error', title: 'Yükleme başarısız', description: errorText(e), ttl: 9000 });
            await load();
        } finally {
            setBusyId(null);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    return (
        <div data-admin-section="revisions">
            <SectionHeader
                icon={<ShieldAlert size={20} />}
                title="Kurumsal revizyonlar"
                subtitle="GİB paket ve XSLT kaynaklarını izler. Onayladığınızda paket indirilir (veya yüklediğiniz dosya) ve resmi artefact’lar güncellenir; kullanıcılar bildirilir."
                actions={
                    <>
                        <button type="button" onClick={() => void load()} style={btn('ghost', true)} disabled={loading}>
                            {loading ? <Spinner size={14} /> : <RefreshCw size={14} />} Yenile
                        </button>
                        <button type="button" data-admin-rev-check onClick={() => void checkNow()} style={btn('primary', true)} disabled={busyId === 'check'}>
                            {busyId === 'check' ? <Spinner size={14} /> : <RefreshCw size={14} />} Şimdi kontrol et
                        </button>
                    </>
                }
            />
            {error && <div style={{ marginBottom: 14 }}><ErrorBox>{error}</ErrorBox></div>}
            <input ref={fileRef} type="file" accept=".zip,.jar,application/zip,application/java-archive" hidden
                onChange={(e) => void onUpload(e.target.files?.[0] ?? null)} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 18 }}>
                <Card title="Bekleyen">
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: pending ? C.amber : C.text }}>{pending}</div>
                    <div style={{ fontSize: '0.8rem', color: C.muted, marginTop: 4 }}>Onay veya yükleme bekleyen kaynak</div>
                </Card>
                <Card title="İzlenen kaynak">
                    <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{sources.length}</div>
                    <div style={{ fontSize: '0.8rem', color: C.muted, marginTop: 4 }}>6 saatte bir otomatik kontrol</div>
                </Card>
            </div>

            <Card title="Kaynaklar" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sources.map(s => (
                        <div key={s.id} style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.soft }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{s.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: 2, wordBreak: 'break-all' }}>{s.url}</div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: C.muted, textAlign: 'right' }}>
                                    Son kontrol: {s.last_checked_at ? new Date(s.last_checked_at).toLocaleString('tr-TR') : '—'}
                                    <div>Boyut: {s.tracked_meta?.contentLength ?? '—'}</div>
                                </div>
                            </div>
                            {s.notes && <div style={{ fontSize: '0.78rem', color: C.muted, marginTop: 6 }}>{s.notes}</div>}
                        </div>
                    ))}
                    {!sources.length && !loading && <div style={{ color: C.muted, fontSize: '0.85rem' }}>Kaynak yok.</div>}
                </div>
            </Card>

            <Card title="Revizyon geçmişi">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {revisions.map(r => {
                        const actionable = r.status === 'pending' || r.status === 'failed';
                        const busy = busyId === r.id;
                        const files = r.diff_summary?.files?.filter(f => f.changed) ?? [];
                        return (
                            <div key={r.id} data-revision={r.id} style={{ padding: 14, borderRadius: 12, border: `1px solid ${C.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 800 }}>{r.source_label || r.source_id}</span>
                                            <span style={{
                                                fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                                                background: `${statusColor(r.status)}22`, color: statusColor(r.status),
                                            }}>{STATUS_TR[r.status]}</span>
                                        </div>
                                        <div style={{ fontSize: '0.84rem', marginTop: 6, color: C.text }}>{r.summary}</div>
                                        <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: 4, wordBreak: 'break-all' }}>
                                            {r.remote_url}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: 2 }}>
                                            Tespit: {new Date(r.detected_at).toLocaleString('tr-TR')}
                                            {r.applied_at ? ` · Uygulandı: ${new Date(r.applied_at).toLocaleString('tr-TR')}` : ''}
                                        </div>
                                        {r.error && <div style={{ fontSize: '0.8rem', color: C.redText, marginTop: 6 }}>{r.error}</div>}
                                        {files.length > 0 && (
                                            <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: '0.78rem', color: C.muted }}>
                                                {files.slice(0, 12).map(f => (
                                                    <li key={f.path}>{f.path} ({f.bytes} bayt)</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    {actionable && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                                            <button type="button" disabled={!!busyId} onClick={() => void approve(r.id)} style={btn('primary', true)}>
                                                {busy ? <Spinner size={14} /> : <CheckCircle2 size={14} />} Onayla ve indir
                                            </button>
                                            <button type="button" disabled={!!busyId} onClick={() => pickUpload(r.id)} style={btn('ghost', true)}>
                                                <FileUp size={14} /> Paketi yükle
                                            </button>
                                            <a href={r.remote_url} target="_blank" rel="noreferrer" style={{ ...btn('ghost', true), textDecoration: 'none', justifyContent: 'center' }}>
                                                <Download size={14} /> Kaynak linki
                                            </a>
                                            <button type="button" disabled={!!busyId} onClick={() => void reject(r.id)} style={btn('danger', true)}>
                                                <XCircle size={14} /> Reddet
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {!revisions.length && !loading && (
                        <div style={{ color: C.muted, fontSize: '0.85rem' }}>Henüz revizyon kaydı yok. “Şimdi kontrol et” ile başlatın.</div>
                    )}
                </div>
            </Card>
        </div>
    );
};
