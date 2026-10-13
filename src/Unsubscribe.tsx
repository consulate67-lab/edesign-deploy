import React, { useState } from 'react';
import { API_URL } from './api';
import { theme } from './theme';

type State = 'idle' | 'busy' | 'done' | 'error';

const TEXT = {
    tr: {
        title: 'Tanıtım e-postalarından çık', lead: 'edXdocu tanıtım e-postalarını artık almak istemiyorsanız aşağıdaki düğmeye basın.',
        button: 'Listeden çık', busy: 'İşleniyor…', doneTitle: 'Listeden çıkarıldınız',
        done: 'Size bir daha tanıtım e-postası gönderilmeyecek. Hesabınızla ilgili zorunlu bildirimler (ör. giriş kodu) bundan etkilenmez.',
        error: 'İşlem tamamlanamadı. Lütfen daha sonra tekrar deneyin.', home: 'edxdocu.com\'a git',
    },
    en: {
        title: 'Unsubscribe from promotional emails', lead: 'If you no longer want to receive edXdocu promotional emails, press the button below.',
        button: 'Unsubscribe', busy: 'Processing…', doneTitle: 'You have been unsubscribed',
        done: 'You will not receive promotional emails from us again. Required account notices (e.g. login codes) are not affected.',
        error: 'The request could not be completed. Please try again later.', home: 'Go to edxdocu.com',
    },
    de: {
        title: 'Von Werbe-E-Mails abmelden', lead: 'Wenn Sie keine Werbe-E-Mails von edXdocu mehr erhalten möchten, klicken Sie auf die Schaltfläche unten.',
        button: 'Abmelden', busy: 'Wird verarbeitet…', doneTitle: 'Sie wurden abgemeldet',
        done: 'Sie erhalten keine Werbe-E-Mails mehr von uns. Notwendige Kontohinweise (z. B. Anmeldecodes) sind davon nicht betroffen.',
        error: 'Die Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.', home: 'Zu edxdocu.com',
    },
    fr: {
        title: 'Se désinscrire des e-mails promotionnels', lead: 'Si vous ne souhaitez plus recevoir les e-mails promotionnels d’edXdocu, cliquez sur le bouton ci-dessous.',
        button: 'Se désinscrire', busy: 'Traitement…', doneTitle: 'Vous êtes désinscrit',
        done: 'Vous ne recevrez plus d’e-mails promotionnels de notre part. Les notifications obligatoires liées au compte (ex. codes de connexion) ne sont pas concernées.',
        error: 'La demande n’a pas pu aboutir. Veuillez réessayer plus tard.', home: 'Aller sur edxdocu.com',
    },
    es: {
        title: 'Darse de baja de los correos promocionales', lead: 'Si ya no desea recibir correos promocionales de edXdocu, pulse el botón de abajo.',
        button: 'Darse de baja', busy: 'Procesando…', doneTitle: 'Se ha dado de baja',
        done: 'No volverá a recibir correos promocionales nuestros. Los avisos obligatorios de la cuenta (p. ej., códigos de acceso) no se ven afectados.',
        error: 'No se pudo completar la solicitud. Inténtelo de nuevo más tarde.', home: 'Ir a edxdocu.com',
    },
    ru: {
        title: 'Отписка от рекламных писем', lead: 'Если вы больше не хотите получать рекламные письма edXdocu, нажмите кнопку ниже.',
        button: 'Отписаться', busy: 'Обработка…', doneTitle: 'Вы отписаны',
        done: 'Вы больше не будете получать от нас рекламные письма. Обязательные уведомления по аккаунту (например, коды входа) это не затрагивает.',
        error: 'Не удалось выполнить запрос. Попробуйте позже.', home: 'Перейти на edxdocu.com',
    },
    zh: {
        title: '退订推广邮件', lead: '如果您不想再收到 edXdocu 的推广邮件，请点击下方按钮。',
        button: '退订', busy: '处理中…', doneTitle: '您已成功退订',
        done: '我们将不再向您发送推广邮件。账户相关的必要通知（如登录验证码）不受影响。',
        error: '请求未能完成，请稍后重试。', home: '前往 edxdocu.com',
    },
    hi: {
        title: 'प्रचार ईमेल की सदस्यता छोड़ें', lead: 'यदि आप अब edXdocu के प्रचार ईमेल नहीं चाहते, तो नीचे दिया गया बटन दबाएँ।',
        button: 'सदस्यता छोड़ें', busy: 'प्रोसेस हो रहा है…', doneTitle: 'आपकी सदस्यता हटा दी गई है',
        done: 'आपको हमसे आगे प्रचार ईमेल नहीं मिलेंगे। खाते से जुड़ी ज़रूरी सूचनाएँ (जैसे लॉगिन कोड) इससे प्रभावित नहीं होतीं।',
        error: 'अनुरोध पूरा नहीं हो सका। कृपया बाद में फिर कोशिश करें।', home: 'edxdocu.com पर जाएँ',
    },
    pt: {
        title: 'Cancelar o recebimento de e-mails promocionais', lead: 'Se você não quer mais receber os e-mails promocionais da edXdocu, clique no botão abaixo.',
        button: 'Cancelar inscrição', busy: 'Processando…', doneTitle: 'Sua inscrição foi cancelada',
        done: 'Você não receberá mais e-mails promocionais nossos. Os avisos obrigatórios da conta (por exemplo, códigos de acesso) não são afetados.',
        error: 'Não foi possível concluir a solicitação. Tente novamente mais tarde.', home: 'Ir para edxdocu.com',
    },
};

