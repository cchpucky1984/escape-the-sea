# 隱私聲明與素材授權清單（LEGAL）

> 擁有者：E · 2026-11-04 · 適用：v0.5 / v1.0 上架（itch.io、GitHub Pages、Steam）
> **本文件不是法律意見**；公開發售前建議找律師確認一次（尤其 §4 模型授權與 §5 音樂）。
> 事實依據：本輪實際檢查 `js/`（無網路請求、無外部素材）、`index.html`（只載入本機檔案）、repo 檔案清單（無 `LICENSE`、無音檔／圖檔）。

## 1. 隱私聲明（玩家版，可直接貼到商店頁）

> **我們不收集你的資料。**
> 《逃出大海》是單機遊戲：沒有帳號、沒有伺服器、沒有廣告、沒有內購，也不會把任何遊玩資料傳出去。
> 進度存在你自己的瀏覽器（`localStorage`），只在你這台裝置上；清除網站資料就會清掉進度。
> 如果我們之後加入排行榜或雲端存檔，會先更新這份聲明並在遊戲內提示。

## 2. 資料流（技術事實）

| 項目 | 事實 | 出處 |
|---|---|---|
| 儲存方式 | 只用 `localStorage`，3 個 key：`escape-the-sea-v2`（主存檔，含 `SAVE_VER: 3`）、`escape-the-sea-v1`（舊版遷移用，讀完即不再寫）、`escape-the-sea-cheat`（作弊旗標） | `js/core.js:388-533`、`js/core.js:232-234`、`js/main.js:36` |
| 存檔內容 | 資源、升級、建築、零件、統計、任務、座標、音效設定、科技碎片、作弊旗標、賞金／模組（v0.5）；**不含**姓名、email、IP、裝置指紋 | `js/core.js` 的 `saveGame()` |
| 網路 | 0 個 `fetch`／`XHR`／`WebSocket`／`sendBeacon`／cookie；頁面只載入本機 `js/*.js`、`style.css`、inline SVG favicon | 本輪 grep 檢查 |
| 音訊 | WebAudio 即時合成，**沒有任何音檔**；不向麥克風／喇叭以外取得輸入 | `js/core.js:41-118`、`js/fx.js` |
| 第三方 | 無 Analytics、無 CDN、無社群 SDK、無字型服務 | `index.html:6-92` |
| 主機紀錄 | 若用 GitHub Pages／itch.io 托管，**平台端**可能記錄 IP／User-Agent 等（這是平台的隱私權政策，不是我們的程式） | GitHub／itch 各自政策 |
| 兒童 | 不收集任何資料，無帳號，符合 COPPA／GDPR 的「不處理個人資料」情境 | — |
| 刪除方式 | 瀏覽器 → 網站設定 → 清除資料；或遊戲內 Esc →「重新開始」（只清本作 key） | `js/core.js:533` |

## 3. 字型與第三方元件

| 元件 | 授權 | 是否隨遊戲散布 | 備註 |
|---|---|---|---|
| 字型堆疊 `"Microsoft JhengHei","PingFang TC","Noto Sans TC",system-ui` | 各 OS 內建字型，依系統授權 | **否**（不打包 webfont） | `style.css` `--font`；Linux 沒 JhengHei 會 fallback，需在 v0.8 驗一次 |
| 數字字型 `"Bahnschrift","DIN Alternate","Roboto Mono","Segoe UI"` | 各 OS 內建／OFL（Roboto Mono） | **否** | 同上；fallback 順序已寫在 `--font-num` |
| 框架／函式庫 | 無（原生 JS、Canvas 2D、WebAudio） | 否 | 無 `package.json`、無 CDN |
| 開發工具 | `ComfyUI`（GPL-3.0）、`shot.mjs`／`qa.mjs`（自有 CDP 腳本）、Node.js（MIT） | **否**（不進遊戲包） | GPL 工具**不影響輸出圖的授權**，但若散布 ComfyUI 本身就要開源 |
| 圖示 | inline SVG favicon（自繪） | 是（data URI） | `index.html:7` |
| repo 內圖檔 | 只有 `preview.png`（1264×569，自己的實機截圖／宣傳圖） | 商店素材 | 無授權問題 |

## 4. AI 生成圖像（ComfyUI）授權與揭露

