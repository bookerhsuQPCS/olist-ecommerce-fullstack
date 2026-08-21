<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
  } catch (err) {
    console.error('載入商品失敗', err)
  } finally {
    loading.value = false
  }
}

function handleCategoryChange(catId: string) {
  selectedCategory.value = catId
  loadProducts()
}

function handleSearch() {
  loadProducts()
}

function handleSortChange() {
  loadProducts()
}

function addToCart(prod: Product, e: Event) {
  e.stopPropagation()
  cartStore.addItem(prod, 1)
}

function goToDetail(id: string) {
  router.push(`/product/${id}`)
}

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <div class="products-view">
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
          placeholder="🔍 搜尋嚴選商品名稱、規格關鍵字..."
          @keyup.enter="handleSearch"
        />
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
          <img :src="prod.image_url" :alt="prod.title" class="product-image" loading="lazy" />
          <span class="product-badge">{{ prod.category_name_en }}</span>
        </div>

        <div class="product-body">
          <h2 class="product-title" :title="prod.title">{{ prod.title }}</h2>

          <div class="product-rating">
            <span>⭐ {{ prod.rating_avg.toFixed(1) }}</span>
            <span class="review-count">({{ prod.review_count }})</span>
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

<style src="../assets/styles/products.css"></style>