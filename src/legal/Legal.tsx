/**
 * Designer 2.0 / Landing — Yasal metinler (Sprint 1, 2026-10-02)
 *
 * KVKK Aydınlatma Metni, Kullanıcı Sözleşmesi, Çerez Politikası.
 * Her biri modal/long-form olarak gösterilir.
 *
 * Not: Hukuki metinler generic taslaktır. Selim'in kendi avukatından
 * kontrolü sonrası güncellenmelidir.
 */

import React from 'react';
import { MapPin, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { theme } from '../theme';

export const CONTACT = {
    email: 'destek@edxdocu.com',
    phone: '0533 666 01 25',
    phoneHref: 'tel:+905336660125',
    whatsapp: 'https://wa.me/905336660125',
    address: 'Merkez Mahallesi Ege Sokak No:4 Kağıthane / İstanbul',
} as const;

const MAP_QUERY = encodeURIComponent('Merkez Mahallesi Ege Sokak No:4, Kağıthane, İstanbul');

const baseTextStyle: React.CSSProperties = {
    fontSize: '14px',
    lineHeight: 1.6,
    color: theme.textMuted,
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    color: theme.text,
    marginTop: '24px',
    marginBottom: '8px',
};

// ============================================================================
// KVKK Aydınlatma Metni
// ============================================================================

export const KVKKModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <LegalModal title="KVKK Aydınlatma Metni" onClose={onClose}>
        <p style={baseTextStyle}>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, kişisel
            verilerinizin işlenmesi hakkında sizi aydınlatmak istiyoruz.
        </p>

        <h2 style={sectionTitleStyle}>1. Veri Sorumlusu</h2>
        <p style={baseTextStyle}>
            Veri sorumlusu sıfatıyla, e-Belge Tasarımcı platformu ("Platform") olarak
            sizinle iletişim kurmak, tasarım hizmeti sunmak ve yasal yükümlülüklerimizi
            yerine getirmek amacıyla kişisel verilerinizi işlemekteyiz.
        </p>

        <h2 style={sectionTitleStyle}>2. İşlenen Kişisel Veriler</h2>
        <ul style={baseTextStyle}>
            <li>Kimlik bilgileri: Ad, soyad</li>
            <li>İletişim bilgileri: E-posta, telefon</li>
            <li>Firma bilgileri: Şirket unvanı, vergi numarası</li>
            <li>Hesap bilgileri: Kullanıcı adı, şifre (hash'lenmiş)</li>
            <li>İşlem bilgileri: Tasarım kayıtları, ödeme geçmişi</li>
            <li>Log bilgileri: IP adresi, erişim zamanı</li>
        </ul>

        <h2 style={sectionTitleStyle}>3. İşleme Amaçları</h2>
        <ul style={baseTextStyle}>
            <li>Tasarım hizmetinin sunulması</li>
            <li>Üyelik işlemlerinin yürütülmesi</li>
            <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, ticari kayıt)</li>
            <li>Müşteri destek hizmetleri</li>
        </ul>

        <h2 style={sectionTitleStyle}>4. Veri Saklama Süresi</h2>
        <p style={baseTextStyle}>
            Kişisel verileriniz, ilgili mevzuatın gerektirdiği süre ile sınırlı olarak
            saklanır. Tasarım verileriniz hesap aktif olduğu sürece sistemimizde tutulur;
            hesap silindiğinde anonimleştirilir.
        </p>

        <h2 style={sectionTitleStyle}>5. Haklarınız</h2>
        <p style={baseTextStyle}>
            KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:
        </p>
        <ul style={baseTextStyle}>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde/dışında aktarıldığı üçüncü kişileri öğrenme</li>
            <li>Eksik/yanlış işlenen verilerin düzeltilmesini isteme</li>
            <li>Şartlar oluştuğunda verilerin silinmesini/yok edilmesini isteme</li>
            <li>Otomatik sistemlerle aleyhine sonuç doğan analizlere itiraz etme</li>
        </ul>
        <p style={baseTextStyle}>
            Bu haklarınızı kullanmak için <a href={`mailto:${CONTACT.email}`} style={{ color: theme.primary, fontWeight: 700 }}>{CONTACT.email}</a> adresine
            yazılı talep ile başvurabilirsiniz.
        </p>

        <p style={{ ...baseTextStyle, marginTop: '24px', fontSize: '12px', color: theme.textSubtle }}>
            Son güncelleme: 2026-10-02 · Bu metin taslak niteliğindedir, kesin metin için
            şirket avukatınıza danışın.
        </p>
    </LegalModal>
);

