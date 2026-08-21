<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnalyticsStore } from '../stores/analyticsStore'
import { fetchRecentOrders } from '../services/api'
import type { Order } from '../types'

const analyticsStore = useAnalyticsStore()
const recentOrders = ref<Order[]>([])
const loadingOrders = ref(false)

async function loadData() {
  // 1. 載入 BI 聚合指標
  await analyticsStore.loadAnalytics()

  // 2. 載入最新訂單佇列
  loadingOrders.value = true
  try {
    recentOrders.value = await fetchRecentOrders()
  } catch (err) {
    console.error('無法取得最新訂單日誌', err)
  } finally {
    loadingOrders.value = false
  }
}

onMounted(() => {
  loadData()
})

// 1. 月度營收趨勢圖 (酷澎藍漸層)
const trendChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    textStyle: { color: '#111827' },
    extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);'
  },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
  xAxis: {
    type: 'category',
    data: analyticsStore.monthly.map((m) => m.month),
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisLabel: { color: '#4b5563' }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#f3f4f6' } },
    axisLabel: {
      color: '#4b5563',
      formatter: (v: number) => `R$ ${(v / 1000).toFixed(0)}k`
    }
  },
  series: [
    {
      name: '月營收 (GMV)',
      type: 'line',
      smooth: true,
      data: analyticsStore.monthly.map((m) => m.revenue),
      itemStyle: { color: '#0074e9' },
      lineStyle: { width: 3, color: '#0074e9' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 116, 233, 0.25)' },
            { offset: 1, color: 'rgba(0, 116, 233, 0.01)' }
          ]
        }
      }
    }
  ]
}))

// 2. 巴西各州銷售排行圖 (酷澎特賣紅直條)
const stateChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    textStyle: { color: '#111827' },
    extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);'
  },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
  xAxis: {
    type: 'category',
    data: analyticsStore.states.map((s) => s.state),
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisLabel: { color: '#4b5563' }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#f3f4f6' } },
    axisLabel: {
      color: '#4b5563',
      formatter: (v: number) => `R$ ${(v / 1000).toFixed(0)}k`
    }
  },
  series: [
    {
      name: '各州銷售額',
      type: 'bar',
      barWidth: '40%',
      data: analyticsStore.states.map((s) => s.revenue),
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: '#e52528'
      }
    }
  ]
}))

// 3. 支付佔比環形圖
const paymentChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    textStyle: { color: '#111827' },
    extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);',
    formatter: '{b}: <br/><b>R$ {c}</b> ({d}%)'
  },
  legend: {
    bottom: '0%',
    textStyle: { color: '#4b5563', fontSize: 12 }
  },
  series: [
    {
      name: '支付方式',
      type: 'pie',
      radius: ['45%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#ffffff',
        borderWidth: 2
      },
      label: { show: false },
      data: analyticsStore.payments.map((p, idx) => {
        const colors = ['#0074e9', '#ff9800', '#00a862', '#8b5cf6']
        return {
          name: p.type,
          value: p.value,
          itemStyle: { color: colors[idx % colors.length] }
        }
      })
    }
  ]
}))
</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <div class="dashboard-title-group">
        <h1 class="dashboard-main-title">
          <span>📊</span>
          <span>Olist 巴西大數據 BI 營運儀表板</span>
        </h1>
        <p class="dashboard-subtitle">
          直連 SQLite 資料庫 SQL 聚合計算，即時反映 GMV、區域分佈與巴西在地支付
        </p>
      </div>

      <div class="live-badge">
        <span class="live-dot"></span>
        <span>SQLite 資料庫即時連線中</span>
      </div>
    </div>

    <!-- 頂部 4 大 KPI 核心指標卡片 -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon">💰</div>
        <div class="kpi-label">全站累積營收 (GMV)</div>
        <div class="kpi-value cyan">
          R$ {{ analyticsStore.summary.total_gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon">📦</div>
        <div class="kpi-label">累積總訂單數</div>
        <div class="kpi-value mint">
          {{ analyticsStore.summary.total_orders.toLocaleString() }} 筆
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon">🏷️</div>
        <div class="kpi-label">平均客單價 (AOV)</div>
        <div class="kpi-value coral">
          R$ {{ analyticsStore.summary.avg_ticket.toFixed(2) }}
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon">⭐</div>
        <div class="kpi-label">顧客好評率 (4~5星)</div>
        <div class="kpi-value yellow">
          {{ analyticsStore.summary.five_star_rate }}%
        </div>
      </div>
    </div>

    <!-- 中間圖表網格 -->
    <div class="charts-grid">
      <div class="chart-card">
        <h2 class="chart-title">
          <span>📈</span>
          <span>月度營收 GMV 趨勢 (BRL)</span>
        </h2>
        <div class="chart-wrapper">
          <v-chart :option="trendChartOption" autoresize />
        </div>
      </div>

      <div class="chart-card">
        <h2 class="chart-title">
          <span>📍</span>
          <span>巴西主要州別銷售額排名 (Top States)</span>
        </h2>
        <div class="chart-wrapper">
          <v-chart :option="stateChartOption" autoresize />
        </div>
      </div>

      <div class="chart-card" style="grid-column: span 2;">
        <h2 class="chart-title">
          <span>💳</span>
          <span>巴西在地支付方式份額佔比 (Payment Method GMV)</span>
        </h2>
        <div class="chart-wrapper">
          <v-chart :option="paymentChartOption" autoresize />
        </div>
      </div>
    </div>

    <!-- 底部即時訂單交易記錄 (從 SQLite orders 資料表查詢) -->
    <div class="table-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 class="chart-title" style="margin-bottom: 0;">
          <span>📝</span>
          <span>最新前台下單即時日誌 (SQLite 資料庫寫入記錄)</span>
        </h2>
        <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;" @click="loadData">
          🔄 重新整理
        </button>
      </div>

      <table v-if="recentOrders.length > 0" class="order-table">
        <thead>
          <tr>
            <th>訂單編號</th>
            <th>配送州別 / 城市</th>
            <th>商品明細</th>
            <th>支付方式</th>
            <th>訂單金額</th>
            <th>狀態</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ord in recentOrders" :key="ord.order_id">
            <td style="font-family: monospace; color: var(--coupang-blue); font-weight: 700;">
              {{ ord.order_id }}
            </td>
            <td>{{ ord.customer_state }} - {{ ord.customer_city }}</td>
            <td>{{ ord.items.map((i) => `${i.product.title.slice(0, 15)}... x${i.quantity}`).join(', ') }}</td>
            <td>{{ ord.payment_type }} ({{ ord.installments }}期)</td>
            <td style="font-weight: 800; color: var(--coupang-red);">
              R$ {{ ord.total_amount.toFixed(2) }}
            </td>
            <td>
              <span class="live-badge" style="padding: 2px 8px; font-size: 11px;">
                {{ ord.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else style="text-align: center; color: var(--text-muted); padding: 24px 0;">
        目前尚無新下單紀錄，前往商城前台結帳後將在此即時呈現！
      </div>
    </div>
  </div>
</template>

<style src="../assets/styles/dashboard.css"></style>