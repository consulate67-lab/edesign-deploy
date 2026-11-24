/**
 * Shopify gömülü app içindeki tasarım editörü — aynı XSLTEditor bileşeni.
 * Ana pazarlama sitesini açmaz; /shopify/editor/ altında çalışır.
 */
import { StrictMode, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import '../i18n';
import '../index.css';
import { XSLTEditor } from '../xslt-editor/XsltEditor';
import { ErrorBoundary } from '../components/ErrorBoundary';

type Boot = {
  xslt?: string;
  xml?: string;
  moduleId?: string;
  name?: string;
  designId?: number;
};

function readBoot(): Boot {
  try {
    const raw = sessionStorage.getItem('edx_shopify_editor');
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Boot;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function ShopifyEmbedEditor() {
  const boot = useMemo(() => readBoot(), []);

  const onBack = useCallback(() => {
    try {
      window.parent?.postMessage({ type: 'edx-shopify-editor-close' }, window.location.origin);
    } catch {
      /* ignore */
    }
  }, []);

  const onWorkChange = useCallback((work: { moduleId: string; xslt: string; xml: string; designId?: number }) => {
    try {
      sessionStorage.setItem('edx_shopify_editor_work', JSON.stringify(work));
    } catch {
      /* quota */
    }
    try {
      window.parent?.postMessage({ type: 'edx-shopify-editor-work', work }, window.location.origin);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div style={{ height: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <XSLTEditor
        initialModuleId={boot.moduleId || 'fatura'}
        initialXslt={boot.xslt}
        initialXml={boot.xml}
        docName={boot.name || 'Shopify şablon'}
        initialDesignId={boot.designId}
        onWorkChange={onWorkChange}
        onBack={onBack}
      />
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <ShopifyEmbedEditor />
      </ErrorBoundary>
    </StrictMode>,
  );
}
