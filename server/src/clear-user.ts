import db from './db'

// 請將引號內的 Email 替換為欲刪除的帳號
const targetEmail = 'booker0907@proton.me'

try {
  const result = db.prepare('DELETE FROM users WHERE email = ?').run(targetEmail)
  
  if (result.changes > 0) {
    console.log(`✅ 成功刪除使用者：${targetEmail}（共 ${result.changes} 筆）`)
  } else {
    console.log(`⚠️ 查無此使用者信箱：${targetEmail}`)
  }
} catch (error) {
  console.error('❌ 刪除失敗：', error)
}