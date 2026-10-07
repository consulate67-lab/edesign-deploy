const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// VITE_API_URL is injected at build time. Falls back to:
//   - localhost dev (Vite proxy or direct): http://localhost:3002/api
//   - prod static deploy (GitHub Pages):      /api  (assumes reverse proxy)
const API_URL =
    (import.meta.env.VITE_API_URL as string | undefined)
    || (isLocal ? 'http://localhost:3002/api' : '/api');

// Session storage is used instead of localStorage for auth tokens to limit
// the XSS attack surface: tokens are cleared when the browser tab closes.
const TOKEN_STORAGE = (() => {
    try {
        if (typeof window !== 'undefined' && window.sessionStorage) return window.sessionStorage;
    } catch { /* SSR safety */ }
    // Fallback for environments without sessionStorage (tests, sandboxed iframes)
    const mem: Record<string, string> = {};
    return {
        getItem: (k: string) => mem[k] ?? null,
        setItem: (k: string, v: string) => { mem[k] = v; },
        removeItem: (k: string) => { delete mem[k]; },
    } as Storage;
})();

const IS_DEV = import.meta.env.DEV;

export interface SavedDesign {
    id: number;
    name: string;
    module_id: string;
    xslt_content: string | null;
    xml_content: string | null;
    design_key: string | null;
    paid: boolean;
    paid_at: string | null;
    status: string;
    download_count: number;
    created_at: string;
    updated_at: string;
}

/** server/index.js embedDesignKey ile aynı biçim. */
export const DESIGN_KEY_RE = /edesign-key:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
export const designKeyOf = (xslt: string | null | undefined) => xslt?.match(DESIGN_KEY_RE)?.[1] ?? null;
const embedDesignKey = (xslt: string, key: string) => {
    const clean = xslt.replace(/^(?:\uFEFF|\u00EF\u00BB\u00BF)+/, '').replace(/<!--\s*edesign-key:[^>]*?-->[ \t]*\r?\n?/gi, '');
    const comment = `<!-- edesign-key:${key} | Bu satiri silmeyin: dosyayi tekrar yuklediginizde tasariminiza ek tasarim hakki harcamadan devam edersiniz. -->\n`;
    const decl = clean.match(/^\uFEFF?\s*<\?xml[^?]*\?>[ \t]*\r?\n?/);
    return decl ? clean.slice(0, decl[0].length) + comment + clean.slice(decl[0].length) : comment + clean;
};

// --- DEV-ONLY MOCK DATABASE ---
// Only seeded when running the Vite dev server. In production builds the
// mock layer is entirely disabled — the client only talks to the real API.
const INITIAL_USERS = IS_DEV ? [
    {
        username: 'sarp@yilmaz.com',
        password: '123456',
        full_name: 'Sarp Yılmaz',
        company_name: 'Super Admin (DEV)',
        role: 'admin',
        credits: 999999,
        token: 'admin-token-dev-only',
        phone: '555-000-0000'
    },
    {
        username: 'demo',
        password: '123',
        full_name: 'Demo Kullanıcı',
        company_name: 'Demo Ltd.',
        role: 'user',
        credits: 5,
        token: 'demo-token-dev-only',
        phone: '555-123-4567'
    }
] : [];

