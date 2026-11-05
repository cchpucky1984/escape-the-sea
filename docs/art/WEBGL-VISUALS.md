# v0.12 WebGL 視覺升級規格（目標與預算）

> 擁有者：C（美術／視覺規格）。本檔只定「要達到什麼」，不動程式。
> 決策背景：使用者選 A——留在 Web，渲染層升級 WebGL2；Canvas 版仍是最低階 fallback。
> 對照概念圖：`docs/art/concepts/`（8 張）；截圖驗收存 `_shots/C13/`。
> 色票／對比沿用 `STYLE-v0.4.md`、可及性沿用 `PWA-EN-v0.7.md`。

## 1. 概念圖 → WebGL 目標

| 概念圖 | 目前 Canvas | WebGL 要達到 |
|---|---|---|
| `01-nearshore.webp` | 三層水色漸層＋少量亮點 | 水面光斑（caustics）會流動、水下折射位移、暖木色受光 |
| `02-deepsea.webp` | god rays 用半透明多邊形 | 真正體積光（深度衰減＋遮擋）、水下懸浮粒子、遠近吸收 |
| `04-reactor.webp` | 圓環＋徑向漸層 | 金屬肋條有環境反光、核心 bloom、洋紅／青雙色 rim |
| `06-launch.webp` | 火焰圓形漸層＋海面倒影色塊 | additive 尾焰光暈、海面金色反射條、蒸氣粒子、平台金屬反光 |
| `03-base`／`05-leviathan`／`07-title`／`08-diver` | 2D 形狀與剪影 | 金屬／濕潤材質、生物發光、標題水面反光；作為材質參考 |

**一句話驗收**：把 Canvas 與 WebGL 同場景、同時間、同鏡頭截圖並排，**不標字也看得出水面在動、光有體積、金屬會反光、爆炸會發光**；不是只把畫布換成 WebGL。

## 2. 六個必做效果（目標值）

1. **水面 caustics／折射**：sea 場景上半部；2 octave 流動紋理，UV 速度 0.02–0.05／秒；折射只做水下 25% 畫面，RTT 取樣偏移 ±1.5px；不能整畫面扭曲 UI。
2. **體積光（god rays）**：sea／launch；螢幕空間 radial blur 4–8 taps，threshold 0.70、decay 0.93、intensity 0.30；受深度與遮擋影響，不能是一整片貼圖。
3. **水下粒子**：sea 深於 800 m 才明顯；3 層深度、additive、粒徑 1–3px；深度越深越稀疏（密度 ×0.4），與 `fx` 共用同一粒子池上限。
4. **爆炸 additive 光暈**：所有場景；只在爆炸/擊殺 0.2–0.6s 出現；光暈 sprite 加色混合、強度 1.5–1.8、衰減 2.2/s；不得讓 HUD 被洗白。
5. **母船金屬反光**：launch／moon；菲涅爾 0.25–0.85、粗糙度 cutoff 0.35；RTT 反射可在低階關閉，改用 matte＋rim 漸層。
6. **核心 bloom**：moon 核心／反應爐；threshold 0.82、taps 3–5、intensity 0.7–1.1；只作用在 3D 層，**UI 圖層必須在 bloom 之後合成**。

## 3. 效果預算（上限值；超過就降級）

| 效果 | 參數 | 1280×800 | 1920×1080 | 手機 390×844 |
|---|---|---|---|---|
| 內部 render scale | 相對 CSS 像素 | 1.0（1280×800） | 0.85（1632×918） | 0.75（293×633） |
| 水面 caustics | 解析度比例／octave／強度 | 0.50／2／0.18 | 0.50／2／0.18 | 0.35／1／0.12 |
| 水面折射 RTT | 解析度比例／偏移 | 0.60／±1.2px | 0.50／±1.5px | 0.35／±1.0px |
| God rays | 解析度／taps／threshold／decay | 0.25／6／0.70／0.93 | 0.25／8／0.70／0.93 | 0.20／4／0.72／0.90 |
| 水下粒子 | 上限／每秒生成／粒徑 | 800／140／1–3px | 1200／180／1–3px | 240／70／1–2px |
| 爆炸光暈 | 同時上限／sprite 尺寸／強度 | 48／24–160px／1.6 | 64／24–180px／1.6 | 20／20–120px／1.1 |
| 金屬反射 | RTT 比例／fresnel／rim | 0.50／0.25–0.85／0.5 | 0.50／0.25–0.85／0.5 | 關 RTT（matte＋rim 0.35） |
| 核心 bloom | 解析度／threshold／intensity／taps | 0.25／0.82／1.0／4 | 0.25／0.82／1.1／5 | 0.20／0.85／0.7／3 |
| Sprite batch | draw call／atlas | ≤45／2048² | ≤35／2048² | ≤22／1024² |
| 效果預算 | GPU ms（不含遊戲邏輯） | ≤6ms | ≤7ms | ≤9ms |
| 目標幀率 | 軟體/實機 | ≥55fps 實機 | ≥55fps 實機 | ≥30fps（低階） |

