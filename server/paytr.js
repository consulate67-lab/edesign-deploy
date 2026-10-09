// PayTR iFrame API ile paket satın alma.
// Doküman: https://dev.paytr.com/iframe-api
//  1) /checkout: PayTR'den ödeme jetonu alınır, ön yüz ödeme formunu iframe içinde açar.
//  2) /callback: PayTR ödeme sonucunu "Bildirim URL"ye POST eder; imza doğrulanınca haklar yüklenir.
//     PayTR yanıt olarak düz metin "OK" bekler, almazsa bildirimi tekrarlar.
//  3) /status/:oid: Ödeme penceresi sonucu buradan izler.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { buildInvoiceDraft, istanbulDate, parseBilling } from '../shared/invoice-billing.js';

const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || '';
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || '';
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || '';
const TEST_MODE = process.env.PAYTR_TEST_MODE === '0' ? '0' : '1';
const DEBUG_ON = process.env.PAYTR_DEBUG === '1' ? '1' : '0';
const TOKEN_URL = 'https://www.paytr.com/odeme/api/get-token';
const IFRAME_URL = 'https://www.paytr.com/odeme/guvenli/';

export const paytrConfigured = () => !!(MERCHANT_ID && MERCHANT_KEY && MERCHANT_SALT);

const sign = (text) => createHmac('sha256', MERCHANT_KEY).update(text).digest('base64');

const sameSig = (a, b) => {
    const x = Buffer.from(String(a));
    const y = Buffer.from(String(b));
    return x.length === y.length && timingSafeEqual(x, y);
};

/** PayTR IPv4 ister; proxy arkasındaki "::ffff:1.2.3.4" biçimi sadeleştirilir. */
const clientIp = (req) => String(req.ip || '').replace(/^::ffff:/, '') || '127.0.0.1';

const clip = (s, n) => String(s ?? '').trim().slice(0, n);

