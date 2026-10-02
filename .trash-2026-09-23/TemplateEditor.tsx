import React, { useState, useEffect } from 'react';
import { ChevronLeft, Download, Code, FileJson, Eye } from 'lucide-react';
import { transformXmlWithXslt } from './xsltTransformer.ts';

interface TemplateEditorProps {
    template: string;
    docName: string;
    onBack: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, docName, onBack }) => {
    const [xsltCode, setXsltCode] = useState('');
    const [xmlCode, setXmlCode] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');
    const [activeTab, setActiveTab] = useState<'xslt' | 'xml'>('xslt');
    const [isLoading, setIsLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [xsltRes, xmlRes] = await Promise.all([
                    fetch(`./${template}`),
                    fetch(`./examples/e-fatura-detail.xml`)
                ]);
                const xsltText = await xsltRes.text();
                const xmlText = await xmlRes.text();
                setXsltCode(xsltText);
                setXmlCode(xmlText);
                setIsLoading(false);
            } catch (err) {
                console.error("Data load error:", err);
            }
        };
        loadData();
    }, [template]);

    // Update preview
    useEffect(() => {
        if (xsltCode && xmlCode) {
            const html = transformXmlWithXslt(xmlCode, xsltCode);
            setPreviewHtml(html);
        }
    }, [xsltCode, xmlCode]);

    const handleDownload = () => {
        const blob = new Blob([xsltCode], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = template || 'custom.xslt';
        a.click();
    };

    if (isLoading) return <div style={{ color: 'white', padding: '2rem' }}>Yükleniyor...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a' }}>
            {/* Header */}
            <header style={{
                height: '64px',
                background: '#1e293b',
                borderBottom: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <ChevronLeft size={24} />
                    </button>
                    <div style={{ color: 'white' }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{docName} Düzenleyici</h1>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{template}</span>
                    </div>
                </div>
                <button onClick={handleDownload} className="btn-primary" style={{ height: '40px', padding: '0 1.5rem' }}>
                    <Download size={18} style={{ marginRight: '8px' }} /> Kaydet / İndir
                </button>
            </header>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Editor Side */}
                <div style={{ width: '45%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155' }}>
                    <div style={{ display: 'flex', background: '#0f172a', padding: '0.5rem' }}>
                        <button
                            onClick={() => setActiveTab('xslt')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: activeTab === 'xslt' ? '#1e293b' : 'transparent',
                                color: activeTab === 'xslt' ? 'white' : '#94a3b8',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Code size={16} /> XSLT Kaynak
                        </button>
                        <button
                            onClick={() => setActiveTab('xml')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: activeTab === 'xml' ? '#1e293b' : 'transparent',
                                color: activeTab === 'xml' ? 'white' : '#94a3b8',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FileJson size={16} /> Örnek XML
                        </button>
                    </div>
                    <div style={{ flex: 1, padding: '0 1rem 1rem' }}>
                        <textarea
                            value={activeTab === 'xslt' ? xsltCode : xmlCode}
                            onChange={(e) => activeTab === 'xslt' ? setXsltCode(e.target.value) : setXmlCode(e.target.value)}
                            spellCheck={false}
                            style={{
                                width: '100%',
                                height: '100%',
                                background: '#020617',
                                color: '#e2e8f0',
                                border: '1px solid #334155',
                                borderRadius: '12px',
                                padding: '1rem',
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                lineHeight: '1.6',
                                resize: 'none',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Preview Side */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                    <div style={{
                        padding: '0.75rem 1.5rem',
                        background: 'white',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#64748b',
                        fontSize: '0.875rem'
                    }}>
                        <Eye size={16} /> Canlı Önizleme
                    </div>
                    <div style={{ flex: 1, overflow: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            width: '210mm',
                            minHeight: '297mm',
                            background: 'white',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                            padding: '15mm',
                            position: 'relative'
                        }}>
                            <iframe
                                srcDoc={previewHtml}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                title="XSLT Preview"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
