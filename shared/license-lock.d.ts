export declare const hasLicenseLock: (xslt: string | null | undefined) => boolean;
export declare const normalizeTaxId: (value: unknown) => string;
export declare const isValidTaxId: (value: unknown) => boolean;
export declare function withIssuerTaxId(xml: string, taxId: string): string;
export declare function applyLicenseLock(xslt: string, taxId: string): string;
