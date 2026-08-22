<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  show: boolean
  amount: number
  orderItemsSummary?: string
}>()

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'cancel'): void
}>()

const countdown = ref(300) // 5 分鐘付款時限
let timer: any = null
const isProcessing = ref(false)

onMounted(() => {
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
      emit('cancel')
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 格式化倒數計時 mm:ss
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// 模擬使用者在手機端點擊「確認付款」
function simulateAppPay() {
  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
    emit('success')
  }, 1200)
}
</script>

<template>
  <div v-if="show" class="linepay-overlay">
    <div class="linepay-modal">
      <!-- 頂部綠色品牌列 -->
      <div class="linepay-header">
        <div class="linepay-logo">
          <span class="logo-circle">L</span>
          <span class="logo-text">LINE Pay</span>
        </div>
        <button class="close-btn" @click="emit('cancel')">✕</button>
      </div>

      <div class="linepay-body">
        <div class="order-summary-box">
          <span class="merchant-name">歐選嚴選・跨境商城</span>
          <div class="pay-amount">
            <span class="unit">NT$</span>
            <span class="val">{{ amount }}</span>
          </div>
        </div>

        <!-- 擬真 QR Code 與手機引導 -->
        <div class="qrcode-wrapper">
          <div class="qrcode-box">
            <!-- 模擬 QR 條碼圖案 -->
            <div class="qr-pattern">
              <div class="qr-corner top-left"></div>
              <div class="qr-corner top-right"></div>
              <div class="qr-corner bottom-left"></div>
              <div class="qr-center-icon">🟢</div>
            </div>
            <div class="scan-line"></div>
          </div>
          <p class="scan-tip">請使用 LINE Pay「掃描」功能付款</p>
          <div class="countdown-tag">
            有效時間剩餘：<b>{{ formatTime(countdown) }}</b>
          </div>
        </div>

        <div class="divider-text">
          <span>或使用快捷模擬</span>
        </div>

        <!-- 模擬在手機 App 完成授權 -->
        <button
          class="simulate-pay-btn"
          :disabled="isProcessing"
          @click="simulateAppPay"
        >
          <span v-if="isProcessing">🔄 正在連線 LINE Pay 金流驗證...</span>
          <span v-else>📱 模擬手機已完成支付 (即刻扣款)</span>
        </button>
      </div>

      <div class="linepay-footer">
        <button class="cancel-link" @click="emit('cancel')">放棄付款並返回收銀台</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.linepay-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.linepay-modal {
  width: 90%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25);
  animation: popIn 0.2s ease-out;
}

@keyframes popIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.linepay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #00c300;
  color: #ffffff;
}

.linepay-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-circle {
  background: #ffffff;
  color: #00c300;
  font-weight: 900;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.logo-text {
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.close-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
}

.linepay-body {
  padding: 24px 20px 16px;
  text-align: center;
}

.order-summary-box {
  margin-bottom: 18px;
}

.merchant-name {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.pay-amount {
  font-size: 32px;
  font-weight: 900;
  color: #1e293b;
  margin-top: 4px;
}

.pay-amount .unit {
  font-size: 18px;
  margin-right: 4px;
}

.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.qrcode-box {
  width: 170px;
  height: 170px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #f8fafc;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-pattern {
  width: 100%;
  height: 100%;
  border: 4px dashed #94a3b8;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 4px solid #00c300;
}

.qr-corner.top-left { top: 4px; left: 4px; border-right: none; border-bottom: none; }
.qr-corner.top-right { top: 4px; right: 4px; border-left: none; border-bottom: none; }
.qr-corner.bottom-left { bottom: 4px; left: 4px; border-right: none; border-top: none; }

.qr-center-icon {
  font-size: 32px;
}

.scan-tip {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-top: 6px;
}

.countdown-tag {
  font-size: 12px;
  color: #e52528;
  background: #fef2f2;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid #fee2e2;
}

.divider-text {
  margin: 18px 0 14px;
  position: relative;
  text-align: center;
}

.divider-text::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: #e2e8f0;
}

.divider-text span {
  position: relative;
  background: #ffffff;
  padding: 0 12px;
  font-size: 12px;
  color: #94a3b8;
}

.simulate-pay-btn {
  width: 100%;
  padding: 12px;
  background: #00c300;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s ease;
}

.simulate-pay-btn:hover {
  background: #00b000;
}

.linepay-footer {
  padding: 12px;
  text-align: center;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.cancel-link {
  background: transparent;
  border: none;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
}

.cancel-link:hover {
  text-decoration: underline;
}
</style>