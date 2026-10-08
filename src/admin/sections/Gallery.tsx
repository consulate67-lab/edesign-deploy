import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, FileCode2, Images, Pencil, Plus, RefreshCw, Save, Trash2, Upload, XCircle, Bot, Hand } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { CATEGORIES, SECTORS } from '../../sector-templates/types';
import { WIZARD_DOC_TYPES, type WizardDocType } from '../../wizard/docTypes';
import { validateXml, validateXslt, stripBom, type ValidationResult } from '../../wizard/validate';
import { transformXmlWithXslt } from '../../xsltTransformer';
import { adminApi } from '../adminApi';
import { useAdmin, type GalleryDraft } from '../adminContext';
import type { GalleryDesign, GalleryDesignInput } from '../contracts';
import { C, btn, errorText, fmtDate, inputStyle, labelStyle } from '../format';
import { Badge, Card, Empty, ErrorBox, Modal, SectionHeader, Spinner } from '../ui';

const docTypeOf = (id: string) => WIZARD_DOC_TYPES.find(d => d.id === id);
const sectorOf = (id: string) => SECTORS.find(s => s.id === id);
const categoryOf = (id: string) => CATEGORIES.find(c => c.id === id);
const moduleOptions = (d: WizardDocType | undefined) => [...new Set([...(d?.defaults.map(o => o.moduleId) ?? []), d?.id ?? 'fatura'])];
const docTypeForModule = (moduleId: string) =>
    WIZARD_DOC_TYPES.find(d => d.id === moduleId) ?? WIZARD_DOC_TYPES.find(d => d.defaults.some(o => o.moduleId === moduleId)) ?? WIZARD_DOC_TYPES[0];

const toInput = (d: GalleryDesign): GalleryDesignInput => ({
    name: d.name, description: d.description, doc_type_id: d.doc_type_id, module_id: d.module_id, sector: d.sector, category: d.category,
    accent: d.accent, tags: d.tags, xslt: d.xslt, xml: d.xml, published: d.published, source: d.source,
});

const emptyInput = (draft?: GalleryDraft | null): GalleryDesignInput => {
    const doc = draft ? docTypeForModule(draft.moduleId) : WIZARD_DOC_TYPES[0];
    return {
        name: draft?.name ?? '', description: '', doc_type_id: doc.id, module_id: draft?.moduleId ?? moduleOptions(doc)[0],
        sector: SECTORS[0].id, category: SECTORS[0].category, accent: '#6366f1', tags: [],
        xslt: draft?.xslt ?? '', xml: draft?.xml ?? '', published: true, source: draft ? 'ai' : 'manual',
    };
};

const renderPreview = (xml: string, xslt: string): { html: string | null; error: string | null } => {
    try {
        return { html: transformXmlWithXslt(stripBom(xml), stripBom(xslt)), error: null };
    } catch (e) {
        return { html: null, error: errorText(e) };
    }
};

const PreviewFrame: React.FC<{ xml: string; xslt: string; title: string }> = ({ xml, xslt, title }) => {
    const { html, error } = useMemo(() => renderPreview(xml, xslt), [xml, xslt]);
    if (error) return <div style={{ padding: 20 }}><ErrorBox>Önizleme oluşturulamadı: {error}</ErrorBox></div>;
    return <iframe data-admin-gallery-preview title={title} srcDoc={html ?? ''} sandbox="allow-scripts" style={{ width: '100%', height: '100%', border: 0, background: '#fff' }} />;
};

