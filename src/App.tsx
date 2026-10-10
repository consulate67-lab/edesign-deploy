import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import './index.css';
import { api } from './api';
import { ToastHost } from './store/ToastHost.tsx';
import { useUiStore } from './store/uiStore';
import { Landing } from './Landing.tsx';
import { theme } from './theme';
import i18n from './i18n';

// Route-level code splitting: each screen ships in its own chunk so the
// initial bundle stays small. The designer (~150KB after minify) is the
// heaviest — it only loads once a user actually opens it.
const Auth = lazy(() => import('./Auth.tsx').then((m) => ({ default: m.Auth })));
const Selection = lazy(() => import('./Selection.tsx').then((m) => ({ default: m.Selection })));
const ProfessionalDesigner = lazy(() =>
    import('./ProfessionalDesigner.tsx').then((m) => ({ default: m.ProfessionalDesigner }))
);
// Sprint 7 (2026-10-03) — XSLT Editor: bagimsiz 2. tasarim, Monaco + canli preview.
// ProfesyonelDesigner'a dokunmaz, ayri route. vendor-monaco chunk lazy load.
const XSLTEditor = lazy(() =>
    import('./xslt-editor/XsltEditor').then((m) => ({ default: m.XSLTEditor }))
);
// Yönetim paneli yalnızca #/yonetim (veya #/admin) ile açılır; sitede bağlantısı yoktur.
const AdminApp = lazy(() => import('./admin/AdminApp').then((m) => ({ default: m.AdminApp })));
const SupportWidget = lazy(() => import('./support/SupportWidget').then((m) => ({ default: m.SupportWidget })));
const AssistantWidget = lazy(() => import('./assistant/AssistantWidget').then((m) => ({ default: m.AssistantWidget })));

const isAdminHash = () => /^#\/(yonetim|admin)(\/|$)/i.test(window.location.hash);

const ScreenFallback: React.FC<{ light?: boolean }> = ({ light }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: light ? '100vh' : '60vh',
            width: light ? '100%' : undefined,
            background: light ? theme.bg : undefined,
            color: '#64748b',
            fontSize: 14,
        }}
    >
        {i18n.t('common.loading')}
    </div>
);

type View = 'landing' | 'auth' | 'selection' | 'designer' | 'xslt-editor';
type AuthMode = 'login' | 'register';
type SelectedDoc = { moduleId: string, moduleName: string, template: string, customContent?: string, themeColor?: string, xml?: string, designId?: number };

/** Sayfa yenilenince oturumdaki ekran ve açık belge geri yüklenir (sekme kapanınca silinir). */
const VIEW_KEY = 'app_view';
const DOC_KEY = 'app_doc';
const readSession = (): { view: View; doc: SelectedDoc | null } => {
    if (!api.getToken()) return { view: 'landing', doc: null };
    let doc: SelectedDoc | null = null;
    try { doc = JSON.parse(sessionStorage.getItem(DOC_KEY) || 'null'); } catch { doc = null; }
    const stored = sessionStorage.getItem(VIEW_KEY) as View | null;
    const view: View = (stored === 'designer' || stored === 'xslt-editor') && doc ? stored : 'selection';
    return { view, doc };
};
const writeSession = (view: View, doc: SelectedDoc | null) => {
    try {
        sessionStorage.setItem(VIEW_KEY, view);
        if (doc) sessionStorage.setItem(DOC_KEY, JSON.stringify(doc));
        else sessionStorage.removeItem(DOC_KEY);
    } catch { /* kota dolarsa yalnızca geri yükleme çalışmaz */ }
};