export function registerPaytrRoutes(app, { db, authenticateToken, packages, frontendUrl, isAllowedOrigin }) {
    /** Ödeme sonrası dönülecek sayfa: yalnızca izinli ön yüz adresleri, aksi halde varsayılan ön yüz. */
    const returnBase = (raw) => {
        try {
            const u = new URL(String(raw || ''));
            if (isAllowedOrigin(u.origin)) return `${u.origin}${u.pathname}`;
        } catch { /* geçersiz adres */ }
        return frontendUrl;
    };

    const siteOrigin = (() => {
        try { return new URL(frontendUrl).origin; } catch { return 'https://edesign-deploy.com'; }
    })();

    app.get('/api/payment/billing', authenticateToken, async (req, res) => {
        const row = await db.get('SELECT billing_profile FROM users WHERE id = ?', [req.user.id]);
        res.json({ billing: row?.billing_profile ?? null });
    });

    app.post('/api/payment/paytr/checkout', authenticateToken, async (req, res) => {
        const planId = req.body?.plan;
        const plan = packages[planId];
        if (!plan) return res.status(400).json({ error: 'Geçersiz paket.' });
        const parsed = parseBilling(req.body?.billing);
        if (parsed.error) return res.status(400).json({ error: parsed.error });
        const billing = parsed.billing;
        if (!paytrConfigured()) return res.status(503).json({ error: 'Ödeme altyapısı henüz yapılandırılmadı.' });

        const user = await db.get('SELECT id, username, full_name, company_name, phone_number FROM users WHERE id = ?', [req.user.id]);
        if (!user) return res.status(401).json({ error: 'Oturum geçersiz.' });

        const merchantOid = `ED${user.id}${planId.toUpperCase()}${Date.now()}`;
        const amount = Number(plan.price);
        const paymentAmount = String(Math.round(amount * 100));
        const email = clip(user.username, 100);
        const userIp = clientIp(req);
        const basket = Buffer.from(JSON.stringify([
            [`${plan.name} Paketi (${plan.credits} tasarım hakkı)`, amount.toFixed(2), 1],
        ])).toString('base64');
        const noInstallment = '0';
        const maxInstallment = '0';
        const currency = 'TL';
        const back = returnBase(req.body?.returnUrl);

        const fields = {
            merchant_id: MERCHANT_ID,
            user_ip: userIp,
            merchant_oid: merchantOid,
            email,
            payment_amount: paymentAmount,
            paytr_token: sign(`${MERCHANT_ID}${userIp}${merchantOid}${email}${paymentAmount}${basket}${noInstallment}${maxInstallment}${currency}${TEST_MODE}${MERCHANT_SALT}`),
            user_basket: basket,
            debug_on: DEBUG_ON,
            no_installment: noInstallment,
            max_installment: maxInstallment,
            user_name: clip(user.full_name || user.company_name || email, 60),
            user_address: clip(user.company_name || 'Türkiye', 400) || 'Türkiye',
            user_phone: clip(user.phone_number || '05000000000', 20),
            merchant_ok_url: `${back}?payment=success`,
            merchant_fail_url: `${back}?payment=fail`,
            timeout_limit: '30',
            currency,
            test_mode: TEST_MODE,
            lang: 'tr',
        };

        try {
            const r = await fetch(TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(fields),
                signal: AbortSignal.timeout(20000),
            });
            const text = await r.text();
            let data;
            try { data = JSON.parse(text); } catch { data = { status: 'failed', reason: text.slice(0, 300) }; }
            if (data.status !== 'success' || !data.token) {
                console.warn(`[paytr] token hatası user=${user.id} plan=${planId}: ${data.reason}`);
                return res.status(502).json({ error: `Ödeme başlatılamadı: ${data.reason || 'PayTR yanıt vermedi'}` });
            }
            await db.run(
                `INSERT INTO payments (user_id, plan_id, conversation_id, token, amount, status, billing)
                 VALUES (?, ?, ?, ?, ?, 'pending', ?::jsonb)`,
                [user.id, planId, merchantOid, data.token, amount, JSON.stringify(billing)]
            );
            await db.run(
                `UPDATE users
                    SET billing_profile = ?::jsonb,
                        company_name = CASE WHEN company_name IS NULL OR btrim(company_name) = '' THEN ? ELSE company_name END,
                        updated_at = NOW()
                  WHERE id = ?`,
                [JSON.stringify(billing), billing.title, user.id]
            );
            console.log(`[paytr] checkout user=${user.id} plan=${planId} oid=${merchantOid} test=${TEST_MODE}`);
            res.json({ success: true, merchantOid, iframeUrl: IFRAME_URL + data.token, testMode: TEST_MODE === '1' });
        } catch (e) {
            console.error('[paytr] checkout error:', e);
            res.status(502).json({ error: 'Ödeme sağlayıcısına ulaşılamadı, lütfen tekrar deneyin.' });
        }
    });

    app.post('/api/payment/paytr/callback', async (req, res) => {
        const { merchant_oid: oid, status, total_amount: total, hash } = req.body || {};
        if (!paytrConfigured() || !oid || !status || !hash) return res.status(400).send('PAYTR notification failed: missing fields');
        if (!sameSig(hash, sign(`${oid}${MERCHANT_SALT}${status}${total}`))) {
            console.warn(`[paytr] callback imza hatası oid=${oid}`);
            return res.status(400).send('PAYTR notification failed: bad hash');
        }

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const { rows } = await client.query(
                `SELECT * FROM payments WHERE conversation_id = $1 FOR UPDATE`,
                [oid]
            );
            const payment = rows[0];
            if (!payment) {
                await client.query('ROLLBACK');
                console.warn(`[paytr] callback bilinmeyen sipariş oid=${oid}`);
                return res.send('OK');
            }
            if (payment.status !== 'pending') {
                await client.query('ROLLBACK');
                return res.send('OK');
            }
            const plan = packages[payment.plan_id];
            if (status === 'success' && plan) {
                let invoiceStatus = null;
                let invoiceDraft = null;
                if (payment.billing) {
                    const buyer = await client.query(
                        'SELECT username, phone_number FROM users WHERE id = $1',
                        [payment.user_id]
                    );
                    invoiceDraft = buildInvoiceDraft({
                        plan: { ...plan, price: payment.amount },
                        billing: payment.billing,
                        user: buyer.rows[0],
                        merchantOid: oid,
                        issueDate: istanbulDate(),
                        website: siteOrigin,
                    });
                    invoiceStatus = 'ready';
                }
                await client.query(
                    `UPDATE payments
                        SET status = 'success', completed_at = NOW(), invoice_status = $2, invoice_draft = $3::jsonb
                      WHERE id = $1`,
                    [payment.id, invoiceStatus, invoiceDraft ? JSON.stringify(invoiceDraft) : null]
                );
                await client.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [plan.credits, payment.user_id]);
                console.log(`[paytr] ödeme başarılı user=${payment.user_id} oid=${oid} +${plan.credits} hak fatura=${invoiceStatus || 'yok'} test=${req.body.test_mode}`);
            } else {
                await client.query(`UPDATE payments SET status = 'failed', completed_at = NOW() WHERE id = $1`, [payment.id]);
                console.warn(`[paytr] ödeme başarısız oid=${oid} kod=${req.body.failed_reason_code} ${req.body.failed_reason_msg || ''}`);
            }
            await client.query('COMMIT');
            res.send('OK');
        } catch (e) {
            await client.query('ROLLBACK').catch(() => {});
            console.error('[paytr] callback error:', e);
            res.status(500).send('PAYTR notification failed: server error');
        } finally {
            client.release();
        }
    });

    app.get('/api/payment/paytr/callback', (_req, res) => {
        res.type('text/plain').send(paytrConfigured()
            ? 'PayTR bildirim adresi hazir. Bu adres yalnizca PayTR sunucusundan gelen POST bildirimlerini kabul eder.'
            : 'PayTR bildirim adresi: magaza bilgileri henuz tanimlanmadi.');
    });

    app.get('/api/payment/paytr/status/:oid', authenticateToken, async (req, res) => {
        const payment = await db.get(
            'SELECT status FROM payments WHERE conversation_id = ? AND user_id = ?',
            [String(req.params.oid), req.user.id]
        );
        if (!payment) return res.status(404).json({ error: 'Ödeme bulunamadı.' });
        const me = payment.status === 'success'
            ? await db.get('SELECT credits FROM users WHERE id = ?', [req.user.id])
            : null;
        res.json({ status: payment.status, credits: me?.credits ?? null });
    });
}