const Checks: React.FC<{ title: string; result: ValidationResult }> = ({ title, result }) => (
    <div style={{ flex: '1 1 260px', minWidth: 0, padding: 12, borderRadius: 12, background: result.ok ? '#f0fdf8' : '#fef2f2', border: `1px solid ${result.ok ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.82rem', marginBottom: 8, color: result.ok ? C.greenText : C.redText }}>
            {result.ok ? <CheckCircle2 size={15} /> : <XCircle size={15} />} {title}: {result.ok ? 'uygun' : 'hatalı'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {result.checks.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, fontSize: '0.76rem', lineHeight: 1.4, color: c.level === 'error' ? C.redText : c.level === 'warn' ? C.amberText : '#334155' }}>
                    <span style={{ flexShrink: 0, marginTop: 1 }}>{c.level === 'error' ? <XCircle size={12} /> : c.level === 'warn' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} color={C.green} />}</span>
                    {c.text}
                </div>
            ))}
        </div>
        {result.info.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.info.map(([k, v]) => <span key={k} style={{ fontSize: '0.7rem', color: C.muted }}><b style={{ color: C.text }}>{k}:</b> {v}</span>)}
            </div>
        )}
    </div>
);

const readFile = (file: File) => file.text().then(stripBom);

const DesignForm: React.FC<{ initial: GalleryDesignInput; editingId: number | null; onClose: () => void; onSaved: (d: GalleryDesign) => void }> = ({ initial, editingId, onClose, onSaved }) => {
    const pushToast = useUiStore(s => s.pushToast);
    const [form, setForm] = useState<GalleryDesignInput>(initial);
    const [tagsText, setTagsText] = useState(initial.tags.join(', '));
    const [validation, setValidation] = useState<{ xslt: ValidationResult; xml: ValidationResult } | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const docType = docTypeOf(form.doc_type_id);
    const sectors = SECTORS.filter(s => s.category === form.category);

    const set = <K extends keyof GalleryDesignInput>(k: K, v: GalleryDesignInput[K]) => {
        setForm(f => ({ ...f, [k]: v }));
        if (k === 'xslt' || k === 'xml' || k === 'doc_type_id') setValidation(null);
    };

    const validate = () => {
        if (!docType) return null;
        const r = { xslt: validateXslt(form.xslt, docType, form.xml || null), xml: validateXml(form.xml, docType, form.xslt || null) };
        setValidation(r);
        return r;
    };

    const save = async () => {
        setError(null);
        if (!form.name.trim()) { setError('Tasarım adını girin.'); return; }
        if (!form.xslt.trim() || !form.xml.trim()) { setError('XSLT ve örnek XML gerekli.'); return; }
        const r = validation ?? validate();
        if (!r || !r.xslt.ok || !r.xml.ok) { setError('Doğrulama hatalarını düzeltmeden kaydedilemez.'); return; }
        setSaving(true);
        try {
            const input: GalleryDesignInput = {
                ...form, name: form.name.trim(), description: form.description.trim(),
                tags: tagsText.split(',').map(t => t.trim()).filter(Boolean).slice(0, 8),
            };
            const saved = editingId ? await adminApi.updateGallery(editingId, input) : await adminApi.createGallery(input);
            pushToast({ kind: 'success', title: editingId ? 'Tasarım güncellendi' : 'Tasarım galeriye eklendi', description: input.published ? 'Kullanıcı galerisinde yayında.' : 'Taslak olarak kaydedildi (yayında değil).', ttl: 5000 });
            onSaved(saved);
        } catch (e) {
            setError(errorText(e));
        } finally {
            setSaving(false);
        }
    };

    const fileBtn = (kind: 'xslt' | 'xml') => (
        <label style={{ ...btn('secondary', true), cursor: 'pointer' }}>
            <Upload size={13} /> {kind === 'xslt' ? '.xslt yükle' : '.xml yükle'}
            <input type="file" data-admin-gallery-file={kind} accept={kind === 'xslt' ? '.xslt,.xsl,.xml' : '.xml'} style={{ display: 'none' }}
                onChange={async e => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (!f) return;
                    const text = await readFile(f);
                    set(kind, text);
                    if (kind === 'xslt' && !form.name.trim()) set('name', f.name.replace(/\.(xslt|xsl|xml)$/i, ''));
                }} />
        </label>
    );

    const codeArea = (kind: 'xslt' | 'xml') => (
        <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...labelStyle, margin: 0 }}>{kind === 'xslt' ? 'XSLT' : 'Örnek XML'}</span>
                <span style={{ fontSize: '0.7rem', color: C.dim }}>{form[kind] ? `${form[kind].split('\n').length} satır · ${(form[kind].length / 1024).toFixed(1)} KB` : 'boş'}</span>
                <span style={{ marginLeft: 'auto' }}>{fileBtn(kind)}</span>
            </div>
            <textarea data-admin-gallery-code={kind} value={form[kind]} onChange={e => set(kind, e.target.value)} spellCheck={false}
                placeholder={kind === 'xslt' ? 'XSLT içeriğini yapıştırın veya dosya yükleyin' : 'Önizlemede kullanılacak örnek XML'}
                style={{ ...inputStyle, height: 180, resize: 'vertical', fontFamily: 'Consolas, "Cascadia Code", monospace', fontSize: '0.74rem', lineHeight: 1.45, whiteSpace: 'pre' }} />
        </div>
    );

    return (
        <Modal title={editingId ? 'Galeri tasarımını düzenle' : 'Yeni galeri tasarımı'} onClose={onClose} width={1040}
            actions={<button type="button" data-admin-gallery-save disabled={saving} onClick={() => void save()} style={btn('primary', true)}>
                {saving ? <Spinner size={13} color="white" /> : <Save size={14} />} Kaydet
            </button>}>
            <div data-admin-gallery-form style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Ad</label>
                        <input data-admin-gallery-name value={form.name} onChange={e => set('name', e.target.value)} placeholder="ör. Kafe Adisyon Faturası" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Belge tipi</label>
                        <select data-admin-gallery-doctype value={form.doc_type_id} style={inputStyle}
                            onChange={e => { const d = docTypeOf(e.target.value); set('doc_type_id', e.target.value); set('module_id', moduleOptions(d)[0]); }}>
                            {WIZARD_DOC_TYPES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Editör modülü</label>
                        <select value={form.module_id} onChange={e => set('module_id', e.target.value)} style={inputStyle}>
                            {[...new Set([form.module_id, ...moduleOptions(docType)])].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Açıklama</label>
                        <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Kime, hangi durumda (1-2 cümle)" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Firma kategorisi</label>
                        <select data-admin-gallery-category value={form.category} style={inputStyle}
                            onChange={e => { const first = SECTORS.find(s => s.category === e.target.value); set('category', e.target.value); if (first) set('sector', first.id); }}>
                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Sektör</label>
                        <select data-admin-gallery-sector value={form.sector} onChange={e => set('sector', e.target.value)} style={inputStyle}>
                            {sectors.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Vurgu rengi</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input type="color" value={form.accent} onChange={e => set('accent', e.target.value)} style={{ width: 44, height: 38, padding: 2, borderRadius: 8, border: `1px solid ${C.borderStrong}`, background: 'transparent', cursor: 'pointer' }} />
                            <input value={form.accent} onChange={e => set('accent', e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Etiketler (virgülle)</label>
                        <input data-admin-gallery-tags value={tagsText} onChange={e => setTagsText(e.target.value)} placeholder="Tevkifat, Banka bilgisi" style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, paddingBottom: 8 }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', cursor: 'pointer' }}>
                            <input type="checkbox" data-admin-gallery-published checked={form.published} onChange={e => set('published', e.target.checked)} /> Yayında
                        </label>
                        <span style={{ fontSize: '0.76rem', color: C.dim }}>Kaynak: {form.source === 'ai' ? 'Yapay zeka' : 'Elle'}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {codeArea('xslt')}
                    {codeArea('xml')}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" data-admin-gallery-validate onClick={() => validate()} disabled={!form.xslt || !form.xml} style={btn('secondary', true)}>
                        <CheckCircle2 size={14} /> Doğrula
                    </button>
                    <button type="button" onClick={() => setShowPreview(v => !v)} disabled={!form.xslt || !form.xml} style={btn('secondary', true)}>
                        <Eye size={14} /> {showPreview ? 'Önizlemeyi gizle' : 'Önizle'}
                    </button>
                </div>
                {validation && (
                    <div data-admin-gallery-validation style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Checks title="XSLT" result={validation.xslt} />
                        <Checks title="XML" result={validation.xml} />
                    </div>
                )}
                {showPreview && form.xslt && form.xml && (
                    <div style={{ height: 520, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.borderStrong}`, background: '#e2e8f0' }}>
                        <PreviewFrame xml={form.xml} xslt={form.xslt} title="Önizleme" />
                    </div>
                )}
                {error && <ErrorBox>{error}</ErrorBox>}
            </div>
        </Modal>
    );
};

