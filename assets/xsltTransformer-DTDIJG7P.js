const p=(m,a)=>{console.log("🔄 transformXmlWithXslt INPUT (First 100 chars):",a?a.substring(0,100):"NULL/UNDEFINED");try{const r=new DOMParser,e=r.parseFromString(m,"application/xml"),t=r.parseFromString(a,"application/xml"),n=e.querySelector("parsererror");if(n)throw new Error(`XML Parse Error: ${n.textContent}`);const s=t.querySelector("parsererror");if(s)throw new Error(`XSLT Parse Error: ${s.textContent}`);const o=new XSLTProcessor;o.importStylesheet(t);let i=o.transformToDocument(e);const l=new XMLSerializer;if(!i){console.warn("transformToDocument returned null, trying transformToFragment...");const c=o.transformToFragment(e,document);if(c)return l.serializeToString(c);throw new Error("XSLT transformation produced null result. Possible causes: Invalid XSLT syntax, missing templates, or runtime errors (e.g. format-number pattern mismatch).")}return l.serializeToString(i)}catch(r){console.error("XSLT Transformation Error:",r);let e="",t=r instanceof Error?r.message.match(/line (\d+)/):null;if(t){const n=parseInt(t[1]),s=a.split(`
`),o=Math.max(0,n-10),i=Math.min(s.length,n+10);e=s.slice(o,i).map((l,c)=>`${o+c+1}: ${l}`).join(`
`)}return`<div style="padding:20px; color:red; background:#fee; border:1px solid red; font-family: sans-serif;">
            <h3 style="margin-top:0;">Hata: XSLT Dönüşümü başarısız oldu</h3>
            <pre style="white-space: pre-wrap; font-weight: bold;">${r instanceof Error?r.message:r}</pre>
            ${e?`
                <div style="margin-top: 15px;">
                    <div style="font-weight: bold; margin-bottom: 5px; color: #721c24;">Hata Çevresi (Satır ${t[1]}):</div>
                    <pre style="background:#fff; padding:10px; border:1px solid #ddd; overflow:auto; max-height: 400px; font-size: 12px; line-height: 1.4; color: #333;">${e.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
                </div>
            `:""}
        </div>`}};export{p as t};
