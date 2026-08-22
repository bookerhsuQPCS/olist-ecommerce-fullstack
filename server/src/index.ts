import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { Resend } from 'resend'
import db, { initSchema } from './db'

const app = express()
const PORT = 3002

initSchema()

// 1. 管理員白名單清單
const ADMIN_WHITELIST = ['booker0907@proton.me', 'admin@olist.com']

// 2. CORS 配置
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-signature', 'x-timestamp', 'x-nonce', 'x-user-email'],
  credentials: true
}))

// 保留原始 Body 字串供 HMAC 簽名驗證
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString('utf-8')
  }
}))

// --- 系統安全密鑰 ---
const HMAC_SECRET = '06a153ad4fbc0869b67b2bffa2a9ed6c1e27584924a4257aca3fd3825b5fb54d'
const JWT_SECRET = '5f648cb5ad026cb99f611278069df3b0ad3a0f619b6badcbaa9097a3f8a1a699'
const resend = new Resend('re_12345678_xxxxxxxxxxxx')

const usedNonces = new Map<string, number>()

setInterval(() => {
  const now = Date.now()
  for (const [nonce, expiresAt] of usedNonces.entries()) {
    if (now > expiresAt) usedNonces.delete(nonce)
  }
}, 10 * 60 * 1000)

function hashPassword(password: string): string {
  return crypto.createHmac('sha256', JWT_SECRET).update(password).digest('hex')
}

function generateToken(userId: string, email: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, email, exp: Date.now() + 7 * 24 * 3600 * 1000 })).toString('base64url')
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

// ==========================================
// 3. 會員認證模組
// ==========================================

// 3.1 發送 Email OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: '請輸入有效的電子信箱' })
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 5 * 60 * 1000

    db.prepare(`
      INSERT INTO otps (email, code, expires_at)
      VALUES (?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at
    `).run(email.trim().toLowerCase(), otpCode, expiresAt)

    console.log(`\n==============================================`)
    console.log(`🔑 [Email OTP 驗證碼] 目標: ${email} | 驗證碼: ${otpCode}`)
    console.log(`==============================================\n`)

    res.json({ success: true, message: '驗證碼已生成（請查看後端終端機 Console）' })
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [AUTH_SEND_OTP]:`, err)
    res.status(500).json({ error: '驗證碼發送失敗，請稍後再試' })
  }
})

// 3.2 註冊新會員
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name, otp } = req.body
    if (!email || !password || !name || !otp) {
      return res.status(400).json({ error: '請完整填寫所有註冊欄位' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const storedOtp: any = db.prepare('SELECT code, expires_at FROM otps WHERE email = ?').get(cleanEmail)
    
    if (!storedOtp || storedOtp.code !== otp.trim()) {
      return res.status(400).json({ error: '驗證碼錯誤或不存在' })
    }
    if (Date.now() > storedOtp.expires_at) {
      return res.status(400).json({ error: '驗證碼已過期，請重新發送' })
    }

    const existingUser = db.prepare('SELECT user_id FROM users WHERE email = ?').get(cleanEmail)
    if (existingUser) {
      return res.status(400).json({ error: '此電子信箱已被註冊，請直接登入' })
    }

    const userId = `usr_${crypto.randomBytes(6).toString('hex')}`
    const passwordHash = hashPassword(password)
    const createdAt = new Date().toISOString()

    db.prepare(`
      INSERT INTO users (user_id, email, password_hash, name, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, cleanEmail, passwordHash, name.trim(), createdAt)

    db.prepare('DELETE FROM otps WHERE email = ?').run(cleanEmail)

    const token = generateToken(userId, cleanEmail)
    const isAdmin = ADMIN_WHITELIST.includes(cleanEmail)

    res.json({
      success: true,
      user: { user_id: userId, email: cleanEmail, name: name.trim(), is_admin: isAdmin },
      token
    })
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [AUTH_REGISTER]:`, err)
    res.status(500).json({ error: '註冊處理失敗，請稍後再試' })
  }
})

// 3.3 會員登入
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: '請輸入電子信箱與密碼' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const passwordHash = hashPassword(password)

    const user: any = db.prepare('SELECT user_id, email, name, password_hash FROM users WHERE email = ?').get(cleanEmail)
    
    if (!user || user.password_hash !== passwordHash) {
      return res.status(401).json({ error: '電子信箱或密碼錯誤' })
    }

    const token = generateToken(user.user_id, user.email)
    const isAdmin = ADMIN_WHITELIST.includes(cleanEmail)

    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        is_admin: isAdmin
      },
      token
    })
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [AUTH_LOGIN]:`, err)
    res.status(500).json({ error: '登入處理發生內部錯誤' })
  }
})

