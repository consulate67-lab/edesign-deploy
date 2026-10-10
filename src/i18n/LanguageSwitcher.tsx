import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { chooseLanguage, useLocaleT } from './index';
import { Flag } from './flags';
import { LOCALES, type Locale } from '../store/uiStore';
import { theme } from '../theme';

const NATIVE_NAMES: Record<Locale, string> = {
    tr: 'Türkçe',
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
};

/** Her dilin bayrağı: İngilizce için Birleşik Krallık. */
const LANGUAGE_FLAG: Record<Locale, string> = {
    tr: 'TR',
    en: 'GB',
    de: 'DE',
    fr: 'FR',
    es: 'ES',
};

/** Sayfa dili seçici. Belge dili buradan değil, sihirbazdaki ülkeden gelir. */
export const LanguageSwitcher: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
    const { t, locale } = useLocaleT();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div ref={rootRef} data-language-switcher style={{ position: 'relative', borderRadius: 999, ...style }}>
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`${t('lang.label')}: ${NATIVE_NAMES[locale]}`}
                title={t('lang.hint')}
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 12px', minHeight: 38, height: '100%',
                    borderRadius: 'inherit', border: `1px solid ${theme.border}`, background: 'rgba(255,255,255,0.9)',
                    color: theme.text, boxShadow: theme.shadowSm, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                }}
            >
                <Flag code={LANGUAGE_FLAG[locale]} height={14} />
                <span>{NATIVE_NAMES[locale]}</span>
                <ChevronDown size={14} color={theme.textSubtle} />
            </button>
            {open && (
                <div
                    role="listbox"
                    aria-label={t('lang.label')}
                    data-language-panel
                    style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 1000, minWidth: 190,
                        background: theme.surface, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12,
                        boxShadow: theme.shadowLg, padding: 6, textAlign: 'left', textTransform: 'none', letterSpacing: 'normal',
                    }}
                >
                    {LOCALES.map(l => {
                        const active = l === locale;
                        return (
                            <button
                                key={l}
                                type="button"
                                role="option"
                                aria-selected={active}
                                lang={l}
                                data-language={l}
                                onClick={() => { chooseLanguage(l); setOpen(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', borderRadius: 8,
                                    border: 'none', background: active ? theme.primarySoft : 'transparent', cursor: 'pointer',
                                    color: active ? theme.primary : theme.text, fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 700 : 500,
                                }}
                            >
                                <Flag code={LANGUAGE_FLAG[l]} height={14} />
                                <span style={{ flex: 1, textAlign: 'left' }}>{NATIVE_NAMES[l]}</span>
                                {active && <Check size={14} />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
