import db, { initSchema } from './db'

console.log('🔄 開始初始化 SQLite 資料庫...')
initSchema()

const tables: any[] = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
  .all()

console.log('✅ 資料庫 Schema 初始化成功！目前擁有的資料表：')
tables.forEach((t) => console.log(`   - 📋 ${t.name}`))