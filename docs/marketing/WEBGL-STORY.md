# 渲染升級對外說法（WEBGL-STORY）— v0.12 施工中

> 擁有者：E · 2026-11-05 · 依據 `docs/tech/ENGINE-DECISION.md`（使用者選 A：留 Web、升級渲染層到 WebGL2）
> **鐵律：有數據才寫數字。** 目前 D 的 POC 尚未產出（`docs/tech/WEBGL-POC-RESULTS.md` 施工中），所以本檔任何效能數字都只能寫成「門檻／目標」，不能寫成「已達到」。
> 對外狀態一律是「**進行中，尚未上線**」；Canvas2D 仍是現在的預設與 fallback。

## 1. 技術 devlog 版（給開發者／devlog #5 用，約 300 字）

> 我們把渲染層從 Canvas 2D 升級到 **WebGL2**。原因是：這款遊戲的畫面幾乎都是程序繪製——每幀的水面漸層、god rays、粒子、爆炸光暈——Canvas 2D 在滿載時會把時間花在重建漸層與逐個 draw call 上。WebGL2 讓我們把水面／光線／粒子批次交給 shader 與 GPU，並補上 Canvas 2D 很難做好的 additive 光暈與 bloom。
>
> 做法不是重寫遊戲：新增一層 `Renderer` 抽象，保留 **Canvas2D adapter 作為永遠可用的 fallback**，WebGL2 偵測不支援就自動退回；玩法、數值、存檔、QA、HUD 全部不動。遷移順序是 sea 背景 → 粒子／特效 → 實體批次 → base → launch／space／moon。
>
> 目前在做 S1：決策文件、POC、介面設計與視覺規格。**POC 的 Go/No-Go 門檻**是滿載 1280×800 下 ≥2× Canvas2D 且 ≥30fps、390×844 ≥24fps、每個場景至少 3 處可辨識差異；POC 數據出來後會補在這篇。在那之前，這個升級不算完成。

## 2. 玩家版短貼文（社群用，無數字）

> 接下來要做的不是新關卡，是換掉畫面的引擎底層。
>
> 我們把渲染層升級到 WebGL2：水面會出現真正的光斑與 caustics、體積光、爆炸的 additive 光暈與 bloom，粒子也能更多更亮。動作、玩法、存檔都不變，舊裝置會自動退回原本的 Canvas 模式。
>
> 現在還在施工中，穩定性與手機效能還沒驗完，**不會**在完成前說「已上線」。有進度會再發一篇。

## 3. Press 一句話（給媒體／store 編輯，無數字）

> *Escape the Sea* is upgrading its renderer from Canvas 2D to WebGL2 for shader-based water, volumetric light and additive bloom — gameplay and saves stay unchanged, with Canvas 2D kept as a fallback.

## 4. 商店補充文案（**v0.12 上線且 POC／實機驗收通過後才可用**）

> ⚠️ **上線前不得使用**：以下兩句會暗示已完成；在 `WEBGL-POC-RESULTS.md` 有數據、且 v0.12 真的上線前，只能放在內部草稿，不可貼 itch／Steam／社群。

**可用句 1（英文）**
> Now with a WebGL2 renderer: brighter water caustics, volumetric god rays and additive bloom on explosions — with a Canvas 2D fallback for older devices.

**可用句 2（中文）**
> 全新 WebGL2 渲染：水面光斑與水下焦散、體積光、爆炸的 additive 光暈與 bloom；舊裝置自動退回 Canvas 2D。

- 若 POC 未過門檻（依 ENGINE-DECISION §4），改成「A-light」：只說「粒子與光暈效能優化」，**不要**提 WebGL。
- 數字（fps、×倍）只有在 `WEBGL-POC-RESULTS.md` 與實機測試有紀錄時才能寫，並註明裝置與解析度。

## 5. 現在可以對外說／不能說

| 可以說 | 不能說 |
|---|---|
| 「渲染層升級 WebGL2 **進行中**」 | 「已升級完成／已上線」 |
| 「目標是更亮的水面、體積光、爆炸光暈」 | 「fps 提升 2–5 倍」（POC 未出） |
| 「Canvas2D 仍是 fallback」 | 「所有手機都支援 WebGL2」 |
| 「玩法／存檔不變」 | 「v0.12 已可玩」 |
| 「POC 門檻是 ≥2× Canvas2D、≥30fps」 | 「已達到 60fps」 |

## 6. 素材與引用

- 決策：`docs/tech/ENGINE-DECISION.md`（§4 Go/No-Go、§5 遷移順序）
- POC（施工中）：`docs/tech/webgl-poc.html`、`docs/tech/WEBGL-POC-RESULTS.md`
- 介面（施工中）：`docs/tech/WEBGL-INTEGRATION.md`；視覺（施工中）：`docs/art/WEBGL-VISUALS.md`
- 驗收定義（施工中）：`docs/design/VISUAL-UPGRADE-v0.12.md`
- 既有商店文案（**不要**先改）：`docs/marketing/ITCH-FINAL.md`、`STORE-v0.6-EN.md`
