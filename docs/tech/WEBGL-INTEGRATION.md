# 逃出大海 · WebGL 渲染層整合設計（v0.12）

> 目的：以**最小風險**把 sea 背景與粒子逐步換到 WebGL2，同時保證 Canvas2D 永遠可用、HUD／文字／DOM 不動、PWA 無建置流程也能運作。
> 範圍：`docs/tech/` 設計＋`js/main.js` 的最小 Renderer spike；本輪**不**實作 WebGL 繪製、不改玩法。
> 前置：`docs/HANDOFF.md`、`docs/tech/AUDIT-v0.4.md`、`tools/qa.mjs`（47 項）。

## 0. 結論（先看這段）

- **建議自寫輕量 WebGL2 adapter**，不引入 PixiJS。原因：本專案是程序繪製（gradient／path／canvas 文字）、沒有 bundler、repo 9.7MB、PWA 需可離線；PixiJS 約 450KB 且需要額外建置／資產管線，換來的 sprite 管線本專案用不到。
- **Canvas2D 是永久 fallback**：`window.__RENDER='canvas'`（預設）；`'webgl'` 只是一個可回退的實驗旗標。
- 第一階段只遷移**背景水面＋god rays＋caustics**（目前最大 canvas 呼叫來源）；粒子、實體、base、space、moon 依序，每一步都要有截圖對比與 FPS 證據。
- HUD／任務／toast／boss UI 全部留在 DOM；renderer **不碰文字與 DOM**。
- D 的 `docs/tech/webgl-poc.html` 是 shader／效果 POC，本文件定義的介面必須能包住它；POC 的 render loop 不可直接接管主迴圈。

## 0.5 v0.12 範圍：合成層優先（本輪共識）

- 使用者要的是「快、穩、看得出變好」：**本輪只做 WebGL2 合成層**（現有 Canvas2D 場景 → texture → GL post／bloom／caustics），**不做** 1,100–1,500 行的完整 Renderer／實體 adapter 遷移；完整遷移排 v1.1。
- D 的 `js/gl2.js` 負責合成層；B 只保留 `main.js` 的 `Renderer` stub 作為 seam、接線與回退，不重寫既有 draw。
- 合成層需要的 hook：`beginFrame()` 後把既有 `#cv` 當 texture 上傳；`post()` 收 RTT／bloom 參數；`setQuality(tier)`（0 高／1 中／2 低）；`resize(w,h)`；`?gl=0` 強制 Canvas2D、`?gl=1` 嘗試 WebGL2（不支援自動 canvas）；`__T.glEnabled()`／`__T.glStats()` 與 `window.__POC` 欄位對齊（mode/fps/ms/calls/particles/tier/results/contextLost）；context loss 由 POC 的 `onContextLost/onContextRestored` 自動切 canvas／恢復。
- 合成層**不畫 HUD／文字／DOM**；Canvas2D 場景照舊，GL 只做最後一層 post。沒有 `gl=1` 或 WebGL2 失敗時，畫面必須與今天一致。
- QA 會跑 `?gl=0` 與 `?gl=1` 兩組；`gl=1` 若 fallback，`glStats().fallback=true` 且 `mode='canvas'`。

## 1. 現況與限制

- Canvas2D 單一畫布 `#cv`；`core.js` 管 DPR／backbuffer 上限 2.6M px；`main.js` 主迴圈依場景呼叫 `drawSea/drawLaunch/drawMoon/...`。
- sea 背景目前每幀：water gradient（已由 `fxLin` 快取）、god rays、caustics（v0.11 已 offscreen 快取每 2 幀）、vignette（`fxRad` 快取）、radar（逐幀）。
- 繪製是**程序式**：`ctx.arc`、`ctx.ellipse`、漸層、`fillText`、`globalCompositeOperation='lighter'`；沒有 sprite atlas、沒有 texture pipeline。
- 無 npm／bundler；檔案直接 `<script>` 載入；PWA service worker cache-first；repo 9.7MB（含音檔／圖）。
- 既有 A/B 旗標：`window.__PERF_LEGACY`（sea 背景快取）；本輪新增 `window.__RENDER`，兩者不互相覆蓋。

## 2. Renderer 抽象介面（兩個 adapter 的契約）

```text
Renderer.init({ canvas, width, height, dpr, context2d? }) -> bool
Renderer.resize({ width, height, dpr }) -> void                 // POC 別名 resize(w,h) 由 adapter 轉接
Renderer.setQuality(tier /* 0=高、1=中、2=低 */) -> void     // 行動 GPU／低階機降級
Renderer.getStats() -> { fps, ms, calls, particles, tier }
Renderer.beginFrame({ scene, time, dt, camera }) -> void
Renderer.endFrame() -> void
Renderer.drawWater({ gradientKey, zoneTint }) -> void
Renderer.drawGodRays({ rays, camera, time }) -> void
Renderer.drawSprite({ kind, x, y, r, rot, alpha, color, scale }) -> void
Renderer.drawParticles({ items, max }) -> void
Renderer.post({ vignette, flash, shakePx }) -> void
Renderer.destroy() -> void
Renderer.capabilities() -> { webgl2, maxTex, tier, contextLost }
```

