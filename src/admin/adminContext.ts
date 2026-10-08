import { createContext, useContext } from 'react';
import type { RealtimeStatus } from '../support/realtime';
import type { AdminRealtime } from './adminApi';
import type { AdminIdentity, PresenceEntry, RemoteSession, SupportTicket } from './contracts';

export type SectionId = 'overview' | 'users' | 'tickets' | 'remote' | 'ai' | 'assistant' | 'gallery' | 'settings';

/** Yapay zekadan "galeriye aktar" ile gelen, kaydedilmemiş tasarım. */
export interface GalleryDraft {
    name: string;
    moduleId: string;
    xslt: string;
    xml: string;
}

export interface AdminCtx {
    identity: AdminIdentity;
    rt: AdminRealtime | null;
    rtStatus: RealtimeStatus;
    presence: PresenceEntry[];
    presenceById: Map<number, PresenceEntry>;
    /** Tüm talepler (mesajsız); WS ticket:update ve 30 sn'lik yoklama ile tazelenir. */
    tickets: SupportTicket[];
    ticketsError: string | null;
    reloadTickets: () => Promise<void>;
    /** Son ticket:update olayı; seq her olayda artar. */
    ticketEvent: { ticketId: number; seq: number } | null;
    remote: RemoteSession[];
    reloadRemote: () => Promise<void>;
    /** Kullanıcıya online destek daveti gönderir ve izleyiciyi açar. */
    inviteUser: (userId: number) => Promise<void>;
    /** Bekleyen / aktif oturuma bağlanır (izleyiciyi açar). */
    connect: (session: RemoteSession) => void;
    go: (section: SectionId, opts?: { ticketId?: number; userId?: number }) => void;
    /** go() ile gelen hedef (ör. açılacak talep); bölüm okuyunca temizler. */
    focus: { ticketId?: number; userId?: number } | null;
    clearFocus: () => void;
    galleryDraft: GalleryDraft | null;
    setGalleryDraft: (d: GalleryDraft | null) => void;
}

export const AdminContext = createContext<AdminCtx | null>(null);

export const useAdmin = () => {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error('useAdmin, AdminContext içinde kullanılmalı');
    return ctx;
};