export const Gallery: React.FC = () => {
    const { galleryDraft, setGalleryDraft } = useAdmin();
    const pushToast = useUiStore(s => s.pushToast);
    const [items, setItems] = useState<GalleryDesign[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [form, setForm] = useState<{ initial: GalleryDesignInput; id: number | null } | null>(() => galleryDraft ? { initial: emptyInput(galleryDraft), id: null } : null);
    const [preview, setPreview] = useState<GalleryDesign | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    useEffect(() => { if (galleryDraft) setGalleryDraft(null); }, [galleryDraft, setGalleryDraft]);

    useEffect(() => {
        let alive = true;
        adminApi.gallery().then(r => { if (alive) { setItems(r); setError(null); } }).catch(e => { if (alive) setError(errorText(e)); });
        return () => { alive = false; };
    }, [reloadKey]);

    const togglePublished = async (d: GalleryDesign) => {
        setBusyId(d.id);
        try {
            const saved = await adminApi.updateGallery(d.id, { ...toInput(d), published: !d.published });
            setItems(list => list && list.map(x => x.id === d.id ? saved : x));
        } catch (e) {
            pushToast({ kind: 'error', title: 'Güncellenemedi', description: errorText(e), ttl: 6000 });
        } finally {
            setBusyId(null);
        }
    };

    const remove = async (d: GalleryDesign) => {
        if (!window.confirm(`"${d.name}" galeriden silinsin mi? Bu işlem geri alınamaz.`)) return;
        setBusyId(d.id);
        try {
            await adminApi.deleteGallery(d.id);
            setItems(list => list && list.filter(x => x.id !== d.id));
            pushToast({ kind: 'success', title: 'Tasarım silindi', ttl: 4000 });
        } catch (e) {
            pushToast({ kind: 'error', title: 'Silinemedi', description: errorText(e), ttl: 6000 });
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div data-admin-section="gallery">
            <SectionHeader icon={<Images size={20} />} title="Galeri tasarımları"
                subtitle="Kullanıcı galerisine eklenen veritabanı tasarımları. Yayındaki tasarımlar kullanıcıların şablon galerisinde 'Yeni' rozetiyle görünür."
                actions={<>
                    <button type="button" onClick={() => setReloadKey(k => k + 1)} style={btn('ghost', true)}><RefreshCw size={14} /> Yenile</button>
                    <button type="button" data-admin-gallery-new onClick={() => setForm({ initial: emptyInput(), id: null })} style={btn('primary')}><Plus size={15} /> Yeni tasarım ekle</button>
                </>} />
            {error && <div style={{ marginBottom: 12 }}><ErrorBox>{error}</ErrorBox></div>}
            <Card pad={false} style={{ overflow: 'hidden' }}>
                <div className="adm-scroll" style={{ overflowX: 'auto' }}>
                    <table className="adm-table" data-admin-gallery-table>
                        <thead>
                            <tr><th>Ad</th><th>Belge tipi</th><th>Kategori / sektör</th><th>Kaynak</th><th>Yayında</th><th>Güncelleme</th><th style={{ textAlign: 'right' }}>İşlemler</th></tr>
                        </thead>
                        <tbody>
                            {!items && !error && <tr><td colSpan={7}><div style={{ display: 'flex', gap: 8, color: C.muted, padding: 10 }}><Spinner /> Yükleniyor…</div></td></tr>}
                            {items && items.length === 0 && <tr><td colSpan={7}><Empty>Henüz galeri tasarımı yok. "Yeni tasarım ekle" ile başlayın veya yapay zeka bölümünden yayınlayın.</Empty></td></tr>}
                            {items?.map(d => {
                                const doc = docTypeOf(d.doc_type_id);
                                const sec = sectorOf(d.sector);
                                return (
                                    <tr key={d.id} data-admin-gallery-row={d.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ width: 10, height: 34, borderRadius: 4, background: d.accent, flexShrink: 0 }} />
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700 }}>{d.name}</div>
                                                    {d.tags.length > 0 && <div style={{ fontSize: '0.7rem', color: C.dim }}>{d.tags.join(' · ')}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td><Badge color={doc?.color ?? C.dim}>{doc?.label ?? d.doc_type_id}</Badge></td>
                                        <td style={{ fontSize: '0.78rem' }}>
                                            <div>{categoryOf(d.category)?.label ?? d.category}</div>
                                            <div style={{ color: sec?.color ?? C.muted }}>{sec?.label ?? d.sector}</div>
                                        </td>
                                        <td>{d.source === 'ai' ? <Badge color="#a855f7"><Bot size={11} /> Yapay zeka</Badge> : <Badge color={C.sky}><Hand size={11} /> Elle</Badge>}</td>
                                        <td>
                                            <button type="button" role="switch" aria-checked={d.published} data-admin-gallery-toggle={d.id} disabled={busyId === d.id} onClick={() => void togglePublished(d)}
                                                title={d.published ? 'Yayından kaldır' : 'Yayınla'}
                                                style={{ width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative', background: d.published ? C.green : '#cbd5e1', transition: 'background 0.15s', opacity: busyId === d.id ? 0.6 : 1 }}>
                                                <span style={{ position: 'absolute', top: 3, left: d.published ? 21 : 3, width: 16, height: 16, borderRadius: 999, background: 'white', transition: 'left 0.15s' }} />
                                            </button>
                                        </td>
                                        <td style={{ color: C.muted, whiteSpace: 'nowrap' }}>{fmtDate(d.updated_at)}</td>
                                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'inline-flex', gap: 6 }}>
                                                <button type="button" data-admin-gallery-preview-btn={d.id} onClick={() => setPreview(d)} style={btn('secondary', true)} title="Önizle"><Eye size={13} /></button>
                                                <button type="button" data-admin-gallery-edit={d.id} onClick={() => setForm({ initial: toInput(d), id: d.id })} style={btn('secondary', true)} title="Düzenle"><Pencil size={13} /></button>
                                                <button type="button" data-admin-gallery-delete={d.id} disabled={busyId === d.id} onClick={() => void remove(d)} style={btn('danger', true)} title="Sil"><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {preview && (
                <Modal title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileCode2 size={16} /> {preview.name}</span>} onClose={() => setPreview(null)}
                    width={1180} height="92vh" bodyStyle={{ padding: 0, background: '#e2e8f0' }}>
                    <PreviewFrame xml={preview.xml} xslt={preview.xslt} title={`${preview.name} önizleme`} />
                </Modal>
            )}
            {form && (
                <DesignForm initial={form.initial} editingId={form.id} onClose={() => setForm(null)}
                    onSaved={saved => {
                        setItems(list => {
                            const rest = (list ?? []).filter(x => x.id !== saved.id);
                            return form.id ? (list ?? []).map(x => x.id === saved.id ? saved : x) : [saved, ...rest];
                        });
                        setForm(null);
                    }} />
            )}
        </div>
    );
};