// ============================================================================
// Kullanıcı Sözleşmesi
// ============================================================================

export const KullaniciSozlesmesiModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <LegalModal title="Kullanıcı Sözleşmesi" onClose={onClose}>
        <p style={baseTextStyle}>
            Bu kullanıcı sözleşmesi ("Sözleşme"), e-Belge Tasarımcı platformunu
            ("Platform") kullanımınıza ilişkin hükümleri düzenler. Platform'a kayıt olarak
            aşağıdaki hükümleri kabul etmiş sayılırsınız.
        </p>

        <h2 style={sectionTitleStyle}>1. Hizmet Tanımı</h2>
        <p style={baseTextStyle}>
            Platform, kullanıcılara e-Belge (e-Fatura, e-Arşiv vb.) görsel tasarımı
            oluşturma, düzenleme ve XSLT olarak dışa aktarma hizmeti sunar. Tasarımlar
            kredi sistemi ile kullanılır.
        </p>

        <h2 style={sectionTitleStyle}>2. Üyelik ve Kredi Sistemi</h2>
        <ul style={baseTextStyle}>
            <li>Tasarım hakkı (kredi) yalnızca üye girişi yapılmış hesaplarla satın alınabilir.</li>
            <li>Paketler tek seferlik ödemedir: One 1, Basic 10, Pro 25 tasarım hakkı içerir; haklar süresizdir.</li>
            <li>Krediler iade edilmez, başka hesaplara aktarılamaz.</li>
            <li>Tasarım kayıtları hesap aktif olduğu sürece korunur.</li>
        </ul>

        <h2 style={sectionTitleStyle}>3. Kullanıcı Yükümlülükleri</h2>
        <ul style={baseTextStyle}>
            <li>Platform'u yasalara uygun şekilde kullanmak</li>
            <li>Başkalarının fikri mülkiyetini ihlal etmemek</li>
            <li>Sahte veya yanıltıcı belge tasarımı oluşturmamak</li>
            <li>Hesap bilgilerinin güvenliğini sağlamak</li>
        </ul>

        <h2 style={sectionTitleStyle}>4. Fikri Mülkiyet</h2>
        <p style={baseTextStyle}>
            Kullanıcının oluşturduğu tasarımlar kullanıcıya aittir. Platform, kullanıcının
            tasarımlarını yalnızca hizmet sunmak amacıyla kullanır. Platform'un arayüz,
            yazılım ve şablonları Platform'un fikri mülkiyetindedir.
        </p>

        <h2 style={sectionTitleStyle}>5. Sorumluluk Sınırı</h2>
        <p style={baseTextStyle}>
            Platform, tasarımların GİB (Gelir İdaresi Başkanlığı) veya diğer resmi
            kurumların düzenlemelerine uygunluğunu garanti etmez. Kullanıcı, oluşturduğu
            tasarımların yasal uygunluğunu teyit etmekle yükümlüdür.
        </p>

        <h2 style={sectionTitleStyle}>6. Sözleşmenin Değiştirilmesi</h2>
        <p style={baseTextStyle}>
            Platform, bu sözleşmeyi önceden bildirimle değiştirme hakkını saklı tutar.
            Değişiklikler Platform'da yayımlandığı tarihte yürürlüğe girer.
        </p>

        <p style={{ ...baseTextStyle, marginTop: '24px', fontSize: '12px', color: theme.textSubtle }}>
            Son güncelleme: 2026-10-02 · Taslak metin.
        </p>
    </LegalModal>
);

// ============================================================================
// Çerez Politikası
// ============================================================================

