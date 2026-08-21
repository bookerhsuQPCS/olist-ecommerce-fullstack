# 歐選嚴選 (Olist Selection) - 現代化電商平台

基於 **Vue 3 + TypeScript + Vite** 前端與 **Node.js (Express) + SQLite** 後端打造的現代化電商購物系統。整合真實 Email OTP 驗證、加購推薦引擎、BI 商業智慧儀表板與現代金融級安全防禦架構。

---

## 🌟 核心功能特色

* **會員認證系統**：
  * 支援 Resend API 真實發送 6 位數 Email OTP 驗證碼。
  * 具備時效驗證（5 分鐘）與防暴力破解機制。
* **電商購物與結帳**：
  * 商品目錄瀏覽、多維度篩選與即時搜尋。
  * 購物車狀態管理與折價券核銷。
  * 支援信用卡、LINE Pay、超商取貨等模擬付款方式。
* **加購推薦引擎（Cross-Selling）**：
  * 基於購物車內容的「啟發式規則推薦模型」，動態推薦同類別、中低單價且高評價的熱門商品。
* **BI 商業數據儀表板**：
  * 管理者白名單權限管控。
  * 即時 GMV、訂單量、區域銷售分佈與付款偏好圖表分析。
* **金融級安全防禦（Zero Trust & Anti-Tamper）**：
  * **狀態全內聚後端**：結帳金額 100% 由後端資料庫原價重算，杜絕前端竄改價格。
  * **API 請求防禦**：全面採用 `HMAC-SHA256` 簽章與 `Nonce + Timestamp`，防止中間人竄改與重放攻擊（Replay Attack）。
  * **密碼學安全 ID**：使用 CSPRNG 生成不可預測的高熵訂單序號。

---

## 🛠 技術堆疊

### 前端 (Frontend)
* **Framework**: Vue 3 (Composition API with `<script setup>`)
* **Build Tool**: Vite
* **Language**: TypeScript
* **State Management**: Pinia
* **Router**: Vue Router 4
* **Security**: Web Crypto API (原生 HMAC-SHA256 運算)

### 後端 (Backend)
* **Runtime**: Node.js
* **Framework**: Express
* **Database**: SQLite (`better-sqlite3`)
* **Email Service**: Resend API
* **Security**: Node.js `crypto` 模組 (HMAC, CSPRNG, Timing-Safe Equal)

---

## 🚀 快速開始

### 1. 環境需求
* Node.js >= 18.0.0
* npm >= 9.0.0

### 2. 安裝依賴

**安裝前端依賴：**
```bash
npm install