// ==========================================
// 4. 商品與推薦模組
// ==========================================
// 修改 src/index.ts 的 GET /api/products
app.get('/api/products', (req, res) => {
  try {
    const { category, search, sort } = req.query
    let sql = 'SELECT * FROM products WHERE 1=1'
    const params: any[] = []

    if (category && category !== 'all') {
      const catId = String(category).trim().replace(/\s+/g, '_')
      sql += ' AND category_id = ?'
      params.push(catId)
    }

    if (search && String(search).trim() !== '') {
      const term = `%${String(search).trim().toLowerCase()}%`
      // 聚焦於標題與品類名稱，避免 description 模糊字元過度干擾
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(category_name_en) LIKE ?)'
      params.push(term, term)
    }

    if (sort === 'price_asc') {
      sql += ' ORDER BY price ASC'
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY price DESC'
    } else if (sort === 'rating') {
      sql += ' ORDER BY rating_avg DESC, review_count DESC'
    } else {
      sql += ' ORDER BY rating_avg DESC'
    }

    const products = db.prepare(sql).all(...params)
    res.json(products)
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [GET_PRODUCTS]:`, err)
    res.status(500).json({ error: '無法取得商品清單' })
  }
})

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE product_id = ?').get(req.params.id)
    if (!product) return res.status(404).json({ error: '找不到該商品' })
    res.json(product)
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [GET_PRODUCT_BY_ID]:`, err)
    res.status(500).json({ error: '商品資料讀取失敗' })
  }
})

app.post('/api/products/recommendations', (req, res) => {
  try {
    const { cartProductIds = [], cartCategoryIds = [] } = req.body

    let sql = 'SELECT * FROM products WHERE 1=1'
    const params: any[] = []

    if (Array.isArray(cartProductIds) && cartProductIds.length > 0) {
      const placeholders = cartProductIds.map(() => '?').join(',')
      sql += ` AND product_id NOT IN (${placeholders})`
      params.push(...cartProductIds)
    }

    if (Array.isArray(cartCategoryIds) && cartCategoryIds.length > 0) {
      const catPlaceholders = cartCategoryIds.map(() => '?').join(',')
      sql += ` AND category_id IN (${catPlaceholders})`
      params.push(...cartCategoryIds)
    }

    sql += ' ORDER BY rating_avg DESC, review_count DESC LIMIT 4'
    let recs = db.prepare(sql).all(...params)

    if (recs.length < 4) {
      const fallbackPlaceholders = (Array.isArray(cartProductIds) && cartProductIds.length > 0)
        ? cartProductIds.map(() => '?').join(',')
        : "''"
      const fallbackSql = `
        SELECT * FROM products 
        WHERE product_id NOT IN (${fallbackPlaceholders})
        ORDER BY rating_avg DESC LIMIT 4
      `
      recs = db.prepare(fallbackSql).all(...(Array.isArray(cartProductIds) ? cartProductIds : []))
    }

    res.json(recs)
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [RECOMMENDATIONS]:`, err)
    res.status(500).json({ error: '無法取得推薦商品' })
  }
})

// ==========================================
// 5. 訂單模組 (HMAC 安全簽名驗證)
// ==========================================
function verifyApiSignature(req: any, res: express.Response, next: express.NextFunction) {
  try {
    const timestamp = req.headers['x-timestamp'] as string
    const nonce = req.headers['x-nonce'] as string
    const signature = req.headers['x-signature'] as string

    if (!timestamp || !nonce || !signature) {
      return res.status(401).json({ error: '安全校驗失敗：缺少請求簽名標頭' })
    }

    const reqTime = parseInt(timestamp, 10)
    const now = Date.now()
    if (isNaN(reqTime) || Math.abs(now - reqTime) > 5 * 60 * 1000) {
      return res.status(401).json({ error: '請求已過期' })
    }

    if (usedNonces.has(nonce)) {
      return res.status(401).json({ error: '重複的請求識別碼 (Nonce Replayed)' })
    }
    usedNonces.set(nonce, now + 10 * 60 * 1000)

    // 統一去除 /api 前綴，確保與前端傳入的 endpoint 一致
    const cleanPath = req.path.replace(/^\/api/, '')
    const bodyString = req.rawBody || ''

    // 待簽名字串: METHOD|PATH|TIMESTAMP|NONCE|BODY
    const payloadToSign = `${req.method}|${cleanPath}|${timestamp}|${nonce}|${bodyString}`
    const expectedSignature = crypto.createHmac('sha256', HMAC_SECRET).update(Buffer.from(payloadToSign, 'utf-8')).digest('hex')

    const sigBuf = Buffer.from(signature, 'hex')
    const expBuf = Buffer.from(expectedSignature, 'hex')

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.warn(`⚠️ [SIGN_MISMATCH]
  前端 Signature : ${signature}
  後端 Expected  : ${expectedSignature}
  後端 Payload   : ${payloadToSign}`)
      return res.status(403).json({ error: '請求簽名不符，內容可能遭竄改' })
    }

    next()
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [VERIFY_SIGNATURE]:`, err)
    return res.status(500).json({ error: '安全驗證發生錯誤' })
  }
}

