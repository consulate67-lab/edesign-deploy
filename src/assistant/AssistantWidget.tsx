import React, { useEffect, useRef, useState } from 'react';
import {
    FileText, HelpCircle, LogIn, MessageCircle, RotateCcw, Send, Sparkles, Tag, ThumbsDown, ThumbsUp, UserPlus, X,
} from 'lucide-react';
import { theme } from '../theme';
import { useLocaleT } from '../i18n';
import { usePriceCurrency } from '../pricing';
import { RobotIcon } from './RobotIcon';
import { assistantApi, type AssistantAction, type AssistantReply, type HistoryItem } from './assistantApi';

const CHAT_KEY = 'edi_chat';
const SESSION_KEY = 'edi_session';
const GREETED_KEY = 'edi_greeted';
const WHATSAPP_URL = 'https://wa.me/905336660125';
const WELCOME_KEY = 'welcome';

interface Message {
    key: string;
    role: 'user' | 'assistant';
    text: string;
    id?: number;
    mode?: AssistantReply['mode'] | 'error';
    actions?: AssistantAction[];
    suggestions?: string[];
    feedback?: 1 | -1;
}

const ACTION_ICONS: Record<AssistantAction, React.ReactNode> = {
    register: <UserPlus size={14} />,
    login: <LogIn size={14} />,
    pricing: <Tag size={14} />,
    docs: <FileText size={14} />,
    faq: <HelpCircle size={14} />,
    product: <Sparkles size={14} />,
    contact: <MessageCircle size={14} />,
};

const SECTION_OF: Partial<Record<AssistantAction, string>> = { pricing: 'fiyatlar', docs: 'belgeler', faq: 'sss', product: 'urun' };

const newKey = () => Math.random().toString(36).slice(2, 10);

const sessionId = () => {
    try {
        let id = localStorage.getItem(SESSION_KEY);
        if (!id) {
            id = `${Date.now().toString(36)}-${newKey()}`;
            localStorage.setItem(SESSION_KEY, id);
        }
        return id;
    } catch {
        return 'anon';
    }
};

/** Karşılama metni ve önerileri her çizimde arayüz dilinden okunur; dil değişince kendiliğinden çevrilir. */
const welcome = (): Message => ({ key: WELCOME_KEY, role: 'assistant', text: '', mode: 'smalltalk' });

const readChat = (): Message[] | null => {
    try {
        const list = JSON.parse(sessionStorage.getItem(CHAT_KEY) || 'null');
        return Array.isArray(list) && list.length ? list : null;
    } catch {
        return null;
    }
};

/** **kalın** ve "- " maddeleri; geri kalan düz metin (HTML yorumlanmaz). */
const inline = (text: string) => text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
        ? <strong key={i} style={{ fontWeight: 700, color: theme.text }}>{part.slice(2, -2)}</strong>
        : <React.Fragment key={i}>{part}</React.Fragment>);

