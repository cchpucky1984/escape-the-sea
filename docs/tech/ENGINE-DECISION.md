# 引擎／渲染技術決策（ENGINE-DECISION）

> 決策者：Lead（2026-11-05）· 使用者決定：**選項 A：留在 Web，升級渲染層到 WebGL2**
> 影響範圍：v0.12 起的所有視覺工作；**不影響**既有玩法、資料、QA、行銷節奏。

## 1. 為什麼現在是 JS/HTML（背景）

- 專案起點就是單機 HTML5 Canvas 2D 遊戲：**零安裝、可分享、PWA 離線、itch HTML5 可上架**。
- 美術是**程式繪製**（canvas path/gradient/粒子），沒有 sprite/atlas/動畫資產管線，改數值即見效。
- 規模：`js/` 共 **10,461 行**、`style.css` 1,188 行、repo **9.7MB**（含 3MB 音樂）。
- 效能：headless 軟體渲染 sea 36–39fps；實機 GPU 通常 60fps。
- 商業路徑：GitHub Pages（已上線 v0.11）＋ itch HTML5＋Steam 用 Tauri 包一層。
- 工作流：AI agent 直接改 JS/CSS 檔案、CDP 自動 QA 47 項——這是本專案能高速疊代的主因。

**結論**：JS/HTML+Canvas 2D 對「2D、程序繪製、小團隊、先驗證市場」是合理選擇，不是技術債。
真正的問題是：**它能不能支撐商業級視覺**——答案是「可以，但要換渲染層」。

## 2. 三個選項的比較（2026-11 現況）

| 選項 | 內容 | 成本 | 好處 | 壞處 | 判定 |
|---|---|---|---|---|---|
| **A. 留 Web＋WebGL2** | 保留玩法/資料/QA/行銷，新增渲染抽象層與 WebGL2 adapter | 3–4 週團隊等效（POC 1 週＋遷移 2–3 週） | 立即擁有 bloom/大量粒子/水面 shader/光暈；效能 2–5×；網頁版與 PWA 全部保留；可漸進、可回退 | 要自己寫渲染層或引入 PixiJS；行動 GPU 要調 | **採用** |
| B. Godot 4 重寫 | 保留 GDD/數值/音樂/概念圖，重寫程式與 UI | 1.5–2 個月 | 原生 2D、桌面/主機、編輯器工作流、MIT | 網頁版變弱（Web export 慢／包大）；10k 行重寫；AI 協作較差 | v2 或續作再評估 |
| C. Unity 重寫 | 全部改 C#／UGUI／sprite 管線 | 2–3 個月＋授權 | 家機/3D/外包生態 | 2D 偏重、build 大、GUID 資產對 agent 不友善；機器目前沒裝 Unity | 不採用 |

## 3. 決策 A 的範圍（做什麼／不做什麼）

**做**
1. `Renderer` 抽象：`init/resize/beginFrame/endFrame/drawWater/drawGodRays/drawSprite/drawParticles/post/destroy`
2. 兩個 adapter：**Canvas2D（永遠可用的 fallback）** 與 **WebGL2（預設，偵測不支援就回退）**
3. 效果升級（依 A/C 的規格）：水面 caustics/光斑、體積光、additive 粒子、爆炸光暈＋bloom、母船金屬反光、鏡像/核心光暈
4. 裝置分級：desktop-high／desktop-low／mobile 的效果開關與 fps 門檻；`reduce motion`／`colorblind` 降級
5. context lost 復原、resize、DPR 上限、PWA 快取版本同步

**不做**
- 不改玩法、數值、關卡、存檔格式
- 不引入建置流程（除非選 PixiJS 且評估後值得）
- 不做 3D、不做資產管線（sprite 仍由程式繪製或預渲染）
- 不重寫 HUD/文字（留在 DOM/CSS）

## 4. Go / No-Go 門檻（POC 必須先過）

