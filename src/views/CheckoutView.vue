<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { createOrder } from '../services/api'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

// 台灣常用金流與超商地址表單
const form = ref({
  recipient_name: authStore.currentUser?.name || '',
  phone: '0912-345-678',
  city: '台北市',
  address: '信義區信義路五段7號',
  payment_type: 'credit_card', // credit_card | line_pay | atm | cod
  installments: 1
})

const totalTWD = computed(() => {
  return Math.round(cartStore.totalAmount * 6.5)
})

const submitting = ref(false)
const orderSuccess = ref(false)
const createdOrderId = ref('')
const submitError = ref('')

async function handleSubmitOrder() {
  if (cartStore.items.length === 0) return

  submitting.value = true
  submitError.value = ''

  const orderId = `TW_ORD_${Date.now()}`

  let paymentLabel = '信用卡 (一次付清)'
  if (form.value.payment_type === 'credit_card' && form.value.installments > 1) {
    paymentLabel = `信用卡 (${form.value.installments} 期 0 利率)`
  } else if (form.value.payment_type === 'line_pay') {
    paymentLabel = 'LINE Pay 快速結帳'
  } else if (form.value.payment_type === 'atm') {
    paymentLabel = 'ATM 虛擬帳號轉帳'
  } else if (form.value.payment_type === 'cod') {
    paymentLabel = '7-11 / 全家 超商取貨付款'
  }

  const orderPayload = {
    order_id: orderId,
    user_id: authStore.currentUser?.user_id || 'guest',
    customer_city: `${form.value.city} ${form.value.address} (${form.value.recipient_name})`,
    customer_state: authStore.currentUser?.user_id || 'TW',
    items: cartStore.items,
    total_amount: totalTWD.value,
    payment_type: paymentLabel,
    installments: form.value.installments,
    status: '已付款處理中',
    created_at: new Date().toISOString().split('T')[0]
  }

  try {
    await createOrder(orderPayload)
    cartStore.clearCart()
    createdOrderId.value = orderId
    orderSuccess.value = true
  } catch (err: any) {
    submitError.value = err.message || '結帳失敗，請稍後再試'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="checkout-page">
    <div class="page-header">
      <h1 class="page-title">
        <span>🇹🇼</span>
        <span>安全結帳收銀台 (新台幣結算)</span>
      </h1>
      <p class="page-subtitle">提供台灣常用線上金流，全站商品享本島免運快速出貨</p>
    </div>

    <!-- 結帳成功 -->
    <div v-if="orderSuccess" class="card-panel success-panel">
      <div class="success-icon">🎉</div>
      <h2 class="success-title">訂單已成功建立！</h2>
      <p class="order-id-badge">訂單編號：{{ createdOrderId }}</p>
      <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 14px;">
        款項已成功授權，商品將由台灣在地物流中心調撥出貨。
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-primary" @click="router.push('/orders')">
          📦 前往查看我的訂單
        </button>
        <button class="btn btn-outline" @click="router.push('/')">
          🛍️ 回商城繼續選購
        </button>
      </div>
    </div>

    <!-- 購物車為空 -->
    <div v-else-if="cartStore.items.length === 0" class="card-panel empty-state">
      <p style="font-size: 16px; margin-bottom: 16px;">🛒 購物車內目前沒有待結帳商品</p>
      <router-link to="/" class="btn btn-primary">
        前往商城選購
      </router-link>
    </div>

    <!-- 雙欄結帳介面 -->
    <div v-else class="checkout-layout">
      <!-- 左側：收件資料與台灣金流 -->
      <div class="card-panel">
        <h2 class="section-title">1. 台灣本島收件資料</h2>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">收件人姓名</label>
            <input v-model="form.recipient_name" type="text" class="input-control" required />
          </div>
          <div class="form-group">
            <label class="form-label">聯絡手機</label>
            <input v-model="form.phone" type="text" class="input-control" required />
          </div>
          <div class="form-group">
            <label class="form-label">配送縣市</label>
            <select v-model="form.city" class="input-control">
              <option value="台北市">台北市</option>
              <option value="新北市">新北市</option>
              <option value="桃園市">桃園市</option>
              <option value="台中市">台中市</option>
              <option value="台南市">台南市</option>
              <option value="高雄市">高雄市</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">詳細地址 / 門市名稱</label>
            <input v-model="form.address" type="text" class="input-control" required />
          </div>
        </div>

        <h2 class="section-title" style="margin-top: 24px;">2. 選擇付款方式</h2>
        <div class="payment-options">
          <div
            class="pay-card"
            :class="{ active: form.payment_type === 'credit_card' }"
            @click="form.payment_type = 'credit_card'"
          >
            <div class="pay-tit">💳 信用卡付款</div>
            <div class="pay-sub">支援 Visa / Master / JCB (可分期)</div>
          </div>

          <div
            class="pay-card"
            :class="{ active: form.payment_type === 'line_pay' }"
            @click="form.payment_type = 'line_pay'"
          >
            <div class="pay-tit">🟢 LINE Pay</div>
            <div class="pay-sub">綁定卡片或 LINE POINTS 快速折抵</div>
          </div>

          <div
            class="pay-card"
            :class="{ active: form.payment_type === 'atm' }"
            @click="form.payment_type = 'atm'"
          >
            <div class="pay-tit">🏦 ATM 虛擬帳號轉帳</div>
            <div class="pay-sub">全台實體 / 網路銀行 ATM 皆可轉帳</div>
          </div>

          <div
            class="pay-card"
            :class="{ active: form.payment_type === 'cod' }"
            @click="form.payment_type = 'cod'"
          >
            <div class="pay-tit">🏪 超商取貨付款</div>
            <div class="pay-sub">7-11 / 全家 貨到門市再付款</div>
          </div>
        </div>

        <!-- 信用卡分期選項 -->
        <div v-if="form.payment_type === 'credit_card'" class="form-group" style="margin-top: 14px;">
          <label class="form-label">信用卡分期期數</label>
          <select v-model="form.installments" class="input-control">
            <option :value="1">一次付清 (NT$ {{ totalTWD }})</option>
            <option :value="3">3 期 0 利率 (每期 NT$ {{ Math.round(totalTWD / 3) }})</option>
            <option :value="6">6 期 0 利率 (每期 NT$ {{ Math.round(totalTWD / 6) }})</option>
            <option :value="12">12 期 0 利率 (每期 NT$ {{ Math.round(totalTWD / 12) }})</option>
          </select>
        </div>

        <div v-if="submitError" class="error-msg">⚠️ {{ submitError }}</div>

        <button
          class="btn btn-mint pay-submit-btn"
          :disabled="submitting"
          @click="handleSubmitOrder"
        >
          <span v-if="submitting">訂單處理中...</span>
          <span v-else>🚀 確認結帳・立即付款 (NT$ {{ totalTWD }})</span>
        </button>
      </div>

      <!-- 右側：購物明細 -->
      <div class="summary-card">
        <h2 class="summary-title">結帳明細 ({{ cartStore.totalCount }} 件)</h2>

        <div class="cart-items-preview">
          <div v-for="item in cartStore.items" :key="item.product.product_id" class="preview-item">
            <img :src="item.product.image_url" :alt="item.product.title" class="preview-img" />
            <div class="preview-info">
              <div class="preview-name">{{ item.product.title }}</div>
              <div class="preview-price">
                NT$ {{ Math.round(item.product.price * 6.5) }} × {{ item.quantity }}
              </div>
            </div>
          </div>
        </div>

        <div class="summary-row">
          <span>商品小計</span>
          <span class="val">NT$ {{ totalTWD }}</span>
        </div>
        <div class="summary-row">
          <span>本島運費</span>
          <span class="val free">全館免運費</span>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-total">
          <span>應付結帳總額</span>
          <span class="amount">NT$ {{ totalTWD }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  max-width: 1080px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.success-panel {
  text-align: center;
  padding: 48px 24px;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.success-title {
  font-size: 22px;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.order-id-badge {
  display: inline-block;
  background: #eff6ff;
  color: var(--coupang-blue);
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 16px;
  font-family: monospace;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.payment-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pay-card {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.2s ease;
}

.pay-card:hover {
  border-color: var(--coupang-blue);
}

.pay-card.active {
  border-color: var(--coupang-blue);
  background: #eff6ff;
}

.pay-tit {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
}

.pay-sub {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.pay-submit-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 800;
  margin-top: 20px;
}

.error-msg {
  color: var(--coupang-red);
  font-size: 13px;
  font-weight: 700;
  margin-top: 12px;
}

.summary-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.summary-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.cart-items-preview {
  max-height: 240px;
  overflow-y: auto;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.preview-img {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
  background: #f1f5f9;
}

.preview-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.preview-price {
  font-size: 12px;
  color: var(--text-muted);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.summary-row .val {
  font-weight: 700;
  color: var(--text-primary);
}

.summary-row .free {
  color: var(--coupang-green);
  font-weight: 800;
}

.summary-divider {
  height: 1px;
  background: var(--border-color);
  margin: 14px 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
}

.summary-total .amount {
  font-size: 22px;
  font-weight: 900;
  color: var(--coupang-red);
}

@media (max-width: 768px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
  .form-grid, .payment-options {
    grid-template-columns: 1fr;
  }
}
</style>