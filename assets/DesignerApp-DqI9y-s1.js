import{j as t,a as ue}from"./index-B3qweA3r.js";import{R as z,r as h}from"./vendor-i18n-D1UrcLFy.js";import{s as me,aa as fe,ab as ge,ac as he,y as ie,I as be,H as oe,Q as ye,E as ve,z as Ae,b as Z,j as Te,u as we,D as _,a8 as ae,F as ce,ad as de,ae as Se,af as je,r as ne,ag as Ee,l as pe,ah as Ce,ai as Pe,aj as ke,ak as Ie,X as De,C as Le}from"./vendor-icons-DMckDZ0Y.js";import{s as U,i as Q,x as ze}from"./readonlyFields-B595h0HF.js";import"./vendor-dnd-f4m_iXKM.js";import"./vendor-state-LLmneBlK.js";const le=[{id:"fatura",label:"e-Fatura",template:"Modern_1.0_Fatura"},{id:"earsiv",label:"e-Arşiv",template:"Modern_1.0_eArsiv"}],Re=({docName:e,template:a,moduleId:n,canUndo:l,canRedo:r,onBack:s,onUndo:i,onRedo:y,onSave:x,onExport:o,onSetTool:b,activeTool:u,onModuleChange:v})=>{const[E,T]=z.useState(!1),B=[{id:"select",icon:he,label:"Seç (V)"},{id:"text",icon:ie,label:"Metin (T)"},{id:"image",icon:be,label:"Görsel (I)"},{id:"shape",icon:oe,label:"Şekil (S)"},{id:"qrcode",icon:ye,label:"QR (Q)"},{id:"formula",icon:ve,label:"Formül (F)"},{id:"table",icon:Ae,label:"Tablo (B)"}];return t.jsxs("div",{"data-designer-toolbar":!0,style:{display:"flex",alignItems:"center",padding:"0 16px",height:"100%",background:"rgba(30, 41, 59, 0.8)",backdropFilter:"blur(12px)",borderBottom:"1px solid #334155",gap:"12px"},children:[s&&t.jsx("button",{onClick:s,title:"Geri",style:O,children:t.jsx(me,{size:20})}),t.jsx("button",{onClick:i,disabled:!l,title:"Geri Al (Ctrl+Z)",style:{...O,opacity:l?1:.4,cursor:l?"pointer":"not-allowed"},children:t.jsx(fe,{size:18})}),t.jsx("button",{onClick:y,disabled:!r,title:"Yinele (Ctrl+Shift+Z)",style:{...O,opacity:r?1:.4,cursor:r?"pointer":"not-allowed"},children:t.jsx(ge,{size:18})}),t.jsx("div",{style:{width:"1px",height:"24px",background:"#334155",margin:"0 4px"}}),t.jsx("div",{style:{display:"flex",gap:"4px",background:"#0f172a",padding:"4px",borderRadius:"8px"},children:B.map(C=>t.jsx("button",{onClick:()=>b(C.id),title:C.label,style:{...O,background:u===C.id?"#6366f1":"transparent",color:u===C.id?"white":"#94a3b8",padding:"6px"},children:t.jsx(C.icon,{size:16})},C.id))}),t.jsx("div",{style:{flex:1}}),t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",color:"#94a3b8",fontSize:"13px"},children:[t.jsx("span",{style:{fontWeight:700,color:"white"},children:e}),t.jsx("span",{style:{padding:"2px 8px",background:"#0f172a",borderRadius:"4px",fontSize:"11px"},children:a}),v&&t.jsxs("div",{style:{position:"relative"},children:[t.jsxs("button",{onClick:()=>T(C=>!C),"data-designer-module-dropdown":!0,title:"Belge modülü seç (e-Fatura / e-Arşiv)",style:{padding:"4px 10px",background:E?"rgba(99, 102, 241, 0.25)":"rgba(99, 102, 241, 0.15)",border:"1px solid rgba(99, 102, 241, 0.4)",borderRadius:"4px",color:"#a5b4fc",fontSize:"11px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"},children:[le.find(C=>C.id===(n||"fatura"))?.label||"e-Fatura",t.jsx(Z,{size:12})]}),E&&t.jsx("div",{style:{position:"absolute",top:"100%",right:0,marginTop:"4px",background:"#0f172a",border:"1px solid #334155",borderRadius:"6px",boxShadow:"0 8px 24px rgba(0,0,0,0.4)",zIndex:50,minWidth:"180px",overflow:"hidden"},children:le.map(C=>{const D=(n||"fatura")===C.id;return t.jsxs("button",{onClick:()=>{v(C.id),T(!1)},style:{display:"flex",alignItems:"center",width:"100%",padding:"8px 12px",background:D?"rgba(99, 102, 241, 0.2)":"transparent",border:"none",color:D?"#a5b4fc":"#cbd5e1",cursor:"pointer",fontSize:"12px",fontWeight:D?700:500,textAlign:"left"},children:[t.jsxs("div",{style:{flex:1},children:[t.jsx("div",{children:C.label}),t.jsx("div",{style:{fontSize:"10px",color:"#64748b",fontWeight:400},children:C.template})]}),D&&t.jsx("span",{style:{color:"#10b981",fontSize:"10px"},children:"✓"})]},C.id)})})]})]}),t.jsx("div",{style:{width:"1px",height:"24px",background:"#334155"}}),t.jsx("button",{title:"XSLT Yükle",style:O,children:t.jsx(Te,{size:18})}),t.jsx("button",{onClick:x,disabled:!x,title:"Hızlı Kaydet (DB'ye sakla)",style:{...O,background:"rgba(99, 102, 241, 0.15)",color:"#818cf8",opacity:x?1:.4,cursor:x?"pointer":"not-allowed"},children:t.jsx(we,{size:18})}),t.jsxs("button",{onClick:o,disabled:!o,title:"Kaydet ve İndir (XSLT export)",style:{height:"36px",padding:"0 16px",background:"linear-gradient(135deg, #6366f1, #4f46e5)",color:"white",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",fontWeight:700,fontSize:"13px",cursor:o?"pointer":"not-allowed",opacity:o?1:.5,display:"flex",alignItems:"center",gap:"6px"},children:[t.jsx(_,{size:16}),"İndir"]})]})},O={height:"36px",minWidth:"36px",padding:"0 8px",background:"transparent",border:"1px solid transparent",borderRadius:"8px",color:"#cbd5e1",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},Ne=({sections:e,activeSectionId:a,selectedElementId:n,onSelectSection:l,onSelectElement:r,onDeleteElement:s})=>{const[i,y]=z.useState({reportHeader:!0,partyHeader:!0,masterData:!0,totals:!1,reportFooter:!1}),x=Object.values(e).sort((o,b)=>o.order-b.order);return t.jsx("div",{"data-designer-section-tree":!0,style:{height:"100%",background:"#0f172a",overflowY:"auto",display:"flex",flexDirection:"column"},children:t.jsxs("div",{style:{padding:"12px 12px 8px"},children:[t.jsx("div",{style:{fontSize:"11px",fontWeight:700,color:"#94a3b8",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"8px"},children:"BÖLÜMLER"}),x.map(o=>t.jsxs("div",{style:{marginBottom:"4px"},children:[t.jsxs("div",{onClick:()=>l(o.id),style:{display:"flex",alignItems:"center",gap:"6px",padding:"8px 10px",background:a===o.id?"rgba(99, 102, 241, 0.15)":"transparent",border:a===o.id?"1px solid rgba(99, 102, 241, 0.3)":"1px solid transparent",borderRadius:"6px",cursor:"pointer",fontSize:"13px",color:a===o.id?"#a5b4fc":"#cbd5e1"},children:[t.jsx("button",{onClick:b=>{b.stopPropagation(),y(u=>({...u,[o.id]:!u[o.id]}))},style:{background:"transparent",border:"none",color:"inherit",cursor:"pointer",padding:0},title:i[o.id]?"Daralt":"Genişlet",children:i[o.id]?t.jsx(Z,{size:14}):t.jsx(ae,{size:14})}),t.jsx(ce,{size:14}),t.jsx("span",{style:{flex:1,fontWeight:600},children:o.title}),t.jsx("span",{style:{fontSize:"10px",color:"#64748b",background:"#1e293b",padding:"2px 6px",borderRadius:"10px"},children:o.elements.length})]}),i[o.id]&&o.elements.length>0&&t.jsx("div",{style:{marginLeft:"24px",marginTop:"4px"},children:o.elements.map(b=>t.jsxs("div",{onClick:()=>r(b.id),title:Be(b),style:{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:"2px",padding:"4px 8px",background:n===b.id?"rgba(99, 102, 241, 0.1)":"transparent",borderRadius:"4px",cursor:"pointer",fontSize:"11px",color:n===b.id?"#a5b4fc":"#94a3b8"},children:[t.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"4px",width:"100%"},children:[t.jsx("span",{style:{color:"#fb923c",fontWeight:700,fontSize:"10px",minWidth:"32px"},children:b.type}),b.binding&&t.jsx("span",{style:{color:"#94a3b8",fontFamily:"monospace",fontSize:"10px",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:b.binding}),t.jsx("button",{onClick:u=>{u.stopPropagation(),s(b.id)},title:"Sil",style:{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",padding:"2px"},children:t.jsx(de,{size:11})})]}),b.content&&t.jsx("span",{style:{color:"#cbd5e1",fontSize:"10px",fontStyle:"italic",marginLeft:"4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"180px"},children:xe(b.content,50)})]},b.id))})]},o.id))]})})};function xe(e,a){if(!e)return"";const n=e.replace(/\s+/g," ").trim();return n.length>a?n.slice(0,a)+"…":n}function Be(e){const a=[`type: ${e.type}`,`id: ${e.id}`];return e.binding&&a.push(`binding: ${e.binding}`),e.content&&a.push(`content: ${xe(e.content,100)}`),e.htmlTag&&a.push(`tag: <${e.htmlTag}>`),a.join(`
`)}function Me(e,a){try{a.dataTransfer.setData("application/json",JSON.stringify(e)),a.dataTransfer.effectAllowed="copy",a.dataTransfer.setData("text/x-ubl-field",e.path)}catch(n){console.error("[XmlFields] dragstart error:",n)}}function He(e){return e.includes("AccountingSupplierParty")?"Tedarikçi (Gönderici)":e.includes("AccountingCustomerParty")?"Müşteri (Alıcı)":e.includes("LegalMonetaryTotal")?"Toplamlar":e.includes("TaxTotal")?"Vergi":e.includes("AllowanceCharge")?"İskonto & Masraf":e.includes("PaymentMeans")?"Ödeme":e.includes("DespatchDocumentReference")?"İrsaliye":e.includes("OrderReference")?"Sipariş":e.includes("InvoiceLine")?"Satır Detayı":"Fatura Genel"}const Xe=()=>{const[e,a]=z.useState(""),[n,l]=z.useState({}),r=z.useMemo(()=>{const x={};return U.forEach(o=>{const b=He(o.path);x[b]||(x[b]=[]),x[b].push(o)}),x},[]),s=z.useMemo(()=>{if(!e.trim())return r;const x=e.toLowerCase(),o={};return Object.keys(r).forEach(b=>{const u=r[b].filter(v=>v.name.toLowerCase().includes(x)||v.path.toLowerCase().includes(x));u.length>0&&(o[b]=u)}),o},[e,r]),i=Object.values(s).reduce((x,o)=>x+o.length,0),y=U.filter(x=>Q(x.path)).length;return t.jsx("div",{"data-designer-xml-fields":!0,style:{height:"100%",background:"#0f172a",overflowY:"auto",display:"flex",flexDirection:"column"},children:t.jsxs("div",{style:{padding:"12px"},children:[t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",fontWeight:700,color:"#94a3b8",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"8px"},children:[t.jsx(Se,{size:12}),"XML VERİ ALANLARI",t.jsx("span",{style:{marginLeft:"auto",fontSize:"9px",background:"rgba(99, 102, 241, 0.2)",color:"#a5b4fc",padding:"1px 6px",borderRadius:"10px",fontWeight:700},children:e?`${i}/${U.length}`:`${U.length} alan`})]}),t.jsxs("div",{style:{position:"relative",marginBottom:"10px"},children:[t.jsx(je,{size:11,style:{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:"#475569",pointerEvents:"none"}}),t.jsx("input",{type:"text",placeholder:"Ara… (alan adı veya XPath)",value:e,onChange:x=>a(x.target.value),style:{width:"100%",padding:"6px 8px 6px 26px",background:"#020617",border:"1px solid #334155",borderRadius:"4px",color:"white",fontSize:"11px",fontFamily:"inherit"}})]}),Object.keys(s).length===0&&t.jsxs("div",{style:{padding:"20px 12px",textAlign:"center",color:"#64748b",fontSize:"11px"},children:['"',e,'" ile eşleşen alan yok']}),Object.keys(s).map(x=>{const o=s[x],b=n[x],u=o.filter(v=>Q(v.path)).length;return t.jsxs("div",{style:{marginBottom:"8px"},children:[t.jsxs("button",{onClick:()=>l(v=>({...v,[x]:!v[x]})),style:{width:"100%",display:"flex",alignItems:"center",gap:"6px",padding:"6px 8px",background:"rgba(99, 102, 241, 0.08)",border:"1px solid rgba(99, 102, 241, 0.2)",borderRadius:"4px",color:"#a5b4fc",fontSize:"10px",fontWeight:700,letterSpacing:"0.5px",textTransform:"uppercase",cursor:"pointer"},children:[b?t.jsx(ae,{size:11}):t.jsx(Z,{size:11}),t.jsx(ce,{size:10}),t.jsx("span",{style:{flex:1,textAlign:"left"},children:x}),t.jsx("span",{style:{background:"rgba(99, 102, 241, 0.2)",padding:"1px 6px",borderRadius:"10px",fontSize:"9px"},children:o.length}),u>0&&t.jsxs("span",{style:{background:"rgba(71, 85, 105, 0.4)",color:"#cbd5e1",padding:"1px 6px",borderRadius:"10px",fontSize:"9px",display:"flex",alignItems:"center",gap:"2px"},title:`${u} salt okunur alan`,children:[t.jsx(ne,{size:8})," ",u]})]}),!b&&t.jsx("div",{style:{marginTop:"4px",display:"flex",flexDirection:"column",gap:"2px"},children:o.map(v=>{const E=Q(v.path);return t.jsxs("div",{draggable:!E,onDragStart:E?void 0:T=>Me(v,T),title:E?`🔒 Sistem alanı (değiştirilemez): ${v.path}`:`${v.path} — canvas'a sürükle → yerleştir`,style:{display:"flex",alignItems:"center",gap:"6px",padding:"4px 8px",background:E?"rgba(71, 85, 105, 0.15)":"rgba(99, 102, 241, 0.05)",border:E?"1px solid rgba(71, 85, 105, 0.2)":"1px solid rgba(99, 102, 241, 0.15)",borderRadius:"3px",cursor:E?"not-allowed":"grab",opacity:E?.7:1,fontSize:"11px"},children:[E?t.jsx(ne,{size:10,color:"#94a3b8"}):t.jsx(Ee,{size:10,color:"#64748b"}),t.jsx("span",{style:{flex:1,color:E?"#94a3b8":"#cbd5e1",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:v.name}),v.isNumeric&&t.jsx("span",{style:{fontSize:"9px",color:"#10b981",fontWeight:700,fontFamily:"monospace"},title:"Sayısal alan",children:"#"})]},v.path)})})]},x)}),t.jsxs("div",{style:{marginTop:"12px",padding:"8px 10px",background:"rgba(71, 85, 105, 0.15)",border:"1px solid rgba(71, 85, 105, 0.3)",borderRadius:"4px",fontSize:"10px",lineHeight:1.5},children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",color:"#94a3b8"},children:[t.jsx("span",{children:"🔒 Salt okunur:"}),t.jsx("span",{style:{color:"#fbbf24",fontWeight:700},children:y})]}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",color:"#94a3b8"},children:[t.jsx("span",{children:"📝 Düzenlenebilir:"}),t.jsx("span",{style:{color:"#10b981",fontWeight:700},children:U.length-y})]}),t.jsx("div",{style:{marginTop:"6px",paddingTop:"6px",borderTop:"1px solid rgba(71, 85, 105, 0.3)",color:"#10b981",textAlign:"center",fontWeight:700},children:"✅ Drag & drop aktif"})]})]})})};function Ve(e,a){const n=performance.now();let l=e;l.charCodeAt(0)===65279&&(l=l.slice(1));let r=a;if(r.charCodeAt(0)===65279&&(r=r.slice(1)),!l.trim()||!r.trim())return{html:"",error:"XSLT veya XML boş",durationMs:0};try{const i=new DOMParser().parseFromString(l,"application/xml"),y=i.querySelector("parsererror");if(y)return{html:"",error:`XSLT parse hatası: ${y.textContent?.trim().slice(0,200)||"bilinmiyor"}`,durationMs:performance.now()-n};const o=new DOMParser().parseFromString(r,"application/xml"),b=o.querySelector("parsererror");if(b)return{html:"",error:`XML parse hatası: ${b.textContent?.trim().slice(0,200)||"bilinmiyor"}`,durationMs:performance.now()-n};const u=new XSLTProcessor;u.importStylesheet(i);const v=u.transformToDocument(o);Fe(v);let T=new XMLSerializer().serializeToString(v);return!T.includes("<html")&&!T.includes("<HTML")?T=`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${T}</body></html>`:/charset/i.test(T)||(T=T.replace(/<head([^>]*)>/i,'<head$1><meta charset="utf-8">')),{html:T,error:null,durationMs:performance.now()-n}}catch(s){return{html:"",error:`Render hatası: ${s.message}`,durationMs:performance.now()-n}}}const Oe=new Set(["div","span","p","table","tr","td","th","h1","h2","h3","h4","h5","h6","img","a"]);function Fe(e){const a=e.body||e.documentElement;if(!a)return;let n=0;const l=r=>{if(r.nodeType!==1)return;const s=r,i=s.tagName.toLowerCase();Oe.has(i)&&(s.setAttribute("data-render-index",String(n)),n++);for(const y of Array.from(s.childNodes))l(y)};l(a)}const Ue=`<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:ID>FTR-2026-00001</cbc:ID>
  <cbc:IssueDate>2026-09-28</cbc:IssueDate>
  <cbc:IssueTime>10:00:00</cbc:IssueTime>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>ÖRNEK TEDARİKÇİ A.Ş.</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Atatürk Cad. No:1</cbc:StreetName>
        <cbc:CityName>İstanbul</cbc:CityName>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>ÖRNEK MÜŞTERİ LTD.</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Cumhuriyet Cad. No:5</cbc:StreetName>
        <cbc:CityName>Ankara</cbc:CityName>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal><cbc:TaxAmount currencyID="TRY">180.00</cbc:TaxAmount></cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="TRY">1000.00</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="TRY">1000.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="TRY">1180.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="TRY">1180.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">10</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">500.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Name>Örnek Ürün A</cbc:Name></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">50.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
  <cac:InvoiceLine>
    <cbc:ID>2</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">10</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">500.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Name>Örnek Ürün B</cbc:Name></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">50.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`,We=({state:e,onPlaceElement:a,onInlineEdit:n,onSelectElement:l,onCanvasResize:r,onCanvasReset:s})=>{const i=h.useRef(null),y=h.useRef(null),x=h.useRef(0),o=h.useMemo(()=>e.currentXslt?Ve(e.currentXslt,e.currentXml):{html:se(e),error:null,durationMs:0},[e.currentXslt,e.currentXml,e.activeSectionId]),b=h.useCallback(d=>{if(Date.now()-x.current<250||e.activeTool==="select"||d.target!==d.currentTarget)return;const c=i.current.getBoundingClientRect(),m=d.clientX-c.left+i.current.scrollLeft,j=d.clientY-c.top+i.current.scrollTop;let p=m,f=j;e.snapToGrid&&(p=Math.round(m/e.gridSize)*e.gridSize,f=Math.round(j/e.gridSize)*e.gridSize);const A=`${e.activeTool}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,P=Ge(e.activeTool,A,p,f);a(P)},[e.activeTool,e.snapToGrid,e.gridSize,a]),[u,v]=z.useState(null),E=h.useCallback(d=>{const c=e.canvasHeight,m=Math.max(0,Math.min(1,d/c));return m<.2?"reportHeader":m<.4?"partyHeader":m<.7?"masterData":m<.85?"totals":"reportFooter"},[e.canvasHeight]),T=h.useCallback(d=>{if(d.dataTransfer.types.includes("application/json")||d.dataTransfer.types.includes("text/x-ubl-field")){d.preventDefault(),d.dataTransfer.dropEffect="copy";const c=i.current.getBoundingClientRect(),m=d.clientY-c.top+i.current.scrollTop-32,j=Math.max(0,Math.min(m,e.canvasHeight)),p=E(j);p!==u&&v(p)}},[e.canvasHeight,E,u]),B=h.useCallback(()=>{v(null)},[]),C=h.useCallback(d=>{d.preventDefault(),x.current=Date.now();let c=null;const m=d.dataTransfer.getData("application/json");if(m)try{c=JSON.parse(m)}catch(w){console.error("[DesignerCanvas] drop JSON parse error:",w)}if(!c||Q(c.path))return;const j=i.current.getBoundingClientRect();let p=d.clientX-j.left+i.current.scrollLeft-32,f=d.clientY-j.top+i.current.scrollTop-32;p=Math.max(0,Math.min(p,e.canvasWidth)),f=Math.max(0,Math.min(f,e.canvasHeight)),e.snapToGrid&&(p=Math.round(p/e.gridSize)*e.gridSize,f=Math.round(f/e.gridSize)*e.gridSize);const A=E(f);v(null);const S={id:`field-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,type:"text",x:p,y:f,width:200,height:30,content:c.name,binding:c.path,style:{fontSize:"14px",color:"#000",fontFamily:"system-ui, sans-serif"},sectionId:A};a(S,A)},[e.canvasWidth,e.canvasHeight,e.snapToGrid,e.gridSize,a,E]),D=h.useCallback((d,c)=>{c.preventDefault(),c.stopPropagation();const m=c.clientX,j=c.clientY,p=e.canvasWidth,f=e.canvasHeight,A=S=>{const w=S.clientX-m,V=S.clientY-j;let L=p,g=f;d==="nw"?(L=p-w,g=f-V):d==="ne"?(L=p+w,g=f-V):d==="sw"?(L=p-w,g=f+V):d==="se"&&(L=p+w,g=f+V),L=Math.max(200,L),g=Math.max(200,g),e.snapToGrid&&(L=Math.round(L/e.gridSize)*e.gridSize,g=Math.round(g/e.gridSize)*e.gridSize),r?.(L,g)},P=()=>{document.removeEventListener("mousemove",A),document.removeEventListener("mouseup",P)};document.addEventListener("mousemove",A),document.addEventListener("mouseup",P)},[e.canvasWidth,e.canvasHeight,e.snapToGrid,e.gridSize,r]),M=h.useCallback(()=>{const d=y.current;if(!d)return;const c=d.contentDocument;if(!c||!c.body)return;let m=null,j=-1,p="";const f=g=>{let k=g;for(;k;){const R=k.getAttribute("data-render-index");if(R!==null)return Number(R);k=k.parentElement}return-1},A=g=>{if(m)return;m=g,j=f(g),p=g.textContent||"",g.contentEditable="true",g.style.outline="2px solid #6366f1",g.style.background="rgba(99,102,241,0.08)",g.focus();const k=c.createRange();k.selectNodeContents(g);const R=c.getSelection();R?.removeAllRanges(),R?.addRange(k)},P=g=>{if(!m)return;const k=m.textContent||"";m.contentEditable="false",m.style.outline="",m.style.background="";const R=m.tagName.toLowerCase();g&&k!==p&&n&&j>=0?n({renderIndex:j,originalText:p,newText:k,tagName:R}):g||(m.textContent=p),m=null,j=-1},S=g=>{const k=g.target;if(!k||k.isContentEditable)return;const R=f(k);R>=0&&l&&(g.preventDefault(),g.stopPropagation(),l(R))},w=g=>{const k=g.target;!k||k===c.body||k===c.documentElement||k.isContentEditable||(g.preventDefault(),g.stopPropagation(),A(k))},V=g=>{m&&(g.key==="Enter"&&!g.shiftKey?(g.preventDefault(),P(!0)):g.key==="Escape"&&(g.preventDefault(),P(!1)))},L=g=>{if(!m)return;g.target===m&&P(!0)};c.body.addEventListener("click",S),c.body.addEventListener("dblclick",w),c.body.addEventListener("keydown",V),c.body.addEventListener("blur",L,!0)},[n,l]);h.useEffect(()=>{const d=y.current;if(d)return d.addEventListener("load",M),()=>d.removeEventListener("load",M)},[o.html,M]);const X=h.useMemo(()=>{const d=Math.round(e.canvasWidth),c=Math.round(e.canvasHeight),m=Math.round(d/96*25.4),j=Math.round(c/96*25.4);return d===794&&c===1123?`A4 · ${m}×${j} mm (${d}×${c} px)`:`${m}×${j} mm (${d}×${c} px)`},[e.canvasWidth,e.canvasHeight]);return t.jsxs("div",{ref:i,"data-designer-canvas":!0,"data-mode":e.activeTool,onClick:b,onDragOver:T,onDragLeave:B,onDrop:C,style:{position:"relative",width:"100%",height:"100%",overflow:"auto",background:"#1e293b",cursor:e.activeTool==="select"?"default":"crosshair",backgroundImage:e.showGrid?"linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)":"none",backgroundSize:`${e.gridSize}px ${e.gridSize}px`},children:[t.jsxs("div",{"data-designer-a4-sheet":!0,style:{position:"relative",width:`${e.canvasWidth}px`,height:`${e.canvasHeight}px`,margin:"32px auto",background:"white",boxShadow:"0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",overflow:"hidden"},children:[t.jsx("div",{"data-designer-size-indicator":!0,style:{position:"absolute",top:-28,left:0,padding:"4px 10px",background:"rgba(15, 23, 42, 0.92)",border:"1px solid #334155",borderRadius:"4px",color:"#a5b4fc",fontSize:"11px",fontFamily:"monospace",fontWeight:700,letterSpacing:"0.5px",zIndex:30,cursor:s?"pointer":"default"},title:s?"A4 default'a sıfırla":"A4 sheet",onClick:s,children:X}),t.jsx("iframe",{ref:y,"data-designer-iframe":!0,srcDoc:o.html||se(e),style:{width:"100%",height:"100%",border:"none",background:"white",pointerEvents:"none"},title:"Designer Preview"}),Object.values(e.sections).find(d=>d.id===e.activeSectionId)?.elements.map(d=>t.jsx(Ke,{element:d,isSelected:d.id===e.selectedElementId},d.id)),Object.values(e.sections).sort((d,c)=>d.order-c.order).map(d=>t.jsx(Qe,{sectionId:d.id,title:d.title,elementCount:d.elements.length,isActive:e.activeSectionId===d.id||u===d.id,isHover:u===d.id},d.id)),t.jsx(W,{corner:"nw",onResizeStart:D}),t.jsx(W,{corner:"ne",onResizeStart:D}),t.jsx(W,{corner:"sw",onResizeStart:D}),t.jsx(W,{corner:"se",onResizeStart:D})]}),!o.error&&e.currentXslt&&t.jsxs("div",{style:{position:"fixed",bottom:44,right:16,padding:"4px 10px",background:"rgba(16, 185, 129, 0.85)",color:"white",borderRadius:"4px",fontSize:"10px",fontWeight:700,zIndex:20},children:["✓ Render: ",o.durationMs.toFixed(1),"ms"]}),o.error&&t.jsxs("div",{style:{position:"fixed",bottom:44,right:16,padding:"8px 12px",background:"rgba(239, 68, 68, 0.9)",color:"white",borderRadius:"6px",fontSize:"11px",fontWeight:600,zIndex:20,maxWidth:"320px"},title:o.error,children:["⚠ Render Hatası — ",o.error.slice(0,80)]})]})},W=({corner:e,onResizeStart:a})=>{const n={nw:"nw-resize",ne:"ne-resize",sw:"sw-resize",se:"se-resize"},l=e==="nw"?{top:-6,left:-6,cursor:n.nw}:e==="ne"?{top:-6,right:-6,cursor:n.ne}:e==="sw"?{bottom:-6,left:-6,cursor:n.sw}:{bottom:-6,right:-6,cursor:n.se};return t.jsx("div",{"data-designer-resize-handle":e,onMouseDown:r=>a(e,r),title:`${e.toUpperCase()} köşesinden sürükle → resize`,style:{position:"absolute",width:14,height:14,background:"white",border:"2px solid #6366f1",borderRadius:"50%",zIndex:25,boxShadow:"0 2px 4px rgba(0,0,0,0.3)",...l}})};function Ge(e,a,n,l){const r={fontSize:"14px",color:"#000",fontFamily:"system-ui, sans-serif"};switch(e){case"text":return{id:a,type:"text",x:n,y:l,content:"Yeni Metin",width:200,height:30,style:r};case"image":return{id:a,type:"image",x:n,y:l,content:"image",width:100,height:100,style:{}};case"shape":return{id:a,type:"shape",x:n,y:l,content:"rect",shapeType:"rect",width:100,height:60,style:{backgroundColor:"#6366f1",borderRadius:"4px"}};case"qrcode":return{id:a,type:"qrcode",x:n,y:l,content:"https://example.com",width:80,height:80,style:{}};case"formula":return{id:a,type:"formula",x:n,y:l,content:"sum(LineExtensionAmount)",width:200,height:24,style:{...r,fontFamily:"monospace"}};case"table":return{id:a,type:"table",x:n,y:l,content:"",rows:3,cols:4,width:300,height:100,tableData:[[{content:"Sıra"},{content:"Ürün"},{content:"Miktar"},{content:"Fiyat"}],[{content:"1"},{content:""},{content:""},{content:""}],[{content:"2"},{content:""},{content:""},{content:""}]],style:{borderCollapse:"collapse"}};default:return{id:a,type:"text",x:n,y:l,content:"Yeni",width:100,height:24,style:r}}}const Ke=({element:e,isSelected:a})=>{const n=e.width||100,l=e.height||30,r=e.x,s=e.y,i=e.style||{};return t.jsx("div",{style:{position:"absolute",left:`${r}px`,top:`${s}px`,width:`${n}px`,height:`${l}px`,border:a?"2px solid #6366f1":i.border||"1px dashed rgba(99, 102, 241, 0.4)",background:a?"rgba(99, 102, 241, 0.05)":i.backgroundColor||"rgba(99, 102, 241, 0.02)",color:i.color||"#6366f1",fontFamily:i.fontFamily||"inherit",fontSize:i.fontSize||"11px",fontWeight:i.fontWeight||600,fontStyle:i.fontStyle||"normal",padding:i.padding||"0",paddingTop:i.paddingTop,paddingRight:i.paddingRight,paddingBottom:i.paddingBottom,paddingLeft:i.paddingLeft,margin:i.margin||"0",marginTop:i.marginTop,marginRight:i.marginRight,marginBottom:i.marginBottom,marginLeft:i.marginLeft,borderRadius:i.borderRadius||"0",pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",zIndex:8},title:`${e.type} · ${e.id.slice(-6)}${e.binding?` · binding: ${e.binding}`:""}`,children:e.content||e.binding||`${e.type} (${e.id.slice(-6)})`})},qe={reportHeader:{topPct:0,heightPct:20},partyHeader:{topPct:20,heightPct:20},masterData:{topPct:40,heightPct:30},totals:{topPct:70,heightPct:15},reportFooter:{topPct:85,heightPct:15}},Qe=({sectionId:e,title:a,elementCount:n,isActive:l,isHover:r})=>{const s=qe[e],i=l||r;return t.jsxs("div",{style:{position:"absolute",top:`${s.topPct}%`,left:0,right:0,height:`${s.heightPct}%`,pointerEvents:"none",border:`2px dashed ${r?"#10b981":l?"#6366f1":"#334155"}`,borderRadius:"4px",padding:"8px",color:i?r?"#10b981":"#a5b4fc":"#475569",fontSize:"12px",fontWeight:700,opacity:i?.9:.3,background:r?"rgba(16, 185, 129, 0.08)":"transparent",transition:"border-color 0.1s, background 0.1s, opacity 0.1s",zIndex:5},children:[a," (",n,")",r?" ↓ drop here":""]})};function se(e){return`<!DOCTYPE html>
<html><head><style>
body { margin: 0; padding: 24px; background: #f8fafc; font-family: sans-serif; color: #475569; }
.empty { text-align: center; padding: 80px 20px; }
h1 { color: #0f172a; margin-bottom: 8px; }
</style></head><body>
<div class="empty">
<h1>Designer 2.0 — İskelet Aktif</h1>
<p>Section: <strong>${e.activeSectionId}</strong> · ${Object.values(e.sections).map(a=>`${a.title} (${a.elements.length})`).join(" • ")}</p>
</div>
</body></html>`}const Ze=({state:e,onUpdate:a,onMove:n,onDelete:l,onClone:r})=>{const s=Je(e),[i,y]=z.useState({position:!0,size:!0,content:!0,style:!0,data:!1});if(!s)return t.jsxs("div",{style:{height:"100%",background:"#0f172a",color:"#64748b",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:"20px",textAlign:"center"},children:[t.jsx(oe,{size:32,style:{opacity:.3,marginBottom:"12px"}}),t.jsx("div",{style:{fontSize:"13px",fontWeight:600},children:"Element Seçilmedi"}),t.jsx("div",{style:{fontSize:"11px",marginTop:"6px"},children:"Sol panelden bir section açıp element seçin veya sağdaki araçlardan yeni ekleyin."})]});const x=o=>{a(s.id,{style:{...s.style||{},...o}})};return t.jsxs("div",{style:{height:"100%",background:"#0f172a",overflowY:"auto",padding:"12px"},children:[t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px",padding:"10px",background:"rgba(99, 102, 241, 0.1)",borderRadius:"8px",border:"1px solid rgba(99, 102, 241, 0.2)"},children:[t.jsx(ie,{size:16,color:"#a5b4fc"}),t.jsxs("div",{style:{flex:1},children:[t.jsx("div",{style:{fontSize:"10px",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px"},children:"Seçili Element"}),t.jsxs("div",{style:{fontSize:"13px",fontWeight:700,color:"white"},children:[s.type.toUpperCase()," ",t.jsxs("span",{style:{color:"#64748b",fontWeight:400},children:["· ",s.id.slice(-8)]})]}),s.binding&&t.jsxs("div",{style:{fontSize:"10px",color:"#a5b4fc",fontFamily:"monospace",marginTop:"2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},title:s.binding,children:["🔗 ",s.binding]})]})]}),t.jsxs("div",{style:{display:"flex",gap:"6px",marginBottom:"16px"},children:[t.jsxs("button",{onClick:()=>r(s.id),title:"Kopyala (Ctrl+C)",style:Y,children:[t.jsx(pe,{size:12})," Kopyala"]}),t.jsxs("button",{onClick:()=>l(s.id),title:"Sil (Delete)",style:{...Y,background:"rgba(239, 68, 68, 0.15)",color:"#fca5a5",borderColor:"rgba(239, 68, 68, 0.3)"},children:[t.jsx(de,{size:12})," Sil"]})]}),t.jsxs(G,{title:"Konum & Boyut",isOpen:i.position,onToggle:()=>y({...i,position:!i.position}),children:[t.jsxs("div",{style:$e,children:[t.jsx(I,{label:"X",value:s.x,onChange:o=>a(s.id,{x:o})}),t.jsx(I,{label:"Y",value:s.y,onChange:o=>a(s.id,{y:o})}),t.jsx(I,{label:"W",value:s.width||100,onChange:o=>a(s.id,{width:o})}),t.jsx(I,{label:"H",value:s.height||30,onChange:o=>a(s.id,{height:o})})]}),t.jsx("div",{style:{display:"flex",gap:"4px",marginTop:"8px"},children:[{label:"◀",dx:-10,dy:0},{label:"▶",dx:10,dy:0},{label:"▲",dx:0,dy:-10},{label:"▼",dx:0,dy:10}].map(o=>t.jsx("button",{onClick:()=>n(s.id,o.dx,o.dy),title:`Taşı ${o.label}`,style:{...Y,flex:1},children:o.label},o.label))})]}),t.jsx(G,{title:"İçerik",isOpen:i.content,onToggle:()=>y({...i,content:!i.content}),children:t.jsx("textarea",{defaultValue:s.content,onBlur:o=>a(s.id,{content:o.target.value}),placeholder:"Metin giriniz...",style:{width:"100%",minHeight:"60px",background:"#020617",border:"1px solid #334155",color:"white",padding:"8px",borderRadius:"4px",fontSize:"12px",resize:"vertical",fontFamily:"inherit"}},s.id)}),t.jsx(G,{title:"Stil",isOpen:i.style,onToggle:()=>y({...i,style:!i.style}),children:t.jsx(Ye,{element:s,updateStyle:x})}),t.jsx(G,{title:"Veri Bağlama",isOpen:i.data,onToggle:()=>y({...i,data:!i.data}),children:t.jsxs("div",{style:{fontSize:"11px",color:"#64748b"},children:[t.jsxs("div",{children:["XML bağlama: ",t.jsx("strong",{style:{color:"#a5b4fc",fontFamily:"monospace"},children:s.binding||"— bağlı değil —"})]}),t.jsx("div",{style:{marginTop:"6px"},children:"Drag-drop ile bağlama Aşama 4'te tamamlandı (Sprint 2)."})]})})]})},Ye=({element:e,updateStyle:a})=>{const n=e.style||{};return t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[t.jsxs(H,{label:"Renkler",children:[t.jsx(J,{label:"Yazı",value:n.color||"#000000",onChange:l=>a({color:l})}),t.jsx(J,{label:"Arka plan",value:n.backgroundColor||"transparent",onChange:l=>a({backgroundColor:l})})]}),t.jsxs(H,{label:"Font",children:[t.jsx(F,{label:"Aile",value:n.fontFamily||"system-ui, sans-serif",options:[{value:"system-ui, sans-serif",label:"System UI"},{value:"Arial, sans-serif",label:"Arial"},{value:"Tahoma, sans-serif",label:"Tahoma"},{value:"Times New Roman, serif",label:"Times New Roman"},{value:"Georgia, serif",label:"Georgia"},{value:"monospace",label:"Monospace"},{value:"Courier New, monospace",label:"Courier New"}],onChange:l=>a({fontFamily:l})}),t.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"},children:[t.jsx(_e,{label:"Boyut",value:n.fontSize||"14px",onChange:l=>a({fontSize:l}),placeholder:"14px"}),t.jsx(F,{label:"Kalınlık",value:n.fontWeight||"normal",options:[{value:"normal",label:"Normal"},{value:"bold",label:"Kalın"},{value:"100",label:"100"},{value:"300",label:"300"},{value:"500",label:"500"},{value:"700",label:"700"}],onChange:l=>a({fontWeight:l})})]}),t.jsx(F,{label:"Stil",value:n.fontStyle||"normal",options:[{value:"normal",label:"Normal"},{value:"italic",label:"İtalik"}],onChange:l=>a({fontStyle:l})})]}),t.jsx(H,{label:"Padding (iç boşluk)",children:t.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"4px"},children:[t.jsx(I,{label:"Üst",value:N(n.paddingTop),onChange:l=>a({paddingTop:`${l}px`})}),t.jsx(I,{label:"Sağ",value:N(n.paddingRight),onChange:l=>a({paddingRight:`${l}px`})}),t.jsx(I,{label:"Alt",value:N(n.paddingBottom),onChange:l=>a({paddingBottom:`${l}px`})}),t.jsx(I,{label:"Sol",value:N(n.paddingLeft),onChange:l=>a({paddingLeft:`${l}px`})})]})}),t.jsx(H,{label:"Margin (dış boşluk)",children:t.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"4px"},children:[t.jsx(I,{label:"Üst",value:N(n.marginTop),onChange:l=>a({marginTop:`${l}px`})}),t.jsx(I,{label:"Sağ",value:N(n.marginRight),onChange:l=>a({marginRight:`${l}px`})}),t.jsx(I,{label:"Alt",value:N(n.marginBottom),onChange:l=>a({marginBottom:`${l}px`})}),t.jsx(I,{label:"Sol",value:N(n.marginLeft),onChange:l=>a({marginLeft:`${l}px`})})]})}),t.jsxs(H,{label:"Border (kenarlık)",children:[t.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"},children:[t.jsx(I,{label:"Genişlik",value:N(n.borderWidth),onChange:l=>a({borderWidth:`${l}px`})}),t.jsx(F,{label:"Stil",value:n.borderStyle||"solid",options:[{value:"solid",label:"Solid"},{value:"dashed",label:"Dashed"},{value:"dotted",label:"Dotted"},{value:"none",label:"Yok"}],onChange:l=>a({borderStyle:l})})]}),t.jsx(J,{label:"Renk",value:n.borderColor||"#94a3b8",onChange:l=>a({borderColor:l})}),t.jsx(I,{label:"Köşe yuvarlaklığı",value:N(n.borderRadius),onChange:l=>a({borderRadius:`${l}px`})})]}),e.type==="table"&&t.jsx(H,{label:"Tablo özel",children:t.jsx(F,{label:"Border Collapse",value:e.style?.borderCollapse||"collapse",options:[{value:"collapse",label:"Collapse (bitişik)"},{value:"separate",label:"Separate (ayrı)"}],onChange:l=>a({borderCollapse:l})})}),e.type==="formula"&&t.jsx(H,{label:"Formül özel",children:t.jsxs("div",{style:{fontSize:"10px",color:"#64748b"},children:["Formüller için font ailesi varsayılan: ",t.jsx("code",{style:{color:"#a5b4fc"},children:"monospace"}),". Değiştirmek için yukarıdaki Font bölümünü kullanın."]})}),e.type==="shape"&&t.jsx(H,{label:"Şekil özel",children:t.jsx(F,{label:"Şekil tipi",value:e.shapeType||"rect",options:[{value:"rect",label:"Dikdörtgen"},{value:"circle",label:"Daire"},{value:"line",label:"Çizgi"}],onChange:l=>void 0})})]})};function Je(e){if(!e.selectedElementId)return null;for(const a of Object.keys(e.sections)){const n=e.sections[a].elements.find(l=>l.id===e.selectedElementId);if(n)return n}return null}function N(e){if(e==null||e==="")return 0;const a=parseInt(String(e));return isNaN(a)?0:a}const Y={padding:"6px 8px",background:"rgba(99, 102, 241, 0.1)",border:"1px solid rgba(99, 102, 241, 0.3)",borderRadius:"6px",color:"#a5b4fc",cursor:"pointer",fontSize:"11px",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:"4px"},$e={display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"},I=({label:e,value:a,onChange:n})=>t.jsxs("div",{children:[t.jsx("div",{style:{fontSize:"10px",color:"#64748b",marginBottom:"2px"},children:e}),t.jsx("input",{type:"number",defaultValue:Math.round(a),onBlur:l=>{const r=parseInt(l.target.value);isNaN(r)||n(r)},style:{width:"100%",padding:"4px 6px",background:"#020617",border:"1px solid #334155",color:"white",borderRadius:"4px",fontSize:"12px",fontFamily:"inherit"}},`${e}-${a}`)]}),_e=({label:e,value:a,onChange:n,placeholder:l})=>t.jsxs("div",{children:[t.jsx("div",{style:{fontSize:"10px",color:"#64748b",marginBottom:"2px"},children:e}),t.jsx("input",{type:"text",defaultValue:a,placeholder:l,onBlur:r=>n(r.target.value),style:{width:"100%",padding:"4px 6px",background:"#020617",border:"1px solid #334155",color:"white",borderRadius:"4px",fontSize:"12px",fontFamily:"inherit"}},`${e}-${a}`)]}),J=({label:e,value:a,onChange:n})=>{const r=a==="transparent"||a===""?"#000000":a;return t.jsxs("div",{children:[t.jsx("div",{style:{fontSize:"10px",color:"#64748b",marginBottom:"2px"},children:e}),t.jsxs("div",{style:{display:"flex",gap:"4px",alignItems:"center"},children:[t.jsx("input",{type:"color",value:r,onChange:s=>n(s.target.value),style:{width:"32px",height:"24px",padding:0,border:"1px solid #334155",borderRadius:"4px",cursor:"pointer",background:"transparent"}}),t.jsx("input",{type:"text",value:a,placeholder:"#000000 veya transparent",onBlur:s=>n(s.target.value),style:{flex:1,minWidth:0,padding:"4px 6px",background:"#020617",border:"1px solid #334155",color:"white",borderRadius:"4px",fontSize:"11px",fontFamily:"monospace"}})]})]})},F=({label:e,value:a,options:n,onChange:l})=>t.jsxs("div",{children:[t.jsx("div",{style:{fontSize:"10px",color:"#64748b",marginBottom:"2px"},children:e}),t.jsx("select",{value:a,onChange:r=>l(r.target.value),style:{width:"100%",padding:"4px 6px",background:"#020617",border:"1px solid #334155",color:"white",borderRadius:"4px",fontSize:"12px",fontFamily:"inherit",cursor:"pointer"},children:n.map(r=>t.jsx("option",{value:r.value,children:r.label},r.value))})]}),H=({label:e,children:a})=>t.jsxs("div",{style:{background:"#020617",border:"1px solid #1e293b",borderRadius:"6px",padding:"8px"},children:[t.jsx("div",{style:{fontSize:"9px",fontWeight:700,color:"#64748b",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},children:e}),t.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"6px"},children:a})]}),G=({title:e,isOpen:a,onToggle:n,children:l})=>t.jsxs("div",{style:{marginBottom:"12px",background:"#020617",border:"1px solid #1e293b",borderRadius:"8px",overflow:"hidden"},children:[t.jsxs("button",{onClick:n,style:{width:"100%",padding:"8px 12px",background:"transparent",border:"none",color:"#cbd5e1",fontSize:"11px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[t.jsx("span",{children:e}),a?t.jsx(Z,{size:14}):t.jsx(ae,{size:14})]}),a&&t.jsx("div",{style:{padding:"12px"},children:l})]}),et=({state:e})=>t.jsxs("div",{"data-designer-statusbar":!0,style:{height:"100%",display:"flex",alignItems:"center",padding:"0 12px",background:"rgba(15, 23, 42, 0.95)",borderTop:"1px solid #1e293b",gap:"16px",fontSize:"11px",color:"#94a3b8"},children:[t.jsx("span",{style:{display:"flex",alignItems:"center",gap:"4px"},children:t.jsx("span",{style:{padding:"2px 8px",background:"#1e293b",borderRadius:"4px",color:"#a5b4fc",fontWeight:600},children:e.activeSectionId})}),t.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"4px"},children:["Element: ",t.jsx("strong",{style:{color:"white"},children:Object.values(e.sections).reduce((a,n)=>a+n.elements.length,0)})]}),t.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"4px"},children:["Mod: ",t.jsx("strong",{style:{color:e.mode==="idle"?"#10b981":"#f59e0b"},children:e.mode})]}),t.jsx("div",{style:{flex:1}}),t.jsx("button",{title:"Izgarayı Aç/Kapat",style:{background:"transparent",border:"none",color:e.showGrid?"#10b981":"#64748b",cursor:"pointer",padding:"4px 6px"},children:t.jsx(Ce,{size:14})}),t.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"4px"},children:[t.jsx(Pe,{size:12}),t.jsxs("span",{style:{color:"white",minWidth:"36px",textAlign:"center"},children:[Math.round(e.zoom*100),"%"]}),t.jsx(ke,{size:12})]}),t.jsxs("span",{style:{padding:"2px 8px",background:"rgba(245, 158, 11, 0.15)",color:"#fcd34d",borderRadius:"4px",fontSize:"10px",fontWeight:700,letterSpacing:"0.5px",display:"flex",alignItems:"center",gap:"4px"},children:[t.jsx(Ie,{size:10})," Designer 2.0 — Phase 16 İskelet"]})]});function ee(){return{reportHeader:{id:"reportHeader",title:"Belge Üst Bilgisi",description:"Logo, başlık, Fatura No, Tarih, Saat, Tipi, Para birimi, UUID",elements:[],repeating:!1,containerType:"div",order:1},partyHeader:{id:"partyHeader",title:"Tedarikçi / Müşteri",description:"Sol: Gönderici bilgileri — Sağ: Alıcı bilgileri",elements:[],repeating:!1,containerType:"table",order:2},masterData:{id:"masterData",title:"Ürün/Hizmet Satırları",description:"Her InvoiceLine için tekrar eden tablo (MasterData bandı)",elements:[],repeating:!0,containerType:"div",xpath:"//cac:InvoiceLine",order:3},totals:{id:"totals",title:"Toplamlar",description:"Vergi toplamları, mal-hizmet toplam, ödenecek tutar (Net)",elements:[],repeating:!1,containerType:"div",order:4},reportFooter:{id:"reportFooter",title:"Belge Alt Bilgisi",description:"Banka IBAN, ödeme bilgisi, notlar, imza",elements:[],repeating:!1,containerType:"div",order:5}}}function tt(){return{sections:ee(),activeSectionId:"reportHeader",selectedElementId:null,mode:"idle",zoom:.7,showGrid:!1,snapToGrid:!0,gridSize:5,canvasWidth:794,canvasHeight:1123,originalXslt:"",xmlPreview:"",xsltOutput:"",htmlPreview:"",currentXslt:"",currentXml:"",history:[],historyIndex:-1,activeTool:"select"}}function at(e,a){switch(a.type){case"SET_MODE":return{...e,mode:a.payload.mode};case"SET_TOOL":return{...e,activeTool:a.payload.tool};case"SET_ACTIVE_SECTION":return{...e,activeSectionId:a.payload.sectionId,selectedElementId:null};case"SELECT_ELEMENT":return{...e,selectedElementId:a.payload.id};case"PLACE_ELEMENT":{const n=e.sections[a.payload.sectionId];return{...e,sections:{...e.sections,[a.payload.sectionId]:{...n,elements:[...n.elements,a.payload.element]}},selectedElementId:a.payload.element.id,mode:"idle"}}case"MOVE_ELEMENT":{const n={...e.sections};for(const l of Object.keys(n))n[l]={...n[l],elements:n[l].elements.map(r=>r.id===a.payload.id?{...r,x:r.x+a.payload.dx,y:r.y+a.payload.dy}:r)};return{...e,sections:n}}case"UPDATE_ELEMENT":{const n={...e.sections};for(const l of Object.keys(n))n[l]={...n[l],elements:n[l].elements.map(r=>r.id===a.payload.id?{...r,...a.payload.patch}:r)};return{...e,sections:n}}case"DELETE_ELEMENT":{const n={...e.sections};for(const l of Object.keys(n))n[l]={...n[l],elements:n[l].elements.filter(r=>r.id!==a.payload.id)};return{...e,sections:n,selectedElementId:e.selectedElementId===a.payload.id?null:e.selectedElementId}}case"CLONE_ELEMENT":{let n=null,l=null;for(const s of Object.keys(e.sections)){const i=e.sections[s].elements.find(y=>y.id===a.payload.id);if(i){n=i,l=s;break}}if(!n||!l)return e;const r={...n,id:`${n.type}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,x:n.x+10,y:n.y+10};return{...e,sections:{...e.sections,[l]:{...e.sections[l],elements:[...e.sections[l].elements,r]}},selectedElementId:r.id}}case"SET_ZOOM":return{...e,zoom:Math.max(.25,Math.min(2,a.payload.zoom))};case"TOGGLE_GRID":return{...e,showGrid:!e.showGrid};case"TOGGLE_SNAP":return{...e,snapToGrid:!e.snapToGrid};case"SET_CANVAS_SIZE":return{...e,canvasWidth:Math.max(200,a.payload.width),canvasHeight:Math.max(200,a.payload.height)};case"RESET_CANVAS_SIZE":return{...e,canvasWidth:794,canvasHeight:1123};case"PUSH_HISTORY":{const n=e.history.slice(0,e.historyIndex+1);return{...e,history:[...n,JSON.parse(JSON.stringify(e.sections))],historyIndex:n.length}}case"UNDO":{if(e.historyIndex<0)return e;const n=e.historyIndex,l=e.history[n];return{...e,sections:JSON.parse(JSON.stringify(l)),historyIndex:n-1}}case"REDO":{if(e.historyIndex>=e.history.length-1)return e;const n=e.historyIndex+1,l=e.history[n];return{...e,sections:JSON.parse(JSON.stringify(l)),historyIndex:n}}case"IMPORT_XSLT":return{...e,originalXslt:a.payload.xslt};case"EXPORT_XSLT":return{...e,xsltOutput:a.payload.xslt};case"SET_HTML_PREVIEW":return{...e,htmlPreview:a.payload.html};case"SET_SECTIONS":return{...e,sections:a.payload.sections};case"SET_XML":return{...e,currentXml:a.payload.xml};default:return e}}function nt(e){const[a,n]=h.useReducer(at,{...tt(),...e}),l=h.useCallback((c,m)=>n({type:"PLACE_ELEMENT",payload:{sectionId:c,element:m}}),[]),r=h.useCallback(c=>n({type:"SELECT_ELEMENT",payload:{id:c}}),[]),s=h.useCallback((c,m)=>n({type:"UPDATE_ELEMENT",payload:{id:c,patch:m}}),[]),i=h.useCallback((c,m,j)=>n({type:"MOVE_ELEMENT",payload:{id:c,dx:m,dy:j}}),[]),y=h.useCallback(c=>n({type:"DELETE_ELEMENT",payload:{id:c}}),[]),x=h.useCallback(c=>n({type:"CLONE_ELEMENT",payload:{id:c}}),[]),o=h.useCallback(c=>n({type:"SET_ACTIVE_SECTION",payload:{sectionId:c}}),[]),b=h.useCallback(c=>n({type:"SET_MODE",payload:{mode:c}}),[]),u=h.useCallback(c=>n({type:"SET_TOOL",payload:{tool:c}}),[]),v=h.useCallback(c=>n({type:"SET_SECTIONS",payload:{sections:c}}),[]),E=h.useCallback(c=>n({type:"SET_XML",payload:{xml:c}}),[]),T=h.useCallback(c=>n({type:"IMPORT_XSLT",payload:{xslt:c}}),[]),B=h.useCallback(c=>n({type:"SET_ZOOM",payload:{zoom:c}}),[]),C=h.useCallback((c,m)=>n({type:"SET_CANVAS_SIZE",payload:{width:c,height:m}}),[]),D=h.useCallback(()=>n({type:"RESET_CANVAS_SIZE"}),[]),M=h.useCallback(()=>n({type:"PUSH_HISTORY"}),[]),X=h.useCallback(()=>n({type:"UNDO"}),[]),d=h.useCallback(()=>n({type:"REDO"}),[]);return{state:a,dispatch:n,placeElement:l,selectElement:r,updateElement:s,moveElement:i,deleteElement:y,cloneElement:x,setActiveSection:o,setMode:b,setTool:u,setSections:v,setXml:E,setCurrentXslt:T,setZoom:B,setCanvasSize:C,resetCanvasSize:D,pushHistory:M,undo:X,redo:d}}function lt(e,a,n){const l=(e.content||e.binding||"").toLowerCase(),r=e.style||{};return a<5?"reportHeader":l.includes("tedarikçi")||l.includes("müşteri")||l.includes("supplier")||l.includes("customer")||l.includes("party")||r.textAlign==="right"&&a<n*.4?"partyHeader":e.type==="table"&&e.tableData&&e.tableData.length>0?"masterData":l.includes("toplam")||l.includes("vergi")||l.includes("tutar")||l.includes("kdv")||l.includes("total")||l.includes("tax")||l.includes("payable")||l.includes("ödenecek")?"totals":a>n-4?"reportFooter":a<n/2?"reportHeader":"totals"}function st(e){e.charCodeAt(0)===65279&&(e=e.slice(1));let a;try{a=ze(e)}catch(i){return console.warn("[xsltToSections] XSLT parse hatası:",i),ee()}const n=ee(),l=a.elements||[];if(l.length===0)return n;const r=l.length;let s=0;return l.forEach((i,y)=>{const x=lt(i,y,r);i.renderIndex=s,s++,n[x].elements.push(i)}),n}const rt=`ï»¿<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="cac cbc">

    <xsl:output method="html" encoding="UTF-8" indent="yes"/>
    <xsl:strip-space elements="*"/>

    <!-- Ana sablon -->
    <xsl:template match="/">
        <html>
            <head>
                <meta charset="UTF-8"/>
                <title>e-ArÃÅ¸iv Fatura</title>
                <style><![CDATA[
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; background: #f8fafc; padding: 20px; }
                    .page { max-width: 800px; margin: 0 auto; background: #fff; padding: 32px 36px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                    .header { display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 16px; align-items: start; padding-bottom: 16px; border-bottom: 2px solid #1e3a8a; }
                    .logo-area { font-size: 22px; font-weight: 800; color: #f97316; line-height: 1; padding-top: 8px; }
                    .logo-area .tag { font-size: 9px; letter-spacing: 4px; color: #475569; margin-top: 4px; }
                    .center-title { text-align: center; }
                    .gib-logo { display: inline-flex; flex-direction: column; align-items: center; }
                    .gib-circle { width: 96px; height: 96px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 1px 6px rgba(30, 58, 138, 0.18); }
                    .gib-subtitle { font-size: 8px; color: #1e3a8a; margin-top: 4px; letter-spacing: 1.5px; font-weight: 700; }
                    .doc-title { font-size: 18px; font-weight: 800; color: #1e293b; margin-top: 8px; letter-spacing: 1px; }
                    .kase { font-size: 8px; color: #1e3a8a; margin-top: 6px; line-height: 1.4; }
                    .qr-area { width: 120px; height: 120px; background: repeating-conic-gradient(#1e293b 0deg 90deg, #fff 90deg 180deg); background-size: 8px 8px; border: 3px solid #1e293b; margin-left: auto; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; }
                    .info-box h3 { font-size: 11px; font-weight: 700; color: #1e3a8a; letter-spacing: 1px; margin-bottom: 6px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
                    .info-line { display: flex; font-size: 10px; line-height: 1.5; padding: 2px 0; }
                    .info-line .lbl { width: 90px; color: #64748b; flex-shrink: 0; }
                    .info-line .val { color: #1e293b; font-weight: 600; flex: 1; }
                    .belge-table { float: right; border-collapse: collapse; font-size: 10px; margin-top: 12px; }
                    .belge-table td { padding: 3px 8px; border: 1px solid #cbd5e1; }
                    .belge-table td:first-child { font-weight: 700; color: #475569; background: #f1f5f9; width: 100px; }
                    .belge-table td:last-child { font-weight: 600; min-width: 160px; }
                    .ettn { font-size: 8px; color: #64748b; margin-top: 16px; letter-spacing: 0.5px; word-break: break-all; }
                    .urun-table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 10px; }
                    .urun-table th { background: #1e3a8a; color: #fff; padding: 8px 6px; text-align: left; font-weight: 700; font-size: 10px; letter-spacing: 0.5px; }
                    .urun-table td { padding: 6px; border: 1px solid #cbd5e1; }
                    .urun-table td.num { text-align: right; }
                    .urun-table tr:last-child td { font-weight: 700; background: #f1f5f9; }
                    .signature { margin-top: 36px; padding: 28px; border: 4px dashed #4338ca; border-radius: 16px; background: linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(67,56,202,0.18) 100%); text-align: center; }
                    .signature .title { display: inline-block; padding: 8px 24px; background: linear-gradient(135deg, #4338ca, #6366f1); color: #fff; font-size: 16px; font-weight: 800; letter-spacing: 3px; border-radius: 8px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4); }
                    .signature .sub { font-size: 10px; color: #4338ca; letter-spacing: 2px; margin-top: 12px; font-weight: 700; }
                    .signature .body { font-size: 11px; color: #1e1b4b; margin-top: 16px; line-height: 1.6; max-width: 600px; margin-left: auto; margin-right: auto; }
                    .footer-note { font-size: 8px; color: #94a3b8; margin-top: 32px; text-align: center; line-height: 1.4; padding-top: 12px; border-top: 1px solid #e2e8f0; }
                ]]></style>
            </head>
            <body>
                <div class="page">
                    <!-- HEADER -->
                    <div class="header">
                        <!-- Sol: SatÃÂ±cÃÂ± Logo -->
                        <div class="logo-area">
                            <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
                            <div class="tag">YAZILIM</div>
                        </div>

                        <!-- Orta: GÃÂ°B Logo + BaÃÅ¸lÃÂ±k -->
                        <div class="center-title">
                            <div class="gib-logo">
                                <!-- Phase A.2.3: Gercek GIB logosu Ã¢â¬â mavi dis halka + egri yazilar + kirmizi GIB wordmark -->
                                <div class="gib-circle"><img src="data:image/jpeg;base64,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" style="width:100%;height:100%;display:block;border-radius:50%;object-fit:cover;" alt="GIB"/></div>
                            </div>
                            <div class="doc-title">e-ArÃÅ¸iv Fatura</div>
                            <div class="kase">
                                ÃâRNEK ÃÂ°MZALI KAÃÂE - 3<br/>
                                No.0000000000000001<br/>
                                ErcÃÂ¼yes Teknopark Tekno-3<br/>
                                TEL: 0000 000 00 00<br/>
                                ÃâRNEK V.D: 1111111111
                            </div>
                        </div>

                        <!-- SaÃÅ¸: QR Kod -->
                        <div class="qr-area"></div>
                    </div>

                    <!-- BÃÂ°LGÃÂ°LER: SatÃÂ±cÃÂ± + MÃÂ¼ÃÅ¸teri + Belge -->
                    <div class="info-grid">
                        <!-- Sol: SatÃÂ±cÃÂ± -->
                        <div class="info-box">
                            <h3>SATICI</h3>
                            <div class="info-line"><span class="lbl">Firma:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/></span></div>
                            <div class="info-line"><span class="lbl">Adres:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:StreetName"/></span></div>
                            <div class="info-line"><span class="lbl">Tel:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:Telephone"/></span></div>
                            <div class="info-line"><span class="lbl">Web Sitesi:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cbc:WebsiteURI"/></span></div>
                            <div class="info-line"><span class="lbl">E-Posta:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:ElectronicMail"/></span></div>
                            <div class="info-line"><span class="lbl">Vergi Dairesi:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme"/></span></div>
                            <div class="info-line"><span class="lbl">VKN:</span><span class="val"><xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"/></span></div>
                            <div class="info-line"><span class="lbl">Mersis No:</span><span class="val">0000000000000</span></div>
                            <div class="info-line"><span class="lbl">ÃÂ°ÃÅ¸letme Merkezi:</span><span class="val">[ÃÂ°ÃÅ¸letme Merkezi]</span></div>
                        </div>

                        <!-- SaÃÅ¸: MÃÂ¼ÃÅ¸teri + Belge -->
                        <div class="info-box">
                            <h3>SAYIN</h3>
                            <div class="info-line"><span class="lbl">Firma:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/></span></div>
                            <div class="info-line"><span class="lbl">Adres:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:StreetName"/></span></div>
                            <div class="info-line"><span class="lbl">E-Posta:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail"/></span></div>
                            <div class="info-line"><span class="lbl">Tel:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telephone"/></span></div>
                            <div class="info-line"><span class="lbl">Vergi Dairesi:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme"/></span></div>
                            <div class="info-line"><span class="lbl">VKN:</span><span class="val"><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"/></span></div>

                            <table class="belge-table">
                                <tr><td>ÃâzelleÃÅ¸tirme No:</td><td><xsl:value-of select="//cbc:CustomizationID"/></td></tr>
                                <tr><td>Senaryo:</td><td><xsl:value-of select="//cbc:ProfileID"/></td></tr>
                                <tr><td>Fatura Tipi:</td>
                                    <td>
                                        <xsl:choose>
                                            <xsl:when test="//cbc:InvoiceTypeCode">
                                                <xsl:call-template name="arsiv-fmt-invoice-type">
                                                    <xsl:with-param name="code" select="//cbc:InvoiceTypeCode"/>
                                                </xsl:call-template>
                                            </xsl:when>
                                            <xsl:otherwise>SATIÅ</xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                </tr>
                                <tr><td>Fatura No:</td><td><xsl:value-of select="//cbc:ID"/></td></tr>
                                <tr><td>Fatura Tarihi:</td><td><xsl:value-of select="//cbc:IssueDate"/></td></tr>
                                <tr><td>Fatura Saati:</td><td><xsl:value-of select="substring(//cbc:IssueTime, 1, 5)"/></td></tr>
                            </table>

                            <div class="ettn">
                                <strong>ETTN:</strong> <xsl:value-of select="//cbc:UUID"/>
                            </div>
                        </div>
                    </div>

                    <!-- ÃÅRÃÅN/HÃÂ°ZMET -->
                    <table class="urun-table">
                        <thead>
                            <tr>
                                <th style="width:30px">SÃÂ±ra No</th>
                                <th>Mal/Hizmet</th>
                                <th style="width:60px">Miktar</th>
                                <th style="width:80px">Birim Fiyat</th>
                                <th style="width:60px">ÃÂ°skonto OranÃÂ±</th>
                                <th style="width:80px">ÃÂ°skonto TutarÃÂ±</th>
                                <th style="width:60px">KDV OranÃÂ±</th>
                                <th style="width:80px">KDV TutarÃÂ±</th>
                                <th style="width:90px">Mal Hizmet TutarÃÂ±</th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="//cac:InvoiceLine">
                                <tr>
                                    <td class="num"><xsl:value-of select="position()"/></td>
                                    <td><xsl:value-of select="cac:Item/cbc:Description"/></td>
                                    <td class="num"><xsl:value-of select="cbc:InvoicedQuantity"/> <xsl:value-of select="cbc:InvoicedQuantity/@unitCode"/></td>
                                    <td class="num"><xsl:value-of select="format-number(cac:Price/cbc:PriceAmount, '#,##0.00')"/> TL</td>
                                    <td class="num">%0</td>
                                    <td class="num">0,00 TL</td>
                                    <td class="num">
                                <xsl:value-of select="cac:TaxTotal/cac:TaxSubtotal/cbc:Percent"/>%
                                    </td>
                                    <td class="num">
                                <xsl:value-of select="format-number(cac:TaxTotal/cbc:TaxAmount, '#,##0.00')"/> TL
                                    </td>
                                    <td class="num">
                                <xsl:value-of select="format-number(cbc:LineExtensionAmount, '#,##0.00')"/> TL
                                    </td>
                                </tr>
                            </xsl:for-each>
                            <tr>
                                <td colspan="8" style="text-align:right">Mal Hizmet Toplam TutarÃÂ±</td>
                                <td class="num">
                                    <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:LineExtensionAmount, '#,##0.00')"/> TL
                                </td>
                            </tr>
                            <tr>
                                <td colspan="8" style="text-align:right">Toplam ÃÂ°skonto</td>
                                <td class="num">0,00 TL</td>
                            </tr>
                            <tr>
                                <td colspan="8" style="text-align:right">KDV Dahil Toplam Tutar</td>
                                <td class="num">
                                    <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount, '#,##0.00')"/> TL
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- E-ÃÂ°MZA ALANI (GÃÂ°B ZORUNLU) -->
                    <div class="signature">
                        <div class="title">E-ARÃÂÃÂ°V FATURASI</div>
                        <div class="sub">ELEKTRONÃÂ°K ÃÂ°MZA / E-ARÃÂÃÂ°V</div>
                        <div class="body">
                            Bu belge <strong>5070 sayÃÂ±lÃÂ± Elektronik ÃÂ°mza Kanunu</strong> ve <strong>GÃÂ°B e-ArÃÅ¸iv YÃÂ¶netmeliÃÅ¸i</strong> gereÃÅ¸i
                            elektronik olarak imzalanmÃÂ±ÃÅ¸tÃÂ±r. Belge iÃÂ§eriÃÅ¸i deÃÅ¸iÃÅ¸tirilemez; tahrifat halinde geÃÂ§ersizdir.
                            <br/><br/>
                            <strong>Belge No:</strong> <xsl:value-of select="//cbc:ID"/><br/>
                            <strong>ÃÂ°mza Tarihi:</strong> <xsl:value-of select="//cbc:IssueDate"/><br/>
                            <strong>Mali DeÃÅ¸er:</strong> <xsl:value-of select="format-number(//cac:LegalMonetaryTotal/cbc:PayableAmount, '#,##0.00')"/> TL
                        </div>
                    </div>

                    <!-- FOOTER -->
                    <div class="footer-note">
                        Belge elektronik ortamda oluÃÅ¸turulmuÃÅ¸tur.<br/>
                        GÃÂ°B e-ArÃÅ¸iv sistemi ÃÂ¼zerinden elektronik imza ile onaylanmÃÂ±ÃÅ¸tÃÂ±r.
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>

    <!-- Phase 11.1: e-Arsiv icin Fatura Tipi kodunu Turkce karsiligina cevir -->
    <xsl:template name="arsiv-fmt-invoice-type">
        <xsl:param name="code" select="''"/>
        <xsl:choose>
            <xsl:when test="$code = 'SATIS'">SATIÅ</xsl:when>
            <xsl:when test="$code = 'IADE'">Ä°ADE</xsl:when>
            <xsl:when test="$code = 'EARSIVFATURA'">e-ARÅÄ°V FATURA</xsl:when>
            <xsl:when test="$code = 'EARSIVKAGITFATURA'">e-ARÅÄ°V KAGIT</xsl:when>
            <xsl:otherwise><xsl:value-of select="$code"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

</xsl:stylesheet>
`,$=`ï»¿<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="cac cbc">

    <xsl:output method="html" encoding="UTF-8" indent="yes"/>
    <xsl:strip-space elements="*"/>

    <!-- Para formatla (TR: virgul, 2 ondalik) -->
    <xsl:template name="fmt-money">
        <xsl:param name="val" select="'0'"/>
        <xsl:value-of select="format-number($val, '#.##0,00')"/> TL
    </xsl:template>

    <!-- Tarih formatla (DD-MM-YYYY) -->
    <xsl:template name="fmt-date">
        <xsl:param name="val" select="''"/>
        <xsl:if test="$val != ''">
            <xsl:variable name="yyyy" select="substring($val, 1, 4)"/>
            <xsl:variable name="mm" select="substring($val, 6, 2)"/>
            <xsl:variable name="dd" select="substring($val, 9, 2)"/>
            <xsl:value-of select="concat($dd, '-', $mm, '-', $yyyy)"/>
        </xsl:if>
    </xsl:template>

    <!-- Saat formatla (HH:MM:SS) -->
    <xsl:template name="fmt-time">
        <xsl:param name="val" select="''"/>
        <xsl:if test="$val != ''">
            <xsl:variable name="hh" select="substring($val, 1, 2)"/>
            <xsl:variable name="mi" select="substring($val, 4, 2)"/>
            <xsl:variable name="ss" select="substring($val, 7, 2)"/>
            <xsl:value-of select="concat($hh, ':', $mi, ':', $ss)"/>
        </xsl:if>
    </xsl:template>

    <!-- KDV orani formatla (%18,00) -->
    <xsl:template name="fmt-percent">
        <xsl:param name="val" select="'0'"/>
        %<xsl:value-of select="format-number($val, '#0,00')"/>
    </xsl:template>

    <!-- Phase 11.1: Fatura Tipi kodunu Turkce karsiligina cevir -->
    <xsl:template name="fmt-invoice-type">
        <xsl:param name="code" select="''"/>
        <xsl:choose>
            <xsl:when test="$code = 'SATIS'">SATIÅ</xsl:when>
            <xsl:when test="$code = 'IADE'">Ä°ADE</xsl:when>
            <xsl:when test="$code = 'TEMELFATURA'">TEMEL FATURA</xsl:when>
            <xsl:when test="$code = 'TICARIFATURA'">TÄ°CARÄ° FATURA</xsl:when>
            <xsl:when test="$code = 'ISTISNA'">Ä°STÄ°SNA</xsl:when>
            <xsl:when test="$code = 'IHRACAT'">Ä°HRACAT</xsl:when>
            <xsl:when test="$code = 'IHRACATKAYITLI'">Ä°HRACAT (KAYITLI)</xsl:when>
            <xsl:when test="$code = 'OZELMATRAHFAZLASIFATURA'">ÃZEL MATRAH FAZLASI FATURA</xsl:when>
            <xsl:otherwise><xsl:value-of select="$code"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="/">
        <html>
            <head>
                <meta charset="UTF-8"/>
                <title>e-Fatura - <xsl:value-of select="//cbc:ID"/></title>
                <style>
                    @page { size: A4; margin: 12mm; }
                    * { box-sizing: border-box; }
                    html, body {
                        margin: 0; padding: 0;
                        font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
                        font-size: 10pt;
                        color: #000;
                        background: #fff;
                    }
                    .page { width: 210mm; min-height: 297mm; padding: 8mm; }
                    table { border-collapse: collapse; }

                    /* === HEADER === */
                    .header-top {
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 4mm;
                    }
                    .seller-info {
                        flex: 1.4;
                        padding-right: 4mm;
                    }
                    .seller-info .label {
                        font-size: 7.5pt;
                        letter-spacing: 0.5px;
                        color: #333;
                        margin-bottom: 0.5mm;
                    }
                    .seller-info .company {
                        font-size: 9pt;
                        font-weight: 400; /* Kalin degil, normal */
                        color: #000;
                        margin-bottom: 1.5mm;
                    }
                    .seller-info .line {
                        font-size: 8pt;
                        line-height: 1.35;
                        color: #1f2937;
                    }
                    .gib-logo-wrap {
                        flex: 0.8;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: flex-start;
                    }
                    .gib-logo {
                        width: 32mm; height: 32mm;
                        border-radius: 50%;
                        overflow: hidden;
                        box-shadow: 0 1mm 3mm rgba(30, 58, 138, 0.25);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #fff;
                    }
                    .doc-type {
                        margin-top: 3mm;
                        font-size: 16pt;
                        font-weight: 700;
                        color: #111;
                        text-align: center;
                        letter-spacing: 2px;
                    }
                    /* Header altinda kalin siyah ayrac cizgisi */
                    .header-divider {
                        border-top: 2px solid #000;
                        margin: 3mm 0 3mm 0;
                    }

                    /* Belge bilgileri tablosu (sagda) */
                    .header-bottom {
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 3mm;
                    }
                    .customer-info {
                        flex: 1;
                        padding-right: 4mm;
                    }
                    .customer-info .sayin {
                        font-size: 8.5pt;
                        font-weight: 700;
                        letter-spacing: 1.5px;
                        color: #000;
                        border-bottom: 1.5px solid #000;
                        padding-bottom: 0.5mm;
                        margin-bottom: 1.5mm;
                        width: 60mm;
                    }
                    .customer-info .line {
                        font-size: 8pt;
                        line-height: 1.4;
                        color: #1f2937;
                    }
                    .customer-info .slash {
                        margin-left: 4mm;
                        color: #888;
                    }
                    .doc-info-table {
                        flex: 0 0 78mm;
                        border: 1px solid #000;
                    }
                    .doc-info-table table {
                        width: 100%;
                    }
                    .doc-info-table td {
                        padding: 0.8mm 2.5mm;
                        font-size: 8pt;
                        border: 0.5px solid #000;
                    }
                    .doc-info-table td.label {
                        font-weight: 700;
                        background: #fff;
                        width: 42mm;
                    }

                    /* ETTN satiri Ã¢â¬â kalin siyah ust-alt cerceve, beyaz bg */
                    .ettn-line {
                        font-size: 8pt;
                        margin: 2mm 0 3mm 0;
                        padding: 1.2mm 2mm;
                        background: #fff;
                        border-top: 1.5px solid #000;
                        border-bottom: 1.5px solid #000;
                    }
                    .ettn-line .key {
                        font-weight: 700;
                        color: #000;
                        margin-right: 2mm;
                    }

                    /* === URUN TABLOSU === */
                    .product-table {
                        width: 100%;
                        margin-top: 2mm;
                        border: 1.5px solid #000;
                    }
                    .product-table th, .product-table td {
                        border: 0.7px solid #000;
                        padding: 1.5mm 1.8mm;
                        font-size: 7.5pt;
                        text-align: center;
                        vertical-align: middle;
                    }
                    .product-table th {
                        background: #fff;
                        font-weight: 700;
                        color: #000;
                    }
                    .product-table td.left { text-align: left; }
                    .product-table td.right { text-align: right; }
                    .product-table .qty-cell .val {
                        display: block;
                        font-weight: 400;
                    }
                    .product-table .qty-cell .unit {
                        display: block;
                        font-size: 7pt;
                        color: #333;
                    }
                    .product-table .empty-row td {
                        height: 4.5mm;
                    }

                    /* === TOPLAMLAR (sag alt) Ã¢â¬â duz border, gradient yok === */
                    .totals-wrap {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 2mm;
                    }
                    .totals-table {
                        width: 80mm;
                        border: 1.5px solid #000;
                    }
                    .totals-table td {
                        padding: 1.5mm 3mm;
                        font-size: 8.5pt;
                        border: 0.7px solid #000;
                        font-weight: 400;
                    }
                    .totals-table td.label {
                        font-weight: 700;
                        background: #fff;
                        width: 50mm;
                    }
                    .totals-table td.val {
                        text-align: right;
                        font-weight: 400;
                    }

                    /* === NOTLAR === */
                    .notes {
                        margin-top: 4mm;
                        padding-top: 2mm;
                        border-top: 1px dashed #999;
                        font-size: 8pt;
                    }
                    .notes .label {
                        font-weight: 700;
                        color: #000;
                    }
                    .notes .under {
                        text-decoration: underline;
                    }
                    .notes p {
                        margin: 0 0 1.5mm 0;
                    }

                    /* === IMZA BLOGU Ã¢â¬â sadece 2 sutun (SATICI + ALICI), gradient GIB stami YOK === */
                    .signatures {
                        display: flex;
                        gap: 4mm;
                        margin-top: 6mm;
                    }
                    .sig-box {
                        flex: 1;
                        border: 1px solid #000;
                        padding: 3mm;
                        text-align: center;
                        background: #fff;
                    }
                    .sig-box .role {
                        font-size: 8pt;
                        font-weight: 700;
                        color: #000;
                        margin-bottom: 8mm;
                        letter-spacing: 1px;
                    }
                    .sig-box .name {
                        font-size: 8.5pt;
                        border-top: 0.7px solid #000;
                        padding-top: 1.5mm;
                    }

                    /* Print */
                    @media print {
                        .page { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="page">

                    <!-- ====================== HEADER ====================== -->
                    <div class="header-top">
                        <div class="seller-info">
                            <div class="label">AYDIN ÃâZEL ENTEGRASYON</div>
                            <div class="company">
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
                            </div>
                            <div class="line">
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>&#160;<xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CityName"/>/<xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CountrySubentity"/><br/>
                                Tel: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:Telephone"/>&#160;&#160;Fax: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:Telefax"/><br/>
                                E-Posta: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:ElectronicMail"/><br/>
                                Web Sitesi: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:WebsiteURI"/><br/>
                                Vergi Dairesi: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/><br/>
                                VKN: <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"/>
                            </div>
                        </div>

                        <div class="gib-logo-wrap">
                            <!-- Phase A.2.3: Gercek GIB logosu Ã¢â¬â mavi dis halka + egri yazilar + kirmizi GIB wordmark -->
                            <div class="gib-logo"><img src="data:image/jpeg;base64,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" style="width:100%;height:100%;display:block;" alt="GIB"/></div>
                            <div class="doc-type">e-FATURA</div>
                        </div>
                    </div>

                    <div class="header-divider"></div>

                    <!-- Belge bilgileri + Musteri -->
                    <div class="header-bottom">
                        <div class="customer-info">
                            <div class="sayin">SAYIN</div>
                            <div class="line">
                                <strong><xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/></strong>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:StreetName">
                                    <span class="slash">/</span>
                                    <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:StreetName"/>
                                </xsl:if>
                                <br/>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:WebsiteURI">Web Sitesi: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:WebsiteURI"/><br/></xsl:if>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail">E-Posta: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail"/><br/></xsl:if>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telephone">Tel: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telephone"/><br/></xsl:if>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telefax">Fax: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telefax"/><br/></xsl:if>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name">Vergi Dairesi: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name"/><br/></xsl:if>
                                <xsl:if test="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID">VKN/TCKN: <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"/></xsl:if>
                            </div>
                        </div>

                        <div class="doc-info-table">
                            <table>
                                <tr>
                                    <td class="label">ÃâzelleÃÅ¸tirme No:</td>
                                    <td><xsl:value-of select="//cbc:CustomizationID"/></td>
                                </tr>
                                <tr>
                                    <td class="label">Senaryo:</td>
                                    <td><xsl:value-of select="//cbc:InvoiceTypeCode"/></td>
                                </tr>
                                <tr>
                                    <td class="label">Fatura Tipi:</td>
                                    <td>
                                        <xsl:choose>
                                            <!-- Phase 11.1: Gercek UBL-TR 1.2.1'de cac:InvoiceType elementi YOK, tip flat cbc:InvoiceTypeCode'da -->
                                            <xsl:when test="//cbc:InvoiceTypeCode">
                                                <xsl:call-template name="fmt-invoice-type">
                                                    <xsl:with-param name="code" select="//cbc:InvoiceTypeCode"/>
                                                </xsl:call-template>
                                            </xsl:when>
                                            <xsl:otherwise>SATIS</xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">Fatura No:</td>
                                    <td><xsl:value-of select="//cbc:ID"/></td>
                                </tr>
                                <tr>
                                    <td class="label">Fatura Tarihi:</td>
                                    <td><xsl:call-template name="fmt-date"><xsl:with-param name="val" select="//cbc:IssueDate"/></xsl:call-template></td>
                                </tr>
                                <tr>
                                    <td class="label">Fatura Saati:</td>
                                    <td><xsl:call-template name="fmt-time"><xsl:with-param name="val" select="//cbc:IssueTime"/></xsl:call-template></td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- ETTN satiri -->
                    <div class="ettn-line">
                        <span class="key">ETTN:</span>
                        <xsl:value-of select="//cbc:UUID"/>
                    </div>

                    <!-- ====================== URUN TABLOSU ====================== -->
                    <table class="product-table">
                        <thead>
                            <tr>
                                <th style="width:7mm">SÃÂ±ra No</th>
                                <th style="width:18mm">ÃÅrÃÂ¼n Kodu</th>
                                <th>Mal/Hizmet</th>
                                <th style="width:14mm">Miktar</th>
                                <th style="width:18mm">Birim Fiyat</th>
                                <th style="width:14mm">ÃÂ°skonto OranÃÂ±</th>
                                <th style="width:14mm">ÃÂ°skonto TutarÃÂ±</th>
                                <th style="width:14mm">KDV OranÃÂ±</th>
                                <th style="width:14mm">KDV TutarÃÂ±</th>
                                <th style="width:14mm">DiÃÅ¸er Vergiler</th>
                                <th style="width:18mm">Mal Hizmet TutarÃÂ±</th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="//cac:InvoiceLine">
                                <tr>
                                    <td><xsl:value-of select="position()"/></td>
                                    <td class="left"><xsl:value-of select="cac:Item/cac:SellersItemIdentification/cbc:ID"/></td>
                                    <td class="left"><xsl:value-of select="cac:Item/cbc:Description"/></td>
                                    <td class="qty-cell">
                                        <span class="val"><xsl:value-of select="format-number(cbc:InvoicedQuantity, '#0,0')"/></span>
                                        <span class="unit"><xsl:value-of select="cbc:InvoicedQuantity/@unitCode"/></span>
                                    </td>
                                    <td class="right">
                                        <xsl:call-template name="fmt-money">
                                            <xsl:with-param name="val" select="cac:Price/cbc:PriceAmount"/>
                                        </xsl:call-template>
                                    </td>
                                    <td class="right">
                                        <xsl:choose>
                                            <xsl:when test="cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:MultiplierFactorNumeric">
                                                <xsl:call-template name="fmt-percent">
                                                    <xsl:with-param name="val" select="cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:MultiplierFactorNumeric * 100"/>
                                                </xsl:call-template>
                                            </xsl:when>
                                            <xsl:otherwise>-</xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td class="right">
                                        <xsl:choose>
                                            <xsl:when test="cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:Amount">
                                                <xsl:call-template name="fmt-money">
                                                    <xsl:with-param name="val" select="cac:AllowanceCharge[cbc:ChargeIndicator='false']/cbc:Amount"/>
                                                </xsl:call-template>
                                            </xsl:when>
                                            <xsl:otherwise>-</xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td>
                                        <xsl:call-template name="fmt-percent">
                                            <xsl:with-param name="val" select="cac:TaxTotal/cac:TaxSubtotal/cbc:Percent"/>
                                        </xsl:call-template>
                                    </td>
                                    <td class="right">
                                        <xsl:call-template name="fmt-money">
                                            <xsl:with-param name="val" select="cac:TaxTotal/cac:TaxSubtotal/cbc:TaxAmount"/>
                                        </xsl:call-template>
                                    </td>
                                    <td class="right">-</td>
                                    <td class="right">
                                        <xsl:call-template name="fmt-money">
                                            <xsl:with-param name="val" select="cbc:LineExtensionAmount"/>
                                        </xsl:call-template>
                                    </td>
                                </tr>
                            </xsl:for-each>

                            <xsl:call-template name="empty-rows">
                                <xsl:with-param name="count" select="15 - count(//cac:InvoiceLine)"/>
                            </xsl:call-template>
                        </tbody>
                    </table>

                    <!-- ====================== TOPLAMLAR ====================== -->
                    <div class="totals-wrap">
                        <table class="totals-table">
                            <tr>
                                <td class="label">Mal Hizmet Toplam TutarÃÂ±</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:LegalMonetaryTotal/cbc:LineExtensionAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr>
                                <td class="label">Toplam ÃÂ°skonto</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr>
                                <td class="label">Toplam Masraf</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:LegalMonetaryTotal/cbc:ChargeTotalAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr>
                                <td class="label">Hesaplanan KDV(%<xsl:value-of select="format-number(//cac:TaxTotal/cac:TaxSubtotal/cbc:Percent, '#0,00')"/>)</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:TaxTotal/cbc:TaxAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr>
                                <td class="label">Vergiler Dahil Toplam Tutar</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                            <tr>
                                <td class="label">Ãâdenecek Tutar</td>
                                <td class="val">
                                    <xsl:call-template name="fmt-money">
                                        <xsl:with-param name="val" select="//cac:LegalMonetaryTotal/cbc:PayableAmount"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- ====================== NOTLAR ====================== -->
                    <div class="notes">
                        <xsl:choose>
                            <xsl:when test="//cbc:Note">
                                <xsl:for-each select="//cbc:Note">
                                    <p>
                                        <span class="label">Not:</span> <span class="under"><xsl:value-of select="."/></span>
                                    </p>
                                </xsl:for-each>
                            </xsl:when>
                            <xsl:otherwise>
                                <p><span class="label">Not:</span> -</p>
                            </xsl:otherwise>
                        </xsl:choose>
                    </div>

                    <!-- ====================== IMZA BLOGU ====================== -->
                    <div class="signatures">
                        <div class="sig-box">
                            <div class="role">SATICI</div>
                            <div class="name">
                                <xsl:value-of select="//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/>
                            </div>
                        </div>

                        <div class="sig-box">
                            <div class="role">ALICI</div>
                            <div class="name">
                                <xsl:value-of select="//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/>
                            </div>
                        </div>
                    </div>

                </div>
            </body>
        </html>
    </xsl:template>

    <!-- 15'e tamamlayan bos satirlar -->
    <xsl:template name="empty-rows">
        <xsl:param name="count" select="0"/>
        <xsl:param name="i" select="1"/>
        <xsl:if test="$i &lt;= $count">
            <tr class="empty-row">
                <td><xsl:value-of select="15 - $count + $i - 1"/></td>
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <xsl:call-template name="empty-rows">
                <xsl:with-param name="count" select="$count"/>
                <xsl:with-param name="i" select="$i + 1"/>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>

</xsl:stylesheet>

`,K={fatura:"ebelge/gib/v2/e-Fatura-Sablon.xslt",arsiv:"ebelge/gib/v2/e-Arsiv-Sablon.xslt"};function it(e){if(!e)return $;const a=e.toLowerCase();return a.startsWith("fatura")||a.startsWith("efatura")?$:a.startsWith("arsiv")||a.startsWith("earsiv")||a==="e-Arsiv-TEMEL"?rt:$}function ot(e){if(!e)return K.fatura;const a=e.toLowerCase();return a.startsWith("fatura")||a.startsWith("efatura")?K.fatura:a.startsWith("arsiv")||a.startsWith("earsiv")||a==="e-Arsiv-TEMEL"?K.arsiv:K.fatura}async function ct(e){const a=ot(e),n=["/edesign-deploy/","/edesign-deploy/","/"];for(const l of n){if(!l)continue;const r=`${l.replace(/\/$/,"")}/${a}`;try{const s=await fetch(r);if(!s.ok){console.warn(`[xsltDefaults] fetch ${s.status}: ${r}`);continue}let i=await s.text();if(i.charCodeAt(0)===65279&&(i=i.slice(1)),i&&i.length>100)return console.log(`[xsltDefaults] fetched ${i.length} chars from ${r}`),i}catch(s){console.warn(`[xsltDefaults] fetch error ${r}:`,s)}}return null}const dt=new Set(["AccountingSupplierParty","AccountingCustomerParty","Party","PartyName","PartyIdentification","PartyTaxScheme","TaxScheme","PostalAddress","Contact","Person","InvoiceLine","Item","Price","InvoicedQuantity","LineExtensionAmount","TaxTotal","TaxSubtotal","TaxCategory","LegalMonetaryTotal","AllowanceCharge","PaymentMeans","PayeeFinancialAccount","FinancialInstitutionBranch","DespatchDocumentReference","OrderReference","AdditionalDocumentReference"]);function pt(e,a={}){return a.customContent?.trim()?a.customContent:xt(e,a)}function xt(e,a){const n=Object.values(e).sort((y,x)=>y.order-x.order),r=`<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="cac cbc">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:strip-space elements="*"/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="UTF-8"/>
        <title>${te(a.docName||a.templateTitle||"e-Belge")}</title>
        <style>
          .ebelge-designer { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; }
          .section { padding: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0; }
          .section-report-header { background: #f8fafc; }
          .section-party-header { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .section-master-data { background: #fff; }
          .section-totals { background: #f8fafc; text-align: right; }
          .section-report-footer { background: #f1f5f9; padding: 12px; }
        </style>
      </head>
      <body>
        <div class="ebelge-designer">`,s=n.map(y=>ut(y,a)).join(`
`);return r+`
`+s+`
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`}function ut(e,a){const n=`section-${e.id}`,l=a.includeMasterLoop!==!1,r=e.elements.map(s=>mt(s)).filter(Boolean).join(`
          `);return e.repeating&&l&&e.id==="masterData"?`
    <div class="${n}">
      <xsl:for-each select="//cac:InvoiceLine">
        <div class="section-row">
          ${r||"<!-- master data elemanı yok -->"}
        </div>
      </xsl:for-each>
    </div>`:`
    <div class="${n}">
      ${r||"<!-- boş section -->"}
    </div>`}function mt(e){if(!e)return"";const a=ht(e.style),n=a?` style="${a}"`:"",l=Number.isFinite(e.x)?` data-x="${e.x}"`:"",r=Number.isFinite(e.y)?` data-y="${e.y}"`:"",s=gt(e.type),i=ft(e);return`<${s}${n}${l}${r}>${i}</${s}>`}function ft(e){return e.binding?.trim()?`<xsl:value-of select="${yt(e.binding)}"/>`:e.type==="formula"&&e.formula?.trim()?`<xsl:value-of select="${te(e.formula)}"/>`:e.content?te(e.content):(e.type==="shape"&&e.shapeType,"")}function gt(e){switch(e){case"text":return"span";case"shape":return"div";case"image":return"img";case"qrcode":return"img";case"table":return"table";case"formula":return"span";case"div":return"div";case"span":return"span";case"p":return"p";case"h1":return"h1";case"h2":return"h2";case"h3":return"h3";case"h4":return"h4";case"h5":return"h5";case"h6":return"h6";default:return"div"}}function ht(e){return!e||typeof e!="object"?"":Object.entries(e).filter(([,n])=>n!=null&&n!=="").map(([n,l])=>`${bt(n)}: ${vt(String(l))}`).join("; ")}function bt(e){return e.replace(/[A-Z]/g,a=>`-${a.toLowerCase()}`)}function yt(e){return e.startsWith("/")?e:"/"+e.split("/").filter(Boolean).map(l=>l==="Invoice"?"Invoice":dt.has(l)?`cac:${l}`:`cbc:${l}`).join("/")}function te(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function vt(e){return e.replace(/[;{}<>]/g,"")}function At(e){const a=Object.values(e).flatMap(n=>n.elements);return{totalElements:a.length,bindingsCount:a.filter(n=>n.binding).length,shapesCount:a.filter(n=>n.type==="shape").length,sectionSummary:Object.values(e).sort((n,l)=>n.order-l.order).map(n=>({id:n.id,title:n.title,count:n.elements.length}))}}const Tt=({isOpen:e,content:a,fileName:n,stats:l,onClose:r,onDownload:s})=>{const[i,y]=z.useState(!1);if(z.useEffect(()=>{if(!e)return;const u=v=>{v.key==="Escape"?(v.preventDefault(),r()):(v.ctrlKey||v.metaKey)&&v.key==="s"&&(v.preventDefault(),s())};return window.addEventListener("keydown",u),()=>window.removeEventListener("keydown",u)},[e,r,s]),!e)return null;const x=new Blob([a]).size,o=x<1024?`${x} B`:`${(x/1024).toFixed(1)} kB`,b=async()=>{try{await navigator.clipboard.writeText(a),y(!0),setTimeout(()=>y(!1),1800)}catch{const u=document.createElement("textarea");u.value=a,document.body.appendChild(u),u.select();try{document.execCommand("copy"),y(!0),setTimeout(()=>y(!1),1800)}catch{}document.body.removeChild(u)}};return t.jsx("div",{role:"dialog","aria-modal":"true","aria-labelledby":"export-preview-title",onClick:u=>{u.target===u.currentTarget&&r()},style:{position:"fixed",inset:0,background:"rgba(0, 0, 0, 0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3,padding:"24px"},children:t.jsxs("div",{style:{width:"100%",maxWidth:"720px",maxHeight:"80vh",background:"#0f172a",border:"1px solid #334155",borderRadius:"12px",boxShadow:"0 20px 60px rgba(0, 0, 0, 0.5)",display:"flex",flexDirection:"column",overflow:"hidden",color:"white"},children:[t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",padding:"14px 18px",background:"rgba(30, 41, 59, 0.95)",borderBottom:"1px solid #334155"},children:[t.jsx(_,{size:18,color:"#a5b4fc"}),t.jsxs("div",{style:{flex:1,minWidth:0},children:[t.jsx("div",{id:"export-preview-title",style:{fontSize:"14px",fontWeight:700,color:"white"},children:"XSLT Export Önizleme"}),t.jsxs("div",{style:{fontSize:"11px",color:"#94a3b8",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:[n," · ",o]})]}),t.jsx("button",{onClick:r,title:"Kapat (Esc)",style:{background:"transparent",border:"1px solid #334155",borderRadius:"6px",color:"#94a3b8",cursor:"pointer",padding:"6px",display:"flex",alignItems:"center",justifyContent:"center"},children:t.jsx(De,{size:16})})]}),t.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"1px",background:"#1e293b",borderBottom:"1px solid #334155"},children:[t.jsx(q,{label:"Toplam element",value:l.totalElements,color:"#a5b4fc"}),t.jsx(q,{label:"XML binding",value:l.bindingsCount,color:"#10b981"}),t.jsx(q,{label:"Şekiller",value:l.shapesCount,color:"#fb923c"}),t.jsx(q,{label:"Section",value:l.sectionSummary.length,color:"#94a3b8"})]}),t.jsx("div",{style:{flex:1,minHeight:0,overflow:"hidden",display:"flex",flexDirection:"column"},children:t.jsx("textarea",{readOnly:!0,value:a,spellCheck:!1,style:{flex:1,minHeight:"240px",maxHeight:"50vh",padding:"14px 16px",background:"#020617",color:"#cbd5e1",border:"none",outline:"none",fontFamily:'ui-monospace, "SF Mono", Menlo, Consolas, monospace',fontSize:"11px",lineHeight:1.6,resize:"none",whiteSpace:"pre",overflow:"auto",tabSize:2}})}),t.jsxs("div",{style:{padding:"12px 18px",background:"rgba(30, 41, 59, 0.95)",borderTop:"1px solid #334155",display:"flex",alignItems:"center",gap:"10px",fontSize:"11px"},children:[t.jsxs("div",{style:{flex:1,color:"#94a3b8"},children:[t.jsx("span",{style:{fontWeight:700,color:"#a5b4fc"},children:"Section dağılımı: "}),l.sectionSummary.map(u=>t.jsxs("span",{style:{marginRight:"8px"},children:[u.title,": ",t.jsx("strong",{style:{color:"white"},children:u.count})]},u.id))]}),t.jsxs("button",{onClick:b,title:"XSLT'yi panoya kopyala",style:{background:i?"rgba(16, 185, 129, 0.2)":"#1e293b",border:`1px solid ${i?"#10b981":"#334155"}`,color:i?"#10b981":"#cbd5e1",borderRadius:"6px",padding:"8px 12px",fontSize:"12px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",minWidth:"110px",justifyContent:"center"},children:[i?t.jsx(Le,{size:14}):t.jsx(pe,{size:14}),i?"Kopyalandı":"Kopyala"]}),t.jsx("button",{onClick:r,style:{background:"#1e293b",border:"1px solid #334155",color:"#cbd5e1",borderRadius:"6px",padding:"8px 14px",fontSize:"12px",fontWeight:600,cursor:"pointer"},children:"Kapat"}),t.jsxs("button",{onClick:s,title:"XSLT dosyasını indir (Ctrl+S)",style:{background:"linear-gradient(135deg, #6366f1, #4f46e5)",border:"1px solid rgba(255,255,255,0.1)",color:"white",borderRadius:"6px",padding:"8px 16px",fontSize:"12px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"},children:[t.jsx(_,{size:14}),"İndir"]})]})]})})},q=({label:e,value:a,color:n})=>t.jsxs("div",{style:{padding:"10px 12px",background:"#0f172a",textAlign:"center"},children:[t.jsx("div",{style:{fontSize:"16px",fontWeight:700,color:n},children:a}),t.jsx("div",{style:{fontSize:"9px",color:"#64748b",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:"2px"},children:e})]}),kt=({template:e="Modern_1.0_Fatura",customContent:a,docName:n="Yeni Tasarım",onBack:l,moduleId:r})=>{const s=nt(),[i,y]=z.useState(r||"fatura"),[x,o]=h.useState(null);h.useEffect(()=>{if(!x)return;const p=setTimeout(()=>o(null),4500);return()=>clearTimeout(p)},[x]);const b=p=>{console.log("[Designer 2.0] Inline edit:",p);const f=re(s.state.sections,p.renderIndex);if(!f){o(`⚠ Düzenleme kaydedilemedi: renderIndex=${p.renderIndex} sections'ta bulunamadı`);return}s.pushHistory(),s.updateElement(f,{content:p.newText}),o(`✏️ Kaydedildi (${p.tagName} #${p.renderIndex}): "${p.originalText.trim().slice(0,30)}${p.originalText.length>30?"…":""}" → "${p.newText.trim().slice(0,30)}${p.newText.length>30?"…":""}"`)},u=p=>{const f=re(s.state.sections,p);f?s.selectElement(f):console.warn(`[Designer 2.0] renderIndex=${p} → element bulunamadı`)},v=(p,f)=>{s.pushHistory();const A=f||s.state.activeSectionId;s.placeElement(A,p),A!==s.state.activeSectionId&&s.setActiveSection(A)},E=async()=>{const p=n||"Yeni Tasarım",f=window.prompt?.("Tasarım adı:",p)??p;if(!f||!f.trim()){o("⚠ Kayıt iptal edildi: tasarım adı boş olamaz.");return}try{const A=await ue.saveDesign({name:f.trim(),module_id:r||"custom",xslt_content:s.state.currentXslt||void 0,custom_content:a||void 0,theme_color:"#1e3a8a",sections:Object.fromEntries(Object.entries(s.state.sections).map(([P,S])=>[P,{id:S.id,title:S.title,elements:S.elements}])),status:"draft"});console.log("[Designer 2.0] Tasarım kaydedildi:",A.design),o(`✅ Tasarım kaydedildi (#${A.design.id}) — "${A.design.name}"`)}catch(A){console.error("[Designer 2.0] Kayıt hatası:",A),o(`⚠ Kayıt hatası: ${A.message||"bilinmeyen"}`)}},[T,B]=h.useState({isOpen:!1,content:"",fileName:"",stats:{totalElements:0,bindingsCount:0,shapesCount:0,sectionSummary:[]}}),C=()=>{const p=At(s.state.sections),f=pt(s.state.sections,{customContent:s.state.currentXslt?.trim()?s.state.currentXslt:void 0,docName:n,templateTitle:e}),A=`${(n||"tasarim").replace(/\s+/g,"_")}.xslt`;B({isOpen:!0,content:f,fileName:A,stats:p})},D=()=>{const{content:p,fileName:f}=T,A=new Blob([p],{type:"application/xml"}),P=URL.createObjectURL(A),S=document.createElement("a");S.href=P,S.download=f,document.body.appendChild(S),S.click(),document.body.removeChild(S),URL.revokeObjectURL(P),B(w=>({...w,isOpen:!1})),o(`📥 XSLT indirildi: ${f} · ${T.stats.totalElements} element (${T.stats.bindingsCount} XML binding)`)},[M,X]=h.useState(!0),[d,c]=h.useState("none"),[m,j]=h.useState(null);return h.useEffect(()=>{let p=!1;X(!0),j(null);async function f(){let A=a?.trim()||"",P="none",S=null;if(A)P="custom";else{try{const w=await ct(r);if(p)return;w&&w.length>100?(A=w,P="fetched"):S="fetch boş döndü"}catch(w){S=`fetch hatası: ${w.message}`}if(P==="none"){const w=it(r);w&&w.length>100?(A=w,P="inline"):S=`${S||""} + inline boş`}}if(!p){if(c(P),j(P==="none"?S:null),console.log(`[DesignerApp] XSLT load: source=${P} length=${A.length} module=${i||"fallback"}${S?` lastError=${S}`:""}`),s.setCurrentXslt(A),s.setXml(Ue),A)try{const w=st(A);s.setSections(w)}catch(w){console.error("[DesignerApp] xsltToSections failed:",w),j(`XSLT parse hatası: ${w.message?.slice(0,100)}`)}X(!1)}}return f(),()=>{p=!0}},[a,i]),t.jsxs("div",{"data-designer-v2":!0,style:{display:"grid",gridTemplateRows:"64px 1fr 32px",gridTemplateColumns:"320px 1fr 320px",gridTemplateAreas:`
                    "toolbar toolbar toolbar"
                    "sidebar canvas properties"
                    "statusbar statusbar statusbar"
                `,height:"100vh",background:"#0f172a",color:"white",fontFamily:"system-ui, -apple-system, sans-serif",overflow:"hidden"},children:[t.jsx("div",{style:{gridArea:"toolbar"},children:t.jsx(Re,{docName:n,template:e,moduleId:i,onBack:l,onUndo:s.undo,onRedo:s.redo,canUndo:s.state.historyIndex>=0,canRedo:s.state.historyIndex<s.state.history.length-1,onSetTool:s.setTool,activeTool:s.state.activeTool,onSave:E,onExport:C,onModuleChange:y})}),t.jsxs("div",{style:{gridArea:"sidebar",borderRight:"1px solid #1e293b",overflow:"hidden",display:"flex",flexDirection:"column"},children:[t.jsx("div",{style:{flex:1,minHeight:0,display:"flex",flexDirection:"column"},children:t.jsx(Ne,{sections:s.state.sections,activeSectionId:s.state.activeSectionId,selectedElementId:s.state.selectedElementId,onSelectSection:s.setActiveSection,onSelectElement:s.selectElement,onDeleteElement:s.deleteElement})}),t.jsx("div",{style:{flex:1,minHeight:0,borderTop:"1px solid #1e293b",display:"flex",flexDirection:"column"},children:t.jsx(Xe,{})})]}),t.jsx("div",{style:{gridArea:"canvas",overflow:"auto",background:"#1e293b"},children:t.jsx(We,{state:s.state,onPlaceElement:v,onInlineEdit:b,onSelectElement:u,onCanvasResize:s.setCanvasSize,onCanvasReset:s.resetCanvasSize})}),t.jsx("div",{style:{gridArea:"properties",borderLeft:"1px solid #1e293b",overflow:"hidden"},children:t.jsx(Ze,{state:s.state,onUpdate:s.updateElement,onMove:s.moveElement,onDelete:s.deleteElement,onClone:s.cloneElement})}),t.jsx("div",{style:{gridArea:"statusbar"},children:t.jsx(et,{state:s.state})}),t.jsx("div",{"data-designer-debug":!0,style:{position:"fixed",top:76,left:16,padding:"6px 12px",background:M?"rgba(245, 158, 11, 0.92)":d==="none"?"rgba(239, 68, 68, 0.92)":"rgba(16, 185, 129, 0.92)",border:"1px solid #475569",borderRadius:"6px",color:"white",fontSize:"10px",fontFamily:"monospace",fontWeight:700,zIndex:99,pointerEvents:"none",maxWidth:"420px"},children:M?t.jsx(t.Fragment,{children:"⏳ XSLT yükleniyor..."}):d==="none"?t.jsxs(t.Fragment,{children:["⚠ XSLT yüklenemedi (",m||"bilinmeyen hata",")"]}):t.jsxs(t.Fragment,{children:["✅ XSLT ",(s.state.currentXslt.length/1024).toFixed(1),"kB (",d,")"," · ","sections: ",Object.values(s.state.sections).reduce((p,f)=>p+f.elements.length,0)," elements"]})}),x&&t.jsx("div",{role:"status",style:{position:"fixed",bottom:56,right:16,maxWidth:"420px",padding:"12px 16px",background:"linear-gradient(135deg, #6366f1, #4f46e5)",color:"white",borderRadius:"10px",fontSize:"12px",boxShadow:"0 12px 32px rgba(0,0,0,0.4)",zIndex:100,animation:"fadeIn 0.2s ease-out"},children:x}),t.jsx(Tt,{isOpen:T.isOpen,content:T.content,fileName:T.fileName,stats:T.stats,onClose:()=>B(p=>({...p,isOpen:!1})),onDownload:D})]})};function re(e,a){for(const n of Object.keys(e))for(const l of e[n].elements)if(l.renderIndex===a)return l.id;return null}export{kt as DesignerApp,kt as default};
