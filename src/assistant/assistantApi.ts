import { API_URL } from '../api';

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
        if (!res.ok || data === null) throw new Error(data?.error || 'Asistana şu an ulaşılamıyor.');
        return data as T;
    } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError' && e.message !== 'Failed to fetch') throw e;
        throw new Error('Asistana şu an ulaşılamıyor.');
    } finally {
        clearTimeout(timer);
    }
}

export const assistantApi = {
    info: () => call<AssistantInfo>('/assistant/info'),
    ask: (question: string, session: string, history: HistoryItem[], page: string) =>
        call<AssistantReply>('/assistant/ask', { question, session, history, page }),
    feedback: (id: number, helpful: 1 | -1) => call<{ success: true }>('/assistant/feedback', { id, helpful }),
};