const App: React.FC = () => {
    const [initial] = useState(readSession);
    const [view, setView] = useState<View>(initial.view);
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [selectedDoc, setSelectedDoc] = useState<SelectedDoc | null>(initial.doc);
    const [adminRoute, setAdminRoute] = useState(isAdminHash);

    useEffect(() => {
        const onHash = () => setAdminRoute(isAdminHash());
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);

    const userArea = !adminRoute && (view === 'selection' || view === 'designer' || view === 'xslt-editor');

    // Giriş yapmış kullanıcı: canlı bağlantı + ortak ekran istemcisi; çıkışta / girişe dönünce kapatılır.
    useEffect(() => {
        if (!userArea) return;
        let alive = true;
        import('./support/cobrowse/CobrowseClient')
            .then((m) => { if (alive) m.mountCobrowseClient(); })
            .catch((e) => console.warn('[support] ortak ekran istemcisi yüklenemedi', e));
        return () => {
            alive = false;
            import('./support/cobrowse/CobrowseClient').then((m) => m.unmountCobrowseClient()).catch(() => undefined);
            import('./support/realtime').then((m) => m.disconnectUserRealtime()).catch(() => undefined);
        };
    }, [userArea]);

    useEffect(() => {
        if (!userArea) return;
        import('./support/realtime')
            .then((m) => { m.getUserRealtime(); m.reportView(view); })
            .catch(() => undefined);
    }, [userArea, view]);

    useEffect(() => {
        if (view === 'landing' || view === 'auth') {
            sessionStorage.removeItem(VIEW_KEY);
            sessionStorage.removeItem(DOC_KEY);
            return;
        }
        writeSession(view, view === 'selection' ? null : selectedDoc);
    }, [view, selectedDoc]);

    // Süresi dolmuş / geçersiz oturumla açılırsa girişe dön.
    useEffect(() => {
        if (!api.getToken()) return;
        api.getMe().catch((err: { status?: number }) => {
            if (err?.status === 401 || err?.status === 403) {
                api.logout();
                setSelectedDoc(null);
                setView('auth');
            }
        });
    }, []);

    /** Editördeki güncel içerik — yenilemede kaybolmasın diye yalnızca oturuma yazılır. */
    const handleEditorWork = useCallback((work: { moduleId: string; xslt: string; xml: string; designId?: number }) => {
        const doc = readSession().doc;
        if (!doc) return;
        writeSession('xslt-editor', {
            ...doc, moduleId: work.moduleId, customContent: work.xslt, xml: work.xml, designId: work.designId ?? doc.designId,
        });
    }, []);

    // PayTR ödeme formu dönüş adresini iframe yerine sayfanın kendisinde açarsa ?payment=success|fail gelir.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const payment = params.get('payment');
        if (!payment) return;
        params.delete('payment');
        const query = params.toString();
        window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : '') + window.location.hash);
        const ok = payment === 'success';
        useUiStore.getState().pushToast({
            kind: ok ? 'success' : 'error',
            title: ok ? 'Ödeme başarılı' : 'Ödeme tamamlanamadı',
            description: ok ? 'Ödemeniz alındı; tasarım haklarınız birkaç saniye içinde hesabınıza yüklenir.' : 'Kartınızdan çekim yapılmadıysa tekrar deneyebilirsiniz.',
            ttl: 8000,
        });
        if (api.getToken()) setView('selection');
    }, []);

    const handleLogin = () => {
        setAuthMode('login');
        setView('auth');
    };

    const handleRegister = () => {
        setAuthMode('register');
        setView('auth');
    };

    const showSection = (id: string) => {
        const wasLanding = view === 'landing';
        setView('landing');
        window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), wasLanding ? 0 : 150);
    };

    const handleLogout = () => {
        api.logout();
        setSelectedDoc(null);
        setView('landing'); // logout → back to Landing (cleaner than Auth)
    };

    const handleAuthSuccess = () => {
        // Auth component calls this when login/register succeeds
        setView('selection');
    };

    const handleDocSelect = (moduleId: string, template: string, moduleName: string, customContent?: string, themeColor?: string) => {
        setSelectedDoc({ moduleId, moduleName, template, customContent, themeColor });
        setView('designer');
    };

    const handleBack = () => setView('selection');

    /**
     * Sprint 7 — XSLT Editor'a gecis. Selection.tsx'teki "XSLT Editor (Beta)" kartindan tetiklenir.
     * ProfesyonelDesigner'dan bagimsiz; XSLT bilen kullanicilar (Selim gibi) icin dogrudan
     * Monaco + canli preview. Modul dropdown ile 9 e-belge modulu destekler.
     */
    const handleSelectXsltEditor = (moduleId?: string, initialXslt?: string, docName?: string, xml?: string, designId?: number) => {
        setSelectedDoc({
            moduleId: moduleId || 'fatura',
            moduleName: docName || '',
            template: 'XsltEditor',
            customContent: initialXslt,
            themeColor: '#1e3a8a',
            xml,
            designId,
        });
        setView('xslt-editor');
    };

    if (adminRoute) {
        return (
            <>
                <ToastHost />
                <Suspense fallback={<ScreenFallback light />}>
                    <AdminApp />
                </Suspense>
            </>
        );
    }

    return (
        <>
            <ToastHost />
            {userArea && api.getToken() && (
                <Suspense fallback={null}>
                    <SupportWidget />
                </Suspense>
            )}
            {(view === 'landing' || view === 'auth') && (
                <Suspense fallback={null}>
                    <AssistantWidget page={view} onRegister={handleRegister} onLogin={handleLogin} onSection={showSection} />
                </Suspense>
            )}
            <Suspense fallback={<ScreenFallback light />}>
                {view === 'landing' && (
                    <Landing onRegister={handleRegister} onLogin={handleLogin} />
                )}
                {view === 'auth' && (
                    <Auth
                        mode={authMode}
                        onLogin={handleAuthSuccess}
                        onRegister={handleAuthSuccess}
                        onSwitchMode={(m) => setAuthMode(m)}
                        onBackToLanding={() => setView('landing')}
                    />
                )}
                {view === 'selection' && (
                    <Selection
                        onSelect={handleDocSelect}
                        onLogout={handleLogout}
                        onSelectXsltEditor={handleSelectXsltEditor}
                    />
                )}
                {view === 'designer' && selectedDoc && (
                    <ProfessionalDesigner
                        template={selectedDoc.template}
                        customContent={selectedDoc.customContent}
                        themeColor={selectedDoc.themeColor}
                        docName={selectedDoc.moduleName}
                        moduleId={selectedDoc.moduleId}
                        onBack={handleBack}
                    />
                )}
                {view === 'xslt-editor' && selectedDoc && (
                    <XSLTEditor
                        initialModuleId={selectedDoc.moduleId}
                        initialXslt={selectedDoc.customContent}
                        initialXml={selectedDoc.xml}
                        docName={selectedDoc.moduleName}
                        initialDesignId={selectedDoc.designId}
                        onWorkChange={handleEditorWork}
                        onBack={handleBack}
                    />
                )}
            </Suspense>
        </>
    );
};

export default App;
