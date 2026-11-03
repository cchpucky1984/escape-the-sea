# v0.4 施工路線圖（Roadmap）

> Lead 彙整 · 2026-11-03 · 依據：`docs/design/GDD-v0.4.md`（A）、`docs/design/DATA-v0.4.md`（A）、`docs/tech/AUDIT-v0.4.md`（B）、`docs/art/STYLE-v0.4.md`（C）、`docs/vfx/VFX-AUDIO-v0.4.md`（D）、`docs/marketing/`＋`docs/content/`（E）、`docs/qa/QA-BASELINE.md`（Lead）

## 0. 里程碑

| 版本 | 內容 | 出口條件 |
|---|---|---|
| **v0.4.0-alpha（S1a，現在）** | 修 P0/P1、母船可通關、存檔不丟、效能、HUD 重排 | `_dev/qa.mjs` 全 PASS ＋ 母船不開作弊可通關 ＋ pageErrors=0 |
| v0.4.0-beta（S1b） | 方案 A 新內容：賞金合約、魚槍模組、深海巨獸、深海裂縫 | GDD §6 驗收 1–9 全過 |
| v0.4.0（release） | 平衡、文案、商店頁、1920×1080 素材 | E 的 MARKETING 素材完成、README 與程式一致 |

**S1a 不做新內容**（賞金／模組／巨獸／裂縫留到 S1b）。S1a 的唯一目標是：**這款遊戲現在就能從頭玩到結局，而且不會因為 F5 掉進度。**

## 1. 為什麼 S1a 先修這五件（證據）

| 問題 | 證據 | 影響 |
|---|---|---|
| 母船一擊必死 | 玩家 HP 3–7（`space.js:823`、`core.js:243`），敵傷 7–13（`space.js:1012/1021/1045/1049/1059`）；Lead 實測 `suit4` 被 grunt 撞一次 → `state=lose` | **遊戲無法通關**（P0） |
| 失敗重試 soft-lock | `launch.docked` 未在 `initLaunch` 重置（`space.js:6-36,47`）→ 第二次升空卡在 100% | 一局報廢 |
| 返回基地雙重扣款 | `closeModal` 場景補救（`core.js:488-496`）＋ `transition` 重入（`core.js:783-792`） | 金屬被扣兩次 |
| 資源不存檔 | `addRes` 不觸發存檔（`core.js:355`），只有任務/建造才存 | F5 掉幾十件資源 |
| 效能 | 每幀 72 個 CanvasGradient、HUD 50 次 DOM mutation/s；1280×800 滿基地 16.9 fps（headless 軟體渲染） | 低階機卡頓 |

## 2. S1a 工單（第一波：4 條並行；互不重疊）

| 單 | 擁有者 | 檔案 | 內容 | 驗收 |
|---|---|---|---|---|
| **S1a-B1** | B | `js/core.js`、`js/main.js` | `calcStats` 新契約（`armor`／`moonHp`／`hullBonus`／`gunMult`，AUDIT §4.5）；新 stats 欄位；存檔 v3＋`migrateSave`／`validateSave`＋10s 自動存檔＋`visibilitychange`／`pagehide` 強制存；`updateQuests` 加 paused 判斷；`backToBaseFromLaunch`／`transition` 防重入；`main.js` 加 `fx.update`／`fx.drawScreen` 掛鉤（無 fx 時 fallback） | 重載後資源不掉；失敗重試不雙扣；`calcStats().moonHp` 數值正確；25 項 QA 不回歸 |
| **S1a-D1** | D | `js/fx.js`（新檔）、`js/base.js` | 依 `docs/vfx/VFX-AUDIO-v0.4.md` 建 `js/fx.js`（粒子池 400、漸層快取 `FX.grad`、shake／hitstop／flash／text／ring）；`base.js` 幾何快取（`baseGeo`）＋建築繪製改走 `FX.grad` | `FX` 全域存在、粒子上限生效；滿基地每幀 gradient ≤ 10（用審計計數器量） |
| **S1a-C1** | C | `style.css`、`index.html` | 依 `docs/art/STYLE-v0.4.md` 換 `:root` token、HUD 重排（資源 2×2、羅盤、右上目標、雷達 184）、面板四態、favicon（inline SVG）、390px 斷點（先做到純 CSS 的 80%）；`index.html` 加 `<script src="js/fx.js?v=0.4.0">` 與版本字串 `v0.4.0-alpha` | 390×844 不破版；`#hint` 不再被裁切；無 404 |
| **S1a-E1** | E | `README.md` | 三處數字修正（海域倍率 1.3/1.6/2.0、任務 11 個、核心 50%）＋新增「v0.4 開發中」段落；不動程式 | README 與程式一致（逐條對照 `sea.js:19-22`、`core.js:173-207`） |
| **S1a-A1** | A | `docs/design/` | 以玩家身分試玩目前版本 20–30 分鐘，輸出 `docs/design/PLAYTEST-v0.4a.md`：卡點、看不懂的地方、節奏問題（每項附截圖＋時間點）；不要寫程式 | 至少 5 項可操作發現 |

**依賴**：S1a-B1 先完成 `calcStats` → S1a-D1 才能動 `space.js`（第二波）；C1 的 `index.html` 版本字串與 fx script 需在 D1 建檔後才不會 404（C 可先加 tag，Lead 最後驗）。

## 3. S1a 第二波（第一波合併後才開）

