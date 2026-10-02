/**
 * Designer 2.0 — Üst Bar (Phase 16.4 iskelet)
 *
 * İçerik: Geri/İleri/Kaydet/İndir + Araç seçici + XSLT Yükle
 */
import React from 'react';
import { ChevronLeft, Undo2, Redo2, Save, Download, Upload, Type, Image as ImageIcon, MousePointer2, Square, QrCode, Sigma, Table as LucideTable } from 'lucide-react';

interface DesignerToolbarProps {
    docName: string;
    template: string;
    canUndo: boolean;
    canRedo: boolean;
    onBack?: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onSave?: () => void;
    onExport?: () => void;
    onSetTool: (tool: 'select' | 'text' | 'image' | 'shape' | 'qrcode' | 'formula' | 'table') => void;
    activeTool: 'select' | 'text' | 'image' | 'shape' | 'qrcode' | 'formula' | 'table';
}

export const DesignerToolbar: React.FC<DesignerToolbarProps> = ({
    docName,
    template,
    canUndo,
    canRedo,
    onBack,
    onUndo,
    onRedo,
    onSave,
    onExport,
    onSetTool,
    activeTool,
}) => {
    const tools = [
        { id: 'select', icon: MousePointer2, label: 'Seç (V)' },
        { id: 'text', icon: Type, label: 'Metin (T)' },
        { id: 'image', icon: ImageIcon, label: 'Görsel (I)' },
        { id: 'shape', icon: Square, label: 'Şekil (S)' },
        { id: 'qrcode', icon: QrCode, label: 'QR (Q)' },
        { id: 'formula', icon: Sigma, label: 'Formül (F)' },
        { id: 'table', icon: LucideTable, label: 'Tablo (B)' },
    ] as const;

    return (
        <div
            data-designer-toolbar
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                height: '100%',
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #334155',
                gap: '12px',
            }}
        >
            {onBack && (
                <button
                    onClick={onBack}
                    title="Geri"
                    style={iconBtnStyle}
                >
                    <ChevronLeft size={20} />
                </button>
            )}

            <button
                onClick={onUndo}
                disabled={!canUndo}
                title="Geri Al (Ctrl+Z)"
                style={{ ...iconBtnStyle, opacity: canUndo ? 1 : 0.4, cursor: canUndo ? 'pointer' : 'not-allowed' }}
            >
                <Undo2 size={18} />
            </button>

            <button
                onClick={onRedo}
                disabled={!canRedo}
                title="Yinele (Ctrl+Shift+Z)"
                style={{ ...iconBtnStyle, opacity: canRedo ? 1 : 0.4, cursor: canRedo ? 'pointer' : 'not-allowed' }}
            >
                <Redo2 size={18} />
            </button>

            <div style={{ width: '1px', height: '24px', background: '#334155', margin: '0 4px' }} />

            {/* Araç paleti */}
            <div style={{ display: 'flex', gap: '4px', background: '#0f172a', padding: '4px', borderRadius: '8px' }}>
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => onSetTool(tool.id)}
                        title={tool.label}
                        style={{
                            ...iconBtnStyle,
                            background: activeTool === tool.id ? '#6366f1' : 'transparent',
                            color: activeTool === tool.id ? 'white' : '#94a3b8',
                            padding: '6px',
                        }}
                    >
                        <tool.icon size={16} />
                    </button>
                ))}
            </div>

            <div style={{ flex: 1 }} />

            {/* Doc adı */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
                <span style={{ fontWeight: 700, color: 'white' }}>{docName}</span>
                <span style={{ padding: '2px 8px', background: '#0f172a', borderRadius: '4px', fontSize: '11px' }}>{template}</span>
            </div>

            <div style={{ width: '1px', height: '24px', background: '#334155' }} />

            <button title="XSLT Yükle" style={iconBtnStyle}>
                <Upload size={18} />
            </button>
            <button
                onClick={onSave}
                disabled={!onSave}
                title="Hızlı Kaydet (DB'ye sakla)"
                style={{ ...iconBtnStyle, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', opacity: onSave ? 1 : 0.4, cursor: onSave ? 'pointer' : 'not-allowed' }}
            >
                <Save size={18} />
            </button>
            <button
                onClick={onExport}
                disabled={!onExport}
                title="Kaydet ve İndir (XSLT export)"
                style={{
                    height: '36px',
                    padding: '0 16px',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: onExport ? 'pointer' : 'not-allowed',
                    opacity: onExport ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                }}
            >
                <Download size={16} />
                İndir
            </button>
        </div>
    );
};

const iconBtnStyle: React.CSSProperties = {
    height: '36px',
    minWidth: '36px',
    padding: '0 8px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '8px',
    color: '#cbd5e1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};
