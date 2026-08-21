import type { Product, Order, AnalyticsSummary, MonthlyTrend, StateSales, PaymentShare } from '../types'

const API_BASE_URL = 'http://localhost:3001/api'

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

// 1. 發送 Email OTP 驗證碼
export async function sendOtp(email: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '無法發送驗證碼')
  return data
}

// 2. 驗證 OTP 並註冊
export async function registerUser(
  email: string,
  password: string,
  name: string,
  otp: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, otp })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '註冊失敗')
  return data
}

// 3. 登入
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '登入失敗')
  return data
}

// 4. 商品清單查詢
export async function fetchProducts(
  category: string = 'all',
  search: string = '',
  sort: string = 'featured'
): Promise<Product[]> {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.append('category', category)
  if (search) params.append('search', search)
  if (sort) params.append('sort', sort)

  const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`)
  if (!res.ok) throw new Error('無法取得商品清單')
  return await res.json()
}

// 5. 單一商品明細
export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`)
  if (!res.ok) throw new Error('找不到該商品')
  return await res.json()
}

// 6. 建立訂單
export async function createOrder(order: any): Promise<{ success: boolean; order_id: string }> {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  })
  if (!res.ok) throw new Error('訂單送出失敗')
  return await res.json()
}

// 7. 使用者訂單查詢
export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/orders/user/${userId}`)
  if (!res.ok) throw new Error('無法取得訂單列表')
  return await res.json()
}

// 8. 取得最新訂單日誌 (供 DashboardView 呼叫)
export async function fetchRecentOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/orders/recent`)
  if (!res.ok) throw new Error('無法取得最新訂單')
  return await res.json()
}

// 9. BI 營運分析數據
export async function fetchAnalytics(userEmail?: string): Promise<AnalyticsResponse> {
  const headers: Record<string, string> = {}
  if (userEmail) {
    headers['x-user-email'] = userEmail
  }
  const res = await fetch(`${API_BASE_URL}/analytics`, { headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '無法取得營運數據')
  return data
}