import { API_URL } from '../api';
import type {
    AdminIdentity, AdminLoginResponse, AdminSettingsStatus, AdminStats, AdminUserDetail, AdminUserRow,
    AdminVerifyResponse, AiMemoryEntry, AiMemoryInput, GalleryDesign, GalleryDesignInput, RemoteSession,
    SupportMessage, SupportTicket, TicketStatus,
} from './contracts';

/** Yönetici oturumu kullanıcı oturumundan ayrıdır; aynı sekmede ikisi birlikte açık kalabilir. */
const TOKEN_KEY = 'admin_token';
const IDENTITY_KEY = 'admin_identity';

export type AdminRealtime = import('../support/realtime').Realtime;

export class AdminApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

let unauthorizedHandler: (() => void) | null = null;

export const adminSession = {
    getToken: () => sessionStorage.getItem(TOKEN_KEY),
    getIdentity: (): AdminIdentity | null => {
        try { return JSON.parse(sessionStorage.getItem(IDENTITY_KEY) || 'null'); } catch { return null; }
    },
    set: (token: string, user: AdminIdentity) => {
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(IDENTITY_KEY, JSON.stringify(user));
    },
    clear: () => {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(IDENTITY_KEY);
    },
    /** Oturum düştüğünde (401/403) çağrılır; AdminApp giriş ekranına döner. */
    onUnauthorized: (fn: (() => void) | null) => { unauthorizedHandler = fn; },
};

interface RequestOpts {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    /** Giriş uçlarında 401 "hatalı şifre" demektir, oturumu kapatmaz. */
    auth?: boolean;
}

async function request<T>(endpoint: string, { method = 'GET', body, auth = true }: RequestOpts = {}): Promise<T> {
    const token = adminSession.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    let res: Response;
    try {
        res = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: controller.signal,
        });
    } catch {
        throw new AdminApiError('Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.', 0);
    } finally {
        clearTimeout(timer);
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        if (auth && (res.status === 401 || res.status === 403)) {
            adminSession.clear();
            unauthorizedHandler?.();
            throw new AdminApiError(data.error || 'Oturumunuzun süresi doldu, lütfen tekrar giriş yapın.', res.status);
        }
        throw new AdminApiError(data.error || `İstek başarısız (${res.status})`, res.status);
    }
    return data as T;
}

const qs = (params: Record<string, string | number | undefined | null>) => {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') s.set(k, String(v));
    const str = s.toString();
    return str ? `?${str}` : '';
};

export const adminApi = {
    login: (username: string, password: string) =>
        request<AdminLoginResponse>('/admin/auth/login', { method: 'POST', body: { username, password }, auth: false }),
    verify: (challengeId: string, code: string) =>
        request<AdminVerifyResponse>('/admin/auth/verify', { method: 'POST', body: { challengeId, code }, auth: false }),
    me: () => request<AdminIdentity>('/admin/auth/me'),

    stats: () => request<AdminStats>('/admin/stats'),

    users: (q?: string) => request<AdminUserRow[]>(`/admin/users${qs({ q })}`),
    user: (id: number) => request<AdminUserDetail>(`/admin/users/${id}`),
    changeCredits: (id: number, delta: number) =>
        request<AdminUserRow>(`/admin/users/${id}`, { method: 'PATCH', body: { credits_delta: delta } }),

    tickets: (status?: TicketStatus) => request<SupportTicket[]>(`/admin/tickets${qs({ status })}`),
    ticket: (id: number) => request<SupportTicket>(`/admin/tickets/${id}`),
    reply: (id: number, body: string) =>
        request<SupportMessage>(`/admin/tickets/${id}/messages`, { method: 'POST', body: { body } }),
    setTicketStatus: (id: number, status: TicketStatus) =>
        request<SupportTicket>(`/admin/tickets/${id}`, { method: 'PATCH', body: { status } }),

    remoteSessions: () => request<RemoteSession[]>('/admin/remote'),
    inviteRemote: (userId: number) => request<RemoteSession>('/admin/remote', { method: 'POST', body: { userId } }),

    gallery: () => request<GalleryDesign[]>('/admin/gallery'),
    createGallery: (input: GalleryDesignInput) => request<GalleryDesign>('/admin/gallery', { method: 'POST', body: input }),
    updateGallery: (id: number, input: GalleryDesignInput) =>
        request<GalleryDesign>(`/admin/gallery/${id}`, { method: 'PUT', body: input }),
    deleteGallery: (id: number) => request<{ success: true }>(`/admin/gallery/${id}`, { method: 'DELETE' }),

    aiMemory: (docTypeId?: string, limit?: number) =>
        request<AiMemoryEntry[]>(`/admin/ai/memory${qs({ doc_type_id: docTypeId, limit })}`),
    saveAiMemory: (input: AiMemoryInput) => request<AiMemoryEntry>('/admin/ai/memory', { method: 'POST', body: input }),
    updateAiMemory: (id: number, patch: { rating?: -1 | 0 | 1; published?: boolean; gallery_id?: number | null }) =>
        request<AiMemoryEntry>(`/admin/ai/memory/${id}`, { method: 'PATCH', body: patch }),

    settingsStatus: () => request<AdminSettingsStatus>('/admin/settings/status'),
    telegramTest: () => request<{ success: true }>('/admin/settings/telegram-test', { method: 'POST' }),
};

/** Yönetici WebSocket bağlantısı (presence, online destek, talep bildirimleri). */
export async function createAdminRealtime(): Promise<AdminRealtime> {
    const { createRealtime } = await import('../support/realtime');
    return createRealtime(() => sessionStorage.getItem(TOKEN_KEY));
}
