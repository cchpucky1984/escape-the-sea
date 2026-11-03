# 交接文件（HANDOFF）— 2026-11-04 暫停點

> 使用者要求關機暫停。所有工作已 commit 在本機 `main`（未 push）。
> 下次開工：先讀這份，再照 §5 的順序做。

## 1. 目前狀態

- 專案：`H:\DeepSeek\PROJECT\PROGRAMM\escape-the-sea`（Git `main`，**未 push**）
- 版本字串：`v0.5.0-alpha`（`index.html`）
- 本機測試伺服器：`python -m http.server 5173 --bind 127.0.0.1`（關機後不在了，下次要重開）
- 自動化 QA：`_dev/qa.mjs`（37 項；`CDP_PORT` 指定 Chrome）
- ComfyUI：`http://127.0.0.1:8188`（桌機版，重開機後要重新啟動）
  - 出圖：`_dev/comfy/comfy.mjs`；出音樂：`_dev/comfy/music.mjs`
- 團隊：5 位 teammate（pm-designer / lead-programmer / artist / tech-artist / designer-ops），全部 idle 待命
- 目標追蹤：本 session 的 goal 已暫停，下次 `update_goal action=resume` 恢復

## 2. 這輪（v0.5-A）已完成

| 項目 | 內容 | 驗證 |
|---|---|---|
| 賞金合約 | 賞金終端＋`H` 面板、5 種×T1/T2/T3、3 槽、6 秒補槽、15 金屬換牌 | QA bounty 綠 |
| 魚槍模組 | 模組工作台、3 槽、穿透/爆裂/電磁、模組箱、子彈欄位 | QA mods 綠 |
| 深海巨獸 | `js/leviathan.js`（600 行）四角 240HP、三階段、弱點核心、掉落、雷達紫點 | TTK 16.0s、QA 綠 |
| 升空 gate | 魚槍 Lv3＋潛水衣 Lv2＋研發中心，缺什麼講什麼 | QA 綠 |
| 上手引導 | HUD「下一步」chip、開局距離 toast、離基地提示距離 | QA onboarding 綠 |
| 內容設計 | `docs/design/CONTENT-v0.5.md`（節奏表/成就 24/挑戰 3/事件 8/NG+/教學/難度） | 文件 |
| 商店與法務 | STORE／PRESSKIT／LEGAL／i18n STRINGS（319 條） | 文件 |
| 音樂 | `docs/audio/` 6 段（sea/launch/boss × a/b，30–31s、-18 LUFS） | 波形驗證，**待耳朵驗收** |
| 標題 key art | `docs/art/title-art/` 1280×800 與 1920×1080 | 待接線 |
| 美術 | 8 張概念圖＋8 張商店候選 | `docs/art/concepts/`、`_shots/C3/store/` |

## 3. 已知問題（下次開工先修）

1. **P0 `sea.bosses` undefined 崩潰**：`js/sea.js:533` `sea.bosses.some(...)`，在「連續升空重試」流程中 `sea.bosses` 變成 undefined → `updateSea` 拋錯 → rAF 主迴圈停止（QA `launch-retry` 第 3 次卡 `title`、後續 `moon-boss` 光束沒觸發都是這個後果）。
   - 重現：`node _dev/qa.mjs`（CDP_PORT 指向一台 Chrome），看 `launch-retry` 與 `pageErrors`。
   - 方向：`initSea` 一定初始化 `sea.bosses`；`sea.js:533` 與雷達/指北針改讀 `Array.isArray(sea.bosses) ? ... : []`；找出誰把它設成 undefined（懷疑 `leviathan.js` 的 `reset()` 或 `initSea` 呼叫順序）。
2. **QA `moon-boss` 衛星光束沒觸發**（`beam1=false`、hp 停在 170）：很可能只是 #1 讓主迴圈停掉的連鎖；修完 #1 再驗。
3. **QA `mobile`**：`ReferenceError: initSea is not defined` → 同樣是主迴圈/頁面狀態被 #1 汙染，修完重跑。
4. **FPS 量測**：並行多個 headless Chrome 會失真（23–44 波動），量效能要單一 Chrome。
5. 音樂與標題 key art **尚未接進遊戲**（`docs/audio/AUDIO-SPEC.md`、`docs/art/TITLE-ART.md` 已寫好接法）。

## 4. 使用者待決事項

- 音樂 a/b 候選要**人耳驗收**（`docs/audio/AUDIO-SPEC.md` §5）
- 商品化素材政策已定：優先真實截圖 → 程式繪製 → 已審查 AI（anima_pencil／ACE-Step）；**animeScreencapStyle 輸出禁止商用**
- 是否 push GitHub（含 GitHub Pages 會直接上線）— 目前仍只在本機
- 售價暫定 US$2.99（可調）

## 5. 下次開工順序（建議）

1. 重開伺服器＋Chrome，跑 `_dev/qa.mjs` 確認 4 個失敗項（見 §3）
2. 修 `sea.bosses` 崩潰（B 的檔案；Lead 可直接 hotfix 或派 B）
3. QA 回到全綠 → commit
4. 接線：音樂（B：`Audio` 元素 + 音量/情境切換）＋標題 key art（B：`drawImage` 底圖）
5. 實作 `CONTENT-v0.5.md` 的成就 24／挑戰模式 3／海域事件 8／NG+（B＋A）
6. i18n：用 `docs/i18n/STRINGS.md` 建 `LANG` 字典（B）＋設定面板（C）
7. 每完成一輪：`qa.mjs` 全綠 → 更新文件 → 本地 commit → 回報

## 6. 檔案擁有權（維持不變）

`core.js/main.js/sea.js`＝B｜`base.js/space.js/fx.js/leviathan.js`＝D｜`index.html/style.css`＝C｜`docs/design`＝A｜`docs/marketing/content/i18n`＝E｜`docs/qa`、`_dev`、`docs/ROADMAP/PRODUCT/TEAM/HANDOFF`＝Lead
