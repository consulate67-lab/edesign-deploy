import React, { useId } from 'react';

/** Sarp: göz kırpan, yanakları pembe küçük robot. Animasyon sınıfları AssistantWidget'taki stil bloğunda. */
export const RobotIcon: React.FC<{ size?: number; animated?: boolean }> = ({ size = 40, animated = true }) => {
    const uid = useId().replace(/:/g, '');
    const head = `edi-head-${uid}`;
    const screen = `edi-screen-${uid}`;
    const glow = `edi-glow-${uid}`;
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
            <defs>
                <linearGradient id={head} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#e9e3ff" />
                </linearGradient>
                <linearGradient id={screen} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#4c1d95" />
                    <stop offset="1" stopColor="#1e3a8a" />
                </linearGradient>
                <radialGradient id={glow}>
                    <stop offset="0" stopColor="#fde68a" />
                    <stop offset="1" stopColor="#f472b6" />
                </radialGradient>
            </defs>
            <line x1="32" y1="9" x2="32" y2="15" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" />
            <circle className={animated ? 'edi-antenna' : undefined} cx="32" cy="7" r="3.6" fill={`url(#${glow})`} />
            <rect x="5.5" y="27" width="7" height="13" rx="3.5" fill="#c4b5fd" />
            <rect x="51.5" y="27" width="7" height="13" rx="3.5" fill="#c4b5fd" />
            <rect x="24" y="48" width="16" height="7" rx="3.5" fill="#c4b5fd" />
            <rect x="10.5" y="14.5" width="43" height="36" rx="15" fill={`url(#${head})`} stroke="#7c3aed" strokeWidth="2.2" />
            <rect x="16.5" y="21.5" width="31" height="22" rx="10" fill={`url(#${screen})`} />
            <g className={animated ? 'edi-eyes' : undefined}>
                <ellipse cx="26" cy="31" rx="3.2" ry="4" fill="#67e8f9" />
                <ellipse cx="38" cy="31" rx="3.2" ry="4" fill="#67e8f9" />
                <circle cx="27.1" cy="29.6" r="1.1" fill="#ffffff" />
                <circle cx="39.1" cy="29.6" r="1.1" fill="#ffffff" />
            </g>
            <path d="M27.5 37 Q32 40.6 36.5 37" fill="none" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" />
            <circle cx="21.2" cy="37.4" r="2.1" fill="#f9a8d4" opacity="0.85" />
            <circle cx="42.8" cy="37.4" r="2.1" fill="#f9a8d4" opacity="0.85" />
        </svg>
    );
};
