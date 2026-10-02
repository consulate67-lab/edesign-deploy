/**
 * Designer 2.0 — Sol Panel Alt (XML Veri Alanları) — Sprint 2 Aşama 1 (2026-10-02)
 *
 * Selim'in brief'i: "solda veri alanları yok" → bu panel eklendi.
 *
 * Aşama 1 (şu an): Placeholder + arama iskeleti (görsel olarak yerinde duruyor)
 * Aşama 3 hedefi:
 *   - 75 standart UBL-TR alanı (cbc:ID, cbc:IssueDate, cac:Party vs.)
 *   - 28 read-only alan (gri kilit ikonu — sistem tarafından doldurulur)
 *   - Grup bazlı (Fatura Genel / Gönderici / Alıcı / Toplamlar / Vergi / Ödeme / Satır Detayı)
 *   - Arama input (filtre)
 *   - Drag handle (HTML5 DnD → canvas'a bırak)
 */
import React from 'react';
import { Database, Search, Lock, GripVertical } from 'lucide-react';
import { standardUBLFields, type StandardField } from '../../standardFields';
import { isReadonlyField } from '../../readonlyFields';

interface DesignerXmlFieldsProps {
    /** Aşama 4'te kullanılacak — şimdilik opsiyonel. */
    onDragFieldStart?: (field: StandardField, isReadonly: boolean) => void;
    /** Şimdilik arama state'i local tutuluyor, Aşama 3'te props'a bağlanabilir. */
    initialQuery?: string;
}

export const DesignerXmlFields: React.FC<DesignerXmlFieldsProps> = () => {
    const [query, setQuery] = React.useState('');

    /**
     * Aşama 1'de sadece ilk 12 alanı "preview" olarak gösteriyoruz — Aşama 3'te
     * 75+28 alanın tamamı gruplu + arama + drag-drop ile gelecek.
     * Şimdilik kullanıcı "Aşama 3'te eklenecek" mesajı yerine birkaç gerçek alan görsün.
     */
    const previewFields = standardUBLFields.slice(0, 8);
    const filtered = previewFields.filter(
        (f) =>
            !query ||
            f.name.toLowerCase().includes(query.toLowerCase()) ||
            f.path.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div
            data-designer-xml-fields
            style={{
                height: '100%',
                background: '#0f172a',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{ padding: '12px' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#94a3b8',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                    }}
                >
                    <Database size={12} />
                    XML VERİ ALANLARI
                    <span
                        style={{
                            marginLeft: 'auto',
                            fontSize: '9px',
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#a5b4fc',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            fontWeight: 700,
                        }}
                    >
                        75 + 28
                    </span>
                </div>

                {/* Arama input — Aşama 3'te fonksiyonel olacak (şu an preview 8 alan) */}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <Search
                        size={11}
                        style={{
                            position: 'absolute',
                            left: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#475569',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Ara…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px 8px 6px 26px',
                            background: '#020617',
                            border: '1px solid #334155',
                            borderRadius: '4px',
                            color: 'white',
                            fontSize: '11px',
                            fontFamily: 'inherit',
                        }}
                    />
                </div>

                {/* Aşama 1: İlk 8 alanı preview (Aşama 3'te 75+28 tam listesi) */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        marginBottom: '10px',
                    }}
                >
                    {filtered.map((field) => {
                        const isReadonly = isReadonlyField(field.path);
                        return (
                            <div
                                key={field.path}
                                draggable={false} /* Aşama 4'te true olacak */
                                title={
                                    isReadonly
                                        ? `🔒 Sistem alanı: ${field.path}`
                                        : field.path
                                }
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 8px',
                                    background: isReadonly
                                        ? 'rgba(71, 85, 105, 0.2)'
                                        : 'rgba(99, 102, 241, 0.08)',
                                    border: isReadonly
                                        ? '1px solid rgba(71, 85, 105, 0.3)'
                                        : '1px solid rgba(99, 102, 241, 0.2)',
                                    borderRadius: '4px',
                                    cursor: 'default', /* Aşama 4'te grab olacak */
                                    opacity: isReadonly ? 0.7 : 1,
                                    fontSize: '11px',
                                }}
                            >
                                {isReadonly ? (
                                    <Lock size={10} color="#94a3b8" />
                                ) : (
                                    <GripVertical size={10} color="#64748b" />
                                )}
                                <span
                                    style={{
                                        flex: 1,
                                        color: isReadonly ? '#94a3b8' : '#cbd5e1',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {field.name}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Aşama 3 placeholder notu */}
                <div
                    style={{
                        padding: '10px 12px',
                        textAlign: 'center',
                        background: 'rgba(245, 158, 11, 0.05)',
                        border: '1px dashed rgba(245, 158, 11, 0.3)',
                        borderRadius: '6px',
                        color: '#a16207',
                        fontSize: '10px',
                        lineHeight: 1.5,
                    }}
                >
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                        Aşama 3 — 67 alan + gruplar
                    </div>
                    <div>
                        Drag &amp; drop (Aşama 4) ile canvas'a sürüklenecek
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignerXmlFields;
