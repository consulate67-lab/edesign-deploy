/**
 * Üye tasarımları oluşturulduktan DESIGN_RETENTION_DAYS gün sonra silinir.
 *
 * Onaylı tasarımın satırı silinmez, yalnız içeriği (XSLT, XML, bölümler) boşaltılır:
 * müşterinin elindeki XSLT'nin çevrimiçi lisans mührü satırı license_token ile arar,
 * satır yoksa faturaya TEST damgası basılır.
 */
export const DESIGN_RETENTION_DAYS = 7;
const PURGE_INTERVAL_MS = 60 * 60_000;

export const RETENTION_INTERVAL = `INTERVAL '${DESIGN_RETENTION_DAYS} days'`;

export const PURGE_PAID_DESIGN_SQL = `
    UPDATE designs SET xslt_content = NULL, xml_content = NULL, custom_content = NULL, sections_json = NULL,
           purged_at = NOW(), updated_at = NOW()
     WHERE id = ?`;

export const purgeExpiredDesigns = async (db) => {
    const drafts = await db.run(`DELETE FROM designs WHERE paid_at IS NULL AND expires_at <= NOW()`);
    const paid = await db.run(
        `UPDATE designs SET xslt_content = NULL, xml_content = NULL, custom_content = NULL, sections_json = NULL, purged_at = NOW()
          WHERE paid_at IS NOT NULL AND purged_at IS NULL AND expires_at <= NOW()`
    );
    if (drafts.changes || paid.changes) {
        console.log(`[designs] saklama süresi doldu: ${drafts.changes} taslak silindi, ${paid.changes} onaylı tasarımın içeriği boşaltıldı`);
    }
};

export const startDesignRetention = (db) => {
    const run = () => purgeExpiredDesigns(db).catch(e => console.error('[designs] temizlik hatası:', e.message));
    void run();
    setInterval(run, PURGE_INTERVAL_MS).unref?.();
};
