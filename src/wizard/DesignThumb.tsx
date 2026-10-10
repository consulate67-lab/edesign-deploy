import React, { useEffect, useState } from 'react';
import { transformXmlWithXslt } from '../xsltTransformer';
import { theme } from '../theme';

const PAGE_W = 794;

/** Hazır tasarımın örnek veriyle küçük önizlemesi (sayfanın üst kısmı). */
export const DesignThumb: React.FC<{
    load: () => Promise<string>;
    sampleXml: () => string;
    width: number;
    height: number;
    delay?: number;
}> = ({ load, sampleXml, width, height, delay = 0 }) => {
    const [html, setHtml] = useState<string | null>(null);
    useEffect(() => {
        let alive = true;
        const timer = setTimeout(async () => {
            try {
                const out = transformXmlWithXslt(sampleXml(), await load());
                if (alive) setHtml(out);
            } catch {
                if (alive) setHtml('');
            }
        }, delay);
        return () => { alive = false; clearTimeout(timer); };
    }, [load, sampleXml, delay]);
    const scale = width / PAGE_W;
    return (
        <div data-design-thumb style={{
            width, height, overflow: 'hidden', position: 'relative', borderRadius: 8,
            border: `1px solid ${theme.border}`, background: theme.surfaceAlt,
        }}>
            {html && (
                <iframe title="" srcDoc={html} tabIndex={-1} aria-hidden scrolling="no" style={{
                    position: 'absolute', top: 0, left: 0, width: PAGE_W, height: height / scale, border: 0,
                    transform: `scale(${scale})`, transformOrigin: '0 0', pointerEvents: 'none', background: '#fff',
                }} />
            )}
        </div>
    );
};
