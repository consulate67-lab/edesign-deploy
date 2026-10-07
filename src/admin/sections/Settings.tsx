import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, MessageSquare, RefreshCw, Send, Settings as SettingsIcon, ShieldCheck, XCircle } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { adminApi } from '../adminApi';
import type { AdminSettingsStatus } from '../contracts';
import { C, btn, errorText } from '../format';
import { Card, ErrorBox, SectionHeader, Spinner } from '../ui';

const Check: React.FC<{ ok: boolean; children: React.ReactNode }> = ({ ok, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: ok ? '#d1fae5' : '#fecaca' }}>
        {ok ? <CheckCircle2 size={16} color={C.green} /> : <XCircle size={16} color={C.red} />} {children}
    </div>
);

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <code style={{ padding: '1px 6px', borderRadius: 6, background: 'rgba(99,102,241,0.15)', color: '#c7d2fe', fontSize: '0.8rem', fontFamily: 'Consolas, "Cascadia Code", monospace' }}>{children}</code>
);

const Steps: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
    <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, counterReset: 'step' }}>
        {items.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, fontSize: '0.84rem', lineHeight: 1.55, color: '#cbd5e1' }}>
                <span style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontWeight: 800, fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{i + 1}</span>
                <div>{item}</div>
            </li>
        ))}
    </ol>
);

const OTP_CHANNEL: Record<AdminSettingsStatus['otpChannel'], string> = {
    sms: 'SMS', telegram: 'Telegram', log: 'Sunucu günlüğü (SMS / Telegram yapılandırılmamış)', dev: 'Geliştirme modu (kod yanıtta döner)',
};

