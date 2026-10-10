import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * UI state that lives across screens (auth, selection, designer).
 * Lightweight — no large payloads. Persisted to localStorage so that
 * theme/locale preferences survive reloads.
 */

export type ThemeMode = 'light' | 'dark';
export type Locale = 'tr' | 'en' | 'de' | 'fr' | 'es';
export const LOCALES: Locale[] = ['tr', 'en', 'de', 'fr', 'es'];

export interface ToastMessage {
    id: string;
    kind: 'info' | 'success' | 'warning' | 'error';
    title: string;
    description?: string;
    /** Auto-dismiss timeout in ms (0 = sticky). */
    ttl?: number;
}

interface UiState {
    theme: ThemeMode;
    locale: Locale;
    /** Seçili ülke (ISO 3166-1 alpha-2); şablon, örnek XML ve kurallar buna göre gelir. İlk girişte bölgeden bulunur. */
    country: string | null;
    sidebarCollapsed: boolean;
    toasts: ToastMessage[];

    // Actions
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
    setLocale: (locale: Locale) => void;
    setCountry: (country: string) => void;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;

    pushToast: (toast: Omit<ToastMessage, 'id'>) => string;
    dismissToast: (id: string) => void;
    clearToasts: () => void;
}

export const useUiStore = create<UiState>()(
    persist(
        (set) => ({
            theme: 'light',
            locale: 'tr',
            country: null,
            sidebarCollapsed: false,
            toasts: [],

            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
            setLocale: (locale) => set({ locale }),
            setCountry: (country) => set({ country }),
            toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
            setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

            pushToast: (toast) => {
                const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
                set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
                return id;
            },
            dismissToast: (id) =>
                set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
            clearToasts: () => set({ toasts: [] }),
        }),
        {
            name: 'edesign-ui',
            storage: createJSONStorage(() => localStorage),
            // Persist only preferences, never transient toasts.
            partialize: (state) => ({
                theme: state.theme,
                locale: state.locale,
                country: state.country,
                sidebarCollapsed: state.sidebarCollapsed,
            }),
        }
    )
);

/**
 * Convenience selector hooks — re-render only when the slice changes.
 * Usage: const theme = useUiStore(s => s.theme);
 */
export const useTheme = () => useUiStore((s) => s.theme);
export const useLocale = () => useUiStore((s) => s.locale);
export const useCountry = () => useUiStore((s) => s.country);
