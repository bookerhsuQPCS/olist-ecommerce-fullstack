import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { Resend } from 'resend'
import db from './db'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// --- 系統安全密鑰 (生產環境應放於 .env 環境變數中) ---
const HMAC_SECRET = '06a153ad4fbc0869b67b2bffa2a9ed6c1e27584924a4257aca3fd3825b5fb54d'
const JWT_SECRET = '5f648cb5ad026cb99f611278069df3b0ad3a0f619b6badcbaa9097a3f8a1a699'
const SENDER_EMAIL = '歐選嚴選 <onboarding@resend.dev>'
const resend = new Resend('re_12345678_xxxxxxxxxxxx')

// 記憶體 Nonce 快取 (防重放攻擊)，記錄已使用的 nonce 與過期時間
const usedNonces = new Map<string, number>()

// 定期清理過期的 Nonce (每 10 分鐘清理一次)
setInterval(() => {
  const now = Date.now()
  for (const [nonce, expiresAt] of usedNonces.entries()) {
    if (now > expiresAt) usedNonces.delete(nonce)
  }
}, 10 * 60 * 1000)

// ==========================================
// 1. 安全中間件：API 簽名驗證與防重放 (HMAC + Nonce + Timestamp)
// ==========================================
function verifyApiSignature(req: express.Request, res: express.Response, next: express.NextFunction) {
  const timestamp = req.headers['x-timestamp'] as string
  const nonce = req.headers['x-nonce'] as string
  const signature = req.headers['x-signature'] as string

  if (!timestamp || !nonce || !signature) {
    return res.status(401).json({ error: '安全校驗失敗：缺少請求簽名標頭' })
  }

  // 1. 防時序攻擊 / 超時校驗 (請求時間與伺服器時間差距不可超過 5 分鐘)
  const reqTime = parseInt(timestamp, 10)
  const now = Date.now()
  if (isNaN(reqTime) || Math.abs(now - reqTime) > 5 * 60 * 1000) {
    return res.status(401).json({ error: '請求已過期或時間戳無效' })
  }

  // 2. 防重放攻擊 (Replay Attack)
  if (usedNonces.has(nonce)) {
    return res.status(401).json({ error: '重複的請求識別碼 (Nonce Replayed)' })
  }
  usedNonces.set(nonce, now + 10 * 60 * 1000)

  // 3. 重新計算 HMAC-SHA256 簽名
  const bodyString = Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : ''
  const payloadToSign = `${req.method}|${req.path}|${timestamp}|${nonce}|${bodyString}`
  const expectedSignature = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(payloadToSign)
    .digest('hex')

  // 使用 timingSafeEqual 防止計時攻擊 (Timing Attack)
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )

  if (!isMatch) {
    return res.status(403).json({ error: '請求簽名不符，內容可能遭竄改' })
  }

  next()
}

// ==========================================
// 2. 狀態全內聚：防竄改下單 API (POST /api/orders)
// ==========================================
// 前端只傳送：{ items: [{ product_id, quantity }], coupon_code, payment_type, city }
// 後端 100% 重新向資料庫查價與計算總額，完全不接收前端傳來的 total_amount 與 price
app.post('/api/orders', verifyApiSignature, (req, res) => {
  try {
    const { items, coupon_code, payment_type, customer_city, user_id } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: '購物車清單為空，無法建立訂單' })
    }

    let calculatedTotal = 0
    const verifiedItems: any[] = []

    // 依據資料庫真實單價逐項核算
    for (const item of items) {
      const product: any = db.prepare('SELECT product_id, title, price, image_url FROM products WHERE product_id = ?').get(item.product_id)
      if (!product) {
        return res.status(400).json({ error: `無效商品 ID: ${item.product_id}` })
      }

      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1))
      const unitPriceTwd = Math.round(product.price * 6.5)
      const subtotal = unitPriceTwd * qty

      calculatedTotal += subtotal
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

    // 後端嚴格校驗折扣券邏輯 (零信任前端折扣)
    let discount = 0
    if (coupon_code && coupon_code.trim().toUpperCase() === 'VIP2026') {
      discount = 100
    }

    const finalTotal = Math.max(0, calculatedTotal - discount)
    const orderId = `ord_${crypto.randomBytes(8).toString('hex')}` // 密碼學安全不可預測 ID
    const createdAt = new Date().toISOString().split('T')[0]

    // 寫入資料庫
    const insert = db.prepare(`
      INSERT INTO orders (
        order_id, customer_city, customer_state, items_json,
        total_amount, payment_type, installments, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insert.run(
      orderId,
      customer_city || '台北市',
      user_id || 'TW',
      JSON.stringify(verifiedItems),
      finalTotal,
      payment_type || '信用卡一次付清',
      1,
      '已付款處理中',
      createdAt
    )

    console.log(`🔒 [安全訂單已建立] 訂單號: ${orderId} | 伺服器核算總額: NT$ ${finalTotal} (已排除前端竄改可能)`)
    res.status(201).json({ success: true, order_id: orderId, total_amount: finalTotal })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})