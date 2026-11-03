# QA Baseline — v0.3.0（Sprint S0 基準線）

日期：2026-11-03　·　版本：`4eee0c8` v0.3.0　·　執行者：Lead
環境：Windows / Chrome 156 headless（CDP，軟體渲染）/ 1280×800 + 390×844 / 24 邏輯核

## 1. 怎麼跑

```powershell
# 1) 靜態伺服器（Lead 已常駐 5173）
python -m http.server 5173 --bind 127.0.0.1

# 2) headless Chrome（自己一個 port）
Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList `
  '--headless=new','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9222',`
  "--user-data-dir=$env:TEMP\cdp-9222",'about:blank'

# 3) 全套 QA（25 項，約 60 秒）
Set-Location 'H:\DeepSeek\PROJECT\PROGRAMM\_dev'
$env:CDP_PORT='9222'
node qa.mjs
```

- 輸出：終端機 PASS/FAIL 表 + `_shots\qa\` 截圖 + `_shots\qa\results.json`
- 另一個工具 `shot.mjs` 用於單一情境截圖（title/sea/base/craft/launch/dock/moon）

## 2. 結果總覽

**24 / 25 PASS**，`pageErrors: none`（整輪沒有 JS 例外、沒有 console.error）。

| # | 檢查 | 結果 |
|---|---|---|
| 1 | boot：標題、canvas 尺寸、無 JS 錯誤 | PASS |
| 2 | cheat：標題輸入 `cheat` | PASS |
| 3 | start：開始遊戲進 sea、3 HP | PASS |
| 4 | movement：WASD 游動 | PASS（0.7 s 約 110 px） |
| 5 | shoot：滑鼠發射魚槍 | PASS |
| 6 | pickup：磁力自動收集 | PASS |
| 7 | oxygen：離基地耗氧 | PASS |
| 8 | safe-zone：回圈內回滿血/氧/體力 | PASS |
| 9 | gate：遠離基地不能開建造面板 | PASS |
| 10 | build：基地內建造、平台 +1 格 | PASS |
| 11 | craft：沒有裝備房時升級卡鎖住 | PASS |
| 12 | esc：Esc 關面板 | PASS |
| 13 | build-pay：面板建造扣資源（塑膠 900→888、木材 900→890） | PASS |
| 14 | quests：J 面板可開、內容超出高度可滾動 | PASS（791 > 567, overflow auto） |
| 15 | pause：Esc 暫停選單可開可關 | PASS |
| 16 | save-load：存檔 → 重載 → 繼續 | PASS（plastic 1234 / fin Lv2 完整還原） |
| 17 | death：死亡扣 15% 塑膠、基地復活 | PASS |
| 18 | launch-gate：零件不齊不能發射 | PASS |
| 19 | launch：升空場景、W 加速 | PASS |
| 20 | dock：登艦場景可操作 | PASS |
| 21 | moon：決戰出怪 | PASS（第 1 波 6 隻） |
| 22 | tech：擊敗四角守衛累積 4 碎片 | PASS |
| 23 | moon-boss：核心出現 → 衛星光束 170→120 → 擊毀 → 結局畫面 | PASS（「你把帳算清了」） |
| 24 | mobile：390×844 無橫向溢出（canvas 數值正確） | PASS |
| 25 | fps：1280×800 三取最佳 | **FAIL 18–26 fps**（見 3.1，量測受 6 個並行 headless Chrome 干擾，需重測） |

## 3. 發現（依嚴重度）

### P1-1　手機／直向版面破版，且完全沒有觸控操作
- 證據：`_shots/qa/11-mobile.png`（390×844, DPR2）
- 現象：資源列被擠成兩行、`#hint` 底部操作提示左右被裁掉（「hift 衝刺…」「…Es」）、HUD 資訊彼此擠壓；**手機沒有任何觸控輸入**（`js/main.js` 只有 keydown / mousemove / mousedown）。
- 位置：`style.css:31`（`.res-row`）、`style.css:77`（`#hint` 的 `white-space:nowrap`）、**全檔沒有任何 `@media`**；`js/main.js:41-96`（輸入層）
- 建議：加 768px 以下斷點（資源列 2×2、提示改成 2 行或隱藏、任務卡縮小）；若要支援手機，另開「虛擬搖桿＋射擊鈕」工作項，否則至少顯示「建議用桌面鍵盤」。
- 歸屬：C（CSS/HTML）、B（觸控 → S1 再談）

