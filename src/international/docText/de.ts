import type { DocTextPack } from './types';

const de: DocTextPack = {
    titles: {
        invoice: 'Rechnung',
        credit: 'Gutschrift',
        corrected: 'Rechnungskorrektur',
        prepayment: 'Vorauszahlungsrechnung',
        partial: 'Teilrechnung',
        selfbilled: 'Gutschrift (Selbstfakturierung)',
        despatch: 'Lieferschein',
    },
    sample: {
        note: 'Vielen Dank für Ihren Auftrag.',
        paymentTerms: 'Zahlbar innerhalb von 30 Tagen ohne Abzug.',
        creditNote: 'Gutschrift für einen zurückgesandten Artikel (Transportschaden).',
        correctedNote: 'Diese Rechnung korrigiert den Einzelpreis der ursprünglichen Rechnung.',
        prepaymentNote: 'Vorauszahlung zum Auftrag {{order}}; sie wird mit der Schlussrechnung verrechnet.',
        partialNote: 'Teilrechnung für den ersten Projektabschnitt.',
        prepaymentItem: 'Anzahlung ({{pct}} %)',
        discount: 'Treuerabatt',
        product: 'Ergonomischer Bürostuhl',
        productDesc: 'Netzrücken schwarz, verstellbare Armlehnen',
        service: 'Montage und Einrichtung',
        accessory: 'Bodenschutzmatte',
        despatchNote: 'Bitte an der Warenannahme anliefern.',
        backorderReason: 'Vorübergehend nicht vorrätig; Nachlieferung nächste Woche.',
    },
};

export default de;