**已使用**：`anima_pencil-XL-v4.0.0.safetensors`（SDXL finetune），sampler `dpmpp_2m`+`karras`，steps 26，cfg 7；產出 8 張概念圖與商店 key art（`docs/art/CONCEPTS-v0.4.md`）。

### 4.0 Lead 授權審查結論（2026-11-04，已查原始授權頁）

| 模型 | 授權 | 輸出可否商用 | 依據與限制 |
|---|---|---|---|
| `anima_pencil-XL`（本專案使用） | **Fair AI Public License 1.0-SD**（衍生自 `bluepen5805/anima_pencil-XL`） | **可以** | FAIPL §Output：「The output of this software is not covered by this license, and no contributor claims any rights to it.」→ 輸出不受模型授權拘束、無權利主張；限制只有一般性禁止用途（違法、剝削未成年人、歧視、醫療建議等）。散布模型本身才需附授權，本專案不散布模型。[授權原文](https://freedevproject.org/faipl-1.0-sd/) |
| `20240503 animeScreencapStyle_assV14Beta` | CreativeML Open RAIL-M ＋ **附加條款** | **禁止** | 附加條款「Image Sales」明文：**不得販售或授權此模型生成的圖像**，包含「把生成圖用在遊戲、書或其他作品來銷售」。本專案只在測試中跑過、**未採用於任何交付素材**。[授權頁](https://civitai.com/models/license/207687) |
| `waiIllustriousSDXL_v170`、`kohakuXLEpsilon_rev1`、`hassakuXLHentai_v11`、`v1-5-pruned-emaonly`、`sulphur_dev_fp8mixed`、`ltx-2.3` | **未審查** | **暫禁** | 未逐一追查授權前，不得用於任何會公開散布的素材（含商店頁、預告、press kit）。要用的話先補 §7 紀錄與授權連結。 |
| `ace_step_1.5_turbo_aio`（音樂） | Apache-2.0（模型） | **可以**（輸出另記） | 生成音訊要留模型/prompt/seed 紀錄；人耳檢查不與既有旋律過度相似。 |

**商品化素材政策（依序採用）**
1. **真實遊戲截圖**（無 AI，最安全；商店頁主圖優先用這個）
2. **程式／CSS 繪製**（logo、wordmark、UI 圖示、HUD）
3. **授權審查通過的 AI 輸出**（目前只有 anima_pencil 與 ACE-Step；須附 §7 紀錄＋商店頁 AI 揭露）
4. **禁用**：`animeScreencapStyle` 的任何輸出、任何未審查模型的輸出

> 已採用素材：8 張概念圖（內部參考）＋ 8 張商店候選（`_shots/C3/store/`，全部由 anima_pencil 生成）→ **可商用**，但正式上架前仍需：挑一版做人工後製（加 logo／重繪關鍵元素）＋ AI 揭露。

### 4.1 其他風險

| 風險 | 現況 | 處理（發售前必須完成） |
|---|---|---|
| 輸出著作權 | 本專案多數司法管轄（含美國）對「純 AI 生成、無人類創作」不給著作權；但本專案有選圖、裁切、加字、構圖的人類編輯 | 用「人類有實質創作」的版本（人工合成／加 logo／重繪關鍵元素）當商店主圖；press kit 標註 AI 生成 |
| **Steam 揭露** | Valve 要求商店頁揭露 pre-generated AI 內容；2025 起規則更細（需說明 AI 用在哪些部分） | 商店頁 AI 揭露區照 §8 文字填；[Steam AI 規則說明](https://www.videogameschronicle.com/news/valve-has-significantly-rewritten-steams-rules-for-how-developers-much-disclose-ai-use/) |
| **itch 揭露** | itch 編輯頁有 AI 內容選項；沒有就寫在長描述與 credits | 勾選 + 長描述加一行「Key art 由 AI 生成，遊戲內美術為程式生成」 |
| 使用限制 | OpenRAIL／FAIPL 類授權禁止歧視／違法用途等；本作無相關內容 | `docs/marketing/LEGAL.md` 就是副本，發售時同步到 `THIRD-PARTY-NOTICES.md` |

## 5. 音樂與音效（ace_step / WebAudio）

- **現況**：遊戲內**沒有音樂檔**，只有 9 個 WebAudio 程序合成音效（`js/core.js:41-118`）＋ v0.5 新增的 `js/fx.js` 合成器。音效程式碼為本專案自有，無取樣素材，授權乾淨。
- **計畫**：若 C 用 ComfyUI 的 **ACE-Step** 生成 3 段背景音樂（海面／升空／母船）：
  - ACE-Step 模型 repo 為 **Apache-2.0**（以實際下載版本與模型卡為準）；工具本身不進遊戲包。
  - **生成音訊的著作權**依司法管轄而異；商用時視為專案素材，必須留下生成紀錄（模型檔名／版本、prompt、seed、日期、長度）。
  - **不可**把有版權的參考曲放進 prompt 或作為 init audio；生成後要人耳比對，避免與既有旋律過度相似。
  - 授權紀錄表格式見 §7；若模型授權不可商用 → 退回 WebAudio 程序化配樂（PRODUCT §5 已預留此備案）。
  - 參考：[ACE-Step in ComfyUI（官方 blog）](https://blog.comfy.org/p/stable-diffusion-moment-of-audio)

## 6. 程式碼與內容授權（需 Lead 決定）

- repo 目前**沒有 `LICENSE`**：依 GitHub 預設＝「All rights reserved」，別人不能合法重用，但這也代表你要自己承擔「沒有授權聲明」的模糊性。
- 建議（商業級）：
  1. 新增 `LICENSE`：**All Rights Reserved**（程式、美術、音效、文案）＋ `THIRD-PARTY-NOTICES.md`（字型與模型授權摘要）。
  2. 若想讓社群玩原始碼：`js/` 用 **MIT**、`docs/art`、音效、key art、字型排版用 **CC BY-NC 4.0／All Rights Reserved**（二選一，不可混用）。
  3. `README` 與商店頁都連到 `PRIVACY.md`（= §1）與 `LICENSE`。
- **商標**：上架前搜 Steam／itch／USPTO／台灣 TIPO 是否已有同名遊戲；「Escape the Sea」偏通用，建議 logo 加上副標（`Escape the Sea — Deep Sea Survival`）提高識別。

## 7. 素材授權紀錄表（每次生成都要填）

| 檔名 | 類型 | 工具／模型 | 授權 | 參數（seed／prompt 摘要） | 日期 | 商用 |
|---|---|---|---|---|---|---|
| `docs/art/concepts/*.webp` | 概念圖（不進遊戲） | ComfyUI + anima_pencil-XL-v4.0.0 | Fair AI Public License 1.0-SD（輸出不受限） | 見 `CONCEPTS-v0.4.md` §3 | 2026-11-04 | ✅ |
| `_shots/C3/store/*-a/b.png` | 商店候選 | 同上（1344×768 放大） | 同上 | key-03 seed 42021／key-05 seed 42031 | 2026-11-04 | ✅（需人工後製＋AI 揭露） |
| `_shots/C3/raw/test-animecap-*.png` | 測試（**未採用**） | animeScreencapStyle | **禁止販售輸出** | — | 2026-11-04 | ❌ 不得使用 |
| `_shots/E/*.png`、`_shots/final*/*.png` | 實機截圖 | 本作遊戲（自有） | 自有 | — | 2026-11-03/04 | ✅ |
| 音樂（C 生成中） | 背景音樂 | ACE-Step 1.5（ComfyUI） | Apache-2.0（模型）／輸出專案自有 | 待填（model/prompt/seed/長度） | — | ⚠️ 待人耳驗收 |
| `preview.png`、favicon SVG | 宣傳／圖示 | 自有（截圖／手繪 SVG） | 自有 | — | — | ✅ |

## 8. 上架前法務 Check-list（Lead 驗收）

- [ ] 新增 `LICENSE`（建議 All Rights Reserved）＋ `THIRD-PARTY-NOTICES.md`
- [ ] 模型授權追查完成（§7 的 P0 全部變 ✅ 或已改用可商用模型重抽）
- [ ] 商店頁 AI 揭露文字（Steam／itch）與 §4 一致
- [ ] 隱私聲明公開 URL（GitHub Pages 的 `privacy.html` 或商店頁段落）
- [ ] 分級：台灣普遍級（0+）送審資料；Steam 內容問卷（暴力／AI）
- [ ] 商標檢索（Steam／itch／TIPO）＋ logo 副標定案
- [ ] 音樂（若採用）生成紀錄表填滿，並通過相似度人耳檢查
- [ ] 退款／客服信箱、press 聯絡信箱上線