- 座標：`drawSprite`／`drawParticles` 收**世界座標**，adapter 自己套 camera；`drawWater`／`drawGodRays` 收螢幕空間參數。DPR 由 adapter 與 canvas 尺寸決定，呼叫端不重算。
- 混合模式：只支援 `normal`／`lighter` 兩種；其他 canvas composite 留在 Canvas2D adapter。
- 文字：**不在介面內**；HUD、傷害數字（DOM）、boss UI 維持現狀。canvas 內的少量文字（雷達標籤等）第一階段留在 Canvas2D overlay。
- 生命週期：`init` 只建資源；`beginFrame/endFrame` 不應偷偷 `clear` 或改 canvas CSS；`destroy` 必須可回到 Canvas2D。
- Adapter 邊界：
  - Canvas2D adapter：直接委派現有 draw 函式／`ctx`，行為與今天相同，是預設。
  - WebGL2 adapter：shader、VAO/VBO、texture、batcher；只負責水面／rays／particles／post，其餘仍走 Canvas2D overlay。

## 3. 相依決策：自寫 WebGL2 vs PixiJS

| 項目 | 自寫 WebGL2 | PixiJS |
|---|---|---|
| 程式碼量 | 約 800–1200 行（含 shader／batch／texture） | adapter 約 300–450 行＋Pixi 450KB |
| 建置流程 | 不需要，直接 script／內嵌 shader | 需要 bundle 或 CDN；PWA 離線要自帶檔 |
| 程序繪製契合度 | 高（自訂 shader 畫水／rays） | 中（要先把 path 轉 sprite／mesh） |
| repo 大小 | +0（自寫） | +450KB～>1MB |
| 控制／除錯 | 完全可控，符合現有 `__PERF_LEGACY` 慣例 | 黑盒較多，版本升級風險 |
| 行動 GPU／context loss | 自行處理，程式碼小 | Pixi 有處理，但仍需 fallback |
| 建議 | **採用（第一階段）** | 不採用；除非未來要做大量 sprite 動畫 |

**決策**：自寫 WebGL2，保持無建置、可離線、可逐步回退；PixiJS 只在未來需要完整 sprite/animation pipeline 時重新評估。

## 4. 遷移順序（每步都可回退）

| 階段 | 內容 | 視覺驗收 | 回退 |
|---|---|---|---|
| 1 | sea 背景：water／god rays／caustics／vignette | 與 Canvas2D 截圖 diff ≤ perceptible；FPS 不降 | `__RENDER='canvas'` |
| 2 | 粒子／floats／shield hits（批次 quad） | 粒子顏色／壽命／透明度一致 | 同上 |
| 3 | 實體：pickups／hazards／bullets／player／radar overlay | 碰撞不變（只換繪製） | 同上 |
| 4 | base／towers／BOT | 基地預覽與世界層一致 | 同上 |
| 5 | space（launch／dock／moon） | 各 scene pageErrors 0、FPS 不降 | 同上 |
| 6 | moon boss／mirror、post（bloom 可選） | 最終戰可讀性、TTK 不變 | 同上 |

每階段獨立 PR／flag；**不得**一次切換全部場景。`window.__RENDER` 只影響渲染，不影響 update／存檔／音效。

## 5. 相容、context loss、行動 GPU

- 偵測：`canvas.getContext('webgl2')` 失敗 → 保持 Canvas2D；`capabilities().tier` 依 `MAX_TEXTURE_SIZE`、`renderer` 字串、DPR 分 tier 0–2。
- `webglcontextlost`：`event.preventDefault()`、POC 自動切 Canvas2D 維持畫面、標記 `contextLost`；`webglcontextrestored` 重建 program/FBO/VAO/texture、回 WebGL、觸發 hooks；B 以 `onContextLost/onContextRestored` 同步 fallback／`__T.glStats()`。
- 背景分頁：`visibilitychange` 暫停 WebGL 更新（與音樂一致），回來重建 projection。
- 行動 GPU：tier2（低）只開 water／rays，關 bloom、粒子上限 400；tier1（中）開 particles、bloom、caustics 20；tier0（高）全開（1500 粒子＋bloom）。DPR 上限 1.5；POC `setQuality` 與此語意一致。
- Canvas2D 永遠可用：PWA 舊瀏覽器、`file://`、SW 快取舊版時都不得黑屏。

