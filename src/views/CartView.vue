<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { fetchRecommendations as apiFetchRecommendations } from '../services/api'
import type { Product } from '../types'

const router = useRouter()
const cartStore = useCartStore()

const couponCode = ref('')
const couponDiscount = ref(0)
const couponMessage = ref('')

// 動態加購推薦清單
const recommendedProducts = ref<Product[]>([])
const loadingRecs = ref(false)

async function fetchRecommendations() {
  if (cartStore.items.length === 0) {
    recommendedProducts.value = []
    return
  }

  loadingRecs.value = true
  try {
    const cartProductIds = cartStore.items.map(item => item.product.product_id)
    const cartCategoryIds = Array.from(new Set(cartStore.items.map(item => item.product.category_id)))

    // 調用 api.ts 封裝函式，統一走 3002 與安全錯誤處理
    recommendedProducts.value = await apiFetchRecommendations(cartProductIds, cartCategoryIds)
  } catch {
    recommendedProducts.value = []
  } finally {
    loadingRecs.value = false
  }
}

// 監聽購物車商品變動，自動重新計算推薦
watch(
  () => cartStore.items.map(i => i.product.product_id).join(','),
  () => {
    fetchRecommendations()
  }
)

function updateQty(productId: string, currentQty: number, delta: number) {
  const next = currentQty + delta
  cartStore.updateQuantity(productId, next)
}

function removeItem(productId: string) {
  cartStore.removeItem(productId)
}

function clearCart() {
  if (confirm('確定要清空購物車內的所有商品嗎？')) {
    cartStore.clearCart()
  }
}

function applyCoupon() {
  if (couponCode.value.trim().toUpperCase() === 'VIP2026') {
    couponDiscount.value = 100
    couponMessage.value = '✓ 優惠券套用成功：現折 NT$ 100'
  } else {
    couponDiscount.value = 0
    couponMessage.value = '⚠️ 無效的折扣碼（提示：可輸入 VIP2026）'
  }
}

function quickAddRec(prod: Product) {
  cartStore.addItem(prod, 1)
}

function proceedToCheckout() {
  router.push('/checkout')
}

onMounted(() => {
  fetchRecommendations()
})
</script>