app.post('/api/orders', verifyApiSignature, (req, res) => {
  try {
    const { items, coupon_code, payment_type, customer_city, user_id } = req.body
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: '購物車清單為空，無法建立訂單' })
    }

    let calculatedTotal = 0
    const verifiedItems: any[] = []

    for (const item of items) {
      // 相容 item.product_id 或 item.product.product_id
      const pId = item.product_id || (item.product && item.product.product_id)
      if (!pId) {
        return res.status(400).json({ error: '無效商品 ID: 未能取得產品編號' })
      }

      const product: any = db.prepare('SELECT product_id, title, price, image_url FROM products WHERE product_id = ?').get(pId)
      if (!product) {
        return res.status(400).json({ error: `無效商品 ID: ${pId}（資料庫中無此商品）` })
      }

      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1))
      const unitPriceTwd = Math.round(product.price * 6.5)
      calculatedTotal += unitPriceTwd * qty
      verifiedItems.push({
        product: {
          product_id: product.product_id,
          title: product.title,
          price_twd: unitPriceTwd,
          image_url: product.image_url
        },
        quantity: qty
      })
    }

    let discount = (coupon_code && coupon_code.trim().toUpperCase() === 'VIP2026') ? 100 : 0
    const finalTotal = Math.max(0, calculatedTotal - discount)
    const orderId = `ord_${crypto.randomBytes(8).toString('hex')}`
    const createdAt = new Date().toISOString().split('T')[0]

    db.prepare(`
      INSERT INTO orders (order_id, customer_city, customer_state, items_json, total_amount, payment_type, installments, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId, customer_city || '台北市', user_id || 'TW',
      JSON.stringify(verifiedItems), finalTotal, payment_type || '信用卡一次付清', 1, '已付款處理中', createdAt
    )

    console.log(`🔒 [安全訂單已建立] 訂單號: ${orderId} | 核算總額: NT$ ${finalTotal}`)
    res.status(201).json({ success: true, order_id: orderId, total_amount: finalTotal })
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [CREATE_ORDER]:`, err)
    res.status(500).json({ error: '建立訂單失敗' })
  }
})

app.get('/api/orders/user/:userId', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE customer_state = ? ORDER BY created_at DESC').all(req.params.userId)
    res.json(orders)
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [GET_USER_ORDERS]:`, err)
    res.status(500).json({ error: '無法取得訂單列表' })
  }
})

app.get('/api/orders/recent', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10').all()
    res.json(orders)
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [GET_RECENT_ORDERS]:`, err)
    res.status(500).json({ error: '無法取得最新訂單' })
  }
})

