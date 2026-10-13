import React from 'react';
import { Facebook, Instagram, Linkedin, Music2, Twitter, Youtube } from 'lucide-react';
import { SOCIAL_KEYS, useSiteConfig, type SocialKey } from '../analytics/config';
import { theme } from '../theme';

const ICONS: Record<SocialKey, [React.ReactNode, string]> = {
    instagram: [<Instagram size={18} />, 'Instagram'],
    facebook: [<Facebook size={18} />, 'Facebook'],
    youtube: [<Youtube size={18} />, 'YouTube'],
    linkedin: [<Linkedin size={18} />, 'LinkedIn'],
    x: [<Twitter size={18} />, 'X'],
    tiktok: [<Music2 size={18} />, 'TikTok'],
};

/** Yönetim panelinde girilen hesaplar; hiçbiri yoksa hiçbir şey çizilmez. */
export const SocialLinks: React.FC = () => {
    const { social } = useSiteConfig();
    const links = SOCIAL_KEYS.filter((k) => social[k]);
    if (!links.length) return null;
    return (
        <div style={{ display: 'flex', gap: 8 }}>
            {links.map((k) => (
                <a
                    key={k}
                    href={social[k]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={ICONS[k][1]}
                    title={ICONS[k][1]}
                    style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34,
                        borderRadius: 999, border: `1px solid ${theme.border}`, color: theme.textSubtle, background: '#fff',
                    }}
                >
                    {ICONS[k][0]}
                </a>
            ))}
        </div>
    );
};
