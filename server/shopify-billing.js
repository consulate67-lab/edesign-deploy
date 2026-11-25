/**
 * Shopify one-time Billing + offline token exchange.
 * Public app + Admin access token gerekir; Custom distribution Billing API kullanamaz.
 */
export const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';
const API_VERSION = SHOPIFY_API_VERSION;

export function shopifyHost(shopDomain) {
    const s = String(shopDomain || '').toLowerCase().replace(/^https?:\/\//, '');
    if (s.includes('.myshopify.com')) return s.split('/')[0];
    return `${s.replace(/\/$/, '')}.myshopify.com`;
}

export async function exchangeOfflineToken({ shop, sessionToken, apiKey, apiSecret }) {
    const host = shopifyHost(shop);
    const res = await fetch(`https://${host}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            client_id: apiKey,
            client_secret: apiSecret,
            grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
            subject_token: sessionToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
            requested_token_type: 'urn:shopify:params:oauth:token-type:offline-access-token',
        }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
        const msg = data.error_description || data.error || res.statusText || 'Token exchange başarısız';
        throw new Error(msg);
    }
    return {
        accessToken: data.access_token,
        scope: data.scope || '',
    };
}

export async function adminGraphql({ shop, accessToken, query, variables }) {
    const host = shopifyHost(shop);
    const res = await fetch(`https://${host}/admin/api/${API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ query, variables }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(json?.errors?.[0]?.message || `Admin GraphQL HTTP ${res.status}`);
    }
    if (json.errors?.length) {
        throw new Error(json.errors.map((e) => e.message).join('; '));
    }
    return json.data;
}

const CREATE_CHARGE = `
mutation AppPurchaseOneTimeCreate($name: String!, $price: MoneyInput!, $returnUrl: URL!, $test: Boolean) {
  appPurchaseOneTimeCreate(name: $name, returnUrl: $returnUrl, price: $price, test: $test) {
    userErrors { field message }
    confirmationUrl
    appPurchaseOneTime { id createdAt status }
  }
}`;

const CHARGE_STATUS = `
query AppPurchaseOneTime($id: ID!) {
  node(id: $id) {
    ... on AppPurchaseOneTime {
      id
      name
      status
      test
    }
  }
}`;

export async function createOneTimePurchase({
    shop,
    accessToken,
    name,
    amount,
    currencyCode = 'USD',
    returnUrl,
    test = false,
}) {
    const data = await adminGraphql({
        shop,
        accessToken,
        query: CREATE_CHARGE,
        variables: {
            name: String(name).slice(0, 120),
            price: { amount: Number(amount), currencyCode },
            returnUrl,
            test: Boolean(test),
        },
    });
    const payload = data?.appPurchaseOneTimeCreate;
    if (!payload) throw new Error('appPurchaseOneTimeCreate yanıtı boş.');
    if (payload.userErrors?.length) {
        throw new Error(payload.userErrors.map((e) => e.message).join('; '));
    }
    if (!payload.confirmationUrl || !payload.appPurchaseOneTime?.id) {
        throw new Error('confirmationUrl veya charge id yok (Custom distribution Billing desteklemez).');
    }
    return {
        confirmationUrl: payload.confirmationUrl,
        chargeGid: payload.appPurchaseOneTime.id,
        status: payload.appPurchaseOneTime.status || 'PENDING',
    };
}

export async function getOneTimePurchaseStatus({ shop, accessToken, chargeGid }) {
    const data = await adminGraphql({
        shop,
        accessToken,
        query: CHARGE_STATUS,
        variables: { id: chargeGid },
    });
    const node = data?.node;
    if (!node?.id) return { status: 'MISSING', chargeGid };
    return {
        chargeGid: node.id,
        status: String(node.status || '').toUpperCase(),
        name: node.name,
        test: Boolean(node.test),
    };
}
