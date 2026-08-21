import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AnalyticsSummary, MonthlyTrend, StateSales, PaymentShare } from '../types'
import { fetchAnalytics } from '../services/api'

export const useAnalyticsStore = defineStore('analytics', () => {
  const summary = ref<AnalyticsSummary>({
    total_gmv: 0,
    total_orders: 0,
    avg_ticket: 0,
    avg_delivery_days: 0,
    five_star_rate: 0
  })

  const monthly = ref<MonthlyTrend[]>([])
  const states = ref<StateSales[]>([])
  const payments = ref<PaymentShare[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 從後端 API 載入最新 BI 聚合數據
  async function loadAnalytics() {
    loading.value = true
    error.value = null
    try {
      const data = await fetchAnalytics()
      summary.value = data.summary
      monthly.value = data.monthly
      states.value = data.states
      payments.value = data.payments
    } catch (err: any) {
      error.value = err.message || '載入營運數據失敗'
    } finally {
      loading.value = false
    }
  }

  return {
    summary,
    monthly,
    states,
    payments,
    loading,
    error,
    loadAnalytics
  }
})