export const CerezPolitikasiModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <LegalModal title="Çerez Politikası" onClose={onClose}>
        <p style={baseTextStyle}>
            Platform, kullanıcı deneyimini geliştirmek, performans ölçümü yapmak ve
            güvenliği sağlamak amacıyla çerezler (cookies) kullanmaktadır.
        </p>

        <h2 style={sectionTitleStyle}>1. Zorunlu Çerezler</h2>
        <p style={baseTextStyle}>
            Platform'un çalışması için zorunlu olan çerezlerdir. Oturum açma, güvenlik
            ve dolandırıcılık önleme için kullanılır. Bu çerezler devre dışı bırakılamaz.
        </p>

        <h2 style={sectionTitleStyle}>2. Performans Çerezleri</h2>
        <p style={baseTextStyle}>
            Sayfa yükleme süreleri, hata oranları gibi anonim performans verilerini
            toplar. Kişisel bilgi içermez.
        </p>

        <h2 style={sectionTitleStyle}>3. Çerez Tercihleri</h2>
        <p style={baseTextStyle}>
            Tarayıcınızın ayarlarından çerezleri yönetebilirsiniz. Ancak zorunlu çerezlerin
            devre dışı bırakılması Platform'un düzgün çalışmamasına neden olabilir.
        </p>

        <p style={{ ...baseTextStyle, marginTop: '24px', fontSize: '12px', color: theme.textSubtle }}>
            Son güncelleme: 2026-10-02.
        </p>
    </LegalModal>
);

// ============================================================================
// İletişim
// ============================================================================

const contactRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '14px 16px',
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    borderRadius: 14,
    color: theme.text,
    textDecoration: 'none',
    fontSize: 14,
    lineHeight: 1.5,
};

const contactLabel: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.textSubtle,
    marginBottom: 2,
};

export const IletisimModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <LegalModal title="İletişim" onClose={onClose}>
        <div style={{ display: 'grid', gap: 10 }}>
            <div data-contact-address style={contactRow}>
                <MapPin size={20} color={theme.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                    <span style={contactLabel}>Adres</span>
                    {CONTACT.address}
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                <a data-contact-phone href={CONTACT.phoneHref} style={contactRow}>
                    <Phone size={20} color={theme.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <span style={contactLabel}>Telefon</span>
                        {CONTACT.phone}
                    </div>
                </a>
                <a data-contact-email href={`mailto:${CONTACT.email}`} style={contactRow}>
                    <Mail size={20} color={theme.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <span style={contactLabel}>E-posta</span>
                        {CONTACT.email}
                    </div>
                </a>
            </div>
            <a data-contact-whatsapp href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" style={{ ...contactRow, background: '#dcfce7', borderColor: '#bbf7d0', color: '#15803d', fontWeight: 700, alignItems: 'center' }}>
                <MessageCircle size={20} style={{ flexShrink: 0 }} />
                WhatsApp ile yazın
            </a>
        </div>

        <div style={{ marginTop: 16, borderRadius: 16, overflow: 'hidden', border: `1px solid ${theme.border}`, background: theme.surfaceAlt }}>
            <iframe
                data-contact-map
                title="Adres haritası"
                src={`https://maps.google.com/maps?q=${MAP_QUERY}&z=16&hl=tr&output=embed`}
                width="100%"
                height="320"
                style={{ display: 'block', border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
            />
        </div>
        <a
            href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 13, fontWeight: 600, color: theme.primary, textDecoration: 'none' }}
        >
            Google Haritalar'da aç <ExternalLink size={13} />
        </a>
    </LegalModal>
);

// ============================================================================
// LegalModal wrapper — paylaşılan modal tasarımı
// ============================================================================

interface LegalModalProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ title, children, onClose }) => (
    <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
        }}
    >
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                background: theme.surface,
                borderRadius: '20px',
                border: `1px solid ${theme.border}`,
                maxWidth: '720px',
                maxHeight: '85vh',
                width: '100%',
                overflowY: 'auto',
                padding: '32px',
                color: theme.text,
                boxShadow: theme.shadowLg,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: theme.text }}>{title}</h1>
                <button
                    onClick={onClose}
                    aria-label="Kapat"
                    style={{
                        background: theme.surface,
                        border: `1px solid ${theme.borderStrong}`,
                        borderRadius: '8px',
                        color: theme.textMuted,
                        cursor: 'pointer',
                        padding: '6px 12px',
                        fontSize: '14px',
                        fontWeight: 600,
                    }}
                >
                    ✕ Kapat
                </button>
            </div>
            <div>{children}</div>
        </div>
    </div>
);

export default LegalModal;