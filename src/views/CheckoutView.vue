<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { createOrder, send3dsOtp } from '../services/api'
import CreditCardModal from '../components/payment/CreditCardModal.vue'
import LinePayModal from '../components/payment/LinePayModal.vue'
import AtmModal from '../components/payment/AtmModal.vue'
import CvsModal from '../components/payment/CvsModal.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

// 收件人表單
const recipientName = ref(authStore.currentUser?.name || '王曉明')
const recipientPhone = ref('0912-345-678')
const deliveryCity = ref('台北市')
const deliveryAddress = ref('信義區信義路五段7號')
const paymentType = ref('信用卡付款')
const installments = ref('一次付清')

// 信用卡資料
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')
const cardHolder = ref('WANG HSIAO MING')

// 四大金流 Modal 狀態
const show3DModal = ref(false)
const showLinePayModal = ref(false)
const showAtmModal = ref(false)
const showCvsModal = ref(false)

const isSubmitting = ref(false)
const errorMessage = ref('')

const totalTwd = computed(() => Math.max(0, Math.round(cartStore.totalAmount * 6.5)))

function handleCardNumberInput(e: Event) {
  const target = e.target as HTMLInputElement
  const raw = target.value.replace(/\D/g, '').substring(0, 16)
  cardNumber.value = raw.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function handleExpiryInput(e: Event) {
  const target = e.target as HTMLInputElement
  let raw = target.value.replace(/\D/g, '').substring(0, 4)
  cardExpiry.value = raw.length >= 3 ? `${raw.substring(0, 2)}/${raw.substring(2, 4)}` : raw
}

function handleCvcInput(e: Event) {
  const target = e.target as HTMLInputElement
  cardCvc.value = target.value.replace(/\D/g, '').substring(0, 3)
}

function fillTestCreditCard() {
  cardNumber.value = '4111 2222 3333 8899'
  cardExpiry.value = '12/28'
  cardCvc.value = '888'
  cardHolder.value = 'WANG HSIAO MING'
  errorMessage.value = ''
}

// 結帳按鈕派發路由
async function handleCheckoutSubmit() {
  if (cartStore.items.length === 0) {
    errorMessage.value = '購物車為空，無法進行結帳'
    return
  }
  errorMessage.value = ''

  if (paymentType.value === '信用卡付款') {
    const rawCard = cardNumber.value.replace(/\s+/g, '')
    if (rawCard.length !== 16 || cardExpiry.value.length !== 5 || cardCvc.value.length !== 3) {
      errorMessage.value = '請完整填寫 16 碼卡號、有效期限與 CVC 安全碼'
      return
    }
    try {
      await send3dsOtp(cardNumber.value, cardHolder.value)
      show3DModal.value = true
    } catch (err: any) {
      errorMessage.value = err.message || '發送 3D 驗證碼失敗'
    }
  } else if (paymentType.value === 'LINE Pay') {
    showLinePayModal.value = true
  } else if (paymentType.value === 'ATM 虛擬帳號轉帳') {
    showAtmModal.value = true
  } else if (paymentType.value === '超商取貨付款') {
    showCvsModal.value = true
  }
}

// 超商取貨專用下單
function handleCvsSuccess(storeInfo: { cvsType: string; storeName: string; storeCode: string }) {
  showCvsModal.value = false
  executeFinalOrder(
    `超商取貨付款 (${storeInfo.cvsType})`,
    `${deliveryCity.value} 【${storeInfo.storeName} 店號:${storeInfo.storeCode}】`
  )
}

// 真正呼叫後端下單
async function executeFinalOrder(customPaymentType?: string, customAddress?: string) {
  show3DModal.value = false
  showLinePayModal.value = false
  showAtmModal.value = false
  showCvsModal.value = false

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const finalPaymentType = customPaymentType || (
      paymentType.value === '信用卡付款'
        ? `信用卡 (${installments.value})`
        : paymentType.value
    )

    const finalAddress = customAddress || `${deliveryCity.value} ${deliveryAddress.value}`

    const orderPayload = {
      items: cartStore.items.map(i => ({
        product_id: i.product.product_id,
        quantity: i.quantity
      })),
      payment_type: finalPaymentType,
      customer_city: finalAddress,
      user_id: authStore.currentUser?.user_id || 'TW'
    }

    const res = await createOrder(orderPayload)
    if (res.success) {
      cartStore.clearCart()
      router.push('/orders')
    }
  } catch (err: any) {
    errorMessage.value = err.message || '結帳處理失敗，請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="checkout-container">
    <div class="checkout-header">
      <h1 class="checkout-title">
        <span class="tw-flag">TW</span>
        <span>安全結帳收銀台（新台幣結算）</span>
      </h1>
      <p class="checkout-subtitle">提供台灣常用線上金流，全站商品享本島免運快速出貨</p>
    </div>

    <div class="checkout-grid">
      <div class="form-column">
        <!-- 1. 收件資料 -->
        <div class="form-section">
          <h2 class="section-tit">1. 台灣本島收件資料</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>收件人姓名</label>
              <input v-model="recipientName" type="text" class="input-ctrl" />
            </div>
            <div class="form-group">
              <label>聯絡手機</label>
              <input v-model="recipientPhone" type="text" class="input-ctrl" />
            </div>
            <div class="form-group">
              <label>配送縣市</label>
              <select v-model="deliveryCity" class="input-ctrl">
                <option value="台北市">台北市</option>
                <option value="新北市">新北市</option>
                <option value="桃園市">桃園市</option>
                <option value="台中市">台中市</option>
                <option value="台南市">台南市</option>
                <option value="高雄市">高雄市</option>
              </select>
            </div>
            <div class="form-group">
              <label>詳細地址 / 門市名稱</label>
              <input v-model="deliveryAddress" type="text" class="input-ctrl" />
            </div>
          </div>
        </div>

        <!-- 2. 付款方式 -->
        <div class="form-section">
          <h2 class="section-tit">2. 選擇付款方式</h2>
          <div class="pay-methods-grid">
            <label :class="['pay-card', paymentType === '信用卡付款' && 'active']">
              <input v-model="paymentType" type="radio" value="信用卡付款" />
              <div class="pay-card-content">
                <div class="pay-name">💳 信用卡付款</div>
                <div class="pay-sub">支援 Visa / Master / JCB (可分期)</div>
              </div>
            </label>

            <label :class="['pay-card', paymentType === 'LINE Pay' && 'active']">
              <input v-model="paymentType" type="radio" value="LINE Pay" />
              <div class="pay-card-content">
                <div class="pay-name">🟢 LINE Pay</div>
                <div class="pay-sub">綁定卡片或 LINE POINTS 快速折抵</div>
              </div>
            </label>

            <label :class="['pay-card', paymentType === 'ATM 虛擬帳號轉帳' && 'active']">
              <input v-model="paymentType" type="radio" value="ATM 虛擬帳號轉帳" />
              <div class="pay-card-content">
                <div class="pay-name">🏦 ATM 虛擬帳號轉帳</div>
                <div class="pay-sub">全台實體 / 網路銀行 ATM 皆可轉帳</div>
              </div>
            </label>

            <label :class="['pay-card', paymentType === '超商取貨付款' && 'active']">
              <input v-model="paymentType" type="radio" value="超商取貨付款" />
              <div class="pay-card-content">
                <div class="pay-name">🏪 超商取貨付款</div>
                <div class="pay-sub">7-11 / 全家 貨到門市再付款</div>
              </div>
            </label>
          </div>

          <!-- 信用卡專用輸入表單 -->
          <div v-if="paymentType === '信用卡付款'" class="credit-card-form">
            <div class="cc-header">
              <span class="cc-title">🔒 輸入信用卡安全交易資料</span>
              <button class="auto-fill-cc-btn" type="button" @click="fillTestCreditCard">
                一鍵填入測試卡號
              </button>
            </div>

            <div class="form-group">
              <label>信用卡卡號 (16 碼)</label>
              <input
                :value="cardNumber"
                type="text"
                placeholder="4111 2222 3333 4444"
                maxlength="19"
                class="input-ctrl cc-input"
                @input="handleCardNumberInput"
              />
            </div>

            <div class="cc-row">
              <div class="form-group">
                <label>有效期限 (MM/YY)</label>
                <input
                  :value="cardExpiry"
                  type="text"
                  placeholder="12/28"
                  maxlength="5"
                  class="input-ctrl"
                  @input="handleExpiryInput"
                />
              </div>
              <div class="form-group">
                <label>安全碼 (CVC/CVV 3碼)</label>
                <input
                  :value="cardCvc"
                  type="password"
                  placeholder="888"
                  maxlength="3"
                  class="input-ctrl"
                  @input="handleCvcInput"
                />
              </div>
            </div>

            <div class="form-group">
              <label>持卡人英文姓名</label>
              <input v-model="cardHolder" type="text" class="input-ctrl" />
            </div>

            <div class="form-group">
              <label>分期期數</label>
              <select v-model="installments" class="input-ctrl">
                <option value="一次付清">一次付清 (NT$ {{ totalTwd }})</option>
                <option value="3期0利率">3期 0 利率 (每期約 NT$ {{ Math.round(totalTwd / 3) }})</option>
                <option value="6期0利率">6期 0 利率 (每期約 NT$ {{ Math.round(totalTwd / 6) }})</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="error-banner">⚠️ {{ errorMessage }}</div>

        <button
          class="btn btn-mint submit-btn"
          :disabled="isSubmitting"
          @click="handleCheckoutSubmit"
        >
          <span v-if="isSubmitting">🔄 正在建立安全訂單...</span>
          <span v-else>🚀 確認結帳・立即付款 (NT$ {{ totalTwd }})</span>
        </button>
      </div>

      <!-- 右側購物清單 -->
      <div class="summary-column">
        <div class="summary-card">
          <h2 class="summary-tit">結帳明細 ({{ cartStore.totalCount }} 件)</h2>
          <div class="item-mini-list">
            <div v-for="item in cartStore.items" :key="item.product.product_id" class="mini-item">
              <img :src="item.product.image_url" :alt="item.product.title" class="mini-img" />
              <div class="mini-info">
                <div class="mini-title">{{ item.product.title }}</div>
                <div class="mini-price">NT$ {{ Math.round(item.product.price * 6.5) }} × {{ item.quantity }}</div>
              </div>
            </div>
          </div>

          <div class="summary-divider"></div>
          <div class="fee-row"><span>商品小計</span><span class="val">NT$ {{ totalTwd }}</span></div>
          <div class="fee-row"><span>本島運費</span><span class="val free">全館免運費</span></div>
          <div class="summary-divider"></div>
          <div class="final-total"><span class="lbl">應付結帳總額</span><span class="num">NT$ {{ totalTwd }}</span></div>
        </div>
      </div>
    </div>

    <!-- 1. 信用卡 3DS Modal -->
    <CreditCardModal
      :show="show3DModal"
      :amount="totalTwd"
      :card-number="cardNumber"
      :card-holder="cardHolder"
      @success="() => executeFinalOrder()"
      @cancel="show3DModal = false"
    />

    <!-- 2. LINE Pay Modal -->
    <LinePayModal
      :show="showLinePayModal"
      :amount="totalTwd"
      @success="() => executeFinalOrder()"
      @cancel="showLinePayModal = false"
    />

    <!-- 3. ATM Modal -->
    <AtmModal
      :show="showAtmModal"
      :amount="totalTwd"
      @success="() => executeFinalOrder()"
      @cancel="showAtmModal = false"
    />

    <!-- 4. 超商取貨 Modal -->
    <CvsModal
      :show="showCvsModal"
      :amount="totalTwd"
      :recipient-name="recipientName"
      :recipient-phone="recipientPhone"
      @success="handleCvsSuccess"
      @cancel="showCvsModal = false"
    />
  </div>
</template>

<style scoped>
.checkout-container { max-width: 1040px; margin: 0 auto; }
.checkout-header { margin-bottom: 24px; }
.checkout-title { font-size: 24px; font-weight: 900; display: flex; align-items: center; gap: 8px; }
.tw-flag { background: #1e3a8a; color: #ffffff; font-size: 12px; font-weight: 800; padding: 3px 6px; border-radius: 4px; }
.checkout-subtitle { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
.checkout-grid { display: grid; grid-template-columns: 1fr 340px; gap: 28px; align-items: start; }
.form-column { display: flex; flex-direction: column; gap: 20px; }
.form-section { background: #ffffff; border: 1px solid var(--border-color); border-radius: 14px; padding: 22px; }
.section-tit { font-size: 16px; font-weight: 800; margin-bottom: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 700; color: var(--text-secondary); }
.input-ctrl { padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; outline: none; background: #ffffff; }
.input-ctrl:focus { border-color: var(--coupang-blue); }
.pay-methods-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.pay-card { border: 1px solid var(--border-color); border-radius: 10px; padding: 14px; cursor: pointer; display: flex; gap: 10px; }
.pay-card.active { border-color: var(--coupang-blue); background: #eff6ff; }
.pay-card-content { display: flex; flex-direction: column; gap: 2px; }
.pay-name { font-size: 14px; font-weight: 800; }
.pay-sub { font-size: 11px; color: var(--text-muted); }
.credit-card-form { margin-top: 18px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; flex-direction: column; gap: 12px; }
.cc-header { display: flex; justify-content: space-between; align-items: center; }
.cc-title { font-size: 13px; font-weight: 800; }
.auto-fill-cc-btn { background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; }
.cc-input { letter-spacing: 2px; font-family: monospace; font-size: 15px; font-weight: 700; }
.cc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.submit-btn { width: 100%; padding: 14px; font-size: 16px; font-weight: 800; background: #e52528; color: #ffffff; border: none; border-radius: 8px; cursor: pointer; }
.error-banner { background: #fef2f2; border: 1px solid #fee2e2; color: #e52528; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; }
.summary-card { background: #ffffff; border: 1px solid var(--border-color); border-radius: 14px; padding: 20px; }
.summary-tit { font-size: 16px; font-weight: 800; margin-bottom: 14px; }
.item-mini-list { display: flex; flex-direction: column; gap: 10px; max-height: 240px; overflow-y: auto; }
.mini-item { display: flex; gap: 10px; align-items: center; }
.mini-img { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; }
.mini-title { font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 210px; }
.mini-price { font-size: 11px; color: var(--text-muted); }
.summary-divider { height: 1px; background: var(--border-color); margin: 14px 0; }
.fee-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
.fee-row .free { color: #00a862; font-weight: 800; }
.final-total { display: flex; justify-content: space-between; align-items: baseline; }
.final-total .lbl { font-size: 14px; font-weight: 800; }
.final-total .num { font-size: 22px; font-weight: 900; color: #e52528; }

@media (max-width: 768px) {
  .checkout-grid { grid-template-columns: 1fr; }
  .pay-methods-grid { grid-template-columns: 1fr; }
}
</style>