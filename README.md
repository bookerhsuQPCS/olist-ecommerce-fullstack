# 歐選嚴選 (Olist Selection) - 現代化全端電商平台

基於 **Vue 3 + TypeScript + Vite** 前端與 **Node.js (Express) + SQLite** 後端打造的高效能現代化跨境電商系統。整合真實 Email OTP 驗證、金融級 HMAC-SHA256 防竄改機制、信用卡 3D Secure 模擬驗證、多渠道在地化金流與加購推薦引擎。

---

## 🌟 核心功能特色

### 1. 會員認證與帳號安全
* **Email OTP 動態驗證**：支援 Resend API 發送 6 位數一次性動態密碼，具備 5 分鐘時效防護。
* **密碼安全雜湊**：後端全面使用 `HMAC-SHA256` 進行密碼雜湊與驗證，絕不儲存明文密碼。
* **防列舉攻擊 (User Enumeration)**：認證失敗統一模糊化錯誤訊息，阻絕帳號探測。

### 2. 現代化電商購物體驗
* **即時搜尋與多維排序**：內建搜尋防抖（Debounce），支援商品品名與品類即時檢索、高評分與價格區間排序。
* **購物體驗優化**：商品加入購物車即時彈出懸浮 Toast 提示，支援圖片載入失敗自動回退機制。
* **加購推薦引擎 (Cross-Selling)**：根據購物車現有商品與類別，動態推薦同品類高評價熱銷周邊。
* **優惠券折抵**：支援結帳折扣碼自動驗證與金額扣抵（如 `VIP2026`）。

### 3. 多元擬真金流收銀台 (Taiwan Localized Checkout)
* **信用卡付款 (3D Secure)**：完整卡號格式化校驗（16碼/有效期限/CVC），並觸發後端生成之 6 位數 3DS 銀行驗證碼。
* **LINE Pay 掃碼付款**：擬真 5 分鐘 QR Code 倒數與手機 App 支付授權回呼。
* **ATM 虛擬帳號**：動態指派繳款銀行代碼與 16 碼虛擬帳號，支援一鍵複製與 24 小時繳費期限。
* **超商取貨付款 (CVS COD)**：支援 7-ELEVEN 與全家門市快速選擇與店號連動。

### 4. 金融級安全防禦 (Zero Trust & Anti-Tamper)
* **後端金額全內聚**：結帳總額 100% 由後端資料庫商品原價即時核算，徹底杜絕前端竄改價格攻擊。
* **HMAC-SHA256 數位簽章**：下單請求透過 Web Crypto 原生產生數位簽名，後端採 Raw Body 與 `timingSafeEqual` 校驗，防禦中間人竄改。
* **防重放攻擊 (Replay Attack)**：引入 `x-timestamp`（5分鐘失效）與記憶體 `x-nonce` 快取校驗。
* **全域錯誤脫敏 (Error Masking)**：全面阻斷 Raw Stack Trace 與 SQL 語句暴露至瀏覽器 Console。

---

## 🛠 技術堆疊

| 領域 | 技術項目 | 說明 |
| :--- | :--- | :--- |
| **前端 (Client)** | Vue 3 + TypeScript | Composition API (`<script setup>`) |
| | Vite | 現代化前端構建與開發工具 |
| | Pinia | 輕量化全域狀態管理 (購物車、會員 Token) |
| | Vue Router 4 | SPA 前端路由控制與導航守衛 |
| | Web Crypto API | 瀏覽器原生 HMAC-SHA256 簽名運算 |
| **後端 (Server)** | Node.js + Express | RESTful API 伺服器 (Port: 3002) |
| | TypeScript (`tsx`) | 型別安全的後端服務架構 |
| | SQLite (`better-sqlite3`)| 高效能本機關聯式資料庫 (`olist.db`) |
| | Resend API | 交易與驗證信件發送服務 |
| | Node.js `crypto` | 密碼學安全金流驗證與 Token 簽章 |

---

[![Enterprise Quality Gate](https://github.com/bookerhsuQPCS/olist-ecommerce-fullstack/actions/workflows/quality-gate.yml/badge.svg)](hhttps://github.com/bookerhsuQPCS/olist-ecommerce-fullstack/actions)

## 🚀 快速開始

### 1. 環境需求
* **Node.js** >= 18.0.0
* **npm** >= 9.0.0

### 2. 安裝依賴

**安裝專案所有依賴：**
```bash
npm install

