<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCartStore } from './stores/cartStore'
import { useAuthStore } from './stores/authStore'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="app-layout">
    <header class="navbar">
      <div class="nav-content">
        <!-- Logo -->
        <router-link to="/" class="nav-brand">
          <span class="brand-badge">✨</span>
          <span class="brand-text">歐選嚴選</span>
        </router-link>

        <!-- 導覽連結 -->
        <nav class="nav-links">
          <router-link to="/" class="nav-link">
            <span>🛍️ 商城</span>
          </router-link>

          <router-link to="/cart" class="nav-link cart-link">
            <span>🛒 購物車</span>
            <span v-if="cartStore.totalCount > 0" class="nav-badge">
              {{ cartStore.totalCount }}
            </span>
          </router-link>

          <!-- 登入後可見：我的訂單 -->
          <router-link v-if="authStore.isAuthenticated" to="/orders" class="nav-link">
            <span>📦 我的訂單</span>
          </router-link>

          <!-- 僅在符合白名單時顯示 BI 儀表板 -->
          <router-link v-if="authStore.isAdmin" to="/dashboard" class="nav-link admin-link">
            <span>📊 BI 儀表板</span>
          </router-link>

          <!-- 會員登入 / 登出狀態 -->
          <div v-if="authStore.isAuthenticated" class="auth-box">
            <span class="user-name">👤 {{ authStore.currentUser?.name }}</span>
            <button class="btn btn-outline btn-sm" @click="handleLogout">
              登出
            </button>
          </div>

          <router-link v-else to="/login" class="btn btn-primary btn-sm login-btn">
            登入 / 註冊
          </router-link>
        </nav>
      </div>
    </header>

    <main class="page-container">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.navbar {
  background: var(--bg-surface, #ffffff);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 64px;
  padding: 0 24px;
  max-width: 1280px;
  margin: 0 auto;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 900;
  color: var(--coupang-blue, #0074e9);
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary, #4b5563);
  text-decoration: none;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--coupang-blue, #0074e9);
  background: #eff6ff;
}

.admin-link {
  color: #7c3aed !important;
  background: #f5f3ff;
}

.cart-link {
  position: relative;
}

.nav-badge {
  background: var(--coupang-red, #e52528);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
}

.auth-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 6px;
}

.user-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary, #4b5563);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
}

.page-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 20px 60px;
}

@media (max-width: 680px) {
  .nav-content {
    padding: 10px 14px;
  }
  .nav-brand {
    font-size: 17px;
  }
  .nav-links {
    gap: 4px;
  }
  .nav-link {
    padding: 6px 8px;
    font-size: 12px;
  }
}
</style>