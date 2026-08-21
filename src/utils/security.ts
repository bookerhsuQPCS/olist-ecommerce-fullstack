// src/utils/security.ts
const HMAC_SECRET = '06a153ad4fbc0869b67b2bffa2a9ed6c1e27584924a4257aca3fd3825b5fb54d'

/**
 * 使用瀏覽器原生 Web Crypto API 計算 HMAC-SHA256
 */
async function computeHmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const keyData = enc.encode(secret)
  const msgData = enc.encode(message)

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  )

  const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, msgData)
  const hashArray = Array.from(new Uint8Array(signatureBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 產生請求安全簽名標頭 (Timestamp + Nonce + HMAC-SHA256)
 */
export async function generateSecureHeaders(method: string, path: string, body?: any) {
  const timestamp = Date.now().toString()
  const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36)
  const bodyString = body ? JSON.stringify(body) : ''

  const payload = `${method.toUpperCase()}|${path}|${timestamp}|${nonce}|${bodyString}`
  const signature = await computeHmacSha256(payload, HMAC_SECRET)

  return {
    'Content-Type': 'application/json',
    'x-timestamp': timestamp,
    'x-nonce': nonce,
    'x-signature': signature
  }
}