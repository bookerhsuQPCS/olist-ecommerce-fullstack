import { createRouter, createWebHistory } from 'vue-router'
import ProductsView from '../views/ProductsView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CartView from '../views/CartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import OrdersView from '../views/OrdersView.vue'
import { useAuthStore } from '../stores/authStore'

const routes = [
  { path: '/', name: 'products', component: ProductsView },
  { path: '/product/:id', name: 'product-detail', component: ProductDetailView },
  { path: '/cart', name: 'cart', component: CartView },
  { path: '/checkout', name: 'checkout', component: CheckoutView, meta: { requiresAuth: true } },
  { path: '/orders', name: 'orders', component: OrdersView, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAdmin: true } },
  { path: '/login', name: 'login', component: LoginView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // 1. 需要登入的頁面
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 2. BI 儀表板：只對白名單管理者開放
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }
    if (!authStore.isAdmin) {
      alert('⚠️ 存取被拒：BI 儀表板僅對管理者白名單帳號開放！')
      return next('/')
    }
  }

  next()
})

export default router