import type { Product, Order, AnalyticsSummary, MonthlyTrend, StateSales, PaymentShare } from '../types'

const API_BASE_URL = 'http://127.0.0.1:3002/api'
const HMAC_SECRET = '06a153ad4fbc0869b67b2bffa2a9ed6c1e27584924a4257aca3fd3825b5fb54d'

export interface AnalyticsResponse {
  summary: AnalyticsSummary
  monthly: MonthlyTrend[]
  states: StateSales[]
  payments: PaymentShare[]
}

export interface AuthResponse {
  success: boolean
  user: {
    user_id: string
    email: string
    name: string
    is_admin?: boolean
  }
  token: string
}

async function generateHmacSha256(keyStr: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const keyData = enc.encode(keyStr)
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBuf = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(signatureBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function secureRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireSignature = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')

  if (requireSignature) {
    const timestamp = Date.now().toString()
    const nonce = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
    const bodyStr = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : ''
    const method = (options.method || 'GET').toUpperCase()

    const payloadToSign = `${method}|${endpoint}|${timestamp}|${nonce}|${bodyStr}`
    const signature = await generateHmacSha256(HMAC_SECRET, payloadToSign)

    headers.set('x-timestamp', timestamp)
    headers.set('x-nonce', nonce)
    headers.set('x-signature', signature)
    options.body = bodyStr
  }

  let res: Response
  try {
    res = await fetch(url, { ...options, headers })
  } catch {
    throw new Error('伺服器連線中斷，請確認後端服務是否已啟動')
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.error || `請求失敗 (HTTP ${res.status})`
    throw new Error(message)
  }

  return data as T
}

// 1. 發送 Email OTP 驗證碼
export function sendOtp(email: string): Promise<{ success: boolean; message: string }> {
  return secureRequest<{ success: boolean; message: string }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

// 2. 驗證 OTP 並註冊會員
export function registerUser(
  email: string,
  password: string,
  name: string,
  otp: string
): Promise<AuthResponse> {
  return secureRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, otp })
  })
}

// 3. 會員登入
export function loginUser(email: string, password: string): Promise<AuthResponse> {
  return secureRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

// 4. 商品清單查詢
export function fetchProducts(
  category: string = 'all',
  search: string = '',
  sort: string = 'featured'
): Promise<Product[]> {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.append('category', category)
  if (search) params.append('search', search)
  if (sort) params.append('sort', sort)

  const queryStr = params.toString() ? `?${params.toString()}` : ''
  return secureRequest<Product[]>(`/products${queryStr}`)
}

// 5. 單一商品明細
export function fetchProductById(id: string): Promise<Product> {
  return secureRequest<Product>(`/products/${id}`)
}

// 6. 購物車加購推薦
export function fetchRecommendations(
  cartProductIds: string[],
  cartCategoryIds: string[]
): Promise<Product[]> {
  return secureRequest<Product[]>('/products/recommendations', {
    method: 'POST',
    body: JSON.stringify({ cartProductIds, cartCategoryIds })
  })
}

// 7. 安全建立訂單 (HMAC 簽名)
export function createOrder(order: any): Promise<{ success: boolean; order_id: string; total_amount: number }> {
  return secureRequest<{ success: boolean; order_id: string; total_amount: number }>(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify(order)
    },
    true
  )
}

// 8. 查詢會員歷史訂單
export function fetchUserOrders(userId: string): Promise<Order[]> {
  return secureRequest<Order[]>(`/orders/user/${encodeURIComponent(userId)}`)
}

// 9. 查詢最新訂單
export function fetchRecentOrders(): Promise<Order[]> {
  return secureRequest<Order[]>('/orders/recent')
}

// 10. BI 營運報表數據
export function fetchAnalytics(userEmail?: string): Promise<AnalyticsResponse> {
  const headers: Record<string, string> = {}
  if (userEmail) {
    headers['x-user-email'] = userEmail
  }
  return secureRequest<AnalyticsResponse>('/analytics', { headers })
}

// 發送 3DS 驗證碼
export function send3dsOtp(cardNumber: string, cardHolder: string): Promise<{ success: boolean; message: string }> {
  return secureRequest<{ success: boolean; message: string }>('/auth/send-3ds-otp', {
    method: 'POST',
    body: JSON.stringify({ cardNumber, cardHolder })
  })
}

// 驗證 3DS 驗證碼
export function verify3dsOtp(cardNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
  return secureRequest<{ success: boolean; message: string }>('/auth/verify-3ds-otp', {
    method: 'POST',
    body: JSON.stringify({ cardNumber, otp })
  })
}