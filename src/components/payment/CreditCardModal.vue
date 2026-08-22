<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { verify3dsOtp } from '../../services/api'

const props = defineProps<{
  show: boolean
  amount: number
  cardNumber: string
  cardHolder: string
}>()

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'cancel'): void
}>()

const otpInput = ref('')
const otpCountdown = ref(60)
const otpError = ref('')
const isVerifying = ref(false)
let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    if (otpCountdown.value > 0) {
      otpCountdown.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const cardLast4 = () => {
  const digits = props.cardNumber.replace(/\D/g, '')
  return digits.length >= 4 ? digits.substring(digits.length - 4) : '8899'
}

function fillTestOtp() {
  otpInput.value = '123456'
  otpError.value = ''
}

async function verifyOtpAndPay() {
  if (!otpInput.value || otpInput.value.trim().length !== 6) {
    otpError.value = '請輸入 6 位動態驗證碼'
    return
  }

  isVerifying.value = true
  otpError.value = ''
  try {
    const res = await verify3dsOtp(props.cardNumber, otpInput.value)
    if (res.success) {
      emit('success')
    }
  } catch (err: any) {
    otpError.value = err.message || '驗證碼錯誤'
  } finally {
    isVerifying.value = false
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-head">
        <div class="bank-brand">
          <span class="bank-icon">🏦</span>
          <div class="bank-text">
            <div class="bank-name">VISA / Mastercard 3-D Secure</div>
            <div class="bank-sub">發卡銀行線上交易身份驗證中心</div>
          </div>
        </div>
        <button class="close-x" @click="emit('cancel')">✕</button>
      </div>

      <div class="modal-body">
        <p class="auth-tip">
          系統已發送 6 位數動態認證密碼 (OTP) 至您的註冊手機（0912-***-678），請於時限內輸入：
        </p>

        <div class="tx-details">
          <div class="tx-row">
            <span>特約商店：</span>
            <b>歐選嚴選・跨境生活館</b>
          </div>
          <div class="tx-row">
            <span>交易金額：</span>
            <b class="tx-amt">NT$ {{ amount }}</b>
          </div>
          <div class="tx-row">
            <span>信用卡號：</span>
            <span>**** **** **** {{ cardLast4() }}</span>
          </div>
          <div class="tx-row">
            <span>持卡人：</span>
            <span>{{ cardHolder }}</span>
          </div>
        </div>

        <div class="otp-input-wrap">
          <label class="otp-label">簡訊動態認證密碼</label>
          <div class="otp-row">
            <input
              v-model="otpInput"
              type="text"
              maxlength="6"
              placeholder="請輸入 6 位驗證碼"
              class="otp-ctrl"
            />
            <button class="auto-fill-btn" type="button" @click="fillTestOtp">一鍵填入 (123456)</button>
          </div>
          <div class="countdown-bar">
            驗證碼有效時間剩餘：<b>{{ otpCountdown }} 秒</b>
          </div>
          <div v-if="otpError" class="otp-err">
            ⚠️ {{ otpError }}
          </div>
        </div>
      </div>

      <div class="modal-foot">
        <button class="btn btn-outline" @click="emit('cancel')">取消交易</button>
        <button
          class="btn btn-mint auth-submit-btn"
          :disabled="isVerifying"
          @click="verifyOtpAndPay"
        >
          <span v-if="isVerifying">驗證中...</span>
          <span v-else>確認送出認證</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-card {
  width: 90%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #0f172a;
  color: #ffffff;
}

.bank-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bank-icon { font-size: 24px; }
.bank-name { font-size: 14px; font-weight: 800; color: #38bdf8; }
.bank-sub { font-size: 11px; color: #94a3b8; }

.close-x {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
}

.modal-body { padding: 20px; }
.auth-tip { font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 14px; }
.tx-details {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 16px;
}

.tx-row { display: flex; justify-content: space-between; }
.tx-amt { color: #e52528; }
.otp-input-wrap { display: flex; flex-direction: column; gap: 8px; }
.otp-label { font-size: 13px; font-weight: 800; color: #1e293b; }
.otp-row { display: flex; gap: 8px; }
.otp-ctrl {
  flex: 1;
  padding: 10px 12px;
  font-size: 16px;
  letter-spacing: 4px;
  text-align: center;
  font-weight: 800;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.auto-fill-btn {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #2563eb;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.countdown-bar { font-size: 12px; color: #64748b; }
.otp-err { font-size: 12px; color: #e52528; font-weight: 700; }

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.auth-submit-btn {
  background: #0074e9;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
}
</style>