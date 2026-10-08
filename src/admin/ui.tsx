import React, { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { C, GRADIENT, cardStyle } from './format';

export const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = C.muted }) => (
    <Loader2 size={size} color={color} className="adm-spin" />
);

export const Dot: React.FC<{ color: string; size?: number; pulse?: boolean; title?: string }> = ({ color, size = 8, pulse, title }) => (
    <span
        title={title}
        style={{
            display: 'inline-block', width: size, height: size, borderRadius: 999, background: color, flexShrink: 0,
            boxShadow: pulse ? `0 0 0 3px ${color}33` : undefined, animation: pulse ? 'adm-pulse 1.8s ease-in-out infinite' : undefined,
        }}
    />
);

export const Badge: React.FC<{ color: string; children: React.ReactNode; solid?: boolean; title?: string }> = ({ color, children, solid, title }) => (
    <span title={title} style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap',
        fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.2,
        background: solid ? color : `${color}1c`, color: solid ? 'white' : `color-mix(in srgb, ${color} 72%, #0f172a)`, border: `1px solid ${color}55`,
    }}>
        {children}
    </span>
);

export const CountBadge: React.FC<{ n: number }> = ({ n }) => n > 0 ? (
    <span style={{
        minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: C.red, color: 'white', boxSizing: 'border-box',
        fontSize: '0.66rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
    }}>
        {n > 99 ? '99+' : n}
    </span>
) : null;

export const Card: React.FC<{ title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties; pad?: boolean }> = ({ title, actions, children, style, pad = true }) => (
    <div style={{ ...cardStyle, padding: pad ? 18 : 0, display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        {(title || actions) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: pad ? 0 : '16px 18px 0' }}>
                {title && <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>{title}</h3>}
                {actions && <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
            </div>
        )}
        {children}
    </div>
);

export const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; actions?: React.ReactNode }> = ({ icon, title, subtitle, actions }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: GRADIENT, color: 'white', boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)',
        }}>
            {icon}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: C.text }}>{title}</h1>
            {subtitle && <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '0.86rem', lineHeight: 1.5 }}>{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
);

export const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ padding: '22px 12px', textAlign: 'center', color: C.dim, fontSize: '0.84rem' }}>{children}</div>
);

export const ErrorBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div role="alert" style={{
        padding: '10px 12px', borderRadius: 10, background: '#fef2f2', border: '1px solid rgba(239, 68, 68, 0.35)',
        color: C.redText, fontSize: '0.82rem', lineHeight: 1.45,
    }}>
        {children}
    </div>
);

