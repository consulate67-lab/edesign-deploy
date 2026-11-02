import React, { useMemo, useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { theme } from '../theme';
import { brazilCopy } from './brazilCopy';
import type { BrazilVariant } from './brazilMarket';

const WHATSAPP = 'https://wa.me/905336660125';

const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 12,
    border: `1px solid ${theme.borderStrong}`,
    fontSize: 14,
    fontFamily: 'inherit',
    background: '#fff',
    color: theme.text,
    boxSizing: 'border-box',
};

interface Props {
    variant: BrazilVariant;
}

/** Concierge + fiyat testi: WhatsApp'a önceden doldurulmuş mesaj açar. */
export const BrazilConcierge: React.FC<Props> = ({ variant }) => {
    const c = brazilCopy.concierge;
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [role, setRole] = useState(c.roles[0].id);
    const [price, setPrice] = useState(c.prices[1].id);
    const [note, setNote] = useState('');

    const canSubmit = name.trim().length > 1 && (email.trim() || whatsapp.trim());

    const message = useMemo(() => {
        const roleLabel = c.roles.find(r => r.id === role)?.label ?? role;
        const priceLabel = c.prices.find(p => p.id === price)?.label ?? price;
        return [
            `Olá! Quero os 5 designs grátis do piloto Brasil (variante ${variant.toUpperCase()}).`,
            `Nome: ${name.trim()}`,
            email.trim() ? `E-mail: ${email.trim()}` : null,
            whatsapp.trim() ? `WhatsApp: ${whatsapp.trim()}` : null,
            `Perfil: ${roleLabel}`,
            `Faixa de preço: ${priceLabel}`,
            note.trim() ? `Obs.: ${note.trim()}` : null,
        ].filter(Boolean).join('\n');
    }, [c.prices, c.roles, email, name, note, price, role, variant, whatsapp]);

    const openWhatsApp = () => {
        if (!canSubmit) return;
        window.open(`${WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <section
            id="concierge"
            className="ld-section"
            style={{ position: 'relative', zIndex: 1, padding: '56px 32px', maxWidth: 880, margin: '0 auto' }}
        >
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div
                    style={{
                        display: 'inline-block',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 1.6,
                        textTransform: 'uppercase',
                        color: theme.primary,
                        background: theme.primarySoft,
                        padding: '5px 12px',
                        borderRadius: 999,
                        marginBottom: 14,
                    }}
                >
                    {c.eyebrow}
                </div>
                <h2 style={{ fontSize: 'clamp(26px, 3.2vw, 36px)', fontWeight: 800, margin: '0 0 10px', color: theme.text, letterSpacing: '-0.025em' }}>
                    {c.title}
                </h2>
                <p style={{ fontSize: 16, color: theme.textMuted, margin: '0 auto', maxWidth: 620 }}>{c.subtitle}</p>
            </div>

            <div
                style={{
                    background: '#fff',
                    border: `1px solid ${theme.border}`,
                    borderRadius: 20,
                    padding: '28px 24px',
                    boxShadow: theme.shadow,
                    display: 'grid',
                    gap: 14,
                }}
            >
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: theme.textMuted }}>
                    {c.name}
                    <input value={name} onChange={e => setName(e.target.value)} style={fieldStyle} autoComplete="name" />
                </label>
                <div className="ld-br-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: theme.textMuted }}>
                        {c.email}
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={fieldStyle} autoComplete="email" />
                    </label>
                    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: theme.textMuted }}>
                        {c.whatsapp}
                        <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} style={fieldStyle} inputMode="tel" placeholder="11 99999-9999" />
                    </label>
                </div>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: theme.textMuted }}>
                    {c.role}
                    <select value={role} onChange={e => setRole(e.target.value)} style={fieldStyle}>
                        {c.roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                </label>
                <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                    <legend style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, marginBottom: 8 }}>{c.price}</legend>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {c.prices.map(p => {
                            const on = price === p.id;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setPrice(p.id)}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: 999,
                                        border: `1px solid ${on ? theme.primary : theme.border}`,
                                        background: on ? theme.primarySoft : '#fff',
                                        color: on ? theme.primary : theme.textMuted,
                                        fontWeight: 700,
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                </fieldset>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: theme.textMuted }}>
                    {c.note}
                    <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={3}
                        placeholder={c.notePh}
                        style={{ ...fieldStyle, resize: 'vertical' }}
                    />
                </label>
                <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={openWhatsApp}
                    style={{
                        marginTop: 4,
                        padding: '14px 22px',
                        border: 'none',
                        borderRadius: 14,
                        background: canSubmit ? theme.gradient : theme.border,
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 15,
                        cursor: canSubmit ? 'pointer' : 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        fontFamily: 'inherit',
                        boxShadow: canSubmit ? '0 12px 28px rgba(109, 40, 217, 0.28)' : 'none',
                    }}
                >
                    <MessageCircle size={18} /> {c.submit} <ArrowRight size={16} />
                </button>
                <p style={{ margin: 0, fontSize: 12, color: theme.textSubtle, lineHeight: 1.5 }}>{c.privacy}</p>
            </div>
        </section>
    );
};
