/** PayPal REST API helper: OAuth2 token with in-memory expiry cache. */

type TokenCache = {
  accessToken: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

function getPayPalBaseUrl(): string {
  return process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com"
}

export async function getPayPalAccessToken(): Promise<string> {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now + 30_000) {
    return tokenCache.accessToken
  }

  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set")
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const res = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!res.ok) {
    throw new Error(`PayPal token request failed: ${res.status}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }

  return tokenCache.accessToken
}

export async function createPayPalOrder(usdAmount: number): Promise<{ id: string }> {
  const token = await getPayPalAccessToken()
  const res = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: usdAmount.toFixed(2),
          },
          description: "Space Dust",
        },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal createOrder failed: ${res.status} ${text}`)
  }

  return res.json() as Promise<{ id: string }>
}

export async function capturePayPalOrder(orderId: string): Promise<{ status: string }> {
  const token = await getPayPalAccessToken()
  const res = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal capture failed: ${res.status} ${text}`)
  }

  return res.json() as Promise<{ status: string }>
}

export async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: string,
): Promise<boolean> {
  const token = await getPayPalAccessToken()
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) throw new Error("PAYPAL_WEBHOOK_ID must be set")

  const res = await fetch(`${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      client_id: process.env.PAYPAL_CLIENT_ID,
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  })

  const data = (await res.json()) as { verification_status: string }
  return data.verification_status === "SUCCESS"
}
