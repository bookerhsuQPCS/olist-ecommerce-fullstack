<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isRegisterMode = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const otp = ref('')

const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

// OTP 發送冷卻計時器 (60 秒)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

async function handleSendOtp() {
  if (!email.value.trim()) {
    errorMessage.value = '請先填寫電子信箱'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const res = await authStore.sendOtpCode(email.value.trim())
    successMessage.value = res.message || 'OTP 驗證碼已發送，請至後端終端機 Console 查看！'
    countdown.value = 60
    timer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--
      } else {
        if (timer) clearInterval(timer)
      }
    }, 1000)
  } catch (err: any) {
    errorMessage.value = err.message || '發送驗證碼失敗'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    if (isRegisterMode.value) {
      if (!otp.value.trim()) {
        throw new Error('請輸入收到的 6 位數 Email 驗證碼')
      }
      await authStore.register(email.value.trim(), password.value, name.value.trim(), otp.value.trim())
    } else {
      await authStore.login(email.value.trim(), password.value)
    }

    const redirectPath = (route.query.redirect as string) || '/'
    router.push(redirectPath)
  } catch (err: any) {
    errorMessage.value = err.message || '驗證失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}

function switchMode() {
  isRegisterMode.value = !isRegisterMode.value
  errorMessage.value = ''
  successMessage.value = ''
  otp.value = ''
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <div class="brand-badge">
          <span>✨</span>
          <span>歐選嚴選</span>
        </div>
        <h1 class="login-title">
          {{ isRegisterMode ? '建立會員帳號 (Email OTP 認證)' : '會員登入' }}
        </h1>
        <p class="login-subtitle">
          {{ isRegisterMode ? '填寫基本資訊並完成信箱驗證即可開啟購物體驗' : '歡迎回到 歐選嚴選・跨境品質生活館' }}
        </p>
      </div>

      <!-- 錯誤提示訊息 -->
      <div v-if="errorMessage" class="alert-box error-box">
        ⚠️ {{ errorMessage }}
      </div>

      <!-- 成功提示訊息 -->
      <div v-if="successMessage" class="alert-box success-box">
        ✓ {{ successMessage }}
      </div>

      <!-- 表單本體 -->
      <form class="login-form" @submit.prevent="handleSubmit">
        <!-- 註冊模式：姓名 -->
        <div v-if="isRegisterMode" class="form-item">
          <label class="form-label">姓名 / 稱謂</label>
          <input
            v-model="name"
            type="text"
            class="input-control"
            placeholder="例：王小明"
            required
          />
        </div>

        <!-- 電子信箱 + 發送驗證碼按鈕 -->
        <div class="form-item">
          <label class="form-label">電子信箱</label>
          <div class="email-input-group">
            <input
              v-model="email"
              type="email"
              class="input-control"
              placeholder="name@example.com"
              required
            />
            <button
              v-if="isRegisterMode"
              type="button"
              class="btn btn-outline otp-send-btn"
              :disabled="countdown > 0 || loading"
              @click="handleSendOtp"
            >
              <span v-if="countdown > 0">{{ countdown }} 秒後重發</span>
              <span v-else>獲取驗證碼</span>
            </button>
          </div>
        </div>

        <!-- 註冊專用：6 位數 OTP 欄位 -->
        <div v-if="isRegisterMode" class="form-item">
          <label class="form-label">Email 驗證碼 (6 位數)</label>
          <input
            v-model="otp"
            type="text"
            maxlength="6"
            class="input-control otp-input"
            placeholder="請輸入 6 位數驗證碼"
            required
          />
        </div>

        <!-- 密碼 -->
        <div class="form-item">
          <label class="form-label">密碼</label>
          <input
            v-model="password"
            type="password"
            class="input-control"
            placeholder="請輸入密碼"
            required
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary submit-btn"
          :disabled="loading"
        >
          <span v-if="loading">處理中...</span>
          <span v-else>{{ isRegisterMode ? '驗證並完成註冊' : '立即登入' }}</span>
        </button>
      </form>

      <!-- 登入 / 註冊 模式切換 -->
      <div class="switch-mode">
        <span v-if="!isRegisterMode">還沒有會員帳號嗎？</span>
        <span v-else>已經有會員帳號了？</span>
        <a
          href="javascript:void(0)"
          class="switch-link"
          @click="switchMode"
        >
          {{ isRegisterMode ? '點此登入' : '免費註冊' }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: calc(80vh - 120px);
  padding: 20px 16px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 16px;
  padding: 36px 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eff6ff;
  color: var(--coupang-blue, #0074e9);
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 900;
  margin-bottom: 12px;
}

.login-title {
  font-size: 20px;
  font-weight: 900;
  color: var(--text-primary, #111827);
  margin-bottom: 6px;
}

.login-subtitle {
  font-size: 13px;
  color: var(--text-secondary, #4b5563);
}

.alert-box {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 16px;
}

.error-box {
  background: #fee2e2;
  color: #e52528;
}

.success-box {
  background: #ecfdf5;
  color: #00a862;
  border: 1px solid #a7f3d0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.form-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary, #4b5563);
}

.email-input-group {
  display: flex;
  gap: 8px;
}

.otp-send-btn {
  white-space: nowrap;
  font-size: 13px;
  padding: 0 14px;
  flex-shrink: 0;
}

.otp-input {
  letter-spacing: 4px;
  font-size: 16px;
  font-weight: 800;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 800;
  margin-top: 8px;
  border-radius: 8px;
}

.switch-mode {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-secondary, #4b5563);
}

.switch-link {
  color: var(--coupang-blue, #0074e9);
  font-weight: 800;
  margin-left: 6px;
  cursor: pointer;
  text-decoration: none;
}

.switch-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px 18px;
    border-radius: 12px;
  }
}
</style>