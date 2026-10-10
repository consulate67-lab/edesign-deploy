import type { DocTextPack } from './types';

const en: DocTextPack = {
    titles: {
        invoice: 'Invoice',
        credit: 'Credit note',
        corrected: 'Corrected invoice',
        prepayment: 'Prepayment invoice',
        partial: 'Partial invoice',
        selfbilled: 'Self-billed invoice',
        despatch: 'Delivery note',
    },
    sample: {
        note: 'Thank you for your business.',
        paymentTerms: 'Payable within 30 days without deduction.',
        creditNote: 'Credit for one returned item (damaged in transit).',
        correctedNote: 'This invoice corrects the unit price of the original invoice.',
        prepaymentNote: 'Advance payment for order {{order}}; it will be deducted from the final invoice.',
        partialNote: 'Partial invoice for the first project phase.',
        prepaymentItem: 'Advance payment ({{pct}}%)',
        discount: 'Loyalty discount',
        product: 'Ergonomic office chair',
        productDesc: 'Black mesh back, adjustable armrests',
        service: 'Installation and set-up',
        accessory: 'Floor protection mat',
        despatchNote: 'Please deliver to the goods entrance.',
        backorderReason: 'Temporarily out of stock; follows next week.',
    },
};

export default en;
