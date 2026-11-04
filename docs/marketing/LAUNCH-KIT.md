# 發佈包（LAUNCH KIT）— itch.io 上架／Steam 願望清單／社群／Press

> 擁有者：E · 2026-11-04 v0.7 · 依據 `PRODUCT-v1.0.md` 支柱 F、`LEGAL.md` §4、`STORE-v0.6-EN.md`
> `[待填]` = 需要 Lead／使用者提供（帳號、網址、價格、信箱）。**本文件不執行任何上架動作**，只列步驟與文案。
> 素材現況：capsule 全尺寸、原生 1920 key art、logo wordmark 已存在 `docs/art/store/`；還缺 5 張 1920×1080 截圖與 30 秒預告（腳本 `TRAILER-v0.6.md`）。

## 1. itch.io 上架檢查表（照順序做）

### 1.1 帳號與付款
- [ ] 建立 itch.io 開發者帳號（`[待填]`）；開 2FA
- [ ] 設定 payout（PayPal／Stripe）與稅務表單（非美國居民填 W-8BEN）
- [ ] 決定商店頁 owner：`[待填]`（個人帳號或 studio 頁）

### 1.2 專案頁欄位
- [ ] Title：`Escape the Sea`；URL slug：`escape-the-sea`
- [ ] Tagline：`Scavenge the sea. Grow a base. Take the fight to the moon.`
- [ ] Short description（**153 字元**，直接貼）：`Blasted into the sea by an alien ship, you turn floating trash into a growing base, a BOT fleet and a rocket — then fly to the moon and settle the score.`
- [ ] Long description：貼 `STORE-v0.6-EN.md` §3（英文）＋中文版 `STORE-v0.5.md` §2（同頁雙語，英文放前）
- [ ] Classification：`Game` → `Action`（次要 `Adventure`、`Indie`）
- [ ] Made with：`HTML5`
- [ ] 平台：`HTML5`（瀏覽器）；Windows/macOS/Linux 用同一包
- [ ] Tags：`singleplayer` `action` `survival` `base-building` `underwater` `sci-fi` `html5` `exploration` `shooter` `short`
- [ ] Release status：`In development`（v1.0 上線當天改 `Released`）
- [ ] Languages：`English`、`Traditional Chinese`
- [ ] 分級／內容警示：Mild violence；**AI-generated content 勾選 Yes**

### 1.3 封面與截圖
- [ ] Cover：`_shots/C3/store/itch-cover-630x500-a.png`（630×500）
- [ ] Screenshots（至少 5 張，16:9 優先）：
  - `_shots/C6/title-final-1920.png`（標題）
  - `_shots/C6/qa/03-safe-zone-.png`（安全圈）→ 需重拍 1920
  - `_shots/B4/b4-bounty-panel.png`（賞金面板）→ 需重拍 1920
  - `_shots/C6/qa/08-launch.png`（升空）→ 需重拍 1920
  - `_shots/C6/qa/11-moon-boss.png`（母船核心）→ 需重拍 1920
- [ ] 影片（可選）：先不上，等 `TRAILER-v0.6.md` 成片；itch 影片需 YouTube/Vimeo 連結

### 1.4 價格與試玩
- [ ] Price：US$2.99（`[待定]`；首發 −20% = US$2.39，7 天）
- [ ] 另開一個「Demo」頁：免費、只放前 15 分鐘（同包但用 `?demo=1` 或獨立 zip；`[待定]` 實作方式）
- [ ] Demo 頁連回完整版（itch 的「Full version」欄位）

### 1.5 上傳（HTML5）
- [ ] 打包：只含 `index.html`、`style.css`、`js/`、`start.bat`（可留）、`docs/audio/*.mp3`、`docs/art/title-art/*.webp`、`docs/i18n/STRINGS.js`。**不要**包 `docs/` 其他文件、`_shots/`、`_dev/`
- [ ] itch 的 HTML5 上傳是 zip；`index.html` 必須在 zip 根目錄
- [ ] 勾「This file will be played in the browser」
- [ ] 上傳後在 itch 的 embed 視窗實測 1280×720 與 390×844
- [ ] `?v=` 快取參數由 Lead 統一在發版時更新（不要自己改）

### 1.6 AI 揭露（必填，與 LEGAL §4 一字不改）
> **AI-generated content:** Store key art and concept art were created with ComfyUI using the `anima_pencil-XL` model (Fair AI Public License 1.0-SD; commercial use of outputs permitted). Background music is AI-assisted with ACE-Step 1.5 (Apache-2.0) and documented in `docs/marketing/LEGAL.md` §7. All in-game visuals and sound effects are generated procedurally by the game's own code. No output from the `animeScreencapStyle` model is used.

