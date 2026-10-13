import type { MailContent } from '../../contracts';
import type { BrochureId } from './countries';
import trHtml from '../../../../marketing/email-tanitim.html?raw';
import trText from '../../../../marketing/email-tanitim.txt?raw';
import enHtml from '../../../../marketing/email-tanitim-en.html?raw';
import enText from '../../../../marketing/email-tanitim-en.txt?raw';
import enUsHtml from '../../../../marketing/email-tanitim-en-us.html?raw';
import enUsText from '../../../../marketing/email-tanitim-en-us.txt?raw';
import enInHtml from '../../../../marketing/email-tanitim-en-in.html?raw';
import enInText from '../../../../marketing/email-tanitim-en-in.txt?raw';
import deHtml from '../../../../marketing/email-tanitim-de.html?raw';
import deText from '../../../../marketing/email-tanitim-de.txt?raw';
import frHtml from '../../../../marketing/email-tanitim-fr.html?raw';
import frText from '../../../../marketing/email-tanitim-fr.txt?raw';
import esHtml from '../../../../marketing/email-tanitim-es.html?raw';
import esText from '../../../../marketing/email-tanitim-es.txt?raw';
import ruHtml from '../../../../marketing/email-tanitim-ru.html?raw';
import ruText from '../../../../marketing/email-tanitim-ru.txt?raw';
import zhHtml from '../../../../marketing/email-tanitim-zh.html?raw';
import zhText from '../../../../marketing/email-tanitim-zh.txt?raw';
import hiHtml from '../../../../marketing/email-tanitim-hi.html?raw';
import hiText from '../../../../marketing/email-tanitim-hi.txt?raw';
import ptHtml from '../../../../marketing/email-tanitim-pt.html?raw';
import ptText from '../../../../marketing/email-tanitim-pt.txt?raw';
import subjects from '../../../../marketing/email-tanitim-subjects.json';

/** Hazır tanıtım broşürleri; yabancı diller `marketing/build-intl-brochures.mjs` ile üretilir. */
export const BROCHURES: Record<BrochureId, MailContent> = {
    tr: { subject: 'e-Fatura tasarımınız artık dakikalar içinde hazır', html: trHtml, text: trText },
    en: { subject: subjects.en, html: enHtml, text: enText },
    'en-us': { subject: subjects['en-us'], html: enUsHtml, text: enUsText },
    'en-in': { subject: subjects['en-in'], html: enInHtml, text: enInText },
    de: { subject: subjects.de, html: deHtml, text: deText },
    fr: { subject: subjects.fr, html: frHtml, text: frText },
    es: { subject: subjects.es, html: esHtml, text: esText },
    ru: { subject: subjects.ru, html: ruHtml, text: ruText },
    zh: { subject: subjects.zh, html: zhHtml, text: zhText },
    hi: { subject: subjects.hi, html: hiHtml, text: hiText },
    pt: { subject: subjects.pt, html: ptHtml, text: ptText },
};
