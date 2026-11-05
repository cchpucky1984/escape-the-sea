# WebGL2 vs Canvas2D — 垂直切片 POC 結果（v0.12-D1）

> 作者：D（技術美術）· 2026-11-05 · 對應 `task-51`、`docs/tech/WEBGL-INTEGRATION.md`（B 的整合設計）
> POC：`docs/tech/webgl-poc.html`（自包含、inline GLSL、file:// 可開）· 腳本：`_dev/D13/poc.mjs` · 截圖：`_shots/D13/`

## 1. 方法
- 同一頁、兩顆 `<canvas>`（`#cv2d`／`#cvgl`）切換模式；WebGL2 context 只建一次；不碰既有遊戲 js。
- 代表性海面負載（兩模式一致）：水面垂直漸層＋程序化 caustics＋god rays、additive 粒子 500／1500、100 sprites（程序繪製 atlas：木箱／魚／水母）、vignette＋簡易 bloom（WebGL 走 FBO downsample+blur；Canvas2D 用快取光暈層近似）。
- 量測：每組先暖機 320ms，再連續 rAF 5 秒；`fps = frames/秒`、`ms = 1000/fps`、`draw calls = 每幀繪圖呼叫平均`（Canvas2D 計 fill/stroke/drawImage/fillText；WebGL 計 drawArrays/drawElements/drawArraysInstanced）。
- 環境：Chrome 156 headless（`--disable-gpu`、SwiftShader 軟體渲染、1280×800 視窗）、CDP 9304；單機單腳本。**軟體渲染數字不代表實機 GPU**，只用於同環境相對比較（與 AUDIT §3、QA-BASELINE P1-2 同口徑）。
- 相容性：`file:///…/docs/tech/webgl-poc.html` 與 `http://127.0.0.1:5173/docs/tech/webgl-poc.html` 都實測可開；`?force2d=1` 模擬無 WebGL2 → 自動 fallback。

## 2. 數據（每組 5 秒，headless 軟體渲染）
| 解析度 | 粒子 | Canvas2D FPS / ms / calls | WebGL2 FPS / ms / calls | 倍率 |
|---|---|---|---|---|
| 1280×800 | 500 | 20.1 / 49.7 / 640 | **43.1 / 23.2 / 7** | **2.14×** |
| 1280×800 | 1500 | 17.6 / 56.7 / 1640 | **41.9 / 23.9 / 7** | **2.38×** |
| 1920×1080 | 500 | 10.9 / 91.4 / 640 | **23.7 / 42.2 / 7** | **2.17×** |
| 1920×1080 | 1500 | 10.1 / 98.7 / 1640 | **22.8 / 43.8 / 7** | **2.26×** |

- 滿載（1500 粒子、bloom 開啟）**WebGL2 在兩種解析度都 ≥2× Canvas2D**（2.26–2.38×）；draw calls 1640 → 7。
- 絕對值：1920×1080 滿載僅 22.8fps → 這是 SwiftShader（CPU）上限，**未能證明「1920×1080 ≥50fps」**；需實機 GPU 複測（見 §5 風險與後續）。
- 品質階層（B 的整合介面）：`setQuality(0|1|2)` → 粒子上限 1500/800/400、tier2 關閉 bloom（WebGL draw calls 7→4）；`getStats()` 實測回 `{tier:2, particles:400, w:1920, h:1080, calls:7}`；`resize(w,h)` 同步 canvas 與 FBO。
- Fallback：`?force2d=1` → `fallback:true`、`mode:'canvas'`、WebGL 按鈕 disabled，基準仍可跑（Canvas2D 640 calls）。

## 3. 視覺差異
- WebGL2：caustics 由 fragment shader 計算 → 連續、無鋸齒帶狀；god rays＋bloom 叠加自然；100 sprites 走 instanced quad＋atlas，draw call 固定。
- Canvas2D：caustics 以 30 條正弦折線近似（看得出條帶）；bloom 只是快取加色光暈層（無真實模糊）；粒子較大、較「發光球」；sprites 用 drawImage（每顆一次呼叫）。
- 兩模式在「亮部／粒子密度」上仍有差異，POC 目標是效能與可行性，不是像素級一致；正式整合需以 canvas 質感為基準調 shader 參數。

