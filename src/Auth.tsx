import React, { useEffect, useState } from 'react';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { api } from './api';
import { theme, techBackground } from './theme';

type AuthMode = 'login' | 'register';

interface AuthProps {
    mode?: AuthMode;
    onLogin: () => void;
    onRegister?: () => void;
    onSwitchMode?: (mode: AuthMode) => void;
    onBackToLanding?: () => void;
}

export const Auth: React.FC<AuthProps> = ({
    mode = 'login',
    onLogin,
    onRegister,
    onSwitchMode,
    onBackToLanding,
}) => {
    const [isLogin, setIsLogin] = useState(mode === 'login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Card entrance animation
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 30);
        return () => clearTimeout(t);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const res = await api.login(username, password);
                api.setToken(res.token);
                onLogin();
            } else {
                await api.register({
                    username,
                    password,
                    full_name: fullName,
                    company_name: companyName,
                    phone_number: phoneNumber,
                });

                // Auto-login after successful register — better UX
                const res = await api.login(username, password);
                api.setToken(res.token);
                if (onRegister) onRegister();
                else onLogin();
            }
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleMode = () => {
        const next = !isLogin;
        setIsLogin(next);
        setError('');
        setSuccessMessage('');
        if (onSwitchMode) onSwitchMode(next ? 'login' : 'register');
    };

    // Reusable input style helper
    const inputStyle = (field: string): React.CSSProperties => ({
        width: '100%',
        boxSizing: 'border-box',
        background: '#fff',
        border: `1px solid ${focusedField === field ? theme.primary : theme.borderStrong}`,
        borderRadius: 12,
        padding: '12px 14px',
        color: theme.text,
        fontSize: 14,
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
        boxShadow:
            focusedField === field
                ? theme.focusRing
                : 'none',
    });

    const labelStyle: React.CSSProperties = {
        color: theme.textMuted,
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 6,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        display: 'block',
    };

    return (
        <div
            style={{
                position: 'relative',
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                ...techBackground,
                fontFamily: theme.font,
                padding: '32px 24px',
                overflow: 'hidden',
            }}
        >
            {/* Sticky back link */}
            {onBackToLanding && (
                <button
                    type="button"
                    onClick={onBackToLanding}
                    style={{
                        position: 'fixed',
                        top: 24,
                        left: 24,
                        padding: '9px 16px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: `1px solid ${theme.border}`,
                        borderRadius: 999,
                        color: theme.textMuted,
                        boxShadow: theme.shadowSm,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        zIndex: 10,
                        transition: 'background 0.18s, border-color 0.18s, color 0.18s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.primarySoft;
                        e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)';
                        e.currentTarget.style.color = theme.primary;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.borderColor = theme.border;
                        e.currentTarget.style.color = theme.textMuted;
                    }}
                >
                    <ArrowLeft size={14} /> Ana sayfa
                </button>
            )}

            {/* Card */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: isLogin ? 440 : 560,
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: 24,
                    padding: '40px 36px',
                    boxShadow: theme.shadowLg,
                    overflow: 'hidden',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                    transition: 'opacity 0.35s ease, transform 0.35s ease, max-width 0.3s ease',
                }}
            >
                <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: theme.gradient }} />
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <img
                        src={`${import.meta.env.BASE_URL}favicon.svg`}
                        alt=""
                        width={56}
                        height={56}
                        style={{ display: 'block', margin: '0 auto 16px', borderRadius: 16, boxShadow: theme.shadowBrand }}
                    />
                    <h1
                        style={{
                            color: theme.text,
                            fontSize: 26,
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            margin: 0,
                        }}
                    >
                        {isLogin ? 'Tekrar hoş geldiniz' : 'Hesabınızı oluşturun'}
                    </h1>
                    <p
                        style={{
                            color: theme.textMuted,
                            fontSize: 14,
                            marginTop: 8,
                            lineHeight: 1.5,
                        }}
                    >
                        {isLogin
                            ? 'UBL-TR Designer hesabınıza giriş yapın'
                            : 'Tasarımcıyı kullanmaya başlamak için bilgilerinizi tamamlayın'}
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div
                        role="alert"
                        style={{
                            color: theme.redText,
                            background: theme.redSoft,
                            border: '1px solid #fecaca',
                            padding: '10px 14px',
                            borderRadius: 10,
                            marginBottom: 18,
                            fontSize: 13,
                        }}
                    >
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div
                        role="status"
                        style={{
                            color: theme.greenText,
                            background: theme.greenSoft,
                            border: '1px solid #a7f3d0',
                            padding: '10px 14px',
                            borderRadius: 10,
                            marginBottom: 18,
                            fontSize: 13,
                        }}
                    >
                        {successMessage}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                    {!isLogin && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 12,
                            }}
                        >
                            <div>
                                <label style={labelStyle}>Ad Soyad</label>
                                <input
                                    type="text"
                                    placeholder="örn. Ahmet Yılmaz"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    onFocus={() => setFocusedField('fullName')}
                                    onBlur={() => setFocusedField(null)}
                                    style={inputStyle('fullName')}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Telefon</label>
                                <input
                                    type="tel"
                                    placeholder="05xx xxx xx xx"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    onFocus={() => setFocusedField('phoneNumber')}
                                    onBlur={() => setFocusedField(null)}
                                    style={inputStyle('phoneNumber')}
                                />
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div>
                            <label style={labelStyle}>Firma Adı</label>
                            <input
                                type="text"
                                placeholder="örn. Teknoloji LTD. ŞTİ."
                                required
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                onFocus={() => setFocusedField('companyName')}
                                onBlur={() => setFocusedField(null)}
                                style={inputStyle('companyName')}
                            />
                        </div>
                    )}

                    <div>
                        <label style={labelStyle}>E-posta Adresi</label>
                        <input
                            type="email"
                            placeholder="mail@firma.com"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onFocus={() => setFocusedField('username')}
                            onBlur={() => setFocusedField(null)}
                            style={inputStyle('username')}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Şifre</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            style={inputStyle('password')}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            marginTop: 6,
                            height: 48,
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#ffffff',
                            cursor: isLoading ? 'wait' : 'pointer',
                            background: theme.gradient,
                            boxShadow: theme.shadowBrand,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            fontFamily: 'inherit',
                            opacity: isLoading ? 0.75 : 1,
                            transition: 'transform 0.15s, box-shadow 0.2s, opacity 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (isLoading) return;
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow =
                                '0 16px 36px rgba(109, 40, 217, 0.38)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = theme.shadowBrand;
                        }}
                    >
                        {isLoading ? (
                            'İşleniyor...'
                        ) : isLogin ? (
                            <>
                                <LogIn size={18} /> Giriş Yap
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} /> Hesabı Oluştur
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: 22, textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={handleToggleMode}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: theme.primary,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            padding: '6px 10px',
                            borderRadius: 8,
                            transition: 'color 0.18s, background 0.18s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = theme.primaryHover;
                            e.currentTarget.style.background = theme.primarySoft;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = theme.primary;
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {isLogin
                            ? 'Henüz hesabınız yok mu? Yeni hesap oluşturun'
                            : 'Zaten hesabınız var mı? Giriş ekranına dönün'}
                    </button>
                </div>
            </div>

            {/* Footer mark */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    marginTop: 24,
                    color: theme.textSubtle,
                    fontSize: 12,
                    textAlign: 'center',
                }}
            >
                © 2026 · GİB UBL-TR Designer
            </div>
        </div>
    );
};