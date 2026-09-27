# Designer 2.0 — Mimari Spesifikasyon
**Tarih:** 2026-09-27
**Durum:** Phase 16 (Foundation başlangıcı)
**Önceki:** `src/ProfessionalDesigner.tsx` (293 KB, 3500+ satır, monolithic)

---

## Selim'in İhtiyaçları (orijinal)

> "Dizayn düzenleme ekranından memnun değil, objeleri ekleme olsun sonradan müdahale olsun sıkıntılı. Bana çok daha düzgün gerçekten bu işi becermiş bir dizayn ekranı tasarlarsan daha iyi olucak ama bir daha açıklama yapmak istiyorum:

1. **İlk önce XSLT görüntüleyen bir ekran** — XSLT yükle → render gör
2. **Bu ekranda olmayan objeleri eklemek** — yeni element ekleme (text, image, qr vb.)
3. **Sonra bu düzaynı farklı bir isimle XSLT olarak dizaynda göründüğü şekilde kayıt etmek** — kaydet (XSLT olarak download)
4. **Şu an dizayn ekranında olan özelliklerin aynılarını istiyorum** — feature parity
5. **Objeleri sürükle bırak şeklinde olmayan alanları ekleme** — tıkla-yerleştir (placingMode) çalışmalı
6. **Mevcut alanları istediğim yere taşıma şansım olmalıdır** — element taşıma çalışmalı (drag + keyboard)"

---

## Hedefler

- **Çalışan** — sürükle-bırak + tıkla-yerleştir + property panel **bug-free**
- **Anlaşılır** — yeni kullanıcı 5 dakikada öğrenebilsin
- **Görsel** — temiz, modern, karanlık tema
- **Performanslı** — XSLT render <500ms, UI <100ms tepki
- **Genişletilebilir** — Faz 14 (FastReport section) yapısı temel olacak

---

## Yeni Mimari

```
src/designer/v2/
├── DesignerApp.tsx          (ana orkestratör, 4 panel bir araya getirir)
├── DesignerToolbar.tsx      (üst bar: Geri Al/Yinele, Kaydet, İndir, Önizleme)
├── DesignerSidebar.tsx      (sol panel: Section tree + Element listesi)
├── DesignerCanvas.tsx       (orta: iframe + click-to-place + drag-drop)
├── DesignerProperties.tsx   (sağ panel: seçili element özellikleri)
├── DesignerStatusBar.tsx    (alt bar: zoom, mod, ipucu, hata mesajı)
├── InspectorPanel.tsx       (gelişmiş: XML dropdown, snippet library)
├── hooks/
│   ├── useDesignerState.ts  (merkezi state: sections + elements + selection)
│   ├── useDragDrop.ts        (sürükle-bırak hook)
│   ├── useClickPlace.ts     (tıkla-yerleştir modu hook)
│   ├── useUndoHistory.ts     (Phase 14.2: geri al/yinele — mevcut useUndoHistory taşı)
│   └── useKeyboardShortcuts.ts (Delete, Ctrl+C/V/Z, ArrowKeys)
├── components/
│   ├── SectionTree.tsx       (sol üst: 5 section + element tree)
│   ├── ElementList.tsx       (sol alt: section element listesi)
│   ├── PropertyField.tsx     (sağ: input/textarea/select generic field)
│   ├── PropertySection.tsx   (sağ: collapsible section header)
│   └── ToolButton.tsx        (toolbar button)
└── utils/
    ├── clickToPlace.ts       (tıkla → grid snap → element oluştur)
    ├── elementFactory.ts     (XML → element, varsayılan değerler)
    └── renderer.ts            (state → XSLT, XSLT → preview HTML)
```

---

## State Mimarisi

### Single Source of Truth: `useDesignerState`

