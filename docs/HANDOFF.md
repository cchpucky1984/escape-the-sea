# 交接文件（HANDOFF）— v0.9.0-alpha 狀態

> 最後更新：2026-11-05 01:15（Lead）。本檔是「下次開工第一份要讀」的文件。
> 所有工作皆為**本機 commit，未 push**。目標：打磨到商業級 v1.0（見 `docs/PRODUCT-v1.0.md`）。
> 工具已納入版控：`escape-the-sea/tools/qa.mjs`（46 項 QA）、`tools/shot.mjs`（截圖）、`tools/fixtures/`。

## 1. 環境（重開機後要重建）

```powershell
python -m http.server 5173 --bind 127.0.0.1     # repo 根目錄
Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList `
  '--headless=new','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9222',`
  "--user-data-dir=$env:TEMP\cdp-9222",'about:blank'
Set-Location 'H:\DeepSeek\PROJECT\PROGRAMM\escape-the-sea\tools'; $env:CDP_PORT='9222'; node qa.mjs
```

- **驗證陷阱**：PWA service worker 是 cache-first；`qa.mjs`／`shot.mjs` 已內建 unregister＋清 cache，自製腳本要照做，否則量到舊 build。
- ComfyUI（出圖／音樂）：桌面版 8188；`_dev/comfy/comfy.mjs`、`_dev/comfy/music.mjs`
- 團隊 5 人 idle 待命。

## 2. 版本與驗收

- `v0.9.0-alpha`；**QA 46/46 PASS、pageErrors 0**（tools/qa.mjs；含挑戰/NG+/a11y/最終戰流程）
- 首輪 P0 全修完；內容：賞金/模組/巨獸/事件/裂縫/成就/音樂/挑戰/NG+/鏡像 BOSS
- 效能：headless 軟體渲染 30–37fps（波動大）；實機 60fps 待量

## 3. 已完成（v0.6 → v0.9）

| 版本 | 內容 |
|---|---|
| v0.6 | 音樂三軌、成就 24、海域事件 8＋裂縫、設定面板、結局 key art |
| v0.7 | i18n（zh/en）、教學 5 步、手機觸控、PWA 離線、升空 gate UI |
| v0.8 | 難度：深海密度 ×2.8、四巨獸四模式、快慢追蹤雷射彈；最終戰：瞄準、波次 10/24、核心 900HP 四階段、逃生 90s＋鏡像 BOSS |
| v0.9 | 平衡：核心 1800（TTK 74s）、挑戰模式 3（一命/限時/赤手）、NG+（0–9，母船/巨獸/海面倍率）、reduce motion／色盲 S/D/J／字級 120%、canvas 海域名 i18n、挑戰/NG+ UI、商店 5 張 1920 截圖 |

## 4. 已知問題／待辦

1. **音樂需人耳驗收**（`docs/audio/` 6 段）。headless 無法判斷好聽。
2. **實機未測**：iOS/Android 觸控、PWA 安裝、實機 60fps。
3. **首輪時長未實測**：`balance.mjs` 尚未建立（A 有規格）；需長跑驗 90–150 分鐘目標。
4. **挑戰模式**：目前只有入口＋規則，結算分數/最佳分已做但未上封測驗證。
5. **商店素材**：缺 3 段錄影與 logo 疊字；`docs/art/store/screenshots/` 已有 5 張。
6. **beta 未開始**（`docs/design/BETA-PLAN.md`，8 人）。
7. **未 push**：GitHub Pages 仍是 v0.3.0。
8. i18n 仍有少數 canvas 文字未翻（radar 已翻）。

## 5. 下一輪建議（v0.10 → 朝 v1.0）

1. `tools/balance.mjs`：腳本跑首輪時長/經濟曲線/TTK，定案平衡
2. beta 封測（8 人）＋F2 卡點標記／FPS 匯出（A 提議的三件工具）
3. 實機測試（手機觸控、PWA）＋效能優化到實機 60fps
4. 商店素材補拍（3 段錄影、logo 疊字）＋itch 上架彩排
5. 可及性收尾（色盲子彈形狀、字級全 UI）
6. 全面 QA 腳本硬化（flaky 檢查重跑機制）

## 6. 檔案擁有權

`core.js/main.js/sea.js`＝B｜`base.js/space.js/fx.js/leviathan.js/events.js`＝D｜`index.html/style.css`＝C｜`docs/design`＝A｜`docs/marketing/content/i18n`＝E｜`docs/qa`、`tools/`、`_dev`、`docs/ROADMAP/PRODUCT/TEAM/HANDOFF`＝Lead
