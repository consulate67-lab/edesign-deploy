import type { MailContent } from '../../contracts';
import type { MailLang } from './countries';
import trHtml from '../../../../marketing/email-tanitim.html?raw';
import trText from '../../../../marketing/email-tanitim.txt?raw';
import enHtml from '../../../../marketing/email-tanitim-en.html?raw';
import enText from '../../../../marketing/email-tanitim-en.txt?raw';
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
import subjects from '../../../../marketing/email-tanitim-subjects.json';

/** Dile göre hazır tanıtım broşürü; yabancı diller `marketing/build-intl-brochures.mjs` ile üretilir. */
export const BROCHURES: Record<MailLang, MailContent> = {
    tr: { subject: 'e-Fatura tasarımınız artık dakikalar içinde hazır', html: trHtml, text: trText },
    en: { subject: subjects.en, html: enHtml, text: enText },
    de: { subject: subjects.de, html: deHtml, text: deText },
    fr: { subject: subjects.fr, html: frHtml, text: frText },
    es: { subject: subjects.es, html: esHtml, text: esText },
    ru: { subject: subjects.ru, html: ruHtml, text: ruText },
    zh: { subject: subjects.zh, html: zhHtml, text: zhText },
    hi: { subject: subjects.hi, html: hiHtml, text: hiText },
};