```ts
type DesignerState = {
    // Sections (Phase 14 FastReport)
    sections: SectionsMap;        // 5 section — reportHeader, partyHeader, masterData, totals, reportFooter

    // Selection
    activeSectionId: SectionId;
    selectedElementId: string | null;

    // UI state
    mode: 'idle' | 'clickPlace' | 'dragElement' | 'marqueeSelect';
    zoom: number;                 // 0.25 - 2.0
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;              // 5px default

    // XSLT
    originalXslt: string;
    xmlPreview: string;            // XML data
    xsltOutput: string;           // Generated XSLT
    htmlPreview: string;           // Final HTML for iframe

    // History
    history: { sections: SectionsMap }[];
    historyIndex: number;

    // Tool selection
    activeTool: 'select' | 'text' | 'image' | 'shape' | 'qrcode' | 'formula' | 'table';
};

type DesignerAction =
    | { type: 'SELECT_ELEMENT'; payload: { id: string } }
    | { type: 'SET_MODE'; payload: { mode: DesignerState['mode'] } }
    | { type: 'PLACE_ELEMENT'; payload: { sectionId: SectionId; element: DesignElement } }
    | { type: 'MOVE_ELEMENT'; payload: { id: string; dx: number; dy: number } }
    | { type: 'UPDATE_ELEMENT'; payload: { id: string; patch: Partial<DesignElement> } }
    | { type: 'DELETE_ELEMENT'; payload: { id: string } }
    | { type: 'CLONE_ELEMENT'; payload: { id: string } }
    | { type: 'SET_ZOOM'; payload: { zoom: number } }
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'IMPORT_XSLT'; payload: { xslt: string } }
    | { type: 'EXPORT_XSLT' };
```

### useDesignerState reducer

```ts
function designerReducer(state: DesignerState, action: DesignerAction): DesignerState {
    switch (action.type) {
        case 'SELECT_ELEMENT': return { ...state, selectedElementId: action.payload.id };
        case 'PLACE_ELEMENT': {
            const section = state.sections[action.payload.sectionId];
            return {
                ...state,
                sections: {
                    ...state.sections,
                    [action.payload.sectionId]: {
                        ...section,
                        elements: [...section.elements, action.payload.element]
                    }
                },
                selectedElementId: action.payload.element.id
            };
        }
        case 'UPDATE_ELEMENT': {
            // Section'lar arası element güncellemesi — yeni sections map'i üret
            const newSections = { ...state.sections };
            for (const secId of Object.keys(newSections) as SectionId[]) {
                newSections[secId] = {
                    ...newSections[secId],
                    elements: newSections[secId].elements.map(el =>
                        el.id === action.payload.id ? { ...el, ...action.payload.patch } : el
                    )
                };
            }
            return { ...state, sections: newSections };
        }
        // ... delete, clone, undo/redo
    }
}
```

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [← Geri] [↶ ↷] [📁 XSLT Yükle] [💾 Kaydet] [⬇ İndir] e-Fatura │ üst bar
├─────────────┬───────────────────────────────────────┬───────────────────┤
│ SECTIONS    │                                       │ ÖZELLİKLER        │
│ ▸ Rprt Hdr   │                                       │                   │
│   • Logo    │           DESIGNER CANVAS              │  Tür: Metin       │
│   • Başlık  │     (iframe XSLT render + grid)        │  İçerik: [input]  │
│ ▸ Party Hdr │                                       │  Konum: X=120 Y=80│
│   • Tedarik │                                       │  Boyut: W=200 H=40│
│   • Müşteri │                                       │  Font: [select]   │
│ ▸ Master    │                                       │  Renk: [color]    │
│   • Tablo   │                                       │                   │
│ ▸ Totals    │                                       │                   │
│   • Net     │                                       │                   │
│ ▸ Footer    │                                       │                   │
│             │                                       │                   │
│ ELEMENTS    │                                       │                   │
│ [+] Text    │                                       │                   │
│ [+] Image   │                                       │                   │
│ [+] QR      │                                       │                   │
│ [+] Shape   │                                       │                   │
├─────────────┴───────────────────────────────────────┴───────────────────┤
│ ◯ Seç ▢ Taşı ▣ Izgara [100%] e-Fatura  TR1.2   │ alt bar                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tıkla-Yerleştir (click-to-place) — KRİTİK

