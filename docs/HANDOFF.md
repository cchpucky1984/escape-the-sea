# 交接文件（HANDOFF）— v0.6.0-alpha 狀態

> 最後更新：2026-11-04 23:55（Lead）。本檔是「下次開工第一份要讀」的文件。
> 所有工作皆為**本機 commit，未 push**。目標：打磨到商業級 v1.0（見 `docs/PRODUCT-v1.0.md`）。

## 1. 環境（重開機後要重建）

```powershell
# 靜態伺服器（repo 根目錄）
python -m http.server 5173 --bind 127.0.0.1
# headless Chrome（CDP 9222；QA 用）
Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList `
  '--headless=new','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9222',`
  "--user-data-dir=$env:TEMP\cdp-9222",'about:blank'
# QA
Set-Location 'H:\DeepSeek\PROJECT\PROGRAMM\_dev'; $env:CDP_PORT='9222'; node qa.mjs
```

- ComfyUI（出圖／出音樂）：桌面版 `http://127.0.0.1:8188`；工具 `_dev/comfy/comfy.mjs`（圖）、`_dev/comfy/music.mjs`（ACE-Step 音樂）
- 團隊 5 人（pm-designer / lead-programmer / artist / tech-artist / designer-ops）idle 待命

## 2. 目前版本與驗收

- 版本字串：`v0.6.0-alpha`（`index.html`）；`main` 分支
- **QA：43/43 PASS、pageErrors 0**（`_dev/qa.mjs`，1280×800＋390×844＋全場景＋存檔 fixture＋音樂／成就／事件掛鉤）
- `shot.mjs` 八情境 pageErrors none
- 首輪流程可通關（母船艙壓制）；升空 gate 會擋未達標玩家

## 3. v0.5 → v0.6 已完成

| 系統 | 狀態 |
|---|---|
| 賞金合約（H 面板、5 種×T1–T3、3 槽） | ✅ |
| 魚槍模組（3 槽、穿透/爆裂/電磁、模組箱） | ✅ |
| 深海巨獸（`js/leviathan.js`，四角 240HP、3 階段、弱點核心） | ✅ |
| 海域隨機事件 8 個＋深海裂縫（`js/events.js`，`SEA_EVENTS`） | ✅ |
| 成就 24（含 6 隱藏；J 面板三態；作弊擋 challenge） | ✅ |
| 背景音樂（WebAudio，sea/launch/boss 三軌、交叉淡入、M 靜音、音量存檔） | ✅（**待人耳驗收**） |
| 設定面板（音樂/音效音量、總靜音、減少動態、語言佔位） | ✅ |
| 標題畫面 key art（CSS 接線）＋結局畫面 key art | ✅ |
| 上手引導（HUD「下一步」、距離提示、開局 toast） | ✅ |
| i18n 資料（425 條 zh→en）、英文商店頁、預告腳本、press kit、法務 | ✅ 文件（未接線） |
| 商店素材（Steam 全尺寸 capsule／hero／library、key art） | ✅ |

## 4. 已知問題／待辦（下次先看這裡）

1. **音樂需要人耳驗收**：`docs/audio/` 6 段（sea/launch/boss × a/b）。我們只能驗波形／響度／無 clipping；好不好聽要使用者判斷。要點：第一次點擊後才播（autoplay 政策），headless 用 `element.click()` 不會 running，真實輸入才會。
2. **i18n 未接線**：`docs/i18n/STRINGS.js`（425 條）尚未接進 `core.js`；接線前要先跑一次行號重對（B 改過 core.js）。
3. **CHALLENGES／NG+ 未實作**：資料在 `docs/design/DATA-v0.6.md` §3/§4，標 v0.7。
4. **手機觸控未做**（只有 CSS 斷點）；PRODUCT v0.7 里程碑。
5. **效能**：headless 軟體渲染 35–45 fps（波動大）；實機 60fps 還沒量（要有 GPU 的 Chrome）。
6. **成就/事件雷達與 HUD**：事件在雷達有標記；HUD「事件名＋倒數」尚無（VISUAL-QA 列的降級項）。
7. **商店素材**：缺 1920 實機截圖與 3 段錄影；key art 無 logo 疊字（Steam 慣例）。
8. **未 push**：GitHub Pages 仍是 v0.3.0。

## 5. 下一輪建議（v0.7）

1. i18n 接線（B：`I18N_DATA`＋`t()`，切換設定面板語言；E 重對行號）
2. 手機觸控（B：pointer 虛擬搖桿＋射擊鈕；C：斷點與按鈕）
3. PWA（manifest＋Service Worker 離線快取；assets 快取策略）
4. 效能實機量測（GPU Chrome）＋必要優化
5. 挑戰模式 3 ＋ NG+（B，資料已備）
6. 商店素材補拍（E/C：1920 截圖 5 張＋3 段錄影＋logo 疊字）
7. beta 封測（5–10 人）＋回饋收斂

## 6. 檔案擁有權（維持不變）

`core.js/main.js/sea.js`＝B｜`base.js/space.js/fx.js/leviathan.js/events.js`＝D｜`index.html/style.css`＝C｜`docs/design`＝A｜`docs/marketing/content/i18n`＝E｜`docs/qa`、`_dev`、`docs/ROADMAP/PRODUCT/TEAM/HANDOFF`＝Lead