- 動態解析度：連續 3 秒低於目標 10% → render scale ×0.85；連續 5 秒回升 → +0.05（上限 1.0）。
- 任何效果超預算時，降級順序固定：粒子上限 → bloom taps → god rays taps → 折射 RTT → 水面 caustics octave。
- 不可降級：HUD／文字對比、危險提示幾何、核心血條可讀性。

## 4. 三場景「Canvas vs WebGL」驗收清單

每項需同鏡頭、同 `game.stats.time`、同解析度截圖；至少 3 處可辨識差異，否則視為「只換技術」。

### sea
- [ ] 水面有流動 caustics 光斑（不是靜態亮點），且不遮 HUD。
- [ ] 陽光光束有深度衰減與水下懸浮粒子（近海 vs 深海密度不同）。
- [ ] 水下 25% 有折射位移；木箱/塑膠受光邊緣比 Canvas 清楚。
- [ ] 對比截圖：`_shots/C13/sea-canvas.png` vs `sea-webgl.png`（1280/1920）。

### launch
- [ ] 火箭尾焰 additive 光暈＋水面金色反射條；反射會隨鏡頭/高度變化。
- [ ] 蒸氣／水花粒子受暖光影響，數量在預算內。
- [ ] 平台與火箭金屬有 fresnel/rim（不再是單純圓形漸層）。
- [ ] 對比截圖：`launch-canvas/webgl`（1280/1920）。

### moon
- [ ] 核心 bloom（洋紅→青 rim）與金屬艙壁反光，核心仍是單一視覺焦點。
- [ ] 爆炸/受擊 additive 光暈不洗掉 BOSS UI 與血條。
- [ ] 與 Canvas 相比，金屬與體積光的立體感明顯；HUD 對比不降。
- [ ] 對比截圖：`moon-canvas/webgl`（1280/1920）。

## 5. 可及性降級（升級不能傷可及性）

- **reduce motion**：caustics UV 速度 ×0（保留靜態光斑）；god rays intensity ×0.5；粒子生成 ×0.3；爆炸光暈衰減加快、螢幕閃光 ≤80ms；關閉 bloom 的 pulse。`body.reduce-motion` 與系統 `prefers-reduced-motion` 都吃。
- **colorblind／cb-safe**：所有「靠顏色」的狀態（危險、ready、核心階段）必須同時有幾何/文字標記；additive 光暈不得是唯一提示。`body.colorblind` 下 bloom/particles 仍保留亮度差，但 UI 圖層不加色。
- **text-lg**：後處理只作用 3D 層；HUD/文字在 bloom 之後合成，任何模式下正文對比 ≥4.5:1。
- **低階/降級**：手機關金屬 RTT、bloom taps 3；效果關閉時畫面仍要能辨識 hazards（不能只剩黑底）。

## 6. POC 檢視（D 的 `docs/tech/webgl-poc.html`）

**狀態：待補**（2026-11-05 尚未看到檔案）。`WEBGL-INTEGRATION.md §8` 允許 POC 是 **shader-only**：不接管 `requestAnimationFrame`、不改 `#cv` render loop；只驗證 `drawWater(params)`／`drawParticles(params)` 的 shader 與批次。D 產出後本節補實測。

POC 過關門檻（給 D 的驗收）：
- raw WebGL2 context（不用 Three.js／PixiJS）；與 Canvas2D adapter 同介面，`__RENDER='canvas'` 可切回。
- 1280×800：水面 caustics／god rays／800 additive particles＋bloom；≥55fps 實機（headless 軟體渲染另計）。
- 粒子 800 個不崩、context lost 不白屏；UI 在 bloom 之後合成，HUD 對比不降。
- 有 `Renderer.capabilities().tier` 與動態解析度 hooks；手機 390 以 tier2 跑 ≥30fps。

可留（若具備）：WebGL2 context、RTT/post 管線、instanced/additive 粒子、動態解析度、Canvas fallback 切換、GPU ms 量測。
不夠（目前預期風險）：只有清屏／shader toy；沒有把 sea/launch/moon 現有繪製資料搬進去；沒有手機上限；沒有 UI 分層；沒有 reduce motion／colorblind 開關；沒有量測。
待 POC 出現後補：實測 FPS／GPU ms、可留 shader 片段、需重寫的 draw call 清單、與 `WEBGL-INTEGRATION.md` adapter 的差異。

## 7. 不在本輪
- 不改 js/、不建 WebGL renderer；本檔只給 D/B 施工與驗收依據。
- 音樂、UI 版面、i18n 不動；WebGL 只影響 3D/背景層。
