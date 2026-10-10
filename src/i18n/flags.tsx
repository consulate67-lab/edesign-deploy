import React from 'react';
import {
    AT, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IS, IT, LI, LT, LU, LV, MT, NL, NO, PL, PT, RO, SE, SI, SK, TR,
} from 'country-flag-icons/react/3x2';

type FlagIcon = typeof TR;

/** Yalnız kayıttaki ülkelerin bayrakları; paket ağaç sallamayla diğerlerini dışarıda bırakır. */
const FLAGS: Record<string, FlagIcon> = {
    AT, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IS, IT, LI, LT, LU, LV, MT, NL, NO, PL, PT, RO, SE, SI, SK, TR,
};

export const Flag: React.FC<{ code: string; title?: string; height?: number; style?: React.CSSProperties }> = ({ code, title, height = 14, style }) => {
    const Icon = FLAGS[code];
    if (!Icon) return null;
    return (
        <Icon
            title={title}
            aria-hidden={title ? undefined : true}
            style={{
                height, width: height * 1.5, borderRadius: 2, flexShrink: 0, display: 'block',
                boxShadow: '0 0 0 1px rgba(15, 23, 42, 0.12)', ...style,
            }}
        />
    );
};
