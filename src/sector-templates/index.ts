import { TICARET_TEMPLATES } from './groups/ticaret';
import { HIZMET_TEMPLATES } from './groups/hizmet';
import { SANAYI_TEMPLATES } from './groups/sanayi';
import { TURIZM_TEMPLATES } from './groups/turizm';
import { TASIMA_TEMPLATES } from './groups/tasima';
import { TICARET2_TEMPLATES } from './groups/ticaret2';
import { HIZMET2_TEMPLATES } from './groups/hizmet2';
import { SANAYI2_TEMPLATES } from './groups/sanayi2';
import { YANIT_TEMPLATES } from './groups/yanit';
import { API_URL } from '../api';
import type { GalleryDesign } from '../admin/contracts';
import { SECTORS, type SectorId, type SectorTemplate } from './types';

export * from './types';

export const SECTOR_TEMPLATES: SectorTemplate[] = [
    ...TICARET_TEMPLATES,
    ...TICARET2_TEMPLATES,
    ...TURIZM_TEMPLATES,
    ...TASIMA_TEMPLATES,
    ...HIZMET_TEMPLATES,
    ...HIZMET2_TEMPLATES,
    ...SANAYI_TEMPLATES,
    ...SANAYI2_TEMPLATES,
    ...YANIT_TEMPLATES,
];

const toTemplate = (d: GalleryDesign): SectorTemplate => {
    const id = `db-${d.id}`;
    const sector = (SECTORS.some(s => s.id === d.sector) ? d.sector : SECTORS.find(s => s.category === d.category)?.id ?? d.sector) as SectorId;
    return {
        id,
        sector,
        name: d.name,
        description: d.description,
        docTypeId: d.doc_type_id,
        moduleId: d.module_id || d.doc_type_id,
        accent: /^#[0-9a-f]{6}$/i.test(d.accent) ? d.accent : '#6366f1',
        xslt: `${id}.xslt`,
        xml: `${id}.xml`,
        tags: Array.isArray(d.tags) ? d.tags : [],
        inline: { xslt: d.xslt, xml: d.xml },
        source: 'admin',
    };
};

let dbTemplates: SectorTemplate[] | null = null;
let dbRequest: Promise<SectorTemplate[]> | null = null;

/** Yönetim panelinde yayınlanan galeri tasarımları; bir kez istenir, sunucuya ulaşılamazsa boş liste. */
export const loadDbTemplates = (): Promise<SectorTemplate[]> => {
    dbRequest ??= fetch(`${API_URL}/gallery`)
        .then(res => (res.ok ? res.json() : []))
        .then((list: unknown) => {
            dbTemplates = Array.isArray(list)
                ? (list as GalleryDesign[]).filter(d => d && d.published !== false && d.xslt && d.xml).map(toTemplate)
                : [];
            return dbTemplates;
        })
        .catch(() => {
            dbTemplates = [];
            return dbTemplates;
        });
    return dbRequest;
};

export const cachedDbTemplates = () => dbTemplates;