<template>
  <div class="cart-container">
    <!-- 頂部標題列 -->
    <div class="cart-header">
      <div class="title-group">
        <h1 class="cart-title">
          <span>🛒</span>
          <span>購物車明細</span>
          <span class="count-tag">共 {{ cartStore.totalCount }} 件商品</span>
        </h1>
        <p class="cart-subtitle">全站享台灣本島免運費、支援 LINE Pay / 信用卡分期與超商取貨付款</p>
      </div>

      <button
        v-if="cartStore.items.length > 0"
        class="clear-btn"
        @click="clearCart"
      >
        🗑️ 清空購物車
      </button>
    </div>

    <!-- 購物車為空狀態 -->
    <div v-if="cartStore.items.length === 0" class="empty-cart-card">
      <div class="empty-icon">🛒</div>
      <p class="empty-text">購物車目前是空的</p>
      <p class="empty-sub">快去挑選嚴選的高品質商品吧！</p>
      <router-link to="/" class="btn btn-primary shop-now-btn">
        🛍️ 前往選購商品
      </router-link>
    </div>

    <!-- 購物車主版面 -->
    <div v-else class="cart-grid">
      <!-- 左側：商品清單 -->
      <div class="items-column">
        <!-- 桌面版欄位表頭 -->
        <div class="cart-table-head">
          <div class="col-main">商品資訊</div>
          <div class="col-price">單價</div>
          <div class="col-qty">數量</div>
          <div class="col-subtotal">小計</div>
          <div class="col-act">操作</div>
        </div>

        <div
          v-for="item in cartStore.items"
          :key="item.product.product_id"
          class="cart-item"
        >
          <!-- 商品圖文 -->
          <div class="item-main">
            <img
              :src="item.product.image_url"
              :alt="item.product.title"
              class="item-thumb"
              @click="router.push(`/product/${item.product.product_id}`)"
            />
            <div class="item-info">
              <h2
                class="item-name"
                @click="router.push(`/product/${item.product.product_id}`)"
              >
                {{ item.product.title }}
              </h2>
              <span class="item-cat">🏷️ {{ item.product.category_name_en }}</span>
              <span class="delivery-fast">⚡ 台灣在地物流中心・快速出貨</span>
            </div>
          </div>

          <!-- 單價 -->
          <div class="item-unit-price">
            <span class="mobile-label">單價：</span>
            <span class="num">NT$ {{ Math.round(item.product.price * 6.5) }}</span>
          </div>

          <!-- 數量調整 -->
          <div class="item-qty">
            <div class="qty-stepper">
              <button
                class="stepper-btn"
                @click="updateQty(item.product.product_id, item.quantity, -1)"
              >
                -
              </button>
              <span class="stepper-val">{{ item.quantity }}</span>
              <button
                class="stepper-btn"
                @click="updateQty(item.product.product_id, item.quantity, 1)"
              >
                +
              </button>
            </div>
          </div>

          <!-- 單項小計 -->
          <div class="item-total-price">
            <span class="mobile-label">小計：</span>
            <span class="sub-num">NT$ {{ Math.round(item.product.price * 6.5 * item.quantity) }}</span>
          </div>

          <!-- 刪除操作 -->
          <div class="item-actions">
            <button
              class="del-btn"
              title="移除此項商品"
              @click="removeItem(item.product.product_id)"
            >
              ✕ 移除
            </button>
          </div>
        </div>

        <!-- 運送與保障橫幅 -->
        <div class="shipping-trust-card">
          <div class="trust-item">
            <span class="trust-icon">🚚</span>
            <div>
              <div class="trust-tit">全台免運直送</div>
              <div class="trust-desc">台灣物流中心直接調撥出貨</div>
            </div>
          </div>
          <div class="trust-item">
            <span class="trust-icon">🛡️</span>
            <div>
              <div class="trust-tit">正品買家保障</div>
              <div class="trust-desc">享有完整 7 天鑑賞期服務</div>
            </div>
          </div>
          <div class="trust-item">
            <span class="trust-icon">🔒</span>
            <div>
              <div class="trust-tit">SSL 加密安全金流</div>
              <div class="trust-desc">LINE Pay / ATM / 信用卡</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右側：結算摘要卡片 -->
      <div class="summary-column">
        <div class="summary-card">
          <h2 class="summary-title">訂單結算摘要</h2>

          <div class="summary-row">
            <span>商品總件數</span>
            <span class="val">{{ cartStore.totalCount }} 件</span>
          </div>

          <div class="summary-row">
            <span>商品小計</span>
            <span class="val">NT$ {{ Math.round(cartStore.totalAmount * 6.5) }}</span>
          </div>

          <div class="summary-row">
            <span>台灣本島運費</span>
            <span class="val free-tag">免運費 (Free)</span>
          </div>

          <div v-if="couponDiscount > 0" class="summary-row" style="color: var(--coupang-green, #00a862);">
            <span>優惠券折抵</span>
            <span class="val" style="color: var(--coupang-green, #00a862);">- NT$ {{ couponDiscount }}</span>
          </div>

          <!-- 折扣碼輸入區 -->
          <div class="coupon-box">
            <div class="coupon-input-group">
              <input
                v-model="couponCode"
                type="text"
                placeholder="輸入折扣碼 VIP2026"
                class="input-control coupon-input"
              />
              <button class="btn btn-outline coupon-btn" @click="applyCoupon">
                套用
              </button>
            </div>
            <span v-if="couponMessage" :class="['coupon-msg', couponDiscount > 0 ? 'success' : 'error']">
              {{ couponMessage }}
            </span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-total">
            <span class="total-label">預估應付總額</span>
            <span class="total-price">
              <span class="currency">NT$</span>
              <span>{{ Math.max(0, Math.round(cartStore.totalAmount * 6.5) - couponDiscount) }}</span>
            </span>
          </div>

          <button
            class="btn btn-mint checkout-btn"
            @click="proceedToCheckout"
          >
            🚀 前往收銀台結帳
          </button>

          <router-link to="/" class="btn btn-outline continue-btn">
            ← 繼續挑選商品
          </router-link>

          <!-- 支援金流圖示 -->
          <div class="pay-methods-preview">
            <span class="pay-tip">支援多元安全支付：</span>
            <div class="pay-tags">
              <span class="pay-pill">🟢 LINE Pay</span>
              <span class="pay-pill">💳 信用卡(可分期)</span>
              <span class="pay-pill">🏪 超商取貨付款</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：加購推薦 -->
    <section class="recommend-section">
      <h2 class="recommend-title">
        <span>🔥</span>
        <span>加購推薦・猜你喜歡</span>
      </h2>

      <div class="recommend-grid">
        <div
          v-for="rec in recommendedProducts"
          :key="rec.product_id"
          class="rec-card"
        >
          <img :src="rec.image_url" :alt="rec.title" class="rec-img" />
          <div class="rec-body">
            <span class="rec-cat">{{ rec.category_name_en }}</span>
            <h3 class="rec-name" :title="rec.title">{{ rec.title }}</h3>
            <div class="rec-rating">⭐ {{ rec.rating_avg }} ({{ rec.review_count }})</div>
            <div class="rec-footer">
              <div class="rec-price">NT$ {{ Math.round(rec.price * 6.5) }}</div>
              <button class="btn btn-primary rec-btn" @click="quickAddRec(rec)">
                + 加購
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cart-container {
  width: 100%;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.cart-title {
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary, #111827);
  display: flex;
  align-items: center;
  gap: 10px;
}

.count-tag {
  font-size: 13px;
  font-weight: 700;
  color: var(--coupang-blue, #0074e9);
  background: #eff6ff;
  padding: 3px 10px;
  border-radius: 999px;
}

.cart-subtitle {
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
  margin-top: 4px;
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #9ca3af);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 8px;
}

.clear-btn:hover {
  color: var(--coupang-red, #e52528);
}

.empty-cart-card {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 16px;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06));
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary, #111827);
  margin-bottom: 6px;
}

.empty-sub {
  font-size: 13px;
  color: var(--text-secondary, #4b5563);
  margin-bottom: 24px;
}

.shop-now-btn {
  display: inline-flex;
  padding: 10px 20px;
}

/* 購物車主網格版面 */
.cart-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 28px;
  align-items: start;
}

.items-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 桌面表頭 */
.cart-table-head {
  display: grid;
  grid-template-columns: 1fr 110px 120px 110px 60px;
  padding: 12px 18px;
  background: #f8fafc;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  color: var(--text-secondary, #4b5563);
  text-align: center;
}

.cart-table-head .col-main {
  text-align: left;
}

/* 商品卡片 */
.cart-item {
  display: grid;
  grid-template-columns: 1fr 110px 120px 110px 60px;
  align-items: center;
  background: #ffffff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 14px;
  padding: 18px;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06));
}

