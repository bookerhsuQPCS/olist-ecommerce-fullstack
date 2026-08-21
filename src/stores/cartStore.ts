import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, Product } from '../types'

const CART_STORAGE_KEY = 'olist_cart_items'

export const useCartStore = defineStore('cart', () => {
  // 從 LocalStorage 恢復購物車
  const items = ref<CartItem[]>(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]'))

  // 持久化儲存輔助函式
  function saveToStorage() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value))
  }

  // 1. 加入購物車 (相容 product_id 與 id)
  function addItem(product: Product, quantity: number = 1) {
    const pId = product.product_id || (product as any).id
    const existing = items.value.find(
      (item) => (item.product.product_id || (item.product as any).id) === pId
    )

    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }
    saveToStorage()
  }

  // 2. 更新特定商品數量
  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    const target = items.value.find(
      (item) => (item.product.product_id || (item.product as any).id) === productId
    )
    if (target) {
      target.quantity = quantity
      saveToStorage()
    }
  }

  // 3. 移除特定商品
  function removeItem(productId: string) {
    items.value = items.value.filter(
      (item) => (item.product.product_id || (item.product as any).id) !== productId
    )
    saveToStorage()
  }

  // 4. 清空購物車
  function clearCart() {
    items.value = []
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  // 計算屬性：商品總件數
  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // 計算屬性：實付總金額
  const totalAmount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  })

  return {
    items,
    totalCount,
    totalAmount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  }
})