/**
 * Yönetim paneli, destek, online destek (ortak ekran) ve tasarım yapay zekası
 * için istemci ↔ sunucu sözleşmesi. server/ tarafı bu biçimleri birebir döndürür.
 *
 * REST (hepsi API_URL altında, JSON):
 *   Yönetici girişi (SMS / Telegram tek kullanımlık kod):
 *     POST /admin/auth/login   {username, password}          → AdminLoginResponse
 *     POST /admin/auth/verify  {challengeId, code}           → AdminVerifyResponse
 *     GET  /admin/auth/me                                    → AdminIdentity
 *   Aşağıdaki /admin/* uçları "Authorization: Bearer <admin token>" ister.
 *     GET  /admin/stats                                      → AdminStats
 *     GET  /admin/users?q=                                   → AdminUserRow[]
 *     GET  /admin/users/:id                                  → AdminUserDetail
 *     GET  /admin/invoices?status=ready|issued|missing|all   → AdminInvoiceList (varsayılan: kesime hazır)
 *     PATCH /admin/invoices/:id InvoiceUpdateInput           → AdminInvoice (taslak yeniden hesaplanır)
 *     POST /admin/invoices/:id/status {status, number?}      → AdminInvoice (issued: EDM fatura no işlenir)
 *     PATCH /admin/users/:id   {credits_delta?}              → AdminUserRow
 *     GET  /admin/tickets?status=open|answered|closed        → SupportTicket[] (messages yok)
 *     GET  /admin/tickets/:id                                → SupportTicket (messages dolu, admin için okundu sayılır)
 *     POST /admin/tickets/:id/messages {body}                → SupportMessage
 *     PATCH /admin/tickets/:id {status}                      → SupportTicket
 *     GET  /admin/remote                                     → RemoteSession[] (son 50)
 *     POST /admin/remote {userId}                            → RemoteSession (kullanıcıya davet gider)
 *     GET  /admin/gallery                                    → GalleryDesign[]
 *     POST /admin/gallery  GalleryDesignInput                → GalleryDesign
 *     PUT  /admin/gallery/:id GalleryDesignInput             → GalleryDesign
 *     DELETE /admin/gallery/:id                              → {success:true}
 *     GET  /admin/ai/memory?doc_type_id=&limit=              → AiMemoryEntry[] (yeniden eskiye)
 *     POST /admin/ai/memory AiMemoryInput                    → AiMemoryEntry
 *     PATCH /admin/ai/memory/:id {rating?, published?, gallery_id?} → AiMemoryEntry
 *     GET  /admin/settings/status                            → AdminSettingsStatus
 *     POST /admin/settings/telegram-test                     → {success:true}
 *   Kullanıcı (normal oturum token'ı):
 *     POST /support/tickets {subject, message, context?}     → SupportTicket (messages dolu)
 *     GET  /support/tickets                                  → SupportTicket[] (messages dolu)
 *     POST /support/tickets/:id/messages {body}              → SupportMessage
 *     POST /support/tickets/:id/read                         → {success:true}
 *     POST /support/remote {ticketId?, note?}                → RemoteSession (kullanıcı onayıyla açılır)
 *     GET  /support/remote/active                            → RemoteSession | null
 *   Herkese açık:
 *     GET  /gallery                                          → GalleryDesign[] (yalnızca published)
 *
 * WebSocket: wsUrl(token) (src/api.ts). Mesajlar JSON, `t` alanıyla ayrılır (WsMessage).
 */

export interface AdminLoginResponse {
    challengeId: string;
    /** Kodun gönderildiği kanal; 'log' = yalnızca sunucu günlüğüne yazıldı, 'dev' = geliştirmede yanıtta döner. */
    channel: 'sms' | 'telegram' | 'log' | 'dev';
    /** Maskeli hedef: "+90 5** *** 12 34" veya "Telegram". */
    destination?: string;
    devCode?: string;
    /** Saniye. */
    expiresIn: number;
}

export interface AdminIdentity { id: number; username: string; full_name: string | null }
export interface AdminVerifyResponse { token: string; user: AdminIdentity }

export interface AdminStats {
    users: number;
    newUsers7d: number;
    designs: number;
    paidDesigns: number;
    openTickets: number;
    onlineUsers: number;
    pendingRemote: number;
    revenueTotal: number;
    invoicesReady: number;
    paidWithoutBilling: number;
    galleryDesigns: number;
}

export interface AdminUserRow {
    id: number;
    username: string;
    full_name: string | null;
    company_name: string | null;
    phone_number: string | null;
    role: string;
    credits: number;
    free_design_used: number;
    created_at: string;
    last_seen_at: string | null;
    design_count: number;
    paid_design_count: number;
    payment_total: number;
    ticket_count: number;
    online: boolean;
    current_view: string | null;
}

export interface AdminUserDetail extends AdminUserRow {
    designs: { id: number; name: string; module_id: string; status: string; paid: boolean; download_count: number; updated_at: string }[];
    payments: { id: number; plan_id: string; amount: number; currency: string; status: string; invoice_status: string | null; created_at: string; completed_at: string | null }[];
    tickets: SupportTicket[];
}