| 單 | 擁有者 | 檔案 | 內容 |
|---|---|---|---|
| S1a-B2 | B | `js/sea.js`、`js/main.js` | 母船可通關的必要接線；`sea.js` 改用 `FX` 粒子；`DMG_MUL` 修正（`sea.js:487`）；BOT 撿空氣泡／補給箱資源黑洞（`base.js` 由 D 修，勾子在 sea） |
| S1a-D2 | D | `js/space.js`、`js/base.js` | 母船艙壓制（HP／傷害／無敵 1.1s／`gunMult`／補給艙／艙壓 HUD）；`dock` 吃 `hullBonus`；`base.js` 的 BOT 目標篩選 |
| S1a-C2 | C | `style.css` | 面板四態收尾（等 B 的模板字串微調，最多 4 處） |
| S1a-E2 | E | `README.md`、`_shots/` | 用新版畫面補 1920×1080 商店素材（`VIEW_W=1920 VIEW_H=1080`） |

**S1a 出口驗收（Lead 執行）**
1. `_dev/qa.mjs` 25 項全 PASS（FPS 項在乾淨環境重測）
2. 新增 4 項母船驗收：素裝 100 艙壓可吃 16 次 `hurtMoon(6)`；`suit4+shield3` = 223；`gl3` 傷害 0.35×；`gl4` 1.0×
3. 手動劇本：新檔 → 玩到結局（可用 `__T` 加速收集，但**不得**直接改 HP／跳過戰鬥）
4. `git diff` 只含預期檔案；`pageErrors` 全 none

## 4. S1b（beta，需使用者同意才開）

GDD 方案 A：賞金合約（`H` 面板＋賞金終端）、魚槍模組 3 槽（穿透／爆裂／電磁）、深海巨獸（240 HP／3 階段）、深海裂縫、母船艙壓延伸。
驗收：GDD §6 的 9 條 + `docs/content/LEVELS-v0.4.md` 的事件表。
**不在 S1b 做**：手機觸控（只做像素預算封頂與 CSS 斷點）、離線收益、新場景、換畫風。

## 5. 協作規則（S1 生效）

1. **檔案擁有權不變**（`docs/TEAM.md` §1）。跨檔一律先 `send_message` 給對方與 lead，不要自己改別人的檔。
2. 每張工單完成：`team_task_update(complete)` ＋ 給 lead ≤12 行摘要（檔案、行數、驗收指令、風險）。
3. 不改 `?v=` 快取參數與版本字串以外的發版設定；不改存檔 key；不刪 `__T`。
4. **不跑 git**（commit／push／branch 都由 Lead 做）。目前維持「只在本機」。
5. 每次改完自己跑一次 `node _dev/qa.mjs`，把 PASS/FAIL 貼在摘要裡；壞掉別人功能的工單會被退回。
6. 文案（任務、建築說明、toast）一律以 A 的 `DATA-v0.4.md` 為準；數值一律以 GDD §3 為準，要改先問 A。

## 6. S1a 收尾狀態（2026-11-04 完成，commit `3fad2ad` + 後續 hotfix）

- `_dev/qa.mjs` **33/33 PASS、pageErrors 0**（1280×800／390×844／全場景／存檔 v1+v2 fixture／母船生存／連續升空）
- 母船可通關（素裝 100 艙壓、連吃 16 次撞擊不死）；重試升空 soft-lock 已修（`initLaunch` 重置 `docked`，Lead hotfix）
- 效能：基地全滿漸層 73.6→11.8/幀、HUD DOM mutation 49.6→6.8/s、1280×800 33–35 fps（headless 軟體渲染）
- 只在本機 commit，**尚未 push**

## 7. S1b 追加（來自 `docs/design/PLAYTEST-v0.4a.md`，A 的 30 分鐘真人試玩）

| 優先 | 問題 | 證據 | 建議 |
|---|---|---|---|
| P0 | 第二次升空 100% soft-lock（自然重現） | `PLAYTEST` §2.1、`space.js:47` | **已 hotfix**（S1a 收尾） |
| P1 | 第一幕 5 分鐘就結束（零件比裝備線便宜） | 腳本 04:59 發射、05:26 進母船 | 加升空 gate：魚槍 ≥Lv3、潛水衣 ≥Lv2、火箭研發中心已建 |
| P1 | 16:15–25:00 有 8 分 45 秒完全沒有目標 | 剩 3 任務全指向 3.4 km 外守衛、無導航 | 加入「深海巨獸」導航箭頭／賞金合約填充（S1b 主線） |
| P2 | 開局 1.3 km 外，toast 叫你按 B 卻只回「要游回基地」 | `main.js` 開場 toast | 開場先給「游回基地」指引，或把出生點拉近 |
| P2 | 中期缺金屬、塑膠木材爆倉 | 試玩 2982 塑膠／2257 木材 | 建築成本結構調整（A 在 S1b 數值表處理） |
| P3 | 死亡只掉 2 件塑膠，沒有痛感 | `sea.js` 死亡懲罰 | 改掉當前等級的一小部分或失去攜帶物 |

## 8. 風險

- **存檔遷移**之後每次加欄位都要跑 v1/v2 fixture（`_dev/fixtures/`）。
- **母船 TTK 平衡**只能靠腳本量；S1b 有 `_dev/balance.mjs` 再調。
- **效能 gate** 必須同一台機、單一 Chrome 量（多個 Chrome 並行會失真）。
- 5 人同時改同一個 repo：合併前 Lead 會跑一次 `git status` 檢查越界。
