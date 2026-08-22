<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  show: boolean
  amount: number
}>()

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'cancel'): void
}>()

const selectedBank = ref('012') // 台北富邦
const virtualAccount = ref('9880 1204 5589 1234')
const copied = ref(false)
const isSubmitting = ref(false)

const banks = [
  { code: '012', name: '台北富邦銀行 (012)' },
  { code: '822', name: '中國信託銀行 (822)' },
  { code: '013', name: '國泰世華銀行 (013)' },
  { code: '004', name: '台灣銀行 (004)' },
  { code: '808', name: '玉山銀行 (808)' }
]

function copyAccount() {
  navigator.clipboard.writeText(virtualAccount.value.replace(/\s+/g, ''))
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function handleConfirm() {
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    emit('success')
  }, 800)
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-head">
        <div class="brand">
          <span class="brand-icon">🏦</span>
          <div>
            <div class="brand-title">ATM 虛擬帳號繳費</div>
            <div class="brand-sub">台灣跨行轉帳 / 網銀 App 繳款</div>
          </div>
        </div>
        <button class="close-btn" @click="emit('cancel')">✕</button>
      </div>

      <div class="modal-body">
        <div class="bank-select-wrap">
          <label>請選擇繳款銀行：</label>
          <select v-model="selectedBank" class="bank-select">
            <option v-for="b in banks" :key="b.code" :value="b.code">
              {{ b.name }}
            </option>
          </select>
        </div>

        <div class="account-card">
          <div class="acc-row">
            <span>繳費總金額</span>
            <span class="acc-amt">NT$ {{ amount }}</span>
          </div>
          <div class="acc-row">
            <span>虛擬轉帳帳號</span>
            <div class="acc-num-wrap">
              <span class="acc-num">{{ virtualAccount }}</span>
              <button class="copy-btn" @click="copyAccount">
                {{ copied ? '已複製 ✓' : '複製' }}
              </button>
            </div>
          </div>
          <div class="acc-row">
            <span>繳款截止時間</span>
            <span class="acc-exp">24 小時以內 (逾期作廢)</span>
          </div>
        </div>

        <div class="notice-box">
          <p>📌 轉帳完成後系統自動對帳對應訂單，無需回傳後五碼。</p>
          <p>📌 支援實體 ATM、網路銀行 Web ATM 及手機銀行 App 轉帳。</p>
        </div>
      </div>

      <div class="modal-foot">
        <button class="btn btn-outline" @click="emit('cancel')">返回修改</button>
        <button class="btn btn-mint submit-btn" :disabled="isSubmitting" @click="handleConfirm">
          <span v-if="isSubmitting">確認中...</span>
          <span v-else>取得帳號並建立訂單</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.65); display: flex; align-items: center; justify-content: center;
  z-index: 9999; backdrop-filter: blur(4px);
}
.modal-card { width: 90%; max-width: 440px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }
.modal-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #0f172a; color: #ffffff; }
.brand { display: flex; align-items: center; gap: 10px; }
.brand-icon { font-size: 24px; }
.brand-title { font-size: 14px; font-weight: 800; color: #38bdf8; }
.brand-sub { font-size: 11px; color: #94a3b8; }
.close-btn { background: transparent; border: none; color: #94a3b8; font-size: 16px; cursor: pointer; }
.modal-body { padding: 20px; }
.bank-select-wrap { margin-bottom: 14px; display: flex; flex-direction: column; gap: 6px; }
.bank-select-wrap label { font-size: 13px; font-weight: 700; color: #475569; }
.bank-select { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; font-weight: 700; outline: none; }
.account-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.acc-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #475569; }
.acc-amt { font-size: 18px; font-weight: 900; color: #e52528; }
.acc-num-wrap { display: flex; align-items: center; gap: 6px; }
.acc-num { font-family: monospace; font-size: 14px; font-weight: 800; color: #0f172a; }
.copy-btn { padding: 2px 8px; font-size: 11px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 4px; cursor: pointer; font-weight: 700; }
.acc-exp { font-size: 12px; font-weight: 700; color: #d97706; }
.notice-box { margin-top: 14px; font-size: 12px; color: #64748b; line-height: 1.6; display: flex; flex-direction: column; gap: 4px; }
.modal-foot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
.submit-btn { background: #0074e9; color: #ffffff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 800; cursor: pointer; }
</style>