.item-main {
  display: flex;
  gap: 14px;
  align-items: center;
  min-width: 0;
}

.item-thumb {
  width: 76px;
  height: 76px;
  border-radius: 8px;
  object-fit: cover;
  background: #f1f5f9;
  cursor: pointer;
  flex-shrink: 0;
  border: 1px solid var(--border-color, #e5e7eb);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary, #111827);
  line-height: 1.4;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-name:hover {
  color: var(--coupang-blue, #0074e9);
}

.item-cat {
  font-size: 12px;
  color: var(--text-muted, #9ca3af);
}

.delivery-fast {
  font-size: 11px;
  font-weight: 700;
  color: var(--coupang-green, #00a862);
}

.item-unit-price, .item-qty, .item-total-price, .item-actions {
  text-align: center;
}

.mobile-label {
  display: none;
}

.item-unit-price .num {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary, #4b5563);
}

.item-total-price .sub-num {
  font-size: 16px;
  font-weight: 900;
  color: var(--coupang-red, #e52528);
}

.qty-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  overflow: hidden;
  background: #ffffff;
}

.stepper-btn {
  width: 28px;
  height: 28px;
  background: #ffffff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepper-btn:hover {
  background: #f1f5f9;
}

.stepper-val {
  width: 32px;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
}

.del-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #9ca3af);
  font-size: 13px;
  cursor: pointer;
  font-weight: 700;
}

.del-btn:hover {
  color: var(--coupang-red, #e52528);
}

/* 運送保障橫幅 */
.shipping-trust-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background: #ffffff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 14px;
  padding: 18px 24px;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06));
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trust-icon {
  font-size: 26px;
}

.trust-tit {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-primary, #111827);
}

.trust-desc {
  font-size: 11px;
  color: var(--text-muted, #9ca3af);
}

/* 結算摘要卡片 */
.summary-card {
  background: #ffffff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06));
}

.summary-title {
  font-size: 17px;
  font-weight: 900;
  color: var(--text-primary, #111827);
  margin-bottom: 18px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-secondary, #4b5563);
  margin-bottom: 12px;
}

.summary-row .val {
  font-weight: 700;
  color: var(--text-primary, #111827);
}

.free-tag {
  color: var(--coupang-green, #00a862) !important;
  font-weight: 800 !important;
}

/* 折扣碼輸入 */
.coupon-box {
  margin: 16px 0 10px;
}

.coupon-input-group {
  display: flex;
  gap: 8px;
}

.coupon-input {
  font-size: 13px;
  padding: 8px 12px;
}

.coupon-btn {
  padding: 8px 14px;
  font-size: 13px;
  white-space: nowrap;
}

.coupon-msg {
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-top: 6px;
}

.coupon-msg.success {
  color: var(--coupang-green, #00a862);
}

.coupon-msg.error {
  color: var(--coupang-red, #e52528);
}

.summary-divider {
  height: 1px;
  background: var(--border-color, #e5e7eb);
  margin: 18px 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
}

.total-label {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary, #111827);
}

.total-price {
  font-size: 26px;
  font-weight: 900;
  color: var(--coupang-red, #e52528);
}

.checkout-btn {
  width: 100%;
  padding: 13px;
  font-size: 15px;
  font-weight: 800;
}

.continue-btn {
  width: 100%;
  padding: 10px;
  font-size: 13px;
  margin-top: 10px;
  text-decoration: none;
}

.pay-methods-preview {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed var(--border-color, #e5e7eb);
  text-align: center;
}

.pay-tip {
  font-size: 11px;
  color: var(--text-muted, #9ca3af);
  display: block;
  margin-bottom: 8px;
}

.pay-tags {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.pay-pill {
  font-size: 11px;
  background: #f1f5f9;
  color: var(--text-secondary, #4b5563);
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
}

/* 底部推薦區塊 */
.recommend-section {
  margin-top: 48px;
}

.recommend-title {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary, #111827);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.rec-card {
  background: #ffffff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.rec-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  background: #f1f5f9;
}

.rec-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.rec-cat {
  font-size: 11px;
  color: var(--text-muted, #9ca3af);
}

.rec-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-primary, #111827);
  margin: 4px 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rec-rating {
  font-size: 11px;
  color: var(--coupang-yellow, #ff9800);
  font-weight: 700;
  margin-bottom: 10px;
}

.rec-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rec-price {
  font-size: 15px;
  font-weight: 900;
  color: var(--coupang-red, #e52528);
}

.rec-btn {
  padding: 4px 10px;
  font-size: 12px;
}

/* RWD 響應式斷點 */
@media (max-width: 992px) {
  .cart-grid {
    grid-template-columns: 1fr;
  }

  .recommend-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .cart-table-head {
    display: none;
  }

  .cart-item {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .item-unit-price, .item-qty, .item-total-price, .item-actions {
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mobile-label {
    display: inline-block;
    font-size: 12px;
    color: var(--text-muted, #9ca3af);
  }

  .shipping-trust-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .recommend-grid {
    grid-template-columns: 1fr;
  }
}
</style>