### P1-2　效能：實測 18–26 fps（headless 軟體渲染，且同時有 6 個 Chrome 在跑）
- 證據：`qa.mjs` 第 25 項 3 次取樣；title 38.5、sea 33.9、moon 47.2（單獨量測時）
- 觀察：`drawIdleBG()`、`drawSea()`、`drawMoon()` 每幀重建 `createLinearGradient` / `createRadialGradient`、重畫整張背景與光暈；`frame()` 沒有避免重複計算。
- 位置：`js/main.js:105,125,136,191`、`js/sea.js` 背景繪製段、`js/space.js:204,236,268`
- 建議：B 先在有 GPU 的 Chrome 上量真實 FPS 再定案；若真的偏低，做「背景離屏 canvas 快取 + 漸層物件快取 + 粒子/文字上限」。
- 備註：**這不是最終數字**，量測當下 CPU 被 5 位成員的 headless Chrome 佔用；S1 收工前要在乾淨環境重測並記錄。

### P2-1　HTML toast 與畫布 HUD 在右上角互相重疊（母船戰最明顯）
- 證據：`_shots/qa/10-moon.png` 右上角「武器未滿級 — 傷害只剩 10%」壓住「剩餘敵人 6」
- 位置：`style.css:80`（`#toasts` 固定右上）vs `js/space.js:1687`（畫布右上「剩餘敵人」）
- 建議：toast 區下移（top: 56px）或母船 HUD 的敵人數改放左上/下方。

### P2-2　`favicon.ico` 404（每次載入一次）
- 證據：python http.server 記錄 `GET /favicon.ico 404`；`index.html` 沒有 `<link rel="icon">`
- 建議：加 inline SVG data-URI favicon（0 外部檔案），順手把標題頁小圖示一致化。
- 歸屬：C

### P2-3　基地面板產出列標籤不一致
- 證據：`_shots/harness-test/01-base.png` — 同一列寫「每 5 秒產出：塑膠 +3 · 木材 +3 · 金屬 +3 · 合金 +3（10秒）」
- 位置：`js/core.js:513`（合金是 10 秒一次，卻跟 5 秒產出混在同一列）
- 建議：拆成「每 5 秒」與「每 10 秒」兩列，或合金標註 `×0.5/5秒`。
- 歸屬：B（面板字串）＋A（文案定義）

### P2-4　README 與實際內容漂移
- README 寫「8 個引導任務」，實際 `QUESTS` 有 11 個（`js/core.js:173-207`），HUD 顯示 `任務 x/11`。
- 標題頁版本字串 `v0.3.0 · BUILD 2026-10-26`（`index.html:51`），但 v0.3.0 commit 是 2026-10-31。
- 建議：S1 由 E 重寫 README；版本字串與 `?v=` 由 Lead 統一在發版時更新。
- 歸屬：E、Lead

### P3（技術債，S1 再處理）
- 存檔格式沒有 `version` 欄位（`js/core.js:288`），未來欄位變動只能靠 key 改名硬切。
- 沒有 `package.json` / 建置 / 測試腳本；目前全靠這支 `qa.mjs`（建議 S1 收進 repo 的 `_dev/` 或 `tools/`）。
- 面板、任務、建築文案全部硬寫在 JS 字串裡（`core.js:500-745`），改文案得動程式碼；可抽成 `js/data.js`（B 決定是否值得）。
- `openCraft()` 每次升級都整塊重建 DOM（`core.js:656`），是可接受的簡化，但會閃一下。

## 4. 已知良好（不要改壞）

- 死亡 → 扣 15% 塑膠 → 基地復活流程完整
- 存檔 / 讀檔沒有掉資料（資源、升級等級、建築都還原）
- 面板都有「需在基地才能用」的擋門，且有提示
- 母船核心掉到 90% 觸發衛星光束（170 → 120）、擊毀後 2.4 s 進結局畫面
- 沒有任何 runtime JS 錯誤（25 項檢查全程）

## 5. 截圖索引（`_shots\qa\`）

| 檔案 | 內容 |
|---|---|
| `01-boot-canvas-JS-.png` | 標題畫面 |
| `02-cheat.png` | cheat 觸發 |
| `03-safe-zone-.png` | 安全圈回血 |
| `04-craft-locked.png` | 沒裝備房時的裝備面板 |
| `05-quests.png` | 任務面板 |
| `06-pause.png` | 暫停選單 |
| `07-death.png` | 死亡提示 |
| `08-launch.png` | 升空 |
| `09-dock.png` | 登艦 |
| `10-moon.png` | 母船決戰（右上重疊問題） |
| `11-mobile.png` | 390×844 直向（破版問題） |
| `12-moon-boss.png`、`13-ending.png` | 核心戰、結局（見 `results.json` 序號） |
