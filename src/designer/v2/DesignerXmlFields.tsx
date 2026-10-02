/**
 * Designer 2.0 — Sol Panel Alt (XML Veri Alanları) — Sprint 2 Aşama 3 (2026-10-02)
 *
 * Selim'in brief'i: "solda veri alanları yok" → bu panel eklendi (Aşama 1).
 * Aşama 3: Tam içerik — 75 standart + 28 readonly alan, grup bazlı.
 *
 * Gruplar (path prefix'ten):
 *   1. Fatura Genel Bilgileri (~12)
 *   2. Tedarikçi (Gönderici) (~17)
 *   3. Müşteri (Alıcı) (~17)
 *   4. Toplamlar (~6)
 *   5. Vergi (~6)
 *   6. İskonto & Masraf (~4)
 *   7. Ödeme (~5)
 *   8. İrsaliye (~2)
 *   9. Sipariş (~2)
 *  10. Satır Detayı (~8)
 *
 * Aşama 4'te HTML5 drag-drop ile canvas'a sürüklenecek.
 */
import React from 'react';
import { Database, Search, Lock, GripVertical, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { standardUBLFields, type StandardField } from '../../standardFields';
import { isReadonlyField } from '../../readonlyFields';

interface DesignerXmlFieldsProps {
    /** Aşama 4 — drag başlangıcında parent'a bildirim (opsiyonel, log için). */
    onDragFieldStart?: (field: StandardField, isReadonly: boolean) => void;
    initialQuery?: string;
}

/** HTML5 dragstart — non-readonly alanlar için. */
function handleDragStart(field: StandardField, e: React.DragEvent) {
    try {
        e.dataTransfer.setData('application/json', JSON.stringify(field));
        e.dataTransfer.effectAllowed = 'copy';
        // Custom MIME de bırak — DesignerCanvas'ta algılama için
        e.dataTransfer.setData('text/x-ubl-field', field.path);
    } catch (err) {
        console.error('[XmlFields] dragstart error:', err);
    }
}

/** Path prefix'ten grup adı çıkar (10 grup) */
function inferGroup(path: string): string {
    if (path.includes('AccountingSupplierParty')) return 'Tedarikçi (Gönderici)';
    if (path.includes('AccountingCustomerParty')) return 'Müşteri (Alıcı)';
    if (path.includes('LegalMonetaryTotal')) return 'Toplamlar';
    if (path.includes('TaxTotal')) return 'Vergi';
    if (path.includes('AllowanceCharge')) return 'İskonto & Masraf';
    if (path.includes('PaymentMeans')) return 'Ödeme';
    if (path.includes('DespatchDocumentReference')) return 'İrsaliye';
    if (path.includes('OrderReference')) return 'Sipariş';
    if (path.includes('InvoiceLine')) return 'Satır Detayı';
    return 'Fatura Genel';
}

interface GroupedFields {
    [group: string]: StandardField[];
}

export const DesignerXmlFields: React.FC<DesignerXmlFieldsProps> = () => {
    const [query, setQuery] = React.useState('');
    const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({});

    /**
     * Standart alanları gruplara ayır (sırayı koru).
     */
    const grouped = React.useMemo<GroupedFields>(() => {
        const g: GroupedFields = {};
        standardUBLFields.forEach((f) => {
            const groupName = inferGroup(f.path);
            if (!g[groupName]) g[groupName] = [];
            g[groupName].push(f);
        });
        return g;
    }, []);

    /**
     * Arama filtresi: alan adı veya path'te ara (case-insensitive).
     * Boş query → tüm gruplar.
     */
    const filtered = React.useMemo<GroupedFields>(() => {
        if (!query.trim()) return grouped;
        const q = query.toLowerCase();
        const result: GroupedFields = {};
        Object.keys(grouped).forEach((groupName) => {
            const matches = grouped[groupName].filter(
                (f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
            );
            if (matches.length > 0) result[groupName] = matches;
        });
        return result;
    }, [query, grouped]);

    const totalCount = Object.values(filtered).reduce((sum, arr) => sum + arr.length, 0);
    const readonlyCount = standardUBLFields.filter((f) => isReadonlyField(f.path)).length;

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
                {/* Header */}
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
                        {query ? `${totalCount}/${standardUBLFields.length}` : `${standardUBLFields.length} alan`}
                    </span>
                </div>

                {/* Arama input */}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <Search
                        size={11}
                        style={{
                            position: 'absolute',
                            left: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#475569',
                            pointerEvents: 'none',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Ara… (alan adı veya XPath)"
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

                {/* Sonuç yok mesajı */}
                {Object.keys(filtered).length === 0 && (
                    <div
                        style={{
                            padding: '20px 12px',
                            textAlign: 'center',
                            color: '#64748b',
                            fontSize: '11px',
                        }}
                    >
                        "{query}" ile eşleşen alan yok
                    </div>
                )}

                {/* Gruplar */}
                {Object.keys(filtered).map((groupName) => {
                    const fields = filtered[groupName];
                    const isCollapsed = collapsedGroups[groupName];
                    const groupReadonly = fields.filter((f) => isReadonlyField(f.path)).length;
                    return (
                        <div key={groupName} style={{ marginBottom: '8px' }}>
                            {/* Grup başlığı — tıklanabilir collapse/expand */}
                            <button
                                onClick={() =>
                                    setCollapsedGroups((prev) => ({
                                        ...prev,
                                        [groupName]: !prev[groupName],
                                    }))
                                }
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 8px',
                                    background: 'rgba(99, 102, 241, 0.08)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    borderRadius: '4px',
                                    color: '#a5b4fc',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                }}
                            >
                                {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                                <FileText size={10} />
                                <span style={{ flex: 1, textAlign: 'left' }}>{groupName}</span>
                                <span
                                    style={{
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                        fontSize: '9px',
                                    }}
                                >
                                    {fields.length}
                                </span>
                                {groupReadonly > 0 && (
                                    <span
                                        style={{
                                            background: 'rgba(71, 85, 105, 0.4)',
                                            color: '#cbd5e1',
                                            padding: '1px 6px',
                                            borderRadius: '10px',
                                            fontSize: '9px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '2px',
                                        }}
                                        title={`${groupReadonly} salt okunur alan`}
                                    >
                                        <Lock size={8} /> {groupReadonly}
                                    </span>
                                )}
                            </button>

                            {/* Alan listesi */}
                            {!isCollapsed && (
                                <div
                                    style={{
                                        marginTop: '4px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px',
                                    }}
                                >
                                    {fields.map((field) => {
                                        const isReadonly = isReadonlyField(field.path);
                                        return (
                                            <div
                                                key={field.path}
                                                draggable={!isReadonly}
                                                onDragStart={
                                                    isReadonly
                                                        ? undefined
                                                        : (e) => handleDragStart(field, e)
                                                }
                                                title={
                                                    isReadonly
                                                        ? `🔒 Sistem alanı (değiştirilemez): ${field.path}`
                                                        : `${field.path} — canvas'a sürükle → yerleştir`
                                                }
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '4px 8px',
                                                    background: isReadonly
                                                        ? 'rgba(71, 85, 105, 0.15)'
                                                        : 'rgba(99, 102, 241, 0.05)',
                                                    border: isReadonly
                                                        ? '1px solid rgba(71, 85, 105, 0.2)'
                                                        : '1px solid rgba(99, 102, 241, 0.15)',
                                                    borderRadius: '3px',
                                                    cursor: isReadonly ? 'not-allowed' : 'grab',
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
                                                {field.isNumeric && (
                                                    <span
                                                        style={{
                                                            fontSize: '9px',
                                                            color: '#10b981',
                                                            fontWeight: 700,
                                                            fontFamily: 'monospace',
                                                        }}
                                                        title="Sayısal alan"
                                                    >
                                                        #
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Footer — read-only özet + Drag & Drop aktif notu */}
                <div
                    style={{
                        marginTop: '12px',
                        padding: '8px 10px',
                        background: 'rgba(71, 85, 105, 0.15)',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        borderRadius: '4px',
                        fontSize: '10px',
                        lineHeight: 1.5,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                        <span>🔒 Salt okunur:</span>
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>{readonlyCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                        <span>📝 Düzenlenebilir:</span>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>
                            {standardUBLFields.length - readonlyCount}
                        </span>
                    </div>
                    <div
                        style={{
                            marginTop: '6px',
                            paddingTop: '6px',
                            borderTop: '1px solid rgba(71, 85, 105, 0.3)',
                            color: '#10b981',
                            textAlign: 'center',
                            fontWeight: 700,
                        }}
                    >
                        ✅ Drag &amp; drop aktif
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignerXmlFields;