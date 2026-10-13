export declare const hasLicenseLock: (xslt: string | null | undefined) => boolean;
export declare const normalizeTaxId: (value: unknown) => string;
export declare const isValidTaxId: (value: unknown) => boolean;
export declare const isVatId: (value: unknown) => boolean;
export declare const normalizeLicenseId: (value: unknown) => string;
export declare const isValidLicenseId: (value: unknown) => boolean;
export declare const licenseIdKind: (id: unknown) => 'VAT' | 'VKN' | 'TCKN' | 'EIN' | 'INN' | 'GSTIN' | 'USCC' | 'CNPJ' | 'CPF';
export declare function withIssuerTaxId(xml: string, taxId: string): string;
/** sealUrls: çevrimiçi doğrulama adresleri; belgedeki VKN/TCKN `{taxId}` yerine yazılır. */
export declare function applyLicenseLock(xslt: string, taxId: string, options?: { sealUrls?: string[] }): string;
