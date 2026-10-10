import type { DocLanguage, ExtraDocLanguage } from '../registry/docLanguages';
import type { DocTextPack, ExtraDocTextPack, IntlDocKind } from './types';
import tr from './tr';
import en from './en';
import de from './de';
import fr from './fr';
import es from './es';
import it from './it';
import nl from './nl';
import pt from './pt';
import pl from './pl';
import cs from './cs';
import sk from './sk';
import sl from './sl';
import hr from './hr';
import hu from './hu';
import ro from './ro';
import bg from './bg';
import el from './el';
import da from './da';
import sv from './sv';
import nb from './nb';
import fi from './fi';
import et from './et';
import lv from './lv';
import lt from './lt';
import isl from './is';
import mt from './mt';
import ga from './ga';
import ca from './ca';
import eu from './eu';
import gl from './gl';

const EXTRA: Record<ExtraDocLanguage, ExtraDocTextPack> = {
    it, nl, pt, pl, cs, sk, sl, hr, hu, ro, bg, el, da, sv, nb, fi, et, lv, lt, is: isl, mt, ga, ca, eu, gl,
};

const PACKS: Record<DocLanguage, DocTextPack> = { tr, en, de, fr, es, ...EXTRA };

export const docTextPack = (lang: DocLanguage): DocTextPack => PACKS[lang];

/** Arayüz dili olmayan belge dilinin paketi; arayüz dillerinde null. */
export const extraDocTextPack = (lang: DocLanguage): ExtraDocTextPack | null =>
    (EXTRA as Partial<Record<DocLanguage, ExtraDocTextPack>>)[lang] ?? null;

/** Belgenin o dildeki adı (ör. it + credit → 'Nota di credito'). */
export const docTitle = (lang: DocLanguage, kind: IntlDocKind): string => PACKS[lang].titles[kind];

export type { DocTextPack, ExtraDocTextPack, IntlDocKind, SampleTexts, DocObjectTexts, DocTitles } from './types';