type Lang = keyof typeof TEXT;

const pickLang = (): Lang => {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl && fromUrl in TEXT) return fromUrl as Lang;
    const fromBrowser = navigator.language?.slice(0, 2).toLowerCase();
    return fromBrowser && fromBrowser in TEXT ? fromBrowser as Lang : 'tr';
};

/** E-postadaki "listeden çık" bağlantısının açtığı sayfa; bağlantı tarayıcılar tarafından önceden açılabildiği için onay düğmesi ister. */
export const Unsubscribe: React.FC<{ token: string }> = ({ token }) => {
    const [lang] = useState(pickLang);
    const t = TEXT[lang];
    const [state, setState] = useState<State>('idle');

    const confirm = async () => {
        setState('busy');
        try {
            const res = await fetch(`${API_URL}/mail/unsubscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ u: token }),
            });
            if (!res.ok) throw new Error(String(res.status));
            setState('done');
        } catch {
            setState('error');
        }
    };

    return (
        <div lang={lang} style={{ width: '100%', minHeight: '100vh', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, fontFamily: theme.font, padding: 20 }}>
            <div style={{ width: 'min(460px, 100%)', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 18, boxShadow: theme.shadow, padding: 32, textAlign: 'center' }}>
                <img src="logo-300x100.png" alt="edXdocu" width={180} height={60} style={{ display: 'block', margin: '0 auto 18px' }} />
                {state === 'done' ? (
                    <>
                        <h1 style={{ fontSize: '1.3rem', margin: '0 0 10px', color: theme.text }}>{t.doneTitle}</h1>
                        <p style={{ margin: 0, color: theme.textMuted, lineHeight: 1.6, fontSize: '0.95rem' }}>{t.done}</p>
                    </>
                ) : (
                    <>
                        <h1 style={{ fontSize: '1.3rem', margin: '0 0 10px', color: theme.text }}>{t.title}</h1>
                        <p style={{ margin: '0 0 22px', color: theme.textMuted, lineHeight: 1.6, fontSize: '0.95rem' }}>{t.lead}</p>
                        {state === 'error' && <p style={{ margin: '0 0 16px', color: theme.redText, fontSize: '0.9rem' }}>{t.error}</p>}
                        <button
                            type="button"
                            disabled={state === 'busy'}
                            onClick={() => void confirm()}
                            style={{
                                padding: '12px 22px', borderRadius: 12, border: 'none', background: theme.primary, color: '#fff',
                                fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit', cursor: state === 'busy' ? 'wait' : 'pointer', opacity: state === 'busy' ? 0.7 : 1,
                            }}
                        >
                            {state === 'busy' ? t.busy : t.button}
                        </button>
                    </>
                )}
                <p style={{ margin: '24px 0 0', fontSize: '0.85rem' }}>
                    <a href={`/?lang=${lang}`} style={{ color: theme.primary, fontWeight: 600 }}>{t.home}</a>
                </p>
            </div>
        </div>
    );
};
