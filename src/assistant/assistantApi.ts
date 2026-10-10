import { API_URL } from '../api';
import i18n from '../i18n';
import type { PriceCurrency } from '../pricing';

export type AssistantAction = 'register' | 'login' | 'pricing' | 'docs' | 'faq' | 'product' | 'contact';

export interface AssistantReply {
    id: number;
    answer: string;
    mode: 'kb' | 'ai' | 'cache' | 'hint' | 'none' | 'smalltalk';
    actions: AssistantAction[];
    suggestions: string[];
}

export interface AssistantInfo {
    name: string;
    ai: boolean;
    suggestions: string[];
}

export interface HistoryItem {
    role: 'user' | 'assistant';
    text: string;
}

export interface AskInput {
    question: string;
    session: string;
    history: HistoryItem[];
    page: string;
    /** Yanıt dili (arayüz dili). */
    lang: string;
    /** Fiyatların yazılacağı para birimi. */
    currency: PriceCurrency;
}

async function call<T>(endpoint: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: body === undefined ? 'GET' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: controller.signal,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || data === null) throw new Error(data?.error || i18n.t('assistant.unreachable'));
        return data as T;
    } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError' && e.message !== 'Failed to fetch') throw e;
        throw new Error(i18n.t('assistant.unreachable'));
    } finally {
        clearTimeout(timer);
    }
}

export const assistantApi = {
    info: (lang: string) => call<AssistantInfo>(`/assistant/info?lang=${encodeURIComponent(lang)}`),
    ask: (input: AskInput) => call<AssistantReply>('/assistant/ask', input),
    feedback: (id: number, helpful: 1 | -1) => call<{ success: true }>('/assistant/feedback', { id, helpful }),
};
