import React, { Suspense, lazy, useState, useEffect } from 'react';
import './index.css';
import { api } from './api';
import { ToastHost } from './store/ToastHost.tsx';
import { Landing } from './Landing.tsx';

// Route-level code splitting: each screen ships in its own chunk so the
// initial bundle stays small. The designer (~150KB after minify) is the
// heaviest — it only loads once a user actually opens it.
const Auth = lazy(() => import('./Auth.tsx').then((m) => ({ default: m.Auth })));
const Selection = lazy(() => import('./Selection.tsx').then((m) => ({ default: m.Selection })));
const ProfessionalDesigner = lazy(() =>
    import('./ProfessionalDesigner.tsx').then((m) => ({ default: m.ProfessionalDesigner }))
);

const ScreenFallback: React.FC = () => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            color: '#64748b',
            fontSize: 14,
        }}
    >
        Yükleniyor...
    </div>
);

type View = 'landing' | 'auth' | 'selection' | 'designer';
type AuthMode = 'login' | 'register';

const App: React.FC = () => {
    // Initial view: Landing. Once user clicks "Üye Ol" or "Giriş Yap", switch to auth.
    // After successful auth, move to selection. After selecting a doc, designer.
    const [view, setView] = useState<View>('landing');
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [selectedDoc, setSelectedDoc] = useState<{ moduleId: string, moduleName: string, template: string, customContent?: string, themeColor?: string } | null>(null);

    // If a token already exists in sessionStorage (returning user), skip Landing.
    useEffect(() => {
        const token = api.getToken();
        if (token) {
            // Stay on Landing — user will click Giriş Yap, then token is validated
            // via /api/me. If invalid, Auth clears it.
        }
    }, []);

    const handleLogin = () => {
        setAuthMode('login');
        setView('auth');
    };

    const handleRegister = () => {
        setAuthMode('register');
        setView('auth');
    };

    const handleLogout = () => {
        api.setToken('');
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

    return (
        <>
            <ToastHost />
            <Suspense fallback={<ScreenFallback />}>
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
                    <Selection onSelect={handleDocSelect} onLogout={handleLogout} />
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
            </Suspense>
        </>
    );
};

export default App;