export type InvoicePartyType = 'company' | 'sole';

export interface InvoiceBilling {
    partyType: InvoicePartyType;
    title: string;
    taxId: string;
    scheme: 'VKN' | 'TCKN';
    taxOffice: string;
    city: string;
    address: string;
}

export type InvoiceDocumentMode = 'auto' | 'EFATURA' | 'EARSIV';

export interface InvoiceDraft {
    integrator: 'edm';
    issueDate: string;
    currency: string;
    /** Eski taslaklarda yok. */
    notes?: string[];
    document: {
        /** Eski taslaklarda yok (= auto). */
        mode?: InvoiceDocumentMode;
        preferred: 'EFATURA' | 'EARSIV';
        profileId: string;
        invoiceTypeCode: string;
        fallback: string | null;
        checkUserBeforeSend: boolean;
    };
    customer: InvoiceBilling & { email: string | null; phone: string | null };
    supplier: { source: string; note: string };
    lines: {
        id: number;
        name: string;
        description: string;
        quantity: number;
        unitCode: string;
        unitPrice: number;
        vatRate: number;
        vatAmount: number;
        lineExtension: number;
    }[];
    totals: {
        taxExclusive: number;
        vat: number;
        taxInclusive: number;
        payable: number;
        vatRate: number;
        pricesIncludeVat: boolean;
    };
    payment: {
        meansCode: string;
        channel: string;
        agent: string;
        merchantOid: string | null;
        internetSale: boolean;
        website: string | null;
    };
    edm: {
        method: string;
        earchive: boolean;
        internetSales: boolean;
        receiverVkn: string;
        invoiceDate: string;
        payableAmount: number;
        checkUserBeforeSend: boolean;
    };
}

export interface AdminInvoice {
    id: number;
    user_id: number;
    username: string;
    full_name: string | null;
    phone_number: string | null;
    plan_id: string;
    amount: number;
    currency: string;
    merchant_oid: string | null;
    paid_at: string | null;
    invoice_status: 'ready' | 'issued' | null;
    invoice_number: string | null;
    invoice_issued_at: string | null;
    /** Fatura bilgisi alınmadan ödenmişse null. */
    billing: InvoiceBilling | null;
    draft: InvoiceDraft | null;
}

export type InvoiceScope = 'ready' | 'issued' | 'missing' | 'all';

export interface AdminInvoiceList {
    items: AdminInvoice[];
    paidWithoutBilling: number;
}

export interface InvoiceUpdateInput {
    billing: Omit<InvoiceBilling, 'scheme'>;
    documentMode: InvoiceDocumentMode;
    /** YYYY-MM-DD, bugünden ileri olamaz. */
    issueDate: string;
    note: string;
}

export type TicketStatus = 'open' | 'answered' | 'closed';

export interface SupportContext {
    view?: string;
    url?: string;
    docName?: string;
    moduleId?: string;
    userAgent?: string;
    screen?: string;
}

export interface SupportMessage {
    id: number;
    ticket_id: number;
    sender: 'user' | 'admin';
    body: string;
    via: 'web' | 'telegram';
    created_at: string;
}

export interface TicketUser { id: number; username: string; full_name: string | null; company_name: string | null; phone_number: string | null }

export interface SupportTicket {
    id: number;
    user_id: number;
    subject: string;
    status: TicketStatus;
    context: SupportContext | null;
    created_at: string;
    updated_at: string;
    last_message_at: string;
    last_message?: string | null;
    unread_for_admin: number;
    unread_for_user: number;
    user?: TicketUser;
    messages?: SupportMessage[];
}

export type RemoteStatus = 'requested' | 'active' | 'ended' | 'declined';

export interface RemoteSession {
    id: string;
    user_id: number;
    ticket_id: number | null;
    status: RemoteStatus;
    initiated_by: 'user' | 'admin';
    note: string | null;
    created_at: string;
    started_at: string | null;
    ended_at: string | null;
    user?: TicketUser;
}

export interface GalleryDesignInput {
    name: string;
    description: string;
    /** WIZARD_DOC_TYPES id'si (fatura, arsiv, irsaliye, …). */
    doc_type_id: string;
    /** XSLT editör modülü. */
    module_id: string;
    /** src/sector-templates/types.ts SectorId / CategoryId. */
    sector: string;
    category: string;
    accent: string;
    tags: string[];
    xslt: string;
    xml: string;
    published: boolean;
    source: 'ai' | 'manual';
}

export interface GalleryDesign extends GalleryDesignInput {
    id: number;
    created_at: string;
    updated_at: string;
}

export interface AiMemoryInput {
    doc_type_id: string;
    category: string;
    sector: string;
    /** Yapay zekanın cevaplardan kurduğu metin istem. */
    prompt: string;
    answers: Record<string, unknown>;
    /** Üreticinin kullandığı tasarım parametreleri (stil, renk, bölümler …). */
    params: Record<string, unknown>;
    rating?: -1 | 0 | 1;
}

