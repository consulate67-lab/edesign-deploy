import { API_URL, api } from '../api';
import type { SupportContext, SupportMessage, SupportTicket } from '../admin/contracts';

/** api.request dev'de sahte veriye düşer; destek için gerçek sunucu şart, bu yüzden ayrı ve sade bir istemci. */
export class SupportApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export const SUPPORT_UNREACHABLE = 'Destek sunucusuna ulaşılamadı.';

async function request<T>(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
    const token = api.getToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    let res: Response;
    try {
        res = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: controller.signal,
        });
    } catch {
        throw new SupportApiError(SUPPORT_UNREACHABLE, 0);
    } finally {
        clearTimeout(timer);
    }
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new SupportApiError(data?.error || `İstek başarısız (${res.status})`, res.status);
    if (data === null) throw new SupportApiError(SUPPORT_UNREACHABLE, res.status);
    return data as T;
}

export const supportApi = {
    tickets: () => request<SupportTicket[]>('/support/tickets'),
    create: (subject: string, message: string, context: SupportContext) =>
        request<SupportTicket>('/support/tickets', 'POST', { subject, message, context }),
    reply: (ticketId: number, body: string) => request<SupportMessage>(`/support/tickets/${ticketId}/messages`, 'POST', { body }),
    markRead: (ticketId: number) => request<{ success: true }>(`/support/tickets/${ticketId}/read`, 'POST'),
};

/** Talebe otomatik eklenen bağlam: ekran, açık belge, tarayıcı, ekran boyutu. */
export function collectSupportContext(): SupportContext {
    let doc: { moduleName?: string; moduleId?: string } | null = null;
    try { doc = JSON.parse(sessionStorage.getItem('app_doc') || 'null'); } catch { doc = null; }
    return {
        view: sessionStorage.getItem('app_view') ?? undefined,
        url: location.href,
        docName: doc?.moduleName,
        moduleId: doc?.moduleId,
        userAgent: navigator.userAgent,
        screen: `${window.innerWidth}×${window.innerHeight} (ekran ${window.screen.width}×${window.screen.height})`,
    };
}
