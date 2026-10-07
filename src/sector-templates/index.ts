import { TICARET_TEMPLATES } from './groups/ticaret';
import { HIZMET_TEMPLATES } from './groups/hizmet';
import { SANAYI_TEMPLATES } from './groups/sanayi';
import { TURIZM_TEMPLATES } from './groups/turizm';
import { TASIMA_TEMPLATES } from './groups/tasima';
import { TICARET2_TEMPLATES } from './groups/ticaret2';
import { HIZMET2_TEMPLATES } from './groups/hizmet2';
import { SANAYI2_TEMPLATES } from './groups/sanayi2';
import type { SectorTemplate } from './types';

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
];
