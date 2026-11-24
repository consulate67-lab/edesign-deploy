(() => {
  const qs = new URLSearchParams(location.search);
  const state = {
    step: 'intro', // intro | catalog | customize | download
    shop: (qs.get('shop') || sessionStorage.getItem('edx_shopify_shop') || '').toLowerCase(),
    country: (qs.get('country') || sessionStorage.getItem('edx_shopify_country') || 'TR').toUpperCase(),
    docType: (qs.get('doc_type') || sessionStorage.getItem('edx_shopify_doc') || '').toLowerCase(),
    templates: [],
    selected: null,
    previewHtml: '',
    previewBusy: false,
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
      /* App Bridge yoksa (dışarıdan açılış) sessiz geç */
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
    // index.html CDN script yüklediyse bekle; yoksa ekle
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
    // Session token hazır olsun
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
    // App Bridge: 401 + retry header → taze token ile bir kez dene
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

  function setStep(step) {
    state.step = step;
    render();
  }

  function priceLabel(cents) {
    return `$${((cents || 0) / 100).toFixed(2)}`;
  }

  function renderSteps() {
    const order = ['intro', 'catalog', 'customize', 'download'];
    const labels = {
      intro: ['1. Başla', 'Nasıl kullanılır'],
      catalog: ['2. Şablon', 'Tasarım seçin'],
      customize: ['3. Özelleştir', 'Logo / renk / unvan'],
      download: ['4. İndir', 'Satın al ve XSLT al'],
    };
    const idx = order.indexOf(state.step);
    return order.map((key, i) => {
      const cls = ['step'];
      if (key === state.step) cls.push('active');
      if (i < idx) cls.push('done');
      return `<div class="${cls.join(' ')}"><strong>${labels[key][0]}</strong>${labels[key][1]}</div>`;
    }).join('');
  }

  function renderIntro() {
    const how = state.bootstrap?.how_to || [];
    return `
      <section class="panel">
        <h2>Hazır e-fatura şablonları</h2>
        <p class="lead">
          Shopify mağazanız için hazır XSLT tasarım seçin, markanızı uygulayın ve dosyayı indirip
          kendi e-fatura entegratörünüze yükleyin. Bu uygulama siparişleri otomatik göndermez;
          tasarım dosyası üretir.
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

  function docTypeLabel(id) {
    return ({ fatura: 'e-Fatura', arsiv: 'e-Arşiv', irsaliye: 'e-İrsaliye' })[id] || id || '';
  }

  function renderCatalog() {
    const cards = state.templates.length
      ? state.templates.map((t) => {
          const sel = String(state.selected?.id) === String(t.id);
          return `
          <article class="card ${sel ? 'selected' : ''}" data-id="${escapeHtml(String(t.id))}">
            <h3>${escapeHtml(t.name)}</h3>
            <div class="meta">${escapeHtml(docTypeLabel(t.doc_type_id || t.module_id))} · ${escapeHtml(t.sector || t.module_id || '')}</div>
            <div class="meta clamp">${escapeHtml(t.description || 'Hazır fatura / irsaliye XSLT şablonu.')}</div>
            <div class="card-foot">
              <div class="price">${priceLabel(t.price_cents)}</div>
              <button type="button" data-pick="${escapeHtml(String(t.id))}">${sel ? 'Seçili' : 'Seç'}</button>
            </div>
          </article>`;
        }).join('')
      : `<div class="empty">Bu filtre için şablon yok. Belge tipi veya ülkeyi değiştirin.</div>`;

    const tabs = (state.docTypes || []).map((d) => `
      <button type="button" class="tab ${state.docType === d.id ? 'active' : ''}" data-doc="${escapeHtml(d.id)}">${escapeHtml(d.label)}</button>
    `).join('');

    const previewTitle = state.selected
      ? escapeHtml(state.selected.name)
      : 'Önizleme';
    const previewBody = !state.selected
      ? '<div class="preview-placeholder">Soldan bir şablon seçin; örnek XML ile önizleme burada açılır.</div>'
      : state.previewBusy
        ? '<div class="preview-placeholder">Önizleme hazırlanıyor…</div>'
        : `<iframe class="preview-frame" title="Şablon önizleme" srcdoc="${escapeHtml(state.previewHtml || '<p style=padding:16px;font-family:sans-serif>Önizleme yok</p>')}"></iframe>`;

    return `
      <section class="panel catalog-panel">
        <h2>Şablon vitrini</h2>
        <p class="lead">e-Fatura, e-Arşiv ve e-İrsaliye hazır şablonları. Seçtiğiniz belgenin örneği sağda görünür.</p>
        <div class="toolbar">
          <label class="field">Ülke
            <select id="country">${countryOptionsHtml()}</select>
          </label>
          <div class="tabs" id="doc-tabs">${tabs}</div>
          <button type="button" class="ghost" id="btn-reload">Yenile</button>
        </div>
        <div class="catalog-split">
          <div class="catalog-list">
            <div class="grid grid-compact">${cards}</div>
          </div>
          <aside class="catalog-preview">
            <div class="preview-head">
              <strong>${previewTitle}</strong>
              ${state.selected ? `<span class="meta">${escapeHtml(docTypeLabel(state.selected.doc_type_id || state.selected.module_id))}</span>` : ''}
            </div>
            <div class="preview-stage" id="preview-stage">${previewBody}</div>
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

  async function loadPreview(template) {
    if (!template) {
      state.previewHtml = '';
      state.previewBusy = false;
      return;
    }
    state.previewBusy = true;
    try {
      const id = encodeURIComponent(String(template.id));
      const data = await api(`/api/shopify/ui/templates/${id}/preview-source`);
      if (!data.xslt) throw new Error('XSLT yok');
      const parser = new DOMParser();
      const xsltDoc = parser.parseFromString(data.xslt, 'text/xml');
      const xmlDoc = parser.parseFromString(data.xml || '<?xml version="1.0"?><Invoice/>', 'text/xml');
      if (xsltDoc.querySelector('parsererror')) throw new Error('XSLT ayrıştırılamadı');
      if (xmlDoc.querySelector('parsererror')) throw new Error('Örnek XML ayrıştırılamadı');
      if (!window.XSLTProcessor) throw new Error('Tarayıcı XSLT desteklemiyor');
      const proc = new XSLTProcessor();
      proc.importStylesheet(xsltDoc);
      const out = proc.transformToDocument(xmlDoc);
      const html = new XMLSerializer().serializeToString(out);
      state.previewHtml = html.includes('<html')
        ? html
        : `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:12px;font-family:Segoe UI,sans-serif;background:#fff;color:#111}</style></head><body>${html}</body></html>`;
    } catch (e) {
      state.previewHtml = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:16px;color:#b91c1c">Önizleme alınamadı: ${escapeHtml(e.message)}</body></html>`;
    } finally {
      state.previewBusy = false;
    }
  }

  function renderCustomize() {
    const t = state.selected;
    if (!t) {
      return `<section class="panel"><p class="lead">Önce bir şablon seçin.</p>
        <button type="button" id="btn-back-catalog">Vitrine dön</button></section>`;
    }
    return `
      <section class="panel">
        <h2>${escapeHtml(t.name)}</h2>
        <p class="lead">Bu tasarım için marka bilgilerinizi girin. İsterseniz sonra edXdocu’da detaylı düzenleme yapabilirsiniz.</p>
        <div class="form-grid">
          <label class="field span2">Şirket / unvan
            <input id="company" placeholder="Örn. Sarp Soft Ltd." value="${escapeHtml(state.form.company_name)}" />
          </label>
          <label class="field">Accent rengi
            <input id="accent" type="color" value="${escapeHtml(state.form.accent || '#1e3a8a')}" />
          </label>
          <label class="field">Logo URL (opsiyonel)
            <input id="logo_url" placeholder="https://..." value="${escapeHtml(state.form.logo_url)}" />
          </label>
          <label class="field span2">veya logo dosyası yükle
            <input id="logo_file" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" />
          </label>
        </div>
        <div class="preview-box" id="logo-preview">
          Logo seçerseniz burada önizlenir. Marka, XSLT indirmede şablona işlenir.
        </div>
        <div class="footer-actions">
          <button type="button" class="ghost" id="btn-back-catalog2">Geri</button>
          <div class="right">
            <a href="${escapeHtml(t.design_url)}" target="_blank" rel="noopener">
              <button type="button" class="ghost">Tam editörde aç</button>
            </a>
            <button type="button" id="btn-to-download">Satın al / indir</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderDownload() {
    const t = state.selected;
    if (!t) {
      return `<section class="panel"><p class="lead">Önce bir şablon seçin.</p>
        <button type="button" id="btn-back-catalog3">Vitrine dön</button></section>`;
    }
    const free = state.bootstrap?.free_download;
    const billingOn = state.bootstrap?.billing_enabled;
    return `
      <section class="panel">
        <h2>Satın al ve indir</h2>
        <p class="lead">
          Seçilen tasarım: <strong>${escapeHtml(t.name)}</strong> ·
          <span class="price">${priceLabel(t.price_cents)}</span>
          ${free ? ' · Geliştirme: indirme açık' : ''}
          ${billingOn ? ' · Shopify Billing' : ' · Stub / test satın alma'}
          ${state.purchased ? ' · <strong>Hak açık</strong>' : ''}
        </p>
        <div class="howto" style="margin-bottom:16px">
          <article>
            <div class="n">A</div>
            <h3>${billingOn ? 'Shopify ile öde' : 'Satın alma'}</h3>
            <p>${billingOn
      ? 'Shopify onay ekranına yönlendirilirsiniz; onaydan sonra şablon hakkı açılır.'
      : 'Test/stub modunda hak anında açılır. Canlı satış için Public app + Billing gerekir.'}</p>
          </article>
          <article>
            <div class="n">B</div>
            <h3>XSLT indir</h3>
            <p>Ham veya markalı dosyayı indirip entegratörünüze yükleyin.</p>
          </article>
        </div>
        <div class="footer-actions">
          <button type="button" class="ghost" id="btn-back-customize">Geri</button>
          <div class="right">
            <button type="button" class="ghost" id="btn-purchase">${billingOn ? 'Satın al (Shopify)' : 'Satın al (test)'}</button>
            <button type="button" class="ghost" id="btn-dl-raw">XSLT indir</button>
            <button type="button" id="btn-dl-brand">Markalı indir</button>
          </div>
        </div>
      </section>
    `;
  }

  function bindCommon() {
    $('btn-start')?.addEventListener('click', async () => {
      setStep('catalog');
      await loadTemplates();
    });
    $('btn-back-intro')?.addEventListener('click', () => setStep('intro'));
    $('btn-back-catalog')?.addEventListener('click', () => setStep('catalog'));
    $('btn-back-catalog2')?.addEventListener('click', () => setStep('catalog'));
    $('btn-back-catalog3')?.addEventListener('click', () => setStep('catalog'));
    $('btn-back-customize')?.addEventListener('click', () => setStep('customize'));
    $('btn-to-customize')?.addEventListener('click', () => {
      if (!state.selected) return showMsg('Önce bir şablon seçin.', 'err');
      setStep('customize');
    });
    $('btn-to-download')?.addEventListener('click', () => {
      readCustomizeForm();
      setStep('download');
    });

    const country = $('country');
    if (country) {
      country.value = state.country || '';
      country.addEventListener('change', async () => {
        state.country = (country.value || '').toUpperCase();
        if (state.country) sessionStorage.setItem('edx_shopify_country', state.country);
        else sessionStorage.removeItem('edx_shopify_country');
        await loadTemplates();
      });
    }
    $('btn-reload')?.addEventListener('click', () => loadTemplates());

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
        if (state.selected?.accent && /^#/.test(state.selected.accent)) {
          state.form.accent = state.selected.accent;
        }
        render();
        if (state.step === 'catalog' && state.selected) {
          await loadPreview(state.selected);
          const stage = $('preview-stage');
          if (stage) {
            stage.innerHTML = `<iframe class="preview-frame" title="Şablon önizleme" srcdoc="${escapeHtml(state.previewHtml)}"></iframe>`;
          }
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
      if (file.size > 400_000) {
        showMsg('Logo 400 KB’dan küçük olmalı.', 'err');
        return;
      }
      const dataUrl = await readFileAsDataUrl(file);
      state.form.logo_data = dataUrl;
      state.form.logo_url = '';
      const urlInput = $('logo_url');
      if (urlInput) urlInput.value = '';
      updateLogoPreview();
    });

    $('btn-purchase')?.addEventListener('click', () => purchase());
    $('btn-dl-raw')?.addEventListener('click', () => downloadRaw());
    $('btn-dl-brand')?.addEventListener('click', () => downloadBrand());
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
      box.innerHTML = 'Logo seçerseniz burada önizlenir. Marka, XSLT indirmede şablona işlenir.';
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
    if (!state.shop) {
      showMsg('Mağaza bilgisi yok. Uygulamayı Shopify içinden açın veya ?shop=magaza.myshopify.com ekleyin.', 'err');
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
        // Embedded app: üst frame’e çık
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

  async function confirmBillingReturn() {
    const billing = qs.get('billing');
    const galleryId = Number(qs.get('gallery_id') || 0);
    if (billing !== 'return' || !galleryId) return;
    try {
      showMsg('Ödeme doğrulanıyor…');
      const chargeGid = qs.get('charge_id') || qs.get('charge_gid') || '';
      const q = new URLSearchParams({
        shop: state.shop || '',
        gallery_id: String(galleryId),
      });
      if (chargeGid) q.set('charge_gid', chargeGid.startsWith('gid://') ? chargeGid : `gid://shopify/AppPurchaseOneTime/${chargeGid}`);
      const r = await api(`/api/shopify/ui/billing/confirm?${q.toString()}`);
      state.purchased = true;
      state.selected = state.selected || { id: galleryId, name: `Şablon #${galleryId}`, price_cents: 0 };
      if (!state.selected.id) state.selected.id = galleryId;
      setStep('download');
      showMsg('Ödeme onaylandı; XSLT indirebilirsiniz.', 'ok');
      // URL temizle
      const clean = new URL(location.href);
      clean.searchParams.delete('billing');
      clean.searchParams.delete('gallery_id');
      clean.searchParams.delete('charge_id');
      clean.searchParams.delete('charge_gid');
      history.replaceState({}, '', clean.toString());
      void r;
    } catch (e) {
      setStep('download');
      showMsg(e.message, 'err');
    }
  }

  async function downloadRaw() {
    if (!state.selected) return;
    try {
      showMsg('İndiriliyor…');
      const url = new URL(tplApi(state.selected.id, '/download'), location.origin);
      if (state.shop) url.searchParams.set('shop', state.shop);
      const auth = await idTokenHeader();
      const res = await fetch(url.toString(), { headers: { ...shopHeaders(), ...auth } });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || res.statusText);
      }
      const blob = await res.blob();
      triggerDownload(blob, `${state.selected.name || 'template'}.xslt`);
      showMsg('İndirme başladı.', 'ok');
    } catch (e) {
      showMsg(e.message, 'err');
    }
  }

  async function downloadBrand() {
    if (!state.selected) return;
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
      showMsg('Markalı dosya indirildi. İsterseniz tam editör: ' + (data.design_url || ''), 'ok');
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
      if (state.docType) params.set('doc_type', state.docType);
      const q = params.toString() ? `?${params}` : '';
      const data = await api('/api/shopify/ui/templates' + q);
      state.templates = data.templates || [];
      if (Array.isArray(data.doc_types) && data.doc_types.length) state.docTypes = data.doc_types;
      if (state.selected) {
        state.selected = state.templates.find((t) => String(t.id) === String(state.selected.id)) || null;
      }
      showMsg(state.templates.length ? `${state.templates.length} şablon` : 'Katalog boş.', state.templates.length ? '' : 'err');
      render();
      if (state.step === 'catalog' && state.selected) {
        await loadPreview(state.selected);
        const stage = $('preview-stage');
        if (stage && state.previewHtml) {
          stage.innerHTML = `<iframe class="preview-frame" title="Şablon önizleme" srcdoc="${escapeHtml(state.previewHtml)}"></iframe>`;
        }
      }
    } catch (e) {
      showMsg(e.message, 'err');
    }
  }

  function tplApi(id, suffix) {
    return `/api/shopify/ui/templates/${encodeURIComponent(String(id))}${suffix || ''}`;
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
      // Meta’daki API key ile App Bridge’i önce hazırla (CDN script zaten index’te).
      const metaKey = document.querySelector('meta[name="shopify-api-key"]')?.content?.trim();
      if (metaKey) await ensureAppBridge(metaKey);

      state.bootstrap = await api('/api/shopify/ui/bootstrap');
      if (!state.shop && state.bootstrap.shop) state.shop = state.bootstrap.shop;
      if (Array.isArray(state.bootstrap.countries) && state.bootstrap.countries.length) {
        state.countries = state.bootstrap.countries;
      }
      if (state.bootstrap.api_key && state.bootstrap.api_key !== metaKey) {
        await ensureAppBridge(state.bootstrap.api_key);
        try {
          state.bootstrap = await api('/api/shopify/ui/bootstrap');
          if (!state.shop && state.bootstrap.shop) state.shop = state.bootstrap.shop;
          if (Array.isArray(state.bootstrap.countries) && state.bootstrap.countries.length) {
            state.countries = state.bootstrap.countries;
          }
        } catch {
          /* soft bootstrap — UI yine açılsın */
        }
      }
      render();
      await confirmBillingReturn();
    } catch (e) {
      $('main').innerHTML = `<section class="panel"><p class="lead">Başlatılamadı: ${escapeHtml(e.message)}</p>
        <p class="lead" style="font-size:14px;opacity:.8">Uygulamayı Shopify Admin içinden (Apps → EdXDocu) açın ve sayfayı yenileyin.</p></section>`;
      showMsg(e.message, 'err');
    }
  }

  boot();
})();
