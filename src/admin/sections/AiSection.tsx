import React, { Suspense, lazy, useMemo } from 'react';
import { Bot } from 'lucide-react';
import type { AiDesignerService } from '../ai-designer';
import { adminApi } from '../adminApi';
import { useAdmin } from '../adminContext';
import { C } from '../format';
import { SectionHeader, Spinner } from '../ui';

const AiDesigner = lazy(() => import('../ai-designer').then(m => ({ default: m.AiDesigner })));

export const AiSection: React.FC = () => {
    const { go, setGalleryDraft } = useAdmin();

    const service = useMemo<AiDesignerService>(() => ({
        listMemory: (docTypeId?: string) => adminApi.aiMemory(docTypeId),
        saveMemory: input => adminApi.saveAiMemory(input),
        updateMemory: (id, patch) => adminApi.updateAiMemory(id, patch),
        publishToGallery: async input => ({ id: (await adminApi.createGallery(input)).id }),
    }), []);

    return (
        <div data-admin-section="ai">
            <SectionHeader icon={<Bot size={20} />} title="Tasarım yapay zekası"
                subtitle="Belge tipi ve sektöre göre soruları yanıtlayın; yapay zeka tasarım üretir, beğenilenleri hafızasına alır ve galeriye yayınlayabilirsiniz." />
            <Suspense fallback={<div style={{ display: 'flex', gap: 8, color: C.muted, padding: 20 }}><Spinner /> Tasarım yapay zekası yükleniyor…</div>}>
                <AiDesigner service={service} onOpenInEditor={(moduleId, xslt, name, xml) => {
                    setGalleryDraft({ moduleId, xslt, name, xml });
                    go('gallery');
                }} />
            </Suspense>
        </div>
    );
};