// ==========================================
// 6. BI 營運數據
// ==========================================
app.get('/api/analytics', (req, res) => {
  try {
    const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase()
    if (!ADMIN_WHITELIST.includes(userEmail)) {
      return res.status(403).json({ error: '權限不足：非授權管理員信箱' })
    }

    const totalSales: any = db.prepare('SELECT SUM(total_amount) as total FROM orders').get()
    const totalOrders: any = db.prepare('SELECT COUNT(*) as count FROM orders').get()
    const totalProducts: any = db.prepare('SELECT COUNT(*) as count FROM products').get()

    const monthlyData = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, SUM(total_amount) as revenue, COUNT(*) as orders
      FROM orders
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `).all()

    const stateData = db.prepare(`
      SELECT customer_city as state, SUM(total_amount) as sales, COUNT(*) as orders
      FROM orders
      GROUP BY customer_city
      ORDER BY sales DESC
      LIMIT 8
    `).all()

    const paymentData = db.prepare(`
      SELECT payment_type as type, COUNT(*) as count, SUM(total_amount) as value
      FROM orders
      GROUP BY payment_type
    `).all()

    res.json({
      summary: {
        total_revenue: totalSales?.total || 0,
        total_orders: totalOrders?.count || 0,
        total_products: totalProducts?.count || 0,
        avg_order_value: totalOrders?.count ? Math.round((totalSales?.total || 0) / totalOrders.count) : 0
      },
      monthly: monthlyData,
      states: stateData,
      payments: paymentData
    })
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [GET_ANALYTICS]:`, err)
    res.status(500).json({ error: '無法取得營運數據' })
  }
})

// ==========================================
// 信用卡 3D 驗證 (3DS OTP) 模組
// ==========================================

// 1. 發送 3DS OTP 並在後端終端機顯示密碼
app.post('/api/auth/send-3ds-otp', (req, res) => {
  try {
    const { cardNumber, cardHolder } = req.body
    const cleanCard = (cardNumber || '').replace(/\s+/g, '')
    if (cleanCard.length < 4) {
      return res.status(400).json({ error: '無效卡號' })
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 3 * 60 * 1000 // 3分鐘有效

    // 儲存至 otps 資料表 (以卡號末4碼作為識別鍵)
    const cardKey = `card_${cleanCard.slice(-4)}`
    db.prepare(`
      INSERT INTO otps (email, code, expires_at)
      VALUES (?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at
    `).run(cardKey, otpCode, expiresAt)

    console.log(`\n==============================================`)
    console.log(`🏦 [3D Secure 銀行信用卡驗證]`)
    console.log(`💳 持卡人: ${cardHolder || '未知'} | 卡號末四碼: ${cleanCard.slice(-4)}`)
    console.log(`🔑 3DS 動態驗證碼: ${otpCode} (有效期限 3 分鐘)`)
    console.log(`==============================================\n`)

    res.json({ success: true, message: '動態驗證碼已生成，請查看後端終端機 Console' })
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [SEND_3DS_OTP]:`, err)
    res.status(500).json({ error: '無法發送驗證碼' })
  }
})

// 2. 校驗 3DS OTP
app.post('/api/auth/verify-3ds-otp', (req, res) => {
  try {
    const { cardNumber, otp } = req.body
    const cleanCard = (cardNumber || '').replace(/\s+/g, '')
    const cardKey = `card_${cleanCard.slice(-4)}`

    const storedOtp: any = db.prepare('SELECT code, expires_at FROM otps WHERE email = ?').get(cardKey)
    if (!storedOtp || storedOtp.code !== (otp || '').trim()) {
      return res.status(400).json({ error: '驗證碼錯誤' })
    }

    if (Date.now() > storedOtp.expires_at) {
      return res.status(400).json({ error: '驗證碼已過期，請重新發送' })
    }

    // 驗證成功後刪除
    db.prepare('DELETE FROM otps WHERE email = ?').run(cardKey)

    res.json({ success: true, message: '3D 驗證成功' })
  } catch (err: any) {
    console.error(`[INTERNAL_ERROR] [VERIFY_3DS_OTP]:`, err)
    res.status(500).json({ error: '驗證處理失敗' })
  }
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[UNCAUGHT_EXCEPTION] ${req.method} ${req.path}:`, err)
  res.status(500).json({ error: '伺服器端發生異常，請聯絡系統管理員' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 後端伺服器運行中：http://127.0.0.1:${PORT}`)
})