## 6. 風險與工作量（粗估）

| 工作 | 行數 | 人時 | 風險 |
|---|---:|---:|---|
| Renderer 介面＋Canvas2D adapter | 150–220 | 12–16 | 低（本 spike 已起頭） |
| WebGL2 core（context/shader/batch） | 250–350 | 24–32 | 中 |
| Water／rays shader | 120–180 | 12–16 | 中（視覺調參） |
| Particles batcher | 100–150 | 8–12 | 中 |
| Entities／base | 180–280 | 16–24 | 高（狀態多） |
| Space／moon | 150–220 | 12–20 | 中高 |
| Post／bloom（可選） | 80–120 | 8–12 | 中 |
| 測試／截圖／fallback | 100–150 | 16–20 | 中 |
| **合計** | **~1100–1500** | **~110–150h（2–4 週）** | — |

## 7. WebGL 才做得到 vs Canvas 替代

- 值得做：bloom、水面折射／熱擾動、>5k 粒子、GPU 批次 sprite。
- Canvas2D 替代：預渲染 radial sprite（光暈）、`lighter` 疊圖、固定解析度 blur 圖層、降低粒子數。
- 原則：先做「用 shader 畫水＋rays」的 ROI，不急著做 post；若 FPS 未提升，回退 Canvas 路径。

## 8. D 的 POC 對齊

- POC 是**同一頁、同一 `<canvas>`**切 Canvas2D／WebGL2 兩條路徑；context 只建一次；不碰既有 `js/`、不接管遊戲 `requestAnimationFrame`。
- 公開鉤子（可直接引用）：`window.__POC = { mode, fps, ms, calls, results, setMode('2d'|'webgl'), setRes, resize(w,h), setParticles, setQuality(0|1|2), getStats(), runOne, runAll, exportPoc, onContextLost(cb), onContextRestored(cb), contextLost, lastContextEvent, contextEvents, simulateContextLoss({restore,delayMs}), simulateContextRestore() }`；WebGL2 不可用時自動 fallback。
- 固定負載：caustics＋god rays、粒子 500／1500（additive）、100 sprites、vignette＋簡易 bloom；1280×800 與 1920×1080 各跑 5s，量 FPS／avg ms／draw calls。
- 驗收問題：①滿載（1500 粒子＋bloom）WebGL2 是否 ≥2× Canvas2D；②1920×1080 是否 ≥50fps。若 2× 不成立，文件結論改成「何時才值得換」而非硬推。
- D 的 POC hooks：`getStats()` 回 `{mode,fps,ms,calls,particles,tier,w,h,webgl2,fallback,results,contextLost,contextEvents,lastContextEvent,drawCalls,particlesActive,qualityTier}`；context-loss 實測 lost→canvas/contextLost:true、restore→webgl/recreated:true、4 次事件、`?gl=0` fallback、pageErrors 0。
- POC 同環境數據（SwiftShader）：1500 粒子 1280×800 **41.9 vs Canvas2D 17.6（2.38×）**；1920×1080 **22.8 vs 10.1（2.26×）**；draw calls 1640→7。1920 未達 50fps，屬 GPU 上限；context-loss 已實測，實機 GPU 驗證仍列 POC RESULTS 風險。
- 給 B 的整合假設：單一 canvas、context 只建一次、texture atlas 由 Canvas2D 程序產生（無外部資產）；adapter 需接住 `resize(w,h)`、`setQuality(tier)`、`getStats()`，POC 內部 canvas 不外露。
- POC 若用 WebGL1／three.js，先在 POC 內轉成 WebGL2 raw 或提供參數表，再進 adapter；不以 POC 當正式依賴。

## 9. Spike（本輪已落地，無行為改變）

`js/main.js` 新增：
- `window.__RENDER` 預設 `'canvas'`；`Renderer` stub 具備 `init/resize/beginFrame/endFrame/drawWater/drawGodRays/drawSprite/drawParticles/post/destroy`。
- `resize` listener 呼叫 `Renderer.resize()`；`Renderer.init()/resize()` 在啟動時呼叫。
- stub **不呼叫任何 draw**、不改 canvas、不影響 update／存檔／音效；`__T.Renderer`／`__T.renderMode()` 供 QA。
- QA 47 項必須維持全綠；`window.__RENDER='webgl'` 目前只切 adapter 名，不宣稱有畫面。

## 10. 待決與驗收

- 待 C 視覺規格：水色／ray 強度／post 是否首發；待 D POC 完成後對齊 shader 參數。
- 首階段驗收：sea 背景截圖 diff、QA 47/47、`__RENDER` 切回 canvas 無黑屏、FPS 不低於現有（≥35 headless）。
- 不在本輪：實際 WebGL 繪製、PixiJS、HUD 進 renderer、修改玩法數值。