- [ ] 貼在長描述與 credits；itch 若有 AI 勾選欄位一併勾
- [ ] 中文頁同步加一句：「商店插圖為 AI 生成；遊戲內美術與音效為程式即時生成。」

### 1.7 上線當天
- [ ] 發 devlog #1（`STORE-v0.6-EN.md` §3 版本）
- [ ] 社群 3 篇（見 §3）
- [ ] 檢查 itch 頁在手機與桌面都正常；`pageErrors` none
- [ ] 記錄第一週數據：頁面瀏覽、下載、試玩轉換、退款

## 2. Steam 願望清單頁待補清單

> v0.7 先開頁收集 wishlist；**Steam 打包（Electron/Tauri）不在 v0.7 範圍**（PRODUCT §5）。

- [ ] Steamworks 帳號＋$100 USD app fee（`[待填]` 帳號）
- [ ] 建立 App、填 Store Page：
  - [ ] Short description（263 字元，`STORE-v0.6-EN.md` §4）
  - [ ] Long description（BBcode，`STORE-v0.6-EN.md` §4）
  - [ ] Genres：Action / Adventure / Indie；Tags：Singleplayer、Base Building、Survival、Underwater、Sci-fi、Short
  - [ ] 系統需求：Windows 10+、任何現代瀏覽器（若打包則標 Electron 版本）；macOS/Linux `[待定]`
  - [ ] 語言表：English（full）、Traditional Chinese（full）
  - [ ] AI disclosure（pre-generated）：與 §1.6 同文
  - [ ] 分級：IARC 問卷（mild fantasy violence）
- [ ] Capsule 全套（已存在，交前檢查 logo 可讀性）：
  - `docs/art/store/main-capsule-1232x706.jpg`
  - `docs/art/store/header-capsule-460x215.jpg`
  - `docs/art/store/library-capsule-600x900.jpg`
  - `docs/art/store/library-hero-3840x1240.jpg`
  - `steam-capsule-616x353-a.png`（small capsule）
  - `docs/art/store/logo-wordmark.png`
- [ ] 1920×1080 截圖 ×5（重拍指令：`TRAILER-v0.6.md` §3）
- [ ] 30 秒預告（`TRAILER-v0.6.md`）
- [ ] 設定頁面為 **Coming Soon**（不要按 Publish 直到打包完成）
- [ ] 願望清單目標：上線前 ≥500；`[待定]` 是否買曝光
- [ ] 商店頁網址、社群連結、support email 佔位填好：`[待填]`

## 3. 社群貼文（3 平台 × 中英各一版）

> 連結一律用 `[itch URL]`／`[Steam URL]`／`[GitHub Pages URL]` 佔位；發文前替換。Hashtag 不含空格：X 與巴哈用 `#`（巴哈貼在文末當標籤），Reddit 不用 hashtag（平台文化）。

### 3.1 X（Twitter）
**中文（≤280 字元）**
> 撿垃圾、造基地、把外星母船打下來。
> 《逃出大海 Escape the Sea》v1.0 上線：免安裝 HTML5、一輪 90–150 分鐘、繁體中文＋英文。前 15 分鐘免費試玩 → [itch URL]
> #indiegame #webgame #gamedev #screenshotsaturday #逃出大海

**English（≤280 chars）**
> Scavenge the sea. Grow a base. Take the fight to the moon.
> Escape the Sea is out: a browser survival/base-building run of 90–150 min, EN + zh-Hant. Free 15-min demo → [itch URL]
> #indiegame #webgame #gamedev #screenshotsaturday

### 3.2 Reddit（r/WebGames + r/IndieGaming）
**English（主文）**
> **[WebGames] Escape the Sea — a browser survival/base-building game where trash becomes a base, then a rocket**
> I built a single-player HTML5 game: you get blasted into the ocean, collect drifting trash, grow a base tile by tile, send BOTs out to farm, take bounty contracts, and eventually fly to the moon to fight the mothership. One run is 90–150 minutes, English + Traditional Chinese, no install/account. Demo is the first 15 minutes: [itch URL]
> Would love feedback on the first 3 minutes — that's where most people decide. Happy to answer anything about the web stack (Canvas 2D + WebAudio, no framework, no assets).

**中文（給中文社群版，可貼 r/Taiwanese 或中文 Discord）**
> 【自製】逃出大海 Escape the Sea — 瀏覽器單機生存／基地建造
> 被外星飛船打落海，撿垃圾造基地、派 BOT 出海、打賞金合約，最後造火箭上月球拆母船。免安裝 HTML5、一輪 90–150 分鐘、支援繁中與英文，前 15 分鐘試玩：[itch URL]。想收「前 3 分鐘會不會卡」的回饋。