export const Avatar: React.FC<{ name: string; size?: number; online?: boolean }> = ({ name, size = 34, online }) => {
    const initials = name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toLocaleUpperCase('tr-TR')).join('') || '?';
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
    const hue = Math.abs(hash) % 360;
    return (
        <span style={{ position: 'relative', flexShrink: 0, display: 'inline-flex' }}>
            <span style={{
                width: size, height: size, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, hsl(${hue} 78% 56%), hsl(${(hue + 40) % 360} 74% 48%))`, color: 'white', fontWeight: 800, fontSize: size * 0.38,
            }}>
                {initials}
            </span>
            {online !== undefined && (
                <span style={{
                    position: 'absolute', right: -1, bottom: -1, width: size * 0.3, height: size * 0.3, borderRadius: 999,
                    background: online ? C.green : C.dim, border: `2px solid ${C.panel}`,
                }} />
            )}
        </span>
    );
};

const useEscape = (onClose: () => void) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
};

const CloseBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button type="button" title="Kapat (Esc)" onClick={onClick} style={{
        background: C.soft, border: `1px solid ${C.border}`, borderRadius: 999, width: 32, height: 32,
        color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
        <X size={16} />
    </button>
);

export const Drawer: React.FC<{ title: React.ReactNode; onClose: () => void; children: React.ReactNode; width?: number }> = ({ title, onClose, children, width = 560 }) => {
    useEscape(onClose);
    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(30, 27, 75, 0.28)', backdropFilter: 'blur(3px)', animation: 'fadeIn 0.15s ease-out' }}>
            <aside onClick={e => e.stopPropagation()} style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: `min(${width}px, 100vw)`, background: C.panel,
                borderLeft: `1px solid ${C.borderStrong}`, boxShadow: '-20px 0 60px rgba(49, 46, 129, 0.18)', display: 'flex', flexDirection: 'column',
                animation: 'adm-slide-in 0.2s ease-out',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>{title}</div>
                    <CloseBtn onClick={onClose} />
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>{children}</div>
            </aside>
        </div>
    );
};

export const Modal: React.FC<{ title: React.ReactNode; onClose: () => void; children: React.ReactNode; width?: number; height?: string; actions?: React.ReactNode; bodyStyle?: React.CSSProperties }> = ({ title, onClose, children, width = 640, height, actions, bodyStyle }) => {
    useEscape(onClose);
    return (
        <div onClick={onClose} style={{
            position: 'fixed', inset: 0, zIndex: 950, background: 'rgba(30, 27, 75, 0.42)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.15s ease-out',
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                width: `min(${width}px, 100%)`, height, maxHeight: '94vh', display: 'flex', flexDirection: 'column', background: C.panel,
                borderRadius: 18, border: `1px solid ${C.borderStrong}`, overflow: 'hidden', boxShadow: '0 30px 80px rgba(49, 46, 129, 0.25)',
                animation: 'modalEnter 0.2s ease-out',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1, minWidth: 0, fontWeight: 800, color: C.text, fontSize: '1rem' }}>{title}</div>
                    {actions}
                    <CloseBtn onClick={onClose} />
                </div>
                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 18, ...bodyStyle }}>{children}</div>
            </div>
        </div>
    );
};

/** Ayrı yüklenen bölümlerin (ör. yapay zeka) hatası tüm paneli düşürmesin. */
export class SectionBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
    state: { error: Error | null } = { error: null };
    static getDerivedStateFromError(error: Error) { return { error }; }
    render() {
        if (!this.state.error) return this.props.children;
        return (
            <ErrorBox>
                Bu bölüm yüklenemedi: {this.state.error.message}
                <div style={{ marginTop: 8 }}>
                    <button type="button" onClick={() => this.setState({ error: null })} style={{ background: 'none', border: 'none', color: C.accentText, cursor: 'pointer', fontWeight: 700, padding: 0, fontFamily: 'inherit' }}>
                        Tekrar dene
                    </button>
                </div>
            </ErrorBox>
        );
    }
}

/** Paneldeki ortak animasyon / tablo sınıfları. */
export const AdminGlobalStyles: React.FC = () => (
    <style>{`
        @keyframes adm-spin { to { transform: rotate(360deg); } }
        .adm-spin { animation: adm-spin 0.9s linear infinite; }
        @keyframes adm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        @keyframes adm-slide-in { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalEnter { from { transform: translateY(12px) scale(0.98); opacity: 0; } to { transform: none; opacity: 1; } }
        .adm-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.82rem; }
        .adm-table th { position: sticky; top: 0; z-index: 1; background: #eef0ff; text-align: left; font-weight: 800; color: #4338ca; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.4px; padding: 10px 12px; border-bottom: 1px solid ${C.border}; white-space: nowrap; }
        .adm-table td { padding: 10px 12px; border-bottom: 1px solid rgba(99, 102, 241, 0.09); color: ${C.text}; vertical-align: middle; }
        .adm-table tbody tr:nth-child(even) td { background: #fafbff; }
        .adm-table tbody tr.adm-click { cursor: pointer; }
        .adm-table tbody tr.adm-click:hover td { background: rgba(99, 102, 241, 0.08); }
        .adm-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .adm-scroll::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.25); border-radius: 8px; }
        .adm-root input::placeholder, .adm-root textarea::placeholder { color: #9aa1b9; }
        .adm-root select option { background: #ffffff; color: ${C.text}; }
        .adm-root input:focus, .adm-root textarea:focus, .adm-root select:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15); }
        .adm-nav-btn:hover { background: rgba(99, 102, 241, 0.07) !important; }
        .adm-side-btn:hover { background: rgba(255, 255, 255, 0.16) !important; color: #ffffff !important; }
    `}</style>
);
