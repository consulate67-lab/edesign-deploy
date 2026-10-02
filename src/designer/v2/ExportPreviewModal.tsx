/**
 * Designer 2.0 — Export Önizleme Modalı (Sprint 3 Aşama 3)
 *
 * Toolbar'daki "İndir" butonuna basıldığında XSLT dosyası doğrudan inmez;
 * önce bu modal açılır. Kullanıcı:
 *  1. Üretilen XSLT içeriğini görür (monospace, scroll, syntax renklendirme yok)
 *  2. Element/binding istatistiklerini görür
 *  3. "İndir" tıklarsa gerçek Blob download başlar
 *  4. "Kapat" veya Esc / overlay click ile vazgeçer
 *
 * Sprint 1 brief'i: "kullanıcı tasarladığını gerçek .xslt olarak indirebilir"
 * — bu modal, kullanıcının indirmeden ÖNCE içeriği görmesini sağlar (güven).
 */
import React from 'react';
import { X, Download, Copy, Check } from 'lucide-react';

interface ExportPreviewModalProps {
    isOpen: boolean;
    content: string;
    fileName: string;
    stats: {
        totalElements: number;
        bindingsCount: number;
        shapesCount: number;
        sectionSummary: { id: string; title: string; count: number }[];
    };
    onClose: () => void;
    onDownload: () => void;
}

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
    isOpen,
    content,
    fileName,
    stats,
    onClose,
    onDownload,
}) => {
    const [copied, setCopied] = React.useState(false);

    /**
     * Klavye kısayolları: Esc kapat, Ctrl/Cmd+S indir.
     */
    React.useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                onDownload();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose, onDownload]);

    if (!isOpen) return null;

    const contentSize = new Blob([content]).size;
    const sizeLabel =
        contentSize < 1024
            ? `${contentSize} B`
            : `${(contentSize / 1024).toFixed(1)} kB`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // Fallback: eski tarayıcılar
            const ta = document.createElement('textarea');
            ta.value = content;
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
            } catch {
                /* no-op */
            }
            document.body.removeChild(ta);
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-preview-title"
            onClick={(e) => {
                // Overlay click → kapat (modal içeriği tıklaması hariç)
                if (e.target === e.currentTarget) onClose();
            }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '24px',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '720px',
                    maxHeight: '80vh',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    color: 'white',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 18px',
                        background: 'rgba(30, 41, 59, 0.95)',
                        borderBottom: '1px solid #334155',
                    }}
                >
                    <Download size={18} color="#a5b4fc" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            id="export-preview-title"
                            style={{
                                fontSize: '14px',
                                fontWeight: 700,
                                color: 'white',
                            }}
                        >
                            XSLT Export Önizleme
                        </div>
                        <div
                            style={{
                                fontSize: '11px',
                                color: '#94a3b8',
                                fontFamily: 'monospace',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {fileName} · {sizeLabel}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        title="Kapat (Esc)"
                        style={{
                            background: 'transparent',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* İstatistikler */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '1px',
                        background: '#1e293b',
                        borderBottom: '1px solid #334155',
                    }}
                >
                    <StatCell label="Toplam element" value={stats.totalElements} color="#a5b4fc" />
                    <StatCell label="XML binding" value={stats.bindingsCount} color="#10b981" />
                    <StatCell label="Şekiller" value={stats.shapesCount} color="#fb923c" />
                    <StatCell label="Section" value={stats.sectionSummary.length} color="#94a3b8" />
                </div>

                {/* XSLT içerik — monospace textarea */}
                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <textarea
                        readOnly
                        value={content}
                        spellCheck={false}
                        style={{
                            flex: 1,
                            minHeight: '240px',
                            maxHeight: '50vh',
                            padding: '14px 16px',
                            background: '#020617',
                            color: '#cbd5e1',
                            border: 'none',
                            outline: 'none',
                            fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
                            fontSize: '11px',
                            lineHeight: 1.6,
                            resize: 'none',
                            whiteSpace: 'pre',
                            overflow: 'auto',
                            tabSize: 2,
                        }}
                    />
                </div>

                {/* Footer — section summary + aksiyonlar */}
                <div
                    style={{
                        padding: '12px 18px',
                        background: 'rgba(30, 41, 59, 0.95)',
                        borderTop: '1px solid #334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '11px',
                    }}
                >
                    <div style={{ flex: 1, color: '#94a3b8' }}>
                        <span style={{ fontWeight: 700, color: '#a5b4fc' }}>Section dağılımı: </span>
                        {stats.sectionSummary.map((s) => (
                            <span key={s.id} style={{ marginRight: '8px' }}>
                                {s.title}: <strong style={{ color: 'white' }}>{s.count}</strong>
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={handleCopy}
                        title="XSLT'yi panoya kopyala"
                        style={{
                            background: copied ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                            border: `1px solid ${copied ? '#10b981' : '#334155'}`,
                            color: copied ? '#10b981' : '#cbd5e1',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            minWidth: '110px',
                            justifyContent: 'center',
                        }}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Kopyalandı' : 'Kopyala'}
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: '#cbd5e1',
                            borderRadius: '6px',
                            padding: '8px 14px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Kapat
                    </button>
                    <button
                        onClick={onDownload}
                        title="XSLT dosyasını indir (Ctrl+S)"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <Download size={14} />
                        İndir
                    </button>
                </div>
            </div>
        </div>
    );
};

interface StatCellProps {
    label: string;
    value: number;
    color: string;
}

const StatCell: React.FC<StatCellProps> = ({ label, value, color }) => (
    <div
        style={{
            padding: '10px 12px',
            background: '#0f172a',
            textAlign: 'center',
        }}
    >
        <div style={{ fontSize: '16px', fontWeight: 700, color }}>{value}</div>
        <div
            style={{
                fontSize: '9px',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '2px',
            }}
        >
            {label}
        </div>
    </div>
);

export default ExportPreviewModal;