export const Settings: React.FC<{ onStatus?: (s: AdminSettingsStatus) => void }> = ({ onStatus }) => {
    const pushToast = useUiStore(s => s.pushToast);
    const [status, setStatus] = useState<AdminSettingsStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);
    const [loading, setLoading] = useState(false);

    const apply = useCallback((s: AdminSettingsStatus) => {
        setStatus(s);
        setError(null);
        onStatus?.(s);
    }, [onStatus]);

    const load = async () => {
        setLoading(true);
        try { apply(await adminApi.settingsStatus()); } catch (e) { setError(errorText(e)); } finally { setLoading(false); }
    };

    useEffect(() => {
        let alive = true;
        adminApi.settingsStatus().then(s => { if (alive) apply(s); }).catch(e => { if (alive) setError(errorText(e)); });
        return () => { alive = false; };
    }, [apply]);

    const testTelegram = async () => {
        setTesting(true);
        try {
            await adminApi.telegramTest();
            pushToast({ kind: 'success', title: 'Test mesajı gönderildi', description: 'Telegram yönetici sohbetinizi kontrol edin.', ttl: 5000 });
        } catch (e) {
            pushToast({ kind: 'error', title: 'Test mesajı gönderilemedi', description: errorText(e), ttl: 8000 });
        } finally {
            setTesting(false);
        }
    };

    const tg = status?.telegram;
    return (
        <div data-admin-section="settings">
            <SectionHeader icon={<SettingsIcon size={20} />} title="Ayarlar" subtitle="Giriş doğrulama kodu ve destek bildirimleri için Telegram / SMS yapılandırması."
                actions={<button type="button" onClick={() => void load()} style={btn('ghost', true)}>{loading ? <Spinner size={14} /> : <RefreshCw size={14} />} Yenile</button>} />
            {error && <div style={{ marginBottom: 14 }}><ErrorBox>{error}</ErrorBox></div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 16 }}>
                <Card title={<><Send size={16} color="#38bdf8" /> Telegram</>}
                    actions={<button type="button" data-admin-telegram-test disabled={testing || !tg?.configured || !tg?.chatConfigured} onClick={() => void testTelegram()}
                        style={{ ...btn('primary', true), opacity: testing || !tg?.configured || !tg?.chatConfigured ? 0.55 : 1 }}>
                        {testing ? <Spinner size={13} color="white" /> : <Send size={13} />} Test mesajı gönder
                    </button>}>
                    {!status ? <div style={{ color: C.muted, display: 'flex', gap: 8 }}><Spinner /> Yükleniyor…</div> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Check ok={!!tg?.configured}>Bot token {tg?.configured ? 'tanımlı' : 'tanımlı değil'}{tg?.botUsername ? ` (@${tg.botUsername})` : ''}</Check>
                            <Check ok={!!tg?.chatConfigured}>Yönetici sohbet kimliği {tg?.chatConfigured ? 'tanımlı' : 'tanımlı değil'}</Check>
                            <Check ok={!!tg?.polling}>Gelen mesaj dinleme {tg?.polling ? 'çalışıyor (Telegram\'dan yanıt verilebilir)' : 'kapalı'}</Check>
                        </div>
                    )}
                </Card>
                <Card title={<><MessageSquare size={16} color="#6ee7b7" /> SMS</>}>
                    {!status ? <div style={{ color: C.muted, display: 'flex', gap: 8 }}><Spinner /> Yükleniyor…</div> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Check ok={!!status.sms.provider}>Sağlayıcı: {status.sms.provider ?? 'seçilmemiş'}</Check>
                            <Check ok={status.sms.configured}>Kimlik bilgileri {status.sms.configured ? 'tam' : 'eksik'}</Check>
                        </div>
                    )}
                </Card>
                <Card title={<><ShieldCheck size={16} color="#a5b4fc" /> Giriş doğrulaması</>}>
                    {!status ? <div style={{ color: C.muted, display: 'flex', gap: 8 }}><Spinner /> Yükleniyor…</div> : (
                        <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                            Doğrulama kodu şu kanaldan gönderiliyor: <b style={{ color: C.text }}>{OTP_CHANNEL[status.otpChannel]}</b>.
                            <div style={{ color: C.dim, fontSize: '0.78rem', marginTop: 6 }}>Öncelik: SMS → Telegram → sunucu günlüğü. Üretimde en az birini yapılandırın.</div>
                        </div>
                    )}
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
                <Card title="Telegram botu nasıl kurulur?">
                    <Steps items={[
                        <>Telegram'da <b>@BotFather</b> ile sohbet açın ve <Code>/newbot</Code> yazın. Bota bir ad ve <Code>_bot</Code> ile biten bir kullanıcı adı verin.</>,
                        <>BotFather size <b>bot token</b>'ını verir (ör. <Code>123456:ABC-DEF…</Code>). Bu değeri kimseyle paylaşmayın.</>,
                        <>Railway'de backend servisinin <b>Variables</b> sekmesine <Code>TELEGRAM_BOT_TOKEN</Code> olarak ekleyin ve servisi yeniden başlatın.</>,
                        <>Telegram'da kendi botunuzu bulun ve <Code>/start</Code> (veya herhangi bir mesaj) gönderin. Bot size <b>sohbet kimliğinizi</b> (chat id) yanıt olarak yazar.</>,
                        <>Bu sayıyı Railway Variables'a <Code>TELEGRAM_ADMIN_CHAT_ID</Code> olarak ekleyin ve servisi yeniden başlatın.</>,
                        <>Bu sayfada <b>Test mesajı gönder</b>'e basın. Mesaj gelirse destek talepleri ve online destek istekleri Telegram'a düşer; talep bildirimine Telegram'da <b>yanıtla</b> diyerek kullanıcıya cevap verebilirsiniz.</>,
                    ]} />
                </Card>
                <Card title="SMS (Netgsm) nasıl kurulur?">
                    <Steps items={[
                        <>Netgsm hesabınızda API kullanımını açın ve onaylı bir <b>SMS başlığı</b> (gönderici adı) alın.</>,
                        <>Railway Variables'a şunları ekleyin: <Code>SMS_PROVIDER=netgsm</Code>, <Code>NETGSM_USERCODE</Code> (abone no / kullanıcı adı), <Code>NETGSM_PASSWORD</Code> (API şifresi), <Code>NETGSM_MSGHEADER</Code> (onaylı başlık).</>,
                        <>Kodun gideceği numara, yönetici kullanıcının hesabındaki <b>telefon numarası</b>dır (<Code>phone_number</Code>). Numaranın doğru ve <Code>5XXXXXXXXX</Code> biçiminde olduğundan emin olun.</>,
                        <>Servisi yeniden başlatıp çıkış yapın ve tekrar giriş yapın; kod SMS ile gelmelidir.</>,
                    ]} />
                </Card>
            </div>
        </div>
    );
};
