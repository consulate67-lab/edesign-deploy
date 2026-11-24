(() => {
  const qs = new URLSearchParams(location.search);
  const state = {
    step: 'intro', // intro | catalog | customize | download
    shop: (qs.get('shop') || sessionStorage.getItem('edx_shopify_shop') || '').toLowerCase(),
    country: qs.get('country') || 'TR',
    templates: [],
    selected: null,
    bootstrap: null,
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
    if (!apiKey || window.shopify) return;
    if (!document.querySelector('meta[name="shopify-api-key"]')) {
      const meta = document.createElement('meta');
      meta.name = 'shopify-api-key';
      meta.content = apiKey;
      document.head.appendChild(meta);
    }
    await new Promise((resolve) => {
      const existing = document.querySelector('script[data-edx-app-bridge]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => resolve());
        if (window.shopify) resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://cdn.shopify.com/shopifycloud/app-bridge.js';
      s.async = true;
      s.dataset.edxAppBridge = '1';
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
    await new Promise((r) => setTimeout(r, 80));
  }

  async function api(path, opts = {}) {
    const url = new URL(path, location.origin);
    if (state.shop && !url.searchParams.get('shop')) url.searchParams.set('shop', state.shop);
    const auth = await idTokenHeader();
    const res = await fetch(url.toString(), {
      ...opts,
      headers: {
        ...shopHeaders(),
        ...auth,
        ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
        ...opts.headers,
      },
    });
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

  function renderCatalog() {
    const cards = state.templates.length
      ? state.templates.map((t) => `
          <article class="card ${state.selected?.id === t.id ? 'selected' : ''}" data-id="${t.id}">
            <h3>${escapeHtml(t.name)}</h3>
            <div class="meta">${escapeHtml(t.module_id || t.doc_type_id || '')} · ${(t.countries || []).join(', ')}</div>
            <div class="meta">${escapeHtml(t.description || 'Hazır fatura / irsaliye XSLT şablonu.')}</div>
            <div class="price">${priceLabel(t.price_cents)}</div>
            <div class="actions">
              <button type="button" data-pick="${t.id}">Bu tasarımı seç</button>
            </div>
          </article>
        `).join('')
      : `<div class="empty">Henüz yayınlı şablon yok. Admin panelinden bir galeri tasarımını Shopify’a yayınlayın.</div>`;

    return `
      <section class="panel">
        <h2>Şablon vitrini</h2>
        <p class="lead">Ülkenize uygun hazır tasarımı seçin. Sonraki adımda logo ve renk uygulayacaksınız.</p>
        <div class="toolbar">
          <label class="field">Ülke
            <select id="country">
              <option value="">Tümü</option>
              <option value="TR">Türkiye (TR)</option>
              <option value="BR">Brezilya (BR)</option>
              <option value="DE">Almanya (DE)</option>
              <option value="US">ABD (US)</option>
            </select>
          </label>
          <button type="button" class="ghost" id="btn-reload">Yenile</button>
        </div>
        <div class="grid">${cards}</div>
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
      country.value = state.country;
      country.addEventListener('change', async () => {
        state.country = country.value;
        await loadTemplates();
      });
    }
    $('btn-reload')?.addEventListener('click', () => loadTemplates());

    document.querySelectorAll('[data-pick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-pick'));
        state.selected = state.templates.find((t) => t.id === id) || null;
        state.purchased = false;
        if (state.selected?.accent && /^#/.test(state.selected.accent)) {
          state.form.accent = state.selected.accent;
        }
        render();
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
      const r = await api(`/api/shopify/ui/templates/${state.selected.id}/purchase`, {
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
      const url = new URL(`/api/shopify/ui/templates/${state.selected.id}/download`, location.origin);
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
      const data = await api(`/api/shopify/ui/templates/${state.selected.id}/brand`, {
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
      const q = state.country ? `?country=${encodeURIComponent(state.country)}` : '';
      const data = await api('/api/shopify/ui/templates' + q);
      state.templates = data.templates || [];
      if (state.selected) {
        state.selected = state.templates.find((t) => t.id === state.selected.id) || null;
      }
      showMsg(state.templates.length ? `${state.templates.length} şablon` : 'Katalog boş.', state.templates.length ? '' : 'err');
      render();
    } catch (e) {
      showMsg(e.message, 'err');
    }
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
      // İlk bootstrap token olmadan (api_key öğrenmek için); sonra App Bridge yüklenir.
      state.bootstrap = await api('/api/shopify/ui/bootstrap');
      if (!state.shop && state.bootstrap.shop) state.shop = state.bootstrap.shop;
      if (state.bootstrap.api_key) {
        await ensureAppBridge(state.bootstrap.api_key);
        // Token ile shop bilgisini tazele (embedded).
        try {
          state.bootstrap = await api('/api/shopify/ui/bootstrap');
          if (!state.shop && state.bootstrap.shop) state.shop = state.bootstrap.shop;
        } catch {
          /* require_session kapalıysa sorun değil */
        }
      }
      render();
      await confirmBillingReturn();
    } catch (e) {
      $('main').innerHTML = `<section class="panel"><p class="lead">Başlatılamadı: ${escapeHtml(e.message)}</p></section>`;
      showMsg(e.message, 'err');
    }
  }

  boot();
})();
