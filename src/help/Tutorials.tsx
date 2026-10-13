import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PlayCircle, Play, X } from 'lucide-react';
import { useLocaleT } from '../i18n';
import { theme } from '../theme';
import type tutorialsTr from '../i18n/locales/tutorials/tr';

type TutorialId = keyof typeof tutorialsTr.items;

interface Tutorial { id: TutorialId; slug: string; duration: Record<'tr' | 'en' | 'ru' | 'hi' | 'zh', string>; group: 'start' | 'editor' }

const TUTORIALS: Tutorial[] = [
    { id: 'signup', slug: '01-uyelik', duration: { tr: '1:26', en: '1:25', ru: '2:00', hi: '1:59', zh: '1:47' }, group: 'start' },
    { id: 'template', slug: '02-hazir-sablon', duration: { tr: '2:10', en: '1:29', ru: '1:49', hi: '1:58', zh: '1:41' }, group: 'start' },
    { id: 'scratch', slug: '03-sifirdan-tasarim', duration: { tr: '1:40', en: '1:27', ru: '1:43', hi: '1:50', zh: '1:26' }, group: 'start' },
    { id: 'textImage', slug: '04-metin-resim-kutu', duration: { tr: '1:25', en: '1:09', ru: '1:27', hi: '1:31', zh: '1:34' }, group: 'editor' },
    { id: 'tableFormula', slug: '05-tablo-formul', duration: { tr: '1:18', en: '1:04', ru: '1:06', hi: '1:16', zh: '1:26' }, group: 'editor' },
    { id: 'qrChart', slug: '06-karekod-grafik-pay', duration: { tr: '0:57', en: '0:52', ru: '0:55', hi: '0:56', zh: '0:54' }, group: 'editor' },
    { id: 'columnBackground', slug: '07-kolon-arka-plan', duration: { tr: '0:53', en: '0:53', ru: '0:49', hi: '0:55', zh: '0:49' }, group: 'editor' },
    { id: 'documentFields', slug: '08-belge-alanlari', duration: { tr: '0:42', en: '0:40', ru: '0:45', hi: '0:49', zh: '0:41' }, group: 'editor' },
    { id: 'editFields', slug: '09-alan-duzenleme', duration: { tr: '1:28', en: '1:12', ru: '1:09', hi: '1:07', zh: '1:22' }, group: 'editor' },
    { id: 'saveApprove', slug: '10-kaydet-onayla', duration: { tr: '0:58', en: '0:53', ru: '0:57', hi: '1:06', zh: '0:54' }, group: 'editor' },
];

type VideoLang = keyof Tutorial['duration'];
const VIDEO_LANGS: readonly string[] = ['tr', 'en', 'ru', 'hi', 'zh'];
/** Kendi videosu olmayan arayüz dillerinde İngilizce videolar gösterilir. */
const videoLang = (locale: string): VideoLang => (VIDEO_LANGS.includes(locale) ? locale as VideoLang : 'en');
const videoBase = (lang: VideoLang) => `${import.meta.env.BASE_URL}videos/egitim/${lang === 'tr' ? '' : `${lang}/`}`;
const videoUrl = (v: Tutorial, lang: VideoLang) => `${videoBase(lang)}${v.slug}.mp4`;
const posterUrl = (v: Tutorial, lang: VideoLang) => `${videoBase(lang)}${v.slug}.jpg`;

const TUTORIALS_CSS = `
.tut-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.tut-card{transition:transform .2s, box-shadow .2s, border-color .2s}
.tut-card:hover{transform:translateY(-3px);box-shadow:${theme.shadow};border-color:${theme.primary}}
.tut-card:hover .tut-play{transform:translate(-50%,-50%) scale(1.08)}
.tut-player{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:0}
.tut-item:hover{background:${theme.surfaceAlt}}
@media (max-width: 900px){.tut-player{grid-template-columns:1fr}.tut-list{max-height:240px !important;border-left:none !important;border-top:1px solid ${theme.border}}}
`;

const TutorialCard: React.FC<{ v: Tutorial; n: number; onOpen: (v: Tutorial) => void }> = ({ v, n, onOpen }) => {
    const { t, locale } = useLocaleT();
    const lang = videoLang(locale);
    return (
        <button
            type="button"
            className="tut-card"
            data-tutorial={v.slug}
            onClick={() => onOpen(v)}
            style={{
                padding: 0,
                background: '#fff',
                border: `1px solid ${theme.border}`,
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                color: theme.text,
                boxShadow: theme.shadowSm,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#0f172a' }}>
                <img src={posterUrl(v, lang)} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <span
                    className="tut-play"
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%,-50%)',
                        transition: 'transform .2s',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'rgba(109, 40, 217, 0.92)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(15,23,42,0.3)',
                    }}
                >
                    <Play size={20} fill="#fff" />
                </span>
                <span style={{ position: 'absolute', left: 8, top: 8, minWidth: 24, height: 24, padding: '0 6px', borderRadius: 7, background: theme.gradient, color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(15,23,42,0.25)' }}>
                    {n}
                </span>
                <span style={{ position: 'absolute', right: 8, bottom: 8, padding: '2px 7px', borderRadius: 6, background: 'rgba(15,23,42,0.78)', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                    {v.duration[lang]}
                </span>
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t(`tutorials.items.${v.id}.title`)}</div>
                <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.45 }}>{t(`tutorials.items.${v.id}.desc`)}</div>
            </div>
        </button>
    );
};

