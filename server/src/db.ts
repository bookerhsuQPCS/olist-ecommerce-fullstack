import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = path.join(__dirname, '../olist.db')
const dbDir = path.dirname(dbPath)

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function initSchema() {
  // 1. 建立基礎資料表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS otps (
      email TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      product_id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      category_name_en TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      weight_g INTEGER,
      length_cm INTEGER,
      height_cm INTEGER,
      width_cm INTEGER,
      rating_avg REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      reviews_json TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      customer_city TEXT NOT NULL,
      customer_state TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total_amount REAL NOT NULL,
      payment_type TEXT NOT NULL,
      installments INTEGER DEFAULT 1,
      status TEXT DEFAULT 'processing',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_orders_state ON orders(customer_state);
    CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `)

  // 2. 欄位一致性防呆：若 users 表存在但缺少 password_hash，自動補齊
  try {
    const userColumns = db.prepare(`PRAGMA table_info(users)`).all().map((c: any) => c.name)
    if (!userColumns.includes('password_hash')) {
      console.log('🔧 [DB] 偵測到 users 表缺少 password_hash，正在自動補上欄位...')
      db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT;`)
    }
  } catch (err) {
    console.error('❌ [DB] 檢查 users 欄位失敗:', err)
  }
}

initSchema()

export default db