**Mevcut sorun:** `placingMode` state var ama `onClick` handler'da çalışmıyor olabilir.

**Yeni akış:**
1. Kullanıcı sol sidebarda "Text" butonuna basar → `setMode('clickPlace')` + aktif tool = text
2. İmleç canvas üzerinde `crosshair` olur
3. Kullanıcı canvas'ta bir yere tıklar → `onCanvasClick(x, y)` → element oluşturulur
4. Element aktif section'a eklenir (default: masterData)
5. Element `gridSize` ile snap edilir (5px)
6. Click modu otomatik `idle` moduna döner

**Hook:**
```ts
function useClickPlace(mode: string, onPlace: (x: number, y: number) => void) {
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleClick = (e: MouseEvent) => {
        if (mode !== 'clickPlace') return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = snapToGrid(e.clientX - rect.left);
        const y = snapToGrid(e.clientY - rect.top);
        onPlace(x, y);
    };

    return { canvasRef, handleClick };
}
```

---

## Sürükle-Bırak — KRİTİK

**Mevcut sorun:** dnd-kit var ama element reposition'lama bazen çalışmıyor.

**Yeni akış:**
1. Kullanıcı bir element'e tıklar → seçilir
2. Mouse ile sürükler → `onDragMove(deltaX, deltaY)` → element x/y güncellenir
3. Mouse bırakır → `onDragEnd()` → state'e kayıt

**Hook:**
```ts
function useElementDrag(selectedElementId, onMove) {
    const dragState = useRef({ dragging: false, startX: 0, startY: 0 });

    return {
        onMouseDown: (e) => {
            dragState.current = { dragging: true, startX: e.clientX, startY: e.clientY };
        },
        onMouseMove: (e) => {
            if (!dragState.current.dragging) return;
            const dx = snapToGrid(e.clientX - dragState.current.startX);
            const dy = snapToGrid(e.clientY - dragState.current.startY);
            onMove(dx, dy);
            dragState.current.startX = e.clientX;
            dragState.current.startY = e.clientY;
        },
        onMouseUp: () => { dragState.current.dragging = false; }
    };
}
```

---

## Klavye Kısayolları

| Tuş | Eylem |
|-----|-------|
| `Delete` / `Backspace` | Seçili elementi sil |
| `Ctrl/Cmd + C` | Kopyala |
| `Ctrl/Cmd + V` | Yapıştır |
| `Ctrl/Cmd + Z` | Geri al |
| `Ctrl/Cmd + Shift + Z` | Yinele |
| `Arrow Keys` | 1px taşı |
| `Shift + Arrow` | 10px taşı |
| `Esc` | Modu iptal et (clickPlace → idle) |
| `Enter` | Element içeriğini düzenle (text mode) |
| `Delete + Shift` | Section sil (onay modalı) |

---

## Property Panel Alanları (generic)

| Tip | Component | Validation |
|-----|-----------|------------|
| Text | `<textarea>` veya `<input>` | string |
| Number | `<input type="number">` | number |
| Color | `<input type="color">` | hex |
| Boolean | `<checkbox>` | true/false |
| Select | `<select>` | enum |
| Position | X/Y input pair | number |
| Size | W/H input pair | number |
| XPath | XML dropdown modal | UBL-TR path |
| Section | Section picker | SectionId |

---

## XSLT Import/Export

### Import
1. Kullanıcı XSLT dosyası yükler
2. `xsltToState()` Phase A.1 ile parse edilir
3. Sections'a migrate edilir (Phase 14.5 — migration script)
4. Canvas XSLT'yi render eder

