# itch.io 上架彩排（ITCH ROLLOUT）— v0.10

> 擁有者：E · 2026-11-05 · 依據 `STORE-v0.6-EN.md`、`LAUNCH-KIT.md`、`LEGAL.md`、`PRESSKIT.md`
> 目的：把 itch 上架從「知道要做」變成「照著點完就會上線」；每一步都標**檔案在哪／文案在哪**。
> 現況：v0.9.0-alpha 已 commit、QA 46/46；商店 5 張 1920×1080 截圖已在 `docs/art/store/screenshots/`。**尚未 push、尚未建立帳號。**

## 0. 前置（沒有這兩項不能開始）

1. **itch 帳號**：`[待填]`；開 2FA；完成 email 驗證。
2. **可公開的網址**：GitHub Pages 或 itch 自己的 HTML5 上傳（本輪建議 itch 上傳，離線單機不需要後端）。

```powershell
# 本機彩排用（不影響正式站）
python -m http.server 5173 --bind 127.0.0.1   # repo 根目錄
```

## 1. 帳號與商店頁骨架（約 20 分鐘）

| 步驟 | 動作 | 檔案／文案位置 |
|---|---|---|
| 1.1 | 註冊／登入 itch，Settings → 2FA 開啟 | — |
| 1.2 | 右上頭像 → **Dashboard → Create new project** | — |
| 1.3 | Title / URL：`Escape the Sea` / `escape-the-sea` | `STORE-v0.6-EN.md` §3 |
| 1.4 | Project type：`Game`；Classification：`Action`（次要 Adventure、Indie） | `STORE-v0.6-EN.md` §3 |
| 1.5 | Pricing：`Paid`，US$2.99（首發 −20% → US$2.39，7 天）`[待定]` | `LAUNCH-KIT.md` §1.4 |
| 1.6 | Uploads：HTML5 zip（`index.html` 在根目錄） | 打包清單見 §4 |
| 1.7 | Cover image：630×500 | `_shots/C3/store/itch-cover-630x500-a.png` |
| 1.8 | Screenshots：照 §3 順序上傳 5 張 | `docs/art/store/screenshots/*.webp` |
| 1.9 | Tagline／Short description／Long description | `STORE-v0.6-EN.md` §3（英文）＋`STORE-v0.5.md` §2（中文） |
| 1.10 | Tags：10 個（見下） | `STORE-v0.6-EN.md` §3 |
| 1.11 | AI disclosure：勾 Yes，貼揭露段落 | `STORE-v0.6-EN.md` §2；`LEGAL.md` §4 |
| 1.12 | Visibility：**Draft**（先不要 publish） | — |

**Tags（複製貼上）**：`singleplayer` `action` `survival` `base-building` `underwater` `sci-fi` `html5` `exploration` `shooter` `short`

## 2. 封面／截圖上傳順序（itch 第一張＝縮圖）

| # | 檔案 | 內容 | 為什麼放這個順序 |
|---|---|---|---|
| 1 | `docs/art/store/screenshots/03-core-boss.webp` | 最終 BOSS 四階段＋雙血條 | 最能在 315px 縮圖看出「這是有規模的戰鬥」 |
| 2 | `docs/art/store/screenshots/05-mirror-boss.webp` | 鏡像 BOSS（新內容） | 差異化：不是普通打怪 |
| 3 | `docs/art/store/screenshots/01-hangar-breach.webp` | 機庫轉場 `dockcue` | 展示操作與轉場 |
| 4 | `docs/art/store/screenshots/02-hangar-lock.webp` | 鎖定機庫（36 m） | 補足節奏 |
| 5 | `docs/art/store/screenshots/04-core-phase3.webp` | 核心第三階段 | 收尾在最高潮 |

- 截圖說明文字用 `SCREENSHOTS-v0.9.md` §「使用建議」的短句（英文）＋中文各一行；itch 不顯示 caption 時可寫在長描述。
- **不要**上傳概念圖（`docs/art/concepts/`）當截圖——那是 AI 圖，itch 頁要標清楚「Concept art」才可以用。

## 3. 商店文案與 AI 揭露（貼的位置）

| 欄位 | 貼什麼 | 來源 |
|---|---|---|
| Short description（≤160 字元） | 157 字元版本 | `STORE-v0.6-EN.md` §3 |
| Long description | 英文長描述＋中文版（同頁雙語，英文前） | `STORE-v0.6-EN.md` §3＋`STORE-v0.5.md` §2 |
| AI disclosure | 「AI-generated content」段落（一字不改） | `STORE-v0.6-EN.md` §2 |
| Credits | 開發者、音樂 ACE-Step 揭露、字型（系統） | `LEGAL.md` §4–§5 |
| Content warnings | Mild violence；AI-generated assets: Yes | `STORE-v0.6-EN.md` §3 |
| Languages | English／Traditional Chinese | `STORE-v0.6-EN.md` §3 |

> 上傳前先搜一次頁面原始碼（`Ctrl+F` `{n}`、`{dist}`），確認沒有殘留佔位符——i18n 模板沒被代入時會直接顯示大括號。

## 4. HTML5 打包（只包會用到的）

**要包**：`index.html`、`style.css`、`js/*.js`、`docs/audio/*.mp3`、`docs/art/title-art/*.webp`、`docs/art/pwa/*`、`docs/i18n/STRINGS.js`、`manifest.webmanifest`、`sw.js`。
**不要包**：`docs/` 其他文件、`_shots/`、`_dev/`、`tools/`、`start.bat` 以外的工作檔。

