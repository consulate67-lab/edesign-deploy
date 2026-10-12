import type tr from './tr';

const tutorials: typeof tr = {
    nav: 'Mode d’emploi',
    eyebrow: 'Vidéos tutoriels',
    title: 'Comment ça marche ?',
    subtitle: 'Chaque étape, de l’inscription à la conception approuvée, en courtes vidéos commentées.',
    help: 'Mode d’emploi',
    helpHint: 'Courtes vidéos présentant chaque fonction de l’éditeur',
    playerTitle: 'Vidéos tutoriels',
    turkishOnly: 'Les vidéos sont commentées et sous-titrées en turc.',
    watch: 'Regarder',
    close: 'Fermer (Échap)',
    groupStart: 'Premiers pas',
    groupEditor: 'Éditeur',
    items: {
        signup: { title: 'Inscription et connexion', desc: 'Créez votre compte en quelques étapes et reconnectez-vous.' },
        template: { title: 'Adapter un modèle prêt à l’emploi', desc: 'Choisissez un modèle de votre secteur, changez le logo et les textes.' },
        scratch: { title: 'Conception de zéro et visite de l’éditeur', desc: 'Choisissez le type de document, le modèle de départ et vos données.' },
        textImage: { title: 'Ajouter texte, image et cadre', desc: 'Ajoutez texte, logo, cachet, signature et cadres à votre document.' },
        tableFormula: { title: 'Ajouter tableau et formule', desc: 'Créez votre propre tableau et calculez avec les montants.' },
        qrChart: { title: 'QR code, graphique et barre de part', desc: 'Ajoutez un QR code, un graphique et un indicateur de part par ligne.' },
        columnBackground: { title: 'Colonnes et arrière-plan', desc: 'Ajoutez ou masquez des colonnes du tableau ; mettez un fond de page.' },
        documentFields: { title: 'Ajouter des champs du document', desc: 'Ajoutez toute donnée de la facture, comme l’IBAN ou le n° de commande.' },
        editFields: { title: 'Modifier les champs existants', desc: 'Police, couleur, bordure, position ; masquer et annuler.' },
        saveApprove: { title: 'Enregistrer, tester et approuver', desc: 'Enregistrez, testez gratuitement, puis approuvez et téléchargez.' },
    },
};

export default tutorials;