### Export
1. Kullanıcı "İndir" butonuna basar
2. Filename input alır
3. `generateXSLT()` Phase 14 ile XSLT üretilir
4. Tarayıcı download tetiklenir

---

## Migration Path (Phase 14.5)

Mevcut `elements[]` array → yeni `sections` yapısı:

```ts
function migrateElementsToSections(oldState: DesignState): SectionsMap {
    const sections = createDefaultSections();
    oldState.elements.forEach(el => {
        // Element'in türüne göre section ata
        if (el.type === 'image') sections.reportHeader.elements.push(el);
        else if (el.type === 'table') sections.masterData.elements.push(el);
        else if (el.type === 'formula') sections.totals.elements.push(el);
        else sections.partyHeader.elements.push(el);
    });
    return sections;
}
```

---

## Geçiş Planı

### Phase 16 (Bu oturum) — İskelet
- ✅ Spec dosyası
- Yeni bileşen iskeletleri (boş render)
- useDesignerState hook (Phase 14 Sections API)
- Build + deploy + commit
- Eski ProfessionalDesigner.tsx korunur (geriye uyumlu)

### Phase 17 (Sonraki oturum) — Temel Özellikler
- Tıkla-yerleştir
- Element seçim (sol tree + sağ properties)
- Sürükle-bırak
- Property panel (generic field'lar)
- Delete/Copy/Paste klavye kısayolları

### Phase 18 — Gelişmiş
- Inline editing (iframe'te çift tık)
- Tree view (sol panel)
- Snippet library entegrasyonu
- Section migration (eski tasarımlar → yeni sections)
- XSLT export

### Phase 19 — Polish
- Zoom in/out + pan
- Grid + snap
- Multi-select
- Sağ tık menüsü
- Undo/Redo polish

### Phase 20 — Section Migrator
- Mevcut 75 standart alan → 5 section'a otomatik yerleştirme
- Selim'in tasarımları (varsa) migrate et

---

## Başarı Kriterleri (Definition of Done)

- [ ] Designer yükle < 1 saniye
- [ ] Tıkla-yerleştir: ilk tıklamada element oluşmalı (test 100/100)
- [ ] Sürükle-bırak: pixel-perfect, snap aktif
- [ ] Property panel: her değişiklik anlık yansımalı (debounce 0ms)
- [ ] Delete: element anında silinmeli
- [ ] Section tree: seçili section görsel highlight
- [ ] XSLT export: dosya indirilebilir, valid UBL-TR şemasında parse edilebilir
- [ ] Undo/Redo: 50 adım history stack
- [ ] Performance: 100 element ile scroll/drag 60fps
- [ ] Dark mode + light mode ready
- [ ] Keyboard navigasyonu tam

---

## Bilinen Riskler

1. **Phase 14 Sections API henüz production-ready değil** — Phase 14.3 (xsltMerger) eksik
2. **xsltToState parsing hâlâ buggy** — mevcut test coverage düşük
3. **iframe srcDoc performans sorunu** — 3 MB XSLT ile >500ms render
4. **dnd-kit eski sürüm** — yeni sürüme upgrade gerekli olabilir
5. **Bundle size** — ProfessionalDesigner 3.4 MB, yeni bileşenler +1 MB olabilir

---

## İlk Commit (Phase 16)

Bu commit'te:
1. ✅ SPEC.md (bu dosya)
2. Boş bileşen iskeletleri (DesignerApp, Canvas, Sidebar, Properties, Toolbar, Status)
3. useDesignerState hook (Phase 14 Sections API ile)
4. Build başarılı, eski Designer.tsx korunur

Sonraki commit'lerde gerçek davranış implementasyonu başlar.

---

**Hedef:** Designer 2.0, **25-30 Eylül 2026**'da (yarın + öbür gün) feature-complete olmalı. Mevcut session'ın (16:30 24 Eylül → 23:00 27 Eylül) mimari kararları korunur.