## 4. 結論
1. **值得升級 WebGL2**：滿載 ≥2× 已在軟體渲染成立，且 draw calls 從千級降到個位數；粒子／bloom 這種「貴在像素與呼叫數」的效果正是 WebGL 強項。
2. 不建議「一次全翻」：POC 證明的是背景／粒子／bloom／大量 sprite；文字、UI、既有 HUD 仍走 DOM/Canvas2D，用 renderer 抽象分層（B 的 `WEBGL-INTEGRATION.md`）。
3. 判斷門檻：以 POC 的 2× 為依據，實機 GPU 在 1920×1080 滿載應可 60fps；若實機複測 <50fps，才需要使用 `setQuality(1/2)` 或縮減 bloom 解析度，而不是回頭用 Canvas2D。
4. POC 留下的 hooks：`window.__POC = {mode, fps, ms, calls, results, setMode, setRes/resize, setParticles, setQuality, getStats, runOne, runAll, exportPoc}`，可直接給 QA／整合層使用。

## 5. 風險
- **Context loss**：POC 已提供 seam 並實測（見 §6）：`webglcontextlost` 會自動 fallback 到 Canvas2D 且畫面續跑，`webglcontextrestored` 重建 GL 資源；正式整合需沿用同一策略（含使用者存檔／狀態不受影響）。
- **行動 GPU 差異**：SwiftShader 與實機 Mali/Adreno/Apple GPU 行為差距大；需至少 2 台實機（中階 Android／iPhone）複測 1920×1080 + tier 自動降級。
- **包大小／複雜度**：POC 約 +18KB（HTML+GLSL+glue）；正式 renderer 預估 +25–40KB，無新增美術資產（atlas 仍由 canvas 程序產生）。
- **混合渲染**：WebGL canvas 與 DOM HUD 疊合、alpha/blend 狀態、DPR 縮放需整合層統一；否則容易出現模糊或雙重繪製。
- **測試成本**：headless 無 GPU 情境只能驗相對效能；CI 需保留 Canvas2D fallback 路徑，並在實機跑 FPS gate。

## 6. Context loss / restore seam（v0.12 追加，給 B 的合成層）
- API（`window.__POC`）：`onContextLost(cb)`、`onContextRestored(cb)`（回傳目前 callback 數）、`contextLost`、`lastContextEvent`、`contextEvents`、`simulateContextLoss({restore,delayMs})`、`simulateContextRestore()`。
- 行為：`webglcontextlost` → `preventDefault()`、`contextLost=true`、**自動 fallback 到 Canvas2D**（mode=canvas，畫面續跑）；`webglcontextrestored` → 重建 GL 資源（program/FBO/VAO/texture）、`contextLost=false`、回 WebGL、觸發 hooks。
- 實測（`_dev/D13/contextloss.mjs`）：手動 loss → `{contextLost:true, mode:'canvas', lastContextEvent:{kind:'lost',autoFallback:'canvas'}}`＋hook 1 次；restore → `{contextLost:false, mode:'webgl', recreated:true, calls:7}`＋hook 1 次；`restore:true` 自動路徑 → 4 次事件（lost/restored ×2）。`?gl=0`（B 的相容參數）→ `{mode:'canvas', fallback:true, glBtnDisabled:true}`；全程 pageErrors 0。
- `getStats()` 追加欄位：`contextLost/contextEvents/lastContextEvent`，並提供 `drawCalls/particlesActive/qualityTier` 別名，供 B 的 `__T.glStats()` 對接（mode/webgl2/tier/fps/ms/calls/particles/contextLost）。

## 7. 後續建議（給 Lead 排工單）
1. B 的 renderer 抽象＋context loss／resize／quality hooks（POC 已留）。
2. D 的 shader 背景（caustics/god rays）＋粒子/bloom 模組化移植；Canvas2D 保留 fallback。
3. 實機效能驗收（中階 Android／iPhone、1920×1080、tier 自動降級）；達標才切主渲染路徑。

<!-- 檔案 ≤80 行；數據以 `_shots/D13/poc.json` 為準 -->
