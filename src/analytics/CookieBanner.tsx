import React, { useEffect, useState } from 'react';
import { theme } from '../theme';
import { useLocaleT } from '../i18n';
import { CerezPolitikasiModal } from '../legal/Legal';
import { TRACKING, hasAnyTracking, hasGoogle, hasMarketing } from './config';
import { onConsentOpen, readConsent, saveConsent } from './consent';

const toolNames = () => [
    hasGoogle() && 'Google',
    TRACKING.metaPixelId && 'Meta (Instagram, Facebook)',
    TRACKING.linkedinPartnerId && 'LinkedIn',
].filter(Boolean).join(', ');

const btn = (primary: boolean): React.CSSProperties => ({
    padding: '0.6rem 1.1rem',
    borderRadius: '0.65rem',
    border: primary ? 'none' : `1px solid ${theme.borderStrong}`,
    background: primary ? theme.primary : theme.surface,
    color: primary ? '#fff' : theme.text,
    fontWeight: 700,
    fontSize: '0.88rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
});

const Toggle: React.FC<{ title: string; text: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void }> = ({ title, text, checked, disabled, onChange }) => (
    <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.7rem 0', borderTop: `1px solid ${theme.border}`, cursor: disabled ? 'default' : 'pointer' }}>
        <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.checked)}
            style={{ marginTop: 3, width: 17, height: 17, accentColor: theme.primary, flexShrink: 0 }}
        />
        <span>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: theme.text }}>{title}</span>
            <span style={{ display: 'block', fontSize: '0.82rem', lineHeight: 1.5, color: theme.textMuted }}>{text}</span>
        </span>
    </label>
);

export const CookieBanner: React.FC = () => {
    const { t } = useLocaleT();
    const [open, setOpen] = useState(() => hasAnyTracking() && !readConsent());
    const [details, setDetails] = useState(false);
    const [policy, setPolicy] = useState(false);
    const [analytics, setAnalytics] = useState(() => readConsent()?.analytics ?? false);
    const [marketing, setMarketing] = useState(() => readConsent()?.marketing ?? false);

    useEffect(() => onConsentOpen(() => {
        if (!hasAnyTracking()) return;
        const c = readConsent();
        setAnalytics(c?.analytics ?? false);
        setMarketing(c?.marketing ?? false);
        setDetails(true);
        setOpen(true);
    }), []);

    if (policy) return <CerezPolitikasiModal onClose={() => setPolicy(false)} />;
    if (!open) return null;

    const decide = (a: boolean, m: boolean) => {
        saveConsent(a, m);
        setOpen(false);
        setDetails(false);
    };

    return (
        <div
            role="dialog"
            aria-live="polite"
            aria-label={t('consent.title')}
            style={{
                position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 2147482000,
                maxWidth: 560, margin: '0 auto', boxSizing: 'border-box',
                background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '1rem',
                boxShadow: theme.shadowLg, padding: '1.1rem 1.2rem', fontFamily: theme.font,
            }}
        >
            <div style={{ fontWeight: 800, fontSize: '1rem', color: theme.text, marginBottom: '0.35rem' }}>{t('consent.title')}</div>
            <p style={{ margin: '0 0 0.8rem', fontSize: '0.86rem', lineHeight: 1.55, color: theme.textMuted }}>
                {t('consent.text', { tools: toolNames() })}{' '}
                <a href="#cerez" onClick={(e) => { e.preventDefault(); setPolicy(true); }} style={{ color: theme.primary, fontWeight: 700 }}>
                    {t('consent.policy')}
                </a>
            </p>
            {details && (
                <div style={{ marginBottom: '0.8rem' }}>
                    <Toggle title={t('consent.necessaryTitle')} text={t('consent.necessaryText')} checked disabled />
                    {hasGoogle() && (
                        <Toggle title={t('consent.analyticsTitle')} text={t('consent.analyticsText')} checked={analytics} onChange={setAnalytics} />
                    )}
                    {(hasMarketing() || hasGoogle()) && (
                        <Toggle title={t('consent.marketingTitle')} text={t('consent.marketingText')} checked={marketing} onChange={setMarketing} />
                    )}
                </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end' }}>
                {details ? (
                    <button type="button" style={btn(false)} onClick={() => decide(analytics, marketing)}>{t('consent.save')}</button>
                ) : (
                    <button type="button" style={btn(false)} onClick={() => setDetails(true)}>{t('consent.settings')}</button>
                )}
                <button type="button" style={btn(false)} onClick={() => decide(false, false)}>{t('consent.reject')}</button>
                <button type="button" style={btn(true)} onClick={() => decide(true, true)}>{t('consent.accept')}</button>
            </div>
        </div>
    );
};
