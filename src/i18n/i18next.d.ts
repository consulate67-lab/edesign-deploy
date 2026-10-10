import 'i18next';
import type { Messages } from './locales/tr';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: { translation: Messages };
    }
}