const Formatted: React.FC<{ text: string }> = ({ text }) => {
    const blocks: React.ReactNode[] = [];
    let bullets: string[] = [];
    const flush = () => {
        if (!bullets.length) return;
        blocks.push(
            <ul key={`ul${blocks.length}`} style={{ margin: '4px 0', paddingLeft: 18, display: 'grid', gap: 3 }}>
                {bullets.map((b, i) => <li key={i}>{inline(b)}</li>)}
            </ul>,
        );
        bullets = [];
    };
    for (const raw of text.split('\n')) {
        const line = raw.replace(/^#{1,6}\s+/, '').trimEnd();
        const item = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
        if (item) { bullets.push(item[1]); continue; }
        flush();
        if (line.trim()) blocks.push(<p key={`p${blocks.length}`} style={{ margin: '3px 0' }}>{inline(line)}</p>);
    }
    flush();
    return <>{blocks}</>;
};

const STYLES = `
@keyframes edi-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
@keyframes edi-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
@keyframes edi-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes edi-pop { from { opacity: 0; transform: translateY(12px) scale(0.96); } to { opacity: 1; transform: none; } }
@keyframes edi-dot { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-4px); opacity: 1; } }
.edi-eyes { transform-box: fill-box; transform-origin: center; animation: edi-blink 4.2s infinite; }
.edi-antenna { animation: edi-pulse 1.8s ease-in-out infinite; }
.edi-fab { animation: edi-float 3.2s ease-in-out infinite; transition: box-shadow .2s, transform .2s; }
.edi-fab:hover { animation-play-state: paused; transform: scale(1.06); }
.edi-chip:hover { background: ${theme.primarySoft} !important; border-color: #c4b5fd !important; }
.edi-act:hover { filter: brightness(0.96); }
.edi-thumb:hover { color: ${theme.primary} !important; }
.edi-scroll::-webkit-scrollbar { width: 6px; }
.edi-scroll::-webkit-scrollbar-thumb { background: #d4d8e4; border-radius: 3px; }
@media (prefers-reduced-motion: reduce) { .edi-eyes, .edi-antenna, .edi-fab { animation: none; } }
`;

export interface AssistantWidgetProps {
    page: string;
    onRegister: () => void;
    onLogin: () => void;
    onSection: (id: string) => void;
}

/** Sağ altta "Sarp" yardım asistanı: siteyle ilgili soruları bilgi bankası + (varsa) yapay zekâ ile yanıtlar. */
export const AssistantWidget: React.FC<AssistantWidgetProps> = ({ page, onRegister, onLogin, onSection }) => {
    const { t, locale } = useLocaleT();
    const currency = usePriceCurrency();
    const [open, setOpen] = useState(false);
    const [greeting, setGreeting] = useState(false);
    const [ai, setAi] = useState(false);
    const [serverSuggestions, setServerSuggestions] = useState<{ locale: string; list: string[] } | null>(null);
    const suggestions = serverSuggestions?.locale === locale && serverSuggestions.list.length
        ? serverSuggestions.list
        : t('assistant.suggestions', { returnObjects: true });
    const [messages, setMessages] = useState<Message[]>(() => readChat() ?? [welcome()]);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let alive = true;
        assistantApi.info(locale)
            .then((info) => {
                if (!alive) return;
                setAi(info.ai);
                setServerSuggestions({ locale, list: info.suggestions ?? [] });
            })
            .catch(() => undefined);
        return () => { alive = false; };
    }, [locale]);

    useEffect(() => {
        if (sessionStorage.getItem(GREETED_KEY)) return;
        const timer = window.setTimeout(() => setGreeting(true), 2500);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        try { sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-40))); } catch { /* kota */ }
    }, [messages]);

    useEffect(() => {
        if (!open) return;
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, busy, open]);

    useEffect(() => {
        if (open) window.setTimeout(() => inputRef.current?.focus(), 80);
    }, [open]);

    const dismissGreeting = () => {
        setGreeting(false);
        sessionStorage.setItem(GREETED_KEY, '1');
    };

    const toggle = () => {
        dismissGreeting();
        setOpen((o) => !o);
    };

    const ask = async (raw: string) => {
        const question = raw.trim().slice(0, 500);
        if (!question || busy) return;
        const history: HistoryItem[] = messages
            .filter((m) => m.key !== WELCOME_KEY && m.mode !== 'error')
            .slice(-6)
            .map((m) => ({ role: m.role, text: m.text }));
        setMessages((list) => [...list, { key: newKey(), role: 'user', text: question }]);
        setInput('');
        setBusy(true);
        try {
            const r = await assistantApi.ask({ question, session: sessionId(), history, page, lang: locale, currency });
            setMessages((list) => [...list, {
                key: newKey(), role: 'assistant', text: r.answer, id: r.id, mode: r.mode, actions: r.actions, suggestions: r.suggestions,
            }]);
        } catch (e) {
            setMessages((list) => [...list, {
                key: newKey(), role: 'assistant', mode: 'error', actions: ['contact'],
                text: `${e instanceof Error ? e.message : t('assistant.error')} ${t('assistant.errorHint')}`,
            }]);
        } finally {
            setBusy(false);
        }
    };

    const rate = (msg: Message, helpful: 1 | -1) => {
        if (!msg.id || msg.feedback) return;
        setMessages((list) => list.map((m) => (m.key === msg.key ? { ...m, feedback: helpful } : m)));
        assistantApi.feedback(msg.id, helpful).catch(() => undefined);
    };

    const runAction = (action: AssistantAction) => {
        if (action === 'register') { setOpen(false); onRegister(); return; }
        if (action === 'login') { setOpen(false); onLogin(); return; }
        if (action === 'contact') { window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer'); return; }
        const section = SECTION_OF[action];
        if (section) {
            if (window.innerWidth < 640) setOpen(false);
            onSection(section);
        }
    };

    const reset = () => {
        setMessages([welcome()]);
        setInput('');
    };

    const last = messages[messages.length - 1];

    return (
        <>
            <style>{STYLES}</style>

            {greeting && !open && (
                <div
                    role="status"
                    style={{
                        position: 'fixed', right: 20, bottom: 94, zIndex: 9998, maxWidth: 250, padding: '12px 30px 12px 14px',
                        background: '#fff', color: theme.text, borderRadius: '16px 16px 4px 16px', border: `1px solid ${theme.border}`,
                        boxShadow: theme.shadowLg, fontSize: '0.84rem', lineHeight: 1.45, animation: 'edi-pop .35s ease-out', cursor: 'pointer',
                    }}
                    onClick={toggle}
                >
                    <strong>{t('assistant.greetingTitle')}</strong> {t('assistant.greetingText')}
                    <button
                        type="button"
                        aria-label={t('assistant.close')}
                        onClick={(e) => { e.stopPropagation(); dismissGreeting(); }}
                        style={{ position: 'absolute', top: 6, right: 6, background: 'transparent', border: 'none', color: theme.textSubtle, cursor: 'pointer', padding: 2, display: 'flex' }}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {open && (
                <section
                    aria-label={t('assistant.region')}
                    style={{
                        position: 'fixed', right: 20, bottom: 96, zIndex: 9999, width: 'min(380px, calc(100vw - 24px))',
                        height: 'min(580px, calc(100vh - 120px))', display: 'flex', flexDirection: 'column', background: '#fff',
                        borderRadius: 22, border: `1px solid ${theme.border}`, boxShadow: '0 30px 80px rgba(15, 23, 42, 0.22)',
                        overflow: 'hidden', fontFamily: theme.font, animation: 'edi-pop .25s ease-out',
                    }}
                >
                    <header style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 14px 14px 16px', background: theme.gradient, color: '#fff' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.95)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <RobotIcon size={34} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>{t('assistant.title')}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', opacity: 0.95, marginTop: 2 }}>
                                <span style={{ width: 7, height: 7, borderRadius: 4, background: '#4ade80', boxShadow: '0 0 0 2px rgba(255,255,255,0.35)' }} />
                                <span>{t('assistant.online')}</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 7px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>
                                    <Sparkles size={11} /> {ai ? t('assistant.aiPowered') : t('assistant.smart')}
                                </span>
                            </div>
                        </div>
                        <button type="button" title={t('assistant.reset')} aria-label={t('assistant.reset')} onClick={reset} style={headerBtn}><RotateCcw size={17} /></button>
                        <button type="button" title={t('assistant.close')} aria-label={t('assistant.close')} onClick={() => setOpen(false)} style={headerBtn}><X size={19} /></button>
                    </header>

                    <div ref={scrollRef} className="edi-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 8px', background: theme.bg, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {messages.map((m) => (m.role === 'user' ? (
                            <div key={m.key} style={{ alignSelf: 'flex-end', maxWidth: '82%', padding: '9px 13px', borderRadius: '16px 16px 4px 16px', background: theme.gradient, color: '#fff', fontSize: '0.86rem', lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {m.text}
                            </div>
                        ) : (
                            <div key={m.key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <div style={{ width: 30, height: 30, borderRadius: 10, background: '#fff', border: `1px solid ${theme.border}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                    <RobotIcon size={24} animated={false} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                                    <div style={{ alignSelf: 'flex-start', maxWidth: '100%', padding: '9px 13px', borderRadius: '4px 16px 16px 16px', background: '#fff', border: `1px solid ${m.mode === 'error' ? '#fecaca' : theme.border}`, color: theme.textMuted, fontSize: '0.86rem', lineHeight: 1.5, wordBreak: 'break-word', boxShadow: theme.shadowSm }}>
                                        <Formatted text={m.key === WELCOME_KEY ? t('assistant.welcome') : m.text} />
                                    </div>
                                    {!!m.actions?.length && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {m.actions.map((a) => (
                                                <button key={a} type="button" className="edi-act" onClick={() => runAction(a)} style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                                                    fontSize: '0.77rem', fontWeight: 700, border: 'none',
                                                    ...(a === 'contact' ? { background: '#dcfce7', color: '#15803d' } : a === 'register' ? { background: theme.gradient, color: '#fff' } : { background: theme.primarySoft, color: theme.primary }),
                                                }}>
                                                    {ACTION_ICONS[a]}{t(`assistant.actions.${a}`)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {m.id && m.mode !== 'smalltalk' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: theme.textSubtle }}>
                                            {m.feedback ? (
                                                <span>{m.feedback === 1 ? t('assistant.thanksUp') : t('assistant.thanksDown')}</span>
                                            ) : (
                                                <>
                                                    <span>{t('assistant.helpful')}</span>
                                                    <button type="button" className="edi-thumb" aria-label={t('assistant.yes')} onClick={() => rate(m, 1)} style={thumbBtn}><ThumbsUp size={13} /></button>
                                                    <button type="button" className="edi-thumb" aria-label={t('assistant.no')} onClick={() => rate(m, -1)} style={thumbBtn}><ThumbsDown size={13} /></button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {m === last && !busy && !!(m.key === WELCOME_KEY ? suggestions : m.suggestions)?.length && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {(m.key === WELCOME_KEY ? suggestions : m.suggestions ?? []).map((s) => (
                                                <button key={s} type="button" className="edi-chip" onClick={() => void ask(s)} style={{
                                                    padding: '6px 11px', borderRadius: 999, border: `1px solid ${theme.border}`, background: '#fff', color: theme.text,
                                                    fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                                }}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )))}
                        {busy && (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <div style={{ width: 30, height: 30, borderRadius: 10, background: '#fff', border: `1px solid ${theme.border}`, display: 'grid', placeItems: 'center' }}>
                                    <RobotIcon size={24} />
                                </div>
                                <div aria-label={t('assistant.typing')} style={{ display: 'flex', gap: 4, padding: '12px 14px', background: '#fff', borderRadius: '4px 16px 16px 16px', border: `1px solid ${theme.border}` }}>
                                    {[0, 1, 2].map((i) => (
                                        <span key={i} style={{ width: 7, height: 7, borderRadius: 4, background: theme.primary, animation: `edi-dot 1.1s ${i * 0.15}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={(e) => { e.preventDefault(); void ask(input); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderTop: `1px solid ${theme.border}`, background: '#fff' }}
                    >
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            maxLength={500}
                            placeholder={t('assistant.placeholder')}
                            aria-label={t('assistant.inputLabel')}
                            style={{
                                flex: 1, minWidth: 0, padding: '11px 14px', borderRadius: 999, border: `1px solid ${theme.borderStrong}`, outline: 'none',
                                fontSize: '0.86rem', fontFamily: 'inherit', color: theme.text, background: theme.surfaceAlt,
                            }}
                        />
                        <button
                            type="submit"
                            aria-label={t('assistant.send')}
                            disabled={busy || !input.trim()}
                            style={{
                                width: 42, height: 42, borderRadius: 21, border: 'none', display: 'grid', placeItems: 'center', flexShrink: 0,
                                background: theme.gradient, color: '#fff', cursor: busy || !input.trim() ? 'default' : 'pointer',
                                opacity: busy || !input.trim() ? 0.5 : 1, boxShadow: theme.shadowBrand,
                            }}
                        >
                            <Send size={17} />
                        </button>
                    </form>
                    <div style={{ padding: '0 12px 9px', background: '#fff', fontSize: '0.68rem', color: theme.textSubtle, textAlign: 'center' }}>
                        {t('assistant.disclaimer')}
                    </div>
                </section>
            )}

            <button
                type="button"
                className={open ? undefined : 'edi-fab'}
                onClick={toggle}
                aria-label={open ? t('assistant.closeAssistant') : t('assistant.open')}
                title={open ? t('assistant.close') : t('assistant.open')}
                style={{
                    position: 'fixed', right: 20, bottom: 20, zIndex: 9999, width: 64, height: 64, borderRadius: 32, padding: 0, cursor: 'pointer',
                    display: 'grid', placeItems: 'center', border: '3px solid transparent',
                    background: open ? `${theme.gradient} border-box` : `linear-gradient(#fff, #fff) padding-box, ${theme.gradient} border-box`,
                    boxShadow: '0 12px 30px rgba(109, 40, 217, 0.35)',
                }}
            >
                {open ? <X size={26} color="#fff" /> : <RobotIcon size={46} />}
                {!open && (
                    <span style={{ position: 'absolute', top: 2, right: 2, width: 13, height: 13, borderRadius: 7, background: '#22c55e', border: '2px solid #fff' }} />
                )}
            </button>
        </>
    );
};

const headerBtn: React.CSSProperties = {
    background: 'rgba(255,255,255,0.16)', border: 'none', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center',
    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
};

const thumbBtn: React.CSSProperties = {
    background: 'transparent', border: 'none', color: theme.textSubtle, cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 6,
};
