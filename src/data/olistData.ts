import type { Category, Product, Order, AnalyticsSummary, MonthlyTrend, StateSales, PaymentShare } from '../types'

// 1. 預設分類
export const SEED_CATEGORIES: Category[] = [
  { id: 'all', name_pt: 'Todos', name_en: '全部商品', icon: '🌟' },
  { id: 'health_beauty', name_pt: 'beleza_saude', name_en: '美妝個護', icon: '💄' },
  { id: 'computers_accessories', name_pt: 'informatica_acessorios', name_en: '電腦 3C', icon: '💻' },
  { id: 'watches_gifts', name_pt: 'relogios_presentes', name_en: '鐘錶禮品', icon: '⌚' },
  { id: 'bed_bath_table', name_pt: 'cama_mesa_banho', name_en: '居家寢具', icon: '🛏️' },
  { id: 'sports_leisure', name_pt: 'esporte_lazer', name_en: '運動休閒', icon: '⚽' }
]

// 2. 預設商品種子庫
export const SEED_PRODUCTS: Product[] = [
  {
    product_id: '87285b34884572b28435047a0ef3069b',
    category_id: 'watches_gifts',
    category_name_en: '鐘錶禮品',
    title: 'Olist Classic Chrono Watch #87285B',
    description: '巴西熱銷經典石英計時腕錶，極簡霧面金屬錶殼搭配進口皮革錶帶，商務休閒皆宜。',
    price: 189.90,
    image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
    weight_g: 450,
    length_cm: 20,
    height_cm: 6,
    width_cm: 12,
    rating_avg: 4.8,
    review_count: 142,
    reviews: [
      { review_id: 'r1', score: 5, comment: '包裝非常完善，走時很準，質感超出預期！', date: '2026-03-12' },
      { review_id: 'r2', score: 4, comment: '錶帶偏硬一點，戴了兩三天後比較貼合。', date: '2026-03-05' }
    ]
  },
  {
    product_id: '53759a2ecdd6883a1e4d56f50d4323cb',
    category_id: 'computers_accessories',
    category_name_en: '電腦 3C',
    title: 'Olist RGB Pro Gaming Keyboard #53759A',
    description: '機械軸體電競背光鍵盤，全鍵無衝突設計，隨附人體工學磁吸手托。',
    price: 249.00,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    weight_g: 1100,
    length_cm: 45,
    height_cm: 8,
    width_cm: 18,
    rating_avg: 4.6,
    review_count: 89,
    reviews: [
      { review_id: 'r3', score: 5, comment: 'RGB 燈效很亮眼，敲擊感極佳！', date: '2026-02-28' }
    ]
  },
  {
    product_id: '154e723243f55e37ac279c1f619018ce',
    category_id: 'health_beauty',
    category_name_en: '美妝個護',
    title: 'Olist Botanical Skin Serum #154E72',
    description: '熱帶雨林天然植萃精華露，深層補水煥白，清爽不油膩。',
    price: 99.50,
    image_url: 'https://images.unsplash.com/photo-1608248597359-0a9ef223f6e8?w=600&auto=format&fit=crop&q=80',
    weight_g: 180,
    length_cm: 10,
    height_cm: 15,
    width_cm: 8,
    rating_avg: 4.9,
    review_count: 215,
    reviews: [
      { review_id: 'r4', score: 5, comment: '吸收超級快，味道是天然草本清香。', date: '2026-03-18' }
    ]
  },
  {
    product_id: '368c6c730842d78016ad823897a372db',
    category_id: 'bed_bath_table',
    category_name_en: '居家寢具',
    title: 'Olist Pure Linen Bed Set 4-Piece #368C6C',
    description: '100% 頂級水洗純麻四件套，透氣吸汗、親膚舒適，營造熱帶度假氛圍。',
    price: 320.00,
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80',
    weight_g: 2400,
    length_cm: 40,
    height_cm: 20,
    width_cm: 30,
    rating_avg: 4.7,
    review_count: 67,
    reviews: [
      { review_id: 'r5', score: 5, comment: '顏色比照片還漂亮，洗過之後更柔軟！', date: '2026-01-20' }
    ]
  },
  {
    product_id: '422879e10f46682990de24d770e7f83d',
    category_id: 'sports_leisure',
    category_name_en: '運動休閒',
    title: 'Olist Pro Rio Match Football #422879',
    description: '巴西里約聯賽指定規格訓練足球，防爆耐磨 PU 表皮與高彈內膽。',
    price: 135.00,
    image_url: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=600&auto=format&fit=crop&q=80',
    weight_g: 430,
    length_cm: 22,
    height_cm: 22,
    width_cm: 22,
    rating_avg: 4.5,
    review_count: 54,
    reviews: [
      { review_id: 'r6', score: 4, comment: '腳感很好，彈性充足。', date: '2026-03-01' }
    ]
  }
]

// 3. 預設 BI 分析指標
export const SEED_ANALYTICS_SUMMARY: AnalyticsSummary = {
  total_gmv: 15428900.50,
  total_orders: 99441,
  avg_ticket: 155.15,
  avg_delivery_days: 12.5,
  five_star_rate: 76.8
}

// 4. 月度營收趨勢
export const SEED_MONTHLY_TRENDS: MonthlyTrend[] = [
  { month: '2025-10', revenue: 980000, orders: 6300 },
  { month: '2025-11', revenue: 1450000, orders: 9200 }, // Black Friday 旺季
  { month: '2025-12', revenue: 1320000, orders: 8400 },
  { month: '2026-01', revenue: 1100000, orders: 7100 },
  { month: '2026-02', revenue: 1050000, orders: 6800 },
  { month: '2026-03', revenue: 1280000, orders: 8100 }
]

// 5. 巴西各州銷售排行
export const SEED_STATE_SALES: StateSales[] = [
  { state: 'SP', name: 'São Paulo (聖保羅)', orders: 41746, revenue: 5928000 },
  { state: 'RJ', name: 'Rio de Janeiro (里約)', orders: 12852, revenue: 2145000 },
  { state: 'MG', name: 'Minas Gerais (米納斯)', orders: 11635, revenue: 1872000 },
  { state: 'RS', name: 'Rio Grande do Sul (南大河)', orders: 5466, revenue: 890000 },
  { state: 'PR', name: 'Paraná (巴拉那)', orders: 5045, revenue: 815000 }
]

// 6. 支付方式佔比
export const SEED_PAYMENT_SHARES: PaymentShare[] = [
  { type: 'Credit Card (信用卡)', count: 76795, value: 12542000 },
  { type: 'Boleto Bancário (超商條碼)', count: 19784, value: 2869000 },
  { type: 'Pix / 虛擬即時轉帳', count: 5775, value: 890000 },
  { type: 'Debit Card (簽帳金融卡)', count: 1529, value: 217900 }
]

// LocalStorage 初始化函式
export const initOlistLocalStorage = () => {
  if (!localStorage.getItem('olist_db_products')) {
    localStorage.setItem('olist_db_products', JSON.stringify(SEED_PRODUCTS))
  }
  if (!localStorage.getItem('olist_db_orders')) {
    localStorage.setItem('olist_db_orders', JSON.stringify([]))
  }
  if (!localStorage.getItem('olist_db_analytics')) {
    localStorage.setItem('olist_db_analytics', JSON.stringify({
      summary: SEED_ANALYTICS_SUMMARY,
      monthly: SEED_MONTHLY_TRENDS,
      states: SEED_STATE_SALES,
      payments: SEED_PAYMENT_SHARES
    }))
  }
}