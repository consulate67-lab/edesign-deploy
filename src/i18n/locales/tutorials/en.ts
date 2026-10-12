import type tr from './tr';

const tutorials: typeof tr = {
    nav: 'How it works',
    eyebrow: 'Tutorial videos',
    title: 'How does it work?',
    subtitle: 'Watch every step from sign-up to an approved design in short, narrated videos.',
    help: 'How it works',
    helpHint: 'Short tutorial videos covering every feature of the designer',
    playerTitle: 'Tutorial videos',
    turkishOnly: 'The videos are narrated and captioned in Turkish.',
    watch: 'Watch',
    close: 'Close (Esc)',
    groupStart: 'Getting started',
    groupEditor: 'Designer',
    items: {
        signup: { title: 'Sign up and log in', desc: 'Create your account in a few steps and log in again.' },
        template: { title: 'Adapt a ready-made template', desc: 'Pick a template for your sector, then change the logo and texts.' },
        scratch: { title: 'Design from scratch and the designer tour', desc: 'Choose the document type, starting template and your data.' },
        textImage: { title: 'Adding text, images and boxes', desc: 'Add text, a logo, a stamp, a signature and boxes to your document.' },
        tableFormula: { title: 'Adding tables and formulas', desc: 'Build your own table and calculate with amounts.' },
        qrChart: { title: 'QR code, chart and share bar', desc: 'Add a QR code, a chart and a line-share indicator to your document.' },
        columnBackground: { title: 'Adding columns and a background', desc: 'Add or hide line-table columns; put a background on the page.' },
        documentFields: { title: 'Adding document fields', desc: 'Add any invoice data, such as the IBAN or order number, to the design.' },
        editFields: { title: 'Editing existing fields', desc: 'Font, colour, border, position; hiding and undo.' },
        saveApprove: { title: 'Saving, test download and approval', desc: 'Save your design, try it for free, then approve and download it.' },
    },
};

export default tutorials;
