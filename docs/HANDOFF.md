# 交接文件（HANDOFF）— v0.8.0-alpha 狀態

> 最後更新：2026-11-05 00:40（Lead）。本檔是「下次開工第一份要讀」的文件。
> 所有工作皆為**本機 commit，未 push**。目標：打磨到商業級 v1.0（見 `docs/PRODUCT-v1.0.md`）。
> 工具已納入版控：`escape-the-sea/tools/qa.mjs`（QA 基準）、`tools/shot.mjs`（截圖）、`tools/fixtures/`（v1/v2 存檔樣本）。

## 1. 環境（重開機後要重建）

```powershell
# 靜態伺服器（repo 根目錄）
python -m http.server 5173 --bind 127.0.0.1
# headless Chrome（CDP 9222；QA 用）
Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList `
  '--headless=new','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9222',`
  "--user-data-dir=$env:TEMP\cdp-9222",'about:blank'
# QA（跑 repo 內的版本）
Set-Location 'H:\DeepSeek\PROJECT\PROGRAMM\escape-the-sea\tools'; $env:CDP_PORT='9222'; node qa.mjs
```

- ComfyUI（出圖／出音樂）：桌面版 `http://127.0.0.1:8188`；工具 `_dev/comfy/comfy.mjs`（圖）、`_dev/comfy/music.mjs`（ACE-Step）
- 團隊 5 人（pm-designer / lead-programmer / artist / tech-artist / designer-ops）idle 待命

## 2. 版本與驗收

- `v0.8.0-alpha`；**QA 43/43 PASS、pageErrors 0**（tools/qa.mjs；1280×800＋390×844、全場景、存檔 v1/v2、難度/最終戰）
- 首輪 P0 全部修完：母船可通關、存檔可靠、重試不軟鎖、深海密度、四巨獸模式、最終四合一＋鏡像 BOSS
- 效能：headless 軟體渲染 30–37fps（波動）；實機 60fps 待量

## 3. v0.6 → v0.8 已完成（摘要）

| 版本 | 內容 |
|---|---|
| v0.6 | 背景音樂（三軌）、成就 24、海域事件 8＋裂縫、設定面板、結局 key art |
| v0.7 | i18n 接線（zh/en）、教學 5 步、手機觸控、PWA 離線、升空 gate UI、EN 版面 |
| v0.8 | **難度提升**：海域密度（深海 ×2.8）、四巨獸四模式（光束/追蹤/衝撞/洋流）、快慢追蹤雷射彈；**最終戰重做**：升空滑鼠瞄準、母船波次 10→24、核心 900HP 四階段（重力→光束→導彈→衝撞）、核心死後 90s 逃生倒數＋鏡像 BOSS（與玩家同型態、技能 +1，擊敗才通關）；`#dockcue` 轉場提示、`#bossui` 雙血條 |

## 4. 已知問題／待辦

1. **A 的 §6 目標與實測不符**：核心 900HP 在 Lv4 DPS ≈21.7 下 TTK ≈41s（A 原目標 150–210s；鏡像 1125HP≈52s 符合 40–70）。下一輪要嘛把核心 HP 拉到 ~1800–3500，要嘛把目標改成「含波次/逃生/鏡像整場 4–6 分鐘」。
2. **音樂需人耳驗收**（`docs/audio/` 6 段，sea/launch/boss × a/b）；headless 無法判斷好聽與否。
3. **i18n 仍有 canvas 內文字**（海域名等）未翻；CSS pseudo 已補。
4. **手機觸控**只在 390 模擬測過，實機（iOS/Android）未測。
5. **PWA**：SW cache-first，改版要 bump `etsea-v0.8.0`，QA 會自動清 SW 快取。
6. **CHALLENGES／NG+** 資料在 `docs/design/DATA-v0.6.md` §3/§4，未實作（v0.9）。
7. **商店素材**：缺 1920 實機截圖、3 段錄影、logo 疊字。
8. **未 push**：GitHub Pages 仍是 v0.3.0。

## 5. 下一輪建議（v0.9）

1. 平衡：核心 HP/TTK 定案（A＋D），跑 `balance.mjs` 長跑驗 90–150 分鐘首輪
2. 挑戰模式 3＋NG+（資料已備）＋成就面板 BUG 收尾
3. 實機測試：iOS/Android 觸控、PWA 安裝、實機 60fps
4. 商店素材補拍（1920 截圖 5 張、3 段錄影、logo 疊字）＋itch 上架
5. beta 封測（`docs/design/BETA-PLAN.md`，8 人）＋F2 卡點標記／FPS 匯出
6. `qa.mjs` 改成 repo 內版本為唯一來源（已完成，`tools/`）

## 6. 檔案擁有權（維持不變）

`core.js/main.js/sea.js`＝B｜`base.js/space.js/fx.js/leviathan.js/events.js`＝D｜`index.html/style.css`＝C｜`docs/design`＝A｜`docs/marketing/content/i18n`＝E｜`docs/qa`、`tools/`、`_dev`、`docs/ROADMAP/PRODUCT/TEAM/HANDOFF`＝Lead
