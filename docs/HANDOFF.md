# 交接文件（HANDOFF）— v0.10.0-alpha 狀態

> 最後更新：2026-11-05 20:20（Lead）。本檔是「下次開工第一份要讀」的文件。
> 所有工作皆為**本機 commit，未 push**。目標：打磨到商業級 v1.0（`docs/PRODUCT-v1.0.md`）。
> 工具已納入版控：`tools/qa.mjs`（47 項）、`tools/shot.mjs`、`tools/balance.mjs`、`tools/fixtures/`。

## 1. 環境（重開機後要重建）

```powershell
python -m http.server 5173 --bind 127.0.0.1     # repo 根目錄
Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList `
  '--headless=new','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9222',`
  "--user-data-dir=$env:TEMP\cdp-9222",'about:blank'
Set-Location 'H:\DeepSeek\PROJECT\PROGRAMM\escape-the-sea\tools'; $env:CDP_PORT='9222'; node qa.mjs
node balance.mjs                                # 平衡報告（吃 _shots/A2/log.jsonl）
```

- **驗證陷阱**：PWA SW 是 cache-first；`qa.mjs`／`shot.mjs` 已內建清 SW，自製腳本要照做。
- ComfyUI（出圖／音樂）：桌面版 8188（目前未開）；`_dev/comfy/comfy.mjs`、`music.mjs`。

## 2. 版本與驗收

- `v0.10.0-alpha`；**QA 47/47 PASS、pageErrors 0**
- 封測工具：F2 卡點標記、F3 FPS 面板、設定面板匯出 JSON、`__T.timeScale`（1–10，QA 用）
- 效能：moon/launch 漸層呼叫 −90%＋子彈批次繪製；`fx` 自動降級（<40fps→tier2、<28→tier3）
- 平衡工具：`tools/balance.mjs`（milestone／資源曲線／門檻；目前吃 A2 舊 log，顯示 v0.4 時代 5.4 分到母船 → 需用現版本新 log 重跑）

## 3. 已完成（v0.6 → v0.10）

| 版本 | 內容 |
|---|---|
| v0.6 | 音樂三軌、成就 24、海域事件 8＋裂縫、設定面板、結局 key art |
| v0.7 | i18n（zh/en）、教學 5 步、手機觸控、PWA 離線、升空 gate UI |
| v0.8 | 難度：深海密度 ×2.8、四巨獸四模式、快慢追蹤雷射彈；最終戰：瞄準、波次 10/24、核心四階段、逃生 90s＋鏡像 BOSS |
| v0.9 | 核心 1800（TTK 74s）、挑戰模式 3、NG+ 0–9、reduce motion／色盲 S/D/J／字級 120%、canvas i18n、商店截圖 |
| v0.10 | 封測工具（F2/F3/匯出/timeScale）、效能優化與自動降級、balance.mjs、BETA-KIT、ITCH-ROLLOUT、OUTREACH、商店 wordmark／英雄圖／玩法資訊圖 |

## 4. 已知問題／待辦

1. **`sea.js` 極端場景效能**：10 雜魚＋P3 巨獸 headless 31–33fps（<35 門檻），瓶頸在海面繪製（B 的檔）。自動降級會接手但仍是 v0.11 首要優化。
2. **balance 需新 log**：目前報告用 v0.4 舊紀錄；需用現版本跑一次腳本 playthrough（可用 `__T.timeScale` 加速）再跑 `node tools/balance.mjs --log <新檔>`。
3. **實機未測**：iOS/Android 觸控、PWA 安裝、實機 60fps。
4. **音樂待耳朵驗收**（6 段 a/b）。
5. **Beta 未開始**：`docs/design/BETA-KIT-v0.10.md`（招募/指引/觀察/分流）已備。
6. **上架彩排**：`docs/marketing/ITCH-ROLLOUT.md` 步驟已寫，帳號網址仍待填。
7. **未 push**：GitHub Pages 仍是 v0.3.0。

## 5. 下一輪建議（v0.11）

1. `sea.js` 效能：量測海面繪製熱點（漸層/文字/雷達/迷你地圖），目標 headless ≥35、實機 60
2. 用 `timeScale` 跑現行版本 30 分鐘腳本 playthrough → 新 balance log → 首輪時長定案（90–150 分）
3. Beta 招募（8 人）＋ F2/F3/匯出實測（請使用者協助找人）
4. 實機測試（手機觸控／PWA／FPS）
5. itch 私密 beta 頁開設＋上架彩排
6. 可及性收尾（子彈形狀、字級全 UI）

## 6. 檔案擁有權

`core.js/main.js/sea.js`＝B｜`base.js/space.js/fx.js/leviathan.js/events.js`＝D｜`index.html/style.css`＝C｜`docs/design`＝A｜`docs/marketing/content/i18n`＝E｜`docs/qa`、`tools/`、`_dev`、`docs/ROADMAP/PRODUCT/TEAM/HANDOFF`＝Lead
