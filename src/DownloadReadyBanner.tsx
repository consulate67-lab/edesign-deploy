import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import {
    clearPendingBlobDownload,
    subscribePendingBlobDownload,
    type PendingBlobDownload,
} from './utils/blobDownload';
import { theme } from './theme';
import { useLocaleT } from './i18n';

/** Await sonrası tarayıcının engellediği indirmeler için tıklanabilir yedek. */
export const DownloadReadyBanner: React.FC = () => {
    const { t } = useLocaleT();
    const [pending, setPending] = useState<PendingBlobDownload | null>(null);

    useEffect(() => subscribePendingBlobDownload(setPending), []);

    if (!pending) return null;

    return (
        <div
            data-download-ready
            role="status"
            style={{
                position: 'fixed',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10050,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                maxWidth: 'min(520px, calc(100vw - 24px))',
                padding: '12px 14px',
                borderRadius: 12,
                background: '#0f172a',
                color: '#f8fafc',
                boxShadow: '0 12px 40px rgba(15, 23, 42, 0.35)',
                border: '1px solid rgba(148, 163, 184, 0.35)',
                fontFamily: 'inherit',
            }}
        >
            <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{t('common.downloadReady')}</div>
                <div style={{ fontSize: 11, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pending.filename}
                </div>
            </div>
            <a
                href={pending.url}
                download={pending.filename}
                onClick={() => { window.setTimeout(clearPendingBlobDownload, 300); }}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: theme.green,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 12,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                }}
            >
                <Download size={14} /> {t('common.downloadNow')}
            </a>
            <button
                type="button"
                aria-label={t('common.close')}
                onClick={clearPendingBlobDownload}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
            >
                <X size={16} />
            </button>
        </div>
    );
};
