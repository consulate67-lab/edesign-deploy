import { TICARET_TEMPLATES } from './groups/ticaret';
import { HIZMET_TEMPLATES } from './groups/hizmet';
import { SANAYI_TEMPLATES } from './groups/sanayi';
import type { SectorTemplate } from './types';

export * from './types';

export const SECTOR_TEMPLATES: SectorTemplate[] = [
    ...TICARET_TEMPLATES,
    ...HIZMET_TEMPLATES,
    ...SANAYI_TEMPLATES,
];
