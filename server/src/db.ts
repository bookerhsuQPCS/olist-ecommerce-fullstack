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
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
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
}

initSchema()

export default db