// Mock DB accessors — no-op when not in dev mode.
const getUsers = () => {
    if (!IS_DEV) return [];
    const stored = localStorage.getItem('mock_users_db');
    if (!stored) {
        localStorage.setItem('mock_users_db', JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
    }
    return JSON.parse(stored);
};

const saveUsers = (users: any[]) => {
    if (!IS_DEV) return;
    localStorage.setItem('mock_users_db', JSON.stringify(users));
};

const findUserByToken = (token: string) => {
    const users = getUsers();
    return users.find((u: any) => u.token === token);
};

const findUserByCreds = (username: string, password: string) => {
    const users = getUsers();
    return users.find((u: any) => u.username === username && u.password === password);
};

export const api = {
    getToken: () => TOKEN_STORAGE.getItem('token'),
    setToken: (token: string) => TOKEN_STORAGE.setItem('token', token),
    logout: () => TOKEN_STORAGE.removeItem('token'),

    // Generic Request Handler with Mock Fallback
    async request(endpoint: string, options: RequestInit = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };

        let res: Response;
        try {
            // Dev'de backend yoksa mock'a hızlı düşmek için kısa zaman aşımı.
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), IS_DEV ? 800 : 60000);
            res = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal
            });
            clearTimeout(id);
        } catch {
            res = null as unknown as Response;
        }

        if (res) {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw Object.assign(new Error(data.error || `İstek başarısız (${res.status})`), {
                    status: res.status,
                    paymentRequired: !!data.paymentRequired,
                });
            }
            return data;
        }

        {
            // Production builds must never fall back to a local mock database.
            // The fallback below is only useful for offline dev work.
            if (!IS_DEV) {
                throw new Error(`Sunucuya ulaşılamadı (${endpoint}). Lütfen daha sonra tekrar deneyin.`);
            }

            console.warn(`⚠️ API Unreachable (${endpoint}). Using DEV-only mock logic.`);

            // Parse body if it exists
            const body = options.body ? JSON.parse(options.body as string) : {};

            // --- STRICT MOCK LOGIC (DEV ONLY) ---

            // 1. LOGIN
            if (endpoint === '/auth/login') {
                const user = findUserByCreds(body.username, body.password);
                if (user) {
                    return { token: user.token, role: user.role, full_name: user.full_name };
                }
                throw new Error('Kullanıcı adı veya şifre hatalı!');
            }

            // 2. REGISTER
            if (endpoint === '/auth/register') {
                const users = getUsers();
                if (users.find((u: any) => u.username === body.username)) {
                    throw new Error('Bu kullanıcı adı zaten alınmış.');
                }
                const newUser = {
                    username: body.username,
                    password: body.password,
                    full_name: body.full_name,
                    company_name: body.company_name,
                    role: 'user',
                    credits: 1, // Starter credits
                    token: 'token_' + Date.now(),
                    phone: body.phone_number
                };
                users.push(newUser);
                saveUsers(users);
                return { token: newUser.token, role: newUser.role, full_name: newUser.full_name };
            }

            // 3. GET ME (Validates Token)
            if (endpoint === '/me') {
                const user = findUserByToken(token || '');
                if (user) {
                    return {
                        full_name: user.full_name,
                        role: user.role,
                        credits: user.credits,
                        company_name: user.company_name,
                        username: user.username,
                        email: user.username,
                        phone_number: user.phone
                    };
                }
                throw new Error('Oturum süresi doldu, lütfen tekrar giriş yapın.');
            }

            // 4. CONSUME CREDIT
            if (endpoint.includes('/design/consume-credit')) {
                const users = getUsers();
                const userIndex = users.findIndex((u: any) => u.token === token);

                if (userIndex === -1) throw new Error('Oturum geçersiz.');

                if (users[userIndex].credits > 0) {
                    users[userIndex].credits--;
                    saveUsers(users);
                    return { success: true, credits: users[userIndex].credits };
                } else {
                    throw new Error('Yetersiz kredi! Lütfen kredi yükleyin.');
                }
            }

            // 5. ADD CREDITS (Mock Payment)
            if (endpoint.includes('/payment/mock')) {
                const users = getUsers();
                const userIndex = users.findIndex((u: any) => u.token === token);
                if (userIndex > -1) {
                    const amount = typeof body.amount === 'number' ? body.amount : 100;
                    users[userIndex].credits += amount;
                    saveUsers(users);
                    return { success: true, credits: users[userIndex].credits };
                }
            }

            // Admin Add Credits
            if (endpoint === '/admin/add-credits') {
                const users = getUsers();
                // Only admin can do this realistically, but simplified here
                const admin = findUserByToken(token || '');
                if (admin && admin.role === 'admin') {
                    // Add to self for demo
                    const idx = users.findIndex((u: any) => u.username === admin.username);
                    users[idx].credits += 1000;
                    saveUsers(users);
                    return { success: true };
                }
            }

            return { success: true };
        }
    },

    // Convenience Wrappers
    login: (username: string, password: string) => {
        return api.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    register: (details: any) => api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(details)
    }),

    getMe: async () => {
        return api.request('/me');
    },

    consumeCredit: () => api.request('/design/consume-credit', { method: 'POST' }),

    addCredits: (amount: number) => api.request('/payment/mock', {
        method: 'POST',
        body: JSON.stringify({ amount })
    }),

    makeMeRich: () => api.request('/admin/add-credits', { method: 'POST' }),

    // --- DESIGN PERSISTENCE (Sprint 1, 2026-10-02) ---
    // Kullanici tasarimlarini DB'de saklama. DesignerApp'ten cagrilir.
    // DEV modda localStorage fallback (mock), PROD modda backend.
    listDesigns: async () => {
        if (!IS_DEV) return api.request('/designs');
        // DEV mock — localStorage
        const designs = JSON.parse(localStorage.getItem('mock_designs') || '[]');
        return { designs };
    },

    getDesign: async (id: number) => {
        if (!IS_DEV) return api.request(`/designs/${id}`);
        const designs = JSON.parse(localStorage.getItem('mock_designs') || '[]');
        const found = designs.find((d: any) => d.id === id);
        if (!found) throw new Error('Tasarim bulunamadi.');
        return { design: found };
    },

    saveDesign: async (design: {
        name: string;
        module_id: string;
        xslt_content?: string;
        xml_content?: string;
        custom_content?: string;
        theme_color?: string;
        sections?: any;
        status?: string;
    }) => {
        if (!IS_DEV) return api.request('/designs', {
            method: 'POST',
            body: JSON.stringify(design),
        });
        // DEV mock
        const designs = JSON.parse(localStorage.getItem('mock_designs') || '[]');
        const user = await api.getMe().catch(() => ({ username: 'demo' }));
        const id = Date.now();
        const created = {
            id,
            user_id: user.id || 0,
            username: user.username,
            ...design,
            status: design.status || 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        designs.unshift(created);
        localStorage.setItem('mock_designs', JSON.stringify(designs));
        return { success: true, design: created };
    },

    /**
     * Tasarımı indirmek için: daha önce indirilmiş tasarım ücretsiz, değilse
     * 1 tasarım hakkı düşer. Dönen xslt_content tasarım anahtarını içerir.
     */
    exportDesign: async (payload: {
        design_id?: number;
        design_key?: string;
        name: string;
        module_id: string;
        xslt_content: string;
        xml_content?: string;
    }): Promise<{ success: boolean; charged: boolean; credits: number; design: SavedDesign }> => {
        if (!IS_DEV) return api.request('/designs/export', { method: 'POST', body: JSON.stringify(payload) });
        const designs: SavedDesign[] = JSON.parse(localStorage.getItem('mock_designs') || '[]');
        const keyInFile = payload.xslt_content.match(DESIGN_KEY_RE)?.[1];
        const existing = designs.find(d => (payload.design_id && d.id === payload.design_id)
            || (payload.design_key && d.design_key === payload.design_key)
            || (keyInFile && d.design_key === keyInFile));
        const users = getUsers();
        const user = users.find((u: any) => u.token === api.getToken());
        if (!user) throw new Error('Oturum geçersiz.');
        let charged = false;
        if (!existing?.paid && user.role !== 'admin') {
            if (user.credits <= 0) {
                throw Object.assign(new Error('Tasarımı indirmek için tasarım hakkınız kalmadı.'), { status: 402, paymentRequired: true });
            }
            user.credits -= 1;
            saveUsers(users);
            charged = true;
        }
        const key = existing?.design_key || crypto.randomUUID();
        const now = new Date().toISOString();
        const design: SavedDesign = {
            ...(existing ?? { id: Date.now(), created_at: now, download_count: 0 }),
            name: payload.name,
            module_id: payload.module_id,
            xslt_content: embedDesignKey(payload.xslt_content, key),
            xml_content: payload.xml_content ?? existing?.xml_content ?? null,
            design_key: key,
            paid: true,
            paid_at: existing?.paid_at ?? now,
            status: 'downloaded',
            download_count: (existing?.download_count ?? 0) + 1,
            updated_at: now,
        } as SavedDesign;
        localStorage.setItem('mock_designs', JSON.stringify([design, ...designs.filter(d => d.id !== design.id)]));
        return { success: true, charged, credits: user.credits, design };
    },

    /** Yüklenen dosyadaki anahtarın kullanıcıya ait tasarımı; yoksa null. */
    getDesignByKey: async (key: string): Promise<SavedDesign | null> => {
        if (!IS_DEV) {
            try {
                return (await api.request(`/designs/by-key/${encodeURIComponent(key)}`)).design ?? null;
            } catch (e) {
                if ((e as { status?: number }).status === 404) return null;
                throw e;
            }
        }
        const designs: SavedDesign[] = JSON.parse(localStorage.getItem('mock_designs') || '[]');
        return designs.find(d => d.design_key === key) ?? null;
    },

    updateDesign: async (id: number, patch: Partial<{
        name: string;
        xml_content: string;
        xslt_content: string;
        custom_content: string;
        theme_color: string;
        sections: any;
        status: string;
    }>) => {
        if (!IS_DEV) return api.request(`/designs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(patch),
        });
        // DEV mock
        const designs = JSON.parse(localStorage.getItem('mock_designs') || '[]');
        const idx = designs.findIndex((d: any) => d.id === id);
        if (idx === -1) throw new Error('Tasarim bulunamadi.');
        designs[idx] = { ...designs[idx], ...patch, updated_at: new Date().toISOString() };
        localStorage.setItem('mock_designs', JSON.stringify(designs));
        return { success: true, design: designs[idx] };
    },

    deleteDesign: async (id: number) => {
        if (!IS_DEV) return api.request(`/designs/${id}`, { method: 'DELETE' });
        // DEV mock
        const designs = JSON.parse(localStorage.getItem('mock_designs') || '[]');
        const filtered = designs.filter((d: any) => d.id !== id);
        localStorage.setItem('mock_designs', JSON.stringify(filtered));
        return { success: true, message: 'Tasarim silindi.' };
    },

    // --- IYZICO CHECKOUT (Sprint 1.3, 2026-10-02) ---
    // Plan satin alimi icin iyzico checkout form token al.
    // Backend POST /api/payment/iyzico/checkout — sandbox/prod env'den okur.
    iyzicoCheckout: async (plan: 'one' | 'basic' | 'pro') => {
        if (!IS_DEV) {
            return api.request('/payment/iyzico/checkout', {
                method: 'POST',
                body: JSON.stringify({ plan }),
            });
        }
        // DEV mock — direkt basarili don (Selim'in local sandbox testi icin)
        // eslint-disable-next-line no-console
        console.log('[api.dev] iyzicoCheckout mock basarili donuluyor:', plan);
        return {
            success: true,
            token: `mock-token-${plan}-${Date.now()}`,
            paymentPageUrl: `/?payment=mock-${plan}`,
            conversationId: `mock-conv-${Date.now()}`,
        };
    },

    // --- TEMPLATE MANAGEMENT (Mock DB) ---
    // NOTE: These mock storage helpers are only used in DEV builds.
    // In production the backend endpoints under /api/templates/* are required.
    saveTemplate: (template: any) => {
        return new Promise(async (resolve, reject) => {
            if (!IS_DEV) {
                return reject(new Error('saveTemplate backend endpoint not implemented yet.'));
            }
            try {
                const user = await api.getMe(); // Must be logged in
                const temps = JSON.parse(localStorage.getItem('mock_templates') || '[]');
                const newTemp = {
                    ...template,
                    id: 'temp_' + Date.now(),
                    status: 'pending', // Always pending initially
                    createdAt: new Date().toISOString(),
                    username: user.username,
                    docType: template.docType || 'Bilinmiyor'
                };
                temps.push(newTemp);
                localStorage.setItem('mock_templates', JSON.stringify(temps));
                setTimeout(() => resolve({ success: true, id: newTemp.id }), 500);
            } catch (e) {
                reject(e);
            }
        });
    },

    getTemplates: (status: 'pending' | 'approved' = 'approved') => {
        return new Promise((resolve, reject) => {
            if (!IS_DEV) {
                return reject(new Error('getTemplates backend endpoint not implemented yet.'));
            }
            const temps = JSON.parse(localStorage.getItem('mock_templates') || '[]');
            const filtered = temps.filter((t: any) => t.status === status);
            // Simulate network delay
            setTimeout(() => resolve(filtered), 300);
        });
    },

    approveTemplate: (id: string) => {
        return new Promise(async (resolve, reject) => {
            if (!IS_DEV) {
                return reject(new Error('approveTemplate backend endpoint not implemented yet.'));
            }
            // Verify admin
            const user = await api.getMe().catch(() => null);
            if (!user || user.role !== 'admin') {
                return reject('Yetkisiz işlem!');
            }

            const temps = JSON.parse(localStorage.getItem('mock_templates') || '[]');
            const updated = temps.map((t: any) => t.id === id ? { ...t, status: 'approved' } : t);
            localStorage.setItem('mock_templates', JSON.stringify(updated));
            resolve({ success: true });
        });
    },

    deleteTemplate: (id: string) => {
        return new Promise(async (resolve, reject) => {
            if (!IS_DEV) {
                return reject(new Error('deleteTemplate backend endpoint not implemented yet.'));
            }
            // Verify user or admin
            const user = await api.getMe().catch(() => null);
            if (!user) return reject('Oturum gerekli');

            const temps = JSON.parse(localStorage.getItem('mock_templates') || '[]');
            // Allow if admin OR if owner
            const template = temps.find((t: any) => t.id === id);

            if (!template) {
                // Already deleted?
                return resolve({ success: true });
            }

            if (user.role !== 'admin' && template.username !== user.username) {
                return reject('Bunu silmeye yetkiniz yok');
            }

            const updated = temps.filter((t: any) => t.id !== id);
            localStorage.setItem('mock_templates', JSON.stringify(updated));
            resolve({ success: true });
        });
    }
};
