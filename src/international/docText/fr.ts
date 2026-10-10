import type { DocTextPack } from './types';

const fr: DocTextPack = {
    titles: {
        invoice: 'Facture',
        credit: 'Avoir',
        corrected: 'Facture rectificative',
        prepayment: 'Facture d’acompte',
        partial: 'Facture partielle',
        selfbilled: 'Autofacture',
        despatch: 'Bon de livraison',
    },
    sample: {
        note: 'Merci pour votre confiance.',
        paymentTerms: 'Paiement à 30 jours, sans escompte.',
        creditNote: 'Avoir pour un article retourné (endommagé pendant le transport).',
        correctedNote: 'Cette facture rectifie le prix unitaire de la facture d’origine.',
        prepaymentNote: 'Acompte sur la commande {{order}} ; il sera déduit de la facture finale.',
        partialNote: 'Facture partielle pour la première phase du projet.',
        prepaymentItem: 'Acompte ({{pct}} %)',
        discount: 'Remise fidélité',
        product: 'Fauteuil de bureau ergonomique',
        productDesc: 'Dossier en maille noire, accoudoirs réglables',
        service: 'Installation et réglage',
        accessory: 'Tapis de protection de sol',
        despatchNote: 'Merci de livrer à l’entrée des marchandises.',
        backorderReason: 'Temporairement en rupture de stock ; livraison la semaine prochaine.',
    },
};

export default fr;
