<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchProducts } from '../services/api'
import { useCartStore } from '../stores/cartStore'
import type { Product } from '../types'

const router = useRouter()
const cartStore = useCartStore()

const products = ref<Product[]>([])
const loading = ref(true)
const selectedCategory = ref('all')
const searchQuery = ref('')
const selectedSort = ref('featured')

// 購物車提示 Toast 狀態
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer: any = null
let debounceTimer: any = null

const categories = [
  { id: 'all', name: '全部商品', icon: '✨' },
  { id: 'health_beauty', name: '美妝個護', icon: '💄' },
  { id: 'computers_accessories', name: '電腦 3C', icon: '💻' },
  { id: 'watches_gifts', name: '鐘錶精品', icon: '⌚' },
  { id: 'bed_bath_table', name: '居家寢具', icon: '🛏️' },
  { id: 'sports_leisure', name: '運動休閒', icon: '⚽' },
  { id: 'auto', name: '汽車配件', icon: '🚗' },
  { id: 'housewares', name: '日用雜貨', icon: '🍳' }
]

async function loadProducts() {
  loading.value = true
  try {
    products.value = await fetchProducts(
      selectedCategory.value,
      searchQuery.value.trim(),
      selectedSort.value
    )
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

// 監聽關鍵字輸入，加入 300ms 防抖即時搜尋
watch(searchQuery, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadProducts()
  }, 300)
})

function handleCategoryChange(catId: string) {
  selectedCategory.value = catId
  loadProducts()
}

function handleSortChange() {
  loadProducts()
}

function clearSearch() {
  searchQuery.value = ''
  loadProducts()
}

// 加入購物車並觸發 Toast 提示
function addToCart(prod: Product, e: Event) {
  e.stopPropagation()
  cartStore.addItem(prod, 1)

  toastMessage.value = `✓ 已成功將「${prod.title}」加入購物車！`
  toastVisible.value = true

  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2500)
}

function goToDetail(id: string) {
  router.push(`/product/${id}`)
}

function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80'
}

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <div class="products-view">
    <!-- 加入購物車懸浮 Toast 提示 -->
    <Transition name="toast-slide">
      <div v-if="toastVisible" class="toast-floating-card">
        <div class="toast-content">
          <span class="toast-icon">🛒</span>
          <span class="toast-text">{{ toastMessage }}</span>
        </div>
        <router-link to="/cart" class="toast-cart-btn">前往結帳 →</router-link>
      </div>
    </Transition>

    <!-- 首頁橫幅 (歐選嚴選) -->
    <div class="hero-section">
      <h1 class="hero-title">
        <span>🌟</span>
        <span>歐選嚴選・跨境品質生活館</span>
      </h1>
      <p class="hero-subtitle">
        直連 SQLite 資料庫，全站商品享新台幣計價、全台快速配送與安全線上金流
      </p>
    </div>

    <!-- 搜尋與排序工具列 -->
    <div class="toolbar-section">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          class="input-control"
          placeholder="🔍 即時搜尋嚴選商品名稱、品類..."
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">✕</button>
      </div>

      <div class="sort-box">
        <select v-model="selectedSort" class="sort-select" @change="handleSortChange">
          <option value="featured">🔥 熱銷排行 (預設)</option>
          <option value="rating">⭐ 顧客評價最高</option>
          <option value="price_asc">💰 價格：由低到高</option>
          <option value="price_desc">💎 價格：由高到低</option>
        </select>
      </div>
    </div>

    <!-- 分類選單 -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.id"
        :class="['category-tab', { active: selectedCategory === cat.id }]"
        @click="handleCategoryChange(cat.id)"
      >
        <span>{{ cat.icon }}</span>
        <span>{{ cat.name }}</span>
      </button>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="empty-state">
      <p>⏳ 正在讀取歐選嚴選商品資料庫...</p>
    </div>

    <!-- 查無商品 -->
    <div v-else-if="products.length === 0" class="empty-state">
      <p>🔍 查無符合條件的嚴選商品，請嘗試更換關鍵字或分類。</p>
    </div>

    <!-- 商品網格 -->
    <div v-else class="products-grid">
      <div
        v-for="prod in products"
        :key="prod.product_id"
        class="product-card"
        @click="goToDetail(prod.product_id)"
      >
        <div class="product-image-wrap">
          <img
            :src="prod.image_url"
            :alt="prod.title"
            class="product-image"
            loading="lazy"
            @error="handleImgError"
          />
          <span class="product-badge">{{ prod.category_name_en }}</span>
        </div>

        <div class="product-body">
          <h2 class="product-title" :title="prod.title">{{ prod.title }}</h2>

          <div class="product-rating">
            <span>⭐ {{ (prod.rating_avg || 5.0).toFixed(1) }}</span>
            <span class="review-count">({{ prod.review_count || 0 }})</span>
          </div>

          <div class="product-footer">
            <div class="product-price">
              <span class="currency">NT$</span>
              <span>{{ Math.round(prod.price * 6.5) }}</span>
            </div>
            <button
              class="btn btn-primary btn-sm cart-action-btn"
              title="加入購物車"
              @click="addToCart(prod, $event)"
            >
              <span>🛒 加入購物車</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;
}

.clear-search-btn:hover {
  color: var(--text-primary, #111827);
}

.toast-floating-card {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 14px;
  background: #0f172a;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-icon {
  font-size: 20px;
}

.toast-text {
  font-size: 14px;
  font-weight: 700;
}

.toast-cart-btn {
  background: #00a862;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 6px;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.toast-cart-btn:hover {
  background: #008f53;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>

<style src="../assets/styles/products.css"></style>