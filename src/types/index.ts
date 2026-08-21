// 商品分類 (葡英對照)
export interface Category {
  id: string
  name_pt: string
  name_en: string
  icon: string
}

// 買家真實評價
export interface Review {
  review_id: string
  score: number // 1 ~ 5 星
  title?: string
  comment?: string
  date: string
}

// Olist 商品規格與資訊
export interface Product {
  product_id: string
  category_id: string
  category_name_en: string
  title: string
  description: string
  price: number // 巴西雷亞爾 BRL (R$)
  image_url: string
  weight_g: number
  length_cm: number
  height_cm: number
  width_cm: number
  rating_avg: number
  review_count: number
  reviews: Review[]
}

// 購物車項目
export interface CartItem {
  product: Product
  quantity: number
}

// 支付方式
export type PaymentType = 'boleto' | 'credit_card' | 'pix' | 'debit_card'

// 訂單資訊
export interface Order {
  order_id: string
  customer_city: string
  customer_state: string
  items: CartItem[]
  total_amount: number
  payment_type: PaymentType
  installments: number
  status: 'delivered' | 'shipped' | 'processing'
  created_at: string
}

// BI 營運統計指標
export interface AnalyticsSummary {
  total_gmv: number          // 總營收 GMV
  total_orders: number       // 總訂單量
  avg_ticket: number         // 平均客單價 (AOV)
  avg_delivery_days: number  // 平均物流天數
  five_star_rate: number     // 五星滿意度佔比
}

// 月度銷售趨勢
export interface MonthlyTrend {
  month: string
  revenue: number
  orders: number
}

// 巴西各州銷售排行
export interface StateSales {
  state: string
  name: string
  orders: number
  revenue: number
}

// 支付方式分佈
export interface PaymentShare {
  type: string
  count: number
  value: number
}