<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { fetchProductById } from '../services/api'
import type { Product } from '../types'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref<Product | null>(null)
const quantity = ref(1)
const loading = ref(true)
const errorMessage = ref('')
const addedToast = ref(false)

async function loadDetail() {
  const id = route.params.id as string
  if (!id) return

  loading.value = true
  errorMessage.value = ''
  try {
    const data = await fetchProductById(id)
    product.value = data
  } catch (err: any) {
    errorMessage.value = err.message || '找不到該商品明細'
  } finally {
    loading.value = false
  }
}

function updateQuantity(delta: number) {
  const next = quantity.value + delta
  if (next >= 1 && next <= 99) {
    quantity.value = next
  }
}

function handleAddToCart() {
  if (!product.value) return
  cartStore.addItem(product.value, quantity.value)
  addedToast.value = true
  setTimeout(() => {
    addedToast.value = false
  }, 2500)
}

function buyNow() {
  if (!product.value) return
  cartStore.addItem(product.value, quantity.value)
  router.push('/checkout')
}

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div class="detail-page-container">
    <!-- 返回導航 -->
    <div class="back-bar">
      <router-link to="/" class="back-link">
        <span class="arrow">←</span>
        <span>返回商品列表</span>
      </router-link>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="state-card">
      <div class="spinner">⏳</div>
      <p>正在從資料庫載入商品詳情...</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="errorMessage || !product" class="state-card error">
      <p>⚠️ {{ errorMessage || '商品不存在或已下架' }}</p>
      <router-link to="/" class="btn btn-outline" style="margin-top: 12px; display: inline-flex;">
        返回首頁商城
      </router-link>
    </div>

    <!-- 商品主體區塊 -->
    <div v-else class="detail-main-layout">
      <div class="product-showcase-grid">
        <!-- 左側：商品大圖 -->
        <div class="gallery-wrapper">
          <div class="image-box">
            <img :src="product.image_url" :alt="product.title" class="product-img" />
          </div>
        </div>

        <!-- 右側：商品核心購買資訊 -->
        <div class="info-wrapper">
          <div class="category-badge">
            🏷️ {{ product.category_name_en }} ({{ product.category_id }})
          </div>

          <h1 class="product-title">{{ product.title }}</h1>

          <div class="rating-bar">
            <span class="rating-star">⭐ {{ product.rating_avg.toFixed(1) }}</span>
            <span class="rating-divider">・</span>
            <span class="rating-text">{{ product.review_count }} 則買家真實評價</span>
          </div>

          <!-- 價格卡片 -->
          <div class="price-box">
            <span class="price-tag">巴西直送限時特惠</span>
            <div class="price-num">
              <span class="currency">R$</span>
              <span>{{ product.price.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 商品描述 -->
          <p class="product-desc">{{ product.description }}</p>

          <!-- 規格參數網格 -->
          <div class="specs-box">
            <div class="spec-cell">
              <span class="spec-label">商品重量</span>
              <span class="spec-value">{{ product.weight_g }} g</span>
            </div>
            <div class="spec-cell">
              <span class="spec-label">長度</span>
              <span class="spec-value">{{ product.length_cm }} cm</span>
            </div>
            <div class="spec-cell">
              <span class="spec-label">高度</span>
              <span class="spec-value">{{ product.height_cm }} cm</span>
            </div>
            <div class="spec-cell">
              <span class="spec-label">寬度</span>
              <span class="spec-value">{{ product.width_cm }} cm</span>
            </div>
          </div>

          <!-- 購買控制列 -->
          <div class="action-panel">
            <div class="qty-control">
              <button class="qty-btn" @click="updateQuantity(-1)">-</button>
              <span class="qty-num">{{ quantity }}</span>
              <button class="qty-btn" @click="updateQuantity(1)">+</button>
            </div>

            <button class="btn btn-outline cart-btn" @click="handleAddToCart">
              🛒 加入購物車
            </button>
            <button class="btn btn-mint buy-btn" @click="buyNow">
              🚀 立即購買
            </button>
          </div>

          <!-- 成功提示 -->
          <div v-if="addedToast" class="toast-success">
            ✓ 已成功加入購物車！可隨時至右上角結帳
          </div>
        </div>
      </div>

      <!-- 底部顧客評論 -->
      <section class="reviews-section">
        <h2 class="section-title">
          <span>💬</span>
          <span>顧客評價與回饋 ({{ product.reviews.length }})</span>
        </h2>

        <div class="reviews-grid">
          <div v-for="rev in product.reviews" :key="rev.review_id" class="review-item">
            <div class="review-top">
              <span class="stars">{{ '★'.repeat(rev.score) }}{{ '☆'.repeat(5 - rev.score) }}</span>
              <span class="date">{{ rev.date }}</span>
            </div>
            <p class="comment">{{ rev.comment }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.detail-page-container {
  width: 100%;
}

.back-bar {
  margin-bottom: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--coupang-blue, #0074e9);
  font-weight: 700;
  font-size: 14px;
}

.back-link:hover {
  text-decoration: underline;
}

.state-card {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid var(--border-color, #e5e7eb);
  color: var(--text-secondary, #4b5563);
}

.state-card.error {
  color: var(--coupang-red, #e52528);
}

.spinner {
  font-size: 36px;
  margin-bottom: 12px;
}

/* 主版面：左右雙欄 */
.product-showcase-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  background: #ffffff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06));
  margin-bottom: 32px;
}

/* 左側圖片區 */
.gallery-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-box {
  width: 100%;
  max-width: 480px;
  aspect-ratio: 1 / 1;
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color, #e5e7eb);
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右側資訊區 */
.info-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--coupang-blue, #0074e9);
  background: #eff6ff;
  padding: 4px 10px;
  border-radius: 6px;
  width: fit-content;
}

.product-title {
  font-size: 22px;
  font-weight: 900;
  color: var(--text-primary, #111827);
  line-height: 1.35;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.rating-star {
  font-weight: 800;
  color: var(--coupang-yellow, #ff9800);
}

.rating-divider {
  color: var(--border-color, #cbd5e1);
}

.rating-text {
  color: var(--text-secondary, #6b7280);
}

.price-box {
  background: #fff5f5;
  border: 1px solid #fee2e2;
  border-radius: 10px;
  padding: 14px 18px;
}

.price-tag {
  font-size: 12px;
  font-weight: 700;
  color: var(--coupang-red, #e52528);
  display: block;
  margin-bottom: 2px;
}

.price-num {
  font-size: 28px;
  font-weight: 900;
  color: var(--coupang-red, #e52528);
}

.currency {
  font-size: 16px;
  margin-right: 4px;
}

.product-desc {
  font-size: 14px;
  color: var(--text-secondary, #4b5563);
  line-height: 1.6;
}

/* 規格網格 */
.specs-box {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 14px;
  border: 1px solid var(--border-color, #e5e7eb);
}

.spec-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.spec-label {
  font-size: 11px;
  color: var(--text-muted, #9ca3af);
}

.spec-value {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-primary, #111827);
}

/* 購買控制列 */
.action-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.qty-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

.qty-btn {
  width: 38px;
  height: 38px;
  background: #ffffff;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  color: var(--text-primary, #111827);
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover {
  background: #f1f5f9;
}

.qty-num {
  width: 36px;
  text-align: center;
  font-size: 14px;
  font-weight: 800;
}

.cart-btn, .buy-btn {
  flex: 1;
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 800;
}

.toast-success {
  background: #ecfdf5;
  color: var(--coupang-green, #00a862);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid #a7f3d0;
}

/* 評論區塊 */
.reviews-section {
  background: #ffffff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 16px;
  padding: 28px;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06));
}

.section-title {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary, #111827);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.review-item {
  background: #f8fafc;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 16px;
}

.review-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stars {
  color: var(--coupang-yellow, #ff9800);
  font-size: 14px;
}

.date {
  font-size: 11px;
  color: var(--text-muted, #9ca3af);
}

.comment {
  font-size: 13px;
  color: var(--text-secondary, #4b5563);
  line-height: 1.5;
}

/* RWD 斷點 */
@media (max-width: 840px) {
  .product-showcase-grid {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 24px;
  }

  .image-box {
    max-width: 100%;
  }

  .specs-box {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 540px) {
  .action-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .qty-control {
    justify-content: center;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
  }
}
</style>