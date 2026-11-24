(() => {
  const qs = new URLSearchParams(location.search);
  const state = {
    step: 'intro', // intro | catalog | customize | download
    shop: (qs.get('shop') || sessionStorage.getItem('edx_shopify_shop') || '').toLowerCase(),
    country: (qs.get('country') || sessionStorage.getItem('edx_shopify_country') || 'TR').toUpperCase(),
    docType: (qs.get('doc_type') || sessionStorage.getItem('edx_shopify_doc') || '').toLowerCase(),
    sector: (qs.get('sector') || sessionStorage.getItem('edx_shopify_sector') || '').toLowerCase(),
    templates: [],
    selected: null,
    previewHtml: '',
    previewBusy: false,
    previewWarning: '',
    bootstrap: null,
    docTypes: [
      { id: '', label: 'Tümü' },
      { id: 'fatura', label: 'e-Fatura' },
      { id: 'arsiv', label: 'e-Arşiv' },
      { id: 'irsaliye', label: 'e-İrsaliye' },
    ],
    countries: [
      { code: 'TR', label: 'Türkiye (TR)' },
      { code: 'DE', label: 'Almanya (DE)' },
      { code: 'BR', label: 'Brezilya (BR)' },
      { code: 'US', label: 'ABD (US)' },
      { code: 'IN', label: 'Hindistan (IN)' },
      { code: 'CN', label: 'Çin (CN)' },
      { code: 'RU', label: 'Rusya (RU)' },
    ],
    sectors: [],
    orders: [],
    orderId: sessionStorage.getItem('edx_shopify_order') || '',
    ordersWarning: '',
    downloadApproved: false,
    fullEditor: false,
    editorUrl: '',
    editorBusy: false,
    form: {
      company_name: '',
      accent: '#1e3a8a',
      logo_url: '',
      logo_data: '',
    },
    purchased: false,
  };

  const $ = (id) => document.getElementById(id);
  const msgEl = () => $('msg');

  function showMsg(text, kind) {
    const el = msgEl();
    if (!text) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = text;
    el.className = 'msg' + (kind === 'err' ? ' err' : kind === 'ok' ? ' ok' : '');
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function shopHeaders() {
    const h = { Accept: 'application/json' };
    if (state.shop) h['X-Shopify-Shop'] = state.shop;
    return h;
  }

  async function idTokenHeader() {
    try {
      if (window.shopify && typeof window.shopify.idToken === 'function') {
        const token = await window.shopify.idToken();
        if (token) return { Authorization: `Bearer ${token}` };
      }
    } catch {
      /* App Bridge yoksa sessiz geç */
    }
    return {};
  }

  async function ensureAppBridge(apiKey) {
    const meta = document.querySelector('meta[name="shopify-api-key"]');
    if (apiKey && meta && !meta.content) meta.content = apiKey;
    if (apiKey && !meta) {
      const m = document.createElement('meta');
      m.name = 'shopify-api-key';
      m.content = apiKey;
      document.head.appendChild(m);
    }
    if (!window.shopify) {
      await new Promise((resolve) => {
        const existing = document.querySelector('script[src*="shopifycloud/app-bridge"]');
        if (existing) {
          if (window.shopify) return resolve();
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => resolve());
          setTimeout(resolve, 1500);
          return;
        }
        const s = document.createElement('script');
        s.src = 'https://cdn.shopify.com/shopifycloud/app-bridge.js';
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.head.appendChild(s);
      });
    }
    for (let i = 0; i < 20 && !(window.shopify && typeof window.shopify.idToken === 'function'); i += 1) {
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  async function api(path, opts = {}) {
    const url = new URL(path, location.origin);
    if (state.shop && !url.searchParams.get('shop')) url.searchParams.set('shop', state.shop);
    const doFetch = async (auth) => fetch(url.toString(), {
      ...opts,
      headers: {
        ...shopHeaders(),
        ...auth,
        ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
        ...opts.headers,
      },
    });
    let auth = await idTokenHeader();
    let res = await doFetch(auth);
    if (res.status === 401 && res.headers.get('X-Shopify-Retry-Invalid-Session-Request') === '1') {
      auth = await idTokenHeader();
      if (auth.Authorization) res = await doFetch(auth);
    }
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('json')) {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || res.statusText);
      return data;
    }
    if (!res.ok) throw new Error((await res.text()) || res.statusText);
    return res;
  }

  function tplApi(id, suffix) {
    return `/api/shopify/ui/templates/${encodeURIComponent(String(id))}${suffix || ''}`;
  }

  function setStep(step) {
    state.step = step;
    render();
  }

  function priceLabel(cents) {
    return `$${((cents || 0) / 100).toFixed(2)}`;
  }

  function docTypeLabel(id) {
    return ({ fatura: 'e-Fatura', arsiv: 'e-Arşiv', irsaliye: 'e-İrsaliye' })[id] || id || '';
  }

  function renderSteps() {
    const order = ['intro', 'catalog', 'customize', 'download'];
    const labels = {
      intro: ['1. Başla', 'Nasıl kullanılır'],
      catalog: ['2. Şablon', 'Tasarım seçin'],
      customize: ['3. Özelleştir', 'Logo / renk / unvan'],
      download: ['4. İndir', 'Test → onay → XSLT'],
    };
    const idx = order.indexOf(state.step);
    return order.map((key, i) => {
      const cls = ['step'];
      if (key === state.step) cls.push('active');
      if (i < idx) cls.push('done');
      return `<div class="${cls.join(' ')}"><strong>${labels[key][0]}</strong>${labels[key][1]}</div>`;
    }).join('');
  }

  function countryOptionsHtml() {
    const opts = state.countries?.length ? state.countries : [];
    return [
      '<option value="">Tümü</option>',
      ...opts.map((c) => {
        const code = typeof c === 'string' ? c : c.code;
        const label = typeof c === 'string' ? c : (c.label || c.code);
        return `<option value="${escapeHtml(code)}">${escapeHtml(label)}</option>`;
      }),
    ].join('');
  }

  function sectorOptionsHtml() {
    return [
      '<option value="">Tüm sektörler</option>',
      ...(state.sectors || []).map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.label || s.id)}</option>`),
    ].join('');
  }

  function orderOptionsHtml() {
    return [
      '<option value="">Örnek XML (sipariş yok)</option>',
      ...(state.orders || []).map((o) => {
        const label = `${o.name || o.id} · ${o.total || ''} ${o.currency || ''} · ${o.customer || ''}`.trim();
        return `<option value="${escapeHtml(o.id)}">${escapeHtml(label)}</option>`;
      }),
    ].join('');
  }

  function previewStageHtml() {
    if (!state.selected) {
      return '<div class="preview-placeholder">Soldan şablon seçin. İsterseniz üstten Shopify siparişi seçerek kalemleri önizleyin.</div>';
    }
    if (state.previewBusy) return '<div class="preview-placeholder">Önizleme hazırlanıyor…</div>';
    return `<iframe class="preview-frame" title="Şablon önizleme" srcdoc="${escapeHtml(state.previewHtml || '<p style=padding:16px;font-family:sans-serif>Önizleme yok</p>')}"></iframe>`;
  }

  function renderIntro() {
    const how = state.bootstrap?.how_to || [];
    return `
      <section class="panel">
        <h2>Hazır e-fatura şablonları</h2>
        <p class="lead">
          Shopify mağazanız için hazır XSLT tasarım seçin, siparişinizle önizleyin, markanızı uygulayın.
          Önce test indirin; onayladıktan sonra gerçek dosyayı alın.
        </p>
        <div class="howto">
          ${how.map((h, i) => `
            <article>
              <div class="n">${i + 1}</div>
              <h3>${escapeHtml(h.title)}</h3>
              <p>${escapeHtml(h.body)}</p>
            </article>
          `).join('')}
        </div>
        <div class="footer-actions">
          <div></div>
          <div class="right">
            <button type="button" id="btn-start">Şablonlara geç</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderCatalog() {
    const isTR = state.country === 'TR';
    const cards = state.templates.length
      ? state.templates.map((t) => {
          const sel = String(state.selected?.id) === String(t.id);
          return `
          <article class="card ${sel ? 'selected' : ''}" data-id="${escapeHtml(String(t.id))}">
            <h3>${escapeHtml(t.name)}</h3>
            <div class="meta">${escapeHtml(docTypeLabel(t.doc_type_id || t.module_id))} · ${escapeHtml(t.sector_label || t.sector || '')}</div>
            <div class="meta clamp">${escapeHtml(t.description || 'Hazır fatura / irsaliye XSLT şablonu.')}</div>
            <div class="card-foot">
              <div class="price">${priceLabel(t.price_cents)}</div>
              <button type="button" data-pick="${escapeHtml(String(t.id))}">${sel ? 'Seçili' : 'Seç'}</button>
            </div>
          </article>`;
        }).join('')
      : `<div class="empty">Bu filtre için şablon yok. Ülke veya filtreleri değiştirin.</div>`;

    const tabs = isTR
      ? (state.docTypes || []).map((d) => `
      <button type="button" class="tab ${state.docType === d.id ? 'active' : ''}" data-doc="${escapeHtml(d.id)}">${escapeHtml(d.label)}</button>
    `).join('')
      : '';

    const warn = (state.previewWarning || state.ordersWarning)
      ? `<div class="preview-warn">${escapeHtml(state.previewWarning || state.ordersWarning)}</div>` : '';

    return `
      <section class="panel catalog-panel">
        <h2>Şablon vitrini</h2>
        <p class="lead">${isTR
    ? 'Türkiye e-Fatura / e-Arşiv / e-İrsaliye. Sektör ve sipariş seçerek sağda önizleyin.'
    : 'Ülkenize uygun hazır şablonlar. e-Fatura / sektör filtreleri yalnız Türkiye seçiliyken görünür.'}</p>
        <div class="toolbar">
          <label class="field">Ülke
            <select id="country">${countryOptionsHtml()}</select>
          </label>
          ${isTR ? `<label class="field">Sektör<select id="sector">${sectorOptionsHtml()}</select></label>` : ''}
          <label class="field grow">Sipariş (önizleme)
            <select id="order-pick">${orderOptionsHtml()}</select>
          </label>
          <button type="button" class="ghost" id="btn-reload">Yenile</button>
        </div>
        ${isTR ? `<div class="tabs" id="doc-tabs">${tabs}</div>` : ''}
        <div class="catalog-split">
          <div class="catalog-list"><div class="grid grid-compact">${cards}</div></div>
          <aside class="catalog-preview">
            <div class="preview-head">
              <strong>${state.selected ? escapeHtml(state.selected.name) : 'Önizleme'}</strong>
              ${state.selected ? `<span class="meta">${escapeHtml(docTypeLabel(state.selected.doc_type_id || state.selected.module_id))}</span>` : ''}
            </div>
            ${warn}
            <div class="preview-stage" id="preview-stage">${previewStageHtml()}</div>
          </aside>
        </div>
        <div class="footer-actions">
          <button type="button" class="ghost" id="btn-back-intro">Geri</button>
          <div class="right">
            <button type="button" id="btn-to-customize" ${state.selected ? '' : 'disabled'}>Özelleştirmeye geç</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderCustomize() {
    const t = state.selected;
    if (!t) {
      return `<section class="panel"><p class="lead">Önce bir şablon seçin.</p>
        <button type="button" id="btn-back-catalog">Vitrine dön</button></section>`;
    }
    const warn = state.previewWarning
      ? `<div class="preview-warn">${escapeHtml(state.previewWarning)}</div>` : '';

    if (state.fullEditor) {
      const src = state.editorUrl || t.design_url || '';
      return `
      <section class="panel catalog-panel editor-panel">
        <div class="editor-toolbar">
          <div>
            <h2 style="margin:0">Tasarım editörü · ${escapeHtml(t.name)}</h2>
            <p class="lead" style="margin:6px 0 0">Editör bu ekranda açık. Bitince kapatıp indirmeye geçebilirsiniz.</p>
          </div>
          <div class="right editor-actions">
            <button type="button" class="ghost" id="btn-close-editor">Editörü kapat</button>
            <button type="button" class="ghost" id="btn-open-editor">Tam editörde aç</button>
            <button type="button" id="btn-to-download">İndirmeye geç</button>
          </div>
        </div>
        ${state.editorBusy
    ? '<div class="preview-placeholder">Tasarım editörü yükleniyor…</div>'
    : `<iframe class="editor-frame" title="edXdocu tasarım editörü" src="${escapeHtml(src || '/shopify/editor/')}"></iframe>`}
      </section>`;
    }

    return `
      <section class="panel catalog-panel">
        <h2>Özelleştir · ${escapeHtml(t.name)}</h2>
        <p class="lead">Marka bilgilerinizi girin; sağda canlı önizleme. Tam editör bu ekranda açılır.</p>
        <div class="catalog-split">
          <div>
            <div class="form-grid">
              <label class="field span2">Şirket / unvan
                <input id="company" placeholder="Örn. Sarp Soft Ltd." value="${escapeHtml(state.form.company_name)}" />
              </label>
              <label class="field">Accent rengi
                <input id="accent" type="color" value="${escapeHtml(state.form.accent || '#1e3a8a')}" />
              </label>
              <label class="field">Logo URL
                <input id="logo_url" placeholder="https://..." value="${escapeHtml(state.form.logo_url)}" />
              </label>
              <label class="field span2">veya logo dosyası
                <input id="logo_file" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" />
              </label>
              <label class="field span2">Sipariş (önizleme)
                <select id="order-pick">${orderOptionsHtml()}</select>
              </label>
            </div>
            <div class="preview-box" id="logo-preview">Logo seçerseniz burada görünür.</div>
            <div class="footer-actions" style="margin-top:14px">
              <button type="button" class="ghost" id="btn-back-catalog2">Geri</button>
              <div class="right">
                <button type="button" class="ghost" id="btn-open-editor">Tam editörde aç</button>
                <button type="button" id="btn-to-download">İndirmeye geç</button>
              </div>
            </div>
          </div>
          <aside class="catalog-preview">
            <div class="preview-head"><strong>Canlı önizleme</strong></div>
            ${warn}
            <div class="preview-stage" id="preview-stage">${previewStageHtml()}</div>
          </aside>
        </div>
      </section>
    `;
  }

  async function openFullEditor() {
    if (!state.selected) return;
    state.fullEditor = true;
    state.editorBusy = true;
    state.editorUrl = '';
    render();
    try {
      // Aynı XSLTEditor — /shopify/editor (ana web sitesi değil)
      const q = state.orderId ? `?order_id=${encodeURIComponent(state.orderId)}` : '';
      const src = await api(tplApi(state.selected.id, `/preview-source${q}`));
      let designId;
      try {
        const ed = await api(tplApi(state.selected.id, '/editor-src'));
        designId = ed.gallery_id;
      } catch {
        designId = undefined;
      }
      const boot = {
        xslt: src.xslt || '',
        xml: src.xml || '',
        moduleId: src.module_id || state.selected.module_id || 'fatura',
        name: src.name || state.selected.name || 'Shopify şablon',
        designId,
      };
      sessionStorage.setItem('edx_shopify_editor', JSON.stringify(boot));
      state.editorUrl = `/shopify/editor/?t=${Date.now()}`;
    } catch (e) {
      showMsg(e.message || 'Editör hazırlanamadı.', 'err');
      state.fullEditor = false;
    } finally {
      state.editorBusy = false;
      render();
    }
  }

  function onEditorMessage(ev) {
    if (ev.origin !== location.origin) return;
    const data = ev.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'edx-shopify-editor-close') {
      state.fullEditor = false;
      state.editorUrl = '';
      setStep('customize');
      return;
    }
    if (data.type === 'edx-shopify-editor-work' && data.work?.xslt) {
      try {
        sessionStorage.setItem('edx_shopify_editor_work', JSON.stringify(data.work));
      } catch {
        /* ignore */
      }
    }
  }
  window.addEventListener('message', onEditorMessage);

  function renderDownload() {
    const t = state.selected;
    if (!t) {
      return `<section class="panel"><p class="lead">Önce bir şablon seçin.</p>
        <button type="button" id="btn-back-catalog3">Vitrine dön</button></section>`;
    }
    const free = state.bootstrap?.free_download;
    const billingOn = state.bootstrap?.billing_enabled;
    const approved = state.downloadApproved;
    return `
      <section class="panel">
        <h2>Test → onay → indir</h2>
        <p class="lead">
          <strong>${escapeHtml(t.name)}</strong> ·
          <span class="price">${priceLabel(t.price_cents)}</span>
          ${free ? ' · Geliştirme: indirme açık' : ''}
          ${billingOn ? ' · Shopify Billing' : ' · Stub / test satın alma'}
          ${state.purchased ? ' · <strong>Hak açık</strong>' : ''}
        </p>
        <div class="howto" style="margin-bottom:16px">
          <article>
            <div class="n">1</div>
            <h3>Test indir</h3>
            <p>Watermark’lı örnek XSLT. Satın alma gerekmez; üretimde kullanmayın.</p>
          </article>
          <article>
            <div class="n">2</div>
            <h3>Onayla</h3>
            <p>Önizleme ve test dosyasını kontrol ettikten sonra onay kutusunu işaretleyin.</p>
          </article>
          <article>
            <div class="n">3</div>
            <h3>Gerçek indir</h3>
            <p>${billingOn ? 'Shopify ile ödeyin, ardından ham veya markalı XSLT alın.' : 'Onay sonrası hak açılır; dosyayı indirin.'}</p>
          </article>
        </div>
        <label class="approve-row">
          <input type="checkbox" id="approve-dl" ${approved ? 'checked' : ''} />
          Önizlemeyi ve test indirmeyi kontrol ettim; gerçek indirmeyi onaylıyorum.
        </label>
        <div class="footer-actions">
          <button type="button" class="ghost" id="btn-back-customize">Geri</button>
          <div class="right">
            <button type="button" class="ghost" id="btn-dl-test">Test indir</button>
            <button type="button" class="ghost" id="btn-purchase" ${approved ? '' : 'disabled'}>${billingOn ? 'Satın al (Shopify)' : 'Satın al (test)'}</button>
            <button type="button" class="ghost" id="btn-dl-raw" ${approved ? '' : 'disabled'}>XSLT indir</button>
            <button type="button" id="btn-dl-brand" ${approved ? '' : 'disabled'}>Markalı indir</button>
          </div>
        </div>
      </section>
    `;
  }

  async function loadOrders() {
    if (!state.shop) {
      state.orders = [];
      return;
    }
    try {
      const data = await api('/api/shopify/ui/orders');
      state.orders = data.orders || [];
      state.ordersWarning = data.warning || '';
      if (state.orderId && !state.orders.some((o) => o.id === state.orderId)) {
        state.orderId = '';
        sessionStorage.removeItem('edx_shopify_order');
      }
    } catch (e) {
      state.orders = [];
      state.ordersWarning = e.message || 'Siparişler alınamadı.';
    }
  }

  async function loadPreview(template) {
    if (!template) {
      state.previewHtml = '';
      state.previewBusy = false;
      state.previewWarning = '';
      return;
    }
    state.previewBusy = true;
    state.previewWarning = '';
    try {
      const q = state.orderId ? `?order_id=${encodeURIComponent(state.orderId)}` : '';
      const data = await api(tplApi(template.id, `/preview-source${q}`));
      if (!data.xslt) throw new Error('XSLT yok');
      if (data.order_warning) state.previewWarning = data.order_warning;
      const parser = new DOMParser();
      const xsltDoc = parser.parseFromString(data.xslt, 'text/xml');
      const xmlDoc = parser.parseFromString(data.xml || '<?xml version="1.0"?><Invoice/>', 'text/xml');
      if (xsltDoc.querySelector('parsererror')) throw new Error('XSLT ayrıştırılamadı');
      if (xmlDoc.querySelector('parsererror')) throw new Error('XML ayrıştırılamadı');
      if (!window.XSLTProcessor) throw new Error('Tarayıcı XSLT desteklemiyor');
      const proc = new XSLTProcessor();
      proc.importStylesheet(xsltDoc);
      const out = proc.transformToDocument(xmlDoc);
      let html = new XMLSerializer().serializeToString(out);
      if (!html.includes('<html')) {
        html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:12px;font-family:Segoe UI,sans-serif;background:#fff;color:#111}</style></head><body>${html}</body></html>`;
      }
      state.previewHtml = html;
    } catch (e) {
      state.previewHtml = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:16px;color:#b91c1c">Önizleme alınamadı: ${escapeHtml(e.message)}</body></html>`;
    } finally {
      state.previewBusy = false;
    }
  }

  function refreshPreviewStage() {
    const stage = $('preview-stage');
    if (stage) stage.innerHTML = previewStageHtml();
  }

  function readCustomizeForm() {
    state.form.company_name = $('company')?.value?.trim() || state.form.company_name;
    state.form.accent = $('accent')?.value || state.form.accent;
    state.form.logo_url = $('logo_url')?.value?.trim() || state.form.logo_url;
  }

  function updateLogoPreview() {
    const box = $('logo-preview');
    if (!box) return;
    const src = state.form.logo_data || state.form.logo_url;
    if (!src) {
      box.innerHTML = 'Logo seçerseniz burada görünür.';
      return;
    }
    box.innerHTML = `Önizleme:<br/><img alt="logo" src="${escapeHtml(src)}" />`;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result || ''));
      fr.onerror = () => reject(new Error('Dosya okunamadı'));
      fr.readAsDataURL(file);
    });
  }

  function logoPayload() {
    return state.form.logo_data || state.form.logo_url || '';
  }

  async function purchase() {
    if (!state.selected) return;
    if (!state.downloadApproved) {
      showMsg('Önce testi onaylayın.', 'err');
      return;
    }
    if (!state.shop) {
      showMsg('Mağaza bilgisi yok. Uygulamayı Shopify içinden açın.', 'err');
      return;
    }
    try {
      showMsg('Satın alma başlatılıyor…');
      const r = await api(tplApi(state.selected.id, '/purchase'), {
        method: 'POST',
        body: JSON.stringify({ shop: state.shop }),
      });
      if (r.already_entitled || r.stub) {
        state.purchased = true;
        showMsg(r.already_entitled ? 'Bu şablon için hak zaten açık.' : 'Test hakkı açıldı; indirebilirsiniz.', 'ok');
        return;
      }
      if (r.confirmation_url) {
        showMsg('Shopify ödeme onayına yönlendiriliyorsunuz…', 'ok');
        const target = r.confirmation_url;
        if (window.top && window.top !== window) window.top.location.href = target;
        else location.href = target;
        return;
      }
      state.purchased = true;
      showMsg('Satın alma tamam.', 'ok');
    } catch (e) {
      showMsg(e.message, 'err');
    }
  }

  async function downloadFile(mode) {
    if (!state.selected) return;
    if (mode !== 'test' && !state.downloadApproved) {
      showMsg('Önce testi onaylayın.', 'err');
      return;
    }
    try {
      showMsg(mode === 'test' ? 'Test dosyası indiriliyor…' : 'İndiriliyor…');
      const url = new URL(tplApi(state.selected.id, '/download'), location.origin);
      if (state.shop) url.searchParams.set('shop', state.shop);
      if (mode === 'test') url.searchParams.set('mode', 'test');
      const auth = await idTokenHeader();
      const res = await fetch(url.toString(), { headers: { ...shopHeaders(), ...auth } });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || res.statusText);
      }
      const blob = await res.blob();
      const suffix = mode === 'test' ? '-test.xslt' : '.xslt';
      triggerDownload(blob, `${state.selected.name || 'template'}${suffix}`);
      showMsg(mode === 'test' ? 'Test indirme başladı (watermark’lı).' : 'İndirme başladı.', 'ok');
    } catch (e) {
      showMsg(e.message, 'err');
    }
  }

  async function downloadBrand() {
    if (!state.selected) return;
    if (!state.downloadApproved) {
      showMsg('Önce testi onaylayın.', 'err');
      return;
    }
    readCustomizeForm();
    try {
      showMsg('Markalı XSLT hazırlanıyor…');
      const data = await api(tplApi(state.selected.id, '/brand'), {
        method: 'POST',
        body: JSON.stringify({
          company_name: state.form.company_name,
          accent: state.form.accent,
          logo_url: logoPayload(),
          download: false,
        }),
      });
      const blob = new Blob([data.xslt], { type: 'application/xslt+xml' });
      triggerDownload(blob, data.filename || 'branded.xslt');
      showMsg('Markalı dosya indirildi.', 'ok');
    } catch (e) {
      showMsg(e.message, 'err');
    }
  }

  function triggerDownload(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function loadTemplates() {
    try {
      showMsg('Şablonlar yükleniyor…');
      const params = new URLSearchParams();
      if (state.country) params.set('country', state.country);
      if (state.country === 'TR') {
        if (state.docType) params.set('doc_type', state.docType);
        if (state.sector) params.set('sector', state.sector);
      }
      const q = params.toString() ? `?${params}` : '';
      const data = await api(`/api/shopify/ui/templates${q}`);
      state.templates = data.templates || [];
      if (Array.isArray(data.doc_types) && data.doc_types.length) state.docTypes = data.doc_types;
      if (Array.isArray(data.sectors)) state.sectors = data.sectors;
      if (Array.isArray(data.countries) && data.countries.length) state.countries = data.countries;
      if (state.selected) {
        state.selected = state.templates.find((t) => String(t.id) === String(state.selected.id)) || null;
      }
      showMsg(state.templates.length ? `${state.templates.length} şablon` : 'Katalog boş.', state.templates.length ? '' : 'err');
      render();
      if ((state.step === 'catalog' || state.step === 'customize') && state.selected) {
        await loadPreview(state.selected);
        refreshPreviewStage();
      }
    } catch (e) {
      showMsg(e.message, 'err');
    }
  }

  async function confirmBillingReturn() {
    const chargeId = qs.get('charge_id') || qs.get('charge_gid');
    const galleryId = qs.get('gallery_id');
    if (!chargeId || !galleryId) return;
    try {
      setStep('download');
      showMsg('Ödeme onaylanıyor…');
      const r = await api(`/api/shopify/ui/billing/confirm?charge_id=${encodeURIComponent(chargeId)}&gallery_id=${encodeURIComponent(galleryId)}`);
      if (r.ok) {
        state.purchased = true;
        state.downloadApproved = true;
        showMsg('Ödeme onaylandı; indirebilirsiniz.', 'ok');
      }
    } catch (e) {
      setStep('download');
      showMsg(e.message, 'err');
    }
  }

  function bindCommon() {
    $('btn-start')?.addEventListener('click', async () => {
      setStep('catalog');
      await loadOrders();
      await loadTemplates();
    });
    $('btn-back-intro')?.addEventListener('click', () => setStep('intro'));
    $('btn-back-catalog')?.addEventListener('click', () => setStep('catalog'));
    $('btn-back-catalog2')?.addEventListener('click', () => {
      state.fullEditor = false;
      setStep('catalog');
    });
    $('btn-back-catalog3')?.addEventListener('click', () => setStep('catalog'));
    $('btn-back-customize')?.addEventListener('click', () => {
      state.fullEditor = false;
      setStep('customize');
    });
    $('btn-to-customize')?.addEventListener('click', async () => {
      if (!state.selected) return showMsg('Önce bir şablon seçin.', 'err');
      state.fullEditor = false;
      setStep('customize');
      await loadPreview(state.selected);
      refreshPreviewStage();
      updateLogoPreview();
    });
    $('btn-open-editor')?.addEventListener('click', () => openFullEditor());
    $('btn-close-editor')?.addEventListener('click', () => {
      state.fullEditor = false;
      state.editorUrl = '';
      setStep('customize');
    });
    $('btn-to-download')?.addEventListener('click', () => {
      readCustomizeForm();
      state.fullEditor = false;
      setStep('download');
    });

    const country = $('country');
    if (country) {
      country.value = state.country || '';
      country.addEventListener('change', async () => {
        state.country = (country.value || '').toUpperCase();
        if (state.country) sessionStorage.setItem('edx_shopify_country', state.country);
        else sessionStorage.removeItem('edx_shopify_country');
        if (state.country !== 'TR') {
          state.sector = '';
          state.docType = '';
          sessionStorage.removeItem('edx_shopify_sector');
          sessionStorage.removeItem('edx_shopify_doc');
        }
        await loadTemplates();
      });
    }

    const sector = $('sector');
    if (sector) {
      sector.value = state.sector || '';
      sector.addEventListener('change', async () => {
        state.sector = (sector.value || '').toLowerCase();
        if (state.sector) sessionStorage.setItem('edx_shopify_sector', state.sector);
        else sessionStorage.removeItem('edx_shopify_sector');
        await loadTemplates();
      });
    }

    const orderPick = $('order-pick');
    if (orderPick) {
      orderPick.value = state.orderId || '';
      orderPick.addEventListener('change', async () => {
        state.orderId = orderPick.value || '';
        if (state.orderId) sessionStorage.setItem('edx_shopify_order', state.orderId);
        else sessionStorage.removeItem('edx_shopify_order');
        if (state.selected) {
          await loadPreview(state.selected);
          refreshPreviewStage();
        }
      });
    }

    $('btn-reload')?.addEventListener('click', async () => {
      await loadOrders();
      await loadTemplates();
    });

    document.querySelectorAll('[data-doc]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        state.docType = btn.getAttribute('data-doc') || '';
        if (state.docType) sessionStorage.setItem('edx_shopify_doc', state.docType);
        else sessionStorage.removeItem('edx_shopify_doc');
        await loadTemplates();
      });
    });

    document.querySelectorAll('[data-pick]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-pick');
        state.selected = state.templates.find((t) => String(t.id) === String(id)) || null;
        state.purchased = false;
        state.downloadApproved = false;
        if (state.selected?.accent && /^#/.test(state.selected.accent)) {
          state.form.accent = state.selected.accent;
        }
        render();
        if (state.selected) {
          await loadPreview(state.selected);
          refreshPreviewStage();
        }
      });
    });

    $('company')?.addEventListener('input', (e) => { state.form.company_name = e.target.value; });
    $('accent')?.addEventListener('input', (e) => { state.form.accent = e.target.value; });
    $('logo_url')?.addEventListener('input', (e) => {
      state.form.logo_url = e.target.value;
      state.form.logo_data = '';
      updateLogoPreview();
    });
    $('logo_file')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        state.form.logo_data = await readFileAsDataUrl(file);
        state.form.logo_url = '';
        updateLogoPreview();
      } catch (err) {
        showMsg(err.message, 'err');
      }
    });

    $('approve-dl')?.addEventListener('change', (e) => {
      state.downloadApproved = Boolean(e.target.checked);
      render();
    });
    $('btn-dl-test')?.addEventListener('click', () => downloadFile('test'));
    $('btn-purchase')?.addEventListener('click', () => purchase());
    $('btn-dl-raw')?.addEventListener('click', () => downloadFile('live'));
    $('btn-dl-brand')?.addEventListener('click', () => downloadBrand());
  }

  function render() {
    $('steps').innerHTML = renderSteps();
    $('shop-pill').textContent = state.shop
      ? `Mağaza: ${state.shop}`
      : 'Mağaza: (Shopify içinden açın)';
    const body = {
      intro: renderIntro,
      catalog: renderCatalog,
      customize: renderCustomize,
      download: renderDownload,
    }[state.step]();
    $('main').innerHTML = body;
    bindCommon();
    if (state.step === 'customize') updateLogoPreview();
  }

  async function boot() {
    try {
      if (state.shop) sessionStorage.setItem('edx_shopify_shop', state.shop);
      const metaKey = document.querySelector('meta[name="shopify-api-key"]')?.content?.trim();
      if (metaKey) await ensureAppBridge(metaKey);

      state.bootstrap = await api('/api/shopify/ui/bootstrap');
      if (!state.shop && state.bootstrap.shop) state.shop = state.bootstrap.shop;
      if (Array.isArray(state.bootstrap.countries) && state.bootstrap.countries.length) {
        state.countries = state.bootstrap.countries;
      }
      if (Array.isArray(state.bootstrap.sectors)) state.sectors = state.bootstrap.sectors;
      if (state.bootstrap.api_key && state.bootstrap.api_key !== metaKey) {
        await ensureAppBridge(state.bootstrap.api_key);
        try {
          state.bootstrap = await api('/api/shopify/ui/bootstrap');
          if (!state.shop && state.bootstrap.shop) state.shop = state.bootstrap.shop;
          if (Array.isArray(state.bootstrap.countries) && state.bootstrap.countries.length) {
            state.countries = state.bootstrap.countries;
          }
          if (Array.isArray(state.bootstrap.sectors)) state.sectors = state.bootstrap.sectors;
        } catch {
          /* soft */
        }
      }
      render();
      await confirmBillingReturn();
    } catch (e) {
      $('main').innerHTML = `<section class="panel"><p class="lead">Başlatılamadı: ${escapeHtml(e.message)}</p>
        <p class="lead" style="font-size:14px;opacity:.8">Uygulamayı Shopify Admin içinden (Apps → EdXDocu) açın ve yenileyin.</p></section>`;
      showMsg(e.message, 'err');
    }
  }

  boot();
})();
