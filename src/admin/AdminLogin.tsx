import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, KeyRound, Lock, Mail, MessageSquare, RefreshCw, Send, ShieldCheck, Terminal } from 'lucide-react';
import { adminApi } from './adminApi';
import type { AdminIdentity, AdminLoginResponse } from './contracts';
import { C, GRADIENT, btn, errorText, inputStyle, labelStyle } from './format';
import { ErrorBox, Spinner } from './ui';

const CODE_LEN = 6;

const channelInfo = (r: AdminLoginResponse): { icon: React.ReactNode; text: string } => {
    switch (r.channel) {
        case 'sms': return { icon: <MessageSquare size={16} />, text: `Kod SMS ile gönderildi: ${r.destination ?? 'kayıtlı telefonunuz'}` };
        case 'telegram': return { icon: <Send size={16} />, text: `Kod Telegram ile gönderildi${r.destination && r.destination !== 'Telegram' ? `: ${r.destination}` : ' (yönetici sohbeti)'}` };
        case 'log': return { icon: <Terminal size={16} />, text: 'SMS / Telegram yapılandırılmadığı için kod yalnızca sunucu günlüğüne yazıldı.' };
        default: return { icon: <Terminal size={16} />, text: 'Geliştirme modu: kod aşağıda gösteriliyor.' };
    }
};

