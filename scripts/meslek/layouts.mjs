// Meslek şablonları için yerleşim aileleri. Her yerleşim xslt.mjs parçalarını (P) kendi düzeninde birleştirir;
// renkler CSS değişkenleriyle (--a vurgu, --b ikincil, --t açık ton) verilir.

export const BASE_CSS = `
.sayfa { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 8.6pt; line-height: 1.45; color: var(--ink); background: #fff; padding: 12mm 12mm 14mm; }
.r { text-align: right; } .c { text-align: center; } .nw { white-space: nowrap; }
.marka { display: flex; gap: 4mm; align-items: center; }
.marka h1 { margin: 0; font-size: 14pt; line-height: 1.2; }
.slogan { font-size: 7.8pt; color: var(--soft); margin-top: 0.5mm; }
.taraf .rol { font-size: 6.8pt; letter-spacing: 0.09em; text-transform: uppercase; color: var(--a); font-weight: 700; margin-bottom: 0.8mm; }
.taraf .ad { font-weight: 700; font-size: 10pt; margin-bottom: 0.6mm; }
.taraf .k { color: var(--soft); font-size: 7.8pt; }
.taraf .k b { color: var(--ink); font-weight: 600; }
table.kunye { border-collapse: collapse; }
table.kunye td { padding: 0.6mm 0 0.6mm 3mm; font-size: 8pt; }
table.kunye td:first-child { color: var(--soft); padding-left: 0; }
table.kalem { width: 100%; border-collapse: collapse; margin-top: 4mm; }
table.kalem th { font-size: 7.2pt; font-weight: 700; padding: 2mm 1.8mm; text-align: left; }
table.kalem th.r { text-align: right; } table.kalem th.c { text-align: center; }
table.kalem td { padding: 2mm 1.8mm; vertical-align: top; border-bottom: 1px solid var(--line); }
table.kalem td.no { color: var(--soft); width: 7mm; }
.kad { font-weight: 600; }
.ack { color: var(--soft); font-size: 7.6pt; }
.kc { color: var(--soft); font-size: 7.2pt; }
.ist { color: var(--a); font-weight: 600; }
.cip { display: inline-block; background: var(--t); color: var(--a); border-radius: 1.5mm; padding: 0 1.6mm; margin: 0.8mm 1mm 0 0; font-size: 7pt; white-space: nowrap; }
.alt { display: flex; gap: 6mm; margin-top: 5mm; align-items: flex-start; }
.alt .sol { flex: 1; min-width: 0; }
.toplam { width: 80mm; flex: none; }
.toplam table { width: 100%; border-collapse: collapse; }
.toplam td { padding: 1.4mm 2mm; border-bottom: 1px solid var(--line); }
.toplam td.r { white-space: nowrap; }
.toplam tr.eksi td.r { color: #b42318; }
.toplam tr.ara td { font-weight: 700; }
.odenecek { display: flex; justify-content: space-between; align-items: center; gap: 3mm; padding: 2.6mm 3mm; margin-top: 2mm; font-weight: 700; font-size: 11pt; }
.odenecek small { display: block; font-size: 7pt; font-weight: 400; opacity: 0.85; }
.yaziyla { font-style: italic; color: var(--soft); margin-bottom: 2mm; }
.kutu { border: 1px solid var(--line); border-radius: 2mm; padding: 2.4mm 3mm; margin-top: 3mm; break-inside: avoid; }
.kutu h4 { margin: 0 0 1.4mm; font-size: 7pt; text-transform: uppercase; letter-spacing: 0.07em; color: var(--a); }
.ref { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.6mm 4mm; }
.ref > div b { display: block; font-size: 6.8pt; color: var(--soft); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.ref .genis { grid-column: 1 / -1; }
.notlar p { margin: 0 0 0.8mm; }
.iban { margin-top: 0.8mm; }
.dip { display: flex; justify-content: space-between; align-items: flex-end; gap: 6mm; margin-top: 6mm; padding-top: 3mm; border-top: 1px solid var(--line); font-size: 7pt; color: var(--soft); }
.dip .yasal { flex: 1; }
.dip .yasal p { margin: 0 0 0.8mm; }
.ust2 { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
`;

