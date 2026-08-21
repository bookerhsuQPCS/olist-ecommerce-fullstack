import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginUser, registerUser, sendOtp } from '../services/api'

interface User {
  user_id: string
  email: string
  name: string
  is_admin?: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(
    JSON.parse(localStorage.getItem('olist_user') || 'null')
  )
  const token = ref<string | null>(localStorage.getItem('olist_token') || null)

  const isAuthenticated = computed(() => !!currentUser.value)
  const isAdmin = computed(() => !!currentUser.value?.is_admin)

  // 發送 OTP 驗證碼
  async function sendOtpCode(email: string) {
    return await sendOtp(email)
  }

  // 驗證 OTP 並註冊
  async function register(email: string, password: string, name: string, otp: string) {
    const res = await registerUser(email, password, name, otp)
    currentUser.value = res.user
    token.value = res.token
    localStorage.setItem('olist_user', JSON.stringify(res.user))
    localStorage.setItem('olist_token', res.token)
  }

  // 登入
  async function login(email: string, password: string) {
    const res = await loginUser(email, password)
    currentUser.value = res.user
    token.value = res.token
    localStorage.setItem('olist_user', JSON.stringify(res.user))
    localStorage.setItem('olist_token', res.token)
  }

  // 登出
  function logout() {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('olist_user')
    localStorage.removeItem('olist_token')
  }

  return {
    currentUser,
    token,
    isAuthenticated,
    isAdmin,
    sendOtpCode,
    register,
    login,
    logout
  }
})