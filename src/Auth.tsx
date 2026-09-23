import React, { useState } from 'react';
import { LogIn, UserPlus, ShieldCheck, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'register';

interface AuthProps {
    mode?: AuthMode;
    onLogin: () => void;
    onRegister?: () => void;
    onSwitchMode?: (mode: AuthMode) => void;
    onBackToLanding?: () => void;
}

import { api } from './api';

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

    // New registration fields
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                    phone_number: phoneNumber
                });

                // Auto-login after successful register — better UX than
                // forcing a second login click.
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

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            fontFamily: 'Inter, sans-serif',
            padding: '2rem'
        }}>
            {onBackToLanding && (
                <button
                    type="button"
                    onClick={onBackToLanding}
                    style={{
                        position: 'absolute',
                        top: 24,
                        left: 24,
                        padding: '8px 16px',
                        background: 'transparent',
                        border: '1px solid #334155',
                        borderRadius: 6,
                        color: '#94a3b8',
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                >
                    <ArrowLeft size={14} /> Ana sayfa
                </button>
            )}
            <div style={{
                width: '100%',
                maxWidth: isLogin ? '400px' : '500px',
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '2.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#6366f1',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                    }}>
                        <ShieldCheck size={32} color="white" />
                    </div>
                    <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluştur'}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        {isLogin ? 'UBL-TR Designer hesabınıza giriş yapın' : 'Tasarımcıyı kullanmak için iş bilgilerinizi tamamlayın'}
                    </p>
                </div>

                {error && <div style={{ color: '#fca5a5', background: 'rgba(127, 29, 29, 0.4)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(248, 113, 113, 0.2)' }}>{error}</div>}

                {successMessage && <div style={{ color: '#86efac', background: 'rgba(20, 83, 45, 0.4)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(74, 222, 128, 0.2)' }}>{successMessage}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {!isLogin && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.4rem', display: 'block' }}>AD SOYAD</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="örn. Ahmet Yılmaz"
                                    required
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.5)', padding: '10px' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.4rem', display: 'block' }}>TELEFON</label>
                                <input
                                    type="tel"
                                    className="input-field"
                                    placeholder="05xx ..."
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.5)', padding: '10px' }}
                                />
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="form-group">
                            <label style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.4rem', display: 'block' }}>FİRMA ADI</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="örn. Teknoloji LTD. ŞTİ."
                                required
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                style={{ width: '100%', background: 'rgba(15, 23, 42, 0.5)', padding: '10px' }}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.4rem', display: 'block' }}>E-POSTA ADRESİ</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="mail@firma.com"
                            required
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{ width: '100%', background: 'rgba(15, 23, 42, 0.5)', padding: '10px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.4rem', display: 'block' }}>ŞİFRE</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', background: 'rgba(15, 23, 42, 0.5)', padding: '10px' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                        style={{ marginTop: '1rem', height: '48px', fontSize: '1rem', opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? 'İşleniyor...' : (
                            isLogin ? <><LogIn size={18} style={{ marginRight: '8px' }} /> Giriş Yap</> : <><UserPlus size={18} style={{ marginRight: '8px' }} /> Hesabı Oluştur</>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={handleToggleMode}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#818cf8',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = '#6366f1')}
                        onMouseOut={(e) => (e.currentTarget.style.color = '#818cf8')}
                    >
                        {isLogin ? 'Henüz hesabınız yok mu? Yeni hesap oluşturun' : 'Zaten hesabınız var mı? Giriş ekranına dönün'}
                    </button>
                </div>
            </div>
        </div>
    );
};