export interface AiMemoryEntry extends AiMemoryInput {
    id: number;
    rating: -1 | 0 | 1;
    published: boolean;
    gallery_id: number | null;
    created_at: string;
}

export interface AdminSettingsStatus {
    telegram: { configured: boolean; chatConfigured: boolean; polling: boolean; botUsername: string | null };
    sms: { provider: string | null; configured: boolean };
    otpChannel: AdminLoginResponse['channel'];
}

export interface PresenceEntry {
    userId: number;
    username: string;
    full_name: string | null;
    company_name: string | null;
    view: string | null;
    url: string | null;
    title: string | null;
    connectedAt: string;
    lastActiveAt: string;
}

/** Yöneticinin ortak ekranda kullanıcı sayfasına uyguladığı işlem; id = rrweb mirror düğüm id'si. */
export type RemoteAction =
    | { type: 'click'; id: number }
    | { type: 'input'; id: number; value: string }
    | { type: 'check'; id: number; checked: boolean }
    | { type: 'select'; id: number; value: string }
    | { type: 'key'; id?: number; key: string }
    | { type: 'scroll'; id?: number; x: number; y: number }
    /** Yönetici imlecinin kullanıcı görünümündeki konumu (CSS px, viewport'a göre). */
    | { type: 'pointer'; x: number; y: number };

export type WsMessage =
    // kullanıcı → sunucu: bulunduğu ekran (bağlanınca ve ekran değişince)
    | { t: 'hello'; view?: string | null; url?: string | null; title?: string | null }
    // sunucu → yönetici: çevrimiçi kullanıcılar (bağlanınca ve her değişiklikte)
    | { t: 'presence'; users: PresenceEntry[] }
    // sunucu → yönetici: kullanıcı online destek istedi / oturum durumu değişti
    | { t: 'remote:request'; session: RemoteSession }
    // sunucu → kullanıcı: yönetici bağlanmak istiyor, kullanıcı onaylamalı
    | { t: 'remote:invite'; sessionId: string; adminName: string }
    // kullanıcı → sunucu
    | { t: 'remote:accept'; sessionId: string }
    | { t: 'remote:decline'; sessionId: string }
    // yönetici → sunucu: kullanıcının onayladığı / istediği oturuma bağlan
    | { t: 'remote:join'; sessionId: string }
    // sunucu → kullanıcı: yönetici bağlandı, ekran paylaşımı (rrweb kaydı) başlasın
    | { t: 'remote:joined'; sessionId: string; adminName: string }
    // sunucu → iki taraf
    | { t: 'remote:status'; sessionId: string; status: RemoteStatus; reason?: string }
    // iki taraf → sunucu: oturumu bitir
    | { t: 'remote:end'; sessionId: string }
    // kullanıcı → sunucu → yönetici: rrweb olayları
    | { t: 'rr'; sessionId: string; events: unknown[] }
    // yönetici → sunucu → kullanıcı
    | { t: 'ctl'; sessionId: string; action: RemoteAction }
    // yönetici → sunucu → kullanıcı: tam anlık görüntü iste (record.takeFullSnapshot)
    | { t: 'snapshot'; sessionId: string }
    // iki yönde aktarılır; sunucu `from` ve `at` alanlarını kendisi doldurur
    | { t: 'chat'; sessionId: string; text: string; from?: 'user' | 'admin'; at?: string }
    // sunucu → kullanıcı ve yöneticiler: destek talebinde yeni mesaj / durum
    | { t: 'ticket:update'; ticketId: number }
    | { t: 'error'; message: string }
    | { t: 'ping' }
    | { t: 'pong' };

// ---------------------------------------------------------------- site asistanı (Sarp)

export type AssistantActionCode = 'register' | 'login' | 'pricing' | 'docs' | 'faq' | 'product' | 'contact';
export type AssistantKbStatus = 'active' | 'pending' | 'disabled';

export interface AssistantOverview {
    ai: { configured: boolean; model: string; provider: string; dailyLimit: number; usedToday: number };
    stats: {
        total: number; today: number; unanswered: number; negative: number; positive: number; ai: number;
        kbActive: number; kbPending: number; builtin: number;
    };
}

export interface AssistantKbEntry {
    id: number;
    question: string;
    answer: string;
    keywords: string;
    actions: AssistantActionCode[];
    status: AssistantKbStatus;
    source: 'admin' | 'learned';
    hits: number;
    created_at: string;
    updated_at: string;
}

export interface AssistantKbInput {
    question: string;
    answer: string;
    keywords: string;
    actions: AssistantActionCode[];
    status: AssistantKbStatus;
    log_id?: number;
}

export interface AssistantBuiltinEntry {
    id: string;
    question: string;
    answer: string;
    actions: AssistantActionCode[];
}

export interface AssistantLog {
    id: number;
    question: string;
    answer: string;
    mode: 'kb' | 'ai' | 'cache' | 'hint' | 'none' | 'smalltalk';
    score: number | null;
    helpful: 1 | -1 | null;
    resolved: boolean;
    page: string | null;
    created_at: string;
}

export type AssistantLogFilter = 'review' | 'unanswered' | 'negative' | 'positive' | 'all';