```powershell
# 在 repo 根目錄；先確認 index.html 在根層
$stage = "$env:TEMP\ets-itch"; Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory $stage | Out-Null
Copy-Item index.html,style.css,manifest.webmanifest,sw.js $stage
Copy-Item js -Destination $stage -Recurse
New-Item -ItemType Directory "$stage\docs" | Out-Null
Copy-Item docs\audio "$stage\docs" -Recurse
Copy-Item docs\art "$stage\docs" -Recurse   # 只留 title-art、pwa、store 可選擇性排除
Copy-Item docs\i18n "$stage\docs" -Recurse
Compress-Archive -Path "$stage\*" -DestinationPath "H:\DeepSeek\PROJECT\PROGRAMM\_shots\ets-itch.zip" -Force
```

- 解壓後在本機 `python -m http.server` 測一次（不能只測原始 repo，要測 zip 內容）。
- itch 上傳後用 itch 的 embed 視窗測 1280×720 與 390×844，`Ctrl+Shift+R` 強制刷新。

## 5. 私密 beta 連結流程（先給 8 人，不上公開頁）

1. 建 **第二個** itch 專案頁：`escape-the-sea-beta`（Private／Restricted，**不要**和正式頁共用）。
2. Visibility 設 **Restricted**，設一組 access code（例：`ETS-BETA-2026`），只給 `BETA-PLAN.md` 名單。
3. Upload 同一個 zip；Price 設 **Free**；Short description 寫「Private beta — please don't stream or share screenshots」。
4. 寄測試包（同一封信給 8 人，**BCC**）：
   - 連結：`https://[itch-user].itch.io/escape-the-sea-beta`＋access code
   - 測試腳本：`docs/design/BETA-PLAN.md` §2
   - 問卷：`BETA-PLAN.md` §3（Google Form）
   - 時段：90 分鐘、同一天
5. 收件：`tools/` 的 QA 紀錄＋玩家回傳的 JSON（F2 標記／F3 FPS／匯出測試紀錄）。**JSON 不含個資**（見 `LEGAL.md` §2.5）。
6. beta 結束：Unpublish beta 頁（保留資料）；把 P0/P1 收斂進 `docs/qa/BETA-FINDINGS.md`；才動正式頁 publish。

> 私密頁仍會出現在你的 Dashboard，但不會出現在 itch 搜尋與瀏覽；access code 可以隨時換掉（換了要重寄）。

## 6. 上線當天 Checklist（publish 前 10 分鐘）

- [ ] 正式頁所有欄位與 `STORE-v0.6-EN.md` 一致（Title／短描述／長描述／tags／價格／語言）
- [ ] 封面 630×500、5 張截圖（順序照 §2）、影片（若已上 YouTube）
- [ ] AI 揭露：itch 勾選＋長描述段落＋credits 三處一致
- [ ] Demo 頁（前 15 分鐘）已建立並在正式頁「Full version」連結
- [ ] `index.html` 的 `?v=` 已由 Lead bump；SW cache 版本同步（`sw.js` `VER`）
- [ ] 點「Publish」→ 用無痕視窗開 `https://[user].itch.io/escape-the-sea` 實測購買→下載→遊玩
- [ ] 手機 390×844 實測（觸控、PWA install prompt）
- [ ] 發 devlog #1（`STORE-v0.6-EN.md` §3 的版本）＋3 篇社群（`LAUNCH-KIT.md` §3）
- [ ] 寄 press 5 封（`OUTREACH.md` 模板）
- [ ] 記下上線時間、版本 commit（`8801fac` 之後的 release commit）

## 7. 上線後 24 小時監控清單

**每 2 小時看一次（表格記在 `OUTREACH.md` §4 追蹤表旁）**

- [ ] itch 頁瀏覽數／轉換（Dashboard → Analytics）：demo→full 轉換是否 >5%
- [ ] 留言／Discord／X 提及：依 `BETA-PLAN.md` §5 標籤分類（crash／blocker／confusing／balance／text／audio／perf／wish）
- [ ] 是否有 P0（白屏、無法購買、無法載入）→ 24h 內 hotfix；hotfix 後 bump SW 與 `?v=`
- [ ] 退款／客服信：24h 內回覆
- [ ] press 回覆：有回就 24h 內補素材（1920 截圖、press kit 連結）
- [ ] 社群：回覆每一則「卡在哪」的留言，並記進 findings
- [ ] 隔天同一時間做 **24h 摘要**：下載數、轉換、Top 3 問題、是否要 hotfix

## 8. 彩排失敗的常見原因（先檢查）

1. **zip 根目錄多一層資料夾**：itch 的 HTML5 需要 `index.html` 在 zip 最上層。
2. **SW 舊快取**：改了檔案卻看到舊版 → 清 site data 或用無痕；發版時 bump `sw.js` 的 `VER`。
3. **AI 揭露沒同步**：itch 勾了、長描述沒寫、credits 沒寫——三處都要。
4. **短描述超長**：155 字元以上就容易被截；以 `STORE-v0.6-EN.md` 的 157 字元版本為準，改字要重數字元。
5. **私密連結外流**：beta access code 只用一輪，結束就換掉或關頁。
