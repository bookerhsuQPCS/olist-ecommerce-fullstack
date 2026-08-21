<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { fetchUserOrders } from '../services/api'

const authStore = useAuthStore()
const orders = ref<any[]>([])
const loading = ref(true)
const errorMessage = ref('')

async function loadOrders() {
  if (!authStore.currentUser?.user_id) return
  loading.value = true
  errorMessage.value = ''
  try {
    orders.value = await fetchUserOrders(authStore.currentUser.user_id)
  } catch (err: any) {
    errorMessage.value = err.message || '查詢訂單失敗'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<template>
  <div class="orders-page">
    <div class="page-header">
      <h1 class="page-title">
        <span>📦</span>
        <span>我的訂單查詢</span>
      </h1>
      <p class="page-subtitle">查詢您的歷史訂購紀錄、台灣在地配送物流與即時付款進度</p>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="state-card">
      <p>⏳ 正在查詢您的訂單資料...</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="errorMessage" class="state-card error">
      <p>⚠️ {{ errorMessage }}</p>
    </div>

    <!-- 無訂單狀態 -->
    <div v-else-if="orders.length === 0" class="empty-card">
      <div class="empty-icon">🧾</div>
      <p class="empty-title">查無歷史訂單紀錄</p>
      <p class="empty-desc">您目前尚未在商城內完成下單。</p>
      <router-link to="/" class="btn btn-primary" style="margin-top: 16px; display: inline-flex;">
        前往商城選購
      </router-link>
    </div>

    <!-- 訂單清單卡片 -->
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.order_id" class="order-card">
        <div class="order-head">
          <div class="order-meta">
            <span class="ord-id">訂單編號：{{ order.order_id }}</span>
            <span class="ord-date">訂購日期：{{ order.created_at }}</span>
          </div>
          <span class="ord-status-pill">{{ order.status }}</span>
        </div>

        <div class="order-body">
          <div class="order-items">
            <div v-for="item in order.items" :key="item.product.product_id" class="order-item-row">
              <img :src="item.product.image_url" :alt="item.product.title" class="item-img" />
              <div class="item-info">
                <div class="item-name">{{ item.product.title }}</div>
                <div class="item-sub">NT$ {{ Math.round(item.product.price * 6.5) }} × {{ item.quantity }}</div>
              </div>
            </div>
          </div>

          <div class="order-summary-box">
            <div class="info-row">
              <span>付款方式：</span>
              <span class="val">{{ order.payment_type }}</span>
            </div>
            <div class="info-row">
              <span>收件地址：</span>
              <span class="val">{{ order.customer_city }}</span>
            </div>
            <div class="info-row total-row">
              <span>實付總額：</span>
              <span class="price-twd">NT$ {{ Math.round(order.total_amount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  max-width: 900px;
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

.state-card, .empty-card {
  text-align: center;
  padding: 48px 20px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid var(--border-color);
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.empty-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
}

.empty-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.order-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: #f8fafc;
  border-bottom: 1px solid var(--border-color);
}

.order-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.ord-id {
  font-weight: 800;
  color: var(--coupang-blue);
  font-family: monospace;
}

.ord-status-pill {
  font-size: 12px;
  font-weight: 800;
  color: var(--coupang-green);
  background: #ecfdf5;
  padding: 4px 10px;
  border-radius: 999px;
}

.order-body {
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 20px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.item-img {
  width: 52px;
  height: 52px;
  border-radius: 6px;
  object-fit: cover;
  background: #f1f5f9;
}

.item-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.item-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.order-summary-box {
  border-left: 1px dashed var(--border-color);
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-secondary);
}

.info-row .val {
  font-weight: 700;
  color: var(--text-primary);
}

.total-row {
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.price-twd {
  font-size: 18px;
  font-weight: 900;
  color: var(--coupang-red);
}

@media (max-width: 640px) {
  .order-body {
    grid-template-columns: 1fr;
  }
  .order-summary-box {
    border-left: none;
    border-top: 1px dashed var(--border-color);
    padding-left: 0;
    padding-top: 14px;
  }
  .order-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>