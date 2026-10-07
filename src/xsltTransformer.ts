/**
 * XMLSerializer script gövdesindeki `<`, `>`, `&` karakterlerini kaçışlar; HTML
 * olarak yüklenince script çalışmaz (ör. GİB şablonlarındaki karekod). Script
 * içeriği HTML'de ham metindir, kaçışlar geri alınır.
 */
export const restoreScriptText = (html: string): string =>
    html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi, (_, open: string, body: string, close: string) =>
        open + body.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') + close);

export const transformXmlWithXslt = (xmlString: string, xsltString: string): string => {
    // DEBUG LOG
    console.log('🔄 transformXmlWithXslt INPUT (First 100 chars):', xsltString ? xsltString.substring(0, 100) : 'NULL/UNDEFINED');

    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");
        const xsltDoc = parser.parseFromString(xsltString, "application/xml");

        // CEHCK FOR PARSER ERRORS
        const xmlError = xmlDoc.querySelector("parsererror");
        if (xmlError) {
            throw new Error(`XML Parse Error: ${xmlError.textContent}`);
        }
        const xsltError = xsltDoc.querySelector("parsererror");
        if (xsltError) {
            throw new Error(`XSLT Parse Error: ${xsltError.textContent}`);
        }

        const processor = new XSLTProcessor();
        processor.importStylesheet(xsltDoc);

        let resultDoc = processor.transformToDocument(xmlDoc);

        const serializer = new XMLSerializer();

        if (!resultDoc) {
            // Fallback: try to transform to fragment
            console.warn('transformToDocument returned null, trying transformToFragment...');
            const resultFragment = processor.transformToFragment(xmlDoc, document);
            if (resultFragment) {
                return restoreScriptText(serializer.serializeToString(resultFragment));
            }
            throw new Error('XSLT transformation produced null result. Possible causes: Invalid XSLT syntax, missing templates, or runtime errors (e.g. format-number pattern mismatch).');
        }

        return restoreScriptText(serializer.serializeToString(resultDoc));
    } catch (error) {
        console.error("XSLT Transformation Error:", error);

        let context = "";
        let lineMatch = error instanceof Error ? error.message.match(/line (\d+)/) : null;
        if (lineMatch) {
            const lineNum = parseInt(lineMatch[1]);
            const lines = xsltString.split('\n');
            const start = Math.max(0, lineNum - 10);
            const end = Math.min(lines.length, lineNum + 10);
            context = lines.slice(start, end).map((l, i) => `${start + i + 1}: ${l}`).join('\n');
        }

        return `<div style="padding:20px; color:red; background:#fee; border:1px solid red; font-family: sans-serif;">
            <h3 style="margin-top:0;">Hata: XSLT Dönüşümü başarısız oldu</h3>
            <pre style="white-space: pre-wrap; font-weight: bold;">${error instanceof Error ? error.message : error}</pre>
            ${context ? `
                <div style="margin-top: 15px;">
                    <div style="font-weight: bold; margin-bottom: 5px; color: #721c24;">Hata Çevresi (Satır ${lineMatch![1]}):</div>
                    <pre style="background:#fff; padding:10px; border:1px solid #ddd; overflow:auto; max-height: 400px; font-size: 12px; line-height: 1.4; color: #333;">${context.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                </div>
            ` : ''}
        </div>`;
    }
};
