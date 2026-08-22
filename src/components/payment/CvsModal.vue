<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  show: boolean
  amount: number
  recipientName: string
  recipientPhone: string
}>()

const emit = defineEmits<{
  (e: 'success', storeInfo: { cvsType: string; storeName: string; storeCode: string }): void
  (e: 'cancel'): void
}>()

const cvsType = ref('7-ELEVEN')
const storeName = ref('信義旗艦店')
const storeCode = ref('128892')
const isSubmitting = ref(false)

const storesPreset = [
  { type: '7-ELEVEN', name: '台北市信義區 信義市府店', code: '992104' },
  { type: '全家便利商店', name: '台北市中正區 忠孝新生店', code: '018823' },
  { type: '7-ELEVEN', name: '新北市板橋區 板橋新站店', code: '115482' },
  { type: '全家便利商店', name: '台中市西區 勤美誠品店', code: '014491' }
]

function selectPreset(preset: any) {
  cvsType.value = preset.type
  storeName.value = preset.name
  storeCode.value = preset.code
}

function handleConfirm() {
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    emit('success', {
      cvsType: cvsType.value,
      storeName: storeName.value,
      storeCode: storeCode.value
    })
  }, 800)
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-head">
        <div class="brand">
          <span class="brand-icon">🏪</span>
          <div>
            <div class="brand-title">超商取貨付款 (CVS COD)</div>
            <div class="brand-sub">7-ELEVEN / 全家 貨到超商門市再付款</div>
          </div>
        </div>
        <button class="close-btn" @click="emit('cancel')">✕</button>
      </div>

      <div class="modal-body">
        <div class="cvs-tabs">
          <button
            :class="['cvs-tab', cvsType === '7-ELEVEN' && 'active 7-11']"
            @click="cvsType = '7-ELEVEN'"
          >
            🟢 7-ELEVEN 超商取貨
          </button>
          <button
            :class="['cvs-tab', cvsType === '全家便利商店' && 'active family']"
            @click="cvsType = '全家便利商店'"
          >
            🔵 全家 FamilyMart 取貨
          </button>
        </div>

        <div class="form-group">
          <label>快速選擇模擬熱門門市：</label>
          <div class="preset-chips">
            <button
              v-for="s in storesPreset"
              :key="s.code"
              class="chip-btn"
              type="button"
              @click="selectPreset(s)"
            >
              {{ s.name }}
            </button>
          </div>
        </div>

        <div class="store-info-box">
          <div class="info-row">
            <span>取貨門市名稱：</span>
            <b>{{ storeName }} ({{ cvsType }})</b>
          </div>
          <div class="info-row">
            <span>電子門市店號：</span>
            <span class="code">{{ storeCode }}</span>
          </div>
          <div class="info-row">
            <span>取件人證件姓名：</span>
            <span>{{ recipientName }}</span>
          </div>
          <div class="info-row">
            <span>取件通知手機：</span>
            <span>{{ recipientPhone }}</span>
          </div>
          <div class="info-row total-row">
            <span>門市到付應收金額：</span>
            <span class="amt">NT$ {{ amount }}</span>
          </div>
        </div>

        <div class="notice-box">
          <p>⚠️ 包裹配達指定超商門市時將發送簡訊通知，請攜帶身分證件於 7 天內前往取件付款。</p>
        </div>
      </div>

      <div class="modal-foot">
        <button class="btn btn-outline" @click="emit('cancel')">返回收銀台</button>
        <button class="btn btn-mint submit-btn" :disabled="isSubmitting" @click="handleConfirm">
          <span v-if="isSubmitting">確認門市中...</span>
          <span v-else>確認門市並下單</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.65); display: flex; align-items: center; justify-content: center;
  z-index: 9999; backdrop-filter: blur(4px);
}
.modal-card { width: 90%; max-width: 460px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }
.modal-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #0f172a; color: #ffffff; }
.brand { display: flex; align-items: center; gap: 10px; }
.brand-icon { font-size: 24px; }
.brand-title { font-size: 14px; font-weight: 800; color: #38bdf8; }
.brand-sub { font-size: 11px; color: #94a3b8; }
.close-btn { background: transparent; border: none; color: #94a3b8; font-size: 16px; cursor: pointer; }
.modal-body { padding: 20px; }
.cvs-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
.cvs-tab { padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; font-size: 13px; font-weight: 700; cursor: pointer; }
.cvs-tab.active { border-color: #0074e9; background: #eff6ff; color: #0074e9; }
.form-group label { font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px; display: block; }
.preset-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.chip-btn { padding: 4px 10px; font-size: 11px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 999px; cursor: pointer; font-weight: 600; color: #334155; }
.chip-btn:hover { background: #e2e8f0; }
.store-info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
.info-row { display: flex; justify-content: space-between; align-items: center; color: #475569; }
.info-row .code { font-family: monospace; font-weight: 800; color: #0284c7; }
.total-row { margin-top: 6px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-weight: 800; color: #0f172a; }
.total-row .amt { font-size: 18px; font-weight: 900; color: #e52528; }
.notice-box { margin-top: 12px; font-size: 11px; color: #64748b; line-height: 1.5; }
.modal-foot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
.submit-btn { background: #00a862; color: #ffffff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 800; cursor: pointer; }
</style>