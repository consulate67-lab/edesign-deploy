/**
 * International public API — barrel re-export for the international
 * sub-system. Importers should use this entry point to keep imports
 * stable as internals are reorganized.
 */
export * from './registry/docTypes';
export * from './registry/countryProfiles';
export * from './registry/documentProfiles';
export * from './registry/countryNotes';
export * from './registry/docLanguages';
export * from './registry/countryDocuments';
export { docTextPack, extraDocTextPack, docTitle } from './docText';
export type { IntlDocKind, DocTextPack, ExtraDocTextPack, SampleTexts, DocObjectTexts } from './docText';
export { generateSampleXml } from './samples/generate';
export * from './fieldCatalog';
export * from './validators/ublSchema';
export * from './validators/europeanRules';
