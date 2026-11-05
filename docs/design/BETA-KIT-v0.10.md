# 逃出大海 · v0.10 封測工具包（BETA-KIT）

> 作者 A（PM／主企劃）· 2026-11-05 · 用途：8 人封測的**招募／指引／觀察／分流／量測**一次到位。
> 對應 `PRODUCT-v1.0` 支柱 D／F；前置 `BETA-PLAN.md`（策略）與 `DATA-v0.9.md` §5（驗收）。只寫 `docs/design/`，不跑 git。
> 本輪 B 會實作 **F2 卡點標記／F3 FPS／匯出 JSON**——§6 是鍵位與 JSON 契約，B 照它做、指引照它寫。
## 1. 招募包（8 人）
- **分組**：A 組 3 人「完整遊玩（目標通關）」、B 組 3 人「只玩前 15 分鐘（測教學）」、C 組 2 人「英文／減少動態／120% 字級（測可及性）」。
- **條件**：桌機 Chrome/Edge、**沒玩過本作**、同一天能給 90 分鐘以上、願意簽「一句話授權」。
- **管道**：Discord 遊戲社群 ×2、Reddit `r/IndieGaming`＋`r/WebGames`、X（Twitter）1 則、巴哈姆特哈啦板、itch 追蹤者信。名額滿即截止，超額排候補。
- **授權一句話（貼在報名表）**：`我同意本次測試只收集遊戲內紀錄（存檔／標記／FPS／問卷），不收集姓名或帳號；紀錄只用於本作改進，測試期不外流。`
- **招募信（zh，≤150 字）**：
  > 嗨，我們在做一款 90–150 分鐘的深海生存×基地建造小品《逃出大海》，想找 8 位沒玩過的人封測。時間：本週任一天約 2 小時。裝置：桌機 Chrome。要做的事：玩到母船核心、卡住按 F2、最後匯出紀錄並填 12 題問卷。回報：遊戲序號＋credits 名字。回信「我要參加＋裝置」即可。
- **招募信（en）**：
  > Hi — we're beta-testing *Escape the Sea*, a 90–150 min deep-sea survival × base-building game. Looking for 8 people who have **never played it**.
  > Time: one day this week, ~90–150 min (breaks OK, same day). Device: desktop Chrome/Edge.
  > What you do: play to the mothership core, press **F2** when stuck, then hit **Export test log** and fill a 12-question survey.
  > Reward: a game key + your name in credits (or NT$300 voucher). Reply "I'm in + your device" to join.
## 2. 測試指引（1 頁，直接寄給玩家）
1. **安裝**：① itch.io **私密連結**（密碼另附）② GitHub Pages 測試站 ③ 備援：解壓 `escape-the-sea-beta.zip` 雙擊 `index.html`（file:// 下無 service worker，屬正常）。第一次點畫面才會出聲（瀏覽器政策）。
2. **開始**：標題 →「開始遊戲」→ 讀完開場 → 進海。**不要開 F12**；請開螢幕錄影（OBS／系統錄影）。
3. **必做 6 件**：① 前 10 分鐘正常玩 ② 完成 **1 張賞金合約**（按 H）③ 打 **1 隻深海巨獸**（雷達紫點）④ 玩到「可以發射」或通關 ⑤ 進設定把「音量／減少動態／色盲友善／字級」各切一次再切回 ⑥ 最後按「匯出測試紀錄」下載 JSON 寄回。
4. **F2＝卡點標記**：卡住超過 3 分鐘就按一次（會記錄時間／場景／座標／HP）；可連按多次。
5. **F3＝效能顯示**：開場按一下開著；結束前**截一張含 FPS 的畫面**。
6. **匯出**：`Esc` →「匯出測試紀錄」（或設定面板同一顆按鈕）→ 得到 `escape-the-sea-log-YYYYMMDD-HHMM.json` → 連同錄影／FPS 截圖寄回。
7. **問卷**：玩完 24 小時內填（12 題，連結另附）；第 12 題「只能改一件事」請認真寫。
8. **不要做**：不要看攻略／實況、不要直播、不要改存檔、不要重試超過 2 次崩潰（直接回報）。
## 3. 觀察表（我們自己用；每位玩家一行）
| 欄位 | 來源 | 說明 |
|---|---|---|
| 玩家／組別 | 報名表 | A 完整／B 前 15 分／C 可及性 |
| 裝置・解析度・FPS | F3 截圖 | 記 GPU 有無、平均 FPS |
| 開始／結束時間 | 匯出 JSON `wall` | 計算實際時長 |
| 通關與否／卡在哪 | JSON `stats`＋`marks` | `won`、最後一場景、死亡次數 |
| 首 5 分鐘留存 | JSON `stats.time`≥300 | 門檻 100% |
| 卡點清單 | `marks[]` | 每筆：時間、場景、座標、當時 HP/OX |
| 主觀 4 題 | 問卷 | 好玩／難度／下一步清楚／音效 |
| 問卷 12 題 | 問卷 | NPS、時長、裝置、最喜歡／最煩 |
- **P0–P3 規則**：P0＝崩潰／卡死／無法通關（**24h 內 hotfix**）；P1＝卡點或誤導且 **≥3 人重複**（3 天內修）；P2＝體感／UX（1–2 人，進 v0.11 backlog）；P3＝願望（只記錄）。
- **升級規則**：同一問題 ≥3 人 → 升一級；主觀分 <3 的項目 → 至少 P1；P0 不論人數一律阻擋。
- **每日收斂（20:00，15 分鐘）**：讀當日 JSON → 更新觀察表 → 標籤＋分級 → 只把 P0 丟給 B，其餘留在 FINDINGS 等 D7。
## 4. 回饋分流模板（GitHub issue）
- 標題：`[BETA][P1] 巨獸光束沒有前搖就被掃到 — 玩家#3`（`[BETA][等級] 一句話`）。
- 內文固定四段：`版本／玩家組別`、`重現步驟（含 F2 標記時間）`、`預期 vs 實際`、`附件（匯出 JSON／截圖／錄影時間戳）`。
- 標籤：`beta`、`p0/p1/p2/p3`、`crash`/`blocker`/`confusing`/`balance`/`text`/`audio`/`perf`/`wish`、`area:sea|base|launch|moon|ui|i18n`。
- **SLA**：P0 24h 內回覆＋hotfix 或降級說明；P1 3 天內回覆；P2/P3 7 天內標記 `accepted/backlog`。超過 SLA 的 issue 由 Lead 在每日收斂時點名。
- 模板檔：`.github/ISSUE_TEMPLATE/beta.yml`（Lead/C 建；欄位＝上面四段）。
## 5. `_dev/balance.mjs` 的 income model 假設與門檻
- **拾取 EV**（`sea.js:32,252-253`）：類型 plastic 40%／wood 26%／metal 22%／air 7%／crate 5%；普通件 `round(2×Z.mult)`，crate＝3 次 `round(rnd(3,6)×Z.mult)`＋60+8·zid% 給合金。期望資源/件：近海 **2.44**、外海 **3.52**、深海 **3.72**、遠洋 **4.87**（含 crate EV；air 不計資源）。
- **拾取率**：模型假設 **0.55 件/秒**（合理區間 0.45–0.60；受 `spawnT = 0.95/Z.mult` 與玩家移動限制）。
- **每分鐘收入（模型）**：
  | 來源 | 假設 | 數值 |
  |---|---|---|
  | 拾取（總資源） | 0.55 件/秒 × EV | 近海 80／外海 116／深海 123／遠洋 161 單位/分 |
  | 拾取（金屬） | 22% × round(2×mult) × 0.55 × 60 | 14.5／21.8／21.8／29.0 金屬/分 |
  | 被動（3 網＋3 爐＋3 逆向） | 每 5s／每 10s | 塑 36・木 36・金屬 36・合金 18 每分鐘 |
  | BOT（3 台） | 8 件／約 30s／台、1 資源/件 | **48 件/分**（塑 19・木 12.5・金屬 10.6・其餘 alloy） |
  | 賞金合約（T1 EV/張） | 權重 3/3/2/2 | 合金 **2.3**、金屬 **4.5**、木材 **2.0**（decap 為 T2 起） |
