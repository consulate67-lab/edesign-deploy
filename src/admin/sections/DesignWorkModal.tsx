import React, { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../adminApi';
import type { AdminDesignWork } from '../contracts';
import { C, btn, displayName, errorText, fmtDateTime, fmtNumber, viewLabel } from '../format';
import { Badge, Modal, Spinner } from '../ui';
import { transformXmlWithXslt } from '../../xsltTransformer';

const PreviewPane: React.FC<{ label: string; xslt: string; xml: string }> = ({ label, xslt, xml }) => {
    const html = useMemo(() => {
        if (!xslt.trim()) return '<p style="padding:16px;font-family:sans-serif;color:#64748b">İçerik yok.</p>';
        if (!xml.trim()) {
            return `<pre style="margin:0;padding:12px;font:12px/1.45 ui-monospace,monospace;white-space:pre-wrap;word-break:break-word">${xslt.slice(0, 12000).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!))}${xslt.length > 12000 ? '\n…' : ''}</pre>`;
        }
        try {
            return transformXmlWithXslt(xml, xslt);
        } catch (e) {
            return `<p style="padding:16px;font-family:sans-serif;color:#b91c1c">Önizleme oluşturulamadı: ${String(e instanceof Error ? e.message : e)}</p>`;
        }
    }, [xslt, xml]);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
            <div style={{ padding: '8px 12px', fontSize: '0.78rem', fontWeight: 700, color: C.text, background: C.soft, borderBottom: `1px solid ${C.border}` }}>{label}</div>
            <iframe title={label} srcDoc={html} sandbox="" style={{ flex: 1, width: '100%', minHeight: 360, border: 0, background: '#fff' }} />
        </div>
    );
};

const DesignWorkBody: React.FC<{ query: { designId?: number; userId?: number } }> = ({ query }) => {
    const [work, setWork] = useState<AdminDesignWork | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(true);
    const [tab, setTab] = useState<'preview' | 'source'>('preview');

    useEffect(() => {
        let cancelled = false;
        void adminApi.designWork(query)
            .then((r) => { if (!cancelled) { setWork(r); setBusy(false); } })
            .catch((e) => { if (!cancelled) { setError(errorText(e)); setBusy(false); } });
        return () => { cancelled = true; };
    }, [query]);

    if (busy) return <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}><Spinner size={22} /></div>;
    if (error) return <div style={{ padding: 16, color: C.redText, fontSize: '0.85rem' }}>{error}</div>;
    if (!work) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.78rem', color: C.muted, lineHeight: 1.5 }}>
                    <strong style={{ color: C.text }}>{work.name}</strong>
                    {' · #'}{work.id}
                    {' · '}{displayName(work.user)}
                    {work.user.company_name ? ` · ${work.user.company_name}` : ''}
                    {' · '}{work.moduleId}
                    {' · '}son kayıt {fmtDateTime(work.updatedAt)}
                    {work.paid ? ' · onaylı' : ' · taslak'}
                    {work.presence ? ` · şu an ${viewLabel(work.presence.view)}` : ''}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge color={work.changed ? C.amber : C.green}>
                        {work.changed ? 'Varsayılandan farklı' : 'Varsayılanla aynı'}
                    </Badge>
                    {work.stats && (
                        <span style={{ fontSize: '0.72rem', color: C.dim }}>
                            varsayılan {fmtNumber(work.stats.baseLen)} karakter · son {fmtNumber(work.stats.savedLen)} karakter
                            {work.stats.delta !== 0 ? ` · fark ${work.stats.delta > 0 ? '+' : ''}${fmtNumber(work.stats.delta)}` : ''}
                        </span>
                    )}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" style={btn(tab === 'preview' ? 'primary' : 'ghost', true)} onClick={() => setTab('preview')}>Önizleme</button>
                <button type="button" style={btn(tab === 'source' ? 'primary' : 'ghost', true)} onClick={() => setTab('source')}>Kaynak (XSLT)</button>
            </div>
            {tab === 'preview' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>
                    <PreviewPane label="Varsayılan (ilk şablon)" xslt={work.baseXslt} xml={work.xml} />
                    <PreviewPane label="Son kayıt" xslt={work.savedXslt} xml={work.xml} />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ padding: '8px 12px', fontSize: '0.78rem', fontWeight: 700, background: C.soft, borderBottom: `1px solid ${C.border}` }}>Varsayılan XSLT</div>
                        <pre style={{ margin: 0, padding: 12, overflow: 'auto', flex: 1, minHeight: 360, font: '11px/1.45 ui-monospace,monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{work.baseXslt || '—'}</pre>
                    </div>
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ padding: '8px 12px', fontSize: '0.78rem', fontWeight: 700, background: C.soft, borderBottom: `1px solid ${C.border}` }}>Son kayıt XSLT</div>
                        <pre style={{ margin: 0, padding: 12, overflow: 'auto', flex: 1, minHeight: 360, font: '11px/1.45 ui-monospace,monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{work.savedXslt || '—'}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export const DesignWorkModal: React.FC<{ query: { designId?: number; userId?: number }; onClose: () => void }> = ({ query, onClose }) => (
    <Modal title="Tasarım karşılaştırması" onClose={onClose} width={1100} height="85vh">
        <DesignWorkBody key={`${query.designId ?? ''}-${query.userId ?? ''}`} query={query} />
    </Modal>
);
