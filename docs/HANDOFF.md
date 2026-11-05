# 交接文件（HANDOFF）— v0.11 主線（已推 GitHub）

> 最後更新：2026-11-05 20:55（Lead）。本檔是「下次開工第一份要讀」的文件。
> **v0.11 已推上 GitHub `main`**（使用者授權），GitHub Pages 會自動更新。
> 目標：打磨到商業級 v1.0（`docs/PRODUCT-v1.0.md`）。工具：`tools/qa.mjs`（47 項）、`shot.mjs`、`balance.mjs`、`fixtures/`。

## 1. 環境（重開機後要重建）

```powershell
python -m http.server 5173 --bind 127.0.0.1     # repo 根目錄
Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList `
  '--headless=new','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9222',`
  "--user-data-dir=$env:TEMP\cdp-9222",'about:blank'
Set-Location 'H:\DeepSeek\PROJECT\PROGRAMM\escape-the-sea\tools'; $env:CDP_PORT='9222'; node qa.mjs
```

- 線上版：https://cchpucky1984.github.io/escape-the-sea/
- **驗證陷阱**：PWA SW 是 cache-first；`qa.mjs`／`shot.mjs` 已內建清 SW。
- ComfyUI：桌面版 8188（目前未開）；`_dev/comfy/comfy.mjs`、`music.mjs`。

## 2. 版本與驗收

- `v0.11`；**QA 47/47 PASS、pageErrors 0**
- 效能：sea 三負載 39.1／38.5／**36.6 fps**（原本 37.5／36.4／34.7）；space 漸層 −90%；fx 自動降級
- 可及性：子彈 4 形狀／巨獸模式記號／精英標記／text-lg HUD／音效峰值（hit −14dBFS 建議 ×0.5）
- 內容：模型推估首輪 **中位 75 分**（最短 40／慢速 123，±25%；目標 90–150）→ 需 L1+L2 槓桿補到 91–105
- 商店：itch 定稿包（cover/5 截圖/icon/banner 全 ≤400KB）、Steam capsule 檢查（缺 community/client icon、英文截圖、trailer）、wordmark、hero、資訊圖
- 法務：`LICENSE`（All Rights Reserved）＋`THIRD-PARTY-NOTICES`（AI 揭露）

## 3. 已完成（v0.6 → v0.11）

| 版本 | 內容 |
|---|---|
| v0.6 | 音樂三軌、成就 24、海域事件 8＋裂縫、設定面板、結局 key art |
| v0.7 | i18n（zh/en）、教學 5 步、手機觸控、PWA 離線、升空 gate UI |
| v0.8 | 深海密度 ×2.8、四巨獸四模式、快慢追蹤雷射彈；最終戰：瞄準、波次 10/24、核心四階段、逃生 90s＋鏡像 BOSS |
| v0.9 | 核心 1800（TTK 74s）、挑戰 3、NG+ 0–9、reduce motion／色盲／字級、canvas i18n、商店截圖 |
| v0.10 | 封測工具（F2/F3/匯出/timeScale）、效能優化＋自動降級、balance.mjs、BETA-KIT、ITCH-ROLLOUT、OUTREACH、wordmark／英雄圖 |
| v0.11 | sea 效能達標、色盲子彈形狀/危險標記、text-lg HUD、混音檢查、itch 定稿包、Steam capsule 檢查、LICENSE/THIRD-PARTY、CHANGELOG／ITCH-FINAL／RELEASE-NOTES／社群包、README 門面、**推上 GitHub main** |

## 4. 已知問題／v1.0 blocking（8 項）

1. **首輪長度未實測**（模型 75 分）：需 `__T.timeScale(8)` 跑新 log；建議 L1 升空 gate 追加「護盾 Lv1」（+8–12 分）、L2 登艦走廊 2 波（+8–10 分）。
2. **實機未測**：iOS/Android 觸控、PWA 安裝、實機 60fps。
3. **音樂未人耳驗收**（6 段 a/b）。
4. **Beta 未開始**（BETA-KIT 已備，8 人）。
5. **可及性尾項**：事件區形狀標記（`events.js`，D 的檔）、子彈形狀在母船/海面已做、事件仍靠顏色。
6. **上架資料**：itch 帳號/網址、Steam community/client icon、英文截圖、trailer。
7. **音效混音建議未套用**：hit ×0.5／beam ×0.8／heavy ×0.9（core.js `sfx` 音量）。
8. **Sea 剩餘瓶頸**：radar 每幀、拾取物光暈未 sprite 化（已達 35fps，不急）。

## 5. 下一輪建議（v0.12）

1. L1+L2 內容槓桿（gate 護盾 Lv1＋登艦走廊 2 波）→ 首輪 91–105 分
2. 用 `timeScale` 跑 30 分鐘腳本 log → `balance.mjs` 實測定案
3. 套用 D 的混音建議＋事件形狀標記＋子彈形狀事件一致
4. Beta 招募（8 人）與 F2/F3/匯出實測
5. 實機測試、Steam 素材補齊、itch 上架彩排

## 6. 檔案擁有權

`core.js/main.js/sea.js`＝B｜`base.js/space.js/fx.js/leviathan.js/events.js`＝D｜`index.html/style.css`＝C｜`docs/design`＝A｜`docs/marketing/content/i18n`＝E｜`docs/qa`、`tools/`、`_dev`、`docs/ROADMAP/PRODUCT/TEAM/HANDOFF`＝Lead
