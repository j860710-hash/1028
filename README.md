# CosDNA AI Reverse Formulation Research Assistant

> **專案定位**：專為化妝品/保養品研發人員（Cosmetic Formulation R&D）打造的反向配方研究輔助系統。  
> 本專案提供從 CosDNA 擷取標準 INCI、序列化分析、乃至於後續結合大語言模型（LLM）進行配方體系推論、技術假設構建與實驗驗證規劃的完整解決方案。

---

## 🔬 第一階段完成成果 (Phase 1 MVP)

1. **原始工具安全備份**：
   - 原「複製 CosDNA INCI」Bookmarklet 完整備份於 `bookmarklet/raw-bookmarklet.txt`，未作任何刪除或覆寫。
2. **語法解碼與編碼修復**：
   - 排查原始碼中所有 `%27` 單引號 URL 編碼，修復引號閉合異常，產出易於維護之 `bookmarklet/decoded-bookmarklet.js`。
3. **順序不變性嚴格保證 (Order Preservation)**：
   - 遵循國際化妝品標示法規（FDA 21 CFR 701.3 及歐盟 Regulation (EC) No 1223/2009）。
   - **嚴禁對成分進行字母排序 (Alphabetical Sorting)**，確保輸入序號完全對應原廠標籤之濃度順序。
4. **研發工作台 Web MVP (`frontend/index.html`)**：
   - 支援貼上 INCI、數量自動統計、帶序號成分預覽（#1 Aqua, #2 DHHB...）。
   - 支援逗號分隔（標準格式）、換行列表與配方梯次序號複製與匯出。
   - 內建兩大經典配方測試範例（防曬乳配方、二裂酵母修護乳配方）。
5. **安全後端架構 (`backend/`)**：
   - API Key 保管於伺服器端環境變數（`.env`），絕不洩漏於前端。
   - 具備連線探針與誠信防假機制：未連線時清楚標示「🔴 AI 服務未啟用」，絕不偽造假分析。
6. **自動化單元測試 (`tests/run-tests.ps1`)**：
   - 4 項核心測試全數 100% 通過（數量匹配、順序不變、中文別名純化、逗號格式驗證）。

---

## 📁 專案目錄結構

```text
cosdna-ai-reverse-formulation/
├── .gitignore                      # 排除 node_modules、.env、日誌檔
├── README.md                       # 專案手冊與研發指引
│
├── bookmarklet/                    # Bookmarklet 專屬管理目錄
│   ├── raw-bookmarklet.txt         # 原始未修改的 Bookmarklet (原貌存檔)
│   ├── decoded-bookmarklet.js      # 解碼修復後的乾淨 JavaScript (排查 %27)
│   └── inci-extractor.js           # 模組化的核心擷取引擎 (嚴格保證順序性)
│
├── frontend/                       # 研究員操作 Web 介面 (MVP)
│   ├── index.html                  # 主介面：INCI 貼上、帶序號成分預覽、分析面板
│   ├── app.js                      # 前端狀態機、成分數量統計、複製與後端連線檢測
│   └── style.css                   # 研發工作台風格（清爽、專業科研儀表板）
│
├── backend/                        # 安全後端中繼服務 (保護 API Key)
│   ├── .env.example                # 環境變數範本 (GEMINI_API_KEY / OPENAI_API_KEY)
│   ├── package.json                # 後端套件依賴
│   └── server.js                   # 包含 /health 探針與 AI 反向配方推論端點
│
└── tests/                          # 測試與驗證資料集
    ├── fixtures/
    │   ├── sunscreen-inci.json     # 防曬配方基準案例 (38項)
    │   └── emulsion-inci.json      # 修護乳配方基準案例 (含中文別名過濾測試)
    └── run-tests.ps1               # 自動化測試腳本 (100% Passed)
```

---

## 🌐 如何在 Chrome 開啟 MVP 網頁

本第一階段 MVP 採用輕量、零相依性（Zero-dependency）純前端技術，您可以直接透過 Chrome 開啟：

### 方法 1：直接雙擊檔案開啟
1. 開啟檔案總管，前往目錄：  
   `c:\Users\lvliping\Desktop\專案設計AI\cosdna-ai-reverse-formulation\frontend\`
2. 在 **`index.html`** 上點擊滑鼠右鍵 ➔ 選擇 **「以 Google Chrome 開啟」**。

### 方法 2：Chrome 網址列直接輸入
在 Chrome 瀏覽器網址列直接貼上並按 Enter：
```text
file:///c:/Users/lvliping/Desktop/專案設計AI/cosdna-ai-reverse-formulation/frontend/index.html
```

---

## 🛡️ AI 反向配方推論知識邊界規範 (Epistemic Boundaries)

為確保反向配方推論具備專業研發水準，本專案制定嚴格推論標籤與邊界聲明：

### 三重知識邊界標籤
1. **`[已知成分事實 (Fact)]`**：直接由 INCI 名稱與化學標記確認之事實（如：含有 Potassium cetyl phosphate 陰離子乳化劑）。
2. **`[研發推測假設 (Hypothesis)]`**：基於表面化學、HLB 匹配與配方學之技術推導（如：極性酯類 Diisopropyl sebacate 主要用於溶解高結晶性有機防曬劑）。
3. **`[需要實驗驗證 (Validation Needed)]`**：需透過實驗室桌上實驗（Bench test）確認之項目（如：離心分層、滴稀釋電導法確認 O/W 型態）。

### 三大禁忌聲明
- ⚠️ **不得推算精確添加百分比**：INCI 順序受 1% 規則與複方混雜影響，不得反推確定添加量。
- ⚠️ **不得宣稱確認原廠專利製程**：無法僅憑 INCI 確認原廠均質機剪切速率、加料先後與升降溫製程。
- ⚠️ **不得預測確定 SPF/PA 數值**：防曬係數取決於成膜增效劑、基底乳化與標準人體臨床試驗，不得隨意斷言數值。

---

## 🚀 下一階段 AI 功能開發建議 (Phase 2 & 3 Roadmap)

1. **Phase 2：結構化提示詞工程 (Prompt Engineering with JSON Schema)**
   - 設計針對化妝品配方學的專用 System Prompt。
   - 強制 LLM 輸出符合預先定義的 JSON 結構，分別填入水相、油相、乳化對、流變劑、防曬組合與驗證實驗清單。
2. **Phase 3：安全中繼端點連線與 API 串接**
   - 於 `backend/.env` 中配置 Google Gemini API 或 OpenAI API 金鑰。
   - 執行 `npm start` 啟動 `backend/server.js`，前端即可一鍵將 INCI 傳送至後端進行 AI 推論並即時回傳。
3. **Phase 4：配方微調與原料推薦庫擴充**
   - 針對「需要實驗驗證」之項目，AI 自動提供實驗室常見試製梯次（Ladder trial）參數建議。