/** Eğitim videoları kartları; karta tıklayınca oynatıcı açılır. */
export const TutorialGrid: React.FC = () => {
    const { t } = useLocaleT();
    const [open, setOpen] = useState<Tutorial | null>(null);
    const close = useCallback(() => setOpen(null), []);
    const note = t('tutorials.videoLangNote');
    return (
        <>
            <style>{TUTORIALS_CSS}</style>
            {note && (
                <p style={{ textAlign: 'center', fontSize: 13, color: theme.textSubtle, margin: '-8px 0 18px' }}>{note}</p>
            )}
            <div className="tut-grid">
                {TUTORIALS.map((v, i) => <TutorialCard key={v.slug} v={v} n={i + 1} onOpen={setOpen} />)}
            </div>
            {open && <TutorialPlayer initial={open} autoPlay onClose={close} />}
        </>
    );
};

/** Video oynatıcı + yandaki liste. */
export const TutorialPlayer: React.FC<{ initial: Tutorial; autoPlay?: boolean; onClose: () => void }> = ({ initial, autoPlay = false, onClose }) => {
    const { t, locale } = useLocaleT();
    const lang = videoLang(locale);
    const note = t('tutorials.videoLangNote');
    const [current, setCurrent] = useState(initial);
    const [play, setPlay] = useState(autoPlay);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    const pick = (v: Tutorial) => { setCurrent(v); setPlay(true); };
    const groups: { key: Tutorial['group']; label: string }[] = [
        { key: 'start', label: t('tutorials.groupStart') },
        { key: 'editor', label: t('tutorials.groupEditor') },
    ];

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={t('tutorials.playerTitle')}
            data-tutorial-player
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 20000,
                background: 'rgba(15, 23, 42, 0.72)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                fontFamily: 'inherit',
            }}
        >
            <style>{TUTORIALS_CSS}</style>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 'min(1240px, 100%)',
                    maxHeight: '100%',
                    overflow: 'auto',
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 30px 80px rgba(15, 23, 42, 0.45)',
                    color: theme.text,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <PlayCircle size={18} color={theme.primary} />
                    <div style={{ fontSize: 15, fontWeight: 700, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t(`tutorials.items.${current.id}.title`)}
                    </div>
                    {note && <span style={{ fontSize: 12, color: theme.textSubtle }}>{note}</span>}
                    <button
                        type="button"
                        onClick={onClose}
                        title={t('tutorials.close')}
                        aria-label={t('tutorials.close')}
                        style={{ display: 'flex', padding: 6, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', color: theme.textMuted }}
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="tut-player">
                    <div style={{ background: '#0f172a', display: 'flex', alignItems: 'center' }}>
                        <video
                            key={`${lang}-${current.slug}`}
                            src={videoUrl(current, lang)}
                            poster={posterUrl(current, lang)}
                            controls
                            autoPlay={play}
                            playsInline
                            preload="metadata"
                            style={{ width: '100%', aspectRatio: '16 / 9', display: 'block', background: '#0f172a' }}
                        />
                    </div>
                    <div className="tut-list" style={{ borderLeft: `1px solid ${theme.border}`, maxHeight: 'min(70vh, 560px)', overflowY: 'auto', padding: '8px 0' }}>
                        {groups.map((g) => (
                            <div key={g.key}>
                                <div style={{ padding: '8px 14px 4px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: theme.textSubtle }}>{g.label}</div>
                                {TUTORIALS.filter((v) => v.group === g.key).map((v) => {
                                    const active = v.slug === current.slug;
                                    return (
                                        <button
                                            key={v.slug}
                                            type="button"
                                            className="tut-item"
                                            data-tutorial-item={v.slug}
                                            onClick={() => pick(v)}
                                            style={{
                                                display: 'flex',
                                                gap: 10,
                                                width: '100%',
                                                padding: '8px 14px',
                                                border: 'none',
                                                borderLeft: `3px solid ${active ? theme.primary : 'transparent'}`,
                                                background: active ? theme.primarySoft : 'transparent',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontFamily: 'inherit',
                                                color: theme.text,
                                                alignItems: 'center',
                                            }}
                                        >
                                            <img src={posterUrl(v, lang)} alt="" loading="lazy" style={{ width: 84, aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 6, flexShrink: 0, background: '#0f172a' }} />
                                            <span style={{ minWidth: 0 }}>
                                                <span style={{ display: 'block', fontSize: 13, fontWeight: active ? 700 : 600, lineHeight: 1.3 }}>{t(`tutorials.items.${v.id}.title`)}</span>
                                                <span style={{ display: 'block', fontSize: 11, color: theme.textSubtle, marginTop: 2 }}>{v.duration[lang]}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ padding: '10px 16px 14px', fontSize: 13, color: theme.textMuted }}>{t(`tutorials.items.${current.id}.desc`)}</div>
            </div>
        </div>,
        document.body,
    );
};

/** Tasarım ekranı üst çubuğundaki yardım düğmesi. */
export const TutorialHelpButton: React.FC<{ start?: TutorialId }> = ({ start = 'textImage' }) => {
    const { t } = useLocaleT();
    const [open, setOpen] = useState(false);
    const close = useCallback(() => setOpen(false), []);
    const initial = TUTORIALS.find((v) => v.id === start) ?? TUTORIALS[0];
    return (
        <>
            <button
                type="button"
                data-tutorial-help
                onClick={() => setOpen(true)}
                title={t('tutorials.helpHint')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    background: 'rgba(109, 40, 217, 0.08)',
                    border: '1px solid rgba(109, 40, 217, 0.3)',
                    borderRadius: 6,
                    color: theme.primary,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                }}
            >
                <PlayCircle size={14} />
                {t('tutorials.help')}
            </button>
            {open && <TutorialPlayer initial={initial} onClose={close} />}
        </>
    );
};