### 3.3 巴哈姆特（哈啦區／獨立遊戲板）
**中文**
> 【心得／自製】逃出大海 Escape the Sea — 把整片海的垃圾變成火箭
> 各位好，我做了一款免安裝的 HTML5 單機小遊戲，打開網頁就能玩。
> 玩法：被打落海 → 撿漂流垃圾 → 蓋一座會長大的海上基地（每蓋一座平台多一格、安全圈變大）→ 造 BOT 自動出海 → 升級魚槍／蛙鞋／潛水衣 → 打四角深海巨獸拿科技碎片 → 造太空船升空 → 母船決戰。
> v1.0 版加了 24 個成就、8 個海域事件、賞金合約與魚槍模組；支援繁中／英文，手機可玩（PWA 可安裝）。一輪約 90–150 分鐘。
> 免費試玩前 15 分鐘：[itch URL]　願望清單：[Steam URL]
> 歡迎回報卡點與數值問題，我會照著改。
> #獨立遊戲 #HTML5 #逃出大海

**English short（給板上的英文讀者）**
> Indie dev here — Escape the Sea is a browser-only survival/base-building game (90–150 min run, EN/zh-Hant). Turn ocean trash into a growing base, BOT fleet and rocket, then fight the mothership. Free 15-min demo: [itch URL]

## 4. Press 名單（5 個，公開可查）

| # | 媒體／創作者 | 為什麼適合 | 聯絡方式取得 |
|---|---|---|---|
| 1 | **Alpha Beta Gamer** | 專門寫 indie／browser／demo 遊戲，格式適合小品 | 官網 `alphabetagamer.com/contact-us/` 的投稿表單（附 itch 連結＋30 字介紹＋1 張 1920 截圖） |
| 2 | **Rock Paper Shotgun** | PC／indie 報導，對「browser game」有欄位 | 依官方〈How to pitch an article to RPS〉的格式寄：先讀 `rockpapershotgun.com/how-to-pitch-an-article-to-rock-paper-shotgun`，再用站上 contact 頁 |
| 3 | **Indie Games Plus** | 長期報導 experimental／indie，接受新聞稿 | `indiegamesplus.com` 的 contact 頁；先讀他們的〈Guide to Contacting Games Press〉再寄 |
| 4 | **Warp Door** | 策展「奇怪、實驗性、免費／小遊戲」，很吃 browser 小品 | `warpdoor.com` 網站／About 的聯絡方式；主旨寫 `[Submission] Escape the Sea` |
| 5 | **Splattercatgaming（YouTube）** | 每天做 indie first-look，觀眾與本作重疊 | YouTube 頻道 `@Splattercatgaming` 的 About → 商業合作 email（公開欄位）；附 60 秒精華與 press kit |
| 備 | **Nookrium（YouTube）** | 專做 indie／strategy／management，BOT 自動化題材合 | YouTube `@Nookrium` 的 About → business email |

- 寄送內容一律用 `PRESSKIT.md` 的 fact sheet＋5 張截圖＋key art；**不要**附加 zip，改用連結（itch 頁／雲端資料夾）。
- 建議節奏：上線前 7 天寄 1–4；上線當天寄 5 與備選；一週後 follow-up 一次即可，不要連發。
- 台灣本地：可另寄 `巴哈姆特 GNN` 新聞信箱（`[待填]`，需自行查官網）與 `4Gamers`／`電腦王阿達` 等；本輪先列 5 個國際名單。

## 5. 上線時程（T 為上線日）

- **T−14**：itch 頁建好（草稿）、capsule／截圖定稿、press 名單確認、demo 打包
- **T−7**：寄 press（1–4）、Steam 願望清單頁開、X 預告貼
- **T−3**：itch 頁預覽給 3 位朋友試玩；修最後的英文破版
- **T−1**：排程 devlog #1、社群貼文排程、檢查 AI 揭露與 LEGAL 同步
- **T**：解除 itch 草稿、發 3 篇社群、寄 press 5＋備選、監看留言
- **T+3**：發 devlog #2／#3、整理回饋、決定首個 patch

## 6. 缺件清單（上架前必須補）

- [ ] 5 張 1920×1080 實機截圖（`TRAILER-v0.6.md` §3 有指令）
- [ ] 30 秒預告成片（腳本同上）
- [ ] itch／Steam／GitHub Pages 三個網址
- [ ] support email 與退款政策文字（平台預設可，但要有一個信箱）
- [ ] demo 版的實作方式（`?demo=1` 或獨立包）與 15 分鐘截斷點
- [ ] `LICENSE` 與 `THIRD-PARTY-NOTICES.md`（LEGAL §6 建議，Lead 決定）