- **門檻（未達 → exit 1 並印差距）**：
  1. 首輪時長（3 輪中位數）**90–150 分鐘**——資源下限模型約 **35–45 分**，其餘應來自移動／巨獸戰／母船／重試；若 <90 分先看內容不是調 income。
  2. `firstReverse ≤ 480s`（第一座逆向工程：金屬 22＋合金 3；合金來自無人機/合約，不是等被動）。
  3. `3 張 T1 合約 ≤ 120s`（＝合約產能 **1.5 張/分** → 合金 **3.45/分**、金屬 6.75/分；若 3 張在 90s 內則合金 4.6/分）。
  4. 健康區間：拾取總資源/分 **70–170**、被動全滿 **72 單位/分＋合金 18/分**、BOT **40–55 件/分**、合約 **1.5–3 張/分**；任一偏離 >30% 視為密度／事件／成本異常。
  5. NG+1 首輪 **60–180 分**（`ngMul` 上線後）。
## 6. 給 B 的鍵位與 JSON 契約（本輪實作；指引與 §5 都照這個）
- **F2 卡點標記**：`game.diag.marks.push({ t: game.stats.time, wall: Date.now(), scene, x, y, hp, ox })`＋toast「已標記卡點 #N（mm:ss）」；上限 50 筆。
- **F3 效能顯示**：右上角小 chip 顯示 `FPS/ms/entities`（hazards＋bullets＋parts）；`game.diag.fps = {avg, min, p1}` 每 5s 更新；可再按 F3 關閉。
- **匯出**：暫停選單＋設定面板各一顆「匯出測試紀錄」→ 下載 `escape-the-sea-log-<yyyymmdd>-<hhmm>.json`，內容：
  ```json
  { "version": "v0.10.0", "exportedAt": "...", "ua": "...", "screen": "1280x800",
    "settings": {...}, "stats": {...}, "ng": 0, "ach": [...], "tut": {...}, "challenge": null,
    "marks": [...], "fps": {"avg": 38.2, "min": 21, "p1": 24},
    "errors": [{"t": 123.4, "msg": "..."}], "saveRaw": "…localStorage 原文…" }
  ```
- 錯誤收集：`window.onerror`／`unhandledrejection` 推進 `game.diag.errors`（上限 20）；不影響遊戲。
- 版本戳：`index.html` 的 `?v=` 與標題角落顯示，匯出 JSON 的 `version` 必填（封測要對得上 commit）。
- 隱私：JSON 不含姓名／帳號；`saveRaw` 只含遊戲進度。
## 7. 封測開始前的 5 項檢查（Lead 跑）
1. 測試連結／zip 可用、`index.html` 直開可玩（file:// 下 SW 不啟用，屬正常）。
2. F2／F3／匯出三键實機可用（非 headless），JSON 可下載且欄位齊。
3. 版本戳＝封測 commit；問卷連結、招募信、授權句在同一封包。
4. 觀察表與 GitHub issue 模板已建立（標籤齊）。
5. `_dev/balance.mjs` 已加 SW／cache 清除（`qa.mjs:93` 同段），否則量到舊 build。
