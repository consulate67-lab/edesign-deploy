const p=n=>n.replace(/(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi,(e,r,t,o,s)=>r+o.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")+s),g=n=>{const e=n.body??n.getElementsByTagName("body")[0];if(e)for(const r of Array.from(e.children))r.tagName.toLowerCase()==="div"&&/uses XSLT/i.test(r.textContent??"")&&/#d9534f|rgb\(217,\s*83,\s*79\)/i.test(r.getAttribute("style")??"")&&r.remove()},d=(n,e)=>{console.log("🔄 transformXmlWithXslt INPUT (First 100 chars):",e?e.substring(0,100):"NULL/UNDEFINED");try{const r=new DOMParser,t=r.parseFromString(n,"application/xml"),o=r.parseFromString(e,"application/xml"),s=t.querySelector("parsererror");if(s)throw new Error(`XML Parse Error: ${s.textContent}`);const i=o.querySelector("parsererror");if(i)throw new Error(`XSLT Parse Error: ${i.textContent}`);const a=new XSLTProcessor;a.importStylesheet(o);const l=a.transformToDocument(t),c=new XMLSerializer;if(!l){console.warn("transformToDocument returned null, trying transformToFragment...");const m=a.transformToFragment(t,document);if(m)return p(c.serializeToString(m));throw new Error("XSLT transformation produced null result. Possible causes: Invalid XSLT syntax, missing templates, or runtime errors (e.g. format-number pattern mismatch).")}return g(l),p(c.serializeToString(l))}catch(r){console.error("XSLT Transformation Error:",r);let t="";const o=r instanceof Error?r.message.match(/line (\d+)/):null;if(o){const s=parseInt(o[1]),i=e.split(`
`),a=Math.max(0,s-10),l=Math.min(i.length,s+10);t=i.slice(a,l).map((c,m)=>`${a+m+1}: ${c}`).join(`
`)}return`<div style="padding:20px; color:red; background:#fee; border:1px solid red; font-family: sans-serif;">
            <h3 style="margin-top:0;">Hata: XSLT Dönüşümü başarısız oldu</h3>
            <pre style="white-space: pre-wrap; font-weight: bold;">${r instanceof Error?r.message:r}</pre>
            ${t?`
                <div style="margin-top: 15px;">
                    <div style="font-weight: bold; margin-bottom: 5px; color: #721c24;">Hata Çevresi (Satır ${o[1]}):</div>
                    <pre style="background:#fff; padding:10px; border:1px solid #ddd; overflow:auto; max-height: 400px; font-size: 12px; line-height: 1.4; color: #333;">${t.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
                </div>
            `:""}
        </div>`}};export{p as r,g as s,d as t};
