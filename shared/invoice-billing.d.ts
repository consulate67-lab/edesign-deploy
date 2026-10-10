export interface BillingProfile {
    partyType: 'company' | 'sole';
    title: string;
    taxId: string;
    scheme: 'VKN' | 'TCKN';
    taxOffice: string;
    city: string;
    address: string;
}

export type DocumentMode = 'auto' | 'EFATURA' | 'EARSIV';

export const VAT_RATE: number;
export const DOCUMENT_MODES: DocumentMode[];
export const INVOICE_NOTE_MAX: number;
export const INVOICE_NUMBER_RE: RegExp;

export function isIsoDate(value: unknown): boolean;

export function parseBilling(input: unknown): { error: string } | { billing: BillingProfile };

export function splitInclusiveVat(gross: number | string, rate?: number): { gross: number; net: number; vat: number; rate: number };

export function istanbulDate(date?: Date): string;

export function buildInvoiceDraft(input: {
    plan: { name: string; price: number | string; credits: number };
    billing: BillingProfile;
    user?: { username?: string | null; phone_number?: string | null } | null;
    merchantOid?: string | null;
    issueDate: string;
    website?: string | null;
    currency?: 'TRY' | 'EUR' | 'GBP';
    documentMode?: DocumentMode;
    note?: string;
}): {
    integrator: 'edm';
    issueDate: string;
    notes: string[];
    document: { mode: DocumentMode; preferred: 'EFATURA' | 'EARSIV'; profileId: string };
    totals: { taxExclusive: number; vat: number; taxInclusive: number; payable: number };
    lines: { name: string }[];
    edm: { method: string };
};
