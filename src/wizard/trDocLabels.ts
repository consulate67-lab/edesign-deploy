/**
 * Türkiye belge türü adları / açıklamaları — arayüz diline göre.
 * Dinamik anahtar (id) kullanıldığı için returnObjects yerine tek tek t() çağrılır.
 */
import i18n, { currentLocale } from '../i18n';
import { FAMILY_INFO, type DocFamily, type WizardDocType } from './docTypes';

export const trDocName = (id: string, fallback?: string, lng: string = currentLocale()): string =>
    String(i18n.t(`wizard.trDocNames.${id}`, { lng, defaultValue: fallback ?? id }));

export const trDocLabel = (doc: WizardDocType): string => trDocName(doc.id, doc.label);

export const trDocDescription = (doc: WizardDocType): string =>
    String(i18n.t(`wizard.trDocs.${doc.id}`, { defaultValue: doc.description }));

export const familyLabel = (family: DocFamily): string =>
    String(i18n.t(`wizard.family.${family}`, { defaultValue: FAMILY_INFO[family].label }));