const totalsTable = (P) => `<table>${P.totals((l, val, cls) => `<tr class="${cls}"><td>${l}</td><td class="r">${val}</td></tr>`)}</table>`;
const payBox = (P, cls = 'odenecek') => (P.despatch ? '' : `<div class="${cls}"><span>${P.payLabel}<small>${P.tl}</small></span><span>${P.payable}</span></div>`);
const lower = (P) => `<div class="alt"><div class="sol">${P.despatch ? '' : `<div class="yaziyla">${P.yaziyla}</div>`}${P.lower}</div>${P.despatch ? '' : `<div class="toplam">${totalsTable(P)}${payBox(P)}</div>`}</div>`;
const dip = (P, qr = 92) => `<div class="dip"><div class="yasal">${P.legal.map((s) => `<p>${s}</p>`).join('')}<p>${P.ettn}</p></div>${P.qr(qr)}</div>`;

export const LAYOUTS = {
    /** Üstte tam genişlik renkli bant; firma beyaz, belge türü sağda. */
    serit: {
        css: `
.L-serit .bant { margin: -12mm -12mm 6mm; padding: 9mm 12mm 7mm; background: var(--a); color: #fff; display: flex; justify-content: space-between; align-items: center; }
.L-serit .bant .slogan { color: rgba(255,255,255,0.8); }
.L-serit .bant .tur { font-size: 15pt; font-weight: 300; letter-spacing: 0.04em; text-align: right; }
.L-serit .bant .tur small { display: block; font-size: 8pt; opacity: 0.8; letter-spacing: 0.02em; }
.L-serit .ust3 { display: grid; grid-template-columns: 1fr 1fr auto; gap: 6mm; }
.L-serit .taraf { border-top: 2px solid var(--b); padding-top: 2mm; }
.L-serit table.kalem th { background: var(--t); color: var(--a); border-bottom: 2px solid var(--a); }
.L-serit .odenecek { background: var(--a); color: #fff; border-radius: 1.5mm; }`,
        body: (P) => `<div class="sayfa L-serit">
<div class="bant"><div class="marka">${P.logo(56)}<div><h1>${P.brand}</h1><div class="slogan">${P.tagline}</div></div></div><div class="tur">${P.title}<small>${P.subtitle}</small></div></div>
<div class="ust3">${P.parties.join('')}<div>${P.meta}</div></div>
${P.upper}${P.lines}${lower(P)}${dip(P)}</div>`,
    },

    /** Sol kenarda kalın vurgu çubuğu; büyük belge başlığı sağda. */
    kenar: {
        css: `
.L-kenar { border-left: 7mm solid var(--a); padding-left: 11mm; }
.L-kenar .bas { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 4mm; border-bottom: 1px solid var(--line); }
.L-kenar .bas h1 { color: var(--a); }
.L-kenar .tur { text-align: right; }
.L-kenar .tur .t { font-size: 17pt; font-weight: 800; color: var(--a); line-height: 1.1; }
.L-kenar .tur .s { color: var(--soft); font-size: 7.5pt; margin-bottom: 2mm; }
.L-kenar .ust2 { margin-top: 4mm; }
.L-kenar .taraf { background: var(--t); border-radius: 2mm; padding: 3mm 3.5mm; }
.L-kenar table.kalem th { border-bottom: 2px solid var(--a); color: var(--a); text-transform: uppercase; letter-spacing: 0.05em; }
.L-kenar .odenecek { border: 2px solid var(--a); color: var(--a); border-radius: 1.5mm; }`,
        body: (P) => `<div class="sayfa L-kenar">
<div class="bas"><div class="marka">${P.logo(52)}<div><h1>${P.brand}</h1><div class="slogan">${P.tagline}</div></div></div><div class="tur"><div class="t">${P.title}</div><div class="s">${P.subtitle}</div>${P.meta}</div></div>
<div class="ust2">${P.parties.join('')}</div>
${P.upper}${P.lines}${lower(P)}${dip(P)}</div>`,
    },

    /** Gri zemin üzerinde beyaz kartlar. */
    kart: {
        css: `
.L-kart { background: #f3f4f6; }
.L-kart .kartK { background: #fff; border-radius: 3.5mm; padding: 4mm 5mm; margin-bottom: 4mm; border: 1px solid #e5e7eb; }
.L-kart .bas { display: flex; justify-content: space-between; align-items: center; }
.L-kart .bas h1 { color: var(--a); }
.L-kart .rozet { background: var(--a); color: #fff; border-radius: 10mm; padding: 1.5mm 4mm; font-weight: 700; font-size: 9.5pt; display: inline-block; }
.L-kart .rozet + div { text-align: right; margin-top: 1.5mm; }
.L-kart .taraf { background: #fff; border-radius: 3.5mm; padding: 4mm 5mm; border: 1px solid #e5e7eb; }
.L-kart .kutu { background: #fff; border-color: #e5e7eb; border-radius: 3mm; }
.L-kart table.kalem { margin-top: 0; }
.L-kart table.kalem th { color: var(--soft); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--line); }
.L-kart .odenecek { background: var(--t); color: var(--a); border-radius: 2.5mm; }
.L-kart .dip { border-top: 0; }`,
        body: (P) => `<div class="sayfa L-kart">
<div class="kartK bas"><div class="marka">${P.logo(50)}<div><h1>${P.brand}</h1><div class="slogan">${P.tagline}</div></div></div><div class="r"><span class="rozet">${P.title}</span><div>${P.meta}</div></div></div>
<div class="ust2" style="margin-bottom:4mm">${P.parties.join('')}</div>
${P.upper}<div class="kartK">${P.lines}</div>
<div class="kartK">${lower(P)}</div>${dip(P)}</div>`,
    },

    /** Dar fiş görünümü (esnaf / bilet / makbuz); tek sütun, kesikli çizgiler. */
    fis: {
        css: `
.L-fis { padding: 10mm 0; background: #fff; }
.L-fis .kc { display: none; }
.L-fis table.kalem { font-size: 7.6pt; }
.L-fis .rulo { width: 150mm; margin: 0 auto; border: 1px dashed #9ca3af; padding: 6mm 7mm; font-family: 'Cascadia Mono', Consolas, 'Courier New', monospace; font-size: 8.2pt; }
.L-fis .bas { text-align: center; border-bottom: 1px dashed #9ca3af; padding-bottom: 3mm; }
.L-fis .bas img { margin-bottom: 2mm; }
.L-fis .bas h1 { font-size: 12pt; color: var(--a); }
.L-fis .tur { margin-top: 2mm; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
.L-fis table.kunye { margin: 3mm auto 0; }
.L-fis .taraf { border-bottom: 1px dashed #9ca3af; padding: 2.5mm 0; }
.L-fis table.kalem th { border-bottom: 1px dashed #9ca3af; font-size: 7pt; }
.L-fis table.kalem td { border-bottom: 0; padding: 1.4mm 1mm; }
.L-fis table.kalem th { padding: 1.4mm 1mm; }
.L-fis .alt { display: block; }
.L-fis .toplam { width: auto; border-top: 1px dashed #9ca3af; margin-top: 2mm; }
.L-fis .toplam td { border-bottom: 0; padding: 0.8mm 0; }
.L-fis .odenecek { border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink); font-size: 12pt; padding: 2mm 0; }
.L-fis .kutu { border: 0; border-top: 1px dashed #9ca3af; border-radius: 0; padding: 2mm 0; }
.L-fis .ref { grid-template-columns: 1fr 1fr; }
.L-fis .dip { flex-direction: column; align-items: center; text-align: center; border-top: 1px dashed #9ca3af; }`,
        body: (P) => `<div class="sayfa L-fis"><div class="rulo">
<div class="bas">${P.logo(46)}<h1>${P.brand}</h1><div class="slogan">${P.tagline}</div><div class="tur">${P.title}</div>${P.meta}</div>
${P.parties.join('')}${P.upper}${P.lines}
<div class="alt"><div class="toplam">${P.despatch ? '' : totalsTable(P)}${payBox(P)}</div>${P.despatch ? '' : `<div class="yaziyla" style="margin-top:2mm">${P.yaziyla}</div>`}${P.lower}</div>
${dip(P, 104)}</div></div>`,
    },

    /** Serif yazı, ortalanmış başlık, ince çift çizgiler. */
    zarif: {
        css: `
.L-zarif { font-family: Georgia, 'Times New Roman', serif; padding: 14mm 16mm; }
.L-zarif .bas { text-align: center; padding-bottom: 4mm; border-bottom: 3px double var(--a); }
.L-zarif .bas h1 { font-size: 17pt; font-weight: 400; letter-spacing: 0.06em; color: var(--a); margin-top: 2mm; }
.L-zarif .slogan { font-style: italic; }
.L-zarif .tur { margin: 4mm 0 1mm; text-align: center; letter-spacing: 0.35em; text-transform: uppercase; font-size: 10pt; color: var(--b); }
.L-zarif table.kunye { margin: 0 auto; }
.L-zarif .ust2 { margin-top: 5mm; }
.L-zarif .taraf { border-left: 1px solid var(--a); padding-left: 4mm; }
.L-zarif .taraf .rol { color: var(--b); font-family: 'Segoe UI', Arial, sans-serif; }
.L-zarif table.kalem th { font-weight: 400; font-style: italic; border-bottom: 1px solid var(--a); border-top: 1px solid var(--a); color: var(--a); }
.L-zarif .kutu { border-radius: 0; border-color: var(--t); }
.L-zarif .odenecek { border-top: 3px double var(--a); border-bottom: 3px double var(--a); color: var(--a); font-weight: 400; font-size: 12pt; }`,
        body: (P) => `<div class="sayfa L-zarif">
<div class="bas">${P.logo(58)}<h1>${P.brand}</h1><div class="slogan">${P.tagline}</div></div>
<div class="tur">${P.title}</div>${P.meta}
<div class="ust2">${P.parties.join('')}</div>
${P.upper}${P.lines}${lower(P)}${dip(P)}</div>`,
    },

    /** Mühendislik formu: kutulu ızgara, her hücre çerçeveli. */
    teknik: {
        css: `
.L-teknik { font-family: 'Segoe UI', 'Arial Narrow', Arial, sans-serif; }
.L-teknik table.form { width: 100%; border-collapse: collapse; }
.L-teknik table.form > tbody > tr > td { border: 1px solid var(--ink); padding: 3mm; vertical-align: top; }
.L-teknik .bas h1 { font-size: 12.5pt; color: var(--ink); }
.L-teknik .tur { font-size: 13pt; font-weight: 800; color: var(--a); text-transform: uppercase; text-align: center; }
.L-teknik .tur small { display: block; font-size: 7pt; color: var(--soft); font-weight: 400; text-transform: none; }
.L-teknik .taraf .rol { color: var(--ink); background: var(--t); margin: -3mm -3mm 2mm; padding: 1mm 3mm; border-bottom: 1px solid var(--ink); }
.L-teknik table.kalem { margin-top: 3mm; }
.L-teknik table.kalem th, .L-teknik table.kalem td { border: 1px solid var(--ink); }
.L-teknik table.kalem th { background: var(--a); color: #fff; }
.L-teknik .kutu { border: 1px solid var(--ink); border-radius: 0; }
.L-teknik .toplam td { border: 1px solid var(--ink); }
.L-teknik .odenecek { border: 2px solid var(--ink); background: var(--t); }`,
        body: (P) => `<div class="sayfa L-teknik">
<table class="form"><tbody><tr><td class="bas" style="width:42%"><div class="marka">${P.logo(48)}<div><h1>${P.brand}</h1><div class="slogan">${P.tagline}</div></div></div></td><td class="tur" style="vertical-align:middle">${P.title}<small>${P.subtitle}</small></td><td style="width:30%">${P.meta}</td></tr>
<tr><td class="taraf" colspan="2">${P.partyBodies[0]}</td><td class="taraf">${P.partyBodies[1]}</td></tr></tbody></table>
${P.upper}${P.lines}${lower(P)}${dip(P)}</div>`,
    },

    /** Koyu başlık şeridi ve altında vurgu çizgisi; sanayi / nakliye. */
    endustri: {
        css: `
.L-endustri .bas { margin: -12mm -12mm 0; padding: 7mm 12mm; background: #1e293b; color: #fff; display: flex; justify-content: space-between; align-items: center; border-bottom: 5px solid var(--a); }
.L-endustri .bas .slogan { color: #cbd5e1; }
.L-endustri .bas h1 { text-transform: uppercase; letter-spacing: 0.04em; }
.L-endustri .tur { text-align: right; text-transform: uppercase; font-weight: 800; font-size: 13pt; letter-spacing: 0.08em; color: var(--b); }
.L-endustri .tur small { display: block; color: #cbd5e1; font-size: 7.2pt; letter-spacing: 0.03em; font-weight: 400; }
.L-endustri .serit2 { display: grid; grid-template-columns: 1fr 1fr auto; gap: 5mm; margin-top: 5mm; }
.L-endustri .taraf { border: 1px solid #cbd5e1; padding: 3mm; border-top: 3px solid #1e293b; }
.L-endustri table.kalem th { background: #1e293b; color: #fff; text-transform: uppercase; letter-spacing: 0.04em; }
.L-endustri table.kalem tbody tr:nth-child(even) td { background: #f8fafc; }
.L-endustri .odenecek { background: #1e293b; color: #fff; border-left: 6px solid var(--a); }`,
        body: (P) => `<div class="sayfa L-endustri">
<div class="bas"><div class="marka">${P.logo(50)}<div><h1>${P.brand}</h1><div class="slogan">${P.tagline}</div></div></div><div class="tur">${P.title}<small>${P.subtitle}</small></div></div>
<div class="serit2">${P.parties.join('')}<div>${P.meta}</div></div>
${P.upper}${P.lines}${lower(P)}${dip(P)}</div>`,
    },

    /** Büyük tipografi, bol beyaz alan. */
    modern: {
        css: `
.L-modern { padding: 14mm 14mm; }
.L-modern .bas { display: flex; justify-content: space-between; align-items: flex-start; }
.L-modern .tur { font-size: 25pt; font-weight: 800; color: var(--a); letter-spacing: -0.02em; line-height: 1; }
.L-modern .tur small { display: block; font-size: 8pt; color: var(--soft); font-weight: 400; letter-spacing: 0; margin-top: 2mm; }
.L-modern .marka { flex-direction: row-reverse; text-align: right; }
.L-modern .kunyeS { margin-top: 5mm; display: flex; gap: 8mm; }
.L-modern .ust2 { margin-top: 6mm; }
.L-modern .taraf { border-top: 3px solid var(--a); padding-top: 2.5mm; }
.L-modern table.kalem { margin-top: 6mm; }
.L-modern table.kalem th { background: var(--t); color: var(--a); }
.L-modern table.kalem th:first-child { border-radius: 2mm 0 0 2mm; } .L-modern table.kalem th:last-child { border-radius: 0 2mm 2mm 0; }
.L-modern .odenecek { color: var(--a); font-size: 15pt; border-top: 3px solid var(--a); padding-left: 0; padding-right: 0; }`,
        body: (P) => `<div class="sayfa L-modern">
<div class="bas"><div class="tur">${P.title}<small>${P.subtitle}</small></div><div class="marka">${P.logo(54)}<div><h1>${P.brand}</h1><div class="slogan">${P.tagline}</div></div></div></div>
<div class="kunyeS">${P.meta}</div>
<div class="ust2">${P.parties.join('')}</div>
${P.upper}${P.lines}${lower(P)}${dip(P)}</div>`,
    },

    /** Yumuşak tonlu bölümler, yuvarlak köşeler. */
    pastel: {
        css: `
.L-pastel .bas { background: var(--t); border-radius: 5mm; padding: 5mm 6mm; display: flex; justify-content: space-between; align-items: center; }
.L-pastel .bas h1 { color: var(--a); }
.L-pastel .tur { text-align: right; color: var(--a); font-weight: 700; font-size: 12pt; }
.L-pastel .ust3 { display: grid; grid-template-columns: 1fr 1fr auto; gap: 4mm; margin-top: 4mm; }
.L-pastel .taraf { border: 1.5px solid var(--t); border-radius: 4mm; padding: 3mm 4mm; }
.L-pastel .kunyeK { background: var(--t); border-radius: 4mm; padding: 3mm 4mm; }
.L-pastel table.kalem th { color: var(--a); border-bottom: 2px solid var(--t); }
.L-pastel .kutu { border: 1.5px solid var(--t); border-radius: 4mm; }
.L-pastel .odenecek { background: var(--a); color: #fff; border-radius: 4mm; }`,
        body: (P) => `<div class="sayfa L-pastel">
<div class="bas"><div class="marka">${P.logo(52)}<div><h1>${P.brand}</h1><div class="slogan">${P.tagline}</div></div></div><div class="tur">${P.title}</div></div>
<div class="ust3">${P.parties.join('')}<div class="kunyeK">${P.meta}</div></div>
${P.upper}${P.lines}${lower(P)}${dip(P)}</div>`,
    },

    /** Klasik matbu form: çift çerçeve, "Sayın" kutusu, tam ızgara tablo. */
    defter: {
        css: `
.L-defter { padding: 10mm; }
.L-defter .cerceve { border: 3px double var(--ink); padding: 6mm; min-height: 275mm; }
.L-defter .bas { display: grid; grid-template-columns: 1fr auto 1fr; gap: 5mm; align-items: start; border-bottom: 1px solid var(--ink); padding-bottom: 4mm; }
.L-defter .bas h1 { font-size: 12pt; }
.L-defter .tur { border: 2px solid var(--a); color: var(--a); padding: 2mm 5mm; text-align: center; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.L-defter .tur small { display: block; font-weight: 400; letter-spacing: 0; text-transform: none; font-size: 7pt; color: var(--soft); }
.L-defter .bas > div:last-child { justify-self: end; }
.L-defter .ust2 { margin-top: 4mm; }
.L-defter .taraf { border: 1px solid var(--ink); padding: 3mm; }
.L-defter .taraf .rol { color: var(--ink); }
.L-defter table.kalem th, .L-defter table.kalem td { border: 1px solid var(--ink); }
.L-defter table.kalem th { background: var(--t); color: var(--ink); text-align: center; }
.L-defter .toplam td { border: 1px solid var(--ink); }
.L-defter .kutu { border: 1px solid var(--ink); border-radius: 0; }
.L-defter .odenecek { border: 2px solid var(--ink); }`,
        body: (P) => `<div class="sayfa L-defter"><div class="cerceve">
<div class="bas"><div class="marka">${P.logo(46)}<div><h1>${P.brand}</h1><div class="slogan">${P.tagline}</div></div></div><div class="tur">${P.title}<small>${P.subtitle}</small></div><div>${P.meta}</div></div>
<div class="ust2">${P.parties.join('')}</div>
${P.upper}${P.lines}${lower(P)}${dip(P, 88)}</div></div>`,
    },

    /** Kurumsal: logo solda, sağda üst çizgili künye kutusu, zebra tablo. */
    kurumsal: {
        css: `
.L-kurumsal .bas { display: flex; justify-content: space-between; align-items: flex-start; }
.L-kurumsal .bas h1 { color: var(--ink); }
.L-kurumsal .kk { border-top: 3px solid var(--a); background: #f9fafb; padding: 3mm 4mm; min-width: 66mm; }
.L-kurumsal .kk .tur { font-weight: 800; color: var(--a); font-size: 11pt; margin-bottom: 1mm; }
.L-kurumsal .ust2 { margin-top: 6mm; }
.L-kurumsal .taraf { padding: 0 0 2mm; border-bottom: 1px solid var(--line); }
.L-kurumsal table.kalem th { background: var(--a); color: #fff; }
.L-kurumsal table.kalem tbody tr:nth-child(even) td { background: var(--t); }
.L-kurumsal table.kalem td { border-bottom: 0; }
.L-kurumsal .odenecek { background: var(--b); color: #fff; }`,
        body: (P) => `<div class="sayfa L-kurumsal">
<div class="bas"><div class="marka">${P.logo(60)}<div><h1>${P.brand}</h1><div class="slogan">${P.tagline}</div></div></div><div class="kk"><div class="tur">${P.title}</div>${P.meta}</div></div>
<div class="ust2">${P.parties.join('')}</div>
${P.upper}${P.lines}${lower(P)}${dip(P)}</div>`,
    },

    /** e-Bilet: delikli kenarlı bilet gövdesi ve koçan. */
    bilet: {
        css: `
.L-bilet { background: #f3f4f6; padding: 12mm 10mm; }
.L-bilet .bilet { display: flex; background: #fff; border-radius: 4mm; overflow: hidden; border: 1px solid #e5e7eb; }
.L-bilet .govde { flex: 1; padding: 6mm 7mm; }
.L-bilet .kocan { width: 50mm; border-left: 2px dashed #d1d5db; padding: 6mm 5mm; background: var(--t); display: flex; flex-direction: column; align-items: center; gap: 3mm; text-align: center; }
.L-bilet .bas { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 3mm; }
.L-bilet .bas h1 { color: var(--a); }
.L-bilet .tur { background: var(--a); color: #fff; padding: 1.5mm 4mm; border-radius: 10mm; font-weight: 700; }
.L-bilet .alanlar { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 3mm; margin-top: 4mm; }
.L-bilet .bf { border: 1px solid var(--line); border-radius: 2mm; padding: 2mm 3mm; }
.L-bilet .bf b { display: block; font-size: 6.8pt; color: var(--soft); text-transform: uppercase; letter-spacing: 0.05em; }
.L-bilet .bf span { font-size: 12pt; font-weight: 700; color: var(--a); }
.L-bilet .bf i { display: block; font-size: 7.2pt; color: var(--soft); font-style: normal; }
.L-bilet .ust2 { margin-top: 4mm; }
.L-bilet .odenecek { background: var(--a); color: #fff; border-radius: 2mm; }
.L-bilet .kocan .tutar { font-size: 14pt; font-weight: 800; color: var(--a); }`,
        body: (P) => `<div class="sayfa L-bilet"><div class="bilet"><div class="govde">
<div class="bas"><div class="marka">${P.logo(46)}<div><h1>${P.brand}</h1><div class="slogan">${P.tagline}</div></div></div><span class="tur">${P.title}</span></div>
<div class="alanlar">${P.ticket}</div>
<div class="ust2">${P.parties.join('')}</div>
${P.lines}${lower(P)}</div>
<div class="kocan">${P.meta}${P.qr(110)}<div class="tutar">${P.payable}</div><div class="ack">${P.ettn}</div></div></div>
<div class="dip"><div class="yasal">${P.legal.map((s) => `<p>${s}</p>`).join('')}</div></div></div>`,
    },
};