const CodeInput: React.FC<{ value: string[]; onChange: (v: string[]) => void; onComplete: (code: string) => void; disabled?: boolean }> = ({ value, onChange, onComplete, disabled }) => {
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => { refs.current[0]?.focus(); }, []);

    const setAt = (i: number, digits: string) => {
        const next = [...value];
        let j = i;
        for (const d of digits) {
            if (j >= CODE_LEN) break;
            next[j++] = d;
        }
        onChange(next);
        refs.current[Math.min(j, CODE_LEN - 1)]?.focus();
        if (next.every(Boolean)) onComplete(next.join(''));
    };

    return (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} data-admin-otp>
            {Array.from({ length: CODE_LEN }, (_, i) => (
                <input
                    key={i}
                    ref={el => { refs.current[i] = el; }}
                    value={value[i] ?? ''}
                    disabled={disabled}
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Doğrulama kodu ${i + 1}. hane`}
                    maxLength={CODE_LEN}
                    onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '');
                        if (!digits) {
                            const next = [...value];
                            next[i] = '';
                            onChange(next);
                            return;
                        }
                        setAt(i, digits.length > 1 && value[i] ? digits.replace(value[i], '') || digits : digits);
                    }}
                    onPaste={e => {
                        const digits = e.clipboardData.getData('text').replace(/\D/g, '');
                        if (!digits) return;
                        e.preventDefault();
                        setAt(digits.length >= CODE_LEN ? 0 : i, digits);
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Backspace' && !value[i] && i > 0) {
                            const next = [...value];
                            next[i - 1] = '';
                            onChange(next);
                            refs.current[i - 1]?.focus();
                            e.preventDefault();
                        } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
                        else if (e.key === 'ArrowRight' && i < CODE_LEN - 1) refs.current[i + 1]?.focus();
                    }}
                    onFocus={e => e.target.select()}
                    style={{
                        width: 46, height: 56, textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, borderRadius: 12,
                        border: `1.5px solid ${value[i] ? 'rgba(129, 140, 248, 0.8)' : C.borderStrong}`, outline: 'none',
                        background: 'rgba(15, 23, 42, 0.85)', color: C.text, fontFamily: 'inherit', boxSizing: 'border-box',
                        caretColor: '#818cf8', transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                />
            ))}
        </div>
    );
};

export const AdminLogin: React.FC<{ onSuccess: (token: string, user: AdminIdentity) => void }> = ({ onSuccess }) => {
    const [step, setStep] = useState<'creds' | 'code'>('creds');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [challenge, setChallenge] = useState<AdminLoginResponse | null>(null);
    const [code, setCode] = useState<string[]>(Array(CODE_LEN).fill(''));
    const [deadline, setDeadline] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!deadline) return;
        const tick = () => setRemaining(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
        const id = setInterval(tick, 1000);
        tick();
        return () => clearInterval(id);
    }, [deadline]);

    const sendCredentials = async () => {
        if (!username.trim() || !password) {
            setError('E-posta ve şifrenizi girin.');
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const r = await adminApi.login(username.trim(), password);
            setChallenge(r);
            setCode(Array(CODE_LEN).fill(''));
            setDeadline(Date.now() + r.expiresIn * 1000);
            setStep('code');
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    const verify = async (value = code.join('')) => {
        if (!challenge) return;
        if (value.length !== CODE_LEN) {
            setError('6 haneli doğrulama kodunu girin.');
            return;
        }
        if (remaining <= 0) {
            setError('Kodun süresi doldu. "Kodu tekrar gönder" ile yeni kod isteyin.');
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const r = await adminApi.verify(challenge.challengeId, value);
            onSuccess(r.token, r.user);
        } catch (e) {
            setError(errorText(e));
            setCode(Array(CODE_LEN).fill(''));
        } finally {
            setBusy(false);
        }
    };

    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    const info = challenge ? channelInfo(challenge) : null;

    return (
        <div className="adm-root" style={{
            minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box',
            background: `radial-gradient(1200px 600px at 20% -10%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(900px 500px at 110% 110%, rgba(139,92,246,0.14), transparent 60%), ${C.bg}`,
            fontFamily: 'Inter, sans-serif', color: C.text,
        }}>
            <div data-admin-login style={{
                width: 'min(420px, 100%)', background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${C.borderStrong}`, borderRadius: 22,
                padding: '34px 30px 28px', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', boxSizing: 'border-box',
                animation: 'modalEnter 0.25s ease-out',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 24, textAlign: 'center' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16, background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 12px 30px rgba(99,102,241,0.4)',
                    }}>
                        {step === 'creds' ? <ShieldCheck size={28} color="white" /> : <KeyRound size={28} color="white" />}
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                        {step === 'creds' ? 'Yönetim Paneli' : 'Doğrulama kodu'}
                    </h1>
                    <p style={{ margin: 0, color: C.muted, fontSize: '0.86rem', lineHeight: 1.5 }}>
                        {step === 'creds' ? 'e-Tasarım yönetici girişi. Şifrenizden sonra tek kullanımlık kod istenir.' : 'Size gönderilen 6 haneli kodu girin.'}
                    </p>
                </div>

                {step === 'creds' ? (
                    <form onSubmit={e => { e.preventDefault(); void sendCredentials(); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={labelStyle} htmlFor="adm-user">E-posta</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} color={C.dim} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                <input id="adm-user" data-admin-username type="text" autoComplete="username" value={username}
                                    onChange={e => setUsername(e.target.value)} placeholder="yonetici@firma.com"
                                    style={{ ...inputStyle, paddingLeft: 36, height: 44 }} autoFocus />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle} htmlFor="adm-pass">Şifre</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} color={C.dim} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                <input id="adm-pass" data-admin-password type="password" autoComplete="current-password" value={password}
                                    onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                    style={{ ...inputStyle, paddingLeft: 36, height: 44 }} />
                            </div>
                        </div>
                        {error && <ErrorBox>{error}</ErrorBox>}
                        <button type="submit" data-admin-login-submit disabled={busy} style={{ ...btn('primary'), height: 46, fontSize: '0.92rem', marginTop: 4, opacity: busy ? 0.75 : 1 }}>
                            {busy ? <Spinner color="white" /> : <ShieldCheck size={17} />} Devam et
                        </button>
                    </form>
                ) : (
                    <form onSubmit={e => { e.preventDefault(); void verify(); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {info && (
                            <div data-admin-otp-destination style={{
                                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 12,
                                background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', color: '#c7d2fe', fontSize: '0.82rem', lineHeight: 1.45,
                            }}>
                                <span style={{ marginTop: 1, flexShrink: 0 }}>{info.icon}</span>
                                <span>{info.text}</span>
                            </div>
                        )}
                        <CodeInput value={code} onChange={setCode} onComplete={c => void verify(c)} disabled={busy} />
                        {challenge?.devCode && (
                            <div data-admin-dev-code style={{ textAlign: 'center', fontSize: '0.78rem', color: '#fcd34d', background: 'rgba(245, 158, 11, 0.1)', border: '1px dashed rgba(245, 158, 11, 0.4)', borderRadius: 10, padding: '8px 10px' }}>
                                Geliştirme ipucu: kod <b style={{ letterSpacing: 2, fontSize: '0.9rem' }}>{challenge.devCode}</b>
                                <button type="button" onClick={() => { const d = challenge.devCode!.split('').slice(0, CODE_LEN); setCode(d); void verify(d.join('')); }}
                                    style={{ ...btn('ghost', true), marginLeft: 8, color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                                    Doldur
                                </button>
                            </div>
                        )}
                        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: remaining > 0 ? C.muted : '#fca5a5' }}>
                            {remaining > 0 ? <>Kodun geçerlilik süresi: <b style={{ color: C.text, fontVariantNumeric: 'tabular-nums' }}>{mm}:{ss}</b></> : 'Kodun süresi doldu.'}
                        </div>
                        {error && <ErrorBox>{error}</ErrorBox>}
                        <button type="submit" data-admin-verify disabled={busy || code.some(d => !d)} style={{ ...btn('primary'), height: 46, fontSize: '0.92rem', opacity: busy || code.some(d => !d) ? 0.6 : 1 }}>
                            {busy ? <Spinner color="white" /> : <KeyRound size={17} />} Doğrula ve giriş yap
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <button type="button" onClick={() => { setStep('creds'); setError(null); setDeadline(0); }} style={btn('ghost', true)}>
                                <ArrowLeft size={14} /> Geri
                            </button>
                            <button type="button" data-admin-resend disabled={busy} onClick={() => void sendCredentials()} style={btn('ghost', true)}>
                                <RefreshCw size={14} /> Kodu tekrar gönder
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
