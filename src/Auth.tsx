import React, { useEffect, useState } from 'react';
import { LogIn, UserPlus, ShieldCheck, ArrowLeft } from 'lucide-react';
import { api } from './api';

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
        background: 'rgba(15, 23, 42, 0.55)',
        border: `1px solid ${focusedField === field ? '#6366f1' : 'rgba(148, 163, 184, 0.18)'}`,
        borderRadius: 12,
        padding: '12px 14px',
        color: '#f8fafc',
        fontSize: 14,
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
        boxShadow:
            focusedField === field
                ? '0 0 0 3px rgba(99, 102, 241, 0.18), inset 0 0 0 1px rgba(99,102,241,0.4)'
                : 'none',
    });

    const labelStyle: React.CSSProperties = {
        color: '#94a3b8',
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
                background:
                    'linear-gradient(180deg, #020617 0%, #0a0f1f 55%, #1e1b4b 100%)',
                fontFamily: 'Inter, sans-serif',
                padding: '32px 24px',
                overflow: 'hidden',
            }}
        >
            {/* Ambient glow blobs (Landing ile aynı dil) */}
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    top: '-120px',
                    left: '-120px',
                    width: 480,
                    height: 480,
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    pointerEvents: 'none',
                }}
            />
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    top: '40%',
                    right: '-160px',
                    width: 520,
                    height: 520,
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(14,165,233,0.28) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    pointerEvents: 'none',
                }}
            />
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    bottom: '-180px',
                    left: '30%',
                    width: 560,
                    height: 560,
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(139,92,246,0.30) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    pointerEvents: 'none',
                }}
            />

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
                        background: 'rgba(15, 23, 42, 0.55)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        borderRadius: 999,
                        color: '#cbd5e1',
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
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.18)';
                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                        e.currentTarget.style.color = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.55)';
                        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.18)';
                        e.currentTarget.style.color = '#cbd5e1';
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
                    background: 'rgba(15, 23, 42, 0.55)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(148, 163, 184, 0.14)',
                    borderRadius: 24,
                    padding: '40px 36px',
                    boxShadow:
                        '0 24px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.02) inset',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                    transition: 'opacity 0.35s ease, transform 0.35s ease, max-width 0.3s ease',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            margin: '0 auto 16px',
                            background:
                                'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                            borderRadius: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 24px rgba(99, 102, 241, 0.35)',
                        }}
                    >
                        <ShieldCheck size={26} color="#ffffff" strokeWidth={2.4} />
                    </div>
                    <h1
                        style={{
                            color: '#f8fafc',
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
                            color: '#94a3b8',
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
                            color: '#fecaca',
                            background: 'rgba(127, 29, 29, 0.35)',
                            border: '1px solid rgba(248, 113, 113, 0.25)',
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
                            color: '#bbf7d0',
                            background: 'rgba(20, 83, 45, 0.35)',
                            border: '1px solid rgba(74, 222, 128, 0.25)',
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
                            background:
                                'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                            boxShadow: '0 12px 28px rgba(99, 102, 241, 0.35)',
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
                                '0 16px 36px rgba(99, 102, 241, 0.45)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow =
                                '0 12px 28px rgba(99, 102, 241, 0.35)';
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
                            color: '#a5b4fc',
                            fontSize: 13,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            padding: '6px 10px',
                            borderRadius: 8,
                            transition: 'color 0.18s, background 0.18s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#f8fafc';
                            e.currentTarget.style.background =
                                'rgba(99, 102, 241, 0.10)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#a5b4fc';
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
                    color: '#64748b',
                    fontSize: 12,
                    textAlign: 'center',
                }}
            >
                © 2026 · GİB UBL-TR Designer
            </div>
        </div>
    );
};