| 門檻 | 標準 | 量測方式 |
|---|---|---|
| 效能 | 滿載（1500 粒子＋100 sprites＋水面＋bloom）1280×800 **≥2× Canvas2D**，且 ≥30fps | `docs/tech/webgl-poc.html` 兩種模式各 5 秒 |
| 視覺 | 每個場景至少 **3 處可辨識差異**（不是只換技術） | C 的 `WEBGL-VISUALS.md` 對比清單 |
| 相容 | WebGL2 不可用時 100% 回退 Canvas2D；context lost 可復原 | POC＋整合 spike |
| 行動 | 390×844 模擬 GPU 上限下 ≥24fps（可降效果） | POC mobile 檔位 |
| 風險 | 不新增建置步驟（自寫）或只多一個 450KB 依賴（Pixi） | B 的相依決策 |

未過門檻 → 停在「A-light」（只做粒子/光暈 batch 優化，不改渲染層），不硬上。

## 5. 遷移順序與時程（團隊 sprint）

| Sprint | 內容 | 出口條件 |
|---|---|---|
| S1（本輪） | 決策文件＋POC＋介面設計＋視覺規格＋驗收定義 | 本文件＋POC 數據＋`WEBGL-INTEGRATION.md`＋`WEBGL-VISUALS.md`＋`VISUAL-UPGRADE-v0.12.md` |
| S2 | `Renderer` 抽象＋Canvas2D adapter＋sea 背景（water/god rays）走 WebGL | 同幀對比截圖、60fps 實機、可回退 |
| S3 | 粒子/特效/實體批次＋bloom | 滿載 ≥30fps、視覺 3 差異成立 |
| S4 | launch/space/moon 遷移＋母船反光/核心 bloom | 三場景全過 `VISUAL-UPGRADE` 驗收看板 |
| S5 | 手機/低階機分級＋可及性降級＋context lost | 390 ≥24fps、reduce motion 正常 |
| S6 | 回歸 QA（47 項＋新增視覺檢查）、beta、上架素材重拍 | QA 全綠、商店圖更新 |

**時程影響**：WebGL 升級會讓 beta 延後約 2 週（原 v0.12 內容改到 v0.13），但**不影響**現有線上版（v0.11 持續可玩）。

## 6. 成本估算（團隊等效）

| 工作 | 行數 | 工時 |
|---|---|---|
| Renderer 抽象＋Canvas2D adapter | 250–350 | 2–3 天 |
| WebGL2 adapter（shader/批次/狀態） | 700–1,000 | 5–7 天 |
| 水面/god rays shader | 150–250 | 2–3 天 |
| bloom/post | 120–200 | 1–2 天 |
| 遷移 sea/base/space/moon 繪製 | 改 600–900 行呼叫端 | 4–6 天 |
| 分級/降級/context loss/除錯 | 150–250 | 2–3 天 |
| QA＋視覺驗收＋素材重拍 | — | 2–3 天 |
| **合計** | **~2,000–2,900 行** | **3–4 週** |

## 7. 風險與對策

| 風險 | 等級 | 對策 |
|---|---|---|
| 行動 GPU 相容性（WebGL2 支援差異） | 中 | 偵測＋回退；效果分級；Canvas2D 永遠可用 |
| DevTools/headless 量測失真 | 中 | 同機同腳本 A/B；`__RENDER` 旗標；`qa.mjs` 清 SW |
| 視覺升級變成「只換技術不換觀感」 | 中 | C 的 3 差異驗收＋A 的可判斷定義 |
| 時間膨脹延後上架 | 高 | 限 S1–S3 才動主程式；S4–S5 可與 beta 並行 |
| 依賴（若選 Pixi）增加包大小與建置 | 低 | 傾向自寫；Pixi 只在需要複雜批次/濾鏡時評估 |
| 效能回歸 | 中 | 每 sprint 用 `tools/qa.mjs` FPS 段＋POC 對照 |

## 8. 決策紀錄（Decision Log）

- 2026-11-03：v0.3 基線（Canvas 2D）。
- 2026-11-05：使用者詢問是否改用 Unity；Lead 提出 A/B/C 三案，建議 A。
- 2026-11-05：**使用者選擇 A（留 Web、WebGL2 升級）**。
- 若未來要 Steam/家機優先或擴編美術團隊 → 重新評估 B（Godot 4）；本文件保留為依據。
