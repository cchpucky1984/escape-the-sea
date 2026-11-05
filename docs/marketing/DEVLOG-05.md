# Devlog #5 — 換引擎底層：從 Canvas 2D 到 WebGL2（施工中）

> 2026-11-05 · v0.12 開發中 · 作者 E（企劃／行銷）
> 草稿：POC 數據尚未出來，這篇**沒有任何 fps 數字**；貼出去前把「施工中」改成當下狀態，數字以 `docs/tech/WEBGL-POC-RESULTS.md` 為準。

## 為什麼要換

不是因為 Canvas 2D 不好，而是這款遊戲的畫面幾乎都是「每幀重算」：水面漸層、god rays、粒子、爆炸光暈、雷達。v0.11 我們已經把 sea 的 headless 效能拉回 35fps 以上（`HANDOFF` 有數字），但它靠的是快取與降頻，不是換方法；再往上就會開始犧牲畫面。

使用者拍板選了「留在 Web、升級渲染層到 **WebGL2**」（`docs/tech/ENGINE-DECISION.md`）。理由很實際：不用重寫 10k 行遊戲、網頁版與 PWA 全部保留，但可以拿到 shader 水面、體積光、additive 粒子與 bloom——這些是 Canvas 2D 很難做好的。

## 具體會變什麼

- 新增一層 **`Renderer` 抽象**：`init / resize / beginFrame / drawWater / drawGodRays / drawSprite / drawParticles / post / endFrame`。
- 兩個 adapter：**Canvas2D（永遠可用的 fallback）** 與 **WebGL2（預設，偵測不支援就退回）**。
- 視覺：水面 caustics／光斑、體積光、爆炸 additive 光暈＋bloom、母船金屬反光、核心／鏡像光暈。
- 裝置分級：desktop-high／desktop-low／mobile 的效果開關；`reduce motion` 與色盲模式照樣降級。

**不會變**：玩法、數值、關卡、存檔格式、HUD 與文字（留在 DOM/CSS）、QA 的 47 項流程、現有線上版（v0.11 持續可玩）。

## POC 先過門檻，才動手遷移

S1 只做決策、POC、介面與視覺規格；POC 的 Go/No-Go 門檻（`ENGINE-DECISION` §4）：

- 滿載 1280×800：要 **≥2× Canvas2D** 且 **≥30fps**
- 390×844：**≥24fps**（可降效果）
- 每個場景至少 **3 處可辨識差異**（不是只換技術）
- WebGL2 不可用時 **100% 回退** Canvas2D

POC 由 D 產出（`docs/tech/webgl-poc.html`、`WEBGL-POC-RESULTS.md`）；沒過門檻就停在「A-light」——只做粒子／光暈批次優化，不改渲染層。這是我們先寫下來的退路，不是事後找藉口。

## 下一步（S1 → S6）

1. **S1（現在）**：POC 數據、`Renderer` 介面（B）、視覺規格（C）、驗收看板（A）。
2. **S2**：`Renderer` 抽象＋Canvas2D adapter，sea 背景先用 WebGL；要有可回退旗標（`__RENDER`）。
3. **S3**：粒子／特效／實體批次＋bloom。
4. **S4**：launch／space／moon 遷移，母船反光與核心 bloom。
5. **S5**：手機／低階機分級、context lost 復原、可及性降級。
6. **S6**：回歸 QA、視覺驗收、beta 與商店素材重拍。

**時程影響**：beta 約延後 2 週（原 v0.12 內容改到 v0.13）。不影響現有線上版；也不會為了趕時間先上一個不穩的渲染層。

## 風險（先講）

- **行動 GPU**：WebGL2 支援度與效能差異大；沒測過 iOS/Android 之前，不能說「手機也變順」。
- **Context loss**：背景切換／GPU reset 要能復原，否則玩家會白屏；要有自動 fallback。
- **只換技術不換觀感**：這是最大風險。所以驗收看板要求「每場景 3 處可辨識差異」，不是換了 shader 就交差。
- **量測失真**：headless 軟體渲染的 fps 不能直接當玩家數據；POC 與實機都要同機同腳本 A/B。
- **範圍膨脹**：只做 S1–S3 才動主程式；S4–S5 可與 beta 並行，不新增玩法。

## 現在的狀態

- 決策文件：`docs/tech/ENGINE-DECISION.md`
- POC／介面／視覺／驗收：D、B、C、A 各自施工中（本檔不重複貼未定稿內容）
- 對外說法：`docs/marketing/WEBGL-STORY.md`（有「現在可以說／不能說」表）

下一篇會補 POC 數據與第一張同幀對比截圖；在那之前，這個升級**不算完成**。
